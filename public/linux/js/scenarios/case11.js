/* CASE 11 — 特定ポートを使用しているprocessを調査する */
(function () {
'use strict';
var APP = '/var/www/myapp';
var base = window.LFR.base;

var files = {};
files[APP + '/shared/config/puma.rb'] =
'#!/usr/bin/env puma\n' +
'directory "/var/www/myapp/current"\n' +
'environment "production"\n' +
'\n' +
'pidfile "/var/www/myapp/shared/tmp/pids/puma.pid"\n' +
'stdout_redirect "/var/www/myapp/shared/log/puma.access.log", "/var/www/myapp/shared/log/puma.error.log", true\n' +
'\n' +
'threads 5, 5\n' +
'workers 2\n' +
'preload_app!\n' +
'\n' +
'# 2026-09-14 変更: 監視からヘルスチェックを直接叩けるようTCPへ変更\n' +
'bind "tcp://0.0.0.0:3000"\n';

files[APP + '/shared/log/puma.error.log'] =
'[9410] Puma starting in cluster mode...\n' +
'[9410] * Puma version: 6.4.2 ("The Eagle of Durango")\n' +
'[9410] *      Workers: 2\n' +
'[9410] ! Unable to load application: Errno::EADDRINUSE: Address already in use - bind(2) for "0.0.0.0" port 3000\n' +
'bundler: failed to load command: puma (/home/deploy/.rbenv/versions/3.3.4/bin/puma)\n';

files['/home/deploy/deploy.log'] =
'  01 bundle exec puma -C /var/www/myapp/shared/config/puma.rb\n' +
'      01 Errno::EADDRINUSE: Address already in use - bind(2) for "0.0.0.0" port 3000\n' +
'  Tasks: TOP => puma:restart\n' +
'  (Backtrace restricted to imported tasks)\n' +
'  cap aborted!\n';

window.LFR.scenarios.add({
  id: 'case11',
  level: 3,
  title: '特定ポートを使用しているprocessを調査する',
  subtitle: 'Address already in use の相手を突き止める',

  description:
'デプロイが失敗しました。Capistranoのログにはこう出ています。\n\n' +
'  Errno::EADDRINUSE: Address already in use - bind(2) for "0.0.0.0" port 3000\n\n' +
'今回のデプロイから、Pumaの待ち受けをUNIXソケットではなく\n' +
'TCPの3000番ポートへ変更しています。\n\n' +
'3000番を誰かがすでに使っているようです。\n' +
'それが何なのかを突き止めてください。',

  learn: [
    { name: 'ss -lntp', cmd: 'ss -lntp',
      desc: 'listenしているソケットを一覧します。もっとも使うオプションの組み合わせです。\n\n' +
            '  -l listen中のみ\n' +
            '  -n ポート番号を名前（http等）に変換しない\n' +
            '  -t TCPのみ\n' +
            '  -p そのポートを掴んでいるプロセス名とPIDを表示\n\n' +
            '「このポート、誰が使ってる？」に答えられる唯一のコマンドだと思ってください。\n' +
            '（昔は netstat -lntp でした。今のディストリビューションでは ss が標準です）' },
    { name: 'ポートで絞る', cmd: 'ss -lntp | grep 3000',
      desc: 'listenが多いサーバーでは、目的のポートだけをgrepで抜きます。\n' +
            '出力が1行になるので、PIDとプロセス名を読み違えません。' },
    { name: 'PIDから実体を辿る', cmd: 'ps aux | grep ruby',
      desc: 'ss が教えてくれるのはプロセス名とPIDだけです。\n' +
            '「そのプロセスが何者か」は ps でコマンドライン全体を見て判断します。\n' +
            '起動時刻（START）も一緒に見ると、いつからいるのかが分かります。' },
    { name: 'systemctl status', cmd: 'systemctl status puma',
      desc: 'そのプロセスがsystemd管理下にあるかを確認します。\n' +
            'systemd管理下なら systemctl stop で止められますが、\n' +
            '手動で起動されたプロセスはsystemdからは見えません。' },
    { name: 'journalctl', cmd: 'journalctl -u puma -n 20',
      desc: '起動に失敗したサービスが、何を理由に失敗したかを読みます。\n' +
            'EADDRINUSE のようなbindエラーはここに残ります。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '15:22:07',

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'failed', result: 'exit-code',
      since: 'Mon 2026-09-14 15:20:44 JST', ago: '1min 23s ago',
      mainPid: 9410, lastPid: 9410, exitCode: 1,
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb'
    }
  },

  journal: {
    puma: [
      'Sep 14 15:20:42 production systemd[1]: Starting Puma HTTP Server for myapp (production)...',
      'Sep 14 15:20:43 production puma[9410]: Puma starting in cluster mode...',
      'Sep 14 15:20:44 production puma[9410]: ! Unable to load application: Errno::EADDRINUSE: Address already in use - bind(2) for "0.0.0.0" port 3000',
      'Sep 14 15:20:44 production puma[9410]: bundler: failed to load command: puma',
      'Sep 14 15:20:44 production systemd[1]: puma.service: Main process exited, code=exited, status=1/FAILURE',
      'Sep 14 15:20:44 production systemd[1]: puma.service: Failed with result \'exit-code\'.'
    ]
  },

  /* 3000番を掴んでいるのは、8月に手動で起動されたまま残っている rails server */
  processes: base.processes
    .filter(function (p) { return !/puma/.test(p.command); })
    .concat([
      { pid: 3182, user: 'deploy', cpu: 0.0, mem: 5.1, vsz: 986432, rss: 208944,
        stat: 'Sl', start: 'Aug28', time: '2:14',
        command: 'ruby /var/www/myapp/releases/20260913150000/bin/rails server -b 0.0.0.0 -p 3000 -e production' }
    ]),

  ports: [
    { proto: 'tcp', state: 'LISTEN', recvq: 0, sendq: 511, local: '0.0.0.0:80',     peer: '0.0.0.0:*', pid: 780,  process: 'nginx' },
    { proto: 'tcp', state: 'LISTEN', recvq: 0, sendq: 128, local: '0.0.0.0:22',     peer: '0.0.0.0:*', pid: 612,  process: 'sshd' },
    { proto: 'tcp', state: 'LISTEN', recvq: 0, sendq: 511, local: '127.0.0.1:6379', peer: '0.0.0.0:*', pid: 1530, process: 'redis-server' },
    { proto: 'tcp', state: 'LISTEN', recvq: 0, sendq: 1024, local: '0.0.0.0:3000',  peer: '0.0.0.0:*', pid: 3182, process: 'ruby' }
  ],

  hints: [
    'エラーメッセージは「0.0.0.0の3000番をbindできなかった」と言っています。\n' +
    'つまり、すでに誰かがそのポートを掴んでいます。\n' +
    'listenしているポートとプロセスを一覧できるコマンドを使ってください。',

    'ss -lntp を実行して、Local Address:Port が 3000 になっている行を探してください。\n' +
    '一覧が長ければ grep 3000 で絞れます。\n' +
    'Process の列に、掴んでいるプロセス名とPIDが出ます。',

    'PIDが分かったら、それが何者かを ps aux で確認してください。\n' +
    'コマンドラインと START（起動日）を見ると、正体が見えてきます。'
  ],

  probes: [
    { key: 'usedSs', label: 'ss でlisten状況を確認した',
      test: function (c) { return /\bss\b|\bnetstat\b|\blsof\b/.test(c); } },
    { key: 'foundPort3000', label: '3000番を掴んでいるプロセスを見つけた',
      test: function (c, res) { return /0\.0\.0\.0:3000/.test(res.stdout); } },
    { key: 'identifiedProcess', label: 'そのプロセスがrails serverだと特定した',
      test: function (c, res) { return /rails server|bin\/rails/.test(res.stdout); } },
    { key: 'sawOldStart', label: '起動日が古いことに気づいた',
      test: function (c, res) { return /Aug28/.test(res.stdout); } },
    { key: 'sawEaddrinuse', label: 'EADDRINUSE をログで確認した',
      test: function (c, res) { return /EADDRINUSE|Address already in use/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'sawEaddrinuse',     weight: 8,  label: '起動失敗の理由（EADDRINUSE）を確認した' },
    { key: 'usedSs',            weight: 10, label: 'ss -lntp でlistenを確認した' },
    { key: 'foundPort3000',     weight: 16, label: '3000番を掴んでいるPIDを特定した' },
    { key: 'identifiedProcess', weight: 16, label: 'そのプロセスの正体をpsで確認した' },
    { key: 'sawOldStart',       weight: 10, label: '起動日から「残骸」だと判断した' }
  ],

  question: {
    text: '3000番ポートを使用しているのは何？',
    choices: [
      '以前に手動で起動されたまま残っている rails server プロセス',
      '新しく起動しようとしているPumaのmasterプロセス',
      'nginx（リバースプロキシとして3000も待ち受けている）',
      'Sidekiqのweb UI（Sidekiq::Web）'
    ],
    answer: 0,
    explain:
'ss -lntp を実行すると、3000番の行が見つかります。\n\n' +
'  LISTEN  0  1024  0.0.0.0:3000  0.0.0.0:*  users:(("ruby",pid=3182,fd=6))\n\n' +
'プロセス名は ruby、PIDは 3182 です。\n' +
'ここまでだと「rubyの何か」としか分からないので、ps で正体を確認します。\n\n' +
'  $ ps aux | grep ruby\n' +
'  deploy  3182  0.0  5.1  ...  Aug28  2:14  ruby /var/www/myapp/releases/20260913150000/bin/rails server -b 0.0.0.0 -p 3000 -e production\n\n' +
'3つのことが分かります。\n\n' +
'1) rails server（開発用サーバー）が本番で起動されている\n' +
'2) START が **Aug28** — 3週間近く前から動きっぱなし\n' +
'3) パスが releases/20260913150000 — 過去のrelease\n\n' +
'おそらく誰かが調査のために手動で rails server を立ち上げ、\n' +
'そのまま止め忘れたものです。systemd管理下ではないので\n' +
'systemctl status puma にも出てこず、誰にも気づかれずに残っていました。\n\n' +
'そこへ今回、Pumaの待ち受けをTCP 3000番へ変更したため、正面から衝突しました。\n\n' +
'対処はこのプロセスを終了させることですが、順番があります。\n' +
'いきなり kill -9 3182 とせず、まず ps で「消して安全か」を確認し、\n' +
'（本番トラフィックを受けていないか、nginxのupstreamに入っていないか）\n' +
'そのうえで kill 3182（SIGTERM）による正常終了を試します。\n\n' +
'そして本質的な再発防止は、手動起動したプロセスを残さないこと、\n' +
'本番のプロセスは必ずsystemd管理下に置くことです。',
    wrong: [
null,
'Pumaのmasterではありません。\n' +
'systemctl status puma を見ると Active: failed、\n' +
'ps aux | grep puma を実行してもpumaのプロセスは1つもありません。\n\n' +
'そもそもPumaは「3000番をbindできなかったから起動に失敗した」側です。\n' +
'起動できていないプロセスがポートを掴んでいることはありません。',
'nginxが掴んでいるのは80番です。\n' +
'ss -lntp の出力で 0.0.0.0:80 の行のProcessが nginx、pid 780 になっています。\n' +
'3000番の行のプロセス名は ruby で、PIDも別物（3182）です。\n\n' +
'/etc/nginx/sites-enabled/myapp.conf を見ても listen 80 しかありません。',
'Sidekiq::Web は独立したプロセスではありません。\n' +
'config/routes.rb の mount Sidekiq::Web => "/sidekiq" のとおり、\n' +
'Railsアプリの一部としてPumaの中で動きます。専用のポートは持ちません。\n\n' +
'ps aux | grep sidekiq で見えるのはジョブを処理するワーカープロセスで、\n' +
'これもポートをlistenしていません。'
    ]
  },

  route: {
    steps: [
      '起動失敗の理由を確認する（journalctl / puma.error.log）',
      'エラーがbind失敗だと読み取る（EADDRINUSE）',
      '該当ポートのlisten状況を見る（ss -lntp）',
      'プロセス名とPIDを取得する',
      'PIDの正体をpsで確認する（コマンドライン・起動日）',
      'systemd管理下かどうかを確認してから止め方を決める'
    ],
    commands: [
      'systemctl status puma',
      'journalctl -u puma -n 20',
      'ss -lntp',
      'ss -lntp | grep 3000',
      'ps aux | grep ruby',
      'ps aux | grep 3182',
      'cat /var/www/myapp/shared/config/puma.rb',
      'tail -n 10 /var/www/myapp/shared/log/puma.error.log'
    ],
    note:
'ss から入っても、psで古いrubyプロセスに先に気づいても構いません。\n' +
'ポート競合は「ポート → PID → プロセスの正体」の順に辿れば必ず解けます。\n' +
'この3ステップを手癖にしてください。'
  }
});
})();
