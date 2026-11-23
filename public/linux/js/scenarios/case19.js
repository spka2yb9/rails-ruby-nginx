/* CASE 19 — ディスクを空けてPumaを復旧させる */
(function () {
'use strict';
var APP = '/var/www/myapp';
var LOG = APP + '/shared/log';
var base = window.LFR.base;

var files = {};

files[LOG + '/production.log'] =
'I, [2026-09-14T16:19:17.767+09:00 #1433]  INFO -- : [f11ec3b0-8a7b-4c6d-9e5f-0a1b2c3d4e5f] Completed 200 OK in 124ms (Views: 62.1ms | ActiveRecord: 13.4ms)\n' +
'W, [2026-09-14T16:20:44.118+09:00 #1434]  WARN -- : ActiveSupport::Cache::FileStore: write failed: Errno::ENOSPC: No space left on device\n' +
'W, [2026-09-14T16:21:02.771+09:00 #1434]  WARN -- : ActiveSupport::Cache::FileStore: write failed: Errno::ENOSPC: No space left on device\n';

files[LOG + '/sidekiq.log'] =
'2026-09-14T16:19:41.884Z pid=1502 tid=a12 class=EntryNotifyJob jid=9c1f2a7e40db ERROR: Errno::ENOSPC: No space left on device\n';

files[LOG + '/puma.error.log'] =
'[1421] - Worker 0 (PID: 1433) booted in 0.02s, phase: 0\n' +
'[1421] - Worker 1 (PID: 1434) booted in 0.02s, phase: 0\n';

files['/var/log/nginx/error.log'] =
'2026/09/14 16:23:44 [error] 781#781: *1502 connect() to unix:/var/www/myapp/shared/tmp/sockets/puma.sock failed (111: Connection refused) while connecting to upstream, client: 10.0.2.31, server: myapp.example.jp, request: "GET /projects HTTP/1.1"\n';

files['/etc/logrotate.d/rails'] =
'/var/www/myapp/shared/log/*.log {\n' +
'  daily\n' +
'  rotate 14\n' +
'  compress\n' +
'  delaycompress\n' +
'  missingok\n' +
'  notifempty\n' +
'  # copytruncate を使うと、Pumaが開いたままのfdを持っていても\n' +
'  # 中身だけ空にできるので再起動が要らない\n' +
'  copytruncate\n' +
'  su deploy deploy\n' +
'}\n';

files['/var/lib/mysql/ibdata1'] = 'binary\n';
files['/var/cache/apt/archives/.keep'] = '';

var sizes = {
  '/var':                                  40322596,
  '/var/www':                              35730980,
  '/var/www/myapp':                        35633188,
  '/var/www/myapp/shared':                 34654244,
  '/var/www/myapp/shared/log':             34603012,
  '/var/www/myapp/shared/log/production.log': 31457280,
  '/var/www/myapp/shared/log/sidekiq.log':     2097152,
  '/var/www/myapp/shared/log/puma.error.log':  1048576,
  '/var/www/myapp/shared/tmp':                 51200,
  '/var/www/myapp/releases':                  978944,
  '/var/lib':                                3985408,
  '/var/lib/mysql':                          3901440,
  '/var/log':                                 421888,
  '/var/cache':                               184320,
  '/usr':                                    2359296
};

var fsMeta = {};
fsMeta[LOG + '/production.log'] = { size: 31457280 * 1024 };
fsMeta[LOG + '/sidekiq.log']    = { size: 2097152 * 1024 };
fsMeta[LOG + '/puma.error.log'] = { size: 1048576 * 1024 };

function rootFs(state) {
  return (state.disk.filesystems || []).filter(function (f) { return f.mount === '/'; })[0];
}

window.LFR.scenarios.add({
  id: 'case19',
  firstLook: { name: 'どのディスクが満杯か調べる', cmd: 'df -h',
    desc: 'Use% は使用率、Mounted on はそのディスクを使う場所です。容量を空ける前に、どの行が100%かを確かめます。' },
  level: 7,
  title: 'ディスクを空けてPumaを復旧させる',
  subtitle: '再起動しても直らない。順番が要る復旧',

  description:
'FINAL CASE と同じ状況から始めます。\n\n' +
'デプロイ直後から 502。Puma は起動に失敗していて、\n' +
'journalctl には Errno::ENOSPC (No space left on device) が出ています。\n' +
'ディスクが満杯です。\n\n' +
'今回は原因の特定ではなく、**サービスを復旧させること**がゴールです。\n\n' +
'まず素直に再起動してみてください。それだけでは直りません。\n' +
'なぜ直らないのか、では何を先にやるべきかを、手を動かしながら確かめてください。\n\n' +
'最後に「同じことが数日後に起きない状態」まで持っていってください。',

  learn: [
    { name: 'truncate -s 0', cmd: 'truncate -s 0 log/production.log',
      desc: 'ファイルを消さずに、中身だけを空にします。\n\n' +
            'rm ではなく truncate を使う理由は、開いているプロセスの存在です。\n' +
            'Linuxでは、あるプロセスが開いているファイルを rm しても、\n' +
            'そのプロセスが終了するまでディスク領域は解放されません\n' +
            '（ディレクトリから消えるだけで、実体はfdが握ったまま残ります）。\n\n' +
            'truncate なら即座に容量が戻り、fdを握っているプロセスも書き続けられます。\n' +
            '「df は満杯なのに du で探しても見つからない」ときは、\n' +
            'lsof +L1 で削除済みだが開かれたままのファイルを疑ってください。\n\n' +
            '  lsof <ファイル>   そのファイルを誰が開いているか\n' +
            '  lsof +L1          削除済みなのに開かれたままのファイル' },
    { name: 'logrotate', cmd: 'sudo logrotate -f /etc/logrotate.d/rails',
      desc: 'ログを定期的にローテートして、際限なく増えるのを防ぐ仕組みです。\n' +
            '-f で「条件を待たずにいま実行」します。\n\n' +
            '設定ファイルを読むと、その環境でどう扱われるかが分かります。\n' +
            '  rotate 14      … 14世代残す\n' +
            '  compress       … 古いものは圧縮する\n' +
            '  copytruncate   … コピーしてから中身を空にする（再起動不要）\n\n' +
            '容量を空けるだけで終わらせず、ここまでやって初めて再発が止まります。' },
    { name: 'systemctl restart', cmd: 'sudo systemctl restart puma',
      desc: '復旧の実行です。ただし「原因が残ったまま再起動しても直らない」ことがあります。\n' +
            '失敗したら必ず journalctl を読んで、理由が変わったかを確認してください。' },
    { name: 'df で確認する', cmd: 'df -h',
      desc: '作業の前後で必ず見ます。数字が動いたかどうかが、操作が効いた証拠です。' },
    { name: 'curl で確認する', cmd: 'curl -I http://localhost/',
      desc: '最後はユーザーと同じ経路で確認します。\n' +
            'systemctl が active になっただけでは「直った」とは言えません。\n' +
            '実際にHTTPが200で返ってくるところまで見てください。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  fsMeta: fsMeta,
  now: '16:31:05',

  /* Pumaとsidekiqがログを開いたまま持っている。
     rm しても容量が戻らないのはこのため。 */
  /* Pumaは停止しているので production.log は誰も掴んでいない。
     動き続けている sidekiq だけが sidekiq.log を開いたまま持っている。 */
  openFiles: [
    { command: 'sidekiq', pid: 1502, user: 'deploy', fd: '8w', type: 'REG', size: '2147483648',
      path: LOG + '/sidekiq.log' }
  ],

  disk: {
    filesystems: [
      { fs: '/dev/nvme0n1p1',  mount: '/',         totalKB: 41943040, usedKB: 41943040,
        inodes: 2621440, inodesUsed: 412088 },
      { fs: 'tmpfs',           mount: '/dev/shm',  size: '3.9G', used: '0', avail: '3.9G', usePct: 0 },
      { fs: '/dev/nvme0n1p15', mount: '/boot/efi', size: '105M', used: '6.1M', avail: '99M', usePct: 6 }
    ],
    sizes: sizes
  },

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'failed', result: 'exit-code',
      since: 'Mon 2026-09-14 16:23:18 JST', ago: '7min 47s ago',
      mainPid: 9410, lastPid: 9410, exitCode: 1,
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb',
      recovery: {
        /* ディスクが満杯のあいだは、何度restartしても同じ理由で失敗する */
        blockedBy: function (state) {
          var root = rootFs(state);
          return (root && root.usePct >= 99)
            ? '! Unable to load application: Errno::ENOSPC: No space left on device @ rb_sysopen - /var/www/myapp/shared/tmp/pids/puma.pid'
            : null;
        },
        onUp: function (state) {
          state.processes = state.processes
            .filter(function (p) { return !/puma/.test(p.command); })
            .concat([
              { pid: 9510, user: 'deploy', cpu: 1.1, mem: 8.4, vsz: 1284932, rss: 344180,
                stat: 'Sl', start: 'Sep14', time: '0:00',
                command: 'puma 6.4.2 (unix:///var/www/myapp/shared/tmp/sockets/puma.sock) [myapp]' },
              { pid: 9521, user: 'deploy', cpu: 0.8, mem: 7.8, vsz: 1251104, rss: 318604,
                stat: 'Sl', start: 'Sep14', time: '0:00', command: 'puma: cluster worker 0: 9510 [myapp]' },
              { pid: 9522, user: 'deploy', cpu: 0.8, mem: 7.6, vsz: 1248832, rss: 312048,
                stat: 'Sl', start: 'Sep14', time: '0:00', command: 'puma: cluster worker 1: 9510 [myapp]' }
            ]);
          state.services.puma.mainPid = 9510;
          state.http = {
            'http://localhost/': {
              status: 200, reason: 'OK',
              headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
              body: '<!DOCTYPE html><html><head><title>Myapp</title></head><body>...</body></html>\n'
            },
            'http://localhost/projects': {
              status: 200, reason: 'OK',
              headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
              body: '<!DOCTYPE html><html><head><title>求人検索 | Myapp</title></head><body>...</body></html>\n'
            }
          };
          state.pumaRecovered = true;
        },
        onDown: function (state) {
          state.processes = state.processes.filter(function (p) { return !/puma/.test(p.command); });
          state.http = {
            'http://localhost/': {
              status: 502, reason: 'Bad Gateway',
              headers: { 'content-type': 'text/html', server: 'nginx/1.24.0' },
              body: '<html><head><title>502 Bad Gateway</title></head><body><center><h1>502 Bad Gateway</h1></center></body></html>\n'
            },
            'http://localhost/projects': {
              status: 502, reason: 'Bad Gateway',
              headers: { 'content-type': 'text/html', server: 'nginx/1.24.0' },
              body: '<html><head><title>502 Bad Gateway</title></head><body><center><h1>502 Bad Gateway</h1></center></body></html>\n'
            }
          };
        }
      }
    }
  },

  journal: {
    puma: [
      'Sep 14 16:23:14 production systemd[1]: Starting Puma HTTP Server for myapp (production)...',
      'Sep 14 16:23:17 production puma[9410]: ! Unable to load application: Errno::ENOSPC: No space left on device @ rb_sysopen - /var/www/myapp/shared/tmp/pids/puma.pid',
      'Sep 14 16:23:18 production systemd[1]: puma.service: Main process exited, code=exited, status=1/FAILURE',
      'Sep 14 16:23:18 production systemd[1]: Failed to start Puma HTTP Server for myapp (production).'
    ]
  },

  processes: base.processes.filter(function (p) { return !/puma/.test(p.command); }),

  http: {
    'http://localhost/': {
      status: 502, reason: 'Bad Gateway',
      headers: { 'content-type': 'text/html', server: 'nginx/1.24.0' },
      body: '<html><head><title>502 Bad Gateway</title></head><body><center><h1>502 Bad Gateway</h1></center></body></html>\n'
    },
    'http://localhost/projects': {
      status: 502, reason: 'Bad Gateway',
      headers: { 'content-type': 'text/html', server: 'nginx/1.24.0' },
      body: '<html><head><title>502 Bad Gateway</title></head><body><center><h1>502 Bad Gateway</h1></center></body></html>\n'
    }
  },

  hints: [
    'まず素直に sudo systemctl restart puma を打ってみてください。\n' +
    '失敗します。そのとき journalctl -u puma を読んで、\n' +
    '「なぜ失敗したのか」が変わっていないことを確認してください。',

    '原因が残ったままなので、何度再起動しても同じところで失敗します。\n' +
    '先にディスクを空けてください。どのファイルが容量を食っているかは\n' +
    'df -h と du -sh ... | sort -h で特定できます（CASE 10 と同じ手順です）。\n\n' +
    'ただし rm は使わないでください。理由は「今回使うLinux知識」に書いてあります。',

    '  truncate -s 0 log/production.log\n' +
    '  df -h                       ← 空いたことを確認\n' +
    '  sudo systemctl restart puma ← 今度は成功する\n' +
    '  curl -I http://localhost/   ← 200で返るところまで確認\n\n' +
    'さらに、数日後に同じことが起きないよう /etc/logrotate.d/rails を読んで実行してください。'
  ],

  probes: [
    { key: 'restartFailedFirst', label: '先に再起動して、直らないことを確認した',
      test: function (c, res, rt) {
        return /systemctl\s+(restart|start)\s+puma|pumactl\s+restart/.test(c) &&
               res.exitCode !== 0 && !rt.state.pumaRecovered;
      } },
    { key: 'sawDiskFull', label: 'df -h で満杯を確認した',
      test: function (c, res) { return /\bdf\b/.test(c) && /100%/.test(res.stdout); } },
    { key: 'foundHugeLog', label: '容量を食っているファイルを特定した',
      test: function (c, res) { return /production\.log/.test(res.stdout) && /30G|31457280/.test(res.stdout); } },
    { key: 'usedTruncate', label: 'truncate で中身だけ空にした',
      test: function (c, res) { return /truncate/.test(c) && res.exitCode === 0; } },
    { key: 'verifiedFreed', label: '空いたことを df で確認した',
      test: function (c, res) { return /\bdf\b/.test(c) && /2[0-9]%|1[0-9]%/.test(res.stdout); } },
    { key: 'restartSucceeded', label: '再起動に成功した',
      test: function (c, res, rt) { return rt.state.pumaRecovered; } },
    { key: 'verifiedHttp', label: 'curlで200まで確認した',
      test: function (c, res, rt) { return /\bcurl\b/.test(c) && /200 OK/.test(res.stdout + res.stderr); } },
    { key: 'setUpLogrotate', label: 'logrotateで再発を止めた',
      test: function (c, res) { return /logrotate/.test(c); } }
  ],

  evidence: [
    { key: 'restartFailedFirst', weight: 10, label: '再起動だけでは直らないと確認した' },
    { key: 'sawDiskFull',        weight: 8,  label: 'df で満杯を確認した' },
    { key: 'foundHugeLog',       weight: 10, label: '原因のファイルを特定した' },
    { key: 'usedTruncate',       weight: 16, label: 'rm ではなく truncate を使った' },
    { key: 'verifiedFreed',      weight: 10, label: '空いたことを数字で確認した' },
    { key: 'restartSucceeded',   weight: 16, label: 'Pumaを復旧させた' },
    { key: 'verifiedHttp',       weight: 10, label: 'HTTP 200 まで確認した' },
    { key: 'setUpLogrotate',     weight: 10, label: '再発防止まで手を付けた' }
  ],

  question: {
    text: 'この状況の復旧手順として、最も適切なものは？',
    choices: [
      'まず Puma を再起動する。直らなければそのとき容量を空ける',
      '容量を空けて（truncate）から Puma を再起動し、最後に logrotate で再発を止める',
      'production.log を rm で削除してから Puma を再起動する',
      'サーバーを再起動する（メモリもディスクキャッシュもまとめてリフレッシュされる）'
    ],
    answer: 1,
    explain:
'順番が結果を分けます。\n\n' +
'【まず再起動してみると、失敗する】\n' +
'  $ sudo systemctl restart puma\n' +
'  Job for puma.service failed because the control process exited with error code.\n' +
'  $ journalctl -u puma -n 5\n' +
'  puma[...]: ! Unable to load application: Errno::ENOSPC: No space left on device\n\n' +
'  理由が変わっていません。原因が残ったままなので、何度打っても同じです。\n' +
'  「とりあえず再起動」で直らないときは、失敗理由を読み直すのが先です。\n\n' +
'【容量を空ける】\n' +
'  $ df -h\n' +
'  /dev/nvme0n1p1  40G  40G  0  100%  /\n' +
'  $ du -sh /var/www/myapp/shared/log/* | sort -h\n' +
'  1.0G  puma.error.log\n' +
'  2.0G  sidekiq.log\n' +
'  30G   production.log\n' +
'  $ truncate -s 0 log/production.log\n' +
'  $ df -h\n' +
'  /dev/nvme0n1p1  40G  10G  30G  25%  /\n\n' +
'  ここで rm を使わないことが重要です。\n' +
'  Pumaやsidekiqがそのログファイルを開いたままなので、rm しても\n' +
'  ディレクトリから消えるだけで、実体はfdが握ったまま残ります。\n' +
'  つまり df の数字は戻りません。「消したのに空かない」の正体がこれです。\n' +
'  （lsof +L1 で、削除済みなのに開かれたままのファイルを確認できます）\n\n' +
'  truncate なら中身だけが即座に0になり、開いているプロセスも書き続けられます。\n\n' +
'【再起動する】\n' +
'  $ sudo systemctl restart puma\n' +
'  $ systemctl status puma\n' +
'  Active: active (running)\n' +
'  $ ps aux | grep puma\n' +
'  deploy 9510 ... puma 6.4.2 (unix:///...) [myapp]\n\n' +
'【ユーザーと同じ経路で確認する】\n' +
'  $ curl -I http://localhost/\n' +
'  HTTP/1.1 200 OK\n\n' +
'  systemctl が active になっただけでは終わりません。\n' +
'  実際に200が返るところまで見て、初めて「復旧した」と言えます。\n\n' +
'【再発を止める】\n' +
'  $ cat /etc/logrotate.d/rails\n' +
'  $ sudo logrotate -f /etc/logrotate.d/rails\n\n' +
'  ここまでやらないと、1日3〜5GB増えるログで数日後に同じ障害が起きます。\n' +
'  設定に copytruncate が入っているのは、Pumaがfdを握ったままでも\n' +
'  再起動なしで中身を空にできるようにするためです。\n\n' +
'復旧作業は「動かす」で終わりではありません。\n' +
'動かす → 確認する → 同じことが起きない状態にする。ここまでが1セットです。',
    wrong: [
'「まず再起動」は悪くない発想ですが、今回は直りません。\n' +
'実際に打ってみると Job for puma.service failed になり、\n' +
'journalctl の理由も ENOSPC のまま変わりません。\n\n' +
'再起動が効くのは「プロセスの状態がおかしい」ときです。\n' +
'今回のように環境側の前提（容量）が壊れている場合は、\n' +
'そちらを直さない限り何度再起動しても同じ場所で失敗します。\n\n' +
'失敗したときに journalctl を読み直せていれば、この判断はできます。',
null,
'rm を選ぶと、2つの理由で困ります。\n\n' +
'【1】いまは動くが、条件が変われば動かない\n\n' +
'  今回はPumaが停止しているため、production.log は誰も開いていません。\n' +
'  なので rm しても容量は戻ります（lsof で確認できます）。\n\n' +
'  $ lsof /var/www/myapp/shared/log/production.log\n' +
'  （何も出ない）\n\n' +
'  しかしPumaが動いたままなら、話が変わります。\n' +
'  Linuxでは、あるプロセスが開いているファイルを rm しても\n' +
'  ディレクトリから名前が消えるだけで、実体はfdが握ったまま残ります。\n' +
'  解放されるのは、開いていた全プロセスが終了したときです。\n\n' +
'  実際 sidekiq は動いていて sidekiq.log を開いています。\n' +
'  これを rm しても df の数字は1バイトも変わりません。\n' +
'  （lsof +L1 で「削除済みなのに開かれたままのファイル」として見えます）\n\n' +
'  「今回はたまたま動く方法」より「いつでも動く方法」を選んでください。\n\n' +
'【2】調査中の証拠が消える\n\n' +
'  30GBのログには、なぜこうなったかの記録が入っています。\n' +
'  truncate -s 0 なら中身は空になりますが、少なくとも\n' +
'  「消す」という操作を意識的に選んだことになります。\n' +
'  本当に必要なら、先に tail -n 10000 > /tmp/last.log などで退避してください。',
'サーバー再起動は影響範囲が大きすぎますし、根本解決にもなりません。\n\n' +
'再起動すればPumaが握っていたfdは解放されますが、\n' +
'production.log そのものは30GBのまま残っているので、ディスクは空きません。\n' +
'起動時にまた ENOSPC で失敗します。\n\n' +
'加えて、nginx も Redis も MySQL も止まるので、\n' +
'いま502で済んでいるものが完全な停止に変わります。'
    ]
  },

  route: {
    steps: [
      '症状と失敗理由を確認する（curl / systemctl / journalctl）',
      'まず再起動を試し、同じ理由で失敗することを確認する',
      '容量を確認する（df -h → 100%）',
      '何が食っているかを絞り込む（du ... | sort -h）',
      'rm ではなく truncate で中身を空にする',
      'df で空いたことを確認する',
      '再起動して active になったことを確認する',
      'curl で200が返るところまで確認する',
      'logrotate を実行して再発を止める'
    ],
    commands: [
      'curl -I http://localhost/',
      'systemctl status puma',
      'sudo systemctl restart puma',
      'journalctl -u puma -n 6',
      'df -h',
      'du -sh /var/www/myapp/shared/log/* | sort -h',
      'truncate -s 0 log/production.log',
      'df -h',
      'sudo systemctl restart puma',
      'systemctl status puma',
      'ps aux | grep puma',
      'curl -I http://localhost/',
      'cat /etc/logrotate.d/rails',
      'sudo logrotate -f /etc/logrotate.d/rails'
    ],
    note:
'先に df -h を見てから truncate する順番でも構いません。\n' +
'ただし「一度は再起動を試して、失敗理由が変わらないことを自分で見る」経験は\n' +
'一度やっておく価値があります。本番では必ずその誘惑にかられるからです。'
  }
});
})();
