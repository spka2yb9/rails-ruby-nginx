/* CASE 39 — デプロイのあと、処理中だったジョブが消えた（Sidekiq の timeout が ECS の stopTimeout より長い）
   Sidekiq は SIGTERM を受けると新しいジョブを取らなくなり、timeout まで処理中のジョブを待つ。
   間に合わなければ「Terminating N busy threads」を出し、処理中のジョブを Redis に戻してから終わる（lib/sidekiq/manager.rb）。
   ECS は SIGTERM のあと stopTimeout（既定30秒）で SIGKILL を送るので、timeout がそれより長いと戻す前に止められる */
(function () {
'use strict';
var ME = '/Users/i-wada';
var SRC = ME + '/src/jinzai-rails';
var MIN = 60000;
var JOB_ID = '5c7e2a91-0d4f-4b6e-9a13-8f2d6c4b0e57';
var JID = 'a8f31c07d2e94b65';

var files = {};
files[ME + '/.aws/config'] = '[default]\nregion = ap-northeast-1\noutput = json\n';
files[ME + '/.aws/credentials'] = '[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[ME + '/support/inquiry.md'] =
'# サポートからの依頼\n\n' +
'株式会社オカダ製作所（company_id: 812）から「今月の請求書メールが届いていない」と連絡があった。\n' +
'ほかの企業には届いている。請求書の作成ジョブ（MonthlyInvoiceJob）は今日の昼すぎに積んだ。\n';

files[ME + '/notes/sidekiq-web.md'] =
'# Sidekiq の管理画面を見たメモ\n\n' +
'- Busy: 0 / Enqueued: 0 / Retries: 0 / Dead: 0\n' +
'- MonthlyInvoiceJob の 812 は、Retries にも Dead にも無い。失敗した記録が無い\n' +
'- 30分前に worker のデプロイ（e5f6a7b）があった\n';

files[SRC + '/config/sidekiq.yml'] =
':concurrency: <%= ENV.fetch("SIDEKIQ_CONCURRENCY", 10) %>\n' +
'# 3週間前に 25 から延ばした（請求書の PDF の作成が長く、途中で止めたくないため）\n' +
':timeout: 60\n' +
':queues:\n' +
'  - default\n' +
'  - mailers\n';

files[SRC + '/app/jobs/monthly_invoice_job.rb'] =
'class MonthlyInvoiceJob < ApplicationJob\n' +
'  queue_as :default\n\n' +
'  # 1社分の請求書の PDF を作ってメールで送る（大きい会社だと1分近くかかる）\n' +
'  def perform(company_id)\n' +
'    company = Company.find(company_id)\n' +
'    pdf = InvoicePdf.new(company, month: Date.current.prev_month).render\n' +
'    InvoiceMailer.with(company: company, pdf: pdf).monthly.deliver_now\n' +
'  end\n' +
'end\n';

/* Sidekiq の終わり方（文言は lib/sidekiq/cli.rb と lib/sidekiq/manager.rb）。after は SIGTERM からの秒数 */
var SHUTDOWN = {
  seconds: 60,
  logs: [
    { after: 0,   message: '{time} pid=1 tid=2ag INFO: Shutting down' },
    { after: 0.1, message: '{time} pid=1 tid=2ag INFO: Terminating quiet threads for default capsule' },
    { after: 0.6, message: '{time} pid=1 tid=2ag INFO: Pausing to allow jobs to finish...' },
    { after: 60,  message: '{time} pid=1 tid=2ag WARN: Terminating 1 busy threads' }
  ],
  done: ['{time} pid=1 tid=2ag INFO: Bye!']
};

function jobLogs(sim, env, deployAt) {
  var id = sim.serviceTaskIds(env, 'jinzai-prod-worker')[0];
  var iso = function (t) { return new Date(t).toISOString(); };
  var events = [];
  function sk(at, s) { events.push({ at: at, message: iso(at) + ' pid=1 ' + s }); }
  function aj(at, s) { events.push({ at: at, message: '[ActiveJob] ' + s }); }
  /* 少し前のジョブは普通に終わっている */
  [[-9 * MIN, 'ActionMailer::MailDeliveryJob', 'b21c', 0.71], [-6 * MIN, 'MonthlyInvoiceJob', 'c9d0', 41.82], [-3 * MIN, 'ActionMailer::MailDeliveryJob', 'd4e7', 0.64]].forEach(function (j) {
    var t = deployAt + j[0];
    sk(t, 'tid=3kq class=' + j[1] + ' jid=' + j[2] + 'e1f07a6b93c2 INFO: start');
    sk(t + j[3] * 1000, 'tid=3kq class=' + j[1] + ' jid=' + j[2] + 'e1f07a6b93c2 elapsed=' + j[3].toFixed(3) + ' INFO: done');
  });
  /* SIGTERM の40秒前に始まった 812 の請求書。done も fail も出ないまま止められる */
  var start = deployAt - 40000;
  sk(start, 'tid=4m1 class=MonthlyInvoiceJob jid=' + JID + ' INFO: start');
  aj(start + 3, '[MonthlyInvoiceJob] [' + JOB_ID + '] Performing MonthlyInvoiceJob (Job ID: ' + JOB_ID + ') from Sidekiq(default) enqueued at ' + iso(start - 1200).replace(/\.\d+Z$/, 'Z') + ' with arguments: 812');
  sim.putLogs(env, sim.WORKER_LOG, 'worker/worker/' + id, events);
}

window.LFR.scenarios.add({
  id: 'case39',
  level: 13,
  title: 'デプロイのあと、処理中だったジョブが消えた',
  subtitle: 'SIGTERM・stopTimeout・Sidekiq の timeout の順番から、ジョブが消えた理由を突き止める',

  description:
'サポートから連絡がありました（~/support/inquiry.md）。\n' +
'1社だけ、今月の請求書メールが届いていないそうです。\n\n' +
'Sidekiq の管理画面を見た同僚によると、そのジョブは失敗の記録（Retries・Dead）にも残っていません（~/notes/sidekiq-web.md）。\n' +
'30分前には worker のデプロイがありました。\n\n' +
'worker のログと、止まったタスクの記録から、ジョブがどこへ行ったのかを突き止めてください。\n' +
'アプリのソースは ~/src/jinzai-rails にあります。',

  learn: [
    { name: 'worker のログで、そのジョブを探す', cmd: 'aws logs tail /ecs/jinzai-prod-worker --since 1h --filter-pattern MonthlyInvoiceJob',
      desc: 'Sidekiq はジョブごとに start と、終わったときに done（成功）か fail（失敗）を書きます。\n' +
            'ActiveJob は「Performing ... with arguments: ...」で、引数（ここでは company_id）を書きます。' },
    { name: 'その時刻の前後をまとめて読む', cmd: 'aws logs tail /ecs/jinzai-prod-worker --since 1h --log-stream-names worker/worker/<タスクID> --format short',
      desc: '1つのタスク（ストリーム）のログを、時刻の順に読みます。\n' +
            'ジョブが始まったあと、そのタスクに何が起きたかを追います。' },
    { name: '止まった worker のタスク', cmd: "aws ecs describe-tasks --cluster jinzai-prod --tasks <タスクID> --query 'tasks[0].{stopCode:stopCode,reason:stoppedReason,stoppingAt:stoppingAt,stoppedAt:stoppedAt,exitCode:containers[0].exitCode}'",
      desc: 'stoppingAt は ECS がコンテナに SIGTERM を送った時刻、stoppedAt は止まった時刻です。\n' +
            '終了コード 137 は SIGKILL（9）で止められたことを表します（128 + 9）。' },
    { name: 'タスク定義の stopTimeout', cmd: "aws ecs describe-task-definition --task-definition jinzai-prod-worker --query 'taskDefinition.containerDefinitions[0].{command:command,stopTimeout:stopTimeout}'",
      desc: 'stopTimeout は SIGTERM を送ってから SIGKILL で強制的に止めるまでの秒数です。\n' +
            '書いていなければ 30 秒、最大は 120 秒です。' },
    { name: 'Sidekiq の設定を読む', cmd: 'cat ~/src/jinzai-rails/config/sidekiq.yml',
      desc: ':timeout: は、Sidekiq が終わる前に、処理中のジョブを待つ秒数です（既定は 25 秒）。\n' +
            '待っても終わらないジョブは、Redis に戻してから終わります。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  awsEnv: function (sim) {
    var env = sim.railsOnEcs({ worker: { shutdown: SHUTDOWN } });
    var deployAt = Date.now() - 30 * MIN;
    jobLogs(sim, env, deployAt);
    sim.deploy(env, 'worker', { tag: 'e5f6a7b', behavior: { shutdown: SHUTDOWN } }, deployAt);
    sim.advanceTo(env, deployAt);
    return env;
  },

  hints: [
    'まず worker のログで、812 の MonthlyInvoiceJob を探してください。\n\n' +
    '  aws logs tail /ecs/jinzai-prod-worker --since 1h --filter-pattern MonthlyInvoiceJob\n\n' +
    'start はあるのに、done も fail もありません。',

    'そのジョブを動かしていたタスクのログを、時刻の順に読みます。ストリームの名前は worker/worker/<タスクID> です。\n' +
    'ジョブが始まった40秒後に、Sidekiq が SIGTERM を受けて終わる準備を始めています。\n' +
    '最後の行のあとに何が出ていないかに注目してください。',

    '止まったタスクの終了コードは 137（SIGKILL）で、SIGTERM から30秒で止まっています。\n' +
    'タスク定義の stopTimeout と、config/sidekiq.yml の :timeout: を比べてください。'
  ],

  probes: [
    { key: 'foundJobStart', label: '812 の請求書ジョブが始まったことをログで見つけた',
      test: function (c, res) { return /aws\s+logs/.test(c) && /a8f31c07d2e94b65|arguments: 812/.test(res.stdout); } },
    { key: 'sawShutdownLogs', label: 'ジョブの途中で Sidekiq が終わる準備を始めたことを見つけた',
      test: function (c, res) { return /aws\s+logs/.test(c) && /Pausing to allow jobs to finish/.test(res.stdout); } },
    { key: 'sawExit137', label: '止まった worker の終了コード 137 と、SIGTERM から30秒で止まったことを確かめた',
      test: function (c, res) { return /describe-tasks/.test(c) && /137/.test(res.stdout); } },
    { key: 'checkedStopTimeout', label: 'worker のタスク定義に stopTimeout が無いことを確かめた',
      test: function (c, res) { return /describe-task-definition/.test(c) && /jinzai-prod-worker/.test(c) && /stopTimeout|sidekiq/.test(c + res.stdout); } },
    { key: 'readSidekiqYml', label: 'Sidekiq の timeout を確かめた',
      test: function (c, res) { return /sidekiq\.yml/.test(c) && /:timeout:\s*60/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'foundJobStart',      weight: 12, label: 'ジョブが始まったのに終わっていないことを見つけた' },
    { key: 'sawShutdownLogs',    weight: 14, label: 'その途中で Sidekiq が SIGTERM を受けたことを見つけた' },
    { key: 'sawExit137',         weight: 14, label: 'SIGKILL（137）で止められたことを確かめた' },
    { key: 'checkedStopTimeout', weight: 10, label: 'stopTimeout が既定の30秒だと確かめた' },
    { key: 'readSidekiqYml',     weight: 12, label: 'Sidekiq の timeout（60秒）と比べた' }
  ],

  question: {
    text: '812 の請求書のジョブが消えた理由は？',
    choices: [
      'ジョブの中で例外が起き、リトライの上限を超えて捨てられた',
      'Sidekiq の timeout（60秒）が ECS の stopTimeout（既定の30秒）より長く、Sidekiq が処理中のジョブを Redis に戻す前に SIGKILL で止められた',
      'Redis のメモリがいっぱいになり、ジョブが消された',
      '新しい worker のタスクが起動に失敗し、ジョブを取り出せなかった'
    ],
    answer: 1,
    explain:
'worker のログで 812 のジョブを探すと、始まった記録だけがあります。\n\n' +
'  ... class=MonthlyInvoiceJob jid=a8f31c07d2e94b65 INFO: start\n' +
'  [ActiveJob] [MonthlyInvoiceJob] [...] Performing MonthlyInvoiceJob ... with arguments: 812\n\n' +
'done も fail もありません。失敗したのなら fail が出て、Retries か Dead に残ります。\n' +
'同じタスクのログを時刻の順に読むと、ジョブが始まった40秒後にこう続きます。\n\n' +
'  INFO: Shutting down\n' +
'  INFO: Terminating quiet threads for default capsule\n' +
'  INFO: Pausing to allow jobs to finish...\n\n' +
'デプロイで ECS が SIGTERM を送り、Sidekiq は新しいジョブを取るのをやめて、処理中のジョブを待ち始めています。\n' +
'Sidekiq は timeout まで待っても終わらないジョブを「Terminating 1 busy threads」と書いて Redis に戻し、「Bye!」で終わります。\n' +
'その2行が出ていません。\n\n' +
'止まったタスクを見ると、終了コードは 137（SIGKILL）で、stoppingAt（SIGTERM）から30秒で止まっています。\n' +
'worker のタスク定義には stopTimeout が無いので、既定の30秒です。\n' +
'一方 config/sidekiq.yml の :timeout: は 60 です。Sidekiq が60秒待ってジョブを Redis に戻すより先に、\n' +
'ECS が30秒で SIGKILL を送ったため、戻す処理が走らないまま止まりました。\n' +
'Sidekiq はジョブを取り出した時点で Redis のキューから消すので、ジョブはどこにも残りませんでした。\n\n' +
'直し方は Sidekiq の timeout を stopTimeout より短くすることです。\n' +
'既定の 25 秒に戻すか、stopTimeout を延ばす（Fargate では最大120秒）なら、timeout はそれより短くします。\n' +
'timeout を過ぎたジョブは Redis に戻り、新しい worker でもう一度最初から実行されます。\n' +
'途中まで進んでいても最初からやり直すので、2回実行されても困らない作りにしておきます\n' +
'（今回なら、同じ月の請求書を2回送らない）。\n' +
'812 の請求書はジョブをもう一度積んで送り直します。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. ECS はタスクを止めるとき、SIGTERM を送り、stopTimeout（既定30秒）のあとに SIGKILL を送る\n' +
'2. 終了コード 137 は SIGKILL。stoppingAt と stoppedAt の差で、何秒待たれたかが分かる\n' +
'3. Sidekiq の timeout は stopTimeout より短くする。長いと処理中のジョブが Redis に戻らない\n' +
'4. ジョブは途中で止まってやり直されても困らないように作る',
    wrong: [
'例外でリトライの上限を超えたジョブは、Dead に移ります。\n' +
'管理画面では Retries も Dead も 0 で、ログにも fail がありません。\n' +
'ジョブは失敗したのではなく終わらないまま止められています。',
null,
'Redis のメモリが溢れたなら、ほかのジョブやキューにも影響が出るはずです。\n' +
'ログでは、812 のジョブを動かしていたタスクが SIGTERM を受け、30秒後に SIGKILL で止まっています。\n' +
'ジョブが消えたのは、その止め方のためです。',
'新しい worker のタスクは起動していて、デプロイは終わっています。\n' +
'812 のジョブは新しいタスクに渡る前、古いタスクの中で処理されている途中でした。'
    ]
  },

  route: {
    steps: [
      'サポートの依頼と管理画面のメモで、ジョブが失敗の記録にも無いことを確かめる',
      'worker のログで 812 のジョブを探す（start だけがある）',
      'そのタスクのログを時刻の順に読む（SIGTERM を受けて待ち始め、そのあとが無い）',
      '止まったタスクの終了コード（137）と、SIGTERM から止まるまでの時間（30秒）を確かめる',
      'タスク定義の stopTimeout と、sidekiq.yml の :timeout: を比べる'
    ],
    commands: [
      'cat ~/support/inquiry.md',
      'cat ~/notes/sidekiq-web.md',
      'aws logs tail /ecs/jinzai-prod-worker --since 1h --filter-pattern MonthlyInvoiceJob',
      "ID=$(aws ecs list-tasks --cluster jinzai-prod --service-name jinzai-prod-worker --desired-status STOPPED --query 'taskArns[0]' --output text | cut -d/ -f3)",
      'aws logs tail /ecs/jinzai-prod-worker --since 1h --log-stream-names worker/worker/$ID --format short',
      "aws ecs describe-tasks --cluster jinzai-prod --tasks $ID --query 'tasks[0].{stopCode:stopCode,reason:stoppedReason,stoppingAt:stoppingAt,stoppedAt:stoppedAt,exitCode:containers[0].exitCode}'",
      "aws ecs describe-task-definition --task-definition jinzai-prod-worker --query 'taskDefinition.containerDefinitions[0].{command:command,stopTimeout:stopTimeout}'",
      'cat ~/src/jinzai-rails/config/sidekiq.yml'
    ],
    note:
'EC2 のときも、systemd が sidekiq を止めるときに同じことが起きます（TimeoutStopSec のあとに SIGKILL）。\n' +
'「止める側がどれだけ待つか」と「止められる側がどれだけ待ってほしいか」を、いつも組み合わせて決めてください。'
  }
});
})();
