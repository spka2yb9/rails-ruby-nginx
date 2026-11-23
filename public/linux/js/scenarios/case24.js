/* CASE 24 — 遅いページの原因をDB側から突き止める */
(function () {
'use strict';
var APP = '/var/www/myapp';

var files = {};

function buildLog() {
  var L = [];
  for (var i = 0; i < 24; i++) {
    var mm = String(10 + Math.floor(i / 2)).padStart(2, '0');
    var ss = String((i * 13) % 60).padStart(2, '0');
    var t = '2026-09-14T19:' + mm + ':' + ss + '.' + String(100 + i * 19).slice(0, 3) + '+09:00';
    var rid = 'd' + (i * 48271).toString(16).padStart(7, '0') + '-3e4f-4506-8172-839a4b5c6d7e';
    var slow = i % 3 !== 2;
    var ms = slow ? 3100 + i * 40 : 118;
    var ar = slow ? ms - 180 : 14;
    var path = slow ? '/projects?q=%E7%A8%8E%E7%90%86%E5%A3%AB&area=13' : '/';
    var ctrl = slow ? 'ProjectsController#index' : 'TopController#index';
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Started GET "' + path + '" for 10.0.2.' + (10 + i) + ' at 2026-09-14 19:' + mm + ':' + ss + ' +0900');
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Processing by ' + ctrl + ' as HTML');
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Completed 200 OK in ' + ms + 'ms (Views: 168.2ms | ActiveRecord: ' + ar + '.4ms | Allocations: 214402)');
  }
  return L.join('\n') + '\n';
}
files[APP + '/shared/log/production.log'] = buildLog();

files['/var/log/mysql/slow.log'] =
'# Time: 2026-09-14T19:12:41.882000Z\n' +
'# User@Host: myapp[myapp] @  [10.0.2.50]  Id: 84021\n' +
'# Query_time: 3.104882  Lock_time: 0.000118  Rows_sent: 50  Rows_examined: 482913\n' +
'SET timestamp=1789377161;\n' +
'SELECT `projects`.* FROM `projects` WHERE `projects`.`published` = 1 AND `projects`.`area_id` = 13 ORDER BY `projects`.`published_at` DESC LIMIT 50 OFFSET 0;\n' +
'# Time: 2026-09-14T19:13:58.114000Z\n' +
'# User@Host: myapp[myapp] @  [10.0.2.50]  Id: 84033\n' +
'# Query_time: 3.221904  Lock_time: 0.000102  Rows_sent: 50  Rows_examined: 482913\n' +
'SET timestamp=1789377238;\n' +
'SELECT `projects`.* FROM `projects` WHERE `projects`.`published` = 1 AND `projects`.`area_id` = 13 ORDER BY `projects`.`published_at` DESC LIMIT 50 OFFSET 0;\n' +
'# Time: 2026-09-14T19:15:02.441000Z\n' +
'# User@Host: myapp[myapp] @  [10.0.2.50]  Id: 84048\n' +
'# Query_time: 3.188221  Lock_time: 0.000094  Rows_sent: 50  Rows_examined: 482913\n' +
'SET timestamp=1789377302;\n' +
'SELECT `projects`.* FROM `projects` WHERE `projects`.`published` = 1 AND `projects`.`area_id` = 13 ORDER BY `projects`.`published_at` DESC LIMIT 50 OFFSET 0;\n';

files[APP + '/releases/20260914120000/app/models/project.rb'] =
'class Project < ApplicationRecord\n' +
'  belongs_to :company\n' +
'  belongs_to :area\n' +
'\n' +
'  scope :published, -> { where(published: true) }\n' +
'  scope :recent,    -> { order(published_at: :desc) }\n' +
'end\n';

files[APP + '/releases/20260914120000/db/schema.rb'] =
'ActiveRecord::Schema[7.2].define(version: 2026_09_10_110000) do\n' +
'  create_table "projects", charset: "utf8mb4", force: :cascade do |t|\n' +
'    t.bigint  "company_id",   null: false\n' +
'    t.bigint  "area_id",      null: false\n' +
'    t.boolean "published",    default: false, null: false\n' +
'    t.datetime "published_at"\n' +
'    t.string  "title",        null: false\n' +
'    t.datetime "created_at",  null: false\n' +
'    t.datetime "updated_at",  null: false\n' +
'    t.index ["company_id"], name: "index_projects_on_company_id"\n' +
'    # area_id / published / published_at には索引が無い\n' +
'  end\n' +
'end\n';

var EXPLAIN =
'+----+-------------+----------+------+---------------+------+---------+------+--------+-----------------------------+\n' +
'| id | select_type | table    | type | possible_keys | key  | key_len | ref  | rows   | Extra                       |\n' +
'+----+-------------+----------+------+---------------+------+---------+------+--------+-----------------------------+\n' +
'|  1 | SIMPLE      | projects | ALL  | NULL          | NULL | NULL    | NULL | 482913 | Using where; Using filesort |\n' +
'+----+-------------+----------+------+---------------+------+---------+------+--------+-----------------------------+';

var PROCESSLIST =
'+-------+-------+-----------------+-------------------+---------+------+--------------+------------------------------------------+\n' +
'| Id    | User  | Host            | db                | Command | Time | State        | Info                                     |\n' +
'+-------+-------+-----------------+-------------------+---------+------+--------------+------------------------------------------+\n' +
'| 84021 | myapp | 10.0.2.50:51204 | myapp_production  | Query   |    3 | Sending data | SELECT `projects`.* FROM `projects` WH... |\n' +
'| 84033 | myapp | 10.0.2.50:51208 | myapp_production  | Query   |    2 | Sending data | SELECT `projects`.* FROM `projects` WH... |\n' +
'| 84048 | myapp | 10.0.2.50:51212 | myapp_production  | Query   |    1 | Sending data | SELECT `projects`.* FROM `projects` WH... |\n' +
'| 84055 | myapp | 10.0.2.50:51216 | myapp_production  | Sleep   |   12 |              | NULL                                     |\n' +
'+-------+-------+-----------------+-------------------+---------+------+--------------+------------------------------------------+';

window.LFR.scenarios.add({
  id: 'case24',
  level: 8,
  title: '遅いページの原因をDB側から突き止める',
  subtitle: 'アプリのログからDBへ降りる',

  description:
'「求人検索（エリア絞り込み）が重い」という報告が続いています。\n\n' +
'エラーにはなりません。200で返っていますが、3秒以上かかります。\n' +
'トップページなど他のページは100ms前後で返っています。\n\n' +
'サーバーのCPUもメモリも余裕があります（load average 0.4）。\n' +
'つまりサーバー資源の問題ではありません。\n\n' +
'どこで時間を使っているのかを特定してください。\n' +
'※このCASEでは mysql -e "<SQL>" でDBを調べられます。',

  learn: [
    { name: 'Railsのログで時間の内訳を見る', cmd: 'grep "Completed 200" log/production.log | tail -n 5',
      desc: 'Railsは完了行に内訳を出します。\n\n' +
            '  Completed 200 OK in 3140ms (Views: 168.2ms | ActiveRecord: 2960.4ms)\n\n' +
            'Views が大きければテンプレート描画、ActiveRecord が大きければDB。\n' +
            'どちらも小さいのに全体が長ければ、外部API呼び出しなどが疑われます。\n' +
            'まずここで「どのレイヤーの問題か」を切り分けます。' },
    { name: 'スロークエリログ', cmd: 'tail -n 20 /var/log/mysql/slow.log',
      desc: '指定時間を超えたクエリが記録されます。見るべきは2つの数字です。\n\n' +
            '  Rows_sent     … 実際に返した行数\n' +
            '  Rows_examined … そのために読んだ行数\n\n' +
            'この差が大きいほど「無駄に読んでいる」ことを意味します。\n' +
            '50行返すために48万行読んでいるなら、索引が効いていません。' },
    { name: 'SHOW PROCESSLIST', cmd: 'mysql -e "SHOW PROCESSLIST"',
      desc: 'いまDBで実行中のクエリの一覧です。\n' +
            'Time列が実行中の秒数、State列が何をしているかを表します。\n' +
            '同じクエリが何本も並んでいれば、1本が遅いせいで詰まっていると分かります。' },
    { name: 'EXPLAIN', cmd: 'mysql -e "EXPLAIN SELECT ..."',
      desc: 'そのクエリをMySQLがどう実行するつもりかを表示します。見るのは3つです。\n\n' +
            '  type  … ALL はフルスキャン（最悪）。ref / range なら索引が効いている\n' +
            '  key   … 実際に使う索引。NULL なら索引を使っていない\n' +
            '  rows  … 読む見込みの行数\n' +
            '  Extra … Using filesort はソートのために別途並べ替えが必要という意味\n\n' +
            '遅いクエリを見つけたら、必ずEXPLAINにかけてください。' },
    { name: 'schema.rb で索引を確認する', cmd: 'grep -n "index" db/schema.rb',
      desc: 'どの列に索引が張られているかは、schema.rb を読めば分かります。\n' +
            'EXPLAINで「索引が無い」と分かったら、ここで裏を取ります。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '19:22:14',

  system: {
    uptime: { since: '8 days, 03:15', users: 1, load: [0.42, 0.38, 0.41] },
    cpu:    { cores: 4, us: 6.1, sy: 2.2, id: 91.2, wa: 0.5 },
    mem:    { total: 7823, used: 3240, free: 1402, shared: 68, buffCache: 3181, available: 4288 },
    swap:   { total: 2047, used: 0, free: 2047 }
  },

  db: {
    queries: [
      { re: /SHOW\s+PROCESSLIST/i, out: PROCESSLIST },
      { re: /EXPLAIN/i, out: EXPLAIN },
      { re: /SELECT\s+COUNT\(\*\)\s+FROM\s+`?projects`?/i,
        out: '+----------+\n| COUNT(*) |\n+----------+\n|   482913 |\n+----------+' },
      { re: /SHOW\s+(INDEX|KEYS)\s+FROM\s+`?projects`?/i,
        out: '+----------+------------+-------------------------------+--------------+-------------+\n' +
             '| Table    | Non_unique | Key_name                      | Seq_in_index | Column_name |\n' +
             '+----------+------------+-------------------------------+--------------+-------------+\n' +
             '| projects |          0 | PRIMARY                       |            1 | id          |\n' +
             '| projects |          1 | index_projects_on_company_id  |            1 | company_id  |\n' +
             '+----------+------------+-------------------------------+--------------+-------------+' },
      { re: /SHOW\s+VARIABLES\s+LIKE\s+'?long_query_time/i,
        out: '+-----------------+----------+\n| Variable_name   | Value    |\n+-----------------+----------+\n| long_query_time | 1.000000 |\n+-----------------+----------+' }
    ]
  },

  hints: [
    'まずRailsのログで「どこで時間を使っているか」を切り分けてください。\n' +
    'Completed の行に Views と ActiveRecord の内訳が出ています。',

    'ActiveRecord の時間が大半なら、DB側を見ます。\n' +
    'スロークエリログ（/var/log/mysql/slow.log）に該当するクエリが記録されています。\n' +
    'Rows_sent と Rows_examined の差に注目してください。',

    '遅いクエリが特定できたら、MySQLにどう実行されるかを聞きます。\n\n' +
    '  mysql -e "EXPLAIN SELECT * FROM projects WHERE published = 1 AND area_id = 13 ORDER BY published_at DESC LIMIT 50"\n\n' +
    'type / key / rows / Extra の4つを見てください。\n' +
    'そのあと db/schema.rb で索引の有無を確認します。'
  ],

  probes: [
    { key: 'splitLayers', label: 'Railsログで時間の内訳を確認した',
      test: function (c, res) { return /ActiveRecord: 2\d{3}|ActiveRecord: 3\d{3}/.test(res.stdout); } },
    { key: 'ruledOutServer', label: 'サーバー資源の問題ではないと確認した',
      test: function (c, res) { return /\b(free|uptime|top)\b/.test(c) && res.stdout.length > 0; } },
    { key: 'readSlowLog', label: 'スロークエリログを読んだ',
      test: function (c, res) { return /Rows_examined/.test(res.stdout); } },
    { key: 'sawRowsGap', label: 'Rows_sentとRows_examinedの差に気づいた',
      test: function (c, res) { return /482913/.test(res.stdout); } },
    { key: 'usedExplain', label: 'EXPLAINで実行計画を確認した',
      test: function (c, res) { return /EXPLAIN/i.test(c) && /filesort|ALL/.test(res.stdout); } },
    { key: 'checkedIndexes', label: '索引の有無を確認した',
      test: function (c, res) { return /index_projects_on_company_id/.test(res.stdout); } },
    { key: 'usedProcesslist', label: '実行中のクエリを確認した',
      test: function (c, res) { return /PROCESSLIST/i.test(c) && /Sending data/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'splitLayers',      weight: 14, label: 'どのレイヤーが遅いかを切り分けた' },
    { key: 'ruledOutServer',   weight: 8,  label: 'サーバー資源の問題を除外した' },
    { key: 'readSlowLog',      weight: 14, label: 'スロークエリログを読んだ' },
    { key: 'sawRowsGap',       weight: 14, label: '読んだ行数と返した行数の差に気づいた' },
    { key: 'usedExplain',      weight: 18, label: 'EXPLAINで実行計画を確認した' },
    { key: 'checkedIndexes',   weight: 12, label: '索引の有無を裏取りした' },
    { key: 'usedProcesslist',  weight: 8,  label: '実行中のクエリを確認した' }
  ],

  question: {
    text: '求人検索が3秒かかっている原因は？',
    choices: [
      'サーバーのCPUまたはメモリが不足している',
      'WHERE と ORDER BY に対応する索引が無く、48万行のフルスキャンとソートが毎回走っている',
      'Viewのテンプレート描画に時間がかかっている',
      '外部APIの呼び出しがタイムアウトしかけている'
    ],
    answer: 1,
    explain:
'レイヤーを1つずつ落としていくと、DBに辿り着きます。\n\n' +
'【1. どのレイヤーが遅いか】\n' +
'  $ grep "Completed 200" log/production.log | tail -n 3\n' +
'  Completed 200 OK in 3140ms (Views: 168.2ms | ActiveRecord: 2960.4ms)\n\n' +
'  3140msのうち2960msがActiveRecord。ほぼ全部DB待ちです。\n' +
'  Viewsは168msなので描画の問題ではありません。\n\n' +
'【2. サーバー資源ではない】\n' +
'  $ uptime\n' +
'  load average: 0.42, 0.38, 0.41       ← 4コアに対して余裕\n' +
'  $ free -h\n' +
'  available 4.2Gi                      ← メモリも余裕\n\n' +
'【3. どのクエリが遅いか】\n' +
'  $ tail -n 20 /var/log/mysql/slow.log\n' +
'  # Query_time: 3.104882  Rows_sent: 50  Rows_examined: 482913\n' +
'  SELECT `projects`.* FROM `projects`\n' +
'   WHERE `published` = 1 AND `area_id` = 13\n' +
'   ORDER BY `published_at` DESC LIMIT 50\n\n' +
'  50行返すために **482,913行を読んでいます**。約1万倍の無駄です。\n' +
'  この2つの数字の差が、索引が効いていないことの最も分かりやすいサインです。\n\n' +
'【4. MySQLにどう実行するつもりか聞く】\n' +
'  $ mysql -e "EXPLAIN SELECT ..."\n' +
'  type: ALL          ← フルスキャン\n' +
'  key:  NULL         ← 索引を使っていない\n' +
'  rows: 482913       ← 全行読む見込み\n' +
'  Extra: Using where; Using filesort   ← ソートも別途やり直している\n\n' +
'【5. 索引の状況を確認する】\n' +
'  $ grep -n "index" db/schema.rb\n' +
'  t.index ["company_id"], name: "index_projects_on_company_id"\n' +
'  # area_id / published / published_at には索引が無い\n\n' +
'  $ mysql -e "SHOW INDEX FROM projects"\n' +
'  PRIMARY (id) と company_id の2つだけ\n\n' +
'原因は「WHEREで絞る列とORDER BYする列に索引が無い」ことです。\n' +
'MySQLは全行を読んで条件に合うものを拾い、さらに並べ替えてから先頭50件を返しています。\n' +
'データが増えるほど線形に遅くなるので、放置すると悪化し続けます。\n\n' +
'--- 対応 ---\n\n' +
'複合索引を1本追加すれば、WHEREの絞り込みとORDER BYの両方に効きます。\n\n' +
'  add_index :projects, [:published, :area_id, :published_at],\n' +
'            name: "index_projects_on_published_area_published_at",\n' +
'            algorithm: :inplace\n\n' +
'列の順番には意味があります。等価比較で使う列（published, area_id）を先に、\n' +
'ソートに使う列（published_at）を最後に置くと、filesort も消せます。\n\n' +
'ただし本番で索引を追加するのは無害な操作ではありません。\n' +
'  ・48万行のテーブルなら数秒〜数十秒かかります\n' +
'  ・MySQL 8.0 / Aurora なら ALGORITHM=INPLACE でオンライン追加できますが、\n' +
'    メタデータロックの取得待ちで一瞬詰まることがあります\n' +
'  ・アクセスの少ない時間帯に、実行時間を見積もってから行ってください\n\n' +
'なお EXPLAIN は本番でも安全に実行できます（クエリは実行されません）。\n' +
'遅いクエリを見つけたら、まずEXPLAINにかける癖をつけてください。',
    wrong: [
'サーバー資源は余っています。\n' +
'  uptime  → load average 0.42（4コア）\n' +
'  free -h → available 4.2Gi、swapの使用は0\n\n' +
'CPU不足なら top の us が高くなり、メモリ不足なら swap が動きます。\n' +
'どちらも起きていません。\n\n' +
'「遅い＝サーバーを増強」と考える前に、\n' +
'どのレイヤーで時間を使っているかを必ず確認してください。\n' +
'今回は1台のサーバーで十分で、必要なのは索引1本です。',
null,
'Viewの描画時間は168msです。全体3140msのうち5%程度にすぎません。\n\n' +
'  Completed 200 OK in 3140ms (Views: 168.2ms | ActiveRecord: 2960.4ms)\n\n' +
'Railsのログはこの内訳を毎回出してくれます。\n' +
'「遅い」と言われたら、まずこの行を見て担当レイヤーを決めてください。\n' +
'今回はActiveRecordが94%を占めているので、DB側の問題です。',
'外部API呼び出しは関係ありません。\n\n' +
'外部通信が原因なら、Railsのログの内訳では ActiveRecord にも Views にも計上されず、\n' +
'「全体は長いのに内訳の合計が合わない」という形になります\n' +
'（そして多くの場合 Net::OpenTimeout などの例外が出ます）。\n\n' +
'今回は ActiveRecord が2960msと明示されていて、\n' +
'スロークエリログにも同じ時間のクエリが記録されています。DB内で完結した遅さです。'
    ]
  },

  route: {
    steps: [
      'Railsログの内訳で、どのレイヤーが遅いかを切り分ける',
      'サーバー資源（CPU・メモリ）の問題でないことを確認する',
      'スロークエリログで、遅いクエリを特定する',
      'Rows_sent と Rows_examined の差を見る',
      'EXPLAINで実行計画を確認する（type / key / rows / Extra）',
      'schema.rb と SHOW INDEX で索引の有無を裏取りする',
      '必要な複合索引と、追加するときの注意点を整理する'
    ],
    commands: [
      'grep "Completed 200" log/production.log | tail -n 5',
      'uptime',
      'free -h',
      'tail -n 20 /var/log/mysql/slow.log',
      'grep -c "Query_time" /var/log/mysql/slow.log',
      'mysql -e "SHOW PROCESSLIST"',
      'mysql -e "EXPLAIN SELECT * FROM projects WHERE published = 1 AND area_id = 13 ORDER BY published_at DESC LIMIT 50"',
      'mysql -e "SHOW INDEX FROM projects"',
      'mysql -e "SELECT COUNT(*) FROM projects"',
      'grep -n "index" db/schema.rb',
      'cat app/models/project.rb'
    ],
    note:
'スロークエリログから入っても、SHOW PROCESSLIST から入っても構いません。\n' +
'大事なのは順番です。\n' +
'「どのレイヤーか」を切り分けてからDBへ降り、\n' +
'遅いクエリを特定したら必ずEXPLAINにかける。この流れを手癖にしてください。'
  }
});
})();
