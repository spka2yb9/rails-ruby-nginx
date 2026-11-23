/* CASE 46 — 一部のお客さまだけ 403 になる（AWS WAF のレートベースルールとマネージドルール）
   ALB に付けたウェブ ACL のルールが、正しいリクエストをブロックしている。
   1. 社員が同じ回線（1つのグローバル IP）から使う企業が、IP ごとのレートベースルール（5分で300）に当たった
   2. 本文の長い求人を保存すると、コアルールセットの SizeRestrictions_BODY（本文が 8 KB を超える）に当たった
   見本のリクエスト（get-sampled-requests）で、どのルールが決めたか（ルール名・ルールグループの中のルール・ラベル）を読む */
(function () {
'use strict';
var ME = '/Users/i-wada';
var MIN = 60000;
var ACL = 'myapp-prod-web-acl';
var MIDORI = '198.51.100.24', AOBA = '203.0.113.77', OFFICE = '192.0.2.10';

function hhmm(t) { return new Date(t + 9 * 3600000).toISOString().slice(11, 16); }

var startAt = 0;   /* ミドリ物産の 403 が始まった時刻。awsEnv で決める */

var files = {};
files[ME + '/.aws/config'] = '[default]\nregion = ap-northeast-1\noutput = json\n';
files[ME + '/.aws/credentials'] = '[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[ME + '/support/inquiry.md'] = function () {
  return '# サポートからの連絡（2件）\n\n' +
    '## 1. 株式会社ミドリ物産\n\n' +
    '- ' + hhmm(startAt) + ' ごろから、採用担当の全員の画面が「403 Forbidden」になった。しばらくすると開けることもある\n' +
    '- 社員は約200人。全員が本社の同じ回線から使っている（グローバル IP は ' + MIDORI + '）\n\n' +
    '## 2. 青葉会計事務所\n\n' +
    '- 求人の本文を書き直して保存すると「403 Forbidden」になる。ほかの求人は保存できる\n' +
    '- 書き直した求人は仕事内容と応募資格をかなり詳しく書いている\n';
};

files[ME + '/notes/waf.md'] =
'# 本番の WAF（' + ACL + '、ALB に関連付け）\n\n' +
'| 優先度 | ルール | 中身 | アクション |\n' +
'|---|---|---|---|\n' +
'| 0 | allow-office-ips | IP セット myapp-allow-ips（自社の事務所） | Allow |\n' +
'| 1 | rate-limit-per-ip | 同じ IP から5分で300リクエストを超えたら | Block |\n' +
'| 2 | AWS-AWSManagedRulesCommonRuleSet | AWS のコアルールセット | ルールグループのとおり |\n\n' +
'どのルールにも当たらなければ Allow（デフォルトアクション）。\n';

/* 見本のリクエスト（ウェブ ACL が最近見たもの） */
function samples() {
  var list = [], now = Date.now(), n = 0;
  var host = 'myapp.example.jp';
  var ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  var pages = ['/company/entries', '/company/jobs', '/company/entries/48213', '/company/messages', '/company/jobs/9301/edit'];
  /* ミドリ物産: 5分ごとに、最初は通り、300を超えるとブロックされる */
  for (var t = startAt - 20 * MIN; t < now - MIN; t += 9000 + (n % 5) * 1000) {
    n++;
    var blocked = t >= startAt && (Math.floor((t - startAt) / (5 * MIN)) % 2 === 0 || (t - startAt) % (5 * MIN) > 2 * MIN);
    list.push(blocked
      ? { at: t, clientIp: MIDORI, method: 'GET', uri: pages[n % pages.length], host: host, rule: 'rate-limit-per-ip', action: 'BLOCK', userAgent: ua, country: 'JP' }
      : { at: t, clientIp: MIDORI, method: 'GET', uri: pages[n % pages.length], host: host, action: 'ALLOW', userAgent: ua, country: 'JP' });
  }
  /* 青葉会計: 本文の長い求人の保存だけがブロックされる */
  [55, 41, 38, 22].forEach(function (m, k) {
    list.push({ at: now - m * MIN, clientIp: AOBA, method: 'POST', uri: '/company/jobs/9312', host: host, rule: 'AWS-AWSManagedRulesCommonRuleSet', action: 'BLOCK',
                ruleWithinGroup: 'SizeRestrictions_BODY', labels: ['awswaf:managed:aws:core-rule-set:SizeRestrictions_Body'], userAgent: ua, country: 'JP' });
    list.push({ at: now - m * MIN + 20000, clientIp: AOBA, method: 'GET', uri: '/company/jobs/9312/edit', host: host, action: 'ALLOW', userAgent: ua, country: 'JP' });
    if (k === 0) list.push({ at: now - 60 * MIN, clientIp: AOBA, method: 'POST', uri: '/company/jobs/9305', host: host, action: 'ALLOW', userAgent: ua, country: 'JP' });
  });
  return list;
}

var RANGE = "--time-window StartTime=$(date -u -d '3 hours ago' +%Y-%m-%dT%H:%M:%SZ),EndTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)";

window.LFR.scenarios.add({
  id: 'case46',
  firstLook: { name: 'リクエストを検査する設定を見つける', cmd: 'aws wafv2 list-web-acls --scope REGIONAL',
    desc: 'WebACLs に、ウェブ向けの通信を検査する設定の名前とIDが並びます。今回のサービスの設定を特定しましょう。' },
  level: 16,
  title: '一部のお客さまだけ 403 になる',
  subtitle: 'WAF の見本のリクエストで、どのルールが止めたかを読み分ける',

  description:
'サポートから2件の連絡がありました（~/support/inquiry.md）。\n' +
'どちらも「403 Forbidden」になるそうです。アプリのログには、その時間のリクエストが届いていません。\n\n' +
'本番の ALB には AWS WAF のウェブ ACL（' + ACL + '）が付いています（~/notes/waf.md）。\n' +
'手元の PC から AWS CLI で、2件がそれぞれどのルールで止められているかを突き止め、\n' +
'ミドリ物産が使えるようにしてください。',

  learn: [
    { name: 'ウェブ ACL のルール', cmd: 'aws wafv2 get-web-acl --scope REGIONAL --name myapp-prod-web-acl --id <ID>',
      desc: 'ウェブ ACL はルールを優先度の小さい順に調べ、最初に当たったルールのアクション（Allow / Block）で決めます。\n' +
            'どれにも当たらなければ、デフォルトアクションです。ID は list-web-acls --scope REGIONAL で分かります。' },
    { name: '見本のリクエスト', cmd: 'aws wafv2 get-sampled-requests --web-acl-arn <ARN> --rule-metric-name rate-limit-per-ip --scope REGIONAL --time-window StartTime=<UTC>,EndTime=<UTC> --max-items 100',
      desc: 'ウェブ ACL が見たリクエストの見本を、ルールごとに返します（指定できるのは過去3時間の範囲）。\n' +
            '送り元の IP（ClientIP）・URI・アクション、マネージドルールならルールグループの中のルール名（RuleNameWithinRuleGroup）とラベルが分かります。' },
    { name: 'レートベースルール', cmd: "aws wafv2 get-web-acl --scope REGIONAL --name myapp-prod-web-acl --id <ID> --query 'WebACL.Rules[1].Statement'",
      desc: '同じ IP から、決めた時間（既定は5分）に決めた数を超えたリクエストをブロックします。\n' +
            '会社の回線のように、大勢が1つのグローバル IP から使うと、まとめて数えられます。' },
    { name: 'IP セットに足す', cmd: 'aws wafv2 update-ip-set --scope REGIONAL --name myapp-allow-ips --id <ID> --addresses <今のアドレス> <足すアドレス> --lock-token <LockToken>',
      desc: 'update-ip-set はアドレスの一覧をまるごと置き換えます。今のアドレスも並べて書きます。\n' +
            '--lock-token は get-ip-set で取った値です。そのあとに誰かが変えていたら、WAFOptimisticLockException で失敗します。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  awsEnv: function (sim) {
    startAt = Math.floor((Date.now() - 65 * MIN) / MIN) * MIN;
    var env = sim.railsOnEc2({ maxAcu: 16 });
    sim.webAcl(env, {
      name: ACL,
      ipSets: { 'myapp-allow-ips': [OFFICE + '/32'] },
      rules: [
        { name: 'allow-office-ips', priority: 0, action: 'Allow', statement: { kind: 'ip-set', ipSet: 'myapp-allow-ips' } },
        { name: 'rate-limit-per-ip', priority: 1, action: 'Block', statement: { kind: 'rate-based', limit: 300, windowSec: 300 } },
        { name: 'AWS-AWSManagedRulesCommonRuleSet', priority: 2, action: 'Block', statement: { kind: 'managed', vendor: 'AWS', name: 'AWSManagedRulesCommonRuleSet' } }
      ],
      samples: samples()
    });
    return env;
  },

  hints: [
    'まずウェブ ACL の ARN と ID を調べ、ルールを見ます。\n\n' +
    "  aws wafv2 list-web-acls --scope REGIONAL\n\n" +
    'そのあと、ルールごとに見本のリクエストを取ります。--rule-metric-name はルールの名前（MetricName）です。\n' +
    '時刻は UTC で、過去3時間の範囲で指定します（date -u -d \'3 hours ago\' +%Y-%m-%dT%H:%M:%SZ）。',

    'ミドリ物産の IP（198.51.100.24）は、どのルールの見本に出てきますか。\n' +
    '青葉会計の IP（203.0.113.77）の見本には、RuleNameWithinRuleGroup とラベルが付いています。',

    'ミドリ物産を通すには、優先度 0 の allow-office-ips が見る IP セット（myapp-allow-ips）に、198.51.100.24/32 を足します。\n' +
    'get-ip-set で今のアドレスと LockToken を取り、update-ip-set で今のアドレスと一緒に渡します。'
  ],

  probes: [
    { key: 'readRules', label: 'ウェブ ACL のルールと優先度を確かめた',
      test: function (c, res) { return /get-web-acl\b/.test(c) && /rate-limit-per-ip/.test(res.stdout) && /RateBasedStatement/.test(res.stdout); } },
    { key: 'sampledRate', label: 'ミドリ物産のリクエストがレートベースルールでブロックされていることを見つけた',
      test: function (c, res) { return /get-sampled-requests/.test(c) && /rate-limit-per-ip/.test(c) && /198\.51\.100\.24/.test(res.stdout) && /BLOCK/.test(res.stdout); } },
    { key: 'sampledSize', label: '青葉会計の保存が SizeRestrictions_BODY でブロックされていることを見つけた',
      test: function (c, res) { return /get-sampled-requests/.test(c) && /SizeRestrictions_B(ODY|ody)/.test(res.stdout); } },
    { key: 'gotLockToken', label: 'IP セットの今のアドレスと LockToken を取った',
      test: function (c, res) { return /get-ip-set/.test(c) && /LockToken/.test(res.stdout); } },
    { key: 'updatedIpSet', label: 'IP セットにミドリ物産の IP を足した',
      test: function (c, res) { return /update-ip-set/.test(c) && /198\.51\.100\.24/.test(c) && res.exitCode === 0; } },
    { key: 'verifiedIpSet', label: '足したあとの IP セットで、前からのアドレスも残っていることを確かめた',
      test: function (c, res) { return /get-ip-set/.test(c) && /198\.51\.100\.24/.test(res.stdout) && /192\.0\.2\.10/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'readRules',     weight: 10, label: 'ルールと優先度を確かめた' },
    { key: 'sampledRate',   weight: 16, label: 'ミドリ物産を止めたルールを見本で突き止めた' },
    { key: 'sampledSize',   weight: 12, label: '青葉会計を止めたルールを見本で突き止めた' },
    { key: 'gotLockToken',  weight: 6,  label: 'IP セットの LockToken を取った' },
    { key: 'updatedIpSet',  weight: 10, label: 'IP セットを更新した' },
    { key: 'verifiedIpSet', weight: 6,  label: '更新したあとの IP セットを確かめた' }
  ],

  question: {
    text: 'ミドリ物産の全員が 403 になった理由は？',
    choices: [
      'コアルールセットがミドリ物産のブラウザーの User-Agent を攻撃とみなした',
      '約200人が同じグローバル IP から使っていて、IP ごとに5分で300リクエストまでのレートベースルールを超えた',
      'ミドリ物産の IP が AWS の既知の悪い IP のリストに入った',
      'ALB のターゲットが減り、ミドリ物産のリクエストが ALB で断られた'
    ],
    answer: 1,
    explain:
'ウェブ ACL のルールは優先度の順に allow-office-ips（Allow）、rate-limit-per-ip（Block）、コアルールセットです。\n\n' +
'rate-limit-per-ip の見本を取ると、198.51.100.24（ミドリ物産）からのリクエストが BLOCK になっています。\n' +
'このルールは同じ IP から5分で300を超えたリクエストをブロックします。\n' +
'約200人が本社の同じ回線から使うので、1人あたりは少なくても、1つの IP として合計で数えられます。\n' +
'数が減るとまた通るので、「しばらくすると開けることもある」という連絡とも合います。\n\n' +
'青葉会計は別の原因です。コアルールセットの見本に、203.0.113.77 の POST /company/jobs/9312 が出ていて、\n' +
'RuleNameWithinRuleGroup が SizeRestrictions_BODY、ラベルが awswaf:managed:aws:core-rule-set:SizeRestrictions_Body です。\n' +
'このルールは本文が 8 KB を超えるリクエストをブロックします。詳しく書いた求人の保存が、それに当たりました。\n\n' +
'ミドリ物産は、allow-office-ips が見る IP セットに 198.51.100.24/32 を足して通しました。\n' +
'update-ip-set はアドレスの一覧をまるごと置き換えるので、今のアドレス（192.0.2.10/32）も一緒に渡します。\n' +
'ただし、Allow のルールに当たった IP は、そのあとのルール（コアルールセットも）を調べられません。\n' +
'その IP から来る攻撃も通してしまうので、本当はレートベースルールの対象からだけ外す\n' +
'（スコープダウンのステートメントで、その IP セットを除く）か、上限を上げるほうが安全です。\n' +
'青葉会計の件は SizeRestrictions_BODY を Count にして、求人の保存の URL にだけ大きい本文を許すルールを足す、などで直します。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. 403 がアプリのログに無いときは、手前の WAF で止められていないかを疑う\n' +
'2. get-sampled-requests で、どのルールが、どの IP の、どの URI を止めたかを読む\n' +
'3. マネージドルールは RuleNameWithinRuleGroup とラベルで、グループの中のどのルールかが分かる\n' +
'4. IP ごとのレートベースルールは会社の回線や NAT の向こうの大勢をまとめて数える',
    wrong: [
'コアルールセットに止められたなら、見本に RuleNameWithinRuleGroup（どのルールか）が付きます。\n' +
'ミドリ物産のリクエストは rate-limit-per-ip の見本に出ています。',
null,
'ミドリ物産を止めているのは、ウェブ ACL の rate-limit-per-ip です。\n' +
'IP のリストを使うルール（AWSManagedRulesAmazonIpReputationList など）は、このウェブ ACL にありません。',
'ALB が断ったなら 502 や 503 になります。403 は WAF の Block の既定の応答です。\n' +
'見本でも、WAF が BLOCK しています。'
    ]
  },

  route: {
    steps: [
      'サポートの連絡で、2件の内容と送り元の IP を確かめる',
      'ウェブ ACL のルールと優先度を確かめる',
      'ルールごとに見本のリクエストを取り、ミドリ物産と青葉会計がどのルールで止められたかを読む',
      'IP セットの今のアドレスと LockToken を取り、ミドリ物産の IP を足す',
      '足したあとの IP セットを確かめる'
    ],
    commands: [
      'cat ~/support/inquiry.md',
      'cat ~/notes/waf.md',
      "ARN=$(aws wafv2 list-web-acls --scope REGIONAL --query 'WebACLs[0].ARN' --output text)",
      "ID=$(aws wafv2 list-web-acls --scope REGIONAL --query 'WebACLs[0].Id' --output text)",
      "aws wafv2 get-web-acl --scope REGIONAL --name myapp-prod-web-acl --id $ID --query 'WebACL.Rules[].{name:Name,priority:Priority,statement:Statement,action:Action}'",
      'aws wafv2 get-sampled-requests --web-acl-arn $ARN --rule-metric-name rate-limit-per-ip --scope REGIONAL ' + RANGE + " --max-items 100 --query 'SampledRequests[].[Timestamp,Request.ClientIP,Request.URI,Action]' --output text | tail -n 5",
      'aws wafv2 get-sampled-requests --web-acl-arn $ARN --rule-metric-name AWS-AWSManagedRulesCommonRuleSet --scope REGIONAL ' + RANGE + " --max-items 100 --query 'SampledRequests[].{ip:Request.ClientIP,method:Request.Method,uri:Request.URI,rule:RuleNameWithinRuleGroup,labels:Labels[].Name}'",
      "IPSET=$(aws wafv2 list-ip-sets --scope REGIONAL --query 'IPSets[?Name==`myapp-allow-ips`].Id' --output text)",
      'aws wafv2 get-ip-set --scope REGIONAL --name myapp-allow-ips --id $IPSET',
      "TOKEN=$(aws wafv2 get-ip-set --scope REGIONAL --name myapp-allow-ips --id $IPSET --query 'LockToken' --output text)",
      'aws wafv2 update-ip-set --scope REGIONAL --name myapp-allow-ips --id $IPSET --addresses 192.0.2.10/32 198.51.100.24/32 --lock-token $TOKEN',
      "aws wafv2 get-ip-set --scope REGIONAL --name myapp-allow-ips --id $IPSET --query 'IPSet.Addresses'"
    ],
    note:
'IP を Allow のルールに足すのは、いちばん早い対処ですが、その IP はほかのルールも調べられなくなります。\n' +
'落ち着いたら、レートベースルールの上限やスコープダウンを見直してください。'
  }
});
})();
