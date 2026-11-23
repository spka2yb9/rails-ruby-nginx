/* CASE 21 — メモリを無停止でリフレッシュする（Puma phased restart） */
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
'state_path "/var/www/myapp/shared/tmp/pids/puma.state"\n' +
'stdout_redirect "/var/www/myapp/shared/log/puma.access.log", "/var/www/myapp/shared/log/puma.error.log", true\n' +
'\n' +
'threads 5, 5\n' +
'workers 2\n' +
'\n' +
'# phased-restart を使うには preload_app! を外す必要がある\n' +
'# （preload_app! があると workers はmasterのメモリを共有するため、\n' +
'#   1つずつ入れ替えることができない）\n' +
'# preload_app!\n' +
'\n' +
'on_worker_boot do\n' +
'  ActiveRecord::Base.establish_connection\n' +
'end\n' +
'\n' +
'bind "unix:///var/www/myapp/shared/tmp/sockets/puma.sock"\n';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T17:40:11.402+09:00 #1433]  INFO -- : [88aa99bb-00cc-4dd1-8ee2-ff3300aa44bb] Started GET "/projects" for 10.0.2.31 at 2026-09-14 17:40:11 +0900\n' +
'I, [2026-09-14T17:40:11.902+09:00 #1433]  INFO -- : [88aa99bb-00cc-4dd1-8ee2-ff3300aa44bb] Completed 200 OK in 500ms (Views: 310.2ms | ActiveRecord: 88.1ms)\n' +
'I, [2026-09-14T17:43:02.114+09:00 #1434]  INFO -- : [99bb00cc-11dd-4ee2-9ff3-00aa44bb55cc] Started GET "/" for 10.0.2.18 at 2026-09-14 17:43:02 +0900\n' +
'I, [2026-09-14T17:43:02.722+09:00 #1434]  INFO -- : [99bb00cc-11dd-4ee2-9ff3-00aa44bb55cc] Completed 200 OK in 608ms (Views: 402.1ms | ActiveRecord: 91.4ms)\n';

files['/home/deploy/ops-notes.md'] =
'# メモリリーク対応メモ\n' +
'\n' +
'Rails 7.0.8 へ上げてから、Pumaのworkerのメモリ使用量が\n' +
'時間とともに増え続けるようになった（1日で 300MB → 900MB 程度）。\n' +
'\n' +
'原因の特定には時間がかかりそうなので、暫定対応として\n' +
'定期的に phased-restart を回してメモリを戻している。\n' +
'\n' +
'- 対象は puma のみ。sidekiq は対象外\n' +
'  （実行中のジョブを途中で切ってしまうリスクがあるため）\n' +
'- メモリ使用率が8割を超えないようにするのが目標\n';

window.LFR.scenarios.add({
  id: 'case21',
  firstLook: { name: 'メモリの空き具合を調べる', cmd: 'free -h',
    desc: 'Mem の行で available を見ます。作業前の値を控えると、復旧後にメモリをどれだけ使えるようになったかを比べられます。' },
  level: 7,
  title: 'メモリを無停止でリフレッシュする',
  subtitle: 'ダウンタイムを出さずにworkerだけ入れ替える',

  description:
'監視から「メモリ使用率が80%を超えた」というアラートが届きました。\n\n' +
'サイトはまだ動いていますが、レスポンスが少しずつ遅くなっています。\n' +
'（いつもは100ms前後のページが500〜600msかかっています）\n\n' +
'このアプリではRailsのバージョンアップ以降、Pumaのworkerのメモリが\n' +
'時間とともに増え続ける現象が起きていて、恒久対応はまだ入っていません。\n\n' +
'いまはユーザーが使っている時間帯です。\n' +
'**ダウンタイムを出さずに** メモリを戻してください。\n' +
'そのうえで、同じ作業を手でやらなくて済むようにしてください。',

  learn: [
    { name: 'restart と phased-restart の違い', cmd: 'pumactl phased-restart',
      desc: 'systemctl restart puma は、masterもworkerも全部落として起こし直します。\n' +
            '確実ですが、起動し終わるまでの数秒〜十数秒はリクエストを受けられません。\n\n' +
            'pumactl phased-restart は、masterを生かしたままworkerを1つずつ入れ替えます。\n' +
            '入れ替え中も残りのworkerがリクエストを受け続けるので、ダウンタイムが出ません。\n' +
            'メモリを戻す目的なら、こちらで十分です。' },
    { name: 'phased-restart が使える条件', cmd: 'cat /var/www/myapp/shared/config/puma.rb',
      desc: 'cluster mode（workers が1以上）であることに加えて、\n' +
            '**preload_app! を使っていない** ことが条件です。\n\n' +
            'preload_app! はmasterでアプリを読み込んでからforkする仕組みで、\n' +
            'メモリ効率は良いのですが、workerだけを個別に入れ替えられません。\n' +
            'phased-restart を使いたい構成では、これを外して on_worker_boot で\n' +
            'DB接続を張り直す書き方にします。' },
    { name: 'free -h で前後を比べる', cmd: 'free -h',
      desc: '作業の効果は数字で確かめます。\n' +
            'available が増えているか、used が減っているかを、実行前後で比べてください。' },
    { name: 'ps で入れ替わりを確認する', cmd: 'ps aux | grep puma',
      desc: 'phased-restart のあと、workerのPIDは変わり、masterのPIDは変わりません。\n' +
            'これが「無停止で入れ替えた」証拠になります。\n' +
            'RSS（実メモリ）も下がっているはずです。' },
    { name: 'cron / systemd timer', cmd: 'crontab -l',
      desc: '同じ作業を毎回手でやるのは現実的ではありません。\n' +
            '定期実行に載せるのが本来の対応です。\n' +
            'cron か systemd timer のどちらで動いているかは、環境によります。\n' +
            '両方を確認する癖をつけてください（systemctl list-timers）。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '17:45:02',

  system: {
    uptime: { since: '8 days, 01:38', users: 1, load: [2.41, 2.18, 1.92] },
    cpu:    { cores: 4, us: 18.2, sy: 6.1, id: 68.4, wa: 7.3 },
    mem:    { total: 7823, used: 6480, free: 402, shared: 71, buffCache: 941, available: 1210 },
    swap:   { total: 2047, used: 128, free: 1919 }
  },

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Sun 2026-09-13 12:00:31 JST', ago: '29h 44min ago',
      mainPid: 1421, tasks: 12, memory: '1.8G',
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb',
      recovery: {
        blockedBy: null,
        onUp: function (state) {
          state.processes.forEach(function (p) {
            if (!/puma/.test(p.command)) return;
            p.start = 'Sep14'; p.time = '0:00';
            p.mem = /cluster worker/.test(p.command) ? 3.2 : 3.4;
            p.rss = /cluster worker/.test(p.command) ? 251904 : 266240;
          });
          var m = state.system.mem;
          m.used = 3980; m.free = 1902; m.available = 3710;
          state.fullRestarted = true;
        },
        onDown: function (state) {}
      }
    }
  },

  /* メモリを食い続けている状態 */
  processes: base.processes.map(function (p) {
    var q = {}; Object.keys(p).forEach(function (k) { q[k] = p[k]; });
    if (/puma 6\.4\.2/.test(p.command)) { q.mem = 11.8; q.rss = 944128; q.start = 'Sep13'; q.time = '18:22'; }
    else if (/puma: cluster worker/.test(p.command)) { q.mem = 11.4; q.rss = 912384; q.start = 'Sep13'; q.time = '17:40'; }
    return q;
  }),

  journal: {
    puma: [
      'Sep 13 12:00:33 production systemd[1]: Started Puma HTTP Server for myapp (production).',
      'Sep 13 12:00:33 production puma[1421]: - Worker 0 (PID: 1433) booted in 0.02s, phase: 0',
      'Sep 13 12:00:33 production puma[1421]: - Worker 1 (PID: 1434) booted in 0.02s, phase: 0'
    ]
  },

  crontab: {
    deploy: [
      '# m h  dom mon dow   command',
      'MAILTO=""',
      '0 4 * * * /usr/bin/find /var/www/myapp/shared/tmp/cache -type f -mtime +7 -delete',
      '30 4 * * 0 /usr/bin/bundle exec rails runner -e production "Report.weekly!" >> /var/www/myapp/shared/log/cron.log 2>&1'
    ]
  },

  timers: [
    { unit: 'logrotate.timer',            next: 'Tue 2026-09-15 00:00:00 JST', left: '6h 14min', last: 'Mon 2026-09-14 00:00:02 JST', passed: '17h ago' },
    { unit: 'dnf-makecache.timer',        next: 'Mon 2026-09-14 18:07:00 JST', left: '21min',    last: 'Mon 2026-09-14 12:07:01 JST', passed: '5h 38min ago' },
    { unit: 'systemd-tmpfiles-clean.timer', next: 'Tue 2026-09-15 01:12:44 JST', left: '7h 27min', last: 'Mon 2026-09-14 01:12:44 JST', passed: '16h ago' }
  ],

  hints: [
    'いまはユーザーが使っている時間帯です。\n' +
    'systemctl restart puma でもメモリは戻りますが、その数秒〜十数秒は\n' +
    'リクエストを受けられません。無停止でworkerだけを入れ替える方法があります。',

    'Pumaには pumactl というコマンドがあります。\n' +
    'まず shared/config/puma.rb を読んで、その方法が使える構成かどうかを確認してください。\n' +
    '（使うための条件が1つコメントに書かれています）\n\n' +
    '実行前に free -h と ps aux | grep puma の数字を控えておいてください。',

    '  free -h                    ← 実行前の数字\n' +
    '  ps aux | grep puma         ← 実行前のPIDとRSS\n' +
    '  pumactl phased-restart\n' +
    '  ps aux | grep puma         ← workerのPIDだけ変わる\n' +
    '  free -h                    ← available が増える\n\n' +
    'そのあと、この作業が定期実行に載っているかを crontab -l で確認してください。'
  ],

  probes: [
    { key: 'sawMemoryPressure', label: 'メモリが逼迫していることを確認した',
      test: function (c, res) { return /\bfree\b|\btop\b/.test(c) && /1\.2Gi|1210|6480/.test(res.stdout); } },
    { key: 'sawWorkerRss', label: 'workerのメモリ使用量を確認した',
      test: function (c, res) { return /912384|944128|11\.4|11\.8/.test(res.stdout); } },
    { key: 'readPumaConfig', label: 'puma.rb で phased-restart の条件を確認した',
      test: function (c, res) { return /preload_app/.test(res.stdout); } },
    { key: 'usedPhasedRestart', label: 'phased-restart を実行した',
      test: function (c, res) { return /phased-restart/.test(c) && res.exitCode === 0; } },
    { key: 'verifiedPids', label: 'workerのPIDが入れ替わったことを確認した',
      test: function (c, res) { return /950[0-9]/.test(res.stdout); } },
    { key: 'verifiedMemoryAfter', label: 'メモリが戻ったことを数字で確認した',
      test: function (c, res, rt) {
        return /\bfree\b/.test(c) && rt.investigation.facts.usedPhasedRestart;
      } },
    { key: 'checkedSchedule', label: '定期実行に載っているかを確認した',
      test: function (c) { return /crontab|list-timers/.test(c); } }
  ],

  evidence: [
    { key: 'sawMemoryPressure',   weight: 10, label: 'メモリの逼迫を確認した' },
    { key: 'sawWorkerRss',        weight: 10, label: 'どのプロセスが食っているかを確認した' },
    { key: 'readPumaConfig',      weight: 14, label: 'phased-restart が使える構成か確認した' },
    { key: 'usedPhasedRestart',   weight: 20, label: '無停止でworkerを入れ替えた' },
    { key: 'verifiedPids',        weight: 12, label: 'PIDの入れ替わりを確認した' },
    { key: 'verifiedMemoryAfter', weight: 12, label: 'メモリが戻ったことを確認した' },
    { key: 'checkedSchedule',     weight: 10, label: '定期実行の有無まで確認した' }
  ],

  question: {
    text: 'ユーザーが使っている時間帯に、ダウンタイムを出さずにPumaのメモリを戻す方法は？',
    choices: [
      'sudo systemctl restart puma（確実にメモリが戻る）',
      'pumactl phased-restart（masterを生かしたままworkerを1つずつ入れ替える）',
      'sudo systemctl reload puma（設定を読み直せばメモリも戻る）',
      'kill -9 でworkerを落とす（masterが自動で起こし直してくれる）'
    ],
    answer: 1,
    explain:
'まず状況を数字で押さえます。\n\n' +
'  $ free -h\n' +
'  Mem:  total 7.6Gi  used 6.3Gi  available 1.2Gi\n' +
'  Swap: total 2.0Gi  used 128Mi        ← swapに入り始めている\n\n' +
'  $ ps aux | grep puma\n' +
'  deploy 1421 ... 11.8 ... 944128 ... Sep13 ... puma 6.4.2 (...)\n' +
'  deploy 1433 ... 11.4 ... 912384 ... Sep13 ... puma: cluster worker 0: 1421\n' +
'  deploy 1434 ... 11.4 ... 912384 ... Sep13 ... puma: cluster worker 1: 1421\n\n' +
'  昨日から動きっぱなしのworkerが、それぞれ約890MBまで膨らんでいます。\n\n' +
'次に、使える手段かどうかを設定で確認します。\n\n' +
'  $ cat /var/www/myapp/shared/config/puma.rb\n' +
'  workers 2\n' +
'  # preload_app!        ← 外してある\n' +
'  on_worker_boot do\n' +
'    ActiveRecord::Base.establish_connection\n' +
'  end\n\n' +
'  cluster mode かつ preload_app! を使っていないので、phased-restart が使えます。\n' +
'  （preload_app! があると、workerはmasterのメモリを共有しているため\n' +
'    1つずつ入れ替えることができません）\n\n' +
'実行して、前後を比べます。\n\n' +
'  $ pumactl phased-restart\n' +
'  Command phased-restart sent success\n' +
'  $ ps aux | grep puma\n' +
'  deploy 1421 ... puma 6.4.2 (...)                  ← masterのPIDは変わらない\n' +
'  deploy 9500 ... puma: cluster worker 0: 1421      ← workerだけ入れ替わった\n' +
'  deploy 9501 ... puma: cluster worker 1: 1421\n' +
'  $ free -h\n' +
'  available が1.2Gi → 3Gi台まで戻る\n\n' +
'masterのPIDが変わっていないことが「無停止だった」証拠です。\n' +
'workerは1つずつ落として起こし直されるので、その間も残りのworkerが\n' +
'リクエストを受け続けます。ユーザーから見ればダウンタイムはゼロです。\n\n' +
'--- そして、これで終わりにしないでください ---\n\n' +
'  $ crontab -l\n' +
'  0 4 * * * /usr/bin/find ... -delete\n' +
'  30 4 * * 0 /usr/bin/bundle exec rails runner ...\n\n' +
'phased-restart は登録されていません。つまり毎回アラートが鳴ってから\n' +
'誰かが手で打っている状態です。これを定期実行に載せるのが本来の対応です。\n\n' +
'  0 */6 * * * cd /var/www/myapp/current && bundle exec pumactl phased-restart\n\n' +
'（systemd timer で組む場合は systemctl list-timers で確認できます）\n\n' +
'なお、この定期リフレッシュはあくまで暫定対応です。\n' +
'~/ops-notes.md にあるとおり、メモリが増え続ける原因そのものは別に調査が要ります。\n' +
'「毎日手で叩く運用」を「定期実行」に変えるのは改善ですが、\n' +
'「そもそも増えないようにする」までが本当のゴールです。',
    wrong: [
'メモリは確実に戻りますが、ダウンタイムが出ます。\n' +
'systemctl restart は master も worker も全部落としてから起こし直すため、\n' +
'アプリが起動し終わるまでの数秒〜十数秒はリクエストを受けられません。\n' +
'（その間 nginx は 502 を返します）\n\n' +
'深夜やメンテナンス時間帯なら妥当な選択ですが、\n' +
'いまはユーザーが使っている時間帯です。\n' +
'無停止でできる手段があるなら、そちらを選んでください。',
null,
'reload ではメモリは戻りません。\n' +
'reload は「プロセスを生かしたまま設定を読み直す」操作なので、\n' +
'workerのプロセス自体は入れ替わらず、確保しているメモリもそのままです。\n\n' +
'メモリを戻すにはプロセスを作り直す必要があります。\n' +
'そのうえで「全部一度に作り直す（restart）」のか\n' +
'「1つずつ作り直す（phased-restart）」のかを選びます。',
'kill -9 は使わないでください。\n' +
'SIGKILL はworkerに終了処理をさせないため、\n' +
'そのworkerが処理中だったリクエストは応答を返さないまま切断されます。\n' +
'（ユーザーには502やタイムアウトとして見えます）\n\n' +
'masterが起こし直してくれるのは事実ですが、それは「事故のあと片付け」であって\n' +
'意図した入れ替え手順ではありません。\n' +
'pumactl phased-restart なら、Pumaが自分で安全な順序で入れ替えてくれます。'
    ]
  },

  route: {
    steps: [
      '実行前の数字を控える（free -h / ps aux）',
      'どのプロセスがメモリを食っているかを特定する',
      'puma.rb を読んで phased-restart が使える構成か確認する',
      'pumactl phased-restart を実行する',
      'workerのPIDだけが変わり、masterは変わっていないことを確認する',
      'free -h で available が戻ったことを確認する',
      '同じ作業が定期実行に載っているかを確認する'
    ],
    commands: [
      'free -h',
      'uptime',
      'ps aux | grep puma',
      'systemctl status puma',
      'cat /var/www/myapp/shared/config/puma.rb',
      'pumactl status',
      'pumactl phased-restart',
      'ps aux | grep puma',
      'free -h',
      'journalctl -u puma -n 6',
      'crontab -l',
      'systemctl list-timers',
      'cat ~/ops-notes.md'
    ],
    note:
'top から入って「pumaが%MEMを食っている」と先に気づくルートでも構いません。\n' +
'このCASEで身につけてほしいのは2つです。\n' +
'「無停止でできる手段があるなら、止める手段を選ばない」\n' +
'「手で直したら、次は手でやらなくて済む形にする」'
  }
});
})();
