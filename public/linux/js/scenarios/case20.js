/* CASE 20 — メンテナンスページを出してロールバックする */
(function () {
'use strict';
var APP = '/var/www/myapp';
var NEW = APP + '/releases/20260914153000';
var PREV = APP + '/releases/20260914120000';
var MAINT = APP + '/shared/tmp/maintenance.html';
var base = window.LFR.base;

var files = {};

/* 新しいrelease（壊れている） */
files[NEW + '/REVISION'] = '7d4b9e1fa2c83506e9d1b4f7a0c25839e6b1d0c4\n';
files[NEW + '/Gemfile'] = base.files[PREV + '/Gemfile'];
files[NEW + '/config/routes.rb'] = base.files[PREV + '/config/routes.rb'];
files[NEW + '/app/controllers/entries_controller.rb'] =
'class EntriesController < ApplicationController\n' +
'  def new\n' +
'    @entry = Entry.new\n' +
'    # 2026-09-14 追加: 応募フォームに職種サジェストを出す\n' +
'    @suggestions = SuggestService.for(current_user.profile.desired_job)\n' +
'  end\n' +
'end\n';
files[PREV + '/app/controllers/entries_controller.rb'] =
'class EntriesController < ApplicationController\n' +
'  def new\n' +
'    @entry = Entry.new\n' +
'  end\n' +
'end\n';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T15:31:44.114+09:00 #1433]  INFO -- : [11aa22bb-33cc-4dd4-8ee5-ff6600aa11bb] Started GET "/entries/new" for 10.0.2.31 at 2026-09-14 15:31:44 +0900\n' +
'I, [2026-09-14T15:31:44.116+09:00 #1433]  INFO -- : [11aa22bb-33cc-4dd4-8ee5-ff6600aa11bb] Processing by EntriesController#new as HTML\n' +
'E, [2026-09-14T15:31:44.208+09:00 #1433] ERROR -- : [11aa22bb-33cc-4dd4-8ee5-ff6600aa11bb] NoMethodError (undefined method `desired_job\' for nil):\n' +
'E, [2026-09-14T15:31:44.208+09:00 #1433] ERROR -- : [11aa22bb-33cc-4dd4-8ee5-ff6600aa11bb] app/controllers/entries_controller.rb:5:in `new\'\n' +
'I, [2026-09-14T15:31:44.210+09:00 #1433]  INFO -- : [11aa22bb-33cc-4dd4-8ee5-ff6600aa11bb] Completed 500 Internal Server Error in 96ms\n' +
'I, [2026-09-14T15:33:02.441+09:00 #1434]  INFO -- : [22bb33cc-44dd-4ee5-9ff6-00aa11bb22cc] Started GET "/projects" for 10.0.2.18 at 2026-09-14 15:33:02 +0900\n' +
'I, [2026-09-14T15:33:02.560+09:00 #1434]  INFO -- : [22bb33cc-44dd-4ee5-9ff6-00aa11bb22cc] Completed 200 OK in 119ms (Views: 70.2ms | ActiveRecord: 14.1ms)\n' +
'I, [2026-09-14T15:35:18.902+09:00 #1433]  INFO -- : [33cc44dd-55ee-4ff6-a00a-11bb22cc33dd] Started GET "/entries/new" for 10.0.2.44 at 2026-09-14 15:35:18 +0900\n' +
'E, [2026-09-14T15:35:18.988+09:00 #1433] ERROR -- : [33cc44dd-55ee-4ff6-a00a-11bb22cc33dd] NoMethodError (undefined method `desired_job\' for nil):\n' +
'I, [2026-09-14T15:35:18.990+09:00 #1433]  INFO -- : [33cc44dd-55ee-4ff6-a00a-11bb22cc33dd] Completed 500 Internal Server Error in 88ms\n';

files['/etc/nginx/sites-enabled/myapp.conf'] =
'upstream puma {\n' +
'  server unix:///var/www/myapp/shared/tmp/sockets/puma.sock fail_timeout=0;\n' +
'}\n' +
'\n' +
'server {\n' +
'  listen 80;\n' +
'  server_name myapp.example.jp;\n' +
'  root /var/www/myapp/current/public;\n' +
'\n' +
'  # このファイルが置かれている間は、全リクエストにメンテナンスページを返す\n' +
'  if (-f /var/www/myapp/shared/tmp/maintenance.html) {\n' +
'    return 503;\n' +
'  }\n' +
'  error_page 503 @maintenance;\n' +
'  location @maintenance {\n' +
'    rewrite ^(.*)$ /maintenance.html break;\n' +
'  }\n' +
'\n' +
'  # 運用側だけは確認できるようにする\n' +
'  # （X-Maintenance-Bypass ヘッダを付けたリクエストは素通し）\n' +
'\n' +
'  try_files $uri/index.html $uri @puma;\n' +
'  location @puma {\n' +
'    proxy_set_header Host $http_host;\n' +
'    proxy_pass http://puma;\n' +
'  }\n' +
'}\n';

var symlinks = {};
symlinks[NEW + '/log'] = APP + '/shared/log';
symlinks[NEW + '/tmp'] = APP + '/shared/tmp';
symlinks[APP + '/current'] = NEW;

function currentRelease(state) {
  return state.symlinks[APP + '/current'] || '';
}
function httpFor(state) {
  var broken = currentRelease(state).indexOf('20260914153000') >= 0;
  return {
    'http://localhost/': {
      status: 200, reason: 'OK',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><head><title>Myapp</title></head><body>...</body></html>\n'
    },
    'http://localhost/entries/new': broken ? {
      status: 500, reason: 'Internal Server Error',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><body><h1>We\'re sorry, but something went wrong.</h1></body></html>\n'
    } : {
      status: 200, reason: 'OK',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><head><title>応募する | Myapp</title></head><body>...</body></html>\n'
    }
  };
}

window.LFR.scenarios.add({
  id: 'case20',
  firstLook: { name: '失敗するページの応答を確かめる', cmd: 'curl -I http://localhost/entries/new',
    desc: '先頭行の数字はHTTPステータスです。復旧後に同じURLを調べて、応答がどう変わったかを比べられます。' },
  level: 7,
  title: 'メンテナンスページを出してロールバックする',
  subtitle: '止血してから戻す。戻したら自分で確かめてから開ける',

  description:
'15:31にデプロイした直後から、応募フォーム（/entries/new）が 500 になっています。\n' +
'求人一覧など他の画面は正常です。\n\n' +
'原因はデプロイしたコードにありそうですが、いま直して出し直す時間はありません。\n' +
'まず **前のreleaseへ戻して止血** してください。\n\n' +
'手順には順番があります。\n' +
'いきなり切り替えると、切り替わる途中の状態がユーザーに見えます。\n' +
'そして戻したあと、自分で確認する前にメンテナンスを解除してはいけません。',

  learn: [
    { name: 'メンテナンスページ', cmd: 'touch /var/www/myapp/shared/tmp/maintenance.html',
      desc: 'nginxの設定に、このファイルが存在する間は503を返す条件が書かれています。\n\n' +
            '  if (-f /var/www/myapp/shared/tmp/maintenance.html) { return 503; }\n\n' +
            'ファイルを置くだけで全リクエストを止められ、消せば戻ります。\n' +
            'Railsを再起動する必要もありません。\n' +
            '作業中の中途半端な状態をユーザーに見せないための、いちばん軽い止血です。' },
    { name: 'ロールバック（currentの張り替え）', cmd: 'ln -sfn releases/20260914120000 /var/www/myapp/current',
      desc: 'Capistranoのデプロイは「releaseを置いて、currentを張り替える」操作です。\n' +
            'ロールバックはその逆で、currentを前のreleaseへ向け直すだけです。\n\n' +
            '  -s  シンボリックリンクを作る\n' +
            '  -f  既存のリンクを上書きする\n' +
            '  -n  リンク先ディレクトリの中に作らず、リンク自体を置き換える\n\n' +
            '-n を忘れると current の「中」にリンクが作られてしまいます。\n' +
            'sfn の3文字をセットで覚えてください。' },
    { name: '張り替えただけでは反映されない', cmd: 'sudo systemctl restart puma',
      desc: 'Pumaは preload_app! で起動時にコードをメモリへ読み込みます。\n' +
            'currentを戻しても、動いているプロセスは古いreleaseのコードを持ったままです。\n' +
            '（CASE 07 / CASE 12 で見たのと同じ話です）\n\n' +
            'ロールバックは「張り替え」と「再起動」の2つで初めて完了します。' },
    { name: '解除の前に確認する', cmd: 'curl -I -H "X-Maintenance-Bypass: 1" http://localhost/entries/new',
      desc: 'メンテナンス中でも、運用側だけは確認できるようにしてあります。\n' +
            'ヘッダを付けたリクエストは503を素通りして、実際のアプリに届きます。\n\n' +
            '「直ったことを自分で確認してから解除する」を必ず守ってください。\n' +
            '解除してからユーザーに壊れたページを見せるのが、いちばん避けたい失敗です。' },
    { name: 'readlink で確認', cmd: 'readlink /var/www/myapp/current',
      desc: '張り替えが成功したかを、目で確かめます。\n' +
            'cat current/REVISION も併せて見ると、コミットまで確定できます。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  symlinks: symlinks,
  now: '15:38:22',

  maintenance: {
    file: MAINT,
    bypass: 'X-Maintenance-Bypass'
  },

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Mon 2026-09-14 15:31:38 JST', ago: '6min 44s ago',
      mainPid: 1421, tasks: 12, memory: '336.1M',
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb',
      recovery: {
        blockedBy: null,
        /* 起動時に current が指しているreleaseのコードを読み込む */
        onUp: function (state) {
          state.http = httpFor(state);
          state.rolledBack = currentRelease(state).indexOf('20260914120000') >= 0;
          state.processes.forEach(function (p) {
            if (/puma/.test(p.command)) { p.start = 'Sep14'; p.time = '0:00'; }
          });
        },
        onDown: function (state) {}
      }
    }
  },

  http: httpFor({ symlinks: symlinks }),

  hints: [
    'まず症状を確認してください。/entries/new が500、/projects は200です。\n' +
    'そのうえで「直す」より先に「見せない」を考えます。\n' +
    'nginxの設定ファイルに、止める仕組みが書かれています。',

    'メンテナンスページを出したら、currentを前のreleaseへ張り替えます。\n' +
    'ls -la releases でどのreleaseがあるかを確認してから、\n\n' +
    '  ln -sfn releases/20260914120000 /var/www/myapp/current\n\n' +
    '張り替えたら readlink で確認してください。',

    '張り替えただけでは直りません。Pumaは古いコードをメモリに持ったままです。\n\n' +
    '  sudo systemctl restart puma\n' +
    '  curl -I -H "X-Maintenance-Bypass: 1" http://localhost/entries/new   ← 自分で確認\n' +
    '  rm /var/www/myapp/shared/tmp/maintenance.html                        ← 確認できてから解除'
  ],

  probes: [
    { key: 'sawSymptom', label: '症状を確認した',
      test: function (c, res) { return /500/.test(res.stdout + res.stderr) || /NoMethodError/.test(res.stdout); } },
    { key: 'readNginxConf', label: 'nginxの設定でメンテナンスの仕組みを確認した',
      test: function (c, res) { return /maintenance\.html/.test(res.stdout) && /return 503/.test(res.stdout); } },
    { key: 'maintenanceOn', label: 'メンテナンスページを出した',
      test: function (c, res, rt) { return /maintenance\.html/.test(c) && /touch|cp|echo/.test(c); } },
    { key: 'verifiedMaintenance', label: 'メンテナンスが効いていることを確認した',
      test: function (c, res) { return /503/.test(res.stdout + res.stderr); } },
    { key: 'rolledBack', label: 'currentを前のreleaseへ張り替えた',
      test: function (c, res, rt) { return /\bln\b/.test(c) && rt.state.symlinks[APP + '/current'].indexOf('20260914120000') >= 0; } },
    { key: 'verifiedLink', label: 'readlinkで張り替えを確認した',
      test: function (c, res) { return /readlink/.test(c) && /20260914120000/.test(res.stdout); } },
    { key: 'restartedPuma', label: '張り替え後にPumaを再起動した',
      test: function (c, res, rt) { return rt.state.rolledBack === true; } },
    { key: 'verifiedBeforeRelease', label: '解除の前に自分で動作確認した',
      test: function (c, res, rt) {
        return /X-Maintenance-Bypass/.test(c) && /200 OK/.test(res.stdout + res.stderr);
      } },
    { key: 'maintenanceOff', label: 'メンテナンスを解除した',
      test: function (c) { return /\brm\b/.test(c) && /maintenance\.html/.test(c); } }
  ],

  evidence: [
    { key: 'sawSymptom',            weight: 6,  label: '症状を確認した' },
    { key: 'readNginxConf',         weight: 8,  label: 'メンテナンスの仕組みを設定で確認した' },
    { key: 'maintenanceOn',         weight: 14, label: '作業前に止血した' },
    { key: 'rolledBack',            weight: 16, label: 'currentを前のreleaseへ戻した' },
    { key: 'verifiedLink',          weight: 8,  label: '張り替えを確認した' },
    { key: 'restartedPuma',         weight: 14, label: '再起動して反映させた' },
    { key: 'verifiedBeforeRelease', weight: 16, label: '解除の前に自分で確認した' },
    { key: 'maintenanceOff',        weight: 8,  label: 'メンテナンスを解除した' }
  ],

  question: {
    text: '障害時のロールバック手順として、最も適切なものは？',
    choices: [
      'currentを前のreleaseへ張り替え、Pumaを再起動して、動作確認する',
      'メンテナンスページを出す → currentを戻す → Pumaを再起動 → 自分で動作確認 → メンテナンスを解除する',
      'すぐに修正コミットを作って再デプロイする（戻すより前に進むほうが速い）',
      'Pumaを停止して原因を調査し、原因が分かってから戻すか直すかを決める'
    ],
    answer: 1,
    explain:
'順番そのものが答えです。\n\n' +
'【1. 止血する】\n' +
'  $ cat /etc/nginx/sites-enabled/myapp.conf\n' +
'  if (-f /var/www/myapp/shared/tmp/maintenance.html) { return 503; }\n' +
'  $ touch /var/www/myapp/shared/tmp/maintenance.html\n' +
'  $ curl -I http://localhost/entries/new\n' +
'  HTTP/1.1 503 Service Unavailable\n\n' +
'  ファイルを1つ置くだけで全リクエストが止まります。Railsの再起動も要りません。\n' +
'  これをやらずに作業すると、切り替わる途中の不安定な状態がユーザーに見えます。\n\n' +
'【2. currentを戻す】\n' +
'  $ ls -la releases\n' +
'  $ ln -sfn releases/20260914120000 /var/www/myapp/current\n' +
'  $ readlink /var/www/myapp/current\n' +
'  releases/20260914120000\n\n' +
'  -sfn の3文字がセットです。-n を忘れると current の「中」にリンクが作られます。\n\n' +
'【3. 再起動して反映させる】\n' +
'  $ sudo systemctl restart puma\n\n' +
'  ここが落とし穴です。currentを戻しただけでは直りません。\n' +
'  Pumaは preload_app! で起動時にコードを読み込むので、\n' +
'  動いているプロセスは古いreleaseのコードを持ったままです。\n' +
'  張り替え + 再起動、で初めてロールバックが完了します。\n\n' +
'【4. 解除の前に自分で確認する】\n' +
'  $ curl -I -H "X-Maintenance-Bypass: 1" http://localhost/entries/new\n' +
'  HTTP/1.1 200 OK\n\n' +
'  メンテナンス中でも運用側だけは確認できるようにしてあります。\n' +
'  ここで200を見てから解除します。順番を逆にすると、\n' +
'  「解除したらまだ壊れていた」という最悪の形でユーザーに見せることになります。\n\n' +
'【5. 解除する】\n' +
'  $ rm /var/www/myapp/shared/tmp/maintenance.html\n' +
'  $ curl -I http://localhost/entries/new\n' +
'  HTTP/1.1 200 OK\n\n' +
'原因調査（なぜ current_user.profile が nil だったのか）は、この後で構いません。\n' +
'障害対応では「まず影響を止める」「次に戻す」「原因究明は最後」の順です。\n' +
'releases/20260914153000 は消さずに残しておけば、落ち着いてから調べられます。',
    wrong: [
'やること自体は合っていますが、順番に1つ足りません。\n' +
'メンテナンスページを出していないので、作業中の状態がユーザーに見えます。\n\n' +
'currentを張り替えてからPumaが再起動し終わるまでの数秒〜十数秒は、\n' +
'新旧のコードとアセットが混ざった不安定な状態になります。\n' +
'（画面は出るのにCSSが当たらない、といった見え方になります）\n\n' +
'nginxのメンテナンスファイルは touch 1回で置けて、rm 1回で戻せます。\n' +
'これだけ軽い止血をやらない理由はありません。',
null,
'「直して出し直す（ロールフォワード）」は正しい選択肢になることもありますが、\n' +
'障害が起きている最中には向きません。\n\n' +
'修正 → レビュー → CI → デプロイには最低でも十数分かかります。\n' +
'その間ずっとユーザーは500を見続けます。\n' +
'しかも急いで書いた修正が正しい保証はなく、2度目の障害になりがちです。\n\n' +
'Capistrano構成なら、前のreleaseがサーバー上に残っているので\n' +
'symlinkの張り替えと再起動だけで数十秒で戻せます。\n' +
'まず戻して止血し、修正は落ち着いてから作るのが原則です。',
'Pumaを停止すると、いま500で済んでいる /entries/new 以外の画面も\n' +
'すべて502になります。被害を自分で広げることになります。\n\n' +
'また、原因究明を先にやると復旧が遅れます。\n' +
'原因はデプロイしたreleaseの中にあり、そのreleaseはサーバー上に残るので、\n' +
'ロールバックしたあとでいくらでも調べられます。\n\n' +
'障害対応の原則は「復旧が先、原因究明は後」です。'
    ]
  },

  route: {
    steps: [
      '症状と影響範囲を確認する（どの画面が500で、どれが正常か）',
      'nginxの設定でメンテナンスの仕組みを確認する',
      'メンテナンスページを出して、効いていることを確認する',
      'releases を一覧し、戻す先を決める',
      'ln -sfn で current を張り替え、readlink で確認する',
      'Pumaを再起動して、新しいcurrentを読み込ませる',
      'バイパスヘッダを付けて、自分で200を確認する',
      'メンテナンスを解除し、最後にもう一度確認する'
    ],
    commands: [
      'curl -I http://localhost/entries/new',
      'grep -n "ERROR" log/production.log | tail -n 3',
      'cat /etc/nginx/sites-enabled/myapp.conf',
      'touch /var/www/myapp/shared/tmp/maintenance.html',
      'curl -I http://localhost/entries/new',
      'ls -la /var/www/myapp/releases',
      'readlink /var/www/myapp/current',
      'ln -sfn releases/20260914120000 /var/www/myapp/current',
      'readlink /var/www/myapp/current',
      'sudo systemctl restart puma',
      'curl -I -H "X-Maintenance-Bypass: 1" http://localhost/entries/new',
      'rm /var/www/myapp/shared/tmp/maintenance.html',
      'curl -I http://localhost/entries/new'
    ],
    note:
'メンテナンスを出すタイミングは、症状確認の直後でも張り替えの直前でも構いません。\n' +
'絶対に守ってほしいのは最後の2つの順番です。\n' +
'**自分で確認してから解除する。** これを逆にした事故が、いちばん多く、いちばん痛いです。'
  }
});
})();
