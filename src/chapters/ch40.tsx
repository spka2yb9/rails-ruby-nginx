import type { Chapter } from '../content/types'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 76-1 適用前と適用後の依存の向き ---------- */
function DependenciesFigure() {
  return (
    <Svg
      id="76-1"
      w={760}
      h={450}
      label="適用前は Product#price_label が Net::HTTP（為替 API）、ENV（API キー）、Time.current（現在時刻）を中で直接使っていて、テストで差し替えられない。適用後の PriceLabel は rates と clock を受け取り、usd_to_jpy に応答して ExchangeRate を返すという取り決めと、now に応答して現在時刻を返すという取り決めだけを使う。HttpRateSource と Time.zone がそれぞれの取り決めを満たす。為替 API と通信するのは HttpRateSource だけで、組み立てる場所の config/initializers/rate_source.rb が HttpRateSource を作って config.x に入れる"
    >
      <T x={20} y={20} bold>
        適用前
      </T>
      <Box x={20} y={40} w={230} h={56} lines={['Product#price_label', '換算・表示・60分の判定']} fs={12} bold subTone="muted" />
      <Box x={20} y={136} w={200} h={38} lines="Net::HTTP（為替 API）" fs={12} fill="box4" />
      <Box x={20} y={184} w={200} h={38} lines="ENV（API キー）" fs={12} fill="box4" />
      <Box x={20} y={232} w={200} h={38} lines="Time.current（現在時刻）" fs={12} fill="box4" />
      <Arrow d="M238,96 L238,155 L222,155" />
      <Arrow d="M238,155 L238,203 L222,203" />
      <Arrow d="M238,203 L238,251 L222,251" />
      <T x={20} y={300} fs={12} tone="danger">
        モデルの中で依存先を直接使うので、
      </T>
      <T x={20} y={318} fs={12} tone="danger">
        テストで差し替えられない
      </T>

      <line x1={272} y1={10} x2={272} y2={440} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={292} y={20} bold>
        適用後
      </T>
      <Box x={420} y={36} w={220} h={64} lines={['PriceLabel', 'rates: と clock: を受け取る']} fs={12} bold accent subTone="muted" />
      <Box x={310} y={140} w={190} h={48} lines={['取り決め：now', '現在時刻を返す']} fs={12} fill="box2" dashed subTone="muted" />
      <Box x={540} y={140} w={210} h={48} lines={['取り決め：usd_to_jpy', 'ExchangeRate を返す']} fs={12} fill="box2" dashed subTone="muted" />
      <Arrow x1={480} y1={100} x2={420} y2={138} />
      <Arrow x1={590} y1={100} x2={640} y2={138} />
      <Box x={310} y={236} w={190} h={40} lines="Time.zone（既定値）" fs={12} />
      <Box x={540} y={236} w={210} h={40} lines="HttpRateSource" fs={12} />
      <Arrow x1={405} y1={236} x2={405} y2={190} dashed />
      <Arrow x1={645} y1={236} x2={645} y2={190} dashed />
      <T x={412} y={214} fs={11} tone="muted">
        満たす
      </T>
      <T x={652} y={214} fs={11} tone="muted">
        満たす
      </T>
      <Box x={540} y={306} w={210} h={36} lines="為替 API（外部）" fs={12} fill="box4" />
      <Arrow x1={645} y1={276} x2={645} y2={304} />
      <Box
        x={310}
        y={372}
        w={440}
        h={48}
        lines={['config/initializers/rate_source.rb（組み立てる場所）', 'HttpRateSource を作り、config.x に入れる']}
        fs={12}
        fill="box5"
        bold
        subTone="muted"
      />
      <Arrow d="M525,372 L525,256 L538,256" />
      <T x={518} y={322} fs={11} anchor="end" tone="muted">
        作って渡す
      </T>
      <T x={310} y={438} fs={12} tone="muted">
        為替 API を知っているのは HttpRateSource だけ
      </T>
    </Svg>
  )
}

/* ---------- 図 76-2 価格を表示するときのシーケンス ---------- */
function SequenceFigure() {
  const xs = [80, 235, 395, 555, 705]
  const names = ['ProductsController', 'PriceLabel', 'HttpRateSource', '為替 API', 'Time.zone']
  const msgs: { y: number; from: number; to: number; text: string; ret?: boolean; mono?: boolean; at?: number }[] = [
    { y: 78, from: 0, to: 1, text: 'render(1999)', mono: true },
    { y: 112, from: 1, to: 2, text: 'usd_to_jpy', mono: true },
    { y: 146, from: 2, to: 3, text: 'GET /v1/latest', mono: true },
    { y: 180, from: 3, to: 2, text: 'JSON（レートと時点）', ret: true },
    { y: 214, from: 2, to: 1, text: 'ExchangeRate', ret: true, mono: true },
    { y: 252, from: 1, to: 4, text: 'now', mono: true, at: 630 },
    { y: 286, from: 4, to: 1, text: '現在時刻', ret: true, at: 630 },
    { y: 376, from: 1, to: 0, text: '表示用の文字列', ret: true },
  ]
  return (
    <Svg
      id="76-2"
      w={780}
      h={430}
      label="ProductsController が PriceLabel の render(1999) を呼ぶ。PriceLabel は HttpRateSource の usd_to_jpy を呼び、HttpRateSource は為替 API に GET を送ってレートと時点の JSON を受け取り、ExchangeRate に変換して返す。次に PriceLabel は Time.zone の now を呼んで現在時刻を受け取る。レートが1時間以内か確かめて円に換算し、古ければ StaleRateError を投げる。換算した表示用の文字列をコントローラーに返す"
    >
      {names.map((n, i) => (
        <g key={n}>
          <Box x={xs[i] - 70} y={10} w={140} h={36} lines={n} fs={12} fill={i === 3 ? 'box4' : 'box'} accent={i === 1} mono={i !== 3} />
          <line x1={xs[i]} y1={46} x2={xs[i]} y2={392} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {msgs.map((m) => {
        const dir = m.to > m.from ? 1 : -1
        const cx = m.at ?? (xs[m.from] + xs[m.to]) / 2
        return (
          <g key={m.y}>
            <Arrow x1={xs[m.from]} y1={m.y} x2={xs[m.to] - 2 * dir} y2={m.y} dashed={m.ret} />
            <T x={cx} y={m.y - 12} anchor="middle" fs={12} mono={m.mono}>
              {m.text}
            </T>
          </g>
        )
      })}
      <Box x={145} y={304} w={180} h={44} lines={['1時間以内か確かめて換算', '古ければ StaleRateError']} fs={12} subTone="muted" />
      <T x={20} y={412} fs={12} tone="muted">
        例：約2,999円（11/20 10:00時点のレート）
      </T>
    </Svg>
  )
}

/* ---------- 図 76-3 本番とテストの組み立て ---------- */
function CompositionFigure() {
  const cols: {
    head: string
    top: string[]
    left: string[]
    right: string[]
    double?: boolean
    bottom?: { lines: string[]; dashed?: boolean }
    notes: string[]
  }[] = [
    {
      head: '本番・開発',
      top: ['config/initializers', 'rate_source.rb（to_prepare）'],
      left: ['HttpRateSource', 'config.x から'],
      right: ['Time.zone', '既定値'],
      bottom: { lines: ['為替 API'] },
      notes: ['引数を省略し、既定値で本物を使う', '本番はキーがなければ起動で止まる'],
    },
    {
      head: '単体テスト',
      top: ['price_label_spec.rb', '代役を引数で渡す'],
      left: ['instance_double', '（HttpRateSource）'],
      right: ['clock の代役', 'now だけ返す'],
      double: true,
      notes: ['通信も実際の時刻も使わない', 'PriceLabel のコードは本番と同じ'],
    },
    {
      head: 'request spec',
      top: ['products_spec.rb', 'stub_request・travel_to'],
      left: ['HttpRateSource', '本物'],
      right: ['Time.zone', 'travel_to で固定'],
      bottom: { lines: ['WebMock に', '登録した応答'], dashed: true },
      notes: ['組み立ては本番と同じ', 'HTTP の通信と時刻だけを置き換える'],
    },
  ]
  return (
    <Svg
      id="76-3"
      w={780}
      h={356}
      label="本番と開発では、config/initializers/rate_source.rb の to_prepare が HttpRateSource を作って config.x に入れ、PriceLabel は引数を省略して既定値で HttpRateSource と Time.zone を使う。HttpRateSource は為替 API と通信する。単体テストでは price_label_spec.rb が instance_double で作った HttpRateSource の代役と、now だけを返す時計の代役を引数で渡し、通信も実際の時刻も使わない。request spec では本番と同じ組み立てを使い、為替 API への通信を WebMock に登録した応答に、現在時刻を travel_to で置き換える。どの場合も PriceLabel のコードは同じ"
    >
      {cols.map((c, i) => {
        const x0 = 10 + i * 257
        const cx = x0 + 125
        return (
          <g key={c.head}>
            <T x={cx} y={20} anchor="middle" bold>
              {c.head}
            </T>
            <Box x={x0 + 5} y={36} w={240} h={44} lines={c.top} fs={12} fill="box5" subTone="muted" />
            <Arrow x1={cx} y1={80} x2={cx} y2={102} />
            <Box x={cx - 75} y={104} w={150} h={40} lines="PriceLabel" fs={12} accent />
            <Arrow x1={cx - 40} y1={144} x2={x0 + 65} y2={186} />
            <Arrow x1={cx + 40} y1={144} x2={x0 + 187} y2={186} />
            <Box x={x0 + 5} y={188} w={120} h={48} lines={c.left} fs={c.double ? 11 : 12} dashed={c.double} subTone="muted" />
            <Box x={x0 + 130} y={188} w={115} h={48} lines={c.right} fs={12} dashed={c.double} subTone="muted" />
            {c.bottom && (
              <>
                <Arrow x1={x0 + 65} y1={236} x2={x0 + 65} y2={258} />
                <Box x={x0 + 5} y={260} w={120} h={44} lines={c.bottom.lines} fs={12} fill="box4" dashed={c.bottom.dashed} />
              </>
            )}
            {c.notes.map((n, k) => (
              <T key={n} x={x0 + 5} y={322 + k * 18} fs={11} tone="muted">
                {n}
              </T>
            ))}
            {i > 0 && <line x1={x0 - 4} y1={10} x2={x0 - 4} y2={346} stroke="var(--fig-line)" strokeDasharray="3 4" />}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 76-4 テストダブルの種類 ---------- */
const doubleRows: [string, string[], string[], string[]][] = [
  ['Dummy（ダミー）', ['引数を埋めるために渡すだけ', '呼ばれない'], ['double("使われない")'], ['使っていない']],
  ['Stub（スタブ）', ['呼ばれたら決まった値を返す'], ['instance_double(HttpRateSource,', '  usd_to_jpy: rate)'], ['レートと時刻の代役']],
  ['Spy（スパイ）', ['決まった値を返し、呼ばれ方を記録する', '確かめるのは呼んだ後'], ['expect(rates)', '  .to have_received(:usd_to_jpy)'], ['1回だけ取得する']],
  ['Mock（モック）', ['呼ばれ方を先に決めておき、', 'その通りに呼ばれたかを確かめる'], ['expect(rates)', '  .to receive(:usd_to_jpy)'], ['例外を伝える']],
  ['Fake（フェイク）', ['本物と同じ取り決めで動く', '簡易な実装を持つ'], ['クラスを書く', 'Rails の :test のアダプター'], ['FakeRateSource', 'レートの更新']],
]

function TestDoublesFigure() {
  const cols = [
    { x: 10, w: 120, head: '種類' },
    { x: 130, w: 230, head: '何をするか' },
    { x: 360, w: 250, head: 'RSpec での書き方' },
    { x: 610, w: 160, head: 'この章の例' },
  ]
  const rowH = 58
  return (
    <Svg
      id="76-4"
      w={780}
      h={340}
      label={`テストダブルの5つの種類。${doubleRows.map(([k, a, b, c]) => `${k}：${a.join('')}。RSpec では ${b.join('')}。この章の例は${c.join('・')}`).join('。')}`}
    >
      {cols.map((c) => (
        <Box key={c.head} x={c.x} y={10} w={c.w} h={30} lines={c.head} fs={12} fill="box5" bold rx={0} />
      ))}
      {doubleRows.map((r, i) => {
        const y = 40 + i * rowH
        return (
          <g key={r[0]}>
            <Box x={cols[0].x} y={y} w={cols[0].w} h={rowH} lines={r[0]} fs={12} fill="box" bold rx={0} align="start" />
            <Box x={cols[1].x} y={y} w={cols[1].w} h={rowH} lines={r[1]} fs={11} fill="bg" rx={0} align="start" />
            <Box x={cols[2].x} y={y} w={cols[2].w} h={rowH} lines={r[2]} fs={11} fill="bg" rx={0} align="start" mono={i !== 4} />
            <Box x={cols[3].x} y={y} w={cols[3].w} h={rowH} lines={r[3]} fs={11} fill="bg" rx={0} align="start" />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 76-5 Dependency Injection と Service Locator ---------- */
function ServiceLocatorFigure() {
  return (
    <Svg
      id="76-5"
      w={760}
      h={250}
      label="Dependency Injection では、組み立てる場所が依存先を作り、PriceLabel は initialize の引数（既定値）で受け取る。依存先は initialize の引数でわかり、parameters は rates・clock・max_age を返す。Service Locator では、LocatorPriceLabel が render の中から Rails.configuration.x に依存先を問い合わせる。依存先はメソッドの中を読まないとわからず、parameters は空の配列を返す"
    >
      <T x={20} y={20} bold>
        Dependency Injection
      </T>
      <Box x={20} y={36} w={330} h={40} lines="config/initializers（組み立てる場所）" fs={12} fill="box5" />
      <Arrow x1={110} y1={76} x2={110} y2={118} dashed />
      <T x={122} y={98} fs={12} tone="muted">
        作って渡す（既定値で受け取る）
      </T>
      <Box x={20} y={120} w={330} h={56} lines={['PriceLabel', 'initialize(rates:, clock:, max_age:)']} fs={12} accent subTone="muted" />
      <T x={20} y={200} fs={12}>
        依存先は initialize の引数でわかる
      </T>
      <T x={20} y={222} fs={11} tone="muted" mono>
        parameters → [[:key, :rates], [:key, :clock], …]
      </T>

      <line x1={380} y1={10} x2={380} y2={240} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={400} y={20} bold>
        Service Locator
      </T>
      <Box x={400} y={36} w={340} h={40} lines="Rails.configuration.x（依存先の一覧）" fs={12} fill="box5" />
      <Arrow x1={490} y1={120} x2={490} y2={78} />
      <T x={502} y={98} fs={12} tone="muted">
        自分から問い合わせる
      </T>
      <Box x={400} y={120} w={340} h={56} lines={['LocatorPriceLabel', 'render の中で config.x から取り出す']} fs={12} subTone="danger" />
      <T x={400} y={200} fs={12} tone="danger">
        依存先はメソッドの中を読まないとわからない
      </T>
      <T x={400} y={222} fs={11} tone="muted" mono>
        parameters → []
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 40,
  part: 9,
  title: 'Dependency Injection：為替レートと現在時刻を外から渡す',
  summary:
    '商品の外貨建ての価格に円の目安を添える処理を例に、為替 API と現在時刻という依存先を、クラスの中で作らずに initialize の引数で受け取るように直します。組み立てる場所を config/initializers に置き、テストでは Stub・Spy・Mock・Fake の代役、WebMock、travel_to を層ごとに使い分けます。',
  goals: [
    '依存先をクラスの中で直接使うコードで、テストが外部への接続と現在時刻に左右される理由を説明できる',
    'キーワード引数の既定値で依存先を受け取る書き方と、コンストラクター注入・引数注入の使い分けを説明できる',
    'Rails で依存先を組み立てる場所（config/initializers の to_prepare と config.x）を書き、起動時に設定の誤りを見つけられる',
    'Dummy・Stub・Spy・Mock・Fake を区別し、RSpec の instance_double・allow・expect・have_received で書ける',
    '引数で代役を渡す方法・WebMock・travel_to を、テストの層に合わせて使い分けられる',
    'Service Locator・すべてを注入する・テストのためだけの書き換え・最初からの DI コンテナといった誤用を見分けられる',
  ],
  prerequisites: [20, 33],
  sections: [
    {
      id: 'scene',
      title: '外貨建ての価格を表示するコードと、結果が変わるテスト',
      body: (
        <>
          <p>
            この章では商品の外貨建ての価格に円の目安を添えて表示する処理を例に、Dependency Injection を扱います。<ChapterLink n={33} section="dependency-injection" />の「依存性注入：差し替える依存先を引数で受け取る」では、課金の依頼先と現在時刻を引数で受け取る Checkout を例に、書き方を短く紹介しました。この章ではその続きとして、依存先を作って渡すコードを Rails のどこに置くか、テストで渡す代役をどう選ぶか、travel_to や WebMock とどう使い分けるか、どんな使い方が誤用になるかを、動かしたコードで確かめます。
          </p>
          <h3>そもそも何を表示するのか</h3>
          <p>
            輸入雑貨を売る EC サイトを考えます。商品は米国の取引先から仕入れるので、価格を米ドルで登録しています。商品のページには米ドルの価格に加えて、「約2,999円（11/20 10:00時点のレート）」のように円に換算した目安を表示します。換算に使う為替レート（1米ドルが何円か）は、外部の為替 API から取得します。
          </p>
          <p>
            為替 API はレートを一定の間隔で更新し、応答の <code>timestamp</code> にそのレートの時点（UNIX 時間の秒）を入れて返します。次の JSON は、1米ドルが 150 円で、時点が日本時間の 2026年11月20日 10:00 の応答です。
          </p>
          <Code
            lang="json"
            title="GET https://api.rates.example/v1/latest?base=USD&symbols=JPY の応答"
            code={`
{ "base": "USD", "rates": { "JPY": 150.0 }, "timestamp": 1795136400 }
`}
          />
          <p>
            レートの時点が古いと、表示する円の目安が実際の金額から離れます。このサイトでは、現在時刻から見て60分より古いレートなら円の目安を表示しないと決めています。この処理が依存しているのは、為替 API の応答と現在時刻の2つです。
          </p>
          <p>価格は米ドルのセント単位の整数で、products テーブルの <code>price_usd_cents</code> 列に保存します。19.99 ドルなら 1999 です。</p>
          <Code
            lang="ruby"
            title="db/migrate/20261120000001_create_products.rb"
            code={`
class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.integer :price_usd_cents, null: false # 米ドルの価格（セント単位の整数）
      t.timestamps
    end
  end
end
`}
          />
          <h3>モデルに直接書いたコード</h3>
          <p>最初のコードは円の目安を作る処理を Product モデルのメソッドに書いています。</p>
          <Code
            lang="ruby"
            title="app/models/product.rb（適用前）"
            code={`
require "net/http"

class Product < ApplicationRecord
  class StaleRateError < StandardError; end

  # 米ドルの価格を、為替 API のレートで円の目安に換算した文字列を返す
  def price_label
    # ① 為替 API の URL・API キー・応答の形をモデルが直接知っている
    uri = URI("#{ENV.fetch("RATES_BASE_URL", "https://api.rates.example")}/v1/latest?base=USD&symbols=JPY")
    res = Net::HTTP.get_response(uri, { "Authorization" => "Bearer #{ENV.fetch("RATES_API_KEY")}" })
    body = JSON.parse(res.body)
    as_of = Time.zone.at(body.fetch("timestamp"))

    # ② 現在時刻をその場で読んでいる
    raise StaleRateError, "為替レートが古いため表示できません" if Time.current - as_of > 1.hour

    yen = (price_usd_cents * body.dig("rates", "JPY") / 100.0).round
    "約#{yen.to_fs(:delimited)}円（#{as_of.strftime("%-m/%-d %H:%M")}時点のレート）"
  end
end
`}
          />
          <p>
            <code>price_label</code> は為替 API の URL を組み立て、環境変数から API キーを読み、<code>Net::HTTP</code> で GET を送ります。応答の JSON からレートと時点を取り出し、<code>Time.current</code>（アプリに設定したタイムゾーンでの現在時刻）と比べて60分より古ければ例外を投げ、古くなければ円に換算します。<code>to_fs(:delimited)</code> は、数値を3桁ごとにカンマで区切る Active Support のメソッドです。
          </p>
          <p>
            このメソッドに対して、次のテストを書きました。1つ目は、テストを書いた時点で為替 API が返したレート（150円・11/20 10:00 時点）を見て期待値を決めています。2つ目は、<code>travel_to</code>（テストの間だけ現在時刻を指定した時刻に置き換える Rails のテスト用のメソッド）で現在時刻を2時間進め、古いレートを表示しないことを確かめるつもりの例です。
          </p>
          <Code
            lang="ruby"
            title="spec/models/product_spec.rb（適用前）"
            code={`
require "rails_helper"

RSpec.describe Product do
  let(:product) { Product.new(name: "Tシャツ", price_usd_cents: 1999) }

  it "米ドルの価格を円の目安で表示する" do
    # 書いた時点の為替 API の応答（150円・11/20 10:00 時点）を見て期待値を決めた
    expect(product.price_label).to eq "約2,999円（11/20 10:00時点のレート）"
  end

  it "60分より古いレートは表示しない" do
    travel_to 2.hours.from_now do
      expect { product.price_label }.to raise_error(Product::StaleRateError)
    end
  end
end
`}
          />
          <h3>テストを実行すると</h3>
          <p>
            本物の為替 API の代わりに、同じ形の JSON を返す検証用のサーバーを同じコンテナで動かし、環境変数 <code>RATES_BASE_URL</code> でそちらに向けました。このサーバーは実際の API に合わせて、応答に 0.7 秒かかり、レートは呼ばれるたびに少し変わり、時点は10分ごとに更新されます。受け取ったリクエストを <code>[為替 API]</code> の行で表示します。同じテストを続けて2回実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（RATES_BASE_URL=http://127.0.0.1:4567 RATES_API_KEY=k-123 bundle exec rspec spec/models/product_spec.rb を2回）"
            code={`
== 1回目
[為替 API] GET /v1/latest?base=USD&symbols=JPY HTTP/1.1 → JPY=150.28
F[為替 API] GET /v1/latest?base=USD&symbols=JPY HTTP/1.1 → JPY=150.06
.

  1) Product 米ドルの価格を円の目安で表示する
     Failure/Error: expect(product.price_label).to eq "約2,999円（11/20 10:00時点のレート）"

       expected: "約2,999円（11/20 10:00時点のレート）"
            got: "約3,004円（11/20 23:10時点のレート）"

Finished in 1.44 seconds (files took 1.91 seconds to load)
2 examples, 1 failure

== 2回目
[為替 API] GET /v1/latest?base=USD&symbols=JPY HTTP/1.1 → JPY=150.17
F[為替 API] GET /v1/latest?base=USD&symbols=JPY HTTP/1.1 → JPY=149.74
.

  1) Product 米ドルの価格を円の目安で表示する
       expected: "約2,999円（11/20 10:00時点のレート）"
            got: "約3,002円（11/20 23:10時点のレート）"

Finished in 1.44 seconds (files took 0.80385 seconds to load)
2 examples, 1 failure
`}
          />
          <p>
            2回とも、1つ目の例が失敗しました。円の金額はレートが変わるたびに変わり、時点の表示も10分ごとに変わるので、期待値を固定した例はほとんどの場合に失敗します。2つ目の例は通りましたが、これは travel_to で進めた現在時刻と、サーバーが返した時点との差が60分を超えたからです。サーバーの記録が示すとおり、2つの例はどちらも為替 API に接続しており、2つの例で 1.44 秒かかっています。
          </p>
          <p>
            次に、API キーを設定しない場合と、為替 API に接続できない場合を実行しました。後者は <code>RATES_BASE_URL</code> を外し、既定の api.rates.example の名前を解決できない環境で実行しています。
          </p>
          <Code
            lang="text"
            title="実行結果（失敗の行だけを抜き出した）"
            code={`
== API キーを設定していない
     KeyError:
       key not found: "RATES_API_KEY"
2 examples, 2 failures

== 為替 API に接続できない（RATES_API_KEY=k-123）
     Socket::ResolutionError:
       Failed to open TCP connection to api.rates.example:443 (getaddrinfo(3): Name or service not known)
2 examples, 2 failures
`}
          />
          <p>どちらも2つの例が両方とも失敗しました。テストの結果が、環境変数の有無と外部へ接続できるかどうかで決まっています。</p>
          <p>API キーを設定し忘れたときに困るのは、テストだけではありません。開発環境で API キーを設定せずに起動し、商品の円の目安を作りました。</p>
          <Code
            lang="text"
            title={'実行結果（RAILS_ENV=development bin/rails runner \'puts "起動しました"; puts Product.first.price_label\'）'}
            code={`
起動しました
/work/ch40/app/models/product.rb:10:in 'fetch': key not found: "RATES_API_KEY" (KeyError)
`}
          />
          <p>アプリは問題なく起動し、最初に price_label を呼んだときに KeyError になりました。本番の環境でも同じで、設定の漏れは、利用者が最初に商品のページを開いたときに見つかります。</p>
          <h3>このコードの問題</h3>
          <ul>
            <li>テストの結果が、為替 API の応答（レートと時点）と現在時刻で変わります。換算の結果を決まった値で確かめられないので、期待値を正規表現にゆるめるか、テストを書かないことになります。</li>
            <li>テストのたびに外部に接続します。接続ごとに応答を待つので遅く、外部に接続できない CI では失敗します。利用の回数で課金される API なら、テストを実行するたびに費用もかかります。</li>
            <li>「60分より古いレートは表示しない」という規則を確かめるには、為替 API が古い時点を返す状況が必要です。本物の API の応答は選べないので、travel_to で現在時刻を動かすしかなく、それでも外部への接続は残ります。</li>
            <li>為替 API の URL・API キーの読み方・応答の形を、Product が直接知っています。API の提供元を替えると、価格の表示と関係のない部分を直すために Product を開くことになります。</li>
            <li>API キーの設定の漏れが、起動したときではなく、最初に表示したときに見つかります。</li>
          </ul>
          <p>これらの問題は、Product が使う相手（為替 API と時計）を、Product の中で直接用意していることから起きています。次の節で、依存先を外から受け取る考え方を説明します。</p>
        </>
      ),
    },
    {
      id: 'idea',
      title: '依存先を外から受け取る：Dependency Injection の考え方',
      body: (
        <>
          <h3>目的</h3>
          <p>
            クラスやメソッドが処理に使う別のオブジェクト（HTTP クライアント、DB への接続、時計など）を、そのクラスの<Term en="dependency">依存先</Term>と呼びます。適用前の price_label の依存先は、<code>Net::HTTP</code>、環境変数を読む <code>ENV</code>、現在時刻を返す <code>Time.current</code> です。<Term en="Dependency Injection">Dependency Injection</Term>（依存性の注入、以下 DI）は、依存先を使う側の中で作らずに、外から受け取るようにするパターンです。どの実装をどの設定で作るかを決める処理（依存先の生成）と、受け取った依存先を使って仕事をする処理（依存先の利用）を、別の場所に分けます。
          </p>
          <p>
            「注入」という言葉は特別な仕組みのように聞こえますが、やることは依存先をコンストラクター（Ruby では <code>initialize</code>）やメソッドの引数で渡すことです。この名前は Martin Fowler が2004年の記事で付けたものです。当時、依存先を作って渡す処理を受け持つライブラリは「Inversion of Control コンテナ」と呼ばれていて、Fowler はその支持者たちとの議論を経て、このパターンを Dependency Injection と名付けました<Ref n={1} />。Fowler は同じ記事で、重要なのはサービスの構成（どの実装を使うかの設定）をサービスの利用から分けることだと述べています<Ref n={1} />。ここでのサービスは、クラスが使う依存先のことです。
          </p>
          <p>DI を使う理由は次の3つです。</p>
          <ul>
            <li>テストで依存先を代役に替えられます。外部に接続せず、実際の時刻にも左右されないテストを書けます。</li>
            <li>依存先の実装を替えても、使う側のコードを変えずに済みます。為替 API の提供元を替えるときに、価格を表示するクラスを直さなくてよくなります。</li>
            <li>どの実装を使うか、どの設定（URL・API キー）で作るかを1か所にまとめられます。設定の誤りをアプリの起動時に見つけられます。</li>
          </ul>
          <h3>使う場面</h3>
          <p>
            DI を使うのは、クラスが自分の外にあるもの（外部の API、メールの送信、ファイル、時計、乱数、環境変数）を使う場合です。これらはテストと本番で、あるいは環境ごとに差し替えたいものです。典型的な使い方は次のとおりです。
          </p>
          <ul>
            <li>外部の API の HTTP クライアントを、テストでは決まった応答を返す代役に替える</li>
            <li>現在時刻を、テストでは固定した時刻に替える</li>
            <li>全文検索のエンジンを、開発環境では簡易な実装に替える</li>
          </ul>
          <p>Rails のコードに次の兆候があれば、DI が必要になっているかもしれません。</p>
          <ul>
            <li>モデルやサービスの中で、<code>Net::HTTP</code> や <code>Faraday.new</code> を直接呼んでいる</li>
            <li>業務の判断に使う <code>Time.current</code>・<code>Date.current</code>・<code>SecureRandom</code>・<code>ENV</code> を、メソッドの中で直接読んでいる</li>
            <li>テストを書くために、<code>allow(Net::HTTP).to receive(...)</code> や <code>allow_any_instance_of</code> で、クラスのメソッドをテストの間だけ書き換えている</li>
            <li><code>if Rails.env.test?</code> のような「本番なら A、テストなら B」という分岐が、業務のコードにある</li>
          </ul>
          <h3>設計上の制約</h3>
          <p>DI を設計するときは、次の要求が対立します。</p>
          <ul>
            <li>使う側は簡単に使いたい。<code>PriceLabel.new</code> と書くだけで動く方が楽です。一方、依存先を外から渡すようにすると、使うたびに依存先を用意する必要があります。</li>
            <li>依存先を明示したい。initialize の引数を見れば、そのクラスが何を使うかがわかるようにしたい。一方、依存先が多いと引数の並びが長くなります。</li>
            <li>組み立てを1か所に集めたい。一方、組み立てのコードが使う場所から離れると、本番でどの実装が使われているかを追う手間が増えます。</li>
            <li>依存先との取り決めを明示したい。一方、Ruby にはインターフェースを宣言する構文がありません。取り決めを確かめる手段を、コメントとテスト（後で説明する instance_double）で用意する必要があります。</li>
          </ul>
          <h3>解決方法</h3>
          <p>DI は次の4つの要素で組み立てます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">この章の例</th>
                  <th scope="col">責務</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">依存先を使う側</th>
                  <td>PriceLabel</td>
                  <td>受け取った依存先を使って、円の目安の文字列を作る。依存先を作らない</td>
                </tr>
                <tr>
                  <th scope="row">依存先の取り決め</th>
                  <td><code>usd_to_jpy</code> に応答して ExchangeRate を返す。<code>now</code> に応答して現在時刻を返す</td>
                  <td>使う側が依存先に求めるメソッドを決める。Ruby ではインターフェースを宣言せず、「このメソッドに応答する」という約束で表す</td>
                </tr>
                <tr>
                  <th scope="row">依存先の実装</th>
                  <td>HttpRateSource、Time.zone</td>
                  <td>取り決めを満たす具体的な実装。為替 API の URL と応答の形を知っているのは HttpRateSource だけ</td>
                </tr>
                <tr>
                  <th scope="row">組み立てる場所</th>
                  <td><code>config/initializers/rate_source.rb</code></td>
                  <td>設定を読み、依存先の実装を作り、使う側に渡す</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            依存の向きにも注目します。適用前は、価格を表示する Product が為替 API との通信という細部に直接依存していました。適用後は、PriceLabel も HttpRateSource も「<code>usd_to_jpy</code> に応答して ExchangeRate を返す」という取り決めに依存します。Robert C. Martin は1996年に、この形を<Term en="Dependency Inversion Principle">依存性逆転の原則</Term>として「上位のモジュールは下位のモジュールに依存してはならない。どちらも抽象に依存すべきである」とまとめました<Ref n={7} />。この章の例では、上位のモジュールが PriceLabel、下位のモジュールが為替 API と通信する HttpRateSource、抽象が取り決めです。DI はこの原則に沿った構造を作る具体的な方法の1つです。
          </p>
          <h3>依存先の渡し方</h3>
          <p>Fowler は依存先の渡し方として、コンストラクター注入・セッター注入・インターフェース注入の3つを挙げています<Ref n={1} />。この章では次の3つを使い分けます。</p>
          <ul>
            <li>
              <Term en="constructor injection">コンストラクター注入</Term>：initialize の引数で受け取ります。オブジェクトが動くのに必ず必要な依存先に使います。作った時点ですべてそろうので、使える状態のオブジェクトだけが存在します。この章の基本の方法です。
            </li>
            <li>
              <Term en="method injection">引数注入</Term>：メソッドの引数で受け取ります。呼び出しのたびに変わるものや、1つのメソッドでしか使わないものに使います。たとえば、集計のメソッドに基準の時刻を <code>now:</code> で渡す場合です。
            </li>
            <li>
              既定値を使った注入：キーワード引数に既定値を付け、省略したときは本物の実装を使います。PriceLabel の <code>clock: Time.zone</code> がこの形です。使う側は <code>PriceLabel.new</code> と書くだけで使え、テストでは差し替えられます。ただし、使う側のコードに本物の実装の名前が残ります。
            </li>
          </ul>
          <p>
            セッター注入（オブジェクトを作った後で、<code>attr_writer</code> などのメソッドで依存先を設定する）は使いません。依存先が設定される前のオブジェクトが存在できてしまい、作った後でも依存先を書き換えられるからです。書き換えられる依存先がテストでどう問題になるかは、「よくある誤用」の節で実行して確かめます。
          </p>
          <h3>組み立てる場所</h3>
          <p>
            依存先を作って渡すコードは、アプリの起動時に1か所でまとめて実行します。Mark Seemann はこの場所を<Term en="Composition Root">Composition Root</Term>と名付け、「アプリケーションの中で、モジュールを組み合わせる（できれば）唯一の場所」と定義しています<Ref n={5} />。Rails のアプリでは、起動時に読み込まれる config/initializers のファイルがこの場所になります。書き方は「Rails での実装」の節で示します。
          </p>
          <h3>構造</h3>
          <p>
            図 76-1 は適用前と適用後の依存の向きです。適用前の Product#price_label は、Net::HTTP・ENV・Time.current を中で直接使っています。適用後の PriceLabel が使うのは2つの取り決めだけで、為替 API を知っているのは HttpRateSource だけです。組み立てる場所が HttpRateSource を作り、PriceLabel は引数の既定値でそれを受け取ります。
          </p>
          <Figure n="76-1" title="適用前と適用後の依存の向き" caption="破線の箱は Ruby では宣言しない取り決め（応答するメソッド）。破線の矢印は、実装が取り決めを満たすことを表す。">
            <DependenciesFigure />
          </Figure>
          <p>
            図 76-2 は商品のページで円の目安を作るときの処理の流れです。PriceLabel は rates から ExchangeRate（レートと時点）を受け取り、clock から現在時刻を受け取って、レートが1時間以内かを確かめてから円に換算します。PriceLabel は、レートが為替 API から来たのか、テストの代役から来たのかを区別しません。
          </p>
          <Figure n="76-2" title="価格を表示するときのシーケンス" caption="破線の矢印は戻り値。">
            <SequenceFigure />
          </Figure>
          <p>
            図 76-3 は本番とテストでの組み立ての違いです。本番では、組み立てる場所が HttpRateSource を作り、PriceLabel は既定値でそれと Time.zone を使います。単体テストでは、テストのコードが代役を引数で渡します。request spec（HTTP のリクエストを送り、コントローラーからビューまでを通すテスト）では、本番と同じ組み立てを使い、外部への HTTP の通信と現在時刻だけを置き換えます。どの場合も PriceLabel のコードは同じです。
          </p>
          <Figure n="76-3" title="本番とテストの組み立て" caption="模式図。破線の箱は代役、または WebMock が返す応答。">
            <CompositionFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装：PriceLabel・HttpRateSource・組み立てる場所',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  models/product.rb                  # price_label を取り除く
  models/exchange_rate.rb            # レートと時点の値（新規）
  clients/http_rate_source.rb        # 為替 API との通信（新規）
  services/price_label.rb            # 円の目安を作る（新規）
  controllers/products_controller.rb
  views/products/show.html.erb
config/
  initializers/rate_source.rb        # 組み立てる場所（新規）
spec/
  services/price_label_spec.rb
  clients/http_rate_source_spec.rb
  requests/products_spec.rb
  config/rate_source_spec.rb
  support/fake_rate_source.rb
`}
          />
          <p>
            app/ の下のディレクトリは、Rails が自動で読み込む対象（オートロードのパス）になります。app/clients のように新しく作ったディレクトリも、設定を足さずに使えます。外部のサービスと通信するクラスを app/clients に置くのはこの章の決めごとで、Rails の決まりではありません。
          </p>
          <h3>レートを表す値</h3>
          <Code
            lang="ruby"
            title="app/models/exchange_rate.rb"
            code={`
# 1米ドルあたりの円と、そのレートの時点
ExchangeRate = Data.define(:jpy_per_usd, :as_of)

# レートの取得元が、レートを取得できないときに投げる例外
class ExchangeRate::Unavailable < StandardError; end
`}
          />
          <p>
            ExchangeRate は1米ドルあたりの円（<code>jpy_per_usd</code>）と、そのレートの時点（<code>as_of</code>）の組です。Ruby の <code>Data.define</code> は、指定した名前の値を持ち、作った後に値を変えられないクラスを作ります。同じ値を持つ2つの ExchangeRate は <code>==</code> で等しくなるので、テストで期待値と比べられます。値を表すクラスの設計は<ChapterLink n={46} section="idea" />（Value Object）で扱います。
          </p>
          <p>
            <code>ExchangeRate::Unavailable</code> は、レートの取得元がレートを取得できないときに投げる例外です。この例外を ExchangeRate の下に置いたので、PriceLabel やコントローラーは HttpRateSource を知らずにこの例外を rescue できます。
          </p>
          <h3>為替 API との通信</h3>
          <Code
            lang="ruby"
            title="app/clients/http_rate_source.rb"
            code={`
require "net/http"

# 為替 API からレートを取得する。URL・API キー・応答の形を知っているのはこのクラスだけ
class HttpRateSource
  def initialize(base_url:, api_key:)
    @uri = URI("#{base_url}/v1/latest?base=USD&symbols=JPY")
    @api_key = api_key
  end

  def usd_to_jpy
    # 待ち時間を短くし、GET の自動の再送（既定で1回）をしない
    res = Net::HTTP.start(@uri.host, @uri.port, use_ssl: @uri.scheme == "https",
                          open_timeout: 2, read_timeout: 3, max_retries: 0) do |http|
      http.get(@uri.request_uri, { "Authorization" => "Bearer #{@api_key}" })
    end
    raise ExchangeRate::Unavailable, "為替レートを取得できません（HTTP #{res.code}）" unless res.is_a?(Net::HTTPSuccess)

    body = JSON.parse(res.body)
    ExchangeRate.new(jpy_per_usd: body.dig("rates", "JPY"), as_of: Time.zone.at(body.fetch("timestamp")))
  rescue Timeout::Error, SocketError, SystemCallError => e
    raise ExchangeRate::Unavailable, "為替レートを取得できません（#{e.class}）"
  end
end
`}
          />
          <p>
            為替 API の URL・API キーの渡し方・応答の形を知っているのは、このクラスだけです。応答を ExchangeRate に変換し、HTTP のエラーと、接続・タイムアウトの失敗（<code>Timeout::Error</code>・<code>SocketError</code>・<code>SystemCallError</code>）を <code>ExchangeRate::Unavailable</code> に変えます。
          </p>
          <p>
            Net::HTTP の接続と読み取りの待ち時間は、既定ではどちらも60秒です。また、GET のような冪等なリクエストが読み取りのタイムアウトなどで失敗すると、既定で1回だけ自動で再送します（<code>max_retries</code> の既定値は 1）<Ref n={18} /><Ref n={19} />。応答に4秒かかる検証用のサーバーに対して測ると、<code>read_timeout: 3</code> だけを指定したときは失敗とわかるまでに 6.0 秒かかり、<code>max_retries: 0</code> も指定すると 3.0 秒でした。円の目安のために商品のページの表示が何秒も止まらないよう、両方を指定しています。タイムアウトの決め方は<ChapterLink n={25} section="timeouts" />で扱いました。
          </p>
          <p>
            MSDP の Ruby の例では、HttpRateSource も <code>http:</code> の引数で Net::HTTP を受け取り、テストで <code>class_double</code> に替えています。この章では受け取りません。HttpRateSource のテストは、HTTP の通信そのものを置き換える WebMock で書けるからです（「テストと動作の確認」の節）。依存先を引数で受け取るかどうかは、差し替える理由が実際にあるかで決めます。
          </p>
          <h3>依存先を受け取る PriceLabel</h3>
          <Code
            lang="ruby"
            title="app/services/price_label.rb"
            code={`
class PriceLabel
  class StaleRateError < StandardError; end

  # rates: usd_to_jpy に応答して ExchangeRate を返すオブジェクト
  # clock: now に応答するオブジェクト
  def initialize(rates: Rails.configuration.x.rate_source, clock: Time.zone, max_age: 1.hour)
    @rates = rates
    @clock = clock
    @max_age = max_age
  end

  def render(usd_cents)
    rate = @rates.usd_to_jpy
    raise StaleRateError, "為替レートが古いため表示できません" if @clock.now - rate.as_of > @max_age

    yen = (usd_cents * rate.jpy_per_usd / 100.0).round
    "約#{yen.to_fs(:delimited)}円（#{rate.as_of.strftime("%-m/%-d %H:%M")}時点のレート）"
  end
end
`}
          />
          <p>PriceLabel は initialize のキーワード引数で、レートの取得元 <code>rates</code> と時計 <code>clock</code> を受け取ります。どちらも既定値を持つので、コントローラーからは <code>PriceLabel.new</code> と書くだけで使えます。</p>
          <ul>
            <li><code>rates</code> の既定値は、組み立てる場所で作った <code>Rails.configuration.x.rate_source</code> です。</li>
            <li>
              <code>clock</code> の既定値は <code>Time.zone</code> です。Time.zone は、アプリに設定したタイムゾーン（この章では Tokyo）を表す ActiveSupport::TimeZone のオブジェクトで、<code>now</code> に応答してそのタイムゾーンの現在時刻を返します。
            </li>
            <li>
              キーワード引数の既定値は、クラスを定義したときではなく、メソッドを呼び出すたびに評価されます<Ref n={16} />。<code>PriceLabel.new</code> のたびに、その時点の config.x.rate_source と Time.zone を読みます。
            </li>
          </ul>
          <p>
            Ruby では取り決めをインターフェースとして宣言しません。<code>rates</code> は <code>usd_to_jpy</code> に応答して ExchangeRate を返すオブジェクトなら何でもよく、<code>clock</code> は <code>now</code> に応答するオブジェクトなら何でもよい、という取り決めをコメントで示しています。PriceLabel の中には、Net::HTTP・ENV・HttpRateSource の名前がありません。
          </p>
          <p>
            換算には Float を使っています。ここで作るのは「約」を付けた表示用の目安なので、端数の扱いを厳密に決めていません。請求する金額のように端数の扱いが決まっている計算では、金額を最小単位の整数で持ちます（<ChapterLink n={46} section="money" />）。
          </p>
          <h3>組み立てる場所</h3>
          <Code
            lang="ruby"
            title="config/initializers/rate_source.rb"
            code={`
# 為替レートの取得元を組み立てる（Rails での Composition Root の1つ）。
# app/ のクラスは開発中に再読み込みされるので、読み込みのたびに実行される to_prepare の中で作る
Rails.application.config.to_prepare do
  # 本番では API キーがなければ起動時に KeyError で止める。
  # 開発とテストでは本物の API に接続しないので、キーがなくても起動できるようにする
  api_key = Rails.env.production? ? ENV.fetch("RATES_API_KEY") : ENV.fetch("RATES_API_KEY", "")

  Rails.configuration.x.rate_source = HttpRateSource.new(
    base_url: ENV.fetch("RATES_BASE_URL", "https://api.rates.example"),
    api_key:
  )
end
`}
          />
          <p>
            Rails は、config/initializers のファイルをアプリの起動時に読み込みます。<code>Rails.configuration.x</code> はアプリ独自の設定を入れておく場所で、<code>config.x.rate_source = …</code> と書いた値を <code>Rails.configuration.x.rate_source</code> で読めます<Ref n={8} />。この章では、組み立てた HttpRateSource をここに入れます。
          </p>
          <p>HttpRateSource を to_prepare のブロックの中で作っているのは、app/ の下のクラスを initializer で直接参照できないからです。to_prepare を使わずに次のように書くと、起動の時点でエラーになります。</p>
          <Code
            lang="ruby"
            title="config/initializers/rate_source.rb（to_prepare を使わない場合）"
            code={`
Rails.configuration.x.rate_source = HttpRateSource.new(
  base_url: ENV.fetch("RATES_BASE_URL", "https://api.rates.example"),
  api_key: ENV.fetch("RATES_API_KEY", "")
)
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner 'p Rails.configuration.x.rate_source.class'）"
            code={`
/work/ch40/config/initializers/rate_source.rb:1:in '<top (required)>': uninitialized constant HttpRateSource (NameError)

Rails.configuration.x.rate_source = HttpRateSource.new(
                                    ^^^^^^^^^^^^^^
`}
          />
          <p>
            Rails Guides は、initializer は起動時に1回しか実行されないので、再読み込みされるクラスを使うと編集が反映されない古いクラスを持ち続けることになり、そのため初期化の間に参照することを禁止していると説明しています。Rails 7 からは、この参照は NameError になります<Ref n={9} />。to_prepare のブロックは、起動時と、開発環境でコードを再読み込みするたびに実行されます<Ref n={8} />。再読み込みのたびに HttpRateSource を作り直すので、config.x.rate_source が古いクラスのオブジェクトを持ち続けることはありません。なお Rails Guides は、to_prepare のブロックは2回実行される場合があるので、中の処理は何回実行しても同じ結果になるように書くよう求めています<Ref n={9} />。この initializer は config.x に代入するだけなので、2回実行されても結果は変わりません。
          </p>
          <p>
            本番の環境では、API キーがなければ ENV.fetch が KeyError を投げます。to_prepare のブロックは起動の手順の中で一度実行されるので（railties の finisher.rb の <code>run_prepare_callbacks</code><Ref n={10} />）、設定の漏れは起動の時点で見つかります。production の環境で rails runner を実行しました。
          </p>
          <Code
            lang="text"
            title={'実行結果（RAILS_ENV=production SECRET_KEY_BASE_DUMMY=1 bin/rails runner \'puts "起動しました"\'。from の行は省略）'}
            code={`
== API キーなし
/work/ch40/config/initializers/rate_source.rb:6:in 'fetch': key not found: "RATES_API_KEY" (KeyError)

== API キーあり（RATES_API_KEY=k-123。p Rails.configuration.x.rate_source.class も実行）
起動しました
HttpRateSource
`}
          />
          <p>
            API キーがない場合は initializer の6行目の KeyError で起動が止まり、ある場合は起動して HttpRateSource が組み立てられました。開発とテストの環境では本物の API に接続しないので、キーがなくても起動できるようにしています。
          </p>
          <h3>コントローラーとビュー</h3>
          <Code
            lang="ruby"
            title="app/controllers/products_controller.rb"
            code={`
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])
    @price_label = PriceLabel.new.render(@product.price_usd_cents)
  rescue PriceLabel::StaleRateError, ExchangeRate::Unavailable => e
    Rails.logger.warn("円の目安を表示できません: #{e.message}")
    @price_label = nil
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/products/show.html.erb"
            code={`
<h1><%= @product.name %></h1>
<p>US$<%= number_with_precision(@product.price_usd_cents / 100.0, precision: 2) %></p>
<p><%= @price_label || "円の目安は現在表示できません" %></p>
`}
          />
          <p>
            コントローラーは、依存先を指定せずに <code>PriceLabel.new</code> で使います。レートが古い場合と取得できない場合は、ログに残して円の目安を表示せず、商品のページそのものは表示します。円の目安は補足の情報なので、為替 API の障害で商品のページまでエラーにしないためです。
          </p>
          <h3>Rails で依存先を組み立てる場所</h3>
          <p>
            Rails のアプリには、MSDP の Ruby の例の <code>App.build_price_label</code> のような、起動時に1回だけ呼ぶ関数がありません。依存先を組み立てる場所の候補は次のとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">場所</th>
                  <th scope="col">向いている依存先</th>
                  <th scope="col">注意すること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">config/initializers と config.x</th>
                  <td>アプリ全体で1つを共有する外部サービスのクライアント</td>
                  <td>app/ のクラスは to_prepare の中で作る。スレッドの間で共有されるので、リクエストごとの状態を持たせない</td>
                </tr>
                <tr>
                  <th scope="row">config/application.rb・config/environments/*.rb</th>
                  <td>URL・タイムアウトなど、環境ごとに変わる値</td>
                  <td>app/ のクラスは参照できない。値だけを置き、オブジェクトは initializer で作る</td>
                </tr>
                <tr>
                  <th scope="row">コントローラー</th>
                  <td>リクエストごとに変わる依存先（ログイン中の利用者の通貨など）</td>
                  <td>複数のコントローラーに同じ組み立てを書き写し始めたら、initializer か、組み立てるメソッドに移す</td>
                </tr>
                <tr>
                  <th scope="row">ジョブ</th>
                  <td>そのジョブの中だけで使う依存先</td>
                  <td>ジョブの引数には ID などの値だけを渡し、依存先のオブジェクトはジョブの中で組み立てる（<ChapterLink n={18} section="job-basics" />）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Rails 自身も、同じ形で環境ごとに実装を選んでいます。この章のアプリの config/environments/test.rb には <code>config.active_job.queue_adapter = :test</code> と <code>config.action_mailer.delivery_method = :test</code> があり、テストの環境では、ジョブを実行せずに記録するアダプターと、メールを送らずに記録する配信方法が使われます。ジョブやメールを使う側のコードは、どの実装が使われるかを知りません。どの実装を使うかの設定を、使う側から分けるという DI の考え方と同じです。
          </p>
          <h3>適用前のコードから直していく順序</h3>
          <p>適用前から適用後へは、次の順に小さく変更します。各段階の終わりにテストを実行し、動作が変わっていないことを確かめます。</p>
          <ol>
            <li>換算の処理を PriceLabel に移す：Product#price_label の中身をそのまま app/services/price_label.rb の render に移し、Product#price_label は <code>PriceLabel.new.render(price_usd_cents)</code> を呼ぶだけにします。呼び出し元は変えません。</li>
            <li>時計を受け取る：<code>initialize(clock: Time.zone)</code> を加え、<code>Time.current</code> を <code>@clock.now</code> に置き換えます。既定値があるので PriceLabel を作るコードは変えなくてよく、この段階で60分の境界のテストを固定した時刻で書けます。</li>
            <li>為替 API との通信を移す：Net::HTTP の呼び出しと応答の変換を、そのまま HttpRateSource#usd_to_jpy に移します。PriceLabel は、まだ中で HttpRateSource.new を呼んでいてかまいません。</li>
            <li>引数で受け取る：<code>rates:</code> を加え、PriceLabel から Net::HTTP・ENV・HttpRateSource の名前を消します。HttpRateSource を作る処理は config/initializers/rate_source.rb に移し、既定値を <code>Rails.configuration.x.rate_source</code> にします。</li>
            <li>テストを書き換える：Product の spec を、代役を渡す PriceLabel の spec と、WebMock を使う HttpRateSource の spec に分けます。最後に Product#price_label を消し、コントローラーから PriceLabel を呼びます。</li>
          </ol>
          <p>段階 1〜3 ではまだ PriceLabel が中で為替 API に接続するので、段階 2 で書いた時刻のテストもレートの取得では本物の API に接続します。外部に接続しないテストになるのは段階 4 からです。</p>
        </>
      ),
    },
    {
      id: 'test-doubles',
      title: 'テストダブルの種類と RSpec での書き方',
      body: (
        <>
          <h3>5種類のテストダブル</h3>
          <p>
            テストで依存先の代わりに渡すオブジェクトを<Term en="test double">テストダブル</Term>（テスト用の代役）と呼びます。Fowler は Gerard Meszaros の分類に従って、テストダブルを Dummy・Stub・Spy・Mock・Fake の5種類に分けています<Ref n={2} /><Ref n={4} />。図 76-4 は、それぞれの働きと、RSpec での書き方、この章のテストでの例をまとめたものです。
          </p>
          <Figure n="76-4" title="テストダブルの種類" caption="Fowler の TestDouble の説明をもとに、RSpec の書き方とこの章の例を加えた。">
            <TestDoublesFigure />
          </Figure>
          <p>
            5つの違いは、代役が何をするかと、テストが何を確かめるかにあります。Stub と Fake は、テストに必要な値を返すために使います。Spy と Mock は、代役がどう呼ばれたかをテストで確かめるために使います。Dummy は何もしません。
          </p>
          <h3>Stub：決まった値を返す</h3>
          <p>
            RSpec の <code>instance_double</code> は、指定したクラスのインスタンスの代役を作ります。<code>instance_double(HttpRateSource, usd_to_jpy: rate)</code> と書くと、usd_to_jpy を呼ばれたら rate を返す代役になります。作った後で <code>allow(rates).to receive(:usd_to_jpy).and_return(rate)</code> と書いても同じです。
          </p>
          <p>
            instance_double は<Term en="verifying double">検証付きのダブル</Term>の1つで、代役に設定したメソッドが本物のクラスにあるか、渡した引数の数が本物のメソッドに合うかを確かめます<Ref n={12} /><Ref n={13} />。HttpRateSource の usd_to_jpy を latest という名前に変え、PriceLabel を直し忘れた状態で、<code>double</code>（検証しないダブル）と instance_double の2つのテストを実行しました。
          </p>
          <Code
            lang="ruby"
            title="検証用の spec（HttpRateSource#usd_to_jpy を latest に変えた状態で実行）"
            code={`
it "double で作った代役" do
  rates = double("rates", usd_to_jpy: rate)
  expect(described_class.new(rates:, clock:).render(1999)).to start_with "約2,999円"
end

it "instance_double で作った代役" do
  rates = instance_double(HttpRateSource, usd_to_jpy: rate)
  expect(described_class.new(rates:, clock:).render(1999)).to start_with "約2,999円"
end
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
PriceLabel
  double で作った代役
  instance_double で作った代役 (FAILED - 1)

Failures:

  1) PriceLabel instance_double で作った代役
     Failure/Error: rates = instance_double(HttpRateSource, usd_to_jpy: rate)
       the HttpRateSource class does not implement the instance method: usd_to_jpy

2 examples, 1 failure
`}
          />
          <p>
            double で作った代役は usd_to_jpy に応答するので、テストは通りました。しかし本番では、PriceLabel が HttpRateSource にないメソッドを呼んで NoMethodError になります。instance_double は、HttpRateSource に usd_to_jpy がないことを、代役を作る時点で見つけました。引数の数も確かめるので、名前を戻した状態で <code>allow(rates).to receive(:usd_to_jpy).with(:today)</code> のように引数を付けると、「Wrong number of arguments. Expected 0, got 1.」で失敗しました。
          </p>
          <p>
            ただし、検証付きのダブルが確かめるのは、指定したクラスが定義されている場合だけです<Ref n={12} />。Rails のアプリでは、<code>instance_double(HttpRateSource)</code> のように定数で書けば、そのクラスがオートロードで読み込まれるので確かめられます。また、確かめるのはメソッドの名前と引数だけで、本物の為替 API がどんな JSON を返すかは確かめません。応答の形は HttpRateSource のテストで確かめます。
          </p>
          <h3>Spy と Mock：確かめるのは呼んだ後か、先か</h3>
          <p>
            Spy は、Stub の働きに加えて、どう呼ばれたかを記録する代役です。RSpec では、allow や instance_double で受け取るメソッドを設定した代役に対して、呼んだ後で <code>expect(rates).to have_received(:usd_to_jpy).once</code> のように書きます<Ref n={14} />。
          </p>
          <p>
            Mock は、どう呼ばれるべきかを先に決めておき、その通りに呼ばれたかを確かめる代役です。RSpec では、呼ぶ前に <code>expect(rates).to receive(:usd_to_jpy).once</code> と書きます。例の終わりまでに設定どおりに呼ばれなければ、その例は失敗します。
          </p>
          <Code
            lang="ruby"
            title="spec/services/price_label_spec.rb（Spy と Mock の例）"
            code={`
it "表示のたびにレートを1回だけ取得する（Spy：呼ばれた後で確かめる）" do
  described_class.new(rates:, clock: clock_at("2026-11-20 10:30")).render(500)

  expect(rates).to have_received(:usd_to_jpy).once
end

it "取得元の例外は呼び出し元にそのまま伝える（Mock：呼ばれ方を先に決める）" do
  rates = instance_double(HttpRateSource)
  expect(rates).to receive(:usd_to_jpy).once.and_raise(ExchangeRate::Unavailable)

  label = described_class.new(rates:, clock: clock_at("2026-11-20 10:30"))

  expect { label.render(500) }.to raise_error(ExchangeRate::Unavailable)
end
`}
          />
          <p>
            戻り値や例外のような結果を確かめるテストを<Term en="state verification">状態の検証</Term>、依存先がどう呼ばれたかを確かめるテストを<Term en="behavior verification">振る舞いの検証</Term>と呼びます<Ref n={3} />。振る舞いの検証は、呼び出し方を変えるだけのリファクタリングでも失敗しやすくなります。たとえば render の中でレートを2回読むように書き換えると、表示の結果が同じでも <code>once</code> の検証は失敗します。振る舞いの検証は、「表示のたびに為替 API を1回だけ呼ぶ」（API に回数の制限がある場合など）のように、呼び出し方そのものが仕様である場合に限って使います。
          </p>
          <h3>Fake：簡易な実装を持つ代役</h3>
          <p>
            Fake は、本物と同じ取り決めで動く簡易な実装を持つ代役です。次の FakeRateSource は、<code>publish</code> で公開されたレートをメモリーに持ち、usd_to_jpy で最後に公開されたレートを返します。まだ公開されていなければ、本物と同じく ExchangeRate::Unavailable を投げます。
          </p>
          <Code
            lang="ruby"
            title="spec/support/fake_rate_source.rb"
            code={`
# Fake：本物と同じ取り決めで動く簡易な実装。最後に公開されたレートをメモリーに持つ
class FakeRateSource
  def publish(jpy_per_usd:, as_of:)
    @latest = ExchangeRate.new(jpy_per_usd:, as_of:)
  end

  def usd_to_jpy
    @latest or raise ExchangeRate::Unavailable, "まだレートが公開されていません"
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/services/price_label_spec.rb（Fake の例）"
            code={`
it "レートが更新されたら新しいレートで表示する（Fake）" do
  rates = FakeRateSource.new
  rates.publish(jpy_per_usd: 150, as_of: Time.zone.parse("2026-11-20 10:00"))
  expect(described_class.new(rates:, clock: clock_at("2026-11-20 10:30")).render(1000)).to start_with "約1,500円"

  rates.publish(jpy_per_usd: 152, as_of: Time.zone.parse("2026-11-20 11:00"))
  expect(described_class.new(rates:, clock: clock_at("2026-11-20 11:30")).render(1000))
    .to eq "約1,520円（11/20 11:00時点のレート）"
end
`}
          />
          <p>
            Stub は1つの例の中で決まった値を返すだけですが、Fake は状態を持つので、「レートが更新されたら新しいレートで表示する」のように、途中で状態が変わる場面を書けます。その代わり、Fake は自分で書くクラスなので、本物と振る舞いがずれないように保守する必要があります。
          </p>
          <p>
            Rails にも Fake にあたる仕組みがあります。テストの環境の Active Job の :test アダプターはジョブを実行せずに記録し、Action Mailer の :test の配信方法はメールを送らずに <code>ActionMailer::Base.deliveries</code> に記録します。どちらも本物と同じ呼び出し方で使えて、テストから記録を確かめられます（<ChapterLink n={20} section="jobs-mail" />）。
          </p>
          <h3>Dummy：渡すだけで使わない</h3>
          <p>
            Dummy は、引数を埋めるために渡すだけで、呼ばれない代役です。initialize で必ず受け取る引数があり、確かめたいメソッドがその依存先を使わない場合に、<code>double("使われない")</code> を渡します。この章のテストでは使っていません。PriceLabel のように既定値を持つ引数なら、渡さずに済むからです。
          </p>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストと動作の確認',
      body: (
        <>
          <h3>テストの層と差し替えるもの</h3>
          <p>図 76-3 で示したとおり、この章では3つの層でテストを書き、層ごとに差し替えるものを変えます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">spec</th>
                  <th scope="col">差し替えるもの</th>
                  <th scope="col">確かめること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">spec/services/price_label_spec.rb</th>
                  <td>rates と clock を、引数で渡す代役に替える</td>
                  <td>換算と表示の形式、60分の境界、例外の伝わり方</td>
                </tr>
                <tr>
                  <th scope="row">spec/clients/http_rate_source_spec.rb</th>
                  <td>HTTP の通信を WebMock の stub_request に替える</td>
                  <td>URL と認証のヘッダー、応答の変換、HTTP のエラーとタイムアウトの変換</td>
                </tr>
                <tr>
                  <th scope="row">spec/requests/products_spec.rb</th>
                  <td>HTTP の通信を WebMock に、現在時刻を travel_to で替える</td>
                  <td>組み立てた本物の部品を通して画面に表示されること、API が応答しないときの画面</td>
                </tr>
                <tr>
                  <th scope="row">spec/config/rate_source_spec.rb</th>
                  <td>なし</td>
                  <td>組み立てる場所が HttpRateSource を組み立てていること</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <Term en="WebMock">WebMock</Term> は、Net::HTTP などの HTTP クライアントの通信をテストの中で置き換える gem です。rails_helper で <code>webmock/rspec</code> を読み込むと、登録していない外部への接続はすべて失敗するようになります<Ref n={15} />。また、rspec-rails 8.1 は travel_to を使うためのモジュールを自動では読み込まないので、<code>ActiveSupport::Testing::TimeHelpers</code> を include します。
          </p>
          <Code
            lang="ruby"
            title="spec/rails_helper.rb（追加した行）"
            code={`
require 'rspec/rails'
require 'webmock/rspec'
# …（省略）
RSpec.configure do |config|
  # …（省略）
  config.include ActiveSupport::Testing::TimeHelpers
end
`}
          />
          <h3>PriceLabel の単体テスト</h3>
          <Code
            lang="ruby"
            title="spec/services/price_label_spec.rb"
            code={`
require "rails_helper"
require_relative "../support/fake_rate_source"

RSpec.describe PriceLabel do
  let(:rate) { ExchangeRate.new(jpy_per_usd: 150, as_of: Time.zone.parse("2026-11-20 10:00")) }
  # Stub：決まったレートを返すだけの代役。HttpRateSource に usd_to_jpy があることも確かめる
  let(:rates) { instance_double(HttpRateSource, usd_to_jpy: rate) }

  # Stub：決まった時刻を返すだけの代役。既定の clock の Time.zone と同じく now に応答する
  def clock_at(time) = instance_double(ActiveSupport::TimeZone, now: Time.zone.parse(time))

  it "米ドルの価格を円に換算し、レートの時点を添える" do
    label = described_class.new(rates:, clock: clock_at("2026-11-20 10:30"))

    expect(label.render(1999)).to eq "約2,999円（11/20 10:00時点のレート）"
  end

  it "ちょうど1時間前のレートは表示する" do
    label = described_class.new(rates:, clock: clock_at("2026-11-20 11:00:00"))

    expect(label.render(1999)).to start_with "約2,999円"
  end

  it "1時間より古いレートは表示しない" do
    label = described_class.new(rates:, clock: clock_at("2026-11-20 11:00:01"))

    expect { label.render(1999) }.to raise_error(PriceLabel::StaleRateError)
  end

  it "clock を渡さなければ Time.zone を使う（travel_to で時刻を固定する）" do
    travel_to Time.zone.parse("2026-11-20 11:00:01") do
      expect { described_class.new(rates:).render(1999) }.to raise_error(PriceLabel::StaleRateError)
    end
  end

  # …（Spy・Mock・Fake の例は前の節に載せた）
end
`}
          />
          <p>
            <code>clock_at</code> は、<code>instance_double(ActiveSupport::TimeZone, now: …)</code> で時計の代役を作ります。既定の clock の Time.zone は ActiveSupport::TimeZone のインスタンスなので、代役に設定した now が本物にもあることを instance_double が確かめます。境界は、11:00:00（ちょうど1時間前のレート）なら表示し、11:00:01 なら StaleRateError を投げることで確かめています。4つ目の例は clock を渡さず、travel_to で Time.zone.now を固定しています。clock を引数にしても、travel_to を使う書き方をそのまま使えます。
          </p>
          <h3>HttpRateSource のテスト</h3>
          <Code
            lang="ruby"
            title="spec/clients/http_rate_source_spec.rb"
            code={`
require "rails_helper"

RSpec.describe HttpRateSource do
  let(:source) { described_class.new(base_url: "https://rates.test", api_key: "k-123") }
  let(:url) { "https://rates.test/v1/latest?base=USD&symbols=JPY" }

  it "API の応答を ExchangeRate に変換する" do
    stub_request(:get, url)
      .with(headers: { "Authorization" => "Bearer k-123" })
      .to_return(status: 200, body: { rates: { JPY: 151.25 }, timestamp: 1_795_136_400 }.to_json)

    expect(source.usd_to_jpy)
      .to eq ExchangeRate.new(jpy_per_usd: 151.25, as_of: Time.zone.parse("2026-11-20 10:00"))
  end

  it "HTTP のエラーを ExchangeRate::Unavailable にする" do
    stub_request(:get, url).to_return(status: 503)

    expect { source.usd_to_jpy }.to raise_error(ExchangeRate::Unavailable, /HTTP 503/)
  end

  it "タイムアウトを ExchangeRate::Unavailable にする" do
    stub_request(:get, url).to_timeout

    expect { source.usd_to_jpy }.to raise_error(ExchangeRate::Unavailable, /OpenTimeout/)
  end
end
`}
          />
          <p>
            <code>stub_request</code> は、指定した URL への GET に返す応答を登録します。<code>with(headers: …)</code> を付けると、認証のヘッダーが一致するリクエストだけに応答するので、API キーを正しく送っていることも確かめられます。<code>to_timeout</code> は通信のタイムアウトを起こし、Net::HTTP では Net::OpenTimeout になります<Ref n={15} />。為替 API の URL や JSON の形を知っているのは HttpRateSource だけなので、WebMock で応答を登録する単体テストもこのファイルだけです。
          </p>
          <h3>画面までを通す request spec</h3>
          <Code
            lang="ruby"
            title="spec/requests/products_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "商品の詳細", type: :request do
  let(:product) { Product.create!(name: "Tシャツ", price_usd_cents: 1999) }
  let(:rates_api) { "https://api.rates.example/v1/latest?base=USD&symbols=JPY" }

  it "為替 API のレートで円の目安を表示する" do
    stub_request(:get, rates_api)
      .to_return(status: 200, body: { rates: { JPY: 150.0 }, timestamp: 1_795_136_400 }.to_json)

    travel_to Time.zone.parse("2026-11-20 10:30") do
      get product_path(product)
    end

    expect(response.body).to include "約2,999円（11/20 10:00時点のレート）"
  end

  it "為替 API が応答しなくても、商品のページは表示する" do
    stub_request(:get, rates_api).to_timeout

    get product_path(product)

    expect(response).to have_http_status(:ok)
    expect(response.body).to include "円の目安は現在表示できません"
  end
end
`}
          />
          <p>
            request spec は、組み立てる場所も含めて本物の部品を通すので、initializer の書き間違いや、コントローラーと PriceLabel のつなぎ方の誤りを見つけられます。その代わり、為替 API の URL と JSON の形をここでも書いています。すべての画面のテストに同じ登録を書くと、提供元を替えたときに直すテストが増えます。そこで request spec の例は、表示できる場合と API が応答しない場合の2つにし、規則の細かい確認は PriceLabel の単体テストで行います。
          </p>
          <h3>組み立てのテストと実行結果</h3>
          <Code
            lang="ruby"
            title="spec/config/rate_source_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "為替レートの取得元の組み立て" do
  it "既定では初期化処理で組み立てた HttpRateSource を使う" do
    expect(Rails.configuration.x.rate_source).to be_a(HttpRateSource)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation。Rails 8.1.4.1・MySQL 8.4）"
            code={`
HttpRateSource
  API の応答を ExchangeRate に変換する
  HTTP のエラーを ExchangeRate::Unavailable にする
  タイムアウトを ExchangeRate::Unavailable にする

為替レートの取得元の組み立て
  既定では初期化処理で組み立てた HttpRateSource を使う

商品の詳細
  為替 API のレートで円の目安を表示する
  為替 API が応答しなくても、商品のページは表示する

PriceLabel
  米ドルの価格を円に換算し、レートの時点を添える
  ちょうど1時間前のレートは表示する
  1時間より古いレートは表示しない
  clock を渡さなければ Time.zone を使う（travel_to で時刻を固定する）
  表示のたびにレートを1回だけ取得する（Spy：呼ばれた後で確かめる）
  取得元の例外は呼び出し元にそのまま伝える（Mock：呼ばれ方を先に決める）
  レートが更新されたら新しいレートで表示する（Fake）

Finished in 0.11418 seconds (files took 1.06 seconds to load)
13 examples, 0 failures
`}
          />
          <p>
            13の例が 0.11 秒で通りました。適用前のテストは2つの例に 1.44 秒かかり、結果も実行のたびに変わりました。適用後のテストは外部に接続せず、何回実行しても同じ結果になります。WebMock が登録していない接続を止めるので、外部に接続できない CI でも同じ結果です。
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
            <li>外部に接続せず、実際の時刻にも左右されないテストを書けます。Net::HTTP や Time のメソッドを、テストの間だけ書き換える必要がなくなります。</li>
            <li>60分の境界のような規則を、決まった時刻で確かめられます。</li>
            <li>為替 API の提供元を替えるときに直すのは、HttpRateSource と組み立てる場所、それぞれのテストだけです。PriceLabel とコントローラーは変わりません。</li>
            <li>API キーの設定の漏れを、本番の起動時に見つけられます。</li>
            <li>initialize の引数を見れば、PriceLabel が外部の何を使うかがわかります。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>ファイルが増えます。この章では、Product の1つのメソッドが、ExchangeRate・HttpRateSource・PriceLabel・initializer の4つのファイルになりました。</li>
            <li>本番でどの実装が使われるかを知るには、config/initializers を読む必要があります。PriceLabel のファイルだけを読んでも、rates の実体はわかりません。</li>
            <li>依存先が多いクラスは、initialize の引数が長くなります。多くの場合、そのクラスの責務が多すぎることを示しています。</li>
            <li>rates の既定値に Rails.configuration.x を使うと、PriceLabel は Rails の設定から依存先を読み出す処理を含みます。Rails を読み込まずに PriceLabel だけを使うことはできません。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            DI の効果が最も大きいのはテストのしやすさです。外部とのやり取りを代役に替えられるので、テストが速くなり、結果が安定します。保守性の面では、外部の API の仕様が変わったときに直すのが HttpRateSource だけになります。一方で、依存先を受け取るだけの小さなクラスが増えるので、コードを読む人は「どこで組み立てているか」を追う手間が増えます。組み立てる場所を config/initializers の1つのファイルにまとめるのは、この手間を減らすためです。
          </p>
          <p>
            代役を使うテストは、本物との食い違いを見つけられません。instance_double でメソッドの名前と引数を確かめ、HttpRateSource のテストで応答の形を確かめ、request spec で組み立てを確かめるように、層を分けて食い違いを見つけます。テストをどの層に置くかは<ChapterLink n={20} section="test-strategy" />でも扱いました。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>Service Locator を DI と呼ぶ</h3>
          <p>
            クラスの中から依存先の一覧に問い合わせて、依存先を取り出す形を<Term en="Service Locator">Service Locator</Term>と呼びます。Rails では、Rails.configuration.x や、依存先を返すクラスメソッドを、メソッドの中から直接読むとこの形になります。
          </p>
          <Code
            lang="ruby"
            title="避けたい書き方：依存先をメソッドの中で取り出す"
            code={`
class LocatorPriceLabel
  def render(usd_cents)
    rate = Rails.configuration.x.rate_source.usd_to_jpy
    raise PriceLabel::StaleRateError if Time.current - rate.as_of > 1.hour

    "約#{(usd_cents * rate.jpy_per_usd / 100.0).round.to_fs(:delimited)}円"
  end
end
`}
          />
          <p>依存先を差し替えられる点は DI と同じですが、クラスが何に依存しているかは、メソッドの中を読まないとわかりません。2つのクラスの initialize の引数を rails runner で表示しました。</p>
          <Code
            lang="text"
            title="実行結果（p クラス名.instance_method(:initialize).parameters）"
            code={`
PriceLabel        => [[:key, :rates], [:key, :clock], [:key, :max_age]]
LocatorPriceLabel => []
`}
          />
          <p>
            PriceLabel が rates・clock・max_age を受け取ることは、引数からわかります。LocatorPriceLabel の引数は空で、為替 API と現在時刻を使うことはコードを読まないとわかりません。テストで代役を使うには、Rails.configuration.x.rate_source をテストの間だけ書き換えて元に戻す必要があり、戻し忘れると後のテストに影響します。
          </p>
          <Figure n="76-5" title="Dependency Injection と Service Locator" caption="模式図。parameters は initialize の引数を rails runner で表示した結果。">
            <ServiceLocatorFigure />
          </Figure>
          <p>
            図 76-5 は2つの形を並べたものです。Fowler は、1つのアプリの中で使うクラスなら両者はほぼ同等で Service Locator がわずかに有利だとしつつ、複数のアプリで使うクラスなら DI の方がよいと述べています<Ref n={1} />。Seemann は、Service Locator はクラスの依存先を隠し、依存先の設定漏れのような誤りが、コンパイルの時点ではなく実行した時点で初めてわかるようになるとして、アンチパターンとしています<Ref n={6} />。
          </p>
          <p>
            この章の PriceLabel も、既定値の中で Rails.configuration.x を読んでいます。これは DI と Service Locator の中間の書き方です。依存先が initialize の引数として見え、テストでは引数で差し替えられるので、この章では採用しました。ただし、既定値の中で依存先を一覧から取り出していることに変わりはありません。Rails の外でも使うクラスや、依存先をすべて明示したいクラスでは、既定値を付けず、組み立てる場所から必ず渡します。
          </p>
          <h3>すべてを注入する</h3>
          <Code
            lang="ruby"
            title="避けたい書き方：外部とやり取りしない計算まで引数で受け取る"
            code={`
class PriceLabel
  def initialize(rates: Rails.configuration.x.rate_source, clock: Time.zone, max_age: 1.hour,
                 converter: YenConverter.new, formatter: YenFormatter.new, logger: Rails.logger)
    # …（省略）
  end
end
`}
          />
          <p>
            円への換算や3桁区切りの整形は、外部とやり取りせず、同じ入力に同じ結果を返す計算です。代役に替える理由がないので、引数にしても組み立てのコードが増えるだけで、テストのしやすさは変わりません。注入するのは、外部と通信するもの、時刻・乱数・設定のように実行するたびに変わるもの、環境ごとに実装が変わるものに限ります。Rails.logger も、ログの出力を確かめるテストがなければ引数にしません。
          </p>
          <h3>コンストラクターの引数が増え続ける</h3>
          <Code
            lang="ruby"
            title="避けたい書き方：商品のページに出す情報を、1つのクラスですべて組み立てる"
            code={`
class ProductPage
  def initialize(product, rates:, clock:, stock_api:, review_api:, recommender:, coupon_api:, shipping_rates:)
    # …（省略）
  end
end
`}
          />
          <p>
            商品のページに在庫・レビュー・おすすめ・クーポン・送料を足すたびに、引数が増えていきます。これは DI のせいで書きにくくなったのではなく、責務が多すぎることが引数の数に表れていると考えます。円の目安は PriceLabel、在庫の表示は在庫の表示だけを作るクラス、のように表示する部品ごとにクラスを分けます。業務の操作であれば、<ChapterLink n={44} section="idea" />（Use Case / Application Service）のように処理の単位を分けます。
          </p>
          <h3>テストのためだけに依存先を書き換えられるようにする</h3>
          <p>テストで代役に替えるためだけに、クラスの属性で依存先を書き換えられるようにした例です。</p>
          <Code
            lang="ruby"
            title="避けたい書き方：クラスの属性で依存先を書き換える"
            code={`
class LeakyPriceLabel
  cattr_accessor :rate_source, default: Rails.configuration.x.rate_source

  def render(usd_cents)
    rate = rate_source.usd_to_jpy
    "約#{(usd_cents * rate.jpy_per_usd / 100.0).round.to_fs(:delimited)}円"
  end
end
`}
          />
          <Code
            lang="ruby"
            title="このクラスのテスト"
            code={`
it "1つ目：代役に書き換えて換算する" do
  LeakyPriceLabel.rate_source = instance_double(HttpRateSource, usd_to_jpy: rate) # 元に戻していない
  expect(LeakyPriceLabel.new.render(1999)).to eq "約2,999円"
end

it "2つ目：既定の取得元を使うつもりのテスト" do
  stub_request(:get, %r{api.rates.example})
    .to_return(body: { rates: { JPY: 151.0 }, timestamp: 1_795_136_400 }.to_json)
  expect(LeakyPriceLabel.new.render(1000)).to eq "約1,510円"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --order rand:1 と rand:5）"
            code={`
== --order rand:1（1つ目、2つ目の順）
  1) LeakyPriceLabel 2つ目：既定の取得元を使うつもりのテスト
     Failure/Error: expect(LeakyPriceLabel.new.render(1000)).to eq "約1,510円"
       #<InstanceDouble(HttpRateSource) (anonymous)> was originally created in one example
       but has leaked into another example and can no longer be used.
2 examples, 1 failure

== --order rand:5（2つ目、1つ目の順）
2 examples, 0 failures
`}
          />
          <p>
            cattr_accessor で作った属性は、クラスに1つだけあり、すべてのテストと本番のコードで共有されます。1つ目のテストが書き換えた代役が2つ目のテストに残り、RSpec は別の例で作られた代役が使われたことを検出しました。テストの順番を入れ替えると両方とも通るので、実行の順番によって結果が変わるテストになります。また、本番のコードからも <code>LeakyPriceLabel.rate_source = …</code> で依存先を替えられるようになります。
          </p>
          <p>差し替えは initialize の引数で行い、作った後は替えられないようにします。設定を書き換えるテストがどうしても必要なら、around のフックで元の値に戻します。</p>
          <h3>DI コンテナを最初から導入する</h3>
          <p>
            <Term en="DI container">DI コンテナ</Term>は、依存先の名前と作り方を登録しておき、クラスを作るときに依存先を自動で渡す仕組みです。Ruby では dry-auto_inject が、クラスに include した名前の依存先をコンテナから取り出して、initialize に渡します<Ref n={17} />。この章のアプリには入れていないので、アプリとは別のディレクトリに gem を入れ、PriceLabel を小さく再定義して動かしました。
          </p>
          <Code
            lang="ruby"
            title="dry-auto_inject 1.2.2 で PriceLabel を組み立てる（検証用のスクリプトから抜粋）"
            code={`
require "dry/auto_inject"

# config/initializers に置く部分：名前と作り方を登録する
class AppContainer
  def self.[](name)
    case name
    when "rate_source" then HttpRateSource.new
    when "clock" then Time
    end
  end
end
Import = Dry::AutoInject(AppContainer)

# app/services/price_label.rb に置く部分：名前の一覧だけを書く
class PriceLabel
  include Import["rate_source", "clock"]

  def render(usd_cents)
    rate = rate_source.usd_to_jpy
    raise "stale" if clock.now - rate.as_of > 3600
    "約#{(usd_cents * rate.jpy_per_usd / 100.0).round}円"
  end
end

puts PriceLabel.new.render(1999)
p PriceLabel.instance_method(:initialize).parameters
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
約2999円
[[:keyrest, :__auto_inject_kwargs__], [:block, :block]]
`}
          />
          <p>
            PriceLabel には <code>include Import["rate_source", "clock"]</code> と書くだけで、initialize を書かずに済みます。その代わり、initialize の引数は <code>__auto_inject_kwargs__</code> という可変長のキーワード引数1つになり、何を受け取るかは Import の名前の一覧とコンテナの登録を読まないとわかりません。組み立てる対象が数十・数百あるアプリでは、登録を1か所にまとめられるので役に立ちます。しかし、この章のように組み立てが数行で書ける段階で導入すると、組み立ての規則をコンテナの設定から読み取る必要が生じ、かえって追いにくくなります。Rails のアプリなら、多くの場合は config/initializers とキーワード引数の既定値で足ります。
          </p>
        </>
      ),
    },
    {
      id: 'alternatives',
      title: 'travel_to・WebMock・ほかの方法との使い分けと採用の判断',
      body: (
        <>
          <h3>より単純な方法</h3>
          <ul>
            <li>メソッドの引数で渡す：依存先を使う処理が1つのメソッドだけなら、クラスに initialize を加えずに、メソッドの引数で受け取れば足ります。</li>
            <li>
              travel_to で時刻を固定する：時刻だけが問題なら、clock を引数にせず travel_to で固定できます。travel_to は、<code>Time.now</code>・<code>Time.new</code>（引数なし）・<code>Date.today</code>・<code>DateTime.now</code> を指定した時刻に置き換えます<Ref n={11} />。Time.current や Time.zone.now も Time.now をもとにするので、同じ時刻になります。ただし、置き換えるのはプロセス全体の時刻で、クラスが時刻に依存していることは引数からは読み取れません。また travel_to は、<code>with_usec: true</code> を渡さなければマイクロ秒を 0 に切り捨て、ブロックの中でさらにブロック付きの travel_to を呼ぶと例外を投げます<Ref n={11} />。
            </li>
            <li>
              WebMock で HTTP の通信を置き換える：依存先を引数で受け取れない既存のコードでも、外部への接続を止めて、決まった応答を返せます。適用前の Product#price_label のテストも、stub_request と travel_to を使えば安定させられます。その代わり、テストごとに為替 API の URL と JSON の形を書くことになり、Product が API を直接知っている状態は変わりません。
            </li>
            <li>
              <code>allow(Net::HTTP).to receive</code> や <code>stub_const</code> で、クラスのメソッドや定数をテストの間だけ置き換える：引数で受け取れない既存のコードをテストするときの手段です。新しく書くコードでは、引数で渡す方が依存がはっきりします。
            </li>
          </ul>
          <p>WebMock を読み込んだ状態で、適用前の Product のテストを実行すると、外部への接続がどこで起きているかがわかります。</p>
          <Code
            lang="text"
            title="実行結果（webmock/rspec を読み込み、適用前の spec/models/product_spec.rb を実行。一部を省略）"
            code={`
  1) Product 米ドルの価格を円の目安で表示する
     Failure/Error: res = Net::HTTP.get_response(uri, { "Authorization" => "Bearer #{ENV.fetch("RATES_API_KEY")}" })

     WebMock::NetConnectNotAllowedError:
       Real HTTP connections are disabled. Unregistered request: GET https://api.rates.example/v1/latest?base=USD&symbols=JPY
       with headers {'Accept'=>'*/*', …, 'Authorization'=>'Bearer k-123', 'Host'=>'api.rates.example', 'User-Agent'=>'Ruby'}

       You can stub this request with the following snippet:

       stub_request(:get, "https://api.rates.example/v1/latest?base=USD&symbols=JPY").
         with(
           headers: {
       …
           }).
         to_return(status: 200, body: "", headers: {})
`}
          />
          <p>
            WebMock は登録していない接続を例外にし、その接続を登録するための stub_request の書き方を表示します。外部への接続が残っているテストを見つけるために、DI を使うかどうかにかかわらず、rails_helper で読み込んでおくと便利です。
          </p>
          <h3>travel_to・WebMock・DI の使い分け</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">方法</th>
                  <th scope="col">置き換えるもの</th>
                  <th scope="col">向いている場面</th>
                  <th scope="col">注意すること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">引数で代役を渡す（DI）</th>
                  <td>依存先のオブジェクト</td>
                  <td>業務の規則の単体テスト。外部の API や時刻を使うクラスを新しく書くとき</td>
                  <td>本物との食い違いは見つけられない。instance_double を使い、通信のテストを別に書く</td>
                </tr>
                <tr>
                  <th scope="row">travel_to</th>
                  <td>プロセス全体の現在時刻</td>
                  <td>時刻を使うモデルのメソッドやスコープ、request spec</td>
                  <td>依存が引数に表れない。マイクロ秒は切り捨てられる。ブロックの入れ子は例外になる</td>
                </tr>
                <tr>
                  <th scope="row">WebMock</th>
                  <td>HTTP の通信</td>
                  <td>通信を受け持つクラス（HttpRateSource）のテスト、request spec、引数で受け取れない既存のコード</td>
                  <td>URL と応答の形をテストに書く。登録していない接続はすべて失敗する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            3つはどれか1つを選ぶものではありません。この章のテストのように、規則は引数で渡す代役で、通信は WebMock で、画面の確認は WebMock と travel_to で、と層ごとに組み合わせます。
          </p>
          <h3>ほかのパターンとの違い</h3>
          <ul>
            <li>Factory：依存先の作り方が複雑なときに、作る処理を専用のオブジェクトやメソッドにまとめます。組み立てる場所から Factory を使うこともできます。</li>
            <li>
              <ChapterLink n={41} section="idea" />（Strategy / Policy）：注入するものが業務のルール（送料の計算や認可の判断）である場合です。DI は渡し方を、Strategy は渡すものの設計を扱います。
            </li>
            <li>
              <ChapterLink n={42} section="idea" />（Adapter）：HttpRateSource は、為替 API の応答をアプリの ExchangeRate に変換しているので、Adapter でもあります。複数の提供元の違いをそろえる設計は Adapter の章で扱います。
            </li>
            <li>
              <ChapterLink n={45} section="idea" />（Functional Core, Imperative Shell）：依存先を差し替えるのではなく、依存先を持たない計算の部分を分けてテストします。換算と60分の判定を、レートと現在時刻を引数で受け取るメソッドにすれば、代役なしでテストできます。DI と組み合わせて使えます。
            </li>
          </ul>
          <h3>Rails の標準機能と gem</h3>
          <ul>
            <li>Rails は、Active Job の queue_adapter や Action Mailer の delivery_method のように、使う実装を設定で選ぶ仕組みを持っています。アプリのクラスでも、config/initializers と config.x で同じように実装を選べます。</li>
            <li>dry-auto_inject や dry-system は、依存先の登録と自動の注入を提供します<Ref n={17} />。組み立てる対象が多く、登録を1か所で管理したいアプリで検討します。</li>
            <li>テストでは、rspec-mocks の instance_double・class_double、WebMock、travel_to を組み合わせれば、DI 用の gem を入れずに代役を渡せます。</li>
          </ul>
          <h3>採用する条件</h3>
          <ul>
            <li>外部と通信する（外部の API、メールの送信、検索エンジン）</li>
            <li>時刻・乱数・環境変数など、実行するたびに変わるものを使い、その値で業務の判断をする</li>
            <li>環境（本番・開発・テスト）ごとに実装を替える必要がある</li>
            <li>その依存先を替えないと、テストが遅い、不安定、または書けない</li>
          </ul>
          <h3>採用しない方がよい条件</h3>
          <ul>
            <li>依存先が、外部とやり取りしない計算や変換である</li>
            <li>依存先が Ruby や Rails の安定した機能で、替える予定もテストで替える必要もない</li>
            <li>時刻だけが問題で、travel_to で足りる</li>
            <li>1回だけ実行する rake タスクなど、テストも差し替えも必要ない</li>
          </ul>
          <h3>判断のチェックポイント</h3>
          <ol>
            <li>この依存先は、テストで代役に替える必要があるか</li>
            <li>この依存先は副作用（通信・保存・送信）を持つか、または実行のたびに結果が変わるか</li>
            <li>どの実装が使われるかを、組み立てる場所の1か所で確かめられるか</li>
            <li>initialize の引数が多すぎないか。多すぎるなら責務を分けるべきではないか</li>
            <li>DI コンテナを使わず、引数と既定値で渡すだけで足りないか</li>
          </ol>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>為替 API と現在時刻をクラスの中で直接使うと、テストの結果が API の応答と時刻で変わり、テストのたびに外部に接続し、設定の漏れが最初の表示まで見つかりません。</li>
          <li>DI は、依存先を使う側で作らずに引数で受け取り、依存先の生成と利用を分けるパターンです。必ず必要な依存先は initialize で、呼び出しごとに変わるものはメソッドの引数で受け取ります。</li>
          <li>Ruby ではキーワード引数の既定値で本物を使い、テストで差し替える書き方がよく使われます。既定値は呼び出しのたびに評価されます。</li>
          <li>Rails で依存先を組み立てる場所は config/initializers です。app/ のクラスは to_prepare の中で作って config.x に入れ、本番では設定の漏れを起動時に KeyError で止めます。</li>
          <li>テストダブルは Dummy・Stub・Spy・Mock・Fake の5種類です。RSpec では instance_double で本物にあるメソッドかを確かめ、振る舞いの検証（have_received・expect().to receive）は呼び出し方そのものが仕様の場合に限ります。</li>
          <li>規則は引数で渡す代役で、通信は WebMock で、画面の確認は WebMock と travel_to で、と層ごとに置き換えるものを変えます。</li>
          <li>Service Locator、外部とやり取りしない計算の注入、テストのためだけの書き換え、最初からの DI コンテナの導入は避けます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Inversion of Control Containers and the Dependency Injection pattern', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/articles/injection.html', accessed: '2026-11-13', version: '2004年1月23日', note: 'Dependency Injection という名前の由来、3つの注入の形、Service Locator との比較、サービスの構成と利用の分離。' },
    { title: 'TestDouble', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/TestDouble.html', accessed: '2026-11-13', version: '2006年1月17日', note: 'Dummy・Fake・Stub・Spy・Mock の定義。' },
    { title: "Mocks Aren't Stubs", publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/articles/mocksArentStubs.html', accessed: '2026-11-13', version: '2007年1月2日', note: '状態の検証と振る舞いの検証。' },
    { title: 'xUnit Test Patterns: Refactoring Test Code', publisher: 'Gerard Meszaros / Addison-Wesley（InformIT の書籍ページ）', url: 'https://www.informit.com/store/xunit-test-patterns-refactoring-test-code-9780131495050', accessed: '2026-11-13', version: '2007年5月刊', note: 'テストダブルの分類の出典。' },
    { title: 'Composition Root', publisher: 'blog.ploeh.dk / Mark Seemann', url: 'https://blog.ploeh.dk/2011/07/28/CompositionRoot/', accessed: '2026-11-13', version: '2011年7月28日', note: 'Composition Root の定義。' },
    { title: 'Service Locator is an Anti-Pattern', publisher: 'blog.ploeh.dk / Mark Seemann', url: 'https://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/', accessed: '2026-11-13', version: '2010年2月3日', note: 'Service Locator は依存先を隠し、誤りを実行時まで見つけられなくすること。' },
    { title: 'The Dependency Inversion Principle', publisher: 'Robert C. Martin / The C++ Report（テキサス大学の教員のサイトに置かれた複製）', url: 'https://cs.utexas.edu/~downing/papers/DIP-1996.pdf', accessed: '2026-11-13', version: '1996年6月号', note: '依存性逆転の原則の原文。' },
    { title: 'Configuring Rails Applications', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'config.x による独自の設定と Rails.configuration.x での読み出し、to_prepare が初期化の後と開発環境の再読み込みのたびに実行されること。' },
    { title: 'Autoloading and Reloading Constants', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'initializer から再読み込みされる定数を参照できないこと（Rails 7 から NameError）、to_prepare で包むこと、to_prepare が2回実行される場合があり冪等に書くこと。' },
    { title: 'railties/lib/rails/application/finisher.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/finisher.rb#L64-L74`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'to_prepare のブロックを登録し、起動の手順（run_prepare_callbacks）で実行すること。' },
    { title: 'activesupport/lib/active_support/testing/time_helpers.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/testing/time_helpers.rb#L133-L191`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'travel_to が Time.now・Time.new・Date.today・DateTime.now を置き換えること、マイクロ秒の切り捨て、ブロックの入れ子で例外を投げること。' },
    { title: 'Verifying doubles', publisher: 'RSpec Mocks', url: 'https://rspec.info/features/3-13/rspec-mocks/verifying-doubles/', accessed: '2026-11-20', version: 'rspec-mocks 3.13（3.13.9 で動作を確認）', note: '検証付きのダブルはメソッドの存在と引数を確かめ、クラスが定義されていなければ確かめないこと。' },
    { title: 'Using an instance double', publisher: 'RSpec Mocks', url: 'https://rspec.info/features/3-13/rspec-mocks/verifying-doubles/instance-doubles/', accessed: '2026-11-20', version: 'rspec-mocks 3.13', note: 'instance_double がインスタンスのメソッドの存在と、引数の数・キーワード引数を確かめること。' },
    { title: 'Spies', publisher: 'RSpec Mocks', url: 'https://rspec.info/features/3-13/rspec-mocks/basics/spies/', accessed: '2026-11-20', version: 'rspec-mocks 3.13', note: 'have_received で呼ばれた後に確かめること、allow で設定したメソッドの呼び出しを記録すること。' },
    { title: 'bblimke/webmock README', publisher: 'GitHub', url: 'https://github.com/bblimke/webmock', accessed: '2026-11-20', version: 'webmock 3.36.0 で動作を確認', note: 'webmock/rspec の読み込み、disable_net_connect!、stub_request・to_return・to_timeout。' },
    { title: 'Methods（Default Values）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/methods_rdoc.html', accessed: '2026-11-13', note: '引数の既定値。呼び出しのたびに評価されることは Ruby 4.0.9 で実行して確認した。' },
    { title: 'dry-auto_inject', publisher: 'Hanakai（dry-rb）', url: 'https://hanakai.org/learn/dry/dry-auto_inject', accessed: '2026-11-13', version: 'dry-auto_inject 1.2.2 で動作を確認', note: 'コンテナと Import による依存先の自動の注入。' },
    { title: 'lib/net/http.rb（Net::HTTP#initialize の既定値）', publisher: 'ruby/net-http（GitHub）', url: 'https://github.com/ruby/net-http/blob/v0.10.0/lib/net/http.rb#L1152-L1165', accessed: '2026-11-20', version: 'net-http 0.10.0', note: 'open_timeout・read_timeout の既定値が60秒、max_retries の既定値が1であること。' },
    { title: 'lib/net/http.rb（transport_request の再送）', publisher: 'ruby/net-http（GitHub）', url: 'https://github.com/ruby/net-http/blob/v0.10.0/lib/net/http.rb#L2519-L2535', accessed: '2026-11-20', version: 'net-http 0.10.0', note: '冪等なメソッドが読み取りのタイムアウトなどで失敗したとき、max_retries の回数だけ再送すること。' },
  ],
}

export default chapter
