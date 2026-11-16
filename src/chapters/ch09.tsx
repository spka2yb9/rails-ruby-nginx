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

const ch09: Chapter = {
  number: 9,
  part: 2,
  title: 'ルーティング',
  summary:
    'URL のパスと HTTP のメソッドから、どのコントローラーのどのアクションを呼ぶかを決めるルーティングの役割と、routes.rb の get・resources の書き方、bin/rails routes の読み方、パスの :id が params に入ること、URL ヘルパーの使い方を確かめます。そのうえで、routes.rb の定義が Journey::Route のオブジェクトになるまでと、リクエストのパスから候補のルートを絞り込んでコントローラーに渡すまでを、ActionDispatch のソースで追います。ルートの順序、URL ヘルパーの定義、Rack アプリのマウントの仕組みも扱います。',
  goals: [
    'URL のパスと HTTP のメソッドから、ルーティングが呼ぶアクションを決めることと、パスの :id が params に入ることを説明できる',
    'resources が作る7つのルートを bin/rails routes で確かめ、only や入れ子、article_path などの URL ヘルパーを使える',
    'resources などの DSL が Mapper から Journey::Route の登録までどう進むかを説明できる',
    'Journey::Route が持つ情報（パターン、条件、defaults、precedence、app）を説明できる',
    'リクエストを受けたルーティングが候補を絞り込み、パラメーターを取り出して app を呼ぶ流れを説明できる',
    'ルートの定義順が結果を変える理由と、制約による回避を説明できる',
    'article_path のような URL ヘルパーが定義される仕組みを理解する',
    'mount したアプリに SCRIPT_NAME と PATH_INFO がどう渡るかを説明できる',
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
            は状態コードで、要求の結果を3桁の数字で表します。200 は成功、404 は求められた情報が見つからないことを表します。応答のヘッダーの後には、空の行をはさんで本文（ここでは記事のページの HTML）が続きます。
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
            <code>/articles/1/comments/new</code> を認識させると <code>{'{controller: "comments", action: "new", article_id: "1"}'}</code> になりました。Rails ガイドは入れ子を1段までにすることを勧めています
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
      id: 'dsl',
      title: 'routes.rb の定義が登録されるまで',
      body: (
        <>
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
            1663〜1694 行目）。最終的に、1つのルートごとに次の <code>add_route</code> が呼ばれます。
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
            <Ref n={1} />。RouteSet の側は次のとおりです。
          </p>
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
          <p>
            <code>@set</code> は <code>Journey::Routes</code> のインスタンスで、ルートの配列を持ちます。名前（<code>as</code>）が付いたルートは <code>named_routes</code>{' '}
            にも登録され、ここで URL ヘルパーが定義されます（後述）。同じ名前を2回使うと、この時点で例外になります
            <Ref n={2} />。
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
            <Term>Journey</Term> は ActionDispatch の中にあるルーティングの実装です。<code>Journey::Routes#add_route</code> は Mapping から <code>Journey::Route</code> を作り、配列に追加します。
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
            precedence が 8 から始まっているのは、development では Rails が <code>/rails/info</code> や <code>/rails/mailers</code> などの内部用ルート（<code>internal</code>
            ）を先頭に追加しているためです（production ではこれらが無く、<code>articles</code> の precedence は 1 でした。0 でないのは、ActionCable のエンジンが <code>/cable</code> の mount（internal）をどの環境でも先頭に追加するためです）。<code>defaults</code> の <code>controller</code> と{' '}
            <code>action</code> が、どのコントローラーのどのアクションを呼ぶかを表します。<code>app</code> は、ルートが選ばれたときに <code>serve</code> を呼ばれるオブジェクトで、通常のルートでは{' '}
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
            <code>normalize_path</code> は、連続するスラッシュをまとめる、末尾のスラッシュを取り除くなどしてパスを正規化します。<code>@router</code> は <code>Journey::Router</code> です。
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
            <code>recognize</code> は候補のルートを次の順で絞り込みます
            <Ref n={4} />。
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
            の候補は <code>articles</code>（GET）だけでした。<code>recognize_path("/articles/1")</code> は <code>{'{controller: "articles", action: "show", id: "1"}'}</code> を返しました。
          </p>
          <Figure n="9-4" title="リクエストの認識" caption="Rails 8.1.4.1 の route_set.rb と journey/router.rb を読んでまとめた図。右の数値はデモのアプリケーション（ルート21個）での実測。">
            <RecognizeFigure />
          </Figure>
          <p>
            応答の <code>x-cascade</code> ヘッダーが <code>pass</code> の場合、ルーティングはその応答を捨てて次の候補を試します。候補が尽きると、<code>x-cascade: pass</code>{' '}
            付きの 404 を返します。ミドルウェアの DebugExceptions はこの応答を見つけると <code>ActionController::RoutingError</code>（<code>No route matches [GET] "/..."</code>）を投げ、外側の ShowExceptions がそれを 404 の応答に変えます（<code>debug_exceptions.rb</code> の 31〜36 行目。<ChapterLink n={10} />）。
          </p>
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
        </>
      ),
    },
    {
      id: 'dispatch',
      title: 'コントローラーへの受け渡し',
      body: (
        <>
          <p>
            通常のルートの <code>app</code> である Dispatcher は、<code>path_parameters</code> からコントローラーのクラスを求め、そのクラスに処理を渡します。
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
          <p>
            <code>req.controller_class</code> は、<code>"articles"</code> を <code>"ArticlesController"</code> に変換して <code>constantize</code>{' '}
            します（<code>action_dispatch/http/request.rb</code> の 87〜105 行目）。ここで初めて ArticlesController が参照されるので、development ではこの時点で Zeitwerk が{' '}
            <code>app/controllers/articles_controller.rb</code> を読み込みます（<ChapterLink n={8} />）。<code>make_response!</code> で応答のオブジェクトを作り、クラスメソッドの{' '}
            <code>dispatch</code> にアクション名、リクエスト、応答を渡します。ここから先は<ChapterLink n={10} />で扱います
            <Ref n={2} />。
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
            名前（<code>as</code>）を持つルートを<Term en="named route">名前付きルート</Term>と呼びます。名前付きルートを登録すると、<code>NamedRouteCollection#add</code> が <code>article_path</code> と <code>article_url</code> を定義します。
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
          <Figure n="9-5" title="名前付きルートとヘルパーメソッド" caption="模式図。コントローラーとビューには、routes.url_helpers を通してヘルパーのモジュールが include される。">
            <HelperFigure />
          </Figure>
          <p>
            <code>article_path(@article)</code> のようにモデルを渡せるのは、引数に <code>to_param</code> を呼んで <code>:id</code> の値にするためです。ActiveRecord の{' '}
            <code>to_param</code> は既定で主キーの値を文字列にして返します。
          </p>
        </>
      ),
    },
    {
      id: 'mount',
      title: 'Rack アプリのマウントと制約',
      body: (
        <>
          <p>
            ルートの <code>app</code> は Dispatcher に限りません。Mapping はルートの指定に応じて <code>app</code> を選びます。
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
          <Figure n="9-6" title="mount による SCRIPT_NAME と PATH_INFO の分割" caption="上の実行結果を図にしたもの。Journey::Router#recognize が、パターンの先頭だけが一致するルートについてこの分割を行う。">
            <MountFigure />
          </Figure>
          <p>
            Journey::Router は、先頭だけ一致するルートを呼ぶ前に、一致した部分を <code>SCRIPT_NAME</code> に足し、残りを <code>PATH_INFO</code> にします。戻った後は元の値に戻します（
            <code>router.rb</code> の 85〜96 行目）
            <Ref n={4} />。<ChapterLink n={6} />で見た Rack の取り決めのとおり、マウントされたアプリは <code>PATH_INFO</code>{' '}
            だけを見れば自分の中のルーティングができ、URL を作るときは <code>SCRIPT_NAME</code> を前に付ければよいことになります。
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
  ],
}

export default withExplanations(ch09, explanation09)
