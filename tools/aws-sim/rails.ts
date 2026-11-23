/* 第6部の AWS のCASEで使う構成。aws-learning のシミュレーターの関数で組み立てる（sim/scenarios.ts の ecsEnv と同じ作り方）。

     インターネット → jinzai-prod-alb（public-1a / 1c）→ ターゲットグループ jinzai-prod-web-tg（ip、/up）
       → ECS サービス jinzai-prod-web（Fargate、Rails / Puma、private-1a / 1c）
     ECS サービス jinzai-prod-worker（Fargate、Sidekiq。ALB にはつながない）
     イメージ: ECR の jinzai/rails（タグは git の短い SHA）
     DB: RDS for MySQL jinzai-prod-db（マルチAZ）
     ログ: CloudWatch Logs /ecs/jinzai-prod-web と /ecs/jinzai-prod-worker（awslogs。ストリームは 接頭辞/コンテナ名/タスクID）

   CASE（public/linux/js/scenarios/*.js）は railsOnEcs() で作った環境に、ログやイベントを足して使う。 */
import { quietly } from '@aws-learning/sim/cloudtrail';
import { appendLog, createLogGroup } from '@aws-learning/sim/cloudwatch';
import { createCluster, createRepository, createService, putImage, registerTaskDefinition, updateService } from '@aws-learning/sim/containers';
import { createLoadBalancer, createTargetGroup } from '@aws-learning/sim/elb';
import { emptyEnv } from '@aws-learning/sim/env';
import { createRole } from '@aws-learning/sim/iam';
import { withStableIds } from '@aws-learning/sim/ids';
import { createDbInstance, createDbSubnetGroup } from '@aws-learning/sim/rds';
import { addDefaultVpc } from '@aws-learning/sim/scenarios';
import { createSecurityGroup } from '@aws-learning/sim/sg';
import { taskId } from '@aws-learning/sim/targets';
import { advanceTime } from '@aws-learning/sim/time';
import type { AwsEnv, ContainerDefinition, PolicyDocument } from '@aws-learning/sim/types';
import { createOneOffTask } from './hooks';
import { attachInternetGateway, createInternetGateway, createRouteTable, createSubnet, createVpc, mainRouteTable, modifySubnetAttribute, replaceRoutes, setSubnetAssociations } from '@aws-learning/sim/vpc';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const APP = 'jinzai-prod';
export const REPO = 'jinzai/rails';
export const WEB_LOG = `/ecs/${APP}-web`;
export const WORKER_LOG = `/ecs/${APP}-worker`;

/** シミュレーターのタスク定義が持たない項目。behavior 以外は describe-task-definition の出力に足す（entry.ts） */
export interface ContainerExtra {
  command?: string[];
  logConfiguration?: { logDriver: 'awslogs'; options: Record<string, string> };
  secrets?: { name: string; valueFrom: string }[];
  stopTimeout?: number;
  /** コンテナの中のアプリ（Rails / Puma / Sidekiq）のふるまい。hooks.ts が読む。出力には出さない */
  behavior?: Behavior;
}
export type RailsContainer = ContainerDefinition & { extra?: ContainerExtra };

/* ふるまいは、ただのデータで書く（シミュレーターは状態を structuredClone で複製するので、関数は置けない）。
   ログの {time} は、その行を書いた時刻（Sidekiq の行頭と同じ ISO 8601、ミリ秒まで）に置き換える */
export interface Exit {
  /** RUNNING になってから終わるまで（ミリ秒） */
  afterMs: number;
  /** コンテナの終了コード */
  code: number;
  /** 起動から終わるまでに書くログ（等間隔に並べる） */
  logs: string[];
}
export interface OneOff {
  /** DB に届いたときの結果 */
  ok: Exit;
  /** このセキュリティグループ（名前）が付いていないと DB に届かない。そのときの結果は unreachable */
  requiresSecurityGroup?: string;
  unreachable?: Exit;
}
export interface Behavior {
  /** 起動したときに書くログ */
  bootLogs?: string[];
  /** 起動して少しで終わってしまう（Rails の起動失敗など） */
  exit?: Exit;
  /** ALB のヘルスチェック（/up）に返す状態コード。省くと 200 */
  healthCode?: number;
  /** SIGTERM を受けてから終わるまで。seconds が stopTimeout を超えると SIGKILL（終了コード 137）で、done は書かれない */
  shutdown?: { seconds: number; logs: { after: number; message: string }[]; done: string[] };
  /** run-task で command を差し替えたときのふるまい。キーは command に含まれる語（db:migrate など） */
  commands?: Record<string, OneOff>;
}

const PARAM = (name: string) => `arn:aws:ssm:ap-northeast-1:123456789012:parameter/jinzai/prod/${name}`;

/* 起動したときのログ。Puma は教科書の第23章で実測した出力（Rails 8.1.4.1・Puma 8.0.2・クラスタモード）の形 */
export const PUMA_BOOT = [
  '=> Booting Puma',
  '=> Rails 8.1.4.1 application starting in production',
  '=> Run `bin/rails server --help` for more startup options',
  '[1] Puma starting in cluster mode...',
  '[1] *  Min threads: 5',
  '[1] *  Max threads: 5',
  '[1] *  Environment: production',
  '[1] *   Master PID: 1',
  '[1] *      Workers: 2',
  '[1] *     Restarts: (✔) hot (✖) phased (✖) refork',
  '[1] * Preloading application',
  '[1] * Listening on http://0.0.0.0:3000',
  '[1] Use Ctrl-C to stop',
  '[1] - Worker 0 (PID: 12) booted in 0.0s, phase: 0',
  '[1] - Worker 1 (PID: 15) booted in 0.0s, phase: 0',
];
/* Sidekiq の起動。文言は sidekiq の lib/sidekiq/cli.rb（Pretty の書式: 時刻 pid tid 重要度: 本文） */
export const SIDEKIQ_BOOT = [
  '{time} pid=1 tid=2ag INFO: Booted Rails 8.1.4.1 application in production environment',
  '{time} pid=1 tid=2ag INFO: Running in ruby 4.0.9 (2026-10-23 revision 3e93b23afc) +PRISM [x86_64-linux]',
  '{time} pid=1 tid=2ag INFO: See LICENSE and the LGPL-3.0 for licensing details.',
  '{time} pid=1 tid=2ag INFO: Upgrade to Sidekiq Pro for more features and support: https://sidekiq.org',
];

export interface RailsEcsOptions {
  /** ECR に置くイメージ。古い順。tag は git の短い SHA、hoursAgo は push した時刻（何時間前か） */
  images?: { tag: string; hoursAgo: number }[];
  /** web が動かすイメージのタグ（既定は最新） */
  webTag?: string;
  /** worker が動かすイメージのタグ（既定は webTag と同じ） */
  workerTag?: string;
  webCount?: number;
  workerCount?: number;
  /** はじめから動いているタスク定義に付けるふるまい（起動ログに足す） */
  web?: Behavior;
  worker?: Behavior;
  /** worker のコンテナの stopTimeout（省くと ECS の既定の30秒） */
  workerStopTimeout?: number;
}

const DEFAULT_IMAGES = [
  { tag: 'a1b2c3d', hoursAgo: 24 * 9 },
  { tag: '9f8e7d6', hoursAgo: 24 * 3 },
  { tag: '4c5d6e7', hoursAgo: 20 },
];

const awslogs = (group: string, prefix: string): ContainerExtra['logConfiguration'] => ({
  logDriver: 'awslogs',
  options: { 'awslogs-group': group, 'awslogs-region': 'ap-northeast-1', 'awslogs-stream-prefix': prefix },
});

export function railsOnEcs(o: RailsEcsOptions = {}): AwsEnv {
  const images = o.images ?? DEFAULT_IMAGES;
  const webTag = o.webTag ?? images[images.length - 1].tag;
  const workerTag = o.workerTag ?? webTag;
  return withStableIds(`rails:${JSON.stringify(o)}`, () => {
    const now = Date.now();
    const t0 = now - 30 * DAY;
    const env = emptyEnv('ap-northeast-1');
    quietly(() => {
      addDefaultVpc(env);
      const vpcId = createVpc(env, { cidrBlock: '10.0.0.0/16', name: `${APP}-vpc` });
      env.vpcs.find((v) => v.vpcId === vpcId)!.enableDnsHostnames = true;
      const sub = (name: string, cidr: string, az: string) => createSubnet(env, { vpcId, cidrBlock: cidr, availabilityZone: `ap-northeast-1${az}`, name });
      const pub = [sub(`${APP}-public-1a`, '10.0.1.0/24', 'a'), sub(`${APP}-public-1c`, '10.0.2.0/24', 'c')];
      const priv = [sub(`${APP}-private-1a`, '10.0.11.0/24', 'a'), sub(`${APP}-private-1c`, '10.0.12.0/24', 'c')];
      for (const id of pub) modifySubnetAttribute(env, id, { mapPublicIpOnLaunch: true });
      const rt = createRouteTable(env, { vpcId, name: `${APP}-public-rt` });
      setSubnetAssociations(env, rt, pub);
      const igw = createInternetGateway(env, { name: `${APP}-igw` });
      attachInternetGateway(env, igw, vpcId);
      replaceRoutes(env, rt, [{ destinationCidrBlock: '0.0.0.0/0', gatewayId: igw }]);
      mainRouteTable(env, vpcId).tags = [{ key: 'Name', value: `${APP}-private-rt` }];

      const albSg = createSecurityGroup(env, { groupName: `${APP}-alb-sg`, name: `${APP}-alb-sg`, description: 'HTTP and HTTPS from the internet', vpcId, ingress: [
        { ipProtocol: 'tcp', fromPort: 80, toPort: 80, source: '0.0.0.0/0', description: 'HTTP' },
        { ipProtocol: 'tcp', fromPort: 443, toPort: 443, source: '0.0.0.0/0', description: 'HTTPS' },
      ] });
      const appSg = createSecurityGroup(env, { groupName: `${APP}-app-sg`, name: `${APP}-app-sg`, description: 'Puma from the ALB', vpcId, ingress: [{ ipProtocol: 'tcp', fromPort: 3000, toPort: 3000, source: albSg, description: 'Puma from ALB' }] });
      const dbSg = createSecurityGroup(env, { groupName: `${APP}-db-sg`, name: `${APP}-db-sg`, description: 'MySQL from the app tasks', vpcId, ingress: [{ ipProtocol: 'tcp', fromPort: 3306, toPort: 3306, source: appSg, description: 'MySQL from app' }] });

      const tg = createTargetGroup(env, { name: `${APP}-web-tg`, port: 3000, vpcId, targetType: 'ip', healthCheck: { path: '/up' } });
      createLoadBalancer(env, { name: `${APP}-alb`, scheme: 'internet-facing', vpcId, subnetIds: pub, securityGroupIds: [albSg], listeners: [{ port: 80, targetGroupArn: tg }] }, t0);

      createDbSubnetGroup(env, { name: `${APP}-db-subnets`, description: `Private subnets for ${APP}-db`, vpcId, subnetIds: priv });
      createDbInstance(env, {
        identifier: `${APP}-db`, engine: 'mysql', engineVersion: '8.4.3', dbInstanceClass: 'db.m6g.large', masterUsername: 'admin', masterPassword: 'simulator-only',
        dbName: 'jinzai_production', allocatedStorage: 100, dbSubnetGroupName: `${APP}-db-subnets`, vpcSecurityGroupIds: [dbSg], publiclyAccessible: false, multiAZ: true, backupRetentionPeriod: 7,
      }, t0);
      advanceTime(env, t0 + HOUR);
      const dbHost = env.dbInstances.find((d) => d.dbInstanceIdentifier === `${APP}-db`)!.endpointAddress;

      const trust: PolicyDocument = { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { Service: 'ecs-tasks.amazonaws.com' }, Action: 'sts:AssumeRole' }] };
      createRole(env, { roleName: 'ecsTaskExecutionRole', description: 'Pull images from ECR and write logs to CloudWatch Logs', trustPolicy: trust }, t0);
      createRole(env, { roleName: `${APP}-task-role`, description: 'Permissions for the Rails app itself', trustPolicy: trust }, t0);
      const execRole = `arn:aws:iam::${env.accountId}:role/ecsTaskExecutionRole`;
      const taskRole = `arn:aws:iam::${env.accountId}:role/${APP}-task-role`;

      const uri = createRepository(env, REPO, t0);
      createCluster(env, APP, t0);
      createLogGroup(env, WEB_LOG, { kind: 'stored' }, t0);
      createLogGroup(env, WORKER_LOG, { kind: 'stored' }, t0);

      /* 秘密情報は Parameter Store に置き、タスク定義の secrets（valueFrom）で環境変数として渡す */
      const secrets = () => [
        { name: 'RAILS_MASTER_KEY', valueFrom: PARAM('RAILS_MASTER_KEY') },
        { name: 'DB_PASSWORD', valueFrom: PARAM('DB_PASSWORD') },
      ];
      const common = [
        { name: 'RAILS_ENV', value: 'production' },
        { name: 'RAILS_LOG_LEVEL', value: 'info' },
        { name: 'DB_HOST', value: dbHost },
        { name: 'REDIS_URL', value: `redis://${APP}-redis.abc123.ng.0001.apne1.cache.amazonaws.com:6379/0` },
      ];
      const web = (tag: string): RailsContainer => ({
        name: 'web', image: `${uri}:${tag}`, essential: true, portMappings: [{ containerPort: 3000, protocol: 'tcp' }],
        environment: [...common, { name: 'RAILS_MAX_THREADS', value: '5' }, { name: 'WEB_CONCURRENCY', value: '2' }],
        extra: { command: ['./bin/rails', 'server'], logConfiguration: awslogs(WEB_LOG, 'web'), secrets: secrets(), behavior: { bootLogs: PUMA_BOOT, ...o.web } },
      });
      const worker = (tag: string): RailsContainer => ({
        name: 'worker', image: `${uri}:${tag}`, essential: true, portMappings: [],
        environment: [...common, { name: 'SIDEKIQ_CONCURRENCY', value: '10' }],
        extra: { command: ['bundle', 'exec', 'sidekiq'], logConfiguration: awslogs(WORKER_LOG, 'worker'), secrets: secrets(), behavior: { bootLogs: SIDEKIQ_BOOT, ...o.worker }, ...(o.workerStopTimeout ? { stopTimeout: o.workerStopTimeout } : {}) },
      });

      /* イメージを push するたびに、タスク定義の新しいリビジョンを登録してサービスを更新してきた。
         最初のイメージで web と worker のサービスを作り（ECS へ移した日）、web は webTag まで、worker は workerTag まで更新する */
      const webUpTo = images.findIndex((i) => i.tag === webTag);
      const workerUpTo = images.findIndex((i) => i.tag === workerTag);
      const settle = (from: number) => { for (let t = from; t <= from + 5 * MINUTE; t += 5000) advanceTime(env, t); };
      images.forEach((img, i) => {
        const at = now - img.hoursAgo * HOUR;
        putImage(env, REPO, img.tag, { port: 3000, healthCheckPath: '/up', version: img.tag }, at);
        const deployAt = at + 10 * MINUTE;
        if (i <= webUpTo) {
          const td = registerTaskDefinition(env, { family: `${APP}-web`, cpu: '1024', memory: '2048', executionRoleArn: execRole, taskRoleArn: taskRole, containerDefinitions: [web(img.tag)] }, at + 5 * MINUTE);
          if (i === 0) createService(env, { cluster: APP, serviceName: `${APP}-web`, taskDefinition: td, desiredCount: o.webCount ?? 2, subnets: priv, securityGroups: [appSg], assignPublicIp: 'DISABLED', loadBalancers: [{ targetGroupArn: tg, containerName: 'web', containerPort: 3000 }], healthCheckGracePeriodSeconds: 60 }, deployAt);
          else updateService(env, APP, `${APP}-web`, { taskDefinition: td }, deployAt);
        }
        if (i <= workerUpTo) {
          const td = registerTaskDefinition(env, { family: `${APP}-worker`, cpu: '512', memory: '1024', executionRoleArn: execRole, taskRoleArn: taskRole, containerDefinitions: [worker(img.tag)] }, at + 5 * MINUTE);
          if (i === 0) createService(env, { cluster: APP, serviceName: `${APP}-worker`, taskDefinition: td, desiredCount: o.workerCount ?? 1, subnets: priv, securityGroups: [appSg], assignPublicIp: 'DISABLED', loadBalancers: [] }, deployAt);
          else updateService(env, APP, `${APP}-worker`, { taskDefinition: td }, deployAt);
        }
        settle(deployAt);
      });
    });
    advanceTime(env, Date.now());
    return env;
  });
}

/** サービスの動いているタスクの ID（ログストリーム名の末尾に入るもの） */
export function serviceTaskIds(env: AwsEnv, service: string): string[] {
  return env.ecsTasks.filter((t) => t.group === `service:${service}` && t.lastStatus === 'RUNNING').map(taskId);
}

/** awslogs が書くのと同じように、ログストリームへ1行ずつ書く。at は epoch ミリ秒 */
export function putLogs(env: AwsEnv, group: string, stream: string, events: { at: number; message: string }[]): void {
  for (const e of [...events].sort((a, b) => a.at - b.at)) appendLog(env, group, stream, [e.message], e.at);
}

/* ---------------- CASE が使う、過去の出来事を再現する関数 ---------------- */

export interface ContainerPatch {
  /** 新しいイメージのタグ。push: false なら ECR には置かない（CannotPullContainerError になる） */
  tag?: string;
  push?: boolean;
  /** secrets から外す名前（RAILS_MASTER_KEY など） */
  removeSecrets?: string[];
  stopTimeout?: number;
  /** 今のふるまいに上書きする */
  behavior?: Behavior;
}

/** サービス（web / worker）の今のタスク定義をもとに新しいリビジョンを登録し、at の時刻にサービスを更新する */
export function deploy(env: AwsEnv, service: 'web' | 'worker', patch: ContainerPatch, at: number): string {
  const td = registerRevision(env, service, patch, at - 5 * MINUTE);
  quietly(() => updateService(env, APP, `${APP}-${service}`, { taskDefinition: td }, at));
  return td;
}

/** 新しいリビジョンを登録するだけ（サービスは更新しない） */
export function registerRevision(env: AwsEnv, service: 'web' | 'worker', patch: ContainerPatch, at: number): string {
  const name = `${APP}-${service}`;
  const svc = env.ecsServices.find((s) => s.serviceName === name)!;
  const cur = env.taskDefinitions.find((d) => d.taskDefinitionArn === svc.taskDefinition)!;
  const c = structuredClone(cur.containerDefinitions[0]) as RailsContainer;
  const extra: ContainerExtra = (c.extra ??= {});
  if (patch.tag) {
    c.image = c.image.replace(/:[^:/]+$/, `:${patch.tag}`);
    const repo = env.ecrRepositories.find((r) => r.repositoryName === REPO)!;
    if (patch.push !== false && !repo.images.some((i) => i.imageTags.includes(patch.tag!)))
      putImage(env, REPO, patch.tag, { port: 3000, healthCheckPath: '/up', version: patch.tag }, at - 15 * MINUTE);
  }
  if (patch.removeSecrets) extra.secrets = (extra.secrets ?? []).filter((x) => !patch.removeSecrets!.includes(x.name));
  if (patch.stopTimeout !== undefined) extra.stopTimeout = patch.stopTimeout;
  if (patch.behavior) extra.behavior = { ...extra.behavior, ...patch.behavior };
  return registerTaskDefinition(env, { family: cur.family, cpu: cur.cpu, memory: cur.memory, executionRoleArn: cur.executionRoleArn, taskRoleArn: cur.taskRoleArn, containerDefinitions: [c] }, at);
}

/** at の時刻に run-task を実行したことにする（セキュリティグループは名前で渡す。省くと VPC の default） */
export function runOneOff(env: AwsEnv, o: { taskDefinition: string; command: string[]; securityGroups?: string[]; at: number }): string {
  const td = env.taskDefinitions.find((d) => d.taskDefinitionArn === o.taskDefinition || `${d.family}:${d.revision}` === o.taskDefinition)!;
  const svc = env.ecsServices.find((s) => s.serviceName === `${APP}-web`)!;
  const vpcId = env.subnets.find((x) => x.subnetId === svc.subnets[0])!.vpcId;
  const sgs = (o.securityGroups ?? ['default']).map((n) => env.securityGroups.find((g) => g.groupName === n && g.vpcId === vpcId)!.groupId);
  return createOneOffTask(env, { clusterName: APP, td, subnetIds: svc.subnets, securityGroupIds: sgs, command: o.command, now: o.at }).taskArn;
}

/** from から until まで、2秒ずつ時間を進める（タスクの起動・停止とフックのふるまいを、途中の時刻ごとに起こすため） */
export function advanceTo(env: AwsEnv, from: number, until = Date.now()): void {
  for (let t = from; t < until; t += 2000) advanceTime(env, t);
  advanceTime(env, until);
}
