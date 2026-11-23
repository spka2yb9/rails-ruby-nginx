/* CASE 40 — ときどき Too many connections（Aurora Serverless v2 の max_connections は最大 ACU で決まる）
   Serverless v2 の max_connections は、インスタンスが起動したときの最大 ACU から決まる（最大 ACU 4 なら 135、8 なら 1000）。
   最大 ACU を下げても、再起動するまでは前の値のまま。下げた3週間後のメンテナンスで再起動され、上限が 135 になっていた */
(function () {
'use strict';
var APP = '/var/www/myapp';
var HOME = '/home/deploy';
var MIN = 60000, DAY = 86400000;
var HOST = 'myapp-prod.cluster-cpcnosrxxxxx.ap-northeast-1.rds.amazonaws.com';

/* 日本時間の書き方 */
function jst(t) { return new Date(t + 9 * 3600000).toISOString().replace('Z', '+09:00'); }
function jstDay(t) { var d = new Date(t + 9 * 3600000); return (d.getUTCMonth() + 1) + '月' + d.getUTCDate() + '日'; }
function jstTime(t) { return new Date(t + 9 * 3600000).toISOString().slice(11, 16); }
function rid(n) { return ('0000000' + (n * 2654435761 >>> 0).toString(16)).slice(-8) + '-4c1d-4e2f-9a3b-' + ('00000000000' + (n * 40503).toString(16)).slice(-12); }

var batchAt = 0;   /* 集計バッチを手動で再実行した時刻。awsEnv で決める */

/* バッチの10個のジョブ（Fargate のタスク）。それぞれスレッド10本で、DB のコネクションも10本まで使う */
var BATCH = [['10.0.11.37', 10], ['10.0.11.52', 10], ['10.0.11.88', 10], ['10.0.11.140', 10], ['10.0.11.203', 10],
             ['10.0.12.19', 10], ['10.0.12.61', 10], ['10.0.12.97', 10], ['10.0.12.150', 9], ['10.0.12.211', 9]];
var WEB = [['10.0.1.21', 18], ['10.0.2.21', 18]];   /* このサーバーと web-2（Puma と Sidekiq） */

function table(head, rows) {
  var w = head.map(function (h, i) { return Math.max(String(h).length, Math.max.apply(null, rows.map(function (r) { return String(r[i]).length; }).concat([0]))); });
  var line = '+' + w.map(function (n) { return new Array(n + 3).join('-'); }).join('+') + '+';
  function row(r) { return '| ' + r.map(function (v, i) { return typeof v === 'number' ? String(v).padStart(w[i]) : String(v).padEnd(w[i]); }).join(' | ') + ' |'; }
  return [line, row(head), line].concat(rows.map(row)).concat([line]).join('\n');
}
function variable(name, value) { return table(['Variable_name', 'Value'], [[name, String(value)]]); }

/* 今つながっているコネクション（writer なら 135 本）。最後の1本は、この mysql 自身 */
function sessions(t) {
  var list = [], id = 812001;
  if (t.writer) {
    WEB.forEach(function (w) { for (var i = 0; i < w[1]; i++) list.push([id++, 'myapp', w[0] + ':' + (41000 + i * 7), 'myapp_production', 'Sleep', 3 + (i * 7) % 40, '', 'NULL']); });
    BATCH.forEach(function (b, n) { for (var i = 0; i < b[1]; i++) list.push([id++, 'myapp_batch', b[0] + ':' + (52000 + i * 11), 'myapp_production', i % 3 ? 'Sleep' : 'Query', i % 3 ? 1 : 0, i % 3 ? '' : 'executing', i % 3 ? 'NULL' : 'SELECT `orders`.* FROM `orders` WHERE `orders`.`company_id` = ' + (300 + n * 40 + i)]); });
  }
  list.push([id, 'myapp', '10.0.1.21:58114', 'myapp_production', 'Query', 0, 'init', 'SHOW PROCESSLIST']);
  return list;
}

var files = {};

files[APP + '/shared/config/database.yml'] =
'production:\n' +
'  adapter: mysql2\n' +
'  encoding: utf8mb4\n' +
'  host: ' + HOST + '\n' +
'  database: myapp_production\n' +
'  username: myapp\n' +
'  password: <%= ENV["DATABASE_PASSWORD"] %>\n' +
'  pool: <%= ENV.fetch("RAILS_MAX_THREADS", 5) %>\n';

files[HOME + '/.my.cnf'] =
'[client]\n' +
'host=' + HOST + '\n' +
'user=myapp\n' +
'password=pr0d-db-pa55w0rd-DO-NOT-SHARE\n' +
'database=myapp_production\n';

files[HOME + '/notes/alert.md'] = function () {
  return '# アラート（' + jstTime(batchAt + 2 * MIN) + '）\n\n' +
    '- ALB の 5xx が増えている。ページによらず、ときどき 500 が返る\n' +
    '- このサーバー（10.0.1.21）と web-2（10.0.2.21）の両方で出ている\n';
};

files[HOME + '/notes/batch.md'] = function () {
  return '# 集計バッチ（AWS Batch・Fargate）\n\n' +
    '- 毎晩、深夜に動く。担当する企業を10に分け、10個のジョブを並列に動かす\n' +
    '- 1つのジョブは bin/rails runner で、スレッドを10本使う。DB のコネクションプールも 10（RAILS_MAX_THREADS=10）\n' +
    '- DB のユーザーは myapp_batch\n' +
    '- 今日は営業部の依頼で、' + jstTime(batchAt) + ' に手動で再実行した（いまも動いている）\n';
};

files[HOME + '/notes/cost-review.md'] = function () {
  return '# Aurora の費用の見直し（' + jstDay(Date.now() - 21 * DAY) + '）\n\n' +
    '- myapp-prod の最大 ACU を 16 から 4 に下げた（aws rds modify-db-cluster）\n' +
    '- 過去1か月の ACU はいちばん多いときでも 3 前後だった。CPU にもメモリにも余裕がある\n' +
    '- 下げたあとも、エラーは出ていない\n';
};

files[HOME + '/notes/maintenance.md'] = function () {
  return '# メンテナンスの記録\n\n' +
    '- ' + jstDay(Date.now() - 2.8 * DAY) + ': Aurora のメンテナンス時間に、マイナーバージョンの更新があった。数秒つながらなかったほかは影響なし\n';
};

/* ログ。バッチを動かし始めてから、ときどき新しいコネクションを作れずに 500 になる */
files[APP + '/shared/log/production.log'] = function () {
  var L = [], n = 0;
  var PAGES = [['/jobs', 'JobsController#index', 'app/controllers/jobs_controller.rb:6:in `index\''],
               ['/companies/812', 'CompaniesController#show', 'app/controllers/companies_controller.rb:9:in `show\''],
               ['/entries', 'EntriesController#create', 'app/models/entry.rb:41:in `create_with_counters!\''],
               ['/', 'TopController#index', 'app/controllers/top_controller.rb:4:in `index\'']];
  for (var t = batchAt - 20 * MIN; t < Date.now() - 20000; t += 23000 + (n % 5) * 3100) {
    var p = PAGES[n % PAGES.length], pid = n % 2 ? 1434 : 1433, r = rid(++n);
    var head = function (lv, s) { return lv + ', [' + jst(t) + ' #' + pid + '] ' + (lv === 'I' ? ' INFO' : 'FATAL') + ' -- : [' + r + '] ' + s; };
    var method = p[0] === '/entries' ? 'POST' : 'GET';
    L.push(head('I', 'Started ' + method + ' "' + p[0] + '" for 10.0.1.' + (5 + n % 3) + ' at ' + jst(t).slice(0, 19).replace('T', ' ') + ' +0900'));
    L.push(head('I', 'Processing by ' + p[1] + ' as HTML'));
    if (t > batchAt + 40000 && n % 3 === 0) {
      L.push(head('I', 'Completed 500 Internal Server Error in ' + (4 + n % 9) + 'ms (ActiveRecord: 0.0ms | Allocations: 1' + (300 + n % 400) + ')'));
      L.push(head('F', '  '));
      L.push(head('F', 'ActiveRecord::ConnectionNotEstablished (Too many connections):'));
      L.push(head('F', '  '));
      L.push(head('F', p[2]));
    } else {
      L.push(head('I', 'Completed ' + (method === 'POST' ? '302 Found' : '200 OK') + ' in ' + (38 + n % 70) + 'ms (Views: ' + (12 + n % 30) + '.4ms | ActiveRecord: ' + (6 + n % 20) + '.1ms | Allocations: 2' + (1000 + n % 900) + ')'));
    }
  }
  return L.join('\n') + '\n';
};

window.LFR.scenarios.add({
  id: 'case40',
  level: 14,
  title: 'ときどき Too many connections が出る',
  subtitle: 'Aurora Serverless v2 の max_connections が、最大 ACU と再起動で決まることを突き止める',

  description:
'15分ほど前から、本番のページでときどき 500 エラーが出ています（~/notes/alert.md）。\n' +
'ほぼ同じころ、営業部の依頼で集計バッチを手動で再実行しました（~/notes/batch.md）。\n' +
'このバッチは毎晩も動いていますが、これまで問題になったことはありません。\n\n' +
'このサーバー（Rails の Web サーバー）のログと、DB（Aurora MySQL Serverless v2 のクラスター myapp-prod）の状態から、原因を突き止めてください。\n' +
'DB へは mysql -e "<SQL>" でつながります（接続先は ~/.my.cnf に書いてあります）。\n' +
'このサーバーには IAM ロールが付いているので、aws コマンドもそのまま使えます。',

  learn: [
    { name: 'Rails のログでエラーを数える', cmd: 'grep -c "Too many connections" log/production.log',
      desc: 'MySQL は、つながっているコネクションが max_connections に達すると、新しい接続を断ります（Too many connections）。\n' +
            'Rails（mysql2）はそれを ActiveRecord::ConnectionNotEstablished にして返します。' },
    { name: 'コネクションの上限', cmd: 'mysql -e "SHOW VARIABLES LIKE \'max_connections\'"',
      desc: 'DB が同時に受け付けるコネクションの数です。' },
    { name: '誰がつないでいるか', cmd: 'mysql -e "SELECT user, SUBSTRING_INDEX(host, \':\', 1) AS client, COUNT(*) FROM information_schema.processlist GROUP BY user, client"',
      desc: 'SHOW PROCESSLIST と同じ内容を表として読み、ユーザーと接続元の IP ごとに数えます。\n' +
            'host 列は「IP:ポート」なので、SUBSTRING_INDEX で IP だけを取り出しています。' },
    { name: 'Aurora の容量の範囲', cmd: "aws rds describe-db-clusters --db-cluster-identifier myapp-prod --query 'DBClusters[0].ServerlessV2ScalingConfiguration'",
      desc: 'Serverless v2 は負荷に合わせて最小 ACU と最大 ACU の間で容量を増減します（1 ACU はメモリ約 2 GiB）。\n' +
            'max_connections は今の ACU ではなく最大 ACU から決まります（最大 ACU 4 なら 135、8 なら 1000、16 なら 2000）。' },
    { name: '前回の起動からの秒数', cmd: 'mysql -e "SHOW GLOBAL STATUS LIKE \'Uptime\'"',
      desc: 'max_connections は、インスタンスが起動したときに決まります。\n' +
            '最大 ACU を変えても、インスタンスを再起動するまでは前の値のままです。' },
    { name: '最大 ACU を変えて再起動する', cmd: 'aws rds modify-db-cluster --db-cluster-identifier myapp-prod --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=8',
      desc: 'そのあと aws rds reboot-db-instance で、インスタンスを1台ずつ再起動します。\n' +
            'writer を再起動しても reader は再起動されないので、reader も別に再起動します。\n' +
            '再起動の間（数秒）は、そのインスタンスにつながりません。' }
  ],

  startDirectory: APP + '/current',
  clock: 'now',
  files: files,
  db: {
    host: HOST,
    securityGroup: 'myapp-db-sg',   /* DB にこのセキュリティグループが付いていれば、このサーバーから 3306 に届く */
    queries: [
      { re: /max_connections/i, out: function (S, t, sql) {
          return /^select/i.test(sql) ? table(['@@max_connections'], [[t.maxConnections]]) : variable('max_connections', t.maxConnections);
        } },
      { re: /Max_used_connections/i, out: function (S, t) { return variable('Max_used_connections', t.writer ? 135 : 4); } },
      { re: /Threads_connected/i, out: function (S, t) { return variable('Threads_connected', sessions(t).length); } },
      { re: /Uptime/i, out: function (S, t) { return variable('Uptime', t.uptime); } },
      { re: /processlist.*group\s+by/i, out: function (S, t, sql) {
          var byHost = /group\s+by[^;]*(host|client)/i.test(sql);
          var count = {};
          sessions(t).forEach(function (s) { var k = s[1] + (byHost ? '\t' + s[2].split(':')[0] : ''); count[k] = (count[k] || 0) + 1; });
          var rows = Object.keys(count).map(function (k) { return k.split('\t').concat([count[k]]); });
          return table(byHost ? ['user', 'client', 'COUNT(*)'] : ['user', 'COUNT(*)'], rows);
        } },
      { re: /count\(\*\).*processlist/i, out: function (S, t) { return table(['COUNT(*)'], [[sessions(t).length]]); } },
      { re: /SHOW\s+(FULL\s+)?PROCESSLIST|from\s+information_schema\.processlist/i, out: function (S, t) {
          return table(['Id', 'User', 'Host', 'db', 'Command', 'Time', 'State', 'Info'], sessions(t)) + '\n' + sessions(t).length + ' rows in set';
        } }
    ]
  },

  awsEnv: function (sim) {
    batchAt = Date.now() - 15 * MIN;
    /* 3週間前に最大 ACU を 16 から 4 に下げ、3日前のメンテナンスで再起動された */
    var env = sim.railsOnEc2({ maxAcu: 4, bootedWithMaxAcu: 4, bootedDaysAgo: 2.8 });
    return env;
  },

  hints: [
    'まず Rails のログで、500 の理由を見てください。\n\n' +
    '  grep -B3 "Too many connections" log/production.log | tail -n 8\n\n' +
    'DB が新しいコネクションを断っています。DB の上限（max_connections）と、今いくつつながっているかを確かめます。',

    'コネクションをユーザーと接続元ごとに数えてください。\n\n' +
    '  mysql -e "SELECT user, SUBSTRING_INDEX(host, \':\', 1) AS client, COUNT(*) FROM information_schema.processlist GROUP BY user, client"\n\n' +
    '上限が 135 と小さいことにも注目してください。Serverless v2 では、この値は最大 ACU から決まります。',

    'クラスターの最大 ACU を確かめ（aws rds describe-db-clusters）、~/notes の記録と、DB の Uptime を突き合わせてください。\n' +
    '最大 ACU を下げた日と、上限が 135 になった日は同じではありません。'
  ],

  probes: [
    { key: 'foundTooMany', label: 'ログで Too many connections を見つけた',
      test: function (c, res) { return /production\.log/.test(c) && /Too many connections/.test(res.stdout); } },
    { key: 'sawMaxConnections', label: 'max_connections が 135 だと確かめた',
      test: function (c, res) { return /mysql/.test(c) && /max_connections/.test(c) && /\b135\b/.test(res.stdout); } },
    { key: 'sawBreakdown', label: 'バッチのユーザーがコネクションの大半を使っていると確かめた',
      test: function (c, res) { return /mysql/.test(c) && /myapp_batch/.test(res.stdout); } },
    { key: 'sawMaxAcu', label: 'クラスターの最大 ACU が 4 だと確かめた',
      test: function (c, res) { return /describe-db-clusters/.test(c) && /MaxCapacity"?:?\s*4\b|\b4(\.0)?\s*$/m.test(res.stdout); } },
    { key: 'readCostReview', label: '最大 ACU を下げた記録を読んだ',
      test: function (c, res) { return /cost-review/.test(c) && /16 から 4/.test(res.stdout); } },
    { key: 'checkedUptime', label: 'インスタンスが3日前に再起動したと確かめた',
      test: function (c, res) { return /Uptime/.test(c) && /Uptime\s*\|\s*2\d{5}\b/.test(res.stdout); } },
    { key: 'raisedLimit', label: '最大 ACU を上げて再起動し、max_connections が増えたことを確かめた',
      test: function (c, res) { return /mysql/.test(c) && /max_connections/.test(c) && /\b1000\b/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'foundTooMany',      weight: 10, label: '500 の理由が Too many connections だと突き止めた' },
    { key: 'sawMaxConnections', weight: 12, label: 'DB のコネクションの上限（135）を確かめた' },
    { key: 'sawBreakdown',      weight: 12, label: '誰がどれだけつないでいるかを数えた' },
    { key: 'sawMaxAcu',         weight: 12, label: '最大 ACU（4）を確かめた' },
    { key: 'readCostReview',    weight: 8,  label: '最大 ACU を下げた記録を見つけた' },
    { key: 'checkedUptime',     weight: 8,  label: '上限が変わったのが再起動のときだと確かめた' },
    { key: 'raisedLimit',       weight: 10, label: '最大 ACU を上げ、再起動して上限を戻した' }
  ],

  question: {
    text: 'ときどき 500 が出るようになった理由は？',
    choices: [
      'Aurora の容量（ACU）が足りず、CPU が 100% になってクエリが返らなくなった',
      '最大 ACU を 4 に下げたあとの再起動で max_connections が 135 になり、バッチの 98 本と、Web などの 37 本で上限に達した',
      'Rails のコネクションプール（pool）が小さく、Puma のスレッドがコネクションを待ちきれなかった',
      'バッチが同じ行をロックし続け、Web のクエリがロック待ちで時間切れになった'
    ],
    answer: 1,
    explain:
'ログの 500 はどれも ActiveRecord::ConnectionNotEstablished (Too many connections) です。\n' +
'DB が新しいコネクションを断っています。\n\n' +
'DB の max_connections は 135 で、今は 135 本すべてが使われています。\n' +
'ユーザーごとに数えると、集計バッチ（myapp_batch）が 98 本、myapp（Web の2台の Puma と Sidekiq、それにこの mysql）が 37 本です。\n' +
'バッチは 10 個のジョブがそれぞれ 10 本まで使うので、動いている間は 100 本近くになります。\n\n' +
'Aurora Serverless v2 の max_connections は今の ACU ではなく最大 ACU から決まります。\n' +
'最大 ACU が 4 なら 135、8 なら 1000、16 なら 2000 です。\n' +
'3週間前に費用を下げるため、最大 ACU を 16 から 4 に下げました。\n' +
'max_connections はインスタンスが起動したときに決まるので、そのときは 2000 のままでした。\n' +
'3日前のメンテナンス（Uptime が約3日）で再起動され、135 になりました。\n' +
'ACU のグラフ（CPU やメモリ）には余裕があったので、下げても問題ないように見えていました。\n\n' +
'毎晩のバッチで問題にならなかったのは、夜はリクエストが少なく、Web のコネクションがほとんど残っていないためです\n' +
'（Rails のコネクションプールは、5分使われなかったコネクションを閉じます）。\n' +
'昼にバッチを動かしたので、Web のコネクションと合わせて上限に達しました。\n\n' +
'直し方は2つあり、組み合わせて考えます。\n' +
'1. 最大 ACU を上げて（8 で 1000）、インスタンスを1台ずつ再起動する。\n' +
'   writer を再起動すると数秒つながらないので、時間を選びます。reader は writer と別に再起動が要ります。\n' +
'2. バッチの並列数かプールを減らし、合計を上限より十分少なくする。\n' +
'   今すぐ止めたいなら、手動で動かしたバッチを止めるのがいちばん早い対処です。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. Too many connections は「DB の上限」と「つないでいる側の合計」の比べ合い。両方を数字で確かめる\n' +
'2. コネクションの数は「プロセス × スレッド（プール）」を、Web・Sidekiq・バッチの分すべて足して見積もる\n' +
'3. Aurora Serverless v2 の max_connections は最大 ACU で決まり、再起動したときに変わる\n' +
'4. 設定を変えた日と、値が変わった日がずれることがある。Uptime やメンテナンスの記録で突き合わせる',
    wrong: [
'CPU が足りないなら、クエリが遅くなり、Completed の行の ActiveRecord の時間が延びるはずです。\n' +
'500 の理由は Too many connections で、DB に接続できていません。\n' +
'max_connections（135）と、今のコネクションの数（135）を比べてください。',
null,
'Rails のプールが足りないときは、ActiveRecord::ConnectionTimeoutError（could not obtain a connection from the pool）になります。\n' +
'今回のエラーは、DB が接続そのものを断ったときの ConnectionNotEstablished (Too many connections) です。',
'ロック待ちなら、Lock wait timeout exceeded が出ます。\n' +
'今回はそもそも DB に接続できていません。'
    ]
  },

  route: {
    steps: [
      'アラートとバッチのメモで、いつ何をしたかを確かめる',
      'Rails のログで、500 の理由が Too many connections だと確かめる',
      'DB の max_connections と、ユーザー・接続元ごとのコネクションの数を確かめる',
      'クラスターの最大 ACU を確かめ、費用の見直しとメンテナンスの記録、Uptime と突き合わせる',
      '最大 ACU を 8 に上げ、インスタンスを1台ずつ再起動して、max_connections が増えたことを確かめる'
    ],
    commands: [
      'cat ~/notes/alert.md',
      'cat ~/notes/batch.md',
      'grep -c "Too many connections" log/production.log',
      'grep -B3 "Too many connections" log/production.log | tail -n 8',
      'mysql -e "SHOW VARIABLES LIKE \'max_connections\'"',
      'mysql -e "SELECT user, SUBSTRING_INDEX(host, \':\', 1) AS client, COUNT(*) FROM information_schema.processlist GROUP BY user, client"',
      "aws rds describe-db-clusters --db-cluster-identifier myapp-prod --query 'DBClusters[0].{scaling:ServerlessV2ScalingConfiguration,members:DBClusterMembers[].[DBInstanceIdentifier,IsClusterWriter]}'",
      'cat ~/notes/cost-review.md',
      'cat ~/notes/maintenance.md',
      'mysql -e "SHOW GLOBAL STATUS LIKE \'Uptime\'"',
      'aws rds modify-db-cluster --db-cluster-identifier myapp-prod --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=8 --query \'DBCluster.ServerlessV2ScalingConfiguration\'',
      'mysql -e "SHOW VARIABLES LIKE \'max_connections\'"',
      'aws rds reboot-db-instance --db-instance-identifier myapp-prod-instance-2 --query \'DBInstance.DBInstanceStatus\'',
      'aws rds wait db-instance-available --db-instance-identifier myapp-prod-instance-2',
      'aws rds reboot-db-instance --db-instance-identifier myapp-prod-instance-1 --query \'DBInstance.DBInstanceStatus\'',
      'aws rds wait db-instance-available --db-instance-identifier myapp-prod-instance-1',
      'mysql -e "SHOW VARIABLES LIKE \'max_connections\'"'
    ],
    note:
'最大 ACU を下げる前に、Web・Sidekiq・バッチのコネクションの合計を見積もり、下げたあとの max_connections と比べてください。\n' +
'最大 ACU を変えたら、再起動するまで max_connections は変わりません。再起動の予定も一緒に決めます。'
  }
});
})();
