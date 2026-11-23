/* CASE 26 — 検索に新しい求人が出てこない（OpenSearch） */
(function () {
'use strict';
var APP = '/var/www/myapp';

var files = {};

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T20:02:11.114+09:00 #1433]  INFO -- : [ee11ff22-0033-4dd4-8ee5-ff6600aa11bb] Started GET "/projects?q=%E7%A8%8E%E7%90%86%E5%A3%AB" for 10.0.2.31 at 2026-09-14 20:02:11 +0900\n' +
'I, [2026-09-14T20:02:11.116+09:00 #1433]  INFO -- : [ee11ff22-0033-4dd4-8ee5-ff6600aa11bb] Processing by ProjectsController#index as HTML\n' +
'D, [2026-09-14T20:02:11.198+09:00 #1433] DEBUG -- : [ee11ff22-0033-4dd4-8ee5-ff6600aa11bb] OpenSearch POST /projects/_search took 68ms, hits=412038\n' +
'I, [2026-09-14T20:02:11.288+09:00 #1433]  INFO -- : [ee11ff22-0033-4dd4-8ee5-ff6600aa11bb] Completed 200 OK in 174ms (Views: 88.1ms | ActiveRecord: 6.2ms)\n' +
'I, [2026-09-14T20:05:40.441+09:00 #1434]  INFO -- : [ff220033-1144-4ee5-9ff6-00aa11bb22cc] Started GET "/projects/9912" for 10.0.2.18 at 2026-09-14 20:05:40 +0900\n' +
'I, [2026-09-14T20:05:40.520+09:00 #1434]  INFO -- : [ff220033-1144-4ee5-9ff6-00aa11bb22cc] Completed 200 OK in 79ms (Views: 51.0ms | ActiveRecord: 12.8ms)\n';

files[APP + '/shared/log/sidekiq.log'] =
'2026-09-14T14:02:41.118Z pid=1502 tid=b04 class=ProjectReindexJob jid=3f9a1c8d2e07 INFO: start\n' +
'2026-09-14T14:02:41.220Z pid=1502 tid=b04 class=ProjectReindexJob jid=3f9a1c8d2e07 INFO: creating index projects_20260914140241\n' +
'2026-09-14T14:38:02.880Z pid=1502 tid=b04 class=ProjectReindexJob jid=3f9a1c8d2e07 INFO: indexed 482913 documents\n' +
'2026-09-14T14:38:03.114Z pid=1502 tid=b04 class=ProjectReindexJob jid=3f9a1c8d2e07 INFO: refresh done\n' +
'2026-09-14T14:38:03.118Z pid=1502 tid=b04 class=ProjectReindexJob jid=3f9a1c8d2e07 elapsed=2162.0 INFO: done\n';

files[APP + '/releases/20260914120000/app/jobs/project_reindex_job.rb'] =
'class ProjectReindexJob < ApplicationJob\n' +
'  def perform\n' +
'    name = "projects_#{Time.current.strftime(\'%Y%m%d%H%M%S\')}"\n' +
'    Search::Client.create_index(name)\n' +
'    Project.published.find_each { |p| Search::Client.index(name, p) }\n' +
'    Search::Client.refresh(name)\n' +
'    Rails.logger.info("refresh done")\n' +
'    # TODO: aliasの張り替えがここに無い\n' +
'    # Search::Client.switch_alias("projects", to: name)\n' +
'  end\n' +
'end\n';

files[APP + '/releases/20260914120000/app/models/concerns/searchable.rb'] =
'module Searchable\n' +
'  extend ActiveSupport::Concern\n' +
'\n' +
'  # 検索は常にエイリアス "projects" に対して投げる\n' +
'  # 実体のインデックス名は projects_YYYYMMDDHHMMSS\n' +
'  SEARCH_ALIAS = "projects".freeze\n' +
'end\n';

var HEALTH =
'{\n' +
'  "cluster_name" : "jinzai-prod-search",\n' +
'  "status" : "green",\n' +
'  "number_of_nodes" : 3,\n' +
'  "active_primary_shards" : 12,\n' +
'  "unassigned_shards" : 0\n' +
'}\n';

var INDICES =
'health status index                     docs.count  store.size\n' +
'green  open   projects_20260901030102       412038       1.9gb\n' +
'green  open   projects_20260914140241       482913       2.3gb\n' +
'green  open   companies_20260901030410        8241     142.2mb\n';

var ALIASES =
'alias      index                       filter routing.index routing.search\n' +
'projects   projects_20260901030102     -      -             -\n' +
'companies  companies_20260901030410    -      -             -\n';

var COUNT_ALIAS = '{"count":412038,"_shards":{"total":4,"successful":4,"failed":0}}\n';
var COUNT_NEW   = '{"count":482913,"_shards":{"total":4,"successful":4,"failed":0}}\n';

window.LFR.scenarios.add({
  id: 'case26',
  level: 9,
  title: '検索に新しい求人が出てこない',
  subtitle: 'エラーは出ない。数字が合わないだけ',

  description:
'営業チームから連絡がありました。\n\n' +
'「今日登録した求人が、サイトの検索結果に出てきません。\n' +
'  求人詳細ページのURLを直接開けば表示されます」\n\n' +
'エラーは出ていません。検索は200で返っていて、結果も表示されます。\n' +
'ただ、新しい求人だけが含まれていません。\n\n' +
'求人検索は OpenSearch を使っています。\n' +
'今日の14時に再インデックスのジョブが動いた記録があります。\n\n' +
'どこで食い違っているのかを突き止めてください。\n' +
'※OpenSearchへは curl でREST APIを叩いて調べられます。',

  learn: [
    { name: 'クラスタの健康状態', cmd: 'curl -s localhost:9200/_cluster/health?pretty',
      desc: '最初に見る場所です。status が green / yellow / red のどれかを確認します。\n\n' +
            '  green  … すべてのshardが割り当てられている\n' +
            '  yellow … replicaが足りない（検索はできる）\n' +
            '  red    … primary shardが欠けている（データが読めない）\n\n' +
            'ここがgreenなら、クラスタ自体は健全です。原因は別の層にあります。' },
    { name: 'インデックスの一覧', cmd: 'curl -s localhost:9200/_cat/indices?v',
      desc: '存在するインデックスと、それぞれの docs.count を表示します。\n' +
            'DBのレコード数と比べて、どのインデックスが最新かを判断できます。\n\n' +
            '再インデックス方式の構成では、\n' +
            '「新しいインデックスは作られているのに使われていない」がよく起きます。' },
    { name: 'エイリアス', cmd: 'curl -s localhost:9200/_cat/aliases?v',
      desc: 'ここが今回の急所です。\n\n' +
            'アプリは実体のインデックス名（projects_20260914140241）ではなく、\n' +
            'エイリアス（projects）に対して検索を投げます。\n' +
            '再インデックスは「新しいインデックスを作る → エイリアスを張り替える」の\n' +
            '2段階で行い、張り替えた瞬間に無停止で切り替わります。\n\n' +
            'Capistranoの current と同じ考え方です。\n' +
            '実体を新しく作って、最後にポインタを向け直す。\n' +
            'そして同じように「張り替え忘れ」が起きます。' },
    { name: '件数を直接数える', cmd: 'curl -s localhost:9200/projects/_count',
      desc: 'エイリアス名でもインデックス名でも件数を取れます。\n' +
            '両方を叩いて数字を比べれば、どちらを見ているかが確定します。' },
    { name: 'ジョブのログとコード', cmd: 'tail -n 8 log/sidekiq.log',
      desc: '再インデックスのジョブが「どこまでやったか」を確認します。\n' +
            'ログに出ている最後の処理と、コードに書かれている処理を突き合わせると、\n' +
            '抜けている手順が見つかります。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '20:08:31',

  http: {
    'http://localhost:9200/_cluster/health?pretty': {
      status: 200, reason: 'OK', headers: { 'content-type': 'application/json' }, body: HEALTH
    },
    'http://localhost:9200/_cluster/health': {
      status: 200, reason: 'OK', headers: { 'content-type': 'application/json' }, body: HEALTH
    },
    'http://localhost:9200/_cat/indices?v': {
      status: 200, reason: 'OK', headers: { 'content-type': 'text/plain' }, body: INDICES
    },
    'http://localhost:9200/_cat/indices': {
      status: 200, reason: 'OK', headers: { 'content-type': 'text/plain' }, body: INDICES
    },
    'http://localhost:9200/_cat/aliases?v': {
      status: 200, reason: 'OK', headers: { 'content-type': 'text/plain' }, body: ALIASES
    },
    'http://localhost:9200/_cat/aliases': {
      status: 200, reason: 'OK', headers: { 'content-type': 'text/plain' }, body: ALIASES
    },
    'http://localhost:9200/projects/_count': {
      status: 200, reason: 'OK', headers: { 'content-type': 'application/json' }, body: COUNT_ALIAS
    },
    'http://localhost:9200/projects_20260914140241/_count': {
      status: 200, reason: 'OK', headers: { 'content-type': 'application/json' }, body: COUNT_NEW
    },
    'http://localhost:9200/projects_20260901030102/_count': {
      status: 200, reason: 'OK', headers: { 'content-type': 'application/json' }, body: COUNT_ALIAS
    },
    'http://localhost/projects': {
      status: 200, reason: 'OK',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><head><title>求人検索 | Myapp</title></head><body>...</body></html>\n'
    }
  },

  db: {
    queries: [
      { re: /SELECT\s+COUNT\(\*\)\s+FROM\s+`?projects`?\s+WHERE\s+`?published`?/i,
        out: '+----------+\n| COUNT(*) |\n+----------+\n|   482913 |\n+----------+' },
      { re: /SELECT\s+COUNT\(\*\)\s+FROM\s+`?projects`?/i,
        out: '+----------+\n| COUNT(*) |\n+----------+\n|   491204 |\n+----------+' }
    ]
  },

  hints: [
    'まずOpenSearch自体が健全かを確認してください。\n' +
    'クラスタのstatusがgreenなら、基盤の問題ではありません。\n' +
    '次に「アプリが見ているデータ」と「実際にあるデータ」を比べます。',

    'インデックスの一覧を見てください。\n' +
    '  curl -s localhost:9200/_cat/indices?v\n' +
    '2つの projects_* があり、docs.count が違うはずです。\n' +
    'DBの件数（mysql -e "SELECT COUNT(*) FROM projects WHERE published = 1"）とも比べてください。',

    'アプリは実体のインデックス名ではなく、エイリアス「projects」を見ています\n' +
    '（app/models/concerns/searchable.rb）。\n\n' +
    '  curl -s localhost:9200/_cat/aliases?v\n\n' +
    'エイリアスがどちらを指しているかを確認し、\n' +
    'app/jobs/project_reindex_job.rb のコードと突き合わせてください。'
  ],

  probes: [
    { key: 'checkedClusterHealth', label: 'クラスタの状態を確認した',
      test: function (c, res) { return /"status" : "green"|cluster_name/.test(res.stdout); } },
    { key: 'listedIndices', label: 'インデックスの一覧を確認した',
      test: function (c, res) { return /projects_20260914140241/.test(res.stdout) && /docs\.count/.test(res.stdout); } },
    { key: 'sawCountGap', label: '件数の食い違いに気づいた',
      test: function (c, res) { return /412038/.test(res.stdout); } },
    { key: 'checkedAlias', label: 'エイリアスの向き先を確認した',
      test: function (c, res) { return /alias/.test(res.stdout) && /projects_20260901030102/.test(res.stdout); } },
    { key: 'comparedWithDb', label: 'DB側の件数と比べた',
      test: function (c, res) { return /482913/.test(res.stdout); } },
    { key: 'readReindexJob', label: '再インデックスのコードを読んだ',
      test: function (c, res) { return /switch_alias|aliasの張り替え/.test(res.stdout); } },
    { key: 'readSidekiqLog', label: 'ジョブのログでどこまで進んだか確認した',
      test: function (c, res) { return /refresh done|ProjectReindexJob/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'checkedClusterHealth', weight: 8,  label: 'クラスタの健全性を確認した' },
    { key: 'listedIndices',        weight: 14, label: 'インデックスの一覧を確認した' },
    { key: 'sawCountGap',          weight: 12, label: '件数の食い違いに気づいた' },
    { key: 'checkedAlias',         weight: 20, label: 'エイリアスの向き先を特定した' },
    { key: 'comparedWithDb',       weight: 10, label: 'DB側の件数と突き合わせた' },
    { key: 'readReindexJob',       weight: 16, label: 'ジョブのコードで抜けている手順を見つけた' },
    { key: 'readSidekiqLog',       weight: 10, label: 'ジョブのログを確認した' }
  ],

  question: {
    text: '新しい求人が検索結果に出てこない原因は？',
    choices: [
      'OpenSearchのクラスタが不調で、新しいドキュメントを受け付けていない',
      '再インデックスは完了しているが、エイリアスが古いインデックスを指したままになっている',
      '再インデックスのジョブが途中で失敗して止まっている',
      'Railsのキャッシュが古い検索結果を返している'
    ],
    answer: 1,
    explain:
'数字を並べると、どこで食い違っているかがはっきりします。\n\n' +
'【1. クラスタは健全】\n' +
'  $ curl -s localhost:9200/_cluster/health?pretty\n' +
'  "status" : "green",  "unassigned_shards" : 0\n\n' +
'  green なので基盤の問題ではありません。ここで原因を探すのをやめて次へ行けます。\n\n' +
'【2. インデックスは2つある】\n' +
'  $ curl -s localhost:9200/_cat/indices?v\n' +
'  green open  projects_20260901030102   412038   1.9gb   ← 9/1に作られた古いもの\n' +
'  green open  projects_20260914140241   482913   2.3gb   ← 今日14時に作られたもの\n\n' +
'  新しいインデックスはちゃんと作られていて、中身も入っています。\n\n' +
'【3. DBと比べる】\n' +
'  $ mysql -e "SELECT COUNT(*) FROM projects WHERE published = 1"\n' +
'  482913\n\n' +
'  新しいインデックスの件数と一致します。再インデックス自体は成功しています。\n\n' +
'【4. アプリはどちらを見ているか】\n' +
'  $ cat app/models/concerns/searchable.rb\n' +
'  SEARCH_ALIAS = "projects"        ← 検索はエイリアスに対して投げている\n' +
'  $ curl -s localhost:9200/_cat/aliases?v\n' +
'  alias     index\n' +
'  projects  projects_20260901030102   ← 古いほうを指している\n\n' +
'  ここが原因です。\n' +
'  検索は「projects」というエイリアス経由で行われ、その向き先は9/1の古いインデックスのまま。\n' +
'  だから今日追加した求人は結果に出てきません。\n\n' +
'  $ curl -s localhost:9200/projects/_count\n' +
'  {"count":412038}                  ← エイリアス経由（古い）\n' +
'  $ curl -s localhost:9200/projects_20260914140241/_count\n' +
'  {"count":482913}                  ← 実体（新しい）\n\n' +
'【5. なぜ張り替わらなかったのか】\n' +
'  $ cat app/jobs/project_reindex_job.rb\n' +
'  Search::Client.refresh(name)\n' +
'  Rails.logger.info("refresh done")\n' +
'  # TODO: aliasの張り替えがここに無い\n' +
'  # Search::Client.switch_alias("projects", to: name)\n\n' +
'  ジョブに張り替えの処理が入っていません。\n' +
'  sidekiq.log も "refresh done" で終わっていて、その先の処理がありません。\n\n' +
'--- この構成の考え方 ---\n\n' +
'再インデックスは「新しいインデックスを作る → エイリアスを張り替える」の2段階です。\n' +
'検索を止めずに入れ替えられるのが利点で、失敗しても古いインデックスが\n' +
'そのまま生きているので影響が出ません。\n\n' +
'これは Capistrano の current とまったく同じ構造です。\n' +
'  releases/ に新しい実体を作る → current を張り替える\n' +
'  projects_YYYYMMDD を作る     → alias projects を張り替える\n\n' +
'そして同じ失敗が起きます。**実体はできているのにポインタが古いまま**。\n' +
'CASE 12 で見た「デプロイしたのに反映されない」と同じ形です。\n\n' +
'この形の障害は、エラーが一切出ないのが特徴です。\n' +
'検索は200で返り、結果も表示されるので、監視にも引っかかりません。\n' +
'気づくのはいつも「数字が合わない」という現場からの報告です。\n' +
'だからこそ、件数を突き合わせる習慣が効きます。',
    wrong: [
'クラスタは健全です。\n' +
'  "status" : "green",  "number_of_nodes" : 3,  "unassigned_shards" : 0\n\n' +
'そして新しいインデックス projects_20260914140241 には\n' +
'482,913件のドキュメントが正常に入っています。\n' +
'受け付けていないのであれば、この件数にはなりません。\n\n' +
'_cluster/health が green なら、まず基盤を疑うのをやめて\n' +
'アプリとインデックスの対応関係を見に行ってください。',
null,
'ジョブは最後まで走り切っています。\n\n' +
'  $ tail -n 8 log/sidekiq.log\n' +
'  INFO: indexed 482913 documents\n' +
'  INFO: refresh done\n' +
'  elapsed=2162.0 INFO: done\n\n' +
'done まで出ていて、エラーもリトライもありません。\n' +
'件数もDBと一致しています。\n\n' +
'問題は「途中で止まった」ではなく「最後の1手順がコードに書かれていない」ことです。\n' +
'ジョブのコードを読むと、aliasの張り替えがTODOのまま残っています。',
'Railsのキャッシュではありません。\n\n' +
'production.log を見ると、リクエストのたびにOpenSearchへ問い合わせています。\n' +
'  OpenSearch POST /projects/_search took 68ms, hits=412038\n\n' +
'キャッシュから返しているなら、この行は出ません。\n' +
'そして hits=412038 という数字が、古いインデックスの件数と一致しています。\n' +
'毎回きちんと検索していて、検索先が古い、というのが実際の状態です。'
    ]
  },

  route: {
    steps: [
      'OpenSearchのクラスタ状態を確認する（green なら基盤は健全）',
      'インデックスの一覧と件数を確認する',
      'DBの件数と突き合わせて、どのインデックスが最新かを判断する',
      'アプリがどの名前で検索しているかをコードで確認する',
      'エイリアスの向き先を確認する',
      '再インデックスのジョブのログとコードを突き合わせる'
    ],
    commands: [
      'curl -s localhost:9200/_cluster/health?pretty',
      'curl -s localhost:9200/_cat/indices?v',
      'mysql -e "SELECT COUNT(*) FROM projects WHERE published = 1"',
      'cat app/models/concerns/searchable.rb',
      'curl -s localhost:9200/_cat/aliases?v',
      'curl -s localhost:9200/projects/_count',
      'curl -s localhost:9200/projects_20260914140241/_count',
      'tail -n 8 log/sidekiq.log',
      'cat app/jobs/project_reindex_job.rb',
      'grep -n "OpenSearch" log/production.log'
    ],
    note:
'sidekiq.log から入って「refresh done で終わっている」ことに気づくルートでも構いません。\n' +
'エラーが出ない不具合は、**数字を突き合わせる**のが唯一の見つけ方です。\n' +
'DBの件数・インデックスの件数・エイリアス経由の件数。\n' +
'この3つを並べれば、どこで切れているかが必ず分かります。'
  }
});
})();
