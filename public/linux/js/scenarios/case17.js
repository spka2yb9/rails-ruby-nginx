/* CASE 17 — Railsが必要な環境変数を読み込めているか確認する */
(function () {
'use strict';
var APP = '/var/www/myapp';

var files = {};

files[APP + '/shared/config/app.env'] =
'# systemdのEnvironmentFileとして読み込まれる\n' +
'RAILS_ENV=production\n' +
'RACK_ENV=production\n' +
'RAILS_MAX_THREADS=5\n' +
'REDIS_URL=redis://127.0.0.1:6379/0\n' +
'DATABASE_PASSWORD=pr0d-db-pa55w0rd-DO-NOT-SHARE\n' +
'SECRET_KEY_BASE=8f3c1e9a7b5d2f4068c1a3e5d7b9f0c2a4e6d8b0f2c4a6e8d0b2f4c6a8e0d2b4\n' +
'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\n' +
'# 2026-09-13 キーのrotate作業中に一旦コメントアウト（戻し忘れ注意）\n' +
'# AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n' +
'AWS_REGION=ap-northeast-1\n' +
'AWS_S3_BUCKET=myapp-production-uploads\n';

files['/etc/systemd/system/puma.service.d/env.conf'] =
'[Service]\n' +
'EnvironmentFile=/var/www/myapp/shared/config/app.env\n';

files['/etc/systemd/system/sidekiq.service.d/env.conf'] =
'[Service]\n' +
'EnvironmentFile=/var/www/myapp/shared/config/app.env\n';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T13:40:02.114+09:00 #1433]  INFO -- : [aabbccdd-1122-4334-8556-778899aabbcc] Started POST "/company/projects/8821/images" for 10.0.2.31 at 2026-09-14 13:40:02 +0900\n' +
'I, [2026-09-14T13:40:02.116+09:00 #1433]  INFO -- : [aabbccdd-1122-4334-8556-778899aabbcc] Processing by Company::ImagesController#create as HTML\n' +
'E, [2026-09-14T13:40:02.884+09:00 #1433] ERROR -- : [aabbccdd-1122-4334-8556-778899aabbcc] Aws::Errors::MissingCredentialsError (unable to sign request without credentials set):\n' +
'E, [2026-09-14T13:40:02.884+09:00 #1433] ERROR -- : [aabbccdd-1122-4334-8556-778899aabbcc] app/controllers/company/images_controller.rb:12:in `create\'\n' +
'I, [2026-09-14T13:40:02.886+09:00 #1433]  INFO -- : [aabbccdd-1122-4334-8556-778899aabbcc] Completed 500 Internal Server Error in 772ms\n' +
'I, [2026-09-14T13:52:41.302+09:00 #1434]  INFO -- : [bbccddee-2233-4445-9667-8899aabbccdd] Started GET "/projects" for 10.0.2.18 at 2026-09-14 13:52:41 +0900\n' +
'I, [2026-09-14T13:52:41.410+09:00 #1434]  INFO -- : [bbccddee-2233-4445-9667-8899aabbccdd] Completed 200 OK in 108ms (Views: 70.2ms | ActiveRecord: 14.1ms)\n';

files[APP + '/shared/log/sidekiq.log'] =
'2026-09-14T13:41:10.118Z pid=1502 tid=a12 class=ImageUploadJob jid=7f1c2a9e40db INFO: start\n' +
'2026-09-14T13:41:10.902Z pid=1502 tid=a12 class=ImageUploadJob jid=7f1c2a9e40db ERROR: Aws::Errors::MissingCredentialsError: unable to sign request without credentials set\n' +
'2026-09-14T13:41:11.014Z pid=1502 tid=a12 class=ImageUploadJob jid=7f1c2a9e40db INFO: fail: retrying in 15s\n';

window.LFR.scenarios.add({
  id: 'case17',
  level: 5,
  title: 'Railsが必要な環境変数を読み込めているか確認する',
  subtitle: '値を画面に出さずに「設定されているか」を確かめる',

  description:
'企業アカウントから「求人画像をアップロードできない」という報告がありました。\n\n' +
'production.log にはこう出ています。\n\n' +
'  Aws::Errors::MissingCredentialsError (unable to sign request without credentials set)\n\n' +
'画像以外のページは正常に動いています。\n' +
'昨日、AWSのアクセスキーをrotateする作業が入っていました。\n\n' +
'Railsが必要な環境変数を読み込めているかを確認してください。\n\n' +
'なお、このCASEでは「秘密情報をターミナルに表示しない確認のしかた」も\n' +
'あわせて身につけてください。',

  learn: [
    { name: 'env', cmd: 'env | grep AWS',
      desc: '現在のシェルに設定されている環境変数を一覧します。\n\n' +
            'ただし引数なしの env は、SECRET_KEY_BASE も DATABASE_PASSWORD も\n' +
            'そのまま画面に出します。画面共有中や録画中なら、それで漏れます。\n' +
            '必ず grep で必要な範囲に絞ってから実行してください。' },
    { name: 'printenv', cmd: 'printenv RAILS_ENV',
      desc: '変数名を指定して、その値だけを表示します。\n' +
            '設定されていなければ何も出力せず、終了コードが1になります。\n' +
            'echo $VAR は未設定でも空行が出るだけなので、区別したいときは printenv が確実です。' },
    { name: '名前だけ一覧する', cmd: 'env | cut -d= -f1 | sort',
      desc: '= の左側（変数名）だけを取り出します。\n' +
            '「どの変数が設定されているか」を確認したいだけなら、値は要りません。\n' +
            'これなら画面に秘密情報が出ません。' },
    { name: '値を見ずに存在確認する', cmd: 'env | grep -c AWS_SECRET_ACCESS_KEY',
      desc: '-c は該当した行数だけを返します。0 なら未設定、1 なら設定済みです。\n' +
            '値そのものは画面に出ません。\n\n' +
            '長さだけ確かめたいときはこう書けます。\n' +
            '  printenv SECRET_KEY_BASE | wc -c\n' +
            '本番調査では、これらを反射的に使えるようにしておいてください。' },
    { name: 'systemdの環境変数', cmd: 'cat /etc/systemd/system/puma.service.d/env.conf',
      desc: 'systemd管理のプロセスは、ログインシェルの環境変数を引き継ぎません。\n' +
            'unitの Environment= や EnvironmentFile= で指定されたものだけを受け取ります。\n\n' +
            'つまり「SSHして env を見たら在った」からといって、\n' +
            'Pumaやsidekiqがその値を持っているとは限りません。\n' +
            '実際にどこから読んでいるのかを、必ずファイルで確認してください。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '13:58:20',

  /* rotate作業でコメントアウトされたまま戻っていない */
  envUnset: ['AWS_SECRET_ACCESS_KEY'],
  envVars: { AWS_REGION: 'ap-northeast-1', AWS_S3_BUCKET: 'myapp-production-uploads' },

  journal: {
    sidekiq: [
      'Sep 14 12:00:40 production systemd[1]: Started Sidekiq background worker for myapp (production).',
      'Sep 14 13:41:10 production sidekiq[1502]: ERROR: Aws::Errors::MissingCredentialsError: unable to sign request without credentials set'
    ]
  },

  http: {
    'http://localhost/projects': {
      status: 200, reason: 'OK',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><head><title>求人検索 | Myapp</title></head><body>...</body></html>\n'
    }
  },

  hints: [
    'エラーは「credentialsが設定されていないので署名できない」と言っています。\n' +
    'AWSのcredentialsが、環境変数として渡っているかを確認してください。\n' +
    'ただし、値そのものを画面に出す必要はありません。',

    'env | grep AWS を実行して、AWS関連の変数が何個あるかを見てください。\n' +
    'アクセスキーは ID と SECRET の2つで1組です。両方そろっているでしょうか。\n' +
    'printenv <変数名> でも、1つずつ確認できます。',

    '環境変数がどこから設定されているかも確認してください。\n\n' +
    '  cat /etc/systemd/system/puma.service.d/env.conf\n' +
    '  cat /var/www/myapp/shared/config/app.env\n\n' +
    'そのファイルの中に、コメントアウトされたままの行があります。'
  ],

  probes: [
    { key: 'listedEnv', label: '環境変数を一覧した',
      test: function (c) { return /\benv\b|\bprintenv\b/.test(c); } },
    { key: 'foundMissingKey', label: 'AWS_SECRET_ACCESS_KEY が無いと確認した',
      test: function (c, res) {
        if (!/AWS/.test(c)) return false;
        return /AWS_ACCESS_KEY_ID/.test(res.stdout) && !/AWS_SECRET_ACCESS_KEY=/.test(res.stdout);
      } },
    { key: 'usedSafeCheck', label: '値を表示せずに存在を確認した',
      test: function (c) { return /grep\s+-\w*c|wc\s+-c|cut\s+-d=/.test(c); } },
    { key: 'foundEnvFile', label: '環境変数の供給元（EnvironmentFile）を特定した',
      test: function (c, res) { return /EnvironmentFile/.test(res.stdout); } },
    { key: 'foundCommentedLine', label: 'app.env のコメントアウト行を見つけた',
      test: function (c, res) { return /# AWS_SECRET_ACCESS_KEY/.test(res.stdout); } },
    { key: 'sawAwsError', label: 'ログでAWSの認証エラーを確認した',
      test: function (c, res) { return /MissingCredentialsError/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'sawAwsError',         weight: 8,  label: 'ログで認証エラーを確認した' },
    { key: 'listedEnv',           weight: 8,  label: '環境変数を確認した' },
    { key: 'foundMissingKey',     weight: 18, label: '欠けている変数を特定した' },
    { key: 'foundEnvFile',        weight: 10, label: '環境変数の供給元まで辿った' },
    { key: 'foundCommentedLine',  weight: 12, label: 'コメントアウトされた行を見つけた' },
    { key: 'usedSafeCheck',       weight: 10, label: '値を画面に出さない確認方法を使った' }
  ],

  question: {
    text: '画像アップロードが失敗する原因は？',
    choices: [
      'AWSのアクセスキーが失効している',
      'AWS_SECRET_ACCESS_KEY が環境変数として設定されていない',
      'S3バケットのポリシーが変更され、書き込みが拒否されている',
      'サーバーからS3へのネットワーク経路が塞がれている'
    ],
    answer: 1,
    explain:
'エラーメッセージが、そのまま原因を言っています。\n\n' +
'  Aws::Errors::MissingCredentialsError (unable to sign request without credentials set)\n\n' +
'「credentialsが設定されていないので、リクエストに署名できない」。\n' +
'つまりAWSへ問い合わせる以前の、手元の設定の問題です。\n\n' +
'環境変数を確認すると、ID はあるのに SECRET がありません。\n\n' +
'  $ env | grep AWS\n' +
'  AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\n' +
'  AWS_REGION=ap-northeast-1\n' +
'  AWS_S3_BUCKET=myapp-production-uploads\n\n' +
'  $ printenv AWS_SECRET_ACCESS_KEY\n' +
'  （何も出ない。終了コードは1）\n\n' +
'供給元まで辿ると、原因がはっきりします。\n\n' +
'  $ cat /etc/systemd/system/puma.service.d/env.conf\n' +
'  EnvironmentFile=/var/www/myapp/shared/config/app.env\n\n' +
'  $ grep -n AWS /var/www/myapp/shared/config/app.env\n' +
'  8:AWS_ACCESS_KEY_ID=AKIA...\n' +
'  9:# 2026-09-13 キーのrotate作業中に一旦コメントアウト（戻し忘れ注意）\n' +
'  10:# AWS_SECRET_ACCESS_KEY=...\n\n' +
'rotate作業でコメントアウトしたまま、戻し忘れています。\n' +
'PumaもSidekiqも同じファイルを読むので、両方で同じエラーが出ています。\n\n' +
'--- 確認のしかたについて ---\n\n' +
'ここで大事なのは、SECRET_KEY_BASE や DATABASE_PASSWORD のような値を\n' +
'不用意に画面へ出さないことです。\n' +
'ターミナルの出力は、スクロールバック・画面共有・録画・シェル履歴に残ります。\n' +
'一度漏れた鍵は、rotateするまで漏れたままです。\n\n' +
'安全な確認のしかたを覚えてください。\n\n' +
'  env | cut -d= -f1 | sort              名前だけ一覧する\n' +
'  env | grep -c AWS_SECRET_ACCESS_KEY   在るかどうかだけ（0か1）\n' +
'  printenv SECRET_KEY_BASE | wc -c      長さだけ（未設定なら0）\n\n' +
'引数なしの env は、すべての秘密情報をそのまま表示します。\n' +
'本番サーバーでは、まず grep や cut で絞る癖をつけてください。\n\n' +
'もうひとつ。systemd管理のプロセスは、ログインシェルの環境変数を引き継ぎません。\n' +
'unitの EnvironmentFile= で指定されたものだけを受け取ります。\n' +
'「SSHして env したら在ったのにアプリでは読めない」はここが原因です。\n' +
'アプリが実際に何を読んでいるかは、必ずunitファイルから辿ってください。',
    wrong: [
'キーが失効している場合、AWSは署名されたリクエストを受け取ったうえで拒否します。\n' +
'そのときのエラーは InvalidAccessKeyId や SignatureDoesNotMatch であり、\n' +
'「認証に失敗した」という応答が返ってきます。\n\n' +
'今回のエラーは MissingCredentialsError、\n' +
'つまり「署名するための材料が手元に無い」という段階の失敗です。\n' +
'そもそもAWSへリクエストを送れていません。env で確認してください。',
null,
'バケットポリシーの問題なら、リクエスト自体はAWSに届いたうえで\n' +
'Aws::S3::Errors::AccessDenied が返ります。\n\n' +
'今回はリクエストを送る前段階で失敗しているので、\n' +
'S3側の設定は関係ありません。\n' +
'AWS_S3_BUCKET の値自体は環境変数に設定されています。',
'ネットワークの問題なら、Errno::ETIMEDOUT や Seahorse::Client::NetworkingError、\n' +
'あるいは Net::OpenTimeout のようなタイムアウト系の例外になります。\n\n' +
'また、通信を試みるだけの時間（数秒〜数十秒）がかかるはずですが、\n' +
'ログの Completed 500 は 772ms です。通信する前に失敗しています。'
    ]
  },

  route: {
    steps: [
      'ログでエラークラスを正確に読む（Missing = 手元の問題）',
      '該当する環境変数が設定されているか確認する（値は出さずに）',
      '片方だけ欠けていることを特定する',
      'その環境変数がどこから供給されているかを辿る（systemdのunit）',
      '供給元のファイルを読み、コメントアウトされた行を見つける',
      'Sidekiq側でも同じ症状が出ていることを確認する'
    ],
    commands: [
      'cd /var/www/myapp/current',
      'grep -n "MissingCredentials" log/production.log',
      'env | grep AWS',
      'printenv AWS_SECRET_ACCESS_KEY | wc -c',
      'env | cut -d= -f1 | sort',
      'env | grep -c AWS_SECRET_ACCESS_KEY',
      'cat /etc/systemd/system/puma.service.d/env.conf',
      'grep -n AWS /var/www/myapp/shared/config/app.env',
      'tail -n 5 log/sidekiq.log'
    ],
    note:
'app.env を先に読んでコメントアウト行に気づくルートでも構いません。\n' +
'ただし、そのときも「実際にプロセスへ渡っているか」は env で確認してください。\n' +
'ファイルに書いてあること と 実際に読み込まれていること は別の事実です。\n\n' +
'なお推奨コマンドでは printenv AWS_SECRET_ACCESS_KEY を単体では打たず、\n' +
'| wc -c を付けています。未設定だと分かっている変数でも、\n' +
'値が出るかもしれないコマンドを本番で素のまま打たない、という習慣のためです。'
  }
});
})();
