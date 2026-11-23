/* CASE 18 — サービスを安全に再起動する */
(function () {
'use strict';
var APP = '/var/www/myapp';
var base = window.LFR.base;

var files = {};
var sk = [
'2026-09-13T15:04:14.880Z pid=1502 tid=3f8 INFO: Starting processing, hit Ctrl-C to stop'
];
for (var i = 0; i < 10; i++) {
  var t = '2026-09-14T' + String(13 + Math.floor(i / 6)).padStart(2, '0') + ':' +
          String((i * 9 + 4) % 60).padStart(2, '0') + ':' + String((i * 17) % 60).padStart(2, '0') + '.118Z';
  var jid = (i * 2654435761 >>> 0).toString(16).slice(0, 12);
  sk.push(t + ' pid=1502 tid=a12 class=EntryNotifyJob jid=' + jid + ' INFO: start');
  sk.push(t + ' pid=1502 tid=a12 class=EntryNotifyJob jid=' + jid + ' ERROR: NameError: uninitialized constant EntryNotifyJob::ApplicantMailer');
  sk.push(t + ' pid=1502 tid=a12 class=EntryNotifyJob jid=' + jid + ' INFO: fail: retrying in ' + (i + 1) * 15 + 's');
}
files[APP + '/shared/log/sidekiq.log'] = sk.join('\n') + '\n';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T15:40:11.402+09:00 #1433]  INFO -- : [7c2d1e0f-9a8b-4c7d-8e6f-5a4b3c2d1e0f] Started POST "/entries" for 10.0.2.31 at 2026-09-14 15:40:11 +0900\n' +
'I, [2026-09-14T15:40:11.588+09:00 #1433]  INFO -- : [7c2d1e0f-9a8b-4c7d-8e6f-5a4b3c2d1e0f] Enqueued EntryNotifyJob (Job ID: 3f9a1c8d) to Sidekiq(mailers)\n' +
'I, [2026-09-14T15:40:11.590+09:00 #1433]  INFO -- : [7c2d1e0f-9a8b-4c7d-8e6f-5a4b3c2d1e0f] Completed 302 Found in 188ms (ActiveRecord: 41.2ms)\n';

files[APP + '/releases/20260914120000/app/mailers/applicant_mailer.rb'] =
'class ApplicantMailer < ApplicationMailer\n' +
'  def entry_received(entry)\n' +
'    @entry = entry\n' +
'    mail(to: @entry.email, subject: "ご応募を受け付けました")\n' +
'  end\n' +
'end\n';

files['/etc/systemd/system/sidekiq.service'] =
'[Unit]\n' +
'Description=Sidekiq background worker for myapp (production)\n' +
'After=syslog.target network.target\n' +
'\n' +
'[Service]\n' +
'Type=notify\n' +
'WatchdogSec=10\n' +
'User=deploy\n' +
'WorkingDirectory=/var/www/myapp/current\n' +
'ExecStart=/home/deploy/.rbenv/shims/bundle exec sidekiq -e production\n' +
'# TERMを受けたら処理中のジョブを終えてから落ちる（既定25秒）\n' +
'KillSignal=SIGTERM\n' +
'TimeoutStopSec=30\n' +
'Restart=on-failure\n' +
'RestartSec=1\n' +
'\n' +
'[Install]\n' +
'WantedBy=multi-user.target\n';

window.LFR.scenarios.add({
  id: 'case18',
  firstLook: { name: 'キューを処理しているか調べる', cmd: 'systemctl status sidekiq',
    desc: 'Active の行と末尾のログを読み、再起動する前の状態を控えます。' },
  level: 7,
  title: 'サービスを安全に再起動する',
  subtitle: '止める・起こす・確かめる。復旧の基本動作',

  description:
'CASE 07 で調べたとおり、Sidekiq がデプロイ後に再起動されておらず、\n' +
'古いreleaseのコードのまま動き続けています。\n' +
'そのせいで応募完了メールのジョブが NameError で失敗し続けています。\n\n' +
'今回は調べるだけではありません。**直してください。**\n\n' +
'ただし本番のサービスを止める操作です。\n' +
'いきなり打たず、「いま何が動いているか」「止めたら何が起きるか」を確認してから実行し、\n' +
'実行後には必ず自分の目で復旧を確認してください。',

  learn: [
    { name: 'stop / start / restart / reload', cmd: 'systemctl restart sidekiq',
      desc: 'stop は止めるだけ、start は起こすだけ、restart はその両方を続けて行います。\n' +
            'reload は「プロセスを落とさずに設定だけ読み直す」操作で、\n' +
            'unitが対応している場合しか使えません（ExecReload が定義されていること）。\n\n' +
            'コードを入れ替えたときに必要なのは restart です。\n' +
            'reload では新しいコードは読み込まれません。' },
    { name: '止める前に確認する', cmd: 'systemctl status sidekiq',
      desc: '「いま処理中のジョブがあるか」「起動していつ経つか」を確認します。\n' +
            'Tasks や Memory、Active: の since は、止めてよいかの判断材料になります。\n' +
            'ps aux で実際のプロセスも見ておくと確実です。' },
    { name: 'unitファイルを読む', cmd: 'cat /etc/systemd/system/sidekiq.service',
      desc: '再起動時に何が起きるかは、unitファイルに書いてあります。\n\n' +
            '  KillSignal=SIGTERM   … いきなり強制終了せず、終了処理をさせる\n' +
            '  TimeoutStopSec=30    … 30秒待ってから強制終了する\n' +
            '  Restart=on-failure   … 異常終了したら自動で起こし直す\n\n' +
            'Sidekiqはこの設定により、処理中のジョブを終えてから落ちます。\n' +
            'kill -9 で落とすと、この安全装置が全部無効になります。' },
    { name: 'sudo', cmd: 'sudo systemctl restart sidekiq',
      desc: 'サービスの起動・停止には管理者権限が要ります。\n' +
            'deployユーザーのまま systemctl restart を打つと認証を求められて失敗します。' },
    { name: '実行後に確認する', cmd: 'systemctl status sidekiq',
      desc: '打ったら終わり、ではありません。復旧したことを自分で確かめます。\n\n' +
            '  systemctl status … Active: active (running) と since が更新されたか\n' +
            '  ps aux          … プロセスのSTARTが今の時刻になったか\n' +
            '  ログ             … エラーが止まったか\n\n' +
            'この3点確認を習慣にしてください。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '15:42:10',

  services: {
    sidekiq: {
      description: 'Sidekiq background worker for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Sun 2026-09-13 15:04:12 JST', ago: '24h 38min ago',
      mainPid: 1502, tasks: 14, memory: '254.1M',
      exec: '/home/deploy/.rbenv/shims/bundle exec sidekiq -e production',
      /* このCASEでは実際に再起動できる */
      recovery: {
        blockedBy: null,
        onUp: function (state) {
          /* restart は stop → start なので、ここで作り直す */
          state.processes = state.processes
            .filter(function (p) { return !/sidekiq/.test(p.command); })
            .concat([{
              pid: 9620, user: 'deploy', cpu: 0.3, mem: 5.1, vsz: 1098240, rss: 208940,
              stat: 'Sl', start: 'Sep14', time: '0:00',
              command: 'sidekiq 7.2.0 myapp [0 of 10 busy]'
            }]);
          state.services.sidekiq.mainPid = 9620;
          state.services.sidekiq.memory = '208.9M';
          state.sidekiqFixed = true;
        },
        onDown: function (state) {
          state.processes = state.processes.filter(function (p) { return !/sidekiq/.test(p.command); });
        }
      }
    },
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Mon 2026-09-14 12:00:31 JST', ago: '3h 42min ago',
      mainPid: 1421, tasks: 12, memory: '336.1M',
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb'
    }
  },

  journal: {
    sidekiq: [
      'Sep 13 15:04:12 production systemd[1]: Started Sidekiq background worker for myapp (production).',
      'Sep 14 12:04:18 production sidekiq[1502]: ERROR: NameError: uninitialized constant EntryNotifyJob::ApplicantMailer',
      'Sep 14 15:40:12 production sidekiq[1502]: ERROR: NameError: uninitialized constant EntryNotifyJob::ApplicantMailer'
    ]
  },

  processes: base.processes.map(function (p) {
    if (!/sidekiq/.test(p.command)) return p;
    var q = {}; Object.keys(p).forEach(function (k) { q[k] = p[k]; });
    q.start = 'Sep13'; q.time = '5:12'; q.mem = 6.4; q.rss = 260204;
    return q;
  }),

  hints: [
    'まず「止めてよい状態か」を確認します。\n' +
    'systemctl status と ps aux で、いま何が動いているか・いつから動いているかを見てください。\n' +
    'unitファイル（/etc/systemd/system/sidekiq.service）も読んでおくと、止めたときの挙動が分かります。',

    'コードを入れ替えたときに必要なのは reload ではなく restart です。\n' +
    'サービスの操作には管理者権限が要るので sudo を付けてください。\n\n' +
    '  sudo systemctl restart sidekiq',

    '実行したら、必ず自分の目で確認してください。\n\n' +
    '  systemctl status sidekiq   … Active: の since が更新されたか\n' +
    '  ps aux | grep sidekiq      … STARTが今日になったか、PIDが変わったか\n\n' +
    'ここまで見て初めて「復旧した」と言えます。'
  ],

  probes: [
    { key: 'checkedBefore', label: '再起動する前に状態を確認した',
      test: function (c, res, rt) {
        return /systemctl status sidekiq|ps aux/.test(c) && !rt.state.sidekiqFixed;
      } },
    { key: 'readUnitFile', label: 'unitファイルを読んで挙動を確認した',
      test: function (c, res) { return /KillSignal=SIGTERM|TimeoutStopSec/.test(res.stdout); } },
    { key: 'restarted', label: 'systemctl restart で再起動した',
      test: function (c, res, rt) { return /systemctl\s+(restart|stop)/.test(c) && res.exitCode === 0; } },
    { key: 'verifiedStatus', label: '再起動後にsystemctlで確認した',
      test: function (c, res, rt) { return rt.state.sidekiqFixed && /systemctl status sidekiq/.test(c) && /active \(running\)/.test(res.stdout); } },
    { key: 'verifiedProcess', label: '再起動後にプロセスを確認した',
      test: function (c, res, rt) { return rt.state.sidekiqFixed && /\b(ps|pgrep)\b/.test(c) && /9620/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'checkedBefore',   weight: 14, label: '実行前に状態を確認した' },
    { key: 'readUnitFile',    weight: 12, label: 'unitファイルで停止時の挙動を確認した' },
    { key: 'restarted',       weight: 16, label: '正しい方法で再起動した' },
    { key: 'verifiedStatus',  weight: 14, label: '再起動後にsystemctlで確認した' },
    { key: 'verifiedProcess', weight: 12, label: '再起動後にプロセスを確認した' }
  ],

  question: {
    text: 'Sidekiqを安全に再起動する手順として、最も適切なものは？',
    choices: [
      'kill -9 でプロセスを落としてから systemctl start sidekiq で起こす',
      'systemctl status と ps で現状を確認 → sudo systemctl restart sidekiq → status・ps・ログで復旧を確認する',
      'systemctl reload sidekiq を使う（restartより安全で、コードも読み直される）',
      'サーバーごと再起動する（他のサービスもまとめて確実にリフレッシュされる）'
    ],
    answer: 1,
    explain:
'正しい順序は「確認 → 実行 → 確認」です。\n\n' +
'【実行前の確認】\n' +
'  $ systemctl status sidekiq\n' +
'  Active: active (running) since Sun 2026-09-13 15:04:12 JST; 24h 38min ago\n' +
'  Tasks: 14\n' +
'  $ ps aux | grep sidekiq\n' +
'  deploy 1502 ... Sep13 ... sidekiq 7.2.0 myapp [0 of 10 busy]\n\n' +
'  [0 of 10 busy] なので、いま処理中のジョブはありません。止めても中断しません。\n' +
'  unitファイルも読んでおきます。\n\n' +
'  $ cat /etc/systemd/system/sidekiq.service\n' +
'  KillSignal=SIGTERM\n' +
'  TimeoutStopSec=30\n' +
'  Restart=on-failure\n\n' +
'  SIGTERMを送って30秒待つ設定なので、処理中のジョブがあっても\n' +
'  Sidekiqはそれを終えてから落ちます。安心して restart できます。\n\n' +
'【実行】\n' +
'  $ sudo systemctl restart sidekiq\n\n' +
'  reload ではなく restart です。reload は設定の読み直しであって、\n' +
'  プロセスは生きたままなので、新しいreleaseのコードは読み込まれません。\n\n' +
'【実行後の確認】\n' +
'  $ systemctl status sidekiq\n' +
'  Active: active (running) since ...（時刻が更新されている）\n' +
'  Main PID: 9620\n' +
'  $ ps aux | grep sidekiq\n' +
'  deploy 9620 ... Sep14 ... sidekiq 7.2.0 myapp [0 of 10 busy]\n\n' +
'  PIDが変わり、STARTが今日になりました。新しいプロセスです。\n' +
'  これで current が指す新しいreleaseのコードが読み込まれています。\n\n' +
'この「実行後に自分の目で確かめる」を省略すると、\n' +
'restartが失敗していたことに誰も気づかないまま時間が過ぎます。\n' +
'（サービスによっては起動に失敗して failed になっていることもあります）',
    wrong: [
'kill -9 は最後の手段です。\n' +
'SIGKILL はプロセスに終了処理をさせないため、\n' +
'処理中のジョブは中断され、Redis上では「実行中」のまま取り残されます。\n' +
'（Sidekiqではこれを回収するのに時間がかかり、最悪ジョブが二重実行されます）\n\n' +
'unitファイルには KillSignal=SIGTERM と TimeoutStopSec=30 が設定されていて、\n' +
'systemctl restart なら「終了処理をさせてから落とす」が自動的に行われます。\n' +
'わざわざその安全装置を外す理由はありません。',
null,
'reload は「プロセスを生かしたまま設定を読み直す」操作です。\n' +
'そもそもこのunitには ExecReload が定義されていないため実行できません。\n\n' +
'仮に使えたとしても、目的を果たせません。\n' +
'今回の問題は「古いreleaseのコードをメモリに載せたまま動いている」ことなので、\n' +
'プロセスを入れ替えない限り解決しません。\n' +
'コードを入れ替えたら restart、が原則です。',
'サーバー再起動は影響範囲が大きすぎます。\n' +
'nginx も Puma も Redis も止まるので、サイト全体がダウンします。\n' +
'いま困っているのは Sidekiq だけで、Puma は正常に動いています。\n\n' +
'障害対応では「影響範囲が最も小さい手段から試す」のが鉄則です。\n' +
'1サービスの restart で済むなら、それ以上のことをする必要はありません。'
    ]
  },

  route: {
    steps: [
      '現状を確認する（status / ps / 処理中のジョブの有無）',
      'unitファイルで、止めたときに何が起きるかを確認する',
      'reload ではなく restart が必要だと判断する',
      'sudo を付けて restart する',
      'status で since と Main PID が変わったことを確認する',
      'ps で STARTが今日になったことを確認する'
    ],
    commands: [
      'systemctl status sidekiq',
      'ps aux | grep sidekiq',
      'cat /etc/systemd/system/sidekiq.service',
      'tail -n 5 log/sidekiq.log',
      'sudo systemctl restart sidekiq',
      'systemctl status sidekiq',
      'ps aux | grep sidekiq',
      'journalctl -u sidekiq -n 10'
    ],
    note:
'順番は前後して構いませんが、「実行前の確認」と「実行後の確認」は飛ばさないでください。\n' +
'本番の復旧作業で事故が起きるのは、たいてい確認を省いたときです。'
  }
});
})();
