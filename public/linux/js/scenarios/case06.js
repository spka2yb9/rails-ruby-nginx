/* CASE 06 — Pumaが動いているか確認する */
(function () {
'use strict';
var APP = '/var/www/myapp';
var base = window.LFR.base;

var files = {};
files['/var/log/nginx/error.log'] =
'2026/09/14 14:22:03 [error] 781#781: *1204 connect() to unix:/var/www/myapp/shared/tmp/sockets/puma.sock failed (111: Connection refused) while connecting to upstream, client: 10.0.2.31, server: myapp.example.jp, request: "GET /projects HTTP/1.1"\n' +
'2026/09/14 14:22:11 [error] 781#781: *1206 connect() to unix:/var/www/myapp/shared/tmp/sockets/puma.sock failed (111: Connection refused) while connecting to upstream, client: 10.0.2.18, server: myapp.example.jp, request: "GET / HTTP/1.1"\n' +
'2026/09/14 14:23:40 [error] 781#781: *1211 connect() to unix:/var/www/myapp/shared/tmp/sockets/puma.sock failed (111: Connection refused) while connecting to upstream, client: 10.0.2.44, server: myapp.example.jp, request: "GET /projects HTTP/1.1"\n';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T14:18:02.114+09:00 #1433]  INFO -- : [9f0e1d2c-3b4a-4958-8677-0a1b2c3d4e5f] Started GET "/projects" for 10.0.2.31 at 2026-09-14 14:18:02 +0900\n' +
'I, [2026-09-14T14:18:02.198+09:00 #1433]  INFO -- : [9f0e1d2c-3b4a-4958-8677-0a1b2c3d4e5f] Completed 200 OK in 84ms (Views: 55.1ms | ActiveRecord: 13.2ms)\n' +
'I, [2026-09-14T14:18:44.507+09:00 #1434]  INFO -- : [8e1f2a3b-4c5d-4e6f-9081-a2b3c4d5e6f7] Started GET "/" for 10.0.2.18 at 2026-09-14 14:18:44 +0900\n' +
'I, [2026-09-14T14:18:44.571+09:00 #1434]  INFO -- : [8e1f2a3b-4c5d-4e6f-9081-a2b3c4d5e6f7] Completed 200 OK in 64ms (Views: 41.8ms | ActiveRecord: 10.1ms)\n';

window.LFR.scenarios.add({
  id: 'case06',
  level: 2,
  title: 'Pumaが動いているか確認する',
  subtitle: 'systemctlの表示とプロセスの実態が食い違うことがある',

  description:
'サイト全体が 502 Bad Gateway になりました。\n' +
'トップページも求人一覧も、すべて同じエラー画面です。\n\n' +
'nginxは動いているようで、エラー画面自体はnginxが返しています。\n\n' +
'まずはRailsを動かしているPumaが本当に動いているのかを確認してください。\n' +
'ただし、確認方法は1つではありません。複数の方法で確かめて、\n' +
'それぞれが同じことを言っているかどうかも見てください。',

  learn: [
    { name: 'systemctl status', cmd: 'systemctl status puma',
      desc: 'systemdが「そのサービスをどう認識しているか」を表示します。\n' +
            'Active: active (running) は、あくまでsystemdの認識です。\n' +
            'systemdが追いかけているPIDと実際のプロセスがずれると、\n' +
            '「activeなのに動いていない」という状態が起こり得ます。' },
    { name: 'ps aux', cmd: 'ps aux | grep puma',
      desc: 'OSが持っているプロセスの実態です。ここに無ければ、本当に存在していません。\n' +
            'systemctlの表示と食い違ったときは、ps の方が事実です。' },
    { name: 'pgrep', cmd: 'pgrep -a puma',
      desc: '名前にマッチするプロセスのPIDを返します。-a を付けるとコマンドラインも出ます。\n' +
            '「居るか居ないか」だけを知りたいときは ps aux | grep より確実です。\n' +
            '見つからなければ終了コードが1になるので、スクリプトでも使えます。' },
    { name: 'journalctl', cmd: 'journalctl -u puma -n 30',
      desc: 'そのサービスが最後に何を言い残したかを読みます。\n' +
            '-n で表示する行数を絞れます。まず末尾30行、が定番です。' },
    { name: 'ss', cmd: 'ss -lntp',
      desc: '何がどのポートでlistenしているかを表示します。\n' +
            'PumaがUNIXソケットで待ち受ける構成なら、ここには出てきません。\n' +
            'その場合はnginxのエラーログの方が手がかりになります。' },
    { name: 'curl', cmd: 'curl -I http://localhost/',
      desc: 'サーバーの中から自分自身へリクエストして、症状を再現します。\n' +
            '502が返れば「ブラウザ側の問題ではない」ことが確定します。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '14:24:18',

  /* systemdは active と言っているが、実際のプロセスは存在しない */
  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Mon 2026-09-14 12:00:31 JST', ago: '2h 23min ago',
      mainPid: 1421, tasks: 1, memory: '2.1M',
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb'
    }
  },

  journal: {
    puma: [
      'Sep 14 12:00:29 production systemd[1]: Starting Puma HTTP Server for myapp (production)...',
      'Sep 14 12:00:31 production puma[1421]: Puma starting in cluster mode...',
      'Sep 14 12:00:33 production puma[1421]: * Listening on unix:///var/www/myapp/shared/tmp/sockets/puma.sock',
      'Sep 14 12:00:33 production systemd[1]: Started Puma HTTP Server for myapp (production).',
      'Sep 14 14:21:58 production puma[1433]: [1433] ! Terminating timed out worker: 1433',
      'Sep 14 14:21:59 production puma[1434]: [1434] ! Terminating timed out worker: 1434',
      'Sep 14 14:22:00 production kernel: Out of memory: Killed process 1421 (puma) total-vm:1284932kB, anon-rss:344180kB'
    ]
  },

  /* pumaのプロセスは1つも残っていない */
  processes: base.processes.filter(function (p) { return !/puma/.test(p.command); }),

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
    'まず「Pumaは動いているか」をsystemd側とOS側の両方から確認してください。\n' +
    '片方だけを見て判断しないのがコツです。',

    'systemctl status puma と ps aux | grep puma を両方実行して、\n' +
    '言っていることが一致しているか比べてください。\n' +
    'pgrep puma の終了コードも参考になります（echo $? で見られます）。',

    'Railsのログは14:18で止まっていて、nginxのエラーログには\n' +
    'connect() to unix:...puma.sock failed (111: Connection refused) が並んでいます。\n' +
    'journalctl -u puma の最後の行も読んでみてください。'
  ],

  probes: [
    { key: 'sawSystemctlActive', label: 'systemctlがactiveと表示していることを確認した',
      test: function (c, res) { return /systemctl/.test(c) && /active \(running\)/.test(res.stdout); } },
    { key: 'sawNoPumaProcess', label: 'pumaのプロセスが存在しないことを確認した',
      test: function (c, res) {
        return /\b(ps|pgrep)\b/.test(c) && /puma/.test(c) && !/puma\s+6\.4\.2|cluster worker/.test(res.stdout);
      } },
    { key: 'sawNginxError', label: 'nginxがsocketに接続できていないのを見た',
      test: function (c, res) { return /Connection refused|puma\.sock failed/.test(res.stdout); } },
    { key: 'sawOomKill', label: 'journalctlでOOM Killerに落とされたことを見つけた',
      test: function (c, res) { return /Out of memory|Killed process/.test(res.stdout); } },
    { key: 'reproduced502', label: 'curlで502を再現した',
      test: function (c, res) { return /\bcurl\b/.test(c) && /502/.test(res.stdout + res.stderr); } }
  ],

  evidence: [
    { key: 'sawSystemctlActive', weight: 10, label: 'systemctlの表示を確認した' },
    { key: 'sawNoPumaProcess',   weight: 18, label: 'ps / pgrep で実態を確認した' },
    { key: 'sawOomKill',         weight: 14, label: 'journalctlで落ちた理由まで踏み込んだ' },
    { key: 'sawNginxError',      weight: 10, label: 'nginx側のエラーログも確認した' },
    { key: 'reproduced502',      weight: 8,  label: 'curlで症状を再現した' }
  ],

  question: {
    text: 'Pumaは動いている？　調査結果として最も正確な説明はどれ？',
    choices: [
      'systemctl が active (running) と表示しているので、Pumaは動いている',
      'systemdはactiveと表示しているが、実際のPumaプロセスは1つも存在しない',
      'Pumaは動いているが、ポート3000をlistenできていない',
      'Pumaは動いているが、nginxが停止しているため502になっている'
    ],
    answer: 1,
    explain:
'systemctl status puma は Active: active (running) と表示します。\n' +
'しかし ps aux | grep puma を実行しても、pumaのプロセスは1つも出てきません。\n' +
'pgrep puma も何も返しません（終了コードは1）。\n\n' +
'食い違ったときに信じるべきは ps の方です。systemdの表示は\n' +
'「systemdが追いかけているPIDがまだ生きていると思っている」という状態にすぎません。\n\n' +
'journalctl -u puma の最後の行に、何が起きたかが残っています。\n\n' +
'  Out of memory: Killed process 1421 (puma)\n\n' +
'カーネルのOOM Killerがメモリ不足でPumaのmasterを強制終了させました。\n' +
'systemdはその通知を受け取れておらず、activeのままになっています。\n\n' +
'裏付けも揃っています。\n' +
'・production.log は 14:18 で止まっている（それ以降Railsは動いていない）\n' +
'・nginxのエラーログに connect() to unix:...puma.sock failed (111: Connection refused)\n' +
'・curl -I http://localhost/ は 502 Bad Gateway\n\n' +
'「サービスの状態を確認する」とは、systemctlを1回打つことではありません。\n' +
'systemd・プロセス・ソケット・ログの4方向から見て、矛盾がないかを確かめることです。',
    wrong: [
'これがこのCASEで一番避けたい結論です。\n' +
'systemctl の Active: は systemd の認識であって、プロセスの実在証明ではありません。\n\n' +
'ps aux | grep puma を実行してください。1件も出てきません。\n' +
'pgrep puma も空です。Railsのログも14:18で止まっています。\n' +
'systemctlだけを見て「動いている」と判断すると、ここで調査が止まってしまいます。',
null,
'ポートの問題ではありません。\n' +
'この構成のPumaはTCPポートではなくUNIXソケット\n' +
'（unix:///var/www/myapp/shared/tmp/sockets/puma.sock）で待ち受けます。\n' +
'shared/config/puma.rb の bind 行で確認できます。\n' +
'そもそもプロセス自体が存在しないので、listen以前の問題です。',
'nginxは動いています。\n' +
'systemctl status nginx は active (running)、ps aux にも worker が居ます。\n' +
'そして 502 Bad Gateway という画面自体、nginxが生きているからこそ返せています。\n' +
'nginxが止まっていれば、ブラウザには接続拒否（画面が出ない）が返ります。'
    ]
  },

  route: {
    steps: [
      '症状をサーバーの中から再現する（curl -I）',
      'systemdの認識を見る（systemctl status puma）',
      'OSの実態を見る（ps aux / pgrep）',
      '食い違いに気づく',
      'サービス自身のログで理由を探す（journalctl -u puma）',
      'nginx側・Rails側のログで裏を取る'
    ],
    commands: [
      'curl -I http://localhost/',
      'systemctl status puma',
      'ps aux | grep puma',
      'pgrep -a puma',
      'journalctl -u puma -n 30',
      'tail -n 20 log/production.log',
      'tail -n 10 /var/log/nginx/error.log',
      'cat /var/www/myapp/shared/config/puma.rb'
    ],
    note:
'nginxのエラーログから入って「upstreamに繋がらない」と気づき、\n' +
'そこからPumaを見に行くルートでも構いません。\n' +
'重要なのは、1つの表示だけで結論を出さず、複数の側面で確かめていることです。'
  }
});
})();
