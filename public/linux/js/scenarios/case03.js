/* CASE 03 — 大量のRailsログから目的のエラーを探す */
(function () {
'use strict';
var APP = '/var/www/myapp';
var LOG = APP + '/shared/log/production.log';
var rankCommand = "grep ERROR log/production.log | awk '{print $8}' | grep '::' | sort | uniq -c | sort -rn";

/* 1時間ぶんのアクセスログに、4種類の例外を違う件数だけ混ぜる。
   「全部catして目で数える」が現実的でない量にしてある。 */
var EXCEPTIONS = [
  { n: 17, cls: 'Net::OpenTimeout',
    msg: 'execution expired',
    frame: 'app/services/job_board_client.rb:42:in `fetch_listings\'',
    ctrl: 'ProjectsController#index' },
  { n: 4,  cls: 'ActiveRecord::RecordNotFound',
    msg: "Couldn't find Project with 'id'=99999",
    frame: 'app/controllers/projects_controller.rb:8:in `show\'',
    ctrl: 'ProjectsController#show' },
  { n: 3,  cls: 'Redis::TimeoutError',
    msg: 'Connection timed out',
    frame: 'app/controllers/top_controller.rb:5:in `index\'',
    ctrl: 'TopController#index' },
  { n: 2,  cls: 'ActionView::Template::Error',
    msg: 'undefined method `salary_range\' for nil',
    frame: 'app/views/projects/_card.html.erb:12',
    ctrl: 'Company::ProjectsController#index' }
];

function pad2(n) { return String(n).padStart(2, '0'); }

function buildLog() {
  var events = [];
  var seq = 0;

  /* 正常系 */
  var ok = [
    ['GET', '/', 'TopController#index', 200, 41],
    ['GET', '/projects', 'ProjectsController#index', 200, 118],
    ['GET', '/projects/8821', 'ProjectsController#show', 200, 72],
    ['POST', '/entries', 'EntriesController#create', 302, 188],
    ['GET', '/company/projects', 'Company::ProjectsController#index', 200, 94]
  ];
  for (var i = 0; i < 90; i++) {
    var p = ok[i % ok.length];
    events.push({ t: 13 * 60 + 10 + Math.floor(i * 0.55), kind: 'ok', p: p, i: seq++ });
  }
  /* 異常系 */
  EXCEPTIONS.forEach(function (e, ei) {
    for (var k = 0; k < e.n; k++) {
      events.push({ t: 13 * 60 + 12 + Math.floor((k * 47 + ei * 13) % 50), kind: 'err', e: e, i: seq++ });
    }
  });

  events.sort(function (a, b) { return a.t - b.t || a.i - b.i; });

  var lines = [];
  events.forEach(function (ev, idx) {
    var hh = pad2(Math.floor(ev.t / 60)), mm = pad2(ev.t % 60), ss = pad2((idx * 7) % 60);
    var ts = '2026-09-14T' + hh + ':' + mm + ':' + ss + '.' + String(100 + (idx % 900)) + '+09:00';
    var pid = idx % 2 ? 1433 : 1434;
    var rid = (idx * 2654435761 >>> 0).toString(16).padStart(8, '0') + '-4a1b-4c2d-9e3f-5a6b7c8d9e0f';
    var head = 'I, [' + ts + ' #' + pid + ']  INFO -- : [' + rid + '] ';
    var errh = 'E, [' + ts + ' #' + pid + '] ERROR -- : [' + rid + '] ';

    if (ev.kind === 'ok') {
      lines.push(head + 'Started ' + ev.p[0] + ' "' + ev.p[1] + '" for 10.0.2.' + (10 + idx % 40) + ' at 2026-09-14 ' + hh + ':' + mm + ':' + ss + ' +0900');
      lines.push(head + 'Processing by ' + ev.p[2] + ' as HTML');
      lines.push(head + 'Completed ' + ev.p[3] + ' ' + (ev.p[3] === 200 ? 'OK' : 'Found') + ' in ' + ev.p[4] + 'ms (Views: ' + Math.round(ev.p[4] * 0.6) + '.2ms | ActiveRecord: ' + Math.round(ev.p[4] * 0.2) + '.1ms)');
    } else {
      var e = ev.e;
      lines.push(head + 'Started GET "/projects" for 10.0.2.' + (10 + idx % 40) + ' at 2026-09-14 ' + hh + ':' + mm + ':' + ss + ' +0900');
      lines.push(head + 'Processing by ' + e.ctrl + ' as HTML');
      lines.push(errh + e.cls + ' (' + e.msg + '):');
      lines.push(errh + e.frame);
      lines.push(head + 'Completed 500 Internal Server Error in ' + (900 + idx % 400) + 'ms');
    }
  });
  return lines.join('\n') + '\n';
}

var files = {};
files[LOG] = buildLog();
files[APP + '/shared/log/puma.access.log'] =
'10.0.2.31 - - [14/Sep/2026:13:41:02 +0900] "GET /projects HTTP/1.1" 500 1721 0.9821\n' +
'10.0.2.12 - - [14/Sep/2026:13:41:11 +0900] "GET / HTTP/1.1" 200 8842 0.0412\n';

window.LFR.scenarios.add({
  id: 'case03',
  manual: { title: 'GNU grep · 行の絞り込みと集計', url: 'https://www.gnu.org/software/grep/manual/grep.html#General-Output-Control' },
  level: 1,
  title: '大量のRailsログから、目的のエラーだけを探し出す',
  subtitle: 'Railsが残した処理の記録（ログ）を読み、どのエラーが一番多いかを確かめましょう。',

  guide: [
    { title: '直近のログを少しだけ読む', why: 'tail はファイルの末尾を表示します。-n 12 で読む範囲を最後の12行に絞ります。',
      commands: ['tail -n 12 log/production.log'], read: 'INFO は通常の処理、ERROR はエラーの記録です。同じリクエストでも複数行に分かれるので、ERROR の行数と障害件数は別々に考えます。' },
    { title: 'エラー名を指定して数える', why: 'grep は指定した文字を含む行を探します。-c を付けて、まず通信の待ち時間を超えたエラーの行数を数えます。',
      commands: ['grep -c "Net::OpenTimeout" log/production.log'], read: '数字が1つ返ります。この教材のログでは、1回の例外につきクラス名（エラーの種類を表す名前）が1行に記録されています。' },
    { title: 'ほかの3種類と件数を比べる', why: '同じファイルに対して、探す名前だけを変えます。次のコマンドを1つずつ実行してください。',
      commands: ['grep -c "ActiveRecord::RecordNotFound" log/production.log', 'grep -c "Redis::TimeoutError" log/production.log', 'grep -c "ActionView::Template::Error" log/production.log'],
      read: '前の手順の数字も合わせて4種類を比べます。最も大きい数字と、そのとき指定した名前の組が回答の根拠になります。' }
  ],

  description:
'監視ツールから「500エラーの発生率が上がっている」という通知が届きました。500は、サーバーがリクエストを処理できなかったことを示す応答です。\n' +
'ただし、どのエラーがどれだけ出ているかまでは分かりません。\n\n' +
'production.log には1時間ぶんのアクセスが記録されていて、数百行あります。\n' +
'全部catして目で追うのは現実的ではありません。\n\n' +
'「いま最も多く起きている例外は何か」を、コマンドで数えて特定してください。',

  learn: [
    { name: 'grep', cmd: 'grep ERROR log/production.log',
      desc: 'ファイルの中から、指定した文字列を含む行だけを取り出します。\n' +
            'Railsのログでは ERROR / Completed 500 / 例外クラス名 が目印になります。' },
    { name: 'grep -n', cmd: 'grep -n "Completed 500" log/production.log',
      desc: '-n を付けると行番号が付きます。\n' +
            '「このエラーはログの何行目か」が分かると、その前後を読み直せます。' },
    { name: 'grep -i', cmd: 'grep -i timeout log/production.log',
      desc: '-i は大文字小文字を区別しません。\n' +
            'gemによって Timeout / timeout / TIMEOUT と書き方が揺れるので、\n' +
            '「あるはずのものが見つからない」ときにまず試す価値があります。' },
    { name: 'grep -c', cmd: 'grep -c "Net::OpenTimeout" log/production.log',
      desc: '-c は該当した行数だけを返します。\n' +
            '「何件出ているか」を比べるときに、一番手早い方法です。' },
    { name: 'パイプでまとめて数える', cmd: rankCommand,
      desc: '縦棒 | は、左のコマンドの出力を右のコマンドに渡す記号です。\n' +
            'このログでは、例外名は空白で区切った8番目の項目に出ます。awk でその項目を取り出し、:: を含む名前だけを残します。\n' +
            'sort で同じ名前を並べ、uniq -c で数えます。最後の sort -rn は件数の多い順に並べます。' },
    { name: 'tail', cmd: 'tail -n 100 log/production.log',
      desc: '末尾だけを見ます。まず直近を眺めて当たりを付け、\n' +
            'それから grep で全体を数える、という順番が実戦的です。' }
  ],

  startDirectory: APP + '/current',
  files: files,

  hints: [
    '全部読もうとしないでください。まず tail -n 50 で直近だけを眺めて、\n' +
    'どんな例外クラスが出ているかを2〜3種類つかみましょう。',

    '例外クラスの名前が分かったら、次は件数を比べます。\n' +
    'grep -c "<例外クラス名>" log/production.log で1つずつ数えられます。',

    '1つずつ数えるのが面倒なら、パイプでまとめて数えられます。\n\n' +
    '  ' + rankCommand
  ],

  probes: [
    { key: 'grepped', label: 'grepでログを絞り込んだ',
      test: function (c, res) { return /\bgrep\b/.test(c) && res.stdout.length > 0; } },
    { key: 'counted', label: '件数を数えた（-c / wc -l / uniq -c）',
      test: function (c) { return /grep\s+(-\w*c)|wc\s+-l|uniq\s+-c/.test(c); } },
    { key: 'foundTimeout', label: 'Net::OpenTimeout を見つけた',
      test: function (c, res) { return /Net::OpenTimeout/.test(res.stdout); } },
    { key: 'comparedTwo', label: '2種類以上の例外を比較した',
      test: function (c, res, rt) {
        var seen = rt.investigation.commands.join('\n');
        var hits = ['Net::OpenTimeout', 'RecordNotFound', 'Redis::TimeoutError', 'Template::Error']
          .filter(function (k) { return seen.indexOf(k) >= 0; });
        return hits.length >= 2;
      } }
  ],

  evidence: [
    { key: 'inspectedRailsLog', weight: 8,  label: 'production.log を読んだ' },
    { key: 'grepped',           weight: 12, label: 'grepで必要な行だけに絞った' },
    { key: 'foundTimeout',      weight: 12, label: 'Net::OpenTimeout を見つけた' },
    { key: 'counted',           weight: 15, label: '目で数えずコマンドで件数を出した' },
    { key: 'comparedTwo',       weight: 13, label: '複数の例外を比較して多い方を選んだ' }
  ],

  question: {
    text: 'このログの中で、最も多く発生している例外はどれ？',
    choices: [
      'ActiveRecord::RecordNotFound',
      'Redis::TimeoutError',
      'Net::OpenTimeout',
      'ActionView::Template::Error'
    ],
    answer: 2,
    explain:
'件数を数えると、はっきり差が出ます。\n\n' +
'  $ grep -c "Net::OpenTimeout" log/production.log\n' +
'  17\n' +
'  $ grep -c "ActiveRecord::RecordNotFound" log/production.log\n' +
'  4\n' +
'  $ grep -c "Redis::TimeoutError" log/production.log\n' +
'  3\n' +
'  $ grep -c "ActionView::Template::Error" log/production.log\n' +
'  2\n\n' +
'Net::OpenTimeout が突出しています。\n' +
'さらに直前の行を見ると、発生箇所はここです。\n\n' +
'  app/services/job_board_client.rb:42:in `fetch_listings\'\n\n' +
'つまり「外部の求人APIを叩きに行って、接続が開かないまま時間切れになっている」。\n' +
'自社のRails・DB・Redisではなく、外部連携先が原因の候補として浮かび上がります。\n\n' +
'ここで大事なのは、答えそのものより数え方です。\n' +
'ログを目で追って印象で決めるのではなく、grep -c や uniq -c で\n' +
'「何件あるか」という事実に変換してから判断しています。',
    wrong: [
'ActiveRecord::RecordNotFound は4件で、3番目に多い例外です。\n' +
'存在しないIDへのアクセスなので、多くの場合クローラーや古いリンクが原因であり、\n' +
'今回の「500エラー急増」の主因ではありません。\n' +
'grep -c で数えて比べてみてください。',
'Redis::TimeoutError は3件です。目に付きやすい名前ですが、件数では4番目です。\n' +
'「それっぽい名前だから」ではなく、必ず数を確認してから判断してください。',
null,
'ActionView::Template::Error は2件で、最も少ない例外です。\n' +
'ビューでnilを触ってしまった類のバグで、直すべきではありますが、\n' +
'今回の増加分を説明できる件数ではありません。'
    ]
  },

  route: {
    steps: [
      '直近のログを眺めて、出ている例外の種類を把握する',
      '例外クラスごとに件数を数える',
      '最も多いものを特定する',
      '発生箇所（backtraceの1行目）まで確認する'
    ],
    commands: [
      'cd /var/www/myapp/current',
      'wc -l log/production.log',
      'tail -n 50 log/production.log',
      'grep -n "ERROR" log/production.log | tail -n 20',
      'grep -c "Net::OpenTimeout" log/production.log',
      'grep -c "ActiveRecord::RecordNotFound" log/production.log',
      'grep "Net::OpenTimeout" log/production.log | tail -n 3',
      'grep -A1 "Net::OpenTimeout" log/production.log | tail -n 5'
    ],
    note:
'grep | sort | uniq -c | sort -rn で一気にランキングを出すルートもありますし、\n' +
'grep -c を4回打つルートでも構いません。\n' +
'「目で数えない」という点さえ守れていれば、どちらも正しい調査です。'
  }
});
})();
