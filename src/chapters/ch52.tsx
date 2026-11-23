import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 88-1・88-2 再送のタイムライン ---------- */
type Lane = 0 | 1 | 2
const LANE_X = [120, 400, 660]
const LANE_NAME = ['アプリ（クライアント）', 'API サーバー（Rails）', '決済代行']
type SeqRow =
  | { kind: 'msg'; from: Lane; to: Lane; text: string; reply?: boolean; tone?: 'danger' | 'acc'; lost?: boolean }
  | { kind: 'note'; at: Lane; lines: string[]; tone?: 'danger' | 'acc' }

const rowH = (r: SeqRow) => (r.kind === 'msg' ? (r.lost ? 52 : 36) : r.lines.length * 17 + 18)

function Sequence({ id, rows, label }: { id: string; rows: SeqRow[]; label: string }) {
  let y = 54
  const placed: { r: SeqRow; at: number }[] = []
  for (const r of rows) {
    placed.push({ r, at: y })
    y += rowH(r)
  }
  const h = y + 12
  return (
    <Svg id={id} w={780} h={h} label={label}>
      {LANE_X.map((x, i) => (
        <g key={x}>
          <Box x={x - 95} y={10} w={190} h={34} lines={LANE_NAME[i]} fill={i === 0 ? 'box' : i === 1 ? 'box5' : 'box4'} />
          <line x1={x} y1={44} x2={x} y2={h - 6} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {placed.map(({ r, at }, i) => {
        if (r.kind === 'note') {
          const w = 310
          const x = Math.min(Math.max(LANE_X[r.at] - w / 2, 6), 774 - w)
          return (
            <Box
              key={i}
              x={x}
              y={at + 4}
              w={w}
              h={rowH(r) - 10}
              lines={r.lines}
              fs={12}
              fill={r.tone === 'danger' ? 'bg' : 'box'}
              accent={r.tone === 'acc'}
              subTone={r.tone === 'danger' ? 'danger' : r.tone === 'acc' ? 'acc' : 'muted'}
            />
          )
        }
        const x1 = LANE_X[r.from]
        const x2 = LANE_X[r.to]
        const dir = x2 > x1 ? 1 : -1
        const cy = at + 26
        if (r.lost) {
          const end = x1 + (x2 - x1) * 0.55
          return (
            <g key={i}>
              <line x1={x1} y1={cy - 6} x2={end} y2={cy - 6} stroke="var(--fig-danger)" strokeWidth={1.5} strokeDasharray="5 4" />
              <T x={end} y={cy - 6} anchor="middle" fs={18} tone="danger" bold>
                ×
              </T>
              <T x={(x1 + end) / 2} y={cy - 18} anchor="middle" fs={12}>
                {r.text}
              </T>
              <T x={(x1 + x2) / 2} y={cy + 12} anchor="middle" fs={12} tone="danger">
                応答が届く前に、アプリがタイムアウトする
              </T>
            </g>
          )
        }
        return (
          <g key={i}>
            <Arrow x1={x1} y1={cy} x2={x2 - dir * 2} y2={cy} dashed={r.reply} accent={r.tone === 'acc'} />
            <T x={(x1 + x2) / 2} y={cy - 11} anchor="middle" fs={12} tone={r.tone} bold={r.tone === 'danger'}>
              {r.text}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

const DOUBLE_CHARGE: SeqRow[] = [
  { kind: 'msg', from: 0, to: 1, text: 'POST /orders/1/payments（3,000円）' },
  { kind: 'msg', from: 1, to: 2, text: '決済（3,000円）' },
  { kind: 'msg', from: 2, to: 1, text: 'ch_1', reply: true },
  { kind: 'note', at: 1, lines: ['payments に1件目を INSERT して COMMIT'] },
  { kind: 'msg', from: 1, to: 0, text: '201 payment_id=1', reply: true, lost: true },
  { kind: 'msg', from: 0, to: 1, text: '同じ内容を再送する' },
  { kind: 'msg', from: 1, to: 2, text: '決済（3,000円）', tone: 'danger' },
  { kind: 'msg', from: 2, to: 1, text: 'ch_2', reply: true, tone: 'danger' },
  { kind: 'note', at: 1, lines: ['payments に2件目を INSERT して COMMIT', '同じ注文に2回決済した'], tone: 'danger' },
  { kind: 'msg', from: 1, to: 0, text: '201 payment_id=2', reply: true },
]

const WITH_KEY: SeqRow[] = [
  { kind: 'msg', from: 0, to: 1, text: 'POST …　Idempotency-Key: "k1"' },
  { kind: 'note', at: 1, lines: ['k1 を「処理中」として INSERT し、単独で COMMIT'] },
  { kind: 'msg', from: 1, to: 2, text: '決済（3,000円、キー 1:k1）' },
  { kind: 'msg', from: 2, to: 1, text: 'ch_1', reply: true },
  { kind: 'note', at: 1, lines: ['payments に INSERT し、k1 を「完了」にして', '応答を保存する（同じトランザクション）'] },
  { kind: 'msg', from: 1, to: 0, text: '201 payment_id=1', reply: true, lost: true },
  { kind: 'msg', from: 0, to: 1, text: '同じキー k1 で再送する' },
  { kind: 'note', at: 1, lines: ['INSERT が一意索引に違反。k1 は「完了」なので', '決済せずに、保存した応答を返す'], tone: 'acc' },
  { kind: 'msg', from: 1, to: 0, text: '201 Idempotent-Replayed: true', reply: true, tone: 'acc' },
]

/* ---------- 図 88-3 キーの状態と、同じキーのリクエストへの応答 ---------- */
function KeyStatesFigure() {
  const NONE = { x: 20, y: 200, w: 140, h: 56 }
  const PROC = { x: 290, y: 200, w: 150, h: 56 }
  const DONE = { x: 620, y: 200, w: 140, h: 56 }
  const cy = 220
  const gap1 = (NONE.x + NONE.w + PROC.x) / 2
  const gap2 = (PROC.x + PROC.w + DONE.x) / 2
  return (
    <Svg
      id="88-3"
      w={780}
      h={410}
      label="idempotency_keys の行の状態と、同じキーのリクエストへの応答。キーがない状態から、INSERT が成功すると処理中になる。処理中から、業務の書き込みと同じトランザクションで応答を保存すると完了になる。処理中に失敗したら release! で行を消し、キーがない状態に戻る。処理中のまま LOCK_TIMEOUT を過ぎた行は、再送したリクエストが take_over で引き継ぐ。完了した行は有効期限を過ぎると purge_expired で消え、キーがない状態に戻る。処理中に同じキー・同じ内容のリクエストが来たら 409、完了後なら保存した応答を返す。どちらの状態でも、同じキーで内容が違うリクエストは 422"
    >
      <Box x={PROC.x + PROC.w / 2 - 120} y={20} w={240} h={64} lines={['同じキー・同じ内容 → 409', '同じキー・違う内容 → 422']} fill="bg" fs={12} />
      <Box x={548} y={20} w={226} h={64} lines={['同じキー・同じ内容', '→ 保存した応答（Replayed）', '同じキー・違う内容 → 422']} fill="bg" fs={12} accent />
      <line x1={PROC.x + PROC.w / 2} y1={84} x2={PROC.x + PROC.w / 2} y2={PROC.y} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={DONE.x + DONE.w / 2} y1={84} x2={DONE.x + DONE.w / 2} y2={DONE.y} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <Box {...NONE} lines={['キーなし', '（行がない）']} dashed fill="bg" subTone="muted" />
      <Box {...PROC} lines={['処理中', "status = 'processing'"]} bold subTone="muted" />
      <Box {...DONE} lines={['完了', "status = 'completed'"]} bold subTone="muted" />

      <Arrow x1={NONE.x + NONE.w} y1={cy} x2={PROC.x - 2} y2={cy} accent />
      <T x={gap1} y={152} anchor="middle" fs={12}>
        claim の
      </T>
      <T x={gap1} y={168} anchor="middle" fs={12}>
        INSERT が成功
      </T>
      <T x={gap1} y={184} anchor="middle" fs={12}>
        （単独で COMMIT）
      </T>

      <Arrow x1={PROC.x + PROC.w} y1={cy} x2={DONE.x - 2} y2={cy} accent />
      <T x={gap2} y={152} anchor="middle" fs={12}>
        complete!
      </T>
      <T x={gap2} y={168} anchor="middle" fs={12}>
        業務の書き込みと同じ
      </T>
      <T x={gap2} y={184} anchor="middle" fs={12}>
        トランザクションで保存
      </T>

      <Arrow d={`M${PROC.x + 100},${PROC.y + PROC.h} V294 H${PROC.x + 170} V244 H${PROC.x + PROC.w + 2}`} />
      <T x={PROC.x + 180} y={276} fs={12}>
        take_over：LOCK_TIMEOUT を過ぎた
      </T>
      <T x={PROC.x + 180} y={292} fs={12}>
        処理中の行を、再送が引き継ぐ
      </T>

      <Arrow d={`M${PROC.x + 40},${PROC.y + PROC.h} V334 H${NONE.x + 100} V${NONE.y + NONE.h + 2}`} />
      <T x={(PROC.x + 40 + NONE.x + 100) / 2} y={322} anchor="middle" fs={12} tone="danger">
        失敗：release! で行を消す
      </T>

      <Arrow d={`M${DONE.x + 110},${DONE.y + DONE.h} V384 H${NONE.x + 40} V${NONE.y + NONE.h + 2}`} dashed />
      <T x={420} y={372} anchor="middle" fs={12}>
        作成から TTL（24 時間）を過ぎたら purge_expired で消す
      </T>
    </Svg>
  )
}

/* ---------- 図 88-4 配信の保証の3種類 ---------- */
function DeliveryGuaranteesFigure() {
  const rows: { y: number; head: string[]; a: string; b: string; tx?: boolean; result: string[]; tone: 'danger' | 'acc' }[] = [
    { y: 40, head: ['最大1回', 'at-most-once'], a: '① 処理済みと記録', b: '② 処理する', result: ['② の前で止まると、再送は', '処理済みとして捨てられる'], tone: 'danger' },
    { y: 144, head: ['少なくとも1回', 'at-least-once'], a: '① 処理する', b: '② 処理済みと記録', result: ['② の前で止まると、再送で', 'もう一度処理する'], tone: 'danger' },
    { y: 248, head: ['厳密に1回', 'exactly-once'], a: '① 処理する', b: '② 処理済みと記録', tx: true, result: ['途中で止まると両方が取り消され', '再送で1回だけ処理する'], tone: 'acc' },
  ]
  return (
    <Svg
      id="88-4"
      w={780}
      h={386}
      label="配信の保証の3種類を、受け手の処理の順番で比べた図。最大1回は、処理済みと記録してから処理する。処理の前で止まると、再送は処理済みとして捨てられ、処理されないまま終わる。少なくとも1回は、処理してから処理済みと記録する。記録の前で止まると、再送でもう一度処理する。厳密に1回は、処理と記録を1つのトランザクションで確定する。途中で止まると両方が取り消され、再送で1回だけ処理する。メールや外部の API の呼び出しはトランザクションに入れられないので、厳密に1回にはならない"
    >
      <T x={85} y={18} anchor="middle" fs={12} bold>
        保証
      </T>
      <T x={350} y={18} anchor="middle" fs={12} bold>
        受け手の処理の順番（× はプロセスが止まる位置）
      </T>
      <T x={660} y={18} anchor="middle" fs={12} bold>
        止まった後に再送が届くと
      </T>
      {rows.map((r) => (
        <g key={r.y}>
          <Box x={10} y={r.y + 10} w={150} h={56} lines={r.head} bold fill="box2" subTone="muted" />
          {r.tx && (
            <>
              <rect x={180} y={r.y} width={358} height={76} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
              <T x={190} y={r.y + 88} fs={11} tone="acc">
                1つのトランザクション
              </T>
            </>
          )}
          <Box x={190} y={r.y + 18} w={140} h={40} lines={r.a} fs={12} />
          <Arrow x1={330} y1={r.y + 38} x2={386} y2={r.y + 38} />
          <T x={358} y={r.y + 22} anchor="middle" fs={18} tone="danger" bold>
            ×
          </T>
          <Box x={388} y={r.y + 18} w={140} h={40} lines={r.b} fs={12} />
          <Box x={556} y={r.y + 12} w={214} h={52} lines={r.result} fs={12} fill="bg" accent={r.tone === 'acc'} />
        </g>
      ))}
      <T x={390} y={366} anchor="middle" fs={12} tone="danger">
        メールの送信や外部の API の呼び出しは、DB のトランザクションに入れられないので厳密に1回にならない
      </T>
    </Svg>
  )
}

/* ---------- 図 88-5 Webhook のイベントの重複排除 ---------- */
function WebhookFlowFigure() {
  const L = 230
  const W = 330
  const cx = L + W / 2
  return (
    <Svg
      id="88-5"
      w={780}
      h={560}
      label="決済代行が支払い成功のイベント evt_1 を Webhook で送る。HandlePaymentSucceeded は1つのトランザクションの中で、まず WebhookEvent.create_or_find_by! でイベントの ID を記録する。新しい行なら、Order.mark_paid で支払い待ちの注文を支払い済みに設定して COMMIT する。一意索引に違反したら既存の行が返るので何もせず COMMIT する。注文の更新が失敗したら ROLLBACK し、イベントの記録も取り消される。2xx 以外を返すと決済代行が後で再送する。COMMIT の後、処理した場合だけ領収書のメールを投入し、重複したイベントにも 200 を返す"
    >
      <Box x={cx - 90} y={10} w={180} h={38} lines="決済代行" fill="box4" />
      <Arrow x1={cx} y1={48} x2={cx} y2={126} />
      <T x={cx + 10} y={78} fs={12}>
        POST /webhooks/payments（evt_1）
      </T>
      <T x={cx + 10} y={96} fs={12} tone="muted">
        同じイベントが再送されうる
      </T>

      <rect x={20} y={108} width={750} height={284} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="6 4" />
      <T x={760} y={124} anchor="end" fs={12} tone="acc" bold>
        1つのトランザクション
      </T>

      <Box x={L} y={128} w={W} h={56} lines={['① WebhookEvent.create_or_find_by!', '     (event_id: "evt_1")']} fs={12} mono align="start" />
      <Arrow x1={cx} y1={184} x2={cx} y2={226} accent />
      <T x={cx + 10} y={205} fs={12} tone="acc">
        新しい行（previously_new_record? が true）
      </T>

      <Box x={L} y={228} w={W} h={56} lines={['② Order.mark_paid(order_id, amount)', "     … WHERE status = 'pending'"]} fs={12} mono align="start" />
      <Arrow x1={cx} y1={284} x2={cx} y2={330} />
      <Box x={L} y={332} w={W} h={40} lines="COMMIT" mono />

      <Box x={600} y={136} w={160} h={64} lines={['一意索引に違反', '既存の行が返る', '→ 何もしない']} fill="bg" fs={12} subTone="muted" />
      <Arrow x1={L + W} y1={156} x2={598} y2={156} />
      <Arrow d={`M680,200 V352 H${L + W + 2}`} />

      <Box x={30} y={228} w={170} h={56} lines={['失敗：ROLLBACK', '① の記録も取り消される']} fill="bg" fs={12} subTone="danger" />
      <Arrow x1={L} y1={256} x2={202} y2={256} />
      <Arrow d={`M115,228 V29 H${cx - 92}`} dashed />
      <T x={127} y={140} fs={12} tone="danger">
        2xx 以外を返す
      </T>
      <T x={127} y={158} fs={12} tone="danger">
        → 後で再送される
      </T>

      <Arrow x1={cx} y1={372} x2={cx} y2={420} />
      <Box x={L} y={422} w={W} h={46} lines={['③ 処理した場合だけ、領収書のメールを投入', 'DB の外への副作用（COMMIT の後）']} fs={12} subTone="muted" />
      <Arrow x1={cx} y1={468} x2={cx} y2={500} />
      <Box x={L} y={502} w={W} h={40} lines="200 を返す（重複したイベントにも）" fs={12} />
    </Svg>
  )
}

const chapter: Chapter = {
  number: 52,
  part: 9,
  title: 'Idempotency Key / Deduplication：決済の二重送信と Webhook の重複を防ぐ',
  summary:
    '支払いの API に同じリクエストが2回届くと二重に決済され、決済代行の Webhook が同じイベントを2回送ると注文を2回処理します。クライアントが付けた冪等性キーとイベントの ID を MySQL の一意索引で記録し、同じ要求の2回目には処理をやり直さずに保存した結果を返すか、何もせずに 200 を返す実装を Rails で作り、RSpec で確かめます。',
  goals: [
    '冪等性の定義と、POST のリクエストをタイムアウトの後に再送すると二重に決済される流れを説明できる',
    '最大1回・少なくとも1回・厳密に1回の違いを説明し、少なくとも1回届くことを前提に受け手を設計できる',
    'Idempotency-Key ヘッダーを受け取る API（キーの登録、内容の照合、処理中の 409、保存した応答の再返却、有効期限）を Rails と MySQL で実装できる',
    'MySQL で一意制約の違反を ActiveRecord::RecordNotUnique として扱い、insert と create_or_find_by! の違いを説明できる',
    'Webhook のイベントの記録と業務の処理を同じトランザクションで確定し、重複したイベントに 200 を返せる',
    '加算ではなく状態の設定として書くことで操作自体を冪等にし、メールなど外部への副作用は厳密に1回にできないことを踏まえて設計できる',
  ],
  prerequisites: [14, 18, 38],
  sections: [
    {
      id: 'scene',
      title: '同じ支払いが2回届く場面と、対策をしていない API',
      body: (
        <>
          <h3>そもそも何が起きるのか</h3>
          <p>
            EC サイトのスマートフォンのアプリが、注文の支払いを Rails の API に送る場面を考えます。利用者が「支払う」を押すと、アプリは <code>POST /orders/1/payments</code> を送ります。API はカードの決済を引き受ける外部のサービス（決済代行）の API を呼んで 3,000 円を決済し、payments テーブルに記録して 201 を返します。決済が済むと、決済代行は <Term>Webhook</Term>（決済代行からアプリへ送られる HTTP の通知）で「支払いが成功した」というイベントを送ってきます。API はそれを受けて注文を支払い済みにし、領収書のメールを送ります。
          </p>
          <p>この流れでは、同じ要求が2回届くことがあります。</p>
          <ul>
            <li>利用者がボタンを2回押す。画面を読み込み直す。</li>
            <li>アプリが応答を待つ間にタイムアウトし、同じリクエストを送り直す。サーバーは1回目の処理を終えていて、応答がアプリに届かなかっただけかもしれません。</li>
            <li>決済代行は、Webhook が届いたことを確かめられなければ送り直します。Stripe は、Webhook の受け手が同じイベントを2回以上受け取ることがあると説明しています<Ref n={5} />。</li>
          </ul>
          <h3>対策をしていないコード</h3>
          <p>
            API の利用者はリクエストの <code>Authorization: Bearer …</code> ヘッダーのトークンで決めます。ApiController はトークンから User を探し、見つからなければ 401 を返します。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/api_controller.rb"
            code={`
class ApiController < ActionController::API
  include ActionController::HttpAuthentication::Token::ControllerMethods
  before_action :authenticate

  private

  attr_reader :current_user

  # Authorization: Bearer <api_token> で API の利用者を決める
  def authenticate
    @current_user = authenticate_with_http_token { |token| User.find_by(api_token: token) }
    head :unauthorized unless @current_user
  end
end
`}
          />
          <p>支払いの API と、Webhook を受け取るアクションは、最初は次のように書かれていました。</p>
          <Code
            lang="ruby"
            title="app/controllers/payments_controller.rb（対策をする前）"
            code={`
class PaymentsController < ApiController
  # POST /orders/:order_id/payments
  def create
    order = current_user.orders.find(params[:order_id])
    amount = Integer(params.expect(:amount))

    charge_id = PaymentGateway.new.charge(amount:) # 呼ばれるたびに決済する
    payment = order.payments.create!(charge_id:, amount:)
    render json: { payment_id: payment.id, charge_id: }, status: :created
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/payment_webhooks_controller.rb（対策をする前）"
            code={`
class PaymentWebhooksController < ActionController::API
  # POST /webhooks/payments  決済代行から届く「支払いが成功した」イベント
  def create
    data = params.expect(data: [:order_id, :amount])
    order = Order.find(data[:order_id])

    order.update!(status: "paid", paid_amount: order.paid_amount + Integer(data[:amount])) # 加算する
    ReceiptMailer.paid(order.id).deliver_later
    head :ok
  end
end
`}
          />
          <p>
            PaymentGateway は決済代行の API を呼ぶ Adapter で、<code>charge</code> は決済代行が付けた決済の ID（<code>ch_1</code> など）を返します。Adapter の役割は<ChapterLink n={33} section="adapters" />の「Adapter：外部サービスの応答と例外をアプリの結果に変える」で扱いました。この章では決済代行の SDK の呼び出しを省き、動作の確認には代役のクラス（spec/support/fake_payment_gateway.rb、後の test の節で示す）を使います。
          </p>
          <h3>同じ要求を2回送る</h3>
          <p>
            <code>bin/rails runner</code> で、Rails のアプリにリクエストを送るオブジェクト（<code>ActionDispatch::Integration::Session</code>）を作り、同じ支払いのリクエストを2回送りました。2回目は1回目の応答を受け取れなかったアプリの再送に当たります。続けて、同じ Webhook のイベントを2回送りました。
          </p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4。時刻は省略）"
            code={`
== 支払いのリクエストを2回送る（2回目は、応答を受け取れなかったアプリの再送）
  TRANSACTION  BEGIN
  Payment Create  INSERT INTO \`payments\` (\`order_id\`, \`charge_id\`, \`amount\`, …) VALUES (1, 'ch_1', 3000, …)
  TRANSACTION  COMMIT
1回目: 201 {"payment_id":1,"charge_id":"ch_1"}
  TRANSACTION  BEGIN
  Payment Create  INSERT INTO \`payments\` (\`order_id\`, \`charge_id\`, \`amount\`, …) VALUES (1, 'ch_2', 3000, …)
  TRANSACTION  COMMIT
2回目: 201 {"payment_id":2,"charge_id":"ch_2"}
payments=2件 決済代行の決済=2件
== 同じ Webhook のイベントが2回届く
1回目: 200
2回目: 200
order: status=paid paid_amount=6000  投入された領収書のメール=2件
`}
          />
          <p>
            同じ注文に支払いの記録が2件でき、決済代行でも2回決済されました（<code>ch_1</code> と <code>ch_2</code>）。Webhook では、支払い済みの金額が 6,000 円になり、領収書のメールが2通投入されています。どのリクエストも成功の応答を返しているので、エラーの記録は残りません。
          </p>
          <Figure n="88-1" title="タイムアウトの後の再送で、二重に決済される" caption="上の実行結果の支払いの部分を、関係者ごとの列に並べた図。上から下へ時間が進む。実線の矢印は要求、破線の矢印は応答、× は途中で失われた応答。">
            <Sequence
              id="88-1"
              rows={DOUBLE_CHARGE}
              label="アプリが注文1の支払いを API サーバーに送る。サーバーは決済代行で 3,000 円を決済し、ch_1 を受け取って payments に1件目を記録し、201 を返すが、応答が届く前にアプリがタイムアウトする。アプリが同じ内容を再送すると、サーバーはもう一度決済し、ch_2 を受け取って payments に2件目を記録する。同じ注文に2回決済したことになる"
            />
          </Figure>
          <p>
            図 88-1 は支払いの2回のリクエストを時間の順に並べたものです。アプリから見ると、タイムアウトしたリクエストが処理されたのかどうかは分かりません。Idempotency-Key ヘッダーの仕様の草案も、POST のリクエストがタイムアウトしたクライアントは、リソースがどうなったかも、安全に送り直せるかも分からないと説明しています<Ref n={2} />。送り直さなければ支払いが失われるかもしれず、送り直すと図 88-1 のように二重に決済されるかもしれません。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>PaymentsController は、前のリクエストの再送かどうかを確かめずに決済します。応答を受け取れなかったアプリが送り直すと、二重に決済します。</li>
            <li>PaymentWebhooksController は、イベントの ID を記録しないので、同じイベントが2回届くと2回処理します。</li>
            <li>支払い済みの金額に加算するので、2回処理すると金額が2倍になります。</li>
            <li>領収書のメールも処理した回数だけ投入します。</li>
          </ul>
          <p>運用中のアプリでは、次のような兆候からこの問題に気づきます。</p>
          <ul>
            <li>「同じ注文で2回請求された」という問い合わせがあり、ログを見ると同じ内容のリクエストが数秒おきに2回届いている。</li>
            <li>Webhook やキューのメッセージを処理するコードが、イベントの ID を記録せず、届いたものを毎回処理している。</li>
            <li>外部の API の呼び出しを、タイムアウトしたら同じ内容で再試行する設定になっている。</li>
            <li>受け取ったイベントで、金額や件数を加算している。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'idea',
      title: '再送を見分けて、結果を1回分にする考え方',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term>Idempotency Key</Term>（冪等性キー）と <Term>Deduplication</Term>（重複排除）は、同じ要求が2回以上届いても、処理の結果を1回分にするためのパターンです。MSDP のカタログでは、この2つを1つのパターンとして扱います。ネットワークの向こうの処理は、失敗したように見えて実は成功していることがあるので、失敗したら送り直す仕組みを作ると、同じ要求が2回届くことは避けられません。このパターンでは、受け取った側が2回目を見分けて、処理を繰り返さないようにします。
          </p>
          <p>
            <Term>冪等</Term>（べきとう、idempotent）は、HTTP の仕様では次のように定義されています。あるメソッドのリクエストを同じ内容で何回送っても、サーバーに対して意図した効果が1回送ったときと同じになるなら、そのメソッドは冪等です。PUT、DELETE と、GET のような安全なメソッド（読み取りだけを求めるメソッド）は冪等です<Ref n={1} />。POST と PATCH は冪等ではありません<Ref n={2} />。たとえば「注文1を支払い済みにする」は何回実行しても結果は同じですが、「注文1の支払いを作る」は実行した回数だけ支払いが増えます。
          </p>
          <p>
            HTTP の仕様は、冪等なメソッドなら、応答を読む前に通信が切れても自動で送り直せると説明しています。一方、冪等でないメソッドは、その要求が実際には冪等だと分かる方法か、元の要求が適用されなかったと分かる方法がない限り、自動で送り直すべきではないとしています<Ref n={1} />。このパターンは、POST のような冪等でない操作に、その「分かる方法」を加えます。
          </p>
          <ul>
            <li>
              Idempotency Key：クライアントが1回の操作ごとに一意の値（キー）を作り、リクエストに付けて送ります。サーバーはキーと処理の結果を保存し、同じキーの2回目のリクエストには、処理をやり直さずに保存した結果を返します。IETF（インターネットの技術の標準を決める団体）の作業部会で、このためのヘッダー <code>Idempotency-Key</code> の仕様が検討されており<Ref n={2} />、Stripe の API もこのヘッダーを使います<Ref n={3} />。
            </li>
            <li>
              Deduplication：Webhook やメッセージキューの受け手が、届いたイベントの ID を記録し、記録済みの ID のイベントを処理せずに捨てます。Stripe も、処理したイベントの ID を記録し、記録済みのイベントを処理しないことで、重複して届いたイベントに対処できると説明しています<Ref n={5} />。
            </li>
          </ul>
          <p>
            ジョブが再試行や Sidekiq の停止で2回実行される場合の書き方は<ChapterLink n={18} section="idempotency" />の「再試行や停止に備える冪等性」で、決済代行へ送るリクエストに冪等性キーを付ける側の実装は<ChapterLink n={34} section="external-boundaries" />の「Stage 3：外部決済・部分失敗・再実行を設計する」で扱いました。この章では、自分たちの API が冪等性キーを受け取る側の実装と、Webhook の受け手の重複排除を扱います。
          </p>
          <h3>使う場面</h3>
          <p>同じ要求が2回以上届く原因は、主に次の3つです。</p>
          <ul>
            <li>利用者の操作：ボタンを2回押す、画面を読み込み直す、戻るボタンで前の画面に戻って送り直す。</li>
            <li>
              クライアントの自動の再試行：HTTP のクライアントやライブラリが、タイムアウトや接続の切断の後に同じリクエストを送り直す。HTTP の仕様も、応答を少しも受け取らないうちに接続が閉じたときに POST を自動で送り直すクライアントがあると書いています<Ref n={1} />。Stripe の SDK も、キーを作って自動で再試行できます<Ref n={4} />。
            </li>
            <li>
              <Term en="at-least-once delivery">少なくとも1回の配信</Term>：Webhook やメッセージキューは、届いたことを確かめられなければ送り直します。Stripe は本番の環境でイベントを最大3日間、間隔を広げながら送り直します<Ref n={5} />。Amazon SQS（AWS のメッセージキュー）の標準キューも、まれに同じメッセージをもう一度受け取ることがあるので、同じメッセージを2回以上処理しても問題のないように作るよう求めています<Ref n={7} />。
            </li>
          </ul>
          <h3>設計上の制約</h3>
          <ul>
            <li>失敗したように見えるリクエストは送り直したい（送り直さないと支払いが失われる）。一方で、送り直しで二重に決済してはいけない。</li>
            <li>クライアントには、タイムアウトしたリクエストがサーバーで処理されたかどうかを知る方法がない。</li>
            <li>2回目を見分けるには、過去のリクエストを覚えておく必要がある。一方で、すべてを永久に覚えておくことはできない。</li>
            <li>同じキーのリクエストが同時に届くことがあり、記録を確かめてから処理するまでの間に、ほかのリクエストが割り込める。</li>
            <li>外部の API の呼び出しやメールの送信は、DB のトランザクションに入れられず、失敗しても取り消せない。</li>
          </ul>
          <h3>解決方法：クライアントがキーを作り、再送でも同じキーを送る</h3>
          <p>
            キーはクライアントが1回の操作（1回の支払い）ごとに作ります。草案はキーを、クライアントが作る一意の値で、サーバーが同じリクエストの再送を見分けるために使うものと定義し、UUID（衝突しにくいように作る128ビットの識別子）か同じくらいランダムな値を使うよう勧めています<Ref n={2} />。Stripe も、UUID のバージョン4か十分にランダムな文字列を勧め、長さは255文字まで、メールアドレスのような機密のデータは使わないよう求めています<Ref n={3} />。ショッピングカートの ID のように、利用者に結び付いたオブジェクトの ID からキーを作る方法も、二重送信を防ぐ比較的簡単な方法として挙げています<Ref n={4} />。
          </p>
          <p>
            キーは最初の送信の前に1回だけ作り、送り直すときは同じキーを使います。送り直すたびにキーを作ると、サーバーには別の操作に見えます。Stripe は、プロセスの再起動をまたいで再試行するなら、操作ごとにキーを作って保存し、すべての試行で同じキーを送るよう求めています<Ref n={4} />。
          </p>
          <Figure n="88-2" title="Idempotency-Key を付けた再送に、保存した応答を返す" caption="図 88-1 と同じ流れにキーを加えた図。青い枠と青い矢印は、再送を見分けて決済を繰り返さない流れ。2回目のリクエストでは、サーバーは決済代行を呼ばない。">
            <Sequence
              id="88-2"
              rows={WITH_KEY}
              label="アプリがキー k1 を付けて支払いを送る。サーバーは k1 を処理中として INSERT し、単独で COMMIT する。k1 から作ったキーを渡して決済代行で決済し、ch_1 を受け取る。payments への INSERT と、k1 を完了にして応答を保存することを、同じトランザクションで確定する。応答が届く前にアプリがタイムアウトし、同じキー k1 で再送する。INSERT が一意索引に違反し、k1 は完了しているので、サーバーは決済せずに保存した応答を Idempotent-Replayed ヘッダーを付けて返す"
            />
          </Figure>
          <p>図 88-2 の2回目のリクエストでは、キーの行がすでに「完了」なので、サーバーは決済代行を呼ばずに1回目の応答を返します。サーバーはキーごとに表の1行を持ち、次の順に処理します。</p>
          <ol>
            <li>キーを登録する：キーの行を「処理中」として INSERT します。キーの列には一意索引があるので、入れられたらこのリクエストが処理を担当し、一意索引に違反したらすでに同じキーの行があります。</li>
            <li>
              内容を照合する：同じキーで内容の違うリクエストは、クライアントの誤りです。草案は、キーと一緒に、内容全体のチェックサムのようにリクエストの内容から作る<Term en="fingerprint">指紋</Term>を使ってよいとし<Ref n={2} />、違う内容でキーを再利用したリクエストには 422（Unprocessable Content）を返すべきだとしています<Ref n={2} />。この章では内容の SHA-256 のハッシュ値を保存し、違えば 422 を返します。Stripe も元のリクエストとパラメーターを比べ、違えばエラー（種類は idempotency_error）にします<Ref n={3} />
              <Ref n={12} />。
            </li>
            <li>処理中なら 409 を返す：1回目の処理が終わる前に同じキーのリクエストが届いたら、草案は 409（Conflict）を返すべきだとしています<Ref n={2} />。Stripe は、409 が同じキーのリクエストの実行中を表すなら、待ってから同じキーと同じパラメーターで送り直すよう案内しています<Ref n={4} />。</li>
            <li>処理して、応答を保存する：処理が終わったら、キーの行を「完了」にし、応答（ステータスコードと本文）を保存します。業務の書き込み（支払いの記録）と同じトランザクションで行うので、支払いが記録されたのにキーが完了にならない、ということは起きません。</li>
            <li>
              完了していれば、保存した応答を返す：Stripe の API v1 は、同じキーの最初のリクエストのステータスコードと本文を保存し、同じキーの再送には 500 のエラーも含めて保存した応答を返します<Ref n={3} />。保存した応答を返したことは <code>Idempotent-Replayed: true</code> ヘッダーで分かります<Ref n={4} />。この章もこれに合わせます。
            </li>
            <li>
              期限を過ぎたキーを消す：草案は、サーバーが時間でキーを失効させてよく、その場合は期限を決める規則を公開すべきだとしています<Ref n={2} />。Stripe はキーを少なくとも24時間保持し、それ以降は削除することがあり、削除された後に同じキーを使うと新しいリクエストとして実行されうると説明しています<Ref n={4} />。この章では、作ってから24時間たったキーを定期的に消します。
            </li>
          </ol>
          <Figure
            n="88-3"
            title="キーの状態と、同じキーのリクエストへの応答"
            caption="中段の箱はキーの行の状態、矢印は状態を変える処理（メソッド名は rails-impl の節の IdempotencyKey）。上段の2つの箱は、その状態のときに同じキーのリクエストが届いたら返す応答。処理中のまま残った行も、TTL を過ぎると purge_expired で消える（図では省略）。"
          >
            <KeyStatesFigure />
          </Figure>
          <p>
            図 88-3 の中段は、idempotency_keys の1行がたどる状態です。INSERT が成功すると「処理中」になり、業務の書き込みと一緒に応答を保存すると「完了」になります。処理が失敗したら行を消して、同じキーで送り直せる状態に戻します。上段は状態ごとの応答で、内容が違えば状態にかかわらず 422 です。
          </p>
          <Callout kind="note" title="草案と実装による違い">
            <p>
              Idempotency-Key の仕様は IETF の作業部会の文書（Internet-Draft）で、RFC（正式な標準の文書）にはなっていません。MSDP の教科書が確かめた版は draft-ietf-httpapi-idempotency-key-header-08（2026年10月22日）です。この版は、処理済みのリクエストの再送には「利用者の意図どおりに処理が完了したことと矛盾しない応答」を返すとしていますが、保存した応答をそのまま返すことまでは求めておらず、この部分は議論が続いていると書いています<Ref n={2} />。ステータスコードも実装によって違い、Stripe のようなキーを PostgreSQL で実装する方法を説明した brandur.org の記事は、パラメーターが違う場合にも 409 を返しています<Ref n={9} />。自分たちの API では、どの場合に何を返すかを決めて、API のドキュメントに書きます。
            </p>
          </Callout>
          <h3>構造</h3>
          <p>この章の2つのパターンは、次の要素で構成します。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">この章のクラス・テーブル</th>
                  <th scope="col">受け持つこと</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">キー</th>
                  <td><code>Idempotency-Key</code> ヘッダーの値（UUID）</td>
                  <td>1回の操作を表す。再送でも同じ値を送る</td>
                </tr>
                <tr>
                  <th scope="row">キーの記録</th>
                  <td>idempotency_keys テーブル・<code>IdempotencyKey</code></td>
                  <td>状態（処理中・完了）、指紋、保存した応答、処理を始めた日時、作った日時を持つ</td>
                </tr>
                <tr>
                  <th scope="row">キーの登録と判定</th>
                  <td><code>IdempotencyKey.claim</code></td>
                  <td>INSERT で「処理中」にする。すでにあれば、保存した応答・409・422 のどれにするかを決める</td>
                </tr>
                <tr>
                  <th scope="row">結果の保存</th>
                  <td><code>IdempotencyKey#complete!</code></td>
                  <td>業務の書き込みと同じトランザクションで、キーを完了にして応答を保存する</td>
                </tr>
                <tr>
                  <th scope="row">解放・引き継ぎ・期限</th>
                  <td><code>#release!</code>・<code>#take_over</code>・<code>.purge_expired</code></td>
                  <td>失敗したらキーを放す。処理中のまま残ったキーを引き継ぐ。期限を過ぎたキーを消す</td>
                </tr>
                <tr>
                  <th scope="row">手順の進行</th>
                  <td><code>PayOrder</code>（app/services）</td>
                  <td>キーの登録、決済代行の呼び出し、記録と完了のトランザクション、失敗したときの解放を順に行う</td>
                </tr>
                <tr>
                  <th scope="row">HTTP の受け付け</th>
                  <td><code>PaymentsController</code></td>
                  <td>ヘッダーからキーを取り出して形式を確かめ、結果をステータスコードと本文にする</td>
                </tr>
                <tr>
                  <th scope="row">処理済みのイベントの記録</th>
                  <td>webhook_events テーブル（<code>event_id</code> の一意索引）</td>
                  <td>同じイベントの2回目の記録を拒む</td>
                </tr>
                <tr>
                  <th scope="row">イベントの処理</th>
                  <td><code>HandlePaymentSucceeded</code></td>
                  <td>イベントの記録と注文の更新を、同じトランザクションで確定する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>キーをクライアントごとに区別する</h3>
          <p>
            キーの表の一意索引は、クライアント（API の利用者）の ID とキーの組に付けます。キーだけにすると、別々のクライアントがたまたま同じキーを送ったときに、片方のリクエストに、もう片方の保存した応答を返してしまいます。草案のセキュリティの節も、推測しやすいキーを許すと、攻撃者がほかのクライアントのキーを当てて保存された応答を読み出せると警告しています。対策として、キーの形式を決めて公開し処理の前に必ず形式を確かめること、クライアントが送ったキーとサーバーだけが知るクライアントの情報を組み合わせて検索のキーにすることを勧めています<Ref n={2} />。この章では、トークンで認証した User の ID とキーの組を一意にします。
          </p>
        </>
      ),
    },
    {
      id: 'delivery-guarantees',
      title: '配信の保証の3種類と、厳密に1回にできない処理',
      body: (
        <>
          <p>
            メッセージやイベントを届ける仕組みが、何回届くことを約束するかを<Term en="delivery guarantee">配信の保証</Term>と呼びます。Apache Kafka（分散メッセージングのソフトウェア）のドキュメントは、次の3種類を挙げています<Ref n={6} />。
          </p>
          <ul>
            <li><Term en="at-most-once">最大1回</Term>：失われることはあるが、2回以上は届かない。</li>
            <li>少なくとも1回（at-least-once）：失われないが、2回以上届くことがある。</li>
            <li><Term en="exactly-once">厳密に1回</Term>：1回だけ処理される。</li>
          </ul>
          <p>
            受け手の側では、どの保証になるかは「どこまで処理したか」をいつ記録するかで決まります。Kafka の説明では、処理する前に位置（どこまで読んだか）を記録すると、処理の途中で止まったときにそのメッセージは処理されず、最大1回になります。処理した後で位置を記録すると、記録の前に止まったときに同じメッセージをもう一度処理し、少なくとも1回になります<Ref n={6} />。
          </p>
          <Figure n="88-4" title="配信の保証の3種類" caption="受け手が「処理」と「処理済みの記録」をどの順番で行うかで、止まった後の再送の扱いが変わる。破線の枠は1つの DB トランザクション。">
            <DeliveryGuaranteesFigure />
          </Figure>
          <p>
            図 88-4 は3種類の保証を受け手の処理の順番で比べたものです。上の2行は、処理と記録を別々に確定するので、間で止まると処理が失われるか、重複します。下の行は、処理と記録を同じトランザクションで確定するので、途中で止まれば両方が取り消され、再送されたものを1回だけ処理できます。
          </p>
          <p>
            厳密に1回については注意が必要です。Kafka のドキュメントは、厳密に1回の配信をうたうシステムは多いが、受け手や送り手が失敗する場合などには当てはまらないことがあるので細かい条件を読むべきだとし、Kafka 以外の送り先に対して厳密に1回を実現するには一般に送り先の協力が必要だとしています<Ref n={6} />。Amazon SQS の FIFO キューの「exactly-once processing」も、送る側が5分間の重複排除の期間内に送り直したときに、キューに重複を入れないという機能です<Ref n={8} />。このページが説明しているのは送る側の重複で、受け手の処理が2回実行されないことには触れていません。
          </p>
          <p>
            そのため実務では、送る側と経路は少なくとも1回届くことを前提にし、受け手が重複を見分けて捨てることで、結果を1回分にします。この章の2つのパターンは、どちらもこの「受け手で重複を捨てる」方法です。
          </p>
          <h3>処理と記録を同じトランザクションで確定する</h3>
          <p>
            Webhook の受け手では、イベントの記録と業務の処理（注文を支払い済みにする）を同じトランザクションで確定します。記録を先に別のトランザクションで確定すると、処理の前に止まったときに「処理済み」の記録だけが残り、再送されたイベントは捨てられます。つまり最大1回になり、支払いの処理が失われます。逆に、処理を先に確定してから記録すると、記録の前に止まったときにもう一度処理します。同じトランザクションなら、両方が確定するか、両方が取り消されるかのどちらかです。Kafka のドキュメントも、受け手が位置を処理の結果と同じ場所に記録することで、両方が更新されるか、どちらも更新されないかのどちらかにする方法を説明しています<Ref n={6} />。BEGIN・COMMIT・ROLLBACK の動きは<ChapterLink n={38} section="transaction" />の「Transaction：まとめて確定し、まとめて取り消す」で扱いました。
          </p>
          <h3>操作自体を冪等にする</h3>
          <p>
            キーや ID で2回目を捨てるだけでなく、処理そのものを冪等に書けるなら、そうします。「支払い済みの金額に 3,000 円を加算する」は、2回実行すると 6,000 円になります。「支払い待ちの注文を、支払い済み・3,000 円に設定する」は、何回実行しても同じ結果です。
          </p>
          <Code
            lang="sql"
            title="加算と、状態の設定"
            code={`
-- 冪等でない：実行した回数だけ増える
UPDATE orders SET paid_amount = paid_amount + 3000 WHERE id = 1;

-- 冪等：何回実行しても同じ。支払い待ちの注文だけを変える
UPDATE orders SET status = 'paid', paid_amount = 3000 WHERE id = 1 AND status = 'pending';
`}
          />
          <p>
            2つ目の UPDATE は、WHERE の条件で「支払い待ちであること」を確かめ、同じ文で状態を変えます。2回目は条件に合う行がないので、変更した行の数が 0 になります。確かめることと書き込むことを1つの文にする書き方は、<ChapterLink n={38} section="lost-update-fix" />の「送金で更新の消失を防ぐ書き方」でも扱いました。Kafka のドキュメントも、多くの場合メッセージには主キーがあり、同じメッセージを2回受け取っても同じ内容で行を上書きするだけなので、更新は冪等になると説明しています<Ref n={6} />。
          </p>
          <p>
            ID による重複排除だけでは足りない場合もあります。Stripe は、場合によっては同じ出来事について別々のイベント（別の ID）が作られて送られることがあり、その重複は <code>data.object</code> の ID とイベントの種類で見分けるよう説明しています<Ref n={5} />。状態を設定する書き方なら、この場合も2回目は何も変えません。
          </p>
          <h3>外部への副作用は厳密に1回にできない</h3>
          <p>
            領収書のメールの送信は、DB のトランザクションに入れられません。トランザクションを確定した後に送ると、送る前に止まったときにメールは送られません（最大1回）。確定する前に送ると、確定に失敗したときに、メールは送ったのに記録がないので、再送されたイベントでもう一度送ります（少なくとも1回）。どちらの順番でも厳密に1回にはなりません。Kafka のドキュメントが述べるとおり、ほかの送り先で厳密に1回にするには、一般に送り先（ここではメールのサービス）の協力が必要です<Ref n={6} />。
          </p>
          <p>
            そのため、外部への副作用ごとに、失われる方と重複する方のどちらを許すかを決めます。この章の例は、トランザクションを確定した後にメールのジョブを投入し、送られないことを許しています。Rails 8.1 では、トランザクションの中で <code>deliver_later</code> を呼ぶと COMMIT の前にジョブが Redis に入るので（<ChapterLink n={18} section="transaction" />の「トランザクションと投入の時刻」）、投入はトランザクションのブロックの外に書きます。投入したジョブも、Sidekiq の停止で2回実行されることがあります（<ChapterLink n={18} section="idempotency" />）。メールを確実に送る必要があるなら、「送るメール」を業務の処理と同じトランザクションで DB に記録し、別の処理が読み出して送る方法があります。これは<ChapterLink n={53} section="idea" />の Transactional Outbox で扱います。その場合のメールの送信は少なくとも1回になるので、メールのサービスがキーを受け付けるならキーを渡します。
          </p>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装：Idempotency-Key を受け取る支払いの API',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  controllers/api_controller.rb             # トークンで API の利用者を決める
  controllers/payments_controller.rb        # Idempotency-Key ヘッダーを受け取る
  controllers/payment_webhooks_controller.rb
  models/idempotency_key.rb                 # キーの登録・判定・完了・解放・引き継ぎ・期限
  models/webhook_event.rb                   # 処理済みのイベントの記録
  models/order.rb                           # mark_paid（状態の設定）
  services/pay_order.rb                     # 支払いの手順
  services/handle_payment_succeeded.rb      # 支払い成功のイベントの処理
  clients/payment_gateway.rb                # 決済代行の Adapter
  jobs/purge_deduplication_records_job.rb   # 期限を過ぎた記録を消す
db/migrate/20261120000002_create_idempotency_keys_and_webhook_events.rb
spec/support/fake_payment_gateway.rb        # 決済代行の代役
`}
          />
          <p>
            app/services と app/clients は、起動時に存在すれば app の下のほかのディレクトリと同じくオートロードの対象になります（<ChapterLink n={33} section="extra-classes" />）。Webhook の部分は次の webhook の節で扱い、この節では支払いの API を作ります。
          </p>
          <h3>マイグレーション</h3>
          <Code
            lang="ruby"
            title="db/migrate/20261120000002_create_idempotency_keys_and_webhook_events.rb"
            code={`
class CreateIdempotencyKeysAndWebhookEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :idempotency_keys do |t|
      t.references :user, null: false, foreign_key: true, index: false # キーは API の利用者ごとに区別する
      t.string :key, null: false
      t.string :request_hash, null: false # リクエストの内容から作った指紋（SHA-256）
      t.string :status, null: false, default: "processing"
      t.integer :response_status # 完了したときの応答。同じキーの再送にそのまま返す
      t.json :response_body
      t.datetime :locked_at, null: false # 処理を始めた日時。処理中のまま残ったキーの判断に使う
      t.datetime :created_at, null: false # 有効期限の判断に使う
      t.index [:user_id, :key], unique: true
      t.index :created_at
      t.check_constraint "status IN ('processing', 'completed')", name: "idempotency_keys_status"
    end

    # 処理した Webhook のイベントの記録
    create_table :webhook_events do |t|
      t.string :event_id, null: false, index: { unique: true } # 決済代行が付けたイベントの ID
      t.string :event_type, null: false
      t.datetime :created_at, null: false, index: true
    end

    add_index :payments, :charge_id, unique: true # 1つの決済は1行だけ記録する
  end
end
`}
          />
          <p>
            一意索引は <code>(user_id, key)</code> の組に付けます。<code>t.references</code> は既定で user_id だけの索引を作りますが、ここでは <code>index: false</code> にしました。MySQL は外部キーの列に索引を必要としますが、その列を先頭に並べた索引があればよく<Ref n={19} />、<code>(user_id, key)</code> の索引がその条件を満たします。<code>status</code> の CHECK 制約は MySQL 8.0.16 から働きます。列と制約の選び方は<ChapterLink n={27} section="table-structure" />で扱いました。
          </p>
          <p>
            応答の本文は JSON 型の列に保存します。MySQL は JSON のオブジェクトを保存するときにキーを並べ替えます<Ref n={18} />。後の実行結果のとおり、保存した応答を返すと本文の項目の順番が1回目と変わるので、本文をバイト単位で同じにしたい場合は文字列の列に保存します。
          </p>
          <h3>キーの登録と判定：IdempotencyKey</h3>
          <Code
            lang="ruby"
            title="app/models/idempotency_key.rb"
            code={`
class IdempotencyKey < ApplicationRecord
  TTL = 24.hours # キーを保存しておく期間。API のドキュメントに書く
  LOCK_TIMEOUT = 5.minutes # 処理中のまま、この時間を過ぎたキーは再送で引き継げる

  # 保存しておく応答。同じキーの再送には replayed: true にして返す
  Response = Data.define(:status, :body, :replayed) do
    def initialize(status:, body:, replayed: false) = super
  end

  belongs_to :user

  # リクエストの内容から指紋を作る。キーワード引数の順番は呼ぶ側で決めておく
  def self.fingerprint(**request) = Digest::SHA256.hexdigest(request.to_json)

  # キーを「処理中」として登録する。トランザクションの外で呼ぶ。戻り値は次のどれか
  #   IdempotencyKey … このリクエストが処理する（登録した行）
  #   Response       … 完了済み。保存した応答
  #   :in_progress   … 同じキーのリクエストを処理している最中
  #   :mismatch      … 同じキーで、内容が違うリクエスト
  def self.claim(user:, key:, request_hash:)
    create!(user:, key:, request_hash:, locked_at: Time.current) # INSERT だけで確定する
  rescue ActiveRecord::RecordNotUnique
    saved = find_by(user:, key:)
    if saved.nil? then :in_progress # 確かめる間にキーが放された。もう一度送ってもらう
    elsif saved.request_hash != request_hash then :mismatch
    elsif saved.status == "completed" then saved.response
    elsif saved.take_over then saved
    else :in_progress
    end
  end

  # 有効期限を過ぎたキーを消す。定期的に実行する
  def self.purge_expired = where(created_at: ...TTL.ago).delete_all

  # 業務の書き込みと同じトランザクションの中で呼び、キーを完了にして応答を保存する
  def complete!(status:, body:)
    update!(status: "completed", response_status: status, response_body: body)
    response
  end

  # 結果が分からないまま失敗したときにキーを放し、同じキーの再送をもう一度処理できるようにする
  def release! = self.class.where(id:, status: "processing").delete_all

  def response = Response.new(status: response_status, body: response_body)

  # 処理中のまま LOCK_TIMEOUT を過ぎたキーを引き継ぐ。条件付きの UPDATE なので、引き継げるのは1つだけ
  def take_over
    self.class.where(id:, status: "processing", locked_at: ...LOCK_TIMEOUT.ago)
      .update_all(locked_at: Time.current) == 1
  end
end
`}
          />
          <p>
            <code>claim</code> はまず <code>create!</code> で行を入れます。同じ <code>(user_id, key)</code> の行があると MySQL はエラー 1062（ER_DUP_ENTRY）を返し、Rails の MySQL のアダプターはこれを <code>ActiveRecord::RecordNotUnique</code> に変えます<Ref n={15} />。その場合は既存の行を読み、指紋が違えば <code>:mismatch</code>、完了していれば保存した応答、処理中なら <code>:in_progress</code> を返します。既存の行を読む前にほかのリクエストがキーを放した（行を消した）場合は、もう一度送ってもらうために <code>:in_progress</code> にします。
          </p>
          <p>
            MSDP の元の例は PostgreSQL の <code>INSERT … ON CONFLICT DO NOTHING</code> で行を入れ、入った行の数（1 か 0）で判断していました。MySQL には ON CONFLICT 句がありません。似た書き方の <code>INSERT IGNORE</code> は、一意索引の重複だけでなく、無視できるほかのエラーも警告に変えて文を続けます<Ref n={20} />。Rails の <code>insert</code> は MySQL では <code>ON DUPLICATE KEY UPDATE</code> を使いますが、行を入れたかどうかを戻り値から判断できません（次の webhook の節で確かめます）。そこでこの章では、一意索引の違反を RecordNotUnique として受け取る書き方にしました。
          </p>
          <p>
            指紋は、キーワード引数の Hash を JSON の文字列にしてから SHA-256 のハッシュ値にします。Hash は項目を入れた順に並ぶので、<code>fingerprint(order_id:, amount:)</code> のように呼ぶ側で順番を決めておきます。
          </p>
          <p>
            <code>take_over</code> は処理の途中でプロセスが止まり「処理中」のまま残った行を、再送したリクエストが引き継ぐためのメソッドです。<code>locked_at</code> が <code>LOCK_TIMEOUT</code> より古い場合だけ、条件付きの UPDATE で <code>locked_at</code> を今の時刻に変えます。同時に2つのリクエストが引き継ごうとしても、条件に合って行を変えられるのは片方だけです。brandur.org の記事も、キーにロックした日時を持たせ、一定の時間より古ければ処理を引き継げるようにしています<Ref n={9} />。
          </p>
          <h3>キーの登録と業務の処理を別のトランザクションにする理由</h3>
          <p>
            <code>claim</code> の INSERT は業務の処理を始める前に単独で確定します。トランザクションの外で <code>create!</code> を呼ぶと、Rails はその INSERT だけを BEGIN と COMMIT で囲みます。
          </p>
          <p>
            キーの登録を業務の処理と同じトランザクションに入れると、COMMIT するまでほかのリクエストからは「処理中」の行が見えません。MySQL では、確定していない行と同じ値を別のトランザクションが INSERT すると、その INSERT は先のトランザクションが確定するか取り消されるまで待ちます（webhook の節の実行結果）。決済代行の呼び出しに時間がかかれば、同じキーの2つ目のリクエストは 409 を受け取れずに待たされ続け、その間 DB の接続とロックも使い続けます。「処理中」の行を先に確定しておけば、2つ目はすぐに 409 を受け取れます。brandur.org の記事も、キーの登録をそれだけで1つのトランザクションにしています<Ref n={9} />。外部の API をトランザクションの中で呼ばない理由は、<ChapterLink n={34} section="transaction-design" />の「一緒に確定する範囲を決める」でも扱いました。
          </p>
          <p>
            そのため <code>claim</code> は、ほかのトランザクションの中から呼びません。外側のトランザクションがあると INSERT はそのトランザクションに加わり、外側が COMMIT するまで確定しないからです。
          </p>
          <h3>支払いの手順：PayOrder</h3>
          <Code
            lang="ruby"
            title="app/services/pay_order.rb"
            code={`
# 注文の支払い。同じキーのリクエストは、何回届いても1回だけ決済する
class PayOrder
  def initialize(gateway: PaymentGateway.new)
    @gateway = gateway
  end

  # 戻り値は IdempotencyKey::Response
  def call(user:, key:, order:, amount:)
    claimed = IdempotencyKey.claim(user:, key:, request_hash: IdempotencyKey.fingerprint(order_id: order.id, amount:))
    case claimed
    when IdempotencyKey::Response then return claimed.with(replayed: true)
    when :in_progress then return IdempotencyKey::Response.new(status: 409, body: { "error" => "request_in_progress" })
    when :mismatch then return IdempotencyKey::Response.new(status: 422, body: { "error" => "idempotency_key_reused" })
    end

    begin
      # 決済代行にもキーを渡す。応答が届かずに失敗しても、同じキーでの呼び直しは同じ決済として扱われる
      charge_id = @gateway.charge(amount:, idempotency_key: "#{user.id}:#{key}")
      ApplicationRecord.transaction do
        payment = order.payments.create!(charge_id:, amount:)
        # 支払いの記録とキーの完了を、同じトランザクションで確定する
        claimed.complete!(status: 201, body: { "payment_id" => payment.id, "charge_id" => charge_id })
      end
    rescue StandardError
      claimed.release! # キーを放し、同じキーで再送してもらえるようにする
      raise
    end
  end
end
`}
          />
          <p>
            <code>case</code> の <code>when</code> は <code>===</code> で比べるので、<code>when IdempotencyKey::Response</code> は値がそのクラスのインスタンスのときに選ばれます。保存した応答には、<code>Data#with</code> で <code>replayed</code> だけを変えた写しを作って返します。どの <code>when</code> にも当たらなければ、<code>claimed</code> は登録した IdempotencyKey の行で、このリクエストが処理を担当します。
          </p>
          <p>
            トランザクションの中では、支払いの記録と <code>complete!</code> を続けて行います。<code>complete!</code> の UPDATE が失敗すれば支払いの記録も取り消されるので、「支払いはあるのにキーが処理中のまま」という状態は残りません。
          </p>
          <h3>外部の API を呼んだ後の失敗</h3>
          <p>
            決済代行の API を呼んだ後は、DB のトランザクションを取り消しても決済は取り消せません。応答がタイムアウトした場合は、決済されたかどうかも分かりません。そこで PayOrder は、決済代行を呼ぶときにもクライアントのキーから作ったキー（<code>"利用者の ID:キー"</code>）を渡します。決済代行がキーで重複を防ぐなら、同じキーで呼び直しても2回目の決済は行われません。そのうえで、処理が失敗したときは <code>release!</code> でキーの行を消し、クライアントが同じキーで送り直せるようにします。決済代行のキーをこの章のキーの行の ID から作らないのは、キーを放して入れ直すと行の ID が変わり、決済代行には別の操作に見えるからです。キーの形式を UUID に限っているので、決済代行に渡すキーの長さは Stripe の上限（255 文字）に収まります。
          </p>
          <p>
            ただし、キーを放してよいのは、決済代行が同じキーの呼び直しを同じ決済として扱う場合だけです。Stripe の API v1 は同じキーへの 500 の応答も保存して返すので、500 の後に同じキーで呼び直しても同じ 500 が返ります<Ref n={3} />。Stripe は、500 の結果は分からないものとして扱い、元の結果を確かめるまで新しいキーで再試行しないよう求めています<Ref n={4} />。決済代行がキーを受け付けない場合は、キーを放さず、人が結果を確かめるまで処理を止めておきます。brandur.org の記事も、冪等でない外部の操作が失敗したら、その操作を失敗のまま残すしかない場合があると述べています<Ref n={9} />。結果が不明な支払いを再試行と照合で決着させる方法は<ChapterLink n={34} section="external-boundaries" />で扱いました。
          </p>
          <p>
            決済が成功した後で DB が止まった場合は、<code>release!</code> も失敗し、キーは「処理中」のまま残ります。このときは <code>LOCK_TIMEOUT</code> を過ぎた後の再送が <code>take_over</code> で引き継ぎ、決済代行は同じキーに同じ決済の ID を返します。引き継ぐ前に元のリクエストが遅れて支払いを記録していた場合は、<code>payments.charge_id</code> の一意索引が2行目の記録を止めます。
          </p>
          <h3>HTTP で受け付ける：PaymentsController</h3>
          <Code
            lang="ruby"
            title="app/controllers/payments_controller.rb"
            code={`
class PaymentsController < ApiController
  # キーは UUID に限る。草案の形式（"…" で囲む）と、囲まない形式の両方を受け付ける
  KEY_FORMAT = /\\A("?)(\\h{8}-\\h{4}-\\h{4}-\\h{4}-\\h{12})\\1\\z/

  # POST /orders/:order_id/payments
  def create
    key = request.headers["Idempotency-Key"].to_s[KEY_FORMAT, 2]
    return render json: { error: "idempotency_key_required" }, status: :bad_request unless key

    order = current_user.orders.find(params[:order_id])
    result = PayOrder.new.call(user: current_user, key:, order:, amount: Integer(params.expect(:amount)))
    response.headers["Idempotent-Replayed"] = "true" if result.replayed
    render json: result.body, status: result.status
  end
end
`}
          />
          <p>
            草案はヘッダーの値を、引用符で囲んだ文字列（ヘッダーの値の書き方を決めた仕様 Structured Field Values の String 型）と定めています。一方、Stripe のドキュメントの例は引用符で囲まずに送っています<Ref n={2} />
            <Ref n={3} />。この章の例は両方を受け付け、正規表現の <code>\1</code> で前後の引用符がそろっていることを確かめます。キーがないか形式に合わなければ、処理の前に 400 を返します。草案も、キーが必要な操作でキーがなければ 400 を返すべきだとしています<Ref n={2} />。保存した応答を返したときは、Stripe と同じ <code>Idempotent-Replayed</code> ヘッダーを付けます。
          </p>
          <Callout kind="v72">
            <p>
              <code>params.expect</code> は Rails 8.0 で追加されたメソッドです<Ref n={21} />。Rails 7.2 では <code>params.require(:amount)</code> や <code>params.require(:data).permit(:order_id, :amount)</code> で書きます。Strong Parameters の仕組みは<ChapterLink n={10} section="params" />で扱いました。
            </p>
          </Callout>
          <h3>実行して確かめる</h3>
          <p>scene の節と同じ方法で、同じキーを付けた支払いのリクエストを2回送りました。</p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4。時刻と指紋の値は省略）"
            code={`
== 同じキーで支払いのリクエストを2回送る
  TRANSACTION  BEGIN
  IdempotencyKey Create  INSERT INTO \`idempotency_keys\` (\`user_id\`, \`key\`, \`request_hash\`, \`status\`, …)
                         VALUES (1, '5f0c6b1e-8a1d-4a53-9d55-2f4d3c7b9e10', '5c00f7b0…', 'processing', …)
  TRANSACTION  COMMIT
  TRANSACTION  BEGIN
  Payment Create  INSERT INTO \`payments\` (\`order_id\`, \`charge_id\`, \`amount\`, …) VALUES (1, 'ch_1', 3000, …)
  IdempotencyKey Update  UPDATE \`idempotency_keys\` SET \`idempotency_keys\`.\`status\` = 'completed',
                         \`idempotency_keys\`.\`response_status\` = 201,
                         \`idempotency_keys\`.\`response_body\` = '{\\"payment_id\\":1,\\"charge_id\\":\\"ch_1\\"}'
                         WHERE \`idempotency_keys\`.\`id\` = 1
  TRANSACTION  COMMIT
1回目: 201 Idempotent-Replayed=nil {"payment_id":1,"charge_id":"ch_1"}
  TRANSACTION  BEGIN
  IdempotencyKey Create  INSERT INTO \`idempotency_keys\` (\`user_id\`, \`key\`, \`request_hash\`, \`status\`, …)
                         VALUES (1, '5f0c6b1e-8a1d-4a53-9d55-2f4d3c7b9e10', '5c00f7b0…', 'processing', …)
  TRANSACTION  ROLLBACK
  IdempotencyKey Load  SELECT \`idempotency_keys\`.* FROM \`idempotency_keys\`
                       WHERE \`idempotency_keys\`.\`user_id\` = 1 AND \`idempotency_keys\`.\`key\` = '5f0c6b1e-…' LIMIT 1
2回目: 201 Idempotent-Replayed="true" {"charge_id":"ch_1","payment_id":1}
payments=1件 決済代行の決済=1件
`}
          />
          <p>
            1回目は、キーの INSERT が単独で COMMIT され、続くトランザクションで支払いの記録とキーの完了が一緒に COMMIT されました。2回目は、キーの INSERT が一意索引に違反して ROLLBACK され、既存の行を読む SELECT の後に、保存した応答が <code>Idempotent-Replayed: true</code> を付けて返りました。決済代行の決済も payments の行も1件です。2回目の本文で項目の順番が変わっているのは、MySQL の JSON 型がキーを並べ替えて保存したためです。
          </p>
          <h3>期限を過ぎた記録を消すジョブ</h3>
          <Code
            lang="ruby"
            title="app/jobs/purge_deduplication_records_job.rb"
            code={`
# 定期実行する。キーとイベントの記録を、決めた期間だけ残して消す
class PurgeDeduplicationRecordsJob < ApplicationJob
  def perform
    IdempotencyKey.purge_expired
    WebhookEvent.where(created_at: ...30.days.ago).delete_all # 決済代行が再送する期間より長く残す
  end
end
`}
          />
          <p>
            このジョブを1時間ごとなどに定期実行します。定期実行の設定と、実行されなかったことに気づくための監視は<ChapterLink n={18} section="recurring-jobs" />の「定期実行と、実行予定の監視」で扱いました。<code>created_at</code> に索引を付けたので、消す行を索引で探せます。処理中のまま残った行も、TTL を過ぎればここで消えます。
          </p>
          <h3>パターンを使っていないコードから直していく順序</h3>
          <ol>
            <li>同じ要求が2回以上届きうる処理を挙げる：クライアントが再送しうる POST の API、Webhook の受け手、キューのメッセージを処理するジョブ。</li>
            <li>操作自体を冪等にできるものは書き換える：加算を「状態の設定」にし、条件付きの UPDATE にする（この章の <code>Order.mark_paid</code>）。</li>
            <li>イベントの受け手に、ID の一意索引を持つ記録の表を加え、記録と処理を同じトランザクションにする（webhook の節）。</li>
            <li>冪等にできない POST に、キーの表と判定を加える。最初はキーが付いたリクエストだけを対象にし、クライアントがキーを送るようになってから、キーを必須にする（キーがなければ 400）。</li>
            <li>外部の API にもキーを渡す。外部の API がキーを受け付けるか確かめ、受け付けない場合は、結果が分からない失敗のときにキーを放さないようにする。</li>
            <li>期限を過ぎた記録を消すジョブを動かし、キーの期限と再送してよい期間を API のドキュメントに書く。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'webhook',
      title: 'Webhook のイベントを一意索引で1回だけ処理する',
      body: (
        <>
          <p>
            Webhook の受け手は、イベントの ID を表に記録し、記録済みなら処理しません。Stripe は、イベントの作成日時（<code>created</code>）で処理済みかどうかを判断せず、イベントの ID で重複を見分けるよう求めています<Ref n={5} />。記録の表 webhook_events には、rails-impl の節のマイグレーションで <code>event_id</code> の一意索引を付けました。
          </p>
          <Code
            lang="ruby"
            title="app/services/handle_payment_succeeded.rb"
            code={`
# 決済代行から届いた「支払いが成功した」イベントを処理する。同じイベントが何回届いても1回だけ処理する。
# 戻り値は :processed・:duplicate_event・:already_paid のどれか
class HandlePaymentSucceeded
  def call(event_id:, order_id:, amount:)
    result = ApplicationRecord.transaction do
      # ① イベントの ID を記録する。記録済みなら、INSERT が一意索引に違反して既存の行が返る
      event = WebhookEvent.create_or_find_by!(event_id:) { it.event_type = "payment.succeeded" }
      next :duplicate_event unless event.previously_new_record?

      # ② 加算ではなく状態を設定する。別の ID で同じ内容のイベントが来ても、2回目は何も変えない
      Order.mark_paid(order_id, amount) == 1 ? :processed : :already_paid
    end # ③ 記録と処理を同じトランザクションで確定する。途中で失敗すれば記録も取り消される

    # ④ メールは DB の外への副作用なので、確定した後に投入する
    ReceiptMailer.paid(order_id).deliver_later if result == :processed
    result
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/order.rb・app/models/webhook_event.rb"
            code={`
class Order < ApplicationRecord
  belongs_to :user
  has_many :payments

  # 支払い待ちの注文だけを、支払い済み・その金額に設定する。変えた行の数を返す（2回目からは 0）
  def self.mark_paid(id, amount)
    where(id:, status: "pending").update_all(status: "paid", paid_amount: amount, updated_at: Time.current)
  end
end

# 処理した Webhook のイベントの記録。event_id の重複は一意索引で防ぐ。
# validates :event_id, uniqueness: true は付けない（SELECT で確かめてから INSERT するので同時に届くと防げず、
# create_or_find_by! が INSERT に進む前に検証で失敗する）
class WebhookEvent < ApplicationRecord
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/payment_webhooks_controller.rb"
            code={`
class PaymentWebhooksController < ActionController::API
  # POST /webhooks/payments  決済代行から届くイベント
  def create
    # 実際には、最初に決済代行の署名を検証する（本章では省略）
    id, type, data = params.expect(:id, :type, data: [:order_id, :amount])
    if type == "payment.succeeded"
      HandlePaymentSucceeded.new.call(event_id: id, order_id: Integer(data[:order_id]), amount: Integer(data[:amount]))
    end
    head :ok # 処理済みのイベントにも 200 を返す。エラーを返すと、決済代行が再送を続ける
  end
end
`}
          />
          <p>
            <code>params.expect</code> に複数の名前を渡すと、値を配列で返します。トランザクションのブロックの中の <code>next :duplicate_event</code> は、ブロックの戻り値を <code>:duplicate_event</code> にして正常に終わらせるので、トランザクションは COMMIT されます（記録済みのイベントなので、何も変わりません）。
          </p>
          <Figure n="88-5" title="Webhook のイベントの重複排除" caption="HandlePaymentSucceeded の流れ。破線の枠の中は1つのトランザクション。青い矢印は初めてのイベントの流れ。同時に届いた同じイベントの2つ目は、① で1つ目の確定を待ってから一意索引の違反になる。">
            <WebhookFlowFigure />
          </Figure>
          <p>
            図 88-5 の中央の列が、初めてのイベントの流れです。① で記録した行が新しければ、② で注文を支払い済みにして COMMIT します。右の箱は記録済みのイベントで、何もせずに COMMIT します。左の箱は ② が失敗した場合で、ROLLBACK で ① の記録も取り消されるので、決済代行が再送したイベントをもう一度処理できます。メールの投入は COMMIT の後で、処理した場合だけ行います。
          </p>
          <h3>MySQL での重複の捨て方：insert と create_or_find_by!</h3>
          <p>
            MSDP の Rails の例は、<code>WebhookEvent.insert(…, unique_by: :event_id)</code> で記録していました。PostgreSQL では <code>INSERT … ON CONFLICT ("event_id") DO NOTHING RETURNING "id"</code> になり、戻り値が空なら記録済みだと分かります。MySQL で同じことをすると、次のようになりました。
          </p>
          <Code
            lang="text"
            title="実行結果（MySQL 8.4）"
            code={`
  WebhookEvent Insert  INSERT INTO \`webhook_events\` (\`event_id\`,\`event_type\`,\`created_at\`)
                       VALUES ('evt_9', 'payment.succeeded', CURRENT_TIMESTAMP(6)) AS \`webhook_events_values\`
                       ON DUPLICATE KEY UPDATE \`event_id\`=\`webhook_events\`.\`event_id\`
  WebhookEvent Insert  （2回目も同じ SQL）
1回目の戻り値 rows=[]  2回目の戻り値 rows=[]
unique_by を渡す => ArgumentError: ActiveRecord::ConnectionAdapters::Mysql2Adapter does not support :unique_by
`}
          />
          <p>
            Rails は MySQL で重複を飛ばす <code>insert</code> を、<code>ON DUPLICATE KEY UPDATE</code> で列に同じ値を入れ直す SQL にします<Ref n={14} />。重複しても例外にはなりませんが、MySQL の Rails のアダプターは RETURNING を使わない（MariaDB 10.5 以降だけが対象）ので、戻り値は1回目も2回目も空です。どの一意索引で重複を判断するかを選ぶ <code>unique_by</code> も MySQL では使えず、ArgumentError になります<Ref n={16} />。そのため MySQL の <code>insert</code> では、行を入れたのか、記録済みだったのかを戻り値から判断できません。
          </p>
          <p>
            そこで HandlePaymentSucceeded は <code>create_or_find_by!</code> を使います。このメソッドはまず行を作ろうとし、一意制約の違反で例外が出たら、それを捕まえて既存の行を探して返します<Ref n={10} />。新しく作ったのか既存の行を返したのかは、<code>previously_new_record?</code>（直前の保存で新しく作られた場合に true）で分かります<Ref n={11} />。Rails のドキュメントは、欠点として次のものを挙げています<Ref n={10} />。
          </p>
          <ul>
            <li>対象の列に、DB の一意制約が必要。</li>
            <li>INSERT と既存の行を探す SELECT の間に、ほかのクライアントがその行を DELETE すると、別の競合が起きうる（多くのアプリでは起きにくい）。</li>
            <li>例外で処理の流れを変えるので、わずかに遅くなりうる。</li>
            <li>作るのに失敗しても、主キーの連番が進むことがある。</li>
            <li>一意制約のある列に、モデルの一意性の検証（uniqueness）を付けてはいけない。付けると INSERT の前の検証で失敗し、既存の行を探す処理に進まない。</li>
          </ul>
          <p>同じイベントを2回送ったときの SQL は次のとおりです。</p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4。時刻は省略）"
            code={`
== 同じ Webhook のイベントが2回届く
  TRANSACTION  BEGIN
  WebhookEvent Create  INSERT INTO \`webhook_events\` (\`event_id\`, \`event_type\`, \`created_at\`) VALUES ('evt_1', 'payment.succeeded', …)
  Order Update All  UPDATE \`orders\` SET \`orders\`.\`status\` = 'paid', \`orders\`.\`paid_amount\` = 3000, …
                    WHERE \`orders\`.\`id\` = 1 AND \`orders\`.\`status\` = 'pending'
  TRANSACTION  COMMIT
1回目: 200
  TRANSACTION  BEGIN
  WebhookEvent Create  INSERT INTO \`webhook_events\` (\`event_id\`, \`event_type\`, \`created_at\`) VALUES ('evt_1', 'payment.succeeded', …)
  TRANSACTION  ROLLBACK AND CHAIN
  WebhookEvent Load  SELECT \`webhook_events\`.* FROM \`webhook_events\` WHERE \`webhook_events\`.\`event_id\` = 'evt_1' LIMIT 1 FOR SHARE
  TRANSACTION  COMMIT
2回目: 200
order: status=paid paid_amount=3000  投入された領収書のメール=1件
`}
          />
          <p>
            2回目は INSERT が一意索引に違反した後、<code>ROLLBACK AND CHAIN</code> が実行され、既存の行を <code>SELECT … FOR SHARE</code> で読んでいます。<code>create_or_find_by!</code> は INSERT を <code>transaction(requires_new: true)</code> で囲み、違反したらその部分だけを取り消します<Ref n={13} />。通常は SAVEPOINT を作ってそこまで戻しますが、Rails 8.1 は外側のトランザクションがまだ何も書き込んでいなければ SAVEPOINT を作らず、取り消すときに外側のトランザクションを <code>ROLLBACK AND CHAIN</code>（取り消して、すぐに新しいトランザクションを始める）でやり直します<Ref n={17} />。外側のトランザクションがすでに書き込んでいれば、SAVEPOINT と ROLLBACK TO SAVEPOINT になります。SAVEPOINT の動きは<ChapterLink n={15} section="nested" />の「入れ子のトランザクション」で扱いました。
          </p>
          <p>
            既存の行を読むときは、トランザクションの中なら MySQL 8.0.1 以降で <code>FOR SHARE</code> を付けます。Rails のソースのコメントは、REPEATABLE READ でも最新の行を読み（current read）、重複した INSERT が取った共有ロックを排他ロックに上げずに済むためだと説明しています<Ref n={14} />。トランザクションの外で呼んだ場合は、ロックを付けない <code>find_by!</code> で読みます。
          </p>
          <p>
            <code>create_or_find_by!</code> の代わりに、トランザクション全体を <code>rescue ActiveRecord::RecordNotUnique</code> で囲んで重複とみなす書き方もあります。<ChapterLink n={34} section="external-boundaries" />の PaymentWebhooksController は、イベントを保存する INSERT だけを行い、処理をジョブに任せていたので、この書き方で足りていました。ここでは同じトランザクションで注文も更新するので、業務の処理で起きたほかの一意索引の違反まで「重複したイベント」として 200 を返し、イベントを失うおそれがあります。<code>create_or_find_by!</code> は、記録の INSERT で起きた違反だけを捕まえます。一方、<code>find_or_create_by!</code> は先に SELECT して、なければ INSERT します。Rails のドキュメントも、この処理は不可分ではなく、一意制約がなければ同じ内容の行が2つ以上できうると注意しています<Ref n={10} />。重複排除には使いません。
          </p>
          <h3>同じイベントが同時に届いたとき</h3>
          <p>
            同じ <code>event_id</code> を2つの接続から同時に INSERT し、先に INSERT した側（A）が1秒後に COMMIT する場合と ROLLBACK する場合を試しました。
          </p>
          <Code
            lang="text"
            title="実行結果（script/wait.rb。MySQL 8.4）"
            code={`
== A が COMMIT する場合
0.01秒 A: INSERT した。1秒後に確定する
0.20秒 B: 同じ event_id を INSERT する
1.02秒 A: COMMIT
1.04秒 B: ActiveRecord::RecordNotUnique（Duplicate entry 'evt_1' for key 'webhook_events.index_webhook_events_on_event_id'）
== A が ROLLBACK する場合
0.00秒 A: INSERT した。1秒後に取り消しする
0.20秒 B: 同じ event_id を INSERT する
1.01秒 A: ROLLBACK
1.02秒 B: INSERT できた
`}
          />
          <p>
            B の INSERT は、A が確定するまで待ちました。A が COMMIT すれば B は一意索引の違反になり、A が ROLLBACK すれば B の INSERT が通ります。MySQL のマニュアルは、INSERT が重複のエラーになったとき、重複した索引のレコードに共有ロックを取ると説明しています<Ref n={22} />。同じマニュアルは、3つのセッションが同じ行を INSERT し、最初のセッションが ROLLBACK すると、残りの2つが互いの共有ロックを待ってデッドロックになりうる例も挙げています。この場合 Rails では <code>ActiveRecord::Deadlocked</code> になり、Webhook には 500 が返るので、決済代行が後で送り直します。デッドロックの扱いは<ChapterLink n={38} section="deadlock" />で扱いました。
          </p>
          <p>
            そのため、図 88-5 で同時に届いた同じイベントの2つ目は、① で1つ目の確定を待ち、1つ目が COMMIT すれば既存の行を受け取って何もしません。1つ目が ② で失敗して ROLLBACK すれば、2つ目が記録して処理します。
          </p>
          <h3>重複には 200 を返し、失敗には 2xx 以外を返す</h3>
          <p>
            処理に失敗したときは、2xx 以外を返します。Stripe は 2xx 以外を受け取るとイベントを送り直します<Ref n={5} />。この章のコントローラーは例外を rescue しないので、Rails が 500 を返します（<ChapterLink n={10} section="exceptions" />）。逆に、記録済みのイベント（重複）には 200 を返します。重複にエラーを返すと、決済代行はまだ届いていないと判断して送り直しを続けます。
          </p>
          <p>
            Stripe は、タイムアウトの原因になりうる複雑な処理の前に、すぐに 2xx を返すよう求めています<Ref n={5} />。この章の処理は1行の UPDATE なので応答の前に行っていますが、時間のかかる処理は、イベントを保存して 200 を返した後にジョブで行います。その構成は<ChapterLink n={34} section="external-boundaries" />の「Webhook で届く結果」で扱いました。その場合はジョブが同じイベントを2回実行することがあるので、ジョブの側でも状態を設定する書き方にするか、処理済みであることを処理と同じトランザクションで記録します。
          </p>
          <h3>イベントの記録を残す期間</h3>
          <p>
            処理済みのイベントの表も増え続けるので、イベントの ID を覚えておく期間を決めて古い行を消します。期間は、送る側が再送を続ける期間より長くします。Stripe なら、自動の再送は最大3日、CLI での手動の再送はイベントの作成から30日までです<Ref n={5} />。この章の PurgeDeduplicationRecordsJob は、30日より古い行を消します。
          </p>
          <Callout kind="warn" title="Webhook の署名の検証">
            <p>
              この章のコードは重複排除に絞るため、Webhook の送り主の確認を省いています。Stripe は、検証しなければ、攻撃者が偽のイベントを送って注文の処理などを起こせると警告しています<Ref n={5} />。実際の受け手では、決済代行が付ける署名を、イベントを記録する前に検証します（<ChapterLink n={34} section="external-boundaries" />の PaymentWebhooksController）。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストで重複と同時の要求を再現する',
      body: (
        <>
          <p>重複は同じリクエストを2回送るだけでテストで再現できます。この章のテストで確かめることは次のとおりです。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">確かめること</th>
                  <th scope="col">spec</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>同じキーの再送に、決済せずに保存した応答を返す。内容が違えば 422、キーがなければ 400。利用者が違えば別の操作</td>
                  <td>spec/requests/payments_spec.rb</td>
                </tr>
                <tr>
                  <td>決済代行の応答が失われても、同じキーの再送で二重に決済しない</td>
                  <td>spec/requests/payments_spec.rb</td>
                </tr>
                <tr>
                  <td>処理中のキーへの同時のリクエストに 409 を返す。処理中のまま残ったキーを引き継ぐ。期限を過ぎたキーを消す</td>
                  <td>spec/services/pay_order_spec.rb（別々の DB 接続）</td>
                </tr>
                <tr>
                  <td>同じイベントを2回受け取っても、処理とメールは1回。ID が違う同じ内容のイベントも1回。途中で失敗すれば記録も取り消される</td>
                  <td>spec/requests/payment_webhooks_spec.rb</td>
                </tr>
                <tr>
                  <td>同じイベントが同時に届いても、1回だけ処理する</td>
                  <td>spec/services/handle_payment_succeeded_spec.rb（別々の DB 接続）</td>
                </tr>
                <tr>
                  <td>MySQL での insert と create_or_find_by! の動き</td>
                  <td>spec/models/webhook_event_spec.rb</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>決済代行の代役</h3>
          <Code
            lang="ruby"
            title="spec/support/fake_payment_gateway.rb"
            code={`
# テスト用の決済代行の代役。決済した記録を持ち、同じ idempotency_key の呼び出しには前の決済の ID を返す
class FakePaymentGateway
  class Timeout < StandardError; end

  attr_reader :charges
  # true にすると、次の1回は決済した後で Timeout を投げる（応答が届かなかった状態を作る）
  attr_accessor :fail_after_charge
  # Queue を設定すると、決済の前に Queue から1つ取り出すまで待つ（処理中の状態を作る）
  attr_accessor :gate

  def initialize
    @charges = []
    @by_key = {}
  end

  def charge(amount:, idempotency_key: nil)
    gate&.pop
    return @by_key[idempotency_key] if idempotency_key && @by_key.key?(idempotency_key)

    charge_id = "ch_#{@charges.size + 1}"
    @charges << { charge_id:, amount: }
    @by_key[idempotency_key] = charge_id if idempotency_key
    if fail_after_charge
      self.fail_after_charge = false
      raise Timeout, "決済代行の応答がタイムアウトした"
    end
    charge_id
  end
end
`}
          />
          <p>
            代役は同じキーの呼び出しに前の決済の ID を返します。<code>fail_after_charge</code> を true にすると、決済した後で例外を投げ、決済されたのに応答が届かなかった状態を作れます。<code>gate</code> に <code>Queue</code> を設定すると、<code>Queue#pop</code> がほかのスレッドから値が入るまで待つので、1つ目のリクエストを決済の手前で止めておけます。spec/support のファイルは rails_helper.rb で読み込みます。
          </p>
          <h3>支払いの API のテスト</h3>
          <Code
            lang="ruby"
            title="spec/requests/payments_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "POST /orders/:order_id/payments", type: :request do
  let(:gateway) { FakePaymentGateway.new }
  let(:user) { User.create!(name: "花子", api_token: "token-1") }
  let(:order) { user.orders.create!(amount: 3000) }
  let(:key) { "5f0c6b1e-8a1d-4a53-9d55-2f4d3c7b9e10" }

  before { allow(PaymentGateway).to receive(:new).and_return(gateway) }

  def pay(order: self.order, key: self.key, amount: 3000, token: "token-1")
    post "/orders/#{order.id}/payments", params: { amount: }, as: :json,
                                          headers: { "Authorization" => "Bearer #{token}", "Idempotency-Key" => %("#{key}") }
  end

  it "同じキーの再送には、決済せずに保存した応答を返す" do
    pay
    first = response.parsed_body
    pay

    expect(response).to have_http_status(:created)
    expect(response.headers["Idempotent-Replayed"]).to eq("true")
    expect(response.parsed_body).to eq(first)
    expect(gateway.charges.size).to eq(1)
    expect(order.payments.count).to eq(1)
  end

  it "同じキーで内容が違うリクエストは 422 にする" do
    pay
    pay(amount: 5000)

    expect(response).to have_http_status(:unprocessable_content)
    expect(response.parsed_body).to eq("error" => "idempotency_key_reused")
    expect(gateway.charges.size).to eq(1)
  end

  it "キーがない、または UUID の形式でなければ 400 にする" do
    pay(key: "pay-order-1")

    expect(response).to have_http_status(:bad_request)
    expect(gateway.charges).to be_empty
  end

  it "別の利用者が同じキーを送っても、別の操作として扱う" do
    other = User.create!(name: "太郎", api_token: "token-2")
    pay
    pay(order: other.orders.create!(amount: 3000), token: "token-2")

    expect(response).to have_http_status(:created)
    expect(response.headers["Idempotent-Replayed"]).to be_nil
    expect(gateway.charges.size).to eq(2)
  end

  it "決済代行の応答が失われて失敗しても、同じキーの再送で二重に決済しない" do
    gateway.fail_after_charge = true # 決済はできたが、応答が届かなかった
    expect { pay }.to raise_error(FakePaymentGateway::Timeout)
    expect(IdempotencyKey.count).to eq(0) # キーは放されている

    pay # クライアントが同じキーで再送する
    expect(response).to have_http_status(:created)
    expect(gateway.charges.size).to eq(1) # 決済代行も同じキーで重複を防ぐ
    expect(Payment.count).to eq(1)
  end
end
`}
          />
          <p>
            <code>allow(PaymentGateway).to receive(:new).and_return(gateway)</code> で、PayOrder が作る PaymentGateway を代役に替えています。依存先を引数で渡して差し替える方法は<ChapterLink n={33} section="dependency-injection" />で扱いました。最後の例では、代役の例外がコントローラーを通り抜けて <code>raise_error</code> で受け取れます。テストの環境の <code>show_exceptions = :rescuable</code> は、RecordNotFound のように応答のステータスが決まっている例外だけを応答に変えるためです（<ChapterLink n={10} section="exceptions" />）。本番では、このリクエストに 500 が返ります。
          </p>
          <h3>同時のリクエストのテスト</h3>
          <Code
            lang="ruby"
            title="spec/services/pay_order_spec.rb"
            code={`
require "rails_helper"

RSpec.describe PayOrder do
  self.use_transactional_tests = false # 別々の DB 接続で同時に実行するため
  after { [IdempotencyKey, Payment, Order, User].each(&:delete_all) }

  let(:gateway) { FakePaymentGateway.new }
  let(:user) { User.create!(name: "花子", api_token: "token-1") }
  let(:order) { user.orders.create!(amount: 3000) }
  let(:args) { { user:, key: "5f0c6b1e-8a1d-4a53-9d55-2f4d3c7b9e10", order:, amount: 3000 } }

  def in_thread(&) = Thread.new { ActiveRecord::Base.connection_pool.with_connection(&) }

  it "同じキーのリクエストが処理中なら、後から来た方は 409 にする" do
    request = args
    gateway.gate = Queue.new # 1つ目を決済の前で止める
    first = in_thread { described_class.new(gateway:).call(**request) }
    sleep 0.01 until IdempotencyKey.exists? # 1つ目がキーを登録して確定するまで待つ

    expect(described_class.new(gateway:).call(**request).status).to eq(409)
    gateway.gate << true
    expect(first.value.status).to eq(201)
    expect(gateway.charges.size).to eq(1)
  end

  it "処理中のまま LOCK_TIMEOUT を過ぎたキーは、再送したリクエストが引き継ぐ" do
    IdempotencyKey.create!(user:, key: args[:key], locked_at: 6.minutes.ago, # 処理の途中でプロセスが止まった
                           request_hash: IdempotencyKey.fingerprint(order_id: order.id, amount: 3000))

    expect(described_class.new(gateway:).call(**args).status).to eq(201)
    expect(IdempotencyKey.sole.status).to eq("completed")
  end

  it "有効期限を過ぎたキーを消すと、同じキーは新しいリクエストとして登録される" do
    described_class.new(gateway:).call(**args)
    IdempotencyKey.update_all(created_at: 25.hours.ago)

    expect(IdempotencyKey.purge_expired).to eq(1)
    expect(IdempotencyKey.claim(user:, key: args[:key], request_hash: "x")).to be_a(IdempotencyKey)
  end
end
`}
          />
          <p>
            rails_helper.rb の <code>use_transactional_fixtures = true</code> は、各例をトランザクションで囲み、例が終わったらロールバックします。この設定のままでは、スレッドを分けても同じ接続とトランザクションを使うので、別々のリクエストが同時に届く状態を再現できません。そこで同時のテストでは <code>use_transactional_tests = false</code> にして、作った行を <code>after</code> で消します（<ChapterLink n={20} section="transaction" />の「トランザクションによる巻き戻し」）。1つ目のスレッドは <code>with_connection</code> で接続プールから別の接続を借ります（<ChapterLink n={15} section="pool" />）。
          </p>
          <p>
            409 のテストでは、1つ目のリクエストを決済の手前で止め、キーの行が COMMIT されて見えるようになるのを <code>IdempotencyKey.exists?</code> で待ってから、2つ目を呼んでいます。<code>request = args</code> は、<code>let</code> の値をスレッドを作る前に評価しておくための行です。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/payment_webhooks_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "POST /webhooks/payments", type: :request do
  let(:order) { User.create!(name: "花子", api_token: "token-1").orders.create!(amount: 3000) }
  let(:event) { { id: "evt_1", type: "payment.succeeded", data: { order_id: order.id, amount: 3000 } } }

  def deliver(event) = post("/webhooks/payments", params: event, as: :json)

  it "同じイベントが2回届いても、どちらにも 200 を返し、処理とメールは1回だけ" do
    expect {
      deliver(event)
      deliver(event)
    }.to have_enqueued_mail(ReceiptMailer, :paid).once

    expect(response).to have_http_status(:ok)
    expect(WebhookEvent.where(event_id: "evt_1").count).to eq(1)
    expect(order.reload).to have_attributes(status: "paid", paid_amount: 3000)
  end

  it "ID が違う同じ内容のイベントは、状態を設定する書き方で吸収する" do
    expect {
      deliver(event)
      deliver(event.merge(id: "evt_2"))
    }.to have_enqueued_mail(ReceiptMailer, :paid).once

    expect(response).to have_http_status(:ok)
    expect(order.reload.paid_amount).to eq(3000)
  end

  it "処理が途中で失敗すると、イベントの記録も取り消される" do
    broken = event.deep_merge(data: { amount: -1 }) # CHECK 制約（paid_amount >= 0）に違反させる

    expect { deliver(broken) }.to raise_error(ActiveRecord::CheckViolation)
    expect(WebhookEvent.count).to eq(0) # 記録されていないので、再送されれば処理し直す
    expect(order.reload.status).to eq("pending")
  end
end
`}
          />
          <p>
            3つ目の例は、orders テーブルの CHECK 制約 <code>paid_amount &gt;= 0</code> に違反する金額を送り、② の UPDATE を失敗させています。<code>ActiveRecord::CheckViolation</code> は Rails 8.1 で加わった例外のクラスで、Rails 7.2 では <code>ActiveRecord::StatementInvalid</code> になります（<ChapterLink n={34} section="transaction-design" />）。メールの投入は <code>have_enqueued_mail</code> で確かめます（<ChapterLink n={20} section="jobs-mail" />）。
          </p>
          <Code
            lang="ruby"
            title="spec/services/handle_payment_succeeded_spec.rb"
            code={`
require "rails_helper"

RSpec.describe HandlePaymentSucceeded do
  self.use_transactional_tests = false # 別々の DB 接続で同時に実行するため
  after { [WebhookEvent, Order, User].each(&:delete_all) }

  it "同じイベントが同時に届いても、1回だけ処理する" do
    order_id = User.create!(name: "花子", api_token: "token-1").orders.create!(amount: 3000).id
    threads = 2.times.map do
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          described_class.new.call(event_id: "evt_1", order_id:, amount: 3000)
        end
      end
    end

    expect(threads.map(&:value).sort).to eq(%i[duplicate_event processed])
    expect(Order.find(order_id).paid_amount).to eq(3000)
  end
end
`}
          />
          <p>spec/models/webhook_event_spec.rb には、webhook の節で示した insert と create_or_find_by! の動きを確かめる2つの例を書きました。すべてを実行した結果です。</p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
環境
  MySQL 8.4 につながる

WebhookEvent
  MySQL では insert に unique_by を渡せず、戻り値からは行を入れたかどうかが分からない
  create_or_find_by! は一意索引に違反したら既存の行を返し、新しく作ったかは previously_new_record? で分かる

POST /webhooks/payments
  同じイベントが2回届いても、どちらにも 200 を返し、処理とメールは1回だけ
  ID が違う同じ内容のイベントは、状態を設定する書き方で吸収する
  処理が途中で失敗すると、イベントの記録も取り消される

POST /orders/:order_id/payments
  同じキーの再送には、決済せずに保存した応答を返す
  同じキーで内容が違うリクエストは 422 にする
  キーがない、または UUID の形式でなければ 400 にする
  別の利用者が同じキーを送っても、別の操作として扱う
  決済代行の応答が失われて失敗しても、同じキーの再送で二重に決済しない

HandlePaymentSucceeded
  同じイベントが同時に届いても、1回だけ処理する

PayOrder
  同じキーのリクエストが処理中なら、後から来た方は 409 にする
  処理中のまま LOCK_TIMEOUT を過ぎたキーは、再送したリクエストが引き継ぐ
  有効期限を過ぎたキーを消すと、同じキーは新しいリクエストとして登録される

Finished in 1.18 seconds (files took 4.57 seconds to load)
15 examples, 0 failures
`}
          />
          <p>
            どのテストも「2回呼んでも結果は1回分」という性質をそのまま確かめています。後から処理を変えて重複に弱くなれば、これらのテストが失敗します。同時に届く場合も、代役の中で処理を止めれば毎回同じ順番を作れます。
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
            <li>クライアントや送る側が、結果の分からないリクエストを安全に送り直せる。</li>
            <li>同じ要求が同時に届いても、DB の一意索引で1つだけが処理される。</li>
            <li>再送に保存した応答を返すので、クライアントは1回目と同じ結果（支払いの ID など）を受け取れる。</li>
            <li>受け手で重複を捨てるので、送る側や経路は少なくとも1回の配信のままでよい。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>キーの表、期限を過ぎた記録を消すジョブ、処理中のまま残ったキーへの対応が必要になる。</li>
            <li>クライアントに、キーを作って保存し、再送で同じキーを送るように実装してもらう必要がある。キーの形式・期限・応答のステータスコードを API のドキュメントに書く。</li>
            <li>外部の API を呼んだ後の失敗は、外部の API がキーを受け付けるかどうかで扱いが変わる。</li>
            <li>メールなどの外部への副作用は、厳密に1回にはならない。失われる方と重複する方のどちらを許すかを、副作用ごとに決める必要がある。</li>
            <li>1回の支払いで、キーの INSERT と完了の UPDATE の書き込みが増える。処理済みのイベントの表も、消すまで行が増え続ける。</li>
          </ul>
          <h3>保守性とテストのしやすさ</h3>
          <p>
            キーの登録・判定・完了は IdempotencyKey に集まっているので、ほかの POST の API（送金、ポイントの付与など）にも同じ手順で使えます。PayOrder のように「claim して、外部を呼び、記録と complete! を同じトランザクションで行い、失敗したら release! する」という順番は API ごとに同じなので、新しい API を足すときはこの順番を守っているかをレビューで確かめます。
          </p>
          <p>
            重複は同じリクエストを2回送るだけで再現できます。同時に届く場合は、別々の DB 接続と、外部の API の代役の中で処理を止める仕組みが必要です。これらのテストは一意索引やトランザクションの範囲を変えたときに失敗するので、モックで呼び出しの順番を確かめるだけのテストより、二重の決済に直結する誤りを見つけやすくなります。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>SELECT で確かめてから INSERT する</h3>
          <Code
            lang="ruby"
            title="誤り：2つのリクエストが同時に「記録なし」を読むと、両方とも処理する"
            code={`
return head(:ok) if WebhookEvent.exists?(event_id:)

WebhookEvent.create!(event_id:, event_type:)
Order.mark_paid(order_id, amount)
`}
          />
          <p>
            「記録がなければ処理する」を SELECT と INSERT の2つの文で書くと、その間にほかのリクエストが割り込めます。一意索引もなければ、同時に届いた2つの要求が両方とも記録して処理します。重複の判定は一意索引に任せ、<code>create_or_find_by!</code> か RecordNotUnique で受け取ります。同じ問題は <code>validates :uniqueness</code> でも起きます（<ChapterLink n={14} section="uniqueness" />の「一意性の検証と競合」）。
          </p>
          <h3>find_or_create_by や uniqueness の検証に重複排除を任せる</h3>
          <Code
            lang="ruby"
            title="誤り：どちらも SELECT の後に INSERT するので、同時に届くと防げない"
            code={`
event = WebhookEvent.find_or_create_by!(event_id:) { it.event_type = type }

class WebhookEvent < ApplicationRecord
  validates :event_id, uniqueness: true # create_or_find_by! も検証で失敗するようになる
end
`}
          />
          <p>
            <code>find_or_create_by!</code> は不可分ではありません<Ref n={10} />。uniqueness の検証を付けると、<code>create_or_find_by!</code> は INSERT の前の検証で RecordInvalid を投げ、既存の行を探す処理に進みません。重複を止めるのは DB の一意索引で、モデルの検証は入力の誤りを利用者に知らせる目的に限ります。
          </p>
          <h3>再送のたびにキーを作り直す</h3>
          <Code
            lang="ruby"
            title="誤り：API を呼ぶ側が、試行のたびに新しいキーを作る"
            code={`
3.times do
  res = conn.post("/orders/1/payments", { amount: 3000 }.to_json,
                  "Idempotency-Key" => SecureRandom.uuid) # 試行ごとに違うキー
  break if res.success?
rescue Faraday::TimeoutError
  next
end
`}
          />
          <p>
            クライアントが送るたびに新しいキーを作ると、サーバーには別々の操作に見え、再送で二重に決済されます。キーは操作ごとに1回作り、再送では同じキーを使います。プロセスの再起動をまたいで再試行するなら、キーを DB に保存してから最初の送信をします（<ChapterLink n={33} section="adapters" />の「冪等性キーを再試行で変えない」）。再試行の間隔の決め方は<ChapterLink n={54} section="idea" />の Retry with Backoff で扱います。
          </p>
          <h3>キーだけを見て、内容を照合しない</h3>
          <Code
            lang="ruby"
            title="誤り：同じキーなら、内容が違っても保存した応答を返す"
            code={`
saved = IdempotencyKey.find_by(user:, key:)
return saved.response.with(replayed: true) if saved&.status == "completed"
`}
          />
          <p>
            同じキーで金額だけを変えたリクエストが届いたときに保存した応答を返すと、クライアントは 5,000 円の支払いが成功したと誤解します。内容の指紋を保存して照合し、違えば 422 にします。
          </p>
          <h3>記録を先に確定してから処理する</h3>
          <Code
            lang="ruby"
            title="誤り：記録と処理を別々のトランザクションで確定する"
            code={`
WebhookEvent.create!(event_id:, event_type:) # ここで COMMIT される
Order.mark_paid(order_id, amount)            # この前で止まると、再送は「処理済み」として捨てられる
`}
          />
          <p>イベントの記録を確定してから処理を始めると、処理の途中で止まったときに、イベントは処理済みとして捨てられ、処理は失われます（図 88-4 の最大1回）。記録と処理は同じトランザクションで確定します。</p>
          <h3>重複したイベントにエラーを返す</h3>
          <Code
            lang="ruby"
            title="誤り：記録済みのイベントに 409 を返す"
            code={`
rescue ActiveRecord::RecordNotUnique
  head :conflict # 決済代行は届いていないと判断して、再送を続ける
`}
          />
          <p>記録済みのイベントに 4xx や 5xx を返すと、送る側は届いていないと判断して送り直し続けます。重複には 200 を返します。</p>
          <h3>キーを永久に保存する、または期限を短くしすぎる</h3>
          <p>
            キーを消さずにいると、表の行が増え続けます。<code>TTL = 1.minute</code> のように期限を短くしすぎると、期限の後に届いた再送が新しいリクエストとして処理されます。クライアントが再試行を続ける期間より長い期限を決め、API のドキュメントに書きます。brandur.org の記事も、キーは冪等性を保つための仕組みであって履歴の保管場所ではないので、一定の時間の後に消すべきだとしています<Ref n={9} />。決済の履歴は payments テーブルに残します。
          </p>
          <h3>処理中のまま残ったキーを放っておく</h3>
          <Code
            lang="ruby"
            title="誤り：処理中のキーには、期限が来るまで 409 を返し続ける"
            code={`
elsif saved.status == "processing" then :in_progress # take_over も locked_at もない
`}
          />
          <p>
            処理の途中でプロセスが止まると、キーは「処理中」のまま残り、同じキーの再送はキーが消えるまで（この章の TTL なら 24 時間）409 になります。この章の IdempotencyKey は <code>locked_at</code> を持ち、<code>LOCK_TIMEOUT</code> を過ぎた行を <code>take_over</code> で引き継げるようにしています。処理中のまま残っている行の数を監視し、増えていれば原因を調べます。
          </p>
        </>
      ),
    },
    {
      id: 'alternatives',
      title: 'ほかの方法との使い分けと採用の判断',
      body: (
        <>
          <h3>より単純な方法</h3>
          <ul>
            <li>
              操作自体を冪等にする：「支払い済みにする」のように状態を設定する操作なら、キーの表はいりません。作成の操作も、クライアントが ID を作り、<code>PUT /payments/（クライアントが作った ID）</code> のように「この ID のリソースを、送った内容の状態にする（なければ作る）」形にすれば、冪等なメソッドの PUT で表せます<Ref n={1} />。
            </li>
            <li>
              業務の行に一意索引を付ける：注文1件に支払いが1件だけなら、payments の order_id に一意索引を付ければ、二重の記録は防げます。注文の作成なら、<ChapterLink n={34} section="refactoring-stages" />の「二重送信を防ぐ」のように、注文に利用者ごとに一意な <code>request_key</code> を持たせる方法もあります。ただし、外部の決済は記録の前に行われるので、二重の決済は防げません。外部の API にもキーを渡す必要があります。
            </li>
            <li>画面で二度押しを防ぐ：送信したらボタンを押せなくするのは、二度押しを減らすのに役立ちます。ただし、タイムアウトの後の再送や、ライブラリの自動の再試行は防げません。</li>
          </ul>
          <h3>ほかの方式</h3>
          <ul>
            <li>
              処理を段階に分けて途中から再開する：外部の API を何回も呼ぶ処理では、brandur.org の記事のように、キーの行に「どの段階まで終わったか」を記録し、再送では続きから実行する方法があります<Ref n={9} />。この章の例より複雑になるので、外部の呼び出しが1回なら必要ありません。
            </li>
            <li>
              メッセージキューの重複排除の機能：Amazon SQS の FIFO キューは、5分間の重複排除の期間内の送り直しをキューに入れません<Ref n={8} />。Kafka の送る側（プロデューサー）にも、送り直しで同じメッセージが重複して書き込まれないようにする設定があります<Ref n={6} />。どちらも送る側の送り直しによる重複を防ぐ機能で、受け手が同じメッセージを2回処理することは防げないので、受け手の重複排除も必要です。
            </li>
          </ul>
          <h3>Rails の標準機能・gem との使い分け</h3>
          <ul>
            <li>
              Rails 8.1.4.1 のソース（actionpack・railties・activerecord）には、Idempotency-Key ヘッダーを扱う実装はありません。この章のように、モデルとサービスのクラスで書きます。
            </li>
            <li>
              重複の記録には、一意索引と <code>create_or_find_by!</code> か RecordNotUnique を使います。MySQL では <code>insert</code> の戻り値で重複を判断できず、<code>unique_by</code> も使えません。PostgreSQL や SQLite なら <code>insert(…, unique_by:)</code> の戻り値で判断できます。
            </li>
            <li>
              <code>Rails.cache.write(key, value, unless_exist: true)</code>：Redis のキャッシュストアでは SET の NX（キーがなければ書く）になり<Ref n={23} />、短い時間の二重送信を止める用途に使えます。ただし、キャッシュは DB のトランザクションに入らず、容量が足りなくなると消されることがあるので（<ChapterLink n={22} section="rails-cache" />）、決済のように二重の実行が損害になる処理の記録には使いません。
            </li>
            <li>
              ジョブの重複：Sidekiq や Active Job のジョブが2回実行されることへの備えは<ChapterLink n={18} section="idempotency" />で扱いました。ジョブの中で外部の API を呼ぶなら、この章と同じく、記録の一意索引と外部へのキーを使います。
            </li>
          </ul>
          <h3>似た考え方との違い</h3>
          <ul>
            <li>Optimistic Locking（<ChapterLink n={49} section="idea" />）：別々の人の別々の変更がぶつかることを防ぎます。この章は、同じ人の同じ要求が2回届くことを扱います。どちらも、条件付きの UPDATE や一意索引で、確かめることと書き込むことを1つの文にします。</li>
            <li>Domain Events（<ChapterLink n={51} section="idea" />）：業務上の出来事をイベントとして表します。イベントを別のプロセスやサービスに届けるときは、受け手がこの章の重複排除を行います。</li>
            <li>Transactional Outbox（<ChapterLink n={53} section="idea" />）：DB の更新とイベントの送信を取りこぼさないようにするパターンです。送信は少なくとも1回になるので、受け手にはこの章の重複排除が必要です。</li>
            <li>Retry with Backoff（<ChapterLink n={54} section="idea" />）：一時的な失敗を再試行するパターンです。冪等でない操作をキーなしで再試行すると、二重に実行されるおそれがあります。安全に再試行するには、この章のキーが必要です。</li>
          </ul>
          <h3>採用する条件</h3>
          <ul>
            <li>二重に実行されると、お金や在庫などに実害が出る操作（決済、送金、注文の作成）を、POST の API で受け付けている。</li>
            <li>クライアントや送る側が、失敗したように見えるリクエストを再送する（自動の再試行、利用者の操作）。</li>
            <li>Webhook やキューのように、少なくとも1回の配信でイベントを受け取っている。</li>
          </ul>
          <h3>採用しない方がよい条件</h3>
          <ul>
            <li>操作を、状態の設定や条件付きの UPDATE として冪等に書ける。その方が単純。</li>
            <li>2回実行されても実害がなく、気づいたら直せる操作（閲覧の記録など）。</li>
            <li>GET や DELETE のように、もともと冪等なメソッド。Stripe も、GET と DELETE は定義上冪等なので、キーを送っても効果はないとしています<Ref n={3} />。</li>
          </ul>
          <h3>判断のチェックポイント</h3>
          <ol>
            <li>同じ要求が2回以上届きうる処理はどれか（API、Webhook、キュー、バッチの再実行）。</li>
            <li>操作を、加算ではなく状態の設定として書き直せないか。</li>
            <li>キーや ID の記録に一意索引があり、記録と処理を同じトランザクションで確定しているか。</li>
            <li>クライアントは、キーを操作ごとに1回作り、再送で同じキーを送っているか。</li>
            <li>外部の API はキーを受け付けるか。受け付けないなら、結果が分からない失敗をどう扱うか。</li>
            <li>メールなどの外部への副作用で、失われる方と重複する方のどちらを許すか。</li>
            <li>キーとイベントの記録をいつ消すか。その期間は、送る側が再送を続ける期間より長いか。</li>
          </ol>
          <Callout kind="note" title="この章の2つの例の選び方">
            <p>
              支払いの作成は冪等に書き直せず、外部の決済を伴うので、Idempotency-Key を使い、決済代行にもキーを渡しました。Webhook の受け手は、送る側がイベントの ID を付けて少なくとも1回届けるので、ID の一意索引で重複を捨てました。さらに注文の更新を状態の設定にして、同じ内容のイベントが別の ID で届いても、注文を2回更新しないようにしました。
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
          <li>冪等な操作は、何回実行しても結果が1回分と同じになります。POST は冪等ではないので、タイムアウトの後に再送すると二重に実行されることがあります。</li>
          <li>配信の保証には最大1回・少なくとも1回・厳密に1回があります。実務では少なくとも1回届くことを前提にし、受け手で重複を捨てます。</li>
          <li>Idempotency Key では、クライアントが操作ごとにキーを作って再送でも同じキーを送ります。サーバーはキーを単独のトランザクションで INSERT し、処理中なら 409、内容が違えば 422、完了していれば保存した応答を返します。キーは利用者ごとに区別し、期限を決めて消します。</li>
          <li>MySQL では一意索引の違反が ActiveRecord::RecordNotUnique になります。<code>insert</code> の戻り値では重複を判断できず <code>unique_by</code> も使えないので、<code>create!</code> と rescue、または <code>create_or_find_by!</code> を使います。</li>
          <li>Webhook の受け手は、イベントの ID を一意索引のある表に記録し、記録と業務の処理を同じトランザクションで確定します。重複したイベントには 200 を返します。</li>
          <li>加算ではなく状態の設定として書けば、操作自体が冪等になり、別の ID で届いた同じ内容のイベントも吸収できます。</li>
          <li>外部の API を呼んだ後の失敗は取り消せないので、外部にもキーを渡します。メールのような外部への副作用は厳密に1回にできないので、失われる方と重複する方のどちらを許すかを決めます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'RFC 9110 HTTP Semantics（9.2.2 Idempotent Methods、409 Conflict、422 Unprocessable Content）', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110.html', accessed: '2026-11-13', version: '2022年6月', note: '冪等の定義、PUT・DELETE・安全なメソッドは冪等であること、冪等でないメソッドを自動で再送すべきでないこと、POST を自動で再送するクライアントがあること。' },
    { title: 'The Idempotency-Key HTTP Header Field（draft-ietf-httpapi-idempotency-key-header-08）', publisher: 'IETF HTTPAPI Working Group', url: 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/', accessed: '2026-11-13', version: '第8版、2026年10月22日（Internet-Draft。RFC ではない）', note: 'キーの定義と形式、UUID の推奨、指紋、有効期限、キーがなければ 400・内容が違えば 422・処理中なら 409、キーの形式の検証とクライアントの情報との組み合わせ、POST と PATCH は冪等でないこと。' },
    { title: 'Idempotent requests', publisher: 'Stripe API Reference', url: 'https://docs.stripe.com/api/idempotent_requests', accessed: '2026-11-13', version: 'API v1 の説明', note: '最初の応答のステータスコードと本文の保存と再返却（500 を含む）、UUID v4 などのキー、255 文字まで、パラメーターの照合、GET と DELETE にはキーの効果がないこと。' },
    { title: 'Advanced error handling（Idempotency）', publisher: 'Stripe Documentation', url: 'https://docs.stripe.com/error-low-level', accessed: '2026-11-13', version: 'API v1 の説明', note: 'キーを少なくとも 24 時間保持すること、409 のときは同じキーで待って再試行すること、500 は不確定として扱うこと、キーを作って保存しすべての試行で使うこと、Idempotent-Replayed ヘッダー、カートの ID からキーを作る方法、SDK の自動の再試行。' },
    { title: 'Receive Stripe events in your webhook endpoint', publisher: 'Stripe Documentation', url: 'https://docs.stripe.com/webhooks', accessed: '2026-11-13', note: '同じイベントを2回以上受け取ることがあり、処理したイベントの ID を記録して重複を防ぐこと、別々のイベントとして送られる重複、自動の再送は最大3日・CLI での手動の再送は30日まで、2xx 以外への再送、すぐに 2xx を返すこと、created で判断しないこと、署名の検証。' },
    { title: 'Design（Message Delivery Semantics）', publisher: 'Apache Kafka Documentation', url: 'https://kafka.apache.org/44/design/design/', accessed: '2026-11-13', version: 'Kafka 4.4', note: '最大1回・少なくとも1回・厳密に1回の定義、位置の記録と処理の順番による違い、主キーのある更新は冪等であること、位置を処理の結果と同じ場所に記録すること、ほかの送り先で厳密に1回にするには送り先の協力が必要なこと。' },
    { title: 'Amazon SQS at-least-once delivery', publisher: 'Amazon Simple Queue Service Developer Guide', url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html', accessed: '2026-11-13', note: '標準キューでは、まれに同じメッセージをもう一度受け取ることがあり、アプリケーションを冪等に作るよう求めていること。' },
    { title: 'Exactly-once processing in Amazon SQS', publisher: 'Amazon Simple Queue Service Developer Guide', url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues-exactly-once-processing.html', accessed: '2026-11-13', note: 'FIFO キューは、5分間の重複排除の期間内の送り直しをキューに入れないこと。' },
    { title: 'Implementing Stripe-like Idempotency Keys in Postgres', publisher: 'brandur.org', url: 'https://brandur.org/idempotency-keys', accessed: '2026-11-13', version: '2017年10月27日', note: '外部の状態を変える操作は取り消せないこと、キーの登録を単独のトランザクションにすること、ロックした日時と期限による引き継ぎ、パラメーターの不一致に 409、キーを一定の時間の後に消すこと、段階と再開の地点。' },
    { title: 'ActiveRecord::Relation（create_or_find_by、find_or_create_by、insert、insert_all）', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Relation.html', accessed: '2026-11-13', version: 'v8.1.4.1', note: 'create_or_find_by の動作と欠点、find_or_create_by は不可分ではないこと、insert_all はコールバックと検証を実行しないこと。' },
    { title: 'ActiveRecord::Persistence#previously_new_record?', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Persistence.html', accessed: '2026-11-13', version: 'v8.1.4.1', note: '直前の保存で新しく作られたオブジェクトなら true を返すこと。' },
    { title: 'Errors（idempotency_error）', publisher: 'Stripe API Reference', url: 'https://docs.stripe.com/api/errors', accessed: '2026-11-13', note: 'キーが、最初のリクエストとエンドポイントやパラメーターの違うリクエストに再利用されたときの idempotency_error。' },
    { title: 'activerecord/lib/active_record/relation.rb（create_or_find_by!）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb#L293-L308`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'create_or_find_by! が INSERT を transaction(requires_new: true) で囲み、RecordNotUnique のときはトランザクションの中ならロックを付けて既存の行を読むこと。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb（insert と create_or_find_by の MySQL での動き）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L176-L210`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'RETURNING は MariaDB 10.5 以降だけで使うこと、create_or_find_by の読み取りに MySQL 8.0.1 以降では FOR SHARE を使う理由（REPEATABLE READ での current read と共有ロック）。同じファイルの build_insert_sql（693 行目から）が重複を飛ばす insert を ON DUPLICATE KEY UPDATE にすること。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb（translate_exception）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L885-L886`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'MySQL のエラー 1062（ER_DUP_ENTRY、849 行目で定義）を ActiveRecord::RecordNotUnique に変えること。' },
    { title: 'activerecord/lib/active_record/insert_all.rb（find_unique_index_for）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/insert_all.rb#L149-L154`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '競合の対象を指定できない DB（MySQL）で unique_by を渡すと ArgumentError になること。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/transaction.rb（RestartParentTransaction）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/transaction.rb#L527-L555`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '外側のトランザクションが書き込んでいなければ（restartable?、240 行目）、入れ子のトランザクションに SAVEPOINT を使わず、取り消すときに外側をやり直すこと（387 行目からの RestartParentTransaction、MySQL では ROLLBACK AND CHAIN）。' },
    { title: 'The JSON Data Type（Normalization, Merging, and Autowrapping of JSON Values）', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/json.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'MySQL が JSON のオブジェクトのキーを並べ替えて保存すること。' },
    { title: 'FOREIGN KEY Constraints', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: '外部キーの列を先頭に並べた索引が必要で、なければ自動で作られること。' },
    { title: 'INSERT Statement（IGNORE）', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/insert.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'INSERT IGNORE が、一意索引の重複を含む無視できるエラーを警告に変えること。' },
    { title: 'Ruby on Rails 8.0 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/8_0_release_notes.html', accessed: '2026-11-20', version: 'Rails 8.0', note: 'params#expect が Rails 8.0 で追加されたこと。' },
    { title: 'Locks Set by Different SQL Statements in InnoDB', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'INSERT が重複のエラーになると、重複した索引のレコードに共有ロックを取ること、3つのセッションが同じ行を INSERT して最初が ROLLBACK するとデッドロックになりうること。' },
    { title: 'activesupport/lib/active_support/cache/redis_cache_store.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/cache/redis_cache_store.rb#L380-L392`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'write の unless_exist: true が Redis の SET の nx になること。' },
  ],
}

export default chapter
