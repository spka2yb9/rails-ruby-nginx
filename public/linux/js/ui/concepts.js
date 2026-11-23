/* 基礎（用語）
   ------------------------------------------------------------------
   コマンドの使い方ではなく、その手前にある考え方を置く。
   「プロセスとは」「シグナルとは」が曖昧なままだと、
   ps や kill をいくら覚えても本番では手が止まる。

   CASE画面から、その回に出てくる用語だけを抜き出して見せる。   */
(function () {
'use strict';

var CONCEPTS = [

{ id: 'process', title: 'プロセス', tags: ['プロセス', 'PID', 'ps', 'pgrep', 'worker', 'master', 'top'],
  summary: '実行中のプログラム1つ1つのこと。番号（PID）で区別する。',
  body:
'ディスクに置いてあるプログラム（実行ファイル）を起動すると、OSはそれを1つの「プロセス」として動かします。\n' +
'同じプログラムから何個でもプロセスを作れます。Pumaのworkerが2つあるのは、同じコードのプロセスが2つ動いている状態です。\n\n' +
'プロセスは1つずつ次のものを持ちます。\n\n' +
'  PID          識別番号。OSが起動順に振る。再起動すると必ず変わる\n' +
'  親（PPID）   自分を起動したプロセス。Pumaのworkerの親はmaster\n' +
'  メモリ空間   他のプロセスからは覗けない、自分専用の領域\n' +
'  環境変数     起動したときに渡された値のコピー\n' +
'  開いているファイル  ログファイルやソケット（→ ファイルディスクリプタ）\n' +
'  実行ユーザー 誰の権限で動いているか（deploy / root / nginx …）\n\n' +
'ここから2つの重要な性質が出てきます。\n\n' +
'**1. プロセスは起動したときの状態を持ち続ける**\n' +
'コードも環境変数も、起動した瞬間に読み込んだものを使い続けます。\n' +
'デプロイでファイルを入れ替えても、動いているプロセスは古いコードのままです。\n' +
'だから「反映されない」ときは再起動が要ります（CASE 07 / 12 / 20 / 23）。\n\n' +
'**2. PIDが変わったかどうかが、入れ替わった証拠になる**\n' +
'再起動したつもりでPIDが同じなら、そのプロセスは死んでいません。\n' +
'逆にPIDが変われば、確かに新しいプロセスに入れ替わっています。',
  commands: ['ps aux | grep puma', 'pgrep -a puma', 'ps aux | grep sidekiq'],
  related: ['signal', 'fd', 'env', 'user'] },

{ id: 'signal', title: 'シグナル', tags: ['シグナル', 'kill', 'SIGTERM', 'SIGKILL', 'SIGHUP', 'USR1', 'USR2', '-9'],
  summary: 'プロセスに「こうしてほしい」と伝える、OSからの短い合図。',
  body:
'シグナルは、プロセスへ送る一文字の通知のようなものです。\n' +
'`kill` というコマンド名は紛らわしいのですが、やっているのは「殺す」ではなく「シグナルを送る」です。\n\n' +
'  kill  <PID>      既定の TERM を送る\n' +
'  kill -9 <PID>    KILL を送る\n' +
'  kill -USR2 <PID> USR2 を送る\n\n' +
'主なシグナルと意味です。\n\n' +
'  TERM (15)  「終わってください」。**プロセスは受け取って自分で後始末できる**\n' +
'             → 処理中のリクエストを返し、一時ファイルを消し、接続を閉じてから終了する\n' +
'  INT  (2)   Ctrl+C。TERMとほぼ同じだが、対話的な中断の意味\n' +
'  HUP  (1)   元は「端末が切れた」。いまは「設定を読み直せ」として使われることが多い\n' +
'             → nginx は HUP で設定を再読み込みする。SSHが切れたときにも飛んでくる\n' +
'  QUIT (3)   終了＋コアダンプ。Pumaは「いま処理中のものを終えてから止まる」に使う\n' +
'  USR1 / USR2  意味はプログラムが決めてよい枠\n' +
'             → **Pumaでは USR1 が phased-restart、USR2 が restart**\n' +
'             → nginx は USR1 でログファイルを開き直す（logrotate後に使う）\n' +
'  KILL (9)   **プロセスに届かない**。OSが問答無用で消す\n\n' +
'KILL だけ性質が違います。他のシグナルはプロセスが受け取って処理を書けますが、\n' +
'KILL は受け取ることも無視することもできません。つまり後始末が一切できません。\n\n' +
'  ・処理中のリクエストは応答を返さないまま切れる\n' +
'  ・pidfile や socket が残る\n' +
'  ・Sidekiqなら実行中のジョブが「実行中」のまま取り残される\n\n' +
'だから `kill -9` は最後の手段です。まず `systemctl stop`（内部的にTERMを送る）、\n' +
'それでも止まらないときに初めてKILLを検討します。',
  commands: ['kill 1421', 'kill -USR1 1421', 'pkill -TERM sidekiq'],
  related: ['process', 'systemd'] },

{ id: 'fd', title: 'ファイルディスクリプタ（fd）', tags: ['fd', 'ファイルディスクリプタ', 'lsof', 'stdout', 'stderr', 'Too many open files'],
  summary: 'プロセスが「いま開いているファイル」に付く番号。ログもソケットも同じ仕組み。',
  body:
'プロセスがファイルを開くと、そのプロセスの中だけで通じる番号が割り当てられます。これがfdです。\n\n' +
'  0  標準入力  （stdin）\n' +
'  1  標準出力  （stdout）\n' +
'  2  標準エラー（stderr）\n' +
'  3以降  自分で開いたファイル・ソケット\n\n' +
'Linuxでは、通常のファイルもネットワークのソケットもパイプも、すべて同じfdとして扱われます。\n' +
'`lsof` が「開いているファイル」と言いながらポートも表示するのは、そのためです。\n\n' +
'**ここから2つの実務上の落とし穴が出てきます。**\n\n' +
'**1. rm しても容量が戻らないことがある**\n' +
'ファイルの実体は「名前」ではなく、開いているfdからも参照されています。\n' +
'誰かが開いたままのファイルを rm すると、ディレクトリから名前が消えるだけで実体は残ります。\n' +
'解放されるのは、開いていた全プロセスが終了したときです。\n' +
'  → `df` は満杯なのに `du` で探しても見つからない、という状況になります\n' +
'  → `lsof +L1` で「削除済みなのに開かれたまま」のファイルが見えます\n' +
'  → だからログを空けるときは rm ではなく `truncate -s 0` を使います\n\n' +
'**2. 開ける数に上限がある**\n' +
'1プロセスが同時に開けるfdの数には上限があります（`ulimit -n`）。\n' +
'アクセスが増えてソケットが増えると、この上限に当たって\n' +
'`Errno::EMFILE: Too many open files` が出ます。\n' +
'systemdのunitなら `LimitNOFILE=` で引き上げます。',
  commands: ['lsof +L1', 'lsof -p 1421', 'ulimit -n', 'cat /proc/1421/limits'],
  related: ['process', 'inode', 'stdio'] },

{ id: 'stdio', title: '標準入出力とリダイレクト', tags: ['stdout', 'stderr', 'リダイレクト', 'パイプ', '2>&1', '>', '>>', '|'],
  summary: 'コマンドの「入口」と「2つの出口」。つなぎ替えられるのがLinuxの強み。',
  body:
'どのコマンドにも、入口が1つと出口が2つあります。\n\n' +
'  標準入力  (0)  データが流れ込んでくるところ\n' +
'  標準出力  (1)  普通の結果を出すところ\n' +
'  標準エラー(2)  エラーメッセージを出すところ\n\n' +
'出力が2つに分かれているのは、**結果とエラーを別々に扱えるようにする**ためです。\n' +
'`grep ERROR log | mail` のようにつないだとき、エラーメッセージが混ざると困るからです。\n\n' +
'つなぎ替えの記号はこれだけです。\n\n' +
'  cmd > file     標準出力をファイルへ。**既存の内容は消える**\n' +
'  cmd >> file    標準出力をファイルの末尾へ追記\n' +
'  cmd 2> file    標準エラーだけをファイルへ\n' +
'  cmd > file 2>&1   標準出力をファイルへ、標準エラーも同じところへ\n' +
'  cmd1 | cmd2    cmd1の標準出力を、cmd2の標準入力へ\n\n' +
'`2>&1` は「2番の出口を、1番の出口と同じ場所につなぐ」という意味です。\n' +
'cronの行に必ずこれを付けるのは、これが無いとエラーメッセージだけが消えてしまうからです（CASE 25）。\n\n' +
'**注意**: `>` は開いた瞬間にファイルを空にします。\n' +
'`> log/production.log` と打ち間違えると、調査中のログがその場で消えます。',
  commands: ['cat log/production.log | grep ERROR | tail -n 20', 'grep -c ERROR log/production.log'],
  related: ['fd', 'shell'] },

{ id: 'inode', title: 'ファイルとinode', tags: ['inode', 'df -i', 'ハードリンク', 'symlink', 'シンボリックリンク', 'ls -l'],
  summary: 'ファイルは「名前」と「実体」に分かれている。この分離が多くの挙動を説明する。',
  body:
'Linuxのファイルは2つに分かれています。\n\n' +
'  実体（inode） 中身・サイズ・permission・所有者・更新時刻を持つ。番号で管理される\n' +
'  名前          ディレクトリの中にある「inode番号への参照」\n\n' +
'`ls` で見えているのは名前の方です。実体はその先にあります。\n\n' +
'この分離から、いくつもの挙動が説明できます。\n\n' +
'**ハードリンク**: 1つの実体に複数の名前を付けられます。どれを消しても実体は残り、\n' +
'名前が全部消えたときに初めて実体が消えます。\n\n' +
'**シンボリックリンク**: 「別の名前を指す」だけの小さなファイルです。\n' +
'実体ではないので、指し先が消えるとリンクは壊れます。\n' +
'`ls -l` で行頭が `l` になり、`->` で指し先が表示されます。\n' +
'Capistranoの `current` がこれです（CASE 13）。\n\n' +
'**rm しても容量が戻らない**: 開いているfdも実体への参照なので、\n' +
'名前を消しても参照が残っていれば実体は消えません（→ ファイルディスクリプタ）。\n\n' +
'**inode枯渇**: 実体の数には上限があります。容量が余っていても、\n' +
'inodeを使い切ると新しいファイルを作れません。\n' +
'小さいファイルが大量にあると起きます（セッション、キャッシュ、メールキュー）。\n' +
'  → 症状は「No space left on device」なのに `df -h` には空きがある\n' +
'  → `df -i` で確認します',
  commands: ['ls -la /var/www/myapp', 'readlink current', 'df -i', 'find /var -xdev -type f | wc -l'],
  related: ['fd', 'permission'] },

{ id: 'permission', title: 'permission と所有者', tags: ['permission', 'chmod', 'chown', 'ls -l', 'rwx', '644', '755', 'Permission denied'],
  summary: '「誰が」「何を」できるか。rwx の3つ × 所有者/グループ/その他の3つ。',
  body:
'`ls -l` の1行は、こう読みます。\n\n' +
'  -rw-r--r--  1  deploy  deploy  206  Sep 14 12:00  application.rb\n' +
'  └────┬───┘     └──┬─┘  └──┬─┘\n' +
'   permission      所有者   グループ\n\n' +
'permissionの10文字は「種別 + 所有者rwx + グループrwx + その他rwx」です。\n\n' +
'  1文字目  -=通常ファイル  d=ディレクトリ  l=シンボリックリンク\n' +
'  r (4) 読める    w (2) 書ける    x (1) 実行できる\n\n' +
'数字はこの合計です。\n\n' +
'  600 = rw-------  所有者だけ読み書き（鍵ファイル）\n' +
'  644 = rw-r--r--  所有者は読み書き、他は読みだけ（設定ファイル）\n' +
'  755 = rwxr-xr-x  ディレクトリや実行ファイル\n' +
'  777 = rwxrwxrwx  **誰でも何でもできる。本番では使わない**\n\n' +
'**ディレクトリのrwxは意味が違います。**\n' +
'  r  中のファイル名を一覧できる\n' +
'  w  中にファイルを作る・消せる\n' +
'  x  中に入れる（通り抜けられる）\n' +
'ディレクトリに x が無いと、中のファイルが644でも読めません。\n\n' +
'**そして、permissionだけ見ても判断できません。**\n' +
'「誰として実行しているか」と必ずセットで考えてください。\n' +
'  → `whoami` / `id` で自分を確認\n' +
'  → systemdのサービスは unit の `User=` で決まる\n\n' +
'Permission denied を見たら、`chmod` で緩める前に\n' +
'`ls -l` と `whoami` を見て、**所有者が正しいか**を疑ってください。\n' +
'多くの場合、正解は `chmod 777` ではなく `chown` です（CASE 16）。',
  commands: ['ls -l /var/www/myapp/shared/config', 'whoami', 'id'],
  related: ['user', 'inode'] },

{ id: 'user', title: 'ユーザーと sudo', tags: ['ユーザー', 'sudo', 'su', 'whoami', 'root', 'deploy', 'ssm-user'],
  summary: 'すべての操作には「誰として実行したか」が付く。',
  body:
'Linuxではコマンドもプロセスも、必ず誰かのユーザーとして実行されます。\n\n' +
'このサーバーで出てくるユーザーはこうです。\n\n' +
'  root      何でもできる管理者\n' +
'  deploy    アプリを動かすユーザー。/var/www/myapp の所有者\n' +
'  ssm-user  Session Managerで接続した直後のユーザー\n' +
'  nginx / redis / mysql  各ミドルウェア専用のユーザー\n\n' +
'アプリのファイルもプロセスも `deploy` のものなので、\n' +
'SSMで入った直後（ssm-user）のままでは、うまく触れないことがあります。\n' +
'  → `sudo su - deploy` で切り替えます（CASE 00）\n\n' +
'**sudo は「rootとして1回だけ実行する」コマンドです。**\n' +
'サービスの起動・停止、/etc 以下の編集、他ユーザーのファイル操作に要ります。\n\n' +
'  sudo systemctl restart puma        rootとして実行\n' +
'  sudo -u deploy bundle exec rails   deployとして実行\n' +
'  sudo -l                            自分が何をsudoできるか確認\n\n' +
'sudoの実行は記録に残ります。本番では「誰がいつ何をしたか」が追えることが重要なので、\n' +
'rootで直接ログインするのではなく、自分のアカウントからsudoするのが基本です。\n\n' +
'なお、systemdのサービスがどのユーザーで動くかは unit の `User=` で決まります。\n' +
'ログインシェルのユーザーとは無関係です。',
  commands: ['whoami', 'id', 'sudo su - deploy', 'sudo -l'],
  related: ['permission', 'process', 'systemd'] },

{ id: 'env', title: '環境変数', tags: ['環境変数', 'env', 'printenv', 'PATH', 'EnvironmentFile', 'RAILS_ENV'],
  summary: 'プロセスが起動時に受け取る「名前と値」の一覧。子プロセスへ引き継がれる。',
  body:
'環境変数は、プロセスが起動するときに親から渡される値です。\n' +
'渡されるのは**コピー**なので、起動後に親が変えても、すでに動いているプロセスには反映されません。\n\n' +
'ここから重要な性質が出てきます。\n\n' +
'**1. 「自分のシェルで見えている」＝「そのプロセスが持っている」ではない**\n' +
'SSHして `env` を見たら値が入っていても、\n' +
'systemdが起動したPumaが同じ値を持っているとは限りません。\n' +
'systemdのサービスはログインシェルを経由しないので、\n' +
'`~/.bashrc` も読まず、unitの `Environment=` / `EnvironmentFile=` で渡されたものだけを受け取ります。\n' +
'  → アプリが実際に何を持っているかは、unitファイルから辿ります（CASE 17）\n' +
'  → 動いているプロセスの実際の値は `/proc/<PID>/environ` で見られます\n\n' +
'**2. cronも同じ**\n' +
'cronもログインシェルを経由しません。PATHは最小限（だいたい /usr/bin:/bin）だけです。\n' +
'手で打つと動くのにcronだと `command not found` になるのは、ほぼこれが原因です（CASE 25）。\n\n' +
'**3. 秘密情報が入っている**\n' +
'`SECRET_KEY_BASE` や `DATABASE_PASSWORD` も環境変数です。\n' +
'引数なしの `env` は、それらをすべて画面に出します。\n' +
'画面共有・録画・スクロールバックに残るので、本番では必ず絞ってください。\n\n' +
'  env | grep -c AWS_SECRET_ACCESS_KEY   在るかどうかだけ（0か1）\n' +
'  env | cut -d= -f1 | sort              名前だけ一覧する\n' +
'  printenv SECRET_KEY_BASE | wc -c      長さだけ',
  commands: ['env | grep RAILS', 'printenv RAILS_ENV', 'env | cut -d= -f1 | sort'],
  related: ['process', 'shell', 'systemd'] },

{ id: 'shell', title: 'シェルとセッション', tags: ['シェル', 'bash', 'ログインシェル', 'bashrc', 'SSH', 'tmux', 'nohup', 'バックグラウンド'],
  summary: '打ったコマンドを解釈して実行する担当。接続が切れると、その配下ごと巻き込まれる。',
  body:
'SSHやSession Managerで接続すると、シェル（bash）が1つ起動します。\n' +
'打った文字列を解釈して、コマンドを起動するのがシェルの仕事です。\n' +
'パイプもリダイレクトもワイルドカード（`*`）の展開も、コマンドではなくシェルがやっています。\n\n' +
'**ログインシェルと、そうでないシェル**\n' +
'接続して開くシェルは「ログインシェル」で、`~/.bash_profile` や `~/.bashrc` を読み込みます。\n' +
'rbenvのPATHなどはここで設定されます。\n' +
'一方 cron や systemd はログインシェルを経由しないので、これらを読みません（→ 環境変数）。\n\n' +
'**接続が切れるとどうなるか**\n' +
'接続が切れると、そのシェルに HUP シグナルが飛び、シェルは配下のプロセスにも HUP を送ります。\n' +
'つまり、**流しっぱなしにしていた長時間の処理も一緒に死にます。**\n' +
'夜間のmigrationやreindexが中途半端に終わる事故の典型的な原因です。\n\n' +
'避け方は2つあります。\n\n' +
'  nohup cmd > log 2>&1 &   HUPを無視して動くようにして、背後で実行する\n' +
'  tmux                     切っても生き続ける仮想端末の中で作業する\n\n' +
'tmuxの利点は、切断されても**あとから同じ画面に戻れる**ことです。\n' +
'nohupは戻れないので、出力は必ずファイルへ落としておきます。\n\n' +
'  tmux new -s migrate      migrateという名前のセッションを作る\n' +
'  Ctrl+b → d               離れる（処理は動き続ける）\n' +
'  tmux ls                  セッション一覧\n' +
'  tmux attach -t migrate   戻る',
  commands: ['echo $SHELL', 'tmux ls', 'jobs'],
  related: ['env', 'process', 'signal'] },

{ id: 'systemd', title: 'systemd と unit', tags: ['systemd', 'systemctl', 'unit', 'journalctl', 'daemon-reload', 'timer', 'service'],
  summary: 'サービスを起動・監視・再起動する仕組み。設定は unit ファイルに書く。',
  body:
'サーバーの常駐サービス（nginx / Puma / Sidekiq / Redis）は、systemd が管理しています。\n' +
'「いつ起動するか」「落ちたらどうするか」「どのユーザーで動かすか」を unit ファイルに書きます。\n\n' +
'  /etc/systemd/system/puma.service\n\n' +
'unit でよく見る項目です。\n\n' +
'  User=deploy           このユーザーで動かす\n' +
'  ExecStart=...         起動コマンド\n' +
'  EnvironmentFile=...   環境変数をここから読む\n' +
'  KillSignal=SIGTERM    停止時に送るシグナル\n' +
'  TimeoutStopSec=30     何秒待ってから強制終了するか\n' +
'  Restart=on-failure    異常終了したら起こし直す\n\n' +
'**Active: の意味**\n' +
'`systemctl status` の Active は、あくまで **systemdの認識** です。\n' +
'  active (running)  systemdが「動いている」と思っている\n' +
'  failed            異常終了した\n' +
'  inactive (dead)   止まっている\n\n' +
'systemdが追っているPIDと実際のプロセスがずれると、\n' +
'「activeなのに動いていない」が起こり得ます（CASE 06）。\n' +
'だから `systemctl` と `ps` の両方を見ます。\n\n' +
'**unitを編集したら daemon-reload**\n' +
'unitファイルを直しても、systemdは自動では読み直しません。\n' +
'  sudo systemctl daemon-reload   ← unitの変更を読み込む\n' +
'  sudo systemctl restart puma    ← そのうえでサービスを入れ替える\n' +
'この2段構えを忘れると「直したのに変わらない」になります。\n\n' +
'**ログはjournalに入る**\n' +
'サービスが標準出力・標準エラーに書いたものは journal に集約されます。\n' +
'アプリが起動する前に失敗した場合、手がかりはここにしかありません。',
  commands: ['systemctl status puma', 'systemctl cat puma', 'sudo systemctl daemon-reload', 'journalctl -u puma -n 30'],
  related: ['process', 'signal', 'logs', 'user'] },

{ id: 'logs', title: 'ログの置き場所', tags: ['ログ', 'production.log', 'journalctl', 'syslog', 'nginx', 'logrotate'],
  summary: '本番には層ごとに別のログがある。どの層で止まっているかで、読む場所が変わる。',
  body:
'「ログを見る」と言っても、本番には少なくとも4種類あります。\n\n' +
'  アプリ      /var/www/myapp/shared/log/production.log\n' +
'              Railsが起動したあとの、リクエスト単位の記録\n' +
'  サービス    journalctl -u puma\n' +
'              systemdが集めた、そのサービスの標準出力・標準エラー\n' +
'  Webサーバー /var/log/nginx/{access,error}.log\n' +
'              リクエストがRailsに届く手前の記録\n' +
'  OS          /var/log/syslog（または journalctl）\n' +
'              cronの実行、OOM Killer、カーネルの記録\n\n' +
'**読む場所を決める分岐**\n\n' +
'  Railsのログが増えている   → アプリの中の問題。production.log を読む\n' +
'  Railsのログが増えていない → 起動前の問題。journalctl を読む\n' +
'  502が返っている           → nginxのerror.logで「何に繋がらなかったか」を見る\n' +
'  プロセスが突然消えた       → syslog / journal で OOM Killer を疑う\n\n' +
'この分岐ができるだけで、調査の速さがまったく変わります。\n\n' +
'**ログは放っておくと増え続ける**\n' +
'Railsのログはローテートされません。設定しない限り際限なく増え、\n' +
'ディスクを埋めてサービスを止めます（CASE 10 / 19 / 27）。\n' +
'  → logrotate に登録する\n' +
'  → ローテート済みは `.gz` になるので、読むときは `zgrep` / `zcat`',
  commands: ['tail -n 50 log/production.log', 'journalctl -u puma -n 30', 'tail /var/log/nginx/error.log'],
  related: ['systemd', 'stdio', 'inode'] },

{ id: 'memory', title: 'メモリと swap', tags: ['メモリ', 'free', 'RSS', 'VSZ', 'swap', 'buff/cache', 'available', 'OOM'],
  summary: 'used ではなく available を見る。swapが動き始めたら全体が遅くなる。',
  body:
'`free -h` の見方です。\n\n' +
'  total       搭載されている全体量\n' +
'  used        プロセスが使っている量\n' +
'  free        完全に空いている量（**これは見なくてよい**）\n' +
'  buff/cache  OSがディスクの内容をキャッシュしている量。必要になれば解放される\n' +
'  available   **実際にこれから使える量。見るべきはここ**\n\n' +
'Linuxは空きメモリをキャッシュに使うので、`free` が少ないのは正常です。\n' +
'判断は `available` で行います。\n\n' +
'**プロセス側の見方**\n' +
'  RSS  実際に物理メモリを使っている量。**これが実質の使用量**\n' +
'  VSZ  確保を宣言した仮想の量。実際には使っていない分も含むので大きく出る\n\n' +
'**swap**\n' +
'メモリが足りなくなると、OSは使っていないメモリの中身をディスクへ退避します。これがswapです。\n' +
'ディスクはメモリより桁違いに遅いため、swapが動き始めた瞬間に\n' +
'サーバー全体が急激に遅くなります。エラーは出ないのに全部遅い、の典型です（CASE 09）。\n\n' +
'**OOM Killer**\n' +
'swapも尽きると、カーネルがメモリを大量に使っているプロセスを強制終了します。\n' +
'これはKILLシグナル相当なので、後始末はされません。\n' +
'  → `journalctl` や syslog に `Out of memory: Killed process ...` が残ります（CASE 06）\n' +
'  → systemctlが「active」のままプロセスだけ消える、という食い違いが起きます',
  commands: ['free -h', 'top', 'ps aux | grep puma'],
  related: ['process', 'load', 'signal'] },

{ id: 'load', title: 'load average と CPU', tags: ['load average', 'uptime', 'top', 'CPU', 'iowait', 'wa'],
  summary: '「順番待ちの数」。CPUコア数と比べて判断する。高い＝CPU不足、とは限らない。',
  body:
'`uptime` の load average は、**実行待ちのプロセス数**の1分・5分・15分平均です。\n\n' +
'  load average: 14.22, 11.87, 6.40\n' +
'                 1分    5分   15分\n\n' +
'判断はCPUコア数と比べます。4コアなら 4.0 前後で「ちょうど飽和」です。\n' +
'コア数は `top` の `%Cpu(s)` 行や `nproc` で確認できます。\n\n' +
'1分値 > 15分値なら、いま悪化しています。逆なら回復中です。\n\n' +
'**重要なのは、load average に「I/O待ち」も含まれることです。**\n' +
'数字が高い＝CPU不足、とは限りません。内訳は `top` で見ます。\n\n' +
'  us  ユーザープロセスの計算（アプリが重い）\n' +
'  sy  カーネルの処理\n' +
'  id  アイドル（余っている）\n' +
'  wa  **I/O待ち**（ディスクやswapの読み書きを待っている）\n\n' +
'  us が高い  → 本当にCPUが足りない。重い処理を探す\n' +
'  wa が高い  → CPUは暇。ディスクが遅いかswapが動いている（CASE 09）\n\n' +
'この2つを取り違えると、「サーバーを増強したのに直らない」になります。',
  commands: ['uptime', 'top', 'free -h'],
  related: ['memory', 'process'] },

{ id: 'port', title: 'ポートとソケット', tags: ['ポート', 'listen', 'ss', 'netstat', 'ソケット', '0.0.0.0', '127.0.0.1', 'UNIXソケット'],
  summary: '「どこで待ち受けているか」。動いていることと、繋がることは別。',
  body:
'サーバーのプログラムは、接続を待ち受ける口を開きます。これが listen です。\n\n' +
'  ss -lntp     listenしているTCPポートと、掴んでいるプロセスを表示\n' +
'               -l listenのみ  -n 名前解決しない  -t TCP  -p プロセス名\n\n' +
'見るべきはポート番号だけではありません。**アドレス側が重要です。**\n\n' +
'  0.0.0.0:80      すべてのインターフェースで受け付ける（外部から繋がる）\n' +
'  127.0.0.1:6379  自分自身からのみ（ループバック）\n' +
'  10.0.2.50:6379  そのIPのインターフェースからのみ\n\n' +
'Redisが `10.0.2.50:6379` でlistenしているのに、Railsが `127.0.0.1:6379` へ繋ぎに行けば、\n' +
'プロセスは生きていても接続は拒否されます（CASE 08）。\n' +
'**active (running) は「繋がる」を意味しません。**\n\n' +
'**UNIXソケット**\n' +
'同じサーバー内の通信では、ポートではなくファイルとして口を作ることがあります。\n' +
'  unix:///var/www/myapp/shared/tmp/sockets/puma.sock\n' +
'nginx→Puma がこの形なので、`ss -lntp` には出てきません。\n' +
'その場合は nginx の error.log で「何に繋がらなかったか」を見ます。\n\n' +
'**接続拒否とタイムアウトの違い**\n' +
'  Connection refused  誰もlistenしていない。即座に返る\n' +
'  Timeout             パケットが届いていない。経路やファイアウォールを疑う\n' +
'この2つは原因の場所がまったく違うので、必ず読み分けてください。',
  commands: ['ss -lntp', 'ss -lntp | grep 3000', 'lsof -i :3000', 'curl -I http://localhost/'],
  related: ['process', 'fd', 'dns'] },

{ id: 'dns', title: '名前解決と証明書', tags: ['DNS', 'dig', 'hosts', '証明書', 'TLS', 'openssl', '外部API'],
  summary: '外部連携が落ちたときに疑う2つ。名前が引けるか、証明書が生きているか。',
  body:
'外部のAPIやDBへ繋がらないとき、アプリのコードより先に確認することが2つあります。\n\n' +
'**1. 名前が引けるか（DNS）**\n' +
'ホスト名からIPアドレスを調べる仕組みです。ここが失敗すると、通信は始まりもしません。\n\n' +
'  dig api.example.com          名前を引く\n' +
'  dig +short api.example.com   結果だけ\n' +
'  cat /etc/hosts               ローカルの上書き設定。ここに残骸があることがある\n' +
'  cat /etc/resolv.conf         どのDNSサーバーに聞いているか\n\n' +
'名前が引けない場合のエラーは `SocketError: getaddrinfo` などになります。\n' +
'「接続できない」とは別物です。\n\n' +
'**2. 証明書が生きているか（TLS）**\n' +
'HTTPS通信は証明書で相手を確認します。有効期限が切れると、通信そのものが失敗します。\n' +
'そして証明書は**必ず期限切れします**。更新の自動化が止まっていると、ある日突然落ちます。\n\n' +
'  openssl s_client -connect api.example.com:443 -servername api.example.com\n' +
'  → notBefore / notAfter で有効期間を確認\n\n' +
'  curl -v https://api.example.com   … TLSのやり取りも表示される\n\n' +
'症状は `OpenSSL::SSL::SSLError: certificate has expired` のような形で出ます。\n' +
'自社の証明書が切れた場合は、ユーザーのブラウザにも警告が出るので影響が大きくなります。',
  commands: ['dig myapp.example.jp', 'cat /etc/hosts', 'curl -v https://localhost/'],
  related: ['port'] },

{ id: 'symlink', title: 'Capistrano の current / releases / shared', tags: ['Capistrano', 'current', 'releases', 'shared', 'デプロイ', 'ロールバック'],
  summary: '実体を新しく作り、最後にポインタを向け直す。切り替えが一瞬で、戻すのも一瞬。',
  body:
'Capistrano構成のディレクトリは、必ずこの3つです。\n\n' +
'  releases/   デプロイのたびに作られる実体。名前はデプロイ時刻\n' +
'  shared/     デプロイしても消えないもの（log / tmp / config）\n' +
'  current     「いまこれが本番」を指すシンボリックリンク\n\n' +
'デプロイの実体は「新しいreleaseを置いて、最後に current を張り替える」操作です。\n' +
'張り替えは一瞬で終わるので、切り替えの隙間がほとんどありません。\n' +
'失敗しても前のreleaseが残っているので、current を戻すだけでロールバックできます。\n\n' +
'shared は、releaseをまたいで残したいものを置く場所です。\n' +
'各releaseの `log` `tmp` `config/database.yml` は shared へのシンボリックリンクになっていて、\n' +
'releaseが入れ替わってもログも設定も引き継がれます。\n\n' +
'**この構成でよく起きる失敗**\n\n' +
'  ・実体はできているのに current が古いまま（デプロイが途中で失敗した → CASE 12）\n' +
'  ・current は新しいのに、動いているプロセスが古いコードを持ったまま（→ 再起動が要る）\n' +
'  ・ロールバック先が「1つ前」とは限らない（→ readlink で必ず確認 / CASE 13）\n\n' +
'同じ構造は他の場所にも出てきます。\n' +
'OpenSearchの再インデックスも「新しいインデックスを作って、aliasを張り替える」形で、\n' +
'同じように「張り替え忘れ」が起きます（CASE 26）。',
  commands: ['ls -la /var/www/myapp', 'readlink current', 'cat current/REVISION'],
  related: ['inode', 'process'] },

{ id: 'text', title: 'ログを絞り込む・数える', tags: ['grep', 'awk', 'sed', 'sort', 'uniq', 'wc', 'xargs', '集計'],
  summary: '小さい道具をパイプでつないで答えを作る。目で数えない。',
  body:
'本番のログは、目で追える量ではありません。\n' +
'「絞り込む → 取り出す → 並べる → 数える」を組み合わせて、事実に変換します。\n\n' +
'  grep    条件に合う**行**を取り出す\n' +
'  awk     行を**列**に分けて、特定の列を取り出す・計算する\n' +
'  sed     置換する・行範囲を切り出す\n' +
'  sort    並べ替える（-n 数値 / -h 単位付き / -r 逆順 / -k 列指定）\n' +
'  uniq -c 連続する同じ行をまとめて件数を付ける（**先に sort が要る**）\n' +
'  wc -l   行数を数える\n' +
'  xargs   前の出力を、次のコマンドの**引数**として渡す\n\n' +
'代表的な型です。\n\n' +
'  何が一番多いか\n' +
'    grep ERROR log | awk \'{print $NF}\' | sort | uniq -c | sort -rn | head\n\n' +
'  何件あるか\n' +
'    grep -c "Completed 500" log\n\n' +
'  前後の行も見たい\n' +
'    grep -n -A3 -B1 "ERROR" log\n\n' +
'  圧縮済みのログも一緒に\n' +
'    zgrep ERROR log/production.log.1.gz\n\n' +
'**パイプと xargs の違い**\n' +
'  `|` は次のコマンドの**標準入力**へ流します（grep や sort はこれを読む）\n' +
'  `xargs` は次のコマンドの**引数**に変換します（rm や ls は引数しか受け取らない）\n' +
'    find . -name "*.log" -mtime +30 | xargs rm\n\n' +
'「目で数えず、コマンドで数える」。これができるかどうかで調査の精度が変わります。',
  commands: ['grep -c "Completed 500" log/production.log',
             'grep ERROR log/production.log | sort | uniq -c | sort -rn | head'],
  related: ['stdio', 'logs'] },

{ id: 'ecs', title: 'ECS とコンテナ（Fargate・ECR）', tags: ['ECS', 'Fargate', 'タスク定義', 'ECR', 'タスクロール', 'stopTimeout'],
  summary: 'コンテナを決まった数だけ動かし続ける仕組み。サーバーに入らず、API で状態を聞く。',
  body:
'コンテナはアプリと、アプリを動かすのに要るもの（Ruby・gem・OS のライブラリ）をまとめた単位です。\n' +
'その中身の元になるのが**イメージ**で、ECR（Elastic Container Registry）に置きます。\n' +
'イメージにはタグ（名札）を付けて、どの版かを区別します。\n\n' +
'ECS（Elastic Container Service）は、イメージからコンテナを起動し、決まった数を保ちます。\n\n' +
'  タスク定義  設計図。イメージ・CPU とメモリ・コマンド・環境変数・ログの出し先\n' +
'              登録するたびにリビジョン（:1, :2 …）が増える。書き換えはできない\n' +
'  サービス    「このタスク定義のタスクを N 個動かす」。落ちたら入れ替え、ALB に登録する\n' +
'  タスク      動いているコンテナのまとまり。EC2 のときのプロセスに当たる\n\n' +
'EC2 と Capistrano のときとの対応はこうです。\n\n' +
'  EC2 のとき                      ECS on Fargate のとき\n' +
'  releases/ にコードを置く        ECR にイメージを push する\n' +
'  current のリンク先を変える      サービスのタスク定義を切り替える（update-service）\n' +
'  systemctl restart puma          新しいタスクを起動して、古いタスクを止める（ECS が行う）\n' +
'  ps aux で確かめる               aws ecs describe-services / list-tasks で確かめる\n\n' +
'**Fargate** はタスクを動かすサーバー（EC2）を自分で持たない方式です。\n' +
'OS の更新やディスクの管理がいらない代わりに、入って調べるサーバーがありません。\n' +
'「どこで何が動いているか」は、すべて AWS の API に聞きます。\n' +
'コンテナの中に入りたいときは、SSH ではなく ECS Exec を使います。\n\n' +
'**2つのロール**\n' +
'  タスクロール  コンテナの中のアプリが使う権限（ECS Exec のエージェントもこれを使う）\n' +
'  実行ロール    ECS がタスクを用意するのに使う権限（イメージを取る、ログを送る、secrets を読む）\n\n' +
'**タスクを止めるとき**\n' +
'ECS はコンテナに SIGTERM を送り、stopTimeout（既定30秒、最大120秒）待っても終わらなければ SIGKILL を送ります。\n' +
'systemd の TimeoutStopSec と同じ考え方です（→ シグナル）。',
  commands: ['aws ecs list-services --cluster jinzai-prod',
             "aws ecs describe-services --cluster jinzai-prod --services jinzai-prod-web --query 'services[0].taskDefinition'"],
  related: ['process', 'signal', 'cwlogs'] },

{ id: 'cwlogs', title: 'CloudWatch Logs', tags: ['CloudWatch Logs', 'ロググループ', 'ログストリーム', 'awslogs'],
  summary: 'コンテナのログの置き場所。ロググループ → ログストリーム（タスクごと）→ 1行ずつのイベント。',
  body:
'Fargate のタスクには、ログファイルを置いて後から読みに行く場所がありません。\n' +
'コンテナが標準出力に書いたものを、ECS の **awslogs** ドライバーが CloudWatch Logs へ送ります。\n' +
'どこへ送るかはタスク定義の logConfiguration に書いてあります。\n\n' +
'  ロググループ    置き場所。サービスごとに分ける（/ecs/jinzai-prod-web）\n' +
'  ログストリーム  書き手ごとの流れ。awslogs ではタスク1つにつき1本\n' +
'                  名前は「接頭辞/コンテナ名/タスクID」（web/web/87dfdd…）\n' +
'  ログイベント    1行ずつ。時刻が付く\n\n' +
'ストリームの名前にタスクIDが入るので、「どのタスクが書いたか」が分かります。\n' +
'1つのタスクだけの問題か、全体の問題かは、ストリームごとに数えて切り分けます。\n\n' +
'ログはロググループの保持期間を過ぎると消えます。何日分残るかはロググループごとに決めます。',
  commands: ['aws logs tail /ecs/jinzai-prod-web --since 30m',
             "aws logs describe-log-streams --log-group-name /ecs/jinzai-prod-web --query 'logStreams[].logStreamName'"],
  related: ['logs', 'text', 'ecs'] },

{ id: 'aurora', title: 'Aurora（クラスター・writer と reader・ACU）', tags: ['Aurora', 'writer', 'reader', 'ACU', 'フェイルオーバー', 'max_connections', '特定時点への復元'],
  summary: 'ストレージを共有するクラスターに、書き込み用の writer と読み取り専用の reader が並ぶ。つなぐ先はエンドポイントで選ぶ。',
  body:
'Aurora MySQL はデータを置くストレージをクラスターとして持ち、そこへインスタンスがつながる作りです。\n\n' +
'  writer  書き込みができるインスタンス。クラスターに1台\n' +
'  reader  読み取り専用のインスタンス。同じストレージを読む\n\n' +
'アプリはインスタンスではなくエンドポイント（DNS の名前）につなぎます。\n' +
'  クラスターのエンドポイント（cluster-）     writer を指す。書き込みはここへ\n' +
'  読み取り用のエンドポイント（cluster-ro-）  reader のどれか\n\n' +
'writer が止まると、reader の1台が新しい writer になり、クラスターのエンドポイントが指す先も変わります（フェイルオーバー）。\n' +
'古い writer は再起動して reader になります。切り替わる前につないだコネクションが残っていると、\n' +
'そのコネクションでの書き込みは --read-only で断られます。\n\n' +
'Serverless v2 のインスタンスは、最小 ACU と最大 ACU の間で容量を増減します（1 ACU はメモリ約 2 GiB）。\n' +
'max_connections は最大 ACU から決まり（4 なら 135、8 なら 1000）、インスタンスを再起動したときに変わります。\n\n' +
'バックアップの保持期間の間なら、特定時点への復元で、その時刻の状態の新しいクラスターを作れます。',
  commands: ["aws rds describe-db-clusters --db-cluster-identifier myapp-prod --query 'DBClusters[0].DBClusterMembers'",
             'aws rds describe-events --source-type db-cluster --source-identifier myapp-prod --duration 1440',
             'dig +short myapp-prod.cluster-cpcnosrxxxxx.ap-northeast-1.rds.amazonaws.com'],
  related: ['dns', 'port', 'process'] },

{ id: 'iam', title: 'IAM のロールとポリシー', tags: ['IAM', 'IAM ロール', 'インスタンスプロファイル', 'AccessDenied', 'simulate-principal-policy'],
  summary: '誰が（ロール・ユーザー）、何を（Action）、どれに対して（Resource）できるかを、ポリシーの JSON で決める。',
  body:
'AWS の API を呼ぶときは、必ず「誰として」呼んでいるかが決まっています。\n' +
'EC2 で動くアプリはインスタンスプロファイルに付いた IAM ロールの一時的な認証情報で呼びます（アクセスキーをサーバーに置かない）。\n\n' +
'ロールに付けたポリシーは、Effect（Allow / Deny）・Action（s3:PutObject など）・Resource（ARN）の組です。\n' +
'  許すポリシーが1つも無い      拒否（implicitDeny。「no identity-based policy allows」）\n' +
'  拒否するポリシーが1つでもある  拒否（explicitDeny。Allow より強い）\n\n' +
'S3 の AccessDenied のメッセージには、誰が・どの操作を・どのリソースに対してしようとしたかが書いてあります。\n' +
'simulate-principal-policy を使うと、実際に操作せずに、許されるかどうかを確かめられます。',
  commands: ['aws iam list-role-policies --role-name myapp-ec2-role',
             'aws iam get-role-policy --role-name myapp-ec2-role --policy-name myapp-s3-uploads'],
  related: ['user', 'env'] },

{ id: 'waf', title: 'AWS WAF（ウェブ ACL とルール）', tags: ['WAF', 'ウェブ ACL', 'レートベース'],
  summary: 'ALB や CloudFront の手前で、リクエストをルールの順に調べ、Allow / Block を決める。',
  body:
'ウェブ ACL はルールを優先度の小さい順に調べ、最初に当たったルールのアクションで決めます。\n' +
'どれにも当たらなければデフォルトアクションです。Block されたリクエストはアプリに届かないので、アプリのログに残りません。\n\n' +
'  IP セットのルール          決めた IP からのリクエストを通す・止める\n' +
'  レートベースのルール        同じ IP から決めた時間に決めた数を超えたら止める\n' +
'  マネージドルールグループ    AWS などが用意したルールの集まり（コアルールセットなど）\n\n' +
'どのルールが止めたかは、見本のリクエスト（get-sampled-requests）で分かります。',
  commands: ['aws wafv2 list-web-acls --scope REGIONAL'],
  related: ['port', 'logs'] },

{ id: 'alarm', title: 'CloudWatch のアラーム', tags: ['アラーム', 'TreatMissingData', 'describe-alarms', 'HealthyHostCount'],
  summary: 'メトリクスを区間ごとにまとめ、しきい値を超えた区間の数で OK / ALARM / INSUFFICIENT_DATA を決める。',
  body:
'アラームは Period（区間の長さ）ごとに Statistic（Sum・Average など）でメトリクスをまとめ、\n' +
'EvaluationPeriods の区間のうち DatapointsToAlarm の区間でしきい値を超えたら ALARM にします。\n' +
'状態が変わったときに、アクション（SNS への通知など）を実行します。\n\n' +
'データが無い区間の扱いは TreatMissingData で決めます。\n' +
'  missing（既定）  評価する区間がすべてデータ無しなら INSUFFICIENT_DATA\n' +
'  notBreaching    しきい値を超えていないとみなす\n' +
'  breaching       しきい値を超えているとみなす\n' +
'  ignore          今の状態を変えない\n\n' +
'「止まると値が出なくなる」メトリクスを notBreaching で見ると、止まったことに気づけません。',
  commands: ['aws cloudwatch describe-alarms --alarm-names myapp-alb-target-5xx'],
  related: ['logs', 'cwlogs'] },

{ id: 'redis', title: 'Redis のメモリと、消し方の決まり', tags: ['Redis', 'redis-cli', 'maxmemory', 'evicted_keys'],
  summary: 'メモリの上限（maxmemory）に達したときにどうするかを、maxmemory-policy で決める。',
  body:
'Redis はデータをメモリに置きます。maxmemory を超えそうになると、maxmemory-policy に従います。\n' +
'  noeviction    書き込みをエラーにする（キーは消さない）\n' +
'  allkeys-lru   すべてのキーから、最近使われていないものを消す\n' +
'  volatile-lru  有効期限の付いたキーから、最近使われていないものを消す\n\n' +
'キャッシュは消えてもかまいませんが、Sidekiq のキューや予約ジョブは消えては困ります。\n' +
'1つの Redis に同居させると、どちらかに合わない決まりになります。用途ごとに分けるのが基本です。',
  commands: ['redis-cli INFO memory', 'redis-cli INFO stats | grep evicted_keys'],
  related: ['memory', 'process'] }

];

/* CASEの文面から、出てくる用語を拾う */
function detect(scenario) {
  var hay = [
    scenario.description || '',
    (scenario.learn || []).map(function (l) { return l.name + ' ' + l.cmd + ' ' + l.desc; }).join(' '),
    (scenario.route && scenario.route.commands || []).join(' ')
  ].join(' ');
  return CONCEPTS.filter(function (c) {
    return c.tags.some(function (t) { return hay.indexOf(t) >= 0; });
  });
}

function render(list, canInsert) {
  var esc = window.LFR.esc, t2h = window.LFR.text2html;
  return list.map(function (c) {
    return '<section class="concept" id="concept-' + c.id + '">' +
      '<h3>' + esc(c.title) + '</h3>' +
      '<p class="concept-sum">' + esc(c.summary) + '</p>' +
      '<div class="prose">' + t2h(c.body) + '</div>' +
      (c.commands && c.commands.length
        ? '<div class="cmds">' + c.commands.map(function (x) {
            return canInsert ? '<button class="cmd" data-cmd="' + esc(x) + '">' + esc(x) + '</button>' : '<code class="example-cmd">' + esc(x) + '</code>';
          }).join('') + '</div>'
        : '') +
      '</section>';
  }).join('');
}

function mount(overlayEl, onInsert, focusId) {
  var esc = window.LFR.esc;
  var html = '<div class="sheet-head"><h2 id="reference-title">サーバー運用の用語集</h2>' +
    '<input id="concept-q" type="search" aria-label="用語を検索" placeholder="用語を検索　例：プロセス"></div>' +
    '<nav class="concept-nav">' + CONCEPTS.map(function (c) {
      return '<a href="#concept-' + c.id + '" data-jump="' + c.id + '">' + esc(c.title) + '</a>';
    }).join('') + '</nav>' +
    '<div class="sheet-body" id="concept-body">' + render(CONCEPTS, onInsert) + '</div>';
  overlayEl.innerHTML = html;

  overlayEl.querySelectorAll('.cmd').forEach(function (b) {
    b.addEventListener('click', function () { onInsert(b.dataset.cmd); });
  });
  overlayEl.querySelectorAll('[data-jump]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var el = overlayEl.querySelector('#concept-' + a.dataset.jump);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  var q = overlayEl.querySelector('#concept-q');
  q.addEventListener('input', function () {
    var v = q.value.trim().toLowerCase();
    var hit = !v ? CONCEPTS : CONCEPTS.filter(function (c) {
      return (c.title + ' ' + c.summary + ' ' + c.body + ' ' + c.tags.join(' ')).toLowerCase().indexOf(v) >= 0;
    });
    overlayEl.querySelector('#concept-body').innerHTML = render(hit, onInsert) || '<p role="status">一致する用語がありません。</p>';
    overlayEl.querySelectorAll('[data-jump]').forEach(function (a) {
      a.hidden = !hit.some(function (c) { return c.id === a.dataset.jump; });
    });
    overlayEl.querySelectorAll('#concept-body .cmd').forEach(function (b) {
      b.addEventListener('click', function () { onInsert(b.dataset.cmd); });
    });
  });

  if (focusId) {
    var el = overlayEl.querySelector('#concept-' + focusId);
    if (el) setTimeout(function () { el.scrollIntoView({ block: 'start' }); }, 30);
  }
}

window.LFR = window.LFR || {};
window.LFR.Concepts = { mount: mount, all: CONCEPTS, detect: detect };
})();
