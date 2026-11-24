/* aws-learning のシミュレーターに、Rails のアプリらしいふるまいを足す。
   vite.config.ts のプラグインが aws-learning の sim/containers.ts と sim/elb.ts に差し込んだ呼び出し（globalThis.__awsSimHooks）から呼ばれる。
   ふるまいはタスク定義のコンテナの extra.behavior（rails.ts の Behavior）に書いてある。 */
import { appendLog } from '@aws-learning/sim/cloudwatch';
import { TASK_STEP_MS } from '@aws-learning/sim/containers';
import { getSubnet } from '@aws-learning/sim/env';
import { newUuid, randomHex } from '@aws-learning/sim/ids';
import { taskId } from '@aws-learning/sim/targets';
import type { AwsEnv, EcsService, EcsTask, TargetGroup } from '@aws-learning/sim/types';
import { allocateIp } from '@aws-learning/sim/vpc';
import type { Behavior, Exit, OneOff, RailsContainer } from './rails';

type Stop = (t: EcsTask, now: number, code: EcsTask['stopCode'], reason: string) => void;

/** フックがタスクに付ける印（シミュレーターの EcsTask には無い項目） */
export interface RailsTaskState {
  booted?: boolean;
  exited?: boolean;
  failedHealth?: boolean;
  /** SIGTERM を送った時刻 */
  sigtermAt?: number;
  /** run-task の --overrides で差し替えた command */
  command?: string[];
  /** ECS Exec が使えるタスクか（起動したときに決まり、あとから変わらない） */
  exec?: boolean;
  startedBy?: string;
  /** --force-new-deployment の前から動いていたタスク（入れ替えの対象） */
  outdated?: boolean;
}
export type RailsTask = Omit<EcsTask, 'containers'> & { rails?: RailsTaskState; containers: (EcsTask['containers'][number] & { exitCode?: number })[] };
export type RailsService = EcsService & { enableExecuteCommand?: boolean };

/** run-task と同じ一度きりのタスクを作る（ecs-ops.ts の run-task と、rails.ts の runOneOff が使う） */
export function createOneOffTask(env: AwsEnv, o: { clusterName: string; td: { taskDefinitionArn: string; family: string; containerDefinitions: { name: string; image: string }[] }; subnetIds: string[]; securityGroupIds: string[]; command?: string[]; exec?: boolean; startedBy?: string; now: number; n?: number }): RailsTask {
  const subnet = getSubnet(env, o.subnetIds[(o.n ?? 0) % o.subnetIds.length]);
  const c = env.ecsClusters.find((x) => x.clusterName === o.clusterName)!;
  const t: RailsTask = {
    taskArn: `arn:aws:ecs:${env.region}:${env.accountId}:task/${c.clusterName}/${randomHex(32)}`,
    clusterArn: c.clusterArn,
    group: `family:${o.td.family}`,
    taskDefinitionArn: o.td.taskDefinitionArn,
    lastStatus: 'PROVISIONING',
    desiredStatus: 'RUNNING',
    statusChangedAt: o.now,
    subnetId: subnet.subnetId,
    availabilityZone: subnet.availabilityZone,
    privateIpAddress: allocateIp(env, subnet.subnetId),
    securityGroupIds: o.securityGroupIds,
    createdAt: o.now,
    containers: o.td.containerDefinitions.map((x) => ({ name: x.name, image: x.image, lastStatus: 'PENDING' as const })),
    rails: { command: o.command, exec: !!o.exec, startedBy: o.startedBy },
  };
  env.ecsTasks.push(t as EcsTask);
  return t;
}

/* ALB のヘルスチェックの既定（間隔30秒、2回続けて失敗で unhealthy） */
const ALB_INTERVAL_MS = 30_000;
const UNHEALTHY_THRESHOLD = 2;
/* 起動に失敗したあと、ECS が次のタスクを起動するまでの間隔（学習環境の値） */
const RETRY_AFTER_FAILURE_MS = 60_000;

export function containerOf(env: AwsEnv, t: EcsTask): RailsContainer | undefined {
  const td = env.taskDefinitions.find((d) => d.taskDefinitionArn === t.taskDefinitionArn);
  return td?.containerDefinitions[0] as RailsContainer | undefined;
}
const behaviorOf = (c: RailsContainer | undefined): Behavior => c?.extra?.behavior ?? {};
export const serviceOf = (env: AwsEnv, t: EcsTask): RailsService | undefined =>
  t.group.startsWith('service:') ? env.ecsServices.find((s) => s.clusterArn === t.clusterArn && `service:${s.serviceName}` === t.group) : undefined;

/** ECS のサービスのイベントと同じ形で足す（新しいものが先頭） */
export function serviceEvent(s: EcsService, at: number, message: string): void {
  s.events.unshift({ id: newUuid(), createdAt: at, message: `(service ${s.serviceName}) ${message}` });
  s.events.sort((a, b) => b.createdAt - a.createdAt);
  s.events = s.events.slice(0, 100);
}

/** awslogs と同じ名前（接頭辞/コンテナ名/タスクID）のログストリームへ、at から step ミリ秒おきに書く */
export function writeLogs(env: AwsEnv, t: EcsTask, at: number, lines: string[], step = 1): void {
  const c = containerOf(env, t);
  const o = c?.extra?.logConfiguration?.options;
  if (!o || !lines.length) return;
  const stream = `${o['awslogs-stream-prefix']}/${c!.name}/${taskId(t)}`;
  lines.forEach((m, i) => {
    const when = at + i * step;
    appendLog(env, o['awslogs-group'], stream, [m.replace('{time}', new Date(when).toISOString())], when);
  });
}

/** run-task で差し替えた command に合うふるまい */
function oneOff(b: Behavior, command: string[] | undefined): OneOff | undefined {
  if (!command || !b.commands) return undefined;
  const line = command.join(' ');
  const key = Object.keys(b.commands).find((k) => line.includes(k));
  return key ? b.commands[key] : undefined;
}

/** DB に届くか（DB のセキュリティグループが許しているグループが、タスクに付いているか） */
function outcome(env: AwsEnv, t: EcsTask, o: OneOff): Exit {
  if (!o.requiresSecurityGroup || !o.unreachable) return o.ok;
  const sg = env.securityGroups.find((g) => g.groupName === o.requiresSecurityGroup);
  return sg && t.securityGroupIds.includes(sg.groupId) ? o.ok : o.unreachable;
}

function matcherAccepts(tg: TargetGroup | undefined, code: number): boolean {
  const m = tg?.healthCheck.matcher ?? '200';
  return String(m).split(',').some((part) => {
    const [a, b] = part.trim().split('-').map(Number);
    return b === undefined ? code === a : code >= a && code <= b;
  });
}

/** シミュレーターの時計（最後に taskStep が呼ばれた時刻）。ヘルスチェックの判定には時刻が渡されないので、ここで覚えておく */
let simNow = 0;

function taskStep(env: AwsEnv, task: EcsTask, now: number, stop: Stop): void {
  simNow = now;
  const t = task as RailsTask & EcsTask;
  const st = (t.rails ??= {});
  const c = containerOf(env, t);
  if (!c) return;
  const b = behaviorOf(c);
  const svc = serviceOf(env, t);
  /* ECS Exec はタスクを起動したときのサービスの設定で決まる（動いているタスクにはあとから付けられない） */
  if (st.exec === undefined) st.exec = !!svc?.enableExecuteCommand;

  /* 1. 一度きりの実行（run-task）と、起動に失敗して終わるコンテナ */
  const one = oneOff(b, st.command);
  const exit = one ? outcome(env, t, one) : b.exit;
  if (t.lastStatus === 'RUNNING' && t.startedAt && !st.booted) {
    st.booted = true;
    if (!exit) writeLogs(env, t, t.startedAt, b.bootLogs ?? []);
  }
  if (exit && t.lastStatus === 'RUNNING' && t.desiredStatus === 'RUNNING' && t.startedAt && !st.exited && now >= t.startedAt + exit.afterMs) {
    st.exited = true;
    const at = t.startedAt + exit.afterMs;
    writeLogs(env, t, t.startedAt + 1, exit.logs, Math.max(1, Math.floor(exit.afterMs / Math.max(1, exit.logs.length))));
    t.containers.forEach((x) => (x.exitCode = exit.code));
    stop(t, at, 'EssentialContainerExited', 'Essential container in task exited');
    if (svc && exit.code !== 0) svc.retryAt = Math.max(svc.retryAt ?? 0, at + RETRY_AFTER_FAILURE_MS);
    return;
  }

  /* 2. ALB のヘルスチェックに落ち続けるタスクは、ECS が止めて入れ替える（猶予期間 + 間隔 × 回数のあと） */
  if (svc && svc.loadBalancers.length && b.healthCode !== undefined && t.lastStatus === 'RUNNING' && t.desiredStatus === 'RUNNING' && t.startedAt && !st.failedHealth) {
    const lb = svc.loadBalancers[0];
    const tg = env.targetGroups.find((x) => x.targetGroupArn === lb.targetGroupArn);
    const at = t.startedAt + svc.healthCheckGracePeriodSeconds * 1000 + ALB_INTERVAL_MS * UNHEALTHY_THRESHOLD;
    if (!matcherAccepts(tg, b.healthCode) && now >= at) {
      st.failedHealth = true;
      serviceEvent(svc, at, `(task ${taskId(t)}) (port ${lb.containerPort}) is unhealthy in (target-group ${lb.targetGroupArn}) due to (reason Health checks failed with these codes: [${b.healthCode}]).`);
      stop(t, at, 'ServiceSchedulerInitiated', `Task failed ELB health checks in (target-group ${lb.targetGroupArn})`);
      serviceEvent(svc, at, `has stopped 1 running tasks: (task ${taskId(t)}).`);
      return;
    }
  }

  /* 3. SIGTERM を受けてから終わるまで。stopTimeout（既定30秒）を過ぎても終わらなければ SIGKILL */
  if (t.lastStatus === 'DEPROVISIONING' && st.sigtermAt === undefined && !st.exited) {
    st.sigtermAt = t.statusChangedAt;
    const s = b.shutdown;
    if (s && !st.failedHealth) {
      const limit = c.extra?.stopTimeout ?? 30;
      const killed = s.seconds > limit;
      const end = killed ? limit : s.seconds;
      s.logs.filter((l) => l.after < end).forEach((l) => writeLogs(env, t, st.sigtermAt! + l.after * 1000, [l.message]));
      if (!killed) writeLogs(env, t, st.sigtermAt + end * 1000, s.done);
      t.containers.forEach((x) => (x.exitCode = killed ? 137 : 0));
      /* シミュレーターは TASK_STEP_MS で STOPPED にする。終わった時刻に STOPPED になるよう、状態の時刻をずらす */
      t.statusChangedAt = st.sigtermAt + end * 1000 - TASK_STEP_MS;
    }
  }
}

/** RUNNING になったばかりのタスクは、最初のヘルスチェック（間隔1回分）が終わるまで initial。
    これが無いと、新しいタスクが起動した瞬間に healthy になり、ECS が古いタスクをすぐ止めてしまう */
function initialHealth(env: AwsEnv, _tg: TargetGroup, backend: { kind: string; id: string }): boolean {
  if (backend.kind !== 'task') return false;
  const t = env.ecsTasks.find((x) => x.taskArn === backend.id);
  return !!t?.startedAt && simNow < t.startedAt + ALB_INTERVAL_MS;
}

/** ALB のヘルスチェックに返すステータスコード（undefined ならシミュレーターの判定のまま） */
function healthCode(env: AwsEnv, _tg: TargetGroup, backend: { kind: string; id: string }): number | undefined {
  if (backend.kind !== 'task') return undefined;
  const t = env.ecsTasks.find((x) => x.taskArn === backend.id);
  return t ? behaviorOf(containerOf(env, t)).healthCode : undefined;
}

(globalThis as { __awsSimHooks?: unknown }).__awsSimHooks = { taskStep, healthCode, initialHealth };
