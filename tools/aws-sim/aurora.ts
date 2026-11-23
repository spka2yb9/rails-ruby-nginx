/* Aurora MySQL（Serverless v2）のクラスター。LEVEL 14 のCASEで使う。
   aws-learning のシミュレーターは RDS の DB インスタンスしか持たないので、クラスターとそのメンバーを env.railsAurora に、
   ただのデータで持つ（シミュレーターは状態を複製したり凍結したりするので、状態は時刻から決め、読むだけの操作では書き換えない）。

     aws rds describe-db-clusters / modify-db-cluster / delete-db-cluster / restore-db-cluster-to-point-in-time
     aws rds describe-db-instances / create-db-instance / wait db-instance-available に Aurora のインスタンスを足す
     aws rds reboot-db-instance / delete-db-instance / describe-events / wait db-cluster-available

   公式ドキュメントに文言が無いエラーは「(シミュレーター)」を付けて日本語で返す。 */
import { SERVICES } from '@aws-learning/cli/aws/registry';
import { timestamp } from '@aws-learning/cli/aws/services/cloudwatch';
import { AwsError, bool, int, iso, req, str, strs, struct, type OpContext, type OperationSpec } from '@aws-learning/cli/aws/types';
import { quietly } from '@aws-learning/sim/cloudtrail';
import { emptyEnv } from '@aws-learning/sim/env';
import { randomHex, withStableIds } from '@aws-learning/sim/ids';
import { createDbSubnetGroup, endpointSuffix, latestRestorableTime } from '@aws-learning/sim/rds';
import { createSecurityGroup } from '@aws-learning/sim/sg';
import type { AwsEnv } from '@aws-learning/sim/types';
import { createSubnet, createVpc } from '@aws-learning/sim/vpc';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const DAY = 24 * 60 * MINUTE;
export const ENGINE_VERSION = '8.0.mysql_aurora.3.08.0';
/* 作成・再起動・削除にかかる時間（シミュレーターの中。待つのは実際の時間なので短くしてある） */
const CLUSTER_CREATE_MS = 12 * SECOND;
const INSTANCE_CREATE_MS = 25 * SECOND;
const REBOOT_MS = 8 * SECOND;
const DELETE_MS = 10 * SECOND;

/* Serverless v2 の max_connections は、最大 ACU から決まる（Aurora ユーザーガイドの表。最小 ACU や今の ACU には関係しない）。
   値はインスタンスが起動したときに決まるので、最大 ACU を変えたら、インスタンスを再起動するまで前の値のまま */
const MAX_CONNECTIONS: [number, number][] = [[1, 90], [4, 135], [8, 1000], [16, 2000], [32, 3000], [64, 4000], [128, 5000], [192, 6000]];
// ponytail: 表に無い最大 ACU（2 や 6 など）は、それ以下でいちばん近い行の値にしている。CASEで使うのは表にある値だけ
export const maxConnectionsFor = (maxAcu: number) => MAX_CONNECTIONS.filter(([acu]) => acu <= maxAcu).pop()?.[1] ?? 90;

export interface AuroraInstance {
  id: string;
  az: string;
  createdAt: number;
  readyAt: number;
  rebootUntil?: number;
  deleteAt?: number;
  /** 起動したときに決まった max_connections */
  maxConnections: number;
}
export interface AuroraCluster {
  id: string;
  resourceId: string;
  createdAt: number;
  readyAt: number;
  deleteAt?: number;
  minAcu: number;
  maxAcu: number;
  writer?: string;
  members: AuroraInstance[];
  subnetGroup: string;
  securityGroups: string[];
  databaseName: string;
  masterUsername: string;
  backupRetentionPeriod: number;
  deletionProtection: boolean;
  restoredFrom?: { source: string; time: number };
}
export interface AuroraEvent {
  at: number;
  sourceType: 'db-cluster' | 'db-instance';
  id: string;
  message: string;
  categories: string[];
}
export interface AuroraState {
  clusters: AuroraCluster[];
  events: AuroraEvent[];
}

const EMPTY: AuroraState = { clusters: [], events: [] };
/** 読むだけのとき */
export const auroraOf = (env: AwsEnv): AuroraState => ((env as unknown as { railsAurora?: AuroraState }).railsAurora ?? EMPTY);
/** 書き換えるとき（環境を作るときと、変更の操作の中だけ） */
export function auroraFor(env: AwsEnv): AuroraState {
  const e = env as unknown as { railsAurora?: AuroraState };
  return (e.railsAurora ??= { clusters: [], events: [] });
}

const suffix = (env: AwsEnv) => `${endpointSuffix(env)}.${env.region}.rds.amazonaws.com`;
export const clusterEndpoint = (env: AwsEnv, id: string) => `${id}.cluster-${suffix(env)}`;
export const readerEndpoint = (env: AwsEnv, id: string) => `${id}.cluster-ro-${suffix(env)}`;
export const instanceEndpoint = (env: AwsEnv, id: string) => `${id}.${suffix(env)}`;

const gone = (x: { deleteAt?: number }, now: number) => x.deleteAt !== undefined && now >= x.deleteAt + DELETE_MS;
export const liveClusters = (env: AwsEnv, now: number) => auroraOf(env).clusters.filter((c) => !gone(c, now));
const liveMembers = (c: AuroraCluster, now: number) => c.members.filter((m) => !gone(m, now));

export function clusterStatus(c: AuroraCluster, now: number): string {
  if (c.deleteAt !== undefined) return 'deleting';
  return now < c.readyAt ? 'creating' : 'available';
}
export function instanceStatus(m: AuroraInstance, now: number): string {
  if (m.deleteAt !== undefined) return 'deleting';
  if (now < m.readyAt) return 'creating';
  return m.rebootUntil !== undefined && now < m.rebootUntil ? 'rebooting' : 'available';
}

/** mysql -h <ホスト名> がつながる先。クラスターのエンドポイントは writer、読み取り用は reader（無ければ writer）、インスタンスのエンドポイントはそのインスタンス */
export function resolveHost(env: AwsEnv, host: string, now: number): { cluster: AuroraCluster; instance?: AuroraInstance; status: string } | null {
  for (const c of liveClusters(env, now)) {
    const members = liveMembers(c, now);
    const writer = members.find((m) => m.id === c.writer);
    let instance: AuroraInstance | undefined;
    if (host === clusterEndpoint(env, c.id)) instance = writer;
    else if (host === readerEndpoint(env, c.id)) instance = members.find((m) => m.id !== c.writer && instanceStatus(m, now) === 'available') ?? writer;
    else instance = members.find((m) => host === instanceEndpoint(env, m.id));
    if (instance || host === clusterEndpoint(env, c.id) || host === readerEndpoint(env, c.id)) {
      const status = clusterStatus(c, now) !== 'available' ? clusterStatus(c, now) : instance ? instanceStatus(instance, now) : 'no-instance';
      return { cluster: c, instance, status };
    }
  }
  return null;
}

const earliestRestorable = (c: AuroraCluster, now: number) => Math.max(c.createdAt, now - c.backupRetentionPeriod * DAY);

function clusterOut(env: AwsEnv, c: AuroraCluster, now: number) {
  const status = clusterStatus(c, now);
  return {
    AllocatedStorage: 1,
    BackupRetentionPeriod: c.backupRetentionPeriod,
    DatabaseName: c.databaseName,
    DBClusterIdentifier: c.id,
    DBClusterParameterGroup: 'default.aurora-mysql8.0',
    DBSubnetGroup: c.subnetGroup,
    Status: status,
    ...(status === 'available' ? { EarliestRestorableTime: iso(earliestRestorable(c, now)), LatestRestorableTime: iso(latestRestorableTime(now)) } : {}),
    Endpoint: clusterEndpoint(env, c.id),
    ReaderEndpoint: readerEndpoint(env, c.id),
    MultiAZ: liveMembers(c, now).length > 1,
    Engine: 'aurora-mysql',
    EngineVersion: ENGINE_VERSION,
    Port: 3306,
    MasterUsername: c.masterUsername,
    DBClusterMembers: liveMembers(c, now).map((m) => ({ DBInstanceIdentifier: m.id, IsClusterWriter: m.id === c.writer, DBClusterParameterGroupStatus: 'in-sync', PromotionTier: 1 })),
    VpcSecurityGroups: c.securityGroups.map((g) => ({ VpcSecurityGroupId: g, Status: 'active' })),
    StorageEncrypted: true,
    DbClusterResourceId: c.resourceId,
    DBClusterArn: `arn:aws:rds:${env.region}:${env.accountId}:cluster:${c.id}`,
    ClusterCreateTime: iso(c.createdAt),
    EngineMode: 'provisioned',
    DeletionProtection: c.deletionProtection,
    ServerlessV2ScalingConfiguration: { MinCapacity: c.minAcu, MaxCapacity: c.maxAcu },
  };
}

function instanceOut(env: AwsEnv, c: AuroraCluster, m: AuroraInstance, now: number) {
  const status = instanceStatus(m, now);
  return {
    DBInstanceIdentifier: m.id,
    DBInstanceClass: 'db.serverless',
    Engine: 'aurora-mysql',
    DBInstanceStatus: status,
    ...(status === 'creating' ? {} : { Endpoint: { Address: instanceEndpoint(env, m.id), Port: 3306 } }),
    InstanceCreateTime: iso(m.createdAt),
    AvailabilityZone: m.az,
    DBSubnetGroup: { DBSubnetGroupName: c.subnetGroup },
    VpcSecurityGroups: c.securityGroups.map((g) => ({ VpcSecurityGroupId: g, Status: 'active' })),
    EngineVersion: ENGINE_VERSION,
    PubliclyAccessible: false,
    StorageType: 'aurora',
    DBClusterIdentifier: c.id,
    PromotionTier: 1,
    DBInstanceArn: `arn:aws:rds:${env.region}:${env.accountId}:db:${m.id}`,
  };
}

function findCluster(env: AwsEnv, id: string, now: number): AuroraCluster {
  const c = liveClusters(env, now).find((x) => x.id === id || `arn:aws:rds:${env.region}:${env.accountId}:cluster:${x.id}` === id);
  if (!c) throw new AwsError('DBClusterNotFoundFault', `DBCluster ${id} not found.`);
  return c;
}
function findInstance(env: AwsEnv, id: string, now: number): { cluster: AuroraCluster; instance: AuroraInstance } | undefined {
  for (const c of liveClusters(env, now)) {
    const m = liveMembers(c, now).find((x) => x.id === id);
    if (m) return { cluster: c, instance: m };
  }
  return undefined;
}

/** Serverless v2 の容量の範囲（MinCapacity=0.5,MaxCapacity=8） */
function scaling(ctx: OpContext): { min: number; max: number } | undefined {
  const s = struct(ctx, 'serverless-v2-scaling-configuration');
  if (!s) return undefined;
  const min = Number(s.MinCapacity);
  const max = Number(s.MaxCapacity);
  const ok = (v: number) => Number.isFinite(v) && v * 2 === Math.round(v * 2);
  if (!ok(min) || !ok(max) || min < 0 || max < 1 || max > 256 || min > max)
    throw new AwsError('InvalidParameterValue', '(シミュレーター) MinCapacity は 0〜256、MaxCapacity は 1〜256 で、0.5 刻み、MinCapacity ≦ MaxCapacity にしてください');
  return { min, max };
}

const rds = SERVICES.get('rds')!;
const set = (spec: OperationSpec) => rds.ops.set(spec.name, spec);
const clusterId = { name: 'db-cluster-identifier', type: 'string' as const, required: true, desc: 'DB クラスターの識別子' };
const instanceId = { name: 'db-instance-identifier', type: 'string' as const, required: true, desc: 'DB インスタンスの識別子' };

/* ---------------- クラスター ---------------- */

set({
  name: 'describe-db-clusters',
  api: 'DescribeDBClusters',
  desc: 'DB クラスター（Aurora）の一覧。エンドポイント、writer と reader、容量の範囲、復元できる時刻の範囲',
  params: [{ name: 'db-cluster-identifier', type: 'string', desc: 'DB クラスターの識別子で絞る' }],
  readOnly: true,
  examples: ["aws rds describe-db-clusters --db-cluster-identifier myapp-prod --query 'DBClusters[0].DBClusterMembers'"],
  run(ctx) {
    const id = str(ctx, 'db-cluster-identifier');
    const list = id ? [findCluster(ctx.env, id, ctx.now)] : liveClusters(ctx.env, ctx.now);
    return { DBClusters: list.map((c) => clusterOut(ctx.env, c, ctx.now)) };
  },
});

set({
  name: 'modify-db-cluster',
  api: 'ModifyDBCluster',
  desc: 'DB クラスターの設定を変える（Serverless v2 の容量の範囲、セキュリティグループ、削除保護）',
  params: [
    clusterId,
    { name: 'serverless-v2-scaling-configuration', type: 'structure', desc: 'MinCapacity=0.5,MaxCapacity=8（ACU）' },
    { name: 'vpc-security-group-ids', type: 'list', desc: 'セキュリティグループ ID（置き換える）' },
    { name: 'deletion-protection', type: 'boolean', desc: '削除保護（--no-deletion-protection で外す）' },
    { name: 'apply-immediately', type: 'boolean', desc: 'すぐに適用する' },
  ],
  examples: ['aws rds modify-db-cluster --db-cluster-identifier myapp-prod --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=8'],
  run(ctx) {
    const c = findCluster(ctx.env, req(ctx, 'db-cluster-identifier'), ctx.now);
    const s = scaling(ctx);
    if (s) { c.minAcu = s.min; c.maxAcu = s.max; }
    const sgs = strs(ctx, 'vpc-security-group-ids');
    for (const g of sgs) if (!ctx.env.securityGroups.some((x) => x.groupId === g)) throw new AwsError('InvalidParameterValue', `(シミュレーター) セキュリティグループ ${g} がありません`);
    if (sgs.length) c.securityGroups = sgs;
    const dp = bool(ctx, 'deletion-protection');
    if (dp !== undefined) c.deletionProtection = dp;
    return { DBCluster: clusterOut(ctx.env, c, ctx.now) };
  },
});

set({
  name: 'restore-db-cluster-to-point-in-time',
  api: 'RestoreDBClusterToPointInTime',
  desc: 'DB クラスターを、指定した時刻の状態で新しいクラスターとして作る（インスタンスは作られないので、あとで create-db-instance で足す）',
  params: [
    { name: 'source-db-cluster-identifier', type: 'string', required: true, desc: '元のクラスター' },
    { name: 'db-cluster-identifier', type: 'string', required: true, desc: '新しく作るクラスターの識別子' },
    { name: 'restore-to-time', type: 'timestamp', desc: '戻したい時刻（UTC。2026-11-20T01:41:00Z）' },
    { name: 'use-latest-restorable-time', type: 'boolean', desc: '復元できるいちばん新しい時刻にする' },
    { name: 'restore-type', type: 'string', desc: 'full-copy（既定）/ copy-on-write' },
    { name: 'db-subnet-group-name', type: 'string', desc: 'DB サブネットグループ' },
    { name: 'vpc-security-group-ids', type: 'list', desc: 'セキュリティグループ ID（省くと VPC の default）' },
    { name: 'serverless-v2-scaling-configuration', type: 'structure', desc: 'MinCapacity=0.5,MaxCapacity=8（省くと元のクラスターと同じ）' },
    { name: 'deletion-protection', type: 'boolean', desc: '削除保護' },
  ],
  examples: ['aws rds restore-db-cluster-to-point-in-time --source-db-cluster-identifier myapp-prod --db-cluster-identifier myapp-restore --restore-to-time 2026-11-20T01:41:00Z --vpc-security-group-ids sg-...'],
  run(ctx) {
    const now = ctx.now;
    const src = findCluster(ctx.env, req(ctx, 'source-db-cluster-identifier'), now);
    const id = req(ctx, 'db-cluster-identifier');
    if (liveClusters(ctx.env, now).some((c) => c.id === id)) throw new AwsError('DBClusterAlreadyExistsFault', 'DB Cluster already exists');
    const at = timestamp(ctx, 'restore-to-time');
    const latest = bool(ctx, 'use-latest-restorable-time');
    if ((at === undefined) === !latest) throw new AwsError('InvalidParameterCombination', '(シミュレーター) --restore-to-time と --use-latest-restorable-time のどちらか一方だけを指定してください');
    const time = at ?? latestRestorableTime(now);
    if (time < earliestRestorable(src, now) || time > latestRestorableTime(now))
      throw new AwsError('InvalidRestoreFault', `(シミュレーター) 復元できるのは ${iso(earliestRestorable(src, now))} から ${iso(latestRestorableTime(now))} まで（UTC）です。指定した時刻: ${iso(time)}`);
    const subnetGroup = str(ctx, 'db-subnet-group-name') ?? src.subnetGroup;
    if (!ctx.env.dbSubnetGroups.some((g) => g.dbSubnetGroupName === subnetGroup)) throw new AwsError('DBSubnetGroupNotFoundFault', `DB subnet group '${subnetGroup}' does not exist.`);
    /* セキュリティグループを省くと、元のクラスターと同じではなく VPC の default が付く（ほかの設定は元と同じ） */
    const vpcId = ctx.env.dbSubnetGroups.find((g) => g.dbSubnetGroupName === subnetGroup)!.vpcId;
    const sgs = strs(ctx, 'vpc-security-group-ids');
    for (const g of sgs) if (!ctx.env.securityGroups.some((x) => x.groupId === g)) throw new AwsError('InvalidParameterValue', `(シミュレーター) セキュリティグループ ${g} がありません`);
    const s = scaling(ctx);
    const c: AuroraCluster = {
      id,
      resourceId: `cluster-${randomHex(26).toUpperCase()}`,
      createdAt: now,
      readyAt: now + CLUSTER_CREATE_MS,
      minAcu: s?.min ?? src.minAcu,
      maxAcu: s?.max ?? src.maxAcu,
      members: [],
      subnetGroup,
      securityGroups: sgs.length ? sgs : ctx.env.securityGroups.filter((g) => g.vpcId === vpcId && g.groupName === 'default').map((g) => g.groupId),
      databaseName: src.databaseName,
      masterUsername: src.masterUsername,
      backupRetentionPeriod: src.backupRetentionPeriod,
      deletionProtection: !!bool(ctx, 'deletion-protection'),
      restoredFrom: { source: src.id, time },
    };
    auroraFor(ctx.env).clusters.push(c);
    return { DBCluster: clusterOut(ctx.env, c, now) };
  },
});

set({
  name: 'delete-db-cluster',
  api: 'DeleteDBCluster',
  desc: 'DB クラスターを削除する（先にインスタンスをすべて削除しておく）',
  params: [
    clusterId,
    { name: 'skip-final-snapshot', type: 'boolean', desc: '最後のスナップショットを作らない' },
    { name: 'final-db-snapshot-identifier', type: 'string', desc: '最後に作るスナップショットの名前' },
  ],
  examples: ['aws rds delete-db-cluster --db-cluster-identifier myapp-restore --skip-final-snapshot'],
  run(ctx) {
    const now = ctx.now;
    const c = findCluster(ctx.env, req(ctx, 'db-cluster-identifier'), now);
    if (c.deletionProtection) throw new AwsError('InvalidParameterCombination', '(シミュレーター) 削除保護が有効です。modify-db-cluster --no-deletion-protection で外してから削除してください');
    if (c.members.some((m) => m.deleteAt === undefined))
      throw new AwsError('InvalidDBClusterStateFault', '(シミュレーター) 削除中でないインスタンスが残っているクラスターは削除できません。先に delete-db-instance でインスタンスを削除してください');
    const skip = !!bool(ctx, 'skip-final-snapshot');
    const final = str(ctx, 'final-db-snapshot-identifier');
    if (skip === !!final) throw new AwsError('InvalidParameterCombination', '(シミュレーター) --skip-final-snapshot か --final-db-snapshot-identifier のどちらか一方を指定してください');
    c.deleteAt = now;
    return { DBCluster: clusterOut(ctx.env, c, now) };
  },
});

set({
  name: 'wait db-cluster-available',
  api: 'DBClusterAvailable',
  desc: 'DB クラスターが available になるまで待つ',
  params: [clusterId],
  readOnly: true,
  waiter: { delayMs: 2000, maxAttempts: 60, until: (ctx) => clusterStatus(findCluster(ctx.env, req(ctx, 'db-cluster-identifier'), ctx.now), ctx.now) === 'available' },
  run: () => undefined,
});

/* ---------------- インスタンス（aws-learning の RDS の操作に、Aurora のインスタンスを足す） ---------------- */

const describeDb = rds.ops.get('describe-db-instances')!;
set({
  ...describeDb,
  run(ctx) {
    const id = str(ctx, 'db-instance-identifier');
    const mine = liveClusters(ctx.env, ctx.now).flatMap((c) => liveMembers(c, ctx.now).map((m) => instanceOut(ctx.env, c, m, ctx.now)));
    if (id) {
      const hit = mine.find((m) => m.DBInstanceIdentifier === id);
      if (hit) return { DBInstances: [hit] };
      return describeDb.run(ctx);
    }
    const res = describeDb.run(ctx) as { DBInstances: unknown[] };
    return { DBInstances: [...res.DBInstances, ...mine] };
  },
});

const createDb = rds.ops.get('create-db-instance')!;
set({
  ...createDb,
  desc: createDb.desc + '（--db-cluster-identifier を付けると、Aurora のクラスターにインスタンスを足す）',
  params: [...createDb.params, { name: 'db-cluster-identifier', type: 'string', desc: 'Aurora: インスタンスを足すクラスター（--engine aurora-mysql --db-instance-class db.serverless）' }],
  run(ctx) {
    const cid = str(ctx, 'db-cluster-identifier');
    if (!cid) return createDb.run(ctx);
    const now = ctx.now;
    const c = findCluster(ctx.env, cid, now);
    if (str(ctx, 'engine') !== 'aurora-mysql') throw new AwsError('InvalidParameterCombination', '(シミュレーター) Aurora MySQL のクラスターに足すときは --engine aurora-mysql にしてください');
    if (str(ctx, 'db-instance-class') !== 'db.serverless') throw new AwsError('InvalidParameterValue', '(シミュレーター) このCASEのクラスターは Serverless v2 です。--db-instance-class db.serverless にしてください');
    const id = req(ctx, 'db-instance-identifier');
    if (findInstance(ctx.env, id, now) || ctx.env.dbInstances.some((d) => d.dbInstanceIdentifier === id)) throw new AwsError('DBInstanceAlreadyExists', 'DB instance already exists');
    const m: AuroraInstance = { id, az: `${ctx.env.region}${'acd'[c.members.length % 3]}`, createdAt: now, readyAt: Math.max(now, c.readyAt) + INSTANCE_CREATE_MS, maxConnections: maxConnectionsFor(c.maxAcu) };
    c.members.push(m);
    if (!c.writer || !c.members.some((x) => x.id === c.writer && x.deleteAt === undefined)) c.writer = id;
    return { DBInstance: instanceOut(ctx.env, c, m, now) };
  },
});

const waitDb = rds.ops.get('wait db-instance-available')!;
set({
  ...waitDb,
  waiter: {
    delayMs: 2000,
    maxAttempts: 60,
    until(ctx) {
      const hit = findInstance(ctx.env, req(ctx, 'db-instance-identifier'), ctx.now);
      return hit ? instanceStatus(hit.instance, ctx.now) === 'available' : waitDb.waiter!.until(ctx);
    },
  },
});

set({
  name: 'reboot-db-instance',
  api: 'RebootDBInstance',
  desc: 'DB インスタンスを再起動する（その間、そのインスタンスへの接続は切れる）',
  params: [instanceId],
  examples: ['aws rds reboot-db-instance --db-instance-identifier myapp-prod-instance-2'],
  run(ctx) {
    const hit = findInstance(ctx.env, req(ctx, 'db-instance-identifier'), ctx.now);
    if (!hit) throw new AwsError('DBInstanceNotFound', `DBInstance ${str(ctx, 'db-instance-identifier')} not found.`);
    if (instanceStatus(hit.instance, ctx.now) !== 'available')
      throw new AwsError('InvalidDBInstanceState', `(シミュレーター) ${hit.instance.id} は ${instanceStatus(hit.instance, ctx.now)} です。available になってから再起動してください`);
    /* 起動し直すときに、今の最大 ACU から max_connections が決まり直す。writer を再起動しても reader は再起動しない（Aurora MySQL 2.10 以降） */
    hit.instance.rebootUntil = ctx.now + REBOOT_MS;
    hit.instance.maxConnections = maxConnectionsFor(hit.cluster.maxAcu);
    return { DBInstance: instanceOut(ctx.env, hit.cluster, hit.instance, ctx.now) };
  },
});

set({
  name: 'delete-db-instance',
  api: 'DeleteDBInstance',
  desc: 'DB インスタンスを削除する（Aurora のインスタンス）',
  params: [instanceId, { name: 'skip-final-snapshot', type: 'boolean', desc: '（Aurora のインスタンスでは使わない）' }],
  examples: ['aws rds delete-db-instance --db-instance-identifier myapp-restore-instance-1'],
  run(ctx) {
    const hit = findInstance(ctx.env, req(ctx, 'db-instance-identifier'), ctx.now);
    if (!hit) throw new AwsError('DBInstanceNotFound', `DBInstance ${str(ctx, 'db-instance-identifier')} not found.`);
    hit.instance.deleteAt = ctx.now;
    return { DBInstance: instanceOut(ctx.env, hit.cluster, hit.instance, ctx.now) };
  },
});

/* ---------------- イベント ---------------- */

set({
  name: 'describe-events',
  api: 'DescribeEvents',
  desc: 'RDS のイベント（フェイルオーバー、再起動など）。既定は過去60分',
  params: [
    { name: 'source-identifier', type: 'string', desc: 'クラスターやインスタンスの識別子' },
    { name: 'source-type', type: 'string', desc: 'db-cluster / db-instance など' },
    { name: 'start-time', type: 'timestamp', desc: '開始（UTC）' },
    { name: 'end-time', type: 'timestamp', desc: '終了（UTC）' },
    { name: 'duration', type: 'integer', desc: '何分前から（既定 60）' },
    { name: 'event-categories', type: 'list', desc: 'failover など' },
  ],
  readOnly: true,
  examples: ['aws rds describe-events --source-type db-cluster --source-identifier myapp-prod --duration 1440'],
  run(ctx) {
    const sid = str(ctx, 'source-identifier');
    const type = str(ctx, 'source-type');
    if (sid && !type) throw new AwsError('InvalidParameterCombination', '(シミュレーター) --source-identifier を使うときは --source-type も指定してください');
    const end = timestamp(ctx, 'end-time') ?? ctx.now;
    const start = timestamp(ctx, 'start-time') ?? end - (int(ctx, 'duration') ?? 60) * MINUTE;
    const cats = strs(ctx, 'event-categories');
    const events = auroraOf(ctx.env).events
      .filter((e) => e.at >= start && e.at <= end && e.at <= ctx.now && (!type || e.sourceType === type) && (!sid || e.id === sid) && (!cats.length || e.categories.some((x) => cats.includes(x))))
      .sort((a, b) => a.at - b.at);
    return {
      Events: events.map((e) => ({
        SourceIdentifier: e.id,
        SourceType: e.sourceType,
        Message: e.message,
        EventCategories: e.categories,
        Date: iso(e.at),
        SourceArn: `arn:aws:rds:${ctx.env.region}:${ctx.env.accountId}:${e.sourceType === 'db-cluster' ? 'cluster' : 'db'}:${e.id}`,
      })),
    };
  },
});

/* ---------------- LEVEL 14 の環境 ----------------
     EC2 の本番サーバー（myapp-web-sg。Puma と Sidekiq）→ Aurora MySQL Serverless v2 のクラスター myapp-prod
       （myapp-prod-instance-1 が writer、myapp-prod-instance-2 が reader。myapp-db-sg は myapp-web-sg と myapp-batch-sg からの 3306 だけを通す） */
export const CLUSTER = 'myapp-prod';
export interface AuroraWorldOptions {
  minAcu?: number;
  maxAcu?: number;
  /** インスタンスが起動したときの最大 ACU（max_connections はこれで決まっている）。省くと maxAcu */
  bootedWithMaxAcu?: number;
  /** インスタンスが最後に起動したのは何日前か（省くと 9） */
  bootedDaysAgo?: number;
}

export function railsOnEc2(o: AuroraWorldOptions = {}): AwsEnv {
  return withStableIds(`aurora:${JSON.stringify(o)}`, () => {
    const now = Date.now();
    const t0 = now - 400 * DAY;
    const env = emptyEnv('ap-northeast-1');
    quietly(() => {
      const vpcId = createVpc(env, { cidrBlock: '10.0.0.0/16', name: 'myapp-vpc' });
      const sub = (name: string, cidr: string, az: string) => createSubnet(env, { vpcId, cidrBlock: cidr, availabilityZone: `ap-northeast-1${az}`, name });
      sub('myapp-public-1a', '10.0.1.0/24', 'a');
      sub('myapp-public-1c', '10.0.2.0/24', 'c');
      const priv = [sub('myapp-private-1a', '10.0.11.0/24', 'a'), sub('myapp-private-1c', '10.0.12.0/24', 'c')];
      const web = createSecurityGroup(env, { groupName: 'myapp-web-sg', name: 'myapp-web-sg', description: 'Rails on EC2 (Puma and Sidekiq)', vpcId, ingress: [{ ipProtocol: 'tcp', fromPort: 80, toPort: 80, source: '10.0.0.0/16', description: 'HTTP from ALB' }] });
      const batch = createSecurityGroup(env, { groupName: 'myapp-batch-sg', name: 'myapp-batch-sg', description: 'Batch jobs on Fargate', vpcId, ingress: [] });
      const db = createSecurityGroup(env, { groupName: 'myapp-db-sg', name: 'myapp-db-sg', description: 'MySQL from the app', vpcId, ingress: [
        { ipProtocol: 'tcp', fromPort: 3306, toPort: 3306, source: web, description: 'MySQL from web' },
        { ipProtocol: 'tcp', fromPort: 3306, toPort: 3306, source: batch, description: 'MySQL from batch' },
      ] });
      createDbSubnetGroup(env, { name: 'myapp-db-subnets', description: 'Private subnets for myapp-prod', vpcId, subnetIds: priv });
      const maxAcu = o.maxAcu ?? 16;
      const booted = maxConnectionsFor(o.bootedWithMaxAcu ?? maxAcu);
      const bootAt = now - (o.bootedDaysAgo ?? 9) * DAY;
      auroraFor(env).clusters.push({
        id: CLUSTER, resourceId: `cluster-${randomHex(26).toUpperCase()}`, createdAt: t0, readyAt: t0 + CLUSTER_CREATE_MS,
        minAcu: o.minAcu ?? 0.5, maxAcu, writer: `${CLUSTER}-instance-1`,
        members: [
          { id: `${CLUSTER}-instance-1`, az: 'ap-northeast-1a', createdAt: t0, readyAt: bootAt, maxConnections: booted },
          { id: `${CLUSTER}-instance-2`, az: 'ap-northeast-1c', createdAt: t0, readyAt: bootAt, maxConnections: booted },
        ],
        subnetGroup: 'myapp-db-subnets', securityGroups: [db], databaseName: 'myapp_production', masterUsername: 'admin',
        backupRetentionPeriod: 7, deletionProtection: true,
      });
    });
    return env;
  });
}
