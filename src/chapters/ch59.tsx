import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 40-1 場面の構成：税込み金額を計算する4か所 ---------- */
const sceneRows: { place: string[]; out: string[]; diff: string; ok?: boolean }[] = [
  { place: ['Product#price_with_tax', 'app/models/product.rb', '税率 8・10、整数の割り算で切り捨て'], out: ['カート・決済', '1,238円'], diff: '請求した金額', ok: true },
  { place: ['ProductsHelper#price_label', 'app/helpers/products_helper.rb', '税率 0.08・0.1、Float を四捨五入'], out: ['商品ページ', '268円・438円'], diff: '1個につき +1円' },
  { place: ['confirmation.text.erb', 'app/views/order_mailer/', '税率 1.08・1.1、単価を四捨五入して×数量'], out: ['確認メール', '1,242円'], diff: '+4円' },
  { place: ['SalesCsv#to_s', 'app/models/sales_csv.rb', '税率 BigDecimal、単価×数量の後に切り捨て'], out: ['経理の CSV', '1,240円'], diff: '+2円' },
]

function SceneFigure() {
  return (
    <Svg
      id="40-1"
      w={780}
      h={440}
      label={`products・orders・order_items のテーブルには税抜きの単価、税区分、数量だけが入っている。税込みの金額は4か所でそれぞれ計算している。${sceneRows
        .map((r) => `${r.place[0]}（${r.place[1]}）は${r.place[2]}で、${r.out[0]}に ${r.out[1]} を出す（${r.diff}）`)
        .join('。')}。税率の書き方が4通り、丸め方が3通りある`}
    >
      <Box x={10} y={40} w={150} h={330} lines={['products', 'price（税抜き）', 'tax_category', '', 'orders', '', 'order_items', 'quantity']} fs={12} fill="box4" mono />
      <T x={10} y={20} fs={12} bold>
        テーブル
      </T>
      <T x={200} y={20} fs={12} bold>
        税込みの金額を計算する場所
      </T>
      <T x={562} y={20} fs={12} bold>
        出力
      </T>
      {sceneRows.map((r, i) => {
        const y = 40 + i * 86
        return (
          <g key={r.place[0]}>
            <Arrow x1={160} y1={y + 36} x2={198} y2={y + 36} dashed />
            <Box x={200} y={y} w={290} h={72} lines={r.place} fs={12} bold subTone="muted" mono={false} accent={r.ok} />
            <Arrow x1={490} y1={y + 36} x2={560} y2={y + 36} />
            <Box x={562} y={y + 10} w={120} h={52} lines={r.out} fs={12} fill="box4" subTone={r.ok ? 'acc' : 'danger'} />
            <T x={690} y={y + 36} fs={11} tone={r.ok ? 'acc' : 'danger'}>
              {r.diff}
            </T>
          </g>
        )
      })}
      <T x={10} y={398} fs={12} tone="danger">
        税率の書き方が4通り（8・0.08・1.08・BigDecimal("0.08")）、
      </T>
      <T x={10} y={418} fs={12} tone="danger">
        丸め方が3通り（単価の切り捨て・単価の四捨五入・明細の切り捨て）
      </T>
    </Svg>
  )
}

/* ---------- 図 40-2 同じ注文から3通りの合計が出る計算 ---------- */
const calcRows: { head: string[]; bread: string[]; soap: string[]; total: string; diff: string; base?: boolean }[] = [
  { head: ['カート・決済', 'Order#total'], bread: ['248 × 1.08 = 267.84 → 267', '267 × 3 = 801'], soap: ['398 × 1.1 = 437.8', '→ 437（切り捨て）'], total: '1,238円', diff: '基準', base: true },
  { head: ['確認メール', 'テンプレート'], bread: ['267.84 → 268（四捨五入）', '268 × 3 = 804'], soap: ['437.8 → 438', '（四捨五入）'], total: '1,242円', diff: '+4円' },
  { head: ['経理の CSV', 'SalesCsv'], bread: ['248 × 3 × 1.08 = 803.52', '→ 803（切り捨て）'], soap: ['398 × 1 × 1.1 = 437.8', '→ 437（切り捨て）'], total: '1,240円', diff: '+2円' },
  { head: ['商品ページ', '1個の表示'], bread: ['267.84 → 268', '（四捨五入）'], soap: ['437.8 → 438', '（四捨五入）'], total: '−', diff: '1個 +1円' },
]

function CalcFigure() {
  const cols = [
    { x: 10, w: 120, head: '場所' },
    { x: 130, w: 220, head: '食パン 248円 × 3（8%）' },
    { x: 350, w: 190, head: '洗剤 398円 × 1（10%）' },
    { x: 540, w: 110, head: '合計' },
    { x: 650, w: 120, head: '決済との差' },
  ]
  const rowH = 58
  return (
    <Svg
      id="40-2"
      w={780}
      h={34 + calcRows.length * rowH + 30}
      label={`税抜き248円の食パン（軽減税率8%）を3個と、税抜き398円の洗剤（標準税率10%）を1個買った注文の税込み金額。${calcRows
        .map((r) => `${r.head[0]}：食パンは ${r.bread.join(' ')}、洗剤は ${r.soap.join(' ')}、合計 ${r.total}、決済との差は${r.diff}`)
        .join('。')}`}
    >
      {cols.map((c) => (
        <Box key={c.head} x={c.x} y={10} w={c.w} h={30} lines={c.head} fs={12} fill="box5" bold rx={0} />
      ))}
      {calcRows.map((r, i) => {
        const y = 40 + i * rowH
        const tone = r.base ? 'acc' : 'danger'
        return (
          <g key={r.head[0]}>
            <Box x={cols[0].x} y={y} w={cols[0].w} h={rowH} lines={r.head} fs={12} fill="box" bold rx={0} subTone="muted" />
            <Box x={cols[1].x} y={y} w={cols[1].w} h={rowH} lines={r.bread} fs={12} fill="bg" rx={0} align="start" subTone={r.base ? undefined : 'danger'} />
            <Box x={cols[2].x} y={y} w={cols[2].w} h={rowH} lines={r.soap} fs={12} fill="bg" rx={0} align="start" subTone={r.base || i === 2 ? undefined : 'danger'} />
            <Box x={cols[3].x} y={y} w={cols[3].w} h={rowH} fill="bg" rx={0} />
            <T x={cols[3].x + cols[3].w / 2} y={y + rowH / 2} anchor="middle" fs={13} bold tone={r.total === '−' ? 'muted' : tone}>
              {r.total}
            </T>
            <Box x={cols[4].x} y={y} w={cols[4].w} h={rowH} fill="bg" rx={0} />
            <T x={cols[4].x + cols[4].w / 2} y={y + rowH / 2} anchor="middle" fs={12} tone={tone}>
              {r.diff}
            </T>
          </g>
        )
      })}
      <T x={10} y={34 + calcRows.length * rowH + 20} fs={11} tone="muted">
        赤い文字は、決済（Order#total）と違う結果になった計算
      </T>
    </Svg>
  )
}

/* ---------- 図 40-3 知識の重複とコードの見た目の重複 ---------- */
function QuadrantFigure() {
  const quads: { x: number; y: number; lines: string[]; fill: 'box5' | 'box' | 'bg'; accent?: boolean; dashed?: boolean }[] = [
    { x: 90, y: 30, lines: ['同じ知識・違うコード', 'まとめる（見つけにくい重複）', '例：8・0.08・1.08・BigDecimal("0.08")', 'どれも軽減税率の8%'], fill: 'box5', accent: true },
    { x: 430, y: 30, lines: ['同じ知識・似たコード', 'まとめる（DRY の対象）', '例：商品ページとメールの', '(price * 1.1).round'], fill: 'box5' },
    { x: 90, y: 210, lines: ['違う知識・違うコード', '関係がない'], fill: 'bg', dashed: true },
    { x: 430, y: 210, lines: ['違う知識・似たコード', 'まとめない（偶然の一致）', '例：年齢と数量の検証（書籍の例）', '税込みの単価と請求書の税額の切り捨て'], fill: 'box' },
  ]
  return (
    <Svg
      id="40-3"
      w={780}
      h={420}
      label="縦軸は知識が同じか違うか、横軸はコードの見た目が似ているかどうか。同じ知識で違うコードは、8・0.08・1.08・BigDecimal のように書き方が違う同じ税率で、見つけにくいがまとめる対象。同じ知識で似たコードは、商品ページとメールの (price * 1.1).round のような重複で、DRY の対象。違う知識で似たコードは、年齢と数量の検証や、税込みの単価と請求書の税額の切り捨てのような偶然の一致で、まとめない。違う知識で違うコードは関係がない"
    >
      {quads.map((q) => (
        <Box key={q.lines[0]} x={q.x} y={q.y} w={330} h={160} lines={q.lines} fs={12} fill={q.fill} bold accent={q.accent} dashed={q.dashed} subTone="muted" />
      ))}
      <T x={45} y={100} anchor="middle" fs={12} bold>
        知識が
      </T>
      <T x={45} y={118} anchor="middle" fs={12} bold>
        同じ
      </T>
      <T x={45} y={280} anchor="middle" fs={12} bold>
        知識が
      </T>
      <T x={45} y={298} anchor="middle" fs={12} bold>
        違う
      </T>
      <Arrow x1={90} y1={392} x2={760} y2={392} />
      <T x={255} y={408} anchor="middle" fs={12} bold>
        コードが似ていない
      </T>
      <T x={595} y={408} anchor="middle" fs={12} bold>
        コードが似ている
      </T>
    </Svg>
  )
}

/* ---------- 図 40-4 直す前と後 ---------- */
function BeforeAfterFigure() {
  const before = [
    ['Product#price_with_tax', '8・10、切り捨て'],
    ['ProductsHelper#price_label', '0.08・0.1、四捨五入'],
    ['confirmation.text.erb', '1.08・1.1、四捨五入'],
    ['SalesCsv#to_s', 'BigDecimal、明細で切り捨て'],
  ]
  const outs = ['決済 1,238円', '商品 268円', 'メール 1,242円', 'CSV 1,240円']
  const users = [
    { x: 400, label: ['商品ページ', 'price_label'] },
    { x: 494, label: ['確認メール', 'テンプレート'] },
    { x: 588, label: ['経理の CSV', 'SalesCsv'] },
    { x: 682, label: ['カート', '・決済'] },
  ]
  return (
    <Svg
      id="40-4"
      w={780}
      h={400}
      label="直す前は、Product#price_with_tax、ProductsHelper#price_label、確認メールのテンプレート、SalesCsv#to_s の4か所がそれぞれ税率と丸め方を持ち、決済 1,238円、商品ページ 268円、メール 1,242円、CSV 1,240円と違う金額を出していた。直した後は、税率と端数の規則を Tax モジュールだけが持つ。Product#price_with_tax は Tax.included_price を呼び、OrderItem#subtotal は price_with_tax に数量を掛け、Order#total は subtotal を足す。商品ページ・確認メール・経理の CSV・カートと決済は、この3つのメソッドを呼ぶ。金額の書式は config/locales/ja.yml の number.currency.format にあり、商品ページと確認メールが number_to_currency で使う。どこから呼んでも 1,238円になる"
    >
      <T x={10} y={18} bold>
        直す前
      </T>
      {before.map((b, i) => {
        const y = 40 + i * 80
        return (
          <g key={b[0]}>
            <Box x={10} y={y} w={230} h={52} lines={b} fs={12} subTone="danger" />
            <Arrow x1={240} y1={y + 26} x2={262} y2={y + 26} />
            <Box x={264} y={y + 8} w={106} h={36} lines={outs[i]} fs={11} fill="box4" />
          </g>
        )
      })}
      <T x={10} y={372} fs={12} tone="danger">
        4か所がそれぞれ税率と丸め方を持つ
      </T>

      <line x1={385} y1={10} x2={385} y2={390} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={400} y={18} bold>
        直した後
      </T>
      <rect x={400} y={34} width={190} height={190} rx={6} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <Box x={410} y={44} w={170} h={44} lines={['Product', '#price_with_tax']} fs={12} mono />
      <Box x={410} y={110} w={170} h={44} lines={['OrderItem', '#subtotal（× 数量）']} fs={12} mono />
      <Box x={410} y={170} w={170} h={44} lines={['Order', '#total（明細の和）']} fs={12} mono />
      <Arrow x1={495} y1={110} x2={495} y2={90} />
      <Arrow x1={495} y1={170} x2={495} y2={156} />
      <Box x={610} y={40} w={160} h={70} lines={['Tax', 'RATES', 'included_price']} fs={12} fill="box5" bold accent mono />
      <Arrow x1={580} y1={66} x2={608} y2={66} />
      <T x={690} y={124} anchor="middle" fs={11} tone="acc">
        税率と端数の規則はここだけ
      </T>
      {users.map((u) => (
        <Box key={u.label[0]} x={u.x} y={270} w={88} h={44} lines={u.label} fs={11} fill="box4" subTone="muted" />
      ))}
      <Arrow x1={444} y1={270} x2={444} y2={226} />
      <Arrow x1={538} y1={270} x2={538} y2={226} />
      <Arrow d="M632,270 L632,246 L570,246 L570,226" />
      <Arrow d="M726,270 L726,236 L584,236 L584,226" />
      <Box x={400} y={340} w={182} h={44} lines={['config/locales/ja.yml', 'number.currency.format']} fs={11} fill="box2" dashed />
      <Arrow x1={444} y1={314} x2={444} y2={338} dashed />
      <Arrow x1={538} y1={314} x2={538} y2={338} dashed />
      <T x={600} y={350} fs={12} tone="acc">
        どこから呼んでも 1,238円
      </T>
      <T x={600} y={372} fs={11} tone="muted">
        破線の矢印は書式の参照
      </T>
    </Svg>
  )
}

/* ---------- 図 40-5 規則を変えるときに直すファイル ---------- */
const changeRows: { what: string[]; before: string[]; after: string[]; count: string }[] = [
  { what: ['飲食料品の税率を変える'], before: ['●', '●', '●×2', '●'], after: ['●', ''], count: '4 → 1' },
  { what: ['端数を四捨五入に変える'], before: ['●', '●', '●×2', '●'], after: ['●', ''], count: '4 → 1' },
  { what: ['金額の書式を変える', '（例：¥1,238）'], before: ['', '●', '●×2', ''], after: ['', '●'], count: '2 → 1' },
]

function ChangeFigure() {
  const files = [
    { x: 170, w: 95, name: ['product.rb'] },
    { x: 265, w: 95, name: ['products_', 'helper.rb'] },
    { x: 360, w: 105, name: ['confirmation', '.text.erb'] },
    { x: 465, w: 95, name: ['sales_csv.rb'] },
    { x: 575, w: 80, name: ['tax.rb'] },
    { x: 655, w: 80, name: ['ja.yml'] },
  ]
  const rowH = 46
  const top = 80
  return (
    <Svg
      id="40-5"
      w={780}
      h={top + changeRows.length * rowH + 40}
      label={`規則を変えるときに直すファイルの数。${changeRows
        .map((r) => `${r.what.join('')}は、直す前は ${r.before.filter(Boolean).length} ファイル、直した後は ${r.after.filter(Boolean).length} ファイル`)
        .join('。')}。直す前のファイルは product.rb・products_helper.rb・confirmation.text.erb・sales_csv.rb、直した後のファイルは tax.rb と ja.yml`}
    >
      <Box x={170} y={10} w={390} h={28} lines="直す前" fs={12} fill="box" bold rx={0} />
      <Box x={575} y={10} w={160} h={28} lines="直した後" fs={12} fill="box5" bold rx={0} />
      <Box x={10} y={38} w={160} h={42} lines="変更の内容" fs={12} fill="box" bold rx={0} />
      {files.map((f) => (
        <Box key={f.name.join('')} x={f.x} y={38} w={f.w} h={42} lines={f.name} fs={11} fill={f.x > 570 ? 'box5' : 'box'} mono rx={0} />
      ))}
      <Box x={735} y={10} w={40} h={70} lines={['数', '']} fs={12} fill="box" bold rx={0} />
      {changeRows.map((r, i) => {
        const y = top + i * rowH
        const marks = [...r.before, ...r.after]
        return (
          <g key={r.what[0]}>
            <Box x={10} y={y} w={160} h={rowH} lines={r.what} fs={12} fill="bg" rx={0} align="start" />
            {files.map((f, j) => (
              <g key={f.name.join('')}>
                <Box x={f.x} y={y} w={f.w} h={rowH} fill="bg" rx={0} />
                <T x={f.x + f.w / 2} y={y + rowH / 2} anchor="middle" fs={13} tone={j < 4 ? 'danger' : 'acc'}>
                  {marks[j] || '−'}
                </T>
              </g>
            ))}
            <Box x={735} y={y} w={40} h={rowH} fill="bg" rx={0} />
            <T x={755} y={y + rowH / 2 - 8} anchor="middle" fs={11} tone="danger">
              {r.count.split(' → ')[0]}
            </T>
            <T x={755} y={y + rowH / 2 + 9} anchor="middle" fs={11} tone="acc">
              {`→${r.count.split(' → ')[1]}`}
            </T>
          </g>
        )
      })}
      <T x={10} y={top + changeRows.length * rowH + 22} fs={11} tone="muted">
        ●×2 は同じファイルの2か所。テストのファイルは数えていない
      </T>
    </Svg>
  )
}

/* ---------- 図 40-6 まとめるかどうかの判断 ---------- */
function DecisionFigure() {
  return (
    <Svg
      id="40-6"
      w={780}
      h={450}
      label="似たコードや同じ値が2か所以上にあるとき。問1：片方を変える理由が生じたとき、もう片方も必ず同じように変えるか。いいえなら別の知識なのでまとめない（偶然の一致）。はいなら問2：その知識に1つの名前を付けられるか。いいえなら、まだまとめずに重複のまま例が増えるのを待つ（WET と AHA の章）。はいなら1か所にまとめて名前を付ける（DRY。例 Tax.included_price）。まとめた後に、呼び出し側ごとのフラグや分岐が増えたら、別の知識が混ざっているので分け直す（Receipt の例）"
    >
      <Box x={40} y={10} w={400} h={36} lines="似たコード・同じ値が2か所以上にある" fs={12} fill="box4" />
      <Arrow x1={240} y1={46} x2={240} y2={72} />
      <Box x={40} y={74} w={400} h={56} lines={['問1：片方を変える理由が生じたとき、', 'もう片方も必ず同じように変えるか']} fs={12} bold />
      <Arrow x1={440} y1={102} x2={498} y2={102} />
      <T x={469} y={90} anchor="middle" fs={11}>
        いいえ
      </T>
      <Box x={500} y={74} w={270} h={56} lines={['別の知識。まとめない', '（偶然の一致）']} fs={12} fill="bg" subTone="muted" />
      <Arrow x1={240} y1={130} x2={240} y2={172} />
      <T x={250} y={151} fs={11}>
        はい
      </T>
      <Box x={40} y={174} w={400} h={56} lines={['問2：その知識に1つの名前を付けられるか', '（例：税込みの単価、明細の金額）']} fs={12} bold subTone="muted" />
      <Arrow x1={440} y1={202} x2={498} y2={202} />
      <T x={469} y={190} anchor="middle" fs={11}>
        いいえ
      </T>
      <Box x={500} y={174} w={270} h={56} lines={['まだまとめない。重複のまま', '例が増えるのを待つ（WET・AHA）']} fs={12} fill="bg" subTone="muted" />
      <Arrow x1={240} y1={230} x2={240} y2={272} />
      <T x={250} y={251} fs={11}>
        はい
      </T>
      <Box x={40} y={274} w={400} h={56} lines={['1か所にまとめて名前を付ける（DRY）', '例：Tax.included_price']} fs={12} fill="box5" bold accent subTone="muted" />
      <Arrow x1={240} y1={330} x2={240} y2={372} />
      <T x={250} y={351} fs={11}>
        まとめた後も見直す
      </T>
      <Box x={40} y={374} w={400} h={56} lines={['問3：呼び出し側ごとのフラグや', '分岐が増えていないか']} fs={12} bold />
      <Arrow x1={440} y1={402} x2={498} y2={402} />
      <T x={469} y={390} anchor="middle" fs={11}>
        増えた
      </T>
      <Box x={500} y={374} w={270} h={56} lines={['別の知識が混ざっている', '分け直す（Receipt の例）']} fs={12} fill="bg" subTone="danger" />
    </Svg>
  )
}

/* ---------- 図 40-7 Rails の DRY の仕組み ---------- */
const railsRows: [string, string, string][] = [
  ['テーブルの列と型', 'db/schema.rb（モデルに列を書かない）', 'Product.attribute_names'],
  ['列が取りうる値の一覧', 'enum（述語メソッドとスコープを作る）', 'reduced?・Product.reduced'],
  ['業務の計算の規則', 'モデル・モジュール・Value Object', 'Tax・Product#price_with_tax'],
  ['複数のモデルに共通の振る舞い', 'concern（ActiveSupport::Concern）', 'この章では使っていない'],
  ['画面の表示の整形', 'ヘルパー・パーシャル', 'ProductsHelper#price_label'],
  ['数値の書式・文言', 'i18n（config/locales）', 'number.currency.format'],
  ['複数のアクションの前処理', 'before_action', 'set_product（Rails Guides の例）'],
]

function RailsFigure() {
  const cols = [
    { x: 10, w: 210, head: '1か所にしたい知識' },
    { x: 220, w: 300, head: 'Rails の仕組み・置き場所' },
    { x: 520, w: 250, head: 'この章の例' },
  ]
  const rowH = 38
  return (
    <Svg
      id="40-7"
      w={780}
      h={50 + railsRows.length * rowH + 10}
      label={`Rails で知識を1か所にする仕組み。${railsRows.map((r) => `${r[0]}は${r[1]}に置く。この章の例は${r[2]}`).join('。')}`}
    >
      {cols.map((c) => (
        <Box key={c.head} x={c.x} y={10} w={c.w} h={34} lines={c.head} fs={12} fill="box5" bold rx={0} />
      ))}
      {railsRows.map((r, i) => {
        const y = 44 + i * rowH
        return (
          <g key={r[0]}>
            <Box x={cols[0].x} y={y} w={cols[0].w} h={rowH} lines={r[0]} fs={12} fill="box" rx={0} align="start" />
            <Box x={cols[1].x} y={y} w={cols[1].w} h={rowH} lines={r[1]} fs={12} fill="bg" rx={0} align="start" />
            <Box x={cols[2].x} y={y} w={cols[2].w} h={rowH} lines={r[2]} fs={12} fill="bg" rx={0} align="start" mono={i !== 3} />
          </g>
        )
      })}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 59,
  part: 8,
  title: 'DRY：消費税の端数処理を1か所にする',
  summary:
    '税込み価格の計算が商品ページ・カート・確認メール・経理の CSV の4か所に書かれ、同じ注文が3通りの金額になるコードを例に、DRY（Don\'t Repeat Yourself）を扱います。知識の重複とコードの見た目の重複を区別し、税率と端数の規則を1つのモジュールに集めて4か所の金額をそろえます。見た目が同じでも別の知識である計算（適格請求書の消費税額）をまとめすぎた例も動かして確かめます。',
  goals: [
    '同じ知識が複数の場所に書かれると、計算の食い違いと変更の漏れが起きる理由を、実行結果をもとに説明できる',
    'DRY の定義が「知識の重複」を対象にしていることと、コードの見た目の重複との違いを説明できる',
    '食い違いを確かめるテストを先に書き、散らばった計算を1か所に集める手順を実行できる',
    '見た目が同じでも変わる理由が違うコードを見分け、まとめすぎを避けられる',
    'Rails のスキーマ・enum・ヘルパー・i18n・concern が、それぞれどの知識を1か所にする仕組みかを説明できる',
  ],
  prerequisites: [56, 16, 46],
  sections: [
    {
      id: 'scene',
      title: '商品ページ・メール・CSV で税込みの金額が食い違うコード',
      body: (
        <>
          <p>
            この章では税込みの金額の計算を例に DRY を扱います。DRY は「同じ知識を複数の場所に書かない」という原則です。最初に、同じ計算が4か所に書かれた Rails のアプリを動かし、どんな問題が起きるかを確かめます。
          </p>
          <h3>そもそも何を計算するのか</h3>
          <p>
            食品と日用品を売る EC サイトを考えます。商品の価格は税抜きで登録し、利用者に見せる価格と請求する金額は消費税を含めた税込みにします。消費税の税率は2種類あり、日用品は標準税率の 10%、食パンのような飲食料品は軽減税率の 8% です<Ref n={10} />。
          </p>
          <p>
            税込みの価格は「税抜きの価格 ×（1 + 税率）」で求めます。税抜き248円の食パンなら 248 × 1.08 = 267.84 円で、1円未満の端数が出ます。端数を切り捨てるか、四捨五入するかは店が決めます。このサイトでは税込みの単価の1円未満を切り捨てると決めています。食パンは267円、税抜き398円の洗剤は 398 × 1.1 = 437.8 円なので437円です。
          </p>
          <p>税込みの金額は次の4か所で使います。</p>
          <ul>
            <li>商品ページ：1個あたりの税込み価格を表示する</li>
            <li>カートと決済：注文の合計を計算し、その金額で決済する</li>
            <li>注文の確認メール：明細と合計を利用者に送る</li>
            <li>経理の売上 CSV：月末に管理画面からダウンロードし、経理の担当者が会計の処理に使う</li>
          </ul>
          <p>4か所のコードは、別の時期に別の開発者が書きました。</p>
          <h3>テーブルとモデル</h3>
          <p>
            products テーブルには税抜きの単価 <code>price</code> と税区分 <code>tax_category</code>（<code>standard</code> が標準税率、<code>reduced</code> が軽減税率）を保存します。注文は orders、注文の明細は order_items で、明細には数量を保存します。どのテーブルにも税込みの金額は保存していません。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_products.rb"
            code={`
class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.integer :price, null: false # 税抜きの単価（円）
      t.string :tax_category, null: false # standard（標準税率）か reduced（軽減税率）
      t.timestamps
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="db/migrate/20261121000002_create_orders.rb"
            code={`
class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :customer_name, null: false
      t.timestamps
    end

    create_table :order_items do |t|
      t.references :order, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :quantity, null: false
      t.timestamps
    end
  end
end
`}
          />
          <p>
            カートと決済は、モデルの <code>Product#price_with_tax</code> と <code>Order#total</code> で金額を求めます。<code>enum</code> は、列が取りうる値の一覧を宣言する Active Record の機能で、<code>reduced?</code> のような述語メソッドを作ります。
          </p>
          <Code
            lang="ruby"
            title="app/models/product.rb（直す前）"
            code={`
class Product < ApplicationRecord
  enum :tax_category, { standard: "standard", reduced: "reduced" }, validate: true

  # 税込みの単価。1円未満は切り捨てる（カートと決済の金額に使う）
  def price_with_tax
    rate = reduced? ? 8 : 10
    price * (100 + rate) / 100
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/order.rb（直す前）"
            code={`
class Order < ApplicationRecord
  has_many :order_items

  # カートと決済の合計金額（税込み）
  def total
    order_items.sum { |item| item.product.price_with_tax * item.quantity }
  end
end
`}
          />
          <p>
            <code>price * (100 + rate) / 100</code> は整数どうしの割り算なので、Ruby では小数点以下が切り捨てられます。248 × 108 / 100 は 267 です。
          </p>
          <h3>ほかの3か所に書かれた計算</h3>
          <p>
            商品ページの価格はビューの<Term en="helper">ヘルパー</Term>で作ります。ヘルパーはビューから呼ぶ表示用のメソッドを集めたモジュールです（<ChapterLink n={16} section="helpers" />）。このヘルパーは、モデルの <code>price_with_tax</code> ができる前に書かれました。
          </p>
          <Code
            lang="ruby"
            title="app/helpers/products_helper.rb（直す前）"
            code={`
module ProductsHelper
  # 商品ページに表示する税込み価格
  def price_label(product)
    rate = product.tax_category == "reduced" ? 0.08 : 0.1
    "#{number_with_delimiter((product.price * (1 + rate)).round)}円（税込み）"
  end
end
`}
          />
          <p>
            税率を 0.08 と 0.1 の Float（浮動小数点数）で持ち、<code>round</code> で四捨五入しています。<code>number_with_delimiter</code> は数値を3桁ごとにカンマで区切る Rails のヘルパーです。確認メールのテンプレートはこのヘルパーの計算を写して書かれました。
          </p>
          <Code
            lang="erb"
            title="app/views/order_mailer/confirmation.text.erb（直す前）"
            code={`
<%= @order.customer_name %> 様

ご注文ありがとうございます。

<% @order.order_items.each do |item| -%>
<% unit = (item.product.price * (item.product.reduced? ? 1.08 : 1.1)).round -%>
・<%= item.product.name %>　<%= number_with_delimiter(unit) %>円 × <%= item.quantity %>
<% end -%>
合計 <%= number_with_delimiter(@order.order_items.sum { |i| (i.product.price * (i.product.reduced? ? 1.08 : 1.1)).round * i.quantity }) %>円（税込み）
`}
          />
          <p>
            経理の CSV は端数の誤差を避けるために BigDecimal（10進の小数を正確に扱うクラス）を使っています。ただし、単価ではなく「単価 × 数量」に税率を掛けてから切り捨てています。
          </p>
          <Code
            lang="ruby"
            title="app/models/sales_csv.rb（直す前）"
            code={`
require "csv"

# 経理に渡す売上の CSV。月末に管理画面からダウンロードする
class SalesCsv
  TAX_RATES = { "standard" => BigDecimal("0.10"), "reduced" => BigDecimal("0.08") }.freeze

  def initialize(orders)
    @orders = orders
  end

  def to_s
    CSV.generate do |csv|
      csv << %w[注文番号 商品 税率 数量 税込み金額]
      @orders.each do |order|
        order.order_items.each do |item|
          rate = TAX_RATES.fetch(item.product.tax_category)
          amount = (item.product.price * item.quantity * (1 + rate)).floor
          csv << [order.id, item.product.name, "#{(rate * 100).to_i}%", item.quantity, amount]
        end
      end
    end
  end
end
`}
          />
          <p>
            図 40-1 はテーブルと4か所の計算、それぞれの出力の関係です。テーブルには税抜きの単価・税区分・数量しか入っていないので、税込みの金額は読み出すたびに4か所で別々に計算されます。
          </p>
          <Figure n="40-1" title="場面の構成：税込みの金額を計算する4か所" caption="破線の矢印はテーブルの値の参照、実線の矢印は計算した金額の出力。右端は決済の金額との差。">
            <SceneFigure />
          </Figure>
          <h3>同じ注文の金額を4か所で比べる</h3>
          <p>
            食パン（税抜き248円・軽減税率）を3個と、洗剤（税抜き398円・標準税率）を1個買った注文を作り、4か所のコードで税込みの金額を求めるスクリプトを実行しました。商品ページはヘルパーを、メールは送信する本文を、CSV は出力した行を、それぞれ実際に呼んで取り出しています。
          </p>
          <Code
            lang="ruby"
            title="script/compare_amounts.rb"
            code={`
# 同じ注文の税込み金額を、4か所のコードで計算して並べる
order = Order.first
helpers = ApplicationController.helpers

puts "注文 ##{order.id}：#{order.order_items.map { "#{it.product.name}（税抜き#{it.product.price}円）× #{it.quantity}" }.join("、")}"
order.order_items.each do |item|
  puts "  商品ページ  #{item.product.name}: #{helpers.price_label(item.product)}"
end
puts "  カート・決済 合計: #{order.total.to_fs(:delimited)}円（Order#total）"
mail_total = OrderMailer.confirmation(order).body.to_s[/合計 (.+)円/, 1]
puts "  確認メール   合計: #{mail_total}円"
csv_total = CSV.parse(SalesCsv.new([order]).to_s, headers: true).sum { it["税込み金額"].to_i }
puts "  経理の CSV   合計: #{csv_total.to_fs(:delimited)}円（明細の税込み金額の和）"
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/compare_amounts.rb）"
            code={`
注文 #1：食パン（税抜き248円）× 3、洗剤（税抜き398円）× 1
  商品ページ  食パン: 268円（税込み）
  商品ページ  洗剤: 438円（税込み）
  カート・決済 合計: 1,238円（Order#total）
  確認メール   合計: 1,242円
  経理の CSV   合計: 1,240円（明細の税込み金額の和）
`}
          />
          <p>
            同じ注文なのに、決済は1,238円、確認メールは1,242円、経理の CSV は1,240円です。利用者は1,238円を支払ったのに、メールには1,242円と書かれています。経理の CSV の合計は決済サービスから入金された金額と2円合いません。商品ページで268円と表示された食パンは、カートに入れると267円になります。図 40-2 は、3通りの合計がどの計算から生まれたかを並べたものです。
          </p>
          <Figure n="40-2" title="同じ注文から3通りの合計が出る計算" caption="決済（1行目）を基準に、違う結果になった計算を赤で示した。">
            <CalcFigure />
          </Figure>
          <p>
            違いは2つの点から生まれています。1つは丸め方で、決済は切り捨て、メールと商品ページは四捨五入です。もう1つは丸める段階で、決済は単価を丸めてから数量を掛け、CSV は数量を掛けてから丸めます。食パン3個では単価で丸めると 267 × 3 = 801円、数量を掛けてから丸めると 803.52 を切り捨てて803円です。
          </p>
          <h3>それぞれのテストはすべて通る</h3>
          <p>4か所には、それぞれのテストがあります。たとえば確認メールのテストは、メールの本文に合計が載ることを確かめています。</p>
          <Code
            lang="ruby"
            title="spec/mailers/order_mailer_spec.rb（直す前）"
            code={`
require "rails_helper"

RSpec.describe OrderMailer, type: :mailer do
  it "確認メールに合計を載せる" do
    bread = Product.create!(name: "食パン", price: 248, tax_category: "reduced")
    detergent = Product.create!(name: "洗剤", price: 398, tax_category: "standard")
    order = Order.create!(customer_name: "山田")
    order.order_items.create!(product: bread, quantity: 3)
    order.order_items.create!(product: detergent, quantity: 1)

    expect(OrderMailer.confirmation(order).body.to_s).to include("合計 1,242円（税込み）")
  end
end
`}
          />
          <p>
            期待値の1,242円は、テストを書いた人がメールのコードと同じ計算で求めた値です。モデル・ヘルパー・CSV のテストも同じように、それぞれのコードの計算で期待値を決めています。4つのファイルのテストを実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models spec/helpers spec/mailers）"
            code={`
......

Finished in 0.09665 seconds (files took 0.90855 seconds to load)
6 examples, 0 failures
`}
          />
          <p>
            6つの例はすべて通りました。どのテストも自分の場所の計算だけを確かめているので、4か所の結果が互いに違っていても失敗しません。そこで、4か所の結果を決済の金額と比べるテストを足しました。商品ページは税抜き1〜1000円の価格を2つの税率で試します。
          </p>
          <Code
            lang="ruby"
            title="spec/consistency_spec.rb"
            code={`
require "rails_helper"

# 4か所で計算した税込みの金額が、決済に使う金額（Product#price_with_tax と Order#total）と一致するか
RSpec.describe "税込みの金額の一致" do
  let(:order) do
    bread = Product.create!(name: "食パン", price: 248, tax_category: "reduced")
    detergent = Product.create!(name: "洗剤", price: 398, tax_category: "standard")
    Order.create!(customer_name: "山田").tap do |o|
      o.order_items.create!(product: bread, quantity: 3)
      o.order_items.create!(product: detergent, quantity: 1)
    end
  end

  it "商品ページの価格は、カートの単価と同じ（税抜き1〜1000円・2つの税率）" do
    products = (1..1000).flat_map { |price| %w[standard reduced].map { Product.new(price:, tax_category: it) } }
    mismatches = products.reject do |p|
      ApplicationController.helpers.price_label(p) == "#{p.price_with_tax.to_fs(:delimited)}円（税込み）"
    end
    # …（失敗したときに表示する例を作る。省略）
    expect(mismatches).to be_empty, "2000件のうち #{mismatches.size}件が食い違う（#{examples.join("、")}）"
  end

  it "確認メールの合計は、決済の金額と同じ" do
    expect(OrderMailer.confirmation(order).body.to_s).to include("合計 #{order.total.to_fs(:delimited)}円（税込み）")
  end

  it "経理の CSV の合計は、決済の金額と同じ" do
    rows = CSV.parse(SalesCsv.new([order]).to_s, headers: true)
    expect(rows.sum { it["税込み金額"].to_i }).to eq order.total
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/consistency_spec.rb。失敗の行を抜き出した）"
            code={`
  1) 税込みの金額の一致 商品ページの価格は、カートの単価と同じ（税抜き1〜1000円・2つの税率）
       2000件のうち 980件が食い違う（5円・standard: 商品ページ 6円（税込み） / カート 5円、6円・standard: 商品ページ 7円（税込み） / カート 6円）

  2) 税込みの金額の一致 確認メールの合計は、決済の金額と同じ
       expected "山田 様\\n\\nご注文ありがとうございます。\\n\\n・食パン　268円 × 3\\n・洗剤　438円 × 1\\n合計 1,242円（税込み）\\n\\n" to include "合計 1,238円（税込み）"

  3) 税込みの金額の一致 経理の CSV の合計は、決済の金額と同じ
       expected: 1238
            got: 1240

3 examples, 3 failures
`}
          />
          <p>
            3つとも失敗しました。商品ページの価格は2000通りのうち980通りでカートの単価と1円違います。標準税率では税抜きの価格の1の位が5〜9のとき、軽減税率では端数が0.5以上になるときに、四捨五入と切り捨ての結果が分かれます。
          </p>
          <h3>税率を変えるときに直す場所</h3>
          <p>
            令和8年9月の閣議決定の大綱で、令和9年4月1日から2年間、飲食料品の消費税率を1%に引き下げる改正案が示されています（法案が成立した場合）<Ref n={11} />。経理から、税率が変わったときにシステムで直す場所を洗い出してほしいと頼まれました。まず軽減税率の 0.08 を grep で探しました。
          </p>
          <Code
            lang="text"
            title="実行結果（grep -rn &quot;0\.08&quot; app）"
            code={`
app/helpers/products_helper.rb:4:    rate = product.tax_category == "reduced" ? 0.08 : 0.1
app/models/sales_csv.rb:5:  TAX_RATES = { "standard" => BigDecimal("0.10"), "reduced" => BigDecimal("0.08") }.freeze
`}
          />
          <p>
            見つかったのは2か所だけです。モデルは <code>8</code>、メールのテンプレートは <code>1.08</code> と書いているので、この検索では見つかりません。同じ「軽減税率は8%」という事実が、<code>8</code>・<code>0.08</code>・<code>1.08</code>・<code>BigDecimal("0.08")</code> の4通りで書かれています。丸め方も同じで、<code>round</code>・<code>floor</code>・整数の割り算の3通りを探さないと全部は見つかりません。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>同じ注文の金額が決済・メール・CSV で3通りになります。利用者からの問い合わせと、経理の照合の手間が生まれます。</li>
            <li>税率と丸め方が4か所に書かれていて、書き方も揃っていません。税率や端数の規則を変えるときに、直す場所を検索で漏れなく見つけられません。</li>
            <li>どの計算が正しいのかがコードから読み取れません。「税込みの単価は切り捨て」という店の決定は、4か所のうち1か所にしか反映されていません。</li>
            <li>それぞれのテストは自分の場所の計算で期待値を決めているので、食い違いを見つけられません。</li>
          </ul>
          <p>
            これらの問題は、「税率はいくつか」「端数をどう丸めるか」「明細と合計をどう求めるか」という同じ知識が、4か所に別々に書かれていることから起きています。次の節で、この状態を避けるための DRY という原則を説明します。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'DRY の意味と由来：知識の表現を1つにする',
      body: (
        <>
          <h3>『The Pragmatic Programmer』の定義</h3>
          <p>
            <Term en="Don't Repeat Yourself">DRY</Term> は、Andy Hunt と Dave Thomas が1999年の書籍『The Pragmatic Programmer』で名付けた原則です<Ref n={1} />。同書の第2版（20周年記念版、2019年）は、DRY を次の1文で定義しています<Ref n={2} />。
          </p>
          <blockquote>
            <p>Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.</p>
          </blockquote>
          <p>
            訳すと「システムの中のどの知識も、ただ1つの、曖昧さのない、正式な表現を持たなければならない」です。同書は続けて、同じことを2か所以上に書くと、1か所を変えたときにほかの場所も変えることを覚えておく必要があり、「覚えているかどうかではなく、いつ忘れるかの問題だ」と書いています<Ref n={2} />。前の節の税率は4か所のうち2か所しか grep で見つからなかったので、この状況に当たります。
          </p>
          <p>本書では DRY を次のように扱います。</p>
          <ul>
            <li>同じ知識やビジネスルールを、複数の場所に持たせない。</li>
            <li>単なるコードの類似ではなく、知識の重複をなくす。</li>
          </ul>
          <h3>コードの重複ではなく、知識の重複</h3>
          <p>
            DRY は「同じ行をコピーしない」という意味に受け取られることが多い原則です。Dave Thomas は2003年のインタビューで、DRY は本の中で最も誤解されている部分の1つであり、多くの人はコードを重複させないことだと受け取るが、それは意図ではないと述べています<Ref n={3} />。同じインタビューでは、システムの知識はコードより広く、DB のスキーマ、テストの計画、ビルドの仕組み、ドキュメントも含むと説明しています。
          </p>
          <p>
            20周年記念版では、初版での説明が不十分だったと書いたうえで、DRY は知識と意図の重複についての原則であり、同じことを2つの場所で、ときにはまったく違う書き方で表すことを問題にしていると説明しています。確かめ方として、「1つの事柄を変えるときに、複数の場所を、複数の違う書き方で変えることになるか」を挙げています<Ref n={2} />。前の節の税率がまさにこれで、同じ8%が4通りの書き方で4か所にありました。
          </p>
          <p>
            反対に、コードが同じでも知識が違えば重複ではありません。同書はワインの注文サイトで「年齢」と「注文の数量」を検証する2つの関数の例を挙げています。どちらも「整数で、0以上」を確かめるので中身は同じですが、2つは別々の事柄を検証していて、規則がたまたま同じなだけです。同書はこれを「重複ではなく偶然の一致」と呼んでいます<Ref n={2} />。年齢の規則が「20歳以上」に変わっても、数量の規則は変わりません。
          </p>
          <p>図 40-3 は、知識が同じかどうかと、コードの見た目が似ているかどうかの2つの軸で、重複を4つに分けたものです。</p>
          <Figure n="40-3" title="知識の重複とコードの見た目の重複" caption="DRY の対象は上の段（知識が同じ）。左上はコードが似ていないので検索では見つけにくい。右下はコードが似ていても、まとめない。">
            <QuadrantFigure />
          </Figure>
          <p>
            図 40-3 で DRY がまとめる対象にするのは上の段の2つです。左上の「同じ知識・違うコード」は、見た目が違うので検索やコードの比較では見つけにくく、変更の漏れが起きやすい重複です。右下の「違う知識・似たコード」は、見た目が同じでもまとめません。1つにすると、片方の規則が変わったときに、もう片方も一緒に変わってしまいます。
          </p>
          <h3>データと外部とのやり取りにある重複</h3>
          <p>
            同書は、データの構造にも知識の重複が入り込むと書いています。例に挙げているのは、始点と終点と長さを持つ線のクラスです。長さは始点と終点から決まるので、長さをフィールドに保存すると同じ知識を2つの形で持つことになり、同書は長さを計算で求めるメソッドにするよう勧めています。性能のために計算の結果を保存するときは、重複の影響をクラスの中に閉じ込め、始点や終点を変えるメソッドの中で長さも計算し直すようにします<Ref n={2} />。この章のテーブルに税込みの金額を保存していないのは、税込みの金額が税抜きの単価と税率から決まるからです。注文した時点の金額を残すために保存する場合は<ChapterLink n={88} section="scene" />で扱います。
          </p>
          <p>
            外部の API やライブラリとやり取りするコードにも重複があります。アプリのコードは相手の API の項目名やエラーコードの意味を知っていなければならず、相手が変わるとアプリのコードも変わります。同書はこの重複を避けられないものとし、影響を小さくする方法を挙げています<Ref n={2} />。外部とのやり取りを1つのクラスに集める方法は<ChapterLink n={42} section="idea" />で扱いました。
          </p>
          <h3>この章の例にある知識</h3>
          <p>前の節のコードに含まれていた知識を、変わる理由とあわせて並べます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">知識</th>
                  <th scope="col">変える理由（決める人）</th>
                  <th scope="col">直す前に書かれていた場所</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">税区分ごとの税率</th>
                  <td>税法の改正（国）</td>
                  <td>4か所（4通りの書き方）</td>
                </tr>
                <tr>
                  <th scope="row">税込みの単価の端数の処理</th>
                  <td>店の価格の決め方（運営と経理）</td>
                  <td>4か所（3通りの丸め方）</td>
                </tr>
                <tr>
                  <th scope="row">明細と合計の求め方（単価で丸めてから数量を掛ける）</th>
                  <td>店の価格の決め方（運営と経理）</td>
                  <td>3か所（CSV だけ順序が違う）</td>
                </tr>
                <tr>
                  <th scope="row">金額の表示の書式（1,238円）</th>
                  <td>画面とメールの見た目（運営）</td>
                  <td>2か所</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            どの行も、1つの事柄が変わると複数の場所を直すことになるので、DRY の対象です。次の節ではこれらを1か所ずつに集めます。
          </p>
          <h3>似た原則との違い</h3>
          <p>
            Kent Beck はエクストリーム・プログラミング（XP）の設計の規則の1つとして、どの事柄もコードの中で「一度だけ」言うこと（Once and Only Once）を挙げました。Martin Fowler は2001年の IEEE Software の連載で、重複を取り除くことは良い設計につながる原則であり、DRY と Once and Only Once がそれを表していると書いています<Ref n={4} />。Fowler は Beck の設計の規則を解説した記事でも、「重複がない」という規則は別の場所で DRY とも呼ばれると説明しています<Ref n={5} />。Once and Only Once はコードの重複を主に扱い、DRY はコードの外（スキーマやドキュメント）の知識まで対象にします。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則</th>
                  <th scope="col">何を問題にするか</th>
                  <th scope="col">DRY との関係</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">DRY</th>
                  <td>同じ知識が複数の場所に表現されていること</td>
                  <td>この章</td>
                </tr>
                <tr>
                  <th scope="row">WET（<ChapterLink n={60} />）</th>
                  <td>まだ共通点がわからない段階での早すぎる共通化</td>
                  <td>2回目までは重複を許し、例が揃ってから DRY にする</td>
                </tr>
                <tr>
                  <th scope="row">AHA（<ChapterLink n={76} />）</th>
                  <td>誤った抽象化（フラグと分岐が増えた共通の処理）</td>
                  <td>誤った共通化よりも、はっきりした重複を選ぶ</td>
                </tr>
                <tr>
                  <th scope="row">Single Source of Truth（<ChapterLink n={88} />）</th>
                  <td>同じデータの正本が複数あること</td>
                  <td>DRY が知識の表現を扱うのに対し、保存したデータの値を扱う</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            DRY と WET・AHA は、どちらを優先するかで対立しているように見えます。実際には、DRY は「同じ知識かどうか」を問い、WET と AHA は「同じ知識だと判断できる材料が揃っているか」を問います。同じ知識だとわかっているものは DRY でまとめ、わからないうちはまとめずに待つ、という関係です。2つの原則のトレードオフは<ChapterLink n={93} section="dry-aha">終章の DRY と AHA の節</ChapterLink>で比べます。
          </p>
        </>
      ),
    },
    {
      id: 'apply',
      title: '税率と端数の規則を Tax モジュールに集める',
      body: (
        <>
          <h3>直す順序</h3>
          <p>4か所を一度に書き換えると、どの変更で金額が変わったのかを追えなくなります。次の順に、1か所ずつ直してはテストを実行します。</p>
          <ol>
            <li>4か所の結果を比べるテスト（前の節の consistency_spec.rb）を用意し、失敗することを確かめる</li>
            <li>どの計算を基準にするかを、経理と運営の担当者と決める</li>
            <li>税率と端数の規則を Tax モジュールに書き、Tax のテストを書く</li>
            <li>モデル（Product・OrderItem・Order）を Tax に向ける</li>
            <li>商品ページのヘルパーを、モデルのメソッドと i18n の書式に向ける</li>
            <li>確認メールと CSV を、モデルのメソッドに向ける</li>
            <li>grep で、税率と丸め方がほかに残っていないことを確かめる</li>
          </ol>
          <h3>手順2：基準にする計算を決める</h3>
          <p>
            基準にするのは、決済に使っている計算（単価の1円未満を切り捨て、税込みの単価に数量を掛け、明細を足す）にしました。利用者が実際に支払った金額なので、ほかの計算に合わせると過去の決済と合わなくなります。経理とは次の規則で合意しました。
          </p>
          <ul>
            <li>税込みの単価 = 税抜きの単価 ×（100 + 税率）÷ 100 の1円未満を切り捨てる</li>
            <li>明細の金額 = 税込みの単価 × 数量</li>
            <li>注文の合計 = 明細の金額の和</li>
          </ul>
          <h3>手順3：Tax モジュール</h3>
          <p>
            税率と、税込みの単価の端数の処理を、Tax モジュールに書きます。税率は百分率の整数で持ち、計算は Rational（分数で数を正確に表す Ruby のクラス）で行います。Float の 1.1 を掛けると、12000 × 1.1 が 13200.000000000002 になるような誤差が出ます（Ruby 4.0.9 で確認）。Float の誤差と丸め方の詳細は<ChapterLink n={46} section="money" />で扱いました。
          </p>
          <Code
            lang="ruby"
            title="app/models/tax.rb"
            code={`
# 消費税の規則。税率と、税込み単価の端数の処理はここだけに書く
module Tax
  # 税率（%）。軽減税率は飲食料品に使う
  RATES = { "standard" => 10, "reduced" => 8 }.freeze

  module_function

  def rate(category)
    RATES.fetch(category)
  end

  # 税込みの単価。1円未満は切り捨てる（2026年4月に経理と決めた規則）
  def included_price(price, category)
    (price * Rational(100 + rate(category), 100)).floor
  end
end
`}
          />
          <p>
            <code>module_function</code> を書くと、その後に定義したメソッドを <code>Tax.rate</code> のようにモジュールから直接呼べます。<code>RATES.fetch</code> は知らない税区分を渡されると KeyError を投げます。規則のコメントに「いつ、誰と決めたか」を書いておくと、次に規則を変える人が相談する相手を探せます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/tax_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Tax do
  it "税込みの単価は、1円未満を切り捨てる" do
    expect(Tax.included_price(248, "reduced")).to eq 267   # 267.84
    expect(Tax.included_price(398, "standard")).to eq 437  # 437.8
    expect(Tax.included_price(1000, "standard")).to eq 1100
  end

  it "知らない税区分は KeyError にする" do
    expect { Tax.rate("zero") }.to raise_error(KeyError)
  end
end
`}
          />
          <h3>手順4：モデルを Tax に向ける</h3>
          <p>
            Product は Tax を呼ぶだけにします。明細の金額を求める <code>OrderItem#subtotal</code> を足し、<code>Order#total</code> はそれを足し合わせます。「明細と合計の求め方」という知識は、この2つのメソッドに置きます。
          </p>
          <Code
            lang="ruby"
            title="app/models/product.rb（直した後）"
            code={`
class Product < ApplicationRecord
  enum :tax_category, { standard: "standard", reduced: "reduced" }, validate: true

  def tax_rate = Tax.rate(tax_category)
  def price_with_tax = Tax.included_price(price, tax_category)
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/order_item.rb・app/models/order.rb（直した後）"
            code={`
class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product

  # 明細の税込み金額 = 税込みの単価 × 数量
  def subtotal = product.price_with_tax * quantity
end

class Order < ApplicationRecord
  has_many :order_items

  # 注文の合計金額（税込み）。カート・決済・メール・CSV のすべてがこの値を使う
  def total = order_items.sum(&:subtotal)
end
`}
          />
          <p>
            <code>def total = …</code> は Ruby 3.0 から使える1行のメソッド定義です。この時点で consistency_spec.rb を実行すると、失敗は3つのままです。モデルの計算は前から決済の規則どおりだったので、結果は変わっていません。
          </p>
          <h3>手順5：商品ページと金額の書式</h3>
          <p>
            ヘルパーは税込みの単価を自分で計算せずに <code>price_with_tax</code> を呼びます。「1,238円」という書式も、ヘルパーとメールの2か所に書かれていた知識です。Rails の <code>number_to_currency</code> は、i18n（国際化）の設定の <code>number.currency.format</code> から単位・桁区切り・小数の桁数を読みます<Ref n={8} /><Ref n={9} />。この書式を config/locales/ja.yml に1回だけ書き、既定のロケールを日本語にしました。
          </p>
          <Code
            lang="yaml"
            title="config/locales/ja.yml"
            code={`
ja:
  number:
    currency:
      format:
        unit: "円"
        format: "%n%u"
        precision: 0
        delimiter: ","
        separator: "."
`}
          />
          <Code
            lang="ruby"
            title="config/application.rb（追加した行）・app/helpers/products_helper.rb（直した後）"
            code={`
# config/application.rb
    config.i18n.default_locale = :ja

# app/helpers/products_helper.rb
module ProductsHelper
  # 商品ページに表示する税込み価格
  def price_label(product)
    "#{number_to_currency(product.price_with_tax)}（税込み）"
  end
end
`}
          />
          <p>
            <code>format</code> の <code>%n</code> は数値、<code>%u</code> は単位に置き換わります。ヘルパーを直した後に consistency_spec.rb を実行すると、商品ページの例が通り、失敗は2つに減りました。
          </p>
          <h3>手順6：確認メールと CSV</h3>
          <Code
            lang="erb"
            title="app/views/order_mailer/confirmation.text.erb（直した後）"
            code={`
<%= @order.customer_name %> 様

ご注文ありがとうございます。

<% @order.order_items.each do |item| -%>
・<%= item.product.name %>　<%= number_to_currency(item.product.price_with_tax) %> × <%= item.quantity %>
<% end -%>
合計 <%= number_to_currency(@order.total) %>（税込み）
`}
          />
          <Code
            lang="ruby"
            title="app/models/sales_csv.rb（直した後。to_s の中だけ）"
            code={`
  def to_s
    CSV.generate do |csv|
      csv << %w[注文番号 商品 税率 数量 税込み金額]
      @orders.each do |order|
        order.order_items.each do |item|
          csv << [order.id, item.product.name, "#{item.product.tax_rate}%", item.quantity, item.subtotal]
        end
      end
    end
  end
`}
          />
          <p>
            メールのテンプレートから計算がなくなり、CSV からは税率の定数がなくなりました。CSV の税込み金額は、経理が会計のソフトに取り込むので、書式を付けない整数のまま出力します。
          </p>
          <h3>直した結果</h3>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec と bin/rails runner script/compare_amounts.rb）"
            code={`
.........

Finished in 0.28645 seconds (files took 0.93575 seconds to load)
9 examples, 0 failures

注文 #1：食パン（税抜き248円）× 3、洗剤（税抜き398円）× 1
  商品ページ  食パン: 267円（税込み）
  商品ページ  洗剤: 437円（税込み）
  カート・決済 合計: 1,238円（Order#total）
  確認メール   合計: 1,238円
  経理の CSV   合計: 1,238円（明細の税込み金額の和）
`}
          />
          <p>
            consistency_spec.rb を含む9つの例がすべて通り、4か所の金額が1,238円にそろいました。手順7として、税率と丸め方を grep で探しました。
          </p>
          <Code
            lang="text"
            title={"実行結果（grep -rnE '0?\\.08|1\\.08|0\\.1\\b|0\\.10|1\\.1\\b|=> 8|=> 10|\\.round|\\.floor|\\.ceil|/ 100' app）"}
            code={`
app/models/tax.rb:4:  RATES = { "standard" => 10, "reduced" => 8 }.freeze
app/models/tax.rb:14:    (price * Rational(100 + rate(category), 100)).floor
`}
          />
          <p>税率と丸め方は tax.rb だけに残りました。図 40-4 は直す前と後の構造を比べたものです。</p>
          <Figure n="40-4" title="直す前と後：計算の場所と呼び出し" caption="直した後の点線の枠はモデルのメソッド。実線の矢印は呼び出し。">
            <BeforeAfterFigure />
          </Figure>
          <p>
            直す前は、4か所がそれぞれ税率と丸め方を持っていました。直した後は、税率と端数の規則を Tax だけが持ち、商品ページ・メール・CSV・決済はモデルの3つのメソッドを呼びます。金額の書式は ja.yml にあり、商品ページとメールが <code>number_to_currency</code> を通して使います。
          </p>
          <h3>規則を変えるときに直す場所</h3>
          <p>
            直した後のコードで、経理から「税込みの単価を四捨五入に変えたい」と頼まれた場合を試しました。Tax の1行を変え、スクリプトとテストを実行します。
          </p>
          <Code
            lang="text"
            title="変更（diff -u）"
            code={`
   # 税込みの単価。1円未満は切り捨てる（2026年4月に経理と決めた規則）
   def included_price(price, category)
-    (price * Rational(100 + rate(category), 100)).floor
+    (price * Rational(100 + rate(category), 100)).round
   end
`}
          />
          <Code
            lang="text"
            title="実行結果（script/compare_amounts.rb と bundle exec rspec）"
            code={`
注文 #1：食パン（税抜き248円）× 3、洗剤（税抜き398円）× 1
  商品ページ  食パン: 268円（税込み）
  商品ページ  洗剤: 438円（税込み）
  カート・決済 合計: 1,242円（Order#total）
  確認メール   合計: 1,242円
  経理の CSV   合計: 1,242円（明細の税込み金額の和）

  1) Tax 税込みの単価は、1円未満を切り捨てる
       expected: 267
            got: 268

9 examples, 1 failure
`}
          />
          <p>
            1行の変更で、4か所の金額がそろって1,242円に変わりました。失敗したテストは端数の規則そのものを確かめる Tax のテストだけです。規則を変えたので、このテストの期待値も一緒に変えます。図 40-5 は規則を変えるときに直すファイルの数を、直す前と後で比べたものです。
          </p>
          <Figure n="40-5" title="規則を変えるときに直すファイル" caption="●は税率・丸め方・書式を表すコードがあるファイル。直す前の数には grep で見つけにくい書き方の場所も含む。">
            <ChangeFigure />
          </Figure>
          <p>
            飲食料品の税率の改正案のような変更も、直した後は Tax の <code>RATES</code> を直す作業になります。改正では「いつから新しい税率を使うか」という日付の規則も加わりますが、その規則も Tax の中に書けば、ほかのファイルは変わりません。日付による切り替えは、法案が成立して要件が決まってから Tax に足します。
          </p>
          <h3>テストの期待値と知識</h3>
          <p>
            テストの期待値にも知識が含まれます。直す前のメールのテストは「1,242円」を期待していて、メールの計算と同じ知識を持っていました。直した後は、端数の規則を確かめるのは Tax のテストだけにしました。ヘルパー・メール・CSV のテストには、端数が出ない価格（税抜き250円で軽減税率なら270円）を使います。
          </p>
          <Code
            lang="ruby"
            title="spec/mailers/order_mailer_spec.rb（直した後）"
            code={`
RSpec.describe OrderMailer, type: :mailer do
  it "確認メールに明細と合計を載せる" do
    bread = Product.create!(name: "食パン", price: 250, tax_category: "reduced")
    detergent = Product.create!(name: "洗剤", price: 400, tax_category: "standard")
    order = Order.create!(customer_name: "山田")
    order.order_items.create!(product: bread, quantity: 3)
    order.order_items.create!(product: detergent, quantity: 1)

    body = OrderMailer.confirmation(order).body.to_s
    expect(body).to include("・食パン　270円 × 3", "合計 1,250円（税込み）")
  end
end
`}
          />
          <p>
            メールのテストが確かめるのは「明細と合計を載せること」です。端数が出ない価格を選ぶと、端数の規則を変えてもこのテストは影響を受けません。上の四捨五入への変更で失敗したテストが1つだけだったのは、このためです。一方で、テストの中の重複（それぞれのテストで注文を作るコードなど）は、読みやすさのために残しています。テストの重複の扱いは<ChapterLink n={60} section="rails" />で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '同じに見える計算をまとめすぎたとき',
      body: (
        <>
          <p>
            DRY を「似た計算を1か所にする」と受け取ると、別の知識まで1つにまとめてしまうことがあります。この節では、税の計算の例でそれが起きる様子を動かして確かめます。
          </p>
          <h3>領収書に税率ごとの消費税額を載せる</h3>
          <p>
            このサイトは適格請求書発行事業者に登録していて、小売業なので、レシートや領収書として<Term en="simplified qualified invoice">適格簡易請求書</Term>を交付できます。適格簡易請求書には税率ごとに分けた合計と、税率ごとの消費税額（または適用税率）を載せます<Ref n={12} />。経理から、確認メールに付ける領収書に税率ごとの消費税額を載せてほしいと頼まれました。
          </p>
          <p>
            国税庁の Q&amp;A は、適格請求書の消費税額の1円未満の端数は「一の適格請求書につき、税率ごとに1回」処理すると答えています。端数の処理の方法（切り上げ・切り捨て・四捨五入）は任意ですが、商品ごとに消費税額を計算して端数を処理し、その合計を消費税額とすることは認められないと書かれています。同じ Q&amp;A の記載例では税込みの合計から 10/110 や 8/108 を掛けて消費税額を求めています<Ref n={13} />。
          </p>
          <h3>税込みの単価の計算を使い回したコード</h3>
          <p>
            Tax と Product#price_with_tax ができたばかりなので、開発者は「税の計算はもう1か所にある。もう一度書くと DRY に反する」と考え、税込みの単価と税抜きの単価の差を消費税額として使いました。
          </p>
          <Code
            lang="ruby"
            title="app/models/receipt.rb（まとめすぎた例）"
            code={`
# 領収書（適格簡易請求書）に載せる、税率ごとの対象額と消費税額
class Receipt
  Line = Data.define(:category, :total, :tax)

  def initialize(order)
    @order = order
  end

  def lines
    @order.order_items.group_by { it.product.tax_category }.map do |category, items|
      # 税込みの単価の計算は Product#price_with_tax にすでにある。
      # 同じ計算をもう一度書くと DRY に反すると考え、単価の差（税込み − 税抜き）を明細ごとに足し合わせた
      tax = items.sum { (it.product.price_with_tax - it.product.price) * it.quantity }
      Line.new(category:, total: items.sum(&:subtotal), tax:)
    end
  end
end
`}
          />
          <p>
            <code>Data.define</code> は属性を持つ変更できない値のクラスを作る Ruby 3.2 からの機能です。経理の規則に沿った期待値でテストを書き、実行しました。食パン3個の税込み合計801円に含まれる消費税額は 801 × 8/108 = 59.33… で、切り捨てて59円です。
          </p>
          <Code
            lang="ruby"
            title="spec/models/receipt_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Receipt do
  it "消費税額は、税率ごとの税込み合計から1回だけ計算する" do
    bread = Product.create!(name: "食パン", price: 248, tax_category: "reduced")
    detergent = Product.create!(name: "洗剤", price: 398, tax_category: "standard")
    order = Order.create!(customer_name: "山田")
    order.order_items.create!(product: bread, quantity: 3)
    order.order_items.create!(product: detergent, quantity: 1)

    lines = Receipt.new(order).lines.to_h { [it.category, [it.total, it.tax]] }
    expect(lines).to eq("reduced" => [801, 59], "standard" => [437, 39]) # 801 × 8/108 = 59.33…、437 × 10/110 = 39.72…
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/receipt_spec.rb）"
            code={`
  1) Receipt 消費税額は、税率ごとの税込み合計から1回だけ計算する
       expected: {"reduced" => [801, 59], "standard" => [437, 39]}
            got: {"reduced" => [801, 57], "standard" => [437, 39]}

1 example, 1 failure
`}
          />
          <p>
            軽減税率の消費税額が57円になり、2円少なくなりました。単価の差（267 − 248 = 19円）は、1個ごとに丸めた後の値です。それを3個分足すと、端数を3回処理したことになります。Q&amp;A が認めない「商品ごとの端数処理の合計」を、DRY のつもりで書いてしまいました。
          </p>
          <p>
            2つの計算は「税率を掛けて、切り捨てる」という点で似ていますが、知識が違います。税込みの単価の端数は店が価格の決め方として決めた規則で、変えるかどうかは運営と経理が決めます。適格請求書の消費税額の端数は税の規則で「1枚につき税率ごとに1回」と決まっています。税込みの単価を四捨五入に変えても、消費税額を求める段階は変わりません。両方に共通する知識は税率だけです。
          </p>
          <h3>税率だけを共有し、計算は分けて書く</h3>
          <p>税率の表は Tax の RATES を使い、消費税額の計算は別のメソッドとして書きます。</p>
          <Code
            lang="ruby"
            title="app/models/tax.rb（追加したメソッド）・app/models/receipt.rb（直した後）"
            code={`
module Tax
  # …（RATES・rate・included_price は省略）

  # 税込みの合計に含まれる消費税額。適格請求書では、1枚につき税率ごとに1回だけ端数を処理する
  # （端数の処理の方法は任意。この店は切り捨てる）
  def included_tax(total, category)
    (total * Rational(rate(category), 100 + rate(category))).floor
  end
end

class Receipt
  # …（Line・initialize は省略）

  def lines
    @order.order_items.group_by { it.product.tax_category }.map do |category, items|
      total = items.sum(&:subtotal)
      Line.new(category:, total:, tax: Tax.included_tax(total, category))
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec）"
            code={`
..........

Finished in 0.58516 seconds (files took 1.71 seconds to load)
10 examples, 0 failures
`}
          />
          <p>
            <code>included_price</code> と <code>included_tax</code> は、どちらも Rational を掛けて <code>floor</code> を呼ぶ1行で、見た目は似ています。この2行をさらに1つのメソッドにまとめないのは、図 40-3 の右下（違う知識・似たコード）に当たるからです。
          </p>
          <h3>フラグでまとめる誤り</h3>
          <p>
            2つを1つにまとめようとすると、<code>Tax.calculate(amount, category, mode: :unit_price)</code> と <code>mode: :invoice_tax</code> のように、呼び出し側ごとの違いをフラグの引数で渡すメソッドになりがちです。メソッドの中は <code>mode</code> の分岐になり、片方の規則を変えるたびに、もう片方の呼び出し側のテストも確かめることになります。フラグの引数が増えていく過程と、誤った共通化を戻す手順は、<ChapterLink n={60} section="scene" />と<ChapterLink n={76} section="apply" />で扱います。
          </p>
          <h3>当てはめすぎを見分ける目安</h3>
          <p>図 40-6 は似たコードや同じ値を見つけたときに、まとめるかどうかを決める問いを順に並べたものです。</p>
          <Figure n="40-6" title="まとめるかどうかの判断" caption="問1は「変更の理由が同じか」を問う。問3はまとめた後に見直すための問い。">
            <DecisionFigure />
          </Figure>
          <p>
            問1で「片方を変えるときに、もう片方も必ず同じに変えるか」を問います。税率は商品ページでも領収書でも必ず同じに変わるので「はい」です。税込みの単価の端数と、領収書の消費税額の端数は「いいえ」なので、まとめません。問2はまとめた知識に名前を付けられるかを問います。「税込みの単価」のように名前が付けば、呼び出す側はその名前で意味を読み取れます。名前が付けられないときは、共通点がまだわかっていないので、重複のまま例が増えるのを待ちます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">状況</th>
                  <th scope="col">DRY でまとめる</th>
                  <th scope="col">まとめない（重複のまま）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">変える理由</th>
                  <td>同じ人・同じ規則が変更を求める</td>
                  <td>変更を求める人や規則が違う</td>
                </tr>
                <tr>
                  <th scope="row">片方だけ変えることがあるか</th>
                  <td>ない（変えたら不具合）</td>
                  <td>ある</td>
                </tr>
                <tr>
                  <th scope="row">名前</th>
                  <td>業務の言葉で1つの名前を付けられる</td>
                  <td>「共通処理」「util」のような名前しか付かない</td>
                </tr>
                <tr>
                  <th scope="row">まとめた後の引数</th>
                  <td>呼び出し側によらず同じ</td>
                  <td>呼び出し側ごとのフラグや分岐が要る</td>
                </tr>
                <tr>
                  <th scope="row">同じ値の定数</th>
                  <td>同じ事実を表す（軽減税率 8%）</td>
                  <td>たまたま同じ数（送料無料の基準3,000円と、クーポンの最低金額3,000円）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            表の最後の行のように、同じ数の定数をまとめることも当てはめすぎになりえます。送料無料の基準とクーポンの最低金額を1つの定数にすると、送料の方針を変えたときにクーポンの条件まで変わります。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能・規約と DRY',
      body: (
        <>
          <h3>Rails Guides と Rails Doctrine での DRY</h3>
          <p>
            Rails Guides の「Getting Started with Rails」は、Rails の考え方の2つの指針として DRY と Convention over Configuration（設定より規約）を挙げ、DRY を『The Pragmatic Programmer』の定義で紹介しています<Ref n={6} />。同じガイドは show・edit・update の3つのアクションに書かれた <code>Product.find(params[:id])</code> を <code>before_action :set_product</code> に移す例を、DRY の例として示しています。
          </p>
          <p>
            Rails Doctrine（Rails の設計思想をまとめた文書）の「Convention over Configuration」は、Web アプリを作るたびに出てくる判断の多くは1回だけ決めれば足りるものであり、それを規約として Rails が決めると述べています<Ref n={7} />。主キーの列名を id にする、Person クラスを people テーブルに対応させる、といった判断を、アプリごとに設定ファイルへ書く必要がありません。同じ文書の「Value integrated systems」は、統合されたシステムでは層の間の重複（サーバーとクライアントの両方にあるテンプレートなど）を減らせると書いています。
          </p>
          <h3>Rails が1か所の宣言から作るもの</h3>
          <p>Rails には、1か所に書いた知識からほかのコードを作る仕組みがいくつもあります。この章のアプリで確かめました。</p>
          <Code
            lang="ruby"
            title="script/rails_dry.rb"
            code={`
# Rails が1か所の宣言から作るものを確かめる
h = ApplicationController.helpers
puts "attribute_names: #{Product.attribute_names.inspect}"
puts "tax_categories:  #{Product.tax_categories.inspect}"
puts "reduced の SQL:  #{Product.reduced.to_sql}"
puts "reduced?:        #{Product.find_by!(name: "食パン").reduced?}"
puts "通貨（ja）:      #{h.number_to_currency(1238)}"
puts "通貨（en）:      #{I18n.with_locale(:en) { h.number_to_currency(1238) }}"
product = Product.new(name: nil, price: 100, tax_category: "standard")
puts "name が nil の valid?: #{product.valid?}"
begin
  product.save!
rescue => e
  puts "save! の例外:    #{e.class}: #{e.message.lines.first.strip}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/rails_dry.rb）"
            code={`
attribute_names: ["id", "name", "price", "tax_category", "created_at", "updated_at"]
tax_categories:  {"standard" => "standard", "reduced" => "reduced"}
reduced の SQL:  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`tax_category\` = 'reduced'
reduced?:        true
通貨（ja）:      1,238円
通貨（en）:      $1,238.00
name が nil の valid?: true
save! の例外:    ActiveRecord::NotNullViolation: Mysql2::Error: Column 'name' cannot be null
`}
          />
          <ul>
            <li>
              Product のクラスには列を1つも書いていませんが、<code>attribute_names</code> は DB のスキーマから読んだ列名を返します。テーブルの列という知識は、マイグレーションと db/schema.rb にだけ書きます。
            </li>
            <li>
              <code>enum</code> の1行の宣言から、Rails は値ごとに <code>reduced?</code>・<code>reduced!</code> のメソッドと、<code>reduced</code>・<code>not_reduced</code> のスコープを作ります<Ref n={14} />。税区分の一覧という知識を、述語メソッドと検索の条件に何度も書かずに済みます。
            </li>
            <li>
              <code>number_to_currency</code> は、ロケールごとの <code>number.currency.format</code> を読みます<Ref n={9} />。英語のロケールでは <code>$1,238.00</code> になり、書式という知識はロケールのファイルに1か所だけあります。
            </li>
          </ul>
          <p>図 40-7 は Rails で知識を1か所にするときの置き場所をまとめたものです。</p>
          <Figure n="40-7" title="Rails で知識を1か所にする仕組み" caption="concern はこの章のコードでは使っていない。価格と税区分の列を持つモデルが2つ以上あり、price_with_tax が同じ知識なら concern に移せる。">
            <RailsFigure />
          </Figure>
          <p>
            図 40-7 の concern は <code>ActiveSupport::Concern</code> を使ったモジュールで、複数のモデルに共通のメソッド・関連・コールバックを1か所に書きます<Ref n={15} />。この章では、価格と税区分を持つのが Product だけなので、concern にしていません。たとえばギフトの包装料のように、税区分を持つ別のモデルが増え、そのモデルの税込みの価格も同じ規則で求めるなら、そのときに <code>price_with_tax</code> を concern に移します。DHH が concern をどう使っているかは<ChapterLink n={31} section="concern" />で扱いました。
          </p>
          <p>
            Value Object（値オブジェクト）も知識を1か所にする方法です。金額を通貨とあわせて持ち、丸め方を引数で指定させる Money は、<ChapterLink n={33} section="value-objects" />と<ChapterLink n={46} section="money" />で扱いました。この章の店は円だけを扱い、計算も税率を掛けて丸めるだけなので、モジュールの関数で足りると判断しました。
          </p>
          <h3>Rails でも残す重複</h3>
          <p>
            Rails のアプリには知っていて残す重複もあります。たとえば「商品名は必須」という知識は、マイグレーションの <code>null: false</code> と、モデルの <code>validates :name, presence: true</code> の両方に書くことがあります。上の実行結果の最後の2行のとおり、Rails は NOT NULL の制約からバリデーションを作りません。name が nil の Product は <code>valid?</code> が true になり、保存したときに DB が NotNullViolation で拒否します。2つの表現は役割が違います。DB の制約はアプリ以外の書き込み（SQL の直接の実行やほかのアプリ）からもデータを守り、バリデーションは利用者に向けたエラーメッセージを出します（<ChapterLink n={14} section="validations" />）。役割の違う2つの表現を持つときは、片方を変えたらもう片方も確かめることを、テストやレビューの観点に入れておきます。
          </p>
          <p>
            テストのコードも読みやすさのために重複を残すことがある場所です。テストの中の重複の扱いは<ChapterLink n={60} section="rails" />で、保存したデータの正本を1つにする話は<ChapterLink n={88} section="rails" />で扱います。
          </p>
          <Callout kind="note" title="Ruby 3.4 以降の csv">
            この章の CSV は Ruby の csv ライブラリで作っています。csv は Ruby 3.4 で default gem から bundled gem に変わったので<Ref n={16} />、Ruby 3.4 以降の Rails アプリでは Gemfile に <code>gem &quot;csv&quot;</code> を書きます。Ruby 3.3 では Gemfile に書かずに読み込むと、将来 bundled gem になることを知らせる警告が出ます<Ref n={17} />。
          </Callout>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>税率と丸め方が4か所に書かれていると、同じ注文の金額が決済・メール・CSV で食い違い、税率を変えるときに直す場所を検索で漏れなく見つけられません。</li>
          <li>DRY は Hunt と Thomas が『The Pragmatic Programmer』（1999年）で名付けた原則で、どの知識もシステムの中にただ1つの正式な表現を持つようにします。対象はコードの見た目ではなく知識の重複です。</li>
          <li>同じ知識が違う書き方で書かれた重複（8・0.08・1.08）は見つけにくく、変更の漏れが起きやすい重複です。見た目が同じでも知識が違うコードは、偶然の一致なのでまとめません。</li>
          <li>直すときは、場所ごとの結果を比べるテストを先に書き、基準にする計算を業務の担当者と決めてから、1か所ずつ規則のモジュールに向けます。</li>
          <li>まとめるかどうかは「片方を変えるとき、もう片方も必ず同じに変えるか」「1つの名前を付けられるか」で判断し、まとめた後にフラグや分岐が増えたら分け直します。</li>
          <li>Rails はスキーマ・enum・i18n・ヘルパー・concern・before_action で、それぞれの種類の知識を1か所に書けるようにしています。DB の制約とバリデーションのように、役割が違うので残す重複もあります。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'The Pragmatic Programmer: From Journeyman to Master', publisher: 'Andrew Hunt, David Thomas / Addison-Wesley（InformIT の書籍ページ）', url: 'https://www.informit.com/store/pragmatic-programmer-from-journeyman-to-master-9780201616224', accessed: '2026-11-21', version: '1999年10月20日刊', note: 'DRY を名付けた書籍の初版の出版年。' },
    { title: 'The Pragmatic Programmer, 20th Anniversary Edition（抜粋「DRY—The Evils of Duplication」）', publisher: 'The Pragmatic Bookshelf', url: 'https://media.pragprog.com/titles/tpp20/dry.pdf', accessed: '2026-11-21', version: '2019年9月刊（書籍ページ https://pragprog.com/titles/tpp20/ ）', note: 'DRY の定義の原文、「いつ忘れるかの問題」、初版の説明が不十分だったこと、DRY は知識と意図の重複を扱うこと、確かめ方、年齢と数量の検証の例（偶然の一致）。' },
    { title: 'Orthogonality and the DRY Principle（A Conversation with Andy Hunt and Dave Thomas, Part II）', publisher: 'Artima / Bill Venners', url: 'https://www.artima.com/articles/orthogonality-and-the-dry-principle', accessed: '2026-11-21', version: '2003年3月10日', note: 'DRY は最も誤解されている部分の1つで、コードの重複だけを意味しないこと。知識にはスキーマ・テストの計画・ビルド・ドキュメントが含まれること。' },
    { title: 'Avoiding Repetition（IEEE Software, Design 欄）', publisher: 'Martin Fowler / IEEE Software（martinfowler.com に置かれた PDF）', url: 'https://www.martinfowler.com/ieeeSoftware/repetition.pdf', accessed: '2026-11-21', version: '2001年1・2月号', note: '重複を取り除くことが良い設計につながる原則であること、DRY と Once and Only Once（Kent Beck『Extreme Programming Explained』1999年）。' },
    { title: 'BeckDesignRules', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/BeckDesignRules.html', accessed: '2026-11-21', version: '2015年3月2日', note: 'Beck の設計の規則の「重複がない」は、DRY や SPOT とも呼ばれ、Beck は Once and Only Once と表現したこと。' },
    { title: 'Getting Started with Rails（Rails Philosophy・Before Actions）', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/getting_started.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'Rails の考え方の2つの指針として DRY と Convention Over Configuration を挙げていること。before_action への移動を DRY の例として示していること。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: 'Convention over Configuration（1回だけ決めれば足りる判断を規約にする）、Value integrated systems（層の間の重複を減らす）。' },
    { title: 'Rails Internationalization (I18n) API', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/i18n.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'number_to_currency などの数値のヘルパーが number のスコープの書式の設定を使うこと。' },
    { title: 'activesupport/lib/active_support/number_helper/number_converter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/number_helper/number_converter.rb#L158-L167`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'number.format と number.currency.format を I18n から読み、書式の設定にすること。' },
    { title: '消費税の軽減税率制度・適格請求書等保存方式（インボイス制度）', publisher: '国税庁', url: 'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/index.htm', accessed: '2026-11-21', note: '令和元年10月1日から軽減税率制度が実施されていること。標準税率10%と軽減税率8%（飲食料品など）の区分は、下の資料の税率の表でも確かめた。' },
    { title: 'リーフレット「飲食料品に係る２年間の消費税率引下げについて」', publisher: '国税庁（消費税率引下げ特設サイト）', url: 'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/pdf/0026008-127_leaflet.pdf', accessed: '2026-11-21', version: '令和8年9月', note: '令和9年4月1日から令和11年3月31日まで、飲食料品の税率を1%（国・地方合計）に引き下げる改正案。令和8年9月15日の閣議決定の大綱に示された内容で、法案が成立した場合のものであること。新聞の定期購読は8%、その他は10%。' },
    { title: 'インボイス制度に関するＱ＆Ａ 問58（適格簡易請求書の記載事項）', publisher: '国税庁', url: 'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/pdf/qa/58.pdf', accessed: '2026-11-21', version: '令和5年10月改訂', note: '小売業などは適格請求書に代えて適格簡易請求書を交付できること。記載事項に、税率ごとに区分して合計した金額と、税率ごとに区分した消費税額等または適用税率が含まれること。' },
    { title: 'インボイス制度に関するＱ＆Ａ 問57（適格請求書に記載する消費税額等の端数処理）', publisher: '国税庁', url: 'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/pdf/qa/57.pdf', accessed: '2026-11-21', version: '令和6年4月改訂', note: '消費税額等の1円未満の端数は一の適格請求書につき税率ごとに1回処理すること、端数処理の方法は任意、商品ごとに端数処理した合計は認められないこと、税込みの合計に 10/110・8/108 を掛ける記載例。' },
    { title: 'activerecord/lib/active_record/enum.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/enum.rb#L303-L323`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'enum の値ごとに述語メソッド（?）・更新のメソッド（!）・スコープ・not_ のスコープを定義すること。' },
    { title: 'ActiveSupport::Concern', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveSupport/Concern.html', accessed: '2026-11-21', version: 'v8.1', note: 'included ブロックと class_methods で、複数のクラスに共通のメソッドや宣言をまとめること。' },
    { title: 'NEWS for Ruby 3.4.0', publisher: 'Ruby 3.4 Documentation', url: 'https://docs.ruby-lang.org/en/3.4/NEWS_md.html', accessed: '2026-11-21', note: 'csv が default gem から bundled gem に変わったこと（csv 3.3.2）。' },
    { title: 'NEWS for Ruby 3.3.0', publisher: 'Ruby 3.3 Documentation', url: 'https://docs.ruby-lang.org/en/3.3/NEWS_md.html', accessed: '2026-11-21', note: '将来 bundled gem になる csv などを Gemfile に書かずに require すると、RubyGems と Bundler が警告を出すこと。' },
  ],
}

export default chapter
