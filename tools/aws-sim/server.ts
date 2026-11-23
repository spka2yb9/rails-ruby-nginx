/* LEVEL 15〜17 のCASEで使う、aws-learning のシミュレーターに足りない操作と、環境を組み立てる関数。
     sts get-caller-identity          本番サーバー（EC2）の上では、インスタンスプロファイルのロールとして答える
     ssm の Parameter Store           get-parameter / get-parameters / get-parameters-by-path / get-parameter-history / put-parameter
     batch                            ジョブのふるまい（メモリ不足など）を CASE が決める。submit-job --container-overrides
     cloudwatch                       CASE が作ったアラームとメトリクス（ALB）。describe-alarm-history を足す
   公式ドキュメントに文言が無いエラーは「(シミュレーター)」を付けて日本語で返す。 */
import { SERVICES } from '@aws-learning/cli/aws/registry';
import { timestamp } from '@aws-learning/cli/aws/services/cloudwatch';
import { AwsError, bool, int, iso, req, str, strs, struct, structs, type OpContext, type OperationSpec } from '@aws-learning/cli/aws/types';
import { createComputeEnvironment, createJobQueue, putRule, registerJobDefinition } from '@aws-learning/sim/batch';
import { iamUserActor, quietly, withActor } from '@aws-learning/sim/cloudtrail';
import { appendLog, createLogGroup } from '@aws-learning/sim/cloudwatch';
import { createIpSet, createWebAcl } from '@aws-learning/sim/edge';
import { createRole, putInlinePolicy } from '@aws-learning/sim/iam';
import { newUuid, randomHex } from '@aws-learning/sim/ids';
import { createBucket } from '@aws-learning/sim/s3';
import { setSecurityGroupRules, type RuleInput } from '@aws-learning/sim/sg';
import type { AwsEnv, BatchJob, JobDefinition, PolicyDocument, WafRule, WafSample } from '@aws-learning/sim/types';

const MINUTE = 60_000;
const hooks = ((globalThis as any).__awsSimHooks ??= {});
const service = (name: string) => SERVICES.get(name)!;
const set = (svc: string, spec: OperationSpec) => service(svc).ops.set(spec.name, spec);

/* ---------------- 本番サーバー（EC2）とそのロール ---------------- */

export const INSTANCE_ID = 'i-0a1b2c3d4e5f60718';
export const EC2_ROLE = 'myapp-ec2-role';
interface Instance { instanceId: string; roleName: string }
const instanceOf = (env: AwsEnv) => (env as unknown as { railsInstance?: Instance }).railsInstance;
/** 第6部の runSimAws が、本番サーバーの上で打った aws に渡す目印（インスタンスプロファイルの認証情報） */
const onServer = (ctx: OpContext) => ctx.shellEnv?.AWS_SESSION_TOKEN === 'instance-profile-session-token';

/** EC2 のロール（インスタンスプロファイル付き）と、インラインポリシー */
export function ec2Role(env: AwsEnv, policies: Record<string, PolicyDocument>): void {
  quietly(() => {
    createRole(env, { roleName: EC2_ROLE, description: 'Rails on EC2 (Puma and Sidekiq)', withInstanceProfile: true,
      trustPolicy: { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Principal: { Service: 'ec2.amazonaws.com' }, Action: 'sts:AssumeRole' }] } }, Date.now() - 400 * 24 * 60 * MINUTE);
    for (const [name, doc] of Object.entries(policies)) putInlinePolicy(env, 'role', EC2_ROLE, name, doc);
  });
  (env as unknown as { railsInstance: Instance }).railsInstance = { instanceId: INSTANCE_ID, roleName: EC2_ROLE };
}

const sts = service('sts');
const callerIdentity = sts.ops.get('get-caller-identity')!;
set('sts', {
  ...callerIdentity,
  run(ctx: OpContext) {
    const i = instanceOf(ctx.env);
    if (!onServer(ctx) || !i) return callerIdentity.run(ctx);
    const role = ctx.env.iamRoles.find((r) => r.roleName === i.roleName);
    return { UserId: `${role?.roleId ?? 'AROAEXAMPLEROLEID'}:${i.instanceId}`, Account: ctx.env.accountId, Arn: `arn:aws:sts::${ctx.env.accountId}:assumed-role/${i.roleName}/${i.instanceId}` };
  },
});

/** S3 のバケット / CloudWatch Logs のロググループ（環境を作るときだけ） */
export const bucket = (env: AwsEnv, name: string) => quietly(() => createBucket(env, { name, sseAlgorithm: 'AES256' }, Date.now() - 400 * 24 * 60 * MINUTE));
export const logGroup = (env: AwsEnv, name: string) => quietly(() => createLogGroup(env, name, { kind: 'stored' }, Date.now() - 400 * 24 * 60 * MINUTE));

/* ---------------- CloudTrail に残る、過去の変更 ---------------- */

/** `at` の時刻に、IAM ユーザー `user` がコンソールでセキュリティグループのルールを書き換えた（Revoke と Authorize が CloudTrail に残る） */
export function changeSecurityGroup(env: AwsEnv, o: { groupName: string; at: number; user: string; sourceIp: string; ingress: RuleInput[] }): void {
  const g = env.securityGroups.find((x) => x.groupName === o.groupName)!;
  withActor(iamUserActor(env, o.user, o.sourceIp), o.at, () => setSecurityGroupRules(env, g.groupId, 'ingress', o.ingress));
}
export const groupId = (env: AwsEnv, name: string) => env.securityGroups.find((x) => x.groupName === name)!.groupId;

/* ---------------- WAF ---------------- */

/** ウェブ ACL（REGIONAL）と IP セット。rules の ip-set には IP セットの名前を書く。samples は過去に見たリクエスト */
export function webAcl(env: AwsEnv, o: { name: string; ipSets: Record<string, string[]>; rules: (Omit<WafRule, 'statement'> & { statement: WafRule['statement'] | { kind: 'ip-set'; ipSet: string } })[]; samples: WafSample[] }): void {
  quietly(() => {
    const arns: Record<string, string> = {};
    for (const [name, addresses] of Object.entries(o.ipSets)) arns[name] = createIpSet(env, { name, scope: 'REGIONAL', addresses });
    const rules = o.rules.map((r) => ('ipSet' in r.statement ? { ...r, statement: { kind: 'ip-set' as const, ipSetArn: arns[r.statement.ipSet] } } : r)) as WafRule[];
    createWebAcl(env, { name: o.name, scope: 'REGIONAL', defaultAction: 'Allow', rules });
  });
  env.webAcls.find((a) => a.name === o.name)!.samples.push(...o.samples);
}

/* ---------------- Parameter Store ---------------- */

interface ParamVersion { value: string; version: number; at: number; user: string }
interface Param { name: string; type: 'String' | 'SecureString'; versions: ParamVersion[] }
const paramsOf = (env: AwsEnv): Param[] => (env as unknown as { railsParams?: Param[] }).railsParams ?? [];

/** パラメータと、その変更の履歴（古い順） */
export function parameters(env: AwsEnv, list: { name: string; type: Param['type']; versions: { value: string; at: number; user: string }[] }[]): void {
  (env as unknown as { railsParams: Param[] }).railsParams = list.map((p) => ({ name: p.name, type: p.type, versions: p.versions.map((v, i) => ({ ...v, version: i + 1 })) }));
}

const paramArn = (env: AwsEnv, name: string) => `arn:aws:ssm:${env.region}:${env.accountId}:parameter${name.startsWith('/') ? '' : '/'}${name}`;
/** --with-decryption を付けないときの SecureString の値（暗号文） */
const cipher = (p: Param, v: ParamVersion) => 'AQICAHh' + btoa(`${p.name}:${v.version}:${v.value.length}`).replace(/=+$/, '') + 'kMvQ5bVx3Fq0AAAAfjB8BgkqhkiG9w0BBwagbzBt';
function paramOut(env: AwsEnv, p: Param, v: ParamVersion, decrypt: boolean, history = false) {
  return {
    Name: p.name,
    Type: p.type,
    ...(history ? { LastModifiedDate: iso(v.at), LastModifiedUser: v.user } : {}),
    Value: p.type === 'SecureString' && !decrypt ? cipher(p, v) : v.value,
    Version: v.version,
    ...(history ? { Labels: [], Tier: 'Standard', Policies: [] } : { LastModifiedDate: iso(v.at), ARN: paramArn(env, p.name) }),
    DataType: 'text',
  };
}
function findParam(env: AwsEnv, name: string, now: number): { p: Param; v: ParamVersion } {
  const p = paramsOf(env).find((x) => x.name === name);
  const v = p?.versions.filter((x) => x.at <= now).pop();
  if (!p || !v) throw new AwsError('ParameterNotFound', `(シミュレーター) パラメータ ${name} はありません`);
  return { p, v };
}

set('ssm', {
  name: 'get-parameter',
  api: 'GetParameter',
  desc: 'Parameter Store のパラメータを1つ取り出す（SecureString は --with-decryption で復号）',
  params: [
    { name: 'name', type: 'string', required: true, desc: 'パラメータの名前（/myapp/prod/SMTP_PASSWORD）' },
    { name: 'with-decryption', type: 'boolean', desc: 'SecureString を復号して返す' },
  ],
  readOnly: true,
  examples: ["aws ssm get-parameter --name /myapp/prod/SMTP_PASSWORD --with-decryption --query 'Parameter.[Version,LastModifiedDate]'"],
  run(ctx) {
    const { p, v } = findParam(ctx.env, req(ctx, 'name'), ctx.now);
    return { Parameter: paramOut(ctx.env, p, v, !!bool(ctx, 'with-decryption')) };
  },
});

set('ssm', {
  name: 'get-parameters',
  api: 'GetParameters',
  desc: 'Parameter Store のパラメータを、名前を並べて取り出す',
  params: [
    { name: 'names', type: 'list', required: true, desc: 'パラメータの名前（最大10）' },
    { name: 'with-decryption', type: 'boolean', desc: 'SecureString を復号して返す' },
  ],
  readOnly: true,
  run(ctx) {
    const names = strs(ctx, 'names');
    const found = names.flatMap((n) => { try { return [findParam(ctx.env, n, ctx.now)]; } catch { return []; } });
    return { Parameters: found.map(({ p, v }) => paramOut(ctx.env, p, v, !!bool(ctx, 'with-decryption'))), InvalidParameters: names.filter((n) => !found.some((f) => f.p.name === n)) };
  },
});

set('ssm', {
  name: 'get-parameters-by-path',
  api: 'GetParametersByPath',
  desc: '階層（/myapp/prod）の下のパラメータをまとめて取り出す',
  params: [
    { name: 'path', type: 'string', required: true, desc: '階層（/myapp/prod）' },
    { name: 'recursive', type: 'boolean', desc: 'さらに下の階層も含める' },
    { name: 'with-decryption', type: 'boolean', desc: 'SecureString を復号して返す' },
  ],
  readOnly: true,
  examples: ["aws ssm get-parameters-by-path --path /myapp/prod --with-decryption --query 'Parameters[].[Name,Value]' --output text"],
  run(ctx) {
    const path = req(ctx, 'path').replace(/\/$/, '');
    const deep = !!bool(ctx, 'recursive');
    const hits = paramsOf(ctx.env).filter((p) => p.name.startsWith(path + '/') && (deep || !p.name.slice(path.length + 1).includes('/')));
    return { Parameters: hits.flatMap((p) => { const v = p.versions.filter((x) => x.at <= ctx.now).pop(); return v ? [paramOut(ctx.env, p, v, !!bool(ctx, 'with-decryption'))] : []; }) };
  },
});

set('ssm', {
  name: 'get-parameter-history',
  api: 'GetParameterHistory',
  desc: 'パラメータの変更の履歴（バージョンごとの値・変更した日時・変更した人）',
  params: [
    { name: 'name', type: 'string', required: true, desc: 'パラメータの名前' },
    { name: 'with-decryption', type: 'boolean', desc: 'SecureString を復号して返す' },
  ],
  readOnly: true,
  examples: ["aws ssm get-parameter-history --name /myapp/prod/SMTP_PASSWORD --query 'Parameters[].[Version,LastModifiedDate,LastModifiedUser]' --output table"],
  run(ctx) {
    const { p } = findParam(ctx.env, req(ctx, 'name'), ctx.now);
    return { Parameters: p.versions.filter((v) => v.at <= ctx.now).map((v) => paramOut(ctx.env, p, v, !!bool(ctx, 'with-decryption'), true)) };
  },
});

set('ssm', {
  name: 'put-parameter',
  api: 'PutParameter',
  desc: 'パラメータを作る・値を変える（既にあるものを変えるときは --overwrite）',
  params: [
    { name: 'name', type: 'string', required: true, desc: 'パラメータの名前' },
    { name: 'value', type: 'string', required: true, desc: '値' },
    { name: 'type', type: 'string', desc: 'String / StringList / SecureString' },
    { name: 'overwrite', type: 'boolean', desc: '既にあるパラメータの値を変える' },
  ],
  run(ctx) {
    const name = req(ctx, 'name');
    const list = (ctx.env as unknown as { railsParams?: Param[] }).railsParams ??= [];
    let p = list.find((x) => x.name === name);
    if (p && !bool(ctx, 'overwrite')) throw new AwsError('ParameterAlreadyExists', 'The parameter already exists. To overwrite this value, set the overwrite option in the request to true.');
    if (!p) list.push((p = { name, type: (str(ctx, 'type') as Param['type']) ?? 'String', versions: [] }));
    const user = onServer(ctx) && instanceOf(ctx.env) ? `arn:aws:sts::${ctx.env.accountId}:assumed-role/${EC2_ROLE}/${INSTANCE_ID}` : `arn:aws:iam::${ctx.env.accountId}:user/learner`;
    p.versions.push({ value: req(ctx, 'value'), version: p.versions.length + 1, at: ctx.now, user });
    return { Version: p.versions.length, Tier: 'Standard' };
  },
});

/* ---------------- AWS Batch ---------------- */

/** ジョブ定義のふるまい。memoryMiB 以上のメモリを使う（足りなければ OOM で 137）。progress は進み具合のログ */
interface JobBehavior { needsMiB: number; progress: string[]; done: string[] }
interface RailsJob extends BatchJob { rails?: { memory?: number; reason?: string } }
const behaviorOf = (env: AwsEnv, d: JobDefinition) => (env as unknown as { railsJobs?: Record<string, JobBehavior> }).railsJobs?.[d.jobDefinitionName];
const OOM = 'OutOfMemoryError: Container killed due to memory usage';

/** 計算環境・ジョブキュー・ジョブ定義と、それを毎晩動かす EventBridge のルール */
export function batchSetup(env: AwsEnv, o: { queue: string; definition: string; image: string; command: string[]; memory: number; behavior: JobBehavior; schedule: string; rule: string }): string {
  return quietly(() => {
    /* railsOnEc2 のプライベートサブネットと myapp-batch-sg で動かす */
    const subnets = env.subnets.filter((x) => x.tags?.some((t) => t.key === 'Name' && /private/.test(t.value))).map((x) => x.subnetId);
    const ce = createComputeEnvironment(env, { name: `${o.queue}-fargate`, maxvCpus: 16, subnets, securityGroupIds: [groupId(env, 'myapp-batch-sg')] });
    createJobQueue(env, { name: o.queue, priority: 1, computeEnvironment: ce });
    const arn = registerJobDefinition(env, { jobDefinitionName: o.definition, image: o.image, vcpus: '1', memory: String(o.memory), command: o.command, behavior: 'daily-report' });
    ((env as unknown as { railsJobs?: Record<string, JobBehavior> }).railsJobs ??= {})[o.definition] = o.behavior;
    putRule(env, { name: o.rule, scheduleExpression: o.schedule, target: { jobQueue: o.queue, jobDefinition: o.definition, jobName: o.definition } });
    return arn;
  });
}

/** 過去に動いたジョブ（終わったもの）。ログは /aws/batch/job に書く */
export function pastJob(env: AwsEnv, o: { queue: string; definition: string; name: string; startedAt: number; stoppedAt: number; exitCode: number; reason?: string; logs: { at: number; message: string }[] }): string {
  const q = env.jobQueues.find((x) => x.jobQueueName === o.queue)!;
  const d = env.jobDefinitions.filter((x) => x.jobDefinitionName === o.definition).sort((a, b) => b.revision - a.revision)[0];
  const jobId = newUuid();
  const stream = `${o.definition}/default/${randomHex(32)}`;
  const job: RailsJob = {
    jobId, jobName: o.name, jobArn: `arn:aws:batch:${env.region}:${env.accountId}:job/${jobId}`, jobQueue: q.jobQueueArn, jobDefinition: d.jobDefinitionArn,
    status: o.exitCode === 0 ? 'SUCCEEDED' : 'FAILED', statusChangedAt: o.stoppedAt, statusReason: 'Essential container in task exited', exitCode: o.exitCode,
    createdAt: o.startedAt - 40_000, startedAt: o.startedAt, stoppedAt: o.stoppedAt, logStreamName: stream, submittedBy: 'Amazon_EventBridge_Invoke_Batch',
    ...(o.reason ? { rails: { reason: o.reason } } : {}),
  };
  env.batchJobs.push(job);
  quietly(() => { for (const l of o.logs) appendLog(env, '/aws/batch/job', stream, [l.message], l.at); });
  return jobId;
}

/* aws-learning の runJob（sim/batch.ts）の先頭で呼ばれる（vite.config.ts の差し込み）。ふるまいが決まっているジョブ定義だけ答える */
hooks.batchJob = (env: AwsEnv, job: RailsJob, d: JobDefinition, at: number) => {
  const b = behaviorOf(env, d);
  if (!b) return undefined;
  const memory = job.rails?.memory ?? Number(d.memory);
  const t = (s: string) => `${new Date(at).toISOString()} ${s}`;
  if (memory < b.needsMiB) {
    job.rails = { ...job.rails, reason: OOM };
    return { lines: b.progress.map(t), exitCode: 137 };
  }
  return { lines: [...b.progress, ...b.done].map(t), exitCode: 0 };
};

const batch = service('batch');
const describeJobs = batch.ops.get('describe-jobs')!;
set('batch', {
  ...describeJobs,
  run(ctx: OpContext) {
    const res = describeJobs.run(ctx) as { jobs: { jobId: string; container: Record<string, unknown>; attempts: { container: Record<string, unknown> }[] }[] };
    for (const out of res.jobs) {
      const j = ctx.env.batchJobs.find((x) => x.jobId === out.jobId) as RailsJob | undefined;
      const reason = j?.rails?.reason;
      if (reason) { out.container.reason = reason; for (const a of out.attempts) a.container.reason = reason; }
      if (j?.rails?.memory) out.container.resourceRequirements = [{ value: '1', type: 'VCPU' }, { value: String(j.rails.memory), type: 'MEMORY' }];
    }
    return res;
  },
});

const submitJob = batch.ops.get('submit-job')!;
set('batch', {
  ...submitJob,
  params: [...submitJob.params, { name: 'container-overrides', type: 'structure', desc: '{"resourceRequirements":[{"type":"MEMORY","value":"4096"}]} など（このジョブだけ変える）' }],
  run(ctx: OpContext) {
    const res = submitJob.run(ctx) as { jobId: string };
    const ov = struct(ctx, 'container-overrides') as { resourceRequirements?: { type?: string; value?: string }[] } | undefined;
    const mem = ov?.resourceRequirements?.find((r) => String(r.type).toUpperCase() === 'MEMORY')?.value;
    if (mem !== undefined) {
      if (!/^\d+$/.test(String(mem))) throw new AwsError('ClientException', '(シミュレーター) MEMORY の value は MiB の整数を文字列で書いてください（"4096"）');
      (ctx.env.batchJobs.find((j) => j.jobId === res.jobId) as RailsJob).rails = { memory: Number(mem) };
    }
    return res;
  },
});

/* ---------------- CloudWatch: CASE が作るアラームとメトリクス ---------------- */

interface Point { t: number; v: number }
interface Alarm {
  alarmName: string; alarmDescription?: string; namespace: string; metricName: string; dimensions: { Name: string; Value: string }[];
  statistic: string; period: number; evaluationPeriods: number; datapointsToAlarm: number; threshold: number; comparisonOperator: string;
  treatMissingData: string; alarmActions: string[]; okActions: string[]; insufficientDataActions: string[];
  createdAt: number; history: { at: number; summary: string }[];
}
interface Monitoring { alarms: Alarm[]; series: Record<string, Point[]> }
const monOf = (env: AwsEnv): Monitoring => (env as unknown as { railsMonitoring?: Monitoring }).railsMonitoring ?? { alarms: [], series: {} };
const seriesKey = (ns: string, metric: string, dims: { Name: string; Value: string }[]) => `${ns}|${metric}|${dims.map((d) => `${d.Name}=${d.Value}`).sort().join(',')}`;

/** メトリクス（1分ごとの値。無い分はデータ無し）とアラーム（history は古い順） */
export function monitoring(env: AwsEnv, o: { series: { namespace: string; metricName: string; dimensions: { Name: string; Value: string }[]; points: Point[] }[]; alarms: Omit<Alarm, 'okActions' | 'insufficientDataActions'>[] }): void {
  const m: Monitoring = { alarms: o.alarms.map((a) => ({ okActions: [], insufficientDataActions: [], ...a })), series: {} };
  for (const s of o.series) m.series[seriesKey(s.namespace, s.metricName, s.dimensions)] = s.points;
  (env as unknown as { railsMonitoring: Monitoring }).railsMonitoring = m;
}

function stat(values: number[], s: string): number {
  if (s === 'Sum') return values.reduce((a, b) => a + b, 0);
  if (s === 'Maximum') return Math.max(...values);
  if (s === 'Minimum') return Math.min(...values);
  if (s === 'SampleCount') return values.length;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
/** period ごとにまとめる（データの無い区間は返さない） */
function buckets(points: Point[], start: number, end: number, period: number, s: string): Point[] {
  const out: Point[] = [];
  for (let t = start; t < end; t += period * 1000) {
    const vs = points.filter((p) => p.t >= t && p.t < t + period * 1000).map((p) => p.v);
    if (vs.length) out.push({ t, v: Math.round(stat(vs, s) * 1000) / 1000 });
  }
  return out;
}
function alarmState(env: AwsEnv, a: Alarm, now: number): { state: string; reason: string } {
  const pts = monOf(env).series[seriesKey(a.namespace, a.metricName, a.dimensions)] ?? [];
  const p = a.period * 1000;
  const end = Math.floor(now / p) * p;
  const start = end - a.evaluationPeriods * p;
  const got = buckets(pts, start, end, a.period, a.statistic);
  const cmp = (v: number) => (a.comparisonOperator.startsWith('GreaterThanOrEqual') ? v >= a.threshold : a.comparisonOperator.startsWith('GreaterThan') ? v > a.threshold : a.comparisonOperator.startsWith('LessThanOrEqual') ? v <= a.threshold : v < a.threshold);
  if (!got.length) {
    if (a.treatMissingData === 'breaching') return { state: 'ALARM', reason: 'Threshold Crossed: no datapoints were received for ' + a.evaluationPeriods + ' periods and ' + a.evaluationPeriods + ' missing datapoints were treated as [Breaching].' };
    if (a.treatMissingData === 'notBreaching') return { state: 'OK', reason: 'Threshold Crossed: no datapoints were received for ' + a.evaluationPeriods + ' periods and ' + a.evaluationPeriods + ' missing datapoints were treated as [NonBreaching].' };
    return { state: 'INSUFFICIENT_DATA', reason: 'Insufficient Data: ' + a.evaluationPeriods + ' datapoints were unknown.' };
  }
  const missing = a.evaluationPeriods - got.length;
  const breaching = got.filter((x) => cmp(x.v)).length + (a.treatMissingData === 'breaching' ? missing : 0);
  return breaching >= a.datapointsToAlarm ? { state: 'ALARM', reason: `Threshold Crossed: ${breaching} out of the last ${a.evaluationPeriods} datapoints were breaching the threshold (${a.threshold.toFixed(1)}).` }
    : { state: 'OK', reason: `Threshold Crossed: ${a.evaluationPeriods - breaching} out of the last ${a.evaluationPeriods} datapoints were not breaching the threshold (${a.threshold.toFixed(1)}).` };
}
const alarmArn = (env: AwsEnv, name: string) => `arn:aws:cloudwatch:${env.region}:${env.accountId}:alarm:${name}`;
function alarmOut(env: AwsEnv, a: Alarm, now: number) {
  const s = alarmState(env, a, now);
  const last = [...a.history].reverse().find((h) => /^Alarm updated from/.test(h.summary));
  return {
    AlarmName: a.alarmName, AlarmArn: alarmArn(env, a.alarmName), ...(a.alarmDescription ? { AlarmDescription: a.alarmDescription } : {}),
    AlarmConfigurationUpdatedTimestamp: iso(a.createdAt), ActionsEnabled: true,
    OKActions: a.okActions, AlarmActions: a.alarmActions, InsufficientDataActions: a.insufficientDataActions,
    StateValue: s.state, StateReason: s.reason, StateUpdatedTimestamp: iso(last?.at ?? a.createdAt),
    MetricName: a.metricName, Namespace: a.namespace, Statistic: a.statistic, Dimensions: a.dimensions, Period: a.period,
    EvaluationPeriods: a.evaluationPeriods, DatapointsToAlarm: a.datapointsToAlarm, Threshold: a.threshold, ComparisonOperator: a.comparisonOperator,
    TreatMissingData: a.treatMissingData, StateTransitionedTimestamp: iso(last?.at ?? a.createdAt),
  };
}

const cw = service('cloudwatch');
const describeAlarms = cw.ops.get('describe-alarms')!;
set('cloudwatch', {
  ...describeAlarms,
  run(ctx: OpContext) {
    const res = describeAlarms.run(ctx) as { MetricAlarms?: unknown[]; CompositeAlarms?: unknown[] };
    const names = strs(ctx, 'alarm-names'), prefix = str(ctx, 'alarm-name-prefix'), state = str(ctx, 'state-value');
    const mine = monOf(ctx.env).alarms.map((a) => alarmOut(ctx.env, a, ctx.now))
      .filter((a) => (!names.length || names.includes(a.AlarmName)) && (!prefix || a.AlarmName.startsWith(prefix)) && (!state || a.StateValue === state));
    return { ...res, MetricAlarms: [...mine, ...(res.MetricAlarms ?? [])] };
  },
});

set('cloudwatch', {
  name: 'describe-alarm-history',
  api: 'DescribeAlarmHistory',
  desc: 'アラームの履歴（状態の変化・設定の変更・アクションの実行）。新しい順',
  params: [
    { name: 'alarm-name', type: 'string', desc: 'アラームの名前' },
    { name: 'history-item-type', type: 'string', desc: 'StateUpdate / ConfigurationUpdate / Action' },
    { name: 'start-date', type: 'timestamp', desc: '開始（UTC）' },
    { name: 'end-date', type: 'timestamp', desc: '終了（UTC）' },
    { name: 'max-records', type: 'integer', desc: '件数の上限' },
  ],
  readOnly: true,
  examples: ['aws cloudwatch describe-alarm-history --alarm-name myapp-alb-target-5xx --history-item-type StateUpdate'],
  run(ctx) {
    const name = str(ctx, 'alarm-name'), type = str(ctx, 'history-item-type');
    const from = timestamp(ctx, 'start-date') ?? 0, to = timestamp(ctx, 'end-date') ?? ctx.now;
    const items = monOf(ctx.env).alarms.filter((a) => !name || a.alarmName === name).flatMap((a) => a.history.map((h) => ({ a, h })))
      .map(({ a, h }) => ({ AlarmName: a.alarmName, AlarmType: 'MetricAlarm', Timestamp: h.at, HistoryItemType: /^Alarm updated from/.test(h.summary) ? 'StateUpdate' : /^Successfully executed/.test(h.summary) ? 'Action' : 'ConfigurationUpdate', HistorySummary: h.summary }))
      .filter((x) => x.Timestamp >= from && x.Timestamp <= to && x.Timestamp <= ctx.now && (!type || x.HistoryItemType === type))
      .sort((x, y) => y.Timestamp - x.Timestamp)
      .slice(0, int(ctx, 'max-records') ?? 100);
    return { AlarmHistoryItems: items.map((x) => ({ ...x, Timestamp: iso(x.Timestamp) })) };
  },
});

const getStats = cw.ops.get('get-metric-statistics')!;
set('cloudwatch', {
  ...getStats,
  run(ctx: OpContext) {
    const dims = structs(ctx, 'dimensions').map((d) => ({ Name: String(d.Name ?? ''), Value: String(d.Value ?? '') }));
    const pts = monOf(ctx.env).series[seriesKey(req(ctx, 'namespace'), req(ctx, 'metric-name'), dims)];
    if (!pts) return getStats.run(ctx);
    const stats = strs(ctx, 'statistics');
    if (!stats.length) throw new AwsError('InvalidParameterCombination', 'At least one of the parameters Statistics and ExtendedStatistics must be specified.');
    const period = int(ctx, 'period')!;
    if (period < 60 || period % 60) throw new AwsError('InvalidParameterValue', 'The parameter Period must be a multiple of 60.');
    const start = timestamp(ctx, 'start-time')!, end = Math.min(timestamp(ctx, 'end-time')!, ctx.now);
    const per = stats.map((s) => new Map(buckets(pts, start, end, period, s).map((b) => [b.t, b.v])));
    const times = [...new Set(per.flatMap((m) => [...m.keys()]))].sort((a, b) => a - b);
    return { Label: req(ctx, 'metric-name'), Datapoints: times.map((t) => ({ Timestamp: iso(t), ...Object.fromEntries(stats.map((s, i) => [s, per[i].get(t)])), Unit: 'Count' })) };
  },
});

const putAlarm = cw.ops.get('put-metric-alarm')!;
set('cloudwatch', {
  ...putAlarm,
  params: [
    ...putAlarm.params,
    { name: 'alarm-actions', type: 'list', desc: 'ALARM になったときの通知先（SNS トピックの ARN）' },
    { name: 'ok-actions', type: 'list', desc: 'OK に戻ったときの通知先' },
    { name: 'insufficient-data-actions', type: 'list', desc: 'INSUFFICIENT_DATA になったときの通知先' },
    { name: 'treat-missing-data', type: 'string', desc: 'missing（既定）/ notBreaching / breaching / ignore' },
  ],
  run(ctx: OpContext) {
    const dims = structs(ctx, 'dimensions').map((d) => ({ Name: String(d.Name ?? ''), Value: String(d.Value ?? '') }));
    const ns = req(ctx, 'namespace');
    const ours = Object.keys(monOf(ctx.env).series).some((k) => k.startsWith(`${ns}|`) && dims.length && k.endsWith(seriesKey('', '', dims).slice(2)));
    if (!ours) return putAlarm.run(ctx);
    const tmd = str(ctx, 'treat-missing-data') ?? 'missing';
    if (!['missing', 'notBreaching', 'breaching', 'ignore'].includes(tmd)) throw new AwsError('ValidationError', `(シミュレーター) --treat-missing-data は missing / notBreaching / breaching / ignore のどれかにしてください`);
    const m = ((ctx.env as unknown as { railsMonitoring?: Monitoring }).railsMonitoring ??= { alarms: [], series: {} });
    const name = req(ctx, 'alarm-name');
    const evaluationPeriods = int(ctx, 'evaluation-periods')!;
    const a: Alarm = {
      alarmName: name, alarmDescription: str(ctx, 'alarm-description'), namespace: ns, metricName: req(ctx, 'metric-name'), dimensions: dims,
      statistic: req(ctx, 'statistic'), period: int(ctx, 'period')!, evaluationPeriods, datapointsToAlarm: int(ctx, 'datapoints-to-alarm') ?? evaluationPeriods,
      threshold: Number(req(ctx, 'threshold')), comparisonOperator: req(ctx, 'comparison-operator'), treatMissingData: tmd,
      alarmActions: strs(ctx, 'alarm-actions'), okActions: strs(ctx, 'ok-actions'), insufficientDataActions: strs(ctx, 'insufficient-data-actions'),
      createdAt: ctx.now, history: [],
    };
    const before = m.alarms.find((x) => x.alarmName === name);
    a.history = [...(before?.history ?? []), { at: ctx.now, summary: `Alarm "${name}" ${before ? 'updated' : 'created'}` }];
    const s = alarmState(ctx.env, a, ctx.now);
    a.history.push({ at: ctx.now, summary: `Alarm updated from INSUFFICIENT_DATA to ${s.state}` });
    m.alarms = [...m.alarms.filter((x) => x.alarmName !== name), a];
    return undefined;
  },
});
