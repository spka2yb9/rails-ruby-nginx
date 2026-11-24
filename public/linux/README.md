# 第6部 Railsエンジニアのためのサーバ運用

Rails本番環境の障害調査を、ブラウザの中の仮想Linuxで実習するページ。

初めて開くと、入門コースでアプリの場所を探す演習が始まります。手順に沿って端末を操作し、その下で回答すると解説が開きます。次回は最初の未回答の演習から始まり、全問に回答済みなら入門の最初から復習できます。別の演習は上部の「演習を選ぶ」から開けます。

`index.html` をブラウザで直接開くだけで動きます（サーバー不要・ネットワーク不要）。
ページ内のTerminalで実行されるコマンドは、すべてブラウザの中で処理されます。
実際のOSやサーバーへは一切送信されません。

## 構成

```
index.html
├── vendor/            ローカルに同梱したライブラリ
│   ├── lifo.min.js        Lifo 0.10.18（ブラウザ内Linux: VFS / shell / 60+コマンド）にパッチを当てたもの
│   ├── xterm.js           xterm.js（Terminal UI）
│   ├── xterm.css
│   └── xterm-addon-fit.js
│
├── css/   app.css / terminal.css / lesson.css
│
└── js/
    ├── app.js                        起動・演習選択・学習記録の表示
    ├── terminal/terminal-controller.js   xterm.js ↔ Runtime。Linux処理は書かない
    ├── linux/
    │   ├── lifo-adapter.js           Lifo固有APIに触れてよい唯一の場所
    │   ├── linux-runtime.js          LearningLinuxRuntime（UIから見える唯一の口）
    │   └── scenario-commands.js      systemctl / journalctl / ss / curl / ps ...
    ├── lessons/
    │   ├── lessons.js                カリキュラムの目次
    │   └── lesson-controller.js      CASE画面の組み立て
    ├── scenarios/
    │   ├── base.js                   共通のRails本番サーバー（Capistrano構成）
    │   ├── index.js                  CASEレジストリ（base + 差分のマージ）
    │   ├── case01.js … case17.js     CASEデータ
    │   └── final.js                  総合障害演習
    ├── ui/   util.js / hint.js / quiz.js / score.js / cheatsheet.js
    └── progress/progress-store.js    localStorage
```

## CASEを追加する

HTMLもJavaScriptロジックもコピーしません。やることは2つだけです。

1. `js/scenarios/caseNN.js` を書く（`base.js` からの差分だけ）
2. `index.html` に `<script src="js/scenarios/caseNN.js"></script>` を1行足す

`js/lessons/lessons.js` の目次に同じidが載っていれば、対応するテーマの演習選択欄に並びます。
データが無いidは「準備中」と表示されます。

CASEデータで指定できるもの:

| キー | 内容 |
|---|---|
| `files` | 仮想ファイルシステムへ書き込むファイル（baseへマージ）。中身を関数で書くと、CASE を開いたとき（`awsEnv` のあと）に呼んで中身を作る。ログの時刻をシミュレーターの時刻にそろえるときに使う |
| `symlinks` | Capistranoのsymbolic link（`current -> releases/…`） |
| `fsMeta` | `ls -l` に出す所有者・group・permission |
| `processes` | `ps` / `pgrep` / `top` が返すプロセス一覧 |
| `services` | `systemctl status` が返すsystemdサービスの状態 |
| `journal` | `journalctl -u <name>` が返すログ |
| `ports` | `ss` が返すソケット（`-l` で LISTEN だけ、`-a` ですべて、どちらも無ければ接続中だけ） |
| `system` | `free` / `uptime` / `top` が返すCPU・メモリ・load |
| `disk` | `df` / `du` が返す容量（未指定ならLifoの実サイズ） |
| `envVars` | 環境変数（`env` / `printenv` / `echo $X`） |
| `http` | `curl` が返すHTTP応答 |
| `liveLog` | `tail -f` で流れてくる行 |
| `hints` | 3段階のヒント |
| `guide` | 入門演習の手順。それぞれに見出し、試す理由、コマンド、出力の読み方を書く |
| `firstLook` | 最初に試す操作と説明。省略すると `learn` の先頭を表示する |
| `probes` | このCASE固有の調査イベント判定 |
| `evidence` | Investigation Scoreで数える証拠と重み |
| `question` | 4択・正解・解説・選択肢ごとの「なぜ違うか」 |
| `route` | 推奨調査ルートと対応コマンド |
| `envUnset` | 「このCASEでは設定されていない」ことにする環境変数 |
| `clock` | `'now'` にすると、journal の時刻を演習を開いたときの日本時間に合わせる |
| （getter） | `journal: { get sidekiq() { ... } }` や `get openFiles() { ... }` のように getter で書くと、CASE を開いたときに値を作る（時刻を今から決めるとき） |
| `local` / `server` | 手元のPCから始まり `aws ssm start-session` でサーバーへ移るCASE |
| `aws` / `ssh` | `aws sts` / `ec2` / `ssm` の応答、`ssh` が失敗する理由 |
| `alert` | 「依頼内容と監視通知」で開ける監視通知（Honeybadger等） |
| `maintenance` | メンテナンスファイルのパスと、運用側だけが通れるバイパスヘッダ |
| （`logrotate` は設定ファイルを実際に読みます） | `/etc/logrotate.d/*` の内容からパターンを展開するので、`vi` で直すと挙動が変わります |
| `crontab` / `timers` | `crontab -l` / `systemctl list-timers` の内容 |
| `awsEnv` | AWS のCASEだけ。`function (sim) { return sim.railsOnEcs(...) }`（EC2 と Aurora なら `sim.railsOnEc2(...)`）の形で、`aws` に応答するシミュレーターの環境を返す（後述） |
| `rails` | `console` の式と応答の対応表、`migrations` の一覧 |
| `db` | `mysql -e "<SQL>"` に対する応答（`queries`）。AWS のCASEでは `host`（`-h` を省いたときの接続先）、`securityGroup`（DB に付いていればこのサーバーから届くグループ）、`dump`（`mysqldump`）、`import`（`mysql < file`）、`connections`（`ss` に出す DB へのコネクション）も書ける |
| `dns` | `dig` が返す名前と IP。`{ cname: '別名の先' }` と書くと CNAME をたどる |
| `redis` | `redis-cli` が答える値（`info` の節ごとの値、`config`、`dbsize`、キーごとの件数 `sizes`）。`CONFIG SET` で書き換わる |
| `needrestart` / `kernel` | `needrestart -b` が答えるカーネルのバージョン（`kcur` / `kexp` / `ksta`）と、起動し直す必要があるサービス。`uname -r` が返すカーネルのバージョン |
| `services[x].environmentFile` | systemd がそのサービスを起動するときに読むファイル。`systemctl restart` のたびに読み直し、そのサービスのプロセスの `/proc/<PID>/environ` に反映する |

### 状態を変えるCASEの書き方

`services[x].recovery` を宣言したサービスだけ、`systemctl start/stop/restart` が
実際に効きます（宣言しないCASEでは従来どおり権限エラーで失敗します）。

```js
services: {
  puma: {
    status: 'failed',
    recovery: {
      // 復旧を妨げている条件。null を返すまで restart は失敗し続ける
      blockedBy: function (state) { return diskFull(state) ? 'Errno::ENOSPC: ...' : null; },
      onUp:   function (state) { /* processes / http などを起動後の状態にする */ },
      onDown: function (state) { /* 停止後の状態にする */ }
    }
  }
}
```

`disk.filesystems` に `totalKB` / `usedKB` を書くと、`truncate` や `logrotate` で
空いた分が `df -h` の表示へ自動で反映されます。
`inodes` / `inodesUsed` を書けば `df -i` に出ます。

`openFiles` を宣言したファイルは「開かれたまま」の扱いになり、
`rm` しても容量が戻りません（`lsof +L1` に `(deleted)` として出て、
掴んでいたプロセスが終了したときに解放されます）。

CASE定義は使い回されるため、実行中に書き換わる部分は `build()` が毎回複製します。
「このCASEをやり直す」で必ず初期状態に戻ります（関数は状態を持たないので参照のまま）。

`fsMeta` は `{ mode, owner, group, size, denyRead }` を受け取ります。
`size` は `ls -lh` に出す見かけのサイズ（28GBのログをVFSに本当に置かないため）、
`denyRead` は `cat` などで Permission denied を返させるフラグです。

## カリキュラム（全53CASE）

| LEVEL | CASE |
|---|---|
| 0 本番環境へ入る | 00 SSM Session Manager / 00B 監視の通知から降りる |
| 1 サーバーの中を移動する | 01 アプリの場所 / 02 設定ファイル / 03 ログからエラーを探す |
| 2 Railsの障害を調査する | 04 500エラー / 05 tail -f / 06 Puma / 07 Sidekiq / 08 Redis |
| 3 サーバー自体を調査する | 09 高負荷（swap） / 10 ディスク満杯 / 11 ポート競合 |
| 4 デプロイを調査する | 12 反映確認 / 13 current / 14 古いPuma / 15 起動失敗 |
| 5 権限・環境設定 | 16 Permission denied / 17 環境変数 |
| 6 総合障害演習 | FINAL 502 → Puma → ENOSPC → df → du |
| 7 復旧する | 18 安全な再起動 / 19 ディスクを空けて復旧 / 20 メンテ→ロールバック / 21 phased restart / 27 viで設定を直す |
| 8 Railsを運用する | 22 console --sandbox / 23 ゼロダウンタイムmigration / 24 スロークエリ |
| 9 定期実行と検索基盤 | 25 cron / systemd timer / 26 OpenSearchのalias |
| 10 ログとファイルを掘る | 28 awkでアクセスログ集計 / 29 inode枯渇 |
| 11 プロセスとネットワークを深く見る | 30 Too many open files / 31 DNSと証明書 / 32 tmuxとHUP |
| 12 AWS上の構成を調べる | 33 ECS で動いているイメージをたどる / 34 CloudWatch Logs で通知のリクエストを追う |
| 13 コンテナのデプロイと障害対応 | 35 起動しては止まるタスク（ロールバック） / 36 /up のヘルスチェックが 301 / 37 run-task でマイグレーション / 38 ECS Exec で rails console / 39 Sidekiq の timeout と stopTimeout |
| 14 Aurora を運用する | 40 Too many connections（最大 ACU と max_connections） / 41 特定時点への復元で消えた行を戻す / 42 フェイルオーバーのあとの --read-only |
| 15 権限・秘密情報・変更の記録 | 43 S3 の AccessDenied（EC2 のロールのポリシー） / 44 Parameter Store と EnvironmentFile / 45 CloudTrail で誰がセキュリティグループを変えたか |
| 16 エッジ・バッチ・監視 | 46 WAF のレートベースルールと SizeRestrictions_BODY / 47 AWS Batch のジョブのメモリ不足 / 48 欠損データで鳴らなかったアラーム |
| 17 EC2 サーバーを保守する | 49 Redis の maxmemory-policy で消えた予約ジョブ / 50 セキュリティ更新のあとの needrestart |

LEVEL 0〜6 は「調べる」、LEVEL 7 以降は **実際に状態を変える** CASEです。
`systemctl restart` / `truncate` / `logrotate` / `ln -sfn` / `pumactl phased-restart` /
`rails db:migrate` は本当に仮想環境の状態を書き換え、`curl` や `df` の結果が変わります。

## 今回使うLinux知識（深掘り）

各CASEの `learn` 項目には、`js/ui/commands.js` の解説が折りたたみで差し込まれます。
**69コマンド分を1回だけ書いて、53CASE・285項目すべてから参照**しています
（同じコマンドが何度も出てくるので、CASEごとに書くと薄く重複するため）。

各項目の構成は4段です。

| 見出し | 内容 |
|---|---|
| 仕組み | なぜそう動くのか（tailが巨大ファイルでも速い理由、freeのavailableの意味 …） |
| 覚えておくオプション | 実務で使うものだけ。表形式 |
| 落とし穴 | 知らないと一度は踏む（`tail -f` はローテートで追えなくなる、`ulimit -n` はシェルの値 …） |
| 現場での使い方 | 判断と使い分け |

learn項目とコマンドの紐付けは `CommandRef.find()` が自動で行います
（`cmd` の先頭語 → `name` の語 → 「パイプ」「Ctrl+C」などの話題名）。
**CASEを追加しても紐付け作業は不要**で、現在285/285項目に解説が付いています。
`aws` は2語目（`ecs` / `ecr` / `elbv2` / `logs` / `iam` / `rds` / `cloudtrail` / `wafv2` / `batch` / `cloudwatch`）で別の項目に分けています（無ければ Session Manager の `aws` の項）。`aws ssm` の Parameter Store の操作と、`aws ec2` のセキュリティグループの操作は、それぞれ専用の項に分けています。

## 基礎（用語）

コマンドの手前にある考え方を `js/ui/concepts.js` に19項目置いています。
トップバーの「基礎（用語）」から全部読めます。

> プロセス / シグナル / ファイルディスクリプタ / 標準入出力とリダイレクト /
> ファイルとinode / permissionと所有者 / ユーザーとsudo / 環境変数 /
> シェルとセッション / systemdとunit / ログの置き場所 / メモリとswap /
> load averageとCPU / ポートとソケット / 名前解決と証明書 /
> Capistranoのcurrent / ログを絞り込む・数える

`concepts.js` が「その手前の考え方」（プロセスとは何か、シグナルとは何か）、
`commands.js` が「その道具の仕組みと落とし穴」を担当します。

CASE画面の左ペインには「このCASEに出てくる用語」が自動で並びます。
CASEの本文と `learn` のテキストを走査してタグ照合しているだけなので、
**CASEを追加しても用語の紐付けは不要**です。

## エディタとページャ

`vi` と `less` は自作していません。Lifoが配布している
[`lifo-pkg-vi`](https://www.npmjs.com/package/lifo-pkg-vi) と
[`lifo-pkg-less`](https://www.npmjs.com/package/lifo-pkg-less) を
`vendor/lifo.min.js` に同梱して使っています（合計 +17KB / gzip +4KB）。

どちらもLifoの `Command` として作られていて、必要なのは次の3つだけです。

| 必要なもの | 実装場所 |
|---|---|
| キーを1つずつ渡す `stdin.read()` | `LearningLinuxRuntime.openInput()` |
| 画面サイズ `env.LINES / COLUMNS` | `TerminalController` が xterm の実サイズを `setViewport()` で渡す |
| `setRawMode` 中のキー転送 | `TerminalController._onData()` が `runtime.pushInput()` へ流す |

`vi` はモード・`hjkl`・`dd`・`u`・`/検索`・`:w` `:q` `:wq` `:q!`・`E37` 警告まで本物です。
編集結果はLifoのVFSへ実際に書き込まれるので、`cat` や `logrotate` の挙動がその場で変わります。

`less` は画面に収まる短いファイルならそのまま出力して終了します（`less -F` 相当）。
パイプ経由（`cat x | less`）では対話できないため `cat` 相当にフォールバックします。

## Terminalの操作

| 操作 | 挙動 |
|---|---|
| `Tab` | 補完。行頭（および `\|` `;` `&&` の直後）はコマンド名、それ以外はパス。候補が1つなら確定、複数なら共通部分まで伸ばし、それ以上伸びなければ候補を一覧表示します。 |
| `Ctrl+C`（選択あり） | 選択範囲をクリップボードへコピー。コマンドは中断しません。 |
| `Ctrl+C`（選択なし） | SIGINT。`tail -f` などを止めます。 |
| `Ctrl+V` / `Cmd+V` / `Ctrl+Shift+V` / 右クリック貼り付け | 貼り付け。改行を含む場合は1行ずつ実行し、最後の行は実行せずプロンプトに残します。 |
| `↑` `↓` | コマンド履歴 |
| `←` `→` `Ctrl+A` `Ctrl+E` | カーソル移動 |
| `Ctrl+U` `Ctrl+K` `Ctrl+W` | 行頭まで / 行末まで / 直前の単語を削除（bashと同じ） |
| `Ctrl+L` | 画面クリア |

全画面コマンド（`vi` / `less`）の実行中は、キー入力がそのままコマンドへ渡ります。
`vi` は `Esc` → `:wq`（保存して終了）/ `:q!`（破棄して終了）、`less` は `q` で戻ります。

補完の候補計算は `LearningLinuxRuntime.complete()`、描画は `TerminalController` の担当です。
コマンド名は Lifo の CommandRegistry から、パスは VFS から取得します（どちらも `LifoAdapter` 経由）。

貼り付けは `attachCustomKeyEventHandler` で `Ctrl+V` を **xterm.jsに処理させない**ことで成立しています。
xterm.js は `Ctrl+V` を制御文字 `\x16` に変換したうえで `preventDefault()` するため、
そのままではブラウザ本来の `paste` イベントが発生しません。
ハンドラが `false` を返すと xterm.js は keydown 処理ごと抜けるので、
textarea へ通常どおり `paste` が届き、その中身が `onData` に複数文字でまとめて流れてきます。

## aws-learning から取り込んだシェルの修正

仮想Linuxは、aws-learning（`src/cli/shell/`、`scripts/patch-lifo.mjs`、`src/cli/terminal/TerminalController.ts`）の修正を取り込んでいます。
CASEのコマンド（`scenario-commands.js`）、vi / less、補完、Investigation の判定はこれまでのままです。

| 取り込んだもの | 置き場所 | 変わること |
|---|---|---|
| Lifo 0.10.17 → 0.10.18 と、同梱コードへの8つのパッチ | `vendor/lifo.min.js`（`../../scripts/patch-lifo.mjs`） | `$(seq 1 3)` や `$x` の単語分割、`"$@"`、エイリアスの出力、`echo *` が隠しファイルを含まない、`./*` の `./` が残る、拡張子の無いファイルをテキストとして読む、`(for …); done)` で固まらない |
| vi の検索の修正（linux-learning の同じ系統のパッチ） | 同上 | `/` と `n` がカーソルのある行も探す |
| シェルの解釈の修正 | `lifo-adapter.js` の `patchInterpreter()` | for / if / while / `{ }` の中の出力が出る、`done > file` のリダイレクトが効く、`for x; do` が `"$@"` を回る |
| 実行のたびに AbortController を差し替える | `lifo-adapter.js` の `run()` / `cancel()` | `Ctrl+C` で `sleep` や for ループも止まる |
| 実ネットワークに出るコマンドと、教材に関係ないコマンドを外す | `lifo-adapter.js` の `REMOVE` | `wget` / `ping` / `node` などは command not found（`curl` / `dig` / `systemctl` / `top` は教材用の実装を入れ直す） |
| Lifo のエラーの書き方を bash にそろえる | `lifo-adapter.js` の `tidy()` | `cat: x: No such file or directory` |
| 閉じていない引用符・ヒアドキュメントの案内 | `linux-runtime.js` の `syntaxError()` | 1行で書き切れていないことを知らせる（`<<<` のヒアストリングは対象外） |
| 全角文字の幅・C1 制御文字・CASE切り替え時の出力 | `terminal-controller.js` | 日本語を入力しても ←→ でカーソルがずれない、CASEを切り替えたあとに前のCASEの出力が出ない |

Lifo の `grep` は `-A` / `-B` / `-C`（一致した行の前後も出す）を受け付けないので、`scenario-commands.js` の `grepContext()` が出します（まとまりの間には本物と同じく `--` を挟む）。`uname` も Lifo 自身の名前を返すので、教材のサーバー（Ubuntu 22.04、カーネル 5.15.0）の値にしています。

Lifo の `date` は `-u` / `-d` / `+書式` を受け付けず、ブラウザの日時の文字列を返すので、`scenario-commands.js` で GNU date のよく使う形（`date -u -d '2026-11-21 10:42 +0900' +%Y-%m-%dT%H:%M:%SZ` など）を再現しています。タイムゾーンは `-u` か `TZ=UTC` なら UTC、それ以外は日本時間です。

## AWS CLI のシミュレーター（LEVEL 12〜）

AWS のCASEでは、`aws` コマンドに aws-learning のシミュレーター（`vendor/aws-sim.min.js`、グローバル名 `AwsSim`）が応答します。
応答は実物の AWS CLI v2 と同じ形の JSON で、`--query`（JMESPath）・`--output table / text / yaml`・エラーの書き方・Tab 補完も aws-learning のものです。
`update-service` のような変更系の操作もシミュレーターの中の状態を実際に書き換えます。

| 置き場所 | 中身 |
|---|---|
| `../../tools/aws-sim/entry.ts` | 入口。`load(env)` / `run(args, io)` / `complete(words, current)` / `tick()` と、CASE が使う関数を出す。`describe-task-definition` の出力に、シミュレーターが持たない `command` / `logConfiguration` / `secrets` / `stopTimeout` を足す |
| `../../tools/aws-sim/rails.ts` | CASE の構成。`railsOnEcs(opts)` が ALB → ECS on Fargate（web / worker）、ECR、RDS for MySQL、CloudWatch Logs を作る。`serviceTaskIds(env, service)` と `putLogs(env, group, stream, events)` でログを足す |
| `../../tools/aws-sim/aurora.ts` | Aurora MySQL（Serverless v2）のクラスター。`railsOnEc2(opts)` が EC2 の本番サーバーと Aurora のクラスター myapp-prod（writer と reader）を作る。`aws rds` のクラスターの操作を足す（下記） |
| `../../tools/aws-sim/server.ts` | LEVEL 15〜17 の操作（EC2 の上での STS、Parameter Store、Batch、CloudWatch のアラーム）と、CASE が環境を作る関数（下記） |
| `js/linux/scenario-commands.js` の `runSimAws()` | `awsEnv` を持つCASEの `aws` をシミュレーターへ渡す。aws-learning は `~/.aws` を `/home/learner` に置く前提なので、手元のPCのホームへ読み替える。本番サーバーの上では、インスタンスプロファイルの認証情報があることにする |
| `js/linux/linux-runtime.js` | CASE を開くたび（やり直すたび）に `awsEnv` から環境を作り直す。`aws` の後ろの Tab 補完をシミュレーターに聞く |

`awsEnv` を持たない case00 の `aws`（`sts` / `ec2` / `ssm`）は、これまでどおり `scenario-commands.js` の固定の応答です。

### Rails のふるまいと、足したオペレーション（LEVEL 13〜）

シミュレーターのタスクは「ポートとヘルスチェックのパスを持つ簡単なアプリ」なので、Rails / Puma / Sidekiq らしいふるまいは
タスク定義のコンテナに `extra.behavior`（`tools/aws-sim/rails.ts` の `Behavior`）として、ただのデータで書きます。
`tools/aws-sim/hooks.ts` がシミュレーターの時計に合わせて読み、次のことを起こします。

| ふるまい | 起きること |
|---|---|
| `bootLogs` | タスクが RUNNING になったら、起動ログを書く（Puma は第23章の実測、Sidekiq は sidekiq のソースの文言） |
| `exit` | 起動して少しで、終了コード付きで終わる（`EssentialContainerExited`）。ECS は間をあけて次のタスクを起動する |
| `healthCode` | ALB のヘルスチェックにこのステータスコードを返す。基準に合わなければ、猶予期間 + 30秒 × 2回のあとに ECS が止めて入れ替える |
| `shutdown` | SIGTERM を受けてから終わるまでの秒数とログ。`stopTimeout`（既定30秒）を超えると SIGKILL（終了コード 137）で、最後のログは書かれない |
| `commands` | `run-task` で command を差し替えたときの結果。`requiresSecurityGroup` のセキュリティグループが無いと DB に届かない |

`aws ecs` には `run-task` / `wait tasks-stopped` / `execute-command` と `update-service --enable-execute-command` を足し、
`describe-tasks` / `describe-services` には終了コード・`enableExecuteCommand`・`managedAgents`・`overrides`・`stoppingAt` を足しています（`tools/aws-sim/ecs-ops.ts`）。
`execute-command` で `bin/rails console` を開くと、CASE の `rails.console` の表で答える REPL に入ります（プロンプトは Rails 8 の `jinzai(prod):001>`）。

CASE が使う、過去の出来事を作る関数は次のとおりです。

| 関数 | 中身 |
|---|---|
| `railsOnEcs({ web, worker, workerTag, ... })` | 構成を作る。`web` / `worker` に、はじめから動いているタスク定義のふるまいを渡せる |
| `deploy(env, 'web', patch, at)` | 今のタスク定義から新しいリビジョンを登録し、`at` の時刻にサービスを更新する（`tag` / `removeSecrets` / `stopTimeout` / `behavior`） |
| `registerRevision(env, 'web', patch, at)` | リビジョンを登録するだけ（サービスは更新しない） |
| `runOneOff(env, { taskDefinition, command, securityGroups, at })` | `at` の時刻に run-task したことにする |
| `advanceTo(env, from)` | `from` から今まで2秒ずつ時間を進め、途中のタスクの起動・停止とふるまいを起こす |
| `serviceTaskIds` / `putLogs` | 動いているタスクの ID を得る / ログストリームへ書く |

aws-learning のファイルは書き換えず、`tools/aws-sim/vite.config.ts` のプラグインがビルドのときだけ次の6か所を差し替えます
（パターンが見つからなければビルドが止まります）。

| 場所 | 差し替え |
|---|---|
| `sim/containers.ts` | タスクの状態を進めるたびに `hooks.ts` を呼ぶ |
| `sim/containers.ts` | 新しいデプロイ（前のリビジョンに戻す、`--force-new-deployment` を含む）で、動いているタスクを入れ替える。シミュレーターは「タスク定義が同じなら新しいデプロイのタスク」とみなすため、そのままでは入れ替わらない |
| `sim/elb.ts` | RUNNING になったばかりのタスクは、最初のヘルスチェック（30秒）が終わるまで `initial`。これが無いと、新しいタスクが起動した瞬間に古いタスクが止められる |
| `sim/elb.ts` | ヘルスチェックのステータスコードを `healthCode` から決める |
| `sim/batch.ts` | ジョブのコンテナのふるまい（何を書き、どの終了コードで終わるか）を、ジョブ定義ごとに CASE が決める（`server.ts` の `batchJob`） |
| `sim/vpc.ts` | 止まったタスクの IP も使用中に数える。aws-learning の不具合の回避（止まったタスクの IP が新しいタスクに渡り、ターゲットの登録と解除が同じ時刻の中で交互に起き続けて、時間が進まなくなる） |

作り直すときは、教科書のリポジトリの直下で次を実行します（aws-learning で `npm ci` 済みであること）。

```bash
AWS_LEARNING_DIR=<aws-learning のディレクトリ> npx vite build --config tools/aws-sim/vite.config.ts
```

`AWS_LEARNING_DIR` を省くと、教科書のリポジトリと同じ階層の `../../aws-learning` を使います。
aws-learning のソースは書き換えずに読み込み、React を持ち込まないよう zustand だけを React のフックを含まない `zustand/vanilla` に差し替えています。
型の確認は aws-learning の TypeScript で行います（`tools/aws-sim` は教科書の `tsc -b` の対象外）。

### Aurora（LEVEL 14〜）

aws-learning のシミュレーターは RDS の DB インスタンスしか持たないので、Aurora のクラスターとそのメンバーを
`tools/aws-sim/aurora.ts` が環境の `railsAurora` に、ただのデータで持ちます。状態（creating / available / rebooting / deleting）は時刻から決めます。

| オペレーション | 中身 |
|---|---|
| `describe-db-clusters` / `modify-db-cluster` | エンドポイント、writer と reader、容量の範囲（`--serverless-v2-scaling-configuration`）、復元できる時刻。セキュリティグループと削除保護も変えられる |
| `reboot-db-instance` | 再起動する。max_connections は、このとき最大 ACU から決まり直す（4 → 135、8 → 1000、16 → 2000 …） |
| `restore-db-cluster-to-point-in-time` | 指定した時刻の状態の新しいクラスターを作る（インスタンスは無い）。セキュリティグループを省くと VPC の default が付く |
| `create-db-instance --db-cluster-identifier` / `delete-db-instance` / `delete-db-cluster` | インスタンスを足す・消す。インスタンスが残っているクラスターは消せない |
| `describe-events` | CASE が足したイベント（フェイルオーバーなど）。既定は過去60分 |
| `wait db-cluster-available` / `wait db-instance-available` | 実際の時間で待つ（クラスターは12秒、インスタンスは25秒、再起動は8秒） |

`mysql` と `mysqldump` は、`-h` のホスト名からシミュレーターでつながる先のインスタンスを決め、CASE の `db.queries` / `db.dump` / `db.import` に渡します
（クラスターのエンドポイントは writer、`cluster-ro-` は reader、インスタンスのエンドポイントはそのインスタンス）。
つながらないとき（再起動中、名前が無い、DB のセキュリティグループに `db.securityGroup` が無い）は、mysql クライアントと同じ ERROR 2003 / 2005 を返します。
公式ドキュメントに文言が無いエラーは「(シミュレーター)」を付けて日本語で返します。

### LEVEL 15〜17 で足したもの

`tools/aws-sim/server.ts` が、次の操作と、CASE が環境を作るための関数を足します。

| 足したもの | 中身 |
|---|---|
| `sts get-caller-identity` | 本番サーバーの上で打つと、インスタンスプロファイルのロール（`assumed-role/myapp-ec2-role/<インスタンス ID>`）として答える |
| Parameter Store（`aws ssm`） | `get-parameter` / `get-parameters` / `get-parameters-by-path` / `get-parameter-history` / `put-parameter`。SecureString は `--with-decryption` のときだけ復号する |
| `aws batch` | `describe-jobs` に `container.reason`（メモリ不足など）を足し、`submit-job --container-overrides` でメモリを変えられる |
| `aws cloudwatch` | CASE が作ったアラームとメトリクス（ALB）で `describe-alarms` / `get-metric-statistics` / `put-metric-alarm` に答え、`describe-alarm-history` を足す |

| 関数 | 中身 |
|---|---|
| `ec2Role(env, { ポリシー名: ポリシー })` | EC2 のロール（myapp-ec2-role、インスタンスプロファイル付き）とインラインポリシー |
| `bucket(env, 名前)` / `logGroup(env, 名前)` | S3 のバケット / CloudWatch Logs のロググループ |
| `changeSecurityGroup(env, { groupName, at, user, sourceIp, ingress })` | `at` の時刻に IAM ユーザーがコンソールでルールを書き換えた（CloudTrail に Revoke と Authorize が残る） |
| `webAcl(env, { name, ipSets, rules, samples })` | ウェブ ACL（REGIONAL）と IP セット、見本のリクエスト |
| `parameters(env, [...])` | パラメータと、その変更の履歴 |
| `batchSetup(env, {...})` / `pastJob(env, {...})` | ジョブキュー・ジョブ定義・毎晩動かすルールと、過去に動いたジョブ（ログ付き） |
| `monitoring(env, { series, alarms })` | 1分ごとのメトリクスと、アラーム（履歴付き） |

## vendor/lifo.min.js の作り直し

`file://` で直接開けるよう、ESMの `@lifo-sh/core` をIIFEへバンドルして同梱しています。
バージョンを上げるときはこの手順で作り直します。パッチを当てるのは `scripts/patch-lifo.mjs`（教科書のリポジトリの直下）です。
パターンが見つからないとそこで止まるので、Lifo を上げたときはパッチが当たるかを先に確かめます。

```bash
mkdir -p /tmp/lifo-build && cd /tmp/lifo-build
npm init -y && npm pkg set type=module
npm i @lifo-sh/core@0.10.18 lifo-pkg-vi@0.1.4 lifo-pkg-less@0.1.4 esbuild --legacy-peer-deps
node <教科書のリポジトリ>/scripts/patch-lifo.mjs .
npm i -D @xterm/xterm@5.5.0 @xterm/addon-fit@0.10.0 --legacy-peer-deps   # xterm.js を作り直すときだけ

cat > entry.js <<'EOF'
export { Sandbox } from "@lifo-sh/core";
export { default as viCommand } from "lifo-pkg-vi";
export { default as lessCommand } from "lifo-pkg-less";
EOF
echo 'export default class WS {}; export class WebSocketServer {}' > stub-ws.js
echo 'export class Terminal { constructor(){ throw new Error("unused"); } }' > stub-ui.js

npx esbuild entry.js --bundle --minify --format=iife --global-name=Lifo \
  --platform=browser --target=es2020 --outfile=lifo.min.js \
  --alias:ws=./stub-ws.js --alias:@lifo-sh/ui=./stub-ui.js
```

- `ws` はNode専用なのでスタブに差し替えます（ブラウザでは使われません）。
- `@lifo-sh/ui` は `Sandbox.create({ terminal: <HTMLElement> })` のときだけ動的importされます。
  このページは自前の `TerminalController` を渡すので不要です。

xterm.js は `node_modules/@xterm/xterm/lib/xterm.js` と `css/xterm.css`、
fitアドオンは `node_modules/@xterm/addon-fit/lib/addon-fit.js` をそのままコピーしています。

## 既知の制約

| 制約 | 理由と代替 |
|---|---|
| symbolic linkはVFSに存在しない | Lifoの制約。`symlinks` に宣言したパスは実体をコピーして作り、`ls -l` の表示と `readlink` で本物に見せています。読み取り専用の調査には影響ありません。 |
| `chmod` / `chown` が `ls -l` に反映されない | Lifoの制約。permissionの表示は `fsMeta` で宣言します（CASE 16はこれを使います）。 |
| `top` が更新され続けない | 1回分のスナップショットを表示します。 |
| `curl` は実ネットワークへ出ない | 教材の方針。`http` に定義したURLだけが応答し、それ以外は Connection refused になります。 |
| `/proc` が読み取り専用の仮想FS | Lifoの制約。`/proc/<PID>/{limits,status,environ,cmdline}` は `LearningLinuxRuntime.procFiles()` が `state.processes` から合成し、`cat` / `ls` / `grep` の読み出し時に差し込みます。 |
| `awk` が条件式・END blockを解釈しない | Lifoの制約。列の取り出し（`{print $1}` / `-F`）までは動きます。条件式を書くと `[学習環境]` の断りを出して、黙って空を返さないようにしています。 |
| `.gz` は本物のgzipではない | `logrotate` は中身をそのまま `.gz` へ書き、`zgrep` / `zcat` がテキストとして読みます。 |
| Lifo がバイナリと判定した拡張子のファイル | 拡張子の無いファイル（`Gemfile` / `REVISION`）と知らない拡張子は、`scripts/patch-lifo.mjs` でテキストとして読むよう直しました。Lifo がバイナリと判定する拡張子のファイルを `grep` / `head` / `tail` / `wc` で読んだときに備えて、`scenario-commands.js` の `runTextSafe()` を残しています。中身がテキストなら stdin 経由で Lifo 本来の実装へ渡し直します。ファイル指定が1つのときのみ対応。 |
| `du -sh` の連結短縮形 / `sort -h` の単位比較 | Lifoの制約。`du` は委譲前に `-s -h` へ展開し、`sort -h` は `-h` のときだけ自前で数値比較しています。 |
| `tail -f` の中断 | `RunOptions.signal` がコマンドへ伝わらないため、教材の `tail -f` / `journalctl -f` は `LearningLinuxRuntime.cancel()` が持つフラグで止めます。Lifo のコマンドは `LifoAdapter.cancel()` が止めます。 |
| `read` が無い（`while read` が使えない） | Lifoの制約。`read: command not found` になります。教材のCASEでは使っていません。 |
