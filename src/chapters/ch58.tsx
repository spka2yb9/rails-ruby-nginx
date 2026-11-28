import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

/* ---------- 図 56-1 多通貨に備えた価格の計算の構成 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="56-1"
      w={780}
      h={430}
      label="ProductsController#show が PriceQuote.new(@product) を呼ぶ。PriceQuote は country: JP と currency: JPY の既定値のまま使われている。PriceQuote は Money の convert_to で通貨を換算し、TaxPolicy.for(country) で国ごとのクラスを選ぶ。国ごとのクラスは Jp（消費税10%）、Us（売上税0、未定）、Eu（付加価値税20%、仮）の3つで、使われているのは Jp だけ。products テーブルの price_currency は120件すべて JPY。Money は currencies テーブル（JPY・USD・EUR）と exchange_rates テーブル（JPY→USD・JPY→EUR）を読むが、為替の換算は一度も使われていない。軽減税率を足すと、使っていない Us と Eu の引数とテストまで直すことになる"
    >
      <Box x={20} y={16} w={220} h={46} lines={['ProductsController#show', 'PriceQuote.new(@product)']} fs={12} subTone="muted" />
      <Arrow x1={130} y1={62} x2={130} y2={90} />
      <Box x={20} y={92} w={220} h={62} lines={['PriceQuote', 'country: "JP"・currency: "JPY"', '（既定値のまま使われている）']} fs={12} accent subTone="muted" />
      <Arrow x1={240} y1={123} x2={288} y2={123} />
      <Box x={290} y={92} w={220} h={62} lines={['Money', 'convert_to・通貨ごとの切り捨て', '通貨の違う金額の検査']} fs={12} subTone="muted" />
      <Arrow x1={130} y1={154} x2={130} y2={198} />
      <Box x={20} y={200} w={220} h={46} lines={['TaxPolicy.for(country)', '国からクラスを選ぶ']} fs={12} subTone="muted" />
      <Arrow x1={90} y1={246} x2={75} y2={288} />
      <Arrow x1={150} y1={246} x2={195} y2={288} />
      <Arrow x1={210} y1={246} x2={315} y2={288} />
      <Box x={20} y={290} w={110} h={46} lines={['Jp', '消費税 10%']} fs={12} accent subTone="muted" />
      <Box x={140} y={290} w={110} h={46} lines={['Us', '売上税 0（未定）']} fs={12} fill="bg" dashed subTone="muted" />
      <Box x={260} y={290} w={110} h={46} lines={['Eu', 'VAT 20%（仮）']} fs={12} fill="bg" dashed subTone="muted" />
      <T x={140} y={362} fs={12} tone="danger">
        軽減税率を足すと、使っていない Us・Eu の
      </T>
      <T x={140} y={380} fs={12} tone="danger">
        引数とテストまで直すことになる
      </T>

      <Box x={550} y={16} w={210} h={62} lines={['products', 'price_amount（decimal）', 'price_currency：120件すべて JPY']} fs={12} fill="box4" subTone="muted" />
      <Box x={550} y={140} w={210} h={46} lines={['currencies', 'JPY・USD・EUR']} fs={12} fill="box4" subTone="muted" />
      <Box x={550} y={210} w={210} h={46} lines={['exchange_rates', 'JPY→USD・JPY→EUR']} fs={12} fill="box4" dashed subTone="muted" />
      <Arrow x1={240} y1={39} x2={548} y2={39} dashed />
      <T x={395} y={28} fs={11} anchor="middle" tone="muted">
        読む
      </T>
      <Arrow x1={510} y1={130} x2={548} y2={158} dashed />
      <Arrow x1={510} y1={148} x2={548} y2={228} dashed />
      <T x={20} y={414} fs={12} tone="muted">
        実線の枠は使われている部分、破線の枠は3年間で一度も使われていない部分。
      </T>
    </Svg>
  )
}

/* ---------- 図 56-2 作った機能と使われた機能 ---------- */
const builtRows: { label: string; items: { text: string; used: boolean }[] }[] = [
  { label: '通貨', items: [{ text: 'JPY', used: true }, { text: 'USD', used: false }, { text: 'EUR', used: false }] },
  { label: '税を計算する国', items: [{ text: 'JP', used: true }, { text: 'US', used: false }, { text: 'EU', used: false }] },
  { label: '為替の換算', items: [{ text: 'JPY→USD', used: false }, { text: 'JPY→EUR', used: false }] },
  { label: '端数を切り捨てる桁', items: [{ text: '0桁（JPY）', used: true }, { text: '2桁（USD・EUR）', used: false }] },
  { label: '通貨の違う金額の検査', items: [{ text: 'ArgumentError', used: false }] },
]

function BuiltUsedFigure() {
  const chipW = 130
  const rowH = 52
  const rows: { y: number; label: string; items: { x: number; text: string; used: boolean }[]; used: number }[] = []
  for (let i = 0; i < builtRows.length; i++) {
    const r = builtRows[i]
    const items: { x: number; text: string; used: boolean }[] = []
    for (let k = 0; k < r.items.length; k++) items.push({ x: 200 + k * (chipW + 10), ...r.items[k] })
    rows.push({ y: 40 + i * rowH, label: r.label, items, used: r.items.filter((it) => it.used).length })
  }
  return (
    <Svg
      id="56-2"
      w={760}
      h={350}
      label={`多通貨に備えて作った機能と、3年間で使われた機能。${builtRows.map((r) => `${r.label}は ${r.items.map((it) => it.text).join('・')} を作り、使われたのは ${r.items.filter((it) => it.used).map((it) => it.text).join('・') || 'なし'}`).join('。')}。商品120件の price_currency はすべて JPY`}
    >
      <T x={20} y={18} fs={12} bold>
        作ったもの
      </T>
      <T x={640} y={18} fs={12} bold>
        使われた数
      </T>
      {rows.map((r) => (
        <g key={r.label}>
          <T x={20} y={r.y + 18} fs={13} bold>
            {r.label}
          </T>
          {r.items.map((it) => (
            <Box key={it.text} x={it.x} y={r.y} w={chipW} h={36} lines={it.text} fs={12} fill={it.used ? 'box5' : 'bg'} accent={it.used} dashed={!it.used} />
          ))}
          <T x={660} y={r.y + 18} fs={13} tone={r.used ? 'acc' : 'danger'} anchor="middle">
            {`${r.used} / ${r.items.length}`}
          </T>
        </g>
      ))}
      <rect x={200} y={326} width={16} height={12} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
      <T x={222} y={332} fs={12}>
        使われた
      </T>
      <rect x={300} y={326} width={16} height={12} fill="none" stroke="var(--fig-line)" strokeDasharray="4 3" />
      <T x={322} y={332} fs={12}>
        一度も使われていない
      </T>
      <T x={20} y={304} fs={12} tone="muted">
        商品120件の price_currency はすべて JPY（script/usage.rb の結果）
      </T>
    </Svg>
  )
}

/* ---------- 図 56-3 まだ使われない機能にかかる4つの費用 ---------- */
function FourCostsFigure() {
  const cols = ['必要にならなかった', '必要になった', '必要になったが、作り方が違った']
  const rows: { cost: string; en: string; cells: (string[] | null)[] }[] = [
    { cost: '作る費用', en: 'cost of build', cells: [['USD・EUR・為替を', '作った時間が無駄になる'], null, null] },
    { cost: '遅れる費用', en: 'cost of delay', cells: [null, ['その間、国内に必要な機能', '（軽減税率など）が遅れる'], null] },
    { cost: '抱える費用', en: 'cost of carry', cells: [['消すまで、ほかの変更の', 'たびに Us・Eu も直す'], ['使い始めるまで、ほかの', '変更が遅く・難しくなる'], null] },
    { cost: '直す費用', en: 'cost of repair', cells: [null, null, ['実際の出店先の制度に', '合わせて作り直す']] },
  ]
  const x0 = 170
  const cw = 196
  const rh = 66
  return (
    <Svg
      id="56-3"
      w={780}
      h={360}
      label="Fowler の分類による、まだ使われない機能の3つの場合と4つの費用。必要にならなかった機能には、作る費用（USD・EUR・為替を作った時間が無駄になる）と、消すまでの抱える費用（ほかの変更のたびに Us・Eu も直す）がかかる。必要になった機能には、遅れる費用（その間、国内に必要な軽減税率などの機能が遅れる）と、使い始めるまでの抱える費用がかかる。必要になったが作り方が違った機能には、直す費用（実際の出店先の制度に合わせて作り直す）がかかる"
    >
      {cols.map((c, i) => (
        <Box key={c} x={x0 + i * cw} y={10} w={cw - 6} h={40} lines={c} fs={12} fill="box2" bold />
      ))}
      {rows.map((r, j) => {
        const y = 58 + j * rh
        return (
          <g key={r.cost}>
            <Box x={10} y={y} w={154} h={rh - 6} lines={[r.cost, r.en]} fs={13} bold subTone="muted" />
            {r.cells.map((cell, i) =>
              cell ? (
                <Box key={i} x={x0 + i * cw} y={y} w={cw - 6} h={rh - 6} lines={cell} fs={12} fill="box5" />
              ) : (
                <rect key={i} x={x0 + i * cw} y={y} width={cw - 6} height={rh - 6} rx={6} fill="none" stroke="var(--fig-line)" strokeDasharray="2 4" />
              ),
            )}
          </g>
        )
      })}
      <T x={10} y={340} fs={12} tone="muted">
        色の付いた箱が、その場合にかかる費用。文の中はこの章の例に当てはめたもの。
      </T>
    </Svg>
  )
}

/* ---------- 図 56-5 軽減税率を足すときに変わるファイル ---------- */
const changedBefore: { file: string; lines: string; unused?: boolean }[] = [
  { file: 'migrate/…_add_tax_category_to_products.rb', lines: '+5' },
  { file: 'app/models/product.rb', lines: '+3' },
  { file: 'app/models/tax_policy/jp.rb', lines: '+4 −2' },
  { file: 'app/services/price_quote.rb', lines: '+1 −1' },
  { file: 'spec/services/price_quote_spec.rb', lines: '+5' },
  { file: 'app/models/tax_policy/us.rb', lines: '+1 −1', unused: true },
  { file: 'app/models/tax_policy/eu.rb', lines: '+4 −2', unused: true },
  { file: 'spec/models/tax_policy_spec.rb', lines: '+7 −3', unused: true },
]
const changedAfter: { file: string; lines: string }[] = [
  { file: 'migrate/…_add_tax_category_to_products.rb', lines: '+5' },
  { file: 'app/models/product.rb', lines: '+4 −2' },
  { file: 'spec/models/product_spec.rb', lines: '+4' },
]

function ChangedFilesFigure() {
  const rowH = 32
  return (
    <Svg
      id="56-5"
      w={780}
      h={380}
      label={`軽減税率を足すときに変えたファイル。多通貨に備えた設計（直す前）では ${changedBefore.map((c) => `${c.file}（${c.lines}${c.unused ? '、使っていない国のため' : ''}）`).join('、')} の8ファイル、30行の追加と9行の削除。円だけの設計（直した後）では ${changedAfter.map((c) => `${c.file}（${c.lines}）`).join('、')} の3ファイル、13行の追加と2行の削除`}
    >
      <T x={20} y={18} bold>
        直す前（多通貨に備えた設計）
      </T>
      {changedBefore.map((c, i) => (
        <g key={c.file}>
          <Box x={20} y={34 + i * rowH} w={300} h={26} lines={c.file} fs={11} fill={c.unused ? 'bg' : 'box'} dashed={c.unused} align="start" mono />
          <T x={328} y={47 + i * rowH} fs={12} tone={c.unused ? 'danger' : undefined}>
            {c.lines}
          </T>
        </g>
      ))}
      <T x={20} y={304} fs={12} tone="danger">
        8ファイル（+30 −9）。破線の3つは使っていない国のための変更
      </T>
      <line x1={400} y1={10} x2={400} y2={316} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={420} y={18} bold>
        直した後（円だけの設計）
      </T>
      {changedAfter.map((c, i) => (
        <g key={c.file}>
          <Box x={420} y={34 + i * rowH} w={290} h={26} lines={c.file} fs={11} align="start" mono />
          <T x={718} y={47 + i * rowH} fs={12}>
            {c.lines}
          </T>
        </g>
      ))}
      <T x={420} y={144} fs={12} tone="acc">
        3ファイル（+13 −2）
      </T>
      <T x={20} y={340} fs={12} tone="muted">
        どちらも git diff --no-index --stat で数えた。直す前は、軽減税率の途中で米国向けのテストが
      </T>
      <T x={20} y={360} fs={12} tone="muted">
        ArgumentError で失敗し、EU の軽減税率（5%）を根拠のないまま決めた。
      </T>
    </Svg>
  )
}

/* ---------- 図 56-6 YAGNI の対象と、対象にならない変更 ---------- */
function NotYagniFigure() {
  const left = [
    ['まだ使わない機能', 'USD・EUR の表示、為替の換算'],
    ['使う予定のない拡張点', 'TaxPolicy.for(country) と国ごとのクラス'],
    ['将来のための引数・列', 'country:・currency:、price_currency 列'],
  ]
  const right = [
    ['リファクタリング', '使っていない部分を消す、名前を直す'],
    ['自動テスト', '変更を安全にする self-testing code'],
    ['継続的な配布', '小さな変更をすぐ本番に出せる仕組み'],
    ['後から取り戻せない事実の記録', '注文した時点の価格と税率'],
    ['業務の決まりの検証', '価格は0以上の整数、税率の区分'],
  ]
  return (
    <Svg
      id="56-6"
      w={780}
      h={360}
      label={`YAGNI の対象になるもの（今は作らない）：${left.map((l) => `${l[0]}（${l[1]}）`).join('、')}。YAGNI の対象にならないもの（今やる）：${right.map((r) => `${r[0]}（${r[1]}）`).join('、')}。前の3つは変更を容易にする活動として Fowler が挙げたもので、後の2つは今の要件そのもの`}
    >
      <T x={20} y={18} bold>
        YAGNI の対象（今は作らない）
      </T>
      {left.map((l, i) => (
        <Box key={l[0]} x={20} y={34 + i * 62} w={340} h={52} lines={l} fs={12} fill="bg" dashed bold subTone="muted" />
      ))}
      <T x={20} y={236} fs={12} tone="muted">
        今の要件を理解しにくくする複雑さを、
      </T>
      <T x={20} y={254} fs={12} tone="muted">
        将来の可能性だけを理由に足すもの
      </T>
      <line x1={390} y1={10} x2={390} y2={350} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={420} y={18} bold>
        YAGNI の対象にならない（今やる）
      </T>
      {right.map((r, i) => (
        <Box key={r[0]} x={420} y={34 + i * 62} w={340} h={52} lines={r} fs={12} fill={i < 3 ? 'box5' : 'box4'} bold subTone="muted" />
      ))}
      <T x={420} y={350} fs={11} tone="muted">
        紫：変更を容易にする活動（Fowler）　緑：今の要件そのもの
      </T>
    </Svg>
  )
}

/* ---------- 図 56-7 当てはめすぎの判断 ---------- */
function JudgeFigure() {
  const ox = 110
  const oy = 360
  return (
    <Svg
      id="56-7"
      w={780}
      h={430}
      label="横軸は後から足すときの費用（左が安い、右が高い）、縦軸は必要になる確かさ（下が低い、上が高い）。左下は作らない（YAGNI）で、例は USD・EUR の表示と為替の換算。左上は必要になる時期に合わせて作るで、例は日付の決まった税率の変更。右下は変えやすくしておくで、テスト・小さなクラス・使わない部分を消すことで、例は海外に出店するかもしれないこと。右上は今決めるで、例は注文した時点の価格と税率を明細に残すこと。この章の多通貨の仕組みは左下に入る"
    >
      <Arrow x1={ox} y1={oy} x2={750} y2={oy} />
      <Arrow x1={ox} y1={oy} x2={ox} y2={38} />
      <T x={20} y={16} fs={12} bold>
        縦軸：必要になる確かさ
      </T>
      <T x={430} y={392} anchor="middle" fs={12} bold>
        後から足すときの費用
      </T>
      <T x={ox} y={378} fs={11} tone="muted">
        安い（コードを足すだけ）
      </T>
      <T x={750} y={378} anchor="end" fs={11} tone="muted">
        高い（過去のデータを取り戻せない）
      </T>
      <T x={20} y={80} fs={11} tone="muted">
        高い
      </T>
      <T x={20} y={330} fs={11} tone="muted">
        低い
      </T>
      <line x1={430} y1={40} x2={430} y2={350} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={120} y1={195} x2={745} y2={195} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <Box x={130} y={220} w={285} h={70} lines={['作らない（YAGNI）', '例：USD・EUR の表示、為替の換算']} fs={12} fill="box5" accent bold subTone="muted" />
      <Box x={130} y={60} w={285} h={70} lines={['必要になる時期に合わせて作る', '例：日付の決まった税率の変更']} fs={12} bold subTone="muted" />
      <Box x={445} y={220} w={295} h={70} lines={['変えやすくしておく', 'テスト・小さなクラス・使わない部分を消す', '例：海外に出店するかもしれない']} fs={12} bold subTone="muted" />
      <Box x={445} y={60} w={295} h={70} lines={['今決める', '例：注文した時点の価格と税率を', '明細に残す']} fs={12} fill="box4" bold subTone="muted" />

      <circle cx={170} cy={318} r={7} fill="var(--fig-accent)" />
      <T x={184} y={318} fs={12} tone="acc">
        この章の多通貨の仕組み
      </T>
      <circle cx={470} cy={160} r={7} fill="var(--fig-danger)" />
      <T x={484} y={160} fs={12} tone="danger">
        省くと過去の注文の金額が変わる
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 58,
  part: 8,
  title: 'YAGNI：使う予定のない多通貨対応を先に作らない',
  summary:
    '日本円しか扱わない EC サイトに、海外への出店に備えた通貨・為替・国ごとの税の仕組みがあり、軽減税率を足すだけで使っていない国のコードとテストまで直す例から始め、YAGNI の意味と由来、まだ使われない機能にかかる4つの費用を確かめます。使われ方を調べてから仕組みを消し、同じ変更の手間を比べた後、注文の記録やテストまで省くといった当てはめすぎと、判断の目安を示します。',
  goals: [
    '使う予定のない拡張点や引数が、今の要件の変更の手間を増やす仕組みを説明できる',
    'YAGNI の定義と由来（エクストリーム・プログラミング、Ron Jeffries、Martin Fowler）を説明できる',
    'まだ使われない機能にかかる4つの費用（作る・遅れる・抱える・直す）を、具体的なコードに当てはめて説明できる',
    'データとコードで使われ方を確かめてから、使っていない仕組みを段階的に消せる',
    'リファクタリング・テスト・後から取り戻せない事実の記録が YAGNI の対象にならない理由を説明できる',
    'Rails の標準機能と Rails Doctrine の考え方を、YAGNI の判断に結び付けられる',
  ],
  prerequisites: [56, 57, 11, 27],
  sections: [
    {
      id: 'scene',
      title: '円しか扱わないのに作った多通貨対応と、軽減税率の変更',
      body: (
        <>
          <p>
            この章では EC サイトの商品の税込み価格を計算する処理を例に、YAGNI を扱います。最初に、海外への出店に備えて作ってあった通貨と税の仕組みに、軽減税率を足す変更を加え、使っていない部分まで直す必要があることを実行結果で確かめます。
          </p>
          <h3>そもそも何を計算するのか</h3>
          <p>
            国内向けに食器と雑貨を売る EC サイトを考えます。商品のページには税抜きの価格に消費税を足した税込み価格を表示します。日本の消費税（地方消費税を含む）の税率は標準税率が10%で、酒類と外食を除く飲食料品などには8%の軽減税率がかかります<Ref n={4} />。このサイトはこれまで食器と雑貨だけを扱っていたので、すべての商品が標準税率でした。税額の1円未満は切り捨てると決めています。税抜き 1,980円のマグカップなら、税額は198円、税込み価格は 2,178円です。
          </p>
          <p>今回、コーヒー豆を扱うことになりました。コーヒー豆は軽減税率の対象なので、商品ごとに標準税率か軽減税率かを選べるようにする必要があります。税抜き 1,980円のコーヒー豆なら、税額は158円、税込み価格は 2,138円です。</p>
          <h3>海外への出店に備えて作ったコード</h3>
          <p>
            3年前にサイトを作ったとき、チームは「いずれ米国と EU にも出店する」と考え、通貨と為替、国ごとの税を扱える仕組みを先に作りました。商品の価格は金額と通貨の組で持ち、通貨ごとの小数の桁と為替レートはテーブルに入れています。
          </p>
          <p>
            当時の判断の理由は、「後から通貨を足すと、すべての金額の列と計算とテストを直すことになる。最初から金額と通貨の組にしておけば、後で直す手間がかからない」というものでした。この判断が引き合ったかどうかは、実際に出店したかどうかと、それまでの間にかかった費用で決まります。この節ではその費用の一部を実行結果で確かめ、次の節で整理します。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_currencies.rb"
            code={`
class CreateCurrencies < ActiveRecord::Migration[8.1]
  def change
    create_table :currencies do |t|
      t.string :code, null: false, limit: 3, index: { unique: true } # ISO 4217 の通貨コード
      t.integer :decimal_places, null: false # 小数の桁（JPY は 0、USD・EUR は 2）
      t.timestamps
    end

    create_table :exchange_rates do |t|
      t.string :base, null: false, limit: 3
      t.string :quote, null: false, limit: 3
      t.decimal :rate, precision: 18, scale: 6, null: false
      t.timestamps
      t.index %i[base quote], unique: true
    end

    create_table :products do |t|
      t.string :name, null: false
      t.decimal :price_amount, precision: 12, scale: 2, null: false # 税抜きの価格
      t.string :price_currency, null: false, limit: 3, default: "JPY"
      t.timestamps
    end
  end
end
`}
          />
          <p>
            金額は Money という値のクラスで表します。通貨の違う金額は足せないようにし、通貨ごとの桁で切り捨て、為替レートで別の通貨に換算できます。Currency と ExchangeRate は、それぞれのテーブルから桁とレートを読むだけのモデルです。
          </p>
          <Code
            lang="ruby"
            title="app/models/money.rb"
            code={`
# 金額と通貨の組。海外に出店したときに備えて、通貨ごとの桁と為替の換算を扱う
Money = Data.define(:amount, :currency) do
  def +(other)
    raise ArgumentError, "通貨が違います: #{currency} と #{other.currency}" unless currency == other.currency

    with(amount: amount + other.amount)
  end

  def *(factor) = with(amount: amount * factor)

  # 通貨の小数の桁で切り捨てる（JPY は整数、USD・EUR は 0.01 単位）
  def floor = with(amount: amount.floor(Currency.decimal_places(currency)))

  def convert_to(other_currency)
    return self if currency == other_currency

    converted = amount * ExchangeRate.rate(currency, other_currency)
    Money.new(converted.round(Currency.decimal_places(other_currency)), other_currency)
  end
end

# app/models/currency.rb
class Currency < ApplicationRecord
  def self.decimal_places(code) = find_by!(code:).decimal_places
end

# app/models/exchange_rate.rb
class ExchangeRate < ApplicationRecord
  def self.rate(base, quote) = find_by!(base:, quote:).rate
end
`}
          />
          <p>税の計算は販売する国ごとにクラスを分けています。米国の売上税は「出店するときに決める」として0にし、EU の付加価値税は仮に20%にしています。</p>
          <Code
            lang="ruby"
            title="app/models/tax_policy.rb と app/models/tax_policy/*.rb（適用前）"
            code={`
# 販売する国ごとの税の計算。海外に出店したときに備えて、国ごとにクラスを分けている
module TaxPolicy
  def self.for(country)
    { "JP" => Jp, "US" => Us, "EU" => Eu }.fetch(country).new
  end
end

# app/models/tax_policy/jp.rb
module TaxPolicy
  # 日本の消費税（標準税率 10%）
  class Jp
    def tax_for(money) = (money * BigDecimal("0.10")).floor
  end
end

# app/models/tax_policy/us.rb
module TaxPolicy
  # 米国の売上税。州ごとの税率は、米国に出店するときに決める
  class Us
    def tax_for(money) = Money.new(BigDecimal("0"), money.currency)
  end
end

# app/models/tax_policy/eu.rb
module TaxPolicy
  # EU の付加価値税（仮に 20%）
  class Eu
    def tax_for(money) = (money * BigDecimal("0.20")).floor
  end
end
`}
          />
          <p>商品のページからは PriceQuote を呼びます。PriceQuote は販売する国と表示する通貨を引数で受け取り、価格を換算してから税を足します。</p>
          <Code
            lang="ruby"
            title="app/services/price_quote.rb・app/models/product.rb・app/controllers/products_controller.rb（適用前）"
            code={`
# 商品の税込み価格を、販売する国と表示する通貨で計算する
class PriceQuote
  def initialize(product, country: "JP", currency: "JPY")
    @product = product
    @country = country
    @currency = currency
  end

  def price = @product.price.convert_to(@currency)
  def tax = TaxPolicy.for(@country).tax_for(price)
  def price_with_tax = price + tax
end

# app/models/product.rb
class Product < ApplicationRecord
  def price = Money.new(price_amount, price_currency)
end

# app/controllers/products_controller.rb
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])
    @quote = PriceQuote.new(@product)
  end
end
`}
          />
          <p>
            テストは、Money の4つの例、国ごとの税の3つの例、PriceQuote の2つの例（日本で円、米国向けに USD）、商品のページの1つの例があり、すべて通っています。円の税額を切り捨てるときにも currencies テーブルから桁を読むので、円の計算だけを確かめるテストでも、次のマスターデータを毎回作っています。
          </p>
          <Code
            lang="ruby"
            title="spec/support/master_data.rb"
            code={`
# 通貨と為替レートのマスターデータ（本番と同じ値）
def create_master_data
  Currency.create!(code: "JPY", decimal_places: 0)
  Currency.create!(code: "USD", decimal_places: 2)
  Currency.create!(code: "EUR", decimal_places: 2)
  ExchangeRate.create!(base: "JPY", quote: "USD", rate: "0.0066")
  ExchangeRate.create!(base: "JPY", quote: "EUR", rate: "0.0061")
end
`}
          />
          <p>図 56-1 はここまでのクラスとテーブルの関係です。</p>
          <Figure n="56-1" title="多通貨に備えた価格の計算の構成" caption="実線の矢印は呼び出し、破線の矢印はテーブルを読むことを表す。">
            <SceneFigure />
          </Figure>
          <h3>3年間で使われた部分を調べる</h3>
          <p>海外への出店は、3年たっても予定が決まっていません。開発環境に本番と同じ形のデータ（商品120件と、通貨・為替レートのマスターデータ）を入れ、使われ方を調べました。</p>
          <Code
            lang="ruby"
            title="script/usage.rb"
            code={`
# 作った機能のうち、データで使われているものを調べる
puts "商品の通貨ごとの件数: #{Product.group(:price_currency).count}"
puts "為替レートの行: #{ExchangeRate.pluck(:base, :quote).inspect}"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/usage.rb と、app の中で国と通貨を指定している箇所の検索）"
            code={`
商品の通貨ごとの件数: {"JPY" => 120}
為替レートの行: [["JPY", "EUR"], ["JPY", "USD"]]

$ grep -rn "convert_to\\|TaxPolicy.for\\|country:\\|currency:" app --include=*.rb --include=*.erb
app/services/price_quote.rb:3:  def initialize(product, country: "JP", currency: "JPY")
app/services/price_quote.rb:9:  def price = @product.price.convert_to(@currency)
app/services/price_quote.rb:10:  def tax = TaxPolicy.for(@country).tax_for(price)
app/models/money.rb:14:  def convert_to(other_currency)
`}
          />
          <p>
            商品はすべて円で、PriceQuote を呼んでいるのはコントローラーの1か所だけです。country: と currency: を渡している呼び出しは app の中にはなく、いつも既定値の "JP" と "JPY" が使われます。そのため convert_to は、通貨が同じときの <code>return self</code> しか通りません。図 56-2 は作った機能と使われた機能を並べたものです。
          </p>
          <Figure n="56-2" title="作った機能と使われた機能" caption="使われた数は、商品のデータと app の中の呼び出しから数えた。米国向けの例はテストの中にだけある。">
            <BuiltUsedFigure />
          </Figure>
          <h3>軽減税率を足すと</h3>
          <p>
            まず、商品に税率の区分（tax_category）の列を足し、日本の税のクラスで区分ごとの税率を使うように変えました。PriceQuote は商品の区分を TaxPolicy に渡します。
          </p>
          <Code
            lang="ruby"
            title="app/models/tax_policy/jp.rb と app/services/price_quote.rb（軽減税率の途中）"
            code={`
module TaxPolicy
  # 日本の消費税（標準税率 10%、軽減税率 8%）
  class Jp
    RATES = { "standard" => BigDecimal("0.10"), "reduced" => BigDecimal("0.08") }.freeze

    def tax_for(money, category:) = (money * RATES.fetch(category)).floor
  end
end

# app/services/price_quote.rb（変えた行）
  def tax = TaxPolicy.for(@country).tax_for(price, category: @product.tax_category)
`}
          />
          <p>コーヒー豆の例をテストに足して、すべてのテストを実行しました。</p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec。トレースの一部を省略）"
            code={`
...........F

Failures:

  1) PriceQuote 米国向けに USD で表示する
     Failure/Error: def tax_for(money) = Money.new(BigDecimal("0"), money.currency)

     ArgumentError:
       wrong number of arguments (given 2, expected 1)
     # ./app/models/tax_policy/us.rb:4:in 'TaxPolicy::Us#tax_for'
     # ./app/services/price_quote.rb:10:in 'PriceQuote#tax'
     # ./app/services/price_quote.rb:11:in 'PriceQuote#price_with_tax'
     # ./spec/services/price_quote_spec.rb:19:in 'block (2 levels) in <top (required)>'

Finished in 0.19978 seconds (files took 2.01 seconds to load)
12 examples, 1 failure
`}
          />
          <p>
            日本の例とコーヒー豆の例は通りましたが、米国向けの例が ArgumentError で失敗しました。PriceQuote が category: を渡すようになったのに、Us の tax_for は引数を1つしか受け取らないからです。米国では一度も商品を売っていませんが、このテストを通すには Us と Eu も直す必要があります。
          </p>
          <Code
            lang="ruby"
            title="app/models/tax_policy/us.rb と eu.rb（軽減税率のために直した後）"
            code={`
module TaxPolicy
  # 米国の売上税。州ごとの税率は、米国に出店するときに決める
  class Us
    def tax_for(money, category:) = Money.new(BigDecimal("0"), money.currency)
  end
end

module TaxPolicy
  # EU の付加価値税（仮に標準 20%・軽減 5%。国ごとの税率は出店するときに決める）
  class Eu
    RATES = { "standard" => BigDecimal("0.20"), "reduced" => BigDecimal("0.05") }.freeze

    def tax_for(money, category:) = (money * RATES.fetch(category)).floor
  end
end
`}
          />
          <p>
            Eu には、軽減税率の値が必要になりました。出店する国も時期も決まっていないので、5% という値に根拠はありません。それでも、引数をそろえるためには何かの値を書き、テストも足す必要があります。変更の前と後のファイルを比べると、次のようになりました。
          </p>
          <Code
            lang="text"
            title="実行結果（git diff --no-index --stat で、軽減税率を足す前と後の app・spec・db/migrate を比べた）"
            code={`
 {multi-before => multi-after}/app/models/product.rb            |  3 +++
 {multi-before => multi-after}/app/models/tax_policy/eu.rb      |  6 ++++--
 {multi-before => multi-after}/app/models/tax_policy/jp.rb      |  6 ++++--
 {multi-before => multi-after}/app/models/tax_policy/us.rb      |  2 +-
 {multi-before => multi-after}/app/services/price_quote.rb      |  2 +-
 .../db/migrate/20261121000002_add_tax_category_to_products.rb  |  5 +++++
 {multi-before => multi-after}/spec/models/tax_policy_spec.rb   | 10 +++++++---
 .../spec/services/price_quote_spec.rb                          |  5 +++++
 8 files changed, 30 insertions(+), 9 deletions(-)
`}
          />
          <h3>このコードの問題</h3>
          <ul>
            <li>使っていない国のクラス（Us・Eu）とそのテストを、国内の税率の変更のたびに直す必要があります。8つのファイルのうち3つは、売ったことのない国のための変更でした。</li>
            <li>使っていない国について、根拠のない値（EU の軽減税率 5%）を決めてコードに書くことになります。出店するときには、この値をもう一度調べ直す必要があります。</li>
            <li>円の計算に、Money・Currency・ExchangeRate を通ります。税額の切り捨ての桁は、currencies テーブルの行が無ければ ActiveRecord::RecordNotFound になるので、テストでも毎回マスターデータを作っています。</li>
            <li>PriceQuote の country: と currency: は、どこからも渡されていません。読む人は、この引数がどこで使われるのかを探す必要があります。</li>
          </ul>
          <p>次の節ではこの問題を YAGNI の考え方で整理します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'YAGNI の意味と由来：必要になるまで作らない',
      body: (
        <>
          <h3>YAGNI の定義</h3>
          <p>
            <Term en="You Aren't Gonna Need It">YAGNI</Term>は You Aren't Gonna Need It（それは必要にならない）の頭文字です。この部では次の定義で扱います。
          </p>
          <ul>
            <li>現時点で必要のない機能は実装しない。</li>
            <li>将来の可能性だけを理由に、複雑性を増やさない。</li>
          </ul>
          <p>
            ここでの「機能」には利用者に見える機能だけでなく、将来の変更に備えた抽象化（拡張点・引数・設定・列）も含みます。この章の例では、USD・EUR の表示や為替の換算が「機能」で、TaxPolicy.for(country) と国ごとのクラス、PriceQuote の country: と currency: が「将来に備えた抽象化」です。
          </p>
          <h3>由来：エクストリーム・プログラミング</h3>
          <p>
            YAGNI は、開発手法<Term en="Extreme Programming">エクストリーム・プログラミング</Term>（XP）で使われてきた言葉です。Martin Fowler によると、この言葉は C3 と呼ばれるプロジェクトでの Kent Beck と Chet Hendrickson の会話から生まれました。Chet がシステムにすぐ必要になりそうな機能を次々に挙げ、Kent はそのたびに「それは必要にならない」と答えた、というものです<Ref n={1} />。Fowler は、YAGNI が XP の実践の1つである Simple Design（単純な設計）を指す言葉だとも書いています<Ref n={1} />。
          </p>
          <p>XP を実践し、広めてきた Ron Jeffries は、1998年の記事「You're NOT gonna need it!」で次のように書いています<Ref n={2} />。</p>
          <ul>
            <li>「必要になる」と思った衝動には、毎回あらがう。実際に必要になったときに実装し、必要になると予想しただけのときには実装しない。</li>
            <li>理由は3つある。考えが本来の作業からそれていること。時間は貴重であること。結局は必要にならないかもしれず、その場合は実装した時間も、ほかの人がそれを読む時間も無駄になること。</li>
            <li>速く実装する最もよい方法は実装を減らすことで、バグを減らす最もよい方法はコードを減らすことである。</li>
          </ul>
          <h3>まだ使われない機能にかかる4つの費用</h3>
          <p>
            Fowler は2015年の記事「Yagni」で、まだ使えるようになっていない機能を支えるコードを<Term en="presumptive feature">見込みの機能</Term>と呼び、見込みの機能を3つの場合に分けて、4つの費用を挙げました<Ref n={1} />。記事の例は嵐の保険の料金を計算するソフトウェアに、半年後に必要になる海賊の保険の料金計算を先に作るかどうか、というものです。
          </p>
          <ul>
            <li>作る費用（cost of build）：見込みが外れて機能が必要にならなかった場合、分析・実装・テストにかけた労力がすべて無駄になります。</li>
            <li>遅れる費用（cost of delay）：見込みが当たった場合でも、その機能を作っている間、今必要な別の機能が作れません。記事の例では、嵐の保険の販売を始める時期が遅れ、その分の売り上げを失います。</li>
            <li>抱える費用（cost of carry）：見込みの機能のコードはソフトウェアを複雑にし、ほかの機能の変更やデバッグを難しくします。必要にならなかった場合は消すまで、必要になった場合は使い始めるまで、この費用がかかり続けます。</li>
            <li>直す費用（cost of repair）：必要な機能だったが、作り方が後で分かったことに合わなかった場合、作り直すか、合わない部分を避けながら使い続ける費用がかかります。</li>
          </ul>
          <p>図 56-3 は3つの場合と4つの費用を、この章の多通貨の仕組みに当てはめたものです。</p>
          <Figure n="56-3" title="まだ使われない機能にかかる4つの費用" caption="Fowler の記事「Yagni」の分類をもとに、この章の例を書き入れた。">
            <FourCostsFigure />
          </Figure>
          <p>
            前の節で見たのは、このうちの抱える費用です。海外に出店していないので、多通貨の仕組みは今のところ「必要にならなかった」場合に当たります。軽減税率を足す変更では8つのファイルのうち3つが、売ったことのない国のための変更でした。仕組みを消さない限り、税や価格の変更のたびに同じ費用がかかります。将来出店するとしても、今の国ごとのクラスの形（<code>tax_for(money, category:)</code>）が出店先の税の決まりに合う保証はなく、直す費用がかかる可能性があります。
          </p>
          <h3>「今作るほうが安い」という理由</h3>
          <p>
            見込みの機能を作る理由として最もよく挙げられるのは「後で作るより、今作るほうが安い」です。Fowler は、この比較には少なくとも遅れる費用を含め、さらに作った機能が必要にならない確率も考えるべきだと書いています。その確率として、Microsoft の製品で、念入りに分析してから作った機能でも、狙った指標を改善したのは3分の1だったという Kohavi らの分析を挙げ、外れる確率は少なくとも3分の2だとしています<Ref n={1} />。
          </p>
          <p>
            Fowler はまた、後で必要になったときに行うリファクタリングを具体的に想像してみることを勧めています。想像してみると、後から足してもそれほど高くつかないとわかることが多いからです<Ref n={1} />。この章の例で想像すると、米国に出店すると決まったときに、price_currency の列を足し、Money を入れ、出店先の税の決まりを調べてクラスを作ることになります。どれも、そのときに決まっている要件に合わせて作れます。
          </p>
          <p>
            同じ想像から、反対の結論が出ることもあります。Fowler は、今やっても複雑さがほとんど増えず、後の費用を大きく下げる作業なら、今やってよいと書いています。その例として、エラーメッセージを文の中に直接書かず、参照用の表から引くようにしておくと、後で翻訳に対応しやすい、という例を挙げています<Ref n={1} />。Rails なら、画面の文言を I18n の辞書のファイルに置くことがこれに近い作業です。判断の基準は、「今の複雑さをどれだけ増やすか」と「後の費用をどれだけ下げるか」の比較です。
          </p>
          <h3>小さな YAGNI の判断</h3>
          <p>
            YAGNI は、多通貨対応のような大きな機能で話題になりますが、Fowler は、より頻繁に出てくるのは小さな判断だと書いています。まだ使わないフィールドやメソッドを、使う準備ができるまで足さない、という判断です。1時間で足せる「すぐ必要になるはずの抽象化」はプロジェクトの計画には表れませんが、小さな判断を積み重ねると、コードの複雑さは大きく減るとしています<Ref n={1} />。同じ記事は Jeremy Miller の「使われない拡張点は、労力の無駄であるだけでなく、たいてい邪魔にもなる」という言葉も引いています<Ref n={1} />。
          </p>
          <p>
            この章の PriceQuote の <code>country:</code> と <code>currency:</code> は、この小さな判断の例です。どこからも渡されない引数でも、読む人は「どこかで米国向けに呼んでいるのではないか」と考えて検索します。軽減税率を足したときには、この引数が Us と Eu を呼ぶ経路を残していたために、使っていない国のコードまで直すことになりました。
          </p>
          <h3>YAGNI が前提にすること</h3>
          <p>Fowler は、YAGNI についてよくある誤解として、次の点を挙げています<Ref n={1} />。</p>
          <ul>
            <li>YAGNI が対象にするのは、見込みの機能のための仕組みだけで、ソフトウェアを変更しやすくするための作業は対象にしない。リファクタリングは YAGNI に反しない。</li>
            <li>自動テスト（self-testing code）や継続的な配布（continuous delivery）も同じで、これらがなければ YAGNI は役に立つ実践から害のある実践に変わる。YAGNI はコードの健全さをおろそかにする理由にはならない。</li>
            <li>将来のための作業でも、今のソフトウェアを複雑にしないなら、YAGNI を持ち出す理由はない。</li>
            <li>YAGNI に従った結果、後で高くつく変更が必要になることもある。ただしそうした例は覚えていやすいだけで、YAGNI で省けた労力のほうが大きいと考えている。</li>
          </ul>
          <p>つまり YAGNI は、変更しやすいコードとテストがあることを前提に、「必要になったら、そのときに足せばよい」と判断する原則です。テストがなく、変更のたびに壊れるコードでは、「後で足す」の費用が高くなり、判断が変わります。</p>
          <h3>似た原則との違い</h3>
          <p>図 56-4 は YAGNI と同じ場面で使われることの多い原則を、この章の例で比べたものです。</p>
          <Figure n="56-4" title="YAGNI と似た原則の違い" caption="どの原則も判断の基準で、互いに対立することがある。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">原則</th>
                    <th scope="col">何を問うか</th>
                    <th scope="col">この章の例での問い</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">YAGNI</th>
                    <td>今使わない機能や抽象化を作っていないか</td>
                    <td>USD・EUR・為替・国ごとの税を、今使っているか</td>
                  </tr>
                  <tr>
                    <th scope="row">KISS</th>
                    <td>今の問題を解く仕組みが、問題より複雑になっていないか</td>
                    <td>円の税込み価格の計算に、Money と3つのテーブルが要るか</td>
                  </tr>
                  <tr>
                    <th scope="row">AHA</th>
                    <td>実例が少ないうちに抽象化していないか</td>
                    <td>日本の1例だけから、国ごとのクラスの形を決めていないか</td>
                  </tr>
                  <tr>
                    <th scope="row">DIP</th>
                    <td>上位の方針が下位の詳細に直接依存していないか</td>
                    <td>税の計算を差し替えるための抽象は、差し替える相手があるときに作ったか</td>
                  </tr>
                  <tr>
                    <th scope="row">Boy Scout Rule</th>
                    <td>触ったコードを少し良くしたか</td>
                    <td>使っていない引数やクラスを消すことは、YAGNI に反しない</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            KISS（<ChapterLink n={57} />）は「作ると決めた機能を、どれだけ単純な仕組みで作るか」を問い、YAGNI は「その機能を今作るか」を問います。DIP（<ChapterLink n={67} />）とは対立することがあります。DIP に沿って抽象を先に用意すれば、後で実装を差し替えやすくなりますが、差し替える相手がまだないなら、その抽象は見込みの機能です。この対立は<ChapterLink n={93} section="yagni-dip" />で、両方の書き方を比べて扱います。
          </p>
        </>
      ),
    },
    {
      id: 'apply',
      title: '使われていない仕組みを消してから、軽減税率を足す',
      body: (
        <>
          <h3>直す順序</h3>
          <p>軽減税率を足す前に、使っていない多通貨の仕組みを消します。消す作業はリファクタリングなので、前の節で見たとおり YAGNI に反しません。次の5つの手順に分け、手順ごとにテストを実行します。</p>
          <ol>
            <li>使われ方をデータとコードで調べる（前の節の script/usage.rb と検索）</li>
            <li>今使っている挙動（日本で円）をテストで確かめておく</li>
            <li>呼び出し側を、円だけを扱う書き方に変える</li>
            <li>使っていないクラス・テーブル・列を消す</li>
            <li>軽減税率を足す</li>
          </ol>
          <p>
            手順1で、消してよいかを決める根拠を集めます。この章では、商品がすべて円であること、country: と currency: を渡す呼び出しがないこと、為替の換算が通らないことを確かめました。使われ方を確かめずに消すと、管理画面の一部や夜間のジョブだけが使っていた、という場合に気づけません。検索の範囲には app だけでなく lib・config・db/seeds.rb・rake のタスクも含めます。
          </p>
          <h3>手順2：今の挙動をテストで確かめておく</h3>
          <p>
            今使っている挙動は「日本で円で売ると、税抜き 1,980円の商品が税込み 2,178円になる」ことと、商品のページにその金額を表示することです。PriceQuote の日本の例と、商品のページの request spec がこれに当たります。この2つの期待値（2,178円と「2,178円（税込み）」）は、手順3以降も変えません。USD の例と、Money・TaxPolicy の USD・EUR の例は、消す仕組みと一緒に消します。
          </p>
          <h3>手順3：円だけを扱う書き方に変える</h3>
          <p>
            価格は税抜きの円の整数で持ち、税額と税込み価格は Product のメソッドで計算します。Money・PriceQuote・TaxPolicy は使いません。
          </p>
          <Code
            lang="ruby"
            title="app/models/product.rb（円だけを扱う）"
            code={`
class Product < ApplicationRecord
  TAX_RATE_PERCENT = 10 # 消費税の標準税率

  validates :price, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  # 税額は円未満を切り捨てる
  def tax = price * TAX_RATE_PERCENT / 100
  def price_with_tax = price + tax
end
`}
          />
          <p>
            整数どうしの割り算は小数点以下を切り捨てるので、<code>price * TAX_RATE_PERCENT / 100</code> で税額の1円未満を切り捨てられます。先に掛け算をするのは、<code>price / 100 * 10</code> の順にすると 1,999円の税額が 190円になり、先に端数を落としてしまうからです。
          </p>
          <p>
            コントローラーは商品を読むだけになり、ビューでは Rails の number_to_currency で金額を3桁ごとに区切って「円」を付けます。unit・format・precision の指定で、単位の文字・単位の位置・小数の桁を決められます<Ref n={6} />。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/products_controller.rb と app/views/products/show.html.erb"
            code={`
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])
  end
end

<%# app/views/products/show.html.erb %>
<h1><%= @product.name %></h1>
<p><%= number_to_currency(@product.price_with_tax, unit: "円", format: "%n%u", precision: 0) %>（税込み）</p>
`}
          />
          <p>テストは手順2の期待値をそのまま使って書き直しました。</p>
          <Code
            lang="ruby"
            title="spec/models/product_spec.rb と spec/requests/products_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Product do
  it "税込み価格は税抜き価格に 10% の税を足す" do
    expect(Product.new(price: 1980).price_with_tax).to eq 2178
  end

  it "税額の円未満は切り捨てる" do
    expect(Product.new(price: 1999).tax).to eq 199
  end
end

# spec/requests/products_spec.rb
RSpec.describe "商品のページ", type: :request do
  it "税込み価格を円で表示する" do
    mug = Product.create!(name: "マグカップ", price: 1980)
    get product_path(mug)
    expect(response.body).to include("2,178円（税込み）")
  end
end
`}
          />
          <h3>手順4：使っていないクラス・テーブル・列を消す</h3>
          <p>
            price 列を足して price_amount の値を移すマイグレーションと、使わなくなった列とテーブルを消すマイグレーションの2つに分けます。最初のマイグレーションは、円以外の価格や1円未満の端数がある価格が1件でもあれば、列を足す前に止まります。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000002_add_price_to_products.rb"
            code={`
class AddPriceToProducts < ActiveRecord::Migration[8.1]
  def up
    # 円以外の価格や、1円未満の端数がある価格があれば、列を足す前に止める
    others = select_value(<<~SQL)
      SELECT COUNT(*) FROM products WHERE price_currency <> 'JPY' OR price_amount <> FLOOR(price_amount)
    SQL
    raise "円の整数ではない価格が #{others} 件あります" if others.positive?

    add_column :products, :price, :integer # 税抜きの価格（円）
    execute "UPDATE products SET price = price_amount"
    change_column_null :products, :price, false
  end

  def down
    remove_column :products, :price
  end
end
`}
          />
          <Code
            lang="ruby"
            title="db/migrate/20261121000003_remove_currency_tables.rb"
            code={`
class RemoveCurrencyTables < ActiveRecord::Migration[8.1]
  def change
    remove_column :products, :price_amount, :decimal, precision: 12, scale: 2, null: false
    remove_column :products, :price_currency, :string, null: false, limit: 3, default: "JPY"
    drop_table :exchange_rates do |t|
      t.string :base, null: false, limit: 3
      t.string :quote, null: false, limit: 3
      t.decimal :rate, precision: 18, scale: 6, null: false
      t.timestamps
      t.index %i[base quote], unique: true
    end
    drop_table :currencies do |t|
      t.string :code, null: false, limit: 3, index: { unique: true }
      t.integer :decimal_places, null: false
      t.timestamps
    end
  end
end
`}
          />
          <p>
            remove_column と drop_table に型やテーブルの定義を書いているのは、change の中で戻せるようにするためです。Rails のガイドは、drop_table はテーブルを作るときのオプションとブロックを渡した場合に戻せると説明しています<Ref n={7} />。
          </p>
          <p>開発環境に、適用前の形の商品120件と、試しに登録した米国向けの商品（12.50 USD）を入れて実行しました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails db:migrate。1回目は米国向けの商品が残っているとき）"
            code={`
--- 1回目
bin/rails aborted!
StandardError: An error has occurred, all later migrations canceled: (StandardError)

円の整数ではない価格が 1 件あります

--- 米国向けの商品を消してから、2回目
== 20261121000002 AddPriceToProducts: migrating ===============================
-- select_value("SELECT COUNT(*) FROM products WHERE price_currency <> 'JPY' OR price_amount <> FLOOR(price_amount)\\n")
   -> 0.0008s
   -> 0 rows
-- add_column(:products, :price, :integer)
   -> 0.0503s
-- execute("UPDATE products SET price = price_amount")
   -> 0.0209s
-- change_column_null(:products, :price, false)
   -> 0.1707s
== 20261121000002 AddPriceToProducts: migrated (0.2430s) ======================

== 20261121000003 RemoveCurrencyTables: migrating =============================
-- remove_column(:products, :price_amount, :decimal, {precision: 12, scale: 2, null: false})
   -> 0.0367s
-- remove_column(:products, :price_currency, :string, {null: false, limit: 3, default: "JPY"})
   -> 0.0394s
-- drop_table(:exchange_rates)
   -> 0.0553s
-- drop_table(:currencies)
   -> 0.0532s
== 20261121000003 RemoveCurrencyTables: migrated (0.1849s) ====================

[[120, 500, 12400]]
["ar_internal_metadata", "products", "schema_migrations"]
`}
          />
          <p>
            1回目の失敗は、手順1の調べで見落としていたデータを、列を変える前に見つけた例です。この商品は運営担当が試しに登録したもので、販売していないことを確かめてから消しました。最後の2行は移した後の商品の件数・最小と最大の価格と、残ったテーブルです。120件の価格が price 列に入り、currencies と exchange_rates がなくなりました。本番で動いているアプリから列を消すときは、先に ignored_columns で price_amount と price_currency を扱わないコードを配布してから、2つ目のマイグレーションを実行します。手順は<ChapterLink n={27} section="live-change" />で説明しています。
          </p>
          <p>Money・Currency・ExchangeRate・TaxPolicy・PriceQuote と、それらのテストを消しました。手順4までの変更を、適用前と比べると次のようになります。</p>
          <Code
            lang="text"
            title="実行結果（git diff --no-index --stat で、適用前と手順4の後の app・spec・db/migrate を比べた）"
            code={`
 .../app/controllers/products_controller.rb         |  1 -
 multi-before/app/models/currency.rb => /dev/null   |  3 ---
 .../app/models/exchange_rate.rb => /dev/null       |  3 ---
 multi-before/app/models/money.rb => /dev/null      | 20 -------------------
 {multi-before => yen-before}/app/models/product.rb |  8 +++++++-
 .../app/models/tax_policy/eu.rb => /dev/null       |  6 ------
 .../app/models/tax_policy/jp.rb => /dev/null       |  6 ------
 .../app/models/tax_policy/us.rb => /dev/null       |  6 ------
 multi-before/app/models/tax_policy.rb => /dev/null |  6 ------
 .../app/services/price_quote.rb => /dev/null       | 12 -----------
 .../app/views/products/show.html.erb               |  2 +-
 .../20261121000002_add_price_to_products.rb        | 17 ++++++++++++++++
 .../20261121000003_remove_currency_tables.rb       | 18 +++++++++++++++++
 .../spec/models/money_spec.rb => /dev/null         | 23 ----------------------
 .../null => yen-before/spec/models/product_spec.rb | 11 +++++++++++
 .../spec/models/tax_policy_spec.rb => /dev/null    | 18 -----------------
 .../spec/requests/products_spec.rb                 |  5 +----
 .../spec/services/price_quote_spec.rb => /dev/null | 16 ---------------
 .../spec/support/master_data.rb => /dev/null       |  8 --------
 19 files changed, 55 insertions(+), 134 deletions(-)
`}
          />
          <p>追加した55行のうち35行はマイグレーションです。アプリとテストのコードは、差し引き114行減りました。</p>
          <h3>手順5：軽減税率を足す</h3>
          <p>ここで、本来の目的だった軽減税率を足します。税率の区分の列を足し、区分ごとの税率をハッシュで持ちます。</p>
          <Code
            lang="ruby"
            title="app/models/product.rb（軽減税率を足した後）と db/migrate/20261121000004_add_tax_category_to_products.rb"
            code={`
class Product < ApplicationRecord
  # 消費税率（%）。standard は標準税率、reduced は軽減税率（飲食料品）
  TAX_RATE_PERCENTS = { "standard" => 10, "reduced" => 8 }.freeze

  enum :tax_category, { standard: "standard", reduced: "reduced" }, validate: true
  validates :price, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  # 税額は円未満を切り捨てる
  def tax = price * TAX_RATE_PERCENTS.fetch(tax_category) / 100
  def price_with_tax = price + tax
end

# db/migrate/20261121000004_add_tax_category_to_products.rb
class AddTaxCategoryToProducts < ActiveRecord::Migration[8.1]
  def change
    add_column :products, :tax_category, :string, null: false, default: "standard"
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/models/product_spec.rb（足した例）"
            code={`
  it "軽減税率の食品は 8% の税を足す" do
    expect(Product.new(price: 1980, tax_category: :reduced).price_with_tax).to eq 2138
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
Product
  税込み価格は税抜き価格に 10% の税を足す
  軽減税率の食品は 8% の税を足す
  税額の円未満は切り捨てる

環境
  MySQL 8.4 につながる

商品のページ
  税込み価格を円で表示する

Finished in 0.10268 seconds (files took 1.85 seconds to load)
5 examples, 0 failures
`}
          />
          <p>
            「環境」の例は、検証用のアプリが MySQL 8.4 につながることを確かめるもので、この章のコードとは関係ありません。同じ軽減税率の変更を、手順4の後と比べると次のようになりました。
          </p>
          <Code
            lang="text"
            title="実行結果（git diff --no-index --stat で、軽減税率を足す前と後を比べた）"
            code={`
 {yen-before => yen-after}/app/models/product.rb                     | 6 ++++--
 .../db/migrate/20261121000004_add_tax_category_to_products.rb       | 5 +++++
 {yen-before => yen-after}/spec/models/product_spec.rb               | 4 ++++
 3 files changed, 13 insertions(+), 2 deletions(-)
`}
          />
          <h3>直す前と後の比較</h3>
          <p>
            図 56-5 は同じ軽減税率の変更で変えたファイルを、多通貨に備えた設計と円だけの設計とで並べたものです。直す前は8つのファイルを変え、そのうち3つは売ったことのない国のための変更でした。直した後は、列を足すマイグレーション、Product、そのテストの3つで済みます。
          </p>
          <Figure n="56-5" title="軽減税率を足すときに変えたファイル（直す前と後）" caption="破線の箱は、使っていない国のための変更。数字は追加と削除の行数。migrate は db/migrate。">
            <ChangedFilesFigure />
          </Figure>
          <Callout kind="note" title="多通貨が本当に必要になったら">
            <p>
              海外への出店が決まったら、そのときの要件に合わせて足します。たとえば、price_currency の列を既定値 "JPY" で足し、金額と通貨を組にした値のクラスを入れます。値のクラスで金額を表す方法は<ChapterLink n={46} section="money" />で扱っています。そのときには、出店先の国、税の決まり、表示する通貨が決まっているので、今の時点で想像して作るより、合った形で作れます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '当てはめすぎたとき：記録・テスト・決まった予定まで省く',
      body: (
        <>
          <p>YAGNI を「今使わないものは何も作らない」と受け取ると、後から取り戻せないものまで省いてしまいます。この節では当てはめすぎの例を動かし、YAGNI の対象にならない作業を整理します。</p>
          <h3>注文の明細に、注文した時点の価格と税率を残さない</h3>
          <p>
            注文の明細には、どの商品を何個買ったかを記録します。「明細の画面では商品の今の価格を表示すればよく、注文した時点の価格を表示する要件はまだない」と考えて、価格と税率を明細に残さなかった場合を考えます。次のスクリプトは価格と税率を残さない明細（BareOrderLine）と、残す明細（OrderLine）を同じ注文で比べます。テーブルはスクリプトの中で作っています。
          </p>
          <Code
            lang="ruby"
            title="script/overuse/order_lines.rb"
            code={`
# 注文の明細に、注文した時点の価格と税率を残すかどうかで、過去の注文の金額がどう変わるかを比べる
# …（bare_order_lines と order_lines のテーブルを作る部分は省略）

# 「今は表示に使わないから」と、価格と税率を残さない明細（当てはめすぎの例）
class BareOrderLine < ApplicationRecord
  belongs_to :product
  def total = product.price_with_tax * quantity # 表示するたびに、商品の今の価格と税率で計算する
end

# 注文した時点の価格と税率を残す明細
class OrderLine < ApplicationRecord
  belongs_to :product

  def self.build_from(product, quantity:)
    new(product:, quantity:, unit_price: product.price, tax_rate_percent: Product::TAX_RATE_PERCENTS.fetch(product.tax_category))
  end

  def total = (unit_price + unit_price * tax_rate_percent / 100) * quantity
end

beans = Product.create!(name: "コーヒー豆", price: 1980) # 誤って標準税率のまま登録していた
bare = BareOrderLine.create!(product: beans, quantity: 2)
kept = OrderLine.build_from(beans, quantity: 2).tap(&:save!)
puts "注文した日:   残さない明細 #{bare.total}円 / 残す明細 #{kept.total}円"

beans.update!(price: 2180, tax_category: :reduced) # 1か月後に税率の区分を直し、値上げした
puts "1か月後:     残さない明細 #{bare.reload.total}円 / 残す明細 #{kept.reload.total}円"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner で script/overuse/order_lines.rb を読み込んだ）"
            code={`
注文した日:   残さない明細 4356円 / 残す明細 4356円
1か月後:     残さない明細 4708円 / 残す明細 4356円
`}
          />
          <p>
            価格と税率を残さない明細では、商品の区分と価格を直しただけで、1か月前の注文の金額が 4,356円から 4,708円に変わりました。利用者が実際に支払った金額はもうどこにも残っていないので、後から「注文した時点の価格を表示する」要件が来ても、過去の注文については取り戻せません。
          </p>
          <p>
            税率そのものも変わります。国税庁の軽減税率制度のページは、令和9年4月1日から令和11年3月31日までの2年間、飲食料品の譲渡について消費税率が引き下げられると案内しています<Ref n={5} />。税率を定数で持つ今の Product のまま、明細に税率を残していなければ、定数を書き換えた時点で、それより前の注文の金額も変わります。
          </p>
          <p>
            注文した時点の価格と税率は、まだ使われない機能ではなく、その時点で起きた事実の記録です。Fowler は、YAGNI は将来のために今の複雑さを増やす場合にだけ当てはまると書いています<Ref n={1} />。列を2つ足して値を写すことはソフトウェアをほとんど複雑にしませんが、省くと後からどれだけ費用をかけても取り戻せません。商品の価格と、明細に写した注文した時点の価格との関係は<ChapterLink n={88} />でも扱います。
          </p>
          <h3>日付の決まった変更を、YAGNI を理由に先送りする</h3>
          <p>
            上の税率の引下げは、始まる日と終わる日が決まっています。「税率に適用開始日を持たせるのは、今は要らない」と判断してよいのは、変更が見込みにとどまっている間だけです。日付が決まった変更は、見込みの機能ではなく、期限のある要件です。遅れる費用（間に合わなければ誤った税額で売ることになる）を考え、適用開始日までに、テストを含めて作っておきます。反対に、日付が決まっていない「いずれ税率が変わるかもしれない」に備えて、今のうちに税率の履歴のテーブルや管理画面を作るのは YAGNI に反します。
          </p>
          <h3>YAGNI を理由にテストやリファクタリングを省く</h3>
          <p>
            「今は動いているから、テストは必要になったら書く」「使っていないコードを消すのは、今の機能に関係ないので後回しにする」という判断も、YAGNI の当てはめすぎです。Fowler は、リファクタリング・自動テスト・継続的な配布は、ソフトウェアを変更しやすくするための作業で、YAGNI の対象ではないと書いています<Ref n={1} />。この章でも、手順2のテストがあったので、多通貨の仕組みを消した後に、日本の税込み価格が変わっていないことを確かめられました。図 56-6 は YAGNI の対象になるものと、ならないものを分けたものです。
          </p>
          <Figure n="56-6" title="YAGNI の対象と、対象にならない作業" caption="左は将来の可能性だけを理由に足す複雑さ。右の紫は変更を容易にする活動（Fowler の記事による）、緑は今の要件そのもの。">
            <NotYagniFigure />
          </Figure>
          <p>
            業務の決まりの検証（価格は0以上の整数、税率の区分は2つのどちらか）も、今の要件なので省きません。外部の入力を確かめる処理やセキュリティの対策も同じです。これらを「まだ問題が起きていないから」と省くと、今の要件を満たさないコードになります。
          </p>
          <h3>判断の目安</h3>
          <p>
            図 56-7 は必要になる確かさを縦軸に、後から足すときの費用を横軸にとって、判断を4つに分けたものです。この章の多通貨の仕組みは、出店の予定がなく、後からでもコードを足せば済むので、左下の「作らない」に入ります。注文した時点の価格と税率は、今の要件で、省くと過去のデータを取り戻せないので、右上の「今決める」に入ります。
          </p>
          <Figure n="56-7" title="当てはめすぎの判断：必要になる確かさと、後から足す費用" caption="模式図。境目は決まっていないので、チームで決める。右下の「変えやすくしておく」は、見込みの機能を作ることではなく、テストを書き、使わない部分を消して、後で足すときの費用を下げること。">
            <JudgeFigure />
          </Figure>
          <p>迷ったときは、次の問いを順に確かめます。</p>
          <ol>
            <li>その機能や抽象化を、今の要件のどこが使っているか。使う箇所を、コードとデータで示せるか</li>
            <li>必要になる時期は決まっているか。決まっているなら、その日に間に合うのはいつ作り始めたときか</li>
            <li>後で足すときに行う変更を具体的に想像すると、今作るより大きく高くつくか</li>
            <li>省こうとしているのは、見込みの機能か、それとも今の要件（事実の記録・検証・テスト）か</li>
            <li>今作ると、今の要件の変更のたびに直す箇所が増えないか</li>
          </ol>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能・規約と YAGNI',
      body: (
        <>
          <h3>Rails の標準機能で今の要件を満たす</h3>
          <p>直した後のコードは Rails の標準機能だけで今の要件を満たしています。自分で仕組みを作る前に、標準機能で足りないかを確かめます。</p>
          <ul>
            <li>
              number_to_currency：金額を3桁ごとに区切り、単位を付けて表示します。API のドキュメントは、このメソッドが通貨の換算を行わないことも明記しています<Ref n={6} />。円だけを表示するなら、Money のような値のクラスを作らずに、表示の形だけをここで決められます。
            </li>
            <li>
              enum と validate: true：税率の区分のように、取る値が決まっている列を表します。知らない値はバリデーションで誤りになります<Ref n={9} />。enum の基本は<ChapterLink n={11} section="attribute-api" />で扱っています。
            </li>
            <li>integer の列：円の金額は1円未満を持たないので、整数の列で表せます。decimal の列と小数の桁のテーブルは、円以外の通貨を扱うときに要るものでした。</li>
          </ul>
          <Callout kind="v72">
            <p>
              enum の validate オプションは Rails 7.1 で追加されたので<Ref n={10} />、Rails 7.2 でも同じように書けます。number_to_currency・integer の列・マイグレーションの書き方は、この章の範囲では Rails 7.2 と違いはありません。
            </p>
          </Callout>
          <h3>使うフレームワークだけを読み込む</h3>
          <p>
            Rails 自体も使わない部分を読み込まない書き方を用意しています。rails new に --skip-active-storage などのオプションを渡すと、生成される config/application.rb は require "rails/all" ではなく、使うフレームワークの railtie だけを require し、使わないものはコメントにした形になります<Ref n={8} />。この章の検証用アプリもこの形で作っています。
          </p>
          <Code
            lang="ruby"
            title="config/application.rb（検証用アプリ。冒頭の部分）"
            code={`
require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
# require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
# require "action_mailbox/engine"
# require "action_text/engine"
require "action_view/railtie"
# require "action_cable/engine"
# require "rails/test_unit/railtie"
`}
          />
          <p>ファイルの添付（Active Storage）やメールの受信（Action Mailbox）が必要になったら、その行のコメントを外し、必要なテーブルを作るマイグレーションを足します。使う予定のないフレームワークを最初から読み込んでおく必要はありません。</p>
          <h3>Rails Doctrine と YAGNI</h3>
          <p>
            Rails の設計思想をまとめた Rails Doctrine は、YAGNI という言葉は使っていませんが、Value integrated systems（統合されたシステムを重んじる）の柱で、システムを分散させるのは本当に必要になってからにすべきだと書いています。必要になる前にシステムをサービスやマイクロサービスに分けることを、さらに悪いこととして挙げています<Ref n={3} />。
          </p>
          <p>
            これは、YAGNI をシステムの構成に当てはめた考え方です。将来の利用者の増加やチームの分割に備えてサービスを分けると、サービスの間の通信・障害・バージョンの管理という抱える費用が、今のすべての変更にかかります。この章の多通貨の仕組みは1つのアプリの中の話でしたが、判断の仕方は同じです。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={57} />（KISS）：作ると決めた機能を、どれだけ単純な仕組みで作るかを扱います。
            </li>
            <li>
              <ChapterLink n={67} />（DIP）と<ChapterLink n={93} section="yagni-dip" />：差し替えのための抽象を、いつ作るかの対立を扱います。
            </li>
            <li>
              <ChapterLink n={76} />（AHA）：実例が少ないうちに抽象化しない、という判断を扱います。
            </li>
            <li>
              <ChapterLink n={86} />（Boy Scout Rule）：使っていないコードを消すような小さな改善を、日々の変更に含める方法を扱います。
            </li>
            <li>
              <ChapterLink n={88} />（Single Source of Truth）：商品の価格と、注文の明細に残す価格の関係を扱います。
            </li>
            <li>
              <ChapterLink n={46} section="money" />：金額と通貨を値のクラスで表す方法を扱っています。多通貨が本当に必要になったときに参照します。
            </li>
            <li>
              <ChapterLink n={27} section="live-change" />：動いているアプリから列やテーブルを消す手順を扱っています。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          YAGNI が先送りするのは、将来の可能性だけを理由に足す機能・引数・列です。この章では3年間使われなかった多通貨の仕組みを消してから軽減税率を足しました。一方で、注文した時点の価格と税率の記録や、日付の決まった税率の変更は今の要件なので、先送りしません。
        </>
      ),
      benefit: {
        text: <>同じ軽減税率の変更で変えるファイルが、多通貨に備えた設計の8つ（うち3つは売ったことのない国のため）から、マイグレーション・Product・そのテストの3つになった。円の計算が Money・Currency・ExchangeRate を通らなくなり、テストで通貨のマスターデータを作る必要もなくなった。</>,
        basis: <ChapterLink n={58} section="apply" />,
      },
      cost: {
        text: <>海外への出店が決まったら、price_currency の列と、金額と通貨を組にした値のクラスを、そのときに足す作業が残る。価格と税率を明細に残さないところまで省くと、商品の価格を直しただけで1か月前の注文の金額が 4,356円から 4,708円に変わった。</>,
        basis: <ChapterLink n={58} section="overuse" />,
      },
      alternative: {
        text: <>今は円だけを扱い、多通貨が必要になったら price_currency を既定値 "JPY" で足して値のクラスを入れる。注文した時点の価格と税率は明細の列に写して残し、日付の決まった税率の変更はその日に間に合うように作る。</>,
        basis: <ChapterLink n={58} section="apply" />,
      },
      criterion: {
        text: <>その仕組みを今の要件のどこが使っているかをコードとデータで示せるか（この章では country: と currency: を渡す呼び出しが app の中に1つもなかった）。必要になる日が決まっているか。省くと後から取り戻せない記録か。</>,
        basis: <ChapterLink n={58} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>YAGNI は、現時点で必要のない機能は実装せず、将来の可能性だけを理由に複雑性を増やさないという判断の基準です。対象には利用者に見える機能だけでなく、将来に備えた拡張点・引数・列も含みます。</li>
          <li>円しか扱わないサイトに作った多通貨と国ごとの税の仕組みは、3年間で一度も使われず、軽減税率を足すときに8つのファイルのうち3つを、売ったことのない国のために直す必要がありました。</li>
          <li>YAGNI はエクストリーム・プログラミングの言葉で、Ron Jeffries は「必要になると予想したときではなく、実際に必要になったときに実装する」と書いています。Fowler は、まだ使われない機能に、作る・遅れる・抱える・直すの4つの費用がかかると整理しました。</li>
          <li>消すときは、使われ方をデータとコードで確かめ、今の挙動をテストで確かめてから、呼び出し側を変え、最後にクラスとテーブルを消します。消した後は、同じ軽減税率の変更が3つのファイルで済みました。</li>
          <li>リファクタリング・自動テスト・継続的な配布は、変更を容易にする作業で、YAGNI の対象ではありません。YAGNI は、変更しやすいコードとテストがあることを前提にしています。</li>
          <li>注文した時点の価格と税率のように、後から取り戻せない事実の記録は、見込みの機能ではなく今の要件です。日付の決まった税率の変更も、見込みではなく期限のある要件として、その日に間に合うように作ります。</li>
          <li>Rails の標準機能（number_to_currency・enum・使うフレームワークだけの読み込み）で今の要件を満たし、分散やサービスの分割は本当に必要になってからにするという Rails Doctrine の考え方も、YAGNI と一致します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Yagni', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/Yagni.html', accessed: '2026-11-21', version: '2015年5月26日', note: 'YAGNI が XP の言葉で Simple Design を指すこと、C3 プロジェクトでの Kent Beck と Chet Hendrickson の会話が由来であること、見込みの機能（presumptive feature）の定義と3つの場合・4つの費用、Kohavi らの分析（改善したのは3分の1）、後のリファクタリングを想像する方法、リファクタリング・自動テスト・継続的な配布は対象にならないこと、複雑さを増やさない作業には当てはまらないこと。' },
    { title: "You're NOT gonna need it!", publisher: 'ronjeffries.com / Ron Jeffries', url: 'https://ronjeffries.com/xprog/articles/practices/pracnotneed/', accessed: '2026-11-21', version: '1998年4月4日', note: '実際に必要になったときに実装し、予想しただけのときには実装しないこと。その3つの理由と、実装を減らすことが速く作りバグを減らす方法であること。' },
    { title: 'The Rails Doctrine', publisher: 'Ruby on Rails / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: 'Value integrated systems の、システムを分散させるのは本当に必要になってからにすべきで、早すぎるサービスやマイクロサービスへの分割はさらに悪いという内容。' },
    { title: '軽減税率制度の概要', publisher: '国税庁', url: 'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/01.htm', accessed: '2026-11-21', note: '令和元年10月1日から、消費税等の税率が標準税率（10%）と軽減税率（8%）の複数税率になったこと。軽減税率の対象が酒類・外食を除く飲食料品などであること。' },
    { title: '消費税の軽減税率制度', publisher: '国税庁', url: 'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/keigenzeiritsu.htm', accessed: '2026-11-21', note: '令和9年4月1日から令和11年3月31日までの2年間、飲食料品の譲渡について消費税率が引き下げられるという案内。引下げ後の税率は本書では扱っていない。' },
    { title: 'ActiveSupport::NumberHelper#number_to_currency', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveSupport/NumberHelper.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'unit・format・precision などのオプションと、通貨の換算を行わないこと。' },
    { title: 'Active Record Migrations（Reversible Commands）', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_migrations.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'drop_table は、テーブルを作るときのオプションとブロックを渡した場合に change の中で戻せること。' },
    { title: 'railties/lib/rails/generators/app_base.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v8.1.4.1/railties/lib/rails/generators/app_base.rb#L305-L339', accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'rails new の skip のオプションに応じて、使わない railtie の require をコメントにし、すべて使うときは require "rails/all" にすること。' },
    { title: 'ActiveRecord::Enum', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Enum.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'validate オプションを付けると、知らない値をバリデーションで誤りにすること。' },
    { title: 'Ruby on Rails 7.1 Release Notes', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/7_1_release_notes.html', accessed: '2026-11-21', version: 'Rails 7.1', note: 'Active Record の Notable changes に「Add validation option for enum.」があること。' },
  ],
}

export default chapter
