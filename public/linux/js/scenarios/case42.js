/* CASE 42 — フェイルオーバーのあと、書き込みだけがときどき失敗する
   Aurora のフェイルオーバーでは、reader が新しい writer になり、古い writer は再起動して reader になる。
   クラスターのエンドポイント（DNS の名前）は新しい writer を指すように変わるが、切り替わる前につなぎ直したコネクションは、
   reader になった古い writer につながったまま残る。そのプロセスの書き込みは --read-only で断られ続ける。
   直し方は、そのプロセスを再起動してコネクションを作り直すこと（Puma は phased-restart、Sidekiq は再起動） */
(function () {
'use strict';
var APP = '/var/www/myapp';
var HOME = '/home/deploy';
var MIN = 60000;
var SUFFIX = 'cpcnosrxxxxx.ap-northeast-1.rds.amazonaws.com';
var HOST = 'myapp-prod.cluster-' + SUFFIX;
var READER = 'myapp-prod.cluster-ro-' + SUFFIX;
var I1 = 'myapp-prod-instance-1.' + SUFFIX, I2 = 'myapp-prod-instance-2.' + SUFFIX;
var OLD_IP = '10.0.11.73', NEW_IP = '10.0.12.48';   /* instance-1（古い writer）と instance-2（新しい writer） */
var READ_ONLY = 'The MySQL server is running with the --read-only option so it cannot execute this statement';

var failoverAt = 0;   /* フェイルオーバーが始まった時刻。awsEnv で決める */

function jst(t) { return new Date(t + 9 * 3600000).toISOString().replace('Z', '+09:00'); }
function rid(n) { return ('0000000' + (n * 2246822519 >>> 0).toString(16)).slice(-8) + '-7b2e-4f10-8c3d-' + ('00000000000' + (n * 69069).toString(16)).slice(-12); }
function table(head, rows) {
  var w = head.map(function (h, i) { return Math.max(String(h).length, Math.max.apply(null, rows.map(function (r) { return String(r[i]).length; }).concat([0]))); });
  var line = '+' + w.map(function (n) { return new Array(n + 3).join('-'); }).join('+') + '+';
  function row(r) { return '| ' + r.map(function (v, i) { return typeof v === 'number' ? String(v).padStart(w[i]) : String(v).padEnd(w[i]); }).join(' | ') + ' |'; }
  return [line, row(head), line].concat(rows.map(row)).concat([line]).join('\n');
}

/* このサーバーの、DB へのコネクション。Puma の worker 1434 と Sidekiq は、フェイルオーバーの途中で古い writer につなぎ直した */
function connections(S) {
  var re = S.dbReconnected || {}, list = [], port = 41000, fd = 21;
  function add(proc, pid, n, ip) { for (var i = 0; i < n; i++) list.push({ proto: 'tcp', state: 'ESTAB', recvq: 0, sendq: 0, local: '10.0.1.21:' + (port += 7), peer: ip + ':3306', process: proc, pid: pid, fd: fd + i }); }
  (S.processes || []).forEach(function (p) {
    if (/cluster worker/.test(p.command)) add('ruby', p.pid, 5, p.pid === 1434 && !re.puma ? OLD_IP : NEW_IP);
    else if (/^sidekiq/.test(p.command)) add('ruby', p.pid, 10, re.sidekiq ? NEW_IP : OLD_IP);
  });
  return list;
}

/* つながった先のインスタンスにいる、myapp のコネクション（接続元ごと） */
function sessionsOn(S, t) {
  var conns = connections(S), mine = t.instance === 'myapp-prod-instance-1' ? OLD_IP : NEW_IP;
  var here = conns.filter(function (c) { return c.peer.indexOf(mine + ':') === 0; }).length;
  var rows = [];
  if (here) rows.push(['myapp', '10.0.1.21', here]);
  if (t.writer) rows.push(['myapp', '10.0.2.21', 15]);   /* web-2 はフェイルオーバーのあと、新しい writer につなぎ直していた */
  rows.push(['myapp', '10.0.1.21', 1]);                   /* この mysql 自身 */
  var merged = {};
  rows.forEach(function (r) { var k = r[0] + '\t' + r[1]; merged[k] = (merged[k] || 0) + r[2]; });
  return Object.keys(merged).map(function (k) { return k.split('\t').concat([merged[k]]); });
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

/* phased-restart が使えるよう、preload_app! を使っていない（CASE 21 と同じ） */
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
'bind "unix:///var/www/myapp/shared/tmp/sockets/puma.sock"\n';

files[HOME + '/.my.cnf'] =
'[client]\n' +
'host=' + HOST + '\n' +
'user=myapp\n' +
'password=pr0d-db-pa55w0rd-DO-NOT-SHARE\n' +
'database=myapp_production\n';

files[HOME + '/support/inquiry.md'] =
'# サポートからの連絡\n\n' +
'- 応募しようとすると、ときどき「エラーが発生しました」と出る。もう一度押すと通ることが多い\n' +
'- 求人の検索や閲覧では、エラーは出ていない\n' +
'- web-2（10.0.2.21）のログには、同じエラーが無い（同僚が確認済み）\n';

/* フェイルオーバーの30分前から今までのログ */
files[APP + '/shared/log/production.log'] = function () {
  var L = [], n = 0;
  var PAGES = [['GET', '/jobs', 'JobsController#index'], ['POST', '/entries', 'EntriesController#create'],
               ['GET', '/jobs/48213', 'JobsController#show'], ['POST', '/favorites', 'FavoritesController#create']];
  for (var t = failoverAt - 30 * MIN; t < Date.now() - 30000; t += 61000 + (n % 7) * 9000) {
    var p = PAGES[n % PAGES.length], pid = n % 2 ? 1434 : 1433, r = rid(++n);
    var head = function (lv, s) { return lv + ', [' + jst(t) + ' #' + pid + '] ' + (lv === 'I' ? ' INFO' : 'FATAL') + ' -- : [' + r + '] ' + s; };
    L.push(head('I', 'Started ' + p[0] + ' "' + p[1] + '" for 10.0.1.' + (5 + n % 3) + ' at ' + jst(t).slice(0, 19).replace('T', ' ') + ' +0900'));
    L.push(head('I', 'Processing by ' + p[2] + ' as HTML'));
    var during = t >= failoverAt && t < failoverAt + 30000;
    var error = p[0] === 'POST' && (during ? 'ActiveRecord::ConnectionFailed (Mysql2::Error::ConnectionError: Lost connection to MySQL server during query):'
                                            : t >= failoverAt + 30000 && pid === 1434 ? 'ActiveRecord::StatementInvalid (Mysql2::Error: ' + READ_ONLY + '):' : null);
    if (error) {
      L.push(head('I', 'Completed 500 Internal Server Error in ' + (9 + n % 30) + 'ms (ActiveRecord: ' + (2 + n % 6) + '.3ms | Allocations: 3' + (100 + n % 800) + ')'));
      L.push(head('F', '  '));
      L.push(head('F', error));
      L.push(head('F', '  '));
      L.push(head('F', p[1] === '/entries' ? 'app/models/entry.rb:41:in `create_with_counters!\'' : 'app/controllers/favorites_controller.rb:7:in `create\''));
    } else {
      L.push(head('I', 'Completed ' + (p[0] === 'POST' ? '302 Found' : '200 OK') + ' in ' + (35 + n % 80) + 'ms (Views: ' + (10 + n % 40) + '.2ms | ActiveRecord: ' + (5 + n % 25) + '.7ms | Allocations: 2' + (1000 + n % 900) + ')'));
    }
  }
  return L.join('\n') + '\n';
};

function reconnect(name) {
  return { onUp: function (st) {
    (st.dbReconnected = st.dbReconnected || {})[name] = true;
    /* systemctl restart で起動し直した Sidekiq は、新しい PID で動いている */
    if (name !== 'sidekiq') return;
    (st.processes || []).forEach(function (p) { if (/^sidekiq/.test(p.command)) p.pid = 9612; });
    st.services.sidekiq.mainPid = 9612;
  } };
}

window.LFR.scenarios.add({
  id: 'case42',
  level: 14,
  title: 'フェイルオーバーのあと、書き込みだけがときどき失敗する',
  subtitle: 'reader になった古い writer へのコネクションが残っていることを、DNS とソケットから突き止める',

  description:
'サポートから連絡がありました（~/support/inquiry.md）。\n' +
'応募のボタンを押すと、ときどきエラーになるそうです。もう一度押すと通ることが多いようです。\n\n' +
'このサーバー（Rails の Web サーバー。Puma と Sidekiq）のログと、DB（Aurora MySQL のクラスター myapp-prod）の記録から原因を突き止め、直してください。\n' +
'DB へは mysql -e "<SQL>" でつながります（接続先は ~/.my.cnf に書いてあります）。\n' +
'このサーバーには IAM ロールが付いているので、aws コマンドもそのまま使えます。',

  learn: [
    { name: 'ログでエラーを探す', cmd: 'grep -B3 "read-only" log/production.log | tail -n 8',
      desc: 'MySQL は読み取り専用のインスタンスに書き込もうとすると、ERROR 1290（--read-only）で断ります。\n' +
            'Aurora では reader が読み取り専用です。' },
    { name: 'RDS のイベント', cmd: 'aws rds describe-events --source-type db-cluster --source-identifier myapp-prod --duration 1440',
      desc: 'フェイルオーバーや再起動の記録です。--duration は何分前までさかのぼるか（既定は60分）。\n' +
            'フェイルオーバーでは、reader の1台が新しい writer になり、古い writer は再起動して reader になります。' },
    { name: 'エンドポイントが指す先', cmd: 'dig ' + HOST,
      desc: 'クラスターのエンドポイントはそのときの writer を指す DNS の名前です。\n' +
            'フェイルオーバーで writer が変わると、エンドポイントが指す IP も変わります。' },
    { name: 'プロセスごとの、DB へのコネクション', cmd: 'ss -tnp | grep :3306',
      desc: 'ss はソケットの一覧です。-t は TCP、-n は名前を引かずに数字のまま、-p はプロセスも出します。\n' +
            '-l を付けると待ち受け（LISTEN）だけ、付けなければ接続中のものだけを出します。\n' +
            'どの PID が、どの IP の 3306 につながっているかが分かります。' },
    { name: 'Puma の worker を1つずつ入れ替える', cmd: 'pumactl phased-restart',
      desc: 'worker を1つずつ止めて起動し直すので、サービスを止めずにコネクションを作り直せます。\n' +
            'preload_app! を使っていない構成で使えます（config/puma.rb）。' }
  ],

  startDirectory: APP + '/current',
  clock: 'now',
  files: files,
  dns: (function () {
    var d = {};
    d[HOST] = { cname: I2 };
    d[READER] = { cname: I1 };
    d[I1] = OLD_IP;
    d[I2] = NEW_IP;
    return d;
  })(),
  services: {
    puma: { recovery: reconnect('puma') },
    sidekiq: { recovery: reconnect('sidekiq') }
  },
  db: {
    host: HOST,
    securityGroup: 'myapp-db-sg',
    connections: connections,
    queries: [
      { re: /processlist.*group\s+by/i, out: function (S, t) { return table(['user', 'client', 'COUNT(*)'], sessionsOn(S, t)); } },
      { re: /SHOW\s+(FULL\s+)?PROCESSLIST|from\s+information_schema\.processlist/i, out: function (S, t) {
          var rows = [], id = 9001;
          sessionsOn(S, t).forEach(function (r) { for (var i = 0; i < r[2]; i++) rows.push([id++, r[0], r[1] + ':' + (41000 + i * 7), 'myapp_production', 'Sleep', 4 + i % 30, '', 'NULL']); });
          rows[rows.length - 1] = [id, 'myapp', '10.0.1.21:58201', 'myapp_production', 'Query', 0, 'init', 'SHOW PROCESSLIST'];
          return table(['Id', 'User', 'Host', 'db', 'Command', 'Time', 'State', 'Info'], rows) + '\n' + rows.length + ' rows in set';
        } },
      { re: /Uptime/i, out: function (S, t) { return table(['Variable_name', 'Value'], [['Uptime', String(t.uptime)]]); } },
      { re: /^\s*(insert|update|delete|replace)\b/i, out: function (S, t) {
          return t.writer ? '' : { err: 'ERROR 1290 (HY000) at line 1: ' + READ_ONLY, code: 1 };
        } }
    ]
  },

  awsEnv: function (sim) {
    var now = Date.now();
    failoverAt = Math.floor((now - (6 * 60 + 20) * MIN) / 1000) * 1000;
    var env = sim.railsOnEc2({ maxAcu: 16 });
    var a = sim.aurora(env), c = a.clusters[0];
    c.writer = 'myapp-prod-instance-2';
    c.members[0].readyAt = failoverAt + 19000;   /* 古い writer は、フェイルオーバーで再起動して reader になった */
    a.events.push(
      { at: failoverAt, sourceType: 'db-cluster', id: 'myapp-prod', message: 'Started cross AZ failover to DB instance: myapp-prod-instance-2.', categories: ['failover'] },
      { at: failoverAt + 27000, sourceType: 'db-cluster', id: 'myapp-prod', message: 'Completed failover to DB instance: myapp-prod-instance-2.', categories: ['failover'] }
    );
    return env;
  },

  hints: [
    'まず Rails のログで、500 になったリクエストの理由を見てください。\n\n' +
    '  grep -B3 "read-only" log/production.log | tail -n 8\n\n' +
    'ログの行の #1433 / #1434 は、Puma の worker の PID です。どちらで起きているかを数えてください。',

    'エラーが始まった時刻に、DB で何が起きたかを RDS のイベントで確かめます。\n' +
    '--duration を付けないと、過去60分しか見えません。\n' +
    'あわせて、今どのインスタンスが writer かを describe-db-clusters で確かめます。',

    'クラスターのエンドポイントと各インスタンスのエンドポイントの IP を dig で確かめ、\n' +
    'ss -tnp | grep :3306 で、どの PID がどの IP につながっているかと突き合わせてください。\n' +
    '古い writer（今は reader）につながったままのプロセスを再起動します。'
  ],

  probes: [
    { key: 'foundReadOnly', label: 'ログで --read-only のエラーを見つけた',
      test: function (c, res) { return /production\.log/.test(c) && /read-only option/.test(res.stdout); } },
    { key: 'sawFailover', label: 'RDS のイベントでフェイルオーバーを見つけた',
      test: function (c, res) { return /describe-events/.test(c) && /failover to DB instance/.test(res.stdout); } },
    { key: 'sawWriter', label: '今の writer が instance-2 だと確かめた',
      test: function (c, res) { return /describe-db-clusters/.test(c) && /myapp-prod-instance-2/.test(res.stdout) && /true/i.test(res.stdout); } },
    { key: 'resolvedEndpoints', label: 'エンドポイントが指す IP を確かめた',
      test: function (c, res) { return /^\s*(dig|host|nslookup)\b/.test(c) && /10\.0\.1[12]\.\d+/.test(res.stdout); } },
    { key: 'sawStaleSockets', label: '古い writer につながったままのプロセスを見つけた',
      test: function (c, res) { return /\bss\b/.test(c) && /10\.0\.11\.73:3306/.test(res.stdout); } },
    { key: 'reconnected', label: 'プロセスを再起動し、すべてのコネクションが新しい writer に向いたことを確かめた',
      test: function (c, res, rt) { var re = rt.state.dbReconnected || {}; return /\bss\b/.test(c) && /3306/.test(res.stdout) && !/10\.0\.11\.73:3306/.test(res.stdout) && !!re.sidekiq; } }
  ],

  evidence: [
    { key: 'foundReadOnly',     weight: 10, label: '書き込みが --read-only で断られていることを見つけた' },
    { key: 'sawFailover',       weight: 12, label: 'エラーが始まった時刻にフェイルオーバーがあったと確かめた' },
    { key: 'sawWriter',         weight: 8,  label: '今の writer を確かめた' },
    { key: 'resolvedEndpoints', weight: 10, label: 'エンドポイントとインスタンスの IP を突き合わせた' },
    { key: 'sawStaleSockets',   weight: 14, label: '古い writer につながったままのプロセスを見つけた' },
    { key: 'reconnected',       weight: 12, label: 'コネクションを作り直し、新しい writer に向いたことを確かめた' }
  ],

  question: {
    text: '応募（書き込み）だけが、ときどき失敗する理由は？',
    choices: [
      'フェイルオーバーで、新しい writer の設定が読み取り専用になった',
      'database.yml の host が、読み取り用のエンドポイント（cluster-ro）を指している',
      'フェイルオーバーのあとも、Puma の worker の1つと Sidekiq が、reader になった古い writer へのコネクションを使い続けている',
      'フェイルオーバーで一部のデータが失われ、その行への書き込みが断られている'
    ],
    answer: 2,
    explain:
'ログの 500 は書き込み（POST）のときの「--read-only option so it cannot execute this statement」です。\n' +
'起きているのは Puma の worker 1434 だけで、1433 と web-2 では起きていません。\n' +
'「もう一度押すと通る」のは、次のリクエストが 1433 に振り分けられることがあるためです。\n\n' +
'RDS のイベントを見ると、エラーが始まった時刻にフェイルオーバーがありました。\n' +
'  Started cross AZ failover to DB instance: myapp-prod-instance-2.\n' +
'  Completed failover to DB instance: myapp-prod-instance-2.\n' +
'reader だった instance-2 が writer になり、writer だった instance-1 は再起動して reader になりました。\n\n' +
'クラスターのエンドポイントは writer を指す DNS の名前で、今は instance-2（10.0.12.48）を指しています。\n' +
'ss -tnp で見ると、worker 1434 と Sidekiq のコネクションは、instance-1（10.0.11.73）の 3306 につながっています。\n' +
'フェイルオーバーでコネクションが切れたとき、DNS が新しい writer に切り替わる前につなぎ直したため、\n' +
'reader になった instance-1 につながり、そのままプールに残りました。読み取りは通るので、書き込みだけが失敗します。\n\n' +
'直し方は、古い writer につながっているプロセスのコネクションを作り直すことです。\n' +
'Puma は pumactl phased-restart で worker を1つずつ入れ替え、Sidekiq は systemctl restart sidekiq で起動し直します。\n' +
'ss で、すべてのコネクションが 10.0.12.48 に向いたことを確かめます。\n\n' +
'繰り返さないための対策としては、アプリと DB の間に RDS Proxy を置く方法があります。\n' +
'RDS Proxy はフェイルオーバーのとき新しい writer につなぎ直すので、アプリが DNS の切り替わりを待たずに済みます。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. --read-only のエラーは reader に書き込もうとしたしるし。まず RDS のイベントでフェイルオーバーを探す\n' +
'2. クラスターのエンドポイントは writer を指す DNS の名前。dig で、今どのインスタンスを指しているかを確かめる\n' +
'3. ss -tnp で、プロセスごとに、どの IP につながっているかが分かる\n' +
'4. フェイルオーバーのあとは、古いコネクションが残っていないかを確かめ、残っていればプロセスを再起動する',
    wrong: [
'新しい writer（instance-2）への書き込みは成功しています。\n' +
'worker 1433 と web-2 では、エラーが出ていません。',
'database.yml の host は、クラスターのエンドポイント（cluster-）です。読み取り用（cluster-ro）ではありません。\n' +
'それに、host が読み取り用なら、すべての worker で書き込みが失敗するはずです。',
null,
'データが失われたなら、書き込みの失敗は worker を選ばないはずです。\n' +
'エラーは worker 1434 だけで、内容も「--read-only」です。'
    ]
  },

  route: {
    steps: [
      'サポートの連絡で、書き込みだけが失敗していることを確かめる',
      'Rails のログで、--read-only のエラーと、それが worker 1434 だけで起きていることを確かめる',
      'RDS のイベントでフェイルオーバーを見つけ、今の writer を確かめる',
      'エンドポイントが指す IP と、プロセスごとのコネクションの接続先を突き合わせる',
      'Puma の worker と Sidekiq を再起動し、コネクションが新しい writer に向いたことを確かめる'
    ],
    commands: [
      'cat ~/support/inquiry.md',
      'grep -c "read-only" log/production.log',
      'grep -B3 "read-only" log/production.log | tail -n 8',
      'grep "read-only" log/production.log | cut -d" " -f3 | sort | uniq -c',
      'aws rds describe-events --source-type db-cluster --source-identifier myapp-prod --duration 1440',
      "aws rds describe-db-clusters --db-cluster-identifier myapp-prod --query 'DBClusters[0].DBClusterMembers[].[DBInstanceIdentifier,IsClusterWriter]' --output text",
      'dig +short ' + HOST,
      'dig +short ' + I1,
      'ss -tnp | grep :3306',
      'mysql -h ' + I1 + ' -e "SELECT user, SUBSTRING_INDEX(host, \':\', 1) AS client, COUNT(*) FROM information_schema.processlist GROUP BY user, client"',
      'pumactl phased-restart',
      'sudo systemctl restart sidekiq',
      'ss -tnp | grep :3306'
    ],
    note:
'フェイルオーバーは AWS の保守や障害で、予告なく起きることがあります。\n' +
'起きたあとに --read-only のエラーや接続エラーが続いていないかを確かめる手順を、運用の手順書に入れておいてください。'
  }
});
})();
