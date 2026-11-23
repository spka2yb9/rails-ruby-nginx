import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 79-1 包む方式のミドルウェアの実行順序 ---------- */
const LAYERS = ['ActionDispatch::RequestId', 'ApiAccessLog', 'MaintenanceMode', 'Rails::Rack::Logger', 'ActionDispatch::ShowExceptions']

function OnionFigure() {
  const step = 26
  return (
    <Svg
      id="79-1"
      w={780}
      h={360}
      label="リクエストは外側の ActionDispatch::RequestId から順に ApiAccessLog、MaintenanceMode、Rails::Rack::Logger、ActionDispatch::ShowExceptions を通って、ルーティングとコントローラーに届く。コントローラーが返した応答は、逆の順に ShowExceptions、Logger、MaintenanceMode、ApiAccessLog、RequestId を通って外に出る。各ミドルウェアは @app.call を呼ぶ前に行きの処理、戻った後に帰りの処理を行う。外側の段ほど、内側の段で起きたことを見られる"
    >
      {LAYERS.map((name, i) => (
        <g key={name}>
          <rect
            x={20 + i * step}
            y={30 + i * step}
            width={480 - i * step * 2}
            height={300 - i * step * 2}
            rx={10}
            fill={i % 2 ? 'var(--fig-box)' : 'var(--fig-bg)'}
            stroke="var(--fig-line)"
          />
          <text x={32 + i * step} y={46 + i * step} fontSize={11.5} className="mono" dominantBaseline="central">
            {i + 1}. {name}
          </text>
        </g>
      ))}
      <Box x={170} y={156} w={180} h={48} lines={['ルーティングと', 'コントローラー']} fs={12.5} accent />
      <Arrow d="M 240 8 L 240 154" accent />
      <Arrow d="M 284 206 L 284 352" dashed />
      <T x={232} y={16} anchor="end" fs={12} tone="acc">
        リクエスト（行き）
      </T>
      <T x={294} y={346} fs={12}>
        応答（帰り）
      </T>
      <T x={526} y={60} fs={13} bold>
        行き：@app.call を呼ぶ前の処理
      </T>
      <T x={526} y={84} fs={12}>
        1 → 2 → 3 → 4 → 5 → コントローラー
      </T>
      <T x={526} y={140} fs={13} bold>
        帰り：@app.call から戻った後の処理
      </T>
      <T x={526} y={164} fs={12}>
        コントローラー → 5 → 4 → 3 → 2 → 1
      </T>
      <T x={526} y={220} fs={12} tone="muted">
        外側の段ほど、内側の段で起きたこと
      </T>
      <T x={526} y={238} fs={12} tone="muted">
        （成功・打ち切り・例外の応答）を見られる
      </T>
      <T x={526} y={280} fs={12} tone="muted">
        2・3 はこの章で書いた段。1・4・5 は
      </T>
      <T x={526} y={298} fs={12} tone="muted">
        Rails の標準の段（ほかの段は省略）
      </T>
    </Svg>
  )
}

/* ---------- 図 79-2 認証に失敗して打ち切る流れ ---------- */
function ShortCircuitFigure() {
  const names: string[][] = [
    ['ActionDispatch::', 'RequestId'],
    ['ApiAccessLog'],
    ['MaintenanceMode'],
    ['ActionDispatch::', 'ShowExceptions'],
    ['before_action', ':authenticate!'],
    ['OrdersController', '#index'],
  ]
  const x = (i: number) => 10 + i * 128
  return (
    <Svg
      id="79-2"
      w={780}
      h={240}
      label="Authorization ヘッダーの無い GET /orders は、RequestId、ApiAccessLog、MaintenanceMode、ShowExceptions を通ってコントローラーに届く。before_action の authenticate! が 401 を render するので、index アクションは実行されない。401 の応答は ShowExceptions、MaintenanceMode、ApiAccessLog、RequestId を通って外に出るので、アクセスログに記録され、x-request-id ヘッダーも付く"
    >
      <T x={14} y={24} fs={12} tone="acc" mono>
        GET /orders（Authorization ヘッダーなし）
      </T>
      {names.map((n, i) => (
        <Box
          key={n.join()}
          x={x(i)}
          y={50}
          w={112}
          h={50}
          lines={n}
          mono
          fs={11}
          dashed={i === 5}
          fill={i === 5 ? 'bg' : i === 4 ? 'box5' : 'box'}
          accent={i === 4}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={i} x1={x(i) + 112} y1={64} x2={x(i + 1) - 2} y2={64} accent />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={`r${i}`} x1={x(i + 1)} y1={88} x2={x(i) + 114} y2={88} dashed />
      ))}
      <T x={x(4) + 56} y={122} anchor="middle" fs={12} tone="danger">
        401 を render
      </T>
      <T x={x(4) + 56} y={140} anchor="middle" fs={12} tone="danger">
        （チェーンを打ち切る）
      </T>
      <T x={x(5) + 56} y={122} anchor="middle" fs={12} tone="muted">
        実行されない
      </T>
      <T x={x(1) + 56} y={122} anchor="middle" fs={12} tone="acc">
        401 を記録
      </T>
      <T x={x(0) + 56} y={122} anchor="middle" fs={12} tone="acc">
        ID を付ける
      </T>
      <T x={14} y={186} fs={12}>
        打ち切った 401 の応答も外側の段を通って戻るので、アクセスログに残り、x-request-id ヘッダーも付く
      </T>
      <T x={14} y={210} fs={12} tone="muted">
        主な段だけを示した。Rails::Rack::Logger などの標準の段も間にある
      </T>
    </Svg>
  )
}

/* ---------- 図 79-3 ログと例外処理の順序による違い ---------- */
function OrderFigure() {
  const col = (x0: number, names: string[], logged: boolean) => (
    <g>
      {names.map((n, i) => (
        <Box
          key={n}
          x={x0}
          y={50 + i * 50}
          w={300}
          h={38}
          lines={n}
          mono
          fs={12}
          fill={i === names.length - 1 ? 'bg' : n === 'ApiAccessLog' ? 'box5' : 'box'}
          accent={n === 'ApiAccessLog'}
        />
      ))}
      {names.slice(0, -1).map((_, i) => (
        <Arrow key={i} x1={x0 + 150} y1={88 + i * 50} x2={x0 + 150} y2={98 + i * 50} />
      ))}
      <T x={x0} y={270} fs={12} tone={logged ? 'acc' : 'danger'}>
        {logged ? 'アクセスログ：status 500 の行が書かれる' : 'アクセスログ：何も書かれない'}
      </T>
      <T x={x0} y={290} fs={11.5} tone="muted">
        {logged ? 'ShowExceptions が作った 500 の応答を帰りで受け取る' : '例外が帰りの処理を通らずに外へ出る'}
      </T>
    </g>
  )
  return (
    <Svg
      id="79-3"
      w={780}
      h={310}
      label="左は ApiAccessLog を ShowExceptions の外側に置いた場合で、コントローラーで起きた例外を ShowExceptions が 500 の応答に変えてから ApiAccessLog に戻るので、status 500 の行が書かれる。右は ApiAccessLog を ShowExceptions の内側に置いた場合で、例外が ApiAccessLog の帰りの処理を通らずに外へ出るので、何も書かれない。どちらも利用者には 500 が返る"
    >
      <T x={30} y={28} bold>
        ApiAccessLog が外側（この章の並び）
      </T>
      {col(30, ['ActionDispatch::RequestId', 'ApiAccessLog', 'ActionDispatch::ShowExceptions', 'コントローラー（例外が起きる）'], true)}
      <line x1={390} y1={10} x2={390} y2={300} stroke="var(--fig-line)" />
      <T x={420} y={28} bold>
        ApiAccessLog が内側（use で末尾に追加）
      </T>
      {col(420, ['ActionDispatch::RequestId', 'ActionDispatch::ShowExceptions', 'ApiAccessLog', 'コントローラー（例外が起きる）'], false)}
    </Svg>
  )
}

/* ---------- 図 79-5 Chain of Responsibility と Middleware Chain ---------- */
function CorFigure() {
  return (
    <Svg
      id="79-5"
      w={780}
      h={260}
      label="Chain of Responsibility では、要求が鎖のようにつながった処理役に順に渡され、処理できる処理役が1つ見つかったところで止まる。Middleware Chain では、通常はすべての段が順に実行され、最後のコントローラーの応答が逆順に戻る。途中の段が打ち切ることもある"
    >
      <T x={20} y={24} bold>
        Chain of Responsibility（GoF）
      </T>
      {['処理役A', '処理役B', '処理役C'].map((n, i) => (
        <Box key={n} x={20 + i * 160} y={40} w={130} h={40} lines={n} fill={i === 1 ? 'box5' : i === 2 ? 'bg' : 'box'} accent={i === 1} dashed={i === 2} />
      ))}
      <Arrow x1={150} y1={60} x2={178} y2={60} />
      <T x={20} y={104} fs={12}>
        A は処理できないので B に渡す。B が処理して終わる（破線の C には届かない）
      </T>
      <T x={20} y={150} bold>
        Middleware Chain（この章）
      </T>
      {['RequestId', 'ApiAccessLog', 'MaintenanceMode', 'コントローラー'].map((n, i) => (
        <Box key={n} x={20 + i * 160} y={166} w={130} h={40} lines={n} mono={i < 3} fs={12} accent={i === 3} />
      ))}
      {[0, 1, 2].map((i) => (
        <Arrow key={i} x1={150 + i * 160} y1={178} x2={178 + i * 160} y2={178} />
      ))}
      {[0, 1, 2].map((i) => (
        <Arrow key={`b${i}`} x1={180 + i * 160} y1={196} x2={152 + i * 160} y2={196} dashed />
      ))}
      <T x={20} y={234} fs={12}>
        すべての段が行きと帰りの処理を行う。途中で打ち切ることもある（メンテナンス中、認証の失敗など）
      </T>
    </Svg>
  )
}

/* ---------- 図 79-4 Rack のミドルウェアとコントローラーのチェーン ---------- */
function TwoChainsFigure() {
  const mw = ['ActionDispatch::RequestId', 'ApiAccessLog', 'MaintenanceMode', 'Rails::Rack::Logger', 'ActionDispatch::ShowExceptions', 'ルーティング（routes）']
  return (
    <Svg
      id="79-4"
      w={780}
      h={410}
      label="左は Rack のミドルウェアの並びで、RequestId、ApiAccessLog、MaintenanceMode、Rails::Rack::Logger、ShowExceptions を通ってルーティングに届く。すべてのリクエストに適用され、どのコントローラーかはまだ決まっていない。右はルーティングが選んだコントローラーの中のチェーンで、外側から ActionController::Rescue（rescue_from）、before_action の authenticate!、around_action の use_user_time_zone、アクションの順に入れ子になる。rescue_from で扱わない例外はコントローラーの外に出て、ミドルウェアの ShowExceptions が 500 の応答にする"
    >
      <T x={20} y={22} bold>
        Rack のミドルウェア（全リクエスト）
      </T>
      {mw.map((n, i) => (
        <g key={n}>
          <Box x={20} y={36 + i * 52} w={300} h={38} lines={n} mono={i < 5} fs={12} fill={i === 1 || i === 2 ? 'box5' : i === 5 ? 'bg' : 'box'} />
          {i < mw.length - 1 && <Arrow x1={170} y1={74 + i * 52} x2={170} y2={86 + i * 52} />}
        </g>
      ))}
      <Arrow d="M 320 315 L 400 315 L 400 60 L 418 60" />
      <T x={430} y={22} bold>
        コントローラーの中のチェーン
      </T>
      <rect x={420} y={36} width={340} height={290} rx={10} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={432} y={54} fs={12} mono>
        ActionController::Rescue（rescue_from）
      </T>
      <rect x={436} y={70} width={308} height={240} rx={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={448} y={88} fs={12} mono>
        before_action :authenticate!
      </T>
      <rect x={452} y={104} width={276} height={190} rx={10} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={464} y={122} fs={12} mono>
        around_action :use_user_time_zone
      </T>
      <Box x={490} y={150} w={200} h={110} lines={['アクション', 'OrdersController#index', 'show・create']} fs={12} fill="box5" accent subTone="muted" />
      <T x={430} y={346} fs={11.5} tone="muted">
        選ばれたコントローラーだけに適用・モデルを使える
      </T>
      <Arrow d="M 752 326 L 752 380 L 8 380 L 8 263 L 18 263" dashed />
      <T x={20} y={398} fs={11.5} tone="muted">
        rescue_from で扱わない例外は、ミドルウェアの ShowExceptions まで戻る
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 43,
  part: 9,
  title: 'Middleware Chain：Rack ミドルウェアと before_action でリクエストの前後の処理をつなぐ',
  summary:
    'API の各アクションに重複して書かれたリクエスト ID・認証・アクセスログ・エラーの応答を、Rack のミドルウェアとコントローラーのコールバックに分けて、順序を決めた段の並びにします。並びの順序で結果がどう変わるか、途中で打ち切ったときに外側の段で何が起きるか、段の間で値を渡す env に何を入れるかを、Rails 8.1 で動かして確かめます。',
  goals: [
    '共通の処理を各アクションに書いたコードで起きる問題（重複、書き忘れ、形式の不統一、打ち切った経路でのログの抜け）を説明できる',
    '包む方式のミドルウェアで、行きと帰りの処理がどの順に実行され、外側の段が内側の何を見られるかを説明できる',
    '自作の Rack ミドルウェアを書き、config.middleware.insert_after で位置を決め、bin/rails middleware で並びを確かめられる',
    'ログを書く段と例外を応答に変える段の順序で結果が変わる例を挙げ、順序の理由をコメントとテストに残せる',
    '段の間で受け渡す値を env に入れるときの規則（キーの名前、入れる値、書く段と読む段）を決められる',
    'before_action・around_action・rescue_from のチェーンの動きを説明し、処理をミドルウェアとコントローラーのどちらに置くかを判断できる',
    'Middleware Chain と Chain of Responsibility・Decorator・Intercepting Filter の違いを説明できる',
  ],
  prerequisites: [6, 10],
  sections: [
    {
      id: 'scene',
      title: 'API の各アクションに共通の処理が重複したコード',
      body: (
        <>
          <p>
            スマートフォンのアプリや取引先のシステムから呼ばれる、注文の JSON の API を考えます。どのリクエストにも、注文の処理とは別に次の4つの処理が必要です。
          </p>
          <ul>
            <li>
              リクエスト ID：1つのリクエストに付ける識別子（例：<code>c697eb11-22e6-...</code>）です。アプリのログ、エラーの応答、応答のヘッダーに同じ ID を出しておくと、「このエラーが出た」という問い合わせを受けたときに、どのリクエストのどのログかを ID で探せます。呼び出し側が <code>X-Request-Id</code> ヘッダーで送ってくればその値を使い、無ければサーバーで作ります。
            </li>
            <li>認証：<code>Authorization: Bearer トークン</code> のヘッダーから利用者を特定し、特定できなければ 401 を返します。</li>
            <li>アクセスログ：リクエストごとに、ID・メソッド・パス・状態コード・処理時間を JSON の1行で記録し、後から集計や調査に使います。</li>
            <li>エラーの応答：例外が起きたときに、呼び出し側が機械的に読める同じ形式の JSON で返します。</li>
          </ul>
          <p>
            利用者（users）はトークンと、表示に使うタイムゾーンを持ち、注文（orders）は利用者・商品コード（sku）・数量を持ちます。最初のコントローラーは4つの処理を各アクションに書いていました。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb（パターンを使う前）"
            code={`
class OrdersController < ActionController::API
  def index
    request_id = request.headers["X-Request-Id"].presence || SecureRandom.uuid
    started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    user = User.find_by(api_token: request.authorization.to_s.delete_prefix("Bearer "))
    return render json: { error: "unauthorized" }, status: :unauthorized unless user

    render json: user.orders.order(:id).as_json(only: %i[id sku quantity])
    log_access(request_id, started)
  rescue => e
    Rails.logger.error("[#{request_id}] #{e.class}: #{e.message}")
    render json: { error: "internal_error" }, status: :internal_server_error
  end

  def show
    request_id = request.headers["X-Request-Id"].presence || SecureRandom.uuid
    started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    order = Order.find(params[:id]) # 認証を書き忘れた
    render json: order.as_json(only: %i[id user_id sku quantity])
    log_access(request_id, started)
  end

  def create
    request_id = request.headers["X-Request-Id"].presence || SecureRandom.uuid
    started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    user = User.find_by(api_token: request.authorization.to_s.delete_prefix("Bearer "))
    return render json: { message: "認証に失敗しました" }, status: :unauthorized unless user

    order = user.orders.create!(params.expect(order: %i[sku quantity]))
    render json: order.as_json(only: %i[id sku quantity]), status: :created
    log_access(request_id, started)
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end

  private

  def log_access(request_id, started)
    ms = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started) * 1000).round
    Rails.logger.info({ request_id:, method: request.method, path: request.path, status: response.status, ms: }.to_json)
  end
end
`}
          />
          <p>
            このコントローラーに、佐藤さん（トークンあり）と鈴木さんの2人の利用者を用意して、5つのリクエストを送りました。<code>bin/rails runner</code> のスクリプトから Rails のアプリを呼び、応答と、アクションが書いた JSON のログの行を表示しています。例外の詳細は本番と同じく応答に含めない設定にしました。
          </p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4）"
            code={`
== 1. 一覧（トークンあり）
  応答: 200 []
  x-request-id: 773ace94-3783-45d9-bf53-32f9d5178e4a
  アクセスログ: {"request_id":"62ab4f3d-93eb-46bc-92d8-de371eb7a8c3","method":"GET","path":"/orders","status":200,"ms":4}
== 2. 一覧（トークンなし）
  応答: 401 {"error":"unauthorized"}
  x-request-id: 8c0d0e9b-5e8f-4148-a564-dc72543cb536
  アクセスログ: （なし）
== 3. 作成（トークンなし）
  応答: 401 {"message":"認証に失敗しました"}
  x-request-id: ebe5015e-4dcb-4259-b455-9cbe3e8a5ec2
  アクセスログ: （なし）
== 4. 作成（order が無い本文）
  応答: 400 {"status":400,"error":"Bad Request"}
  x-request-id: dcfce265-1a97-483d-97fb-1c26dc372b20
  アクセスログ: （なし）
== 5. 鈴木さんの注文を、トークンなしで取得
  応答: 200 {"id":1,"user_id":2,"sku":"MUG-1","quantity":1}
  x-request-id: aff28d32-1a56-456c-b87a-417a38a8dc3b
  アクセスログ: {"request_id":"54befdf8-472f-43f1-b125-306c11730e54","method":"GET","path":"/orders/1","status":200,"ms":1}
`}
          />
          <p>結果から、次の誤りが分かります。</p>
          <ul>
            <li>
              リクエスト ID の食い違い：1 と 5 では、ログの <code>request_id</code> と応答の <code>x-request-id</code> が違う値です。Rails はミドルウェアの <code>ActionDispatch::RequestId</code> で、すでに ID を決めて応答のヘッダーに付けています（<ChapterLink n={25} section="request-id" />）。アクションが別に <code>SecureRandom.uuid</code> で ID を作ったので、利用者が問い合わせに書いてくる ID でログを探せません。
            </li>
            <li>
              認証の書き忘れ：5 では、トークンの無いリクエストに鈴木さんの注文が返りました。<code>show</code> に認証を書き忘れたので、ID を順に変えれば誰の注文でも読めます。
            </li>
            <li>打ち切った経路のログの抜け：2・3・4 はログが書かれていません。ログの行は成功したときの最後に書いているので、途中で <code>return</code> した経路と、例外の経路では書かれません。</li>
            <li>
              エラーの形式の不統一：401 の本文が <code>error</code> と <code>message</code> で違い、4 の <code>ActionController::ParameterMissing</code> は、どの <code>rescue</code> にも当たらずに Rails の既定の形式（<code>{'{"status":400,"error":"Bad Request"}'}</code>）で返りました。どの形式にもリクエスト ID が入っていません。
            </li>
          </ul>
          <p>
            どれも、同じ処理を各アクションに書き写したことから起きています。新しいアクションを足すたびに4つの処理を書き写すことになり、書き忘れや、書き方の少しずつの違いがまた起きます。次の節では、これらの処理をアクションの外に出し、決めた順序でアクションの前後に実行する方法を説明します。
          </p>
        </>
      ),
    },
    {
      id: 'idea',
      title: 'リクエストの前後の処理を、順序を決めた段の並びにする',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term en="Middleware Chain">Middleware Chain</Term> は、多くのリクエストに共通する処理を1つずつ独立した部品（ミドルウェア）にし、決めた順序でつないで、業務の処理（ハンドラー）の前後に実行するパターンです。Rails では、ハンドラーはルーティングとコントローラーです。ミドルウェアの形（<code>initialize(app)</code> と <code>call(env)</code>）と Rails の標準のミドルウェアの並びは <ChapterLink n={6} section="middleware" /> と <ChapterLink n={6} section="rails-stack" /> で扱ったので、この章では、並びをどう設計するか（何をミドルウェアにするか、どの順序に置くか、どこで打ち切るか、段の間で何を渡すか）を扱います。
          </p>
          <p>
            並びの中で次にあるミドルウェア（最後のミドルウェアにとってはハンドラー）を、この章では「次の段」と呼びます。Rack のミドルウェアでは、次の段は <code>initialize</code> で受け取った <code>@app</code> で、<code>@app.call(env)</code> が次の段を呼ぶ処理です。<code>@app.call</code> を呼ぶ前に行う処理を<Term en="inbound processing">行きの処理</Term>、戻った後に行う処理を<Term en="outbound processing">帰りの処理</Term>と呼びます。必要なら次の段を呼ばずに自分で応答を返して、そこで処理を<Term en="short-circuit">打ち切り</Term>ます。
          </p>
          <Callout kind="note" title="Chain of Responsibility との違い">
            <p>
              MSDP のカタログでは、Middleware Chain を GoF の Chain of Responsibility を具体化したものとして位置付けています。ただし、両者の動き方は同じではありません。GoF の Chain of Responsibility の目的は「要求を処理できる機会を複数のオブジェクトに与え、要求の送り手と受け手の結合を避ける。受け手のオブジェクトを鎖にして、処理するオブジェクトが現れるまで要求を鎖に沿って渡す」ことで<Ref n={2} />、鎖のどれか1つが要求を処理したら終わります。Middleware Chain では、通常はすべての段が行きと帰りの処理を行い、最後のハンドラーが応答を作ります。打ち切るのは認証の失敗のような例外的な場合です。この動き方は、Java の Web アプリケーションのパターン集（Core J2EE Patterns）の Intercepting Filter<Ref n={3} /> や、GoF の Decorator<Ref n={4} /> に近いものです。違いは alternatives の節で整理します。
            </p>
          </Callout>
          <h3>使う場面</h3>
          <p>Middleware Chain が必要になるのは、多くのリクエストに、業務とは別の同じ処理を行う場合です。対象がジョブや外部への HTTP リクエストの場合も同じ形を使います（alternatives の節の Sidekiq と Faraday）。</p>
          <ul>
            <li>認証：トークンやセッションから利用者を特定し、特定できなければ打ち切る</li>
            <li>ロギング：リクエストの経路、応答の状態コード、処理時間を記録する</li>
            <li>エラーの処理：例外を決まった形式のエラーの応答に変える</li>
            <li>リクエストの検証：本文の形式や大きさを確かめる</li>
            <li>そのほか：リクエスト ID、CORS（別のオリジンのページからのリクエストを許可するための応答ヘッダー）、圧縮、メンテナンス中の応答、リクエストの回数の制限など</li>
          </ul>
          <p>次のような兆候があれば、Middleware Chain が必要になっている可能性があります。</p>
          <ul>
            <li>アクションごとに、同じ <code>rescue</code>、ログの出力、認証の確認が書き写されている</li>
            <li>新しいアクションを足したときに、認証の確認を書き忘れる</li>
            <li>アクションによって、エラーの応答の形式やログの項目が少しずつ違う</li>
            <li>途中で応答を返す経路（認証の失敗など）で、ログやヘッダーの付与が抜けている</li>
          </ul>
          <h3>設計上の制約</h3>
          <ul>
            <li>共通の処理を1か所にまとめたい。一方で、一部の経路（ロードバランサーがサーバーの稼働を確かめるヘルスチェックの <code>/up</code> や、認証の要らない公開の API）だけは処理を省きたい。</li>
            <li>ミドルウェアを互いに独立させたい。一方で、前の段が得た値（リクエスト ID、認証した利用者）を後の段やハンドラーで使いたい。</li>
            <li>順序を自由に組み替えたい。一方で、順序によって結果が変わる（どの段の失敗がログに残るか、など）。</li>
            <li>段の間で受け渡す値を明示したい。一方で、Rack の env は型の無いハッシュで、どの段が何を入れたかはコードを読まないと分からない。</li>
          </ul>
          <h3>解決方法</h3>
          <p>Middleware Chain は次の4つの要素で構成します。</p>
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
                  <th scope="row">ミドルウェア</th>
                  <td>
                    <code>ActionDispatch::RequestId</code>（Rails の標準）、<code>ApiAccessLog</code>・<code>MaintenanceMode</code>（自作）
                  </td>
                  <td>1つの共通の処理を行い、次の段を呼ぶ（または呼ばずに応答を返す）</td>
                </tr>
                <tr>
                  <th scope="row">ハンドラー</th>
                  <td>ルーティングと <code>OrdersController</code></td>
                  <td>業務の処理を行い、応答を作る。共通の処理は書かない</td>
                </tr>
                <tr>
                  <th scope="row">つなぐ処理</th>
                  <td>
                    <code>config.middleware</code>（Rails が起動時に <code>ActionDispatch::MiddlewareStack</code> で組み立てる）
                  </td>
                  <td>ミドルウェアの並びとハンドラーを1つの Rack アプリケーションにまとめる</td>
                </tr>
                <tr>
                  <th scope="row">リクエストごとの入れ物</th>
                  <td>Rack の env（<code>request.env</code>）</td>
                  <td>前の段が得た値を、後の段とハンドラーに渡す</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>ミドルウェアのつなぎ方には、主に2つの方式があります。</p>
          <ul>
            <li>
              包む方式：各段が、自分より内側の段の処理全体の前と後に処理を行う方式です。<code>@app.call(env)</code> を呼ぶと、内側の段がすべて終わった後の応答が戻り値として返るので、次の段を呼ぶ前と後の両方に処理を書けます。Rack<Ref n={1} /> と、Node.js の Koa はこの方式で、Koa はこの流れを、下流へ進んでから上流へ戻る「カスケード」と説明しています<Ref n={5} />。
            </li>
            <li>
              順に渡す方式：Node.js の Express のミドルウェアは <code>(req, res, next)</code> を受け取り、応答は <code>res</code> に書き込みます。<code>next()</code> は次の段に処理を渡す関数で、応答を戻り値として受け取る形ではありません<Ref n={6} />。
            </li>
          </ul>
          <p>ミドルウェアを書くときは、次の規則を守ります。</p>
          <ul>
            <li>1つのミドルウェアは1つの共通の処理だけを行う。</li>
            <li>打ち切るときは <code>@app.call</code> を呼ばずに応答を返す。<code>@app.call</code> を2回呼ばない。</li>
            <li>エラーを応答に変える段は、例外を起こす可能性のある段より外側に置く。</li>
            <li>入れ物（env）に入れる値は、どの段が入れ、どの段が使うかを決めておく。</li>
            <li>順序を意図して決め、理由を書いておく。</li>
          </ul>
          <p>この章のアプリでは、外側から次の順に並べます。どの位置にも理由があります。</p>
          <ol>
            <li>ActionDispatch::RequestId：最初に ID を決め、以降のログとエラーの応答で使えるようにする（Rails の標準の位置）。</li>
            <li>ApiAccessLog：ID を使えるように RequestId の内側に置き、例外から作られた 500 も記録できるように、例外を応答に変える ShowExceptions の外側に置く。</li>
            <li>MaintenanceMode：メンテナンス中の 503 もログに残るように ApiAccessLog の内側に置き、ルーティング・DB・認証より前に打ち切る。</li>
            <li>コントローラーの中：認証（before_action）、タイムゾーンの切り替え（around_action）、アプリの例外の応答（rescue_from）。モデルを使う処理と、コントローラーごとに変わる処理はここに置く（controller-chain の節）。</li>
          </ol>
          <h3>構造</h3>
          <Figure n="79-1" title="包む方式のミドルウェアの実行順序" caption="この章のアプリの並びの模式図。各段は @app.call を呼ぶ前に行きの処理、戻った後に帰りの処理を行う。破線の矢印は、戻ってくる応答を表す。">
            <OnionFigure />
          </Figure>
          <p>
            図 79-1 は包む方式のミドルウェアの実行順序です。リクエストは外側の段から順に内側へ進み、コントローラーが返した応答は、逆の順で外側へ戻ります。外側の段ほど、内側の段で起きたこと（成功、打ち切り、例外から作られた応答）を見ることができます。
          </p>
          <Figure n="79-2" title="認証に失敗して打ち切る流れ" caption="破線の段は実行されない。">
            <ShortCircuitFigure />
          </Figure>
          <p>
            図 79-2 はトークンの無いリクエストを打ち切る流れです。コントローラーの before_action が 401 を返すので、アクションは実行されません。401 の応答は外側の段を通って戻るので、ApiAccessLog がログに書き、RequestId が x-request-id ヘッダーを付けます。パターンを使う前のコードでは、この経路でログが抜けていました。
          </p>
          <Figure n="79-3" title="ログと例外処理の順序による違い" caption="test の節の spec/middleware/stack_order_spec.rb で、両方の並びの結果を確かめている。">
            <OrderFigure />
          </Figure>
          <p>
            図 79-3 は順序で結果が変わる例です。コントローラーで例外が起きたとき、ApiAccessLog が ShowExceptions より外側にあれば、ShowExceptions が作った 500 の応答を ApiAccessLog が帰りの処理で受け取って記録します。ApiAccessLog が内側にあると、例外は ApiAccessLog の帰りの処理を通らずに外へ出るので、何も記録されません。どちらの並びでも利用者には 500 が返るので、応答を見るだけではこの違いに気づけません。
          </p>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rack ミドルウェアを書いて、Rails のスタックに入れる',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
lib/middleware/
  api_access_log.rb       # ApiAccessLog（自作のミドルウェア）
  maintenance_mode.rb     # MaintenanceMode（自作のミドルウェア）
config/application.rb     # require と config.middleware（並びと順序の理由）
app/controllers/
  application_controller.rb   # before_action・around_action・rescue_from（controller-chain の節）
  orders_controller.rb        # 業務の処理だけ
spec/
  middleware/api_access_log_spec.rb・maintenance_mode_spec.rb・stack_order_spec.rb
  requests/orders_spec.rb・middleware_stack_spec.rb
`}
          />
          <p>
            ミドルウェアは <code>lib/middleware</code> に置き、<code>config.autoload_lib(ignore: %w[assets tasks middleware])</code> でオートロードの対象から外して、<code>config/application.rb</code> で <code>require</code> します。Rails のガイドも、ミドルウェアのクラスは再読み込みできないので、<code>lib/middleware</code> に置いて <code>require</code> で読み込む書き方を挙げています<Ref n={8} />。Rails は起動時にミドルウェアのオブジェクトを1回だけ作るので（<ChapterLink n={6} section="build" />）、コードを書き換えて再読み込みしても、動いているミドルウェアは古いクラスのままだからです。
          </p>
          <p>
            1回だけ作られるということは、1つのミドルウェアのオブジェクトを、すべてのリクエストと、Puma のすべてのスレッドが共有するということです。リクエストごとの値をインスタンス変数（<code>@started</code> など）に入れると、別のスレッドのリクエストの値で上書きされます。リクエストごとの値は、<code>call</code> の中のローカル変数か env に置きます。
          </p>
          <h3>Rails がすでに持っている段を使う</h3>
          <p>
            リクエスト ID は、自分でミドルウェアを書く必要がありません。Rails の標準の <code>ActionDispatch::RequestId</code> が、<code>X-Request-Id</code> ヘッダーの値（無ければ新しい UUID）を ID にし、応答のヘッダーに付けます<Ref n={9} />。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/request_id.rb（Rails 8.1.4.1、31〜35行目）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/request_id.rb#L31-L35`}
            code={`
    def call(env)
      req = ActionDispatch::Request.new env
      req.request_id = make_request_id(req.get_header(@env_header))
      @app.call(env).tap { |_status, headers, _body| headers[@header] = req.request_id }
    end
`}
          />
          <p>
            行きの処理で ID を env の <code>action_dispatch.request_id</code> に入れ（<code>req.request_id =</code> がこのキーに書きます）、帰りの処理で応答のヘッダーに付けています。内側の段は env から、コントローラーは <code>request.request_id</code> から同じ値を読めます。パターンを使う前のコードの ID が食い違ったのは、この段が決めた ID を使わずに、アクションでもう1つ作ったからです。
          </p>
          <h3>アクセスログのミドルウェア</h3>
          <Code
            lang="ruby"
            title="lib/middleware/api_access_log.rb"
            code={`
# 1つのリクエストにつき1行、JSON のアクセスログを書くミドルウェア
class ApiAccessLog
  def initialize(app, log: ->(line) { Rails.logger.info(line) },
                 clock: -> { Process.clock_gettime(Process::CLOCK_MONOTONIC) })
    @app = app
    @log = log
    @clock = clock
  end

  def call(env)
    # 行きの処理：開始の時刻と、リクエストの値を読んでおく
    method = env["REQUEST_METHOD"]
    path = env["PATH_INFO"]
    started = @clock.call

    status, headers, body = @app.call(env)

    # 帰りの処理：内側の段が決めた状態コードと、入れ物（env）に残した値を記録する
    @log.call({
      request_id: env["action_dispatch.request_id"], # 外側の ActionDispatch::RequestId が入れた値
      method:, path:, status:,
      user_id: env["app.user_id"], # 内側のコントローラーが入れた値。認証の前に終わったら nil
      ms: ((@clock.call - started) * 1000).round
    }.to_json)
    [status, headers, body]
  end
end
`}
          />
          <p>
            <code>@app.call(env)</code> より前が行きの処理、後が帰りの処理です。帰りの処理では、外側の RequestId が入れた ID と、内側のコントローラーが入れた利用者の ID を env から読みます。ログを書く処理（<code>log:</code>）と時計（<code>clock:</code>）はキーワード引数の既定値で受け取り、テストで差し替えられるようにしました（<ChapterLink n={40} section="idea" />）。<code>log:</code> の既定値は呼ばれたときに <code>Rails.logger</code> を読むラムダなので、起動後に <code>Rails.logger</code> の出力先を増やしても反映されます。
          </p>
          <p>
            処理時間は <code>@app.call</code> が戻るまでの時間で、Rack 3 で本文を少しずつ送る応答（ストリーミング）では、本文を送り終えるまでの時間は含みません。
          </p>
          <h3>メンテナンス中に打ち切るミドルウェア</h3>
          <Code
            lang="ruby"
            title="lib/middleware/maintenance_mode.rb"
            code={`
# メンテナンス中は、ルーティングとコントローラーに届く前に 503 を返すミドルウェア
class MaintenanceMode
  BODY = { error: "maintenance" }.to_json.freeze

  # enabled は「今メンテナンス中か」を返す callable。リクエストのたびに呼ぶ
  def initialize(app, enabled:, allow_paths: ["/up"])
    @app = app
    @enabled = enabled
    @allow_paths = allow_paths
  end

  def call(env)
    return @app.call(env) if @allow_paths.include?(env["PATH_INFO"]) || !@enabled.call

    # 次の段を呼ばずに応答を返す（打ち切る）
    [503, { "content-type" => "application/json", "retry-after" => "600" }, [BODY]]
  end
end
`}
          />
          <p>
            メンテナンス中は <code>@app.call</code> を呼ばずに 503 の応答を返します。内側のルーティング・コントローラー・DB には何も届きません。<code>retry-after</code> は何秒後に再試行してよいかを呼び出し側に伝えるヘッダーで、Rack 3 の応答のヘッダー名は小文字で書きます<Ref n={1} />。メンテナンス中かどうかはリクエストのたびに <code>enabled</code> を呼んで確かめるので、サーバーを再起動せずに切り替えられます。<code>/up</code> は通すので、ロードバランサーはメンテナンス中もサーバーを稼働中と判断します。
          </p>
          <h3>config.middleware で並びに入れる</h3>
          <Code
            lang="ruby"
            title="config/application.rb（抜粋）"
            code={`
# lib/middleware は再読み込みの対象にしない。ミドルウェアは起動時に1回だけ作られるので require で読み込む
require_relative "../lib/middleware/api_access_log"
require_relative "../lib/middleware/maintenance_mode"

module Ch43
  class Application < Rails::Application
    config.load_defaults 8.1
    config.autoload_lib(ignore: %w[assets tasks middleware])
    # …（省略）
    config.api_only = true

    # ミドルウェアの順序（外側から）。位置を変えるときは spec/requests/middleware_stack_spec.rb も直す
    #   ActionDispatch::RequestId … Rails の標準。リクエスト ID を決め、応答の x-request-id に付ける
    #   ApiAccessLog              … RequestId の内側に置き、ログに ID を書けるようにする。
    #                               ShowExceptions の外側にあるので、例外から作られた 500 も記録できる
    #   MaintenanceMode           … ApiAccessLog の内側に置き、メンテナンス中の 503 もログに残す。
    #                               ルーティング・DB・認証より前に打ち切る
    config.middleware.insert_after ActionDispatch::RequestId, ApiAccessLog
    config.middleware.insert_after ApiAccessLog, MaintenanceMode,
                                   enabled: -> { Rails.root.join("tmp/maintenance.txt").exist? }
  end
end
`}
          />
          <p>
            <code>insert_after</code> は指定したミドルウェアの直後（内側）に、<code>insert_before</code> は直前（外側）に、<code>use</code> は並びの末尾（最も内側）に追加します<Ref n={7} />（メソッドの一覧は <ChapterLink n={6} section="customize" />）。<code>use</code> で足すと ShowExceptions より内側に入り、図 79-3 の右の並びになります。並びの理由は置いた場所のコメントに書きます。production の環境で <code>bin/rails middleware</code> を実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=production bin/rails middleware）"
            code={`
use ActionDispatch::AssumeSSL
use ActionDispatch::SSL
use Rack::Sendfile
use ActionDispatch::Static
use ActionDispatch::Executor
use Rack::Runtime
use ActionDispatch::RequestId
use ApiAccessLog
use MaintenanceMode
use ActionDispatch::RemoteIp
use Rails::Rack::SilenceRequest
use Rails::Rack::Logger
use ActionDispatch::ShowExceptions
use ActionDispatch::DebugExceptions
use ActionDispatch::Callbacks
use Rack::Head
use Rack::ConditionalGet
use Rack::ETag
run Ch43::Application.routes
`}
          />
          <p>
            上にあるものほど外側です。RequestId の直後に ApiAccessLog、その直後に MaintenanceMode が入り、どちらも Rails::Rack::Logger と ShowExceptions より外側にあります。そのため、MaintenanceMode の 503 は Rails のログ（<code>Started GET ...</code> の行）には出ませんが、ApiAccessLog には記録されます。<code>config.api_only = true</code> のアプリなので、Cookie とセッションのミドルウェアは入っていません。
          </p>
          <p>
            Rails::Rack::SilenceRequest は production で <code>/up</code> のリクエストの間だけ Rails のログを止める段です。ApiAccessLog はその外側にあり、止める範囲が終わってからログを書くので、<code>/up</code> へのヘルスチェックも1回ごとに記録されます。記録が要らなければ、ApiAccessLog でも <code>/up</code> を除きます。
          </p>
          <h3>入れ物（env）に何を入れるか</h3>
          <p>この章の並びで env を通して受け渡す値は、次の2つだけです。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">キー</th>
                  <th scope="col">書く段</th>
                  <th scope="col">読む段</th>
                  <th scope="col">値</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <code>action_dispatch.request_id</code>
                  </th>
                  <td>RequestId（行き）</td>
                  <td>ApiAccessLog（帰り）、コントローラー（<code>request.request_id</code>）</td>
                  <td>文字列の ID</td>
                </tr>
                <tr>
                  <th scope="row">
                    <code>app.user_id</code>
                  </th>
                  <td>ApplicationController#authenticate!</td>
                  <td>ApiAccessLog（帰り）</td>
                  <td>利用者の ID（整数）。認証の前に打ち切ったら入らない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>キーと値は次の規則で決めました。</p>
          <ul>
            <li>
              キーには接頭辞を付けます。Rack の仕様は、サーバーとアプリが env に置くキーにはドットを1つ以上含め、ほかと重ならない接頭辞を付けることを求め、<code>rack.</code> は Rack の仕様のために予約しています<Ref n={1} />。この章では自分のアプリのキーを <code>app.</code> で始めました。
            </li>
            <li>
              値は ID のような小さな値にし、<code>User</code> のオブジェクトは入れません。ApiAccessLog は Rails が再読み込みしない <code>lib/middleware</code> のクラスなので、再読み込みされる <code>app/models</code> のクラスに依存させないためです。ログに利用者の名前が必要になっても、ミドルウェアから DB を引かずに、コントローラーが env に入れる値を増やすかを検討します。
            </li>
            <li>
              内側の段が入れた値を外側の段が読めるのは、帰りの処理だけです。ApiAccessLog の行きの処理の時点では、<code>app.user_id</code> はまだ入っていません。
            </li>
          </ul>
          <h3>パターンを使っていないコードから直す順序</h3>
          <ol className="steps">
            <li>今の動作をテストで固定する：成功、認証の失敗、本文の誤り、ほかの利用者の注文の4つの場面で、状態コード、ヘッダー、ログを確かめる request spec を書きます。ログの抜けと ID の食い違いは、直したい点としてテストに書いておきます。</li>
            <li>Rails の標準の段を使う：アクションの中の <code>SecureRandom.uuid</code> を消し、<code>request.request_id</code> を使います。</li>
            <li>外側の処理から移す：ログを ApiAccessLog に移してアクションから消し、<code>insert_after ActionDispatch::RequestId</code> で並びに入れます。</li>
            <li>打ち切る処理をコントローラーのチェーンに移す：認証を ApplicationController の before_action に、エラーの応答を rescue_from に移し、アクションは <code>current_user</code> を使うだけにします（controller-chain の節）。</li>
            <li>すべてのアクションで共有する：<code>show</code> を含むすべてのアクションから共通の処理を消します。認証は ApplicationController にあるので、<code>show</code> の書き忘れも直ります。</li>
            <li>必要な段を足す：メンテナンス中の応答のように、ルーティングより前に打ち切りたい処理をミドルウェアにします。</li>
          </ol>
          <p>
            前の節と同じ5つのリクエストに、佐藤さんのトークンで鈴木さんの注文を読むリクエスト（6）と、メンテナンス中のリクエスト（7）を加えて、直した後のコードで実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（直した後。注文と利用者の ID は前の実行と違う）"
            code={`
== 1. 一覧（トークンあり）
  応答: 200 []
  x-request-id: c697eb11-22e6-4a9e-9855-a373768e2ed1
  アクセスログ: {"request_id":"c697eb11-22e6-4a9e-9855-a373768e2ed1","method":"GET","path":"/orders","status":200,"user_id":7,"ms":16}
== 2. 一覧（トークンなし）
  応答: 401 {"error":"unauthorized","request_id":"c4a459fe-fe71-4766-b134-631b89864028"}
  x-request-id: c4a459fe-fe71-4766-b134-631b89864028
  アクセスログ: {"request_id":"c4a459fe-fe71-4766-b134-631b89864028","method":"GET","path":"/orders","status":401,"user_id":null,"ms":1}
== 3. 作成（トークンなし）
  応答: 401 {"error":"unauthorized","request_id":"14c64a1d-df73-46c5-9214-8dab2c247648"}
  x-request-id: 14c64a1d-df73-46c5-9214-8dab2c247648
  アクセスログ: {"request_id":"14c64a1d-df73-46c5-9214-8dab2c247648","method":"POST","path":"/orders","status":401,"user_id":null,"ms":1}
== 4. 作成（order が無い本文）
  応答: 400 {"error":"bad_request","request_id":"fdae9b0f-3f7c-4d6f-a593-e435bae48bdd"}
  x-request-id: fdae9b0f-3f7c-4d6f-a593-e435bae48bdd
  アクセスログ: {"request_id":"fdae9b0f-3f7c-4d6f-a593-e435bae48bdd","method":"POST","path":"/orders","status":400,"user_id":7,"ms":2}
== 5. 鈴木さんの注文を、トークンなしで取得
  応答: 401 {"error":"unauthorized","request_id":"c461f537-f342-45a1-afc0-d97cf4ec42d6"}
  x-request-id: c461f537-f342-45a1-afc0-d97cf4ec42d6
  アクセスログ: {"request_id":"c461f537-f342-45a1-afc0-d97cf4ec42d6","method":"GET","path":"/orders/3","status":401,"user_id":null,"ms":1}
== 6. 鈴木さんの注文を、佐藤さんのトークンで取得
  応答: 404 {"error":"not_found","request_id":"2e373d4c-4f21-4132-8f09-b164a584c167"}
  x-request-id: 2e373d4c-4f21-4132-8f09-b164a584c167
  アクセスログ: {"request_id":"2e373d4c-4f21-4132-8f09-b164a584c167","method":"GET","path":"/orders/3","status":404,"user_id":7,"ms":2}
== 7. メンテナンス中の一覧
  応答: 503 {"error":"maintenance"}
  x-request-id: f0fed626-8ee3-466f-b42a-bd0191da9db4
  アクセスログ: {"request_id":"f0fed626-8ee3-466f-b42a-bd0191da9db4","method":"GET","path":"/orders","status":503,"user_id":null,"ms":0}
`}
          />
          <p>
            どのリクエストもアクセスログが1行書かれ、ログの ID と x-request-id が一致しています。401・400・404 のエラーの本文は同じ形式で、リクエスト ID を含みます。トークンの無い 5 は 401 に、ほかの利用者の注文を読もうとした 6 は 404 になりました。7 のメンテナンス中の 503 は、コントローラーに届く前に返り、ログと ID は付いています。
          </p>
        </>
      ),
    },
    {
      id: 'controller-chain',
      title: 'コントローラーの中のチェーン：before_action・around_action・rescue_from',
      body: (
        <>
          <p>
            Rails のコントローラーも、アクションの前後に処理をつなぐ仕組みを持っています。<code>before_action</code>・<code>around_action</code>・<code>after_action</code> で登録するメソッドを<Term en="action callback">コールバック</Term>と呼び、アクションの前後に、登録した順で実行されます（before_action の基本は <ChapterLink n={10} section="before-action" />）。この章では、認証、タイムゾーンの切り替え、アプリの例外の応答を、ApplicationController のチェーンに置きました。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/application_controller.rb"
            code={`
class ApplicationController < ActionController::API
  include ActionController::HttpAuthentication::Token::ControllerMethods

  # コールバックは書いた順に実行する。around_action は current_user を使うので authenticate! の後に書く
  before_action :authenticate!
  around_action :use_user_time_zone

  # 例外の種類ごとに、同じ形式のエラーの応答にする。ここに無い例外は ShowExceptions（ミドルウェア）が 500 にする
  rescue_from ActiveRecord::RecordNotFound, with: -> { render_error(:not_found, "not_found") }
  rescue_from ActionController::ParameterMissing, with: -> { render_error(:bad_request, "bad_request") }
  rescue_from ActiveRecord::RecordInvalid, with: ->(e) { render_error(:unprocessable_content, "invalid", e.record.errors.full_messages) }

  private

  attr_reader :current_user

  def authenticate!
    @current_user = authenticate_with_http_token { |token, _options| User.find_by(api_token: token) }
    return render_error(:unauthorized, "unauthorized") unless @current_user # render すると、以降のコールバックとアクションは実行されない

    request.env["app.user_id"] = @current_user.id # 外側の ApiAccessLog が帰りの処理で読む
  end

  # アクションの間だけ利用者のタイムゾーンにし、終わったら（例外のときも）元に戻す
  def use_user_time_zone(&action)
    Time.use_zone(current_user.time_zone, &action)
  end

  def render_error(status, code, details = nil)
    render json: { error: code, details:, request_id: request.request_id }.compact, status:
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb"
            code={`
class OrdersController < ApplicationController
  def index
    render json: current_user.orders.order(:id).as_json(only: %i[id sku quantity created_at])
  end

  def show
    render json: current_user.orders.find(params[:id]).as_json(only: %i[id sku quantity created_at])
  end

  def create
    order = current_user.orders.create!(params.expect(order: %i[sku quantity]))
    render json: order.as_json(only: %i[id sku quantity created_at]), status: :created
  end
end
`}
          />
          <p>
            OrdersController のアクションは業務の処理だけになりました。<code>show</code> は <code>current_user.orders.find</code> で探すので、ほかの利用者の注文は見つからずに RecordNotFound になり、rescue_from が 404 にします（関連から探す認可は <ChapterLink n={21} section="object-authorization" />）。
          </p>
          <h3>before_action で打ち切る</h3>
          <p>
            <code>authenticate_with_http_token</code> は、<code>Authorization</code> ヘッダーの <code>Bearer</code> か <code>Token</code> に続く値を取り出してブロックに渡すメソッドで、ActionController::API には含まれないので <code>include</code> します<Ref n={10} />。利用者が見つからなければ 401 を render します。before_action の中で render か redirect_to を呼ぶと、その後のコールバックとアクションは実行されません<Ref n={11} />。Rails はコールバックを1つ実行するたびに、応答が作られたか（<code>performed?</code>）を確かめて、作られていればチェーンを止めます<Ref n={12} />。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/abstract_controller/callbacks.rb（Rails 8.1.4.1、34〜37行目）"
            href={`${GH}/actionpack/lib/abstract_controller/callbacks.rb#L34-L37`}
            code={`
    included do
      define_callbacks :process_action,
                       terminator: ->(controller, result_lambda) { result_lambda.call; controller.performed? },
                       skip_after_callbacks_if_terminated: true
`}
          />
          <p>トークンの無い <code>GET /orders</code> では、Rails のログに次の行が出ました。</p>
          <Code
            lang="text"
            title="実行結果（Rails のログ。時刻を省略）"
            code={`
Started GET "/orders" for 127.0.0.1 at …
Processing by OrdersController#index as HTML
Filter chain halted as :authenticate! rendered or redirected
Completed 401 Unauthorized in 1ms (Views: 0.1ms | ActiveRecord: 0.0ms (0 queries, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            <code>Filter chain halted</code> は、authenticate! が応答を作ったのでチェーンを止めたことを表します。ミドルウェアが <code>@app.call</code> を呼ばずに応答を返すのと同じ打ち切りで、401 の応答はその後、図 79-2 のように外側のミドルウェアを通って戻ります。
          </p>
          <h3>around_action で前後を挟む</h3>
          <p>
            around_action に登録したメソッドは、ブロックを受け取り、ブロックを呼んだ所でアクション（と、それより内側のコールバック）を実行します。ブロックを呼ぶことは、ミドルウェアの <code>@app.call</code> に当たります。Rails のガイドによると、around_action の処理はアクションの描画も含み、アクションで例外が起きても <code>ensure</code> の中の後処理は実行されます。after_action はアクションが例外で終わると実行されません<Ref n={11} />。
          </p>
          <p>
            <code>use_user_time_zone</code> は <code>Time.use_zone</code> にアクションのブロックを渡すので、アクションの間だけ <code>Time.zone</code> が利用者のタイムゾーンになり、終わると例外のときも元に戻ります。ニューヨークの利用者の注文の <code>created_at</code> は <code>2026-11-20T22:00:00.000-05:00</code> のように返ります（test の節）。
          </p>
          <p>コールバックは書いた順に実行されます。OrdersController のチェーンの順と、around_action を before_action より先に書いたコントローラーを実行した結果です。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner）"
            code={`
== OrdersController のコールバック（実行する順）
  before authenticate!
  around use_user_time_zone
== around_action を先に書いた場合
  NoMethodError: undefined method 'time_zone' for nil
`}
          />
          <p>
            around_action を先に書くと、authenticate! が <code>@current_user</code> を入れる前に <code>time_zone</code> を読んで NoMethodError になりました。ミドルウェアの並びと同じく、コントローラーのチェーンでも、後の段が前の段の結果を使うなら順序に理由があり、その理由をコメントに書いておきます。
          </p>
          <Callout kind="warn">
            <p>
              around_action で <code>Rails.logger.tagged("user:1") {'{'} yield {'}'}</code> のように、ログにタグを付けるブロックの中でアクションを実行する書き方には注意が要ります。Rails 8.1.4.1 の <code>Rails.logger</code>（ActiveSupport::BroadcastLogger）は、出力先のロガーが2つ以上 <code>tagged</code> に応答すると、それぞれのロガーの <code>tagged</code> にブロックを渡します<Ref n={14} />。テストでタグ付きのロガーを出力先に足して確かめたところ、アクションが2回実行され、AbstractController::DoubleRenderError になりました。
            </p>
          </Callout>
          <h3>rescue_from で例外を応答に変える</h3>
          <p>
            rescue_from は、アクションで起きた例外をクラスごとにハンドラーで受け取り、応答に変えます（例外が応答になるまでの全体は <ChapterLink n={10} section="exceptions" />）。ActionController::API は、コールバックを含むモジュールより後に例外を受け取るモジュール（ActionController::Rescue）を組み込んでいて、ソースのコメントには「できるだけ多くを囲むために rescue を最後に加える」とあります<Ref n={13} />。そのため、アクションだけでなく before_action・around_action の中で起きた例外も rescue_from で受け取れます。ハンドラーは下に書いたものから順に探されるので<Ref n={15} />、<code>StandardError</code> のような広いクラスのハンドラーを書くなら、いちばん上に書きます。
          </p>
          <p>
            rescue_from に無い例外はコントローラーの外に出て、ミドルウェアの ShowExceptions が 500 などの応答にします。この章では、アプリで意味のある例外（見つからない、パラメーターが無い、検証の失敗）だけを rescue_from で扱い、想定していない例外は ShowExceptions に任せました。すべての例外を rescue_from で 500 にすると、例外がコントローラーの外へ出ないので、例外を記録するミドルウェアやエラーの監視の仕組みに届かなくなることがあります。
          </p>
          <Figure n="79-4" title="Rack のミドルウェアとコントローラーのチェーン" caption="この章のアプリの2つのチェーンを並べた模式図。右の入れ子は、外側の枠ほど先に実行が始まり、最後に終わることを表す。">
            <TwoChainsFigure />
          </Figure>
          <p>
            図 79-4 は2つのチェーンの関係です。左のミドルウェアはすべてのリクエストに適用され、どのコントローラーが呼ばれるかはまだ決まっていません。右のコントローラーのチェーンは、ルーティングが選んだコントローラーだけに適用され、モデルやパラメーターを使えます。rescue_from で扱わない例外は、破線のようにミドルウェアの ShowExceptions まで戻ります。
          </p>
          <h3>どちらに置くか</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">判断の観点</th>
                  <th scope="col">Rack のミドルウェア</th>
                  <th scope="col">コントローラーのコールバック</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">適用する範囲</th>
                  <td>すべてのリクエスト（ヘルスチェック・存在しないパスも含む）</td>
                  <td>そのコントローラーと継承したコントローラー。only・except・skip_before_action で絞れる</td>
                </tr>
                <tr>
                  <th scope="row">使える情報</th>
                  <td>env（ヘッダー・パス・外側の段が入れた値）</td>
                  <td>ルーティングの結果、params、モデル、current_user</td>
                </tr>
                <tr>
                  <th scope="row">Rails の標準の段との関係</th>
                  <td>位置によって、Rails のログ・例外の処理の外側にも内側にも置ける</td>
                  <td>常にルーティングの内側。例外は rescue_from の後に ShowExceptions へ</td>
                </tr>
                <tr>
                  <th scope="row">再読み込み</th>
                  <td>されない（変更したら再起動）</td>
                  <td>development では変更が反映される</td>
                </tr>
                <tr>
                  <th scope="row">この章で置いたもの</th>
                  <td>リクエスト ID（標準）、アクセスログ、メンテナンス中の応答</td>
                  <td>認証、タイムゾーン、アプリの例外のエラーの応答</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            認証をミドルウェアに置く例もあります（MSDP の Ruby の例は Rack のミドルウェアで認証しています）。Rails のアプリでは、トークンから User を DB で探す、公開のアクションだけ認証を外す（<code>skip_before_action :authenticate!, only: :index</code>）、失敗したときの応答をアプリのエラーの形式にそろえる、といった理由から、コントローラーに置く方が書きやすくなります。ミドルウェアに置くのは、ルーティングより前に打ち切りたい処理（メンテナンス中、明らかな攻撃の遮断）と、成功・失敗・例外のすべてを外側から見たい処理（アクセスログ、計測）です。
          </p>
        </>
      ),
    },
    {
      id: 'test',
      title: 'ミドルウェアと並びをテストする',
      body: (
        <>
          <p>テストは次の4種類に分けます。</p>
          <ul>
            <li>ミドルウェアの単体のテスト：内側の段の代わりにラムダを渡し、行きと帰りの処理、打ち切りを確かめる。Rails のアプリを通さない。</li>
            <li>順序のテスト：Rack::Builder で2つの並びを組み、順序で結果が変わることを確かめる。</li>
            <li>並びのテスト：Rails のアプリの実際の並びで、段が意図した順にあることを確かめる。</li>
            <li>request spec：ミドルウェアとコントローラーのチェーンを通した結果（状態コード、本文、ヘッダー、ログ）を確かめる。</li>
          </ul>
          <h3>ミドルウェアの単体のテスト</h3>
          <Code
            lang="ruby"
            title="spec/middleware/api_access_log_spec.rb"
            code={`
require "rails_helper"

RSpec.describe ApiAccessLog do
  let(:lines) { [] }
  let(:ticks) { [10.0, 10.25].each }
  let(:env) { Rack::MockRequest.env_for("/orders", method: "POST").merge("action_dispatch.request_id" => "req-1") }

  def middleware(inner) = described_class.new(inner, log: ->(line) { lines << JSON.parse(line) }, clock: -> { ticks.next })

  it "内側の応答の状態コードと、入れ物（env）に残った値を記録する" do
    inner = ->(env) { env["app.user_id"] = 7; [201, {}, ["{}"]] }
    status, = middleware(inner).call(env)

    expect(status).to eq(201)
    expect(lines).to eq([{ "request_id" => "req-1", "method" => "POST", "path" => "/orders",
                           "status" => 201, "user_id" => 7, "ms" => 250 }])
  end

  it "内側が打ち切って返した 401 も記録する（user_id は nil）" do
    middleware(->(_env) { [401, {}, ["{}"]] }).call(env)
    expect(lines.first).to include("status" => 401, "user_id" => nil)
  end

  it "内側で起きた例外は記録せずに、そのまま外へ伝える" do
    expect { middleware(->(_env) { raise "boom" }).call(env) }.to raise_error(RuntimeError, "boom")
    expect(lines).to eq([])
  end
end
`}
          />
          <p>
            Rack の取り決めはハッシュ（env）と配列（応答）だけなので、<code>Rack::MockRequest.env_for</code> で env を作り、内側の段にラムダを渡せば、サーバーも Rails のルーティングも使わずにテストできます。時計を差し替えて、処理時間が 250 ミリ秒と記録されることも確かめています。3つ目の例は、ApiAccessLog が例外を記録しないことを確かめるもので、ApiAccessLog を例外を応答に変える段より外側に置く理由になります。
          </p>
          <h3>順序のテスト</h3>
          <Code
            lang="ruby"
            title="spec/middleware/stack_order_spec.rb"
            code={`
require "rails_helper"

# ログを書く段と、例外を応答に変える段（Rails の ShowExceptions）の順序で、記録される内容が変わることを確かめる
RSpec.describe "ApiAccessLog と ShowExceptions の順序" do
  let(:lines) { [] }
  let(:boom) { ->(_env) { raise "boom" } } # 内側で例外が起きる
  let(:log) { ->(line) { lines << JSON.parse(line) } }
  let(:show_exceptions) { [ActionDispatch::ShowExceptions, ActionDispatch::PublicExceptions.new(Rails.public_path)] }

  def request(app)
    env = Rack::MockRequest.env_for("/orders", "HTTP_ACCEPT" => "application/json")
    env["action_dispatch.show_exceptions"] = :all # 本番と同じく、すべての例外を応答に変える
    app.call(env)
  rescue RuntimeError => e
    e
  end

  it "ApiAccessLog が外側なら、ShowExceptions が作った 500 を記録する" do
    log_ = log
    se = show_exceptions
    app = Rack::Builder.new { use ApiAccessLog, log: log_; use(*se); run ->(_env) { raise "boom" } }
    status, = request(app)

    expect(status).to eq(500)
    expect(lines.map { it.slice("path", "status") }).to eq([{ "path" => "/orders", "status" => 500 }])
  end

  it "ApiAccessLog が内側なら、例外が帰りの処理を通らずに外へ出て、何も記録されない" do
    log_ = log
    se = show_exceptions
    app = Rack::Builder.new { use(*se); use ApiAccessLog, log: log_; run ->(_env) { raise "boom" } }
    status, = request(app)

    expect(status).to eq(500)
    expect(lines).to eq([])
  end
end
`}
          />
          <p>
            Rack::Builder の <code>use</code> は書いた順に外側から並べます。Rails の本物の ShowExceptions を使い、env の <code>action_dispatch.show_exceptions</code> を本番と同じ <code>:all</code> にして、例外を 500 の応答に変えさせています。どちらの並びも利用者に返る状態コードは 500 で、違いはログにだけ現れます（図 79-3）。<code>Rack::Builder.new</code> のブロックの中では RSpec の <code>let</code> を呼べないので、ローカル変数に入れてから渡しています。
          </p>
          <h3>並びのテスト</h3>
          <Code
            lang="ruby"
            title="spec/requests/middleware_stack_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "ミドルウェアの並び" do
  it "RequestId → ApiAccessLog → MaintenanceMode → ShowExceptions の順に外側から並ぶ" do
    names = Rails.application.middleware.map(&:klass)
    order = [ActionDispatch::RequestId, ApiAccessLog, MaintenanceMode, ActionDispatch::ShowExceptions]
    expect(order.map { names.index(it) }).to eq(order.map { names.index(it) }.sort)
  end
end
`}
          />
          <p>
            <code>Rails.application.middleware</code> は、<code>bin/rails middleware</code> が表示するのと同じ並びです。config/application.rb のコメントに書いた順序の理由を、このテストで固定します。誰かが <code>insert_after</code> を <code>use</code> に書き換えると、このテストが失敗します。
          </p>
          <h3>request spec</h3>
          <Code
            lang="ruby"
            title="spec/requests/orders_spec.rb（抜粋）"
            code={`
RSpec.describe "注文の API", type: :request do
  let(:sato) { User.create!(name: "佐藤") }
  let(:auth) { { "Authorization" => "Bearer #{sato.api_token}" } }

  it "トークンが無ければ before_action で打ち切って 401 を返し、その応答もログに残す" do
    lines = nil
    expect {
      lines = capture_logs { post "/orders", params: { order: { sku: "PEN-1", quantity: 1 } }, as: :json }
    }.not_to change(Order, :count)

    expect(response).to have_http_status(:unauthorized)
    expect(response.parsed_body).to eq("error" => "unauthorized", "request_id" => response.headers["x-request-id"])
    expect(access_logs(lines).sole).to include("status" => 401, "user_id" => nil)
  end

  it "around_action が、アクションの間だけ利用者のタイムゾーンで時刻を表す" do
    travel_to Time.utc(2026, 11, 21, 3, 0) do
      sato.orders.create!(sku: "PEN-1", quantity: 2)
      sato.update!(time_zone: "America/New_York")
      get "/orders", headers: auth
    end

    expect(response.parsed_body.sole["created_at"]).to eq("2026-11-20T22:00:00.000-05:00")
    expect(Time.zone.name).to eq("Tokyo") # アクションの後は元に戻っている
  end

  context "メンテナンス中" do
    around do |example|
      flag = Rails.root.join("tmp/maintenance.txt")
      FileUtils.touch(flag)
      example.run
    ensure
      FileUtils.rm_f(flag)
    end

    it "コントローラーに届く前に 503 を返し、ID のヘッダーとアクセスログは付く" do
      lines = capture_logs { get "/orders", headers: auth }

      expect(response).to have_http_status(:service_unavailable)
      expect(response.headers["x-request-id"]).to be_present
      expect(access_logs(lines).sole).to include("status" => 503, "user_id" => nil)
    end
  end
  # …（省略：成功・404・400 と 422・/up の例）
end
`}
          />
          <p>
            <code>capture_logs</code> と <code>access_logs</code> は <code>spec/support</code> に書いた補助のメソッドで、ブロックの間だけ <code>Rails.logger.broadcast_to</code> でログの出力先を1つ足し、書かれた行のうち ApiAccessLog の JSON の行を取り出します。request spec はミドルウェアの並び全体を通るので（<ChapterLink n={20} section="types" />）、打ち切った 401 と 503 にもログとヘッダーが付くことを、実際の並びで確かめられます。
          </p>
          <h3>実行結果</h3>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
ApiAccessLog
  内側の応答の状態コードと、入れ物（env）に残った値を記録する
  内側が打ち切って返した 401 も記録する（user_id は nil）
  内側で起きた例外は記録せずに、そのまま外へ伝える

MaintenanceMode
  メンテナンス中は次の段を呼ばずに 503 を返す
  メンテナンス中でも /up は次の段に渡す
  メンテナンス中でなければ、次の段をちょうど1回呼ぶ

ApiAccessLog と ShowExceptions の順序
  ApiAccessLog が外側なら、ShowExceptions が作った 500 を記録する
  ApiAccessLog が内側なら、例外が帰りの処理を通らずに外へ出て、何も記録されない

環境
  MySQL 8.4 につながる

ミドルウェアの並び
  RequestId → ApiAccessLog → MaintenanceMode → ShowExceptions の順に外側から並ぶ

注文の API
  成功したら、アクセスログに ID・利用者・状態コードを1行書き、ID を応答のヘッダーにも付ける
  トークンが無ければ before_action で打ち切って 401 を返し、その応答もログに残す
  ほかの利用者の注文は 404 になる（rescue_from が同じ形式のエラーにする）
  本文に order が無ければ 400、値が不正なら 422 を、同じ形式で返す
  around_action が、アクションの間だけ利用者のタイムゾーンで時刻を表す
  メンテナンス中
    コントローラーに届く前に 503 を返し、ID のヘッダーとアクセスログは付く
    /up は 200 を返す

Finished in 0.15867 seconds (files took 3.43 seconds to load)
17 examples, 0 failures
`}
          />
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
            <li>共通の処理が1か所にまとまり、アクションは業務の処理だけになります。</li>
            <li>新しいアクションを足しても、認証やログを書き忘れません。ApplicationController を継承すれば認証がかかり、ミドルウェアはすべてのリクエストに適用されます。</li>
            <li>途中で打ち切った経路（401、503）でも、外側の段の処理（ログ、リクエスト ID のヘッダー）が必ず実行されます。</li>
            <li>エラーの応答とログの形式が、すべてのアクションで同じになります。</li>
            <li>ミドルウェアは Rails を通さずに単体でテストでき、組み合わせた結果は request spec でテストできます。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>アクションだけを読んでも、リクエストに何が起きるかは分かりません。<code>bin/rails middleware</code> の並びと、ApplicationController のコールバックを確かめる必要があります。</li>
            <li>順序によって結果が変わるので、並びを変えるときに影響を確かめる必要があります。</li>
            <li>env を通した値の受け渡しは引数のように明示されないので、どの段がどの値に依存しているかが見えにくくなります。</li>
            <li>ミドルウェアは再読み込みされないので、development でも変更のたびにサーバーを再起動します。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            共通の処理の変更が1か所で済むので、保守しやすくなります。一方で、段が増えると、処理の流れを追うために並び全体を読む必要が出てきます。そのため、並びは config/application.rb の1か所で決め、順序の理由をコメントに書き、並びのテストで固定します。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>ミドルウェアに業務の処理を入れる</h3>
          <Code
            lang="ruby"
            title="誤った例：注文の API のときだけ割引を計算するミドルウェア"
            code={`
class OrderDiscount
  def initialize(app) = @app = app

  def call(env)
    if env["PATH_INFO"] == "/orders" && env["REQUEST_METHOD"] == "POST"
      body = JSON.parse(env["rack.input"].read)
      body["order"]["discount"] = 10 if Time.current.saturday? # 土曜は 10% 引き
      env["rack.input"] = StringIO.new(body.to_json)
    end
    @app.call(env)
  end
end
`}
          />
          <p>
            業務の処理をミドルウェアに入れると、OrdersController を読んでも割引の規則が見つかりません。パスとメソッドで対象を判定しているので、ルートの名前を変えると、エラーにならずに割引が止まります。ミドルウェアに置くのは、どのリクエストにも同じように当てはまる、業務と関係のない処理だけです。業務の操作の手順をまとめる場所は <ChapterLink n={44} section="idea" /> で扱います。
          </p>
          <h3>入れ物に何でも入れる</h3>
          <Code
            lang="ruby"
            title="誤った例：段の間の受け渡しに、オブジェクトや計算の結果を次々に入れる"
            code={`
env["app.user"] = user                 # Active Record のオブジェクト
env["app.cart"] = user.cart            # 別の段が使う
env["app.discount_rate"] = 0.1         # 業務の値
env["user"] = user                     # 接頭辞が無い
`}
          />
          <p>
            env に多くの値を入れると、ある段がほかの段の入れた値に依存していることが見えなくなり、順序を変えたときに壊れます。接頭辞の無いキーはほかのライブラリのキーと重なる可能性があり、再読み込みされるモデルのオブジェクトを再読み込みされないミドルウェアが受け取ることにもなります。入れる値は少なくし、ID のような小さな値にして、書く段と読む段を表にしておきます（rails-impl の節）。コントローラーの中だけで使う値は、env ではなくインスタンス変数（<code>@current_user</code>）に置きます。
          </p>
          <h3>順序の理由を書かない</h3>
          <Code
            lang="ruby"
            title="誤った例：理由を書かずに use で足す"
            code={`
config.middleware.use ApiAccessLog
config.middleware.use MaintenanceMode
`}
          />
          <p>
            並びの順序に意味があるのに理由を書いておかないと、後から足した人が <code>use</code> で末尾に入れて、図 79-3 の右の並びになります。ApiAccessLog が ShowExceptions の内側に入り、500 の応答がログから消えます。MaintenanceMode も末尾に入り、Rails::Rack::Logger や ShowExceptions などの段を通ってから 503 を返します。順序の理由はコメントに書き、並びのテストで固定します。
          </p>
          <h3>@app.call を呼び忘れる・2回呼ぶ</h3>
          <Code
            lang="ruby"
            title="誤った例：次の段の呼び忘れと、2回の呼び出し"
            code={`
class Timing
  def initialize(app) = @app = app

  def call(env)
    started = Time.current
    @app.call(env)
    Rails.logger.info("#{Time.current - started}s") # 戻り値がログの結果になり、応答が失われる
  end
end

class RetryOnError
  def initialize(app) = @app = app

  def call(env)
    status, headers, body = @app.call(env)
    return @app.call(env) if status >= 500 # 内側の段とアクションが2回実行される
    [status, headers, body]
  end
end
`}
          />
          <p>
            Timing は <code>@app.call</code> を呼んでいますが、内側の応答を返さずに、最後の式（ログの書き込みの結果）を返しています。打ち切るつもりが無いのに次の段を呼ばないのも、応答を返し忘れるのも、Rack の取り決めに合わない値が外側に返ります。RetryOnError は内側をもう一度呼ぶので、注文の作成のような副作用のある処理が2回実行されます。
          </p>
          <p>コントローラーの around_action でも同じことが起きます。yield を書き忘れた場合と、2回 yield した場合を実行しました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner）"
            code={`
NoYieldController: status=200 body="" アクションの実行回数=0
TwiceController: AbstractController::DoubleRenderError（アクションの実行回数=2）
`}
          />
          <p>
            yield を書き忘れると、アクションは実行されないのに 200 の空の応答が返り、エラーにならないので気づきにくくなります。2回 yield すると、2回目の render で DoubleRenderError になりますが、その時点でアクションはすでに2回実行されています。
          </p>
          <h3>すべてのリクエストに重い処理を行う</h3>
          <Code
            lang="ruby"
            title="誤った例：すべてのリクエストで利用者と権限を DB から読み込むミドルウェア"
            code={`
class LoadCurrentUser
  def initialize(app) = @app = app

  def call(env)
    token = env["HTTP_AUTHORIZATION"].to_s.delete_prefix("Bearer ")
    env["app.user"] = User.includes(:roles, :organization).find_by(api_token: token)
    @app.call(env)
  end
end
`}
          />
          <p>
            DB で利用者の詳細を読み込むような重い処理を全体のミドルウェアに置くと、ロードバランサーが数秒ごとに送る <code>/up</code> のヘルスチェックや、存在しないパスへのリクエストにも実行されます。重い処理は必要なコントローラーだけに before_action で適用するか、アクションで必要になったときに行います。
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
              共通のメソッドを呼ぶ：アクションが2〜3つしかないなら、共通の処理を private メソッドにして各アクションから呼ぶだけで足ります。ただし、呼び忘れを防ぐ仕組みはありません。
            </li>
            <li>
              コントローラーのコールバックだけを使う：ルーティングの結果やモデルを使う処理、一部のコントローラーだけに必要な処理は、ミドルウェアを書かずに before_action・around_action・rescue_from で足ります（controller-chain の節）。Rails の機能で足りるなら、自作のミドルウェアは要りません。
            </li>
          </ul>
          <h3>ほかのパターンとの違い</h3>
          <Figure n="79-5" title="Chain of Responsibility と Middleware Chain" caption="模式図。処理役は Chain of Responsibility で要求を受け取って処理するオブジェクト。">
            <CorFigure />
          </Figure>
          <p>図 79-5 はGoF の Chain of Responsibility と Middleware Chain の動き方の違いです。</p>
          <ul>
            <li>Chain of Responsibility：要求を処理できる処理役が1つ見つかったところで終わります（idea の節の注記）。画面の操作のイベントを、処理できる部品が見つかるまで順に渡す場面などに向いています。</li>
            <li>
              Decorator：元のオブジェクトを内部に持つ別のオブジェクトを作り、同じインターフェースのまま、呼び出しの前後に処理を加えます<Ref n={4} />。Rack のミドルウェアは同じ <code>call(env)</code> を持つオブジェクトで内側のアプリを持つので、Decorator を何段も重ねた形と見ることもできます。
            </li>
            <li>Intercepting Filter：リクエストの前処理と後処理を、差し替えられるフィルターとして組み込む、Java の Web アプリケーションのパターンです<Ref n={3} />。Middleware Chain とほぼ同じ考え方です。</li>
            <li>
              Pipes and Filters：複雑な処理を、再利用できる独立した段に分け、データを段から段へ流すパターンです。Azure Architecture Center の説明は、アプリケーションがリクエストと応答の形で動く場合を、このパターンが向かない場合の1つに挙げています<Ref n={16} />。データの変換や集計の流れに使います。
            </li>
          </ul>
          <h3>gem とフレームワークの機能</h3>
          <p>
            Rack::Attack は、リクエストの回数の制限（throttle）や遮断（blocklist）を行う Rack のミドルウェアの gem です。Rails のアプリでは gem を入れるだけで並びに加わり、規則を書くまでは何も遮断しません。規則は <code>config/initializers/rack_attack.rb</code> に書き、制限を超えたリクエストには既定で 429 を返します<Ref n={17} />。gem の Railtie は <code>app.middleware.use(Rack::Attack)</code> で並びの末尾に加えます<Ref n={18} />。次は README の書き方に沿った例で、この章の検証用のアプリには gem を入れていないので実行していません。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/rack_attack.rb（例。実行していない）"
            code={`
# IP アドレスごとに、POST /orders を 1 分に 10 回までにする
Rack::Attack.throttle("orders/ip", limit: 10, period: 60) do |req|
  req.ip if req.post? && req.path == "/orders"
end
`}
          />
          <p>
            Rack::Attack は回数を Rack::Attack.cache（Rails.cache など）に数えるので、複数のプロセスで動かすなら Redis のような共有のキャッシュが要ります<Ref n={17} />。末尾に入るので、制限で返した 429 もこの章の ApiAccessLog に記録されます。ルーティングより前に遮断したい場合は、<code>config.middleware.move_before</code> などで位置を変えます。Rails にも、コントローラーの中で回数を制限する <code>rate_limit</code> があり、before_action として登録されます<Ref n={19} />。コントローラーやアクションごとに制限を変えるならこちらで足ります。
          </p>
          <Callout kind="v72">
            <p>
              <code>rate_limit</code> は Rails 7.2 にもありますが、制限を超えたときの既定の動きが違います。Rails 7.2 は <code>head :too_many_requests</code> で 429 を返し<Ref n={20} />、Rails 8.1 は ActionController::TooManyRequests を発生させて、Action Dispatch がそれを 429 の応答にします<Ref n={19} />。8.1 では例外になるので、<code>rescue_from StandardError</code> のような広いハンドラーがあると、そこで受け取られます。
            </p>
          </Callout>
          <p>
            HTTP のリクエスト以外にも、同じ形のミドルウェアがあります。HTTP クライアントの Faraday は、Rack に似たミドルウェアの並びで送信の前後の処理（再試行、エラーへの変換など）を組み立て、並びの順序が重要だと説明しています<Ref n={21} />。Sidekiq には、ジョブをキューに入れる前に動くクライアントのミドルウェアと、ジョブの実行の前後に動くサーバーのミドルウェアがあります<Ref n={22} />。どちらも、次の段を呼ぶ前と後に処理を書く形です。
          </p>
          <Code
            lang="ruby"
            title="script/other_chains.rb（抜粋）"
            code={`
# Faraday：送信する HTTP リクエストの前後
class TraceFaraday < Faraday::Middleware
  def initialize(app, trace:, name:)
    super(app)
    @trace = trace
    @name = name
  end

  def call(env)
    @trace << "#{@name} 行き"
    @app.call(env).tap { @trace << "#{@name} 帰り" }
  end
end
# …（省略：A・B の順に use し、テスト用のアダプターで GET を送る）

# Sidekiq：ジョブを実行する前後（サーバーのミドルウェア）
class TraceSidekiq
  include Sidekiq::ServerMiddleware

  def call(_job, payload, _queue)
    $trace << "#{payload['class']} 実行の前"
    yield
    $trace << "#{payload['class']} 実行の後"
  end
end
# …（省略：Sidekiq::Middleware::Chain に add し、invoke で実行する）
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner。Faraday 2.15.1・Sidekiq 8.1.7）"
            code={`
Faraday: A 行き → B 行き → B 帰り → A 帰り
Sidekiq: ReportJob 実行の前 → perform → ReportJob 実行の後
`}
          />
          <p>
            Faraday は Rack と同じく <code>@app.call(env)</code>、Sidekiq は <code>yield</code> で次の段を呼びます。違いもあります。Rails のミドルウェアは起動時に1回作られて全リクエストで共有されますが、Sidekiq はジョブごとにミドルウェアのオブジェクトを新しく作るので、インスタンスの状態がジョブの間で共有されません<Ref n={23} />。
          </p>
          <h3>採用の判断</h3>
          <p>採用する条件は次のとおりです。</p>
          <ul>
            <li>多くのエンドポイント（またはジョブ、外部へのリクエスト）に、業務と関係のない同じ処理が必要</li>
            <li>その処理を書き忘れると、安全性や運用に問題が出る（認証、ログ、エラーの形式）</li>
            <li>途中で打ち切る経路でも、ログなどの処理を必ず行いたい</li>
          </ul>
          <p>採用しない方がよい条件は次のとおりです。</p>
          <ul>
            <li>処理が業務の内容によって変わる（それはアクションやユースケースのクラスが受け持つ）</li>
            <li>一部のコントローラーやアクションだけに必要で、ルーティングの結果やモデルを使う（コントローラーのコールバックを使う）</li>
            <li>エンドポイントが少なく、共通のメソッドを呼ぶだけで足りる</li>
            <li>Rails の標準の段（RequestId、ShowExceptions など）や gem（Rack::Attack）が同じ目的の段を持っている</li>
          </ul>
          <p>判断するときのチェックポイントは次のとおりです。</p>
          <ol>
            <li>その処理はどのリクエストにも同じように当てはまるか</li>
            <li>並びの中のどの位置に置くかを、外側と内側のどの段との関係から説明できるか</li>
            <li>入れ物（env）に入れる値と、それを書く段・読む段が決まっているか</li>
            <li>打ち切った場合と例外が起きた場合に、外側の段で何が起きるかをテストしているか</li>
            <li>コントローラーのコールバックや、Rails・gem の既存の段で書けないか</li>
          </ol>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Middleware Chain は共通の処理を独立した段に分け、決めた順序でハンドラーの前後に実行するパターンです。Rails では Rack のミドルウェアと、コントローラーのコールバックの2つのチェーンがあります。</li>
          <li>包む方式では、@app.call を呼ぶ前に行きの処理、戻った後に帰りの処理を行います。外側の段ほど、内側の成功・打ち切り・例外の応答を見られます。</li>
          <li>打ち切る段は次の段を呼ばずに応答を返します。打ち切った応答も外側の段を通るので、ログやリクエスト ID のヘッダーが抜けません。</li>
          <li>順序で結果が変わります。ApiAccessLog を ShowExceptions の外側に置くと 500 も記録され、内側に置くと記録されません。順序の理由はコメントに書き、並びのテストで固定します。</li>
          <li>自作のミドルウェアは lib/middleware に置いて require し、config.middleware.insert_after などで位置を決め、bin/rails middleware で確かめます。オブジェクトは全リクエストで共有されるので、リクエストごとの値をインスタンス変数に入れません。</li>
          <li>env に入れる値は少なくし、接頭辞を付けたキーに ID のような小さな値を入れ、書く段と読む段を決めます。</li>
          <li>モデル・ルーティングの結果を使う処理や一部のコントローラーだけの処理は before_action・around_action・rescue_from に置きます。before_action の render はチェーンを止め、around_action は yield でアクションを実行します。</li>
          <li>Chain of Responsibility は1つの処理役が処理して終わるのに対し、Middleware Chain は通常すべての段が行きと帰りの処理を行います。Decorator や Intercepting Filter に近い考え方です。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Rack SPEC', publisher: 'rack/rack（GitHub）', url: 'https://github.com/rack/rack/blob/v3.2.8/SPEC.rdoc', accessed: '2026-11-13', version: 'v3.2.8', note: 'Rack のアプリケーションの取り決め、応答のヘッダー名に大文字を使えないこと。env のキーにはドットを含めて一意の接頭辞を付け、rack. は予約されていること（gem の SPEC.rdoc の19行目で確認）。' },
    { title: 'Design Patterns: Chain of Responsibility', publisher: 'Erich Gamma ほか／InformIT（『Design Patterns』の抜粋）', url: 'https://www.informit.com/articles/article.aspx?p=1398601', accessed: '2026-11-13', version: '書籍は1994年刊', note: 'Chain of Responsibility の目的の引用。' },
    { title: 'Core J2EE Patterns - Intercepting Filter', publisher: 'Oracle', url: 'https://www.oracle.com/java/technologies/intercepting-filter.html', accessed: '2026-11-13', note: 'リクエストの前処理と後処理を差し替えられるフィルターにするパターン。' },
    { title: 'Decorator Design Pattern', publisher: 'SourceMaking', url: 'https://sourcemaking.com/design_patterns/decorator', accessed: '2026-11-13', note: 'GoF の Decorator の目的（二次資料）。' },
    { title: 'Koa（Cascading）', publisher: 'Koa', url: 'https://koajs.com/', accessed: '2026-11-13', note: 'next を呼ぶと下流へ進み、戻るときに上流の処理が再開されること。' },
    { title: 'Using middleware', publisher: 'Express', url: 'https://expressjs.com/en/guide/using-middleware.html', accessed: '2026-11-13', version: '5.x', note: 'ミドルウェアの引数（req、res、next）と、next で次の段に処理を渡すこと。' },
    { title: 'Rails on Rack', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/rails_on_rack.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'bin/rails middleware と、config.middleware の use・insert_before・insert_after。' },
    { title: 'Autoloading and Reloading Constants', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'ミドルウェアのクラスは再読み込みできないので、lib/middleware に置き、autoload_lib の ignore に加えて require で読み込むこと。' },
    { title: 'actionpack/lib/action_dispatch/middleware/request_id.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/request_id.rb#L31-L35`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'X-Request-Id の値か新しい UUID を request_id にし、応答のヘッダーに付けること。' },
    { title: 'ActionController::HttpAuthentication::Token', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActionController/HttpAuthentication/Token.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'authenticate_with_http_token と、Authorization ヘッダーの Token・Bearer の形式。ActionController::API に含まれないことは api.rb の MODULES で確認。' },
    { title: 'Action Controller Overview（Controller Callbacks）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/action_controller_overview.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'before_action が処理を止められること、skip_before_action、around_action は yield でアクションを実行し描画も含むこと、after_action は例外のときに実行されないこと（7. Controller Callbacks）。' },
    { title: 'actionpack/lib/abstract_controller/callbacks.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/abstract_controller/callbacks.rb#L34-L37`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'コールバックのたびに performed? を確かめてチェーンを止める terminator。' },
    { title: 'actionpack/lib/action_controller/api.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/api.rb#L133-L138`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'AbstractController::Callbacks の後に Rescue を加え、できるだけ多くを囲むこと。' },
    { title: 'activesupport/lib/active_support/broadcast_logger.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/broadcast_logger.rb#L222-L232`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'method_missing が、応答するロガーが複数あれば各ロガーに同じ引数とブロックで呼ぶこと。アクションが2回実行されることは検証用のアプリで確認。' },
    { title: 'activesupport/lib/active_support/rescuable.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/rescuable.rb#L29-L32`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'rescue_from のハンドラーは右から左、下から上、親クラスへと探されること。' },
    { title: 'Pipes and Filters pattern', publisher: 'Microsoft Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/pipes-and-filters', accessed: '2026-11-13', note: '処理を独立した段に分けるパターンと、向かない場面（リクエストと応答の組）。' },
    { title: 'rack/rack-attack README', publisher: 'rack/rack-attack（GitHub）', url: 'https://github.com/rack/rack-attack/blob/v6.8.0/README.md', accessed: '2026-11-20', version: 'v6.8.0', note: 'Rails では既定で使われること、規則を書くまで何も遮断しないこと、throttle・blocklist、Rack::Attack.cache、制限を超えたときの 429。' },
    { title: 'lib/rack/attack/railtie.rb', publisher: 'rack/rack-attack（GitHub）', url: 'https://github.com/rack/rack-attack/blob/v6.8.0/lib/rack/attack/railtie.rb', accessed: '2026-11-20', version: 'v6.8.0', note: 'Railtie が app.middleware.use(Rack::Attack) で並びに加えること。' },
    { title: 'ActionController::RateLimiting::ClassMethods', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActionController/RateLimiting/ClassMethods.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'rate_limit の使い方、超えたときに TooManyRequests を発生させ Action Dispatch が 429 にすること。before_action で登録することは rate_limiting.rb（66〜68行目）で確認。' },
    { title: 'actionpack/lib/action_controller/metal/rate_limiting.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.2/actionpack/lib/action_controller/metal/rate_limiting.rb#L47-L49', accessed: '2026-11-20', version: 'Rails 7.2.2', note: 'Rails 7.2 の rate_limit の既定の with: が head :too_many_requests であること。' },
    { title: 'Middleware', publisher: 'Faraday Docs（lostisland/faraday）', url: 'https://github.com/lostisland/faraday/blob/main/docs/middleware/index.md', accessed: '2026-11-13', version: 'v2.15.1', note: 'Rack に似たミドルウェアの並びで、並びの順序が重要であること。' },
    { title: 'Middleware', publisher: 'Sidekiq Wiki', url: 'https://github.com/sidekiq/sidekiq/wiki/Middleware', accessed: '2026-11-13', note: 'クライアントとサーバーのミドルウェア。Rack に似た考え方であること。' },
    { title: 'lib/sidekiq/middleware/chain.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: 'https://github.com/sidekiq/sidekiq/blob/v8.1.7/lib/sidekiq/middleware/chain.rb#L5-L15', accessed: '2026-11-20', version: 'Sidekiq 8.1.7', note: 'Rack のミドルウェアを手本にしていること、ジョブごとにミドルウェアのオブジェクトを新しく作ること。' },
  ],
}

export default chapter
