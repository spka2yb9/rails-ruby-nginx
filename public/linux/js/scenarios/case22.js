/* CASE 22 — 本番のrails consoleで安全に調べる */
(function () {
'use strict';
var APP = '/var/www/myapp';

var files = {};
files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T11:02:14.114+09:00 #1433]  INFO -- : [aa11bb22-cc33-4dd4-8ee5-ff6600aa11bb] Started POST "/entries" for 203.0.113.44 at 2026-09-14 11:02:14 +0900\n' +
'I, [2026-09-14T11:02:14.302+09:00 #1433]  INFO -- : [aa11bb22-cc33-4dd4-8ee5-ff6600aa11bb] Completed 302 Found in 188ms (ActiveRecord: 41.2ms)\n' +
'I, [2026-09-14T11:02:15.088+09:00 #1434]  INFO -- : [bb22cc33-dd44-4ee5-9ff6-00aa11bb22cc] Started POST "/entries" for 203.0.113.44 at 2026-09-14 11:02:15 +0900\n' +
'I, [2026-09-14T11:02:15.271+09:00 #1434]  INFO -- : [bb22cc33-dd44-4ee5-9ff6-00aa11bb22cc] Completed 302 Found in 183ms (ActiveRecord: 39.8ms)\n';

files[APP + '/releases/20260914120000/app/controllers/entries_controller.rb'] =
'class EntriesController < ApplicationController\n' +
'  def create\n' +
'    @entry = current_user.entries.build(entry_params)\n' +
'    # TODO: 二重送信対策（ボタンのdisableのみで、サーバー側の一意制約が無い）\n' +
'    if @entry.save\n' +
'      redirect_to project_path(@entry.project), notice: "応募しました"\n' +
'    else\n' +
'      render :new, status: :unprocessable_entity\n' +
'    end\n' +
'  end\n' +
'end\n';

files['/home/deploy/console-policy.md'] =
'# 本番consoleの運用ルール\n' +
'\n' +
'1. 調査目的なら必ず `--sandbox` を付けて開く\n' +
'   （終了時に自動でrollbackされるので、うっかり書き換えても残らない）\n' +
'2. 書き込みが必要な場合は、事前に手順を作りレビューを通す\n' +
'   - 対象件数を数えた結果を手順に書く\n' +
'   - 実行はペア作業、実行ログを残す\n' +
'3. `destroy_all` / `delete_all` / `update_all` は手順レビュー無しで打たない\n' +
'4. 個人情報（email、電話番号）は画面に出さない。必要なら id だけを扱う\n';

var TABLE = [
  { re: /^Rails\.env$/, out: '=> "production"' },
  { re: /connection_db_config\.database|ActiveRecord::Base\.connection\.current_database/,
    out: '=> "myapp_production"' },
  { re: /^Entry\.count$/, out: '=> 482913' },
  { re: /^User\.count$/, out: '=> 91204' },

  { re: /Entry\.where\(user_id:\s*12345\)\.count/, out: '=> 2' },
  { re: /Entry\.where\(user_id:\s*12345\)\.pluck/,
    out: '=> [[880201, 8821, "2026-09-14 11:02:14"], [880202, 8821, "2026-09-14 11:02:15"]]' },
  { re: /Entry\.where\(user_id:\s*12345\)(\.order\([^)]*\))?$/,
    out: '=> [#<Entry id: 880201, user_id: 12345, project_id: 8821, created_at: "2026-09-14 11:02:14">,\n' +
         '    #<Entry id: 880202, user_id: 12345, project_id: 8821, created_at: "2026-09-14 11:02:15">]' },

  { re: /Entry\.group\(.*user_id.*project_id.*\).*having.*count/i, out: '=> 37' },
  { re: /Entry\.where\(created_at:.*\)\.count/, out: '=> 1284' },

  { re: /User\.find\(12345\)\.(email|name|phone)/,
    blocked: true,
    out: '\x1b[33m[学習環境] 個人情報をconsoleの画面に出さないでください。\n' +
         '調査にidだけで足りるなら、値そのものを表示する必要はありません。\n' +
         'ターミナルの出力は画面共有・録画・スクロールバックに残ります。\x1b[0m' },

  { re: /User\.find\(12345\)/,
    out: '=> #<User id: 12345, email: "[FILTERED]", name: "[FILTERED]", created_at: "2025-11-02 09:14:22">' },
  { re: /(destroy_all|delete_all|update_all)/,
    blocked: true,
    out: '\x1b[31m[学習環境] このCASEでは一括更新・一括削除を実行できません。\x1b[0m\n' +
         'まず件数を数え（.count）、中身を確認し（.pluck）、\n' +
         '手順をレビューしてもらってから実行してください。左の注意カードも読んでください。' },

  { re: /^Entry\.find\(880202\)\.destroy$/,
    blocked: true,
    out: '\x1b[31m[学習環境] 単体のdestroyもこのCASEでは実行しません。\x1b[0m\n' +
         '「1件消せば直る」ように見えても、同じ状態のユーザーが他に36人います。\n' +
         '個別対応ではなく、まとめて直す手順と、再発防止（一意制約）を用意してください。' }
];

window.LFR.scenarios.add({
  id: 'case22',
  level: 8,
  title: '本番のrails consoleで安全に調べる',
  subtitle: '最も便利で、最も壊せる道具',

  description:
'カスタマーサポートから問い合わせが来ました。\n\n' +
'「会員ID 12345 の方から、同じ求人に2回応募したことになっていると連絡がありました」\n\n' +
'応募データの状況を確認してください。\n' +
'そして「この人だけの問題なのか、他にも起きているのか」まで確かめてください。\n\n' +
'本番のデータベースを直接見ることになります。\n' +
'consoleは1行でデータを壊せる道具です。開き方から気をつけてください。\n\n' +
'※このCASEのTerminalでは rails console が使えます。exit で抜けられます。',

  learn: [
    { name: 'rails console --sandbox', cmd: 'rails console --sandbox',
      desc: '本番のRailsを読み込んだ対話環境を開きます。\n\n' +
            '--sandbox を付けると、consoleの中での変更はすべてトランザクションに包まれ、\n' +
            '**exit したときに自動でrollbackされます**。\n' +
            '調査目的なら必ず付けてください。うっかり save! しても本番には残りません。\n\n' +
            '逆に付けずに開くと、打った1行がそのまま本番に反映されます。' },
    { name: 'まず件数を数える', cmd: 'Entry.where(user_id: 12345).count',
      desc: 'いきなりレコードを表示せず、まず件数から入ります。\n' +
            '「本当に2件あるのか」を事実として確定させてから、中身を見ます。\n\n' +
            '書き換える場合はさらに重要です。\n' +
            '「この条件が何件に効くのか」を数えずに update_all / destroy_all を打つのは、\n' +
            '本番でいちばんやってはいけない操作です。' },
    { name: 'pluck で必要な列だけ見る', cmd: 'Entry.where(user_id: 12345).pluck(:id, :project_id, :created_at)',
      desc: 'レコード全体を表示すると、氏名・メールアドレスなどの個人情報まで画面に出ます。\n' +
            'pluck で必要な列だけを取り出せば、それを避けられます。\n\n' +
            'ターミナルの出力は画面共有・録画・スクロールバックに残ります。\n' +
            '「調査に必要な最小限だけを表示する」を習慣にしてください。' },
    { name: '影響範囲を広げて数える', cmd: 'Entry.group(:user_id, :project_id).having("count(*) > 1").count.size',
      desc: '個別の問い合わせに答えるだけで終わらせないための一手です。\n' +
            '同じ状態が他に何件あるかを数えると、対応の優先度と方法が変わります。\n' +
            '1件なら手で直す、数十件ならまとめて直す手順を作る、という判断ができます。' },
    { name: 'exit', cmd: 'exit',
      desc: 'consoleを抜けます。--sandbox で開いていれば、ここでrollbackされます。\n' +
            '本番のconsoleを開きっぱなしにしないでください。\n' +
            '（開いたままのセッションはDBのコネクションを掴み続けます）' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '11:40:12',

  rails: {
    version: '7.2.1',
    console: { table: TABLE }
  },

  hints: [
    '本番のデータを見るには rails console を使います。\n' +
    'ただし開き方に作法があります。~/console-policy.md にチームのルールが書いてあります。',

    'rails console --sandbox で開いてください。\n' +
    'まず件数から確認します。\n\n' +
    '  Entry.where(user_id: 12345).count\n\n' +
    '次に中身を見ますが、レコード全体ではなく必要な列だけにしてください。',

    'この人だけの問題かどうかを確かめてください。\n\n' +
    '  Entry.group(:user_id, :project_id).having("count(*) > 1").count.size\n\n' +
    '同じ状態が他にもあるなら、1件消して終わりにはできません。'
  ],

  probes: [
    { key: 'readPolicy', label: 'consoleの運用ルールを確認した',
      test: function (c, res) { return /--sandbox/.test(res.stdout) && /運用ルール|console-policy/.test(res.stdout + c); } },
    { key: 'usedSandbox', label: '--sandbox を付けてconsoleを開いた',
      test: function (c, res) { return /console|^\s*rails\s+c\b/.test(c) && /--sandbox|-s\b/.test(c); } },
    { key: 'countedFirst', label: 'まず件数を数えた',
      test: function (c, res) { return /\.count/.test(c) && /=> \d+/.test(res.stdout); } },
    { key: 'usedPluck', label: 'pluckで必要な列だけ表示した',
      test: function (c, res) { return /\.pluck/.test(c) && res.exitCode === 0; } },
    { key: 'foundDuplicate', label: '2件登録されていることを確認した',
      test: function (c, res) { return /=> 2$|880201/.test(res.stdout); } },
    { key: 'measuredImpact', label: '他にも同じ状態があるか数えた',
      test: function (c, res) { return /having/i.test(c) && /=> 37/.test(res.stdout); } },
    { key: 'leftConsole', label: 'consoleを閉じた',
      test: function (c, res) { return /^(exit|quit)\s*$/.test(c); } }
  ],

  evidence: [
    { key: 'readPolicy',     weight: 8,  label: '運用ルールを確認した' },
    { key: 'usedSandbox',    weight: 20, label: '--sandbox を付けて開いた' },
    { key: 'countedFirst',   weight: 14, label: 'まず件数から確認した' },
    { key: 'usedPluck',      weight: 12, label: '必要な列だけを表示した' },
    { key: 'foundDuplicate', weight: 12, label: '二重登録を事実として確認した' },
    { key: 'measuredImpact', weight: 18, label: '影響範囲を数えた' },
    { key: 'leftConsole',    weight: 6,  label: 'consoleを閉じた' }
  ],

  question: {
    text: '本番のconsoleで調査するときの作法として、最も適切なものは？',
    choices: [
      'rails console を開き、問題のレコードを見つけたらその場で destroy して直す',
      'rails console --sandbox で開いて読み取りだけで確認し、変更が必要なら影響件数を数えたうえで別途手順を用意する',
      'rails runner に1行で書いて実行する（consoleを開かない分そのほうが安全）',
      'mysql で直接 DELETE を投げる（Railsを経由しない分そのほうが速くて確実）'
    ],
    answer: 1,
    explain:
'調査の中身と、やり方の両方に答えがあります。\n\n' +
'【何が分かったか】\n\n' +
'  irb> Entry.where(user_id: 12345).count\n' +
'  => 2\n' +
'  irb> Entry.where(user_id: 12345).pluck(:id, :project_id, :created_at)\n' +
'  => [[880201, 8821, "2026-09-14 11:02:14"],\n' +
'      [880202, 8821, "2026-09-14 11:02:15"]]\n\n' +
'  同じ project_id への応募が1秒差で2件。production.log を見ても、\n' +
'  POST /entries が11:02:14と11:02:15に2回届いています。二重送信です。\n\n' +
'  そして、この人だけではありません。\n\n' +
'  irb> Entry.group(:user_id, :project_id).having("count(*) > 1").count.size\n' +
'  => 37\n\n' +
'  同じ状態が37組あります。1件消して終わりにはできません。\n' +
'  コードを見ると、二重送信対策がボタンのdisableだけで、\n' +
'  サーバー側に一意制約が無いことも分かります。\n\n' +
'【やり方のどこが大事か】\n\n' +
'1. --sandbox を付けて開く\n' +
'   consoleの中の変更はすべてトランザクションに包まれ、exit時にrollbackされます。\n' +
'   調査中にうっかり save! しても本番には残りません。\n' +
'   付け忘れて開いたconsoleは、1行のtypoで数万件を壊せる道具です。\n\n' +
'2. 件数 → 中身 → 影響範囲 の順で見る\n' +
'   いきなりレコードを表示せず、まず .count で事実を確定させます。\n' +
'   書き換える場合はなおさらで、「この条件が何件に効くか」を数えずに\n' +
'   destroy_all / update_all を打つのは、本番で最も避けたい操作です。\n\n' +
'3. 必要な列だけ表示する\n' +
'   レコード全体を出すと氏名やメールアドレスまで画面に出ます。\n' +
'   pluck(:id, :project_id) のように、調査に要る列だけにしてください。\n' +
'   ターミナルの出力は画面共有・録画・履歴に残ります。\n\n' +
'4. 変更は console の外で、手順として実行する\n' +
'   37組をどう直すか（新しい方を残す？古い方を残す？通知は？）は\n' +
'   その場で決められる話ではありません。\n' +
'   手順を書き、レビューを受け、実行ログを残して行います。\n' +
'   そして再発防止として、entries に一意制約（user_id, project_id）を\n' +
'   追加するmigrationが必要です。\n\n' +
'consoleは「調べる場所」であって「直す場所」ではない、と考えてください。',
    wrong: [
'その場で destroy してしまうのが、いちばん危ない進め方です。\n\n' +
'理由は3つあります。\n' +
'  ・戻せません。destroy した1件はバックアップからの復旧作業になります\n' +
'  ・同じ状態が他に36組あることに気づかないまま終わります\n' +
'  ・記録が残りません。誰が何を消したのかを後から追えません\n\n' +
'加えて --sandbox なしで開いていれば、調査中のtypoもそのまま本番に反映されます。\n' +
'まず読み取りで全体像を掴んでから、直し方を決めてください。',
null,
'rails runner は「1行で書いて実行する」ため、むしろ危険な側面があります。\n\n' +
'  ・--sandbox に相当する安全装置がありません\n' +
'  ・打った瞬間に実行されます。確認する間がありません\n' +
'  ・シェルの履歴に残るので、上矢印で誤って再実行する事故が起きます\n\n' +
'runner が向くのは「レビュー済みの手順を、決まった形で実行する」場面です。\n' +
'これから調べる、という段階では sandbox 付きの console のほうが安全です。',
'DBへ直接 DELETE を投げるのは、いくつもの仕組みを飛び越えることになります。\n\n' +
'  ・Railsのコールバック（関連レコードの削除、カウンタの更新など）が走りません\n' +
'  ・バリデーションもモデルの整合性チェックも効きません\n' +
'  ・アプリ側のキャッシュが古いまま残ります\n\n' +
'結果として「応募は消えたのに応募数のカウンタは2のまま」のような、\n' +
'追いにくい不整合が生まれます。\n' +
'DBを直接触るのは、Rails経由では手が届かないときの最後の手段です。'
    ]
  },

  route: {
    steps: [
      'チームの運用ルールを確認する',
      '--sandbox を付けてconsoleを開く',
      'まず件数を数える',
      '必要な列だけを表示して中身を確認する',
      'アプリのログと突き合わせて、二重送信だと確定させる',
      '同じ状態が他に何件あるかを数える',
      'コードを読んで、なぜ起きるのかを確認する',
      'consoleを閉じる（sandboxならrollbackされる）'
    ],
    commands: [
      'cat ~/console-policy.md',
      'rails console --sandbox',
      'Rails.env',
      'Entry.where(user_id: 12345).count',
      'Entry.where(user_id: 12345).pluck(:id, :project_id, :created_at)',
      'Entry.group(:user_id, :project_id).having("count(*) > 1").count.size',
      'exit',
      'grep -n "POST \\"/entries\\"" log/production.log',
      'cat app/controllers/entries_controller.rb'
    ],
    note:
'先にログを見てから console を開く順番でも構いません。\n' +
'守ってほしいのは「--sandbox を付ける」「件数から入る」「必要な列だけ出す」の3つです。\n' +
'この3つは、本番consoleを開くたびに毎回やることになります。'
  }
});
})();
