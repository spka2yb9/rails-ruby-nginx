import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const figure = (n: number) => `${chapterNumber(109)}-${n}`
const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図1 同じ「注文」が2つのコンテキストで違う意味を持つ ---------- */
function TwoContextsFigure() {
  return (
    <Svg id={figure(1)} w={780} h={300} label="左は受注コンテキストの注文 Order で、状態は draft・confirmed、明細ごとに単価を持ち、確定は支払いと明細がそろったことを意味する。右は出荷コンテキストの出荷 Shipping::Shipment で、状態は waiting・packed・shipped、SKU と数量だけを持ち、倉庫を1つ持つ。中央の Shipping::Intake.request_from が、受注の注文を出荷依頼 Request（order_ref・warehouse_id・items）に変換して渡す">
      <rect x={20} y={20} width={280} height={250} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={34} y={40} bold>受注コンテキスト</T>
      <Box x={34} y={56} w={252} h={44} lines={['Order（注文）', '状態：draft → confirmed']} fs={12.5} bold subTone="muted" />
      <Box x={34} y={112} w={252} h={44} lines={['OrderLine（明細）', 'sku・数量・単価']} fs={12.5} subTone="muted" />
      <T x={34} y={180} fs={12}>「確定」＝ 明細がそろい</T>
      <T x={34} y={198} fs={12}>受け付けた状態</T>
      <T x={34} y={226} fs={11.5} tone="muted">金額・割引・支払いを扱う</T>
      <T x={34} y={244} fs={11.5} tone="muted">倉庫の中の作業は知らない</T>
      <rect x={480} y={20} width={280} height={250} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={494} y={40} bold>出荷コンテキスト</T>
      <Box x={494} y={56} w={252} h={44} lines={['Shipment（出荷）', '状態：waiting → packed → shipped']} fs={12.5} bold subTone="muted" fill="box4" />
      <Box x={494} y={112} w={252} h={44} lines={['items', 'sku と数量だけ（単価は持たない）']} fs={12.5} subTone="muted" fill="box4" />
      <T x={494} y={180} fs={12}>「確定」＝ 出荷する倉庫と</T>
      <T x={494} y={198} fs={12}>荷物の中身が決まった状態</T>
      <T x={494} y={226} fs={11.5} tone="muted">倉庫・梱包・配送業者を扱う</T>
      <T x={494} y={244} fs={11.5} tone="muted">金額は知らない</T>
      <Box x={316} y={104} w={148} h={92} accent fill="box5" lines={['Intake', 'request_from で', '出荷の言葉に', '変換する']} fs={12} bold subTone="muted" />
      <Arrow x1={286} y1={134} x2={314} y2={134} />
      <Arrow x1={464} y1={134} x2={492} y2={134} />
      <T x={316} y={222} fs={11} tone="muted">渡すのは Request の値</T>
      <T x={316} y={238} fs={11} tone="muted">（order_ref・items など）</T>
    </Svg>
  )
}

/* ---------- 図2 コンテキストマップ ---------- */
function ContextMapFigure() {
  return (
    <Svg id={figure(2)} w={780} h={290} label="コンテキストマップの例。受注コンテキストが中心にあり、出荷コンテキストへは出荷依頼の値を渡し、出荷側が受け取り方を決める。受注は外部の決済サービスに、変換層（アダプター）を通して問い合わせる。受注と在庫は、在庫の引き当てを決めるドメインサービスを通して在庫数を読む。在庫と出荷は同じ倉庫の ID を共有する">
      <Box x={290} y={110} w={200} h={70} lines={['受注（Ordering）', 'Order・OrderLine・Money']} fs={13} bold subTone="muted" fill="box5" />
      <Box x={570} y={30} w={190} h={64} lines={['出荷（Shipping）', 'Shipment']} fs={13} bold subTone="muted" fill="box" />
      <Box x={570} y={196} w={190} h={64} lines={['在庫（Inventory）', '倉庫ごとの在庫数']} fs={13} bold subTone="muted" fill="box" />
      <Box x={20} y={110} w={190} h={70} dashed lines={['決済サービス（外部）', '応答の形は相手が決める']} fs={12.5} bold subTone="muted" fill="box4" />
      <Arrow x1={490} y1={128} x2={568} y2={70} />
      <T x={420} y={96} fs={11} tone="muted">出荷依頼の値</T>
      <Arrow x1={210} y1={145} x2={288} y2={145} both />
      <T x={214} y={128} fs={11} tone="muted">変換層を通す</T>
      <Arrow x1={490} y1={162} x2={568} y2={220} />
      <T x={420} y={196} fs={11} tone="muted">在庫数を読む</T>
      <Arrow x1={665} y1={94} x2={665} y2={194} dashed both />
      <T x={672} y={146} fs={11} tone="muted">倉庫 ID を共有</T>
      <T x={20} y={230} fs={11.5} tone="muted">矢印は情報を渡す向き。破線は同じ値の意味を</T>
      <T x={20} y={248} fs={11.5} tone="muted">両方で揃えている関係。この章の例は1つの</T>
      <T x={20} y={266} fs={11.5} tone="muted">Rails アプリの中の名前空間として分けている</T>
    </Svg>
  )
}

/* ---------- 図3 戦術的設計の部品 ---------- */
function TacticalFigure() {
  return (
    <Svg id={figure(3)} w={780} h={330} label="破線の枠が注文の集約で、中にルートの Order（エンティティ）、明細 OrderLine、金額 Money（値オブジェクト）がある。集約の外の Repository（Sales::OrderStore）はルートの単位で読み書きし、明細だけを読み書きする口は持たない。ドメインサービス Inventory::Allocation は、注文の明細と複数の倉庫の在庫数を受け取り、すべてを出荷できる倉庫を返す。倉庫ごとの在庫は別の集約">
      <rect x={20} y={30} width={420} height={230} rx={10} fill="none" stroke="var(--fig-accent)" strokeDasharray="6 4" strokeWidth={1.5} />
      <T x={34} y={48} fs={12} bold>注文の集約（ここまでを一緒に保存する）</T>
      <Box x={40} y={62} w={180} h={60} lines={['Order（ルート）', 'エンティティ：id で区別']} fs={12.5} bold subTone="muted" fill="box5" accent />
      <Box x={40} y={150} w={180} h={60} lines={['OrderLine × n', '明細。ルート経由で変更']} fs={12.5} subTone="muted" />
      <Box x={250} y={150} w={170} h={60} lines={['Money', '値オブジェクト：値で比較']} fs={12.5} subTone="muted" fill="box2" />
      <Arrow x1={130} y1={122} x2={130} y2={148} />
      <Arrow x1={220} y1={180} x2={248} y2={180} dashed />
      <T x={40} y={236} fs={11.5} tone="muted">規則：確定した注文には明細を足さない</T>
      <Box x={500} y={62} w={260} h={60} lines={['Repository', 'ルートの単位で find・save']} fs={12.5} bold subTone="muted" fill="box4" />
      <Arrow x1={498} y1={92} x2={222} y2={92} both />
      <Box x={500} y={180} w={260} h={60} lines={['ドメインサービス', 'Inventory::Allocation']} fs={12.5} bold subTone="muted" fill="box3" />
      <Arrow x1={498} y1={200} x2={422} y2={200} dashed />
      <T x={500} y={262} fs={11.5} tone="muted">明細と、複数の倉庫の在庫数を受け取り</T>
      <T x={500} y={280} fs={11.5} tone="muted">すべてを出荷できる倉庫を返す</T>
      <Box x={500} y={292} w={260} h={30} dashed lines="倉庫ごとの在庫（別の集約）" fs={12} />
      <T x={20} y={290} fs={11.5} tone="muted">実線：参照して操作する　破線：値を受け取るだけ</T>
    </Svg>
  )
}

/* ---------- 図4 ルートを通らない変更と、止められるもの ---------- */
function BypassFigure() {
  const rows: [string, string, string, string][] = [
    ['order.add_line!（ルート経由）', '止まる', '止まる', '止まる（add_line）'],
    ['OrderLine.create!(order:)', '通る', '止まる', '定数を参照できない'],
    ['order.lines.create!', '通る', '止まる', '関連を公開しない'],
    ['OrderLine.insert_all', '通る', '通る', '定数を参照できない'],
    ['const_get で行のクラスを取り出す', '—', '—', '通る'],
  ]
  const tone = (s: string) => (s.startsWith('通る') ? 'danger' : undefined)
  return (
    <Svg id={figure(4)} w={780} h={268} label="確定した注文に明細を足す5つの経路と、3つの設計で止まるかを比べた表。ルート経由の add_line! はどれでも止まる。OrderLine.create! と order.lines.create! は、ルートだけで確認する設計では通り、明細の検証を足すと止まり、Repository の設計では行のクラスを参照できない。insert_all は検証を通らないので明細の検証を足しても通る。Repository の設計でも const_get を使えば行のクラスを取り出せる">
      <T x={20} y={20} fs={12} bold>確定した注文に明細を足す経路</T>
      <T x={340} y={20} fs={12} bold>ルートで確認</T>
      <T x={480} y={20} fs={12} bold>明細の検証も追加</T>
      <T x={630} y={20} fs={12} bold>OrderStore</T>
      {rows.map(([path, a, b, c], i) => {
        const y = 36 + i * 42
        return (
          <g key={path}>
            <rect x={14} y={y} width={752} height={36} rx={4} fill={i % 2 ? 'var(--fig-bg)' : 'var(--fig-box)'} stroke="none" />
            <T x={22} y={y + 18} fs={12} mono={i < 4}>{path}</T>
            <T x={340} y={y + 18} fs={12} tone={tone(a)}>{a}</T>
            <T x={480} y={y + 18} fs={12} tone={tone(b)}>{b}</T>
            <T x={630} y={y + 18} fs={12} tone={tone(c)}>{c}</T>
          </g>
        )
      })}
      <T x={20} y={250} fs={11.5} tone="muted">「通る」は確定済みの注文に明細が増えたこと、または行のクラスを取り出せたことを表す</T>
    </Svg>
  )
}

/* ---------- 図5 Active Record をそのまま使う場合と Repository で包む場合 ---------- */
function CompareFigure() {
  return (
    <Svg id={figure(5)} w={780} h={300} label="左は Active Record をそのまま使う呼び出し側で、Relation と Active Record のオブジェクトを受け取り、条件の追加、limit、lock、update!、lines.create! を呼べる。includes を書けば2回の SQL、書き忘れると5回になった。右は Repository で包む呼び出し側で、凍結された Data の値を受け取り、条件の追加や保存はできない。読み込み方は Repository が決めるので常に2回だった。新しい条件が要るときは Repository にメソッドを足す">
      <T x={20} y={20} bold>A：Active Record をそのまま使う</T>
      <T x={410} y={20} bold>B：Repository で包む</T>
      <Box x={20} y={36} w={350} h={56} lines={['受け取るもの', 'Relation と Active Record のオブジェクト']} fs={12.5} subTone="muted" />
      <Box x={410} y={36} w={350} h={56} lines={['受け取るもの', 'ShippableOrder（Data の値。凍結済み）']} fs={12.5} subTone="muted" fill="box5" />
      <Box x={20} y={104} w={350} h={76} lines={['呼び出し側ができること', 'where・limit・lock を足す', 'update!・lines.create! で書き換える']} fs={12.5} subTone="muted" />
      <Box x={410} y={104} w={350} h={76} lines={['呼び出し側ができること', '値を読むだけ', '条件を足すには Repository を直す']} fs={12.5} subTone="muted" fill="box5" />
      <Box x={20} y={192} w={350} h={56} lines={['SQL の回数（4件の注文）', 'includes あり 2 回、書き忘れると 5 回']} fs={12.5} subTone="muted" />
      <Box x={410} y={192} w={350} h={56} lines={['SQL の回数（4件の注文）', '読み込み方を Repository が決め、2 回']} fs={12.5} subTone="muted" fill="box5" />
      <T x={20} y={272} fs={11.5} tone="muted">どちらも同じ結果を返した。違いは、呼び出し側に任せることと、Repository の中で決めることの範囲</T>
    </Svg>
  )
}

/* ---------- 図6 Repository を置くかの判断 ---------- */
function DecisionFigure() {
  const q = [
    ['保存先が DB 以外にもある、または入れ替わる', '置く（保存先の違いを中に閉じ込める）'],
    ['集約の単位でしか保存させたくない', '置く（行のクラスを外に出さない）'],
    ['検索の条件に名前を付けたいだけ', 'スコープか Query Object'],
    ['テストを速くしたいだけ', '規則を値で受け取るクラスに分ける'],
    ['画面の入力をそのまま保存する CRUD', '置かない（Active Record のまま）'],
  ]
  return (
    <Svg id={figure(6)} w={780} h={280} label="Repository を置くかの判断。保存先が DB 以外にもある、または入れ替わるなら置く。集約の単位でしか保存させたくないなら置く。検索の条件に名前を付けたいだけならスコープか Query Object。テストを速くしたいだけなら規則を値で受け取るクラスに分ける。画面の入力をそのまま保存する CRUD なら置かない">
      <T x={20} y={18} fs={12} tone="muted">当てはまる条件</T>
      <T x={470} y={18} fs={12} tone="muted">最初に選ぶ手段</T>
      {q.map(([cond, ans], i) => {
        const y = 32 + i * 48
        const yes = ans.startsWith('置く')
        return (
          <g key={cond}>
            <Box x={20} y={y} w={400} h={38} lines={cond} fs={12.5} />
            <Arrow x1={420} y1={y + 19} x2={466} y2={y + 19} />
            <Box x={470} y={y} w={290} h={38} lines={ans} fs={12.5} fill={yes ? 'box5' : 'bg'} accent={yes} />
          </g>
        )
      })}
    </Svg>
  )
}

const moneyCode = `
# app/models/money.rb
Money = Data.define(:cents, :currency) do
  def +(other)
    raise ArgumentError, "currency mismatch: #{currency} + #{other.currency}" unless currency == other.currency

    with(cents: cents + other.cents)
  end

  def to_s = "#{cents.to_s.reverse.scan(/\\d{1,3}/).join(",").reverse} #{currency}"
end

# app/models/inventory/allocation.rb
module Inventory
  # 注文の明細をすべて1か所から出荷できる倉庫を選ぶ（ドメインサービス）
  module Allocation
    def self.warehouse_for(lines, stocks)
      stocks.keys.sort.find do |warehouse_id|
        lines.all? { |line| stocks[warehouse_id].fetch(line.sku, 0) >= line.quantity }
      end
    end
  end
end
`

const tacticalRun = `
a = Money.new(1200, "JPY")
a == Money.new(1200, "JPY")          # => true   値が同じなら等しい
a.equal?(Money.new(1200, "JPY"))     # => false  オブジェクトは別
a + Money.new(800, "JPY")            # => 2,000 JPY
a + Money.new(10, "USD")             # ArgumentError: currency mismatch: JPY + USD
a.instance_variable_set(:@cents, 1)  # FrozenError: can't modify frozen Money

Order.find(1) == Order.find(1)       # => true   クラスと id が同じなら等しい（エンティティ）
Order.find(1).equal?(Order.find(1))  # => false

# 明細 A×2・B×1。倉庫1は B がなく、倉庫2は A が2個・B が4個、倉庫3は十分にある
Inventory::Allocation.warehouse_for(lines, { 1 => { "A" => 5 }, 2 => { "A" => 2, "B" => 4 }, 3 => { "A" => 9, "B" => 9 } })
# => 2
Inventory::Allocation.warehouse_for(lines, { 1 => { "A" => 1, "B" => 1 } })
# => nil
`

const orderModel = `
# app/models/order.rb（集約のルート）
class Order < ApplicationRecord
  class Closed < StandardError; end

  has_many :lines, class_name: "OrderLine", dependent: :destroy
  scope :awaiting_shipment, -> { where(state: "confirmed") }

  def add_line!(sku:, quantity:, unit_price_cents:)
    raise Closed, "order #{id} is #{state}" unless state == "draft"

    lines.create!(sku:, quantity:, unit_price_cents:)
  end

  def confirm! = update!(state: "confirmed")

  def total
    lines.map { Money.new(_1.quantity * _1.unit_price_cents, "JPY") }.reduce(Money.new(0, "JPY"), :+)
  end
end

# app/models/order_line.rb（最初の版）
class OrderLine < ApplicationRecord
  belongs_to :order
end
`

const bypassRun = `
order = Order.create!(warehouse_id: 1)
order.add_line!(sku: "A", quantity: 1, unit_price_cents: 1200)
order.confirm!
order.add_line!(sku: "B", quantity: 1, unit_price_cents: 800)
# => Order::Closed: order 2 is confirmed

OrderLine.create!(order:, sku: "B", quantity: 1, unit_price_cents: 800)   # 例外なし
order.lines.create!(sku: "C", quantity: 1, unit_price_cents: 500)          # 例外なし
OrderLine.insert_all([{ order_id: order.id, sku: "D", quantity: 1, unit_price_cents: 100 }])  # 例外なし

確定済みの注文 2 の明細: ["A", "B", "C", "D"] 合計 2,600 JPY
`

const guardCode = `
# app/models/order_line.rb（検証を足した版）
class OrderLine < ApplicationRecord
  belongs_to :order
  validate :order_must_be_draft, on: :create

  private

  # どこから作られても、確定した注文には明細を足さない
  def order_must_be_draft
    errors.add(:order, "is #{order.state}") unless order&.state == "draft"
  end
end
`

const aggregateSpecOutput = `
$ bundle exec rspec spec/models --format documentation

注文の集約
  確定した注文に add_line! で明細を足すと Order::Closed
  OrderLine.create! で直接足しても、明細の検証が止める
  insert_all は検証を通らないので、明細が増える

Sales::OrderStore
  ルートを読み、明細を足して、ルートごと保存する
  明細の行のクラスは外から参照できない

Ordering::OrderHistory
  DB から移した注文も、同じ find で読める

Finished in 0.05972 seconds (files took 0.80733 seconds to load)
6 examples, 0 failures
`

const compareCode = `
# A：Active Record をそのまま使う（出荷指示を作る処理の中）
Order.awaiting_shipment.where(warehouse_id: 1).includes(:lines).order(:id).map do |o|
  { order_id: o.id, items: o.lines.map { "#{_1.sku}x#{_1.quantity}" } }
end

# B：Repository で包む
# app/models/ordering/order_repository.rb
module Ordering
  ShippableOrder = Data.define(:id, :lines)
  ShippableLine = Data.define(:sku, :quantity)

  class OrderRepository
    # 倉庫ごとの出荷待ちの注文を、明細つきの値で返す
    def awaiting_shipment(warehouse_id:)
      Order.awaiting_shipment.where(warehouse_id:).includes(:lines).order(:id).map do |order|
        ShippableOrder.new(id: order.id, lines: order.lines.map { ShippableLine.new(sku: _1.sku, quantity: _1.quantity) })
      end
    end
  end
end

# 呼び出し側
Ordering::OrderRepository.new.awaiting_shipment(warehouse_id: 1).map do |o|
  { order_id: o.id, items: o.lines.map { "#{_1.sku}x#{_1.quantity}" } }
end
`

const compareRun = `
A: 2 queries / B: 2 queries / 結果が同じ: true
[{order_id: 2, items: ["Ax1", "Bx1", "Cx1", "Dx1"]}, {order_id: 3, items: ["Ax1", "Bx1"]}, {order_id: 4, items: ["Cx1"]}, {order_id: 6, items: ["Ex1", "Fx1"]}]
A で includes を書き忘れた場合: 5 queries

first = Ordering::OrderRepository.new.awaiting_shipment(warehouse_id: 1).first
first.class                 # => Ordering::ShippableOrder
first.respond_to?(:update!) # => false
first.lines.first.instance_variable_set(:@quantity, 99)  # => FrozenError

# Relation をそのまま返す Repository だと、呼び出し側が一括更新を書ける
leaky = ->(warehouse_id:) { Order.awaiting_shipment.where(warehouse_id:) }
leaky.(warehouse_id: 2).update_all(state: "shipped")
UPDATE "orders" SET "state" = 'shipped' WHERE "orders"."state" = 'confirmed' AND "orders"."warehouse_id" = 2
`

const historyCode = `
# app/models/ordering/order_history.rb
require "json"

module Ordering
  # 直近の注文は DB、古い注文は JSON ファイルに置く。呼び出し側は保存先を知らない
  class OrderHistory
    Entry = Data.define(:id, :state, :skus, :source)

    def initialize(archive_dir: Rails.root.join("storage/archive"))
      @archive_dir = archive_dir
    end

    def find(id)
      if (order = Order.includes(:lines).find_by(id:))
        Entry.new(id: order.id, state: order.state, skus: order.lines.map(&:sku), source: :db)
      elsif File.exist?(path(id))
        data = JSON.parse(File.read(path(id)))
        Entry.new(id: data["id"], state: data["state"], skus: data["skus"], source: :archive)
      else
        raise ActiveRecord::RecordNotFound, "order #{id} not found"
      end
    end

    def archive!(id)
      order = Order.includes(:lines).find(id)
      FileUtils.mkdir_p(@archive_dir)
      File.write(path(id), { id: order.id, state: order.state, skus: order.lines.map(&:sku) }.to_json)
      order.destroy!
    end

    private

    def path(id) = @archive_dir.join("#{id}.json")
  end
end
`

const historyRun = `
history.find(7)
# => #<data Ordering::OrderHistory::Entry id=7, state="delivered", skus=["Z"], source=:db>
history.archive!(7)
history.find(7)
# => #<data Ordering::OrderHistory::Entry id=7, state="delivered", skus=["Z"], source=:archive>
Order.exists?(7)   # => false
storage/archive/7.json: {"id":7,"state":"delivered","skus":["Z"]}
`

const storeCode = `
# app/models/sales/order.rb（集約のルート。Active Record を継承しない）
module Sales
  class Order
    class Closed < StandardError; end
    Line = Data.define(:sku, :quantity, :unit_price_cents)

    attr_reader :id, :state, :lines

    def initialize(id:, state:, lines:)
      @id, @state, @lines = id, state, lines
    end

    def add_line(sku:, quantity:, unit_price_cents:)
      raise Closed, "order #{id} is #{state}" unless state == "draft"

      @lines += [Line.new(sku:, quantity:, unit_price_cents:)]
    end
  end
end

# app/models/sales/order_store.rb
module Sales
  # 集約のルート単位でだけ読み書きする Repository。行のクラスは外から参照できない
  class OrderStore
    class LineRecord < ApplicationRecord
      self.table_name = "order_lines"
    end

    class OrderRecord < ApplicationRecord
      self.table_name = "orders"
      has_many :lines, class_name: "Sales::OrderStore::LineRecord", foreign_key: :order_id
    end
    private_constant :OrderRecord, :LineRecord

    def find(id)
      record = OrderRecord.includes(:lines).find(id)
      lines = record.lines.map { Order::Line.new(sku: _1.sku, quantity: _1.quantity, unit_price_cents: _1.unit_price_cents) }
      Order.new(id: record.id, state: record.state, lines:)
    end

    def save(order)
      OrderRecord.transaction do
        record = OrderRecord.lock.find(order.id)
        record.update!(state: order.state)
        LineRecord.where(order_id: record.id).delete_all
        order.lines.each { record.lines.create!(sku: _1.sku, quantity: _1.quantity, unit_price_cents: _1.unit_price_cents) }
      end
    end
  end
end
`

const storeRun = `
order = store.find(9)
order.add_line(sku: "A", quantity: 2, unit_price_cents: 500)
store.save(order)
  TRANSACTION  BEGIN immediate TRANSACTION
  Sales::OrderStore::OrderRecord Load  SELECT "orders".* FROM "orders" WHERE "orders"."id" = 9 LIMIT 1
  Sales::OrderStore::LineRecord Delete All  DELETE FROM "order_lines" WHERE "order_lines"."order_id" = 9
  Sales::OrderStore::LineRecord Create  INSERT INTO "order_lines" ("order_id", "sku", "quantity", "unit_price_cents", ...) VALUES (9, 'A', 2, 500, ...)
  TRANSACTION  COMMIT TRANSACTION

Sales::OrderStore::LineRecord
# => NameError: private constant Sales::OrderStore::LineRecord referenced
Sales::OrderStore.const_get(:LineRecord).count
# => 例外にならず、order_lines の件数を返した（const_get なら取り出せる）
`

const speedRun = `
$ bundle exec rspec spec/speed/db_spec.rb       # Order と OrderLine を DB に保存する 200 例
Finished in 1.3 seconds (files took 1.02 seconds to load)
Finished in 2.06 seconds (files took 0.99178 seconds to load)
Finished in 1.02 seconds (files took 1.39 seconds to load)

$ bundle exec rspec spec/speed/memory_spec.rb   # Sales::Order をメモリー上で使う 200 例
Finished in 0.03275 seconds (files took 0.25533 seconds to load)
Finished in 0.03778 seconds (files took 0.25456 seconds to load)
Finished in 0.02812 seconds (files took 0.21498 seconds to load)
`

const intakeCode = `
# app/models/shipping/intake.rb
module Shipping
  # 受注の注文を、出荷の言葉（出荷依頼）に変えて受け取る
  module Intake
    Request = Data.define(:order_ref, :warehouse_id, :items)

    def self.request_from(order)
      Request.new(order_ref: order.id, warehouse_id: order.warehouse_id,
                  items: order.lines.map { { "sku" => _1.sku, "quantity" => _1.quantity } })
    end

    def self.accept(request)
      Shipment.create_or_find_by!(order_ref: request.order_ref) do |shipment|
        shipment.warehouse_id = request.warehouse_id
        shipment.items = request.items
      end
    end
  end
end
`

const intakeRun = `
req = Shipping::Intake.request_from(Order.includes(:lines).find(2))
# => #<data Shipping::Intake::Request order_ref=2, warehouse_id=1, items=[{"sku" => "A", "quantity" => 1}, ...]>
s1 = Shipping::Intake.accept(req)
s2 = Shipping::Intake.accept(req)   # 同じ依頼をもう一度受け取る
[s1.id == s2.id, Shipping::Shipment.count, s1.state]
# => [true, 1, "waiting"]
`

const chapter: Chapter = {
  number: 109,
  part: 7,
  title: "DDD と Repository を使う境界",
  summary: "受注と出荷で意味の違う「注文」を例に、DDD の戦略的設計と戦術的設計の部品を Rails のコードで確かめ、Active Record をそのまま使う場合と Repository で包む場合を動かして比べます。",
  goals: [
    "ユビキタス言語と境界づけられたコンテキストを、同じ語が文脈ごとに違う意味を持つ例で説明できる",
    "エンティティ・値オブジェクト・集約・ドメインサービス・リポジトリを Rails の部品と対応づけられる",
    "集約のルートを通らない変更の経路を挙げ、それぞれを止める手段と限界を説明できる",
    "Active Record と Repository の責務の重なりを、同じ処理の2つの書き方から比べられる",
    "Repository が有効な条件と有効でない条件を、具体的なコードの状況から判断できる",
  ],
  prerequisites: [30, 108],
  sections: [
    {
      id: "language",
      title: "DDD の目的と、業務の言葉をコードに使うこと",
      body: (
        <>
          <p><Term en="Domain-Driven Design">ドメイン駆動設計（DDD）</Term>は、ソフトウェアが扱う業務（ドメイン）を、業務の専門家と開発者が一緒に理解し、その理解をモデルとしてコードに表す設計の方法です。Eric Evans が2003年の書籍でまとめ、2015年にパターンの要約を DDD Reference として公開しています<Ref n={1} />。DDD にはシステムをどこで区切るかを決める戦略的設計と、区切った中のクラスをどう組み立てるかを決める戦術的設計の2つの面があります。</p>
          <p>まず戦略的設計の1つ目、<Term en="Ubiquitous Language">ユビキタス言語</Term>から始めます。これは、会話、仕様書、画面、コードで同じ言葉を同じ意味で使うという取り決めです。ネットショップで、受注担当が「注文を確定する」と言うとき、それは明細と支払いがそろった注文を受け付けることを指します。ところが、コードでは状態の値が <code>"fixed"</code>、画面では「受付完了」、仕様書では「注文確認」となっていると、どの言葉が同じ状態を指すのかを人が毎回対応づけることになります。新しい状態「保留」を足す依頼が来たとき、その対応づけを誤ると、画面とコードで違う状態を扱ってしまいます。</p>
          <p>この章のコードは業務の言葉をそのまま使っています。受注の注文は <code>Order</code>、明細は <code>OrderLine</code>、状態は <code>draft</code>（作成中）と <code>confirmed</code>（確定）で、明細を足す操作は <code>add_line!</code>、確定は <code>confirm!</code> です。言葉を揃える作業は名前を付け直すだけでは終わりません。「確定した後に明細を足せるか」のように、言葉に結びつく規則を業務の担当者に確かめ、その答えをメソッドの振る舞いとテストに書きます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">業務の言葉</th>
                  <th scope="col">コード</th>
                  <th scope="col">言葉に結びつく規則（この章で確かめるもの）</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row">注文を確定する</th><td><code>Order#confirm!</code></td><td>確定後は明細を足さない</td></tr>
                <tr><th scope="row">明細を足す</th><td><code>Order#add_line!</code></td><td>作成中の注文にだけ足せる</td></tr>
                <tr><th scope="row">出荷待ち</th><td><code>Order.awaiting_shipment</code></td><td>確定した注文</td></tr>
                <tr><th scope="row">出荷依頼</th><td><code>Shipping::Intake::Request</code></td><td>出荷に渡すのは SKU と数量だけ</td></tr>
                <tr><th scope="row">引き当てる倉庫</th><td><code>Inventory::Allocation.warehouse_for</code></td><td>明細をすべて1か所から出せる倉庫</td></tr>
              </tbody>
            </table>
          </div>
          <p>DDD は、業務の規則が複雑なソフトウェアを対象にした方法です。Microsoft の DDD の解説は、DDD の手法は業務の規則が多い複雑なサービスに使い、単純な CRUD のサービスはもっと単純な方法で扱えると書いています<Ref n={7} />。規則がほとんどない画面に DDD の部品を当てはめても、言葉を揃える利点のほかに得るものは少なくなります。</p>
          <Ref n={2} />
        </>
      ),
    },
    {
      id: "bounded-context",
      title: "境界づけられたコンテキストとコンテキストマップ",
      body: (
        <>
          <p>ユビキタス言語を作ろうとすると、同じ言葉が部署によって違う意味を持つことに気づきます。受注担当の「注文の確定」は受け付けたことを指しますが、倉庫の担当者にとっての「確定」は、出荷する倉庫と荷物の中身が決まり、梱包を始められる状態です。倉庫の担当者は単価や割引には関心がなく、受注担当は梱包の状態に関心がありません。両方の意味を1つの <code>Order</code> クラスに入れると、状態の一覧に <code>confirmed</code> と <code>packed</code> が並び、どちらの部署の規則でどの状態に進めるのかが、コードからは読み取れなくなります。</p>
          <p>DDD では、1つのモデルと言葉が一貫して通用する範囲を<Term en="Bounded Context">境界づけられたコンテキスト</Term>と呼びます。Fowler は大きなシステムを境界づけられたコンテキストに分け、それぞれが統一されたモデルを持てるようにする、と説明しています。電力会社の顧客の例では、「メーター」という言葉が組織の部分ごとに少しずつ違う意味で使われていました<Ref n={4} />。この章の例では、受注と出荷を別のコンテキストに分けます。</p>
          <Figure n={figure(1)} title="同じ「注文」が2つのコンテキストで違う意味を持つ" caption="この章のコードの受注と出荷を、境界づけられたコンテキストとして描いた模式図。出荷の packed・shipped はこの章のコードでは作っていない。">
            <TwoContextsFigure />
          </Figure>
          <p>図 {figure(1)} のように、出荷側は <code>Shipping::Shipment</code> という別のモデルを持ち、受注の <code>Order</code> を直接参照しません。受注から出荷へは、出荷側が決めた形の値（出荷依頼）を渡します。Rails では、コンテキストを名前空間（<code>Shipping::</code>）として分けるのが小さく始める方法です。同じ DB、同じプロセスのままでも、モデルと言葉の境界は分けられます。別のアプリケーションやサービスに分けるかどうかは、配備やチームの都合で決める別の判断です（<ChapterLink n={31} section="monolith" />）。</p>
          <p>コンテキストどうしの関係を図にしたものを<Term en="Context Map">コンテキストマップ</Term>と呼びます。Fowler は、コンテキストどうしの関係を描くにはコンテキストマップがたいてい役に立つと書いています<Ref n={4} />。図 {figure(2)} には、この章の受注・出荷・在庫と、外部の決済サービスの関係を描きました。</p>
          <Figure n={figure(2)} title="コンテキストマップの例" caption="この章の例の関係を描いた模式図。DDD Reference は関係の種類（顧客と供給者、変換層など）に名前を付けているが、この図では名前を省いて情報の向きだけを示した。">
            <ContextMapFigure />
          </Figure>
          <p>外部の決済サービスのように、応答の形を自分たちで決められない相手との間には、相手の言葉を自分たちの言葉に変える層を置きます。DDD Reference はこれを Anticorruption Layer（腐敗防止層）と呼んでいます<Ref n={1} />。Rails では<ChapterLink n={108} section="partial" />のポートとアダプターや、<ChapterLink n={42} />の Adapter がこの層に当たります。</p>
          <p>コンテキストを分ける費用もあります。受注から出荷へ値を渡す変換のコード、2つのモデルの整合を確かめるテスト、どちらのコンテキストに属するか迷う処理の扱いです。受注と出荷で状態や権限が本当に違うか、1つのモデルにまとめるとどの仕様が曖昧になるかを、具体的な変更の依頼から確かめてから分けます。</p>
        </>
      ),
    },
    {
      id: "tactical",
      title: "戦術的設計の部品：エンティティ・値オブジェクト・ドメインサービス",
      body: (
        <>
          <p>境界を決めたら、その中のモデルを組み立てます。戦術的設計では、オブジェクトを役割で分類します。Fowler は Evans の分類を次のように要約しています<Ref n={5} />。</p>
          <ul>
            <li><Term en="Entity">エンティティ</Term>：時間がたち表現が変わっても続く、固有の同一性を持つオブジェクト。注文は明細が変わっても同じ注文です。</li>
            <li><Term en="Value Object">値オブジェクト</Term>：属性の組み合わせだけが意味を持つオブジェクト。1,200 円は、どのオブジェクトが表していても同じ 1,200 円です。</li>
            <li><Term en="Service">サービス</Term>（ドメインサービス）：ドメインの中の独立した操作。特定のエンティティや値に属さない業務の判断を表します。</li>
          </ul>
          <p>これに、一緒に変更するオブジェクトのまとまりである集約と、集約を読み書きするリポジトリが加わります。集約は次の節、リポジトリはその次の節で扱います。値オブジェクトとドメインサービスの Rails での書き方は<ChapterLink n={33} section="value-objects" />と<ChapterLink n={33} section="domain-application-service" />で詳しく扱っているので、ここではこの章の例で使うものだけを示します。</p>
          <Code lang="ruby" title="値オブジェクト Money と、ドメインサービス Inventory::Allocation" code={moneyCode} />
          <p><code>Money</code> は Ruby の <code>Data.define</code> で作りました。<code>Data</code> のオブジェクトは作った後に変更できず、同じ値を持つ2つのオブジェクトは <code>==</code> で等しくなります<Ref n={9} />。通貨の違う金額を足すと例外にして、円とドルを足す誤りをその場で止めます。<code>Inventory::Allocation</code> は、注文の明細と、倉庫ごとの在庫数を受け取り、すべてを1か所から出荷できる倉庫を返します。この判断は注文にも倉庫にも属さないので、どちらかのクラスのメソッドにすると、そのクラスがもう一方の内部を知ることになります。Ruby 4.0.9・Rails 8.1.4.1 の <code>bin/rails runner</code> で動かしました。</p>
          <Code lang="ruby" title="実行結果（bin/rails runner。コメントは結果の説明）" code={tacticalRun} />
          <p>値オブジェクトは値で比べ、エンティティは同一性で比べることが、出力から分かります。Active Record のモデルは <code>==</code> をクラスと <code>id</code> で判定するので、<code>Order</code> は最初からエンティティとして振る舞います。同じ行を2回読むと別のオブジェクトになる理由は<ChapterLink n={48} section="active-record" />で確かめています。</p>
          <Figure n={figure(3)} title="戦術的設計の部品と、この章のクラス" caption="この章のクラスを DDD の部品に当てはめた模式図。Repository は次の節以降で作る Sales::OrderStore を指す。">
            <TacticalFigure />
          </Figure>
          <p>図 {figure(3)} の部品は、すべてを使う必要はありません。値オブジェクトは、生の数値や文字列のままでは同じ誤り（通貨の取り違え、単位の取り違え）が繰り返されるときに効果があり、ドメインサービスは、2つ以上の集約にまたがる判断を置く場所が見つからないときに使います。どちらも Rails の規約の中で書けるので、導入の費用は小さく済みます。費用が大きくなりやすいのは、次の2つの節で扱う集約とリポジトリです。</p>
        </>
      ),
    },
    {
      id: "aggregate",
      title: "集約が守る整合性と、ルートを通らない変更",
      body: (
        <>
          <p><Term en="Aggregate">集約</Term>は、ひとまとまりとして扱うドメインのオブジェクトの集まりです。Fowler の要約では、集約の中の1つのオブジェクトがルートになり、集約の外からの参照はルートにだけ向け、トランザクションは集約の境界をまたがないようにします<Ref n={6} />。この章の注文の集約は、ルートの <code>Order</code> と明細の <code>OrderLine</code> からなり、ルートが守る規則は「確定した注文には明細を足さない」です。集約の境界の決め方と、Rails の <code>autosave</code> で集約を表す方法は<ChapterLink n={48} section="aggregate" />で扱っているので、ここでは規則を守らせる側の問題を確かめます。</p>
          <Code lang="ruby" title="注文の集約（Active Record）" code={orderModel} />
          <p>ルートの <code>add_line!</code> は、作成中でなければ <code>Order::Closed</code> を投げます。では、ルートを通らずに明細を足すとどうなるかを試しました。注文を作って明細を1つ足し、確定してから、4つの経路で明細を足しています。</p>
          <Code lang="text" title="実行結果（明細の検証を足す前）" code={bypassRun} />
          <p>止まったのは <code>add_line!</code> だけでした。<code>OrderLine.create!</code>、関連を通した <code>order.lines.create!</code>、一括挿入の <code>insert_all</code> は例外なく実行され、確定済みの注文に明細が4つ並び、合計が 1,200 円から 2,600 円に変わりました。Ruby には、あるクラスを特定のクラスからしか使わせない仕組みがないので、規則をルートのメソッドに書いただけでは、ほかの経路を止められません。</p>
          <p>そこで、明細の側にも同じ規則の検証を足しました。</p>
          <Code lang="ruby" title="明細の作成時に、注文の状態を確かめる" code={guardCode} />
          <Code lang="text" title="実行結果（RSpec。後の節の仕様も含む）" code={aggregateSpecOutput} />
          <p>検証を足すと <code>OrderLine.create!</code> は <code>ActiveRecord::RecordInvalid</code> で止まりましたが、<code>insert_all</code> は止まりません。Rails の API ドキュメントは、<code>insert_all</code> はモデルを作らず、コールバックも検証も実行しないと書いています<Ref n={11} />。<code>update_all</code> も同じです<Ref n={11} />。経路ごとに、どの設計で止まったかを図 {figure(4)} にまとめました。右の列の <code>OrderStore</code> は後の「Repository が有効な条件」の節で作る、集約の単位でしか保存させない Repository です。</p>
          <Figure n={figure(4)} title="ルートを通らない変更と、止められる設計" caption="左の2列はこの章のアプリ（Rails 8.1.4.1・SQLite）での実行結果。OrderStore の列は、明細の行のクラスを OrderStore の中にだけ置く設計を想定したもので、NameError と const_get の2点を実行して確かめた。「通る」の行は、コードレビューと DB の制約で補う必要がある。">
            <BypassFigure />
          </Figure>
          <p>アプリケーションのコードで規則を確かめた直後に、別の要求が同じ注文を確定することもあります。この競合はモデルの検証では防げず、DB の行ロックや楽観ロックで検出します（<ChapterLink n={38} />、<ChapterLink n={49} />）。業務の規則がなぜ変更を許さないかはモデルに書き、同時に更新されたときの結果は DB の仕組みで確かめる、という分担になります。集約を小さくすると、1回の変更でロックする行が減ります。その代わり、集約の外の情報（出荷の状態など）は遅れて反映されるので、利用者がその間に見る状態を決めておきます。</p>
        </>
      ),
    },
    {
      id: "repository",
      title: "Active Record と Repository の責務の重なり",
      body: (
        <>
          <p><Term en="Repository">リポジトリ</Term>は、業務のオブジェクトの読み込みと保存を、オブジェクトの集まりを扱うような操作で提供する部品です。Fowler の PoEAA は、業務のモデルとデータの対応付けの間を取り持つ部品として説明しています<Ref n={2} />。一方、Rails のモデルは Active Record パターンで作られていて、1つのクラスが行の読み込み、保存、業務の規則を持っています<Ref n={8} />。そのため、Repository が提供する操作の多くは、Active Record にすでにあります。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th scope="col">Repository の責務</th><th scope="col">Active Record での書き方</th><th scope="col">重ならない部分</th></tr>
              </thead>
              <tbody>
                <tr><th scope="row">ID で探す</th><td><code>Order.find(id)</code></td><td>返す型（Active Record か、業務の値か）</td></tr>
                <tr><th scope="row">条件に名前を付けて探す</th><td>スコープ <code>Order.awaiting_shipment</code></td><td>呼び出し側が条件を足せるか</td></tr>
                <tr><th scope="row">読み込み方を決める</th><td><code>includes</code> を呼び出し側が書く</td><td>読み込み方を誰が決めるか</td></tr>
                <tr><th scope="row">保存する</th><td><code>save!</code>・関連の <code>autosave</code></td><td>保存の単位を集約に限るか</td></tr>
                <tr><th scope="row">保存先を隠す</th><td>DB のアダプター（MySQL・SQLite）</td><td>DB 以外の保存先を同じ操作で扱うか</td></tr>
              </tbody>
            </table>
          </div>
          <p>表の右の列が Repository を置いたときに変わるところです。Event を例にした同じ比較は<ChapterLink n={44} section="repository" />にあります。ここでは、出荷指示を作る処理を2通りに書いて、実際に何が変わるかを確かめます。倉庫 1 の出荷待ちの注文を、明細つきで読み出す処理です。</p>
          <Code lang="ruby" title="同じ処理を Active Record（A）と Repository（B）で書く" code={compareCode} />
          <p>データは倉庫 1 に確定済みの注文が4件（明細は合わせて9行）、倉庫 2 に1件ある状態です。SQL の回数は <code>ActiveSupport::Notifications</code> で <code>sql.active_record</code> を数えました。</p>
          <Code lang="text" title="実行結果（bin/rails runner）" code={compareRun} />
          <p>A と B は同じ結果を返し、SQL はどちらも2回（注文の SELECT と、明細をまとめて読む SELECT）でした。違いは呼び出し側が受け取るものにあります。A の呼び出し側は Relation と Active Record のオブジェクトを受け取るので、条件を足すことも、<code>update!</code> で書き換えることもできます。<code>includes</code> を書き忘れると、注文ごとに明細を読む SQL が出て5回になりました（N+1 の仕組みは<ChapterLink n={13} />）。B の呼び出し側は凍結された <code>Data</code> の値を受け取るので、読むことしかできず、読み込み方は Repository の中で一度だけ決まります。</p>
          <p>最後の例は、Repository が Relation をそのまま返す書き方です。呼び出し側が <code>update_all</code> を続けて書け、確定済みの注文をまとめて <code>shipped</code> に変える UPDATE が実行されました。モデルの規則も検証も通っていません。Repository を置くなら、返す値を Active Record から切り離すかどうかを最初に決めます。切り離さないなら、スコープと同じことを別の名前で呼んでいるだけになります。</p>
          <Ref n={3} />
        </>
      ),
    },
    {
      id: "repository-cost",
      title: "Repository で包むと変わること",
      body: (
        <>
          <p>前の節の B は呼び出し側から書き換えの手段を取り上げ、読み込み方を1か所に決めました。その代わりに、呼び出し側が自由に使えた機能も使えなくなっています。図 {figure(5)} に、2つの書き方で呼び出し側にできることを並べました。</p>
          <Figure n={figure(5)} title="Active Record をそのまま使う場合と Repository で包む場合" caption="前の節の実行結果をまとめた図。SQL の回数は確定済みの注文4件での値。">
            <CompareFigure />
          </Figure>
          <p>たとえば、出荷指示の画面に「50件ずつ表示する」という要件が加わったとします。A なら呼び出し側で <code>.limit(50).offset(...)</code> を足せば済みます。B では Repository の <code>awaiting_shipment</code> に <code>limit:</code> と <code>offset:</code> の引数を足すか、ページ送り用のメソッドを新しく作ります。「重い注文を先に」「特定の SKU を含むものだけ」と条件が増えるたびに、Repository のメソッドか引数が増えます。行ロックをかけて読みたい場合も、<code>lock</code> を足したメソッドを別に用意します。</p>
          <p>反対に、B の利点は、呼び出し側が何十か所あっても読み込み方と返す形が1か所で決まることです。明細を読む <code>includes</code> を書き忘れる N+1 は B では起きませんでした。返す値を変更できないので、出荷指示を作る処理が誤って注文の状態を書き換えることもありません。Jimmy Bogard は Microsoft の解説への意見として、Repository は永続化の仕組みが持つ重要な詳細を隠してしまうので好まない、本物の DB を使う結合テストはどのみち必要だ、と述べています<Ref n={7} />。同じ解説は、Repository は役に立つことがあるが、集約やリッチなドメインモデルほど DDD の設計に欠かせないものではないと結んでいます<Ref n={7} />。</p>
          <p>Repository で包むと、呼び出し側の自由と引き換えに、読み込み方と書き換えの経路を1か所で管理できるようになります。この交換が得になるのは、呼び出し側が多く、読み込み方の誤りや意図しない書き換えが実際に起きている場合です。呼び出し側が1つか2つで、画面ごとに検索の条件が違うなら、スコープや Query Object（<ChapterLink n={33} section="query-objects" />）のほうが変更は小さく済みます。</p>
        </>
      ),
    },
    {
      id: "when-effective",
      title: "Repository が有効な条件",
      body: (
        <>
          <p>Active Record に Repository を重ねる理由がはっきりしているのは、次の3つの条件です。どれも、Active Record だけでは表せない取り決めを Repository が引き受けます。</p>
          <h3>1. 保存先が複数ある</h3>
          <p>直近の注文は DB に置き、1年より前の注文は DB から外してファイル（実際の運用ではオブジェクトストレージなど）に移すとします。注文履歴の画面では、注文がどちらにあるかを気にせずに読めれば、呼び出し側のコードが増えません。次の <code>OrderHistory</code> は DB を探してなければ JSON ファイルを探し、どちらから読んだ場合も同じ <code>Entry</code> の値を返します。</p>
          <Code lang="ruby" title="DB とファイルの2か所から読む Repository" code={historyCode} />
          <Code lang="text" title="実行結果" code={historyRun} />
          <p>注文 7 は、移す前は DB から（<code>source=:db</code>）、移した後はファイルから（<code>source=:archive</code>）読まれ、呼び出し側のコードは同じ <code>find(7)</code> のままでした。Active Record のモデルは1つの DB のテーブルと対応するので、保存先が2つになると、どちらを探すかの判断を呼び出し側に書くことになります。この判断を1か所に置けることが、この場合の Repository の役目です。</p>
          <h3>2. 集約の単位でしか保存させたくない</h3>
          <p>前の節の図 {figure(4)} では、明細の検証を足しても <code>insert_all</code> が通りました。明細の行のクラスを外から参照できなくすれば、この経路も減らせます。Microsoft の解説は、集約のルートごとに1つの Repository を作り、データベースのテーブルごとに Repository を作ってはいけないと書いています<Ref n={7} />。次の <code>Sales::OrderStore</code> は、明細の行のクラス <code>LineRecord</code> を Ruby の <code>private_constant</code> で隠し、注文の単位でだけ読み書きします<Ref n={10} />。ルートの <code>Sales::Order</code> は Active Record を継承しない普通のクラスで、明細は <code>Data</code> の値です。</p>
          <Code lang="ruby" title="集約のルートの単位でだけ保存する Repository" code={storeCode} />
          <Code lang="text" title="実行結果（save の SQL と、行のクラスの参照）" code={storeRun} />
          <p>保存は1つのトランザクションの中で、明細を消して入れ直しています。<code>Sales::OrderStore::LineRecord</code> と書くと <code>NameError</code> になり、外のコードは明細の行を直接作れません。ただし <code>const_get</code> を使えば取り出せたので、意図して迂回するコードは防げません。また、SQLite では <code>lock</code> を付けても SELECT に <code>FOR UPDATE</code> が付きません。MySQL なら付くので、同時の更新を本物の DB で確かめます。</p>
          <p>この設計の費用は<ChapterLink n={108} section="full-adoption" />で数えたものと同じ種類です。行とルートの間の詰め替え、明細を全部消して入れ直す保存（明細が多いと書き込みが増える）、Active Record の検証やフォームとの連携を使えないこと、です。規則が複雑で、明細を書き換える経路が実際に複数あり、誤りが起きているときに、この費用を払う理由があります。</p>
          <h3>3. 永続化の方法を差し替える</h3>
          <p>注文の管理を社内の DB から外部の受注管理サービスの API に移す計画があるとします。呼び出し側が <code>find</code> と <code>save</code> だけを使っていれば、DB を使う実装と API を使う実装を差し替えられます。このとき、2つの実装が同じ約束を守るかを、同じ RSpec の共有の例で確かめる方法は<ChapterLink n={108} section="contracts" />で示しました。API の応答の形をアプリの値に変える部分は<ChapterLink n={42} />の Adapter です。計画が具体的でないうちに差し替えに備えて作ることは、次の節の「有効でない条件」に当たります。</p>
        </>
      ),
    },
    {
      id: "when-not",
      title: "Repository が有効でない条件",
      body: (
        <>
          <p>次のような状況では、Repository を足しても変わる理由が減らず、読む箇所だけが増えます。</p>
          <ul>
            <li>Active Record のオブジェクトをそのまま返す：<code>OrderRepository#find</code> が <code>Order.find</code> を呼んで返すだけなら、呼び出し側は <code>order.lines.create!</code> も <code>update!</code> も使えます。図 {figure(4)} のルートを通らない経路はすべて残り、Repository とモデルの2つの API を保守することになります。DHH の思想を扱う<ChapterLink n={31} section="monolith" />でも、取得を中継するだけの Repository を全モデルに作ることを、読む箇所が増えるだけの設計として退けています。</li>
            <li>テーブルごとに Repository を作る：<code>OrderRepository</code> と <code>OrderLineRepository</code> を別々に作ると、明細だけを保存する経路ができ、集約の規則を守らせる目的と逆になります<Ref n={7} />。</li>
            <li>汎用の Repository：<code>Repository.new(Order).where(...)</code> のように Active Record の操作をそのまま転送するクラスは、業務の言葉を持たず、隠すべき詳細も隠しません。</li>
            <li>画面の入力をそのまま保存する CRUD：管理画面の商品マスタの編集のように、検証と保存だけで済む機能では、<code>form_with model:</code> と <code>save</code> の組み合わせがもっとも少ないコードで済みます。</li>
          </ul>
          <p>もう1つ、よく挙がる理由が「テストを DB なしで速くしたい」です。この章のアプリで、同じ規則（確定後は明細を足さない）を確かめる 200 例のテストを、DB に保存して確かめる書き方と、メモリー上の <code>Sales::Order</code> で確かめる書き方で、3回ずつ実行しました。</p>
          <Code lang="text" title="実行結果（WSL2 上の Docker、Ruby 4.0.9、SQLite、各 200 例）" code={speedRun} />
          <p>DB を使うテストは 200 例で 1.0〜2.1 秒（1例あたり約 5〜10 ミリ秒）、メモリー上のテストは約 0.03 秒でした。差は約 30〜70 倍ありますが、DB を使うテストでも1例は 10 ミリ秒前後で、Rails のテストは例ごとにトランザクションを開始して最後に取り消すので、テストのデータを消す手間もかかりません（<ChapterLink n={20} section="transaction" />）。数千例では数十秒の差になるので、規則の数が多いアプリでは無視できない差です。ただし、この場合も Repository を作るより、規則の計算に必要な値だけを引数で受け取るクラスに分けるほうが小さく済みます（<ChapterLink n={45} section="idea" />）。メモリー上のテストでは DB の一意制約、ロック、トランザクションの振る舞いを確かめないので、それらは本物の DB のテストで別に確かめます。</p>
        </>
      ),
    },
    {
      id: "cross-context",
      title: "受注を確定した後に出荷へ伝える",
      body: (
        <>
          <p>受注のコードから <code>Shipping::Shipment.where(state: "waiting").find_by(order_ref: ...)</code> を広く呼べるようにすると、出荷のモデルの状態名や検索の条件が受注側にも広がります。倉庫を増やしたときに出荷を注文単位から明細単位に変えると、受注側の条件も直すことになります。そこで、受注から出荷へは出荷側が決めた形の値を渡し、どの単位で出荷するかは出荷側に任せます。</p>
          <Code lang="ruby" title="受注の注文を出荷依頼に変えて受け取る" code={intakeCode} />
          <Code lang="text" title="実行結果" code={intakeRun} />
          <p><code>request_from</code> が受注の言葉（注文・明細・単価）を出荷の言葉（出荷依頼・SKU・数量）に変え、単価は渡しません。<code>accept</code> は <code>order_ref</code> の一意制約と <code>create_or_find_by!</code> を使っているので、同じ依頼を2回受け取っても出荷は1件のままでした。受注の確定と出荷依頼の作成を別々のジョブや別の時点で行うと、同じ依頼が2回届くことがあるので、受け取る側で重複を吸収しておきます（<ChapterLink n={52} />）。</p>
          <p>同じ Rails のプロセスで動かすなら、受注を確定した直後に <code>Shipping::Intake.accept</code> を呼ぶことから始められます。確定を知らせる出来事（ドメインイベント）として出し、出荷側がそれを受け取る形にすると、受注は出荷の存在を知らずに済みます（<ChapterLink n={51} />）。非同期にした場合は、注文の確定が見えてから出荷が作られるまでに時間差ができます。両方が同時に完了して見えることが業務の条件なら、1つのトランザクションに入れるか、時間差の間に利用者に見せる状態を決めます。確定と通知を確実に両方行う方法は<ChapterLink n={116} section="pattern" />で比べています。</p>
          <p>反対に、出荷の変更がいつも受注の仕様と一緒に変わり、1つのトランザクションで守る条件も多いなら、境界に変換を足すと変更箇所が増えるだけです。どの条件を独立して決める必要があるか、受注と出荷でいう「確定」が業務でどう違うかを、具体的な変更の依頼から判断します。</p>
        </>
      ),
    },
    {
      id: "rails-philosophy",
      title: "Rails の設計思想と DDD",
      body: (
        <>
          <p>Rails は Active Record パターンを中心に置き、モデルに業務の規則と保存の両方を持たせます。Rails Doctrine の「No one paradigm」は、一つの設計の考え方の純粋さにこだわらないという立場です（<ChapterLink n={31} section="doctrine" />）。DHH は2014年の記事で、テストを速くするために Repository やコマンドのオブジェクトを挟む設計を、設計を分かりにくくするものとして批判しました<Ref n={12} />。DDD の戦術的設計の部品のうち、Repository はこの立場ともっとも衝突しやすい部品です。</p>
          <p>一方で、DDD の戦略的設計（ユビキタス言語、境界づけられたコンテキスト）は、Active Record と衝突しません。業務の言葉をモデルとメソッドの名前に使うことは、<ChapterLink n={31} section="model-api" />で扱った、モデルを業務の API として扱う書き方とも一致します。コンテキストを名前空間で分けることも、Convention over Configuration の範囲で書けます。<code>app/models/shipping/shipment.rb</code> に <code>Shipping::Shipment</code> を置けば、設定なしで読み込まれます。</p>
          <p>戦術的設計の部品も Rails の部品に当てはめると次のようになります。エンティティと集約のルートは Active Record のモデル、値オブジェクトは <code>Data</code> や <code>composed_of</code>、ドメインサービスはモデルの外の Ruby のモジュール、リポジトリはスコープとクラスメソッドです。Repository のクラスを別に作るのは、前の節までに挙げた条件（複数の保存先、集約の単位での保存、永続化の差し替え）が実際にあるときに限ります。<ChapterLink n={34} section="rails-way-ddd" />でも、DDD を部分的に取り入れる形を、Rails との相性がよい選択として整理しています。</p>
        </>
      ),
    },
    {
      id: "decision",
      title: "判断基準とトレードオフ",
      body: (
        <>
          <p>DDD の考え方は戦略的設計から取り入れると費用が小さく済みます。業務の言葉とコードの名前を揃え、意味の違う言葉が見つかったら名前空間で分けます。戦術的設計の部品は、値オブジェクトとドメインサービスは Rails の規約の中で書けますが、集約の規則を守らせる仕組みと Repository は、費用と効果を比べてから入れます。</p>
          <Figure n={figure(6)} title="Repository を置くかの判断" caption="この章の判断をまとめた模式図。上の行から順に当てはめ、最初に当てはまった行の手段から試す。">
            <DecisionFigure />
          </Figure>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th scope="col">選択</th><th scope="col">得られるもの</th><th scope="col">失うもの・増えるもの</th></tr>
              </thead>
              <tbody>
                <tr><th scope="row">Active Record をそのまま使う</th><td>スコープの組み合わせ、<code>includes</code>、<code>lock</code>、フォームとの連携を呼び出し側が自由に使える</td><td>読み込み方と書き換えの経路が呼び出し側に散らばる</td></tr>
                <tr><th scope="row">明細の検証などでルートの規則を補う</th><td>規約の中で、<code>create!</code> などのルートを通らない経路を止められる</td><td><code>insert_all</code>・<code>update_all</code> は止まらない。規則が2か所に書かれる</td></tr>
                <tr><th scope="row">Repository で包み、値を返す</th><td>読み込み方と返す形を1か所で決め、書き換えの経路を絞れる</td><td>条件ごとのメソッド、詰め替えのコード、Active Record の機能の再実装</td></tr>
              </tbody>
            </table>
          </div>
          <p>実務で迷ったら、次の順に確かめます。最初に、困っていることが「言葉のずれ」なのか「ルートを通らない変更」なのか「保存先の違い」なのかを分けます。言葉のずれなら名前とコンテキストを直し、ルートを通らない変更ならモデルの検証と DB の制約で止められるかを試し、それでも塞げない経路が実際に問題を起こしているときに、集約の単位で保存する Repository を検討します。保存先の違いがあるなら、その部分にだけ Repository を置きます。</p>
          <p>初めから境界を正確に決められるとは限りません。どの文脈で「出荷待ち」や「確定」と呼ぶか、どの条件を変更の前後で保つかを、実際に来た変更の依頼から確かめ、モデルの言葉を変えたら、画面とコードで同じ判断を指しているかも確かめます。</p>
          <p>関連する章：<ChapterLink n={30} section="model-boundaries" />、<ChapterLink n={33} />、<ChapterLink n={34} section="rails-way-ddd" />、<ChapterLink n={38} />、<ChapterLink n={44} section="repository" />、<ChapterLink n={48} />、<ChapterLink n={51} />、<ChapterLink n={108} />、<ChapterLink n={110} />。</p>
          <Callout kind="note" title="この章の実行環境">
            <p>コードは Docker の ruby:4.0 イメージ（Ruby 4.0.9）で、Rails 8.1.4.1 の <code>rails new --minimal</code> で作ったアプリに rspec-rails 8.1.0 を入れて実行しました。DB は SQLite 3 です。テストの時間は WSL2 上の Docker で測った値で、マシンや DB によって変わります。</p>
          </Callout>
        </>
      ),
    },
  ],
  sources: [
    {
      title: "Domain-Driven Design Reference",
      publisher: "Eric Evans（Domain Language）",
      url: "https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf",
      accessed: "2026-11-27",
      version: "2015年3月版",
      note: "ユビキタス言語、境界づけられたコンテキスト、コンテキストマップ、Anticorruption Layer、集約などのパターンの要約。",
    },
    {
      title: "Repository",
      publisher: "Martin Fowler（Patterns of Enterprise Application Architecture のカタログ）",
      url: "https://www.martinfowler.com/eaaCatalog/repository.html",
      accessed: "2026-11-27",
      version: "Patterns of Enterprise Application Architecture",
      note: "業務のモデルとデータの対応付けの間を取り持つ Repository の役割。",
    },
    {
      title: "Active Record Query Interface",
      publisher: "Ruby on Rails Guides",
      url: "https://guides.rubyonrails.org/v8.1/active_record_querying.html",
      accessed: "2026-11-27",
      version: "Rails 8.1",
      note: "スコープ、includes による関連の読み込み、Relation、ロック。",
    },
    {
      title: "BoundedContext",
      publisher: "Martin Fowler（bliki）",
      url: "https://martinfowler.com/bliki/BoundedContext.html",
      accessed: "2026-11-27",
      version: "2014年1月15日",
      note: "大きなシステムを境界づけられたコンテキストに分け、それぞれが統一されたモデルを持つこと、電力会社の「メーター」の例、コンテキストマップで関係を描くこと、ユビキタス言語との関係。",
    },
    {
      title: "EvansClassification",
      publisher: "Martin Fowler（bliki）",
      url: "https://martinfowler.com/bliki/EvansClassification.html",
      accessed: "2026-11-27",
      version: "2005年12月14日",
      note: "エンティティ（時間がたっても続く同一性を持つ）、値オブジェクト（属性の組み合わせだけが意味を持つ）、サービス（ドメインの中の独立した操作）の定義。",
    },
    {
      title: "DDD_Aggregate",
      publisher: "Martin Fowler（bliki）",
      url: "https://martinfowler.com/bliki/DDD_Aggregate.html",
      accessed: "2026-11-27",
      version: "2013年4月23日",
      note: "集約がひとまとまりとして扱うオブジェクトの集まりであること、ルート、外からの参照はルートにだけ向けること、トランザクションは集約の境界をまたがないこと、集約の単位で読み書きすること。",
    },
    {
      title: "Designing the infrastructure persistence layer / Designing a DDD-oriented microservice",
      publisher: "Microsoft Learn（.NET Microservices Architecture for Containerized .NET Applications）",
      url: "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design",
      accessed: "2026-11-27",
      version: "2018年10月8日版（DDD-oriented microservice は 2021年1月13日版）",
      note: "集約のルートごとに1つの Repository を作り、テーブルごとには作らないこと、Repository は必須ではないこと、Jimmy Bogard の意見（永続化の重要な詳細を隠す、本物との結合テストは必要）。DDD-oriented microservice の節で、DDD は業務の規則が多い複雑なサービスに使い、単純な CRUD はより単純な方法で扱えること。",
    },
    {
      title: "Active Record",
      publisher: "Martin Fowler（Patterns of Enterprise Application Architecture のカタログ）",
      url: "https://www.martinfowler.com/eaaCatalog/activeRecord.html",
      accessed: "2026-11-27",
      version: "Patterns of Enterprise Application Architecture",
      note: "テーブルの1行を包み、DB へのアクセスを隠し、データに業務のロジックを加えるオブジェクト。",
    },
    {
      title: "class Data",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/Data.html",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "Data.define で作るオブジェクトが変更できず、同じ値なら == で等しいこと。実行例は Ruby 4.0.9 で確認。",
    },
    {
      title: "Module#private_constant",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/Module.html#method-i-private_constant",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "定数を private にし、外から Mod::Const の形で参照すると NameError になること。const_get では取り出せることは Ruby 4.0.9 で確認。",
    },
    {
      title: "activerecord/lib/active_record/relation.rb（insert_all・update_all のドキュメント）",
      publisher: "rails/rails（GitHub）",
      url: `${GH}/activerecord/lib/active_record/relation.rb#L672-L675`,
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: "insert_all がモデルを作らず、コールバックも検証も実行しないこと。573〜576行目で update_all も同様であること。",
    },
    {
      title: "Test-induced design damage",
      publisher: "David Heinemeier Hansson",
      url: "https://dhh.dk/2014/test-induced-design-damage.html",
      accessed: "2026-11-27",
      version: "2014年4月29日",
      note: "テストのために Repository やコマンドを挟む設計への批判。",
    },
  ],
}

export default chapter
