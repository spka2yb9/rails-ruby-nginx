/* CASE 45 — web-2 だけが DB につながらない（CloudTrail で、誰がいつ何を変えたかを調べる）
   DB のセキュリティグループのルール「myapp-web-sg からの 3306」を、同僚がコンソールで「10.0.1.0/24 からの 3306」に置き換えた。
   web-1（10.0.1.21）は入るが、web-2（10.0.2.21）は入れない。CloudTrail の lookup-events で、Revoke と Authorize の記録を見つける */
(function () {
'use strict';
var ME = '/Users/i-wada';
var MIN = 60000;
var WEB1 = 'i-0a1b2c3d4e5f60718', WEB2 = 'i-0f9e8d7c6b5a43210';
var HOST = 'myapp-prod.cluster-cpcnosrxxxxx.ap-northeast-1.rds.amazonaws.com';

var changedAt = 0;   /* 同僚がルールを書き換えた時刻。awsEnv で決める */

function jst(t) { return new Date(t + 9 * 3600000).toISOString().replace('Z', '+09:00'); }
function hhmm(t) { return new Date(t + 9 * 3600000).toISOString().slice(11, 16); }
function rid(n) { return ('0000000' + (n * 2246822519 >>> 0).toString(16)).slice(-8) + '-6e1b-4a90-b2c4-' + ('00000000000' + (n * 69069).toString(16)).slice(-12); }

var files = {};
files[ME + '/.aws/config'] = '[default]\nregion = ap-northeast-1\noutput = json\n';
files[ME + '/.aws/credentials'] = '[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[ME + '/notes/alert.md'] = function () {
  return '# 監視の通知（' + hhmm(changedAt + 6 * MIN) + '）\n\n' +
    '- web-2（' + WEB2 + '、10.0.2.21）で 500 が急に増えた\n' +
    '- web-1（' + WEB1 + '、10.0.1.21）では出ていない\n' +
    '- 今日はデプロイしていない。ログは CloudWatch Logs の /myapp/production（ストリームはインスタンス ID）\n';
};

files[ME + '/notes/network.md'] =
'# 本番のネットワーク（抜粋）\n\n' +
'| 名前 | サブネット | IP | セキュリティグループ |\n' +
'|---|---|---|---|\n' +
'| web-1 | myapp-public-1a（10.0.1.0/24） | 10.0.1.21 | myapp-web-sg |\n' +
'| web-2 | myapp-public-1c（10.0.2.0/24） | 10.0.2.21 | myapp-web-sg |\n' +
'| バッチ（Fargate） | myapp-private-1a / 1c | 毎回変わる | myapp-batch-sg |\n' +
'| Aurora（myapp-prod） | myapp-private-1a / 1c | | myapp-db-sg |\n';

/* web-1 はふつうに動き、web-2 はルールが変わった少しあとから DB につながらない */
function appLogs(sim, env) {
  var now = Date.now(), n = 0;
  [[WEB1, false], [WEB2, true]].forEach(function (w) {
    var events = [];
    for (var t = changedAt - 40 * MIN; t < now - MIN; t += 2 * MIN + (n % 3) * 20000) {
      var r = rid(++n), pid = n % 2 ? 1434 : 1433;
      var line = function (lv, s) { return lv + ', [' + jst(t) + ' #' + pid + '] ' + (lv === 'I' ? ' INFO' : 'FATAL') + ' -- : [' + r + '] ' + s; };
      var path = ['/jobs', '/jobs/48213', '/companies/812'][n % 3];
      events.push({ at: t, message: line('I', 'Started GET "' + path + '" for 10.0.1.' + (5 + n % 3) + ' at ' + jst(t).slice(0, 19).replace('T', ' ') + ' +0900') });
      events.push({ at: t + 1, message: line('I', 'Processing by ' + (path === '/jobs' ? 'JobsController#index' : path === '/jobs/48213' ? 'JobsController#show' : 'CompaniesController#show') + ' as HTML') });
      if (w[1] && t > changedAt + 4 * MIN) {
        events.push({ at: t + 10010, message: line('I', 'Completed 500 Internal Server Error in 10012ms (ActiveRecord: 0.0ms | Allocations: 2' + (100 + n % 800) + ')') });
        events.push({ at: t + 10011, message: line('F', '  ') });
        events.push({ at: t + 10012, message: line('F', 'ActiveRecord::DatabaseConnectionError (There is an issue connecting with your hostname: ' + HOST + '.') });
        events.push({ at: t + 10013, message: '' });
        events.push({ at: t + 10014, message: 'Please check your database configuration and ensure there is a valid connection to your database.' });
        events.push({ at: t + 10015, message: '):' });
      } else {
        events.push({ at: t + 60, message: line('I', 'Completed 200 OK in ' + (40 + n % 60) + 'ms (Views: ' + (14 + n % 30) + '.2ms | ActiveRecord: ' + (6 + n % 20) + '.4ms | Allocations: 2' + (1000 + n % 900) + ')') });
      }
    }
    sim.putLogs(env, '/myapp/production', w[0], events);
  });
}

window.LFR.scenarios.add({
  id: 'case45',
  level: 15,
  title: 'web-2 だけが DB につながらない',
  subtitle: 'CloudTrail で、誰がいつセキュリティグループのルールを変えたかを突き止める',

  description:
'監視から通知がありました（~/notes/alert.md）。\n' +
'2台の Web サーバーのうち、web-2 でだけ 500 が増えています。今日はデプロイしていません。\n\n' +
'手元の PC から AWS CLI で、web-2 に何が起きているかを調べ、元に戻してください。\n' +
'本番のネットワークの構成は ~/notes/network.md にあります。',

  learn: [
    { name: 'web-2 のログだけを読む', cmd: 'aws logs tail /myapp/production --since 1h --log-stream-names i-0f9e8d7c6b5a43210',
      desc: 'ログストリームの名前はインスタンス ID です。--log-stream-names で、1台のログだけを読みます。' },
    { name: 'セキュリティグループのルール', cmd: "aws ec2 describe-security-groups --filters Name=group-name,Values=myapp-db-sg --query 'SecurityGroups[0].IpPermissions'",
      desc: 'IpPermissions が受け付ける通信（インバウンド）のルールです。\n' +
            'UserIdGroupPairs はセキュリティグループを、IpRanges は IP の範囲（CIDR）を、送り元として許します。' },
    { name: 'CloudTrail で変更の記録を探す', cmd: 'aws cloudtrail lookup-events --lookup-attributes AttributeKey=ResourceName,AttributeValue=<sg-...> --max-results 5',
      desc: 'CloudTrail は AWS の API の呼び出し（コンソールの操作も含む）を記録しています。\n' +
            'lookup-events は過去90日の管理イベントを、新しい順に返します。\n' +
            '--lookup-attributes で絞れるのは1つの条件だけです（EventName・Username・ResourceName など）。' },
    { name: 'イベントの中身を読む', cmd: "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=RevokeSecurityGroupIngress --query 'Events[0].CloudTrailEvent' --output text",
      desc: 'CloudTrailEvent は JSON の文字列です。誰が（userIdentity）、どこから（sourceIPAddress）、\n' +
            '何を（eventName と requestParameters）したかが入っています。' },
    { name: 'ルールを足す', cmd: 'aws ec2 authorize-security-group-ingress --group-id <DB の sg> --protocol tcp --port 3306 --source-group <Web の sg>',
      desc: '--source-group でセキュリティグループを送り元にすると、そのグループが付いたサーバーすべてから通ります。\n' +
            'IP の範囲で書くと、サーバーが増えたりサブネットが違ったりしたときに漏れます。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  awsEnv: function (sim) {
    changedAt = Math.floor((Date.now() - 38 * MIN) / 1000) * 1000;
    var env = sim.railsOnEc2({ maxAcu: 16 });
    sim.logGroup(env, '/myapp/production');
    /* 同僚の佐藤さんが「Web サーバーのサブネットに絞る」つもりで、コンソールで書き換えた */
    sim.changeSecurityGroup(env, {
      groupName: 'myapp-db-sg', at: changedAt, user: 'sato', sourceIp: '203.0.113.45',
      ingress: [
        { ipProtocol: 'tcp', fromPort: 3306, toPort: 3306, source: '10.0.1.0/24', description: 'MySQL from web servers' },
        { ipProtocol: 'tcp', fromPort: 3306, toPort: 3306, source: sim.groupId(env, 'myapp-batch-sg'), description: 'MySQL from batch' }
      ]
    });
    appLogs(sim, env);
    return env;
  },

  hints: [
    'まず web-2 のログを読みます。ストリームの名前は web-2 のインスタンス ID です。\n' +
    'DB に接続できていません。web-1 は同じ DB につながっているので、DB は動いています。',

    'web-2 から DB までの間で、web-1 と違うものを考えます。\n' +
    'DB のセキュリティグループ（myapp-db-sg）のルールを見て、web-2（10.0.2.21）が許されているかを確かめてください。',

    'ルールが今の形になったのはいつで、誰が変えたのかを CloudTrail で確かめます。\n\n' +
    '  aws cloudtrail lookup-events --lookup-attributes AttributeKey=ResourceName,AttributeValue=<myapp-db-sg の ID>\n\n' +
    '元のルール（何が消されたか）は、RevokeSecurityGroupIngress のイベントの requestParameters にあります。'
  ],

  probes: [
    { key: 'foundDbError', label: 'web-2 が DB に接続できていないことを見つけた',
      test: function (c, res) { return /aws\s+logs/.test(c) && /DatabaseConnectionError/.test(res.stdout); } },
    { key: 'sawRules', label: 'DB のセキュリティグループが 10.0.1.0/24 だけを許していることを確かめた',
      test: function (c, res) { return /describe-security-groups/.test(c) && /10\.0\.1\.0\/24/.test(res.stdout); } },
    { key: 'foundEvents', label: 'CloudTrail で、ルールを変えたイベントを見つけた',
      test: function (c, res) { return /cloudtrail\s+lookup-events/.test(c) && /RevokeSecurityGroupIngress/.test(res.stdout); } },
    { key: 'sawWhoWhat', label: '誰が、何を消したか（requestParameters）を読んだ',
      test: function (c, res) { return /cloudtrail/.test(c) && /sato/.test(res.stdout) && /groupId/.test(res.stdout) && /ipPermissions/.test(res.stdout); } },
    { key: 'restoredRule', label: 'myapp-web-sg からの 3306 を許すルールを戻した',
      test: function (c, res) { return /authorize-security-group-ingress/.test(c) && /3306/.test(c) && res.exitCode === 0; } },
    { key: 'verifiedRules', label: '戻したあとのルールを確かめた',
      test: function (c, res, rt) { return /describe-security-groups/.test(c) && /UserIdGroupPairs/.test(res.stdout) && !!rt.investigation.facts.restoredRule; } }
  ],

  evidence: [
    { key: 'foundDbError',  weight: 10, label: 'web-2 だけが DB につながらないことを見つけた' },
    { key: 'sawRules',      weight: 12, label: 'DB のセキュリティグループのルールを確かめた' },
    { key: 'foundEvents',   weight: 14, label: 'CloudTrail で変更の記録を見つけた' },
    { key: 'sawWhoWhat',    weight: 12, label: '誰が何を変えたかを読んだ' },
    { key: 'restoredRule',  weight: 10, label: 'ルールを戻した' },
    { key: 'verifiedRules', weight: 6,  label: '戻したあとを確かめた' }
  ],

  question: {
    text: 'web-2 だけが DB につながらなくなった理由は？',
    choices: [
      'web-2 のインスタンスプロファイルが外れ、DB のパスワードを Parameter Store から取れなくなった',
      'DB のセキュリティグループのルールが「myapp-web-sg から」から「10.0.1.0/24 から」に書き換えられ、10.0.2.0/24 にある web-2 が入れなくなった',
      'Aurora がフェイルオーバーし、web-2 だけが古い writer につながったままになった',
      'web-2 の database.yml が書き換えられ、別のホストにつなごうとしている'
    ],
    answer: 1,
    explain:
'web-2 のログでは、40分ほど前から DB への接続が10秒で失敗し（ActiveRecord::DatabaseConnectionError）、500 になっています。\n' +
'web-1 は同じ DB にふつうにつながっています。\n\n' +
'DB のセキュリティグループ（myapp-db-sg）の 3306 のルールは、今は次の2つです。\n' +
'  10.0.1.0/24 から（MySQL from web servers）\n' +
'  myapp-batch-sg から\n' +
'web-1 は 10.0.1.21 なので通りますが、web-2 は 10.0.2.21（10.0.2.0/24）なので通りません。\n\n' +
'CloudTrail で myapp-db-sg のイベントを探すと、同じ時刻に2つの記録があります。\n' +
'  RevokeSecurityGroupIngress   myapp-web-sg からの 3306 を消した\n' +
'  AuthorizeSecurityGroupIngress  10.0.1.0/24 からの 3306 を足した\n' +
'userIdentity は IAM ユーザーの sato、sourceIPAddress は 203.0.113.45 です。\n' +
'コンソールの「インバウンドルールを編集」で保存すると、消したルールと足したルールがこの2つのイベントで記録されます。\n' +
'「Web サーバーのサブネットに絞る」つもりが、1a のサブネットだけを書いてしまったと読めます。\n\n' +
'直し方は myapp-web-sg を送り元にした 3306 のルールを足すことです。\n' +
'セキュリティグループを送り元にすれば、Web サーバーがどのサブネットにあっても、何台に増えても通信が許されます。\n' +
'10.0.1.0/24 のルールは佐藤さんと意図を確かめてから消します。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. 「1台だけ」の障害は、その1台とほかの台の違い（サブネット・IP・設定）から考える\n' +
'2. CloudTrail の lookup-events で、誰が、いつ、どこから、何をしたかを調べられる\n' +
'3. requestParameters を読めば、消されたルールの元の形が分かる\n' +
'4. DB のセキュリティグループは IP の範囲ではなくアプリのセキュリティグループを送り元にする',
    wrong: [
'パスワードが取れないなら、DB の認証で失敗します（username/password のエラー）。\n' +
'今回は DB に接続できず10秒で諦めています。ネットワークで届いていません。',
null,
'フェイルオーバーでは、書き込みが --read-only で断られます。今回は接続そのものができていません。\n' +
'RDS のイベントにもフェイルオーバーはありません。',
'エラーのホスト名は web-1 と同じクラスターのエンドポイントです。\n' +
'今日はデプロイもしていません。'
    ]
  },

  route: {
    steps: [
      '通知で、web-2 だけに起きていることを確かめる',
      'web-2 のログで、DB に接続できていないことを確かめる',
      'DB のセキュリティグループのルールを見て、web-2 の IP が許されていないことに気づく',
      'CloudTrail で、そのセキュリティグループのイベントを探し、誰が何を変えたかを読む',
      'myapp-web-sg からの 3306 を戻し、ルールを確かめる'
    ],
    commands: [
      'cat ~/notes/alert.md',
      'aws logs tail /myapp/production --since 1h --log-stream-names i-0f9e8d7c6b5a43210 | grep -A3 DatabaseConnectionError | tail -n 4',
      "DB_SG=$(aws ec2 describe-security-groups --filters Name=group-name,Values=myapp-db-sg --query 'SecurityGroups[0].GroupId' --output text)",
      "WEB_SG=$(aws ec2 describe-security-groups --filters Name=group-name,Values=myapp-web-sg --query 'SecurityGroups[0].GroupId' --output text)",
      "aws ec2 describe-security-groups --group-ids $DB_SG --query 'SecurityGroups[0].IpPermissions'",
      'cat ~/notes/network.md',
      "aws cloudtrail lookup-events --lookup-attributes AttributeKey=ResourceName,AttributeValue=$DB_SG --query 'Events[].[EventTime,EventName,Username]' --output table",
      "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=RevokeSecurityGroupIngress --query 'Events[0].CloudTrailEvent' --output text",
      'aws ec2 authorize-security-group-ingress --group-id $DB_SG --protocol tcp --port 3306 --source-group $WEB_SG',
      "aws ec2 describe-security-groups --group-ids $DB_SG --query 'SecurityGroups[0].IpPermissions'"
    ],
    note:
'セキュリティグループのような共有の設定を変えるときは、変更の前に「何がこのルールで通っているか」を確かめてください。\n' +
'CloudTrail の記録は、責める材料ではなく、何が起きたかを正確に知るためのものです。'
  }
});
})();
