import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 95-1 2社の SDK とアプリの取り決めの対応 ---------- */
const mappingRows: { label: string; a: string[]; b: string[]; app: string[] }[] = [
  { label: '呼び出し', a: ['create_charge(…)'], b: ['authorize_and_capture(…)'], app: ['charge(…)'] },
  { label: '金額', a: ['amount: 3000', '（最小単位の整数）'], b: ['amount: "30.00"', '（小数の文字列）'], app: ['amount_cents: 3000'] },
  { label: '通貨', a: ['currency: "usd"'], b: ['currency_code: 840（数字）'], app: ['currency: "USD"'] },
  { label: '注文の番号', a: ['metadata: { order_id: 7 }'], b: ['merchant_order_ref: "7"'], app: ['order_id: 7'] },
  { label: '成功', a: ['status: "succeeded"'], b: ['result_code: "0000"'], app: ['Succeeded'] },
  { label: '残高不足', a: ['status: "failed"', 'failure_code: "insufficient_funds"'], b: ['result_code: "1001"'], app: ['Declined', 'reason: :insufficient_funds'] },
  { label: '決済の日時', a: ['created: 1794531600', '（UNIX 時刻の秒）'], b: ['processed_at: "20261113100000"', '（日本時間）'], app: ['charged_at', '（TimeWithZone）'] },
  { label: '一時的な障害', a: ['PayA::Error', '（type が "api_error" など）'], b: ['PayB::ConnectionError', 'result_code: "9001"'], app: ['Payments::Unavailable', '（例外）'] },
]

function MappingFigure() {
  const cols = [
    { x: 10, w: 88 },
    { x: 100, w: 236 },
    { x: 338, w: 232 },
    { x: 572, w: 198 },
  ]
  const heads = ['項目', 'A社の SDK（PayA::Client）', 'B社の SDK（PayB::GatewayClient）', 'アプリの取り決め（Payments）']
  let y = 42
  const rows: ((typeof mappingRows)[number] & { top: number; h: number })[] = []
  for (const r of mappingRows) {
    const n = Math.max(r.a.length, r.b.length, r.app.length)
    const h = n === 1 ? 30 : 44
    rows.push({ ...r, top: y, h })
    y += h + 2
  }
  return (
    <Svg
      id="95-1"
      w={780}
      h={y + 8}
      label={`30.00 米ドルの注文を例に、A社の SDK、B社の SDK、アプリの取り決めで同じ項目がどう表されるかを並べた表。${mappingRows.map((r) => `${r.label}：A社は ${r.a.join(' ')}、B社は ${r.b.join(' ')}、取り決めは ${r.app.join(' ')}`).join('。')}`}
    >
      {heads.map((t, i) => (
        <Box key={t} x={cols[i].x} y={10} w={cols[i].w} h={30} lines={t} fs={12} fill="bg" bold />
      ))}
      {rows.map((r) => (
        <g key={r.label}>
          <Box x={cols[0].x} y={r.top} w={cols[0].w} h={r.h} lines={r.label} fs={12} fill="bg" />
          <Box x={cols[1].x} y={r.top} w={cols[1].w} h={r.h} lines={r.a} fs={11} fill="box4" mono />
          <Box x={cols[2].x} y={r.top} w={cols[2].w} h={r.h} lines={r.b} fs={11} fill="box4" mono />
          <Box x={cols[3].x} y={r.top} w={cols[3].w} h={r.h} lines={r.app} fs={11} fill="box5" mono />
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図 95-2 Adapter の構造 ---------- */
function StructureFigure() {
  return (
    <Svg
      id="95-2"
      w={780}
      h={436}
      label="アプリのコード（app）の中で、PaymentsController が Order#pay! を呼び、Order#pay! は Payments の取り決め（charge と、結果の Succeeded・Declined・Unavailable）だけを使う。Payments::PayAAdapter と Payments::PayBAdapter が取り決めを満たし、それぞれ外部の PayA::Client と PayB::GatewayClient を呼ぶ。Payments.gateway は config.x.payments.provider と credentials から、どちらかの Adapter を作る。アプリと外部の間の矢印はすべて外部に向かい、SDK はアプリの取り決めを知らない"
    >
      <rect x={10} y={10} width={760} height={266} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray="2 4" />
      <T x={24} y={30} fs={12} tone="muted">
        アプリのコード（app/）
      </T>
      <Box x={30} y={50} w={160} h={52} lines={['PaymentsController', '結果を JSON で返す']} fs={12} bold subTone="muted" />
      <Arrow x1={190} y1={76} x2={228} y2={76} />
      <Box x={230} y={50} w={180} h={52} lines={['Order#pay!', '取り決めだけを使う']} fs={12} bold subTone="muted" />
      <Arrow x1={410} y1={76} x2={468} y2={76} />
      <T x={439} y={64} anchor="middle" fs={11} mono>
        charge
      </T>
      <Box
        x={470}
        y={44}
        w={290}
        h={86}
        lines={['Payments（取り決め）', 'charge(order_id:, amount_cents:,', 'currency:, card_token:)', '→ Succeeded・Declined・Unavailable']}
        fs={12}
        fill="box2"
        bold
        subTone="muted"
      />
      <Box x={30} y={176} w={200} h={68} lines={['Payments.gateway', 'config.x.payments.provider', 'と credentials から作る']} fs={12} bold subTone="muted" />
      <Arrow x1={230} y1={204} x2={298} y2={204} />
      <T x={36} y={260} fs={11} tone="muted">
        設定で選んだ一方を作る
      </T>
      <Box x={300} y={180} w={200} h={52} lines={['Payments::PayAAdapter', 'A社の形に変換する']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={540} y={180} w={200} h={52} lines={['Payments::PayBAdapter', 'B社の形に変換する']} fs={12} fill="box5" bold subTone="muted" />
      <Arrow x1={420} y1={180} x2={540} y2={132} dashed />
      <Arrow x1={640} y1={180} x2={640} y2={132} dashed />
      <T x={652} y={156} fs={11} tone="muted">
        取り決めを満たす
      </T>

      <rect x={10} y={290} width={760} height={110} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray="2 4" />
      <T x={24} y={310} fs={12} tone="muted">
        外部（vendor/sdks。アプリからは変更しない）
      </T>
      <Box x={300} y={330} w={200} h={52} lines={['PayA::Client', 'A社の SDK']} fs={12} fill="box4" bold subTone="muted" />
      <Box x={540} y={330} w={200} h={52} lines={['PayB::GatewayClient', 'B社の SDK']} fs={12} fill="box4" bold subTone="muted" />
      <Arrow x1={400} y1={232} x2={400} y2={328} />
      <T x={392} y={268} anchor="end" fs={11} mono>
        create_charge
      </T>
      <Arrow x1={640} y1={232} x2={640} y2={328} />
      <T x={632} y={268} anchor="end" fs={11} mono>
        authorize_and_capture
      </T>
      <T x={30} y={360} fs={11} tone="muted">
        各社の API へ HTTPS で送る
      </T>
      <T x={20} y={422} fs={12}>
        アプリと外部の間の矢印は、すべて外部に向かう。SDK はアプリの取り決めを知らない
      </T>
    </Svg>
  )
}

/* ---------- 図 95-3 B社で残高不足になったときのシーケンス ---------- */
function SequenceFigure() {
  const xs = [80, 340, 545, 705]
  const names = ['Order#pay!', 'PayBAdapter', 'PayB::GatewayClient', 'B社の API']
  return (
    <Svg
      id="95-3"
      w={780}
      h={430}
      label="30.00 米ドルの注文で、B社が残高不足を返したときの流れ。Order#pay! が PayBAdapter の charge を amount_cents 3000、currency USD で呼ぶ。PayBAdapter は金額を文字列 30.00、通貨を 840 に変換して、B社の SDK の authorize_and_capture を呼ぶ。SDK は B社の API に HTTPS で送り、result_code 1001 の応答を受け取ってハッシュで返す。PayBAdapter は 1001 を insufficient_funds に変換し、Declined を返す。Order#pay! は payment_failed を保存し、コントローラーは残高が不足していることを伝える"
    >
      {names.map((n, i) => (
        <g key={n}>
          <Box x={xs[i] - 70} y={10} w={140} h={34} lines={n} fill={i === 3 ? 'box4' : 'box'} mono fs={12} />
          <line x1={xs[i]} y1={44} x2={xs[i]} y2={420} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <T x={210} y={56} anchor="middle" fs={11} mono>
        charge(amount_cents: 3000,
      </T>
      <T x={210} y={70} anchor="middle" fs={11} mono>
        currency: "USD", …)
      </T>
      <Arrow x1={xs[0]} y1={84} x2={xs[1] - 2} y2={84} />
      <Box x={xs[1] - 4} y={96} w={200} h={30} lines={'"30.00" と 840 に変換'} fs={12} fill="box5" />
      <T x={(xs[1] + xs[2]) / 2} y={144} anchor="middle" fs={11} mono>
        authorize_and_capture(…)
      </T>
      <Arrow x1={xs[1]} y1={156} x2={xs[2] - 2} y2={156} />
      <T x={(xs[2] + xs[3]) / 2} y={176} anchor="middle" fs={11} mono>
        POST（HTTPS）
      </T>
      <Arrow x1={xs[2]} y1={188} x2={xs[3] - 2} y2={188} />
      <Arrow x1={xs[3]} y1={216} x2={xs[2] + 2} y2={216} dashed />
      <T x={(xs[2] + xs[3]) / 2} y={230} anchor="middle" fs={11} mono>
        {'{"result_code":"1001"}'}
      </T>
      <Arrow x1={xs[2]} y1={252} x2={xs[1] + 2} y2={252} dashed />
      <T x={(xs[1] + xs[2]) / 2} y={266} anchor="middle" fs={11} mono>
        {'{ "result_code" => "1001" }'}
      </T>
      <Box x={xs[1] - 4} y={282} w={200} h={30} lines={'"1001" → :insufficient_funds'} fs={11} fill="box5" mono />
      <Arrow x1={xs[1]} y1={338} x2={xs[0] + 2} y2={338} dashed />
      <T x={210} y={326} anchor="middle" fs={11} mono>
        Declined(reason: :insufficient_funds)
      </T>
      <Box x={14} y={356} w={250} h={50} lines={['payment_failed を保存', 'コントローラーは 422 を返す']} fs={12} subTone="muted" />
      <T x={350} y={394} fs={12} tone="danger">
        「残高が不足しています」
      </T>
    </Svg>
  )
}

/* ---------- 図 95-4 Adapter と似た考え方の範囲 ---------- */
function ScopeFigure() {
  return (
    <Svg
      id="95-4"
      w={780}
      h={276}
      label="範囲の関係を入れ子で示した図。いちばん外側の Ports and Adapters はアプリケーション全体の構成の考え方で、内側に取り決め（ポート）を置き、利用者・テスト・DB・外部サービスごとにアダプターを用意する。その中の腐敗防止層は、外部のモデルを自分たちのモデルの言葉に変換する層で、Adapter と Facade を部品として使う。Adapter は1つの外部のインターフェースを使う側が決めた取り決めに合わせ、Facade は複数の部品をまとめて単純なインターフェースを新しく作る。この章の Payments の取り決めはポートに、PayAAdapter と PayBAdapter はアダプターに当たる"
    >
      <rect x={10} y={10} width={760} height={256} rx={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={24} y={32} bold fs={13}>
        Ports and Adapters：アプリケーション全体の構成
      </T>
      <rect x={30} y={50} width={720} height={150} rx={10} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={44} y={72} bold fs={13}>
        腐敗防止層：外部のモデルを自分たちのモデルの言葉に変換する層
      </T>
      <Box x={50} y={92} w={320} h={90} lines={['Adapter（この章）', '1つの外部のインターフェースを、', '使う側が決めた取り決めに合わせる']} fs={12.5} fill="box5" bold subTone="muted" />
      <Box x={400} y={92} w={330} h={90} lines={['Facade', '複数の部品をまとめて、', '単純なインターフェースを新しく作る']} fs={12.5} fill="box" bold subTone="muted" />
      <T x={30} y={226} fs={12} tone="muted">
        内側に取り決め（ポート）を置き、利用者・テスト・DB・外部サービスごとにアダプターを用意する
      </T>
      <T x={30} y={250} fs={12} tone="muted">
        この章の Payments の取り決めはポートに、PayAAdapter・PayBAdapter はアダプターに当たる
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 42,
  part: 9,
  title: 'Adapter：2社の決済サービスの違いを吸収する',
  summary:
    'A社とB社の決済サービスの SDK を例に、メソッド名・金額の単位・時刻・エラーの返し方の違いを、アプリが決めた取り決めに合わせる Adapter のクラスにまとめます。設定でどちらの会社を使うかを選び、RSpec の shared_examples と WebMock で、2つの Adapter が同じ取り決めを満たすことを確かめます。',
  goals: [
    '外部の SDK の引数名・金額の単位・状態のコード・例外が業務のコードに混ざると、会社の追加や切り替えのときに何が起きるかを説明できる',
    '取り決め（メソッド・戻り値・例外）をアプリの側で決め、外部の SDK の形に合わせない理由を説明できる',
    '金額の単位・通貨・時刻・拒否の理由・例外を変換する Adapter を app/adapters に書き、設定と credentials で使う Adapter を選べる',
    'カードの拒否・一時的な障害・プログラムの誤りを分けて扱い、置き換えた例外の cause に元の例外を残せる',
    'RSpec の shared_examples と WebMock で、2つの Adapter が同じ取り決めを満たすことを確かめられる',
    'Active Job・Active Storage・DB のアダプターのように Rails が用意している Adapter と、自分で書く Adapter を区別できる',
    'Adapter と Facade、腐敗防止層、Ports and Adapters の違いを説明できる',
  ],
  prerequisites: [20, 33, 40],
  sections: [
    {
      id: 'scene',
      title: 'A社とB社の決済を if で分けたコードで起きること',
      body: (
        <>
          <p>
            EC サイトで注文の代金をクレジットカードで受け取る場面を考えます。カードの番号はアプリで保存せず、決済代行の会社（決済サービス）に預けます。ブラウザーは決済サービスからカードを表す文字列（トークン）を受け取ってアプリに送り、アプリはトークンと金額を決済サービスに渡して請求します。決済サービスの API を Ruby から呼ぶために、各社は <Term en="SDK、Software Development Kit">SDK</Term> を gem として配っています。SDK は HTTP のリクエストの組み立て、認証のヘッダー、応答の解析、エラーの例外への変換を受け持つライブラリです。
          </p>
          <p>
            このサイトは A社の決済サービスを使ってきましたが、手数料の安い B社も使えるようにし、海外の利用者向けに米ドルの注文も受けることになりました。A社とB社は本書で用意した架空の会社で、SDK も架空のものを <code>vendor/sdks</code> に置いて Rails のアプリから読み込みます。本物の SDK は Gemfile に書いた gem として読み込まれます。2社の SDK は同じ「請求する」という操作を次のように違う形で提供しています。
          </p>
          <Code
            lang="ruby"
            title="vendor/sdks/pay_a.rb・vendor/sdks/pay_b.rb（メソッドの説明の部分）"
            code={`
module PayA
  # status は "succeeded" か "failed"。failure_code は "insufficient_funds"・"expired_card"・"card_declined" か nil
  Charge = Struct.new(:id, :amount, :currency, :status, :failure_code, :created, keyword_init: true)

  class Error < StandardError
    # "invalid_request_error"・"api_error"・"rate_limit_error"・"api_connection_error"
    attr_reader :type
    # …（省略）
  end

  class Client
    # amount は通貨の最小単位の整数（円なら 1 円、米ドルなら 1 セントが 1）。currency は "jpy"・"usd"
    # カードが拒否されたときは例外にせず、status が "failed" の Charge を返す
    def create_charge(amount:, currency:, source:, metadata: {})
      # …（省略。https://api.pay-a.example/v1/charges に JSON を POST する）
    end
  end
end

module PayB
  class ConnectionError < StandardError; end

  class GatewayClient
    # amount は小数点を含む文字列（"30.00" は 30 米ドル）。currency_code は ISO 4217 の数字コード（円は 392、米ドルは 840）
    # カードが拒否されても例外にしない。戻り値のハッシュ:
    #   "result_code"    "0000" 成功 / "1001" 残高不足 / "1002" 有効期限切れ / "1099" その他の拒否 / "9001" システム停止中
    #   "transaction_id" 取引の ID
    #   "processed_at"   "YYYYMMDDhhmmss"（日本時間）
    def authorize_and_capture(amount:, currency_code:, card_token:, merchant_order_ref:)
      # …（省略。接続の失敗と 2xx 以外の応答は ConnectionError にする）
    end
  end
end
`}
          />
          <p>
            A社は金額を通貨の<Term en="minor unit">最小単位</Term>の整数で受け取ります。最小単位はその通貨で扱えるいちばん小さい額のことで、円なら 1 円、米ドルなら 1 セント（0.01 ドル）です。30.00 ドルは A社には <code>3000</code> と渡します。B社は金額を小数の文字列で受け取るので、同じ 30.00 ドルを <code>"30.00"</code> と渡します。拒否の伝え方、決済した日時の形式、障害のときの例外もそれぞれ違います。
          </p>
          <p>
            注文は orders テーブルに保存します。金額は最小単位の整数で <code>total_cents</code> 列に持ち、通貨は <code>currency</code> 列（<code>"JPY"</code>・<code>"USD"</code>）に持ちます。円の注文なら <code>total_cents</code> は円の額です。ほかに状態（<code>pending</code>・<code>paid</code>・<code>payment_failed</code>）、決済サービスが付けた ID、決済した日時、拒否の理由の列があります。
          </p>
          <h3>会社ごとに if で分けたコントローラー</h3>
          <p>B社を足したとき、最初は支払いのアクションの中で、設定の値を見て会社ごとに処理を分けました。</p>
          <Code
            lang="ruby"
            title="app/controllers/payments_controller.rb（パターンを使う前）"
            code={`
class PaymentsController < ApplicationController
  def create
    order = Order.find(params[:order_id])

    if Rails.configuration.x.payments.provider == "pay_a"
      client = PayA::Client.new(api_key: Rails.application.credentials.dig(:pay_a, :api_key))
      charge = client.create_charge(amount: order.total_cents, currency: order.currency.downcase,
                                    source: params[:card_token], metadata: { order_id: order.id })
      if charge.status == "succeeded"
        order.update!(status: "paid", charge_id: charge.id, paid_at: Time.at(charge.created))
      else
        order.update!(status: "payment_failed", decline_reason: charge.failure_code)
      end
    else
      client = PayB::GatewayClient.new(merchant_id: Rails.application.credentials.dig(:pay_b, :merchant_id))
      res = client.authorize_and_capture(amount: order.total_cents.to_s,
                                         currency_code: order.currency == "USD" ? 840 : 392,
                                         card_token: params[:card_token], merchant_order_ref: order.id.to_s)
      if res["result_code"] == "0000"
        order.update!(status: "paid", charge_id: res["transaction_id"],
                      paid_at: Time.strptime(res["processed_at"], "%Y%m%d%H%M%S"))
      else
        order.update!(status: "payment_failed",
                      decline_reason: res["result_code"] == "1001" ? "insufficient_funds" : "card_declined")
      end
    end

    if order.paid?
      render json: { status: order.status }
    else
      render json: { error: order.decline_message }, status: :unprocessable_content
    end
  rescue PayA::Error => e
    raise unless %w[api_error rate_limit_error].include?(e.type)

    render json: { error: "決済サービスが混み合っています。時間をおいてお試しください" }, status: :service_unavailable
  end
end
`}
          />
          <p>
            <code>order.decline_message</code> は、拒否の理由（<code>"insufficient_funds"</code> など）を利用者に見せる文に変える Order のメソッドです。このコードを、決済サービスの応答を決めて動かしました。テストで HTTP の通信を止めて決まった応答を返す WebMock を <code>bin/rails runner</code> のスクリプトから使い、5つの場面で <code>POST /orders/:id/payment</code> を送っています。「送った本文」は SDK が決済サービスに送った JSON です。
          </p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4。コンテナのタイムゾーンは UTC）"
            code={`
== A社・円 3,000円
  応答: 200 {"status":"paid"}
  送った本文: {"amount":3000,"currency":"jpy","source":"tok_visa","metadata":{"order_id":1}}
  注文: status=paid paid_at=2026-11-13 10:00:00 +0900
== B社・円 3,000円
  応答: 200 {"status":"paid"}
  送った本文: {"amount":"3000","currency_code":392,"card_token":"tok_visa","merchant_order_ref":"2"}
  注文: status=paid paid_at=2026-11-13 19:00:00 +0900
== B社・米ドル 30.00ドル（total_cents=3000）
  応答: 200 {"status":"paid"}
  送った本文: {"amount":"3000","currency_code":840,"card_token":"tok_visa","merchant_order_ref":"3"}
  注文: status=paid paid_at=2026-11-13 19:00:00 +0900
== B社・接続がタイムアウト
  例外: PayB::ConnectionError: execution expired（rescue されていない）
== B社・システム停止中（9001）
  応答: 422 {"error":"このカードは使えません"}
  送った本文: {"amount":"3000","currency_code":392,"card_token":"tok_visa","merchant_order_ref":"5"}
  注文: status=payment_failed paid_at=
`}
          />
          <p>A社の円の注文は正しく処理されました。B社の分岐では、次の4つの誤りが起きています。</p>
          <ul>
            <li>
              金額の単位の取り違え：30.00 ドルの注文で、B社に <code>"3000"</code> を送りました。B社は小数の文字列で受け取るので、3,000 ドルの請求になります。円は最小単位が 1 円なので、<code>total_cents</code> をそのまま文字列にしても額が合います。円の注文だけで動作を確かめていると、この誤りに気づきません。
            </li>
            <li>
              例外の扱い漏れ：<code>rescue</code> は A社の <code>PayA::Error</code> しか受け取らないので、B社の <code>PayB::ConnectionError</code> はアクションの外へ出ます。本番では例外を処理するミドルウェアが 500 の応答に変えます（<ChapterLink n={10} section="exceptions" />）。利用者には「時間をおいてお試しください」という案内が出ません。
            </li>
            <li>
              障害を拒否として扱う：B社の <code>"9001"</code> はシステム停止中という意味で、カードには問題がありません。それでも <code>"0000"</code> 以外をすべて拒否として扱ったので、注文は <code>payment_failed</code> になり、利用者には「このカードは使えません」と表示されました。別のカードを試しても結果は同じです。
            </li>
            <li>
              時刻の取り違え：B社の <code>processed_at</code> は日本時間の 10:00 です。<code>Time.strptime</code> は時差の書かれていない文字列をサーバーのタイムゾーン（この検証では UTC）で解釈するので、UTC の 10:00、つまり日本時間の 19:00 として保存されました。
            </li>
          </ul>
          <h3>このコードの問題点</h3>
          <p>個々の誤りを直しても、次の問題は残ります。</p>
          <ul>
            <li>A社とB社の引数名（<code>source</code>・<code>metadata</code>・<code>merchant_order_ref</code>）、金額の単位、通貨の書き方を、コントローラーが知っています。</li>
            <li>各社の <code>status</code>・<code>failure_code</code>・<code>result_code</code> の値で分岐しています。決済サービスが値を追加すると、コントローラーを直すことになります。</li>
            <li>UNIX 時刻の秒や日本時間の文字列を変換するコードが、コントローラーの中にあります。</li>
            <li>例外の扱いが会社ごとに違い、どの例外が再試行してよい障害かを、分岐ごとに書く必要があります。B社の分は書き忘れていました。</li>
            <li>返金や決済の照合でも同じ分岐が必要になります。C社を足すと、分岐のあるすべての場所を直します。注文の処理をテストするにも、会社ごとに HTTP の応答を用意する必要があります。</li>
          </ul>
          <p>次の節では、注文の処理が使う「決済の取り決め」をアプリの側で決め、各社の違いを Adapter のクラスの中だけで扱う方法を説明します。</p>
        </>
      ),
    },
    {
      id: 'idea',
      title: 'アプリが決めた取り決めに、各社の SDK を合わせる',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term en="Adapter">Adapter</Term> は、あるインターフェースを、使う側が期待する別のインターフェースに変換する部品です。GoF（『Design Patterns』の4人の著者）は目的を「クラスのインターフェースを、クライアントが期待する別のインターフェースに変換する。Adapter によって、インターフェースに互換性がないために一緒に動かせなかったクラスを、一緒に動かせるようになる」と書いています<Ref n={1} />。別名は Wrapper です。
          </p>
          <p>
            この章では、呼ぶ側と呼ばれる側の間で決めた、メソッドの名前・引数・戻り値・例外の約束を<Term en="interface">取り決め</Term>（インターフェース）と呼びます。たとえば「<code>charge</code> に注文の番号・金額・通貨・カードのトークンを渡すと、成功か拒否の結果が返り、障害のときは決まった例外が出る」という約束が、決済の取り決めです。Ruby には Java や TypeScript の interface のような宣言が無いので、取り決めはコメントと、結果を表すクラスと、テストで表します。
          </p>
          <p>
            MSDP のカタログで Adapter を使う主な目的は、外部のシステムやライブラリの仕様をアプリの内部に持ち込まないことです。決済サービスの SDK は金額の単位、状態の名前、エラーの返し方をサービスごとに決めています。これらを注文の処理が直接扱うと、決済サービスの仕様が注文の処理の一部になります。Adapter を置くと、注文の処理は「アプリが決めた決済の取り決め」だけを使い、外部の仕様に合わせる処理は Adapter のクラスにまとまります。決済サービスを切り替えるときや SDK の仕様が変わったときに直すのは、Adapter だけです。
          </p>
          <h3>使う場面</h3>
          <p>Adapter が必要になるのは、アプリが自分では変更できないインターフェースを使う場合です。</p>
          <ul>
            <li>外部の API の応答を、アプリのデータに変換する</li>
            <li>決済、SMS の送信、ファイルの保存などのサービスを、提供元を替えられるようにする</li>
            <li>全文検索エンジン（OpenSearch など）のクライアントのライブラリを、アプリが決めた検索の取り決めを通してだけ使う</li>
            <li>古い社内システムのインターフェースを、新しいシステムから使う</li>
          </ul>
          <p>次のような兆候があれば、Adapter が必要になっている可能性があります。</p>
          <ul>
            <li>外部の応答の項目名（<code>failure_code</code> や <code>result_code</code>）が、モデル・コントローラー・ジョブのあちこちに出てくる</li>
            <li>外部のライブラリの型や例外のクラスが、モデルのメソッドの引数・戻り値・<code>rescue</code> に現れている</li>
            <li>SDK の gem のバージョンを上げると、業務のコードの広い範囲を直す必要がある</li>
            <li>「別の決済サービスに替えるとしたら、どこを直すか」に答えられない</li>
          </ul>
          <h3>設計上の制約</h3>
          <p>Adapter を設計するときは、次のような相反する要求の釣り合いを取ります。</p>
          <ul>
            <li>外部サービスの機能を十分に使いたい。一方で、アプリの取り決めは必要なことだけを含む小さな形に保ちたい。</li>
            <li>単位・時刻・エラーの変換を正確に行いたい。一方で、変換のコードが増えるほど、変換の誤りが入り込む余地も増える。</li>
            <li>外部の変更に強くしたい。一方で、1つのサービスしか使わず、替える予定もないのに取り決めと Adapter を作るのは過剰である。</li>
            <li>外部のエラーを細かく扱いたい（再試行してよいか、利用者に何を伝えるか）。一方で、アプリの中で扱うエラーの種類は少なく保ちたい。</li>
          </ul>
          <h3>解決方法</h3>
          <p>Adapter は次の4つの要素で構成します。括弧の中は GoF の名前です。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">この章の例</th>
                  <th scope="col">受け持つこと</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">使う側（Client）</th>
                  <td>
                    <code>Order#pay!</code>・<code>PaymentsController</code>
                  </td>
                  <td>取り決めだけを使って業務の処理を行う</td>
                </tr>
                <tr>
                  <th scope="row">取り決め（Target）</th>
                  <td>
                    <code>Payments</code> モジュール（<code>charge</code>、結果の <code>Succeeded</code>・<code>Declined</code>、例外の <code>Unavailable</code>）
                  </td>
                  <td>使う側が決済に求めることを、アプリの言葉で決める</td>
                </tr>
                <tr>
                  <th scope="row">Adapter</th>
                  <td>
                    <code>Payments::PayAAdapter</code>・<code>Payments::PayBAdapter</code>
                  </td>
                  <td>取り決めを実装し、外部のインターフェースとの間で変換する</td>
                </tr>
                <tr>
                  <th scope="row">外部（Adaptee）</th>
                  <td>
                    <code>PayA::Client</code>・<code>PayB::GatewayClient</code>
                  </td>
                  <td>外部の SDK。アプリからは変更しない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            最も重要なのは、取り決めをアプリの側に置き、アプリの言葉で書くことです。A社の SDK の形をそのまま取り決めにすると、B社を足すときに取り決めごと変えることになります。取り決めには、注文の処理が決済に求めること（注文の番号・金額・通貨・カードのトークンを渡し、成功なら決済の ID と日時、拒否なら理由を受け取る）だけを書きます。
          </p>
          <Figure n="95-1" title="2社の SDK とアプリの取り決めの対応" caption="30.00 米ドルの注文を例にした。A社とB社は本書の架空のサービスで、名前は vendor/sdks の SDK のもの。">
            <MappingFigure />
          </Figure>
          <p>
            図 95-1 は、同じ意味の項目が、2社の SDK とアプリの取り決めでそれぞれどう表されるかを並べたものです。Adapter は、左の2列の形式と右端の列の形式の間で変換します。変換するものは次の4種類です。
          </p>
          <ul>
            <li>
              データの形と単位：項目名、型（数値か文字列か）、単位。実在の決済サービスの Stripe も金額を通貨の最小単位で受け取り、円のように小数の無い通貨は 500 円を <code>500</code> と渡します<Ref n={2} />。米ドルならセント単位になるので、同じ <code>amount_cents</code> でも、小数で受け取るサービスに渡すときは通貨によって変換が変わります。
            </li>
            <li>状態や理由を表す値：外部が決めた値（<code>"succeeded"</code>、<code>"1001"</code>）を、アプリが決めた値（<code>Succeeded</code>、<code>:insufficient_funds</code>）に変換します。</li>
            <li>時刻：UNIX 時刻（UTC の 1970年1月1日0時からの秒数）や、タイムゾーンの情報を含まない文字列（B社の <code>"20261113100000"</code> は日本時間）を、時刻のオブジェクトに変換します。</li>
            <li>
              エラー：外部の例外やエラーのコードを、アプリのエラーに変換します。この章では、カードの拒否は業務の上で起こり得る結果なので戻り値（<code>Declined</code>）で返し、決済サービスの一時的な障害は例外（<code>Payments::Unavailable</code>）にします。引数の誤りのようなプログラムの誤りは変換しません。外部のサービスもエラーを種類で分けており、たとえば Stripe のエラーの種類は api_error・card_error・idempotency_error・invalid_request_error の4つです<Ref n={3} />。
            </li>
          </ul>
          <p>
            GoF は Adapter の作り方として、外部のクラスを継承する方法（クラスアダプター）と、外部のオブジェクトを持って呼び出す方法（オブジェクトアダプター）の2つを挙げています<Ref n={1} />。この章では、SDK のクライアントのオブジェクトを <code>initialize</code> で受け取って呼び出すオブジェクトアダプターを使います。SDK のクラスの内部が変わっても影響を受けにくく、テストでクライアントを代役に替えられるからです（引数で受け取る設計は <ChapterLink n={40} section="idea" />）。
          </p>
          <h3>構造</h3>
          <Figure n="95-2" title="Adapter の構造" caption="この章の Rails のアプリのクラスで描いた。破線の枠はディレクトリの区分、破線の矢印は「取り決めを満たす」関係を表す。">
            <StructureFigure />
          </Figure>
          <p>
            図 95-2 は Adapter を入れた後のクラスの関係です。上の枠がアプリのコードで、<code>Order#pay!</code> は <code>Payments</code> の取り決めだけを使います。2つの Adapter は取り決めを満たし、それぞれ下の枠の SDK を呼びます。アプリと外部の間の矢印はすべてアプリの側から外部に向かっていて、外部から向かう矢印はありません。SDK はアプリの取り決めを知らず、取り決めを変えても SDK に影響しません。左の <code>Payments.gateway</code> は設定を読んで、どちらか一方の Adapter を作ります。
          </p>
          <Figure n="95-3" title="B社で残高不足になったときのシーケンス" caption="縦に時間、列にオブジェクトを並べた。色の付いた箱は Adapter の中で行う変換。">
            <SequenceFigure />
          </Figure>
          <p>
            図 95-3 は、30.00 ドルの注文で B社が残高不足を返したときの流れです。PayBAdapter は SDK を呼ぶ前に金額と通貨を B社の形（<code>"30.00"</code> と <code>840</code>）に変え、SDK から戻った <code>"1001"</code> を <code>:insufficient_funds</code> に変えます。<code>Order#pay!</code> は B社のコードの意味を知らずに、拒否の理由を保存できます。
          </p>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails で Adapter を書き、設定で選ぶ',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  adapters/
    payments.rb                  # 取り決め（Succeeded・Declined・Unavailable）と Payments.gateway
    payments/pay_a_adapter.rb    # Payments::PayAAdapter
    payments/pay_b_adapter.rb    # Payments::PayBAdapter
  models/order.rb                # Order#pay!（使う側）
  controllers/payments_controller.rb
config/application.rb            # config.x.payments.provider
vendor/sdks/pay_a.rb・pay_b.rb   # 架空の SDK（本物は gem として入れる）
spec/
  support/payment_gateway_contract.rb   # 取り決めの共通のテスト（shared_examples）
  adapters/payments/pay_a_adapter_spec.rb・pay_b_adapter_spec.rb
  models/order_spec.rb
  requests/payments_spec.rb
`}
          />
          <p>
            Adapter のクラスは <code>app/adapters</code> に置きました。Rails は、起動したときに存在する <code>app</code> の下のディレクトリ（assets・javascript・views を除く）を、すべてオートロードの対象にします<Ref n={4} />。オートロードは、クラスの名前とファイルの場所の対応から、使われたときにファイルを読み込む仕組みです。<code>app/adapters</code> はそれ自身が名前空間の起点になるので、<code>app/adapters/payments/pay_a_adapter.rb</code> には <code>Adapters::Payments::PayAAdapter</code> ではなく <code>Payments::PayAAdapter</code> を書きます。新しく作ったディレクトリは、サーバーを再起動するまで読み込まれません（<ChapterLink n={33} section="extra-classes" />）。
          </p>
          <p>ほかの置き場所と比べた理由は次のとおりです。</p>
          <ul>
            <li>
              <code>app/services</code> には、ユースケースの手順（注文を確定する、会員を登録する）を置くことが多いです（<ChapterLink n={44} section="idea" />）。外部の仕様を変換するクラスを別のディレクトリに分けると、外部のサービスに依存するクラスの一覧を、ディレクトリを見るだけで確かめられます。
            </li>
            <li>
              <code>app/clients</code> は外部の HTTP の API を直接呼ぶクラス（自分で書いた API のクライアント）の置き場所として使われることがあります。この章では HTTP を扱うのは SDK で、アプリのクラスは変換だけを受け持つので、役割の名前の adapters にしました。自分で HTTP のクライアントを書くアプリでは、クライアントと Adapter のどちらをどこに置くかを1つの規則に決めておきます。
            </li>
            <li>
              <code>lib</code> は既定ではオートロードの対象ではなく<Ref n={4} />、アプリの他の部分に依存しないコードの置き場所として使われます。Adapter はアプリの取り決め（<code>Payments::Succeeded</code> など）に依存するので、<code>app</code> に置きます。
            </li>
          </ul>
          <h3>取り決めを書く</h3>
          <Code
            lang="ruby"
            title="app/adapters/payments.rb"
            code={`
# 決済の取り決め。名前と型は、決済サービスではなくこのアプリの言葉で決める
#   charge(order_id:, amount_cents:, currency:, card_token:) に応答する
#     amount_cents … 通貨の最小単位の整数（円なら円、米ドルならセント）
#     currency     … "JPY"・"USD"
#   成功なら Succeeded、カードの拒否なら Declined を返す
#   一時的に使えないときは Payments::Unavailable を発生させる
module Payments
  Succeeded = Data.define(:charge_id, :charged_at)
  Declined = Data.define(:reason) # :insufficient_funds・:expired_card・:card_declined

  class Unavailable < StandardError; end

  # どの決済サービスを使うかを設定から決める
  def self.gateway(provider = Rails.configuration.x.payments.provider)
    credentials = Rails.application.credentials
    case provider
    when "pay_a" then PayAAdapter.new(PayA::Client.new(api_key: credentials.dig(:pay_a, :api_key)))
    when "pay_b" then PayBAdapter.new(PayB::GatewayClient.new(merchant_id: credentials.dig(:pay_b, :merchant_id)))
    else raise ArgumentError, "未対応の決済サービス: #{provider.inspect}"
    end
  end
end
`}
          />
          <p>
            取り決めは、コメントに書いたメソッドの約束と、結果を表す2つのクラスと、1つの例外のクラスです。<code>Data.define</code> は、指定した属性を持ち、作った後に属性を変えられないクラスを作ります。属性の値が同じなら <code>==</code> で等しくなるので、テストで <code>eq(Payments::Declined.new(reason: :insufficient_funds))</code> と比べられます（Data の性質は <ChapterLink n={33} section="value-objects" />）。
          </p>
          <p>
            拒否を戻り値にしたのは、カードの残高不足や有効期限切れは、決済サービスが正常に動いた結果として起こる業務の結果だからです。使う側は拒否の理由を保存し、利用者に別のカードを求めます。一方、障害のときは処理を先へ進められないので、例外の <code>Unavailable</code> にします。使う側は再試行するか、利用者に時間をおくよう案内します。取り決めの外にある失敗（引数の誤りなど）は、変換せずに元の例外のまま発生させ、バグとして直します。
          </p>
          <h3>A社の Adapter</h3>
          <Code
            lang="ruby"
            title="app/adapters/payments/pay_a_adapter.rb"
            code={`
module Payments
  # A社の SDK を、決済の取り決めに合わせる
  class PayAAdapter
    DECLINE_REASONS = { "insufficient_funds" => :insufficient_funds, "expired_card" => :expired_card }.freeze
    TEMPORARY_ERRORS = %w[api_connection_error api_error rate_limit_error].freeze

    def initialize(client)
      @client = client
    end

    def charge(order_id:, amount_cents:, currency:, card_token:)
      # A社も金額は最小単位の整数なので、そのまま渡す。通貨は小文字にする
      charge = @client.create_charge(amount: amount_cents, currency: currency.downcase,
                                     source: card_token, metadata: { order_id: })
      if charge.status == "succeeded"
        Succeeded.new(charge_id: charge.id, charged_at: Time.zone.at(charge.created))
      else
        Declined.new(reason: DECLINE_REASONS.fetch(charge.failure_code, :card_declined))
      end
    rescue PayA::Error => e
      # 一時的な障害だけを取り決めの例外に置き換える。引数の誤りなどはそのまま発生させる
      raise Unavailable, "A社決済が一時的に使えません（#{e.type}）" if TEMPORARY_ERRORS.include?(e.type)

      raise
    end
  end
end
`}
          />
          <p>
            A社の <code>failure_code</code> の値はアプリの理由と同じ文字列ですが、<code>DECLINE_REASONS</code> の対応表を通しています。A社が新しい値（たとえば不正利用の疑い）を加えたとき、表に無い値は <code>:card_declined</code> になり、取り決めに無い値が使う側に届きません。<code>Time.zone.at</code> は UNIX 時刻の秒を、アプリのタイムゾーン（この章では Tokyo）の時刻にします。
          </p>
          <p>
            一時的な障害を表す種類は定数 <code>TEMPORARY_ERRORS</code> にまとめ、<code>type</code> がこれに含まれる例外だけを <code>Unavailable</code> に置き換えます。<code>rescue</code> の中で別の例外を <code>raise</code> すると、Ruby は元の例外を新しい例外の <code>cause</code> に入れます<Ref n={5} />。障害を調べるときに、A社が返した元のエラーを確かめられます。
          </p>
          <h3>B社の Adapter</h3>
          <Code
            lang="ruby"
            title="app/adapters/payments/pay_b_adapter.rb"
            code={`
module Payments
  # B社の SDK を、決済の取り決めに合わせる
  class PayBAdapter
    CURRENCIES = { "JPY" => { code: 392, digits: 0 }, "USD" => { code: 840, digits: 2 } }.freeze
    DECLINE_REASONS = { "1001" => :insufficient_funds, "1002" => :expired_card, "1099" => :card_declined }.freeze
    PROCESSED_AT_ZONE = "Asia/Tokyo" # B社の processed_at は日本時間

    def initialize(client)
      @client = client
    end

    def charge(order_id:, amount_cents:, currency:, card_token:)
      res = @client.authorize_and_capture(
        amount: decimal_amount(amount_cents, currency), currency_code: CURRENCIES.fetch(currency)[:code],
        card_token:, merchant_order_ref: order_id.to_s
      )
      case res["result_code"]
      when "0000"
        Succeeded.new(charge_id: res["transaction_id"],
                      charged_at: Time.find_zone!(PROCESSED_AT_ZONE).strptime(res["processed_at"], "%Y%m%d%H%M%S"))
      when "9001" then raise Unavailable, "B社決済がシステム停止中です"
      else Declined.new(reason: DECLINE_REASONS.fetch(res["result_code"], :card_declined))
      end
    rescue PayB::ConnectionError
      raise Unavailable, "B社決済に接続できません" # 元の例外は cause に残る
    end

    private

    # 最小単位の整数を、B社が受け取る小数の文字列にする（USD の 3000 → "30.00"、JPY の 3000 → "3000"）
    def decimal_amount(amount_cents, currency)
      digits = CURRENCIES.fetch(currency)[:digits]
      return amount_cents.to_s if digits.zero?

      units, minor = amount_cents.divmod(10**digits)
      "#{units}.#{minor.to_s.rjust(digits, '0')}"
    end
  end
end
`}
          />
          <p>
            <code>CURRENCIES</code> は通貨ごとに B社の数字コードと小数点以下の桁数を持つ表です。<code>decimal_amount</code> は最小単位の整数を整数の割り算（<code>divmod</code>）で整数部と小数部に分けて文字列にし、浮動小数点数を使わないので丸めの誤差が出ません。表に無い通貨を渡すと <code>fetch</code> が KeyError を発生させます。B社が扱えない通貨で請求しようとしたことは、プログラムの誤りとして扱います。
          </p>
          <p>
            <code>"9001"</code>（システム停止中）は拒否ではなく、一時的な障害として <code>Unavailable</code> にします。日時は <code>Time.find_zone!("Asia/Tokyo").strptime</code> で読みます。ActiveSupport::TimeZone の <code>strptime</code> は、時差の書かれていない文字列をそのタイムゾーンの時刻として解釈します<Ref n={6} />。サーバーのタイムゾーンの設定に左右されません。
          </p>
          <p>接続がタイムアウトしたときに Adapter が発生させる例外と、その <code>cause</code> を表示しました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner。WebMock で B社への接続をタイムアウトさせた）"
            code={`
Payments::Unavailable: B社決済に接続できません
  cause: PayB::ConnectionError: execution expired
  cause の cause: Net::OpenTimeout
`}
          />
          <p>
            SDK が <code>Net::OpenTimeout</code> を <code>PayB::ConnectionError</code> に置き換え、Adapter がそれを <code>Payments::Unavailable</code> に置き換えています。どちらの置き換えでも元の例外は <code>cause</code> に残っているので、障害を調べるときは cause をたどって SDK の例外まで確かめられます。
          </p>
          <h3>使う側：Order#pay! とコントローラー</h3>
          <Code
            lang="ruby"
            title="app/models/order.rb"
            code={`
class Order < ApplicationRecord
  DECLINE_MESSAGES = {
    "insufficient_funds" => "残高が不足しています",
    "expired_card" => "カードの有効期限が切れています",
    "card_declined" => "このカードは使えません"
  }.freeze

  def paid? = status == "paid"

  def decline_message = DECLINE_MESSAGES.fetch(decline_reason)

  # 決済の取り決めだけを使う。どの決済サービスかは知らない。
  # 外部への通信はトランザクションの外で行い、結果だけを保存する
  def pay!(card_token:, gateway: Payments.gateway)
    case gateway.charge(order_id: id, amount_cents: total_cents, currency:, card_token:)
    in Payments::Succeeded[charge_id:, charged_at:]
      update!(status: "paid", charge_id:, paid_at: charged_at)
    in Payments::Declined[reason:]
      update!(status: "payment_failed", decline_reason: reason)
    end
  end
end
`}
          />
          <p>
            <code>pay!</code> は取り決めの <code>charge</code> を呼び、結果の種類を <code>case/in</code> で分けます。<code>in Payments::Succeeded[charge_id:, charged_at:]</code> は、結果が Succeeded のときに、その属性を同じ名前の変数に取り出す書き方です。どちらにも当てはまらない値（たとえば A社の <code>PayA::Charge</code>）が返ると <code>NoMatchingPatternError</code> になるので、取り決めに無い値が使う側でエラーにならずに通ることはありません。拒否の理由を利用者向けの文にする対応表（<code>DECLINE_MESSAGES</code>）も、決済サービスごとではなく、アプリが決めた理由の値に対して1つ書けば済みます。
          </p>
          <p>
            <code>gateway:</code> の既定値で <code>Payments.gateway</code> を呼ぶので、本番のコードは引数を渡さずに使い、テストでは取り決めを満たす代役を渡します（依存先を引数で受け取る設計は <ChapterLink n={40} section="idea" />）。<code>charge</code> は DB のトランザクションの外で呼び、結果を保存する <code>update!</code> だけが短いトランザクションになります。外部への通信の間に DB のロックを持たない理由は <ChapterLink n={34} section="external-boundaries" /> で扱いました。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/payments_controller.rb"
            code={`
class PaymentsController < ApplicationController
  def create
    order = Order.find(params[:order_id])
    order.pay!(card_token: params.require(:card_token))

    if order.paid?
      render json: { status: order.status }
    else
      render json: { error: order.decline_message }, status: :unprocessable_content
    end
  rescue Payments::Unavailable
    render json: { error: "決済サービスに接続できませんでした。時間をおいてお試しください" },
           status: :service_unavailable
  end
end
`}
          />
          <p>
            コントローラーは結果を HTTP の応答に変えるだけになり、会社の名前は出てきません。拒否なら 422 と拒否の理由の文を、<code>Unavailable</code> なら 503 を返します。どの会社のどの例外でも、障害は <code>Unavailable</code> の1つの <code>rescue</code> で受け取れます。
          </p>
          <Callout kind="warn">
            <p>
              この章の <code>Unavailable</code> には、決済サービスに届く前の失敗（接続できなかった）と、届いた後に応答が失われた失敗（結果が分からない）の両方が入ります。後者では、決済サービスの側で請求が済んでいることがあります。WebMock の <code>to_timeout</code> は Net::HTTP に <code>Net::OpenTimeout</code>（接続の段階のタイムアウト）を発生させるので、この章のテストが再現しているのは前者です。結果が分からないまま利用者に再送させると、二重に請求されることがあります。本番の決済では、取り決めに冪等性キー（同じ操作の再送であることを決済サービスに伝える値）を加え、再試行でも同じキーを送ります。冪等性キーと結果の照合は <ChapterLink n={33} section="adapters" />・<ChapterLink n={34} section="external-boundaries" />・<ChapterLink n={52} section="idea" /> で扱います。
            </p>
          </Callout>
          <h3>設定で使う Adapter を選ぶ</h3>
          <Code
            lang="ruby"
            title="config/application.rb（抜粋）"
            code={`
Bundler.require(*Rails.groups)

# 架空の決済 SDK。本物の SDK は Gemfile に書いた gem として Bundler.require で読み込まれる
require_relative "../vendor/sdks/pay_a"
require_relative "../vendor/sdks/pay_b"

module Ch42
  class Application < Rails::Application
    # …（省略）
    # どの決済サービスを使うか（"pay_a" か "pay_b"）
    config.x.payments.provider = ENV.fetch("PAYMENT_PROVIDER", "pay_a")
  end
end
`}
          />
          <p>
            <code>config.x</code> は、アプリが独自の設定を入れ子の名前で置くための場所で、<code>Rails.configuration.x.payments.provider</code> で読めます。設定していない名前を読むと nil が返ります<Ref n={7} />。どちらの会社を使うかは環境変数 <code>PAYMENT_PROVIDER</code> で決め、API のキーや加盟店の ID のような秘密の値は credentials（<code>config/credentials.yml.enc</code> に暗号化して保存する値）から読みます。credentials の値は <code>Rails.application.credentials</code> で読め、値の名前の後に <code>!</code> を付けると、値が空のときに KeyError になります<Ref n={8} />。
          </p>
          <p>
            <code>Payments.gateway</code> は、呼ばれるたびに設定を読んで Adapter を作ります。アプリの起動中に <code>config/initializers</code> の中から <code>app</code> のクラスをオートロードすることはできないので<Ref n={4} />、Adapter を作るのはリクエストを処理するときです。SDK のクライアントを作る処理は軽いので、作り置きはしていません。
          </p>
          <p>
            設定を B社に切り替えても、変わるのはこれからの請求だけです。A社で請求した注文を返金するときは A社を呼ぶ必要があるので、返金や照合の機能を持つアプリでは、どの会社で請求したかを注文に保存し（たとえば <code>payment_provider</code> 列）、その値で Adapter を選びます。この章の orders テーブルは請求だけを扱うので、この列を持っていません。
          </p>
          <h3>パターンを使っていないコードから直す順序</h3>
          <ol className="steps">
            <li>今の動作をテストで固定する：WebMock で A社の応答を決め、成功・残高不足・障害の3つの場面で、コントローラーの応答と注文の状態を確かめる request spec を書きます。</li>
            <li>取り決めを決める：<code>Order</code> が決済に求めることだけを、<code>app/adapters/payments.rb</code> のコメントと Data（<code>Succeeded</code>・<code>Declined</code>）と例外（<code>Unavailable</code>）に書きます。A社の項目名を使いません。</li>
            <li>A社の Adapter を作る：コントローラーの A社の分岐（SDK の呼び出しと変換）を、そのまま <code>PayAAdapter</code> に移し、手順1のテストが通ることを確かめます。</li>
            <li>使う側から A社を消す：<code>Order#pay!</code> を作って取り決めだけを使うようにし、コントローラーから <code>PayA</code> の名前と <code>rescue PayA::Error</code> を消します。</li>
            <li>B社の Adapter を足す：<code>PayBAdapter</code> を書き、A社と同じ共通のテスト（shared_examples）を B社にも当てて通します。金額の単位・9001・日時の誤りは、ここで見つかります（次の節）。</li>
            <li>設定で選ぶ：<code>Payments.gateway</code> で、設定の値からどちらの Adapter を使うかを決めます。コントローラーの <code>if</code> を消します。</li>
          </ol>
          <p>前の節と同じ5つの場面を、直した後のコードで実行しました。</p>
          <Code
            lang="text"
            title="実行結果（直した後。注文の ID を前の実行と同じにそろえた）"
            code={`
== A社・円 3,000円
  応答: 200 {"status":"paid"}
  送った本文: {"amount":3000,"currency":"jpy","source":"tok_visa","metadata":{"order_id":1}}
  注文: status=paid paid_at=2026-11-13 10:00:00 +0900
== B社・円 3,000円
  応答: 200 {"status":"paid"}
  送った本文: {"amount":"3000","currency_code":392,"card_token":"tok_visa","merchant_order_ref":"2"}
  注文: status=paid paid_at=2026-11-13 10:00:00 +0900
== B社・米ドル 30.00ドル（total_cents=3000）
  応答: 200 {"status":"paid"}
  送った本文: {"amount":"30.00","currency_code":840,"card_token":"tok_visa","merchant_order_ref":"3"}
  注文: status=paid paid_at=2026-11-13 10:00:00 +0900
== B社・接続がタイムアウト
  応答: 503 {"error":"決済サービスに接続できませんでした。時間をおいてお試しください"}
  送った本文: {"amount":"3000","currency_code":392,"card_token":"tok_visa","merchant_order_ref":"4"}
  注文: status=pending paid_at=
== B社・システム停止中（9001）
  応答: 503 {"error":"決済サービスに接続できませんでした。時間をおいてお試しください"}
  送った本文: {"amount":"3000","currency_code":392,"card_token":"tok_visa","merchant_order_ref":"5"}
  注文: status=pending paid_at=
`}
          />
          <p>
            米ドルの注文は <code>"30.00"</code> で送られ、B社の日時は日本時間の 10:00 で保存されました。タイムアウトとシステム停止中は 503 になり、注文は <code>pending</code> のまま残っています。利用者は時間をおいて同じカードで支払いをやり直せます。
          </p>
        </>
      ),
    },
    {
      id: 'test',
      title: '2つの Adapter に同じテストを当てる',
      body: (
        <>
          <p>テストは3つの層に分けます。</p>
          <ul>
            <li>Adapter のテスト：SDK を含めて、各社の応答を取り決めの結果に正しく変換するか。WebMock で決済サービスの HTTP の応答を決めます。</li>
            <li>使う側のテスト：<code>Order#pay!</code> が取り決めの結果を受けて正しく保存するか。取り決めを満たす代役を渡し、SDK も HTTP も使いません。</li>
            <li>request spec：設定・Adapter・コントローラーをつないだときの HTTP の応答。</li>
          </ul>
          <h3>WebMock で決済サービスの応答を決める</h3>
          <Code
            lang="ruby"
            title="spec/rails_helper.rb（抜粋）"
            code={`
require 'rspec/rails'
require 'webmock/rspec' # 外部への HTTP の通信を止め、stub_request で応答を決める
# …（省略）
Rails.root.glob('spec/support/**/*.rb').sort_by(&:to_s).each { |f| require f }
`}
          />
          <p>
            <Term en="WebMock">WebMock</Term> は、テストの中で HTTP のリクエストを途中で受け取り、決めておいた応答を返す gem です。<code>require 'webmock/rspec'</code> で RSpec に組み込むと、<code>stub_request</code> で決めていない外部への通信はエラーになり、決めた応答は例ごとに消えます。Net::HTTP と、Net::HTTP を使うライブラリに対応しています<Ref n={9} />。この章の SDK は Net::HTTP で通信するので、SDK の中の通信も WebMock が受け取ります。外部への通信をテストで止める考え方は <ChapterLink n={20} section="test-fixture-boundaries" /> で扱いました。最後の行は <code>spec/support</code> に置いた共通のテストを読み込むためのものです。
          </p>
          <h3>取り決めのテストを shared_examples に書く</h3>
          <Code
            lang="ruby"
            title="spec/support/payment_gateway_contract.rb"
            code={`
# 決済の取り決めを満たすことを確かめる共通のテスト。
# 使う側の spec で client（SDK のクライアント）と、場面ごとに決済サービスの応答を決める stub_provider(場面) を定義する
RSpec.shared_examples "決済の取り決めを満たす" do
  subject(:gateway) { described_class.new(client) }

  let(:request) { { order_id: 1, amount_cents: 3000, currency: "JPY", card_token: "tok_visa" } }

  it "成功したら決済 ID と日時を返す" do
    stub_provider(:success)
    result = gateway.charge(**request)
    expect(result).to be_a(Payments::Succeeded)
    expect(result.charged_at).to eq(Time.zone.parse("2026-11-13 10:00"))
  end

  it "残高不足は Declined として返す（例外にしない）" do
    stub_provider(:insufficient_funds)
    expect(gateway.charge(**request)).to eq(Payments::Declined.new(reason: :insufficient_funds))
  end

  it "有効期限切れは Declined として返す" do
    stub_provider(:expired_card)
    expect(gateway.charge(**request)).to eq(Payments::Declined.new(reason: :expired_card))
  end

  it "接続のタイムアウトは Payments::Unavailable にし、元の例外を cause に残す" do
    stub_provider(:timeout)
    expect { gateway.charge(**request) }.to raise_error(Payments::Unavailable) { |e| expect(e.cause).to be_present }
  end

  it "決済サービス側の一時的な障害は Payments::Unavailable にする" do
    stub_provider(:outage)
    expect { gateway.charge(**request) }.to raise_error(Payments::Unavailable)
  end
end
`}
          />
          <p>
            <Term en="shared examples">shared_examples</Term> は、複数の describe で使う例（<code>it</code>）のまとまりを名前を付けて登録する RSpec の機能です。登録しただけでは実行されず、<code>it_behaves_like "名前"</code> を書いた describe の中に、入れ子のグループとして組み込まれて実行されます<Ref n={10} />。<code>described_class</code> は組み込んだ側の describe に渡したクラス（PayAAdapter か PayBAdapter）を指し、<code>client</code> と <code>stub_provider</code> は組み込んだ側で定義します。
          </p>
          <p>
            Ruby では取り決めを型で宣言しないので、この共通のテストが、取り決めを実行できる形で書いたものになります。逆に言えば、テストに書いていない振る舞いは、取り決めとして確かめられていません。たとえばこのテストは B社の <code>"1099"</code> や、表に無い拒否のコードの変換を確かめていないので、その変換を誤っても見つけられません。取り決めに含める場面は、共通のテストに漏れなく書きます。
          </p>
          <h3>Adapter ごとの spec</h3>
          <Code
            lang="ruby"
            title="spec/adapters/payments/pay_a_adapter_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Payments::PayAAdapter do
  let(:client) { PayA::Client.new(api_key: "sk_test") }
  let(:endpoint) { "https://api.pay-a.example/v1/charges" }

  def stub_provider(scenario)
    return stub_request(:post, endpoint).to_timeout if scenario == :timeout

    status, body =
      case scenario
      when :success then [200, { id: "ch_1", status: "succeeded", created: 1_794_531_600 }]
      when :insufficient_funds then [200, { id: "ch_2", status: "failed", failure_code: "insufficient_funds" }]
      when :expired_card then [200, { id: "ch_3", status: "failed", failure_code: "expired_card" }]
      when :outage then [500, { error: { type: "api_error", message: "internal error" } }]
      end
    stub_request(:post, endpoint).to_return(status:, body: body.to_json)
  end

  it_behaves_like "決済の取り決めを満たす"

  it "金額は最小単位の整数のまま、通貨は小文字で送る" do
    stub_provider(:success)
    described_class.new(client).charge(order_id: 7, amount_cents: 3000, currency: "USD", card_token: "tok_visa")
    expect(a_request(:post, endpoint).with(body: hash_including("amount" => 3000, "currency" => "usd"))).to have_been_made
  end

  it "引数の誤り（invalid_request_error）は変換せずにそのまま発生させる" do
    stub_request(:post, endpoint)
      .to_return(status: 400, body: { error: { type: "invalid_request_error", message: "No such token" } }.to_json)
    expect { described_class.new(client).charge(order_id: 7, amount_cents: 3000, currency: "JPY", card_token: "x") }
      .to raise_error(PayA::Error, "No such token")
  end
end
`}
          />
          <p>
            <code>stub_provider</code> は、共通のテストの場面（<code>:success</code> など）を A社の HTTP の応答に置き換えます。<code>to_timeout</code> は接続のタイムアウトを起こします。共通のテストの外には、A社だけの変換の確認を書きます。<code>a_request(...).with(body: hash_including(...))</code> と <code>have_been_made</code> は、その本文を含むリクエストが送られたことを確かめる WebMock のマッチャーです<Ref n={9} />。
          </p>
          <Code
            lang="ruby"
            title="spec/adapters/payments/pay_b_adapter_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Payments::PayBAdapter do
  let(:client) { PayB::GatewayClient.new(merchant_id: "m-001") }
  let(:endpoint) { "https://gateway.pay-b.example/api/authorize-capture" }

  def stub_provider(scenario)
    return stub_request(:post, endpoint).to_timeout if scenario == :timeout

    code = { success: "0000", insufficient_funds: "1001", expired_card: "1002", outage: "9001" }.fetch(scenario)
    body = { "result_code" => code, "transaction_id" => "TX-1", "processed_at" => "20261113100000" }
    stub_request(:post, endpoint).to_return(body: body.to_json)
  end

  it_behaves_like "決済の取り決めを満たす"

  it "米ドルの 3000（セント）を \\"30.00\\" と 840 にして送る" do
    stub_provider(:success)
    described_class.new(client).charge(order_id: 7, amount_cents: 3000, currency: "USD", card_token: "tok_visa")
    expect(a_request(:post, endpoint).with(body: hash_including("amount" => "30.00", "currency_code" => 840)))
      .to have_been_made
  end

  it "SDK の代役（instance_double）で、SDK に渡す引数を確かめる" do
    sdk = instance_double(PayB::GatewayClient,
                          authorize_and_capture: { "result_code" => "0000", "transaction_id" => "TX-1",
                                                   "processed_at" => "20261113100000" })
    described_class.new(sdk).charge(order_id: 7, amount_cents: 3000, currency: "JPY", card_token: "tok_visa")
    expect(sdk).to have_received(:authorize_and_capture)
      .with(amount: "3000", currency_code: 392, card_token: "tok_visa", merchant_order_ref: "7")
  end
end
`}
          />
          <p>
            B社の <code>:outage</code> は <code>"9001"</code> の応答です。A社では HTTP の 500、B社では結果のコードと、障害の表し方は違いますが、共通のテストは同じ「一時的な障害は Unavailable になる」を確かめます。
          </p>
          <p>
            最後の例は WebMock の代わりに SDK の代役で確かめる書き方です。<code>instance_double(PayB::GatewayClient, ...)</code> は、スタブしたメソッドが本物のクラスに存在するかと引数の数を確かめる代役を作ります<Ref n={11} />。HTTP の通信を行わないので、決済サービスの URL や本文の形式を知らなくても書けます。その代わり、SDK が HTTP で何を送るかは確かめません。WebMock のテストは SDK の中の処理も実行するので、SDK のバージョンを上げたときに送る本文が変わったことにも気づけます。この章では2社の取り決めのテストを WebMock で書き、SDK に渡す引数だけを見たい例で代役を使っています。テストダブルの種類は <ChapterLink n={40} section="test-doubles" /> で扱います。
          </p>
          <h3>使う側のテスト</h3>
          <Code
            lang="ruby"
            title="spec/models/order_spec.rb（抜粋）"
            code={`
RSpec.describe Order, "#pay!" do
  let(:order) { Order.create!(total_cents: 3000, currency: "JPY") }

  # 取り決めを満たす代役。charge に応答するオブジェクトなら何でもよい
  def gateway_returning(result) = double("gateway", charge: result)

  # …（省略：成功の結果を保存する例）

  it "拒否の結果を受け取ったら、理由を保存してメッセージを返せるようにする" do
    order.pay!(card_token: "tok", gateway: gateway_returning(Payments::Declined.new(reason: :expired_card)))
    expect(order.reload.decline_message).to eq("カードの有効期限が切れています")
  end

  it "Payments::Unavailable はそのまま伝え、注文は pending のまま残す" do
    gateway = double("gateway")
    allow(gateway).to receive(:charge).and_raise(Payments::Unavailable)
    expect { order.pay!(card_token: "tok", gateway:) }.to raise_error(Payments::Unavailable)
    expect(order.reload.status).to eq("pending")
  end
end
`}
          />
          <p>
            <code>Order#pay!</code> のテストは取り決めの結果（<code>Succeeded</code>・<code>Declined</code>・<code>Unavailable</code>）を返す代役を渡すだけで書けます。A社もB社も、HTTP の応答も出てきません。代役が取り決めに合っていることは、本物の2つの Adapter が共通のテストを通ることで間接的に保たれます。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/payments_spec.rb（抜粋）"
            code={`
RSpec.describe "POST /orders/:order_id/payment", type: :request do
  let(:b_endpoint) { "https://gateway.pay-b.example/api/authorize-capture" }

  around do |example|
    original = Rails.configuration.x.payments.provider
    Rails.configuration.x.payments.provider = "pay_b"
    example.run
  ensure
    Rails.configuration.x.payments.provider = original
  end

  it "B社で米ドルの注文を 30.00 ドルとして請求し、200 を返す" do
    stub_request(:post, b_endpoint).with(body: hash_including("amount" => "30.00", "currency_code" => 840))
      .to_return(body: { result_code: "0000", transaction_id: "TX-9", processed_at: "20261113100000" }.to_json)
    order = Order.create!(total_cents: 3000, currency: "USD")

    post order_payment_path(order), params: { card_token: "tok_visa" }

    expect(response).to have_http_status(:ok)
    expect(order.reload).to have_attributes(status: "paid", paid_at: Time.zone.parse("2026-11-13 10:00"))
  end
  # …（省略：システム停止中とタイムアウトで 503 を返す例）
end
`}
          />
          <p>
            request spec は、<code>config.x.payments.provider</code> を B社に替えて、設定から Adapter を選び、コントローラーが応答を返すまでを通します。<code>around</code> で元の値に戻しているので、ほかの例は A社のまま動きます。
          </p>
          <h3>実行結果</h3>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation。一部を省略）"
            code={`
Payments::PayAAdapter
  金額は最小単位の整数のまま、通貨は小文字で送る
  引数の誤り（invalid_request_error）は変換せずにそのまま発生させる
  behaves like 決済の取り決めを満たす
    成功したら決済 ID と日時を返す
    残高不足は Declined として返す（例外にしない）
    有効期限切れは Declined として返す
    接続のタイムアウトは Payments::Unavailable にし、元の例外を cause に残す
    決済サービス側の一時的な障害は Payments::Unavailable にする

Payments::PayBAdapter
  米ドルの 3000（セント）を "30.00" と 840 にして送る
  SDK の代役（instance_double）で、SDK に渡す引数を確かめる
  behaves like 決済の取り決めを満たす
    成功したら決済 ID と日時を返す
    残高不足は Declined として返す（例外にしない）
    有効期限切れは Declined として返す
    接続のタイムアウトは Payments::Unavailable にし、元の例外を cause に残す
    決済サービス側の一時的な障害は Payments::Unavailable にする

Payments.gateway
  設定の値で Adapter を選ぶ
  既定では config.x.payments.provider を使う
  知らない値なら ArgumentError にする
# …（省略：Order#pay! の3例、POST /orders/:order_id/payment の3例）

Finished in 0.25747 seconds (files took 1.01 seconds to load)
24 examples, 0 failures
`}
          />
          <p>
            <code>behaves like 決済の取り決めを満たす</code> の下に、同じ5つの例が A社と B社の両方で実行されています。新しい会社の Adapter を足すときも、<code>it_behaves_like</code> の1行と <code>stub_provider</code> を書けば、同じ確認の一覧が実行されます。
          </p>
          <h3>共通のテストが見つける誤り</h3>
          <p>
            B社の Adapter を書いた直後の状態を再現するため、<code>"9001"</code> の分岐と <code>rescue PayB::ConnectionError</code> を消して B社の spec を実行しました。A社の Adapter だけを見て書くと、A社に無い「結果のコードで返る障害」と「SDK 独自の接続の例外」を書き落としやすいからです。
          </p>
          <Code
            lang="text"
            title="実行結果（B社の Adapter から 9001 の分岐と rescue を消した場合。一部を省略）"
            code={`
.....FF

Failures:

  1) Payments::PayBAdapter behaves like 決済の取り決めを満たす 接続のタイムアウトは Payments::Unavailable にし、元の例外を cause に残す
     Failure/Error: expect { gateway.charge(**request) }.to raise_error(Payments::Unavailable) { |e| expect(e.cause).to be_present }

       expected Payments::Unavailable, got #<PayB::ConnectionError: execution expired> with backtrace:
     # …（省略）
     Shared Example Group: "決済の取り決めを満たす" called from ./spec/adapters/payments/pay_b_adapter_spec.rb:15

  2) Payments::PayBAdapter behaves like 決済の取り決めを満たす 決済サービス側の一時的な障害は Payments::Unavailable にする
     Failure/Error: expect { gateway.charge(**request) }.to raise_error(Payments::Unavailable)
       expected Payments::Unavailable but nothing was raised
     Shared Example Group: "決済の取り決めを満たす" called from ./spec/adapters/payments/pay_b_adapter_spec.rb:15

7 examples, 2 failures
`}
          />
          <p>
            タイムアウトは SDK の例外のまま外へ出て、<code>"9001"</code> は例外にならず拒否として返りました。前の節でコントローラーの if で起きた2つの誤りと同じものを、共通のテストが B社の Adapter を足した時点で見つけています。失敗の表示の <code>Shared Example Group: ... called from</code> は、どの spec から組み込んだ共通のテストが失敗したかを示します。
          </p>
        </>
      ),
    },
    {
      id: 'consequences',
      title: '得られるものと増えるもの',
      body: (
        <>
          <h3>得られるもの</h3>
          <ul>
            <li>決済サービスの切り替えや SDK の仕様の変更で直すのが、Adapter と <code>Payments.gateway</code> だけになります。コントローラーとモデルは変わりません。</li>
            <li>注文の処理を、SDK を知らずに読めて、HTTP の応答を用意せずにテストできます。</li>
            <li>拒否の理由と障害の種類が、アプリの値（<code>:insufficient_funds</code>、<code>Unavailable</code>）としてそろいます。利用者に見せる文や、再試行するかどうかの判断を1か所で決められます。</li>
            <li>金額の単位・通貨のコード・時刻の解釈のように、会社ごとに違う変換が1つのクラスにまとまり、変換の誤りを Adapter のテストで見つけられます。</li>
            <li>共通のテスト（shared_examples）が、新しい Adapter を足すときの確認の一覧になります。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>変換のコードと、その変換を確かめるテストが増えます。この章では Adapter の2ファイル、取り決めの1ファイル、共通のテストと Adapter ごとの spec が増えました。</li>
            <li>外部のサービスに固有の機能（一部の決済サービスだけが持つ分割払いなど）を使いたいとき、取り決めにどう表すかを決める必要があります。</li>
            <li>取り決めはアプリが必要とする範囲に限るので、外部の機能を新しく使うたびに取り決めを広げ、すべての Adapter と共通のテストを直す作業が要ります。</li>
            <li>コードを読む人は、<code>Order#pay!</code> から実際に呼ばれる SDK を知るために、<code>Payments.gateway</code> と設定を追う必要があります。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            外部が変わったときに直す場所が Adapter に限られるので、外部のサービスが多いアプリほど保守しやすくなります。テストは、業務の処理のテスト（取り決めの代役を使う）と、変換のテスト（WebMock か SDK の代役を使う）に分かれ、それぞれが小さくなります。一方で、取り決めの代役を使うテストは、本物の Adapter と食い違っていても通ります。代役が返す値を取り決めの <code>Succeeded</code>・<code>Declined</code> に限り、本物の Adapter には共通のテストを当てることで、食い違いを防ぎます。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>外部の型をそのまま返す</h3>
          <Code
            lang="ruby"
            title="誤った例：名前だけを変えて、A社の Charge をそのまま返す"
            code={`
class PayAAdapter
  def charge(order_id:, amount_cents:, currency:, card_token:)
    @client.create_charge(amount: amount_cents, currency: currency.downcase,
                          source: card_token, metadata: { order_id: })
  end
end

# 使う側が、相変わらず A社の値を知っている
result = gateway.charge(...)
update!(status: "paid") if result.status == "succeeded"
`}
          />
          <p>
            メソッドの名前だけを変えて、外部の型（<code>PayA::Charge</code>）の値をそのまま返す Adapter は、外部の仕様を使う側に渡したままです。使う側は <code>status</code> や <code>failure_code</code> を知る必要があり、B社の Adapter は A社の Charge の形を真似て返すことになります。戻り値と例外は、取り決めの型（<code>Succeeded</code>・<code>Declined</code>・<code>Unavailable</code>）に変換します。
          </p>
          <h3>すべての外部の機能を取り決めに入れる</h3>
          <Code
            lang="ruby"
            title="誤った例：A社の SDK の機能をすべて取り決めに並べる"
            code={`
module Payments
  # charge(order_id:, amount_cents:, currency:, card_token:,
  #        installments:, statement_descriptor:, capture_method:)
  # create_customer(...) / attach_card(...) / list_disputes(...) / create_payout(...)
end

class PayBAdapter
  def list_disputes(...) = raise NotImplementedError, "B社には異議申し立ての API が無い"
end
`}
          />
          <p>
            「いつか使うかもしれない」と外部の機能をすべて取り決めに入れると、取り決めが A社の SDK とほぼ同じ形になり、ほかの会社で実装できなくなります。B社の Adapter には <code>NotImplementedError</code> を発生させるメソッドが並び、どの機能がどの会社で使えるかを、呼ぶ前に調べることになります。取り決めには、アプリが今使うことだけを入れます。特定のサービスだけの機能が必要なら、その機能だけの別の取り決め（たとえば分割払いの取り決め）として分けます。
          </p>
          <h3>Adapter に業務の判断を入れる</h3>
          <Code
            lang="ruby"
            title="誤った例：変換の中に、どの会社で請求するか・拒否の後に何をするかの判断がある"
            code={`
class PayAAdapter
  def charge(order_id:, amount_cents:, currency:, card_token:)
    # 高額の注文は B社で請求する
    return PayBAdapter.new(PayB::GatewayClient.new(merchant_id: "m-001")).charge(...) if amount_cents >= 100_000

    charge = @client.create_charge(...)
    if charge.status == "failed"
      Order.find(order_id).update!(status: "payment_failed") # 注文の状態まで変える
      CustomerMailer.card_declined(order_id).deliver_later
    end
    # …（省略）
  end
end
`}
          />
          <p>
            「この金額以上なら B社を使う」「拒否されたら注文を失敗にしてメールを送る」のような判断を Adapter に入れると、変換と業務の判断が混ざります。Adapter を B社に替えると業務の動作まで変わり、A社の Adapter のテストに注文やメールの確認が入ります。Adapter は変換だけを行い、判断は使う側（<code>Order#pay!</code> やユースケースのクラス）で行います。どの会社で請求するかを金額で決める規則が本当に必要なら、それは <code>Payments.gateway</code> の選び方の規則として、使う側に置きます（規則を差し替える設計は <ChapterLink n={41} section="idea" />）。
          </p>
          <h3>エラーを全部同じものにする</h3>
          <Code
            lang="ruby"
            title="誤った例：どの失敗も1種類の例外にする"
            code={`
def charge(order_id:, amount_cents:, currency:, card_token:)
  res = @client.authorize_and_capture(...)
  raise Payments::Error, "決済に失敗しました" unless res["result_code"] == "0000"
  # …（省略）
rescue => e
  raise Payments::Error, "決済に失敗しました"
end
`}
          />
          <p>
            外部のエラーをすべて「決済に失敗しました」の1種類にすると、再試行してよい障害と、利用者に別のカードを求めるべき拒否を区別できなくなります。<code>rescue =&gt; e</code> は StandardError をすべて受け取るので、Adapter の中の <code>NoMethodError</code> のようなバグまで決済の失敗として扱われ、見つけにくくなります。少なくとも、業務の上の結果（拒否。戻り値の <code>Declined</code>）、一時的な障害（再試行できる。<code>Unavailable</code>）、プログラムの誤り（引数の誤りなど。変換せずにそのまま発生させる）の3つを分けます。
          </p>
          <h3>安定した標準的なライブラリにまで Adapter を置く</h3>
          <Code
            lang="ruby"
            title="誤った例：標準のライブラリや Rails の機能に Adapter を重ねる"
            code={`
class JsonAdapter
  def parse(text) = JSON.parse(text)
end

class FileStorageAdapter
  def upload(io, filename) = ActiveStorage::Blob.create_and_upload!(io:, filename:)
end
`}
          />
          <p>
            JSON の変換や日付の計算のように、安定していて替える予定のないライブラリにまで Adapter を置くと、コードが増えるだけです。Active Storage のように、Rails がすでに保存先を替えられる仕組みを持っている機能に、もう1つ Adapter を重ねる必要もありません（次の節）。Adapter を置くのは、仕様が変わる可能性がある外部サービス、替える可能性があるもの、テストで代役にしたいものに限ります。
          </p>
        </>
      ),
    },
    {
      id: 'alternatives',
      title: 'ほかの方法との使い分けと採用の判断',
      body: (
        <>
          <h3>より単純な方法：呼び出しを1つのクラスに集める</h3>
          <p>
            外部サービスが1つで、替える予定がなく、使う箇所も少ないなら、取り決めと共通のテストを作らずに、外部を呼ぶコードを1つのクラス（たとえば <code>PayACharge.call(order, card_token)</code>）に集めるだけでも、変更の範囲を限定できます。このときも、戻り値はアプリの値（成功か拒否か）にしておくと、後で会社を足すときにそのクラスを Adapter に直すだけで済みます。
          </p>
          <h3>Rails 自身の Adapter</h3>
          <p>Rails は、外部のサービスやソフトウェアを替えられるようにする部分を Adapter の形で作っています。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">機能</th>
                  <th scope="col">取り決め（Rails の側）</th>
                  <th scope="col">選び方</th>
                  <th scope="col">Adapter の例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Active Job</th>
                  <td>
                    <code>ActiveJob::QueueAdapters::AbstractAdapter</code>（<code>enqueue</code>・<code>enqueue_at</code>）
                  </td>
                  <td>
                    <code>config.active_job.queue_adapter = :sidekiq</code>
                  </td>
                  <td>SidekiqAdapter（sidekiq の gem が提供）・TestAdapter・AsyncAdapter</td>
                </tr>
                <tr>
                  <th scope="row">Active Storage</th>
                  <td>
                    <code>ActiveStorage::Service</code>（<code>upload</code>・<code>download</code>・<code>delete</code> など）
                  </td>
                  <td>
                    <code>config/storage.yml</code> の <code>service:</code> と <code>config.active_storage.service</code>
                  </td>
                  <td>DiskService・S3Service・GCSService・MirrorService</td>
                </tr>
                <tr>
                  <th scope="row">Active Record</th>
                  <td>
                    <code>ActiveRecord::ConnectionAdapters::AbstractAdapter</code>（SQL の実行・例外の変換）
                  </td>
                  <td>
                    <code>config/database.yml</code> の <code>adapter:</code>
                  </td>
                  <td>Mysql2Adapter・TrilogyAdapter・PostgreSQLAdapter・SQLite3Adapter</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Active Job は、ジョブを登録して後で実行する Rails の仕組みです（<ChapterLink n={18} section="job-basics" />）。登録したジョブを保存して取り出す仕組み（キューのバックエンド）を <code>config.active_job.queue_adapter</code> で選び、環境ごと、ジョブのクラスごとにも設定できます<Ref n={12} />。設定した名前からクラスを探す処理は次のとおりで、<code>:sidekiq</code> は <code>SidekiqAdapter</code> になります<Ref n={13} />。どのアダプターも、AbstractAdapter が定めた <code>enqueue</code>・<code>enqueue_at</code> を実装します<Ref n={14} />。
          </p>
          <Code
            lang="ruby"
            title="activejob/lib/active_job/queue_adapters.rb（Rails 8.1.4.1、126〜137行目）"
            href={`${GH}/activejob/lib/active_job/queue_adapters.rb#L126-L137`}
            code={`
    ADAPTER = "Adapter"
    private_constant :ADAPTER

    class << self
      # Returns adapter for specified name.
      #
      #   ActiveJob::QueueAdapters.lookup(:sidekiq)
      #   # => ActiveJob::QueueAdapters::SidekiqAdapter
      def lookup(name)
        const_get(name.to_s.camelize << ADAPTER)
      end
    end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner。上は development、下は test の環境）"
            code={`
queue_adapter: ActiveJob::QueueAdapters::SidekiqAdapter
enqueue の定義: sidekiq-8.1.7/lib/active_job/queue_adapters/sidekiq_adapter.rb
lookup(:test): ActiveJob::QueueAdapters::TestAdapter

ActiveJob::QueueAdapters::TestAdapter
`}
          />
          <p>
            development では Sidekiq のアダプターが使われ、その <code>enqueue</code> は Rails ではなく sidekiq の gem のファイルで定義されていました。sidekiq の gem は、Rails に組み込まれた SidekiqAdapter を <code>remove_const</code> で取り除き、同じ名前で自分のアダプターを定義します<Ref n={15} />。Rails 8.1 は組み込みの Sidekiq アダプターを非推奨にし、組み込みの SuckerPunch アダプターを gem 側のアダプターに任せて削除しました<Ref n={16} />。Rails が取り決め（AbstractAdapter）を持ち、外部の gem がそれに合わせた Adapter を提供する形です。test の環境では、ジョブを実行せずに記録する TestAdapter が選ばれています（<ChapterLink n={20} section="jobs-mail" />）。
          </p>
          <p>
            Active Storage は、アップロードされたファイルの保存先を <code>config/storage.yml</code> にサービスとして宣言し、環境ごとに <code>config.active_storage.service</code> でどのサービスを使うかを選びます<Ref n={17} />。<code>service: Disk</code> と書くと、Rails は <code>active_storage/service/disk_service</code> を読み込んで <code>ActiveStorage::Service::DiskService</code> を使います<Ref n={18} />。アプリのコードは、保存先がローカルのディスクか Amazon S3 かを知りません。Rails 8.1 の Active Storage にあるサービスは Disk・S3・GCS・Mirror です。
          </p>
          <p>
            DB のアダプターは、<code>database.yml</code> の <code>adapter: mysql2</code> から <code>Mysql2Adapter</code> を選びます<Ref n={20} />。DB ごとのエラーを Active Record の例外に変える処理も、アダプターが受け持ちます。MySQL のアダプターは、エラー番号 1062（一意制約の違反）を <code>ActiveRecord::RecordNotUnique</code> に、1213（デッドロック）を <code>ActiveRecord::Deadlocked</code> に変えます<Ref n={21} />。PostgreSQL のアダプターも一意制約の違反を同じ <code>RecordNotUnique</code> に変えるので、アプリの <code>rescue ActiveRecord::RecordNotUnique</code> は DB の種類に依存しません。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb（Rails 8.1.4.1、873〜916行目から抜粋）"
            href={`${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L873-L916`}
            code={`
        def translate_exception(exception, message:, sql:, binds:)
          case error_number(exception)
          # …（省略）
          when ER_DUP_ENTRY
            RecordNotUnique.new(message, sql: sql, binds: binds, connection_pool: @pool)
          when ER_NO_REFERENCED_ROW, ER_ROW_IS_REFERENCED, ER_ROW_IS_REFERENCED_2, ER_NO_REFERENCED_ROW_2
            InvalidForeignKey.new(message, sql: sql, binds: binds, connection_pool: @pool)
          # …（省略）
          when ER_LOCK_DEADLOCK
            Deadlocked.new(message, sql: sql, binds: binds, connection_pool: @pool)
          # …（省略）
          else
            super
          end
        end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner。一意索引のある一時テーブルに同じ値を2回 INSERT した）"
            code={`
アダプター: ActiveRecord::ConnectionAdapters::Mysql2Adapter
受け取った例外: ActiveRecord::RecordNotUnique
元の例外（cause）: Mysql2::Error error_number=1062
`}
          />
          <p>
            mysql2 の gem の例外（<code>Mysql2::Error</code>）は <code>cause</code> に残り、アプリには Active Record の例外が届きました。この章の Adapter が <code>PayB::ConnectionError</code> を <code>Payments::Unavailable</code> に置き換え、元の例外を cause に残したのと同じ形です。
          </p>
          <p>
            Rails や gem がすでに Adapter を用意している機能（ジョブのキュー、ファイルの保存先、DB）では、自分で Adapter を書かずに、その設定で替えます。自分で書くのは、決済・SMS・配送業者のように、アプリの業務が直接使う外部サービスです。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 の Active Storage には Azure Storage のサービスがあります。Rails 8.0 で非推奨になり<Ref n={19} />、8.1 で削除されました<Ref n={16} />。Active Job に組み込まれた Sidekiq アダプターは Rails 8.1 で非推奨になりました。8.1 で組み込みのアダプターを設定すると、sidekiq の gem を 7.3.3 以降に上げて gem 側のアダプターを使うよう警告が出ます<Ref n={16} />。
            </p>
          </Callout>
          <h3>似た考え方との違い</h3>
          <Figure n="95-4" title="Adapter と似た考え方の範囲" caption="範囲の関係を単純にした模式図。外側の枠ほど扱う範囲が広い。">
            <ScopeFigure />
          </Figure>
          <p>
            図 95-4 は、Adapter と似た考え方の関係を入れ子で示したものです。外側の枠ほど扱う範囲が広く、腐敗防止層の枠の中の Adapter と Facade は、腐敗防止層を作るときの部品になることを表しています。
          </p>
          <ul>
            <li>
              Facade：複数の部品をまとめて、使う側のための単純なインターフェースを新しく作るパターンです。GoF は目的を「サブシステムの複数のインターフェースに対して、統一されたインターフェースを提供する」としています<Ref n={22} />。Adapter が使う側の期待する取り決めに合わせるのに対して、Facade は新しいインターフェースを定義します。
            </li>
            <li>
              <Term en="Anti-Corruption Layer">腐敗防止層</Term>：Eric Evans が『Domain-Driven Design』で示したパターンで、外部のシステムの機能を、自分たちのモデル（アプリが業務を表すために決めたクラスや用語）の言葉で提供する層を作ります<Ref n={23} /><Ref n={24} />。Adapter や Facade を組み合わせて作ります。外部のモデルの考え方そのものが違う場合（用語や業務の区切り方が違う場合）に、変換を1か所に集めるための考え方です。たとえば古い基幹システムの「受注伝票」を、このアプリの Order と OrderItem に変換する層がこれに当たります。
            </li>
            <li>
              Ports and Adapters：Alistair Cockburn が 2005年に示した、アプリケーション全体の構成の考え方です<Ref n={25} />。アプリケーションの内側に取り決め（ポート）を置き、利用者・テスト・DB・外部サービスのそれぞれに Adapter を用意します。この章の決済の取り決めはポートに当たります。Rails のアプリ全体をこの形にするかどうかは <ChapterLink n={34} section="rails-way-ddd" /> で扱いました。
            </li>
          </ul>
          <h3>テストの方法の代替</h3>
          <ul>
            <li>
              通信を記録して再生する：VCR は、実際の HTTP の通信を一度記録してファイルに保存し、以後のテストで再生する gem です<Ref n={26} />。決済サービスのテスト用の環境に一度つないで記録すれば、本物の応答の形でテストできます。記録にはトークンや個人情報が入り得るので、保存する前に伏せる設定をします。
            </li>
            <li>
              契約テスト：使う側と提供する側が、やり取りの内容（契約）を共有し、それぞれを独立して確かめる方法です<Ref n={27} />。Ian Robinson は、提供する側の契約が使う側の期待から作られる形を Consumer-Driven Contracts と呼んでいます<Ref n={28} />。社内の別のチームが提供する API など、相手と契約を共有できる場合に使えます。外部の決済サービスとは契約を共有できないので、この章では共通のテストと WebMock で、アプリの側の取り決めを確かめました。
            </li>
          </ul>
          <h3>採用の判断</h3>
          <p>採用する条件は次のとおりです。</p>
          <ul>
            <li>外部サービスの提供元を替える予定がある、または複数の提供元を同時に使う</li>
            <li>外部の項目名・単位・エラーの形が、業務の処理と大きく違う</li>
            <li>外部の SDK や API の仕様が変わる可能性が高い（バージョンの更新が多い、提供元が仕様を変える）</li>
            <li>業務の処理を、外部の SDK や HTTP の応答なしでテストしたい</li>
          </ul>
          <p>採用しない方がよい条件は次のとおりです。</p>
          <ul>
            <li>外部が安定した標準的なライブラリで、替える予定もテストで代役にする必要もない</li>
            <li>外部を使う箇所が1か所だけで、変換もほとんどない</li>
            <li>Rails や gem が同じ目的の Adapter（Active Storage のサービス、Active Job のキューのアダプター）を用意している</li>
          </ul>
          <p>判断するときのチェックポイントは次のとおりです。</p>
          <ol>
            <li>取り決めの名前と型は、外部ではなくアプリの言葉で書かれているか</li>
            <li>取り決めの戻り値や例外に、外部の型（<code>PayA::Charge</code>、<code>PayB::ConnectionError</code>）が現れていないか</li>
            <li>業務の上の結果と、一時的な障害と、プログラムの誤りを区別して変換しているか。置き換えた例外の cause に元の例外が残っているか</li>
            <li>Adapter に業務の判断（どの会社で請求するか、拒否の後に何をするか）が入っていないか</li>
            <li>複数の Adapter がある場合、同じ共通のテストで取り決めを満たすことを確かめているか</li>
          </ol>
          <Callout kind="note" title="1社しか使わない場合">
            <p>
              決済サービスを1社しか使わない場合でも、決済は金額・エラー・障害の扱いが複雑で、SDK の更新もあるため、Adapter を置く効果は大きくなります。<ChapterLink n={34} section="external-boundaries" /> の Payments::Gateway は、1社のための Adapter です。一方、社内でしか使わない単純な API を1か所から呼ぶだけなら、呼び出しを1つのクラスに集めるだけで足ります。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'pattern-choice',
      title: '決済の仕様差と選択条件を分ける',
      body: (
        <>
          <p>A 社は円で、B 社は通貨の最小単位で受け付けるとします。金額や応答を共通の形式に変換するのが Adapter の仕事です。どの決済会社を選ぶかが注文の条件で変わる場合は、その選択に <ChapterLink n={41} section="idea">Strategy / Policy</ChapterLink> を使えます。両者は併用できます。</p>
          <p>テストだけで決済会社を差し替えたい場合は、既存のクライアントを <ChapterLink n={40} section="idea">Dependency Injection</ChapterLink> で渡す方法があります。アプリ内の仕様に変換する必要が生じた時点で Adapter を追加できます。</p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Adapter は、外部のインターフェースを、使う側が期待するインターフェースに変換する部品です。MSDP のカタログでは、外部の仕様をアプリの内部に持ち込まないために使います。</li>
          <li>取り決め（メソッド・戻り値・例外）はアプリの側に置き、アプリの言葉で書きます。Ruby では、コメントと Data のクラスと共通のテストで表します。</li>
          <li>Adapter は、データの形と単位（最小単位の整数と小数の文字列）、状態や理由を表す値、時刻、エラーを変換します。拒否は戻り値、一時的な障害は例外にし、プログラムの誤りは変換しません。置き換えた例外の cause には元の例外が残ります。</li>
          <li>Rails では Adapter を <code>app/adapters</code> などオートロードされるディレクトリに置き、<code>config.x</code> と credentials から、どの Adapter を使うかを選びます。使う側は既定の引数で Adapter を受け取り、テストでは代役を渡します。</li>
          <li>RSpec の shared_examples に取り決めのテストを書き、<code>it_behaves_like</code> で各 Adapter に当てます。WebMock で各社の HTTP の応答を決めると、SDK を含めた変換を確かめられます。</li>
          <li>外部の型を返す、外部の機能をすべて取り決めに入れる、業務の判断を入れる、エラーを1種類にする、標準のライブラリにまで置く、の5つが典型的な誤用です。</li>
          <li>Active Job のキュー、Active Storage のサービス、DB のアダプターは Rails が用意した Adapter です。同じ目的なら、自分で Adapter を重ねずにその設定で替えます。</li>
          <li>Facade は新しい単純なインターフェースを作り、腐敗防止層は外部のモデルを自分たちのモデルに変換する層、Ports and Adapters はアプリケーション全体の構成の考え方です。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Design Patterns: Adapter', publisher: 'Erich Gamma ほか／InformIT（『Design Patterns』の抜粋）', url: 'https://www.informit.com/articles/article.aspx?p=1398600', accessed: '2026-11-13', version: '書籍は1994年刊', note: 'Adapter の目的の引用、別名（Wrapper）、クラスアダプターとオブジェクトアダプター。' },
    { title: 'Supported currencies（Zero-decimal currencies）', publisher: 'Stripe Docs', url: 'https://docs.stripe.com/currencies', accessed: '2026-11-13', note: '金額を通貨の最小単位で渡すこと、円は小数の無い通貨であること。' },
    { title: 'Errors', publisher: 'Stripe API Reference', url: 'https://docs.stripe.com/api/errors', accessed: '2026-11-13', note: 'エラーの種類（api_error、card_error、idempotency_error、invalid_request_error）。' },
    { title: 'Autoloading and Reloading Constants', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html', accessed: '2026-11-20', version: 'Rails 8.1', note: '起動時に存在する app のサブディレクトリがオートロードの対象になり名前空間の起点になること、lib は既定では対象でないこと、起動中に initializers から app のコードをオートロードできないこと（2〜4節）。' },
    { title: 'Exception', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Exception.html', accessed: '2026-11-20', version: 'Ruby 4.0', note: 'cause が、例外を発生させたときの $!（処理中の例外）を返すこと。Adapter の置き換えで cause が連なることは Ruby 4.0.9 で確認。' },
    { title: 'ActiveSupport::TimeZone', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveSupport/TimeZone.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'strptime が、時差を含まない文字列をそのタイムゾーンの時刻として解釈し TimeWithZone を返すこと。' },
    { title: 'Configuring Rails Applications（Custom Configuration）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html#custom-configuration', accessed: '2026-11-20', version: 'Rails 8.1', note: 'config.x に入れ子の独自の設定を置き、Rails.configuration.x で読むこと。設定していない名前は nil を返すこと。' },
    { title: 'Securing Rails Applications（Custom Credentials）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/security.html#custom-credentials', accessed: '2026-11-20', version: 'Rails 8.1', note: 'credentials.yml.enc に外部の API のキーなどを保存し Rails.application.credentials で読むこと、! を付けると空のときに KeyError になること。' },
    { title: 'WebMock', publisher: 'bblimke/webmock（GitHub）', url: 'https://github.com/bblimke/webmock', accessed: '2026-11-20', version: '3.36.0 を使用', note: 'require "webmock/rspec"、Net::HTTP への対応、to_timeout、a_request と have_been_made、hash_including。to_timeout が Net::HTTP に Net::OpenTimeout を発生させることは gem のソース（http_lib_adapters/net_http.rb）で確認。' },
    { title: 'Using shared examples', publisher: 'RSpec Core', url: 'https://rspec.info/features/3-13/rspec-core/example-groups/shared-examples/', accessed: '2026-11-20', version: 'RSpec 3.13', note: '共有したグループは組み込む側の文脈で実行されること、it_behaves_like が入れ子の文脈に組み込むこと。' },
    { title: 'Verifying doubles', publisher: 'RSpec Mocks', url: 'https://rspec.info/features/3-13/rspec-mocks/verifying-doubles/', accessed: '2026-11-20', version: 'RSpec 3.13', note: 'スタブしたメソッドが本物に存在するかと引数の数を確かめること。' },
    { title: 'Active Job Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_job_basics.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'config.active_job.queue_adapter でバックエンドを選び、環境ごと・ジョブのクラスごとにも設定できること。' },
    { title: 'activejob/lib/active_job/queue_adapters.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/queue_adapters.rb#L126-L137`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'lookup が名前を camelize して Adapter を付けたクラスを返すこと。' },
    { title: 'activejob/lib/active_job/queue_adapters/abstract_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/queue_adapters/abstract_adapter.rb#L9-L21`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'AbstractAdapter が enqueue と enqueue_at を NotImplementedError で定め、各アダプターが実装すること。' },
    { title: 'lib/active_job/queue_adapters/sidekiq_adapter.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: 'https://github.com/sidekiq/sidekiq/blob/v8.1.7/lib/active_job/queue_adapters/sidekiq_adapter.rb#L35-L47', accessed: '2026-11-20', version: 'Sidekiq 8.1.7', note: 'Rails に組み込まれた SidekiqAdapter を remove_const で取り除き、gem 側のアダプターを定義すること。' },
    { title: 'Ruby on Rails 8.1 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/8_1_release_notes.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'Active Storage の :azure サービスの削除、組み込みの Sidekiq アダプターの非推奨、組み込みの SuckerPunch アダプターの削除。sidekiq 7.3.3 以降への更新を促す警告は activejob 8.1.4.1 の sidekiq_adapter.rb で確認。' },
    { title: 'Active Storage Overview', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_storage_overview.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'config/storage.yml にサービスを宣言し、環境ごとに config.active_storage.service で選ぶこと。' },
    { title: 'activestorage/lib/active_storage/service/configurator.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activestorage/lib/active_storage/service/configurator.rb#L15-L40`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'service: の名前から active_storage/service/〜_service を読み込み、〜Service のクラスを使うこと。サービスが Disk・S3・GCS・Mirror であることは gem のディレクトリで確認。' },
    { title: 'Ruby on Rails 8.0 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/8_0_release_notes.html', accessed: '2026-11-20', version: 'Rails 8.0', note: 'Active Storage の Azure のバックエンドを非推奨にしたこと。' },
    { title: 'activerecord/lib/active_record/connection_adapters.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters.rb#L67-L70`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'database.yml の adapter の名前（sqlite3・mysql2・trilogy・postgresql）とアダプターのクラスの登録。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L873-L916`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'MySQL のエラー番号を RecordNotUnique・InvalidForeignKey・Deadlocked などに変換すること。PostgreSQL のアダプターも一意制約の違反を RecordNotUnique にすること（postgresql_adapter.rb の translate_exception）を確認。' },
    { title: 'Design Patterns Explained, 2nd ed. 第6章（サンプル）', publisher: 'Alan Shalloway, James R. Trott／Addison-Wesley（Pearson）', url: 'https://ptgmedia.pearsoncmg.com/images/0321247140/samplechapter/shalloway_ch06.pdf', accessed: '2026-11-13', note: 'GoF の Facade の目的の引用。' },
    { title: 'Domain-Driven Design Reference', publisher: 'Eric Evans／Domain Language', url: 'https://domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf', accessed: '2026-11-13', version: '2015年', note: '腐敗防止層（Anticorruption Layer）の定義。' },
    { title: 'Anti-Corruption Layer pattern', publisher: 'Microsoft Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer', accessed: '2026-11-13', note: '意味の違うサブシステムの間に置く変換の層。' },
    { title: 'The Hexagonal (Ports & Adapters) Architecture', publisher: 'Alistair Cockburn', url: 'https://alistair.cockburn.us/hexagonal-architecture/', accessed: '2026-11-13', version: '2005年9月4日', note: 'ポートとアダプターの定義。' },
    { title: 'vcr/vcr', publisher: 'GitHub', url: 'https://github.com/vcr/vcr', accessed: '2026-11-13', note: 'HTTP のやり取りを記録して、テストで再生する。' },
    { title: 'Introduction', publisher: 'Pact Docs', url: 'https://docs.pact.io/', accessed: '2026-11-13', note: '契約テストの定義。' },
    { title: 'Consumer-Driven Contracts: A Service Evolution Pattern', publisher: 'Ian Robinson／martinfowler.com', url: 'https://martinfowler.com/articles/consumerDrivenContracts.html', accessed: '2026-11-13', version: '2006年6月12日', note: '使う側の期待から提供する側の契約を作る考え方。' },
  ],
}

export default chapter
