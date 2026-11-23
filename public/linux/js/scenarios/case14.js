/* CASE 14 — 古いPuma processが残っていないか確認する */
(function () {
'use strict';
var APP = '/var/www/myapp';
var base = window.LFR.base;

var files = {};
files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T16:02:10.114+09:00 #1433]  INFO -- : [a0b1c2d3-e4f5-4607-8918-293a4b5c6d7e] Started GET "/projects" for 10.0.2.31 at 2026-09-14 16:02:10 +0900\n' +
'I, [2026-09-14T16:02:10.221+09:00 #1433]  INFO -- : [a0b1c2d3-e4f5-4607-8918-293a4b5c6d7e] Completed 200 OK in 107ms (Views: 70.2ms | ActiveRecord: 14.1ms)\n' +
'I, [2026-09-14T16:02:44.882+09:00 #9012]  INFO -- : [b1c2d3e4-f506-4718-8a29-3b4c5d6e7f80] Started GET "/projects" for 10.0.2.18 at 2026-09-14 16:02:44 +0900\n' +
'I, [2026-09-14T16:02:44.990+09:00 #9012]  INFO -- : [b1c2d3e4-f506-4718-8a29-3b4c5d6e7f80] Completed 200 OK in 108ms (Views: 71.0ms | ActiveRecord: 13.8ms)\n' +
'I, [2026-09-14T16:03:21.402+09:00 #1434]  INFO -- : [c2d3e4f5-0617-4829-9b3a-4c5d6e7f8091] Started GET "/projects" for 10.0.2.44 at 2026-09-14 16:03:21 +0900\n' +
'I, [2026-09-14T16:03:21.510+09:00 #1434]  INFO -- : [c2d3e4f5-0617-4829-9b3a-4c5d6e7f8091] Completed 200 OK in 108ms (Views: 70.4ms | ActiveRecord: 14.0ms)\n' +
'I, [2026-09-14T16:04:02.771+09:00 #9013]  INFO -- : [d3e4f506-1728-493a-ac4b-5d6e7f809102] Started GET "/projects" for 10.0.2.27 at 2026-09-14 16:04:02 +0900\n' +
'I, [2026-09-14T16:04:02.879+09:00 #9013]  INFO -- : [d3e4f506-1728-493a-ac4b-5d6e7f809102] Completed 200 OK in 108ms (Views: 70.9ms | ActiveRecord: 13.9ms)\n';

files[APP + '/shared/log/puma.error.log'] =
'[9001] - Worker 0 (PID: 9012) booted in 0.02s, phase: 0\n' +
'[9001] - Worker 1 (PID: 9013) booted in 0.02s, phase: 0\n' +
'[9001] ! Detected parent died, cannot restart workers cleanly\n' +
'[1421] - Worker 0 (PID: 1433) booted in 0.02s, phase: 0\n' +
'[1421] - Worker 1 (PID: 1434) booted in 0.02s, phase: 0\n';

files['/home/deploy/deploy.log'] =
'15:34:40 puma:restart\n' +
'      01 systemctl --user restart puma\n' +
'      01 Failed to connect to bus: No medium found\n' +
'      01 sudo systemctl restart puma\n' +
'      ✔ 01 deploy@production 2.104s\n' +
'15:34:55 deploy:published\n';

window.LFR.scenarios.add({
  id: 'case14',
  level: 4,
  title: '古いPuma processが残っていないか確認する',
  subtitle: '同じ症状が「出たり出なかったり」するときに疑うこと',

  description:
'今朝のデプロイのあと、妙な報告が上がっています。\n\n' +
'「求人一覧の表示が、リロードするたびに変わります。\n' +
'  給与レンジが出るときと、出ないときがあります」\n\n' +
'エラーは出ていません。500も502もありません。\n' +
'レスポンスは毎回200で返っています。\n\n' +
'「たまに古い挙動になる」という症状のとき、\n' +
'Linux側で確認すべきことがあります。調べてください。',

  learn: [
    { name: 'ps aux', cmd: 'ps aux | grep puma',
      desc: '動いているプロセスの一覧です。\n' +
            'Pumaはcluster modeだと master 1つ + worker 複数という構成になります。\n' +
            'workers 2 の設定なら、合計3プロセスが正常です。\n' +
            'それより多ければ、余計なものが混ざっています。' },
    { name: 'STARTを読む', cmd: 'ps aux | grep puma',
      desc: 'ps の START 列は、そのプロセスが起動した日時です。\n' +
            '今日のデプロイより前の日付があれば、それはデプロイをまたいで\n' +
            '生き残っているプロセスです。古いコードを持ったままの可能性があります。' },
    { name: 'pgrep', cmd: 'pgrep -a puma',
      desc: '該当するプロセスをPIDとコマンドラインで列挙します。\n' +
            'grep自身が結果に混ざらないので、件数を数えるときに正確です。' },
    { name: 'systemctl status', cmd: 'systemctl status puma',
      desc: 'systemdが管理しているのはどのPIDかを確認します。\n' +
            'Main PID に出ていないプロセスは、systemdの管理外です。\n' +
            'systemctl restart を打っても、そのプロセスは止まりません。' },
    { name: 'ログのPIDを読む', cmd: 'grep -o "#[0-9]*" log/production.log | sort | uniq -c',
      desc: 'Railsのログには、そのリクエストを処理したプロセスのPIDが記録されています。\n' +
            '出てくるPIDの種類を数えれば、実際に何プロセスがリクエストを\n' +
            '処理しているかが分かります。症状と直接つながる、強い証拠です。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '16:05:30',

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Mon 2026-09-14 15:34:55 JST', ago: '30min ago',
      mainPid: 1421, tasks: 12, memory: '338.2M',
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb'
    }
  },

  journal: {
    puma: [
      'Sep 13 15:04:02 production systemd[1]: Started Puma HTTP Server for myapp (production).',
      'Sep 14 15:34:52 production systemd[1]: Stopping Puma HTTP Server for myapp (production)...',
      'Sep 14 15:34:53 production systemd[1]: puma.service: Failed to kill control group, ignoring: Operation not permitted',
      'Sep 14 15:34:53 production systemd[1]: Starting Puma HTTP Server for myapp (production)...',
      'Sep 14 15:34:55 production puma[1421]: * Listening on unix:///var/www/myapp/shared/tmp/sockets/puma.sock',
      'Sep 14 15:34:55 production systemd[1]: Started Puma HTTP Server for myapp (production).'
    ]
  },

  /* 新旧2組のPumaが同居している */
  processes: base.processes
    .filter(function (p) { return !/puma/.test(p.command); })
    .concat([
      { pid: 9001, user: 'deploy', cpu: 0.6, mem: 7.9, vsz: 1271040, rss: 322108,
        stat: 'Sl', start: 'Sep13', time: '9:41',
        command: 'puma 6.4.2 (unix:///var/www/myapp/shared/tmp/sockets/puma.sock) [myapp]' },
      { pid: 9012, user: 'deploy', cpu: 0.4, mem: 7.4, vsz: 1244160, rss: 301884,
        stat: 'Sl', start: 'Sep13', time: '8:52',
        command: 'puma: cluster worker 0: 9001 [myapp]' },
      { pid: 9013, user: 'deploy', cpu: 0.4, mem: 7.3, vsz: 1242112, rss: 299520,
        stat: 'Sl', start: 'Sep13', time: '8:47',
        command: 'puma: cluster worker 1: 9001 [myapp]' },
      { pid: 1421, user: 'deploy', cpu: 1.1, mem: 8.4, vsz: 1284932, rss: 344180,
        stat: 'Sl', start: 'Sep14', time: '0:24',
        command: 'puma 6.4.2 (unix:///var/www/myapp/shared/tmp/sockets/puma.sock) [myapp]' },
      { pid: 1433, user: 'deploy', cpu: 0.9, mem: 7.8, vsz: 1251104, rss: 318604,
        stat: 'Sl', start: 'Sep14', time: '0:19',
        command: 'puma: cluster worker 0: 1421 [myapp]' },
      { pid: 1434, user: 'deploy', cpu: 0.8, mem: 7.6, vsz: 1248832, rss: 312048,
        stat: 'Sl', start: 'Sep14', time: '0:18',
        command: 'puma: cluster worker 1: 1421 [myapp]' }
    ]),

  hints: [
    '「たまに古い挙動になる」は、古いものと新しいものが同居しているサインです。\n' +
    'まずはPumaのプロセスが何個あるかを数えてみてください。\n' +
    'workers 2 の設定なら、正常時は何個でしょうか。',

    'ps aux | grep puma を実行して、プロセスの数と START の日付を見てください。\n' +
    'masterが何個あるかにも注目してください（worker行の末尾には親のPIDが書かれています）。',

    'systemctl status puma の Main PID と、ps に出ているmasterのPIDを見比べてください。\n' +
    'さらに production.log に記録されているPIDを数えると、\n' +
    'どちらのPumaもリクエストを処理していることが分かります。\n\n' +
    '  grep -o "#[0-9]*" log/production.log | sort | uniq -c'
  ],

  probes: [
    { key: 'countedProcesses', label: 'Pumaのプロセスを一覧した',
      test: function (c, res) { return /\b(ps|pgrep)\b/.test(c) && /puma/.test(res.stdout); } },
    { key: 'sawTwoMasters', label: 'masterが2つあることに気づいた',
      test: function (c, res) { return /9001/.test(res.stdout) && /1421/.test(res.stdout); } },
    { key: 'sawOldStart', label: '前日から動いているプロセスを見つけた',
      test: function (c, res) { return /Sep13/.test(res.stdout); } },
    { key: 'comparedMainPid', label: 'systemdのMain PIDと照合した',
      test: function (c, res) { return /Main PID/.test(res.stdout); } },
    { key: 'sawMixedPidsInLog', label: 'ログに複数系統のPIDが出ていることを確認した',
      test: function (c, res) { return /#9012|#9013/.test(res.stdout); } },
    { key: 'sawKillFailure', label: 'journalctlで停止に失敗した記録を見つけた',
      test: function (c, res) { return /Failed to kill control group/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'countedProcesses',   weight: 8,  label: 'Pumaのプロセスを一覧した' },
    { key: 'sawTwoMasters',      weight: 16, label: 'masterが2系統あることを確認した' },
    { key: 'sawOldStart',        weight: 12, label: 'STARTの日付から古いプロセスだと判断した' },
    { key: 'comparedMainPid',    weight: 10, label: 'systemdのMain PIDと照合した' },
    { key: 'sawMixedPidsInLog',  weight: 12, label: 'ログのPIDから両方が処理中だと確認した' },
    { key: 'sawKillFailure',     weight: 8,  label: '停止に失敗した記録を見つけた' }
  ],

  question: {
    text: 'Pumaのプロセスの状態として、正しい説明はどれ？',
    choices: [
      '正常。Pumaはmaster 1つとworker 2つで動くので、表示されているプロセス数は想定内',
      '前回のデプロイで停止しきれなかった古いPumaのmasterとworkerが残り、新旧が同時に動いている',
      'Sidekiqのプロセスがpumaという名前で表示されているだけ',
      'nginxがPumaを二重に起動している'
    ],
    answer: 1,
    explain:
'ps aux | grep puma の出力を整理すると、2系統あることが分かります。\n\n' +
'  PID   START   COMMAND\n' +
'  9001  Sep13   puma 6.4.2 (unix:///...puma.sock) [myapp]        ← 旧master\n' +
'  9012  Sep13   puma: cluster worker 0: 9001 [myapp]             ← 旧worker\n' +
'  9013  Sep13   puma: cluster worker 1: 9001 [myapp]             ← 旧worker\n' +
'  1421  Sep14   puma 6.4.2 (unix:///...puma.sock) [myapp]        ← 新master\n' +
'  1433  Sep14   puma: cluster worker 0: 1421 [myapp]             ← 新worker\n' +
'  1434  Sep14   puma: cluster worker 1: 1421 [myapp]             ← 新worker\n\n' +
'worker行の末尾の数字が親のPIDです。9001系と1421系、masterが2つあります。\n' +
'puma.rb の workers 2 に対して、正常なら3プロセスのはずが6プロセスです。\n\n' +
'systemdが知っているのは片方だけです。\n\n' +
'  $ systemctl status puma\n' +
'  Main PID: 1421\n\n' +
'9001はsystemdの管理外なので、systemctl restart puma を打っても止まりません。\n' +
'原因は journalctl -u puma に残っています。\n\n' +
'  puma.service: Failed to kill control group, ignoring: Operation not permitted\n\n' +
'停止処理が完了しないまま新しいPumaが起動したため、両方が生き残りました。\n\n' +
'そして症状と直結する証拠がログにあります。\n\n' +
'  $ grep -o "#[0-9]*" log/production.log | sort | uniq -c\n' +
'  #1433 #1434 #9012 #9013\n\n' +
'リクエストが新旧どちらのworkerにも振られています。\n' +
'旧workerは preload_app! で昨日のreleaseのコードをメモリに持ったままなので、\n' +
'そちらに当たったリクエストだけ古い表示になります。\n' +
'「リロードするたびに変わる」のはこのためです。\n\n' +
'対処するときは、いきなり kill -9 9001 としないでください。\n' +
'処理中のリクエストが切断されます。\n' +
'まず systemctl stop puma で管理下のものを止め、残ったPIDには\n' +
'kill 9001（SIGTERM）を送って、Pumaに正常終了させます。',
    wrong: [
'プロセス数が合いません。\n' +
'shared/config/puma.rb には workers 2 と書かれているので、\n' +
'正常なら master 1 + worker 2 の合計3プロセスです。\n\n' +
'実際には6プロセスあり、worker行の親PIDが 9001 と 1421 の2種類に分かれています。\n' +
'START の日付も Sep13 と Sep14 で割れています。\n' +
'数を数えて、親PIDを確認してください。',
null,
'Sidekiqではありません。\n' +
'ps aux | grep sidekiq を実行すると、Sidekiqは別プロセス（pid 1502）として\n' +
'独立して動いていることが分かります。\n' +
'puma と表示されているプロセスは、コマンドラインも puma のものです。',
'nginxはPumaを起動しません。両者は独立したサービスです。\n' +
'nginxの役割は、受け取ったリクエストを puma.sock へ転送することだけです\n' +
'（/etc/nginx/sites-enabled/myapp.conf の proxy_pass を参照）。\n\n' +
'Pumaを起動しているのは systemd で、journalctl -u puma にその記録があります。'
    ]
  },

  route: {
    steps: [
      '「たまに古い挙動」＝新旧が同居している可能性を疑う',
      'Pumaのプロセスを一覧して数える（ps / pgrep）',
      'worker行の親PIDから、masterが何系統あるか確認する',
      'STARTの日付で、いつからいるプロセスかを判断する',
      'systemctlのMain PIDと照合して、管理外のものを特定する',
      'ログのPIDから、実際に両方が処理していることを確認する'
    ],
    commands: [
      'cd /var/www/myapp/current',
      'ps aux | grep puma',
      'pgrep -a puma',
      'systemctl status puma',
      'journalctl -u puma -n 20',
      'grep -o "#[0-9]*" log/production.log | sort | uniq -c',
      'cat /var/www/myapp/shared/config/puma.rb',
      'tail -n 10 /var/www/myapp/shared/log/puma.error.log'
    ],
    note:
'production.log のPIDの偏りから先に気づくルートでも構いません。\n' +
'「症状がランダム」なときは、まず「同じものが複数動いていないか」を数える。\n' +
'これはPumaに限らず、SidekiqでもcronでもWorkerでも同じです。'
  }
});
})();
