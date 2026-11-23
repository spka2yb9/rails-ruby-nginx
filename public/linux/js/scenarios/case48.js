/* CASE 48 — 30分サイトが落ちていたのに、アラームが鳴らなかった（CloudWatch の欠損データ）
   アラームは HTTPCode_Target_5XX_Count（ターゲットが返した 5xx）を見ていて、欠損データを notBreaching（しきい値を超えていない）として扱う。
   2台とも nginx が起動しなかったため、ALB がターゲットにつなげず、自分で 502 を返した（HTTPCode_ELB_5XX_Count）。
   ターゲットの 5xx は1件も無く、データが無い区間は「超えていない」とみなされて、アラームは OK のままだった */
(function () {
'use strict';
var ME = '/Users/i-wada';
var MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
var LB = 'app/myapp-prod-alb/50dc6c495c0c9188';
var TG = 'targetgroup/myapp-web-tg/6d0ecf831eec9f09';
var SNS = 'arn:aws:sns:ap-northeast-1:123456789012:myapp-alerts';

function hhmm(t) { return new Date(t + 9 * 3600000).toISOString().slice(11, 16); }

var outage = 0;   /* サイトが落ちていた30分の始まり。awsEnv で決める */

var files = {};
files[ME + '/.aws/config'] = '[default]\nregion = ap-northeast-1\noutput = json\n';
files[ME + '/.aws/credentials'] = '[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n';

files[ME + '/notes/incident.md'] = function () {
  return '# 障害のふりかえり（下書き）\n\n' +
    '- ' + hhmm(outage) + '〜' + hhmm(outage + 30 * MIN) + '（日本時間）、サイトが 502 Bad Gateway になっていた\n' +
    '- 原因: nginx の設定（ssl_ciphers）を2台に反映したとき、nginx -t をせずに再起動し、2台とも nginx が起動しなかった\n' +
    '- ' + hhmm(outage + 30 * MIN) + ' に、作業した本人が気づいて設定を戻した\n' +
    '- 5xx のアラーム（myapp-alb-target-5xx）は鳴らなかった。SNS（myapp-alerts）にも通知が来ていない。なぜ？\n';
};

/* 1分ごとのメトリクス（過去26時間）。値の無い分は「データ無し」 */
function series() {
  var now = Date.now(), start = Math.floor((now - 26 * HOUR) / MIN) * MIN;
  var down = function (t) { return t >= outage && t < outage + 30 * MIN; };
  var ok2xx = [], t5xx = [], e5xx = [], e502 = [], healthy = [], unhealthy = [];
  for (var t = start, k = 0; t < now - MIN; t += MIN, k++) {
    var load = 240 + (k * 37) % 80;
    if (down(t)) {
      e5xx.push({ t: t, v: load }); e502.push({ t: t, v: load });
      healthy.push({ t: t, v: 0 }); unhealthy.push({ t: t, v: 2 });
    } else {
      ok2xx.push({ t: t, v: load - (k % 3) });
      healthy.push({ t: t, v: 2 }); unhealthy.push({ t: t, v: 0 });
      /* アプリの例外で、ときどき 1〜2件の 500 が出る（障害の前後1時間には無い） */
      if (k % 97 === 0 && Math.abs(t - outage) > HOUR) t5xx.push({ t: t, v: 1 + k % 2 });
    }
  }
  /* 6日前、アプリの不具合で 500 が続いたとき（このときはアラームが鳴った） */
  var bug = Math.floor((now - 6 * DAY) / MIN) * MIN;
  for (var m = 0; m < 6; m++) t5xx.push({ t: bug + m * MIN, v: [24, 31, 18, 27, 12, 3][m] });
  t5xx.sort(function (a, b) { return a.t - b.t; });
  var lb = [{ Name: 'LoadBalancer', Value: LB }], both = [{ Name: 'LoadBalancer', Value: LB }, { Name: 'TargetGroup', Value: TG }];
  var ns = 'AWS/ApplicationELB';
  return [
    { namespace: ns, metricName: 'HTTPCode_Target_2XX_Count', dimensions: lb, points: ok2xx },
    { namespace: ns, metricName: 'HTTPCode_Target_5XX_Count', dimensions: lb, points: t5xx },
    { namespace: ns, metricName: 'HTTPCode_ELB_5XX_Count', dimensions: lb, points: e5xx },
    { namespace: ns, metricName: 'HTTPCode_ELB_502_Count', dimensions: lb, points: e502 },
    { namespace: ns, metricName: 'HealthyHostCount', dimensions: both, points: healthy },
    { namespace: ns, metricName: 'UnHealthyHostCount', dimensions: both, points: unhealthy }
  ];
}

function stats(metric, extra) {
  return "aws cloudwatch get-metric-statistics --namespace AWS/ApplicationELB --metric-name " + metric +
    " --dimensions Name=LoadBalancer,Value=" + LB + (extra || '') +
    " --start-time $(date -u -d '10 hours ago' +%Y-%m-%dT%H:%M:%SZ) --end-time $(date -u -d '8 hours ago' +%Y-%m-%dT%H:%M:%SZ)" +
    " --period 300 --statistics Sum --query 'sort_by(Datapoints,&Timestamp)[].[Timestamp,Sum]' --output text";
}

window.LFR.scenarios.add({
  id: 'case48',
  level: 16,
  title: '30分サイトが落ちていたのに、アラームが鳴らなかった',
  subtitle: 'アラームが見ているメトリクスと、データが無いときの扱いを確かめる',

  description:
'9時間ほど前、サイトが30分間 502 Bad Gateway になっていました（~/notes/incident.md）。\n' +
'原因は分かっていて、もう直っています。\n' +
'ところが、5xx を見張っているはずの CloudWatch のアラーム（myapp-alb-target-5xx）は鳴りませんでした。\n\n' +
'手元の PC から AWS CLI で、アラームが鳴らなかった理由を突き止め、同じ障害で鳴るアラームを足してください。\n' +
'ALB は ' + LB + '、ターゲットグループは ' + TG + ' です。',

  learn: [
    { name: 'アラームの設定と状態', cmd: 'aws cloudwatch describe-alarms --alarm-names myapp-alb-target-5xx',
      desc: 'MetricName（何を見るか）、Statistic と Period（どうまとめるか）、Threshold と ComparisonOperator（しきい値）、\n' +
            'EvaluationPeriods と DatapointsToAlarm（何区間のうち何区間で超えたら ALARM か）、TreatMissingData（データが無い区間の扱い）を読みます。' },
    { name: 'アラームの履歴', cmd: 'aws cloudwatch describe-alarm-history --alarm-name myapp-alb-target-5xx --history-item-type StateUpdate',
      desc: '状態が変わった記録です（30日分）。アラームは、状態が変わったときにアクション（SNS への通知など）を実行します。' },
    { name: 'メトリクスの値', cmd: "aws cloudwatch get-metric-statistics --namespace AWS/ApplicationELB --metric-name HTTPCode_ELB_5XX_Count --dimensions Name=LoadBalancer,Value=<ALB> --start-time <UTC> --end-time <UTC> --period 300 --statistics Sum",
      desc: 'ALB の 5xx には2種類あります。\n' +
            '  HTTPCode_Target_5XX_Count  ターゲット（Rails）が返した 5xx\n' +
            '  HTTPCode_ELB_5XX_Count     ALB が自分で返した 5xx（ターゲットにつなげなかったときの 502 など）\n' +
            'これらは値が 0 の区間を記録しません。その区間は「データ無し」になります。' },
    { name: 'データが無いときの扱い', cmd: "aws cloudwatch describe-alarms --alarm-names myapp-alb-target-5xx --query 'MetricAlarms[0].TreatMissingData'",
      desc: 'missing（既定）は、評価する区間がすべてデータ無しなら INSUFFICIENT_DATA にします。\n' +
            'notBreaching は「しきい値を超えていない」、breaching は「超えている」とみなします。ignore は今の状態を変えません。' },
    { name: 'アラームを足す', cmd: 'aws cloudwatch put-metric-alarm --alarm-name myapp-alb-elb-5xx --namespace AWS/ApplicationELB --metric-name HTTPCode_ELB_5XX_Count --dimensions Name=LoadBalancer,Value=<ALB> --statistic Sum --period 60 --evaluation-periods 3 --threshold 10 --comparison-operator GreaterThanOrEqualToThreshold --treat-missing-data notBreaching --alarm-actions <SNS トピックの ARN>',
      desc: '--alarm-actions に SNS のトピックを渡すと、ALARM になったときに通知します。' }
  ],

  local: { hostname: 'macbook', user: 'i-wada', home: ME },
  files: files,

  awsEnv: function (sim) {
    var now = Date.now();
    outage = Math.floor((now - 9 * HOUR) / MIN) * MIN;
    var env = sim.railsOnEc2({ maxAcu: 16 });
    var created = now - 200 * DAY, bug = Math.floor((now - 6 * DAY) / MIN) * MIN;
    sim.monitoring(env, {
      series: series(),
      alarms: [{
        alarmName: 'myapp-alb-target-5xx', alarmDescription: 'Rails が 5xx を返している', namespace: 'AWS/ApplicationELB', metricName: 'HTTPCode_Target_5XX_Count',
        dimensions: [{ Name: 'LoadBalancer', Value: LB }], statistic: 'Sum', period: 60, evaluationPeriods: 3, datapointsToAlarm: 3, threshold: 10,
        comparisonOperator: 'GreaterThanOrEqualToThreshold', treatMissingData: 'notBreaching', alarmActions: [SNS], createdAt: created,
        history: [
          { at: created, summary: 'Alarm "myapp-alb-target-5xx" created' },
          { at: created + 60000, summary: 'Alarm updated from INSUFFICIENT_DATA to OK' },
          { at: bug + 3 * MIN, summary: 'Alarm updated from OK to ALARM' },
          { at: bug + 3 * MIN + 2000, summary: 'Successfully executed action ' + SNS },
          { at: bug + 8 * MIN, summary: 'Alarm updated from ALARM to OK' }
        ]
      }]
    });
    return env;
  },

  hints: [
    'まずアラームの設定を読みます。何のメトリクスを見ていて、データが無い区間をどう扱う設定になっていますか。\n\n' +
    '  aws cloudwatch describe-alarms --alarm-names myapp-alb-target-5xx',

    '障害の時間帯に、アラームの状態が変わったかを履歴で確かめます（describe-alarm-history）。\n' +
    'そのあと、障害の時間帯の HTTPCode_Target_5XX_Count と HTTPCode_ELB_5XX_Count を get-metric-statistics で比べてください。\n' +
    '時刻は UTC で渡します（date -u -d \'10 hours ago\' +%Y-%m-%dT%H:%M:%SZ）。',

    'ALB はターゲットに接続を断られると、自分で 502 を返します。そのときターゲットの 5xx は増えません。\n' +
    'HTTPCode_ELB_5XX_Count を見るアラームを、同じ SNS のトピックに通知するように足してください。'
  ],

  probes: [
    { key: 'readAlarm', label: 'アラームが HTTPCode_Target_5XX_Count を notBreaching で見ていることを確かめた',
      test: function (c, res) { return /describe-alarms/.test(c) && /HTTPCode_Target_5XX_Count/.test(res.stdout) && /notBreaching/.test(res.stdout); } },
    { key: 'readHistory', label: '障害の時間帯にアラームの状態が変わっていないことを確かめた',
      test: function (c, res) { return /describe-alarm-history/.test(c) && /Alarm updated from/.test(res.stdout); } },
    { key: 'sawNoTarget5xx', label: '障害の時間帯に、ターゲットの 5xx のデータが無いことを確かめた',
      test: function (c, res) { return /get-metric-statistics/.test(c) && /HTTPCode_Target_5XX_Count/.test(c) && res.exitCode === 0 && !/\d{4}-\d\d-\d\dT/.test(res.stdout); } },
    { key: 'sawElb5xx', label: '障害の時間帯に、ALB が自分で 5xx を返していたことを確かめた',
      test: function (c, res) { return /get-metric-statistics/.test(c) && /HTTPCode_ELB_(5XX|502)_Count/.test(c) && /\b1\d{3}(\.0)?\b/.test(res.stdout); } },
    { key: 'addedAlarm', label: 'HTTPCode_ELB_5XX_Count を見るアラームを足した',
      test: function (c, res) { return /put-metric-alarm/.test(c) && /HTTPCode_ELB_5XX_Count/.test(c) && /alarm-actions/.test(c) && res.exitCode === 0; } },
    { key: 'verifiedAlarm', label: '足したアラームの設定と状態を確かめた',
      test: function (c, res) { return /describe-alarms/.test(c) && /HTTPCode_ELB_5XX_Count/.test(res.stdout) && /myapp-alerts/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'readAlarm',      weight: 12, label: 'アラームが見ているメトリクスと欠損データの扱いを確かめた' },
    { key: 'readHistory',    weight: 8,  label: 'アラームの状態が変わっていないことを確かめた' },
    { key: 'sawNoTarget5xx', weight: 14, label: 'ターゲットの 5xx が「データ無し」だったことを確かめた' },
    { key: 'sawElb5xx',      weight: 14, label: 'ALB が自分で 502 を返していたことを確かめた' },
    { key: 'addedAlarm',     weight: 10, label: 'ALB の 5xx を見るアラームを足した' },
    { key: 'verifiedAlarm',  weight: 4,  label: '足したアラームを確かめた' }
  ],

  question: {
    text: 'アラームが鳴らなかった理由は？',
    choices: [
      'SNS のトピックの購読が外れていて、ALARM になっても通知が届かなかった',
      'ALB がターゲットにつなげず自分で 502 を返したので、アラームが見る「ターゲットの 5xx」にはデータが無く、それを notBreaching で「超えていない」とみなした',
      'アラームの EvaluationPeriods が大きすぎて、30分では ALARM にならなかった',
      'CloudWatch のメトリクスの送信が遅れ、障害の時間帯のデータが失われた'
    ],
    answer: 1,
    explain:
'アラーム（myapp-alb-target-5xx）は、HTTPCode_Target_5XX_Count の1分ごとの合計が3区間続けて10以上なら ALARM、\n' +
'データが無い区間は notBreaching（しきい値を超えていない）とみなす設定です。\n' +
'履歴を見ると、障害の時間帯に状態は変わっていません（6日前のアプリの不具合のときは ALARM になり、SNS に通知しています）。\n\n' +
'障害の時間帯のメトリクスを比べると、こうなっています。\n' +
'  HTTPCode_Target_5XX_Count  データ無し\n' +
'  HTTPCode_ELB_5XX_Count      5分ごとに 1,300 前後\n' +
'  HealthyHostCount            0\n\n' +
'2台とも nginx が起動していなかったので、ALB がターゲットにつなごうとすると、接続を断られました。\n' +
'そのとき ALB は自分で 502 を返します。これは HTTPCode_ELB_5XX_Count に数えられ、ターゲットの 5xx には数えられません。\n' +
'（ターゲットがすべて unhealthy のとき、ALB はすべてのターゲットに送るので、リクエストは断られ続けます）\n' +
'ターゲットの 5xx は、値が無い区間を記録しないので「データ無し」になり、notBreaching の設定で「超えていない」とみなされました。\n\n' +
'notBreaching にしていたのは、ふだんはターゲットの 5xx がほとんど無く、missing のままだと INSUFFICIENT_DATA が続くからです。\n' +
'その設定のまま、「アプリが 5xx を返す」障害しか見張れていませんでした。\n\n' +
'直し方は、ALB が返す 5xx（HTTPCode_ELB_5XX_Count）を見るアラームを足すことです。\n' +
'あわせて HealthyHostCount が 1 未満のアラーム（データが無ければ breaching）も足すと、ターゲットが全部落ちたことを直接見張れます。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. アラームが鳴らなかったら、見ているメトリクスと TreatMissingData を確かめる\n' +
'2. ALB の 5xx は「ターゲットが返したもの」と「ALB が返したもの」で別のメトリクスになる\n' +
'3. 値が 0 の区間を記録しないメトリクスでは、「データ無し」が「正常」とも「全部止まった」とも読める\n' +
'4. アプリの不具合と、サーバーが丸ごと止まった場合の両方を見張るアラームを用意する',
    wrong: [
'SNS の問題なら、アラームの履歴に「OK から ALARM」の状態の変化が残ります。\n' +
'今回は、障害の時間帯に状態が変わっていません。',
null,
'EvaluationPeriods は3（1分ずつ）なので、3分続けば ALARM になります。30分あれば十分です。\n' +
'そもそも、見ているメトリクスにデータがありませんでした。',
'ALB の 5xx（HTTPCode_ELB_5XX_Count）には、障害の時間帯のデータがそろっています。\n' +
'メトリクスが失われたのではなく、アラームが別のメトリクスを見ていました。'
    ]
  },

  route: {
    steps: [
      'ふりかえりの下書きで、障害の時間帯と原因を確かめる',
      'アラームの設定（メトリクス・しきい値・TreatMissingData）を読む',
      'アラームの履歴で、障害の時間帯に状態が変わっていないことを確かめる',
      '障害の時間帯の、ターゲットの 5xx・ALB の 5xx・正常なターゲットの数を比べる',
      'ALB の 5xx を見るアラームを足し、設定を確かめる'
    ],
    commands: [
      'cat ~/notes/incident.md',
      'aws cloudwatch describe-alarms --alarm-names myapp-alb-target-5xx',
      "aws cloudwatch describe-alarm-history --alarm-name myapp-alb-target-5xx --history-item-type StateUpdate --query 'AlarmHistoryItems[].[Timestamp,HistorySummary]' --output text",
      stats('HTTPCode_Target_5XX_Count'),
      stats('HTTPCode_ELB_5XX_Count'),
      stats('HealthyHostCount', ' Name=TargetGroup,Value=' + TG).replace('--statistics Sum', '--statistics Minimum').replace('[Timestamp,Sum]', '[Timestamp,Minimum]'),
      'aws cloudwatch put-metric-alarm --alarm-name myapp-alb-elb-5xx --alarm-description "ALB が 5xx を返している（ターゲットにつなげない）" --namespace AWS/ApplicationELB --metric-name HTTPCode_ELB_5XX_Count --dimensions Name=LoadBalancer,Value=' + LB + ' --statistic Sum --period 60 --evaluation-periods 3 --threshold 10 --comparison-operator GreaterThanOrEqualToThreshold --treat-missing-data notBreaching --alarm-actions ' + SNS,
      "aws cloudwatch describe-alarms --alarm-name-prefix myapp-alb --query 'MetricAlarms[].[AlarmName,MetricName,TreatMissingData,StateValue,AlarmActions[0]]' --output text"
    ],
    note:
'アラームを作ったら、見張りたい障害を思い浮かべて「そのとき、このメトリクスは本当に増えるか」を確かめてください。\n' +
'止まったときに値が出なくなるメトリクスは、データが無いことを breaching とみなすか、別のメトリクスで見張ります。'
  }
});
})();
