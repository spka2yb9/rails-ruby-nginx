import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const GH_TREE = 'https://github.com/rails/rails/tree/v8.1.4.1'

/* ---------- 図 75-1 注文確定のアクションが直接つながっている相手 ---------- */
function DirectDepsFigure() {
  return (
    <Svg
      id="75-1"
      w={760}
      h={350}
      label="OrdersController の create アクションが、Order モデル（MySQL）、A社の決済 API、OrderMailer（SMTP のメールサーバー）、Time.current（現在時刻）の4つに直接つながっている図。アクションの中には割引の case 文もある。4つともアクションの中で直接指定しているので、テストや切り替えのときに外から差し替えにくい。請求の後の保存や送信で失敗すると、請求だけが残るか、やり直しで二重に請求される"
    >
      <Box
        x={250}
        y={112}
        w={260}
        h={92}
        lines={['OrdersController#create', '② 検証・計算・決済・保存・通知', '① 割引の case 文']}
        bold
        accent
        subTone="muted"
      />
      <Box x={20} y={20} w={200} h={56} lines={['Order（MySQL）', '④ create!']} fill="box4" subTone="muted" />
      <Box x={540} y={20} w={200} h={56} lines={['A社の決済 API', '③ Net::HTTP.post']} fill="box4" subTone="muted" />
      <Box x={20} y={236} w={200} h={56} lines={['OrderMailer（SMTP）', '④ deliver_now']} fill="box4" subTone="muted" />
      <Box x={540} y={236} w={200} h={56} lines={['Time.current', '⑤ 日曜日かの判定']} fill="box4" subTone="muted" />
      <Arrow x1={250} y1={128} x2={222} y2={70} />
      <Arrow x1={510} y1={128} x2={538} y2={70} />
      <Arrow x1={250} y1={190} x2={222} y2={248} />
      <Arrow x1={510} y1={190} x2={538} y2={248} />
      <T x={246} y={92} fs={12} tone="muted">
        2. 保存
      </T>
      <T x={514} y={92} anchor="end" fs={12} tone="muted">
        1. 請求
      </T>
      <T x={246} y={232} fs={12} tone="muted">
        3. 送信
      </T>
      <T x={380} y={316} anchor="middle" fs={12} tone="danger">
        4つの相手をアクションの中で直接指定しているので、テストや切り替えのときに外から差し替えにくい
      </T>
      <T x={380} y={338} anchor="middle" fs={12} tone="danger">
        請求の後の保存や送信で失敗すると、請求だけが残るか、やり直しで二重に請求される
      </T>
    </Svg>
  )
}

/* ---------- 図 75-4 パターンの章の節と MSDP の項目の対応 ---------- */
function ChapterLayoutFigure() {
  const rows: [string, string][] = [
    ['題材の場面と、パターンを使わないコードの問題', 'Context、Implementation の「適用前のコード」「問題点」'],
    ['パターンの考え方', 'Intent、Context、Forces、Solution、Structure'],
    ['章ごとに足す節（ない章もある）', '補助の概念（テストダブル、Repository、集約など）'],
    ['Rails での実装', 'Implementation の「適用後のコード」「直す順序」「実務例」'],
    ['テストと動作の確認', 'Implementation の「テストコード」'],
    ['効果と代償', 'Consequences'],
    ['よくある誤用', 'Anti-pattern'],
    ['ほかの方法との使い分けと採用の判断', 'Alternatives、Decision Guide'],
    ['まとめ', '（本書のほかの章と同じ）'],
  ]
  const top = 52
  const step = 46
  return (
    <Svg
      id="75-4"
      w={780}
      h={top + rows.length * step + 36}
      label="パターンの章の節を上から順に並べ、それぞれが MSDP のどの項目に当たるかを示した図。題材の場面の節は Context と適用前のコード、パターンの考え方の節は Intent・Context・Forces・Solution・Structure、章ごとに足す節は補助の概念、Rails での実装の節は適用後のコードと直していく順序と実務での使い方、テストの節はテストコード、効果と代償は Consequences、よくある誤用は Anti-pattern、使い分けと採用の判断は Alternatives と Decision Guide に当たる。Language Comparison と TypeScript の実装は扱わない"
    >
      <T x={20} y={22} bold>
        この部のパターンの章の節（上から順）
      </T>
      <T x={386} y={22} bold>
        含める MSDP の項目
      </T>
      {rows.map(([sec, items], i) => {
        const y = top + i * step
        return (
          <g key={sec}>
            <Box x={20} y={y} w={316} h={36} lines={`${i + 1}. ${sec}`} fs={12} align="start" fill={i === 0 || i === 3 || i === 4 ? 'box5' : 'box'} />
            <Arrow x1={338} y1={y + 18} x2={378} y2={y + 18} dashed />
            <T x={386} y={y + 18} fs={12}>
              {items}
            </T>
          </g>
        )
      })}
      <T x={20} y={top + rows.length * step + 14} fs={12} tone="muted">
        扱わない項目：Language Comparison（言語間比較）と TypeScript の実装（この部は Ruby と Rails だけで書く）
      </T>
    </Svg>
  )
}

const CATALOG: { cat: string; focus: string; items: [number, string, string][] }[] = [
  {
    cat: 'A 依存と差し替え',
    focus: '変更のしやすさ・外部への依存の分離・テストのしやすさ',
    items: [
      [40, 'Dependency Injection', '為替レートと現在時刻を外から渡す'],
      [41, 'Strategy / Policy', '送料の計算と管理画面の認可を切り替える'],
      [42, 'Adapter', '2社の決済サービスの違いを吸収する'],
      [43, 'Middleware Chain', 'Rack ミドルウェアと before_action でリクエストの前後の処理をつなぐ'],
    ],
  },
  {
    cat: 'B 業務の処理の整理',
    focus: '複雑さの整理・テストのしやすさ',
    items: [
      [44, 'Use Case / Application Service', 'イベントの参加申し込みの手順を1か所にまとめる'],
      [45, 'Functional Core, Imperative Shell', 'プラン変更の日割り計算を副作用から分ける'],
      [46, 'Value Object', '金額・期間・メールアドレスに型を持たせる'],
      [47, 'Explicit State Machine', '経費申請の承認フローを遷移表で表す'],
    ],
  },
  {
    cat: 'C データの整合性',
    focus: '信頼性（データの食い違いを防ぐ）',
    items: [
      [48, 'Unit of Work', '請求書と明細行をまとめて保存する'],
      [49, 'Optimistic Locking', '商品の同時編集と在庫の減算'],
      [50, 'Materialized View', '売上の集計表と商品検索用のテーブルを用意する'],
    ],
  },
  {
    cat: 'D 非同期と障害への備え',
    focus: '信頼性（障害と再実行）',
    items: [
      [51, 'Domain Events', '会員登録の後の処理を分ける'],
      [52, 'Idempotency Key / Deduplication', '決済の二重送信と Webhook の重複を防ぐ'],
      [53, 'Transactional Outbox', '会員情報の変更を CRM へ確実に通知する'],
      [54, 'Retry with Backoff', '配送業者 API の一時的な失敗を再試行する'],
    ],
  },
]

function CatalogTable() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>カテゴリ（主に扱う観点）</th>
            <th>章</th>
            <th>パターン</th>
            <th>この部の題材</th>
          </tr>
        </thead>
        <tbody>
          {CATALOG.flatMap((c) =>
            c.items.map(([id, name, subject], i) => (
              <tr key={id}>
                {i === 0 && (
                  <td rowSpan={c.items.length}>
                    {c.cat}
                    <br />（{c.focus}）
                  </td>
                )}
                <td>
                  <ChapterLink n={id} />
                </td>
                <td>{name}</td>
                <td>{subject}</td>
              </tr>
            )),
          )}
          <tr>
            <td>組み合わせ</td>
            <td>
              <ChapterLink n={55} />
            </td>
            <td>パターンの組み合わせ</td>
            <td>注文の確定を組み立てる</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const RAILS_MAP: [number, string, string, string][] = [
  [40, 'Dependency Injection', 'キーワード引数の既定値、config.x。テストでは travel_to と WebMock', '組み合わせて書く'],
  [41, 'Strategy / Policy', 'Hash と lambda、gem の Pundit', '組み合わせて書く'],
  [42, 'Adapter', 'Rails 自身が使っている（Active Job のキューアダプター、Active Storage のサービス、Action Mailer の delivery_method）。外部サービスの Adapter は自分で書く', '組み合わせて書く'],
  [43, 'Middleware Chain', 'Rack ミドルウェア（config.middleware）、before_action・around_action・rescue_from', '標準機能を使う'],
  [44, 'Use Case / Application Service', '標準の置き場所はない（app/services などに置く Ruby のクラス）。読み出しはモデルのスコープ', '組み合わせて書く'],
  [45, 'Functional Core, Imperative Shell', 'Ruby の Data.define と普通のクラス', '組み合わせて書く'],
  [46, 'Value Object', 'composed_of、Attributes API のカスタム型、normalizes、Ruby の Data.define', '標準機能を使う'],
  [47, 'Explicit State Machine', 'enum、gem の AASM', '組み合わせて書く'],
  [48, 'Unit of Work', 'Rails は Unit of Work を持たない。autosave、accepts_nested_attributes_for、transaction', '別の方法で代える'],
  [49, 'Optimistic Locking', 'lock_version と ActiveRecord::StaleObjectError', '標準機能を使う'],
  [50, 'Materialized View', 'MySQL にはマテリアライズドビューがない。集計用のテーブル、upsert_all、ジョブ', '組み合わせて書く'],
  [51, 'Domain Events', 'ActiveSupport::Notifications、after_commit、Rails 8.1 の Rails.event（どれもイベントを保存しない）', '組み合わせて書く'],
  [52, 'Idempotency Key / Deduplication', '一意索引と create_or_find_by', '組み合わせて書く'],
  [53, 'Transactional Outbox', '標準の機能はない（Solid Queue を同じ DB に置く方法もある）', '組み合わせて書く'],
  [54, 'Retry with Backoff', 'Active Job の retry_on、Sidekiq の再試行、gem の faraday-retry', '標準機能を使う'],
]

function RailsMapTable() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>章</th>
            <th>パターン</th>
            <th>Rails の標準機能・よく使う gem</th>
            <th>Rails での扱い</th>
          </tr>
        </thead>
        <tbody>
          {RAILS_MAP.map(([id, name, rails, how]) => (
            <tr key={id}>
              <td>
                <ChapterLink n={id} />
              </td>
              <td>{name}</td>
              <td>{rails}</td>
              <td>{how}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const SYMPTOMS: [string, number, string][] = [
  ['モデルの中で外部 API のクライアントを作ったり Time.current を読んだりしていて、テストのたびに WebMock のスタブや travel_to をあちこちに書いている', 40, 'Dependency Injection'],
  ['送料や権限などのルールが増えるたびに、同じ形の if / case が長くなる。同じ権限の判断がコントローラーとビューの両方にある', 41, 'Strategy / Policy'],
  ['外部サービスの SDK のメソッド名・例外・金額の単位が、モデルやジョブのあちこちに出てくる', 42, 'Adapter'],
  ['認証・ログ・例外の処理を、各アクションに同じように書いている', 43, 'Middleware Chain'],
  ['1つの業務の操作の手順が、コントローラー・モデルのコールバック・ジョブに散らばっている。画面と API と CSV の取り込みで手順が食い違う', 44, 'Use Case / Application Service'],
  ['計算のテストを書くのに、DB のレコードの作成や travel_to が必要になる', 45, 'Functional Core, Imperative Shell'],
  ['金額・期間・メールアドレスの検証や変換が、使う場所ごとに書かれている', 46, 'Value Object'],
  ['状態を複数の真偽値の列で持っていて、ありえない組み合わせのレコードがある', 47, 'Explicit State Machine'],
  ['親と子のレコードを1件ずつ保存していて、途中で失敗すると一部の行だけが保存される', 48, 'Unit of Work'],
  ['2人が同時に編集すると、後から保存した人の内容で先の変更が消える。在庫の数が合わなくなる', 49, 'Optimistic Locking'],
  ['一覧やダッシュボードを表示するたびに、重い集計の SQL を実行している', 50, 'Materialized View'],
  ['1つの操作の後に、メール・ポイントの付与・社内への通知などの処理が増え続け、1つが失敗すると全体が失敗する', 51, 'Domain Events'],
  ['ボタンの二度押しや通信の再送で、決済が2回実行される。Webhook の同じ通知を2回処理する', 52, 'Idempotency Key / Deduplication'],
  ['DB は更新されたのに、ほかのシステムへの通知が届かないことがある', 53, 'Transactional Outbox'],
  ['外部 API の一時的なエラーで処理全体が失敗する。または、再試行が相手のサーバーの負荷をさらに上げる', 54, 'Retry with Backoff'],
]

const chapter: Chapter = {
  number: 39,
  part: 9,
  title: '設計パターンのカタログ MSDP と採用の判断',
  summary:
    'EC サイトの注文の確定を1つのアクションに全部書いたコードを動かし、変更のしやすさ・複雑さ・外部への依存・信頼性・テストのしやすさの5つの観点で起きる問題を確かめます。そのうえで、デザインパターンとは何か、MSDP の15のパターンと採用を判断する8つの原則、Rails の標準機能との対応、コードの症状から章を引く表、この部の章の構成とコードを動かした環境を説明します。',
  goals: [
    '注文の確定を1つのアクションに書いたコードで起きる5つの問題を、コードの箇所と実行結果を示して説明できる',
    'デザインパターンが「繰り返し現れる問題と、その解決の中心部分の組」であり、そのまま貼り付けて使うコードではないことを説明できる',
    'MSDP の15のパターンが4つのカテゴリに分かれていることと、パターンを採用するかを判断する8つの原則を説明できる',
    'パターンごとに、Rails の標準機能（Rack ミドルウェア、lock_version、retry_on など）で足りるか、自分でクラスを書くかを区別できる',
    'コードの症状から、この部のどの章を読めばよいかを引ける',
  ],
  prerequisites: [10, 14, 18, 20],
  sections: [
    {
      id: 'one-action',
      title: '注文の確定を1つのアクションに全部書いたコード',
      body: (
        <>
          <p>
            この部では Web アプリケーションのコードで繰り返し起きる設計上の問題と、その解決方法を Rails のコードで扱います。最初に、問題をまとめて含んだコードを1つ動かします。
          </p>
          <p>
            題材は EC サイトの注文の確定です。利用者が「注文を確定する」ボタンを押すと、サーバーは次の5つを順に行います。入力の確認、合計金額と割引の計算、決済サービスへの請求、注文の保存、確認メールの送信です。Rails では、最初はこれをコントローラーの1つのアクションに書くことがよくあります。次のコードがその例です。割引はクーポン（WELCOME10 で10%引き、SUMMER500 で500円引き）と、日曜日の5%引きの2種類です。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb"
            code={`class OrdersController < ApplicationController
  # ② 検証・計算・決済・保存・通知を、このアクションに全部書いている
  def create
    order_params = params.permit(:email, :coupon, items: [:price, :quantity])
    items = order_params[:items] || []
    if items.empty? || order_params[:email].blank?
      return render json: { error: "invalid" }, status: :unprocessable_content
    end

    subtotal = items.sum { |i| i[:price].to_i * i[:quantity].to_i }
    # ① 割引のルールが増えるたびに、この case を書き換える
    discount =
      case order_params[:coupon]
      when "WELCOME10" then subtotal / 10
      when "SUMMER500" then 500
      else 0
      end
    discount += subtotal / 20 if Time.current.sunday? # ⑤ 現在時刻を直接読む
    total = subtotal - discount

    # ③ 決済サービスの URL・項目名・応答の形を、このアクションが直接知っている
    res = Net::HTTP.post(
      URI("https://api.pay-a.example/v1/charges"),
      { amount: total, currency: "jpy" }.to_json,
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{ENV.fetch("PAY_A_SECRET", "sk_test")}"
    )
    charge = JSON.parse(res.body)
    if charge["status"] != "succeeded"
      return render json: { error: "payment_failed" }, status: :payment_required
    end

    # ④ 請求した後で、保存とメールの送信を行う
    order = Order.create!(email: order_params[:email], subtotal:, discount:, total:,
                          payment_id: charge["id"])
    OrderMailer.with(order:).confirmation.deliver_now

    render json: { id: order.id, total: }, status: :created
  end
end`}
          />
          <Code
            lang="ruby"
            title="app/models/order.rb と app/mailers/order_mailer.rb"
            code={`class Order < ApplicationRecord
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }
end

class OrderMailer < ApplicationMailer
  def confirmation
    @order = params[:order]
    mail(to: @order.email, subject: "ご注文ありがとうございます")
  end
end`}
          />
          <p>
            このコードは動きます。小さなアプリケーションなら、このまま運用しても困らないこともあります。問題は機能を足したり、障害に備えたり、テストを書いたりするときに現れます。次の request spec で確かめます。決済サービスへの通信は WebMock で実際には送らずに、成功の応答を返すようにします。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/orders_spec.rb"
            code={`require "rails_helper"
require "webmock/rspec"

RSpec.describe "POST /orders（1つのアクションに全部を書いた版）", type: :request do
  include ActiveSupport::Testing::TimeHelpers
  let(:charges_url) { "https://api.pay-a.example/v1/charges" }
  let(:params) { { email: "hanako@example.com", items: [{ price: 1000, quantity: 2 }] } }
  def charge_count = WebMock::RequestRegistry.instance.times_executed(WebMock::RequestPattern.new(:post, charges_url))

  # 本番と同じく、例外を 500 などの応答に変える
  around do |ex|
    Rails.application.env_config["action_dispatch.show_exceptions"] = :all
    ex.run
  ensure
    Rails.application.env_config["action_dispatch.show_exceptions"] = :rescuable
  end

  before do
    # テストが決済サービスの URL と JSON の形を知っていないと、スタブを書けない
    stub_request(:post, charges_url)
      .to_return(body: { id: "ch_1", status: "succeeded" }.to_json)
  end

  it "日曜日は5%引きになる（実行した日の曜日で結果が変わる）" do
    post "/orders", params:, as: :json
    expect(response.parsed_body["total"]).to eq 1900
  end

  it "travel_to で日曜日に固定すると通る" do
    travel_to Time.zone.local(2026, 11, 22, 10, 0) # 2026年11月22日は日曜日
    post "/orders", params:, as: :json
    expect(response.parsed_body["total"]).to eq 1900
  end

  it "保存の検証で失敗すると、請求だけが残る（全角の＠）" do
    post "/orders", params: params.merge(email: "hanako＠example.com"), as: :json
    puts "  応答: #{response.status}、請求の回数: #{charge_count}、注文の件数: #{Order.count}"
    expect(a_request(:post, charges_url)).to have_been_made.once
    expect(Order.count).to eq 0
  end

  it "メールの送信で失敗した後にもう一度送ると、2回請求される" do
    calls = 0
    allow_any_instance_of(ActionMailer::MessageDelivery).to receive(:deliver_now) do
      calls += 1
      raise Net::ReadTimeout if calls == 1 # 1回目だけメールサーバーが応答しない
    end

    post "/orders", params:, as: :json # 利用者には 500 のエラーが表示される
    first = response.status
    post "/orders", params:, as: :json # 利用者がもう一度「注文を確定する」を押す
    puts "  1回目の応答: #{first}、2回目の応答: #{response.status}、請求の回数: #{charge_count}、注文の件数: #{Order.count}"
    expect(a_request(:post, charges_url)).to have_been_made.twice
    expect(Order.count).to eq 2
  end
end`}
          />
          <Code
            lang="text"
            title="実行結果（2026年11月21日 土曜日に実行。bundle exec rspec spec/requests --format documentation）"
            code={`POST /orders（1つのアクションに全部を書いた版）
  日曜日は5%引きになる（実行した日の曜日で結果が変わる） (FAILED - 1)
  travel_to で日曜日に固定すると通る
  応答: 422、請求の回数: 1、注文の件数: 0
  保存の検証で失敗すると、請求だけが残る（全角の＠）
  1回目の応答: 500、2回目の応答: 201、請求の回数: 2、注文の件数: 2
  メールの送信で失敗した後にもう一度送ると、2回請求される

Failures:

  1) POST /orders（1つのアクションに全部を書いた版） 日曜日は5%引きになる（実行した日の曜日で結果が変わる）
     Failure/Error: expect(response.parsed_body["total"]).to eq 1900

       expected: 1900
            got: 2000

4 examples, 1 failure`}
          />
          <p>
            1つ目のテストは土曜日に実行したので失敗しました。日曜日に実行すれば通ります。2つ目のように travel_to で日時を固定すれば通りますが、そのためにはアクションが現在時刻をどこで読んでいるかをテストが知っている必要があります。3つ目では、全角の「＠」を含むメールアドレスが空欄の確認を通り、請求の後のモデルの検証で失敗しました。応答は 422 ですが、決済サービスへの請求は1回送られていて、注文は保存されていません。4つ目では、メールの送信がタイムアウトして利用者には 500 が返りました。そのときにはもう請求と保存は終わっています。利用者がエラーを見てもう一度ボタンを押すと、請求も注文も2つになりました。
          </p>
          <p>コードの番号の箇所と、5つの観点で起きる問題を表にまとめます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>観点</th>
                  <th>コードの箇所</th>
                  <th>起きる問題</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>変更のしやすさ</td>
                  <td>① 割引の case 文</td>
                  <td>割引のルールを1つ足すたびに、注文を確定するアクションそのものを書き換えます。書き換えるたびに、決済・保存・メールの処理まで壊していないかを確かめる必要があります。</td>
                </tr>
                <tr>
                  <td>複雑さの整理</td>
                  <td>② アクション全体</td>
                  <td>検証・計算・決済・保存・通知が1つのメソッドに並んでいて、どこまでが業務の判断で、どこからが外部とのやり取りかを読み取りにくくなります。同じ注文を API や管理画面からも受け付けるときは、同じ手順をもう一度書くことになります。</td>
                </tr>
                <tr>
                  <td>外部への依存の分離</td>
                  <td>③ Net::HTTP.post</td>
                  <td>決済サービスの URL、JSON の項目名、status の値を、アクションが直接知っています。決済サービスを替えると、注文のアクションを書き直します。テストにも URL と JSON の形を書くことになります。</td>
                </tr>
                <tr>
                  <td>信頼性</td>
                  <td>④ 請求の後の保存とメール</td>
                  <td>実行結果のとおり、保存の検証で失敗すると請求だけが残ります。メールの送信で失敗すると 500 になり、利用者がもう一度押すと2回請求されます。</td>
                </tr>
                <tr>
                  <td>テストのしやすさ</td>
                  <td>⑤ Time.current（と③の通信）</td>
                  <td>日曜日の割引のテストは、日曜日にしか通りません。travel_to と WebMock で外から固定できますが、テストはアクションの中で何を読み、どこへ通信するかを知っている必要があります。</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            図 75-1 は、このアクションが直接つながっている相手を描いたものです。DB、決済サービス、メールサーバー、現在時刻の4つとも、アクションの中で名前を指定して使っています。矢印の横の数字は、アクションがそれぞれを使う順序です。請求が保存より先にあるので、保存や送信で失敗したときに請求だけが残ります。
          </p>
          <Figure n="75-1" title="注文確定のアクションが直接つながっている相手" caption="上のコードをもとにした模式図。丸数字はコードのコメントの番号、矢印の横の数字はアクションが相手を使う順序。">
            <DirectDepsFigure />
          </Figure>
          <p>
            この部で扱う15のパターンは、この5つの観点の問題を解決する方法です。たとえば①は <ChapterLink n={41} /> の Strategy / Policy、②は <ChapterLink n={44} /> の Use Case / Application Service、③は <ChapterLink n={42} /> の Adapter、④は <ChapterLink n={52} /> の Idempotency Key と <ChapterLink n={53} /> の Transactional Outbox、⑤は <ChapterLink n={40} /> の Dependency Injection と <ChapterLink n={45} /> の Functional Core, Imperative Shell で扱います。複数のパターンを組み合わせてこのアクションを作り直す例は <ChapterLink n={55} /> で示します。
          </p>
          <Callout title="第7部との関係">
            <ChapterLink n={33} /> では Service・Form・Query・Value Object などのクラスの分け方を、<ChapterLink n={34} /> では注文の受付を Rails の標準機能から順に直していく流れを扱いました。この部では1つのパターンを1つの章で、パターンの問題がいちばんわかりやすく現れる題材を使って扱います。そのため、章ごとに題材が変わります。最後の <ChapterLink n={55} /> で、この部のパターンを組み合わせて注文の確定を組み立てます。第7部を読んでいなくても、この部は読めるように書いています。
          </Callout>
        </>
      ),
    },
    {
      id: 'what-is-pattern',
      title: 'デザインパターンとは何か',
      body: (
        <>
          <p>
            <Term en="design pattern">デザインパターン</Term>
            は、ソフトウェアの設計で繰り返し現れる問題と、その解決方法の中心部分を組にして名前を付けたものです。この考え方を広めたのは、Erich Gamma、Richard Helm、Ralph Johnson、John Vlissides の4人が1994年に出版した『Design Patterns: Elements of Reusable Object-Oriented Software』です
            <Ref n={1} />
            。4人は GoF（Gang of Four）と呼ばれます。この本は23のパターンを目的によって、オブジェクトの生成・構造・振る舞いの3つに分けています。
          </p>
          <p>
            GoF は第1章で、建築家 Christopher Alexander の『A Pattern Language』（1977年）
            <Ref n={2} />
            の一節を引用しています。内容は次のとおりです（筆者訳）。「それぞれのパターンは、私たちの周りで何度も繰り返し起きる問題を記述し、次にその問題の解決の中心部分を、この解決を100万回使っても同じやり方を2度繰り返すことがないような形で記述する」。パターンはそのまま貼り付けるコードではなく、問題の状況に合わせて毎回形を変えて当てはめるものです。
          </p>
          <p>
            GoF は、パターンには4つの要素があるとしています
            <Ref n={1} />
            。
          </p>
          <ul>
            <li>名前：設計について話すときの共通の用語になる</li>
            <li>問題：いつパターンを使うか。問題とその状況を説明する</li>
            <li>解決：設計を構成する要素、その関係、責務、協調の仕方。特定の実装ではなくいろいろな場面に当てはめられる形で書く</li>
            <li>結果：パターンを使った結果と、そのトレードオフ</li>
          </ul>
          <p>
            ソフトウェアのパターンを集めている The Hillside Group も、パターンを「よい設計や経験を、ほかの人が再利用できる形で記述する方法」と説明し、その目的を、開発者が繰り返し出会う問題の解決を助けることだとしています
            <Ref n={4} />
            。どの説明でも、パターンの中心にあるのは繰り返し現れる問題です。この部でも、パターンを使うこと自体を目的にせず、問題があるかどうかを先に確かめます。
          </p>
          <h3>Rails の中にあるパターン</h3>
          <p>
            Rails を使っていると、意識しないうちにパターンを使っています。Rails のモデルの仕組みである Active Record の名前は、Martin Fowler が『Patterns of Enterprise Application Architecture』（PoEAA）で名付けたパターンから来ています。Rails Guides は、Active Record パターンを「DB のテーブルやビューの1行を包み、DB へのアクセスを閉じ込め、そのデータに業務の処理を加えるオブジェクト」という Fowler の定義で説明しています
            <Ref n={9} />
            <Ref n={7} />
            。この部で扱うパターンにも、Rack ミドルウェア（Middleware Chain）や lock_version（Optimistic Locking）のように、Rails がすでに実装しているものがあります。どのパターンを Rails の機能で済ませ、どれを自分で書くかは、後の節の表にまとめます。
          </p>
          <Callout title="MSDP というカタログの位置付け">
            <p>
              MSDP（Modern Software Design Patterns）は、本書とは別の教科書が、GoF の考え方を引き継ぎ、現代の Web アプリケーションで重要な設計上の問題に合わせて選んだパターンの一覧です。業界で定められた標準の一覧ではありません。個々のパターンには、GoF、Fowler の PoEAA
              <Ref n={7} />
              、Eric Evans の『Domain-Driven Design』
              <Ref n={8} />
              など、それぞれの出典があります。各章では元になった資料を示し、MSDP での定義と元の定義が違う場合（Middleware Chain と Chain of Responsibility、Materialized View が指す範囲など）はその違いを説明します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'catalog',
      title: 'MSDP の5つの観点と15のパターン',
      body: (
        <>
          <p>
            GoF が主にオブジェクトの生成・構造・振る舞いを扱ったのに対して、MSDP は次の5つの観点を重視します。最初の節で注文のアクションに見つけた5つの問題と同じ観点です。
          </p>
          <ol>
            <li>変更のしやすさ：変更の影響が及ぶ範囲を小さくする</li>
            <li>複雑さの整理：業務の処理や状態を整理する</li>
            <li>外部への依存の分離：DB・外部 API・フレームワークへの依存を管理する</li>
            <li>信頼性：障害・再実行・データの食い違いに耐える</li>
            <li>テストのしやすさ：副作用と依存先を制御して、検証できるようにする</li>
          </ol>
          <p>
            図 75-2 は、15のパターンを4つのカテゴリに分けた一覧です。MSDP ではパターンに1から15の番号を付けていますが、この部では表示の章番号で示します。章の欄のリンクから、それぞれの章へ移動できます。題材の欄は、その章で動かすコードの場面です。
          </p>
          <Figure n="75-2" title="MSDP の15のパターンと4つのカテゴリ" caption="章の欄を選ぶと、その章へ移動する。最後の行はパターンを組み合わせる章。">
            <CatalogTable />
          </Figure>
          <h3>パターンを選んだ基準</h3>
          <p>MSDP は15のパターンを次の基準で選んでいます。</p>
          <ul>
            <li>汎用性：多くの Web アプリケーションで使える</li>
            <li>問題の明確さ：解決する設計上の問題がはっきりしている</li>
            <li>再現性：別のプロジェクトでも繰り返し当てはめられる</li>
            <li>設計の効果：変更のしやすさ・保守のしやすさ・信頼性を改善できる</li>
            <li>現代への適合：現在の言語機能やフレームワークと相性がよい</li>
            <li>独立性：ほかのパターンと解決する問題が重なりすぎない</li>
            <li>学ぶ価値：実装の方法だけでなく、設計の判断を学べる</li>
          </ul>
          <h3>扱う範囲</h3>
          <p>
            対象は Web アプリケーション、バックエンドのシステム、モジュラーモノリス（1つのアプリケーションを内部でモジュールに分けた構成）、外部 API との連携、非同期処理、DB を使うアプリケーション、分散システム（複数のサーバーやサービスがネットワークで通信して動くシステム）の基本的な信頼性の設計です。マイクロサービスに固有の複雑な設計（サービスをまたぐトランザクションの調整など）と、フロントエンドに固有の状態管理は扱いません。
          </p>
          <p>
            設計原則（SOLID など）やアーキテクチャのパターン（Clean Architecture、CQRS など）は、独立した章では扱いません。パターンの章の中で、比べる必要があるときに名前と違いを短く示します。DDD・Clean Architecture・Hexagonal Architecture と Rails の書き方の違いは <ChapterLink n={34} section="rails-way-ddd" /> で扱いました。
          </p>
        </>
      ),
    },
    {
      id: 'principles',
      title: 'パターンを採用するときの8つの原則',
      body: (
        <>
          <p>
            この部のどの章でも、次の8つの原則に沿ってパターンを採用するかどうかを判断します。各章の最後の「使い分けと採用の判断」の節は、この原則を章の問題に当てはめたものです。1〜7は MSDP の原則と同じです。8は、この部が Rails だけで書くことに合わせて置き換えました（下の注記を参照）。
          </p>
          <ol>
            <li>
              パターンより問題を先に考える。パターンを使うこと自体を目的にしない。解決すべき問題を確かめてから、パターンを選ぶ。
            </li>
            <li>
              必要以上に抽象化しない。将来の変更の可能性を大きく見積もりすぎない。メソッド1つで足りるときは、基底クラスや、いくつものクラスが同じメソッドを持つという取り決めを作らない。Martin Fowler は YAGNI（You Aren't Gonna Need It。まだ必要のない機能を作らないという考え方）の記事で、まだ使われない機能のために作るコードには、作る費用、価値が届くのが遅れる費用、複雑さを抱え続ける費用、後で直す費用がかかると説明しています
              <Ref n={5} />
              。ただし同じ記事で、コードを変更しやすくするためのリファクタリングは YAGNI の対象外だとも述べています。
            </li>
            <li>
              継承よりコンポジション（ほかのオブジェクトを内部に持ち、そのメソッドを呼び出して機能を実現すること）を優先する。GoF も第1章で「クラスの継承よりオブジェクトのコンポジションを優先する」ことを原則に挙げています
              <Ref n={1} />
              <Ref n={6} />
              。ただし、継承が適している場面まで排除するわけではありません。Rails のモデルが ApplicationRecord を継承するのは、その例です。
            </li>
            <li>
              副作用（DB への書き込み、外部 API との通信、状態の変更など、値を返す以外に外へ影響を与える動作）と依存先を明示する。副作用がコードのどこで起きるかを追えるようにする。Rails ではコールバックの中の副作用が見落とされやすいので、とくに気を付けます（<ChapterLink n={30} section="callback-design" />）。
            </li>
            <li>障害と再実行を設計に含める。正常な場合だけでなく、異常な場合、一部だけ失敗した場合、同じ処理が2回実行された場合を考える。最初の節の④がこの例です。</li>
            <li>複雑さと効果のバランスを取る。パターンを導入して得られる効果が、理解・実装・運用の手間を上回る場合だけ導入する。</li>
            <li>テストのしやすさを重視する。テストを書きにくいコードは、依存先や責務の分け方に問題がないかを見直す手がかりにする。</li>
            <li>
              フレームワークの機能を先に確かめる。Rails が同じ問題をすでに解いている場合（Rack ミドルウェア、lock_version、retry_on など）は、パターンの名前でクラスを作り直さずにその機能を使う。反対に、Rails の機能の名前がパターンに似ていても、解いている問題の範囲が違うことがあるので、何を保証するかを確かめる（Active Record は Unit of Work ではない。ActiveSupport::Notifications はイベントを保存しない）。
            </li>
          </ol>
          <Callout title="8つ目の原則を置き換えた理由">
            MSDP の8つ目の原則は「特定の言語に依存しない部分を理解する」で、TypeScript と Ruby の両方で実装して、言語の書き方の違いとパターンとして共通する部分を区別することを指しています。この部は Rails のアプリケーションのコードだけで書くので、この原則をそのまま当てはめる場面がありません。代わりに、Rails の開発で起きやすい判断の誤り（Rails にある機能を作り直す、または名前の似た機能で足りると思い込む）を防ぐ原則にしました。Rails の作者がフレームワークの規約をどう考えているかは <ChapterLink n={31} /> で扱いました。
          </Callout>
          <p>ここで挙げた原則と、KISS・SOLID などのプログラミングの原則との違いは、<ChapterLink n={56} /> で扱いました。</p>
        </>
      ),
    },
    {
      id: 'rails-map',
      title: 'Rails の標準機能とパターンの対応',
      body: (
        <>
          <p>
            この部の15のパターンは、Rails との関係で3つに分かれます。図 75-3 は、パターンごとに Rails の標準機能とよく使う gem、Rails での扱いをまとめた表です。
          </p>
          <Figure n="75-3" title="Rails の標準機能・gem とパターンの対応" caption="Rails 8.1.4.1 のソースと Rails Guides で確かめた。「標準機能を使う」は Rails の機能でパターンの中心部分が済むもの。">
            <RailsMapTable />
          </Figure>
          <h3>標準機能を使うもの</h3>
          <p>
            Middleware Chain・Optimistic Locking・Retry with Backoff・Value Object は、Rails がパターンの中心部分を実装しています。リクエストの前後の処理は Rack ミドルウェアとして config.middleware で足し、順番を入れ替えられます
            <Ref n={10} />
            。テーブルに lock_version の列を足すと、Active Record は更新のたびにその値を増やし、読み込んだ後にほかの人が更新していれば ActiveRecord::StaleObjectError を発生させます
            <Ref n={14} />
            。ジョブの再試行は retry_on で書きます
            <Ref n={11} />
            <Ref n={15} />
            。値に型を持たせる仕組みとして、composed_of
            <Ref n={16} />
            、Attributes API のカスタム型、値を保存の前にそろえる normalizes
            <Ref n={17} />
            があり、Ruby にも値を表す不変のクラスを作る Data.define があります
            <Ref n={19} />
            。これらの章ではパターンのクラスを一から書くのではなく、Rails の機能で何が済み、何が足りないかを確かめます。
          </p>
          <h3>Rails の機能と組み合わせて書くもの</h3>
          <p>
            残りの多くは、Rails に専用の機能がなく、Ruby のクラスと Rails の機能を組み合わせて書きます。たとえば Adapter は、Rails 自身が使っているパターンです。Active Job は Sidekiq や Resque などのキューのライブラリを同じ perform_later で使えるように、ライブラリごとのキューアダプターで違いを吸収し（Sidekiq 8 では Sidekiq の gem が自分のアダプターを持っています）
            <Ref n={12} />
            、Active Storage は Disk・S3・GCS のサービスを1つのクラスの形にそろえ
            <Ref n={13} />
            、Action Mailer は smtp・sendmail・file・test の送信方法を delivery_method で切り替えます
            <Ref n={18} />
            。しかし、アプリケーションが使う決済サービスの Adapter は自分で書きます。Domain Events に使える ActiveSupport::Notifications や Rails 8.1 の Rails.event
            <Ref n={20} />
            は、イベントを購読者へ同じスレッドで渡す仕組みで、イベントを保存して後で再送する機能はありません。Idempotency Key は一意索引、Transactional Outbox はテーブルとジョブで作ります。
          </p>
          <h3>別の方法で代えるもの</h3>
          <p>
            Unit of Work は、変更したオブジェクトを記録しておき、最後にまとめて DB に書き込むパターンです。Active Record は各オブジェクトが自分で保存する方式なので、Rails で Unit of Work を自作する場面はほとんどありません。ただし、Unit of Work が解く問題（親と子のレコードの一部だけが保存される）は Rails でもよく起きます。<ChapterLink n={48} /> では、この問題を autosave とトランザクションで解き、自作の Unit of Work は仕組みの説明として短く示します。同じように、Use Case の章で扱う Repository も、Rails ではモデルのスコープとクラスメソッドで足りることが多いので、その理由を説明します。
          </p>
          <Callout kind="note" title="MySQL で書き換えた点">
            MSDP の Rails の例は PostgreSQL で書かれています。この部はすべて MySQL 8.4 で動かしました。MySQL には部分インデックスとマテリアライズドビューがありません。<ChapterLink n={50} /> では集計用のテーブルをジョブで作り直す方式を使い、そのほかの違い（CHECK 制約、SELECT … FOR UPDATE SKIP LOCKED、既定の分離レベル REPEATABLE READ）は、使う章でそれぞれ説明します。
          </Callout>
        </>
      ),
    },
    {
      id: 'symptoms',
      title: 'コードの症状からパターンを引く',
      body: (
        <>
          <p>
            コードを書いていて次のような症状に気付いたら、対応する章を読んでください。症状があることは、パターンが必要であることの証拠ではありません。各章の「使い分けと採用の判断」の節で、採用するかどうかを判断します。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>症状</th>
                  <th>章</th>
                </tr>
              </thead>
              <tbody>
                {SYMPTOMS.map(([symptom, id, name]) => (
                  <tr key={id}>
                    <td>{symptom}</td>
                    <td>
                      <ChapterLink n={id} /> {name}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>1つの操作で上の症状のいくつかが同時に起きている（決済を含む注文の確定など）</td>
                  <td>
                    <ChapterLink n={55} /> パターンの組み合わせ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            症状のいくつかは Rails の標準機能だけで直せます。たとえば「2人が同時に編集すると先の変更が消える」は、lock_version の列を足すだけで検出できるようになります。章を読むときは、まず Rails の機能で足りるかを確かめ、足りない部分にだけパターンのクラスを足します。
          </p>
        </>
      ),
    },
    {
      id: 'chapter-layout',
      title: 'この部の章の構成と図の記法',
      body: (
        <>
          <p>
            MSDP は、各パターンを次の11の項目で記述しています。英語の名前は、パターンの資料でよく使われる見出しです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>書く内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Intent（目的）</td>
                  <td>解決する設計上の問題と、採用する理由</td>
                </tr>
                <tr>
                  <td>Context（適用状況）</td>
                  <td>問題が起きる状況、典型的な使い方、必要になる兆候</td>
                </tr>
                <tr>
                  <td>Forces（設計上の制約）</td>
                  <td>同時に満たしたいのに対立する要求</td>
                </tr>
                <tr>
                  <td>Solution（解決方法）</td>
                  <td>構成要素、それぞれの責務、依存の向き</td>
                </tr>
                <tr>
                  <td>Structure（構造）</td>
                  <td>構造図とシーケンス図</td>
                </tr>
                <tr>
                  <td>Implementation（実装）</td>
                  <td>適用前のコード、問題点の分析、適用後のコード、直していく順序、テスト、実務での使い方</td>
                </tr>
                <tr>
                  <td>Language Comparison（言語間比較）</td>
                  <td>TypeScript と Ruby の違い</td>
                </tr>
                <tr>
                  <td>Consequences（結果）</td>
                  <td>得られるものと、増える複雑さ</td>
                </tr>
                <tr>
                  <td>Anti-pattern（アンチパターン）</td>
                  <td>誤った使い方と、やりすぎ</td>
                </tr>
                <tr>
                  <td>Alternatives（代替手段）</td>
                  <td>より単純な方法、似たパターン、フレームワークの機能</td>
                </tr>
                <tr>
                  <td>Decision Guide（採用判断）</td>
                  <td>採用する条件、採用しない条件、確認する点</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            GoF の本は、パターンを Intent・Motivation・Applicability・Structure など13の見出しで記述しています
            <Ref n={1} />
            。GoF の見出しには、Context（適用状況）や Forces（設計上の制約）はありません。Martin Fowler は、これらを見出しに持つ形式として、Problem・Context・Forces・Solution を見出しにする Coplien の形式を紹介し、パターンを書く人が Forces を検討するのは、そのパターンを使うべき場合と使うべきでない場合を探るためだと説明しています
            <Ref n={3} />
            。MSDP の11の項目は、この2つの系統を組み合わせ、採用の判断を加えたものです。
          </p>
          <h3>この部の章の節の並び</h3>
          <p>
            この部のパターンの章（<ChapterLink n={40} />〜<ChapterLink n={54} />）は、11の項目をすべて含めたうえで、Rails のコードを先に見せる順に並べ替えています。最初の節で、パターンを使わずにコントローラーやモデルへ直接書いたコードを動かし、起きる不具合や変更の手間を実行結果で見せます。そのあとでパターンの考え方に進みます。見出しは「Intent（目的）」の形ではなく本書のほかの章と同じく内容を表す言葉にしています。図 75-4 は節の並びと MSDP の項目の対応です。
          </p>
          <Figure n="75-4" title="パターンの章の節と MSDP の項目の対応" caption="節の見出しは章ごとに内容に合わせて変えている。紫の箱は Rails のコードを動かして結果を示す節。">
            <ChapterLayoutFigure />
          </Figure>
          <p>
            MSDP が各章に添えている補助の概念（テストダブル、Repository、Entity、集約、分離レベル、ジョブキュー、配信の保証）は、MSDP と同じ章で説明します。たとえばテストダブルは Dependency Injection の章、分離レベルは Optimistic Locking の章にあります。MSDP の TypeScript の実装と言語間比較の節は扱いません。
          </p>
          <h3>図の記法</h3>
          <p>
            図は本書の凡例（<ChapterLink n={1} section="conventions" /> の図 1-7）に従って描いています。灰色の箱はクラスや構成要素、緑の箱はデータ・外部のサービス・DB、紫の箱は注目してほしい要素、破線の箱は概念上の要素です。この部では、Ruby にインターフェースの構文がないので、「このメソッドに応答する」という取り決めを破線の箱で描くことがあります。実線の矢印は処理や呼び出し、破線の矢印は戻り値や参照です。赤い文字は問題や失敗を表します。
          </p>
          <p>
            同時の更新、重複した配信、途中の失敗は、時間を上から下へ、関係するプロセスやサービスを横に並べたタイムラインの図で描きます。再試行の待ち時間はグラフで示します。実際の構成や数値を単純にした図には、説明に「模式図」と書いています。
          </p>
        </>
      ),
    },
    {
      id: 'sample-app',
      title: 'コードを動かした環境',
      body: (
        <>
          <p>
            この部のコードは、すべて Rails のアプリケーションの中で動かし、RSpec で確かめています。本文に載せたコードは、動かしたファイルと同じです。長いファイルは関係する部分だけを載せ、省いた所には「省略」と書きます。実行結果は実際の出力を貼り、時刻や ID のように環境で変わる部分だけを整えています。
          </p>
          <h3>使ったバージョン</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ソフトウェア</th>
                  <th>バージョン</th>
                  <th>使う章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ruby</td>
                  <td>4.0.9</td>
                  <td>すべて</td>
                </tr>
                <tr>
                  <td>Ruby on Rails</td>
                  <td>8.1.4.1</td>
                  <td>すべて</td>
                </tr>
                <tr>
                  <td>MySQL</td>
                  <td>8.4.13（mysql2 0.5.7）</td>
                  <td>すべて</td>
                </tr>
                <tr>
                  <td>RSpec（rspec-rails）</td>
                  <td>8.1.0</td>
                  <td>すべて</td>
                </tr>
                <tr>
                  <td>WebMock</td>
                  <td>3.36.0</td>
                  <td>外部 API と通信する章</td>
                </tr>
                <tr>
                  <td>Sidekiq（Redis 8.10.3）</td>
                  <td>8.1.7</td>
                  <td>ジョブを使う章</td>
                </tr>
                <tr>
                  <td>Pundit</td>
                  <td>2.5.2</td>
                  <td>
                    <ChapterLink n={41} />
                  </td>
                </tr>
                <tr>
                  <td>AASM</td>
                  <td>6.0.0</td>
                  <td>
                    <ChapterLink n={47} />
                  </td>
                </tr>
                <tr>
                  <td>Faraday・faraday-retry</td>
                  <td>2.15.1・2.4.0</td>
                  <td>外部 API と通信する章</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>アプリケーションの作り方</h3>
          <p>
            この部で使わない機能を省いて rails new でアプリケーションを作り、Gemfile に gem を足しました。章ごとにこのアプリケーションを複製し、その章のマイグレーション・モデル・コントローラー・spec を足して動かしています。
          </p>
          <Code
            lang="bash"
            title="アプリケーションを作ったコマンド"
            code={`rails new base --database=mysql --skip-javascript --skip-asset-pipeline --skip-hotwire \\
  --skip-test --skip-system-test --skip-kamal --skip-thruster --skip-solid --skip-docker \\
  --skip-git --skip-action-cable --skip-action-text --skip-active-storage \\
  --skip-action-mailbox --skip-ci --skip-brakeman --skip-rubocop --skip-bundler-audit \\
  --skip-dev-gems --skip-bootsnap --skip-jbuilder --skip-bundle`}
          />
          <Code
            lang="ruby"
            title="Gemfile（足した部分）"
            code={`gem "sidekiq", "~> 8.1"
gem "pundit", "~> 2.5"
gem "aasm", "~> 6.0"
gem "faraday", "~> 2.15"
gem "faraday-retry", "~> 2.4"

group :development, :test do
  gem "rspec-rails", "~> 8.0"
  gem "webmock", "~> 3.26"
end`}
          />
          <Code
            lang="ruby"
            title="config/application.rb と config/environments/test.rb（変えた部分）"
            code={`# config/application.rb
config.time_zone = "Tokyo"
config.active_job.queue_adapter = :sidekiq

# config/environments/test.rb
config.active_job.queue_adapter = :test`}
          />
          <p>
            time_zone を Tokyo にしているので、Time.current は日本時間を返します。DB の datetime の列には UTC で保存されます。テストではジョブを Redis に積まずに記録だけする :test アダプターを使い、ジョブの中身は perform_enqueued_jobs などで実行して確かめます（<ChapterLink n={20} section="jobs-mail" />）。
          </p>
          <h3>動かし方</h3>
          <p>
            MySQL 8.4 と Redis はコンテナで動かし、Ruby 4.0 のコンテナからつないで RSpec を実行しました。MySQL の設定は既定のままで、分離レベルは REPEATABLE READ、文字コードは utf8mb4 です。次のコマンドは使ったコマンドから gem の置き場所の設定を除いたものです。
          </p>
          <Code
            lang="bash"
            title="MySQL と Redis を起動し、章のアプリケーションで RSpec を実行する"
            code={`docker network create rbdemo
docker run -d --name rbdemo-mysql --network rbdemo -e MYSQL_ROOT_PASSWORD=pass mysql:8.4
docker run -d --name rbdemo-redis --network rbdemo redis:8

# 章のアプリケーションのディレクトリ（ここでは ch39）で実行する
docker run --rm -i --network rbdemo -e RAILS_ENV=test -e TZ=UTC \\
  -e DATABASE_URL=mysql2://root:pass@rbdemo-mysql/ch39_test \\
  -e REDIS_URL=redis://rbdemo-redis:6379/1 \\
  -v "$PWD":/work/ch39 -w /work/ch39 ruby:4.0 \\
  bash -c "bundle install && bin/rails db:create db:migrate && bundle exec rspec"`}
          />
          <p>
            2つの DB 接続で同時の更新を再現する章では、RSpec のトランザクションの中でテストを実行する設定（use_transactional_fixtures）を外し、スレッドごとに別の接続を使っています。その書き方は該当する章で説明します。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <>
          <ul>
            <li>注文の確定を1つのアクションに全部書くと、変更のしやすさ・複雑さ・外部への依存・信頼性・テストのしやすさの5つの観点で問題が起きる。実行すると、請求だけが残る失敗と、やり直しによる二重の請求が起きた。</li>
            <li>デザインパターンは繰り返し現れる問題と解決の中心部分の組である。そのまま貼り付けるコードではなく問題の状況に合わせて形を変えて当てはめる。</li>
            <li>MSDP は別の教科書が選んだカタログで、15のパターンを4つのカテゴリに分けている。各パターンの元の資料は章ごとに示す。</li>
            <li>パターンは問題を確かめてから採用し、必要以上に抽象化しない。効果が手間を上回る場合だけ導入する。</li>
            <li>Rails は Middleware Chain・Optimistic Locking・Retry with Backoff などの中心部分をすでに持っている。パターンのクラスを書く前に、Rails の機能で何が済むかを確かめる。</li>
            <li>Active Record は Unit of Work ではなく、ActiveSupport::Notifications はイベントを保存しない。名前の似た機能が何を保証するかを確かめる。</li>
            <li>この部の章はパターンを使わないコードを動かして問題を見せる節から始まり、MSDP の11の項目（言語間比較を除く）をすべて含む。コードは Rails 8.1.4.1 と MySQL 8.4 で動かして確かめた。</li>
          </ul>
        </>
      ),
    },
  ],
  sources: [
    {
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      publisher: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides／Addison-Wesley（InformIT の書籍ページ）',
      url: 'https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610',
      accessed: '2026-11-13',
      version: '1994年10月刊（著作権表記1995年）',
      note: '23のパターンと3つの分類。第1章のパターンの4つの要素、継承よりコンポジションを優先する原則、パターンの記述形式。',
    },
    {
      title: 'A Pattern Language: Towns, Buildings, Construction',
      publisher: 'Christopher Alexander ほか／Oxford University Press（PatternLanguage.com の書籍ページ）',
      url: 'https://www.patternlanguage.com/bookstore/pattern-language.html',
      accessed: '2026-11-13',
      version: '1977年',
      note: 'GoF が第1章で引用したパターンの説明の出典。',
    },
    {
      title: 'Writing Software Patterns',
      publisher: 'Martin Fowler／martinfowler.com',
      url: 'https://martinfowler.com/articles/writingPatterns.html',
      accessed: '2026-11-13',
      version: '2006年8月1日（2020年8月3日改訂）',
      note: 'パターンの記述形式（GoF、Coplien など）と、Forces を検討する理由。',
    },
    {
      title: 'Design Patterns Library',
      publisher: 'The Hillside Group',
      url: 'https://www.hillside.net/patterns/',
      accessed: '2026-11-13',
      note: 'パターンの説明と目的。',
    },
    {
      title: 'Yagni',
      publisher: 'Martin Fowler／martinfowler.com',
      url: 'https://martinfowler.com/bliki/Yagni.html',
      accessed: '2026-11-13',
      version: '2015年5月26日',
      note: 'まだ使われない機能のためのコードにかかる4つの費用と、リファクタリングが対象外であること。',
    },
    {
      title: 'Design Principles from Design Patterns: A Conversation with Erich Gamma, Part III',
      publisher: 'Bill Venners／Artima',
      url: 'https://www.artima.com/articles/design-principles-from-design-patterns',
      accessed: '2026-11-13',
      version: '2005年6月6日',
      note: 'GoF の2つの原則についての著者へのインタビュー。',
    },
    {
      title: 'Catalog of Patterns of Enterprise Application Architecture',
      publisher: 'Martin Fowler／martinfowler.com',
      url: 'https://martinfowler.com/eaaCatalog/',
      accessed: '2026-11-13',
      version: '書籍は2002年11月刊（著作権表記2003年）',
      note: 'Active Record、Unit of Work、Optimistic Offline Lock などの元の定義。',
    },
    {
      title: 'Domain-Driven Design Reference',
      publisher: 'Eric Evans／Domain Language',
      url: 'https://www.domainlanguage.com/ddd/reference/',
      accessed: '2026-11-13',
      version: '2015年',
      note: '『Domain-Driven Design』（2003年刊）の定義とパターンの要約。',
    },
    {
      title: 'Active Record Basics',
      publisher: 'Rails Guides',
      url: 'https://guides.rubyonrails.org/active_record_basics.html',
      accessed: '2026-11-21',
      version: 'v8.1.4.1',
      note: 'Active Record パターンが Fowler の PoEAA で説明されていることと、その定義。lock_version の列が楽観的ロックに使われること。',
    },
    {
      title: 'Rails on Rack',
      publisher: 'Rails Guides',
      url: 'https://guides.rubyonrails.org/rails_on_rack.html',
      accessed: '2026-11-21',
      version: 'v8.1.4.1',
      note: 'config.middleware でミドルウェアを足し、順番を入れ替えられること。',
    },
    {
      title: 'Active Job Basics',
      publisher: 'Rails Guides',
      url: 'https://guides.rubyonrails.org/active_job_basics.html',
      accessed: '2026-11-21',
      version: 'v8.1.4.1',
      note: 'retry_on でジョブの再試行を宣言すること（既定は3秒待って5回）。',
    },
    {
      title: 'activejob/lib/active_job/queue_adapters',
      publisher: 'Ruby on Rails（GitHub）',
      url: `${GH_TREE}/activejob/lib/active_job/queue_adapters`,
      accessed: '2026-11-21',
      version: 'v8.1.4.1',
      note: 'Active Job が Sidekiq・Resque・Delayed Job などのキューアダプターを持つこと（手元の gem のファイル一覧で確認）。組み込みの sidekiq アダプターは Rails 8.1 で非推奨になり、Sidekiq 8.1.7 の gem が自分のアダプターに置き換えること（両方の gem のソースで確認）。',
    },
    {
      title: 'activestorage/lib/active_storage/service',
      publisher: 'Ruby on Rails（GitHub）',
      url: `${GH_TREE}/activestorage/lib/active_storage/service`,
      accessed: '2026-11-21',
      version: 'v8.1.4.1',
      note: 'Active Storage が Disk・S3・GCS・Mirror のサービスを ActiveStorage::Service のサブクラスとして持つこと。',
    },
    {
      title: 'activerecord/lib/active_record/locking/optimistic.rb',
      publisher: 'Ruby on Rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/locking/optimistic.rb#L16-L52`,
      accessed: '2026-11-21',
      version: 'v8.1.4.1',
      note: 'lock_version の列があると更新のたびに値を増やし、古いオブジェクトの保存で StaleObjectError を発生させること。',
    },
    {
      title: 'activejob/lib/active_job/exceptions.rb（retry_on）',
      publisher: 'Ruby on Rails（GitHub）',
      url: `${GH}/activejob/lib/active_job/exceptions.rb#L64`,
      accessed: '2026-11-21',
      version: 'v8.1.4.1',
      note: 'retry_on の引数（wait: 3.seconds、attempts: 5、jitter）。',
    },
    {
      title: 'activerecord/lib/active_record/aggregations.rb（composed_of）',
      publisher: 'Ruby on Rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/aggregations.rb#L225`,
      accessed: '2026-11-21',
      version: 'v8.1.4.1',
      note: '複数の列から値のオブジェクトを作る composed_of。',
    },
    {
      title: 'activemodel/lib/active_model/attributes/normalization.rb（normalizes）',
      publisher: 'Ruby on Rails（GitHub）',
      url: `${GH}/activemodel/lib/active_model/attributes/normalization.rb#L111`,
      accessed: '2026-11-21',
      version: 'v8.1.4.1',
      note: '属性の値をそろえる normalizes。Rails 8.1 では Active Model に置かれている。',
    },
    {
      title: 'actionmailer/lib/action_mailer/delivery_methods.rb',
      publisher: 'Ruby on Rails（GitHub）',
      url: `${GH}/actionmailer/lib/action_mailer/delivery_methods.rb#L21-L37`,
      accessed: '2026-11-21',
      version: 'v8.1.4.1',
      note: 'Action Mailer が smtp・file・sendmail・test の送信方法を登録し、delivery_method で選ぶこと。',
    },
    {
      title: 'class Data',
      publisher: 'Ruby Documentation',
      url: 'https://docs.ruby-lang.org/en/master/Data.html',
      accessed: '2026-11-21',
      note: 'Data.define が値を表すクラスを作り、メンバーを変更するメソッドを持たないこと。',
    },
    {
      title: 'railties/lib/rails.rb（Rails.event）',
      publisher: 'Ruby on Rails（GitHub）',
      url: `${GH}/railties/lib/rails.rb#L95-L102`,
      accessed: '2026-11-21',
      version: 'v8.1.4.1',
      note: 'Rails.event が ActiveSupport::EventReporter を返すこと。',
    },
  ],
}

export default chapter
