/* CASE 07 — Sidekiqがジョブを処理していない原因を探す */
(function () {
'use strict';
var APP = '/var/www/myapp';
var base = window.LFR.base;

var files = {};

/* 昨日までは正常。今朝のデプロイ以降ずっと同じ例外で落ち続けている */
var sk = [
'2026-09-13T15:04:14.201Z pid=1502 tid=3f8 INFO: Booting Sidekiq 7.2.0',
'2026-09-13T15:04:14.880Z pid=1502 tid=3f8 INFO: Starting processing, hit Ctrl-C to stop',
'2026-09-13T18:22:41.117Z pid=1502 tid=a12 class=EntryNotifyJob jid=8c1f2a7e40d9 INFO: start',
'2026-09-13T18:22:41.904Z pid=1502 tid=a12 class=EntryNotifyJob jid=8c1f2a7e40d9 elapsed=0.787 INFO: done'
];
for (var i = 0; i < 16; i++) {
  var t = '2026-09-14T' + String(12 + Math.floor(i / 6)).padStart(2, '0') + ':' +
          String((i * 9 + 4) % 60).padStart(2, '0') + ':' + String((i * 17) % 60).padStart(2, '0') + '.' +
          String(100 + i * 31).slice(0, 3) + 'Z';
  var jid = (i * 2654435761 >>> 0).toString(16).slice(0, 12);
  sk.push(t + ' pid=1502 tid=a12 class=EntryNotifyJob jid=' + jid + ' INFO: start');
  sk.push(t + ' pid=1502 tid=a12 class=EntryNotifyJob jid=' + jid + ' ERROR: NameError: uninitialized constant EntryNotifyJob::ApplicantMailer');
  sk.push(t + ' pid=1502 tid=a12 class=EntryNotifyJob jid=' + jid + ' ERROR: /var/www/myapp/releases/20260913150000/app/jobs/entry_notify_job.rb:9:in `perform\'');
  sk.push(t + ' pid=1502 tid=a12 class=EntryNotifyJob jid=' + jid + ' INFO: fail: retrying in ' + (i + 1) * 15 + 's');
}
files[APP + '/shared/log/sidekiq.log'] = sk.join('\n') + '\n';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T14:02:11.402+09:00 #1433]  INFO -- : [7c2d1e0f-9a8b-4c7d-8e6f-5a4b3c2d1e0f] Started POST "/entries" for 10.0.2.31 at 2026-09-14 14:02:11 +0900\n' +
'I, [2026-09-14T14:02:11.404+09:00 #1433]  INFO -- : [7c2d1e0f-9a8b-4c7d-8e6f-5a4b3c2d1e0f] Processing by EntriesController#create as HTML\n' +
'I, [2026-09-14T14:02:11.588+09:00 #1433]  INFO -- : [7c2d1e0f-9a8b-4c7d-8e6f-5a4b3c2d1e0f] Enqueued EntryNotifyJob (Job ID: 3f9a1c8d) to Sidekiq(mailers)\n' +
'I, [2026-09-14T14:02:11.590+09:00 #1433]  INFO -- : [7c2d1e0f-9a8b-4c7d-8e6f-5a4b3c2d1e0f] Completed 302 Found in 188ms (ActiveRecord: 41.2ms)\n' +
'I, [2026-09-14T14:09:50.111+09:00 #1434]  INFO -- : [1a2b3c4d-5e6f-4071-8293-a4b5c6d7e8f9] Started POST "/entries" for 10.0.2.44 at 2026-09-14 14:09:50 +0900\n' +
'I, [2026-09-14T14:09:50.298+09:00 #1434]  INFO -- : [1a2b3c4d-5e6f-4071-8293-a4b5c6d7e8f9] Enqueued EntryNotifyJob (Job ID: 7b2e4f9a) to Sidekiq(mailers)\n' +
'I, [2026-09-14T14:09:50.300+09:00 #1434]  INFO -- : [1a2b3c4d-5e6f-4071-8293-a4b5c6d7e8f9] Completed 302 Found in 189ms (ActiveRecord: 39.8ms)\n';

/* 今朝のデプロイで追加されたクラス。currentには在るが、古いreleaseには無い */
files[APP + '/releases/20260914120000/app/mailers/applicant_mailer.rb'] =
'class ApplicantMailer < ApplicationMailer\n' +
'  def entry_received(entry)\n' +
'    @entry = entry\n' +
'    mail(to: @entry.email, subject: "ご応募を受け付けました")\n' +
'  end\n' +
'end\n';
files[APP + '/releases/20260914120000/app/jobs/entry_notify_job.rb'] =
'class EntryNotifyJob < ApplicationJob\n' +
'  queue_as :mailers\n' +
'\n' +
'  def perform(entry_id)\n' +
'    entry = Entry.find(entry_id)\n' +
'    ApplicantMailer.entry_received(entry).deliver_now\n' +
'  end\n' +
'end\n';
files[APP + '/releases/20260913150000/app/jobs/entry_notify_job.rb'] =
'class EntryNotifyJob < ApplicationJob\n' +
'  queue_as :mailers\n' +
'\n' +
'  def perform(entry_id)\n' +
'    entry = Entry.find(entry_id)\n' +
'    ApplicantMailer.entry_received(entry).deliver_now\n' +
'  end\n' +
'end\n';
files[APP + '/releases/20260914120000/REVISION'] = 'e3f1c2a9b7d4e5f60718293a4b5c6d7e8f901234\n';
files[APP + '/releases/20260913150000/REVISION'] = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678\n';

window.LFR.scenarios.add({
  id: 'case07',
  level: 2,
  title: 'Sidekiqがジョブを処理していない原因を探す',
  subtitle: 'プロセスは生きている。では何を実行しているのか',

  description:
'「応募しても、応募完了メールが届かない」という問い合わせが続いています。\n\n' +
'応募そのものは成功していて、管理画面にも応募データは入っています。\n' +
'メール送信は Sidekiq のジョブで非同期に行っています。\n\n' +
'今朝12:00にデプロイを1回しています。\n' +
'そのデプロイで、メール送信まわりのクラスを1つ追加しました。\n\n' +
'Sidekiqがジョブを処理できていない原因を調べてください。',

  learn: [
    { name: 'systemctl status', cmd: 'systemctl status sidekiq',
      desc: 'Active: の後ろにある since に注目してください。\n' +
            '「いつから動いているか」は、デプロイとの前後関係を判断する材料になります。\n' +
            '他のサービスの since と見比べると、再起動漏れがすぐ分かります。' },
    { name: 'ps aux', cmd: 'ps aux | grep sidekiq',
      desc: 'STARTの列に起動日が出ます。今日のデプロイより前の日付なら、\n' +
            'そのプロセスはデプロイ前から動き続けているということです。' },
    { name: 'tail / grep', cmd: 'tail -n 40 log/sidekiq.log',
      desc: 'Sidekiqは自分専用のログを持っています。\n' +
            'ジョブごとに start / done / fail が記録されるので、\n' +
            '「受け取っているのか」「受け取って失敗しているのか」が区別できます。' },
    { name: 'backtraceを読む', cmd: 'grep -n "in \\`perform\'" log/sidekiq.log | tail -n 5',
      desc: '例外のbacktraceには、実行されたファイルの絶対パスが出ます。\n' +
            'Capistrano構成では、このパスに release のタイムスタンプが含まれます。\n' +
            '「どのreleaseのコードが動いているか」が、ここから分かります。' },
    { name: 'ls -la releases', cmd: 'ls -la releases',
      desc: 'サーバーに存在するreleaseの一覧です。\n' +
            'readlink current と見比べると、どれが現行でどれが過去かが分かります。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '14:35:02',

  /* Pumaは今朝再起動された。Sidekiqは昨日から動きっぱなし */
  services: {
    sidekiq: {
      description: 'Sidekiq background worker for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Sun 2026-09-13 15:04:12 JST', ago: '23h 30min ago',
      mainPid: 1502, tasks: 14, memory: '254.1M',
      exec: '/home/deploy/.rbenv/shims/bundle exec sidekiq -e production'
    },
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Mon 2026-09-14 12:00:31 JST', ago: '2h 34min ago',
      mainPid: 1421, tasks: 12, memory: '336.1M',
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb'
    }
  },

  journal: {
    sidekiq: [
      'Sep 13 15:04:12 production systemd[1]: Started Sidekiq background worker for myapp (production).',
      'Sep 13 15:04:14 production sidekiq[1502]: Booting Sidekiq 7.2.0',
      'Sep 13 15:04:14 production sidekiq[1502]: Starting processing, hit Ctrl-C to stop',
      'Sep 14 12:04:18 production sidekiq[1502]: ERROR: NameError: uninitialized constant EntryNotifyJob::ApplicantMailer',
      'Sep 14 13:21:44 production sidekiq[1502]: ERROR: NameError: uninitialized constant EntryNotifyJob::ApplicantMailer',
      'Sep 14 14:30:09 production sidekiq[1502]: ERROR: NameError: uninitialized constant EntryNotifyJob::ApplicantMailer'
    ],
    puma: [
      'Sep 14 12:00:29 production systemd[1]: Stopping Puma HTTP Server for myapp (production)...',
      'Sep 14 12:00:30 production systemd[1]: Starting Puma HTTP Server for myapp (production)...',
      'Sep 14 12:00:33 production systemd[1]: Started Puma HTTP Server for myapp (production).'
    ]
  },

  processes: base.processes.map(function (p) {
    if (!/sidekiq/.test(p.command)) return p;
    var q = {}; Object.keys(p).forEach(function (k) { q[k] = p[k]; });
    q.start = 'Sep13'; q.time = '4:52'; q.mem = 6.4; q.rss = 260204;
    q.command = 'sidekiq 7.2.0 myapp [0 of 10 busy]';
    return q;
  }),

  hints: [
    'Sidekiqのプロセス自体は動いています。まずはそれを確認してください。\n' +
    '動いているのに結果が出ない場合、「受け取っていない」のか\n' +
    '「受け取って失敗している」のかを区別する必要があります。',

    'Sidekiqは専用のログを持っています。log/sidekiq.log を読んでください。\n' +
    'ジョブは受け取れていて、そのうえで例外になっていることが分かります。\n' +
    'その例外のbacktraceに出ているファイルパスをよく見てください。',

    'backtraceのパスと、readlink current の結果を見比べてください。\n' +
    'さらに systemctl status sidekiq と systemctl status puma の\n' +
    'Active: … since を比べると、片方だけ再起動されていないことが分かります。'
  ],

  probes: [
    { key: 'sidekiqAlive', label: 'Sidekiqのプロセスが動いていることを確認した',
      test: function (c, res) { return /sidekiq/i.test(c) && /sidekiq 7\.2\.0|active \(running\)/.test(res.stdout); } },
    { key: 'sawNameError', label: 'sidekiq.logでNameErrorを見つけた',
      test: function (c, res) { return /uninitialized constant/.test(res.stdout); } },
    { key: 'sawOldReleasePath', label: 'backtraceが古いreleaseを指しているのを見た',
      test: function (c, res) { return /releases\/20260913150000/.test(res.stdout); } },
    { key: 'comparedSince', label: 'Pumaとsince（起動時刻）を比較した',
      test: function (c, res, rt) {
        var all = rt.investigation.commands.join(' ');
        return /status\s+sidekiq/.test(all) && (/status\s+puma/.test(all) || /ps\b/.test(all));
      } },
    { key: 'sawCurrentRelease', label: 'currentが指す現行releaseを確認した',
      test: function (c, res) { return /20260914120000/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'sidekiqAlive',       weight: 8,  label: 'Sidekiqが動いていることを確認した' },
    { key: 'sawNameError',       weight: 14, label: 'sidekiq.logの例外を読んだ' },
    { key: 'sawOldReleasePath',  weight: 18, label: 'backtraceのパスから古いreleaseだと気づいた' },
    { key: 'sawCurrentRelease',  weight: 10, label: 'currentが指す現行releaseと比較した' },
    { key: 'comparedSince',      weight: 10, label: 'Pumaとの起動時刻の差に気づいた' }
  ],

  question: {
    text: 'Sidekiqがジョブを処理できていない原因として最も可能性が高いものは？',
    choices: [
      'Redisが停止していて、Sidekiqがジョブを取り出せていない',
      'Sidekiqのプロセスが停止している',
      'デプロイ後にSidekiqが再起動されておらず、古いreleaseのコードで動き続けている',
      'sidekiq.yml のqueue設定が間違っていて、mailersキューを見ていない'
    ],
    answer: 2,
    explain:
'まず、ジョブは届いています。production.log にこう出ています。\n\n' +
'  Enqueued EntryNotifyJob (Job ID: 3f9a1c8d) to Sidekiq(mailers)\n\n' +
'そして sidekiq.log を見ると、Sidekiqはそのジョブを受け取って実行し、失敗しています。\n\n' +
'  class=EntryNotifyJob INFO: start\n' +
'  ERROR: NameError: uninitialized constant EntryNotifyJob::ApplicantMailer\n' +
'  ERROR: /var/www/myapp/releases/20260913150000/app/jobs/entry_notify_job.rb:9:in `perform\'\n' +
'  INFO: fail: retrying in 15s\n\n' +
'決め手はbacktraceのパスです。releases/**20260913150000**、つまり昨日のreleaseです。\n' +
'readlink current は releases/20260914120000 を返すので、現行releaseとは別物です。\n\n' +
'起動時刻も一致しています。\n\n' +
'  systemctl status puma     → Active: active (running) since Mon 2026-09-14 12:00:31\n' +
'  systemctl status sidekiq  → Active: active (running) since Sun 2026-09-13 15:04:12\n' +
'  ps aux | grep sidekiq     → START が Sep13\n\n' +
'今朝のデプロイでPumaは再起動されましたが、Sidekiqは昨日から動きっぱなしです。\n' +
'古いreleaseのコードをメモリに載せたままなので、今朝追加した ApplicantMailer を知りません。\n\n' +
'Capistrano構成では、currentのsymlinkを張り替えても\n' +
'すでに起動しているプロセスは古いreleaseを掴み続けます。\n' +
'アプリを入れ替えたら、それを動かしているプロセスも必ず入れ替える必要があります。\n' +
'（対応は systemctl restart sidekiq ですが、まずは証拠を揃えてから判断します）',
    wrong: [
'Redisが停止していれば、SidekiqはRedisへ接続できず\n' +
'Redis::CannotConnectError を出して、そもそもジョブを取り出せません。\n\n' +
'しかし sidekiq.log には class=EntryNotifyJob … INFO: start が記録されています。\n' +
'ジョブは取り出せていて、実行中に別の例外で落ちています。\n' +
'systemctl status redis も active (running) です。',
'Sidekiqは動いています。\n' +
'systemctl status sidekiq は active (running)、ps aux | grep sidekiq にもプロセスがあります。\n' +
'停止しているなら sidekiq.log に新しい行は増えません。\n' +
'実際には数分おきに新しいエラーが書き込まれ続けています。',
null,
'queueの設定が原因なら、ジョブは「取り出されない」ので\n' +
'sidekiq.log に class=EntryNotifyJob の行そのものが出てきません。\n\n' +
'実際には start → ERROR → fail まで記録されています。つまり取り出せています。\n' +
'cat config/sidekiq.yml を見ても :queues に mailers は含まれています。'
    ]
  },

  route: {
    steps: [
      'ジョブが積まれているかをRails側で確認する（Enqueued の行）',
      'Sidekiqが生きているかを確認する（systemctl / ps）',
      'Sidekiq自身のログを読む（受け取っている？失敗している？）',
      'backtraceのファイルパスに注目する',
      'readlink current と見比べて、releaseが違うことに気づく',
      'Pumaとsinceを比べて、再起動漏れを確定する'
    ],
    commands: [
      'cd /var/www/myapp/current',
      'grep -n "Enqueued" log/production.log',
      'systemctl status sidekiq',
      'systemctl status puma',
      'ps aux | grep sidekiq',
      'tail -n 30 log/sidekiq.log',
      'grep -n "uninitialized constant" log/sidekiq.log | tail -n 3',
      'grep -o "releases/[0-9]*" log/sidekiq.log | sort | uniq -c',
      'readlink /var/www/myapp/current',
      'ls -la /var/www/myapp/releases'
    ],
    note:
'ps aux の START列が前日になっていることに先に気づくルートでも、\n' +
'sidekiq.log のbacktraceから入るルートでも構いません。\n' +
'「動いている＝正しいコードを動かしている」ではない、と気づけたことが本質です。'
  }
});
})();
