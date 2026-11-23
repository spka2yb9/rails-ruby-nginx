/* CASE 37 — マイグレーションを run-task で一度だけ流す（同僚の run-task はセキュリティグループを付け忘れて DB に届かなかった）
   run-task で --network-configuration の securityGroups を省くと、VPC の default のセキュリティグループが付く。
   DB のセキュリティグループ（jinzai-prod-db-sg）は、アプリのセキュリティグループ（jinzai-prod-app-sg）からの 3306 だけを許している */
(function () {
'use strict';
var ME = '/Users/i-wada';
var SRC = ME + '/src/jinzai-rails';
var MIN = 60000;
var TAG = 'd4e5f6a';
var VERSION = '20261120093000';

var files = {};
files[ME + '/.aws/config'] = '[default]\nregion = ap-northeast-1\noutput = json\n';
files[ME + '/.aws/credentials'] = '[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[ME + '/notes/release-d4e5f6a.md'] =
'# リリース d4e5f6a の手順（応募の取り下げ機能）\n\n' +
'1. マイグレーションを流す（entries に withdrawn_at を足す）\n' +
'   新しいコードは withdrawn_at を読むので、web を更新する前に流しておくこと\n' +
'2. web のサービスを jinzai-prod-web:4 に更新する\n\n' +
'## 1. を実行したときのメモ（佐藤）\n' +
'下のコマンドで run-task したら、タスクが exit code 1 で止まった。ログはまだ見ていない。\n\n' +
'  SUBNETS=$(aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web \\\n' +
"      --query 'services[0].networkConfiguration.awsvpcConfiguration.subnets' --output text | tr '\\t' ',')\n" +
'  aws ecs run-task --cluster jinzai-prod --task-definition jinzai-prod-web:4 --launch-type FARGATE \\\n' +
'      --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],assignPublicIp=DISABLED}" \\\n' +
'      --overrides \'{"containerOverrides":[{"name":"web","command":["bin/rails","db:migrate"]}]}\'\n';

files[SRC + '/db/migrate/' + VERSION + '_add_withdrawn_at_to_entries.rb'] =
'class AddWithdrawnAtToEntries < ActiveRecord::Migration[8.1]\n' +
'  def change\n' +
'    add_column :entries, :withdrawn_at, :datetime\n' +
'    add_index :entries, :withdrawn_at\n' +
'  end\n' +
'end\n';

files[SRC + '/config/database.yml'] =
'production:\n' +
'  adapter: mysql2\n' +
'  host: <%= ENV["DB_HOST"] %>\n' +
'  database: jinzai_production\n' +
'  username: jinzai\n' +
'  password: <%= ENV["DB_PASSWORD"] %>\n' +
'  connect_timeout: 10\n' +
'  pool: <%= ENV.fetch("RAILS_MAX_THREADS", 5) %>\n';

/* Rails のマイグレーションの見出し（ActiveRecord::Migration#announce と同じく、79文字まで = で埋める） */
function announce(text) { return '== ' + text + ' ' + new Array(Math.max(0, 75 - text.length) + 1).join('='); }
function migrateLogs(host) {
  var name = VERSION + ' AddWithdrawnAtToEntries';
  var refused = "Can't connect to MySQL server on '" + host + ":3306' (110)";
  return {
    requiresSecurityGroup: 'jinzai-prod-app-sg',
    ok: { afterMs: 9000, code: 0, logs: [
      announce(name + ': migrating'),
      '-- add_column(:entries, :withdrawn_at, :datetime)',
      '   -> 0.0384s',
      '-- add_index(:entries, :withdrawn_at)',
      '   -> 0.9126s',
      announce(name + ': migrated (0.9512s)')
    ] },
    unreachable: { afterMs: 12000, code: 1, logs: [
      'bin/rails aborted!',
      /* Rails 8.1 の mysql2 アダプターは、接続できない（2003）ときに DatabaseConnectionError.hostname_error を投げる */
      'ActiveRecord::DatabaseConnectionError: There is an issue connecting with your hostname: ' + host + '. (ActiveRecord::DatabaseConnectionError)',
      '',
      'Please check your database configuration and ensure there is a valid connection to your database.',
      '',
      'Caused by:',
      'Mysql2::Error::ConnectionError: ' + refused + ' (Mysql2::Error::ConnectionError)',
      '',
      'Tasks: TOP => db:migrate',
      '(See full trace by running task with --trace)'
    ] }
  };
}

var NET = "--network-configuration \"awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SG],assignPublicIp=DISABLED}\"";
var OVERRIDES = "--overrides '{\"containerOverrides\":[{\"name\":\"web\",\"command\":[\"bin/rails\",\"db:migrate\"]}]}'";
var RUN = "T=$(aws ecs run-task --cluster jinzai-prod --task-definition jinzai-prod-web:4 --launch-type FARGATE " + NET + ' ' + OVERRIDES + " --query 'tasks[0].taskArn' --output text)";

window.LFR.scenarios.add({
  id: 'case37',
  level: 13,
  title: 'マイグレーションを run-task で一度だけ流す',
  subtitle: '止まった一度きりのタスクのログから原因を読み、ネットワークの設定を直して流し直す',

  description:
'次のリリース（コミット d4e5f6a）は、応募の取り下げ機能です。\n' +
'entries テーブルに withdrawn_at を足すマイグレーションがあり、新しいコードはこの列を読みます。\n' +
'そのため、web を更新する前にマイグレーションを流しておく必要があります。\n\n' +
'Fargate ではサービスとは別に、タスク定義から一度きりのタスクを起動できます（run-task）。\n' +
'同僚が run-task で bin/rails db:migrate を流そうとしましたが、タスクは exit code 1 で止まりました。\n' +
'そのときのメモが ~/notes/release-d4e5f6a.md にあります。\n\n' +
'失敗の原因を突き止めて、マイグレーションを流し、web を jinzai-prod-web:4 に更新してください。',

  learn: [
    { name: '一度きりのタスクを探す', cmd: 'aws ecs list-tasks --cluster jinzai-prod --family jinzai-prod-web --desired-status STOPPED',
      desc: 'run-task で起動したタスクはサービスに属さないので、--service-name ではなく --family（タスク定義のファミリー名）で探します。' },
    { name: '終了コードと差し替えたコマンド', cmd: "aws ecs describe-tasks --cluster jinzai-prod --tasks <タスクID> --query 'tasks[0].{exitCode:containers[0].exitCode,command:overrides.containerOverrides[0].command,group:group}'",
      desc: 'overrides に、run-task の --overrides で差し替えたコマンドが残っています。\n' +
            'group が family:jinzai-prod-web なら、サービスではなく run-task で起動したタスクです。' },
    { name: 'そのタスクのログ', cmd: 'aws logs tail /ecs/jinzai-prod-web --since 1h --log-stream-names web/web/<タスクID>',
      desc: '一度きりのタスクもタスク定義の logConfiguration どおりにログを書きます。\n' +
            'ストリームの名前はサービスのタスクと同じ「web/web/タスクID」です。' },
    { name: 'サービスのネットワークの設定', cmd: "aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].networkConfiguration.awsvpcConfiguration'",
      desc: 'サービスのタスクがどのサブネットに置かれ、どのセキュリティグループを付けているかです。\n' +
            'run-task でも、同じ設定を --network-configuration に書きます。' },
    { name: 'DB のセキュリティグループ', cmd: "aws ec2 describe-security-groups --filters Name=group-name,Values=jinzai-prod-db-sg --query 'SecurityGroups[0].IpPermissions'",
      desc: 'DB への 3306 番の通信を、どこから許しているかです。\n' +
            'UserIdGroupPairs に書いたセキュリティグループを付けたものだけが、DB に届きます。' },
    { name: '値を変数に入れる', cmd: "SUBNETS=$(aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].networkConfiguration.awsvpcConfiguration.subnets' --output text | tr '\\t' ',')",
      desc: 'サブネットの ID を、カンマ区切りで変数に入れます。セキュリティグループも同じように SG に入れます。\n\n' +
            "  SG=$(aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].networkConfiguration.awsvpcConfiguration.securityGroups[0]' --output text)" },
    { name: 'aws ecs run-task', cmd: RUN,
      desc: '--overrides でコンテナのコマンドを bin/rails db:migrate に差し替えて、一度だけ動かします。\n' +
            '起動したタスクの ARN を変数 T に入れておくと、このあとの確認に使えます。' },
    { name: '止まるまで待つ', cmd: 'aws ecs wait tasks-stopped --cluster jinzai-prod --tasks $T',
      desc: 'タスクが STOPPED になるまで待ちます。終わったら、終了コードが 0 かを describe-tasks で確かめます。\n' +
            '待つだけでは、成功したか失敗したかは分かりません。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  awsEnv: function (sim) {
    var env = sim.railsOnEcs();
    var host = env.dbInstances[0].endpointAddress;
    sim.registerRevision(env, 'web', { tag: TAG, behavior: { commands: { 'db:migrate': migrateLogs(host) } } }, Date.now() - 50 * MIN);
    /* 同僚の run-task（securityGroups を省いたので default が付いた） */
    var at = Date.now() - 12 * MIN;
    sim.runOneOff(env, { taskDefinition: 'jinzai-prod-web:4', command: ['bin/rails', 'db:migrate'], at: at });
    sim.advanceTo(env, at);
    return env;
  },

  hints: [
    'まず、同僚の run-task がなぜ止まったのかを見ます。サービスに属さないタスクは --family で探します。\n\n' +
    '  aws ecs list-tasks --cluster jinzai-prod --family jinzai-prod-web --desired-status STOPPED',

    'そのタスクのログの Caused by: の行に「Can\'t connect to MySQL server ... (110)」と出ています。110 は接続が時間切れになったという意味です。\n' +
    'DB に届いていません。サービスのタスクと、ネットワークの設定を比べてください。\n\n' +
    "  aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].networkConfiguration.awsvpcConfiguration'",

    '同僚のコマンドには securityGroups がありません。省くと VPC の default のセキュリティグループが付きます。\n' +
    'サービスと同じ jinzai-prod-app-sg を付けて流し直し、終了コードが 0 になったら web を更新してください。'
  ],

  probes: [
    { key: 'foundFailedTask', label: '同僚の一度きりのタスクを見つけ、終了コード 1 を確かめた',
      test: function (c, res) { return /describe-tasks/.test(c) && /db:migrate/.test(res.stdout) && /exitCode"?:\s*1\b/.test(res.stdout); } },
    { key: 'readConnectError', label: 'ログで DB に届いていないことを確かめた',
      test: function (c, res) { return /aws\s+logs/.test(c) && /Can't connect to MySQL server/.test(res.stdout); } },
    { key: 'comparedNetwork', label: 'サービスのネットワークの設定を確かめた',
      test: function (c, res) { return /describe-services/.test(c) && /networkConfiguration/.test(c) && /sg-/.test(res.stdout); } },
    { key: 'checkedDbSg', label: 'DB のセキュリティグループが許している相手を確かめた',
      test: function (c, res) { return /describe-security-groups/.test(c) && /3306/.test(res.stdout); } },
    { key: 'ranWithSg', label: 'セキュリティグループを付けて run-task した',
      test: function (c, res) { return /run-task/.test(c) && /securityGroups=/.test(c) && /db:migrate/.test(c) && res.exitCode === 0; } },
    { key: 'confirmedExit0', label: 'マイグレーションのタスクが終了コード 0 で終わったと確かめた',
      test: function (c, res) { return (/describe-tasks/.test(c) && /exitCode"?:\s*0\b|^0\s*$/m.test(res.stdout)) || (/aws\s+logs/.test(c) && /AddWithdrawnAtToEntries: migrated/.test(res.stdout)); } },
    { key: 'deployedWeb', label: 'マイグレーションのあとで web を :4 に更新した',
      test: function (c, res, rt) { return /update-service/.test(c) && /jinzai-prod-web:4\b|--task-definition jinzai-prod-web\b/.test(c) && res.exitCode === 0 && !!rt.investigation.facts.confirmedExit0; } }
  ],

  evidence: [
    { key: 'foundFailedTask',  weight: 10, label: '止まった一度きりのタスクを見つけた' },
    { key: 'readConnectError', weight: 14, label: 'ログで DB への接続が時間切れになったと読んだ' },
    { key: 'comparedNetwork',  weight: 10, label: 'サービスのネットワークの設定と比べた' },
    { key: 'checkedDbSg',      weight: 8,  label: 'DB のセキュリティグループを確かめた' },
    { key: 'ranWithSg',        weight: 10, label: '正しいセキュリティグループで流し直した' },
    { key: 'confirmedExit0',   weight: 12, label: '終了コードまで確かめた' },
    { key: 'deployedWeb',      weight: 6,  label: 'マイグレーションのあとで web を更新した' }
  ],

  question: {
    text: '同僚の run-task が失敗した理由は？',
    choices: [
      'マイグレーションのコード（add_column）に誤りがある',
      'run-task で securityGroups を省いたので VPC の default のセキュリティグループが付き、DB のセキュリティグループが許していない通信になった',
      'タスクロールに、RDS に接続する IAM の権限が無い',
      'Fargate のタスクはプライベートサブネットから DB に届かない'
    ],
    answer: 1,
    explain:
'止まったタスクを --family で探し、終了コードとログを見ます。\n\n' +
'  exitCode: 1\n' +
'  command:  ["bin/rails", "db:migrate"]\n\n' +
'  bin/rails aborted!\n' +
"  ActiveRecord::DatabaseConnectionError: There is an issue connecting with your hostname: jinzai-prod-db.....\n" +
'  ...\n' +
'  Caused by:\n' +
"  Mysql2::Error::ConnectionError: Can't connect to MySQL server on 'jinzai-prod-db....:3306' (110)\n\n" +
'マイグレーションの中身に入る前に、DB への接続で止まっています。Rails のメッセージはホスト名を挙げるだけなので、Caused by: の元のエラーを読みます。\n' +
'110 は接続の時間切れです。\n' +
'database.yml の connect_timeout: 10 のとおり、10秒ほど待って諦めています。\n\n' +
'サービスのタスクは同じサブネットから DB に届いているので、違いはセキュリティグループです。\n' +
'同僚のコマンドには securityGroups が無く、そのときは VPC の default のセキュリティグループが付きます。\n' +
'DB のセキュリティグループは jinzai-prod-app-sg からの 3306 だけを許しているので、届きません。\n\n' +
'サービスと同じ設定で流し直します。\n\n' +
"  SUBNETS=$(aws ecs describe-services ... --query '...subnets' --output text | tr '\\t' ',')\n" +
"  SG=$(aws ecs describe-services ... --query '...securityGroups[0]' --output text)\n" +
'  T=$(aws ecs run-task ... --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SG],...}" ...)\n' +
'  aws ecs wait tasks-stopped --cluster jinzai-prod --tasks $T\n\n' +
'待ったあとで、終了コードが 0 であることを describe-tasks で確かめます。\n' +
'wait tasks-stopped は止まるまで待つだけで、成功したかどうかは教えてくれません。\n' +
'終了コードが 0 なら、web を jinzai-prod-web:4 に更新します。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. run-task はタスク定義から一度きりのタスクを起動する。--overrides でコマンドを差し替える\n' +
'2. --network-configuration はサービスの設定を写す。セキュリティグループを省くと default が付く\n' +
'3. 一度きりのタスクの結果は終了コード（describe-tasks）とログ（--log-stream-names）で確かめる\n' +
'4. 新しい列を読むコードはマイグレーションのあとで出す',
    wrong: [
'ログは「bin/rails aborted!」のあと、すぐに DB への接続のエラーになっています。\n' +
'add_column を実行する前に止まっているので、マイグレーションのコードまでたどり着いていません。',
null,
'このアプリは DB にユーザー名とパスワード（DB_PASSWORD）で接続していて、IAM の認証は使っていません。\n' +
'権限が足りないなら「Access denied」になります。\n\n' +
'今回のエラーは接続の時間切れ（110）なので、そもそも DB まで通信が届いていません。',
'同じプライベートサブネットにいるサービスのタスクは、DB に接続できています。\n' +
'サブネットではなくタスクに付いているセキュリティグループの違いです。'
    ]
  },

  route: {
    steps: [
      'メモで、同僚がどのコマンドを実行したかを確かめる',
      '止まった一度きりのタスクを --family で探し、終了コードを見る',
      'そのタスクのログで、DB への接続が時間切れになったと読む',
      'サービスのネットワークの設定と、DB のセキュリティグループを確かめる',
      'サブネットとセキュリティグループを変数に入れ、run-task で流し直す',
      '止まるまで待ち、終了コードが 0 だと確かめる',
      'web を jinzai-prod-web:4 に更新する'
    ],
    commands: [
      'cat ~/notes/release-d4e5f6a.md',
      "ID=$(aws ecs list-tasks --cluster jinzai-prod --family jinzai-prod-web --desired-status STOPPED --query 'taskArns[0]' --output text | cut -d/ -f3)",
      "aws ecs describe-tasks --cluster jinzai-prod --tasks $ID --query 'tasks[0].{exitCode:containers[0].exitCode,command:overrides.containerOverrides[0].command,group:group}'",
      'aws logs tail /ecs/jinzai-prod-web --since 1h --log-stream-names web/web/$ID',
      "aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].networkConfiguration.awsvpcConfiguration'",
      "aws ec2 describe-security-groups --filters Name=group-name,Values=jinzai-prod-db-sg --query 'SecurityGroups[0].IpPermissions'",
      "SUBNETS=$(aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].networkConfiguration.awsvpcConfiguration.subnets' --output text | tr '\\t' ',')",
      "SG=$(aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].networkConfiguration.awsvpcConfiguration.securityGroups[0]' --output text)",
      RUN,
      'aws ecs wait tasks-stopped --cluster jinzai-prod --tasks $T',
      "aws ecs describe-tasks --cluster jinzai-prod --tasks $T --query 'tasks[0].containers[0].exitCode'",
      'aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --task-definition jinzai-prod-web:4'
    ],
    note:
'DB のセキュリティグループに default を足して通す、という直し方はしません。\n' +
'default は VPC の中のいろいろなものに付く可能性があり、DB に届く相手が広がってしまいます。\n' +
'run-task の側で、サービスと同じセキュリティグループを付けます。'
  }
});
})();
