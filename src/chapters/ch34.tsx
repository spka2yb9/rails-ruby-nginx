import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 49-1 出発点のコードで確定する順番 ---------- */
function StartingPointFigure() {
  const steps: { x: number; lines: string[]; fill: 'box' | 'box5' | 'none'; dashed?: boolean; state: string; tone: 'acc' | 'danger' | 'muted' }[] = [
    { x: 20, lines: ['@order.save', 'BEGIN 〜 COMMIT', '注文と明細を保存'], fill: 'box', state: '確定した', tone: 'acc' },
    { x: 168, lines: ['decrement!', '明細ごとの UPDATE', '在庫 5 → 3'], fill: 'box', state: '確定した', tone: 'acc' },
    { x: 316, lines: ['Payment.create!', 'BEGIN 〜 COMMIT', '支払いの記録を保存'], fill: 'box', state: '確定した', tone: 'acc' },
    { x: 464, lines: ['Coupon#use!', '期限切れで例外'], fill: 'box5', state: '例外', tone: 'danger' },
    { x: 612, lines: ['deliver_later', 'メールの投入'], fill: 'none', dashed: true, state: '実行されない', tone: 'muted' },
  ]
  return (
    <Svg
      id="49-1"
      w={760}
      h={206}
      label="出発点の OrdersController#create を、期限切れのクーポンを指定して実行した結果。注文と明細の保存、明細ごとの在庫の UPDATE、支払いの記録の保存は、それぞれその時点で確定する。その後でクーポンの use! が例外を投げ、メールの投入は実行されない。注文1件、支払いの記録1件、在庫3が残る"
    >
      <T x={20} y={20} bold>
        OrdersController#create を上から順に実行（期限切れのクーポンを指定した場合）
      </T>
      {steps.map((s, i) => (
        <g key={s.x}>
          <Box x={s.x} y={42} w={128} h={78} lines={s.lines} fs={12} fill={s.fill} dashed={s.dashed} accent={s.tone === 'danger'} subTone="muted" />
          {i < steps.length - 1 && <Arrow x1={s.x + 128} y1={81} x2={s.x + 146} y2={81} />}
          <T x={s.x + 64} y={138} anchor="middle" fs={12} tone={s.tone} bold={s.tone !== 'muted'}>
            {s.state}
          </T>
        </g>
      ))}
      <Arrow d="M20,156 L20,164 L444,164 L444,156" plain />
      <T x={232} y={184} anchor="middle" fs={12}>
        残った記録：注文1件・支払いの記録1件・在庫 3
      </T>
      <T x={604} y={184} anchor="middle" fs={12} tone="muted">
        利用者にはエラーの画面が表示される
      </T>
    </Svg>
  )
}

/* ---------- 図 49-2 3つの段階でトランザクションを開始するクラス ---------- */
function StagesFigure() {
  const cols = [
    {
      x: 10,
      head: 'Stage 1 モデルの操作',
      top: ['OrdersController#create'],
      main: ['Order#place!', '単価の確定・状態の変更'],
      sub: 'Product#reserve!・Coupon#redeem!',
      bottom: ['COMMIT の後に', '確認メールを投入'],
      rest: '残る：複数の呼び出し元・外部の課金',
    },
    {
      x: 270,
      head: 'Stage 2 進行役のクラス',
      top: ['画面・API・管理画面'],
      main: ['Orders::Place#call', '手順と失敗の契約'],
      sub: 'Order・Product・Coupon の操作',
      bottom: ['OrderResult を返す', 'COMMIT の後にメール'],
      rest: '残る：外部の課金の部分失敗・再実行',
    },
  ]
  return (
    <Svg
      id="49-2"
      w={780}
      h={336}
      label="3つの段階の構成。Stage 1 ではコントローラーが Order#place! を呼び、place! が1つのトランザクションで在庫とクーポンの操作を行い、コミット後にメールを投入する。Stage 2 では画面・API・管理画面が Orders::Place を呼び、Orders::Place が1つのトランザクションで各モデルの操作を呼んで結果を返す。Stage 3 では受付の短いトランザクションで予約・支払い・OutboxEvent を保存し、配送役と課金のジョブが決済サービスに依頼し、ApplyOutcome が別の短いトランザクションで結果を反映する"
    >
      {cols.map((c) => (
        <g key={c.x}>
          <T x={c.x + 120} y={20} anchor="middle" bold>
            {c.head}
          </T>
          <Box x={c.x + 10} y={36} w={220} h={36} lines={c.top} fs={12} fill="box" mono={c.x === 10} />
          <Arrow x1={c.x + 120} y1={72} x2={c.x + 120} y2={92} />
          <rect x={c.x + 4} y={94} width={232} height={124} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
          <T x={c.x + 14} y={108} fs={11} tone="acc">
            1つのトランザクション
          </T>
          <Box x={c.x + 20} y={118} w={200} h={46} lines={c.main} fs={12} fill="box5" subTone="muted" />
          <Box x={c.x + 20} y={172} w={200} h={36} lines={c.sub} fs={11} fill="box" />
          <Arrow x1={c.x + 120} y1={218} x2={c.x + 120} y2={238} />
          <Box x={c.x + 10} y={240} w={220} h={44} lines={c.bottom} fs={12} fill="box" subTone="muted" />
          <T x={c.x + 120} y={306} anchor="middle" fs={11} tone="muted">
            {c.rest}
          </T>
        </g>
      ))}
      <T x={650} y={20} anchor="middle" bold>
        Stage 3 外部決済と再実行
      </T>
      <rect x={534} y={32} width={232} height={58} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <Box x={544} y={38} w={212} h={46} lines={['Orders::Place（短い tx）', '予約・Payment・OutboxEvent']} fs={12} fill="box5" subTone="muted" />
      <Arrow x1={650} y1={90} x2={650} y2={104} />
      <Box x={544} y={106} w={212} h={40} lines={['OutboxDispatchJob', '→ ChargePaymentJob']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={650} y1={146} x2={650} y2={160} />
      <Box x={544} y={162} w={212} h={34} lines="決済サービス（同じキーで依頼）" fs={12} fill="box4" />
      <Arrow x1={650} y1={196} x2={650} y2={212} />
      <rect x={534} y={214} width={232} height={58} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <Box x={544} y={220} w={212} h={46} lines={['Payments::ApplyOutcome', '結果を短い tx で反映']} fs={12} fill="box5" subTone="muted" />
      <T x={650} y={290} anchor="middle" fs={11} tone="muted">
        不明な結果は再試行・照合で決着させる
      </T>
      <T x={650} y={306} anchor="middle" fs={11} tone="muted">
        増える：予約・配送・照合の運用
      </T>
      <T x={390} y={328} anchor="middle" fs={11} tone="acc">
        破線の枠＝1つの DB トランザクション
      </T>
    </Svg>
  )
}

/* ---------- 図 49-3 Stage 3 の受付から結果の反映まで ---------- */
function PaymentFlowFigure() {
  return (
    <Svg
      id="49-3"
      w={780}
      h={352}
      label="Stage 3 の流れ。受付のトランザクションで注文・在庫の予約・支払い・OutboxEvent を保存する。配送役のジョブが未配送の行の担当を取り、課金のジョブを投入する。課金のジョブは保存済みの冪等性キーで決済サービスに依頼する。結果はジョブの戻り値か Webhook で届き、ApplyOutcome が短いトランザクションで反映する。成功なら支払いと注文を確定して通知の OutboxEvent を作り、拒否なら予約を一度だけ解放する。タイムアウトなど結果が不明なら pending のまま再試行と照合に回す"
    >
      <Box x={10} y={36} w={180} h={92} lines={['受付のトランザクション', '注文 pending・在庫の予約', 'Payment pending・キー', 'OutboxEvent']} fs={12} fill="box" bold subTone="muted" />
      <Arrow x1={190} y1={82} x2={206} y2={82} />
      <Box x={208} y={36} w={170} h={92} lines={['OutboxDispatchJob', '未配送の行の担当を取る', 'ジョブを投入', '定期実行でも拾う']} fs={12} fill="box" bold subTone="muted" />
      <Arrow x1={378} y1={82} x2={394} y2={82} />
      <Box x={396} y={36} w={166} h={92} lines={['ChargePaymentJob', '保存済みの冪等性キー', 'DB のロックを持たない']} fs={12} fill="box" bold subTone="muted" />
      <Arrow x1={562} y1={82} x2={594} y2={82} both />
      <Box x={596} y={36} w={174} h={92} lines={['決済サービス', '同じキーには', '最初の応答を返す']} fs={12} fill="box4" bold subTone="muted" />
      <Arrow x1={470} y1={128} x2={430} y2={174} />
      <T x={474} y={150} fs={11} tone="muted">
        結果
      </T>
      <Arrow x1={548} y1={128} x2={548} y2={262} dashed />
      <T x={554} y={150} fs={11} tone="danger">
        タイムアウト
      </T>
      <Arrow x1={683} y1={128} x2={683} y2={174} />
      <Box x={600} y={176} w={170} h={56} lines={['Webhook の受信', 'PaymentEvent（ID 一意）']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={600} y1={204} x2={508} y2={204} />
      <Box x={300} y={176} w={206} h={56} lines={['Payments::ApplyOutcome', '短いトランザクションで反映']} fs={12} fill="box5" bold subTone="muted" />
      <Arrow x1={350} y1={232} x2={190} y2={262} />
      <Arrow x1={420} y1={232} x2={420} y2={262} />
      <Box x={60} y={264} w={220} h={70} lines={['成功', 'Payment succeeded・Order paid', '通知の OutboxEvent']} fs={12} fill="box" bold subTone="muted" />
      <Box x={300} y={264} w={220} h={70} lines={['拒否', '予約を一度だけ解放', 'Order payment_failed']} fs={12} fill="box" bold subTone="muted" />
      <Box x={540} y={264} w={230} h={70} lines={['結果が不明', 'pending のまま', '同じキーで再試行・照合']} fs={12} fill="none" dashed bold subTone="muted" />
    </Svg>
  )
}

/* ---------- 図 49-4 処理を書く場所を決める問い ---------- */
const treeRows: [string, string, string][] = [
  ['HTTP の入力・認証・応答の選び方か', 'コントローラー', '業務の規則を書き始めたら下の行へ'],
  ['表示のための整形か', 'ヘルパー・部分テンプレート・I18n', '表示の判断が複数画面で育つなら Presenter'],
  ['誰がその対象を操作できるか', '認可済みの関連から取得する', '役割・組織の規則が増えたら Policy'],
  ['入力の形・項目どうしの検証か', 'モデルの検証・仮想属性', '画面だけの条件や複数のモデルなら Form Object'],
  ['どの保存経路でも守る条件か', 'モデルの検証と DB の制約', '同時実行で破れるならロック・条件付き UPDATE'],
  ['値の単位・等価性・計算か', '文字列・数値・Range をそのまま使う', '誤用が繰り返されるなら Value Object'],
  ['読み取り・集計か', 'スコープ・クラスメソッド', '条件が独立して増えたら Query Object'],
  ['状態を変える業務の操作か', 'モデルの業務メソッド', '独立した参加者の手順なら Application Service'],
  ['外部システムとの契約か', 'Adapter', 'Active Storage など既存の仕組みを先に確認'],
  ['非同期の実行・再試行が要るか', 'ジョブ（規則はモデル・進行役に置く）', '欠落を許さないなら outbox・冪等性・照合'],
]

function DecisionTreeFigure() {
  const top = 64
  const step = 50
  const last = top + (treeRows.length - 1) * step + 20
  return (
    <Svg
      id="49-4"
      w={780}
      h={top + treeRows.length * step + 84}
      label={`処理を書く場所を決める問い。最初に入出力・守る条件・副作用・失敗後の回復を書き出し、上から順に問いを当てはめる。${treeRows.map(([q, a, b]) => `${q}→${a}。${b}`).join('。')}。最後に、変更の理由は減ったか、トランザクションの範囲と失敗後の状態を説明できるか、Rails の標準でもっと小さく書けないかを確かめる`}
    >
      <Box x={20} y={10} w={740} h={36} lines="最初に書き出す：入力と出力・守る条件・DB の外への影響・失敗したときの回復" fs={13} fill="bg" bold />
      <Arrow x1={36} y1={46} x2={36} y2={last} plain />
      {treeRows.map(([q, a, b], i) => {
        const y = top + i * step
        return (
          <g key={q}>
            <Arrow x1={36} y1={y + 20} x2={50} y2={y + 20} plain />
            <Box x={50} y={y} w={300} h={40} lines={q} fs={12} fill="box" />
            <Arrow x1={350} y1={y + 20} x2={376} y2={y + 20} />
            <Box x={378} y={y} w={382} h={40} lines={[a, b]} fs={12} fill="bg" bold subTone="muted" />
          </g>
        )
      })}
      <Box
        x={20}
        y={top + treeRows.length * step + 6}
        w={740}
        h={64}
        lines={['最後に確かめる', '変更の理由は減ったか。委譲する先を増やしただけではないか', 'トランザクションの範囲と失敗後の状態を説明できるか。Rails の標準でもっと小さく書けないか']}
        fs={12}
        fill="bg"
        bold
        subTone="muted"
      />
    </Svg>
  )
}

const chapter: Chapter = {
  number: 34,
  part: 7,
  title: '注文処理を段階的に育てる設計',
  summary:
    'EC の注文の受付（在庫・割引・決済・メール）を例に、1つのアクションに書かれた処理を、Rails の標準機能で直す段階、進行役のクラスに分ける段階、外部決済と再実行に備える段階の3つで作り直します。各段階のコードを MySQL で動かし、トランザクションの範囲、同時の注文、課金の重複と結果の反映を確かめます。',
  goals: [
    '注文の受付で、1つの DB トランザクションで確定できる更新と、DB の外で起きる操作（課金・メール）を区別できる',
    'トランザクションだけでは在庫の競合を防げない理由と、条件付きの UPDATE・ロック・CHECK 制約での防ぎ方を説明できる',
    '外部の API をトランザクションの中で呼んだときに起きる、ロックの待ち・課金だけが残る失敗・結果が不明な状態を説明できる',
    'Rails の標準機能だけの段階、Orders::Place に進行を分ける段階、outbox と冪等性キーと照合を使う段階を、要件に応じて選べる',
    '各段階で検証する振る舞い（ロールバック・同時実行・二重送信・重複した結果）を挙げ、別々の DB 接続で検証できる',
    'Rails Way・DDD・Clean Architecture・Hexagonal Architecture の違いと、設計を一段ずつ進める判断の基準を説明できる',
  ],
  prerequisites: [14, 15, 18, 20, 30, 33],
  sections: [
    {
      id: 'order-requirements',
      title: '育てる注文処理と出発点のコード',
      body: (
        <>
          <p>
            この章では EC サイトの注文の受付を例に、1つのアクションに書かれた処理を、要件が増えるのに合わせて3つの段階で作り直します。段階ごとにコードを Rails 8.1.4.1 と MySQL 8.4 で実行し、何が直り、何が残るかを確かめます。扱う要件は次の4つです。
          </p>
          <ul>
            <li>在庫：商品ごとに在庫数を持ちます。注文された個数だけ減らし、在庫より多くは売りません。</li>
            <li>割引：利用者に配ったクーポンを、1人1回だけ使えます。割引率は 0〜100 の整数（%）で、有効期限があります。</li>
            <li>決済：注文の金額を支払いの記録として残します。Stage 3 からは外部の決済サービスで実際に課金します。</li>
            <li>メール：注文を受け付けたら、確認のメールを送ります。</li>
          </ul>
          <p>
            金額は通貨の最小単位の整数で持ち、列名の末尾を <code>_cents</code> にそろえます。円なら 1 円が 1 です。税・送料・複数の通貨は扱わず、明細の数量は正の整数とします。使うテーブルは次のとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">テーブル</th>
                  <th scope="col">主な列</th>
                  <th scope="col">内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>products</code></th>
                  <td><code>name</code>・<code>price_cents</code>・<code>stock</code></td>
                  <td>商品。現在の価格と在庫数</td>
                </tr>
                <tr>
                  <th scope="row"><code>orders</code></th>
                  <td><code>user_id</code>・<code>status</code>・<code>discount_cents</code>・<code>placed_at</code></td>
                  <td>注文。<code>status</code> は <code>draft</code>（作成中）から <code>pending</code>（受付済み）へ進む</td>
                </tr>
                <tr>
                  <th scope="row"><code>order_items</code></th>
                  <td><code>order_id</code>・<code>product_id</code>・<code>quantity</code>・<code>unit_price_cents</code></td>
                  <td>明細。注文した時点の単価を保存する</td>
                </tr>
                <tr>
                  <th scope="row"><code>payments</code></th>
                  <td><code>order_id</code>・<code>amount_cents</code>・<code>status</code></td>
                  <td>支払いの記録。Stage 3 で通貨と冪等性キーを加える</td>
                </tr>
                <tr>
                  <th scope="row"><code>coupons</code></th>
                  <td><code>user_id</code>・<code>discount_percent</code>・<code>expires_at</code></td>
                  <td>利用者に配ったクーポン</td>
                </tr>
                <tr>
                  <th scope="row"><code>coupon_redemptions</code></th>
                  <td><code>coupon_id</code>・<code>user_id</code>・<code>order_id</code></td>
                  <td>クーポンを使った記録</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>出発点のコード</h3>
          <p>最初のコードは注文の作成から通知までを、OrdersController の create アクションに書いています。</p>
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb（出発点）"
            code={`
class OrdersController < ApplicationController
  def create
    @order = current_user.orders.build(order_params)

    if @order.save
      @order.items.each do |item|
        item.product.decrement!(:stock, item.quantity)
      end
      Payment.create!(order: @order, amount: @order.total_price)
      Coupon.find(params[:coupon_id]).use!(current_user) if params[:coupon_id]
      OrderMailer.confirmation(@order).deliver_later
      redirect_to @order
    else
      render :new, status: :unprocessable_content
    end
  end
end
`}
          />
          <p>
            上から順に、注文と明細を保存し、明細ごとに商品の在庫を減らし、合計金額で Payment を作り、クーポンが指定されていれば使い、確認メールを送るジョブを投入します。正常に進めば、期待どおりの記録が残ります。期限切れのクーポンを指定した場合（A）と、在庫が1個の商品を2人が同時に注文した場合（B）を実行しました。<code>use!</code> は期限切れなら例外を投げるメソッドとし、B では2つのスレッドから create と同じ処理を呼んでいます。
          </p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4.13。SQL の値は一部を省略）"
            code={`
== A: 期限切れのクーポンを指定（マグカップの在庫は 5。2個を注文）
  BEGIN
  INSERT INTO \`orders\` (\`user_id\`, \`created_at\`, \`updated_at\`) VALUES (1, …)
  INSERT INTO \`order_items\` (\`order_id\`, \`product_id\`, \`quantity\`) VALUES (1, 1, 2)
  COMMIT
  SELECT \`order_items\`.* FROM \`order_items\` WHERE \`order_items\`.\`order_id\` = 1
  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
  UPDATE \`products\` SET \`products\`.\`stock\` = COALESCE(\`products\`.\`stock\`, 0) - 2 WHERE \`products\`.\`id\` = 1
  BEGIN
  INSERT INTO \`payments\` (\`order_id\`, \`amount_cents\`, …) VALUES (1, 2400, …)
  COMMIT
  SELECT \`coupons\`.* FROM \`coupons\` WHERE \`coupons\`.\`id\` = 1 LIMIT 1
=> Coupon::Expired: クーポンの有効期限が切れています
orders=1 payments=1 stock=3 投入されたメール=[]

== B: 在庫1の商品を2人が同時に注文
CHECK 制約なし: [:redirect, :redirect]  stock=-1  この商品の明細=2件
CHECK 制約あり: [:redirect, "ActiveRecord::CheckViolation: Mysql2::Error: Check constraint
                'products_stock_non_negative' is violated."]  stock=0  この商品の明細=2件
`}
          />
          <p>
            A では、注文の保存と支払いの記録がそれぞれ BEGIN と COMMIT で確定し、在庫の UPDATE はトランザクションの外で1文ずつ確定しました。その後でクーポンの例外が起き、メールは投入されていません。
          </p>
          <Figure n="49-1" title="出発点のコードで確定する順番" caption="上の A の実行結果を、create の各行が確定した順に並べた図。">
            <StartingPointFigure />
          </Figure>
          <p>
            図 49-1 は A の実行結果を、create の各行が確定した順に並べたものです。左の3つは例外より前に確定しているので取り消されず、利用者にはエラーの画面が表示されるのに、注文1件と支払いの記録1件が残り、在庫は 5 から 3 に減っています。どの記録が残るかは、どの行で失敗したかによって変わります。
          </p>
          <p>
            B では、2件の注文がどちらも成功し、在庫が -1 になりました。<code>decrement!</code> は Ruby で計算した値ではなく、SQL の <code>stock = COALESCE(stock, 0) - 1</code> で在庫を減らします（persistence.rb の <code>increment!</code> が <code>update_counters</code> を呼ぶ）<Ref n={2} />。同時に実行しても減らした数は失われませんが、在庫が足りるかどうかは確かめません。在庫に <code>stock &gt;= 0</code> の CHECK 制約を付けると後の UPDATE は失敗しますが、その時点で注文と明細はもう確定しているので、在庫を確保できなかった注文が残ります。
          </p>
          <p>このコードには、次の問題があります。</p>
          <ul>
            <li>途中で失敗すると、注文・支払いの記録・在庫の変更のうち、先に確定したものだけが残ります。</li>
            <li>同時の注文で在庫が負になります。CHECK 制約を足しても、注文だけが残ります。</li>
            <li><code>amount</code> と <code>total_price</code> の単位がコードから読み取れません。明細に注文時の単価を保存していないので、商品の価格を変えると過去の注文の合計も変わります。</li>
            <li><code>Coupon.find</code> は ID だけで探すので、他人に配られたクーポンも使えます。1人1回という上限も DB では守っていません。</li>
            <li>メールの投入で例外が起きた場合も、注文の失敗と同じエラー画面になります。注文は残っているので、利用者がもう一度送ると注文が2件になります。</li>
            <li>ボタンの二度押しや通信の再送で、同じ注文が2件できることを防いでいません。</li>
          </ul>
          <p>次の節で、どの更新を一緒に確定するかを決めます。その後で、3つの段階に分けてこれらの問題を直していきます。</p>
        </>
      ),
    },
    {
      id: 'transaction-design',
      title: '一緒に確定する範囲を決める',
      body: (
        <>
          <p>
            注文の作成、在庫の減算、支払いの記録、クーポンの使用は、どれも同じ DB への書き込みです。これらは1つのトランザクションにまとめ、すべて確定するか、すべて取り消すかにできます。一方、決済サービスでの実際の課金とメールの送信は DB の外で起きるので、DB のトランザクションには含められません。payments に行を INSERT することと、決済サービスが課金することは別の操作です。
          </p>
          <Code
            lang="ruby"
            title="同じ DB への書き込みを1つのトランザクションで確定する"
            code={`
ApplicationRecord.transaction do
  order.save!
  product.reserve!(quantity) # 同じ DB 接続での UPDATE
  order.payments.create!(amount_cents: order.total_cents, status: "pending")
  coupon.redeem!(user: order.user, order: order) if coupon
end
`}
          />
          <p>
            Rails のトランザクションはモデルごとではなく DB の接続ごとに働きます。Order と Product のように異なるモデルでも、同じ接続で書き込めば1つのトランザクションに入ります<Ref n={1} />。別の DB への書き込みや、外部の API の呼び出しは取り消せません。BEGIN・COMMIT・ROLLBACK の動きは<ChapterLink n={38} section="transaction" />で、Rails が BEGIN を送る仕組みと入れ子にしたときの動きは<ChapterLink n={15} section="transaction" />と「入れ子のトランザクション」で扱いました。
          </p>
          <p>
            トランザクションの中で <code>ActiveRecord::StatementInvalid</code> を rescue して、処理を続けないようにします。Rails の API ドキュメントは、一意制約の違反のような DB のエラーの後では、PostgreSQL などではトランザクションを最初からやり直すまで使えなくなると警告しています<Ref n={1} />。この章で使う <code>RecordNotUnique</code> や <code>CheckViolation</code> も StatementInvalid のサブクラスなので、トランザクションを抜けた後で rescue します。
          </p>
          <Callout kind="v72">
            <p>
              <code>ActiveRecord::CheckViolation</code> は Rails 8.1.0 で追加された例外のクラスです<Ref n={5} />。Rails 7.2 では、CHECK 制約の違反は <code>ActiveRecord::StatementInvalid</code> として投げられます。
            </p>
          </Callout>
          <p>トランザクションを開始する場所は、次のように選べます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">開始する場所</th>
                  <th scope="col">向いている場合</th>
                  <th scope="col">注意すること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">モデル</th>
                  <td><code>order.place!</code> のように、1つの概念と、その概念が所有する関連の操作</td>
                  <td>ほかの概念の進行管理まで集めない</td>
                </tr>
                <tr>
                  <th scope="row">進行役のクラス（Service Object）</th>
                  <td>在庫・注文・クーポンなど独立したモデルの更新を、1つの業務の操作として確定する</td>
                  <td>呼ぶ側と呼ばれる側がそれぞれ確定したつもりにならないよう、トランザクションを開始するクラスを1つに決める</td>
                </tr>
                <tr>
                  <th scope="row">コントローラー</th>
                  <td>その画面だけで使う、ごく小さな保存の組み合わせ</td>
                  <td>HTTP の処理と整合性が結び付く。別の呼び出し元に同じ処理を書き写し始めたら移す</td>
                </tr>
                <tr>
                  <th scope="row">ジョブ</th>
                  <td>再試行される1回分の DB の処理（処理する行の担当を取る、結果を反映する）</td>
                  <td>ジョブ全体や、時間のかかる API の呼び出しを囲まない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>トランザクションだけでは在庫の競合を防げない</h3>
          <p>
            在庫を確かめてから減らす処理をトランザクションで囲んでも、2つの注文が同時に在庫1を読めば、どちらも「買える」と判断します。在庫1の商品に対し、2つのスレッドがそれぞれトランザクションの中で在庫を読み、1以上なら 0.3 秒後に1減らして保存しました。
          </p>
          <Code
            lang="text"
            title="a: トランザクションの中で読んで確かめてから減らす（T2 は 0.1 秒遅れて開始）"
            code={`
0.05s T1 stock=1 を読む
0.17s T2 stock=1 を読む
0.36s T1 stock=0 で保存
0.47s T2 stock=0 で保存
[:ok, :ok]
stock=0
`}
          />
          <p>
            2件とも成功したのに、在庫は 0 です。1個しかない商品を2件売ったことになります。T2 が在庫を読んだ時点では、T1 はまだ保存していません。トランザクションはほかの接続が同じ行を読むことを止めないので、<ChapterLink n={38} section="concurrent-updates" />で見た更新の消失と同じことが起きています。
          </p>
          <p>
            防ぐ方法は2つあります。1つは、行をロックしてから在庫を読み直す方法で、<code>with_lock</code> や <code>lock</code> を使います（<ChapterLink n={38} section="lost-update-fix" />、<ChapterLink n={15} section="pessimistic" />）。もう1つは、在庫が足りるときだけ減らすという条件を UPDATE の WHERE に書く方法です。この章では在庫を減らす操作を次の <code>Product#reserve!</code> にまとめます。
          </p>
          <Code
            lang="ruby"
            title="app/models/product.rb"
            code={`
class Product < ApplicationRecord
  class OutOfStock < StandardError; end

  def reserve!(quantity)
    unless quantity.is_a?(Integer) && quantity.positive?
      raise ArgumentError, "quantity must be a positive integer"
    end
    changed = self.class.where(id: id).where("stock >= ?", quantity)
      .update_all(["stock = stock - ?, updated_at = ?", quantity, Time.current])
    raise OutOfStock, "在庫が不足しています" unless changed == 1
  end
end
`}
          />
          <p>
            <code>update_all</code> は変更した行の数を返します。在庫が足りなければ WHERE に一致する行がなく 0 が返るので、<code>OutOfStock</code> を投げます。a と同じ2つのスレッドで、トランザクションの中から reserve! を呼びました。
          </p>
          <Code
            lang="text"
            title="b: 条件付きの UPDATE（T1 は確保した後 0.3 秒たってから COMMIT）"
            code={`
0.50s T1 確保できた
0.81s T2 Product::OutOfStock
[:ok, "Product::OutOfStock"]
stock=0
`}
          />
          <p>
            T1 の UPDATE が行のロックを持っている間、T2 の UPDATE は待ちました。T1 の COMMIT の後、T2 の UPDATE は確定した在庫 0 に対して条件を評価し、一致する行がないので OutOfStock になりました。MySQL の既定の分離レベル REPEATABLE READ でも、スナップショットを読むのは SELECT で、UPDATE や DELETE はほかのトランザクションが確定した行に対して働きます<Ref n={6} />。
          </p>
          <p>条件付きの UPDATE を使うときは、次の点も決めておきます。</p>
          <ul>
            <li>
              <code>update_all</code> は検証とコールバックを通らないので（<ChapterLink n={14} section="skip" />）、この経路で守られる条件は WHERE に書いたものだけです。
            </li>
            <li>reserve! の後も、メモリー上の Product の <code>stock</code> は古い値のままです。続けて使うなら <code>reload</code> します。</li>
            <li>
              在庫には <code>stock &gt;= 0</code> の CHECK 制約も付けます。MySQL は INSERT や UPDATE の結果が CHECK の条件を満たさないとエラーにするので<Ref n={7} />、reserve! を通らない更新があっても負の在庫は保存されません。既存のテーブルに制約を加える手順は<ChapterLink n={27} section="indexes-constraints" />で扱います。
            </li>
            <li>
              1つの注文で複数の商品を減らすときは、デッドロックを起きにくくするため商品 ID の順に更新します。デッドロックで失敗したときは、途中から再開せずトランザクション全体をやり直します（<ChapterLink n={38} section="deadlock" />）。
            </li>
          </ul>
          <h3>外部の API をトランザクションの中で呼ぶと</h3>
          <p>
            決済サービスへの依頼を、在庫を減らしたトランザクションの中で行うとどうなるかを試しました。T1 は在庫を減らした後、決済 API の応答を待つ代わりに2秒止まります。0.1 秒後に、T2 が同じ商品の在庫を減らします。
          </p>
          <Code
            lang="text"
            title="c: トランザクションの中で外部 API を待つ"
            code={`
0.83s T1 在庫を減らす
0.83s T1 在庫を減らした
0.83s T1 決済 API の応答を待つ（2秒）
0.93s T2 在庫を減らす
2.85s T1 COMMIT
2.85s T2 在庫を減らした
2.86s T2 COMMIT
`}
          />
          <p>
            T2 の UPDATE は 0.93 秒に送られ、T1 が COMMIT した 2.85 秒まで待ちました。T1 は API の応答を待つ間も、在庫の行のロックと DB の接続を持ち続けています。決済サービスの応答が遅くなると、同じ商品の注文がすべて待たされ、待っている処理が接続を使い続けるので接続プールも足りなくなります（<ChapterLink n={15} section="pool" />）。
          </p>
          <p>
            問題は待ち時間だけではありません。API で課金が成功した後に DB の書き込みが失敗すると、DB はロールバックされますが、課金は残ります。また、API がタイムアウトしても、課金されなかったとは限りません。Stripe のドキュメントは、ネットワークのエラーで接続が切れた場合、元のリクエストが受け取られたか実行されたかはわからないと説明しています<Ref n={10} />。
          </p>
          <p>
            小さなアプリでも、外部の処理の前と後で短いトランザクションに分け、処理中を表す <code>pending</code> の状態と、外部の参照番号を DB に残します。より確実にする場合は、注文と同じトランザクションで「後で外部に送る仕事」をテーブルの行として保存し、コミットした後でジョブが取り出して送ります。この方法を <Term en="transactional outbox">transactional outbox</Term> と呼び、送る予定を保存するテーブルを outbox と呼びます<Ref n={8} />。
          </p>
          <p>
            ただし、トランザクションを分けただけでは同じ課金を2回しないこと、結果を一度だけ反映すること、結果がわからないものを回収することは保証されません。再試行には同じ冪等性キーを使い、結果の反映には一意制約とロックを使い、結果が不明なものは決済サービスの記録と照合します。これらは Stage 3 で設計します。
          </p>
        </>
      ),
    },
    {
      id: 'refactoring-stages',
      title: '3つの段階と Stage 1：Rails の標準機能で直す',
      body: (
        <>
          <p>出発点のコードを、次の3つの段階で直します。</p>
          <ol>
            <li>Stage 1：Rails の標準機能だけで、注文の受付を <code>Order#place!</code> にまとめ、1つのトランザクションで確定します。外部の決済はまだ使いません。</li>
            <li>Stage 2：画面・API・管理画面など複数の呼び出し元から同じ受付を行うようになったら、手順とトランザクションを <code>Orders::Place</code> に移し、失敗の種類を結果として返します。</li>
            <li>Stage 3：外部の決済サービスで課金するようになったら、受付と課金を別のトランザクションに分け、送信の予定・再試行・結果の反映・照合を DB の記録で追えるようにします。</li>
          </ol>
          <Figure n="49-2" title="3つの段階でトランザクションを開始するクラス" caption="この節以降のコードの構成をまとめた模式図。">
            <StagesFigure />
          </Figure>
          <p>
            図 49-2 は、各段階でトランザクションを開始するクラスと、処理を任せるクラスを並べたものです。破線の枠が1つのトランザクションで、Stage 1 と 2 では受付の更新がすべて1つの枠に入り、Stage 3 では受付と結果の反映が別々の短い枠に分かれます。下の行はその段階で解決しない問題です。段階は最後まで進める必要はなく、下の行の問題が実際の要件になったときに次へ進みます。
          </p>
          <h3>Stage 1 で使うファイル</h3>
          <p>
            小さい EC で、注文の受付が1か所からしか行われず、外部の課金もないなら、Rails の標準のクラスだけで直せます。この段階の Payment は未決済の記録で、課金はしません。メールも「受け付けました」という確認で、「支払いが完了しました」という通知ではありません。
          </p>
          <Code
            lang="text"
            code={`
app/
  controllers/orders_controller.rb
  models/order.rb
  models/order_item.rb
  models/product.rb
  models/payment.rb
  models/coupon.rb
  models/coupon_redemption.rb
  mailers/order_mailer.rb
db/migrate/   # 外部キー・NOT NULL・CHECK・一意索引
`}
          />
          <h3>コントローラー</h3>
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb（Stage 1）"
            code={`
class OrdersController < ApplicationController
  def create
    @order = current_user.orders.build(order_params)
    # current_user.coupons は、この利用者に配ったクーポンだけを返す関連
    coupon = current_user.coupons.find(params[:coupon_id]) if params[:coupon_id].present?
    @order.place!(coupon: coupon)
    redirect_to @order
  rescue ActiveRecord::RecordInvalid => error
    # 明細や支払いの記録で起きた検証エラーも、フォームの base に移す
    if error.record != @order
      error.record.errors.full_messages.each { |message| @order.errors.add(:base, message) }
    end
    render :new, status: :unprocessable_content
  rescue Product::OutOfStock, Coupon::Unavailable => error
    @order.errors.add(:base, error.message)
    render :new, status: :unprocessable_content
  end

  private

  def order_params
    # 利用者・価格・状態は入力から受け取らない
    params.expect(order: [items_attributes: [[:product_id, :quantity]]])
  end
end
`}
          />
          <p>
            クーポンは <code>current_user.coupons</code> から探すので、他人のクーポンの ID を指定すると <code>RecordNotFound</code> になり、Rails は 404 を返します。許可するパラメーターは商品 ID と数量だけで、フォームから <code>unit_price_cents</code> や <code>user_id</code> が送られても <code>params.expect</code> が取り除きます。rescue では、検証エラー、在庫不足、クーポンが使えない場合を、フォームを再表示する 422 にしています。
          </p>
          <h3>注文のモデル</h3>
          <Code
            lang="ruby"
            title="app/models/order.rb（Stage 1）"
            code={`
class Order < ApplicationRecord
  belongs_to :user
  has_many :items, class_name: "OrderItem", inverse_of: :order
  has_many :payments
  accepts_nested_attributes_for :items
  validates :items, presence: true
  validate :unique_products

  def subtotal_cents = items.sum(&:subtotal_cents)
  def total_cents = subtotal_cents - discount_cents

  def place!(coupon: nil)
    raise ArgumentError, "new order required" unless new_record?

    transaction do
      prepare_items!
      save!
      items.sort_by(&:product_id).each do |item|
        item.product.reserve!(item.quantity)
      end
      percent = coupon ? coupon.redeem!(user: user, order: self) : 0
      update!(discount_cents: subtotal_cents * percent / 100,
              status: "pending", placed_at: Time.current)
      payments.create!(amount_cents: total_cents, status: "pending")
      ActiveRecord.after_all_transactions_commit do
        OrderMailer.confirmation(id).deliver_later
      end
    end
    self
  end

  private

  def unique_products
    ids = items.map(&:product_id)
    errors.add(:items, "に同じ商品を重複して指定できません") if ids.uniq.size != ids.size
  end

  def prepare_items!
    ids = items.map(&:product_id).uniq.sort
    products = Product.where(id: ids).order(:id).lock.index_by(&:id)
    items.each do |item|
      product = products[item.product_id]
      raise ActiveRecord::RecordNotFound, "product not found" unless product
      item.product = product
      item.unit_price_cents = product.price_cents # 注文した時点の単価を保存する
    end
  end
end

class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product
  validates :quantity, numericality: { only_integer: true, greater_than: 0 }

  def subtotal_cents = unit_price_cents * quantity
end
`}
          />
          <p>
            <code>discount_cents</code> は DB で既定値 0・NOT NULL、<code>status</code> は既定値 <code>"draft"</code> にしています。place! は新しい注文に対してだけ呼べる受付の操作で、トランザクションの中で次の順に処理します。
          </p>
          <ol>
            <li>prepare_items! が、明細の商品を ID の順に <code>SELECT ... FOR UPDATE</code> でロックして読み、商品の現在の価格を明細の <code>unit_price_cents</code> に写します。ロックしているので、受付の途中で価格が変わることはありません。販売を停止した商品を拒否するといった条件も、ここに加えます。</li>
            <li>
              save! で注文と明細を保存します。明細の数量は OrderItem の検証で確かめます。has_many は新しい関連先を既定で検証する（<code>validate: true</code>）ので、<code>validates_associated</code> は付けていません<Ref n={4} />。
            </li>
            <li>商品 ID の順に reserve! で在庫を減らします。</li>
            <li>クーポンがあれば使い、割引額（整数の割り算なので端数は切り捨て）、状態 <code>pending</code>、受付の日時を保存します。</li>
            <li>支払いの記録を作り、確認メールの投入を <code>ActiveRecord.after_all_transactions_commit</code> に登録します。</li>
          </ol>
          <p>
            after_all_transactions_commit に渡したブロックは、開いているトランザクションがすべてコミットされた後に呼ばれ、どれかがロールバックされると呼ばれません<Ref n={3} />。メールのジョブがまだコミットされていない注文を読もうとする問題（<ChapterLink n={18} section="transaction" />）を避けられます。Mailer は <code>confirmation(order_id)</code> で ID を受け取り、ジョブの中で注文を読み直します。ただし、コミットした後でジョブの投入に失敗しても注文は取り消されないので、投入の失敗に気づいて再送する手段は別に必要です。
          </p>
          <h3>クーポンと DB の制約</h3>
          <Code
            lang="ruby"
            title="app/models/coupon.rb・coupon_redemption.rb"
            code={`
class Coupon < ApplicationRecord
  class Unavailable < StandardError; end
  belongs_to :user
  has_many :redemptions, class_name: "CouponRedemption"

  def redeem!(user:, order:)
    with_lock do
      # この例では、クーポンは利用者ごとに配り、1人1回まで使える
      usable = user_id == user.id && expires_at.future? &&
               !redemptions.exists?(user_id: user.id)
      raise Unavailable, "クーポンを利用できません" unless usable
      redemptions.create!(user: user, order: order)
      discount_percent
    end
  end
end

class CouponRedemption < ApplicationRecord
  belongs_to :coupon
  belongs_to :user
  belongs_to :order
end
`}
          />
          <p>
            redeem! は <code>with_lock</code> でクーポンの行をロックしてから、持ち主・期限・使用済みかを確かめます。同じクーポンを使う2つの注文が同時に来ても、後の注文は前の注文のコミットを待ってから、使用済みかを確かめます。with_lock は外側のトランザクションに参加するので、クーポンが使えずに例外になれば、注文・在庫・支払いの記録もまとめて取り消されます。ロックを取る順番はどの書き込みの経路でも「商品 → クーポン」にそろえます。モデルの確認に加えて、DB にも次の制約を付けます。
          </p>
          <Code
            lang="ruby"
            title="db/migrate の抜粋（外部キーと NOT NULL は省略）"
            code={`
add_check_constraint :products, "stock >= 0", name: "products_stock_non_negative"
add_check_constraint :products, "price_cents >= 0", name: "products_price_non_negative"
add_check_constraint :order_items, "quantity > 0", name: "order_items_quantity_positive"
add_check_constraint :coupons, "discount_percent BETWEEN 0 AND 100", name: "coupons_percent_range"
add_index :order_items, [:order_id, :product_id], unique: true
add_index :coupon_redemptions, [:coupon_id, :user_id], unique: true
`}
          />
          <p>
            モデルの確認は利用者にわかる言葉でエラーを返すためのもので、DB の制約は、同時の書き込みやモデルを通らない経路の書き込みでも条件が破られないようにするためのものです。一意性の検証だけでは同時の保存で重複が起きることは、<ChapterLink n={14} section="uniqueness" />で確かめました。
          </p>
          <h3>実行して確かめる</h3>
          <p>
            クーポン（10%）を持つ alice が、トート（3,000、在庫 5）1個とマグカップ（1,200、在庫 5）2個を注文しました。コントローラーと同じ処理をメソッドとして呼んでいます。
          </p>
          <Code
            lang="text"
            title="Stage 1 の実行結果（日時の値は省略）"
            code={`
SELECT \`coupons\`.* FROM \`coupons\` WHERE \`coupons\`.\`user_id\` = 1 AND \`coupons\`.\`id\` = 1 LIMIT 1
BEGIN
SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` IN (1, 2) ORDER BY \`products\`.\`id\` ASC FOR UPDATE
INSERT INTO \`orders\` (\`user_id\`, \`created_at\`, \`updated_at\`) VALUES (1, …)
INSERT INTO \`order_items\` (\`order_id\`, \`product_id\`, \`quantity\`, \`unit_price_cents\`) VALUES (1, 2, 1, 3000)
INSERT INTO \`order_items\` (\`order_id\`, \`product_id\`, \`quantity\`, \`unit_price_cents\`) VALUES (1, 1, 2, 1200)
UPDATE \`products\` SET stock = stock - '2', updated_at = … WHERE \`products\`.\`id\` = 1 AND (stock >= '2')
UPDATE \`products\` SET stock = stock - '1', updated_at = … WHERE \`products\`.\`id\` = 2 AND (stock >= '1')
SELECT \`coupons\`.* FROM \`coupons\` WHERE \`coupons\`.\`id\` = 1 LIMIT 1 FOR UPDATE
SELECT 1 AS one FROM \`coupon_redemptions\` WHERE \`coupon_redemptions\`.\`coupon_id\` = 1 AND \`coupon_redemptions\`.\`user_id\` = 1 LIMIT 1
INSERT INTO \`coupon_redemptions\` (\`coupon_id\`, \`user_id\`, \`order_id\`) VALUES (1, 1, 1)
UPDATE \`orders\` SET \`orders\`.\`status\` = 'pending', \`orders\`.\`discount_cents\` = 540, … WHERE \`orders\`.\`id\` = 1
INSERT INTO \`payments\` (\`order_id\`, \`amount_cents\`, \`status\`, …) VALUES (1, 4860, 'pending', …)
COMMIT
subtotal=5400 discount=540 total=4860 status=pending 明細の単価=[3000, 1200]
在庫（マグカップ, トート）=[3, 4] 投入されたジョブ=["OrderMailer#confirmation"]
`}
          />
          <p>
            BEGIN から COMMIT までに、商品のロック、注文と明細の INSERT、在庫の条件付き UPDATE（商品 ID の順）、クーポンのロックと使用の記録、注文の更新、支払いの記録が入っています。合計 5,400 から 10% を引いた 4,860 が支払いの記録になり、確認メールのジョブはコミットの後で1件投入されました。続けて、失敗する場合を試しました。
          </p>
          <Code
            lang="text"
            title="失敗する場合（エラーの文はロケールを設定していないので英語のまま）"
            code={`
同じクーポンをもう一度   => [:render_new, ["クーポンを利用できません"]]  new_record?=true id=nil
                            （SQL は … SELECT 1 AS one FROM coupon_redemptions … の後に ROLLBACK）
他人のクーポンの ID      => ActiveRecord::RecordNotFound: Couldn't find Coupon with 'id'=2
                            [WHERE \`coupons\`.\`user_id\` = ?]
数量 0                   => [:render_new, ["Items quantity must be greater than 0"]]
同じ商品を2行            => [:render_new, ["Items に同じ商品を重複して指定できません"]]
（ここまでの失敗の後も orders=1 items=2 payments=1 redemptions=1 在庫=[3, 4]）

在庫1の商品を2人が同時に注文
  => [[:redirect, 3], [:render_new, ["在庫が不足しています"]]]  stock=0  この商品の明細=1件
`}
          />
          <p>
            どの失敗でも、注文・明細・在庫・支払いの記録は変わっていません。ロールバックの後、注文のオブジェクトは <code>new_record?</code> が true、<code>id</code> が nil に戻るので、そのままフォームを再表示できます。在庫1の商品への同時の注文では、後の注文が商品のロックを待ち、在庫 0 に対する条件付きの UPDATE で OutOfStock になりました。
          </p>
          <h3>二重送信を防ぐ</h3>
          <p>
            ボタンの二度押しや、応答が届かなかったときのブラウザーの再送では、同じ内容の注文が2回届きます。注文に利用者ごとに一意な <code>request_key</code> を持たせると、Stage 1 のままでも防げます。フォームを表示するときに UUID を作って隠し項目に入れ、<code>(user_id, request_key)</code> に一意索引を付けます。
          </p>
          <Code
            lang="ruby"
            title="OrdersController#create の抜粋（order_params で :request_key も許可する）"
            code={`
def create
  @order = current_user.orders.build(order_params)
  @order.place!(coupon: coupon)
  redirect_to @order
rescue ActiveRecord::RecordNotUnique
  existing = current_user.orders.find_by(request_key: @order.request_key)
  raise unless existing # ほかの一意制約の違反は、そのまま上げる
  if same_items?(existing, @order)
    redirect_to existing # 同じ操作の再送。受け付けた注文を返す
  else
    head :conflict       # 同じキーで内容が違う
  end
  # （RecordInvalid などの rescue は Stage 1 と同じ）
end

def same_items?(a, b)
  key = ->(order) { order.items.map { |item| [item.product_id, item.quantity.to_i] }.sort }
  key.(a) == key.(b)
end
`}
          />
          <Code
            lang="text"
            title="実行結果（マグカップの在庫は 5）"
            code={`
1回目                => [:created, 1]
同じキー・同じ内容   => [:already_placed, 1]   （RecordNotUnique の後で既存の注文を返した）
同じキー・違う内容   => [:conflict, 1]
orders=1 stock=3 投入されたメール=["OrderMailer#confirmation"]
`}
          />
          <p>
            2回目は orders への INSERT が一意索引に違反し、トランザクションごとロールバックされました。既に受け付けた注文があれば、内容が同じならその注文を返し、内容が違えば別の操作として拒否します。キーは「1回の注文の操作」ごとに固定し、再送のたびに作り直しません。
          </p>
          <div className="table-wrap">
            <table>
              <caption>Stage 1 の評価</caption>
              <tbody>
                <tr>
                  <th scope="row">利点</th>
                  <td>Rails の保存・関連・ロックだけで整合性を直せる。受付の操作が <code>place!</code> にまとまる</td>
                </tr>
                <tr>
                  <th scope="row">欠点</th>
                  <td>注文のモデルが受付の手順全体を知っている。メールの投入漏れは回収できない</td>
                </tr>
                <tr>
                  <th scope="row">向いている場合</th>
                  <td>呼び出し元が少なく、外部の課金がない受付。チームの人数より、失敗の種類の多さで判断する</td>
                </tr>
                <tr>
                  <th scope="row">次へ進む兆候</th>
                  <td>管理画面や API からも同じ受付を行う。外部決済を加える。処理の途中から再開したい</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'workflow-contracts',
      title: 'Stage 2：受付の手順を Orders::Place に分ける',
      body: (
        <>
          <p>
            API と管理画面からも注文を受け付けるようになり、在庫・注文・クーポンの手順がそれぞれ別の理由で変わり始めたら、受付の手順とトランザクションを <code>Orders::Place</code> に移します。明細の金額の計算、在庫の確保、クーポンの使用条件は、それぞれのモデルに残します。Service Object の引数・戻り値・失敗の表し方の一般的な決め方は<ChapterLink n={33} section="service-contract" />で扱うので、ここでは注文の受付に当てはめた形を示します。
          </p>
          <Code
            lang="text"
            code={`
app/
  controllers/orders_controller.rb
  services/orders/place.rb
  models/order.rb          # Stage 1 の関連・検証・金額の計算・prepare_items! を残す
  models/order_item.rb
  models/product.rb
  models/coupon.rb
  models/payment.rb
  models/order_result.rb
  policies/order_policy.rb
  mailers/order_mailer.rb
`}
          />
          <Code
            lang="ruby"
            title="OrderPolicy と、Order に加える受付の一部の操作"
            code={`
class OrderPolicy
  def initialize(actor, order)
    @actor, @order = actor, order
  end

  def place?
    @order.user_id == @actor.id
  end
end

class Order < ApplicationRecord
  class InvalidTransition < StandardError; end

  # 上位のトランザクションの中で呼ぶ
  def prepare_for_placement!
    raise InvalidTransition, "new draft required" unless new_record? && status == "draft"
    prepare_items!
    save!
  end

  def mark_pending!(discount_percent:)
    raise InvalidTransition, "draft required" unless status == "draft"
    unless discount_percent.is_a?(Integer) && discount_percent.between?(0, 100)
      raise ArgumentError, "invalid discount"
    end
    update!(discount_cents: subtotal_cents * discount_percent / 100,
            status: "pending", placed_at: Time.current)
  end
end
`}
          />
          <p>
            OrderPolicy は、注文を確定しようとしている人がその注文の持ち主かを決めます（レコードごとの認可は<ChapterLink n={21} section="object-authorization" />）。Order の2つのメソッドは上位のトランザクションの中で呼ばれる、受付の一部です。prepare_for_placement! は新しい下書きの注文にしか使えないので、既存の下書きを編集しながら確定する仕様にするなら、注文の行のロックと明細の同時更新への対策を加えます。mark_pending! は割引率を 0〜100 の整数に限り、状態が <code>draft</code> のときだけ受付済みにします。
          </p>
          <Code
            lang="ruby"
            title="app/models/order_result.rb・app/services/orders/place.rb"
            code={`
OrderResult = Data.define(:order, :code, :errors) do
  def success? = code == :ok
end

module Orders
  class Place
    class NotAuthorized < StandardError; end

    def call(order:, actor:, coupon: nil)
      raise NotAuthorized unless OrderPolicy.new(actor, order).place?

      ApplicationRecord.transaction do
        order.prepare_for_placement!
        order.items.sort_by(&:product_id).each do |item|
          item.product.reserve!(item.quantity)
        end
        percent = coupon ? coupon.redeem!(user: actor, order: order) : 0
        order.mark_pending!(discount_percent: percent)
        order.payments.create!(amount_cents: order.total_cents, status: "pending")
        ActiveRecord.after_all_transactions_commit do
          OrderMailer.confirmation(order.id).deliver_later
        end
      end
      OrderResult.new(order: order, code: :ok, errors: {})
    rescue ActiveRecord::RecordInvalid => error
      OrderResult.new(order: order, code: :invalid,
                      errors: { base: error.record.errors.full_messages })
    rescue Product::OutOfStock
      OrderResult.new(order: order, code: :out_of_stock,
                      errors: { base: ["在庫が不足しています"] })
    rescue Coupon::Unavailable
      OrderResult.new(order: order, code: :coupon_unavailable,
                      errors: { base: ["クーポンを利用できません"] })
    end
  end
end
`}
          />
          <p>
            トランザクションを開始するのは Orders::Place だけで、各モデルの操作はその中で呼ばれ、自分ではコミットしません。例外はトランザクションの外（メソッドの rescue）で結果のオブジェクトに変えるので、結果を返す時点でロールバックは終わっています。OrderResult は <code>Data.define</code> で作った値のクラスで、<code>code</code> が <code>:ok</code> のときに <code>success?</code> が true を返します。
          </p>
          <p>
            結果に変えるのは、利用者が入力を直せば解決する失敗（検証エラー、在庫不足、使えないクーポン）だけです。権限がない（NotAuthorized）、対象がない（RecordNotFound）、状態が合わない（InvalidTransition）は例外のまま上げ、HTTP を扱う層でそれぞれ 403・404・409 に変えます。DB の障害や想定外の例外を入力エラーに変えると、再試行すべき障害が利用者の入力の誤りとして扱われてしまいます。
          </p>
          <Code
            lang="ruby"
            title="OrdersController#create の中心部分（パラメーターと認証は Stage 1 と同じ）"
            code={`
@order = current_user.orders.build(order_params)
coupon = current_user.coupons.find(params[:coupon_id]) if params[:coupon_id].present?
result = Orders::Place.new.call(order: @order, actor: current_user, coupon: coupon)

if result.success?
  redirect_to result.order
else
  result.errors.each do |field, messages|
    messages.each { |message| @order.errors.add(field, message) }
  end
  render :new, status: :unprocessable_content
end
`}
          />
          <p>マグカップ（在庫 2）と 10% のクーポンで、画面と API から呼んだ場合を試しました。</p>
          <Code
            lang="text"
            title="Stage 2 の実行結果"
            code={`
画面から（クーポンあり）         code=ok success=true errors={} order.id=1 status=pending
API から（同じクーポンをもう一度） code=coupon_unavailable success=false
                                  errors={base: ["クーポンを利用できません"]} order.id=nil status=draft
在庫より多い数量                 code=out_of_stock errors={base: ["在庫が不足しています"]} order.id=nil
数量 0                           code=invalid errors={base: ["Items quantity must be greater than 0"]} order.id=nil
他人の注文を指定                 => Orders::Place::NotAuthorized
受付済みの注文をもう一度         => Order::InvalidTransition: new draft required
orders=1 stock=1 投入されたメール=["OrderMailer#confirmation"]
`}
          />
          <p>
            どの呼び出し元から呼んでも、同じ手順で処理され、同じ種類の結果が返ります。失敗した注文は保存されず、在庫も変わっていません。
          </p>
          <p>
            Stage 1 から移すときは、古い <code>place!</code> や、保存のコールバックで送っていた通知を残さないようにします。新しい呼び出し元と古い呼び出し元が混在すると、同じ注文に確認メールが2通出ます。呼び出し元を一度に切り替え、通知の回数をテストで確かめます。
          </p>
          <div className="table-wrap">
            <table>
              <caption>Stage 2 の評価</caption>
              <tbody>
                <tr>
                  <th scope="row">利点</th>
                  <td>呼び出し元が増えても、手順・トランザクション・失敗の契約を共有できる。規則はモデルに残る</td>
                </tr>
                <tr>
                  <th scope="row">欠点</th>
                  <td>モデルの操作が「上位のトランザクションの中で呼ぶ」という前提を持つ。結果とモデルの errors の対応や、クラスの間の取り決めが増える</td>
                </tr>
                <tr>
                  <th scope="row">向いている場合</th>
                  <td>API や管理画面など複数の呼び出し元があり、受付の手順が独立して変わるアプリ</td>
                </tr>
                <tr>
                  <th scope="row">限界</th>
                  <td>外部決済との整合、メールの投入漏れ、二重送信は、クラスを分けただけでは解決しない</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'external-boundaries',
      title: 'Stage 3：外部決済・部分失敗・再実行を設計する',
      body: (
        <>
          <p>
            外部の決済サービスで課金するようになると、課金の成否を DB のトランザクションの中で確定できなくなります。そこで課金の前と後で処理を分け、どこまで進んだかを DB の行として保存します。このためにアプリ全体へ DDD のレイヤーや Repository を入れる必要はありません。使うのは Stage 2 の進行役とモデルの操作、外部との通信を受け持つ Adapter（<ChapterLink n={33} section="adapters" />）、ジョブです。
          </p>
          <Code
            lang="text"
            code={`
app/
  services/orders/place.rb
  services/payments/apply_outcome.rb
  models/inventory_reservation.rb
  models/payment.rb               # currency・idempotency_key・provider_charge_id を加える
  models/outbox_event.rb
  models/payment_event.rb         # Webhook で受け取ったイベント
  adapters/payments/gateway.rb
  jobs/outbox_dispatch_job.rb
  jobs/charge_payment_job.rb
  jobs/apply_payment_event_job.rb
  jobs/reconcile_payments_job.rb
  controllers/payment_webhooks_controller.rb
`}
          />
          <Figure n="49-3" title="Stage 3 の受付から結果の反映まで" caption="この節のコードの流れをまとめた模式図。">
            <PaymentFlowFigure />
          </Figure>
          <p>
            図 49-3 は注文を受け付けてから決済の結果を反映するまでの流れで、上の段は左から、受付のトランザクション、配送役のジョブ、課金のジョブ、決済サービスです。課金の結果はジョブが受け取る応答か Webhook の通知で届き、中段の ApplyOutcome が短いトランザクションで反映します。下の段は結果ごとの処理です。DB のロックを持ったまま外部と通信する箇所はありません。
          </p>
          <h3>受付のトランザクション</h3>
          <Code
            lang="ruby"
            title="Orders::Place#call の受付部分（Stage 3）"
            code={`
ApplicationRecord.transaction do
  order.prepare_for_placement!
  InventoryReservation.reserve_for!(order)
  percent = coupon ? coupon.redeem!(user: actor, order: order) : 0
  order.mark_pending!(discount_percent: percent)
  payment = order.payments.create!(
    amount_cents: order.total_cents, currency: order.currency,
    status: "pending", idempotency_key: SecureRandom.uuid
  )
  OutboxEvent.create!(
    kind: "payment.charge_requested",
    deduplication_key: "charge-request:#{payment.id}",
    payload: { "payment_id" => payment.id }
  )
  ActiveRecord.after_all_transactions_commit do
    OrderMailer.confirmation(order.id).deliver_later
    OutboxDispatchJob.perform_later # すぐに配送を試みる。定期実行でも拾う
  end
end
`}
          />
          <p>
            Stage 2 との違いは3つです。在庫は <code>InventoryReservation.reserve_for!</code> で減らし、どの注文が何個をいつまで確保したかを予約の行として残します。支払いの記録には通貨と<Term en="idempotency key">冪等性キー</Term>を保存します。冪等性キーは、同じ操作を再送したことを決済サービスに伝えるための値です。そして、課金の依頼を OutboxEvent の行として同じトランザクションで保存します。
          </p>
          <p>
            <code>payments.idempotency_key</code> と <code>outbox_events.deduplication_key</code> には一意索引を付けます。Stage 1 の <code>request_key</code> の一意索引も残します。冪等性キーで防げるのは同じ支払いを2回課金することで、同じ注文が2件作られることは防げないからです。クーポンも受付で使用の記録を作り、決済の拒否が確定したら記録を消して使えるように戻すなど、仮の使用と確定を分けて扱います。
          </p>
          <Code
            lang="ruby"
            title="app/models/inventory_reservation.rb"
            code={`
class InventoryReservation < ApplicationRecord
  belongs_to :order
  belongs_to :product

  def self.reserve_for!(order, ttl: 30.minutes)
    order.items.sort_by(&:product_id).each do |item|
      item.product.reserve!(item.quantity)
      create!(order: order, product: item.product,
              quantity: item.quantity, expires_at: ttl.from_now)
    end
  end

  def self.release_for!(order)
    where(order: order, released_at: nil).order(:product_id).each do |reservation|
      released = where(id: reservation.id, released_at: nil)
        .update_all(released_at: Time.current)
      next unless released == 1 # ほかの処理が先に解放した
      Product.where(id: reservation.product_id)
        .update_all(["stock = stock + ?", reservation.quantity])
    end
  end
end
`}
          />
          <p>
            release_for! は、予約の行の <code>released_at</code> を条件付きの UPDATE で埋め、埋められたとき（変更した行が1件のとき）だけ在庫を戻します。拒否の結果が2回届いても、在庫は一度しか戻りません。
          </p>
          <h3>配送役と課金のジョブ</h3>
          <Code
            lang="ruby"
            title="app/models/outbox_event.rb・app/jobs/outbox_dispatch_job.rb"
            code={`
class OutboxEvent < ApplicationRecord
  LEASE = 5.minutes
  scope :ready, -> {
    where(dispatched_at: nil)
      .where("claimed_until IS NULL OR claimed_until < ?", Time.current)
  }

  # 期限付きで担当を取る。ほかの配送役が先に取っていれば false
  def claim!
    self.class.ready.where(id: id).update_all(claimed_until: LEASE.from_now) == 1
  end
end

class OutboxDispatchJob < ApplicationJob
  def perform
    OutboxEvent.ready.order(:id).limit(100).each do |event|
      next unless event.claim!
      case event.kind
      when "payment.charge_requested"
        ChargePaymentJob.perform_later(event.payload["payment_id"])
      when "order.paid_mail"
        OrderMailer.paid(event.payload["order_id"]).deliver_later
      end
      event.update!(dispatched_at: Time.current)
    end
  end
end
`}
          />
          <p>
            配送役はまだ送っていない行を読み、claim! でその行の担当を期限付きで取ってからジョブを投入し、送った時刻を記録します。期限付きの担当を<Term en="lease">リース</Term>と呼びます。claim! は reserve! と同じ条件付きの UPDATE なので、2つの配送役が同じ行を読んでも、担当を取れるのは片方だけです。ジョブを投入した後、送った時刻を記録する前にプロセスが止まると、リースの期限が過ぎてから同じ行がもう一度送られます。outbox で保証できるのは「少なくとも1回」送ることで、AWS の解説も重複したメッセージに備えて、受け取る側を冪等にするよう勧めています<Ref n={8} />。受付の直後に配送役を投入するのは待ち時間を短くするためです。コミットの直後にプロセスが止まって投入が失われた場合に備え、配送役は定期実行でも動かします（<ChapterLink n={18} section="recurring-jobs" />）。
          </p>
          <Code
            lang="ruby"
            title="app/adapters/payments/gateway.rb・app/jobs/charge_payment_job.rb"
            code={`
module Payments
  class Gateway
    class Unavailable < StandardError; end # 接続の失敗・タイムアウト。課金されたかは不明
    Outcome = Data.define(:status, :charge_id, :amount_cents, :currency)

    def initialize(client: PaymentClient.default) # 決済事業者の SDK を包んだオブジェクト
      @client = client
    end

    def charge(payment)
      res = @client.create_charge(
        amount: payment.amount_cents, currency: payment.currency,
        metadata: { payment_id: payment.id },
        idempotency_key: payment.idempotency_key # 受付で保存した値を毎回使う
      )
      Outcome.new(status: res[:status], charge_id: res[:id],
                  amount_cents: res[:amount], currency: res[:currency])
    rescue Timeout::Error => e # 実際には SDK の接続エラーの例外も並べる
      raise Unavailable, e.message
    end
  end
end

class ChargePaymentJob < ApplicationJob
  retry_on Payments::Gateway::Unavailable, wait: 10.seconds, attempts: 5

  def perform(payment_id)
    payment = Payment.find(payment_id)
    return unless payment.status == "pending"

    # 外部への通信は DB のトランザクションやロックの外で行う
    outcome = Payments::Gateway.new.charge(payment)
    Payments::ApplyOutcome.new.call(payment_id: payment.id, outcome: outcome)
  end
end
`}
          />
          <p>
            Gateway は決済事業者の SDK の呼び出し方と応答を、アプリの言葉に変える Adapter です。応答を <code>Outcome</code>（状態・課金の ID・金額・通貨）に変え、タイムアウトや接続の失敗は <code>Unavailable</code> に変えます。課金のジョブは支払いが <code>pending</code> でなければ何もしません。Unavailable なら retry_on で同じジョブを再試行し（Sidekiq の再試行との関係は<ChapterLink n={18} section="retry" />）、結果の反映は ApplyOutcome に任せます。テストで Gateway の代わりに別の実装を渡す方法は<ChapterLink n={33} section="dependency-injection" />で扱います。
          </p>
          <p>
            冪等性キーは試行のたびに作らず、受付のときに payments に保存した値を毎回使います。Stripe は同じキーの2回目以降のリクエストに、最初の結果を返します。キーは少なくとも 24 時間保持した後で削除することがあり、削除された後で同じキーを使うと新しいリクエストとして扱われます。同じキーで異なるパラメーターを送るとエラーになります<Ref n={9} />。結果が不明な操作の再試行は、元のリクエストから 24 時間以内に同じキーとパラメーターで行い、それを過ぎても不明なら再試行をやめて照合するよう勧めています<Ref n={10} />。retry_on の回数を使い切っても <code>pending</code> のまま残った支払いは、照合のジョブ（reconcile_payments_job.rb）が決済サービスの記録を問い合わせて決着させます。
          </p>
          <h3>結果の反映</h3>
          <Code
            lang="ruby"
            title="app/services/payments/apply_outcome.rb"
            code={`
module Payments
  class ApplyOutcome
    FINAL = %w[succeeded declined].freeze

    def call(payment_id:, outcome:)
      ApplicationRecord.transaction do
        payment = Payment.find(payment_id)
        order = Order.lock.find(payment.order_id) # どの経路も Order → Payment の順にロックする
        payment.lock!
        if FINAL.include?(payment.status)
          :already_final # 確定した結果を、後から届いた結果で上書きしない
        elsif outcome.amount_cents != payment.amount_cents ||
              outcome.currency != payment.currency
          payment.update!(status: "needs_review") # 照合の対象として残す
          :mismatch
        elsif outcome.status == :succeeded
          payment.update!(status: "succeeded", provider_charge_id: outcome.charge_id)
          order.update!(status: "paid")
          OutboxEvent.create!(kind: "order.paid_mail",
                              deduplication_key: "paid-mail:#{order.id}",
                              payload: { "order_id" => order.id })
          :succeeded
        elsif outcome.status == :declined
          payment.update!(status: "declined")
          order.update!(status: "payment_failed")
          InventoryReservation.release_for!(order)
          :declined
        else
          :still_pending # 処理中という結果では状態を変えない
        end
      end
    end
  end
end
`}
          />
          <p>
            ApplyOutcome は注文 → 支払いの順に行をロックし、ロックした後の最新の状態で判断します。課金のジョブも Webhook のジョブもこの同じ操作を呼ぶので、どちらが先に届いても、同じ結果を2回受け取っても、状態は1回しか変わりません。<code>succeeded</code> か <code>declined</code> で確定した支払いは、後から届いた結果で上書きしません。金額や通貨が支払いの記録と違えば、状態を <code>needs_review</code> にして照合の対象にします。成功したら支払いと注文を更新し、支払い完了のメールを送る OutboxEvent を同じトランザクションで作ります。拒否されたら予約を解放します。注文の状態の集合と遷移の条件の決め方は<ChapterLink n={30} section="state-management" />で扱います。
          </p>
          <h3>Webhook で届く結果</h3>
          <p>
            決済サービスは課金の結果を <Term en="webhook">Webhook</Term>（決済サービスからアプリへ送られる HTTP の通知）でも送ってきます。Stripe のドキュメントは、署名を検証すること、同じイベントが複数回届くことがあるのでイベント ID を記録して処理済みのものを飛ばすこと、イベントが生成された順に届くとは限らないこと、時間のかかる処理の前に 2xx を返すことを求めています<Ref n={11} />。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/payment_webhooks_controller.rb（決済サービスとの通信を含むため、この部分は実行していない）"
            code={`
class PaymentWebhooksController < ActionController::API
  def create
    event = Payments::Gateway.new.verify_event!(
      request.raw_post, request.headers["Stripe-Signature"]
    ) # 署名が合わなければ InvalidSignature
    record = PaymentEvent.create!(provider_event_id: event.id, payload: event.to_h)
    ApplyPaymentEventJob.perform_later(record.id)
    head :ok
  rescue ActiveRecord::RecordNotUnique
    head :ok # 同じイベントの再送。保存済みなので処理しない
  rescue Payments::Gateway::InvalidSignature
    head :bad_request
  end
end
`}
          />
          <p>
            受け取ったイベントは署名を確かめてから payment_events に保存し、処理はジョブに任せてすぐに 200 を返します。<code>provider_event_id</code> に一意索引があるので、同じイベントの再送は RecordNotUnique になり、保存済みとして 200 を返します。保存した後でジョブの投入に失敗しても、<code>processed_at</code> が空の行を定期的に読み直せば処理できます。ApplyPaymentEventJob は、イベントのアカウント・支払いの ID・金額が自分の記録と合うことを確かめてから ApplyOutcome を呼びます。
          </p>
          <h3>実行して確かめる</h3>
          <p>
            決済サービスの代わりに、同じ冪等性キーには保存した応答を返すオブジェクトを用意しました。1回目の課金だけ、課金した後で応答が届かない（タイムアウトする）ようにしています。マグカップ（1,200、在庫 3）を2個注文しました。
          </p>
          <Code
            lang="text"
            title="Stage 3 の実行結果（表示を整えた）"
            code={`
== 1: 受付
order=pending payment=pending amount=2400 stock=1 reservations=1
outbox=[["payment.charge_requested", 未配送]]
投入されたジョブ=["OrderMailer#confirmation", "OutboxDispatchJob"]
== 2: 配送役を2つ同時に動かす
投入されたジョブ=["ChargePaymentJob[1]"]  outbox=[["payment.charge_requested", 配送済み]]
== 3: 1回目は課金した後で応答が失われる
payment=pending 決済サービスの課金=1件
投入されたジョブ=["ChargePaymentJob[1] executions=1"]   （retry_on による再試行）
== 4: 再試行（同じキー）
result=succeeded payment=succeeded charge_id=ch_1 order=paid 決済サービスの課金=1件
outbox=["payment.charge_requested", "order.paid_mail"]
試行ごとに新しいキーを作っていた場合: 決済サービスの課金=2件
== 5: 遅れて届いた結果と、重複したイベント
確定した支払いに拒否の結果を渡す => already_final
同じ provider_event_id をもう一度保存 => ActiveRecord::RecordNotUnique
== 6: 決済が拒否された注文（マグカップを1個）
受付の後 stock=0
result=declined order=payment_failed stock=1
もう一度 release_for! を呼ぶ => stock=1
`}
          />
          <p>
            配送役を2つ同時に動かしても、課金のジョブは1件だけ投入されました。1回目の課金は決済サービス側で成功しましたが、応答が届かないのでジョブは Unavailable で失敗し、retry_on が再試行のジョブを投入しました。再試行では同じキーを送るので決済サービスは保存した応答を返し、課金は1件のままで注文が <code>paid</code> になりました。キーを試行ごとに作り直していたら、課金は2件になっていました。後から届いた拒否の結果、同じイベントの再送、拒否された注文の予約の二重解放は、どれも状態を変えませんでした。
          </p>
          <h3>Stage 3 で省略してはいけない運用の取り決め</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">論点</th>
                  <th scope="col">必要な実装と確認</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">outbox の配送</th>
                  <td>コミット済みで未配送の行を定期的に読む。ジョブを起動する通知が失われても、行から見つけ直せる</td>
                </tr>
                <tr>
                  <th scope="row">複数の配送役</th>
                  <td>リースを取ってから送る。投入の後、送信済みの記録の前に止まった場合の重複は、受け取る側で冪等に扱う</td>
                </tr>
                <tr>
                  <th scope="row">保証の言い方</th>
                  <td>outbox で保証できるのは「少なくとも1回」の配送。「ちょうど1回」とは言わない</td>
                </tr>
                <tr>
                  <th scope="row">再試行の終わり</th>
                  <td>回数を使い切っても成否が不明なものは照合の対象にし、監視と管理画面の操作で決着させる</td>
                </tr>
                <tr>
                  <th scope="row">キーの保持期間</th>
                  <td>決済サービスがキーを削除した後は、同じキーでも新しい課金になり得る。期間を過ぎたものは照合と人の確認を通す</td>
                </tr>
                <tr>
                  <th scope="row">タイムアウトと予約</th>
                  <td>結果が不明なものを失敗と決めつけて在庫を解放しない。予約の期限、照合、取り消せる時点を1つの方針として決める</td>
                </tr>
                <tr>
                  <th scope="row">補償の操作</th>
                  <td>拒否が確定したら、在庫とクーポンの予約を一度だけ解放する。課金した後の取り消しは、返金という別の冪等な操作として記録する</td>
                </tr>
                <tr>
                  <th scope="row">金額の固定</th>
                  <td>支払いの試行を作った後は、金額・通貨・対象の注文を変えない。変えるなら元の試行を決着させてから、新しい試行を作る</td>
                </tr>
                <tr>
                  <th scope="row">Webhook</th>
                  <td>署名を検証し、イベントの重複・順序の逆転・別のアカウントのイベントを確かめる。受信した内容を保存し、処理をやり直せるようにする</td>
                </tr>
                <tr>
                  <th scope="row">メール</th>
                  <td>送信した後、送信済みの記録の前に止まると、同じメールが2通届き得る。メール配信サービスの重複防止の機能を使うか、重複を許すかを決める</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="table-wrap">
            <table>
              <caption>Stage 3 の評価</caption>
              <tbody>
                <tr>
                  <th scope="row">利点</th>
                  <td>外部の障害・プロセスの停止・再実行の後でも、状態と次に行う回復の操作を DB から追える</td>
                </tr>
                <tr>
                  <th scope="row">欠点</th>
                  <td>予約・イベント・照合の実装と運用が増え、受付から最終的な確定まで時間差が生じる</td>
                </tr>
                <tr>
                  <th scope="row">向いている場合</th>
                  <td>小規模でも、実際の決済など失敗したときの損失が大きい処理。トラフィックやチームの人数は条件ではない</td>
                </tr>
                <tr>
                  <th scope="row">使わなくてよい場合</th>
                  <td>外部への副作用がなく、DB への同期的な保存で完結する CRUD</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            ここで示した Stage 3 は設計の要点を確かめるための例で、本番の決済をそのまま実装できる一式ではありません。予約の期限切れの回収、照合のジョブ、返金、管理画面での操作まで用意し、上の表の取り決めを満たしたときに、障害の後でも回復できる仕組みになります。
          </p>
        </>
      ),
    },
    {
      id: 'design-decisions',
      title: '段階を選び、各段階で検証する',
      body: (
        <>
          <p>
            どの段階で止めるかは呼び出し元の数、外部への副作用の有無、失敗したときの損失で決めます。モデルの数やチームの人数は、直接の基準にしません。同じ注文の機能でも、社内の担当者が電話で受けた注文を入力する画面と、一般の利用者がカードで払う画面では、求められる確実さが違います。アプリ全体を1つの段階にそろえる必要はありません。モデルのメソッドで足りる処理はそのままにして、外部への副作用がある処理にだけ予約・outbox・照合を加えられます。
          </p>
          <h3>各段階で何を検証するか</h3>
          <p>正常に注文できることを確かめるだけでは、責務を分けた効果はわかりません。実際の DB を使い、各段階で守りたい振る舞いを検証します。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">段階</th>
                  <th scope="col">検証すること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Stage 1</th>
                  <td>明細の不正・在庫不足・クーポンの失敗で、すべてがロールバックされる。入力された金額を使わない。他人のクーポンを拒否する。在庫1への同時の注文で、成功は1件</td>
                </tr>
                <tr>
                  <th scope="row">Stage 2</th>
                  <td>画面と API から同じ結果になる。モデルの操作を直接呼んでも条件を守る。エラーの種類を取り違えない。古いコールバックと二重に通知しない</td>
                </tr>
                <tr>
                  <th scope="row">Stage 3</th>
                  <td>同じ request_key の二重送信、同じジョブの重複、課金が成功した直後の停止、タイムアウト、順序が逆の Webhook、キューが止まった後の再配送、予約の二重解放</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            同時実行の検証は、別々の DB 接続で行います。RSpec の既定の設定のように各例を1つのトランザクションで包むと、すべてのスレッドが1本の接続を共有するので、ロックの待ちもコミット後の処理も再現できません（<ChapterLink n={20} section="transaction" />）。次の spec ではテストのトランザクションを使わず、作ったデータを after で消しています。
          </p>
          <Code
            lang="ruby"
            title="spec/services/orders/place_concurrency_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Orders::Place do
  self.use_transactional_tests = false # 別々の接続で同時に実行するため

  after { [CouponRedemption, Payment, OrderItem, Order, Coupon, Product, User].each(&:delete_all) }

  it "在庫1の商品を2人が同時に注文しても、成功は1件だけ" do
    product = Product.create!(name: "限定トート", price_cents: 3000, stock: 1)
    users = 2.times.map { |i| User.create!(name: "user#{i}") }

    codes = users.map { |user|
      Thread.new do
        order = user.orders.build(items_attributes: [{ product_id: product.id, quantity: 1 }])
        Orders::Place.new.call(order: order, actor: user).code
      end
    }.map(&:value)

    expect(codes).to contain_exactly(:ok, :out_of_stock)
    expect(product.reload.stock).to eq 0
    expect(Order.where(status: "pending").count).to eq 1
  end

  it "クーポンが使えないときは、在庫も注文も残らない" do
    product = Product.create!(name: "マグカップ", price_cents: 1200, stock: 5)
    user = User.create!(name: "alice")
    coupon = Coupon.create!(user: user, discount_percent: 10, expires_at: 1.day.ago)
    order = user.orders.build(items_attributes: [{ product_id: product.id, quantity: 2 }])

    result = Orders::Place.new.call(order: order, actor: user, coupon: coupon)

    expect(result.code).to eq :coupon_unavailable
    expect(product.reload.stock).to eq 5
    expect(Order.count).to eq 0
    expect(Payment.count).to eq 0
  end
end
`}
          />
          <p>
            この2つの例から rails_helper と <code>use_transactional_tests</code> の行を除き、RSpec で MySQL 8.4 に対して実行して、通ることを確かめました。進行役のメソッドを呼ぶ順番をモックで固定するだけのテストでは、DB の制約の違反や二重の課金は見つかりません。テストをどの層に置くかは<ChapterLink n={20} section="test-strategy" />で扱いました。
          </p>
          <h3>設計の判断を説明する</h3>
          <p>
            設計レビューで「Service を作ったのでコントローラーが短くなった」と説明しても、何が改善されたかは伝わりません。「クーポンが使えないときも在庫が戻る」「API と管理画面が同じ受付の手順を使う」「決済 SDK のタイムアウトを結果不明として扱う」のように、守れるようになった振る舞いと、次の変更で直す場所がどう減ったかを示します。レビューで設計を説明する方法は<ChapterLink n={31} section="review-explanation" />でも扱います。
          </p>
        </>
      ),
    },
    {
      id: 'rails-way-ddd',
      title: 'Rails Way と DDD・Clean Architecture',
      body: (
        <>
          <p>
            Stage 2 の Application Service や Stage 3 の Adapter は、DDD や Hexagonal Architecture で使われる言葉です。これらの考え方は Rails Way より上の段階にあるわけではなく、整理する対象が違います。
          </p>
          <ul>
            <li>
              Rails Way：Rails の規約に沿い、コントローラーとモデルを中心に組み立てます。37signals の記事はドメインモデルをアプリケーションの API と考え、コントローラーがモデルのメソッドを直接呼ぶ書き方を説明しています。サービスやインタラクターを既定では作らず、複雑さに見合うときに操作を表すクラスを作ります<Ref n={12} />。考え方の背景は<ChapterLink n={31} section="doctrine" />で扱います。
            </li>
            <li>DDD（ドメイン駆動設計）：業務の知識をドメインモデルとしてコードに表す方法です。業務の用語をそのままコードに使うことや、大きな業務を境界で区切ることを重視します<Ref n={13} />。</li>
            <li>Clean Architecture：ソースコードの依存を内側（業務の規則）にだけ向けるという規則を中心にし、Web や DB を外側の「詳細」として扱います。円の数は4つと決まっているわけではありません<Ref n={14} />。</li>
            <li>
              Hexagonal Architecture（Ports and Adapters）：アプリケーションを、利用者・プログラム・自動テスト・バッチのどれからも同じように動かせるようにし、実際のデバイスや DB から切り離して開発・テストできるようにします。目的ごとのやり取りを port、技術ごとの変換を adapter と呼びます<Ref n={15} />。
            </li>
          </ul>
          <p>
            DDD は業務の言葉と境界を考える方法で、Clean Architecture と Hexagonal Architecture は依存の向きと外部との境界を整理する方法なので、組み合わせて使えます。典型的な取り入れ方を比べると、次のようになります。この表は本書の評価で、チームの人数だけで決まるものではありません。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">観点</th>
                  <th scope="col">Rails Way</th>
                  <th scope="col">Rails ＋ Service Object</th>
                  <th scope="col">DDD を取り入れた Rails</th>
                  <th scope="col">Clean Architecture</th>
                  <th scope="col">Hexagonal Architecture</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">増えるコード</th>
                  <td>少ない。標準の機能をそのまま使う</td>
                  <td>業務の操作ごとのクラスと契約</td>
                  <td>境界・値・概念を表すクラス</td>
                  <td>entity・port・変換が増えやすい</td>
                  <td>外部との port と adapter の分</td>
                </tr>
                <tr>
                  <th scope="row">チームで共有すること</th>
                  <td>Rails の規約</td>
                  <td>チームの Service の規約</td>
                  <td>用語・境界・不変条件</td>
                  <td>依存の向きと変換の規則</td>
                  <td>port の契約と実装</td>
                </tr>
                <tr>
                  <th scope="row">テスト</th>
                  <td>DB を使う振る舞いのテストを書きやすい</td>
                  <td>業務の操作の単位で検証できる</td>
                  <td>純粋な規則を個別に検証できる</td>
                  <td>中心部を単独で検証しやすいが、結合したテストも必要</td>
                  <td>port ごとに差し替えられるが、adapter の契約の検証が要る</td>
                </tr>
                <tr>
                  <th scope="row">Rails との相性</th>
                  <td>高い</td>
                  <td>Active Record を残せば高い</td>
                  <td>部分的に取り入れれば高い</td>
                  <td>ORM から完全に独立させようとすると摩擦が大きい</td>
                  <td>外部との境界に限れば高い</td>
                </tr>
                <tr>
                  <th scope="row">長く保守するときの注意</th>
                  <td>規約と概念が保たれていれば問題が少ない</td>
                  <td>Service が増えすぎ、モデルがデータだけになる</td>
                  <td>用語と境界を保ち続ける必要がある</td>
                  <td>変換の層と抽象を保つ手間がかかる</td>
                  <td>実際に使う port だけにすれば手間を抑えられる</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>「モデルが 100 個を超えた」「チームが 10 人になった」を、一律の切り替えの基準にはしません。次のことが起きたら、小さい手段から順に取り入れます。</p>
          <ol>
            <li>同じ修正を複数のコントローラーやジョブに入れている → まず共通にできるモデルのメソッドを探す（<ChapterLink n={31} section="model-api" />）。</li>
            <li>独立した手順と失敗の処理が複数の場所に書き写されている → その業務の操作に進行役のクラスを置く（Stage 2、<ChapterLink n={33} section="domain-application-service" />）。</li>
            <li>同じ言葉が部署によって違う意味で使われている → Customer や Account などの概念と境界を見直す（<ChapterLink n={30} section="model-boundaries" />）。</li>
            <li>SDK の変更や外部の障害の影響が、複数の業務の処理に広がる → Adapter と、必要な範囲の依存性の注入を置く（<ChapterLink n={33} section="adapters" />）。</li>
            <li>中心の規則を別の実行環境でも使うという具体的な要求がある → その部分だけ、port や ORM からの分離を検討する。</li>
          </ol>
          <p>
            Rails への依存をすべてなくそうとすると、関連の保存、検証、スコープなど、Active Record が持っている機能を自分で作り直すことになります。新しい構成を導入するときは既存のアプリの1つの機能だけに適用し、変更のときに読むコードの量、不具合の数、テストの安定性、実装にかかった時間がどう変わったかを比べます。必要のない Repository、DTO、Factory をすべてのモデルに一度に入れることはしません。この章の Stage 3 も外部の決済との境界にだけ Adapter を置き、注文や在庫は Active Record のモデルのままにしています。
          </p>
        </>
      ),
    },
    {
      id: 'decision-tree',
      title: '処理を書く場所を決める手順',
      body: (
        <>
          <p>
            新しい処理をどこに書くか迷ったら、まずその処理の入力と出力、守る条件、DB の外への影響（副作用）、失敗したときの回復方法を書き出します。そのうえで、図 49-4 の問いを上から順に当てはめます。
          </p>
          <Figure n="49-4" title="処理を書く場所を決める問い" caption="この章と第7部の各章の判断をまとめた模式図。左の問いに当てはまったら、右の1行目から始め、2行目の条件を満たしたら次の手段へ進む。">
            <DecisionTreeFigure />
          </Figure>
          <p>
            図 49-4 の左の列が問いで、右の列の1行目が最初に選ぶ置き場所、2行目がより大きな手段へ進む条件です。1つの処理が複数の行に当てはまる場合は、全体を1つの種類に押し込まず、行ごとの置き場所を組み合わせます。この章の注文の受付では、コントローラーが HTTP の入力を受け、Policy が操作できるかを決め、明細と在庫の条件をモデルと DB の制約が守り、手順を Application Service が進め、課金を Adapter とジョブが受け持っています。割引率は 0〜100 の整数で足りるので、Value Object にはしていません。
          </p>
          <p>
            各行の手段の説明は、認可が<ChapterLink n={21} section="object-authorization" />、ヘルパーが<ChapterLink n={16} section="helpers" />、モデルの検証が<ChapterLink n={14} section="validation-design" />、DB の制約が<ChapterLink n={27} section="indexes-constraints" />、スコープが<ChapterLink n={12} section="scope-design" />、Form Object・Query Object・Value Object・Application Service・Adapter が<ChapterLink n={33} section="model-form-objects" />、モデルの業務メソッドが<ChapterLink n={31} section="model-api" />、ジョブの冪等性が<ChapterLink n={18} section="idempotency" />にあります。
          </p>
          <p>
            最後に、選んだ案について3つのことを確かめます。変更の理由は減ったか、それとも委譲する先を増やしただけか。トランザクションの範囲と、失敗した後の状態を説明できるか。Rails の標準の機能で、もっと小さく同じ条件を守れないか。
          </p>
          <p>
            「Service か Model か」は、モデルから処理を取り上げるかどうかの二択ではありません。モデルが規則を守り、進行役が順番を決めるという分担ができます。Concern はモデルの中を整理する方法で、ジョブは処理を実行する時点とプロセスを変える方法です。それぞれが解決する問題を区別して選びます。
          </p>
        </>
      ),
    },
    {
      id: 'best-practices',
      title: 'Rails の設計原則 20',
      body: (
        <>
          <p>
            第7部の内容から、根拠を示した設計の原則を20に整理します。右の列は原則の理由と具体例を説明した章です。設計レビューでは原則に従ったかどうかだけでなく、その変更でどの問題が減ったかを確かめます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">原則</th>
                  <th scope="col">守らないと起きること</th>
                  <th scope="col">説明した章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>責務と変更の理由で置き場所を決める</td>
                  <td>ファイルを分けても、1つの変更が全体に広がる</td>
                  <td><ChapterLink n={30} section="design-basics" /></td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Rails の標準の最小の構成から始める</td>
                  <td>独自の配線と、それを覚える手間が機能の開発を圧迫する</td>
                  <td>この章の Stage 1、<ChapterLink n={31} section="doctrine" /></td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>業務の言葉でモデルの操作を表す</td>
                  <td>状態の更新や計算の規則が呼び出し元に散る</td>
                  <td><ChapterLink n={31} section="model-api" /></td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>モデルを薄くすること自体を目的にしない</td>
                  <td>データだけのモデルと、規則を重複して持つ Service が増える</td>
                  <td><ChapterLink n={30} section="fat-model" /></td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>業務の操作の進行と、ドメインの規則を分ける</td>
                  <td>Service どうしの呼び出しの連鎖と、規則の複製が増える</td>
                  <td><ChapterLink n={33} section="domain-application-service" />、この章の Stage 2</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>CRUD を代わりに呼ぶだけの Service を増やさない</td>
                  <td>判断を持たない委譲が増え、小さな修正でも多くのクラスをたどる</td>
                  <td><ChapterLink n={33} section="service-contract" /></td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>画面だけの入力条件を、永続化するモデル全体に広げない</td>
                  <td>CSV の取り込み・API・管理画面の更新に、関係のない必須条件がかかる</td>
                  <td><ChapterLink n={33} section="model-form-objects" /></td>
                </tr>
                <tr>
                  <td>8</td>
                  <td>検索の意味・戻り値・認可の範囲を契約にする</td>
                  <td>見せてはいけないデータの表示、N+1、集計の誤り、件数の上限のない読み込み</td>
                  <td><ChapterLink n={33} section="query-objects" /></td>
                </tr>
                <tr>
                  <td>9</td>
                  <td>単位や等価性が意味を持つ値に型を与える</td>
                  <td>通貨・割合・期間の境界を取り違える</td>
                  <td><ChapterLink n={33} section="value-objects" /></td>
                </tr>
                <tr>
                  <td>10</td>
                  <td>エンティティは寿命・所有・多重度で分ける</td>
                  <td>User に何でも集まるか、不要な結合と同時保存が増える</td>
                  <td><ChapterLink n={30} section="data-model" /></td>
                </tr>
                <tr>
                  <td>11</td>
                  <td>検証と DB の制約を両方使う</td>
                  <td>同時の書き込みや別の経路で、重複・親のない行・不正な値が入る</td>
                  <td><ChapterLink n={14} section="uniqueness" />、<ChapterLink n={27} section="indexes-constraints" /></td>
                </tr>
                <tr>
                  <td>12</td>
                  <td>現在の値と、過去の事実を分けて保存する</td>
                  <td>過去の注文の金額や表示が、商品の現在の価格に合わせて変わる</td>
                  <td>この章の Stage 1（注文時の単価）、<ChapterLink n={30} section="data-model" /></td>
                </tr>
                <tr>
                  <td>13</td>
                  <td>関連には削除の方針と一意性まで含める</td>
                  <td>二重の所属、親のない行、履歴の意図しない連鎖削除</td>
                  <td><ChapterLink n={30} section="association-design" /></td>
                </tr>
                <tr>
                  <td>14</td>
                  <td>状態の集合と、遷移の条件を分けて定義する</td>
                  <td>未払いの注文の発送や、完了後の不正な取り消しができてしまう</td>
                  <td><ChapterLink n={30} section="state-management" /></td>
                </tr>
                <tr>
                  <td>15</td>
                  <td>コールバックは小さく、追える範囲に保つ</td>
                  <td>保存しただけで課金や通知が連鎖し、データの移行や修正が難しくなる</td>
                  <td><ChapterLink n={30} section="callback-design" />、<ChapterLink n={14} section="callback-boundaries" /></td>
                </tr>
                <tr>
                  <td>16</td>
                  <td>一緒に確定する DB の更新の範囲を明示する</td>
                  <td>注文だけが残り、在庫やクーポンと食い違う</td>
                  <td>この章の「一緒に確定する範囲を決める」</td>
                </tr>
                <tr>
                  <td>17</td>
                  <td>同時の更新と、再実行を別々に設計する</td>
                  <td>トランザクションもジョブも冪等性を自動では与えないので、在庫の超過・二重の注文・在庫の二重の解放が起きる</td>
                  <td>この章の Stage 1・3、<ChapterLink n={18} section="idempotency" /></td>
                </tr>
                <tr>
                  <td>18</td>
                  <td>外部との通信を、短い DB のトランザクションから切り離す</td>
                  <td>長いロックと、課金だけが成功する部分的な失敗</td>
                  <td>この章の「一緒に確定する範囲を決める」と Stage 3</td>
                </tr>
                <tr>
                  <td>19</td>
                  <td>失敗を分類し、必要な境界だけを外から渡す</td>
                  <td>障害が入力エラーとして扱われ、不要な依存性の注入で配線も増える</td>
                  <td><ChapterLink n={33} section="service-contract" />、<ChapterLink n={33} section="dependency-injection" /></td>
                </tr>
                <tr>
                  <td>20</td>
                  <td>実際に観察した複雑さに合わせて、設計を一段ずつ進める</td>
                  <td>DDD や Clean Architecture の構成を保つことが目的になり、開発の速さを失う</td>
                  <td>この章の「Rails Way と DDD・Clean Architecture」</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>注文・在庫・支払いの記録・クーポンの使用は同じ DB への書き込みなので、1つのトランザクションで確定できます。課金とメールは DB の外の操作で、ロールバックでは取り消せません。</li>
          <li>トランザクションは、ほかの接続が同じ行を読むことを止めません。在庫は条件付きの UPDATE（<code>WHERE stock &gt;= ?</code>）かロックで確保し、CHECK 制約でも守ります。複数の行は ID の順に更新します。</li>
          <li>外部の API をトランザクションの中で呼ぶと、応答を待つ間もロックと接続を持ち続けます。課金の後で DB が失敗しても課金は残り、タイムアウトは課金されなかったことを意味しません。</li>
          <li>Stage 1 では受付を <code>Order#place!</code> にまとめ、単価の確定・在庫・クーポン・支払いの記録を1つのトランザクションで確定し、メールはコミットの後で投入します。二重送信は request_key の一意索引で防げます。</li>
          <li>Stage 2 では手順とトランザクションを <code>Orders::Place</code> に移し、利用者が直せる失敗だけを結果のオブジェクトで返します。規則はモデルに残します。</li>
          <li>Stage 3 では受付で予約・支払い・冪等性キー・OutboxEvent を保存し、配送役と課金のジョブが外部に依頼し、ApplyOutcome が結果を短いトランザクションで一度だけ反映します。結果が不明なものは同じキーで再試行し、期限を過ぎたら照合します。</li>
          <li>段階は呼び出し元の数・外部への副作用・失敗の損失で選びます。同時実行の検証は別々の DB 接続で行います。</li>
          <li>DDD・Clean Architecture・Hexagonal Architecture は Rails Way の上の段階ではなく、整理する対象が違う考え方です。観察した問題に合わせて、小さい手段から取り入れます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'ActiveRecord::Transactions::ClassMethods', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Transactions/ClassMethods.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'トランザクションは DB の接続ごとに働くこと、トランザクションの中で StatementInvalid を rescue しないこと。' },
    { title: 'activerecord/lib/active_record/persistence.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L673-L699`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'increment! と decrement! が update_counters で SQL の加減算を行うこと。' },
    { title: 'activerecord/lib/active_record.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record.rb#L560-L591`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'after_all_transactions_commit が、すべてのトランザクションのコミット後にだけブロックを呼ぶこと。' },
    { title: 'activerecord/lib/active_record/associations.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/associations.rb#L1364-L1366`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'has_many の :validate の既定値が true であること。' },
    { title: 'activerecord/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/CHANGELOG.md`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'Rails 8.1.0 で ActiveRecord::CheckViolation が追加されたこと。' },
    { title: 'Consistent Nonlocking Reads', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'スナップショットは SELECT に適用され、UPDATE・DELETE はほかのトランザクションが確定した行に働くこと。' },
    { title: 'CHECK Constraints', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'INSERT・UPDATE で CHECK の条件が FALSE になるとエラーになること。' },
    { title: 'Transactional outbox pattern', publisher: 'AWS Prescriptive Guidance', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html', accessed: '2026-11-20', note: 'DB の変更と送る予定のイベントを同じトランザクションで保存すること、重複したメッセージに備えて受け取る側を冪等にすること。' },
    { title: 'Idempotent requests', publisher: 'Stripe API Reference', url: 'https://docs.stripe.com/api/idempotent_requests', accessed: '2026-11-20', note: '同じキーの再送に最初の結果を返すこと、キーの保持期間（24 時間以上）、パラメーターが違うとエラーになること。' },
    { title: 'Advanced error handling', publisher: 'Stripe Documentation', url: 'https://docs.stripe.com/error-low-level', accessed: '2026-11-20', note: 'ネットワークのエラーでは結果が不明になること、24 時間以内は同じキーで再試行し、それを過ぎたら照合すること。' },
    { title: 'Receive Stripe events in your webhook endpoint', publisher: 'Stripe Documentation', url: 'https://docs.stripe.com/webhooks', accessed: '2026-11-20', note: '署名の検証、重複したイベント、届く順序が保証されないこと、2xx をすぐに返すこと。' },
    { title: 'Vanilla Rails is plenty', publisher: '37signals / Jorge Manrubia', url: 'https://dev.37signals.com/vanilla-rails-is-plenty/', accessed: '2026-11-20', note: 'ドメインモデルをアプリケーションの API とし、サービスを既定では作らない考え方。' },
    { title: 'DomainDrivenDesign', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/DomainDrivenDesign.html', accessed: '2026-11-20', note: 'ドメインモデルを中心にする開発の方法、ユビキタス言語と境界づけられたコンテキスト。' },
    { title: 'The Clean Architecture', publisher: 'The Clean Code Blog / Robert C. Martin', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html', accessed: '2026-11-20', note: 'ソースコードの依存は内側にだけ向けるという規則、円の数は固定ではないこと。' },
    { title: 'Hexagonal architecture', publisher: 'Alistair Cockburn', url: 'https://alistair.cockburn.us/hexagonal-architecture/', accessed: '2026-11-20', note: 'Ports and Adapters の目的と、port と adapter の役割。' },
  ],
}

export default chapter
