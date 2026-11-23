import type { ReactNode } from 'react'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const GH72 = 'https://github.com/rails/rails/blob/v7.2.2.1'

/* ---------- 図 71-1 注文一覧の API の構成と、SQL が増える箇所 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="71-1"
      w={780}
      h={410}
      label="管理画面のブラウザーが GET /admin/orders を送ると、Admin::OrdersController#index が注文を100件読み、1件ずつ OrderSerializer#as_json でハッシュを作り、render json: で返す。OrderSerializer は13行目で customer.name、14行目で line_items.map、15行目で item.product.name、最後に Order#total を呼ぶ。コントローラーは MySQL に1回だけ SQL を送るが、シリアライザーは注文1件ごとに customers を1回、line_items を1回、明細の行の数だけ products を、合計の SUM を1回送る。100件を返す1回の要求で SQL は689回になり、そのうち12回はクエリキャッシュから返る。開発者が遅いと推測したのは render json: の JSON の生成の部分だった"
    >
      <Box x={20} y={42} w={170} h={56} lines={['管理画面（ブラウザー）', 'GET /admin/orders']} fs={12} subTone="muted" />
      <Arrow x1={190} y1={70} x2={228} y2={70} />
      <Box
        x={230}
        y={24}
        w={230}
        h={100}
        lines={['Admin::OrdersController#index', '1. 注文を100件読む', '2. 1件ずつハッシュを作る', '3. render json: で返す']}
        fs={12}
        bold
        subTone="muted"
      />
      <Arrow x1={460} y1={74} x2={508} y2={74} />
      <Box
        x={510}
        y={16}
        w={250}
        h={116}
        lines={['OrderSerializer#as_json', '13行目 customer.name', '14行目 line_items.map', '15行目 item.product.name', '17行目 Order#total（SUM）']}
        fs={12}
        bold
        fill="box5"
        subTone="danger"
      />
      <Arrow x1={345} y1={124} x2={345} y2={258} />
      <T x={353} y={190} fs={11} tone="muted">
        1回（注文を100件）
      </T>
      <Arrow x1={620} y1={132} x2={620} y2={258} />
      <T x={630} y={154} fs={11} tone="danger">
        注文1件ごとに
      </T>
      <T x={630} y={174} fs={11} tone="danger">
        customers 1回
      </T>
      <T x={630} y={194} fs={11} tone="danger">
        line_items 1回
      </T>
      <T x={630} y={214} fs={11} tone="danger">
        products 明細の行の数
      </T>
      <T x={630} y={234} fs={11} tone="danger">
        SUM 1回
      </T>
      <Box x={230} y={260} w={530} h={50} lines={['MySQL 8.4', 'orders・customers・line_items・products']} fs={12} bold fill="box4" subTone="muted" />
      <Box x={20} y={150} w={190} h={70} lines={['開発者の推測', 'render json: の', 'JSON の生成が遅い']} fs={12} bold dashed subTone="muted" />
      <Arrow d="M115,150 L115,110 L228,110" dashed />
      <T x={20} y={340} fs={12} tone="danger">
        ① 100件を返す1回の要求で、SQL を689回送る（そのうち12回はクエリキャッシュから返る）
      </T>
      <T x={20} y={362} fs={12} tone="danger">
        ② SQL を送る行はシリアライザーとモデルの中にあり、コントローラーには注文を読む1回しか書かれていない
      </T>
      <T x={20} y={384} fs={12} tone="muted">
        ③ 推測で直したのは、render json: の部分（JSON の生成）だった
      </T>
    </Svg>
  )
}

/* ---------- 図 71-3 計測の手順 ---------- */
function StepsFigure() {
  const top: { x: number; title: string; sub: string }[] = [
    { x: 20, title: '① 症状を数にする', sub: 'どの要求が何 ms か・目標' },
    { x: 210, title: '② 基準値を測る', sub: '本番の設定・暖機・50回' },
    { x: 400, title: '③ 内訳を見る', sub: 'SQL・Views・その他' },
    { x: 590, title: '④ 仮説を確かめる', sub: 'SQL のログの呼び出し元' },
  ]
  return (
    <Svg
      id="71-3"
      w={780}
      h={330}
      label="計測の手順を7つの箱で示す。上の段は左から、①症状を数にする（どの要求が何 ms かと目標）、②基準値を測る（本番の設定、暖機、50回）、③内訳を見る（SQL、Views、その他）、④仮説を確かめる（SQL のログの呼び出し元）。下の段は右から左へ、⑤1か所だけ直す（1回に1つの変更）、⑥同じ条件で測り直す（直す前のコードと交互に比べる）、目標に届いたかの判断。届かなければ③に戻り、届けば⑦テストで固定する（SQL の回数を確かめる spec）。下には、⑥で効果を測れなかった変更は戻すと書いている"
    >
      {top.map((b) => (
        <Box key={b.x} x={b.x} y={24} w={170} h={64} lines={[b.title, b.sub]} fs={12} bold subTone="muted" />
      ))}
      {[190, 380, 570].map((x) => (
        <Arrow key={x} x1={x} y1={56} x2={x + 18} y2={56} />
      ))}
      <Arrow x1={675} y1={88} x2={675} y2={148} />
      <Box x={600} y={150} w={160} h={64} lines={['⑤ 1か所だけ直す', '1回に1つの変更']} fs={12} bold fill="box5" subTone="muted" />
      <Arrow x1={600} y1={182} x2={572} y2={182} />
      <Box x={410} y={150} w={160} h={64} lines={['⑥ 同じ条件で測り直す', '直す前と交互に比べる']} fs={12} bold fill="box5" subTone="muted" />
      <Arrow x1={410} y1={182} x2={382} y2={182} />
      <Box x={220} y={150} w={160} h={64} lines={['目標に届いたか', 'この章では P95 100ms']} fs={12} bold dashed subTone="muted" />
      <Arrow d="M300,150 L300,118 L485,118 L485,90" accent />
      <T x={308} y={108} fs={11} tone="acc">
        届かない → ③ に戻る
      </T>
      <Arrow x1={220} y1={182} x2={172} y2={182} accent />
      <T x={196} y={170} fs={11} anchor="middle" tone="acc">
        届いた
      </T>
      <Box x={20} y={150} w={150} h={64} lines={['⑦ テストで固定する', 'SQL の回数の spec']} fs={12} bold subTone="muted" />
      <T x={20} y={270} fs={12} tone="danger">
        ⑥ で効果を測れなかった変更は戻す（この章では、推測で入れた JSON.generate）
      </T>
      <T x={20} y={294} fs={12} tone="muted">
        ① と ② は利用者が待つ時間（curl の時間）で、③ と ④ は Rails のログで見る。④ の開発環境のログの時間は使わない
      </T>
    </Svg>
  )
}

/* ---------- 図 71-4 直す前の1回の要求の時間の内訳 ---------- */
const breakdownRows: { label: string; sub: string; sql: number; views: number; other: number }[] = [
  { label: 'v0 直す前', sub: '206ms', sql: 108.6, views: 0.7, other: 96.7 },
  { label: 'v1 JSON.generate', sub: '194ms', sql: 101.9, views: 0, other: 92.1 },
]

function BreakdownFigure() {
  const x0 = 170
  const k = 540 / 210
  const bars: ReactNode[] = []
  for (let i = 0; i < breakdownRows.length; i++) {
    const r = breakdownRows[i]
    const y = 50 + i * 80
    const wSql = r.sql * k
    const wViews = Math.max(3, r.views * k)
    const wOther = r.other * k
    bars.push(
      <g key={r.label}>
        <T x={20} y={y + 14} fs={12} bold>
          {r.label}
        </T>
        <T x={20} y={y + 34} fs={11} tone="muted">
          {`全体 ${r.sub}（中央値）`}
        </T>
        <rect x={x0} y={y} width={wSql} height={28} fill="var(--fig-box4)" stroke="var(--fig-line)" />
        <T x={x0 + wSql / 2} y={y + 14} fs={11} anchor="middle">
          {`DB（SQL）${r.sql}ms`}
        </T>
        {r.views > 0 && <rect x={x0 + wSql} y={y} width={wViews} height={28} fill="var(--fig-box5)" stroke="var(--fig-danger)" strokeWidth={2} />}
        <rect x={x0 + wSql + (r.views > 0 ? wViews : 0)} y={y} width={wOther} height={28} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <T x={x0 + wSql + wOther / 2} y={y + 14} fs={11} anchor="middle">
          {`その他（Ruby）約${r.other}ms`}
        </T>
        <T x={x0 + wSql} y={y + 46} fs={11} anchor="middle" tone="danger">
          {r.views > 0 ? `↑ Views（JSON の生成）${r.views}ms` : '↑ Views 0.0ms（JSON.generate は「その他」に入る）'}
        </T>
      </g>,
    )
  }
  return (
    <Svg
      id="71-4"
      w={780}
      h={300}
      label="Completed の行の50回の中央値から作った横棒。直す前の v0 は全体206ms のうち、SQL（ActiveRecord）が108.6ms、Views が0.7ms、残りのその他（Ruby の処理など）が約96.7ms。Views には render json: の中の JSON の生成が入る。推測で直した v1 は全体194ms のうち、SQL が101.9ms、Views が0.0ms、その他が約92.1ms で、JSON.generate は render より前に動くので、その時間はその他に入る。下の枠は、JSON の生成だけを200回測った中央値で、Active Support の to_json が0.23ms、JSON.generate が0.22ms"
    >
      <T x={x0} y={24} fs={12} bold>
        1回の要求の時間（Completed の行の Views・ActiveRecord と、残りの時間）
      </T>
      {bars}
      <Box
        x={170}
        y={214}
        w={540}
        h={60}
        lines={['JSON の生成だけを測った値（200回の中央値）', 'Active Support の to_json 0.23ms ／ JSON.generate 0.22ms']}
        fs={12}
        bold
        dashed
        subTone="danger"
      />
    </Svg>
  )
}

/* ---------- 図 71-5 直す前と後の SQL の回数と応答時間 ---------- */
type Kind = 'orders' | 'customers' | 'line_items' | 'products' | 'sum'
const kindFill: Record<Kind, string> = {
  orders: 'var(--fig-bg)',
  customers: 'var(--fig-box)',
  line_items: 'var(--fig-box2)',
  products: 'var(--fig-box3)',
  sum: 'var(--fig-box5)',
}
const kindLabel: Record<Kind, string> = { orders: 'orders', customers: 'customers', line_items: 'line_items', products: 'products', sum: 'SUM' }
const versions: { label: string; counts: [Kind, number][]; total: number; p50: number; p95: number }[] = [
  {
    label: 'v0 直す前',
    counts: [['orders', 1], ['customers', 100], ['line_items', 100], ['products', 388], ['sum', 100]],
    total: 689,
    p50: 208.1,
    p95: 265.1,
  },
  {
    label: 'v2 includes',
    counts: [['orders', 1], ['customers', 1], ['line_items', 1], ['products', 1], ['sum', 100]],
    total: 104,
    p50: 56.6,
    p95: 98.6,
  },
  {
    label: 'v3 合計も Ruby で',
    counts: [['orders', 1], ['customers', 1], ['line_items', 1], ['products', 1]],
    total: 4,
    p50: 16.4,
    p95: 43.0,
  },
]

function BeforeAfterFigure() {
  const qx = 150
  const qk = 300 / 700
  const tx = 490
  const tk = 180 / 300
  const lx = 690
  const rows: ReactNode[] = []
  for (let i = 0; i < versions.length; i++) {
    const v = versions[i]
    const y = 64 + i * 78
    const segs: ReactNode[] = []
    let x = qx
    for (const [kind, n] of v.counts) {
      const w = Math.max(2, n * qk)
      segs.push(<rect key={kind} x={x} y={y} width={w} height={26} fill={kindFill[kind]} stroke="var(--fig-line)" />)
      x += w
    }
    rows.push(
      <g key={v.label}>
        <T x={20} y={y + 13} fs={12} bold>
          {v.label}
        </T>
        {segs}
        <T x={x + 6} y={y + 13} fs={11} tone={v.total > 100 ? 'danger' : undefined}>
          {`${v.total}回`}
        </T>
        <rect x={tx} y={y - 2} width={v.p50 * tk} height={14} fill="var(--fig-box4)" stroke="var(--fig-line)" />
        <rect x={tx} y={y + 16} width={v.p95 * tk} height={14} fill="none" stroke="var(--fig-line)" strokeDasharray="4 3" />
        <T x={lx} y={y + 5} fs={10}>
          {`P50 ${v.p50.toFixed(1)}ms`}
        </T>
        <T x={lx} y={y + 23} fs={10} tone={v.p95 > 100 ? 'danger' : 'muted'}>
          {`P95 ${v.p95.toFixed(1)}ms`}
        </T>
      </g>,
    )
  }
  const legend: ReactNode[] = []
  const kinds: Kind[] = ['orders', 'customers', 'line_items', 'products', 'sum']
  for (let i = 0; i < kinds.length; i++) {
    const lx = 20 + i * 96
    legend.push(
      <g key={kinds[i]}>
        <rect x={lx} y={316} width={14} height={14} fill={kindFill[kinds[i]]} stroke="var(--fig-line)" />
        <T x={lx + 20} y={323} fs={11}>
          {kindLabel[kinds[i]]}
        </T>
      </g>,
    )
  }
  return (
    <Svg
      id="71-5"
      w={780}
      h={350}
      label="左は1回の要求で送る SQL の回数を、テーブルの種類ごとに積み上げた横棒。直す前の v0 は orders 1回、customers 100回、line_items 100回、products 388回、SUM 100回の合計689回。includes を足した v2 は orders、customers、line_items、products が1回ずつで、SUM の100回が残り合計104回。合計も Ruby で計算した v3 は4回。右は curl で測った応答時間の P50（塗りの棒）と P95（破線の棒）。v0 は P50 208.1ms、P95 265.1ms、v2 は P50 56.6ms、P95 98.6ms、v3 は P50 16.4ms、P95 43.0ms。P95 の目標の100ms に縦の破線を引いている"
    >
      <T x={qx} y={30} fs={12} bold>
        1回の要求で送る SQL（回）
      </T>
      <T x={tx} y={30} fs={12} bold>
        応答時間（curl、50回）
      </T>
      <line x1={tx + 100 * tk} y1={44} x2={tx + 100 * tk} y2={290} stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <T x={tx + 100 * tk + 4} y={296} fs={10} tone="acc">
        目標 P95 100ms
      </T>
      {rows}
      {legend}
    </Svg>
  )
}

/* ---------- 図 71-6 計測を待つ変更と、待たずに直す変更 ---------- */
function OveruseFigure() {
  return (
    <Svg
      id="71-6"
      w={780}
      h={440}
      label="横軸は原因の確かさで、左は推測だけ、右はコードの形やテストの数で確か。縦軸は直したときに増えるもので、下はほとんど増えない、上はコード・挙動の違い・確かめる手間が増える。右下は計測を待たずに直す変更で、N+1 に includes を足す（v3、v6）、外部キーの索引、find_each。右上は計測で効果と目標を確かめてから直す変更で、キャッシュ、集計した値を持つ列や表、非同期の処理。左下は試して前後を測り、効果がなければ戻す小さな変更。左上は計測するまで直さない変更で、この章の JSON の生成の書き換え（日時の形式が変わった）、手書きの SQL。右下から左上への青い矢印と赤い文字は、v5 が原因の確かな N+1 を、計測するまで直さない変更として扱ったことを示す"
    >
      <T x={20} y={22} fs={11} tone="muted">
        直したときに増えるもの（コード・挙動の違い・確かめる手間）
      </T>
      <T x={20} y={60} fs={11} tone="muted">
        増える
      </T>
      <T x={20} y={330} fs={11} tone="muted">
        ほとんど
      </T>
      <T x={20} y={346} fs={11} tone="muted">
        増えない
      </T>
      <Arrow x1={84} y1={370} x2={84} y2={40} />
      <Arrow x1={84} y1={370} x2={760} y2={370} />
      <line x1={422} y1={44} x2={422} y2={366} stroke="var(--fig-line)" strokeOpacity={0.3} strokeDasharray="4 4" />
      <line x1={88} y1={206} x2={756} y2={206} stroke="var(--fig-line)" strokeOpacity={0.3} strokeDasharray="4 4" />
      <Box x={100} y={56} w={306} h={120} lines={['計測するまで直さない', 'JSON の生成の書き換え（この章の v1）', '日時の形式が変わった', '手書きの SQL・独自のキャッシュ']} fs={12} bold dashed subTone="danger" />
      <Box x={440} y={56} w={306} h={120} lines={['計測で効果と目標を確かめてから直す', 'キャッシュ（Rails.cache）', '集計した値を持つ列や表', 'ジョブで後から作る']} fs={12} bold subTone="muted" />
      <Box x={100} y={224} w={306} h={120} lines={['試して前後を測り、', '効果がなければ戻す', '処理の順番の入れ替えなど、', '小さく戻しやすい変更']} fs={12} bold subTone="muted" />
      <Box x={440} y={224} w={306} h={120} lines={['計測を待たずに直す', 'N+1 に includes（v3・v6）', '検索や結合に使う列の索引', '全件を読む each → find_each']} fs={12} bold fill="box5" accent subTone="muted" />
      <Arrow d="M560,224 L560,200 L330,200 L330,178" accent />
      <T x={445} y={189} fs={11} tone="danger">
        当てはめすぎ（v5）
      </T>
      <T x={100} y={392} fs={11} tone="muted">
        推測だけ
      </T>
      <T x={422} y={392} fs={11} anchor="middle">
        原因の確かさ
      </T>
      <T x={756} y={392} fs={11} anchor="end" tone="muted">
        コードの形やテストの数で確か
      </T>
      <T x={20} y={426} fs={11} tone="danger">
        v5：SQL の回数のテストが件数で増えると示した N+1 を、本番で遅いと測れるまで直さず、切り替えと計測のコードを足した
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 90,
  part: 8,
  title: 'Measure Before Optimizing：遅い一覧画面を、推測ではなく計測して直す',
  summary:
    '管理画面の注文一覧の API が遅いという報告に対して、JSON の生成が遅いと推測して書き換えても速くならず、日時の形式だけが変わった場面から始めます。Knuth の1974年の論文で原則の由来を確かめ、本番の設定での応答時間・Completed の行の内訳・開発環境の SQL のログの順に測って N+1 のクエリを見つけ、1か所ずつ直して P50 を 208ms から 16ms にします。最後に、計測を理由に原因のわかっている N+1 を後回しにしたコードを動かし、計測を待つ変更と待たずに直す変更の分け方を示します。',
  goals: [
    'Measure Before Optimizing の意味と、Knuth の論文の「早すぎる最適化」の一節が何を勧め、何を勧めていないかを説明できる',
    '利用者が待つ時間を本番の設定で繰り返し測り、P50 と P95 で表し、直す前と後のコードを交互に要求して比べられる',
    'Completed の行の Views・ActiveRecord と残りの時間から、遅さが SQL・JSON の生成・Ruby の処理のどこにあるかを判断できる',
    '開発環境の SQL のログの ↳ の行から N+1 のクエリを送っている行を特定し、1か所ずつ直して測り直せる',
    'SQL の回数が件数によらないことを request spec で確かめ、時間ではなく回数で再発を止められる',
    '計測を待たずに直してよい変更と、計測で効果を確かめてから入れる変更を、原因の確かさと増えるものの2つで分けられる',
  ],
  prerequisites: [13, 22, 89],
  sections: [
    {
      id: 'scene',
      title: '注文一覧の API が遅く、JSON の生成を推測で直しても速くならない',
      body: (
        <>
          <p>
            この章では、管理画面の注文一覧が遅いという報告を例に、Measure Before Optimizing（最適化の前の計測）を扱います。<Term en="optimization">最適化</Term>は、プログラムの結果を変えずに、処理の速さやメモリーの使用量を改善する変更です。まず、遅い原因を推測で決めて直したコードを動かし、時間がほとんど変わらず、応答の形式だけが変わったことを確かめます。
          </p>
          <h3>そもそも注文一覧の API は何を返すのか</h3>
          <p>
            EC サイトの管理画面には、出荷の担当者が新しい注文から順に確かめる「注文一覧」のページがあります。このページは JavaScript で画面を作り、表示するデータを <code>GET /admin/orders?page=1</code> で受け取ります。1ページは100件で、注文ごとに注文番号・注文日時・状態・顧客名・明細（商品名・数量・単価）・合計金額を返します。次は応答の先頭の1件です。
          </p>
          <Code
            lang="json"
            title="実行結果（GET /admin/orders?page=1 の応答の先頭。明細は2行目まで）"
            code={`
{
  "page": 1,
  "orders": [
    {
      "id": 6000,
      "number": "A06000",
      "ordered_at": "2026-09-02T12:23:00.000+09:00",
      "status": "paid",
      "customer_name": "顧客303",
      "items": [
        { "product_name": "商品1094", "quantity": 1, "unit_price": 2600 },
        { "product_name": "商品475", "quantity": 2, "unit_price": 400 },
        …（明細は全部で5行）
      ],
      "total": 12000
    },
    …（全部で100件）
  ]
}
`}
          />
          <p>
            1件の注文を返すには、orders のほかに customers（顧客）・line_items（明細）・products（商品）のテーブルが要ります。デモのデータは顧客2000人・商品2000点・注文6000件・明細24,052行で、db/seeds.rb で乱数の種を固定して毎回同じものを作ります。
          </p>
          <h3>直す前のコード</h3>
          <p>注文の合計金額は Order のメソッドで明細から計算します。</p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直す前）"
            code={`
class Order < ApplicationRecord
  belongs_to :customer
  has_many :line_items

  # 合計金額（税込みの単価 × 数量の合計）
  def total
    line_items.sum("quantity * unit_price")
  end
end
`}
          />
          <p>1件分のハッシュを作るクラスと、API のコントローラーです。</p>
          <Code
            lang="ruby"
            title="app/serializers/order_serializer.rb"
            code={`
# 注文一覧の1行分のハッシュを作る
class OrderSerializer
  def initialize(order)
    @order = order
  end

  def as_json(*)
    {
      id: @order.id,
      number: @order.number,
      ordered_at: @order.ordered_at,
      status: @order.status,
      customer_name: @order.customer.name,
      items: @order.line_items.map do |item|
        { product_name: item.product.name, quantity: item.quantity, unit_price: item.unit_price }
      end,
      total: @order.total
    }
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/admin/orders_controller.rb（直す前）"
            code={`
module Admin
  # 管理画面の注文一覧が呼ぶ API（新しい順に100件ずつ）
  class OrdersController < ApplicationController
    PER_PAGE = 100

    def index
      page = params.fetch(:page, 1).to_i
      orders = Order.order(id: :desc).limit(PER_PAGE).offset((page - 1) * PER_PAGE)
      render json: { page:, orders: orders.map { |order| OrderSerializer.new(order).as_json } }
    end
  end
end
`}
          />
          <p>
            <code>render json:</code> にハッシュを渡すと、Rails はそのハッシュの <code>to_json</code> を呼んで JSON の文字列にし、応答の本文にします<Ref n={5} />。この <code>to_json</code> は Active Support が定義したもので、値ごとに <code>as_json</code> を呼びます。注文日時（ActiveSupport::TimeWithZone）は、as_json で <code>"2026-09-02T12:23:00.000+09:00"</code> の形（ISO 8601。秒の小数は3桁）になります<Ref n={7} />。
          </p>
          <Figure n="71-1" title="注文一覧の API の構成と、SQL が増える箇所" caption="実線は呼び出しと SQL、破線は開発者の推測（概念上の要素）が指す箇所。赤い文字は、要求1回で送る SQL が増える箇所。">
            <SceneFigure />
          </Figure>
          <p>
            図 71-1 は1回の要求で通る部品と、SQL を送る箇所を並べたものです。コントローラーに書かれている SQL は注文を読む1回だけですが、シリアライザーの中で関連（customer・line_items・product）をたどるたびに、Active Record が SQL を送ります。この段階では、開発者はまだこのことに気づいていません。
          </p>
          <h3>推測で JSON の生成を直す</h3>
          <p>
            出荷の担当者から「注文一覧のページを切り替えるたびに待たされる。注文が増えてから遅くなった」という報告が届きました。開発者は応答を見て、100件で 37,878 バイトあり、明細が入れ子になっていることに気づきました。以前に「Active Support の to_json は遅い」と聞いたこともあったので、遅い原因は JSON の生成だと考え、json の gem の <code>JSON.generate</code> で文字列を作るように書き換えました。この章で比べるコードは v0〜v6 の名前で versions/ のディレクトリに置き、<code>script/use.sh v1</code> のように名前を指定して app/ に写して使います。直す前のコードが v0、この書き換えが v1 です。
          </p>
          <Code
            lang="ruby"
            title="versions/v1/app/controllers/admin/orders_controller.rb（推測で直したコード。index の部分）"
            code={`
    def index
      page = params.fetch(:page, 1).to_i
      orders = Order.order(id: :desc).limit(PER_PAGE).offset((page - 1) * PER_PAGE)
      payload = { page:, orders: orders.map { |order| OrderSerializer.new(order).as_json } }
      # Active Support の to_json は遅いと考え、json の gem で直接文字列にする
      render json: JSON.generate(payload)
    end
`}
          />
          <p>
            <code>render json:</code> に文字列を渡すと、Rails は to_json を呼ばずに、その文字列をそのまま本文にします<Ref n={5} />。
          </p>
          <h3>変更の前と後を比べる</h3>
          <p>書き換えたあとで、既存の request spec を動かしました。</p>
          <Code
            lang="text"
            title="実行結果（v1 で bundle exec rspec spec/requests/admin_orders_spec.rb -e 'ISO 8601'）"
            code={`
  1) 管理画面の注文一覧 API 注文ごとに、日時を ISO 8601 の形式で、明細と合計を返す
     Failure/Error: expect(order["ordered_at"]).to eq "2026-11-20T09:15:00.000+09:00"

       expected: "2026-11-20T09:15:00.000+09:00"
            got: "2026-11-20 09:15:00 +0900"

1 example, 1 failure
`}
          />
          <p>
            注文日時の形式が変わりました。JSON.generate は Active Support の変換を通らず、as_json を呼びません<Ref n={6} />。TimeWithZone は as_json の代わりに to_s の文字列 <code>"2026-11-20 09:15:00 +0900"</code> になります<Ref n={7} />。管理画面の JavaScript がこの値を日時として読んでいれば、表示が崩れます。形式を元に戻すには、シリアライザーで日時を ISO 8601 の文字列にする変更が必要です。
          </p>
          <p>
            次に、v0 と v1 の速さを比べました。v0 と v1 を別々のサーバーで起動し、同じ要求を v0 → v1 の順に交互に50回ずつ送るスクリプト（script/ab.sh。中身は後の節の手順1で示します）で測りました。
          </p>
          <Code
            lang="text"
            title="実行結果（script/ab.sh v0 v1。本番の設定）"
            code={`
A（v0）の P50 202.8ms、B（v1）の P50 198.8ms（50組）
組ごとの差（B − A）の中央値 -4.4ms、B のほうが速かった組 29 / 50
`}
          />
          <p>
            P50 は、50回のうち半分の要求がその時間以内に終わった値です。v1 は v0 より、組ごとの差の中央値で 4.4ms（約2%）速く終わりましたが、v1 のほうが速かった組は50組のうち29組で、遅かった組も21組ありました。利用者が待つ約 200ms は、この書き換えの前と後でほとんど変わっていません。
          </p>
          <p>
            推測で直した結果、応答の時間はほとんど変わらず、日時の形式を直す作業が増えました。どこに時間がかかっているかを確かめないまま、直す場所を決めたからです。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'Measure Before Optimizing の意味と、Knuth の「早すぎる最適化」',
      body: (
        <>
          <h3>原則の意味</h3>
          <p>
            Measure Before Optimizing は、最適化する前に計測する原則です。推測ではなく、実際に測ったデータに基づいて改善します。ここでの<Term en="measurement">計測</Term>は、プログラムを実際に動かし、かかった時間・SQL の回数・メモリーの量などを数で記録することです。この原則には、次の2つの勧めが含まれます。
          </p>
          <ul>
            <li>直す場所は、計測で時間がかかっているとわかった所に決める。</li>
            <li>直したあとも同じ条件で測り、効果があったかを数で確かめる。効果がなければ、その変更を戻す。</li>
          </ul>
          <p>
            前の節の開発者はこの2つの勧めのどちらにも従っていませんでした。直す場所を推測で JSON の生成に決め、時間を測ったのは書き換えたあとでした。
          </p>
          <h3>由来：Knuth の1974年の論文</h3>
          <p>
            この原則の由来としてよく挙げられるのは、Donald E. Knuth の論文「Structured Programming with go to Statements」（Computing Surveys 第6巻第4号、1974年12月）です<Ref n={1} />。論文の主な題材は go to 文と構造化プログラミングで、効率（実行の速さ）を扱う節に、よく引用される一節があります。268ページの要点は次のとおりです<Ref n={1} />。
          </p>
          <ul>
            <li>プログラマーはプログラムの重要でない部分の速さを考えたり心配したりして、多くの時間を使っている。デバッグと保守を考えると、この効率への取り組みには強い悪影響がある。</li>
            <li>小さな効率のことは、およそ97%の場合は忘れるべきである。<Term en="premature optimization">早すぎる最適化</Term>は、すべての悪の根源である（premature optimization is the root of all evil）。</li>
            <li>それでも、重要な3%の機会は逃すべきではない。よいプログラマーは重要なコードを注意深く見るが、それはそのコードを特定したあとである。</li>
            <li>プログラムのどの部分が本当に重要かを前もって判断するのは、多くの場合誤りである。計測の道具を使ってきたプログラマーに共通する経験では、直感による推測は外れる。</li>
          </ul>
          <p>
            「早すぎる最適化はすべての悪の根源」の部分だけが引用されることが多いのですが、論文は最適化そのものを否定していません。小さな効率を気にするのはやめ、計測で重要な部分を特定してから、その部分を最適化するように勧めています。同じ268ページで Knuth は、簡単に得られる12%の改善は、確立した工学の分野では小さな改善とは見なされない、とも書いています<Ref n={1} />。
          </p>
          <p>
            その前の267ページには、入出力で時間が決まるのではないプログラムでは、実行時間の大部分がソースの約3%に集まるという経験が書かれています<Ref n={1} />。この章の API は、後で測ると時間の約半分が SQL の応答を待つ時間で、入出力で時間が決まる側のプログラムです。それでも、直感による推測は外れるという指摘は、そのまま当てはまりました。論文の要旨は、読みやすく正しいが効率の悪いかもしれないプログラムから始め、必要なときに体系的な変換で効率のよいプログラムにする方法を述べています<Ref n={1} />。
          </p>
          <Figure n="71-2" title="推測で直すときと、計測してから直すときの違い" caption="数値はこの章のデモを本番の設定で動かして得たもの。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">項目</th>
                    <th scope="col">推測で直す</th>
                    <th scope="col">計測してから直す</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">直す場所を決める根拠</th>
                    <td>コードの見た目、以前に聞いた話（「to_json は遅い」）</td>
                    <td>Completed の行の内訳と SQL の回数（Views 0.7ms、ActiveRecord 108.6ms、689回）</td>
                  </tr>
                  <tr>
                    <th scope="row">書き換える前に測るもの</th>
                    <td>なし</td>
                    <td>同じ条件での基準値（P50 208.1ms、P95 265.1ms）と内訳</td>
                  </tr>
                  <tr>
                    <th scope="row">直したあとの確かめ方</th>
                    <td>全体の時間だけを比べる。差が出ても、どこが変わったかはわからない</td>
                    <td>直す前のコードと交互に要求して比べ、内訳と SQL の回数も見る。SQL の回数をテストにする</td>
                  </tr>
                  <tr>
                    <th scope="row">この章の結果</th>
                    <td>組ごとの差の中央値は 4.4ms。日時の形式が変わり、テストが落ちた</td>
                    <td>P50 は 208.1ms から 16.4ms、SQL は689回から4回</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 71-2 は前の節の進め方と、次の節の進め方を並べたものです。計測してから直す進め方では、コードを書き換える前に、基準値と内訳を測ります。
          </p>
          <h3>似た原則との違い</h3>
          <ul>
            <li>
              YAGNI（<ChapterLink n={58} />）は今必要のない機能を作らない原則です。Measure Before Optimizing は、計測で必要とわかっていない最適化をしない原則で、どちらも、確かめていない推測だけを理由にコードを増やさない点が共通しています。
            </li>
            <li>
              KISS（<ChapterLink n={57} />）は不必要に複雑な実装を避ける原則です。最適化はふつう、コードを複雑にするか、挙動の違いを生みます。この章の JSON.generate も、日時の形式を変えました。計測で効果を確かめられない最適化では、KISS に反する複雑さと挙動の違いだけが残ります。
            </li>
            <li>
              Observability（<ChapterLink n={89} />）は、システムの内部の状態を外から理解できるようにする原則で、本番で計測するためのデータを出します。Measure Before Optimizing は、そのデータを使って、どこを直すかを決める原則です。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: '時間の内訳を測って N+1 を見つけ、1か所ずつ直す',
      body: (
        <>
          <h3>直す順序</h3>
          <p>v1 の書き換えは使わずに、v0 から次の順に進めました。</p>
          <ol>
            <li>症状を数にして目標を決め、本番の設定で基準値を測る</li>
            <li>Completed の行で、時間の内訳を見る</li>
            <li>仮説を立てて、開発環境の SQL のログで確かめる</li>
            <li>1か所ずつ直して、同じ条件で測り直す</li>
            <li>推測で入れた変更（v1）も、測ってから残すかを決める</li>
            <li>SQL の回数をテストで固定する</li>
          </ol>
          <Figure n="71-3" title="計測の手順" caption="①〜⑦は本文の手順と対応する（手順1が①②、手順4が⑤⑥、手順6が⑦）。青い矢印は判断のあとに進む先。">
            <StepsFigure />
          </Figure>
          <p>
            図 71-3 のように、直したあとは必ず測り直し、目標に届くまで内訳を見る所に戻ります。1回に1か所だけ直すのは、2か所を同時に直すと、どちらの変更で速くなったのかを区別できないからです。
          </p>
          <h3>手順1：症状を数にして、基準値を測る</h3>
          <p>
            「待たされる」という報告を、「GET /admin/orders?page=1 の応答に何 ms かかるか」という数に直します。Rails のガイド「Tuning Performance for Deployment」は、計測について次のように書いています<Ref n={2} />。
          </p>
          <ul>
            <li>平均の待ち時間は改善の目標によい値ではない。中央値（P50）と、遅い側の値（P95 や P99）を見る。P95 は、95%の要求がその時間以内に終わる値である。</li>
            <li>起動した直後の要求はふつう遅いので、暖機（warmup）の要求を送り、その結果は計測に入れない。</li>
            <li>Rails のログの時間は Rails が処理した時間で、アプリケーションサーバーの時間を含まないので、要求を送る側で時間を測る。</li>
            <li>本番と同じ種類のホストで測る。開発用のマシンで測った結果は、そのマシンについてしかわからない。</li>
          </ul>
          <p>
            このガイドに従い、本番の設定（<code>RAILS_ENV=production</code>。クラスを先に読み込み、YJIT が有効になる）でサーバーを起動し、curl で要求を送るスクリプトを作りました。curl の <code>{'%{time_total}'}</code> は、要求の全体にかかった秒数です<Ref n={14} />。この章のデモは手元のマシンの Docker で動かしたので、値そのものは本番のサーバーの値とは違います。比べるのは、同じマシンで測った直す前と後の値です。
          </p>
          <Code
            lang="bash"
            title="script/measure.sh"
            code={`
#!/bin/bash
# 使い方: script/measure.sh v0
# versions/<版>/app のファイルを app/ に写し、本番の設定でサーバーを起動する。
# 注文一覧の API を、暖機として20回（結果に入れない）、計測として50回、順に要求する
set -e
V=$1
cp -r versions/$V/app/. app/
rm -f log/server.log
RAILS_MAX_THREADS=1 bin/rails server -p 3000 > log/server.log 2>&1 &
APP=$!
for i in $(seq 1 60); do curl -s -o /dev/null http://localhost:3000/up && break; sleep 0.5; done
URL="http://localhost:3000/admin/orders?page=1"
for i in $(seq 1 20); do curl -s -o /dev/null "$URL"; done
for i in $(seq 1 50); do curl -s -o /dev/null -w "%{time_total}\\n" "$URL"; done > log/curl-$V.txt
curl -s "$URL" > log/body-$V.json
kill $APP; wait 2>/dev/null || true
grep Completed log/server.log | tail -51 | head -50 > log/completed-$V.txt
ruby script/summary.rb $V
`}
          />
          <p>
            最後の script/summary.rb は、curl の50回の時間から P50（速いほうから25番目）と P95（48番目）を出し、Completed の行の値の中央値をまとめるスクリプトです。
          </p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=production で script/measure.sh v0）"
            code={`
v0 curl: P50 208.1ms  P95 265.1ms  最大 291.5ms（50回）
v0 Completed の中央値: 全体 206ms  Views 0.7ms  ActiveRecord 108.6ms  SQL 689回  GC 4.7ms
v0 応答の大きさ: 37878 バイト
`}
          />
          <p>
            P50 が 208.1ms、P95 が 265.1ms でした。これが基準値です。ただし、この値は回ごとにばらつきます。この章を書く間に同じ v0 を同じスクリプトで5回測ったところ、P50 は 151.5ms から 313.1ms まで変わりました。同じマシンで別の処理が動いていると、その分だけ遅くなるからです。別々の回に測った値を比べると、このばらつきを変更の効果と取り違えます。そこで、2つのコードを比べるときは、2つのサーバーを同時に起動し、同じ要求を交互に送るスクリプトを使いました。
          </p>
          <Code
            lang="bash"
            title="script/ab.sh（交互に要求する部分）"
            code={`
# 使い方: script/ab.sh v0 v1
# 2つの版をそれぞれ tmp/ab/A と tmp/ab/B に写し、本番の設定で2つのサーバー（3001番と3002番）を起動する。
# 暖機として20回ずつ要求したあと、同じ要求を A → B の順に交互に50回ずつ送る
# …（省略。2つのコードを写してサーバーを起動し、暖機する）
for i in $(seq 1 50); do
  a=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3001$URL)
  b=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3002$URL)
  echo "$a $b"
done > log/ab-$1-$2.txt
# …（省略。組ごとの差の中央値と、B のほうが速かった組の数を出す）
`}
          />
          <p>
            交互に送ると、同じ時間帯に起きた遅れが A と B の両方に加わるので、組ごとの差を見ればばらつきの影響を小さくできます。前の節の v0 と v1 の比較もこのスクリプトで測りました。
          </p>
          <p>
            目標も決めます。Jakob Nielsen は1993年の著書で、利用者がシステムがすぐに反応したと感じる限界を約0.1秒としています<Ref n={3} />。ページの表示には API のほかにブラウザーの処理も加わりますが、この章では API の応答だけの目標として「P95 で 100ms 以内」を置きました。基準値の P95 は 265.1ms なので、目標まで約 165ms 縮める必要があります。
          </p>
          <h3>手順2：Completed の行で、時間の内訳を見る</h3>
          <p>v0 の50回の計測のうち、1回の要求の Completed の行です。Rails はコントローラーの処理が終わるたびにこの行をログに書きます<Ref n={9} />。</p>
          <Code
            lang="text"
            title="実行結果（log/server.log の Completed の行の1つ）"
            code={`
[e4010868-22d0-4cbf-b8de-267f10c1ded8] Completed 200 OK in 206ms (Views: 0.7ms | ActiveRecord: 116.1ms (689 queries, 12 cached) | GC: 1.6ms)
`}
          />
          <p>
            Completed の行の読み方は <ChapterLink n={22} section="slow-parts" /> で扱いました。この API では、それぞれの値が次の処理に当たります。
          </p>
          <ul>
            <li>
              Views：コントローラーの <code>render</code> にかかった時間です<Ref n={4} />。<code>render json:</code> では、ハッシュを to_json で JSON の文字列にする時間が入ります。開発者が遅いと推測した部分は、ここに出ます。
            </li>
            <li>
              ActiveRecord：SQL にかかった時間の合計と回数です。689回のうち12回は同じ要求の中で同じ SQL の結果を使い回したもの（クエリキャッシュ。<ChapterLink n={12} section="query-cache" />）です<Ref n={8} />。シリアライザーの中で送った SQL も、ここに入ります。
            </li>
            <li>残りの約 89ms（206 − 0.7 − 116.1）：コントローラーとシリアライザーの Ruby の処理です。SQL を組み立てる処理や、読んだ行からオブジェクトを作る処理もここに入ります。</li>
          </ul>
          <Figure n="71-4" title="直す前の1回の要求の時間の内訳（DB・Ruby・ビュー）" caption="v0 と v1 の Completed の行の50回の中央値から作った。その他は全体から Views と ActiveRecord を引いた値。下の枠は script/json_bench.rb の結果。">
            <BreakdownFigure />
          </Figure>
          <p>
            図 71-4 は50回の中央値で内訳を並べたものです。v0 の 206ms のうち、SQL が 108.6ms、その他（Ruby の処理など）が約 96.7ms で、JSON の生成が入る Views は 0.7ms でした。v1 の Views が 0.0ms なのは、<code>JSON.generate(payload)</code> が render の引数として render より前に動くので、その時間が「その他」に入るからです。
          </p>
          <p>JSON の生成だけの時間も同じデータで測りました。</p>
          <Code
            lang="ruby"
            title="script/json_bench.rb"
            code={`
# 注文一覧の1ページ分（100件）のハッシュを先に作り、JSON の文字列にする部分だけの時間を測る。
# 暖機として50回ずつ動かしてから、200回ずつ測って中央値を出す
orders = Order.includes(:customer, line_items: :product).order(id: :desc).limit(100)
payload = { page: 1, orders: orders.map { |order| OrderSerializer.new(order).as_json } }

def median_ms(&block)
  50.times(&block)
  times = Array.new(200) do
    started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    block.call
    (Process.clock_gettime(Process::CLOCK_MONOTONIC) - started) * 1000
  end
  times.sort[100]
end

puts format("Active Support の to_json（render json: が使う）: %.2fms", median_ms { payload.to_json })
puts format("JSON.generate:                                %.2fms", median_ms { JSON.generate(payload) })
puts "文字列の長さ: #{payload.to_json.bytesize} バイトと #{JSON.generate(payload).bytesize} バイト"
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=production で bin/rails runner script/json_bench.rb）"
            code={`
Active Support の to_json（render json: が使う）: 0.23ms
JSON.generate:                                0.22ms
文字列の長さ: 37878 バイトと 37478 バイト
`}
          />
          <p>
            時間は時刻を戻すことのない時計（<code>Process::CLOCK_MONOTONIC</code>）で測りました<Ref n={13} />。JSON の生成はどちらの方法でも約 0.2ms で、要求全体の約 206ms の 0.1% ほどです。JSON の生成を0にできたとしても、全体は 1ms も縮みません。前の節で v1 の差の中央値が −4.4ms だったのは、JSON の生成の差では説明できず、計測のばらつきの範囲だと考えられます。Rails 8.1.4.1 の Active Support は、json の gem が 2.15.2 以上のとき、JSON::Coder を使う変換（JSONGemCoderEncoder）で JSON を作ります<Ref n={10} />。「to_json は遅い」という話は、この章の環境では当てはまりませんでした。
          </p>
          <h3>手順3：仮説を立てて、SQL のログで確かめる</h3>
          <p>
            100件の注文に689回の SQL は、注文1件あたり約7回です。注文ごとに関連を読む N+1 のクエリ（<ChapterLink n={13} section="n-plus-one" />）だと考えました。どの行が SQL を送っているかを確かめるには、開発環境のログを使います。開発環境では <code>config.active_record.verbose_query_logs = true</code> が既定で入っていて、SQL の行の下に、その SQL を送ったファイルと行番号が <code>↳</code> で出ます<Ref n={11} />。開発環境でサーバーを起動し、同じ API を1回要求しました（script/dev_log.sh）。
          </p>
          <Code
            lang="text"
            title="実行結果（log/development.log の先頭。SQL のコメントと色の記号を省略）"
            code={`
Processing by Admin::OrdersController#index as */*
  Parameters: {"page" => "1"}
  Order Load (1.7ms)  SELECT \`orders\`.* FROM \`orders\` ORDER BY \`orders\`.\`id\` DESC LIMIT 100 OFFSET 0
  ↳ app/controllers/admin/orders_controller.rb:9:in 'Enumerable#map'
  Customer Load (1.5ms)  SELECT \`customers\`.* FROM \`customers\` WHERE \`customers\`.\`id\` = 303 LIMIT 1
  ↳ app/serializers/order_serializer.rb:13:in 'OrderSerializer#as_json'
  LineItem Load (2.0ms)  SELECT \`line_items\`.* FROM \`line_items\` WHERE \`line_items\`.\`order_id\` = 6000
  ↳ app/serializers/order_serializer.rb:14:in 'Enumerable#map'
  Product Load (1.8ms)  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1094 LIMIT 1
  ↳ app/serializers/order_serializer.rb:15:in 'block in OrderSerializer#as_json'
  # …（省略。Product Load が4回続く）
  LineItem Sum (1.0ms)  SELECT SUM(quantity * unit_price) FROM \`line_items\` WHERE \`line_items\`.\`order_id\` = 6000
  ↳ app/models/order.rb:7:in 'Order#total'
  Customer Load (0.9ms)  SELECT \`customers\`.* FROM \`customers\` WHERE \`customers\`.\`id\` = 134 LIMIT 1
  # …（省略）
Completed 200 OK in 889ms (Views: 0.8ms | ActiveRecord: 235.6ms (689 queries, 12 cached) | GC: 53.8ms)
`}
          />
          <Code
            lang="text"
            title={'実行結果（grep -oE "(CACHE )?(Order|Customer|LineItem|Product) (Load|Sum)" log/development.log | sort | uniq -c）'}
            code={`
     12 CACHE Product Load
    100 Customer Load
    100 LineItem Load
    100 LineItem Sum
      1 Order Load
    376 Product Load
`}
          />
          <p>
            注文を読む1回のほかに、シリアライザーの13行目（顧客）で100回、14行目（明細）で100回、15行目（商品）で388回（そのうち12回はクエリキャッシュ）、Order#total の SUM で100回の SQL を送っていました。合計は689回で、Completed の行の回数と合います。仮説のとおり、N+1 のクエリが4種類ありました。
          </p>
          <p>
            開発環境の Completed の行は 889ms で、本番の設定の 206ms の4倍以上でした。開発環境では、↳ の行を出すために呼び出し元をたどる処理（Kernel#caller）がメモリーを多く使い<Ref n={11} />、GC にも 53.8ms かかっています。開発環境のログは SQL の回数と呼び出し元を調べるのに使い、時間は本番の設定で測ります。
          </p>
          <h3>手順4：1か所ずつ直して、測り直す</h3>
          <p>
            まず、関連を <code>includes</code> でまとめて読みます（<ChapterLink n={13} section="includes" />）<Ref n={12} />。このコードを v2 とします。
          </p>
          <Code
            lang="ruby"
            title="versions/v2/app/controllers/admin/orders_controller.rb（index の部分）"
            code={`
    def index
      page = params.fetch(:page, 1).to_i
      orders = Order.includes(:customer, line_items: :product)
                    .order(id: :desc).limit(PER_PAGE).offset((page - 1) * PER_PAGE)
      render json: { page:, orders: orders.map { |order| OrderSerializer.new(order).as_json } }
    end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=production で script/measure.sh v2）"
            code={`
v2 curl: P50 56.6ms  P95 98.6ms  最大 132.0ms（50回）
v2 Completed の中央値: 全体 53ms  Views 0.6ms  ActiveRecord 23.5ms  SQL 104回  GC 0.0ms
v2 応答の大きさ: 37878 バイト
`}
          />
          <p>
            SQL は689回から104回に、P50 は 208.1ms から 56.6ms になりました。P95 の 98.6ms は目標の 100ms をわずかに下回りましたが、残りの100回は Order#total の SUM で、表示する件数に比例して増えます。<code>line_items.sum("quantity * unit_price")</code> のように SQL の式を渡す sum は、明細を読み込み済みでも SQL を送ります（先読みしても残る問い合わせは <ChapterLink n={13} section="n-plus-one-check" />）。明細はすでに読み込んであるので、Ruby で合計します。このコードが v3 です。
          </p>
          <Code
            lang="ruby"
            title="versions/v3/app/models/order.rb"
            code={`
class Order < ApplicationRecord
  belongs_to :customer
  has_many :line_items

  # 合計金額（税込みの単価 × 数量の合計）。読み込んだ明細から計算する
  def total
    line_items.sum { |item| item.quantity * item.unit_price }
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=production で script/measure.sh v3 と script/ab.sh v0 v3）"
            code={`
v3 curl: P50 16.4ms  P95 43.0ms  最大 113.5ms（50回）
v3 Completed の中央値: 全体 14ms  Views 0.5ms  ActiveRecord 4.0ms  SQL 4回  GC 0.0ms
v3 応答の大きさ: 37878 バイト

A（v0）の P50 133.5ms、B（v3）の P50 9.6ms（50組）
組ごとの差（B − A）の中央値 -122.6ms、B のほうが速かった組 50 / 50
`}
          />
          <p>
            SQL は4回（orders・customers・line_items・products を1回ずつ）になり、P50 は 16.4ms、P95 は 43.0ms で目標に届きました。交互に比べた結果でも、50組のすべてで v3 のほうが速く、差の中央値は 122.6ms でした（この回の v0 の P50 は 133.5ms で、手順1の 208.1ms より短く、ここでも回ごとのばらつきが出ています）。v3 の応答の本文は cmp で比べて v0 と1バイトも違いませんでした。
          </p>
          <Figure n="71-5" title="直す前と後の SQL の回数と応答時間" caption="左は1回の要求で送る SQL を種類ごとに積み上げた横棒（v0 の products の388回にはクエリキャッシュの12回を含む）。右は script/measure.sh の P50（塗り）と P95（破線）。">
            <BeforeAfterFigure />
          </Figure>
          <p>
            図 71-5 のように、SQL の回数と応答時間は一緒に減りました。Completed の行の中央値で見ると、SQL の時間は 108.6ms から 4.0ms に、その他（Ruby の処理）は約 96.7ms から約 9.5ms（14 − 4.0 − 0.5）に減っています。N+1 のクエリは DB の待ち時間だけでなく、SQL を組み立てて結果からオブジェクトを作る Ruby の時間も、回数の分だけ増やしていました。デモでは DB が同じマシンにあり、SQL 1回あたりの時間は約 0.16ms でした。DB が別のサーバーにある環境では、SQL 1回ごとにネットワークの往復の時間が加わります。
          </p>
          <h3>手順5：推測で入れた変更も、測ってから決める</h3>
          <p>
            v2 と v3 は v0 から直したので、v1 の JSON.generate は入っていません。全体が約 14ms になった今なら JSON の生成の割合は大きくなっているので、v3 に JSON.generate を足したコード（v4）と交互に比べました。
          </p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=production で script/ab.sh v3 v4）"
            code={`
A（v3）の P50 17.9ms、B（v4）の P50 17.1ms（50組）
組ごとの差（B − A）の中央値 0.2ms、B のほうが速かった組 23 / 50
`}
          />
          <p>
            差の中央値は 0.2ms で、v4 のほうが速かった組は50組のうち23組でした。効果は測れず、日時の形式は変わるので、JSON.generate は入れません。将来、1ページの件数を大きく増やすなどで Views の時間が伸びたら、そのときにもう一度測ります。
          </p>
          <h3>手順6：SQL の回数をテストで固定する</h3>
          <p>
            応答時間は手順1で見たように回ごとにばらつくので、テストで「何 ms 以内」と決めると、遅いマシンで落ちたり、速いマシンで問題を見逃したりします。SQL の回数はデータの件数を決めれば毎回同じになります。そこで、注文が3件のときと10件のときで、SQL の回数が同じことを確かめる request spec を足しました。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/admin_orders_spec.rb（足した部分）"
            code={`
  # ブロックの中で DB に送った SQL の回数（クエリキャッシュで返したものは数えない）
  def count_queries(&)
    count = 0
    counter = ->(*, payload) { count += 1 unless payload[:name] == "SCHEMA" || payload[:cached] }
    ActiveSupport::Notifications.subscribed(counter, "sql.active_record", &)
    count
  end

  it "SQL の回数は、注文の件数によらない" do
    create_orders(3)
    few = count_queries { get "/admin/orders" }
    create_orders(7)
    many = count_queries { get "/admin/orders" }
    expect(response.parsed_body["orders"].size).to eq 10
    expect(many).to eq few
  end
`}
          />
          <p>
            <code>create_orders(n)</code> は注文を n 件作るヘルパーで、注文ごとに別の顧客と配送先と、別の商品の明細2行を作ります。商品を注文ごとに分けるのは、同じ商品だとクエリキャッシュで SQL の回数が減り、N+1 が隠れるからです。SQL を数える部分は ActiveSupport::Notifications の sql.active_record のイベントを購読しています（<ChapterLink n={22} section="notifications" />）。
          </p>
          <Code
            lang="text"
            title="実行結果（v0 と v3 で bundle exec rspec）"
            code={`
=== v0
  1) 管理画面の注文一覧 API SQL の回数は、注文の件数によらない
     Failure/Error: expect(many).to eq few

       expected: 16
            got: 51

2 examples, 1 failure

=== v3
2 examples, 0 failures
`}
          />
          <p>
            v0 では、注文が3件のとき16回（1 + 3 × 5）、10件のとき51回（1 + 10 × 5）で、件数に比例して増えました。v3 ではどちらも4回で、テストは通ります。このテストがあれば、あとで誰かが関連の読み込みを外したときに、遅いという報告を待たずに CI で気づけます。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '計測を理由に、原因のわかっている N+1 を後回しにしたとき',
      body: (
        <>
          <h3>配送先を足し、先読みを環境変数で切り替えたコード</h3>
          <p>
            しばらくして、注文一覧に配送先の都道府県を出す要望が来ました。注文は has_one で配送先（shipping_addresses のテーブル）を持ち、シリアライザーに1行を足します。
          </p>
          <Code
            lang="ruby"
            title="versions/v5/app/serializers/order_serializer.rb（足した行）"
            code={`
      customer_name: @order.customer.name,
      shipping_prefecture: @order.shipping_address.prefecture,
`}
          />
          <p>
            レビューで「includes に :shipping_address を足してください」と指摘されると、書いた人は「Measure Before Optimizing なので、遅いと計測されてから直します。本番で両方を測れるように、切り替えを入れておきます」と答え、次のコードにしました。これを v5 とします。
          </p>
          <Code
            lang="ruby"
            title="versions/v5/app/controllers/admin/orders_controller.rb（index の部分。当てはめすぎの例）"
            code={`
    def index
      page = params.fetch(:page, 1).to_i
      scope = Order.includes(:customer, line_items: :product)
      # 遅いと計測されるまで、配送先は先読みしない。本番で両方を測れるように環境変数で切り替える
      scope = scope.includes(:shipping_address) if ENV["PRELOAD_SHIPPING_ADDRESS"]
      orders = scope.order(id: :desc).limit(PER_PAGE).offset((page - 1) * PER_PAGE)
      rows = benchmark("注文一覧：#{PER_PAGE}件のハッシュを作る") do
        orders.map { |order| OrderSerializer.new(order).as_json }
      end
      render json: { page:, orders: rows }
    end
`}
          />
          <p>
            <code>benchmark</code> はコントローラーで使える Active Support のメソッドで、ブロックにかかった時間を「メッセージ (12.3ms)」の形でログに1行書きます<Ref n={15} />。
          </p>
          <h3>動かした結果</h3>
          <Code
            lang="text"
            title="実行結果（v5 で bundle exec rspec）"
            code={`
  1) 管理画面の注文一覧 API SQL の回数は、注文の件数によらない
     Failure/Error: expect(many).to eq few

       expected: 7
            got: 14

2 examples, 1 failure
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=production で script/measure.sh v5 を、環境変数なしと PRELOAD_SHIPPING_ADDRESS=1 で実行）"
            code={`
v5 curl: P50 50.9ms  P95 97.5ms  最大 181.0ms（50回）
v5 Completed の中央値: 全体 49ms  Views 0.5ms  ActiveRecord 20.3ms  SQL 104回  GC 1.0ms
[1f6848fb-a592-462c-b950-e7ceeafd68c0] 注文一覧：100件のハッシュを作る (47.6ms)

v5 curl: P50 11.0ms  P95 20.8ms  最大 67.6ms（50回）
v5 Completed の中央値: 全体 10ms  Views 0.3ms  ActiveRecord 3.0ms  SQL 5回  GC 0.0ms
[7f01d3cf-abeb-4e64-aac1-327dfcb3246d] 注文一覧：100件のハッシュを作る (9.6ms)
`}
          />
          <p>結果から、次の3つのことがわかります。</p>
          <ul>
            <li>
              前の節で足した SQL の回数のテストが、注文3件で7回、10件で14回と、件数に比例して増えることをすでに示しています。原因（配送先の N+1）と直し方（includes に1つ足す）は、時間を測る前にわかっていました。
            </li>
            <li>
              本番で両方を測ってわかるのは、テストが示した N+1 の有無と同じことです（デモでは SQL が104回と5回、P50 が 50.9ms と 11.0ms）。測り終えるまでの間、利用者は遅いほう（P95 97.5ms。先読みした場合は 20.8ms）を待ちます。
            </li>
            <li>
              切り替えのために、同じ一覧の読み方が2通りになりました。テストは環境変数を設定したときだけ通り、両方の設定を確かめるテストと、あとで切り替えを消す作業が要ります。benchmark の行は要求1回ごとにログに1行増えます。
            </li>
          </ul>
          <h3>計測を待たずに直す</h3>
          <Code
            lang="ruby"
            title="versions/v6/app/controllers/admin/orders_controller.rb（index の部分）"
            code={`
    def index
      page = params.fetch(:page, 1).to_i
      orders = Order.includes(:customer, :shipping_address, line_items: :product)
                    .order(id: :desc).limit(PER_PAGE).offset((page - 1) * PER_PAGE)
      render json: { page:, orders: orders.map { |order| OrderSerializer.new(order).as_json } }
    end
`}
          />
          <Code
            lang="text"
            title="実行結果（v6 で bundle exec rspec と、RAILS_ENV=production で script/measure.sh v6）"
            code={`
2 examples, 0 failures

v6 curl: P50 9.8ms  P95 22.8ms  最大 68.4ms（50回）
v6 Completed の中央値: 全体 9ms  Views 0.3ms  ActiveRecord 2.7ms  SQL 5回  GC 0.0ms
`}
          />
          <p>
            v6 は includes に <code>:shipping_address</code> を足しただけです。テストは通り、SQL は5回、P50 は 9.8ms でした。
          </p>
          <h3>判断の目安</h3>
          <Figure n="71-6" title="計測を待つ変更と、待たずに直す変更" caption="横軸は原因の確かさ、縦軸は直したときに増えるもの。青い矢印と赤い文字は右下の変更を左上の変更として扱った当てはめすぎ（v5）。">
            <OveruseFigure />
          </Figure>
          <p>
            図 71-6 は変更を「原因の確かさ」と「直したときに増えるもの」で分けたものです。Measure Before Optimizing が計測の前にしないように勧めるのは、原因が推測だけで、コードや挙動の違いが増える変更（左上。この章の v1）です。右下の変更まで計測を待たせると、v5 のように、測り終えるまで利用者が遅いほうを待ち、切り替えのコードも増えます。
          </p>
          <ul>
            <li>
              計測を待たずに直す（右下）：原因がコードの形やテストの数から確かで、直し方が Rails の標準の機能で1〜数行、結果も読みやすさも変わらない変更です。N+1 の includes、検索や結合に使う列の索引（<ChapterLink n={37} section="index-rails" />）、大量の行を each で読む処理の find_each などです。Knuth も簡単に得られる改善を小さいものとは見なさないと書いています<Ref n={1} />。
            </li>
            <li>
              計測で確かめてから直す（右上）：原因はわかっていても、効果がデータの量や使われ方で変わり、古い値を返すなどの挙動の違いを生む変更です。キャッシュ（<ChapterLink n={22} section="rails-cache" />）や、集計した値を持つ列や表がこれに当たります。
            </li>
            <li>試して戻す（左下）：推測でも、小さく戻しやすい変更は前後を交互に測り、効果がなければ戻します。</li>
          </ul>
          <p>
            逆向きの当てはめすぎもあります。すべてのメソッドに benchmark を入れて常に測ると、ログの量と読む手間が増えます（記録しすぎの問題は <ChapterLink n={89} section="overuse" />）。また、部分だけを測る小さなベンチマークは、全体の中での割合を示しません。この章の json_bench.rb で一方が2倍速かったとしても、要求全体の 206ms のうち 0.2ms の部分です。まず要求全体を測り、内訳で大きい部分を見つけてから、その部分を細かく測ります。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の計測の道具と、性能のガイド',
      body: (
        <>
          <h3>Rails で使える計測の道具</h3>
          <p>
            Rails には、時間と回数を測るための仕組みが標準で入っています。この章で使ったものと、本書のほかの章で詳しく扱ったものを図 71-7 にまとめました。
          </p>
          <Figure n="71-7" title="Rails で使える計測の道具と、詳しい章" caption="「この章」の列はこの章のどの手順で使ったか。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">道具</th>
                    <th scope="col">わかること</th>
                    <th scope="col">この章</th>
                    <th scope="col">詳しい章</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">ログの Completed の行</th>
                    <td>1回の要求の時間、Views・ActiveRecord・GC の時間、SQL の回数</td>
                    <td>手順1・2</td>
                    <td>
                      <ChapterLink n={22} section="slow-parts" />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">開発環境の SQL のログ（呼び出し元の行つき）</th>
                    <td>送った SQL と、その SQL を送ったファイルと行</td>
                    <td>手順3</td>
                    <td>
                      <ChapterLink n={13} section="n-plus-one-check" />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">ActiveSupport::Notifications</th>
                    <td>イベントを購読して、時間や回数を数える</td>
                    <td>手順6</td>
                    <td>
                      <ChapterLink n={22} section="notifications" />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Server-Timing ヘッダー</th>
                    <td>要求の中のイベントの時間を、ブラウザーの開発者ツールで見る</td>
                    <td>使っていない</td>
                    <td>
                      <ChapterLink n={22} section="breakdown" />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">strict_loading</th>
                    <td>読み込んでいない関連を読もうとしたときに例外にする</td>
                    <td>使っていない</td>
                    <td>
                      <ChapterLink n={13} section="strict-loading" />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Bullet（gem）</th>
                    <td>N+1 の候補を知らせる</td>
                    <td>使っていない</td>
                    <td>
                      <ChapterLink n={28} section="bullet" />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">EXPLAIN</th>
                    <td>1つの SQL が索引を使うか、何行を読むか</td>
                    <td>使っていない（1回の SQL は速かった）</td>
                    <td>
                      <ChapterLink n={37} section="explain-rails" />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">ログ・メトリクス・トレース</th>
                    <td>本番で、どの要求が何件遅いか、どの処理に時間がかかったか</td>
                    <td>使っていない</td>
                    <td>
                      <ChapterLink n={89} section="apply" />
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">benchmark（Active Support）</th>
                    <td>ブロックの時間をログに1行で書く</td>
                    <td>当てはめすぎの例</td>
                    <td>なし</td>
                  </tr>
                  <tr>
                    <th scope="row">assert_queries_count</th>
                    <td>ブロックの中で送った SQL の回数を、Minitest のテストで確かめる</td>
                    <td>RSpec では Notifications で数えた</td>
                    <td>なし</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 71-7 のうち、assert_queries_count は Rails 7.2.0 からアプリケーションで使えるようになったアサーションです<Ref n={17} />。Minitest の ActiveSupport::TestCase では <code>{'assert_queries_count(4) { get "/admin/orders" }'}</code> のように書けます。この章は RSpec なので、同じことを ActiveSupport::Notifications の購読で書きました。
          </p>
          <h3>性能のガイドとの関係</h3>
          <p>
            Rails のガイド「Tuning Performance for Deployment」は、Rails のアプリケーションはそれぞれ違い、利用者ごとに最適化したい性質も違うので、誰にでも合う既定の設定や指針は示せないと書き、アプリケーションの性能を測り、目標に届くまで設定を調整するように勧めています<Ref n={2} />。同じガイドは、Puma のスレッドの数の説明で、遅い SQL や N+1 の問題のない Rails のアプリケーションは、ふつう時間の50%以上を入出力の待ちに使わないとも書いています<Ref n={2} />。この章の v0 では時間の約半分が SQL でした。スレッドやプロセスの数を決める前に（<ChapterLink n={23} section="sizing" />）、N+1 と遅い SQL を直しておくと、測った値が設定の判断に使えます。
          </p>
          <h3>Rails Doctrine との関係</h3>
          <p>
            Rails Doctrine の「Optimize for programmer happiness」は、性能のための最適化と違い、プログラマーの幸せのための最適化は測るのが難しいと書いています。Ruby は人の目に単純で明快に見えるように実装の側で大きな手間をかけていて、その選択には費用がかかっているとも述べています<Ref n={16} />。この章でも、<code>render json:</code> と <code>includes</code> という読みやすい書き方のまま、計測で見つけた箇所だけを直して目標に届きました。
          </p>
          <p>
            「Value integrated systems」は、どうしても必要になるまでシステムを分散させないように勧め、速さや利用者の体験などの理由で開発者が早すぎる分散に引かれることがあるが、統合されたシステムでもそれらをほとんど失わずに済むと書いています<Ref n={16} />。システムをサービスに分けて速くするのも最適化の1つなので、分ける前に計測で効果を確かめます。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 でも、Completed の行に SQL の回数（queries・cached）と GC の時間が出ます（actionpack と activerecord の 7.2.2.1 の gem で確かめました）<Ref n={18} />。7.2.2.1 の Active Support は JSON の変換に JSONGemEncoder だけを持ち、値全体を as_json で変換してから JSON.generate に渡します<Ref n={19} />。8.1.4.1 の中で JSONGemEncoder に切り替えて script/json_bench.rb を動かすと、to_json は 0.43ms、JSON.generate は 0.23ms でした。7.2 のアプリケーションでは測っていないので、7.2 で to_json と JSON.generate の差を確かめるときは、そのアプリケーションで測ってください。どちらの場合も、要求全体の時間の中での割合を先に見ます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Measure Before Optimizing は、最適化する前に計測し、推測ではなく実測データに基づいて改善する原則です。直す場所を計測で決め、直したあとも同じ条件で測って効果を確かめ、効果がなければ戻します。</li>
          <li>由来としてよく挙げられる Knuth の1974年の論文は、小さな効率をおよそ97%の場合は忘れ、重要な3%は計測で特定してから最適化するように勧めています。どこが重要かについての直感による推測は外れる、とも書いています。</li>
          <li>この章で JSON の生成が遅いと推測して JSON.generate に書き換えた v1 は、交互に比べた組ごとの差の中央値が 4.4ms で、日時の形式が変わってテストが落ちました。JSON の生成そのものは約 0.2ms でした。</li>
          <li>計測は本番の設定で暖機してから P50 と P95 を測り、Completed の行の Views・ActiveRecord と残りの時間で内訳を見て、開発環境の SQL のログの ↳ の行で原因の行を確かめる、の順に進めました。N+1 を1か所ずつ直し、SQL は689回から4回に、P50 は 208.1ms から 16.4ms になりました。</li>
          <li>時間は回ごとにばらつき、同じ v0 でも P50 は 151.5ms から 313.1ms まで変わりました。2つのコードを比べるときは交互に要求し、再発は件数を変えても SQL の回数が同じことを確かめるテストで止めます。</li>
          <li>計測を理由に、原因の確かな N+1 を後回しにすると、切り替えのコードが増え、測り終えるまで利用者が遅いほうを待ちます。原因が確かで、Rails の標準の機能で小さく直せる変更は、計測を待たずに直します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Structured Programming with go to Statements', publisher: 'Donald E. Knuth / ACM Computing Surveys, Vol. 6, No. 4, pp. 261–301', url: 'https://doi.org/10.1145/356635.356640', accessed: '2026-11-22', version: '1974年12月', note: '要旨（読みやすく正しいプログラムから始め、必要なら効率のよいプログラムに変換する方法）、267ページ（入出力で時間が決まらないプログラムでは実行時間の大部分がソースの約3%に集まる）、268ページ（重要でない部分の速さを気にする悪影響、約97%の場合は小さな効率を忘れる、premature optimization is the root of all evil、重要な3%は特定してから見る、計測の道具を使うプログラマーの経験では直感による推測は外れる、簡単に得られる12%の改善は小さくない）。ACM のページは curl では取得できなかったため、本文は pic.plover.com/knuth-GOTO.pdf の写しで確かめた。' },
    { title: 'Tuning Performance for Deployment', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/tuning_performance_for_deployment.html#performance-testing', accessed: '2026-11-22', version: 'Rails 8.1', note: '性能を測って目標に届くまで設定を調整すること、平均ではなく P50 と P95・P99 を見ること、暖機の要求を計測に入れないこと、Rails のログの時間はアプリケーションサーバーの時間を含まないこと、本番と同じ種類のホストで測ること。遅い SQL や N+1 のないアプリケーションは、ふつう時間の50%以上を入出力に使わないこと。' },
    { title: 'Response Times: The 3 Important Limits', publisher: 'Jakob Nielsen / Nielsen Norman Group', url: 'https://www.nngroup.com/articles/response-times-3-important-limits/', accessed: '2026-11-22', version: '1993年（著書 Usability Engineering の第5章からの抜粋）', note: '0.1秒が、利用者がシステムがすぐに反応したと感じる限界であること。' },
    { title: 'actionpack/lib/action_controller/metal/instrumentation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/instrumentation.rb#L28-L34`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'コントローラーの render の時間を view_runtime（ログの Views）にすること。render json: の to_json もこの中で動く。' },
    { title: 'actionpack/lib/action_controller/metal/renderers.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/renderers.rb#L169-L172`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'render json: が、渡された値が文字列でなければ to_json を呼び、文字列ならそのまま使うこと。' },
    { title: 'activesupport/lib/active_support/core_ext/object/json.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/core_ext/object/json.rb#L29-L45`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'JSON.generate を直接使うと Active Support の変換を通らず、as_json が呼ばれないこと。to_json に JSON::State が渡されたときは json の gem の to_json に任せること。' },
    { title: 'activesupport/lib/active_support/time_with_zone.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/time_with_zone.rb#L182-L218`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'as_json が xmlschema（ISO 8601。秒の小数は time_precision の3桁）を返すこと（182〜188行目）、to_s が "2026-11-20 09:15:00 +0900" の形を返すこと（216〜218行目）。' },
    { title: 'activerecord/lib/active_record/railties/controller_runtime.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/railties/controller_runtime.rb#L12-L67`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'Completed の行の ActiveRecord に SQL の時間・回数・キャッシュから返した回数を出すこと、描画中の SQL の時間を Views から引いて ActiveRecord に足すこと。' },
    { title: 'actionpack/lib/action_controller/log_subscriber.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/log_subscriber.rb#L26-L45`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'process_action のイベントから Completed の行を info の水準で書き、GC の時間を足すこと。' },
    { title: 'activesupport/lib/active_support/json/encoding.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/json/encoding.rb#L148-L263`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'json の gem が 2.15.2 以上で JSON::Coder があるとき JSONGemCoderEncoder を定義し（149〜150行目）、既定の json_encoder にすること（259〜263行目）。' },
    { title: 'Debugging Rails Applications: Verbose Query Logs', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/debugging_rails_applications.html#verbose-query-logs', accessed: '2026-11-22', version: 'Rails 8.1', note: 'verbose_query_logs で SQL の下に呼び出し元のファイルと行が ↳ で出て N+1 を見つけやすくなること、開発環境では既定で有効なこと、Kernel#caller がメモリーを多く使うので本番では勧めないこと。新しいアプリケーションの development.rb（railties の development.rb.tt の57行目）にこの設定が入ることも手元の gem で確かめた。' },
    { title: 'Active Record Query Interface: Eager Loading Associations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html#eager-loading-associations', accessed: '2026-11-22', version: 'Rails 8.1', note: 'N + 1 queries problem の説明（10件で11回の SQL）、includes・preload・eager_load で関連を先に読むこと、strict_loading と mode: :n_plus_one_only。' },
    { title: 'Process.clock_gettime', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Process.html#method-c-clock_gettime', accessed: '2026-11-22', version: 'Ruby 4.0', note: 'clock_gettime(clock_id, unit = :float_second) で、指定した時計（CLOCK_MONOTONIC など）の時刻を返すこと。' },
    { title: 'curl man page（-w, --write-out の time_total）', publisher: 'curl', url: 'https://curl.se/docs/manpage.html', accessed: '2026-11-22', note: 'time_total が、操作の全体にかかった秒数であること。' },
    { title: 'activesupport/lib/active_support/benchmarkable.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/benchmarkable.rb#L37-L54`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'benchmark がブロックの時間を測り、「メッセージ (12.3ms)」の形でログに書くこと。AbstractController::Logger がこのモジュールを include するので、コントローラーで使えること（actionpack の abstract_controller/logger.rb の14行目）。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-22', note: 'Optimize for programmer happiness（性能の最適化と違い幸せの最適化は測るのが難しいこと、Ruby の選択には費用がかかっていること）、Value integrated systems（どうしても必要になるまで分散させないこと、速さなどの理由で早すぎる分散に引かれること）。' },
    { title: 'activerecord/CHANGELOG.md（Rails 7.2.0）', publisher: 'rails/rails（GitHub）', url: `${GH72}/activerecord/CHANGELOG.md#L956-L976`, accessed: '2026-11-22', version: 'Rails 7.2.2.1', note: 'assert_queries_count・assert_no_queries・assert_queries_match・assert_no_queries_match をアプリケーションで使えるようにしたこと。8.1.4.1 の定義は activerecord/lib/active_record/testing/query_assertions.rb の24行目、railties の rails/test_help.rb の20行目で ActiveSupport::TestCase に include される。' },
    { title: 'activerecord/lib/active_record/railties/controller_runtime.rb（Rails 7.2.2.1）', publisher: 'rails/rails（GitHub）', url: `${GH72}/activerecord/lib/active_record/railties/controller_runtime.rb#L12-L22`, accessed: '2026-11-22', version: 'Rails 7.2.2.1（rubygems.org の gem で確認）', note: '7.2 でも Completed の行に SQL の回数とキャッシュから返した回数を出すこと。actionpack 7.2.2.1 の action_controller/log_subscriber.rb の36行目で GC の時間を足すこと。' },
    { title: 'activesupport/lib/active_support/json/encoding.rb（Rails 7.2.2.1）', publisher: 'rails/rails（GitHub）', url: `${GH72}/activesupport/lib/active_support/json/encoding.rb#L29-L116`, accessed: '2026-11-22', version: 'Rails 7.2.2.1（rubygems.org の gem で確認）', note: 'JSONGemEncoder だけを持ち、jsonify で値全体を変換してから JSON.generate に渡すこと（37〜41行目）、116行目でこれを既定にすること。' },
  ],
}

export default chapter
