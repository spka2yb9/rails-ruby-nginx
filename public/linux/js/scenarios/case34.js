/* CASE 34 — CloudWatch Logs で、通知のリクエストを追う（Fargate のコンテナのログ）
   ログは CASE を開いた時刻を基準に、シミュレーター（vendor/aws-sim.min.js）のロググループへ書き込む。
   Rails 8.1 の production は config.logger = ActiveSupport::TaggedLogging.logger(STDOUT) なので、
   1行は「[request_id] メッセージ」の形で標準出力に出て、awslogs が CloudWatch Logs へ送る。 */
(function () {
'use strict';
var ME = '/Users/i-wada';
var SRC = ME + '/src/jinzai-rails';
var RID = '7b2e9c41-5d3a-4f86-b0e2-6c1d8a4f9e37';
var MIN = 60000;

/* 応募の失敗（何分前か）。web の2つのタスクに交互に届く。通知の request_id は8分前のもの */
var FAILS = [38, 35, 32, 29, 26, 23, 20, 17, 14, 11, 8, 5];
/* 失敗が始まる前の応募は成功している */
var OKS = [55, 47, 41];

var files = {};

files[ME + '/.aws/config'] =
'[default]\n' +
'region = ap-northeast-1\n' +
'output = json\n';

files[ME + '/.aws/credentials'] =
'[default]\n' +
'aws_access_key_id = AKIAIOSFODNN7EXAMPLE\n' +
'aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[SRC + '/app/controllers/entries_controller.rb'] =
'class EntriesController < ApplicationController\n' +
'  def create\n' +
'    @project = Project.find(params[:project_id])\n' +
'    @entry = @project.entries.build(entry_params.merge(user: current_user))\n' +
'    # 応募の時点で相性スコアを外部APIから取って保存する（応答を待ってから画面を返す）\n' +
'    @entry.score = ScoutScoreClient.new.fetch(@entry)\n' +
'    if @entry.save\n' +
'      EntryMailer.with(entry: @entry).completed.deliver_later\n' +
'      redirect_to project_path(@project), notice: "応募しました"\n' +
'    else\n' +
'      render "projects/show", status: :unprocessable_entity\n' +
'    end\n' +
'  end\n' +
'end\n';

files[SRC + '/app/clients/scout_score_client.rb'] =
'# 応募者と求人の相性スコアを、外部のスコア算出APIから取る\n' +
'class ScoutScoreClient\n' +
'  ENDPOINT = URI("https://api.scout-score.example/v1/scores")\n' +
'\n' +
'  def fetch(entry)\n' +
'    http = Net::HTTP.new(ENDPOINT.host, ENDPOINT.port)\n' +
'    http.use_ssl = true\n' +
'    http.open_timeout = 3\n' +
'    http.read_timeout = 10   # 応答を10秒まで待つ\n' +
'    res = http.post(ENDPOINT.path, { project_id: entry.project_id, user_id: entry.user_id }.to_json, "Content-Type" => "application/json")\n' +
'    JSON.parse(res.body).fetch("score")\n' +
'  end\n' +
'end\n';

files[SRC + '/app/jobs/scout_score_sync_job.rb'] =
'# 5分ごとに、スコアをまだ取れていない応募のスコアを取り直す\n' +
'class ScoutScoreSyncJob < ApplicationJob\n' +
'  def perform\n' +
'    Entry.where(score: nil).find_each do |entry|\n' +
'      entry.update!(score: ScoutScoreClient.new.fetch(entry))\n' +
'    end\n' +
'  end\n' +
'end\n';

/* ---------------- ログを作る ---------------- */
function pad(n) { return String(n).padStart(2, '0'); }
function railsTime(t) {
  var d = new Date(t);
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' +
         pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' +0000';
}
/* 番号から決まる request_id（開くたびに同じになる）。形は Rails が付ける UUID と同じ */
function uuid(n) {
  var x = (n * 2654435761 + 1013904223) >>> 0, h = '';
  for (var i = 0; i < 32; i++) {
    x = (Math.imul(x ^ (x >>> 15), 2246822507) + i * 3266489909) >>> 0;
    h += (x >>> 28).toString(16);
  }
  return h.slice(0, 8) + '-' + h.slice(8, 12) + '-4' + h.slice(13, 16) + '-' + '89ab'[x & 3] + h.slice(17, 20) + '-' + h.slice(20, 32);
}
var PAGES = [
  ['GET', '/projects', 'ProjectsController#index', null, 118, 64.2, 21.3],
  ['GET', '/projects/8821', 'ProjectsController#show', '{"id" => "8821"}', 74, 40.1, 12.8],
  ['GET', '/', 'TopController#index', null, 41, 28.4, 6.1],
  ['GET', '/company/projects', 'Company::ProjectsController#index', null, 96, 55.0, 18.7]
];

function buildLogs(sim, env) {
  var now = Date.now();
  var web = sim.serviceTaskIds(env, 'jinzai-prod-web');
  var worker = sim.serviceTaskIds(env, 'jinzai-prod-worker');
  var streams = web.map(function () { return []; });
  function put(task, at, rid, lines) {
    lines.forEach(function (m, i) { streams[task].push({ at: at + i, message: '[' + rid + '] ' + m }); });
  }

  /* 平常の閲覧（1分ごと、2つのタスクに交互に） */
  for (var k = 60; k >= 1; k--) {
    var p = PAGES[k % PAGES.length], at = now - k * MIN + 7000, rid = uuid(k);
    var lines = ['Started ' + p[0] + ' "' + p[1] + '" for 203.0.113.' + (10 + k) + ' at ' + railsTime(at),
                 'Processing by ' + p[2] + ' as HTML'];
    if (p[3]) lines.push('  Parameters: ' + p[3]);
    lines.push('Completed 200 OK in ' + p[4] + 'ms (Views: ' + p[5] + 'ms | ActiveRecord: ' + p[6] + 'ms (3 queries, 0 cached) | GC: 0.4ms)');
    put(k % 2, at, rid, lines);
  }

  /* 失敗が始まる前の応募（外部APIは0.3秒ほどで返っていた） */
  OKS.forEach(function (m, i) {
    var at = now - m * MIN + 21000, rid = uuid(1000 + m);
    put(i % 2, at, rid, [
      'Started POST "/projects/8821/entries" for 198.51.100.' + (20 + i) + ' at ' + railsTime(at),
      'Processing by EntriesController#create as HTML',
      '  Parameters: {"authenticity_token" => "[FILTERED]", "entry" => {"message" => "[FILTERED]"}, "project_id" => "8821"}'
    ]);
    put(i % 2, at + 412, rid, [
      'Redirected to https://jinzai.example/projects/8821',
      'Completed 302 Found in 412ms (ActiveRecord: 8.2ms (5 queries, 0 cached) | GC: 0.6ms)'
    ]);
  });

  /* 応募が外部APIの応答を10秒待って打ち切られる */
  FAILS.forEach(function (m, i) {
    var at = now - m * MIN + 33000, rid = m === 8 ? RID : uuid(2000 + m);
    put(i % 2, at, rid, [
      'Started POST "/projects/' + (8821 - i * 37) + '/entries" for 198.51.100.' + (40 + i) + ' at ' + railsTime(at),
      'Processing by EntriesController#create as HTML',
      '  Parameters: {"authenticity_token" => "[FILTERED]", "entry" => {"message" => "[FILTERED]"}, "project_id" => "' + (8821 - i * 37) + '"}'
    ]);
    put(i % 2, at + 10021, rid, [
      'Completed 500 Internal Server Error in 10021ms (ActiveRecord: 2.1ms (2 queries, 0 cached) | GC: 0.5ms)',
      '',
      'Net::ReadTimeout (Net::ReadTimeout with #<TCPSocket:(closed)>):',
      '',
      "app/clients/scout_score_client.rb:10:in 'ScoutScoreClient#fetch'",
      "app/controllers/entries_controller.rb:6:in 'EntriesController#create'"
    ]);
  });

  web.forEach(function (id, i) { sim.putLogs(env, sim.WEB_LOG, 'web/web/' + id, streams[i]); });

  /* worker: 5分ごとのスコアの取り直しと、応募完了メール */
  var w = [];
  function sk(at, s) { w.push({ at: at, message: new Date(at).toISOString().replace(/\.\d+Z$/, '.' + String(at % 1000).padStart(3, '0') + 'Z') + ' pid=1 ' + s }); }
  for (var j = 12; j >= 1; j--) {
    var t = now - j * 5 * MIN, jid = (j * 40503 >>> 0).toString(16).padStart(12, '0').slice(0, 12);
    sk(t, 'tid=gx' + j + ' class=ScoutScoreSyncJob jid=' + jid + ' INFO: start');
    if (j * 5 > 38) {
      sk(t + 812, 'tid=gx' + j + ' class=ScoutScoreSyncJob jid=' + jid + ' elapsed=0.812 INFO: done');
    } else {
      sk(t + 10034, 'tid=gx' + j + ' class=ScoutScoreSyncJob jid=' + jid + ' elapsed=10.034 INFO: fail');
      sk(t + 10035, 'tid=gx' + j + ' WARN: Net::ReadTimeout: Net::ReadTimeout with #<TCPSocket:(closed)>');
    }
  }
  OKS.forEach(function (m, i) {
    var t = now - m * MIN + 23000, jid = 'ml' + (m * 7919).toString(16).padStart(10, '0');
    sk(t, 'tid=mx' + i + ' class=ActionMailer::MailDeliveryJob jid=' + jid + ' INFO: start');
    sk(t + 640, 'tid=mx' + i + ' class=ActionMailer::MailDeliveryJob jid=' + jid + ' elapsed=0.64 INFO: done');
  });
  sim.putLogs(env, sim.WORKER_LOG, 'worker/worker/' + worker[0], w);
  return env;
}

window.LFR.scenarios.add({
  id: 'case34',
  level: 12,
  title: 'CloudWatch Logs で、通知のリクエストを追う',
  subtitle: 'ログファイルのないコンテナのログを、request_id とログストリームで絞り込む',

  description:
'Slack に Honeybadger の通知が流れました。左のカードがその内容です。\n\n' +
'EC2 のときは、サーバーに入って log/production.log を grep していました。\n' +
'いまの本番は ECS on Fargate です。入るサーバーも、ログファイルもありません。\n' +
'Rails が標準出力に書いたログは、CloudWatch Logs に送られています。\n\n' +
'手元のMacの AWS CLI で、通知のリクエストが何をして、なぜ失敗したのかを調べてください。\n' +
'そのうえで、1つのタスクだけの問題か、全体の問題かを切り分けてください。\n' +
'アプリのソースは ~/src/jinzai-rails にあります。',

  alert: {
    source: 'Honeybadger',
    project: 'jinzai-rails (production)',
    title: 'Net::ReadTimeout',
    message: 'Net::ReadTimeout with #<TCPSocket:(closed)>',
    occurredAt: '約8分前（初回は約38分前）',
    component: 'entries#create',
    count: FAILS.length,
    users: '影響ユーザー ' + FAILS.length + '名',
    requestId: RID,
    deploy: '昨日 19:00 / 4c5d6e7',
    env: 'production（ECS on Fargate）',
    note: 'このカードはブラウザで見えている情報です。ここから先は AWS CLI で調べます。'
  },

  learn: [
    { name: 'ログの出し先をタスク定義で確かめる', cmd: "aws ecs describe-task-definition --task-definition jinzai-prod-web --query 'taskDefinition.containerDefinitions[0].logConfiguration'",
      desc: 'コンテナの標準出力をどこへ送るかは、タスク定義の logConfiguration に書いてあります。\n' +
            'awslogs-group がロググループ（ログの置き場所）の名前です。\n' +
            'awslogs-stream-prefix を付けると、ログストリームの名前は「接頭辞/コンテナ名/タスクID」になります。' },
    { name: 'aws logs tail', cmd: 'aws logs tail /ecs/jinzai-prod-web --since 15m',
      desc: 'ロググループの最近のログを、時刻とログストリームの名前付きで出します。\n' +
            '--since を省くと10分前からです。--follow を付けると新しいログを待ち続けます（tail -f に当たります）。\n' +
            '（学習環境では --follow を付けても待たずに終わります）' },
    { name: 'request_id で1リクエストを引く', cmd: "aws logs tail /ecs/jinzai-prod-web --since 1h --filter-pattern '\"" + RID + "\"'",
      desc: '--filter-pattern で、その語を含む行だけに絞ります（grep に当たります）。\n' +
            'ハイフンなどの記号を含む語は、ダブルクォートで囲みます。\n' +
            'シェルに外側のクォートを消されないよう、全体をシングルクォートで包んでいます。' },
    { name: 'ログストリームの一覧', cmd: "aws logs describe-log-streams --log-group-name /ecs/jinzai-prod-web --query 'logStreams[].logStreamName'",
      desc: 'ログストリームはタスク1つにつき1本です。名前の末尾がタスクIDなので、\n' +
            'どのタスクが書いたログかが分かります。' },
    { name: 'エラーの出たタスクを数える', cmd: "aws logs filter-log-events --log-group-name /ecs/jinzai-prod-web --filter-pattern '\"Completed 500\"' --query 'events[].logStreamName' --output text | tr '\\t' '\\n' | sort | uniq -c",
      desc: '500 で終わったリクエストを、ログストリーム（＝タスク）ごとに数えます。\n' +
            '--output text はタブ区切りで1行に並べるので、tr で改行に直してから sort と uniq -c に渡します。\n' +
            'AWS CLI の出力もこれまでの Linux のコマンドで加工できます。' },
    { name: '前後の応募を時刻で並べる', cmd: "aws logs tail /ecs/jinzai-prod-web --since 1h --filter-pattern '?\"Completed 302\" ?\"Completed 500\"' --format short",
      desc: '? を付けた語は「どれかを含む」の意味です。成功（302）と失敗（500）を時刻順に並べて、\n' +
            'いつから失敗し始めたかを確かめます。--format short はストリーム名を省いて短く出します。' },
    { name: 'worker のロググループも見る', cmd: 'aws logs tail /ecs/jinzai-prod-worker --since 1h --filter-pattern ScoutScoreSyncJob',
      desc: 'web とは別のサービスの worker（Sidekiq）は、別のロググループに書いています。\n' +
            '同じ時刻に、別の場所で同じことが起きていないかを確かめます。' },
    { name: '外部APIの呼び出し方を読む', cmd: 'cat ~/src/jinzai-rails/app/clients/scout_score_client.rb',
      desc: 'バックトレースに出てくるファイルを、手元のソースで読みます。\n' +
            '待ち時間（read_timeout）の設定が、ログの「in 10021ms」と合うかを確かめてください。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  awsEnv: function (sim) { return buildLogs(sim, sim.railsOnEcs()); },

  hints: [
    'まず通知の request_id で、そのリクエストのログだけを取り出してください。\n' +
    'ロググループは /ecs/jinzai-prod-web です（タスク定義の logConfiguration に書いてあります）。\n\n' +
    "  aws logs tail /ecs/jinzai-prod-web --since 1h --filter-pattern '\"" + RID + "\"'",

    'Net::ReadTimeout で、10秒待って 500 になっています。\n' +
    'ログの行の2列目がログストリーム（＝タスク）です。\n' +
    'では、ほかの失敗は同じタスクで起きているのか、両方のタスクで起きているのかを数えてください。\n\n' +
    "  aws logs filter-log-events --log-group-name /ecs/jinzai-prod-web --filter-pattern '\"Completed 500\"' --query 'events[].logStreamName' --output text | tr '\\t' '\\n' | sort | uniq -c",

    '失敗は両方のタスクに分かれています。タスクではなく両方が使っている何かが原因です。\n' +
    'バックトレースの scout_score_client.rb を読み、同じ外部APIを使っている worker のログも見てください。\n\n' +
    '  aws logs tail /ecs/jinzai-prod-worker --since 1h --filter-pattern ScoutScoreSyncJob'
  ],

  probes: [
    { key: 'checkedLogConfig', label: 'タスク定義でログの出し先を確かめた',
      test: function (c, res) { return /describe-task-definition/.test(c) && /awslogs-group/.test(res.stdout); } },
    { key: 'usedRequestId', label: 'request_id でリクエストを引いた',
      test: function (c, res) { return /7b2e9c41/.test(c) && /Started POST/.test(res.stdout); } },
    { key: 'foundTimeout', label: 'Net::ReadTimeout で10秒後に500になっていると確かめた',
      test: function (c, res) { return /aws\s+logs/.test(c) && /Net::ReadTimeout/.test(res.stdout); } },
    { key: 'comparedTasks', label: '失敗が両方のタスクで起きていると確かめた',
      test: function (c, res) {
        var seen = {};
        (res.stdout.match(/web\/web\/[0-9a-f]+/g) || []).forEach(function (s) { seen[s] = 1; });
        return Object.keys(seen).length >= 2 && /500|ReadTimeout/.test(c + res.stdout) && /aws\s+logs/.test(c);
      } },
    { key: 'checkedOnset', label: 'いつから失敗し始めたかを確かめた',
      test: function (c, res) { return /aws\s+logs/.test(c) && /Completed 302/.test(res.stdout) && /Completed 500/.test(res.stdout); } },
    { key: 'checkedWorker', label: 'worker でも同じ外部APIが失敗していると確かめた',
      test: function (c, res) { return /jinzai-prod-worker/.test(c) && /ScoutScoreSyncJob[\s\S]*(fail|ReadTimeout)/.test(res.stdout); } },
    { key: 'readClient', label: '外部APIの待ち時間の設定をソースで確かめた',
      test: function (c, res) { return /scout_score_client/.test(c) && /read_timeout/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'usedRequestId',    weight: 14, label: 'request_id で該当リクエストを特定した' },
    { key: 'foundTimeout',     weight: 10, label: '例外と、打ち切られるまでの時間を確かめた' },
    { key: 'comparedTasks',    weight: 16, label: 'タスクごとに数えて、1つのタスクの問題ではないと切り分けた' },
    { key: 'checkedOnset',     weight: 8,  label: '失敗が始まった時刻をデプロイと突き合わせた' },
    { key: 'checkedWorker',    weight: 12, label: '別のロググループ（worker）へ広げた' },
    { key: 'readClient',       weight: 8,  label: 'ソースで待ち時間の設定を確かめた' },
    { key: 'checkedLogConfig', weight: 4,  label: 'ログの出し先をタスク定義で確かめた' }
  ],

  question: {
    text: '応募（POST /projects/:id/entries）が 500 になっている原因として、ログから言えることは？',
    choices: [
      'web のタスクのうち1つが壊れている。そのタスクを止めれば、ECS が新しいタスクに入れ替えて直る',
      '応募の処理の中で呼んでいる外部のスコア算出APIが応答せず、10秒で打ち切られている。web の両方のタスクと worker で、同じ時刻から起きている',
      '昨日のデプロイ（4c5d6e7）で入ったコードの不具合',
      'CloudWatch Logs への書き込みが詰まって、Rails の応答が遅くなっている'
    ],
    answer: 1,
    explain:
'通知の request_id で、そのリクエストのログだけを取り出します。\n\n' +
"  $ aws logs tail /ecs/jinzai-prod-web --since 1h --filter-pattern '\"7b2e9c41-...\"'\n" +
'  ... web/web/<タスクID> [7b2e9c41-...] Started POST "/projects/.../entries" for ...\n' +
'  ... web/web/<タスクID> [7b2e9c41-...] Processing by EntriesController#create as HTML\n' +
'  ... web/web/<タスクID> [7b2e9c41-...] Completed 500 Internal Server Error in 10021ms ...\n' +
'  ... web/web/<タスクID> [7b2e9c41-...] Net::ReadTimeout (Net::ReadTimeout with #<TCPSocket:(closed)>):\n' +
"  ... web/web/<タスクID> [7b2e9c41-...] app/clients/scout_score_client.rb:10:in 'ScoutScoreClient#fetch'\n\n" +
'外部APIの応答を待って、10秒（10021ms）で打ち切られています。\n' +
'ソースの read_timeout = 10 と一致します。\n\n' +
'次に、1つのタスクだけの問題かを確かめます。ログストリームはタスクごとに分かれているので、\n' +
'500 の行をストリームごとに数えます。\n\n' +
"  $ aws logs filter-log-events ... --filter-pattern '\"Completed 500\"' --query 'events[].logStreamName' --output text | tr '\\t' '\\n' | sort | uniq -c\n" +
'        6 web/web/<タスクA>\n' +
'        6 web/web/<タスクB>\n\n' +
'両方のタスクで半分ずつ起きています。タスクを入れ替えても直りません。\n\n' +
'時刻を並べると、約41分前の応募までは 302（成功）で、約38分前から 500 に変わっています。\n' +
'デプロイは昨日の19時なので、時刻が合いません。\n\n' +
'worker のロググループを見ると、同じ外部APIを使う ScoutScoreSyncJob も、\n' +
'約35分前の回から Net::ReadTimeout で fail になっています。\n' +
'web と worker という別々のサービスで、同じ時刻から、同じ外部APIで失敗しています。\n' +
'原因は外部のスコア算出APIの側にあると考えられます。\n\n' +
'まずすることは、提供元の障害情報を確かめて連絡することです。\n' +
'そのうえで、応募そのものが外部APIの応答に依存している作りを見直します。\n' +
'スコアは応募のあとで ScoutScoreSyncJob が取り直す仕組みがあるので、\n' +
'応募の処理では外部APIを呼ばずに保存し、スコアはジョブに任せる、という直し方が考えられます。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. Fargate のログは CloudWatch Logs にある。置き場所はタスク定義の logConfiguration に書いてある\n' +
'2. grep の代わりに --filter-pattern、tail -f の代わりに aws logs tail --follow\n' +
'3. ログストリーム＝タスク。ストリームごとに数えれば「1つのタスクの問題か、全体の問題か」が分かる\n' +
'4. AWS CLI の出力も sort / uniq -c などの Linux のコマンドで加工できる',
    wrong: [
'500 の行をログストリームごとに数えると、web の2つのタスクに半分ずつ出ています。\n' +
'1つのタスクだけが壊れているなら、失敗はそのタスクのストリームに偏るはずです。\n\n' +
'タスクを止めると ECS は新しいタスクを起動しますが、\n' +
'新しいタスクも同じ外部APIを呼ぶので、同じように失敗します。',
null,
'デプロイは昨日の19時で、約41分前までの応募は 302 で成功しています。\n' +
'失敗が始まったのは約38分前からです。\n\n' +
'デプロイ直後から失敗していたなら真っ先に疑うべきですが、今回は時刻が合いません。\n' +
'さらに、コードを変えていない worker のジョブも同じ時刻から失敗しています。',
'awslogs ドライバーは、コンテナが標準出力に書いたものを ECS 側が CloudWatch Logs へ送ります。\n' +
'Rails は標準出力に書くだけなので、送る処理が Rails の応答時間に入ることはありません。\n\n' +
'ログには、外部APIの応答を待って10秒で打ち切られた Net::ReadTimeout が出ています。\n' +
'遅いのはログではなく外部APIへの呼び出しです。'
    ]
  },

  route: {
    steps: [
      '通知から request_id・発生時刻・直近のデプロイを読み取る',
      'タスク定義の logConfiguration で、ロググループの名前を確かめる',
      'request_id で1リクエストを引き、例外と時間を読む（Net::ReadTimeout、10秒）',
      '500 の行をログストリーム（タスク）ごとに数え、全体の問題だと切り分ける',
      '成功と失敗を時刻で並べ、始まった時刻をデプロイと突き合わせる（→ 無関係）',
      'worker のロググループへ広げ、同じ外部APIが失敗していることを確かめる',
      'バックトレースのファイルをソースで読み、待ち時間の設定を確かめる'
    ],
    commands: [
      "aws ecs describe-task-definition --task-definition jinzai-prod-web --query 'taskDefinition.containerDefinitions[0].logConfiguration'",
      "aws logs tail /ecs/jinzai-prod-web --since 1h --filter-pattern '\"" + RID + "\"'",
      "aws logs filter-log-events --log-group-name /ecs/jinzai-prod-web --filter-pattern '\"Completed 500\"' --query 'events[].logStreamName' --output text | tr '\\t' '\\n' | sort | uniq -c",
      "aws logs tail /ecs/jinzai-prod-web --since 1h --filter-pattern '?\"Completed 302\" ?\"Completed 500\"' --format short",
      'aws logs tail /ecs/jinzai-prod-worker --since 1h --filter-pattern ScoutScoreSyncJob',
      'cat ~/src/jinzai-rails/app/clients/scout_score_client.rb',
      'cat ~/src/jinzai-rails/app/controllers/entries_controller.rb'
    ],
    note:
'worker のログから入って「外部APIが落ちている」と先に気づくルートでも構いません。\n' +
'覚えてほしいのは、EC2 のときと同じ順番で降りていけることです。\n' +
'通知 → request_id で1件を特定 → 範囲を広げて数える → 時刻をデプロイと突き合わせる → 別のログへ広げる。\n' +
'道具が grep から --filter-pattern に変わっただけです。'
  }
});
})();
