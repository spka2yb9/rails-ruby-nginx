/* CASE 30 — Too many open files を直す（/proc・ulimit・unit編集） */
(function () {
'use strict';
var APP = '/var/www/myapp';
var base = window.LFR.base;

var files = {};

files['/etc/systemd/system/puma.service'] =
'[Unit]\n' +
'Description=Puma HTTP Server for myapp (production)\n' +
'After=network.target\n' +
'\n' +
'[Service]\n' +
'Type=simple\n' +
'User=deploy\n' +
'WorkingDirectory=/var/www/myapp/current\n' +
'EnvironmentFile=/var/www/myapp/shared/config/app.env\n' +
'ExecStart=/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb\n' +
'KillSignal=SIGTERM\n' +
'TimeoutStopSec=30\n' +
'Restart=on-failure\n' +
'RestartSec=1\n' +
'\n' +
'[Install]\n' +
'WantedBy=multi-user.target\n';

files['/etc/systemd/system/sidekiq.service'] =
'[Unit]\n' +
'Description=Sidekiq background worker for myapp (production)\n' +
'\n' +
'[Service]\n' +
'Type=notify\n' +
'User=deploy\n' +
'WorkingDirectory=/var/www/myapp/current\n' +
'EnvironmentFile=/var/www/myapp/shared/config/app.env\n' +
'ExecStart=/home/deploy/.rbenv/shims/bundle exec sidekiq -e production\n' +
'LimitNOFILE=65535\n' +
'KillSignal=SIGTERM\n' +
'TimeoutStopSec=30\n' +
'Restart=on-failure\n';

function buildLog() {
  var L = [];
  for (var i = 0; i < 26; i++) {
    var mm = String(10 + Math.floor(i / 3)).padStart(2, '0');
    var ss = String((i * 17) % 60).padStart(2, '0');
    var t = '2026-09-23T20:' + mm + ':' + ss + '.' + String(100 + i * 13).slice(0, 3) + '+09:00';
    var rid = 'e' + (i * 40503).toString(16).padStart(7, '0') + '-9a8b-4c7d-8e6f-5a4b3c2d1e0f';
    if (i % 4 === 1) {
      L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Started GET "/projects" for 10.0.2.' + (10 + i) + ' at 2026-09-23 20:' + mm + ':' + ss + ' +0900');
      L.push('E, [' + t + ' #1433] ERROR -- : [' + rid + '] Errno::EMFILE (Too many open files - socket(2) for "127.0.0.1" port 6379):');
      L.push('E, [' + t + ' #1433] ERROR -- : [' + rid + '] redis-client (0.22.2) lib/redis_client/ruby_connection.rb:31:in `initialize\'');
      L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Completed 500 Internal Server Error in 18ms');
    } else {
      L.push('I, [' + t + ' #1434]  INFO -- : [' + rid + '] Started GET "/projects" for 10.0.2.' + (10 + i) + ' at 2026-09-23 20:' + mm + ':' + ss + ' +0900');
      L.push('I, [' + t + ' #1434]  INFO -- : [' + rid + '] Completed 200 OK in ' + (95 + i) + 'ms (Views: 62.1ms | ActiveRecord: 13.4ms)');
    }
  }
  return L.join('\n') + '\n';
}
files[APP + '/shared/log/production.log'] = buildLog();

files[APP + '/shared/log/puma.error.log'] =
'[1421] - Worker 0 (PID: 1433) booted in 0.02s, phase: 0\n' +
'[1421] ! Errno::EMFILE: Too many open files - accept(2)\n';

files['/home/deploy/ops-notes.md'] =
'# 作業メモ\n' +
'\n' +
'## 2026-09-23\n' +
'20時台のアクセスが増える時間帯にだけ、/projects の一部が500になる。\n' +
'全部ではなく、4回に1回くらい。メモリもCPUも余裕がある。\n' +
'Sidekiq側では同じエラーが出ていない。\n';

window.LFR.scenarios.add({
  id: 'case30',
  level: 11,
  title: 'Too many open files を直す',
  subtitle: 'プロセスが実際に持っている上限を見る',

  description:
'アクセスが増える20時台にだけ、/projects の一部が500になります。\n' +
'全部ではなく、4回に1回くらいです。\n\n' +
'Railsのログにはこう出ています。\n\n' +
'  Errno::EMFILE (Too many open files - socket(2) for "127.0.0.1" port 6379)\n\n' +
'メモリもCPUもディスクも余裕があります。Redisも動いています。\n' +
'そしてSidekiq側では同じエラーが出ていません。\n\n' +
'原因を特定し、**直して、直ったことを確認してください。**\n' +
'※このCASEでは vi で設定を編集できます（:wq 保存 / :q! 破棄）。',

  learn: [
    { name: 'ファイルディスクリプタの上限', cmd: 'ulimit -n',
      desc: 'プロセスが同時に開けるファイル（＝fd）の数には上限があります。\n' +
            'Linuxではソケットもfdなので、**接続が増えるとfdが増えます**。\n\n' +
            'Redisへの接続、DBへの接続、ログファイル、受け付けたHTTP接続。\n' +
            'これらを全部足した数が上限を超えると Errno::EMFILE になります。\n\n' +
            '「アクセスが増える時間帯だけ」「全部ではなく一部だけ」という症状は、\n' +
            'この種の上限に当たっているサインです。' },
    { name: 'ulimit は「いまのシェル」の値', cmd: 'ulimit -n',
      desc: 'ここが重要です。`ulimit -n` が返すのは、\n' +
            '**あなたがいま使っているシェルの**上限です。\n\n' +
            'systemdが起動したPumaが同じ値を持っているとは限りません。\n' +
            'サービスの上限は unit の `LimitNOFILE=` で決まり、\n' +
            'ログインシェルの設定（/etc/security/limits.conf など）とは無関係です。\n\n' +
            '「シェルで見たら十分だったのに、アプリは足りていなかった」は\n' +
            'よくある勘違いです。' },
    { name: '/proc/<PID>/limits', cmd: 'cat /proc/1433/limits',
      desc: '**動いているプロセスが実際に持っている上限**は、ここにしかありません。\n\n' +
            '  cat /proc/<PID>/limits    上限の一覧\n' +
            '  cat /proc/<PID>/environ   実際に渡っている環境変数（NUL区切り）\n' +
            '  cat /proc/<PID>/status    親PID・スレッド数・実メモリ\n' +
            '  cat /proc/<PID>/cmdline   起動コマンド\n\n' +
            '推測ではなく事実を見られる場所です。\n' +
            '「設定したはず」と「実際にそうなっている」の差は、必ずここで確かめてください。\n\n' +
            '環境変数はNUL区切りなので、読むときは変換します。\n' +
            '  cat /proc/<PID>/environ | tr \'\\\\0\' \'\\\\n\'' },
    { name: 'unitを直す', cmd: 'sudo vi /etc/systemd/system/puma.service',
      desc: 'サービスの上限は unit ファイルの `[Service]` に書きます。\n\n' +
            '  LimitNOFILE=65535\n\n' +
            '正常に動いている sidekiq.service と見比べると、差が分かります。' },
    { name: 'daemon-reload を忘れない', cmd: 'sudo systemctl daemon-reload',
      desc: 'unitファイルを直しても、systemdは自動では読み直しません。\n\n' +
            '  sudo systemctl daemon-reload   ← unitの変更を読み込む\n' +
            '  sudo systemctl restart puma    ← そのうえでプロセスを入れ替える\n\n' +
            'この2段構えを忘れると「直したのに変わらない」になります。\n' +
            'そして最後に `/proc/<新しいPID>/limits` で、本当に変わったかを確認してください。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '20:22:41',
  date: 'Sep 23',

  limits: { nofile: 1024, nofileHard: 1024, nproc: 30827, core: 0 },

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Wed 2026-09-23 12:00:31 JST', ago: '8h 22min ago',
      mainPid: 1421, tasks: 12, memory: '336.1M',
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb',
      recovery: {
        blockedBy: null,
        onUp: function (state) {
          state.processes = state.processes
            .filter(function (p) { return !/puma/.test(p.command); })
            .concat([
              { pid: 9810, user: 'deploy', cpu: 1.1, mem: 8.4, vsz: 1284932, rss: 344180,
                stat: 'Sl', start: 'Sep23', time: '0:00',
                command: 'puma 6.4.2 (unix:///var/www/myapp/shared/tmp/sockets/puma.sock) [myapp]' },
              { pid: 9821, user: 'deploy', cpu: 0.8, mem: 7.8, vsz: 1251104, rss: 318604,
                stat: 'Sl', start: 'Sep23', time: '0:00', command: 'puma: cluster worker 0: 9810 [myapp]' },
              { pid: 9822, user: 'deploy', cpu: 0.8, mem: 7.6, vsz: 1248832, rss: 312048,
                stat: 'Sl', start: 'Sep23', time: '0:00', command: 'puma: cluster worker 1: 9810 [myapp]' }
            ]);
          state.services.puma.mainPid = 9810;
          state.emfileFixed = (state.limits && state.limits.nofile >= 4096);
        },
        onDown: function (state) {
          state.processes = state.processes.filter(function (p) { return !/puma/.test(p.command); });
        }
      }
    }
  },

  system: {
    uptime: { since: '16 days, 08:22', users: 1, load: [1.92, 1.74, 1.41] },
    cpu:    { cores: 4, us: 14.2, sy: 5.1, id: 79.4, wa: 1.3 },
    mem:    { total: 7823, used: 3620, free: 1180, shared: 70, buffCache: 3023, available: 3902 },
    swap:   { total: 2047, used: 0, free: 2047 }
  },

  hints: [
    'Errno::EMFILE は「開けるファイルの数が上限に達した」という意味です。\n' +
    'Linuxではソケットもファイル扱いなので、接続が増えると消費されます。\n' +
    'まず上限がいくつなのかを確認してください。',

    '`ulimit -n` はあなたのシェルの値です。\n' +
    '**動いているPumaが実際に持っている値**は別の場所にあります。\n\n' +
    '  ps aux | grep puma          ← PIDを調べる\n' +
    '  cat /proc/<PID>/limits      ← そのプロセスの上限\n\n' +
    '正常に動いている sidekiq のunitと見比べると、何が足りないか分かります。',

    'puma.service には LimitNOFILE がありません（sidekiq.service には 65535 と書かれています）。\n\n' +
    '  sudo vi /etc/systemd/system/puma.service   ← [Service] に LimitNOFILE=65535 を足す\n' +
    '  sudo systemctl daemon-reload               ← unitを読み直す\n' +
    '  sudo systemctl restart puma                ← プロセスを入れ替える\n' +
    '  ps aux | grep puma                         ← 新しいPIDを確認\n' +
    '  cat /proc/<新しいPID>/limits                ← 本当に変わったか確認'
  ],

  probes: [
    { key: 'sawEmfile', label: 'Errno::EMFILE を確認した',
      test: function (c, res) { return /EMFILE|Too many open files/.test(res.stdout); } },
    { key: 'checkedUlimit', label: 'シェルの上限を確認した',
      test: function (c) { return /\bulimit\b/.test(c); } },
    { key: 'checkedProcLimits', label: '/proc でプロセスの実際の上限を見た',
      test: function (c, res) { return /\/proc\/\d+\/limits/.test(c) && /Max open files/.test(res.stdout); } },
    { key: 'comparedUnits', label: '正常なsidekiqのunitと比較した',
      test: function (c, res) { return /LimitNOFILE=65535/.test(res.stdout); } },
    { key: 'editedUnit', label: 'unitファイルを編集した',
      test: function (c) { return /^\s*(sudo\s+)?(vi|vim)\b/.test(c) && /\.service/.test(c); } },
    { key: 'ranDaemonReload', label: 'daemon-reload を実行した',
      test: function (c, res) { return /daemon-reload/.test(c) && res.exitCode === 0; } },
    { key: 'restartedAfterReload', label: 'reload後に再起動した',
      test: function (c, res, rt) { return rt.state.daemonReloaded && /restart\s+puma/.test(c) && res.exitCode === 0; } },
    { key: 'verifiedNewLimit', label: '新しいPIDの/procで上限が変わったことを確認した',
      test: function (c, res, rt) {
        return /\/proc\/\d+\/limits/.test(c) && /Max open files\s+(4096|8192|16384|65535)/.test(res.stdout);
      } }
  ],

  evidence: [
    { key: 'sawEmfile',            weight: 8,  label: 'エラーの種類を確認した' },
    { key: 'checkedUlimit',        weight: 8,  label: 'シェルの上限を確認した' },
    { key: 'checkedProcLimits',    weight: 18, label: '/proc でプロセスの実際の上限を見た' },
    { key: 'comparedUnits',        weight: 12, label: '正常な側のunitと比較した' },
    { key: 'editedUnit',           weight: 14, label: 'unitを直した' },
    { key: 'ranDaemonReload',      weight: 14, label: 'daemon-reload を実行した' },
    { key: 'restartedAfterReload', weight: 12, label: 'reload後に再起動した' },
    { key: 'verifiedNewLimit',     weight: 14, label: '変わったことを/procで確認した' }
  ],

  question: {
    text: 'Errno::EMFILE の原因と、正しい直し方は？',
    choices: [
      'サーバーのメモリが足りない。インスタンスサイズを上げる',
      'puma.service に LimitNOFILE が無く、既定の1024で動いている。unitに追記して daemon-reload → restart する',
      '/etc/security/limits.conf を直せばよい。systemdのサービスにもこれが適用される',
      'Redisへの接続が漏れている。アプリのコードでコネクションを閉じる'
    ],
    answer: 1,
    explain:
'エラーの意味から入ります。\n\n' +
'  Errno::EMFILE (Too many open files - socket(2) for "127.0.0.1" port 6379)\n\n' +
'「socket(2) を作ろうとして、開けるファイルの上限に達した」という意味です。\n' +
'Linuxではソケットもfdなので、接続が増えれば消費されます。\n' +
'アクセスが増える時間帯だけ、しかも一部のリクエストだけ失敗する、\n' +
'という症状は上限に当たっているときの典型です。\n\n' +
'【シェルの値とプロセスの値は違う】\n' +
'  $ ulimit -n\n' +
'  1024\n\n' +
'  これは**あなたのシェル**の値です。ここで満足してはいけません。\n' +
'  動いているPumaが実際に持っている値を見ます。\n\n' +
'  $ ps aux | grep puma\n' +
'  deploy 1433 ... puma: cluster worker 0: 1421 [myapp]\n' +
'  $ cat /proc/1433/limits\n' +
'  Max open files            1024                 1024                 files\n\n' +
'  1024です。同時接続が増えれば、すぐに届きます。\n\n' +
'【なぜSidekiqでは起きないのか】\n' +
'  $ systemctl cat sidekiq\n' +
'  LimitNOFILE=65535        ← 書いてある\n' +
'  $ systemctl cat puma\n' +
'  （LimitNOFILE が無い）   ← 書いていない\n\n' +
'  systemdのサービスは、unitに書かれた値を使います。\n' +
'  書かれていなければ systemd の既定値（多くの環境で1024）になります。\n' +
'  sidekiq.service には設定済みで、puma.service だけ抜けていた、という状態です。\n\n' +
'【直し方】\n' +
'  $ sudo vi /etc/systemd/system/puma.service\n' +
'     [Service] に LimitNOFILE=65535 を追加して :wq\n' +
'  $ sudo systemctl daemon-reload      ← unitを読み直す（これを忘れると反映されない）\n' +
'  $ sudo systemctl restart puma       ← プロセスを入れ替える\n' +
'  $ ps aux | grep puma                ← PIDが変わったことを確認\n' +
'  $ cat /proc/<新しいPID>/limits\n' +
'  Max open files            65535                65535                files\n\n' +
'  **最後の確認まででワンセットです。**\n' +
'  daemon-reload を忘れても restart は成功してしまうので、\n' +
'  /proc で見るまで「直った」とは言えません。\n\n' +
'--- 覚えておくこと ---\n\n' +
'1. `ulimit -n` はシェルの値。サービスの値は unit の LimitNOFILE\n' +
'2. **動いているプロセスの実際の値は /proc/<PID>/limits にしかない**\n' +
'3. unitを直したら daemon-reload → restart → /proc で確認\n' +
'4. 同じ形が環境変数にもある（/proc/<PID>/environ）。「設定したはず」は必ず事実で確かめる',
    wrong: [
'メモリ不足ではありません。\n' +
'  $ free -h\n' +
'  available 3.9Gi、swapの使用は0\n\n' +
'メモリ不足なら Errno::ENOMEM や OOM Killer による強制終了になります。\n' +
'今回の Errno::EMFILE は「ファイルを開ける数」の上限で、メモリとは別の資源です。\n\n' +
'インスタンスサイズを上げても、LimitNOFILE が1024のままなら何も変わりません。\n' +
'Errno の種類から、どの資源が足りないのかを正確に読み取ってください。',
null,
'/etc/security/limits.conf は **PAM経由のログイン**に適用される設定です。\n' +
'SSHでログインしたシェルには効きますが、\n' +
'**systemdが起動したサービスには適用されません。**\n\n' +
'これは本当によくある勘違いで、\n' +
'「limits.conf を直したのに Too many open files が消えない」という形で現れます。\n\n' +
'systemdのサービスの上限は unit の LimitNOFILE= で決まります。\n' +
'そして直したかどうかは /proc/<PID>/limits で確認できます。',
'コネクションリークも実際にありうる原因で、疑う価値はあります。\n' +
'ただし今回はそれを示す証拠がありません。\n\n' +
'  ・エラーが出るのはアクセスが増える時間帯だけで、時間とともに悪化していない\n' +
'  ・Pumaを再起動しても、同じ時間帯にまた起きている\n' +
'  ・同じRedisを使っているSidekiqでは起きていない（上限が65535だから）\n\n' +
'リークなら、時間経過とともに fd が単調増加し、再起動でしばらく収まります。\n' +
'まず上限を正しく設定し、それでも増え続けるようなら\n' +
'lsof -p <PID> や /proc/<PID>/fd で本数の推移を追ってください。'
    ]
  },

  route: {
    steps: [
      'エラーの種類を正確に読む（EMFILE = fdの上限）',
      'シェルの上限を確認する（ulimit -n）',
      '動いているプロセスの実際の上限を見る（/proc/<PID>/limits）',
      '正常に動いている側のunitと比較する',
      'unitに LimitNOFILE を追加する',
      'daemon-reload してから restart する',
      '新しいPIDの /proc で、本当に変わったかを確認する'
    ],
    commands: [
      'grep -n "EMFILE" log/production.log | head -n 3',
      'free -h',
      'ulimit -n',
      'ps aux | grep puma',
      'cat /proc/1433/limits',
      'systemctl cat puma',
      'systemctl cat sidekiq',
      'sudo vi /etc/systemd/system/puma.service',
      'sudo systemctl daemon-reload',
      'sudo systemctl restart puma',
      'ps aux | grep puma',
      'cat /proc/9821/limits',
      'systemctl status puma'
    ],
    note:
'sidekiq.service と puma.service を先に見比べて差に気づくルートでも構いません。\n' +
'省略してはいけないのは最後の2つです。\n' +
'**daemon-reload を打つこと**と、**/proc で結果を確認すること**。\n' +
'どちらも忘れやすく、忘れても途中までは成功したように見えます。'
  }
});
})();
