/* CASE 38 — 本番の rails console を ECS Exec で開く
   ECS Exec は、起動したときに有効だったタスクでしか使えない（動いているタスクにあとから付けられない）。
   タスクロールに ssmmessages の4つの権限（CreateControlChannel / CreateDataChannel / OpenControlChannel / OpenDataChannel）が要る */
(function () {
'use strict';
var ME = '/Users/i-wada';
var SRC = ME + '/src/jinzai-rails';

var files = {};
files[ME + '/.aws/config'] = '[default]\nregion = ap-northeast-1\noutput = json\n';
files[ME + '/.aws/credentials'] = '[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[ME + '/support/inquiry.md'] =
'# サポートからの依頼\n\n' +
'先週の外部APIの障害（スコア算出APIのタイムアウト）のあと、\n' +
'相性スコアがまだ付いていない応募が何件残っているかを知りたい。\n' +
'企業の担当者に「いつまでに付くか」を説明したいので、いちばん古いものがいつの応募かも知りたい。\n';

files[ME + '/notes/console.md'] =
'# 本番の rails console（EC2 のころの手順）\n\n' +
'  ssh deploy@<サーバー> → cd /var/www/myapp/current → bin/rails console --sandbox\n\n' +
'ECS に移ってからはサーバーに入れない。ECS Exec を使うらしい（まだ誰も試していない）。\n';

/* タスクロールに足すポリシー。ECS Exec に要る ssmmessages の4つ */
files[SRC + '/infra/ecs-exec-policy.json'] =
'{\n' +
'  "Version": "2012-10-17",\n' +
'  "Statement": [\n' +
'    {\n' +
'      "Effect": "Allow",\n' +
'      "Action": [\n' +
'        "ssmmessages:CreateControlChannel",\n' +
'        "ssmmessages:CreateDataChannel",\n' +
'        "ssmmessages:OpenControlChannel",\n' +
'        "ssmmessages:OpenDataChannel"\n' +
'      ],\n' +
'      "Resource": "*"\n' +
'    }\n' +
'  ]\n' +
'}\n';

var CONSOLE = [
  { re: /^Entry\.where\(score: nil\)\.count$/, out: '=> 37' },
  { re: /^Entry\.count$/, out: '=> 182934' },
  { re: /^Entry\.where\(score: nil\)\.minimum\(:created_at\)$/, out: '=> 2026-11-13 04:51:02.000000000 UTC +00:00' },
  { re: /^Entry\.where\(score: nil\)\.maximum\(:created_at\)$/, out: '=> 2026-11-13 05:29:47.000000000 UTC +00:00' },
  { re: /^Entry\.where\(score: nil\)\.group\(:project_id\)\.count$/, out: '=> {8821 => 9, 8784 => 7, 8747 => 6, 8710 => 5, 8673 => 4, 8636 => 3, 8599 => 3}' },
  { re: /^Entry\.where\(score: nil\)\.pluck\(:id, :created_at\)\.first\(3\)$/, out: '=> [[180412, 2026-11-13 04:51:02 UTC], [180413, 2026-11-13 04:51:40 UTC], [180419, 2026-11-13 04:53:11 UTC]]' },
  { re: /update_all|delete_all|destroy/, blocked: true, out: '\x1b[33m[学習環境] このCASEはデータを見るだけです。書き換える式は実行しません。\x1b[0m' }
];

var EXEC = 'aws ecs execute-command --cluster jinzai-prod --task $T --container web --interactive --command "bin/rails console --sandbox"';
var PICK = "T=$(aws ecs list-tasks --cluster jinzai-prod --service-name jinzai-prod-web --query 'taskArns[0]' --output text | cut -d/ -f3)";

window.LFR.scenarios.add({
  id: 'case38',
  firstLook: { name: '実行中のタスクを見つける', cmd: 'aws ecs list-tasks --cluster jinzai-prod --service-name jinzai-prod-web',
    desc: 'タスクは、ECSがコンテナを動かす単位です。taskArns の一覧で、調べるサービスに属するタスクの識別子を確認します。' },
  level: 13,
  title: '本番の rails console を ECS Exec で開く',
  subtitle: 'ECS Exec を使えるようにして、コンテナの中で rails console --sandbox を開く',

  description:
'サポートから依頼が来ています（~/support/inquiry.md）。\n' +
'先週の外部APIの障害のあと、相性スコアが付いていない応募が何件残っているかを知りたいそうです。\n\n' +
'EC2 のころはサーバーに入って bin/rails console --sandbox を開いていました（~/notes/console.md）。\n' +
'ECS on Fargate では入るサーバーがありません。代わりに ECS Exec で、動いているコンテナの中でコマンドを実行します。\n\n' +
'web のタスクで rails console --sandbox を開き、件数と、いちばん古い応募の日時を調べてください。',

  learn: [
    { name: 'タスクを1つ選ぶ', cmd: PICK,
      desc: 'web のサービスの動いているタスクから1つ選び、タスクIDを変数 T に入れます。' },
    { name: 'aws ecs execute-command', cmd: EXEC,
      desc: 'コンテナの中でコマンドを実行します。--interactive が必要です。\n' +
            'つながると、手元の端末がコンテナの中のプロセス（ここでは rails console）とつながります。\n' +
            '見るだけの作業なので --sandbox を付けます（閉じるとすべての変更が取り消されます）。' },
    { name: 'タスクで ECS Exec が使えるか', cmd: "aws ecs describe-tasks --cluster jinzai-prod --tasks $T --query 'tasks[0].{exec:enableExecuteCommand,agents:containers[0].managedAgents}'",
      desc: 'enableExecuteCommand が true で、ExecuteCommandAgent が RUNNING なら使えます。\n' +
            'この設定はタスクを起動したときに決まり、動いているタスクにはあとから付けられません。' },
    { name: 'ECS Exec を有効にして入れ替える', cmd: 'aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --enable-execute-command --force-new-deployment',
      desc: '--enable-execute-command でサービスの設定を変え、--force-new-deployment で新しいタスクに入れ替えます。\n' +
            '入れ替わるまで待ってから（aws ecs wait services-stable）、新しいタスクを選び直します。' },
    { name: 'タスクロールを確かめる', cmd: "aws ecs describe-task-definition --task-definition jinzai-prod-web --query 'taskDefinition.{taskRole:taskRoleArn,executionRole:executionRoleArn}'",
      desc: 'タスクロールは、コンテナの中のアプリ（と ECS Exec のエージェント）が使う権限です。\n' +
            '実行ロール（ecsTaskExecutionRole）は、ECS がイメージを取ったりログを送ったりするのに使う権限で、別のものです。' },
    { name: 'ロールのポリシーを見る', cmd: 'aws iam list-role-policies --role-name jinzai-prod-task-role',
      desc: 'ロールに直接書いたポリシー（インラインポリシー）の名前の一覧です。\n' +
            '中身は aws iam get-role-policy --role-name ... --policy-name ... で見られます。' },
    { name: 'ポリシーを足す', cmd: 'aws iam put-role-policy --role-name jinzai-prod-task-role --policy-name ecs-exec --policy-document file://src/jinzai-rails/infra/ecs-exec-policy.json',
      desc: 'ECS Exec に要る ssmmessages の4つの権限を、タスクロールに足します。\n' +
            'file:// のあとは今いるディレクトリからのパスか、/ から始まるパスです。' },
    { name: 'console の中で数える', cmd: 'Entry.where(score: nil).count',
      desc: 'rails console の中で打つ式です。件数のほかに、minimum(:created_at) でいちばん古い日時も見られます。\n' +
            '終わったら exit で閉じます。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  awsEnv: function (sim) { return sim.railsOnEcs(); },

  rails: { version: '8.1.4.1', app: 'jinzai(prod)', console: { table: CONSOLE } },

  hints: [
    'まず、そのまま execute-command を試してください。\n\n' +
    '  ' + PICK + '\n' +
    '  ' + EXEC + '\n\n' +
    'エラーの文面に、何が足りないかが書いてあります。',

    'ECS Exec は起動したときに有効だったタスクでしか使えません。\n' +
    'サービスで有効にして、新しいタスクに入れ替えてください。\n\n' +
    '  aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --enable-execute-command --force-new-deployment\n' +
    '  aws ecs wait services-stable --cluster jinzai-prod --services jinzai-prod-web\n\n' +
    '入れ替わったら、タスクを選び直します（古いタスクIDのままでは入れません）。',

    'TargetNotConnectedException は、コンテナの中のエージェントが Session Manager につながれないときに出ます。\n' +
    'タスクロール（jinzai-prod-task-role）に ssmmessages の権限がありません。\n' +
    '~/src/jinzai-rails/infra/ecs-exec-policy.json を put-role-policy で足してから、もう一度つないでください。'
  ],

  probes: [
    { key: 'triedExec', label: 'ECS Exec を試して、有効になっていないと分かった',
      test: function (c, res) { return /execute-command/.test(c) && /not enabled/.test(res.stdout + res.stderr); } },
    { key: 'checkedTaskFlag', label: 'タスクの enableExecuteCommand を確かめた',
      test: function (c, res) { return /describe-tasks/.test(c) && /exec|enableExecuteCommand/.test(c + res.stdout) && /true|false/.test(res.stdout); } },
    { key: 'enabledExec', label: 'ECS Exec を有効にして、新しいタスクに入れ替えた',
      test: function (c, res) { return /update-service/.test(c) && /--enable-execute-command/.test(c) && /--force-new-deployment/.test(c) && res.exitCode === 0; } },
    { key: 'sawNotConnected', label: 'エージェントがつながれない（TargetNotConnectedException）と分かった',
      test: function (c, res) { return /execute-command/.test(c) && /TargetNotConnectedException/.test(res.stdout + res.stderr); } },
    { key: 'checkedTaskRole', label: 'タスクロールとその権限を確かめた',
      test: function (c, res) { return (/describe-task-definition/.test(c) && /taskRole/.test(res.stdout)) || /iam\s+(list-role-policies|get-role|get-role-policy|list-attached-role-policies)/.test(c); } },
    { key: 'addedPolicy', label: 'タスクロールに ssmmessages の権限を足した',
      test: function (c, res) { return /put-role-policy/.test(c) && /jinzai-prod-task-role/.test(c) && res.exitCode === 0; } },
    { key: 'openedConsole', label: 'ECS Exec で rails console を開いた',
      test: function (c, res) { return /execute-command/.test(c) && /Starting session/.test(res.stdout) && /rails console/.test(c); } },
    { key: 'usedSandbox', label: '--sandbox を付けて開いた',
      test: function (c, res) { return /execute-command/.test(c) && /--sandbox/.test(c) && /Starting session/.test(res.stdout); } },
    { key: 'countedEntries', label: 'スコアの無い応募を数えた',
      test: function (c, res) { return /Entry\.where\(score: nil\)\.(count|minimum)/.test(c) && /=>/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'triedExec',       weight: 6,  label: 'まず試して、エラーの文面を読んだ' },
    { key: 'enabledExec',     weight: 12, label: 'ECS Exec を有効にして新しいタスクに入れ替えた' },
    { key: 'checkedTaskFlag', weight: 6,  label: 'タスクで有効になったかを確かめた' },
    { key: 'sawNotConnected', weight: 6,  label: '2つ目のエラー（つながれない）を読んだ' },
    { key: 'checkedTaskRole', weight: 10, label: 'タスクロールの権限を確かめた' },
    { key: 'addedPolicy',     weight: 12, label: 'タスクロールに必要な権限を足した' },
    { key: 'usedSandbox',     weight: 8,  label: '--sandbox で開いた' },
    { key: 'countedEntries',  weight: 10, label: 'console で件数と日時を調べた' }
  ],

  question: {
    text: 'ECS Exec でコンテナに入れるようにするのに必要だったことは？',
    choices: [
      'セキュリティグループで、手元のPCからタスクへの 22 番ポートを開ける',
      'サービスで ECS Exec を有効にして新しいタスクに入れ替え、タスクロールに ssmmessages の権限を足す',
      '実行ロール（ecsTaskExecutionRole）に ssm:StartSession の権限を足す',
      '動いているタスクのまま、update-service --enable-execute-command だけを実行する'
    ],
    answer: 1,
    explain:
'最初の execute-command は、次のエラーで失敗します。\n\n' +
'  InvalidParameterException: The execute command failed because execute command was not enabled when the task was run ...\n\n' +
'ECS Exec はタスクを起動したときに有効だったかどうかで決まります。\n' +
'サービスで有効にしたうえで、新しいタスクに入れ替えます。\n\n' +
'  aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --enable-execute-command --force-new-deployment\n\n' +
'入れ替わったタスクで試すと、別のエラーになります。\n\n' +
'  TargetNotConnectedException: The execute command failed due to an internal error. Try again later.\n\n' +
'ECS Exec は Session Manager の仕組みを使います。コンテナの中で動くエージェントが、タスクロールの権限で\n' +
'Session Manager につなぎに行くので、タスクロールに ssmmessages の4つの権限が要ります。\n' +
'jinzai-prod-task-role にはポリシーが1つもありませんでした。\n\n' +
'  aws iam put-role-policy --role-name jinzai-prod-task-role --policy-name ecs-exec --policy-document file://...\n\n' +
'これでつながり、コンテナの中で rails console --sandbox が開きます。\n' +
'スコアの無い応募は 37 件で、いちばん古いのは障害が始まった 11月13日 04:51 の応募です。\n\n' +
'本番の IAM やサービスの設定は、ふつうは CloudFormation などのコードで管理しています。\n' +
'その場合は CLI で変えたままにせず、同じ変更をコードにも入れてから反映し直します。\n' +
'ECS Exec で開いたセッションは誰がいつ開いたかが CloudTrail に ExecuteCommand として残ります。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. Fargate のコンテナに入るには ECS Exec を使う。SSH は使わない\n' +
'2. ECS Exec は起動したときに決まる。有効にしたら新しいタスクに入れ替える\n' +
'3. 権限はタスクロール（アプリ側）と実行ロール（ECS 側）で分かれている。ECS Exec はタスクロール\n' +
'4. 本番の console は見るだけなら --sandbox で開く',
    wrong: [
'Fargate のタスクには SSH のサーバーが動いていませんし、ECS Exec はポートを開けずに使う仕組みです。\n' +
'コンテナの中のエージェントが外の Session Manager へつなぎに行くので、手元からタスクへの通信は要りません。',
null,
'実行ロール（ecsTaskExecutionRole）は、ECS がイメージを取ったり、ログを送ったり、secrets を読んだりするための権限です。\n' +
'ECS Exec のエージェントはコンテナの中で動き、タスクロールの権限を使います。\n' +
'また、要るのは ssm:StartSession ではなく ssmmessages の4つの権限です。',
'動いているタスクに、あとから ECS Exec を付けることはできません。\n' +
'update-service --enable-execute-command はサービスの設定を変えるだけで、\n' +
'それ以降に起動するタスクから使えるようになります。--force-new-deployment で入れ替える必要があります。'
    ]
  },

  route: {
    steps: [
      'タスクを1つ選び、execute-command を試す（not enabled のエラー）',
      'サービスで ECS Exec を有効にして、新しいタスクに入れ替える',
      '新しいタスクを選び直し、enableExecuteCommand が true かを確かめる',
      'もう一度試す（TargetNotConnectedException）',
      'タスクロールを確かめ、ssmmessages の権限を足す',
      'execute-command で rails console --sandbox を開き、件数と日時を調べて exit で閉じる'
    ],
    commands: [
      PICK,
      EXEC,
      'aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --enable-execute-command --force-new-deployment',
      'aws ecs wait services-stable --cluster jinzai-prod --services jinzai-prod-web',
      PICK,
      "aws ecs describe-tasks --cluster jinzai-prod --tasks $T --query 'tasks[0].{exec:enableExecuteCommand,agents:containers[0].managedAgents}'",
      EXEC,
      "aws ecs describe-task-definition --task-definition jinzai-prod-web --query 'taskDefinition.{taskRole:taskRoleArn,executionRole:executionRoleArn}'",
      'aws iam list-role-policies --role-name jinzai-prod-task-role',
      'aws iam put-role-policy --role-name jinzai-prod-task-role --policy-name ecs-exec --policy-document file://src/jinzai-rails/infra/ecs-exec-policy.json',
      EXEC,
      'Entry.where(score: nil).count',
      'Entry.where(score: nil).minimum(:created_at)',
      'exit'
    ],
    note:
'2つのエラーはどちらも ECS Exec を初めて使うときによく出ます。\n' +
'1つ目は「起動したときに有効だったか」、2つ目は「タスクロールの権限」です。\n' +
'エラーの文面を読み、どちらの問題かを切り分けてから直してください。'
  }
});
})();
