/* public/linux/vendor/aws-sim.min.js の入口（グローバル名 AwsSim）。第6部の scenario-commands.js の aws コマンドと、CASE の awsEnv から使う。
   aws-learning の AWS CLI（src/cli/aws）とシミュレーター（src/sim）をそのまま使い、足りない項目だけをここで補う。 */
import { completeAws, runAws } from '@aws-learning/cli/aws/aws';
import { SERVICES } from '@aws-learning/cli/aws/registry';
import type { OpContext } from '@aws-learning/cli/aws/types';
import { useConsole } from '@aws-learning/console/store';
import type { AwsEnv } from '@aws-learning/sim/types';
import './hooks';
import './ecs-ops';
import './aurora';
import './server';
import type { RailsContainer } from './rails';

export { advanceTo, APP, deploy, PUMA_BOOT, putLogs, railsOnEcs, registerRevision, REPO, runOneOff, serviceTaskIds, SIDEKIQ_BOOT, WEB_LOG, WORKER_LOG } from './rails';
export { auroraFor as aurora, CLUSTER, clusterEndpoint, instanceEndpoint, railsOnEc2, readerEndpoint, resolveHost } from './aurora';
export { batchSetup, bucket, changeSecurityGroup, ec2Role, EC2_ROLE, groupId, INSTANCE_ID, logGroup, monitoring, parameters, pastJob, webAcl } from './server';
export { completeAws as complete, runAws as run };

/** CASE の環境を読み込む（CASE を開くたび・やり直すたびに作り直す） */
export function load(env: AwsEnv): void {
  useConsole.getState().load({ env, path: '/console/home', region: env.region, visited: [], copied: [], browser: [], commands: [] });
}
export const env = (): AwsEnv => useConsole.getState().env;
/** 経過時間でデプロイなどの状態を進める（aws を打つ前に呼ぶ） */
export const tick = (): void => useConsole.getState().tick();

/* describe-task-definition: シミュレーターのタスク定義が持たない command / logConfiguration / secrets / stopTimeout を、
   実物の AWS CLI と同じ位置（containerDefinitions の各要素）に足す */
const ecs = SERVICES.get('ecs')!;
const describeTd = ecs.ops.get('describe-task-definition')!;
ecs.ops.set('describe-task-definition', {
  ...describeTd,
  run(ctx: OpContext) {
    const res = describeTd.run(ctx) as { taskDefinition: { taskDefinitionArn: string; containerDefinitions: Record<string, unknown>[] } };
    const td = ctx.env.taskDefinitions.find((d) => d.taskDefinitionArn === res.taskDefinition.taskDefinitionArn);
    res.taskDefinition.containerDefinitions = res.taskDefinition.containerDefinitions.map((c, i) => {
      const extra = (td?.containerDefinitions[i] as RailsContainer | undefined)?.extra;
      if (!extra) return c;
      const { behavior: _behavior, ...shown } = extra;   // behavior はシミュレーターの中だけで使う
      return { ...c, ...shown };
    });
    return res;
  },
});
