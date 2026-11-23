/* CASE 32 — 長時間の作業が途中で死ぬ（tmux / nohup / HUP） */
(function () {
'use strict';
var APP = '/var/www/myapp';
var base = window.LFR.base;

var files = {};

files['/home/deploy/migrate.log'] =
'== 20260920100000 AddSearchIndexToProjects: migrating ==============\n' +
'-- add_index(:projects, [:published, :area_id, :published_at], {:algorithm=>:inplace})\n' +
'   -> 0.0021s\n' +
'   -> processed 120000 / 482913 rows\n' +
'   -> processed 240000 / 482913 rows\n';

files['/home/deploy/.bash_history'] =
'cd /var/www/myapp/current\n' +
'bundle exec rails db:migrate:status\n' +
'bundle exec rails db:migrate > ~/migrate.log 2>&1\n';

files['/home/deploy/ops-notes.md'] =
'# 作業メモ\n' +
'\n' +
'## 2026-09-25 01:20\n' +
'索引追加のmigrationを流した（48万行、10分くらいかかる見込み）。\n' +
'流したあと、しばらく待っていたが眠くなって席を外した。\n' +
'\n' +
'## 2026-09-25 09:30\n' +
'朝見たら、migrateが途中で止まっている。\n' +
'エラーは出ていない。migrate.log は 240000 / 482913 で終わっている。\n' +
'DBには索引が半端な状態で残っていないか確認が要る。\n';

files['/var/log/syslog'] =
'Sep 25 01:22:04 production sshd[52118]: Accepted publickey for ssm-user from 127.0.0.1 port 51204 ssh2\n' +
'Sep 25 01:24:41 production systemd-logind[612]: New session 88 of user deploy.\n' +
'Sep 25 01:41:02 production sshd[52118]: Received disconnect from 127.0.0.1 port 51204:11: disconnected by user\n' +
'Sep 25 01:41:02 production sshd[52118]: Disconnected from user deploy 127.0.0.1 port 51204\n' +
'Sep 25 01:41:02 production systemd-logind[612]: Session 88 logged out. Waiting for processes to exit.\n' +
'Sep 25 01:41:02 production systemd-logind[612]: Removed session 88.\n';

window.LFR.scenarios.add({
  id: 'case32',
  level: 11,
  title: '長時間の作業が途中で止まっていた',
  subtitle: '接続が切れると、流していた処理も道連れになる',

  description:
'昨夜1:24、索引追加のmigrationを流しました。48万行あるので10分ほどかかる見込みでした。\n\n' +
'  bundle exec rails db:migrate > ~/migrate.log 2>&1\n\n' +
'流したあと席を外し、朝見ると **途中で止まっていました**。\n\n' +
'  -> processed 240000 / 482913 rows\n\n' +
'エラーは1行も出ていません。ログがそこで終わっているだけです。\n' +
'サーバーは落ちていませんし、ディスクもメモリも余裕があります。\n\n' +
'なぜ止まったのかを突き止めて、**次は同じことが起きない形**で流し直してください。',

  learn: [
    { name: '接続が切れると何が起きるか', cmd: 'grep -i disconnect /var/log/syslog',
      desc: 'SSHやSession Managerの接続が切れると、そのセッションのシェルに\n' +
            '**HUP（hangup）シグナル**が送られます。\n' +
            'シェルは終了する前に、自分が起動した子プロセスにも HUP を送ります。\n\n' +
            'つまり、シェルから直接流した長時間処理は、接続が切れると一緒に死にます。\n' +
            'エラーも出ません。ただ途中で止まるだけです。\n\n' +
            '  ・SSHのタイムアウト\n' +
            '  ・ネットワークの瞬断\n' +
            '  ・PCのスリープ\n' +
            '  ・VPNの再接続\n\n' +
            'どれでも起きます。10分を超える作業なら、まず対策してから始めてください。' },
    { name: 'tmux', cmd: 'tmux new -s migrate',
      desc: '切断されても生き続ける仮想の端末を作ります。\n' +
            'その中で作業すれば、接続が切れても処理は動き続け、\n' +
            '**あとから同じ画面に戻れます**。\n\n' +
            '  tmux new -s migrate       migrate という名前で作る\n' +
            '  Ctrl+b → d                離れる（処理は動き続ける）\n' +
            '  tmux ls                   セッション一覧\n' +
            '  tmux attach -t migrate    戻る\n' +
            '  tmux kill-session -t ...  終わったら片付ける\n\n' +
            '長時間の作業では、まず tmux に入ってから始めるのが基本です。' },
    { name: 'nohup', cmd: 'nohup bundle exec rails db:migrate > ~/migrate.log 2>&1 &',
      desc: 'HUPシグナルを無視させて、背後で実行します。\n\n' +
            '  nohup   HUPを無視する\n' +
            '  > log   出力をファイルへ（**戻れないので必須**）\n' +
            '  2>&1    標準エラーも同じファイルへ\n' +
            '  &       背後で実行してプロンプトを返す\n\n' +
            'tmuxと違って画面には戻れません。進捗はログファイルで追います。\n' +
            '  tail -f ~/migrate.log\n\n' +
            '「あとから様子を見たい」なら tmux、\n' +
            '「投げっぱなしでよい」なら nohup、と使い分けます。' },
    { name: 'シグナルの復習', cmd: 'kill -l',
      desc: 'HUP は元々「端末が切れた」を伝えるシグナルでした。\n' +
            'いまは「設定を読み直せ」という意味でも使われます（nginx など）。\n\n' +
            '  TERM  終わってください（後始末できる）\n' +
            '  HUP   端末が切れた／設定を読み直せ\n' +
            '  KILL  問答無用で終了（後始末できない）\n\n' +
            'nohup が「no hangup」なのは、このHUPを無視するという意味です。' },
    { name: '途中で止まった作業の確認', cmd: 'rails db:migrate:status',
      desc: '止まったあとの状態確認も大事です。\n' +
            'migrationが途中で切れた場合、DBには中途半端な変更が残っている可能性があります。\n' +
            '流し直す前に、いまどうなっているかを必ず確認してください。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '09:34:12',
  date: 'Sep 25',

  tmux: [
    { name: 'reindex', created: 'Sep 24 22:10:02', attached: false,
      log: ['$ bundle exec rails runner -e production "Project.reindex!"',
            'reindexed 482913 documents',
            'done (elapsed 1840.2s)'] }
  ],

  rails: {
    version: '7.2.1',
    migrations: [
      { version: '20260901120000', name: 'CreateEntries',                 up: true },
      { version: '20260910110000', name: 'AddSalaryRangeToProjects',      up: true },
      { version: '20260920100000', name: 'AddSearchIndexToProjects',      up: false, seconds: '612.4' }
    ]
  },

  hints: [
    'エラーが出ていないのに途中で止まった、というのが手がかりです。\n' +
    '処理が異常終了したのではなく、**外から止められた**可能性を考えてください。\n' +
    'その時刻に何が起きていたかは、OSのログに残っています。',

    'grep -i disconnect /var/log/syslog を実行してください。\n' +
    'migrate.log が止まった時刻と、SSHが切断された時刻を見比べてください。\n\n' +
    'シェルから直接流した処理は、接続が切れるとどうなるでしょうか。',

    '対策は2つあります。\n\n' +
    '  tmux new -s migrate    切っても生き続ける端末の中で作業する（あとから戻れる）\n' +
    '  nohup ... > log 2>&1 & HUPを無視させて背後で実行する（戻れないのでログ必須）\n\n' +
    '流し直す前に rails db:migrate:status で、いまの状態を確認してください。'
  ],

  probes: [
    { key: 'sawLogStopped', label: 'ログが途中で終わっていることを確認した',
      test: function (c, res) { return /240000 \/ 482913/.test(res.stdout); } },
    { key: 'foundDisconnect', label: '同時刻にSSHが切断された記録を見つけた',
      test: function (c, res) { return /Disconnected|Received disconnect|Removed session/.test(res.stdout); } },
    { key: 'checkedMigrationState', label: 'migrationの状態を確認した',
      test: function (c, res) { return /db:migrate:status/.test(c) && /AddSearchIndexToProjects/.test(res.stdout); } },
    { key: 'usedTmux', label: 'tmuxを使った',
      test: function (c) { return /\btmux\b/.test(c); } },
    { key: 'sawOtherSession', label: '同僚のtmuxセッションが残っているのを見た',
      test: function (c, res) { return /reindex/.test(res.stdout); } },
    { key: 'usedNohup', label: 'nohup の形を確認した',
      test: function (c) { return /\bnohup\b/.test(c); } },
    { key: 'redirectedOutput', label: '出力をファイルへ落とす形にした',
      test: function (c) { return /2>&1/.test(c) || />\s*~?\/?\S*\.log/.test(c); } }
  ],

  evidence: [
    { key: 'sawLogStopped',         weight: 10, label: 'どこで止まったかを確認した' },
    { key: 'foundDisconnect',       weight: 20, label: '切断の記録と時刻を突き合わせた' },
    { key: 'checkedMigrationState', weight: 14, label: '流し直す前に状態を確認した' },
    { key: 'usedTmux',              weight: 18, label: 'tmuxを使った' },
    { key: 'sawOtherSession',       weight: 8,  label: '残っているセッションを確認した' },
    { key: 'usedNohup',             weight: 12, label: 'nohup の形も確認した' },
    { key: 'redirectedOutput',      weight: 10, label: '出力をファイルへ落とす形にした' }
  ],

  question: {
    text: 'migrationが途中で止まった原因と、次に取るべき形は？',
    choices: [
      'DBのロック待ちでタイムアウトした。innodb_lock_wait_timeout を延ばして流し直す',
      'SSHの接続が切れてシェルにHUPが送られ、配下のmigrationも一緒に終了した。tmux か nohup を使って流し直す',
      'サーバーのメモリが不足してOOM Killerに落とされた。インスタンスを大きくする',
      'migrationのコードにバグがあり、240000行目でエラーになった。ログを詳しく出して再実行する'
    ],
    answer: 1,
    explain:
'時刻を並べると、答えが出ます。\n\n' +
'  $ tail -n 3 ~/migrate.log\n' +
'     -> processed 240000 / 482913 rows        ← ここで終わっている\n\n' +
'  $ grep -i disconnect /var/log/syslog\n' +
'  Sep 25 01:41:02 production sshd[52118]: Received disconnect from 127.0.0.1\n' +
'  Sep 25 01:41:02 production sshd[52118]: Disconnected from user deploy\n' +
'  Sep 25 01:41:02 production systemd-logind[612]: Removed session 88.\n\n' +
'  1:24に開始、1:41に接続が切断。migrate.log もそこで終わっています。\n\n' +
'【なぜ一緒に死ぬのか】\n' +
'接続が切れると、そのセッションのシェルに **HUP（hangup）シグナル**が届きます。\n' +
'シェルは終了する前に、自分が起動した子プロセスにも HUP を送ります。\n' +
'migration は shell から直接起動された子プロセスなので、巻き添えで終了しました。\n\n' +
'エラーが出ないのはこのためです。異常終了ではなく、\n' +
'「終わってください」と言われて終わっただけなので、ログには何も残りません。\n\n' +
'【次はどう流すか】\n\n' +
'  方法1: tmux（推奨）\n' +
'    $ tmux new -s migrate\n' +
'    （この中で）bundle exec rails db:migrate\n' +
'    Ctrl+b → d           離れる。処理は動き続ける\n' +
'    $ tmux ls            動いていることを確認\n' +
'    $ tmux attach -t migrate   戻って進捗を見る\n\n' +
'  方法2: nohup\n' +
'    $ nohup bundle exec rails db:migrate > ~/migrate.log 2>&1 &\n' +
'    $ tail -f ~/migrate.log     進捗はログで追う\n\n' +
'  tmuxは**あとから同じ画面に戻れる**のが利点です。\n' +
'  nohupは戻れないので、出力を必ずファイルへ落とします（> log 2>&1）。\n\n' +
'  実際、同僚は tmux を使っていました。\n' +
'    $ tmux ls\n' +
'    reindex: 1 windows (created Sep 24 22:10:02)\n' +
'  昨夜の再インデックスは、切断をまたいで最後まで完走しています。\n\n' +
'【流し直す前に確認する】\n' +
'  $ rails db:migrate:status\n' +
'   down   20260920100000  AddSearchIndexToProjects\n\n' +
'  down のままなので、このmigrationは適用されていません。\n' +
'  （MySQLのDDLはトランザクションで巻き戻らないので、\n' +
'    途中で切れた索引が残っていないかはDB側でも確認する価値があります）\n\n' +
'--- 目安 ---\n\n' +
'**10分を超える見込みの作業は、まず tmux に入ってから始める。**\n' +
'migration、再インデックス、大量ファイルの削除、バックアップの取得。\n' +
'「すぐ終わるはず」と思った作業ほど、切断に巻き込まれます。',
    wrong: [
'ロック待ちのタイムアウトなら、ログにその旨が出ます。\n' +
'  ActiveRecord::StatementInvalid: Lock wait timeout exceeded\n\n' +
'今回のログにはエラーが1行もありません。進捗の行で綺麗に終わっています。\n' +
'**エラーが無いまま止まっている**ことが、外から止められたサインです。\n\n' +
'なお、大きなテーブルへの索引追加でロックが問題になること自体はあります。\n' +
'その場合は ALGORITHM=INPLACE や、アクセスの少ない時間帯の選択を検討します。',
null,
'OOM Killerではありません。\n' +
'落とされた場合は必ず記録が残ります。\n\n' +
'  $ grep -i "out of memory" /var/log/syslog\n' +
'  （何も出ない）\n\n' +
'  $ free -h\n' +
'  available にも余裕があり、swapも使っていません。\n\n' +
'OOM Killerに落とされたなら syslog / journal に\n' +
'`Out of memory: Killed process ...` が残ります（CASE 06で見た形です）。\n' +
'記録が無いなら、別の理由で終わっています。',
'コードのバグではありません。\n' +
'バグなら例外とバックトレースがログに出ます。\n' +
'そして migrate.log は `2>&1` で標準エラーも同じファイルへ落としているので、\n' +
'エラーがあれば必ず記録されています。\n\n' +
'  $ rails db:migrate:status\n' +
'   down   20260920100000  AddSearchIndexToProjects\n\n' +
'まだ適用されていないだけで、失敗の記録もありません。\n' +
'**ログが綺麗に途中で終わっている**のは、処理が外から止められた形です。'
    ]
  },

  route: {
    steps: [
      'どこまで進んで止まったかを確認する',
      'エラーが出ていないことを確認する（＝異常終了ではない）',
      'その時刻にOS側で何が起きたかを見る（syslog）',
      '切断の時刻とログの最終行の時刻を突き合わせる',
      'migrationの状態を確認してから流し直す',
      'tmux か nohup を使って、切断に耐える形で実行する'
    ],
    commands: [
      'tail -n 5 ~/migrate.log',
      'grep -c ERROR ~/migrate.log',
      'grep -i disconnect /var/log/syslog',
      'cat ~/ops-notes.md',
      'cat ~/.bash_history',
      'free -h',
      'rails db:migrate:status',
      'tmux ls',
      'tmux new -s migrate',
      'nohup bundle exec rails db:migrate > ~/migrate.log 2>&1 &',
      'tmux attach -t reindex'
    ],
    note:
'syslog から入っても、migrate.log の最終行から入っても構いません。\n' +
'身につけてほしいのは判断の型です。\n' +
'**エラーが無いまま途中で止まっていたら、外から止められたと考える。**\n' +
'そして次からは、長い作業を裸のシェルで流さないでください。'
  }
});
})();
