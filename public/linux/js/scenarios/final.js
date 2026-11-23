/* FINAL CASE — 総合障害演習：デプロイ直後から502が発生している */
(function () {
'use strict';
var APP = '/var/www/myapp';
var base = window.LFR.base;

var files = {};

/* Railsのログは502になる直前で止まっている。
   ただし止まる手前に、すでに書き込み失敗の兆候が出ている。 */
var log = [];
for (var i = 0; i < 30; i++) {
  var mm = String(10 + Math.floor(i / 3)).padStart(2, '0');
  var ss = String((i * 13) % 60).padStart(2, '0');
  var t = '2026-09-14T16:' + mm + ':' + ss + '.' + String(100 + i * 23).slice(0, 3) + '+09:00';
  var rid = 'f' + (i * 40503).toString(16).padStart(6, '0') + '-8a7b-4c6d-9e5f-0a1b2c3d4e5f';
  log.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Started GET "/projects" for 10.0.2.' + (10 + i) + ' at 2026-09-14 16:' + mm + ':' + ss + ' +0900');
  log.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Completed 200 OK in ' + (95 + i) + 'ms (Views: 62.1ms | ActiveRecord: 13.4ms)');
}
log.push('W, [2026-09-14T16:20:44.118+09:00 #1434]  WARN -- : ActiveSupport::Cache::FileStore: write failed: Errno::ENOSPC: No space left on device @ io_write - /var/www/myapp/shared/tmp/cache/9A2/B31/projects-index');
log.push('W, [2026-09-14T16:21:02.771+09:00 #1434]  WARN -- : ActiveSupport::Cache::FileStore: write failed: Errno::ENOSPC: No space left on device @ io_write - /var/www/myapp/shared/tmp/cache/9A2/B31/projects-index');
files[APP + '/shared/log/production.log'] = log.join('\n') + '\n';

files[APP + '/shared/log/sidekiq.log'] =
'2026-09-14T16:19:41.118Z pid=1502 tid=a12 class=EntryNotifyJob jid=9c1f2a7e40db INFO: start\n' +
'2026-09-14T16:19:41.884Z pid=1502 tid=a12 class=EntryNotifyJob jid=9c1f2a7e40db ERROR: Errno::ENOSPC: No space left on device\n' +
'2026-09-14T16:20:12.402Z pid=1502 tid=a12 class=EntryNotifyJob jid=9c1f2a7e40db INFO: fail: retrying in 15s\n';

files[APP + '/shared/log/puma.error.log'] =
'[1421] - Worker 0 (PID: 1433) booted in 0.02s, phase: 0\n' +
'[1421] - Worker 1 (PID: 1434) booted in 0.02s, phase: 0\n';

files['/var/log/nginx/error.log'] =
'2026/09/14 16:23:44 [error] 781#781: *1502 connect() to unix:/var/www/myapp/shared/tmp/sockets/puma.sock failed (111: Connection refused) while connecting to upstream, client: 10.0.2.31, server: myapp.example.jp, request: "GET /projects HTTP/1.1"\n' +
'2026/09/14 16:25:02 [error] 781#781: *1511 connect() to unix:/var/www/myapp/shared/tmp/sockets/puma.sock failed (111: Connection refused) while connecting to upstream, client: 10.0.2.18, server: myapp.example.jp, request: "GET / HTTP/1.1"\n' +
'2026/09/14 16:27:31 [crit] 781#781: *1520 open() "/var/lib/nginx/tmp/proxy/3/00/0000000003" failed (28: No space left on device) while reading upstream\n';

files['/home/deploy/deploy.log'] =
'16:22:10 deploy:updating\n' +
'      ✔ 01 deploy@production 0.418s\n' +
'16:22:48 bundler:install\n' +
'      ✔ 01 deploy@production 9.214s\n' +
'16:23:02 deploy:symlink:release\n' +
'      ✔ 01 deploy@production 0.191s\n' +
'16:23:12 puma:restart\n' +
'      01 sudo systemctl restart puma\n' +
'      ✔ 01 deploy@production 2.004s\n' +
'16:23:20 deploy:published\n';

files[APP + '/shared/log/logrotate-notes.md'] =
'# ログ運用のTODO\n' +
'\n' +
'- production.log を logrotate に登録する（未対応）\n' +
'- config.log_level を :info から :warn へ下げる検討（未対応）\n' +
'- 現状 1日あたり 3〜5GB 増えている\n';

files['/var/lib/mysql/ibdata1'] = 'binary\n';
files['/var/cache/apt/archives/.keep'] = '';
files['/var/log/syslog'] = 'Sep 14 16:27:44 production systemd[1]: Failed to start Puma HTTP Server for myapp (production).\n';

var sizes = {
  '/var':                                       40322596,
  '/var/www':                                   35730980,
  '/var/www/myapp':                             35633188,
  '/var/www/myapp/shared':                      34654244,
  '/var/www/myapp/shared/log':                  34603012,
  '/var/www/myapp/shared/log/production.log':   31457280,
  '/var/www/myapp/shared/log/sidekiq.log':       2097152,
  '/var/www/myapp/shared/log/puma.error.log':    1048576,
  '/var/www/myapp/shared/log/logrotate-notes.md':      4,
  '/var/www/myapp/shared/tmp':                     51200,
  '/var/www/myapp/shared/config':                     32,
  '/var/www/myapp/releases':                      978944,
  '/var/lib':                                    3985408,
  '/var/lib/mysql':                              3901440,
  '/var/log':                                     421888,
  '/var/log/nginx':                               387072,
  '/var/cache':                                   184320,
  '/tmp':                                          18432,
  '/home':                                          8192,
  '/usr':                                        2359296
};

var fsMeta = {};
fsMeta[APP + '/shared/log/production.log'] = { size: 31457280 * 1024 };
fsMeta[APP + '/shared/log/sidekiq.log']    = { size: 2097152 * 1024 };
fsMeta[APP + '/shared/log/puma.error.log'] = { size: 1048576 * 1024 };

window.LFR.scenarios.add({
  id: 'final',
  level: 6,
  title: 'デプロイ直後から502が発生している',
  subtitle: '総合障害演習 — 1つのコマンドでは答えに辿り着けません',

  description:
'16:23、通常のデプロイを実施しました。\n' +
'デプロイ自体は最後まで成功しています（cap aborted は出ていません）。\n\n' +
'その直後から、Railsアプリへアクセスすると 502 Bad Gateway が返るようになりました。\n' +
'トップページも求人一覧も、すべて502です。\n\n' +
'あなたは production サーバーへSSHしました。\n\n' +
'ここまでのCASEで身につけた道具を全部使ってください。\n' +
'ログ・サービス・プロセス・ポート・ディスク・メモリ。\n' +
'どれか1つを見ただけでは、本当の原因には辿り着けません。\n' +
'「なぜ？」をもう一段ずつ掘り下げてください。',

  learn: [
    { name: '症状から始める', cmd: 'curl -I http://localhost/',
      desc: 'まず自分の目で症状を確認します。502が返ることを確定させてください。\n' +
            '502は「nginxはいるが、その先（Puma）に繋がらない」という意味です。\n' +
            'nginxのエラーログにも、繋がらなかった相手が記録されています。' },
    { name: 'Railsのログが増えているか', cmd: 'tail -n 5 log/production.log',
      desc: '増えていればRailsは動いています。増えていなければ起動していません。\n' +
            'この分岐で、次に読むログが決まります。\n' +
            '  増えている  → production.log を読む\n' +
            '  増えていない → journalctl を読む' },
    { name: 'サービスとプロセス', cmd: 'systemctl status puma',
      desc: 'systemdの認識（active / failed）と、ps で見えるプロセスの実態。\n' +
            'この2つを照らし合わせてください。' },
    { name: '起動できなかった理由', cmd: 'journalctl -u puma -n 30',
      desc: 'Railsが起動する前に失敗した場合、理由はここにしか残りません。\n' +
            'エラーの Errno を正確に読み取ってください。\n' +
            '  ENOSPC … 容量不足   EACCES … 権限   EADDRINUSE … ポート競合' },
    { name: '容量を確認する', cmd: 'df -h',
      desc: 'ENOSPC が出ていたら、まず df -h です。\n' +
            'どのファイルシステムが何%なのかを確認します。' },
    { name: '容量の内訳を辿る', cmd: 'du -sh /var/* | sort -h',
      desc: '上の階層から順に、大きい枝だけを追っていきます。\n' +
            'df が「満杯かどうか」、du が「何のせいか」を教えてくれます。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  fsMeta: fsMeta,
  now: '16:29:14',

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'failed', result: 'exit-code',
      since: 'Mon 2026-09-14 16:23:18 JST', ago: '5min 56s ago',
      mainPid: 9410, lastPid: 9410, exitCode: 1,
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb'
    },
    sidekiq: {
      description: 'Sidekiq background worker for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Mon 2026-09-14 12:00:40 JST', ago: '4h 28min ago',
      mainPid: 1502, tasks: 14, memory: '254.1M',
      exec: '/home/deploy/.rbenv/shims/bundle exec sidekiq -e production'
    }
  },

  journal: {
    puma: [
      'Sep 14 12:00:33 production systemd[1]: Started Puma HTTP Server for myapp (production).',
      'Sep 14 16:23:12 production systemd[1]: Stopping Puma HTTP Server for myapp (production)...',
      'Sep 14 16:23:13 production systemd[1]: Stopped Puma HTTP Server for myapp (production).',
      'Sep 14 16:23:14 production systemd[1]: Starting Puma HTTP Server for myapp (production)...',
      'Sep 14 16:23:16 production puma[9410]: Puma starting in cluster mode...',
      'Sep 14 16:23:16 production puma[9410]: * Puma version: 6.4.2 ("The Eagle of Durango")',
      'Sep 14 16:23:16 production puma[9410]: *      Workers: 2',
      'Sep 14 16:23:17 production puma[9410]: ! Unable to load application: Errno::ENOSPC: No space left on device @ rb_sysopen - /var/www/myapp/shared/tmp/pids/puma.pid',
      'Sep 14 16:23:17 production puma[9410]: bundler: failed to load command: puma',
      'Sep 14 16:23:18 production systemd[1]: puma.service: Main process exited, code=exited, status=1/FAILURE',
      'Sep 14 16:23:18 production systemd[1]: puma.service: Failed with result \'exit-code\'.',
      'Sep 14 16:23:18 production systemd[1]: Failed to start Puma HTTP Server for myapp (production).'
    ],
    sidekiq: [
      'Sep 14 12:00:40 production systemd[1]: Started Sidekiq background worker for myapp (production).',
      'Sep 14 16:19:41 production sidekiq[1502]: ERROR: Errno::ENOSPC: No space left on device'
    ],
    nginx: [
      'Sep 07 10:02:11 production systemd[1]: Started A high performance web server and a reverse proxy server.'
    ]
  },

  processes: base.processes.filter(function (p) { return !/puma/.test(p.command); }),

  disk: {
    filesystems: [
      { fs: '/dev/nvme0n1p1',  size: '40G',  used: '40G',  avail: '0',    usePct: 100, mount: '/' },
      { fs: 'tmpfs',           size: '3.9G', used: '0',    avail: '3.9G', usePct: 0,   mount: '/dev/shm' },
      { fs: '/dev/nvme0n1p15', size: '105M', used: '6.1M', avail: '99M',  usePct: 6,   mount: '/boot/efi' }
    ],
    sizes: sizes
  },

  system: {
    uptime: { since: '7 days, 23:22', users: 1, load: [1.84, 1.21, 0.94] },
    cpu:    { cores: 4, us: 6.2, sy: 3.1, id: 88.4, wa: 2.3 },
    mem:    { total: 7823, used: 3402, free: 1188, shared: 68, buffCache: 3233, available: 4106 },
    swap:   { total: 2047, used: 0, free: 2047 }
  },

  http: {
    'http://localhost/': {
      status: 502, reason: 'Bad Gateway',
      headers: { 'content-type': 'text/html', server: 'nginx/1.24.0' },
      body: '<html><head><title>502 Bad Gateway</title></head><body><center><h1>502 Bad Gateway</h1></center><hr><center>nginx/1.24.0</center></body></html>\n'
    },
    'http://localhost/projects': {
      status: 502, reason: 'Bad Gateway',
      headers: { 'content-type': 'text/html', server: 'nginx/1.24.0' },
      body: '<html><head><title>502 Bad Gateway</title></head><body><center><h1>502 Bad Gateway</h1></center><hr><center>nginx/1.24.0</center></body></html>\n'
    }
  },

  hints: [
    '502はnginxが返しています。つまりnginxは動いていて、その先に繋がっていません。\n' +
    'まずは「Railsが動いているか」を確認してください。\n' +
    'そのうえで、Railsのログが増えているかどうかで次に読むログを決めます。',

    'Pumaが起動できていないことが分かったら、その理由を journalctl で読んでください。\n' +
    'エラーの Errno を正確に読み取るのが鍵です。\n' +
    'そこに出てくる単語は、この先の調査をどこへ向けるかを決めます。',

    'journalctl -u puma に No space left on device が出ています。\n' +
    'ここで止まらず、もう一段掘ってください。\n\n' +
    '  df -h                       どのファイルシステムが満杯か\n' +
    '  du -sh /var/* | sort -h     何がその容量を使っているか\n\n' +
    'そこからさらに階層を降りて、原因のファイルまで特定してください。'
  ],

  probes: [
    { key: 'reproduced502', label: '502を自分で再現した',
      test: function (c, res) { return /502/.test(res.stdout + res.stderr); } },
    { key: 'sawPumaFailed', label: 'Pumaがfailedだと確認した',
      test: function (c, res) { return /failed \(Result|Active: .*failed/.test(res.stdout); } },
    { key: 'sawNoPumaProcess', label: 'Pumaのプロセスが無いことを確認した',
      test: function (c, res) { return /\b(ps|pgrep)\b/.test(c) && /puma/.test(c) && !/cluster worker/.test(res.stdout); } },
    { key: 'foundEnospcInJournal', label: 'journalctlでENOSPCを見つけた',
      test: function (c, res) { return /journalctl|systemctl/.test(c) && /No space left on device|ENOSPC/.test(res.stdout); } },
    { key: 'sawDiskFull', label: 'df -h で / が100%だと確認した',
      test: function (c, res) { return /\bdf\b/.test(c) && /100%/.test(res.stdout); } },
    { key: 'narrowedWithDu', label: 'du で大きいディレクトリを絞り込んだ',
      test: function (c, res) { return /\bdu\b/.test(c) && /[0-9.]+G/.test(res.stdout); } },
    { key: 'foundHugeLog', label: '巨大化したRailsログを特定した',
      test: function (c, res) { return /production\.log/.test(res.stdout) && /30G|31457280/.test(res.stdout); } },
    { key: 'checkedMemory', label: 'メモリ・負荷も確認して切り分けた',
      test: function (c) { return /\bfree\b|\buptime\b|\btop\b/.test(c); } },
    { key: 'sawRootCauseNote', label: 'ログが肥大化していた理由まで確認した',
      test: function (c, res) { return /logrotate に登録|log_level/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'reproduced502',        weight: 6,  label: '症状を自分で再現した' },
    { key: 'sawPumaFailed',        weight: 8,  label: 'Pumaがfailedだと確認した' },
    { key: 'sawNoPumaProcess',     weight: 6,  label: 'プロセスの実態も確認した' },
    { key: 'foundEnospcInJournal', weight: 16, label: 'journalctlでENOSPCを見つけた' },
    { key: 'sawDiskFull',          weight: 14, label: 'df -h でディスク満杯を確認した' },
    { key: 'narrowedWithDu',       weight: 12, label: 'du で原因の場所を絞り込んだ' },
    { key: 'foundHugeLog',         weight: 16, label: '巨大化したログを特定した' },
    { key: 'sawRootCauseNote',     weight: 6,  label: '肥大化した理由まで確認した' },
    { key: 'checkedMemory',        weight: 4,  label: '他の資源も確認して切り分けた' }
  ],

  question: {
    text: 'デプロイ直後から502が出ている根本原因は？',
    choices: [
      'デプロイしたコードに文法エラーがあり、Railsがロードできていない',
      'ディスクが満杯で、Pumaが起動時にpidfileを作成できず起動に失敗している',
      'puma.rb の設定が変わり、nginxが見ているソケットのパスとずれている',
      'Redisが停止していて、Railsが起動時の初期化に失敗している'
    ],
    answer: 1,
    explain:
'順番に掘ると、5段階で原因に辿り着きます。\n\n' +
'【1】症状を確定する\n' +
'  $ curl -I http://localhost/\n' +
'  HTTP/1.1 502 Bad Gateway\n' +
'  $ tail -n 3 /var/log/nginx/error.log\n' +
'  connect() to unix:/.../puma.sock failed (111: Connection refused)\n\n' +
'  nginxは生きていて、Pumaに繋がっていません。\n\n' +
'【2】Railsは動いているか\n' +
'  $ tail -n 5 log/production.log       → 16:21で止まっている\n' +
'  $ systemctl status puma              → Active: failed\n' +
'  $ ps aux | grep puma                 → 1件も無い\n\n' +
'  Railsは起動していません。production.log を読んでも先はありません。\n\n' +
'【3】なぜ起動できなかったか\n' +
'  $ journalctl -u puma -n 30\n' +
'  puma[9410]: ! Unable to load application:\n' +
'      Errno::ENOSPC: No space left on device @ rb_sysopen -\n' +
'      /var/www/myapp/shared/tmp/pids/puma.pid\n\n' +
'  pidfileを作れずに起動できていません。ENOSPC＝容量不足です。\n' +
'  ここで「ディスクが足りない」と分かりますが、まだ原因ではありません。\n\n' +
'【4】どれくらい足りないのか\n' +
'  $ df -h\n' +
'  /dev/nvme0n1p1  40G  40G  0  100%  /\n\n' +
'  ルートが100%です。1バイトも書けません。\n\n' +
'【5】何がその容量を使っているのか\n' +
'  $ du -sh /var/* | sort -h\n' +
'  180M  /var/cache\n' +
'  412M  /var/log\n' +
'  3.8G  /var/lib\n' +
'  34G   /var/www\n\n' +
'  $ du -sh /var/www/myapp/shared/* | sort -h\n' +
'  32K   config\n' +
'  50M   tmp\n' +
'  33G   log\n\n' +
'  $ ls -lh /var/www/myapp/shared/log\n' +
'  -rw-r--r--  deploy deploy   30G  production.log\n' +
'  -rw-r--r--  deploy deploy  2.0G  sidekiq.log\n' +
'  -rw-r--r--  deploy deploy  1.0G  puma.error.log\n\n' +
'production.log 1本で30GB。ディスクの4分の3をログが占めています。\n\n' +
'--- 因果関係を整理すると ---\n\n' +
'  Railsログが肥大化（logrotate未設定 / log_level が :info）\n' +
'    ↓\n' +
'  ディスクが100%になる\n' +
'    ↓\n' +
'  16:19 Sidekiq が ENOSPC で失敗しはじめる\n' +
'  16:20 Rails のキャッシュ書き込みが ENOSPC で失敗しはじめる（production.log の末尾）\n' +
'    ↓\n' +
'  16:23 デプロイでPumaを再起動\n' +
'    ↓\n' +
'  Pumaが pidfile を作れず起動失敗\n' +
'    ↓\n' +
'  nginxがupstreamに繋げず 502\n\n' +
'重要なのは「デプロイが原因ではない」ことです。\n' +
'ディスクは少し前から満杯で、兆候はログにも出ていました。\n' +
'デプロイによる再起動が、それを表面化させただけです。\n' +
'再起動しなければ、動き続けているPumaのおかげでしばらく気づけませんでした。\n\n' +
'shared/log/logrotate-notes.md に、根本原因がそのまま書かれています。\n\n' +
'  - production.log を logrotate に登録する（未対応）\n' +
'  - config.log_level を :info から :warn へ下げる検討（未対応）\n' +
'  - 現状 1日あたり 3〜5GB 増えている\n\n' +
'--- 復旧するときの順番 ---\n\n' +
'1. まず容量を空ける。ただし rm ではなく truncate -s 0 を使います。\n' +
'   rm で消しても、開いているプロセスがある限り容量は戻りません。\n' +
'2. Pumaを起動して502を解消する。\n' +
'3. logrotate を設定して、再発を止める。\n' +
'4. log_level を見直す、ログを外部へ転送する、容量監視を入れる。\n\n' +
'1だけやって終わらせると、数日後にまったく同じ障害が起きます。',
    wrong: [
'コードの文法エラーではありません。\n' +
'その場合は journalctl に SyntaxError や NameError が\n' +
'ファイル名と行番号付きで出ます。\n\n' +
'実際に出ているのは Errno::ENOSPC: No space left on device です。\n' +
'これはOSが「書き込む場所が無い」と言っているエラーで、\n' +
'アプリのコードとは無関係です。\n\n' +
'またデプロイログを見ると bundler:install も symlink も ✔ で成功しています。\n' +
'エラーの Errno を読み分けることが、この演習の中心です。',
null,
'puma.rb は変更されていません。\n' +
'cat /var/www/myapp/shared/config/puma.rb の bind は\n' +
'unix:///var/www/myapp/shared/tmp/sockets/puma.sock のままで、\n' +
'nginxの proxy_pass が見ている先と一致しています。\n\n' +
'パスがずれているのであれば、Pumaは起動に成功したうえで\n' +
'nginxだけが繋がらない状態になります。\n' +
'しかし今回はPuma自体が起動していません（systemctl status puma は failed）。\n' +
'journalctl の Errno::ENOSPC が直接の理由です。',
'Redisは動いています。\n' +
'systemctl status redis は active (running)、\n' +
'ss -lntp にも 127.0.0.1:6379 がlistenとして出ています。\n\n' +
'またRedisの停止は、Railsの起動そのものを妨げません。\n' +
'リクエスト処理中に Redis::CannotConnectError が出て500になるだけで、\n' +
'502にはなりません（CASE 04 / CASE 08 で扱ったパターンです）。\n' +
'今回は500ではなく502、つまりPumaまで到達していません。'
    ]
  },

  route: {
    steps: [
      '症状を再現する（curl → 502 / nginxのエラーログ）',
      'Railsが動いているか確認する（production.log が止まっている）',
      'Pumaの状態と実態を確認する（systemctl failed / ps に居ない）',
      '起動できなかった理由を読む（journalctl → Errno::ENOSPC）',
      '容量を確認する（df -h → / が100%）',
      '何が使っているかを辿る（du -sh … | sort -h を階層ごとに）',
      '巨大化したファイルを特定する（ls -lh → production.log 30G）',
      'なぜ肥大化したかを確認する（logrotate未設定 / log_level）'
    ],
    commands: [
      'curl -I http://localhost/',
      'tail -n 5 /var/log/nginx/error.log',
      'tail -n 5 log/production.log',
      'systemctl status puma',
      'ps aux | grep puma',
      'journalctl -u puma -n 30',
      'df -h',
      'du -sh /var/* | sort -h',
      'du -sh /var/www/myapp/shared/* | sort -h',
      'ls -lh /var/www/myapp/shared/log',
      'cat /var/www/myapp/shared/log/logrotate-notes.md',
      'free -h',
      'uptime'
    ],
    note:
'順番は人によって違って構いません。\n' +
'先に df -h を打って100%に気づき、そこからPumaを見に行くルートもあります。\n' +
'Sidekiqのログに出ていたENOSPCから入るルートもあります。\n\n' +
'大事なのは、ENOSPC を見つけた時点で止まらなかったことです。\n' +
'「容量が足りない」は症状であって原因ではありません。\n' +
'df でどこが、du で何が、ls でどのファイルが、と1段ずつ掘り下げて、\n' +
'最後に「なぜそうなったのか」まで辿り着けたなら、それが本番の障害対応です。'
  }
});
})();
