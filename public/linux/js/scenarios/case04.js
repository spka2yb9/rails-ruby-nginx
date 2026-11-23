/* CASE 04 — Railsで発生した500エラーの原因を探す */
(function () {
'use strict';

var APP = '/var/www/myapp';
var LOG = APP + '/shared/log/production.log';

/* 障害が起きる前の正常なリクエストログ。
   「大量のログの中から探す」を成立させるため、意図的に長くしている。 */
function normalTraffic() {
  var paths = [
    ['GET',  '/',                         'TopController#index',      200, 38],
    ['GET',  '/projects',                 'ProjectsController#index', 200, 121],
    ['GET',  '/projects/8821',            'ProjectsController#show',  200, 74],
    ['GET',  '/projects?page=2',          'ProjectsController#index', 200, 133],
    ['POST', '/entries',                  'EntriesController#create', 302, 210],
    ['GET',  '/company/projects',         'Company::ProjectsController#index', 200, 96],
    ['GET',  '/projects/7710',            'ProjectsController#show',  200, 69],
    ['GET',  '/assets/application.css',   'ActionDispatch::Static',   200, 2]
  ];
  var lines = [], ip = 0;
  for (var m = 52; m < 60; m++) {
    for (var i = 0; i < paths.length; i++) {
      var p = paths[i];
      var t = '2026-09-14T13:' + m + ':' + String((i * 7) % 60).padStart(2, '0') + '.' +
              String(100 + i * 37).slice(0, 3) + '+09:00';
      var rid = 'ab' + (m * 8 + i).toString(16).padStart(4, '0') + '-1f4c-4c0a-9d21-3e7b5c9a01' + (i % 10);
      ip++;
      lines.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Started ' + p[0] + ' "' + p[1] + '" for 10.0.2.' + (10 + ip % 40) + ' at 2026-09-14 13:' + m + ':' + String((i * 7) % 60).padStart(2, '0') + ' +0900');
      lines.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Processing by ' + p[2] + ' as HTML');
      lines.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Completed ' + p[3] + ' ' + (p[3] === 200 ? 'OK' : 'Found') + ' in ' + p[4] + 'ms (Views: ' + Math.round(p[4] * 0.6) + '.1ms | ActiveRecord: ' + Math.round(p[4] * 0.2) + '.4ms | Allocations: ' + (p[4] * 91) + ')');
    }
  }
  return lines;
}

/* 14:01:19 にRedisが落ちてから、500が出続けている */
var incident = [
'I, [2026-09-14T14:01:20.104+09:00 #1433]  INFO -- : [c81f2a7e-9d10-4f2b-8c33-51a9e7d40b12] Started GET "/projects" for 10.0.2.31 at 2026-09-14 14:01:20 +0900',
'I, [2026-09-14T14:01:20.106+09:00 #1433]  INFO -- : [c81f2a7e-9d10-4f2b-8c33-51a9e7d40b12] Processing by ProjectsController#index as HTML',
'E, [2026-09-14T14:01:21.318+09:00 #1433] ERROR -- : [c81f2a7e-9d10-4f2b-8c33-51a9e7d40b12] Redis::CannotConnectError (Error connecting to Redis on 127.0.0.1:6379 (Errno::ECONNREFUSED)):',
'E, [2026-09-14T14:01:21.318+09:00 #1433] ERROR -- : [c81f2a7e-9d10-4f2b-8c33-51a9e7d40b12] Connection refused - connect(2) for 127.0.0.1:6379',
'E, [2026-09-14T14:01:21.319+09:00 #1433] ERROR -- : [c81f2a7e-9d10-4f2b-8c33-51a9e7d40b12] ',
'E, [2026-09-14T14:01:21.319+09:00 #1433] ERROR -- : [c81f2a7e-9d10-4f2b-8c33-51a9e7d40b12] redis-client (0.22.2) lib/redis_client/connection_mixin.rb:37:in `call\'',
'E, [2026-09-14T14:01:21.319+09:00 #1433] ERROR -- : [c81f2a7e-9d10-4f2b-8c33-51a9e7d40b12] activesupport (7.2.1) lib/active_support/cache/redis_cache_store.rb:451:in `block in read_entry\'',
'E, [2026-09-14T14:01:21.319+09:00 #1433] ERROR -- : [c81f2a7e-9d10-4f2b-8c33-51a9e7d40b12] app/controllers/projects_controller.rb:3:in `index\'',
'I, [2026-09-14T14:01:21.320+09:00 #1433]  INFO -- : [c81f2a7e-9d10-4f2b-8c33-51a9e7d40b12] Completed 500 Internal Server Error in 1214ms (ActiveRecord: 0.0ms | Allocations: 10422)',
'I, [2026-09-14T14:02:04.771+09:00 #1434]  INFO -- : [7b30d5c1-4a82-4e19-b0f7-2c6e8d1a93f4] Started GET "/" for 10.0.2.18 at 2026-09-14 14:02:04 +0900',
'I, [2026-09-14T14:02:04.772+09:00 #1434]  INFO -- : [7b30d5c1-4a82-4e19-b0f7-2c6e8d1a93f4] Processing by TopController#index as HTML',
'I, [2026-09-14T14:02:04.831+09:00 #1434]  INFO -- : [7b30d5c1-4a82-4e19-b0f7-2c6e8d1a93f4] Completed 200 OK in 59ms (Views: 41.2ms | ActiveRecord: 9.8ms | Allocations: 21044)',
'I, [2026-09-14T14:02:41.229+09:00 #1433]  INFO -- : [2d94ff08-6c51-4b77-a1e2-9f0b3c5d6e78] Started GET "/projects?page=2" for 10.0.2.44 at 2026-09-14 14:02:41 +0900',
'I, [2026-09-14T14:02:41.231+09:00 #1433]  INFO -- : [2d94ff08-6c51-4b77-a1e2-9f0b3c5d6e78] Processing by ProjectsController#index as HTML',
'E, [2026-09-14T14:02:42.447+09:00 #1433] ERROR -- : [2d94ff08-6c51-4b77-a1e2-9f0b3c5d6e78] Redis::CannotConnectError (Error connecting to Redis on 127.0.0.1:6379 (Errno::ECONNREFUSED)):',
'E, [2026-09-14T14:02:42.447+09:00 #1433] ERROR -- : [2d94ff08-6c51-4b77-a1e2-9f0b3c5d6e78] Connection refused - connect(2) for 127.0.0.1:6379',
'I, [2026-09-14T14:02:42.448+09:00 #1433]  INFO -- : [2d94ff08-6c51-4b77-a1e2-9f0b3c5d6e78] Completed 500 Internal Server Error in 1219ms (ActiveRecord: 0.0ms | Allocations: 10390)',
'I, [2026-09-14T14:03:58.002+09:00 #1434]  INFO -- : [5e17a3b9-8d24-4c06-9f31-7a2b4c6d8e90] Started GET "/projects/8821" for 10.0.2.27 at 2026-09-14 14:03:58 +0900',
'I, [2026-09-14T14:03:58.004+09:00 #1434]  INFO -- : [5e17a3b9-8d24-4c06-9f31-7a2b4c6d8e90] Processing by ProjectsController#show as HTML',
'I, [2026-09-14T14:03:58.089+09:00 #1434]  INFO -- : [5e17a3b9-8d24-4c06-9f31-7a2b4c6d8e90] Completed 200 OK in 85ms (Views: 52.7ms | ActiveRecord: 14.2ms | Allocations: 18773)',
'I, [2026-09-14T14:04:30.611+09:00 #1433]  INFO -- : [9c42e8d7-3f61-4a95-8b20-6d5e1f3a7c84] Started GET "/projects" for 10.0.2.52 at 2026-09-14 14:04:30 +0900',
'I, [2026-09-14T14:04:30.613+09:00 #1433]  INFO -- : [9c42e8d7-3f61-4a95-8b20-6d5e1f3a7c84] Processing by ProjectsController#index as HTML',
'E, [2026-09-14T14:04:31.822+09:00 #1433] ERROR -- : [9c42e8d7-3f61-4a95-8b20-6d5e1f3a7c84] Redis::CannotConnectError (Error connecting to Redis on 127.0.0.1:6379 (Errno::ECONNREFUSED)):',
'E, [2026-09-14T14:04:31.822+09:00 #1433] ERROR -- : [9c42e8d7-3f61-4a95-8b20-6d5e1f3a7c84] Connection refused - connect(2) for 127.0.0.1:6379',
'I, [2026-09-14T14:04:31.823+09:00 #1433]  INFO -- : [9c42e8d7-3f61-4a95-8b20-6d5e1f3a7c84] Completed 500 Internal Server Error in 1212ms (ActiveRecord: 0.0ms | Allocations: 10401)'
];

var files = {};
files[LOG] = normalTraffic().concat(incident).join('\n') + '\n';

files[APP + '/shared/log/puma.error.log'] =
'[1421] - Worker 0 (PID: 1433) booted in 0.02s, phase: 0\n' +
'[1421] - Worker 1 (PID: 1434) booted in 0.02s, phase: 0\n';

files[APP + '/shared/log/sidekiq.log'] =
'2026-09-14T12:00:43.110Z pid=1502 tid=3f8 INFO: Starting processing, hit Ctrl-C to stop\n' +
'2026-09-14T14:01:25.882Z pid=1502 tid=3f8 WARN: Redis::CannotConnectError: Error connecting to Redis on 127.0.0.1:6379 (Errno::ECONNREFUSED)\n' +
'2026-09-14T14:01:26.901Z pid=1502 tid=3f8 WARN: Sidekiq is reconnecting to Redis in 1s...\n' +
'2026-09-14T14:02:30.114Z pid=1502 tid=3f8 WARN: Sidekiq is reconnecting to Redis in 4s...\n';

files['/var/log/nginx/access.log'] =
'10.0.2.31 - - [14/Sep/2026:14:01:21 +0900] "GET /projects HTTP/1.1" 500 1721 "-" "Mozilla/5.0"\n' +
'10.0.2.18 - - [14/Sep/2026:14:02:04 +0900] "GET / HTTP/1.1" 200 8842 "-" "Mozilla/5.0"\n' +
'10.0.2.44 - - [14/Sep/2026:14:02:42 +0900] "GET /projects?page=2 HTTP/1.1" 500 1721 "-" "Mozilla/5.0"\n' +
'10.0.2.52 - - [14/Sep/2026:14:04:31 +0900] "GET /projects HTTP/1.1" 500 1721 "-" "Mozilla/5.0"\n';

window.LFR.scenarios.add({
  id: 'case04',
  manual: { title: 'systemd · systemctl', url: 'https://www.freedesktop.org/software/systemd/man/latest/systemctl.html' },
  guide: [
    { title: '失敗したリクエストをたどる', why: '求人一覧を開くと500エラーが出ています。Railsが何をしようとして失敗したのか、直近のログで確認します。',
      commands: ['tail -n 12 log/production.log'], read: 'Started GET "/projects" に続く Processing by はRailsが処理を始めた印です。ERROR の行で、どの接続先の名前が出ているかを探します。' },
    { title: '接続先の状態を確かめる', why: 'このアプリは、よく使うデータを一時保存するためにRedisを使います。systemctl status で、サーバーの中のサービスの稼働状態を読めます。',
      commands: ['systemctl status redis'], read: 'Active: の右側を見ます。failed はサービスが異常終了した状態です。ログに出た接続エラーと結びつくかを考えましょう。' },
    { title: 'Railsにリクエストを渡す側と比べる', why: 'Pumaはリクエストを受け取ってRailsを動かすプログラムです。同じコマンドでPumaも調べます。',
      commands: ['systemctl status puma'], read: 'active (running) は実行中を表します。PumaとRedisの状態を比べ、どちらの停止ならログと矛盾しないかを説明してみましょう。' }
  ],
  level: 2,
  title: 'Railsで発生した500エラーの原因を探す',
  subtitle: '求人一覧だけが開けません。Railsのログと、サーバーで動いているプログラムの状態を照らし合わせましょう。',

  description:
'午後2時すぎ、カスタマーサポートから連絡が入りました。\n\n' +
'「求人検索ページ（/projects）を開くと、エラー画面が出ます」\n\n' +
'自分でも試すと、トップページ（/）は表示できるのに、\n' +
'/projects だけが 500 Internal Server Error になります。\n\n' +
'デプロイは正午に済ませたきりで、そのあと何も変更していません。\n' +
'あなたは production サーバーへSSHしました。ここからが調査です。',

  learn: [
    { name: 'tail',
      cmd: 'tail -n 100 log/production.log',
      desc: 'ファイルの末尾を表示します。\n' +
            'production.logのように際限なく伸びるログでは、まず「直近に何が起きたか」を見ます。\n' +
            'catで全部流すとスクロールバックが埋まってしまうので、本番調査の入口はほぼ常にtailです。' },
    { name: 'grep',
      cmd: 'grep -n "ERROR" log/production.log',
      desc: '大量の行から、特定の文字列を含む行だけを抜き出します。\n' +
            '-n を付けると行番号が出るので「ログのどのあたりか」が分かり、\n' +
            'そこを起点に tail や sed で前後を読み直せます。\n' +
            'Railsのログでは ERROR / Completed 500 / 例外クラス名 が手がかりになります。' },
    { name: 'パイプ |',
      cmd: 'cat log/production.log | grep ERROR | tail -n 20',
      desc: '左のコマンドの出力を、右のコマンドの入力として渡します。\n' +
            '「絞り込む」「並べ替える」「数える」を組み合わせられるのがLinuxの強みで、\n' +
            '調査の速さはほぼパイプを使えるかどうかで決まります。' },
    { name: 'systemctl',
      cmd: 'systemctl status <サービス名>',
      desc: 'systemdが管理しているサービスの生死を確認します。\n' +
            'Active: active (running) なら動作中、failed なら異常終了しています。\n' +
            'Railsの本番環境では puma / sidekiq / nginx / redis / mysql がだいたいここに載ります。' },
    { name: 'journalctl',
      cmd: 'journalctl -u <サービス名>',
      desc: 'systemdが集めた、そのサービス自身のログを読みます。\n' +
            'Railsのログには「つながらなかった」ことしか出ませんが、\n' +
            'journalctlには「なぜ落ちたか」が相手側の言葉で残っていることがあります。' },
    { name: 'ps',
      cmd: 'ps aux | grep puma',
      desc: '今動いているプロセスの一覧です。\n' +
            'serviceとしては active でもプロセスが居ない、という食い違いを見つけられます。\n' +
            'grepと組み合わせて目的のプロセスだけを見るのが定番の使い方です。' }
  ],

  startDirectory: APP + '/current',
  now: '14:05:12',
  files: files,

  /* Redisだけが落ちている */
  services: {
    redis: {
      description: 'Advanced key-value store',
      status: 'failed', result: 'exit-code',
      since: 'Mon 2026-09-14 14:01:19 JST', ago: '3min 53s ago',
      mainPid: 1530, lastPid: 1530, exitCode: 1,
      exec: '/usr/bin/redis-server 127.0.0.1:6379'
    }
  },

  journal: {
    redis: [
      'Sep 07 10:02:14 production systemd[1]: Started Advanced key-value store.',
      'Sep 14 14:01:18 production redis-server[1530]: # Background saving started by pid 4102',
      'Sep 14 14:01:19 production redis-server[1530]: # Write error saving DB on disk: No space left on device',
      'Sep 14 14:01:19 production redis-server[1530]: # Background saving error',
      'Sep 14 14:01:19 production redis-server[1530]: # Errors trying to save the DB, can\'t exit.',
      'Sep 14 14:01:19 production systemd[1]: redis.service: Main process exited, code=exited, status=1/FAILURE',
      'Sep 14 14:01:19 production systemd[1]: redis.service: Failed with result \'exit-code\'.',
      'Sep 14 14:01:19 production systemd[1]: Stopped Advanced key-value store.'
    ],
    sidekiq: [
      'Sep 14 12:00:40 production systemd[1]: Started Sidekiq background worker for myapp (production).',
      'Sep 14 12:00:43 production sidekiq[1502]: Starting processing, hit Ctrl-C to stop',
      'Sep 14 14:01:25 production sidekiq[1502]: WARN: Redis::CannotConnectError: Error connecting to Redis on 127.0.0.1:6379 (Errno::ECONNREFUSED)',
      'Sep 14 14:01:26 production sidekiq[1502]: WARN: Sidekiq is reconnecting to Redis in 1s...'
    ]
  },

  /* redis-serverは落ちているのでprocessにもportにも居ない */
  processes: window.LFR.base.processes.filter(function (p) { return p.pid !== 1530; }),
  ports: window.LFR.base.ports.filter(function (p) { return p.pid !== 1530; }),

  http: {
    'http://localhost/projects': {
      status: 500, reason: 'Internal Server Error',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><body><h1>We\'re sorry, but something went wrong.</h1></body></html>\n'
    }
  },

  /* tail -f で追尾したときに、時間経過とともに流れてくる行 */
  liveLog: {
    path: LOG,
    intervalMs: 1600,
    lines: [
'I, [2026-09-14T14:05:18.401+09:00 #1434]  INFO -- : [f1a2b3c4-5d6e-4f70-8192-a3b4c5d6e7f8] Started GET "/" for 10.0.2.22 at 2026-09-14 14:05:18 +0900',
'I, [2026-09-14T14:05:18.470+09:00 #1434]  INFO -- : [f1a2b3c4-5d6e-4f70-8192-a3b4c5d6e7f8] Completed 200 OK in 69ms (Views: 44.1ms | ActiveRecord: 11.2ms)',
'I, [2026-09-14T14:05:26.118+09:00 #1433]  INFO -- : [0a9b8c7d-6e5f-4a3b-9c2d-1e0f9a8b7c6d] Started GET "/projects" for 10.0.2.39 at 2026-09-14 14:05:26 +0900',
'I, [2026-09-14T14:05:26.120+09:00 #1433]  INFO -- : [0a9b8c7d-6e5f-4a3b-9c2d-1e0f9a8b7c6d] Processing by ProjectsController#index as HTML',
'E, [2026-09-14T14:05:27.331+09:00 #1433] ERROR -- : [0a9b8c7d-6e5f-4a3b-9c2d-1e0f9a8b7c6d] Redis::CannotConnectError (Error connecting to Redis on 127.0.0.1:6379 (Errno::ECONNREFUSED)):',
'I, [2026-09-14T14:05:27.332+09:00 #1433]  INFO -- : [0a9b8c7d-6e5f-4a3b-9c2d-1e0f9a8b7c6d] Completed 500 Internal Server Error in 1214ms',
'I, [2026-09-14T14:05:44.902+09:00 #1434]  INFO -- : [2b3c4d5e-6f70-4819-a2b3-c4d5e6f70819] Started GET "/projects?page=3" for 10.0.2.15 at 2026-09-14 14:05:44 +0900',
'E, [2026-09-14T14:05:46.117+09:00 #1434] ERROR -- : [2b3c4d5e-6f70-4819-a2b3-c4d5e6f70819] Redis::CannotConnectError (Error connecting to Redis on 127.0.0.1:6379 (Errno::ECONNREFUSED)):',
'I, [2026-09-14T14:05:46.118+09:00 #1434]  INFO -- : [2b3c4d5e-6f70-4819-a2b3-c4d5e6f70819] Completed 500 Internal Server Error in 1216ms'
    ]
  },

  hints: [
    'いきなり原因を当てにいかず、まずRails自身が何を出力しているか確認してみましょう。\n' +
    'この演習では、リクエストの処理中に起きた例外が production.log の ERROR 行に残っています。',

    'ログは /var/www/myapp/current/log/production.log にあります。\n' +
    'ただし全部catすると長すぎます。末尾だけ、あるいはERRORの行だけを見てください。\n' +
    'そこに出ている例外クラス名が、次に確認すべき相手を教えてくれます。',

    '例えばこう辿れます。\n\n' +
    '  tail -n 50 log/production.log\n' +
    '  grep -n "ERROR" log/production.log | tail -n 20\n\n' +
    '例外の相手が分かったら、そのミドルウェア自体が生きているかを systemctl status で確認します。'
  ],

  /* CASE固有の調査イベント */
  probes: [
    { key: 'foundRedisError', label: 'ログからRedis::CannotConnectErrorを見つけた',
      test: function (c, res) { return /Redis::CannotConnectError|Connection refused/.test(res.stdout); } },
    { key: 'confirmedRedisDown', label: 'Redisがfailedであることを確認した',
      test: function (c, res) { return /redis/i.test(c) && /failed|No space left|ECONNREFUSED|Connection refused/i.test(res.stdout); } },
    { key: 'checkedPumaAlive', label: 'Pumaが生きていることを確認した',
      test: function (c, res) { return /puma/i.test(c) && /active \(running\)|puma 6\.4\.2|cluster worker/.test(res.stdout); } }
  ],

  /* Investigation Scoreの「証拠」定義。全部を満たす必要はない */
  evidence: [
    { key: 'inspectedRailsLog',  weight: 12, label: 'Railsのproduction.logを読んだ' },
    { key: 'foundRedisError',    weight: 12, label: 'ログからRedisの接続エラーを見つけた' },
    { key: 'inspectedServices',  weight: 8,  label: 'systemctlでサービスの状態を見た' },
    { key: 'confirmedRedisDown', weight: 12, label: 'Redis側が落ちていることを裏取りした' },
    { key: 'checkedPumaAlive',   weight: 8,  label: 'Puma側は正常だと確認して切り分けた' },
    { key: 'inspectedJournal',   weight: 8,  label: 'journalctlで落ちた理由まで踏み込んだ' }
  ],

  question: {
    text: '/projects で 500 エラーが出ている原因として、最も可能性が高いものは？',
    choices: [
      'Pumaが停止していて、Railsがリクエストを受け取れていない',
      'Redisが停止していて、Railsがキャッシュに接続できない',
      'MySQLが停止していて、ActiveRecordがクエリを実行できない',
      'routes.rb の記述が壊れていて、/projects のルーティングが解決できない'
    ],
    answer: 1,
    explain:
'production.log には、リクエストごとに次の3行が並んでいます。\n\n' +
'  Started GET "/projects"\n' +
'  Processing by ProjectsController#index as HTML\n' +
'  Redis::CannotConnectError (Error connecting to Redis on 127.0.0.1:6379 (Errno::ECONNREFUSED))\n\n' +
'つまり、リクエストはnginxを通ってPumaに渡り、Railsのコントローラまで到達しています。\n' +
'そのうえで、ProjectsController#index の中にあるキャッシュ読み出しで例外になっています。\n\n' +
'systemctl status redis を見ると Active: failed。\n' +
'journalctl -u redis には、落ちた理由そのものが残っています。\n\n' +
'  Write error saving DB on disk: No space left on device\n\n' +
'Railsは正常に動いており、依存しているRedisが落ちているために500になっている、と判断できます。\n' +
'（なおこの「No space left on device」は、FINAL CASEでもう一度出会うことになります）',
    wrong: [
'Pumaが停止していた場合、リクエストはRailsまで届きません。\n' +
'nginxがUNIXソケットに接続できず、ブラウザには502 Bad Gatewayが返り、\n' +
'production.log には Started GET の行すら増えません。\n\n' +
'しかし今回のログには Started GET "/projects" と\n' +
'Processing by ProjectsController#index が記録されています。\n' +
'ps aux | grep puma でもワーカーが2つ動いています。\n' +
'つまりPumaは正常で、これが直接の原因である可能性は低いと判断できます。',

null,

'MySQLが停止していた場合、例外は Mysql2::Error::ConnectionError や\n' +
'ActiveRecord::ConnectionNotEstablished として出ます。\n' +
'また、DBを使うページは軒並み落ちるはずです。\n\n' +
'しかし今回のログの例外は Redis::CannotConnectError で、接続先は 127.0.0.1:6379。\n' +
'これはRedisのポートです。さらに /projects/8821 や / は 200 OK で返せています。\n' +
'DBは生きていると判断できます。',

'routes.rb に問題がある場合、そもそもルーティングが解決できないので\n' +
'ActionController::RoutingError となり、通常は500ではなく404が返ります。\n' +
'また Processing by ProjectsController#index の行は出ません。\n\n' +
'今回はコントローラのアクションまで確実に入ってから例外になっており、\n' +
'例外クラスもルーティングとは無関係です。\n' +
'cat config/routes.rb を見ても /projects の定義は残っています。'
    ]
  },

  route: {
    steps: [
      '500エラーが出ている（症状）',
      'Railsのログを読む → Redis::CannotConnectError',
      'リクエストはコントローラまで届いている → Rails/Pumaは動いている',
      'Redis自体の状態を確認する → Active: failed',
      'journalctlで落ちた理由を見る → No space left on device',
      '原因はRedisの停止と特定'
    ],
    commands: [
      'cd /var/www/myapp/current',
      'tail -n 50 log/production.log',
      'grep -n "ERROR" log/production.log | tail -n 20',
      'grep -c "Completed 500" log/production.log',
      'systemctl status redis',
      'systemctl status puma',
      'ps aux | grep puma',
      'journalctl -u redis'
    ],
    note:
'これが唯一の正解ルートではありません。\n' +
'ss -lntp で 6379 がlistenされていないことに先に気づくルートも、\n' +
'curl -I http://localhost/projects で500を再現してからログを見るルートも、\n' +
'同じ結論に辿り着けます。大事なのは、推測ではなく毎回証拠を1つずつ確認していることです。'
  }
});
})();
