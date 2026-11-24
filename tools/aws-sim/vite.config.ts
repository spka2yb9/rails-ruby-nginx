/* 第6部（public/linux）で使う AWS CLI のシミュレーター（public/linux/vendor/aws-sim.min.js）を作る。
   aws-learning（src/sim と src/cli/aws）をそのまま読み込み、IIFE（グローバル名 AwsSim）にまとめる。
   使い方: AWS_LEARNING_DIR=<aws-learning のディレクトリ> npx vite build --config tools/aws-sim/vite.config.ts
   （省略時は教科書のリポジトリと同じ階層の ../../aws-learning。aws-learning で npm ci 済みであること） */
import { resolve, sep } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const here = import.meta.dirname;
const aws = resolve(process.env.AWS_LEARNING_DIR ?? resolve(here, '../../../../aws-learning'));

/* aws-learning のファイルは書き換えず、ビルドのときだけ差し込み口（フック）の呼び出しを足す。
   フックの中身は hooks.ts。パターンが見つからなければビルドを止める（aws-learning が変わったら、ここを直す） */
const PATCHES: Record<string, { name: string; from: string; to: string }[]> = {
  'src/sim/vpc.ts': [
    {
      /* aws-learning の不具合の回避。止まったタスクは1時間残るのに、その IP を空きとして新しいタスクに渡してしまう。
         同じ IP のタスクが2つになると、ECS のターゲットの登録と解除が同じ時刻の中で交互に起き続け、時間が進まなくなる */
      name: '止まったタスクの IP も使用中に数える',
      from: "    ...(env.ecsTasks ?? []).filter((t) => t.subnetId === subnetId && t.lastStatus !== 'STOPPED').map((t) => t.privateIpAddress),",
      to: '    ...(env.ecsTasks ?? []).filter((t) => t.subnetId === subnetId).map((t) => t.privateIpAddress),',
    },
  ],
  'src/sim/containers.ts': [
    {
      /* シミュレーターは「タスク定義が同じなら新しいデプロイのタスク」とみなすので、--force-new-deployment や、
         前のリビジョンに戻したときに、動いているタスクが入れ替わらない（デプロイごとの runningCount も 0 になる）。
         ecs-ops.ts の update-service が、その時点のタスクに rails.outdated の印を付ける。印の付いたタスクは古いデプロイのものとして扱う */
      name: '新しいデプロイで入れ替えるタスク',
      from: '    const mine = tasks.filter((t) => t.taskDefinitionArn === primary.taskDefinition);\n    const old = tasks.filter((t) => t.taskDefinitionArn !== primary.taskDefinition);',
      to: '    const mine = tasks.filter((t) => t.taskDefinitionArn === primary.taskDefinition && !(t as any).rails?.outdated);\n    const old = tasks.filter((t) => t.taskDefinitionArn !== primary.taskDefinition || (t as any).rails?.outdated);',
    },
    {
      name: 'タスクの状態を進めるたびに呼ぶ',
      from: '  for (const t of env.ecsTasks) {\n    if (now - t.statusChangedAt < TASK_STEP_MS) continue;',
      to: '  for (const t of env.ecsTasks) {\n    (globalThis as any).__awsSimHooks?.taskStep?.(env, t, now, stop);\n    if (now - t.statusChangedAt < TASK_STEP_MS) continue;',
    },
  ],
  'src/sim/batch.ts': [
    {
      name: 'ジョブのふるまいを CASE が決める（server.ts の batchJob）',
      from: '  const bucket = d.command.find((c) => c.startsWith(\'--bucket=\'))?.slice(9) ?? \'\';',
      to: '  const hooked = (globalThis as any).__awsSimHooks?.batchJob?.(env, job, d, at);\n  if (hooked) return hooked;\n  const bucket = d.command.find((c) => c.startsWith(\'--bucket=\'))?.slice(9) ?? \'\';',
    },
  ],
  'src/sim/elb.ts': [
    {
      name: '登録したばかりのターゲットは、最初のヘルスチェックが終わるまで initial',
      from: "  if (b.starting) return { state: 'initial', reason: 'Elb.InitialHealthChecking', description: 'Initial health checks in progress' };",
      to: "  if (b.starting) return { state: 'initial', reason: 'Elb.InitialHealthChecking', description: 'Initial health checks in progress' };\n  if ((globalThis as any).__awsSimHooks?.initialHealth?.(env, tg, b)) return { state: 'initial', reason: 'Elb.InitialHealthChecking', description: 'Initial health checks in progress' };",
    },
    {
      name: 'ヘルスチェックのステータスコード',
      from: '  const code = app.healthCheckPath === tg.healthCheck.path ? 200 : 404;',
      to: '  const code: number = (globalThis as any).__awsSimHooks?.healthCode?.(env, tg, b) ?? (app.healthCheckPath === tg.healthCheck.path ? 200 : 404);',
    },
  ],
};

function hooks(): Plugin {
  return {
    name: 'aws-sim-hooks',
    enforce: 'pre',
    transform(code, id) {
      const rel = id.startsWith(aws + sep) ? id.slice(aws.length + 1).split(sep).join('/') : '';
      const list = PATCHES[rel];
      if (!list) return null;
      for (const p of list) {
        if (!code.includes(p.from)) throw new Error(`aws-sim: ${rel} の「${p.name}」の差し込み先が見つかりません`);
        code = code.replace(p.from, p.to);
      }
      return code;
    },
  };
}

export default defineConfig({
  root: here,
  publicDir: false,
  logLevel: 'warn',
  plugins: [hooks()],
  resolve: {
    alias: [
      /* aws-learning の状態（console/store.ts）は zustand で持っている。React を持ち込まないよう、フックの無い版に差し替える */
      { find: /^zustand$/, replacement: resolve(here, 'zustand.ts') },
      { find: /^zustand\/vanilla$/, replacement: resolve(aws, 'node_modules/zustand/esm/vanilla.mjs') },
      { find: /^@aws-learning\//, replacement: aws + '/src/' },
    ],
  },
  build: {
    outDir: resolve(here, '../../public/linux/vendor'),
    emptyOutDir: false,
    target: 'es2020',
    lib: { entry: resolve(here, 'entry.ts'), formats: ['iife'], name: 'AwsSim', fileName: () => 'aws-sim.min.js' },
  },
});
