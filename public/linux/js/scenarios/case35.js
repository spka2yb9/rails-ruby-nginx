/* CASE 35 — デプロイしたのに、新しいタスクが起動しては止まる（タスク定義で RAILS_MASTER_KEY を渡し忘れた）
   Rails 8.1 は secret_key_base が無いと起動できない（railties の Rails::Application::Configuration#secret_key_base=）。
   RAILS_MASTER_KEY が無いと credentials を読めず、secret_key_base も無くなる */
(function () {
'use strict';
var ME = '/Users/i-wada';
var SRC = ME + '/src/jinzai-rails';
var MIN = 60000;
var BAD = 'b7c8d9e';

var files = {};
files[ME + '/.aws/config'] = '[default]\nregion = ap-northeast-1\noutput = json\n';
files[ME + '/.aws/credentials'] = '[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[ME + '/ci-log.txt'] =
'[deploy] TAG=b7c8d9e\n' +
'[deploy] docker push 123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/jinzai/rails:b7c8d9e ... done\n' +
'[deploy] aws ecs register-task-definition --cli-input-json file:///tmp/web.json\n' +
'[deploy]   -> taskDefinitionArn: arn:aws:ecs:ap-northeast-1:123456789012:task-definition/jinzai-prod-web:4\n' +
'[deploy] aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --task-definition jinzai-prod-web\n' +
'[deploy] aws ecs wait services-stable --cluster jinzai-prod --services jinzai-prod-web\n' +
'\n' +
'Waiter ServicesStable failed: Max attempts exceeded\n' +
'[deploy] FAILED (exit 255)\n';

/* 今回のリリースで書き換えた ecs/web.json。環境変数を1つ足したときに secrets の段落を消してしまった */
files[SRC + '/ecs/web.json'] =
'{\n' +
'  "family": "jinzai-prod-web",\n' +
'  "cpu": "1024", "memory": "2048",\n' +
'  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",\n' +
'  "taskRoleArn": "arn:aws:iam::123456789012:role/jinzai-prod-task-role",\n' +
'  "containerDefinitions": [\n' +
'    {\n' +
'      "name": "web",\n' +
'      "image": "123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/jinzai/rails:__TAG__",\n' +
'      "command": ["./bin/rails", "server"],\n' +
'      "portMappings": [{ "containerPort": 3000 }],\n' +
'      "environment": [\n' +
'        { "name": "RAILS_ENV", "value": "production" },\n' +
'        { "name": "RAILS_LOG_LEVEL", "value": "info" },\n' +
'        { "name": "SCOUT_SCORE_TIMEOUT", "value": "3" }\n' +
'      ]\n' +
'    }\n' +
'  ]\n' +
'}\n';

var CRASH = [
  '=> Booting Puma',
  '=> Rails 8.1.4.1 application starting in production',
  '=> Run `bin/rails server --help` for more startup options',
  "Missing `secret_key_base` for 'production' environment, set this string with `bin/rails credentials:edit` (ArgumentError)"
];

window.LFR.scenarios.add({
  id: 'case35',
  level: 13,
  title: 'デプロイしたのに、新しいタスクが起動しては止まる',
  subtitle: '止まったタスクの理由・終了コード・ログから原因を突き止め、前のリビジョンに戻す',

  description:
'15分ほど前に、web のリリース（コミット b7c8d9e）を CI からデプロイしました。\n' +
'外部APIの待ち時間を環境変数で変えられるようにしただけの、小さな変更です。\n\n' +
'ところが CI は「Waiter ServicesStable failed: Max attempts exceeded」で失敗しました（~/ci-log.txt）。\n' +
'サイトは今のところ普通に表示されています。\n\n' +
'新しいタスクが起動しない理由を AWS CLI で突き止めて、サービスを安定した状態に戻してください。\n' +
'アプリのソースは ~/src/jinzai-rails にあります。',

  learn: [
    { name: 'デプロイの状態を見る', cmd: "aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].deployments[].{taskDefinition:taskDefinition,rollout:rolloutState,running:runningCount,desired:desiredCount}' --output table",
      desc: 'デプロイ中のサービスには新しいタスク定義の PRIMARY と、前のタスク定義の ACTIVE の2つのデプロイがあります。\n' +
            '新しいタスクが healthy にそろうまで、ECS は前のタスクを止めません（ローリングアップデート）。\n' +
            'サイトが見えているのは、前のタスクが動き続けているからです。' },
    { name: 'サービスのイベント', cmd: "aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].events[0:8].[createdAt,message]' --output text",
      desc: 'ECS がサービスに対して行ったこと（タスクの起動・停止、ターゲットの登録）が、新しい順に並びます。' },
    { name: '止まったタスクの一覧', cmd: 'aws ecs list-tasks --cluster jinzai-prod --service-name jinzai-prod-web --desired-status STOPPED',
      desc: '--desired-status STOPPED で、止まったタスクを出します（止まってからしばらくの間だけ残ります）。' },
    { name: '止まった理由と終了コード', cmd: "aws ecs describe-tasks --cluster jinzai-prod --tasks <タスクID> --query 'tasks[0].{stopCode:stopCode,reason:stoppedReason,exitCode:containers[0].exitCode,taskDefinition:taskDefinitionArn}'",
      desc: 'stopCode と stoppedReason は ECS から見た止まり方、exitCode はコンテナの中のプロセスの終了コードです。\n' +
            'EssentialContainerExited と exitCode 1 なら、アプリ自身がエラーで終わっています。\n' +
            'イメージが取れなければ TaskFailedToStart（CannotPullContainerError）、\n' +
            'ヘルスチェックに落ちて止められたなら ServiceSchedulerInitiated になります。' },
    { name: '止まったタスクのログ', cmd: 'aws logs tail /ecs/jinzai-prod-web --since 20m --log-stream-names web/web/<タスクID>',
      desc: '止まったタスクのログもログストリームに残っています。\n' +
            'ストリームの名前は「web/web/タスクID」なので、--log-stream-names でそのタスクのログだけを出せます。\n' +
            'タスクIDはタスクの ARN の最後の / より後ろです。' },
    { name: 'リビジョンどうしを比べる', cmd: "aws ecs describe-task-definition --task-definition jinzai-prod-web:3 --query 'taskDefinition.containerDefinitions[0].secrets'",
      desc: ':3（今動いている前のリビジョン）と :4（今回のリビジョン）で、secrets や environment を比べます。\n' +
            'secrets は Parameter Store などの値を、起動するときに環境変数としてコンテナに渡す設定です。' },
    { name: '前のリビジョンに戻す', cmd: 'aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --task-definition jinzai-prod-web:3',
      desc: 'サービスが使うタスク定義を、動いていたリビジョンに戻します。これが ECS でのロールバックです。\n' +
            '新しいイメージを作り直す必要はありません。' },
    { name: '安定するまで待つ', cmd: 'aws ecs wait services-stable --cluster jinzai-prod --services jinzai-prod-web',
      desc: 'デプロイが終わり、タスクの数がそろうまで待ちます。何も出さずに戻れば安定しています。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  awsEnv: function (sim) {
    var env = sim.railsOnEcs();
    sim.deploy(env, 'web', {
      tag: BAD,
      removeSecrets: ['RAILS_MASTER_KEY'],
      behavior: { exit: { afterMs: 7000, code: 1, logs: CRASH } }
    }, Date.now() - 15 * MIN);
    sim.advanceTo(env, Date.now() - 15 * MIN);
    return env;
  },

  hints: [
    'まずデプロイがどういう状態かを見てください。\n\n' +
    "  aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].deployments[].{taskDefinition:taskDefinition,rollout:rolloutState,running:runningCount}' --output table\n\n" +
    '新しいリビジョン（:4）の running が 0 のままです。止まったタスクを調べます。',

    '止まったタスクを1つ選んで、止まった理由を見ます。\n\n' +
    '  aws ecs list-tasks --cluster jinzai-prod --service-name jinzai-prod-web --desired-status STOPPED\n' +
    "  aws ecs describe-tasks --cluster jinzai-prod --tasks <タスクID> --query 'tasks[0].{stopCode:stopCode,reason:stoppedReason,exitCode:containers[0].exitCode}'\n\n" +
    'アプリが終了コード 1 で終わっています。何のエラーかはそのタスクのログにあります。\n\n' +
    '  aws logs tail /ecs/jinzai-prod-web --since 20m --log-stream-names web/web/<タスクID>',

    'ログには secret_key_base が無いと出ています。RAILS_MASTER_KEY が渡っていないと、Rails は credentials を読めません。\n' +
    ':3 と :4 のタスク定義の secrets を比べてから、:3 に戻してください。\n\n' +
    '  aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --task-definition jinzai-prod-web:3'
  ],

  probes: [
    { key: 'sawDeployments', label: 'デプロイが終わっていないことを確かめた',
      test: function (c, res) { return /describe-services/.test(c) && /IN_PROGRESS/.test(res.stdout); } },
    { key: 'listedStopped', label: '止まったタスクを一覧した',
      test: function (c, res) { return /list-tasks/.test(c) && /STOPPED/.test(c) && res.exitCode === 0 && (/task\//.test(res.stdout) || /^\s*\w+=\$\(/.test(c)); } },
    { key: 'sawExitCode', label: 'アプリが終了コード 1 で終わったことを確かめた',
      test: function (c, res) { return /describe-tasks/.test(c) && /EssentialContainerExited|Essential container in task exited/.test(res.stdout) && /\b1\b/.test(res.stdout); } },
    { key: 'foundBootError', label: 'ログで起動時の例外を見つけた',
      test: function (c, res) { return /aws\s+logs/.test(c) && /secret_key_base/.test(res.stdout); } },
    { key: 'comparedSecrets', label: 'リビジョンどうしで secrets を比べた',
      test: function (c, res) { return /describe-task-definition/.test(c) && /jinzai-prod-web:?[34]?/.test(c) && /RAILS_MASTER_KEY|secrets|null|\[\]/.test(res.stdout); } },
    { key: 'rolledBack', label: '前のリビジョン（:3）に戻した',
      test: function (c, res) { return /update-service/.test(c) && /jinzai-prod-web:3\b/.test(c) && res.exitCode === 0; } },
    { key: 'confirmedStable', label: 'サービスが安定したことを確かめた',
      test: function (c, res, rt) { return rt.investigation.facts.rolledBack && (/wait\s+services-stable/.test(c) && res.exitCode === 0 || /describe-services/.test(c) && /COMPLETED/.test(res.stdout) && !/IN_PROGRESS/.test(res.stdout)); } }
  ],

  evidence: [
    { key: 'sawDeployments',  weight: 8,  label: '新しいリビジョンのタスクが1つも動いていないと確かめた' },
    { key: 'listedStopped',   weight: 6,  label: '止まったタスクを探した' },
    { key: 'sawExitCode',     weight: 12, label: '止まり方（EssentialContainerExited・終了コード 1）を読んだ' },
    { key: 'foundBootError',  weight: 14, label: 'ログで secret_key_base の例外を見つけた' },
    { key: 'comparedSecrets', weight: 12, label: 'タスク定義のリビジョンを比べて、消えた secrets を見つけた' },
    { key: 'rolledBack',      weight: 12, label: '前のリビジョンに戻した' },
    { key: 'confirmedStable', weight: 8,  label: '戻したあとに安定したことを確かめた' }
  ],

  question: {
    text: '新しいタスクが起動しては止まる原因と、最初にすることは？',
    choices: [
      'ECR に b7c8d9e のイメージが無い。イメージを push し直す',
      '新しいタスク定義（:4）で RAILS_MASTER_KEY を渡していないので、Rails が起動の途中で止まっている。まず :3 に戻し、そのあとでタスク定義を直す',
      'ALB のヘルスチェックに落ちている。ヘルスチェックのパスを変える',
      'Fargate の容量が足りない。desired-count を減らして起動できるタスクを減らす'
    ],
    answer: 1,
    explain:
'デプロイの状態から見ます。\n\n' +
'  jinzai-prod-web:4   IN_PROGRESS   running 0\n' +
'  jinzai-prod-web:3   COMPLETED     running 2\n\n' +
'新しいリビジョンのタスクは1つも動いていません。ECS は新しいタスクが healthy にそろうまで前のタスクを止めないので、\n' +
'サイトは :3 のタスクで動き続けています。CI の wait services-stable が待ちきれずに失敗したのは、このためです。\n\n' +
'止まったタスクの理由と終了コードを見ます。\n\n' +
'  stopCode: EssentialContainerExited\n' +
'  reason:   Essential container in task exited\n' +
'  exitCode: 1\n\n' +
'コンテナの中のプロセス（Rails）が、自分でエラー終了しています。ログを見ると、起動の途中で止まっています。\n\n' +
'  => Booting Puma\n' +
"  Missing `secret_key_base` for 'production' environment, ... (ArgumentError)\n\n" +
'Rails 8.1 の production は、secret_key_base が無いと起動できません。secret_key_base は credentials に入っていて、\n' +
'credentials を読むには RAILS_MASTER_KEY が要ります。リビジョンを比べると、:4 の secrets から RAILS_MASTER_KEY が消えています。\n' +
'今回 ecs/web.json に環境変数を足したときに、secrets の段落ごと消してしまったのが原因です。\n\n' +
'最初にすることは、サービスを :3 に戻すことです。\n\n' +
'  aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --task-definition jinzai-prod-web:3\n\n' +
':3 のタスクはすでに動いているので、デプロイはすぐ終わります。\n' +
'そのうえで ecs/web.json に secrets を戻し、もう一度デプロイします。\n\n' +
'再発を防ぐには、サービスのデプロイサーキットブレーカー（deploymentCircuitBreaker）を rollback 付きで有効にしておきます。\n' +
'新しいタスクが続けて起動に失敗すると、ECS がデプロイを失敗とみなし、前の完了したデプロイに自動で戻します。\n' +
'このサービスでは有効にしていなかったので、デプロイが進まないまま残っていました。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. デプロイの状態は deployments（PRIMARY と ACTIVE）で見る。前のタスクが動いている間はサイトは落ちない\n' +
'2. 止まったタスクは stopCode・stoppedReason・exitCode の3つで、どこで止まったかを切り分ける\n' +
'3. 止まったタスクのログも CloudWatch Logs に残っている\n' +
'4. ECS のロールバックはサービスのタスク定義を前のリビジョンに戻すこと',
    wrong: [
'イメージが取れなければ、タスクは起動する前に止まり、stopCode は TaskFailedToStart、\n' +
'stoppedReason は CannotPullContainerError になります。\n\n' +
'今回の stopCode は EssentialContainerExited で、ログには「=> Booting Puma」が出ています。\n' +
'イメージは取れていて、Rails が起動を始めてから止まっています。',
null,
'ヘルスチェックに落ちて ECS が止めたのなら、stopCode は ServiceSchedulerInitiated になり、\n' +
'stoppedReason に「Task failed ELB health checks」と出ます。\n\n' +
'今回は起動してから数秒で、Rails が終了コード 1 で自分から終わっています。\n' +
'ヘルスチェックが始まる前に止まっているので、パスを変えても直りません。',
'容量が足りなければ、タスクは起動できずに止まり、その理由がイベントや stoppedReason に出ます。\n\n' +
'今回のタスクは起動して Rails が動き始めてから、終了コード 1 で止まっています。\n' +
'desired-count を減らすと、前のリビジョンで動いているタスクまで減らしてしまいます。'
    ]
  },

  route: {
    steps: [
      'CI のログで、どこで失敗したかを確かめる（wait services-stable）',
      'デプロイの状態を見る（:4 の running が 0、:3 が動き続けている）',
      '止まったタスクを一覧し、止まった理由と終了コードを見る',
      '止まったタスクのログで、起動時の例外を見つける（secret_key_base）',
      ':3 と :4 のタスク定義の secrets を比べる（RAILS_MASTER_KEY が消えた）',
      'サービスを :3 に戻し、安定したことを確かめる',
      '手元の ecs/web.json に secrets を戻す（次のデプロイで直す）'
    ],
    commands: [
      'cat ~/ci-log.txt',
      "aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].deployments[].{taskDefinition:taskDefinition,rollout:rolloutState,running:runningCount,desired:desiredCount}' --output table",
      "ID=$(aws ecs list-tasks --cluster jinzai-prod --service-name jinzai-prod-web --desired-status STOPPED --query 'taskArns[0]' --output text | cut -d/ -f3)",
      "aws ecs describe-tasks --cluster jinzai-prod --tasks $ID --query 'tasks[0].{stopCode:stopCode,reason:stoppedReason,exitCode:containers[0].exitCode,taskDefinition:taskDefinitionArn}'",
      'aws logs tail /ecs/jinzai-prod-web --since 20m --log-stream-names web/web/$ID',
      "aws ecs describe-task-definition --task-definition jinzai-prod-web:3 --query 'taskDefinition.containerDefinitions[0].secrets'",
      "aws ecs describe-task-definition --task-definition jinzai-prod-web:4 --query 'taskDefinition.containerDefinitions[0].secrets'",
      'aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --task-definition jinzai-prod-web:3',
      'aws ecs wait services-stable --cluster jinzai-prod --services jinzai-prod-web',
      'cat ~/src/jinzai-rails/ecs/web.json'
    ],
    note:
'止まったタスクのログから入って、先に secret_key_base に気づくルートでも構いません。\n' +
'原因を直す前に、まず動いていたリビジョンへ戻すことが大事です。\n' +
'戻せば利用者への影響は止まり、原因はそのあとで落ち着いて直せます。'
  }
});
})();
