/* CASE 44 — Parameter Store の値を変えたのに、メールが送れないまま
   本番サーバーの環境変数は、デプロイのときに Parameter Store から作るファイル（app.env）を、systemd が EnvironmentFile として
   サービスを起動するときに読む。Parameter Store を変えただけでは app.env も、動いているプロセスの環境変数も変わらない。
   app.env を作り直し、プロセスを起動し直す（systemctl restart）。Puma の phased-restart では master の環境変数が残る */
(function () {
'use strict';
var APP = '/var/www/myapp';
var REL = APP + '/releases/20260914120000';
var HOME = '/home/deploy';
var MIN = 60000;
var OLD_USER = 'AKIAEXAMPLESMTPOLD01', NEW_USER = 'AKIAEXAMPLESMTPNEW02';
var OLD_PASS = 'BOldExampleSesSmtpPassword0000000000000000a', NEW_PASS = 'BNewExampleSesSmtpPassword0000000000000000b';
var FETCH = "aws ssm get-parameters-by-path --path /myapp/prod --with-decryption --query 'Parameters[].[Name,Value]' --output text | sed 's|^/myapp/prod/||; s|\\t|=|' > " + APP + '/shared/config/app.env';

var rotatedAt = Date.now() - 95 * MIN;   /* 認証情報を作り直して、Parameter Store を更新した時刻 */

function jstClock(t) { var s = new Date(t + 9 * 3600000).toUTCString().split(' '); return s[2] + ' ' + Number(s[1]) + ' ' + s[4]; }
function iso(t) { return new Date(t).toISOString(); }

var files = {};

files[APP + '/shared/config/app.env'] =
'DATABASE_PASSWORD=pr0d-db-pa55w0rd-DO-NOT-SHARE\n' +
'RAILS_MASTER_KEY=0f3c9a7e51b24d6c8e1f2a3b4c5d6e7f\n' +
'SMTP_PASSWORD=' + OLD_PASS + '\n' +
'SMTP_USERNAME=' + OLD_USER + '\n';

files['/etc/systemd/system/puma.service'] =
'[Unit]\n' +
'Description=Puma HTTP Server for myapp (production)\n' +
'After=network.target\n\n' +
'[Service]\n' +
'Type=simple\n' +
'User=deploy\n' +
'WorkingDirectory=/var/www/myapp/current\n' +
'EnvironmentFile=/var/www/myapp/shared/config/app.env\n' +
'ExecStart=/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb\n' +
'Restart=on-failure\n\n' +
'[Install]\n' +
'WantedBy=multi-user.target\n';

files['/etc/systemd/system/sidekiq.service'] =
'[Unit]\n' +
'Description=Sidekiq background worker for myapp (production)\n\n' +
'[Service]\n' +
'Type=notify\n' +
'User=deploy\n' +
'WorkingDirectory=/var/www/myapp/current\n' +
'EnvironmentFile=/var/www/myapp/shared/config/app.env\n' +
'ExecStart=/home/deploy/.rbenv/shims/bundle exec sidekiq -e production\n' +
'TimeoutStopSec=30\n' +
'Restart=on-failure\n\n' +
'[Install]\n' +
'WantedBy=multi-user.target\n';

files[REL + '/config/deploy.rb'] =
'set :application, "myapp"\n' +
'set :deploy_to, "/var/www/myapp"\n' +
'append :linked_files, "config/app.env"\n\n' +
'# 秘密情報は Parameter Store の /myapp/prod/ に置く。デプロイのたびに shared/config/app.env を作り直す\n' +
'namespace :env do\n' +
'  task :fetch do\n' +
'    on roles(:app) do\n' +
'      execute %(' + FETCH.replace(APP + '/shared', '#{shared_path}') + ')\n' +
'    end\n' +
'  end\n' +
'end\n' +
'before "deploy:symlink:linked_files", "env:fetch"\n';

files[REL + '/config/environments/production.rb'] =
'Rails.application.configure do\n' +
'  config.action_mailer.delivery_method = :smtp\n' +
'  config.action_mailer.smtp_settings = {\n' +
'    address: "email-smtp.ap-northeast-1.amazonaws.com",\n' +
'    port: 587,\n' +
'    user_name: ENV["SMTP_USERNAME"],\n' +
'    password: ENV["SMTP_PASSWORD"],\n' +
'    authentication: :login,\n' +
'    enable_starttls_auto: true\n' +
'  }\n' +
'end\n';

files[HOME + '/notes/smtp-rotation.md'] = function () {
  var d = new Date(rotatedAt + 9 * 3600000);
  return '# SES の SMTP 認証情報の作り直し（田中）\n\n' +
    '- ' + (d.getUTCMonth() + 1) + '月' + d.getUTCDate() + '日 ' + d.toISOString().slice(11, 16) + ' ごろ、定期の作り直しで、SES の SMTP 認証情報を新しく作った\n' +
    '- Parameter Store の /myapp/prod/SMTP_USERNAME と /myapp/prod/SMTP_PASSWORD を、新しい値に更新した（aws ssm put-parameter --overwrite）\n' +
    '- 古い認証情報（' + OLD_USER + '）は削除した\n';
};

/* Sidekiq がメールを送ろうとして、SES に断られ続けている */
function sidekiqJournal() {
  var L = [], jid = 0;
  for (var t = rotatedAt + 4 * MIN; t < Date.now() - MIN; t += 7 * MIN + (jid % 3) * MIN) {
    var id = ('a1c3e5f7092b4d6' + (++jid).toString(16)).slice(-16);
    var head = jstClock(t) + ' production sidekiq[1502]: ' + iso(t) + ' pid=1502 tid=' + (jid % 2 ? '2kd' : '2lq');
    L.push(head + ' class=ActionMailer::MailDeliveryJob jid=' + id + ' INFO: start');
    L.push(head + ' class=ActionMailer::MailDeliveryJob jid=' + id + ' elapsed=0.41 INFO: fail');
    L.push(head + ' WARN: {"context":"Job raised exception","job":{"retry":true,"queue":"mailers","class":"ActionMailer::MailDeliveryJob","jid":"' + id + '"}}');
    L.push(head + ' WARN: Net::SMTPAuthenticationError: 535 Authentication Credentials Invalid');
  }
  return L;
}

/* systemctl restart で起動し直したプロセスは、新しい PID で動いている */
function restarted(name) {
  return { onUp: function (st) {
    var map = name === 'sidekiq' ? { 1502: 9612 } : { 1421: 9701, 1433: 9705, 1434: 9706 };
    (st.processes || []).forEach(function (p) { if (map[p.pid]) p.pid = map[p.pid]; });
    st.services[name].mainPid = name === 'sidekiq' ? 9612 : 9701;
  } };
}

window.LFR.scenarios.add({
  id: 'case44',
  level: 15,
  title: 'Parameter Store の値を変えたのに、メールが送れないまま',
  subtitle: '環境変数がどこで作られ、いつプロセスに読み込まれるかをたどる',

  description:
'1時間半ほど前に、同僚が SES の SMTP 認証情報を作り直し、Parameter Store の値を新しくしました（~/notes/smtp-rotation.md）。\n' +
'古い認証情報は削除してあります。\n' +
'それから、本番のメールが送れていません。\n\n' +
'このサーバー（Puma と Sidekiq）で原因を突き止め、メールが送れる状態に戻してください。\n' +
'このサーバーには IAM ロールが付いているので、aws コマンドもそのまま使えます。',

  learn: [
    { name: 'Sidekiq のログでエラーを探す', cmd: 'journalctl -u sidekiq | grep SMTP | tail -n 3',
      desc: 'メールは Sidekiq のジョブ（ActionMailer::MailDeliveryJob）が送ります。\n' +
            'SES は、SMTP の認証情報が正しくないと「535 Authentication Credentials Invalid」を返します。' },
    { name: 'パラメータの変更の履歴', cmd: "aws ssm get-parameter-history --name /myapp/prod/SMTP_PASSWORD --query 'Parameters[].[Version,LastModifiedDate,LastModifiedUser]' --output table",
      desc: 'Parameter Store は値を変えるたびにバージョンを1つ上げ、いつ・誰が変えたかを残します。\n' +
            'SecureString の値は --with-decryption を付けたときだけ復号されます。' },
    { name: 'プロセスが持っている環境変数', cmd: "cat /proc/1502/environ | tr '\\0' '\\n' | grep SMTP_USERNAME",
      desc: '/proc/<PID>/environ は、そのプロセスが起動したときに受け取った環境変数です。\n' +
            '区切りが NUL 文字なので、tr で改行に直して読みます。' },
    { name: 'EnvironmentFile', cmd: 'cat /etc/systemd/system/sidekiq.service',
      desc: 'systemd はサービスを起動するときに EnvironmentFile を読み、その値を環境変数として渡します。\n' +
            'ファイルを書き換えても、動いているプロセスには届きません。起動し直したときに読み直します。' },
    { name: '起動し直す', cmd: 'sudo systemctl restart sidekiq',
      desc: 'restart はプロセスを止めて起動し直すので、EnvironmentFile を読み直します。\n' +
            'Puma の phased-restart は worker だけを入れ替え、master はそのままです。\n' +
            'worker は master の環境変数を引き継ぐので、環境変数を変えたときは systemctl restart puma にします。' }
  ],

  startDirectory: APP + '/current',
  clock: 'now',
  files: files,
  envVars: { SMTP_USERNAME: OLD_USER, SMTP_PASSWORD: OLD_PASS },
  services: {
    puma: { environmentFile: APP + '/shared/config/app.env', recovery: restarted('puma') },
    sidekiq: { environmentFile: APP + '/shared/config/app.env', recovery: restarted('sidekiq') }
  },
  journal: {
    /* CASE を開くたびに、時刻を今から決め直す（journal は awsEnv より先に作られる） */
    get sidekiq() { rotatedAt = Date.now() - 95 * MIN; return sidekiqJournal(); }
  },

  awsEnv: function (sim) {
    var env = sim.railsOnEc2({ maxAcu: 16 });
    sim.ec2Role(env, {});
    var created = Date.now() - 300 * 24 * 60 * MIN, me = 'arn:aws:iam::123456789012:user/';
    sim.parameters(env, [
      { name: '/myapp/prod/DATABASE_PASSWORD', type: 'SecureString', versions: [{ value: 'pr0d-db-pa55w0rd-DO-NOT-SHARE', at: created, user: me + 'suzuki' }] },
      { name: '/myapp/prod/RAILS_MASTER_KEY', type: 'SecureString', versions: [{ value: '0f3c9a7e51b24d6c8e1f2a3b4c5d6e7f', at: created, user: me + 'suzuki' }] },
      { name: '/myapp/prod/SMTP_PASSWORD', type: 'SecureString', versions: [
        { value: 'BFirstExampleSesSmtpPassword00000000000000c', at: created, user: me + 'suzuki' },
        { value: OLD_PASS, at: created + 180 * 24 * 60 * MIN, user: me + 'tanaka' },
        { value: NEW_PASS, at: rotatedAt, user: me + 'tanaka' }] },
      { name: '/myapp/prod/SMTP_USERNAME', type: 'String', versions: [
        { value: 'AKIAEXAMPLESMTPFIRST', at: created, user: me + 'suzuki' },
        { value: OLD_USER, at: created + 180 * 24 * 60 * MIN, user: me + 'tanaka' },
        { value: NEW_USER, at: rotatedAt + 20000, user: me + 'tanaka' }] }
    ]);
    return env;
  },

  hints: [
    'まず、メールのジョブが何で失敗しているかを見てください。\n\n' +
    '  journalctl -u sidekiq | grep SMTP | tail -n 3\n\n' +
    'SES が認証を断っています。Sidekiq が使っている認証情報は、新しいものでしょうか。',

    'Parameter Store の値と、このサーバーの app.env と、Sidekiq のプロセスが持っている値を比べます。\n' +
    'パスワードは画面に出さず、SMTP_USERNAME で比べると安全です。\n\n' +
    "  aws ssm get-parameter --name /myapp/prod/SMTP_USERNAME --query 'Parameter.Value'\n" +
    '  grep SMTP_USERNAME /var/www/myapp/shared/config/app.env\n' +
    "  cat /proc/1502/environ | tr '\\0' '\\n' | grep SMTP_USERNAME",

    'app.env はデプロイのときに作られます（config/deploy.rb の env:fetch）。\n' +
    '同じコマンドで作り直してから、Sidekiq と Puma を systemctl restart で起動し直し、新しい PID の /proc/<PID>/environ で確かめてください。'
  ],

  probes: [
    { key: 'foundSmtpError', label: 'SES が SMTP の認証を断っていることを見つけた',
      test: function (c, res) { return /journalctl/.test(c) && /535 Authentication Credentials Invalid/.test(res.stdout); } },
    { key: 'sawHistory', label: 'Parameter Store の値が新しくなっていることを確かめた',
      test: function (c, res) { return /aws\s+ssm\s+get-parameter/.test(c) && /SMTP/.test(c) && (/NEW02/.test(res.stdout) || /tanaka/.test(res.stdout)); } },
    { key: 'sawOldFile', label: 'app.env が古い値のままだと確かめた',
      test: function (c, res) { return /app\.env/.test(c) && !/aws\s+ssm/.test(c) && /OLD01/.test(res.stdout); } },
    { key: 'sawProcessEnv', label: '動いているプロセスの環境変数が古い値だと確かめた',
      test: function (c, res) { return /\/proc\/\d+\/environ/.test(c) && /OLD01/.test(res.stdout); } },
    { key: 'regenerated', label: 'Parameter Store から app.env を作り直した',
      test: function (c, res) { return /get-parameters-by-path/.test(c) && /app\.env/.test(c) && res.exitCode === 0; } },
    { key: 'restartedWithNew', label: 'Sidekiq と Puma を起動し直し、新しい値を読んだことを確かめた',
      test: function (c, res, rt) { var e = rt.state.serviceEnv || {}; return /\/proc\/\d+\/environ/.test(c) && /NEW02/.test(res.stdout) && e.sidekiq && e.puma && e.puma.SMTP_USERNAME === 'AKIAEXAMPLESMTPNEW02'; } }
  ],

  evidence: [
    { key: 'foundSmtpError',   weight: 10, label: 'メールが SMTP の認証で失敗していることを見つけた' },
    { key: 'sawHistory',       weight: 10, label: 'Parameter Store の値と変更の履歴を確かめた' },
    { key: 'sawOldFile',       weight: 12, label: 'app.env が古いままだと気づいた' },
    { key: 'sawProcessEnv',    weight: 12, label: 'プロセスの環境変数が古いままだと確かめた' },
    { key: 'regenerated',      weight: 10, label: 'app.env を作り直した' },
    { key: 'restartedWithNew', weight: 14, label: '起動し直して、新しい値が届いたことを確かめた' }
  ],

  question: {
    text: 'Parameter Store の値を変えたのに、メールが送れないままだった理由は？',
    choices: [
      'SecureString の値は変えてから反映されるまでに数時間かかるから',
      '環境変数はデプロイのときに作る app.env を systemd が起動時に読むもので、app.env も動いているプロセスも古い値のままだったから',
      'Rails がメールの設定を起動時にキャッシュしていて、Parameter Store を見に行かないように設定されているから',
      'EC2 のロールに ssm:GetParameter の権限が無く、新しい値を取れなかったから'
    ],
    answer: 1,
    explain:
'Sidekiq のログでは、メールのジョブが「535 Authentication Credentials Invalid」で失敗しています。\n' +
'SES が送られてきた SMTP の認証情報を受け付けていません。\n\n' +
'値を3か所で比べると、どこで止まっているかが分かります。\n' +
'  Parameter Store（get-parameter）              新しい値（…NEW02）。1時間半前に田中さんが更新\n' +
'  /var/www/myapp/shared/config/app.env          古い値（…OLD01）\n' +
'  Sidekiq のプロセス（/proc/1502/environ）     古い値（…OLD01）\n\n' +
'このサーバーのアプリは Parameter Store を直接読んでいません。\n' +
'デプロイのとき（config/deploy.rb の env:fetch）に Parameter Store から app.env を作り、\n' +
'systemd が Puma と Sidekiq を起動するときに、EnvironmentFile として読んで環境変数にしています。\n' +
'Parameter Store を更新しただけでは app.env は変わらず、動いているプロセスの環境変数も変わりません。\n' +
'古い認証情報を削除したので、古い値のままのプロセスはメールを送れなくなりました。\n\n' +
'直し方は env:fetch と同じコマンドで app.env を作り直し、Sidekiq と Puma を systemctl restart で起動し直すことです。\n' +
'Puma の phased-restart では master が入れ替わらず、worker は master の環境変数を引き継ぐので、古い値が残ります。\n' +
'起動し直したら、新しい PID の /proc/<PID>/environ で新しい値を確かめます。\n' +
'失敗したメールのジョブは Sidekiq がリトライするので、起動し直したあとに送られます。\n\n' +
'認証情報を作り直すときは、次の順にします。\n' +
'  1. 新しい認証情報を作り、Parameter Store を更新する\n' +
'  2. app.env を作り直し（またはデプロイし）、プロセスを起動し直す\n' +
'  3. 新しい値で動いていることを確かめてから、古い認証情報を削除する\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. 環境変数がどこで作られ、どのタイミングでプロセスに読み込まれるかをたどる\n' +
'2. /proc/<PID>/environ で、動いているプロセスの本当の値を確かめる\n' +
'3. EnvironmentFile を変えたら systemctl restart。phased-restart や reload では変わらない\n' +
'4. 認証情報の作り直しは「新しいものを入れる → 確かめる → 古いものを消す」の順',
    wrong: [
'Parameter Store の値は、更新した直後から新しい値が返ります。\n' +
'get-parameter でも、すでに新しい値（バージョン3）が返っています。',
null,
'このアプリは Parameter Store を直接見ていません。ENV["SMTP_USERNAME"] を読むだけです（config/environments/production.rb）。\n' +
'その ENV が古いままなのが問題です。',
'権限が無ければ、get-parameters-by-path が AccessDenied になります。\n' +
'このサーバーから実際に取り出せていて、値も新しくなっています。'
    ]
  },

  route: {
    steps: [
      '同僚のメモで、いつ何を変えたかを確かめる',
      'Sidekiq のログで、メールが SMTP の認証で失敗していることを確かめる',
      'Parameter Store・app.env・プロセスの環境変数の3か所で、SMTP_USERNAME を比べる',
      'app.env がデプロイのときに作られ、systemd が起動時に読むことを確かめる',
      'app.env を作り直し、Sidekiq と Puma を systemctl restart し、新しいプロセスの環境変数を確かめる'
    ],
    commands: [
      'cat ~/notes/smtp-rotation.md',
      'journalctl -u sidekiq | grep SMTP | tail -n 3',
      "aws ssm get-parameter-history --name /myapp/prod/SMTP_PASSWORD --query 'Parameters[].[Version,LastModifiedDate,LastModifiedUser]' --output table",
      "aws ssm get-parameter --name /myapp/prod/SMTP_USERNAME --query 'Parameter.[Value,Version]' --output text",
      'grep SMTP_USERNAME /var/www/myapp/shared/config/app.env',
      'pgrep -f sidekiq',
      "cat /proc/1502/environ | tr '\\0' '\\n' | grep SMTP_USERNAME",
      'cat /etc/systemd/system/sidekiq.service',
      'grep -A4 "task :fetch" /var/www/myapp/current/config/deploy.rb',
      FETCH,
      'grep SMTP_USERNAME /var/www/myapp/shared/config/app.env',
      'sudo systemctl restart sidekiq',
      'sudo systemctl restart puma',
      'pgrep -f sidekiq',
      "cat /proc/9612/environ | tr '\\0' '\\n' | grep SMTP_USERNAME"
    ],
    note:
'秘密情報を画面に出すと、ターミナルの履歴や画面の共有から漏れます。\n' +
'比べるときは、ユーザー名やバージョンのような、漏れても困らない値を使ってください。'
  }
});
})();
