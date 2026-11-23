/* CASE 28 — 大量のアクセスログから傾向を出す */
(function () {
'use strict';
var APP = '/var/www/myapp';
var NGX = '/var/log/nginx';

var files = {};

function pad2(n) { return String(n).padStart(2, '0'); }

/* 1日ぶんのnginxアクセスログ。
   末尾のフィールドが $request_time（秒）。 */
function buildAccess(day, withBot) {
  var L = [];
  var normal = [
    ['GET', '/', 200, 8842, 0.041],
    ['GET', '/projects', 200, 18422, 0.118],
    ['GET', '/projects/8821', 200, 12043, 0.079],
    ['POST', '/entries', 302, 512, 0.188],
    ['GET', '/company/projects', 200, 14208, 0.096],
    ['GET', '/assets/application.css', 200, 84021, 0.004]
  ];
  var ips = ['10.0.2.31', '10.0.2.18', '10.0.2.44', '10.0.2.27', '203.0.113.12', '198.51.100.7'];
  var ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';

  for (var h = 9; h < 21; h++) {
    for (var i = 0; i < 12; i++) {
      var n = normal[(h + i) % normal.length];
      var ip = ips[(h * 7 + i) % ips.length];
      L.push(ip + ' - - [' + day + '/Sep/2026:' + pad2(h) + ':' + pad2((i * 5) % 60) + ':' + pad2((i * 13) % 60) +
             ' +0900] "' + n[0] + ' ' + n[1] + ' HTTP/1.1" ' + n[2] + ' ' + n[3] +
             ' "-" "' + ua + '" ' + n[4].toFixed(3));
    }
    /* 19時台から、1つのIPが深いページを大量に叩き始める */
    if (withBot && h >= 19) {
      for (var b = 0; b < 42; b++) {
        var page = 700 + (h - 19) * 42 + b;
        var rt = (2.8 + (b % 9) * 0.12).toFixed(3);
        L.push('203.0.113.99 - - [' + day + '/Sep/2026:' + pad2(h) + ':' + pad2(b % 60) + ':' + pad2((b * 7) % 60) +
               ' +0900] "GET /projects?page=' + page + ' HTTP/1.1" 200 18422 "-" ' +
               '"Mozilla/5.0 (compatible; ScrapeBot/2.1; +http://example.net/bot)" ' + rt);
      }
    }
  }
  return L.join('\n') + '\n';
}

files[NGX + '/access.log'] = buildAccess('21', true);
files[NGX + '/access.log.1.gz'] = buildAccess('14', false);   /* 先週分（ローテート済み） */

files[NGX + '/error.log'] =
'2026/09/21 19:42:18 [warn] 781#781: *2041 an upstream response is buffered to a temporary file while reading upstream, client: 203.0.113.99, request: "GET /projects?page=812 HTTP/1.1"\n';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-21T19:42:18.114+09:00 #1433]  INFO -- : [c0ffee01-2233-4455-8667-8899aabbccdd] Started GET "/projects?page=812" for 203.0.113.99 at 2026-09-21 19:42:18 +0900\n' +
'I, [2026-09-21T19:42:18.116+09:00 #1433]  INFO -- : [c0ffee01-2233-4455-8667-8899aabbccdd] Processing by ProjectsController#index as HTML\n' +
'I, [2026-09-21T19:42:21.002+09:00 #1433]  INFO -- : [c0ffee01-2233-4455-8667-8899aabbccdd] Completed 200 OK in 2886ms (Views: 210.1ms | ActiveRecord: 2610.4ms)\n' +
'I, [2026-09-21T19:43:02.441+09:00 #1434]  INFO -- : [c0ffee02-3344-4556-9778-99aabbccddee] Started GET "/" for 10.0.2.18 at 2026-09-21 19:43:02 +0900\n' +
'I, [2026-09-21T19:43:02.482+09:00 #1434]  INFO -- : [c0ffee02-3344-4556-9778-99aabbccddee] Completed 200 OK in 41ms (Views: 28.2ms | ActiveRecord: 6.1ms)\n';

window.LFR.scenarios.add({
  id: 'case28',
  level: 10,
  title: '大量のアクセスログから傾向を出す',
  subtitle: '目で追わない。列を取り出して、数えて、並べる',

  description:
'「夜の時間帯だけサイトが重い」という報告が続いています。\n\n' +
'エラーは出ていません。全部200で返っています。ただ遅い。\n' +
'サーバーのCPUもメモリも余裕があります。\n\n' +
'nginxのアクセスログ（/var/log/nginx/access.log）には1日ぶん、\n' +
'約900行のリクエストが記録されています。\n' +
'先週ぶんは access.log.1.gz としてローテート済みで残っています。\n\n' +
'目で追える量ではありません。\n' +
'**列を取り出して、数えて、並べる**ことで傾向を出してください。',

  learn: [
    { name: 'awk で列を取り出す', cmd: 'awk \'{print $1}\' /var/log/nginx/access.log | head',
      desc: 'awkは1行を空白で区切って $1 $2 … として扱えるようにします。\n' +
            'nginxの標準フォーマット（combined）では列がこう並びます。\n\n' +
            '  $1  クライアントIP\n' +
            '  $4  [21/Sep/2026:19:42:18\n' +
            '  $6  "GET      $7 パス      $8 HTTP/1.1"\n' +
            '  $9  ステータスコード     $10 レスポンスのバイト数\n' +
            '  $NF 最後の列（この環境では $request_time）\n\n' +
            '区切り文字を変えるなら -F を使います。\n' +
            '  awk -F\'"\' \'{print $2}\'   … ダブルクォートで区切って、リクエスト行だけ取る\n\n' +
            '（実機のawkは条件式や集計も書けますが、まずは「列を取り出す」を確実にしてください）' },
    { name: '数えて並べる型', cmd: 'awk \'{print $1}\' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head',
      desc: 'Linuxで「ランキングを出す」ときの定型です。\n\n' +
            '  取り出す  awk \'{print $1}\'\n' +
            '  並べる    sort          ← uniq は「連続した同じ行」しか見ないので、先に必要\n' +
            '  数える    uniq -c\n' +
            '  多い順    sort -rn      ← -n は数値として、-r は降順\n' +
            '  上位だけ  head\n\n' +
            'この5つを繋ぐだけで、IP別・ステータス別・パス別・時間帯別、何でも出せます。' },
    { name: '時間帯で切る', cmd: 'awk \'{print $4}\' /var/log/nginx/access.log | cut -d: -f2 | sort | uniq -c',
      desc: '$4 は [21/Sep/2026:19:42:18 の形なので、: で区切った2番目が「時」です。\n' +
            '時間帯ごとの件数を出せば、「いつから増えたか」がひと目で分かります。\n' +
            'cut は awk より軽い、区切り専用の道具です。' },
    { name: '遅い順に並べる', cmd: 'awk \'{print $NF, $7}\' /var/log/nginx/access.log | sort -rn | head -n 5',
      desc: '最終列（$NF）がリクエストの処理時間です。\n' +
            'これとパス（$7）を並べて出し、数値の降順に並べ替えます。\n\n' +
            '  awk \'{print $NF, $7}\'   … 時間とパスを並べて出す\n' +
            '  sort -rn                  … 数値として降順（-n 数値 / -r 逆順）\n\n' +
            '「何が遅いか」を平均ではなく実物で見られます。\n' +
            'なお `sort -k11` のように列番号で指定する方法もありますが、\n' +
            'User-Agentに空白が含まれるので、この形式では列番号がずれます。\n' +
            '**$NF（最後の列）で取る**のが確実です。' },
    { name: '先週と比べる', cmd: 'zgrep -c "203.0.113.99" /var/log/nginx/access.log.1.gz',
      desc: 'ローテート済みのログは .gz になっています。\n' +
            'zgrep / zcat / zless を使えば、展開せずにそのまま読めます。\n\n' +
            '「先週は無かったのか、前からあったのか」は、原因の切り分けで決定的です。\n' +
            '新しく始まったことなら、その時期に何かが変わっています。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '20:14:02',
  date: 'Sep 21',

  system: {
    uptime: { since: '14 days, 02:40', users: 1, load: [1.82, 1.64, 1.21] },
    cpu:    { cores: 4, us: 22.1, sy: 4.2, id: 70.3, wa: 3.4 },
    mem:    { total: 7823, used: 3410, free: 1288, shared: 70, buffCache: 3125, available: 4102 },
    swap:   { total: 2047, used: 0, free: 2047 }
  },

  hints: [
    'まず「誰が」を出してください。IPごとの件数を数えれば、偏りがあるかどうかが分かります。\n' +
    '  awk \'{print $1}\' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head',

    '1つのIPが突出しているはずです。次はそのIPが何を叩いているかを見ます。\n' +
    '  grep 203.0.113.99 /var/log/nginx/access.log | awk \'{print $7}\' | head\n\n' +
    '時間帯でも切ってみてください。いつから増えたかが分かります。',

    '最後に「前からあったのか」を確認します。先週のログはローテート済みです。\n' +
    '  zgrep -c "203.0.113.99" /var/log/nginx/access.log.1.gz\n\n' +
    '0件なら、今週から始まったことになります。'
  ],

  probes: [
    { key: 'usedAwk', label: 'awkで列を取り出した',
      test: function (c, res) { return /\bawk\b/.test(c) && res.stdout.length > 0; } },
    { key: 'rankedIps', label: 'IPごとの件数を数えた',
      test: function (c, res) { return /uniq -c/.test(c) && /203\.0\.113\.99/.test(res.stdout); } },
    { key: 'foundBot', label: '突出しているIPを特定した',
      test: function (c, res) { return /203\.0\.113\.99/.test(res.stdout); } },
    { key: 'sawDeepPages', label: '深いページを叩いていることを確認した',
      test: function (c, res) { return /page=\d{3}/.test(res.stdout); } },
    { key: 'sawUserAgent', label: 'User-Agentを確認した',
      test: function (c, res) { return /ScrapeBot/.test(res.stdout); } },
    { key: 'slicedByHour', label: '時間帯ごとに切って増えた時刻を見た',
      test: function (c, res) { return /cut -d: -f2|awk .*\$4/.test(c) && /uniq -c/.test(c); } },
    { key: 'sortedBySlow', label: '遅い順に並べて実物を見た',
      test: function (c, res) { return /sort\s+-\w*r\w*n|sort\s+-\w*n\w*r|sort -k/.test(c) && /3\.[0-9]/.test(res.stdout); } },
    { key: 'comparedLastWeek', label: '先週のログ（.gz）と比べた',
      test: function (c, res) { return /zgrep|zcat/.test(c); } }
  ],

  evidence: [
    { key: 'usedAwk',          weight: 10, label: 'awkで列を取り出した' },
    { key: 'rankedIps',        weight: 16, label: 'IP別に数えて偏りを見つけた' },
    { key: 'sawDeepPages',     weight: 14, label: '何を叩いているかを確認した' },
    { key: 'sawUserAgent',     weight: 10, label: 'User-Agentまで確認した' },
    { key: 'slicedByHour',     weight: 12, label: '時間帯で切って開始時刻を見た' },
    { key: 'sortedBySlow',     weight: 10, label: '遅いリクエストの実物を見た' },
    { key: 'comparedLastWeek', weight: 18, label: '先週分と比較して新しい事象だと確定した' }
  ],

  question: {
    text: '夜だけ重くなる原因として、最も可能性が高いものは？',
    choices: [
      'アクセス数そのものが夜に増えていて、サーバーの能力を超えている',
      '特定のIPが深いページ（?page=800前後）を大量に叩いており、その1本1本が重い',
      'データベースのバックアップが夜間に走っている',
      'nginxの設定が誤っていて、静的ファイルもRailsへ流している'
    ],
    answer: 1,
    explain:
'「誰が」「何を」「いつから」の順で出していきます。\n\n' +
'【誰が】\n' +
'  $ awk \'{print $1}\' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head\n' +
'      84 203.0.113.99          ← 突出している\n' +
'      24 10.0.2.31\n' +
'      24 10.0.2.18\n' +
'      ...\n\n' +
'  1つのIPだけ桁が違います。まず偏りを見つけるのがこの型の強みです。\n\n' +
'【何を】\n' +
'  $ grep 203.0.113.99 /var/log/nginx/access.log | awk \'{print $7}\' | head\n' +
'  /projects?page=700\n' +
'  /projects?page=701\n' +
'  /projects?page=702\n' +
'  ...\n\n' +
'  ページ番号を1つずつ増やしながら叩いています。人間の操作ではありません。\n\n' +
'  $ grep 203.0.113.99 /var/log/nginx/access.log | awk -F\'"\' \'{print $6}\' | head -n 1\n' +
'  Mozilla/5.0 (compatible; ScrapeBot/2.1; +http://example.net/bot)\n\n' +
'  User-Agentにも名乗りが出ています。クローラです。\n\n' +
'【いつから】\n' +
'  $ awk \'{print $4}\' /var/log/nginx/access.log | cut -d: -f2 | sort | uniq -c\n' +
'      12 09\n' +
'      ...\n' +
'      54 19          ← 19時から件数が跳ね上がる\n' +
'      54 20\n\n' +
'  $ zgrep -c "203.0.113.99" /var/log/nginx/access.log.1.gz\n' +
'  0\n\n' +
'  先週は1件もありません。今週の19時から始まった、新しい事象です。\n\n' +
'【なぜ重いのか】\n' +
'  $ awk \'{print $NF, $7}\' /var/log/nginx/access.log | sort -rn | head -n 3\n' +
'  3.760 /projects?page=708\n' +
'  3.760 /projects?page=717\n' +
'  3.760 /projects?page=726\n\n' +
'  1本あたり2.8〜3.8秒かかっています。通常のページは0.04〜0.12秒です。\n' +
'  production.log を見ると、その内訳はほぼActiveRecordです。\n\n' +
'    Completed 200 OK in 2886ms (Views: 210.1ms | ActiveRecord: 2610.4ms)\n\n' +
'  深いページネーションは OFFSET が大きくなるほど重くなります。\n' +
'  page=800 なら、DBは「前の16,000行を読み飛ばしてから50行返す」という処理をします。\n' +
'  それが数秒おきに何十本も走れば、他のリクエストも道連れで遅くなります。\n\n' +
'--- 対応の方向 ---\n\n' +
'  ・User-Agentやrate limitでクローラを制御する（nginxのlimit_req、robots.txt）\n' +
'  ・深いページネーション自体を塞ぐ（100ページ以降は返さない、cursor方式へ）\n' +
'  ・アクセスが正当なら、OFFSETに頼らない実装へ変える\n\n' +
'いずれにせよ、**まず事実を数字にする**ことが先です。\n' +
'「夜が重い」という report を、「特定IPが19時から深いページを84本、1本3秒」\n' +
'という形まで落とせれば、対応は自然に決まります。',
    wrong: [
'アクセス総数だけでは説明できません。\n' +
'時間帯ごとに数えると、通常のアクセス（10.0.2.x など）は1時間あたり12件で\n' +
'夜も昼も変わりません。増えているのは 203.0.113.99 の分だけです。\n\n' +
'  $ awk \'{print $4}\' /var/log/nginx/access.log | cut -d: -f2 | sort | uniq -c\n\n' +
'また load average は1.8（4コア）で、サーバーは飽和していません。\n' +
'「全体が増えた」のか「一部が増えた」のかは、IP別に数えれば一発で分かります。',
null,
'バックアップは関係ありません。\n' +
'もしバックアップが原因なら、遅くなるのは全リクエストで、\n' +
'特定のパスだけが遅いという偏りは出ません。\n\n' +
'実際には /projects?page=NNN だけが2.8〜3.8秒で、\n' +
'同じ時間帯の / や /projects/8821 は0.04〜0.08秒で返っています。\n' +
'awk \'{print $NF, $7}\' | sort -rn で並べると、この偏りがはっきり見えます。',
'nginxの設定は正しく、静的ファイルは nginx が直接返しています。\n' +
'  $ grep "assets/application.css" /var/log/nginx/access.log | awk \'{print $NF}\'\n' +
'  0.004\n\n' +
'4ミリ秒で返っているので、Railsを経由していません。\n' +
'（Rails経由なら最低でも数十ミリ秒かかります）\n' +
'/etc/nginx/sites-enabled/myapp.conf の try_files も期待どおりの設定です。'
    ]
  },

  route: {
    steps: [
      'IP別に数えて、偏りがあるかを見る',
      '突出しているIPが何を叩いているかを見る',
      'User-Agentを確認して、人かボットかを判断する',
      '時間帯で切って、いつから始まったかを見る',
      '先週のログ（.gz）と比較して、新しい事象かを確定する',
      '遅い順に並べて、実際にどれだけ遅いかを見る',
      'アプリ側のログで、時間の内訳を確認する'
    ],
    commands: [
      'wc -l /var/log/nginx/access.log',
      'awk \'{print $1}\' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head',
      'awk \'{print $9}\' /var/log/nginx/access.log | sort | uniq -c | sort -rn',
      'grep 203.0.113.99 /var/log/nginx/access.log | awk \'{print $7}\' | head -n 5',
      'grep 203.0.113.99 /var/log/nginx/access.log | awk -F\'"\' \'{print $6}\' | head -n 1',
      'awk \'{print $4}\' /var/log/nginx/access.log | cut -d: -f2 | sort | uniq -c',
      'awk \'{print $NF, $7}\' /var/log/nginx/access.log | sort -rn | head -n 3',
      'zgrep -c "203.0.113.99" /var/log/nginx/access.log.1.gz',
      'zcat /var/log/nginx/access.log.1.gz | awk \'{print $1}\' | sort | uniq -c | sort -rn | head -n 3',
      'grep -n "page=812" log/production.log'
    ],
    note:
'順番は自由ですが、「誰が → 何を → いつから」で掘ると迷いません。\n' +
'そして必ず **先週分と比べてください**。\n' +
'「前からあった」のか「今週から始まった」のかで、対応の緊急度も方向もまったく変わります。'
  }
});
})();
