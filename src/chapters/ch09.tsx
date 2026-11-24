import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation09 } from '../explanations/request'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 9-1 要求からアクションを選ぶ ---------- */
function RoutingRoleFigure() {
  const rows = [
    { req: 'GET /articles/1?preview=true', rule: ['GET /articles/:id', '→ articles#show'], res: ['ArticlesController#show', 'params: id "1"、preview "true"'], fill: 'box5' as const },
    { req: 'GET /articles', rule: ['GET /articles', '→ articles#index'], res: ['ArticlesController#index'], fill: 'box' as const },
    { req: 'DELETE /articles/1', rule: ['合うルートが無い'], res: ['404 Not Found', 'No route matches'], fill: 'bg' as const },
  ]
  return (
    <Svg
      id="9-1"
      w={780}
      h={300}
      label="ルーティングは、要求のメソッドとパスを routes.rb から作ったルートと照らし合わせる。GET /articles/1?preview=true は GET /articles/:id のルートに合い、ArticlesController の show が呼ばれる。params にはパスの id の 1 とクエリ文字列の preview の true が入る。GET /articles は GET /articles のルートに合い、index が呼ばれる。DELETE /articles/1 はパスが同じでも DELETE のルートが無いので、どのアクションも呼ばれず 404 になる"
    >
      <T x={20} y={20} bold fs={12.5}>
        要求（メソッドとパス）
      </T>
      <T x={290} y={20} bold fs={12.5}>
        ルート（routes.rb）
      </T>
      <T x={560} y={20} bold fs={12.5}>
        呼ばれるアクション
      </T>
      {rows.map((r, i) => {
        const y = 40 + i * 80
        return (
          <g key={r.req}>
            <Box x={20} y={y} w={230} h={52} lines={r.req} mono fs={11.5} fill="box4" />
            <Arrow x1={250} y1={y + 26} x2={288} y2={y + 26} />
            <Box x={290} y={y} w={230} h={52} lines={r.rule} mono={i < 2} fs={11.5} fill={i < 2 ? 'box' : 'bg'} dashed={i === 2} />
            <Arrow x1={520} y1={y + 26} x2={558} y2={y + 26} />
            <Box x={560} y={y} w={200} h={52} lines={r.res} fs={11} fill={r.fill} subTone="muted" dashed={i === 2} />
          </g>
        )
      })}
      <T x={20} y={284} fs={11} tone="muted">
        メソッドとパスの両方を見る。パスが同じでも、DELETE のルートが無ければ 404 になる
      </T>
    </Svg>
  )
}

/* ---------- 図 9-2 resources が作る7つのアクション ---------- */
function ResourcesFigure() {
  const top = [
    { x: 20, l: ['index', 'GET /articles', '一覧を表示'] },
    { x: 210, l: ['show', 'GET /articles/:id', '1件を表示'] },
    { x: 400, l: ['new', 'GET /articles/new', '作成のフォーム'] },
    { x: 590, l: ['edit', 'GET /articles/:id/edit', '編集のフォーム'] },
  ]
  const bottom = [
    { x: 210, l: ['destroy', 'DELETE /articles/:id', '削除する'], via: '削除のボタン' },
    { x: 400, l: ['create', 'POST /articles', '作成して保存する'], via: 'フォームを送信' },
    { x: 590, l: ['update', 'PATCH・PUT /articles/:id', '更新して保存する'], via: 'フォームを送信' },
  ]
  return (
    <Svg
      id="9-2"
      w={780}
      h={290}
      label="resources :articles が作る7つのアクション。上の段の index、show、new、edit は GET の要求に画面を返す。下の段の create、update、destroy は POST、PATCH または PUT、DELETE の要求でデータを変える。new のフォームを送信すると create に、edit のフォームを送信すると update に、show の画面の削除のボタンから destroy に要求が届く"
    >
      <T x={20} y={20} bold fs={12.5}>
        画面を返す（GET）
      </T>
      {top.map((b) => (
        <Box key={b.l[0]} x={b.x} y={34} w={175} h={66} lines={b.l} fs={11.5} bold fill="box" subTone="muted" />
      ))}
      <T x={20} y={150} bold fs={12.5}>
        データを変える
      </T>
      <T x={20} y={170} fs={11.5} tone="muted">
        （POST・PATCH・DELETE）
      </T>
      {bottom.map((b) => (
        <g key={b.l[0]}>
          <Arrow x1={b.x + 88} y1={100} x2={b.x + 88} y2={176} />
          <T x={b.x + 96} y={138} fs={10.5} tone="muted">
            {b.via}
          </T>
          <Box x={b.x} y={178} w={175} h={66} lines={b.l} fs={11.5} bold fill="box5" subTone="muted" />
        </g>
      ))}
      <T x={20} y={272} fs={11} tone="muted">
        new と edit はフォームを表示するだけで、保存は create と update が受け持つ。フォームの表示と送信は別々の要求になる
      </T>
    </Svg>
  )
}

/* ---------- 図 9-3 routes.rb の1行から Journey::Route まで ---------- */
function DefineFigure() {
  return (
    <Svg
      id="9-3"
      w={760}
      h={330}
      label="routes.rb の resources :articles, only: [:index, :show] は、Mapper を self として実行され、collection の get :index と member の get :show に展開される。それぞれ Mapper#add_route がパスを Journey::Parser で構文木にし、Mapping.build で Mapping を作り、RouteSet#add_route に渡す。RouteSet は Journey::Routes#add_route で Journey::Route を作って配列に追加し、名前が付いていれば named_routes に登録する。Journey::Route は名前、パターン、HTTP メソッドなどの条件、defaults、precedence、app を持つ"
    >
      <Box x={20} y={20} w={300} h={40} lines='resources :articles, only: [:index, :show]' mono fs={11.5} fill="box4" />
      <Arrow x1={170} y1={60} x2={170} y2={80} />
      <Box x={20} y={82} w={300} h={44} lines={['Mapper（routes.rb のブロックの self）', 'get :index ／ get :show に展開']} fs={12} subTone="muted" />
      <Arrow x1={170} y1={126} x2={170} y2={146} />
      <Box x={20} y={148} w={300} h={44} lines={['Mapper#add_route', 'Journey::Parser.parse → Mapping.build']} fs={12} subTone="muted" />
      <Arrow x1={170} y1={192} x2={170} y2={212} />
      <Box x={20} y={214} w={300} h={44} lines={['RouteSet#add_route', 'Journey::Routes#add_route']} fs={12} subTone="muted" />
      <Arrow x1={170} y1={258} x2={170} y2={278} />
      <Box x={20} y={280} w={300} h={36} lines="Journey::Route を配列に追加" fs={12} fill="box5" />

      <Box x={400} y={124} w={340} h={198} fill="bg" lines={[]} />
      <T x={414} y={142} bold fs={12.5}>
        Journey::Route（article の例）
      </T>
      {[
        ['name', '"article"'],
        ['path', '/articles/:id(.:format)'],
        ['verb', 'GET'],
        ['defaults', 'controller: "articles",'],
        ['', '  action: "show"'],
        ['precedence', '登録順の番号'],
        ['app', 'RouteSet::Dispatcher'],
      ].map(([k, v], i) => (
        <g key={k + v}>
          <T x={414} y={166 + i * 22} mono fs={11.5} tone="muted">
            {k}
          </T>
          <T x={500} y={166 + i * 22} mono={k !== 'precedence'} fs={11.5}>
            {v}
          </T>
        </g>
      ))}
      <Arrow x1={320} y1={298} x2={398} y2={260} dashed />

      <Box x={400} y={20} w={340} h={86} fill="bg" lines={[]} />
      <T x={414} y={40} bold fs={12.5}>
        名前があれば named_routes にも登録
      </T>
      <T x={414} y={64} mono fs={11.5}>
        article_path / article_url
      </T>
      <T x={414} y={86} fs={11.5} tone="muted">
        ヘルパーメソッドを定義（URL の生成に使う）
      </T>
      <Arrow x1={322} y1={236} x2={398} y2={80} dashed />
    </Svg>
  )
}

/* ---------- 図 9-4 リクエストの認識 ---------- */
function RecognizeFigure() {
  const steps: { t: string[]; fill?: 'box' | 'box4' | 'box5' | 'bg' }[] = [
    { t: ['RouteSet#call(env)', 'Request を作り、パスを正規化'], fill: 'box' },
    { t: ['候補の絞り込み（filter_routes）', '全ルートのパターンをまとめた状態遷移表で照合'], fill: 'box' },
    { t: ['条件の確認（matches?）', 'HTTP メソッド、constraints'], fill: 'box' },
    { t: ['precedence（登録順）で並べる'], fill: 'box' },
    { t: ['パスから :id などを取り出し', 'path_parameters に設定'], fill: 'box' },
    { t: ['route.app.serve(req)', 'Dispatcher → コントローラー'], fill: 'box5' },
  ]
  return (
    <Svg
      id="9-4"
      w={760}
      h={430}
      label="RouteSet の call は Request を作ってパスを正規化し、Journey::Router の serve を呼ぶ。serve は、全ルートのパターンをまとめた状態遷移表でパスに合う候補を絞り込み、HTTP メソッドや constraints を確認し、登録順で並べ、パスから :id などの値を取り出して path_parameters に設定し、ルートの app の serve を呼ぶ。応答の x-cascade ヘッダーが pass なら次の候補を試し、候補が無くなれば 404 を返す"
    >
      {steps.map((s, i) => {
        const y = 14 + i * 64
        return (
          <g key={i}>
            <Box x={20} y={y} w={360} h={48} lines={s.t} fs={12} fill={s.fill} subTone="muted" />
            {i < steps.length - 1 && <Arrow x1={200} y1={y + 48} x2={200} y2={y + 62} />}
          </g>
        )
      })}
      <Arrow d="M380,358 C440,358 440,294 384,294" dashed />
      <T x={450} y={318} fs={11.5} tone="muted">
        x-cascade: pass なら
      </T>
      <T x={450} y={336} fs={11.5} tone="muted">
        次の候補へ
      </T>
      <Box x={20} y={398} w={360} h={26} lines="候補が無くなれば 404（x-cascade: pass）" fs={11.5} fill="bg" />
      <Arrow x1={200} y1={386} x2={200} y2={396} />

      <Box x={520} y={78} w={220} h={120} fill="bg" lines={[]} />
      <T x={532} y={96} fs={12} bold>
        /articles/1 の候補
      </T>
      <T x={532} y={120} fs={11.5} mono>
        21ルート → article (GET)
      </T>
      <T x={532} y={146} fs={12} bold>
        /articles の候補
      </T>
      <T x={532} y={170} fs={11.5} mono>
        21ルート → articles (GET)
      </T>
      <T x={532} y={190} fs={11} tone="muted">
        デモのアプリでの実測
      </T>
      <Arrow x1={518} y1={110} x2={382} y2={102} dashed />
    </Svg>
  )
}

/* ---------- 図 9-5 名前付きルートとヘルパーメソッド ---------- */
function HelperFigure() {
  return (
    <Svg
      id="9-5"
      w={740}
      h={260}
      label="名前付きルート article を登録すると、NamedRouteCollection が path 用のモジュールに article_path を、url 用のモジュールに article_url を define_method で定義する。これらのモジュールは routes.url_helpers のモジュールに含まれ、コントローラーやビューに include される。article_path(1) を呼ぶと、ルートのパターンに 1 を当てはめて /articles/1 を返す"
    >
      <Box x={20} y={30} w={200} h={44} lines={['named_routes', '[:article] = Journey::Route']} mono fs={11.5} />
      <Arrow x1={220} y1={52} x2={278} y2={52} />
      <T x={250} y={40} fs={11} tone="muted" anchor="middle">
        add
      </T>
      <Box x={280} y={14} w={220} h={36} lines="path_helpers_module" mono fs={12} fill="box2" />
      <Box x={280} y={58} w={220} h={36} lines="url_helpers_module" mono fs={12} fill="box2" />
      <T x={512} y={32} mono fs={11.5}>
        def article_path(*args)
      </T>
      <T x={512} y={76} mono fs={11.5}>
        def article_url(*args)
      </T>
      <Arrow x1={390} y1={94} x2={390} y2={128} dashed />
      <Box x={260} y={130} w={260} h={40} lines="routes.url_helpers（モジュール）" mono fs={12} fill="box2" />
      <Arrow x1={330} y1={170} x2={200} y2={208} dashed />
      <Arrow x1={450} y1={170} x2={560} y2={208} dashed />
      <Box x={80} y={210} w={220} h={36} lines="コントローラー" fs={12} />
      <Box x={460} y={210} w={220} h={36} lines="ビュー（ヘルパー）" fs={12} />
      <T x={20} y={124} fs={11.5} tone="muted">
        article_path(1)
      </T>
      <T x={20} y={144} fs={11.5} tone="muted">
        {'=> "/articles/1"'}
      </T>
      <T x={560} y={150} fs={11} tone="muted">
        破線：include
      </T>
    </Svg>
  )
}

/* ---------- 図 9-6 mount による SCRIPT_NAME と PATH_INFO の分割 ---------- */
function MountFigure() {
  return (
    <Svg
      id="9-6"
      w={720}
      h={200}
      label="mount で /status にマウントした Rack アプリに /status/db/ping のリクエストが来ると、ルーティングはパスのうちマウント位置の /status を SCRIPT_NAME に移し、残りの /db/ping を PATH_INFO にしてアプリを呼ぶ。アプリから戻ると、SCRIPT_NAME と PATH_INFO は元の値に戻される"
    >
      <T x={20} y={24} fs={12} tone="muted">
        リクエストのパス
      </T>
      <Box x={20} y={36} w={300} h={36} lines="/status/db/ping" mono fs={13} fill="box4" />
      <Arrow x1={170} y1={72} x2={170} y2={110} />
      <T x={178} y={92} fs={11.5} tone="muted">
        mount ..., at: "/status"
      </T>
      <Box x={20} y={112} w={140} h={36} lines="/status" mono fs={13} fill="box5" />
      <Box x={170} y={112} w={150} h={36} lines="/db/ping" mono fs={13} fill="box" />
      <T x={90} y={166} anchor="middle" mono fs={12}>
        SCRIPT_NAME
      </T>
      <T x={245} y={166} anchor="middle" mono fs={12}>
        PATH_INFO
      </T>
      <Arrow x1={322} y1={130} x2={420} y2={130} />
      <Box x={422} y={100} w={280} h={62} lines={['マウントした Rack アプリ', '自分がルートに置かれたように', 'PATH_INFO だけを見ればよい']} fs={12} subTone="muted" />
      <T x={422} y={186} fs={11.5} tone="muted">
        戻った後、SCRIPT_NAME と PATH_INFO は元に戻る
      </T>
    </Svg>
  )
}

/* ---------- ルーティングの各オブジェクトが変数で指す先 ---------- */
function RouteObjectsFigure() {
  const items = [
    ['routes', '登録順の Journey::Route'],
    ['anchored_routes', '通常のルート'],
    ['custom_routes', 'mount したルートなど'],
    ['simulator', 'anchored_routes の状態遷移表'],
  ]
  return (
    <Svg
      id="ch09-route-objects"
      w={780}
      h={306}
      label="routes.rb のブロックの self である Mapper は、@set で RouteSet を指す。RouteSet は Rails.application.routes で、@set で Journey::Routes を、@router で Journey::Router を、named_routes で NamedRouteCollection を指す。Mapper の @set と RouteSet の @set は名前が同じだが、指すオブジェクトが違う。Journey::Routes は Rails.application.routes.routes で、登録順の Journey::Route の配列 routes、通常のルートの anchored_routes、mount したルートなどの custom_routes、anchored_routes の状態遷移表 simulator を持つ。Journey::Router は要求に合うルートを探すときに Journey::Routes を使う。NamedRouteCollection は名前から Journey::Route を引き、URL ヘルパーを定義する"
    >
      <Box x={20} y={20} w={220} h={52} lines={['Mapper', 'routes.rb のブロックの self']} fs={12.5} subTone="muted" />
      <Arrow x1={240} y1={46} x2={298} y2={46} dashed />
      <T x={269} y={34} anchor="middle" mono fs={11.5} tone="acc">
        @set
      </T>
      <Box x={300} y={20} w={260} h={52} lines={['RouteSet', 'Rails.application.routes']} fs={12.5} subTone="muted" />

      <Arrow d="M320,72 L320,106 L180,106 L180,138" dashed />
      <T x={250} y={96} anchor="middle" mono fs={11.5} tone="acc">
        @set
      </T>
      <Arrow x1={500} y1={72} x2={500} y2={138} dashed />
      <T x={492} y={104} anchor="end" mono fs={11.5}>
        @router
      </T>
      <Arrow d="M550,72 L550,106 L680,106 L680,138" dashed />
      <T x={615} y={96} anchor="middle" mono fs={11.5}>
        named_routes
      </T>

      <Box x={20} y={140} w={320} h={156} fill="box" lines={[]} />
      <T x={34} y={160} bold fs={12.5}>
        Journey::Routes
      </T>
      <T x={34} y={180} fs={11.5} tone="muted">
        Rails.application.routes.routes
      </T>
      {items.map(([k, v], i) => (
        <g key={k}>
          <T x={34} y={210 + i * 22} mono fs={11.5} tone="muted">
            {k}
          </T>
          <T x={150} y={210 + i * 22} fs={11.5}>
            {v}
          </T>
        </g>
      ))}

      <Box x={420} y={140} w={160} h={52} lines={['Journey::Router', '要求に合うルートを探す']} fs={12.5} subTone="muted" />
      <Arrow x1={420} y1={166} x2={342} y2={166} dashed />
      <T x={381} y={182} anchor="middle" fs={11.5} tone="muted">
        照合に使う
      </T>

      <Box x={600} y={140} w={160} h={76} lines={['NamedRouteCollection', '名前 → Journey::Route', 'URL ヘルパーを定義']} fs={12.5} subTone="muted" />
    </Svg>
  )
}

/* ---------- ルートを書く位置と、GET /articles/search で選ばれるルート ---------- */
function OrderSearchFigure() {
  const base = [
    ['GET', '/articles', 'index'],
    ['POST', '/articles', 'create'],
    ['GET', '/articles/new', 'new'],
    ['GET', '/articles/:id/edit', 'edit'],
    ['GET', '/articles/:id', 'show'],
    ['PATCH', '/articles/:id', 'update'],
    ['PUT', '/articles/:id', 'update'],
    ['DELETE', '/articles/:id', 'destroy'],
  ]
  const search = ['GET', '/articles/search', 'search']
  const cols = [
    { x: 20, title: 'resources の後に書いた場合', code: 'get "articles/search"', rows: [...base, search], chosen: 'show' },
    { x: 400, title: 'resources のブロックの中に書いた場合', code: 'get :search, on: :collection', rows: [search, ...base], chosen: 'search' },
  ]
  return (
    <Svg
      id="ch09-order-search"
      w={780}
      h={410}
      label={'GET /articles/search を送ったときに選ばれるルートを、2つの書き方で比べた図。左は resources :articles の後に get "articles/search" を書いた場合で、ルートは index、create、new、edit、show、update、destroy、search の順に登録される。パスとメソッドが合うのは show と search で、先に登録された show が選ばれる。params[:id] は search という文字列になり、記事が見つからず 404 になる。右は resources のブロックの中に get :search, on: :collection を書いた場合で、ブロックが先に実行されるので search が index より前に登録され、search が選ばれる'}
    >
      <Box x={20} y={12} w={220} h={30} lines="GET /articles/search" mono fs={12.5} fill="box4" />
      <T x={256} y={27} fs={11.5} tone="muted">
        上の行ほど先に登録されたルート。合う行のうち一番上が選ばれる
      </T>
      {cols.map((c) => (
        <g key={c.x}>
          <T x={c.x} y={64} bold fs={12.5}>
            {c.title}
          </T>
          <T x={c.x} y={84} mono fs={11.5} tone="muted">
            {c.code}
          </T>
          {c.rows.map(([v, p, a], i) => {
            const y = 100 + i * 28
            const hit = a === 'show' || a === 'search'
            const chosen = a === c.chosen
            return (
              <g key={v + p}>
                <Box
                  x={c.x}
                  y={y}
                  w={360}
                  h={24}
                  lines={`${v.padEnd(7)}${p.padEnd(19)}${a}`}
                  mono
                  fs={11.5}
                  align="start"
                  fill={chosen ? 'box5' : 'bg'}
                  accent={chosen}
                  dashed={hit && !chosen}
                />
                {hit && (
                  <T x={c.x + 296} y={y + 12} fs={11.5} tone={chosen ? 'acc' : 'muted'}>
                    {chosen ? '選ばれる' : '合う'}
                  </T>
                )}
              </g>
            )
          })}
        </g>
      ))}
      <T x={20} y={372} fs={11.5}>
        show が呼ばれ、params[:id] は "search"
      </T>
      <T x={20} y={392} fs={11.5} tone="danger">
        記事が見つからず 404 になる
      </T>
      <T x={400} y={372} fs={11.5}>
        search が呼ばれる
      </T>
    </Svg>
  )
}

const ch09: Chapter = {
  number: 9,
  part: 2,
  title: 'ルーティング',
  summary:
    '記事を開く要求と削除する要求は、同じパスでも別のアクションに届きます。routes.rb の1行を、ルートの一覧、受け取るパラメーター、リンクに使う URL と照らし合わせます。',
  goals: [
    'HTTP メソッドとパスから、呼ばれるアクションと params に入る値を読み取れる',
    'resources が登録するルートを bin/rails routes で調べ、画面のリンクを作れる',
    '複数のルートに合うパスでは、定義の順番がどのように結果に影響するか説明できる',
  ],
  prerequisites: [4, 6],
  sections: [
    {
      id: 'url-method',
      title: 'URL のパスと HTTP のメソッド',
      body: (
        <>
          <p>
            ブラウザーのアドレス欄に URL を入れてページを開くと、ブラウザーは URL が指すサーバーに HTTP の<Term>要求</Term>（リクエスト）を送り、サーバーは
            <Term>応答</Term>（レスポンス）を返します。HTTP は、ブラウザーとサーバーがやり取りするときの決まりです。デモのアプリケーションで記事を表示する URL は、次の部分に分かれます
            <Ref n={8} />。
          </p>
          <ul>
            <li>
              <code>http</code>：スキーム。通信の方式です。暗号化して通信するときは <code>https</code> になります。
            </li>
            <li>
              <code>127.0.0.1:3300</code>：ホストとポート。要求を送るコンピューターと、そのコンピューターで要求を待っているプログラムを指定します。127.0.0.1 は自分のコンピューターを表します。
            </li>
            <li>
              <code>/articles/1</code>：パス。サーバーの中のどの情報を求めるかを表します。
            </li>
            <li>
              <code>preview=true</code>：クエリ文字列。<code>?</code> の後ろに <code>名前=値</code> の形で付け足す値です。複数あるときは <code>&amp;</code> でつなぎます。
            </li>
          </ul>
          <p>
            この URL を curl（コマンドラインから HTTP の要求を送るツール）で開き、送った要求と、返ってきた応答の先頭を表示しました。<code>&gt;</code> で始まる行が要求、<code>&lt;</code>{' '}
            で始まる行が応答です。
          </p>
          <Code
            lang="text"
            title="curl -v の出力（応答のヘッダーは一部を省略）"
            code={`
$ curl -s -v -o /dev/null 'http://127.0.0.1:3300/articles/1?preview=true'
> GET /articles/1?preview=true HTTP/1.1
> Host: 127.0.0.1:3300
> User-Agent: curl/8.23.0
> Accept: */*
>
< HTTP/1.1 200 OK
< content-type: text/html; charset=utf-8
`}
          />
          <p>
            要求の1行目の <code>GET</code> が HTTP の<Term en="method">メソッド</Term>で、その後ろにパスとクエリ文字列が続きます。2行目からは<Term en="header">ヘッダー</Term>で、
            <code>名前: 値</code> の形で要求に情報を付け足します。Host は送り先のホスト、Accept は受け取りたいデータの種類です。応答の1行目の <code>200</code>{' '}
            はステータスコードで、要求の結果を3桁の数字で表します。200 は成功、404 は求められた情報が見つからないことを表します。応答のヘッダーの後には、空の行をはさんで本文（ここでは記事のページの HTML）が続きます。
          </p>
          <p>
            メソッドは、パスが指す情報に対して何をしたいかを表します。Web のアプリケーションでよく使うのは次の4つです
            <Ref n={9} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>メソッド</th>
                  <th>意味</th>
                  <th>記事での例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>GET</td>
                  <td>情報を取得する</td>
                  <td>記事のページを表示する</td>
                </tr>
                <tr>
                  <td>POST</td>
                  <td>データを送って、新しく作らせる</td>
                  <td>記事を作成する</td>
                </tr>
                <tr>
                  <td>PATCH（PUT）</td>
                  <td>既にある情報を更新する</td>
                  <td>記事のタイトルを変える</td>
                </tr>
                <tr>
                  <td>DELETE</td>
                  <td>情報を削除する</td>
                  <td>記事を削除する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            同じ <code>/articles/1</code> というパスでも、GET なら記事の表示、DELETE なら記事の削除というように、メソッドによって求める処理が変わります。HTML
            のフォームが送れるメソッドは GET と POST だけです。そこで Rails のフォームは PATCH や DELETE を送るときに POST を使い、<code>_method</code>{' '}
            という名前の隠れた入力欄に <code>patch</code> などの値を入れて送ります。Rails の側では、ミドルウェアの Rack::MethodOverride がこの値を見て、要求のメソッドを PATCH などに直します（
            <ChapterLink n={6} section="rails-stack" />）
            <Ref n={10} />。
          </p>
        </>
      ),
    },
    {
      id: 'routing-role',
      title: 'ルーティングが決めること',
      body: (
        <>
          <p>
            Rails のアプリケーションは要求を受け取ると、メソッドとパスの組み合わせから、どのコントローラーのどのアクションで処理するかを決めます。この仕組みを<Term en="routing">ルーティング</Term>
            と呼びます。コントローラーは要求を処理するクラス（ArticlesController など）で、アクションはそのクラスの public メソッド（show など）です。コントローラーの中で何をするかは
            <ChapterLink n={10} />で扱います。
          </p>
          <p>
            メソッドとパスと呼び出し先の組み合わせを<Term en="route">ルート</Term>と呼び、<code>config/routes.rb</code> に書きます。1つのルートを1行で書くと、次のようになります。
          </p>
          <Code
            lang="ruby"
            title="config/routes.rb（1行で書く例）"
            code={`
Rails.application.routes.draw do
  get "/articles/:id", to: "articles#show"
end
`}
          />
          <p>
            <code>get</code> は GET の要求のルートを作るメソッドで、ほかに <code>post</code>・<code>patch</code>・<code>delete</code> があります。<code>"/articles/:id"</code>{' '}
            はパスの形で、<code>:</code> で始まる部分には任意の値が入ります。<code>"articles#show"</code> は ArticlesController の show アクションを表します。
          </p>
          <p>
            デモのアプリケーションに <code>GET /articles/1?preview=true</code> を送ると、開発サーバーのログに次の行が出ました。
          </p>
          <Code
            lang="text"
            title="開発サーバーのログ（一部を省略）"
            code={`
Started GET "/articles/1?preview=true" for 172.29.0.1 at 2026-11-16 07:12:09 +0000
Processing by ArticlesController#show as HTML
  Parameters: {"preview" => "true", "id" => "1"}
  Article Load (0.7ms)  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 1 LIMIT 1
Completed 200 OK in 10ms (Views: 5.8ms | ActiveRecord: 1.8ms (2 queries, 0 cached) | GC: 0.5ms)
`}
          />
          <p>
            <code>Started</code> の行は受け取った要求のメソッドとパスです。<code>Processing by</code> の行は、ルーティングが選んだコントローラーとアクションです（<code>as HTML</code>{' '}
            は HTML を返す要求として扱ったことを表します）。<code>Parameters</code> の行には、パスの <code>:id</code> に当たる <code>"1"</code> が <code>id</code>{' '}
            という名前で、クエリ文字列の <code>preview</code> と一緒に入っています。アクションの中では、これらを <code>params[:id]</code>・<code>params[:preview]</code>{' '}
            で取り出せます。値はどちらも文字列です。show アクションの <code>Article.find(params[:id])</code> は、この <code>"1"</code> を使って id が1の記事を読み出しています。
          </p>
          <p>
            デモのアプリケーションには、<code>/articles/1</code> への DELETE のルートがありません。DELETE の要求を送ると、どのアクションも呼ばれずに 404 が返り、ログには次の行が出ました。
          </p>
          <Code
            lang="text"
            code={`
Started DELETE "/articles/1" for 172.29.0.1 at 2026-11-16 07:05:02 +0000
ActionController::RoutingError (No route matches [DELETE] "/articles/1"):
`}
          />
          <p>
            パスが同じでも、メソッドが違えば別の要求として扱われます。ルーティングは、メソッドとパスの両方が合うルートを探し、見つかったルートのアクションを呼びます（図 9-1）。
          </p>
          <Figure n="9-1" title="要求からアクションを選ぶ" caption="デモのアプリケーション（development）で、3つの要求を送ったときのログをもとにした図。">
            <RoutingRoleFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'resources',
      title: 'resources と7つのアクション',
      body: (
        <>
          <p>
            記事のように、一覧・表示・作成・更新・削除がそろう対象には、<code>get</code> を1行ずつ書く代わりに <code>resources</code> を使います。routes.rb を{' '}
            <code>resources :articles</code> の1行だけにしたデモのアプリケーションのコピーで、<code>bin/rails routes</code> を実行しました。このコマンドは登録されたルートを一覧で表示します。
          </p>
          <Code
            lang="text"
            title="bin/rails routes -c articles の出力（-c は表示するコントローラーを絞り込むオプション）"
            code={`
      Prefix Verb   URI Pattern                  Controller#Action
    articles GET    /articles(.:format)          articles#index
             POST   /articles(.:format)          articles#create
 new_article GET    /articles/new(.:format)      articles#new
edit_article GET    /articles/:id/edit(.:format) articles#edit
     article GET    /articles/:id(.:format)      articles#show
             PATCH  /articles/:id(.:format)      articles#update
             PUT    /articles/:id(.:format)      articles#update
             DELETE /articles/:id(.:format)      articles#destroy
`}
          />
          <p>
            Verb はメソッド、URI Pattern はパスの形、Controller#Action は呼ばれるコントローラーとアクションです。Prefix はルートの名前で、次の「URL ヘルパーでパスを作る」の節で使います。Prefix
            が空の行は、上の行と同じパスのルートです。1行の <code>resources :articles</code> が7つのアクションへのルートを作りました（update には PATCH と PUT の2つのルートがあるので、行は8行です）
            <Ref n={5} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>アクション</th>
                  <th>メソッドとパス</th>
                  <th>すること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>index</td>
                  <td>
                    <code>GET /articles</code>
                  </td>
                  <td>一覧を表示する</td>
                </tr>
                <tr>
                  <td>show</td>
                  <td>
                    <code>GET /articles/:id</code>
                  </td>
                  <td>1件を表示する</td>
                </tr>
                <tr>
                  <td>new</td>
                  <td>
                    <code>GET /articles/new</code>
                  </td>
                  <td>作成のフォームを表示する</td>
                </tr>
                <tr>
                  <td>create</td>
                  <td>
                    <code>POST /articles</code>
                  </td>
                  <td>送られた内容で作成する</td>
                </tr>
                <tr>
                  <td>edit</td>
                  <td>
                    <code>GET /articles/:id/edit</code>
                  </td>
                  <td>編集のフォームを表示する</td>
                </tr>
                <tr>
                  <td>update</td>
                  <td>
                    <code>PATCH /articles/:id</code>（PUT も同じ）
                  </td>
                  <td>送られた内容で更新する</td>
                </tr>
                <tr>
                  <td>destroy</td>
                  <td>
                    <code>DELETE /articles/:id</code>
                  </td>
                  <td>削除する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            new と edit はフォームを表示するだけで、データを保存するのは create と update です。利用者がフォームを開く要求と、フォームを送信する要求は別の要求なので、アクションも別になります（図 9-2）。
          </p>
          <Figure n="9-2" title="resources が作る7つのアクション" caption="Rails ガイドの表と bin/rails routes の出力をもとにした図。">
            <ResourcesFigure />
          </Figure>
          <p>
            パスの末尾の <code>(.:format)</code> は省略できる部分です。<code>/articles/1.txt</code> のように拡張子を付けると、拡張子が <code>params[:format]</code> に{' '}
            <code>"txt"</code> として入ります。デモのアプリケーションに <code>GET /articles/1.txt</code> を送ると、ログは <code>Processing by ArticlesController#show as TEXT</code>{' '}
            となり、HTML のテンプレートの代わりにテキスト用のテンプレート（show.text.erb）で作った <code>title: …</code> という本文が返りました。
          </p>
          <p>
            7つのうち一部だけを使うときは <code>only:</code> で指定します（使わないものを <code>except:</code> で指定する書き方もあります）。デモのアプリケーションの routes.rb は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="デモのアプリケーションの config/routes.rb（一部を省略）"
            code={`
Rails.application.routes.draw do
  resources :articles, only: [:index, :show] do
    resources :comments, only: [:new, :create]
  end
  get "up" => "rails/health#show", as: :rails_health_check
end
`}
          />
          <p>
            <code>resources :articles, only: [:index, :show]</code> は index と show のルートだけを作ります。RouteSet（ルートの一覧を持つ Rails のオブジェクト）に次の2行を登録した場合と、
            <code>bin/rails routes</code> と同じ形式の表示が一致しました（<code>as:</code> はルートの名前を付けるオプションです）。
          </p>
          <Code
            lang="ruby"
            code={`
get "articles" => "articles#index", as: :articles
get "articles/:id" => "articles#show", as: :article
`}
          />
          <p>
            <code>resources</code> のブロックの中に <code>resources</code> を書くと、ルートが入れ子になります。コメントは記事に属するので、パスの前に記事のパスが付きます。
          </p>
          <Code
            lang="text"
            title="bin/rails routes -c comments の出力"
            code={`
             Prefix Verb URI Pattern                                  Controller#Action
   article_comments POST /articles/:article_id/comments(.:format)     comments#create
new_article_comment GET  /articles/:article_id/comments/new(.:format) comments#new
`}
          />
          <p>
            記事の id はパスの <code>:article_id</code> の部分に入り、CommentsController の中では <code>params[:article_id]</code> で取り出せます。
            <code>/articles/1/comments/new</code> に合うルートを探させると、結果は <code>{'{controller: "comments", action: "new", article_id: "1"}'}</code> でした（確かめ方は「ルートの順序」の節で使う <code>recognize_path</code> です）。Rails ガイドは入れ子を1段までにすることを勧めています
            <Ref n={5} />。
          </p>
        </>
      ),
    },
    {
      id: 'path-helpers',
      title: 'URL ヘルパーでパスを作る',
      body: (
        <>
          <p>
            ビューでリンクを作るときは、<code>"/articles/1"</code> のような文字列を書く代わりに、ルートの名前から作られたメソッドを使います。<code>bin/rails routes</code> の Prefix
            が <code>article</code> のルートには、パスを返す <code>article_path</code> と、ホスト名を含む URL を返す <code>article_url</code> ができます。このようなメソッドを URL
            ヘルパーと呼びます。デモのアプリケーションで呼び出した結果です。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（a は Article.find(1)）"
            code={`
articles_path               # => "/articles"
articles_path(page: 2)      # => "/articles?page=2"
article_path(1)             # => "/articles/1"
article_path(a)             # => "/articles/1"
new_article_comment_path(a) # => "/articles/1/comments/new"
article_comments_path(a)    # => "/articles/1/comments"
article_url(a)              # => "http://example.com/articles/1"（ホストを example.com にした場合）
`}
          />
          <p>
            <code>:id</code> の部分には引数が入ります。モデルのオブジェクトを渡すと、その id が使われます。パスに無い名前（<code>page: 2</code>）を渡すと、クエリ文字列になります。
            <code>resources :articles</code> の7つのルートなら、<code>articles_path</code>・<code>new_article_path</code>・<code>edit_article_path(1)</code>（<code>"/articles/1/edit"</code>
            ）・<code>article_path(1)</code> の4つで、すべてのパスを作れます
            <Ref n={5} />。
          </p>
          <p>デモのアプリケーションの記事のページ（show.html.erb）では、URL ヘルパーをリンクの作成に使っています。</p>
          <Code
            lang="erb"
            title="app/views/articles/show.html.erb（一部）"
            code={`
<%= link_to "コメントを書く", new_article_comment_path(@article) %>
<p><%= link_to "一覧へ", articles_path %></p>
`}
          />
          <Code
            lang="html"
            title="GET /articles/1 で返った HTML（一部）"
            code={`
<a href="/articles/1/comments/new">コメントを書く</a>
<p><a href="/articles">一覧へ</a></p>
`}
          />
          <p>
            URL ヘルパーはルートの定義からパスを作るので、routes.rb でパスを変えると、ヘルパーが返すパスも変わります。<code>resources :articles, path: "posts"</code> と書いた場合、
            <code>article_path(1)</code> は <code>"/posts/1"</code> を返しました。ビューに <code>"/articles/1"</code> と直接書いていると、書き直す必要があります。名前の無いルート（
            <code>as:</code> を付けずに <code>get "articles/:id" =&gt; "articles#show"</code> と書いたもの）は Prefix が空になり、URL ヘルパーもできません。
          </p>
          <p>
            ここまでで、routes.rb に書いた定義を使って、要求からアクションを選ぶことと、ルートの名前からパスを作ることを見ました。どちらも起動時に routes.rb を実行して作ったルートの一覧を使っています。次の節からは、routes.rb
            の1行がルートのオブジェクトとして登録されるまで（「routes.rb の定義が登録されるまで」の節）、要求に合うルートが選ばれるまで（「リクエストの認識」の節）、URL
            ヘルパーのメソッドが定義されるまで（「URL ヘルパーの定義」の節）を、Rails のソースで追います。
          </p>
        </>
      ),
    },
    {
      id: 'resource-design',
      title: "URL に表すリソースを選ぶ",
      body: (
        <>
          <p>
            記事やコメントのように、URL で識別して取得・変更する対象をリソースと呼びます。<code>/articles/42</code> が「42番の記事」を表し、GET なら表示、PATCH なら変更という形にすると、対象と操作を別々に読み取れます。GET は取得用にし、更新は更新用のメソッドへ寄せると、リンクの再表示や検索ロボットの巡回で状態が動く事故を防げます。<Ref n={11} />
          </p>
          <h3>単数リソースと親子の URL</h3>
          <p>
            同じ記事に公開記録が最大1件なら、<code>resource :publication</code> のように単数形にできます。子自身の <code>:id</code> を URL に含めず、親の記事で対象が決まります。Rails は単数リソースでも複数形のコントローラー名を使います。<Ref n={11} />
          </p>
          <Code
            lang="ruby"
            title={"config/routes.rb"}
            code={`
resources :articles do
  resource :publication, only: %i[create destroy], module: :articles
  resources :comments, only: %i[index create show update destroy], shallow: true
end
`}
          />
          <p>
            公開の作成と取り消しは <code>POST /articles/:article_id/publication</code> と <code>DELETE /articles/:article_id/publication</code> で、<code>Articles::PublicationsController</code> に渡ります。<code>module: :articles</code> は、コントローラーを <code>Articles</code> という名前空間の中から探す指定です（ファイルは <code>app/controllers/articles/publications_controller.rb</code> に置きます）。 URL を生成するヘルパーはどちらも <code>article_publication_path(article)</code> です。ArticlesController に <code>publish</code> のようなアクションを増やす場合と比べ、公開の条件・記録・権限を置く場所が明確になります。対象の単位を考えると、「記事へのいいねを作る・消す」「検索結果の一覧を GET で取得する」といった設計にも同じ考え方を使えます。
          </p>
          <p>
            子の一覧や作成では、どの記事のコメントかを <code>/articles/:article_id/comments</code> で受け取ります。<code>shallow: true</code> を付けると、既存のコメントを参照・更新・削除するパスは <code>/comments/:id</code> になります。コメントの ID だけで行を特定できるためです。深いネストは URL・ヘルパー・取得処理を長くするので、親が必要な操作に絞ります。短い URL でも、誰が子を操作できるかは認可で確かめます（<ChapterLink n={21} section="object-authorization">レコード単位の認可</ChapterLink>）。<Ref n={11} />
          </p>
          <h3>標準の操作を越えるルート</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">書き方</th>
                  <th scope="col">パスと振り分け</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>get :preview, on: :member</code></th>
                  <td><code>/articles/:id/preview</code>。1件が対象</td>
                </tr>
                <tr>
                  <th scope="row"><code>get :search, on: :collection</code></th>
                  <td><code>/articles/search</code>。集合が対象</td>
                </tr>
                <tr>
                  <th scope="row"><code>namespace :admin</code></th>
                  <td><code>/admin/articles</code>、<code>admin_articles_path</code>、<code>Admin::ArticlesController</code></td>
                </tr>
                <tr>
                  <th scope="row"><code>scope module: :admin</code></th>
                  <td>URL を <code>/articles</code> のままにして <code>Admin::ArticlesController</code> へ渡す</td>
                </tr>
                <tr>
                  <th scope="row"><code>scope "/admin", as: :admin</code></th>
                  <td>パスとヘルパー名に接頭辞を付け、コントローラーの名前空間は増やさない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            管理画面の名前空間は URL とコードの置き場所をまとめます。<code>namespace :admin</code> と書いても、<code>/admin/articles</code> を開ける利用者は制限されません。管理者しか操作できないという条件は、Admin のコントローラーの側に、認証・認可の処理として書きます。<Ref n={11} />
          </p>
          <h3>生成されたルートを確認する</h3>
          <p>
            <code>bin/rails routes -g comment</code> で名前・パスなどに <code>comment</code> を含むルートを探せます。開発環境の <code>/rails/info/routes</code> にはルート一覧の画面があります。パスの形式に加えて、<code>constraints subdomain: "staff" do ... end</code> などで要求のサブドメイン（<code>staff.example.com</code> の <code>staff</code> の部分）を条件にできます。パスの形式を満たすことと、レコードが存在したり利用者に権限があったりすることは別々に判定します。<code>/articles/999</code> は <code>/articles/:id</code> のルートに合いますが、id が 999 の記事があるかどうかは、アクションの中で <code>Article.find</code> を呼ぶまで分かりません。<Ref n={11} />
          </p>
          <p>
            <code>polymorphic_path([:admin, @article])</code> のように名前空間とモデルを並べると、その組から登録済みのヘルパーを選べます。この例は <code>admin_article_path(@article)</code> を呼んだ場合と同じパスを返します。記事に属するコメントの新規フォームなら <code>form_with model: [@article, @comment]</code> が親子の作成先を選びます。<code>@comment</code> が保存前のオブジェクトなら、送信先は <code>article_comments_path(@article)</code> と同じパスになります。<Ref n={11} />
          </p>
        </>
      ),
    },
    {
      id: 'dsl',
      title: 'routes.rb の定義が登録されるまで',
      body: (
        <>
          <p>
            routes.rb に書いた1行がルートとして登録されるまでを、この節と次の節で追います。ここから「URL ヘルパーの定義」の節までに出てくる Rails の内部のクラスは、次の6つです。
            <Term>Journey</Term>（<code>ActionDispatch::Journey</code>）は ActionDispatch の中のモジュールで、パスのパターンの解析と、要求のパスとの照合を受け持ちます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">クラス</th>
                  <th scope="col">持っているもの・すること</th>
                  <th scope="col">コードから見える所</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>ActionDispatch::Routing::RouteSet</code></th>
                  <td>アプリケーションのルート全体を持つ。ルートの登録（<code>add_route</code>）と、要求の受け付け（<code>call</code>）の両方を受け持つ</td>
                  <td><code>Rails.application.routes</code></td>
                </tr>
                <tr>
                  <th scope="row"><code>ActionDispatch::Routing::Mapper</code></th>
                  <td><code>get</code>・<code>resources</code>・<code>namespace</code> などのメソッドを持ち、routes.rb の内容を1つずつのルートに展開する</td>
                  <td>routes.rb のブロックの中の self</td>
                </tr>
                <tr>
                  <th scope="row"><code>Mapper::Mapping</code></th>
                  <td>1つのルートの定義（パス、コントローラーとアクション、HTTP メソッド、制約）を、登録の前にまとめたもの</td>
                  <td>登録の途中だけで使われる</td>
                </tr>
                <tr>
                  <th scope="row"><code>Journey::Routes</code></th>
                  <td>登録されたルートの配列と、照合に使う状態遷移表を持つ</td>
                  <td><code>Rails.application.routes.routes</code></td>
                </tr>
                <tr>
                  <th scope="row"><code>Journey::Route</code></th>
                  <td>登録された1つのルート。<code>bin/rails routes</code> の1行に当たる</td>
                  <td>上の配列の要素</td>
                </tr>
                <tr>
                  <th scope="row"><code>Journey::Router</code></th>
                  <td>要求のパスに合うルートを探し、見つけたルートの呼び出し先を呼ぶ</td>
                  <td>RouteSet の <code>@router</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Journey の3つは名前が似ています。Routes はルートの一覧、Route は1件のルート、Router は要求に合うルートを探すクラスです。routes.rb の1行は Mapper、Mapping、RouteSet、Journey::Routes の順に渡り、Journey::Route
            になります。図 9-3 の左の列が、この順を上から並べたものです。
          </p>
          <p>
            次の図はこれらのオブジェクトがどの変数でほかのオブジェクトを指しているかを示したものです。左上の Mapper から矢印の順に見ます。この後の引用に出てくる <code>@set</code>・
            <code>named_routes</code>・<code>@router</code> は、図の破線の矢印に当たります。
          </p>
          <Figure
            title="ルーティングの各オブジェクトが変数で指す先"
            caption="Rails 8.1.4.1 の route_set.rb・mapper.rb・journey/routes.rb をもとにした模式図。破線の矢印の先は、矢印の横に書いた変数が指すオブジェクト。強調色の @set は2つあり、Mapper の @set は RouteSet を、RouteSet の @set は Journey::Routes を指す。登録の途中だけで使う Mapping は省略した。"
          >
            <RouteObjectsFigure />
          </Figure>
          <p>
            <code>config/routes.rb</code> のブロックは、<code>ActionDispatch::Routing::Mapper</code> のインスタンスを self として <code>instance_exec</code> されます（<ChapterLink n={4} />
            ）。デモのアプリケーションの routes.rb は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="config/routes.rb"
            code={`
Rails.application.routes.draw do
  resources :articles, only: [:index, :show]
  get "up" => "rails/health#show", as: :rails_health_check
end
`}
          />
          <p>
            <code>bin/rails routes</code> で登録されたルートを確認できます（ActiveStorage のルートは省略）。
          </p>
          <Code
            lang="text"
            code={`
            Prefix Verb URI Pattern             Controller#Action
          articles GET  /articles(.:format)     articles#index
           article GET  /articles/:id(.:format) articles#show
rails_health_check GET  /up(.:format)           rails/health#show
`}
          />
          <p>
            <code>resources</code> は、Mapper の中で <code>collection do get :index end</code> や、member のスコープでの <code>get :show</code> などに展開されます（<code>mapper.rb</code> の
            1663〜1694 行目）。<code>resources</code> の中で、ルートを登録している部分は次のとおりです。<code>resources</code> が特別な登録の方法を持っているのか、<code>get</code> などを呼んでいるだけなのかを確かめます。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/routing/mapper.rb（1676〜1689行目。resources メソッドの中）"
            href={`${GH}/actionpack/lib/action_dispatch/routing/mapper.rb#L1676-L1689`}
            code={`
              yield if block_given?

              concerns(*concerns) if concerns

              collection do
                get  :index if parent_resource.actions.include?(:index)
                post :create if parent_resource.actions.include?(:create)
              end

              new do
                get :new
              end if parent_resource.actions.include?(:new)

              set_member_mappings_for_resource
`}
          />
          <ul>
            <li>
              <code>yield if block_given?</code>：<code>resources :articles do ... end</code> のようにブロックを渡したときは、最初にそのブロックを実行します。入れ子の <code>resources</code>{' '}
              や追加のルートは、ここで登録されます。
            </li>
            <li>
              <code>collection do ... end</code>：<code>/articles</code> を対象にして <code>get :index</code> と <code>post :create</code> を呼びます。
              <code>parent_resource.actions</code> は、<code>only:</code> や <code>except:</code> で絞った後のアクションの一覧です。<code>only: [:index, :show]</code> なら{' '}
              <code>post :create</code> は呼ばれません。
            </li>
            <li>
              <code>new do ... end</code>：<code>/articles/new</code> を対象にして <code>get :new</code> を呼びます。
            </li>
            <li>
              <code>set_member_mappings_for_resource</code>：同じファイルの 2108〜2118 行目にあるメソッドです。<code>member do ... end</code> の中で、<code>/articles/:id</code>{' '}
              を対象にして <code>get :edit</code>、<code>get :show</code>、<code>patch :update</code>、<code>put :update</code>、<code>delete :destroy</code> をこの順に呼びます。
            </li>
          </ul>
          <p>
            <code>resources</code> の中身は、routes.rb に自分で書けるものと同じ <code>get</code>・<code>post</code>・<code>patch</code>・<code>put</code>・<code>delete</code>{' '}
            の呼び出しでした。呼ぶ順は index、create、new、edit、show、update、destroy で、「resources と7つのアクション」の節の <code>bin/rails routes</code> の行の並びと一致します。
          </p>
          <p>
            <code>get</code> などのメソッドは、最終的に1つのルートごとに次の <code>add_route</code> を呼びます。この引用では、routes.rb の1行から取り出した値が、どの順で加工されて RouteSet に渡るかを確かめます。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/routing/mapper.rb（2195〜2215行目）"
            href={`${GH}/actionpack/lib/action_dispatch/routing/mapper.rb#L2195-L2215`}
            code={`
          def add_route(action, controller, as, options_action, _path, to, via, formatted, anchor, options_constraints, internal, options_mapping)
            path = path_for_action(action, _path)
            raise ArgumentError, "path is required" if path.blank?

            action = action.to_s

            default_action = options_action || @scope[:action]

            if /^[\\w\\-\\/]+$/.match?(action)
              default_action ||= action.tr("-", "_") unless action.include?("/")
            else
              action = nil
            end

            as   = name_for_action(as, action) if as
            path = Mapping.normalize_path URI::RFC2396_PARSER.escape(path), formatted
            ast  = Journey::Parser.parse path

            mapping = Mapping.build(@scope, @set, ast, controller, default_action, to, via, formatted, options_constraints, anchor, internal, options_mapping)
            @set.add_route(mapping, as)
          end
`}
          />
          <p>
            パスの文字列（<code>/articles/:id(.:format)</code>）を <code>Journey::Parser</code> で構文木にし、スコープ（namespace や scope の設定）やコントローラー名、HTTP メソッドの指定とまとめて{' '}
            <code>Mapping</code> を作り、RouteSet に渡します
            <Ref n={1} />。行ごとに読むと次のとおりです。
          </p>
          <ul>
            <li>
              引数は12個ありますが、追うのは5つです。<code>action</code> は <code>get</code> の最初の引数（<code>"up"</code> のようなパスか、<code>:show</code>{' '}
              のようなアクション名）、<code>controller</code> はコントローラーの名前、<code>as</code> はルートの名前、<code>to</code> は <code>"rails/health#show"</code>{' '}
              のような呼び出し先、<code>via</code> は HTTP メソッドです。
            </li>
            <li>
              <code>path = path_for_action(action, _path)</code>：ルートのパスを作ります。<code>@scope</code> は、外側の <code>resources</code> や <code>namespace</code>{' '}
              が設定した値（パスの前に付ける部分、コントローラーの名前など）を持つオブジェクトです。<code>path_for_action</code> は <code>@scope[:path]</code> を前に付けるので、
              <code>namespace :admin</code> の中に書いた <code>get "dashboard"</code> のパスは <code>/admin/dashboard</code> になります。
            </li>
            <li>
              <code>default_action = ...</code> から <code>end</code> まで：アクションの名前の既定値を決めます。<code>get :show</code> のようにアクション名で書いたルートでは{' '}
              <code>"show"</code> になります。<code>to:</code> に <code>"rails/health#show"</code> のように書いたルートでは、後の <code>Mapping.build</code> の中で <code>#</code>{' '}
              の前後に分けた値が使われます（同じファイルの 230〜233 行目）。
            </li>
            <li>
              <code>as = name_for_action(as, action) if as</code>：ルートの名前を決めます。<code>resources</code> の中では、リソースの名前と組み合わせて <code>articles</code>・
              <code>article</code>・<code>new_article</code> のような名前にします。
            </li>
            <li>
              <code>path = Mapping.normalize_path URI::RFC2396_PARSER.escape(path), formatted</code>：Ruby はメソッドの引数の括弧を省けるので、この行は{' '}
              <code>Mapping.normalize_path(URI::RFC2396_PARSER.escape(path), formatted)</code> と同じです。<code>escape</code> は URL にそのまま書けない文字を <code>%E3</code>{' '}
              のような形に変えます。<code>normalize_path</code> は先頭にスラッシュを付けて連続するスラッシュを1つにまとめ、既定では末尾に <code>(.:format)</code> を付けます。<code>bin/rails routes</code> の URI Pattern に{' '}
              <code>(.:format)</code> が付くのは、この行の結果です。
            </li>
            <li>
              <code>ast = Journey::Parser.parse path</code>：パスの文字列を構文木にします。結果は、この節の初めに見た Cat や Symbol の木です。
            </li>
            <li>
              <code>mapping = Mapping.build(...)</code>：ここまでに決めたパスの構文木、コントローラー、アクション、HTTP メソッド、制約を1つの Mapping にまとめます。
            </li>
            <li>
              <code>@set.add_route(mapping, as)</code>：Mapper の <code>@set</code> は RouteSet（<code>Rails.application.routes</code>）です。Mapping とルートの名前を渡します。
            </li>
          </ul>
          <p>RouteSet の側の <code>add_route</code> は次のとおりです。ここでは、ルートの名前の確認と、ルートの一覧への追加を確かめます。</p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/routing/route_set.rb（643〜655行目）"
            href={`${GH}/actionpack/lib/action_dispatch/routing/route_set.rb#L643-L655`}
            code={`
      def add_route(mapping, name)
        raise ArgumentError, "Invalid route name: '#{name}'" unless name.blank? || name.to_s.match(/^[_a-z]\\w*$/i)

        if name && named_routes[name]
          raise ArgumentError, "Invalid route name, already in use: '#{name}' \\n" \\
            "You may have defined two routes with the same name using the \`:as\` option, or " \\
            "you may be overriding a route already defined by a resource with the same naming. " \\
            "For the latter, you can restrict the routes created with \`resources\` as explained here: \\n" \\
            "https://guides.rubyonrails.org/routing.html#restricting-the-routes-created"
        end

        route = @set.add_route(name, mapping)
        named_routes[name] = route if name
`}
          />
          <ul>
            <li>
              1行目の <code>raise ... unless ...</code>：名前が付いているのに、その名前が <code>/^[_a-z]\w*$/i</code>{' '}
              に合わないときに ArgumentError にします。この正規表現は、英字かアンダースコアで始まり、英数字とアンダースコアだけが続く語を表します。<code>as: "my-page"</code>{' '}
              のようにハイフンを含む名前は、ここで止まります。ルートの名前は、後で <code>my_page_path</code> のようなメソッドの名前に使われます。
            </li>
            <li>
              <code>if name &amp;&amp; named_routes[name]</code>：同じ名前のルートが登録済みなら ArgumentError にします。メッセージは{' '}
              <code>Invalid route name, already in use: 'article'</code> で始まります。
            </li>
            <li>
              <code>route = @set.add_route(name, mapping)</code>：RouteSet の <code>@set</code> は <code>Journey::Routes</code> のインスタンスです（同じファイルの 400 行目で{' '}
              <code>Journey::Routes.new</code> を代入しています）。Mapper の <code>@set</code> は RouteSet でしたが、変数の名前が同じだけで別のオブジェクトです。戻り値の{' '}
              <code>route</code> は、次の節で見る <code>Journey::Route</code> です。
            </li>
            <li>
              <code>named_routes[name] = route if name</code>：名前があるルートを <code>named_routes</code> に登録します。
            </li>
          </ul>
          <p>
            引用したのはメソッドの途中までです。この後には、非推奨の書き方への警告と、<code>route</code> を返す行が続きます。
          </p>
          <p>
            <code>@set</code> は <code>Journey::Routes</code> のインスタンスで、ルートの配列を持ちます。名前（<code>as</code>）が付いたルートは <code>named_routes</code>{' '}
            にも登録され、ここで URL ヘルパーが定義されます（後述）。同じ名前を2回使うと、この時点で例外になります
            <Ref n={2} />。
          </p>
          <p>
            この例外は、<code>resources :articles</code> を書いた routes.rb に <code>get "articles/:id", to: "articles#show", as: :article</code>{' '}
            のような行を足したときに出ます。<code>resources</code> が <code>article</code> という名前のルートを先に登録しているためです。メッセージの後半には、<code>resources</code> が作るルートを <code>only:</code> や <code>except:</code>{' '}
            で減らす方法を説明した Rails ガイドの URL が書かれています。足す行の <code>as:</code> を別の名前にしても、例外は出なくなります。
          </p>
          <Figure n="9-3" title="routes.rb の1行から Journey::Route まで" caption="Rails 8.1.4.1 の mapper.rb・route_set.rb・journey/routes.rb を読んでまとめた図。">
            <DefineFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'route',
      title: 'Journey::Route が持つ情報',
      body: (
        <>
          <p>
            Journey は ActionDispatch の中にあるルーティングの実装です。前の節の最後で RouteSet が呼んだ <code>Journey::Routes#add_route</code> は、Mapping から{' '}
            <code>Journey::Route</code> を作り、配列に追加します。次の引用では、1つのルートが何番目として、どの入れ物に保存されるかを確かめます。メソッドは3つあり、呼ばれる順は下の{' '}
            <code>add_route</code>、上の <code>partition_route</code>、中央の <code>simulator</code> です。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/journey/routes.rb（45〜73行目、一部省略）"
            href={`${GH}/actionpack/lib/action_dispatch/journey/routes.rb#L45-L73`}
            code={`
      def partition_route(route)
        if route.path.anchored && route.path.requirements_anchored?
          anchored_routes << route
        else
          custom_routes << route
        end
      end

      # （ast は省略）

      def simulator
        @simulator ||= begin
          gtg = GTG::Builder.new(ast).transition_table
          GTG::Simulator.new(gtg)
        end
      end

      def add_route(name, mapping)
        route = mapping.make_route name, routes.length
        routes << route
        partition_route(route)
        clear_cache!
        route
      end
`}
          />
          <ul>
            <li>
              <code>route = mapping.make_route name, routes.length</code>：Mapping から Journey::Route を作ります。<code>routes</code> は登録済みのルートの配列なので、
              <code>routes.length</code> は最初のルートで 0、次のルートで 1 になります。
            </li>
            <li>
              <code>routes &lt;&lt; route</code>：作ったルートを配列の末尾に足します。
            </li>
            <li>
              <code>partition_route(route)</code>：ルートを <code>anchored_routes</code> と <code>custom_routes</code> のどちらかの配列にも入れます。<code>route.path.anchored</code>{' '}
              は、パターン全体がパスと一致する必要があるルートで true になります。<code>requirements_anchored?</code> は、パターンの <code>articles</code> や <code>:id</code>{' '}
              のような部品が <code>/</code> か <code>.</code> で区切られていて、固定の文字列と直接つながっていないかを調べます（<code>journey/path/pattern.rb</code> の 36〜56 行目）。<code>/articles/:id(.:format)</code> は両方とも true で、<code>anchored_routes</code>{' '}
              に入ります。
            </li>
            <li>
              <code>clear_cache!</code>：前に作った <code>@ast</code> と <code>@simulator</code> を nil に戻します（同じファイルの 83〜86 行目）。ルートが増えると、全ルートをまとめた状態遷移表は作り直す必要があるためです。
            </li>
            <li>
              <code>simulator</code> の <code>@simulator ||= begin ... end</code>：<code>@simulator</code> が nil のときだけ <code>begin</code> から <code>end</code>{' '}
              までを実行し、結果を <code>@simulator</code> に入れる書き方です。2回目からは、入っている値をそのまま返します。<code>simulator</code>{' '}
              が呼ばれるのは、次の節で見る、要求のパスを照合するときです。中では、引用で省略した <code>ast</code>{' '}
              メソッドが <code>anchored_routes</code> すべての構文木を1つにまとめ、<code>GTG::Builder</code> がそこから状態遷移表（<code>transition_table</code>）を作ります。
              <code>GTG::Simulator</code> は、その表に従って要求のパスを先頭から読むオブジェクトです。
            </li>
          </ul>
          <p>
            <code>make_route</code> の2つ目の引数 <code>routes.length</code> がルートの <code>precedence</code> になります。つまり precedence は登録された順の番号です
            <Ref n={3} />。ルートは、パターン全体がパスと一致する必要がある通常のルート（<code>anchored_routes</code>）と、mount のようにパスの先頭だけ一致すればよいルートなど（
            <code>custom_routes</code>）に分けて保存されます。<code>simulator</code> は、通常のルートすべてのパターンをまとめた状態遷移表です。次節で使います。
          </p>
          <p>デモのアプリケーションで、登録されたルートの中身を表示しました（一部）。</p>
          <Code
            lang="ruby"
            code={`
Rails.application.routes.routes.each do |r|
  next if r.internal
  p [r.name, r.verb, r.path.spec.to_s, r.defaults, r.precedence, r.app.class.name]
end
# => ["articles", "GET", "/articles(.:format)", {controller: "articles", action: "index"}, 8, "ActionDispatch::Routing::RouteSet::Dispatcher"]
# => ["article", "GET", "/articles/:id(.:format)", {controller: "articles", action: "show"}, 9, "ActionDispatch::Routing::RouteSet::Dispatcher"]
# => ["rails_health_check", "GET", "/up(.:format)", {controller: "rails/health", action: "show"}, 10, "ActionDispatch::Routing::RouteSet::Dispatcher"]
`}
          />
          <p>
            <code>Rails.application.routes.routes</code> は Journey::Routes で、<code>each</code> のブロックの <code>r</code> が1つの Journey::Route です。出力の配列は左から、名前（
            <code>r.name</code>）、HTTP メソッド（<code>r.verb</code>）、パスのパターン（<code>r.path.spec.to_s</code>）、<code>defaults</code>、<code>precedence</code>、
            <code>app</code> のクラス名です。初めの3つは、<code>bin/rails routes</code> の Prefix・Verb・URI Pattern の列と同じ値です。Controller#Action の列は、<code>defaults</code> の{' '}
            <code>controller</code> と <code>action</code> を <code>#</code> でつないだものに当たります。
          </p>
          <p>
            precedence が 8 から始まっているのは、development では Rails が <code>/rails/info</code> や <code>/rails/mailers</code> などの内部用ルート（<code>internal</code>
            ）を先頭に追加しているためです。コードの <code>next if r.internal</code> は、この内部用ルートを表示から除いています。production ではこれらが無く、<code>articles</code> の
            precedence は 1 でした。0 でないのは、ActionCable のエンジンが <code>/cable</code> の mount（internal）をどの環境でも先頭に追加するためです。
          </p>
          <p>
            <code>defaults</code> の <code>controller</code> と <code>action</code> が、どのコントローラーのどのアクションを呼ぶかを表します。<code>app</code> は、ルートが選ばれたときに <code>serve</code> を呼ばれるオブジェクトで、通常のルートでは{' '}
            <code>RouteSet::Dispatcher</code> です。
          </p>
        </>
      ),
    },
    {
      id: 'recognize',
      title: 'リクエストの認識',
      body: (
        <>
          <p>
            ミドルウェアの最後のエンドポイントは RouteSet でした（<ChapterLink n={6} />）。RouteSet の <code>call</code> は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/routing/route_set.rb（903〜907行目）"
            href={`${GH}/actionpack/lib/action_dispatch/routing/route_set.rb#L903-L907`}
            code={`
      def call(env)
        req = make_request(env)
        req.path_info = Journey::Router::Utils.normalize_path(req.path_info)
        @router.serve(req)
      end
`}
          />
          <p>
            <code>make_request(env)</code> は、env を <code>ActionDispatch::Request</code> のオブジェクトで包みます。<code>req.path_info</code> は env の <code>PATH_INFO</code>
            （要求のパス）を読み書きするメソッドです。<code>normalize_path</code> は、連続するスラッシュをまとめる、末尾のスラッシュを取り除くなどしてパスを正規化します。<code>@router</code> は <code>Journey::Router</code> です。
          </p>
          <p>
            Journey::Router の <code>serve</code> と、<code>serve</code> が呼ぶ <code>recognize</code> の前半は次のとおりです。<code>serve</code>{' '}
            では候補のルートを1つずつ試す形を、<code>recognize</code> では候補の絞り込み方を確かめます。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/journey/router.rb（30〜64行目）"
            href={`${GH}/actionpack/lib/action_dispatch/journey/router.rb#L30-L64`}
            code={`
      def serve(req)
        recognize(req) do |route, parameters|
          req.path_parameters = parameters
          req.route = route

          _, headers, _ = response = route.app.serve(req)

          return response unless headers[Constants::X_CASCADE] == "pass"
        end

        [404, { Constants::X_CASCADE => "pass" }, ["Not Found"]]
      end

      def recognize(req, &block)
        req_params  = req.path_parameters
        path_info   = req.path_info
        script_name = req.script_name

        routes = filter_routes(path_info)

        custom_routes.each { |r|
          routes << r if r.path.match?(path_info)
        }

        if req.head?
          routes = match_head_routes(routes, req)
        else
          routes.select! { |r| r.matches?(req) }
        end

        if routes.size > 1
          routes.sort! do |a, b|
            a.precedence <=> b.precedence
          end
        end
`}
          />
          <p>
            <code>serve</code> から読みます。
          </p>
          <ul>
            <li>
              <code>recognize(req) do |route, parameters| ... end</code>：<code>recognize</code> は、要求に合う候補のルートごとにこのブロックを呼びます。<code>route</code> は
              Journey::Route、<code>parameters</code> は <code>{'{controller: "articles", action: "show", id: "1"}'}</code> のようなハッシュです。
            </li>
            <li>
              <code>req.path_parameters = parameters</code> と <code>req.route = route</code>：選んだルートと、パスから取り出した値を要求のオブジェクトに保存します。
            </li>
            <li>
              <code>_, headers, _ = response = route.app.serve(req)</code>：右から読みます。<code>route.app.serve(req)</code> がルートの呼び出し先を実行し、ステータスコード、ヘッダー、本文の配列を返します。その配列を{' '}
              <code>response</code> に入れ、同時に2番目の要素を <code>headers</code> に取り出しています。<code>_</code> は、使わない値を受け取るための変数の名前です。
            </li>
            <li>
              <code>return response unless headers[Constants::X_CASCADE] == "pass"</code>：<code>Constants::X_CASCADE</code> は <code>"x-cascade"</code>{' '}
              という文字列の定数です。ブロックの中の <code>return</code> は <code>serve</code> メソッドから戻るので、ヘッダーの値が pass でなければ、応答を返して <code>serve</code>{' '}
              が終わります。pass なら何もせずにブロックが終わり、<code>recognize</code> が次の候補でブロックをもう一度呼びます。
            </li>
            <li>
              最後の <code>[404, ...]</code>：候補が1つも無かったときと、すべての候補が pass を返したときに、ここへ進みます。
            </li>
          </ul>
          <p>
            <code>recognize</code> は候補のルートを次の順で絞り込みます
            <Ref n={4} />。引用の初めの3行は、要求が持つ値を変数に取っておく行です。<code>path_info</code> はこの後の照合に使い、ほかの2つは 66 行目から後で使います。引用は <code>recognize</code>{' '}
            の途中までで、候補ごとにブロックを呼ぶ部分も 66 行目から後にあります。
          </p>
          <ol>
            <li>
              <code>filter_routes</code>：<code>simulator</code> の状態遷移表にパスを通し、パターンが合う通常のルートを取り出す。ルートを1つずつ正規表現で試すのではなく、全ルートをまとめた表を1回たどるだけで候補が求まる。
            </li>
            <li>
              <code>custom_routes</code> は1つずつ <code>match?</code> で試して候補に加える。
            </li>
            <li>
              <code>matches?</code> で HTTP メソッドや constraints を確かめる。HEAD のリクエストは、HEAD 用のルートが無ければ GET のルートで探す。
            </li>
            <li>precedence の小さい順（定義した順）に並べる。</li>
          </ol>
          <p>
            この後、各候補についてパスの正規表現で <code>:id</code> などの値を取り出し、<code>defaults</code> と合わせて <code>path_parameters</code> を作ります（同じファイルの 66〜99
            行目）。<code>serve</code> はそれを <code>req.path_parameters</code> に設定してから <code>route.app.serve(req)</code> を呼びます。<code>path_parameters</code>{' '}
            は env の <code>action_dispatch.request.path_parameters</code> に保存され、コントローラーの <code>params</code> の一部になります（<ChapterLink n={10} />）。
          </p>
          <p>
            デモのアプリケーションで <code>filter_routes</code> の結果を見ると、全21ルートのうち、<code>/articles/1</code> の候補は <code>article</code>（GET）だけ、<code>/articles</code>{' '}
            の候補は <code>articles</code>（GET）だけでした。<code>Rails.application.routes.recognize_path("/articles/1")</code> は <code>{'{controller: "articles", action: "show", id: "1"}'}</code> を返しました。<code>recognize_path</code>{' '}
            は RouteSet のメソッドで、同じ <code>recognize</code> を使ってパスに合うルートを探し、呼び出し先は実行せずに <code>path_parameters</code> に当たるハッシュだけを返します。
          </p>
          <p>
            図 9-4 は、<code>RouteSet#call</code> からルートの <code>app</code> の呼び出しまでを、上から処理の順に並べたものです。右の枠は、上の <code>filter_routes</code>{' '}
            の結果です。
          </p>
          <Figure n="9-4" title="リクエストの認識" caption="Rails 8.1.4.1 の route_set.rb と journey/router.rb を読んでまとめた図。右の数値はデモのアプリケーション（ルート21個）での実測。">
            <RecognizeFigure />
          </Figure>
          <p>
            応答の <code>x-cascade</code> ヘッダーが <code>pass</code> の場合、ルーティングはその応答を捨てて次の候補を試します。候補が尽きると、<code>x-cascade: pass</code>{' '}
            付きの 404 を返します。ミドルウェアの DebugExceptions はこの応答を見つけると <code>ActionController::RoutingError</code>（<code>No route matches [GET] "/..."</code>）を投げます（<code>debug_exceptions.rb</code> の 31〜36 行目）。この例外は同じ DebugExceptions の rescue で受け取られ、その後は環境で分かれます。詳しいエラーページを出す設定の development では、DebugExceptions が No route matches のエラーページを 404 で返します。production では例外をそのまま外へ投げ直し、外側の ShowExceptions が public/404.html の内容で 404 の応答を作ります（<ChapterLink n={10} section="exceptions" />）。「ルーティングが決めること」の節で DELETE の要求を送ったときのログの{' '}
            <code>No route matches [DELETE] "/articles/1"</code> は、この経路で出たものです。
          </p>
          <p>
            業務で <code>No route matches</code> のログを調べるときは、この節の絞り込みの順に確かめます。
          </p>
          <ol>
            <li>
              エラーの <code>[DELETE] "/articles/1"</code> の部分から、届いた要求のメソッドとパスを読む。フォームやリンクが意図したメソッドで送っているかは、ここで分かる。
            </li>
            <li>
              <code>bin/rails routes -g articles</code> で、そのパスに合う URI Pattern の行があるかを見る。行が無ければ、routes.rb にルートが無いか、<code>only:</code> で除かれている。
            </li>
            <li>
              パスが合う行があれば、その行の Verb を見る。パスが合っても Verb が違うルートは、<code>matches?</code> の段階で候補から外れる。デモのアプリケーションの <code>/articles/1</code>{' '}
              には GET の行だけがあり、DELETE の行が無いので 404 になった。
            </li>
            <li>
              Verb も合っているなら、ルートに <code>constraints</code> が付いていないかを見る。条件を満たさない要求はそのルートでは処理されず、候補から外れるか、<code>x-cascade: pass</code>{' '}
              で次の候補に回される。
            </li>
          </ol>
        </>
      ),
    },
    {
      id: 'order',
      title: 'ルートの順序',
      body: (
        <>
          <p>
            Rails ガイドは「ルートは定義した順に照合される」と説明しています
            <Ref n={5} />。前節の precedence による並べ替えがその実装です。順序が結果を変える例を、RouteSet を直接作って確かめました。<code>RouteSet.new</code> はアプリケーションのルートとは別に、空のルートの一覧を作ります。<code>recognize_path</code>{' '}
            はパスに合うルートを探し、controller・action とパスから取り出した値をハッシュで返すメソッドです。
          </p>
          <Code
            lang="ruby"
            code={`
t = ActionDispatch::Routing::RouteSet.new
t.draw do
  get "articles/:id" => "articles#show"
  get "articles/new" => "articles#new"
end
t.recognize_path("/articles/new")
# => {controller: "articles", action: "show", id: "new"}
`}
          />
          <p>
            <code>/articles/new</code> は両方のルートのパターンに合い、先に定義した <code>articles/:id</code> が選ばれました。<code>articles/new</code>{' '}
            を先に書くか、<code>:id</code> に制約を付けると、意図したルートになります。次の <code>constraints: {'{ id: /\\d+/ }'}</code> は、<code>:id</code>{' '}
            が数字のときだけルートを選ぶ条件です（<code>/\d+/</code> は、数字が1文字以上続くことを表す正規表現です）。
          </p>
          <Code
            lang="ruby"
            code={`
t2 = ActionDispatch::Routing::RouteSet.new
t2.draw do
  get "articles/:id" => "articles#show", constraints: { id: /\\d+/ }
  get "articles/new" => "articles#new"
end
t2.recognize_path("/articles/new")
# => {controller: "articles", action: "new"}
`}
          />
          <p>
            <code>resources</code> は <code>new</code> を <code>show</code> より先に登録するので、通常この問題は起きません。<code>resources</code> の後に <code>get "articles/search"</code>{' '}
            のようなルートを追加すると、<code>show</code> のルートが選ばれます。Rails ガイドの例も同じ状況です
            <Ref n={5} />。
          </p>
          <p>
            この状態で <code>GET /articles/search</code> を送ると、ログの <code>Processing by</code> の行は <code>ArticlesController#show</code> に、<code>Parameters</code> の行の{' '}
            <code>id</code> は <code>"search"</code> になります。show アクションの <code>Article.find(params[:id])</code> は記事を見つけられず、検索の画面の代わりに 404
            が返ります。ルートを足したのに別のアクションが動いているときは、ログのこの2行で、選ばれたルートを確かめられます。
          </p>
          <p>
            直すには、足すルートを <code>resources</code> より前に書くか、<code>resources :articles do get :search, on: :collection end</code> のように <code>resources</code>{' '}
            のブロックの中に書きます。「routes.rb の定義が登録されるまで」の節で見たとおり、<code>resources</code> は <code>yield if block_given?</code> でブロックを先に実行してから index や show
            を登録するので、ブロックの中のルートは show より前に登録されます。<code>bin/rails routes</code> は、ルートを登録された順（precedence の小さい順）に表示します。同じパスに合う行が2つあるときは、上の行のルートが選ばれます
            <Ref n={5} />。
          </p>
          <p>
            次の図は <code>GET /articles/search</code> を送ったときに選ばれるルートを、2つの書き方で比べたものです。左の列が search のルートを <code>resources</code> の後に書いた場合、右の列が <code>resources</code> のブロックの中に書いた場合です。どちらの列もルートを登録された順に上から並べています。
          </p>
          <Figure
            title="ルートを書く位置と選ばれるルート"
            caption="resources :articles のルートに、search のルートを1つ足した場合の模式図。パスの末尾の (.:format) は省略した。強調色の枠が選ばれるルート、破線の枠はパスとメソッドが合うが選ばれないルート。PATCH・PUT・DELETE の行もパスは合うが、メソッドが GET でないので候補から外れる。"
          >
            <OrderSearchFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'dispatch',
      title: 'コントローラーへの受け渡し',
      body: (
        <>
          <p>
            通常のルートの <code>app</code> である Dispatcher は、<code>path_parameters</code> からコントローラーのクラスを求め、そのクラスに処理を渡します。Journey::Router の{' '}
            <code>serve</code> が <code>route.app.serve(req)</code> で呼んでいたのが、次の <code>serve</code> です。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/routing/route_set.rb（46〜66行目）"
            href={`${GH}/actionpack/lib/action_dispatch/routing/route_set.rb#L46-L66`}
            code={`
        def serve(req)
          params     = req.path_parameters
          controller = controller req
          res        = controller.make_response! req
          dispatch(controller, params[:action], req, res)
        rescue ActionController::RoutingError
          if @raise_on_name_error
            raise
          else
            [404, { Constants::X_CASCADE => "pass" }, []]
          end
        end

        private
          def controller(req)
            req.controller_class
          end

          def dispatch(controller, action, req, res)
            controller.dispatch(action, req, res)
          end
`}
          />
          <ul>
            <li>
              <code>params = req.path_parameters</code>：前の節で Journey::Router が要求に設定した <code>{'{controller: "articles", action: "show", id: "1"}'}</code> のようなハッシュです。
            </li>
            <li>
              <code>controller = controller req</code>：左辺の <code>controller</code> はローカル変数、右辺の <code>controller req</code> は下の private メソッド{' '}
              <code>controller(req)</code> の呼び出しです（引数の括弧を省いています）。メソッドは <code>req.controller_class</code> を返すので、変数には ArticlesController
              のクラスが入ります。
            </li>
            <li>
              <code>res = controller.make_response! req</code>：応答のオブジェクトを作ります。
            </li>
            <li>
              <code>dispatch(controller, params[:action], req, res)</code>：下の private メソッド <code>dispatch</code> を通して、<code>ArticlesController.dispatch("show", req, res)</code>{' '}
              を呼びます。
            </li>
            <li>
              <code>rescue ActionController::RoutingError</code> から後：上の4行の途中でこの例外が起きたときの処理です。<code>@raise_on_name_error</code> が true なら例外をそのまま上げ、false なら{' '}
              <code>x-cascade: pass</code> の 404 を返して、ルーティングに次の候補を試させます。<code>"articles#show"</code> や <code>resources</code>{' '}
              のようにコントローラーが決まっているルートでは true です（Mapping が <code>defaults.key?(:controller)</code> の結果を渡します。<code>mapper.rb</code> の 290〜300 行目）。
            </li>
          </ul>
          <p>
            <code>req.controller_class</code> は、<code>"articles"</code> を <code>"ArticlesController"</code> に変換して <code>constantize</code>{' '}
            します（<code>action_dispatch/http/request.rb</code> の 87〜105 行目）。ここで初めて ArticlesController が参照されるので、development ではこの時点で Zeitwerk（オートロードを受け持つ gem）が{' '}
            <code>app/controllers/articles_controller.rb</code> を読み込みます（<ChapterLink n={8} />）。<code>make_response!</code> で応答のオブジェクトを作り、クラスメソッドの{' '}
            <code>dispatch</code> にアクション名、リクエスト、応答を渡します。ここから先は<ChapterLink n={10} />で扱います
            <Ref n={2} />。
          </p>
          <p>
            ルートを登録するとき、Rails はコントローラーのクラスを参照しません。Journey::Route が持つのは <code>"articles"</code> という文字列です。そのため、
            <code>app/controllers/articles_controller.rb</code> が無くても <code>bin/rails routes</code> にはルートが表示され、要求が届いて <code>controller_class</code> が{' '}
            <code>constantize</code> を呼んだ時点で初めて例外になります。例外のクラスは <code>ActionDispatch::MissingController</code> で、メッセージには <code>constantize</code>{' '}
            が出した NameError のメッセージ（<code>uninitialized constant ArticlesController</code>）がそのまま入ります（<code>request.rb</code> の 97〜101 行目）。
            <code>bin/rails routes</code> にルートがあるのに要求がこの例外で失敗するときは、コントローラーのファイルがあるかと、ファイルの名前がルートの controller の名前に合っているか（<code>"articles"</code> なら{' '}
            <code>articles_controller.rb</code>）を確かめます。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2.4 の Dispatcher は、<code>controller</code> の中で NameError を rescue して <code>ActionController::RoutingError</code> に変えていたので、存在しないコントローラーを指すルートは
              404 になりました
              <Ref n={6} />。Rails 8.1 ではこの rescue が無くなり、<code>ActionDispatch::MissingController</code>（NameError のサブクラス）がそのまま上がって 500 になります。CHANGELOG（バージョンごとの変更点をまとめたファイル）
              は「コントローラーが無いのはルーティングの誤りではなくプログラムの誤りなので 500 にする」と説明しています
              <Ref n={7} />。同じ CHANGELOG によると、ルートの <code>:controller</code>・<code>:action</code> を動的なセグメントにする書き方（<code>get ":controller/:action"</code> のように、パスの値でコントローラーやアクションを決める書き方）は非推奨になっています。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'url-generation',
      title: 'URL ヘルパーの定義',
      body: (
        <>
          <p>
            名前（<code>as</code>）を持つルートを<Term en="named route">名前付きルート</Term>と呼びます。名前付きルートを登録すると、<code>NamedRouteCollection#add</code> が <code>article_path</code> と <code>article_url</code> を定義します。「routes.rb の定義が登録されるまで」の節で見た RouteSet の{' '}
            <code>named_routes[name] = route</code> が、この <code>add</code> の呼び出しです（<code>named_routes</code> は NamedRouteCollection のインスタンスで、<code>[]=</code> は{' '}
            <code>add</code> の別名です）。次の引用では、1つの名前から2つのメソッドがどこに定義されるかを確かめます。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/routing/route_set.rb（118〜135行目）"
            href={`${GH}/actionpack/lib/action_dispatch/routing/route_set.rb#L118-L135`}
            code={`
        def add(name, route)
          key       = name.to_sym
          path_name = :"#{name}_path"
          url_name  = :"#{name}_url"

          if routes.key? key
            @path_helpers_module.undef_method path_name
            @url_helpers_module.undef_method url_name
          end
          routes[key] = route

          helper = UrlHelper.create(route, route.defaults, name)
          define_url_helper @path_helpers_module, path_name, helper, PATH
          define_url_helper @url_helpers_module, url_name, helper, UNKNOWN

          @path_helpers << path_name
          @url_helpers << url_name
        end
`}
          />
          <ul>
            <li>
              初めの3行：<code>name</code> が <code>"article"</code> のとき、<code>key</code> は <code>:article</code>、<code>path_name</code> は <code>:article_path</code>、
              <code>url_name</code> は <code>:article_url</code> になります。<code>{':"#{name}_path"'}</code> は、文字列に値を埋め込んでからシンボルにする書き方です。
            </li>
            <li>
              <code>if routes.key? key</code> の3行：同じ名前が既に登録されていれば、前に定義したメソッドを <code>undef_method</code> で取り除きます。
            </li>
            <li>
              <code>routes[key] = route</code>：名前から Journey::Route を引けるように、ハッシュに保存します。
            </li>
            <li>
              <code>helper = UrlHelper.create(route, route.defaults, name)</code>：ルートのパターンに値を当てはめてパスを作る処理を持つオブジェクトを作ります。
            </li>
            <li>
              <code>define_url_helper</code> の2行：引数は、定義先のモジュール、メソッドの名前、上の <code>helper</code>、結果の組み立て方の4つです。<code>PATH</code> はパスだけを返す
              lambda、<code>UNKNOWN</code> はホスト名を含む URL を返す lambda で、同じファイルの 349〜350 行目に定数として定義されています。<code>article_path</code> と{' '}
              <code>article_url</code> は同じ <code>helper</code> を使い、最後の組み立て方だけが違います。
            </li>
            <li>
              最後の2行：定義したメソッドの名前を記録します。
            </li>
          </ul>
          <p>
            <code>define_url_helper</code> は、無名のモジュール（<code>@path_helpers_module</code> など）に <code>define_method</code>（<ChapterLink n={5} />
            ）でメソッドを定義します（同じファイルの 333〜345 行目）。定義されたメソッドは、最後の引数がハッシュならオプションとして取り出し、<code>UrlHelper</code>{' '}
            に処理を任せます。ルートに正規表現の制約もグロブ（<code>*path</code>。パスの残りを <code>/</code> も含めてまとめて受け取る書き方）も無ければ、<code>OptimizedUrlHelper</code>{' '}
            が使われ、必要な部分（<code>:id</code>）に引数を当てはめるだけでパスを作ります
            <Ref n={2} />。
          </p>
          <Code
            lang="ruby"
            code={`
include Rails.application.routes.url_helpers
article_path(1)            # => "/articles/1"
articles_path(page: 2)     # => "/articles?page=2"
Rails.application.routes.named_routes.path_helpers_module.instance_method(:article_path).owner
# => #<Module:0x00007f068edaf480>（無名のモジュール）
`}
          />
          <p>
            1行目の <code>include</code> で、コントローラーやビューの外でも URL ヘルパーを呼べるようにしています。4行目は、<code>path_helpers_module</code> から{' '}
            <code>article_path</code> のメソッドを取り出し、<code>owner</code> でそのメソッドが定義されているモジュールを表示しています。結果は名前の無いモジュールで、
            <code>add</code> が <code>@path_helpers_module</code> に定義したことを確かめられます。図 9-5 は、左上の <code>named_routes</code>{' '}
            への登録から、2つのモジュールへのメソッドの定義、コントローラーとビューへの include までを、矢印の順に示しています。
          </p>
          <Figure n="9-5" title="名前付きルートとヘルパーメソッド" caption="模式図。コントローラーとビューには、routes.url_helpers を通してヘルパーのモジュールが include される。">
            <HelperFigure />
          </Figure>
          <p>
            <code>article_path(@article)</code> のようにモデルを渡せるのは、引数に <code>to_param</code> を呼んで <code>:id</code> の値にするためです。ActiveRecord の{' '}
            <code>to_param</code> は既定で主キーの値を文字列にして返します。
          </p>
          <p>この節の内容は、業務では次の3つの場面で使います。</p>
          <ul>
            <li>
              モデルやジョブなど、コントローラーとビュー以外のクラスで <code>article_path(1)</code> と書くと NoMethodError になります。ヘルパーのモジュールが include
              されていないためです。上の例のように <code>Rails.application.routes.url_helpers</code> を include するか、<code>Rails.application.routes.url_helpers.article_path(1)</code>{' '}
              と書きます。
            </li>
            <li>
              <code>article_path(@article)</code> の <code>@article</code> が nil のときは、<code>ActionController::UrlGenerationError</code> になります。メッセージは{' '}
              <code>No route matches</code> で始まり、<code>missing required keys: [:id]</code> で終わります（同じファイルの 258〜268 行目）。要求に合うルートが無いときの{' '}
              <code>ActionController::RoutingError</code> と書き出しが同じですが、こちらは URL を作るときに <code>:id</code> に入れる値が無かったことを表します。この例外が出たときは、初めにヘルパーに渡した値が nil でないかを確かめます。
            </li>
            <li>
              <code>article_url</code> はホスト名を必要とします。コントローラーとビューでは、処理中の要求のホスト名が使われます。メーラーやジョブには要求が無いので、ホスト名を設定していないと{' '}
              <code>Missing host to link to!</code> で始まる ArgumentError になります（<code>action_dispatch/http/url.rb</code> の 162〜164 行目）。メッセージに書かれているとおり、
              <code>default_url_options[:host]</code> を設定するか、<code>host:</code> を引数で渡します。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'mount',
      title: 'Rack アプリのマウントと制約',
      body: (
        <>
          <p>
            ルートの <code>app</code> は Dispatcher に限りません。Mapping はルートの指定に応じて <code>app</code> を選びます。次の引用では、routes.rb の <code>to:</code> と{' '}
            <code>constraints</code> の書き方によって、Journey::Router が <code>serve</code> を呼ぶ相手がどう変わるかを確かめます。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/routing/mapper.rb（290〜300行目）"
            href={`${GH}/actionpack/lib/action_dispatch/routing/mapper.rb#L290-L300`}
            code={`
          def app(blocks)
            if to.respond_to?(:action)
              Routing::RouteSet::StaticDispatcher.new to
            elsif to.respond_to?(:call)
              Constraints.new(to, blocks, Constraints::CALL)
            elsif blocks.any?
              Constraints.new(dispatcher(defaults.key?(:controller)), blocks, Constraints::SERVE)
            else
              dispatcher(defaults.key?(:controller))
            end
          end
`}
          />
          <p>
            <code>to</code> は routes.rb の <code>to:</code> に渡した値、<code>respond_to?(:action)</code> は「action というメソッドを持っているか」を調べる呼び出しです。4つの分岐は、上から次の場合に当たります。
          </p>
          <ol>
            <li>
              <code>to:</code> にコントローラーのクラスそのものを渡した場合。<code>StaticDispatcher</code> は Dispatcher のサブクラスで、名前からクラスを探す代わりに、渡されたクラスを使います（
              <code>route_set.rb</code> の 69〜77 行目）。
            </li>
            <li>
              <code>to:</code> に lambda などの Rack アプリを渡した場合。<code>Constraints::CALL</code> は「内側のオブジェクトの <code>call(env)</code> を呼ぶ」という指定です。
            </li>
            <li>
              <code>"articles#show"</code> のような通常の指定に、ラムダやオブジェクトの <code>constraints</code> を付けた場合。<code>Constraints::SERVE</code> は「内側の Dispatcher の{' '}
              <code>serve(req)</code> を呼ぶ」という指定です。
            </li>
            <li>それ以外の場合。「コントローラーへの受け渡し」の節で見た Dispatcher をそのまま使います。</li>
          </ol>
          <p>
            <code>to:</code> に <code>call</code> を持つオブジェクト（Rack アプリ）を渡すと、そのオブジェクトの <code>call</code> を呼ぶ Constraints になります。<code>blocks</code>{' '}
            は <code>constraints</code> に渡したラムダやオブジェクトで、これがあると、条件を満たしたときだけ内側を呼ぶ Constraints で包まれます。条件を満たさないとき、Constraints は{' '}
            <code>x-cascade: pass</code> の 404 を返すので、ルーティングは次の候補を試します
            <Ref n={1} />。
          </p>
          <p>
            <code>mount</code> は、パスの先頭部分が一致したリクエストを Rack アプリに渡す書き方です。Sidekiq の管理画面（<code>mount Sidekiq::Web =&gt; "/sidekiq"</code>）や Engine はこの方法で接続します。mount
            したルートはパスの先頭が一致すればよいので <code>custom_routes</code> に入ります。動きを確かめるため、受け取った <code>SCRIPT_NAME</code> と <code>PATH_INFO</code>{' '}
            を返す lambda を mount しました。
          </p>
          <Code
            lang="ruby"
            code={`
t3 = ActionDispatch::Routing::RouteSet.new
t3.draw do
  mount ->(env) { [200, { "content-type" => "text/plain" },
                   ["SCRIPT_NAME=#{env["SCRIPT_NAME"]} PATH_INFO=#{env["PATH_INFO"]}"]] }, at: "/status"
end
res = Rack::MockRequest.new(t3).get("/status/db/ping")
[res.status, res.body]  # => [200, "SCRIPT_NAME=/status PATH_INFO=/db/ping"]
res = Rack::MockRequest.new(t3).get("/nothing")
[res.status, res.headers.to_h, res.body]  # => [404, {"x-cascade" => "pass"}, "Not Found"]
[t3.routes.anchored_routes.size, t3.routes.custom_routes.size]  # => [0, 1]
`}
          />
          <p>結果は3つあります。</p>
          <ul>
            <li>
              <code>/status/db/ping</code> への GET は 200 になり、lambda が受け取った <code>SCRIPT_NAME</code> は <code>/status</code>、<code>PATH_INFO</code> は{' '}
              <code>/db/ping</code> でした。要求のパスが、mount の <code>at:</code> に書いた部分と残りに分かれています（図 9-6）。
            </li>
            <li>
              <code>/nothing</code> への GET は、<code>/status</code> で始まらないので lambda は呼ばれません。<code>x-cascade: pass</code> の付いた 404 は、Journey::Router の{' '}
              <code>serve</code> の最後の行が返したものです。<code>t3</code> は RouteSet を直接呼んでいて、外側に DebugExceptions が無いので、この応答がそのまま見えています。
            </li>
            <li>
              最後の行は、mount したルートが <code>anchored_routes</code> に 0 個、<code>custom_routes</code> に 1 個入っていることを示します。mount
              したルートは状態遷移表を使わず、<code>recognize</code> の中で1つずつ <code>match?</code> で試されます。
            </li>
          </ul>
          <Figure n="9-6" title="mount による SCRIPT_NAME と PATH_INFO の分割" caption="上の実行結果を図にしたもの。Journey::Router#recognize が、パターンの先頭だけが一致するルートについてこの分割を行う。">
            <MountFigure />
          </Figure>
          <p>
            Journey::Router は、先頭だけ一致するルートを呼ぶ前に、一致した部分を <code>SCRIPT_NAME</code> に足し、残りを <code>PATH_INFO</code> にします。戻った後は元の値に戻します（
            <code>router.rb</code> の 85〜96 行目）
            <Ref n={4} />。<ChapterLink n={6} />で見た Rack の取り決めのとおり、マウントされたアプリは <code>PATH_INFO</code>{' '}
            だけを見れば自分の中のルーティングができ、URL を作るときは <code>SCRIPT_NAME</code> を前に付ければよいことになります。
          </p>
          <p>
            mount に <code>constraints</code> を付けたルートを調べるときは、この節の初めに見た Constraints の動作を使います。管理者だけに見せる画面を{' '}
            <code>{'mount Sidekiq::Web => "/sidekiq", constraints: ->(req) { ... }'}</code> のように書くと、条件を満たさない要求には Constraints が <code>x-cascade: pass</code> の 404
            を返します。ほかに合うルートが無ければ、ログは <code>No route matches [GET] "/sidekiq"</code> になり、ルートを書いていないときと同じ表示になります。mount
            した画面でこのログが出たときは、<code>bin/rails routes</code> でルートがあることを確かめたうえで、<code>constraints</code> の条件を満たす要求だったかを確かめます。
          </p>
          <Callout kind="note">
            <p>
              Nginx の <code>location /app/</code> のようなサブパスで Rails を動かす場合も、同じ <code>SCRIPT_NAME</code> の考え方を使います。前段の設定は<ChapterLink n={24} />で扱います。
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
          <li>HTTP の要求は、メソッド（GET・POST・PATCH・DELETE など）とパスを持ちます。同じパスでも、メソッドが違えば別の要求です。</li>
          <li>ルーティングは、メソッドとパスが合うルートを探し、ルートに書いたコントローラーのアクションを呼びます。合うルートが無ければ 404 になります。パスの :id などに当たる値とクエリ文字列は、params に文字列で入ります。</li>
          <li>resources は index・show・new・create・edit・update・destroy の7つのアクションへのルートを作ります。only で一部に絞り、ブロックの中に書くと入れ子になります。登録されたルートは bin/rails routes で確かめられます。</li>
          <li>名前の付いたルートには article_path・article_url のような URL ヘルパーができ、ビューのリンクなどでパスを作るのに使います。</li>
          <li>routes.rb のブロックは Mapper を self として実行され、resources などは個々のルートに展開されて、Mapper#add_route から RouteSet#add_route に渡されます。</li>
          <li>Journey::Route は、パターン、HTTP メソッドなどの条件、defaults（controller と action）、登録順の precedence、呼び出し先の app を持ちます。</li>
          <li>ルーティングでは、全ルートをまとめた状態遷移表でリクエストに合う候補を絞り、条件を確かめ、precedence の順に試します。x-cascade: pass なら次の候補へ進みます。</li>
          <li>ルートは定義した順に照合されるので、広いパターンのルートを先に書くと後のルートが選ばれなくなります。</li>
          <li>Dispatcher は controller の名前からクラスを constantize し、クラスメソッドの dispatch を呼びます。</li>
          <li>名前付きルートを登録すると、無名のモジュールに _path と _url のメソッドが define_method で定義されます。</li>
          <li>mount した Rack アプリには、一致した部分が SCRIPT_NAME、残りが PATH_INFO として渡されます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'actionpack/lib/action_dispatch/routing/mapper.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/routing/mapper.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'resources の展開、Mapper#add_route、Mapping#make_route と app、Constraints。' },
    { title: 'actionpack/lib/action_dispatch/routing/route_set.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/routing/route_set.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'RouteSet#add_route・call、Dispatcher、NamedRouteCollection と UrlHelper、define_url_helper。' },
    { title: 'actionpack/lib/action_dispatch/journey/routes.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/journey/routes.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Journey::Routes#add_route、precedence、anchored_routes と custom_routes、simulator。' },
    { title: 'actionpack/lib/action_dispatch/journey/router.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/journey/router.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'serve と recognize（候補の絞り込み、precedence での並べ替え、パラメーターの取り出し、SCRIPT_NAME と PATH_INFO の分割）。' },
    { title: 'Rails Routing from the Outside In', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/routing.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'ルートは定義した順に照合されること（resources の後の get の例）。' },
    { title: 'actionpack/lib/action_dispatch/routing/route_set.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/actionpack/lib/action_dispatch/routing/route_set.rb', accessed: '2026-11-11', version: 'Rails 7.2.4', note: '7.2 の Dispatcher が NameError を RoutingError に変えていたこと（8.1.4.1 との差分で確認）。' },
    { title: 'actionpack/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/CHANGELOG.md`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '8.1.0 の「存在しないコントローラーを指すルートは 404 ではなく 500」と、動的な :controller セグメントの非推奨。' },
    { title: 'What is a URL?', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL', accessed: '2026-11-16', note: 'URL のスキーム、ホスト、ポート、パス、クエリ文字列（パラメーター）。' },
    { title: 'HTTP request methods', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods', accessed: '2026-11-16', note: 'GET・POST・PUT・PATCH・DELETE の意味。' },
    { title: 'Action View Form Helpers', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/form_helpers.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'HTML のフォームは GET と POST しか送れないので、Rails は _method という隠れた入力欄で PATCH・PUT・DELETE を表すこと。' },
    { title: "Rails Routing from the Outside In", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/routing.html", accessed: "2026-11-20", version: "Rails 8.1", note: "リソース、名前空間、条件、ネストと URL ヘルパー。" },
  ],
}

export default withExplanations(ch09, explanation09)
