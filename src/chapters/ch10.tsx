import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation10 } from '../explanations/request'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 16-1 コントローラーとビューの分担 ---------- */
function ControllerRoleFigure() {
  return (
    <Svg
      id="16-1"
      w={780}
      h={310}
      label="ブラウザーが GET /articles/1 を送ると、ルーティングが articles#show を選ぶ。ArticlesController の show は params[:id] の 1 を使って Article.find でデータベースから記事を読み出し、@article に代入する。アクションが終わると、ビューの show.html.erb が @article の title を HTML に埋め込む。できた HTML がステータスコード 200 の応答としてブラウザーに返る"
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

/* ---------- 図 16-2 render と redirect_to ---------- */
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
      id="16-2"
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

/* ---------- 図 16-3 Cookie とセッション（段階送り） ---------- */
type CookieStep = { req: string; res: string; proc: string; cookie: string; session: string }

function CookieSnapshot({ i, step }: { i: number; step: CookieStep }) {
  return (
    <Svg
      id={`16-3-${i}`}
      w={760}
      h={200}
      label={`ブラウザーからの要求は ${step.req}。Rails の処理は ${step.proc}。応答は ${step.res}。応答の後にブラウザーが持つ Cookie は ${step.cookie}。復号したセッションの中身は ${step.session}`}
    >
      <Box x={10} y={10} w={120} h={76} lines="ブラウザー" fs={12} />
      <Box x={630} y={10} w={120} h={76} lines="Rails" fs={12} />
      <T x={380} y={22} anchor="middle" fs={11} mono>
        {step.req}
      </T>
      <Arrow x1={132} y1={36} x2={626} y2={36} accent />
      <T x={380} y={56} anchor="middle" fs={11} mono>
        {step.res}
      </T>
      <Arrow x1={628} y1={70} x2={134} y2={70} />
      <Box x={10} y={98} w={740} h={32} lines={`Rails の処理：${step.proc}`} fs={11.5} fill="box5" />
      <Box x={10} y={140} w={300} h={50} lines={['ブラウザーが保存している Cookie', step.cookie]} fs={11} fill="box4" subTone="muted" />
      <Box x={320} y={140} w={430} h={50} lines={['応答の後のセッション（復号した中身）', step.session]} fs={11} fill="box" subTone="muted" />
    </Svg>
  )
}

const cookieSteps: { label: string; step: CookieStep; text: string }[] = [
  {
    label: 'フォームを開く',
    step: {
      req: 'GET /login（Cookie はまだない）',
      res: '200 ログインのフォーム ＋ set-cookie: _demo_session=…',
      proc: 'フォームに埋め込むトークンの元 _csrf_token をセッションに入れる',
      cookie: '_demo_session=…（初めて保存）',
      session: '{"session_id" => "0661c574…", "_csrf_token" => "zR5TNwMg…"}',
    },
    text: 'ログインのフォームを開くと、Rails はフォームに埋め込む CSRF 対策のトークンを作り、その元になる値 _csrf_token をセッションに入れます。セッションに値が入ったので、応答の set-cookie で _demo_session の Cookie が渡され、ブラウザーはこれを保存します。',
  },
  {
    label: 'ログインを送る',
    step: {
      req: 'POST /login（email・トークン）＋ cookie',
      res: '302 location: /articles/new ＋ set-cookie',
      proc: 'reset_session で中身を消してから session[:author_id] = 1',
      cookie: '_demo_session=LRrGVND1E5aWPELxK31r…',
      session: '{"session_id" => "25a88747…", "author_id" => 1}',
    },
    text: 'フォームの送信には保存した Cookie とフォームのトークンが付きます。create は著者を見つけると reset_session でセッションを作り直し、author_id に 1 を入れます。新しい中身を暗号化した Cookie は応答の set-cookie で渡されました。session_id は新しい値に変わり、_csrf_token は消えました。',
  },
  {
    label: '次の要求',
    step: {
      req: 'GET /articles/new ＋ cookie: _demo_session=LRrG…',
      res: '200 作成のフォーム ＋ set-cookie',
      proc: 'Cookie を復号し、session[:author_id] から 1 を読む',
      cookie: '_demo_session=…（中身を更新）',
      session: '{"session_id" => "25a88747…", "author_id" => 1, "_csrf_token" => "…"}',
    },
    text: 'ブラウザーは保存した Cookie を cookie ヘッダーに付けて送ります。Rails はこれを復号し、session[:author_id] から 1 を読みました。メソッドとパスだけでは分からない「どの著者がログインしているか」を、Cookie の中身から判断できます。作成のフォームを表示するときに _csrf_token が作り直されるので、author_id を残したまま中身を更新した Cookie も返ります。',
  },
  {
    label: 'ログアウト',
    step: {
      req: 'DELETE /logout ＋ cookie',
      res: '303 location: /articles ＋ set-cookie',
      proc: 'reset_session でセッションを作り直す（author_id は消える）',
      cookie: '_demo_session=…（新しいセッション）',
      session: '{"session_id" => "b12488ae…"}',
    },
    text: 'ログアウトの destroy も reset_session を呼びます。応答は 303 で、set-cookie で新しいセッションの Cookie が渡されます。復号した中身は session_id だけで、author_id は消えていました。ブラウザーは location の /articles に GET を送ります。',
  },
  {
    label: 'ログアウト後の要求',
    step: {
      req: 'GET /articles/new ＋ cookie',
      res: '302 location: /login',
      proc: 'session[:author_id] は nil。次の節の before_action がログインの画面へ移す',
      cookie: '_demo_session=…（ログアウトで受け取った値）',
      session: '{"session_id" => "b12488ae…"}',
    },
    text: 'ログアウトの後の Cookie には author_id がないので、session[:author_id] は nil を返します。次の節で足す before_action の require_login は、このとき作成の画面を表示せずにログインの画面へ redirect_to します。',
  },
]

function CookieSessionStepper() {
  return (
    <Stepper
      steps={cookieSteps.map((c, i) => ({
        label: c.label,
        detail: (
          <>
            <CookieSnapshot i={i + 1} step={c.step} />
            <p>{c.text}</p>
          </>
        ),
      }))}
    />
  )
}

/* ---------- 図 16-4 before_action ---------- */
function BeforeActionFigure() {
  return (
    <Svg
      id="16-4"
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

/* ---------- 図 16-5 コントローラーのクラス階層 ---------- */
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
      id="16-5"
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

/* ---------- 図 16-6 dispatch から応答の配列まで ---------- */
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
      id="16-6"
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

/* ---------- 図 16-7 params の合成 ---------- */
function ParamsFigure() {
  return (
    <Svg
      id="16-7"
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

/* ---------- 図 16-8 例外の行き先 ---------- */
function ExceptionFigure() {
  return (
    <Svg
      id="16-8"
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

/* ---------- flash の値が表示される要求（番号なし） ---------- */
function FlashTimelineFigure() {
  const colX = [290, 455, 620]
  const colW = 150
  const rowY = (i: number) => 52 + i * 58
  type Cell = { lines: string[]; kind: 'show' | 'warn' | 'none' } | null
  const rows: { label: [string, string]; cells: Cell[] }[] = [
    {
      label: ['redirect_to …, notice: …', '成功して移動先で出す'],
      cells: [{ lines: ['notice を入れて 302'], kind: 'none' }, { lines: ['移動先の画面に表示'], kind: 'show' }, { lines: ['消えている'], kind: 'none' }],
    },
    {
      label: ['flash.now[:alert] ＋ render', 'この要求の画面にだけ出す'],
      cells: [{ lines: ['この画面に表示'], kind: 'show' }, { lines: ['残っていない'], kind: 'none' }, null],
    },
    {
      label: ['flash[:alert] ＋ render', 'now を付けなかった場合'],
      cells: [{ lines: ['この画面に表示'], kind: 'show' }, { lines: ['次の画面にもう一度表示'], kind: 'warn' }, { lines: ['消えている'], kind: 'none' }],
    },
    {
      label: ['flash.keep(:notice)', '要求2で呼び、要求3まで残す'],
      cells: [{ lines: ['notice を入れて 302'], kind: 'none' }, { lines: ['flash.keep(:notice)', 'して 302'], kind: 'none' }, { lines: ['移動先の画面に表示'], kind: 'show' }],
    },
  ]
  return (
    <Svg
      id="ch10-flash-timeline"
      w={780}
      h={310}
      label="flash にメッセージを入れる4つの書き方と、メッセージが表示される要求。redirect_to に notice を付けると、要求1は 302 を返し、要求2の移動先の画面に表示され、要求3では消えている。flash.now[:alert] を設定して render すると、要求1の画面にだけ表示され、要求2には残っていない。now を付けずに flash[:alert] を設定して render すると、要求1の画面に表示され、要求2の画面にもう一度表示され、要求3では消えている。要求2で flash.keep(:notice) を呼んでもう一度 redirect_to すると、要求3の移動先の画面に表示される"
    >
      <T x={20} y={20} bold fs={12.5}>
        flash の書き方
      </T>
      {['要求1（設定した要求）', '要求2（次の要求）', '要求3'].map((t, i) => (
        <T key={t} x={colX[i] + colW / 2} y={20} bold fs={12} anchor="middle">
          {t}
        </T>
      ))}
      <Arrow x1={290} y1={36} x2={768} y2={36} />
      {rows.map((r, i) => (
        <g key={r.label[0]}>
          <Box x={20} y={rowY(i)} w={255} h={44} lines={r.label} fs={12} fill="bg" subTone="muted" align="start" />
          {r.cells.map((c, j) =>
            c === null ? null : c.kind === 'warn' ? (
              <g key={j}>
                <Box x={colX[j]} y={rowY(i)} w={colW} h={44} fill="box5" />
                <T x={colX[j] + colW / 2} y={rowY(i) + 22} fs={11.5} anchor="middle" tone="danger">
                  {c.lines[0]}
                </T>
              </g>
            ) : c.kind === 'show' ? (
              <Box key={j} x={colX[j]} y={rowY(i)} w={colW} h={44} lines={c.lines} fs={11.5} fill="box5" />
            ) : (
              <g key={j}>
                <Box x={colX[j]} y={rowY(i)} w={colW} h={44} fill="bg" dashed />
                {c.lines.map((t, k) => (
                  <T key={t} x={colX[j] + colW / 2} y={rowY(i) + 22 + (k - (c.lines.length - 1) / 2) * 16} fs={11.5} anchor="middle" tone="muted">
                    {t}
                  </T>
                ))}
              </g>
            ),
          )}
        </g>
      ))}
      <T x={20} y={294} fs={11.5} tone="muted">
        紫の箱：その要求で返す画面にメッセージが表示される　破線の箱：表示されない
      </T>
    </Svg>
  )
}

/* ---------- process_action の入れ子と rescue_from の範囲（番号なし） ---------- */
function RescueRangeFigure() {
  const layers = [
    { name: 'ParamsWrapper の process_action', x: 20, y: 10, w: 740, h: 280 },
    { name: 'Instrumentation の process_action', x: 40, y: 42, w: 700, h: 238 },
    { name: 'Rescue の process_action', x: 60, y: 74, w: 660, h: 196, accent: true },
    { name: 'Callbacks の process_action', x: 80, y: 112, w: 620, h: 112 },
  ]
  return (
    <Svg
      id="ch10-rescue-range"
      w={780}
      h={320}
      label="ParamsWrapper の process_action の中で Instrumentation の process_action が、その中で Rescue の process_action が、その中で Callbacks の process_action が実行される。Callbacks の process_action の中で、before_action のメソッド（require_login、set_article）が実行された後にアクションが実行される。Rescue の process_action は rescue Exception でこの範囲全体の例外を捕まえるので、アクションの中の例外も before_action のメソッドの中の例外も rescue_from の処理の対象になる。外側の枠ほど、base.rb で後に include したモジュール"
    >
      {layers.map(l => (
        <g key={l.name}>
          <Box x={l.x} y={l.y} w={l.w} h={l.h} fill="box2" accent={l.accent} />
          <T x={l.x + 14} y={l.y + 18} fs={12} bold={l.accent}>
            {l.name}
          </T>
        </g>
      ))}
      <T x={706} y={92} fs={11.5} tone="muted" mono anchor="end">
        rescue Exception =&gt; exception
      </T>
      <Box x={100} y={148} w={250} h={56} lines={['before_action のメソッド', 'require_login、set_article']} fs={12} fill="bg" subTone="muted" />
      <Arrow x1={352} y1={176} x2={418} y2={176} />
      <Box x={420} y={148} w={260} h={56} lines={['アクション', 'show、create など']} fs={12} fill="bg" subTone="muted" />
      <T x={80} y={246} fs={11.5} tone="acc">
        Rescue の枠の中で起きた例外は、before_action のメソッドの中のものも rescue_from の処理の対象
      </T>
      <T x={20} y={308} fs={11.5} tone="muted">
        外側の枠ほど、base.rb で後に include したモジュール
      </T>
    </Svg>
  )
}

/* ---------- セッションをメモリーに持つ方式と Cookie に入れる方式（番号なし） ---------- */
function SessionStoreFigure() {
  return (
    <Svg
      id="ch10-session-store"
      w={780}
      h={290}
      label="左はセッションをプロセスのメモリーに持つ方式。ブラウザーのログインの要求1はプロセス A が処理し、author_id: 1 をプロセス A のメモリーに保存する。次の要求2をプロセス B が処理すると、プロセス B にはセッションが無い。右は Cookie に入れる方式。要求1を処理したプロセス A はセッションを暗号化して set-cookie でブラウザーに渡し、ブラウザーは Cookie を保存する。要求2は cookie ヘッダーを付けてプロセス B に届き、プロセス B は同じ secret_key_base で Cookie を復号して author_id: 1 を読む"
    >
      <T x={20} y={18} bold fs={12.5}>
        プロセスのメモリーに持つ方式
      </T>
      <Box x={20} y={36} w={100} h={200} lines="ブラウザー" fs={12} />
      <Box x={250} y={32} w={130} h={64} lines={['プロセス A', 'author_id: 1 を', 'メモリーに保存']} fs={12} subTone="muted" />
      <Box x={250} y={172} w={130} h={56} lines={['プロセス B', 'セッションが無い']} fs={12} subTone="danger" />
      <Arrow x1={122} y1={60} x2={248} y2={60} />
      <T x={128} y={48} fs={11.5}>
        要求1：ログイン
      </T>
      <Arrow x1={122} y1={200} x2={248} y2={200} />
      <T x={128} y={188} fs={11.5}>
        要求2
      </T>
      <T x={20} y={264} fs={11.5} tone="muted">
        要求ごとに処理するプロセスが変わる
      </T>

      <Arrow x1={395} y1={8} x2={395} y2={280} plain dashed />

      <T x={410} y={18} bold fs={12.5}>
        Cookie に入れる方式（CookieStore）
      </T>
      <Box x={410} y={36} w={100} h={200} fill="box" />
      <T x={460} y={60} fs={12} anchor="middle">
        ブラウザー
      </T>
      <Box x={420} y={96} w={80} h={70} lines={['Cookie', '暗号化した', 'セッション']} fs={11.5} fill="box4" />
      <Box x={640} y={32} w={130} h={64} lines={['プロセス A', '暗号化して', 'set-cookie で渡す']} fs={12} subTone="muted" />
      <Box x={640} y={172} w={130} h={64} lines={['プロセス B', 'Cookie を復号して', 'author_id: 1']} fs={12} subTone="muted" fill="box5" />
      <Arrow x1={512} y1={52} x2={638} y2={52} />
      <T x={518} y={41} fs={11.5}>
        要求1：ログイン
      </T>
      <Arrow x1={638} y1={78} x2={512} y2={78} />
      <T x={518} y={90} fs={11.5} mono>
        set-cookie
      </T>
      <Arrow x1={512} y1={204} x2={638} y2={204} />
      <T x={518} y={192} fs={11.5}>
        要求2 ＋ cookie
      </T>
      <T x={410} y={264} fs={11.5} tone="muted">
        どのプロセスも同じ secret_key_base で復号する
      </T>
    </Svg>
  )
}

const ch10: Chapter = {
  number: 10,
  part: 2,
  title: 'コントローラーの実行とレスポンス',
  summary:
    '記事を保存した後に HTML を返す場合と、別の URL を開くようブラウザーに伝える場合では、ログに残る要求の数が違います。フォームの入力がコントローラーに届いてから応答が返るまでを追います。',
  goals: [
    'params から保存に使う項目を取り出し、アクションの前に呼ばれる処理を確認できる',
    'render と redirect_to の違いを、ステータスコードと次の要求の有無から読み取れる',
    '要求をまたいでログイン状態を参照できる理由を Cookie とセッションで説明できる',
    'テンプレートの選択や例外の処理を経て、どの応答が返ったかをログで追える',
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
            ログの順に、params を受け取り、SQL で記事を読み出し、テンプレートで HTML を作り（Rendering と Rendered の行）、200 で応答しています（図 16-1）。layouts/application.html.erb
            は全ページに共通の HTML を書いたテンプレートで、show.html.erb で作った部分はその中に入ります（<ChapterLink n={16} section="layout-partial" />）。
          </p>
          <Figure n="16-1" title="コントローラーとビューの分担" caption="GET /articles/1 のログをもとにした図。">
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
            Parameters の行には、フォームの入力欄のほかに2つの値があります。authenticity_token は Rails がフォームに埋め込む CSRF 対策のトークンで（<ChapterLink n={21} section="csrf" />）、ログでは値が [FILTERED] に置き換えられています。commit は送信ボタンの値です。
          </p>
          <p>
            save が false を返したので、<code>render :new</code> が new.html.erb を使って HTML を作り、ステータスコード 422 で返しました。<code>render :new</code> は new
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
            内容を処理できなかったことをクライアントに伝えるため、<code>status: :unprocessable_content</code> で 422 を返します。応答の本文にはエラーメッセージ付きのフォームが入ります（<ChapterLink n={16} section="form" />）。
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
            Started の行が2つあるとおり、要求は2回で、記事の画面を作ったのは2回目の要求で呼ばれた show です（図 16-2）。redirect_to はアクションのコードの実行を止めないので、redirect_to
            の後に書いたコードも実行されます
            <Ref n={12} />。
          </p>
          <Figure n="16-2" title="render と redirect_to" caption="デモのアプリケーションのコピー（development）で、記事の作成のフォームを送信したときの要求と応答。">
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
            で消え、次にフォームを表示したときに作り直されました。Rails は要求の cookie ヘッダーから Cookie を読んで復号し、<code>session[:author_id]</code> で 1 を返します。ログアウト（<code>DELETE /logout</code>）の後のセッションは <code>{'{"session_id" => "b12488ae…"}'}</code> だけになり、author_id は消えました。
          </p>
          <p>
            図 16-3 ではログインのフォームを開いてからログアウトの後の要求までを5つの段階に分けています。段階を進めると、各段階の要求と応答のヘッダー、ブラウザーが保存している Cookie、復号したセッションの中身がどう変わるかを確かめられます。
          </p>
          <Figure
            n="16-3"
            title="Cookie とセッション（段階送り）"
            caption="この節の curl の実行結果と Cookie を復号した結果（デモのアプリケーションのコピー、development）をもとにした概念モデルです。値は一部を省略しています。実際のブラウザーは 302 や 303 を受け取ると location の URL へ自動で GET を送り、その応答でも Cookie が更新されることがあります。Cookie の値は暗号化されているので、ブラウザーの側では中身を読めません。"
          >
            <CookieSessionStepper />
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
            を、create の中でそのまま使えます（図 16-4）。
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
          <Figure n="16-4" title="before_action でアクションの前に確認する" caption="デモのアプリケーションのコピー（development）のログをもとにした図。">
            <BeforeActionFigure />
          </Figure>
          <p>
            ここまでの節で使った params・render・redirect_to・session・before_action は、ArticlesController にも ApplicationController にも定義していません。ApplicationController
            が継承している ActionController::Base と、Base が取り込んでいるモジュールのメソッドです。これらのメソッドがどこに定義されているかと、ルーティングから呼ばれたコントローラーが params を作り、アクションを呼び、応答を返すまでの処理は
            <ChapterLink n={10} section="hierarchy" /> からの節で Rails のソースを使って追います。これらの節は Rails の内部の仕組みに進む人向けの内容で、Rails 基礎知識コースでは読み飛ばしてかまいません。
          </p>
        </>
      ),
    },
    {
      id: 'flash-and-hooks',
      title: '次の画面に通知を渡す Flash とアクションの前後処理',
      body: (
        <>
          <p>記事を保存して別の URL に移るとき、保存したことを移動先で知らせるには <code>flash[:notice]</code> を使います。通常の Flash は次の要求まで残ります。同じ要求でフォームを描画し直す場合は <code>flash.now[:alert]</code> を使うと、通知が次の画面に持ち越されません。リダイレクトをもう一度挟む必要があれば、<code>flash.keep(:notice)</code> で通知をさらに次の要求へ渡せます。<Ref n={20} /></p>
          <Code lang="ruby" title="保存後の通知と入力エラーの通知" code={`
def create
  @article = Article.new(params.expect(article: [:title, :body]))
  if @article.save
    redirect_to @article, notice: "記事を保存しました", status: :see_other
  else
    flash.now[:alert] = "入力内容を確認してください"
    render :new, status: :unprocessable_content
  end
end
`} />
          <p>ビューは <code>flash[:notice]</code> と <code>flash[:alert]</code> を読み、値があるときに通知を表示します。フォームにどの項目の誤りがあるかは、別に <code>@article.errors</code> から表示します。</p>
          <p><code>after_action</code> では、アクションが作った応答のステータスなどを記録できます。アクションが例外で中断すると実行されません。例外時も経過時間を記録するなら、<code>around_action</code> で <code>yield</code> してアクションを実行し、<code>ensure</code> に計測結果を記録する処理を書きます。時間差には時計の時刻補正に影響されない <code>Process.clock_gettime(Process::CLOCK_MONOTONIC)</code> が使えます。<Ref n={17} /></p>
        </>
      ),
    },
    {
      id: 'controller-practice',
      title: "CRUD を保つコントローラーの書き方",
      body: (
        <>
          <p>
            ここまでの節の create は、params から値を取り出し、モデルの save を呼び、結果に応じて redirect_to か render を選んでいました。アクションが増えると、1つのアクションに条件の判定や検索が足されていき、どこを直せばよいかが読み取りにくくなります。この節では、どの処理をアクションに書き、どの処理をほかの場所に書くかを見ます。
          </p>
          <p>
            コントローラーでは、入力を受け付ける、処理を呼ぶ、結果を HTTP の応答に変える、という順で考えます。たとえば「この記事が公開可能か」はモデル側の規則です。アクションにあるのは <code>@article.publish!</code> の呼び出しと成功・失敗をどう返すかです。表示用の内容を整える仕事はビューやヘルパー（ビューから呼ぶメソッドを置くモジュール。<ChapterLink n={16} section="helpers" />）に置けます（<ChapterLink n={30} section="architecture-boundaries">境界の決め方</ChapterLink>）。<Ref n={17} />
          </p>
          <Code
            lang="ruby"
            title="記事を公開するアクションの例（publish! は Article に定義するメソッド）"
            code={`
def publish
  @article = Article.find(params[:id])   # 入力を受け付ける
  @article.publish!                      # 処理を呼ぶ。公開できるかどうかの判定は publish! の中に書く
  redirect_to @article, notice: "公開しました", status: :see_other   # 結果を応答に変える
end
`}
          />
          <p>
            「本文が空の記事は公開できない」のような条件をこのアクションの中に if で書くと、同じ条件を、記事を公開するほかの処理（管理画面や、時刻を指定して公開する処理など）にも書くことになります。条件を Article の publish! に書いておけば、条件が増えたときに直すのは publish! だけで、アクションは変わりません。
          </p>
          <h3>成功後の再読み込みと flash</h3>
          <p>
            「render と redirect_to」の節では、保存に成功したら redirect_to で GET の画面へ移しました。POST の後に GET へ移すこの流れは Post/Redirect/Get（PRG）と呼ばれます。PATCH や DELETE の後に取得へ切り替えることも明示できる応答は <code>303 See Other</code> です。更新（PATCH）や削除（DELETE）の後の redirect_to に <code>status: :see_other</code> を付けると 303 になり、移動先への要求は必ず GET になります（「Cookie とセッションでログインを覚える」の節の destroy と同じ理由です）。<Ref n={18} /><Ref n={19} />
          </p>
          <p>
            フォームの選択肢を <code>new</code> で用意している場合は、<code>create</code> のエラーで再描画する経路でもその値を用意します。<code>render :new</code> は new のテンプレートを使うだけで、new アクションは実行しないためです。
          </p>
          <Code
            lang="ruby"
            title="フォームに著者の選択肢を出す例"
            code={`
def new
  @article = Article.new
  @authors = Author.order(:id)     # フォームの選択肢
end

def create
  @article = Article.new(params.expect(article: [:title, :author_id]))
  if @article.save
    redirect_to @article
  else
    @authors = Author.order(:id)   # ここで代入しないと、new.html.erb の @authors は nil になる
    render :new, status: :unprocessable_content
  end
end
`}
          />
          <p>
            create の else の側で <code>@authors</code> を代入し忘れると、入力に誤りがあるときだけ、テンプレートが nil の <code>@authors</code> を使って 500 になります（「コントローラーとアクション」の節で見た <code>undefined method … for nil</code> と同じ種類の誤りです）。正しい入力では redirect_to の側を通るので、保存に失敗する入力を試さないと見つかりません。
          </p>
          <p>
            <code>redirect_to @article, notice: "公開しました"</code> の <code>notice:</code> は flash に値を入れる指定です。flash は次の要求まで残しておくメッセージを入れる場所で、移動先の画面のテンプレートで <code>flash[:notice]</code> として読め、その次の要求では消えています。
          </p>
          <p>
            成功後の移動先で出す <code>notice:</code> に対し、同じ要求で <code>render</code> する画面だけに出すときは <code>flash.now[:alert]</code> を設定します。さらに次のリダイレクト先まで保ちたいときは <code>flash.keep(:notice)</code> で残すキーを指定します。<Ref n={20} />
          </p>
          <Code
            lang="ruby"
            title="flash と flash.now の使い分け"
            code={`
# 成功：redirect_to の移動先（次の要求）の画面で表示する
redirect_to @article, notice: "作成しました"

# 失敗：この要求で返す画面にだけ表示する
flash.now[:alert] = "保存できませんでした"
render :new, status: :unprocessable_content
`}
          />
          <p>
            render する画面に <code>flash[:alert] = …</code>（now なし）で設定すると、メッセージは次の要求まで残るので、利用者が次に開いた画面にも、同じメッセージがもう一度表示されます。
          </p>
          <p>
            次の図は flash にメッセージを入れる4つの書き方を行に、要求1から要求3を列にして、どの要求で返す画面にメッセージが表示されるかを示したものです。行ごとに紫の箱がどの列にあるかを見てください。
          </p>
          <Figure
            title="flash の値が表示される要求"
            caption="この節の説明をまとめた模式図。要求1は flash を設定した要求、要求2はその次の要求。4行目の flash.keep は要求2のアクションの中で呼ぶ。"
          >
            <FlashTimelineFigure />
          </Figure>
          <h3>フックに置く準備と、例外の置き場所</h3>
          <p>
            フックは before_action のように、アクションの前後に呼ばれるように登録しておく処理のことです。
          </p>
          <p>
            <code>before_action</code> には、認証や複数アクションで同じ規則で行う取得を置き、<code>only: %i[show edit update destroy]</code> などで対象を明示します（<code>%i[show edit]</code> は <code>[:show, :edit]</code> と同じ、シンボルの配列の書き方です）。たとえば show だけが必要とするフォームやサイドバーのデータは、アクション内で準備すると読み手が依存を追いやすくなります。親コントローラーのフックを一部の公開アクションで外す <code>skip_before_action</code> を使う場合も、外す対象を明示します。<Ref n={17} />
          </p>
          <Code
            lang="ruby"
            title="before_action に置く処理と、アクションの中に書く処理"
            code={`
class ArticlesController < ApplicationController
  before_action :require_login, only: %i[new create edit update destroy]   # 認証
  before_action :set_article, only: %i[show edit update destroy]           # 4つのアクションで同じ取得

  def show
    @recent_articles = Article.order(id: :desc).limit(5)   # show だけが使うので、show の中に書く
  end

  private
    def set_article
      @article = Article.find(params[:id])
    end
end
`}
          />
          <p>
            <code>@recent_articles</code> の取得を <code>only:</code> なしの before_action に置くと、それを表示しない edit や update でも同じ SQL が実行されます。また show.html.erb を読む人は、<code>@recent_articles</code> の代入が show アクションの中に無いので、before_action に登録したメソッドを順に読んで探すことになります。
          </p>
          <p>
            skip_before_action は、親のクラスで登録した before_action を、子のコントローラーの一部のアクションで外す宣言です。ApplicationController で全アクションにログインを求め、ログインの画面だけ外す場合は次のように書きます。
          </p>
          <Code
            lang="ruby"
            title="skip_before_action で外す対象を明示する"
            code={`
class ApplicationController < ActionController::Base
  before_action :require_login   # 継承したすべてのコントローラーの、すべてのアクションが対象
end

class SessionsController < ApplicationController
  skip_before_action :require_login, only: %i[new create]   # ログインの画面と送信先だけ外す
end
`}
          />
          <p>
            <code>only:</code> を付けずに <code>skip_before_action :require_login</code> と書くと、後から SessionsController に足したアクションも、ログインなしで呼べるようになります。
          </p>
          <p>
            <code>rescue_from</code> は、アクションの中で起きた例外（処理を続けられない誤りを表すオブジェクト）の種類ごとに、応答を作るメソッドを登録する宣言です（内部は「例外がエラー応答になるまで」の節で読みます）。
            共通の例外応答は <code>rescue_from</code> でまとめられます。どの画面でも対象が見つからない場合に同じ 404 を返すなら共通化でき、特定の画面だけが入力を復元して再表示する場合はそのアクションで扱えます。広いクラスを一律に捕まえる設定にすると、不具合まで通常応答へ置き換わるため、復旧方法が決まっている型を指定します。アプリケーション全体で使う認証・例外・ロケール（表示する言語と地域の設定）の設定は <code>ApplicationController</code>、管理画面にだけ必要な共通条件は <code>Admin::BaseController</code>（管理画面のコントローラーだけが継承する親クラス）が候補になります。<Ref n={17} />
          </p>
          <Code
            lang="ruby"
            title="rescue_from には、応答の決まっている例外のクラスを指定する"
            code={`
class ApplicationController < ActionController::Base
  # 記事や著者が見つからないときは、どの画面でも同じ 404 を返す
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  # rescue_from StandardError, with: :not_found   # 広すぎる指定の例

  private
    def not_found
      render plain: "見つかりません", status: :not_found
    end
end
`}
          />
          <p>
            StandardError は、Ruby のほとんどの例外の親クラスです。コメントにした行のように StandardError を指定すると、メソッド名の打ち間違いで起きる NoMethodError のような不具合も「見つかりません」の 404 になり、500 の応答として現れなくなります。
          </p>
          <p>
            たとえば公開アクションにタグ登録、公開日時の更新、通知、サイドバー用の記事検索が並んでいたら、それぞれの処理を、ほかにどの画面や処理が必要とするかを1つずつ調べます。公開条件と日時の確定は記事の操作（この節の最初の例の publish! のような、Article のメソッド）へ移します。一覧の検索条件はスコープ（モデルに名前を付けて定義した検索条件。<ChapterLink n={12} section="scope-design" />）へ、公開後の通知はコミット後の処理（データベースへの保存が確定した後に呼ばれる after_commit。<ChapterLink n={14} section="after-commit" />）へ移します。サイドバーだけの取得は表示するアクションに限ると、共通の before_action から不要な SQL が発生するのを防げます。
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
          <p>各行は次のことをしています。</p>
          <ul>
            <li>
              <code>ancestors</code> は、ArticlesController のメソッドを探す順に、クラスとモジュールを並べた配列を返します。
            </li>
            <li>
              <code>take_while {'{ |k| k != Object }'}</code> は、配列の先頭から Object の手前までを取り出します。Object から後ろは、Ruby のすべてのクラスに共通の祖先なので除いています。
            </li>
            <li>
              <code>select {'{ |k| k.is_a?(Class) }'}</code> は、そのうちクラスだけを残します。モジュールはここで除かれます。
            </li>
            <li>
              2つ目の式の 72 は、モジュールと Object から後ろも含めた祖先の数です。3つ目の式の <code>ActionController::Base::MODULES</code> は、Base が include するモジュールを並べた配列の定数で、36個あります。
            </li>
          </ul>
          <p>
            クラスは5つで、後ろの3つ（ActionController::Base、ActionController::Metal、AbstractController::Base）が Rails のクラスです。この3つの基底クラスは、次のように役割が分かれています。
          </p>
          <ul>
            <li>
              <code>AbstractController::Base</code>：HTTP の処理を含まない、アクションの呼び出しの仕組み（<code>process</code>、<code>action_methods</code> など）。ActionMailer もこのクラスを使います。
            </li>
            <li>
              <code>ActionController::Metal</code>：リクエストと応答のオブジェクトを持ち、Rack の応答の配列（ステータスコード、ヘッダー、本文の3つを並べた配列。<ChapterLink n={6} section="rack-contract" />）を返す最小限のコントローラー。
            </li>
            <li>
              <code>ActionController::Base</code>：Metal に36個のモジュールを include したもの。描画、Strong Parameters、Cookie、CSRF 対策、コールバック（before_action のように、アクションの前後に呼ぶ処理）、例外処理などはモジュールが持ちます。
            </li>
          </ul>
          <p>
            図 16-5 の左の列は継承の関係で、下のクラスが上のクラスを継承しています。右の枠は Base が include する36個のモジュールを役割ごとに分けて、一部の名前を載せたものです。ActionController::API は、JSON だけを返すアプリケーションのために、Base より少ないモジュールを Metal に include したクラスです。
          </p>
          <Figure n="16-5" title="コントローラーのクラス階層" caption="Rails 8.1.4.1 の ActionController::Base::MODULES の36個を、本書で役割ごとにまとめた図。">
            <HierarchyFigure />
          </Figure>
          <p>
            祖先に並ぶ72個のクラスとモジュールの大半は、これらのモジュールです。<ChapterLink n={1} />の図 2-6 で見た <code>process_action</code> の7つの定義は、このうち ParamsWrapper、Instrumentation、Rescue、Callbacks
            などのモジュールにあります。
          </p>
          <p>
            ここまでの節で使ったメソッドが、どのクラスやモジュールに定義されているかを表にします。ファイルの場所は actionpack/lib からのパスです（rescue_from だけは activesupport/lib からのパス）。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>メソッド</th>
                  <th>定義しているクラス・モジュール</th>
                  <th>ファイル</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>params</code>
                  </td>
                  <td>ActionController::StrongParameters</td>
                  <td>action_controller/metal/strong_parameters.rb</td>
                </tr>
                <tr>
                  <td>
                    <code>render</code>
                  </td>
                  <td>AbstractController::Rendering。ActionController::Rendering が上書きして、2回目の render を確かめてから super で呼ぶ</td>
                  <td>abstract_controller/rendering.rb、action_controller/metal/rendering.rb</td>
                </tr>
                <tr>
                  <td>
                    <code>redirect_to</code>
                  </td>
                  <td>ActionController::Redirecting</td>
                  <td>action_controller/metal/redirecting.rb</td>
                </tr>
                <tr>
                  <td>
                    <code>session</code>、<code>reset_session</code>
                  </td>
                  <td>ActionController::Metal。どちらもリクエストのオブジェクトの同じ名前のメソッドを呼ぶだけ</td>
                  <td>action_controller/metal.rb</td>
                </tr>
                <tr>
                  <td>
                    <code>cookies</code>
                  </td>
                  <td>ActionController::Cookies。<code>request.cookie_jar</code> を返す</td>
                  <td>action_controller/metal/cookies.rb</td>
                </tr>
                <tr>
                  <td>
                    <code>before_action</code>
                  </td>
                  <td>
                    AbstractController::Callbacks（クラスメソッド。<ChapterLink n={5} section="rails-dsl" />）
                  </td>
                  <td>abstract_controller/callbacks.rb</td>
                </tr>
                <tr>
                  <td>
                    <code>rescue_from</code>
                  </td>
                  <td>ActiveSupport::Rescuable（クラスメソッド）。ActionController::Rescue が include している</td>
                  <td>active_support/rescuable.rb</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Rails のソースのファイル名は、モジュール名を小文字と下線に直したものです（StrongParameters なら strong_parameters.rb）。表に無いメソッドの定義場所は、<ChapterLink n={1} section="find-source" />の <code>owner</code> と <code>source_location</code> で調べられます。
          </p>
          <Code
            lang="ruby"
            title="bin/rails console で、メソッドを定義しているモジュールとファイルを調べる"
            code={`
ArticlesController.instance_method(:params).owner            # 定義しているモジュール
ArticlesController.instance_method(:params).source_location  # ファイル名と行番号
ArticlesController.instance_method(:render).super_method     # super で呼ばれる、次の定義
`}
          />
          <p>
            render と redirect_to は、ActionController::Instrumentation（action_controller/metal/instrumentation.rb）にも同じ名前の定義があります。Instrumentation は表のモジュールより後に include されていて ancestors では前にあるので、こちらの定義が先に見つかります。Instrumentation の render は描画にかかった時間を計り、redirect_to は計測のイベントを出し、どちらも <code>super</code> で表のモジュールの定義を呼びます。3行目の <code>super_method</code> は、この <code>super</code> で呼ばれる定義を返します。
          </p>
          <p>
            モジュールを include する順は、<code>process_action</code> の連鎖の順を決めています。Base が36個のモジュールを include する部分の最後は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_controller/base.rb（include の最後の部分）"
            href={`${GH}/actionpack/lib/action_controller/base.rb`}
            code={`
    include DefaultHeaders
    include Logging
    # Before callbacks should also be executed as early as possible, so also include
    # them at the bottom.
    include AbstractController::Callbacks
    # Append rescue at the bottom to wrap as much as possible.
    include Rescue
    # Add instrumentations hooks at the bottom, to ensure they instrument all the
    # methods properly.
    include Instrumentation
    # Params wrapper should come before instrumentation so they are properly showed
    # in logs
    include ParamsWrapper
`}
          />
          <p>
            後から include したモジュールほど、ancestors では前に並びます（<ChapterLink n={3} section="include" />）。最後に include した ParamsWrapper が最も前で、Instrumentation、Rescue、Callbacks の順に続きます。同じ名前のメソッドは ancestors の前から順に呼ばれ、<code>super</code> で次の定義に進むので、process_action は ParamsWrapper、Instrumentation、Rescue、Callbacks の順に通ります。図 2-6 の2番目から5番目がこの順です（1番目の ActiveRecord::Railties::ControllerRuntime は、ActiveRecord が後から足したモジュールです）。
          </p>
          <p>
            Rescue のコメントの「wrap as much as possible」は、できるだけ多くの処理を rescue の対象にするという意味です。Rescue の process_action は Callbacks の process_action より先に呼ばれ、その <code>super</code> の中で before_action のメソッドとアクションが実行されます。そのため、アクションの中の例外だけでなく、before_action のメソッド（「CRUD を保つコントローラーの書き方」の節の set_article が呼ぶ Article.find など）の中で起きた例外も、rescue_from で登録した処理の対象になります。
          </p>
          <p>
            次の図は process_action の連鎖を、外側の process_action が super で1つ内側の process_action を呼ぶ入れ子として描いたものです。太い青の枠が Rescue の process_action の範囲で、before_action のメソッドとアクションはどちらもこの枠の中で実行されます。
          </p>
          <Figure
            title="process_action の入れ子と rescue_from の範囲"
            caption="Rails 8.1.4.1 の base.rb の include の順をもとにした模式図。橙の枠はモジュールの process_action で、枠の中のものは外側の process_action が呼んだ super の中で実行される。図 2-6 にある ControllerRuntime と ActionController::Rendering の定義は省略した。"
          >
            <RescueRangeFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'dispatch',
      title: 'dispatch からアクションの実行まで',
      body: (
        <>
          <p>
            ルーティングの Dispatcher は、コントローラーのクラスメソッド <code>dispatch</code> を呼びます（<ChapterLink n={9} />）。Dispatcher は、ルートに書いた <code>articles#show</code> から ArticlesController というクラスを求めて、処理を渡すオブジェクトです（<ChapterLink n={9} section="dispatch" />）。この節では、その後 show メソッドが呼ばれて応答が返るまでを、metal.rb と abstract_controller/base.rb で読みます。確かめるのはコントローラーのインスタンスがいつ作られるか、アクションの名前の文字列からメソッドがどう呼ばれるか、応答がどの形で返るかの3つです。
          </p>
          <p>
            最初の引用には dispatch が2つあります。上の <code>def self.dispatch</code> がクラスメソッド、下の <code>def dispatch</code> がインスタンスメソッドです。
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
          <ul>
            <li>
              <code>def self.dispatch(name, req, res)</code>：name はアクションの名前（"show"）、req は要求を表すオブジェクト、res は応答を表すオブジェクトです。
            </li>
            <li>
              <code>if middleware_stack.any?</code>：このコントローラーに <code>use</code> で登録したミドルウェアがあるかを調べています。登録していなければ else の側に進みます。
            </li>
            <li>
              <code>new.dispatch(name, req, res)</code>：<code>new</code> でコントローラーのインスタンスを作り、そのインスタンスの dispatch（下のメソッド）を呼びます。
            </li>
            <li>
              <code>set_request!(request)</code> と <code>set_response!(response)</code>：要求と応答のオブジェクトを、インスタンス変数の <code>@_request</code> と <code>@_response</code> に入れます。アクションの中で使う <code>request</code>、<code>response</code>、<code>session</code> は、この2つを読みます。
            </li>
            <li>
              <code>process(name)</code>：アクションを実行します（次の引用で読みます）。
            </li>
            <li>
              <code>request.commit_flash</code>：flash のうち次の要求に渡す内容を確定します。
            </li>
            <li>
              <code>to_a</code>：メソッドの最後の式なので、この値が dispatch の戻り値になります。
            </li>
          </ul>
          <p>
            クラスメソッドは、リクエストごとに <code>new</code> でコントローラーのインスタンスを作ります。インスタンス変数（<code>@article</code>{' '}
            など）がリクエストの間で混ざらないのはこのためです。ある要求の show で代入した <code>@article</code> は、その要求のためのインスタンスが持っていて、次の要求では新しいインスタンスが作られます。コントローラーにも <code>use</code> でミドルウェア（要求と応答の間に処理を挟む部品。<ChapterLink n={6} section="middleware" />）を登録でき、その場合はコントローラー専用のスタックを通ります
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
            上の <code>process</code> は、dispatch が <code>process(name)</code> で呼んだメソッドです。<code>GET /articles/1</code> の場合、action には "show" が入っています。
          </p>
          <ul>
            <li>
              <code>@_action_name = action.to_s</code>：アクションの名前を文字列にして保存します。アクションやビューの中の <code>action_name</code> はこの値を返します。
            </li>
            <li>
              <code>unless action_name = _find_action_name(@_action_name)</code>：<code>=</code> は比較ではなく代入です。_find_action_name の戻り値をローカル変数の action_name に入れ、その値が nil か false なら、次の行の raise を実行します。
            </li>
            <li>
              <code>raise ActionNotFound.new(…)</code>：呼べるアクションが無いときの例外です。メッセージは <code>The action 'destroy' could not be found for ArticlesController</code> のようになります。
            </li>
            <li>
              <code>@_response_body = nil</code>：応答の本文がまだ決まっていない状態にします。render や redirect_to を済ませたかどうかの判定（「描画と応答のオブジェクト」の節の <code>performed?</code>）に使われます。
            </li>
            <li>
              <code>process_action(action_name, ...)</code>：process_action を呼びます。ArticlesController のインスタンスに対して呼ぶので、ancestors で最も前にある定義から始まります。
            </li>
            <li>
              下の <code>def process_action(...)</code> は AbstractController::Base の定義で、ancestors では最も後ろにあります。<code>send_action(...)</code> を呼ぶだけです。
            </li>
          </ul>
          <p>
            <code>_find_action_name</code> は、アクション名が <code>action_methods</code> に含まれるかを確かめます。<code>action_methods</code> は、コントローラーの public メソッドから、最初の抽象クラス（
            <code>abstract!</code> を宣言した ActionController::Base）とそのモジュールの public メソッドを除いたものです。<code>abstract!</code> は、そのクラス自身はアクションを持たないという印を付けるクラスメソッドで、AbstractController::Base、Metal、ActionController::Base が呼んでいます。render や redirect_to は Base とそのモジュールの public メソッドなので、アクションにはなりません。private・protected のメソッドはアクションになりません。一方、ApplicationController
            に書いた public メソッドは、サブクラスのアクションとして扱われます。見つからなければ <code>AbstractController::ActionNotFound</code>（404）です
            <Ref n={2} />。
          </p>
          <Code
            lang="ruby"
            title="アクションになるメソッドと、ならないメソッド"
            code={`
class ApplicationController < ActionController::Base
  def current_author      # public。action_methods に入り、継承したコントローラーのアクションとして扱われる
    @current_author
  end

  private
    def require_login     # private。action_methods に入らない
      # …
    end
end
`}
          />
          <p>
            public のままでも、そのメソッドを指すルートが無ければ要求は届きません。ただしアクションとして扱われる状態なので、同じ名前のルートが足されると、URL から呼べるメソッドになります。Rails ガイドも、アクションにしないメソッドは private か protected にすることを勧めています。レビューでは、コントローラーに足されたアクション以外のメソッドが private の下にあるかを確かめます。
          </p>
          <p>
            ActionNotFound は、ルートはあるのにメソッドが無いときに起きます。たとえば routes.rb に <code>resources :articles</code> と書くと destroy へのルートも作られるので、コントローラーに destroy を書いていない状態で <code>DELETE /articles/1</code> を送ると、上のメッセージの例外になります。
          </p>
          <p>
            <code>process_action</code> は各モジュールが <code>super</code> を呼ぶ形で上書きしており（<ChapterLink n={3} />）、パラメーターの包み直し、計測、例外の捕捉、before_action
            などのコールバックを順に通った後、AbstractController::Base の定義に届きます。「コントローラーのクラス階層」の節で見たモジュールの名前でいうと、ParamsWrapper（パラメーターの包み直し）、Instrumentation（計測）、Rescue（例外の捕捉）、Callbacks（before_action などのコールバック）の順です。その <code>send_action</code> は <code>send</code> の別名なので、最後は <code>send("show")</code>{' '}
            で show メソッドが呼ばれます。
          </p>
          <p>
            図 16-6 はここまでの呼び出しを上から順に並べたものです。上の2つが metal.rb の2つの dispatch、3つ目から5つ目が abstract_controller/base.rb の process、process_action、send_action です。6つ目の default_render は「描画と応答のオブジェクト」の節で読みます。7つ目は dispatch の最後の2行です。
          </p>
          <Figure n="16-6" title="dispatch から応答の配列まで" caption="Rails 8.1.4.1 の metal.rb・abstract_controller/base.rb・basic_implicit_render.rb を読んでまとめた図。process_action の連鎖の詳細は図 2-6 を参照。">
            <DispatchFigure />
          </Figure>
          <p>
            この呼び出しの順は例外のバックトレース（例外が起きた場所までの、メソッドの呼び出しの履歴）に現れます。アクションの中で例外が起きると、バックトレースには app/controllers/articles_controller.rb の行に続いて、actionpack の metal/basic_implicit_render.rb（send_action）、abstract_controller/base.rb（process_action）、abstract_controller/callbacks.rb、metal/rescue.rb、metal/instrumentation.rb、metal/params_wrapper.rb などの行が並びます。図 16-6 を下から上へたどる順です。development のエラー画面では Framework Trace の欄に表示されます。これらはアクションを呼び出した側のメソッドで、誤りのある場所ではありません。原因を探すときは、app/ で始まる行から読みます。
          </p>
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
            1519〜1529 行目）。ActionController::Parameters は、ハッシュと同じように <code>params[:id]</code> で値を読めるクラスで、モデルに渡してよいと許可されたかどうかの状態も持ちます。<code>request.parameters</code> のほうは、要求から読み取った値を入れたハッシュです。
          </p>
          <p>
            パスの <code>:id</code>、クエリ文字列、フォームの本文に同じ名前の値があったとき、params にどれが入るかを、<code>request.parameters</code> を作るコードで確かめます。
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
          <ul>
            <li>
              <code>get_header("action_dispatch.request.parameters")</code>：env（Rack が要求の情報を入れて渡すハッシュ。<ChapterLink n={6} section="rack-contract" />）から、前に作った結果を読みます。あれば次の行の <code>return</code> でそれを返します。
            </li>
            <li>
              <code>request_parameters.merge(query_parameters)</code>：request_parameters は本文から読み取った値、query_parameters はクエリ文字列から読み取った値のハッシュです。
            </li>
            <li>
              <code>rescue EOFError</code>：EOFError は、入力を読んでいる途中でデータが終わったときの Ruby の例外です。本文を最後まで読めなかった場合は、クエリ文字列の値だけを使います。
            </li>
            <li>
              <code>params.merge!(path_parameters)</code>：path_parameters はルーティングがパスから取り出した値（<code>:id</code> など）と、controller と action の名前です。<code>merge!</code> は新しいハッシュを作らず、params 自身を書き換えます。
            </li>
            <li>
              <code>set_header(…, params)</code>：結果を env に保存します。
            </li>
          </ul>
          <p>
            本文のパラメーター（<code>request_parameters</code>）にクエリ文字列のパラメーターを、さらにルーティングのパスパラメーターをマージしています。<code>merge</code>{' '}
            は後のハッシュの値で上書きするので、同じ名前ならパスパラメーターが最も優先されます。結果は env に保存され、2回目からはそれを返します
            <Ref n={3} />。merge の動きだけを素の Ruby で確かめると、次のようになります。
          </p>
          <Code
            lang="ruby"
            title="merge.rb と実行結果（Ruby 4.0.9）"
            code={`
body  = { "title" => "from_body",  "b" => "1" }
query = { "title" => "from_query", "q" => "1" }
path  = { "title" => "from_path" }

params = body.merge(query)
p params   # => {"title" => "from_query", "b" => "1", "q" => "1"}
params.merge!(path)
p params   # => {"title" => "from_path", "b" => "1", "q" => "1"}
`}
          />
          <p>
            1回目の merge で title は query の値になり、2回目の merge! で path の値になりました。片方にしか無い b と q はそのまま残ります。デモのアプリケーションでも、3か所に同じ <code>title</code> を入れて確かめました。
          </p>
          <Code
            lang="text"
            code={`
POST /probe/echo/from_path?title=from_query&q=1   （ルートは post "probe/echo/:title"）
本文: title=from_body&b=1

params => {"title":"from_path","b":"1","q":"1","controller":"probe","action":"echo"}
`}
          />
          <p>
            1行目が送った要求で、パスの <code>:title</code> の位置に from_path、クエリ文字列に <code>title=from_query</code>、本文に <code>title=from_body</code> を入れています。最後の行が、アクションの中で読んだ params です。title はパスの from_path になりました。b は本文だけに、q はクエリ文字列だけにあるので、どちらも入っています。controller と action は、ルーティングが入れたパスパラメーターです（図 16-7）。
          </p>
          <Figure n="16-7" title="params の合成" caption="上の実行結果を図にしたもの。">
            <ParamsFigure />
          </Figure>
          <p>
            この順序があるので、<code>/articles/1?id=2</code> のようにクエリ文字列へ id を足して送っても、<code>params[:id]</code> はパスの "1" のままです。フォームの本文に id を足しても同じです。
          </p>
          <p>
            本文が JSON の場合は、Content-Type に応じて JSON として解析されます。さらに ParamsWrapper が、JSON の値をコントローラー名のキーの下にも複製します。<code>{'{"name":"json"}'}</code>{' '}
            を送ると、params には <code>"name"</code> と並んで <code>{'"probe" => {"name" => "json"}'}</code> が入りました
            <Ref n={4} />。送ったのは ProbeController のアクションなので、キーは probe です。フォームの入力欄の名前は <code>article[title]</code> のように article の下に入る形ですが、JSON を送る側は <code>{'{"title":"…"}'}</code> のようにキーを付けずに送ることがあります。ParamsWrapper が複製するので、どちらの形でもコントローラーの名前のキーの下から読めます。JSON の API で <code>params.expect(article: [...])</code> と書けるのはこのためです。
          </p>
          <p>
            <Term>Strong Parameters</Term> は、許可していないキーがモデルの一括代入（<code>Article.new(hash)</code> など）に渡るのを防ぐ仕組みです。ActionController::Parameters
            は、<code>permit</code> や <code>expect</code> を通すまでは「許可されていない」状態で、そのままモデルに渡すと ActiveModel が{' '}
            <code>ActiveModel::ForbiddenAttributesError</code> を投げます。Rails 8.0 で追加された <code>expect</code> は、必須のキーの確認と許可を1回で行います。「render と redirect_to」の節の実行結果で、expect の戻り値の表示の最後に <code>permitted: true</code> とあったのが、許可された状態を表しています。
          </p>
          <p>
            expect が、書いたキー以外を捨てることと、必須のキーが無いときに例外にすることを、ソースで確かめます。
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
          <p>
            <code>params.expect(article: [:title])</code> を、本文が <code>article[title]=ok&amp;article[admin]=1</code> の要求で呼んだ場合で、1行ずつ追います。
          </p>
          <ul>
            <li>
              <code>def expect(*filters)</code>：<code>*filters</code> は引数を配列にまとめて受け取ります。filters は <code>[{'{article: [:title]}'}]</code> です。
            </li>
            <li>
              <code>params = permit_filters(filters)</code>：空の Parameters を新しく作り、filters に書いたキーの値だけを写して、許可済みにして返します。結果は <code>{'{"article" => {"title" => "ok"}}'}</code> で、admin は写されません。
            </li>
            <li>
              <code>keys = filters.flatten.flat_map {'{ |f| f.is_a?(Hash) ? f.keys : f }'}</code>：filters から、いちばん外側のキーを取り出します。ここでは <code>[:article]</code> です。
            </li>
            <li>
              <code>values = params.require(keys)</code>：require は、キーの値を取り出すメソッドです。値が無いか空なら <code>ActionController::ParameterMissing</code> を発生させます。配列を渡したので、結果も配列で返ります。
            </li>
            <li>
              <code>values.size == 1 ? values.first : values</code>：キーが1つなら、配列から取り出した中身を返します。戻り値は <code>{'{"title" => "ok"}'}</code> を持つ許可済みの Parameters です。
            </li>
          </ul>
          <p>
            本文が <code>other=1</code> の場合は、permit_filters の結果に article が入らないので、require が ParameterMissing を発生させます。この例外は「例外がエラー応答になるまで」の節の表で 400 に対応しています。例外のメッセージは <code>param is missing or the value is empty or invalid: article</code> です。
          </p>
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
          <p>
            1行目のとおり、許可していないキーは例外にならず、捨てられるだけです。フォームに入力欄を足したのに、その値だけが保存されないときは、expect（または permit）のキーに足し忘れていないかを最初に確かめます。3行目は expect も permit も通さずに <code>params[:article]</code> をそのままモデルに渡した場合です。article の値が送られていれば、その中身に関係なく 500 になります。
          </p>
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
            send_action は、「dispatch からアクションの実行まで」の節の最後で、アクションのメソッドを呼んでいたメソッドです。
          </p>
          <ul>
            <li>
              <code>def send_action(method, *args)</code>：method にはアクションの名前（"show"）が入ります。
            </li>
            <li>
              <code>ret = super</code>：上書きする前の send_action（send の別名）を呼びます。ここで show メソッドが実行され、その戻り値が ret に入ります。
            </li>
            <li>
              <code>default_render unless performed?</code>：<code>performed?</code> は、render か redirect_to を済ませたかどうかを返すメソッドです（metal.rb では <code>response_body || response.committed?</code>）。済ませていなければ default_render を呼びます。
            </li>
            <li>
              下の <code>def default_render</code> は BasicImplicitRender の定義で、本文の無い 204 を返します。ImplicitRender にも default_render があり、ancestors では ImplicitRender のほうが前にあるので、Base を継承したコントローラーでは ImplicitRender の定義が呼ばれます。
            </li>
          </ul>
          <p>
            アクションのメソッドから戻った時点で、まだ応答の本文が決まっていなければ（<code>performed?</code> が偽なら）<code>default_render</code> を呼びます。ActionController::Base では
            ImplicitRender の <code>default_render</code> が使われ、アクション名のテンプレートがあれば <code>render</code> します。テンプレートが無い場合は、ブラウザーからの通常の GET（HTML
            を求めるリクエスト）なら <code>ActionController::MissingExactTemplate</code>（406）、それ以外は <code>head :no_content</code>（204）になります（<code>implicit_render.rb</code> の
            37〜54 行目）
            <Ref n={6} />。デモのアプリケーションで、テンプレートの無いアクションに HTML を求めると 406、JSON を求めると 204 が返りました。
          </p>
          <p>
            ImplicitRender の default_render は、上から順に次の4つの条件を調べます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>条件</th>
                  <th>結果</th>
                  <th>例外のメッセージやログ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>要求の形式に合う、アクション名のテンプレートがある</td>
                  <td>そのテンプレートを render する</td>
                  <td>「コントローラーとアクション」の節の Rendering と Rendered の行</td>
                </tr>
                <tr>
                  <td>要求の形式のテンプレートは無いが、同じアクションのほかの形式のテンプレートはある</td>
                  <td>ActionController::UnknownFormat（406）</td>
                  <td>
                    <code>ArticlesController#show is missing a template for this request format and variant.</code>
                  </td>
                </tr>
                <tr>
                  <td>テンプレートが1つも無く、ブラウザーでページを開く要求である（GET で、HTML を求めている。X-Requested-With ヘッダーに XMLHttpRequest と書いて送る JavaScript からの要求は除く）</td>
                  <td>ActionController::MissingExactTemplate（406）</td>
                  <td>
                    <code>ArticlesController#show is missing a template for request formats: text/html</code>
                  </td>
                </tr>
                <tr>
                  <td>テンプレートが1つも無く、上の要求でもない</td>
                  <td>head :no_content（204）</td>
                  <td>
                    <code>No template found for ArticlesController#show, rendering head :no_content</code>（ログ）
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            2行目は show.html.erb しか無いアクションに JSON を求めたときなどに起きます。メッセージの後ろには、要求が求めた形式（request.formats）が付きます。「missing a template」のメッセージを見たら、app/views のコントローラーの名前のディレクトリに、アクションの名前と要求の形式に合うファイルがあるかを確かめます。
          </p>
          <p>
            ImplicitRender は、アクションの名前からメソッドを決める <code>method_for_action</code> も上書きしています。アクションのメソッドが無くても、同じ名前のテンプレートがあれば default_render を呼ぶメソッドとして扱うので、ActionNotFound にならず、テンプレートが描画されます。SessionsController の new のような中身が空のアクションで、メソッドを消しても画面が表示されるのはこのためです。
          </p>
          <p>
            <code>render</code> の結果は <code>response_body=</code> で応答のオブジェクトに入ります。2回 <code>render</code> すると <code>AbstractController::DoubleRenderError</code>{' '}
            です。<code>redirect_to</code> も応答の本文を決めるので、<code>render</code> と <code>redirect_to</code> を両方呼んでも同じ例外になります。<code>head :ok</code>{' '}
            は本文を空にしてステータスだけを決めます。ビューの描画の内部は<ChapterLink n={16} />で扱います。
          </p>
          <p>
            DoubleRenderError は、条件を付けた redirect_to の後に処理を止め忘れたときによく起きます。「render と redirect_to」の節で見たとおり、redirect_to も render も、アクションのコードの実行を止めないためです。
          </p>
          <Code
            lang="ruby"
            title="DoubleRenderError になる書き方と、直した書き方"
            code={`
# 公開していない記事のときも、redirect_to の後で render まで進む
def show
  @article = Article.find(params[:id])
  redirect_to articles_path unless @article.published
  render :show   # 2回目なので AbstractController::DoubleRenderError
end

# redirect_to の後に return でメソッドを終える
def show
  @article = Article.find(params[:id])
  unless @article.published
    redirect_to articles_path
    return
  end
  render :show
end
`}
          />
          <p>
            例外のメッセージは <code>Render and/or redirect were called multiple times in this action.</code> で始まり、redirect_to の後に return を書くようにという説明が続きます。before_action のメソッドが redirect_to して終わった場合は、Rails がアクションを呼ばないので、アクションの中の render と重なってこの例外になることはありません（「before_action でアクションの前に処理を入れる」の節）。
          </p>
          <p>
            応答のオブジェクト <code>ActionDispatch::Response</code> は、ステータス、ヘッダー（Rack 3 では <code>Rack::Headers</code>。<ChapterLink n={6} section="rack3" />）、本文を持ちます。<code>dispatch</code> の最後の{' '}
            <code>to_a</code> がこれを Rack の配列にし、ミドルウェアを逆にたどって Puma に返ります（<ChapterLink n={6} />）。
          </p>
        </>
      ),
    },
    {
      id: 'response-formats',
      title: "HTML と JSON をリクエストで切り替える",
      body: (
        <>
          <p>
            同じ記事を、ブラウザーには HTML で、JavaScript やほかのプログラムには JSON で返したいことがあります。<code>respond_to</code> は同じ操作に対する応答形式を選びます。Rails はルートの拡張子（<code>/articles/42.json</code>）や要求の <code>Accept</code> ヘッダーなどから形式を決めます。<code>Content-Type</code> は要求本文をどう読み取るかを表すヘッダーで、応答としてほしい形式を伝える <code>Accept</code> と役割が異なります。<Ref n={17} />
          </p>
          <Code
            lang="ruby"
            title={"ArticlesController の show の例"}
            code={`
def show
  @article = Article.find(params[:id])

  respond_to do |format|
    format.html
    format.json { render json: @article.as_json(only: %i[id title]) }
  end
end
`}
          />
          <ul>
            <li>
              <code>respond_to do |format| … end</code>：ブロックの中に、このアクションが返せる形式を並べます。Rails は要求が求めた形式に合う行だけを実行します。
            </li>
            <li>
              <code>format.html</code>：ブロックを付けていないので、HTML を求められたときは render を書かない場合と同じ動きになり、show.html.erb が描画されます。
            </li>
            <li>
              <code>format.json {'{ render json: … }'}</code>：JSON を求められたときは、このブロックを実行します。<code>render json:</code> は、渡した値を JSON の文字列にして本文に入れます。
            </li>
            <li>
              <code>@article.as_json(only: %i[id title])</code>：記事の属性のうち id と title だけを持つハッシュを作ります。<code>%i[id title]</code> は <code>[:id, :title]</code> と同じです。
            </li>
          </ul>
          <p>
            HTML のときは既定のテンプレートを描画し、JSON では返す属性を絞っています。<code>render json: @article</code> と書くと、記事のすべての列が JSON に入るので、外に出してよい属性だけを only で指定しています。JSON を求めるには、<code>/articles/1.json</code> のように拡張子を付けるか、<code>curl -H "Accept: application/json"</code> のように Accept ヘッダーを付けて送ります。
          </p>
          <p>
            どの形式でもアクセス条件を先に確認します。ログインの確認のような、その要求を受け付けてよいかの確認は、format.html や format.json のブロックの中に形式ごとに書かず、before_action や respond_to より前の行に置きます。片方の形式にだけ確認を書き忘れることを防げます。
          </p>
          <p>
            要求に合う形式をアクションが提供しないときは <code>ActionController::UnknownFormat</code> になり、既定の例外処理では 406 が返ります。上の show に <code>/articles/1.xml</code> を送った場合がこれにあたります。<Ref n={17} /><Ref n={19} />
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
            production で利用者に 404 や 500 のページが表示されたとき、そのページを誰が、どのステータスコードで返したのかを、この節で追います。アクションの中で起きた例外は、まず <code>process_action</code> の連鎖にある ActionController::Rescue で捕捉されます。rescue_from で登録した処理がどこで呼ばれ、登録が無い例外がどうなるかを、次のコードで確かめます。
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
          <ul>
            <li>
              <code>def process_action(*)</code>：process_action の連鎖の1つです。<code>(*)</code> は引数を名前を付けずに受け取る書き方で、<code>super</code> にそのまま渡ります。
            </li>
            <li>
              <code>super</code>：連鎖の次の定義を呼びます。この先で before_action のメソッドとアクションが実行されます。
            </li>
            <li>
              <code>rescue Exception =&gt; exception</code>：def の中に begin を書かずに rescue を書くと、メソッド全体が対象になります。Exception は Ruby のすべての例外の親クラスなので、<code>super</code> の中で起きたどの例外もここに来ます。
            </li>
            <li>
              <code>request.env["action_dispatch.show_detailed_exceptions"] ||= show_detailed_exceptions?</code>：詳しいエラーページを出すかどうかの値を env に入れます。<code>||=</code> は左の値が nil か false のときだけ代入します。
            </li>
            <li>
              <code>rescue_with_handler(exception) || raise</code>：rescue_with_handler が真の値を返せば、<code>||</code> の右は実行されず、例外はここで終わります。nil を返したときだけ、右の <code>raise</code> が実行されます。引数の無い raise は、いま rescue している例外をもう一度発生させます。
            </li>
          </ul>
          <p>
            <code>rescue_with_handler</code> は ActiveSupport::Rescuable のメソッドで、<code>rescue_from</code> で登録した例外処理用のメソッドやブロック（ハンドラ）を探して呼びます。見つからなければ <code>raise</code>{' '}
            で例外を投げ直します
            <Ref n={7} />。最後の行の動きを、ハンドラの登録を1つだけにした素の Ruby で確かめます。
          </p>
          <Code
            lang="ruby"
            title="handler_or_raise.rb と実行結果（Ruby 4.0.9）"
            code={`
def handle(exception)                  # KeyError だけを処理するハンドラ
  return nil unless exception.is_a?(KeyError)
  puts "ハンドラが処理した: #{exception.class}"
  true
end

def process_action
  yield                                # アクションにあたる処理
rescue Exception => exception
  handle(exception) || raise
end

process_action { raise KeyError, "登録あり" }

begin
  process_action { raise ArgumentError, "登録なし" }
rescue => e
  puts "外側に届いた: #{e.class}: #{e.message}"
end
# ハンドラが処理した: KeyError
# 外側に届いた: ArgumentError: 登録なし
`}
          />
          <p>
            KeyError は handle が処理して true を返したので、process_action の外には出ませんでした。ArgumentError は handle が nil を返したので raise で発生し直し、外側の rescue に届きました。Rails では、この外側にあたるのがミドルウェアです。
          </p>
          <p>
            投げ直された例外はコントローラーの外に出て、ミドルウェアをさかのぼります。ミドルウェアは外側のものが内側のものの call を呼ぶ形で重なっているので（<ChapterLink n={6} section="middleware" />）、コントローラーから出た例外は、内側のミドルウェアの call から外側のミドルウェアの call へ順に伝わります。<ChapterLink n={6} />のスタックでは、DebugExceptions がログに出力し、<code>config.consider_all_requests_local</code> が true（development
            の既定）なら詳細なエラーページを返します。そうでなければ外側の ShowExceptions に届きます。ShowExceptions の call が、production のエラーページを返す場所です。
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
            上の call がミドルウェアとして呼ばれるメソッド、下の render_exception が call から呼ばれるメソッドです。<code>GET /articles/999999</code> で ActiveRecord::RecordNotFound が起きた場合で読みます。
          </p>
          <ul>
            <li>
              <code>@app.call(env)</code>：@app は1つ内側のミドルウェアです。この呼び出しの中で、残りのミドルウェア、ルーティング、コントローラーが実行されます。例外が起きなければ、その応答がそのまま call の戻り値になります。
            </li>
            <li>
              <code>rescue Exception =&gt; exception</code>：内側のどこでも rescue されなかった例外が、ここに届きます。
            </li>
            <li>
              <code>wrapper = ExceptionWrapper.new(backtrace_cleaner, exception)</code>：例外を ExceptionWrapper のオブジェクトで包みます。wrapper の status_code を呼ぶと、この例外に対応するステータスコードが返ります。
            </li>
            <li>
              <code>request.set_header "action_dispatch.exception", …</code>：例外を env に入れます。後で呼ばれる exceptions_app は、ここから例外を読めます。
            </li>
            <li>
              <code>if wrapper.show?(request)</code>：例外をエラー応答にするかどうかを、<code>config.action_dispatch.show_exceptions</code> の設定で決めます（この節の最後の補足）。しない場合は <code>raise exception</code> で外側へ投げ直します。
            </li>
            <li>
              <code>status = wrapper.status_code</code>：ステータスコードを求めます。RecordNotFound なら 404 です。
            </li>
            <li>
              <code>request.path_info = "/#{'{status}'}"</code> と <code>request.request_method = "GET"</code>：要求のパスを <code>/404</code> に、メソッドを GET に書き換えます。元のパスとメソッドは、その前の2行で env に残しています。
            </li>
            <li>
              <code>response = @exceptions_app.call(request.env)</code>：書き換えた要求で exceptions_app を呼びます。exceptions_app は、<code>GET /404</code> を受け取ったアプリケーションとして応答を作ります。
            </li>
            <li>
              最後の行：exceptions_app が X-Cascade ヘッダーに pass と書いた応答を返したときは、本文が空でそのステータスコードの応答を返します。それ以外は、exceptions_app の応答をそのまま返します。
            </li>
          </ul>
          <p>
            ExceptionWrapper は、例外のクラス名から <code>rescue_responses</code> の表でステータスを決めます。表に無い例外は 500 です。ActiveRecord の Railtie（gem が Rails の起動時の設定を登録するためのクラス。<ChapterLink n={7} section="railtie" />）は{' '}
            <code>ActiveRecord::RecordNotFound</code> を 404 として追加しています
            <Ref n={8} />。ShowExceptions は、パスを <code>/404</code> のように書き換えて <code>exceptions_app</code> を呼びます。既定の <code>exceptions_app</code> は PublicExceptions
            で、<code>public/404.html</code> のようなファイルを返します
            <Ref n={9} />。<code>config.exceptions_app = routes</code> とすると、エラーページを通常のルートとコントローラーで作れます。パスが <code>/404</code> に書き換わっているので、routes.rb に <code>/404</code> や <code>/500</code> のルートを書けば、そのアクションがエラーページを作ります。
          </p>
          <p>
            図 16-8 は例外が通る順を上から下へ並べたものです。左の列を上から順に見ます。Rescue と DebugExceptions の箱から右へ出る矢印は、その段階で応答が決まる場合です。右下の枠は ShowExceptions がステータスコードを決めるときに使う rescue_responses の一部です。
          </p>
          <Figure n="16-8" title="例外の行き先" caption="Rails 8.1.4.1 の rescue.rb・debug_exceptions.rb・show_exceptions.rb・exception_wrapper.rb を読んでまとめた図。">
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
          <p>
            1行目と2行目は同じ RecordNotFound ですが、応答を作った場所が違います。1行目は rescue_from の登録が無いので、例外が ShowExceptions まで届き、public/404.html が返りました。2行目は Rescue の process_action の中でハンドラが応答を作ったので、例外はミドルウェアまで届いていません。4行目と5行目は rescue_responses の表に無い例外なので 500 です。
          </p>
          <p>
            production の画面には public の HTML が出るだけで、例外の内容は表示されません。利用者から「エラーの画面が出た」と報告されたときは、ログからその要求を探し、DebugExceptions が出力した例外のクラス名とメッセージを読みます。クラス名が分かれば、この表と rescue_responses から、404 のように利用者の操作で起きる応答なのか、500 のようにコードの修正が必要な誤りなのかを区別できます。
          </p>
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
            セッションのほかに、コントローラーの <code>cookies</code> で、Cookie を1つずつ読み書きすることもできます。表示の設定のような、ログインとは関係の無い小さな値を覚えるときに使います。
          </p>
          <Code
            lang="ruby"
            title="アクションの中での cookies の使い方"
            code={`
cookies[:theme] = "dark"                # 値をそのまま入れる。利用者はブラウザーで読めて、書き換えられる
cookies.signed[:visitor_id] = 42        # 署名を付ける。読めるが、書き換えると Rails が検出する
cookies.encrypted[:note] = "secret"     # 暗号化する。読めず、書き換えも Rails が検出する

cookies[:theme]                         # 同じブラウザーからの次の要求でも "dark" を読める
cookies.delete(:theme)                  # ブラウザーに Cookie を消させる
`}
          />
          <p>
            <code>cookies[:theme] = …</code> と書いた値が、いつ応答の set-cookie ヘッダーになるかを見ます。
            Cookie の読み書きは、ミドルウェアの ActionDispatch::Cookies と、リクエストに付く cookie jar が分担します。cookie jar は1つの要求で読み書きする Cookie をまとめて持つオブジェクトです。コントローラーの <code>cookies</code>{' '}
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
          <ul>
            <li>
              <code>response = @app.call(env)</code>：先に内側のミドルウェアとコントローラーを実行し、応答を受け取ります。アクションの中の <code>cookies[:theme] = "dark"</code> は、この呼び出しの中で実行されます。
            </li>
            <li>
              <code>if request.have_cookie_jar?</code>：この要求の処理の中で cookie jar が作られたかを調べます。作られていなければ、応答をそのまま返します。
            </li>
            <li>
              <code>unless cookie_jar.committed?</code>：jar の内容をまだ書き出していないことを確かめます。
            </li>
            <li>
              <code>response = Rack::Response[*response]</code>：内側から返った <code>[status, headers, body]</code> の配列を、ヘッダーを足しやすい Rack::Response のオブジェクトに変えます。<code>*response</code> は、配列の3つの要素を3つの引数として渡す書き方です。
            </li>
            <li>
              <code>cookie_jar.write(response)</code>：jar に記録された書き込みと削除を、応答の set-cookie ヘッダーに書きます。
            </li>
            <li>
              <code>response.to_a</code>：応答を配列に戻して、外側のミドルウェアに返します。
            </li>
          </ul>
          <p>
            <code>cookies.signed</code> は値に署名を付けて改ざんを検出し、<code>cookies.encrypted</code> はさらに暗号化して中身を読めなくします。鍵は <code>secret_key_base</code>{' '}
            から用途ごとのソルトで導出され、暗号化の既定は AES-256-GCM です
            <Ref n={10} />。<code>secret_key_base</code> が変わると、既存の Cookie はすべて読めなくなります。セッションの Cookie も読めなくなるので、ログインしていた利用者は全員、ログインしていない状態に戻ります。Rails ガイドも、CookieStore を使っているときに secret_key_base を変えると、既存のセッションがすべて無効になると説明しています。本番の secret_key_base を作り直す作業は、この影響を確かめてから進めます。
          </p>
          <p>
            セッションの既定の保存先 <code>ActionDispatch::Session::CookieStore</code> は、セッションの中身全体を <code>cookies.signed_or_encrypted</code>（新しいアプリケーションでは暗号化される jar）に保存します（
            <code>session/cookie_store.rb</code> の 121〜122 行目）。サーバー側には何も保存しないので、Puma のプロセスやサーバーが複数あっても、どのプロセスでも同じセッションを読めます。本番では、Rails を動かすプログラム（プロセス）を複数起動しておき、要求ごとにそのうちの1つが処理する構成がよく使われます（<ChapterLink n={23} section="cluster" />）。セッションをプロセスのメモリーに持つ方式では、ログインを処理したプロセスと次の要求を処理するプロセスが違うと、セッションを読めません。Cookie に入れる方式では、どのプロセスも同じ secret_key_base で復号するので、この問題が起きません。
          </p>
          <p>
            次の図はログインの要求1をプロセス A が、次の要求2をプロセス B が処理した場合を、2つの方式で比べたものです。左がセッションをプロセスのメモリーに持つ方式、右が Cookie に入れる方式です。
          </p>
          <Figure
            title="セッションをメモリーに持つ方式と Cookie に入れる方式"
            caption="本文の説明をもとにした模式図。左の方式の応答と、右の方式で要求2に返る応答は省略した。"
          >
            <SessionStoreFigure />
          </Figure>
          <p>
            デモのアプリケーションで{' '}
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
            <Ref n={11} />。デモのアプリケーションでセッションに 5000 文字を入れると、暗号化と符号化の後で 9137 バイトになり、この例外で 500 になりました。符号化は暗号化した結果を、Cookie の値に使える文字だけの文字列に直すことです。暗号化と符号化で元の値より大きくなるので、入れた値が 4096 バイトより小さくても上限を超えることがあります。flash は、セッションの中の{' '}
            <code>"flash"</code> というキーに保存され、<code>dispatch</code> の <code>request.commit_flash</code> で次のリクエストに渡す内容が確定します。
          </p>
          <p>
            セッションに入れるのは、<code>session[:author_id] = author.id</code> のような id や短い文字列にします。<code>session[:author] = author</code> のようにモデルのオブジェクトを入れたり、検索結果の配列や長い文章を入れたりすると、この上限に近づきます。flash もセッションの中に入るので、flash に長いメッセージを入れた場合も同じです。CookieOverflow のログを見たら、その要求でセッションと flash に何を入れたかを確かめます。
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
    { title: 'Layouts and Rendering in Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/layouts_and_rendering.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'render と redirect_to の違い、redirect_to の既定のステータスコードが 302 であること、redirect_to の後のコードも実行されること。' },
    { title: 'actionpack/lib/abstract_controller/rendering.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/abstract_controller/rendering.rb`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'view_assigns がコントローラーのインスタンス変数を集めてビューに渡すこと（62〜68行目）。' },
    { title: 'Using HTTP cookies', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies', accessed: '2026-11-16', note: 'HTTP は状態を持たないこと、Set-Cookie で渡した Cookie をブラウザーが Cookie ヘッダーで送り返すこと。' },
    { title: 'Redirections in HTTP', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections', accessed: '2026-11-16', note: '302 は GET 以外のメソッドを GET に変えるかどうかが決まっておらず、303 は GET に変えること。POST の後に 303 で移すと、再読み込みで操作が繰り返されないこと。' },
    { title: 'Securing Rails Applications（Session Fixation - Countermeasures）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/security.html#session-fixation-countermeasures', accessed: '2026-11-16', version: 'Rails 8.1', note: 'ログインに成功したら reset_session で新しいセッションにすること。' },
    { title: "Action Controller Overview", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/action_controller_overview.html", accessed: "2026-11-20", version: "Rails 8.1", note: "パラメーター、フィルター、共通の例外処理。" },
    { title: "ActionController::Redirecting", publisher: "Rails API", url: "https://api.rubyonrails.org/v8.1.0/classes/ActionController/Redirecting.html", accessed: "2026-11-20", version: "Rails 8.1", note: "リダイレクトの HTTP ステータスと url_from。" },
    { title: "Layouts and Rendering in Rails", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/layouts_and_rendering.html", accessed: "2026-11-20", version: "Rails 8.1", note: "render、リダイレクト、描画形式、レイアウト。" },
    { title: "ActionDispatch::Flash::FlashHash", publisher: "Rails API", url: "https://api.rubyonrails.org/v8.1.0/classes/ActionDispatch/Flash/FlashHash.html", accessed: "2026-11-20", version: "Rails 8.1", note: "flash.now と flash.keep の適用範囲。" },
  ],
}

export default withExplanations(ch10, explanation10)
