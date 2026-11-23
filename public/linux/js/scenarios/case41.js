/* CASE 41 — 消してしまった行を、特定時点への復元（PITR）で戻す
   Aurora の特定時点への復元は、新しいクラスターを作る（インスタンスは作られないので create-db-instance で足す）。
   --restore-to-time は UTC で書く。セキュリティグループを指定しないと、元と同じではなく VPC の default が付く。
   戻すのは消えたテーブルの行だけ。mysqldump を --no-create-info で取り、本番に流し込む
   （CREATE TABLE ごと流すと DROP TABLE が入り、事故のあとに作られた行まで消える） */
(function () {
'use strict';
var APP = '/var/www/myapp';
var HOME = '/home/deploy';
var MIN = 60000;
var HOST = 'myapp-prod.cluster-cpcnosrxxxxx.ap-northeast-1.rds.amazonaws.com';
var OLD = 18240;          /* 消してしまった下書きの数 */
var OLD_MAX_ID = 51234;   /* 消してしまった下書きの id の最大 */
var OLD_812 = 412;
var RECENT = 23;          /* 事故のあとに作られた下書き（id は 51235 から） */

var deleteAt = 0;         /* delete_all を実行した時刻。awsEnv で決める */
var recentAt = [];        /* 事故のあとの下書きが作られた時刻 */

function jstParts(t) { var s = new Date(t + 9 * 3600000).toISOString(); return { day: s.slice(0, 10), time: s.slice(11, 19) }; }
function restoreAt() { return Math.floor(deleteAt / MIN) * MIN - MIN; }   /* 事故の直前の分（の1分前） */

/* mysql の表。日本語（全角）は2文字分の幅で数える */
function cells(v) { return String(v).replace(/[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/g, '  ').length; }
function table(head, rows) {
  var w = head.map(function (h, i) { return Math.max(cells(h), Math.max.apply(null, rows.map(function (r) { return cells(r[i]); }).concat([0]))); });
  var line = '+' + w.map(function (n) { return new Array(n + 3).join('-'); }).join('+') + '+';
  function fill(v, n) { return new Array(n - cells(v) + 1).join(' '); }
  function row(r) { return '| ' + r.map(function (v, i) { return typeof v === 'number' ? fill(v, w[i]) + v : v + fill(v, w[i]); }).join(' | ') + ' |'; }
  return [line, row(head), line].concat(rows.map(row)).concat([line]).join('\n');
}

/* つながった先の job_drafts。old は事故の前からあった行（id ≦ 51234）、recent は事故のあとに作られた行 */
function drafts(S, t) {
  if (t.restoredFrom) {
    var at = t.restoredFrom.time;
    return at < deleteAt ? { old: OLD, recent: 0 } : { old: 0, recent: recentAt.filter(function (x) { return x <= at; }).length };
  }
  return (S.drafts = S.drafts || { old: 0, recent: RECENT });
}
var TITLES = ['営業事務（時短）', '倉庫内の軽作業', 'Web デザイナー', '経理アシスタント', '介護スタッフ（夜勤なし）', 'コールセンター', '保育補助'];
function rowOf(id) {
  var recent = id > OLD_MAX_ID;
  var at = recent ? recentAt[id - OLD_MAX_ID - 1] : deleteAt - (OLD_MAX_ID - id + 1) * 37 * MIN;
  var s = new Date(at + 9 * 3600000).toISOString();
  return [id, recent ? [812, 1203, 77][id % 3] : 300 + id % 900, TITLES[id % TITLES.length], s.slice(0, 10) + ' ' + s.slice(11, 19)];
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

files[HOME + '/notes/incident.md'] = function () {
  var p = jstParts(deleteAt);
  return '# 下書きを消してしまった\n\n' +
    '- 本番サーバーの rails console で、企業 812 の下書き（job_drafts）を消すつもりで、条件を付け忘れて JobDraft.delete_all を実行した\n' +
    '- 戻り値は ' + OLD + '。全企業の下書きが消えた\n' +
    '- 実行したのは ' + p.day + ' ' + p.time + '（日本時間）。直前に date で時刻を確かめていた\n' +
    '- そのあとも、下書きは新しく作られている。消してしまった下書きだけを戻したい\n';
};

window.LFR.scenarios.add({
  id: 'case41',
  level: 14,
  title: '消してしまった下書きを、特定時点への復元で戻す',
  subtitle: 'Aurora のクラスターを事故の直前の時刻で作り、消えた行だけを本番に戻す',

  description:
'同僚が本番の rails console で、全企業の下書き（job_drafts）を消してしまいました（~/notes/incident.md）。\n' +
'消したあとにも、新しい下書きが作られています。\n\n' +
'Aurora の特定時点への復元（ポイントインタイムリカバリ）で、事故の直前の DB を別のクラスターとして作り、\n' +
'消えた下書きだけを本番（myapp-prod）に戻してください。終わったら、復元に使ったクラスターを削除します。\n\n' +
'DB へは mysql -e "<SQL>" でつながります（接続先は ~/.my.cnf に書いてあります）。\n' +
'このサーバーには IAM ロールが付いているので、aws コマンドもそのまま使えます。',

  learn: [
    { name: '復元できる時刻の範囲', cmd: "aws rds describe-db-clusters --db-cluster-identifier myapp-prod --query 'DBClusters[0].{earliest:EarliestRestorableTime,latest:LatestRestorableTime}'",
      desc: 'Aurora はバックアップの保持期間（BackupRetentionPeriod）の間なら、どの時刻の状態にも戻せます。\n' +
            '時刻は UTC で表示されます。日本時間から 9 時間を引いた値です。' },
    { name: '日本時間を UTC に直す', cmd: "date -u -d '2026-11-21 10:41:00 +0900' +%Y-%m-%dT%H:%M:%SZ",
      desc: '-d で時刻を渡し、-u で UTC として表示します。+0900 は「日本時間の値だ」という意味です。\n' +
            '日付をまたぐことがあるので、自分で引き算せずに date に任せます。' },
    { name: '特定時点への復元', cmd: 'aws rds restore-db-cluster-to-point-in-time --source-db-cluster-identifier myapp-prod --db-cluster-identifier myapp-restore --restore-to-time <UTC の時刻> --vpc-security-group-ids <sg-...>',
      desc: '元のクラスターはそのままで、指定した時刻の状態の新しいクラスターを作ります。\n' +
            '設定は元のクラスターと同じですが、セキュリティグループだけは指定しないと VPC の default になります。\n' +
            'クラスターだけが作られるので、続けて create-db-instance でインスタンスを足します。' },
    { name: 'クラスターにインスタンスを足す', cmd: 'aws rds create-db-instance --db-cluster-identifier myapp-restore --db-instance-identifier myapp-restore-instance-1 --db-instance-class db.serverless --engine aurora-mysql',
      desc: 'Serverless v2 のインスタンスは、クラス db.serverless で作ります。\n' +
            'aws rds wait db-instance-available で、使えるようになるまで待ちます。' },
    { name: '行だけを取り出す', cmd: 'mysqldump -h <ホスト> --no-create-info myapp_production job_drafts > job_drafts.sql',
      desc: 'mysqldump は既定ではテーブルを作り直す文（DROP TABLE と CREATE TABLE）も書きます。\n' +
            '--no-create-info（-t）を付けると、行を足す INSERT だけになります。' },
    { name: 'ファイルの SQL を流し込む', cmd: 'mysql myapp_production < job_drafts.sql',
      desc: '< で、ファイルの中身を mysql の標準入力に渡します。' }
  ],

  startDirectory: APP + '/current',
  clock: 'now',
  files: files,
  db: {
    host: HOST,
    securityGroup: 'myapp-db-sg',
    queries: [
      { re: /count\(\*\).*job_drafts/i, out: function (S, t, sql) {
          var d = drafts(S, t);
          var n = /company_id\s*=\s*'?812/i.test(sql) ? (d.old ? OLD_812 : 0) + Math.min(d.recent, 8) : d.old + d.recent;
          return table(['COUNT(*)'], [[n]]);
        } },
      { re: /max\(\s*id\s*\).*job_drafts/i, out: function (S, t) {
          var d = drafts(S, t);
          return table(['MAX(id)'], [[d.recent ? OLD_MAX_ID + d.recent : d.old ? OLD_MAX_ID : 'NULL']]);
        } },
      { re: /from\s+job_drafts/i, out: function (S, t) {
          var d = drafts(S, t), ids = [];
          for (var i = d.recent; i > 0 && ids.length < 5; i--) ids.push(OLD_MAX_ID + i);
          for (var j = d.old ? OLD_MAX_ID : 0; j > 0 && ids.length < 5; j -= 3) ids.push(j);
          if (!ids.length) return '';
          return table(['id', 'company_id', 'title', 'created_at'], ids.map(rowOf));
        } }
    ],

    /* mysqldump。行の中身は、各 INSERT の先頭の2行だけを書く（実物は全部の行が並ぶ） */
    dump: function (S, t, spec) {
      if (spec.database !== 'myapp_production') return { err: "Got error: 1049: Unknown database '" + spec.database + "' when selecting the database", code: 2 };
      if (spec.tables.join(' ') !== 'job_drafts') return { err: '[学習環境] このCASEで再現しているのは、job_drafts だけのダンプです（mysqldump ... myapp_production job_drafts）', code: 2 };
      var d = drafts(S, t);
      var ids = [];
      for (var j = 1; j <= OLD_MAX_ID && d.old; j += Math.floor(OLD_MAX_ID / 6)) ids.push(j);
      for (var i = 1; i <= d.recent; i++) ids.push(OLD_MAX_ID + i);
      var values = function (list) { return list.map(function (id) { var r = rowOf(id); return '(' + r[0] + ',' + r[1] + ",'" + r[2] + "',NULL,'" + r[3] + ".000000','" + r[3] + ".000000')"; }).join(','); };
      var L = [
        '-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)',
        '--',
        '-- Host: ' + t.host + '    Database: myapp_production',
        '-- ------------------------------------------------------',
        '-- Server version\t8.0.39',
        '',
        '/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;',
        '/*!50503 SET NAMES utf8mb4 */;',
        '/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;',
        "/*!40103 SET TIME_ZONE='+00:00' */;",
        '/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;',
        '/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;',
        ''
      ];
      if (!spec.noCreateInfo) L.push(
        '--',
        '-- Table structure for table `job_drafts`',
        '--',
        '',
        'DROP TABLE IF EXISTS `job_drafts`;',
        'CREATE TABLE `job_drafts` (',
        '  `id` bigint NOT NULL AUTO_INCREMENT,',
        '  `company_id` bigint NOT NULL,',
        '  `title` varchar(255) NOT NULL,',
        '  `body` text,',
        '  `created_at` datetime(6) NOT NULL,',
        '  `updated_at` datetime(6) NOT NULL,',
        '  PRIMARY KEY (`id`),',
        '  KEY `index_job_drafts_on_company_id` (`company_id`)',
        ') ENGINE=InnoDB AUTO_INCREMENT=' + (OLD_MAX_ID + d.recent + 1) + ' DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;',
        '');
      L.push('--', '-- Dumping data for table `job_drafts`', '--', '');
      L.push('-- [学習環境] 実物の INSERT には全部の行が並びます。ここでは一部の行だけを書いています（id が ' + OLD_MAX_ID + ' 以下: ' + d.old + ' 行、それより大きい: ' + d.recent + ' 行）');
      L.push('LOCK TABLES `job_drafts` WRITE;', '/*!40000 ALTER TABLE `job_drafts` DISABLE KEYS */;');
      var old = ids.filter(function (id) { return id <= OLD_MAX_ID; }), recent = ids.filter(function (id) { return id > OLD_MAX_ID; });
      if (old.length) L.push('INSERT INTO `job_drafts` VALUES ' + values(old) + ';');
      if (recent.length) L.push('INSERT INTO `job_drafts` VALUES ' + values(recent) + ';');
      L.push('/*!40000 ALTER TABLE `job_drafts` ENABLE KEYS */;', 'UNLOCK TABLES;', '');
      var now = new Date(Date.now() + 9 * 3600000).toISOString();
      L.push('-- Dump completed on ' + now.slice(0, 10) + ' ' + now.slice(11, 19));
      return L.join('\n');
    },

    /* mysql < job_drafts.sql */
    import: function (S, t, sql) {
      var m = sql.match(/以下: (\d+) 行、それより大きい: (\d+) 行/);
      if (!m) return { err: '[学習環境] このCASEで再現しているのは、mysqldump で作った job_drafts のダンプの流し込みだけです', code: 1 };
      if (t.restoredFrom) return '';   /* 復元したクラスターへ流しても、本番は変わらない */
      var old = Number(m[1]), recent = Number(m[2]), d = drafts(S, t);
      var lines = sql.split('\n');
      var lineOf = function (re) { for (var i = 0; i < lines.length; i++) if (re.test(lines[i])) return i + 1; return 0; };
      if (/DROP TABLE IF EXISTS `job_drafts`/.test(sql)) {
        S.drafts = { old: old, recent: recent };   /* テーブルを作り直すので、本番にあった行はダンプの中身に置き換わる */
        return '';
      }
      if (old && d.old) return { err: "ERROR 1062 (23000) at line " + lineOf(/^INSERT/) + ": Duplicate entry '1' for key 'job_drafts.PRIMARY'", code: 1 };
      d.old += old;
      if (recent && d.recent) return { err: "ERROR 1062 (23000) at line " + lineOf(/^INSERT.*\(51235,/) + ": Duplicate entry '51235' for key 'job_drafts.PRIMARY'", code: 1 };
      return '';
    }
  },

  awsEnv: function (sim) {
    var now = Date.now();
    deleteAt = Math.floor((now - 50 * MIN) / 1000) * 1000 + 3000;
    recentAt = [];
    for (var i = 1; i <= RECENT; i++) recentAt.push(deleteAt + Math.round(i * (45 * MIN) / (RECENT + 1)));
    return sim.railsOnEc2({ maxAcu: 16 });
  },

  hints: [
    'まず本番の job_drafts の数を確かめてください（mysql -e "SELECT COUNT(*) FROM job_drafts"）。\n' +
    '残っているのは、事故のあとに作られた下書きだけです。これを消さずに、消えた行を戻します。',

    'メモの時刻は日本時間です。--restore-to-time には UTC の時刻を渡します。\n\n' +
    "  date -u -d '<日付> <時刻> +0900' +%Y-%m-%dT%H:%M:%SZ\n\n" +
    '事故の少し前（1〜2分前）の時刻にします。セキュリティグループは本番のクラスターと同じもの（myapp-db-sg）を指定します。',

    '復元したクラスターにインスタンスを足し、mysql -h <復元したクラスターのエンドポイント> で数を確かめます。\n' +
    'mysqldump に --no-create-info を付けて job_drafts の行だけを取り出し、本番に流し込みます。\n' +
    '最後に、復元したクラスターのインスタンスとクラスターを削除します。'
  ],

  probes: [
    { key: 'readIncident', label: '事故のメモを読んだ',
      test: function (c, res) { return /incident/.test(c) && /delete_all/.test(res.stdout); } },
    { key: 'sawRemaining', label: '本番に残っている下書きの数を確かめた',
      test: function (c, res) { return /mysql\b/.test(c) && !/restore/.test(c) && /job_drafts/i.test(c) && /\|\s+23 \|/.test(res.stdout); } },
    { key: 'convertedToUtc', label: '日本時間を UTC に直した',
      test: function (c, res) { return /^date\b/.test(c.trim()) && /-u/.test(c) && /\+0900|JST/.test(c) && res.exitCode === 0; } },
    { key: 'restoredCluster', label: '事故の前の時刻で、クラスターを復元した',
      test: function (c, res) { return /restore-db-cluster-to-point-in-time/.test(c) && res.exitCode === 0; } },
    { key: 'addedInstance', label: '復元したクラスターにインスタンスを足した',
      test: function (c, res) { return /create-db-instance/.test(c) && /--db-cluster-identifier/.test(c) && res.exitCode === 0; } },
    { key: 'checkedRestored', label: '復元したクラスターに、消えた下書きがあることを確かめた',
      test: function (c, res) { return /mysql\b/.test(c) && /-h/.test(c) && /\b18240\b/.test(res.stdout); } },
    { key: 'dumpedRowsOnly', label: 'テーブルを作り直さない形（--no-create-info）でダンプした',
      test: function (c, res) { return /mysqldump/.test(c) && /--no-create-info|\s-t\b/.test(c) && res.exitCode === 0; } },
    { key: 'restoredAll', label: '本番の下書きが事故の前の分と事故のあとの分の両方そろった',
      test: function (c, res) { return /mysql\b/.test(c) && /job_drafts/i.test(c) && /\b18263\b/.test(res.stdout); } },
    { key: 'cleanedUp', label: '復元に使ったクラスターを削除した',
      test: function (c, res) { return /delete-db-cluster/.test(c) && res.exitCode === 0; } }
  ],

  evidence: [
    { key: 'readIncident',    weight: 6,  label: 'いつ何をしたかを確かめた' },
    { key: 'sawRemaining',    weight: 8,  label: '本番に残っている行（事故のあとの23行）を確かめた' },
    { key: 'convertedToUtc',  weight: 8,  label: '復元する時刻を UTC で決めた' },
    { key: 'restoredCluster', weight: 12, label: '事故の前の時刻でクラスターを復元した' },
    { key: 'addedInstance',   weight: 8,  label: '復元したクラスターにインスタンスを足した' },
    { key: 'checkedRestored', weight: 10, label: '復元した DB に、消えた行があることを確かめた' },
    { key: 'dumpedRowsOnly',  weight: 10, label: '行だけを取り出した' },
    { key: 'restoredAll',     weight: 12, label: '本番で、消えた行と事故のあとの行の両方がそろった' },
    { key: 'cleanedUp',       weight: 4,  label: '復元に使ったクラスターを片付けた' }
  ],

  question: {
    text: '消えた下書きを戻すとき、本番に流し込むダンプを --no-create-info で取ったのはなぜ？',
    choices: [
      '--no-create-info を付けないと、mysqldump が復元したクラスターに接続できないから',
      '付けないとダンプに DROP TABLE と CREATE TABLE が入り、流し込んだときに、事故のあとに作られた23行が消えるから',
      '付けないと、ダンプの文字コードが utf8mb4 にならないから',
      '付けると、復元したクラスターの AUTO_INCREMENT の値が本番に引き継がれるから'
    ],
    answer: 1,
    explain:
'本番の job_drafts には、事故のあとに作られた23行だけが残っていました。\n' +
'戻したいのは、消えた 18240 行です。残っている23行はそのまま残す必要があります。\n\n' +
'Aurora の特定時点への復元は、元のクラスターを書き換えず、指定した時刻の状態の新しいクラスターを作ります。\n' +
'1. メモの時刻（日本時間）を date -u -d で UTC に直し、事故の1分ほど前を --restore-to-time に渡す\n' +
'2. セキュリティグループは本番と同じもの（myapp-db-sg）を指定する。省くと VPC の default が付き、このサーバーからつながらない\n' +
'3. 作られるのはクラスターだけなので、create-db-instance（db.serverless）でインスタンスを足し、wait で待つ\n' +
'4. 復元したクラスターで、job_drafts が 18240 行あることを確かめる\n\n' +
'mysqldump は既定ではテーブルごとに DROP TABLE IF EXISTS と CREATE TABLE を書きます。\n' +
'そのまま本番に流すと、テーブルが作り直され、事故のあとに作られた23行が消えます。\n' +
'--no-create-info を付けると INSERT だけになるので、23行を残したまま、消えた行を足せます。\n' +
'消えた行の id は 51234 以下、事故のあとの行は 51235 からなので、id はぶつかりません。\n\n' +
'流し込んだら本番の数（18263 = 18240 + 23）を確かめ、復元したクラスターはインスタンス、クラスターの順に削除します。\n' +
'残しておくと、その分の費用がかかり続けます。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. Aurora の特定時点への復元は、新しいクラスターを作る。インスタンスは自分で足す\n' +
'2. --restore-to-time は UTC。日本時間からは date -u -d で直す\n' +
'3. 復元のときは、セキュリティグループ（とサブネットグループ）を本番に合わせて指定する\n' +
'4. 本番に戻すのは消えた行だけ。テーブルごと置き換えると、事故のあとの変更が消える\n' +
'5. 本番で一括の削除や更新をするときは、先に件数を数え、条件を付けたまま count で確かめてから実行する',
    wrong: [
'--no-create-info はダンプに書く内容を決めるオプションです。接続には関係しません。',
null,
'文字コードはダンプの先頭の SET NAMES utf8mb4 で決まります。--no-create-info とは関係しません。',
'--no-create-info を付けると CREATE TABLE（と AUTO_INCREMENT の値）は書かれません。\n' +
'本番の AUTO_INCREMENT は、事故のあとの行の続きのまま残ります。'
    ]
  },

  route: {
    steps: [
      '事故のメモで、いつ何をしたかを確かめる',
      '本番の job_drafts に、事故のあとの23行だけが残っていることを確かめる',
      '復元できる時刻の範囲と、本番のセキュリティグループを確かめる',
      '事故の1分ほど前の時刻（UTC）で、クラスターを復元し、インスタンスを足す',
      '復元したクラスターに 18240 行あることを確かめ、--no-create-info で行だけを取り出す',
      '本番に流し込み、18263 行になったことを確かめる',
      '復元に使ったインスタンスとクラスターを削除する'
    ],
    /* 時刻はCASEを開いた時刻から決まるので、開いたときに組み立てる */
    get commands() {
      var p = jstParts(restoreAt());
      var utc = new Date(restoreAt()).toISOString().replace(/\.\d{3}Z$/, 'Z');
      return [
        'cat ~/notes/incident.md',
        'mysql -e "SELECT COUNT(*) FROM job_drafts"',
        "aws rds describe-db-clusters --db-cluster-identifier myapp-prod --query 'DBClusters[0].{earliest:EarliestRestorableTime,latest:LatestRestorableTime,subnets:DBSubnetGroup,sg:VpcSecurityGroups[0].VpcSecurityGroupId}'",
        "date -u -d '" + p.day + ' ' + p.time + " +0900' +%Y-%m-%dT%H:%M:%SZ",
        "SG=$(aws rds describe-db-clusters --db-cluster-identifier myapp-prod --query 'DBClusters[0].VpcSecurityGroups[0].VpcSecurityGroupId' --output text)",
        'aws rds restore-db-cluster-to-point-in-time --source-db-cluster-identifier myapp-prod --db-cluster-identifier myapp-restore --restore-to-time ' + utc + " --vpc-security-group-ids $SG --query 'DBCluster.Status'",
        'aws rds wait db-cluster-available --db-cluster-identifier myapp-restore',
        "aws rds create-db-instance --db-cluster-identifier myapp-restore --db-instance-identifier myapp-restore-instance-1 --db-instance-class db.serverless --engine aurora-mysql --query 'DBInstance.DBInstanceStatus'",
        'aws rds wait db-instance-available --db-instance-identifier myapp-restore-instance-1',
        "RESTORED=$(aws rds describe-db-clusters --db-cluster-identifier myapp-restore --query 'DBClusters[0].Endpoint' --output text)",
        'mysql -h $RESTORED -e "SELECT COUNT(*) FROM job_drafts"',
        'mysqldump -h $RESTORED --no-create-info myapp_production job_drafts > ~/job_drafts.sql',
        'mysql myapp_production < ~/job_drafts.sql',
        'mysql -e "SELECT COUNT(*) FROM job_drafts"',
        "aws rds delete-db-instance --db-instance-identifier myapp-restore-instance-1 --query 'DBInstance.DBInstanceStatus'",
        "aws rds delete-db-cluster --db-cluster-identifier myapp-restore --skip-final-snapshot --query 'DBCluster.Status'"
      ];
    },
    note:
'本番で行を消したり書き換えたりする前に、同じ条件で count を取って件数を確かめてください。\n' +
'特定時点への復元は保持期間（このクラスターは7日）を過ぎると使えません。気づいたらすぐに動きます。'
  }
});
})();
