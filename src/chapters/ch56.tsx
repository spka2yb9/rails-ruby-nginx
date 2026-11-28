import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

/* ---------- 図 54-1 コードレビューで原則の名前を使う場面 ---------- */
function ReviewFigure() {
  const code: [number, string, boolean?][] = [
    [48, '# app/models/order.rb', true],
    [70, 'def total_with_tax'],
    [92, '  (price * quantity * 1.1).floor'],
    [114, 'end'],
    [146, '# app/mailers/order_mailer.rb', true],
    [168, '@total = (@order.price * @order.quantity'],
    [190, '          * 1.1).round'],
    [222, '# app/controllers/orders_controller.rb', true],
    [244, 'order.save # 戻り値を見ていない'],
    [266, 'render json: { total: ... }, status: :created'],
  ]
  return (
    <Svg
      id="54-1"
      w={780}
      h={400}
      label="注文を受け付けるコードと、3つのレビューの指摘を並べた図。指摘1は DRY で、税込みの合計を計算する規則がモデルとメーラーの2か所にあることを指す。指摘2は Fail Fast で、save の戻り値を見ずに 201 を返していることを指す。指摘3は YAGNI で、将来の多通貨に備えた計算の基底クラスを作る提案に反対している。下に実行結果として、API の合計が1435円、メールの合計が1436円とずれたこと、数量0の注文で応答が201なのに保存された注文が0件だったことを示す"
    >
      <Box x={20} y={24} w={440} h={262} fill="bg" />
      {code.map(([y, text, comment]) => (
        <T key={y} x={34} y={y} fs={12} mono tone={comment ? 'muted' : undefined}>
          {text}
        </T>
      ))}
      <Box x={500} y={40} w={260} h={56} lines={['指摘1：DRY', '税込みの合計の規則が2か所にある']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={500} y={148} w={260} h={56} lines={['指摘2：Fail Fast', '保存に失敗しても 201 を返す']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={500} y={228} w={260} h={70} lines={['指摘3：YAGNI', '「多通貨に備えて計算の基底クラス', 'を作る」という提案は、まだ要らない']} fs={12} fill="box5" bold subTone="muted" />
      <Arrow x1={500} y1={62} x2={300} y2={88} />
      <Arrow x1={500} y1={76} x2={420} y2={170} />
      <Arrow x1={500} y1={180} x2={300} y2={240} />
      <T x={20} y={326} fs={12} tone="danger">
        実行結果：同じ注文で、API の合計は 1435 円、メールの合計は 1436 円になった
      </T>
      <T x={20} y={350} fs={12} tone="danger">
        実行結果：数量 0 の注文で、応答は 201、保存された注文は 0 件だった
      </T>
      <T x={20} y={380} fs={12} tone="muted">
        指摘1・2は問題を直す方向の原則、指摘3は余計な変更を止める方向の原則
      </T>
    </Svg>
  )
}

/* ---------- 図 54-2 原則同士がぶつかる5組 ---------- */
function TradeoffPairsFigure() {
  const rows: [string, string, string, string][] = [
    ['DRY', 'AHA', '同じ規則を1か所にまとめる', '似ているだけのものは、まだまとめない'],
    ['KISS', 'OCP', '今の要件を単純に書く', '変更が見込まれる所を拡張できるようにする'],
    ['YAGNI', 'DIP', '具体的な実装を直接使う', '抽象（取り決め）に依存させる'],
    ['Fail Fast', 'Graceful Degradation', '不正を見つけたら止める', '一部が壊れても続ける'],
    ['Encapsulation', 'テストのしやすさ', '内部を隠す', 'テストのために内部を見せたくなる'],
  ]
  return (
    <Svg
      id="54-2"
      w={780}
      h={360}
      label="原則同士がぶつかる5組を左右に並べた図。DRY と AHA、KISS と OCP、YAGNI と DIP、Fail Fast と Graceful Degradation、Encapsulation とテストのしやすさ。それぞれの左の原則は、同じ規則を1か所にまとめる、今の要件を単純に書く、具体的な実装を直接使う、不正を見つけたら止める、内部を隠す方向を勧める。右の原則は、似ているだけのものはまだまとめない、変更が見込まれる所を拡張できるようにする、抽象に依存させる、一部が壊れても続ける、テストのために内部を見せたくなる方向を勧める。どちらを優先するかは場面ごとに判断し、終章で比べる"
    >
      <T x={20} y={22} bold>
        原則同士がぶつかる5組（どちらを優先するかは場面で決める。終章で比べる）
      </T>
      {rows.map(([a, b, da, db], i) => {
        const y = 44 + i * 62
        return (
          <g key={a}>
            <Box x={20} y={y} w={300} h={50} lines={[a, da]} fs={12} bold subTone="muted" />
            <Box x={460} y={y} w={300} h={50} lines={[b, db]} fs={12} bold subTone="muted" />
            <Arrow x1={324} y1={y + 25} x2={456} y2={y + 25} both dashed />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 54-3 原則を適用する3つの目的と、主に対応する原則 ---------- */
function PurposesFigure() {
  const cols: { x: number; head: string; sub: string; items: string[] }[] = [
    {
      x: 20,
      head: '理解しやすいこと',
      sub: 'ほかの人・後の自分が読める',
      items: ['KISS', 'YAGNI', 'POLA', 'Explicit over Implicit', 'SoC（関心の分離）', 'Tell, Don’t Ask', 'Law of Demeter'],
    },
    {
      x: 280,
      head: '変更しやすいこと',
      sub: '影響範囲を限って安全に変える',
      items: [
        'DRY',
        'WET',
        'AHA',
        'SRP',
        'OCP',
        'LSP',
        'ISP',
        'DIP',
        'High Cohesion',
        'Low Coupling',
        'Encapsulation',
        'Composition over Inheritance',
        'Information Hiding',
        'Stable Dependencies Principle',
        'Functional Core, Imperative Shell',
        'Boy Scout Rule',
        'Separation of Policy and Mechanism',
      ],
    },
    {
      x: 540,
      head: '正しく動き続けること',
      sub: '不正を防ぎ、障害の影響を抑える',
      items: [
        'Fail Fast',
        'Design by Contract',
        'Make Illegal States Unrep.',
        'Defensive Programming',
        'Idempotency',
        'Atomicity',
        'Least Privilege',
        'Single Source of Truth',
        'Observability',
        'Measure Before Optimizing',
        'Graceful Degradation',
        'Backward Compatibility',
      ],
    },
  ]
  return (
    <Svg
      id="54-3"
      w={780}
      h={470}
      label="原則を適用する3つの目的と、それぞれに主に対応する原則を3列に並べた図。理解しやすいことには KISS、YAGNI、POLA、Explicit over Implicit、関心の分離、Tell, Don't Ask、デメテルの法則。変更しやすいことには DRY、WET、AHA、SOLID の5つ、高凝集、疎結合、カプセル化、コンポジション、情報隠蔽、安定依存の原則、Functional Core, Imperative Shell、ボーイスカウト・ルール、方針と仕組みの分離。正しく動き続けることには Fail Fast、契約による設計、不正な状態を表現できなくする、防御的プログラミング、冪等性、原子性、最小権限、Single Source of Truth、可観測性、最適化の前の計測、Graceful Degradation、後方互換性。多くの原則は2つ以上の目的に役立つが、図には主な1つだけを示す"
    >
      {cols.map((c) => (
        <g key={c.head}>
          <Box x={c.x} y={16} w={220} h={56} lines={[c.head, c.sub]} fs={13} fill="box5" bold subTone="muted" />
          <Box x={c.x} y={82} w={220} h={c.items.length * 20 + 16} fill="bg" />
          {c.items.map((it, i) => (
            <T key={it} x={c.x + 12} y={100 + i * 20} fs={12}>
              {it}
            </T>
          ))}
        </g>
      ))}
      <T x={20} y={450} fs={12} tone="muted">
        多くの原則は2つ以上の目的に役立つ。図には主な目的を1つだけ示した（36の原則）
      </T>
    </Svg>
  )
}

/* ---------- 図 54-6 Rails Doctrine の柱と原則 ---------- */
function DoctrineFigure() {
  const left = [
    'Optimize for programmer happiness',
    'Convention over Configuration',
    'Provide sharp knives',
    'Value integrated systems',
    'Progress over stability',
    'No one paradigm',
  ]
  const right = [
    'POLA（驚き最小の原則）',
    'DRY',
    'Explicit over Implicit',
    'Encapsulation',
    'KISS',
    'Low Coupling',
    'Backward Compatibility',
    'Composition・FCIS',
  ]
  // [左, 右, ぶつかるか]
  const edges: [number, number, boolean][] = [
    [0, 0, false],
    [1, 1, false],
    [1, 2, true],
    [2, 2, true],
    [2, 3, true],
    [3, 4, false],
    [3, 5, true],
    [4, 6, true],
    [5, 7, false],
  ]
  const ly = (i: number) => 52 + i * 56
  const ry = (j: number) => 44 + j * 42
  return (
    <Svg
      id="54-6"
      w={780}
      h={440}
      label="Rails Doctrine の6つの柱と原則の関係を線で結んだ図。実線は同じ方向を向く関係、破線はぶつかることがある関係。Optimize for programmer happiness は POLA と同じ方向。Convention over Configuration は DRY と同じ方向で、Explicit over Implicit とはぶつかることがある。Provide sharp knives は Explicit over Implicit と Encapsulation とぶつかることがある。Value integrated systems は KISS と同じ方向で、Low Coupling とはぶつかることがある。Progress over stability は Backward Compatibility とぶつかることがある。No one paradigm は Composition over Inheritance や Functional Core, Imperative Shell と同じ方向"
    >
      <T x={20} y={24} bold>
        Rails Doctrine の柱
      </T>
      <T x={480} y={24} bold>
        原則
      </T>
      {edges.map(([l, r, clash]) => (
        <Arrow key={`${l}-${r}`} x1={300} y1={ly(l) + 20} x2={480} y2={ry(r) + 16} plain dashed={clash} accent={!clash} />
      ))}
      {left.map((t, i) => (
        <Box key={t} x={20} y={ly(i)} w={280} h={40} lines={t} fs={12} fill="box2" />
      ))}
      {right.map((t, j) => (
        <Box key={t} x={480} y={ry(j)} w={280} h={32} lines={t} fs={12} />
      ))}
      <Arrow x1={20} y1={400} x2={80} y2={400} plain accent />
      <T x={88} y={400} fs={12}>
        同じ方向を向く
      </T>
      <Arrow x1={260} y1={400} x2={320} y2={400} plain dashed />
      <T x={328} y={400} fs={12}>
        ぶつかることがある（場面ごとに判断が要る）
      </T>
      <T x={20} y={428} fs={12} tone="muted">
        9つの柱のうち、原則との関係がはっきりしている6つを示した
      </T>
    </Svg>
  )
}

/* ---------- 図 54-7 原則・設計パターン・アーキテクチャ・Rails の機能 ---------- */
function LayersFigure() {
  return (
    <Svg
      id="54-7"
      w={780}
      h={400}
      label="原則、設計パターン、アーキテクチャ、Rails の機能の関係を示した図。原則は判断の基準で、1行のコードからアプリ全体まで当てはまる。例は DRY、SRP、DIP、Fail Fast。設計パターンは繰り返し現れる問題と解決の形で、数個のクラスの組み合わせに当てはまる。例は Strategy、Adapter、Dependency Injection、Value Object。アーキテクチャはアプリ全体の分け方で、例はレイヤード、クリーン、ヘキサゴナル、モジュラーモノリス。原則はパターンを選ぶときの基準になり、パターンを組み合わせてアーキテクチャを作る。Rails の機能と規約は、いくつかのパターンをすでに実装している。下段は具体例の流れで、DIP という原則から、Adapter と Dependency Injection というパターン、ヘキサゴナル・アーキテクチャへつながる"
    >
      <Box x={20} y={20} w={230} h={110} lines={['原則', '判断の基準', '1行のコード〜アプリ全体', '例：DRY・SRP・DIP・Fail Fast']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={275} y={20} w={230} h={110} lines={['設計パターン', '繰り返し現れる問題と解決の形', '数個のクラスの組み合わせ', '例：Strategy・Adapter・DI']} fs={12} bold subTone="muted" />
      <Box x={530} y={20} w={230} h={110} lines={['アーキテクチャ', 'アプリ全体の分け方', 'ディレクトリ・層・境界', '例：レイヤード・ヘキサゴナル']} fs={12} fill="box2" bold subTone="muted" />
      <Arrow x1={250} y1={75} x2={273} y2={75} />
      <Arrow x1={505} y1={75} x2={528} y2={75} />
      <T x={262} y={150} anchor="middle" fs={11} tone="muted">
        選ぶ基準
      </T>
      <T x={517} y={150} anchor="middle" fs={11} tone="muted">
        組み合わせる
      </T>
      <Box x={275} y={170} w={230} h={70} lines={['Rails の機能と規約', 'Rack ミドルウェア・lock_version・', 'retry_on・Active Record など']} fs={12} fill="box4" bold subTone="muted" />
      <Arrow x1={390} y1={170} x2={390} y2={132} dashed />
      <T x={398} y={156} fs={11} tone="muted">
        一部を実装済み
      </T>
      <T x={20} y={280} bold>
        つながりの例
      </T>
      <Box x={20} y={296} w={230} h={44} lines={['DIP（依存性逆転の原則）', '方針は詳細に依存しない']} fs={12} fill="box5" subTone="muted" />
      <Box x={275} y={296} w={230} h={44} lines={['Adapter・Dependency Injection', '取り決めを満たすクラスを渡す']} fs={12} subTone="muted" />
      <Box x={530} y={296} w={230} h={44} lines={['ヘキサゴナル・アーキテクチャ', '業務の中心と外部を分ける']} fs={12} fill="box2" subTone="muted" />
      <Arrow x1={250} y1={318} x2={273} y2={318} accent />
      <Arrow x1={505} y1={318} x2={528} y2={318} accent />
      <T x={20} y={376} fs={12} tone="muted">
        原則だけではコードの形は決まらない。パターンとアーキテクチャは、原則に沿った形の候補を示す
      </T>
    </Svg>
  )
}

/* ---------- 図 54-8 原則の章の節の並び ---------- */
function LayoutFigure() {
  const rows: [string, string, string][] = [
    ['scene', '場面と、原則に反したコード', '動かして、不具合や変更の手間を見せる'],
    ['meaning', '原則の意味と由来', '提唱者と最初の資料、似た原則との違い'],
    ['apply', '原則に沿って直す', '直したコードと実行結果、直す順序'],
    ['overuse', '当てはめすぎたとき', '複雑になる例と、判断の目安'],
    ['rails', 'Rails の機能・規約との関係', '標準機能、Rails Doctrine、ほかの章'],
    ['summary', 'まとめ', ''],
  ]
  const figs = ['場面の構成の図', '', '直す前と後の比較の図', '当てはめすぎの判断の図', '', '']
  return (
    <Svg
      id="54-8"
      w={780}
      h={396}
      label="原則の章の6つの節を上から順に並べ、それぞれの内容と、どの章にも置く図を示した図。場面と原則に反したコードの節では、コードを動かして不具合や変更の手間を見せ、場面の構成の図を置く。原則の意味と由来の節では、提唱者と最初の資料、似た原則との違いを書く。原則に沿って直す節では、直したコードと実行結果を示し、直す前と後の比較の図を置く。当てはめすぎたときの節では、複雑になる例と判断の目安を示し、判断の図を置く。Rails の機能と規約との関係の節では、標準機能と Rails Doctrine とほかの章を示す。最後はまとめ"
    >
      <T x={20} y={22} bold>
        節（上から順）
      </T>
      <T x={600} y={22} bold>
        どの章にも置く図
      </T>
      {rows.map(([id, title, desc], i) => {
        const y = 40 + i * 54
        const hot = i === 0 || i === 2
        return (
          <g key={id}>
            <Box x={20} y={y} w={300} h={44} lines={[title, id]} fs={12} fill={hot ? 'box5' : 'box'} align="start" subTone="muted" />
            <T x={336} y={y + 22} fs={12}>
              {desc}
            </T>
            {figs[i] && <Box x={600} y={y + 6} w={160} h={32} lines={figs[i]} fs={11} fill="box2" dashed />}
          </g>
        )
      })}
      <T x={20} y={384} fs={12} tone="muted">
        紫の節では Rails のコードを Docker の MySQL 8.4 で動かし、実行結果を載せる。図は1章に6点以上
      </T>
    </Svg>
  )
}

/* ---------- 図 54-4 36の原則と5つのカテゴリ（表） ---------- */
const CATALOG: { cat: string; items: [number, string, string][] }[] = [
  {
    cat: '1 シンプルさ・可読性',
    items: [
      [57, 'KISS', '3種類のクーポンのために汎用のルールエンジンを作らない'],
      [58, 'YAGNI', '使う予定のない多通貨対応を先に作らない'],
      [59, 'DRY', '消費税の端数処理を1か所にする'],
      [60, 'WET', '似ている2つの処理を、3つ目が来るまで共通化しない'],
      [61, 'POLA（驚き最小の原則）', 'メソッド名と API の振る舞いを予想どおりにする'],
      [62, 'Explicit over Implicit', 'default_scope とコールバックに隠れた処理を表に出す'],
    ],
  },
  {
    cat: '2 設計・責務分離',
    items: [
      [63, 'SRP（単一責任の原則）', '注文のモデルから CSV の出力と通知を分ける'],
      [64, 'OCP（開放閉鎖の原則）', '支払い方法を足すときに既存のコードを書き換えない'],
      [65, 'LSP（リスコフの置換原則）', 'STI のサブクラスが親の約束を破らない'],
      [66, 'ISP（インターフェース分離の原則）', '使わない機能の実装を強制しない'],
      [67, 'DIP（依存性逆転の原則）', '在庫の引き当てを倉庫 API のクライアントに直接依存させない'],
      [68, 'SoC（関心の分離）', '1つのアクションに混ざった表示・検証・権限・保存を分ける'],
      [69, 'High Cohesion（高凝集）', '予約の期間の計算を1つのクラスに集める'],
      [70, 'Low Coupling（疎結合）', '請求のモジュールが会員の内部の列を直接読まない'],
      [71, 'Encapsulation（カプセル化）', '残高を外から直接書き換えさせない'],
      [72, 'Composition over Inheritance', '通知の種類を継承の階層で増やさない'],
    ],
  },
  {
    cat: '3 抽象化・依存関係',
    items: [
      [73, 'Information Hiding（情報隠蔽）', '配送業者の選び方をモジュールの中に隠す'],
      [74, 'Law of Demeter（デメテルの法則）', 'order.customer.address.prefecture.name をたどらない'],
      [75, 'Stable Dependencies Principle（安定依存の原則）', '共通の Money クラスがキャンペーンの設定に依存しない'],
      [76, 'AHA（拙速な抽象化を避ける）', '3つの帳票を1つの ReportBuilder に押し込まない'],
      [77, 'Tell, Don’t Ask', 'サブスクリプションの状態を聞いて外で判断しない'],
      [78, 'Functional Core, Imperative Shell', 'ポイントの計算を DB と現在時刻から切り離す'],
    ],
  },
  {
    cat: '4 正しさ・信頼性',
    items: [
      [79, 'Fail Fast', '設定の抜けと不正な値を、起動時と入力を受け取った時点で止める'],
      [80, 'Design by Contract（契約による設計）', '在庫の引き当てに前提条件・事後条件・不変条件を書く'],
      [81, 'Make Illegal States Unrepresentable', '発送日があるのに未発送の注文を作れなくする'],
      [82, 'Defensive Programming（防御的プログラミング）', 'Webhook と CSV の外部のデータを信頼しない'],
      [83, 'Idempotency（冪等性）', 'ジョブを2回実行してもメールとポイントを二重にしない'],
      [84, 'Atomicity（原子性）', 'ポイントの譲渡を全部成功か全部失敗にする'],
      [85, 'Least Privilege（最小権限の原則）', '集計の処理と DB のユーザーに必要な権限だけを与える'],
    ],
  },
  {
    cat: '5 変更容易性・運用',
    items: [
      [86, 'Boy Scout Rule（ボーイスカウト・ルール）', 'バグの修正のついでに、触った所を少しだけ良くする'],
      [87, 'Separation of Policy and Mechanism（方針と仕組みの分離）', 'レート制限の回数と、数える仕組みを分ける'],
      [88, 'Single Source of Truth', '注文の合計を2か所に持たない'],
      [89, 'Observability（可観測性）', '決済が時々遅い原因を、ログとメトリクスとトレースで見つける'],
      [90, 'Measure Before Optimizing', '遅い一覧画面を、推測ではなく計測して直す'],
      [91, 'Graceful Degradation（段階的機能低下）', 'おすすめ商品の API が止まっても商品ページを表示する'],
      [92, 'Backward Compatibility（後方互換性）', 'API の項目名と DB の列名を、利用者を壊さずに変える'],
    ],
  },
]

function CatalogTable() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>カテゴリ</th>
            <th>章</th>
            <th>原則</th>
            <th>題材</th>
          </tr>
        </thead>
        <tbody>
          {CATALOG.flatMap((c) =>
            c.items.map(([id, name, subject], i) => (
              <tr key={id}>
                {i === 0 && <td rowSpan={c.items.length}>{c.cat}</td>}
                <td>
                  <ChapterLink n={id} />
                </td>
                <td>{name}</td>
                <td>{subject}</td>
              </tr>
            )),
          )}
          <tr>
            <td>6 原則同士のトレードオフ</td>
            <td>
              <ChapterLink n={93} />
            </td>
            <td>5組のトレードオフ</td>
            <td>DRY と AHA、KISS と OCP、YAGNI と DIP、Fail Fast と Graceful Degradation、Encapsulation とテストのしやすさ</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/* ---------- 図 54-5 特に重要な10原則（表） ---------- */
const TOP10: [number, string, string, string][] = [
  [57, 'KISS', '不要な複雑さを除く', '理解しやすい'],
  [58, 'YAGNI', '必要になるまで作らない', '理解しやすい'],
  [59, 'DRY', '知識やビジネスルールの重複を防ぐ', '変更しやすい'],
  [63, 'SRP', '変更の理由ごとに責務を分ける', '変更しやすい'],
  [69, 'High Cohesion / Low Coupling', '関連するものはまとめ、モジュール間の依存は減らす', '変更しやすい'],
  [76, 'AHA', '早すぎる抽象化を避ける', '変更しやすい'],
  [71, 'Encapsulation', '内部の実装を隠し、必要な操作だけを公開する', '変更しやすい'],
  [62, 'Explicit over Implicit', '隠れた依存や副作用を減らす', '理解しやすい'],
  [79, 'Fail Fast', '不正な状態を早く見つけて止める', '正しく動き続ける'],
  [90, 'Measure Before Optimizing', '計測した結果に基づいて最適化する', '正しく動き続ける'],
]

function Top10Table() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>番号</th>
            <th>原則</th>
            <th>何をするか</th>
            <th>主な目的</th>
            <th>章</th>
          </tr>
        </thead>
        <tbody>
          {TOP10.map(([id, name, what, purpose], i) => (
            <tr key={name}>
              <td>{i + 1}</td>
              <td>{name}</td>
              <td>{what}</td>
              <td>{purpose}</td>
              <td>
                <ChapterLink n={id} />
                {id === 69 && (
                  <>
                    、<ChapterLink n={70} />
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const chapter: Chapter = {
  number: 56,
  part: 8,
  title: 'プログラミングの原則とは何か',
  summary:
    'コードレビューで「DRY に反している」「Fail Fast にしよう」のように原則の名前が出る場面から始め、原則がコードの読みやすさ・変更のしやすさ・正しく動き続けることのための判断の基準であり、絶対のルールではないことを確かめます。36の原則の一覧と特に重要な10原則、Rails の設計思想（Rails Doctrine）との関係、原則・設計パターン・アーキテクチャの違い、この部の章の読み方を説明します。',
  goals: [
    'プログラミングの原則が、コードの可読性・保守性・拡張性・信頼性を高めるための判断の基準であり、場面によってはほかの原則とぶつかることを、例を挙げて説明できる',
    '原則を適用する3つの目的（理解しやすい・変更しやすい・正しく動き続ける）と、それぞれに主に役立つ原則を挙げられる',
    '36の原則が5つのカテゴリに分かれていることと、特に重要な10原則を挙げ、読むべき章を引ける',
    'Rails Doctrine の柱（Convention over Configuration、Progress over stability など）と、同じ方向を向く原則・ぶつかる原則を説明できる',
    '原則・設計パターン・アーキテクチャ・Rails の機能の違いと関係を説明できる',
  ],
  prerequisites: [10, 14, 20, 30],
  sections: [
    {
      id: 'what-is-principle',
      title: '原則は判断の基準である',
      body: (
        <>
          <h3>コードレビューで原則の名前が出る場面</h3>
          <p>
            Rails のチームでコードレビューをしていると、「ここは DRY にしましょう」「Fail Fast にしたほうがよいです」「それは YAGNI では」のように、英語の略語で書かれた指摘を受けることがあります。これらはプログラミングの原則の名前です。原則の名前を知っていると、指摘の理由を短い言葉で伝え合えます。反対に名前だけを知っていて意味をあいまいに覚えていると、指摘の当否を判断できません。
          </p>
          <p>次のコードは EC サイトの注文を受け付けるアクションと、確認メールのメーラーです。このコードの PR に、3つの指摘が付いた場面を考えます。</p>
          <Code
            lang="ruby"
            title="app/models/order.rb・app/mailers/order_mailer.rb・app/controllers/orders_controller.rb"
            code={`class Order < ApplicationRecord
  validates :quantity, numericality: { greater_than: 0 }

  # 画面と API で使う税込みの合計（1円未満は切り捨て）
  def total_with_tax
    (price * quantity * 1.1).floor
  end
end

class OrderMailer < ApplicationMailer
  def receipt
    @order = params[:order]
    # メールの合計は、ここで計算し直している（1円未満は四捨五入）
    @total = (@order.price * @order.quantity * 1.1).round
    mail(to: @order.email, subject: "ご注文の確認")
  end
end

class OrdersController < ApplicationController
  def create
    order = Order.new(params.permit(:email, :price, :quantity))
    order.save # 戻り値の true / false を見ていない
    OrderMailer.with(order:).receipt.deliver_now if order.persisted?
    render json: { total: order.total_with_tax }, status: :created
  end
end`}
          />
          <p>このコードを request spec で動かしました。1つ目は単価 1,305 円の商品を1個注文する例、2つ目は数量 0 の注文を送る例です。</p>
          <Code
            lang="ruby"
            title="spec/requests/orders_spec.rb"
            code={`RSpec.describe "POST /orders（レビュー前のコード）", type: :request do
  it "画面の合計とメールの合計が1円ずれる" do
    post "/orders", params: { email: "hanako@example.com", price: 1305, quantity: 1 }, as: :json
    mail_total = ActionMailer::Base.deliveries.last.body.to_s[/\\d+/].to_i
    puts "  API の合計: #{response.parsed_body["total"]} 円、メールの合計: #{mail_total} 円"
    expect(response.parsed_body["total"]).not_to eq mail_total
  end

  it "数量 0 の注文は保存されないのに、201 と合計 0 円が返る" do
    post "/orders", params: { email: "hanako@example.com", price: 1305, quantity: 0 }, as: :json
    puts "  応答: #{response.status} #{response.body}、保存された注文: #{Order.count} 件"
    expect(response.status).to eq 201
    expect(Order.count).to eq 0
  end
end`}
          />
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4.13。bundle exec rspec spec/requests --format documentation）"
            code={`POST /orders（レビュー前のコード）
  API の合計: 1435 円、メールの合計: 1436 円
  画面の合計とメールの合計が1円ずれる
  応答: 201 {"total":0}、保存された注文: 0 件
  数量 0 の注文は保存されないのに、201 と合計 0 円が返る

2 examples, 0 failures`}
          />
          <p>
            1,305 円の1割増しは 1,435.5 円です。モデルは切り捨てて 1,435 円、メーラーは四捨五入して 1,436 円にしたので、同じ注文の金額が画面とメールで違いました。数量 0 の注文は検証で保存に失敗しましたが、アクションは save の戻り値を見ていないので、201（作成した）と合計 0 円を返しました。図 54-1 はこのコードと3つの指摘を並べたものです。
          </p>
          <Figure n="54-1" title="コードレビューで原則の名前を使う場面" caption="上のコードと実行結果をもとにした模式図。指摘3はレビューの途中で出た「将来の多通貨に備えて計算の基底クラスを作る」という提案への指摘。">
            <ReviewFigure />
          </Figure>
          <ul>
            <li>指摘1（DRY）：「税込みの合計の出し方」という1つの規則が2か所に書かれています。片方だけを直すと、実行結果のように金額がずれます（<ChapterLink n={59} />）。</li>
            <li>指摘2（Fail Fast）：保存に失敗したことを、その場で呼び出し元に伝えていません。不正な入力を受け取った時点で 422 を返すべきところを、成功として扱っています（<ChapterLink n={79} />）。</li>
            <li>指摘3（YAGNI）：指摘1を直す途中で「将来の多通貨にも備えて、計算の基底クラスを作ろう」という提案が出ました。日本円しか扱わないなら、使われない抽象化は読む量と直す量を増やすだけです（<ChapterLink n={58} />）。</li>
          </ul>
          <h3>原則とは何か</h3>
          <p>
            <Term en="programming principle">プログラミングの原則</Term>
            とは、コードの可読性（読んで理解できること）・保守性（直しやすいこと）・拡張性（機能を足しやすいこと）・信頼性（正しく動き続けること）を高めるための判断の基準です。上の指摘のように、「このコードのどこに、どんな問題が起きうるか」を短い名前で示します。
          </p>
          <p>
            原則は守らないと動かないルールではありません。上の3つの指摘のうち、指摘1と指摘2はコードを直す方向に働き、指摘3は余計なコードを足さない方向に働きました。原則は互いにぶつかることもあります。DRY は同じ規則を1か所にまとめるよう勧めますが、AHA（拙速な抽象化を避ける）は似ているだけのものを早くまとめないよう勧めます。どちらを優先するかは、重複しているのが同じ規則なのか、たまたま似ているだけなのかで決まります。図 54-2 は、この部で比べる5組のトレードオフです。
          </p>
          <Figure n="54-2" title="原則同士がぶつかる5組" caption="この部で比べる5組。どの組も、片方だけを常に優先すると問題が起きる。">
            <TradeoffPairsFigure />
          </Figure>
          <p>
            この部ではそれぞれの原則の章で、原則に反したコードの問題を実行結果で確かめた後に、原則を当てはめすぎたときに起きることも示します。5組のトレードオフは <ChapterLink n={93} /> で、両方の書き方を Rails のコードで比べます。
          </p>
          <h3>原則の名前で指摘するとき</h3>
          <p>
            原則の名前は指摘の理由を短く伝えるための言葉です。名前だけを書いた指摘では、どこに何の問題があるのかが相手に伝わりません。たとえば「DRY 違反です」とだけ書くと、受け取った人は、どの規則が重複しているのか、直さないと何が起きるのかを自分で探すことになります。次の表は同じ指摘を2通りに書いたものです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>書き方</th>
                  <th>指摘の文</th>
                  <th>伝わること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>名前だけ</td>
                  <td>DRY 違反です。</td>
                  <td>重複があるらしいことだけ。どこを直すかは相手が探す</td>
                </tr>
                <tr>
                  <td>場所・起きること・直し方</td>
                  <td>税込みの合計の出し方が Order#total_with_tax と OrderMailer#receipt の2か所にあり、端数の処理が違います（切り捨てと四捨五入）。1,305 円の注文で、API とメールの金額が1円ずれます。メーラーでも total_with_tax を使いませんか（DRY）。</td>
                  <td>重複している規則、起きる不具合、直す案、原則の名前</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            原則の名前は指摘の最後に添える程度で十分です。反対に、原則を理由にして変更を求められたときは、その原則が防ごうとしている問題が、このコードで実際に起きるかを確かめます。起きないなら、原則を当てはめないと決めることもできます。そのときは、PR の説明に理由を書いておくと、後で読む人が判断の経緯を追えます。
          </p>
        </>
      ),
    },
    {
      id: 'purposes',
      title: '原則を適用する3つの目的',
      body: (
        <>
          <p>原則を当てはめる目的は次の3つにまとめられます。どの原則を使うかを迷ったときは、いま困っているのがどの目的なのかを先に確かめると、選びやすくなります。</p>
          <h3>理解しやすいこと</h3>
          <ul>
            <li>ほかの開発者がコードを読んで、何をしているかを理解できる。</li>
            <li>時間が経っても、なぜこの形にしたのか（設計の意図）を読み取れる。</li>
          </ul>
          <p>
            たとえば、半年前に書いた注文の処理を直すときに、コールバックの中で何が動くかを調べるだけで1時間かかるなら、このコードは理解しにくい状態です。KISS、YAGNI、POLA（驚き最小の原則）、Explicit over Implicit は、主にこの目的のための原則です。
          </p>
          <h3>変更しやすいこと</h3>
          <ul>
            <li>仕様が変わったときに、直す範囲を限定できる。</li>
            <li>機能の追加・修正・削除を、ほかの機能を壊さずに行える。</li>
          </ul>
          <p>
            たとえば、消費税率が変わったときに直すファイルが1つで済むか10個になるかは、コードの分け方で決まります。DRY、SOLID の5つの原則、高凝集・疎結合、カプセル化、情報隠蔽は、主にこの目的のための原則です。
          </p>
          <h3>正しく動き続けること</h3>
          <ul>
            <li>不正な状態のデータを作らない。</li>
            <li>障害が起きたときの影響を小さく抑える。</li>
            <li>テストや監視で、品質を保ち続ける。</li>
          </ul>
          <p>
            たとえば、ジョブの再試行でポイントが二重に付与される、外部 API の障害で商品ページ全体が表示されなくなる、といった問題を防ぐ原則です。Fail Fast、冪等性、原子性、最小権限、可観測性などがこの目的に当たります。
          </p>
          <p>
            図 54-3 は36の原則を主な目的ごとに分けたものです。多くの原則は2つ以上の目的に役立ちます。たとえば DRY は変更を楽にするだけでなく、最初の節のような金額の食い違い（正しく動かないこと）も防ぎます。図には主な目的を1つだけ書いています。
          </p>
          <Figure n="54-3" title="原則を適用する3つの目的と、主に対応する原則" caption="この部の分類。">
            <PurposesFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'oop-basics',
      title: 'カプセル化・ポリモーフィズム・継承とコンポジション',
      body: (
        <>
          <p>
            <Term en="object-oriented programming">オブジェクト指向</Term>は、データと、そのデータを扱う処理をオブジェクトにまとめ、オブジェクトどうしがメソッドを呼び合ってプログラムを組み立てる考え方です。この部の「設計・責務分離」と「抽象化・依存関係」の原則の多くは、オブジェクト指向の3つの考え方を前提にしています。カプセル化、ポリモーフィズム、継承とコンポジションです。ここでは Ruby 4.0.9 で動かした短い例で3つを確かめ、それぞれを詳しく扱う章を示します。
          </p>
          <h3>カプセル化</h3>
          <p>
            <Term en="encapsulation">カプセル化</Term>は、データと、そのデータについての規則を守る処理を1つのクラスにまとめ、外からは公開したメソッドを通してだけ変えられるようにすることです。
          </p>
          <Code
            lang="ruby"
            code={`
class Wallet
  attr_reader :balance

  def initialize(balance) = @balance = balance

  def pay(amount)
    raise ArgumentError, "残高が足りません" if amount > @balance
    @balance -= amount
  end
end

wallet = Wallet.new(1000)
wallet.pay(300)                              # => 700
wallet.pay(5000)                             # => ArgumentError: 残高が足りません
wallet.balance = -1                          # => NoMethodError: undefined method 'balance=' for an instance of Wallet
wallet.instance_variable_set(:@balance, -1)  # => -1
`}
          />
          <p>
            <code>pay</code> は「残高を超えて支払えない」という規則を確かめてから残高を減らします。残高を書き換えるメソッド（<code>balance=</code>）は定義していないので、外のコードが <code>wallet.balance = -1</code> と書くと NoMethodError になりました。ただし、最後の行のように <code>instance_variable_set</code> を使うと中のデータを直接変えられます。Ruby のカプセル化は決めたメソッド以外から状態を変えないという取り決めとして守るものです。
          </p>
          <p>
            Active Record のモデルでは列ごとに書き込みのメソッドが public で作られます。残高のような列をどう守るかは <ChapterLink n={71} /> で扱います。変わるかもしれない判断をモジュールの中に隠す情報隠蔽（<ChapterLink n={73} />）、ほかのオブジェクトの内部をたどらないデメテルの法則（<ChapterLink n={74} />）、状態を聞いて外で判断せずにオブジェクトに処理を頼む Tell, Don’t Ask（<ChapterLink n={77} />）も、カプセル化と関係の深い原則です。
          </p>
          <h3>ポリモーフィズムとダックタイピング</h3>
          <p>
            <Term en="polymorphism">ポリモーフィズム</Term>（多態性）は、同じ名前のメソッドを呼んでも、受け取ったオブジェクトのクラスに応じて違う処理が動くことです。呼び出す側は相手のクラスで処理を分けません。
          </p>
          <Code
            lang="ruby"
            code={`
class Card
  def charge(amount) = "カードで #{amount} 円を決済"
end

class BankTransfer
  def charge(amount) = "振込先を案内（#{amount} 円）"
end

def checkout(payment, amount) = payment.charge(amount)

[Card.new, BankTransfer.new].map { |m| checkout(m, 1200) }
# => ["カードで 1200 円を決済", "振込先を案内（1200 円）"]
Card.superclass             # => Object
checkout(Object.new, 1200)  # => NoMethodError: undefined method 'charge' for an instance of Object
`}
          />
          <p>
            <code>checkout</code> は <code>payment.charge</code> を呼ぶだけで、Card か BankTransfer かを調べていません。Card と BankTransfer に共通の親クラスは無く（<code>Card.superclass</code> は Object）、どのメソッドを持つべきかを宣言する仕組み（Java のインターフェースなど）も使っていません。Ruby はメソッドを呼ぶときに相手のクラスを確かめず、そのメソッドに応答するオブジェクトなら受け付けます。この書き方を<Term en="duck typing">ダックタイピング</Term>と呼びます。charge を持たないオブジェクトを渡すと、呼んだ時点で NoMethodError になりました。
          </p>
          <p>
            支払い方法を足すときに checkout を書き換えずに済むのは、ポリモーフィズムを使っているからです（OCP、<ChapterLink n={64} />）。一方、「charge は金額を受け取って結果を返す」という約束はコードのどこにも書かれていないので、新しいクラスが約束を破っても、実行するまで分かりません。サブクラスが親クラスの約束を守ることは LSP（<ChapterLink n={65} />）、相手に求めるメソッドを小さく保つことは ISP（<ChapterLink n={66} section="rails" />）、具体的なクラスではなく取り決めに依存させることは DIP（<ChapterLink n={67} />）で扱います。
          </p>
          <h3>継承とコンポジション</h3>
          <p>
            <Term en="inheritance">継承</Term>は、サブクラスが親クラスのメソッドを引き継ぎ、必要なメソッドだけを上書きする仕組みです。<Term en="composition">コンポジション</Term>は、オブジェクトがほかのオブジェクトを部品として持ち、仕事の一部をその部品に任せる（委譲する）作り方です。同じ「至急の SMS 通知」を2通りで作りました。
          </p>
          <Code
            lang="ruby"
            code={`
# 継承：親クラスの notify を引き継ぎ、format だけを上書きする
class Notifier
  def notify(user, text) = deliver(user, format(text))
  def format(text) = text
end

class SmsNotifier < Notifier
  def deliver(user, body) = "SMS → #{user}: #{body}"
end

class UrgentSmsNotifier < SmsNotifier
  def format(text) = "【至急】#{text}"
end

UrgentSmsNotifier.new.notify("佐藤", "在庫が切れました")
# => "SMS → 佐藤: 【至急】在庫が切れました"
UrgentSmsNotifier.ancestors.take(3)   # => [UrgentSmsNotifier, SmsNotifier, Notifier]

# コンポジション：送り方（channel）と書式（formatter）を部品として受け取る
class SmsChannel
  def deliver(user, body) = "SMS → #{user}: #{body}"
end

class MailChannel
  def deliver(user, body) = "メール → #{user}: #{body}"
end

class Notification
  def initialize(channel:, formatter: ->(text) { text })
    @channel = channel
    @formatter = formatter
  end

  def notify(user, text) = @channel.deliver(user, @formatter.call(text))
end

urgent = ->(text) { "【至急】#{text}" }
Notification.new(channel: SmsChannel.new, formatter: urgent).notify("佐藤", "在庫が切れました")
# => "SMS → 佐藤: 【至急】在庫が切れました"
Notification.new(channel: MailChannel.new, formatter: urgent).notify("佐藤", "在庫が切れました")
# => "メール → 佐藤: 【至急】在庫が切れました"
`}
          />
          <p>
            継承の UrgentSmsNotifier は SmsNotifier と Notifier の実装を引き継いで format だけを上書きしているので、書くコードは少なく済みます。その代わり、親の notify が format と deliver を呼ぶ順序を前提にしているので、親クラスを直すとすべてのサブクラスに影響します。至急のメールを送るには UrgentMailNotifier がもう1つ要り、送り方と書式の組み合わせの数だけクラスが増えます。
          </p>
          <p>
            コンポジションの Notification は送り方と書式を部品として受け取るので、組み合わせはオブジェクトを作るときに選べます。至急のメールもクラスを足さずに MailChannel と urgent を渡して作れました。部品に求めるのは deliver や call に応答することだけで、ここでもダックタイピングを使っています。
          </p>
          <p>
            継承が向くのは、サブクラスを親クラスの代わりにどこで使っても約束が保たれる場合です。Rails の STI（単一テーブル継承）でサブクラスが親の約束を破る例は LSP（<ChapterLink n={65} />）で、継承の階層が増える問題と、モジュールの include（Rails の concern）を含めた3つの方法の比べ方は Composition over Inheritance（<ChapterLink n={72} />）で扱います。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>考え方</th>
                  <th>守りたいこと</th>
                  <th>詳しく扱う章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>カプセル化</td>
                  <td>データについての規則を、データを持つクラスの中で守る</td>
                  <td><ChapterLink n={71} />・<ChapterLink n={73} />・<ChapterLink n={74} />・<ChapterLink n={77} /></td>
                </tr>
                <tr>
                  <td>ポリモーフィズム（ダックタイピング）</td>
                  <td>呼び出す側が相手のクラスで処理を分けない</td>
                  <td><ChapterLink n={64} />・<ChapterLink n={65} />・<ChapterLink n={66} />・<ChapterLink n={67} /></td>
                </tr>
                <tr>
                  <td>継承とコンポジション</td>
                  <td>実装を使い回すときに、クラスどうしを強く結び付けない</td>
                  <td><ChapterLink n={72} />・<ChapterLink n={65} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'catalog',
      title: '36の原則と5つのカテゴリ',
      body: (
        <>
          <p>この部では36の原則を次の5つのカテゴリに分け、1つの原則を1つの章で扱います。</p>
          <ol>
            <li>シンプルさ・可読性：コードを単純に、読んで予想できるように保つ原則</li>
            <li>設計・責務分離：クラスやモジュールにどの仕事を持たせ、どう分けるかの原則（SOLID の5つを含む）</li>
            <li>抽象化・依存関係：何を隠し、どの向きに依存させるかの原則</li>
            <li>正しさ・信頼性：不正な状態や障害からデータとサービスを守る原則</li>
            <li>変更容易性・運用：コードを変え続け、本番で動かし続けるための原則</li>
          </ol>
          <p>
            図 54-4 はこの部の章の一覧です。章の欄のリンクから、それぞれの章へ移動できます。題材の欄はその章で動かすコードの場面です。どの章も原則に反したコードを動かして問題を確かめるところから始まるので、気になる原則の章から読んでもかまいません。
          </p>
          <Figure n="54-4" title="36の原則と5つのカテゴリ" caption="章の欄を選ぶと、その章へ移動する。最後の行は原則同士のトレードオフを比べる終章。">
            <CatalogTable />
          </Figure>
          <p>
            いくつかの原則は本書のほかの章でも扱っています。たとえば Functional Core, Imperative Shell は <ChapterLink n={45} />、冪等性は <ChapterLink n={52} /> と <ChapterLink n={18} section="idempotency" />、原子性は <ChapterLink n={38} /> と <ChapterLink n={15} /> で、実装を詳しく説明しました。この部の章では原則のための場面とコードを改めて示したうえで、詳しい実装はそれらの章を案内します。
          </p>
          <h3>コードの症状から原則の章を引く</h3>
          <p>コードを書いていて次のような症状に気付いたら、対応する章を読んでください。症状があっても、原則を当てはめるべきとは限りません。各章の「当てはめすぎたとき」の節で、判断の目安を示しています。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>症状</th>
                  <th>章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>小さな要件のために、設定ファイルや汎用の仕組みを作り込んでいる</td>
                  <td>
                    <ChapterLink n={57} />
                  </td>
                </tr>
                <tr>
                  <td>まだ使わない機能のための引数やクラスが残っている</td>
                  <td>
                    <ChapterLink n={58} />
                  </td>
                </tr>
                <tr>
                  <td>同じ業務の規則（税率・端数・送料など）が複数の場所に書かれている</td>
                  <td>
                    <ChapterLink n={59} />
                  </td>
                </tr>
                <tr>
                  <td>共通化したメソッドにフラグの引数が増え、呼び出し元ごとに分岐している</td>
                  <td>
                    <ChapterLink n={60} />
                  </td>
                </tr>
                <tr>
                  <td>メソッド名から予想される動作と、実際の動作が違う</td>
                  <td>
                    <ChapterLink n={61} />
                  </td>
                </tr>
                <tr>
                  <td>default_scope やコールバックが、知らないうちに結果や副作用を変える</td>
                  <td>
                    <ChapterLink n={62} />
                  </td>
                </tr>
                <tr>
                  <td>1つのクラスが、別々の人（経理・CS など）の要望で何度も書き換えられる</td>
                  <td>
                    <ChapterLink n={63} />
                  </td>
                </tr>
                <tr>
                  <td>種類を1つ足すたびに、同じ形の case 文を何か所も直す</td>
                  <td>
                    <ChapterLink n={64} />
                  </td>
                </tr>
                <tr>
                  <td>サブクラスに置き換えると、呼び出し元が例外や想定外の値を受け取る</td>
                  <td>
                    <ChapterLink n={65} />
                  </td>
                </tr>
                <tr>
                  <td>取り決めに使わないメソッドが多く、NotImplementedError の実装が並ぶ</td>
                  <td>
                    <ChapterLink n={66} />
                  </td>
                </tr>
                <tr>
                  <td>業務の処理が外部の SDK を直接呼び、SDK の更新で業務のコードを直す</td>
                  <td>
                    <ChapterLink n={67} />
                  </td>
                </tr>
                <tr>
                  <td>1つのアクションに権限・検証・保存・表示の整形が混ざっている</td>
                  <td>
                    <ChapterLink n={68} />
                  </td>
                </tr>
                <tr>
                  <td>同じ概念の計算が、ヘルパー・サービス・モデルに散らばっている</td>
                  <td>
                    <ChapterLink n={69} />
                  </td>
                </tr>
                <tr>
                  <td>あるモデルの列の名前を変えると、関係の薄いモジュールまで壊れる</td>
                  <td>
                    <ChapterLink n={70} />
                  </td>
                </tr>
                <tr>
                  <td>属性を外から update で直接書き換えられ、不正な値になる</td>
                  <td>
                    <ChapterLink n={71} />
                  </td>
                </tr>
                <tr>
                  <td>組み合わせごとにサブクラスが増え続ける</td>
                  <td>
                    <ChapterLink n={72} />
                  </td>
                </tr>
                <tr>
                  <td>変わりうる判断（業者の選び方など）を、呼び出し側が知っている</td>
                  <td>
                    <ChapterLink n={73} />
                  </td>
                </tr>
                <tr>
                  <td>a.b.c.d のように関連を長くたどり、nil のエラーや N+1 が起きる</td>
                  <td>
                    <ChapterLink n={74} />
                  </td>
                </tr>
                <tr>
                  <td>多くのクラスが使う共通のクラスが、変わりやすい設定に依存している</td>
                  <td>
                    <ChapterLink n={75} />
                  </td>
                </tr>
                <tr>
                  <td>共通化したクラスにオプションが増え、1つの変更が別の利用者を壊す</td>
                  <td>
                    <ChapterLink n={76} />
                  </td>
                </tr>
                <tr>
                  <td>オブジェクトの状態を外で調べて判断する処理が、何か所にもある</td>
                  <td>
                    <ChapterLink n={77} />
                  </td>
                </tr>
                <tr>
                  <td>計算のテストに、DB のレコードや時刻の固定が必要になる</td>
                  <td>
                    <ChapterLink n={78} />
                  </td>
                </tr>
                <tr>
                  <td>設定の抜けや不正な値に、本番で初めて気づく</td>
                  <td>
                    <ChapterLink n={79} />
                  </td>
                </tr>
                <tr>
                  <td>メソッドに渡してはいけない値が渡され、データがずれてから気づく</td>
                  <td>
                    <ChapterLink n={80} />
                  </td>
                </tr>
                <tr>
                  <td>ありえない列の組み合わせのレコードが DB にある</td>
                  <td>
                    <ChapterLink n={81} />
                  </td>
                </tr>
                <tr>
                  <td>外部から受け取ったデータの欠けや形式の違いで、500 が続く</td>
                  <td>
                    <ChapterLink n={82} />
                  </td>
                </tr>
                <tr>
                  <td>ジョブの再試行やボタンの二度押しで、処理が2回行われる</td>
                  <td>
                    <ChapterLink n={83} />
                  </td>
                </tr>
                <tr>
                  <td>処理の途中で失敗すると、データの一部だけが変わる</td>
                  <td>
                    <ChapterLink n={84} />
                  </td>
                </tr>
                <tr>
                  <td>処理や DB のユーザーに、必要以上の権限がある</td>
                  <td>
                    <ChapterLink n={85} />
                  </td>
                </tr>
                <tr>
                  <td>小さな問題が直されずに残り続ける。または修正の PR が大きくなりすぎる</td>
                  <td>
                    <ChapterLink n={86} />
                  </td>
                </tr>
                <tr>
                  <td>設定の数値を変えるだけで、仕組みのコードまで直している</td>
                  <td>
                    <ChapterLink n={87} />
                  </td>
                </tr>
                <tr>
                  <td>同じ情報を2か所に持っていて、値が食い違う</td>
                  <td>
                    <ChapterLink n={88} />
                  </td>
                </tr>
                <tr>
                  <td>本番で「時々遅い」「時々失敗する」原因を調べる手段がない</td>
                  <td>
                    <ChapterLink n={89} />
                  </td>
                </tr>
                <tr>
                  <td>推測で最適化したが、速くならなかった</td>
                  <td>
                    <ChapterLink n={90} />
                  </td>
                </tr>
                <tr>
                  <td>外部サービスの1つが止まると、ページ全体が表示されない</td>
                  <td>
                    <ChapterLink n={91} />
                  </td>
                </tr>
                <tr>
                  <td>API や DB の変更で、既存の利用者やデプロイ中の旧コードが壊れる</td>
                  <td>
                    <ChapterLink n={92} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'top10',
      title: '特に重要な10原則',
      body: (
        <>
          <p>
            36の原則をすべて同時に意識しながらコードを書くことはできません。この部では次の10原則を特に重要なものとして扱います。どれも、ジョブ・外部 API・DB の権限のような特定の技術に限らず、ほとんどの変更で判断に使う原則です。最初はこの10原則の章から読むと、コードレビューでよく出る指摘を一通り理解できます。
          </p>
          <Figure n="54-5" title="特に重要な10原則" caption="番号はこの部で示す順。High Cohesion と Low Coupling は1つにまとめて数える。">
            <Top10Table />
          </Figure>
          <p>
            10原則のうち、KISS・YAGNI・AHA の3つは「余計なものを作らない」方向に働き、DRY・SRP・Encapsulation などは「構造を整える」方向に働きます。2つの方向はぶつかることがあります。たとえば SRP に沿ってクラスを分けすぎると、KISS に反して読むファイルが増えます。どちらの方向に寄せるかは、変更が実際にどこで起きているかを見て決めます。この判断の仕方は各章の「当てはめすぎたとき」の節と <ChapterLink n={93} /> で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'rails-doctrine',
      title: 'Rails の設計思想と原則',
      body: (
        <>
          <p>
            Rails には、作者の David Heinemeier Hansson（DHH）が書いた設計思想の文書 <Term en="The Rails Doctrine">Rails Doctrine</Term> があります。Rails Doctrine は Rails の設計を決めてきた考え方を9つの柱にまとめたものです
            <Ref n={1} />
            。本書では <ChapterLink n={31} section="doctrine" /> で全体を読みました。ここでは、柱の一部とこの部の原則の関係を確かめます。
          </p>
          <ul>
            <li>Optimize for programmer happiness（プログラマーの幸せを優先する）</li>
            <li>Convention over Configuration（設定より規約）</li>
            <li>The menu is omakase（構成はおまかせ）</li>
            <li>No one paradigm（1つのパラダイムに縛られない）</li>
            <li>Exalt beautiful code（美しいコードを尊ぶ）</li>
            <li>Provide sharp knives（よく切れる道具を渡す）</li>
            <li>Value integrated systems（統合されたシステムを重んじる）</li>
            <li>Progress over stability（安定より進歩）</li>
            <li>Push up a big tent（大きなテントを張る）</li>
          </ul>
          <p>
            図 54-6 は、原則との関係がはっきりしている6つの柱を、原則と線で結んだものです。実線は同じ方向を向く関係、破線はぶつかることがある関係です。
          </p>
          <Figure n="54-6" title="Rails Doctrine の柱と原則" caption="Rails Doctrine の本文をもとにした模式図。線の種類はこの部の章で扱う関係を示す。">
            <DoctrineFigure />
          </Figure>
          <h3>同じ方向を向く柱</h3>
          <p>
            Optimize for programmer happiness の節で DHH は、初期の Ruby を説明するのによく使われた「驚き最小の原則（Principle of Least Surprise）」に触れ、Rails の API も使う人の予想に沿うように作ってきたと述べています
            <Ref n={1} />
            。これは POLA（<ChapterLink n={61} />）と同じ方向です。Convention over Configuration は、主キーの名前やテーブル名とクラス名の対応のような「毎回決める必要のない決定」を規約として一度だけ決めておく考え方で、同じ決定を各所に書かない点で DRY（<ChapterLink n={59} />）と同じ方向を向きます。Value integrated systems は、システムを必要になるまで分散させないという考え方で、KISS（<ChapterLink n={57} />）と同じ方向です。
          </p>
          <h3>ぶつかることがある柱</h3>
          <p>
            Convention over Configuration は、書かなくても動く部分を増やします。たとえば <code>belongs_to :account</code> と書くだけで、外部キーが <code>account_id</code> であると決まります
            <Ref n={1} />
            。規約を知っている人にとって、これは予想どおりの動作です。一方、<code>default_scope</code> やコールバックの中に隠れた副作用は、規約ではなく個々のアプリケーションが足した暗黙の動作です。Explicit over Implicit（<ChapterLink n={62} />）は、この2つを区別して、隠れた副作用のほうを減らすよう求めます。
          </p>
          <p>
            Provide sharp knives は、モンキーパッチ（既存のクラスやメソッドを書き換えること）や concern のような強い道具を、使う人を信頼して渡すという考え方です
            <Ref n={1} />
            。強い道具はカプセル化（<ChapterLink n={71} />）で隠した内部を外から書き換えることも、暗黙の動作を増やすこともできます。Progress over stability は、Rails 自身がメジャーバージョンで後方互換性のない変更をしてでも進化を選ぶという考え方で、アプリケーションの API や DB の後方互換性（<ChapterLink n={92} />）とは逆の向きです。Rails が後方互換性を軽く見ているのではなく、フレームワークの進化と、利用者を抱えるアプリケーションの互換性では、優先する事情が違います。
          </p>
          <Callout title="Rails の規約に従うことも原則の1つの当てはめ方である">
            Rails の規約に従って書いたコードは、Rails を知っている開発者にとって読みやすく（理解しやすい）、Rails のバージョンアップにも追従しやすく（変更しやすい）なります。この部の章では、原則を当てはめるために Rails の規約から外れる書き方をするときは、その理由と代償を書きます。
          </Callout>
        </>
      ),
    },
    {
      id: 'layers',
      title: '原則・設計パターン・アーキテクチャの関係',
      body: (
        <>
          <p>
            原則と似た言葉に、設計パターンとアーキテクチャがあります。<Term en="design pattern">設計パターン</Term>は、繰り返し現れる設計の問題と、その解決の形を組にして名前を付けたものです（<ChapterLink n={39} section="what-is-pattern" />）。<Term en="software architecture">アーキテクチャ</Term>は、アプリケーション全体をどの層や境界に分けるかの決定です。図 54-7 はこの3つと Rails の機能の関係を示しています。
          </p>
          <Figure n="54-7" title="原則・設計パターン・アーキテクチャ・Rails の機能" caption="模式図。下段は DIP から始まるつながりの一例。">
            <LayersFigure />
          </Figure>
          <p>
            原則は判断の基準なので、1行のコードの書き方からアプリケーション全体の分け方まで、どの大きさにも当てはまります。ただし、原則だけではコードの形は決まりません。たとえば DIP（<ChapterLink n={67} />）は「上位の方針を具体的な実装に直接依存させない」と言いますが、そのためにどんなクラスを書くかは言いません。具体的な形の候補を示すのが Adapter（<ChapterLink n={42} />）や Dependency Injection（<ChapterLink n={40} />）のような設計パターンで、さらにアプリケーション全体で業務の中心と外部を分けるとヘキサゴナル・アーキテクチャになります（<ChapterLink n={34} section="rails-way-ddd" />）。Rails の機能には Rack ミドルウェアや lock_version のように、パターンの中心部分をすでに実装しているものがあります（<ChapterLink n={39} section="rails-map" />）。
          </p>
          <Callout title="第9部の序章の「8つの原則」との違い">
            <ChapterLink n={39} section="principles" /> には「パターンを採用するときの8つの原則」があります。こちらは、パターンを入れるかどうかを決めるための判断の手順（問題を先に確かめる、必要以上に抽象化しない、など）です。この部の36の原則はパターンを使うかどうかに関係なく、コードを書くときに使う判断の基準です。YAGNI や「継承よりコンポジション」のように、両方に出てくる考え方もあります。
          </Callout>
        </>
      ),
    },
    {
      id: 'chapter-layout',
      title: 'この部の章の構成と、コードの動かし方',
      body: (
        <>
          <h3>原則の章の節の並び</h3>
          <p>
            原則の章（<ChapterLink n={57} />〜<ChapterLink n={92} />）は、どれも同じ6つの節で構成しています。最初の節で、業務の場面と原則に反した Rails のコードを示し、動かして不具合や変更の手間を実行結果で見せます。そのあとで原則の意味と由来を説明し、直したコードを動かし、原則を当てはめすぎたときに起きることと、Rails の機能・規約との関係を示します。図 54-8 は節の並びと、どの章にも置く図です。
          </p>
          <Figure n="54-8" title="原則の章の節の並び" caption="節の見出しは章ごとに内容に合わせて変えている。右の3つの図のほかに、章ごとの図を足している。">
            <LayoutFigure />
          </Figure>
          <p>
            原則の由来は提唱した人と最初の資料（論文・書籍・記事）を示し、資料で確かめられた範囲だけを書きます。KISS や WET のように出どころがはっきりしない呼び名は、その旨を書きます。
          </p>
          <h3>図の記法</h3>
          <p>
            図は本書の凡例（<ChapterLink n={1} section="conventions" /> の図 2-7）に従って描いています。紫の箱は注目してほしい要素、緑の箱はデータ・外部のサービス・DB、破線の箱は概念上の要素や取り決めです。赤い文字は問題や失敗を表します。同時の更新・重複・途中の失敗は、時間を上から下へ進めたタイムラインの図で描きます。
          </p>
          <h3>コードを動かした環境</h3>
          <p>
            この部のコードは第9部と同じ環境（Ruby 4.0.9、Rails 8.1.4.1、MySQL 8.4.13、RSpec、Sidekiq）で動かして確かめています。アプリケーションの作り方と実行のコマンドは <ChapterLink n={39} section="sample-app" /> にまとめました。章ごとにアプリケーションを複製し、その章のマイグレーション・モデル・コントローラー・spec を足して動かしています。本文に載せたコードは動かしたファイルと同じで、長いファイルは関係する部分だけを載せています。
          </p>
          <Callout title="第9部（MSDP の設計パターン）との読む順">
            この部は、第9部の設計パターンの前に置いています。原則を先に読むと、パターンの章で「このパターンはどの原則を満たすためのものか」を考えながら読めます。反対に、具体的なパターンから読みたい場合は第9部から読み、気になった原則の章に戻ってもかまいません。
          </Callout>
        </>
      ),
    },
    {
      id: 'related-frameworks',
      title: 'Rails の設計方針、原則、MSDP をどう読むか',
      body: (
        <>
          <p>
            この部の原則は判断の基準で、クラスの形までは決めません（<ChapterLink n={56} section="layers" />）。本書にはこの基準を Rails の注文処理に当てはめるときに使う一覧が、ほかに3つあります。DHH の考え方を設計のレビューの問いにしたチェックリスト、注文処理を段階的に育てる設計から守らないと起きることと一緒に整理した20の原則、MSDP（現代の Web アプリケーションの設計上の問題に合わせて選んだ設計パターンの一覧）のパターンを採用するかを決める8つの原則です。
          </p>
          <p>
            ソフトウェア設計コースでは、レビューのチェックリストはこの章の前に読みます。20の原則と採用の8つの原則は、この部の原則を読んだ後に読む章にあるので、ここでは対応する原則だけを示し、内容は後の章で扱います。
          </p>
          <div className="table-wrap"><table>
            <thead><tr><th scope="col">参照先</th><th scope="col">注文処理で判断すること</th><th scope="col">この部で対応する原則</th><th scope="col">ソフトウェア設計コースで読む時期</th></tr></thead>
            <tbody>
              <tr><th scope="row"><ChapterLink n={31} section="review-explanation">Rails の設計を説明する観点</ChapterLink></th><td>既存のモデルやリソースに処理を置けるか。</td><td><ChapterLink n={57} />、<ChapterLink n={63} /></td><td>この章の前</td></tr>
              <tr><th scope="row"><ChapterLink n={34} section="best-practices">注文処理の設計原則20</ChapterLink></th><td>在庫の確定と通知の失敗を、どこから確認できるか。</td><td><ChapterLink n={84} />、<ChapterLink n={89} /></td><td>この部の原則の後（後の章で扱う）</td></tr>
              <tr><th scope="row"><ChapterLink n={39} section="principles">MSDP が示す採用の8原則</ChapterLink></th><td>二重請求を防ぐために、処理に冪等性キーが必要か。</td><td><ChapterLink n={58} />、<ChapterLink n={83} /></td><td>この部の原則の後（後の章で扱う）</td></tr>
            </tbody>
          </table></div>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <>
          <ul>
            <li>プログラミングの原則はコードの可読性・保守性・拡張性・信頼性を高めるための判断の基準である。守らないと動かないルールではない。</li>
            <li>最初の例では DRY と Fail Fast に反したコードで、金額の1円のずれと、保存に失敗した注文への 201 の応答が実際に起きた。YAGNI は余計な抽象化を足す提案を止める方向に働いた。</li>
            <li>原則を適用する目的は理解しやすいこと・変更しやすいこと・正しく動き続けることの3つである。多くの原則は2つ以上の目的に役立つ。</li>
            <li>原則同士はぶつかることがある（DRY と AHA、KISS と OCP、YAGNI と DIP、Fail Fast と Graceful Degradation、Encapsulation とテストのしやすさ）。どちらを優先するかは場面で決める。</li>
            <li>Rails Doctrine の柱には原則と同じ方向を向くもの（Convention over Configuration と DRY など）と、ぶつかることがあるもの（Progress over stability と後方互換性など）がある。</li>
            <li>原則は判断の基準、設計パターンは問題と解決の形、アーキテクチャはアプリケーション全体の分け方である。原則だけではコードの形は決まらない。</li>
            <li>この部の原則の章は原則に反したコードを動かして問題を確かめ、直したコードと、当てはめすぎたときに起きることを示す。</li>
          </ul>
        </>
      ),
    },
  ],
  sources: [
    {
      title: 'The Rails Doctrine',
      publisher: 'Ruby on Rails／David Heinemeier Hansson',
      url: 'https://rubyonrails.org/doctrine',
      accessed: '2026-11-21',
      note: '9つの柱の名前。Optimize for programmer happiness で Ruby の Principle of Least Surprise に触れていること、Convention over Configuration の belongs_to の例、Provide sharp knives のモンキーパッチと concern、Value integrated systems、Progress over stability の内容。',
    },
    {
      title: 'Yagni',
      publisher: 'Martin Fowler／martinfowler.com',
      url: 'https://martinfowler.com/bliki/Yagni.html',
      accessed: '2026-11-13',
      version: '2015年5月26日',
      note: 'まだ使われない機能のためのコードにかかる費用。',
    },
    {
      title: 'The Pragmatic Programmer, 20th Anniversary Edition（抜粋「DRY—The Evils of Duplication」）',
      publisher: 'The Pragmatic Bookshelf',
      url: 'https://media.pragprog.com/titles/tpp20/dry.pdf',
      accessed: '2026-11-21',
      note: 'DRY が知識の重複を対象にすること。',
    },
    {
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      publisher: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides／Addison-Wesley（InformIT の書籍ページ）',
      url: 'https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610',
      accessed: '2026-11-13',
      version: '1994年10月刊（著作権表記1995年）',
      note: '設計パターンを問題と解決の組として記述すること。',
    },
  ],
}

export default chapter
