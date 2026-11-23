/* CASE 43 — 履歴書のアップロードだけが AccessDenied になる（EC2 のロールと S3）
   CarrierWave（fog-aws、use_iam_profile: true）は、EC2 のインスタンスプロファイルのロールの権限で S3 に書く。
   ロールのポリシーは uploads/ の下だけを許していて、新しく足した履歴書の保存先 resumes/ への PutObject が拒否された。
   リポジトリのポリシーの JSON は直してあったが、AWS へ反映（put-role-policy）していなかった */
(function () {
'use strict';
var ME = '/Users/i-wada';
var SRC = ME + '/src/myapp';
var MIN = 60000;
var WEB1 = 'i-0a1b2c3d4e5f60718', WEB2 = 'i-0f9e8d7c6b5a43210';
var BUCKET = 'myapp-uploads-prod';
var ROLE_ARN = 'arn:aws:sts::123456789012:assumed-role/myapp-ec2-role/';

function jst(t) { return new Date(t + 9 * 3600000).toISOString().replace('Z', '+09:00'); }
function rid(n) { return ('0000000' + (n * 2654435761 >>> 0).toString(16)).slice(-8) + '-5d2a-4c7e-8f31-' + ('00000000000' + (n * 48271).toString(16)).slice(-12); }

function policy(prefixes) {
  return {
    Version: '2012-10-17',
    Statement: [
      { Sid: 'Objects', Effect: 'Allow', Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'], Resource: prefixes.map(function (p) { return 'arn:aws:s3:::' + BUCKET + '/' + p + '/*'; }) },
      { Sid: 'List', Effect: 'Allow', Action: 's3:ListBucket', Resource: 'arn:aws:s3:::' + BUCKET }
    ]
  };
}

var files = {};
files[ME + '/.aws/config'] = '[default]\nregion = ap-northeast-1\noutput = json\n';
files[ME + '/.aws/credentials'] = '[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[ME + '/support/inquiry.md'] =
'# サポートからの連絡\n\n' +
'- 応募のときに履歴書（PDF）を添付すると「エラーが発生しました」と出る。今朝から3件\n' +
'- 求人の写真のアップロードはいつもどおりできている\n';

files[ME + '/notes/release.md'] = function () {
  return '# リリースの記録\n\n' +
    '- ' + new Date(Date.now() - 24 * 3600000 + 9 * 3600000).toISOString().slice(0, 10) + ' 18:00 リリース。応募に履歴書（PDF）を添付できるようにした（PR #1824）\n' +
    '  - ResumeUploader を追加（保存先は resumes/）\n' +
    '  - infra/iam/myapp-s3-uploads.json に resumes/ を追加\n' +
    '- 本番は EC2 の2台（web-1: ' + WEB1 + '、web-2: ' + WEB2 + '）。ログは CloudWatch エージェントで /myapp/production に送っている（ストリームはインスタンス ID）\n';
};

files[SRC + '/config/initializers/carrierwave.rb'] =
'CarrierWave.configure do |config|\n' +
'  config.storage = :fog\n' +
'  config.fog_credentials = {\n' +
'    provider: "AWS",\n' +
'    region: "ap-northeast-1",\n' +
'    use_iam_profile: true   # EC2 のインスタンスプロファイル（IAM ロール）の権限で S3 を使う\n' +
'  }\n' +
'  config.fog_directory = "' + BUCKET + '"\n' +
'end\n';

files[SRC + '/app/uploaders/photo_uploader.rb'] =
'class PhotoUploader < CarrierWave::Uploader::Base\n' +
'  def store_dir\n' +
'    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"\n' +
'  end\n\n' +
'  def extension_allowlist\n' +
'    %w[jpg jpeg png webp]\n' +
'  end\n' +
'end\n';

files[SRC + '/app/uploaders/resume_uploader.rb'] =
'# 応募の履歴書（PR #1824 で追加）\n' +
'class ResumeUploader < CarrierWave::Uploader::Base\n' +
'  def store_dir\n' +
'    "resumes/#{model.id}"\n' +
'  end\n\n' +
'  def extension_allowlist\n' +
'    %w[pdf]\n' +
'  end\n' +
'end\n';

files[SRC + '/infra/iam/myapp-s3-uploads.json'] = JSON.stringify(policy(['uploads', 'resumes']), null, 2) + '\n';

files[SRC + '/infra/iam/README.md'] =
'# EC2 のロール（myapp-ec2-role）のポリシー\n\n' +
'このディレクトリの JSON は、AWS へ自動では反映されない。変えたら次のコマンドで反映する。\n\n' +
'    aws iam put-role-policy --role-name myapp-ec2-role --policy-name myapp-s3-uploads --policy-document file://infra/iam/myapp-s3-uploads.json\n';

/* 2台の Web サーバーのログ。写真は保存できて、履歴書だけが 403 になる */
function appLogs(sim, env) {
  var now = Date.now(), n = 0;
  [WEB1, WEB2].forEach(function (id, k) {
    var events = [];
    for (var t = now - 170 * MIN + k * 7 * MIN; t < now - 2 * MIN; t += 9 * MIN + (n % 4) * MIN) {
      var r = rid(++n), pid = n % 2 ? 1434 : 1433, entry = 48100 + n;
      var line = function (lv, s) { return lv + ', [' + jst(t) + ' #' + pid + '] ' + (lv === 'I' ? ' INFO' : 'FATAL') + ' -- : [' + r + '] ' + s; };
      var resume = n % 3 === 0;
      var path = resume ? '/entries/' + entry + '/resume' : '/company/jobs/' + (9200 + n) + '/photos';
      events.push({ at: t, message: line('I', 'Started POST "' + path + '" for 10.0.1.' + (5 + n % 3) + ' at ' + jst(t).slice(0, 19).replace('T', ' ') + ' +0900') });
      events.push({ at: t + 1, message: line('I', 'Processing by ' + (resume ? 'ResumesController#create' : 'Company::PhotosController#create') + ' as HTML') });
      if (resume) {
        var key = 'resumes/' + entry + '/resume.pdf';
        events.push({ at: t + 300, message: line('I', 'Completed 500 Internal Server Error in ' + (280 + n % 90) + 'ms (ActiveRecord: 6.2ms | Allocations: 41' + (100 + n % 800) + ')') });
        events.push({ at: t + 301, message: line('F', '  ') });
        events.push({ at: t + 302, message: line('F', 'Excon::Error::Forbidden (Expected(200) <=> Actual(403 Forbidden)') });
        events.push({ at: t + 303, message: 'excon.error.response' });
        events.push({ at: t + 304, message: '  :body          => "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>\\n<Error><Code>AccessDenied</Code><Message>User: ' + ROLE_ARN + id +
          ' is not authorized to perform: s3:PutObject on resource: \\"arn:aws:s3:::' + BUCKET + '/' + key + '\\" because no identity-based policy allows the s3:PutObject action</Message></Error>"' });
        events.push({ at: t + 305, message: '  :status        => 403' });
        events.push({ at: t + 306, message: '):' });
        events.push({ at: t + 307, message: line('F', 'app/controllers/resumes_controller.rb:12:in `create\'') });
      } else {
        events.push({ at: t + 400, message: line('I', 'Redirected to https://myapp.example.jp/company/jobs/' + (9200 + n)) });
        events.push({ at: t + 401, message: line('I', 'Completed 302 Found in ' + (350 + n % 120) + 'ms (ActiveRecord: 8.4ms | Allocations: 52' + (100 + n % 800) + ')') });
      }
    }
    sim.putLogs(env, '/myapp/production', id, events);
  });
}

window.LFR.scenarios.add({
  id: 'case43',
  level: 15,
  title: '履歴書のアップロードだけが AccessDenied になる',
  subtitle: 'EC2 のロールのポリシーと、アップロード先のキーを突き合わせる',

  description:
'サポートから連絡がありました（~/support/inquiry.md）。\n' +
'応募のときに履歴書（PDF）を添付するとエラーになるそうです。求人の写真のアップロードはできています。\n' +
'履歴書の添付は昨日のリリースで足した機能です（~/notes/release.md）。\n\n' +
'本番の Rails は EC2 の2台で動いていて、ログは CloudWatch Logs の /myapp/production に送られています。\n' +
'手元の PC から AWS CLI で原因を突き止めて、直してください。リポジトリは ~/src/myapp にあります。',

  learn: [
    { name: 'EC2 のログを CloudWatch Logs で読む', cmd: 'aws logs tail /myapp/production --since 3h | grep -A6 Forbidden',
      desc: 'CloudWatch エージェントは、サーバーのログファイルを1行ずつ CloudWatch Logs に送ります。\n' +
            'ログストリームの名前は送ったサーバーのインスタンス ID です。' },
    { name: 'ロールのインラインポリシー', cmd: 'aws iam get-role-policy --role-name myapp-ec2-role --policy-name myapp-s3-uploads',
      desc: 'EC2 で動くアプリはインスタンスプロファイルに付いた IAM ロールの権限で AWS を使います。\n' +
            'CarrierWave の use_iam_profile: true は、その権限で S3 に書く設定です。\n' +
            'list-role-policies でインラインポリシーの名前を、get-role-policy で中身を見ます。' },
    { name: 'その操作が許されるかを試す', cmd: 'aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::123456789012:role/myapp-ec2-role --action-names s3:PutObject --resource-arns arn:aws:s3:::myapp-uploads-prod/resumes/1/resume.pdf',
      desc: '実際には操作せずに、そのロールでその操作が許されるかを、ポリシーから判定します。\n' +
            'EvalDecision が allowed なら許可、implicitDeny は「許すポリシーが無い」、explicitDeny は「拒否するポリシーがある」です。' },
    { name: 'ポリシーを反映する', cmd: 'aws iam put-role-policy --role-name myapp-ec2-role --policy-name myapp-s3-uploads --policy-document file://src/myapp/infra/iam/myapp-s3-uploads.json',
      desc: '同じ名前のインラインポリシーを、ファイルの内容で置き換えます。反映はすぐに始まりますが、数秒〜数十秒かかることがあります。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  awsEnv: function (sim) {
    var env = sim.railsOnEc2({ maxAcu: 16 });
    /* AWS にあるのは、写真のための uploads/ だけを許す前のポリシー */
    sim.ec2Role(env, { 'myapp-s3-uploads': policy(['uploads']) });
    sim.bucket(env, BUCKET);
    sim.logGroup(env, '/myapp/production');
    appLogs(sim, env);
    return env;
  },

  hints: [
    'まず CloudWatch Logs で、履歴書のリクエストのエラーを見てください。\n\n' +
    '  aws logs tail /myapp/production --since 3h | grep -A6 Forbidden\n\n' +
    'S3 が返したメッセージに、誰が（どのロールが）、どの操作を、どのキーに対してしようとしたかが書いてあります。',

    'そのロールのポリシーを見ます。\n\n' +
    '  aws iam list-role-policies --role-name myapp-ec2-role\n' +
    '  aws iam get-role-policy --role-name myapp-ec2-role --policy-name myapp-s3-uploads\n\n' +
    'Resource に書いてあるキーと、エラーのキー（resumes/...）を比べてください。',

    'リポジトリの infra/iam/myapp-s3-uploads.json と、AWS にあるポリシーを比べてください。\n' +
    'simulate-principal-policy で、直す前と直したあとの判定を確かめられます。'
  ],

  probes: [
    { key: 'foundAccessDenied', label: 'ログで、S3 の PutObject が AccessDenied になったことを見つけた',
      test: function (c, res) { return /aws\s+logs/.test(c) && /AccessDenied/.test(res.stdout) && /resumes\//.test(res.stdout); } },
    { key: 'readRolePolicy', label: 'ロールのポリシーが uploads/ だけを許していることを確かめた',
      test: function (c, res) { return /get-role-policy/.test(c) && /uploads\/\*/.test(res.stdout) && !/resumes/.test(res.stdout); } },
    { key: 'readUploader', label: '履歴書の保存先が resumes/ だと確かめた',
      test: function (c, res) { return /resume_uploader/.test(c) && /resumes\//.test(res.stdout); } },
    { key: 'sawRepoPolicy', label: 'リポジトリのポリシーの JSON には resumes/ が入っていると確かめた',
      test: function (c, res) { return /myapp-s3-uploads\.json|infra\/iam/.test(c) && /resumes\/\*/.test(res.stdout); } },
    { key: 'simulatedDeny', label: '直す前に、PutObject が implicitDeny になることを確かめた',
      test: function (c, res) { return /simulate-principal-policy/.test(c) && /implicitDeny/.test(res.stdout); } },
    { key: 'appliedPolicy', label: 'ポリシーを反映し、PutObject が allowed になったことを確かめた',
      test: function (c, res) { return /simulate-principal-policy/.test(c) && /allowed/.test(res.stdout) && /resumes/.test(c); } }
  ],

  evidence: [
    { key: 'foundAccessDenied', weight: 12, label: 'S3 が履歴書の書き込みを拒否していることを見つけた' },
    { key: 'readRolePolicy',    weight: 14, label: 'ロールのポリシーの許す範囲を確かめた' },
    { key: 'readUploader',      weight: 8,  label: '履歴書の保存先を確かめた' },
    { key: 'sawRepoPolicy',     weight: 8,  label: 'リポジトリと AWS のポリシーの違いに気づいた' },
    { key: 'simulatedDeny',     weight: 8,  label: '直す前の判定を確かめた' },
    { key: 'appliedPolicy',     weight: 14, label: 'ポリシーを反映して、許可されたことを確かめた' }
  ],

  question: {
    text: '履歴書のアップロードだけが失敗した理由は？',
    choices: [
      'S3 のバケットポリシーが PDF のアップロードを拒否している',
      'EC2 のロールのポリシーが uploads/ の下だけを許していて、履歴書の保存先 resumes/ への PutObject が許されていない',
      'EC2 のインスタンスプロファイルが外れていて、アプリが AWS の認証情報を取れない',
      'CarrierWave の fog_directory（バケット名）が間違っている'
    ],
    answer: 1,
    explain:
'ログの 500 はどれも ResumesController#create の Excon::Error::Forbidden（S3 が 403 を返した）です。\n' +
'S3 のメッセージにこう書いてあります。\n\n' +
'  User: arn:aws:sts::...:assumed-role/myapp-ec2-role/i-0a1b... is not authorized to perform: s3:PutObject\n' +
'  on resource: "arn:aws:s3:::myapp-uploads-prod/resumes/.../resume.pdf"\n' +
'  because no identity-based policy allows the s3:PutObject action\n\n' +
'CarrierWave は use_iam_profile: true なので、EC2 のインスタンスプロファイルのロール（myapp-ec2-role）の権限で S3 に書きます。\n' +
'そのロールのポリシー（myapp-s3-uploads）は、Resource が myapp-uploads-prod/uploads/* だけです。\n' +
'写真の保存先（uploads/...）は許されていて、新しい履歴書の保存先（resumes/...）は許されていません。\n' +
'「no identity-based policy allows」は、ロールのポリシーに許す記述が無いという意味です（明示的な拒否ではありません）。\n\n' +
'リポジトリの infra/iam/myapp-s3-uploads.json には resumes/* を足してありました。\n' +
'ただ、この JSON は AWS へ自動では反映されません。put-role-policy を打っていなかったため、AWS のポリシーは前のままでした。\n' +
'反映すると、simulate-principal-policy の判定が implicitDeny から allowed に変わります。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. S3 の AccessDenied のメッセージには、誰が、どの操作を、どのリソースに対してしたかが書いてある\n' +
'2. EC2 のアプリの権限はインスタンスプロファイルのロールのポリシーで決まる\n' +
'3. simulate-principal-policy で、実際に操作せずに許可されるかを確かめられる\n' +
'4. コードの変更と一緒に権限の変更が要るときは、権限の反映をリリースの手順に入れる',
    wrong: [
'バケットポリシーで拒否されたなら、メッセージは「explicit deny in a resource-based policy」になります。\n' +
'今回は「no identity-based policy allows」で、ロールのポリシーに許す記述が無いことを表しています。',
null,
'認証情報が取れないなら、写真のアップロードも失敗するはずです。\n' +
'メッセージには、myapp-ec2-role を引き受けた認証情報で書こうとしたことが出ています。',
'バケット名が違うなら、写真のアップロードも失敗します。\n' +
'エラーのリソースは myapp-uploads-prod で、写真と同じバケットです。違うのはキーの先頭（resumes/）です。'
    ]
  },

  route: {
    steps: [
      'サポートの連絡とリリースの記録で、何をいつ変えたかを確かめる',
      'CloudWatch Logs で、履歴書のリクエストのエラー（S3 の AccessDenied）を読む',
      'ロールのインラインポリシーと、履歴書の保存先を比べる',
      'リポジトリのポリシーの JSON が反映されていないことに気づき、simulate-principal-policy で判定を確かめる',
      'put-role-policy で反映し、判定が allowed になったことを確かめる'
    ],
    commands: [
      'cat ~/support/inquiry.md',
      'cat ~/notes/release.md',
      'aws logs tail /myapp/production --since 3h | grep -A6 Forbidden | head -n 14',
      'aws iam list-role-policies --role-name myapp-ec2-role',
      "aws iam get-role-policy --role-name myapp-ec2-role --policy-name myapp-s3-uploads --query 'PolicyDocument.Statement'",
      'cat ~/src/myapp/app/uploaders/resume_uploader.rb',
      'cat ~/src/myapp/infra/iam/myapp-s3-uploads.json',
      "aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::123456789012:role/myapp-ec2-role --action-names s3:PutObject --resource-arns arn:aws:s3:::myapp-uploads-prod/resumes/48213/resume.pdf --query 'EvaluationResults[0].EvalDecision'",
      'aws iam put-role-policy --role-name myapp-ec2-role --policy-name myapp-s3-uploads --policy-document file://src/myapp/infra/iam/myapp-s3-uploads.json',
      "aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::123456789012:role/myapp-ec2-role --action-names s3:PutObject --resource-arns arn:aws:s3:::myapp-uploads-prod/resumes/48213/resume.pdf --query 'EvaluationResults[0].EvalDecision'"
    ],
    note:
'ポリシーの JSON をリポジトリに置くなら、反映の手順（または Terraform などの道具）も決めておいてください。\n' +
'「リポジトリでは直っているのに、AWS は前のまま」は、権限の不具合でよく起きる形です。'
  }
});
})();
