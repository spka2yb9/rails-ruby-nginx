/* CASE 47 — 夜間の Salesforce 連携のバッチが失敗した（AWS Batch とメモリ）
   EventBridge のスケジュールで毎晩動く AWS Batch のジョブ（Fargate）が、メモリの上限（2048 MiB）を超えて止められた。
   取引先を全件メモリに読んでから書き込む作りで、前日に取引先が5万件増えたため、上限を超えた。
   describe-jobs の container.reason と exitCode（137）、ログが途中で切れていることから突き止め、メモリを増やして流し直す */
(function () {
'use strict';
var ME = '/Users/i-wada';
var SRC = ME + '/src/myapp';
var MIN = 60000, DAY = 86400000;
var IMAGE = '123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/myapp/rails:9f8e7d6';

/* 毎晩 2:00（日本時間）。直近の 2:00 */
function lastRun(now) { var d = Math.floor((now + 9 * 3600000) / DAY) * DAY - 9 * 3600000 + 2 * 3600000; return d > now ? d - DAY : d; }
function jstDay(t) { var d = new Date(t + 9 * 3600000); return (d.getUTCMonth() + 1) + '月' + d.getUTCDate() + '日'; }

var runAt = 0;
var BEFORE = [404100, 409800, 415200, 421700, 426300, 431200];   /* 6晩前から前の晩まで、読んだ取引先の数 */
var LAST = 482300;                                                /* 前の日に5万件ほど増えた */

function progress(total, stopAt) {
  var lines = [];
  for (var n = 50000; n <= total && (!stopAt || n <= stopAt); n += 50000) lines.push('[SalesforceSync] read ' + n + ' accounts');
  return lines;
}

var files = {};
files[ME + '/.aws/config'] = '[default]\nregion = ap-northeast-1\noutput = json\n';
files[ME + '/.aws/credentials'] = '[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[ME + '/notes/alert.md'] = function () {
  return '# #alerts に来た通知\n\n' +
    '- ' + jstDay(runAt) + ' 2:0x  AWS Batch: myapp-salesforce-sync が FAILED（キュー myapp-batch）\n\n' +
    '# 営業部からの連絡（' + jstDay(runAt - DAY) + '）\n\n' +
    '- 展示会で集めた名刺から、Salesforce に取引先を約5万件取り込んだ\n';
};

files[SRC + '/app/services/salesforce_sync.rb'] =
'# Salesforce の取引先（Account）を、企業（Company）に取り込む。毎晩 AWS Batch で動く\n' +
'#   bin/rails runner SalesforceSync.call\n' +
'class SalesforceSync\n' +
'  SOQL = "SELECT Id, Name, BillingPrefecture, Phone, LastModifiedDate FROM Account WHERE IsDeleted = false"\n\n' +
'  def self.call = new.call\n\n' +
'  def call\n' +
'    attributes = []\n' +
'    client.query_all(SOQL).each_with_index do |account, i|\n' +
'      attributes << to_attributes(account)\n' +
'      Rails.logger.info("[SalesforceSync] read #{i + 1} accounts") if ((i + 1) % 50_000).zero?\n' +
'    end\n\n' +
'    # 全件を読み終えてから、1000件ずつ書き込む\n' +
'    attributes.each_slice(1000) { |rows| Company.upsert_all(rows, unique_by: :salesforce_id) }\n' +
'    Rails.logger.info("[SalesforceSync] upserted #{attributes.size} accounts")\n' +
'  end\n\n' +
'  private\n\n' +
'  def client = Restforce.new\n\n' +
'  def to_attributes(account)\n' +
'    { salesforce_id: account.Id, name: account.Name, prefecture: account.BillingPrefecture,\n' +
'      phone: account.Phone, salesforce_updated_at: account.LastModifiedDate }\n' +
'  end\n' +
'end\n';

window.LFR.scenarios.add({
  id: 'case47',
  level: 16,
  title: '夜間の Salesforce 連携のバッチが失敗した',
  subtitle: 'AWS Batch のジョブの記録とログから、止められた理由を突き止めて流し直す',

  description:
'Slack に、夜間のバッチが失敗したという通知が来ています（~/notes/alert.md）。\n' +
'Salesforce の取引先を自社の DB に取り込むジョブで、EventBridge のスケジュールで毎晩 2:00 に AWS Batch（Fargate）で動きます。\n' +
'これまでは毎晩成功していました。\n\n' +
'手元の PC から AWS CLI で、ジョブがなぜ止まったのかを突き止め、今日の分を流し直してください。\n' +
'アプリのソースは ~/src/myapp にあります。',

  learn: [
    { name: '失敗したジョブを探す', cmd: 'aws batch list-jobs --job-queue myapp-batch --job-status FAILED',
      desc: 'list-jobs は既定では RUNNING のジョブだけを返します。--job-status で状態を指定します。' },
    { name: 'ジョブの記録', cmd: "aws batch describe-jobs --jobs <ジョブ ID> --query 'jobs[0].{status:status,reason:statusReason,exit:container.exitCode,container:container.reason,resources:container.resourceRequirements,log:container.logStreamName}'",
      desc: 'statusReason はジョブの、container.reason はコンテナの止まった理由です。\n' +
            'exitCode は終了コードです。137 は SIGKILL（9）で止められたことを表します（128 + 9）。\n' +
            'Fargate のジョブは resourceRequirements の MEMORY（MiB）を超えて使うと止められます。' },
    { name: 'ジョブのログ', cmd: 'aws logs tail /aws/batch/job --since 1d --log-stream-names <logStreamName>',
      desc: 'Batch のジョブのログは既定では CloudWatch Logs の /aws/batch/job に、ジョブごとのストリームで残ります。' },
    { name: '設定を変えて流し直す', cmd: "aws batch submit-job --job-name salesforce-sync-rerun --job-queue myapp-batch --job-definition myapp-salesforce-sync --container-overrides '{\"resourceRequirements\":[{\"type\":\"MEMORY\",\"value\":\"4096\"},{\"type\":\"VCPU\",\"value\":\"1\"}]}'",
      desc: '--container-overrides の resourceRequirements で、このジョブだけメモリを変えられます。\n' +
            'Fargate では、vCPU とメモリの組み合わせが決まっています（1 vCPU なら 2〜8 GB）。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  awsEnv: function (sim) {
    var now = Date.now();
    runAt = lastRun(now);
    var env = sim.railsOnEc2({ maxAcu: 16 });
    sim.logGroup(env, '/aws/batch/job');
    var done = function (n) { return ['[SalesforceSync] upserted ' + n + ' accounts']; };
    sim.batchSetup(env, {
      queue: 'myapp-batch', definition: 'myapp-salesforce-sync', image: IMAGE, command: ['bin/rails', 'runner', 'SalesforceSync.call'], memory: 2048,
      /* 2048 MiB では足りず、3000 MiB ほど使う */
      behavior: { needsMiB: 3000, progress: progress(LAST), done: done(LAST) },
      schedule: 'cron(0 17 * * ? *)', rule: 'myapp-salesforce-sync-nightly'
    });
    BEFORE.forEach(function (n, k) {
      var at = runAt - (BEFORE.length - k) * DAY + 40000;
      var lines = progress(n).concat(done(n));
      sim.pastJob(env, { queue: 'myapp-batch', definition: 'myapp-salesforce-sync', name: 'myapp-salesforce-sync', startedAt: at, stoppedAt: at + 19 * MIN + k * 20000, exitCode: 0,
        logs: lines.map(function (m, i) { return { at: at + (i + 1) * 2 * MIN, message: m }; }) });
    });
    /* 前の晩: 45万件を読んだところで止められた。最後の行のあとに何も出ていない */
    var at = runAt + 40000;
    sim.pastJob(env, { queue: 'myapp-batch', definition: 'myapp-salesforce-sync', name: 'myapp-salesforce-sync', startedAt: at, stoppedAt: at + 21 * MIN, exitCode: 137,
      reason: 'OutOfMemoryError: Container killed due to memory usage',
      logs: progress(LAST, 450000).map(function (m, i) { return { at: at + (i + 1) * 2 * MIN, message: m }; }) });
    return env;
  },

  hints: [
    '失敗したジョブを探して、その記録を見ます。\n\n' +
    '  aws batch list-jobs --job-queue myapp-batch --job-status FAILED\n\n' +
    'describe-jobs の statusReason（ジョブ）と container.reason（コンテナ）、container.exitCode を見てください。',

    'ジョブのログ（/aws/batch/job）を読み、前の晩までの成功したジョブのログと比べます。\n' +
    '成功したジョブは list-jobs --job-status SUCCEEDED で探せます。\n' +
    '読んだ件数と、最後の行のあとに何が出ていないかに注目してください。',

    'ソース（app/services/salesforce_sync.rb）は、全件をメモリに読んでから書き込みます。\n' +
    '今日の分は --container-overrides でメモリを増やして流し直します。終わるまで10秒ほどかかります。'
  ],

  probes: [
    { key: 'foundFailedJob', label: '失敗したジョブを見つけた',
      test: function (c, res) { return /list-jobs/.test(c) && /FAILED/.test(c) && /jobId/.test(res.stdout); } },
    { key: 'sawOom', label: 'コンテナがメモリ不足で止められた（137）ことを確かめた',
      test: function (c, res) { return /describe-jobs/.test(c) && /OutOfMemoryError/.test(res.stdout) && /137/.test(res.stdout); } },
    { key: 'sawMemoryLimit', label: 'ジョブのメモリの上限が 2048 MiB だと確かめた',
      test: function (c, res) { return /(describe-jobs|describe-job-definitions)/.test(c) && /2048/.test(res.stdout); } },
    { key: 'readJobLog', label: 'ログが 45万件を読んだところで途切れていることを見つけた',
      test: function (c, res) { return /aws\s+logs/.test(c) && /read 450000 accounts/.test(res.stdout) && !/upserted 482300/.test(res.stdout); } },
    { key: 'readCode', label: '全件をメモリに読んでから書き込む作りだと確かめた',
      test: function (c, res) { return /salesforce_sync/.test(c) && /attributes << to_attributes/.test(res.stdout); } },
    { key: 'rerunSucceeded', label: 'メモリを増やして流し直し、成功したことを確かめた',
      test: function (c, res) { return /describe-jobs/.test(c) && /SUCCEEDED/.test(res.stdout) && /4096/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'foundFailedJob', weight: 8,  label: '失敗したジョブを見つけた' },
    { key: 'sawOom',         weight: 16, label: 'メモリ不足で止められたことを確かめた' },
    { key: 'sawMemoryLimit', weight: 8,  label: 'メモリの上限を確かめた' },
    { key: 'readJobLog',     weight: 12, label: 'ログが途中で途切れていることを見つけた' },
    { key: 'readCode',       weight: 8,  label: 'メモリを使う作りを確かめた' },
    { key: 'rerunSucceeded', weight: 12, label: 'メモリを増やして流し直し、成功を確かめた' }
  ],

  question: {
    text: 'ジョブが失敗した理由は？',
    choices: [
      'Salesforce の API の呼び出し回数の上限に達し、取引先を読めなくなった',
      '取引先を全件メモリに読む作りで、前日に5万件増えたため、ジョブのメモリの上限（2048 MiB）を超えて止められた',
      'EventBridge のスケジュールが止まっていて、ジョブが起動しなかった',
      'DB への書き込みでロック待ちが続き、ジョブが時間切れになった'
    ],
    answer: 1,
    explain:
'失敗したジョブの記録はこうです。\n\n' +
'  statusReason:     Essential container in task exited\n' +
'  container.reason: OutOfMemoryError: Container killed due to memory usage\n' +
'  exitCode:         137\n' +
'  MEMORY:           2048\n\n' +
'コンテナがメモリの上限（2048 MiB）を超えて使い、SIGKILL（137）で止められました。\n' +
'ログは「read 450000 accounts」で途切れていて、エラーの行もありません。\n' +
'SIGKILL ではアプリが何も書けないまま止まるので、例外のログが残りません。\n\n' +
'ソースは取引先を1件ずつ配列（attributes）に足し、全件を読み終えてから書き込みます。\n' +
'使うメモリは取引先の数に比例して増えます。\n' +
'前の晩までは 43万件ほどで上限の内側に収まっていましたが、営業部が5万件取り込んだため、上限を超えました。\n\n' +
'今日の分は --container-overrides で MEMORY を 4096 にして流し直し、SUCCEEDED を確かめました。\n' +
'ただ、件数が増えればまた足りなくなります。\n' +
'読んだ分を1000件ずつその場で書き込む（全件を配列にためない）ように直せば、件数が増えても使うメモリは変わりません。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. Batch のジョブは statusReason・container.reason・exitCode の3つで止まった理由を見る\n' +
'2. 137 は SIGKILL。メモリの上限を超えると、アプリはログを残せずに止まる\n' +
'3. ログが「途中で切れている」こと自体が手がかりになる。成功した日のログと比べる\n' +
'4. データの件数に比例してメモリを使う作りは、いつか上限を超える。少しずつ読んで書く',
    wrong: [
'API の上限なら、Salesforce がエラー（REQUEST_LIMIT_EXCEEDED など）を返し、アプリがそれをログに書いて終わります。\n' +
'今回はエラーの行が無く、コンテナが OutOfMemoryError で止められています。',
null,
'ジョブは 2:00 に起動していて、45万件まで読んでいます。スケジュールは動いています。',
'ロック待ちなら、書き込みの段階で Lock wait timeout exceeded のような例外がログに残ります。\n' +
'ログは読み込みの途中で途切れていて、書き込みには入っていません。'
    ]
  },

  route: {
    steps: [
      '通知と営業部の連絡で、いつ何があったかを確かめる',
      '失敗したジョブを探し、止まった理由・終了コード・メモリの上限を確かめる',
      'ジョブのログを読み、成功した日のログと比べる',
      'ソースで、全件をメモリに読む作りだと確かめる',
      'メモリを増やして流し直し、成功したことを確かめる'
    ],
    commands: [
      'cat ~/notes/alert.md',
      'aws batch list-jobs --job-queue myapp-batch --job-status FAILED',
      "JOB=$(aws batch list-jobs --job-queue myapp-batch --job-status FAILED --query 'jobSummaryList[0].jobId' --output text)",
      "aws batch describe-jobs --jobs $JOB --query 'jobs[0].{status:status,reason:statusReason,exit:container.exitCode,container:container.reason,resources:container.resourceRequirements}'",
      "STREAM=$(aws batch describe-jobs --jobs $JOB --query 'jobs[0].container.logStreamName' --output text)",
      'aws logs tail /aws/batch/job --since 1d --log-stream-names $STREAM --format short',
      "OK=$(aws batch list-jobs --job-queue myapp-batch --job-status SUCCEEDED --query 'jobSummaryList[0].jobId' --output text)",
      "aws logs tail /aws/batch/job --since 7d --log-stream-names $(aws batch describe-jobs --jobs $OK --query 'jobs[0].container.logStreamName' --output text) --format short | tail -n 3",
      'cat ~/src/myapp/app/services/salesforce_sync.rb',
      "RERUN=$(aws batch submit-job --job-name salesforce-sync-rerun --job-queue myapp-batch --job-definition myapp-salesforce-sync --container-overrides '{\"resourceRequirements\":[{\"type\":\"MEMORY\",\"value\":\"4096\"},{\"type\":\"VCPU\",\"value\":\"1\"}]}' --query jobId --output text)",
      'sleep 10',
      "aws batch describe-jobs --jobs $RERUN --query 'jobs[0].{status:status,exit:container.exitCode,resources:container.resourceRequirements}'"
    ],
    note:
'流し直す前に、同じジョブを2回流しても困らないか（今回は upsert なので同じ結果になる）を確かめてください。\n' +
'メモリを増やすのは今日をしのぐための手当てで、作りを直すまでの間だけにします。'
  }
});
})();
