import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 72-1 注文の一覧がたどる関連と、問題が起きる箇所 ---------- */
const sceneModels = [
  { x: 40, cls: 'Order', assoc: 'belongs_to :customer', table: 'orders' },
  { x: 225, cls: 'Customer', assoc: 'has_one :address', table: 'customers' },
  { x: 410, cls: 'Address', assoc: 'belongs_to :prefecture', table: 'addresses' },
  { x: 595, cls: 'Prefecture', assoc: 'name', table: 'prefectures' },
]

function SceneFigure() {
  return (
    <Svg
      id="72-1"
      w={780}
      h={384}
      label="注文の一覧のビュー orders/index.html.erb は、order.customer.address.prefecture.name と書いて、Order・Customer・Address・Prefecture の4つのクラスを順にたどる。Order は belongs_to :customer、Customer は has_one :address、Address は belongs_to :prefecture で、それぞれ orders・customers・addresses・prefectures テーブルに対応する。送り状の ShippingLabel も同じようにたどる。住所を登録していない会員では address が nil になり NoMethodError になる。注文1件ごとに customers・addresses・prefectures へ SELECT を1回ずつ発行する（N+1）"
    >
      <Box x={20} y={16} w={420} h={50} lines={['app/views/orders/index.html.erb', 'order.customer.address.prefecture.name']} fs={12} bold mono />
      <Box x={470} y={16} w={300} h={50} lines={['ShippingLabel（送り状）', '同じ関連を @order からたどる']} fs={12} bold subTone="muted" />
      {sceneModels.map((m, i) => (
        <g key={m.cls}>
          <Arrow x1={230} y1={66} x2={m.x + 75} y2={150} accent />
          <Box x={m.x} y={152} w={150} h={50} lines={[m.cls, m.assoc]} fs={12} bold subTone="muted" />
          {i < sceneModels.length - 1 && <Arrow x1={m.x + 150} y1={177} x2={m.x + 183} y2={177} dashed />}
          <line x1={m.x + 75} y1={202} x2={m.x + 75} y2={276} stroke="var(--fig-line)" strokeDasharray="3 4" />
          <Box x={m.x + 15} y={278} w={120} h={32} lines={m.table} fs={12} fill="box4" mono />
        </g>
      ))}
      <T x={500} y={100} fs={11} tone="acc">
        ビューが4つのクラスを順に呼ぶ
      </T>
      <T x={392} y={232} anchor="middle" fs={12} tone="danger">
        住所がないと address が nil
      </T>
      <T x={392} y={250} anchor="middle" fs={12} tone="danger">
        → NoMethodError
      </T>
      <T x={20} y={340} fs={12} tone="danger">
        注文1件ごとに customers・addresses・prefectures へ SELECT を1回ずつ発行する（N+1）
      </T>
      <T x={20} y={366} fs={11} tone="muted">
        青い矢印はビューからのメソッドの呼び出し、破線の矢印は関連。下段の緑の箱は MySQL のテーブル
      </T>
    </Svg>
  )
}

/* ---------- 図 72-2 注文3件の一覧で発行される SQL ---------- */
const queryTables = ['orders', 'customers', 'addresses', 'prefectures']

function QueriesFigure() {
  const beforeRows: { col: number; text: string }[] = [{ col: 0, text: 'ORDER BY id' }]
  for (let i = 1; i <= 3; i++) {
    beforeRows.push({ col: 1, text: `id = ${i}` }, { col: 2, text: `会員 ${i}` }, { col: 3, text: `id = ${i}` })
  }
  const afterRows = [
    { col: 0, text: 'ORDER BY id' },
    { col: 1, text: 'IN (1, 2, 3)' },
    { col: 2, text: 'IN (1, 2, 3)' },
    { col: 3, text: 'IN (1, 2, 3)' },
  ]
  const lx = (c: number) => 64 + c * 78
  const rx = (c: number) => 414 + c * 89
  const ry = (i: number) => 56 + i * 26
  return (
    <Svg
      id="72-2"
      w={780}
      h={372}
      label="注文3件の一覧で発行される SQL を、上から時間の順に並べた。直す前は、orders を1回読んだ後、注文ごとに customers を id で、addresses を会員の id で、prefectures を id で1回ずつ読み、合計10回になる。includes を使った後は、orders、customers、addresses、prefectures をそれぞれ IN でまとめて1回ずつ読み、合計4回になる"
    >
      <T x={10} y={14} bold>
        直す前（10回）
      </T>
      <T x={404} y={14} bold>
        includes を使った後（4回）
      </T>
      {queryTables.map((t, c) => (
        <g key={t}>
          <Box x={lx(c)} y={26} w={76} h={24} lines={t} fs={11} fill="box4" mono rx={0} />
          <Box x={rx(c)} y={26} w={87} h={24} lines={t} fs={11} fill="box4" mono rx={0} />
        </g>
      ))}
      {beforeRows.map((r, i) => (
        <g key={`b-${i}`}>
          <T x={56} y={ry(i) + 11} anchor="end" fs={11} tone="muted">
            {i + 1}
          </T>
          <Box x={lx(r.col)} y={ry(i)} w={76} h={22} lines={r.text} fs={11} fill={r.col === 0 ? 'box' : 'bg'} rx={3} />
        </g>
      ))}
      {[0, 1, 2].map((g) => (
        <g key={`g-${g}`}>
          <line x1={10} y1={ry(1 + g * 3) - 2} x2={10} y2={ry(3 + g * 3) + 24} stroke="var(--fig-danger)" strokeWidth={2} />
          <T x={16} y={ry(2 + g * 3) + 11} fs={10} tone="danger">
            {`A-00${g + 1}`}
          </T>
        </g>
      ))}
      {afterRows.map((r, i) => (
        <g key={`a-${i}`}>
          <T x={406} y={ry(i) + 11} anchor="end" fs={11} tone="muted">
            {i + 1}
          </T>
          <Box x={rx(r.col)} y={ry(i)} w={87} h={22} lines={r.text} fs={11} fill="box5" rx={3} />
        </g>
      ))}
      <line x1={392} y1={8} x2={392} y2={320} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={10} y={340} fs={12} tone="danger">
        注文が N 件なら 1 + 3N 回（同じ行は、クエリキャッシュで省かれる）
      </T>
      <T x={404} y={340} fs={12} tone="acc">
        注文の件数によらず4回
      </T>
      <T x={10} y={362} fs={11} tone="muted">
        箱の中は WHERE の条件の要約。「会員 1」は customer_id = 1
      </T>
    </Svg>
  )
}

/* ---------- 図 72-3 メソッドがメッセージを送ってよい相手 ---------- */
const friends = [
  { y: 44, lines: ['self', 'ShippingLabel 自身'] },
  { y: 100, lines: ['M の引数のオブジェクト', '（to_s には引数がない）'] },
  { y: 156, lines: ['インスタンス変数のオブジェクト', '@order（Order）'] },
  { y: 212, lines: ['M の中で作ったオブジェクト', '組み立てる文字列など'] },
  { y: 268, lines: ['グローバル変数のオブジェクト', '論文では引数と同じに扱う'] },
]
const strangers = [
  { y: 100, lines: ['Customer', '@order.customer が返す'] },
  { y: 180, lines: ['Address', 'customer.address が返す'] },
  { y: 260, lines: ['Prefecture', 'address.prefecture が返す'] },
]

function FriendsFigure() {
  return (
    <Svg
      id="72-3"
      w={780}
      h={360}
      label="クラス C のメソッド M（例は ShippingLabel#to_s）がメッセージを送ってよい相手は、self、M の引数のオブジェクト、C のインスタンス変数のオブジェクト（@order）、M の中で作ったオブジェクト、グローバル変数のオブジェクト。論文では、M が作ったオブジェクトと M が呼んだメソッドが作ったオブジェクト、グローバル変数のオブジェクトを引数と同じに扱う。@order.customer が返す Customer、customer.address が返す Address、address.prefecture が返す Prefecture は、M から見て知らない相手で、メッセージを送らない"
    >
      <Box x={20} y={146} w={180} h={64} lines={['クラス C のメソッド M', '例：ShippingLabel#to_s']} fs={12} fill="box5" bold accent subTone="muted" />
      <T x={250} y={24} bold>
        メッセージを送ってよい相手
      </T>
      {friends.map((f) => (
        <g key={f.lines[0]}>
          <Arrow x1={200} y1={178} x2={248} y2={f.y + 22} accent />
          <Box x={250} y={f.y} w={250} h={44} lines={f.lines} fs={12} subTone="muted" />
        </g>
      ))}
      <T x={570} y={24} bold>
        知らない相手（送らない）
      </T>
      {strangers.map((s, i) => (
        <g key={s.lines[0]}>
          <Box x={570} y={s.y} w={200} h={44} lines={s.lines} fs={12} fill="bg" dashed subTone="muted" />
          {i < strangers.length - 1 && <Arrow x1={670} y1={s.y + 44} x2={670} y2={strangers[i + 1].y - 2} dashed />}
        </g>
      ))}
      <Arrow d="M500,178 L535,178 L535,122 L568,122" dashed />
      <T x={570} y={334} fs={12} tone="danger">
        戻り値をたどった先に送ると違反
      </T>
      <T x={20} y={346} fs={11} tone="muted">
        Lieberherr・Holland・Riel（1988）のオブジェクトによる定義をもとにした
      </T>
    </Svg>
  )
}

/* ---------- 図 72-4 直す前と後の呼び出し ---------- */
const beforeModels = ['Order', 'Customer', 'Address', 'Prefecture']
const afterModels = [
  ['Order', 'delegate … prefix: true'],
  ['Customer', 'delegate … allow_nil: true'],
  ['Address', 'delegate … prefix: true'],
  ['Prefecture', 'remote?（遠方の判断）'],
]

function CompareFigure() {
  const my = (i: number) => 44 + i * 70
  return (
    <Svg
      id="72-4"
      w={780}
      h={394}
      label="直す前は、ビューが Order・Customer・Address・Prefecture の4つのクラスを直接呼び、遠方の判断もビューが持つ。住所がないと NoMethodError、注文ごとに3回の SELECT が起きる。直した後は、コントローラーが Order の with_customer_destination を呼んで関連をまとめて読み込み、ビューは Order の customer_prefecture_name と customer_prefecture_remote? だけを呼ぶ。Order は Customer に、Customer は Address に、Address は Prefecture に delegate で頼み、遠方の判断は Prefecture#remote? が持つ"
    >
      <T x={10} y={18} bold>
        直す前
      </T>
      <Box x={20} y={44} w={170} h={50} lines={['orders/index', '遠方の判断も持つ']} fs={12} bold subTone="muted" />
      {beforeModels.map((m, i) => (
        <g key={m}>
          <Arrow x1={190} y1={69} x2={228} y2={my(i) + 22} accent />
          <Box x={230} y={my(i)} w={140} h={44} lines={m} fs={12} />
          {i < 3 && <Arrow x1={300} y1={my(i) + 44} x2={300} y2={my(i + 1) - 2} dashed />}
        </g>
      ))}
      <T x={20} y={332} fs={12} tone="danger">
        ビューが4つのクラスと関連の向きを知っている
      </T>
      <T x={20} y={352} fs={12} tone="danger">
        住所がないと例外、注文ごとに3回の SELECT
      </T>

      <line x1={390} y1={8} x2={390} y2={370} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={404} y={18} bold>
        直した後
      </T>
      <Box x={404} y={44} w={180} h={50} lines={['OrdersController', 'with_customer_destination']} fs={12} bold subTone="muted" />
      <Box x={404} y={114} w={180} h={50} lines={['orders/index', 'customer_prefecture_name']} fs={12} bold subTone="muted" />
      <Arrow x1={584} y1={69} x2={618} y2={66} />
      <Arrow x1={584} y1={139} x2={618} y2={78} accent />
      {afterModels.map((m, i) => (
        <g key={m[0]}>
          <Box x={620} y={my(i)} w={150} h={44} lines={m} fs={12} fill={i === 0 ? 'box5' : 'box'} bold subTone="muted" accent={i === 0} />
          {i < 3 && <Arrow x1={695} y1={my(i) + 44} x2={695} y2={my(i + 1) - 2} />}
        </g>
      ))}
      <Box
        x={404}
        y={194}
        w={190}
        h={64}
        lines={['Order の scope', 'includes(customer: {', '  address: :prefecture })']}
        fs={11}
        fill="bg"
        dashed
        mono
        align="start"
      />
      <T x={404} y={332} fs={12} tone="acc">
        ビューが呼ぶのは Order だけ。各クラスは隣だけを呼ぶ
      </T>
      <T x={404} y={352} fs={12} tone="acc">
        たどる関連は scope の1か所に書く（SELECT は4回）
      </T>
      <T x={10} y={384} fs={11} tone="muted">
        青い矢印はビューからの呼び出し。破線の矢印は関連、実線の矢印は delegate による呼び出し
      </T>
    </Svg>
  )
}

/* ---------- 図 72-6 delegate を使うときと使わないとき ---------- */
function JudgeFigure() {
  return (
    <Svg
      id="72-6"
      w={780}
      h={452}
      label="呼び出し側が関連の先にあるものを使いたいときの判断。まず、同じ種類の新しいオブジェクトを返すメソッドの連鎖（Relation・String・Array）なら、デメテルの法則の対象外なのでそのまま書く。次に、関連の先の値で判断や計算をしているなら、その判断を値の持ち主に移す（Tell, Don't Ask。例は Prefecture#remote?）。次に、使う値が1つか2つなら delegate で取り出す（名前は prefix、nil がありうるなら allow_nil）。多くの値を使うなら、関連の先の部品を1つ受け取り、引数として渡す（例は住所の部分テンプレートに Address を渡す）。どの場合も、一覧で使うなら関連の読み込み（includes）を scope に置く"
    >
      <Box x={20} y={14} w={340} h={44} lines="呼び出し側が、関連の先にあるものを使いたい" fs={12} bold />
      <Box x={20} y={88} w={340} h={54} lines={['同じ種類の新しいオブジェクトを返す', 'メソッドの連鎖か（Relation・String・Array）']} fs={12} />
      <Box x={20} y={178} w={340} h={54} lines={['関連の先の値を使って、', '判断や計算をしているか']} fs={12} />
      <Box x={20} y={268} w={340} h={54} lines={['使う値は1つか2つか']} fs={12} />
      <Box x={420} y={88} w={350} h={54} lines={['デメテルの法則の対象外', 'そのまま書く']} fs={12} fill="bg" bold subTone="muted" />
      <Box x={420} y={178} w={350} h={54} lines={['判断を値の持ち主に移す（Tell, Don\'t Ask）', '例：Prefecture#remote?']} fs={12} fill="box2" bold subTone="muted" />
      <Box x={420} y={268} w={350} h={54} lines={['delegate で取り出す', '名前は prefix、nil がありうるなら allow_nil']} fs={12} fill="box2" bold subTone="muted" />
      <Box x={20} y={358} w={340} h={54} lines={['部品を1つ受け取り、引数として渡す', '例：住所の部分テンプレートに Address を渡す']} fs={12} fill="box2" bold subTone="muted" />
      <Arrow x1={190} y1={58} x2={190} y2={86} />
      <Arrow x1={360} y1={115} x2={418} y2={115} />
      <Arrow x1={190} y1={142} x2={190} y2={176} />
      <Arrow x1={360} y1={205} x2={418} y2={205} />
      <Arrow x1={190} y1={232} x2={190} y2={266} />
      <Arrow x1={360} y1={295} x2={418} y2={295} />
      <Arrow x1={190} y1={322} x2={190} y2={356} />
      {[106, 196, 286].map((y) => (
        <T key={y} x={389} y={y} anchor="middle" fs={11} tone="muted">
          はい
        </T>
      ))}
      {[160, 250, 340].map((y) => (
        <T key={y} x={198} y={y} fs={11} tone="muted">
          いいえ
        </T>
      ))}
      <T x={420} y={380} fs={12} tone="acc">
        どの場合も、一覧で使うなら
      </T>
      <T x={420} y={398} fs={12} tone="acc">
        関連の読み込み（includes）を scope に置く
      </T>
      <T x={20} y={440} fs={11} tone="muted">
        色の付いた箱は直し方。部品を引数で受け取った側にとって、その部品はメッセージを送ってよい相手になる
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 74,
  part: 8,
  title: 'Law of Demeter：order.customer.address.prefecture.name をたどらない',
  summary:
    '出荷待ちの注文の一覧で order.customer.address.prefecture.name と関連をたどったために、住所を登録していない会員の注文で画面全体が NoMethodError になり、注文ごとに3回の SELECT が発行される場面から始めます。Lieberherr らの1988年の論文の定義を確かめ、Rails の delegate（allow_nil・prefix）で隣のオブジェクトにだけ頼む形に直し、delegate だけでは減らない SQL を includes の scope で減らします。最後に、delegate を増やしすぎたときの問題と、Tell, Don\'t Ask との関係を扱います。',
  goals: [
    '関連を長くたどる呼び出しで、nil による例外・N+1・構造の変更の影響が起きる理由を説明できる',
    'Lieberherr・Holland・Riel の論文が定めた「メッセージを送ってよい相手」を、Rails のモデルとビューに当てはめて判断できる',
    'delegate の allow_nil・prefix・private の働きと、委譲先が nil のときの ActiveSupport::DelegationError を説明できる',
    'delegate では SQL の回数が変わらないことを確かめ、たどる関連を includes の scope にまとめて N+1 を防げる',
    'delegate を増やしすぎたときの問題（中継するだけのメソッドが増える）を見分け、Tell, Don\'t Ask や部品を渡す方法と使い分けられる',
  ],
  prerequisites: [13, 73],
  sections: [
    {
      id: 'scene',
      title: '関連をたどる長い呼び出しと、住所のない会員・N+1',
      body: (
        <>
          <p>
            この章では注文から届け先の都道府県までを関連でたどる一覧の画面を例に、<Term en="Law of Demeter">デメテルの法則</Term>を扱います。デメテルの法則はオブジェクトの内部構造に深く依存せず、必要以上にほかのオブジェクトの内部をたどらないという原則です。まず、関連を長くたどったコードを動かし、住所のない会員の注文と、発行される SQL の回数を確かめます。
          </p>
          <h3>そもそも何を表示するのか</h3>
          <p>
            EC サイトの倉庫では、担当者が出荷待ちの注文の一覧を見て、送り状を用意します。一覧には注文番号・会員の名前・届け先の都道府県を並べ、北海道と沖縄県あての注文には「遠方」と表示します。遠方の注文は送り状の手配に日数がかかるので、担当者が先に処理するためです。
          </p>
          <p>
            データは4つのテーブルに分かれています。注文（orders）は会員（customers）を指し、会員は住所（addresses）を1つ持ち、住所は都道府県（prefectures）を指します。会員登録だけをして住所をまだ登録していない会員もいます。店頭で受け取る注文なら、住所がなくても注文できるからです。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_shop_tables.rb"
            code={`
class CreateShopTables < ActiveRecord::Migration[8.1]
  def change
    create_table :prefectures do |t|
      t.string :name, null: false
    end
    create_table :customers do |t|
      t.string :name, null: false
    end
    create_table :addresses do |t|
      t.references :customer, null: false, foreign_key: true, index: { unique: true }
      t.references :prefecture, null: false, foreign_key: true
      t.string :city, null: false
    end
    create_table :orders do |t|
      t.references :customer, null: false, foreign_key: true
      t.string :number, null: false
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/order.rb・customer.rb・address.rb・prefecture.rb（直す前）"
            code={`
class Order < ApplicationRecord
  belongs_to :customer
end

class Customer < ApplicationRecord
  has_many :orders
  has_one :address # 住所を登録していない会員もいる
end

class Address < ApplicationRecord
  belongs_to :customer
  belongs_to :prefecture
end

class Prefecture < ApplicationRecord
end
`}
          />
          <h3>関連をたどって表示するコード</h3>
          <p>コントローラーは注文を id の順に並べ、ビューは各注文から関連をたどって会員の名前と都道府県を表示します。</p>
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb（直す前）"
            code={`
# 倉庫の担当者が見る出荷待ちの注文の一覧
class OrdersController < ApplicationController
  def index
    @orders = Order.order(:id)
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/orders/index.html.erb（直す前）"
            code={`
<table>
  <% @orders.each do |order| %>
    <tr>
      <td><%= order.number %></td>
      <td><%= order.customer.name %></td>
      <td><%= order.customer.address.prefecture.name %></td>
      <td><%= "遠方" if %w[北海道 沖縄県].include?(order.customer.address.prefecture.name) %></td>
    </tr>
  <% end %>
</table>
`}
          />
          <p>送り状に印刷する届け先を作る ShippingLabel も、同じ関連をたどっています。</p>
          <Code
            lang="ruby"
            title="app/models/shipping_label.rb（直す前）"
            code={`
# 送り状に印刷する届け先
class ShippingLabel
  def initialize(order) = @order = order

  def to_s
    address = @order.customer.address
    "#{address.prefecture.name}#{address.city} #{@order.customer.name} 様"
  end
end
`}
          />
          <Figure n="72-1" title="注文の一覧がたどる関連と、問題が起きる箇所" caption="赤い文字は、次の項で確かめる2つの問題。">
            <SceneFigure />
          </Figure>
          <p>
            図 72-1 のとおり、ビューの1つの式が Order・Customer・Address・Prefecture の4つのクラスを順に呼んでいます。式の途中のどこかが nil になると例外になり、たどるたびに関連を読み込むための SELECT が発行されます。
          </p>
          <h3>住所を登録していない会員の注文</h3>
          <p>住所を登録していない会員の注文が一覧に入る場合を、request spec で確かめました。</p>
          <Code
            lang="ruby"
            title="spec/requests/orders_spec.rb（直す前に実行した2つの例）"
            code={`
require "rails_helper"

RSpec.describe "注文の一覧", type: :request do
  let(:tokyo) { Prefecture.create!(name: "東京都") }

  it "届け先の都道府県を表示する" do
    customer = Customer.create!(name: "会員1")
    customer.create_address!(prefecture: tokyo, city: "千代田区")
    customer.orders.create!(number: "A-001")
    get orders_path
    expect(response.body).to include("A-001", "東京都")
  end

  it "住所を登録していない会員の注文も表示する" do
    Customer.create!(name: "会員2").orders.create!(number: "B-001")
    get orders_path
    expect(response.body).to include("B-001", "住所未登録")
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests/orders_spec.rb。バックトレースは省略）"
            code={`
.F

Failures:

  1) 注文の一覧 住所を登録していない会員の注文も表示する
     Failure/Error: <td><%= order.customer.address.prefecture.name %></td>

     ActionView::Template::Error:
       undefined method 'prefecture' for nil
     # ./app/views/orders/index.html.erb:6:in 'block in _app_views_orders_index_html_erb___2219712793719590546_5448'
     # …（省略）
     # --- Caused by: ---
     # NoMethodError:
`}
          />
          <p>
            <code>order.customer.address</code> が nil を返し、nil に <code>prefecture</code> を送ったところで NoMethodError になりました。ビューの中の例外なので ActionView::Template::Error として伝わり（元の NoMethodError は cause に入ります）、本番ではこの1件のために一覧の画面全体が 500 になります。住所のない会員が1人いるだけで、倉庫の担当者はほかの注文も見られなくなります。
          </p>
          <h3>発行される SQL</h3>
          <p>
            次に、注文を3件作って一覧の画面を開き、発行された SQL を数えるスクリプトを動かしました。ActiveSupport::Notifications の sql.active_record を購読して、DB に送った SQL を集めます。
          </p>
          <Code
            lang="ruby"
            title="script/list.rb（seed_orders は script/data.rb にある、注文を n 件作るメソッド）"
            code={`
# 注文の一覧の画面を開き、発行した SQL を数える
require_relative "data"
seed_orders(Integer(ENV.fetch("N", "3")), without_address: ENV["NO_ADDRESS"] == "1")

queries = []
counter = lambda do |*, payload|
  next if payload[:name] == "SCHEMA" || payload[:cached] || payload[:sql].include?("schema_migrations")
  queries << payload[:sql].sub(%r{ /\\*.*\\*/\\z}, "") # 末尾のクエリのタグを外す
end
Rails.application.env_config["action_dispatch.show_exceptions"] = :none # 例外をエラー画面にせず、そのまま受け取る
session = ActionDispatch::Integration::Session.new(Rails.application)
session.host! "localhost"
begin
  ActiveSupport::Notifications.subscribed(counter, "sql.active_record") { session.get "/orders" }
  puts "ステータス：#{session.response.status}"
  puts session.response.body.scan(%r{<td>(.*?)</td>}).flatten.each_slice(4).map { |row| row.join(" | ") } if ENV["ROWS"]
rescue => e
  puts "#{e.class}: #{e.message}"
end
puts queries if ENV["SQL"]
puts "SQL の回数：#{queries.size}"
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development ROWS=1 SQL=1 bin/rails runner script/list.rb）"
            code={`
ステータス：200
A-001 | 会員1 | 東京都 |
A-002 | 会員2 | 沖縄県 | 遠方
A-003 | 会員3 | 大阪府 |
SELECT \`orders\`.* FROM \`orders\` ORDER BY \`orders\`.\`id\` ASC
SELECT \`customers\`.* FROM \`customers\` WHERE \`customers\`.\`id\` = 1 LIMIT 1
SELECT \`addresses\`.* FROM \`addresses\` WHERE \`addresses\`.\`customer_id\` = 1 LIMIT 1
SELECT \`prefectures\`.* FROM \`prefectures\` WHERE \`prefectures\`.\`id\` = 1 LIMIT 1
SELECT \`customers\`.* FROM \`customers\` WHERE \`customers\`.\`id\` = 2 LIMIT 1
SELECT \`addresses\`.* FROM \`addresses\` WHERE \`addresses\`.\`customer_id\` = 2 LIMIT 1
SELECT \`prefectures\`.* FROM \`prefectures\` WHERE \`prefectures\`.\`id\` = 2 LIMIT 1
SELECT \`customers\`.* FROM \`customers\` WHERE \`customers\`.\`id\` = 3 LIMIT 1
SELECT \`addresses\`.* FROM \`addresses\` WHERE \`addresses\`.\`customer_id\` = 3 LIMIT 1
SELECT \`prefectures\`.* FROM \`prefectures\` WHERE \`prefectures\`.\`id\` = 3 LIMIT 1
SQL の回数：10
`}
          />
          <p>
            Active Record の関連は、最初にそのメソッドを呼んだときに SELECT を発行して相手を読み込みます。これを<Term en="lazy loading">遅延読み込み</Term>と呼びます。ビューは注文ごとに customer・address・prefecture を順に呼ぶので、注文を読む1回に加えて、注文1件につき3回の SELECT が発行されました。このように、一覧の件数 N に比例して SQL が増える問題を N+1 問題と呼びます（<ChapterLink n={13} section="n-plus-one" />）。図 72-2 の左はこの10回を時間の順に並べたものです。
          </p>
          <Figure n="72-2" title="注文3件の一覧で発行される SQL" caption="上から時間の順。右は、後の節で includes を使った後の結果。">
            <QueriesFigure />
          </Figure>
          <p>注文を30件にすると、SQL は64回になりました。</p>
          <Code
            lang="text"
            title="実行結果（N=30 bin/rails runner script/list.rb）"
            code={`
ステータス：200
SQL の回数：64
`}
          />
          <p>
            1 + 30 × 3 = 91 回にならないのは、3つの都道府県を繰り返し使っているからです。コントローラーの処理の中では Active Record のクエリキャッシュが有効で、同じ SQL を2回目からは DB に送りません。都道府県は最初の3回だけ読み、残りの27回はキャッシュから返しました。会員と住所は注文ごとに違うので、30回ずつ発行されています。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>ビューと ShippingLabel が、Order・Customer・Address・Prefecture の4つのクラスと、その間の関連の向き（会員が住所を1つ持つこと、住所が都道府県を指すこと）を知っています。</li>
            <li>関連の途中が nil になりうることを、呼び出し側が知っていなければなりません。知らずに書いた1か所の式で、一覧の画面全体が 500 になります。</li>
            <li>関連をたどるたびに SELECT が発行され、注文の件数に比例して SQL が増えます。</li>
            <li>「北海道と沖縄県は遠方」という判断を、ビューが都道府県の名前を取り出して行っています。</li>
            <li>住所の持ち方（たとえば、1人の会員が複数の届け先を持てるようにする）を変えると、関連をたどっている箇所をすべて直します。直す前のコードで、関連をたどっている行を探した結果です。</li>
          </ul>
          <Code
            lang="text"
            title={`実行結果（grep -rnE "\\.(address|prefecture)\\b" app）`}
            code={`
app/views/orders/index.html.erb:6:      <td><%= order.customer.address.prefecture.name %></td>
app/views/orders/index.html.erb:7:      <td><%= "遠方" if %w[北海道 沖縄県].include?(order.customer.address.prefecture.name) %></td>
app/models/shipping_label.rb:6:    address = @order.customer.address
app/models/shipping_label.rb:7:    "#{address.prefecture.name}#{address.city} #{@order.customer.name} 様"
`}
          />
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'デメテルの法則の意味と由来',
      body: (
        <>
          <h3>デメテルの法則の定義</h3>
          <p>
            Law of Demeter（デメテルの法則）は、オブジェクトの内部構造に深く依存しないようにする原則です。あるオブジェクトのメソッドは、自分が直接知っている相手にだけメッセージを送り、相手から返されたオブジェクトのさらに内部をたどりません。<Term en="Principle of Least Knowledge">最小知識の原則</Term>とも呼ばれ、Northeastern University の解説のページは、標語を「Only talk to your friends」（友だちとだけ話す）としています<Ref n={2} />。
          </p>
          <h3>Lieberherr・Holland・Riel の1988年の論文</h3>
          <p>
            この規則は 1987年の秋に Northeastern University の Ian Holland が提案したもので、Demeter というプロジェクトの研究の中で見つかったことから、この名前が付きました<Ref n={2} />。Karl Lieberherr・Ian Holland・Arthur Riel は、1988年9月の OOPSLA '88 の論文「Object-Oriented Programming: An Objective Sense of Style」で、この規則を次のように定めています<Ref n={1} />。
          </p>
          <blockquote>
            すべてのクラス C と、C に属するすべてのメソッド M について、M がメッセージを送るオブジェクトは、次のどれかでなければならない。(1) M の引数のオブジェクト（self を含む）。(2) C のインスタンス変数のオブジェクト。ただし、M が作ったオブジェクト、M が呼んだ関数やメソッドが作ったオブジェクト、グローバル変数のオブジェクトは、M の引数と同じに扱う。（論文の第3節にある、オブジェクトによる定義を訳した）
          </blockquote>
          <p>
            論文はこの規則の目的を2つ挙げています。1つ目は、クラスの構造が変わったときにプログラムを直しやすくすること、2つ目は、メソッドを書くときに意識しなければならない型の数を減らすことです<Ref n={1} />。また、この規則を守るときは、コードの重複・メソッドの引数の数・クラスあたりのメソッドの数をできるだけ少なくすることも合わせて求めています<Ref n={1} />。この3つの条件は後の「当てはめすぎたとき」の節で使います。
          </p>
          <Figure n="72-3" title="メソッドがメッセージを送ってよい相手" caption="左の M から実線で結んだ相手には送ってよい。右の破線の箱は、戻り値をたどった先にある知らない相手。">
            <FriendsFigure />
          </Figure>
          <p>
            図 72-3 は直す前の ShippingLabel#to_s に当てはめたものです。to_s が送ってよい相手は、self、インスタンス変数の @order、自分で組み立てる文字列などです。<code>@order.customer</code> は @order に送っているので許されますが、返ってきた Customer に <code>address</code> を送るところから、知らない相手へのメッセージになります。
          </p>
          <h3>Rails のコードに当てはめるときの読み方</h3>
          <ul>
            <li>
              Active Record の関連は、モデルが直接持つ部品として扱えます。Northeastern University の一般的な定式化は、メソッドのクラスが直接持つ部品のクラスを、保存しているもの（インスタンス変数）と計算で返すもの（メソッドの戻り値）の両方としています<Ref n={3} />。Order のメソッドの中で <code>customer.name</code> と書くのは許されます。
            </li>
            <li>
              ビューでは、コントローラーが渡した @orders と、each のブロックの引数の order が送ってよい相手です。<code>order.customer</code> までは許され、その先の <code>.address.prefecture.name</code> は知らない相手へのメッセージです。
            </li>
            <li>
              <code>Order.where(...).order(:id).limit(10)</code> のような Relation の連鎖は、メソッドごとに新しい Relation を作って返します。論文は、M が呼んだメソッドが作ったオブジェクトを引数と同じに扱うので<Ref n={1} />、この連鎖は規則に反しません。文字列や配列を変換していく連鎖も同じです。「1行にドットは1つ」という言い方は、この規則を大まかに言い換えたもので、ドットの数そのものを数える規則ではありません。
            </li>
          </ul>
          <h3>ほかの人による言い換え</h3>
          <p>
            Andy Hunt と Dave Thomas は、IEEE Software の 2003年のコラム「The Art of Enbugging」で、この規則を「The Pretty Good Idea of Demeter」という見出しで紹介しています。オブジェクトが呼んでよいのは、自分自身・メソッドに渡された引数・自分が作ったオブジェクト・直接持っている部品のオブジェクトだけで、ほかの呼び出しから返されたオブジェクトのメソッドは含まれないと説明し、法則というより「よい考え」だと書いています<Ref n={4} />。同じコラムは、この形では中継するだけの小さなメソッドを多く書くことになるという欠点も挙げています<Ref n={4} />。
          </p>
          <p>
            Martin Fowler も、メソッドの長い連鎖は問題の兆候だが、反対に、転送するだけのメソッドで膨らんだ中継役のオブジェクトも問題の兆候だと述べ、「Suggestion of Demeter（デメテルの提案）」という名前ならもっと納得できると書いています<Ref n={5} />。本書でも、この原則を守るべき法則ではなく、判断の基準として扱います。
          </p>
          <h3>情報隠蔽との関係</h3>
          <p>
            <ChapterLink n={73} />（Information Hiding）は、変わりうる設計の判断を1つのモジュールに隠す原則でした。<code>order.customer.address.prefecture.name</code> は、「会員が住所を1つ持つ」「住所が都道府県のテーブルを指す」という設計の判断を、呼び出し側のコードに書き込んでいます。住所の持ち方を変えると、この式を書いたすべての場所を直します。
          </p>
          <p>
            1988年の論文は、デメテルの法則を「information restriction（情報の使用の制限）」と呼び、情報隠蔽を補うものだと位置づけています。メソッドを隠すのではなく、公開したうえで、その使い方を制限するという考え方です<Ref n={1} />。Northeastern University のページは、この規則が一般的な低結合の原則（<ChapterLink n={70} />）をより具体的にしたものだとも説明しています<Ref n={3} />。
          </p>
          <h3>Tell, Don't Ask との関係</h3>
          <p>
            <ChapterLink n={77} />（Tell, Don't Ask）は、オブジェクトの状態を聞いて外で判断するのではなく、オブジェクト自身に振る舞いを実行させる原則です。Fowler は、データとそれを扱う処理を1つのオブジェクトにまとめるための原則だと説明し、この原則は Andy Hunt と Dave Thomas の名前と結びつけて語られることが多いと書いています<Ref n={6} />。前に挙げた Hunt と Thomas のコラムも、Tell, Don't Ask とデメテルの法則を同じ記事の中で扱っています<Ref n={4} />。
          </p>
          <p>
            2つの原則は重なりますが、確かめる点が違います。デメテルの法則は「誰にメッセージを送っているか」を、Tell, Don't Ask は「値を取り出して呼び出し側で判断していないか」を確かめます。直す前のビューの「遠方」は、都道府県の名前を取り出してビューが判断しているので、両方に反しています。次の節では、名前の取り出しを delegate で隣のオブジェクトへの依頼に変え、遠方の判断は Prefecture に移します。
          </p>
        </>
      ),
    },
    {
      id: 'apply',
      title: '隣のオブジェクトにだけ頼み、たどる関連を scope にまとめる',
      body: (
        <>
          <h3>よくある直し方：安全参照演算子を付ける</h3>
          <p>
            NoMethodError を止めるだけなら、Ruby の安全参照演算子 <code>&amp;.</code> を付ける方法があります。<code>a&amp;.b</code> は、a が nil なら b を呼ばずに nil を返します。
          </p>
          <Code
            lang="erb"
            title="app/views/orders/index.html.erb（&. を付けたもの）"
            code={`
<table>
  <% @orders.each do |order| %>
    <tr>
      <td><%= order.number %></td>
      <td><%= order.customer.name %></td>
      <td><%= order.customer.address&.prefecture&.name || "住所未登録" %></td>
      <td><%= "遠方" if %w[北海道 沖縄県].include?(order.customer.address&.prefecture&.name) %></td>
    </tr>
  <% end %>
</table>
`}
          />
          <Code
            lang="text"
            title="実行結果（NO_ADDRESS=1 ROWS=1 bin/rails runner script/list.rb と N=30 で実行）"
            code={`
ステータス：200
A-001 | 会員1 | 東京都 |
A-002 | 会員2 | 沖縄県 | 遠方
A-003 | 会員3 | 大阪府 |
B-001 | 住所未登録の会員 | 住所未登録 |
SQL の回数：12

ステータス：200
SQL の回数：64
`}
          />
          <p>
            例外はなくなり、request spec も通りました。しかし、ビューは今も4つのクラスと関連の向きを知っていて、どこに &amp;. が必要かを呼び出し側が判断しています。SQL の回数も変わりません。&amp;. は nil の扱いを1か所ずつ足す方法で、構造への依存と N+1 はそのまま残ります。
          </p>
          <h3>delegate：隣のオブジェクトのメソッドを自分のメソッドとして公開する</h3>
          <p>
            Rails の Active Support は、<code>delegate</code> というクラスメソッドを Module に加えています。<code>delegate :name, to: :prefecture</code> と書くと、<code>prefecture.name</code> を呼ぶだけの <code>name</code> メソッドが作られます。このように、受けた依頼を別のオブジェクトに渡して処理させることを<Term en="delegation">委譲</Term>と呼びます。Rails Guides は、メソッドを自分で書くより短く、意図がはっきりすると説明しています<Ref n={7} />。
          </p>
          <p>delegate には、この章で使う2つのオプションがあります。住所を持つだけの小さなクラスで違いを確かめました。</p>
          <ul>
            <li><code>allow_nil: true</code>：委譲先が nil のとき、例外ではなく nil を返します<Ref n={7} />。</li>
            <li><code>prefix: true</code> または <code>prefix: :名前</code>：作るメソッドの名前の前に、委譲先の名前または指定した名前を付けます<Ref n={7} />。</li>
          </ul>
          <Code
            lang="ruby"
            title="script/delegate_options.rb"
            code={`
# delegate の allow_nil と prefix の違いを、住所を持つだけの小さなクラスで確かめる
Strict = Struct.new(:address) { delegate :prefecture_name, to: :address }
Lenient = Struct.new(:address) { delegate :prefecture_name, to: :address, allow_nil: true }
Prefixed = Struct.new(:address) do
  delegate :prefecture_name, to: :address, prefix: true   # => address_prefecture_name
  delegate :prefecture_name, to: :address, prefix: :home  # => home_prefecture_name
end

address = Address.new(prefecture: Prefecture.new(name: "沖縄県"), city: "那覇市")
puts "Strict（住所あり）：#{Strict.new(address).prefecture_name}"
begin
  Strict.new(nil).prefecture_name
rescue => e
  puts "Strict（住所なし）：#{e.class}: #{e.message}"
  puts "  NoMethodError の一種か：#{e.is_a?(NoMethodError)}"
end
puts "Lenient（住所なし）：#{Lenient.new(nil).prefecture_name.inspect}"
puts "Prefixed のメソッド：#{(Prefixed.public_instance_methods(false) - [:address, :address=]).sort.inspect}"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/delegate_options.rb。Address は直した後のもの）"
            code={`
Strict（住所あり）：沖縄県
Strict（住所なし）：ActiveSupport::DelegationError: prefecture_name delegated to address, but address is nil
  NoMethodError の一種か：true
Lenient（住所なし）：nil
Prefixed のメソッド：[:address_prefecture_name, :home_prefecture_name]
`}
          />
          <p>
            allow_nil を付けない delegate は、委譲先が nil のとき ActiveSupport::DelegationError を投げます。このクラスは NoMethodError のサブクラスで、メッセージに「どのメソッドを、どの委譲先に渡そうとして、委譲先が nil だったか」が入ります<Ref n={9} />。素の NoMethodError（undefined method 'prefecture' for nil）より、原因の場所がわかりやすくなります。allow_nil を付けると nil が返ります。
          </p>
          <h3>各クラスに、隣のクラスへの delegate を置く</h3>
          <p>
            関連の端から順に、各クラスが隣のクラスにだけ頼む形にします。まず、遠方かどうかの判断を、都道府県の名前を持つ Prefecture に移します。ビューが名前を取り出して判断していたものを、名前の持ち主に聞く形です。
          </p>
          <Code
            lang="ruby"
            title="app/models/prefecture.rb（直した後）"
            code={`
class Prefecture < ApplicationRecord
  REMOTE_NAMES = %w[北海道 沖縄県].freeze

  # 遠方（送り状の手配に日数がかかる地域）か
  def remote? = REMOTE_NAMES.include?(name)
end
`}
          />
          <p>
            Address は Prefecture の name と remote? を、prefix: true で <code>prefecture_name</code> と <code>prefecture_remote?</code> として公開します。Address にとって name だけでは住所の名前と区別できないので、prefix で何の名前かを示します。送り状に使う1行の住所も Address に置きます。
          </p>
          <Code
            lang="ruby"
            title="app/models/address.rb（直した後）"
            code={`
class Address < ApplicationRecord
  belongs_to :customer
  belongs_to :prefecture

  delegate :name, :remote?, to: :prefecture, prefix: true # => prefecture_name, prefecture_remote?

  def line = "#{prefecture_name}#{city}"
end
`}
          />
          <p>
            Customer は住所を持たないことがあるので、allow_nil: true を付けます。住所がない会員では、3つのメソッドがどれも nil を返します。nil になりうることを知っているのは、has_one :address を宣言している Customer だけになります。
          </p>
          <Code
            lang="ruby"
            title="app/models/customer.rb（直した後）"
            code={`
class Customer < ApplicationRecord
  has_many :orders
  has_one :address # 住所を登録していない会員もいる

  # 住所がなければ nil を返す
  delegate :prefecture_name, :prefecture_remote?, to: :address, allow_nil: true
  delegate :line, to: :address, prefix: true, allow_nil: true # => address_line
end
`}
          />
          <p>
            Order は Customer のメソッドを、prefix: true で <code>customer_</code> を付けて公開します。belongs_to :customer は既定で会員を必須にしているので、allow_nil は付けません。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直した後の途中。scope は後で足す）"
            code={`
class Order < ApplicationRecord
  belongs_to :customer

  # => customer_name, customer_prefecture_name, customer_prefecture_remote?, customer_address_line
  delegate :name, :prefecture_name, :prefecture_remote?, :address_line, to: :customer, prefix: true
end
`}
          />
          <p>ビューと ShippingLabel は、Order にだけメッセージを送ります。</p>
          <Code
            lang="erb"
            title="app/views/orders/index.html.erb（直した後）"
            code={`
<table>
  <% @orders.each do |order| %>
    <tr>
      <td><%= order.number %></td>
      <td><%= order.customer_name %></td>
      <td><%= order.customer_prefecture_name || "住所未登録" %></td>
      <td><%= "遠方" if order.customer_prefecture_remote? %></td>
    </tr>
  <% end %>
</table>
`}
          />
          <Code
            lang="ruby"
            title="app/models/shipping_label.rb（直した後）"
            code={`
# 送り状に印刷する届け先
class ShippingLabel
  def initialize(order) = @order = order

  def to_s = "#{@order.customer_address_line} #{@order.customer_name} 様"
end
`}
          />
          <h3>delegate だけでは SQL は減らない</h3>
          <p>ここまでの変更で、一覧の画面を開きました。</p>
          <Code
            lang="text"
            title="実行結果（NO_ADDRESS=1 ROWS=1 bin/rails runner script/list.rb と N=30 で実行）"
            code={`
ステータス：200
A-001 | 会員1 | 東京都 |
A-002 | 会員2 | 沖縄県 | 遠方
A-003 | 会員3 | 大阪府 |
B-001 | 住所未登録の会員 | 住所未登録 |
SQL の回数：12

ステータス：200
SQL の回数：64
`}
          />
          <p>
            住所のない会員の注文は「住所未登録」と表示されるようになりましたが、SQL の回数は &amp;. を付けたコードと同じです。delegate が作るメソッドは、呼ばれるたびに関連のメソッド（customer、address、prefecture）を呼びます。呼び出し側のコードからは関連が見えなくなりましたが、実行のときには同じ順に関連をたどり、同じ遅延読み込みが起きます。デメテルの法則はコードの依存関係を整える原則で、SQL の回数は変えません。
          </p>
          <h3>たどる関連を scope にまとめて読み込む</h3>
          <p>
            N+1 を防ぐには、一覧で使う関連を最初にまとめて読み込みます。<code>includes(customer: {'{ address: :prefecture }'})</code> は、注文を読んだ後に、会員・住所・都道府県をそれぞれ IN でまとめて読み込みます（<ChapterLink n={13} section="includes" />）。
          </p>
          <p>
            この includes の引数は、Order から Prefecture までの関連の道のりそのものです。コントローラーに書くと、コントローラーが関連の構造を知ることになります。そこで、delegate がたどる関連を知っている Order に scope として置き、コントローラーは scope の名前だけを使います。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直した後）"
            code={`
class Order < ApplicationRecord
  belongs_to :customer

  # => customer_name, customer_prefecture_name, customer_prefecture_remote?, customer_address_line
  delegate :name, :prefecture_name, :prefecture_remote?, :address_line, to: :customer, prefix: true

  # 上の delegate がたどる関連を、まとめて読み込む
  scope :with_customer_destination, -> { includes(customer: { address: :prefecture }) }
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb（直した後）"
            code={`
# 倉庫の担当者が見る出荷待ちの注文の一覧
class OrdersController < ApplicationController
  def index
    @orders = Order.with_customer_destination.order(:id)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（NO_ADDRESS=1 ROWS=1 SQL=1 bin/rails runner script/list.rb と N=30 で実行）"
            code={`
ステータス：200
A-001 | 会員1 | 東京都 |
A-002 | 会員2 | 沖縄県 | 遠方
A-003 | 会員3 | 大阪府 |
B-001 | 住所未登録の会員 | 住所未登録 |
SELECT \`orders\`.* FROM \`orders\` ORDER BY \`orders\`.\`id\` ASC
SELECT \`customers\`.* FROM \`customers\` WHERE \`customers\`.\`id\` IN (1, 2, 3, 4)
SELECT \`addresses\`.* FROM \`addresses\` WHERE \`addresses\`.\`customer_id\` IN (1, 2, 3, 4)
SELECT \`prefectures\`.* FROM \`prefectures\` WHERE \`prefectures\`.\`id\` IN (1, 2, 3)
SQL の回数：4

ステータス：200
SQL の回数：4
`}
          />
          <p>
            SQL は注文の件数によらず4回になりました。住所のない会員（id 4）は addresses に行がないので、その会員の address は nil として読み込まれ、delegate の allow_nil が nil を返します。図 72-4 は直す前と直した後の呼び出しを比べたものです。
          </p>
          <Figure n="72-4" title="直す前と直した後の呼び出し" caption="右の点線の箱は、Order に置いた scope。">
            <CompareFigure />
          </Figure>
          <p>
            図 72-4 の左では、ビューが4つのクラスを直接呼んでいます。右では、ビューが呼ぶのは Order だけで、Order・Customer・Address はそれぞれ隣のクラスにだけ頼みます。関連の道のりを知っているのは、各クラスの delegate と Order の scope です。各段階の SQL の回数をまとめると、図 72-5 のようになります。
          </p>
          <Figure n="72-5" title="書き方ごとの SQL の回数" caption="script/list.rb で計測。クエリキャッシュで省かれた SQL は数えていない。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">書き方</th>
                    <th scope="col">注文3件</th>
                    <th scope="col">30件</th>
                    <th scope="col">300件</th>
                    <th scope="col">住所のない会員の注文</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">関連をたどる（直す前）</th>
                    <td>10</td>
                    <td>64</td>
                    <td>604</td>
                    <td>NoMethodError</td>
                  </tr>
                  <tr>
                    <th scope="row">&amp;. を付けてたどる</th>
                    <td>10</td>
                    <td>64</td>
                    <td>604</td>
                    <td>「住所未登録」と表示</td>
                  </tr>
                  <tr>
                    <th scope="row">delegate だけ</th>
                    <td>10</td>
                    <td>64</td>
                    <td>604</td>
                    <td>「住所未登録」と表示</td>
                  </tr>
                  <tr>
                    <th scope="row">delegate と includes の scope</th>
                    <td>4</td>
                    <td>4</td>
                    <td>4</td>
                    <td>「住所未登録」と表示</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            直す前に関連をたどっていた行を、もう一度探しました。関連の名前が出てくるのは、隣のクラスへの delegate を書いた Address と Customer だけです（このほかに、Order の scope が includes の引数として関連の道のりを持っています）。
          </p>
          <Code
            lang="text"
            title={`実行結果（grep -rnE "\\.(address|prefecture)\\b|to: :(address|prefecture)" app）`}
            code={`
app/models/address.rb:5:  delegate :name, :remote?, to: :prefecture, prefix: true # => prefecture_name, prefecture_remote?
app/models/customer.rb:6:  delegate :prefecture_name, :prefecture_remote?, to: :address, allow_nil: true
app/models/customer.rb:7:  delegate :line, to: :address, prefix: true, allow_nil: true # => address_line
`}
          />
          <h3>テストで、nil の扱いと SQL の回数を固定する</h3>
          <p>
            Customer のテストで allow_nil の動きを、request spec で一覧の表示と SQL の回数を確かめます。SQL の回数のテストは、注文を3件から6件に増やしても回数が変わらないことを確かめるもので、includes を外すと失敗します。
          </p>
          <Code
            lang="ruby"
            title="spec/models/customer_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Customer do
  it "住所があれば都道府県の名前と遠方かを返す" do
    customer = Customer.create!(name: "会員1")
    customer.create_address!(prefecture: Prefecture.create!(name: "沖縄県"), city: "那覇市")
    expect(customer).to have_attributes(prefecture_name: "沖縄県", prefecture_remote?: true, address_line: "沖縄県那覇市")
  end

  it "住所がなければ nil を返す（allow_nil: true）" do
    expect(Customer.new(name: "会員2")).to have_attributes(prefecture_name: nil, prefecture_remote?: nil, address_line: nil)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/requests/orders_spec.rb（直した後に足した部分）"
            code={`
  def create_order(number, prefecture: tokyo)
    customer = Customer.create!(name: "会員#{number}")
    customer.create_address!(prefecture:, city: "千代田区") if prefecture
    customer.orders.create!(number:)
  end

  def count_queries(&)
    count = 0
    counter = ->(*, payload) { count += 1 unless payload[:name] == "SCHEMA" || payload[:cached] }
    ActiveSupport::Notifications.subscribed(counter, "sql.active_record", &)
    count
  end

  # …（省略。前の2つの例は create_order を使う形にした）

  it "注文が増えても SQL の回数は変わらない" do
    3.times { |i| create_order("A-#{i}") }
    three = count_queries { get orders_path }
    3.times { |i| create_order("C-#{i}") }
    expect(count_queries { get orders_path }).to eq three
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
Customer
  住所があれば都道府県の名前と遠方かを返す
  住所がなければ nil を返す（allow_nil: true）

環境
  MySQL 8.4 につながる

ShippingLabel
  都道府県・市区町村・名前を印刷する

注文の一覧
  届け先の都道府県を表示する
  住所を登録していない会員の注文も表示する
  注文が増えても SQL の回数は変わらない

Finished in 0.14725 seconds (files took 0.78626 seconds to load)
7 examples, 0 failures
`}
          />
          <Code
            lang="text"
            title="実行結果（コントローラーを includes のない Order.order(:id) に戻して request spec を実行）"
            code={`
  1) 注文の一覧 注文が増えても SQL の回数は変わらない
     Failure/Error: expect(count_queries { get orders_path }).to eq three

       expected: 8
            got: 14

3 examples, 1 failure
`}
          />
          <p>
            includes がないと、注文3件で8回、6件で14回になりました（都道府県はどれも東京都なので、2回目からはクエリキャッシュで省かれています）。後で誰かが scope を外しても、このテストが N+1 の再発を知らせます。
          </p>
          <h3>直す順序</h3>
          <ol>
            <li>関連をたどっている行を grep で探し、どのクラスのどの値を使っているかを書き出す</li>
            <li>たどった先の値で判断や計算をしているものは、値の持ち主にメソッドとして移す（遠方の判断を Prefecture#remote? に）</li>
            <li>関連の端のクラスから順に、隣のクラスへの delegate を置く。nil になりうる関連には allow_nil を、名前があいまいなら prefix を付ける</li>
            <li>呼び出し側を、1つ隣のオブジェクトのメソッドだけを使う形に置き換え、テストを実行する</li>
            <li>一覧で使う関連を includes の scope にまとめ、SQL の回数が件数によらないことをテストで固定する</li>
          </ol>
        </>
      ),
    },
    {
      id: 'overuse',
      title: 'delegate を増やしすぎたとき',
      body: (
        <>
          <h3>画面の項目を1つ足すたびに、3つのファイルを直す</h3>
          <p>
            直した後のコードで、一覧に市区町村の列を足すことになりました。デメテルの法則に沿って書くと、Customer に <code>address_city</code> を、Order に <code>customer_address_city</code> を足してから、ビューを直します。比較のために、&amp;. を付けてたどるコードでも同じ列を足しました。直したファイルを比べた結果です。
          </p>
          <Code
            lang="text"
            title="実行結果（市区町村の列を足す前と後で diff -rq）"
            code={`
== delegate を使ったコード
Files stage2/app/models/customer.rb and stage3/app/models/customer.rb differ
Files stage2/app/models/order.rb and stage3/app/models/order.rb differ
Files stage2/app/views/orders/index.html.erb and stage3/app/views/orders/index.html.erb differ

== &. を付けてたどるコード
Files stage1s/app/views/orders/index.html.erb and stage1t/app/views/orders/index.html.erb differ
`}
          />
          <Code
            lang="text"
            title="実行結果（列を足した後に、Order が会員と住所のために公開しているメソッド）"
            code={`
customer_address_city
customer_address_line
customer_name
customer_prefecture_name
customer_prefecture_remote?
`}
          />
          <p>
            delegate を使ったコードでは、表示する値を1つ足すために3つのファイルを直しました。Order には、会員と住所のための公開メソッドが5つ並んでいます。どれも Customer に渡すだけで、Order 自身の処理はありません。
          </p>
          <p>
            これは、この原則を提案した側も認めている費用です。Northeastern University の説明は、デメテルの法則はメソッドの単位では相手を少なくする一方、クラスの単位では、オブジェクトの構造を直接たどる代わりに補助のメソッドを多く足すことになるので、公開するメソッドが増えると述べています<Ref n={3} />。1988年の論文が、クラスあたりのメソッドの数を少なくすることを合わせて求めていたのも、この費用を抑えるためです<Ref n={1} />。Fowler が挙げた、転送するメソッドで膨らんだ中継役も同じ状態です<Ref n={5} />。
          </p>
          <h3>部品を1つ受け取り、引数として渡す</h3>
          <p>
            住所の項目をいくつも表示するなら、項目ごとに delegate を足すより、住所という部品を1つ受け取って渡すほうが少ない変更で済みます。たとえば Order に <code>delegate :address, to: :customer, prefix: true</code> を1つ置き、ビューは <code>{'render "addresses/address", address: order.customer_address'}</code> のように部分テンプレートに渡します。部分テンプレートにとって address は引数なので、<code>address.city</code> や <code>address.prefecture_name</code> を呼んでも規則に反しません。
          </p>
          <p>
            ただし、部分テンプレートは Address の構造を知ることになります。Address を表示するための部分テンプレートが Address を知るのは自然なので、この依存は受け入れます。どのクラスの構造を誰が知るかを決めて、それ以外の場所に広げないことが、この原則で確かめる点です。
          </p>
          <h3>delegate_missing_to ですべてを転送する</h3>
          <p>
            Active Support には、定義していないメソッドの呼び出しをすべて別のオブジェクトに渡す <code>delegate_missing_to</code> もあります<Ref n={7} />。Order に <code>delegate_missing_to :customer</code> と書けば、<code>order.address</code> も <code>order.orders</code> も呼べます。ドットは減りますが、Customer の公開メソッドがすべて Order のメソッドとして使えるようになり、何を委譲しているかの一覧もなくなります。デメテルの法則が減らそうとした「知っている相手の範囲」は、関連をたどる書き方と同じだけ広いままです。デコレーターのように、元のオブジェクトと同じ振る舞いをすべて引き継ぐクラスのための機能として使い分けます。
          </p>
          <h3>ドットの数だけで判断する</h3>
          <ul>
            <li><code>Order.where(customer_id: 1).order(:id).limit(10)</code> は、どのメソッドも新しい Relation を作って返すので、規則に反しません。</li>
            <li><code>params[:email].to_s.strip.downcase</code> のような文字列の変換、<code>orders.map(&amp;:total).sum</code> のような配列の処理も同じです。</li>
            <li>JSON を読み込んだハッシュの <code>body.dig("data", "items")</code> のように、振る舞いを持たないデータの構造をたどる場合は、たどる道のりそのものが外部の API の形式です。delegate を足すより、そのデータを読む処理を1か所（<ChapterLink n={42} section="idea" />の Adapter など）にまとめます。</li>
          </ul>
          <h3>判断の目安</h3>
          <p>図 72-6 は関連の先にあるものを使いたいときに、どの書き方を選ぶかの目安です。</p>
          <Figure n="72-6" title="delegate を使うときと使わないとき" caption="模式図。上から順に確かめる。">
            <JudgeFigure />
          </Figure>
          <p>
            図 72-6 は上から順に確かめます。新しいオブジェクトを返す連鎖は対象外です。たどった先の値で判断しているなら、delegate で値を運ぶ前に、判断そのものを値の持ち主に移します。値を1つか2つ取り出すだけなら delegate を使い、多くの値を使うなら部品を1つ渡します。どの書き方でも、一覧で使うなら関連の読み込みを scope に置く必要があります。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の delegate・関連の読み込みとデメテルの法則',
      body: (
        <>
          <h3>delegate のオプション</h3>
          <p>図 72-7 は delegate と delegate_missing_to のオプションと、委譲先が nil のときの動きをまとめたものです。</p>
          <Figure n="72-7" title="delegate のオプションと、委譲先が nil のときの動き" caption="Rails Guides の Active Support Core Extensions と、Rails 8.1.4.1 のソースによる。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">書き方</th>
                    <th scope="col">作られるメソッド</th>
                    <th scope="col">委譲先が nil のとき</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>delegate :prefecture_name, to: :address</code></td>
                    <td><code>prefecture_name</code></td>
                    <td>ActiveSupport::DelegationError（NoMethodError のサブクラス）</td>
                  </tr>
                  <tr>
                    <td><code>delegate :prefecture_name, to: :address, allow_nil: true</code></td>
                    <td><code>prefecture_name</code></td>
                    <td>nil を返す</td>
                  </tr>
                  <tr>
                    <td><code>delegate :name, to: :prefecture, prefix: true</code></td>
                    <td><code>prefecture_name</code></td>
                    <td>allow_nil がなければ DelegationError</td>
                  </tr>
                  <tr>
                    <td><code>delegate :prefecture_name, to: :address, prefix: :home</code></td>
                    <td><code>home_prefecture_name</code></td>
                    <td>allow_nil がなければ DelegationError</td>
                  </tr>
                  <tr>
                    <td><code>delegate :line, to: :address, private: true</code></td>
                    <td>private の <code>line</code></td>
                    <td>allow_nil がなければ DelegationError</td>
                  </tr>
                  <tr>
                    <td><code>delegate_missing_to :customer</code></td>
                    <td>定義していないメソッドをすべて転送する</td>
                    <td>DelegationError（allow_nil: true なら nil）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <ul>
            <li>
              delegate は、引数で受け取った名前から Ruby のメソッドの定義を文字列で組み立て、module_eval で定義します<Ref n={8} /><Ref n={9} />。allow_nil を付けると、委譲先が nil かを確かめてから呼ぶ定義になり、付けないと、NoMethodError を受けたときに委譲先が nil なら DelegationError に置き換える定義になります<Ref n={9} />。
            </li>
            <li>allow_nil は委譲先が nil のときだけ働きます。委譲先が nil でなければ、allow_nil を付けていてもメソッドを呼ぶので、委譲先がそのメソッドを持たなければ NoMethodError になります<Ref n={8} />。</li>
            <li>prefix: true は、to: に渡した名前をそのまま前に付けます。to: に定数（<code>to: :Rails</code> など）を渡したときは使えないので、prefix に名前を指定します<Ref n={7} />。</li>
            <li>private: true は、作るメソッドを private にします。クラスの中の処理だけで使う値を、外に公開せずに隣のオブジェクトから取り出したいときに使います<Ref n={7} />。</li>
          </ul>
          <Callout kind="v72">
            <p>
              Rails 7.2 の delegate も、委譲先が nil のときは 8.1 と同じ ActiveSupport::DelegationError を投げます。Rails 7.1 までは例外のクラスが Module::DelegationError で、メッセージに受け手のオブジェクトの inspect が付いていました<Ref n={12} />。8.1 でも Module::DelegationError は ActiveSupport::DelegationError の別名として残っているので<Ref n={8} />、<code>rescue Module::DelegationError</code> と書いたコードは 7.1 から上げても動きます。
            </p>
          </Callout>
          <h3>関連の読み込みと strict_loading</h3>
          <p>
            delegate は関連をたどる処理を隠すので、呼び出し側から見て、どのメソッドが SQL を発行するかがわかりにくくなります。この章では SQL の回数をテストで固定しましたが、Active Record には、遅延読み込みそのものを禁止する strict_loading もあります。strict_loading を付けた Relation から読んだレコードは、先に読み込んでいない関連を呼ぶと ActiveRecord::StrictLoadingViolationError を投げます<Ref n={10} /><Ref n={11} />。
          </p>
          <Code
            lang="ruby"
            title="script/strict_loading.rb"
            code={`
# 関連を先に読み込まずに delegate を呼ぶと、strict_loading が止める
require_relative "data"
seed_orders(3)

begin
  Order.strict_loading.order(:id).map(&:customer_prefecture_name)
rescue => e
  puts "#{e.class}: #{e.message}"
end
p Order.with_customer_destination.strict_loading.order(:id).map(&:customer_prefecture_name)
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/strict_loading.rb）"
            code={`
ActiveRecord::StrictLoadingViolationError: \`Order\` is marked for strict_loading. The Customer association named \`:customer\` cannot be lazily loaded.
["東京都", "沖縄県", "大阪府"]
`}
          />
          <p>
            1つ目は、delegate の customer_prefecture_name が customer の関連を遅延読み込みしようとしたところで止まりました。2つ目は、scope で3つの関連を先に読み込んでいるので、最後まで実行できます。delegate で関連を隠したコードと、関連の読み込みを scope にまとめる方法は、strict_loading と組み合わせると、読み込み忘れを例外で見つけられます。strict_loading の設定の方法と、アプリ全体で有効にするときの注意は <ChapterLink n={13} section="strict-loading" />で扱いました。
          </p>
          <h3>Rails の規約との関係</h3>
          <ul>
            <li>
              Rails のビューは、コントローラーが用意したインスタンス変数を使って表示します。ビューから関連を何段もたどれるのは Active Record の便利な点ですが、ビューが知るクラスの数も増えます。一覧の画面では、コントローラーが使う scope と、ビューが呼ぶモデルのメソッドの組を決めておくと、表示する項目と読み込む関連を同じ場所で確かめられます。
            </li>
            <li>
              Relation のメソッドの連鎖は、Active Record の標準の書き方です。where や order を何段つないでも、新しい Relation を作って返すだけなので、デメテルの法則を気にする必要はありません。
            </li>
            <li>
              delegate は、名前（prefix）と nil の扱い（allow_nil）を宣言の1行に書けます。関連が nil になりうるときの扱いを、呼び出し側ではなく、関連を宣言したクラスで決められます。
            </li>
          </ul>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={13} section="n-plus-one" />：N+1 問題と、preload・eager_load・includes の違い、strict_loading を扱いました。
            </li>
            <li>
              <ChapterLink n={73} />（Information Hiding）：関連をたどる式は、関連の構造という設計の判断を呼び出し側に漏らします。
            </li>
            <li>
              <ChapterLink n={77} />（Tell, Don't Ask）：遠方の判断を Prefecture#remote? に移したのは、この原則の形です。delegate で値を運ぶ前に、判断を値の持ち主に移せないかを確かめます。
            </li>
            <li>
              <ChapterLink n={70} />（Low Coupling）：デメテルの法則は、低結合の原則をメソッドの呼び出しの単位で具体的にしたものです。
            </li>
            <li>
              <ChapterLink n={90} />（Measure Before Optimizing）：この章の SQL の回数のように、遅さの原因を計測で確かめる方法を扱います。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          呼び出し側は1つ隣のオブジェクトにだけ頼み、関連の道のりは各クラスの delegate と、一覧で使う scope に置きます。たどった先の値で判断しているなら、delegate で値を運ぶ前に、判断を値の持ち主に移します。多くの値を使うときは、項目ごとに delegate を足さず、部品を1つ渡します。
        </>
      ),
      benefit: {
        text: <>直す前は、住所のない会員の注文で一覧の画面全体が NoMethodError の 500 になり、注文30件で SQL が64回発行された。delegate の allow_nil で nil を返し、関連の読み込みを includes の scope にまとめると、SQL は注文の件数によらず4回になった。遠方の判断は Prefecture#remote? に移した。</>,
        basis: <><ChapterLink n={74} section="scene" />、<ChapterLink n={74} section="apply" /></>,
      },
      cost: {
        text: <>delegate は中継するだけのメソッドを増やす。一覧に市区町村の列を足すと、Customer・Order・ビューの3つのファイルを直すことになり、Order には会員と住所のための公開メソッドが5つ並んだ。</>,
        basis: <ChapterLink n={74} section="overuse" />,
      },
      alternative: {
        text: <>住所の項目をいくつも表示するなら、Order に <code>delegate :address, to: :customer, prefix: true</code> を1つ置き、住所の部品を部分テンプレートに渡す。delegate_missing_to ですべてを転送すると、ドットは減っても構造への依存は残る。</>,
        basis: <ChapterLink n={74} section="overuse" />,
      },
      criterion: {
        text: <>新しい Relation を返す連鎖（where・order・limit）は対象外とし、ドットの数だけで判断しない。たどった先の値で判断しているか、値を1つか2つ取り出すだけか、多くの値を使うか。一覧で使うなら、SQL の回数が件数によらないことをテストで固定する。</>,
        basis: <ChapterLink n={74} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>デメテルの法則は、オブジェクトの内部構造に深く依存せず、メソッドが直接知っている相手（self、引数、インスタンス変数、自分が作ったオブジェクト）にだけメッセージを送る原則です。Lieberherr・Holland・Riel が 1988年の OOPSLA の論文で定めました。</li>
          <li><code>order.customer.address.prefecture.name</code> のような式は、4つのクラスと関連の向きを呼び出し側に知らせます。住所のない会員では NoMethodError で画面全体が 500 になり、注文ごとに3回の SELECT が発行されました。</li>
          <li>&amp;. は例外を止めますが、構造への依存と N+1 は残ります。delegate で各クラスが隣のクラスにだけ頼む形にすると、nil の扱いは関連を宣言したクラス（allow_nil）に、名前は prefix で整理できます。</li>
          <li>delegate は関連のたどり方をコードから隠すだけで、SQL の回数は変えません。たどる関連を includes の scope にまとめ、SQL の回数が件数によらないことをテストで固定します。strict_loading と組み合わせると、読み込み忘れを例外で見つけられます。</li>
          <li>たどった先の値で判断しているなら、delegate より先に、判断を値の持ち主に移します（Tell, Don't Ask）。</li>
          <li>表示する項目ごとに delegate を足すと、項目1つで3つのファイルを直し、中継するだけのメソッドが増えます。多くの値を使うときは部品を1つ渡し、Relation や文字列の連鎖は規則の対象外として扱います。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Object-Oriented Programming: An Objective Sense of Style', publisher: 'Karl Lieberherr, Ian Holland, Arthur Riel / OOPSLA \'88 Proceedings（Northeastern University に置かれた複製）', url: 'https://www2.ccs.neu.edu/research/demeter/papers/law-of-demeter/oopsla88-law-of-demeter.pdf', accessed: '2026-11-21', version: '1988年9月 323ページから', note: 'デメテルの法則のクラスによる定義とオブジェクトによる定義、作ったオブジェクトとグローバル変数を引数と同じに扱うこと、2つの目的（変更のしやすさ、意識する型の数を減らす）、合わせて求める3つの条件（重複・引数の数・クラスあたりのメソッドの数を少なくする）、information restriction として情報隠蔽を補うこと。' },
    { title: 'Law of Demeter: Principle of Least Knowledge', publisher: 'Karl Lieberherr / Northeastern University', url: 'https://www.ccs.neu.edu/home/lieber/LoD.html', accessed: '2026-11-21', note: '「Only talk to your friends」という標語、1987年の秋に Ian Holland が提案したこと、Demeter プロジェクトから名前を取ったこと、Principle of Least Knowledge という別名。' },
    { title: 'Law of Demeter (General Formulation)', publisher: 'Karl Lieberherr / Northeastern University', url: 'https://www2.ccs.neu.edu/research/demeter/demeter-method/LawOfDemeter/general-formulation.html', accessed: '2026-11-21', note: '低結合の原則をより具体的にしたものであること、直接持つ部品のクラスを保存するものと計算で返すものの両方とすること、クラスの単位では補助のメソッドが増えて公開するメソッドが広がること。' },
    { title: 'The Art of Enbugging', publisher: 'Andy Hunt, Dave Thomas / IEEE Software（The Pragmatic Programmers のサイトに置かれた複製）', url: 'https://media.pragprog.com/articles/jan_03_enbug.pdf', accessed: '2026-11-21', version: '2003年1・2月号', note: '「The Pretty Good Idea of Demeter」として、呼んでよい相手を4つ挙げ、法則というより良い考えだとしたこと。中継するだけの小さなメソッドが増える欠点。Tell, Don\'t Ask と同じ記事で扱っていること。' },
    { title: "Mocks Aren't Stubs", publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/articles/mocksArentStubs.html', accessed: '2026-11-21', version: '2007年1月2日', note: 'メソッドの連鎖と、転送するメソッドで膨らんだ中継役の両方が問題の兆候であること、「Suggestion of Demeter」という言い方。' },
    { title: 'TellDontAsk', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/TellDontAsk.html', accessed: '2026-11-21', note: 'Tell, Don\'t Ask がデータとそれを扱う処理をまとめるための原則であること、Andy Hunt と Dave Thomas の名前と結びつけて語られることが多いこと。' },
    { title: 'Active Support Core Extensions（Method Delegation）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_support_core_extensions.html#method-delegation', accessed: '2026-11-21', version: 'Rails 8.1', note: 'delegate の書き方、allow_nil・prefix（true と名前の指定）・private のオプション、to: に定数を渡したときは prefix: true が使えないこと、delegate_missing_to。' },
    { title: 'activesupport/lib/active_support/core_ext/module/delegation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/core_ext/module/delegation.rb#L1-L225`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'Module::DelegationError が ActiveSupport::DelegationError の別名であること、delegate のオプションの説明（allow_nil は委譲先が nil のときだけ働くこと）、delegate が ActiveSupport::Delegation.generate を呼ぶこと、delegate_missing_to の説明（デコレーターを作るときの例）。' },
    { title: 'activesupport/lib/active_support/delegation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/delegation.rb#L6-L147`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'DelegationError が NoMethodError のサブクラスであることとメッセージの形、allow_nil の有無で生成するメソッドの定義が変わること、module_eval で定義すること。' },
    { title: 'Active Record Query Interface（Eager Loading Associations・strict_loading）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html#eager-loading-associations', accessed: '2026-11-21', version: 'Rails 8.1', note: 'N + 1 クエリの問題と includes による解決、strict_loading を付けた Relation が遅延読み込みで StrictLoadingViolationError を投げること。' },
    { title: 'activerecord/lib/active_record/associations/association.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/associations/association.rb#L235-L263`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: '関連を読み込む前に strict_loading の違反を確かめ、違反なら strict_loading_violation! を呼ぶこと。' },
    { title: 'activesupport/lib/active_support/core_ext/module/delegation.rb（Rails 7.1 系）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/7-1-stable/activesupport/lib/active_support/core_ext/module/delegation.rb#L8', accessed: '2026-11-22', version: '7-1-stable ブランチ', note: 'Rails 7.1 系では Module::DelegationError（NoMethodError のサブクラス）を定義し、delegate が投げる例外のメッセージの末尾に受け手の inspect を付けていたこと。' },
  ],
}

export default chapter
