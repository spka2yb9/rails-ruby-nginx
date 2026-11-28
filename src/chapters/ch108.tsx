import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const figure = (n: number) => `${chapterNumber(108)}-${n}`

/* ---------- 図1 4つの層と、注文の確定で各層が受け持つ処理 ---------- */
function LayersFigure() {
  const rows = [
    ['プレゼンテーション層', 'HTTP の入力と応答', 'params[:id] を読み、JSON と状態コードを返す'],
    ['アプリケーション層', '処理の順序を決める', '注文を読む → 支払いを問い合わせる → 確定 → 保存'],
    ['ドメイン層', '業務の規則を判断する', '支払い済みで保留中の注文だけを確定できる'],
    ['インフラストラクチャ層', 'DB・外部 API と通信する', 'orders の UPDATE、決済サービスへの GET'],
  ]
  return (
    <Svg id={figure(1)} w={780} h={330} label="上から、プレゼンテーション層、アプリケーション層、ドメイン層、インフラストラクチャ層の4つの層を縦に並べた図。上の層が下の層を呼ぶ。右の列は注文の確定で各層が受け持つ処理で、params を読んで JSON を返す処理、読む・問い合わせる・確定・保存の順序、支払い済みで保留中の注文だけを確定できるという規則、orders テーブルの UPDATE と決済サービスへの GET が並ぶ">
      <T x={20} y={16} fs={12} tone="muted">層（上の層が下の層を呼ぶ）</T>
      <T x={300} y={16} fs={12} tone="muted">注文の確定でこの層が受け持つ処理</T>
      {rows.map(([name, role, example], i) => {
        const y = 32 + i * 72
        return (
          <g key={name}>
            <Box x={20} y={y} w={240} h={54} lines={[name, role]} fs={13} bold subTone="muted" fill={i === 3 ? 'box4' : i === 2 ? 'box5' : 'box'} />
            <Box x={300} y={y} w={460} h={54} lines={example} fs={12.5} fill="bg" />
            <Arrow x1={260} y1={y + 27} x2={298} y2={y + 27} dashed />
            {i < 3 && <Arrow x1={140} y1={y + 54} x2={140} y2={y + 70} />}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図2 Rails の部品と4つの層の対応 ---------- */
function RailsMappingFigure() {
  return (
    <Svg id={figure(2)} w={780} h={330} label="左に4つの層、右に Rails の部品を並べた対応表の図。プレゼンテーション層はルーティング・コントローラー・ビュー。アプリケーション層には Rails の既定の置き場所がなく、コントローラーのアクション、モデルのメソッド、app/services などに置く。ドメイン層とインフラストラクチャ層の両方に、Active Record のモデル Order がまたがる。Order は業務のメソッドと保存を1つのクラスに持ち、祖先75個のうち61個が ActiveRecord と ActiveModel のモジュールだった。インフラストラクチャ層には、ほかに DB のアダプター、Active Job のアダプター、Net::HTTP がある">
      {['プレゼンテーション層', 'アプリケーション層', 'ドメイン層', 'インフラストラクチャ層'].map((name, i) => (
        <Box key={name} x={20} y={20 + i * 74} w={200} h={60} lines={name} fs={13} bold fill={i === 3 ? 'box4' : 'box'} />
      ))}
      <Box x={250} y={20} w={510} h={60} lines={['ルーティング・コントローラー・ビュー', 'config/routes.rb、app/controllers、app/views']} fs={13} subTone="muted" />
      <Box x={250} y={94} w={510} h={60} dashed fill="bg" lines={['Rails が決めた置き場所はない', 'アクション、モデルのメソッド、app/services などに置く']} fs={13} subTone="muted" />
      <Box x={250} y={168} w={320} h={134} accent fill="box5" lines={['Active Record のモデル（Order）', '業務のメソッド confirm! と検証', '保存 update!・検索 find・関連', '祖先 75 個のうち 61 個が', 'ActiveRecord・ActiveModel']} fs={12.5} bold subTone="muted" />
      <Box x={590} y={242} w={170} h={60} fill="box4" lines={['DB のアダプター', 'Active Job、Net::HTTP']} fs={12} subTone="muted" />
      <T x={590} y={190} fs={11.5} tone="muted">1つのクラスが</T>
      <T x={590} y={208} fs={11.5} tone="muted">2つの層にまたがる</T>
    </Svg>
  )
}

/* ---------- 図3 呼び出しの向きとソースコードの依存の向き ---------- */
function DependencyFigure() {
  const panel = (x: number, title: string, clean: boolean) => (
    <g>
      <T x={x} y={18} bold>{title}</T>
      <Box x={x} y={34} w={330} h={44} lines={['コントローラー', 'params を Input に変える']} fs={12.5} subTone="muted" />
      <Box x={x} y={104} w={330} h={44} lines={['確定のユースケース', 'ConfirmOrder']} fs={12.5} subTone="muted" mono={false} />
      <Box x={x} y={174} w={clean ? 200 : 330} h={44} lines={clean ? ['orders の取り決め', 'find(id)・save(order)'] : ['業務の規則と保存', 'Order < ApplicationRecord']} fs={12.5} subTone="muted" fill={clean ? 'box5' : 'box'} dashed={clean} />
      <Box x={x} y={244} w={330} h={44} lines={clean ? ['保存の実装（外側）', 'Persistence::OrderRepository'] : ['DB', 'orders テーブル']} fs={12.5} subTone="muted" fill="box4" />
      <Arrow x1={x + 60} y1={78} x2={x + 60} y2={102} />
      <Arrow x1={x + 60} y1={148} x2={x + 60} y2={172} />
      <Arrow x1={x + 60} y1={218} x2={x + 60} y2={242} />
      <Arrow x1={x + 270} y1={78} x2={x + 270} y2={102} dashed />
      <Arrow x1={clean ? x + 170 : x + 270} y1={148} x2={clean ? x + 170 : x + 270} y2={172} dashed />
      {clean ? (
        <Arrow x1={x + 270} y1={244} x2={x + 190} y2={220} dashed accent />
      ) : (
        <Arrow x1={x + 270} y1={218} x2={x + 270} y2={242} dashed accent />
      )}
    </g>
  )
  return (
    <Svg id={figure(3)} w={780} h={350} label="左は伝統的なレイヤードで、実行時の呼び出し（実線）もソースコードの依存（破線）も上から下へ向き、業務の規則を持つ Order が DB の層に依存する。右は Clean Architecture で、呼び出しは同じく上から下へ進むが、保存の実装 Persistence::OrderRepository が内側の orders の取り決め（find と save）に合わせて書かれ、最下段の破線だけが下から上へ向く">
      {panel(20, '伝統的なレイヤード', false)}
      {panel(430, 'Clean Architecture', true)}
      <line x1={20} y1={312} x2={50} y2={312} stroke="var(--fig-line)" strokeWidth={1.5} />
      <T x={58} y={312} fs={11.5}>実線：実行時の呼び出し</T>
      <line x1={240} y1={312} x2={270} y2={312} stroke="var(--fig-line)" strokeWidth={1.5} strokeDasharray="5 4" />
      <T x={278} y={312} fs={11.5}>破線：ソースコードが相手の名前や仕様を知っている</T>
      <T x={20} y={336} fs={11.5} tone="muted">強調した破線が左右で逆向きになる。右では DB 側のコードが内側の取り決めを知り、内側は DB を知らない</T>
    </Svg>
  )
}

/* ---------- 図4 ポートとアダプター ---------- */
function HexagonFigure() {
  const cx = 390
  const cy = 175
  const r = 120
  const pts = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (Math.PI / 3) * i
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  })
  return (
    <Svg id={figure(4)} w={780} h={360} label="中央の六角形がアプリケーションの中心で、Ordering::Order と ConfirmOrder がある。左は中心を動かす側で、CleanOrdersController、RSpec の confirm_order_spec、rake タスクが、確定の操作 call(Input) を呼ぶ。右は中心から使われる側で、orders ポート（find・save）を Persistence::OrderRepository（SQLite）と MemoryOrderRepository（テスト）が実装し、payments ポート（captured?）を HttpPaymentStatus（決済サービス）と FakePayments（テスト）が実装する">
      <polygon points={pts.join(' ')} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={cx} y={cy - 26} anchor="middle" bold>app/core</T>
      <T x={cx} y={cy - 4} anchor="middle" fs={12} mono>Ordering::Order</T>
      <T x={cx} y={cy + 16} anchor="middle" fs={12} mono>ConfirmOrder</T>
      <T x={cx} y={cy + 40} anchor="middle" fs={11} tone="muted">Rails を参照しない</T>
      <T x={20} y={20} fs={12} tone="muted">中心を動かす側（driving）</T>
      <T x={560} y={20} fs={12} tone="muted">中心から使われる側（driven）</T>
      <Box x={20} y={60} w={210} h={44} lines={['CleanOrdersController', 'HTTP の要求']} fs={12} subTone="muted" />
      <Box x={20} y={150} w={210} h={44} lines={['RSpec', 'confirm_order_spec']} fs={12} subTone="muted" />
      <Box x={20} y={240} w={210} h={44} dashed lines={['rake タスク', 'この章では作っていない']} fs={12} subTone="muted" />
      <Box x={252} y={160} w={48} h={30} lines="call" fs={11.5} mono fill="bg" accent />
      <Arrow x1={230} y1={82} x2={262} y2={158} />
      <Arrow x1={230} y1={172} x2={250} y2={175} />
      <Arrow x1={230} y1={262} x2={262} y2={192} dashed />
      <Box x={466} y={100} w={92} h={30} lines="orders" fs={11.5} mono fill="bg" accent />
      <Box x={466} y={222} w={92} h={30} lines="payments" fs={11.5} mono fill="bg" accent />
      <Box x={590} y={44} w={170} h={44} fill="box4" lines={['OrderRepository', 'SQLite の orders']} fs={12} subTone="muted" />
      <Box x={590} y={110} w={170} h={44} dashed lines={['MemoryOrderRepository', 'テスト用']} fs={11.5} subTone="muted" />
      <Box x={590} y={196} w={170} h={44} fill="box4" lines={['HttpPaymentStatus', '決済サービスへ GET']} fs={12} subTone="muted" />
      <Box x={590} y={262} w={170} h={44} dashed lines={['FakePayments', 'テスト用']} fs={12} subTone="muted" />
      <Arrow x1={558} y1={115} x2={588} y2={70} />
      <Arrow x1={558} y1={115} x2={588} y2={130} dashed />
      <Arrow x1={558} y1={237} x2={588} y2={218} />
      <Arrow x1={558} y1={237} x2={588} y2={282} dashed />
      <T x={20} y={330} fs={11.5} tone="muted">アクセント枠はポート（中心が決めた取り決め）。右の箱はそれぞれの取り決めを実装するアダプターで、本番とテストで差し替える</T>
    </Svg>
  )
}

/* ---------- 図5 1つの機能で増えたファイルと行数 ---------- */
function CostFigure() {
  const rows = [
    { name: 'Rails Way', prod: [3, 25], test: [2, 23], change: '2 ファイル（+4 −2）' },
    { name: '部分採用', prod: [5, 56], test: [4, 69], change: '未実行（Rails Way と同じ形）' },
    { name: '全面採用', prod: [9, 116], test: [8, 128], change: '5 ファイル（+12 −8）' },
  ]
  const scale = 1.5
  const x0 = 130
  return (
    <Svg id={figure(6)} w={780} h={300} label="注文の確定という1つの機能について、空行を除いた行数を比べた横棒グラフ。Rails Way は本番のコード3ファイル25行とテスト2ファイル23行。外部 API の境界だけに取り入れた部分採用は本番5ファイル56行とテスト4ファイル69行。全面採用は本番9ファイル116行とテスト8ファイル128行。応答に配送メモの列を足す変更では、Rails Way が2ファイル、全面採用が5ファイルを変えた">
      <T x={x0} y={18} fs={12} tone="muted">空行を除いた行数</T>
      <rect x={250} y={12} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={270} y={18} fs={12}>本番のコード</T>
      <rect x={360} y={12} width={14} height={12} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={380} y={18} fs={12}>テスト</T>
      <T x={560} y={18} fs={12} tone="muted">列を1つ足したときの変更</T>
      {rows.map((r, i) => {
        const y = 44 + i * 78
        return (
          <g key={r.name}>
            <T x={20} y={y + 22} bold fs={13}>{r.name}</T>
            <rect x={x0} y={y} width={r.prod[1] * scale} height={20} rx={3} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={x0 + r.prod[1] * scale + 8} y={y + 10} fs={11.5}>{`${r.prod[0]} ファイル ${r.prod[1]} 行`}</T>
            <rect x={x0} y={y + 26} width={r.test[1] * scale} height={20} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={x0 + r.test[1] * scale + 8} y={y + 36} fs={11.5}>{`${r.test[0]} ファイル ${r.test[1]} 行`}</T>
            <T x={560} y={y + 22} fs={12} tone={i === 1 ? 'muted' : undefined}>{r.change}</T>
          </g>
        )
      })}
      <T x={20} y={270} fs={11.5} tone="muted">この章の最小アプリで数えた値。部分採用と全面採用のテストは決済の契約テスト（2ファイル34行）を含む</T>
      <T x={20} y={288} fs={11.5} tone="muted">ポートを表すクラスや DTO を別ファイルにする書き方では、全面採用のファイルはさらに増える</T>
    </Svg>
  )
}

/* ---------- 図6 Packwerk のパッケージと検査 ---------- */
function PackwerkFigure() {
  return (
    <Svg id={figure(7)} w={780} h={300} label="3つのパッケージの図。ルートのパッケージ（app/models、app/controllers など）は依存の検査をしない。app/adapters は、ルートと app/core への依存を宣言している。app/core は依存を何も宣言していない。app/core のファイルが Persistence::OrderRecord を参照すると、packwerk check が Dependency violation を報告した。app/core の dependencies に app/adapters を書くと、packwerk validate が循環を報告して失敗した">
      <Box x={20} y={30} w={230} h={86} lines={['.（ルート）', 'app/models・app/controllers', 'enforce_dependencies: false']} fs={12.5} bold subTone="muted" />
      <Box x={290} y={30} w={200} h={86} lines={['app/adapters', 'dependencies:', '"." と "app/core"']} fs={12.5} bold subTone="muted" fill="box4" />
      <Box x={540} y={30} w={220} h={86} lines={['app/core', 'dependencies: []', 'enforce_dependencies: true']} fs={12.5} bold subTone="muted" fill="box5" />
      <Arrow x1={290} y1={60} x2={252} y2={60} />
      <Arrow x1={490} y1={60} x2={538} y2={60} />
      <Arrow d="M 620 116 C 620 170, 420 170, 400 118" dashed accent />
      <Box x={290} y={176} w={470} h={48} fill="bg" accent lines={['confirm_order.rb:13 で ::Persistence::OrderRecord を参照', 'packwerk check → Dependency violation（1 offense）']} fs={12} mono={false} subTone="danger" />
      <Box x={20} y={240} w={740} h={44} dashed fill="bg" lines={['app/core の dependencies に "app/adapters" を書くと packwerk validate が失敗する', 'circular dependencies: app/adapters → app/core → app/adapters']} fs={12} subTone="muted" />
      <T x={20} y={150} fs={11.5} tone="muted">矢印は宣言した依存の向き</T>
      <T x={20} y={168} fs={11.5} tone="muted">強調した破線は宣言のない参照</T>
    </Svg>
  )
}

const railsWayCode = `
# app/models/order.rb
class Order < ApplicationRecord
  validates :total_cents, numericality: { greater_than: 0 }

  def confirm!(captured:, now: Time.current)
    return :unpaid unless captured
    return :already_confirmed unless state == "pending"

    update!(state: "confirmed", confirmed_at: now)
    :confirmed
  end
end

# app/controllers/orders_controller.rb
class OrdersController < ActionController::API
  def confirm
    order = Order.find(params[:id])
    result = order.confirm!(captured: PaymentApi.captured?(order.payment_id))
    render json: { result:, state: order.state, confirmed_at: order.confirmed_at },
           status: result == :confirmed ? :ok : :unprocessable_content
  end
end

# app/clients/payment_api.rb（決済サービスに支払いの状態を問い合わせる）
class PaymentApi
  def self.captured?(payment_id)
    uri = URI.join(ENV.fetch("PAYMENT_API_URL"), "/payments/#{payment_id}")
    response = Net::HTTP.get_response(uri)
    response.is_a?(Net::HTTPSuccess) && JSON.parse(response.body)["status"] == "captured"
  end
end
`

const ancestorsOutput = `
$ bin/rails runner script/inspect.rb
Order.ancestors.size = 75
ActiveRecord・ActiveModel のモジュール = 61
Order の public メソッド数 = 519
Ordering::Order の public メソッド数 = 81
Object の public メソッド数 = 74
Ordering::Order で定義したメソッド = [:confirm, :confirmed_at, :id, :payment_id, :pending?, :state, :total_cents]
`

const coreCode = `
# app/core/ordering/order.rb
module Ordering
  class Order
    class InvalidTransition < StandardError; end

    attr_reader :id, :state, :total_cents, :payment_id, :confirmed_at

    def initialize(id:, state:, total_cents:, payment_id:, confirmed_at: nil)
      @id, @state, @total_cents = id, state, total_cents
      @payment_id, @confirmed_at = payment_id, confirmed_at
    end

    def pending? = state == "pending"

    def confirm(now)
      raise InvalidTransition, "order #{id} is #{state}" unless pending?

      @state = "confirmed"
      @confirmed_at = now
    end
  end
end

# app/core/ordering/confirm_order.rb
module Ordering
  class ConfirmOrder
    Input = Data.define(:order_id)
    Output = Data.define(:result, :order_id, :state, :confirmed_at)

    # orders: find(id) と save(order) を持つ。payments: captured?(payment_id) を持つ。
    def initialize(orders:, payments:, clock:)
      @orders, @payments, @clock = orders, payments, clock
    end

    def call(input)
      order = @orders.find(input.order_id)
      return output(:unpaid, order) unless @payments.captured?(order.payment_id)
      return output(:already_confirmed, order) unless order.pending?

      order.confirm(@clock.call)
      @orders.save(order)
      output(:confirmed, order)
    end

    private

    def output(result, order)
      Output.new(result:, order_id: order.id, state: order.state, confirmed_at: order.confirmed_at)
    end
  end
end
`

const adapterCode = `
# app/adapters/persistence/order_record.rb
module Persistence
  class OrderRecord < ApplicationRecord
    self.table_name = "orders"
  end
end

# app/adapters/persistence/order_repository.rb
module Persistence
  class OrderRepository
    def find(id)
      to_entity(OrderRecord.find(id))
    end

    def save(order)
      record = OrderRecord.find(order.id)
      record.update!(state: order.state, confirmed_at: order.confirmed_at)
    end

    private

    def to_entity(record)
      Ordering::Order.new(
        id: record.id, state: record.state, total_cents: record.total_cents,
        payment_id: record.payment_id, confirmed_at: record.confirmed_at
      )
    end
  end
end

# app/controllers/clean_orders_controller.rb
class CleanOrdersController < ActionController::API
  def confirm
    output = Rails.configuration.x.confirm_order.call(Ordering::ConfirmOrder::Input.new(order_id: params[:id].to_i))
    presenter = Web::ConfirmOrderPresenter.new(output)
    render json: presenter, status: presenter.status
  end
end

# config/initializers/ordering.rb（どの実装を渡すかを決める）
Rails.application.config.to_prepare do
  Rails.configuration.x.confirm_order = Ordering::ConfirmOrder.new(
    orders: Persistence::OrderRepository.new,
    payments: Payments::HttpPaymentStatus.new(base_url: ENV.fetch("PAYMENT_API_URL", "http://payments.invalid")),
    clock: -> { Time.current }
  )
end
`

const useCaseSpec = `
# spec/core/ordering/confirm_order_spec.rb（Rails を読み込まない）
require "spec_helper"
require_relative "../../../app/core/ordering/order"
require_relative "../../../app/core/ordering/confirm_order"
require_relative "../../support/memory_order_repository"

RSpec.describe Ordering::ConfirmOrder do
  let(:now) { Time.utc(2026, 11, 27, 1, 0) }
  let(:orders) do
    MemoryOrderRepository.new(Ordering::Order.new(id: 1, state: "pending", total_cents: 1200, payment_id: "pay_1"))
  end

  def confirm(captured_ids)
    described_class.new(orders:, payments: FakePayments.new(captured_ids), clock: -> { now })
                   .call(described_class::Input.new(order_id: 1))
  end

  it "支払いが確認できなければ :unpaid を返し、保存しない" do
    expect(confirm([]).result).to eq :unpaid
    expect(orders.find(1).state).to eq "pending"
  end

  it "支払い済みなら確定して保存する" do
    expect(confirm(["pay_1"])).to have_attributes(result: :confirmed, state: "confirmed", confirmed_at: now)
    expect(orders.find(1).state).to eq "confirmed"
  end

  it "確定済みの注文をもう一度確定しようとすると :already_confirmed" do
    confirm(["pay_1"])
    expect(confirm(["pay_1"]).result).to eq :already_confirmed
  end
end

# spec/support/memory_order_repository.rb
class MemoryOrderRepository
  def initialize(*orders)
    @rows = orders.to_h { |order| [order.id, order.dup] }
  end

  def find(id) = @rows.fetch(id).dup
  def save(order) = @rows[order.id] = order.dup
end

FakePayments = Struct.new(:captured_ids) do
  def captured?(payment_id) = captured_ids.include?(payment_id)
end
`

const useCaseOutput = `
$ bundle exec rspec spec/core --format documentation

Ordering::ConfirmOrder
  支払いが確認できなければ :unpaid を返し、保存しない
  支払い済みなら確定して保存する
  確定済みの注文をもう一度確定しようとすると :already_confirmed

Finished in 0.02938 seconds (files took 0.72355 seconds to load)
3 examples, 0 failures
`

const contractCode = `
# spec/support/order_repository_contract.rb
RSpec.shared_examples "注文の保存先" do
  # 使う側で subject（保存先）と existing_id（保存済みの注文の ID）を用意する
  it "find で読んだ注文を save すると、確定した状態を読み直せる" do
    order = subject.find(existing_id)
    order.confirm(Time.utc(2026, 11, 27, 1, 0))
    subject.save(order)
    expect(subject.find(existing_id)).to have_attributes(state: "confirmed", confirmed_at: Time.utc(2026, 11, 27, 1, 0))
  end

  it "save を呼ばなければ、読み直した注文は保留のまま" do
    subject.find(existing_id).confirm(Time.utc(2026, 11, 27, 1, 0))
    expect(subject.find(existing_id).state).to eq "pending"
  end
end

# spec/adapters/order_repository_spec.rb
require "rails_helper"

RSpec.describe MemoryOrderRepository do
  subject { MemoryOrderRepository.new(Ordering::Order.new(id: 1, state: "pending", total_cents: 1200, payment_id: "pay_1")) }
  let(:existing_id) { 1 }
  it_behaves_like "注文の保存先"
end

RSpec.describe Persistence::OrderRepository do
  subject { described_class.new }
  let(:existing_id) { Persistence::OrderRecord.create!(total_cents: 1200, payment_id: "pay_1").id }
  it_behaves_like "注文の保存先"
end
`

const contractOutput = `
MemoryOrderRepository
  behaves like 注文の保存先
    find で読んだ注文を save すると、確定した状態を読み直せる
    save を呼ばなければ、読み直した注文は保留のまま

Persistence::OrderRepository
  behaves like 注文の保存先
    find で読んだ注文を save すると、確定した状態を読み直せる
    save を呼ばなければ、読み直した注文は保留のまま
`

const columnDiff = `
$ git diff --stat   # Rails Way：応答に delivery_note（配送メモ）を足す
 app/controllers/orders_controller.rb | 3 ++-
 spec/requests/orders_spec.rb         | 3 ++-
 2 files changed, 4 insertions(+), 2 deletions(-)

$ git diff --stat   # 全面採用：同じ変更
 app/adapters/persistence/order_repository.rb | 3 ++-
 app/adapters/web/confirm_order_presenter.rb  | 3 ++-
 app/core/ordering/confirm_order.rb           | 5 +++--
 app/core/ordering/order.rb                   | 6 +++---
 spec/requests/clean_orders_spec.rb           | 3 ++-
 5 files changed, 12 insertions(+), 8 deletions(-)
`

const partialCode = `
# app/adapters/payments/http_payment_status.rb
require "net/http"

module Payments
  class Unavailable < StandardError; end

  class HttpPaymentStatus
    def initialize(base_url:, timeout: 2)
      @base_url, @timeout = base_url, timeout
    end

    # 決済サービスの応答を、注文の確定に必要な true / false に変換する
    def captured?(payment_id)
      uri = URI.join(@base_url, "/payments/#{payment_id}")
      response = Net::HTTP.start(uri.host, uri.port, open_timeout: @timeout, read_timeout: @timeout) { _1.get(uri.path) }
      case response
      when Net::HTTPSuccess then JSON.parse(response.body)["status"] == "captured"
      when Net::HTTPNotFound then false
      else raise Unavailable, "payment service returned #{response.code}"
      end
    rescue Timeout::Error, SystemCallError => e
      raise Unavailable, e.message
    end
  end
end

# app/adapters/payments/fake_payment_status.rb（開発とテストで使う）
module Payments
  class FakePaymentStatus
    def initialize(captured: [], unavailable: false)
      @captured, @unavailable = captured, unavailable
    end

    def captured?(payment_id)
      raise Unavailable, "fake outage" if @unavailable

      @captured.include?(payment_id)
    end
  end
end

# config/initializers/payments.rb
Rails.application.config.to_prepare do
  Rails.configuration.x.payment_status ||=
    Payments::HttpPaymentStatus.new(base_url: ENV.fetch("PAYMENT_API_URL", "http://payments.invalid"))
end

# app/controllers/partial_orders_controller.rb（Order は Active Record のまま）
class PartialOrdersController < ActionController::API
  rescue_from Payments::Unavailable do
    render json: { result: :payment_unavailable }, status: :service_unavailable
  end

  def confirm
    order = Order.find(params[:id])
    result = order.confirm!(captured: Rails.configuration.x.payment_status.captured?(order.payment_id))
    render json: { result:, state: order.state, confirmed_at: order.confirmed_at },
           status: result == :confirmed ? :ok : :unprocessable_content
  end
end
`

const partialSpec = `
# spec/support/payment_status_contract.rb
RSpec.shared_examples "支払い状況の問い合わせ先" do
  # 使う側で status_for(captured:, unavailable:) を定義する
  it "captured の支払いは true" do
    expect(status_for(captured: ["pay_1"]).captured?("pay_1")).to be true
  end

  it "まだ captured でない支払いは false" do
    expect(status_for(captured: []).captured?("pay_1")).to be false
  end

  it "問い合わせ先が応答しなければ Payments::Unavailable" do
    expect { status_for(unavailable: true).captured?("pay_1") }.to raise_error(Payments::Unavailable)
  end
end

# spec/adapters/payment_status_spec.rb
require "rails_helper"
require "puma"

RSpec.describe Payments::FakePaymentStatus do
  def status_for(captured: [], unavailable: false) = described_class.new(captured:, unavailable:)
  it_behaves_like "支払い状況の問い合わせ先"
end

RSpec.describe Payments::HttpPaymentStatus do
  # 決済サービスの代わりに、同じプロセスの Puma で JSON を返す
  def status_for(captured: [], unavailable: false)
    app = lambda do |env|
      next [503, {}, ["maintenance"]] if unavailable
      id = env["PATH_INFO"].split("/").last
      [200, { "content-type" => "application/json" }, [{ status: captured.include?(id) ? "captured" : "authorized" }.to_json]]
    end
    @server = Puma::Server.new(app, nil, min_threads: 1, max_threads: 1, log_writer: Puma::LogWriter.null)
    port = @server.add_tcp_listener("127.0.0.1", 0).addr[1]
    @server.run
    described_class.new(base_url: "http://127.0.0.1:#{port}")
  end

  after { @server&.stop(true) }
  it_behaves_like "支払い状況の問い合わせ先"
end
`

const partialOutput = `
Payments::FakePaymentStatus
  behaves like 支払い状況の問い合わせ先
    captured の支払いは true
    まだ captured でない支払いは false
    問い合わせ先が応答しなければ Payments::Unavailable

Payments::HttpPaymentStatus
  behaves like 支払い状況の問い合わせ先
    captured の支払いは true
    まだ captured でない支払いは false
    問い合わせ先が応答しなければ Payments::Unavailable

POST /partial/orders/:id/confirm
  支払い済みなら 200
  未払いなら 422 で、注文は保留のまま
  決済サービスが応答しなければ 503 で、未払いとは区別する

9 examples, 0 failures
`

const archSpec = `
# spec/architecture/core_dependencies_spec.rb
require "prism"

# app/core の Ruby ファイルが参照する定数の名前を、構文木から集める
def constant_names(path)
  names = []
  queue = [Prism.parse_file(path).value]
  while (node = queue.shift)
    case node
    when Prism::ConstantReadNode then names << node.name.to_s
    when Prism::ConstantPathNode then names << node.full_name
    end
    queue.concat(node.compact_child_nodes)
  end
  names
end

RSpec.describe "app/core の依存" do
  FORBIDDEN = /\\A(ActiveRecord|ApplicationRecord|ActionController|Rails|Persistence|Payments|Web)\\b/

  Dir.glob(File.expand_path("../../app/core/**/*.rb", __dir__)).sort.each do |path|
    it "#{path.delete_prefix(File.expand_path("../..", __dir__) + "/")} は Rails と外側の名前空間を参照しない" do
      expect(constant_names(path).grep(FORBIDDEN)).to eq []
    end
  end
end
`

const archFailure = `
# confirm_order.rb の call に次の1行を足して実行した
#   return output(:locked, order) if Persistence::OrderRecord.where(id: order.id, state: "locked").exists?

  1) app/core の依存 app/core/ordering/confirm_order.rb は Rails と外側の名前空間を参照しない
     Failure/Error: expect(constant_names(path).grep(FORBIDDEN)).to eq []

       expected: []
            got: ["Persistence::OrderRecord", "Persistence"]

2 examples, 1 failure
`

const archMiss = `
# 今度は定数を書かずに、Active Record のメソッドを呼ぶ形に変えた
#   order.update!(state: "confirmed", confirmed_at: @clock.call)

$ bundle exec rspec spec/architecture spec/core
...FF

  1) Ordering::ConfirmOrder 支払い済みなら確定して保存する
     Failure/Error: order.update!(state: "confirmed", confirmed_at: @clock.call)

     NoMethodError:
       undefined method 'update!' for an instance of Ordering::Order

5 examples, 2 failures
`

const packwerkConfig = `
# app/core/package.yml
enforce_dependencies: true
dependencies: []

# app/adapters/package.yml
enforce_dependencies: true
dependencies:
  - "."
  - "app/core"
`

const packwerkOutput = `
$ bundle exec packwerk validate
Validation successful 🎉

$ bundle exec packwerk check          # 違反がない状態
📦 Packwerk is inspecting 34 files
No offenses detected
No stale violations detected

$ bundle exec packwerk check          # confirm_order.rb に Persistence::OrderRecord を書いた状態
app/core/ordering/confirm_order.rb:13:39
Dependency violation: ::Persistence::OrderRecord belongs to 'app/adapters', but 'app/core' does not specify a dependency on 'app/adapters'.
Are the constant and its references in the right packages?

1 offense detected

$ bundle exec packwerk update-todo    # 今ある違反を記録して、新しい違反だけを止める
$ cat app/core/package_todo.yml
---
app/adapters:
  "::Persistence::OrderRecord":
    violations:
    - dependency
    files:
    - app/core/ordering/confirm_order.rb
`

const traceSteps = [
  {
    label: '1. コントローラー',
    detail: (
      <p>
        <code>POST /clean/orders/1/confirm</code> を受けた <code>CleanOrdersController</code> が、文字列の <code>params[:id]</code> を整数に変え、<code>ConfirmOrder::Input.new(order_id: 1)</code> を作ります。中心に渡るのはこの値だけで、<code>params</code> や <code>request</code> は渡りません。層：プレゼンテーション（中心を動かす側のアダプター）。
      </p>
    ),
  },
  {
    label: '2. 注文を読む',
    detail: (
      <p>
        <code>ConfirmOrder#call</code> が <code>@orders.find(1)</code> を呼びます。実体の <code>Persistence::OrderRepository</code> は <code>OrderRecord.find(1)</code> で SELECT を発行し、行を <code>Ordering::Order</code> に詰め替えて返します。中心が受け取るのは Active Record ではないオブジェクトです。層：アプリケーション → インフラストラクチャ。
      </p>
    ),
  },
  {
    label: '3. 支払いを問い合わせる',
    detail: (
      <p>
        <code>@payments.captured?("pay_1")</code> を呼びます。本番では <code>HttpPaymentStatus</code> が決済サービスに GET を送り、JSON の <code>status</code> を true か false に変えます。テストでは <code>FakePayments</code> が配列を見て答えます。false なら <code>:unpaid</code> を返して終わり、保存しません。
      </p>
    ),
  },
  {
    label: '4. 規則を判断する',
    detail: (
      <p>
        <code>order.pending?</code> が偽なら <code>:already_confirmed</code> を返します。真なら <code>order.confirm(now)</code> がメモリー上の状態を <code>"confirmed"</code> にします。この時点では DB は変わっていません。層：ドメイン。
      </p>
    ),
  },
  {
    label: '5. 保存する',
    detail: (
      <p>
        <code>@orders.save(order)</code> で、リポジトリが <code>OrderRecord</code> を読み直して <code>update!</code> を呼び、UPDATE を発行します。この例では読み直しと UPDATE が同じトランザクションに入っていません。同時に確定される場合を扱うなら、ロックを取る範囲を保存の取り決めに足します（<ChapterLink n={38} />）。
      </p>
    ),
  },
  {
    label: '6. 応答を返す',
    detail: (
      <p>
        <code>ConfirmOrder</code> は <code>Output</code>（<code>Data.define</code> で作った値）を返し、<code>Web::ConfirmOrderPresenter</code> が JSON と状態コード 200 または 422 に変えます。中心は HTTP の状態コードを知りません。
      </p>
    ),
  },
] as const

const chapter: Chapter = {
  number: 108,
  part: 7,
  title: "レイヤードアーキテクチャと Clean Architecture",
  summary: "注文の確定を Rails Way、外部 API の境界だけにポートを置く形、Clean Architecture の全面採用の3通りで書いて動かし、依存の向き、増えるファイル、境界の検査方法を比べます。",
  goals: [
    "プレゼンテーション・アプリケーション・ドメイン・インフラストラクチャの4つの層と Rails の部品の対応を説明できる",
    "実行時の呼び出しの向きと、ソースコードの依存の向きを区別して図に描ける",
    "ポートとアダプターで中心を Rails から切り離す最小の例を書き、契約のテストで確かめられる",
    "全面採用・部分採用・Rails Way の費用を、増えるファイルと変更の範囲から比べて選べる",
    "Packwerk や構文木を使った検査で、モジュールの境界を守らせる方法と限界を説明できる",
  ],
  prerequisites: [30, 33],
  sections: [
    {
      id: "layers",
      title: "そもそもレイヤードアーキテクチャとは",
      body: (
        <>
          <p>注文を確定する機能を、Rails の標準の書き方で作るところから始めます。ネットショップの注文は決済サービスで支払いが確定（captured）していれば「確定済み」にでき、まだなら保留のままです。次のコードはこの章で Rails Way（Rails の規約どおりにコントローラーとモデルで組み立てる書き方）と呼ぶ版です。<code>orders</code> テーブルには <code>state</code>（初期値 <code>"pending"</code>）、<code>total_cents</code>、<code>payment_id</code>、<code>confirmed_at</code> の列があります。</p>
          <Code lang="ruby" title="Rails Way の注文の確定（3つのファイル）" code={railsWayCode} />
          <p>この3つのファイルの中には、性質の違う処理が混ざっています。<code>params[:id]</code> を読んで JSON と状態コードを返す処理は HTTP の都合で、「注文を読み、支払いを問い合わせ、確定して保存する」という順序はこの機能の手順です。「支払い済みで保留中の注文だけを確定できる」は業務の規則に当たり、<code>update!</code> の SQL と決済サービスへの GET は外部のシステムとの通信に当たります。</p>
          <p>この4つは、変更の依頼が来る理由が違います。応答を JSON から HTML に変える依頼では HTTP の処理だけを、確定の条件に「在庫の引き当て済み」を加える依頼では規則だけを直せれば、変更後に確かめる範囲が狭く済みます。<Term en="layered architecture">レイヤードアーキテクチャ</Term>は、変わる理由が同じ処理を1つの層（レイヤー）にまとめ、層の間で呼び出してよい向きを決める設計の方法です。図 {figure(1)} には、よく使われる4つの層と、注文の確定でそれぞれが受け持つ処理を並べました。</p>
          <Figure n={figure(1)} title="4つの層と、注文の確定で各層が受け持つ処理" caption="一般的な4層の分け方を、この章の例に当てはめた模式図。矢印は伝統的なレイヤードで上の層が下の層を呼ぶ向き。層の名前と数は資料によって違う。">
            <LayersFigure />
          </Figure>
          <ul>
            <li>プレゼンテーション層：利用者や外部のプログラムとのやり取りを扱います。Web アプリでは HTTP の要求を読み、応答を組み立てます。</li>
            <li>アプリケーション層：ソフトウェアが行う仕事の手順を決め、業務の規則に基づく判断はドメイン層のオブジェクトに任せます。Evans の DDD の書籍を引用した Microsoft の解説は、この層を薄く保ち、業務の規則や知識を持たせないと説明しています<Ref n={4} />。</li>
            <li>ドメイン層：業務の概念、状態、規則を表します。同じ解説は、状態を保存する技術的な詳細をインフラストラクチャに任せるとしています<Ref n={4} />。</li>
            <li>インフラストラクチャ層：DB への保存、メッセージの送信、外部 API との通信など、技術的な仕組みを提供します。</li>
          </ul>
          <p>Fowler は2015年の記事で、表示・ドメイン・データの3つに分ける形を基本として説明し、依存はプレゼンテーションからドメイン、ドメインからデータソースへ向くと書いています<Ref n={3} />。アプリケーション層を独立させて4層にするか、3層のままドメイン層に手順も入れるかは、設計の選択です。層は論理的な分け方で、サーバーを分けることとは別の話です。</p>
          <p>層に分けると、規則を直す人は規則の層だけを読めば済み、HTTP の応答の形を変える人は規則のコードを開かずに済みます。その代わりに、層をまたぐたびに呼び出しと受け渡しのコードが増えます。検索して一覧表示するだけの画面では、層ごとに分けても分ける対象の処理がほとんどありません。どこまで分けるかは、この章の後半で実際に増えたファイルの数から判断します。</p>
        </>
      ),
    },
    {
      id: "rails-mvc",
      title: "Rails の MVC と4つの層の対応",
      body: (
        <>
          <p>Rails は MVC（Model・View・Controller）の構成をとります。4つの層と対応させると、ルーティング、コントローラー、ビューがプレゼンテーション層に当たります。ドメイン層に当たるのは Active Record のモデルです。注意が要るのは残りの2つの層です。</p>
          <p>まず、アプリケーション層の置き場所を Rails は決めていません。上の例では手順がコントローラーのアクションに書かれています。手順が長くなったときにモデルのメソッドへ移すか、<code>app/services</code> のような独自のディレクトリにクラスを作るかは、チームが決めることです。この選択は<ChapterLink n={33} section="domain-application-service" />と<ChapterLink n={44} />で扱っています。</p>
          <p>次に、Active Record のモデルはドメイン層とインフラストラクチャ層の両方にまたがります。Fowler の PoEAA は Active Record パターンを、DB のテーブルの1行を包み、DB へのアクセスを隠し、そのデータに業務のロジックを加えるオブジェクトと定義しています<Ref n={6} />。<code>Order#confirm!</code> は業務の規則を判断し、同じメソッドの中で <code>update!</code> を呼んで保存します。この章の最小アプリ（Ruby 4.0.9、Rails 8.1.4.1、SQLite）で、モデルがどれだけ Rails の部品を取り込んでいるかを数えました。比べる相手は後の節で作る <code>Ordering::Order</code> で、Rails を使わない注文のクラスです。</p>
          <Code lang="text" title="実行結果（bin/rails runner で Order の祖先とメソッドを数えた）" code={ancestorsOutput} />
          <p><code>Order</code> の祖先（継承とインクルードでたどれるクラスとモジュール）は 75 個で、そのうち 61 個が ActiveRecord と ActiveModel のモジュールでした。公開メソッドは 519 個あり、Ruby の <code>Object</code> の 74 個に比べて 445 個多くなっています。<code>Ordering::Order</code> は 81 個で、<code>Object</code> の 74 個に自分で定義した 7 個を足した数です。<code>Order</code> のオブジェクトを受け取ったコードは、<code>update!</code>、<code>destroy</code>、<code>lock!</code> など、DB を操作する数百のメソッドを呼べます。</p>
          <Figure n={figure(2)} title="Rails の部品と4つの層の対応" caption="Rails の標準の構成を4つの層に当てはめた模式図。数値はこの章の最小アプリでの実測。">
            <RailsMappingFigure />
          </Figure>
          <p>図 {figure(2)} のように、Active Record のモデルが2つの層にまたがるのは、Rails が意図して選んだ形です。Rails Doctrine は「No one paradigm」の項で、一つの設計の考え方の純粋さにこだわらないと述べています（<ChapterLink n={31} section="doctrine" />）。規則と保存を1つのクラスに置くと、検証、関連、スコープ、フォームとの連携を規約どおりに使え、書くコードが少なくなります。一方で、規則だけを DB なしで動かす、規則のクラスから保存の操作を呼べなくする、といった要求には、そのままでは応えられません。次の節から、この2つの要求に応える方法とその費用を見ていきます。</p>
        </>
      ),
    },
    {
      id: "dependency-rule",
      title: "依存の向き：実行時の呼び出しとソースコードの参照",
      body: (
        <>
          <p>「A が B に依存する」には2つの意味があります。1つは実行時の呼び出しで、確定の処理が保存の処理を呼ぶなら、処理は確定から保存へ進みます。もう1つはソースコードの依存で、A のコードに B のクラス名やメソッドの仕様が書かれていて、B が変わると A も直す必要がある関係です。設計の図を読むときは、矢印がどちらを表しているかを最初に確かめます。</p>
          <p>伝統的なレイヤードでは2つの向きが一致し、上の層は下の層を呼び、下の層のクラス名も知っています。Rails Way の <code>Order</code> は <code>ApplicationRecord</code> を継承しているので、業務の規則のコードが DB の仕組み（Active Record）に依存している状態です。</p>
          <p>Clean Architecture は Robert C. Martin が2012年の記事で示した構成で、同心円の内側に業務の規則、外側に Web・DB などの詳細を置き、「ソースコードの依存は内側にだけ向けてよい」という依存ルールを中心に据えます<Ref n={1} />。円の数は模式的なもので4つに限らない、とも記事は書いています<Ref n={1} />。内側のユースケースが外側の DB に保存を頼むときは、呼び出しは外へ向くのに、依存は内へ向けなければなりません。記事はこの食い違いを依存性逆転の原則（DIP）で解いています。内側が「保存先はこの操作を持つ」という取り決めを定め、外側がそれを実装する方法です。動的な多態（呼び出す相手の実際のクラスを実行時に決める仕組み）を使い、処理の流れと逆向きのソースコードの依存を作る、と説明しています<Ref n={1} />。DIP そのものの説明と Rails での例は<ChapterLink n={67} />にあります。</p>
          <Figure n={figure(3)} title="呼び出しの向きとソースコードの依存の向き" caption="この章の注文の確定を、伝統的なレイヤードと Clean Architecture で比べた模式図。右の「orders の取り決め」は Ruby ではクラスとして書かず、メソッドの名前と戻り値の約束で表す。">
            <DependencyFigure />
          </Figure>
          <p>図 {figure(3)} の右側で、確定のユースケースは <code>find</code> と <code>save</code> を呼ぶだけで、<code>OrderRecord</code> の名前を書きません。保存の実装 <code>Persistence::OrderRepository</code> は内側の <code>Ordering::Order</code> を作って返すので、内側の名前を知っています。こうして最下段の破線だけが逆向きになります。Ruby にはインターフェースを宣言する構文がないので、取り決めはコメントとテストで表します（Java などではインターフェースの型として内側に置きます）。</p>
          <p>記事は境界を越えるデータを単純なデータ構造にし、エンティティや DB の行をそのまま渡さないようにとも書いています<Ref n={1} />。Rails に当てはめると、Active Record のオブジェクトを内側に渡さないということです。渡すと、内側のコードが <code>update!</code> を呼べてしまい、ソースコードに定数が出てこなくても Active Record の仕様に依存します。この点は「モジュールの境界を検査する」の節で、検査で見つけられるかどうかを確かめます。</p>
          <Ref n={2} />
        </>
      ),
    },
    {
      id: "hexagonal",
      title: "Hexagonal Architecture：ポートとアダプター",
      body: (
        <>
          <p>依存の向きを守る構成には、Clean Architecture のほかに Alistair Cockburn の <Term en="Hexagonal Architecture">Hexagonal Architecture</Term> があります。2005年の記事で示された名前で、Ports and Adapters とも呼ばれます。記事の目的は、アプリケーションを利用者、プログラム、自動テスト、バッチのどれからも同じように動かせるようにし、本番で接続する機器や DB から切り離して開発・テストできるようにすることです<Ref n={5} />。</p>
          <p><Term en="port">ポート</Term>はアプリケーションと外の世界との目的のあるやり取りを表す取り決めで、多くの場合 API として表します。<Term en="adapter">アダプター</Term>は、外部の機器や技術（画面、HTTP、DB など）が使う形とポートの API の間を変換する部品です。記事はアプリケーションを動かす側（driving、primary）と、アプリケーションから使われる側（driven、secondary）を左右に分けて描きます。動かす側の例は利用者の画面や自動テストの仕組み、使われる側の例は DB です<Ref n={5} />。六角形という形に意味はなく、ポートとアダプターを描き足す余白を取るための形だと説明しています<Ref n={5} />。</p>
          <Figure n={figure(4)} title="注文の確定のポートとアダプター" caption="この章のコードを Hexagonal Architecture の図に当てはめた模式図。rake タスクはこの章では作っていない。">
            <HexagonFigure />
          </Figure>
          <p>図 {figure(4)} の左のコントローラーと RSpec は、どちらも <code>ConfirmOrder#call</code> を呼んで中心を動かします。右の <code>orders</code> と <code>payments</code> は中心が使うポートで、それぞれに本番用とテスト用のアダプターがあります。Clean Architecture と Hexagonal Architecture は、内側が外側を知らないという点で同じ目的を持ち、Martin の記事も同じ目的を持つ構成の1つとして Hexagonal を挙げています<Ref n={1} />。違いは描き方で、Clean Architecture は同心円の層の数と名前（エンティティ、ユースケース、インターフェースアダプター、フレームワーク）まで示し、Hexagonal が示すのは内と外の2つとポートだけです。この章のコードは両方の考え方で同じように説明できます。</p>
          <p>この構成で解決したい課題は2つに整理できます。1つは業務の規則と手順を HTTP や DB を用意せずに動かして確かめること、もう1つは保存先や外部サービスを差し替えても中心のコードを変えずに済むことです。反対に、規則がほとんどなく、画面の入力をそのまま保存するだけの機能では、中心に置くコードがなく、アダプターの変換だけが残ります。</p>
        </>
      ),
    },
    {
      id: "implementation",
      title: "依存の向きを守る最小の例を Rails で動かす",
      body: (
        <>
          <p>図 {figure(4)} の構成を、前の節までと同じ Rails 8.1.4.1 のアプリに書きました。中心のコードの置き場所は <code>app/core</code> です。Rails は <code>app</code> の下にあるディレクトリを自動でオートロードの対象にするので、設定を足さなくても読み込まれます<Ref n={7} />。ただし <code>app/core</code> 自体は名前空間にならず、<code>app/core/ordering/order.rb</code> は <code>Core::Ordering::Order</code> ではなく <code>Ordering::Order</code> を定義するファイルとして扱われます<Ref n={7} />。</p>
          <Code lang="ruby" title="中心のコード：注文と確定のユースケース" code={coreCode} />
          <p><code>Ordering::Order</code> は Rails のクラスを継承しない普通の Ruby のクラス（PORO）です。<code>ConfirmOrder</code> は、<code>orders</code>（<code>find</code> と <code>save</code>）、<code>payments</code>（<code>captured?</code>）、<code>clock</code>（現在時刻を返す）の3つを受け取り、どれのクラス名も書きません。入力と出力は Ruby の <code>Data.define</code> で作った、変更できない値のクラスです<Ref n={9} />。</p>
          <Code lang="ruby" title="外側のコード：保存のアダプター、コントローラー、組み立て" code={adapterCode} />
          <p><code>OrderRecord</code> は同じ <code>orders</code> テーブルを使う Active Record のモデルで、リポジトリの中だけで使います。どの実装をユースケースに渡すかは、初期化ファイルで一度だけ決めています。<code>to_prepare</code> に書いたのは、開発環境でコードを再読み込みしたときにも組み立て直すためです。</p>
          <p>中心のテストは Rails を読み込みません。<code>spec_helper</code> だけを読み、メモリー上の保存先と、配列で答える支払いの問い合わせ先を渡します。支払いの判定を差し替えて、確定する条件を比べます。</p>
          <Code lang="ruby" title="spec/core/ordering/confirm_order_spec.rb と、テスト用の保存先" code={useCaseSpec} />
          <Code lang="text" title="実行結果（Ruby 4.0.9、RSpec 3.13、Docker の ruby:4.0 イメージ）" code={useCaseOutput} />
          <p><code>FakePayments.new([])</code> を渡すと結果は <code>:unpaid</code> で、保存先の注文は <code>pending</code> のままでした。<code>["pay_1"]</code> を渡すと確定し、保存先を読み直しても <code>confirmed</code> でした。<code>MemoryOrderRepository</code> は読み出しと保存のたびに注文を複製するので、<code>save</code> を呼び忘れると読み直した状態が変わらず、テストで見つけられます。同じアプリで Rails を読み込む仕様（モデル、要求、リポジトリ）も含めた全体の 22 例も通りました。</p>
          <Figure n={figure(5)} title="POST /clean/orders/1/confirm の処理を段階で追う" caption="この章のコードの実行順をまとめた概念モデル。ボタンで段階を切り替えると、その段階でどの層のコードが動き、境界を何が越えるかを表示する。">
            <Stepper steps={traceSteps} />
          </Figure>
          <p>この例は保存に成功するか例外を投げるという契約を前提にしています。保存の実装が失敗を <code>false</code> で返すと、ユースケースは確定の成功を返してしまいます。また、<code>find</code> から <code>save</code> までが1つのトランザクションに入っているかは、依存の向きからは分かりません。同時に2つの要求が同じ注文を確定する場合の扱いは、保存の取り決めに含めて決めます。DB に書き込んだ後の状態を読み直して確かめる例は<ChapterLink n={116} section="pattern" />にあります。</p>
        </>
      ),
    },
    {
      id: "contracts",
      title: "接続先が変わっても同じ約束を守る",
      body: (
        <>
          <p>メモリー上の保存先でユースケースのテストが通っても、本番で使う <code>Persistence::OrderRepository</code> が同じように振る舞う保証にはなりません。2つの実装に同じテストを当てるために、RSpec の <code>shared_examples</code> で保存先の取り決めを書き、両方の実装で実行しました。このようなテストを契約テストと呼ぶことがあります。</p>
          <Code lang="ruby" title="保存先の取り決めを表すテストと、2つの実装への適用" code={contractCode} />
          <Code lang="text" title="実行結果（rspec --format documentation の該当部分）" code={contractOutput} />
          <p>4つの例がすべて通りました。メモリー上の実装でも SQLite を使う実装でも、<code>save</code> を呼べば確定した状態を読み直せ、呼ばなければ保留のままです。Ruby にはインターフェースの型がないので、ポートの取り決めはこのテストと、ユースケースのコメントに書いたメソッドの名前で表しています。</p>
          <p>契約テストで確かめられるのは、両方の実装に共通する振る舞いだけです。一意制約、行ロック、トランザクションの分離レベルのように DB が守る性質は、メモリー上の実装では起きません。これらは本物の DB を使うテストで別に確かめます。Fowler の Repository の説明が示すとおり、Repository は業務のオブジェクトとデータの対応付けの間に置く部品で<Ref n={2} />、DB の性質を引き受けるものではありません。</p>
          <p>取り決めに含める結果も決めておきます。確定の処理を Web とジョブの両方から呼ぶなら、未払いのときは <code>:unpaid</code> を返し、Web では利用者に支払いを求める応答を返し、ジョブでは理由を記録して終了できます。決済サービスに一時的につながらなかった場合は、支払いがないこととは別の結果です。両者を同じ失敗として扱うと、ジョブを再試行しても意味のない状態を繰り返します。この区別を実装した例を、後の「外部 API の境界だけに取り入れる」の節で示します。</p>
          <p>DB のエラーの種類をすべて独自の例外に置き換えると、保守する対応表が増えます。内側のコードで判断を変える必要がある結果だけを区別し、それぞれにテストを用意します。たとえば「注文が見つからない」は <code>find</code> が例外を投げる約束にし、「保存先が一時的に使えない」は区別しない、といった具合に、ユースケースの分岐に必要なものだけを取り決めに入れます。</p>
        </>
      ),
    },
    {
      id: "full-adoption",
      title: "全面的に採用すると増えるファイルと手間",
      body: (
        <>
          <p>Clean Architecture を Rails のアプリ全体に適用すると、どれだけコードが増えるかを数えました。同じ注文の確定を、Rails Way、外部 API の境界だけにポートを置く部分採用、中心を Rails から切り離す全面採用の3通りで書き、それぞれの本番のコードとテストの、空行を除いた行数を数えています。全面採用のファイルは、エンティティ、ユースケース（入力と出力を同じファイルに入れた）、Active Record のモデル、リポジトリ、決済のアダプター2つ、プレゼンター、コントローラー、組み立ての初期化ファイルの9つです。</p>
          <Figure n={figure(6)} title="1つの機能で増えたファイルと行数" caption="この章の最小アプリでの実測。ポートごとにクラスを作る書き方や、入力・出力・変換を別のファイルに分ける書き方では、全面採用のファイルはさらに増える。">
            <CostFigure />
          </Figure>
          <p>図 {figure(6)} のとおり、全面採用の本番のコードは Rails Way の 25 行に対して 116 行、テストは 23 行に対して 128 行になりました。増えた分の多くは、DB の行とエンティティの間の詰め替え、出力の値から JSON への詰め替え、ユースケースの組み立てです。どれも業務の規則ではありません。</p>
          <p>次に、応答に配送メモ（<code>delivery_note</code> 列）を足す変更を、Rails Way と全面採用の両方で行い、<code>git diff --stat</code> で変更したファイルを比べました。マイグレーションは両方に共通なので、この差分には入れていません。</p>
          <Code lang="text" title="実行結果（列を1つ足したときの変更）" code={columnDiff} />
          <p>Rails Way では、Active Record がテーブルの列から属性を自動で定義するので、コントローラーの JSON とテストの2つで済みました。全面採用では、列の値が DB の行 → エンティティ → 出力の値 → JSON と3回詰め替えられるので、その経路にあるファイルをすべて直しています。属性を1つ足すたびにこの作業が発生し、どこかで足し忘れると値が <code>nil</code> のまま応答に出ます。今回の変更ではリポジトリの <code>save</code> を直していませんが、配送メモを変更するユースケースを足す日には、<code>save</code> が書き込む列にも追加が要ります。</p>
          <p>行数のほかに、次の手間も増えます。</p>
          <ul>
            <li>Rails の機能を中心で使えなくなる：検証（<code>validates</code>）、関連（<code>has_many</code>）、<code>form_with model:</code> によるフォームとの連携、変更の追跡（<code>changes</code>）は Active Record の機能です。エンティティでこれらを使うには、同じ機能を自分で書くか、アダプターの側に残して規則を2か所に分けることになります。</li>
            <li>読み込みの設計をリポジトリに書く：一覧で明細も表示するなら、N+1 を避ける <code>includes</code> をリポジトリのメソッドとして用意します（N+1 の仕組みは<ChapterLink n={13} />）。画面ごとに必要な読み込み方が違うと、リポジトリのメソッドが画面の数だけ増えます。</li>
            <li>規約の外のコードになる：Rails のジェネレーターはエンティティやリポジトリを作りません。どのディレクトリに何を置くか、名前をどう付けるかを、チームの文書とレビューで保ちます。</li>
          </ul>
          <p>反対に、全面採用で得られたものもあります。中心のテストは Rails を読み込まずに動き、この環境では読み込みが 0.72 秒で済みました（同じ環境で Rails を読み込む全体のテストは、ファイルの読み込みに約 25 秒かかりました。どちらの値にも Docker のボリュームを通したファイルの読み込みが含まれ、ほかの環境では差が変わります）。また、中心のコードから DB の操作を呼べないので、規則のクラスが保存の順序やトランザクションを勝手に決めることがありません。この利点が詰め替えの手間に見合うのは、規則が複雑で頻繁に変わり、Web 以外の経路（ジョブ、別のアプリケーション、コマンドライン）からも同じ規則を使う場合です。</p>
        </>
      ),
    },
    {
      id: "partial",
      title: "外部 API の境界だけに取り入れる",
      body: (
        <>
          <p>全面採用の費用の多くは、DB の行とエンティティの詰め替えから来ていました。そこで、注文のモデルは Active Record のまま残し、外部の決済サービスとの境界にだけポートとアダプターを置く形を試しました。外部 API には、DB とは違う性質があります。通信が遅れる・失敗する、応答の形を自分たちで決められない、開発環境やテストで本物を呼びにくい、の3つです。この3つを、ポートの取り決めとして1か所で扱います。</p>
          <Code lang="ruby" title="決済サービスとの境界だけにポートを置く" code={partialCode} />
          <p>ポートの取り決めは「<code>captured?(payment_id)</code> は true か false を返し、問い合わせられなければ <code>Payments::Unavailable</code> を投げる」です。<code>HttpPaymentStatus</code> は HTTP の状態コード、JSON の形、タイムアウトを、この3つの結果に変換します。<code>Order</code> は Rails Way のまま変えていません。コントローラーは問い合わせ先を設定（<code>config.x</code>）から受け取り、<code>Unavailable</code> を 503 の応答に変えます。</p>
          <Code lang="ruby" title="2つのアダプターに同じ取り決めのテストを当てる" code={partialSpec} />
          <Code lang="text" title="実行結果（契約テストと要求のテスト）" code={partialOutput} />
          <p><code>HttpPaymentStatus</code> のテストでは、同じプロセスで Puma を起動して JSON を返し、本物の HTTP 通信を通しています。503 を返すと <code>Payments::Unavailable</code> になることも確かめました。要求のテストでは、未払いが 422、決済サービスの停止が 503 と、別の応答になっています。Rails Way の <code>PaymentApi</code> は、通信に失敗すると <code>Net::HTTP</code> の例外がそのままコントローラーまで届き、決済サービスが 503 を返したときは未払いと同じ false を返していました。</p>
          <p>この部分採用で増えたのは、本番のコードで 2 ファイル（アダプター2つ）と初期化ファイル1つ、テストで 2 ファイルでした（図 {figure(6)}）。注文のモデル、検証、関連、フォームは Rails の規約どおりに使えます。外部サービスのアダプターの設計（複数の決済サービスの違いの吸収）は<ChapterLink n={42} />、外部 API の呼び出しのタイムアウトと再試行は<ChapterLink n={101} />と<ChapterLink n={54} />で扱っています。</p>
          <p>Ruby ではテストのために必ずしもポートを作る必要はありません。Rails Way のテストでは <code>allow(PaymentApi).to receive(:captured?)</code> でクラスメソッドを差し替えて動かしました。差し替えの手段がある言語で、それでもポートを置く理由はテストのしやすさよりも「失敗をどう分類するか」をアプリの言葉で1か所に書くことにあります。決済サービスを1社だけ使い、失敗の分類も要らないなら、<code>PaymentApi</code> のクラスメソッドのままでも構いません。</p>
        </>
      ),
    },
    {
      id: "boundary-check",
      title: "モジュールの境界を検査する",
      body: (
        <>
          <p>「<code>app/core</code> は Rails を参照しない」という取り決めは、守られているかをレビューで毎回確かめるのでは漏れが出ます。ここでは2つの方法で、取り決めに反するコードを自動で見つけます。1つは Ruby の構文解析器 Prism で定数の参照を集めるテスト、もう1つは Shopify が公開している Packwerk です。</p>
          <p>Prism は Ruby に同梱されている構文解析器のライブラリで、<code>Prism.parse_file</code> でファイルを構文木にできます<Ref n={10} />。次のテストは <code>app/core</code> の各ファイルの構文木から定数の参照を集め、Rails や外側の名前空間に属する名前がないことを確かめます。</p>
          <Code lang="ruby" title="spec/architecture/core_dependencies_spec.rb" code={archSpec} />
          <p>通常の状態では2つのファイルとも通ります。確かめるために、<code>ConfirmOrder#call</code> に <code>Persistence::OrderRecord</code> を使う行を足して実行しました。</p>
          <Code lang="text" title="実行結果（外側の定数を参照した場合）" code={archFailure} />
          <p>テストは参照した定数の名前を挙げて失敗しました。ただし、この検査は定数の名前だけを見ています。次に、定数を書かずに Active Record のメソッドを呼ぶ形に変えて実行しました。</p>
          <Code lang="text" title="実行結果（定数を書かずに Active Record のメソッドを呼んだ場合）" code={archMiss} />
          <p>依存の検査（最初の2つの <code>.</code>）は通り、ユースケースのテストが <code>NoMethodError</code> で失敗しました。リポジトリが Active Record のオブジェクトを返す実装だったら、本番では <code>update!</code> が動き、依存の検査もすり抜けます。メモリー上の実装でユースケースを確かめるテストが、この種の依存を見つける役目を持っています。</p>
          <h3>Packwerk でパッケージの依存を宣言する</h3>
          <p>Packwerk はファイルのまとまりをパッケージとして宣言し、パッケージの間の依存を検査する gem です<Ref n={8} />。パッケージにしたいディレクトリに <code>package.yml</code> を置き、<code>enforce_dependencies: true</code> と、依存してよいパッケージの一覧 <code>dependencies</code> を書きます。この章のアプリでは packwerk 3.3.1 を入れ、<code>bundle exec packwerk init</code> でルートの設定を作ってから、次の2つを足しました。</p>
          <Code lang="yaml" title="パッケージの宣言" code={packwerkConfig} />
          <Code lang="text" title="実行結果（packwerk 3.3.1）" code={packwerkOutput} />
          <Figure n={figure(7)} title="Packwerk のパッケージと検査の結果" caption="この章のアプリで宣言したパッケージと、検査の結果をまとめた図。">
            <PackwerkFigure />
          </Figure>
          <p><code>packwerk check</code> は、<code>app/core</code> が宣言していない <code>app/adapters</code> の定数を参照した行を、ファイル名と行番号つきで報告しました。<code>packwerk update-todo</code> は今ある違反を <code>package_todo.yml</code> に記録し、それ以後は記録にない新しい違反だけを報告します。既存のアプリに後から境界を引くときは、まず今の違反を記録し、新しい違反を増やさないようにしてから、記録を少しずつ減らす進め方ができます。また、<code>app/core</code> の <code>dependencies</code> に <code>app/adapters</code> を書くと、<code>packwerk validate</code> が循環した依存として失敗しました（図 {figure(7)}）。</p>
          <p>Packwerk の README は限界も書いています。Zeitwerk のオートローダーで読み込まれる定数の参照しか解決できないこと、メソッドの呼び出しや受け渡されるオブジェクトは見ないこと、Zeitwerk のディレクトリの折りたたみ（collapse）などの独自設定では誤検知が出ることです<Ref n={8} />。上の Prism の検査と同じく、定数を書かない依存は見つけられません。パッケージの中で公開してよい定数を絞る検査は、Packwerk 本体から packwerk-extensions という別の gem に移されています<Ref n={8} />。</p>
          <p>ほかに、Rails エンジン（<code>Rails::Engine</code>）でパッケージごとに gem の形にして境界を作る方法もあります。エンジンにすると読み込みの範囲を分けられる一方で、マイグレーションやルーティングの扱いも分かれるので、変更の手間が大きくなります。依存の宣言と検査だけが目的なら、Packwerk か上のような RSpec の検査から始めるほうが変更は小さく済みます。安定依存の原則と Packwerk の関係は<ChapterLink n={75} section="rails" />、疎結合と、定数の参照を数える方法は<ChapterLink n={70} section="rails" />にあります。</p>
        </>
      ),
    },
    {
      id: "rails-philosophy",
      title: "Rails の設計思想との関係",
      body: (
        <>
          <p>Rails は Convention over Configuration（設定より規約）を掲げ、ファイルの置き場所と名前の決まりで、設定を書かずに部品をつなぎます（<ChapterLink n={31} section="doctrine" />）<Ref n={12} />。<code>app/models/order.rb</code> に <code>Order</code> を書けば <code>orders</code> テーブルと対応し、<code>OrdersController</code> はルーティングとビューの場所が決まります。全面採用の構成はこの規約の外に独自の規約を作ります。<code>OrderRecord</code> には <code>self.table_name</code> の設定が要り、ユースケースの組み立てには初期化ファイルが要りました。新しく加わった開発者は Rails の規約に加えて、そのアプリだけの規約を覚えます。</p>
          <p>DHH は2014年の「Test-induced design damage」で、Rails に Hexagonal Architecture を当てはめる主な理由が、DB に触れない速いテストと、コントローラーを単体でテストすることにある点を批判しました<Ref n={11} />。コントローラーが Active Record を直接呼ばず、Repository やコマンドのオブジェクトを通す設計は、テストのための間接参照を増やして設計を分かりにくくする、という主張です。そのうえで、複雑なロジックを持つモデルは DB を使ってテストし、コントローラーは結合テストで確かめることを勧めています<Ref n={11} />。DB を使うテストを速くする Rails の仕組み（例ごとのトランザクションのロールバック）は<ChapterLink n={20} section="transaction" />で扱っています。</p>
          <p>一方で、Cockburn の記事が挙げる目的は、テストの速さだけではなく、自動テストやバッチからも同じアプリケーションを動かせることでした<Ref n={5} />。Fowler は、層に分けるのは比較的小さな単位にとどめ、層が大きくなったら最上位をドメインごとのモジュールに分けて、その中で層に分けるよう勧めています<Ref n={3} />。この章では、これらを異なる条件のもとでの判断として読みます。テストの速さだけが理由なら DHH の指摘が当てはまり、規則を複数の経路から使う必要や、外部の失敗を分類する必要があるなら、ポートを置く理由になります。</p>
          <p>Rails の考え方に沿ったまま、規則を整理する手段もあります。モデルのメソッドで業務の操作に名前を付ける（<ChapterLink n={31} section="model-api" />）、Concern でモデルの中を意味ごとに分ける（<ChapterLink n={31} section="concern" />）、複数のモデルにまたがる手順だけを Service に分ける（<ChapterLink n={33} />）、の順に試すと、規約の外に出る範囲を小さくできます。</p>
        </>
      ),
    },
    {
      id: "decision",
      title: "判断基準とトレードオフ",
      body: (
        <>
          <p>この章で比べた3つの形を、採用する条件、採用しないほうがよい条件、主な費用で整理します。表の判断は本書の評価で、チームの人数やモデルの数だけで決まるものではありません。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">形</th>
                  <th scope="col">採用する条件</th>
                  <th scope="col">採用しないほうがよい条件</th>
                  <th scope="col">主な費用</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Rails Way</th>
                  <td>規則がモデル1つか2つに収まる。経路は Web とジョブ程度</td>
                  <td>同じ手順が複数のコントローラーとジョブに複製されている</td>
                  <td>規則と保存が同じクラスにあり、規則だけを切り出して動かしにくい</td>
                </tr>
                <tr>
                  <th scope="row">外部 API の境界だけにポート</th>
                  <td>外部サービスの失敗を分類したい。開発環境で本物を呼べない。サービスの乗り換えがありうる</td>
                  <td>外部サービスが1つで、失敗の分類も要らない</td>
                  <td>アダプター2つと契約テスト。設定で実装を選ぶ仕組み</td>
                </tr>
                <tr>
                  <th scope="row">全面採用</th>
                  <td>複雑な規則が頻繁に変わり、Web 以外の経路や別のアプリケーションからも使う。中心から保存を呼べないことを保証したい</td>
                  <td>画面の入力をほぼそのまま保存する CRUD が中心。テストの速さだけが理由</td>
                  <td>詰め替えのコード、列を足すたびの変更、Rails の機能の再実装、独自に決めた規約の保守</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>過剰設計の具体例も挙げておきます。どれも、取り決めを置く理由がないまま形だけを取り入れた例です。</p>
          <ul>
            <li><code>OrderRepository#find</code> が <code>Order.find</code> を呼んで Active Record のオブジェクトをそのまま返す：呼び出し側は <code>update!</code> も関連も使えるので、境界の効果がなく、読む箇所だけが増えます（<ChapterLink n={109} section="repository" />）。</li>
            <li>ユースケースのクラスが <code>Order.create!(params)</code> を1行呼ぶだけ：手順も分岐もないなら、コントローラーからモデルを呼べば足ります。</li>
            <li>実装が1つしかないポートを、すべての外部呼び出しに用意する：差し替える予定も、失敗を分類する必要もないなら、クラスメソッドで足ります（<ChapterLink n={58} />）。</li>
          </ul>
          <p>反対に、境界が足りない例は、同じ確定の条件がコントローラー、ジョブ、管理画面に1つずつ書かれ、条件を変えるたびに3か所を直している状態です。この場合はまずモデルのメソッドかユースケースのクラスに条件を集め、それでも外部の都合が規則に混ざるなら、その境界にだけポートを置きます。</p>
          <p>導入するときはアプリ全体を一度に変えず、1つの機能で試します。試した後で、変更のときに読んだファイルの数、列を足したときの変更の範囲、テストの実行時間、不具合の数がどう変わったかを比べ、続けるかを決めます。決めた内容を記録するときは、層の名前よりも守るルールとその理由を書きます。たとえば「確定の条件は Web とバッチで共通なので <code>app/core</code> に置く」「決済サービスの停止は未払いと区別して 503 にする」と書いておくと、要件が変わったときに見直す対象が分かります。</p>
          <p>関連する章：<ChapterLink n={30} section="architecture-boundaries" />、<ChapterLink n={33} />、<ChapterLink n={34} section="rails-way-ddd" />、<ChapterLink n={40} />、<ChapterLink n={44} />、<ChapterLink n={67} />、<ChapterLink n={109} />、<ChapterLink n={110} />。</p>
          <Callout kind="note" title="この章の実行環境">
            <p>コードは Docker の ruby:4.0 イメージ（Ruby 4.0.9）で、Rails 8.1.4.1 の <code>rails new --minimal</code> で作ったアプリに rspec-rails 8.1.0 と packwerk 3.3.1 を入れて実行しました。DB は SQLite 3 です。テストの時間は WSL2 上の Docker で、作業ディレクトリをボリュームとして渡した条件での値です。</p>
          </Callout>
        </>
      ),
    },
  ],
  sources: [
    {
      title: "The Clean Architecture",
      publisher: "Robert C. Martin（The Clean Code Blog）",
      url: "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html",
      accessed: "2026-11-27",
      version: "2012年8月13日",
      note: "依存ルール（ソースコードの依存は内側にだけ向く）、円の数は模式的で4つに限らないこと、境界の横断に依存性逆転の原則と動的な多態を使うこと、境界を越えるのは単純なデータ構造でエンティティや DB の行を渡さないこと、Hexagonal などが同じ目的を持つこと。",
    },
    {
      title: "Repository",
      publisher: "Martin Fowler（Patterns of Enterprise Application Architecture のカタログ）",
      url: "https://www.martinfowler.com/eaaCatalog/repository.html",
      accessed: "2026-11-27",
      version: "Patterns of Enterprise Application Architecture",
      note: "業務のオブジェクトとデータの対応付けの間に置く部品としての Repository。",
    },
    {
      title: "Presentation Domain Data Layering",
      publisher: "Martin Fowler（bliki）",
      url: "https://martinfowler.com/bliki/PresentationDomainDataLayering.html",
      accessed: "2026-11-27",
      version: "2015年8月26日",
      note: "表示・ドメイン・データの3層、依存がプレゼンテーションからドメイン、ドメインからデータソースへ向くこと、層は比較的小さな単位で使い、大きくなったら最上位をドメインごとのモジュールに分けること。",
    },
    {
      title: "Designing a DDD-oriented microservice",
      publisher: "Microsoft Learn（.NET Microservices Architecture for Containerized .NET Applications）",
      url: "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice",
      accessed: "2026-11-27",
      version: "2021年1月13日版",
      note: "Evans の書籍から引用したドメイン層（業務の概念・状態・規則を表し、保存の技術的な詳細はインフラストラクチャに任せる）とアプリケーション層（仕事を定義し、薄く保ち、業務の規則を持たない）の説明。",
    },
    {
      title: "Hexagonal architecture",
      publisher: "Alistair Cockburn",
      url: "https://alistair.cockburn.us/hexagonal-architecture/",
      accessed: "2026-11-27",
      version: "2005年9月4日（HaT Technical Report 2005.02）",
      note: "利用者・プログラム・自動テスト・バッチから同じように動かすという目的、ポートとアダプターの定義、動かす側と使われる側、六角形の形には意味がないこと。",
    },
    {
      title: "Active Record",
      publisher: "Martin Fowler（Patterns of Enterprise Application Architecture のカタログ）",
      url: "https://www.martinfowler.com/eaaCatalog/activeRecord.html",
      accessed: "2026-11-27",
      version: "Patterns of Enterprise Application Architecture",
      note: "テーブルの1行を包み、DB へのアクセスを隠し、データに業務のロジックを加えるオブジェクトという定義。",
    },
    {
      title: "Autoloading and Reloading Constants",
      publisher: "Ruby on Rails Guides",
      url: "https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html",
      accessed: "2026-11-27",
      version: "Rails 8.1",
      note: "app の下の独自のディレクトリも自動でオートロードの対象になること、オートロードのパスがルートの名前空間を表し、app/services/users/signup.rb が Users::Signup を定義すると期待されること。",
    },
    {
      title: "packwerk 3.3.1（gem に同梱の README.md・USAGE.md）",
      publisher: "Shopify（rubygems.org）",
      url: "https://rubygems.org/gems/packwerk/versions/3.3.1",
      accessed: "2026-11-27",
      version: "packwerk 3.3.1",
      note: "パッケージにまとめて境界を守らせる gem であること、Zeitwerk で読み込む定数の参照だけを解決し、メソッドの呼び出しと受け渡されるオブジェクトは見ないこと、Zeitwerk の独自設定で誤検知が出ること、公開 API の検査が packwerk-extensions に移ったこと。check・update-todo・validate の出力はこの章のアプリで実行して確認。",
    },
    {
      title: "class Data",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/Data.html",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "Data.define で変更できない値のクラスを作ること。",
    },
    {
      title: "module Prism",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/Prism.html",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "Prism.parse・Prism.parse_file。構文木から定数の参照を集める例は Ruby 4.0.9 で実行。",
    },
    {
      title: "Test-induced design damage",
      publisher: "David Heinemeier Hansson",
      url: "https://dhh.dk/2014/test-induced-design-damage.html",
      accessed: "2026-11-27",
      version: "2014年4月29日",
      note: "Rails に Hexagonal Architecture を当てはめる理由が速いテストとコントローラーの単体テストにあることへの批判、Repository やコマンドを通すことで設計が分かりにくくなるという主張、モデルは DB を使ってテストし、コントローラーは結合テストで確かめるという勧め。",
    },
    {
      title: "The Rails Doctrine",
      publisher: "rubyonrails.org / David Heinemeier Hansson",
      url: "https://rubyonrails.org/doctrine",
      accessed: "2026-11-27",
      note: "Convention over Configuration と No one paradigm。",
    },
  ],
}

export default chapter
