/* CASE 15 — Pumaが起動できなかった原因をjournalctlから探す */
(function () {
'use strict';
var APP = '/var/www/myapp';
var REL = APP + '/releases/20260914153000';
var base = window.LFR.base;

var files = {};

files[REL + '/Gemfile'] =
'source "https://rubygems.org"\n' +
'ruby "3.3.4"\n' +
'\n' +
'gem "rails", "~> 7.2.1"\n' +
'gem "mysql2"\n' +
'gem "puma", "~> 6.4"\n' +
'gem "redis", "~> 5.0"\n' +
'gem "sidekiq", "~> 7.2"\n' +
'gem "aws-sdk-s3"\n' +
'gem "image_processing", "~> 1.12"\n';
files[REL + '/REVISION'] = '7d4b9e1fa2c83506e9d1b4f7a0c25839e6b1d0c4\n';
files[REL + '/config/routes.rb'] = base.files[APP + '/releases/20260914120000/config/routes.rb'];
files[REL + '/vendor/bundle/ruby/3.3.0/gems/.keep'] = '';

files['/home/deploy/deploy.log'] =
'15:29:02 deploy:updating\n' +
'      ✔ 01 deploy@production 0.412s\n' +
'15:29:41 bundler:install\n' +
'      01 bundle install --path vendor/bundle --without development test\n' +
'      01 Fetching image_processing 1.12.2\n' +
'      01 Gem::RemoteFetcher::FetchError: Errno::ETIMEDOUT: Connection timed out - rubygems.org\n' +
'      01 An error occurred while installing image_processing (1.12.2)\n' +
'      ✘ 01 deploy@production 62.118s\n' +
'15:30:44 [警告] bundler:install に失敗しましたが、リリースは作成済みです\n' +
'15:31:02 deploy:symlink:release   ← 手動で実行した\n' +
'      ✔ 01 deploy@production 0.184s\n' +
'15:31:20 sudo systemctl restart puma\n';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T15:28:44.114+09:00 #1433]  INFO -- : [e0f1a2b3-c4d5-46e7-8f90-1a2b3c4d5e6f] Started GET "/projects" for 10.0.2.31 at 2026-09-14 15:28:44 +0900\n' +
'I, [2026-09-14T15:28:44.221+09:00 #1433]  INFO -- : [e0f1a2b3-c4d5-46e7-8f90-1a2b3c4d5e6f] Completed 200 OK in 107ms (Views: 70.1ms | ActiveRecord: 14.2ms)\n';

files['/var/log/nginx/error.log'] =
'2026/09/14 15:31:44 [error] 781#781: *1301 connect() to unix:/var/www/myapp/shared/tmp/sockets/puma.sock failed (111: Connection refused) while connecting to upstream, client: 10.0.2.31, server: myapp.example.jp, request: "GET /projects HTTP/1.1"\n' +
'2026/09/14 15:34:12 [error] 781#781: *1310 connect() to unix:/var/www/myapp/shared/tmp/sockets/puma.sock failed (111: Connection refused) while connecting to upstream, client: 10.0.2.18, server: myapp.example.jp, request: "GET / HTTP/1.1"\n';

var symlinks = {};
symlinks[REL + '/log'] = APP + '/shared/log';
symlinks[REL + '/tmp'] = APP + '/shared/tmp';
symlinks[APP + '/current'] = REL;

window.LFR.scenarios.add({
  id: 'case15',
  level: 4,
  title: 'Pumaが起動できなかった原因をjournalctlから探す',
  subtitle: '「落ちた」ではなく「起動できなかった」ときの読み方',

  description:
'デプロイの直後から、サイト全体が 502 Bad Gateway になっています。\n\n' +
'Railsのログ（production.log）は 15:28 で止まっていて、\n' +
'そのあとの行が1つも増えていません。\n\n' +
'Railsまでリクエストが届いていないので、production.log を眺めていても何も出てきません。\n' +
'こういうときに読むべきログは別の場所にあります。\n\n' +
'Pumaが起動できなかった理由を突き止めてください。',

  learn: [
    { name: 'journalctl -u', cmd: 'journalctl -u puma',
      desc: 'systemdが収集した、そのサービスの標準出力・標準エラーを読みます。\n\n' +
            'Railsのログは「Railsが起動したあと」の記録です。\n' +
            '起動そのものに失敗した場合、production.log には何も残りません。\n' +
            'その場合の唯一の手がかりが journalctl です。' },
    { name: '行数を絞る', cmd: 'journalctl -u puma -n 30',
      desc: '-n で末尾の行数を指定します。まずは末尾30行、が定番です。\n' +
            '起動失敗の原因は、たいてい「失敗した」という行の数行上にあります。' },
    { name: 'systemctl status', cmd: 'systemctl status puma',
      desc: 'Active: failed (Result: exit-code) と、Process: の行に注目します。\n' +
            'status=1/FAILURE のような終了コードと、実行されたコマンドが分かります。\n' +
            'status行の下には、journalの末尾も一緒に表示されます。' },
    { name: '設定と依存を確認する', cmd: 'cat Gemfile',
      desc: 'エラーメッセージに出てくるgem名を、Gemfileで確認します。\n' +
            '「いつ追加されたgemか」が分かると、原因の見当が付きます。' },
    { name: 'nginxのエラーログ', cmd: 'tail -n 10 /var/log/nginx/error.log',
      desc: '502のときは、nginxが「upstreamに繋がらなかった」と記録しています。\n' +
            'Railsまで届いていないことの裏付けになります。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  symlinks: symlinks,
  now: '15:36:18',

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'failed', result: 'exit-code',
      since: 'Mon 2026-09-14 15:31:24 JST', ago: '4min 54s ago',
      mainPid: 9310, lastPid: 9310, exitCode: 1,
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb'
    }
  },

  journal: {
    puma: [
      'Sep 14 15:28:02 production systemd[1]: Started Puma HTTP Server for myapp (production).',
      'Sep 14 15:31:20 production systemd[1]: Stopping Puma HTTP Server for myapp (production)...',
      'Sep 14 15:31:21 production systemd[1]: Stopped Puma HTTP Server for myapp (production).',
      'Sep 14 15:31:22 production systemd[1]: Starting Puma HTTP Server for myapp (production)...',
      'Sep 14 15:31:23 production puma[9310]: bundler: failed to load command: puma (/var/www/myapp/shared/bundle/ruby/3.3.0/bin/puma)',
      'Sep 14 15:31:23 production puma[9310]: Bundler::GemNotFound: Could not find image_processing-1.12.2 in locally installed gems',
      'Sep 14 15:31:23 production puma[9310]:   Run `bundle install` to install missing gems.',
      'Sep 14 15:31:24 production systemd[1]: puma.service: Main process exited, code=exited, status=1/FAILURE',
      'Sep 14 15:31:24 production systemd[1]: puma.service: Failed with result \'exit-code\'.',
      'Sep 14 15:31:24 production systemd[1]: Failed to start Puma HTTP Server for myapp (production).'
    ]
  },

  processes: base.processes.filter(function (p) { return !/puma/.test(p.command); }),

  http: {
    'http://localhost/': {
      status: 502, reason: 'Bad Gateway',
      headers: { 'content-type': 'text/html', server: 'nginx/1.24.0' },
      body: '<html><head><title>502 Bad Gateway</title></head><body><center><h1>502 Bad Gateway</h1></center><hr><center>nginx/1.24.0</center></body></html>\n'
    },
    'http://localhost/projects': {
      status: 502, reason: 'Bad Gateway',
      headers: { 'content-type': 'text/html', server: 'nginx/1.24.0' },
      body: '<html><head><title>502 Bad Gateway</title></head><body><center><h1>502 Bad Gateway</h1></center><hr><center>nginx/1.24.0</center></body></html>\n'
    }
  },

  hints: [
    'production.log が途中で止まっているということは、\n' +
    'Railsが起動していない（＝リクエストを受け取れていない）ということです。\n' +
    'Rails自身が書けないログは、誰が書いているでしょうか。',

    'systemctl status puma を実行してください。Active: failed になっています。\n' +
    'そのうえで journalctl -u puma を読んでください。\n' +
    'Pumaが標準エラーに吐いたメッセージが、そのまま残っています。',

    'journalctl -u puma -n 20 の中に、\n' +
    'bundler: failed to load command: puma という行があります。\n' +
    'その次の行に、何が見つからなかったかが書かれています。\n' +
    'gem名が分かったら、Gemfile と ~/deploy.log も確認してください。'
  ],

  probes: [
    { key: 'sawPumaFailed', label: 'Pumaがfailedであることを確認した',
      test: function (c, res) { return /Active: .*failed|failed \(Result/.test(res.stdout); } },
    { key: 'readJournal', label: 'journalctlでPumaのログを読んだ',
      test: function (c) { return /journalctl/.test(c); } },
    { key: 'foundGemNotFound', label: 'Bundler::GemNotFound を見つけた',
      test: function (c, res) { return /GemNotFound|Could not find image_processing/.test(res.stdout); } },
    { key: 'sawGemfile', label: 'Gemfileで該当gemを確認した',
      test: function (c, res) { return /image_processing/.test(res.stdout) && /Gemfile/.test(c); } },
    { key: 'sawBundleFailure', label: 'デプロイでbundle installが失敗していたと確認した',
      test: function (c, res) { return /bundler:install|An error occurred while installing/.test(res.stdout); } },
    { key: 'reproduced502', label: 'curl / nginxログで502を確認した',
      test: function (c, res) { return /502|puma\.sock failed/.test(res.stdout + res.stderr); } }
  ],

  evidence: [
    { key: 'sawPumaFailed',     weight: 10, label: 'Pumaがfailedだと確認した' },
    { key: 'readJournal',       weight: 10, label: 'journalctlを読んだ' },
    { key: 'foundGemNotFound',  weight: 18, label: '起動失敗の直接原因を特定した' },
    { key: 'sawGemfile',        weight: 10, label: 'Gemfileで該当gemを確認した' },
    { key: 'sawBundleFailure',  weight: 12, label: 'デプロイ工程まで遡って原因を確認した' },
    { key: 'reproduced502',     weight: 8,  label: '502の症状を確認した' }
  ],

  question: {
    text: 'Pumaが起動できなかった直接の原因は？',
    choices: [
      'データベースに接続できず、起動時のマイグレーション確認で失敗した',
      '必要なgemがインストールされておらず、bundlerがpumaのロードに失敗した',
      '3000番ポートが他のプロセスと競合している',
      'puma.rb に文法エラーがあり、設定ファイルを読み込めなかった'
    ],
    answer: 1,
    explain:
'production.log は15:28で止まっています。Railsが起動していないので当然です。\n' +
'起動前に何が起きたかは、systemdが持っています。\n\n' +
'  $ systemctl status puma\n' +
'  × puma.service - Puma HTTP Server for myapp (production)\n' +
'       Active: failed (Result: exit-code) since Mon 2026-09-14 15:31:24 JST\n' +
'      Process: 9310 ExecStart=... (code=exited, status=1/FAILURE)\n\n' +
'  $ journalctl -u puma -n 20\n' +
'  puma[9310]: bundler: failed to load command: puma\n' +
'  puma[9310]: Bundler::GemNotFound: Could not find image_processing-1.12.2 in locally installed gems\n' +
'  puma[9310]:   Run `bundle install` to install missing gems.\n' +
'  systemd[1]: puma.service: Main process exited, code=exited, status=1/FAILURE\n\n' +
'bundlerが Gemfile.lock に書かれた image_processing を見つけられず、\n' +
'pumaコマンドそのものをロードできずに終了しています。\n\n' +
'Gemfile を見ると、今回のデプロイで追加されたgemだと分かります。\n\n' +
'  gem "image_processing", "~> 1.12"\n\n' +
'~/deploy.log には、そのgemのインストールが失敗していた記録があります。\n\n' +
'  15:29:41 bundler:install\n' +
'  Gem::RemoteFetcher::FetchError: Errno::ETIMEDOUT - rubygems.org\n' +
'  An error occurred while installing image_processing (1.12.2)\n' +
'  ✘ deploy@production\n' +
'  15:31:02 deploy:symlink:release   ← 手動で実行した\n\n' +
'つまり、bundle install が失敗したにもかかわらず、\n' +
'symlinkの張り替えだけを手動で実行して新releaseへ切り替えてしまいました。\n' +
'gemが揃っていないreleaseが本番になり、Pumaが起動できなくなった、という流れです。\n\n' +
'このCASEで身につけたいのは1点です。\n' +
'**Railsのログが増えていないときは、Railsのログを見ても答えは出ない。**\n' +
'そのときは systemctl status と journalctl -u を読んでください。',
    wrong: [
'DBの問題ではありません。\n' +
'systemctl status mysql は active (running) で、\n' +
'journalctl -u puma にも接続エラー（Mysql2::Error等）は出ていません。\n\n' +
'そもそもDB接続はRailsが起動してから行われます。\n' +
'今回はその手前、bundlerがpumaコマンドをロードする段階で失敗しています。',
null,
'ポート競合ではありません。\n' +
'競合していれば Errno::EADDRINUSE: Address already in use と出ます。\n' +
'journalctl -u puma に出ているのは Bundler::GemNotFound です。\n\n' +
'またこの構成のPumaはTCPポートではなくUNIXソケットを使います\n' +
'（shared/config/puma.rb の bind 行）。ss -lntp でも3000番は使われていません。',
'設定ファイルの文法エラーではありません。\n' +
'その場合は SyntaxError や NoMethodError が puma.rb の行番号付きで出ます。\n\n' +
'今回のエラーは Bundler::GemNotFound で、\n' +
'そもそも puma コマンド自体をロードできていません（設定を読む手前です）。\n' +
'cat /var/www/myapp/shared/config/puma.rb を見ても、変更されていません。'
    ]
  },

  route: {
    steps: [
      '502の症状を確認する（curl / nginxのエラーログ）',
      'production.log が止まっている＝Railsが起動していないと判断する',
      'systemdの状態を見る（systemctl status puma → failed）',
      'サービス自身のログを読む（journalctl -u puma）',
      'エラーメッセージからgem名を特定する',
      'Gemfile とデプロイログで、いつ・なぜ足りないのかを確認する'
    ],
    commands: [
      'curl -I http://localhost/',
      'tail -n 5 log/production.log',
      'tail -n 5 /var/log/nginx/error.log',
      'systemctl status puma',
      'journalctl -u puma -n 20',
      'grep -n "image_processing" Gemfile',
      'cat ~/deploy.log',
      'readlink current'
    ],
    note:
'nginxのエラーログから入っても、systemctlから入っても構いません。\n' +
'覚えてほしいのは、ログの探し方の分岐です。\n\n' +
'  Railsのログが増えている → アプリの中の問題。production.log を読む\n' +
'  Railsのログが増えていない → 起動前の問題。journalctl を読む'
  }
});
})();
