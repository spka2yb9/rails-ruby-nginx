export type CourseStep = {
  chapter: number
  reason: string
  sections?: string[]
  optional?: boolean
}

export type Course = {
  id: string
  title: string
  purpose: string
  audience: string
  prerequisites: string
  outcome: string
  related: string[]
  steps: CourseStep[]
  groups: readonly (readonly [firstChapter: number, title: string])[]
  examples: readonly { chapter: number; section: string; title: string }[]
  practice?: boolean
  /** 第6部の演習（public/linux）を学習順序として使うコース。steps・groups・examples は空にする */
  exercises?: boolean
}

const step = (chapter: number, reason: string, sections?: string[]): CourseStep => ({ chapter, reason, sections })
const optional = (chapter: number, reason: string, sections?: string[]): CourseStep => ({ chapter, reason, sections, optional: true })

export const courses: Course[] = [
  {
    id: 'rails-basics',
    title: 'Rails 基礎知識',
    purpose: 'Ruby の読み方から始め、記事を作成・表示する Rails アプリの機能を順に確認します。',
    audience: 'Rails を初めて使う開発者、既存アプリの改修を始めた開発者',
    prerequisites: 'ほかの言語で条件分岐や関数を書いたことがある。',
    outcome: 'CRUD・認証と認可・ジョブ・メール・添付を備えたアプリを組み立て、テストやログで確認できる。',
    related: ['rails-internals', 'software-design'],
    examples: [
      { chapter: 94, section: 'request-response', title: '同じ URL で HTML と JSON の応答を比べる' },
      { chapter: 99, section: 'verify', title: 'Rails が選んだ環境と DB 設定を確認する' },
      { chapter: 102, section: 'authorization', title: 'ログイン済みでも閲覧できない条件をテストする' },
    ],
    groups: [
      [94, 'Web と Ruby の基礎'],
      [99, 'Rails の設定とリクエスト処理'],
      [35, 'SQL と Active Record'],
      [16, '画面、周辺機能、テスト'],
      [102, '認証と公開後の運用'],
    ],
    steps: [
      step(94, 'ブラウザーとサーバーが何を送受信するかを確認する。'),
      step(1, 'MVC と Rails のディレクトリを見渡す。', ['http', 'rails-new', 'request-flow', 'features', 'scope', 'rails-way', 'gems', 'rails-history', 'versions', 'conventions', 'summary']),
      step(95, '条件分岐、コレクション、メソッドの構文を読む。'),
      step(2, 'モデルやコントローラーがクラスとしてどう動くかを確かめる。', ['objects', 'class-instance', 'rails-syntax']),
      step(3, '継承と Mix-in でメソッドを共有する。', ['inheritance', 'module-include', 'module-basics']),
      step(4, 'ブロックを受け取る Rails のコードを読む。', ['block-basics', 'rails-blocks', 'proc-lambda']),
      step(96, '一覧の加工と失敗時の分岐を書く。'),
      optional(5, 'Concern や class_attribute など、Active Support がモデルとコントローラーに足す機能を知る。'),
      step(99, '環境ごとの設定と依存ライブラリを管理する。'),
      optional(6, 'Rack のミドルウェアが要求を受け取り、Action Dispatch がコントローラーへ渡す流れを知る。'),
      step(9, 'URL と HTTP メソッドをアクションに割り当てる。', ['routing-role', 'resources', 'path-helpers', 'resource-design']),
      step(10, '入力を受け取り、表示とリダイレクトを選ぶ。', ['controller-role', 'render-redirect', 'cookie-session', 'before-action', 'flash-and-hooks', 'controller-practice', 'params', 'response-formats', 'exceptions']),
      step(35, 'SELECT・INSERT・UPDATE・DELETE を SQL と Rails で対照する。'),
      step(36, '関連する表を結合し、集計と正規化を学ぶ。'),
      step(37, '検索に合う索引を選び、実行計画を読む。'),
      step(38, '複数の更新をまとめ、同時実行で何が起きるかを確かめる。'),
      step(11, 'テーブル、モデル、属性の対応を読み、保存前後の変更を調べる。', ['table', 'migration', 'model', 'crud', 'record-pattern', 'dirty']),
      step(12, '検索条件を Relation として組み立てる。', ['where-order-limit', 'chain', 'lazy', 'scope-design']),
      step(13, '関連を定義し、N+1 を避ける読み込み方を選ぶ。', ['basics', 'n-plus-one', 'preload', 'eager-load', 'includes']),
      step(14, '入力の検証と保存前後の処理を区別する。', ['validation-basics', 'callback-basics', 'uniqueness', 'after-commit']),
      step(15, '複数の保存をまとめ、必要な行をロックする。', ['transaction', 'optimistic', 'pessimistic']),
      optional(27, '本番のデータベースを止めずにマイグレーションを適用する手順と、元に戻す方法を知る。'),
      step(16, 'ERB とフォームで表示から送信までをつなぐ。', ['html-erb', 'layout-basics', 'asset-requests', 'layout-partial', 'partial-interfaces', 'helpers', 'form', 'nested-form', 'escape', 'assets', 'summary']),
      step(18, 'メールなどの処理をジョブに移す条件を知る。', ['why-async', 'queue-worker', 'job-basics']),
      step(19, 'メールと添付を実装し、Action Cable と Action Text の役割を知る。'),
      step(20, 'RSpec で入力、DB、画面のどこを検証するか決める。'),
      step(101, '外部サービスを呼び、応答の失敗を扱う。'),
      step(102, 'ログインの方式とアクセスを許す条件を分けて考える。'),
      step(21, '外部から受け取った値に対して Rails の保護機構を使う。'),
      step(22, '変更頻度に合わせてキャッシュの置き場所を選ぶ。', ['cache-basics', 'http-cache', 'fragment', 'rails-cache']),
      step(28, 'ログを手がかりに改修の影響を確認する。', ['bug-clues', 'rails-log', 'backtrace', 'regression']),
      optional(32, '変更したコードを本番に配備する手順を読む。'),
    ],
  },
  {
    id: 'rails-internals',
    title: 'Rails 内部構造',
    purpose: 'Ruby・Rack・Rails のソースコードを読み、起動とリクエスト処理の順番を確かめます。',
    audience: 'Rails の機能を使った経験があり、呼び出し先をソースで確かめたい開発者',
    prerequisites: 'Rails 基礎知識コース相当。Ruby でクラスとブロックを書ける。',
    outcome: '起動、ルート認識、アクションの呼び出し、SQL 発行、ビューの描画を実装箇所と結びつけて説明できる。',
    related: ['rails-basics', 'performance', 'infrastructure'],
    examples: [
      { chapter: 97, section: 'execution', title: '同じ加算命令で呼ばれるメソッドを比べる' },
      { chapter: 98, section: 'scheduler', title: 'Fiber の切り替えとローカルな値を観察する' },
    ],
    groups: [
      [1, 'ソースの調べ方と Ruby の実行・メソッド探索'],
      [6, 'Rack と Rails の起動'],
      [9, 'ルーティングとコントローラー'],
      [11, 'Active Record とデータベース接続'],
      [16, 'ビューの描画と応答'],
    ],
    steps: [
      step(1, 'メソッドの定義場所をソースで調べる方法と、実行中の処理を記録する方法を身につける。', ['find-source', 'trace']),
      step(2, 'オブジェクトとクラスの実体、メソッド探索の順序を確かめる。', ['object-contents', 'class-is-object', 'method-lookup', 'open-class', 'rails-ancestors']),
      step(3, '特異クラスと prepend が探索順に与える影響を確かめる。', ['include', 'prepend', 'super', 'singleton', 'class-methods', 'extend']),
      step(4, 'Proc と lambda の引数、スコープ、戻りを区別する。', ['proc-lambda', 'closure', 'scope-gate', 'self-switch', 'dsl']),
      step(5, 'クラスマクロと Active Support の Concern をソースで読む。', ['define-method', 'class-attribute', 'concern', 'callbacks', 'rails-dsl']),
      step(97, '命令列、実行フレーム、ヒープ、GC の関係をつかむ。'),
      step(98, 'Ruby スレッドと Fiber の切り替わり方を比べる。'),
      step(6, 'Rack の call をアプリケーションとミドルウェアの両方から読む。', ['rack-contract', 'middleware', 'rails-stack', 'build']),
      step(7, 'Railtie・Engine・initializer を読み込み順に追う。'),
      step(8, 'ファイルと定数の対応からオートロードと再読み込みを調べる。'),
      step(9, 'ルート認識からアクションへの引き渡しを追う。', ['dsl', 'route', 'recognize', 'dispatch']),
      step(10, 'リクエストがコントローラーに届いてから応答が組み立てられるまでを読む。', ['hierarchy', 'dispatch', 'render', 'exceptions']),
      step(11, '属性の型変換と、行からオブジェクトを作る処理を読む。', ['overview', 'instantiate', 'types', 'dirty']),
      step(12, 'Relation が Arel を経由して SQL を発行する条件を確かめる。', ['values', 'arel', 'load', 'scope-design', 'explain']),
      step(13, '関連を表すオブジェクトと、includes が読み込み方を選ぶ処理を確かめる。', ['objects', 'n-plus-one', 'preload', 'includes']),
      step(14, '保存時のコールバックを実行順に追う。', ['call-chain', 'callback-order', 'halting', 'after-commit']),
      step(15, '各実行単位への接続の貸し出しと返却を追う。', ['db-connection', 'pool']),
      step(16, 'テンプレートの探索とコンパイルを追い、出力のエスケープを SafeBuffer で確かめる。', ['flow', 'lookup', 'compile', 'escape']),
      optional(22, 'Active Support の計測の仕組み（instrument と購読）で、SQL や描画の時間が集められる流れを確かめる。', ['notifications']),
      step(26, '個別に読んだ処理を一つのリクエストでつなぐ。', ['parts', 'front', 'rails', 'call-order', 'response', 'write-flow', 'timing', 'summary']),
    ],
  },
  {
    id: 'performance',
    title: 'パフォーマンス改善',
    purpose: '計測で待ち時間が生じる箇所を絞り、SQL や Ruby の実装、Web サーバーの設定を変えた前後で応答時間を比べます。',
    audience: 'Rails アプリの応答時間や処理件数を改善したい開発者',
    prerequisites: 'Rails 基礎知識コース相当。SQL の検索条件とトランザクションを読める。',
    outcome: '同じ負荷条件で変更前後を計測し、応答時間・処理件数・リソース使用量を根拠に改善策を選べる。',
    related: ['rails-internals', 'infrastructure'],
    examples: [
      { chapter: 112, section: 'benchmark', title: '同じ検索結果を返すコードの割り当てと時間を測る' },
      { chapter: 113, section: 'verify', title: 'Puma のスレッド数を変えて同じ要求を送る' },
    ],
    groups: [
      [111, '性能の指標と計測'],
      [37, 'SQL、索引、ロック'],
      [97, 'Ruby と Puma の実行枠'],
      [22, 'キャッシュと非同期処理'],
      [114, '改善策を選ぶ事例'],
    ],
    steps: [
      step(111, '応答時間と処理件数を区別し、待ち行列が生じる条件を知る。'),
      step(112, 'ベンチマークとプロファイリングの役割を分ける。'),
      step(37, '実行計画と B-Tree で、読む行やページを減らす。'),
      step(12, 'SQL が発行される箇所を Relation の実行経路から探す。', ['lazy', 'load', 'explain']),
      step(13, 'N+1 を測り、読み込む行数と SQL の回数を比べる。', ['n-plus-one', 'preload', 'eager-load', 'n-plus-one-check']),
      step(38, '同時の更新で値が失われる条件と、ロック競合・デッドロックを確かめる。', ['concurrent-updates', 'simulator', 'lock', 'lost-update-fix', 'deadlock']),
      step(15, 'トランザクションと接続の保持時間を調べ、楽観的ロックと悲観的ロックを比べる。', ['transaction', 'optimistic', 'pessimistic', 'lock-index', 'pool']),
      step(100, '取得列、バッチサイズ、ページ送りを用途に合わせる。'),
      step(97, 'オブジェクト割り当てと GC の計測値を読む。', ['memory', 'allocation', 'gc', 'diagnostics', 'process-memory', 'tradeoffs']),
      step(98, 'CPU を使う処理と I/O を待つ処理で並行性を比べる。', ['gvl', 'scheduler', 'rails', 'tradeoffs']),
      step(23, 'Puma のワーカー・スレッド構成とメモリーを確認する。'),
      optional(103, 'プロセスのメモリー（RSS・PSS）と、ディスクの読み書きを待つ時間の測り方を知る。'),
      optional(106, 'MySQL のバッファープールとコミット時のディスクへの書き込みが応答時間に与える影響を知る。'),
      step(113, 'Puma と Active Record の上限を同時に変えて待ちの移動を見る。'),
      step(22, '変更頻度と許容できる古さからキャッシュを決める。', ['cache-basics', 'http-cache', 'fragment', 'rails-cache']),
      step(18, '処理をジョブに移す条件と、コミット後の投入・再試行・冪等性を確かめる。', ['why-async', 'retry', 'transaction', 'idempotency', 'queue-planning']),
      optional(90, '仮説を立てて計測する考え方をコードレビューに当てはめる。'),
      step(114, 'クエリ・索引・整合性の判断を事例で確認する。'),
      step(115, 'スレッド・接続・キャッシュ・ジョブの設定を事例で比べる。'),
    ],
  },
  {
    id: 'infrastructure',
    title: 'インフラ・サーバー基礎',
    purpose: 'ブラウザーから Rails と DB までの経路を追い、各プロセスとネットワークの役割を確認します。',
    audience: 'インフラの設定値と Rails アプリの動作を結びつけたい開発者',
    prerequisites: 'ローカルで Rails アプリを起動したことがある。',
    outcome: '名前解決、通信の確立、プロキシ、アプリケーション処理、DB 接続を区別し、設定の根拠を説明できる。',
    related: ['rails-basics', 'performance'],
    examples: [
      { chapter: 105, section: 'failure', title: '証明書の信頼と名前をローカルで確かめる' },
      { chapter: 106, section: 'metrics', title: 'Redis のヒット数とミス数の増分を見る' },
    ],
    practice: true,
    groups: [
      [94, 'OS とネットワーク'],
      [23, 'アプリケーションサーバーとプロキシ'],
      [106, 'データの保存と本番構成'],
      [26, '通信経路とリリース'],
    ],
    steps: [
      step(94, 'ブラウザーとサーバーの間で交換する要求と応答を確認する。', ['client-server', 'lab', 'request-response', 'https']),
      optional(6, 'Rack の約束事（call が env を受け取り、ステータス・ヘッダー・本文を返す）を知る。後の章の小さな Rack アプリを読む前提になる。'),
      step(103, 'Linux がプロセス・メモリー・ファイルを管理する仕組みを読む。'),
      step(104, 'ポートとソケットを区別し、TCP 接続ができるまでを追う。'),
      step(105, '名前解決と TLS の確認事項を分ける。'),
      step(23, 'Puma が複数の要求を扱うしくみをプロセスとスレッドから読む。'),
      optional(113, 'Puma のワーカー数・スレッド数と DB の接続数を、同時に届く要求の数から決める。'),
      step(24, 'Nginx が要求を転送する条件とヘッダーの扱いを読む。'),
      step(25, 'ロードバランサーでバックエンドを選び、TLS を終端する構成を読む。'),
      optional(18, 'ジョブのキューとワーカー（Sidekiq）が Redis をどう使うかを知る。'),
      step(106, 'MySQL と Redis のデータの持ち方、永続化、接続の役割を比べる。'),
      step(107, 'コンテナの分離と、AWS 上で各サービスを置く位置を確かめる。'),
      step(26, 'LB、Nginx、Puma、Rails、DB のログを同じ要求で結びつける。', ['network-entry', 'parts', 'setup', 'front', 'rails', 'response', 'write-flow', 'timing', 'map', 'summary']),
      step(32, 'リリースの切り替えとプロセス再起動を追う。'),
      step(27, '新旧のアプリケーションが並行稼働する時点の DB 変更を考える。'),
    ],
  },
  {
    id: 'server-ops',
    title: 'サーバ運用',
    purpose: 'ブラウザの練習用サーバーでRailsアプリの場所、設定、ログを順に調べます。入門のあとは、LinuxやAWSで起きる障害の調査と復旧を練習できます。',
    audience: '本番のサーバーにログインして、Rails アプリの状態を調べる作業を始める開発者',
    prerequisites: 'インフラ・サーバー基礎コースの Linux とネットワークの章を読んでいると、コマンドの出力を読み取りやすくなります。',
    outcome: 'ログ、プロセス、設定、AWS のリソースを順に確かめて障害の原因を絞り込み、復旧の手順を選べる。',
    related: ['infrastructure', 'performance'],
    examples: [],
    groups: [],
    steps: [],
    exercises: true,
  },
  {
    id: 'software-design',
    title: 'ソフトウェア設計',
    purpose: 'Rails 標準の責務分割、プログラミング原則、MSDP を、変更内容と費用に応じて使い分けます。',
    audience: '改修時にクラスの分け方や抽象化の必要性を説明したい Rails 開発者',
    prerequisites: 'Rails 基礎知識コース相当（選択の章を含む）。Active Record と RSpec を使ったことがある。ロードバランサーの再試行やタイムアウトを前提にする一部の章は、インフラ・サーバー基礎コースの該当の章を合わせて読む。',
    outcome: '変更の影響が広がる箇所を見つけ、設計を変える条件と見送る条件を具体的に示せる。',
    related: ['rails-basics', 'performance'],
    examples: [
      { chapter: 108, section: 'implementation', title: '支払い判定を替えて注文が確定する条件を比べる' },
      { chapter: 116, section: 'pattern', title: 'Outbox の書き込みが失敗したときの DB の状態を確かめる' },
    ],
    groups: [
      [30, 'Rails の責務分割'],
      [57, '基本のプログラミング原則'],
      [60, '追加のプログラミング原則'],
      [93, '原則の組み合わせと注文設計'],
      [39, 'MSDP の採用判断・構造と依存関係'],
      [44, '業務ロジックと状態'],
      [48, 'データと整合性'],
      [51, 'イベントと信頼性'],
      [108, 'アーキテクチャと改修判断'],
    ],
    steps: [
      step(30, 'Rails で責務が集まりすぎたときの判断材料を得る。'),
      step(31, 'Rails の規約と DHH の設計判断を読んで比較する。'),
      step(56, '原則を使う目的と、Rails の実装での読み方を確かめる。'),
      step(33, 'Service・Form・Query・Value Object が引き受ける責務を比べる。'),
      step(57, 'KISS を使い、今ある条件だけで足りる構造を選ぶ。'),
      step(58, 'YAGNI を使い、要件が確定するまで待てる箇所を見極める。'),
      step(59, 'DRY を使い、変更理由が同じ知識を一か所にまとめる。'),
      step(60, 'WET を使い、似ているだけの処理を早く共通化しない。'),
      step(61, '名前と振る舞いを揃え、利用側が予想できるかを確認する。'),
      step(62, '規約に任せる処理と、呼び出しをコードに書く処理を比べる。'),
      step(63, '単一責任の原則を、変更理由の違いから適用する。'),
      step(64, '開放閉鎖の原則を、種類が増える箇所にだけ適用する。'),
      step(67, '依存性逆転の原則で、変わりやすい外部の部品への依存を差し替えられるようにする。'),
      step(68, '入力検証・権限・保存の関心を分ける。'),
      step(69, '同じ理由で変わる計算とデータをまとめる。'),
      step(70, '別の機能の内部構造への依存を減らす。'),
      step(71, '変更を許す操作をクラスの公開メソッドにする。'),
      step(79, '誤入力や設定の不足を止める時点を選ぶ。'),
      step(76, 'AHA を使い、共通化を急いで不適切な抽象化を作らない。'),
      ...[65, 66, 72, 73, 74, 75, 77, 78, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92]
        .map((id) => optional(id, '改修するコードに当てはまる場面を探す。')),
      step(93, '複数の原則が異なる結論を示すときの判断材料を整理する。'),
      step(34, '注文処理を段階的に分ける理由を、実装の変化から読む。'),
      step(39, 'MSDP の4カテゴリと、パターンを導入する条件を確認する。'),
      ...[40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55]
        .map((id) => step(id, 'Rails の実装と照合し、適用条件・代償・代替手段を読む。')),
      step(108, 'レイヤーを分けたときの依存方向を比べる。'),
      step(109, 'Active Record がある状況で Repository を分ける条件を選ぶ。'),
      step(110, '安全な変更の順番を決め、先送りに伴う費用を見積もる。'),
      step(116, '原則やパターンを採用する場合と見送る場合を事例で比べる。'),
    ],
  },
]

export const courseById = new Map(courses.map((course) => [course.id, course]))

export function courseGroups(course: Course) {
  const starts = course.groups.map(([chapter]) => course.steps.findIndex((step) => step.chapter === chapter))
  return course.groups.map(([chapter, title], index) => ({
    chapter,
    title,
    start: starts[index],
    steps: course.steps.slice(starts[index], starts[index + 1]),
  }))
}

export function courseHref(id: string): string {
  return `#/course/${id}`
}
