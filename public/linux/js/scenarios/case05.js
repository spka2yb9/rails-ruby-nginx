/* CASE 05 — Railsへのリクエストをリアルタイムで追う */
(function () {
'use strict';
var APP = '/var/www/myapp';
var LOG = APP + '/shared/log/production.log';

/* 過去ぶんのログ。ここにも同じ症状が埋まっているので、
   tail -f を使わず grep で探すルートでも辿り着ける。 */
function past() {
  var L = [];
  var ok = [
    ['GET', '/', 'TopController#index', 200, 44],
    ['GET', '/projects', 'ProjectsController#index', 200, 112],
    ['GET', '/projects/8821', 'ProjectsController#show', 200, 71],
    ['GET', '/company/projects', 'Company::ProjectsController#index', 200, 98]
  ];
  for (var i = 0; i < 40; i++) {
    var p = ok[i % ok.length];
    var mm = String(20 + Math.floor(i / 4)).padStart(2, '0');
    var ss = String((i * 13) % 60).padStart(2, '0');
    var t = '2026-09-14T14:' + mm + ':' + ss + '.' + String(100 + i * 7).slice(0, 3) + '+09:00';
    var rid = 'r' + (i * 7919).toString(16).padStart(6, '0') + '-9a1b-4c2d-8e3f-0a1b2c3d4e5f';
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Started ' + p[0] + ' "' + p[1] + '" for 10.0.2.' + (10 + i % 40) + ' at 2026-09-14 14:' + mm + ':' + ss + ' +0900');
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Processing by ' + p[2] + ' as HTML');
    L.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Completed ' + p[3] + ' OK in ' + p[4] + 'ms (Views: ' + Math.round(p[4] * 0.6) + '.1ms | ActiveRecord: ' + Math.round(p[4] * 0.2) + '.3ms)');
    /* 応募POSTは4回に1回だけ登場し、必ず422で落ちている */
    if (i % 8 === 3) {
      var t2 = '2026-09-14T14:' + mm + ':' + String((Number(ss) + 2) % 60).padStart(2, '0') + '.412+09:00';
      var rid2 = 'e' + (i * 104729).toString(16).padStart(6, '0') + '-3c4d-4e5f-a061-728394a5b6c7';
      L.push('I, [' + t2 + ' #1434]  INFO -- : [' + rid2 + '] Started POST "/entries" for 10.0.2.' + (10 + i % 40) + ' at 2026-09-14 14:' + mm + ':' + ss + ' +0900');
      L.push('I, [' + t2 + ' #1434]  INFO -- : [' + rid2 + '] Processing by EntriesController#create as HTML');
      L.push('W, [' + t2 + ' #1434]  WARN -- : [' + rid2 + '] Can\'t verify CSRF token authenticity.');
      L.push('E, [' + t2 + ' #1434] ERROR -- : [' + rid2 + '] ActionController::InvalidAuthenticityToken (ActionController::InvalidAuthenticityToken):');
      L.push('I, [' + t2 + ' #1434]  INFO -- : [' + rid2 + '] Completed 422 Unprocessable Entity in 7ms');
    }
  }
  return L.join('\n') + '\n';
}

var files = {};
files[LOG] = past();

window.LFR.scenarios.add({
  id: 'case05',
  level: 2,
  title: 'Railsへのリクエストをリアルタイムで追う',
  subtitle: 'tail -f で「今まさに起きていること」を見る',

  description:
'「応募ボタンを押しても、エラー画面になって応募できません」\n\n' +
'という問い合わせが数件届きました。ただし全員ではありません。\n' +
'自分の環境では再現しません。\n\n' +
'そこでカスタマーサポートに依頼して、\n' +
'「これから30秒ほど、実際に応募ボタンを押してもらう」ことにしました。\n\n' +
'その30秒のあいだに、本番サーバーのログを流しっぱなしにして、\n' +
'何が起きているかをその場で捕まえてください。',

  learn: [
    { name: 'tail -f', cmd: 'tail -f log/production.log',
      desc: 'ファイルの末尾を表示し続けます。新しい行が書かれるたびに画面へ流れてきます。\n' +
            '再現手順が分かっている不具合を「今まさに起きている瞬間」に捕まえるための道具です。\n' +
            '終了するには Ctrl+C を押します（これを知らないと抜けられません）。' },
    { name: 'Ctrl+C', cmd: 'tail -f log/production.log',
      desc: '実行中のコマンドに割り込み（SIGINT）を送って止めます。\n' +
            'tail -f / top / journalctl -f のように終わらないコマンドから戻るときに使います。\n' +
            'サーバー上で「戻れなくなった」ときの最初の一手です。' },
    { name: 'tail -f とパイプ', cmd: 'tail -f log/production.log | grep entries',
      desc: '流れてくる行を、その場で絞り込めます。\n' +
            'アクセスが多い本番では素のtail -fは速すぎて読めないので、\n' +
            '見たいパスや例外名でgrepしながら追うのが実戦的です。' },
    { name: 'journalctl -f', cmd: 'journalctl -u puma -f',
      desc: 'systemd側のログを追い続けます。\n' +
            'Railsのログに出ない「プロセスそのものの異常」を捕まえたいときに使います。' },
    { name: 'grep で後追い', cmd: 'grep -n "entries" log/production.log | tail -n 20',
      desc: 'リアルタイムで捕まえられなくても、同じ症状が過去ログに残っていれば後から探せます。\n' +
            'tail -f と grep は「今を見る」「過去を見る」の使い分けです。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '14:31:05',

  /* tail -f で流れてくる「今まさに起きている」リクエスト */
  liveLog: {
    path: LOG,
    intervalMs: 1200,
    lines: [
'I, [2026-09-14T14:31:08.220+09:00 #1433]  INFO -- : [a1b2c3d4-0001-4a5b-8c6d-7e8f90a1b2c3] Started GET "/projects/8821" for 203.0.113.44 at 2026-09-14 14:31:08 +0900',
'I, [2026-09-14T14:31:08.222+09:00 #1433]  INFO -- : [a1b2c3d4-0001-4a5b-8c6d-7e8f90a1b2c3] Processing by ProjectsController#show as HTML',
'I, [2026-09-14T14:31:08.301+09:00 #1433]  INFO -- : [a1b2c3d4-0001-4a5b-8c6d-7e8f90a1b2c3] Completed 200 OK in 79ms (Views: 51.2ms | ActiveRecord: 12.4ms)',
'I, [2026-09-14T14:31:14.885+09:00 #1434]  INFO -- : [a1b2c3d4-0002-4a5b-8c6d-7e8f90a1b2c3] Started POST "/entries" for 203.0.113.44 at 2026-09-14 14:31:14 +0900',
'I, [2026-09-14T14:31:14.887+09:00 #1434]  INFO -- : [a1b2c3d4-0002-4a5b-8c6d-7e8f90a1b2c3] Processing by EntriesController#create as HTML',
'W, [2026-09-14T14:31:14.888+09:00 #1434]  WARN -- : [a1b2c3d4-0002-4a5b-8c6d-7e8f90a1b2c3] Can\'t verify CSRF token authenticity.',
'E, [2026-09-14T14:31:14.890+09:00 #1434] ERROR -- : [a1b2c3d4-0002-4a5b-8c6d-7e8f90a1b2c3] ActionController::InvalidAuthenticityToken (ActionController::InvalidAuthenticityToken):',
'I, [2026-09-14T14:31:14.891+09:00 #1434]  INFO -- : [a1b2c3d4-0002-4a5b-8c6d-7e8f90a1b2c3] Completed 422 Unprocessable Entity in 6ms',
'I, [2026-09-14T14:31:21.104+09:00 #1433]  INFO -- : [a1b2c3d4-0003-4a5b-8c6d-7e8f90a1b2c3] Started GET "/" for 10.0.2.19 at 2026-09-14 14:31:21 +0900',
'I, [2026-09-14T14:31:21.168+09:00 #1433]  INFO -- : [a1b2c3d4-0003-4a5b-8c6d-7e8f90a1b2c3] Completed 200 OK in 64ms (Views: 42.0ms | ActiveRecord: 9.9ms)',
'I, [2026-09-14T14:31:27.702+09:00 #1434]  INFO -- : [a1b2c3d4-0004-4a5b-8c6d-7e8f90a1b2c3] Started POST "/entries" for 203.0.113.71 at 2026-09-14 14:31:27 +0900',
'I, [2026-09-14T14:31:27.704+09:00 #1434]  INFO -- : [a1b2c3d4-0004-4a5b-8c6d-7e8f90a1b2c3] Processing by EntriesController#create as HTML',
'W, [2026-09-14T14:31:27.705+09:00 #1434]  WARN -- : [a1b2c3d4-0004-4a5b-8c6d-7e8f90a1b2c3] Can\'t verify CSRF token authenticity.',
'E, [2026-09-14T14:31:27.707+09:00 #1434] ERROR -- : [a1b2c3d4-0004-4a5b-8c6d-7e8f90a1b2c3] ActionController::InvalidAuthenticityToken (ActionController::InvalidAuthenticityToken):',
'I, [2026-09-14T14:31:27.708+09:00 #1434]  INFO -- : [a1b2c3d4-0004-4a5b-8c6d-7e8f90a1b2c3] Completed 422 Unprocessable Entity in 6ms',
'I, [2026-09-14T14:31:35.331+09:00 #1433]  INFO -- : [a1b2c3d4-0005-4a5b-8c6d-7e8f90a1b2c3] Started GET "/projects" for 10.0.2.27 at 2026-09-14 14:31:35 +0900',
'I, [2026-09-14T14:31:35.449+09:00 #1433]  INFO -- : [a1b2c3d4-0005-4a5b-8c6d-7e8f90a1b2c3] Completed 200 OK in 118ms (Views: 70.1ms | ActiveRecord: 22.8ms)',
'I, [2026-09-14T14:31:42.910+09:00 #1434]  INFO -- : [a1b2c3d4-0006-4a5b-8c6d-7e8f90a1b2c3] Started POST "/entries" for 203.0.113.12 at 2026-09-14 14:31:42 +0900',
'E, [2026-09-14T14:31:42.914+09:00 #1434] ERROR -- : [a1b2c3d4-0006-4a5b-8c6d-7e8f90a1b2c3] ActionController::InvalidAuthenticityToken (ActionController::InvalidAuthenticityToken):',
'I, [2026-09-14T14:31:42.915+09:00 #1434]  INFO -- : [a1b2c3d4-0006-4a5b-8c6d-7e8f90a1b2c3] Completed 422 Unprocessable Entity in 5ms'
    ]
  },

  hints: [
    '再現できるタイミングが分かっているなら、ログを「あとから探す」より\n' +
    '「流しっぱなしにして待つ」ほうが確実です。\n' +
    'ログを追い続けるコマンドを使ってみましょう。',

    'tail -f log/production.log を実行して、10〜20秒ほど待ってください。\n' +
    '新しい行が流れてきます。止めたくなったら Ctrl+C です。\n' +
    'どのHTTPメソッドのどのパスが失敗しているかに注目してください。',

    '流れが速いと感じたら、その場で絞り込めます。\n\n' +
    '  tail -f log/production.log | grep -i entries\n\n' +
    '過去ログから同じものを探すなら、\n\n' +
    '  grep -n "Completed 422" log/production.log | tail'
  ],

  probes: [
    { key: 'usedTailF', label: 'tail -f でログを追い続けた',
      test: function (c) { return /\btail\b[^|]*-f|\bjournalctl\b[^|]*-f/.test(c); } },
    { key: 'sawEntriesPost', label: 'POST /entries が失敗しているのを見た',
      test: function (c, res) { return /POST "\/entries"/.test(res.stdout); } },
    { key: 'foundCsrf', label: 'InvalidAuthenticityToken を見つけた',
      test: function (c, res) { return /InvalidAuthenticityToken|verify CSRF token/.test(res.stdout); } },
    { key: 'saw422', label: '422 が返っていることを確認した',
      test: function (c, res) { return /Completed 422/.test(res.stdout); } },
    { key: 'checkedOtherPaths', label: '他のパスは正常だと確認して切り分けた',
      test: function (c, res) { return /Completed 200 OK/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'usedTailF',         weight: 12, label: 'tail -f / journalctl -f で追い続けた' },
    { key: 'sawEntriesPost',    weight: 12, label: 'POST /entries が失敗しているのを捕まえた' },
    { key: 'foundCsrf',         weight: 15, label: 'InvalidAuthenticityToken を見つけた' },
    { key: 'saw422',            weight: 10, label: '422 が返っていることを確認した' },
    { key: 'checkedOtherPaths', weight: 8,  label: '他のパスは200だと確認して切り分けた' }
  ],

  question: {
    text: 'リアルタイムで追った結果、失敗しているのはどのリクエスト？',
    choices: [
      'GET /projects（求人検索の一覧）',
      'POST /entries（応募の送信）',
      'GET /（トップページ）',
      'GET /company/projects（企業側の求人一覧）'
    ],
    answer: 1,
    explain:
'tail -f で流れてくる行を見ると、200 OK が並ぶ中に\n' +
'POST "/entries" のときだけ次の3行が現れます。\n\n' +
'  Can\'t verify CSRF token authenticity.\n' +
'  ActionController::InvalidAuthenticityToken\n' +
'  Completed 422 Unprocessable Entity\n\n' +
'GET系はすべて 200 OK で返せているので、アプリ全体が壊れているわけではありません。\n' +
'壊れているのは「フォームを送信する経路」だけです。\n\n' +
'InvalidAuthenticityToken は、フォームに埋め込まれたCSRFトークンと\n' +
'サーバー側のセッションが一致しないときに出ます。\n' +
'「全員ではなく一部のユーザーだけ」という症状とも整合します。\n' +
'（フォームのHTMLがキャッシュされて古いトークンのまま配られている、\n' +
'  SECRET_KEY_BASEが変わってセッションが読めなくなった、などが典型的な原因です）\n\n' +
'ここで大事なのは原因名を当てることではなく、\n' +
'「再現できる不具合は、ログを流しながらその場で捕まえられる」という手順です。',
    wrong: [
'GET /projects は流れてくるログの中で Completed 200 OK になっています。\n' +
'tail -f の出力をもう一度見てください。200で返っているリクエストは正常です。\n' +
'「エラーが出ている」と報告された画面と、実際に失敗しているリクエストは\n' +
'必ずしも同じではありません。ログで確かめるのが確実です。',
null,
'GET / も 200 OK で返っています。\n' +
'トップページが表示できている時点で、Rails・Puma・DBは動いています。\n' +
'失敗しているのはもっと狭い範囲です。',
'GET /company/projects も 200 OK です。\n' +
'企業側の画面も表示できているので、認証や権限の問題でもありません。\n' +
'失敗しているのはGETではなくPOST、つまり「送信」の経路です。'
    ]
  },

  route: {
    steps: [
      '再現できるタイミングを確保する（サポートに依頼する）',
      'ログを流しっぱなしにする（tail -f）',
      '流れてくる行の中から、200以外のものを見つける',
      '例外名と HTTPステータスを確認する',
      'GETは正常＝壊れているのは送信経路だけ、と切り分ける',
      'Ctrl+C で抜ける'
    ],
    commands: [
      'cd /var/www/myapp/current',
      'tail -f log/production.log',
      'tail -f log/production.log | grep -i entries',
      'grep -n \'POST "/entries"\' log/production.log | tail -n 5',
      'grep -n "Completed 422" log/production.log | tail -n 10',
      'grep -n "InvalidAuthenticityToken" log/production.log | tail -n 5',
      'grep -c "Completed 200" log/production.log'
    ],
    note:
'リアルタイムで捕まえられなくても、grep で過去ログから同じ症状を探せます。\n' +
'tail -f は「再現させられるとき」、grep は「もう起きてしまったとき」。\n' +
'どちらか一方ではなく、状況で使い分けてください。'
  }
});
})();
