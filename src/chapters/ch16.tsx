import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation16 } from '../explanations/features'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 16-3 render から出力まで ---------- */
function FlowFigure() {
  const left = [
    { t: 'ArticlesController#show', s: 'アクションの後の暗黙の render', fill: 'box' as const },
    { t: 'render_to_body', s: 'ActionView::Rendering', fill: 'box2' as const },
    { t: 'view_context', s: 'ビューのクラスを new し、@変数をコピー', fill: 'box' as const },
    { t: 'TemplateRenderer#render', s: 'テンプレートを決めて描画を指示', fill: 'box' as const },
    { t: 'LookupContext#find_template', s: '名前と条件からファイルを探す', fill: 'box' as const },
  ]
  const right = [
    { t: 'Template#render', s: '初回だけ compile! でメソッドを定義', fill: 'box' as const },
    { t: 'ビューの _run', s: 'コンパイル済みのメソッドを呼ぶ', fill: 'box' as const },
    { t: 'OutputBuffer', s: '出力を足していき、本文の文字列になる', fill: 'box4' as const },
    { t: 'レイアウトの描画', s: 'yield の位置に本文を入れる', fill: 'box' as const },
    { t: 'レスポンスの本文', s: 'response_body に入る', fill: 'box5' as const },
  ]
  const bh = 46
  const gap = 14
  return (
    <Svg
      id="16-3"
      w={760}
      h={5 * (bh + gap) + 20}
      label="アクションが終わると、ActionView::Rendering の render_to_body が呼ばれる。view_context でビューのクラスのインスタンスが作られ、コントローラーのインスタンス変数がコピーされる。TemplateRenderer が LookupContext でテンプレートのファイルを探し、Template#render が初回だけテンプレートをコンパイルしてメソッドを定義する。ビューの _run がそのメソッドを呼び、OutputBuffer に出力が足されていく。最後にレイアウトが描画され、yield の位置に本文が入り、レスポンスの本文になる"
    >
      {left.map((b, i) => {
        const y = 12 + i * (bh + gap)
        return (
          <g key={b.t}>
            <Box x={20} y={y} w={340} h={bh} lines={[b.t, b.s]} mono={false} fs={12.5} fill={b.fill} subTone="muted" />
            {i < left.length - 1 && <Arrow x1={190} y1={y + bh} x2={190} y2={y + bh + gap} />}
          </g>
        )
      })}
      <Arrow d={`M360,${12 + 4 * (bh + gap) + bh / 2} L380,${12 + 4 * (bh + gap) + bh / 2} L380,${12 + bh / 2} L398,${12 + bh / 2}`} />
      {right.map((b, i) => {
        const y = 12 + i * (bh + gap)
        return (
          <g key={b.t}>
            <Box x={400} y={y} w={340} h={bh} lines={[b.t, b.s]} fs={12.5} fill={b.fill} subTone="muted" />
            {i < right.length - 1 && <Arrow x1={570} y1={y + bh} x2={570} y2={y + bh + gap} />}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 16-4 ファイル名と探索の条件 ---------- */
function LookupFigure() {
  const parts = [
    { t: 'show', s: 'アクション名', x: 60, w: 90 },
    { t: '.html', s: '形式（formats）', x: 160, w: 110 },
    { t: '+phone', s: '派生（variants）', x: 280, w: 120 },
    { t: '.erb', s: 'ハンドラー（handlers）', x: 410, w: 150 },
  ]
  const rows = [
    { req: 'formats: [:html]', res: 'show.html.erb' },
    { req: 'formats: [:html], variants: [:phone]', res: 'show.html+phone.erb → show.html.erb' },
    { req: 'formats: [:text]', res: 'show.text.erb' },
    { req: 'formats: [:json]', res: '見つからない（406 / MissingTemplate）' },
  ]
  return (
    <Svg
      id="16-4"
      w={760}
      h={330}
      label="テンプレートのファイル名 show.html+phone.erb は、アクション名 show、形式 html、派生 phone、ハンドラー erb に分解される。言語（locale）は形式の前に入れられる。探索の条件が formats: [:html] なら show.html.erb、variants: [:phone] を加えると show.html+phone.erb と show.html.erb がこの順に見つかる。formats: [:text] なら show.text.erb、formats: [:json] ならファイルが無く見つからない"
    >
      <T x={20} y={22} bold>
        app/views/articles/show.html+phone.erb の分解
      </T>
      {parts.map((p) => (
        <g key={p.t}>
          <Box x={p.x} y={40} w={p.w} h={36} lines={p.t} mono fs={15} fill={p.t === '+phone' ? 'box5' : 'box'} />
          <T x={p.x + p.w / 2} y={92} anchor="middle" fs={11.5} tone="muted">
            {p.s}
          </T>
        </g>
      ))}
      <T x={580} y={58} fs={11.5} tone="muted">
        言語は .ja のように
      </T>
      <T x={580} y={76} fs={11.5} tone="muted">
        形式の前に入る
      </T>
      <T x={20} y={130} bold>
        探索の条件と見つかるファイル（実測）
      </T>
      {rows.map((r, i) => {
        const y = 146 + i * 44
        return (
          <g key={r.req}>
            <Box x={20} y={y} w={320} h={34} lines={r.req} mono fs={11.5} fill="box2" align="start" />
            <Arrow x1={340} y1={y + 17} x2={376} y2={y + 17} />
            <Box x={378} y={y} w={362} h={34} lines={r.res} mono fs={11.5} fill={i === 3 ? 'bg' : 'box4'} align="start" />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 16-5 ERB がメソッドになるまで ---------- */
function CompileFigure() {
  return (
    <Svg
      id="16-5"
      w={760}
      h={300}
      label="テンプレート _article.html.erb の本文は、ERB ハンドラー（Erubi）で Ruby のコードに変換される。HTML の部分は @output_buffer.safe_append=、<%= %> の部分は @output_buffer.append= になる。Template が def でメソッドの定義に包み、ビューのクラスが共有する無名のクラスに module_eval で定義する。2回目以降の描画はこのメソッドを呼ぶだけになる"
    >
      <Box x={20} y={20} w={230} h={100} lines={['_article.html.erb', '<li id="<%= dom_id(article) %>">', '<%= article.title %></li>']} mono fs={11} fill="box4" subTone="muted" />
      <Arrow x1={250} y1={70} x2={282} y2={70} />
      <T x={266} y={56} anchor="middle" fs={10.5} tone="muted">
        Erubi
      </T>
      <Box
        x={284}
        y={20}
        w={456}
        h={100}
        lines={["@output_buffer.safe_append='<li id=\"'", '@output_buffer.append=( dom_id(article) )', "@output_buffer.safe_append='\">'", '@output_buffer.append=( article.title ) …']}
        mono
        fs={11}
        fill="box"
        align="start"
      />
      <Arrow x1={512} y1={120} x2={512} y2={150} />
      <T x={524} y={136} fs={10.5} tone="muted">
        compiled_source が def で包む
      </T>
      <Box
        x={284}
        y={152}
        w={456}
        h={64}
        lines={['def _app_views_articles__article_html_erb___…(', '      local_assigns, output_buffer, &_)', '  article = local_assigns[:article]; …']}
        mono
        fs={11}
        fill="box5"
        align="start"
      />
      <Arrow x1={284} y1={184} x2={252} y2={226} />
      <T x={150} y={176} anchor="middle" fs={10.5} tone="muted">
        module_eval で定義（初回だけ）
      </T>
      <Box x={20} y={228} w={300} h={56} lines={['無名のクラス（ActionView::Base の子）', 'compiled_method_container']} fs={12} fill="box" subTone="muted" />
      <T x={340} y={246} fs={11.5} tone="muted">
        どのコントローラーのビューもこのクラスを継承するので、
      </T>
      <T x={340} y={266} fs={11.5} tone="muted">
        定義したメソッドを全リクエストで共有する
      </T>
    </Svg>
  )
}

/* ---------- 図 16-7 開発環境と本番環境のアセット配信 ---------- */
function AssetFigure() {
  return (
    <Svg
      id="16-7"
      w={760}
      h={330}
      label="開発環境では、ブラウザーが /assets/application-8b441ae0.css を要求すると、Rails のミドルウェア Propshaft::Server が app/assets などの読み込みパスからファイルを探して返す。本番環境では、デプロイ時に assets:precompile がダイジェスト付きのファイルと .manifest.json を public/assets に書き出す。リクエストは Nginx が public/assets から直接返すか、Nginx を置かない場合は ActionDispatch::Static が返す。どちらの環境でも、ビューのヘルパーはダイジェスト付きの URL を出力する"
    >
      <T x={20} y={20} bold>
        開発環境（config.assets.server が真）
      </T>
      <Box x={20} y={36} w={150} h={44} lines="ブラウザー" fill="bg" />
      <Arrow x1={170} y1={58} x2={226} y2={58} />
      <T x={198} y={44} anchor="middle" fs={10} tone="muted" mono>
        GET
      </T>
      <Box x={228} y={36} w={220} h={44} lines={['Propshaft::Server', '（ミドルウェア）']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={448} y1={58} x2={496} y2={58} />
      <Box x={498} y={30} w={242} h={56} lines={['app/assets、app/javascript、', 'gem の app/assets/javascripts …']} fs={11.5} fill="box4" />
      <T x={20} y={140} bold>
        本番環境
      </T>
      <Box x={20} y={156} w={200} h={44} lines="bin/rails assets:precompile" mono fs={11.5} fill="box2" />
      <Arrow x1={220} y1={178} x2={276} y2={178} />
      <T x={248} y={164} anchor="middle" fs={10} tone="muted">
        デプロイ時
      </T>
      <Box x={278} y={150} w={300} h={56} lines={['public/assets/application-8b441ae0.css', 'public/assets/.manifest.json']} mono fs={11} fill="box4" />
      <Box x={20} y={250} w={150} h={44} lines="ブラウザー" fill="bg" />
      <Arrow x1={170} y1={272} x2={226} y2={272} />
      <Box x={228} y={250} w={160} h={44} lines={['Nginx', '（第24章）']} fs={12.5} fill="box" subTone="muted" />
      <Arrow x1={388} y1={262} x2={428} y2={210} />
      <T x={430} y={238} fs={11} tone="muted">
        ファイルを直接返す
      </T>
      <Box x={540} y={250} w={200} h={44} lines={['ActionDispatch::Static', '（Nginx を置かない場合）']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={640} y1={250} x2={540} y2={208} dashed />
      <T x={20} y={318} fs={11} tone="muted">
        どちらの環境でも、ビューのヘルパーはダイジェスト付きの URL（/assets/application-8b441ae0.css）を出力する
      </T>
    </Svg>
  )
}

/* ---------- 図 16-6 フォームの送信から保存まで ---------- */
function FormFlowFigure() {
  const B = 100
  const C = 380
  const M = 650
  return (
    <Svg
      id="16-6"
      w={760}
      h={460}
      label="ブラウザーが GET /articles/new を送ると、new アクションが Article.new でオブジェクトを作り、フォームの HTML を 200 で返す。フォームを送信すると POST /articles が create アクションに届き、Article.new(article_params).save を呼ぶ。保存に成功すると INSERT が実行され、302 で /articles/10009 へのリダイレクトを返し、ブラウザーは GET /articles/10009 を送って記事の画面を 200 で受け取る。検証に失敗すると SQL は実行されず、422 でフォームとエラーを描画し直して返す"
    >
      <Box x={B - 70} y={16} w={140} h={36} lines="ブラウザー" bold fill="box4" />
      <Box x={C - 90} y={16} w={180} h={36} lines="ArticlesController" mono bold />
      <Box x={M - 90} y={16} w={180} h={36} lines="Article・MySQL" mono bold fill="box4" />
      <Arrow x1={B} y1={52} x2={B} y2={446} plain dashed />
      <Arrow x1={C} y1={52} x2={C} y2={446} plain dashed />
      <Arrow x1={M} y1={52} x2={M} y2={446} plain dashed />

      <Arrow x1={B} y1={80} x2={C - 2} y2={80} />
      <T x={(B + C) / 2} y={70} mono fs={11.5} anchor="middle">
        GET /articles/new
      </T>
      <T x={C + 10} y={104} mono fs={11.5}>
        new：@article = Article.new
      </T>
      <Arrow x1={C} y1={128} x2={B + 2} y2={128} dashed />
      <T x={(B + C) / 2} y={118} fs={11.5} anchor="middle">
        200 フォームの HTML
      </T>

      <Arrow x1={B} y1={172} x2={C - 2} y2={172} accent />
      <T x={(B + C) / 2} y={162} mono fs={11.5} anchor="middle">
        POST /articles
      </T>
      <T x={(B + C) / 2} y={186} mono fs={11} anchor="middle" tone="muted">
        article[title]=…&amp;article[body]=…
      </T>
      <Arrow x1={C} y1={212} x2={M - 2} y2={212} />
      <T x={(C + M) / 2} y={202} mono fs={11} anchor="middle">
        Article.new(article_params).save
      </T>

      <Box x={12} y={230} w={736} h={124} fill="none" dashed />
      <T x={20} y={246} fs={12} bold>
        成功
      </T>
      <Arrow x1={M} y1={258} x2={C + 2} y2={258} dashed />
      <T x={(C + M) / 2} y={248} fs={11.5} anchor="middle">
        true（INSERT・COMMIT）
      </T>
      <Arrow x1={C} y1={286} x2={B + 2} y2={286} dashed />
      <T x={(B + C) / 2} y={276} mono fs={11} anchor="middle">
        302 Location: /articles/10009
      </T>
      <Arrow x1={B} y1={314} x2={C - 2} y2={314} />
      <T x={(B + C) / 2} y={304} mono fs={11} anchor="middle">
        GET /articles/10009
      </T>
      <Arrow x1={C} y1={340} x2={B + 2} y2={340} dashed />
      <T x={(B + C) / 2} y={330} fs={11.5} anchor="middle">
        200 記事の画面（show）
      </T>

      <Box x={12} y={366} w={736} h={80} fill="none" dashed />
      <T x={20} y={382} fs={12} bold>
        失敗
      </T>
      <Arrow x1={M} y1={394} x2={C + 2} y2={394} dashed />
      <T x={(C + M) / 2} y={384} fs={11.5} anchor="middle">
        false（SQL なし。errors に理由）
      </T>
      <Arrow x1={C} y1={426} x2={B + 2} y2={426} dashed />
      <T x={(B + C) / 2} y={416} fs={11.5} anchor="middle">
        422 フォームとエラーを描画し直す
      </T>
    </Svg>
  )
}

/* ---------- 図 16-1 レイアウト・テンプレート・パーシャルの組み合わせ ---------- */
function LayoutNestFigure() {
  const li = ['<li id="article_1">0: 変更後のタイトル</li>', '<li id="article_2">1: タイトル2改</li>', '<li id="article_3">2: 記事3</li>']
  return (
    <Svg
      id="16-1"
      w={780}
      h={340}
      label="左は3つのファイル。layouts/application.html.erb は html・head・body を書き、body の中に yield を置く。articles/index.html.erb は ul の中で render @articles を呼ぶ。articles/_article.html.erb は記事1件分の li を書く。右は GET /articles の応答の HTML。レイアウトの出力の yield の位置に index.html.erb の出力が入り、その ul の中に _article.html.erb の出力が記事の数（3回）だけ入る"
    >
      <T x={20} y={18} bold fs={12.5}>
        ファイル
      </T>
      <Box x={20} y={30} w={300} h={92} lines={['layouts/application.html.erb', '<html><head>…</head>', '<body><%= yield %></body>', '</html>']} mono fs={11} fill="box4" bold align="start" />
      <Box x={20} y={140} w={300} h={78} lines={['articles/index.html.erb', '<ul>', '  <%= render @articles %>', '</ul>']} mono fs={11} fill="box4" bold align="start" />
      <Box x={20} y={236} w={300} h={50} lines={['articles/_article.html.erb', '<li id="…">番号: タイトル</li>']} mono fs={11} fill="box4" bold align="start" />

      <T x={400} y={18} bold fs={12.5}>
        GET /articles の応答の HTML
      </T>
      <rect x={400} y={30} width={360} height={290} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={412} y={48} fs={11} mono>
        {'<html><head>…</head><body>'}
      </T>
      <rect x={414} y={62} width={332} height={212} rx={6} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={426} y={80} fs={11} mono>
        {'<ul>'}
      </T>
      {li.map((t, i) => (
        <Box key={t} x={428} y={92 + i * 46} w={304} h={36} lines={t} mono fs={10.5} fill="box5" />
      ))}
      <T x={426} y={256} fs={11} mono>
        {'</ul>'}
      </T>
      <T x={412} y={300} fs={11} mono>
        {'</body></html>'}
      </T>

      <Arrow x1={320} y1={48} x2={398} y2={48} />
      <Arrow x1={320} y1={168} x2={412} y2={168} />
      <Arrow x1={320} y1={262} x2={426} y2={202} />
      <T x={330} y={150} fs={10.5} tone="muted">
        yield の位置
      </T>
      <T x={330} y={284} fs={10.5} tone="muted">
        記事の数だけ
      </T>
      <T x={20} y={312} fs={11} tone="muted">
        外側から順に、レイアウト・
      </T>
      <T x={20} y={330} fs={11} tone="muted">
        index.html.erb・パーシャルの出力
      </T>
    </Svg>
  )
}

/* ---------- 図 16-2 1つの画面を表示するときの要求 ---------- */
function PageRequestsFigure() {
  const B = 110
  const S = 600
  const msgs = [
    { y: 196, t: 'GET /assets/application-8b441ae0.css（CSS × 1）' },
    { y: 232, t: 'GET /assets/turbo.min-9fd88cd5.js など（JavaScript × 7）' },
    { y: 268, t: 'GET /icon.svg・/icon.png（画像 × 2）' },
  ]
  return (
    <Svg
      id="16-2"
      w={780}
      h={360}
      label="ブラウザーは GET /articles を送り、Rails がテンプレートから作った HTML を受け取る。ブラウザーは HTML を読んで link と script のタグの URL を見つけ、CSS を1つ、JavaScript を7つ、アイコンの画像を2つ、それぞれ別の要求で取得する。サーバーはこれらのファイルをそのまま返す。同じページを2回目に開いたときは、サーバーに要求するのは HTML だけで、CSS・JavaScript・画像はブラウザーのキャッシュから読む"
    >
      <Box x={B - 70} y={14} w={140} h={34} lines="ブラウザー" bold fill="bg" />
      <Box x={S - 90} y={14} w={180} h={34} lines="Rails（Puma）" bold fill="box" />
      <Arrow x1={B} y1={48} x2={B} y2={296} plain dashed />
      <Arrow x1={S} y1={48} x2={S} y2={296} plain dashed />

      <Arrow x1={B} y1={78} x2={S - 2} y2={78} />
      <T x={(B + S) / 2} y={68} anchor="middle" mono fs={11.5}>
        GET /articles
      </T>
      <Arrow x1={S} y1={112} x2={B + 2} y2={112} dashed />
      <T x={(B + S) / 2} y={102} anchor="middle" fs={11.5}>
        200 HTML
      </T>
      <T x={S + 12} y={88} fs={10.5} tone="muted">
        テンプレートを描画
      </T>
      <T x={S + 12} y={104} fs={10.5} tone="muted">
        して HTML を作る
      </T>
      <Box x={B - 90} y={128} w={300} h={40} lines={['HTML を読み、<link> と <script> が', '指す URL を見つける']} fs={11} fill="box5" />
      {msgs.map((m) => (
        <g key={m.t}>
          <Arrow x1={B} y1={m.y} x2={S - 2} y2={m.y} both />
          <T x={(B + S) / 2} y={m.y - 10} anchor="middle" mono fs={10.5}>
            {m.t}
          </T>
        </g>
      ))}
      <T x={S + 12} y={224} fs={10.5} tone="muted">
        ファイルを
      </T>
      <T x={S + 12} y={240} fs={10.5} tone="muted">
        そのまま返す
      </T>
      <Box
        x={20}
        y={306}
        w={740}
        h={44}
        lines={['同じページを2回目に開いたとき：サーバーに要求するのは HTML だけ。', 'CSS・JavaScript・画像は、ブラウザーが1回目に保存したもの（キャッシュ）を使う']}
        fs={11.5}
        fill="box4"
      />
    </Svg>
  )
}

const ch16: Chapter = {
  number: 16,
  part: 4,
  title: 'ビューの描画とアセット',
  summary:
    'HTML と ERB のタグの書き方、レイアウトとパーシャルによる画面の組み立て、ブラウザーが CSS・JavaScript・画像を HTML とは別の要求で取りに来ることを、デモの出力で確かめてから、コントローラーの render の後で、テンプレートがどう探され、ERB がどのように Ruby のメソッドに変換されて実行されるかを、実測の出力とともに説明します。レイアウト・パーシャル・ヘルパー・自動エスケープの仕組み、フォームの送信から保存・エラー表示までの流れと、Propshaft・Sprockets・import maps・jsbundling によるアセットの配信方法の違いも扱います。',
  goals: [
    'ERB の <%= %> と <% %> の違いを、出力される HTML で説明できる',
    'レイアウト・テンプレート・パーシャルが1つの HTML に組み合わさる順と、アセットが HTML とは別の要求で取得されることを説明できる',
    'フォームを送信してから保存・リダイレクト・エラー表示に至るまでに、どのファイルのどのコードが動くかを説明できる',
    'render の後に呼ばれるクラスと、ビューのインスタンスにインスタンス変数が渡る仕組みを説明できる',
    'テンプレートのファイル名の各部分と、形式・派生・言語による探索の結果を説明できる',
    'ERB が Ruby のメソッドに変換され、初回だけ定義される流れを説明できる',
    'レイアウト・コレクションの描画の順と、ローカル変数の名前の決まり方を説明できる',
    'SafeBuffer と html_safe? による自動エスケープの仕組みと、raw の危険を説明できる',
    'Propshaft と Sprockets の違い、import maps と jsbundling の違い、本番環境でのアセットの配信経路を説明できる',
  ],
  prerequisites: [10],
  sections: [
    {
      id: 'html-erb',
      title: 'HTML と ERB のテンプレート',
      body: (
        <>
          <p>
            Web のページは HTML という書き方の文字の並びでできています。HTML では文章の各部分を<Term en="tag">タグ</Term>ではさんで、その部分の役割を表します。タグは <code>{'<'}</code> と{' '}
            <code>{'>'}</code> で名前を囲んだもので、<code>{'<h1>記事の一覧</h1>'}</code> なら「記事の一覧」が大見出しになります。開始タグ（<code>{'<h1>'}</code>）から終了タグ（<code>{'</h1>'}</code>）までのひとまとまりを要素と呼びます。h1 は大見出し、p は段落、ul
            は箇条書きの全体、li はその1項目です。<code>{'<li id="article_1">'}</code> の <code>id="article_1"</code> のように、開始タグの中に書く「名前="値"」を属性と呼びます。ブラウザーは受け取った HTML
            を読み、見出しを大きな文字で表示するなどして画面を描きます
            <Ref n={17} />。
          </p>
          <p>
            記事のページの HTML は、記事ごとに見出しや本文が違います。記事が1万件あっても、HTML のファイルを1万個用意するわけではありません。Rails は要求を受けるたびに、HTML の型に記事の値を埋め込んで HTML を作ります。この型を
            <Term en="template">テンプレート</Term>と呼び、app/views の下に置きます。記事の show アクションのテンプレートなら app/views/articles/show.html.erb のように、コントローラーの名前のディレクトリに、アクションの名前のファイルを置きます。拡張子の
            .erb は ERB という書き方で Ruby のコードを埋め込んだファイルであることを表します。
          </p>
          <p>ERB の3種類のタグを使ったテンプレートを、デモのアプリケーションに置きました。</p>
          <Code
            lang="erb"
            title="app/views/basics16/erb_demo.html.erb（デモ）"
            code={`
<h1><%= @article.title %></h1>
<% if @article.published %>
  <p>公開中の記事です</p>
<% else %>
  <p>下書きです</p>
<% end %>
<%# この行はコメントなので出力されない %>
<ul>
  <% ["Ruby", "Rails"].each do |name| %>
    <li><%= name %></li>
  <% end %>
</ul>
<p>コメント <%= @article.comments_count %> 件</p>
<p><%= "<b>太字</b>" %></p>
`}
          />
          <p>
            記事を1件読み込んで <code>@article</code> に入れ、このテンプレートを描画しました。<code>published</code> は記事が公開済みかどうかを表す列で、id が 1 の記事は true、3 の記事は false です。
          </p>
          <Code
            lang="text"
            title="bin/rails runner で描画した結果（Rails 8.1.4.1。開発環境でファイル名の注釈を付ける設定は外しています）"
            code={`
# ApplicationController.render(template: "basics16/erb_demo", assigns: { article: Article.find(1) }, layout: false)
<h1>変更後のタイトル</h1>
  <p>公開中の記事です</p>
<ul>
    <li>Ruby</li>
    <li>Rails</li>
</ul>
<p>コメント 8 件</p>
<p>&lt;b&gt;太字&lt;/b&gt;</p>

# 同じテンプレートを Article.find(3) で描画
<h1>記事3</h1>
  <p>下書きです</p>
（以下は id 1 と同じ。コメントの件数だけが 0 件）
`}
          />
          <ul>
            <li>
              <code>{'<%= 式 %>'}</code> は式を評価した結果を文字列にして、その位置に出力します。<code>@article.title</code> は「変更後のタイトル」に、<code>@article.comments_count</code> は 8 になりました。
            </li>
            <li>
              <code>{'<% コード %>'}</code> は Ruby のコードを実行するだけで、何も出力しません。if で出力する部分を選んだり、each で繰り返したりするときに使います。published が true の記事では「公開中の記事です」だけが、false
              の記事では「下書きです」だけが出力され、each の中の li は配列の要素の数（2回）だけ出力されました。<code>{'<% %>'}</code> だけを書いた行は、行ごと出力から消えています。
            </li>
            <li>
              <code>{'<%# %>'}</code> はコメントで、何も出力せず、中のコードも実行しません
              <Ref n={15} />。
            </li>
            <li>
              <code>{'<%= "<b>太字</b>" %>'}</code> は太字にならず、<code>{'&lt;b&gt;太字&lt;/b&gt;'}</code> と出力されました。HTML で特別な意味を持つ <code>{'<'}</code> と <code>{'>'}</code>{' '}
              を、<code>{'&lt;'}</code> と <code>{'&gt;'}</code> という書き方に置き換えたためです。ブラウザーはこれを「{'<'}」「{'>'}」という文字として表示します。この置き換えを<Term en="escape">エスケープ</Term>
              と呼び、利用者が入力した文字列にタグが含まれていても、タグとして働かないようにします。仕組みは「自動エスケープと SafeBuffer」の節で扱います。
            </li>
          </ul>
          <p>
            ここでは <code>@article</code> を runner で入れましたが、実際の要求では、コントローラーのアクションが入れます。デモの ArticlesController の show アクションは、
            <code>@article = Article.find(params[:id])</code> の1行だけです。アクションが終わると、Rails は render を書かなくても articles/show.html.erb を描画します（
            <ChapterLink n={10} section="render" />
            ）。アクションの中で <code>@</code> で始まる変数（インスタンス変数）に入れた値は、テンプレートの中でも同じ名前で使えます。ブラウザーが受け取るのは描画した後の HTML で、ERB のタグや Ruby のコードは送られません。
          </p>
        </>
      ),
    },
    {
      id: 'layout-basics',
      title: 'レイアウトとパーシャルの書き方',
      body: (
        <>
          <p>
            どのページにも共通する部分（<code>{'<html>'}</code> や <code>{'<head>'}</code>、CSS と JavaScript を読み込むタグなど）を、アクションごとのテンプレートに毎回書くと、変更するときにすべてのファイルを直すことになります。Rails
            では共通の外枠を<Term en="layout">レイアウト</Term>のファイル app/views/layouts/application.html.erb に書き、アクションのテンプレートにはページごとの部分だけを書きます。レイアウトの{' '}
            <code>{'<%= yield %>'}</code> の位置に、アクションのテンプレートを描画した結果が入ります
            <Ref n={16} />。
          </p>
          <Code
            lang="erb"
            title="app/views/layouts/application.html.erb（デモ。rails new が作ったもの、一部を省略）"
            code={`
<!DOCTYPE html>
<html>
  <head>
    <title><%= content_for(:title) || "Demo" %></title>
    <%= csrf_meta_tags %>
    <link rel="icon" href="/icon.png" type="image/png">
    <%= stylesheet_link_tag :app %>
    <%= javascript_importmap_tags %>
  </head>

  <body>
    <%= yield %>
  </body>
</html>
`}
          />
          <p>
            <code>content_for(:title)</code> は、アクションのテンプレートの中で <code>{'<% content_for :title, "記事の一覧" %>'}</code> のように入れておいた値を取り出します。何も入れていなければ nil
            なので、<code>|| "Demo"</code> により「Demo」になります。<code>stylesheet_link_tag</code> などは<Term en="helper">ヘルパー</Term>
            と呼ぶメソッドで、テンプレートの中から呼んで HTML のタグや URL を作ります。Rails が用意したヘルパーのほかに、app/helpers のファイルに自分で書くこともできます。
          </p>
          <p>
            <Term en="partial">パーシャル</Term>はテンプレートの一部を別のファイルに分けたものです。ファイル名を <code>_</code> で始め、<code>render</code> で呼び出します。記事の一覧のページでは記事1件分の HTML
            をパーシャル _article.html.erb に書き、index.html.erb から記事の数だけ描画しています。
          </p>
          <Code
            lang="erb"
            title="ArticlesController#index と、そのテンプレート（デモ）"
            code={`
# app/controllers/articles_controller.rb
def index
  @articles = Article.order(:id).limit(3)
end

<%# app/views/articles/index.html.erb %>
<ul>
  <%= render @articles %>
</ul>

<%# app/views/articles/_article.html.erb %>
<li id="<%= dom_id(article) %>"><%= article_counter %>: <%= article.title %></li>
`}
          />
          <p>
            <code>render @articles</code> は、@articles の記事を1件ずつ article というローカル変数に入れて _article.html.erb を描画し、結果をつなげます。<code>article_counter</code> は0から数えた順番、
            <code>dom_id(article)</code> は <code>"article_1"</code> のような id を作るヘルパーです。次のコードは curl で GET /articles を要求したときの応答の HTML です。開発環境では、どのファイルが出力した部分かを示すコメント（
            <code>{'<!-- BEGIN … -->'}</code> と <code>{'<!-- END … -->'}</code>）が入ります。
          </p>
          <Code
            lang="html"
            title="curl http://127.0.0.1:3300/articles の出力（head の中を省略）"
            code={`
<!-- BEGIN app/views/layouts/application.html.erb
--><!DOCTYPE html>
<html>
  <head>
    <title>Demo</title>
    …
  </head>

  <body>
    <!-- BEGIN app/views/articles/index.html.erb
--><ul>
  <!-- BEGIN app/views/articles/_article.html.erb
--><li id="article_1">0: 変更後のタイトル</li>
<!-- END app/views/articles/_article.html.erb --><!-- BEGIN app/views/articles/_article.html.erb
--><li id="article_2">1: タイトル2改</li>
<!-- END app/views/articles/_article.html.erb --><!-- BEGIN app/views/articles/_article.html.erb
--><li id="article_3">2: 記事3</li>
<!-- END app/views/articles/_article.html.erb -->
</ul>
<!-- END app/views/articles/index.html.erb -->
  </body>
</html>
<!-- END app/views/layouts/application.html.erb -->
`}
          />
          <p>
            レイアウトの出力の中に index.html.erb の出力が入り、その <code>{'<ul>'}</code> の中にパーシャルの出力が3回入っています（図 16-1）。サーバーのログにも、レイアウトとテンプレートとパーシャルを描画したことが出ます。
          </p>
          <Code
            lang="text"
            title="docker logs rbdemo-dev（開発環境のログ。SQL の行は一部を省略）"
            code={`
Started GET "/articles" for 172.29.0.1 at 2026-11-16 07:03:18 +0000
Processing by ArticlesController#index as */*
  Rendering layout layouts/application.html.erb
  Rendering articles/index.html.erb within layouts/application
  Article Load (0.5ms)  SELECT \`articles\`.* FROM \`articles\` ORDER BY \`articles\`.\`id\` ASC LIMIT 3
  Rendered collection of articles/_article.html.erb [3 times] (Duration: 0.5ms | GC: 0.0ms)
  Rendered articles/index.html.erb within layouts/application (Duration: 14.2ms | GC: 0.1ms)
  Rendered layout layouts/application.html.erb (Duration: 17.1ms | GC: 0.1ms)
Completed 200 OK in 83ms (Views: 12.7ms | ActiveRecord: 10.1ms (1 query, 0 cached) | GC: 0.6ms)
`}
          />
          <p>
            Rendered collection の行が、パーシャルを3回描画したことを示しています。パーシャルには名前を付けてローカル変数を渡すこともできます。<code>{'<%= render "form", article: @article %>'}</code>{' '}
            と書くと、_form.html.erb の中で <code>article</code> という名前で使えます（「フォームから保存まで」の節の例）。
          </p>
          <Figure n="16-1" title="レイアウト・テンプレート・パーシャルの組み合わせ" caption="デモのアプリケーションの GET /articles の応答（開発環境の注釈のコメント）をもとにした模式図。">
            <LayoutNestFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'asset-requests',
      title: 'CSS・JavaScript・画像を取りに来る要求',
      body: (
        <>
          <p>
            HTML で決めるのは、ページの内容と構造です。文字の色や配置などの見た目は CSS、クリックしたときの動きなどは JavaScript という別のファイルに書きます。CSS・JavaScript・画像のように、HTML から参照して読み込むファイルを、Rails
            では<Term en="assets">アセット</Term>と呼びます。前の節の応答の <code>{'<head>'}</code> には次のタグがありました。
          </p>
          <Code
            lang="html"
            title="GET /articles の応答の head（一部を省略）"
            code={`
<link rel="icon" href="/icon.png" type="image/png">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/application-8b441ae0.css" />
<script type="importmap" data-turbo-track="reload">{
  "imports": {
    "application": "/assets/application-bfcdf840.js",
    "@hotwired/turbo-rails": "/assets/turbo.min-9fd88cd5.js",
    …
  }
}</script>
<link rel="modulepreload" href="/assets/application-bfcdf840.js">
…
<script type="module">import "application"</script>
`}
          />
          <p>
            <code>stylesheet_link_tag :app</code> が CSS のファイルを指す <code>{'<link rel="stylesheet">'}</code> を、<code>javascript_importmap_tags</code> が JavaScript
            のファイルを読み込むタグをまとめて出力しています。アイコンの <code>{'<link rel="icon">'}</code> はレイアウトに直接書いたタグです。ブラウザーは HTML を読んでこれらのタグを見つけると、指している URL
            に、HTML とは別の要求を送ってファイルを取得します
            <Ref n={18} />。Chrome で /articles を開き、ブラウザーが送った要求を記録しました。
          </p>
          <Code
            lang="text"
            title="Chrome で /articles を開いたときの要求（Playwright で記録。開いてからの時間・パス・種類・状態コード）"
            code={`
 148ms GET /articles                                         document   200 text/html; charset=utf-8
 233ms GET /assets/application-bfcdf840.js                   script     200 text/javascript
 254ms GET /assets/application-8b441ae0.css                  stylesheet 200 text/css
 260ms GET /assets/stimulus.min-4b1e420e.js                  script     200 text/javascript
 263ms GET /assets/stimulus-loading-1fc53fe7.js              script     200 text/javascript
 277ms GET /assets/controllers/application-3affb389.js       script     200 text/javascript
 278ms GET /assets/controllers/hello_controller-708796bd.js  script     200 text/javascript
 278ms GET /assets/controllers/index-ee64e1f1.js             script     200 text/javascript
 278ms GET /assets/turbo.min-9fd88cd5.js                     script     200 text/javascript
 315ms GET /icon.svg                                         other      200 image/svg+xml
 334ms GET /icon.png                                         other      200 image/png
`}
          />
          <p>
            1つのページを表示するのに、HTML が1つ、CSS が1つ、JavaScript が7つ、アイコンの画像が2つで、合わせて11の要求が送られました（図 16-2）。テンプレートから作られるのは最初の HTML だけです。/assets/
            で始まる URL は、app/assets/stylesheets や app/javascript などに置いたファイルを Rails がそのまま返したもので、/icon.png は public ディレクトリのファイルです。ファイル名の{' '}
            <code>-8b441ae0</code> のような部分は、ファイルの内容から計算した値（ダイジェスト）です。
          </p>
          <p>同じブラウザーで新しいタブを開き、もう一度 /articles を開きました。</p>
          <Code
            lang="text"
            title="2回目に開いたとき（Chrome の記録。fromDiskCache は、ブラウザーのキャッシュから読んだかどうか。一部を省略）"
            code={`
/articles                          status=200 fromDiskCache=false
/assets/application-8b441ae0.css   status=200 fromDiskCache=true
/assets/application-bfcdf840.js    status=200 fromDiskCache=true
/assets/turbo.min-9fd88cd5.js      status=200 fromDiskCache=true
…（JavaScript のほかの5つも true）
/icon.svg                          status=200 fromDiskCache=true
/icon.png                          status=200 fromDiskCache=true
`}
          />
          <p>
            2回目にサーバーへ送られたのは HTML の要求だけで、CSS・JavaScript・画像は、ブラウザーが1回目に保存しておいたものが使われました。このように、取得したものを保存しておいて再び使うことを<Term en="cache">キャッシュ</Term>と呼びます
            <Ref n={19} />。ファイルの内容を変えるとダイジェストも変わって URL が変わるので、ブラウザーは新しい URL のファイルを取りに来ます。この仕組みと本番環境での配信の方法は「アセットの配信」の節で扱います。
          </p>
          <p>
            ここまでで、1つの画面は、Rails がテンプレートから HTML を作る処理と、ブラウザーがその HTML に書かれたファイルを取りに来る処理からできていることを見ました。次の節からは前者を詳しく追います。アクションが終わってから、Rails
            がどのテンプレートを選び、ERB をどのように実行して HTML の文字列を作るのかを、Rails のソースコードとともに確かめます。
          </p>
          <Figure n="16-2" title="1つの画面を表示するときの要求" caption="Chrome（Playwright）で記録したデモのアプリケーションの要求をもとにした模式図。">
            <PageRequestsFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'flow',
      title: 'render から出力まで',
      body: (
        <>
          <p>
            <ChapterLink n={10} section="render" />
            で見たとおり、アクションが render を呼ばなければ、アクション名と同じテンプレートが暗黙に描画されます。描画の本体は ActionView::Rendering の <code>render_to_body</code> です。
          </p>
          <Code
            lang="ruby"
            title="actionview/lib/action_view/rendering.rb（109〜111行目、119〜137行目）"
            href={`${GH}/actionview/lib/action_view/rendering.rb#L119-L137`}
            code={`
    def view_context
      view_context_class.new(lookup_context, view_assigns, self)
    end

    def render_to_body(options = {})
      _process_options(options)
      _process_render_template_options(options)
      _render_template(options)
    end

    private
      # Find and render a template based on the options given.
      def _render_template(options)
        variant = options.delete(:variant)
        assigns = options.delete(:assigns)
        context = view_context

        context.assign assigns if assigns
        lookup_context.variants = variant if variant

        rendered_template = context.in_rendering_context(options) do |renderer|
          renderer.render_to_object(context, options)
        end
`}
          />
          <p>
            <code>view_context</code> は、描画のたびにビューのクラスのインスタンスを新しく作ります。テンプレートの中の <code>self</code> はこのインスタンスで、コントローラーとは別のオブジェクトです。コントローラーで代入した <code>@article</code>{' '}
            がテンプレートで使えるのは、<code>view_assigns</code> がコントローラーのインスタンス変数を集めて Hash にし、ビューの <code>assign</code> が同じ名前のインスタンス変数として設定し直すからです
            <Ref n={1} />。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/abstract_controller/rendering.rb（58〜68行目）・actionview/lib/action_view/base.rb（228〜231行目）"
            href={`${GH}/actionpack/lib/abstract_controller/rendering.rb#L58-L68`}
            code={`
    # abstract_controller/rendering.rb
    DEFAULT_PROTECTED_INSTANCE_VARIABLES = %i(@_action_name @_response_body @_formats @_prefixes)

    def view_assigns
      variables = instance_variables - _protected_ivars

      variables.each_with_object({}) do |name, hash|
        hash[name.slice(1, name.length)] = instance_variable_get(name)
      end
    end

    # action_view/base.rb
    def assign(new_assigns) # :nodoc:
      @_assigns = new_assigns
      new_assigns.each { |key, value| instance_variable_set("@#{key}", value) }
    end
`}
          />
          <p>
            コピーされるのは値への参照なので、ビューで <code>@article.title = ...</code> とするとコントローラー側の同じオブジェクトが変わります。逆に、ビューで新しく <code>@x = 1</code>{' '}
            と代入しても、コントローラーのインスタンス変数は増えません。その先は TemplateRenderer がテンプレートを決め、レイアウトと一緒に描画します（図 16-3）。
          </p>
          <Code
            lang="ruby"
            title="actionview/lib/action_view/renderer/template_renderer.rb（5〜11行目、58〜84行目から抜粋）"
            href={`${GH}/actionview/lib/action_view/renderer/template_renderer.rb#L5-L84`}
            code={`
    def render(context, options)
      @details = extract_details(options)
      template = determine_template(options)

      prepend_formats(template.format)

      render_template(context, template, options[:layout], options[:locals] || {})
    end

      def render_with_layout(view, template, path, locals)
        layout  = path && find_layout(path, locals.keys, [formats.first])

        body = if layout
          ActiveSupport::Notifications.instrument("render_layout.action_view", identifier: layout.identifier) do
            view.view_flow.set(:layout, yield(layout))
            layout.render(view, locals) { |*name| view._layout_for(*name) }
          end
        else
          yield
        end
        build_rendered_template(body, template)
      end
`}
          />
          <Figure n="16-3" title="render から出力まで" caption="Rails 8.1.4.1 の rendering.rb・template_renderer.rb・template.rb・base.rb を読んでまとめた模式図。">
            <FlowFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'lookup',
      title: 'テンプレートの探索',
      body: (
        <>
          <p>
            テンプレートを探すのは <Term en="LookupContext">ActionView::LookupContext</Term> です。名前（<code>show</code>）と接頭辞（<code>articles</code>、<code>application</code>
            ）のほかに、次の4つの条件（details）を持っています。デモのアプリケーションで既定値を表示しました。
          </p>
          <Code
            lang="text"
            code={`
{locale: [:en],
 formats: [:html, :text, :js, :css, :ics, :csv, ... , :json, :pdf, :zip, :gzip, :turbo_stream],
 variants: [],
 handlers: [:raw, :erb, :html, :builder, :ruby]}
`}
          />
          <p>
            リクエストを処理するときは、formats は Accept ヘッダーや URL の拡張子（<code>.json</code>）から、locale は <code>I18n.locale</code> から、variants はコントローラーで設定した{' '}
            <code>request.variant</code> から決まります。ファイル名は、次の正規表現で各部分に分解されます
            <Ref n={2} />。
          </p>
          <Code
            lang="ruby"
            title="actionview/lib/action_view/template/resolver.rb（22〜33行目）"
            href={`${GH}/actionview/lib/action_view/template/resolver.rb#L22-L33`}
            code={`
        %r{
          \\A
          (?:(?<prefix>.*)/)?
          (?<partial>_)?
          (?<action>.*?)
          (?:\\.(?<locale>#{locales}))??
          (?:\\.(?<format>#{formats}))??
          (?:\\+(?<variant>#{variants}))??
          (?:\\.(?<handler>#{handlers}))?
          \\z
        }x
`}
          />
          <p>
            デモで articles/show のテンプレートを3つ置き、条件を変えて <code>find_all</code> で探しました。<code>show.html+phone.erb</code> は派生 phone 用、<code>show.text.erb</code>{' '}
            はテキスト形式用です。
          </p>
          <Code
            lang="text"
            code={`
  html        => ["app/views/articles/show.html.erb"]
  html+phone  => ["app/views/articles/show.html+phone.erb", "app/views/articles/show.html.erb"]
  text        => ["app/views/articles/show.text.erb"]
  json        => []
`}
          />
          <p>
            派生を指定すると、派生付きのファイルが先に、派生の無いファイルが後に並びます。先頭のファイルが使われるので、派生用のファイルが無いアクションでは通常のファイルが使われます。リクエストでも確かめました（コントローラーで{' '}
            <code>params[:phone]</code> があれば <code>request.variant = :phone</code> を設定）。
          </p>
          <Code
            lang="text"
            code={`
  GET /articles/1                       text/html   <h1>変更後のタイトル</h1>
  GET /articles/1?phone=1               text/html   <h1 class="phone">変更後のタイトル</h1>
  GET /articles/1  (Accept: text/plain) text/plain  title: 変更後のタイトル
  GET /articles/1.json                  406
`}
          />
          <p>
            暗黙の描画で 406（求められた形式で応答を返せないことを表す状態コード）になりました。<ChapterLink n={10} section="render" />
            で見たのは、どの形式のテンプレートも無い場合（HTML を求めれば 406、それ以外は 204）でした。ここでは show.html.erb のように別の形式のテンプレートがあるので、implicit_render.rb は ActionController::UnknownFormat
            を投げ、これが 406 になります。<code>render</code> を明示的に呼んだ場合は ActionView::MissingTemplate になり、メッセージに探した条件と場所が出ます。
          </p>
          <Code
            lang="text"
            code={`
ActionView::MissingTemplate: Missing template articles/show, application/show with {locale: [:en], formats: [:json], variants: [], handlers: [:raw, :erb, :html, :builder, :ruby]}.

Searched in:
  * "/work/demo/app/views"
  * "/work/gems/gems/turbo-rails-2.0.23/app/views"
`}
          />
          <p>
            Searched in には、アプリケーションの app/views のほかに、ビューを持つ gem（ここでは turbo-rails）のディレクトリも並びます。テンプレートが見つからないときは、このメッセージの formats と Searched in
            を見れば、どの条件でどこを探したかがわかります。
          </p>
          <Figure n="16-4" title="ファイル名と探索の条件" caption="Rails 8.1.4.1 のデモアプリケーションでの実測（find_all の結果）。">
            <LookupFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'compile',
      title: 'ERB が Ruby のメソッドになるまで',
      body: (
        <>
          <p>
            見つかったテンプレートは、最初に描画するときに Ruby のメソッドに変換されます。変換するのは拡張子ごとのハンドラーで、ERB のハンドラーは Erubi という gem（Ruby のライブラリを配布する単位）を使います。Rails は Erubi
            の変換の一部を上書きしています。
          </p>
          <Code
            lang="ruby"
            title="actionview/lib/action_view/template/handlers/erb/erubi.rb（30〜55行目）"
            href={`${GH}/actionview/lib/action_view/template/handlers/erb/erubi.rb#L30-L55`}
            code={`
          def add_text(text)
            return if text.empty?

            if text == "\\n"
              @newline_pending += 1
            else
              with_buffer do
                src << ".safe_append='"
                src << "\\n" * @newline_pending if @newline_pending > 0
                src << text.gsub(/['\\\\]/, '\\\\\\\\\\&') << @text_end
              end
              @newline_pending = 0
            end
          end

          def add_expression(indicator, code)
            flush_newline_if_pending(src)

            with_buffer do
              if (indicator == "==") || @escape
                src << ".safe_expr_append="
              else
                src << ".append="
              end
`}
          />
          <p>
            HTML の部分は <code>safe_append=</code>（そのまま足す）、<code>{'<%= %>'}</code> の部分は <code>append=</code>（エスケープしてから足す）になります。次のパーシャルで実際に確かめました。
          </p>
          <Code
            lang="erb"
            title="app/views/articles/_article.html.erb"
            code={`
<li id="<%= dom_id(article) %>"><%= article_counter %>: <%= article.title %></li>
`}
          />
          <p>Template の <code>compiled_source</code> が返した文字列です（開発環境でファイル名の注釈を付ける設定は外しています）。</p>
          <Code
            lang="ruby"
            code={`
          def _app_views_articles__article_html_erb___2527292446958372577_6752(local_assigns, output_buffer, &_)
            @virtual_path = "articles/_article";article = local_assigns[:article]; article = article;article_counter = local_assigns[:article_counter]; article_counter = article_counter;; @output_buffer.safe_append='<li id="'.freeze; @output_buffer.append=( dom_id(article) ); @output_buffer.safe_append='">'.freeze; @output_buffer.append=( article_counter ); @output_buffer.safe_append=': '.freeze; @output_buffer.append=( article.title ); @output_buffer.safe_append='</li>
'.freeze;
@output_buffer
          end
`}
          />
          <p>
            メソッド名はファイルのパスから作った名前に、パスから計算した数値（ハッシュ値）とオブジェクトの ID を付けたものです。ローカル変数（<code>article</code>、<code>article_counter</code>）は、
            <code>local_assigns</code> から取り出す代入文としてメソッドの先頭に入ります。このため、同じテンプレートでも渡すローカル変数の組が違えば、別のメソッドとしてコンパイルされます。定義は次のように行います
            <Ref n={3} />。
          </p>
          <Code
            lang="ruby"
            title="actionview/lib/action_view/template.rb（424〜442行目、507〜509行目）"
            href={`${GH}/actionview/lib/action_view/template.rb#L424-L442`}
            code={`
      def compile!(view)
        return if @compiled

        # Templates can be used concurrently in threaded environments
        # so compilation and any instance variable modification must
        # be synchronized
        @compile_mutex.synchronize do
          # Any thread holding this lock will be compiling the template needed
          # by the threads waiting. So re-check the @compiled flag to avoid
          # re-compilation
          return if @compiled

          mod = view.compiled_method_container

          instrument("!compile_template") do
            compile(mod)
          end

          @compiled = true
        end
      end

      def compile(mod)
        begin
          mod.module_eval(compiled_source, identifier, offset)
`}
          />
          <p>
            Puma の複数のスレッドが同時に同じテンプレートを描画しても、コンパイルは Mutex で1回にまとめられます。<code>module_eval</code> の第2引数にテンプレートのパスを渡しているので、テンプレートの中で例外が起きると、バックトレースに
            .erb のファイル名と行番号が出ます。<code>/articles</code> を2回要求して、ActiveSupport::Notifications のイベントを記録しました。
          </p>
          <Code
            lang="text"
            code={`
== GET /articles（1回目）
  !compile_template.action_view app/views/articles/index.html.erb
  !compile_template.action_view app/views/articles/_article.html.erb
  render_collection.action_view app/views/articles/_article.html.erb count=3
  render_template.action_view  app/views/articles/index.html.erb
  !compile_template.action_view app/views/layouts/application.html.erb
  render_layout.action_view    app/views/layouts/application.html.erb
== GET /articles（2回目）
  render_collection.action_view app/views/articles/_article.html.erb count=3
  render_template.action_view  app/views/articles/index.html.erb
  render_layout.action_view    app/views/layouts/application.html.erb
== コンパイル後のメソッド
container=#<Class:0x00007f6249cf7120> superclass=ActionView::Base
  _app_views_articles_index_html_erb__2311190252445934010_8952
  _app_views_articles__article_html_erb___1682771761015265790_8960
  _app_views_layouts_application_html_erb___3246383753841582169_8968
`}
          />
          <p>
            コンパイルは1回目だけで、2回目は定義済みのメソッドを呼ぶだけです。メソッドは、ActionView::Base を継承した無名のクラス（<code>compiled_method_container</code>）に定義されています（図
            16-5）。開発環境では、テンプレートのファイルを変更すると、このクラスごと作り直されて再びコンパイルされます。
          </p>
          <Figure n="16-5" title="ERB がメソッドになるまで" caption="Rails 8.1.4.1 の erubi.rb・template.rb・base.rb を読み、デモアプリケーションの出力で確かめてまとめた模式図。">
            <CompileFigure />
          </Figure>
          <Callout kind="note" title="開発環境の注釈">
            <p>
              開発環境の設定ファイルには <code>config.action_view.annotate_rendered_view_with_filenames = true</code> があり、HTML に{' '}
              <code>{'<!-- BEGIN app/views/articles/_article.html.erb -->'}</code> のようなコメントが入ります。ブラウザーの開発者ツールで、どのテンプレートが出力した部分かを確かめるときに使えます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'layout-partial',
      title: 'レイアウト・パーシャル・コレクション',
      body: (
        <>
          <p>
            前節のイベントの順を見ると、index.html.erb の描画（render_template）が終わってから、レイアウトがコンパイル・描画されています。<code>render_with_layout</code>（前述）は、先にテンプレートを描画して結果を{' '}
            <code>view_flow</code> の :layout に入れ、その後でレイアウトを描画します。レイアウトの <code>{'<%= yield %>'}</code> は、この入れておいた本文を取り出します。テンプレートの中で{' '}
            <code>content_for(:title)</code> に入れた値をレイアウトの <code>{'<title>'}</code> で使えるのも、テンプレートが先に描画されるからです。
          </p>
          <p>
            一覧の index.html.erb では <code>{'<%= render @articles %>'}</code> と書きました。Relation を渡すと、Rails は各要素の <code>to_partial_path</code>（Article なら{' '}
            <code>"articles/article"</code>）からパーシャルを決め、コレクションとしてまとめて描画します。パーシャルの中では、要素が <code>article</code>、0から始まる番号が{' '}
            <code>article_counter</code>、先頭・末尾の判定に使えるオブジェクトが <code>article_iteration</code> というローカル変数になります。
          </p>
          <Code
            lang="ruby"
            title="actionview/lib/action_view/renderer/collection_renderer.rb（182〜197行目）"
            href={`${GH}/actionview/lib/action_view/renderer/collection_renderer.rb#L182-L197`}
            code={`
      def collection_with_template(view, template, layout, collection)
        locals = @locals
        cache = {}

        partial_iteration = PartialIteration.new(collection.size)

        collection.each_with_info.map do |object, (path, as, counter, iteration)|
          index = partial_iteration.index

          locals[as]        = object
          locals[counter]   = index
          locals[iteration] = partial_iteration

          _template = (cache[path] ||= (template || find_template(path, @locals.keys + [as, counter, iteration])))

          content = _template.render(view, locals, implicit_locals: [counter, iteration])
`}
          />
          <p>
            テンプレートの探索は最初の要素で1回だけ行い、残りの要素では同じ Template の <code>render</code> を呼びます。イベントも render_collection の1件（count=3）にまとまります。各要素で{' '}
            <code>{'<%= render partial: "article", locals: { article: a } %>'}</code> と書くと、要素の数だけパーシャルの描画の処理が繰り返されます。
          </p>
          <p>
            パーシャルの中で関連をたどると、<ChapterLink n={13} section="n-plus-one" />
            の N+1 が起きます。パーシャルに分けると SQL を発行している場所がテンプレートからは見えにくくなるので、コントローラーで <code>includes</code> を付けるか、
            <code>strict_loading</code> で検出します。
          </p>
        </>
      ),
    },
    {
      id: 'helpers',
      title: 'ヘルパーとビューのクラス',
      body: (
        <>
          <p>
            テンプレートの中で <code>link_to</code> や <code>articles_path</code>、自分で書いた ApplicationHelper のメソッドを呼べるのは、ビューのクラスがそれらのモジュールを include しているからです。ビューのクラスはコントローラーごとに作られます。
          </p>
          <Code
            lang="ruby"
            title="actionview/lib/action_view/rendering.rb（59〜74行目）"
            href={`${GH}/actionview/lib/action_view/rendering.rb#L59-L74`}
            code={`
      def build_view_context_class(klass, supports_path, routes, helpers)
        if inherit_view_context_class?
          return superclass.view_context_class
        end

        Class.new(klass) do
          if routes
            include routes.url_helpers(supports_path)
            include routes.mounted_helpers
          end

          if helpers
            include helpers
          end
        end
      end
`}
          />
          <p>
            <code>klass</code> は前節の <code>compiled_method_container</code> にあたる無名のクラスで、その子クラスにルーティングの URL ヘルパーとコントローラーのヘルパーのモジュールを include
            します。ArticlesController のビューのクラスの祖先を先頭から6つ表示しました。
          </p>
          <Code
            lang="text"
            code={`
#<Class:0x00007f6249cf6f40>
ApplicationController::HelperMethods
ApplicationHelper
ActionController::Base::HelperMethods
Importmap::ImportmapTagsHelper
#<Module:0x00007f624a3103e0>
ApplicationHelper included? true
`}
          />
          <p>
            <code>ApplicationController::HelperMethods</code> は、コントローラーで <code>helper_method :current_user</code> と宣言したメソッドを、ビューからコントローラーへ転送するためのモジュールです。
            <code>config.action_controller.include_all_helpers</code> の既定値は true で、ActionController::Base を直接継承するクラス（通常は ApplicationController）に <code>helper :all</code> が適用され、その子クラスのコントローラーはそれを引き継ぎます
            <Ref n={4} />。このため、app/helpers にあるすべてのヘルパーが、どのコントローラーのビューからも呼べます。別のファイルに同じ名前のメソッドがあると、後から include
            されたほうが使われるので、ヘルパーのメソッド名はファイルが違っても重ならないようにします。
          </p>
        </>
      ),
    },
    {
      id: 'form',
      title: 'フォームから保存まで',
      body: (
        <>
          <p>
            フォームを送信すると、ルーティング（<ChapterLink n={9} />）、コントローラー（<ChapterLink n={10} />）、モデルの保存（<ChapterLink n={11} section="crud" />）、ビューの描画が順に実行されます。記事の作成画面を例に、保存ボタンを押してから記事の画面が表示されるまでを追います。この節の確認のため、デモのアプリケーションに次のコードを加えました。
          </p>
          <Code
            lang="ruby"
            title="config/routes.rb・app/models/article.rb（追加した行）"
            code={`
resources :articles, only: [:index, :show, :new, :create, :edit, :update]

class Article < ApplicationRecord
  validates :title, presence: true
  # …（第11章のモデルの定義はそのまま）
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/articles_controller.rb（追加したアクション）"
            code={`
class ArticlesController < ApplicationController
  before_action :set_article, only: %i[edit update]

  def new
    @article = Article.new
  end

  def create
    @article = Article.new(article_params)
    if @article.save
      redirect_to @article, notice: "記事を作成しました"
    else
      render :new, status: :unprocessable_content
    end
  end

  def edit
  end

  def update
    if @article.update(article_params)
      redirect_to @article, notice: "記事を更新しました"
    else
      render :edit, status: :unprocessable_content
    end
  end

  private

  def set_article
    @article = Article.find(params[:id])
  end

  def article_params
    params.expect(article: [:title, :body])
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/articles/new.html.erb・_form.html.erb"
            code={`
<%# new.html.erb（edit.html.erb は見出しだけが違う） %>
<h1>記事の作成</h1>
<%= render "form", article: @article %>

<%# _form.html.erb %>
<%= form_with model: article do |f| %>
  <% if article.errors.any? %>
    <ul>
      <% article.errors.full_messages.each do |message| %>
        <li><%= message %></li>
      <% end %>
    </ul>
  <% end %>
  <div>
    <%= f.label :title %>
    <%= f.text_field :title %>
  </div>
  <div>
    <%= f.label :body %>
    <%= f.textarea :body %>
  </div>
  <%= f.submit %>
<% end %>
`}
          />
          <p>
            <code>resources</code> の <code>new</code>・<code>create</code>・<code>edit</code>・<code>update</code> は、それぞれ GET /articles/new、POST /articles、GET
            /articles/:id/edit、PATCH /articles/:id へのルートを作ります。作成画面を開いてから保存するまでの流れは、図 16-6 のとおりです。
          </p>
          <Figure n="16-6" title="フォームの送信から保存まで" caption="デモのアプリケーション（development）で、作成画面を開き、空のタイトルと正しいタイトルで送信した結果をまとめた図。">
            <FormFlowFigure />
          </Figure>
          <h3>form_with が作る HTML</h3>
          <p>GET /articles/new で返った HTML のうち、フォームの部分です（トークンの値は省略）。</p>
          <Code
            lang="html"
            code={`
<form action="/articles" accept-charset="UTF-8" method="post"><input type="hidden" name="authenticity_token" value="（省略）" />
  <div>
    <label for="article_title">Title</label>
    <input type="text" name="article[title]" id="article_title" />
  </div>
  <div>
    <label for="article_body">Body</label>
    <textarea name="article[body]" id="article_body">
</textarea>
  </div>
  <input type="submit" name="commit" value="Create Article" data-disable-with="Create Article" />
</form>
`}
          />
          <ul>
            <li>
              <code>form_with model: article</code> は、<code>article</code> が保存前（<code>new_record?</code> が真）なので、送信先を <code>/articles</code>、メソッドを POST にしました。
            </li>
            <li>
              <code>f.text_field :title</code> は、入力欄の名前を <code>article[title]</code> にします。この名前が、次に見る <code>params</code> の形を決めます。
            </li>
            <li>
              <code>authenticity_token</code> は、このアプリケーションが出したフォームからの送信であることを確かめるための値です（<ChapterLink n={21} section="csrf" />）。トークンを付けずに POST
              すると、保存されずに 422 が返りました。
            </li>
            <li>
              ラベルの <code>Title</code> とボタンの <code>Create Article</code> は、属性名とモデル名から作られた英語の文字列です。日本語にするには config/locales の翻訳ファイルに書きます。
            </li>
          </ul>
          <h3>送信された値が params に届くまで</h3>
          <p>タイトルに「フォームの例」、本文に「本文」を入れて送信すると、create アクションの params は次のようになりました（authenticity_token は省略）。</p>
          <Code
            lang="ruby"
            code={`
{"article" => {"title" => "フォームの例", "body" => "本文"}, "commit" => "Create Article",
 "controller" => "articles", "action" => "create"}
`}
          />
          <p>
            ブラウザーは <code>article[title]=フォームの例&amp;article[body]=本文</code> の形で値を送り、Rails は角かっこの名前を入れ子の Hash に組み立てます。
            <code>params.expect(article: [:title, :body])</code> は、<code>"article"</code> の中から <code>title</code> と <code>body</code> だけを取り出して許可します（
            <ChapterLink n={10} section="params" />）。その値を <code>Article.new</code> に渡してオブジェクトを作り、<code>save</code> を呼びます。
          </p>
          <h3>成功したとき：リダイレクト</h3>
          <Code
            lang="text"
            code={`
POST /articles   → 302  Location: http://localhost/articles/10009
                   SQL: BEGIN / INSERT INTO \`articles\` … / COMMIT
GET /articles/10009（ブラウザーがリダイレクト先を取得） → 200
flash[:notice] => "記事を作成しました"
`}
          />
          <p>
            <code>save</code> が true を返すと、<code>redirect_to @article</code> が 302 の応答を返します。<code>@article</code> を渡すと、Rails はモデル名と id から記事の画面のパス
            /articles/10009 を作ります
            <Ref n={11} />。ブラウザーはこのパスを GET で取得し直し、show アクションが記事を表示します。<code>notice:</code> に渡した文字列は flash（次のリクエストまで保存される値）に入り、リダイレクト先の画面で表示できます。
          </p>
          <p>
            保存に成功したときに描画ではなくリダイレクトを返すのは、ページを再読み込みしたときに POST が送り直されないようにするためです。POST の応答をそのまま表示していると、再読み込みでブラウザーが同じ POST
            を送り直し、記事が二重に作られることがあります。リダイレクトした後の画面は GET で取得したものなので、再読み込みしても GET が送られるだけです。
          </p>
          <h3>失敗したとき：422 とエラーの表示</h3>
          <p>タイトルを空にして送信すると、422 の応答で次のフォームが返りました。SQL は1つも実行されていません。</p>
          <Code
            lang="html"
            code={`
<form action="/articles" accept-charset="UTF-8" method="post"><input type="hidden" name="authenticity_token" value="（省略）" />
    <ul>
        <li>Title can&#39;t be blank</li>
    </ul>
  <div>
    <div class="field_with_errors"><label for="article_title">Title</label></div>
    <div class="field_with_errors"><input type="text" value="" name="article[title]" id="article_title" /></div>
  </div>
  <div>
    <label for="article_body">Body</label>
    <textarea name="article[body]" id="article_body">
本文</textarea>
  </div>
  <input type="submit" name="commit" value="Create Article" data-disable-with="Create Article" />
</form>
`}
          />
          <ul>
            <li>
              <code>render :new</code> は、create アクションの中で new のテンプレートを描画します。<code>@article</code> は送信された値とエラーを持ったままなので、入力した本文が残り、エラーの一覧が表示されます
              <Ref n={11} />。リダイレクトすると次のリクエストで <code>@article</code> が作り直されるので、入力した値とエラーは失われます。
            </li>
            <li>
              エラーのある項目は <code>field_with_errors</code> というクラスの div で囲まれます。Rails 8.1.4.1 の <code>ActionView::Base.field_error_proc</code> の既定の処理です（
              <code>base.rb</code> の 162 行目）
              <Ref n={13} />。CSS でこのクラスに色を付ければ、エラーの項目を目立たせられます。
            </li>
            <li>
              状態コードを 422 にするのは、送信が失敗したことをブラウザーに伝えるためです。Rails の既定で入っている Turbo（リンクやフォームの送信を JavaScript で処理するライブラリ。
              <ChapterLink n={17} section="drive" />）は、フォームの送信に 200 の応答が返ると画面を書き換えません。Rails ガイドには <code>:unprocessable_entity</code> と書いた例もありますが、Rails 8.1.4.1 はどちらも 422
              に変換します（<code>response.rb</code> の 51〜59 行目）
              <Ref n={14} />。
            </li>
          </ul>
          <h3>編集のフォームと _method</h3>
          <p>保存済みの記事で GET /articles/10009/edit を開くと、フォームは次のようになりました（抜粋）。</p>
          <Code
            lang="html"
            code={`
<form action="/articles/10009" accept-charset="UTF-8" method="post"><input type="hidden" name="_method" value="patch" /><input type="hidden" name="authenticity_token" value="（省略）" />
    <input type="text" value="フォームの例" name="article[title]" id="article_title" />
  <input type="submit" name="commit" value="Update Article" data-disable-with="Update Article" />
`}
          />
          <p>
            記事が保存済みなので、送信先は /articles/10009 になり、入力欄には現在の値が入り、ボタンは <code>Update Article</code> になりました。HTML のフォームは GET と POST しか送れないため、
            <code>form_with</code> は POST のフォームに <code>_method=patch</code> を加えます
            <Ref n={12} />。<ChapterLink n={6} />で見た Rack::MethodOverride がこの値を見て要求のメソッドを PATCH に変えるので、ルーティングは update アクションを選びます。送信すると params に{' '}
            <code>"_method" =&gt; "patch"</code> が入った状態で update が呼ばれ、302 が返りました。
          </p>
        </>
      ),
    },
    {
      id: 'escape',
      title: '自動エスケープと SafeBuffer',
      body: (
        <>
          <p>
            <code>{'<%= %>'}</code> は <code>append=</code> に変換されました。append= は ActionView::OutputBuffer の <code>{'<<'}</code> の別名で、値が{' '}
            <code>html_safe?</code> でなければエスケープしてから足します
            <Ref n={5} />。
          </p>
          <Code
            lang="ruby"
            title="actionview/lib/action_view/buffers.rb（42〜60行目）"
            href={`${GH}/actionview/lib/action_view/buffers.rb#L42-L60`}
            code={`
    def <<(value)
      unless value.nil?
        value = value.to_s
        @raw_buffer << if value.html_safe?
          value
        else
          ERB::Util.unwrapped_html_escape(value)
        end
      end
      self
    end
    alias :concat :<<
    alias :append= :<<

    def safe_concat(value)
      @raw_buffer << value
      self
    end
    alias :safe_append= :safe_concat
`}
          />
          <p>
            普通の String の <code>html_safe?</code> は false です。<code>html_safe</code> を呼ぶと、String を継承した <Term en="SafeBuffer">ActiveSupport::SafeBuffer</Term>{' '}
            が返り、こちらの <code>html_safe?</code> は true です。SafeBuffer に普通の文字列を足すと、追加する文字列がエスケープされます。実際に確かめました。
          </p>
          <Code
            lang="text"
            code={`
String#html_safe?           false
html_safe.class             ActiveSupport::SafeBuffer
SafeBuffer << 文字列         <p>&lt;script&gt;alert(1)&lt;/script&gt;</p>
+ の結果                    <b>&lt;script&gt;alert(1)&lt;/script&gt;
% の結果                    <b>&lt;script&gt;alert(1)&lt;/script&gt;</b>
upcase 後の html_safe?      false
OutputBuffer                &lt;script&gt;alert(1)&lt;/script&gt;<br><i>ok</i>
link_to                     <a href="/x">&lt;script&gt;alert(1)&lt;/script&gt;</a> (ActiveSupport::SafeBuffer)
content_tag                 <p>&lt;script&gt;alert(1)&lt;/script&gt;</p>
sanitize                    <a>a</a>x<b>b</b>
raw                         <script>alert(1)</script>
`}
          />
          <p>
            <code>link_to</code> や <code>content_tag</code> は、引数の文字列をエスケープしたうえで、結果を SafeBuffer として返します。そのため、ヘルパーの戻り値を <code>{'<%= %>'}</code>{' '}
            で出力しても二重にエスケープされません。<code>upcase</code> や <code>gsub</code> のように内容を変えるメソッドを SafeBuffer に呼ぶと、結果は安全でないものとして扱われます（output_safety.rb の{' '}
            <code>UNSAFE_STRING_METHODS</code>）。
          </p>
          <p>
            <code>raw</code> と <code>html_safe</code> は、文字列を「エスケープ済み」と宣言するだけで、中身を検査しません。利用者の入力に使うと XSS
            になります。利用者が書いた HTML の一部を許可したい場合は、許可したタグと属性以外を取り除く <code>sanitize</code> を使います。上の例では <code>href="javascript:..."</code>、
            <code>onclick</code>、<code>{'<script>'}</code> のタグが取り除かれました。XSS の対策全体は<ChapterLink n={21} />で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'assets',
      title: 'アセットの配信',
      body: (
        <>
          <p>
            CSS・JavaScript・画像などのファイル（<Term en="assets">アセット</Term>）について、Rails 8 の新規アプリケーションは Propshaft を使います。Propshaft がするのは、読み込みパス（アセットを探すディレクトリの一覧）にあるファイルを、内容のダイジェストを付けた名前で配信することと、CSS
            の中の <code>url()</code> をダイジェスト付きのパスに書き換えることだけで、変換・結合・圧縮はしません
            <Ref n={6} />。ダイジェストは内容の SHA1 の先頭8文字です。
          </p>
          <Code
            lang="ruby"
            title="propshaft/lib/propshaft/asset.rb（47〜49行目）"
            href="https://github.com/rails/propshaft/blob/v1.3.2/lib/propshaft/asset.rb#L47-L49"
            code={`
  def digest
    @digest ||= Digest::SHA1.hexdigest("#{content_with_compile_references}#{load_path.version}").first(8)
  end
`}
          />
          <p>デモのアプリケーション（開発環境）で、ヘルパーの出力と配信の結果を確かめました。</p>
          <Code
            lang="text"
            code={`
stylesheet_link_tag :app    <link rel="stylesheet" href="/assets/application-8b441ae0.css" />
middleware: ["ActionDispatch::Static", "Propshaft::Server", "Propshaft::QuietAssets"]
load_path: ["app/assets/images", "app/assets/stylesheets", "app/javascript", "vendor/javascript",
            "stimulus-rails-1.3.4/app/assets/javascripts", "turbo-rails-2.0.23/app/assets/javascripts", ...]
GET /assets/application-8b441ae0.css => 200 {"content-type" => "text/css; charset=utf-8",
  "cache-control" => "public, max-age=31536000, immutable", "etag" => "\\"8b441ae0\\""} 491B
古いダイジェスト => 404
ダイジェストなし => 404
`}
          />
          <p>
            開発環境では Propshaft::Server というミドルウェアが <code>/assets</code> へのリクエストを受け、読み込みパスからファイルを探して返します。内容が変わればダイジェストも変わるので、1年間（31536000
            秒）キャッシュさせても、新しい内容は別の URL になります。本番環境では、デプロイ時に <code>bin/rails assets:precompile</code> がファイルを public/assets に書き出します。
          </p>
          <Code
            lang="text"
            code={`
$ RAILS_ENV=production SECRET_KEY_BASE_DUMMY=1 bin/rails assets:precompile
$ ls public/assets
application-8b441ae0.css  application-bfcdf840.js  controllers  turbo.min-9fd88cd5.js  stimulus.min-4b1e420e.js ...
$ head -c 120 public/assets/.manifest.json
{"application.css":{"digested_path":"application-8b441ae0.css","integrity":null},"controllers/index.js":...
`}
          />
          <p>
            本番環境のヘルパーは、元のファイル名とダイジェスト付きのファイル名の対応表（マニフェスト）である .manifest.json から URL を引きます（Propshaft の assembly.rb は、マニフェストのファイルがあれば Resolver::Static を使います）。public/assets のファイルは、Nginx
            が直接返すように設定するのが一般的です（<ChapterLink n={24} />
            ）。Nginx を置かない場合は、Rails の ActionDispatch::Static が public のファイルを返します。
          </p>
          <Figure n="16-7" title="開発環境と本番環境のアセット配信" caption="propshaft 1.3.2 の server.rb・assembly.rb・railtie.rb と、デモアプリケーションでの実測をもとにした模式図。">
            <AssetFigure />
          </Figure>
          <p>
            JavaScript については、デモでは import maps を使いました。<code>javascript_importmap_tags</code> は、論理名とダイジェスト付きの URL の対応表を HTML に埋め込みます。ブラウザーは{' '}
            <code>import "@hotwired/turbo-rails"</code> をこの表で URL に置き換えて読み込むので、Node.js での結合（バンドル）が要りません
            <Ref n={7} />。
          </p>
          <Code
            lang="html"
            code={`
<script type="importmap" data-turbo-track="reload">{
  "imports": {
    "application": "/assets/application-bfcdf840.js",
    "@hotwired/turbo-rails": "/assets/turbo.min-9fd88cd5.js",
    "@hotwired/stimulus": "/assets/stimulus.min-4b1e420e.js",
    ...
  }
}</script>
<link rel="modulepreload" href="/assets/application-bfcdf840.js">
<link rel="modulepreload" href="/assets/turbo.min-9fd88cd5.js">
...
<script type="module">import "application"</script>
`}
          />
          <p>アセットの扱い方は、次の4つの組み合わせで決まります。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>gem</th>
                  <th>すること</th>
                  <th>しないこと・前提</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sprockets（sprockets-rails）</td>
                  <td>
                    <code>//= require</code> などの指示による結合、Sass（CSS に変数などの書き方を加えた言語）などの変換、ダイジェスト付きの配信
                    <Ref n={8} />
                  </td>
                  <td>Rails 7.2 までの既定。ES モジュールの import の解決はしない</td>
                </tr>
                <tr>
                  <td>Propshaft</td>
                  <td>ダイジェスト付きの配信、CSS の url() の書き換え</td>
                  <td>Rails 8 の既定。変換・結合・圧縮はしない。読み込み順の管理もしない</td>
                </tr>
                <tr>
                  <td>importmap-rails</td>
                  <td>import maps の表を出力し、ブラウザーに ES モジュールを直接読み込ませる</td>
                  <td>TypeScript や JSX の変換はできない。npm のパッケージは vendor/javascript に置く</td>
                </tr>
                <tr>
                  <td>jsbundling-rails・cssbundling-rails</td>
                  <td>esbuild・Bun・rollup・webpack などで結合した結果を app/assets/builds に出力し、配信は Sprockets か Propshaft に任せる</td>
                  <td>
                    Node.js などが必要。<code>assets:precompile</code> の前に build が実行される
                    <Ref n={9} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            業務のアプリケーションでどれを使っているかは、Gemfile（sprockets-rails か propshaft か）、<code>config/importmap.rb</code> の有無、package.json の build
            スクリプトの有無で判断できます。
          </p>
          <Callout kind="v72">
            <p>
              ビューの描画（探索・コンパイル・SafeBuffer）の仕組みは、Rails 7.2.4 の actionview でも同じです。違うのはアセットで、7.2 の <code>rails new</code> は{' '}
              <code>--asset-pipeline</code> の既定値が <code>sprockets</code> です
              <Ref n={10} />。8.0 から Propshaft が既定になりました（railties の 8.0.0 の CHANGELOG）。Sprockets のアプリケーションでは、本番のファイルは public/assets に{' '}
              <code>.sprockets-manifest-（ランダムな文字列）.json</code> と一緒に書き出されます。
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
          <li>テンプレートは HTML に Ruby のコードを埋め込んだ型です。{'<%= %>'} は式の結果を出力し、{'<% %>'} はコードを実行するだけで出力しません。ブラウザーが受け取るのは描画した後の HTML です。</li>
          <li>レイアウトの yield の位置にアクションのテンプレートの出力が入り、render で呼んだパーシャルの出力がその中に入ります。</li>
          <li>ブラウザーは HTML の link や script のタグを読み、CSS・JavaScript・画像を別の要求で取得します。2回目からは、ダイジェスト付きの URL のファイルをキャッシュから読みます。</li>
          <li>
            <code>form_with model:</code> は、保存前なら POST /articles、保存済みなら <code>_method=patch</code> 付きで /articles/:id に送るフォームを作ります。入力欄の名前{' '}
            <code>article[title]</code> が、params の入れ子の Hash になります。
          </li>
          <li>
            保存に成功したら <code>redirect_to</code> で 302 を返して記事の画面を GET させ、失敗したら <code>render :new, status: :unprocessable_content</code> で入力値とエラーを残したフォームを 422 で返します。
          </li>
          <li>render_to_body が描画のたびにビューのインスタンスを作り、コントローラーのインスタンス変数を同じ名前でコピーします。</li>
          <li>テンプレートは、名前と接頭辞、locale・formats・variants・handlers の条件で探されます。ファイル名の各部分がこの条件に対応します。</li>
          <li>ERB は Erubi で Ruby のコードに変換され、最初の描画のときに無名のクラスのメソッドとして定義されます。2回目以降はそのメソッドを呼ぶだけです。</li>
          <li>テンプレートを描画してからレイアウトを描画します。コレクションの描画では、パーシャルの探索は1回で、要素・番号・iteration がローカル変数になります。</li>
          <li>ビューのクラスはコントローラーごとに作られ、URL ヘルパーとヘルパーのモジュールを include しています。既定では app/helpers のすべてが使えます。</li>
          <li>{'<%= %>'} の出力は html_safe? でなければエスケープされます。raw と html_safe は中身を検査しないので、利用者の入力には使いません。</li>
          <li>Propshaft はダイジェスト付きの配信だけを行い、結合や変換が必要なら jsbundling を、結合せずに ES モジュールのまま配信するなら importmap を組み合わせます。本番のファイルは assets:precompile で public/assets に出力され、Nginx から配信できます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'actionview/lib/action_view/rendering.rb・actionpack/lib/abstract_controller/rendering.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionview/lib/action_view/rendering.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'render_to_body、view_context、view_assigns、build_view_context_class。' },
    { title: 'actionview/lib/action_view/template/resolver.rb・lookup_context.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionview/lib/action_view/template/resolver.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'ファイル名を分解する正規表現、探索結果の並べ替え、locale・formats・variants・handlers の既定値。' },
    { title: 'actionview/lib/action_view/template.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionview/lib/action_view/template.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'render、compile!、compiled_source、method_name。' },
    { title: 'actionpack/lib/action_controller/metal/helpers.rb・railties/helpers.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/helpers.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'include_all_helpers の既定値 true と、ApplicationController の子クラスに helper :all を適用する処理。' },
    { title: 'actionview/lib/action_view/buffers.rb・activesupport/lib/active_support/core_ext/string/output_safety.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionview/lib/action_view/buffers.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'OutputBuffer の append= と safe_append=、SafeBuffer の concat・UNSAFE_STRING_METHODS。' },
    { title: 'The Asset Pipeline', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/asset_pipeline.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Propshaft は変換・結合・圧縮をせず、ダイジェスト付きの配信に絞ること。Sprockets との違い。' },
    { title: 'importmap-rails README', publisher: 'rails/importmap-rails（GitHub）', url: 'https://github.com/rails/importmap-rails/blob/v2.2.3/README.md', accessed: '2026-11-11', version: 'importmap-rails 2.2.3', note: 'import maps でバンドルせずに ES モジュールを読み込むこと、modulepreload、vendor/javascript へのダウンロード。' },
    { title: 'Sprockets README（Directives）', publisher: 'rails/sprockets（GitHub）', url: 'https://github.com/rails/sprockets/blob/v4.4.1/README.md', accessed: '2026-11-11', version: 'Sprockets 4.4.1', note: 'require・require_tree などの指示によるファイルの結合。' },
    { title: 'jsbundling-rails README', publisher: 'rails/jsbundling-rails（GitHub）', url: 'https://github.com/rails/jsbundling-rails/blob/v1.3.1/README.md', accessed: '2026-11-11', version: 'jsbundling-rails 1.3.1', note: '結合の結果を app/assets/builds に置き、assets:precompile の前に javascript:build を実行すること。' },
    { title: 'railties/lib/rails/generators/app_base.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/railties/lib/rails/generators/app_base.rb#L77-L79', accessed: '2026-11-11', version: 'Rails 7.2.4', note: 'rails new の --asset-pipeline の既定値が sprockets であること。' },
    { title: 'Getting Started with Rails（Creating Products・Editing Products）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/getting_started.html', accessed: '2026-11-13', version: 'Rails 8.1', note: 'save に成功したら redirect_to でモデルの show のパスへ移動し、失敗したら render :new で入力値を残したフォームを 422 で返す書き方。' },
    { title: 'Action View Form Helpers（Forms with PATCH, PUT, or DELETE Methods）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/form_helpers.html', accessed: '2026-11-13', version: 'Rails 8.1', note: 'form_with model: の送信先と入力欄の名前、authenticity_token の hidden 項目、_method による PATCH の表現。' },
    { title: 'actionview/lib/action_view/base.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionview/lib/action_view/base.rb#L162`, accessed: '2026-11-13', version: 'Rails 8.1.4.1', note: 'field_error_proc の既定値が field_with_errors の div で囲む処理であること。' },
    { title: 'actionpack/lib/action_dispatch/http/response.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/http/response.rb#L51-L59`, accessed: '2026-11-13', version: 'Rails 8.1.4.1', note: ':unprocessable_entity と :unprocessable_content を、Rack のバージョンに合わせて同じ 422 に変換する rack_status_code。' },
    { title: 'Action View Overview（ERB）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/action_view_overview.html', accessed: '2026-11-16', version: 'Rails 8.1', note: '<% %> は Ruby のコードを実行して結果を出力せず、<%= %> は結果を出力すること。テンプレートの出力例はデモ（Rails 8.1.4.1）で実測。' },
    { title: 'Layouts and Rendering in Rails（yield・content_for・Using Partials）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/layouts_and_rendering.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'レイアウトの yield にビューの内容が入ること、content_for、パーシャルのファイル名を _ で始めること、ローカル変数とコレクションの描画。' },
    { title: 'Basic HTML syntax', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax', accessed: '2026-11-16', note: '要素・開始タグ・終了タグ・属性。' },
    { title: 'Populating the page: how browsers work', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work', accessed: '2026-11-16', note: 'ブラウザーが HTML を読みながら、CSS・JavaScript・画像などを別に要求して取得すること。要求の記録はデモ（Chrome）で実測。' },
    { title: 'HTTP caching', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching', accessed: '2026-11-16', note: 'ブラウザーが応答を保存して再利用すること。内容が変わったら URL を変えて取り直させる方法（cache busting）。' },
  ],
}

export default withExplanations(ch16, explanation16)
