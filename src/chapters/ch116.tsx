import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { Callout, ChapterLink, Code, Figure, Ref } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const figure = (n: number) => `${chapterNumber(116)}-${n}`
const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 判断の流れの図（各事例で共通の形） ---------- */
type Step = { q: string[]; yes: string[] }

/** 上から問いに答え、「はい」なら右の案、「いいえ」なら下の問いへ進む図。 */
function DecisionFigure({ id, label, start, steps, last }: { id: string; label: string; start?: string[]; steps: Step[]; last: string[] }) {
  const top = start ? 100 : 20
  const rowH = 92
  const h = top + steps.length * rowH + 76
  return (
    <Svg id={id} w={780} h={h} label={label}>
      {start && (
        <>
          <Box x={20} y={20} w={360} h={56} lines={start} fill="box5" />
          <Arrow x1={200} y1={76} x2={200} y2={top - 2} />
        </>
      )}
      {steps.map((s, i) => {
        const y = top + i * rowH
        return (
          <g key={i}>
            <Box x={20} y={y} w={360} h={60} lines={s.q} fill="box" />
            <Arrow x1={380} y1={y + 30} x2={438} y2={y + 30} accent />
            <T x={409} y={y + 18} fs={11} anchor="middle" tone="acc">はい</T>
            <Box x={440} y={y} w={320} h={60} lines={s.yes} fill="box4" />
            <Arrow x1={200} y1={y + 60} x2={200} y2={y + rowH - 2} />
            <T x={208} y={y + 76} fs={11} tone="muted">いいえ</T>
          </g>
        )
      })}
      <Box x={20} y={top + steps.length * rowH} w={360} h={56} lines={last} fill="bg" dashed />
    </Svg>
  )
}

/* ---------- 図：リファクタリングの前と後の呼び出し ---------- */
function RefactorFigure() {
  return (
    <Svg id={figure(2)} w={780} h={330} label="変更前は、Web と管理画面の Controller がそれぞれ在庫の減算と注文の保存を書き、Order の after_create_commit が確認メールを送る。管理画面の Controller はさらに自分でもメールを送るので、管理画面からの注文では 2 通届く。段階 2 の後は、両方の Controller が PlaceOrder を呼び、PlaceOrder がコミットの後に 1 回だけメールを送る">
      <T x={20} y={20} bold>変更前</T>
      <Box x={20} y={34} w={170} h={44} lines={['OrdersController', '在庫・保存を書く']} fs={12} fill="box" subTone="muted" />
      <Box x={20} y={100} w={170} h={44} lines={['Admin::Orders…', '同じ処理のコピー']} fs={12} fill="box" subTone="muted" />
      <Box x={240} y={66} w={150} h={44} lines={['Order', 'after_create_commit']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={190} y1={56} x2={238} y2={80} />
      <Arrow x1={190} y1={122} x2={238} y2={98} />
      <Box x={240} y={160} w={150} h={36} lines="確認メール" fs={12} fill="box4" />
      <Arrow x1={315} y1={110} x2={315} y2={158} />
      <Arrow d="M 105 144 L 105 178 L 238 178" accent />
      <T x={112} y={166} fs={10.5} tone="danger">2 通目</T>
      <T x={20} y={226} fs={12}>Web からの注文：1 通</T>
      <T x={20} y={246} fs={12}>管理画面からの注文：2 通（実測）</T>
      <T x={420} y={20} bold>段階 2 の後</T>
      <Box x={420} y={34} w={150} h={36} lines="OrdersController" fs={12} fill="box" />
      <Box x={420} y={100} w={150} h={36} lines="Admin::Orders…" fs={12} fill="box" />
      <Box x={610} y={60} w={150} h={50} lines={['PlaceOrder.call', '在庫・保存・メール']} fs={12} fill="box5" accent subTone="muted" />
      <Arrow x1={570} y1={52} x2={608} y2={78} />
      <Arrow x1={570} y1={118} x2={608} y2={94} />
      <Box x={610} y={140} w={150} h={36} lines="Order（検証だけ）" fs={12} fill="box" />
      <Box x={610} y={196} w={150} h={36} lines="確認メール 1 通" fs={12} fill="box4" />
      <Arrow x1={685} y1={110} x2={685} y2={138} />
      <Arrow d="M 760 85 L 772 85 L 772 214 L 762 214" />
      <T x={420} y={226} fs={12}>どちらの画面からも：1 通（実測）</T>
      <T x={20} y={290} fs={11.5} tone="muted">段階 1 では PlaceOrder を作るだけで、コールバックと管理画面の 2 通目は残した（振る舞いを変えない）。</T>
      <T x={20} y={310} fs={11.5} tone="muted">段階 2 で、テストの期待値を 2 通から 1 通に変える変更として、メールの送り方を直した。</T>
    </Svg>
  )
}

/* ---------- 図：CSV の作り方とメモリー ---------- */
function CsvMemoryFigure() {
  const s = 2.6 // 1MB あたりの幅
  return (
    <Svg id={figure(4)} w={780} h={220} label="注文 100,000 件の CSV を作るとき、CSV.generate で文字列を作ると最大 RSS が 185MB 増えた。find_each で 1,000 件ずつ読み、1 行ずつファイルに書くと 11〜12MB の増加だった。時間はどちらも 1.7〜2.1 秒">
      <T x={20} y={20} bold>注文 100,000 件の CSV（5.7 MB）を作るときの最大 RSS の増加</T>
      <T x={20} y={56} fs={12}>generate（文字列で返す）</T>
      <rect x={220} y={44} width={185 * s} height={24} rx={3} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
      <T x={228 + 185 * s} y={56} fs={11.5}>185 MB</T>
      <T x={20} y={100} fs={12}>write（find_each で書く）</T>
      <rect x={220} y={88} width={12 * s} height={24} rx={3} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={268} y={100} fs={11.5}>11〜12 MB</T>
      <T x={20} y={144} fs={12}>時間：generate 1,655・2,018 ms、write 1,852・2,139 ms（2 回ずつ）</T>
      <T x={20} y={166} fs={12}>割り当て：generate 2,100,244 個、write 2,313,485 個</T>
      <T x={20} y={198} fs={11} tone="muted">Ruby 4.0.9・Active Record 8.1.4.1・SQLite。最大 RSS は /proc/self/status の VmHWM の、書き出し前からの増加</T>
    </Svg>
  )
}

/* ---------- 図：割引の変更が及ぶ範囲 ---------- */
function DiscountImpactFigure() {
  const file = (x: number, y: number, name: string, hit: boolean) => (
    <Box x={x} y={y} w={160} h={32} lines={name} fs={12} mono fill={hit ? 'box5' : 'box'} accent={hit} />
  )
  return (
    <Svg id={figure(6)} w={780} h={300} label="左は割引を分けた設計、右は一つの Discount にまとめた設計。法人割引に上限を付ける変更では、分けた設計は BusinessDiscount だけを変えるが、まとめた設計は会員割引も通る Discount を変える。端数の規則を変える変更では、分けた設計も MoneyRounding の 1 か所を変えるだけで済む">
      <T x={20} y={20} bold>分けた設計（採用）</T>
      <T x={410} y={20} bold>一つにまとめた設計（不採用）</T>
      <T x={20} y={46} fs={12}>変更 1：法人割引に上限 5,000 円を付ける</T>
      {file(20, 60, 'MemberDiscount', false)}
      {file(190, 60, 'BusinessDiscount', true)}
      {file(20, 100, 'MoneyRounding', false)}
      <T x={410} y={46} fs={12}>変更 1：法人割引に上限 5,000 円を付ける</T>
      {file(410, 60, 'Discount', true)}
      <T x={580} y={76} fs={11.5}>kind: で分岐を足す。</T>
      <T x={580} y={96} fs={11.5}>会員の計算も同じメソッドを通る</T>
      <T x={20} y={170} fs={12}>変更 2：端数を切り捨てから四捨五入に変える</T>
      {file(20, 184, 'MemberDiscount', false)}
      {file(190, 184, 'BusinessDiscount', false)}
      {file(20, 224, 'MoneyRounding', true)}
      <T x={410} y={170} fs={12}>変更 2：端数を切り捨てから四捨五入に変える</T>
      {file(410, 184, 'Discount', true)}
      <rect x={20} y={274} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={40} y={280} fs={11}>変更するファイル</T>
      <T x={200} y={280} fs={11} tone="muted">どちらの設計も変更 2 は 1 か所。差が出るのは変更 1</T>
    </Svg>
  )
}

/* ---------- 図：アウトボックスと中継 ---------- */
function OutboxFigure() {
  return (
    <Svg id={figure(8)} w={780} h={300} label="注文の確定では、注文の状態の更新とアウトボックスへの行の追加を一つのトランザクションでコミットする。中継の処理は未送信の行を FOR UPDATE SKIP LOCKED で 100 件ずつ取り出し、配送システムへ送ってから送信済みにする。中継を 2 つ動かしても、同じ行を両方が取り出すことはなかった。配送システムはイベント ID で重複を除く">
      <rect x={20} y={30} width={300} height={130} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={48} fs={12} bold>1 つのトランザクション</T>
      <Box x={32} y={60} w={276} h={36} lines="UPDATE orders SET status = 'confirmed'" fs={11.5} mono fill="box" />
      <Box x={32} y={106} w={276} h={36} lines="INSERT INTO outbox_events (event_id …)" fs={11.5} mono fill="box4" />
      <Arrow x1={320} y1={124} x2={398} y2={124} />
      <Box x={400} y={100} w={160} h={48} lines={['outbox_events', 'published_at が NULL']} fs={12} fill="box4" subTone="muted" />
      <Box x={400} y={190} w={160} h={44} lines={['中継 1', '100 件ずつ']} fs={12} fill="box" subTone="muted" />
      <Box x={580} y={190} w={160} h={44} lines={['中継 2', '100 件ずつ']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={480} y1={148} x2={480} y2={188} />
      <Arrow x1={540} y1={148} x2={640} y2={188} />
      <T x={592} y={160} fs={10.5} tone="muted">SKIP LOCKED</T>
      <Box x={600} y={30} w={160} h={48} lines={['配送システム', 'イベント ID で重複を除く']} fs={12} fill="box5" accent subTone="muted" />
      <Arrow d="M 740 190 L 740 80" accent />
      <Arrow d="M 560 200 C 590 140, 650 120, 680 80" accent />
      <T x={20} y={262} fs={12}>実測：未送信 1,000 件を 2 つの中継で 500 件ずつ送り、重複は 0 件（MySQL 8.4.13）</T>
      <T x={20} y={284} fs={12}>送った後、送信済みにする前に中継が止まると、同じイベントがもう一度送られる</T>
    </Svg>
  )
}

/* ---------- 図（段階送り）2 つの中継と SKIP LOCKED ---------- */
const BLOCK_STATE = {
  u: { text: '未送信', fill: 'bg' },
  a: { text: '中継 1 がロック', fill: 'box5' },
  b: { text: '中継 2 がロック', fill: 'box4' },
  s: { text: '送信済み', fill: 'box' },
} as const

function RelaySnapshot({ i, blocks, r1, r2, act, got, dup }: { i: number; blocks: string; r1: string; r2: string; act: number; got: number; dup: number }) {
  const states = [...blocks].map((c) => BLOCK_STATE[c as keyof typeof BLOCK_STATE])
  const delivered = `配送システムが受け取ったイベント：${got.toLocaleString('en-US')} 件${dup ? `（うち同じイベントの 2 回目が ${dup} 件）` : ''}`
  return (
    <Svg
      id={`${figure(9)}-${i}`}
      w={780}
      h={216}
      label={`中継 1：${r1}。中継 2：${r2}。アウトボックスの 1,000 行を 100 行ずつ 10 の区画に分けると、${states.map((s, k) => `${k * 100 + 1}〜${(k + 1) * 100} が${s.text}`).join('、')}。${delivered}`}
    >
      <Box x={20} y={10} w={360} h={46} lines={['中継 1', r1]} fs={12} bold subTone="muted" accent={act === 1} fill="box" />
      <Box x={400} y={10} w={360} h={46} lines={['中継 2', r2]} fs={12} bold subTone="muted" accent={act === 2} fill="box" />
      {states.map((s, k) => (
        <Box key={k} x={20 + (k % 5) * 150} y={76 + Math.floor(k / 5) * 54} w={138} h={44} lines={[`${k * 100 + 1}〜${(k + 1) * 100}`, s.text]} fs={11.5} subTone="muted" fill={s.fill} dashed={s.fill === 'bg'} />
      ))}
      <T x={20} y={200} fs={12}>{delivered}</T>
    </Svg>
  )
}

const RELAY_STEPS: { label: string; blocks: string; r1: string; r2: string; act: number; got: number; dup: number; text: string }[] = [
  { label: '1. 未送信が 1,000 件', blocks: 'uuuuuuuuuu', r1: '待機', r2: '待機', act: 0, got: 0, dup: 0, text: '注文の確定で、注文の更新とアウトボックスへの行の追加を同じトランザクションでコミットした後の状態です。published_at が NULL の未送信の行が 1,000 件あります。' },
  { label: '2. 中継 1 が取り出す', blocks: 'auuuuuuuuu', r1: '1〜100 を FOR UPDATE SKIP LOCKED で読む', r2: '待機', act: 1, got: 0, dup: 0, text: '中継 1 がトランザクションを始め、未送信の行を id の順に 100 件、FOR UPDATE SKIP LOCKED で読みます。読んだ 1〜100 の行にはコミットするまで中継 1 のロックがかかります。' },
  { label: '3. 中継 2 は飛ばす', blocks: 'abuuuuuuuu', r1: '1〜100 を処理中', r2: '1〜100 を飛ばし、101〜200 を読む', act: 2, got: 0, dup: 0, text: '中継 2 が同じ SELECT を実行すると、ロック中の 1〜100 を待たずに飛ばし、101〜200 を受け取ってロックします。SKIP LOCKED を付けずに FOR UPDATE だけで同じ SELECT を実行すると、中継 1 のコミットを待ちます。' },
  { label: '4. 送って送信済みにする', blocks: 'sbuuuuuuuu', r1: '1〜100 を送り、送信済みにしてコミット', r2: '101〜200 を処理中', act: 1, got: 100, dup: 0, text: '中継 1 は 1〜100 を配送システムに送り、published_at を埋めてコミットします。コミットでロックが外れ、1〜100 は送信済みになります。中継 2 は 101〜200 のロックを持ったまま処理を続けています。' },
  { label: '5. 未送信がなくなるまで', blocks: 'ssssssssss', r1: '合計 500 件を送った', r2: '合計 500 件を送った', act: 0, got: 1000, dup: 0, text: 'それぞれの中継はコミットするたびに次の未送信の 100 件を取り出します。上の実行結果では、2 つの中継が 500 件ずつ送り、同じイベントを両方が送ることはありませんでした。' },
  { label: '6. 中継 2 が止まった場合（4 の続き）', blocks: 'suuuuuuuuu', r1: '待機', r2: '101〜200 を送った後、コミット前に停止', act: 2, got: 200, dup: 0, text: '4 の後、中継 2 が 101〜200 を配送システムに送り、送信済みにする前にプロセスが止まった場合です。コミットしていないトランザクションは取り消されるので、101〜200 は未送信のままで、ロックも外れます。' },
  { label: '7. もう一度送られる', blocks: 'sauuuuuuuu', r1: '101〜200 を読み、もう一度送る', r2: '停止', act: 1, got: 300, dup: 100, text: '中継 1 が次に取り出すのは 101〜200 です。同じ 100 件のイベントが配送システムにもう一度届くので、配送システムはイベント ID で 2 回目を除きます。' },
]

const relaySteps = RELAY_STEPS.map((s, i) => ({
  label: s.label,
  detail: (
    <>
      <RelaySnapshot i={i + 1} blocks={s.blocks} r1={s.r1} r2={s.r2} act={s.act} got={s.got} dup={s.dup} />
      <p>{s.text}</p>
    </>
  ),
}))

const outboxExample = `
require "active_record"
require "sqlite3"

ActiveRecord::Base.establish_connection(adapter: "sqlite3", database: ":memory:")
ActiveRecord::Schema.verbose = false
ActiveRecord::Schema.define do
  create_table(:orders) { |t| t.string :status, null: false }
  create_table(:outbox_events) do |t|
    t.string :event_id, null: false, index: { unique: true }
    t.string :event_type, null: false
    t.references :order, null: false, foreign_key: true
  end
end

class Order < ActiveRecord::Base; end
class OutboxEvent < ActiveRecord::Base; end

def confirm(order, event_id)
  Order.transaction do
    order.update!(status: "confirmed")
    OutboxEvent.create!(event_id: event_id, event_type: "order.confirmed", order_id: order.id)
  end
end

first = Order.create!(status: "pending")
second = Order.create!(status: "pending")
confirm(first, "event-1")
raise "first order was not committed" unless first.reload.status == "confirmed"
raise "the event was not committed" unless OutboxEvent.find_by!(event_id: "event-1").order_id == first.id

begin
  confirm(second, "event-1")
  raise "duplicate event was accepted"
rescue ActiveRecord::RecordNotUnique
  raise "order change escaped rollback" unless second.reload.status == "pending"
  raise "unexpected event count" unless OutboxEvent.count == 1
end
puts "1 confirmed order, 1 pending order, 1 outbox event"
`

const commonCode = `
# app_common.rb（抜粋）：3 種類のコードで共通の部分
class ShopApp < Rails::Application
  config.load_defaults 8.1
  config.action_mailer.delivery_method = :test     # 送ったメールを deliveries に貯める
  config.action_controller.allow_forgery_protection = false
  # （ログやホストの設定は省略）
end
ENV["DATABASE_URL"] = "sqlite3::memory:"
ShopApp.initialize!

class OrderMailer < ActionMailer::Base
  default from: "shop@example.com"
  def confirmation(order) = mail(to: order.email, subject: "注文 #{order.id} を受け付けました", body: "ご注文ありがとうございます")
end
class OutOfStock < StandardError; end
`

const beforeCode = `
# before.rb（抜粋）：変更前
class Order < ActiveRecord::Base
  belongs_to :product
  validates :quantity, numericality: { greater_than: 0 }
  validates :email, presence: true
  after_create_commit { OrderMailer.confirmation(self).deliver_now }   # 保存の後に確認メール
end

class OrdersController < ActionController::Base
  def create
    quantity = params[:quantity].to_i
    order = Order.transaction do
      changed = Product.where(id: params[:product_id]).where("stock >= ?", quantity)
                       .update_all(["stock = stock - ?", quantity])
      raise OutOfStock if changed == 0
      Order.create!(product_id: params[:product_id], quantity: quantity, email: params[:email], status: "confirmed")
    end
    render plain: "注文 #{order.id}", status: :created
  rescue OutOfStock
    render plain: "在庫が足りません", status: :unprocessable_entity
  rescue ActiveRecord::RecordInvalid => e
    render plain: e.record.errors.full_messages.join(", "), status: :unprocessable_entity
  end
end

module Admin
  class OrdersController < ActionController::Base
    # Web の create をコピーして、管理者が電話の注文を代わりに入力する画面に使っている
    def create
      # （在庫の減算と保存は Web と同じ 7 行）
      OrderMailer.confirmation(order).deliver_now   # 「メールが届かない」という問い合わせの後に足した行
      redirect_to "/admin/orders/#{order.id}"
    end
  end
end
`

const specCode = `
# orders_spec.rb：今の振る舞いを固定する spec。VARIANT で読み込むコードを選ぶ
require_relative ENV.fetch("VARIANT", "before")
require "rack/test"

RSpec.describe "注文の確定（#{ENV.fetch('VARIANT', 'before')}）" do
  include Rack::Test::Methods
  def app = Rails.application
  let(:mails) { ActionMailer::Base.deliveries }
  let!(:product) { Product.create!(name: "電気ケトル", stock: 3) }
  before { mails.clear }
  after { Order.delete_all; Product.delete_all }

  it "Web：確定すると在庫が減り、注文者に確認メールが 1 通届く" do
    post "/orders", product_id: product.id, quantity: 2, email: "a@example.com"
    expect(last_response.status).to eq 201
    expect(product.reload.stock).to eq 1
    expect(mails.map(&:to)).to eq [["a@example.com"]]
  end

  it "Web：在庫が足りなければ、注文もメールもない" do
    post "/orders", product_id: product.id, quantity: 5, email: "a@example.com"
    expect(last_response.status).to eq 422
    expect(Order.count).to eq 0
    expect(mails).to be_empty
  end

  it "Web：メールアドレスが空なら、在庫も元に戻る" do
    post "/orders", product_id: product.id, quantity: 1, email: ""
    expect(last_response.status).to eq 422
    expect(product.reload.stock).to eq 3
    expect(mails).to be_empty
  end

  it "管理画面：確定すると確認メールが #{ENV.fetch('ADMIN_MAILS', '2')} 通届く" do
    post "/admin/orders", product_id: product.id, quantity: 1, email: "b@example.com"
    expect(last_response.status).to eq 302
    expect(mails.size).to eq Integer(ENV.fetch("ADMIN_MAILS", "2"))
  end
end
`

const step1Code = `
# step1.rb（抜粋）：段階 1。確定の手順を 1 か所に移す。メールの通数を含め、振る舞いは変えない
class PlaceOrder
  Result = Data.define(:order, :error)

  def self.call(product_id:, quantity:, email:)
    order = Order.transaction do
      changed = Product.where(id: product_id).where("stock >= ?", quantity)
                       .update_all(["stock = stock - ?", quantity])
      raise OutOfStock if changed == 0
      Order.create!(product_id: product_id, quantity: quantity, email: email, status: "confirmed")
    end
    Result.new(order: order, error: nil)
  rescue OutOfStock
    Result.new(order: nil, error: "在庫が足りません")
  rescue ActiveRecord::RecordInvalid => e
    Result.new(order: nil, error: e.record.errors.full_messages.join(", "))
  end
end

class OrdersController < ActionController::Base
  def create
    result = PlaceOrder.call(product_id: params[:product_id], quantity: params[:quantity].to_i, email: params[:email])
    return render(plain: result.error, status: :unprocessable_entity) if result.error
    render plain: "注文 #{result.order.id}", status: :created
  end
end

module Admin
  class OrdersController < ActionController::Base
    def create
      result = PlaceOrder.call(product_id: params[:product_id], quantity: params[:quantity].to_i, email: params[:email])
      return render(plain: result.error, status: :unprocessable_entity) if result.error
      OrderMailer.confirmation(result.order).deliver_now   # 段階 1 では残す（2 通目）
      redirect_to "/admin/orders/#{result.order.id}"
    end
  end
end
`

const step2Diff = `
$ diff step1.rb step2.rb
<   after_create_commit { OrderMailer.confirmation(self).deliver_now }   # Order から外す
>     OrderMailer.confirmation(order).deliver_now   # PlaceOrder でコミットの後に 1 回だけ
<       OrderMailer.confirmation(result.order).deliver_now   # 管理画面の 2 通目を消す
`

const refactorOut = `
$ VARIANT=before ADMIN_MAILS=2 rspec orders_spec.rb --format documentation
注文の確定（before）
  Web：確定すると在庫が減り、注文者に確認メールが 1 通届く
  Web：在庫が足りなければ、注文もメールもない
  Web：メールアドレスが空なら、在庫も元に戻る
  管理画面：確定すると確認メールが 2 通届く
4 examples, 0 failures

$ VARIANT=step1 ADMIN_MAILS=2 rspec orders_spec.rb --format documentation
（4 件とも同じ表示）
4 examples, 0 failures

$ VARIANT=step2 ADMIN_MAILS=2 rspec orders_spec.rb --format documentation
  管理画面：確定すると確認メールが 2 通届く (FAILED - 1)
       expected: 2
            got: 1
4 examples, 1 failure

$ VARIANT=step2 ADMIN_MAILS=1 rspec orders_spec.rb --format documentation
  管理画面：確定すると確認メールが 1 通届く
4 examples, 0 failures
`

const csvCode = `
# order_csv.rb：管理者がダウンロードする注文 CSV。列の定義はこのクラスだけにある
require "csv"

class OrderCsv
  HEADER = %w[注文番号 状態 金額 メールアドレス 作成日時].freeze

  def self.row(order) = [order.id, order.status, order.total_cents, order.email, order.created_at.iso8601]

  # 件数が少ない画面用：文字列で返す
  def self.generate(orders)
    CSV.generate do |csv|
      csv << HEADER
      orders.each { |order| csv << row(order) }
    end
  end

  # 件数が多い書き出し用：1,000 件ずつ読み、1 行ずつファイルに書く
  def self.write(relation, path)
    CSV.open(path, "w") do |csv|
      csv << HEADER
      relation.find_each(batch_size: 1_000) { |order| csv << row(order) }
    end
  end
end
`

const csvSpec = `
# order_csv_spec.rb：DB を使わずに、行の形だけを確かめる
require_relative "order_csv"

RSpec.describe OrderCsv do
  OrderRow = Data.define(:id, :status, :total_cents, :email, :created_at)

  it "見出しと注文 1 件の行を出す" do
    order = OrderRow.new(id: 7, status: "shipped", total_cents: 4_980, email: "a@example.com", created_at: Time.utc(2026, 11, 1))
    expect(OrderCsv.generate([order]).lines).to eq [
      "注文番号,状態,金額,メールアドレス,作成日時\\n",
      "7,shipped,4980,a@example.com,2026-11-01T00:00:00Z\\n",
    ]
  end
end
`

const csvBench = `
# csv_bench.rb（抜粋）：別々のプロセスで 1 つずつ実行し、最大 RSS の増加を比べる
def hwm_mb = File.read("/proc/self/status")[/VmHWM:\\s+(\\d+)/, 1].to_i / 1024
case ARGV[0]
when "generate" then size = OrderCsv.generate(Order.all).bytesize
when "write"    then OrderCsv.write(Order.all, "/tmp/orders.csv"); size = File.size("/tmp/orders.csv")
end
`

const csvOut = `
$ ruby csv_bench.rb generate; ruby csv_bench.rb write   # 2 回ずつ実行
generate 100,000 件   1655 ms  CSV 5.7 MB  割り当て 2100244 個  最大 RSS の増加 185 MB
write    100,000 件   1852 ms  CSV 5.7 MB  割り当て 2313485 個  最大 RSS の増加  12 MB
generate 100,000 件   2018 ms  CSV 5.7 MB  割り当て 2100244 個  最大 RSS の増加 185 MB
write    100,000 件   2139 ms  CSV 5.7 MB  割り当て 2313485 個  最大 RSS の増加  11 MB

$ rspec order_csv_spec.rb --format documentation
OrderCsv
  見出しと注文 1 件の行を出す
1 example, 0 failures
`

const overAbstraction = `
# 採用しなかった形：出力形式を登録して選ぶ仕組み（CSV が 1 種類しかない段階で作った場合）
class Exporter
  REGISTRY = {}
  def self.register(format, klass) = REGISTRY[format] = klass
  def self.for(format) = REGISTRY.fetch(format).new
end

class ColumnDsl
  def self.column(name, &block) = (@columns ||= []) << [name, block]
  def self.columns = @columns
end

class OrderCsvExporter < ColumnDsl
  column("注文番号") { |o| o.id }
  column("状態")     { |o| o.status }
  # ……列ごとにブロックを書く
end
Exporter.register(:order_csv, OrderCsvExporter)
`

const discountCode = `
# discount.rb：端数の規則は経理が決め、会員と法人で同じ。ここだけを共有する
module MoneyRounding
  def self.apply(amount) = amount.floor   # 1 円未満を切り捨てる
end

# 会員割引はマーケティングの担当が決める
class MemberDiscount
  RATE = 5r / 100   # 有理数で持ち、Float の誤差を入れない
  def self.call(subtotal) = MoneyRounding.apply(subtotal * RATE)
end

# 法人割引は営業の担当が決める。改定で上限が付いた
class BusinessDiscount
  RATE = 5r / 100   # 有理数で持ち、Float の誤差を入れない
  CAP = 5_000
  def self.call(subtotal) = [MoneyRounding.apply(subtotal * RATE), CAP].min
end
`

const discountSpec = `
# discount_spec.rb
require_relative "discount"

RSpec.describe "割引" do
  it("会員：小計の 5%（1 円未満は切り捨て）") { expect(MemberDiscount.call(1_999)).to eq 99 }
  it("会員：上限はない")                        { expect(MemberDiscount.call(199_999)).to eq 9_999 }
  it("法人：小計の 5%（1 円未満は切り捨て）") { expect(BusinessDiscount.call(1_999)).to eq 99 }
  it("法人：1 注文 5,000 円まで")               { expect(BusinessDiscount.call(199_999)).to eq 5_000 }
end
`

const discountOut = `
$ rspec discount_spec.rb --format documentation
割引
  会員：小計の 5%（1 円未満は切り捨て）
  会員：上限はない
  法人：小計の 5%（1 円未満は切り捨て）
  法人：1 注文 5,000 円まで
4 examples, 0 failures
`

const mergedDiscount = `
# 採用しなかった形：計算式が同じなので一つにまとめた場合
class Discount
  RATE = 5r / 100   # 有理数で持ち、Float の誤差を入れない
  def self.call(subtotal, kind:)
    amount = (subtotal * RATE).floor
    kind == :business ? [amount, 5_000].min : amount   # 法人の改定で分岐が入った
  end
end
`

const outboxCostOut = `
$ ruby outbox_cost.rb
== 注文 1,000 件を 1 件ずつ確定する
注文の更新だけ               14307 ms（1 件 14.31 ms）
注文の更新 + アウトボックス  15039 ms（1 件 15.04 ms）

== 中継を 2 つ同時に動かし、未送信の 1,000 件を 100 件ずつ取り出して「送る」
送った件数 1000、重複 0 件、中継ごと {0 => 500, 1 => 500}
未送信 0 件、アウトボックスの行 1000 件
`

const skipLockedOut = `
$ ruby skip.rb
1) 中継1 SKIP LOCKED: 1〜100（100 件）
2) 中継2 SKIP LOCKED: 101〜200（100 件）
3) SKIP LOCKED なしの FOR UPDATE: 1.0 秒待って Lock wait timeout exceeded; try restarting transaction
4) 中継1 コミット後の送信済み: 100 件
5) 中継2 の停止後、次の取り出し: 101〜200（100 件）
`

const relayCode = `
# outbox_cost.rb（抜粋）：中継の処理。2 つのスレッドで同時に動かした
loop do
  batch = OutboxEvent.transaction do
    rows = OutboxEvent.where(published_at: nil).order(:id).limit(100).lock("FOR UPDATE SKIP LOCKED").to_a
    rows.each { |e| sent << [r, e.event_id] }      # ここで外部へ送る（実験では記録だけ）
    OutboxEvent.where(id: rows.map(&:id)).update_all(published_at: Time.current) unless rows.empty?
    rows
  end
  break if batch.empty?
end
`

const reconcileCode = `
# reconcile.rb：領収書メールはアウトボックスを使わず、取りこぼしを定期的に探す
# 確定から 10 分たっても領収書を送っていない注文を探して、ジョブを投入し直す
def reconcile_receipts(now: Time.current)
  Order.where(status: "confirmed", receipt_sent_at: nil)
       .where(confirmed_at: ..(now - 10.minutes))
       .find_each { |order| puts "  ReceiptJob.perform_later(#{order.id}) を投入し直す" }
end

lost = Order.create!(status: "confirmed", confirmed_at: 15.minutes.ago)    # コミット後、投入の前にプロセスが止まった注文
recent = Order.create!(status: "confirmed", confirmed_at: 1.minute.ago)    # まだジョブが動いている途中の注文
reconcile_receipts
`

const reconcileOut = `
$ ruby reconcile.rb
== 定期の確認（取りこぼした注文 2001、確定直後の注文 2002）
  ReceiptJob.perform_later(2001) を投入し直す
`

const msdpRows: [string, string, string][] = [
  ['Dependency Injection', '一部採用', '決済 API のクライアントを PlaceOrder の引数で受け取る。現在時刻は travel_to で足りるので注入しない'],
  ['Strategy / Policy', '見送り', '送料の計算は 2 種類で、case 文で読める。3 種類目が決まったら再検討'],
  ['Adapter', '見送り', '決済サービスは 1 社だけ。2 社目の契約が決まったら再検討'],
  ['Middleware Chain', '見送り', '共通の前処理は before_action で足りる'],
  ['Use Case / Application Service', '採用', 'PlaceOrder。呼び出し元が Web と管理画面の 2 つあり、手順を 1 か所にする'],
  ['Functional Core, Imperative Shell', '一部採用', '割引の計算を DB に触れないクラスにする（DRY の事例）'],
  ['Value Object', '見送り', '通貨は円だけで、金額は整数で足りる。端数の規則は MoneyRounding に置く'],
  ['Explicit State Machine', '見送り', '注文の状態は 4 つで、遷移は enum と条件付き UPDATE で確かめられる'],
  ['Unit of Work', '見送り', 'Active Record のトランザクションと autosave で足りる'],
  ['Optimistic Locking', '採用', '管理画面で商品を編集するときに lock_version を使う（在庫は条件付き UPDATE）'],
  ['Materialized View', '見送り', '売れ筋ランキングはキャッシュで足りる（10 分の遅れを許せる）'],
  ['Domain Events', '見送り', '確定の後の処理は領収書と配送連携の 2 つだけ'],
  ['Idempotency Key', '採用', '注文 API の二重送信と、決済 API への再送'],
  ['Transactional Outbox', '配送連携だけ採用', '取りこぼすと出荷が止まる配送連携に使う。領収書メールは定期の確認で補う'],
  ['Retry with Backoff', '既存の機能を使う', 'Sidekiq の再試行を使い、独自には実装しない'],
]

const chapter: Chapter = {
  number: 116,
  part: 11,
  title: "Rails の設計をどこまで変えるか判断する",
  summary: "Controller と Model のリファクタリング、クラスの分け方、DRY を適用する範囲、MSDP の各パターンの採否を、テストと実測の結果から判断する四つの事例です。",
  goals: [
    "振る舞いを固定するテストを先に書き、振る舞いを変えない変更と変える変更を分けて進める",
    "変更の理由と扱うデータの量から、クラスを分けるかと抽象化の程度を決める",
    "同じ形のコードと同じ知識を区別し、DRY を適用する範囲を決める",
    "問題と費用から MSDP のパターンを採用するか見送るかを決める",
  ],
  prerequisites: [33, 39, 93, 108, 110],
  sections: [
    {
      id: "overview",
      title: "この章で扱う四つの事例と読み方",
      body: (
        <>
          <p>この章では注文処理のコードを改修するときに、設計をどこまで変えるかを判断する四つの事例を扱います。</p>
          <ul>
            <li>複雑化した Model・Controller をリファクタリングする：管理画面から注文すると確認メールが 2 通届く</li>
            <li>適切なクラス分割や抽象化を判断する：注文の Model に CSV の出力が増え、全件の書き出しでメモリーが足りない</li>
            <li>プログラミング原則の適用範囲を判断する：同じ形の会員割引と法人割引を一つにまとめるか</li>
            <li>MSDP の各パターンの採用・不採用を判断する：15 のパターンのうち、どれをこのアプリケーションに入れるか</li>
          </ul>
          <p>各事例は課題、原因や背景、解決方法の選択肢、判断基準、具体的な実装例、メリット・デメリット、トレードオフの7項目の順で書き、判断の順序を示す図を置きます。クエリとデータの整合性の事例を同じ7項目で書いた章として <ChapterLink n={114} /> もありますが、この章はその章を読まなくても読めます。</p>
          <p>設計の手法と原則の説明は既存の章に任せます。Rails で責務を分ける考え方は <ChapterLink n={30} />、Service Object や Form Object などのクラスの作り方は <ChapterLink n={33} />、注文処理を段階的に分ける例は <ChapterLink n={34} />、原則の一覧と目的は <ChapterLink n={56} />、MSDP のパターンと採用の原則は <ChapterLink n={39} /> で扱っています。この章はそれらを使って「このコードで、今、どこまで変えるか」を決める手順に絞ります。</p>
          <p>設計の判断には、事実と意見が混ざります。この章ではテストや計測で確かめた結果を事実として示し、それをもとにした採否の判断は、この注文アプリケーションの条件での判断例として示します。条件が違えば、同じ手順で別の結論になることがあります。</p>
        </>
      ),
    },
    {
      id: "sample",
      title: "事例に使った注文アプリケーションと実行環境",
      body: (
        <>
          <p>リファクタリングの事例では Ruby 4.0.9 と Rails 8.1.4.1 で、1 つのファイルに書いた小さな Rails アプリケーションを使いました。Action Controller、Active Record、Action Mailer を読み込み、DB は SQLite のメモリー上の DB です。メールは <code>delivery_method = :test</code> で実際には送らず、<code>ActionMailer::Base.deliveries</code> に貯めて数えます<Ref n={5} />。テストは RSpec 3.13 と rack-test 2.3 で、HTTP の要求をアプリケーションに直接送ります。</p>
          <Code lang="ruby" title="3 種類のコードで共通の部分" code={commonCode} />
          <p>アプリケーションは商品の在庫を減らして注文を確定し、注文者に確認メールを送ります。注文を受け付ける画面は利用者の Web 画面（<code>POST /orders</code>）と、管理者が電話の注文を代わりに入力する管理画面（<code>POST /admin/orders</code>）の 2 つです。在庫の減算は、在庫が注文数以上あるときだけ減らす条件付き UPDATE です（この書き方を選んだ過程は <ChapterLink n={114} section="transaction" /> にあります）。</p>
          <p>クラスの分け方の事例では SQLite のファイルに注文 100,000 件を入れて CSV を作りました。パターンの事例ではアウトボックスの費用と中継の動きを MySQL 8.4.13 で確かめました。どの事例も Docker の ruby:4.0 のコンテナで実行しています。</p>
        </>
      ),
    },
    {
      id: "refactor",
      title: "注文の Controller と Model を小さく直す",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>「管理画面から電話の注文を入力すると、お客さまに確認メールが 2 通届く」という問い合わせが来ました。注文の Controller には HTTP の入力の読み取り、在庫の減算、注文の保存、エラーの応答が 1 つのアクションに書かれています。管理画面の Controller はこのアクションをコピーして作られました。来月には取引先向けの API でも注文を受ける予定で、このままでは 3 つ目のコピーができます。</p>
          <h3>2. 原因や背景</h3>
          <p>確認メールは Order の <code>after_create_commit</code> コールバックが送っています。管理画面の Controller には以前「メールが届かない」という問い合わせを受けたときに足した <code>OrderMailer.confirmation(order).deliver_now</code> の行が残っていました。当時メールが届かなかった原因は別にあったと考えられますが、記録が残っていません。その結果、管理画面からの注文ではコールバックと Controller の両方がメールを送っています。</p>
          <p>メールを送る場所が Model のコールバックと Controller の 2 か所に分かれているので、Controller だけを読んでもメールの通数が分かりません。コールバックで送る形は Order を保存するすべての経路（コンソール、データの取り込み、テストのデータ作成）でメールを送ることにもなります<Ref n={4} />（<ChapterLink n={30} section="callback-design" />）。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：管理画面の Controller から 2 通目の行だけを消す。</li>
            <li>案 2：Controller の共通部分を concern や private メソッドにまとめる。</li>
            <li>案 3：確定の手順（在庫の減算、保存、メール）を <code>PlaceOrder</code> という 1 つのクラスに移し、両方の Controller から呼ぶ（Use Case。<ChapterLink n={44} section="idea" />）。</li>
            <li>案 4：確定の手順を <code>Order.place!</code> のような Model のクラスメソッドに移す。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>同じ手順を呼ぶ Controller の数を数えます。呼び出し元が 1 つなら、Controller の中で手順を読めるほうが分かりやすいので、案 1 で足ります。この事例では呼び出し元が 2 つあり、3 つ目が決まっています。呼び出し元ごとに違うのは入力の読み方と応答の形だけで、在庫の減算、保存、メールの規則は同じです。この条件では手順を 1 か所に置く案 3 か案 4 が候補です。</p>
          <p>案 3 と案 4 の違いはメールの送信という外部への副作用を Model に置くかどうかです。Model には、どの経路から保存しても守る規則（検証や制約）を置き、メールのように「注文の確定という操作」で行うことはその操作のクラスに置く、という分け方を選びました（<ChapterLink n={33} section="service-contract" />）。</p>
          <p>進め方では振る舞いを変えない変更と、振る舞いを変える変更を別にします（<ChapterLink n={110} section="behavior" />）。2 通目のメールは不具合ですが、手順の移動と同時に直すと、テストの結果が変わったときにどちらの変更が原因かが分かりません。先に今の振る舞いをテストで固定し、手順を移し、最後に 2 通目をなくします。</p>
          <Figure n={figure(1)} title="Controller と Model のリファクタリングを判断する流れ" caption="この事例の流れです。図は判断の順序を単純化したものです。">
            <DecisionFigure
              id={figure(1)}
              label="Controller と Model のリファクタリングを判断する流れ。先に今の振る舞いをテストで固定する。同じ手順を呼ぶ Controller が 1 つなら Controller の中で直す。呼び出し元が複数で規則が同じなら手順を 1 つのクラスに移す。直したい不具合があるなら手順の移動とは別の変更で直す。どれでもなければ変更を見送る"
              start={['今の振る舞いを', 'テストで固定する']}
              steps={[
                { q: ['同じ手順を呼ぶ Controller が', '1 つだけか'], yes: ['Controller の中で', 'メソッドに名前を付けて直す'] },
                { q: ['呼び出し元が複数あり、', '確定の規則が同じか'], yes: ['手順を 1 つのクラスに移す', '（振る舞いは変えない）'] },
                { q: ['移した後に直したい', '不具合が残っているか'], yes: ['別の変更として直し、', 'テストの期待値を変える'] },
              ]}
              last={['変更を見送り、', '次に手を入れるときに見直す']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>変更前のコードは次のとおりです。管理画面の Controller の在庫の減算と保存は、Web の Controller と同じ 7 行です。</p>
          <Code lang="ruby" title="変更前の Model と Controller" code={beforeCode} />
          <p>最初に、今の振る舞いを固定する spec を書きました。管理画面のメールが 2 通であることも、今の振る舞いとして期待値に入れています。期待値は環境変数で渡し、同じ spec を変更前・段階 1・段階 2 の 3 種類のコードに当てます。</p>
          <Code lang="ruby" title="振る舞いを固定する spec" code={specCode} />
          <p>段階 1 では確定の手順を <code>PlaceOrder</code> に移しました。戻り値は、成功なら注文、失敗ならエラーの文を持つ <code>Data</code> のオブジェクトです<Ref n={6} />。コールバックと管理画面の 2 通目は残しています。</p>
          <Code lang="ruby" title="段階 1：手順を PlaceOrder に移す" code={step1Code} />
          <p>段階 2 ではメールを送る場所を <code>PlaceOrder</code> の 1 か所にしました。変更は 3 行です。</p>
          <Code lang="text" title="段階 2：メールの送り方を直す" code={step2Diff} />
          <Code lang="text" title="実行結果（RSpec 3.13.7、rack-test 2.3.0）" code={refactorOut} />
          <p>変更前と段階 1 は、同じ spec の 4 件がすべて通りました。段階 1 は振る舞いを変えていないことを、この結果で確かめられます。段階 2 では、管理画面のメールが 2 通の期待値で失敗し（got: 1）、期待値を 1 通にすると 4 件とも通りました。この失敗は意図して変えた振る舞いだけが変わったことを示しています。</p>
          <Figure n={figure(2)} title="リファクタリングの前と後の呼び出し" caption="上の 3 種類のコードをもとにした図です。">
            <RefactorFigure />
          </Figure>
          <p>段階 2 で <code>after_create_commit</code> を外したので、Order を保存するほかの経路（コンソールやデータの取り込み）でも確認メールは送られなくなります。この影響を確かめるために、Order を作っているコードを <code>grep -rn "Order.create" app lib</code> で探し、メールを送る必要のある経路がほかにないことを確かめてから段階 2 を出します。</p>
          <h3>6. メリット・デメリット</h3>
          <p>メリットは注文を確定する手順とメールの通数を、<code>PlaceOrder</code> だけを読めば確かめられることです。取引先向けの API も <code>PlaceOrder</code> を呼べば、在庫とメールの規則をコピーせずに済みます。spec で振る舞いを固定したので、段階ごとに何が変わったかを結果で示せます。</p>
          <p>デメリットは Controller を読んだだけでは確定の詳細が分からず、<code>PlaceOrder</code> を開く必要があることです。また、Model のコールバックで送っていたときと違い、<code>PlaceOrder</code> を通らない保存ではメールが送られません。新しい経路を作る人が <code>PlaceOrder</code> を使う必要があることを、チームで共有する必要があります。</p>
          <h3>7. トレードオフ</h3>
          <p>この事例では、クラスが 1 つ増えることと、Controller だけで処理を読めなくなることを受け入れて、確定の規則を 1 か所に集めました。呼び出し元が 1 つだけのアプリケーションなら、案 1 で 2 通目の行を消し、Controller に処理を残すほうが読む場所は少なくなります。</p>
          <p>段階を分けたので、変更は 3 回のレビューになります。1 回の変更で済ませるよりも時間はかかりますが、本番で問題が起きたときに、どの段階を戻せばよいかが分かります。</p>
          <Ref n={1} />
        </>
      ),
    },
    {
      id: "classes",
      title: "CSV の出力を分けるクラスと抽象化の程度を決める",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>注文の Model に、管理者がダウンロードする CSV の列順、見出し、行の作り方のメソッドが増えました。経理から月に 1 回ほど列の変更を頼まれ、そのたびに注文の Model とその spec を変更しています。さらに「全期間の注文 100,000 件を一度に書き出したい」という依頼があり、試すとメモリーの使用量が大きく増えました。</p>
          <h3>2. 原因や背景</h3>
          <p>注文を保存するときの規則と CSV の列の仕様は、変更を頼む人も変わる時期も違います。前者は注文業務の担当者、後者は経理が決めます。異なる理由で変わるものが同じクラスにあるので、列の変更のたびに注文の Model のテストを広く見直すことになります（単一責任の原則。<ChapterLink n={63} section="meaning" />）。</p>
          <p>メモリーの増加は CSV の全体を 1 つの文字列として作る書き方（<code>CSV.generate</code>）が原因です<Ref n={7} />。100,000 件の Active Record のオブジェクトを読み込み、5.7 MB の文字列を組み立てるまで、すべてをメモリーに置いています。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：CSV のメソッドを Model に残す。</li>
            <li>案 2：CSV を作る処理を Controller の private メソッドにする。</li>
            <li>案 3：<code>OrderCsv</code> という Ruby のクラスを作り、列の定義と、文字列で返す方法・ファイルに書く方法を置く。</li>
            <li>案 4：出力形式を登録して選ぶ仕組みと、列を宣言する DSL を作り、CSV を含む複数の形式に対応できるようにする。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>最初の基準は、変更の理由が注文の Model と違うかです。CSV の列は経理の依頼で変わり、注文を保存するときの規則は変わらないので、分ける理由があります。分けた後に、列の変更が <code>OrderCsv</code> とその spec だけで済むかを確かめます。</p>
          <p>次の基準は今ある出力形式の数です。今は CSV が 1 種類だけで、ほかの形式の予定はありません。案 4 のような登録の仕組みや DSL は、形式が 2 つ以上になって初めて効果があります。予定がない段階で作ると、列を 1 つ足すにも仕組みを理解する必要が出ます（YAGNI。<ChapterLink n={58} section="meaning" />）。</p>
          <p>分けたクラスを置く場所も決めます。Rails は <code>app</code> の下のディレクトリを自動で読み込むので、<code>app/exports/order_csv.rb</code> に置けば <code>OrderCsv</code> として使えます（<ChapterLink n={8} section="naming" />）。Model のディレクトリに置くと、Active Record のモデルと区別しにくくなるので、出力のクラスをまとめるディレクトリを作りました。</p>
          <p>最後の基準は扱うデータの量です。画面から数百件をダウンロードするなら文字列で返す書き方で十分ですが、全件の書き出しではメモリーに全件を置かない書き方が必要です。クラスを分けるかどうかとは別に、データの量に合う書き方を選びます。</p>
          <Figure n={figure(3)} title="クラスを分けるかと抽象化の程度を決める判断の流れ" caption="この事例の流れです。図は判断の順序を単純化したものです。">
            <DecisionFigure
              id={figure(3)}
              label="クラスを分けるかと抽象化の程度を決める判断の流れ。先に、誰の依頼でいつ変わるかを書き出す。変更の理由が同じなら今のクラスに残す。出力形式が 1 種類なら具体的なクラスを 1 つ作る。2 種類以上あり、同じ形で増えるなら共通の仕組みを検討する。どれでもなければ具体的なクラスを形式ごとに作る"
              start={['誰の依頼で、いつ変わるかを', '書き出す']}
              steps={[
                { q: ['今のクラスと', '変更の理由が同じか'], yes: ['今のクラスに残す'] },
                { q: ['出力の形式が 1 種類だけか'], yes: ['具体的なクラスを 1 つ作る'] },
                { q: ['形式が 2 種類以上あり、', '同じ形で増えていくか'], yes: ['共通の仕組みを検討する'] },
              ]}
              last={['具体的なクラスを', '形式ごとに作る']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>案 3 の <code>OrderCsv</code> を作りました。列の定義は <code>HEADER</code> と <code>row</code> の 2 か所だけで、少ない件数用の <code>generate</code> と、全件の書き出し用の <code>write</code> を持ちます。<code>write</code> は <code>find_each</code> で 1,000 件ずつ読み、1 行ずつファイルに書きます。</p>
          <Code lang="ruby" title="注文 CSV のクラス" code={csvCode} />
          <p>spec は DB を使わず、<code>Data.define</code> で作った値のオブジェクトを渡して、見出しと行の形だけを確かめます。<code>row</code> が使うメソッド（id、status など）を持っていれば、Active Record のオブジェクトでなくても動きます。</p>
          <Code lang="ruby" title="CSV の行の spec" code={csvSpec} />
          <p>注文 100,000 件を入れた SQLite のファイルで、2 つの書き方を別々のプロセスで 2 回ずつ実行し、時間、割り当て数、最大 RSS の増加を測りました。</p>
          <Code lang="ruby" title="2 つの書き方を測る" code={csvBench} />
          <Code lang="text" title="実行結果" code={csvOut} />
          <p>時間は 2 つの書き方でほぼ同じ（1.7〜2.1 秒）で、割り当て数も同じ程度でした。違いは最大 RSS の増加で、<code>generate</code> は 185 MB、<code>write</code> は 11〜12 MB でした。<code>write</code> は 1,000 件を読み終えるたびにそのオブジェクトを手放すので、同時にメモリーに置くのは 1,000 件分です<Ref n={8} />。Puma のワーカー 1 つが約 100 MB で動いている環境で（<ChapterLink n={115} section="workers" />）、185 MB の増加はワーカーのメモリーを 2 倍以上にします。</p>
          <Figure n={figure(4)} title="CSV の作り方と最大 RSS の増加" caption="上の実行結果の値を描いた図です。">
            <CsvMemoryFigure />
          </Figure>
          <p>全件の書き出しは画面の要求の中ではなくジョブで実行し、書き出したファイルをダウンロードさせる形にしました。画面の要求の中で 2 秒かかる処理を実行すると、その間 Puma のスレッドが 1 本使われ続けるためです。採用しなかった案 4 の形は次のようなコードです。</p>
          <Code lang="ruby" title="採用しなかった形：出力形式の登録と列の DSL" code={overAbstraction} />
          <h3>6. メリット・デメリット</h3>
          <p>メリットは経理の依頼による列の変更が <code>OrderCsv</code> とその spec だけで済み、注文の Model に触れなくなることです。spec は DB なしで 0.005 秒で終わります。全件の書き出しでは、メモリーの増加が 185 MB から 11〜12 MB になりました。</p>
          <p>デメリットは、ファイルが 1 つ増えることと、<code>OrderCsv</code> が注文の属性名（status、total_cents など）に依存することです。注文の列の名前を変えると <code>OrderCsv</code> も変更が必要です。この依存は spec では見つからない（spec は値のオブジェクトを使う）ので、実際の Order で 1 行を作る確認も別に置きます。</p>
          <h3>7. トレードオフ</h3>
          <p>この事例ではクラスを 1 つ足して変更の範囲を狭め、抽象化は 1 段にとどめました。案 4 の仕組みは、Excel 形式や取引先向けの JSON が加わり、どの形式も「列を並べる」という同じ形で増えていくと分かった時点で検討します。その時点で <code>OrderCsv</code> を作り直す費用は、今から仕組みを維持する費用より小さいと判断しました。これは本書の判断で、形式の追加がすでに予定されているチームでは結論が変わります。</p>
          <p>メモリーの使い方はクラスの分け方とは別の判断です。<code>write</code> を足したのは 100,000 件という量が分かったからで、画面からの数百件のダウンロードだけなら <code>generate</code> だけで足ります。</p>
        </>
      ),
    },
    {
      id: "principles",
      title: "DRY を適用する範囲を決める",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>会員割引と法人割引の計算が、どちらも「小計の 5%、1 円未満は切り捨て」で同じ形をしています。コードレビューで「重複しているので一つの Discount にまとめるべき」という指摘がありました。同じ時期に、営業から「法人割引は 1 注文 5,000 円までにしたい」という改定の依頼が来ています。</p>
          <h3>2. 原因や背景</h3>
          <p>2 つの割引は、今は同じ式ですが、決める担当が違います。会員割引はマーケティング、法人割引は営業が決めます。DRY は「同じ知識を 1 か所で表す」という原則で、同じ形のコードを 1 つにすることではありません（<ChapterLink n={59} section="meaning" />）。割引の率と上限は担当ごとの別の知識で、たまたま同じ値になっているだけです。</p>
          <p>一方、端数の扱いは経理の規則で、会員にも法人にも同じものが適用されます。こちらは同じ知識が 2 か所に書かれている状態で、経理が規則を変えたら両方を変える必要があります。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：<code>Discount.call(subtotal, kind:)</code> にまとめ、法人の上限は <code>kind</code> の分岐で足す。</li>
            <li>案 2：割引は <code>MemberDiscount</code> と <code>BusinessDiscount</code> に分けたままにし、端数の規則だけを <code>MoneyRounding</code> に共有する。</li>
            <li>案 3：端数の処理も含めて、すべてを別々に書く。</li>
            <li>案 4：率と上限を DB の設定の表に持ち、担当者が画面から変えられるようにする。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>共通にする候補ごとに、「一方を変えるときに、もう一方も必ず変えるか」を問います。率と上限は、営業の改定で法人だけが変わるので、必ず一緒には変わりません。端数の規則は、経理が変えれば両方が変わります。一緒に変わるものだけを共有します。</p>
          <p>まとめた場合の費用も見ます。案 1 では、法人の上限を足すと <code>kind</code> の分岐が入り、会員の計算も同じメソッドを通ります。法人だけの変更でも、会員の計算に影響がないことを確かめる必要が出ます。分岐が増えていくと、まとめたことで読む量が増えます<Ref n={12} />（<ChapterLink n={93} section="dry-aha" />）。</p>
          <p>案 4 は、率や上限が頻繁に変わり、そのたびにリリースを待てない場合に検討します。年に 1〜2 回の改定なら、コードの定数とテストで変更を確かめるほうが単純です。</p>
          <p>原則をどこまで当てはめるかは、その原則が防ごうとしている失敗から考えます。DRY が防ぐのは「同じ規則を変えるときに、一部の箇所を変え忘れる」失敗です。単一責任の原則が防ぐのは「関係のない変更に巻き込まれる」失敗、YAGNI が防ぐのは「使われない仕組みを維持し続ける」失敗です。割引の率と上限をまとめても、変え忘れは起きにくく（担当ごとに別の改定なので、両方を同時に変えることがない）、むしろ関係のない変更に巻き込まれる失敗が増えます。この事例では、DRY を当てはめる範囲を端数の規則に限りました。原則どうしが違う結論を示すときの考え方は <ChapterLink n={93} section="conflict-matrix" /> で扱っています。</p>
          <p>重複を見つけた時点ですぐにまとめず、同じ形が 3 回目に現れたときに共通にするという経験則もあります（Rule of Three）<Ref n={1} />。2 か所の時点では、2 つが同じ理由で変わるのかを判断する材料が少ないためです。この事例は 2 か所で、しかも変わる理由が違うと分かっているので、まとめない判断をしました。</p>
          <Figure n={figure(5)} title="DRY を適用する範囲を決める判断の流れ" caption="この事例の流れです。共通にする候補ごとにこの流れをたどります。">
            <DecisionFigure
              id={figure(5)}
              label="DRY を適用する範囲を決める判断の流れ。先に、似ているコードを知識の単位に分け、それぞれを決める担当を書き出す。一方を変えるとき必ず他方も変えるなら 1 か所にまとめる。決める担当が別なら別々のクラスに置く。同じ担当でも変わる時期が違うならしばらく別にして様子を見る。どれでもなければ今の書き方のままにする"
              start={['似ているコードを知識に分け、', '決める担当を書き出す']}
              steps={[
                { q: ['一方を変えるとき、', '必ず他方も変えるか'], yes: ['1 か所にまとめる', '（例：MoneyRounding）'] },
                { q: ['決める担当が別か'], yes: ['別々のクラスに置く', '（例：会員割引と法人割引）'] },
                { q: ['同じ担当でも、', '変わる時期が違うか'], yes: ['しばらく別にして、', '次の変更で見直す'] },
              ]}
              last={['今の書き方のままにする']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>案 2 で書いたコードと spec です。法人の上限は <code>BusinessDiscount</code> の中だけにあります。</p>
          <Code lang="ruby" title="割引を分け、端数の規則だけを共有する" code={discountCode} />
          <Code lang="ruby" title="割引の spec" code={discountSpec} />
          <Code lang="text" title="実行結果（Ruby 4.0.9、RSpec 3.13.7）" code={discountOut} />
          <p>会員は 199,999 円で 9,999 円の割引、法人は同じ小計で上限の 5,000 円になりました。1,999 円ではどちらも 99 円で、端数の規則が同じことを確かめています。比べるために、採用しなかった案 1 の形も示します。</p>
          <Code lang="ruby" title="採用しなかった形：一つにまとめた Discount" code={mergedDiscount} />
          <p>2 つの設計で、2 種類の変更がどのファイルに及ぶかを比べたのが次の図です。端数の規則を変える変更はどちらの設計でも 1 か所で済みます。差が出るのは法人の上限のような片方だけの変更で、まとめた設計では会員も通るメソッドを変えることになります。</p>
          <Figure n={figure(6)} title="割引の変更が及ぶ範囲" caption="上の 2 つのコードをもとにした図です。">
            <DiscountImpactFigure />
          </Figure>
          <p>spec の期待値からも、どの知識を共有しているかを確かめられます。会員と法人の両方に 1,999 円の例を置いたので、端数の規則を四捨五入に変えると、この 2 件の期待値が同時に変わります。法人の上限を改定したときに変わるのは、法人の 199,999 円の 1 件だけです。期待値が一緒に変わる組み合わせが、共有している知識の範囲と一致していれば、分け方が変更の理由と合っていると判断できます。</p>
          <h3>6. メリット・デメリット</h3>
          <p>メリットは営業による法人割引の改定が <code>BusinessDiscount</code> とその spec だけで済み、会員割引のコードに触れないことです。端数の規則は <code>MoneyRounding</code> の 1 か所なので、経理の変更も 1 か所で済みます。</p>
          <p>デメリットは <code>RATE = 5r / 100</code> のような同じ形の行が 2 つのクラスに残ることです。レビューで再び重複の指摘を受けることがあるので、なぜ分けているか（決める担当が違う）をクラスのコメントに書いておきます。</p>
          <h3>7. トレードオフ</h3>
          <p>この事例では、同じ形の行が残ることを受け入れて、片方だけの変更が他方に及ばない形を選びました。まとめる費用（分岐の増加と、関係のない計算の確認）と、重複を残す費用（両方に同じ変更をし忘れる危険）を比べ、率と上限は前者が大きく、端数の規則は後者が大きいと判断しています。</p>
          <p>原則は、どちらの費用が大きいかを判断するための観点です。「DRY に反するから」「SRP に反するから」という理由だけでは判断せず、どの変更を簡単にしたいのかを具体的な変更の例で確かめます。2 つの割引が同じ担当の決める一つの規則に統合された場合は、まとめる判断に変わります。</p>
        </>
      ),
    },
    {
      id: "pattern",
      title: "MSDP のパターンを採用するか見送るかを決める",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>注文の確定を配送システムに知らせる処理で、月に数件の通知が届かず、出荷が遅れました。調べた結果をもとに、チームでは二つの意見が出ています。一つは「MSDP の 15 のパターンを全部入れて、設計をそろえる」、もう一つは「Rails の標準の機能だけで足りる」です。どのパターンを、どの問題に使うかを決める必要があります。</p>
          <h3>2. 原因や背景</h3>
          <p>配送システムへの通知は注文のコミットの後にジョブを投入して送っていました。コミットと投入の間にプロセスが止まると（デプロイによる再起動やメモリー不足による強制終了）、注文は確定しているのに通知のジョブがありません（<ChapterLink n={115} section="async" />）。DB のトランザクションに、Redis へのジョブの投入や HTTP による外部への送信を含めることはできません。</p>
          <p>パターンは特定の問題を解く方法で、問題がない箇所に入れると、クラス、テスト、運用の手順が増えるだけです。MSDP の採用の原則も問題を先に確かめ、フレームワークの機能を先に確かめ、効果が費用を上回る場合だけ入れることを求めています（<ChapterLink n={39} section="principles" />）。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：15 のパターンをすべて入れる。</li>
            <li>案 2：パターンを入れず、Rails の標準の機能だけで書く。</li>
            <li>案 3：起きている問題ごとに、その問題を解くパターンだけを入れる。</li>
          </ul>
          <p>配送システムへの通知については次の 3 つを比べました。</p>
          <ul>
            <li>3-a：コミットの後にジョブを投入し、取りこぼしを定期的に探して投入し直す。</li>
            <li>3-b：注文の変更と送信予定（アウトボックスの行）を同じトランザクションで保存し、中継の処理が送る（トランザクショナルアウトボックス<Ref n={11} />。<ChapterLink n={53} section="idea" />）。</li>
            <li>3-c：Domain Events で確定の後の処理を購読者に分ける（<ChapterLink n={51} section="idea" />）。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>パターンごとに、次の 3 つを確かめます。今そのパターンが解く問題が起きているか、Rails や使っている gem の機能で同じ問題を解けないか、入れたときに増えるクラス・テスト・運用の手間が、解く問題の損失より小さいか。</p>
          <p>アウトボックスでは取りこぼしたときの損失と、運用の費用を比べます。配送システムへの通知を取りこぼすと出荷が止まり、利用者が気づくまで分かりません。注文と送信予定を同じ DB のトランザクションで保存でき、配送システムがイベント ID で重複を除けるなら、アウトボックスの条件がそろいます。一方、領収書のメールは注文のデータから何度でも作り直せ、数分遅れても業務は止まりません。こちらは 3-a で足ります。3-c の Domain Events は、確定の後の処理が 2 つだけの今は、購読の仕組みを持つ効果が小さいと判断しました。</p>
          <Figure n={figure(7)} title="MSDP のパターンを採用するかを決める判断の流れ" caption="この事例の流れです。パターンごとにこの流れをたどります。">
            <DecisionFigure
              id={figure(7)}
              label="MSDP のパターンを採用するかを決める判断の流れ。先に、そのパターンが解く問題が今起きているかを確かめる。Rails や gem の機能で解けるならその機能を使う。問題の損失が運用の手間より大きいならパターンを採用する。予定された変更で問題が起きると分かっているなら次の変更のときに入れる。どれでもなければ見送り、見送った理由を残す"
              start={['そのパターンが解く問題が', '今起きているかを確かめる']}
              steps={[
                { q: ['Rails や gem の機能で', '同じ問題を解けるか'], yes: ['その機能を使う', '（例：Sidekiq の再試行）'] },
                { q: ['問題の損失が、', '増える運用の手間より大きいか'], yes: ['パターンを採用する', '（例：配送連携のアウトボックス）'] },
                { q: ['予定された変更で', '問題が起きると分かっているか'], yes: ['その変更のときに入れる'] },
              ]}
              last={['見送り、見送った理由を残す']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>アウトボックスの中心は注文の変更と送信予定の追加を同じトランザクションでコミットすることです。次のコードは<code>activerecord</code> と <code>sqlite3</code> が使える環境でファイルに保存し、Ruby で実行できます。データは実行中だけ使う SQLite のメモリー上の DB に保存されます。二件目の注文にも同じイベント ID を渡し、一意制約で送信予定の追加が失敗したときに、注文の更新も取り消されることを確かめます。</p>
          <Code lang="ruby" title="イベント ID が重複すると注文の更新も取り消される" code={outboxExample} />
          <Code lang="text" title="実行結果（Ruby 4.0.9、Active Record 8.1.4.1）" code={`1 confirmed order, 1 pending order, 1 outbox event`} />
          <p>確定済みの注文、保留の注文、送信予定がそれぞれ 1 件残りました。失敗した後の注文は <code>reload</code> で DB から読み直し、トランザクションの外から見た状態を確かめています<Ref n={3} />。</p>
          <p>次に、MySQL 8.4.13 でアウトボックスの費用と中継の動きを測りました。注文 1,000 件を 1 件ずつのトランザクションで確定し、アウトボックスの行を追加しない場合とする場合を比べています。中継は未送信の行を <code>FOR UPDATE SKIP LOCKED</code> で 100 件ずつ取り出し、送った後に送信済みにします。SKIP LOCKED は、ほかのトランザクションがロックしている行を待たずに飛ばす指定です<Ref n={9} />。この中継を 2 つのスレッドで同時に動かしました。</p>
          <Code lang="ruby" title="中継の処理" code={relayCode} />
          <Code lang="text" title="実行結果" code={outboxCostOut} />
          <p>1 件の確定はアウトボックスなしで 14.31 ms、ありで 15.04 ms でした。この環境では、コミットのたびにログをディスクに書く設定（innodb_flush_log_at_trx_commit = 1）のため、1 件の時間の大部分はコミットにかかっています<Ref n={10} />。同じトランザクションに INSERT を 1 つ足す費用は約 0.7 ms（5% 程度）でした。2 つの中継は 500 件ずつを送り、同じイベントを両方が送ることはありませんでした。</p>
          <Figure n={figure(8)} title="アウトボックスと中継" caption="上の 2 つの実行結果をもとにした図です。">
            <OutboxFigure />
          </Figure>
          <p>2 つの中継が同じ行を取り出さない理由を、MySQL 8.4.13 で確かめました。未送信の行を 1,000 件入れた表に接続を 3 つ開き、上の中継と同じ SELECT を1つずつ実行しています。3 つ目の接続は SKIP LOCKED を付けずに FOR UPDATE だけで読み、ロックを待つ時間の上限（innodb_lock_wait_timeout）を 1 秒にしました。最後に、2 つ目の接続をコミットせずに閉じ、中継が止まった場合を再現しています。</p>
          <Code lang="text" title="中継の取り出しを1段ずつ実行した結果（MySQL 8.4.13）" code={skipLockedOut} />
          <p>中継 2 はロック中の 1〜100 を待たずに飛ばし、101〜200 を受け取りました。SKIP LOCKED を付けない読み取りは、中継 1 のロックを待って 1 秒で打ち切られました。コミットせずに閉じた中継 2 の 101〜200 は未送信のまま残り、次の取り出しで再び返りました<Ref n={9} />。この順序を図 {figure(9)} で1段ずつ進められます。</p>
          <Figure n={figure(9)} title="2 つの中継と SKIP LOCKED（段階送り）" caption="上の中継の処理を 2 つ同時に動かしたときの流れを、1 回の取り出しごとに並べた概念モデルです。どの中継がどの 100 件を取るかはスレッドが実行される順で決まり、図の割り当ては一例です。2〜4 と 6 の状態は上の1段ずつの実行で、5 の件数は前の実行結果で確かめました。7 の重複はそこから導いたもので、配送システムへの送信は実行していません。">
            <Stepper steps={relaySteps} />
          </Figure>
          <p>領収書のメールにはアウトボックスを使わない判断をしました。代わりに、確定から 10 分たっても送っていない注文を定期的に探して、ジョブを投入し直します。</p>
          <Code lang="ruby" title="採用しない場合の補い方：定期的な確認" code={reconcileCode} />
          <Code lang="text" title="実行結果" code={reconcileOut} />
          <p>15 分前に確定して投入が取りこぼされた注文 2001 だけが対象になり、1 分前に確定した注文 2002 は、まだジョブが動いている途中なので対象から外れました。この確認は送信済みかどうかを <code>receipt_sent_at</code> で判断するので、同じ注文のジョブが 2 回実行されてもメールを 1 回だけ送るように、ジョブを冪等にしておく必要があります。同じ注文のジョブを 2 回投入して確かめた実験は、補足として <ChapterLink n={115} section="async" /> にあります。</p>
          <p>15 のパターンについて、この注文アプリケーションでの判断をまとめたのが次の表です。表の判断はこの章の事例の条件での判断例です。</p>
          <Figure n={figure(10)} title="注文アプリケーションでの MSDP の 15 のパターンの判断" caption="この章の事例の条件（決済サービス 1 社、出力形式 1 種類、確定の後の処理 2 つなど）での判断例です。条件が変われば判断も変わります。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>パターン</th><th>判断</th><th>理由と、見直す条件</th></tr>
                </thead>
                <tbody>
                  {msdpRows.map(([name, decision, reason]) => (
                    <tr key={name}><td>{name}</td><td>{decision}</td><td>{reason}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Figure>
          <h3>6. メリット・デメリット</h3>
          <p>問題ごとに採否を決めたメリットは、入れたパターンのそれぞれに「どの問題を解くために入れたか」を説明できることです。配送連携では、プロセスがコミットの後に止まっても、送信予定が DB に残るので後から送れます。見送ったパターンには見直す条件を書いたので、条件が満たされたときに再び検討できます。</p>
          <p>デメリットはアウトボックスの中継、送信済みの行の削除、未送信の行が増えていないかの監視という運用が増えることです。送った後、送信済みにする前に中継が止まると同じイベントをもう一度送るので、配送システム側でイベント ID による重複の除去が必要です。また、パターンを入れた箇所と入れていない箇所が混ざるので、どこで何を使っているかの一覧（上の表）を維持する手間もあります。</p>
          <h3>7. トレードオフ</h3>
          <p>アウトボックスでは 1 件あたり約 0.7 ms の書き込みと中継の運用を払って、「確定した注文は必ず配送システムに通知される」という条件を守りました。領収書のメールでは最大で約 10 分の遅れを許す代わりに、アウトボックスの運用を持たない形を選びました。同じアプリケーションの中でも、取りこぼしたときの損失が違えば、同じ問題に別の方法を選びます。</p>
          <p>15 のパターンをすべて入れる案 1 は、どの問題も起きる前に防げるように見えますが、問題が起きていない箇所のクラスとテストを維持し続けることになります。パターンを入れない案 2 は、配送連携の取りこぼしのように Rails の標準の機能では解けない問題を残します。この事例では、問題が起きている箇所と、起きることが分かっている箇所にだけ入れる案 3 を選びました。</p>
          <Callout kind="note" title="見送った理由を残す">
            <p>見送ったパターンはコードに何も残りません。後から参加した人が同じ提案をしたときに判断をやり直さずに済むように、表の「理由と、見直す条件」を設計の記録（ADR や README）に残します（<ChapterLink n={110} section="review" />）。</p>
          </Callout>
          <Ref n={2} />
        </>
      ),
    },
    {
      id: "judgment",
      title: "設計を変えるかどうかの判断基準とトレードオフ",
      body: (
        <>
          <p>四つの事例で、設計を変えるかどうかを決めた基準を並べます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>事例</th><th>変えた部分</th><th>変えなかった部分</th><th>判断の根拠</th></tr>
              </thead>
              <tbody>
                <tr><td>リファクタリング</td><td>確定の手順を PlaceOrder に移し、メールを 1 か所にした</td><td>Order の検証と、Controller の入力と応答</td><td>呼び出し元が 2 つで 3 つ目が決まっている。spec で各段階の振る舞いを確かめた</td></tr>
                <tr><td>クラスの分け方</td><td>CSV を OrderCsv に移し、全件はファイルに書く</td><td>出力形式を登録する仕組み（作らない）</td><td>変更を頼む人が違う。形式は 1 種類。全件で 185 MB → 11〜12 MB</td></tr>
                <tr><td>DRY の範囲</td><td>端数の規則を MoneyRounding に共有</td><td>会員割引と法人割引（分けたまま）</td><td>一緒に変わる知識だけを共有する</td></tr>
                <tr><td>MSDP</td><td>配送連携にアウトボックス。ほかに 3 つを採用、2 つを一部採用、再試行は既存の機能を使う</td><td>8 つのパターンと、領収書のアウトボックスを見送り</td><td>問題の損失と運用の手間を比べた。確定 1 件 +0.7 ms</td></tr>
              </tbody>
            </table>
          </div>
          <p>四つの事例に共通する手順は次のとおりです。</p>
          <ol>
            <li>今の振る舞いをテストで固定してから変える。リファクタリングの事例では不具合（2 通目のメール）も今の振る舞いとして一度固定しました。</li>
            <li>コードの形ではなく、変更の理由で分ける。誰の依頼で、いつ、どの範囲が変わるかを書き出し、一緒に変わるものだけをまとめます。</li>
            <li>抽象化は今ある具体的な例の数に合わせる。形式が 1 つ、決済サービスが 1 社のうちは、具体的なクラスで書きます。</li>
            <li>採用しない判断も記録する。見送った理由と、見直す条件を残します。</li>
          </ol>
          <p>設計の変更は変更そのものの費用（レビュー、移行、学習）もかかります。改修の予定がない箇所の設計が原則やパターンに合っていなくても、すぐに直す必要はありません。次にその箇所を変更するときに、この章の手順で判断します。どの負債から返すかの判断は <ChapterLink n={110} section="debt" /> で扱っています。これは本書の意見で、どこまで先に直すかはチームの状況で変わります。</p>
        </>
      ),
    },
    {
      id: "related",
      title: "関連する章",
      body: (
        <>
          <p>この章の事例で使った考え方は次の章で詳しく扱っています。</p>
          <ul>
            <li>責務の分け方とクラスの作り方：<ChapterLink n={30} section="fat-model" />、<ChapterLink n={33} section="service-contract" />、<ChapterLink n={34} section="decision-tree" /></li>
            <li>原則：<ChapterLink n={58} />、<ChapterLink n={59} />、<ChapterLink n={63} />、<ChapterLink n={93} section="conflict-matrix" /></li>
            <li>MSDP：<ChapterLink n={39} section="principles" />、<ChapterLink n={44} />、<ChapterLink n={53} section="delivery-criteria" />、<ChapterLink n={55} section="too-much" /></li>
            <li>リファクタリングの進め方：<ChapterLink n={110} section="extract" />、<ChapterLink n={110} section="review" /></li>
            <li>アーキテクチャの境界：<ChapterLink n={108} section="decision" />、<ChapterLink n={109} section="decision" /></li>
          </ul>
          <p>クエリとデータの整合性を判断する事例は <ChapterLink n={114} />、Puma・接続プール・キャッシュ・ジョブを判断する事例は <ChapterLink n={115} /> にあります。</p>
        </>
      ),
    },
  ],
  sources: [
    { title: "Refactoring", publisher: "Martin Fowler", url: "https://martinfowler.com/books/refactoring.html", accessed: "2026-11-27", version: "第2版", note: "振る舞いを保ったまま構造を変える変更" },
    { title: "The Rails Doctrine", publisher: "Ruby on Rails", url: "https://rubyonrails.org/doctrine", accessed: "2026-11-27", version: "Rails の設計思想", note: "規約と、設計の判断の考え方" },
    { title: "activerecord/lib/active_record/transactions.rb", publisher: "rails/rails（GitHub）", url: `${GH}/activerecord/lib/active_record/transactions.rb`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "トランザクションの中の例外による取り消し" },
    { title: "Active Record Callbacks（after_commit）", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_record_callbacks.html", accessed: "2026-11-27", version: "Rails 8.1", note: "after_create_commit がすべての保存の経路で実行されること" },
    { title: "Action Mailer Basics（delivery_method :test）", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/action_mailer_basics.html", accessed: "2026-11-27", version: "Rails 8.1", note: "テストの配送方法と ActionMailer::Base.deliveries" },
    { title: "class Data", publisher: "Ruby Documentation", url: "https://docs.ruby-lang.org/en/4.0/Data.html", accessed: "2026-11-27", version: "Ruby 4.0", note: "Data.define で作る値のオブジェクト。実行は Ruby 4.0.9" },
    { title: "CSV（CSV.generate・CSV.open）", publisher: "ruby/csv", url: "https://ruby.github.io/csv/CSV.html", accessed: "2026-11-27", version: "Ruby 4.0 の bundled gem", note: "文字列を作る generate と、ファイルに書く open" },
    { title: "ActiveRecord::Batches（find_each）", publisher: "Ruby on Rails API", url: "https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Batches.html", accessed: "2026-11-27", version: "Rails 8.1", note: "batch_size ごとに読み込んでブロックに渡すこと" },
    { title: "Locking Reads（NOWAIT と SKIP LOCKED）", publisher: "MySQL Reference Manual", url: "https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html", accessed: "2026-11-27", version: "MySQL 8.4", note: "SKIP LOCKED がロック中の行を飛ばすこと" },
    { title: "InnoDB Startup Options and System Variables（innodb_flush_log_at_trx_commit）", publisher: "MySQL Reference Manual", url: "https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html#sysvar_innodb_flush_log_at_trx_commit", accessed: "2026-11-27", version: "MySQL 8.4", note: "既定値 1 でコミットごとにログをディスクに書くこと" },
    { title: "Pattern: Transactional outbox", publisher: "microservices.io（Chris Richardson）", url: "https://microservices.io/patterns/data/transactional-outbox.html", accessed: "2026-11-27", note: "業務のデータと送信するメッセージを同じトランザクションで保存するパターン" },
    { title: "The Wrong Abstraction", publisher: "Sandi Metz", url: "https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction", accessed: "2026-11-27", note: "重複より誤った抽象化の費用が大きくなる場合" },
  ],
}

export default chapter
