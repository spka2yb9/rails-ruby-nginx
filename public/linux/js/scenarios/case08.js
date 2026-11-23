/* CASE 08 — Redisへの接続エラーを調査する */
(function () {
'use strict';
var APP = '/var/www/myapp';
var base = window.LFR.base;

var files = {};

files['/etc/redis/redis.conf'] =
'# Redis configuration file\n' +
'\n' +
'# 2026-09-14 変更: 監視サーバーからmetricsを取れるようにbindを変更\n' +
'bind 10.0.2.50\n' +
'protected-mode yes\n' +
'port 6379\n' +
'timeout 0\n' +
'tcp-keepalive 300\n' +
'\n' +
'daemonize no\n' +
'supervised systemd\n' +
'pidfile /var/run/redis/redis-server.pid\n' +
'loglevel notice\n' +
'logfile /var/log/redis/redis-server.log\n' +
'\n' +
'save 900 1\n' +
'save 300 10\n' +
'dir /var/lib/redis\n' +
'maxmemory 512mb\n' +
'maxmemory-policy allkeys-lru\n';

files['/var/log/redis/redis-server.log'] =
'1530:M 14 Sep 2026 13:58:01.204 * Ready to accept connections tcp\n' +
'1530:M 14 Sep 2026 13:58:01.204 * The server is now ready to accept connections on port 6379\n';

var log = [];
for (var i = 0; i < 30; i++) {
  var mm = String(1 + Math.floor(i / 3)).padStart(2, '0');
  var ss = String((i * 11) % 60).padStart(2, '0');
  var t = '2026-09-14T14:' + mm + ':' + ss + '.' + String(200 + i * 13).slice(0, 3) + '+09:00';
  var rid = 'c' + (i * 48271).toString(16).padStart(6, '0') + '-1a2b-4c3d-8e4f-5a6b7c8d9e0f';
  if (i % 3 === 0) {
    log.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Started GET "/projects" for 10.0.2.' + (10 + i) + ' at 2026-09-14 14:' + mm + ':' + ss + ' +0900');
    log.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Processing by ProjectsController#index as HTML');
    log.push('E, [' + t + ' #1433] ERROR -- : [' + rid + '] Redis::CannotConnectError (Error connecting to Redis on 127.0.0.1:6379 (Errno::ECONNREFUSED)):');
    log.push('E, [' + t + ' #1433] ERROR -- : [' + rid + '] Connection refused - connect(2) for 127.0.0.1:6379');
    log.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Completed 500 Internal Server Error in 1208ms');
  } else {
    log.push('I, [' + t + ' #1434]  INFO -- : [' + rid + '] Started GET "/projects/' + (8000 + i) + '" for 10.0.2.' + (10 + i) + ' at 2026-09-14 14:' + mm + ':' + ss + ' +0900');
    log.push('I, [' + t + ' #1434]  INFO -- : [' + rid + '] Completed 200 OK in ' + (60 + i) + 'ms (Views: 40.1ms | ActiveRecord: 11.2ms)');
  }
}
files[APP + '/shared/log/production.log'] = log.join('\n') + '\n';

window.LFR.scenarios.add({
  id: 'case08',
  level: 2,
  title: 'Redisへの接続エラーを調査する',
  subtitle: 'activeなのに繋がらない、をポートから読み解く',

  description:
'求人検索ページ（/projects）で 500 エラーが出ています。\n' +
'Railsのログには Redis::CannotConnectError (Errno::ECONNREFUSED) が出ています。\n\n' +
'…ここまではCASE 04と同じに見えます。\n' +
'ところが今回は、systemctl status redis を実行すると\n' +
'Active: active (running) と表示されます。\n\n' +
'Redisは動いています。それなのに繋がりません。\n' +
'なぜ繋がらないのかを特定してください。\n\n' +
'なお昨日、監視サーバーからRedisのmetricsを取得できるようにする作業が入っています。',

  learn: [
    { name: 'ss -lntp', cmd: 'ss -lntp',
      desc: 'listenしているTCPポートと、それを掴んでいるプロセスを表示します。\n' +
            '  -l listenのみ  -n 名前解決しない  -t TCP  -p プロセス名\n\n' +
            '見るべきなのはポート番号だけではありません。\n' +
            'Local Address:Port の **アドレス側** が重要です。\n' +
            '0.0.0.0 は全インターフェース、127.0.0.1 は自分自身からのみ、\n' +
            '特定IPならそのインターフェースからのみ受け付けます。' },
    { name: 'systemctl status', cmd: 'systemctl status redis',
      desc: 'プロセスが生きているかは分かりますが、\n' +
            '「どこで待ち受けているか」までは分かりません。\n' +
            'active (running) は「繋がる」という意味ではない、と覚えてください。' },
    { name: 'ps aux', cmd: 'ps aux | grep redis',
      desc: 'コマンドライン引数まで見えます。\n' +
            'ミドルウェアはどのアドレスで起動したかが引数に出ることが多く、\n' +
            '設定ファイルを読む前のあたりを付けに使えます。' },
    { name: 'grep で設定を読む', cmd: 'grep -n "^bind" /etc/redis/redis.conf',
      desc: '設定ファイル全部をcatするより、必要な行だけをgrepする方が速く、読み違えも減ります。\n' +
            '^ を付けるとコメント行（#で始まる説明）を除外できます。' },
    { name: 'curl で確認', cmd: 'curl -I http://localhost/projects',
      desc: 'アプリ側の症状を再現して、調査の前後で状況が変わっていないかを確かめます。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '14:12:40',

  /* Redisは動いている。ただし 127.0.0.1 では待っていない */
  services: {
    redis: {
      description: 'Advanced key-value store',
      status: 'active', sub: 'running',
      since: 'Mon 2026-09-14 13:58:01 JST', ago: '14min ago',
      mainPid: 1530, tasks: 5, memory: '44.2M',
      exec: '/usr/bin/redis-server 10.0.2.50:6379'
    }
  },

  journal: {
    redis: [
      'Sep 14 13:57:58 production systemd[1]: Stopping Advanced key-value store...',
      'Sep 14 13:57:59 production systemd[1]: Stopped Advanced key-value store.',
      'Sep 14 13:58:00 production systemd[1]: Starting Advanced key-value store...',
      'Sep 14 13:58:01 production redis-server[1530]: Configuration loaded from /etc/redis/redis.conf',
      'Sep 14 13:58:01 production redis-server[1530]: * Ready to accept connections tcp',
      'Sep 14 13:58:01 production redis-server[1530]: * The server is now ready to accept connections on port 6379',
      'Sep 14 13:58:01 production systemd[1]: Started Advanced key-value store.'
    ]
  },

  processes: base.processes.map(function (p) {
    if (!/redis-server/.test(p.command)) return p;
    var q = {}; Object.keys(p).forEach(function (k) { q[k] = p[k]; });
    q.command = '/usr/bin/redis-server 10.0.2.50:6379';
    q.start = 'Sep14'; q.time = '0:03';
    return q;
  }),

  ports: [
    { proto: 'tcp', state: 'LISTEN', recvq: 0, sendq: 511, local: '0.0.0.0:80',     peer: '0.0.0.0:*', pid: 780,  process: 'nginx' },
    { proto: 'tcp', state: 'LISTEN', recvq: 0, sendq: 128, local: '0.0.0.0:22',     peer: '0.0.0.0:*', pid: 612,  process: 'sshd' },
    { proto: 'tcp', state: 'LISTEN', recvq: 0, sendq: 511, local: '10.0.2.50:6379', peer: '0.0.0.0:*', pid: 1530, process: 'redis-server' }
  ],

  http: {
    'http://localhost/projects': {
      status: 500, reason: 'Internal Server Error',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><body><h1>We\'re sorry, but something went wrong.</h1></body></html>\n'
    }
  },

  hints: [
    'Redisのプロセスは動いています。そこは確認できたはずです。\n' +
    'では「動いている」と「繋がる」の間には何があるでしょうか。\n' +
    'Railsがどこへ繋ぎに行っているかを、まず正確に読み取ってください。',

    'Railsのエラーには接続先が書かれています。127.0.0.1:6379 です。\n' +
    'では実際のRedisは、どのアドレスで待ち受けているでしょうか。\n' +
    'listenしているアドレスとポートを一覧するコマンドがあります。',

    'ss -lntp を実行して、6379の行の Local Address:Port を見てください。\n' +
    'そのあと ps aux | grep redis や\n' +
    'grep -n "^bind" /etc/redis/redis.conf で裏を取れます。'
  ],

  probes: [
    { key: 'sawRedisActive', label: 'Redisがactiveであることを確認した',
      test: function (c, res) { return /redis/i.test(c) && /active \(running\)/.test(res.stdout); } },
    { key: 'sawListenAddress', label: 'Redisのlistenアドレスを確認した',
      test: function (c, res) { return /10\.0\.2\.50:6379/.test(res.stdout); } },
    { key: 'sawBindConfig', label: 'redis.conf の bind 設定を読んだ',
      test: function (c, res) { return /bind 10\.0\.2\.50/.test(res.stdout); } },
    { key: 'sawAppTarget', label: 'Railsの接続先が127.0.0.1であることを確認した',
      test: function (c, res) { return /127\.0\.0\.1:6379/.test(res.stdout); } },
    { key: 'usedSs', label: 'ss でlisten状況を確認した',
      test: function (c) { return /\bss\b|\bnetstat\b/.test(c); } }
  ],

  evidence: [
    { key: 'sawRedisActive',   weight: 8,  label: 'Redisが動作していることを確認した' },
    { key: 'usedSs',           weight: 10, label: 'ss でlistenしているポートを見た' },
    { key: 'sawListenAddress', weight: 18, label: '待ち受けアドレスが127.0.0.1でないと気づいた' },
    { key: 'sawAppTarget',     weight: 12, label: 'Railsの接続先が127.0.0.1だと確認した' },
    { key: 'sawBindConfig',    weight: 12, label: 'redis.conf の bind 設定まで裏を取った' }
  ],

  question: {
    text: 'Redisは動いているのに接続できない。原因は？',
    choices: [
      'Redisは停止しており、systemctlの表示が古いだけ',
      'Redisは動作しているが、127.0.0.1 では待ち受けていない',
      'ファイアウォールが6379番ポートを塞いでいる',
      'REDIS_URL 環境変数が設定されていない'
    ],
    answer: 1,
    explain:
'ss -lntp の出力を見ると、6379の行はこうなっています。\n\n' +
'  LISTEN  0  511  10.0.2.50:6379  0.0.0.0:*  users:(("redis-server",pid=1530,...))\n\n' +
'待ち受けているのは 10.0.2.50:6379 であって、127.0.0.1:6379 ではありません。\n' +
'一方、Railsが繋ぎにいく先は config/redis.yml と REDIS_URL のとおり\n' +
'redis://127.0.0.1:6379/0 です。\n\n' +
'つまり「Redisは生きているが、Railsが叩いている入口では誰も待っていない」状態です。\n' +
'誰も待っていないポートへ繋ぐと、OSは即座に Connection refused を返します。\n' +
'これが Errno::ECONNREFUSED の正体です。\n\n' +
'原因も追えます。redis.conf にこう書かれています。\n\n' +
'  # 2026-09-14 変更: 監視サーバーからmetricsを取れるようにbindを変更\n' +
'  bind 10.0.2.50\n\n' +
'journalctl -u redis を見ると、13:58 にRedisが再起動されています。\n' +
'この変更のとき、bind から 127.0.0.1 を外してしまったため、\n' +
'同じサーバー上のRails自身が繋げなくなりました。\n' +
'（正しくは bind 127.0.0.1 10.0.2.50 のように両方を残します）\n\n' +
'このCASEの要点は、active (running) は「繋がる」を意味しないということです。\n' +
'プロセスの生死・待ち受けアドレス・アプリの接続先、この3つは別々に確認してください。',
    wrong: [
'systemctlの表示は古くありません。\n' +
'ps aux | grep redis にもプロセス（pid 1530）が存在し、\n' +
'journalctl -u redis には 13:58 に Ready to accept connections tcp が出ています。\n' +
'/var/log/redis/redis-server.log も同じことを言っています。\n' +
'Redisは確かに動いています。問題は「どこで」動いているかです。',
null,
'ファイアウォールなら、まず 127.0.0.1（ループバック）宛ての通信は通常ブロックされません。\n' +
'そして塞がれている場合の典型的な症状は、接続拒否ではなくタイムアウトです\n' +
'（Redis::TimeoutError / connect timeout）。\n\n' +
'今回は Errno::ECONNREFUSED、つまり「即座に拒否された」＝\n' +
'そのアドレスで誰もlistenしていない、という応答です。\n' +
'ss -lntp で 127.0.0.1:6379 が一覧に無いことが直接の証拠になります。',
'REDIS_URL は設定されています。env | grep REDIS で確認できます。\n' +
'値は redis://127.0.0.1:6379/0 で、config/redis.yml とも一致しています。\n\n' +
'そもそも設定が無ければ、エラーメッセージに 127.0.0.1:6379 という\n' +
'具体的な接続先は出てきません。設定は読めていて、繋ぎに行った結果として拒否されています。'
    ]
  },

  route: {
    steps: [
      'Railsのログで接続先（127.0.0.1:6379）と例外（ECONNREFUSED）を読む',
      'Redisが生きているか確認する（systemctl / ps）→ 生きている',
      '「生きているのに拒否される」＝待ち受け側を疑う',
      'ss -lntp で実際のlistenアドレスを見る → 10.0.2.50:6379',
      'redis.conf の bind で裏を取る',
      'journalctlで、いつ再起動されたかを確認する'
    ],
    commands: [
      'cd /var/www/myapp/current',
      'grep -n "Redis" log/production.log | tail -n 5',
      'systemctl status redis',
      'ps aux | grep redis',
      'ss -lntp',
      'grep -n "^bind" /etc/redis/redis.conf',
      'cat /var/www/myapp/shared/config/redis.yml',
      'env | grep REDIS',
      'journalctl -u redis -n 20'
    ],
    note:
'ss -lntp から入って「6379が127.0.0.1に無い」と先に気づくルートでも、\n' +
'redis.conf の変更履歴コメントから入るルートでも構いません。\n' +
'「activeでも繋がらないことがある」と知っていることが、この先ずっと効いてきます。'
  }
});
})();
