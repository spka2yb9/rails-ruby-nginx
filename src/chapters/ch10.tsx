import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation10 } from '../explanations/request'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 10-1 コントローラーとビューの分担 ---------- */
function ControllerRoleFigure() {
  return (
    <Svg
      id="10-1"
      w={780}
      h={310}
      label="ブラウザーが GET /articles/1 を送ると、ルーティングが articles#show を選ぶ。ArticlesController の show は params[:id] の 1 を使って Article.find でデータベースから記事を読み出し、@article に代入する。アクションが終わると、ビューの show.html.erb が @article の title を HTML に埋め込む。できた HTML が状態コード 200 の応答としてブラウザーに返る"
    >
      <Box x={20} y={70} w={120} h={60} lines={['ブラウザー', 'GET /articles/1']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={140} y1={100} x2={168} y2={100} />
      <Box x={170} y={70} w={130} h={60} lines={['ルーティング', 'articles#show']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={300} y1={100} x2={328} y2={100} />
      <Box x={330} y={30} w={200} h={140} lines={['ArticlesController#show', 'params[:id] は "1"', 'Article.find("1")', '結果を @article に代入']} fs={12} bold fill="box5" subTone="muted" />
      <Arrow x1={430} y1={170} x2={430} y2={208} both />
      <Box x={330} y={210} w={200} h={50} lines={['Article（モデル）と DB', 'SELECT … WHERE id = 1']} fs={11.5} fill="box4" subTone="muted" />
      <Arrow x1={530} y1={100} x2={588} y2={100} />
      <T x={536} y={90} fs={10.5} tone="muted" mono>
        @article
      </T>
      <Box x={590} y={30} w={170} h={140} lines={['ビュー', 'show.html.erb', '@article.title を', 'HTML に埋め込む']} fs={12} bold fill="box" subTone="muted" />
      <Arrow d="M675,170 L675,290 L80,290 L80,132" />
      <T x={300} y={280} fs={11} tone="muted">
        200 OK と HTML（応答）
      </T>
    </Svg>
  )
}

/* ---------- 図 10-2 render と redirect_to ---------- */
function RenderRedirectFigure() {
  const msg = (x1: number, x2: number, y: number, text: string, lx: number) => (
    <g>
      <Arrow x1={x1} y1={y} x2={x2} y2={y} />
      <T x={lx} y={y - 9} fs={10.5}>
        {text}
      </T>
    </g>
  )
  return (
    <Svg
      id="10-2"
      w={780}
      h={330}
      label="左は保存に失敗した場合。ブラウザーが POST /articles を送ると、create が render :new で new のテンプレートから HTML を作り、422 とフォームの HTML を返す。要求は1回。右は保存に成功した場合。create は redirect_to で 302 と location: /articles/4 を返し、ブラウザーは GET /articles/4 を送り直す。show が記事の HTML を作って 200 で返す。要求は2回"
    >
      <T x={20} y={20} bold fs={12.5}>
        render :new（保存に失敗）
      </T>
      <Box x={30} y={36} w={100} h={30} lines="ブラウザー" fs={12} />
      <Box x={250} y={36} w={110} h={30} lines="Rails" fs={12} />
      <Arrow x1={80} y1={66} x2={80} y2={290} plain dashed />
      <Arrow x1={305} y1={66} x2={305} y2={290} plain dashed />
      {msg(80, 303, 110, 'POST /articles（title が空）', 90)}
      <Box x={250} y={124} w={110} h={44} lines={['create', 'render :new']} fs={11} fill="box5" mono />
      {msg(303, 82, 200, '422 とフォームの HTML', 90)}
      <T x={20} y={314} fs={11} tone="muted">
        要求は1回。create の中で new のテンプレートを使う
      </T>

      <Arrow x1={385} y1={10} x2={385} y2={300} plain dashed />

      <T x={400} y={20} bold fs={12.5}>
        redirect_to @article（保存に成功）
      </T>
      <Box x={410} y={36} w={100} h={30} lines="ブラウザー" fs={12} />
      <Box x={640} y={36} w={110} h={30} lines="Rails" fs={12} />
      <Arrow x1={460} y1={66} x2={460} y2={290} plain dashed />
      <Arrow x1={695} y1={66} x2={695} y2={290} plain dashed />
      {msg(460, 693, 100, 'POST /articles（title あり）', 470)}
      <Box x={640} y={108} w={110} h={36} lines={['create', 'redirect_to']} fs={11} fill="box5" mono />
      {msg(693, 462, 165, '302 location: /articles/4', 470)}
      {msg(460, 693, 215, 'GET /articles/4', 470)}
      <Box x={640} y={223} w={110} h={30} lines="show" fs={11} fill="box5" mono />
      {msg(693, 462, 276, '200 と記事の HTML', 470)}
      <T x={400} y={314} fs={11} tone="muted">
        要求は2回。302 を受けたブラウザーが次の要求を送る
      </T>
    </Svg>
  )
}

/* ---------- 図 10-3 Cookie とセッション ---------- */
function CookieSessionFigure() {
  const msg = (x1: number, x2: number, y: number, text: string) => (
    <g>
      <Arrow x1={x1} y1={y} x2={x2} y2={y} />
      <T x={120} y={y - 9} fs={10.5} mono>
        {text}
      </T>
    </g>
  )
  return (
    <Svg
      id="10-3"
      w={780}
      h={340}
      label="ブラウザーが POST /login でメールアドレスを送ると、Rails は session の author_id に 1 を入れ、セッションの中身を暗号化した Cookie を set-cookie ヘッダーで返す。ブラウザーは Cookie を保存し、次の GET /articles/new の要求の cookie ヘッダーに付けて送る。Rails は Cookie を復号して、session の author_id から 1 を読み、作成のフォームを返す"
    >
      <Box x={30} y={20} w={140} h={34} lines="ブラウザー" fs={12} />
      <Box x={600} y={20} w={150} h={34} lines="Rails（サーバー）" fs={12} />
      <Arrow x1={100} y1={54} x2={100} y2={325} plain dashed />
      <Arrow x1={675} y1={54} x2={675} y2={325} plain dashed />
      {msg(100, 673, 90, 'POST /login（email=author1@example.com）')}
      <Box x={560} y={100} w={200} h={42} lines={['session[:author_id] = 1', '中身を暗号化して Cookie に']} fs={11} fill="box5" subTone="muted" />
      {msg(673, 102, 166, '302 ＋ set-cookie: _demo_session=…')}
      <Box x={20} y={176} w={160} h={32} lines="Cookie を保存" fs={11} fill="box4" />
      {msg(100, 673, 240, 'GET /articles/new ＋ cookie: _demo_session=…')}
      <Box x={560} y={250} w={200} h={42} lines={['Cookie を復号', 'session[:author_id] → 1']} fs={11} fill="box5" subTone="muted" />
      {msg(673, 102, 312, '200 作成のフォーム')}
    </Svg>
  )
}

/* ---------- 図 10-4 before_action ---------- */
function BeforeActionFigure() {
  return (
    <Svg
      id="10-4"
      w={780}
      h={330}
      label="GET /articles/new の要求が届くと、アクションの前に before_action に登録した require_login が呼ばれ、セッションの author_id の著者を探す。ログインしていなければ redirect_to login_path で 302 を返し、new アクションは呼ばれない。ログインしていれば @current_author に著者が入り、new アクションが呼ばれて作成のフォームが 200 で返る"
    >
      <Box x={290} y={14} w={200} h={40} lines="GET /articles/new" mono fs={12} fill="box4" />
      <Arrow x1={390} y1={54} x2={390} y2={78} />
      <Box x={230} y={80} w={320} h={60} lines={['before_action :require_login', 'session[:author_id] の著者を探す']} fs={12} bold fill="box" subTone="muted" />
      <Arrow x1={300} y1={140} x2={170} y2={190} />
      <T x={110} y={160} fs={11}>
        ログインしていない
      </T>
      <Box x={40} y={192} w={260} h={60} lines={['redirect_to login_path', '302 location: /login']} fs={12} fill="bg" subTone="muted" />
      <T x={40} y={274} fs={11} tone="muted">
        Filter chain halted：new は呼ばれない
      </T>
      <Arrow x1={480} y1={140} x2={610} y2={190} />
      <T x={560} y={160} fs={11}>
        ログインしている
      </T>
      <Box x={480} y={192} w={260} h={60} lines={['new アクション', '@current_author が使える']} fs={12} bold fill="box5" subTone="muted" />
      <Arrow x1={610} y1={252} x2={610} y2={278} />
      <Box x={480} y={280} w={260} h={34} lines="200 作成のフォーム" fs={12} fill="bg" />
      <T x={40} y={312} fs={11} tone="muted">
        index と show は only: の対象外なので、ログインしなくても表示できる
      </T>
    </Svg>
  )
}

/* ---------- 図 10-5 コントローラーのクラス階層 ---------- */
function HierarchyFigure() {
  const groups = [
    { t: '描画', m: 'Rendering, ImplicitRender, Layouts など' },
    { t: 'パラメーター', m: 'StrongParameters, ParamsWrapper など' },
    { t: '状態', m: 'Cookies, Flash' },
    { t: '安全性', m: 'RequestForgeryProtection, ContentSecurityPolicy' },
    { t: '実行の制御', m: 'Callbacks, Rescue, Instrumentation, Logging' },
    { t: 'その他', m: 'UrlFor, Redirecting, ConditionalGet など' },
  ]
  return (
    <Svg
      id="10-5"
      w={760}
      h={360}
      label="ArticlesController は ApplicationController を継承し、ApplicationController は ActionController::Base を継承する。ActionController::Base は ActionController::Metal を、Metal は AbstractController::Base を継承する。ActionController::API も Metal を継承する。ActionController::Base は36個のモジュールを include しており、描画、パラメーター、Cookie とフラッシュ、安全性、コールバックや例外処理などの機能はこれらのモジュールが持つ"
    >
      <Box x={20} y={14} w={240} h={34} lines="AbstractController::Base" mono fs={12} />
      <Box x={20} y={88} w={240} h={34} lines="ActionController::Metal" mono fs={12} />
      <Box x={20} y={162} w={240} h={34} lines="ActionController::Base" mono fs={12} bold />
      <Box x={20} y={236} w={240} h={34} lines="ApplicationController" mono fs={12} />
      <Box x={20} y={310} w={240} h={34} lines="ArticlesController" mono fs={12} fill="box5" />
      <Arrow x1={140} y1={86} x2={140} y2={50} />
      <Arrow x1={140} y1={160} x2={140} y2={124} />
      <Arrow x1={140} y1={234} x2={140} y2={198} />
      <Arrow x1={140} y1={308} x2={140} y2={272} />
      <Box x={290} y={88} w={170} h={34} lines="ActionController::API" mono fs={11.5} dashed fill="bg" />
      <Arrow x1={288} y1={105} x2={262} y2={105} dashed />
      <T x={470} y={105} fs={11} tone="muted">
        API 専用（本書では扱わない）
      </T>

      <Box x={300} y={150} w={440} h={196} fill="bg" lines={[]} />
      <T x={312} y={170} bold fs={12.5}>
        Base が include する36個のモジュール（抜粋）
      </T>
      {groups.map((g, i) => (
        <g key={g.t}>
          <T x={312} y={196 + i * 24} fs={11.5} bold>
            {g.t}
          </T>
          <T x={400} y={196 + i * 24} fs={11} mono>
            {g.m}
          </T>
        </g>
      ))}
      <Arrow x1={298} y1={179} x2={262} y2={179} dashed />
      <T x={20} y={354} fs={11} tone="muted">
        実線：継承　破線：モジュールの include・別系統
      </T>
    </Svg>
  )
}

/* ---------- 図 10-6 dispatch から応答の配列まで ---------- */
function DispatchFigure() {
  const steps: { t: string; sub?: string; fill?: 'box' | 'box2' | 'box5' | 'bg'; indent?: number }[] = [
    { t: 'ArticlesController.dispatch(:show, req, res)', sub: 'Dispatcher から呼ばれるクラスメソッド' },
    { t: 'new.dispatch(:show, req, res)', sub: 'set_request! と set_response!' },
    { t: 'process("show")', sub: 'アクション名を確認して process_action へ' },
    { t: 'process_action の連鎖', sub: '各モジュールの定義を super でたどる', fill: 'box2' },
    { t: 'send_action("show")', sub: 'show メソッドを呼ぶ', fill: 'box5' },
    { t: 'default_render', sub: 'render していなければ show.html.erb を描画' },
    { t: 'request.commit_flash → to_a', sub: '[status, headers, body] を返す' },
  ]
  return (
    <Svg
      id="10-6"
      w={760}
      h={7 * 56 + 20}
      label="Dispatcher が ArticlesController.dispatch を呼ぶと、コントローラーのインスタンスが作られ、インスタンスの dispatch がリクエストと応答を設定してから process を呼ぶ。process はアクション名を確かめて process_action を呼び、process_action は ParamsWrapper、Instrumentation、Rescue、Callbacks などのモジュールの定義を super で順にたどり、最後に send_action で show メソッドを呼ぶ。show の後、まだ描画していなければ default_render がテンプレートを描画する。最後に flash を確定し、応答を status、headers、body の配列にして返す"
    >
      {steps.map((s, i) => {
        const y = 10 + i * 56
        return (
          <g key={s.t}>
            <Box x={20} y={y} w={380} h={42} lines={s.t} mono fs={12} fill={s.fill ?? 'box'} align="start" />
            {s.sub && (
              <T x={420} y={y + 21} fs={12} tone="muted">
                {s.sub}
              </T>
            )}
            {i < steps.length - 1 && <Arrow x1={210} y1={y + 42} x2={210} y2={y + 54} />}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 10-7 params の合成 ---------- */
function ParamsFigure() {
  return (
    <Svg
      id="10-7"
      w={760}
      h={260}
      label="request.parameters は、リクエスト本文のパラメーターにクエリ文字列のパラメーターを上書きでマージし、さらにルーティングのパスパラメーターを上書きでマージして作られる。同じ名前があれば、パスパラメーター、クエリ文字列、本文の順に優先される。コントローラーの params は、これを ActionController::Parameters で包んだもので、permit や expect で許可したキーだけがモデルに渡せる"
    >
      <Box x={20} y={30} w={200} h={52} lines={['本文（POST）', 'title=from_body&b=1']} fs={12} subTone="muted" fill="box4" />
      <Box x={20} y={100} w={200} h={52} lines={['クエリ文字列', 'title=from_query&q=1']} fs={12} subTone="muted" fill="box4" />
      <Box x={20} y={170} w={200} h={52} lines={['パスパラメーター', 'title: "from_path"']} fs={12} subTone="muted" fill="box4" />
      <T x={20} y={18} fs={12} tone="muted">
        下にあるものほど優先
      </T>
      <Arrow x1={222} y1={56} x2={298} y2={110} />
      <Arrow x1={222} y1={126} x2={298} y2={126} />
      <Arrow x1={222} y1={196} x2={298} y2={142} />
      <Box x={300} y={92} w={200} h={68} lines={['request.parameters', 'title: "from_path"', 'b: "1", q: "1"']} mono fs={11.5} subTone="muted" />
      <Arrow x1={500} y1={126} x2={548} y2={126} />
      <Box x={550} y={86} w={190} h={80} lines={['params', 'ActionController::', 'Parameters']} mono fs={11.5} fill="box5" subTone="muted" />
      <T x={550} y={190} fs={11.5}>
        permit・expect で許可した
      </T>
      <T x={550} y={208} fs={11.5}>
        キーだけをモデルに渡せる
      </T>
    </Svg>
  )
}

/* ---------- 図 10-8 例外の行き先 ---------- */
function ExceptionFigure() {
  return (
    <Svg
      id="10-8"
      w={760}
      h={400}
      label="アクションで例外が起きると、まず process_action の連鎖にある ActionController::Rescue が rescue_from の登録を探す。対応するハンドラがあればそれが応答を作る。無ければ例外はミドルウェアまで上がり、DebugExceptions がログに出力し、ローカルのリクエストなら詳細なエラーページを返す。そうでなければ ShowExceptions が例外を受け取り、ExceptionWrapper の rescue_responses で例外クラスからステータスを決め、exceptions_app に渡す。既定の PublicExceptions は public の 404.html や 500.html を返す"
    >
      <Box x={20} y={14} w={300} h={40} lines="アクションで例外" fs={12.5} fill="box4" />
      <Arrow x1={170} y1={54} x2={170} y2={76} />
      <Box x={20} y={78} w={300} h={46} lines={['ActionController::Rescue', 'rescue_from に登録があるか']} fs={12} subTone="muted" />
      <Arrow x1={320} y1={101} x2={438} y2={101} />
      <T x={380} y={90} fs={11.5} anchor="middle">
        ある
      </T>
      <Box x={440} y={80} w={300} h={42} lines="ハンドラが応答を作る（例：404 の文字列）" fs={12} fill="bg" />
      <Arrow x1={170} y1={124} x2={170} y2={152} />
      <T x={178} y={138} fs={11.5}>
        ない
      </T>
      <Box x={20} y={154} w={300} h={46} lines={['DebugExceptions（ミドルウェア）', 'ログに出力']} fs={12} subTone="muted" />
      <Arrow x1={320} y1={177} x2={438} y2={177} />
      <T x={380} y={166} fs={11} anchor="middle">
        ローカル扱い
      </T>
      <Box x={440} y={156} w={300} h={42} lines="詳細なエラーページ（development）" fs={12} fill="bg" />
      <Arrow x1={170} y1={200} x2={170} y2={228} />
      <Box x={20} y={230} w={300} h={46} lines={['ShowExceptions（ミドルウェア）', 'ExceptionWrapper でステータスを決める']} fs={12} subTone="muted" />
      <Arrow x1={170} y1={276} x2={170} y2={304} />
      <Box x={20} y={306} w={300} h={46} lines={['exceptions_app（既定は PublicExceptions）', 'public/404.html・500.html など']} fs={12} fill="box5" subTone="muted" />

      <Box x={440} y={226} w={300} h={156} fill="bg" lines={[]} />
      <T x={452} y={246} fs={12} bold>
        rescue_responses（抜粋）
      </T>
      {[
        ['RecordNotFound', '404'],
        ['RoutingError', '404'],
        ['ParameterMissing', '400'],
        ['InvalidAuthenticityToken', '422'],
        ['それ以外', '500'],
      ].map(([k, v], i) => (
        <g key={k}>
          <T x={452} y={272 + i * 22} mono fs={11.5}>
            {k}
          </T>
          <T x={720} y={272 + i * 22} mono fs={11.5} anchor="end">
            {v}
          </T>
        </g>
      ))}
      <Arrow x1={438} y1={253} x2={322} y2={253} dashed />
    </Svg>
  )
}

const ch10: Chapter = {
  number: 10,
  part: 2,
  title: 'コントローラーの実行とレスポンス',
  summary:
    'コントローラーのアクションが params で値を受け取り、モデルでデータを読み書きし、インスタンス変数でビューに値を渡して応答を決めることを、ログと応答で確かめます。render と redirect_to の違い、Cookie とセッションでログインの状態を覚える方法、before_action も扱います。そのうえで、ルーティングから呼ばれたコントローラーが、インスタンスを作ってアクションを実行し、Rack の応答の配列を返すまでを追います。params の合成と Strong Parameters、暗黙の描画、例外がエラーページになるまでの経路、Cookie とセッションの保存方法も扱います。',
  goals: [
    'アクションが params で値を受け取り、インスタンス変数でビューに値を渡すことと、render と redirect_to の違いを、ログと応答から説明できる',
    'Cookie とセッションでログインの状態を覚える流れと、before_action でアクションの前に確認を入れる方法を説明できる',
    'AbstractController::Base・Metal・Base の役割の違いを説明できる',
    'dispatch から process_action、アクションの実行、to_a までの流れを説明できる',
    'params がどの値から合成されるかと、Strong Parameters が何を防ぐかを説明できる',
    'render を書かないアクションで何が描画されるかを説明できる',
    'rescue_from、DebugExceptions、ShowExceptions が例外をどう扱い、ステータスがどう決まるかを説明できる',
    'Cookie とセッションがどのミドルウェアで読み書きされ、どう保護されるかを説明できる',
  ],
  prerequisites: [5, 6, 9],
  sections: [
    {
      id: 'controller-role',
      title: 'コントローラーとアクション',
      body: (
        <>
          <p>
            ルーティングがアクションを選ぶと（<ChapterLink n={9} section="routing-role" />）、Rails はコントローラーのインスタンスを作り、アクションのメソッドを呼びます。コントローラーは{' '}
            <code>app/controllers</code> に置くクラスで、記事なら記事の一覧・表示・作成のように、同じ対象への要求をまとめて受け持ちます。アクションの中では、要求から値を受け取り、モデル（データベースの表を扱うクラス）でデータを読み書きし、ビュー（HTML
            を作るテンプレート）で応答の画面を作ります
            <Ref n={4} />。
          </p>
          <p>
            この章の前半の例はデモのアプリケーションをコピーし、記事の作成とログインの機能を足したものを development で動かした結果です。ArticlesController の index と show は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/articles_controller.rb（一部）"
            code={`
class ArticlesController < ApplicationController
  def index
    @articles = Article.order(:id).limit(3)
  end

  def show
    @article = Article.find(params[:id])
  end
end
`}
          />
          <p>
            show はパスから受け取った <code>params[:id]</code> の値を使って、記事を <code>Article.find</code> で読み出し（id が一致する行をデータベースから読み出してオブジェクトにするメソッドです。
            <ChapterLink n={11} section="crud" />）、<code>@article</code> に代入しています。<code>render</code> は書いていませんが、アクションが終わると、Rails は{' '}
            <code>app/views/articles/show.html.erb</code>（コントローラーの名前のディレクトリにある、アクションと同じ名前のテンプレート）で HTML を作ります。テンプレートの中ではコントローラーで代入した{' '}
            <code>@article</code> をそのまま使えます。
          </p>
          <Code
            lang="erb"
            title="app/views/articles/show.html.erb"
            code={`
<h1><%= @article.title %></h1>
<p><%= link_to "一覧へ", articles_path %></p>
`}
          />
          <p>
            <code>GET /articles/1</code> を送ったときのログと、返った HTML の本文です。
          </p>
          <Code
            lang="text"
            title="開発サーバーのログ（SQL の注釈は省略）"
            code={`
Started GET "/articles/1" for 172.29.0.1 at 2026-11-16 07:06:28 +0000
Processing by ArticlesController#show as HTML
  Parameters: {"id" => "1"}
  Article Load (0.8ms)  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 1 LIMIT 1
  ↳ app/controllers/articles_controller.rb:7:in 'ArticlesController#show'
  Rendering layout layouts/application.html.erb
  Rendering articles/show.html.erb within layouts/application
  Rendered articles/show.html.erb within layouts/application (Duration: 0.2ms | GC: 0.0ms)
  Rendered layout layouts/application.html.erb (Duration: 1.2ms | GC: 0.0ms)
Completed 200 OK in 4ms (Views: 1.8ms | ActiveRecord: 0.7ms (1 query, 0 cached) | GC: 0.0ms)
`}
          />
          <Code
            lang="html"
            title="応答の HTML の body の中身（ファイル名の注釈は省略）"
            code={`
<h1>記事1</h1>
<p><a href="/articles">一覧へ</a></p>
`}
          />
          <p>
            ログの順に、params を受け取り、SQL で記事を読み出し、テンプレートで HTML を作り（Rendering と Rendered の行）、200 で応答しています（図 10-1）。layouts/application.html.erb
            は全ページに共通の HTML を書いたテンプレートで、show.html.erb で作った部分はその中に入ります（<ChapterLink n={16} section="layout-partial" />）。
          </p>
          <Figure n="10-1" title="コントローラーとビューの分担" caption="GET /articles/1 のログをもとにした図。">
            <ControllerRoleFigure />
          </Figure>
          <p>
            ビューで使えるのは、コントローラーのインスタンス変数（<code>@</code> で始まる変数）です。show を <code>article = Article.find(params[:id])</code>{' '}
            のようにローカル変数への代入に変えると、ビューの <code>@article</code> は nil（値が無いことを表すオブジェクト）になり、500 の応答になりました。
          </p>
          <Code
            lang="text"
            title="ログ（一部を省略）"
            code={`
Completed 500 Internal Server Error in 62ms (ActiveRecord: 9.1ms (1 query, 0 cached) | GC: 3.3ms)

ActionView::Template::Error (undefined method 'title' for nil)
    1: <h1><%= @article.title %></h1>
    2: <p><%= link_to "一覧へ", articles_path %></p>
`}
          />
          <p>
            Rails は、アクションが終わった後に、コントローラーのインスタンス変数の名前と値を集めてビューに渡してから、テンプレートを実行します（<code>abstract_controller/rendering.rb</code> の{' '}
            <code>view_assigns</code>）
            <Ref n={13} />。ローカル変数はメソッドが終わると無くなるので、ビューには渡りません。
          </p>
        </>
      ),
    },
    {
      id: 'render-redirect',
      title: 'render と redirect_to',
      body: (
        <>
          <p>
            アクションが応答を決める方法には、テンプレートで画面を作って返す <code>render</code> と、別の URL を開くようにブラウザーに指示する <code>redirect_to</code>{' '}
            があります。記事の作成で比べます。コピーの routes.rb を <code>resources :articles, only: [:index, :show, :new, :create]</code>{' '}
            にし、ArticlesController に new と create を足しました。Article には、タイトルが空なら保存しない検証を足しています。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/articles_controller.rb（足したアクション）"
            code={`
  def new
    @article = Article.new
  end

  def create
    @article = Article.new(params.expect(article: [:title]))
    if @article.save
      redirect_to @article
    else
      render :new, status: :unprocessable_content
    end
  end
`}
          />
          <p>
            new は空の記事のオブジェクトを <code>@article</code> に入れ、作成のフォーム（new.html.erb）を表示します。フォームのタイトルの入力欄の名前は <code>article[title]</code>{' '}
            です。送信すると、<code>POST /articles</code> の要求が create に届き、params には <code>{'{"article" => {"title" => "…"}}'}</code>{' '}
            のように、article というキーの下にタイトルが入ります。<code>params.expect(article: [:title])</code> は、article の値から title だけを取り出します。title
            以外を捨てるのは、利用者がフォームに無い値（たとえば管理者かどうかを表す admin）を勝手に足して送っても、モデルに渡さないためです（「params と Strong Parameters」の節）。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行"
            code={`
params = ActionController::Parameters.new("article" => { "title" => "ルーティングの基本", "admin" => "1" })
params[:article][:title]          # => "ルーティングの基本"
params.expect(article: [:title])  # => #<ActionController::Parameters {"title" => "ルーティングの基本"} permitted: true>
`}
          />
          <p>
            <code>Article.new</code> は記事のオブジェクトを作るだけで、<code>save</code> がデータベースに保存します。save は検証に通れば保存して true を、通らなければ保存せずに false
            を返します（<ChapterLink n={14} section="validations" />）。
          </p>
          <p>タイトルを空にして送信すると、ログは次のようになりました。</p>
          <Code
            lang="text"
            title="保存に失敗したときのログ"
            code={`
Started POST "/articles" for 172.29.0.1 at 2026-11-16 07:06:46 +0000
Processing by ArticlesController#create as HTML
  Parameters: {"authenticity_token" => "[FILTERED]", "article" => {"title" => ""}, "commit" => "作成"}
  Rendering layout layouts/application.html.erb
  Rendering articles/new.html.erb within layouts/application
  Rendered articles/new.html.erb within layouts/application (Duration: 3.6ms | GC: 0.0ms)
  Rendered layout layouts/application.html.erb (Duration: 5.9ms | GC: 0.0ms)
Completed 422 Unprocessable Content in 28ms (Views: 7.1ms | ActiveRecord: 0.0ms (0 queries, 0 cached) | GC: 0.3ms)
`}
          />
          <p>
            save が false を返したので、<code>render :new</code> が new.html.erb を使って HTML を作り、状態コード 422 で返しました。<code>render :new</code> は new
            アクションを実行するのではなく、new のテンプレートを使うだけです。<code>@article</code> は create で作った、入力値と検証の誤りを持つオブジェクトなので、返ったフォームには誤りの表示が付きました。
          </p>
          <Code
            lang="html"
            title="返った HTML（フォームの一部）"
            code={`
<p>Title can&#39;t be blank</p>
<div class="field_with_errors"><input type="text" value="" name="article[title]" id="article_title" /></div>
`}
          />
          <p>
            422 は送られた内容を処理できなかったことを表す状態コードです。Rails の既定で入っている Turbo は、フォームの送信に 200 の応答が返ると画面を書き換えないので、失敗したときは{' '}
            <code>status: :unprocessable_content</code> で 422 を指定します（<ChapterLink n={16} section="form" />）。
          </p>
          <p>タイトルを入れて送信すると、応答のヘッダーとログは次のようになりました。</p>
          <Code
            lang="text"
            title="保存に成功したときの応答（curl -i の出力の一部）とログ（一部を省略）"
            code={`
HTTP/1.1 302 Found
location: http://127.0.0.1:3309/articles/4
content-length: 0

Started POST "/articles" for 172.29.0.1 at 2026-11-16 07:06:47 +0000
Processing by ArticlesController#create as HTML
  Parameters: {"authenticity_token" => "[FILTERED]", "article" => {"title" => "ルーティングの基本"}, "commit" => "作成"}
  TRANSACTION (0.8ms)  BEGIN
  Article Create (4.7ms)  INSERT INTO \`articles\` (\`title\`, …) VALUES ('ルーティングの基本', …)
  TRANSACTION (17.7ms)  COMMIT
Redirected to http://127.0.0.1:3309/articles/4
Completed 302 Found in 46ms (ActiveRecord: 23.0ms (1 query, 0 cached) | GC: 0.2ms)
Started GET "/articles/4" for 172.29.0.1 at 2026-11-16 07:06:48 +0000
Processing by ArticlesController#show as HTML
  Parameters: {"id" => "4"}
（略）
Completed 200 OK in 11ms (Views: 4.5ms | ActiveRecord: 0.8ms (1 query, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            <code>redirect_to @article</code> は、記事の URL（<code>article_path(@article)</code> の <code>/articles/4</code> にホスト名を付けたもの）を location
            ヘッダーに入れ、本文が空の 302 を返しました。ブラウザーは 302 を受け取ると、location の URL に GET の要求を送ります（curl は自動では送らないので、同じ GET を送りました）。ログに
            Started の行が2つあるとおり、要求は2回で、記事の画面を作ったのは2回目の要求で呼ばれた show です（図 10-2）。redirect_to はアクションのコードの実行を止めないので、redirect_to
            の後に書いたコードも実行されます
            <Ref n={12} />。
          </p>
          <Figure n="10-2" title="render と redirect_to" caption="デモのアプリケーションのコピー（development）で、記事の作成のフォームを送信したときの要求と応答。">
            <RenderRedirectFigure />
          </Figure>
          <p>
            保存に成功したときに render で記事の画面を返すこともできますが、その場合、ブラウザーに残るのは POST /articles の結果の画面です。利用者がページを再読み込みすると POST
            が送り直され、同じ記事がもう1件作られることがあります。redirect_to で GET の画面に移しておけば、再読み込みで送られるのは GET /articles/4 です
            <Ref n={15} />。
          </p>
        </>
      ),
    },
    {
      id: 'cookie-session',
      title: 'Cookie とセッションでログインを覚える',
      body: (
        <>
          <p>
            HTTP の要求は1回ずつ独立していて、サーバーは、ある要求が前の要求と同じブラウザーから来たものかを、要求のメソッドとパスだけでは区別できません。ログインした状態を覚えておくには{' '}
            <Term en="cookie">Cookie</Term> を使います。Cookie は、サーバーが応答の set-cookie ヘッダーで渡した名前と値をブラウザーが保存し、同じサーバーへの次からの要求で、cookie
            ヘッダーに付けて送り返す仕組みです
            <Ref n={14} />。
          </p>
          <p>
            Rails の<Term en="session">セッション</Term>は、Cookie を使って、要求をまたいで値を覚えておく機能です。コントローラーで <code>session[:author_id] = 1</code>{' '}
            と書くと、同じブラウザーからの次からの要求でも <code>session[:author_id]</code> で 1 を読めます
            <Ref n={4} />。既定では、セッションの中身全体が暗号化されて Cookie に入ります（仕組みは「Cookie とセッション」の節で扱います）。
          </p>
          <p>
            コピーに、メールアドレスでログインする SessionsController を足しました。セッションの使い方を見るために、パスワードの確認を省いています。実際のアプリケーションではパスワードも確かめます（
            <ChapterLink n={21} />）。
          </p>
          <Code
            lang="ruby"
            title="config/routes.rb（足した行）と app/controllers/sessions_controller.rb"
            code={`
get "login" => "sessions#new"
post "login" => "sessions#create"
delete "logout" => "sessions#destroy"

class SessionsController < ApplicationController
  def new
  end

  def create
    author = Author.find_by(email: params[:email])
    if author
      reset_session
      session[:author_id] = author.id
      redirect_to new_article_path
    else
      render :new, status: :unprocessable_content
    end
  end

  def destroy
    reset_session
    redirect_to articles_path, status: :see_other
  end
end
`}
          />
          <p>
            new はメールアドレスの入力欄を持つログインのフォームを表示します。create は送られたメールアドレスの著者を探し、見つかればセッションに著者の id を入れて、記事の作成の画面へ移します。
            <code>reset_session</code> はセッションの中身を消して、新しいセッションにするメソッドです。Rails ガイドはログインに成功したら reset_session
            を呼ぶことを勧めています。攻撃者がログインの前に用意したセッションを、ログインの後に使わせないためです
            <Ref n={16} />。ログアウトの destroy も reset_session でセッションを消します。DELETE の要求へのリダイレクトに <code>status: :see_other</code>（303）を付けているのは、302
            では POST や DELETE の後の移動先への要求を GET に変えるかどうかがブラウザーによって違い、303 なら必ず GET になるためです
            <Ref n={15} />。
          </p>
          <p>
            ログインのフォームを curl で送りました。CSRF 対策（ほかのサイトから勝手に送信させる攻撃を防ぐ仕組み。<ChapterLink n={21} section="csrf" />
            ）のため、フォームに埋め込まれたトークンと、フォームを開いたときに受け取った Cookie も一緒に送っています。応答のヘッダーは次のとおりです。
          </p>
          <Code
            lang="text"
            title="POST /login の応答（curl -i の出力の一部。Cookie の値は一部を省略）"
            code={`
HTTP/1.1 302 Found
location: http://127.0.0.1:3309/articles/new
set-cookie: _demo_session=LRrGVND1E5aWPELxK31r…; path=/; httponly; samesite=lax
`}
          />
          <p>
            set-cookie ヘッダーで、<code>_demo_session</code> という名前の Cookie が渡されました。値の後ろの <code>path=/</code> などは Cookie の属性です。
            <code>path=/</code> はサイトのすべてのパスへの要求で送ること、<code>httponly</code> はページの JavaScript から読めないようにすること、<code>samesite=lax</code>{' '}
            は、ほかのサイトのページから送られる要求には、リンクをたどってこのサイトのページを開く場合を除いて付けないことを表します
            <Ref n={14} />。続けて <code>GET /articles/new</code> を送ると、curl はこの Cookie を cookie
            ヘッダーに付けて送り、200 が返りました（ブラウザーも同じように送ります）。
          </p>
          <Code
            lang="text"
            title="GET /articles/new の要求と応答（curl -v の出力の一部）"
            code={`
> GET /articles/new HTTP/1.1
> Host: 127.0.0.1:3309
> Cookie: _demo_session=LRrGVND1E5aWPELxK31r…
> Accept: text/html
< HTTP/1.1 200 OK
`}
          />
          <p>Cookie の値は暗号化されていて、ブラウザーの側では中身を読めません。アプリケーションの鍵で復号すると、ログインの前後で次のように変わっていました。</p>
          <Code
            lang="text"
            title="Cookie を復号した中身（bin/rails runner で表示。値の一部を省略）"
            code={`
ログインのフォームを開いた後  {"session_id" => "0661c574…", "_csrf_token" => "zR5TNwMg…"}
ログインした後                {"session_id" => "25a88747…", "author_id" => 1}
`}
          />
          <p>
            ログインした後のセッションには author_id が入り、reset_session によって session_id も新しい値に変わりました。_csrf_token は CSRF 対策のトークンの元になる値で、reset_session
            で消え、次にフォームを表示したときに作り直されました。Rails は要求の cookie ヘッダーから Cookie を読んで復号し、<code>session[:author_id]</code> で 1 を返します（図
            10-3）。ログアウト（<code>DELETE /logout</code>）の後のセッションは <code>{'{"session_id" => "b12488ae…"}'}</code> だけになり、author_id は消えました。
          </p>
          <Figure n="10-3" title="Cookie とセッション" caption="デモのアプリケーションのコピー（development）で、ログインしてから作成の画面を開いたときの要求と応答。">
            <CookieSessionFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'before-action',
      title: 'before_action でアクションの前に処理を入れる',
      body: (
        <>
          <p>
            ログインした著者だけが記事を作れるようにします。new と create の先頭に同じ確認を書く代わりに、<code>before_action</code>{' '}
            で、アクションの前に呼ぶメソッドを登録します
            <Ref n={4} />。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/application_controller.rb と articles_controller.rb（一部）"
            code={`
class ApplicationController < ActionController::Base
  private
    def require_login
      @current_author = Author.find_by(id: session[:author_id])
      redirect_to login_path unless @current_author
    end
end

class ArticlesController < ApplicationController
  before_action :require_login, only: [:new, :create]

  # index・show・new は前と同じ

  def create
    @article = Article.new(params.expect(article: [:title]))
    @article.author = @current_author
    if @article.save
      redirect_to @article
    else
      render :new, status: :unprocessable_content
    end
  end
end
`}
          />
          <p>
            <code>before_action :require_login</code> はアクションを呼ぶ前に require_login を呼ぶ指定です。<code>only:</code> で対象を new と create に絞っているので、index と show
            はログインしなくても表示できます。require_login は ApplicationController に private で定義しました。private のメソッドはルートから呼ばれるアクションになりません。ApplicationController
            を継承したほかのコントローラーでも、同じ before_action を書けます。
          </p>
          <p>
            require_login はセッションの author_id の著者を探します。ログインしていなければ <code>session[:author_id]</code> は nil で、著者が見つからないので、ログインの画面へ
            redirect_to します。before_action に登録したメソッドの中で render か redirect_to を呼ぶと、Rails はアクションを呼びません
            <Ref n={4} />。Cookie を付けずに <code>GET /articles/new</code> を送ったときのログです。
          </p>
          <Code
            lang="text"
            title="ログインしていないときのログ（一部を省略）"
            code={`
Started GET "/articles/new" for 172.29.0.1 at 2026-11-16 07:07:39 +0000
Processing by ArticlesController#new as HTML
  Author Load (3.9ms)  SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` IS NULL LIMIT 1
Redirected to http://127.0.0.1:3309/login
Filter chain halted as :require_login rendered or redirected
Completed 302 Found in 37ms (ActiveRecord: 9.4ms (1 query, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            <code>Filter chain halted</code> の行は、before_action の require_login が redirect_to したので、その後の new アクションを呼ばなかったことを表します。テンプレートを描画した行（Rendering）もありません。
          </p>
          <p>
            ログインした状態で同じ要求を送ると、require_login の SQL は <code>WHERE `authors`.`id` = 1</code> になり、new のテンプレートが描画されて 200 が返りました（「Cookie
            とセッションでログインを覚える」の節）。続けて記事を作ると、INSERT の author_id に 1 が入りました。before_action のメソッドで代入した <code>@current_author</code>{' '}
            を、create の中でそのまま使えます（図 10-4）。
          </p>
          <Code
            lang="text"
            title="ログインした状態で記事を作ったときのログ（一部を省略）"
            code={`
Processing by ArticlesController#create as HTML
  Parameters: {"authenticity_token" => "[FILTERED]", "article" => {"title" => "ログインして書いた記事"}, "commit" => "作成"}
  Author Load (11.5ms)  SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` = 1 LIMIT 1
  ↳ app/controllers/application_controller.rb:7:in 'ApplicationController#require_login'
  Article Create (41.8ms)  INSERT INTO \`articles\` (\`title\`, …, \`author_id\`, …) VALUES ('ログインして書いた記事', …, 1, …)
Redirected to http://127.0.0.1:3309/articles/5
Completed 302 Found in 548ms (ActiveRecord: 87.6ms (2 queries, 0 cached) | GC: 0.0ms)
`}
          />
          <Figure n="10-4" title="before_action でアクションの前に確認する" caption="デモのアプリケーションのコピー（development）のログをもとにした図。">
            <BeforeActionFigure />
          </Figure>
          <p>
            ここまでの節で使った params・render・redirect_to・session・before_action は、ArticlesController にも ApplicationController にも定義していません。ApplicationController
            が継承している ActionController::Base と、Base が取り込んでいるモジュールのメソッドです。次の「コントローラーのクラス階層」の節からは、これらのメソッドがどこに定義されているかと、ルーティングから呼ばれたコントローラーが
            params を作り、アクションを呼び、応答を返すまでを、Rails のソースで追います。
          </p>
        </>
      ),
    },
    {
      id: 'hierarchy',
      title: 'コントローラーのクラス階層',
      body: (
        <>
          <p>
            業務で書くコントローラーは、ApplicationController を通して <code>ActionController::Base</code> を継承しています。デモのアプリケーションで ArticlesController の祖先のうちクラスだけを取り出すと、次のようになりました。
          </p>
          <Code
            lang="ruby"
            code={`
ArticlesController.ancestors.take_while { |k| k != Object }.select { |k| k.is_a?(Class) }
# => [ArticlesController, ApplicationController, ActionController::Base,
#     ActionController::Metal, AbstractController::Base]
ArticlesController.ancestors.size     # => 72
ActionController::Base::MODULES.size  # => 36
`}
          />
          <p>3つの基底クラスは、次のように役割が分かれています。</p>
          <ul>
            <li>
              <code>AbstractController::Base</code>：HTTP の処理を含まない、アクションの呼び出しの仕組み（<code>process</code>、<code>action_methods</code> など）。ActionMailer もこのクラスを使います。
            </li>
            <li>
              <code>ActionController::Metal</code>：リクエストと応答のオブジェクトを持ち、Rack の応答の配列を返す最小限のコントローラー。
            </li>
            <li>
              <code>ActionController::Base</code>：Metal に36個のモジュールを include したもの。描画、Strong Parameters、Cookie、CSRF 対策、コールバック、例外処理などはモジュールが持ちます。
            </li>
          </ul>
          <Figure n="10-5" title="コントローラーのクラス階層" caption="Rails 8.1.4.1 の ActionController::Base::MODULES の36個を、本書で役割ごとにまとめた図。">
            <HierarchyFigure />
          </Figure>
          <p>
            祖先に並ぶ72個のクラスとモジュールの大半は、これらのモジュールです。<ChapterLink n={1} />の図 1-6 で見た <code>process_action</code> の7つの定義は、このうち ParamsWrapper、Instrumentation、Rescue、Callbacks
            などのモジュールにあります。
          </p>
        </>
      ),
    },
    {
      id: 'dispatch',
      title: 'dispatch からアクションの実行まで',
      body: (
        <>
          <p>
            ルーティングの Dispatcher は、コントローラーのクラスメソッド <code>dispatch</code> を呼びます（<ChapterLink n={9} />）。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_controller/metal.rb（331〜337行目、249〜255行目）"
            href={`${GH}/actionpack/lib/action_controller/metal.rb#L331-L337`}
            code={`
    def self.dispatch(name, req, res)
      if middleware_stack.any?
        middleware_stack.build(name) { |env| new.dispatch(name, req, res) }.call req.env
      else
        new.dispatch(name, req, res)
      end
    end

    def dispatch(name, request, response) # :nodoc:
      set_request!(request)
      set_response!(response)
      process(name)
      request.commit_flash
      to_a
    end
`}
          />
          <p>
            クラスメソッドは、リクエストごとに <code>new</code> でコントローラーのインスタンスを作ります。インスタンス変数（<code>@article</code>{' '}
            など）がリクエストの間で混ざらないのはこのためです。コントローラーにも <code>use</code> でミドルウェアを登録でき、その場合はコントローラー専用のスタックを通ります
            <Ref n={1} />。インスタンスの <code>dispatch</code> は、リクエストと応答を設定し、<code>process</code> でアクションを実行し、flash を確定してから <code>to_a</code>{' '}
            で応答の配列を返します。<code>to_a</code> は <code>response.to_a</code> を呼ぶだけで、ActionDispatch::Response が <code>[status, headers, body]</code> を作ります。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/abstract_controller/base.rb（145〜155行目、220〜228行目）"
            href={`${GH}/actionpack/lib/abstract_controller/base.rb#L145-L155`}
            code={`
    def process(action, ...)
      @_action_name = action.to_s

      unless action_name = _find_action_name(@_action_name)
        raise ActionNotFound.new("The action '#{action}' could not be found for #{self.class.name}", self, action)
      end

      @_response_body = nil

      process_action(action_name, ...)
    end

      def process_action(...)
        send_action(...)
      end

      # Actually call the method associated with the action. Override this method if
      # you wish to change how action methods are called, not to add additional
      # behavior around it. For example, you would override #send_action if you want
      # to inject arguments into the method.
      alias send_action send
`}
          />
          <p>
            <code>_find_action_name</code> は、アクション名が <code>action_methods</code> に含まれるかを確かめます。<code>action_methods</code> は、コントローラーの public メソッドから、最初の抽象クラス（
            <code>abstract!</code> を宣言した ActionController::Base）とそのモジュールの public メソッドを除いたものです。private・protected のメソッドはアクションになりません。一方、ApplicationController
            に書いた public メソッドは、サブクラスのアクションとして扱われます。見つからなければ <code>AbstractController::ActionNotFound</code>（404）です
            <Ref n={2} />。
          </p>
          <p>
            <code>process_action</code> は各モジュールが <code>super</code> を呼ぶ形で上書きしており（<ChapterLink n={3} />）、パラメーターの包み直し、計測、例外の捕捉、before_action
            などのコールバックを順に通った後、AbstractController::Base の定義に届きます。その <code>send_action</code> は <code>send</code> の別名なので、最後は <code>send("show")</code>{' '}
            で show メソッドが呼ばれます。
          </p>
          <Figure n="10-6" title="dispatch から応答の配列まで" caption="Rails 8.1.4.1 の metal.rb・abstract_controller/base.rb・basic_implicit_render.rb を読んでまとめた図。process_action の連鎖の詳細は図 1-6 を参照。">
            <DispatchFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'params',
      title: 'params と Strong Parameters',
      body: (
        <>
          <p>
            コントローラーの <code>params</code> は、<code>request.parameters</code> を <code>ActionController::Parameters</code> で包んだものです（<code>strong_parameters.rb</code> の
            1519〜1529 行目）。<code>request.parameters</code> は次のように作られます。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/http/parameters.rb（52〜64行目）"
            href={`${GH}/actionpack/lib/action_dispatch/http/parameters.rb#L52-L64`}
            code={`
      def parameters
        params = get_header("action_dispatch.request.parameters")
        return params if params

        params = begin
                   request_parameters.merge(query_parameters)
                 rescue EOFError
                   query_parameters.dup
                 end
        params.merge!(path_parameters)
        set_header("action_dispatch.request.parameters", params)
        params
      end
`}
          />
          <p>
            本文のパラメーター（<code>request_parameters</code>）にクエリ文字列のパラメーターを、さらにルーティングのパスパラメーターをマージしています。<code>merge</code>{' '}
            は後のハッシュの値で上書きするので、同じ名前ならパスパラメーターが最も優先されます。結果は env に保存され、2回目からはそれを返します
            <Ref n={3} />。デモのアプリケーションで、3か所に同じ <code>title</code> を入れて確かめました。
          </p>
          <Code
            lang="text"
            code={`
POST /probe/echo/from_path?title=from_query&q=1   （ルートは post "probe/echo/:title"）
本文: title=from_body&b=1

params => {"title":"from_path","b":"1","q":"1","controller":"probe","action":"echo"}
`}
          />
          <Figure n="10-7" title="params の合成" caption="上の実行結果を図にしたもの。">
            <ParamsFigure />
          </Figure>
          <p>
            本文が JSON の場合は、Content-Type に応じて JSON として解析されます。さらに ParamsWrapper が、JSON の値をコントローラー名のキーの下にも複製します。<code>{'{"name":"json"}'}</code>{' '}
            を送ると、params には <code>"name"</code> と並んで <code>{'"probe" => {"name" => "json"}'}</code> が入りました
            <Ref n={4} />。JSON の API で <code>params.expect(article: [...])</code> と書けるのはこのためです。
          </p>
          <p>
            <Term>Strong Parameters</Term> は、許可していないキーがモデルの一括代入（<code>Article.new(hash)</code> など）に渡るのを防ぐ仕組みです。ActionController::Parameters
            は、<code>permit</code> や <code>expect</code> を通すまでは「許可されていない」状態で、そのままモデルに渡すと ActiveModel が{' '}
            <code>ActiveModel::ForbiddenAttributesError</code> を投げます。Rails 8.0 で追加された <code>expect</code> は、必須のキーの確認と許可を1回で行います。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_controller/metal/strong_parameters.rb（780〜785行目）"
            href={`${GH}/actionpack/lib/action_controller/metal/strong_parameters.rb#L780-L785`}
            code={`
    def expect(*filters)
      params = permit_filters(filters)
      keys = filters.flatten.flat_map { |f| f.is_a?(Hash) ? f.keys : f }
      values = params.require(keys)
      values.size == 1 ? values.first : values
    end
`}
          />
          <p>デモのアプリケーション（production）での結果は次のとおりです。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>アクションの中身</th>
                  <th>送った本文</th>
                  <th>結果</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>Article.new(params.expect(article: [:title]))</code>
                  </td>
                  <td>
                    <code>article[title]=ok&amp;article[admin]=1</code>
                  </td>
                  <td>200。title だけが渡り、admin は捨てられる</td>
                </tr>
                <tr>
                  <td>同上</td>
                  <td>
                    <code>other=1</code>
                  </td>
                  <td>
                    400（<code>ActionController::ParameterMissing</code>）
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>Article.new(params[:article])</code>
                  </td>
                  <td>
                    <code>article[title]=x</code>
                  </td>
                  <td>
                    500（<code>ActiveModel::ForbiddenAttributesError</code>）
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Callout kind="v72">
            <p>
              <code>params.expect</code> は Rails 8.0 で追加されたもので、Rails 7.2.4 にはありません
              <Ref n={5} />。7.2 では <code>params.require(:article).permit(:title)</code> と書きます。<code>require</code> と <code>permit</code> の組み合わせは、<code>article</code>{' '}
              がハッシュでなく文字列だった場合などに 400 ではなく 500 になることがあります。<code>expect</code> のドキュメントは、この組み合わせより安全な書き方として <code>expect</code> を勧めています
              <Ref n={5} />。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'render',
      title: '描画と応答のオブジェクト',
      body: (
        <>
          <p>
            show アクションは <code>@article = Article.find(params[:id])</code> だけで、<code>render</code> を書いていません。それでも show.html.erb が描画されるのは、ImplicitRender
            が include している BasicImplicitRender が <code>send_action</code> を上書きしているためです。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_controller/metal/basic_implicit_render.rb（7〜15行目）"
            href={`${GH}/actionpack/lib/action_controller/metal/basic_implicit_render.rb#L7-L15`}
            code={`
    def send_action(method, *args)
      ret = super
      default_render unless performed?
      ret
    end

    def default_render
      head :no_content
    end
`}
          />
          <p>
            アクションのメソッドから戻った時点で、まだ応答の本文が決まっていなければ（<code>performed?</code> が偽なら）<code>default_render</code> を呼びます。ActionController::Base では
            ImplicitRender の <code>default_render</code> が使われ、アクション名のテンプレートがあれば <code>render</code> します。テンプレートが無い場合は、ブラウザーからの通常の GET（HTML
            を求めるリクエスト）なら <code>ActionController::MissingExactTemplate</code>（406）、それ以外は <code>head :no_content</code>（204）になります（<code>implicit_render.rb</code> の
            37〜54 行目）
            <Ref n={6} />。デモのアプリケーションで、テンプレートの無いアクションに HTML を求めると 406、JSON を求めると 204 が返りました。
          </p>
          <p>
            <code>render</code> の結果は <code>response_body=</code> で応答のオブジェクトに入ります。2回 <code>render</code> すると <code>AbstractController::DoubleRenderError</code>{' '}
            です。<code>redirect_to</code> も応答の本文を決めるので、<code>render</code> と <code>redirect_to</code> を両方呼んでも同じ例外になります。<code>head :ok</code>{' '}
            は本文を空にしてステータスだけを決めます。ビューの描画の内部は<ChapterLink n={16} />で扱います。
          </p>
          <p>
            応答のオブジェクト <code>ActionDispatch::Response</code> は、ステータス、ヘッダー（Rack 3 では <code>Rack::Headers</code>）、本文を持ちます。<code>dispatch</code> の最後の{' '}
            <code>to_a</code> がこれを Rack の配列にし、ミドルウェアを逆にたどって Puma に返ります（<ChapterLink n={6} />）。
          </p>
        </>
      ),
    },
    {
      id: 'exceptions',
      title: '例外がエラー応答になるまで',
      body: (
        <>
          <p>
            アクションの中で起きた例外は、まず <code>process_action</code> の連鎖にある ActionController::Rescue で捕捉されます。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_controller/metal/rescue.rb（35〜40行目）"
            href={`${GH}/actionpack/lib/action_controller/metal/rescue.rb#L35-L40`}
            code={`
      def process_action(*)
        super
      rescue Exception => exception
        request.env["action_dispatch.show_detailed_exceptions"] ||= show_detailed_exceptions?
        rescue_with_handler(exception) || raise
      end
`}
          />
          <p>
            <code>rescue_with_handler</code> は ActiveSupport::Rescuable のメソッドで、<code>rescue_from</code> で登録した例外処理用のメソッドやブロック（ハンドラ）を探して呼びます。見つからなければ <code>raise</code>{' '}
            で例外を投げ直します
            <Ref n={7} />。投げ直された例外はコントローラーの外に出て、ミドルウェアをさかのぼります。<ChapterLink n={6} />のスタックでは、DebugExceptions がログに出力し、<code>config.consider_all_requests_local</code> が true（development
            の既定）なら詳細なエラーページを返します。そうでなければ外側の ShowExceptions に届きます。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/show_exceptions.rb（31〜45行目、48〜56行目）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/show_exceptions.rb#L31-L56`}
            code={`
    def call(env)
      @app.call(env)
    rescue Exception => exception
      request = ActionDispatch::Request.new env
      backtrace_cleaner = request.get_header("action_dispatch.backtrace_cleaner")
      wrapper = ExceptionWrapper.new(backtrace_cleaner, exception)
      request.set_header "action_dispatch.exception", wrapper.unwrapped_exception
      request.set_header "action_dispatch.report_exception", !wrapper.rescue_response?

      if wrapper.show?(request)
        render_exception(request.dup, wrapper)
      else
        raise exception
      end
    end

      def render_exception(request, wrapper)
        status = wrapper.status_code
        request.set_header "action_dispatch.original_path", request.path_info
        request.set_header "action_dispatch.original_request_method", request.raw_request_method
        fallback_to_html_format_if_invalid_mime_type(request)
        request.path_info = "/#{status}"
        request.request_method = "GET"
        response = @exceptions_app.call(request.env)
        response[1][Constants::X_CASCADE] == "pass" ? pass_response(status) : response
`}
          />
          <p>
            ExceptionWrapper は、例外のクラス名から <code>rescue_responses</code> の表でステータスを決めます。表に無い例外は 500 です。ActiveRecord の Railtie は{' '}
            <code>ActiveRecord::RecordNotFound</code> を 404 として追加しています
            <Ref n={8} />。ShowExceptions は、パスを <code>/404</code> のように書き換えて <code>exceptions_app</code> を呼びます。既定の <code>exceptions_app</code> は PublicExceptions
            で、<code>public/404.html</code> のようなファイルを返します
            <Ref n={9} />。<code>config.exceptions_app = routes</code> とすると、エラーページを通常のルートとコントローラーで作れます。
          </p>
          <Figure n="10-8" title="例外の行き先" caption="Rails 8.1.4.1 の rescue.rb・debug_exceptions.rb・show_exceptions.rb・exception_wrapper.rb を読んでまとめた図。">
            <ExceptionFigure />
          </Figure>
          <p>デモのアプリケーションを production で動かしたときの結果をまとめます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>リクエスト</th>
                  <th>起きたこと</th>
                  <th>応答</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>GET /articles/999999</code>
                  </td>
                  <td>RecordNotFound（rescue_from なし）</td>
                  <td>404、public/404.html</td>
                </tr>
                <tr>
                  <td>
                    <code>GET /probe/find_rescued</code>
                  </td>
                  <td>RecordNotFound を rescue_from で処理</td>
                  <td>404、ハンドラが返した文字列</td>
                </tr>
                <tr>
                  <td>
                    <code>GET /nope</code>
                  </td>
                  <td>ルートが無い（RoutingError）</td>
                  <td>404、public/404.html</td>
                </tr>
                <tr>
                  <td>
                    <code>GET /probe/boom</code>
                  </td>
                  <td>RuntimeError</td>
                  <td>500、public/500.html</td>
                </tr>
                <tr>
                  <td>
                    <code>GET /probe/double</code>
                  </td>
                  <td>DoubleRenderError</td>
                  <td>500、public/500.html</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Callout kind="note">
            <p>
              <code>config.action_dispatch.show_exceptions</code> は、<code>:all</code>（既定。すべての例外をエラー応答にする）、<code>:rescuable</code>（rescue_responses
              にある例外だけ）、<code>:none</code>（すべて投げ直す）を取ります（<code>exception_wrapper.rb</code> の 185〜198 行目）。テスト環境の既定は <code>:rescuable</code>{' '}
              （生成される <code>config/environments/test.rb</code> に書かれている）で、500 になるはずの例外はテストの中で例外として見えます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'cookies-session',
      title: 'Cookie とセッション',
      body: (
        <>
          <p>
            Cookie の読み書きは、ミドルウェアの ActionDispatch::Cookies と、リクエストに付く cookie jar が分担します。コントローラーの <code>cookies</code>{' '}
            は、最初に使われたときに作られる cookie jar で、書き込んだ値は jar に記録されるだけです。アクションが終わって応答がミドルウェアに戻ってきたとき、Cookies が jar の内容を{' '}
            <code>set-cookie</code> ヘッダーに書き出します。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/cookies.rb（721〜734行目）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/cookies.rb#L721-L734`}
            code={`
    def call(env)
      request = ActionDispatch::Request.new(env)
      response = @app.call(env)

      if request.have_cookie_jar?
        cookie_jar = request.cookie_jar
        unless cookie_jar.committed?
          response = Rack::Response[*response]
          cookie_jar.write(response)
        end
      end

      response.to_a
    end
`}
          />
          <p>
            <code>cookies.signed</code> は値に署名を付けて改ざんを検出し、<code>cookies.encrypted</code> はさらに暗号化して中身を読めなくします。鍵は <code>secret_key_base</code>{' '}
            から用途ごとのソルトで導出され、暗号化の既定は AES-256-GCM です
            <Ref n={10} />。<code>secret_key_base</code> が変わると、既存の Cookie はすべて読めなくなります。
          </p>
          <p>
            セッションの既定の保存先 <code>ActionDispatch::Session::CookieStore</code> は、セッションの中身全体を <code>cookies.signed_or_encrypted</code>（新しいアプリケーションでは暗号化される jar）に保存します（
            <code>session/cookie_store.rb</code> の 121〜122 行目）。サーバー側には何も保存しないので、Puma のプロセスやサーバーが複数あっても、どのプロセスでも同じセッションを読めます。デモのアプリケーションで{' '}
            <code>session[:user_id] = 42</code> と <code>flash[:notice]</code> を設定すると、production では次のヘッダーが返りました（値の大部分は省略）。
          </p>
          <Code
            lang="text"
            code={`
set-cookie: _demo_session=oKbhi2j91UHJi9RL01Jh…; path=/; secure; httponly; samesite=lax
`}
          />
          <p>
            Cookie の値は410バイトでした。<code>secure</code>（https の接続でだけ Cookie を送らせる属性）は <code>config.force_ssl</code>（http の要求を https へ移すなどして、https だけで通信させる設定）が有効なため、ミドルウェアを組み立てるときにセッションのオプションへ追加されたものです（default_middleware_stack.rb の 76〜81 行目）。development では <code>secure</code> が付きませんでした。
          </p>
          <p>
            Cookie は1つあたり 4096 バイトまでで、超えると <code>ActionDispatch::Cookies::CookieOverflow</code> になります（<code>cookies.rb</code> の 213〜216 行目）。Rails
            ガイドも、CookieStore に保存できるのは 4 kB 程度なので大きなデータやモデルのオブジェクトを入れないように説明しています
            <Ref n={11} />。デモのアプリケーションでセッションに 5000 文字を入れると、暗号化と符号化の後で 9137 バイトになり、この例外で 500 になりました。flash は、セッションの中の{' '}
            <code>"flash"</code> というキーに保存され、<code>dispatch</code> の <code>request.commit_flash</code> で次のリクエストに渡す内容が確定します。
          </p>
          <Callout kind="note">
            <p>
              CSRF 対策（<code>protect_from_forgery</code>）と、Cookie を使った認証の注意点は<ChapterLink n={21} />で扱います。ロードバランサーの後ろで <code>secure</code>{' '}
              属性やリダイレクト先のスキームが正しく決まるための設定は<ChapterLink n={25} />で扱います。
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
          <li>アクションは params で要求の値を受け取り、モデルでデータを読み書きし、インスタンス変数に入れた値をビューに渡します。render を書かなければ、アクションと同じ名前のテンプレートで HTML を作ります。</li>
          <li>render は同じ要求の中でテンプレートから応答を作り、redirect_to は location ヘッダーと 302 を返してブラウザーに次の GET を送らせます。保存に成功したら redirect_to、失敗したら render と 422 を使います。</li>
          <li>Cookie はサーバーが set-cookie で渡し、ブラウザーが次からの要求の cookie で送り返す値です。session はこれを使って要求をまたいで値を覚え、ログインした著者の id などを入れます。ログインの後は reset_session でセッションを作り直します。</li>
          <li>before_action はアクションの前にメソッドを呼びます。その中で render か redirect_to を呼ぶと、アクションは呼ばれません。</li>
          <li>AbstractController::Base がアクションの呼び出しを、Metal がリクエストと応答を、Base が36個のモジュールで実用の機能を担当します。</li>
          <li>dispatch はリクエストごとにインスタンスを作り、process → process_action の連鎖 → send_action でアクションを呼び、to_a で Rack の配列を返します。</li>
          <li>params は本文、クエリ文字列、パスパラメーターの順に上書きで合成されます。許可していないパラメーターをモデルに渡すと ForbiddenAttributesError になります。</li>
          <li>render を書かないアクションは、テンプレートがあれば描画し、無ければ 406 か 204 になります。</li>
          <li>例外は rescue_from で処理されなければミドルウェアに伝わり、ShowExceptions が rescue_responses でステータスを決めて public の HTML を返します。</li>
          <li>Cookie は Cookies ミドルウェアが応答の時点で書き出し、セッションは既定で暗号化された Cookie に保存されます。上限は 4096 バイトです。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'actionpack/lib/action_controller/metal.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'クラスメソッドとインスタンスメソッドの dispatch、to_a、response_body=、performed?、コントローラー単位のミドルウェア。' },
    { title: 'actionpack/lib/abstract_controller/base.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/abstract_controller/base.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'process、action_methods、process_action と send_action。' },
    { title: 'actionpack/lib/action_dispatch/http/parameters.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/http/parameters.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'request.parameters を本文・クエリ文字列・パスパラメーターから合成する実装。' },
    { title: 'Action Controller Overview', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/action_controller_overview.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'JSON パラメーターの包み直し（wrap_parameters）、Strong Parameters と expect、署名付き・暗号化された Cookie。' },
    { title: 'actionpack/lib/action_controller/metal/strong_parameters.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/strong_parameters.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'params、expect と expect!、ParameterMissing。7.2.4 の同じファイルには expect が無いことを差分で確認。' },
    { title: 'actionpack/lib/action_controller/metal/implicit_render.rb・basic_implicit_render.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/implicit_render.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '暗黙の描画と、テンプレートが無い場合の 406・204。' },
    { title: 'actionpack/lib/action_controller/metal/rescue.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/rescue.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'process_action で例外を捕捉し、rescue_with_handler に渡す実装。' },
    { title: 'actionpack/lib/action_dispatch/middleware/exception_wrapper.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/exception_wrapper.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'rescue_responses の表と show?（show_exceptions の設定）。RecordNotFound の追加は activerecord/lib/active_record/railtie.rb。' },
    { title: 'actionpack/lib/action_dispatch/middleware/show_exceptions.rb・public_exceptions.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/show_exceptions.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'ShowExceptions が exceptions_app を呼ぶ処理と、PublicExceptions が public/404.html などを返す処理。' },
    { title: 'actionpack/lib/action_dispatch/middleware/cookies.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/cookies.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Cookies ミドルウェアの call、MAX_COOKIE_SIZE と CookieOverflow、暗号化の既定（aes-256-gcm）。セッションの保存は session/cookie_store.rb。' },
    { title: 'Action Controller Overview（Session Stores）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/action_controller_overview.html#session-stores', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'CookieStore が保存できるのは 4 kB 程度で、大きなデータやモデルを入れないこと。' },
    { title: 'Layouts and Rendering in Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/layouts_and_rendering.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'render と redirect_to の違い、redirect_to の既定の状態コードが 302 であること、redirect_to の後のコードも実行されること。' },
    { title: 'actionpack/lib/abstract_controller/rendering.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/abstract_controller/rendering.rb`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'view_assigns がコントローラーのインスタンス変数を集めてビューに渡すこと（62〜68行目）。' },
    { title: 'Using HTTP cookies', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies', accessed: '2026-11-16', note: 'HTTP は状態を持たないこと、Set-Cookie で渡した Cookie をブラウザーが Cookie ヘッダーで送り返すこと。' },
    { title: 'Redirections in HTTP', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections', accessed: '2026-11-16', note: '302 は GET 以外のメソッドを GET に変えるかどうかが決まっておらず、303 は GET に変えること。POST の後に 303 で移すと、再読み込みで操作が繰り返されないこと。' },
    { title: 'Securing Rails Applications（Session Fixation - Countermeasures）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/security.html#session-fixation-countermeasures', accessed: '2026-11-16', version: 'Rails 8.1', note: 'ログインに成功したら reset_session で新しいセッションにすること。' },
  ],
}

export default withExplanations(ch10, explanation10)
