/* aws-learning の aws ecs に足りないオペレーションを足す（LEVEL 13 のCASEで使う）。
     run-task                         一度きりのタスク（マイグレーションなど）
     wait tasks-stopped               タスクが止まるまで待つ
     execute-command                  ECS Exec（コンテナの中で rails console を開く）
     update-service --enable-execute-command
   あわせて describe-tasks / describe-services の出力に、シミュレーターが出さない項目
   （コンテナの終了コード、ECS Exec の状態、差し替えた command、SIGTERM を送った時刻）を足す。 */
import { SERVICES } from '@aws-learning/cli/aws/registry';
import { AwsError, bool, int, iso, req, str, strs, struct, type OpContext, type OperationSpec } from '@aws-learning/cli/aws/types';
import { getSubnet } from '@aws-learning/sim/env';
import { evaluateIamPermission } from '@aws-learning/sim/iam';
import { randomHex } from '@aws-learning/sim/ids';
import { taskId } from '@aws-learning/sim/targets';
import type { AwsEnv } from '@aws-learning/sim/types';
import { createOneOffTask, type RailsService, type RailsTask } from './hooks';

const ecs = SERVICES.get('ecs')!;
const op = (name: string) => ecs.ops.get(name)!;
const set = (spec: OperationSpec) => ecs.ops.set(spec.name, spec);

const clusterOf = (env: AwsEnv, name: string | undefined) => {
  const c = env.ecsClusters.find((x) => x.clusterName === (name ?? 'default') || x.clusterArn === name);
  if (!c) throw new AwsError('ClusterNotFoundException', 'Cluster not found.');
  return c;
};
const findTask = (env: AwsEnv, clusterArn: string, id: string) =>
  env.ecsTasks.find((t) => t.clusterArn === clusterArn && (t.taskArn === id || taskId(t) === id)) as RailsTask | undefined;

/* ---------------- describe-tasks / describe-services に足す ---------------- */

type TaskOut = { taskArn: string; containers: Record<string, unknown>[]; [k: string]: unknown };
function patchTask(env: AwsEnv, out: TaskOut): TaskOut {
  const t = env.ecsTasks.find((x) => x.taskArn === out.taskArn) as RailsTask | undefined;
  if (!t) return out;
  const st = t.rails ?? {};
  out.containers = out.containers.map((c, i) => {
    const src = t.containers[i];
    const agents = st.exec && t.lastStatus === 'RUNNING' ? { managedAgents: [{ lastStartedAt: iso(t.startedAt), name: 'ExecuteCommandAgent', lastStatus: 'RUNNING' }] } : {};
    return { ...c, ...(src?.exitCode !== undefined ? { exitCode: src.exitCode } : {}), ...agents };
  });
  out.enableExecuteCommand = !!st.exec;
  if (st.command) out.overrides = { containerOverrides: [{ name: t.containers[0]?.name, command: st.command }], inferenceAcceleratorOverrides: [] };
  if (st.startedBy) out.startedBy = st.startedBy;
  if (st.sigtermAt !== undefined) out.stoppingAt = iso(st.sigtermAt);
  return out;
}

const describeTasks = op('describe-tasks');
set({
  ...describeTasks,
  run(ctx: OpContext) {
    const res = describeTasks.run(ctx) as { tasks: TaskOut[] };
    res.tasks = res.tasks.map((t) => patchTask(ctx.env, t));
    return res;
  },
});

const describeServices = op('describe-services');
set({
  ...describeServices,
  run(ctx: OpContext) {
    const res = describeServices.run(ctx) as { services: { serviceArn: string; enableExecuteCommand?: boolean }[] };
    for (const s of res.services) s.enableExecuteCommand = !!(ctx.env.ecsServices.find((x) => x.serviceArn === s.serviceArn) as RailsService | undefined)?.enableExecuteCommand;
    return res;
  },
});

/* ---------------- update-service --enable-execute-command ---------------- */

const updateService = op('update-service');
set({
  ...updateService,
  params: [...updateService.params, { name: 'enable-execute-command', type: 'boolean', desc: 'ECS Exec を使えるようにする（これから起動するタスクから。--no-enable-execute-command で戻す）' }],
  run(ctx: OpContext) {
    const flag = bool(ctx, 'enable-execute-command');
    const c = clusterOf(ctx.env, str(ctx, 'cluster'));
    const name = req(ctx, 'service').split('/').pop();
    const s = ctx.env.ecsServices.find((x) => x.clusterArn === c.clusterArn && x.serviceName === name) as RailsService | undefined;
    if (s && flag !== undefined) s.enableExecuteCommand = flag;
    /* 新しいデプロイを作るとき（タスク定義が変わる、または --force-new-deployment）は、今動いているタスクを入れ替えの対象にする。
       ECS は新しいデプロイごとに新しいタスクを起動する。前のリビジョンに戻すときも、動いているタスクをそのまま使うわけではない */
    const want = str(ctx, 'task-definition');
    const td = !want ? undefined : want.includes(':')
      ? ctx.env.taskDefinitions.find((d) => d.taskDefinitionArn === want || `${d.family}:${d.revision}` === want)
      : ctx.env.taskDefinitions.filter((d) => d.family === want && d.status === 'ACTIVE').sort((a, b) => b.revision - a.revision)[0];
    const newDeployment = !!s && ((!!td && td.taskDefinitionArn !== s.taskDefinition) || !!bool(ctx, 'force-new-deployment'));
    if (s && newDeployment)
      for (const t of ctx.env.ecsTasks as RailsTask[]) if (t.group === `service:${s.serviceName}` && t.clusterArn === s.clusterArn && t.desiredStatus === 'RUNNING') (t.rails ??= {}).outdated = true;
    const res = updateService.run(ctx) as { service?: { serviceArn: string; enableExecuteCommand?: boolean } };
    if (res?.service) res.service.enableExecuteCommand = !!(ctx.env.ecsServices.find((x) => x.serviceArn === res.service!.serviceArn) as RailsService | undefined)?.enableExecuteCommand;
    return res;
  },
});

/* ---------------- run-task ---------------- */

set({
  name: 'run-task',
  desc: 'タスクを起動する（サービスに属さない一度きりの実行。マイグレーションなど）',
  params: [
    { name: 'cluster', type: 'string', desc: 'クラスター名 (省略すると default)' },
    { name: 'task-definition', type: 'string', required: true, desc: 'family:revision か ARN (revision を省くと最新の ACTIVE)' },
    { name: 'launch-type', type: 'string', desc: 'FARGATE' },
    { name: 'count', type: 'integer', desc: '起動するタスクの数 (既定 1)' },
    { name: 'network-configuration', type: 'structure', desc: 'awsvpcConfiguration={subnets=[...],securityGroups=[...],assignPublicIp=DISABLED}' },
    { name: 'overrides', type: 'structure', desc: '{"containerOverrides":[{"name":"web","command":["bin/rails","db:migrate"]}]}' },
    { name: 'started-by', type: 'string', desc: 'タスクに付ける目印' },
    { name: 'enable-execute-command', type: 'boolean', desc: 'ECS Exec を使えるようにする' },
  ],
  examples: [
    "aws ecs run-task --cluster jinzai-prod --task-definition jinzai-prod-web --launch-type FARGATE --network-configuration 'awsvpcConfiguration={subnets=[subnet-...],securityGroups=[sg-...],assignPublicIp=DISABLED}' --overrides '{\"containerOverrides\":[{\"name\":\"web\",\"command\":[\"bin/rails\",\"db:migrate\"]}]}'",
  ],
  run(ctx: OpContext) {
    const c = clusterOf(ctx.env, str(ctx, 'cluster'));
    const want = req(ctx, 'task-definition');
    const td = want.includes(':')
      ? ctx.env.taskDefinitions.find((d) => d.taskDefinitionArn === want || `${d.family}:${d.revision}` === want)
      : ctx.env.taskDefinitions.filter((d) => d.family === want && d.status === 'ACTIVE').sort((a, b) => b.revision - a.revision)[0];
    if (!td) throw new AwsError('ClientException', 'Unable to describe task definition.');
    if ((str(ctx, 'launch-type') ?? 'EC2') !== 'FARGATE') throw new AwsError('InvalidParameterException', 'Task definition does not support launch_type EC2.');
    const net = (struct(ctx, 'network-configuration')?.awsvpcConfiguration ?? undefined) as { subnets?: string[]; securityGroups?: string[]; assignPublicIp?: string } | undefined;
    if (!net?.subnets?.length) throw new AwsError('InvalidParameterException', "Network Configuration must be provided when networkMode 'awsvpc' is specified.");
    const subnets = net.subnets.map((s) => getSubnet(ctx.env, String(s)));
    /* セキュリティグループを省くと、VPC の default のセキュリティグループが付く */
    const sgs = net.securityGroups?.length
      ? net.securityGroups.map(String)
      : ctx.env.securityGroups.filter((g) => g.vpcId === subnets[0].vpcId && g.groupName === 'default').map((g) => g.groupId);
    for (const g of sgs) if (!ctx.env.securityGroups.some((x) => x.groupId === g)) throw new AwsError('InvalidParameterException', `Error retrieving security group information for [${g}]: The security group '${g}' does not exist`);
    const ov = struct(ctx, 'overrides') as { containerOverrides?: { name?: string; command?: string[] }[] } | undefined;
    const command = ov?.containerOverrides?.find((x) => !x.name || x.name === td.containerDefinitions[0].name)?.command?.map(String);
    const count = int(ctx, 'count') ?? 1;
    const started: string[] = [];
    for (let n = 0; n < count; n++)
      started.push(createOneOffTask(ctx.env, { clusterName: c.clusterName, td, subnetIds: subnets.map((x) => x.subnetId), securityGroupIds: sgs, command, exec: !!bool(ctx, 'enable-execute-command'), startedBy: str(ctx, 'started-by'), now: ctx.now, n }).taskArn);
    const res = describeTasks.run({ ...ctx, p: { cluster: c.clusterName, tasks: started } }) as { tasks: TaskOut[] };
    return { tasks: res.tasks.map((t) => patchTask(ctx.env, t)), failures: [] };
  },
});

/* ---------------- wait tasks-stopped ---------------- */

set({
  name: 'wait tasks-stopped',
  desc: 'タスクが STOPPED になるまで待つ',
  params: [
    { name: 'cluster', type: 'string', desc: 'クラスター名 (省略すると default)' },
    { name: 'tasks', type: 'list', required: true, desc: 'タスクの ARN か ID' },
  ],
  readOnly: true,
  waiter: {
    delayMs: 2000,
    maxAttempts: 100,
    until(ctx: OpContext) {
      const c = clusterOf(ctx.env, str(ctx, 'cluster'));
      return strs(ctx, 'tasks').every((id) => {
        const t = findTask(ctx.env, c.clusterArn, id);
        if (!t) throw new AwsError('WaiterFailed', 'Waiter TasksStopped failed: Waiter encountered a terminal failure state: For expression "failures[].reason" we matched expected path: "MISSING" at least once');
        return t.lastStatus === 'STOPPED';
      });
    },
  },
  run: () => undefined,
});

/* ---------------- execute-command（ECS Exec） ---------------- */

const EXEC_ACTIONS = ['ssmmessages:CreateControlChannel', 'ssmmessages:CreateDataChannel', 'ssmmessages:OpenControlChannel', 'ssmmessages:OpenDataChannel'];

set({
  name: 'execute-command',
  desc: 'タスクのコンテナの中でコマンドを実行する（ECS Exec。--interactive が必要）',
  params: [
    { name: 'cluster', type: 'string', desc: 'クラスター名 (省略すると default)' },
    { name: 'task', type: 'string', required: true, desc: 'タスクの ARN か ID' },
    { name: 'container', type: 'string', desc: 'コンテナ名 (コンテナが1つなら省略できる)' },
    { name: 'command', type: 'string', required: true, desc: '実行するコマンド ("bin/rails console" など)' },
    { name: 'interactive', type: 'boolean', desc: '対話モード (必須)' },
  ],
  readOnly: true,
  raw: true,
  examples: ['aws ecs execute-command --cluster jinzai-prod --task <タスク ID> --container web --interactive --command "bin/rails console"'],
  run(ctx: OpContext) {
    if (!bool(ctx, 'interactive')) throw new AwsError('InvalidParameterException', 'Interactive is the only mode supported currently.');
    const c = clusterOf(ctx.env, str(ctx, 'cluster'));
    const t = findTask(ctx.env, c.clusterArn, req(ctx, 'task'));
    if (!t) throw new AwsError('InvalidParameterException', 'The specified task was not found.');
    const name = str(ctx, 'container') ?? t.containers[0].name;
    if (!t.containers.some((x) => x.name === name)) throw new AwsError('InvalidParameterException', `The container ${name} does not exist in the task.`);
    if (t.lastStatus !== 'RUNNING' || !t.rails?.exec)
      throw new AwsError('InvalidParameterException', "The execute command failed because execute command was not enabled when the task was run or the execute command agent isn't running. Wait and try again or run a new task with execute command enabled and try again.");
    /* タスクロールに ssmmessages の4つの権限が無いと、コンテナの中のエージェントが Session Manager につながれない */
    const td = ctx.env.taskDefinitions.find((d) => d.taskDefinitionArn === t.taskDefinitionArn);
    const roleName = td?.taskRoleArn?.split('/').pop();
    const allowed = !!roleName && EXEC_ACTIONS.every((action) => evaluateIamPermission(ctx.env, { principal: { type: 'role', roleName, sessionName: taskId(t) }, action, resource: '*' }).decision === 'Allow');
    if (!allowed) throw new AwsError('TargetNotConnectedException', 'The execute command failed due to an internal error. Try again later.');
    const session = `ecs-execute-command-${randomHex(17)}`;
    ctx.terminal.connect(`ecs-exec|${t.taskArn}|${name}|${req(ctx, 'command')}|${session}`);
    return `\nThe Session Manager plugin was installed successfully. Use the AWS CLI to start a session.\n\n\nStarting session with SessionId: ${session}\n`;
  },
});
