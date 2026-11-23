/* CASE 29 — 容量は空いているのに書き込めない（inode枯渇） */
(function () {
'use strict';
var APP = '/var/www/myapp';
var CACHE = APP + '/shared/tmp/cache';
var base = window.LFR.base;

var files = {};

files[APP + '/shared/log/production.log'] =
'I, [2026-09-22T11:02:11.114+09:00 #1433]  INFO -- : [ab99cd88-7766-4554-8332-110099aabbcc] Started POST "/entries" for 10.0.2.31 at 2026-09-22 11:02:11 +0900\n' +
'I, [2026-09-22T11:02:11.116+09:00 #1433]  INFO -- : [ab99cd88-7766-4554-8332-110099aabbcc] Processing by EntriesController#create as HTML\n' +
'E, [2026-09-22T11:02:11.204+09:00 #1433] ERROR -- : [ab99cd88-7766-4554-8332-110099aabbcc] Errno::ENOSPC (No space left on device @ rb_sysopen - /var/www/myapp/shared/tmp/cache/3F8/A21/entry-form-8821):\n' +
'E, [2026-09-22T11:02:11.204+09:00 #1433] ERROR -- : [ab99cd88-7766-4554-8332-110099aabbcc] app/controllers/entries_controller.rb:14:in `create\'\n' +
'I, [2026-09-22T11:02:11.206+09:00 #1433]  INFO -- : [ab99cd88-7766-4554-8332-110099aabbcc] Completed 500 Internal Server Error in 92ms\n' +
'I, [2026-09-22T11:05:40.441+09:00 #1434]  INFO -- : [bc00de99-8877-4665-9443-2211aabbccdd] Started GET "/projects" for 10.0.2.18 at 2026-09-22 11:05:40 +0900\n' +
'I, [2026-09-22T11:05:40.560+09:00 #1434]  INFO -- : [bc00de99-8877-4665-9443-2211aabbccdd] Completed 200 OK in 119ms (Views: 70.2ms | ActiveRecord: 14.1ms)\n';

/* キャッシュのファイルを実際にいくつか置いておく（find で数えられるように） */
for (var i = 0; i < 40; i++) {
  var a = (i * 37 % 256).toString(16).toUpperCase().padStart(3, '0');
  var b = (i * 91 % 256).toString(16).toUpperCase().padStart(3, '0');
  files[CACHE + '/' + a + '/' + b + '/fragment-' + (8000 + i)] = 'cached\n';
}

files[APP + '/releases/20260914120000/config/environments/production.rb'] =
'Rails.application.configure do\n' +
'  config.cache_classes = true\n' +
'  config.eager_load = true\n' +
'  config.log_level = :info\n' +
'\n' +
'  # 2026-08 変更: Redisが不安定だったので一時的にファイルキャッシュへ戻した\n' +
'  # （戻したあと、古いファイルを掃除する仕組みを入れていない）\n' +
'  config.cache_store = :file_store, "/var/www/myapp/shared/tmp/cache"\n' +
'\n' +
'  config.active_job.queue_adapter = :sidekiq\n' +
'end\n';

files['/home/deploy/ops-notes.md'] =
'# 作業メモ\n' +
'\n' +
'## 2026-09-22 11:10\n' +
'応募フォームが500になるという報告。\n' +
'ログには No space left on device と出ているが、df -h を見ると / は42%しか使っていない。\n' +
'先月のディスク満杯（CASE 19）とは様子が違う。\n';

window.LFR.scenarios.add({
  id: 'case29',
  level: 10,
  title: '容量は空いているのに書き込めない',
  subtitle: 'No space left on device の、もうひとつの原因',

  description:
'応募フォームの送信が500エラーになっています。\n\n' +
'Railsのログにはこう出ています。\n\n' +
'  Errno::ENOSPC (No space left on device)\n\n' +
'先月も同じエラーでディスクが満杯になりました（CASE 19）。\n' +
'ところが今回、`df -h` を見ると / の使用率は42%です。**容量は空いています。**\n\n' +
'それなのに「書き込む場所がない」と言われています。\n' +
'なぜなのかを突き止めてください。',

  learn: [
    { name: 'df -i', cmd: 'df -i',
      desc: 'ファイルシステムの **inode** の使用状況を表示します。\n\n' +
            'inodeは「ファイルの実体1つ分の管理領域」です。\n' +
            'ファイルを1つ作るたびに1つ消費され、**作れる総数には上限があります**。\n\n' +
            '容量（バイト数）と個数（inode数）は別々の在庫なので、\n' +
            '片方が余っていても、もう片方を使い切れば書き込めなくなります。\n\n' +
            '小さいファイルが大量に増える場所——セッション、キャッシュ、\n' +
            'メールキュー、アップロードの一時ファイル——で起きます。\n\n' +
            '`No space left on device` を見たら、`df -h` と `df -i` を**両方**確認してください。' },
    { name: 'どこに多いかを探す', cmd: 'find /var/www/myapp/shared/tmp -type f | wc -l',
      desc: 'inodeを食っているのは「大きいファイル」ではなく「多いファイル」です。\n' +
            'du（容量）で探しても見つかりません。数えるのは find と wc -l です。\n\n' +
            '  -type f      ファイルだけ（ディレクトリを除く）\n' +
            '  -xdev        別のファイルシステムへ降りない\n' +
            '  -mtime +7    7日より前に更新されたもの\n\n' +
            '容量が原因のときは du、個数が原因のときは find。使い分けてください。\n\n' +
            '（この学習環境にはキャッシュのファイルを数十個だけ置いています。\n' +
            '  実機の件数は df -i の IUsed が示す約262万件です）' },
    { name: 'lsof', cmd: 'lsof +L1',
      desc: '「誰がそのファイルを開いているか」を答えます。\n\n' +
            '  lsof <ファイル>  そのファイルを掴んでいるプロセス\n' +
            '  lsof +L1         削除済みなのに開かれたままのファイル\n' +
            '  lsof -p <PID>    そのプロセスが開いているもの\n' +
            '  lsof -i :3000    そのポートを掴んでいるプロセス\n\n' +
            '`rm` したのに容量が戻らないときは +L1 を見てください。\n' +
            '開いているプロセスが終わるまで、実体は解放されません。' },
    { name: '消す前に数える', cmd: 'find /var/www/myapp/shared/tmp/cache -type f -mtime +7 | wc -l',
      desc: '削除は取り消せません。実行する前に必ず「何件に効くのか」を数えてください。\n\n' +
            '  find ... | wc -l        件数を確認\n' +
            '  find ... | head         実物を数件見る\n' +
            '  find ... -delete        納得してから実行\n\n' +
            'find の -delete や xargs rm は強力です。条件を1文字間違えると必要なものまで消えます。' },
    { name: '根本原因を設定で確認する', cmd: 'grep -n cache_store config/environments/production.rb',
      desc: '「なぜ増え続けたのか」はアプリの設定にあります。\n' +
            '掃除する仕組みが無いまま増える置き場所は、いつか必ず溢れます。\n' +
            '消すだけで終わらせず、増え方を止める手を打ってください。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '11:12:40',
  date: 'Sep 22',

  disk: {
    filesystems: [
      { fs: '/dev/nvme0n1p1',  mount: '/',        totalKB: 41943040, usedKB: 17615360,
        inodes: 2621440, inodesUsed: 2618112 },
      { fs: 'tmpfs',           mount: '/dev/shm', size: '3.9G', used: '0', avail: '3.9G', usePct: 0 },
      { fs: '/dev/nvme0n1p15', mount: '/boot/efi', size: '105M', used: '6.1M', avail: '99M', usePct: 6 }
    ],
    sizes: {
      '/var':                                  16800000,
      '/var/www':                              12400000,
      '/var/www/myapp':                        12310000,
      '/var/www/myapp/shared':                 11900000,
      '/var/www/myapp/shared/log':              1200000,
      '/var/www/myapp/shared/tmp':             10600000,
      '/var/www/myapp/shared/tmp/cache':       10480000,
      '/var/www/myapp/releases':                 978944,
      '/var/lib':                               3985408,
      '/var/log':                                421888
    }
  },

  /* inodeを食っている実体（教材上の宣言。findで数えるのは実ファイル） */
  cacheFiles: 2210000,

  http: {
    'http://localhost/projects': {
      status: 200, reason: 'OK',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><head><title>求人検索 | Myapp</title></head><body>...</body></html>\n'
    }
  },

  hints: [
    'まず `df -h` で容量を確認してください。42%しか使っていません。\n' +
    'それなのに「書き込む場所がない」と言われています。\n' +
    'ディスクには、容量とは別にもう1つ「在庫」があります。',

    '`df -i` を実行してください。IUse% を見てください。\n' +
    '容量ではなく **ファイルを作れる数** を使い切っています。\n\n' +
    '次は「どこに多いのか」です。容量ではなく個数なので、du では見つかりません。',

    'find で数えます。\n\n' +
    '  find /var/www/myapp/shared/tmp -type f | wc -l\n' +
    '  find /var/www/myapp/shared/log -type f | wc -l\n\n' +
    'そのうえで、なぜそこに溜まったのかを config/environments/production.rb で確認してください。'
  ],

  probes: [
    { key: 'sawSpaceAvailable', label: '容量には余裕があることを確認した',
      test: function (c, res) { return /\bdf\b/.test(c) && /4[0-9]%/.test(res.stdout); } },
    { key: 'usedDfI', label: 'df -i でinodeを確認した',
      test: function (c, res) { return /df\s+-\w*i/.test(c) && /IUse%|Inodes/.test(res.stdout); } },
    { key: 'sawInodeFull', label: 'inodeを使い切っていることに気づいた',
      test: function (c, res) { return /99%|100%/.test(res.stdout) && /IUse%|Inodes/.test(res.stdout); } },
    { key: 'countedFiles', label: 'find でファイル数を数えた',
      test: function (c, res) { return /\bfind\b/.test(c) && /wc -l/.test(c); } },
    { key: 'foundCacheDir', label: 'キャッシュディレクトリに大量にあると特定した',
      test: function (c, res) { return /tmp\/cache/.test(c) && res.stdout.length > 0; } },
    { key: 'foundRootCause', label: '設定でファイルキャッシュを使っていると確認した',
      test: function (c, res) { return /file_store/.test(res.stdout); } },
    { key: 'usedLsof', label: 'lsof で掴んでいるプロセスを確認した',
      test: function (c) { return /\blsof\b/.test(c); } },
    { key: 'countedBeforeDelete', label: '消す前に件数を数えた',
      test: function (c, res) { return /find/.test(c) && /-mtime/.test(c); } }
  ],

  evidence: [
    { key: 'sawSpaceAvailable',   weight: 8,  label: '容量には余裕があると確認した' },
    { key: 'usedDfI',             weight: 18, label: 'df -i を見た' },
    { key: 'sawInodeFull',        weight: 16, label: 'inode枯渇だと特定した' },
    { key: 'countedFiles',        weight: 14, label: 'find でファイル数を数えた' },
    { key: 'foundCacheDir',       weight: 12, label: '溜まっている場所を特定した' },
    { key: 'foundRootCause',      weight: 14, label: '設定から増える理由を確認した' },
    { key: 'countedBeforeDelete', weight: 10, label: '消す前に対象件数を数えた' }
  ],

  question: {
    text: '容量が空いているのに No space left on device になる原因は？',
    choices: [
      'ディスクの物理的な故障で、書き込みが失敗している',
      'inode（ファイルを作れる数）を使い切っていて、新しいファイルを作れない',
      'ディレクトリのpermissionが誤っていて、書き込めない',
      '削除済みだが開かれたままのファイルが容量を占有している'
    ],
    answer: 1,
    explain:
'ディスクには**2つの在庫**があります。\n\n' +
'  容量（バイト数）   … df -h で見る\n' +
'  inode（ファイル数）… df -i で見る\n\n' +
'  $ df -h\n' +
'  /dev/nvme0n1p1  40G  17G  23G  42%  /     ← 容量は余っている\n\n' +
'  $ df -i\n' +
'  /dev/nvme0n1p1  2621440  2618112  3328  100%  /   ← inodeは使い切っている\n\n' +
'inodeは「ファイルの実体1つ分の管理領域」で、ファイルを作るたびに1つ消費されます。\n' +
'総数は作成時に決まっていて、あとから増やせません。\n' +
'**サイズが0バイトのファイルでも、inodeは1つ使います。**\n\n' +
'だから「小さいファイルが大量にある」と、容量を余らせたまま書き込めなくなります。\n\n' +
'【どこに多いのか】\n' +
'容量ではなく個数なので、du では見つかりません。数えるのは find です。\n\n' +
'  $ find /var/www/myapp/shared/tmp -type f | wc -l     ← キャッシュ側\n' +
'  $ find /var/www/myapp/shared/log -type f | wc -l     ← ログ側\n\n' +
'  ログ側はごくわずかで、tmp/cache の下にディレクトリが深く枝分かれしています。\n' +
'  df -i の IUsed が 2,618,112 なので、その大半がここにあると分かります。\n' +
'  （この学習環境では実物を数十個しか置いていませんが、実機では数百万件です）\n\n' +
'【なぜ増え続けたのか】\n' +
'  $ grep -n cache_store config/environments/production.rb\n' +
'  # 2026-08 変更: Redisが不安定だったので一時的にファイルキャッシュへ戻した\n' +
'  # （戻したあと、古いファイルを掃除する仕組みを入れていない）\n' +
'  config.cache_store = :file_store, "/var/www/myapp/shared/tmp/cache"\n\n' +
'  ファイルキャッシュは、書いたら勝手には消えません。\n' +
'  掃除する仕組みが無いまま1か月半動き続けた結果です。\n\n' +
'【直し方の順番】\n' +
'1. まず数える。消す前に必ず件数を確認する\n' +
'     find .../cache -type f -mtime +7 | wc -l\n' +
'2. 古いものから消す\n' +
'     find .../cache -type f -mtime +7 -delete\n' +
'     （大量だと時間がかかります。tmux の中で流してください → CASE 32）\n' +
'3. df -i で戻ったことを確認する\n' +
'4. 増え方を止める。cron で定期削除する、Redisキャッシュへ戻す、\n' +
'   あるいは cache_store に expires_in を設定する\n\n' +
'--- あわせて覚えておくこと ---\n\n' +
'`No space left on device` を見たら、**df -h と df -i を両方**確認してください。\n' +
'そして `du` で見つからないときは、原因は容量ではなく個数か、\n' +
'「削除済みだが開かれたままのファイル」です。後者は lsof +L1 で見えます。',
    wrong: [
'ディスクの故障ではありません。\n' +
'故障の場合は I/O エラー（Input/output error / EIO）になり、\n' +
'dmesg や journalctl にカーネルのエラーが記録されます。\n\n' +
'今回のエラーは ENOSPC（No space left on device）で、\n' +
'これは「書き込む先が無い」という正常な応答です。\n' +
'読み書き自体は問題なくできています（現に ls も cat も動きます）。',
null,
'permissionの問題ではありません。\n' +
'その場合のエラーは EACCES（Permission denied）になります。\n\n' +
'  $ ls -ld /var/www/myapp/shared/tmp/cache\n' +
'  drwxr-xr-x deploy deploy\n\n' +
'所有者は deploy で、Pumaも deploy として動いています。\n' +
'Errno の種類は原因の分類そのものです。ENOSPC と EACCES を混同しないでください。',
'これは惜しい指摘で、**実際にありうる原因**です（CASE 19 で扱いました）。\n' +
'開かれたままのファイルを rm すると、名前は消えても実体は残り、\n' +
'df の数字は戻りません。\n\n' +
'  $ lsof +L1\n' +
'  （何も出ない）\n\n' +
'今回はそれが原因ではありません。そして決定的なのは、\n' +
'**容量そのものは42%しか使っていない**ことです。\n' +
'占有されているなら df -h の使用率が高いはずです。\n' +
'df -i を見れば、足りないのが容量ではなく個数だと分かります。'
    ]
  },

  route: {
    steps: [
      'エラーの Errno を正確に読む（ENOSPC）',
      'df -h で容量を確認する → 余っている',
      'df -i で inode を確認する → 使い切っている',
      'find でファイル数を数え、どこに多いかを特定する',
      'lsof +L1 で「削除済みだが開かれたまま」も併せて除外する',
      '設定から、なぜ増え続けたのかを確認する',
      '消す前に対象件数を数える'
    ],
    commands: [
      'grep -n "ENOSPC" log/production.log',
      'df -h',
      'df -i',
      'find /var/www/myapp/shared/tmp -type f | wc -l',
      'find /var/www/myapp/shared/log -type f | wc -l',
      'ls /var/www/myapp/shared/tmp/cache | head',
      'lsof +L1',
      'grep -n cache_store config/environments/production.rb',
      'find /var/www/myapp/shared/tmp/cache -type f -mtime +7 | wc -l',
      'cat ~/ops-notes.md'
    ],
    note:
'先に df -i を見て気づくルートでも構いません。\n' +
'覚えてほしいのは1つです。\n' +
'**No space left on device を見たら、df -h と df -i を両方見る。**\n' +
'片方だけ見て「容量は空いているのに」で止まると、そこから進めなくなります。'
  }
});
})();
