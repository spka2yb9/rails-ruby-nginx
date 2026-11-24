/* CASE 36 — デプロイが終わらず、新しいタスクが入れ替わり続ける（force_ssl で /up のヘルスチェックが 301）
   production.rb は Rails 8.1 のひな形（railties の production.rb.tt）をもとにしている。
   ひな形には「Skip http-to-https redirect for the default health check endpoint.」の行がコメントで入っている */
(function () {
'use strict';
var ME = '/Users/i-wada';
var SRC = ME + '/src/jinzai-rails';
var MIN = 60000;

var files = {};
files[ME + '/.aws/config'] = '[default]\nregion = ap-northeast-1\noutput = json\n';
files[ME + '/.aws/credentials'] = '[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[ME + '/release-notes.md'] =
'# リリースノート\n\n' +
'## c1d2e3f（20分前にデプロイ）\n' +
'- 本番で HTTPS を強制する（config.force_ssl = true）\n' +
'  セキュリティ診断で「http でもページが表示される」と指摘されたため\n';

files[SRC + '/config/environments/production.rb'] =
'require "active_support/core_ext/integer/time"\n\n' +
'Rails.application.configure do\n' +
'  config.enable_reloading = false\n' +
'  config.eager_load = true\n' +
'  config.consider_all_requests_local = false\n\n' +
'  # Assume all access to the app is happening through a SSL-terminating reverse proxy.\n' +
'  # config.assume_ssl = true\n\n' +
'  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.\n' +
'  config.force_ssl = true   # ← c1d2e3f でコメントを外した\n\n' +
'  # Skip http-to-https redirect for the default health check endpoint.\n' +
'  # config.ssl_options = { redirect: { exclude: ->(request) { request.path == "/up" } } }\n\n' +
'  # Log to STDOUT with the current request id as a default log tag.\n' +
'  config.log_tags = [ :request_id ]\n' +
'  config.logger   = ActiveSupport::TaggedLogging.logger(STDOUT)\n\n' +
'  # Prevent health checks from clogging up the logs.\n' +
'  config.silence_healthcheck_path = "/up"\n' +
'end\n';

window.LFR.scenarios.add({
  id: 'case36',
  level: 13,
  title: 'デプロイが終わらず、新しいタスクが入れ替わり続ける',
  subtitle: 'ヘルスチェックの結果と止まった理由から、/up が 301 を返していることを突き止める',

  description:
'20分前に web のリリース（コミット c1d2e3f）をデプロイしました（~/release-notes.md）。\n\n' +
'サイトは普通に見えていますが、デプロイがいつまでも終わりません。\n' +
'サービスのイベントを見た同僚によると、「新しいタスクが起動しては止まり、また起動している」そうです。\n\n' +
'新しいタスクが止められる理由を AWS CLI で突き止め、サービスを安定した状態に戻してください。\n' +
'そのうえで、コードをどう直せばよいかを考えてください。アプリのソースは ~/src/jinzai-rails にあります。',

  learn: [
    { name: 'サービスのイベント', cmd: "aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].events[0:10].message' --output text",
      desc: '新しい順に並びます。タスクが止められた理由が、イベントに書かれていることがあります。\n' +
            '「is unhealthy in (target-group ...) due to (reason ...)」は、ALB のヘルスチェックの結果です。' },
    { name: 'ターゲットグループの ARN を変数に入れる', cmd: "TG=$(aws elbv2 describe-target-groups --names jinzai-prod-web-tg --query 'TargetGroups[0].TargetGroupArn' --output text)",
      desc: 'このあとのコマンドで使う ARN を、変数 TG に入れておきます。' },
    { name: 'ターゲットのヘルスチェックの結果', cmd: "aws elbv2 describe-target-health --target-group-arn $TG --query 'TargetHealthDescriptions[].{ip:Target.Id,state:TargetHealth.State,reason:TargetHealth.Reason,description:TargetHealth.Description}' --output table",
      desc: 'ターゲット（タスクの IP）ごとの状態です。initial は最初のヘルスチェックの途中、\n' +
            'unhealthy なら Reason と Description に理由が出ます。\n' +
            'Target.ResponseCodeMismatch は「期待したステータスコードと違う応答が返った」という意味です。\n' +
            '（$TG は CASE33 と同じく、describe-target-groups で取り出したターゲットグループの ARN）' },
    { name: 'ヘルスチェックの設定', cmd: "aws elbv2 describe-target-groups --names jinzai-prod-web-tg --query 'TargetGroups[0].{protocol:HealthCheckProtocol,port:HealthCheckPort,path:HealthCheckPath,matcher:Matcher.HttpCode}'",
      desc: 'ALB がどのプロトコル・ポート・パスでヘルスチェックを送り、どのステータスコードを正常とみなすかです。\n' +
            'traffic-port はターゲットのポート（3000）を指します。' },
    { name: '止められたタスクの理由', cmd: "aws ecs describe-tasks --cluster jinzai-prod --tasks <タスクID> --query 'tasks[0].{stopCode:stopCode,reason:stoppedReason}'",
      desc: 'ヘルスチェックに落ちて ECS が止めたタスクは、stopCode が ServiceSchedulerInitiated、\n' +
            'stoppedReason が「Task failed ELB health checks in (target-group ...)」になります。' },
    { name: '本番の設定を読む', cmd: 'grep -n "ssl" ~/src/jinzai-rails/config/environments/production.rb',
      desc: 'force_ssl・assume_ssl・ssl_options の3つがどうなっているかを見ます。' },
    { name: '前のリビジョンに戻す', cmd: 'aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --task-definition jinzai-prod-web:3',
      desc: '直したイメージを作るまでの間、動いていたリビジョンに戻しておきます。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  awsEnv: function (sim) {
    var env = sim.railsOnEcs();
    sim.deploy(env, 'web', { tag: 'c1d2e3f', behavior: { healthCode: 301 } }, Date.now() - 20 * MIN);
    sim.advanceTo(env, Date.now() - 20 * MIN);
    return env;
  },

  hints: [
    'まずサービスのイベントで、タスクが止められた理由を探してください。\n\n' +
    "  aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].events[0:10].message' --output text",

    'イベントに「Health checks failed with these codes: [301]」と出ています。\n' +
    'ALB のヘルスチェックの設定と、ターゲットごとの結果を見てください。\n\n' +
    "  aws elbv2 describe-target-groups --names jinzai-prod-web-tg --query 'TargetGroups[0].{protocol:HealthCheckProtocol,path:HealthCheckPath,matcher:Matcher.HttpCode}'",

    'ヘルスチェックは HTTP で /up に送られ、200 だけを正常とみなします。\n' +
    '301 は http から https へのリダイレクトです。今回のリリースで何を変えたかを production.rb で確かめ、\n' +
    'まずサービスを :3 に戻してください。'
  ],

  probes: [
    { key: 'sawUnhealthyEvent', label: 'イベントでヘルスチェックの失敗（301）を見つけた',
      test: function (c, res) { return /describe-services/.test(c) && /Health checks failed with these codes: \[301\]/.test(res.stdout); } },
    { key: 'checkedTargetHealth', label: 'ターゲットごとのヘルスチェックの結果を見た',
      test: function (c, res) { return /describe-target-health/.test(c) && /healthy|initial/.test(res.stdout); } },
    { key: 'checkedHealthSettings', label: 'ヘルスチェックの設定（HTTP・/up・200）を確かめた',
      test: function (c, res) { return /describe-target-groups/.test(c) && /\/up/.test(res.stdout); } },
    { key: 'sawElbStopReason', label: 'ECS がヘルスチェックの失敗でタスクを止めたと確かめた',
      test: function (c, res) { return /describe-tasks/.test(c) && /Task failed ELB health checks/.test(res.stdout); } },
    { key: 'readProductionRb', label: 'production.rb で force_ssl を確かめた',
      test: function (c, res) { return /production\.rb/.test(c) && /force_ssl/.test(res.stdout); } },
    { key: 'rolledBack', label: '前のリビジョン（:3）に戻した',
      test: function (c, res) { return /update-service/.test(c) && /jinzai-prod-web:3\b/.test(c) && res.exitCode === 0; } }
  ],

  evidence: [
    { key: 'sawUnhealthyEvent',     weight: 14, label: 'イベントで「301 でヘルスチェックに失敗」を見つけた' },
    { key: 'checkedTargetHealth',   weight: 8,  label: 'ターゲットの状態を確かめた' },
    { key: 'checkedHealthSettings', weight: 10, label: 'ヘルスチェックが HTTP で /up に送られ、200 を期待していると確かめた' },
    { key: 'sawElbStopReason',      weight: 8,  label: '止まった理由が ELB のヘルスチェックだと確かめた' },
    { key: 'readProductionRb',      weight: 14, label: '今回の変更（force_ssl）を設定ファイルで確かめた' },
    { key: 'rolledBack',            weight: 10, label: '前のリビジョンに戻した' }
  ],

  question: {
    text: 'デプロイが終わらない原因は？',
    choices: [
      '新しいイメージで Rails が起動できず、コンテナが落ちている',
      'force_ssl によって、ALB が HTTP で送る /up のヘルスチェックが 301 になり、unhealthy と判定されたタスクを ECS が入れ替え続けている',
      'ALB のセキュリティグループがタスクの 3000 番ポートへの通信を許していない',
      'ヘルスチェックの猶予期間（60秒）が短く、Rails の起動が間に合っていない'
    ],
    answer: 1,
    explain:
'サービスのイベントに、ECS がタスクを止めた理由が出ています。\n\n' +
'  (task ...) (port 3000) is unhealthy in (target-group ...) due to (reason Health checks failed with these codes: [301]).\n' +
'  has stopped 1 running tasks: (task ...).\n\n' +
'止まったタスクの stoppedReason も「Task failed ELB health checks」です。\n' +
'ALB のヘルスチェックの設定を見ると、HTTP で /up に送り、200 だけを正常とみなしています。\n\n' +
'301 は Rails の force_ssl が返す、http から https へのリダイレクトです。\n' +
'利用者のリクエストは ALB の HTTPS で受けたあと、「元は https だった」と分かる形で Rails に届くので、リダイレクトされません。\n' +
'一方、ヘルスチェックは ALB がタスクの 3000 番へ HTTP で直接送るリクエストなので、Rails には http のリクエストに見えます。\n' +
'そのため /up に届く前に 301 が返り、200 を期待するヘルスチェックに落ちています。\n\n' +
'新しいタスクが healthy にならないので、ECS は止めて入れ替え続け、前のタスクを止めません。\n' +
'サイトが見えているのは前のリビジョン（:3）のタスクが動き続けているからで、デプロイは終わりません。\n\n' +
'まずサービスを :3 に戻します。そのうえで、コードを直す方法は2つあります。\n' +
'どちらも Rails 8.1 の production.rb のひな形に、コメントとして入っている設定です。\n\n' +
'  config.assume_ssl = true\n' +
'    TLS を前段（ALB）で終えている前提で、すべてのリクエストを https として扱う\n' +
'  config.ssl_options = { redirect: { exclude: ->(request) { request.path == "/up" } } }\n' +
'    ヘルスチェックの /up だけ、リダイレクトから外す\n\n' +
'ヘルスチェックの正常とみなすステータスコードを 200-399 に広げる、という直し方はしません。\n' +
'301 は /up に届く前に返るので、アプリが動いているかを確かめられなくなるからです。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. ヘルスチェックに落ちたタスクは、ECS が止めて入れ替える。デプロイは前のタスクを残したまま終わらない\n' +
'2. 理由はサービスのイベントと describe-target-health の Reason / Description に出る\n' +
'3. ヘルスチェックは利用者のリクエストとは別の、ALB からの HTTP のリクエスト。https を前提にした設定の影響を受ける\n' +
'4. ステータスコードの基準をゆるめるのではなくヘルスチェックのパスが正しく 200 を返すように直す',
    wrong: [
'Rails が起動できずに落ちたのなら、stopCode は EssentialContainerExited になり、終了コードが付きます。\n\n' +
'今回の stoppedReason は「Task failed ELB health checks」です。\n' +
'ログにも Puma が起動したことが出ていて、ヘルスチェックには 301 という応答が返っています。\n' +
'Rails は動いていて、応答の中身が期待と違うのが問題です。',
null,
'通信が届かないなら、ヘルスチェックは時間切れになり、理由は Target.Timeout（Request timed out）になります。\n\n' +
'今回は 301 という応答が返っているので、通信は届いています。\n' +
'同じセキュリティグループを使う前のリビジョンのタスクは healthy です。',
'猶予期間が短いなら、起動が終わる前に応答が無いか、エラーになります。\n\n' +
'今回は 301 という応答がはっきり返っていて、猶予期間を延ばしても同じ応答が返り続けます。\n' +
'起動の速さではなく応答の中身の問題です。'
    ]
  },

  route: {
    steps: [
      'リリースノートで、今回何を変えたかを確かめる（force_ssl）',
      'サービスのイベントで、タスクが止められた理由を探す（301 でヘルスチェックに失敗）',
      'ターゲットの状態と、ヘルスチェックの設定（HTTP・/up・200）を確かめる',
      '止まったタスクの理由（Task failed ELB health checks）を確かめる',
      'production.rb で force_ssl と、ひな形にある2つの直し方を確かめる',
      'サービスを :3 に戻す'
    ],
    commands: [
      'cat ~/release-notes.md',
      "aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].events[0:10].message' --output text",
      "TG=$(aws elbv2 describe-target-groups --names jinzai-prod-web-tg --query 'TargetGroups[0].TargetGroupArn' --output text)",
      "aws elbv2 describe-target-health --target-group-arn $TG --query 'TargetHealthDescriptions[].{ip:Target.Id,state:TargetHealth.State,reason:TargetHealth.Reason,description:TargetHealth.Description}' --output table",
      "aws elbv2 describe-target-groups --names jinzai-prod-web-tg --query 'TargetGroups[0].{protocol:HealthCheckProtocol,port:HealthCheckPort,path:HealthCheckPath,matcher:Matcher.HttpCode}'",
      "ID=$(aws ecs list-tasks --cluster jinzai-prod --service-name jinzai-prod-web --desired-status STOPPED --query 'taskArns[0]' --output text | cut -d/ -f3)",
      "aws ecs describe-tasks --cluster jinzai-prod --tasks $ID --query 'tasks[0].{stopCode:stopCode,reason:stoppedReason}'",
      'grep -n "ssl" ~/src/jinzai-rails/config/environments/production.rb',
      'aws ecs update-service --cluster jinzai-prod --service jinzai-prod-web --task-definition jinzai-prod-web:3',
      'aws ecs wait services-stable --cluster jinzai-prod --services jinzai-prod-web'
    ],
    note:
'このCASEは教科書の「ロードバランサー配下の構成と障害対応」の章にある「TLS の終端と force_ssl のリダイレクトの繰り返し」と「ヘルスチェック（/up）」を、\n' +
'実際のデプロイで起きる形にしたものです。\n' +
'（学習環境の ALB は HTTP:80 のリスナーだけを再現しています。本番では HTTPS:443 で TLS を終えて、HTTP でタスクへ送ります）'
  }
});
})();
