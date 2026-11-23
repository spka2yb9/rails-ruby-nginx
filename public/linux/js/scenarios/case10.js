/* CASE 10 — ディスク容量不足を調査する */
(function () {
'use strict';
var APP = '/var/www/myapp';

var files = {};
/* du の対象になるディレクトリを実在させておく（glob展開のため） */
files['/var/lib/mysql/ibdata1'] = 'binary\n';
files['/var/lib/mysql/myapp_production/projects.ibd'] = 'binary\n';
files['/var/cache/apt/archives/.keep'] = '';
files['/var/log/syslog'] = 'Sep 14 15:02:11 production systemd[1]: Started Daily apt download activities.\n';
files['/var/log/nginx/error.log'] =
'2026/09/14 15:01:40 [crit] 781#781: *1420 open() "/var/lib/nginx/tmp/proxy/1/00/0000000001" failed (28: No space left on device)\n';
files['/var/backups/myapp-20260913.sql.gz'] = 'binary\n';
files['/tmp/.keep'] = '';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T15:00:11.204+09:00 #1433]  INFO -- : [b1c2d3e4-5f60-4718-92a3-b4c5d6e7f809] Started GET "/projects" for 10.0.2.31 at 2026-09-14 15:00:11 +0900\n' +
'I, [2026-09-14T15:00:11.288+09:00 #1433]  INFO -- : [b1c2d3e4-5f60-4718-92a3-b4c5d6e7f809] Completed 200 OK in 84ms (Views: 55.1ms | ActiveRecord: 13.2ms)\n' +
'E, [2026-09-14T15:01:44.902+09:00 #1434] ERROR -- : [c2d3e4f5-6071-4829-a3b4-c5d6e7f8091a] Errno::ENOSPC (No space left on device @ io_write - /var/www/myapp/shared/tmp/cache/A1B/2C3/entry-cache):\n' +
'E, [2026-09-14T15:01:44.903+09:00 #1434] ERROR -- : [c2d3e4f5-6071-4829-a3b4-c5d6e7f8091a] app/controllers/entries_controller.rb:14:in `create\'\n' +
'I, [2026-09-14T15:01:44.904+09:00 #1434]  INFO -- : [c2d3e4f5-6071-4829-a3b4-c5d6e7f8091a] Completed 500 Internal Server Error in 94ms\n';

files[APP + '/shared/log/sidekiq.log'] =
'2026-09-14T15:01:44.918Z pid=1502 tid=a12 class=EntryNotifyJob jid=41c9e7a08b2d ERROR: Errno::ENOSPC: No space left on device\n' +
'2026-09-14T15:01:45.902Z pid=1502 tid=a12 class=EntryNotifyJob jid=41c9e7a08b2d INFO: fail: retrying in 15s\n';

files[APP + '/shared/log/puma.error.log'] =
'[1421] - Worker 0 (PID: 1433) booted in 0.02s, phase: 0\n' +
'[1421] - Worker 1 (PID: 1434) booted in 0.02s, phase: 0\n';

files[APP + '/shared/log/logrotate-notes.md'] =
'# ログの扱いについて\n' +
'\n' +
'production.log は logrotate の対象に入れていない（TODO）。\n' +
'config.log_level = :info のまま運用しているため、1日あたり数GB増える。\n';

/* du が返すサイズ（KB）。実ファイルのサイズではなくCASEが宣言した値を使う */
var sizes = {
  '/var':                                          37081636,
  '/var/www':                                      32418340,
  '/var/www/myapp':                                32320548,
  '/var/www/myapp/shared':                         31341604,
  '/var/www/myapp/shared/log':                     31193092,
  '/var/www/myapp/shared/log/production.log':      29360128,
  '/var/www/myapp/shared/log/sidekiq.log':          1259520,
  '/var/www/myapp/shared/log/puma.error.log':        573440,
  '/var/www/myapp/shared/log/logrotate-notes.md':         4,
  '/var/www/myapp/shared/tmp':                       148480,
  '/var/www/myapp/shared/config':                        32,
  '/var/www/myapp/releases':                         978944,
  '/var/www/myapp/releases/20260914120000':          489472,
  '/var/www/myapp/releases/20260913150000':          489472,
  '/var/lib':                                       3985408,
  '/var/lib/mysql':                                 3901440,
  '/var/log':                                        421888,
  '/var/log/nginx':                                  387072,
  '/var/log/syslog':                                   34816,
  '/var/cache':                                      184320,
  '/var/backups':                                      71680,
  '/tmp':                                              22528,
  '/home':                                              8192,
  '/usr':                                            2359296
};

/* ls -lh で見えるサイズ（VFSに28GBのファイルを本当に置くわけにいかないので宣言する） */
var fsMeta = {};
fsMeta['/var/www/myapp/shared/log/production.log']  = { size: 29360128 * 1024 };
fsMeta['/var/www/myapp/shared/log/sidekiq.log']     = { size: 1259520 * 1024 };
fsMeta['/var/www/myapp/shared/log/puma.error.log']  = { size: 573440 * 1024 };

window.LFR.scenarios.add({
  id: 'case10',
  level: 3,
  title: 'ディスク容量不足を調査する',
  subtitle: '「どこが」食っているかを、上から順に絞り込む',

  description:
'応募フォームの送信が 500 エラーになるという報告がありました。\n' +
'ログを見ると Errno::ENOSPC (No space left on device) が出ています。\n\n' +
'nginxのエラーログにも同じ (28: No space left on device) が記録されています。\n\n' +
'ディスクが満杯なのは間違いなさそうです。\n' +
'では、何がどれだけ容量を食っているのかを特定してください。\n\n' +
'いきなり何かを削除してはいけません。まず「どこにあるか」を突き止めます。',

  learn: [
    { name: 'df -h', cmd: 'df -h',
      desc: 'ファイルシステムごとの容量と使用率を表示します。-h で人間が読める単位に。\n\n' +
            '最初に見るべきは Use% と Mounted on です。\n' +
            '同じサーバーでも / と /var と /home が別パーティションのことがあり、\n' +
            'どのファイルシステムが満杯なのかで探す場所が変わります。' },
    { name: 'du -sh', cmd: 'du -sh /var',
      desc: '指定したディレクトリが合計で何バイト使っているかを表示します。\n' +
            '  -s 合計だけ（中身を1行ずつ出さない）  -h 人間が読める単位\n' +
            'dfが「パーティション全体」、duが「ディレクトリごと」です。' },
    { name: 'du -sh *', cmd: 'du -sh /var/*',
      desc: '直下の各ディレクトリの合計を並べます。\n' +
            'これを上の階層から順に繰り返して、大きい枝を辿っていくのが定石です。\n' +
            'いきなり深い階層を探すより、確実で速くなります。' },
    { name: 'sort -h でランキング', cmd: 'du -sh /var/* | sort -h',
      desc: '-h は 1.2G / 340M のような単位付きの数字を正しく比較します。\n' +
            '大きい順に見たいときは sort -h -r を使います。\n' +
            'du と sort の組み合わせは、容量調査でいちばん使う型です。' },
    { name: 'ls -lh', cmd: 'ls -lh /var/www/myapp/shared/log',
      desc: 'ディレクトリまで絞れたら、最後は個別ファイルのサイズを見ます。\n' +
            '巨大な1ファイルなのか、小さいファイルが大量なのかで対処が変わります。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  fsMeta: fsMeta,
  now: '15:04:22',

  disk: {
    filesystems: [
      { fs: '/dev/nvme0n1p1',  size: '40G',  used: '40G',   avail: '0',    usePct: 100, mount: '/' },
      { fs: 'tmpfs',           size: '3.9G', used: '0',     avail: '3.9G', usePct: 0,   mount: '/dev/shm' },
      { fs: '/dev/nvme0n1p15', size: '105M', used: '6.1M',  avail: '99M',  usePct: 6,   mount: '/boot/efi' }
    ],
    sizes: sizes
  },

  http: {
    'http://localhost/projects': {
      status: 200, reason: 'OK',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><head><title>求人検索 | Myapp</title></head><body>...</body></html>\n'
    }
  },

  hints: [
    'まずは「どのファイルシステムが満杯なのか」を確認してください。\n' +
    'サーバーによっては / 以外のパーティションが埋まっていることもあります。',

    'df -h で満杯のマウントポイントが分かったら、\n' +
    'その下を上の階層から順に辿ります。/ の直下 → /var の直下 → …と降りていきます。\n' +
    'ディレクトリごとの合計サイズを出すコマンドを使ってください。',

    'du -sh /var/* | sort -h を実行すると、大きい枝がひと目で分かります。\n' +
    '見つかった枝の中で、さらに du -sh <その中>/* を繰り返してください。\n' +
    '最後は ls -lh で個別ファイルまで降りられます。'
  ],

  probes: [
    { key: 'sawDiskFull', label: 'df -h で / が100%だと確認した',
      test: function (c, res) { return /\bdf\b/.test(c) && /100%/.test(res.stdout); } },
    { key: 'usedDu', label: 'du でディレクトリごとの容量を見た',
      test: function (c) { return /\bdu\b/.test(c); } },
    { key: 'narrowedToWww', label: '/var/www が大きいことを突き止めた',
      test: function (c, res) { return /\/var\/www/.test(res.stdout) && /\bdu\b/.test(c); } },
    { key: 'foundLogDir', label: 'shared/log が原因だと絞り込んだ',
      test: function (c, res) { return /shared\/log|\blog\b/.test(res.stdout) && /\bdu\b|\bls\b/.test(c) && /[0-9.]+[GM]/.test(res.stdout); } },
    { key: 'foundHugeFile', label: 'production.log が巨大だと特定した',
      test: function (c, res) { return /production\.log/.test(res.stdout) && /2[0-9]\.?[0-9]*G|30146560/.test(res.stdout); } },
    { key: 'sawEnospc', label: 'ENOSPC が出ていることを確認した',
      test: function (c, res) { return /ENOSPC|No space left on device/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'sawDiskFull',    weight: 10, label: 'df -h で満杯のファイルシステムを特定した' },
    { key: 'usedDu',         weight: 8,  label: 'du でディレクトリごとに調べた' },
    { key: 'narrowedToWww',  weight: 10, label: '上の階層から順に絞り込んだ' },
    { key: 'foundLogDir',    weight: 12, label: 'shared/log まで辿り着いた' },
    { key: 'foundHugeFile',  weight: 16, label: '巨大な個別ファイルを特定した' },
    { key: 'sawEnospc',      weight: 8,  label: 'アプリ側の症状（ENOSPC）と結び付けた' }
  ],

  question: {
    text: 'ディスクを最も消費しているのはどれ？',
    choices: [
      '/var/lib/mysql（MySQLのデータファイル）',
      '/var/www/myapp/shared/log（Railsのログ）',
      '/var/log/nginx（nginxのアクセスログ）',
      '/var/www/myapp/releases（過去のリリース）'
    ],
    answer: 1,
    explain:
'上から順に絞り込むと、ひと目で分かります。\n\n' +
'  $ df -h\n' +
'  /dev/nvme0n1p1  40G  40G  0  100%  /\n\n' +
'  $ du -sh /var/* | sort -h\n' +
'  70M   /var/backups\n' +
'  180M  /var/cache\n' +
'  412M  /var/log\n' +
'  3.8G  /var/lib\n' +
'  31G   /var/www          ← ここ\n\n' +
'  $ du -sh /var/www/myapp/* | sort -h\n' +
'  956M  releases\n' +
'  30G   shared\n\n' +
'  $ du -sh /var/www/myapp/shared/* | sort -h\n' +
'  145M  tmp\n' +
'  30G   log               ← ここ\n\n' +
'  $ ls -lh /var/www/myapp/shared/log\n' +
'  production.log  28G\n' +
'  sidekiq.log     1.2G\n\n' +
'production.log 1本で28GB、ディスク40GBの7割を占めています。\n' +
'shared/log/logrotate-notes.md にも理由が書かれています。\n' +
'production.log が logrotate の対象に入っておらず、\n' +
'log_level が :info のまま運用されているため、際限なく増え続けています。\n\n' +
'対処として真っ先に思いつくのは削除ですが、そこで止まってください。\n' +
'・rm でログを消しても、Pumaがそのファイルを開いたままなら容量は戻りません\n' +
'  （プロセスがファイルハンドルを掴んでいるため。再起動するまで解放されません）\n' +
'・障害調査中のログを消すと、原因を追う手がかりが失われます\n\n' +
'正しい順番は、まず logrotate を設定して継続的に回す、\n' +
'一時的に空けるなら truncate -s 0 で中身だけ空にする、です。\n' +
'そして根本対応は、log_level の見直しとログの外部転送です。',
    wrong: [
'/var/lib/mysql は 3.8GB です。2番目に大きいものの、\n' +
'40GBのディスクを埋めるには桁が足りません。\n\n' +
'DBのデータは業務上の資産なので安易に消せません。\n' +
'だからこそ、消してよい別のものが無いかを先に確認する価値があります。\n' +
'du -sh /var/* | sort -h で全体を比べてみてください。',
null,
'/var/log/nginx は 378MB です。\n' +
'nginxのログはOS標準の logrotate で毎日ローテートされているため、\n' +
'放っておいても一定量以上には増えません。\n\n' +
'逆に言えば、Railsのログも同じ仕組みに乗せていれば\n' +
'今回の事態は起きませんでした。それが今回の教訓です。',
'/var/www/myapp/releases は 956MB です。\n' +
'Capistranoは :keep_releases の設定に従って古いreleaseを自動削除するため、\n' +
'無制限には増えません（config/deploy/production.rb で 5 に設定されています）。\n\n' +
'releasesの掃除は容量対策として有効ですが、今回の30GBは説明できません。'
    ]
  },

  route: {
    steps: [
      'どのファイルシステムが満杯かを確認する（df -h）',
      'そのマウントポイントの直下を比較する（du -sh /var/* | sort -h）',
      '大きい枝へ1段ずつ降りる（/var/www → myapp → shared）',
      'ディレクトリまで絞れたら個別ファイルを見る（ls -lh）',
      '巨大化した理由を確認する（設定・ローテーションの有無）',
      '消す前に、掴んでいるプロセスと調査への影響を考える'
    ],
    commands: [
      'df -h',
      'du -sh /var/* | sort -h',
      'du -sh /var/www/myapp/* | sort -h',
      'du -sh /var/www/myapp/shared/* | sort -h',
      'ls -lh /var/www/myapp/shared/log',
      'cat /var/www/myapp/shared/log/logrotate-notes.md',
      'grep -n "ENOSPC" log/production.log',
      'tail -n 3 /var/log/nginx/error.log'
    ],
    note:
'du -sh / の直下から始めても、いきなり /var から始めても構いません。\n' +
'大事なのは「上から順に、大きい方だけを追う」ことです。\n' +
'全ディレクトリを闇雲に調べる必要はありません。'
  }
});
})();
