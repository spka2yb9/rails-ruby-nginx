import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 10-1 コントローラーのクラス階層 ---------- */
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
      id="10-1"
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

/* ---------- 図 10-2 dispatch から応答の配列まで ---------- */
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
      id="10-2"
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

/* ---------- 図 10-3 params の合成 ---------- */
function ParamsFigure() {
  return (
    <Svg
      id="10-3"
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

/* ---------- 図 10-4 例外の行き先 ---------- */
function ExceptionFigure() {
  return (
    <Svg
      id="10-4"
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
    'ルーティングから呼ばれたコントローラーが、インスタンスを作ってアクションを実行し、Rack の応答の配列を返すまでを追います。params の合成と Strong Parameters、暗黙の描画、例外がエラーページになるまでの経路、Cookie とセッションの保存方法も扱います。',
  goals: [
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
          <Figure n="10-1" title="コントローラーのクラス階層" caption="Rails 8.1.4.1 の ActionController::Base::MODULES の36個を、本書で役割ごとにまとめた図。">
            <HierarchyFigure />
          </Figure>
          <p>
            祖先に並ぶ72個のクラスとモジュールの大半は、これらのモジュールです。<ChapterLink n={1} />の図 1-3 で見た <code>process_action</code> の7つの定義は、このうち ParamsWrapper、Instrumentation、Rescue、Callbacks
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
          <Figure n="10-2" title="dispatch から応答の配列まで" caption="Rails 8.1.4.1 の metal.rb・abstract_controller/base.rb・basic_implicit_render.rb を読んでまとめた図。process_action の連鎖の詳細は図 1-3 を参照。">
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
          <Figure n="10-3" title="params の合成" caption="上の実行結果を図にしたもの。">
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
          <Figure n="10-4" title="例外の行き先" caption="Rails 8.1.4.1 の rescue.rb・debug_exceptions.rb・show_exceptions.rb・exception_wrapper.rb を読んでまとめた図。">
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
            Cookie の値は410バイトでした。<code>secure</code> は <code>config.force_ssl</code> が有効なため、ミドルウェアを組み立てるときにセッションのオプションへ追加されたものです（default_middleware_stack.rb の 76〜81 行目）。development では <code>secure</code> が付きませんでした。
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
  ],
}

export default ch10
