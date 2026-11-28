import { useState } from 'react'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'
import { FigureChoices } from '../visuals/study-figure'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 48-1 注文の確定と一覧の検索で呼ばれるクラス ---------- */
function ClassMapFigure() {
  return (
    <Svg
      id="48-1"
      w={780}
      h={330}
      label="注文の確定では、OrdersController が CheckoutForm（Form Object）で入力を検証し、Orders::Place（Service Object）を呼ぶ。Orders::Place は Order・Product・Coupon のモデル、割引を計算する DiscountCalculator（Domain Service）、決済の Payments::Gateway（Adapter）を呼ぶ。モデルは MySQL に保存し、Adapter は外部の決済サービスを呼ぶ。金額はモデルと DiscountCalculator の両方が Money（Value Object）で表す。一覧の検索では、コントローラーが RepeatCustomersQuery（Query Object）を使って MySQL を検索する"
    >
      <T x={20} y={20} fs={12} tone="muted">
        注文の確定（左から順に呼ぶ）
      </T>
      <Box x={20} y={34} w={170} h={56} lines={['OrdersController', '入力の受け取りと応答']} fs={12.5} bold subTone="muted" />
      <Arrow x1={190} y1={62} x2={223} y2={62} />
      <Box x={225} y={34} w={180} h={56} lines={['CheckoutForm', 'Form Object：入力の検証']} fs={12.5} bold subTone="muted" />
      <Arrow x1={405} y1={62} x2={438} y2={62} />
      <Box x={440} y={34} w={320} h={56} lines={['Orders::Place', 'Service Object：手順・トランザクション']} fs={12.5} bold fill="box5" subTone="muted" />

      <Arrow x1={480} y1={90} x2={360} y2={148} />
      <Arrow x1={560} y1={90} x2={540} y2={148} />
      <Arrow x1={700} y1={90} x2={700} y2={148} />
      <Box x={260} y={150} w={180} h={56} lines={['Order・Product・Coupon', 'モデル：状態と規則']} fs={12.5} bold subTone="muted" />
      <Box x={460} y={150} w={150} h={56} lines={['DiscountCalculator', 'Domain Service']} fs={12.5} bold subTone="muted" />
      <Box x={630} y={150} w={140} h={56} lines={['Payments::Gateway', 'Adapter']} fs={12.5} bold subTone="muted" />

      <Arrow x1={350} y1={206} x2={350} y2={258} />
      <Arrow x1={440} y1={200} x2={472} y2={260} dashed />
      <Arrow x1={535} y1={206} x2={535} y2={258} />
      <Arrow x1={700} y1={206} x2={700} y2={258} />
      <Box x={260} y={260} w={180} h={50} lines={['MySQL']} fs={12.5} fill="box4" />
      <Box x={460} y={260} w={150} h={50} lines={['Money', 'Value Object']} fs={12.5} bold subTone="muted" />
      <Box x={630} y={260} w={140} h={50} lines={['決済サービス', '外部の API']} fs={12.5} fill="box4" subTone="muted" />

      <T x={20} y={132} fs={12} tone="muted">
        一覧の検索
      </T>
      <Arrow x1={105} y1={90} x2={105} y2={148} />
      <Box x={20} y={150} w={200} h={56} lines={['RepeatCustomersQuery', 'Query Object：検索']} fs={12.5} bold subTone="muted" />
      <Arrow d="M105,206 L105,285 L258,285" />
    </Svg>
  )
}

/* ---------- 図 48-2 トランザクションの中で return した場合と、例外を外で変換した場合 ---------- */
function TxResultFigure() {
  type Step = { t: string; fill: 'box' | 'box5' | 'bg'; dashed?: boolean }
  const col = (x: number, title: string, steps: Step[], result: string[], tone: 'danger' | 'acc') => (
    <g>
      <T x={x} y={22} bold fs={12.5}>
        {title}
      </T>
      {steps.map((s, i) => (
        <g key={i}>
          <Box x={x} y={36 + i * 46} w={320} h={34} lines={s.t} fs={12} fill={s.fill} dashed={s.dashed} />
          {i < steps.length - 1 && <Arrow x1={x + 160} y1={70 + i * 46} x2={x + 160} y2={80 + i * 46} />}
        </g>
      ))}
      <Box x={x} y={320} w={320} h={50} lines={result} fs={12} fill="bg" subTone={tone} />
    </g>
  )
  return (
    <Svg
      id="48-2"
      w={760}
      h={384}
      label="左：トランザクションの中で在庫不足を見つけて return すると、BEGIN、注文の UPDATE、商品 A の在庫の UPDATE の後に COMMIT され、注文は placed、A の在庫は 3 で確定した。戻り値は失敗の結果だった。右：在庫不足で例外 OutOfStock を投げると ROLLBACK され、トランザクションの外の rescue で失敗の結果に変えた。注文は draft、A の在庫は 5 のままだった"
    >
      {col(
        20,
        'トランザクションの中で return した',
        [
          { t: 'BEGIN', fill: 'box' },
          { t: 'UPDATE orders（status を placed に）', fill: 'box' },
          { t: 'UPDATE products（A の在庫 5 → 3）', fill: 'box' },
          { t: 'B の在庫不足 → return 失敗の結果', fill: 'box5' },
          { t: 'ブロックを抜ける', fill: 'box' },
          { t: 'COMMIT', fill: 'bg', dashed: true },
        ],
        ['注文は placed、A の在庫は 3 で確定', '戻り値は Result（:out_of_stock）'],
        'danger',
      )}
      {col(
        420,
        '例外を投げ、外で結果に変えた',
        [
          { t: 'BEGIN', fill: 'box' },
          { t: 'UPDATE orders（status を placed に）', fill: 'box' },
          { t: 'UPDATE products（A の在庫 5 → 3）', fill: 'box' },
          { t: 'B の在庫不足 → raise OutOfStock', fill: 'box5' },
          { t: 'ROLLBACK', fill: 'box' },
          { t: 'rescue（トランザクションの外）', fill: 'box5' },
        ],
        ['注文は draft、A の在庫は 5 のまま', '戻り値は Result（:out_of_stock）'],
        'acc',
      )}
    </Svg>
  )
}

/* ---------- 図 48-3 return と例外で、確定する値を段階ごとに比べる（操作できる図） ---------- */
type TxCell = { c: string; p?: string }
type TxSnap = { label: string; order: TxCell; a: TxCell; b: TxCell; kind: 'SQL' | 'Ruby' | '戻り値'; code: string; warn?: boolean; text: string }

const TX_EXITS = ['return で失敗の結果を返す（PlaceReturningInside）', '例外を発生させる（Place）'] as const
const TX_STOCKS = ['0 個（足りない）', '1 個（足りる）'] as const

function txSteps(raise: boolean, short: boolean): TxSnap[] {
  const b0 = short ? '0' : '1'
  const draft = { c: 'draft' }
  const placed = { c: 'draft', p: 'placed' }
  const a3 = { c: '5', p: '3' }
  const steps: TxSnap[] = [
    { label: 'BEGIN', order: draft, a: { c: '5' }, b: { c: b0 }, kind: 'SQL', code: 'BEGIN', text: 'ApplicationRecord.transaction がトランザクションを始めます。' },
    { label: '注文を placed にする', order: placed, a: { c: '5' }, b: { c: b0 }, kind: 'SQL', code: "UPDATE orders SET status = 'placed'", text: 'order.update! が注文の行を更新します。コミットするまで、ほかの接続からは draft のままに見えます。' },
    { label: 'A の在庫を減らす', order: placed, a: a3, b: { c: b0 }, kind: 'SQL', code: 'UPDATE products SET stock = 3', text: '商品 A は在庫 5 に対して2個なので足ります。在庫を 3 にします。' },
  ]
  if (!short) {
    steps.push(
      { label: 'B の在庫を減らす', order: placed, a: a3, b: { c: '1', p: '0' }, kind: 'SQL', code: 'UPDATE products SET stock = 0', text: '商品 B は在庫 1 に対して1個なので足ります。在庫を 0 にします。' },
      { label: 'COMMIT', order: { c: 'placed' }, a: { c: '3' }, b: { c: '0' }, kind: 'SQL', code: 'COMMIT', text: 'ブロックの最後まで進んだので COMMIT を送り、3つの変更が確定します。' },
      { label: '呼び出し元に返る', order: { c: 'placed' }, a: { c: '3' }, b: { c: '0' }, kind: '戻り値', code: 'OrderResult（success? = true、code = :ok）', text: raise ? 'transaction の後の OrderResult.ok(order) を返します。在庫が足りる場合は、2つの書き方の結果は同じです。' : 'ブロックの最後の OrderResult.ok(order) が transaction の戻り値になり、そのまま call の戻り値になります。在庫が足りる場合は、2つの書き方の結果は同じです。' },
    )
    return steps
  }
  steps.push(
    raise
      ? { label: 'B の在庫不足を見つける', order: placed, a: a3, b: { c: '0' }, kind: 'Ruby', code: 'raise OutOfStock', text: '商品 B は在庫 0 に対して1個なので足りません。例外 OutOfStock を発生させます。' }
      : { label: 'B の在庫不足を見つける', order: placed, a: a3, b: { c: '0' }, kind: 'Ruby', code: 'return OrderResult.failure(order, :out_of_stock, …)', text: '商品 B は在庫 0 に対して1個なので足りません。ブロックの中から return で失敗の結果を返します。' },
    raise
      ? { label: 'ROLLBACK', order: draft, a: { c: '5' }, b: { c: '0' }, kind: 'SQL', code: 'ROLLBACK', text: '例外がブロックから出たので、Rails は ROLLBACK を送ります。注文と A の在庫の変更は取り消されます。' }
      : { label: 'COMMIT', order: { c: 'placed' }, a: { c: '3' }, b: { c: '0' }, kind: 'SQL', code: 'COMMIT', text: 'Rails 8.1.4.1 のトランザクションは、例外以外の抜け方ではコミットします。return で抜けたので COMMIT を送り、注文の placed と A の在庫 3 が確定します。' },
    raise
      ? { label: '呼び出し元に返る', order: draft, a: { c: '5' }, b: { c: '0' }, kind: '戻り値', code: 'OrderResult（success? = false、code = :out_of_stock）', text: 'トランザクションの外の rescue OutOfStock が order.reload で注文を読み直し、失敗の結果を作ります。DB の値は実行前と同じです。' }
      : { label: '呼び出し元に返る', order: { c: 'placed' }, a: { c: '3' }, b: { c: '0' }, kind: '戻り値', code: 'OrderResult（success? = false、code = :out_of_stock）', warn: true, text: '戻り値は失敗の結果ですが、DB には注文の placed と A の在庫 3 が残りました。戻り値だけを見るテストではこの食い違いに気付けません。' },
  )
  return steps
}

function TxSnapshot({ i, snap }: { i: number; snap: TxSnap }) {
  const cell = (x: number, title: string, v: TxCell) => (
    <Box x={x} y={10} w={230} h={64} lines={[title, `確定した値 ${v.c}`, v.p ? `未確定の変更 ${v.p}` : '未確定の変更なし']} fs={12} bold fill={v.p ? 'box5' : 'box4'} subTone="muted" />
  )
  return (
    <Svg id={`48-3-${i}`} w={760} h={112} label={`注文の status は確定 ${snap.order.c}${snap.order.p ? `（未確定 ${snap.order.p}）` : ''}、商品 A の在庫は確定 ${snap.a.c}${snap.a.p ? `（未確定 ${snap.a.p}）` : ''}、商品 B の在庫は確定 ${snap.b.c}${snap.b.p ? `（未確定 ${snap.b.p}）` : ''}。${snap.kind}：${snap.code}`}>
      {cell(10, '注文の status', snap.order)}
      {cell(265, '商品 A の在庫', snap.a)}
      {cell(520, '商品 B の在庫', snap.b)}
      <T x={10} y={96} fs={12} tone="muted">{snap.kind}</T>
      <T x={70} y={96} fs={12} mono>{snap.code}</T>
      {snap.warn && <T x={750} y={96} fs={12} tone="danger" anchor="end">DB の値と食い違う</T>}
    </Svg>
  )
}

function TxExitFigure() {
  const [exit, setExit] = useState(0)
  const [stock, setStock] = useState(0)
  const steps = txSteps(exit === 1, stock === 0).map((snap, i) => ({
    label: snap.label,
    detail: (
      <>
        <TxSnapshot i={i + 1} snap={snap} />
        <p>{snap.text}</p>
      </>
    ),
  }))
  return (
    <Figure
      n="48-3"
      title="ブロックの抜け方と在庫を選び、確定する値を段階ごとに比べる"
      caption="上の2つの Service を、商品 B の在庫を 0 と 1 にして Rails 8.1.4.1・MySQL 8.4.13 で実行したときの SQL の順と、DB に残った値をもとにした概念モデルです。在庫を確かめる SELECT は省いています。未確定の変更はトランザクションの中でだけ見える値を表しています。"
    >
      <FigureChoices label="ブロックの抜け方" options={TX_EXITS} selected={exit} onSelect={setExit} />
      <FigureChoices label="商品 B の在庫（注文は1個）" options={TX_STOCKS} selected={stock} onSelect={setStock} />
      <Stepper key={`${exit}-${stock}`} steps={steps} />
    </Figure>
  )
}

/* ---------- 図 48-4 フォームの入力の単位と保存の単位 ---------- */
function FormMapFigure() {
  const fields = ['company_name', 'email', 'display_name', 'terms_accepted']
  return (
    <Svg
      id="48-4"
      w={760}
      h={300}
      label="RegistrationForm は company_name、email、display_name、terms_accepted の4つの入力を持つ。company_name は companies テーブルの name に、email は users テーブルの email に、display_name は profiles テーブルの display_name に保存する。terms_accepted は検証だけに使い、保存しない。3つのテーブルへの保存は1つのトランザクションで行い、保存の失敗はフォームの入力欄のエラーに戻す"
    >
      <rect x={20} y={34} width={260} height={216} rx={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={32} y={56} bold fs={12.5}>
        RegistrationForm（入力の単位）
      </T>
      {fields.map((f, i) => (
        <Box key={f} x={40} y={72 + i * 44} w={220} h={32} lines={f} fs={12} mono fill="bg" />
      ))}
      <T x={480} y={26} bold fs={12.5}>
        保存の単位（1つのトランザクション）
      </T>
      <Box x={480} y={44} w={260} h={46} lines={['companies', 'name']} fs={12.5} fill="box4" subTone="muted" />
      <Box x={480} y={112} w={260} h={46} lines={['users', 'email・company_id']} fs={12.5} fill="box4" subTone="muted" />
      <Box x={480} y={180} w={260} h={46} lines={['profiles', 'display_name・user_id']} fs={12.5} fill="box4" subTone="muted" />
      <Arrow x1={260} y1={88} x2={478} y2={67} />
      <Arrow x1={260} y1={132} x2={478} y2={135} />
      <Arrow x1={260} y1={176} x2={478} y2={203} />
      <T x={292} y={226} fs={11.5} tone="muted">
        保存しない（同意の検証だけ）
      </T>
      <Arrow d="M610,226 L610,270 L150,270 L150,252" dashed />
      <T x={380} y={290} anchor="middle" fs={11.5} tone="muted">
        保存の失敗（RecordInvalid・RecordNotUnique）を入力欄のエラーに戻す
      </T>
    </Svg>
  )
}

/* ---------- 図 48-5 Relation を返す場合と配列を返す場合 ---------- */
function RelationArrayFigure() {
  return (
    <Svg
      id="48-5"
      w={760}
      h={250}
      label="上：Query Object が Relation を返すと、呼び出し元が order と limit を足してから、ORDER BY と LIMIT を含む SQL が1回実行される。下：Query Object の中で to_a を呼ぶと、その時点で SQL が実行され、配列が返る。呼び出し元の並び替えや先頭の取り出しは Ruby のメモリー上で行われ、配列に order を呼ぶと NoMethodError になる"
    >
      <T x={20} y={24} bold fs={12.5}>
        Relation を返す
      </T>
      <Box x={20} y={36} w={180} h={56} lines={['Query Object の call', 'Relation（SQL は未実行）']} fs={12} subTone="muted" />
      <Arrow x1={200} y1={64} x2={238} y2={64} />
      <Box x={240} y={36} w={200} h={56} lines={['呼び出し元', '.order(:id).limit(20)']} fs={12} subTone="muted" />
      <Arrow x1={440} y1={64} x2={478} y2={64} />
      <Box x={480} y={36} w={170} h={56} lines={['SQL を1回実行', 'ORDER BY・LIMIT を含む']} fs={12} fill="box5" subTone="muted" />
      <Arrow x1={650} y1={64} x2={678} y2={64} />
      <Box x={680} y={36} w={60} h={56} lines={['MySQL']} fs={12} fill="box4" />

      <T x={20} y={140} bold fs={12.5}>
        配列を返す
      </T>
      <Box x={20} y={152} w={180} h={56} lines={['Query Object の call', 'to_a で SQL を実行']} fs={12} subTone="muted" />
      <Arrow x1={200} y1={180} x2={238} y2={180} />
      <Box x={240} y={152} w={200} h={56} lines={['Array', '条件に合う行をすべて読み込む']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={440} y1={180} x2={478} y2={180} />
      <Box x={480} y={152} w={260} h={56} lines={['呼び出し元', 'sort_by・first(20) は Ruby で処理']} fs={12} subTone="muted" />
      <T x={480} y={232} fs={11.5} tone="danger">
        配列に .order(:id) を呼ぶと NoMethodError
      </T>
    </Svg>
  )
}

/* ---------- 図 48-6 Adapter の先を本番とテストで替える ---------- */
function AdapterFigure() {
  const row = (y: number, label: string, provider: string[], dashed: boolean, ext: string[], extFill: 'box4' | 'bg') => (
    <g>
      <T x={20} y={y - 12} bold fs={12.5}>
        {label}
      </T>
      <Box x={20} y={y} w={150} h={56} lines={['Checkout', 'Service']} fs={12.5} bold subTone="muted" />
      <Arrow x1={170} y1={y + 28} x2={208} y2={y + 28} />
      <Box x={210} y={y} w={190} h={56} lines={['Payments::Gateway', 'Adapter']} fs={12.5} bold fill="box5" subTone="muted" />
      <Arrow x1={400} y1={y + 28} x2={438} y2={y + 28} />
      <Box x={440} y={y} w={160} h={56} lines={provider} fs={12.5} bold dashed={dashed} subTone="muted" />
      <Arrow x1={600} y1={y + 28} x2={628} y2={y + 28} dashed={dashed} />
      <Box x={630} y={y} w={140} h={56} lines={ext} fs={11.5} fill={extFill} subTone="muted" />
      <T x={305} y={y + 74} anchor="middle" fs={11} tone="muted">
        ChargeResult か Unavailable を返す
      </T>
    </g>
  )
  return (
    <Svg
      id="48-6"
      w={780}
      h={260}
      label="本番では、Checkout が Payments::Gateway を呼び、Gateway は ProviderClient を通して外部の決済サービスに依頼する。テストでは、同じ Checkout と Payments::Gateway に、決まった応答（succeeded、declined、requires_action、タイムアウト）を返す FakeProvider を渡す。どちらの場合も Gateway は ChargeResult か Unavailable を返す"
    >
      {row(40, '本番', ['ProviderClient', 'SDK への接続'], false, ['決済サービス', '外部の API'], 'box4')}
      {row(160, 'テスト', ['FakeProvider', '決まった応答を返す'], true, ['succeeded・declined', 'requires_action', 'Timeout'], 'bg')}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 33,
  part: 7,
  title: 'Service・Form・Query・Value Object と設計パターン',
  summary:
    'モデルとコントローラーの外に置くクラス（Service・Form・Query・Value Object・Adapter）を、作る条件と、引数・戻り値・失敗の契約から設計します。Strategy などの設計パターンと依存性注入も Rails の例で扱います。',
  goals: [
    'モデルとコントローラー以外にクラスを作る条件を、変更の理由と呼び出し元の数から説明できる',
    'Service Object の公開メソッド・戻り値・失敗の表し方と、トランザクションを持つ側を決められる',
    '画面の入力を Form Object、条件の多い検索を Query Object、単位のある値を Value Object に分け、ActiveModel・Relation・Data・composed_of で実装できる',
    'Domain Service と Application Service を区別し、Strategy・Null Object・Factory・Command・Event を使う時期と見送る条件を判断できる',
    '依存性注入と Adapter で外部サービスとの境界を作り、テストで差し替えられるようにできる',
  ],
  prerequisites: [10, 12, 14, 15, 16, 30],
  sections: [
    {
      id: 'extra-classes',
      title: 'モデルとコントローラーの外にクラスを作るとき',
      body: (
        <>
          <p>
            <code>bin/rails generate</code> で作れるのは、モデル・コントローラー・ビュー・ジョブ・メーラーなどです。業務の規則はモデルに、HTTP の入力と応答はコントローラーに書くのが基本ですが（<ChapterLink n={30} section="design-basics">責務分割の基本</ChapterLink>）、業務のアプリケーションでは <code>app/services</code>・<code>app/forms</code>・<code>app/queries</code> のような、Rails が作らないディレクトリもよく見かけます。この章ではそうしたクラスを作る時期と、呼び出し元との約束（引数・戻り値・失敗の表し方）を扱います。
          </p>
          <p>例として、EC サイトで注文を確定するアクションを考えます。次のコントローラーは一つのアクションの中で注文の処理をすべて行っています。</p>
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb（すべてをアクションに書いた例）"
            code={`
class OrdersController < ApplicationController
  def create
    order = current_user.orders.build(status: "placed")
    current_user.cart.items.each do |item|
      raise "在庫不足" if item.product.stock < item.quantity
      item.product.update!(stock: item.product.stock - item.quantity)
      order.items.build(product: item.product, quantity: item.quantity,
                        unit_price_cents: item.product.price_cents)
    end
    subtotal = order.items.sum { |i| i.unit_price_cents * i.quantity }
    discount = current_user.premium? ? subtotal * 5 / 100 : 0
    order.total_cents = subtotal - discount
    order.save!
    # 外部の決済サービスの SDK を直接呼ぶ
    Stripe::PaymentIntent.create(amount: order.total_cents, currency: "jpy")
    OrderMailer.placed(order).deliver_later
    redirect_to order
  end
end
`}
          />
          <p>このアクションは動きますが、次のような変更のたびに、同じメソッドを書き換えることになります。</p>
          <ul>
            <li>割引の規則が変わり、会員区分に加えてクーポンも使うようになる</li>
            <li>決済サービスを別の会社に替える。決済の結果を待たずに応答を返したくなる</li>
            <li>管理画面や API からも、同じ手順で注文を作りたくなる</li>
            <li>在庫が足りないときに、例外ではなく画面にメッセージを出したくなる</li>
          </ul>
          <p>
            また、在庫を減らす更新と注文の保存がトランザクションで囲まれていないので、途中で失敗すると在庫だけが減ります（<ChapterLink n={38} section="why-transaction" />）。
          </p>
          <p>
            最初に検討するのはモデルのメソッドです。在庫の確認と減算を <code>Product#reserve!</code>、合計の計算を <code>Order#total_cents</code> に移すだけで、アクションは短くなります。そのうえで、割引の計算が会員とクーポンにまたがる、同じ手順を画面・API・管理画面から呼ぶ、外部サービスの呼び出し方を一か所に集める、といった理由があるときに、モデルの外にクラスを作ります。よく使われる名前は次のとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">名前</th>
                  <th scope="col">受け持つこと</th>
                  <th scope="col">この章の例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Service Object</th>
                  <td>複数のモデルにまたがる手順、トランザクション、失敗の返し方</td>
                  <td>
                    <code>Orders::Place</code>（<ChapterLink n={33} section="service-contract">Service Object</ChapterLink>）
                  </td>
                </tr>
                <tr>
                  <th scope="row">Form Object</th>
                  <td>画面の入力の受け取りと検証、入力欄へのエラーの表示</td>
                  <td>
                    <code>RegistrationForm</code>（<ChapterLink n={33} section="model-form-objects">Form Object</ChapterLink>）
                  </td>
                </tr>
                <tr>
                  <th scope="row">Query Object</th>
                  <td>条件・結合・集計の多い検索</td>
                  <td>
                    <code>RepeatCustomersQuery</code>（<ChapterLink n={33} section="query-objects">Query Object</ChapterLink>）
                  </td>
                </tr>
                <tr>
                  <th scope="row">Value Object</th>
                  <td>単位や範囲のある値と、その計算</td>
                  <td>
                    <code>Money</code>・<code>DateRange</code>（<ChapterLink n={33} section="value-objects">Value Object</ChapterLink>）
                  </td>
                </tr>
                <tr>
                  <th scope="row">Domain Service</th>
                  <td>一つのモデルに属さない業務の計算</td>
                  <td>
                    <code>DiscountCalculator</code>（<ChapterLink n={33} section="domain-application-service">Domain Service</ChapterLink>）
                  </td>
                </tr>
                <tr>
                  <th scope="row">Adapter</th>
                  <td>外部サービスの SDK の呼び出しと、結果の変換</td>
                  <td>
                    <code>Payments::Gateway</code>（<ChapterLink n={33} section="adapters">Adapter</ChapterLink>）
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            どれも Rails の機能の名前ではなく、<code>ActiveRecord::Base</code> を継承しない普通の Ruby のクラス（PORO）として書きます。置き場所の候補ごとに任せるものと、<code>app/services</code> などのディレクトリがオートロードされる仕組みは、<ChapterLink n={30} section="architecture-boundaries">処理を置く場所の候補と選び方</ChapterLink>で扱いました。オートロードの対象になるのは起動時に存在するディレクトリなので、起動中に新しく作った <code>app/services</code> は、サーバーを再起動するまで読み込まれません。<Ref n={2} />
          </p>
          <Figure n="48-1" title="注文の確定と一覧の検索で呼ばれるクラス" caption="この章の例をつないだ模式図。実線の矢印は呼び出しの向き、破線は値として使うことを表す。">
            <ClassMapFigure />
          </Figure>
          <p>
            図 48-1 は、この章で扱うクラスが注文の確定と一覧の検索でどう呼ばれるかを一枚にしたものです。上の段を左から読むと、コントローラーがフォームで入力を検証し、Service Object が手順を進めます。Service Object はモデルに状態の変更を依頼し、割引の計算は Domain Service に、外部の決済は Adapter に任せます。左の Query Object は、一覧画面でコントローラーが直接使います。どのクラスも下の段だけを呼び、下の段のクラスはコントローラーやフォームを知りません。
          </p>
          <p>
            なお、37signals は Service という層を設けず、モデルが業務の操作をメソッドとして公開し、コントローラーがそれを呼ぶ書き方を基本にしています。複雑な処理は <code>app/models</code> の中の PORO に分けています。<Ref n={1} /> ディレクトリを分けるかはチームの方針ですが、どちらでも、クラスを作る理由と呼び出し元との約束を決める点は同じです。DHH の考え方は <ChapterLink n={31} section="doctrine" /> で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'service-contract',
      title: 'Service Object：作る時期と、戻り値・失敗の契約',
      body: (
        <>
          <p>
            <Term>Service Object</Term> は、一つの業務の操作（ユースケース）を最後まで進めるクラスで、<code>Orders::Place</code>（注文を確定する）や <code>Payments::Charge</code>（課金する）のように対象と操作を表す名前を付けます。
          </p>
          <p>
            取り消しが状態を <code>canceled</code> に変えるだけなら、モデルの <code>order.cancel!</code> で足ります。返金、在庫を戻す処理、発送の取り消し、操作の記録がそれぞれ失敗し得るなら、その順番と途中で失敗したときの扱いを <code>Orders::Cancel</code> にまとめます。
          </p>
          <h3>CRUD を包み直すだけのクラスは作らない</h3>
          <Code
            lang="ruby"
            title="包むこと自体が目的になった例"
            code={`
class UserCreateService
  def call(attributes)
    User.create!(attributes)
  end
end
`}
          />
          <p>
            このクラスは <code>User.create!</code> を呼ぶだけで、判断を何も受け持っていません。ここにバリデーションを移すと、CSV の取り込みや <code>rails console</code> から <code>User.create!</code> を呼ぶ経路では条件が確かめられません。CRUD ごとに機械的にクラスを作ると、変更のたびにコントローラー・Service・モデルを行き来します。ただし、操作の記録、外部のシステムの ID の払い出し、複数の呼び出し元で同じ手順をとる、といった処理を実際に受け持つなら、短くても作る理由があります。
          </p>
          <h3>公開するメソッドを call 一つにする</h3>
          <p>
            Service Object では、公開するメソッドを <code>call</code> 一つにする書き方がよく使われます。どの Service も同じ形で呼べますが、<code>call</code> は業務の意味を表さないので、何をするかはクラス名で示します。<code>OrderManager</code> のような名前では処理の内容が分かりません。手順は private メソッドに分けて構いません。
          </p>
          <Code
            lang="ruby"
            title="app/services/orders/place.rb"
            code={`
module Orders
  class Place
    class NotAuthorized < StandardError; end

    def initialize(order:, actor:)
      @order = order
      @actor = actor
    end

    def call
      raise NotAuthorized unless OrderPolicy.new(@actor, @order).place?

      @order.place!
      @order
    end
  end
end

# コントローラーから
Orders::Place.new(order: @order, actor: current_user).call
`}
          />
          <p>
            この短さなら、コントローラーから直接 <code>@order.place!</code> を呼んでも構いません。在庫の確保と決済の依頼まで含めた注文の確定は、<ChapterLink n={34} section="refactoring-stages">注文処理を段階的に育てる設計</ChapterLink>で組み立てます。<code>OrderPolicy#place?</code> はアプリで定義する認可のメソッドです（<ChapterLink n={21} section="object-authorization" />）。取り消しを許す条件が今は確定と同じ「注文した本人」でも、変わる理由が違うなら <code>cancel?</code> を別に定義します。条件が今たまたま同じことと、同じ認可の規則であることは区別します。
          </p>
          <p>
            同じ概念に属する操作が複数あるなら、<code>Reservation#confirm!</code> と <code>#release!</code> のように一つのオブジェクトのメソッドにしたほうが読みやすくなります。呼び出し方を揃えるためだけに、すべてを <code>call</code> のクラスにする必要はありません。
          </p>
          <h3>Service が持つ状態</h3>
          <p>
            Service が対象や依存先をインスタンス変数に持つのは問題ありません。区別するのは、1回の実行の間だけ使う状態と、実行をまたいで残す進行状態です。インスタンスを使い回したときに前回の <code>@errors</code> や <code>@result</code> が残らないよう、呼び出すたびに <code>new</code> するか <code>call</code> の最初で初期化します。再起動後も必要な「課金中」「返金待ち」のような状態は DB に保存し、Service を作り直しても処理を再開できるようにします。
          </p>
          <h3>どの層で何を確かめるか</h3>
          <p>
            入力の形式はフォーム、保存するレコードが常に満たす条件はモデル、実行する直前の在庫・状態・権限は Service と対象のモデルで確かめます。先に <code>valid?</code> が成功しても、その後に別のリクエストが同じ在庫を確保すれば条件は崩れるので、トランザクションの中での再確認と DB の制約を組み合わせます（<ChapterLink n={14} section="uniqueness" />、<ChapterLink n={38} section="concurrent-updates" />）。
          </p>
          <h3>戻り値と失敗の表し方</h3>
          <p>
            呼び出し元は失敗の理由によって、同じ画面に戻す、別の画面へ移る、再試行する、のどれかを選びます。そのため失敗の種類ごとに表し方を決めます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">表し方</th>
                  <th scope="col">向いている失敗</th>
                  <th scope="col">注意すること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <code>false</code> とモデル・フォームの <code>errors</code>
                  </th>
                  <td>単純な保存の失敗。同じ画面に戻して入力を直してもらう</td>
                  <td>
                    <code>false</code> だけを返して、原因を失わないようにする
                  </td>
                </tr>
                <tr>
                  <th scope="row">Result Object</th>
                  <td>在庫不足、クーポンの使用済み、入力の不備など、画面や API が分岐する失敗</td>
                  <td>成功なのにエラーがある、のような矛盾した組み合わせを作らない。何でも入る Hash にしない</td>
                </tr>
                <tr>
                  <th scope="row">業務の例外</th>
                  <td>
                    発送できない状態での <code>ship!</code> など、続けられない操作
                  </td>
                  <td>呼び出し元の境界で、その例外のクラスだけを捕まえて応答に変える</td>
                </tr>
                <tr>
                  <th scope="row">基盤の例外</th>
                  <td>DB の接続障害、プログラムの誤り、分類していない SDK の障害</td>
                  <td>まとめて「入力が不正」に変えない。監視・再試行・調査に回す</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            在庫不足のように呼び出し元が分岐する失敗は、結果を表すオブジェクト（<Term>Result Object</Term>）で返せます。Ruby 3.2 で追加された <code>Data</code> を使うと、決まった項目だけを持つ読み取り専用のクラスを短く書けます（性質は <ChapterLink n={33} section="value-objects">Value Object の節</ChapterLink>で確かめます）。<Ref n={8} />
          </p>
          <Code
            lang="ruby"
            title="注文の確定の結果を表すクラス"
            code={`
OrderResult = Data.define(:order, :code, :errors) do
  def self.ok(order) = new(order:, code: :ok, errors: {})
  def self.failure(order, code, message) = new(order:, code:, errors: { base: [message] })

  def success? = code == :ok
end
`}
          />
          <p>
            <code>code</code> が取り得る値と、それぞれのときに <code>errors</code> に何が入るかも契約として決めます。<code>ok</code> と <code>failure</code> からだけ作るようにすると、成功なのに <code>errors</code> がある結果を作りにくくなります。
          </p>
          <h3>トランザクションの中で失敗の結果を返さない</h3>
          <p>
            Result Object を返すときは、トランザクションとの組み合わせに注意します。次の2つの Service は注文を <code>placed</code> にし、明細ごとに在庫を減らします。前者はブロックの中から <code>return</code> で失敗の結果を返し、後者は例外を投げてトランザクションの外で結果に変えます。
          </p>
          <Code
            lang="ruby"
            title="在庫不足を結果で返す2つの書き方"
            code={`
module Orders
  class OutOfStock < StandardError; end

  # 誤り：トランザクションの中で失敗の結果を返す
  class PlaceReturningInside
    def call(order)
      ApplicationRecord.transaction do
        order.update!(status: "placed")
        order.items.each do |item|
          if item.product.stock < item.quantity
            return OrderResult.failure(order, :out_of_stock, "在庫が不足しています")
          end
          item.product.update!(stock: item.product.stock - item.quantity)
        end
        OrderResult.ok(order)
      end
    end
  end

  # 例外でロールバックし、トランザクションの外で結果に変える
  class Place
    def call(order)
      ApplicationRecord.transaction do
        order.update!(status: "placed")
        order.items.each do |item|
          raise OutOfStock if item.product.stock < item.quantity
          item.product.update!(stock: item.product.stock - item.quantity)
        end
      end
      OrderResult.ok(order)
    rescue OutOfStock
      order.reload
      OrderResult.failure(order, :out_of_stock, "在庫が不足しています")
    end
  end
end
`}
          />
          <p>
            商品 A（在庫5）を2個、商品 B（在庫0）を1個注文した状態で、それぞれを MySQL 8.4 上で実行し、DB に残った値を読み直しました。
          </p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4.13）"
            code={`
PlaceReturningInside: success?=false code=out_of_stock  注文の status(DB)=placed  商品 A の在庫(DB)=3
Place:                success?=false code=out_of_stock  注文の status(DB)=draft   商品 A の在庫(DB)=5
`}
          />
          <p>
            どちらも同じ失敗の結果を返しましたが、前者では注文が <code>placed</code> になり、商品 A の在庫も3に減ったまま確定しました。Rails 8.1.4.1 のトランザクションは、ブロックから例外が出たときだけロールバックし、それ以外の抜け方ではコミットします。<code>return</code>・<code>break</code>・<code>throw</code> で抜けたときにロールバックしていた古い動作は、Rails 7.2 で削除されました。<Ref n={5} />
            <Ref n={6} /> 途中まで保存した後の業務の失敗は、専用の例外でロールバックさせ、外側で Result に変えます。
          </p>
          <Figure n="48-2" title="トランザクションの中で return した場合と、例外を外で結果に変えた場合" caption="上の実行で DB に送られた操作の順を並べた模式図。">
            <TxResultFigure />
          </Figure>
          <p>
            図 48-2 は2つの実行で DB に送られた操作を順に並べたものです。左は失敗を見つけた後にブロックを抜けたためコミットされ、右は例外でロールバックしてから結果を作っています。戻り値は同じなので、テストでは戻り値だけでなく DB に残った行も確かめます。
          </p>
          <p>
            図 48-3 ではブロックの抜け方と商品 B の在庫を選び、SQL を1つ送るごとに確定した値と未確定の変更がどう変わるかを確かめられます。在庫が足りる場合はどちらの書き方も同じ順で COMMIT し、違いが出るのは途中で失敗を見つけたときだけです。
          </p>
          <TxExitFigure />
          <p>
            反対に、<code>rescue StandardError</code> ですべてを失敗の結果に変えると、DB の接続障害やプログラムの誤りまで「入力の誤り」として画面に返します。捕まえるのは、Service が意味を知っている例外（ここでは <code>OutOfStock</code>）だけにします。
          </p>
          <h3>トランザクションを持つ側と、Service 同士の呼び出し</h3>
          <p>
            どこまでを一緒に確定させるかは、いちばん外側の Service が決めます。<code>Product#reserve!</code> や <code>Coupon#redeem!</code> のような下位の操作は自分の条件（在庫が負にならない、クーポンを二重に使わない）を守り、HTTP や画面のことは知りません。Service から <code>update!(status: "shipped")</code> を並べて、モデルの状態遷移の規則を迂回しないようにします。
          </p>
          <p>
            Service から別の Service を呼ぶのも禁止ではなく、決済のように複数の操作で使う下位の処理なら有効です。ただし <code>Orders::Create</code> → <code>Users::Update</code> → <code>Orders::Recalculate</code> → <code>Orders::Create</code> のような循環や、深い呼び出しの連なりは避けます。下位のクラスがいつコミットし、いつジョブを投入するかも契約に含めます（<ChapterLink n={15} section="nested" />、<ChapterLink n={18} section="transaction" />）。別の Service を丸ごと再利用するより、両方が使うモデルの小さな操作を共有したほうがよい場合もあります。
          </p>
          <p>
            業務の操作を呼び出し元から独立させる MSDP の Use Case は、Rails では Service Object を使って実装できます。例えば、<code>Orders::Place</code> が注文を確定する1つの Use Case を表します。計算だけを担当する <code>DiscountCalculator</code> も独立したクラスですが、取引全体を進める責務はありません。操作の順序や入出力をどう決めるかは、参加申し込みを題材にした <ChapterLink n={44} /> で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'model-form-objects',
      title: 'Form Object：入力の単位と保存の単位を分ける',
      body: (
        <>
          <p>
            画面のフォームが送る値の組（入力の単位）と、DB に保存するレコード（保存の単位）は、いつも一致するとは限りません。<Term>Form Object</Term> は、一つの画面の入力を受け取って検証し、入力欄にエラーを表示し、保存の処理に渡すクラスです。
          </p>
          <h3>Form Object を作らなくてよい場合</h3>
          <p>
            利用者が自分の名前を変える画面なら、<code>User</code> のバリデーションと <code>form_with model: @user</code> で足ります（<ChapterLink n={16} section="form" />）。確認欄や規約への同意だけなら、DB の列を持たない属性（仮想属性）をモデルに加える方法もあります。所有するプロフィールを一緒に編集するだけなら <code>accepts_nested_attributes_for</code> を検討し、追加・削除できる範囲と認可を決めます（<ChapterLink n={16} section="nested-form" />）。
          </p>
          <h3>画面ごとの条件をモデルに入れない</h3>
          <p>
            Form Object が役立つのは、たとえば「新規登録では会社名が必須だが、<code>User</code> を保存するたびに必要なわけではない」場合です。登録画面のためだけに <code>User</code> に条件のフラグを増やす前に、画面の入力の検証をフォームのクラスに分けます。<code>ActiveModel::Model</code> を include すると、テーブルのないクラスでもバリデーションと <code>errors</code> を使え、<code>form_with</code> に Active Record のオブジェクトと同じように渡せます。<code>ActiveModel::Attributes</code> の <code>attribute</code> は型の変換と既定値を加えます。<Ref n={3} />
          </p>
          <h3>会社・利用者・プロフィールを1回の登録で作る</h3>
          <p>
            次の例では、要件を「登録ごとに新しい会社を作り、利用者は一つの会社に所属する」に限ります。既存の会社への参加は招待と権限を扱う別の操作にします。送られた <code>company_id</code> で所属先を選ばせると、他社の ID を送るだけで他社に所属できてしまうためです。
          </p>
          <Code
            lang="ruby"
            title="app/forms/registration_form.rb"
            code={`
class RegistrationForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :email, :string
  attribute :display_name, :string
  attribute :company_name, :string
  attribute :terms_accepted, :boolean
  attr_reader :user

  validates :email, :display_name, :company_name, presence: true
  validates :terms_accepted, acceptance: { accept: true, allow_nil: false }

  # モデルの属性名 → このフォームの属性名
  FIELDS = {
    "Company" => { name: :company_name },
    "User" => { email: :email },
    "Profile" => { display_name: :display_name },
  }.freeze

  def save
    return false unless valid?

    ApplicationRecord.transaction do
      company = Company.create!(name: company_name)
      @user = User.create!(email:, company:)
      @user.create_profile!(display_name:)
    end
    true
  rescue ActiveRecord::RecordInvalid => e
    e.record.errors.each do |error|
      field = FIELDS.fetch(e.record.class.name, {}).fetch(error.attribute, :base)
      errors.add(field, error.message)
    end
    false
  rescue ActiveRecord::RecordNotUnique => e
    # メールアドレスの一意索引の違反だけを入力のエラーにする
    raise unless e.message.include?("index_users_on_email")
    errors.add(:email, :taken)
    false
  end
end
`}
          />
          <p>
            <code>User</code> にはメールアドレスの形式の検証、<code>Profile</code> には表示名を20文字までとする検証があり、<code>users.email</code> には一意索引を作ってあります。いろいろな入力で <code>save</code> を呼び、戻り値・エラー・各テーブルの件数を表示しました。
          </p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4.13。件数は会社・利用者・プロフィールの順）"
            code={`
同意なし("0")   save=false errors={terms_accepted: ["must be accepted"]} 件数=[0, 0, 0]
同意なし(なし)  save=false errors={terms_accepted: ["must be accepted"]} 件数=[0, 0, 0]
正常            save=true  errors={} user.persisted?=true user.id=1 件数=[1, 1, 1]
メールの重複    save=false errors={email: ["has already been taken"]} 件数=[1, 1, 1]
表示名が長い    save=false errors={display_name: ["is too long (maximum is 20 characters)"]}
                user.persisted?=false user.id=nil 件数=[1, 1, 1]

# 一意索引の違反のメッセージ
Duplicate entry 'a@example.com' for key 'users.index_users_on_email'
`}
          />
          <ul>
            <li>
              <code>terms_accepted</code> は boolean の属性なので、<code>"1"</code> は <code>true</code>、<code>"0"</code> は <code>false</code> に変換されます。<code>accept: true</code> は <code>true</code> だけを同意とみなし、<code>allow_nil: false</code> なので値が無い場合も不合格です。
            </li>
            <li>
              モデルの検証の失敗（<code>RecordInvalid</code>）は、例外の <code>record</code> から失敗したモデルを取り出し、<code>FIELDS</code> でフォームの属性名に置き換えてメッセージを加えます。対応表に無い属性は <code>:base</code> にします。
            </li>
            <li>
              メールアドレスの重複は一意索引で止まり、<code>RecordNotUnique</code> になりました。uniqueness の検証だけでは同時に送られた2つの登録を防げません（<ChapterLink n={14} section="uniqueness" />）。MySQL のメッセージには索引名が入るので、その索引の違反だけを入力のエラーにし、ほかの一意制約の違反は投げ直します。
            </li>
            <li>
              表示名が長すぎる場合は、会社と利用者を INSERT した後にプロフィールで失敗し、3件ともロールバックされました。Rails は保存したレコードの状態も戻すので、<code>user.persisted?</code> は <code>false</code>、<code>user.id</code> は <code>nil</code> です。ただし <code>@user</code> のオブジェクトは残るので、成功かどうかは <code>save</code> の戻り値で判断します。
            </li>
          </ul>
          <Figure n="48-4" title="フォームの入力の単位と保存の単位" caption="RegistrationForm の各入力をどのテーブルに保存するかを示した模式図。">
            <FormMapFigure />
          </Figure>
          <p>
            図 48-4 は4つの入力がどのテーブルの列に保存されるかを示したものです。左の入力の単位は画面で、右の保存の単位はテーブルの設計で決まります。規約への同意のように、検証にだけ使う入力もあります。下の破線は保存の失敗を入力欄のエラーに戻す流れで、<code>FIELDS</code> の対応表がこれを受け持ちます。
          </p>
          <h3>フォームの表示と送信先</h3>
          <p>
            Form Object の <code>persisted?</code> は常に <code>false</code> なので、<code>form_with model:</code> はモデル名から作成用のパス <code>registration_forms_path</code> を呼びます。このルートは無いので、デモでは描画のときにエラーになりました。<code>url:</code> で送信先を指定します。<Ref n={4} />
          </p>
          <Code
            lang="erb"
            title="app/views/registrations/new.html.erb（抜粋）と、出力された HTML"
            code={`
<%= form_with model: @form, url: registration_path do |f| %>
  <%= f.text_field :email %>
<% end %>

<!-- 出力（authenticity_token の input は省略） -->
<form action="/registration" accept-charset="UTF-8" method="post">
  <input type="text" name="registration_form[email]" id="registration_form_email" />
</form>
`}
          />
          <p>
            ルートは <code>resource :registration, only: %i[new create]</code> で定義しました。入力欄の名前は <code>registration_form[email]</code> になるので、コントローラーでは <code>registration_form</code> のキーで受け取ります。失敗したときは、入力とエラーを持った同じフォームのオブジェクトで画面を描画し直します。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/registrations_controller.rb"
            code={`
class RegistrationsController < ApplicationController
  def new
    @form = RegistrationForm.new
  end

  def create
    @form = RegistrationForm.new(registration_params)
    if @form.save
      redirect_to root_path, notice: "登録しました"
    else
      render :new, status: :unprocessable_content
    end
  end

  private

  def registration_params
    # Rails 7.2 では params.require(:registration_form).permit(...)
    params.expect(registration_form: [:email, :display_name, :company_name, :terms_accepted])
  end
end
`}
          />
          <h3>保存の手順を Service に渡す時期</h3>
          <p>
            上の <code>save</code> は、保存が小さく、ほかの経路からの登録もない段階の書き方です。登録が API・招待・管理画面からも行われ、契約の開始や外部のアカウントの準備まで加わったら、保存と手順を <code>Registrations::Register</code> のような Service に移し、フォームは入力と入力欄のエラーを受け持ちます。
          </p>
          <Code
            lang="ruby"
            title="Service に保存を移した後の RegistrationForm#save（Registrations::Register はアプリで定義する Service）"
            code={`
def save
  return false unless valid?

  result = Registrations::Register.new.call(
    email:, display_name:, company_name:
  )
  @user = result.user
  result.errors.each do |field, messages|
    Array(messages).each { |message| errors.add(field, message) }
  end
  result.success?
end
`}
          />
          <p>
            フォームと Service の両方にトランザクションや保存の手順を書かないようにします。Service には <code>params</code> や入力欄の名前を渡さず、業務の入力を渡して業務の結果を受け取ります。モデルのバリデーションをフォームに写す必要もありません。フォームでの確認は利用者に直す箇所を示すためのもので、保存のときの保証はモデルと DB の制約が受け持ちます。
          </p>
        </>
      ),
    },
    {
      id: 'query-objects',
      title: 'Query Object：検索に名前を付け、戻り値の形を決める',
      body: (
        <>
          <p>
            一覧画面や集計では、条件・結合・グループ化を組み合わせた検索を書きます。<Term>Query Object</Term> は、こうした検索を一つのクラスにまとめ、引数（検索の条件）と戻り値の形を決めたものです。
          </p>
          <h3>スコープとクラスメソッドで足りる場合</h3>
          <p>
            <code>User.active</code> のような小さな条件はスコープ、引数によって条件を変える短い検索はクラスメソッドで書けます（<ChapterLink n={12} section="scope-design" />）。複数の画面の条件、<code>joins</code>・<code>group</code>・<code>having</code> がそれぞれ別の理由で変わり、呼び出し元が SQL の組み立て方を知る必要が出てきたら、Query Object を検討します。「5行を超えたら」のような行数の基準ではありません。<Ref n={7} />
          </p>
          <h3>期間内に何度も購入した会員を探す</h3>
          <Code
            lang="ruby"
            title="app/queries/repeat_customers_query.rb"
            code={`
class RepeatCustomersQuery
  def initialize(relation:)
    @relation = relation # 認可・組織の範囲は呼び出し元が決めて渡す
  end

  def call(since:, minimum_orders:)
    @relation.active
      .joins(:orders)
      .where(orders: { paid_at: since.. })
      .group(:id)
      .having("COUNT(DISTINCT orders.id) >= ?", minimum_orders)
  end
end

customers = RepeatCustomersQuery.new(relation: current_organization.users)
  .call(since: 90.days.ago, minimum_orders: 3)
  .order(:id)
`}
          />
          <p>
            <code>relation</code> を呼び出し元から受け取るのは、どの組織の会員を検索してよいかを呼び出し元が決めるためです。中で <code>User.all</code> から始めると、別の組織の会員まで対象になります。<code>active</code> はアプリで定義したスコープです。<code>since</code> と <code>minimum_orders</code> は、呼び出し元で日時と整数であることを確かめてから渡します。
          </p>
          <p>
            <code>paid_at</code>（支払った日時）を使うのは、注文が <code>shipped</code>・<code>completed</code> へ進んでも購入として数えるためです。返金した注文を含めるか、複数の組織に所属する会員の注文をどう絞るかも決めます。クラスに分ける前に、何を「購入」とみなし、どの範囲を検索するかを決めます。
          </p>
          <p>会員1が3回、会員2が1回購入し、別の組織の会員3も3回購入したデータで、最小の購入回数を2にして呼び出しました。</p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4.13。SQL は折り返した）"
            code={`
rel = RepeatCustomersQuery.new(relation: org.users).call(since: 90日前, minimum_orders: 2)
rel.class                       # => User::ActiveRecord_AssociationRelation
rel.order(:id).limit(20).to_sql
# SELECT \`users\`.* FROM \`users\` INNER JOIN \`orders\` ON \`orders\`.\`user_id\` = \`users\`.\`id\`
#  WHERE \`users\`.\`organization_id\` = 1 AND \`users\`.\`active\` = TRUE
#    AND \`orders\`.\`paid_at\` >= '2026-08-22 00:00:00'
#  GROUP BY \`users\`.\`id\` HAVING (COUNT(DISTINCT orders.id) >= '2')
#  ORDER BY \`users\`.\`id\` ASC LIMIT 20
rel.order(:id).limit(20).map(&:id)   # => [1]
rel.count                            # => {1 => 3}
rel.to_a.order(:id)                  # => NoMethodError（Array に order は無い）
`}
          />
          <p>
            戻り値は Relation なので、呼び出し元が <code>order</code> と <code>limit</code> を足し、最後に1回の SQL として実行されました（<ChapterLink n={12} section="lazy" />）。<code>organization_id = 1</code> の条件は呼び出し元が渡した <code>org.users</code> から来たもので、別の組織の会員3は含まれていません。MySQL のアダプターは <code>?</code> に渡した数値を <code>'2'</code> のように文字列で埋め込みますが、MySQL が数値に変換して比べるので結果は同じです。<code>users.id</code> が主キーなので、既定の <code>ONLY_FULL_GROUP_BY</code> の下でもこの SQL はエラーになりませんでした。
          </p>
          <p>
            group を含む Relation の <code>count</code> は、グループのキー（会員の ID）と行数の Hash を返します。この例では会員1の注文が3行なので <code>{'{1 => 3}'}</code> でした。会員の人数として使うと誤ります。
          </p>
          <h3>検索を置く場所の比較</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">置き方</th>
                  <th scope="col">向いている場面</th>
                  <th scope="col">避けたい使い方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">スコープ</th>
                  <td>小さな条件の再利用、Relation のつなぎ合わせ</td>
                  <td>予想外の order・limit を中に入れる。条件が空のとき全件になることを見落とす</td>
                </tr>
                <tr>
                  <th scope="row">クラスメソッド</th>
                  <td>引数による分岐、そのモデルに固有の検索、短い集計</td>
                  <td>画面ごとのレポートの検索をすべてモデルに持たせる</td>
                </tr>
                <tr>
                  <th scope="row">Query Object</th>
                  <td>検索そのものに名前と、変わる理由がある</td>
                  <td>where 一つの検索まで毎回クラスにする</td>
                </tr>
                <tr>
                  <th scope="row">Repository のようなクラス</th>
                  <td>保存先との境界が明確にある。複数のデータ源から読む</td>
                  <td>Active Record の API を包み直す。Relation を返しつつ ORM 非依存とうたう</td>
                </tr>
                <tr>
                  <th scope="row">SQL を直接書く</th>
                  <td>CTE・ウィンドウ関数・複雑な集計</td>
                  <td>外部の入力を埋め込む。EXPLAIN を確かめない</td>
                </tr>
                <tr>
                  <th scope="row">Arel</th>
                  <td>動的な条件を文字列の連結より安全に組み立てる</td>
                  <td>単純な where まで読みにくい書き方に置き換える</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            SQL の値はプレースホルダーや Hash の条件で渡し、列名や並び順の向きは許可した一覧から選びます（<ChapterLink n={21} section="sqli" />）。Arel を使っても、利用者が送った文字列を <code>Arel.sql</code> で包めば、その文字列はそのまま SQL になります。
          </p>
          <h3>戻り値の形を決める</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">戻り値</th>
                  <th scope="col">利点</th>
                  <th scope="col">決めること・注意点</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">ActiveRecord::Relation</th>
                  <td>呼び出し元が order・limit・preload を足せる</td>
                  <td>条件の変更と実行の時点を呼び出し元に任せる</td>
                </tr>
                <tr>
                  <th scope="row">Array</th>
                  <td>メモリー上での結合や並び替えを済ませて渡せる</td>
                  <td>読み込む件数に上限を設ける。Relation のつもりでページングしない</td>
                </tr>
                <tr>
                  <th scope="row">DTO（値を運ぶだけのオブジェクト）</th>
                  <td>集計の行や外部に公開する項目だけを返せる</td>
                  <td>読み取り専用と示す。モデルへ戻す変換を増やさない</td>
                </tr>
                <tr>
                  <th scope="row">集計値</th>
                  <td>件数・合計など、必要な答えだけを返せる</td>
                  <td>単位・通貨・期間・nil の意味を決める。group 付きの count は Hash になる</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Figure n="48-5" title="Relation を返す場合と配列を返す場合" caption="上の実行結果をもとにした模式図。">
            <RelationArrayFigure />
          </Figure>
          <p>
            図 48-5 は Relation を返す場合と、中で <code>to_a</code> を呼んで配列を返す場合を、SQL が実行される時点で比べたものです。上の段では、呼び出し元が足した並び順と件数の制限まで含めて SQL が1回実行されます。下の段では Query Object の中で条件に合う行がすべて読み込まれ、その後の並び替えは Ruby で行われるので索引を使えません。呼び出し元がページングするなら、最後まで Relation を返します。集計表を返す場合は、0件の期間を含めるか、集計の単位と並び順を結果の仕様として決めます。
          </p>
          <p>
            Query Object に分けても、N+1 問題や遅い SQL は自動では直りません。SQL とその回数、実行計画、索引を確かめます（<ChapterLink n={13} section="n-plus-one" />、<ChapterLink n={12} section="explain" />）。また、中で <code>User.unscoped</code> から始め直すと、呼び出し元が付けた組織の条件は失われます。
          </p>
        </>
      ),
    },
    {
      id: 'value-objects',
      title: 'Value Object：値の組に意味と規則を持たせる',
      body: (
        <>
          <p>
            注文には注文番号があり、明細や状態が変わっても同じ注文として扱います。このように ID で見分けるオブジェクトを<Term en="entity">エンティティ</Term>と呼びます。一方、「1500円」という金額は、どの注文の1500円でも同じ値です。値の組が等しければ等しいとみなすオブジェクトを <Term>Value Object</Term>（値オブジェクト）と呼びます。<Ref n={11} />
            <Ref n={12} />
          </p>
          <p>
            1500 という整数だけでは、円かドルかが分かりません。金額と通貨を組にした <code>Money</code> なら、通貨の違う金額の足し算をエラーにできます。Value Object は作った後に変更できない（不変の）オブジェクトにし、値を変えるときは新しく作ります。変更できると、同じオブジェクトを2か所から参照しているときに、一方での変更がもう一方にも及びます。Martin Fowler は、2つの変数が同じ日付のオブジェクトを指していて、片方を書き換えたらもう片方も変わった例で、この問題を説明しています。<Ref n={11} />
          </p>
          <h3>Data で Money を定義する</h3>
          <p>
            Ruby の <code>Data.define</code> は、指定したメンバーだけを持つ値のクラスを作ります。メンバーを書き換えるメソッド（<code>cents=</code> など）は定義されず、同じクラスでメンバーがすべて等しければ <code>==</code> で等しくなります。<Ref n={8} />
          </p>
          <Code
            lang="ruby"
            title="app/models/money.rb"
            code={`
Money = Data.define(:cents, :currency) do
  def initialize(cents:, currency:)
    raise ArgumentError, "cents must be an Integer" unless cents.is_a?(Integer)
    raise ArgumentError, "currency required" unless currency.is_a?(String) && !currency.empty?
    super(cents:, currency: currency.upcase.freeze)
  end

  def +(other)
    raise ArgumentError, "currency mismatch" unless currency == other.currency
    with(cents: cents + other.cents)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
a = Money.new(cents: 1500, currency: "jpy")  # => #<data Money cents=1500, currency="JPY">
b = Money.new(1500, "JPY")                   # 位置引数でも作れる
a == b                    # => true
a.eql?(b)                 # => true
a.equal?(b)               # => false（別のオブジェクト）
{ a => "x" }[b]           # => "x"（Hash のキーとしても同じ値）
a.frozen?                 # => true
a.respond_to?(:cents=)    # => false
a.instance_variable_set(:@cents, 1)        # => FrozenError
a + Money.new(cents: 300, currency: "JPY") # => #<data Money cents=1800, currency="JPY">
a + Money.new(cents: 300, currency: "USD") # => ArgumentError: currency mismatch
Money.new(cents: 1.5, currency: "JPY")     # => ArgumentError: cents must be an Integer
Money.new(cents: 100)                      # => ArgumentError: missing keyword: :currency
a.with(cents: 1.5)                         # => ArgumentError: cents must be an Integer
`}
          />
          <ul>
            <li>
              <code>Data</code> の <code>new</code> は位置引数をキーワード引数に変えてから <code>initialize</code> を呼ぶので、<code>initialize</code> を上書きすれば、どちらで作っても同じ検証と正規化（通貨を大文字にする）を通ります。<Ref n={8} />
            </li>
            <li>
              <code>with</code> は一部のメンバーを替えた新しいオブジェクトを返します。Ruby 4.0.9 では <code>with</code> も <code>initialize</code> を通るので、<code>+</code> の結果も同じ検証を通ります。
            </li>
            <li>
              インスタンスは凍結されていて、<code>instance_variable_set</code> でも書き換えられません。
            </li>
            <li>
              <code>==</code> はメンバーを <code>==</code> で、<code>eql?</code> は <code>eql?</code> で比べます。<code>Data.define(:amount, :unit)</code> で試すと、<code>M[1, "km"] == M[1.0, "km"]</code> は <code>true</code>、<code>eql?</code> は <code>false</code> でした。Hash のキーは <code>eql?</code> で比べるので、金額を Integer に限定して混在を避けています。<Ref n={8} />
            </li>
          </ul>
          <p>
            <code>cents</code> は「通貨の最小単位で数えた量」の意味で使っている名前です。日本円の最小単位は1円、米ドルは1セントで、小数以下の桁数は通貨ごとに違います。この例には通貨の一覧、換算、按分、端数の処理は含めていません。割引や税の計算では丸める段階と方法を仕様として決め、Float ではなく Integer か BigDecimal で計算します。返金などで負の金額を許すかも要件から決めます。
          </p>
          <h3>凍結されるのはインスタンス自身だけ</h3>
          <Code
            lang="ruby"
            title="可変のオブジェクトをメンバーに持たせた場合"
            code={`
Tags = Data.define(:names)
t = Tags.new(names: ["a"])
t.names << "b"
t  # => #<data Tags names=["a", "b"]>
`}
          />
          <p>
            <code>Data</code> が凍結するのはインスタンス自身だけで、メンバーの配列や Hash は凍結されません。Ruby のドキュメントにも、Data はメンバーの値の不変性までは強制しないと書かれています。<Ref n={8} /> 可変のオブジェクトを受け取るなら、<code>initialize</code> でコピーして <code>freeze</code> するかを決めます。<code>Money</code> の <code>currency.upcase.freeze</code> はこのためです。
          </p>
          <h3>期間を表す DateRange</h3>
          <Code
            lang="ruby"
            title="開始日と終了日を組にした値"
            code={`
DateRange = Data.define(:first, :last) do
  def initialize(first:, last:)
    raise ArgumentError, "Date required" unless first.is_a?(Date) && last.is_a?(Date)
    raise ArgumentError, "first must not be after last" if first > last
    super
  end

  # この例では両端の日を含む
  def cover?(date) = (first..last).cover?(date)
  def overlap?(other) = first <= other.last && other.first <= last
end

r = DateRange.new(first: Date.new(2026, 11, 1), last: Date.new(2026, 11, 30))
r.cover?(Date.new(2026, 11, 30))  # => true
r.cover?(Date.new(2026, 12, 1))   # => false
r.overlap?(DateRange.new(first: Date.new(2026, 11, 30), last: Date.new(2026, 12, 5)))  # => true
DateRange.new(first: Date.new(2026, 12, 1), last: Date.new(2026, 11, 1))
# => ArgumentError: first must not be after last
`}
          />
          <p>
            開始日と終了日を別々に渡すと、順序の確認や「終了日を含むか」の判断が呼び出し元ごとに書かれます。<code>DateRange</code> にまとめると、両端を含む（閉区間）という規則と重なりの判定を一か所に置けます。Ruby の Range で意味が足りるならクラスは不要です。日時の範囲では、終わりを含まない半開区間にするか、どのタイムゾーンで日を区切るかも決めます。
          </p>
          <h3>Value Object にする値の候補</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">値</th>
                  <th scope="col">持たせると役立つ振る舞い</th>
                  <th scope="col">作らなくてよい場合・落とし穴</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Money</th>
                  <td>通貨の一致の確認、加減算、端数の処理</td>
                  <td>表示だけならヘルパーで足りる。単位を暗黙にしない</td>
                </tr>
                <tr>
                  <th scope="row">Address</th>
                  <td>国ごとの構成と表記、配送できるかの判定</td>
                  <td>自由記述なら string で足りる。検証の中で外部の API を直接呼ばない</td>
                </tr>
                <tr>
                  <th scope="row">DateRange</th>
                  <td>開始が終了より前であること、含むか、重なるか</td>
                  <td>Range で足りれば不要。区間の端とタイムゾーンを決める</td>
                </tr>
                <tr>
                  <th scope="row">Email</th>
                  <td>アプリで決めた正規化（小文字にするなど）、値の一致</td>
                  <td>形式の検証だけならバリデーターで足りる。形式が正しくても届くとは限らない</td>
                </tr>
                <tr>
                  <th scope="row">PhoneNumber</th>
                  <td>国番号を含む正規化、表示</td>
                  <td>国の情報なしに先頭の0を消さない。保存だけなら string で足りる</td>
                </tr>
                <tr>
                  <th scope="row">Percentage</th>
                  <td>0〜100 などの範囲、倍率への変換</td>
                  <td>0.2 と 20 を混同しない。範囲の検証だけなら numericality で足りる</td>
                </tr>
                <tr>
                  <th scope="row">Coordinates</th>
                  <td>緯度・経度の範囲と順序、距離の計算</td>
                  <td>表示だけなら不要。測地系の知識を持たせすぎない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>DB の列と Value Object を対応させる</h3>
          <p>
            DB には <code>amount_cents</code> と <code>currency</code> のような通常の列で保存し、モデルのメソッドで Value Object に変換するだけでも十分です。同じ変換をあちこちで書くようになったら、<code>composed_of</code> か attribute API の独自の型（<ChapterLink n={11} section="attribute-api" />）を検討します。<code>composed_of</code> は複数の列から Value Object を作る読み取りのメソッドと、各列に書き込むメソッドを定義します。<Ref n={9} />
          </p>
          <Code
            lang="ruby"
            title="注文の合計を Money として読み書きする"
            code={`
class Order < ApplicationRecord
  composed_of :total, class_name: "Money",
    mapping: { total_cents: :cents, currency: :currency }
end

order = Order.create!(total: Money.new(cents: 1500, currency: "jpy"))
order.attributes     # => {"id" => 1, "total_cents" => 1500, "currency" => "JPY"}
order.total.frozen?  # => true
order.total = order.total + Money.new(cents: 300, currency: "JPY")
order.changes        # => {"total_cents" => [1500, 1800]}
order.save!

Order.where(total: Money.new(cents: 1800, currency: "JPY")).count  # => 1
# SELECT COUNT(*) FROM "orders" WHERE "orders"."total_cents" = ? AND "orders"."currency" = ?
`}
          />
          <p>
            SQLite で実行した結果です。読み取るときは <code>mapping</code> の順に列の値が <code>Money.new</code> に位置引数で渡され、<code>where</code> に <code>Money</code> を渡すと2つの列の条件になりました。<code>composed_of</code> は読み取りで作ったオブジェクトを <code>freeze</code> し、書き込みでは受け取ったオブジェクトを <code>dup</code> して <code>freeze</code> したものを保持します。Rails API のドキュメントも Value Object を不変として扱うよう求めています。<Ref n={9} />
            <Ref n={10} />
          </p>
          <Callout kind="warn" title="読み書きした Value Object はレコードの中に保持される">
            <code>total=</code> で書き込んだ値や一度読み取った値は、レコードの中に保持されます。デモで <code>order.total</code> に書き込んだ後、<code>order.total_cents = 2000</code> と列へ直接代入すると、<code>order.total</code> は 1800 のままでした。保持した値は <code>reload</code> で消えます。<Ref n={10} /> <code>composed_of</code> を使う列には直接代入せず、<code>total=</code> で書き込みます。
          </Callout>
          <p>
            最初からすべての値を独自の型で包むと、検索の条件、変更の追跡、マイグレーションのたびに変換を考えることになります。誤用が実際に繰り返されている値から導入します。
          </p>
          <p>
            金額・期間・メールアドレスを Value Object にする実装（Data.define、composed_of、Attributes API のカスタム型、normalizes）は <ChapterLink n={46} /> で詳しく扱います。
          </p>
        </>
      ),
    },
    {
      id: 'domain-application-service',
      title: 'Domain Service と Application Service を分ける',
      body: (
        <>
          <p>
            Service という名前は、性質の違う2種類のクラスに使われます。ドメイン駆動設計（DDD）では、手順を進めるものを Application Service、業務の規則を決めるものを Domain Service と呼んで区別します。DDD を全面的に取り入れなくても、この区別は使えます。
          </p>
          <p>
            <Term>Application Service</Term> は、一つのユースケースの手順・トランザクション・失敗の返し方を受け持ちます。<code>Orders::Place</code> はこちらです。Fowler らの『Patterns of Enterprise Application Architecture』の Service Layer も、アプリケーションの操作の一覧を定め、トランザクションを制御して応答をまとめる層として説明されています。<Ref n={13} />
          </p>
          <p>
            <Term>Domain Service</Term> は、一つのエンティティや Value Object に自然には属さない業務の処理です。Eric Evans の DDD Reference は、そうした処理を独立した操作としてモデルに加え、業務の言葉で名前を付けるよう述べています。<Ref n={12} /> 実装は普通の Ruby のクラスで構いません。
          </p>
          <h3>注文の確定に関わるクラスの分担</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">クラス</th>
                  <th scope="col">持つ知識</th>
                  <th scope="col">持たない知識</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Order</th>
                  <td>注文の状態、明細のまとまり、注文を確定できる条件</td>
                  <td>決済の SDK の引数、メールのテンプレート</td>
                </tr>
                <tr>
                  <th scope="row">OrderItem</th>
                  <td>数量、注文した時点の単価、行の金額</td>
                  <td>会員全体のポイントの方針</td>
                </tr>
                <tr>
                  <th scope="row">Product（在庫）</th>
                  <td>確保できる数、確保と解放の条件</td>
                  <td>HTTP の成功の応答</td>
                </tr>
                <tr>
                  <th scope="row">Payment</th>
                  <td>支払いの試行、金額と通貨、外部の参照番号、結果</td>
                  <td>注文フォームのエラーの文言</td>
                </tr>
                <tr>
                  <th scope="row">Coupon</th>
                  <td>有効期限、対象、利用の上限、二重に使えない規則</td>
                  <td>配送や通知の手順</td>
                </tr>
                <tr>
                  <th scope="row">DiscountCalculator（Domain Service）</th>
                  <td>会員区分・商品・クーポンを合わせた割引の方針</td>
                  <td>トランザクション、キューへの投入</td>
                </tr>
                <tr>
                  <th scope="row">Orders::Place（Application Service）</th>
                  <td>認可済みの入力を使った全体の手順、一緒に確定させる範囲</td>
                  <td>各モデルの規則（写して持たない）</td>
                </tr>
                <tr>
                  <th scope="row">メーラー・ジョブ</th>
                  <td>通知の内容への橋渡し、配信と再試行</td>
                  <td>注文の金額を決め直すこと</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            表の「持たない知識」の列にあることを、あるクラスが扱い始めたら、置き場所を見直します。たとえば Payment が注文画面のエラーの文言を組み立て始めたら、その処理はフォームかビューに移します。
          </p>
          <h3>割引の計算を Domain Service にする</h3>
          <Code
            lang="ruby"
            title="app/models/discount_calculator.rb"
            code={`
class DiscountCalculator
  # この例の規則：会員割引とクーポンは併用せず、割引率の高いほうを使う
  def discount_cents(subtotal_cents:, member_percent:, coupon_percent:)
    percents = [member_percent, coupon_percent]
    unless percents.all? { |pc| pc.is_a?(Integer) && pc.between?(0, 100) }
      raise ArgumentError, "percent must be 0..100"
    end
    raise ArgumentError, "invalid subtotal" unless subtotal_cents.is_a?(Integer) && subtotal_cents >= 0

    subtotal_cents * percents.max / 100 # 最小単位で切り捨てる
  end
end

DiscountCalculator.new.discount_cents(subtotal_cents: 1999, member_percent: 5, coupon_percent: 10)
# => 199
`}
          />
          <p>
            1999円の10%は199.9円なので、整数の割り算で199円になりました。会員区分とクーポンの2つの概念にまたがり、DB を読まずに引数だけで計算できるので、割引率0や100などの境界を値だけでテストできます。
          </p>
          <p>
            クーポンの有効期限や使用済みかの判定は Coupon に残し、Application Service が適用できるかを確かめてから割引率を渡します。規則がクーポンだけで決まるなら <code>coupon.discount_for(order)</code> で足ります。計算だから Domain Service にするわけではありません。注文のすべての属性を受け取ってあらゆる更新を代わりに行う <code>OrderDomainService</code> のようなクラスは、受け持つ範囲が定まりません。
          </p>
          <p>
            Domain Service を DB に依存させないのは有益な選択ですが、必須の条件ではありません。DB に依存しないことだけを目的に、モデルを大量の DTO に写す必要もありません。37signals のように、こうしたクラスを <code>app/models</code> に置く書き方もあります。<Ref n={1} /> この分担で注文の確定を組み立てる例は <ChapterLink n={34} section="refactoring-stages" /> にあります。
          </p>
        </>
      ),
    },
    {
      id: 'design-patterns',
      title: 'Rails で使う設計パターン',
      body: (
        <>
          <p>
            設計パターンは、よく現れる問題とその解き方に付けた名前です。レビューで「送料の計算は Strategy にした」のように短く伝えられますが、先にパターンを選んでコードを当てはめると、解く問題が無いのにクラスが増えます。次の表は Rails でよく使うパターンを、導入する時期と見送る条件で整理したものです。この章の前半の Service・Form・Query・Value Object も同じ基準で判断します。認可の判定を集める Policy Object は <ChapterLink n={21} section="object-authorization" />、表示用のメソッドを足す Decorator は <ChapterLink n={30} section="architecture-boundaries" /> で扱います。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">パターン</th>
                  <th scope="col">解く問題と Rails での例</th>
                  <th scope="col">導入する時期</th>
                  <th scope="col">見送る条件・使いすぎの問題</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Strategy</th>
                  <td>計算の方針を差し替える。送料の計算（後述）</td>
                  <td>複数の方針がそれぞれ変わる</td>
                  <td>2行で安定した case 式</td>
                </tr>
                <tr>
                  <th scope="row">Adapter</th>
                  <td>
                    SDK の応答と例外を、アプリが決めた結果の形に変える。<code>Payments::Gateway</code>
                  </td>
                  <td>SDK の知識が複数の箇所に広がった</td>
                  <td>一か所だけの薄い連携。すべての SDK を包み直す</td>
                </tr>
                <tr>
                  <th scope="row">Factory</th>
                  <td>
                    必須の値と組み立ての手順を揃える。<code>Order.build_from_cart</code>
                  </td>
                  <td>組み立てが複雑で、同じ手順が重複している</td>
                  <td>
                    <code>Order.new</code> や関連の build で足りる。中で保存や課金まで行う
                  </td>
                </tr>
                <tr>
                  <th scope="row">Null Object</th>
                  <td>
                    「無い」ときの正常な既定の動作。<code>NoDiscount</code>
                  </td>
                  <td>同じ意味の nil の分岐が繰り返される</td>
                  <td>無いことが異常なら例外にする。存在しない支払いを成功扱いにしない</td>
                </tr>
                <tr>
                  <th scope="row">Command</th>
                  <td>
                    操作を値として持ち、記録・実行する。<code>CancelOrder</code>
                  </td>
                  <td>依頼と実行を分ける。操作の履歴が要る</td>
                  <td>メソッドの直接の呼び出しで足りる。取り消し（undo）は自動ではできない</td>
                </tr>
                <tr>
                  <th scope="row">Observer・Event</th>
                  <td>起きた事実を購読する処理を分ける</td>
                  <td>通知・分析など、独立した購読者が増える</td>
                  <td>同じトランザクションで必ず行う更新までイベントにする。追跡と配信の保証が増える</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Strategy・Null Object・Factory・Command の小さな実装</h3>
          <Code
            lang="ruby"
            title="送料の計算方針（Strategy）と、割引なし（Null Object）"
            code={`
class FlatShipping
  def fee_cents(subtotal_cents:) = 500
end

class FreeOverThresholdShipping
  def fee_cents(subtotal_cents:) = subtotal_cents >= 10_000 ? 0 : 500
end

# 方針のキーは、アプリが許可した対応表から選ぶ
SHIPPING_POLICIES = {
  "flat" => FlatShipping,
  "free_over_10000" => FreeOverThresholdShipping,
}.freeze

def shipping_policy_for(key) = SHIPPING_POLICIES.fetch(key).new

shipping_policy_for("free_over_10000").fee_cents(subtotal_cents: 12_000)  # => 0
shipping_policy_for("Kernel")  # => KeyError

class NoDiscount
  def discount_cents(subtotal_cents:) = 0
end

class PercentDiscount
  def initialize(percent) = @percent = percent
  def discount_cents(subtotal_cents:) = subtotal_cents * @percent / 100
end

[NoDiscount.new, PercentDiscount.new(15)].map { |d| d.discount_cents(subtotal_cents: 1999) }
# => [0, 299]
`}
          />
          <p>
            <code>FlatShipping</code> と <code>FreeOverThresholdShipping</code> は同じ <code>fee_cents(subtotal_cents:)</code> を持つので、呼び出し元はどの方針かを知らずに送料を求められます。これが <Term>Strategy</Term> です。方針は、アプリが許可したキーとクラスの対応表から選びます。利用者が送った文字列を <code>constantize</code> すると、意図しないクラスを作らせることになります。
          </p>
          <p>
            <code>NoDiscount</code> は「割引なし」を、ほかの割引と同じ <code>discount_cents</code> で表す <Term>Null Object</Term> です。呼び出し元は nil かどうかを毎回確かめずに済みます。ただし使うのは、クーポンを指定しなかった注文のように「割引なし」が正常な場合だけです。入力されたクーポンのコードが無効なときに黙って <code>NoDiscount</code> に替えると、利用者は割引を受けたつもりで注文してしまうので、入力のエラーとして返します。
          </p>
          <Code
            lang="ruby"
            title="買い物かごから注文を組み立てる（Factory）と、取り消しの依頼（Command）"
            code={`
class Order < ApplicationRecord
  def self.build_from_cart(user:, cart:)
    raise ArgumentError, "cart owner mismatch" unless cart.user_id == user.id

    user.orders.build.tap do |order|
      cart.items.each do |item|
        order.items.build(product: item.product, quantity: item.quantity,
                          unit_price_cents: item.product.price_cents)
      end
    end
  end
end

class CancelOrder
  def initialize(order_id:, actor_id:)
    @order_id = order_id
    @actor_id = actor_id
  end

  def call
    actor = User.find(@actor_id)
    order = actor.orders.find(@order_id) # 実行する時点の権限の範囲で取り直す
    order.cancel!
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・SQLite）"
            code={`
order = Order.build_from_cart(user: u, cart:)
order.new_record?    # => true
order.items.map { [it.quantity, it.unit_price_cents] }  # => [[2, 1200]]
Order.count          # => 0（保存していない）
Order.build_from_cart(user: other, cart:)               # => ArgumentError: cart owner mismatch

CancelOrder.new(order_id: order.id, actor_id: other.id).call  # => ActiveRecord::RecordNotFound
CancelOrder.new(order_id: order.id, actor_id: u.id).call      # 注文は canceled になる
CancelOrder.new(order_id: order.id, actor_id: u.id).call      # => Order::InvalidTransition
`}
          />
          <p>
            <code>Order.build_from_cart</code> は <Term>Factory</Term> の例で、買い物かごの所有者を確かめてから注文と明細を組み立てるだけで、保存はしません。価格と在庫は注文を確定するときにもう一度確かめます。Factory の中で保存や課金まで行うと、候補を作るつもりで呼んだ側が予想しない副作用を受けます。
          </p>
          <p>
            <code>CancelOrder</code> は <Term>Command</Term> の例で、ID だけを持ち、<code>call</code> のときに実行者の注文の範囲から注文を取り直します。別の利用者の ID では <code>RecordNotFound</code>、2回目の取り消しは <code>Order::InvalidTransition</code> になりました。Command にしただけでは冪等性も取り消しの機能も付きません。ジョブで後から実行するなら、その間に実行者が権限を失う、注文の状態が変わる、再試行で2回実行される、といった場合を考えます（<ChapterLink n={18} section="idempotency" />）。返金は課金の逆の計算ではなく、記録を残す別の業務の操作です。
          </p>
          <p>
            Observer・Event に当たる Rails の通知の仕組み（<code>ActiveSupport::Notifications</code> と <code>Rails.event</code>）は、次の「イベントの通知：計測と業務の配信を分ける」の節で扱います。
          </p>
          <p>
            この節の Strategy・Adapter・Domain Events などは、第9部で1つのパターンを1つの章で扱います。パターンの一覧と、コードの症状から章を引く表は <ChapterLink n={39} section="symptoms" /> にあります。
          </p>
        </>
      ),
    },
    {
      id: 'event-notifications',
      title: 'イベントの通知：計測と業務の配信を分ける',
      body: (
        <>
          <p>
            「Rails で使う設計パターン」の節の表の Observer・Event（起きた事実を購読する処理を分ける）に当たる Rails の仕組みが、<code>ActiveSupport::Notifications</code> と、Rails 8.1 で加わった <code>Rails.event</code> です。処理時間の計測やログのための通知と、外部への連携のように必ず届ける業務の配信とでは、使う仕組みが違います。DDD Reference も、業務の専門家が関心を持つドメインイベントを、ソフトウェアの中の動きを表すシステムのイベントと区別しています。<Ref n={12} />
          </p>
          <Code
            lang="ruby"
            title="計測用のイベントの購読が例外を投げた場合"
            code={`
placed = []
ActiveSupport::Notifications.subscribe("place.orders") do |event|
  raise "subscriber failed"
end

ActiveSupport::Notifications.instrument("place.orders", order_id: 1) do
  placed << 1 # 注文の確定の代わり
end
# => RuntimeError: subscriber failed
placed # => [1]（ブロックは実行済み）
`}
          />
          <p>
            <code>ActiveSupport::Notifications</code> の購読のブロックは、<code>instrument</code> を呼んだスレッドで、ブロックの処理の後に実行されます（<ChapterLink n={22} section="notifications" />）。デモでは、注文の処理は実行済みなのに、購読の例外が <code>instrument</code> の呼び出し元に届きました。購読者が複数なら全員を実行した後、例外が1つならそのまま、複数なら <code>InstrumentationSubscriberError</code> にまとめて投げます。<Ref n={14} /> 購読の処理時間も呼び出し元の応答時間に加わります。Notifications は計測の仕組みで、イベントを保存するキューではありません。
          </p>
          <Callout kind="v72" title="Rails 8.1 で加わった Rails.event">
            Rails 8.1 で、構造化したイベントを記録する <code>Rails.event</code>（<code>ActiveSupport::EventReporter</code>）が加わりました。<code>Rails.event.notify("order.placed", order_id: 1)</code> は、登録した購読者の <code>emit</code> を同じスレッドで呼びます。購読者の例外は、<code>config.consider_all_requests_local</code> が true の環境（通常は開発環境）では呼び出し元に投げ、それ以外ではエラーレポーターに報告して続けます。<Ref n={21} />
            <Ref n={15} />
            <Ref n={16} /> デモでも、例外を投げる購読者があっても、もう一方の購読者にはイベントが届きました。こちらもイベントを保存・再送する仕組みではありません。
          </Callout>
          <p>
            障害の後にも必ず実行したい連携は、イベントの行を DB に保存し、配信の状態と再試行を記録します。注文と同じトランザクションで送る予定を保存し、ジョブが送る方法は <ChapterLink n={34} section="external-boundaries" /> で扱います。購読者が増えて、どの処理がどの順で動くかが読めなくなるなら、Service から明示的に呼ぶほうが読みやすくなります。
          </p>
        </>
      ),
    },
    {
      id: 'dependency-injection',
      title: '依存性注入：差し替える依存先を引数で受け取る',
      body: (
        <>
          <p>
            クラスが使う別のオブジェクト（依存先）を、クラスの中で作らずに外から渡すことを<Term en="Dependency Injection、DI">依存性注入</Term>と呼びます。Martin Fowler はコンストラクターで渡す方法やセッターで渡す方法などを挙げ、テストで本物の実装をスタブに替えやすいことを、よく挙げられる利点として紹介しています。<Ref n={17} /> Ruby では専用の仕組み（DI コンテナ）がなくても、<code>initialize</code> のキーワード引数と既定値で書けます。
          </p>
          <p>引数で受け取る候補はネットワークや時刻のように、実行する環境によって結果が変わる依存先です。</p>
          <Code
            lang="ruby"
            title="課金の依頼先と現在時刻を引数で受け取る"
            code={`
class Checkout
  def initialize(payment_gateway: Payments::Gateway.new, clock: -> { Time.current })
    @payment_gateway = payment_gateway
    @clock = clock
  end

  def charge(payment)
    raise ArgumentError, "expired" if payment.expires_at <= @clock.call

    @payment_gateway.charge(payment)
  end
end
`}
          />
          <p>
            <code>Checkout</code> は、課金の依頼先と、現在時刻を返すラムダを受け取ります。本番では既定値の <code>Payments::Gateway</code> と <code>Time.current</code> が使われ、テストでは決まった結果を返すオブジェクトと固定の時刻を渡します。結果が不明な場合や冪等性キーまで含めた課金の全体は <ChapterLink n={34} section="external-boundaries" /> で扱います。
          </p>
          <Code
            lang="ruby"
            title="テストで偽物の Gateway と固定の時刻を渡す"
            code={`
# この例のための支払いの値（アプリでは Payment モデルなど）
Payment = Data.define(:amount_cents, :currency, :expires_at, :idempotency_key)

# Payments::ChargeResult は Adapter の節で定義する結果のクラス
fake_gateway = Object.new
def fake_gateway.charge(payment)
  Payments::ChargeResult.new(status: :succeeded, reference: "test-ref")
end

payment = Payment.new(amount_cents: 1500, currency: "JPY",
  expires_at: Time.utc(2026, 11, 20, 12), idempotency_key: "order-42-attempt-1")

Checkout.new(payment_gateway: fake_gateway,
  clock: -> { Time.utc(2026, 11, 20, 11, 59) }).charge(payment)
# => #<data Payments::ChargeResult status=:succeeded, reference="test-ref">

Checkout.new(payment_gateway: fake_gateway,
  clock: -> { Time.utc(2026, 11, 20, 12) }).charge(payment)
# => ArgumentError: expired

travel_to Time.utc(2026, 11, 20, 12, 0, 1) do
  Checkout.new(payment_gateway: fake_gateway).charge(payment)
end
# => ArgumentError: expired（clock を渡さず、Time.current を固定した）
`}
          />
          <p>
            期限の1分前なら結果が返り、期限ちょうどでは <code>expired</code> になりました。最後の例は clock を渡さず、Rails のテスト用の <code>travel_to</code> で <code>Time.current</code> を固定したものです。<Ref n={18} /> <code>travel_to</code> で足りるなら、すべてのクラスに clock の引数を加える必要はありません。時刻を引数にするのは、一つの処理の中で同じ「現在」を使い続けたい場合などです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">依存先</th>
                  <th scope="col">引数で受け取ると何ができるか</th>
                  <th scope="col">引数にしなくてよい場合</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">外部の API・決済</th>
                  <td>実際に課金せずに、成功・拒否・タイムアウトを再現する。SDK との境界を固定する</td>
                  <td>呼び出しが一か所だけなら、Adapter を一つ作れば足りる</td>
                </tr>
                <tr>
                  <th scope="row">メーラー</th>
                  <td>宛先や通知の方法の違いを切り替える</td>
                  <td>普通の Action Mailer の呼び出しと、配信のテストで足りる</td>
                </tr>
                <tr>
                  <th scope="row">時刻</th>
                  <td>期限や区切りの時刻を明示する</td>
                  <td>
                    <code>travel_to</code> で時刻を固定できるなら、すべてのクラスに加える必要はない
                  </td>
                </tr>
                <tr>
                  <th scope="row">機能フラグ</th>
                  <td>ユースケースの開始時に方針を決め、途中で切り替わらないようにする</td>
                  <td>一か所の表示の切り替えなら、ヘルパーなどで足りる</td>
                </tr>
                <tr>
                  <th scope="row">ファイルの保存先</th>
                  <td>外部のファイル操作を業務のコードから分ける</td>
                  <td>Active Storage が必要な抽象を提供しているなら、重ねて包まない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            テストを通すために <code>Order</code>、<code>String</code>、<code>Logger</code>、すべてのスコープまで引数で受け取るようにすると、依存先を組み立てるコードが業務の処理より長くなります。引数にするのは、変わる・失敗する・差し替える理由が実際にある依存先です。
          </p>
          <p>
            偽物のオブジェクト（テストダブル）を使ったテストは、本物の Gateway とメソッド名や引数が食い違っていても通ります。RSpec の <code>instance_double(Payments::Gateway)</code> のような検証付きのダブルは、スタブしたメソッドが本物に存在するかと引数の数を確かめます（クラスが読み込まれていなければ確かめません）。<Ref n={19} /> それでも外部サービスの実際の応答とは食い違い得るので、SDK との境界は外部サービスのテスト環境などでも確かめます（<ChapterLink n={20} section="test-strategy" />）。
          </p>
          <p>
            為替レートと現在時刻を外から渡す例で、依存先の受け取り方・組み立てる場所・テストダブルの種類を詳しく扱った章が <ChapterLink n={40} /> です。
          </p>
        </>
      ),
    },
    {
      id: 'adapters',
      title: 'Adapter：外部サービスの応答と例外をアプリの結果に変える',
      body: (
        <>
          <p>
            外部の決済サービスの SDK（たとえば Stripe の <code>Stripe::PaymentIntent.create</code>）をコントローラー・モデル・ジョブから直接呼ぶと、金額の単位、SDK の例外、外部の状態の文字列、冪等性キーの作り方が呼び出す箇所ごとに書かれ、API が変わるとすべてを直すことになります。<Term>Adapter</Term> は、外部サービスの呼び出し方と結果を、アプリが決めた少数のメソッドと結果の形に変換するクラスです。
          </p>
          <p><code>Gateway</code> は決済に関するクラスが集まる <code>app/services/payments</code> に置きます。複数の外部 API を使うアプリでは、<code>app/clients</code> に通信の実装を、<code>app/adapters</code> に結果をアプリの型へ変換する処理をまとめる構成もあります。どちらの構成でも、業務の処理からはアプリが定めた型を使います（<ChapterLink n={101} />）。</p>
          <Code
            lang="ruby"
            title="app/services/payments/gateway.rb"
            code={`
module Payments
  ChargeResult = Data.define(:status, :reference)

  # provider はアプリで用意する SDK への接続のクラス。
  # create_charge は実在のサービスの API 名ではない。
  class Gateway
    class Unavailable < StandardError; end

    def initialize(provider: ProviderClient.new)
      @provider = provider
    end

    def charge(payment)
      response = @provider.create_charge(
        amount_minor: payment.amount_cents,
        currency: payment.currency,
        idempotency_key: payment.idempotency_key
      )
      case response.status
      when "succeeded" then ChargeResult.new(status: :succeeded, reference: response.id)
      when "declined"  then ChargeResult.new(status: :declined, reference: response.id)
      else                  ChargeResult.new(status: :pending, reference: response.id)
      end
    rescue ProviderClient::Timeout, ProviderClient::ConnectionError => e
      raise Unavailable, e.message
    end
  end
end
`}
          />
          <p>
            <code>create_charge</code> が <code>"succeeded"</code>・<code>"declined"</code>・<code>"requires_action"</code>・タイムアウトの例外を順に返す偽物の provider を渡して、<code>charge</code> を4回呼びました。
          </p>
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
#<data Payments::ChargeResult status=:succeeded, reference="ch_1">
#<data Payments::ChargeResult status=:declined, reference="ch_2">
#<data Payments::ChargeResult status=:pending, reference="ch_3">
Payments::Gateway::Unavailable: boom
`}
          />
          <p>
            <code>"requires_action"</code>（追加の認証待ち）は <code>:pending</code> に、タイムアウトは <code>Unavailable</code> に変換されました。状態を成功と失敗の2つにまとめると、認証待ちや結果不明が失われます。タイムアウトは「課金されなかった」という意味ではないので、<code>Unavailable</code> を受け取った側は、同じ冪等性キーで再試行するか状態を問い合わせます。
          </p>
          <p>
            実際に接続するときは、決済の手段、追加の認証、与信と売上の確定の違い、タイムアウトの設定、署名付きの Webhook の検証を、ProviderClient の側で扱います。カードの情報はこのクラスで保存せず、決済サービスの方式に従ってトークンなどを使います。
          </p>
          <Figure n="48-6" title="Adapter の先を本番とテストで替える" caption="前の節の Checkout と、この節の Payments::Gateway をつないだ模式図。破線はテストで差し替える部分。">
            <AdapterFigure />
          </Figure>
          <p>
            図 48-6 は前の節の <code>Checkout</code> とこの節の Gateway を、本番とテストで並べたものです。2つのクラスのコードは同じで、Gateway に渡す provider だけが替わります。Gateway が返すのはどちらも <code>ChargeResult</code> か <code>Unavailable</code> なので、外部サービスにつながずに、成功・拒否・保留・結果不明での動きを試せます。
          </p>
          <h3>Adapter が決めないこと</h3>
          <p>
            Adapter は、いつ課金するか、拒否されたら在庫を解放するかを決めません。それは Application Service やジョブが決め、業務の規則はモデルや Domain Service が持ちます。ファイルの保存も、Active Storage で足りるならその仕組みを使います（<ChapterLink n={19} section="upload" />）。
          </p>
          <h3>冪等性キーを再試行で変えない</h3>
          <p>
            冪等性キーは論理的な1回の支払いの試行ごとに一つ決め、タイムアウト後の再試行でも同じ値を使います。新しいキーで送り直すと別の要求として処理され、二重に課金されることがあります。同じキーで金額を変えて送ることもしません。
          </p>
          <p>
            Stripe の API（v1）では、あるキーで送った最初の要求のステータスコードと本文が保存され、同じキーの再試行には 500 のエラーも含めて保存した応答が返ります。キーは少なくとも24時間経つと削除されることがあり、その後は新しい要求として扱われます。同じキーで異なるパラメーターを送るとエラーになり、パラメーターの検証で失敗した要求や、実行中の別の要求と競合した要求は結果が保存されないので再試行できます。<Ref n={20} /> 再試行してよい期間と、過ぎたときの照合の方法は、こうした条件から決めます（<ChapterLink n={18} section="idempotency" />、<ChapterLink n={34} section="external-boundaries" />）。
          </p>
          <p>
            2社の決済サービスの違いを Adapter で吸収し、2つの Adapter に同じテストを当てる例は <ChapterLink n={42} /> で詳しく扱います。
          </p>
        </>
      ),
    },
    {
      id: 'msdp-connections',
      title: 'Rails のクラスと MSDP の対応',
      body: (
        <>
          <p>Service Object は、Rails アプリで複数の呼び出しをまとめるクラスなどに使われる呼び名です。このうち、一つの業務操作で保存や外部処理の順番を決めるクラスが Use Case / Application Service に当たります。</p>
          <Figure title="注文を確定するときに呼ぶ相手" caption="支払いを受付済みにする例です。矢印は呼び出す先を表します。">
            <ol className="study-flow">
              <li className="study-card">Controller<br />入力を受け取り、注文確定の操作を呼ぶ。</li>
              <li className="study-card"><ChapterLink n={44} section="idea">Use Case / Application Service</ChapterLink><br />注文の状態と処理の順番を決める。</li>
              <li className="study-card"><ChapterLink n={42} section="idea">Adapter</ChapterLink><br />決済 API の入力と結果をアプリ内の値に変換する。</li>
            </ol>
          </Figure>
          <p>Form Object は複数の入力を扱うときに、Query Object は検索条件を組み立てるときに使えます。単一モデルの操作ならモデルの公開メソッドで始め、別の画面やジョブも同じ手順を呼ぶようになった段階で、その手順を専用のクラスへ移せます。</p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>モデルとコントローラーの外にクラスを作るのは、変わる理由の違う処理が一つのメソッドに集まったときや、同じ手順を複数の呼び出し元から使うときです。まずモデルのメソッドを検討します。起動時に存在する app のサブディレクトリはオートロードの対象になります。</li>
          <li>Service Object は一つのユースケースの手順を受け持ち、操作をクラス名で表します。CRUD を包み直すだけのクラスは作らず、再開に必要な進行状態は DB に保存します。</li>
          <li>失敗は errors・Result Object・業務の例外・基盤の例外に分けて表します。トランザクションの中から <code>return</code> で抜けるとコミットされるので、業務の失敗は例外でロールバックし、外側で結果に変えます。</li>
          <li>Form Object は画面の入力の単位を表します。保存の失敗は入力欄のエラーに戻し、成功は <code>save</code> の戻り値で判断し、<code>form_with</code> には <code>url:</code> を渡します。</li>
          <li>Query Object は検索の範囲を呼び出し元から Relation で受け取ります。Relation・配列・集計値のどれを返すかで、呼び出し元が足せる操作と SQL の実行時点が決まります。</li>
          <li>Value Object は値の組で等しさを判断し、不変にします。<code>Data</code> はメンバーの中身までは凍結しません。<code>composed_of</code> の値は列へ直接代入せずに書き込みます。</li>
          <li>Application Service は手順とトランザクションを、Domain Service は一つのモデルに属さない業務の規則を受け持ちます。</li>
          <li>Strategy・Null Object・Factory・Command は、解く問題が現れたときに使います。Notifications と Rails.event は同じプロセスでの計測・記録の仕組みで、必ず届ける配信には DB に保存したイベントを使います。</li>
          <li>依存性注入は、変わる・失敗する・差し替える理由がある依存先に限ります。Adapter は外部の状態と例外をアプリの結果に変え、結果不明を失敗と区別し、冪等性キーは再試行でも変えません。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Vanilla Rails is plenty', publisher: '37signals / Jorge Manrubia', url: 'https://dev.37signals.com/vanilla-rails-is-plenty/', accessed: '2026-11-20', note: 'Service を独立した層にせず、モデルが操作を公開してコントローラーが呼ぶこと。app/models に PORO を置き、Active Record と同じく業務のモデルとして扱うこと（2022-11-08）。' },
    { title: 'Autoloading and Reloading Constants', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'オートロードパスは起動時に存在する app のサブディレクトリで、app/services のような独自のディレクトリも自動で加わること（3. config.autoload_paths、12. Custom Namespaces）。' },
    { title: 'Active Model Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_model_basics.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'ActiveModel::API・Model を include したクラスを form_with や render に渡せること、ActiveModel::Attributes の型変換と既定値、Validations。' },
    { title: 'Action View Form Helpers', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/form_helpers.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'form_with の model: と url: による送信先の決まり方。デモでは url: なしで registration_forms_path が呼ばれることを確認。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/transaction.rb（within_new_transaction）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/transaction.rb#L643-L677`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '例外が出たときだけロールバックし、それ以外の抜け方では commit_transaction を呼ぶこと。' },
    { title: 'Ruby on Rails 7.2 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/7_2_release_notes.html', accessed: '2026-11-20', version: 'Rails 7.2', note: 'return・break・throw でトランザクションのブロックを抜けたときにロールバックする非推奨の動作を削除したこと（Active Record の Removals）。' },
    { title: 'Active Record Query Interface', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'スコープとクラスメソッド、Relation のつなぎ合わせ、group と count。' },
    { title: 'Data', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Data.html', accessed: '2026-11-20', version: 'Ruby 4.0', note: '位置引数とキーワード引数、initialize の上書き、== と eql?、メンバーを書き換えるメソッドが無いこと、メンバーの値の不変性は強制しないこと、with。動作は Ruby 4.0.9 で確認。' },
    { title: 'ActiveRecord::Aggregations::ClassMethods', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Aggregations/ClassMethods.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'composed_of の mapping・allow_nil・constructor・converter、Value Object を不変として扱うこと、where に Value Object を渡す検索。' },
    { title: 'activerecord/lib/active_record/aggregations.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/aggregations.rb#L248-L284`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '読み取りで作ったオブジェクトを freeze し、書き込みでは dup.freeze して @aggregation_cache に保持すること。reload で保持した値を消すこと（11〜19行目）。' },
    { title: 'ValueObject', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/ValueObject.html', accessed: '2026-11-20', note: '値で等しさを判断するオブジェクトと、共有した可変の値が引き起こす問題（2016-11-14）。' },
    { title: 'Domain-Driven Design Reference', publisher: 'Domain Language / Eric Evans', url: 'https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf', accessed: '2026-11-20', version: '2015', note: 'Value Objects（11ページ）、Domain Events とシステムのイベントの区別（12ページ）、Services（13ページ）。' },
    { title: 'Service Layer', publisher: 'martinfowler.com（Patterns of Enterprise Application Architecture）', url: 'https://martinfowler.com/eaaCatalog/serviceLayer.html', accessed: '2026-11-20', note: 'アプリケーションの操作の一覧を定め、トランザクションを制御して応答をまとめる層。' },
    { title: 'activesupport/lib/active_support/notifications/fanout.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/notifications/fanout.rb#L8-L48`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '購読者の例外を集めて、1つならそのまま、複数なら InstrumentationSubscriberError として投げること。' },
    { title: 'activesupport/lib/active_support/event_reporter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/event_reporter.rb#L386-L399`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'notify が購読者の emit を順に呼び、例外は raise_on_error でなければエラーレポーターに報告すること。' },
    { title: 'railties/lib/rails/application/bootstrap.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/bootstrap.rb#L74-L77`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'Rails.event.raise_on_error に config.consider_all_requests_local を設定すること。' },
    { title: 'Inversion of Control Containers and the Dependency Injection pattern', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/articles/injection.html', accessed: '2026-11-20', note: 'コンストラクター注入・セッター注入・インターフェース注入と、テストでの差し替え（2004-01-23）。' },
    { title: 'Testing Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/testing.html#testing-time-dependent-code', accessed: '2026-11-20', version: 'Rails 8.1', note: 'travel_to で時刻に依存するコードをテストすること（17.2 Testing Time-Dependent Code）。' },
    { title: 'Verifying doubles', publisher: 'RSpec Mocks', url: 'https://rspec.info/features/3-13/rspec-mocks/verifying-doubles/', accessed: '2026-11-20', version: 'RSpec 3.13', note: 'スタブしたメソッドが本物に存在するかと引数の数を確かめ、クラスが未定義なら確かめないこと。' },
    { title: 'Idempotent requests', publisher: 'Stripe API Reference', url: 'https://docs.stripe.com/api/idempotent_requests', accessed: '2026-11-20', note: 'API v1 で最初の応答（500 を含む）を保存すること、24時間以上経ったキーの削除、パラメーターの不一致のエラー、結果を保存しない要求。' },
    { title: 'Ruby on Rails 8.1 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/8_1_release_notes.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'Structured Event Reporting（Rails.event）が 8.1 の新機能であること（2.2）。' },
  ],
}

export default chapter
