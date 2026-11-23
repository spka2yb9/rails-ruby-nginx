/* CASE 00B — 監視の通知からサーバーへ降りる（Honeybadger → production.log） */
(function () {
'use strict';
var APP = '/var/www/myapp';
var RID = '9f3c1a2e-7b48-4d05-a1c6-2e8f0b3d5a71';

function buildLog() {
  var L = [];
  var ok = [
    ['GET',  '/projects',        'ProjectsController#index', 200, 112],
    ['GET',  '/projects/8821',   'ProjectsController#show',  200, 74],
    ['GET',  '/',                'TopController#index',      200, 41],
    ['GET',  '/company/projects','Company::ProjectsController#index', 200, 96]
  ];
  /* 13:40〜14:02 は平常 */
  for (var i = 0; i < 40; i++) {
    var mm = String(40 + Math.floor(i / 2)).padStart(2, '0');
    if (Number(mm) > 59) mm = '59';
    var ss = String((i * 11) % 60).padStart(2, '0');
    var p = ok[i % ok.length];
    var t = '2026-09-14T13:' + mm + ':' + ss + '.' + String(100 + i * 17).slice(0, 3) + '+09:00';
    var rid = 'a' + (i * 7919).toString(16).padStart(7, '0') + '-1c2d-4e3f-8a5b-6c7d8e9f0a1b';
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Started ' + p[0] + ' "' + p[1] + '" for 10.0.2.' + (10 + i % 40) + ' at 2026-09-14 13:' + mm + ':' + ss + ' +0900');
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Processing by ' + p[2] + ' as HTML');
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Completed ' + p[3] + ' OK in ' + p[4] + 'ms (Views: ' + Math.round(p[4] * 0.6) + '.1ms | ActiveRecord: ' + Math.round(p[4] * 0.2) + '.2ms)');
  }

  /* 14:03 以降、応募POSTだけがロック待ちで落ちる。GETは通り続ける */
  function entryFailure(mm, ss, rid, ms) {
    var t = '2026-09-14T14:' + mm + ':' + ss + '.208+09:00';
    L.push('I, [' + t + ' #1434]  INFO -- : [' + rid + '] Started POST "/entries" for 10.0.2.' + (20 + Number(ss) % 30) + ' at 2026-09-14 14:' + mm + ':' + ss + ' +0900');
    L.push('I, [' + t + ' #1434]  INFO -- : [' + rid + '] Processing by EntriesController#create as HTML');
    L.push('I, [' + t + ' #1434]  INFO -- : [' + rid + '] Parameters: {"entry"=>{"project_id"=>"8821", "message"=>"[FILTERED]"}}');
    L.push('E, [' + t + ' #1434] ERROR -- : [' + rid + '] ActiveRecord::StatementInvalid (Mysql2::Error: Lock wait timeout exceeded; try restarting transaction):');
    L.push('E, [' + t + ' #1434] ERROR -- : [' + rid + '] app/models/entry.rb:41:in `block in create_with_counters!\'');
    L.push('E, [' + t + ' #1434] ERROR -- : [' + rid + '] app/controllers/entries_controller.rb:18:in `create\'');
    L.push('I, [' + t + ' #1434]  INFO -- : [' + rid + '] Completed 500 Internal Server Error in ' + ms + 'ms (ActiveRecord: ' + (ms - 40) + '.1ms)');
  }

  var fails = [
    ['03', '12', 'b1c2d3e4-5f60-4718-92a3-b4c5d6e7f809', 50218],
    ['05', '41', 'c2d3e4f5-6071-4829-a3b4-c5d6e7f8091a', 50204],
    ['08', '02', RID,                                    50211],
    ['11', '37', 'd3e4f506-1728-493a-b4c5-d6e7f8091a2b', 50199],
    ['14', '55', 'e4f50617-2839-4a4b-c5d6-e7f8091a2b3c', 50223]
  ];
  var gets = [
    ['04', '20', 'GET', '/projects', 'ProjectsController#index', 118],
    ['07', '11', 'GET', '/', 'TopController#index', 44],
    ['10', '33', 'GET', '/projects/7710', 'ProjectsController#show', 71],
    ['13', '02', 'GET', '/projects', 'ProjectsController#index', 121]
  ];
  var all = fails.map(function (f) { return { mm: f[0], ss: f[1], f: f }; })
    .concat(gets.map(function (g) { return { mm: g[0], ss: g[1], g: g }; }))
    .sort(function (x, y) { return (x.mm + x.ss) < (y.mm + y.ss) ? -1 : 1; });

  all.forEach(function (e, idx) {
    if (e.f) { entryFailure(e.f[0], e.f[1], e.f[2], e.f[3]); return; }
    var g = e.g;
    var t = '2026-09-14T14:' + g[0] + ':' + g[1] + '.104+09:00';
    var rid = 'f' + (idx * 104729).toString(16).padStart(7, '0') + '-2d3e-4f50-9617-28394a5b6c7d';
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Started ' + g[2] + ' "' + g[3] + '" for 10.0.2.' + (10 + idx) + ' at 2026-09-14 14:' + g[0] + ':' + g[1] + ' +0900');
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Processing by ' + g[4] + ' as HTML');
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Completed 200 OK in ' + g[5] + 'ms (Views: 70.1ms | ActiveRecord: 14.2ms)');
  });
  return L.join('\n') + '\n';
}

var files = {};
files[APP + '/shared/log/production.log'] = buildLog();

files[APP + '/shared/log/sidekiq.log'] =
'2026-09-14T12:00:43.110Z pid=1502 tid=3f8 INFO: Starting processing, hit Ctrl-C to stop\n' +
'2026-09-14T13:15:02.441Z pid=1502 tid=a12 class=EntryNotifyJob jid=7c1f2a9e40db INFO: start\n' +
'2026-09-14T13:15:03.002Z pid=1502 tid=a12 class=EntryNotifyJob jid=7c1f2a9e40db elapsed=0.561 INFO: done\n' +
'2026-09-14T14:02:41.118Z pid=1502 tid=b04 class=CompanyBulkImportJob jid=3f9a1c8d2e07 INFO: start\n' +
'2026-09-14T14:02:41.220Z pid=1502 tid=b04 class=CompanyBulkImportJob jid=3f9a1c8d2e07 INFO: importing companies/2026-09-14_projects.csv (18,402 rows)\n' +
'2026-09-14T14:02:41.224Z pid=1502 tid=b04 class=CompanyBulkImportJob jid=3f9a1c8d2e07 INFO: opening transaction (single transaction for all rows)\n' +
'2026-09-14T14:06:12.880Z pid=1502 tid=b04 class=CompanyBulkImportJob jid=3f9a1c8d2e07 INFO: 6,200 / 18,402 rows\n' +
'2026-09-14T14:11:44.031Z pid=1502 tid=b04 class=CompanyBulkImportJob jid=3f9a1c8d2e07 INFO: 12,900 / 18,402 rows\n' +
'2026-09-14T14:16:02.517Z pid=1502 tid=b04 class=CompanyBulkImportJob jid=3f9a1c8d2e07 INFO: 15,100 / 18,402 rows\n';

files[APP + '/releases/20260914120000/app/jobs/company_bulk_import_job.rb'] =
'class CompanyBulkImportJob < ApplicationJob\n' +
'  queue_as :default\n' +
'\n' +
'  def perform(csv_path)\n' +
'    rows = CSV.read(csv_path, headers: true)\n' +
'    # 全行を1つのトランザクションで囲っている\n' +
'    Project.transaction do\n' +
'      rows.each_with_index do |row, i|\n' +
'        upsert_project!(row)\n' +
'        Rails.logger.info("#{i} / #{rows.size} rows") if (i % 100).zero?\n' +
'      end\n' +
'    end\n' +
'  end\n' +
'end\n';

files[APP + '/releases/20260914120000/app/models/entry.rb'] =
'class Entry < ApplicationRecord\n' +
'  belongs_to :project\n' +
'  belongs_to :user\n' +
'\n' +
'  def create_with_counters!\n' +
'    transaction do\n' +
'      save!\n' +
'      project.increment!(:entries_count)   # ← ここで projects 行のロックを待つ\n' +
'    end\n' +
'  end\n' +
'end\n';

window.LFR.scenarios.add({
  id: 'case00b',
  level: 0,
  title: '監視の通知からサーバーへ降りる',
  subtitle: 'アラートのrequest_idを手がかりに、ログの中の1リクエストを特定する',

  description:
'Slackに Honeybadger の通知が流れました。左のカードがその内容です。\n\n' +
'本番でSSHする前に、まずこの通知から読み取れることを整理してください。\n' +
'例外クラス、発生している画面、件数、影響ユーザー数、直近のデプロイ時刻、\n' +
'そして request_id。ここまではブラウザで分かります。\n\n' +
'ただし通知だけでは「なぜロック待ちになったのか」は分かりません。\n' +
'そこからサーバーへ降りて、原因を特定してください。\n\n' +
'※このCASEでは、すでに production サーバーへ接続済みの状態から始まります。',

  alert: {
    source: 'Honeybadger',
    project: 'jinzai-draft-rails (production)',
    title: 'ActiveRecord::StatementInvalid',
    message: 'Mysql2::Error: Lock wait timeout exceeded; try restarting transaction',
    occurredAt: '2026-09-14 14:08:02 JST（初回 14:03:12）',
    component: 'entries#create',
    count: 5,
    users: '影響ユーザー 5名',
    requestId: RID,
    deploy: '2026-09-14 12:00 JST / e3f1c2a9 (i-wada)',
    env: 'production',
    note: 'このカードはブラウザで見えている情報です。ここから先はサーバーで調べます。'
  },

  learn: [
    { name: 'request_id で1リクエストを引く', cmd: 'grep "9f3c1a2e" log/production.log',
      desc: 'Railsは config.log_tags = [:request_id] により、\n' +
            '同じリクエストの全行に同じIDを付けます。\n\n' +
            '監視ツールが教えてくれる request_id をそのまま grep すれば、\n' +
            'そのリクエストが「何を受け取り、どこで落ちたか」を数行で読めます。\n' +
            '大量のログから該当箇所を探す方法として、これが最短です。' },
    { name: '前後の文脈を読む', cmd: 'grep -n "9f3c1a2e" log/production.log',
      desc: '-n で行番号を取れば、そこを起点に sed や tail で前後を読み直せます。\n' +
            '1リクエストだけ見て終わらせず、同じ時間帯に何が起きていたかまで広げてください。' },
    { name: '時間で突き合わせる', cmd: 'grep -c "Lock wait timeout" log/production.log',
      desc: '「いつから始まったか」を確定させます。\n' +
            'そして、その時刻に何が起きたかを他のログと突き合わせます。\n' +
            'デプロイ時刻・バッチの開始時刻・監視の通知時刻。この3つはいつも比べる価値があります。' },
    { name: '別のログへ広げる', cmd: 'tail -n 20 log/sidekiq.log',
      desc: 'Railsのリクエストログだけが本番のログではありません。\n' +
            '非同期ジョブ・nginx・systemd。同じ時刻の別のログに答えがあることは多いです。' },
    { name: 'ジョブの実体を読む', cmd: 'cat app/jobs/company_bulk_import_job.rb',
      desc: '本番サーバーには、いま動いているコードがそのまま置いてあります。\n' +
            '「このジョブは何をしているのか」をコードで確認できるのは、本番調査の強みです。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '14:18:30',

  journal: {
    sidekiq: [
      'Sep 14 12:00:40 production systemd[1]: Started Sidekiq background worker for myapp (production).',
      'Sep 14 14:02:41 production sidekiq[1502]: CompanyBulkImportJob start (18,402 rows)'
    ]
  },

  processes: window.LFR.base.processes.map(function (p) {
    if (!/sidekiq/.test(p.command)) return p;
    var q = {}; Object.keys(p).forEach(function (k) { q[k] = p[k]; });
    q.cpu = 38.2; q.mem = 12.4; q.rss = 512040; q.stat = 'Rl'; q.time = '5:48';
    q.command = 'sidekiq 7.2.0 myapp [1 of 10 busy]';
    return q;
  }),

  hints: [
    'アラートに request_id が載っています。\n' +
    'まずその1リクエストだけをログから抜き出して、何が起きたか読んでください。',

    'grep "9f3c1a2e" log/production.log を実行すると、\n' +
    'そのリクエストの Started / Processing / Parameters / ERROR / Completed が並びます。\n' +
    'ロック待ちで50秒かかって500になっていることが分かります。\n\n' +
    '次に「いつから始まったか」を確認してください。デプロイは12:00です。',

    'エラーが始まったのは14:03。デプロイの12:00とは3時間ずれています。\n' +
    'では14:02〜14:03に何が起きたのか。\n' +
    'Railsのリクエストログ以外にも、同じ時間帯のログがあります。\n\n' +
    '  tail -n 20 log/sidekiq.log'
  ],

  probes: [
    { key: 'usedRequestId', label: 'アラートのrequest_idでログを引いた',
      test: function (c, res) { return /9f3c1a2e/.test(c) && res.stdout.length > 0; } },
    { key: 'foundLockWait', label: 'Lock wait timeout を確認した',
      test: function (c, res) { return /Lock wait timeout/.test(res.stdout); } },
    { key: 'checkedOnset', label: 'エラーが始まった時刻を確認した',
      test: function (c, res) { return /14:03:12|Lock wait timeout/.test(res.stdout) && /grep|tail|head/.test(c); } },
    { key: 'foundBulkImport', label: '同時刻に動いていた一括インポートを見つけた',
      test: function (c, res) { return /CompanyBulkImportJob/.test(res.stdout); } },
    { key: 'sawSingleTransaction', label: '全行を1トランザクションで囲っていると確認した',
      test: function (c, res) { return /single transaction|Project\.transaction/.test(res.stdout); } },
    { key: 'checkedGetsOk', label: 'GETは正常だと確認して切り分けた',
      test: function (c, res) {
        if (/Completed 200 OK/.test(res.stdout)) return true;
        /* grep -c で件数だけ数えた場合も「確認した」とみなす */
        return /Completed 200|200 OK/.test(c) && /^\s*\d+\s*$/.test(res.stdout);
      } }
  ],

  evidence: [
    { key: 'usedRequestId',        weight: 16, label: 'request_idで該当リクエストを特定した' },
    { key: 'foundLockWait',        weight: 10, label: '例外の内容を確認した' },
    { key: 'checkedOnset',         weight: 10, label: '発生開始時刻を確認した' },
    { key: 'foundBulkImport',      weight: 16, label: '同時刻のジョブを見つけた' },
    { key: 'sawSingleTransaction', weight: 12, label: 'ジョブのコードまで確認した' },
    { key: 'checkedGetsOk',        weight: 6,  label: '正常な経路と比較して切り分けた' }
  ],

  question: {
    text: '応募（POST /entries）が失敗している原因は？',
    choices: [
      '12:00のデプロイで入ったコードにバグがある',
      'CSV一括インポートのジョブが全行を1トランザクションで処理しており、長時間ロックを保持している',
      'MySQLが停止している',
      'Redisが停止していてSidekiqがジョブを取り出せていない'
    ],
    answer: 1,
    explain:
'アラートの request_id をそのまま grep すると、1リクエストの全体が読めます。\n\n' +
'  $ grep "9f3c1a2e" log/production.log\n' +
'  Started POST "/entries" for 10.0.2.22 at 2026-09-14 14:08:02 +0900\n' +
'  Processing by EntriesController#create as HTML\n' +
'  Parameters: {"entry"=>{"project_id"=>"8821", "message"=>"[FILTERED]"}}\n' +
'  ActiveRecord::StatementInvalid (Mysql2::Error: Lock wait timeout exceeded; ...)\n' +
'  app/models/entry.rb:41:in `block in create_with_counters!\'\n' +
'  Completed 500 Internal Server Error in 50211ms\n\n' +
'50秒待たされてタイムアウトしています。MySQLの innodb_lock_wait_timeout の既定値です。\n' +
'つまり「誰かが持っているロックを、50秒待って諦めた」という状態です。\n\n' +
'次に時刻を確認します。デプロイは12:00、エラーの初回は14:03。3時間ずれています。\n' +
'デプロイ直後に始まっていれば真っ先に疑うべきですが、今回は無関係の可能性が高い。\n\n' +
'では14:02〜14:03に何が起きたのか。Railsのリクエストログ以外を見ます。\n\n' +
'  $ tail -n 20 log/sidekiq.log\n' +
'  14:02:41 class=CompanyBulkImportJob INFO: start\n' +
'  14:02:41 INFO: importing companies/2026-09-14_projects.csv (18,402 rows)\n' +
'  14:02:41 INFO: opening transaction (single transaction for all rows)\n' +
'  14:16:02 INFO: 15,100 / 18,402 rows\n\n' +
'14:02:41に始まった一括インポートが、まだ終わっていません。\n' +
'そしてコードを読むと、原因がはっきりします。\n\n' +
'  $ cat app/jobs/company_bulk_import_job.rb\n' +
'  Project.transaction do\n' +
'    rows.each_with_index { |row, i| upsert_project!(row) }\n' +
'  end\n\n' +
'18,402行すべてを1つのトランザクションで囲っているため、\n' +
'projects テーブルの行ロックが十数分間ずっと保持されています。\n\n' +
'一方、応募側はこうです。\n\n' +
'  $ cat app/models/entry.rb\n' +
'  project.increment!(:entries_count)   # ← projects 行を更新しにいく\n\n' +
'応募のたびに projects の行を更新しようとしてロック待ちになり、50秒で諦めています。\n' +
'GETは projects を読むだけなのでロックに関係なく200で返っています。\n' +
'「一部の操作だけが失敗する」という症状とも一致します。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. 監視ツールは「どこで落ちたか」までしか教えてくれない。「なぜ」はサーバーにある\n' +
'2. request_id は、大量のログから該当リクエストを引き当てる最速の手がかり\n' +
'3. 発生開始時刻とデプロイ時刻を必ず突き合わせる（今回は無関係だと分かった）\n' +
'4. Railsのリクエストログだけが本番のログではない。同じ時刻の別のログへ広げる',
    wrong: [
'デプロイは12:00、エラーの初回は14:03です。3時間離れています。\n\n' +
'デプロイ直後から始まった障害なら真っ先に疑うべきですが、\n' +
'今回は時間が合いません。アラートカードの「直近のデプロイ」と\n' +
'ログ上の初回発生時刻を突き合わせれば、この選択肢は外せます。\n\n' +
'「障害が出た＝直前のデプロイのせい」と決め打ちせず、\n' +
'まず時刻を並べて確認する癖をつけてください。',
null,
'MySQLは動いています。\n' +
'停止していれば Mysql2::Error::ConnectionError や\n' +
'ActiveRecord::ConnectionNotEstablished になり、GETを含む全ページが落ちます。\n\n' +
'しかし今回の例外は Lock wait timeout exceeded です。\n' +
'これは「接続はできていて、クエリも投げられていて、ロックを待っている」状態を意味します。\n' +
'GETリクエストも 200 OK で返り続けています。',
'Redisは動いており、Sidekiqもジョブを取り出せています。\n' +
'その証拠に、log/sidekiq.log には CompanyBulkImportJob が\n' +
'14:02:41 に start して進捗を書き続けています。\n\n' +
'むしろ今回は「Sidekiqがジョブを正常に処理していること」そのものが原因側です。\n' +
'ジョブの作り（全行を1トランザクション）に問題があります。'
    ]
  },

  route: {
    steps: [
      'アラートから request_id・発生時刻・直近デプロイを読み取る',
      'request_id でログを引き、1リクエストの全体を読む',
      '例外の種類から「接続できていてロックを待っている」と判断する',
      '初回発生時刻を確認し、デプロイ時刻と突き合わせる（→ 無関係）',
      '同じ時刻の別のログへ広げる（sidekiq.log）',
      'ジョブのコードを読んで、ロックを保持している理由を確定する'
    ],
    commands: [
      'cd /var/www/myapp/current',
      'grep "9f3c1a2e" log/production.log',
      'grep -c "Lock wait timeout" log/production.log',
      'grep -n "Lock wait timeout" log/production.log | head -n 3',
      'grep -c "Completed 200 OK" log/production.log',
      'tail -n 20 log/sidekiq.log',
      'cat app/jobs/company_bulk_import_job.rb',
      'cat app/models/entry.rb',
      'ps aux | grep sidekiq'
    ],
    note:
'sidekiq.log から入って「長いジョブが動いている」と先に気づくルートでも構いません。\n' +
'覚えてほしいのは順番です。\n' +
'通知 → request_id で1件を特定 → 時刻をデプロイと突き合わせ → 別のログへ広げる。\n' +
'この順番で降りていけば、通知だけでは分からない原因まで辿り着けます。'
  }
});
})();
