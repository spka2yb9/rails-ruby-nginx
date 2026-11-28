import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 73-1 Money を使う7つのクラスと、Money が読む Campaign ---------- */
const moneyUsers = [
  ['Product', '商品の価格'],
  ['Order', '注文の合計'],
  ['OrderItem', '明細の小計'],
  ['ShippingFee', '送料'],
  ['PointGrant', 'ポイント'],
  ['Refund', '返金額'],
  ['SalesReport', '売上の集計'],
]

function SceneFigure() {
  return (
    <Svg
      id="73-1"
      w={780}
      h={396}
      label="上段の7つのクラス（Product・Order・OrderItem・ShippingFee・PointGrant・Refund・SalesReport）は、どれも金額の値 Money を使う。Money の sale_price は、セールの設定を持つ Campaign の discount_percent_for を呼ぶ。Campaign は商品の分類 Category を参照する。販売促進の担当者は、管理画面から Campaign を登録し、セールの種類を増やすように求める。Campaign を変えると、Money を通じて、Money を使うクラスの spec まで失敗する"
    >
      {moneyUsers.map(([name, role], i) => (
        <g key={name}>
          <Box x={10 + i * 110} y={16} w={100} h={48} lines={[name, role]} fs={12} bold subTone="muted" />
          <Arrow x1={60 + i * 110} y1={64} x2={300 + i * 30} y2={148} />
        </g>
      ))}
      <Box x={290} y={150} w={200} h={56} lines={['Money（金額の値）', 'app/models/money.rb']} fs={12} fill="box5" bold accent subTone="muted" />
      <Arrow x1={390} y1={206} x2={390} y2={268} accent />
      <T x={402} y={230} fs={11} tone="danger">
        sale_price が Campaign.discount_percent_for を呼ぶ
      </T>
      <Box x={290} y={270} w={200} h={56} lines={['Campaign（セール）', 'campaigns テーブル']} fs={12} bold subTone="muted" />
      <Box x={560} y={270} w={150} h={56} lines={['Category', '商品の分類']} fs={12} bold subTone="muted" />
      <Arrow x1={490} y1={298} x2={558} y2={298} />
      <Box x={20} y={270} w={200} h={56} lines={['販売促進の担当者', 'セールの種類を増やしたい']} fs={12} fill="bg" dashed subTone="muted" />
      <Arrow x1={220} y1={298} x2={288} y2={298} dashed />
      <T x={20} y={354} fs={12} tone="danger">
        Campaign を変えると、Money を通じて、Money を使うクラスの spec まで失敗する
      </T>
      <T x={20} y={380} fs={11} tone="muted">
        実線の矢印は依存（矢印の元のクラスが、先のクラスを使う）。破線の矢印は、変更を求める人とクラスの関係
      </T>
    </Svg>
  )
}

/* ---------- 図 73-2 安定したクラスと不安定なクラス ---------- */
function StableFigure() {
  const above = [20, 135, 250]
  const below = [410, 525, 640]
  return (
    <Svg
      id="73-2"
      w={780}
      h={364}
      label="左は安定したクラス X。A・B・C の3つのクラスが X に依存し、X は何にも依存しない。依存されている数が多い（Responsible）ので変えると影響が大きく、何にも依存しない（Independent）ので外から変える理由が来ない。I は 0 ÷ (3 + 0) = 0。右は不安定なクラス Y。Y はどのクラスにも依存されず、D・E・F の3つのクラスに依存する。依存されていない（Irresponsible）ので変えやすく、3つに依存している（Dependent）ので D・E・F の変更が Y を変える理由になる。I は 3 ÷ (0 + 3) = 1。どちらの図も、変わりやすいクラスを上、安定したクラスを下に置く"
    >
      <T x={20} y={18} bold>
        安定したクラス（I = 0）
      </T>
      {above.map((x, i) => (
        <g key={x}>
          <Box x={x} y={40} w={110} h={36} lines={['ABC'[i]]} fs={12} fill="bg" />
          <Arrow x1={x + 55} y1={76} x2={190 + (i - 1) * 30} y2={148} />
        </g>
      ))}
      <Box x={130} y={150} w={120} h={48} lines={['X', 'Ca = 3、Ce = 0']} fs={12} fill="box5" bold subTone="muted" />
      <T x={20} y={226} fs={12}>
        3つのクラスに依存されている（Responsible）
      </T>
      <T x={20} y={248} fs={12}>
        何にも依存していない（Independent）
      </T>
      <T x={20} y={276} fs={12} tone="acc">
        I = 0 ÷ (3 + 0) = 0
      </T>
      <T x={20} y={304} fs={11} tone="muted">
        変えると3つに影響する。外から変える理由が来ない
      </T>

      <line x1={390} y1={8} x2={390} y2={320} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={410} y={18} bold>
        不安定なクラス（I = 1）
      </T>
      <Box x={520} y={40} w={120} h={48} lines={['Y', 'Ca = 0、Ce = 3']} fs={12} fill="box2" bold subTone="muted" />
      {below.map((x, i) => (
        <g key={x}>
          <Arrow x1={580 + (i - 1) * 30} y1={88} x2={x + 55} y2={148} />
          <Box x={x} y={150} w={110} h={36} lines={['DEF'[i]]} fs={12} fill="bg" />
        </g>
      ))}
      <T x={410} y={226} fs={12}>
        どのクラスにも依存されていない（Irresponsible）
      </T>
      <T x={410} y={248} fs={12}>
        3つのクラスに依存している（Dependent）
      </T>
      <T x={410} y={276} fs={12} tone="acc">
        I = 3 ÷ (0 + 3) = 1
      </T>
      <T x={410} y={304} fs={11} tone="muted">
        変えやすい。D・E・F の変更が、Y を変える理由になる
      </T>
      <T x={20} y={348} fs={11} tone="muted">
        矢印は依存の向き。変わりやすいクラスを上、安定したクラスを下に置く（Martin の記事の描き方）
      </T>
    </Svg>
  )
}

/* ---------- 図 73-3 直す前のコードの依存のグラフと不安定度 ---------- */
// I の値から縦の位置を決める（I = 1 が上、I = 0 が下）
const gy = (i: number) => 40 + (1 - i) * 330

function GraphFigure() {
  const nodes = [
    { name: 'OrderItem', i: 0.75, cx: 330 },
    { name: 'Order', i: 0.667, cx: 170 },
    { name: 'Product', i: 0.5, cx: 400 },
    { name: 'Campaign', i: 0.5, cx: 660 },
    { name: 'Category', i: 0.333, cx: 520 },
  ]
  const ticks = [1, 0.75, 0.5, 0.25, 0]
  return (
    <Svg
      id="73-3"
      w={780}
      h={420}
      label="直す前のコードの依存を、不安定度 I の値の高さに置いた図。上ほど I が大きい。Money だけを使う ShippingFee・PointGrant・Refund・SalesReport は I = 1.000、OrderItem は 0.750、Order は 0.667、Product と Campaign は 0.500、Category は 0.333、Money は 0.125。Money を使うクラスからの矢印はどれも下向きで、I が減る向き。Money から Campaign への矢印だけが上向きで、I が 0.125 から 0.500 に増えるので SDP に反する。Order と OrderItem、Product と Category は互いに依存している"
    >
      <line x1={36} y1={gy(1)} x2={36} y2={gy(0)} stroke="var(--fig-line)" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={32} y1={gy(t)} x2={40} y2={gy(t)} stroke="var(--fig-line)" />
          <T x={28} y={gy(t)} anchor="end" fs={11} tone="muted">
            {String(t)}
          </T>
        </g>
      ))}
      <T x={44} y={gy(0) + 18} fs={11} tone="muted">
        I（上ほど不安定）
      </T>

      <Box x={390} y={gy(1) - 20} w={340} h={40} lines={['ShippingFee・PointGrant・Refund・SalesReport', 'I = 1.000（Money だけを使う）']} fs={11} subTone="muted" />
      {nodes.map((n) => (
        <Box key={n.name} x={n.cx - 56} y={gy(n.i) - 16} w={112} h={32} lines={[n.name, `I = ${n.i.toFixed(3)}`]} fs={10} subTone="muted" />
      ))}
      <Box x={200} y={gy(0.125) - 16} w={200} h={32} lines={['Money', 'I = 0.125（Ca = 7、Ce = 1）']} fs={10} fill="box5" bold accent subTone="muted" />

      {/* Money を使うクラスから Money へ（下向き） */}
      <Arrow x1={590} y1={gy(1) + 20} x2={396} y2={gy(0.125) - 18} />
      <Arrow x1={310} y1={gy(0.75) + 16} x2={300} y2={gy(0.125) - 18} />
      <Arrow x1={190} y1={gy(0.667) + 16} x2={250} y2={gy(0.125) - 18} />
      <Arrow x1={380} y1={gy(0.5) + 16} x2={350} y2={gy(0.125) - 18} />
      {/* そのほかの依存 */}
      <Arrow x1={360} y1={gy(0.75) + 16} x2={390} y2={gy(0.5) - 18} />
      <Arrow x1={274} y1={gy(0.75) + 4} x2={228} y2={gy(0.667) - 4} both dashed />
      <Arrow x1={430} y1={gy(0.5) + 18} x2={490} y2={gy(0.333) - 18} both dashed />
      <Arrow x1={620} y1={gy(0.5) + 16} x2={560} y2={gy(0.333) - 18} />
      {/* SDP に反する依存（上向き） */}
      <Arrow d={`M400,${gy(0.125)} L690,${gy(0.125)} L690,${gy(0.5) + 18}`} accent />
      <T x={500} y={gy(0.125) + 16} fs={11} tone="danger">
        Money → Campaign：I が 0.125 から 0.500 に増える
      </T>
      <T x={20} y={408} fs={11} tone="muted">
        青い矢印が SDP に反する依存。両端に矢印のある破線は、互いに依存している組（関連の両側）
      </T>
    </Svg>
  )
}

/* ---------- 図 73-4 依存の向きを変える3つの方法 ---------- */
function WaysFigure() {
  return (
    <Svg
      id="73-4"
      w={780}
      h={392}
      label="依存の向きを変える3つの方法。1つ目は、処理を変わりやすい側へ移す方法で、割引の計算を Money から Campaign に移し、Campaign が Money に依存する。この章で使う。2つ目は、取り決めを挟む方法（DIP）で、Money は値引きを表すオブジェクトが応答するメソッドの名前だけを決め、Campaign がその取り決めを満たす。Money は Campaign の名前を知らない。3つ目は、呼び出し側で組み合わせる方法で、Product が Campaign に割引率を聞き、Money で計算する。Money と Campaign は互いを知らない"
    >
      <T x={14} y={18} bold>
        1. 処理を変わりやすい側へ移す
      </T>
      <Box x={40} y={50} w={180} h={50} lines={['Campaign', 'price_for・apply']} fs={12} fill="box2" bold subTone="muted" />
      <Box x={40} y={180} w={180} h={50} lines={['Money', '割引を知らない']} fs={12} fill="box5" bold subTone="muted" />
      <Arrow x1={130} y1={100} x2={130} y2={178} accent />
      <T x={14} y={268} fs={12}>
        割引の計算を Campaign に置く
      </T>
      <T x={14} y={290} fs={12} tone="acc">
        この章で使う方法
      </T>
      <T x={14} y={312} fs={11} tone="muted">
        変わる処理と、変わる理由が同じ所に集まる
      </T>

      <line x1={262} y1={8} x2={262} y2={330} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={276} y={18} bold>
        2. 取り決めを挟む（DIP）
      </T>
      <Box x={290} y={50} w={150} h={50} lines={['Campaign', 'discount_on を持つ']} fs={12} fill="box2" bold subTone="muted" />
      <Box x={290} y={180} w={110} h={50} lines={['Money', 'discount(d)']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={410} y={180} w={92} h={50} lines={['取り決め', '#discount_on']} fs={12} fill="bg" dashed subTone="muted" />
      <Arrow x1={400} y1={205} x2={408} y2={205} dashed />
      <Arrow x1={420} y1={100} x2={450} y2={178} dashed />
      <T x={276} y={268} fs={12}>
        Money はメソッドの名前だけを決める
      </T>
      <T x={276} y={290} fs={12}>
        Campaign の名前を Money に書かない
      </T>
      <T x={276} y={312} fs={11} tone="muted">
        Money が値引きを受け取る形にするとき
      </T>

      <line x1={520} y1={8} x2={520} y2={330} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={534} y={18} bold>
        3. 呼び出し側で組み合わせる
      </T>
      <Box x={590} y={50} w={150} h={50} lines={['Product', 'current_price']} fs={12} fill="box2" bold subTone="muted" />
      <Box x={540} y={180} w={110} h={50} lines={['Money', '割引を知らない']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={665} y={180} w={110} h={50} lines={['Campaign', '割引率を返す']} fs={12} bold subTone="muted" />
      <Arrow x1={640} y1={100} x2={600} y2={178} />
      <Arrow x1={690} y1={100} x2={715} y2={178} />
      <T x={534} y={268} fs={12}>
        Product が割引率を聞き、Money で計算する
      </T>
      <T x={534} y={290} fs={12}>
        Money と Campaign は互いを知らない
      </T>
      <T x={534} y={312} fs={11} tone="muted">
        組み合わせる場所が1か所のときに使う
      </T>
      <T x={14} y={350} fs={11} tone="muted">
        矢印は依存の向き。破線の箱は、クラスではなく取り決め（応答するメソッドの名前）。
      </T>
      <T x={14} y={372} fs={11} tone="muted">
        どの方法でも、多くのクラスが使う Money から、変わりやすいクラスへの矢印がなくなる
      </T>
    </Svg>
  )
}

/* ---------- 図 73-5 直す前と後：依存のグラフと不安定度 ---------- */
const cy = (i: number) => 52 + (1 - i) * 290

function CompareFigure() {
  const ox = 400
  return (
    <Svg
      id="73-5"
      w={780}
      h={420}
      label="直す前と後の依存を、不安定度 I の高さに置いて比べた図。直す前は、Money を使う6つのクラス（I は 0.667 から 1.000）と Product（0.500）が Money（0.125）に依存し、Money が Campaign（0.500）に依存している。Money から Campaign への依存は I が増える向きで、SDP に反する。直した後は、Money は何にも依存せず I = 0.000 になった。Campaign（0.667）が Money と Category に依存し、Product（0.600）が Campaign・Money・Category に依存する。Money への矢印はすべて I が減る向きになった"
    >
      <T x={10} y={18} bold>
        直す前
      </T>
      <Box x={40} y={cy(1) - 18} w={190} h={36} lines={['Money を使う6つのクラス', 'I = 0.667〜1.000']} fs={11} subTone="muted" />
      <Box x={20} y={cy(0.5) - 16} w={100} h={32} lines={['Product', 'I = 0.500']} fs={10} subTone="muted" />
      <Box x={250} y={cy(0.5) - 16} w={110} h={32} lines={['Campaign', 'I = 0.500']} fs={10} subTone="muted" />
      <Box x={150} y={cy(0.333) - 16} w={100} h={32} lines={['Category', 'I = 0.333']} fs={10} subTone="muted" />
      <Box x={100} y={cy(0.125) - 16} w={110} h={32} lines={['Money', 'I = 0.125']} fs={10} fill="box5" bold subTone="muted" />
      <Arrow x1={140} y1={cy(1) + 18} x2={150} y2={cy(0.125) - 18} />
      <Arrow x1={70} y1={cy(0.5) + 16} x2={120} y2={cy(0.125) - 18} />
      <Arrow x1={120} y1={cy(0.5) + 6} x2={160} y2={cy(0.333) - 18} both dashed />
      <Arrow x1={270} y1={cy(0.5) + 16} x2={230} y2={cy(0.333) - 18} />
      <Arrow d={`M210,${cy(0.125)} L330,${cy(0.125)} L330,${cy(0.5) + 18}`} accent />
      <T x={130} y={cy(0.125) + 34} fs={11} tone="danger">
        Money → Campaign は I が増える向き
      </T>

      <line x1={385} y1={8} x2={385} y2={372} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={ox + 10} y={18} bold>
        直した後
      </T>
      <Box x={ox + 40} y={cy(1) - 18} w={190} h={36} lines={['Money を使う6つのクラス', 'I = 0.667〜1.000']} fs={11} subTone="muted" />
      <Box x={ox + 250} y={cy(0.667) - 16} w={110} h={32} lines={['Campaign', 'I = 0.667']} fs={10} fill="box2" bold subTone="muted" />
      <Box x={ox + 20} y={cy(0.6) - 16} w={100} h={32} lines={['Product', 'I = 0.600']} fs={10} subTone="muted" />
      <Box x={ox + 170} y={cy(0.333) - 16} w={100} h={32} lines={['Category', 'I = 0.333']} fs={10} subTone="muted" />
      <Box x={ox + 100} y={cy(0) - 16} w={110} h={32} lines={['Money', 'I = 0.000']} fs={10} fill="box5" bold subTone="muted" />
      <Arrow x1={ox + 140} y1={cy(1) + 18} x2={ox + 150} y2={cy(0) - 18} />
      <Arrow x1={ox + 70} y1={cy(0.6) + 16} x2={ox + 120} y2={cy(0) - 18} />
      <Arrow x1={ox + 120} y1={cy(0.6) - 2} x2={ox + 248} y2={cy(0.667) + 2} />
      <Arrow x1={ox + 110} y1={cy(0.6) + 16} x2={ox + 180} y2={cy(0.333) - 18} both dashed />
      <Arrow x1={ox + 280} y1={cy(0.667) + 16} x2={ox + 245} y2={cy(0.333) - 18} />
      <Arrow d={`M${ox + 330},${cy(0.667) + 16} L${ox + 330},${cy(0)} L${ox + 212},${cy(0)}`} accent />
      <T x={ox + 120} y={cy(0) + 34} fs={11} tone="acc">
        Campaign → Money は I が減る向き
      </T>
      <T x={10} y={404} fs={11} tone="muted">
        数値は script/instability.rb の結果。青い矢印は Money と Campaign の間の依存。両端に矢印のある破線は互いに依存している組
      </T>
    </Svg>
  )
}

/* ---------- 図 73-6 取り決め PricingRule を足した後の依存 ---------- */
function PricingFigure() {
  return (
    <Svg
      id="73-6"
      w={780}
      h={420}
      label="取り決め PricingRule を足した後の依存。script/instability.rb が数えた依存は、Product から PricingRule、Campaign から PricingRule（extend）、PricingRule から Money、Product と Campaign から Money。I は Product が 0.600、PricingRule が 0.333、Campaign が 1.000、Money が 0.000 で、I が増える向きの依存はなくなった。一方、config/initializers/pricing_rule.rb が Product.pricing_rule に Campaign を設定するので、実行時には Product が Campaign.price_for を呼ぶ。スクリプトは app/models だけを読むので、この依存を数えない"
    >
      <Box x={250} y={14} w={280} h={48} lines={['config/initializers/pricing_rule.rb', 'Product.pricing_rule = Campaign']} fs={12} fill="bg" dashed subTone="muted" />
      <Arrow x1={250} y1={44} x2={130} y2={108} dashed />
      <Arrow x1={530} y1={44} x2={650} y2={108} dashed />

      <Box x={30} y={110} w={170} h={48} lines={['Product', 'I = 0.600']} fs={12} bold subTone="muted" />
      <Box x={580} y={110} w={170} h={48} lines={['Campaign', 'I = 1.000']} fs={12} bold subTone="muted" />
      <Arrow d="M200,128 L578,128" dashed accent />
      <T x={390} y={118} anchor="middle" fs={11} tone="danger">
        実行時は Product が Campaign.price_for を呼ぶ
      </T>

      <Box x={305} y={200} w={170} h={48} lines={['PricingRule（取り決め）', 'I = 0.333']} fs={12} fill="box2" bold subTone="muted" />
      <Arrow x1={150} y1={158} x2={330} y2={198} />
      <Arrow x1={630} y1={158} x2={450} y2={198} />
      <T x={210} y={196} anchor="end" fs={11} tone="muted">
        @return [PricingRule]
      </T>
      <T x={584} y={196} fs={11} tone="muted">
        extend PricingRule
      </T>

      <Box x={305} y={300} w={170} h={44} lines={['Money', 'I = 0.000']} fs={12} fill="box5" bold subTone="muted" />
      <Arrow x1={390} y1={248} x2={390} y2={298} />
      <Arrow d="M90,158 L90,322 L303,322" />
      <Arrow d="M690,158 L690,322 L477,322" />

      <T x={20} y={378} fs={12} tone="danger">
        スクリプトは app/models だけを読むので、Product から Campaign への依存を数えない
      </T>
      <T x={20} y={402} fs={11} tone="muted">
        実線の矢印はスクリプトが数えた依存。灰色の破線は initializer の設定。青い破線は、スクリプトが数えない実行時の呼び出し
      </T>
    </Svg>
  )
}

/* ---------- 図 73-7 SDP に反する依存を見つけたときの判断 ---------- */
function JudgeFigure() {
  return (
    <Svg
      id="73-7"
      w={780}
      h={470}
      label="スクリプトが A から B への依存を SDP に反すると表示したときの判断。まず、B が業務の都合でよく変わるかを確かめる。変わらないなら、数値に関係なくそのままでよい（Rails・標準ライブラリ・直した後の Money）。変わるなら、A が多くのクラスに使われているか（Ca が大きいか）を確かめる。大きいなら、向きを変える（この章の Money から Campaign）。大きくないなら、A と B がいつも一緒に変わるかを確かめる。一緒に変わるなら、同じまとまりとして扱い、向きの判断から外す（関連の両側など）。一緒に変わらないなら、そのままにして変更の履歴で確かめる。数値を直すためだけに取り決めを足さない（この章の Product から Campaign）"
    >
      <Box x={20} y={14} w={340} h={44} lines="スクリプトが A → B を SDP に反すると表示した" fs={12} bold />
      <Box x={20} y={88} w={340} h={54} lines={['B は、業務の都合でよく変わるか', '（セール・料金表・外部のサービス）']} fs={12} />
      <Box x={20} y={178} w={340} h={54} lines={['A は、多くのクラスに使われているか', '（A の Ca が大きいか）']} fs={12} />
      <Box x={20} y={268} w={340} h={54} lines={['A と B は、いつも一緒に変わるか']} fs={12} />
      <Box x={420} y={88} w={350} h={54} lines={['数値に関係なく、そのままでよい', '例：Rails・標準ライブラリ・直した後の Money']} fs={12} fill="bg" bold subTone="muted" />
      <Box x={420} y={178} w={350} h={54} lines={['向きを変える（図 73-4 の3つの方法）', '例：直す前の Money → Campaign']} fs={12} fill="box2" bold subTone="muted" />
      <Box x={420} y={268} w={350} h={54} lines={['同じまとまりとして扱い、向きの判断から外す', '例：関連の両側（Order と OrderItem）']} fs={12} fill="box2" bold subTone="muted" />
      <Box x={20} y={358} w={340} h={54} lines={['そのままにして、変更の履歴で確かめる', '例：直した後の Product → Campaign']} fs={12} fill="bg" bold subTone="muted" />
      <Arrow x1={190} y1={58} x2={190} y2={86} />
      <Arrow x1={360} y1={115} x2={418} y2={115} />
      <Arrow x1={190} y1={142} x2={190} y2={176} />
      <Arrow x1={360} y1={205} x2={418} y2={205} />
      <Arrow x1={190} y1={232} x2={190} y2={266} />
      <Arrow x1={360} y1={295} x2={418} y2={295} />
      <Arrow x1={190} y1={322} x2={190} y2={356} />
      <T x={389} y={106} anchor="middle" fs={11} tone="muted">
        いいえ
      </T>
      {[196, 286].map((y) => (
        <T key={y} x={389} y={y} anchor="middle" fs={11} tone="muted">
          はい
        </T>
      ))}
      <T x={198} y={160} fs={11} tone="muted">
        はい
      </T>
      {[250, 340].map((y) => (
        <T key={y} x={198} y={y} fs={11} tone="muted">
          いいえ
        </T>
      ))}
      <T x={420} y={380} fs={12} tone="danger">
        数値を直すためだけに取り決めを足さない
      </T>
      <T x={420} y={400} fs={12} tone="danger">
        （当てはめすぎの節の PricingRule）
      </T>
      <T x={20} y={448} fs={11} tone="muted">
        I は依存の数だけから計算する。業務の都合で変わりやすいかどうかは、数には表れないので、人が判断する
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 75,
  part: 8,
  title: 'Stable Dependencies Principle：共通の Money クラスがキャンペーンの設定に依存しない',
  summary:
    '多くのクラスが使う金額の値 Money が、販売促進の担当者の登録するセール（Campaign）を読んでいたために、セールの種類を1つ足しただけで、Money を使う7つのクラスの spec が失敗する場面から始めます。Robert C. Martin の記事「Stability」の定義と不安定度 I = Ce / (Ca + Ce) を確かめ、例のアプリのコードから依存を数えるスクリプトで I を求めます。割引の計算を Campaign に移して依存の向きを直し、数値を直すためだけに取り決めを足す当てはめすぎも確かめます。',
  goals: [
    '安定度が「変わりにくさ」ではなく「変えにくさ」であることと、依存されている数・依存している数との関係を説明できる',
    '不安定度 I = Ce / (Ca + Ce) を、Rails のアプリのコードから数えて求め、I が増える向きの依存を見つけられる',
    '多くのクラスが使うクラスから、変わりやすいクラスへの依存を、処理を移す・取り決めを挟む・呼び出し側で組み合わせる、のいずれかで直せる',
    'I の数値だけを目的にして取り決めを足すと、依存が見えにくくなることを説明し、直すかどうかを変わりやすさと Ca で判断できる',
    'Rails の gem の構成、Zeitwerk による読み込み、Rails Doctrine の「Progress over stability」と、この原則との関係を説明できる',
  ],
  prerequisites: [56, 67, 70],
  sections: [
    {
      id: 'scene',
      title: '多くのクラスが使う Money が、セールの設定を読んでいるコード',
      body: (
        <>
          <p>
            この章では多くのクラスが使う金額のクラスを例に、<Term en="Stable Dependencies Principle">安定依存の原則</Term>（SDP）を扱います。安定依存の原則は変更されやすいモジュールから、より安定したモジュールへ依存するという原則です。まず、金額のクラスがセールの設定を読んでいるコードを動かし、セールの種類を1つ足したときに、どこまで影響が届くかを確かめます。
          </p>
          <h3>そもそも「依存」とは何か</h3>
          <p>
            クラス A のコードがクラス B の名前を書いたり、B のオブジェクトのメソッドを呼んだりしているとき、「A は B に<Term en="dependency">依存</Term>している」と言います。たとえば、この章の送料のクラス ShippingFee は <code>Money.new(5_000)</code> と書き、注文の合計（Money）と <code>&gt;=</code> で比べています。Money の比べ方や <code>Money.new</code> の引数が変わると、ShippingFee も直す必要が出ます。反対に、ShippingFee を変えても Money を直す必要はありません。
          </p>
          <p>
            依存には向きがあり、変更は依存される側から依存する側へ伝わります。本書の図では依存する側から依存される側へ矢印を描きます。1つのクラスに多くのクラスが依存しているほど、そのクラスを変えたときに確かめる範囲が広くなります。
          </p>
          <h3>そもそも何を作っているのか</h3>
          <p>
            食品や日用品を売る EC サイトを考えます。商品の価格、注文の合計、送料、付けるポイント、返品のときの返金額、日ごとの売上は、どれも金額です。このアプリでは金額を Money という値のクラスで表しています。Money は Ruby の <code>Data.define</code> で作った変更できない値で、足し算・引き算・掛け算・比較・割合の計算・表示を持ちます。値のクラスで金額を扱う理由は<ChapterLink n={46} section="money" />で扱います。
          </p>
          <p>
            販売促進の担当者は管理画面からセール（キャンペーン）を登録します。登録する項目は期間・割引率・対象の商品の分類（空なら全品）です。担当者は季節ごとに新しい売り方を試すので、セールの種類はよく増えます。11月には「500円引き」のような定額の値引きを頼まれました。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_shop_tables.rb"
            code={`
class CreateShopTables < ActiveRecord::Migration[8.1]
  def change
    create_table :categories do |t|
      t.string :name, null: false
    end
    create_table :products do |t|
      t.references :category, null: false, foreign_key: true
      t.string :name, null: false
      t.integer :price_yen, null: false # 定価（税込み）
    end
    create_table :campaigns do |t|
      t.references :category, foreign_key: true # NULL なら全品が対象
      t.string :name, null: false
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.integer :discount_percent, null: false
    end
    create_table :orders do |t|
      t.timestamps
    end
    create_table :order_items do |t|
      t.references :order, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :unit_price_yen, null: false # 注文した時点の単価
      t.integer :quantity, null: false
    end
  end
end
`}
          />
          <p>
            Money には、11月のセールのときに <code>sale_price</code> が足されました。商品ページ・カート・注文の金額はどれも Money で表すので、Money でセールの割引を計算すれば、どの画面にもセールの価格が出せる、と考えたからです。
          </p>
          <Code
            lang="ruby"
            title="app/models/money.rb（直す前）"
            code={`
# 金額（円）を表す値。注文・送料・ポイント・返金・売上の集計で使う
Money = Data.define(:yen) do
  include Comparable

  def self.zero = new(0)

  def +(other) = Money.new(yen + other.yen)
  def -(other) = Money.new(yen - other.yen)
  def *(quantity) = Money.new(yen * quantity)
  def <=>(other) = yen <=> other.yen
  def percent(rate) = Money.new(yen * rate / 100) # 1円未満は切り捨てる
  def to_s = "#{yen.to_fs(:delimited)}円"

  # セール中の金額。キャンペーンの割引率を引く（2026年11月のセールのときに追加）
  def sale_price(category:, at: Time.current)
    self - percent(Campaign.discount_percent_for(category, at:))
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/campaign.rb（直す前）"
            code={`
# 販売促進の担当者が管理画面から登録するセール
class Campaign < ApplicationRecord
  belongs_to :category, optional: true # nil なら全品が対象

  scope :active_at, ->(time) { where(starts_at: ..time).where("ends_at > ?", time) }

  # 商品の分類に当てはまる、実施中のキャンペーンのうちで最も大きい割引率
  def self.discount_percent_for(category, at:)
    active_at(at).where(category: [nil, category]).maximum(:discount_percent) || 0
  end
end
`}
          />
          <p>
            商品の今の価格は <code>Product#current_price</code> が Money に頼んで求めます。注文の明細は作るときに商品の今の価格を単価として保存します。セールが終わっても、注文した時点の単価が残ります。
          </p>
          <Code
            lang="ruby"
            title="app/models/product.rb・app/models/order_item.rb（直す前）"
            code={`
class Product < ApplicationRecord
  belongs_to :category

  def price = Money.new(price_yen)

  # 今の販売価格（セール中なら割引した金額）
  def current_price(at: Time.current) = price.sale_price(category:, at:)
end

class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product

  before_validation -> { self.unit_price_yen ||= product.current_price.yen }, on: :create

  def unit_price = Money.new(unit_price_yen)
  def subtotal = unit_price * quantity
end
`}
          />
          <p>Money を使うほかのクラスです。どれもセールとは関係のない計算です。</p>
          <Code
            lang="ruby"
            title="app/models/shipping_fee.rb・point_grant.rb・refund.rb（Order と SalesReport は省略）"
            code={`
# 送料。5,000円以上の注文は無料
class ShippingFee
  FREE_FROM = Money.new(5_000)
  STANDARD = Money.new(600)

  def self.for(order) = order.total >= FREE_FROM ? Money.zero : STANDARD
end

# 1,000円以上の注文に、合計の1%のポイントを付ける
class PointGrant
  MIN_TOTAL = Money.new(1_000)
  RATE = 1

  def self.points_for(order) = order.total >= MIN_TOTAL ? order.total.percent(RATE).yen : 0
end

# 返品された数量に応じた返金額。注文した時点の単価で計算する
class Refund
  def initialize(order_item, quantity)
    @order_item = order_item
    @quantity = quantity
  end

  # @return [Money]
  def amount = @order_item.unit_price * @quantity
end
`}
          />
          <p>
            Refund の <code># @return [Money]</code> は、YARD という書式で「amount は Money を返す」と書いた注記です。Refund のコードには Money という名前が出てこないので、注記で示しています。次の節で依存を数えるときに、この注記を使います。
          </p>
          <Figure n="73-1" title="場面の構成：Money を使う7つのクラスと、Money が読む Campaign" caption="上段の7つのクラスは、どれも Money の名前を書くか、Money を受け取って使う。">
            <SceneFigure />
          </Figure>
          <p>
            図 73-1 のとおり、7つのクラスが Money に依存し、Money は Campaign に依存しています。Campaign は販売促進の担当者の要望で変わるクラスです。次の項で、この依存を通じて何が起きるかを確かめます。
          </p>
          <h3>定額の値引きのキャンペーンを足す</h3>
          <p>
            「500円引き」のセールを登録できるようにするため、開発者は campaigns テーブルに割引の種類（<code>discount_type</code>）を足し、<code>discount_percent</code> を <code>discount_value</code> に名前を変えました。定額の値引きは「最も大きい割引率」では表せないので、<code>discount_percent_for</code> をやめ、実施中のキャンペーンを返す scope に変えました。Campaign の spec もこれに合わせて直しました。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000002_change_campaign_discount.rb"
            code={`
# 定額の値引き（500円引きなど）のキャンペーンを登録できるようにする
class ChangeCampaignDiscount < ActiveRecord::Migration[8.1]
  def change
    add_column :campaigns, :discount_type, :string, null: false, default: "percent"
    rename_column :campaigns, :discount_percent, :discount_value
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/campaign.rb（定額の値引きを足した後）"
            code={`
# 販売促進の担当者が管理画面から登録するセール
class Campaign < ApplicationRecord
  belongs_to :category, optional: true # nil なら全品が対象

  # percent：discount_value % 引き、fixed：discount_value 円引き
  enum :discount_type, { percent: "percent", fixed: "fixed" }, prefix: :discount

  scope :active_at, ->(time) { where(starts_at: ..time).where("ends_at > ?", time) }
  scope :for_category, ->(category) { where(category: [nil, category]) }
end
`}
          />
          <h3>Campaign の spec だけを直して、全体を実行すると</h3>
          <p>Campaign と campaign_spec.rb を直した時点で、全体の spec を実行しました。</p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec。失敗の一覧を抜き出した）"
            code={`
15 examples, 11 failures

Failed examples:

rspec ./spec/models/money_spec.rb:19 # Money#sale_price キャンペーンがなければ同じ金額
rspec ./spec/models/money_spec.rb:23 # Money#sale_price 実施中のキャンペーンの割引率を引く
rspec ./spec/models/order_spec.rb:4 # Order 合計は明細の小計の和
rspec ./spec/models/order_spec.rb:9 # Order 明細の単価は注文した時点の価格で残る
rspec ./spec/models/point_grant_spec.rb:4 # PointGrant 合計の1%（1ポイント未満は切り捨て）
rspec ./spec/models/point_grant_spec.rb:8 # PointGrant 1,000円未満の注文には付けない
rspec ./spec/models/product_spec.rb:4 # Product セール中は割引した価格で売る
rspec ./spec/models/refund_spec.rb:4 # Refund 返品した数量に注文した時点の単価を掛ける
rspec ./spec/models/sales_report_spec.rb:4 # SalesReport 日ごとに注文の合計を足す
rspec ./spec/models/shipping_fee_spec.rb:4 # ShippingFee 5,000円未満は600円
rspec ./spec/models/shipping_fee_spec.rb:8 # ShippingFee 5,000円以上は無料
`}
          />
          <p>
            直した campaign_spec.rb は通りましたが、ほかの7つのファイルの11件が失敗しました。送料・ポイント・返金・売上の集計は、セールと関係のない計算です。失敗の1つを見ると、理由がわかります。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/order_spec.rb:4）"
            code={`
  1) Order 合計は明細の小計の和
     Failure/Error: self - percent(Campaign.discount_percent_for(category, at:))

     NoMethodError:
       undefined method 'discount_percent_for' for class Campaign
     # ./app/models/money.rb:16:in 'Money#sale_price'
     # ./app/models/product.rb:7:in 'Product#current_price'
     # ./app/models/order_item.rb:5:in 'block in <class:OrderItem>'
     # ./spec/support/shop_helper.rb:9:in 'block in ShopHelper#create_order'
     # …（省略）
`}
          />
          <p>
            spec で注文を作る補助のメソッド <code>create_order</code> は、実際の注文と同じく、明細を商品から作ります。明細を作ると、OrderItem → Product#current_price → Money#sale_price → Campaign の順に呼ばれ、なくなったメソッドを呼んだところで止まります。注文を作るテストはどれも、この順にメソッドを呼びます。
          </p>
          <h3>Money を直して通す</h3>
          <p>開発者は Money の <code>sale_price</code> を、割引の種類ごとに計算する形に書き換えました。</p>
          <Code
            lang="text"
            title="実行結果（diff -u で app/models/money.rb を比べた）"
            code={`
-  # セール中の金額。キャンペーンの割引率を引く（2026年11月のセールのときに追加）
+  # セール中の金額。当てはまるキャンペーンのうち、いちばん安くなる割引を当てる
   def sale_price(category:, at: Time.current)
-    self - percent(Campaign.discount_percent_for(category, at:))
+    Campaign.active_at(at).for_category(category).map do |campaign|
+      case campaign.discount_type
+      when "percent" then self - percent(campaign.discount_value)
+      when "fixed" then [self - Money.new(campaign.discount_value), Money.zero].max
+      end
+    end.min || self
   end
`}
          />
          <Code
            lang="text"
            title="実行結果（money_spec.rb と product_spec.rb の Campaign の列名も直し、定額の値引きの例を足して bundle exec rspec）"
            code={`
16 examples, 0 failures
`}
          />
          <p>
            spec は通りましたが、「セールの種類を1つ足す」という変更で、Money を書き換えました。Money を変えたので、コードレビューでは Money を使う7つのクラスへの影響を確かめることになります。Money は割引の種類（<code>"percent"</code> と <code>"fixed"</code>）と Campaign の列の名前まで知るようになりました。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>多くのクラスが使う Money が、販売促進の担当者の要望で変わる Campaign に依存しています。Campaign の変更が Money に伝わり、Money から7つのクラスに伝わります。</li>
            <li>セールと関係のない送料・ポイント・返金・売上の集計の spec が、Campaign の変更で失敗しました。</li>
            <li>セールの種類が増えるたびに Money を書き換えます。「2点目は半額」なら数量を、「会員ランクで割引」なら会員を、Money が知ることになります。</li>
            <li>Money を変えるたびに、Money を使うすべてのクラスへの影響を確かめる必要があります。変えにくいクラスが、変わりやすい理由を持っています。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '安定依存の原則の意味と由来：変えにくいものへ依存する',
      body: (
        <>
          <h3>安定依存の原則の定義</h3>
          <p>本書では安定依存の原則を次のように扱います。</p>
          <ul>
            <li>変更されやすいモジュールから、より安定したモジュールへ依存する。</li>
            <li>多くのモジュールが依存するモジュールを、変更されやすいモジュールに依存させない。</li>
          </ul>
          <p>
            ここでのモジュールはクラス、モジュール、gem のように、まとめて変更し、まとめて使われるコードの単位です。前の節の場面に当てはめると、7つのクラスが依存する Money（安定させたいクラス）が、セールの要望で変わる Campaign（変更されやすいクラス）に依存していたことが、この原則に反していました。
          </p>
          <h3>Martin の記事「Stability」</h3>
          <p>
            この原則を名付けたのは Robert C. Martin です。Martin は雑誌 The C++ Report の連載 Engineering Notebook の6回目の記事「Stability」で、大きなアプリのパッケージの間の依存について、次のように書きました<Ref n={1} />。記事の中では前の回までに扱った原則として、1996年1月号の開放閉鎖の原則（OCP）から1996年11・12月号の非循環依存の原則（ADP）までを挙げています<Ref n={1} />。
          </p>
          <blockquote>
            設計の中のパッケージの間の依存は、パッケージの安定度の向きに沿っているべきである。パッケージは自分より安定したパッケージにだけ依存するべきである。（記事の The Stable Dependencies Principle の項を訳した）
          </blockquote>
          <p>
            Martin は「安定度」という言葉を、辞書の「Not easily moved（簡単には動かせない）」の意味で使うと書いています。安定度はモジュールが変わる見込みの大きさではなくモジュールを変えることの難しさだ、という説明です<Ref n={1} />。どのモジュールが変わりやすいかは、市場や顧客の要望で決まるので予測しにくいが、変えにくさは依存の数から測れる、というのが記事の考え方です。
          </p>
          <p>
            記事はさらに、変わる見込みの低いものへの依存を「良い依存」、変わる見込みの高いものへの依存を「悪い依存」と呼んでいます<Ref n={1} />。Money の足し算や比べ方はめったに変わらないので、7つのクラスが Money に依存するのは良い依存です。Money から Campaign への依存は、変わる見込みの高いものへの依存でした。
          </p>
          <p>
            Martin は後の書籍でもこの原則を扱っています。『Clean Architecture』（2017年）は第14章「Component Coupling」に The Stable Dependencies Principle の節を置いています<Ref n={3} />。Martin のサイトの原則の一覧は、この原則を「Depend in the direction of stability（安定の向きへ依存せよ）」の1行で説明しています<Ref n={2} />。
          </p>
          <h3>安定したクラスと不安定なクラス</h3>
          <p>
            記事はモジュールを変えにくくする2つの性質を挙げています。1つは、ほかの何にも依存していないこと（Independent）です。依存先がないので、依存先の変更が自分を変える理由になりません。もう1つは、多くのクラスに依存されていること（Responsible）です。変えると依存しているクラスすべてに影響するので、変えることが難しくなります。両方を持つクラスが最も安定しています<Ref n={1} />。
          </p>
          <Figure n="73-2" title="安定したクラスと不安定なクラス" caption="左の X は依存されるだけで、右の Y は依存するだけ。数値は次の項の不安定度 I。">
            <StableFigure />
          </Figure>
          <p>
            図 73-2 の左の X は3つのクラスに依存され、何にも依存していません。右の Y はどのクラスにも依存されず、3つのクラスに依存しています。X を変えると A・B・C を確かめることになりますが、X を変える理由は外から来ません。Y は自由に変えられますが、D・E・F のどれかが変わるたびに、変える理由が生まれます。
          </p>
          <h3>不安定度 I の数え方</h3>
          <p>記事はパッケージに出入りする依存を数えて、安定度を次の3つの値で表しました<Ref n={1} />。</p>
          <ul>
            <li>
              <Term en="Afferent Couplings">Ca</Term>（入ってくる依存）：パッケージの外にあって、パッケージの中のクラスに依存しているクラスの数。
            </li>
            <li>
              <Term en="Efferent Couplings">Ce</Term>（出ていく依存）：パッケージの中のクラスが依存している、外のクラスの数。
            </li>
            <li>
              <Term en="Instability">不安定度 I</Term> = Ce / (Ca + Ce)。0 から 1 の値をとり、I = 0 が最も安定し、I = 1 が最も不安定です。
            </li>
          </ul>
          <p>
            記事は安定依存の原則を「パッケージの I は、依存先のパッケージの I より大きくあるべきだ」と言い換え、I は依存の向きに沿って小さくなるべきだと書いています<Ref n={1} />。図 73-2 では、Y（I = 1）から D・E・F へ、A・B・C から X（I = 0）へ、どの矢印も I が減る向きです。
          </p>
          <p>
            記事のパッケージは C++ のいくつかのクラスをまとめた単位です。記事は1つのファイルに1つのクラスを置いていれば I を数えやすいとも書いています<Ref n={1} />。Rails のアプリは app/models/money.rb に Money を置くように、1つのファイルに1つのクラスを置く決まりなので、この章では1つのクラスを1つの単位として数えます。Ce は「そのクラスが依存しているほかのクラスの数」、Ca は「そのクラスに依存しているほかのクラスの数」です。記事の計算の例も依存の相手になっている外のクラスの数を Ce として数えています<Ref n={1} />。
          </p>
          <h3>例のアプリで数える</h3>
          <p>
            Rails のアプリではクラスを使うときに <code>require</code> を書きません。Rails が Zeitwerk という仕組みで、定数が初めて使われたときにファイルを読み込むからです<Ref n={5} />。そのため、ファイルの先頭を見ても、そのクラスが何に依存しているかはわかりません。依存を数えるには、コードの中に書かれたクラスの名前を探す必要があります。次のスクリプトは app/models の各ファイルを Ruby の構文解析のライブラリ Prism で読み、3つの方法で依存を集めます。
          </p>
          <Code
            lang="ruby"
            title="script/instability.rb"
            code={`
# app/models のクラスごとに依存を数え、不安定度 I = Ce / (Ca + Ce) を求める
#   Ce：そのクラスが依存している、ほかのクラスの数
#   Ca：そのクラスに依存している、ほかのクラスの数
# 依存として数えるもの
#   (1) ソースに書かれた定数の参照（Prism で構文木を読む）
#   (2) belongs_to・has_many の相手のクラス（記号で書くので (1) では見つからない）
#   (3) YARD の型の注記（# @param price [Money]、# @return [Money]）に書いたクラス
#       （受け取ったオブジェクトのメソッドを呼ぶだけなら、クラスの名前がコードに出てこない）
require "prism"

def constants_in(node, found = Set.new)
  case node
  when Prism::ConstantReadNode then found << node.name.to_s
  when Prism::ConstantPathNode then found << node.full_name
  end
  node.compact_child_nodes.each { constants_in(it, found) }
  found
end

Rails.application.eager_load!
loader = Rails.autoloaders.main
paths = Rails.root.glob("app/models/**/*.rb").to_h { [loader.cpath_expected_at(it), it] }
paths.delete("ApplicationRecord") # どのモデルも継承する共通の親なので数えない

efferent = paths.to_h do |name, path|
  parsed = Prism.parse_file(path.to_s)
  refs = constants_in(parsed.value)
  parsed.comments.each { refs.merge(it.slice.scan(/@(?:param|return)\\b.*\\[([A-Z][\\w:]*)\\]/).flatten) }
  klass = name.constantize
  refs.merge(klass.reflect_on_all_associations.map { it.klass.name }) if klass < ActiveRecord::Base
  [name, refs.select { paths.key?(it) } - [name]]
end
afferent = paths.keys.to_h { |name| [name, efferent.select { |_, refs| refs.include?(name) }.keys] }

instability = paths.keys.to_h do |name|
  ca, ce = afferent[name].size, efferent[name].size
  [name, ca + ce == 0 ? nil : ce.fdiv(ca + ce)]
end
# …（表と、I が増える向きの依存・互いに依存している組を表示する部分は省略）
`}
          />
          <ul>
            <li>
              <code>loader.cpath_expected_at</code> は、ファイルのパスから、そのファイルが定義するはずの定数の名前（app/models/money.rb なら <code>"Money"</code>）を返す Zeitwerk のメソッドです<Ref n={6} />。
            </li>
            <li>
              <code>Prism.parse_file</code> はファイルを構文木にします。<code>Money</code> のような定数は ConstantReadNode、<code>Foo::Bar</code> は ConstantPathNode になるので、木をたどってその名前を集めます<Ref n={7} />。
            </li>
            <li>
              <code>belongs_to :category</code> は記号で書くので、定数としては見つかりません。<code>reflect_on_all_associations</code> で関連の一覧を取り出し、相手のクラスを加えます<Ref n={8} />。
            </li>
            <li>
              Refund のように、受け取ったオブジェクトのメソッドを呼ぶだけのクラスは、相手の名前をコードに書きません。YARD の <code>@param</code> と <code>@return</code> の型の注記（<code>[Money]</code>）を読んで加えます<Ref n={9} />。
            </li>
          </ul>
          <Code
            lang="text"
            title="実行結果（直す前のコードで bin/rails runner script/instability.rb）"
            code={`
クラス        Ca  Ce      I  依存しているクラス
Money          7   1  0.125  Campaign
Category       2   1  0.333  Product
Campaign       1   1  0.500  Category
Product        2   2  0.500  Category, Money
Order          1   2  0.667  Money, OrderItem
OrderItem      1   3  0.750  Money, Order, Product
PointGrant     0   1  1.000  Money
Refund         0   1  1.000  Money
SalesReport    0   1  1.000  Money
ShippingFee    0   1  1.000  Money

I が小さいクラスから大きいクラスへの依存（SDP に反する）
  Money (0.125) -> Campaign (0.500)

互いに依存している組（関連の両側など。向きの判断からは外す）
  Category <-> Product
  Order <-> OrderItem
`}
          />
          <p>
            Money は7つのクラスに依存され（Ca = 7）、Campaign の1つに依存しています（Ce = 1）。I = 1 / (7 + 1) = 0.125 で、このアプリで最も安定したクラスです。Campaign は Money の1つに依存され、関連の相手の Category に依存しているので、I = 1 / (1 + 1) = 0.500 です。Money から Campaign への依存は、I が 0.125 から 0.500 に増える向きなので、スクリプトは SDP に反する依存として表示しました。
          </p>
          <p>
            Category と Product、Order と OrderItem は、has_many と belongs_to で互いに依存しています。互いに依存している2つのクラスでは、どちらかの向きが必ず I の増える向きになるので、スクリプトは向きの判断から外して別に表示しています。Martin は非循環依存の原則（ADP）で、パッケージの間の依存に循環を作らないよう求めています<Ref n={1} />。関連の両側のように一緒に変わるクラスは、1つのまとまりとして扱うのが自然です。
          </p>
          <Figure n="73-3" title="直す前のコードの依存のグラフと不安定度" caption="縦の位置は I の値。上ほど不安定。数値は script/instability.rb の結果。">
            <GraphFigure />
          </Figure>
          <p>
            図 73-3 はスクリプトの結果を I の高さに並べたものです。Money を使うクラスからの矢印はどれも下向きで、I が減る向きです。Money から Campaign への矢印だけが上に向かっています。安定依存の原則はこの上向きの矢印を見つけるための基準です。
          </p>
          <h3>すべてのクラスを安定させるわけではない</h3>
          <p>
            Martin は、すべてのパッケージが最も安定していたら、システムは変えられなくなると書いています。変わりやすいパッケージと安定したパッケージの両方が必要で、変わりやすいパッケージは、変わることを見込んで作るものです<Ref n={1} />。この章の Campaign は販売促進の担当者の要望で変わることを見込んだクラスです。Campaign が変わりやすいこと自体は問題ではありません。問題は、変えにくい Money が Campaign に依存したために、Campaign が変わるたびに Money も変える必要が生じたことです。
          </p>
          <h3>安定度と抽象度（SAP）</h3>
          <p>
            記事は安定依存の原則と組にして、<Term en="Stable Abstractions Principle">安定抽象の原則</Term>（SAP）も挙げています。最も安定したパッケージは最も抽象的であるべきで、不安定なパッケージは具体的であるべきだ、という原則です。安定したパッケージが抽象的なら、変えずに拡張できるからです。記事は SDP と SAP を合わせると、パッケージの単位の依存性逆転の原則（DIP）になると書いています<Ref n={1} />。
          </p>
          <p>
            記事は具体的で安定したパッケージ（抽象度 0・I = 0 の付近）を避けるべき領域としたうえで、例外も挙げています。データベースのスキーマは多くのものに依存されるのに変わりやすいので、この領域で問題を起こします。一方、文字列のクラスのような具体的なライブラリは、変わる見込みが低いので、この領域にあっても害がないと書いています<Ref n={1} />。Money は具体的なクラスですが、金額の足し算や比べ方はめったに変わらないので、文字列のクラスと同じ例に当たります。直す前の Money は Campaign に依存していたので、データベースのスキーマと同じく、多くのクラスに依存されているのに変わりやすいクラスになっていました。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則</th>
                  <th scope="col">何を確かめるか</th>
                  <th scope="col">安定依存の原則との関係</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">DIP（<ChapterLink n={67} />）</th>
                  <td>上位の方針が下位の詳細に依存していないか</td>
                  <td>依存の向きを抽象に向ける。Martin は SDP と SAP を合わせたものをパッケージの単位の DIP としている</td>
                </tr>
                <tr>
                  <th scope="row">Low Coupling（<ChapterLink n={70} />）</th>
                  <td>依存の数と種類が必要最小限か</td>
                  <td>依存を減らせないときに、どれに依存するかを選ぶ基準が安定依存の原則</td>
                </tr>
                <tr>
                  <th scope="row">Information Hiding（<ChapterLink n={73} />）</th>
                  <td>変わりうる判断を1つのモジュールに隠しているか</td>
                  <td>変わりうる判断（割引の計算）を隠した場所に、安定したクラスから依存しない</td>
                </tr>
                <tr>
                  <th scope="row">OCP（<ChapterLink n={64} />）</th>
                  <td>既存のコードを変えずに振る舞いを足せるか</td>
                  <td>安定したクラスは変えにくいので、変えずに拡張できる形（SAP）にする</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: '割引の計算を Campaign に移し、Money から Campaign への依存をなくす',
      body: (
        <>
          <h3>どの向きに直すか</h3>
          <p>
            安定依存の原則に沿うには、多くのクラスが依存する Money から、変わりやすい Campaign への依存をなくします。Campaign から Money への依存は残してかまいません。Money の足し算や比べ方は、セールの種類が増えても変わらないからです。依存の向きを変える方法には、図 73-4 の3つがあります。
          </p>
          <Figure n="73-4" title="依存の向きを変える3つの方法" caption="どの方法でも、Money から Campaign への矢印がなくなる。この章では1つ目の方法を使う。">
            <WaysFigure />
          </Figure>
          <p>
            1つ目は割引の計算そのものを、変わりやすい Campaign に移す方法です。セールの種類が増えたときに変わるのは割引の計算なので、変わる処理と、変わる理由になるクラスが同じ所に集まります。
          </p>
          <p>
            2つ目は依存性逆転の原則（DIP）の形です。Money は「値引きを表すオブジェクトは <code>discount_on</code> に応答する」という取り決めだけを決め、Campaign がその取り決めを満たします。Money は Campaign の名前を知りませんが、値引きを受け取って割引を当てるメソッド（図の <code>discount</code>）は Money に残ります。割引の計算に数量や会員の情報が要るようになると、Money のメソッドの引数を変えることになります。
          </p>
          <p>
            3つ目は Product が Campaign に割引率を聞き、Money で計算する方法です。Money と Campaign は互いを知りませんが、「いちばん安くなる割引を選ぶ」という判断が Product に置かれます。割引の計算を使う場所が Product の1か所だけなら、この方法でも足ります。
          </p>
          <p>
            この章では1つ目の方法を使い、Campaign に、金額を受け取って割引後の金額を返す <code>Campaign.price_for</code> と <code>Campaign#apply</code> を作ります。取り決めを挟む方法の書き方は<ChapterLink n={67} section="apply" />で扱っています。一度にすべてを書き換えず、spec が通る状態を保ったまま、3つの手順で進めます。
          </p>
          <h3>手順1：Campaign に price_for と apply を足す</h3>
          <p>
            まず、Campaign に新しいメソッドを足します。この時点では Money#sale_price と Campaign.discount_percent_for を残し、どこからも新しいメソッドを呼びません。
          </p>
          <Code
            lang="ruby"
            title="app/models/campaign.rb（手順1。for_category・price_for・apply を足した）"
            code={`
# 販売促進の担当者が管理画面から登録するセール
class Campaign < ApplicationRecord
  belongs_to :category, optional: true # nil なら全品が対象

  scope :active_at, ->(time) { where(starts_at: ..time).where("ends_at > ?", time) }
  scope :for_category, ->(category) { where(category: [nil, category]) }

  # 商品の分類に当てはまる、実施中のキャンペーンのうちで最も大きい割引率
  def self.discount_percent_for(category, at:)
    active_at(at).where(category: [nil, category]).maximum(:discount_percent) || 0
  end

  # 実施中のキャンペーンのうち、いちばん安くなる割引を price に当てた金額（なければ price のまま）
  # @param price [Money]
  # @return [Money]
  def self.price_for(price, category:, at:)
    active_at(at).for_category(category).map { it.apply(price) }.min || price
  end

  # @param price [Money]
  # @return [Money]
  def apply(price) = price - price.percent(discount_percent)
end
`}
          />
          <p>
            <code>price_for</code> は実施中で商品の分類に当てはまるキャンペーンのそれぞれに <code>apply</code> で割引を当て、いちばん安い金額を返します。当てはまるキャンペーンがなければ、受け取った金額をそのまま返します。<code>apply</code> が使うのは Money の <code>-</code> と <code>percent</code> だけです。Campaign は Money に依存しますが、Money は Campaign を知りません。YARD の注記 <code># @param price [Money]</code> は、前の節のスクリプトがこの依存を数えられるように書いています。
          </p>
          <Code
            lang="ruby"
            title="spec/models/campaign_spec.rb（手順1で足した例。create_campaign は spec の中に定義した補助のメソッド）"
            code={`
  describe ".price_for" do
    it "キャンペーンがなければ同じ金額" do
      expect(Campaign.price_for(Money.new(1_980), category: food, at: Time.current)).to eq Money.new(1_980)
    end

    it "実施中で分類が当てはまるもののうち、いちばん安くなる割引を当てる" do
      create_campaign(discount_percent: 5)
      create_campaign(category: food, discount_percent: 15)
      create_campaign(starts_at: 3.days.ago, ends_at: 1.day.ago, discount_percent: 30) # 終了した
      expect(Campaign.price_for(Money.new(2_000), category: food, at: Time.current)).to eq Money.new(1_700)
      expect(Campaign.price_for(Money.new(2_000), category: books, at: Time.current)).to eq Money.new(1_900)
    end
  end
`}
          />
          <Code lang="text" title="実行結果（手順1の後で bundle exec rspec）" code={`
17 examples, 0 failures
`} />
          <h3>手順2：Product#current_price を Campaign.price_for に切り替える</h3>
          <p>商品の今の価格を求める Product#current_price を、Money#sale_price から Campaign.price_for に切り替えます。変える行は1行です。</p>
          <Code
            lang="text"
            title="実行結果（diff -u で app/models/product.rb を比べた）"
            code={`
@@ -4,5 +4,5 @@
   def price = Money.new(price_yen)
 
   # 今の販売価格（セール中なら割引した金額）
-  def current_price(at: Time.current) = price.sale_price(category:, at:)
+  def current_price(at: Time.current) = Campaign.price_for(price, category:, at:)
 end
`}
          />
          <Code lang="text" title="実行結果（手順2の後で bundle exec rspec）" code={`
17 examples, 0 failures
`} />
          <p>
            Product の spec（セール中は割引した価格で売る）は、変えずに通りました。次に、古い2つのメソッドを呼んでいる箇所が残っていないかを grep で確かめます。
          </p>
          <Code
            lang="text"
            title={'実行結果（grep -rn "sale_price\\|discount_percent_for" app spec）'}
            code={`
app/models/money.rb:15:  def sale_price(category:, at: Time.current)
app/models/money.rb:16:    self - percent(Campaign.discount_percent_for(category, at:))
app/models/campaign.rb:9:  def self.discount_percent_for(category, at:)
spec/models/campaign_spec.rb:15:    expect(Campaign.discount_percent_for(food, at: Time.current)).to eq 15
spec/models/campaign_spec.rb:16:    expect(Campaign.discount_percent_for(books, at: Time.current)).to eq 5
spec/models/money_spec.rb:16:  describe "#sale_price" do
spec/models/money_spec.rb:20:      expect(Money.new(1_980).sale_price(category: food)).to eq Money.new(1_980)
spec/models/money_spec.rb:25:      expect(Money.new(1_980).sale_price(category: food)).to eq Money.new(1_782)
`}
          />
          <p>
            残っているのは、2つのメソッドの定義と、それぞれの spec だけです。Money#sale_price から Campaign.discount_percent_for への呼び出しはありますが、Money#sale_price 自体はアプリのコードから呼ばれていません。
          </p>
          <h3>手順3：Money#sale_price と Campaign.discount_percent_for を消す</h3>
          <p>
            呼び出し元がなくなったので、Money#sale_price と money_spec.rb の <code>#sale_price</code> の2つの例、Campaign.discount_percent_for とその例を消します。Money は金額の計算と表示だけを持つ形に戻ります。
          </p>
          <Code
            lang="ruby"
            title="app/models/money.rb（直した後）"
            code={`
# 金額（円）を表す値。注文・送料・ポイント・返金・売上の集計・キャンペーンで使う
Money = Data.define(:yen) do
  include Comparable

  def self.zero = new(0)

  def +(other) = Money.new(yen + other.yen)
  def -(other) = Money.new(yen - other.yen)
  def *(quantity) = Money.new(yen * quantity)
  def <=>(other) = yen <=> other.yen
  def percent(rate) = Money.new(yen * rate / 100) # 1円未満は切り捨てる
  def to_s = "#{yen.to_fs(:delimited)}円"
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/campaign.rb（直した後）"
            code={`
# 販売促進の担当者が管理画面から登録するセール
class Campaign < ApplicationRecord
  belongs_to :category, optional: true # nil なら全品が対象

  scope :active_at, ->(time) { where(starts_at: ..time).where("ends_at > ?", time) }
  scope :for_category, ->(category) { where(category: [nil, category]) }

  # 実施中のキャンペーンのうち、いちばん安くなる割引を price に当てた金額（なければ price のまま）
  # @param price [Money]
  # @return [Money]
  def self.price_for(price, category:, at:)
    active_at(at).for_category(category).map { it.apply(price) }.min || price
  end

  # @param price [Money]
  # @return [Money]
  def apply(price) = price - price.percent(discount_percent)
end
`}
          />
          <Code lang="text" title="実行結果（手順3の後で bundle exec rspec）" code={`
14 examples, 0 failures
`} />
          <p>例の数が 17 から 14 に減ったのは、消したメソッドの例（Money の2件と Campaign の1件）を消したからです。</p>
          <h3>不安定度をもう一度数える</h3>
          <Code
            lang="text"
            title="実行結果（直した後のコードで bin/rails runner script/instability.rb）"
            code={`
クラス        Ca  Ce      I  依存しているクラス
Money          8   0  0.000  
Category       2   1  0.333  Product
Product        2   3  0.600  Campaign, Category, Money
Campaign       1   2  0.667  Category, Money
Order          1   2  0.667  Money, OrderItem
OrderItem      1   3  0.750  Money, Order, Product
PointGrant     0   1  1.000  Money
Refund         0   1  1.000  Money
SalesReport    0   1  1.000  Money
ShippingFee    0   1  1.000  Money

I が小さいクラスから大きいクラスへの依存（SDP に反する）
  Product (0.600) -> Campaign (0.667)

互いに依存している組（関連の両側など。向きの判断からは外す）
  Category <-> Product
  Order <-> OrderItem
`}
          />
          <p>
            Money は何にも依存しなくなり、I = 0 / (8 + 0) = 0.000 になりました。Campaign が Money を使うようになったので、Money の Ca は 7 から 8 に増えています。Campaign は Money と Category に依存し、Product に依存されているので、I = 2 / (1 + 2) = 0.667 です。Product は Money#sale_price の代わりに Campaign.price_for を呼ぶようになり、Ce が 2 から 3 に増えました。
          </p>
          <Figure n="73-5" title="直す前と後の依存のグラフと不安定度" caption="左が直す前、右が直した後。縦の位置は I の値で、上ほど不安定。">
            <CompareFigure />
          </Figure>
          <p>
            図 73-5 の左の直す前は、Money から Campaign への矢印が I の増える向き（上向き）でした。右の直した後は、Money と Campaign の間の矢印が Campaign から Money への向きに変わり、I が減る向きになりました。スクリプトは Product（0.600）から Campaign（0.667）への依存を、まだ SDP に反する依存として表示しています。この依存をどう扱うかは次の節で考えます。
          </p>
          <h3>同じ変更をもう一度行う</h3>
          <p>直したコードで、場面と同じ「500円引き」のセールを足しました。マイグレーションは場面と同じです。Campaign の変更は次のとおりです。</p>
          <Code
            lang="text"
            title="実行結果（diff -u で app/models/campaign.rb を比べた）"
            code={`
@@ -2,6 +2,9 @@
 class Campaign < ApplicationRecord
   belongs_to :category, optional: true # nil なら全品が対象
 
+  # percent：discount_value % 引き、fixed：discount_value 円引き
+  enum :discount_type, { percent: "percent", fixed: "fixed" }, prefix: :discount
+
   scope :active_at, ->(time) { where(starts_at: ..time).where("ends_at > ?", time) }
   scope :for_category, ->(category) { where(category: [nil, category]) }
 
@@ -14,5 +17,10 @@
 
   # @param price [Money]
   # @return [Money]
-  def apply(price) = price - price.percent(discount_percent)
+  def apply(price)
+    case discount_type
+    when "percent" then price - price.percent(discount_value)
+    when "fixed" then [price - Money.new(discount_value), Money.zero].max
+    end
+  end
 end
`}
          />
          <p>
            場面で Money#sale_price に書いた <code>case</code> 文と同じ内容が、Campaign#apply に入りました。割引の種類と列の名前を知っているのは Campaign だけです。campaign_spec.rb には、定額の値引きの例（1,980円から500円を引く、300円の商品は0円より下げない）を足しました。Campaign と campaign_spec.rb を直した時点で、全体の spec を実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec）"
            code={`
Failures:

  1) Product セール中は割引した価格で売る
     Failure/Error: Campaign.create!(name: "全品", starts_at: 1.day.ago, ends_at: 1.day.from_now, discount_percent: 10)

     ActiveModel::UnknownAttributeError:
       unknown attribute 'discount_percent' for Campaign.
     # ./spec/models/product_spec.rb:6:in 'block (2 levels) in <top (required)>'
     # …（省略）

15 examples, 1 failure

Failed examples:

rspec ./spec/models/product_spec.rb:4 # Product セール中は割引した価格で売る
`}
          />
          <p>
            失敗したのは product_spec.rb の1件だけです。この spec はテストのデータを作るために Campaign の列の名前（<code>discount_percent</code>）を書いていました。Product は Campaign に依存しているので、Product の spec が Campaign の列の名前を知っていることは、依存の向きと合っています。送料・ポイント・返金・売上の集計の spec は、どれも通りました。product_spec.rb の列の名前を <code>discount_value</code> に直すと、すべて通りました。
          </p>
          <Code lang="text" title="実行結果（product_spec.rb を直して bundle exec rspec）" code={`
15 examples, 0 failures
`} />
          <p>
            直す前と後で、同じ変更のために書き換えたファイルを比べます。before と before-fixed は、直す前のコードと、それに定額の値引きを足して spec を通したものです。after と after-fixed は、直した後のコードで同じことをしたものです。
          </p>
          <Code
            lang="text"
            title="実行結果（diff -rq で app・db/migrate・spec を比べた）"
            code={`
== 直す前のコード
Files before/app/models/campaign.rb and before-fixed/app/models/campaign.rb differ
Files before/app/models/money.rb and before-fixed/app/models/money.rb differ
Only in before-fixed/db/migrate: 20261121000002_change_campaign_discount.rb
Files before/spec/models/campaign_spec.rb and before-fixed/spec/models/campaign_spec.rb differ
Files before/spec/models/money_spec.rb and before-fixed/spec/models/money_spec.rb differ
Files before/spec/models/product_spec.rb and before-fixed/spec/models/product_spec.rb differ
== 直した後のコード
Files after/app/models/campaign.rb and after-fixed/app/models/campaign.rb differ
Only in after-fixed/db/migrate: 20261121000002_change_campaign_discount.rb
Files after/spec/models/campaign_spec.rb and after-fixed/spec/models/campaign_spec.rb differ
Files after/spec/models/product_spec.rb and after-fixed/spec/models/product_spec.rb differ
`}
          />
          <p>
            直す前は、セールの種類を足すために Money と money_spec.rb を書き換えました。直した後は Money を変えていないので、Money を使う7つのクラスへの影響をコードレビューで確かめる必要もありません。セールの種類を足す変更が、Money を変える理由にならなくなりました。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '数値を直すためだけに取り決めを足したとき',
      body: (
        <>
          <h3>直した後にも残る「SDP に反する依存」</h3>
          <p>
            直した後のスクリプトは Product（I = 0.600）から Campaign（I = 0.667）への依存を、SDP に反する依存として表示しました。I の差は 0.067 です。この表示をなくすために、依存性逆転の原則（DIP）の形で取り決めを足したコードを書き、動かしてみました。
          </p>
          <h3>取り決め PricingRule を足す</h3>
          <p>
            PricingRule は「販売価格の決め方」の取り決めを表すモジュールで、<code>price_for</code> に応答することだけを決めます。Campaign は <code>extend</code> でこのモジュールを取り込み、Product は <code>pricing_rule</code> という属性を通して価格を求めます。
          </p>
          <Code
            lang="ruby"
            title="app/models/pricing_rule.rb"
            code={`
# 販売価格の決め方の取り決め。Product は Campaign ではなく、この取り決めに依存する
module PricingRule
  # @param price [Money]
  # @return [Money]
  def price_for(price, category:, at:) = raise(NotImplementedError)
end
`}
          />
          <Code
            lang="text"
            title="実行結果（diff -u で app/models/campaign.rb と app/models/product.rb を比べた）"
            code={`
@@ -1,5 +1,7 @@
 # 販売促進の担当者が管理画面から登録するセール
 class Campaign < ApplicationRecord
+  extend PricingRule # Campaign.price_for が取り決めを満たす
+
   belongs_to :category, optional: true # nil なら全品が対象
 
   scope :active_at, ->(time) { where(starts_at: ..time).where("ends_at > ?", time) }
@@ -1,8 +1,12 @@
 class Product < ApplicationRecord
   belongs_to :category
 
+  # 販売価格の決め方。config/initializers/pricing_rule.rb で設定する
+  # @return [PricingRule]
+  class_attribute :pricing_rule
+
   def price = Money.new(price_yen)
 
   # 今の販売価格（セール中なら割引した金額）
-  def current_price(at: Time.current) = Campaign.price_for(price, category:, at:)
+  def current_price(at: Time.current) = pricing_rule.price_for(price, category:, at:)
 end
`}
          />
          <Code
            lang="ruby"
            title="config/initializers/pricing_rule.rb"
            code={`
# Product が使う販売価格の決め方
Rails.application.config.to_prepare { Product.pricing_rule = Campaign }
`}
          />
          <ul>
            <li>
              <code>class_attribute</code> はクラスに値を持たせる属性を宣言する Active Support のメソッドです。既定ではインスタンスからも読めるので、<code>current_price</code> の中で <code>pricing_rule</code> と書けます<Ref n={10} />。
            </li>
            <li>
              initializer は再読み込みされる定数（app/models の Campaign など）をそのまま参照できません。Rails Guides は起動時と再読み込みのたびに実行される <code>to_prepare</code> のブロックの中で参照するよう説明しています<Ref n={5} />。
            </li>
            <li>
              Campaign には <code>def self.price_for</code> があるので、<code>extend</code> で取り込んだ PricingRule の <code>price_for</code>（例外を投げるもの）より、Campaign の定義が先に呼ばれます。
            </li>
          </ul>
          <Code lang="text" title="実行結果（bundle exec rspec）" code={`
14 examples, 0 failures
`} />
          <Code
            lang="text"
            title="実行結果（PricingRule を足したコードで bin/rails runner script/instability.rb）"
            code={`
クラス        Ca  Ce      I  依存しているクラス
Money          9   0  0.000  
Category       2   1  0.333  Product
PricingRule    2   1  0.333  Money
Product        2   3  0.600  Category, Money, PricingRule
Order          1   2  0.667  Money, OrderItem
OrderItem      1   3  0.750  Money, Order, Product
Campaign       0   3  1.000  Category, Money, PricingRule
PointGrant     0   1  1.000  Money
Refund         0   1  1.000  Money
SalesReport    0   1  1.000  Money
ShippingFee    0   1  1.000  Money

I が小さいクラスから大きいクラスへの依存（SDP に反する）
  なし

互いに依存している組（関連の両側など。向きの判断からは外す）
  Category <-> Product
  Order <-> OrderItem
`}
          />
          <p>
            spec はすべて通り、SDP に反する依存は「なし」になりました。Campaign はどのクラスにも依存されていない（Ca = 0）ので I = 1.000 になり、最も変えやすいクラスとして数えられています。
          </p>
          <h3>数値は良くなったが、依存は残っている</h3>
          <Code
            lang="text"
            title={"実行結果（bin/rails runner 'puts Product.pricing_rule.name' と grep -rn -w Campaign app/models/product.rb config/）"}
            code={`
Campaign
---
config/initializers/pricing_rule.rb:2:Rails.application.config.to_prepare { Product.pricing_rule = Campaign }
`}
          />
          <p>
            Product.pricing_rule の値は Campaign です。実行時に Product#current_price が呼ぶのは、これまでどおり Campaign.price_for です。Product から Campaign への依存は、app/models/product.rb から config/initializers/pricing_rule.rb に移っただけで、なくなってはいません。スクリプトは app/models の下のファイルだけを読むので、initializer に書いた依存を数えません。図 73-6 はこの状態を示したものです。
          </p>
          <Figure n="73-6" title="取り決め PricingRule を足した後の依存" caption="スクリプトが数えた依存（実線）では、I が増える向きの依存はない。実行時の呼び出し（青い破線）は数えられていない。">
            <PricingFigure />
          </Figure>
          <p>図 73-6 から、このコードには次の問題があることがわかります。</p>
          <ul>
            <li>Product#current_price を読んでも、どのクラスが価格を決めるのかがわかりません。initializer を探して初めて、Campaign だとわかります。</li>
            <li>
              PricingRule を満たすクラスは Campaign の1つだけです。取り決めの引数（<code>price, category:, at:</code>）は Campaign.price_for の引数を写したものです。割引の計算に数量が要るようになれば、PricingRule・Campaign・Product の3つを直すことになります。PricingRule が無ければ、直すのは Campaign と Product の2つです。
            </li>
            <li>
              PricingRule の I は 0.333 で、数値の上では Product より安定しています。しかし、PricingRule を変える理由は Campaign.price_for の引数が変わることなので、変わる頻度は Campaign と同じです。I は依存の数だけから求めるので、この違いは数値に表れません。
            </li>
          </ul>
          <p>
            この例では、今必要な処理だけを書く YAGNI と、差し替えに備えて依存の向きを変える DIP が異なる判断を示します。取り決めを挟む方法は、取り決めを満たすクラスが2つ以上あるときや、テストや設定で実装を差し替える必要があるときに効果があります。満たすクラスが1つで、差し替える予定もないなら、取り決めを足しても実行時の依存は減らず、コードを読むときに開くファイルが増えます。この判断は<ChapterLink n={93} section="yagni-dip" />で扱います。
          </p>
          <h3>Martin も数値を無条件の基準にしないよう書いている</h3>
          <p>
            Martin は記事「Stability」の結びで、これらの数値は、筆者が良いと考える依存と抽象のパターンに設計が合っているかを測るもので、任意に決めた基準に対する測定にすぎないと書いています。その基準が一部のアプリにしか合わない可能性も認めたうえで、すべての設計を無条件に数値に合わせようとする人が出ることは望まない、と述べています<Ref n={1} />。I は、変わりやすいものへの依存を見つけるための手がかりとして使い、直すかどうかは、変わる理由と影響の範囲を見て決めます。
          </p>
          <h3>判断の目安</h3>
          <p>スクリプトが SDP に反する依存を表示したときは、図 73-7 の順に確かめます。</p>
          <Figure n="73-7" title="SDP に反する依存を見つけたときの判断" caption="A は依存する側、B は依存される側。I の数値だけでは決めず、B の変わりやすさと A の Ca を見る。">
            <JudgeFigure />
          </Figure>
          <p>
            最初に確かめるのは、依存先 B が業務の都合でよく変わるかどうかです。Rails や標準ライブラリ、直した後の Money のように変わる見込みの低いものなら、I の大小に関係なくそのままにします。B がよく変わるなら、次に A が多くのクラスに使われているかを確かめます。直す前の Money は7つのクラスに使われ、Campaign はセールのたびに変わるので、向きを変えました。Order と OrderItem のように一緒に変わる組は、1つのまとまりとして扱います。
          </p>
          <p>
            直した後の Product → Campaign は、図の一番下の「そのままにして、変更の履歴で確かめる」に当たります。Campaign はよく変わりますが、Product に依存しているクラスは OrderItem と Category の2つで、Campaign の変更が Product を通じて広がる範囲は小さいからです。また、セールの変更のたびに Product も変わるわけではありません。Campaign を変えたコミットの多くで、Product やその先のクラスも直しているなら、そのときに向きを変えることを考えます。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の gem の構成・オートロードと安定依存の原則',
      body: (
        <>
          <h3>Rails を構成する gem の不安定度</h3>
          <p>
            Rails 自体もいくつもの gem に分かれています。Active Record は activerecord、Action Pack は actionpack という gem で、それぞれの gem の定義（gemspec）に、実行時に必要な gem が書かれています。次のスクリプトは読み込まれた gem の情報を <code>Gem.loaded_specs</code> から取り出し、<code>runtime_dependencies</code>（実行時の依存）のうち Rails の gem どうしの依存だけを数えて I を求めます<Ref n={19} />。
          </p>
          <Code
            lang="ruby"
            title="script/rails_gems.rb"
            code={`
# Rails を構成する gem の間の依存（gemspec の実行時の依存）を数え、I = Ce / (Ca + Ce) を求める
names = %w[activesupport activemodel activerecord activejob actionview actionpack actionmailer
           actioncable activestorage actionmailbox actiontext railties]
efferent = names.to_h { |n| [n, Gem.loaded_specs.fetch(n).runtime_dependencies.map(&:name) & names] }
afferent = names.to_h { |n| [n, names.select { efferent[it].include?(n) }] }
instability = names.to_h { |n| [n, efferent[n].size.fdiv(afferent[n].size + efferent[n].size)] }

names.sort_by { [instability[it], it] }.each do |n|
  puts format("%-14s Ca=%2d Ce=%2d I=%.2f  -> %s", n, afferent[n].size, efferent[n].size, instability[n],
              efferent[n].join(", "))
end

puts "", "I が小さい gem から大きい gem への依存"
names.each do |from|
  efferent[from].select { instability[from] < instability[it] }.each do |to|
    puts format("  %s (%.2f) -> %s (%.2f)", from, instability[from], to, instability[to])
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1 で bin/rails runner script/rails_gems.rb）"
            code={`
activesupport  Ca=11 Ce= 0 I=0.00  -> 
actionpack     Ca= 6 Ce= 2 I=0.25  -> actionview, activesupport
activejob      Ca= 3 Ce= 1 I=0.25  -> activesupport
actionview     Ca= 2 Ce= 1 I=0.33  -> activesupport
activerecord   Ca= 3 Ce= 2 I=0.40  -> activemodel, activesupport
activemodel    Ca= 1 Ce= 1 I=0.50  -> activesupport
activestorage  Ca= 2 Ce= 4 I=0.67  -> actionpack, activejob, activerecord, activesupport
actioncable    Ca= 0 Ce= 2 I=1.00  -> actionpack, activesupport
actionmailbox  Ca= 0 Ce= 5 I=1.00  -> actionpack, activejob, activerecord, activestorage, activesupport
actionmailer   Ca= 0 Ce= 4 I=1.00  -> actionpack, actionview, activejob, activesupport
actiontext     Ca= 0 Ce= 4 I=1.00  -> actionpack, activerecord, activestorage, activesupport
railties       Ca= 0 Ce= 2 I=1.00  -> actionpack, activesupport

I が小さい gem から大きい gem への依存
  activerecord (0.40) -> activemodel (0.50)
  actionpack (0.25) -> actionview (0.33)
`}
          />
          <p>
            activesupport は数えたほかの 11 の gem すべてに依存され、Rails のほかの gem には依存していないので、I = 0.00 です。Money#to_s が使う <code>to_fs</code> も activesupport のメソッドです。反対に、actioncable・actionmailbox・actionmailer・actiontext・railties は、Rails のほかの gem に依存されず（Ca = 0）、I = 1.00 です。依存の多くは、I の大きい gem から小さい gem に向かっています。
          </p>
          <p>
            スクリプトは I が増える向きの依存を2つ表示しました。activerecord（0.40）から activemodel（0.50）と、actionpack（0.25）から actionview（0.33）です。activemodel の Ca は 1 ですが、これは Rails の gem の中だけで数えた値です。フォームのクラスが <code>ActiveModel::Model</code> を include するように（<ChapterLink n={33} section="model-form-objects" />）、activemodel はアプリのコードからも直接使われます。Ca は数える範囲によって変わるので、数えた範囲の外にいる利用者も考えに入れて判断します。
          </p>
          <h3>Rails Doctrine の「Progress over stability」</h3>
          <p>
            Rails Doctrine は Rails の設計思想の柱の1つに「Progress over stability（安定より進歩）」を挙げています。長く使われてきたシステムは変更を受け入れにくくなる傾向があるが、Rails が今後も使われ続けるには、ときには既存の動きを壊して変える必要がある、という内容です。Rails のメジャーバージョンの互換性のない変更で自分のアプリが壊れたときにこそ、この価値観を思い出してほしい、とも書いています<Ref n={4} />。
          </p>
          <p>
            ここでの stability は過去の動きを変えないことを指していて、Martin の安定度（変えにくさ）とは意味が違います。Martin の数え方では、activesupport は Rails のほかのすべての gem に依存される、最も変えにくい gem です。それでも Rails は API を変えます。Rails のメンテナンスポリシーは、マイナーリリースでも API が変わることがあり、互換性のない変更は、前のマイナーリリースかメジャーリリースで非推奨の通知を出してから行うと定めています<Ref n={11} />。
          </p>
          <p>
            Money#to_s が使う <code>to_fs</code> が、その例です。Rails 7.0 は Integer などの <code>to_s</code> に書式を渡す書き方（<code>to_s(:delimited)</code>）を非推奨にして <code>to_fs</code> を勧め<Ref n={12} />、Rails 7.1 でその書き方を削除しました<Ref n={13} />。金額を表示するコードがすべて Money#to_s を通していれば、Rails 7.1 に上げるときに直すのは Money の1か所です。安定依存の原則は変わる見込みの低いものへの依存を勧めますが、多くのアプリが依存する Rails の gem でも、バージョンを上げれば API が変わります。Rails の API を呼ぶ箇所を少数のクラスにまとめておくと、バージョンを上げるときに直す箇所が少なくなります。非推奨の警告を受けてから直す流れは<ChapterLink n={92} />（Backward Compatibility）で扱います。
          </p>
          <h3>オートロードと、依存の見えにくさ</h3>
          <p>
            意味と由来の節で見たとおり、Rails のアプリはクラスを使うときに <code>require</code> を書かないので、ファイルの先頭を見ても依存はわかりません<Ref n={5} />。当てはめすぎの節の PricingRule のように、initializer の <code>to_prepare</code> でクラスを別のクラスの属性に設定すると、依存は app/models の外に移ります。依存を数えるときは、定数の参照のほかに、関連（<code>belongs_to</code> など）、initializer での設定、受け取ったオブジェクトのメソッドの呼び出しも依存になることに注意します。この章のスクリプトは、関連は <code>reflect_on_all_associations</code> で、受け取ったオブジェクトは YARD の注記で数えましたが、initializer での設定は数えていません。
          </p>
          <h3>Packwerk でパッケージの間の依存を宣言する</h3>
          <p>
            アプリが大きくなり、app の下をいくつかのパッケージ（ディレクトリのまとまり）に分けるようになったら、Shopify が公開している gem の Packwerk を使う方法があります。Packwerk ではパッケージのディレクトリに置いた package.yml に、そのパッケージが依存してよいパッケージを <code>dependencies</code> として書きます。<code>enforce_dependencies: true</code> を指定すると、宣言していないパッケージの定数を参照している箇所を違反として報告します。<code>bin/packwerk validate</code> は、パッケージの間の依存に循環がないことも確かめます。Packwerk の説明はパッケージの原則を学ぶ資料として Martin の「Design Principles and Design Patterns」を紹介しています<Ref n={15} />。
          </p>
          <p>
            Packwerk は I を計算しません。安定依存の原則に沿った向きを package.yml の <code>dependencies</code> に書いておくと、その向きに反する参照が増えたときに、検査で見つけられます。Packwerk の README は、メソッドの呼び出しや受け渡されるオブジェクトは調べず、定数の参照だけを調べると書いています。そのうえで、型を定数で書く Sorbet の型シグネチャーを書けば、引数の型も調べられると説明しています<Ref n={14} />。この章のスクリプトが YARD の注記を読んだのと同じ考え方です。
          </p>
          <Callout kind="v72">
            <p>
              この章のスクリプトは、Zeitwerk の <code>cpath_expected_at</code>（Zeitwerk 2.6.9 で追加）<Ref n={16} />、Ruby の構文解析器 Prism（Ruby 3.3 で標準の gem になった）<Ref n={17} />、ブロックの引数を表す <code>it</code>（Ruby 3.4 で追加）<Ref n={18} />を使っています。Rails 7.2 の railties は zeitwerk を <code>~&gt; 2.6</code> で指定し、Ruby 3.1 以上で動きます<Ref n={20} />。Rails 7.2 のアプリでは、<code>bundle info zeitwerk</code> で版が 2.6.9 以上かを確かめてください。Ruby 3.2 以前では Gemfile に prism の gem を足し、<code>it</code> は <code>{'{ |x| ... }'}</code> のような名前付きの引数に書き換えます。Money が使う <code>Data.define</code> は Ruby 3.2 で加わった<Ref n={21} />ので、Ruby 3.1 では Money を Struct などで書き換える必要があります。<code>to_fs</code> は Rails 7.0 から使えます<Ref n={12} />。
            </p>
          </Callout>
          <h3>本書のほかの章</h3>
          <ul>
            <li>金額を値のクラスで表す理由と Money の作り方は<ChapterLink n={33} section="value-objects" />の説明と、<ChapterLink n={46} section="money" />の実装を参照できます。</li>
            <li>取り決めを挟んで依存の向きを変える方法は<ChapterLink n={67} />（DIP）、変えにくいクラスを変えずに拡張する方法は<ChapterLink n={64} />（OCP）で扱います。</li>
            <li>依存の数を減らす方法と、列への依存を数えるスクリプトは<ChapterLink n={70} />（Low Coupling）、変わりやすい判断を1つのクラスに隠す方法は<ChapterLink n={73} />（Information Hiding）で扱います。</li>
            <li>取り決めを足すかどうかの判断（YAGNI と DIP）は<ChapterLink n={93} section="yagni-dip" />で扱います。</li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          直すのは、多くのクラスに使われる変えにくいクラスが、業務の都合でよく変わるクラスに依存している所です。この章では、7つのクラスが使う Money から、セールのたびに変わる Campaign への依存をなくし、割引の計算を Campaign に移しました。不安定度 I の数値だけを直すための取り決めは足しません。
        </>
      ),
      benefit: {
        text: <>直す前は、定額の値引きを足すと、セールと関係のない送料・ポイント・返金・売上の集計を含む7つの spec ファイルの11件が失敗した。直した後は Money の I が 0.125 から 0.000 になり、同じ変更で失敗したのは product_spec.rb の1件だけで、Money と money_spec.rb は書き換えずに済んだ。</>,
        basis: <><ChapterLink n={75} section="scene" />、<ChapterLink n={75} section="apply" /></>,
      },
      cost: {
        text: <>Campaign が Money を使うようになり、Product は Campaign.price_for を呼ぶので依存先が2つから3つに増えた。作業は新しいメソッドを足す・呼び出し側を切り替える・古いメソッドを消す、の3つの手順に分け、手順ごとに spec を通す必要があった。</>,
        basis: <ChapterLink n={75} section="apply" />,
      },
      alternative: {
        text: <>直した後に残った Product（I = 0.600）から Campaign（I = 0.667）への依存は、Product に依存するクラスが2つだけなので、そのままにして変更の履歴で確かめる。取り決め PricingRule を足した例では、数値上の違反は消えたが、依存は initializer に移っただけで、実行時に呼ぶのは同じ Campaign.price_for だった。</>,
        basis: <ChapterLink n={75} section="overuse" />,
      },
      criterion: {
        text: <>依存先が業務の都合でよく変わるか。Rails や標準ライブラリのように変わる見込みが低いなら、I の大小に関係なくそのままにする。よく変わるなら、依存する側が多くのクラスに使われているかを確かめる。</>,
        basis: <ChapterLink n={75} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>安定依存の原則（SDP）は変更されやすいモジュールから、より安定したモジュールへ依存するという原則です。Robert C. Martin が The C++ Report の連載の記事「Stability」で、パッケージの間の依存の原則として示しました。</li>
          <li>Martin のいう安定度は、変わる見込みではなく変えることの難しさです。多くに依存され（Ca が大きい）、何にも依存しない（Ce が小さい）モジュールほど変えにくく、不安定度 I = Ce / (Ca + Ce) は 0 に近づきます。依存の向きは、I が減る向きにそろえます。</li>
          <li>Rails のアプリでは require を書かないので、定数の参照・関連・YARD の型の注記から依存を集めて I を数えました。7つのクラスが使う Money（I = 0.125）から、セールのたびに変わる Campaign（I = 0.500）への依存が、I の増える向きでした。</li>
          <li>割引の計算を Campaign.price_for と Campaign#apply に移すと、Money は何にも依存しなくなり（I = 0.000）、定額の値引きを足す変更で Money を書き換える必要がなくなりました。作業は新しいメソッドを足す・呼び出し側を切り替える・古いメソッドを消す、の3つの手順に分け、手順ごとに spec を通しました。</li>
          <li>I の数値を直すためだけに取り決めを足すと、依存は initializer に移って見えにくくなり、変更で直すファイルが増えます。直すかどうかは、依存先が業務の都合でよく変わるかと、依存する側が多くのクラスに使われているかで判断します。</li>
          <li>Rails の gem も activesupport（I = 0.00）に向かって依存しています。それでも Rails は「Progress over stability」の考え方で、非推奨の期間を置いて API を変えます。大きなアプリでは Packwerk でパッケージの間の依存を宣言し、検査で確かめられます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Stability', publisher: 'Robert C. Martin / The C++ Report（テキサス大学の教員のサイトに置かれた複製）', url: 'https://cs.utexas.edu/~downing/papers/Stability-1996.pdf', accessed: '2026-11-22', version: '連載 Engineering Notebook の6回目（前回までの記事として1996年1月号の OCP から1996年11・12月号の ADP までを挙げている）', note: 'SDP の定義（パッケージの間の依存は安定度の向きに沿い、自分より安定したパッケージにだけ依存する）、安定度を「Not easily moved」の意味で使い、変わる見込みではなく変えることの難しさとしたこと、良い依存と悪い依存、Independent と Responsible、Ca・Ce・I の定義と I は依存の向きに沿って小さくなるべきだという言い換え、1ファイル1クラスなら I を数えやすいこと、すべてのパッケージが安定ではいけないこと、SAP と、SDP と SAP を合わせるとパッケージの単位の DIP になること、(0,0) の付近の例外としてのデータベースのスキーマと文字列のパッケージ、結びの「数値は任意の基準に対する測定にすぎない」という注意。' },
    { title: 'The Principles of OOD', publisher: 'butunclebob.com / Robert C. Martin', url: 'http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod', accessed: '2026-11-22', note: 'SDP を「Depend in the direction of stability」、SAP を「Abstractness increases with stability」と1行で説明していること。' },
    { title: "Clean Architecture: A Craftsman's Guide to Software Structure and Design", publisher: 'Robert C. Martin / Pearson（InformIT の書籍ページの目次）', url: 'https://www.informit.com/store/clean-architecture-a-craftsmans-guide-to-software-structure-9780134494166', accessed: '2026-11-22', version: '2017年9月刊', note: '第14章「Component Coupling」に The Acyclic Dependencies Principle・The Stable Dependencies Principle・The Stable Abstractions Principle の節があること。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-22', note: '9つの柱の1つ「Progress over stability」の内容（長く使われたシステムは固まりやすいこと、ときには既存の動きを壊して変える必要があること、メジャーバージョンの互換性のない変更でアプリが壊れたときにこの価値観を思い出すこと）。' },
    { title: 'Autoloading and Reloading Constants', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html', accessed: '2026-11-22', version: 'Rails 8.1', note: 'Rails のアプリでは require を書かずにクラスを使えて、Zeitwerk のローダーが必要なときに読み込むこと。initializer は再読み込みされる定数を参照できず、起動時と再読み込みのたびに実行される to_prepare のブロックで包むこと。' },
    { title: 'README.md（Zeitwerk::Loader#cpath_expected_at）', publisher: 'fxn/zeitwerk（GitHub）', url: 'https://github.com/fxn/zeitwerk/blob/v2.8.3/README.md#zeitwerkloadercpath_expected_at', accessed: '2026-11-22', version: 'zeitwerk 2.8.3（手元の gem の README で確認）', note: 'cpath_expected_at がパスから、そのファイルが定義するはずの定数の名前を返すこと（app/models/user.rb なら User）。' },
    { title: 'module Prism / class Prism::ConstantPathNode', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Prism.html', accessed: '2026-11-22', version: 'prism 2.1.0 で実行', note: 'Prism が parse_file でファイルを構文木にできること。ConstantPathNode に full_name と compact_child_nodes があること（https://docs.ruby-lang.org/en/4.0/Prism/ConstantPathNode.html）。ConstantReadNode と ConstantPathNode の使い分けは script/instability.rb を実行して確認した。' },
    { title: 'activerecord/lib/active_record/reflection.rb（reflect_on_all_associations）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/reflection.rb#L101-L115`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'reflect_on_all_associations がクラスのすべての関連の AssociationReflection を返し、:has_many などで種類を絞れること。' },
    { title: 'Tags Overview', publisher: 'YARD / RubyDoc.info', url: 'https://rubydoc.info/gems/yard/file/docs/Tags.md', accessed: '2026-11-22', note: '@param と @return のタグに、角かっこで囲んだ型の一覧（types specifier list）を書けること。' },
    { title: 'activesupport/lib/active_support/core_ext/class/attribute.rb（class_attribute）', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/core_ext/class/attribute.rb#L7-L16`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'class_attribute がクラスの単位の属性を宣言し、インスタンスから読むメソッドを既定で作ること。' },
    { title: 'Maintenance Policy for Ruby on Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/maintenance_policy.html', accessed: '2026-11-22', note: 'Rails がずらした semver に従い、マイナーリリースでも API が変わりうること、互換性のない変更は前のマイナーまたはメジャーのリリースの非推奨の通知と組にすること。' },
    { title: 'Ruby on Rails 7.0 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/7_0_release_notes.html', accessed: '2026-11-22', note: 'Active Support の非推奨として、Integer などの #to_s に書式を渡すことを非推奨にし、#to_fs を勧めたこと。' },
    { title: 'Ruby on Rails 7.1 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/7_1_release_notes.html', accessed: '2026-11-22', note: 'Active Support の削除として、Integer などの #to_s に書式を渡す非推奨の書き方を削除したこと。' },
    { title: 'README.md（Packwerk）', publisher: 'Shopify/packwerk（GitHub）', url: 'https://github.com/Shopify/packwerk/blob/763eb1fada2eed6659f22805d1a9a1d5d7e88185/README.md#limitations', accessed: '2026-11-22', version: 'main ブランチのコミット 763eb1f', note: 'Packwerk が Rails のアプリの境界を守らせる gem であること。Limitations の項の、メソッドの呼び出しと受け渡されるオブジェクトは扱わず定数の参照だけを調べること、Sorbet の型シグネチャーを書けば引数の型も調べられること。' },
    { title: 'USAGE.md（Packwerk）', publisher: 'Shopify/packwerk（GitHub）', url: 'https://github.com/Shopify/packwerk/blob/763eb1fada2eed6659f22805d1a9a1d5d7e88185/USAGE.md', accessed: '2026-11-22', version: 'main ブランチのコミット 763eb1f', note: 'package.yml の enforce_dependencies と dependencies、宣言していないパッケージの定数の参照が違反になること、bin/packwerk validate が依存のグラフに循環がないことを確かめること、パッケージの原則として Martin の「Design Principles and Design Patterns」を紹介していること。' },
    { title: 'CHANGELOG.md（2.6.9）', publisher: 'fxn/zeitwerk（GitHub）', url: 'https://github.com/fxn/zeitwerk/blob/v2.8.3/CHANGELOG.md#269-25-july-2023', accessed: '2026-11-22', version: 'zeitwerk 2.8.3 のタグ', note: 'Zeitwerk::Loader#cpath_expected_at が 2.6.9（2023年7月25日）で加わったこと。' },
    { title: 'NEWS for Ruby 3.3.0', publisher: 'Ruby 3.3 Documentation', url: 'https://docs.ruby-lang.org/en/3.3/NEWS_md.html', accessed: '2026-11-22', note: 'prism が Ruby 3.3 で標準の gem（default gem）に加わったこと。' },
    { title: 'NEWS for Ruby 3.4.0', publisher: 'Ruby 3.4 Documentation', url: 'https://docs.ruby-lang.org/en/3.4/NEWS_md.html', accessed: '2026-11-22', note: 'ブロックの引数を参照する it が Ruby 3.4 で加わったこと。' },
    { title: 'class Gem::Specification（runtime_dependencies）／module Gem（loaded_specs）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Gem/Specification.html', accessed: '2026-11-22', note: 'runtime_dependencies が実行時に読み込まれる依存の一覧を返すこと。Gem.loaded_specs が読み込まれた Gem::Specification を名前で引くハッシュであること（https://docs.ruby-lang.org/en/4.0/Gem.html）。' },
    { title: 'railties/railties.gemspec（Rails 7.2 系）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/7-2-stable/railties/railties.gemspec#L47', accessed: '2026-11-22', version: '7-2-stable ブランチ', note: 'Rails 7.2 の railties が zeitwerk を "~> 2.6" で指定し、required_ruby_version が ">= 3.1.0" であること（L12）。' },
    { title: 'NEWS for Ruby 3.2.0', publisher: 'Ruby 3.2 Documentation', url: 'https://docs.ruby-lang.org/en/3.2/NEWS_md.html', accessed: '2026-11-22', note: '変更できない値のオブジェクトを表す core のクラス Data が Ruby 3.2 で加わったこと。' },
  ],
}

export default chapter
