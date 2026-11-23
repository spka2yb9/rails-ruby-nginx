/* CASE 00 — 本番サーバーへ入る（AWS Session Manager） */
(function () {
'use strict';
var APP = '/var/www/myapp';
var ME = '/Users/i-wada';

var files = {};

files[ME + '/.aws/config'] =
'[default]\n' +
'region = ap-northeast-1\n' +
'output = json\n' +
'\n' +
'[profile jinzai-prod]\n' +
'region = ap-northeast-1\n' +
'sso_session = jinzai\n' +
'sso_account_id = 123456789012\n' +
'sso_role_name = DeveloperAccess\n';

files[ME + '/.ssh/config'] =
'# 2022年までの接続設定。踏み台EC2は廃止済み（#1416）\n' +
'#\n' +
'# Host bastion\n' +
'#   HostName 54.238.xx.xx\n' +
'#   User ec2-user\n' +
'#   IdentityFile ~/.ssh/jinzai-bastion.pem\n' +
'#\n' +
'# Host prod-web\n' +
'#   HostName 10.0.2.50\n' +
'#   User deploy\n' +
'#   ProxyJump bastion\n' +
'\n' +
'Host github.com\n' +
'  User git\n' +
'  IdentityFile ~/.ssh/id_ed25519\n';

files[ME + '/runbook.md'] =
'# 本番サーバー接続手順（要更新）\n' +
'\n' +
'## 1. 踏み台にログインする\n' +
'\n' +
'    ssh bastion\n' +
'\n' +
'## 2. 踏み台から本番webへ\n' +
'\n' +
'    ssh deploy@10.0.2.50\n' +
'\n' +
'## 3. アプリのディレクトリへ\n' +
'\n' +
'    cd /var/www/myapp/current\n' +
'\n' +
'---\n' +
'\n' +
'> 2023-02 追記: 踏み台EC2は終了しました（インスタンス課金と攻撃面の削減）。\n' +
'> 接続経路が変わっています。新しい手順はインフラ担当に確認してください。\n' +
'> port 22 も社外IPからは閉じています。\n';

files[ME + '/work/.keep'] = '';

/* 接続したあとに読むログ。CASE 00 のゴールはここに辿り着くこと */
files[APP + '/shared/log/production.log'] =
'I, [2026-09-15T09:08:41.114+09:00 #1433]  INFO -- : [3c1f2a7e-40d9-4b82-9e15-7a0c2d4e6f80] Started GET "/projects" for 10.0.2.31 at 2026-09-15 09:08:41 +0900\n' +
'I, [2026-09-15T09:08:41.116+09:00 #1433]  INFO -- : [3c1f2a7e-40d9-4b82-9e15-7a0c2d4e6f80] Processing by ProjectsController#index as HTML\n' +
'I, [2026-09-15T09:08:41.228+09:00 #1433]  INFO -- : [3c1f2a7e-40d9-4b82-9e15-7a0c2d4e6f80] Completed 200 OK in 112ms (Views: 70.2ms | ActiveRecord: 14.1ms)\n' +
'I, [2026-09-15T09:10:02.441+09:00 #1434]  INFO -- : [4d2e3f80-51ea-4c93-af26-8b1d3e5f7a91] Started GET "/" for 10.0.2.18 at 2026-09-15 09:10:02 +0900\n' +
'I, [2026-09-15T09:10:02.507+09:00 #1434]  INFO -- : [4d2e3f80-51ea-4c93-af26-8b1d3e5f7a91] Completed 200 OK in 66ms (Views: 43.1ms | ActiveRecord: 10.4ms)\n' +
'I, [2026-09-15T09:11:38.902+09:00 #1433]  INFO -- : [5e3f4091-62fb-4da4-b037-9c2e4f608ba2] Started GET "/projects/8821" for 10.0.2.44 at 2026-09-15 09:11:38 +0900\n' +
'I, [2026-09-15T09:11:38.981+09:00 #1433]  INFO -- : [5e3f4091-62fb-4da4-b037-9c2e4f608ba2] Completed 200 OK in 79ms (Views: 51.0ms | ActiveRecord: 12.8ms)\n';

files[APP + '/shared/log/sidekiq.log'] =
'2026-09-15T09:00:43.110Z pid=1502 tid=3f8 INFO: Starting processing, hit Ctrl-C to stop\n';

window.LFR.scenarios.add({
  id: 'case00',
  level: 0,
  title: '本番サーバーへ入る',
  subtitle: 'SSHでも踏み台でもない。いまの入口はSession Manager',

  description:
'今日からあなたは本番環境を触る権限をもらいました。\n\n' +
'手元のMacから、本番のRailsサーバーへ入ってください。\n' +
'目標は「production.log の末尾を読む」ところまでです。\n\n' +
'手順書（~/runbook.md）は残っていますが、書かれているのは数年前の方法です。\n' +
'そのまま実行しても繋がりません。\n\n' +
'なぜ繋がらないのか、いまの正しい入口はどこかを、コマンドで確かめてください。',

  learn: [
    { name: 'aws sts get-caller-identity', cmd: 'aws sts get-caller-identity',
      desc: '「いま自分はAWS上で誰として認証されているか」を返します。\n' +
            'AWS CLIが期待どおりのアカウント・ロールで動いているかの最初の確認です。\n' +
            '権限まわりでつまずいたら、まずここを見ます。' },
    { name: 'aws ec2 describe-instances', cmd: 'aws ec2 describe-instances',
      desc: 'EC2インスタンスの一覧です。\n' +
            'インスタンスID・名前・状態・プライベートIPが分かります。\n' +
            '「入りたいサーバーのインスタンスIDは何か」を調べるために使います。' },
    { name: 'aws ssm describe-instance-information', cmd: 'aws ssm describe-instance-information',
      desc: 'Session Managerで接続できるインスタンスの一覧です。\n' +
            'SSM Agentが動いていてIAMの権限があるインスタンスだけがOnlineになります。\n' +
            'ここに出てこなければ、そもそもSSMでは入れません。' },
    { name: 'aws ssm start-session', cmd: 'aws ssm start-session --target <instance-id>',
      desc: 'インスタンスへシェルセッションを開きます。\n\n' +
            'SSHとの違いは3つあります。\n' +
            '  ・22番ポートを開ける必要がない（踏み台も要らない）\n' +
            '  ・鍵の配布・失効の運用が不要（認可はIAM）\n' +
            '  ・誰がいつ入ったかがCloudTrailに残る\n\n' +
            'DBへ繋ぎたいときは start-port-forwarding-session でトンネルを張ります。' },
    { name: 'whoami / su', cmd: 'sudo su - deploy',
      desc: 'SSMで入った直後のユーザーは deploy ではありません。\n' +
            'アプリのファイルやプロセスは deploy ユーザーのものなので、\n' +
            '作業前に切り替える必要があります。誰として立っているかを常に意識してください。' },
    { name: 'ssh', cmd: 'ssh deploy@10.0.2.50',
      desc: '昔の手順です。いまは繋がりません。\n' +
            '「繋がらない」ことを自分で確認してから次の手段へ進むのも、立派な調査です。' }
  ],

  /* 手元のMacから始まる */
  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  server: { hostname: 'production', user: 'ssm-user', home: '/usr/bin', cwd: '/usr/bin', prompt: 'sh-5.2$ ' },
  homes: { deploy: '/home/deploy', 'ssm-user': '/usr/bin', root: '/root' },

  files: files,
  now: '09:12:04',

  ssh: { reason: 'Connection timed out' },

  aws: {
    userId: 'AROAEXAMPLEID:i-wada',
    account: '123456789012',
    arn: 'arn:aws:sts::123456789012:assumed-role/DeveloperAccess/i-wada',
    instances: [
      { id: 'i-0a7f3c9e1b5d2048f', name: 'jinzai-prod-web-01',  state: 'running', type: 't3.large',  ip: '10.0.2.50' },
      { id: 'i-0c9f5e1a3d7f426ab', name: 'jinzai-prod-batch',   state: 'running', type: 't3.medium', ip: '10.0.2.80' },
      { id: 'i-0b8e4d0f2c6e3159a', name: 'jinzai-stg-web-01',   state: 'running', type: 't3.large',  ip: '10.0.12.30' }
    ]
  },

  hints: [
    'まず手順書どおりに ssh を試して、何が起きるかを見てください。\n' +
    '繋がらない理由が ~/runbook.md の追記と ~/.ssh/config に書かれています。',

    'AWS CLIから入る経路があります。\n' +
    'まず自分が誰として認証されているかを確認し、次にインスタンスの一覧を見てください。\n' +
    '入りたいのは jinzai-prod-web-01 です。',

    'aws ssm describe-instance-information で接続可能か確認してから、\n\n' +
    '  aws ssm start-session --target i-0a7f3c9e1b5d2048f\n\n' +
    '接続できたら whoami を実行してください。deploy ではないはずです。'
  ],

  probes: [
    { key: 'readRunbook', label: '手順書を読んだ',
      test: function (c, res) { return /踏み台EC2は終了しました|runbook/.test(res.stdout) || /runbook/.test(c); } },
    { key: 'triedSsh', label: 'sshが繋がらないことを自分で確認した',
      test: function (c, res) { return /^\s*ssh\b/.test(c) && /Connection timed out/.test(res.stderr); } },
    { key: 'checkedIdentity', label: 'AWSの認証情報を確認した',
      test: function (c, res) { return /get-caller-identity/.test(c) && /Arn/.test(res.stdout); } },
    { key: 'listedInstances', label: 'インスタンス一覧からIDを調べた',
      test: function (c, res) { return /i-0a7f3c9e1b5d2048f/.test(res.stdout); } },
    { key: 'connectedViaSsm', label: 'Session Managerで接続した',
      test: function (c, res, rt) { return /start-session/.test(c) && rt.state.connected; } },
    { key: 'becameDeploy', label: 'deployユーザーに切り替えた',
      test: function (c, res, rt) { return rt.state.user === 'deploy'; } },
    { key: 'reachedAppLog', label: 'アプリのログまで辿り着いた',
      test: function (c, res) { return /production\.log/.test(c) && res.stdout.length > 0; } }
  ],

  evidence: [
    { key: 'readRunbook',      weight: 6,  label: '手順書を読んで前提を確認した' },
    { key: 'triedSsh',         weight: 10, label: '旧手順が使えないことを確認した' },
    { key: 'checkedIdentity',  weight: 8,  label: 'AWSの認証情報を確認した' },
    { key: 'listedInstances',  weight: 12, label: '接続先のインスタンスIDを調べた' },
    { key: 'connectedViaSsm',  weight: 18, label: 'Session Managerで接続した' },
    { key: 'becameDeploy',     weight: 12, label: 'deployユーザーへ切り替えた' },
    { key: 'reachedAppLog',    weight: 10, label: 'production.log まで辿り着いた' }
  ],

  question: {
    text: 'いまの本番サーバーへの正しい入り方はどれ？',
    choices: [
      '踏み台EC2にSSHして、そこから本番へSSHする',
      'AWS Session Manager（aws ssm start-session）でインスタンスへ直接セッションを開く',
      '本番のセキュリティグループに自分のIPを追加して、22番ポートへ直接SSHする',
      'EC2 Instance Connect で一時鍵を送ってSSHする'
    ],
    answer: 1,
    explain:
'まず、旧手順が使えないことを自分で確認できます。\n\n' +
'  $ ssh deploy@10.0.2.50\n' +
'  ssh: connect to host 10.0.2.50 port 22: Connection timed out\n\n' +
'理由は ~/runbook.md の追記と ~/.ssh/config に残っています。\n' +
'踏み台EC2は廃止され（インスタンス課金と攻撃面の削減）、port 22 も閉じられています。\n' +
'aws ec2 describe-instances を見ても、bastion という名前のインスタンスは存在しません。\n\n' +
'いまの入口は Session Manager です。\n\n' +
'  $ aws sts get-caller-identity\n' +
'  "Arn": "arn:aws:sts::123456789012:assumed-role/DeveloperAccess/i-wada"\n\n' +
'  $ aws ec2 describe-instances\n' +
'  i-0a7f3c9e1b5d2048f  jinzai-prod-web-01  running  t3.large  10.0.2.50\n\n' +
'  $ aws ssm describe-instance-information\n' +
'  i-0a7f3c9e1b5d2048f  jinzai-prod-web-01  Online  Amazon Linux 2023\n\n' +
'  $ aws ssm start-session --target i-0a7f3c9e1b5d2048f\n' +
'  Starting session with SessionId: ...\n' +
'  sh-5.2$\n\n' +
'SSHとの違いは、運用上とても大きいです。\n\n' +
'  ・22番ポートを開けない（インターネットから直接叩かれる面が無くなる）\n' +
'  ・踏み台インスタンスが要らない（常時起動のコストと管理対象が減る）\n' +
'  ・鍵を配らない・失効させない（認可はIAMのロールで行う）\n' +
'  ・誰がいつどのインスタンスに入ったかがCloudTrailに残る\n' +
'  ・DBへはポートフォワード（start-port-forwarding-session）でトンネルを張る\n\n' +
'そして接続直後の自分は deploy ではありません。\n\n' +
'  sh-5.2$ whoami\n' +
'  ssm-user\n\n' +
'アプリのファイルもプロセスも deploy の持ち物なので、作業前に切り替えます。\n\n' +
'  sh-5.2$ sudo su - deploy\n' +
'  deploy@production:~$ cd /var/www/myapp/current\n' +
'  deploy@production:/var/www/myapp/current$ tail -n 5 log/production.log\n\n' +
'この「自分が誰として立っているか」の意識は、このあとの権限まわり（CASE 16）で効いてきます。',
    wrong: [
'踏み台EC2は2023年に廃止されています。\n' +
'~/runbook.md の追記にも「踏み台EC2は終了しました」と書かれており、\n' +
'aws ec2 describe-instances の一覧にも bastion は存在しません。\n\n' +
'~/.ssh/config の Host bastion / ProxyJump の設定はコメントアウトされたまま残っています。\n' +
'古い手順書が残っているのはよくあることです。\n' +
'書いてあるとおりに叩いて繋がらなかったら、まず前提が変わっていないかを疑ってください。',
null,
'これは避けるべき対応です。\n' +
'「繋がらないからセキュリティグループを開ける」は、その場は解決しますが\n' +
'本番の22番をインターネットへ晒すことになります。\n' +
'（過去には旧ベンダーのIPからport22が開いたままになっていた、という指摘もありました）\n\n' +
'開けた穴は閉じ忘れます。そして自宅のIPは変わるので、また開けることになります。\n' +
'Session Managerなら、そもそもポートを開けずに済みます。',
'EC2 Instance Connect も一時鍵を使う正当な方法ですが、\n' +
'結局はネットワーク的に22番へ到達できる必要があります（EIC Endpointを別途用意しない限り）。\n\n' +
'この環境ではSSM Agentが動いていて、\n' +
'aws ssm describe-instance-information にインスタンスがOnlineとして出てきます。\n' +
'すでに用意されている経路を使ってください。'
    ]
  },

  route: {
    steps: [
      '手順書どおりに試して、繋がらないことを確認する',
      'なぜ繋がらないのか（踏み台廃止・22番閉鎖）を資料で裏取りする',
      'AWS CLIの認証情報を確認する',
      '接続先インスタンスのIDを調べる',
      'SSMで接続可能かを確認してからセッションを開く',
      '接続直後のユーザーを確認し、deployへ切り替える',
      'アプリのディレクトリへ移動してログを読む'
    ],
    commands: [
      'cat ~/runbook.md',
      'ssh deploy@10.0.2.50',
      'cat ~/.ssh/config',
      'aws sts get-caller-identity',
      'aws ec2 describe-instances',
      'aws ssm describe-instance-information',
      'aws ssm start-session --target i-0a7f3c9e1b5d2048f',
      'whoami',
      'sudo su - deploy',
      'cd /var/www/myapp/current',
      'tail -n 5 log/production.log'
    ],
    note:
'いきなり aws ssm start-session から入っても構いません。\n' +
'ただし本番では「入れなかったとき」に手が止まります。\n' +
'認証情報・インスタンスID・SSMのOnline状態、この3つを確認する癖をつけておくと、\n' +
'繋がらない理由をその場で切り分けられます。'
  }
});
})();
