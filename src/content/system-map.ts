type Stop = { id: string; label: string; chapter: number; section?: string }

export const stops = [
  { id: 'browser', label: 'ブラウザー', chapter: 94, section: 'client-server' },
  { id: 'dns', label: 'DNS', chapter: 105 },
  { id: 'transport', label: 'TCP', chapter: 104 },
  { id: 'tls', label: 'TLS', chapter: 105 },
  { id: 'lb', label: 'ロードバランサー', chapter: 25 },
  { id: 'nginx', label: 'Nginx', chapter: 24, section: 'reverse-proxy' },
  { id: 'puma', label: 'Puma', chapter: 23, section: 'cluster' },
  { id: 'linux', label: 'Linux（プロセス・FD）', chapter: 103, section: 'process' },
  { id: 'container', label: 'コンテナ・AWS', chapter: 107, section: 'isolation' },
  { id: 'boot', label: 'Railties', chapter: 7, section: 'boot-overview' },
  { id: 'loader', label: 'Zeitwerk', chapter: 8, section: 'boot-load' },
  { id: 'rack', label: 'Rack', chapter: 6, section: 'middleware' },
  { id: 'router', label: 'Router', chapter: 9, section: 'recognize' },
  { id: 'controller', label: 'Controller', chapter: 10, section: 'dispatch' },
  { id: 'view', label: 'Action View', chapter: 16, section: 'flow' },
  { id: 'ar', label: 'Active Record', chapter: 12, section: 'arel' },
  { id: 'pool', label: '接続プール', chapter: 15, section: 'pool' },
  { id: 'mysql', label: 'MySQL', chapter: 106 },
  { id: 'redis', label: 'Redis', chapter: 106 },
  { id: 'cache', label: 'キャッシュ', chapter: 22, section: 'cache-basics' },
  { id: 'job', label: 'Active Job / Sidekiq', chapter: 18, section: 'queue-worker' },
  { id: 'release', label: 'リリース', chapter: 32, section: 'release-layout' },
] as const satisfies readonly Stop[]

type StopId = typeof stops[number]['id']
/** 段階：[構成要素, 説明, 詳しく扱う節（構成要素の既定の節と違う場合）] */
type FlowStep = readonly [StopId, string] | readonly [StopId, string, readonly [number, string]]
type Flow = { id: string; title: string; steps: readonly FlowStep[] }

export const systemFlows: Flow[] = [
  { id: 'http', title: 'ブラウザーから応答が戻るまで', steps: [
    ['browser', 'ブラウザーが記事一覧の URL を開く。'],
    ['dns', 'キャッシュに結果がなければ、名前に対応する接続先を調べる。'],
    ['transport', '接続先の IP アドレスとポートに TCP で接続する。'],
    ['tls', 'TCP 接続の上で TLS を確立し、証明書でサーバーを確かめる。'],
    ['lb', 'ロードバランサーが受け付けた HTTP リクエストを転送する。'],
    ['nginx', '動的ページの要求を Puma に渡す。'],
    ['puma', '空いているスレッドで Rack アプリを呼ぶ。'],
    ['rack', 'アプリの手前にある処理を順に実行する。'],
    ['router', 'メソッドとパスから記事一覧のアクションを選ぶ。'],
    ['controller', 'アクションが記事一覧の検索条件（Relation）を組み立てる。この時点では SQL を送らない。', [12, 'lazy']],
    ['view', 'テンプレートの描画を始める。'],
    ['ar', 'ビューが一覧を列挙した時点で、Relation が SQL を組み立てる。', [26, 'call-order']],
    ['pool', 'Rails がプールから接続を借りる。'],
    ['mysql', 'MySQL が実行計画に沿って行を読み、結果を返す。'],
    ['view', '受け取った行からモデルを作り、テンプレートの残りを描画して HTML を組み立てる。'],
    ['browser', 'HTTP 応答がサーバーを逆にたどり、ブラウザーが HTML を表示する。'],
  ] },
  { id: 'boot', title: 'Rails の起動', steps: [
    ['puma', 'Puma がアプリを読み込む。preload_app! の場合はワーカーを作る前に読み込む。'],
    ['linux', 'preload_app! の場合は読み込みを終えたプロセスを fork してワーカーを作る。ワーカーは親とメモリーのページを共有し、書き込んだページだけが複製される（コピーオンライト）。', [103, 'fork']],
    ['boot', 'Bundler で依存を読み、Railtie や Engine の initializer を依存順に実行する。'],
    ['loader', 'Zeitwerk が定数と読み込み対象のファイルを対応させる。本番設定では起動時にまとめて読み込む。'],
    ['rack', '初期化を終え、Rack の呼び出しを受け付けられる状態になる。'],
  ] },
  { id: 'proxy', title: 'Nginx から Puma への転送', steps: [
    ['nginx', 'location で転送対象を選び、proxy_pass の接続先に要求を送る。'],
    ['puma', 'TCP または Unix ドメインソケットで要求を受け取り、Rails を呼ぶ。'],
    ['nginx', 'Puma が返したステータス・ヘッダー・本文を受け取り、クライアント側へ返す。'],
  ] },
  { id: 'middleware', title: 'Rack ミドルウェアから Controller へ', steps: [
    ['rack', 'ミドルウェアが request ID を設定し、内側のアプリを呼ぶ。応答を直接返すミドルウェアもある。'],
    ['router', 'Router がメソッドとパスを照合し、パスの値を params に渡す。'],
    ['controller', 'アクションの前後でコールバックを実行し、応答を組み立てる。'],
    ['rack', '応答がミドルウェアを逆順に通る。'],
  ] },
  { id: 'sql', title: 'Active Record から SQL の実行まで', steps: [
    ['ar', 'where や order で条件を持つ Relation を作る。行が必要になった時点で SQL に変換する。'],
    ['pool', '実行に使える接続を借りる。空きがない場合は待つ。'],
    ['mysql', 'SQL を受け取った MySQL が実行計画を選び、結果を返す。'],
    ['ar', '取得した行を、呼び出しに応じてモデルや列の値に変換する。'],
  ] },
  { id: 'concurrency', title: '同時リクエストと待ち行列', steps: [
    ['lb', 'ロードバランサーが同時に届いた要求を稼働中の接続先に振り分ける。'],
    ['transport', 'Puma が accept するまで、確立した接続はカーネルの accept の待ち行列（backlog）で待つ。', [104, 'backlog']],
    ['puma', 'accept した要求は Puma の待ち行列（todo）に入る。スレッドがすべて処理中なら、空くまでここで待つ。', [113, 'workers']],
    ['pool', 'スレッドが空いていても、接続がすべて貸し出されていれば SQL の前で待つ。待つ上限は checkout_timeout。', [113, 'capacity']],
    ['mysql', '接続を増やしても、DB の処理能力やロックが制約なら、そこで待ち時間が増える。'],
  ] },
  { id: 'jobs', title: 'バックグラウンドジョブ', steps: [
    ['controller', 'リクエストの処理中に、後から行う仕事を登録する。'],
    ['mysql', 'ジョブが保存済みの行を読む場合は、コミットしてからキューへ入れる。'],
    ['redis', 'Sidekiq を使う構成では Redis のキューに投入する。'],
    ['job', 'Web とは別のプロセスがジョブを取り出して実行する。再実行されても結果が重複しないようにする。'],
  ] },
  { id: 'transaction', title: '書き込みとトランザクション', steps: [
    ['controller', '注文の作成要求を受け、書き込みを行う処理を呼ぶ。'],
    ['ar', 'Active Record が同じ接続で複数の書き込みを行う。'],
    ['mysql', 'MySQL がトランザクションをコミットするか、失敗時にロールバックする。書き込みに伴うロックは解放される。'],
    ['job', '外部への通知を分離する場合は、コミット済みの状態を前提にジョブを処理する。'],
  ] },
  { id: 'cache', title: 'キャッシュの読み込みと無効化', steps: [
    ['controller', '現在の利用者とデータに対応するキャッシュキーを組み立てる。'],
    ['cache', '値があれば再利用する。値がなければ DB の読み取り結果を保存する。'],
    ['mysql', '更新をコミットする。'],
    ['cache', '更新に応じて異なるバージョンのキーを使うか、古い値を無効にする。'],
  ] },
  { id: 'deploy', title: 'アプリケーションの配備と再起動', steps: [
    ['release', '新しいリリースを作り、環境に必要なファイルや依存ライブラリをそろえる。'],
    ['mysql', '新旧プロセスから使える形で DB を変更する。互換性のない変更は別の配備に分ける。', [27, 'deploy-order']],
    ['job', 'Sidekiq に新しいジョブを取らないよう指示し（quiet）、実行中のジョブが終わってから止める。', [18, 'job-operations']],
    ['puma', 'リリースを切り替え、Puma を再起動する。hot restart は exec で同じ PID のまま起動し直し、待ち受けのソケットを引き継ぐ。phased restart はワーカーを1つずつ入れ替える（preload_app! を使わない構成）。', [23, 'puma-commands']],
    ['boot', '新しいプロセスで Rails の初期化を終える。'],
    ['job', '新しいリリースで Sidekiq を起動する。', [32, 'restart-services']],
    ['lb', 'ヘルスチェックが通った接続先に要求を送る。複数台では1台ずつ切り離して入れ替える。', [32, 'multi-host']],
    ['container', 'コンテナで動かす構成では、新しいイメージのコンテナを起動し、ヘルスチェックに合格してから古いコンテナを止める。', [107, 'rollout']],
  ] },
]

export const mapHref = (flow?: string) => flow ? `#/map/${flow}` : '#/map'
