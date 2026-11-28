import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const figure = (n: number) => `${chapterNumber(110)}-${n}`

/* ---------- 図1 外から観測できる振る舞い ---------- */
function BehaviorFigure() {
  return (
    <Svg id={figure(1)} w={780} h={300} label="中央に POST /orders の処理がある。外から観測できる結果として、HTTP の状態コードと JSON、orders テーブルの行と products の在庫、notifications の行、例外と422・404の応答、副作用の順序とトランザクションの範囲を周りに並べた。それぞれに、この章の現在の振る舞いを記録するテストで何例確かめたかを添えた">
      <Box x={290} y={118} w={200} h={64} lines={['POST /orders', 'OrdersController#create']} fs={13} bold subTone="muted" fill="box5" accent />
      <Box x={20} y={20} w={230} h={56} lines={['HTTP の状態コードと JSON', '201・total_cents など（8例）']} fs={12.5} subTone="muted" />
      <Box x={530} y={20} w={230} h={56} lines={['orders と products の行', '合計・割引・在庫の数（6例）']} fs={12.5} subTone="muted" fill="box4" />
      <Box x={20} y={224} w={230} h={56} lines={['エラーの応答', '422・404 と error の文（3例）']} fs={12.5} subTone="muted" />
      <Box x={530} y={224} w={230} h={56} lines={['notifications の行', '注文1件に通知1件（2例）']} fs={12.5} subTone="muted" fill="box4" />
      <Box x={20} y={122} w={230} h={56} dashed lines={['副作用の順序と範囲', '在庫・注文・通知を1つの transaction']} fs={12} subTone="muted" />
      <Box x={530} y={122} w={230} h={56} dashed lines={['外部への送信', 'この例にはない（あれば記録する）']} fs={12} subTone="muted" />
      <Arrow x1={290} y1={130} x2={252} y2={60} />
      <Arrow x1={490} y1={130} x2={528} y2={60} />
      <Arrow x1={290} y1={170} x2={252} y2={244} />
      <Arrow x1={490} y1={170} x2={528} y2={244} />
      <Arrow x1={290} y1={150} x2={252} y2={150} dashed />
      <Arrow x1={490} y1={150} x2={528} y2={150} dashed />
    </Svg>
  )
}

/* ---------- 図2（段階送り）段階ごとのテストの結果とコントローラーの大きさ ---------- */
function StagesFigure({ current }: { current: number }) {
  const stages = [
    { name: '段階0', sub: '記録のテスト', tests: '8 例 成功', lines: 31, flog: '55.5', ok: true },
    { name: '段階1', sub: 'private に切り出す', tests: '8 例 成功', lines: 33, flog: '54.0', ok: true },
    { name: '段階2（誤り）', sub: '四捨五入で書いた', tests: '1 例 失敗', lines: 15, flog: '—', ok: false },
    { name: '段階2', sub: 'モデルへ移す', tests: '11 例 成功', lines: 15, flog: '21.3', ok: true },
    { name: '段階3', sub: '2つ目の呼び出し元', tests: '12 例 成功', lines: 15, flog: '21.3', ok: true },
  ]
  return (
    <Svg id={`${figure(2)}-${current + 1}`} w={780} h={300} label={`${stages[current].name}（${stages[current].sub}）の列を枠で囲み、それより後の段階を薄く表示した状態。左から段階0から段階3までのコミットを並べた図。段階0で現在の振る舞いを記録するテストを8例書き、段階1で private メソッドに切り出しても8例成功した。段階2の最初の版は割引を四捨五入で書いたので1例が失敗し、切り捨てに直して11例成功した。段階3で一括登録という2つ目の呼び出し元を足し、12例成功した。コントローラーの空行を除いた行数は31、33、15、15、15、flog の点数は55.5、54.0、21.3、21.3と下がった`}>
      <rect x={14 + current * 150} y={40} width={150} height={232} rx={8} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <Arrow x1={20} y1={30} x2={760} y2={30} />
      <T x={20} y={16} fs={11.5} tone="muted">コミットの順</T>
      {stages.map((s, i) => {
        const x = 20 + i * 150
        return (
          <g key={s.name} opacity={i > current ? 0.3 : undefined}>
            <Box x={x} y={48} w={138} h={54} lines={[s.name, s.sub]} fs={12} bold subTone="muted" fill={s.ok ? 'box' : 'bg'} dashed={!s.ok} />
            <Box x={x} y={112} w={138} h={34} lines={s.tests} fs={12} fill={s.ok ? 'box2' : 'bg'} accent={!s.ok} />
            <rect x={x + 20} y={262 - s.lines * 2.6} width={40} height={s.lines * 2.6} rx={3} fill="var(--fig-box5)" stroke="var(--fig-line)" opacity={s.ok ? 1 : 0.4} />
            <T x={x + 66} y={256} fs={11.5}>{`${s.lines} 行`}</T>
            <T x={x + 66} y={238} fs={11} tone="muted">{`flog ${s.flog}`}</T>
          </g>
        )
      })}
      <T x={20} y={286} fs={11.5} tone="muted">棒はコントローラーの空行を除いた行数。flog はコントローラー1ファイルの点数（段階2以降はモデルに移った分を含まない）</T>
    </Svg>
  )
}

/* ---------- 図3 Fat Model を分ける段階 ---------- */
function FatModelFigure() {
  return (
    <Svg id={figure(3)} w={780} h={300} label="左は機能追加で太った Order で、place!、CSV の出力、ポイントの計算、after_create の通知の4つを持ち、27行、flog 43.2。中央は CSV の出力を OrderCsv に移した段階で、Order.to_csv は OrderCsv を呼ぶだけにした。flog の合計は43.3で変わらない。右は通知を after_create から place! の中の明示的な呼び出しに移した段階で、Order の flog は19.8になった。この段階では create! で直接作った注文に通知が作られなくなり、振る舞いの変更として別のコミットにした">
      <T x={20} y={18} bold fs={13}>fm0：太った Order</T>
      <T x={280} y={18} bold fs={13}>fm1：CSV を移す</T>
      <T x={540} y={18} bold fs={13}>fm2：通知を明示する</T>
      <rect x={20} y={30} width={220} height={200} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      {['place!（注文の作成）', 'to_csv（CSV の出力）', 'points（ポイント）', 'after_create で通知'].map((t, i) => (
        <Box key={t} x={32} y={42 + i * 46} w={196} h={38} lines={t} fs={12} fill={i === 3 ? 'box3' : 'box'} />
      ))}
      <rect x={280} y={30} width={220} height={200} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      {['place!（注文の作成）', 'to_csv は委譲だけ', 'points（ポイント）', 'after_create で通知'].map((t, i) => (
        <Box key={t} x={292} y={42 + i * 46} w={196} h={38} lines={t} fs={12} fill={i === 3 ? 'box3' : 'box'} dashed={i === 1} />
      ))}
      <rect x={540} y={30} width={220} height={200} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      {['place! が通知も作る', 'to_csv は委譲だけ', 'points（ポイント）'].map((t, i) => (
        <Box key={t} x={552} y={42 + i * 46} w={196} h={38} lines={t} fs={12} fill={i === 0 ? 'box5' : 'box'} dashed={i === 1} accent={i === 0} />
      ))}
      <T x={20} y={250} fs={11.5}>27 行・flog 43.2</T>
      <T x={280} y={250} fs={11.5}>Order と OrderCsv の合計 flog 43.3</T>
      <T x={540} y={250} fs={11.5}>Order の flog 19.8</T>
      <T x={540} y={270} fs={11.5} tone="danger">create! の経路では通知なし</T>
      <T x={540} y={288} fs={11.5} tone="danger">（振る舞いの変更）</T>
      <Arrow x1={240} y1={130} x2={278} y2={130} />
      <Arrow x1={500} y1={130} x2={538} y2={130} />
    </Svg>
  )
}

/* ---------- 図4 技術的負債の4象限 ---------- */
function QuadrantFigure() {
  const cell = (x: number, y: number, title: string, quote: string, example: string, warn?: boolean) => (
    <g>
      <rect x={x} y={y} width={300} height={100} rx={6} fill={warn ? 'var(--fig-bg)' : 'var(--fig-box)'} stroke="var(--fig-line)" />
      <T x={x + 12} y={y + 20} bold fs={12.5}>{title}</T>
      <T x={x + 12} y={y + 44} fs={12}>{quote}</T>
      <T x={x + 12} y={y + 70} fs={11.5} tone="muted">{example}</T>
    </g>
  )
  return (
    <Svg id={figure(4)} w={780} h={290} label="Fowler の技術的負債の4象限。横軸は無謀か慎重か、縦軸は意図的か無自覚か。意図的で無謀なものは設計に時間をかけないと決めたもの。意図的で慎重なものは今出荷して結果に対処すると決めたもの。無自覚で無謀なものは層の分け方を知らずに書いたもの。無自覚で慎重なものは作った後で、どう作るべきだったかが分かったもの">
      <T x={300} y={18} anchor="middle" bold fs={12.5}>無謀（reckless）</T>
      <T x={610} y={18} anchor="middle" bold fs={12.5}>慎重（prudent）</T>
      <T x={60} y={86} anchor="middle" bold fs={12.5}>意図的</T>
      <T x={60} y={196} anchor="middle" bold fs={12.5}>無自覚</T>
      {cell(150, 32, '意図的・無謀', '「設計に時間をかけない」', '例：テストを書かずに締め切りに合わせる', true)}
      {cell(460, 32, '意図的・慎重', '「今出荷して、結果に対処する」', '例：重複を残し、見直す日を記録する')}
      {cell(150, 142, '無自覚・無謀', '「層の分け方とは何か」', '例：知らずにすべてをコントローラーに書く', true)}
      {cell(460, 142, '無自覚・慎重', '「今ならどう作るべきか分かる」', '例：作った後で良い分け方に気づく')}
      <T x={150} y={268} fs={11.5} tone="muted">Fowler の Technical Debt Quadrant（2009年）の4つの言葉を日本語にし、この章の例を添えた模式図</T>
    </Svg>
  )
}

/* ---------- 図5 変更頻度と複雑さ ---------- */
function HotspotFigure() {
  const pts = [
    { f: 'orders_controller', c: 19, s: 55.5 },
    { f: 'order', c: 10, s: 19.8 },
    { f: 'admin/reports_controller', c: 3, s: 52.1 },
    { f: 'order_csv', c: 5, s: 22.0 },
    { f: 'user', c: 16, s: 5.6 },
    { f: 'coupon', c: 7, s: 11.1 },
    { f: 'product', c: 4, s: 9.6 },
  ]
  const x0 = 80
  const y0 = 250
  const sx = 26
  const sy = 3.6
  return (
    <Svg id={figure(5)} w={780} h={300} label="横軸がコミット数、縦軸が flog の点数の散布図。orders_controller はコミット19回で flog 55.5 と右上にあり、変更頻度と複雑さの積が1055でもっとも大きい。admin/reports_controller は flog 52.1 だがコミットは3回で左上。user はコミット16回だが flog 5.6 で右下。order、order_csv、coupon、product は中ほどから左下にある">
      <line x1={x0} y1={y0} x2={x0 + 20 * sx} y2={y0} stroke="var(--fig-line)" />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - 60 * sy} stroke="var(--fig-line)" />
      <rect x={x0 + 10 * sx} y={y0 - 60 * sy} width={10 * sx} height={30 * sy} fill="var(--fig-box5)" opacity={0.5} stroke="none" />
      <T x={x0 + 10 * sx + 8} y={y0 - 30 * sy - 12} fs={11.5} tone="muted">変更が多く複雑（先に見る）</T>
      {[0, 5, 10, 15, 20].map((v) => (
        <T key={v} x={x0 + v * sx} y={y0 + 16} fs={11} anchor="middle" tone="muted">{String(v)}</T>
      ))}
      {[0, 20, 40, 60].map((v) => (
        <T key={v} x={x0 - 10} y={y0 - v * sy} fs={11} anchor="end" tone="muted">{String(v)}</T>
      ))}
      <T x={x0 + 10 * sx} y={y0 + 36} fs={12} anchor="middle">コミット数（変更頻度）</T>
      <T x={20} y={20} fs={12}>flog の点数（複雑さ）</T>
      {pts.map((p) => (
        <g key={p.f}>
          <circle cx={x0 + p.c * sx} cy={y0 - p.s * sy} r={6} fill="var(--fig-accent)" opacity={0.8} />
          <T x={x0 + p.c * sx + (p.c > 15 ? -10 : 10)} y={y0 - p.s * sy - 12} fs={11.5} mono anchor={p.c > 15 ? 'end' : 'start'}>{p.f}</T>
        </g>
      ))}
      <Box x={618} y={60} w={152} h={120} fill="bg" lines={['積の順位', '1. orders_controller 1055', '2. order 198', '3. reports 156', '6. user 90']} fs={11} align="start" />
    </Svg>
  )
}

/* ---------- 図6 大きな書き換えと段階的な置き換え ---------- */
const STRANGLER_STAGES: [string, string, 'box' | 'box4' | 'box5', string][] = [
  ['新旧を並べて比べる', '返すのは旧の結果', 'box', '新しい計算 0 件'],
  ['10% を新しい計算へ', '問題なら 0% に戻す', 'box', '新しい計算 1,011 件'],
  ['50% を新しい計算へ', '食い違いを確かめる', 'box', '新しい計算 5,032 件'],
  ['100%', '旧の計算は残す', 'box5', '新しい計算 10,000 件'],
  ['旧コードを消す', '比較の仕組みも消す', 'box4', '新しい計算だけ'],
]

function StranglerFigure({ current }: { current: number }) {
  return (
    <Svg id={`${figure(6)}-${current + 1}`} w={780} h={310} label={`下の段の「${STRANGLER_STAGES[current][0]}」を強調し、それより後の段階を薄く表示した状態。上の段は大きな書き換えで、旧システムを動かしながら新システムを別に作り、最後に一度に切り替える。切り替えまで新システムは利用者に価値を出さず、旧システムにも機能追加が続くので、切り替えの直前に差分を追う作業が増える。下の段は段階的な置き換えで、新旧を並べて結果を比べる期間、10パーセント、50パーセント、100パーセントと新しい計算に回す割合を上げる期間を経て、旧コードを消す。1万件の注文 ID のうち新しい計算に回った件数は、0、1,011、5,032、10,000 件。各段階で元に戻せる`}>
      <T x={20} y={20} bold>大きな書き換え</T>
      <Box x={20} y={32} w={740} h={34} lines="旧システムを動かし続ける（機能追加も続く）" fs={12} fill="box" />
      <Box x={20} y={74} w={600} h={34} dashed lines="新システムを別に作る（利用者にはまだ届かない）" fs={12} fill="bg" />
      <Box x={620} y={74} w={140} h={34} accent lines="一度に切り替え" fs={12} fill="box5" />
      <T x={20} y={128} fs={11.5} tone="muted">切り替えの直前に、旧システムに足された機能との差分を追う作業が集中する</T>
      <T x={20} y={162} bold>段階的な置き換え（Strangler Fig）</T>
      {STRANGLER_STAGES.map(([a, b, f, n], i) => (
        <g key={a} opacity={i > current ? 0.3 : undefined}>
          <Box x={20 + i * 150} y={176} w={138} h={54} lines={[a, b]} fs={12} subTone="muted" fill={f} accent={i === current} bold={i === current} />
          {i < 4 && <Arrow x1={158 + i * 150} y1={203} x2={168 + i * 150} y2={203} />}
          <T x={89 + i * 150} y={246} fs={11} anchor="middle" tone={i === current ? undefined : 'muted'}>{n}</T>
        </g>
      ))}
      <T x={20} y={272} fs={11.5} tone="muted">件数は1万件の注文 ID で数えた値。各段階で利用者に結果が届き、割合を戻せば元の状態に戻る。段階の分け方は一例</T>
      <T x={20} y={294} fs={11.5} tone="muted">新旧が並ぶ間は、比べる仕組みと切り替えの設定という一時的なコードを保守する</T>
    </Svg>
  )
}

const refactorSteps = [
  {
    label: '段階0 記録のテスト',
    detail: (
      <>
        <StagesFigure current={0} />
        <p>コードは変えずに、今のコードが返す値をそのまま期待値にした記録のテストを 8 例書き、すべて通りました。コントローラーは空行を除いて 31 行、flog の点数は 55.5 です。ここから先は変更のたびにこの 8 例を実行します。</p>
      </>
    ),
  },
  {
    label: '段階1 private に切り出す',
    detail: (
      <>
        <StagesFigure current={1} />
        <p>割引の計算などを、同じファイルの private メソッドに切り出しました。8 例はすべて通り、行数は 33 行に増え、flog の点数は 54.0 でほとんど変わっていません。割引の規則が <code>discount_for</code> の1か所にまとまり、次の段階でモデルへ移す範囲が決まりました。</p>
      </>
    ),
  },
  {
    label: '段階2（誤り）',
    detail: (
      <>
        <StagesFigure current={2} />
        <p>規則をモデルへ移すときに、割引を浮動小数点で計算して四捨五入する形で書いたところ、記録のテストが 1 例失敗しました。999 円の 10% が元のコードの 99 円ではなく 100 円になっていました。この変更はコミットせず、整数の割り算に戻しました。</p>
      </>
    ),
  },
  {
    label: '段階2 モデルへ移す',
    detail: (
      <>
        <StagesFigure current={3} />
        <p>割引と期限の判定を <code>Coupon</code>、在庫の確保を <code>Product</code>、注文と通知の保存を <code>Order.place!</code> に移しました。<code>Coupon</code> のモデルのテストを足して 11 例が通りました。コントローラーは 15 行、flog の点数は 21.3 に下がりましたが、コントローラーとモデル3つの点数を足すと 58.3 です。</p>
      </>
    ),
  },
  {
    label: '段階3 2つ目の呼び出し元',
    detail: (
      <>
        <StagesFigure current={4} />
        <p>管理画面から CSV で注文をまとめて登録する機能を足し、同じ <code>Order.place!</code> を呼ぶようにしました。一括登録のテストを足して 12 例が通りました。コントローラーは変えていないので、15 行と 21.3 のままです。</p>
      </>
    ),
  },
]

const stranglerSteps = [
  {
    label: '新旧を並べて比べる',
    detail: (
      <>
        <StranglerFigure current={0} />
        <p>比べる仕組み（下のコードの <code>PricingShadow</code>）が、古い計算の結果を返しながら新しい計算も実行し、食い違いをログに残します。下の実行結果では 8,000 通りのうち 4,000 通りが食い違いました。呼び出し元に返す値は古い計算のままなので、利用者に返す金額は変わりません。</p>
      </>
    ),
  },
  {
    label: '10%',
    detail: (
      <>
        <StranglerFigure current={1} />
        <p>切り替え（下のコードの <code>PricingSwitch</code>）で、注文 ID の CRC32 を 100 で割った余りが 10 未満の注文だけを新しい計算に回します。1万件の注文 ID では 1,011 件でした。問題が見つかったら割合を 0 に戻すと、すべての注文が古い計算に戻ります。</p>
      </>
    ),
  },
  {
    label: '50%',
    detail: (
      <>
        <StranglerFigure current={2} />
        <p>割合を 50 にすると、1万件のうち 5,032 件が新しい計算に回りました。判定は注文 ID だけで決まるので、同じ ID はいつも同じ側に入ります（order-42 を5回判定しても同じ結果）。余りが 10 未満の注文は 50 未満でもあるため、10% のときに新しい計算に回っていた注文は、50% でも新しい計算のままです。</p>
      </>
    ),
  },
  {
    label: '100%',
    detail: (
      <>
        <StranglerFigure current={3} />
        <p>1万件すべてが新しい計算に回ります。古い計算のコードと切り替えの設定はまだ残っているので、割合を下げれば古い計算に戻せます。</p>
      </>
    ),
  },
  {
    label: '旧コードを消す',
    detail: (
      <>
        <StranglerFigure current={4} />
        <p>古い計算、比べる仕組み、切り替えの設定を消します。消した後は割合を変えるだけでは古い計算に戻せません。大きな書き換えの「一度に切り替え」と違い、10% の段階から新しい計算の結果が利用者に届いています。</p>
      </>
    ),
  },
]

const stage0Controller = `
# app/controllers/orders_controller.rb（段階0：変更前）
class OrdersController < ActionController::API
  def create
    product = Product.find_by(id: params[:product_id])
    return render(json: { error: "product not found" }, status: :not_found) unless product

    quantity = params[:quantity].to_i
    if quantity <= 0
      return render json: { error: "quantity must be positive" }, status: :unprocessable_content
    end
    if product.stock < quantity
      return render json: { error: "out of stock" }, status: :unprocessable_content
    end

    subtotal = product.price_cents * quantity
    discount = 0
    if params[:coupon_code].present?
      coupon = Coupon.find_by(code: params[:coupon_code])
      if coupon && coupon.expires_on >= Date.current
        discount = subtotal * coupon.percent_off / 100
        discount = 5000 if discount > 5000 # 割引の上限
      end
    end

    order = nil
    ActiveRecord::Base.transaction do
      product.update!(stock: product.stock - quantity)
      order = Order.create!(product: product, quantity: quantity, subtotal_cents: subtotal,
                            discount_cents: discount, total_cents: subtotal - discount,
                            coupon_code: discount > 0 ? params[:coupon_code] : nil)
      Notification.create!(order: order, kind: "order_placed")
    end
    render json: { id: order.id, total_cents: order.total_cents, discount_cents: order.discount_cents }, status: :created
  end
end
`

const characterizationSpec = `
# spec/requests/orders_characterization_spec.rb
require "rails_helper"

# 今の振る舞いを記録するテスト（仕様として正しいかは問わない）
RSpec.describe "POST /orders の現在の振る舞い", type: :request do
  let!(:product) { Product.create!(name: "ノート", price_cents: 333, stock: 10) }
  before do
    Coupon.create!(code: "TEN", percent_off: 10, expires_on: Date.current)
    Coupon.create!(code: "HALF", percent_off: 50, expires_on: Date.current)
    Coupon.create!(code: "OLD", percent_off: 10, expires_on: Date.current - 1)
  end

  def place(**params) = post("/orders", params: { product_id: product.id, quantity: 3, **params })

  it "クーポンなし：合計 999、在庫 7、通知 1 件" do
    place
    expect(response).to have_http_status(:created)
    expect(response.parsed_body).to include("total_cents" => 999, "discount_cents" => 0)
    expect(product.reload.stock).to eq 7
    expect(Notification.where(kind: "order_placed").count).to eq 1
  end

  it "10% のクーポン：999 の 10% は切り捨てて 99" do
    place(coupon_code: "TEN")
    expect(response.parsed_body).to include("total_cents" => 900, "discount_cents" => 99)
    expect(Order.last.coupon_code).to eq "TEN"
  end

  it "割引は 5000 で頭打ち" do
    product.update!(price_cents: 20_000)
    place(coupon_code: "HALF", quantity: 1)
    expect(response.parsed_body).to include("total_cents" => 15_000, "discount_cents" => 5000)
  end

  it "期限切れのクーポンはエラーにせず無視し、coupon_code も保存しない" do
    place(coupon_code: "OLD")
    expect(response).to have_http_status(:created)
    expect(response.parsed_body["discount_cents"]).to eq 0
    expect(Order.last.coupon_code).to be_nil
  end

  it "存在しないクーポンも無視する" do
    place(coupon_code: "NOPE")
    expect(response.parsed_body["discount_cents"]).to eq 0
  end

  it "在庫が足りなければ 422 で、在庫も注文も変えない" do
    place(quantity: 11)
    expect(response).to have_http_status(:unprocessable_content)
    expect([product.reload.stock, Order.count, Notification.count]).to eq [10, 0, 0]
  end

  it "数量が 0 以下なら 422" do
    place(quantity: 0)
    expect(response.parsed_body).to eq("error" => "quantity must be positive")
  end

  it "商品がなければ 404" do
    post "/orders", params: { product_id: 0, quantity: 1 }
    expect(response).to have_http_status(:not_found)
  end
end
`

const stage0Output = `
$ bundle exec rspec --format documentation

POST /orders の現在の振る舞い
  クーポンなし：合計 999、在庫 7、通知 1 件
  10% のクーポン：999 の 10% は切り捨てて 99
  割引は 5000 で頭打ち
  期限切れのクーポンはエラーにせず無視し、coupon_code も保存しない
  存在しないクーポンも無視する
  在庫が足りなければ 422 で、在庫も注文も変えない
  数量が 0 以下なら 422
  商品がなければ 404

Finished in 0.14395 seconds (files took 0.7651 seconds to load)
8 examples, 0 failures
`

const stage1Controller = `
# 段階1：同じファイルの中で private メソッドに切り出す
class OrdersController < ActionController::API
  def create
    product = Product.find_by(id: params[:product_id])
    return render_error("product not found", :not_found) unless product

    quantity = params[:quantity].to_i
    return render_error("quantity must be positive") if quantity <= 0
    return render_error("out of stock") if product.stock < quantity

    subtotal = product.price_cents * quantity
    discount = discount_for(subtotal, params[:coupon_code])
    order = save_order(product, quantity, subtotal, discount)
    render json: { id: order.id, total_cents: order.total_cents, discount_cents: order.discount_cents }, status: :created
  end

  private

  def render_error(message, status = :unprocessable_content)
    render json: { error: message }, status:
  end

  def discount_for(subtotal, code)
    return 0 if code.blank?

    coupon = Coupon.find_by(code:)
    return 0 unless coupon && coupon.expires_on >= Date.current

    [subtotal * coupon.percent_off / 100, 5000].min # 割引の上限
  end

  def save_order(product, quantity, subtotal, discount)
    ActiveRecord::Base.transaction do
      product.update!(stock: product.stock - quantity)
      order = Order.create!(product:, quantity:, subtotal_cents: subtotal,
                            discount_cents: discount, total_cents: subtotal - discount,
                            coupon_code: discount > 0 ? params[:coupon_code] : nil)
      Notification.create!(order:, kind: "order_placed")
      order
    end
  end
end
`

const stage2Code = `
# 段階2：業務の規則をモデルへ移す
# app/models/coupon.rb
class Coupon < ApplicationRecord
  MAX_DISCOUNT_CENTS = 5000

  def self.usable(code, on: Date.current)
    where(expires_on: on..).find_by(code:) if code.present?
  end

  def discount_for(subtotal_cents)
    [subtotal_cents * percent_off / 100, MAX_DISCOUNT_CENTS].min # 整数の割り算で切り捨て
  end
end

# app/models/product.rb
class Product < ApplicationRecord
  class OutOfStock < StandardError; end

  def reserve!(quantity)
    raise OutOfStock, "#{name}: stock #{stock} < #{quantity}" if stock < quantity

    update!(stock: stock - quantity)
  end
end

# app/models/order.rb
class Order < ApplicationRecord
  belongs_to :product
  has_many :notifications

  def self.place!(product:, quantity:, coupon_code: nil)
    subtotal = product.price_cents * quantity
    discount = Coupon.usable(coupon_code)&.discount_for(subtotal) || 0
    transaction do
      product.reserve!(quantity)
      order = create!(product:, quantity:, subtotal_cents: subtotal, discount_cents: discount,
                      total_cents: subtotal - discount, coupon_code: discount > 0 ? coupon_code : nil)
      order.notifications.create!(kind: "order_placed")
      order
    end
  end
end

# app/controllers/orders_controller.rb
class OrdersController < ActionController::API
  rescue_from Product::OutOfStock do
    render json: { error: "out of stock" }, status: :unprocessable_content
  end

  def create
    product = Product.find_by(id: params[:product_id])
    return render json: { error: "product not found" }, status: :not_found unless product

    quantity = params[:quantity].to_i
    if quantity <= 0
      return render json: { error: "quantity must be positive" }, status: :unprocessable_content
    end

    order = Order.place!(product:, quantity:, coupon_code: params[:coupon_code])
    render json: { id: order.id, total_cents: order.total_cents, discount_cents: order.discount_cents }, status: :created
  end
end
`

const stage2Mistake = `
# Coupon#discount_for を最初は次のように書いた
#   [(subtotal_cents * percent_off / 100.0).round, MAX_DISCOUNT_CENTS].min

  1) POST /orders の現在の振る舞い 10% のクーポン：999 の 10% は切り捨てて 99
     Failure/Error: expect(response.parsed_body).to include("total_cents" => 900, "discount_cents" => 99)

       expected {"discount_cents" => 100, "id" => 1, "total_cents" => 899} to include {"total_cents" => 900, "discount_cents" => 99}

8 examples, 1 failure
`

const stage2Diff = `
$ git diff --stat HEAD~1 -- app spec     # 段階2（切り捨てに直した後）
 app/controllers/orders_controller.rb | 41 ++++++++----------------------------
 app/models/coupon.rb                 |  9 ++++++++
 app/models/order.rb                  | 13 ++++++++++++
 app/models/product.rb                |  7 ++++++
 spec/models/coupon_spec.rb           | 19 +++++++++++++++++
 5 files changed, 57 insertions(+), 32 deletions(-)

$ bundle exec rspec
11 examples, 0 failures

$ flog -s（ファイルごとの合計）
段階0 orders_controller.rb  55.5
段階2 orders_controller.rb  21.3   order.rb 16.3   coupon.rb 11.1   product.rb 9.6
`

const stage3Code = `
# app/models/bulk_order_import.rb（段階3：管理画面からの一括登録）
require "csv"

class BulkOrderImport
  Result = Data.define(:placed, :failed)

  def self.call(csv_text)
    placed, failed = [], []
    CSV.parse(csv_text, headers: true).each do |row|
      product = Product.find(row["product_id"])
      placed << Order.place!(product:, quantity: row["quantity"].to_i, coupon_code: row["coupon_code"])
    rescue Product::OutOfStock, ActiveRecord::RecordNotFound => e
      failed << [row["product_id"], e.class.name]
    end
    Result.new(placed:, failed:)
  end
end
`

const fatModelCode = `
# app/models/order.rb（fm0：機能追加を重ねた後）
require "csv"

class Order < ApplicationRecord
  belongs_to :product
  has_many :notifications
  after_create :notify_placed

  CSV_HEADER = %w[id product quantity total_cents coupon_code points]

  def self.place!(product:, quantity:, coupon_code: nil)
    subtotal = product.price_cents * quantity
    discount = Coupon.usable(coupon_code)&.discount_for(subtotal) || 0
    transaction do
      product.reserve!(quantity)
      create!(product:, quantity:, subtotal_cents: subtotal, discount_cents: discount,
              total_cents: subtotal - discount, coupon_code: discount > 0 ? coupon_code : nil)
    end
  end

  def self.to_csv(orders)
    CSV.generate do |csv|
      csv << CSV_HEADER
      orders.includes(:product).order(:id).each do |o|
        csv << [o.id, o.product.name, o.quantity, o.total_cents, o.coupon_code, o.points]
      end
    end
  end

  def points = total_cents / 100 # 100 円ごとに 1 ポイント

  private

  def notify_placed = notifications.create!(kind: "order_placed")
end
`

const fatModelSpec = `
# spec/models/order_spec.rb（fm0 の時点で書いた記録のテスト）
RSpec.describe Order do
  let(:note) { Product.create!(name: "ノート", price_cents: 333, stock: 10) }

  it "CSV の出力（今の形を記録する）" do
    Coupon.create!(code: "TEN", percent_off: 10, expires_on: Date.current)
    first = Order.place!(product: note, quantity: 3, coupon_code: "TEN")
    second = Order.place!(product: note, quantity: 1)
    expect(Order.to_csv(Order.all)).to eq <<~CSV
      id,product,quantity,total_cents,coupon_code,points
      #{first.id},ノート,3,900,TEN,9
      #{second.id},ノート,1,333,,3
    CSV
  end

  it "place! で注文すると通知が1件できる" do
    expect { Order.place!(product: note, quantity: 1) }.to change(Notification, :count).by(1)
  end

  it "create! で直接作っても通知が1件できる（seeds の経路）" do
    expect { Order.create!(product: note, quantity: 1, subtotal_cents: 333, total_cents: 333) }
      .to change(Notification, :count).by(1)
  end
end
`

const fatModelRun = `
# fm1：CSV の出力を OrderCsv に移し、Order.to_csv は委譲だけにした
$ git diff --stat HEAD~1 -- app spec
 app/models/order.rb     | 14 ++------------
 app/models/order_csv.rb | 15 +++++++++++++++
 2 files changed, 17 insertions(+), 12 deletions(-)
$ bundle exec rspec
15 examples, 0 failures

# fm2 の前に、注文を作る経路を探した
$ git grep -n -E "Order\\.(create|new|place!|insert)|orders\\.(create|build)" -- app db lib
app/controllers/orders_controller.rb:15:    order = Order.place!(product:, quantity:, coupon_code: params[:coupon_code])
app/models/bulk_order_import.rb:11:      placed << Order.place!(product:, quantity: row["quantity"].to_i, coupon_code: row["coupon_code"])
db/seeds.rb:2:Order.create!(product: note, quantity: 1, subtotal_cents: 333, total_cents: 333)

# fm2：after_create をやめ、place! の中で通知を作るように変えた
  1) Order create! で直接作っても通知が1件できる（seeds の経路）
       expected \`Notification.count\` to have changed by 1, but was changed by 0
15 examples, 1 failure
`

const overDesignCode = `
# app/models/discounts/policy.rb
module Discounts
  # 割引の計算方法の共通の取り決め（実装は1つだけ）
  class Policy
    def initialize(coupon) = @coupon = coupon
    def discount_for(_subtotal_cents) = raise(NotImplementedError)
  end
end

# app/models/discounts/percent_policy.rb
module Discounts
  class PercentPolicy < Policy
    def discount_for(subtotal_cents)
      [subtotal_cents * @coupon.percent_off / 100, Rails.configuration.x.discounts.fetch(:max_cents)].min
    end
  end
end

# app/models/discounts/policy_factory.rb
module Discounts
  module PolicyFactory
    def self.for(coupon)
      Rails.configuration.x.discounts.fetch(:policy).constantize.new(coupon)
    end
  end
end

# config/discounts.yml と config/initializers/discounts.rb
shared:
  policy: Discounts::PercentPolicy
  max_cents: 5000
Rails.application.config.x.discounts = Rails.application.config_for(:discounts)

# app/models/coupon.rb
class Coupon < ApplicationRecord
  def discount_for(subtotal_cents)
    Discounts::PolicyFactory.for(self).discount_for(subtotal_cents)
  end
end
`

const overDesignRun = `
$ bundle exec rspec          # 過剰な構成のまま
15 examples, 0 failures

# 計算を Coupon#discount_for に戻し（Inline Class）、Policy と Factory と設定を消した
$ git diff --stat HEAD~1
 app/models/coupon.rb                   | 4 +++-
 app/models/discounts/percent_policy.rb | 7 -------
 app/models/discounts/policy.rb         | 7 -------
 app/models/discounts/policy_factory.rb | 7 -------
 config/discounts.yml                   | 3 ---
 config/initializers/discounts.rb       | 1 -
 6 files changed, 3 insertions(+), 26 deletions(-)

$ bundle exec rspec
15 examples, 0 failures
`

const hotspotScript = `
# hotspots.rb：変更頻度（コミット数）と複雑さ（flog の合計）を掛けて並べる
require "flog"

churn = \`git log --format= --name-only -- app\`.lines.map(&:strip).reject(&:empty?).tally
rows = churn.filter_map do |path, commits|
  next unless File.exist?(path)
  flog = Flog.new(quiet: true, continue: true)
  flog.flog(path)
  [path, commits, flog.total_score.round(1), (commits * flog.total_score).round]
end
puts format("%-46s %8s %6s %8s", "file", "commits", "flog", "score")
rows.sort_by { -_1[3] }.each { |r| puts format("%-46s %8d %6.1f %8d", *r) }
`

const hotspotOutput = `
file                                            commits   flog    score
app/controllers/orders_controller.rb                 19   55.5     1055
app/models/order.rb                                  10   19.8      198
app/controllers/admin/reports_controller.rb           3   52.1      156
app/models/order_csv.rb                               5   22.0      110
app/models/user.rb                                   16    5.6       90
app/models/coupon.rb                                  7   11.1       77
app/models/product.rb                                 4    9.6       38
`

const shadowCode = `
# app/models/new_pricing.rb（置き換え先。端数を四捨五入する新しい規則で書かれた）
module NewPricing
  def self.discount_for(subtotal_cents, percent_off)
    [(subtotal_cents * percent_off / 100r).round, 5000].min
  end
end

# app/models/pricing_shadow.rb：古い計算の結果を返しつつ、新しい計算も実行して食い違いを記録する
module PricingShadow
  def self.discount_for(coupon, subtotal_cents, log: Rails.logger)
    legacy = coupon.discount_for(subtotal_cents)
    candidate = NewPricing.discount_for(subtotal_cents, coupon.percent_off)
    if legacy != candidate
      log.info("pricing_mismatch coupon=#{coupon.code} subtotal=#{subtotal_cents} legacy=#{legacy} new=#{candidate}")
    end
    legacy
  end
end

# app/models/pricing_switch.rb：注文 ID ごとに、新しい計算へ回す割合を決める
require "zlib"

module PricingSwitch
  def self.new_pricing?(order_key, percent: Rails.configuration.x.new_pricing_percent.to_i)
    Zlib.crc32(order_key.to_s) % 100 < percent
  end
end
`

const shadowOutput = `
# 小計 100〜2,099 と、割引率 5・10・15・30% の全組み合わせで比べた
比較した組み合わせ: 8000  食い違い: 4000  呼び出し元に返した値は古い計算のまま: true
pricing_mismatch coupon=P30 subtotal=102 legacy=30 new=31
pricing_mismatch coupon=P30 subtotal=103 legacy=30 new=31
pricing_mismatch coupon=P15 subtotal=104 legacy=15 new=16
{"P30" => 1000, "P15" => 1000, "P10" => 1000, "P5" => 1000}

# 1万件の注文 ID で、割合ごとに新しい計算へ回る件数を数えた
percent=0: 新しい計算に回る注文 0 / 10000
percent=10: 新しい計算に回る注文 1011 / 10000
percent=50: 新しい計算に回る注文 5032 / 10000
percent=100: 新しい計算に回る注文 10000 / 10000
同じ ID（order-42）を5回判定した結果: [false]
`

const chapter: Chapter = {
  number: 110,
  part: 7,
  title: "リファクタリングと技術的負債",
  summary: "注文を作るコントローラーとモデルを、今の振る舞いを記録するテストで固定してから段階的に直し、技術的負債の返し方、変更頻度と複雑さによる候補の探し方、大きな書き換えと段階的な置き換えを比べます。",
  goals: [
    "振る舞いを変える変更とリファクタリングを区別し、観測できる結果を挙げられる",
    "今の振る舞いを記録するテストを書いてから、小さな変更とテストの実行を繰り返せる",
    "Fat Controller と Fat Model を段階的に分け、各段階で何が変わったかを数値で確かめられる",
    "技術的負債を4象限と利息で説明し、返す順序を変更の頻度と費用から決められる",
    "大きな書き換えと Strangler Fig による段階的な置き換えを比べ、過剰な設計を元に戻す判断ができる",
  ],
  prerequisites: [30, 33],
  sections: [
    {
      id: "behavior",
      title: "リファクタリングで保つ振る舞いと変える構造",
      body: (
        <>
          <p><Term en="refactoring">リファクタリング</Term>は、外から観測できる振る舞いを保ったまま、コードの内部の構造を変える作業です<Ref n={1} />。言葉の由来、Kent Beck の「2つの帽子」、技術的負債という言葉の起こりは<ChapterLink n={86} />で扱っているので、この章ではその先の、実際のコードを安全に直す手順と、どこから直すかの決め方を扱います。</p>
          <p>最初に決めるのは「保つ振る舞い」の範囲です。画面に表示される値だけが振る舞いではありません。この章で直す <code>POST /orders</code> では、図 {figure(1)} のように、HTTP の状態コードと JSON、<code>orders</code> と <code>products</code> の行、<code>notifications</code> の行、エラーの応答、副作用の順序とトランザクションの範囲が、外から観測できる結果です。たとえば割引の計算を別のメソッドに移しても、同じ注文とクーポンから同じ合計を返し、同じ行を書き込むならリファクタリングです。端数の丸め方を変えて合計が1円変わるなら、それは仕様の変更で、利用者や経理との合意が要ります。</p>
          <Figure n={figure(1)} title="POST /orders の外から観測できる振る舞い" caption="この章の例で記録した振る舞いを並べた図。括弧の中は、次の節で書く記録のテストのうち、その結果を確かめている例の数。">
            <BehaviorFigure />
          </Figure>
          <p>値引きの計算を直したら、保存に失敗したときに送らなかった通知が送られるようになった、という変更も振る舞いの変更です。数値が同じでも、呼び出し元や永続データから見た結果が変わっています。どの結果を保つかは、呼び出し元、DB、ジョブ、外部サービスまで含めて洗い出します。</p>
        </>
      ),
    },
    {
      id: "procedure",
      title: "手順：振る舞いを記録し、小さく変え、確かめる",
      body: (
        <>
          <p>リファクタリングはテストで振る舞いを固定する、小さく変える、テストを実行して確かめる、の繰り返しです。最初の段階で困るのは、今の振る舞いが文書にもテストにも書かれていないことです。そこで、コードが今実際に返す値を調べ、その値をそのままテストに書きます。正しいかどうかは問わず、今の振る舞いを記録することが目的のテストで、Michael Feathers が『Working Effectively with Legacy Code』（2004年）で characterization test と呼んだものです<Ref n={5} />。この章では「記録のテスト」と呼びます。</p>
          <p>次のコントローラーがこの章で直す対象です。注文の作成で、商品の存在、数量、在庫を確かめ、クーポンの割引を計算し、在庫を減らし、注文と通知を保存します。テーブルは <code>products</code>（価格と在庫）、<code>coupons</code>（割引率と期限）、<code>orders</code>、<code>notifications</code> の4つです。</p>
          <Code lang="ruby" title="段階0：1つのアクションにすべてが入ったコントローラー" code={stage0Controller} />
          <p>このコードを読むと、仕様書に書かれていそうにない振る舞いがいくつか見つかります。割引は整数の割り算なので 999 円の 10% は 99 円に切り捨てられること、期限切れや存在しないクーポンはエラーにならず、割引なしで処理されること、割引が付かなかったときは <code>coupon_code</code> を保存しないことです。これらが意図した仕様か偶然かは、コードだけでは分かりません。記録のテストでは、意図かどうかを判断せずに、今の結果をそのまま書きます。</p>
          <Code lang="ruby" title="記録のテスト（RSpec の request spec）" code={characterizationSpec} />
          <Code lang="text" title="実行結果（Ruby 4.0.9、Rails 8.1.4.1、rspec-rails 8.1.0、SQLite）" code={stage0Output} />
          <p>8 例すべてが通りました。期待値は、先にコードを動かして得た実際の値を写したものです。値の分からない箇所は、わざと間違った期待値を書いて失敗させ、失敗のメッセージに出た実際の値を写すと速く調べられます。記録のテストを書く途中で、明らかに誤りと思える振る舞い（たとえば期限切れのクーポンを、エラーを返さずに割引なしで処理すること）が見つかったら、その場では直さず、記録したうえで別の変更として扱います。構造を直す変更と振る舞いを直す変更を同じコミットに入れると、テストが落ちたときにどちらが原因かを切り分けられないからです（<ChapterLink n={86} section="meaning" />）。</p>
          <Figure n={figure(2)} title="段階ごとのテストの結果とコントローラーの大きさ（段階送り）" caption="この章で行ったコミットの順に、テストの結果と、コントローラーの行数・flog の点数を並べた概念モデルです。段階を進めると、その段階の列を枠で囲み、まだ行っていない段階を薄く表示します。値はこの章で実行した結果ですが、実際の作業では1つの段階の中でもテストを何度も実行しています。段階2（誤り）は、記録のテストが失敗したのでコミットしていません。">
            <Stepper steps={refactorSteps} />
          </Figure>
          <p>この後の節で行う変更は、図 {figure(2)} で段階ごとに確かめられます。どの段階でも、変更の後にすべてのテストを実行し、通ってからコミットしています。段階2では一度テストが失敗し、その場で原因を直しました。1つの変更が小さいほど、失敗したときに見る差分が少なく、元に戻すのも簡単です。</p>
          <Ref n={1} />
        </>
      ),
    },
    {
      id: "extract",
      title: "最初の変更を小さくする",
      body: (
        <>
          <p>最初の変更は同じファイルの中でメソッドに名前を付けて切り出すところから始めます。Rails がいつ値を読むか、どこから保存を呼ぶかは、この変更に含めません。Fowler のカタログでは Extract Function と呼ばれる変更です<Ref n={8} />。</p>
          <Code lang="ruby" title="段階1：private メソッドへの切り出し" code={stage1Controller} />
          <p>テストは 8 例すべて通り、変更は1ファイルの26行の追加と19行の削除でした。行数は 31 行から 33 行に増え、flog の点数（後の節で説明する複雑さの目安）は 55.5 から 54.0 とほとんど変わっていません。この段階で得たのは、割引の規則が <code>discount_for</code> という名前で1か所にまとまり、次の段階で移す範囲が見えたことです。</p>
          <p>切り出したメソッドが、コントローラーのインスタンス変数や <code>params</code> を直接読むなら、別の呼び出し元から使える形にはなっていません。上の <code>save_order</code> は <code>params[:coupon_code]</code> を読んでいるので、このままではモデルへ移せません。必要な値を引数で渡す形に変えると、呼び出し元が何を用意すればよいかが分かります。</p>
          <p>呼び出し元が1つのうちは private メソッドのままで十分な場合があります。管理画面やジョブからも同じ計算を使い、同じ理由で変わると分かったら、モデルのメソッドや値オブジェクトにまとめます。利用箇所が1つのうちに設定や差し替えの仕組みを足すと、計算式にたどり着くまでに読む箇所が増えます（その例は後の「過剰な設計を元に戻す」の節で直します）。</p>
        </>
      ),
    },
    {
      id: "fat-controller",
      title: "Fat Controller を段階的に直す",
      body: (
        <>
          <p>段階2では、業務の規則をモデルへ移します。割引の計算と期限の判定は <code>Coupon</code>、在庫の確保は <code>Product</code>、注文と通知の保存は <code>Order.place!</code> に置き、コントローラーには HTTP の入力の確認と応答だけを残します。どのクラスに何を置くかの考え方は<ChapterLink n={30} section="fat-model" />と<ChapterLink n={31} section="model-api" />で扱っています。</p>
          <Code lang="ruby" title="段階2：規則をモデルへ移したコード" code={stage2Code} />
          <p>この段階で、一度誤りを入れました。<code>Coupon#discount_for</code> を書くときに、割引を浮動小数点で計算して四捨五入する形で書いたところ、記録のテストが1例失敗しました。</p>
          <Code lang="text" title="実行結果（段階2の最初の版）" code={stage2Mistake} />
          <p>999 円の 10% が元のコードの 99 円ではなく 100 円になっていました。四捨五入のほうが自然に見えても、請求額が1円変わる変更です。記録のテストがなければ、この差は経理の照合や利用者の問い合わせで見つかることになります。整数の割り算に戻し、切り捨てであることをコメントと <code>Coupon</code> のモデルのテストに書いてから、段階2をコミットしました。</p>
          <Code lang="text" title="実行結果（段階2のコミット）" code={stage2Diff} />
          <p>コントローラーは空行を除いて 33 行から 15 行になり、flog の点数は 21.3 に下がりました。ただし、コントローラーとモデル3つの点数を足すと 58.3 で、段階0のコントローラー（55.5）より少し増えています。複雑さは、規則ごとのクラスに分かれて残っています。得たのは、割引の規則を直すときに読むのが <code>Coupon</code> の9行で済むことと、その規則を HTTP を通さずにモデルのテストで確かめられることです。</p>
          <p>段階3で、管理画面から CSV で注文をまとめて登録する機能が加わりました。2つ目の呼び出し元です。</p>
          <Code lang="ruby" title="段階3：一括登録も同じ Order.place! を呼ぶ" code={stage3Code} />
          <p>一括登録のテストを足して 12 例が通りました。2つ目の呼び出し元ができても、注文を作る手順は <code>Order.place!</code> の1か所にあるので、新しく Service Object を作る必要はありませんでした。複数のモデルにまたがる手順や、外部サービスの呼び出しと失敗の扱いが加わったら、そのときに <ChapterLink n={33} section="service-contract" /> のような進行役のクラスを検討します。なお、Ruby 3.4 以降の <code>csv</code> は default gem ではないので、Bundler で動かすこのアプリでは、Gemfile に <code>gem "csv"</code> を足すまで <code>LoadError</code> になりました（実行時の警告の文による）。この章の注文の Controller と Model の改修を、どこまで分けるかという観点で判断した事例は<ChapterLink n={116} section="refactor" />にあります。</p>
        </>
      ),
    },
    {
      id: "fat-model",
      title: "Fat Model を段階的に直す",
      body: (
        <>
          <p>コントローラーを細くした後、機能追加が続いて <code>Order</code> が太りました。CSV の出力、ポイントの計算が加わり、通知は誰かが <code>after_create</code> のコールバックに移していました。<code>Order</code> は、注文の作成、CSV の形、ポイントの規則、通知という、変わる理由の違う4つを持っています。</p>
          <Code lang="ruby" title="fm0：機能追加を重ねた Order" code={fatModelCode} />
          <p>Fat Controller のときと同じく、先に記録のテストを書きました。CSV の出力は文字列全体を比べ、通知は <code>place!</code> の経路と <code>create!</code> で直接作る経路（初期データを入れる <code>db/seeds.rb</code> が使っている）の両方を確かめます。</p>
          <Code lang="ruby" title="fm0 の記録のテスト" code={fatModelSpec} />
          <p>次に、CSV の出力を <code>OrderCsv</code> に移しました（fm1）。CSV の列の追加や並べ替えの依頼は、注文の作成とは別の理由で来るからです。呼び出し元をすべて書き換えるまでは、<code>Order.to_csv</code> を <code>OrderCsv.generate</code> に委譲するだけのメソッドとして残し、呼び出し元とテストを一度に変えずに済むようにします。単一責任の原則で分ける理由の説明は<ChapterLink n={63} />にあります。</p>
          <Code lang="text" title="実行結果（fm1 と fm2）" code={fatModelRun} />
          <p>fm1 ではテストが 15 例すべて通りました。<code>Order</code> と <code>OrderCsv</code> の flog の合計は 43.3 で、fm0 の <code>Order</code>（43.2）とほぼ同じです。ここでも複雑さは移っただけで、得たのは CSV の変更で読むファイルが <code>OrderCsv</code> の13行に絞られたことです。</p>
          <p>fm2 では、<code>after_create</code> の通知を <code>place!</code> の中の明示的な呼び出しに変えようとしました。コールバックは、モデルを作るすべての経路で実行されます（<ChapterLink n={62} />）。変える前に <code>git grep</code> で注文を作る経路を探すと、<code>db/seeds.rb</code> が <code>Order.create!</code> を直接呼んでいました。変更すると、記録のテストの「<code>create!</code> で直接作っても通知が1件できる」が失敗しました。</p>
          <p>この失敗は、fm2 が振る舞いの変更であることを示しています。初期データの注文に通知が要らないなら、テストの期待値を「通知を作らない」に書き換え、コミットのメッセージに振る舞いの変更であることを書いて、別のコミットにします。この章のアプリではそうしました。<code>Order</code> の flog は 19.8 になりました。もし管理画面などで <code>create!</code> を直接呼ぶ経路が本番で使われていて、通知が要るなら、コールバックを残すのも選択です。図 {figure(3)} に、3つの段階をまとめました。</p>
          <Figure n={figure(3)} title="Fat Model を分ける段階" caption="この章のアプリで行った fm0〜fm2 をまとめた図。fm2 は振る舞いの変更なので、テストの期待値の変更と一緒に別のコミットにした。">
            <FatModelFigure />
          </Figure>
          <Ref n={10} />
        </>
      ),
    },
    {
      id: "undo-overdesign",
      title: "過剰な設計を元に戻す",
      body: (
        <>
          <p>必要のない抽象を取り除く変更も、振る舞いを変えないならリファクタリングです。次のコードは割引の計算に「将来、計算方法が増えたときのため」に Policy の基底クラス、Factory、設定ファイルを用意した例です。計算方法は今も <code>PercentPolicy</code> の1つしかありません。</p>
          <Code lang="ruby" title="実装が1つしかない Policy と Factory" code={overDesignCode} />
          <p>この構成では、割引の上限が 5000 円であることを知るために、<code>Coupon</code>、<code>PolicyFactory</code>、設定ファイル、初期化ファイル、<code>PercentPolicy</code> の5つを順に開くことになります。クラス名を設定ファイルの文字列から <code>constantize</code> で作っているので、エディターで定義へ移動する機能も使えません。計算を <code>Coupon#discount_for</code> に戻し、Policy・Factory・設定を消しました。Fowler のカタログの Inline Class と Collapse Hierarchy に当たる変更です<Ref n={8} />。</p>
          <Code lang="text" title="実行結果（過剰な構成と、元に戻した後）" code={overDesignRun} />
          <p>どちらの状態でも 15 例のテストが通り、元に戻す変更は6ファイルで26行を消して3行を足すものでした。外から観測できる振る舞いは変わっていないので、これもリファクタリングです。2つ目の計算方法が実際に必要になったら、そのときに <code>Coupon#discount_for</code> の中の分岐から始め、3つ目が来て分岐が読みにくくなったら Strategy に分けることを検討します。何個目で分けるかは目安で、<ChapterLink n={41} /> の判断基準では、方法が4つ以上あるか、今後増えることが分かっている場合を挙げています。抽象を先に作らない判断の根拠は<ChapterLink n={58} />と<ChapterLink n={76} />で扱っています。</p>
          <p>過剰な設計を戻すときに確かめることは、作るときと同じです。消すクラスを参照している箇所を <code>git grep</code> ですべて探し、設定ファイルを読む別の処理がないかを確かめ、テストを実行してから消します。Rails の場合は、オートロードで読まれるだけのファイルが残っていても動作に影響しないので、参照がなくなったファイルを消し忘れやすい点にも注意します。</p>
        </>
      ),
    },
    {
      id: "debt",
      title: "技術的負債：4象限と利息",
      body: (
        <>
          <p>技術的負債は、内部の品質に欠陥があって将来の変更が余分に難しくなっている状態を、借金に例えた言葉です。Fowler は2019年に書き直した記事で、この欠陥（cruft）のせいで新しい機能を足すときに余分にかかる手間を利息、欠陥を取り除く費用を元本の返済と説明しています<Ref n={3} />。この章の段階0のコントローラーなら、クーポンの条件を変えるたびに 31 行のアクション全体を読み、在庫や通知のコードに触れていないかを確かめる手間が利息に当たります。</p>
          <p>Fowler は2009年の記事で、負債を「意図的か無自覚か」と「無謀か慎重か」の2つの軸で4つに分けました<Ref n={2} />。図 {figure(4)} に、その4つとこの章の例を並べました。</p>
          <Figure n={figure(4)} title="技術的負債の4象限" caption="Fowler の Technical Debt Quadrant をもとにした模式図。例は本書で添えたもの。">
            <QuadrantFigure />
          </Figure>
          <p>4象限は、負債を負うときの判断を区別するための分け方です。締め切りが近く、利用者への影響が小さいときに、重複を残して出荷するのは「意図的・慎重」な負債です。その場合は、どの変更に費用がかかるのか、いつ見直すのか、放置するとどんな誤りが起きうるのかを記録します。「無自覚・慎重」な負債は、作った後で良い分け方に気づいたもので、経験を積んだチームでも必ず生まれます。</p>
          <p>返す順序は利息の大きさで決めます。Fowler は、欠陥があっても安定していて変更しないコードはそのままにしてよく、変更の多い箇所では欠陥を許さない姿勢が要ると書いています<Ref n={3} />。読みにくくてもほとんど変更しないコードと、毎週仕様が変わって判断を誤りやすいコードを同じ順序で直す必要はありません。見積もりの目安として、次の3つを掛け合わせて比べる方法があります。</p>
          <ul>
            <li>その箇所を変更する頻度（月に何回か）</li>
            <li>1回の変更で余分にかかる手間（読む範囲、確かめるテスト、過去に起きた誤り）</li>
            <li>返済の費用と危険（記録のテストを書く手間、影響する呼び出し元の数）</li>
          </ul>
          <p>どれも正確には測れないので、比べる目的に使い、絶対値として扱いません。変更の頻度は次の節の方法で履歴から数えられます。余分な手間は直近の変更でかかった時間や、レビューで指摘された誤りから見積もります。</p>
          <p>共通に見える処理でも、一般会員向けと法人向けとで今後違う条件が加わるかもしれません。将来の違いに備えて分岐の多い共通クラスを作ると、片方の修正がもう片方に影響します。現時点で共通と分かっている規則だけを共有し、変わる理由が異なる規則は別々の場所に置きます（<ChapterLink n={60} />）。</p>
        </>
      ),
    },
    {
      id: "metrics",
      title: "変更頻度と複雑さで候補を探す",
      body: (
        <>
          <p>どのファイルから直すかを、変更の履歴から探す方法があります。Michael Feathers は、ファイルごとの変更の回数（churn）と複雑さを2つの軸にとって並べる方法を提案しました。Ruby では、複雑さを flog で、変更の回数を git の履歴で数える使い方が紹介されています<Ref n={6} />。flog は、代入・分岐・メソッド呼び出しの数に Ruby 向けの重みを付けた ABC の指標で点数を出す gem で、README は点数が高いほど苦痛（pain）の大きいコードだと説明しています<Ref n={7} />。</p>
          <p>次のスクリプトは <code>git log</code> でファイルごとのコミット数を数え<Ref n={9} />、flog の点数と掛け合わせて並べます。この章では、段階0のコントローラー、段階2のモデル、管理画面の集計コントローラー（分岐が多いがほとんど変えない）、会員のモデル（単純だがよく変える）などを置いたリポジトリに、57 回のコミットを作って実行しました。コミットは、ファイルごとに回数を決めてコメントを1行足したもので、実在のプロジェクトの履歴ではありません。</p>
          <Code lang="ruby" title="hotspots.rb（flog 4.10.0）" code={hotspotScript} />
          <Code lang="text" title="実行結果" code={hotspotOutput} />
          <Figure n={figure(5)} title="変更頻度と複雑さ" caption="上の実行結果を散布図にしたもの。履歴はこの章で用意したもので、実在のプロジェクトの値ではない。">
            <HotspotFigure />
          </Figure>
          <p>積がもっとも大きいのは <code>orders_controller.rb</code>（19 回 × 55.5）でした。<code>admin/reports_controller.rb</code> は flog の点数が 52.1 と高いものの、コミットが3回しかないので順位は3番目です。<code>user.rb</code> は16回変更されていますが、点数が 5.6 と低く、変更のたびに読む手間が小さいことを示しています。図 {figure(5)} の右上にあるファイルが、利息を多く払っている候補です。</p>
          <p>この指標には限界があります。</p>
          <ul>
            <li>コミットの回数は変更の大きさを区別しません。この章の履歴のようにコメントを1行足しただけのコミットも、仕様を変えたコミットも1回です。書式を整えただけのコミットや、自動生成のファイルの更新も数えます。</li>
            <li>ファイルの移動や名前の変更で履歴が途切れます。<code>git log --follow</code> は1ファイルずつしか追えません。また、複数のコミットを1つにまとめて取り込む運用では、回数が少なく出ます。</li>
            <li>flog は読みにくさの目安で、誤りの起きやすさや業務上の重要さは測りません。段階2の例のように、クラスに分けると1ファイルの点数は下がっても、合計は下がらないことがあります。</li>
            <li>指標を目標にすると、数値を下げるための分割が始まります。点数を下げること自体を目的にせず、候補を挙げるために使い、実際に直すかは、不具合の記録、変更にかかった時間、業務上の重要さと合わせて判断します。</li>
          </ul>
          <p>計測の考え方そのものは<ChapterLink n={90} />でも扱っています。</p>
        </>
      ),
    },
    {
      id: "strangler",
      title: "大きな書き換えと段階的な置き換え（Strangler Fig）",
      body: (
        <>
          <p>負債が大きくなると、「一から作り直したい」という提案が出ます。大きな書き換えは旧システムを動かしながら新システムを別に作り、完成したら一度に切り替える進め方です。Fowler は、大きなシステムを単純に置き換える計画はたいてい失敗に終わってきたこと、置き換えには長い時間がかかり、その間も利用者は新しい機能を待てないことを挙げています<Ref n={4} />。書き換えの間も旧システムに機能が足され、切り替えの直前に、その差分を新システムに移す作業が集中します。</p>
          <p>その代わりに Fowler が勧めるのが、<Term en="Strangler Fig">Strangler Fig</Term>（絞め殺しのイチジク）と名付けた段階的な置き換えです。新しい機能を旧コードの上に、旧コードとは分けて作り、旧システムの振る舞いを少しずつ新しいコードへ移していきます。早い段階から利用者に価値が届き、投資と効果が少しずつ見える形で進みます。その代わり、新旧を共存させるための一時的なコード（移行のための構造）が必要で、置き換えが終われば消します<Ref n={4} />。</p>
          <Figure n={figure(6)} title="大きな書き換えと段階的な置き換え（段階送り）" caption="2つの進め方を時間の流れで比べた概念モデルです。段階を進めると、段階的な置き換えの今の段階を強調し、まだ行っていない段階を薄く表示します。段階の分け方と割合は一例で、件数はこの節の実行で1万件の注文 ID を判定した結果です。実際の置き換えでは段階ごとにかかる期間が違い、図の横の長さは期間の長さを表しません。">
            <Stepper steps={stranglerSteps} />
          </Figure>
          <p>Rails のアプリでは、置き換えの単位をルーティング、コントローラーのアクション、モデルのメソッドのどれにもできます。ここでは、割引の計算を新しい規則のモジュールに置き換える場面で、2つの仕組みを作りました。1つは、古い計算の結果を返しながら新しい計算も実行し、食い違いを記録する仕組みです。もう1つは、注文 ID ごとに新しい計算へ回す割合を決める切り替えです。</p>
          <Code lang="ruby" title="新旧を比べる仕組みと、割合で切り替える仕組み" code={shadowCode} />
          <Code lang="text" title="実行結果（bin/rails runner）" code={shadowOutput} />
          <p>8,000 通りのうち 4,000 通りで結果が食い違いました。新しい規則は端数を四捨五入し、古い規則は切り捨てるからです。比べている間も呼び出し元には古い結果を返しているので、利用者への影響はありません。この食い違いが意図した仕様の変更なら、経理や利用者への告知と合わせて切り替え、意図していないなら新しいコードを直します。切り替えは CRC32 で注文 ID を 100 に分けて判定しているので、同じ ID はいつも同じ側に入り、割合を 0 に戻せばすべての注文が古い計算に戻ります。10% にすると 1 万件のうち 1,011 件が新しい計算に回りました。</p>
          <p>段階的な置き換えにも費用があります。比べる仕組みは新旧の両方を実行するので処理が増え、外部への送信や DB への書き込みを伴う処理は二重に実行できません（その場合は書き込まない方の結果だけを比べるか、読み取りだけを比べます）。新旧が並ぶ期間が長引くと、両方を保守する手間が続きます。消す日を決め、100% に切り替えた後に旧コード、比較の仕組み、切り替えの設定を消すところまでを計画に入れます。</p>
          <p>大きな書き換えを選ぶ理由があるのは、旧システムの言語やフレームワークがサポートを終えて部分的に動かす手段がない、旧システムの振る舞いのほとんどを捨てる、といった場合です。それでも、記録のテストで旧システムの振る舞いを先に洗い出しておくと、新システムで何を保つかを決められます。</p>
        </>
      ),
    },
    {
      id: "batch",
      title: "背景処理を含む変更を小さく配布する",
      body: (
        <>
          <p>注文の作成をコントローラーからモデルやジョブへ移すときは、すでに登録されているジョブも調べます。たとえば古いジョブの引数に割引済みの金額が入っていて、新しいジョブがその値を割引前の金額として扱うと、割引が二重に適用されます。配布の直前に登録されたジョブは、新しいコードで実行されます。古い形式のジョブが残っている間は、引数の意味と古い呼び出しでの振る舞いを保つ必要があります（ジョブの仕組みは<ChapterLink n={18} />）。</p>
          <p>最初の配布では古い形式の引数を受け取るクラスを残し、その中から新しい共通の計算を呼びます。新しい形式のジョブに移す場合は、古い形式で登録したジョブがすべて終わったことを確かめてから、古いクラスを消します。ジョブの引数を変える変更と、割引額の仕様を変える変更を別々に配布すると、失敗したときにどこまで戻せばよいかが分かります。古い呼び出し方を残しながら移る手順は<ChapterLink n={92} />で扱っています。</p>
          <p>通常の入力で値引きの額を比べるテストに加え、すでに作られた注文や、再試行されたジョブも確かめます。リファクタリングの前から重複実行で通知を二重に送っていたなら、構造を移しただけでは直りません。通知を一度だけ送る仕組みは、別の変更として設計します（<ChapterLink n={83} />）。</p>
        </>
      ),
    },
    {
      id: "review",
      title: "変更の前後をレビューする",
      body: (
        <>
          <p>レビューでは次のことを確かめます。</p>
          <ul>
            <li>変更の前と後で同じテストを実行したか。記録のテストの期待値を変えたなら、それは振る舞いの変更として説明されているか。</li>
            <li>1つのコミットの目的が1つか。構造の変更と振る舞いの変更が混ざっていないか。</li>
            <li>通信、保存、通知の順序やトランザクションの範囲を変えていないか。</li>
            <li>コールバック、<code>default_scope</code>、ジョブなど、呼び出し元から見えない経路の振る舞いを変えていないか（fm2 の例）。</li>
            <li>消したクラスやメソッドを参照する箇所が残っていないか。</li>
          </ul>
          <p>クラス名の変更と DB の変更が同時に必要なら、互換性を保つ DB の変更を先に行い、古いコードや列は後で消します（<ChapterLink n={27} />）。互換性を保つ期間に問題が見つかれば、古いコードに戻して処理を続けられます。</p>
          <p>設計の変更には確かめられる目標を置きます。たとえば「割引の条件を変えるとき、<code>Coupon</code> とそのテストだけを直せば済む」なら、次の仕様変更で確かめられます。「クラスを増やす」「flog の点数を下げる」だけを目標にすると、仕様を追う作業が実際に減ったかを判断できません。</p>
        </>
      ),
    },
    {
      id: "decision",
      title: "判断基準とトレードオフ",
      body: (
        <>
          <p>この章で行った変更を、選ぶ条件と費用で整理します。表の判断は本書の評価です。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th scope="col">手段</th><th scope="col">選ぶ条件</th><th scope="col">見送る条件</th><th scope="col">費用</th></tr>
              </thead>
              <tbody>
                <tr><th scope="row">記録のテスト</th><td>今の振る舞いがテストに書かれていない箇所を直す</td><td>捨てる予定のコード</td><td>今の振る舞いを調べる時間。誤りも記録される</td></tr>
                <tr><th scope="row">メソッドの切り出し</th><td>1つのメソッドに理由の違う処理が混ざっている</td><td>呼び出し元が1つで、ほとんど変更しない</td><td>小さい。読む場所が少し増える</td></tr>
                <tr><th scope="row">モデルへの移動</th><td>規則を別の呼び出し元からも使う、HTTP なしで確かめたい</td><td>画面だけの都合の処理</td><td>クラスごとのテスト。複雑さの合計は減らない</td></tr>
                <tr><th scope="row">過剰な設計を戻す</th><td>実装が1つの抽象、使われない設定がある</td><td>2つ目の実装が近く確実に来る</td><td>参照の洗い出し</td></tr>
                <tr><th scope="row">段階的な置き換え</th><td>動いているシステムの一部を新しくする</td><td>旧システムを部分的に動かす手段がない</td><td>新旧の比較と切り替えのコード、並行の保守</td></tr>
              </tbody>
            </table>
          </div>
          <p>実務で迷ったら、次の順に考えます。まず、次に来る変更の依頼を具体的に1つ挙げ、その変更で今どこを読み、何を確かめるかを書き出します。それが重いなら、その箇所だけに記録のテストを書き、変更を簡単にするリファクタリングをしてから、依頼の変更をします。Kent Beck の「まず変更を簡単にし、それから簡単な変更をする」という進め方です（<ChapterLink n={86} section="meaning" />）。変更の依頼が来ていない箇所は、変更頻度と複雑さの候補に挙がっていても、利息を払っていないので後回しにできます。</p>
          <p>関連する章：<ChapterLink n={30} section="fat-model" />、<ChapterLink n={33} />、<ChapterLink n={59} />、<ChapterLink n={62} />、<ChapterLink n={63} />、<ChapterLink n={86} />、<ChapterLink n={90} />、<ChapterLink n={92} />、<ChapterLink n={108} />、<ChapterLink n={116} />。</p>
          <Callout kind="note" title="この章の実行環境">
            <p>コードは Docker の ruby:4.0 イメージ（Ruby 4.0.9）で、Rails 8.1.4.1 の <code>rails new --minimal</code> で作ったアプリに rspec-rails 8.1.0、csv、flog 4.10.0 を入れて実行しました。DB は SQLite 3 です。各段階は git のコミットにして、<code>git diff --stat</code> で変更の大きさを確かめています。</p>
          </Callout>
        </>
      ),
    },
  ],
  sources: [
    {
      title: "Refactoring",
      publisher: "Martin Fowler",
      url: "https://martinfowler.com/books/refactoring.html",
      accessed: "2026-11-27",
      version: "第2版",
      note: "外から観測できる振る舞いを保って内部の構造を変える作業としてのリファクタリング。",
    },
    {
      title: "Technical Debt Quadrant",
      publisher: "Martin Fowler（bliki）",
      url: "https://www.martinfowler.com/bliki/TechnicalDebtQuadrant.html",
      accessed: "2026-11-27",
      version: "2009年",
      note: "技術的負債を意図的か無自覚か、無謀か慎重かの2軸で分ける4象限。",
    },
    {
      title: "Technical Debt",
      publisher: "Martin Fowler（bliki）",
      url: "https://martinfowler.com/bliki/TechnicalDebt.html",
      accessed: "2026-11-27",
      version: "2019年5月21日（2003年の記事を書き直したもの）",
      note: "内部の品質の欠陥（cruft）、機能を足すときに余分にかかる手間を利息、欠陥を取り除くことを元本の返済とする説明。安定していて変更しない箇所はそのままにしてよく、変更の多い箇所では欠陥を許さないこと。",
    },
    {
      title: "Strangler Fig Application",
      publisher: "Martin Fowler（bliki）",
      url: "https://martinfowler.com/bliki/StranglerFigApplication.html",
      accessed: "2026-11-27",
      version: "2024年8月22日版",
      note: "大きな置き換えの計画がたいてい失敗してきたこと、新しい機能を旧コードの上に分けて作り振る舞いを少しずつ移すこと、早い段階で価値が届くこと、新旧を共存させる一時的なコードが必要で後で消すこと。",
    },
    {
      title: "Working Effectively with Legacy Code",
      publisher: "Michael Feathers / Pearson（InformIT の書籍ページ）",
      url: "https://www.informit.com/store/working-effectively-with-legacy-code-9780131177055",
      accessed: "2026-11-27",
      version: "2004年9月22日刊",
      note: "意図せずアプリケーションを変えていないことを確かめるテストを書く手法。characterization test という用語は同書による（書籍ページの説明には用語は出てこない）。",
    },
    {
      title: "Watch for Turbulence",
      publisher: "Mike Burns（thoughtbot blog）",
      url: "https://thoughtbot.com/blog/watch-for-turbulence",
      accessed: "2026-11-27",
      version: "2012年2月24日（2016年7月20日更新）",
      note: "Michael Feathers の、複雑さと変更の回数を並べてリファクタリングの重要さを判断する方法。Ruby では複雑さを flog、変更の回数を git で数えること。数値は人の判断の代わりにならないこと。",
    },
    {
      title: "flog 4.10.0",
      publisher: "seattlerb（rubygems.org）",
      url: "https://rubygems.org/gems/flog/versions/4.10.0",
      accessed: "2026-11-27",
      version: "flog 4.10.0",
      note: "点数が高いほど読みにくいコードとする説明（README）。lib/flog.rb の21〜22行目で、代入・分岐・条件の ABC の指標に Ruby 向けの調整を加えて計算すると書かれていること。",
    },
    {
      title: "Catalog of Refactorings",
      publisher: "Martin Fowler（refactoring.com）",
      url: "https://refactoring.com/catalog/",
      accessed: "2026-11-27",
      version: "第2版のカタログ",
      note: "Extract Function、Move Function、Inline Class、Collapse Hierarchy などの名前。",
    },
    {
      title: "git-log",
      publisher: "Git Documentation",
      url: "https://git-scm.com/docs/git-log",
      accessed: "2026-11-27",
      note: "--name-only、--format、--follow。",
    },
    {
      title: "Active Record Callbacks",
      publisher: "Ruby on Rails Guides",
      url: "https://guides.rubyonrails.org/v8.1/active_record_callbacks.html",
      accessed: "2026-11-27",
      version: "Rails 8.1",
      note: "after_create がレコードを作るたびに実行されること。",
    },
  ],
}

export default chapter
