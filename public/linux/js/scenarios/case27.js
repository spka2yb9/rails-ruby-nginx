/* CASE 27 — 設定ファイルを直して再発を止める（vi） */
(function () {
'use strict';
var APP = '/var/www/myapp';
var LOG = APP + '/shared/log';

var files = {};

/* 誰かが「pumaのログだけ肥大化する」と考えて対象を絞ってしまった設定 */
files['/etc/logrotate.d/rails'] =
'# Railsのログをローテートする\n' +
'# 2026-09-15 変更: 対象をpumaのログに絞った（production.logは別途対応予定）\n' +
'/var/www/myapp/shared/log/puma.*.log {\n' +
'  daily\n' +
'  rotate 14\n' +
'  compress\n' +
'  delaycompress\n' +
'  missingok\n' +
'  notifempty\n' +
'  copytruncate\n' +
'  su deploy deploy\n' +
'}\n';

files[LOG + '/production.log'] =
'I, [2026-09-21T09:40:11.402+09:00 #1433]  INFO -- : [ab12cd34-5e6f-4071-8293-a4b5c6d7e8f9] Started GET "/projects" for 10.0.2.31 at 2026-09-21 09:40:11 +0900\n' +
'I, [2026-09-21T09:40:11.520+09:00 #1433]  INFO -- : [ab12cd34-5e6f-4071-8293-a4b5c6d7e8f9] Completed 200 OK in 118ms (Views: 70.2ms | ActiveRecord: 14.1ms)\n';
files[LOG + '/sidekiq.log'] =
'2026-09-21T09:00:43.110Z pid=1502 tid=3f8 INFO: Starting processing, hit Ctrl-C to stop\n';
files[LOG + '/puma.error.log'] =
'[1421] - Worker 0 (PID: 1433) booted in 0.02s, phase: 0\n';

files['/home/deploy/ops-notes.md'] =
'# 週次の運用メモ\n' +
'\n' +
'## 2026-09-14\n' +
'ディスクが100%になりPumaが起動不能に。production.log が30GBだった。\n' +
'truncate で緊急対応し、logrotate を設定した。\n' +
'\n' +
'## 2026-09-15\n' +
'logrotate の設定を見直し。対象を絞った（作業者: 別メンバー）。\n' +
'\n' +
'## 2026-09-21（今日）\n' +
'また容量が増えている。logrotate は毎日動いているはずなのに。\n' +
'\n' +
'---\n' +
'\n' +
'### 本番の設定ファイルを直すときの手順\n' +
'\n' +
'1. 直す前にバックアップを取る（cp -p <file> <file>.bak）\n' +
'2. vi で編集する（:wq で保存 / :q! で破棄）\n' +
'3. 適用する前に dry-run で確認する\n' +
'4. 適用して、結果を数字で確認する\n';

var sizes = {
  '/var':                      38200000,
  '/var/www':                  34100000,
  '/var/www/myapp':            34010000,
  '/var/www/myapp/shared':     33900000,
  '/var/www/myapp/shared/log': 33850000,
  '/var/www/myapp/shared/log/production.log': 33030000,
  '/var/www/myapp/shared/log/sidekiq.log':      760000,
  '/var/www/myapp/shared/log/puma.error.log':    60000,
  '/var/www/myapp/releases':                    978944,
  '/var/lib':                                  3985408,
  '/var/log':                                   421888
};

var fsMeta = {};
fsMeta[LOG + '/production.log']  = { size: 33030000 * 1024 };
fsMeta[LOG + '/sidekiq.log']     = { size: 760000 * 1024 };
fsMeta[LOG + '/puma.error.log']  = { size: 60000 * 1024 };

window.LFR.scenarios.add({
  id: 'case27',
  firstLook: { name: '現在のログ保存設定を読む', cmd: 'cat /etc/logrotate.d/rails',
    desc: '設定の先頭にあるパスは整理の対象となるログです。実際に増えているログの置き場所と比べましょう。' },
  level: 7,
  title: '設定ファイルを直して再発を止める',
  subtitle: 'viで本番の設定を編集する',

  description:
'先週、ディスクが満杯になってPumaが起動できなくなりました（CASE 19）。\n' +
'そのとき logrotate を設定し、翌日に別のメンバーが設定を見直しています。\n\n' +
'それから1週間。またディスクが90%近くまで増えています。\n\n' +
'logrotate.timer は毎日動いています。停止もしていません。\n' +
'それなのに production.log が減っていません。\n\n' +
'設定を確認し、**viで直して**、直ったことを確認してください。\n\n' +
'※このCASEのTerminalでは vi が使えます。**抜けられなくなったら :q! と入力してEnter**です。',

  learn: [
    { name: 'まず抜け方を覚える', cmd: 'vi /etc/logrotate.d/rails',
      desc: 'viで最初に覚えるべきは、開き方ではなく **抜け方** です。\n\n' +
            '  Esc  →  :q!  →  Enter      保存せずに捨てて抜ける\n' +
            '  Esc  →  :wq  →  Enter      保存して抜ける\n\n' +
            'まず Esc を押す、というのが大事です。\n' +
            '挿入モードの最中に :q! と打つと、ただの文字として入力されてしまいます。\n' +
            '迷ったら Esc を何回か押してから : を打ってください。' },
    { name: 'モードの考え方', cmd: 'vi /etc/logrotate.d/rails',
      desc: 'viには「いまキーが何を意味するか」を決めるモードがあります。\n\n' +
            '  ノーマルモード … 起動直後。キーは命令（hjkl で移動、dd で行削除、u で取り消し）\n' +
            '  挿入モード     … i / a / o で入る。キーがそのまま文字になる\n' +
            '  コマンドモード … : で入る。:w 保存 / :q 終了 / :wq 両方 / :q! 破棄\n\n' +
            '画面下に -- INSERT -- と出ていれば挿入モードです。Esc でノーマルへ戻ります。' },
    { name: '最低限の操作', cmd: 'vi /etc/logrotate.d/rails',
      desc: '  移動     h j k l（左下上右） / gg 先頭 / G 末尾 / 0 行頭 / $ 行末\n' +
            '  検索     /文字列 で検索、n で次\n' +
            '  編集     i カーソル前に挿入 / a 後ろに挿入 / o 下に空行を作って挿入\n' +
            '  削除     x 1文字 / dd 1行\n' +
            '  取り消し u（元に戻す） / Ctrl+r（やり直し）\n\n' +
            '本番でやることの9割は「1行探して、直して、保存」です。\n' +
            'この範囲を確実にできれば十分です。' },
    { name: '直す前にバックアップ', cmd: 'sudo cp -p /etc/logrotate.d/rails /etc/logrotate.d/rails.bak',
      desc: '-p は所有者・permission・タイムスタンプを保ったままコピーします。\n' +
            '本番の設定を触る前の1手間で、戻せる状態を作っておきます。\n' +
            '「あとで戻せる」と分かっていると、落ち着いて作業できます。' },
    { name: '適用する前に確認する', cmd: 'sudo logrotate -d /etc/logrotate.d/rails',
      desc: '-d は dry-run（実際には実行せず、何をするつもりかだけ表示）です。\n' +
            '設定を直したら、まずこれで「意図した対象に効いているか」を確かめます。\n\n' +
            '設定ファイルを直す作業は、保存した瞬間が終わりではありません。\n' +
            '「読み込まれたか」「意図どおり効いているか」を確認するまでが1セットです。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  fsMeta: fsMeta,
  now: '09:48:20',
  date: 'Sep 21',

  disk: {
    filesystems: [
      { fs: '/dev/nvme0n1p1',  mount: '/',         totalKB: 41943040, usedKB: 38200000 },
      { fs: 'tmpfs',           mount: '/dev/shm',  size: '3.9G', used: '0', avail: '3.9G', usePct: 0 },
      { fs: '/dev/nvme0n1p15', mount: '/boot/efi', size: '105M', used: '6.1M', avail: '99M', usePct: 6 }
    ],
    sizes: sizes
  },

  timers: [
    { unit: 'logrotate.timer', next: 'Tue 2026-09-22 00:00:00 JST', left: '14h 11min', last: 'Mon 2026-09-21 00:00:02 JST', passed: '9h 48min ago' },
    { unit: 'sitemap.timer',   next: 'Tue 2026-09-22 03:00:00 JST', left: '17h 11min', last: 'Mon 2026-09-21 03:00:02 JST', passed: '6h 48min ago' }
  ],

  hints: [
    'logrotate.timer は毎日動いています（systemctl list-timers で確認できます）。\n' +
    '動いているのに減らないということは、対象になっていない可能性があります。\n' +
    '実行せずに「何をするつもりか」だけ見る方法があります。',

    'sudo logrotate -d /etc/logrotate.d/rails を実行してください。\n' +
    'considering log の行に出ているパターンと、実際に対象になったファイルを見てください。\n' +
    'production.log が含まれていないはずです。\n\n' +
    '設定ファイル本体も cat で読んでください。',

    '設定の1行目のパターンが puma.*.log になっています。これを *.log に直します。\n\n' +
    '  sudo cp -p /etc/logrotate.d/rails /etc/logrotate.d/rails.bak   ← 先にバックアップ\n' +
    '  sudo vi /etc/logrotate.d/rails\n' +
    '     /puma      で該当行へ飛ぶ\n' +
    '     Esc → cw   または x で puma. を消す（dd で行ごと消して書き直してもよい）\n' +
    '     Esc → :wq  で保存\n\n' +
    '直したら -d で確認 → -f で実行 → df -h で数字を見てください。'
  ],

  probes: [
    { key: 'checkedTimer', label: 'logrotateが動いているかを確認した',
      test: function (c, res) { return /logrotate\.timer/.test(res.stdout); } },
    { key: 'ranDryRun', label: 'dry-runで対象を確認した',
      test: function (c, res) { return /considering log/.test(res.stdout); } },
    { key: 'sawWrongPattern', label: '対象パターンが絞られていることに気づいた',
      test: function (c, res) { return /puma\.\*\.log/.test(res.stdout); } },
    { key: 'madeBackup', label: '編集前にバックアップを取った',
      test: function (c) { return /\bcp\b/.test(c) && /logrotate\.d\/rails/.test(c); } },
    { key: 'openedEditor', label: 'viで設定ファイルを開いた',
      test: function (c) { return /^\s*(sudo\s+)?(vi|vim)\b/.test(c); } },
    { key: 'fixedPattern', label: '設定を直してproduction.logが対象に入った',
      test: function (c, res) {
        return /considering log|log \/var/.test(res.stdout) && /shared\/log\/production\.log/.test(res.stdout);
      } },
    { key: 'appliedRotate', label: 'ローテートを実行した',
      test: function (c, res) { return /logrotate/.test(c) && /-\w*f/.test(c) && res.exitCode === 0; } },
    { key: 'verifiedDisk', label: 'ディスクが空いたことを数字で確認した',
      test: function (c, res) { return /\bdf\b/.test(c) && /1[0-9]%|[0-9]%\s/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'checkedTimer',     weight: 8,  label: 'logrotateが動いていることを確認した' },
    { key: 'ranDryRun',        weight: 12, label: 'dry-runで対象を確認した' },
    { key: 'sawWrongPattern',  weight: 14, label: '対象から外れていることに気づいた' },
    { key: 'madeBackup',       weight: 10, label: '編集前にバックアップを取った' },
    { key: 'openedEditor',     weight: 12, label: 'viで設定を開いた' },
    { key: 'fixedPattern',     weight: 20, label: '設定を直して対象に入れた' },
    { key: 'appliedRotate',    weight: 12, label: 'ローテートを実行した' },
    { key: 'verifiedDisk',     weight: 12, label: '結果を数字で確認した' }
  ],

  question: {
    text: 'production.log がローテートされない原因は？',
    choices: [
      'logrotate.timer が停止していて、そもそも実行されていない',
      '設定の対象パターンが puma.*.log になっていて、production.log が含まれていない',
      'copytruncate が無いため、Pumaがファイルを開いたままで中身を空にできない',
      'ディスクが満杯で、ローテート後のファイルを書き込めない'
    ],
    answer: 1,
    explain:
'まず「動いているのか」を確定させます。\n\n' +
'  $ systemctl list-timers\n' +
'  logrotate.timer  next Tue 2026-09-22 00:00:00  last Mon 2026-09-21 00:00:02（9時間前）\n\n' +
'毎日きちんと動いています。つまり「実行されていない」のではなく\n' +
'「実行されているが、production.log に効いていない」という状態です。\n\n' +
'実行せずに中身を確かめられます。\n\n' +
'  $ sudo logrotate -d /etc/logrotate.d/rails\n' +
'  reading config file /etc/logrotate.d/rails\n' +
'  considering log /var/www/myapp/shared/log/puma.*.log\n' +
'    log /var/www/myapp/shared/log/puma.error.log — rotate 14, compress, copytruncate\n\n' +
'対象が puma.error.log の1本だけです。production.log が入っていません。\n\n' +
'  $ cat /etc/logrotate.d/rails\n' +
'  # 2026-09-15 変更: 対象をpumaのログに絞った（production.logは別途対応予定）\n' +
'  /var/www/myapp/shared/log/puma.*.log {\n\n' +
'コメントに経緯が残っています。「別途対応予定」のまま1週間が過ぎました。\n\n' +
'--- 直す ---\n\n' +
'  $ sudo cp -p /etc/logrotate.d/rails /etc/logrotate.d/rails.bak\n' +
'  $ sudo vi /etc/logrotate.d/rails\n\n' +
'  viの中で、\n' +
'    /puma       ← 該当行へ飛ぶ\n' +
'    Esc         ← ノーマルモードにいることを確かめる\n' +
'    x を5回 または cw で puma. を消して *.log にする\n' +
'    :wq         ← 保存して抜ける\n\n' +
'  間違えたら u で戻せますし、どうにもならなくなったら :q! で全部捨てて開き直せます。\n' +
'  **:q! で抜けられる**ことを知っていれば、viは怖くありません。\n\n' +
'--- 直したことを確認してから適用する ---\n\n' +
'  $ sudo logrotate -d /etc/logrotate.d/rails\n' +
'  considering log /var/www/myapp/shared/log/*.log\n' +
'    log .../production.log — rotate 14, compress, copytruncate\n' +
'    log .../puma.error.log\n' +
'    log .../sidekiq.log\n\n' +
'  対象に入りました。ここで初めて実行します。\n\n' +
'  $ sudo logrotate -vf /etc/logrotate.d/rails\n' +
'  $ df -h\n' +
'  /dev/nvme0n1p1  40G  5.0G  35G  12%  /\n\n' +
'91% → 12% まで戻りました。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. **設定ファイルを直す作業は、保存した瞬間には終わっていない**\n' +
'   「読み込まれたか」「意図どおり効いているか」を確認するまでが1セットです。\n' +
'   logrotate なら -d、nginx なら nginx -t、sshd なら sshd -t。\n' +
'   たいていの設定には「壊さずに検証する方法」が用意されています。\n\n' +
'2. **直す前にバックアップを取る**\n' +
'   cp -p で1秒です。戻せると分かっていれば、落ち着いて作業できます。\n\n' +
'3. **viは :q! さえ知っていれば怖くない**\n' +
'   本番サーバーにエディタはviしか無いことがよくあります。\n' +
'   モードの概念と :wq / :q! だけ押さえておけば、1行の修正は十分にできます。',
    wrong: [
'logrotate.timer は動いています。\n\n' +
'  $ systemctl list-timers\n' +
'  logrotate.timer  last Mon 2026-09-21 00:00:02 JST（9時間48分前）\n\n' +
'LASTの列に直近の実行時刻が入っています。\n' +
'「動いていないのでは」と疑ったら、まずここを見てください。\n' +
'動いているのに結果が出ていない、と分かれば、次は「何に効いているか」を調べます。',
null,
'copytruncate はきちんと設定に入っています。\n\n' +
'  $ cat /etc/logrotate.d/rails\n' +
'  copytruncate\n\n' +
'鋭い指摘ではあります。copytruncate が無いと、Pumaが開いたままのfdを持っているため\n' +
'ファイル名を変えても書き込みは古いfdに続き、容量が戻りません\n' +
'（この失敗はとてもよく起きます）。\n\n' +
'ただし今回は設定済みです。そして puma.error.log の方はきちんとローテートされています。\n' +
'copytruncate が原因なら、そちらも失敗しているはずです。',
'ディスクはまだ満杯ではありません。df -h では91%で、3.5GB程度の空きがあります。\n\n' +
'また、仮に満杯だったとしても puma.error.log はローテートできています。\n' +
'「一部だけできている」という状況は、容量ではなく対象の問題を示しています。\n\n' +
'なお、このまま放置すれば数日で100%に達し、CASE 19 と同じ障害が再発します。\n' +
'先週の対応が「容量を空けた」だけで終わっていたのが、今回の根本原因です。'
    ]
  },

  route: {
    steps: [
      'ディスクの状況を確認する',
      'logrotateが実際に動いているかを確認する（list-timers）',
      '動いているなら「何に効いているか」を dry-run で確認する',
      '設定ファイルを読んで、対象パターンを確認する',
      'バックアップを取ってから vi で直す',
      'もう一度 dry-run で、意図どおりになったかを確認する',
      '適用して、df で結果を確認する'
    ],
    commands: [
      'df -h',
      'du -sh /var/www/myapp/shared/log/* | sort -h',
      'systemctl list-timers',
      'sudo logrotate -d /etc/logrotate.d/rails',
      'cat /etc/logrotate.d/rails',
      'sudo cp -p /etc/logrotate.d/rails /etc/logrotate.d/rails.bak',
      'sudo vi /etc/logrotate.d/rails',
      'cat /etc/logrotate.d/rails',
      'sudo logrotate -d /etc/logrotate.d/rails',
      'sudo logrotate -vf /etc/logrotate.d/rails',
      'df -h',
      'ls -lh /var/www/myapp/shared/log',
      'cat ~/ops-notes.md'
    ],
    note:
'viでの編集は、行を消して書き直す（dd → o → 入力）でも、\n' +
'文字を消す（x を繰り返す）でも構いません。結果が同じなら操作は自由です。\n\n' +
'守ってほしいのは前後の手順です。\n' +
'**バックアップ → 編集 → dry-runで検証 → 適用 → 数字で確認。**\n' +
'本番の設定を触るときは、毎回この形にしてください。'
  }
});
})();
