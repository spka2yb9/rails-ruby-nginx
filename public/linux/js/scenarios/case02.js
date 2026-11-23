/* CASE 02 — Railsの設定ファイルを確認する */
(function () {
'use strict';
var APP = '/var/www/myapp';
var REL = APP + '/releases/20260914120000';

var files = {};
files[APP + '/shared/config/master.key'] = 'e9c1a3f7b5d2086e4c7a9b1d3f5e7c09\n';
files[REL + '/config/credentials.yml.enc'] =
'YkxQa0Z2S2RtVnpjM2RvY21RNlpHVmxjRE5sWTNKbGRB==\n';
files[REL + '/config/sidekiq.yml'] =
':concurrency: 10\n' +
':queues:\n' +
'  - [critical, 4]\n' +
'  - [default, 2]\n' +
'  - [mailers, 1]\n';
files[REL + '/config/deploy/production.rb'] =
'server "production", user: "deploy", roles: %w[app db web]\n' +
'set :branch, "main"\n' +
'set :rails_env, "production"\n' +
'set :keep_releases, 5\n';

window.LFR.scenarios.add({
  id: 'case02',
  manual: { title: 'GNU Coreutils · cat', url: 'https://www.gnu.org/software/coreutils/manual/coreutils.html#cat-invocation' },
  level: 1,
  title: 'Railsの設定ファイルを読んで、本番の接続先を確かめる',
  subtitle: '設定ファイルから、本番用データベースの接続先を読み取りましょう。',

  guide: [
    { title: '設定ファイルを探す', why: 'この演習はアプリのディレクトリから始まります。設定をまとめた config の中を見ます。',
      commands: ['ls config/'], read: '一覧で database.yml を探します。config/database.yml は「今いる場所の中の config にある database.yml」という意味です。' },
    { title: '本番用の接続先を読む', why: 'cat はファイルの中身を端末に表示します。接続先を聞かれたら、ファイルに書かれた項目名と値を組にして読みます。',
      commands: ['cat config/database.yml'], read: 'production: から下が本番用の設定です。host: の右側が接続するコンピューターの名前、database: の右側がその中で使うデータベースの名前です。' },
    { title: '次のデプロイでも使う設定かを確かめる', why: '前の演習で見たリンクを、設定ファイルにも探してみましょう。',
      commands: ['ls -la config/'], read: 'database.yml の矢印をたどると shared が見つかります。この環境では版を切り替えても、ここに置いた設定を共有します。回答には先ほど読んだ host の値を使います。' }
  ],

  description:
'「本番のDBって、結局どのホストに繋がってるんでしたっけ？」\n\n' +
'チームのSlackで質問が飛びました。手元のリポジトリの config/database.yml を見ても、\n' +
'ホスト名は環境変数やERBで隠されていて、本番の値は分かりません。\n\n' +
'本番サーバーの中には、実際に使われている設定ファイルがあります。\n' +
'それを読んで答えてください。\n\n' +
'なお、Capistrano構成では config/database.yml の置き場所に少しクセがあります。',

  learn: [
    { name: 'cat', cmd: 'cat config/database.yml',
      desc: 'ファイルの中身を丸ごと表示します。\n' +
            '設定ファイルのような短いファイルを読むのに向いています。\n' +
            '逆に、production.log のような巨大ファイルへ使うと画面が全部流れてしまいます。' },
    { name: 'head', cmd: 'head -n 20 config/routes.rb',
      desc: 'ファイルの先頭だけを表示します（既定は10行）。\n' +
            '「このファイルは何者か」をざっと確かめたいときに、catより安全です。' },
    { name: 'tail', cmd: 'tail -n 20 config/routes.rb',
      desc: 'ファイルの末尾だけを表示します。\n' +
            '設定ファイルでは「最後に上書きされた設定」を見るのに使います。\n' +
            'ログでは「直近に起きたこと」を見るのに使います（CASE 03以降で本領を発揮します）。' },
    { name: 'less', cmd: 'less log/production.log',
      desc: 'ファイルをスクロールしながら読むためのページャです。catと違って一気に流れません。\n\n' +
            '  Space / f   次のページ      b   前のページ\n' +
            '  j / k       1行ずつ移動     g / G  先頭 / 末尾\n' +
            '  /文字列     検索            n   次の一致\n' +
            '  q           終了\n\n' +
            '画面に収まる短いファイルはそのまま表示されて終わります。\n' +
            '巨大なproduction.logを開いても、tailと違って前後に自由に動けるのが利点です。' },
    { name: 'ls -la', cmd: 'ls -la config/',
      desc: 'config/ の中もsymbolic linkが混ざっています。\n' +
            '「読んでいるファイルの実体がどこにあるか」を確かめてください。' }
  ],

  startDirectory: APP + '/current',

  hints: [
    'まず config/ の中に何があるかを見てみましょう。\n' +
    'Railsの接続設定は config/database.yml です。',

    'cat config/database.yml を読むと、production: の下に接続先が並んでいます。\n' +
    'adapter / host / database / username を確認してください。',

    'ついでに ls -la config/ も見ておきましょう。\n' +
    'database.yml は release の中の実体ではなく、shared を指していることが分かります。\n' +
    'デプロイしても消えない場所に置く、というCapistranoの作法です。'
  ],

  probes: [
    { key: 'readDatabaseYml', label: 'database.yml を読んだ',
      test: function (c, res) { return /adapter:\s*mysql2/.test(res.stdout); } },
    { key: 'sawSharedLink', label: 'config配下のsymbolic linkに気づいた',
      test: function (c, res) { return /database\.yml ->/.test(res.stdout) || /readlink/.test(c); } },
    { key: 'readOtherConfig', label: '他の設定ファイルも確認した',
      test: function (c, res) { return /(routes\.rb|puma\.rb|sidekiq\.yml|production\.rb)/.test(c) && res.stdout.length > 0; } }
  ],

  evidence: [
    { key: 'readDatabaseYml', weight: 25, label: 'database.yml を実際に読んだ' },
    { key: 'sawSharedLink',   weight: 15, label: 'shared へのsymbolic linkを確認した' },
    { key: 'readOtherConfig', weight: 10, label: '他の設定ファイルにも目を通した' },
    { key: 'exploredFs',      weight: 10, label: 'config配下を歩いて確認した' }
  ],

  question: {
    text: '本番のRailsアプリが接続しているMySQLのホスト名は？',
    choices: [
      'localhost',
      '127.0.0.1',
      'db.internal',
      'myapp-production.rds.amazonaws.com'
    ],
    answer: 2,
    explain:
'cat config/database.yml の production: ブロックにこう書かれています。\n\n' +
'  production:\n' +
'    adapter: mysql2\n' +
'    host: db.internal\n' +
'    database: myapp_production\n' +
'    username: myapp\n' +
'    password: <%= ENV["DATABASE_PASSWORD"] %>\n\n' +
'パスワードはファイルに直書きされておらず、環境変数から読まれています。\n' +
'本番の秘密情報をリポジトリにもファイルにも置かない、という一般的な作り方です。\n' +
'（環境変数が読めているかの確認方法は CASE 17 で扱います）\n\n' +
'あわせて ls -la config/ を見ると、database.yml はこうなっています。\n\n' +
'  lrwxrwxrwx  database.yml -> /var/www/myapp/shared/config/database.yml\n\n' +
'release の中の database.yml は実体ではなく、shared を指すリンクです。\n' +
'デプロイでreleaseが作り直されても、接続設定は shared に残り続けます。',
    wrong: [
'localhost は「同じサーバーの中」を指します。\n' +
'この構成ではMySQLは別ホストで動いており、database.yml にもそう書かれていません。\n' +
'cat config/database.yml で実際の値を確認してください。',
'127.0.0.1 が出てくるのは redis.yml の方です（127.0.0.1:6379）。\n' +
'RedisとMySQLで接続先が違うことは珍しくありません。\n' +
'ファイルごとに確認する癖をつけてください。',
null,
'RDSのエンドポイントのように見えますが、この環境の database.yml には書かれていません。\n' +
'「たぶんRDSだろう」という推測ではなく、必ずファイルの中身で確認してください。'
    ]
  },

  route: {
    steps: [
      'アプリのルートに居ることを確認する',
      'config/ の中身を一覧する',
      'database.yml を読む',
      'ls -la で実体がsharedにあることも確認する'
    ],
    commands: [
      'pwd',
      'ls config',
      'cat config/database.yml',
      'ls -la config',
      'readlink config/database.yml',
      'head -n 20 config/routes.rb',
      'cat config/sidekiq.yml'
    ],
    note:
'grep host config/database.yml のように、必要な行だけ抜く読み方もあります。\n' +
'設定ファイルが長くなるほど、grepで読む方が速くなります。'
  },

  files: files
});
})();
