import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.0.0'
const PUNDIT = 'https://github.com/varvet/pundit/blob/v2.5.2'

/* ---------- 図 77-1 条件分岐の木と戦略の一覧 ---------- */
function TreeVsTableFigure() {
  const node = (x: number, y: number, w: number, text: string, fs = 12) => <Box x={x} y={y} w={w} h={28} lines={text} fs={fs} />
  const rows: [string, string[], string[]][] = [
    ['standard', ['いつでも'], ['600円か0円', '＋地域の追加料金']],
    ['express', ['本土だけ'], ['900円', '＋2kg超は300円']],
    ['store_pickup', ['いつでも'], ['0円']],
    ['cool', ['離島以外', '10kg以下'], ['通常便の送料', '＋400円']],
  ]
  const cols = [
    { x: 430, w: 110 },
    { x: 540, w: 100 },
    { x: 640, w: 130 },
  ]
  return (
    <Svg
      id="77-1"
      w={780}
      h={430}
      label="適用前の Order#shipping_fee は、配送方法で分岐した後、通常便ではキャンペーン中か、ゴールド会員か、5,000円以上か、沖縄・離島かを順にたどり、お急ぎ便では沖縄・離島か、2kg超かをたどり、クール便では離島か、10kg超かをたどる。クール便の送料は通常便の計算を書き写していて、選べる条件は CheckoutsHelper にも別に書いている。適用後は、standard・express・store_pickup・cool の4行が、id・選べる条件・送料の計算を持つ一覧になる。キャンペーン中は standard を CampaignStandard に替える。配送方法を足すときは一覧に1行足し、画面の選択肢も同じ一覧から作る"
    >
      <T x={10} y={18} bold>
        適用前：入れ子の条件分岐（Order#shipping_fee）
      </T>
      <Box x={10} y={36} w={110} h={28} lines="配送方法は？" fs={12} fill="box5" />
      {node(150, 36, 100, '店舗で受け取り')}
      {node(150, 80, 100, '通常便')}
      {node(150, 226, 100, 'お急ぎ便')}
      {node(150, 304, 100, 'クール便')}
      <Arrow x1={120} y1={50} x2={148} y2={50} />
      <Arrow d="M65,64 L65,94 L148,94" />
      <Arrow d="M65,94 L65,240 L148,240" />
      <Arrow d="M65,240 L65,318 L148,318" />
      {node(270, 80, 120, 'キャンペーン中？')}
      {node(270, 114, 120, 'ゴールド会員？')}
      {node(270, 148, 120, '5,000円以上？', 11)}
      {node(270, 182, 120, '沖縄・離島？')}
      <Arrow x1={250} y1={94} x2={268} y2={94} />
      <Arrow x1={330} y1={108} x2={330} y2={112} />
      <Arrow x1={330} y1={142} x2={330} y2={146} />
      <Arrow x1={330} y1={176} x2={330} y2={180} />
      {node(270, 226, 120, '沖縄・離島？')}
      {node(270, 260, 120, '2kg超？')}
      <Arrow x1={250} y1={240} x2={268} y2={240} />
      <Arrow x1={330} y1={254} x2={330} y2={258} />
      {node(270, 304, 120, '離島？')}
      {node(270, 338, 120, '10kg超？')}
      <Arrow x1={250} y1={318} x2={268} y2={318} />
      <Arrow x1={330} y1={332} x2={330} y2={336} />
      <T x={10} y={392} fs={12} tone="danger">
        クール便の送料は、通常便の計算を書き写している
      </T>
      <T x={10} y={412} fs={12} tone="danger">
        選べる条件は、CheckoutsHelper にも別に書いている
      </T>

      <line x1={412} y1={10} x2={412} y2={420} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={430} y={18} bold>
        適用後：戦略の一覧（Shipping::METHODS）
      </T>
      {['id', '選べる条件', '送料の計算'].map((h, j) => (
        <Box key={h} x={cols[j].x} y={36} w={cols[j].w} h={30} lines={h} fs={12} fill="box5" bold rx={0} />
      ))}
      {rows.map((r, i) => (
        <g key={r[0]}>
          <Box x={cols[0].x} y={66 + i * 46} w={cols[0].w} h={46} lines={r[0]} fs={12} mono rx={0} />
          <Box x={cols[1].x} y={66 + i * 46} w={cols[1].w} h={46} lines={r[1]} fs={11} fill="bg" rx={0} />
          <Box x={cols[2].x} y={66 + i * 46} w={cols[2].w} h={46} lines={r[2]} fs={11} fill="bg" rx={0} />
        </g>
      ))}
      <Box x={430} y={262} w={340} h={44} lines={['キャンペーン中は standard の行を', 'CampaignStandard に替える']} fs={11} fill="box5" dashed rx={0} />
      <T x={430} y={334} fs={12}>
        配送方法を足すときは、一覧に1行足す
      </T>
      <T x={430} y={354} fs={12}>
        画面の選択肢も、送料の計算も、同じ一覧から作る
      </T>
    </Svg>
  )
}

/* ---------- 図 77-2 Strategy の構造 ---------- */
function StructureFigure() {
  const strategies = ['Standard', 'Express', 'StorePickup', 'Cool', 'CampaignStandard']
  return (
    <Svg
      id="77-2"
      w={780}
      h={320}
      label="CheckoutsHelper と Order#shipping_fee が Shipping を呼ぶ。Shipping は methods_at で一覧を選び、options と fee で戦略を呼ぶ。一覧は id から戦略を引く Hash の METHODS。戦略が守る取り決めは id・label・available?(order)・fee(order) で、Standard・Express・StorePickup・Cool・CampaignStandard の5つのクラスがそれを満たす。クール便やキャンペーン中の通常便は、一覧に足すだけで使える"
    >
      <Box x={20} y={20} w={200} h={36} lines="CheckoutsHelper（選択肢）" fs={12} />
      <Box x={20} y={66} w={200} h={36} lines="Order#shipping_fee" fs={12} mono />
      <Arrow x1={220} y1={38} x2={258} y2={50} />
      <Arrow x1={220} y1={84} x2={258} y2={72} />
      <Box x={260} y={20} w={240} h={82} lines={['Shipping', 'methods_at(time)：一覧を選ぶ', 'options・fee：戦略を呼ぶ']} fs={12} bold accent subTone="muted" />
      <Box x={540} y={20} w={220} h={82} lines={['取り決め', 'id・label', 'available?(order)', 'fee(order)']} fs={12} fill="box2" dashed bold subTone="muted" />
      <Arrow x1={500} y1={61} x2={538} y2={61} />
      <T x={519} y={50} anchor="middle" fs={11} tone="muted">
        呼ぶ
      </T>
      <Box x={260} y={130} w={240} h={32} lines="METHODS（id → 戦略の Hash）" fs={12} fill="box4" />
      <Arrow x1={380} y1={102} x2={380} y2={128} dashed />
      {strategies.map((name, i) => {
        const x = 20 + i * 150
        return (
          <g key={name}>
            <Box x={x} y={220} w={136} h={40} lines={name} fs={12} mono />
            <Arrow d={`M${x + 68},220 L${x + 68},190 L650,190 L650,104`} dashed />
          </g>
        )
      })}
      <T x={660} y={150} fs={11} tone="muted">
        満たす
      </T>
      <T x={20} y={292} fs={12} tone="muted">
        クール便やキャンペーン中の通常便も、一覧に足すだけで使える（Shipping と既存の戦略は変えない）
      </T>
    </Svg>
  )
}

/* ---------- 図 77-3 戦略を選ぶ処理と実行する処理 ---------- */
function SelectAndRunFigure() {
  return (
    <Svg
      id="77-3"
      w={780}
      h={210}
      label="Shipping.fee は order・method_id・at を受け取り、① methods_at(at) でその時点の一覧を選び、② 一覧から method_id で戦略を選び、③ 戦略の available?(order) で選べるかを確かめ、④ 戦略の fee(order) で計算する。①と②は使う側だけで行う選ぶ処理、③は戦略への問い合わせ、④は戦略が行う実行する処理。②で見つからないか③で選べなければ Shipping::Unavailable を投げる"
    >
      <T x={310} y={24} anchor="middle" fs={12} tone="acc" bold>
        選ぶ処理（Shipping だけで行う）
      </T>
      <T x={550} y={24} anchor="middle" fs={12} tone="muted">
        戦略に問い合わせる
      </T>
      <T x={705} y={24} anchor="middle" fs={12} tone="acc" bold>
        実行する処理（戦略）
      </T>
      <Box x={10} y={44} w={130} h={64} lines={['order', 'method_id', 'at']} fs={12} mono />
      <Box x={160} y={44} w={140} h={64} lines={['① methods_at(at)', 'その時点の一覧']} fs={12} fill="box5" subTone="muted" />
      <Box x={320} y={44} w={140} h={64} lines={['② 一覧[method_id]', 'id で選ぶ']} fs={12} fill="box5" subTone="muted" />
      <Box x={480} y={44} w={140} h={64} lines={['③ available?(order)', '選べるか']} fs={12} subTone="muted" />
      <Box x={640} y={44} w={130} h={64} lines={['④ fee(order)', '送料を計算']} fs={12} accent subTone="muted" />
      <Arrow x1={140} y1={76} x2={158} y2={76} />
      <Arrow x1={300} y1={76} x2={318} y2={76} />
      <Arrow x1={460} y1={76} x2={478} y2={76} />
      <Arrow x1={620} y1={76} x2={638} y2={76} />
      <Arrow x1={390} y1={108} x2={440} y2={148} />
      <Arrow x1={550} y1={108} x2={500} y2={148} />
      <T x={404} y={128} fs={11} tone="danger" anchor="end">
        見つからない
      </T>
      <T x={556} y={128} fs={11} tone="danger">
        選べない
      </T>
      <Box x={370} y={150} w={200} h={32} lines="Shipping::Unavailable" fs={12} mono dashed />
    </Svg>
  )
}

/* ---------- 図 77-4 編集を許可するルールの組み合わせ ---------- */
function RuleTreeFigure() {
  return (
    <Svg
      id="77-4"
      w={760}
      h={320}
      label="update?（編集）は、active? かつ、admin? または（editor? かつ same_department?）という組み合わせ。publish?（公開）は update? かつ価格があること。destroy?（削除）は active? かつ admin? かつ下書きであること"
    >
      <T x={20} y={27} bold>
        update?（編集）
      </T>
      <Box x={260} y={10} w={120} h={34} lines="かつ（&&）" fs={12} fill="box5" />
      <Box x={110} y={80} w={120} h={34} lines="active?" fs={12} mono />
      <Box x={380} y={80} w={130} h={34} lines="または（||）" fs={12} fill="box5" />
      <Box x={290} y={150} w={110} h={34} lines="admin?" fs={12} mono />
      <Box x={470} y={150} w={120} h={34} lines="かつ（&&）" fs={12} fill="box5" />
      <Box x={410} y={220} w={110} h={34} lines="editor?" fs={12} mono />
      <Box x={540} y={220} w={180} h={34} lines="same_department?" fs={12} mono />
      <Arrow x1={290} y1={44} x2={180} y2={78} />
      <Arrow x1={350} y1={44} x2={440} y2={78} />
      <Arrow x1={420} y1={114} x2={350} y2={148} />
      <Arrow x1={470} y1={114} x2={525} y2={148} />
      <Arrow x1={510} y1={184} x2={470} y2={218} />
      <Arrow x1={560} y1={184} x2={625} y2={218} />
      <T x={20} y={282} fs={12} tone="muted">
        publish?（公開）＝ update? かつ 価格がある（record.price.present?）
      </T>
      <T x={20} y={304} fs={12} tone="muted">
        destroy?（削除）＝ active? かつ admin? かつ 下書き（record.draft?）
      </T>
    </Svg>
  )
}

/* ---------- 図 77-5 利用者と操作の判断表 ---------- */
const decisionRows: [string, string[]][] = [
  ['管理者', ['○', '○', '○（価格が必要）', '○（下書きのみ）']],
  ['編集者（同じ部署）', ['○', '○', '○（価格が必要）', '×']],
  ['編集者（別の部署）', ['○', '×', '×', '×']],
  ['閲覧者', ['○', '×', '×', '×']],
  ['停止中の利用者', ['×', '×', '×', '×']],
]

function DecisionTableFigure() {
  const heads = [
    ['閲覧', 'show?'],
    ['編集', 'update?'],
    ['公開', 'publish?'],
    ['削除', 'destroy?'],
  ]
  const x0 = 10
  const firstW = 200
  const colW = 135
  return (
    <Svg
      id="77-5"
      w={760}
      h={262}
      label={`利用者と操作の判断表。○は許可、×は拒否。${decisionRows.map(([u, c]) => `${u}：閲覧${c[0]}、編集${c[1]}、公開${c[2]}、削除${c[3]}`).join('。')}`}
    >
      <Box x={x0} y={10} w={firstW} h={42} lines="利用者" fs={12} fill="box5" bold rx={0} />
      {heads.map((h, j) => (
        <Box key={h[1]} x={x0 + firstW + j * colW} y={10} w={colW} h={42} lines={h} fs={12} fill="box5" bold rx={0} />
      ))}
      {decisionRows.map(([u, cells], i) => {
        const y = 52 + i * 40
        return (
          <g key={u}>
            <Box x={x0} y={y} w={firstW} h={40} lines={u} fs={12} rx={0} align="start" />
            {cells.map((c, j) => (
              <g key={j}>
                <Box x={x0 + firstW + j * colW} y={y} w={colW} h={40} fill="bg" rx={0} />
                <T x={x0 + firstW + j * colW + colW / 2} y={y + 20} anchor="middle" fs={12} tone={c.startsWith('○') ? 'acc' : 'muted'} bold={c.startsWith('○')}>
                  {c}
                </T>
              </g>
            ))}
          </g>
        )
      })}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 41,
  part: 9,
  title: 'Strategy / Policy：送料の計算と管理画面の認可を切り替える',
  summary:
    '配送方法・クール便・離島・送料無料キャンペーンで条件分岐が増えた送料の計算を、配送方法ごとの戦略のクラスに分けて一覧から選ぶ形に直します。画面と API で別々に書かれて食い違っていた商品の編集の認可は、Pundit の Policy にまとめ、小さなルールの組み合わせと判断表で確かめます。',
  goals: [
    '条件分岐に業務のルールが積み重なったコードで、ルールの追加と画面との食い違いが起きる理由を説明できる',
    'Strategy の3つの要素（取り決め、個々の戦略、戦略を選んで使う側）と、戦略を選ぶ処理と実行する処理の分け方を説明できる',
    '送料の戦略をクラスまたは lambda で書き、Hash の一覧から選ぶコードを Rails で書ける',
    '認可のルールを Pundit の Policy にまとめ、authorize・policy_scope・verify_authorized を使って画面と API で同じ判断を使える',
    '小さなルールの組み合わせを判断表にし、その表に対応させて Policy のテストを書ける',
    'case 文や料金表のデータで足りる場合と、Strategy・Pundit・Action Policy・CanCanCan を使う場合を判断できる',
  ],
  prerequisites: [21, 33, 40],
  sections: [
    {
      id: 'scene',
      title: '増え続ける送料の条件分岐と、画面と API で食い違う認可',
      body: (
        <>
          <p>
            この章では EC サイトの送料の計算と、商品を管理する画面の認可を例に、Strategy と Policy を扱います。<ChapterLink n={33} section="design-patterns" />の「Strategy・Null Object・Factory・Command の小さな実装」では、送料の計算方針を2つのクラスに分ける小さな例を示しました。<ChapterLink n={21} section="object-authorization" />の「所有者・ロールとレコードの認可」では、Pundit の <code>authorize</code> と <code>policy_scope</code> を紹介しました。この章では、条件分岐が実際に増えていくコードから始めて、戦略を選ぶ処理と実行する処理の分け方、認可のルールの組み合わせ方とテストの書き方を、動かしたコードで確かめます。
          </p>
          <h3>そもそも送料はどう決まるのか</h3>
          <p>
            このサイトでは、注文の画面で利用者が配送方法を選び、選んだ配送方法で送料が決まります。送料は、商品の合計金額、荷物の重さ、届け先の地域（本土・沖縄・離島）、会員ランク（通常・ゴールド）によって変わります。最初は通常便・お急ぎ便・店舗で受け取りの3つでしたが、冷蔵の商品を扱うためにクール便を足し、年末には送料無料キャンペーンを行うことになりました。現在の決まりは次のとおりです。金額は円の整数で扱います。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">配送方法</th>
                  <th scope="col">選べる条件</th>
                  <th scope="col">送料</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">通常便</th>
                  <td>いつでも</td>
                  <td>600円。合計 5,000 円以上かゴールド会員なら0円。沖縄・離島は 1,200 円を加算</td>
                </tr>
                <tr>
                  <th scope="row">お急ぎ便</th>
                  <td>本土だけ</td>
                  <td>900円。2kg を超えると 300 円を加算</td>
                </tr>
                <tr>
                  <th scope="row">店舗で受け取り</th>
                  <td>いつでも</td>
                  <td>0円</td>
                </tr>
                <tr>
                  <th scope="row">クール便（追加）</th>
                  <td>離島以外で、10kg 以下</td>
                  <td>通常便の送料に 400 円を加算</td>
                </tr>
                <tr>
                  <th scope="row">送料無料キャンペーン（追加）</th>
                  <td>12月1日〜7日の注文</td>
                  <td>通常便の基本料金を0円にする。沖縄・離島の追加料金はかかる</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>モデルとヘルパーに書いた送料</h3>
          <p>注文は orders テーブルに保存し、地域と会員ランクを <code>enum</code> で表しています。送料は Order のメソッドに配送方法ごとの case で書いています。</p>
          <Code
            lang="ruby"
            title="app/models/order.rb（適用前）"
            code={`
class Order < ApplicationRecord
  enum :region, { mainland: "mainland", okinawa: "okinawa", remote_island: "remote_island" }
  enum :member_rank, { regular: "regular", gold: "gold" }

  # 送料無料キャンペーンの期間（終わりは含まない）
  CAMPAIGN_PERIOD = Time.zone.local(2026, 12, 1)...Time.zone.local(2026, 12, 8)

  # 送料（円）。配送方法ごとの規則が、このメソッドの case に集まっている
  def shipping_fee
    case shipping_method
    when "store_pickup"
      0
    when "standard"
      # ① キャンペーン・会員ランク・合計金額・地域の条件が入り組んでいる
      return(mainland? ? 0 : 1200) if CAMPAIGN_PERIOD.cover?(Time.current)
      return(mainland? ? 0 : 1200) if gold?

      fee = subtotal >= 5000 ? 0 : 600
      fee += 1200 unless mainland?
      fee
    when "express"
      raise ArgumentError, "お急ぎ便は沖縄・離島には配送できません" unless mainland?

      900 + (weight_grams > 2000 ? 300 : 0)
    when "cool"
      # ② 後から足した。通常便の計算を書き写し、条件も別に書いている
      raise ArgumentError, "クール便は離島には配送できません" if remote_island?
      raise ArgumentError, "クール便は10kgまでです" if weight_grams > 10_000

      fee = gold? || subtotal >= 5000 ? 0 : 600
      fee += 1200 unless mainland?
      fee + 400
    else
      raise ArgumentError, "不明な配送方法: #{shipping_method}"
    end
  end
end
`}
          />
          <p>注文の画面に出す配送方法の選択肢は、ビューのヘルパーで作っています。どの配送方法を選べるかを、送料の計算とは別に書いています。</p>
          <Code
            lang="ruby"
            title="app/helpers/checkouts_helper.rb（適用前）"
            code={`
module CheckoutsHelper
  # 注文の画面に出す配送方法の選択肢。選べる条件を、送料の計算とは別に書いている
  def shipping_options_for(order)
    options = [["通常便", "standard"], ["店舗で受け取り", "store_pickup"]]
    options << ["お急ぎ便", "express"] if order.mainland?
    options << ["クール便", "cool"] if order.weight_grams <= 10_000 # ③ 離島の条件を書き忘れた
    options
  end
end
`}
          />
          <p>本土・沖縄・離島の3つの注文（合計 3,000 円、1.5kg、通常会員）について、画面に出る選択肢ごとに送料を計算しました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner。選択肢ごとに order.shipping_fee を呼んだ）"
            code={`
本土: 通常便=600円 / 店舗で受け取り=0円 / お急ぎ便=900円 / クール便=1000円
沖縄: 通常便=1800円 / 店舗で受け取り=0円 / クール便=2200円
離島: 通常便=1800円 / 店舗で受け取り=0円 / クール便=ArgumentError（クール便は離島には配送できません）
`}
          />
          <p>
            離島の注文の画面にはクール便が表示されますが、選ぶと送料の計算が ArgumentError になります。クール便を足したとき、選べる条件をモデルの case とヘルパーの2か所に書く必要があり、ヘルパーで離島の条件を書き忘れたからです。送料の計算もクール便の分岐に通常便の計算を書き写しているので、通常便の規則を変えるときは2か所を直すことになります。
          </p>
          <h3>画面と API に書いた認可</h3>
          <p>
            商品を管理する画面は、社内の利用者が使います。利用者には役割（管理者・編集者・閲覧者）と担当の部署（食品の food、書籍の books など）があり、退職や休職で利用を止めた利用者は <code>active</code> が false になります。商品を編集してよいのは、利用中の利用者のうち、管理者か、商品と同じ部署の編集者です。
          </p>
          <p>
            商品の価格は管理画面のフォーム（Admin::ProductsController）と、一覧の画面の JavaScript から価格だけを直す API（Api::ProductsController）の2つの経路で更新できます。2つのコントローラーはそれぞれ自分で権限を確かめています。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/admin/products_controller.rb（適用前）"
            code={`
class Admin::ProductsController < ApplicationController
  def update
    @product = Product.find(params[:id])
    # 画面：利用中で、管理者か同じ部署の編集者なら更新できる
    unless current_user.active? &&
           (current_user.admin? || (current_user.editor? && current_user.department == @product.department))
      return render plain: "この操作を行う権限がありません", status: :forbidden
    end

    @product.update!(params.expect(product: [:name, :price]))
    redirect_to admin_products_path, notice: "更新しました"
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/api/products_controller.rb（適用前）"
            code={`
class Api::ProductsController < ApplicationController
  def update
    product = Product.find(params[:id])
    # API：管理者か編集者なら更新できる（部署と利用停止の確認が抜けている）
    return head :forbidden unless current_user.admin? || current_user.editor?

    product.update!(params.expect(product: [:price]))
    render json: product.slice(:id, :name, :price)
  end
end
`}
          />
          <p>5種類の利用者でログインし、食品の部署の商品の価格を、画面と API からそれぞれ 1,500 円に変える検証用の spec を実行しました。</p>
          <Code
            lang="ruby"
            title="検証用の spec（画面と API に同じ更新を送る。一部を省略）"
            code={`
users.each do |name, attrs|
  it "#{name}：画面と API で同じ判断になる" do
    log_in(User.create!(name:, email: "…", **attrs))

    patch admin_product_path(product), params: { product: { price: 1500 } }
    screen = product.reload.price == 1500
    product.update!(price: 1200)

    patch api_product_path(product), params: { price: 1500 }, as: :json
    api = product.reload.price == 1500

    puts format("%-12s 画面=%s API=%s", name, screen ? "更新できた" : "拒否", api ? "更新できた" : "拒否")
    expect(api).to eq screen
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --order defined。失敗の詳細は一部を省略）"
            code={`
管理者          画面=更新できた API=更新できた
同じ部署の編集者     画面=更新できた API=更新できた
別の部署の編集者     画面=拒否 API=更新できた
閲覧者          画面=拒否 API=拒否
停止中の管理者      画面=拒否 API=更新できた

  1) 商品の更新：画面と API 別の部署の編集者：画面と API で同じ判断になる
       expected: false
            got: true

  2) 商品の更新：画面と API 停止中の管理者：画面と API で同じ判断になる
       expected: false
            got: true

5 examples, 2 failures
`}
          />
          <p>
            別の部署の編集者と停止中の管理者は、画面からは拒否されたのに、API からは価格を変えられました。API の条件では、部署と利用停止の確認が抜けています。画面の一覧に編集のボタンを出すかどうかもビューで別に判断していれば、同じ規則を3か所に書いていることになります。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>送料の①：通常便の分岐の中で、キャンペーン・会員ランク・合計金額・地域の条件が入り組んでいます。「ゴールド会員は沖縄・離島でも追加料金なし」のような変更が来たとき、ほかの条件との関係を読み解いてから直すことになります。</li>
            <li>送料の②③：配送方法を足すと、case に分岐を足すだけでなく、ヘルパーの選択肢も別に直す必要があります。クール便を足したときは、ヘルパーで離島の条件を書き忘れ、画面で選べるのに計算できない選択肢ができました。</li>
            <li>送料の④：キャンペーンの判断が <code>Time.current</code> を直接読んでいるので、キャンペーン中の送料を確かめるテストには、時刻を動かす仕組みが必要です。</li>
            <li>認可の①：「利用中で、管理者か同じ部署の編集者か」という判断が、画面・API・ビューのボタンに繰り返し出てきます。</li>
            <li>認可の②：同じ規則を何か所にも書くと、少しずつ違う条件が生まれます。API で部署と利用停止の確認が抜けたように、どれが正しい規則かがコードから読み取れなくなります。</li>
          </ul>
          <p>
            どちらの問題も、変わりやすいルール（送料の計算の方法、許可の判断）が、使う側のコードの条件分岐に埋まっていることから起きています。次の節で、ルールを取り出して交換できる単位にする考え方を説明します。
          </p>
        </>
      ),
    },
    {
      id: 'idea',
      title: '計算と判断のルールを取り出す：Strategy と Policy の考え方',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term en="Strategy">Strategy</Term> は、同じ目的を果たす複数の計算の方法（アルゴリズム）を、それぞれ独立した部品にして、使う側を変えずに交換できるようにするパターンです。GoF（Gamma・Helm・Johnson・Vlissides の4人が1994年に書いた『Design Patterns』）は目的を「アルゴリズムの集まりを定義し、それぞれをカプセル化して、交換できるようにする。Strategy によって、アルゴリズムを使う側から独立してアルゴリズムを変えられる」と書いています<Ref n={1} /><Ref n={2} />。
          </p>
          <p>
            この章の題材では、送料の計算の方法が配送方法ごとに違います。適用前は、この違いを1つのメソッドの case で表していました。Strategy を適用すると、配送方法ごとの計算がそれぞれ別のクラスになり、配送方法を増やすときに既存の計算を変えずに済みます。
          </p>
          <p>
            GoF は Strategy の別名として Policy を挙げています<Ref n={1} />。Eric Evans の『Domain-Driven Design』も、設計パターンを業務のモデルに結び付ける第12章に「STRATEGY（別名 POLICY）」という節を置いています<Ref n={3} />。MSDP のカタログでは、2つの名前を次のように呼び分けます。
          </p>
          <ul>
            <li>Strategy：計算の方法を交換します。送料の計算、料金の計算、検索条件の作り方などで、結果は金額や条件などの値です。</li>
            <li>Policy：許可するかどうか、条件を満たすかどうかの判断のルールをまとめ、小さなルールを組み合わせます。認可や入力の受け付けの可否などで、結果は真か偽です。</li>
          </ul>
          <p>
            Rails でよく使われる認可の gem の Pundit は、認可のルールを置くクラスを ProductPolicy のように「〜Policy」と名付けます。なお、C++ の「Policy-based design」（Andrei Alexandrescu、2001年<Ref n={12} />）は、C++ のテンプレート（型を引数に取ってクラスを作る仕組み）を使い、コンパイルの時点で振る舞いを組み立てる手法で、この章の Policy とは別のものです。
          </p>
          <h3>使う場面</h3>
          <p>業務のルールは事業の都合で頻繁に変わります。送料を無料にする条件、会員ランクごとの特典、配送方法の追加、権限の範囲の変更などです。典型的な使い方は次のとおりです。</p>
          <ul>
            <li>料金の計算：送料、手数料、割引、税の計算方法を、条件に応じて切り替える</li>
            <li>認可のルール：利用者の役割と対象のデータの関係から、操作を許可するかを判断する</li>
            <li>検索条件の作り方：画面の絞り込みの種類ごとに、検索の条件を組み立てる</li>
            <li>通知方法の選択：メール、プッシュ通知、SMS を利用者の設定で切り替える</li>
          </ul>
          <p>Rails のコードに次の兆候があれば、Strategy / Policy が必要になっているかもしれません。</p>
          <ul>
            <li>同じ値（配送方法、プランの種類、役割など）で分岐する case が、モデル・ヘルパー・コントローラーに繰り返し出てくる</li>
            <li>ルールを1つ足すたびに、同じメソッドのテストを全部やり直す必要がある</li>
            <li>画面の表示（ボタンを出すか）と API の処理（実行してよいか）で、同じ判断を別々に書いている</li>
            <li>メソッドの引数に <code>express:</code> や <code>gold:</code> のような真偽値のフラグが増えていく</li>
          </ul>
          <h3>設計上の制約</h3>
          <ul>
            <li>ルールの全体を1か所で見渡したい。一方で、ルールを1つずつ独立して変更し、テストしたい。</li>
            <li>新しいルールを、既存のコードを変えずに追加したい。一方で、部品を分けすぎると、どのルールが使われるかを追うのに手間がかかる。</li>
            <li>ルールごとに必要なデータが違う（送料には重さと地域、認可には利用者と商品）。一方で、使う側からは同じ形で呼び出したい。</li>
            <li>ルールを組み合わせて使いたい（「管理者、または同じ部署の編集者」）。一方で、組み合わせの書き方が複雑になると、条件分岐より読みにくくなる。</li>
          </ul>
          <h3>解決方法</h3>
          <p>Strategy は、次の3つの要素で組み立てます。GoF での名前を括弧内に示します。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">この章の例</th>
                  <th scope="col">責務</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">戦略の取り決め（Strategy）</th>
                  <td><code>id</code>・<code>label</code>・<code>available?(order)</code>・<code>fee(order)</code> に応答すること（コメントで示す）</td>
                  <td>どの戦略も持つメソッドを決める</td>
                </tr>
                <tr>
                  <th scope="row">個々の戦略（ConcreteStrategy）</th>
                  <td>Shipping::Standard・Express・StorePickup・Cool・CampaignStandard</td>
                  <td>1つの計算方法を実装する。ほかの戦略を知らない</td>
                </tr>
                <tr>
                  <th scope="row">戦略を選んで使う側（Context）</th>
                  <td>Shipping.options・Shipping.fee</td>
                  <td>どの戦略を使うかを選び、選んだ戦略を呼び出す。計算の中身は知らない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Strategy を使っても、「どの戦略を使うかを選ぶ処理」はなくなりません。適用前は、選ぶ処理と計算の処理が同じ case に混ざっていました。適用後は、選ぶ処理（id で一覧から探す、キャンペーン中かで一覧を替える）だけが使う側に残り、計算は戦略の中に移ります。Martin Fowler のリファクタリングのカタログにある「条件分岐をポリモーフィズムに置き換える」は、この変更を小さな手順で行う方法です<Ref n={4} />。<Term en="polymorphism">ポリモーフィズム</Term>は、同じ名前のメソッドを呼んでも、オブジェクトごとに違う処理が実行される性質のことです。この章では、どの戦略も <code>fee(order)</code> という同じ名前のメソッドを持ち、Shipping.fee はどの戦略かを調べずに fee を呼びます。
          </p>
          <h3>関数か、オブジェクトか</h3>
          <p>
            戦略が1つの計算だけなら、クラスを作らず lambda をそのまま戦略にできます。Ruby の lambda は、処理をオブジェクトとして変数や Hash に入れ、<code>call</code> で呼び出せます。次の例は、支払い方法ごとの手数料を lambda の Hash で表しています。
          </p>
          <Code
            lang="ruby"
            title="app/models/payment_fee.rb"
            code={`
# 支払い方法ごとの手数料（円）。戦略が1つの計算だけなので lambda で書く
module PaymentFee
  RULES = {
    "card" => ->(_order) { 0 },
    "cash_on_delivery" => ->(order) { order.subtotal >= 10_000 ? 440 : 330 },
    "convenience_store" => ->(_order) { 200 },
  }.freeze

  def self.for(order, payment_method) = RULES.fetch(payment_method).call(order)
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner）"
            code={`
PaymentFee.for(Order.new(subtotal: 3000), "cash_on_delivery")  # => 330
PaymentFee.for(Order.new(subtotal: 3000), "Kernel")            # => KeyError: key not found: "Kernel"
`}
          />
          <p>
            この章の配送方法は id・画面に出す名前・選べるかどうかの判断・送料の計算の4つを持つので、クラスにまとめます。どちらの書き方でも、戦略は Hash の一覧から、アプリが決めたキーで選びます。画面から送られた文字列を <code>constantize</code> でクラスに変えると、利用者が意図しないクラスを作らせることができるので、一覧にないキーは <code>KeyError</code> などで拒否します。
          </p>
          <h3>Policy：小さなルールを組み合わせる</h3>
          <p>
            Policy では、「利用中である」「管理者である」「同じ部署である」のような小さなルールを作り、それを「かつ」「または」で組み合わせて、操作ごとの判断を作ります。Evans と Fowler は、条件を満たすかを判断するオブジェクトを<Term en="Specification">Specification</Term>と呼び、かつ（and）・または（or）・否定（not）で組み合わせる方法を示しています<Ref n={5} />。この章の ProductPolicy は、小さなルールを private メソッドにし、<code>&amp;&amp;</code> と <code>||</code> で組み合わせます。組み合わせの構造と判断表は「Pundit で認可を Policy にまとめる」の節で図にします。
          </p>
          <h3>構造</h3>
          <p>
            図 77-1 は、適用前と適用後で送料のルールがどう表されるかを比べたものです。適用前のルールは、分岐の中にさらに分岐がある入れ子の条件分岐で、図では枝分かれする木の形で描いています。配送方法を足すには、この木のどこかに枝を足し、ヘルパーの選択肢も別に直します。適用後は、配送方法ごとの行が並んだ一覧になり、配送方法を足すには行を1つ足します。
          </p>
          <Figure n="77-1" title="条件分岐の木と戦略の一覧" caption="模式図。適用後の表の1行が、1つの戦略（取り決めを満たすオブジェクト）に当たる。">
            <TreeVsTableFigure />
          </Figure>
          <p>
            図 77-2 は適用後の構造です。Shipping.options と Shipping.fee は、METHODS の Hash から戦略を取り出し、各戦略の available? と fee を呼ぶだけです。個々の配送方法がどう送料を計算するかは知りません。後から足したクール便も、キャンペーン中の通常便も、既存の戦略と Shipping のメソッドを変えずに、一覧に足すだけで使えます。
          </p>
          <Figure n="77-2" title="Strategy の構造" caption="破線の箱は Ruby では宣言しない取り決め。破線の矢印は、戦略が取り決めを満たすことと、Shipping が一覧を参照することを表す。">
            <StructureFigure />
          </Figure>
          <p>
            図 77-3 は、送料を求めるときの処理の順序です。①でその時点の一覧を選び、②で id から戦略を選び、③でその注文に使えるかを確かめ、④で計算します。①と②は Shipping だけで行う選ぶ処理です。③と④は Shipping が戦略のメソッドを呼びますが、条件と計算の中身は戦略の側にだけ書かれています。②で見つからないか、③で選べなければ、Shipping::Unavailable を投げます。
          </p>
          <Figure n="77-3" title="戦略を選ぶ処理と実行する処理" caption="Shipping.fee の処理の順序。">
            <SelectAndRunFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装：送料の戦略を一覧から選ぶ',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  models/order.rb                     # shipping_fee は Shipping に任せる
  models/shipping.rb                  # 戦略を選んで使う側（一覧・選ぶ処理）
  models/shipping/standard.rb         # 個々の戦略
  models/shipping/express.rb
  models/shipping/store_pickup.rb
  models/shipping/cool.rb
  models/shipping/campaign_standard.rb
  models/payment_fee.rb               # lambda の戦略
  helpers/checkouts_helper.rb         # 選択肢も Shipping から作る
  policies/application_policy.rb      # rails g pundit:install で作る
  policies/product_policy.rb          # 認可（次の節）
db/migrate/20261121000001_create_users_products_orders.rb
`}
          />
          <p>
            戦略は DB のテーブルを持たない普通の Ruby のクラスですが、業務のルールなので app/models/shipping に置きました。app/models/shipping.rb が <code>Shipping</code> モジュールを定義し、app/models/shipping/standard.rb が <code>Shipping::Standard</code> を定義する、という対応で Rails が自動で読み込みます。
          </p>
          <h3>マイグレーション</h3>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_users_products_orders.rb"
            code={`
class CreateUsersProductsOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false, index: { unique: true }
      t.string :role, null: false            # admin・editor・viewer
      t.string :department, null: false      # 担当する部署（food・books など）
      t.boolean :active, null: false, default: true # false なら利用停止中
      t.timestamps
    end

    create_table :products do |t|
      t.string :name, null: false
      t.string :department, null: false
      t.integer :price                       # 円。未設定なら NULL
      t.string :status, null: false, default: "draft" # draft・published
      t.timestamps
    end

    create_table :orders do |t|
      t.integer :subtotal, null: false       # 商品の合計（円）
      t.integer :weight_grams, null: false
      t.string :region, null: false          # mainland・okinawa・remote_island
      t.string :member_rank, null: false, default: "regular" # regular・gold
      t.string :shipping_method, null: false
      t.timestamps
    end
  end
end
`}
          />
          <p>
            役割・地域・状態は MySQL の文字列の列に保存し、モデルの <code>enum</code> で <code>admin?</code>・<code>mainland?</code>・<code>draft?</code> のような判定のメソッドを作ります。shipping_method の列には戦略の id（<code>"standard"</code> など）を保存します。列に保存するのは id なので、戦略のクラスの名前を変えても保存済みの注文は影響を受けません。
          </p>
          <h3>個々の戦略</h3>
          <Code
            lang="ruby"
            title="app/models/shipping/standard.rb"
            code={`
class Shipping::Standard
  def id = "standard"
  def label = "通常便"
  def available?(_order) = true

  def fee(order)
    base = order.gold? || order.subtotal >= 5000 ? 0 : 600
    base + Shipping.remote_surcharge(order)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/shipping/express.rb・store_pickup.rb・cool.rb・campaign_standard.rb"
            code={`
class Shipping::Express
  def id = "express"
  def label = "お急ぎ便"
  def available?(order) = order.mainland?
  def fee(order) = 900 + (order.weight_grams > 2000 ? 300 : 0)
end

class Shipping::StorePickup
  def id = "store_pickup"
  def label = "店舗で受け取り"
  def available?(_order) = true
  def fee(_order) = 0
end

class Shipping::Cool
  def id = "cool"
  def label = "クール便"
  def available?(order) = !order.remote_island? && order.weight_grams <= 10_000
  def fee(order) = Shipping::Standard.new.fee(order) + 400
end

# 送料無料キャンペーン中の通常便。基本料金を0円にし、沖縄・離島の追加料金だけを請求する
class Shipping::CampaignStandard
  def id = "standard"
  def label = "通常便（送料無料キャンペーン中）"
  def available?(_order) = true
  def fee(order) = Shipping.remote_surcharge(order)
end
`}
          />
          <p>
            どの戦略も <code>id</code>・<code>label</code>・<code>available?</code>・<code>fee</code> に応答するという取り決めを守ります。Ruby ではこの取り決めを型として宣言せず、同じ名前のメソッドを持つことで満たします。この書き方を<Term en="duck typing">ダックタイピング</Term>と呼びます。<code>def id = "standard"</code> は、1行で書くメソッドの定義です。
          </p>
          <p>
            選べる条件（available?）と送料の計算（fee）が同じクラスにあるので、クール便の「離島では選べない」という規則は Cool の1か所にだけ書かれます。クール便の送料は、通常便の計算を書き写さずに Standard の fee を呼んでいます。キャンペーン中の通常便は、Standard を書き換えずに、別の戦略 CampaignStandard として足しました。
          </p>
          <h3>戦略を選んで使う側</h3>
          <Code
            lang="ruby"
            title="app/models/shipping.rb"
            code={`
# 配送方法（戦略）を選んで使う側。
# どの配送方法も id・label・available?(order)・fee(order) に応答する（共通の取り決め）
module Shipping
  class Unavailable < StandardError; end

  # 配送方法の一覧（id => 戦略）。配送方法を増やすときは、ここに1つ足す
  METHODS = [Standard.new, Express.new, StorePickup.new, Cool.new].index_by(&:id).freeze

  # 送料無料キャンペーンの期間（終わりは含まない）
  CAMPAIGN_PERIOD = Time.zone.local(2026, 12, 1)...Time.zone.local(2026, 12, 8)

  # 選ぶ処理①：その時点で使う一覧。キャンペーン中は通常便を CampaignStandard に替える
  def self.methods_at(time)
    CAMPAIGN_PERIOD.cover?(time) ? METHODS.merge("standard" => CampaignStandard.new) : METHODS
  end

  # 画面に出す選択肢：選べる配送方法と送料
  def self.options(order, at: Time.current)
    methods_at(at).values.select { |m| m.available?(order) }
                  .map { |m| { id: m.id, label: m.label, fee: m.fee(order) } }
  end

  # 選ぶ処理②：id で選び、選べるかを確かめる。実行する処理：選んだ戦略の fee を呼ぶ
  def self.fee(order, method_id, at: Time.current)
    method = methods_at(at)[method_id]
    raise Unavailable, "この注文では選べない配送方法です: #{method_id}" unless method&.available?(order)

    method.fee(order)
  end

  # 沖縄・離島の追加料金。複数の配送方法が使う
  def self.remote_surcharge(order) = order.mainland? ? 0 : 1200
end
`}
          />
          <p>
            <code>index_by(&amp;:id)</code> は Active Support のメソッドで、配列の要素を id をキーにした Hash に変えます。METHODS は <code>{'{ "standard" => Standard のインスタンス, "express" => …, … }'}</code> になり、<code>methods_at(at)[method_id]</code> で id から戦略を選べます。戦略は状態を持たないので、インスタンスを1つずつ作って使い回し、<code>freeze</code> で一覧を書き換えられないようにしています。
          </p>
          <p>
            キャンペーン中かどうかは、選ぶ処理（methods_at）だけが判断します。期間中は <code>merge</code> で standard の行だけを CampaignStandard に替えた一覧を返し、期間外は METHODS をそのまま返します。戦略の側は時刻を知らないので、戦略のテストに時刻は要りません。現在時刻は <code>at:</code> の引数で受け取り、既定値を <code>Time.current</code> にしています。<ChapterLink n={40} section="idea" />（Dependency Injection）の引数注入と既定値の書き方です。
          </p>
          <h3>モデルとヘルパーから使う</h3>
          <Code
            lang="ruby"
            title="app/models/order.rb"
            code={`
class Order < ApplicationRecord
  enum :region, { mainland: "mainland", okinawa: "okinawa", remote_island: "remote_island" }
  enum :member_rank, { regular: "regular", gold: "gold" }

  def shipping_options(at: Time.current) = Shipping.options(self, at:)
  def shipping_fee(at: Time.current) = Shipping.fee(self, shipping_method, at:)
end
`}
          />
          <Code
            lang="ruby"
            title="app/helpers/checkouts_helper.rb"
            code={`
module CheckoutsHelper
  # 注文の画面に出す配送方法の選択肢。選べる条件と送料は、計算と同じ戦略から得る
  def shipping_options_for(order)
    order.shipping_options.map { |o| ["#{o[:label]}（#{o[:fee].to_fs(:delimited)}円）", o[:id]] }
  end
end
`}
          />
          <p>適用前と同じ3つの注文で選択肢を作り、キャンペーン中（12月3日）の沖縄の通常便の送料も計算しました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner）"
            code={`
本土: 通常便（600円） / お急ぎ便（900円） / 店舗で受け取り（0円） / クール便（1,000円）
沖縄: 通常便（1,800円） / 店舗で受け取り（0円） / クール便（2,200円）
離島: 通常便（1,800円） / 店舗で受け取り（0円）
キャンペーン中の沖縄の通常便: 1200円
`}
          />
          <p>
            離島の選択肢からクール便が消えました。ヘルパーは選べる条件を自分で持たず、送料の計算と同じ Cool#available? を使うので、画面に出た選択肢は必ず計算できます。選択肢に送料を添えることも、計算と同じ fee を呼ぶだけでできました。
          </p>
          <h3>適用前のコードから直していく順序</h3>
          <ol>
            <li>現在の動作をテストで固定する：配送方法・会員ランク・地域・キャンペーンの組み合わせごとに、今の送料を確かめるテストを書きます。キャンペーンの組み合わせは travel_to で時刻を固定します。</li>
            <li>取り決めを決める：使う側が必要とするメソッド（id・label・available?・fee）を決め、コメントに書きます。</li>
            <li>when を1つずつ移す：店舗受け取り、お急ぎ便、通常便、クール便の順に、when の中身を戦略のクラスに移し、元の when からはそのクラスを呼びます。1つ移すごとにテストを実行します。</li>
            <li>選ぶ処理を一覧に置き換える：when がすべて戦略の呼び出しになったら、case を「一覧から id で探す」処理に置き換えます。キャンペーンの判断は methods_at に移し、時刻を引数で受け取ります。</li>
            <li>画面も同じ一覧を使う：ヘルパーの選択肢を Shipping.options から作るように直し、ヘルパーにあった条件を消します。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'pundit',
      title: 'Pundit で管理画面の認可を Policy にまとめる',
      body: (
        <>
          <h3>Pundit とは</h3>
          <p>
            <Term en="Pundit">Pundit</Term> は、Rails の認可を、モデルごとの普通の Ruby のクラス（ポリシー）にまとめる gem です。ポリシーは <code>initialize(user, record)</code> で利用者と対象を受け取り、<code>update?</code> のようにアクション名に <code>?</code> を付けたメソッドで、許可するかどうかを真偽値で返します<Ref n={6} />。<ChapterLink n={21} section="object-authorization" />では、利用者が渡した ID で他人の行を操作できる IDOR を防ぐために、関連から探す書き方と Pundit を紹介しました。この節では、画面と API で食い違っていた判断を1つのポリシーにまとめ、ルールの組み合わせと判断表に対応させます。
          </p>
          <p>
            <code>bin/rails g pundit:install</code> を実行すると、app/policies/application_policy.rb が作られます。ApplicationPolicy は <code>user</code> と <code>record</code> を持ち、<code>index?</code>・<code>show?</code>・<code>update?</code> などがすべて false を返す基本のクラスです。<code>edit?</code> は <code>update?</code> を、<code>new?</code> は <code>create?</code> を呼びます。各モデルのポリシーはこれを継承し、許可する操作だけを上書きします。
          </p>
          <h3>ProductPolicy</h3>
          <Code
            lang="ruby"
            title="app/policies/product_policy.rb"
            code={`
# 商品に対して、利用者が何をしてよいかの判断を1か所に集める
class ProductPolicy < ApplicationPolicy
  # 操作ごとの判断：小さなルールを && と || で組み合わせる
  def index? = active?
  def show? = active?
  def update? = active? && (admin? || (editor? && same_department?))
  def publish? = update? && record.price.present?
  def destroy? = active? && admin? && record.draft?

  # 一覧に出してよい行。show? と同じ規則にする
  class Scope < ApplicationPolicy::Scope
    def resolve = user.active? ? scope.all : scope.none
  end

  private

  # 小さなルール
  def active? = user.active?
  def admin? = user.admin?
  def editor? = user.editor?
  def same_department? = user.department == record.department
end
`}
          />
          <p>
            小さなルール（active?・admin?・editor?・same_department?）を private メソッドにし、操作ごとのメソッドでそれを組み合わせています。publish? は update? の結果に「価格がある」という条件を加え、destroy? は「管理者で、下書きの商品」に限ります。図 77-4 は update? の組み合わせを木の形で描いたものです。
          </p>
          <Figure n="77-4" title="編集を許可するルールの組み合わせ" caption="葉が小さなルール（ProductPolicy の private メソッド）、枝分かれの箱が組み合わせ方。">
            <RuleTreeFigure />
          </Figure>
          <p>
            このルールを利用者の種類と操作の組み合わせごとに展開すると、図 77-5 の判断表になります。Policy のテストはこの表のマス（利用者と操作の組み合わせ）に対応させて書きます（「テストと動作の確認」の節）。仕様を決める人と表で合意しておくと、ルールを変えるときに、どのマスが変わるかを先に確かめられます。
          </p>
          <Figure n="77-5" title="利用者と操作の判断表" caption="○は許可、×は拒否。停止中の利用者は役割にかかわらずすべて拒否する。">
            <DecisionTableFigure />
          </Figure>
          <h3>コントローラーで authorize を呼ぶ</h3>
          <Code
            lang="ruby"
            title="app/controllers/application_controller.rb"
            code={`
class ApplicationController < ActionController::Base
  include Pundit::Authorization

  before_action :require_login
  rescue_from Pundit::NotAuthorizedError, with: :forbidden

  private

  # Pundit は current_user を policy の user として渡す
  def current_user = @current_user ||= User.find_by(id: session[:user_id])
  def require_login = (head :unauthorized unless current_user)

  def forbidden
    respond_to do |format|
      format.html { render plain: "この操作を行う権限がありません", status: :forbidden }
      format.json { render json: { error: "forbidden" }, status: :forbidden }
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/admin/products_controller.rb"
            code={`
class Admin::ProductsController < ApplicationController
  after_action :verify_authorized, except: :index # authorize の呼び忘れを開発中に見つける
  after_action :verify_policy_scoped, only: :index

  def index
    @products = policy_scope(Product).order(:id)
  end

  def edit
    @product = authorize Product.find(params[:id]) # ProductPolicy#edit?（ApplicationPolicy で update? を呼ぶ）
  end

  def update
    @product = authorize Product.find(params[:id]) # ProductPolicy#update?
    if @product.update(params.expect(product: [:name, :price]))
      redirect_to admin_products_path, notice: "更新しました"
    else
      render :edit, status: :unprocessable_content
    end
  end

  def publish
    @product = authorize Product.find(params[:id]) # ProductPolicy#publish?（アクション名から決まる）
    @product.published!
    redirect_to admin_products_path, notice: "公開しました"
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/api/products_controller.rb"
            code={`
class Api::ProductsController < ApplicationController
  after_action :verify_authorized

  def update
    product = authorize Product.find(params[:id]) # 画面と同じ ProductPolicy#update?
    if product.update(params.expect(product: [:price]))
      render json: product.slice(:id, :name, :price)
    else
      render json: { errors: product.errors.full_messages }, status: :unprocessable_content
    end
  end
end
`}
          />
          <p>
            <code>authorize product</code> と書くと、Pundit は対象のクラス名 Product から ProductPolicy を探し、<code>current_user</code> と product でポリシーを作って、アクション名に <code>?</code> を付けたメソッド（update アクションなら update?）を呼びます<Ref n={6} /><Ref n={7} />。結果が偽なら <code>Pundit::NotAuthorizedError</code> を投げ、真なら渡したオブジェクトをそのまま返すので、<code>@product = authorize Product.find(...)</code> と1行で書けます<Ref n={8} />。アクション名と違う判断を使うときは、<code>authorize product, :update?</code> のように2つ目の引数で指定します。
          </p>
          <p>
            画面の Admin::ProductsController と API の Api::ProductsController は、どちらも update アクションなので、同じ ProductPolicy#update? を使います。拒否したときの応答は ApplicationController の <code>rescue_from</code> にまとめ、HTML なら 403 の文字列を、JSON なら <code>{'{"error":"forbidden"}'}</code> を返します。経路ごとに変わるのは応答の形だけで、許可するかどうかの判断は1か所です。
          </p>
          <Callout kind="v72">
            <p>
              <code>params.expect</code> は Rails 8.0 で追加されたメソッドです<Ref n={11} />。Rails 7.2 では <code>params.require(:product).permit(:name, :price)</code> と書きます。expect は、パラメーターの形が期待と違うときに 500 ではなく 400 を返します。
            </p>
          </Callout>
          <h3>ビューのボタンも同じポリシーで決める</h3>
          <Code
            lang="erb"
            title="app/views/admin/products/index.html.erb"
            code={`
<h1>商品</h1>
<table>
  <% @products.each do |product| %>
    <tr>
      <td><%= product.name %></td>
      <td><%= product.price ? "#{product.price.to_fs(:delimited)}円" : "未設定" %></td>
      <td>
        <%# ボタンを出すかどうかも、コントローラーと同じ ProductPolicy で判断する %>
        <% if policy(product).update? %><%= link_to "編集", edit_admin_product_path(product) %><% end %>
        <% if policy(product).publish? && product.draft? %>
          <%= button_to "公開", publish_admin_product_path(product) %>
        <% end %>
      </td>
    </tr>
  <% end %>
</table>
`}
          />
          <p>
            <code>policy(product)</code> は、ビューとコントローラーで ProductPolicy のインスタンスを返します<Ref n={6} />。ボタンを出す条件をビューで別に書かず、コントローラーと同じ update? と publish? を呼ぶので、画面に出したボタンを押すと拒否される、あるいはボタンを出していない操作が API では実行できる、という食い違いが起きません。
          </p>
          <h3>一覧は policy_scope で絞る</h3>
          <p>
            index のように複数の行を表示するアクションでは、1件ずつ authorize する代わりに <code>policy_scope(Product)</code> を使います。Pundit は ProductPolicy::Scope を <code>new(current_user, Product)</code> で作って <code>resolve</code> を呼び、その結果を返します<Ref n={6} />。この章の Scope は、利用中なら全件、停止中なら0件を返します。一覧に出す行の規則は show? と同じにしておきます。規則が違うと、一覧には出るのに詳細を開くと拒否される行ができるからです。部署ごとに見せる行を変えるなら、resolve を <code>scope.where(department: user.department)</code> のように書き、show? も同じ条件にします。
          </p>
          <h3>verify_authorized は呼び忘れを知らせるだけ</h3>
          <p>
            <code>after_action :verify_authorized</code> は、アクションの中で authorize が呼ばれなかったときに <code>Pundit::AuthorizationNotPerformedError</code> を投げます。index には <code>verify_policy_scoped</code> を使い、policy_scope の呼び忘れを確かめます<Ref n={6} /><Ref n={7} />。Pundit の README は、この確認は開発中に authorize の書き忘れに気付くための仕組みで、認可の仕組みでも失敗を防ぐ安全装置でもないと説明しています<Ref n={6} />。
          </p>
          <p>Api::ProductsController#update から authorize を消し、別の部署の編集者で価格を変える検証をしました。</p>
          <Code
            lang="text"
            title="実行結果（authorize を書き忘れた update に、別の部署の編集者が 1,500 円を送った）"
            code={`
例外: Pundit::AuthorizationNotPerformedError: Api::ProductsController
価格: 1500
`}
          />
          <p>
            例外は起きましたが、価格は 1,500 円に変わっています。after_action はアクションの後で実行されるので、例外が起きた時点で更新はもう確定しています。verify_authorized は書き忘れをテストや開発中に見つけるためのもので、本番で不正な更新を止めることはできません。認可のテストは、許可しない利用者で実際にリクエストを送り、データが変わらないことまで確かめます。
          </p>
          <h3>認可を直していく順序</h3>
          <ol>
            <li>判断表を作ってテストにする：図 77-5 の表を、画面と API の両方に同じリクエストを送る request spec にします。適用前のコードでは、食い違うマスが失敗します。</li>
            <li>ポリシーを作る：<code>bin/rails g pundit:install</code> の後で ProductPolicy を書き、小さなルールを private メソッドに取り出して、操作ごとのメソッドで組み合わせます。判断表の各マスを policy spec で確かめます。</li>
            <li>コントローラーを1つずつ置き換える：独自の if を <code>authorize</code> に替え、拒否の応答を rescue_from にまとめます。after_action :verify_authorized を加えて、置き換え忘れのアクションを見つけます。</li>
            <li>ビューの条件を置き換える：ボタンを出す条件を <code>policy(product).update?</code> に替えます。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストと動作の確認',
      body: (
        <>
          <h3>戦略ごとのテストと、選ぶ処理のテスト</h3>
          <p>
            戦略ごとのテストと、戦略を選んで使う側のテストを分けて書きます。戦略のテストは、その配送方法の規則だけを確かめれば足ります。選ぶ処理のテストでは、キャンペーンの期間の境界を <code>at:</code> の引数で確かめます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/shipping_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Shipping do
  def order(**attrs) = Order.new(subtotal: 3000, weight_grams: 1500, region: "mainland", member_rank: "regular", **attrs)

  describe "配送方法（戦略）ごとのテスト" do
    it "通常便：5,000円以上かゴールド会員なら基本料金が無料、沖縄・離島は1,200円を加算" do
      standard = Shipping::Standard.new
      expect(standard.fee(order)).to eq 600
      expect(standard.fee(order(subtotal: 5000))).to eq 0
      expect(standard.fee(order(member_rank: "gold", region: "okinawa"))).to eq 1200
    end

    it "クール便：離島と10kg超では選べず、通常便の送料に400円を加算" do
      cool = Shipping::Cool.new
      expect(cool.available?(order(region: "remote_island"))).to be false
      expect(cool.available?(order(weight_grams: 10_001))).to be false
      expect(cool.fee(order(region: "okinawa"))).to eq 2200
    end

    # …（お急ぎ便・キャンペーン中の通常便の例は省略）
  end

  describe "戦略を選んで使う側" do
    let(:normal_day) { Time.zone.local(2026, 11, 21, 12) }

    it "選べる配送方法だけを、送料付きで返す" do
      options = described_class.options(order(region: "remote_island"), at: normal_day)

      expect(options).to eq [
        { id: "standard", label: "通常便", fee: 1800 },
        { id: "store_pickup", label: "店舗で受け取り", fee: 0 },
      ]
    end

    it "選べない配送方法や、一覧にない配送方法は Shipping::Unavailable" do
      expect { described_class.fee(order(region: "remote_island"), "cool", at: normal_day) }
        .to raise_error(Shipping::Unavailable, /cool/)
      expect { described_class.fee(order, "drone", at: normal_day) }.to raise_error(Shipping::Unavailable)
    end

    it "キャンペーンの期間だけ、通常便の戦略を替える" do
      okinawa = order(region: "okinawa")
      fees = [
        Time.zone.local(2026, 11, 30, 23, 59, 59),
        Time.zone.local(2026, 12, 1, 0, 0, 0),
        Time.zone.local(2026, 12, 8, 0, 0, 0),
      ].map { |at| described_class.fee(okinawa, "standard", at:) }

      expect(fees).to eq [1800, 1200, 1800]
    end

    # …（Order#shipping_fee の例は省略）
  end
end
`}
          />
          <p>
            Order は <code>Order.new</code> で作るだけで保存しないので、戦略のテストは DB に行を書きません。キャンペーンの境界は開始の直前（11月30日 23:59:59）、開始の時刻（12月1日 0:00）、終わりの時刻（12月8日 0:00）の3点で確かめています。<code>...</code> で作った Range は終わりを含まないので、12月8日 0:00 はキャンペーンの外になります。
          </p>
          <h3>判断表に対応させた policy spec</h3>
          <Code
            lang="ruby"
            title="spec/policies/product_policy_spec.rb"
            code={`
require "rails_helper"

RSpec.describe ProductPolicy do
  let(:product) { Product.new(department: "food", status: "draft", price: 1200) }

  def user(**attrs) = User.new(role: "editor", department: "food", active: true, **attrs)

  # 判断表（図 77-5）の行：利用者 => [属性, show?, update?, publish?, destroy?]
  {
    "管理者" => [{ role: "admin", department: "books" }, true, true, true, true],
    "同じ部署の編集者" => [{}, true, true, true, false],
    "別の部署の編集者" => [{ department: "books" }, true, false, false, false],
    "閲覧者" => [{ role: "viewer" }, true, false, false, false],
    "停止中の利用者" => [{ role: "admin", active: false }, false, false, false, false],
  }.each do |name, (attrs, *expected)|
    it "#{name}：閲覧・編集・公開・削除 → #{expected.map { |e| e ? "○" : "×" }.join}" do
      policy = described_class.new(user(**attrs), product)

      expect(%i[show? update? publish? destroy?].map { |q| policy.public_send(q) }).to eq expected
    end
  end

  it "価格が未設定の商品は、管理者でも公開できない" do
    product.price = nil
    expect(described_class.new(user(role: "admin"), product).publish?).to be false
  end

  it "公開済みの商品は、管理者でも削除できない" do
    product.status = "published"
    expect(described_class.new(user(role: "admin"), product).destroy?).to be false
  end

  describe "Scope" do
    it "利用中なら全件、停止中なら0件を返す" do
      Product.create!(name: "緑茶", department: "food")
      Product.create!(name: "辞書", department: "books")

      expect(described_class::Scope.new(user, Product).resolve.count).to eq 2
      expect(described_class::Scope.new(user(active: false), Product).resolve.count).to eq 0
    end
  end
end
`}
          />
          <p>
            利用者の名前をキー、利用者の属性と4つの操作の期待値を値にした Hash を <code>each</code> で回し、要素ごとに <code>it</code> を作ると、判断表の行がそのままテストの例になります。ポリシーは普通の Ruby のクラスなので、コントローラーを通さずに <code>described_class.new(user, product)</code> で作って確かめられます。Pundit には <code>pundit/rspec</code> を読み込むと使える <code>permissions :update? do … end</code> と <code>permit</code> のマッチャーもあります<Ref n={6} />。
          </p>
          <h3>画面と API を通す request spec</h3>
          <Code
            lang="ruby"
            title="spec/requests/products_authorization_spec.rb（一部を省略）"
            code={`
require "rails_helper"
require_relative "../support/login_helper"

RSpec.describe "商品の管理画面と API の認可", type: :request do
  let!(:product) { Product.create!(name: "緑茶", department: "food", price: 1200) }

  def create_user(**attrs)
    User.create!(name: "利用者", email: "#{SecureRandom.hex(4)}@example.com", role: "editor", department: "food", **attrs)
  end

  it "別の部署の編集者は、画面でも API でも 403 になり、価格は変わらない" do
    log_in(create_user(department: "books"))

    patch admin_product_path(product), params: { product: { price: 1500 } }
    expect(response).to have_http_status(:forbidden)

    patch api_product_path(product), params: { price: 1500 }, as: :json
    expect(response).to have_http_status(:forbidden)
    expect(response.parsed_body).to eq("error" => "forbidden")
    expect(product.reload.price).to eq 1200
  end

  it "一覧では、更新できる商品にだけ編集のリンクを出す" do
    Product.create!(name: "辞書", department: "books", price: 2000)
    log_in(create_user)

    get admin_products_path

    expect(response.body).to include(edit_admin_product_path(product))
    expect(response.body.scan("編集").size).to eq 1
  end

  it "価格が未設定の商品は、同じ部署の編集者でも公開できない" do
    product.update!(price: nil)
    log_in(create_user)

    post publish_admin_product_path(product)

    expect(response).to have_http_status(:forbidden)
    expect(product.reload).to be_draft
  end

  # …（同じ部署の編集者が画面と API の両方で更新できる例は省略）
end
`}
          />
          <p>
            <code>log_in</code> は spec/support/login_helper.rb に置いた、検証用のログインの POST を送るメソッドです（この章のアプリはパスワードの確認を省いています）。request spec では、拒否のステータスに加えて、DB の価格と状態が変わっていないことも確かめます。<code>as: :json</code> は、パラメーターを JSON で送り、応答も JSON として受け取る指定です。Rails は JSON の <code>{'{"price":1500}'}</code> を、コントローラー名に合わせて <code>params[:product]</code> の下にも入れるので、API でも <code>params.expect(product: [:price])</code> で受け取れます。
          </p>
          <h3>実行結果</h3>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation。Rails 8.1.4.1・MySQL 8.4・Pundit 2.5.2）"
            code={`
PaymentFee
  支払い方法ごとの lambda で手数料を計算する

Shipping
  配送方法（戦略）ごとのテスト
    通常便：5,000円以上かゴールド会員なら基本料金が無料、沖縄・離島は1,200円を加算
    お急ぎ便：沖縄・離島では選べず、2kgを超えると300円を加算
    クール便：離島と10kg超では選べず、通常便の送料に400円を加算
    キャンペーン中の通常便：沖縄・離島の追加料金だけ
  戦略を選んで使う側
    選べる配送方法だけを、送料付きで返す
    選べない配送方法や、一覧にない配送方法は Shipping::Unavailable
    キャンペーンの期間だけ、通常便の戦略を替える
    Order#shipping_fee は保存した配送方法で計算する

ProductPolicy
  管理者：閲覧・編集・公開・削除 → ○○○○
  同じ部署の編集者：閲覧・編集・公開・削除 → ○○○×
  別の部署の編集者：閲覧・編集・公開・削除 → ○×××
  閲覧者：閲覧・編集・公開・削除 → ○×××
  停止中の利用者：閲覧・編集・公開・削除 → ××××
  価格が未設定の商品は、管理者でも公開できない
  公開済みの商品は、管理者でも削除できない
  Scope
    利用中なら全件、停止中なら0件を返す

商品の管理画面と API の認可
  同じ部署の編集者は、画面と API の両方で更新できる
  別の部署の編集者は、画面でも API でも 403 になり、価格は変わらない
  一覧では、更新できる商品にだけ編集のリンクを出す
  価格が未設定の商品は、同じ部署の編集者でも公開できない

Finished in 0.21428 seconds (files took 1.69 seconds to load)
21 examples, 0 failures
`}
          />
          <p>
            21の例がすべて通りました。適用前に失敗した「別の部署の編集者」と「停止中の利用者」の2つのマスは、policy spec と request spec の両方で拒否を確かめています。また、適用前の検証用の spec を適用後のコードで実行すると、5人とも画面と API で同じ判断になり、5つの例がすべて通りました。
          </p>
        </>
      ),
    },
    {
      id: 'consequences',
      title: '効果と代償',
      body: (
        <>
          <h3>得られるもの</h3>
          <ul>
            <li>配送方法を足すときに、既存の計算のコードを変えなくて済みます。1つの配送方法の規則を変えるときは、その戦略だけを直します。</li>
            <li>戦略ごとにテストを書けるので、テストが小さくなり、何を確かめているかがわかりやすくなります。</li>
            <li>画面の選択肢と送料の計算が同じ戦略から作られるので、選べるのに計算できない選択肢が生まれません。</li>
            <li>キャンペーンのような時期による切り替えを選ぶ処理にまとめたので、戦略のテストに時刻が要りません。</li>
            <li>認可の判断が ProductPolicy の1か所にまとまり、画面・API・ビューのボタンが同じ判断を使います。判断表とテストを対応させられます。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>適用前は1つのメソッドで送料の全体を読めましたが、適用後は戦略ごとのファイルを順に読む必要があります。この章では、1つのメソッドが6つのファイルになりました。</li>
            <li>戦略が共通で使う計算（沖縄・離島の追加料金など）をどこに置くかを決める必要があります。この章では Shipping.remote_surcharge に置きました。</li>
            <li>戦略によって必要なデータが違うと、取り決めの引数（この章では order）に全部を含めることになり、引数が大きくなります。</li>
            <li>Pundit の authorize は、アクション名からポリシーのメソッドを決めます。アクション名と判断の名前がずれると、2つ目の引数で指定する必要があります。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            ルールが頻繁に増える場合には、保守性が大きく上がります。逆に、ルールがほとんど変わらない場合は、部品が増えた分だけ読む手間が増えます。テストについては、戦略やポリシーを単独でテストできることに加えて、使う側のテストで本物の代わりに単純な戦略を渡せるようになります。認可は、ポリシーの単体テストで判断表のすべてのマスを確かめ、request spec では経路ごとに代表的なマスと、拒否したときにデータが変わらないことを確かめる、という分担にできます。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>戦略を作ったのに、使う側で種類を調べる</h3>
          <Code
            lang="ruby"
            title="避けたい書き方：戦略に分けた後で、使う側が種類を調べて計算を足す"
            code={`
def self.fee(order, method_id, at: Time.current)
  method = methods_at(at)[method_id]
  fee = method.fee(order)
  fee += 300 if method.is_a?(Shipping::Express) && order.okinawa? # お急ぎ便だけの規則が使う側にある
  fee
end
`}
          />
          <p>
            戦略に分けた後で、使う側に <code>is_a?(Shipping::Express)</code> や <code>method.id == "express"</code> のような分岐が残ると、配送方法を足すたびにその分岐も確かめる必要があり、Strategy にした効果がなくなります。種類によって違う処理は、取り決めのメソッドとして戦略の中に入れます。この章の available? がその例です。
          </p>
          <h3>変わらない計算を Strategy にする</h3>
          <Code
            lang="ruby"
            title="避けたい書き方：計算の方法が1つしかないのに、取り決めと一覧を作る"
            code={`
class Points::StandardRate
  def rate(_order) = 0.01
end

POINT_RATES = { "standard" => Points::StandardRate.new }.freeze

def points_for(order) = (order.subtotal * POINT_RATES.fetch("standard").rate(order)).floor
`}
          />
          <p>
            ポイントの付与率が1つしかなく、増える予定もないのに、取り決めと一覧を分けると、読むファイルが増えるだけです。<code>(order.subtotal * 0.01).floor</code> と書けば足ります。2つ目の計算方法が必要になった時点で分けても、手間はほとんど変わりません。
          </p>
          <h3>戦略の中で外部とやり取りする</h3>
          <Code
            lang="ruby"
            title="避けたい書き方と、直した形（説明用。構文だけを確かめた）"
            code={`
# 避けたい書き方：戦略の中で DB を読む
class Shipping::Standard
  def fee(order)
    base = ShippingRate.find_by!(method: "standard", region: order.region).amount # 呼ぶたびに SELECT
    order.gold? || order.subtotal >= 5000 ? 0 : base
  end
end

# 直した形：読み込みは使う側で1回だけ行い、結果を戦略に渡す
class Shipping::Standard
  def initialize(rates:) = @rates = rates # { "mainland" => 600, "okinawa" => 1800, ... }

  def fee(order) = order.gold? || order.subtotal >= 5000 ? 0 : @rates.fetch(order.region)
end

Shipping::Standard.new(rates: ShippingRate.where(method: "standard").pluck(:region, :amount).to_h)
`}
          />
          <p>
            地域ごとの料金を戦略の中で DB から読むと、戦略のテストに DB の行が必要になり、Shipping.options が選択肢ごとに fee を呼ぶたびに SELECT が実行されます。外部の配送業者の API に料金を問い合わせる場合も同じで、戦略のテストに通信の代役が要るようになります。戦略が必要とするデータは引数かコンストラクターで受け取り、戦略は計算だけにします。料金表の読み込みは使う側で行い、その結果から戦略を作ります。
          </p>
          <h3>認可の判断を画面と API で別々に書く</h3>
          <Code
            lang="erb"
            title="避けたい書き方：ボタンを出す条件を、ビューで別に書く"
            code={`
<% if current_user.admin? || current_user.editor? %>
  <%= link_to "編集", edit_admin_product_path(product) %>
<% end %>
`}
          />
          <p>
            「画面と API に書いた認可」で実行したとおり、画面のコントローラー、API、ビューのボタンを別々の条件で書くと、条件が少しずつ食い違います。画面に出したボタンを押すと拒否される、あるいは画面にボタンを出していない操作が API では実行できる、ということが起きます。どの経路でも <code>authorize</code> と <code>policy(record)</code> で同じポリシーの判断を使います。
          </p>
          <h3>真偽値のフラグで計算を切り替える</h3>
          <Code
            lang="ruby"
            title="避けたい書き方：真偽値の引数で計算を切り替える"
            code={`
def self.fee(order, express = false, cool = false, campaign = false)
  # …（省略）
end

Shipping.fee(order, false, true, false) # 呼ぶ側から、どの配送方法かが読み取れない
`}
          />
          <p>
            <code>Shipping.fee(order, false, true, false)</code> のように真偽値の引数で計算を切り替えると、呼び出す側のコードから意味が読み取れず、express と cool が両方 true のようなありえない組み合わせも渡せます。配送方法が増えるたびに引数も増えます。切り替えたいのが計算の方法なら、戦略（またはその id）を渡します。
          </p>
        </>
      ),
    },
    {
      id: 'alternatives',
      title: 'case 文・料金表・認可の gem との使い分けと採用の判断',
      body: (
        <>
          <h3>より単純な方法</h3>
          <ul>
            <li>
              case 文のままにする：分岐が2〜3つで、増える予定がなく、1つのメソッドで読めるなら、case 文が最もわかりやすい形です。たとえば「店舗で受け取りは0円、それ以外は600円」だけなら、Strategy にする理由はありません。<ChapterLink n={33} section="design-patterns" />の表でも、2行で安定した case 式は Strategy にしない例に挙げています。
            </li>
            <li>
              違いをデータで表す：配送方法ごとの違いが「基本料金がいくらか」のような数値だけなら、計算の部品を分ける必要はありません。料金表（Hash、設定ファイル、DB のテーブル）を1つの計算で読む方が単純です。キャンペーンの期間も、担当者が管理画面で変えるなら、定数ではなくテーブルに保存します。計算の手順そのものが違う場合に Strategy を使います。
            </li>
            <li>lambda を渡す：戦略が1つのメソッドだけなら、クラスを作らず lambda の Hash にします（この章の PaymentFee）。</li>
          </ul>
          <h3>ほかのパターンとの違い</h3>
          <ul>
            <li>
              <ChapterLink n={47} section="idea" />（Explicit State Machine）：振る舞いが「今どの状態か」によって変わり、状態が操作によって移り変わる場合に使います。Strategy では、使う側が外から戦略を選びます。
            </li>
            <li>
              <ChapterLink n={40} section="idea" />（Dependency Injection）：戦略を使う側に渡す方法です。Strategy は渡すものの設計を、DI は渡し方を扱います。この章の <code>at:</code> の引数は、DI の引数注入です。
            </li>
            <li>Specification：条件を満たすかを判断するオブジェクトを組み合わせるパターンです<Ref n={5} />。ProductPolicy の小さなルールの組み合わせは、この考え方をメソッドと論理演算子で書いたものです。</li>
            <li>
              継承によるポリモーフィズム：種類ごとにサブクラスを作り、メソッドを上書きする方法です。Rails の単一テーブル継承（STI）のように、種類そのものがデータのモデルである場合に使います。種類と計算方法を別々に選びたい場合は、Strategy の方が組み合わせやすくなります。
            </li>
          </ul>
          <h3>認可の gem との使い分け</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">方法</th>
                  <th scope="col">ルールの書き方</th>
                  <th scope="col">向いている場面</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">関連から探す・before_action</th>
                  <td><code>current_user.products.find(id)</code> や、管理者だけを通す before_action</td>
                  <td>所有者か管理者かだけで決まる小さなアプリ（<ChapterLink n={21} section="object-authorization" />）</td>
                </tr>
                <tr>
                  <th scope="row">Pundit</th>
                  <td>モデルごとの普通の Ruby のクラスに、<code>update?</code> などのメソッドを書く</td>
                  <td>モデルごとにルールが育ち、ルールをコードとして読みたい・テストしたい場合。この章の方法</td>
                </tr>
                <tr>
                  <th scope="row">Action Policy</th>
                  <td>Pundit に近いポリシーのクラス。<code>pre_check</code>・<code>alias_rule</code>・<code>default_rule</code>、拒否の理由、結果のキャッシュ、<code>authorized_scope</code> を持つ</td>
                  <td>ポリシーが多く、共通の事前の確認や拒否の理由の表示、判断のキャッシュが必要な場合<Ref n={9} /></td>
                </tr>
                <tr>
                  <th scope="row">CanCanCan</th>
                  <td>1つの <code>Ability</code> クラスに <code>can :update, Product, department: user.department</code> のように許可を宣言する</td>
                  <td>条件が属性の一致で書け、<code>accessible_by</code> で許可された行の検索に変換したい場合<Ref n={10} /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Pundit と Action Policy は、ルールをモデルごとのクラスのメソッドとして書くので、この章の「小さなルールの組み合わせ」をそのまま書けます。CanCanCan は、利用者ごとの許可を1つのクラスに宣言するので、全体を1か所で見渡せる代わりに、モデルが増えると Ability クラスが大きくなります。条件をハッシュで書いたルールは <code>Product.accessible_by(current_ability)</code> のように検索の条件にも使えます<Ref n={10} />。この章のアプリには Action Policy と CanCanCan を入れていないので、ここでは各 gem の README とガイドで確かめた機能だけを挙げています。
          </p>
          <h3>採用する条件</h3>
          <ul>
            <li>同じ目的の計算の方法が4つ以上ある、または今後増えることがわかっている</li>
            <li>計算の方法ごとに手順が違い、数値の違いだけでは表せない</li>
            <li>同じ値による分岐が、モデル・ヘルパー・コントローラー・API に繰り返し出てくる</li>
            <li>認可のように、小さなルールの組み合わせで判断が決まり、その組み合わせが変わる</li>
          </ul>
          <h3>採用しない方がよい条件</h3>
          <ul>
            <li>分岐が2〜3つで、増える予定がない</li>
            <li>違いが数値や文字列だけで、料金表などのデータで表せる</li>
            <li>計算の方法を選ぶのが、利用者や設定ではなく、データ自身の状態である（Explicit State Machine を検討する）</li>
          </ul>
          <h3>判断のチェックポイント</h3>
          <ol>
            <li>ルールを足すときに、既存のどのコードを変更しているか</li>
            <li>違いは計算の手順か、それとも数値だけか</li>
            <li>どの戦略を選ぶかの処理が、1か所にまとまっているか</li>
            <li>戦略は外部とやり取りせず、時刻も持たずにテストできるか</li>
            <li>画面・API・ビューのボタンが、同じ認可の判断を使っているか</li>
          </ol>
          <p>
            この章の送料は、配送方法ごとに選べる条件と計算の手順が違い、クール便とキャンペーンの追加も実際に起きたので Strategy を採用しました。もし違いが「通常便 600 円、お急ぎ便 900 円」のような基本料金だけなら、料金表と1つの計算で足ります。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Strategy は計算の方法を交換できる部品にし、Policy は許可の判断を小さなルールの組み合わせで表します。GoF は Policy を Strategy の別名として挙げています。</li>
          <li>Strategy を使っても、どの戦略を選ぶかの処理は使う側に残ります。選ぶ処理（一覧から id で選ぶ、時期で一覧を替える）を1か所にまとめ、計算は戦略の中に移します。</li>
          <li>Rails では、戦略を app/models の下の普通の Ruby のクラスにし、id をキーにした Hash の一覧から選びます。戦略が1つの計算だけなら lambda の Hash で足ります。</li>
          <li>画面の選択肢と送料の計算を同じ戦略から作ると、選べるのに計算できない選択肢が生まれません。</li>
          <li>Pundit では、ポリシーのクラスに操作ごとの判断を書き、コントローラーの authorize、ビューの policy、一覧の policy_scope で同じ判断を使います。画面と API の認可が1か所にまとまります。</li>
          <li>verify_authorized は authorize の書き忘れを知らせるだけで、アクションの処理の後で動きます。拒否した利用者でデータが変わらないことを request spec で確かめます。</li>
          <li>Policy のテストは、利用者と操作の判断表のマスに対応させて書きます。</li>
          <li>分岐が少なく増えないなら case 文のまま、違いが数値だけなら料金表のデータで表します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Design Patterns: Elements of Reusable Object-Oriented Software', publisher: 'Erich Gamma ほか / Addison-Wesley（InformIT の書籍ページ）', url: 'https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610', accessed: '2026-11-13', version: '1994年刊', note: 'Strategy の目的（Intent）と別名（Policy）。' },
    { title: 'Design Patterns Explained: The Strategy Pattern', publisher: 'Alan Shalloway, James R. Trott / InformIT', url: 'https://www.informit.com/articles/article.aspx?p=1398602&seqNum=4', accessed: '2026-11-13', version: '2009年11月23日', note: 'GoF の Strategy の目的の引用。' },
    { title: 'Domain-Driven Design: Tackling Complexity in the Heart of Software', publisher: 'Eric Evans / Addison-Wesley（InformIT の書籍ページの目次）', url: 'https://www.informit.com/store/domain-driven-design-tackling-complexity-in-the-heart-of-software-9780321125217', accessed: '2026-11-13', version: '2003年8月刊（著作権表記2004年）', note: '第12章の節「STRATEGY (A.K.A. POLICY)」。' },
    { title: 'Replace Conditional with Polymorphism', publisher: 'refactoring.com / Martin Fowler', url: 'https://refactoring.com/catalog/replaceConditionalWithPolymorphism.html', accessed: '2026-11-13', version: '『Refactoring』第2版（2018年刊）のカタログ', note: '条件分岐をポリモーフィズムに置き換えるリファクタリング。' },
    { title: 'Specifications', publisher: 'martinfowler.com / Eric Evans, Martin Fowler', url: 'https://martinfowler.com/apsupp/spec.pdf', accessed: '2026-11-13', note: '条件を判断するオブジェクトを and・or・not で組み合わせる方法。' },
    { title: 'varvet/pundit（README）', publisher: 'GitHub', url: 'https://github.com/varvet/pundit', accessed: '2026-11-13', version: '2.5.2（gem に同梱の README で確認）', note: 'ポリシーのクラスの規約、authorize と2つ目の引数、policy、Scope と policy_scope、verify_authorized・verify_policy_scoped は開発中に呼び忘れを見つけるためのもので安全装置ではないこと、pundit/rspec。' },
    { title: 'lib/pundit/authorization.rb', publisher: 'varvet/pundit（GitHub）', url: `${PUNDIT}/lib/pundit/authorization.rb#L89-L128`, accessed: '2026-11-21', version: 'pundit 2.5.2', note: 'authorize がアクション名から判断のメソッド名を作ること、verify_authorized が AuthorizationNotPerformedError を投げること。' },
    { title: 'lib/pundit/context.rb', publisher: 'varvet/pundit（GitHub）', url: `${PUNDIT}/lib/pundit/context.rb#L62-L73`, accessed: '2026-11-21', version: 'pundit 2.5.2', note: 'ポリシーのメソッドが偽なら NotAuthorizedError を投げ、真なら渡したレコードを返すこと。' },
    { title: 'Action Policy', publisher: 'Evil Martians', url: 'https://actionpolicy.evilmartians.io/', accessed: '2026-11-21', note: 'Ruby と Rails の認可のフレームワーク。authorize!・authorized_scope・relation_scope、pre_check・alias_rule・default_rule、拒否の理由、キャッシュ（llms-full.txt のガイドで確認）。' },
    { title: 'CanCanCommunity/cancancan（README）', publisher: 'GitHub', url: 'https://github.com/CanCanCommunity/cancancan', accessed: '2026-11-21', note: 'Ability クラスと can による許可の宣言、authorize!、accessible_by、load_and_authorize_resource。' },
    { title: 'actionpack/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/CHANGELOG.md#L64-L99`, accessed: '2026-11-21', version: 'Rails 8.0.0', note: 'params.expect が Rails 8.0 で追加され、params.require(...).permit(...) を置き換えること、形が違うと 400 を返すこと。' },
    { title: 'Modern C++ Design: Generic Programming and Design Patterns Applied', publisher: 'Andrei Alexandrescu / Addison-Wesley（InformIT の書籍ページ）', url: 'https://www.informit.com/store/modern-c-design-generic-programming-and-design-patterns-9780201704310', accessed: '2026-11-13', version: '2001年2月刊', note: '第1章 Policy-Based Class Design（この章の Policy とは別の意味）。' },
  ],
}

export default chapter
