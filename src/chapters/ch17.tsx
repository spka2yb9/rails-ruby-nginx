import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation17 } from '../explanations/features'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const TR = 'https://github.com/hotwired/turbo-rails/blob/v2.0.23'

/* ---------- 図 17-3 Turbo の要求と応答 ---------- */
function RequestsFigure() {
  const rows = [
    { what: 'Turbo Drive', act: 'リンクのクリック', req: ['Accept: text/html, …'], res: ['200 HTML（ページ全体）'], turbo: ['<body> を入れ替え、', '<head> を合わせる'] },
    { what: 'Turbo Frames', act: 'フレーム内の操作', req: ['Accept: text/html, …', 'Turbo-Frame: comment_form'], res: ['200 HTML（レイアウトは', 'turbo_rails/frame）'], turbo: ['同じ id の <turbo-frame>', 'だけを取り出して入れ替え'] },
    { what: 'Turbo Streams', act: 'POST などの送信', req: ['Accept: text/vnd.turbo-', 'stream.html, text/html, …'], res: ['200（turbo-stream 形式）', '<turbo-stream> の並び'], turbo: ['action と target に従い', 'ページの一部を変更'] },
  ]
  const rowH = 74
  return (
    <Svg
      id="17-3"
      w={796}
      h={rows.length * rowH + 50}
      label="Turbo Drive はリンクのクリックを Accept: text/html の要求に変え、応答のページ全体から body を入れ替える。Turbo Frames は Turbo-Frame ヘッダーにフレームの id を入れて要求し、応答から同じ id の turbo-frame 要素だけを取り出して入れ替える。Turbo Streams は POST などのフォーム送信の Accept に text/vnd.turbo-stream.html を加え、応答の turbo-stream 要素の action と target に従ってページの一部を変更する"
    >
      {['', 'ブラウザーの操作', '要求（ヘッダー）', 'サーバーの応答', 'Turbo がすること'].map((h, i) => (
        <T key={h} x={[20, 120, 248, 440, 642][i]} y={20} bold fs={12}>
          {h}
        </T>
      ))}
      {rows.map((r, i) => {
        const y = 36 + i * rowH
        return (
          <g key={r.what}>
            <Box x={10} y={y} w={100} h={rowH - 12} lines={r.what} fs={12} bold fill="box5" />
            <Box x={116} y={y} w={120} h={rowH - 12} lines={r.act} fs={11.5} fill="bg" />
            <Box x={242} y={y} w={186} h={rowH - 12} lines={r.req} mono fs={10.5} fill="box2" />
            <Box x={434} y={y} w={196} h={rowH - 12} lines={r.res} fs={11} fill="box4" />
            <Box x={636} y={y} w={150} h={rowH - 12} lines={r.turbo} fs={11} fill="box" />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 17-4 Turbo Frame の置き換え ---------- */
function FrameFigure() {
  return (
    <Svg
      id="17-4"
      w={760}
      h={300}
      label="記事のページには id が comment_form の turbo-frame があり、中に「コメントを書く」のリンクがある。クリックすると Turbo-Frame: comment_form を付けて /articles/1/comments/new を要求する。応答の HTML には h1 の「コメントの作成」と、同じ id の turbo-frame に入ったフォームがある。Turbo は同じ id の turbo-frame の中身だけを取り出してページのフレームを入れ替え、h1 は捨てる。URL は /articles/1 のまま変わらない"
    >
      <T x={20} y={20} bold>
        表示中のページ（/articles/1）
      </T>
      <rect x={20} y={32} width={300} height={200} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={34} y={54} fs={12}>
        {'<h1>変更後のタイトル</h1>'}
      </T>
      <T x={34} y={80} fs={11.5} tone="muted">
        {'<ul id="comments"> …'}
      </T>
      <Box x={34} y={110} w={272} h={90} lines={['<turbo-frame id="comment_form">', 'コメントを書く（リンク）', '→ フォームに入れ替わる']} mono fs={11} fill="box5" />
      <T x={34} y={218} fs={11} tone="muted">
        URL は変わらない
      </T>
      <Arrow d="M306,140 C360,120 380,90 438,80" />
      <T x={380} y={112} anchor="middle" fs={10.5} tone="muted" mono>
        Turbo-Frame:
      </T>
      <T x={380} y={126} anchor="middle" fs={10.5} tone="muted" mono>
        comment_form
      </T>
      <T x={440} y={20} bold>
        応答（/articles/1/comments/new）
      </T>
      <rect x={440} y={32} width={300} height={200} rx={8} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={454} y={54} fs={12} tone="muted">
        {'<h1>コメントの作成</h1>（捨てる）'}
      </T>
      <Box x={454} y={76} w={272} h={90} lines={['<turbo-frame id="comment_form">', '<form action="/articles/1/comments">', '…']} mono fs={11} fill="box5" />
      <T x={454} y={186} fs={11} tone="muted">
        レイアウトは turbo_rails/frame
      </T>
      <T x={454} y={204} fs={11} tone="muted">
        （本文 981 バイト、通常は 2541 バイト）
      </T>
      <Arrow d="M454,150 C400,200 360,200 306,176" accent />
      <T x={380} y={250} anchor="middle" fs={11} tone="acc">
        同じ id のフレームの中身だけを入れ替える
      </T>
    </Svg>
  )
}

/* ---------- 図 17-5 ActionCable の構成 ---------- */
function CableFigure() {
  return (
    <Svg
      id="17-5"
      w={800}
      h={420}
      label="ブラウザーは /cable に WebSocket で接続する。Puma のスレッドは Rack の hijack でソケットを ActionCable に渡し、すぐに次の要求の処理に戻る。ActionCable のサーバーは、ソケットを監視するイベントループのスレッド、チャネルの処理を実行するワーカープール（既定で4スレッド）、3秒ごとの ping を持つ。stream_from はサブスクリプションアダプターで購読し、コントローラーなどのブロードキャストはアダプター経由で全プロセスに届く。アダプターが async の場合は同じプロセスの中にしか届かず、Redis や Solid Cable の場合は Puma の別のワーカーや Sidekiq などの他のプロセスにも届く"
    >
      <Box x={20} y={30} w={140} h={50} lines={['ブラウザー', 'WebSocket']} fs={12} fill="bg" subTone="muted" />
      <Arrow x1={160} y1={55} x2={206} y2={55} both />
      <T x={183} y={40} anchor="middle" fs={10} tone="muted" mono>
        /cable
      </T>
      <rect x={208} y={14} width={420} height={250} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={220} y={32} bold fs={12.5}>
        Puma のプロセス（1つ）
      </T>
      <Box x={222} y={44} w={180} h={50} lines={['Puma のスレッド', 'hijack して手放す']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={402} y1={69} x2={432} y2={69} />
      <rect x={434} y={44} width={184} height={206} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <T x={444} y={60} fs={11.5} tone="acc">
        ActionCable.server
      </T>
      <Box x={444} y={72} w={164} h={44} lines={['イベントループ', '（nio4r、1スレッド）']} fs={11} fill="box" subTone="muted" />
      <Box x={444} y={124} w={164} h={44} lines={['ワーカープール', '（既定 4 スレッド）']} fs={11} fill="box" subTone="muted" />
      <Box x={444} y={176} w={164} h={30} lines="ping（3秒ごと）" fs={11} fill="box" />
      <Box x={444} y={212} w={164} h={30} lines="stream_from の購読" fs={11} fill="box2" />
      <Box x={222} y={130} w={180} h={50} lines={['コントローラー', 'broadcast_append_to']} fs={11.5} fill="box" subTone="muted" />
      <Box x={434} y={300} w={184} h={60} lines={['アダプター', 'Redis / Solid Cable', '（async は自プロセスのみ）']} fs={11} fill="box4" subTone="muted" />
      <Arrow x1={526} y1={242} x2={526} y2={298} both />
      <Arrow d="M312,180 L312,330 L432,330" />
      <T x={320} y={318} fs={10.5} tone="muted">
        broadcast
      </T>
      <Box x={650} y={290} w={140} h={44} lines={['Puma の別のワーカー', '（別プロセス）']} fs={11} fill="box" subTone="muted" />
      <Box x={650} y={346} w={140} h={44} lines={['Sidekiq・rails runner', '（別プロセス）']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={648} y1={312} x2={620} y2={312} dashed both />
      <Arrow d="M648,368 L634,368 L634,346 L620,346" dashed />
      <T x={20} y={396} fs={11} tone="muted">
        破線：アダプター経由のブロードキャスト
      </T>
      <T x={20} y={412} fs={11} tone="muted">
        チャネルの処理で DB を使うと、ワーカープールのスレッドの数だけ接続が要る（第15章）
      </T>
    </Svg>
  )
}

/* ---------- 図 17-6 ブロードキャストの流れ ---------- */
function BroadcastFigure() {
  const lanes = [
    { x: 80, t: 'ブラウザー A' },
    { x: 260, t: 'Rails（Puma）' },
    { x: 450, t: 'Redis' },
    { x: 640, t: 'ブラウザー B' },
  ]
  const msgs: { from: number; to: number; y: number; t: string; acc?: boolean; dashed?: boolean }[] = [
    { from: 0, to: 1, y: 70, t: 'POST /articles/1/comments' },
    { from: 1, to: 2, y: 130, t: 'PUBLISH demo_development:Z2lk…', acc: true },
    { from: 2, to: 1, y: 170, t: 'サブスクライバーに配送', acc: true },
    { from: 1, to: 3, y: 210, t: 'ws: <turbo-stream action="append">', acc: true },
    { from: 1, to: 0, y: 250, t: 'ws: 同じメッセージ', acc: true, dashed: true },
    { from: 1, to: 0, y: 290, t: '200 turbo-stream の応答' },
  ]
  return (
    <Svg
      id="17-6"
      w={760}
      h={330}
      label="ブラウザー A がコメントを POST する。Rails は INSERT と COMMIT の後の after_create_commit で broadcast_append_to を呼び、Redis にチャネル demo_development:Z2lk… で PUBLISH する。Redis は購読している Rails のプロセスに配送し、ActionCable が WebSocket でブラウザー B と A に turbo-stream の append を送る。その後で A に POST の応答が返る。A では同じ id の要素が既にあれば置き換えられるので、コメントは1件だけ表示される"
    >
      {lanes.map((l) => (
        <g key={l.t}>
          <T x={l.x} y={20} anchor="middle" bold fs={12.5}>
            {l.t}
          </T>
          <line x1={l.x} y1={32} x2={l.x} y2={316} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <Box x={200} y={86} w={120} h={30} lines="save → COMMIT" fs={11} fill="box" />
      {msgs.map((m) => {
        const x1 = lanes[m.from].x
        const x2 = lanes[m.to].x
        return (
          <g key={m.t}>
            <Arrow x1={x1} y1={m.y} x2={x2 + (x2 > x1 ? -4 : 4)} y2={m.y} accent={m.acc} dashed={m.dashed} />
            <T x={(x1 + x2) / 2} y={m.y - 10} anchor="middle" fs={10.5} mono tone={m.acc ? 'acc' : undefined}>
              {m.t}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 17-1 通常の移動と Turbo Drive の移動 ---------- */
function NavigationFigure() {
  const col = (x: number, title: string, steps: { t: string[]; fill: 'box' | 'box4' | 'box5' | 'bg' }[], result: string) => (
    <g>
      <T x={x} y={20} bold fs={12.5}>
        {title}
      </T>
      {steps.map((s, i) => (
        <g key={s.t[0]}>
          <Box x={x} y={34 + i * 62} w={350} h={46} lines={s.t} fs={11.5} fill={s.fill} subTone="muted" />
          {i < steps.length - 1 && <Arrow x1={x + 175} y1={80 + i * 62} x2={x + 175} y2={94 + i * 62} />}
        </g>
      ))}
      <T x={x} y={34 + steps.length * 62 + 6} fs={11.5} tone="acc">
        {result}
      </T>
    </g>
  )
  return (
    <Svg
      id="17-1"
      w={780}
      h={300}
      label="左は data-turbo=false のリンクによる通常の移動。ブラウザーは表示中のページを捨て、GET /articles をページの読み込み（Document）として要求し、CSS と JavaScript を読み込み直して最初から実行する。window.__marker の値は消える。右は Turbo Drive の移動。Turbo がクリックを受け取って fetch で GET /articles を要求し、応答の body を入れ替え、head を合わせる。JavaScript は動き続け、window.__marker の値は残る。どちらもサーバーが返す HTML は同じ"
    >
      {col(
        20,
        '通常の移動（data-turbo="false"）',
        [
          { t: ['リンクをクリック', 'ブラウザーが表示中のページを捨てる'], fill: 'bg' },
          { t: ['GET /articles（Document）', 'ページとして読み込む'], fill: 'box4' },
          { t: ['CSS・JavaScript を読み込み直す', 'JavaScript を最初から実行'], fill: 'box' },
        ],
        'window.__marker → undefined（消える）'
      )}
      {col(
        410,
        'Turbo Drive の移動',
        [
          { t: ['リンクをクリック', 'Turbo がクリックを受け取る'], fill: 'bg' },
          { t: ['GET /articles（Fetch）', 'JavaScript から要求する'], fill: 'box4' },
          { t: ['応答の <body> を入れ替え', '<head> を合わせる'], fill: 'box5' },
        ],
        'window.__marker → 残る'
      )}
      <T x={20} y={270} fs={11} tone="muted">
        どちらも URL は /articles に変わり、サーバーが返す HTML は同じ。違うのは、ブラウザーが HTML を画面に反映する方法
      </T>
    </Svg>
  )
}

/* ---------- 図 17-2 HTTP の要求と応答、WebSocket ---------- */
function WebSocketFigure() {
  const lane = (x: number, label: string) => (
    <g>
      <T x={x} y={50} anchor="middle" bold fs={12}>
        {label}
      </T>
      <line x1={x} y1={60} x2={x} y2={330} stroke="var(--fig-line)" strokeDasharray="3 4" />
    </g>
  )
  const msg = (x1: number, x2: number, y: number, t: string, opt: { dashed?: boolean; accent?: boolean } = {}) => (
    <g>
      <Arrow x1={x1} y1={y} x2={x2 + (x2 > x1 ? -3 : 3)} y2={y} dashed={opt.dashed} accent={opt.accent} />
      <T x={(x1 + x2) / 2} y={y - 9} anchor="middle" fs={10.5} mono tone={opt.accent ? 'acc' : undefined}>
        {t}
      </T>
    </g>
  )
  return (
    <Svg
      id="17-2"
      w={780}
      h={360}
      label="左は HTTP。ブラウザーが要求を送り、サーバーが応答を返すと1回のやり取りが終わる。サーバーは要求が来なければ何も送れない。右は WebSocket。ブラウザーが Upgrade: websocket を付けた GET /cable を送り、サーバーが 101 Switching Protocols を返すと、同じ接続が開いたままになる。サーバーは welcome、confirm_subscription、3秒ごとの ping、別のプロセスが送った turbo-stream のメッセージを、ブラウザーの要求を待たずに送る。ブラウザーも subscribe を送れる"
    >
      <T x={20} y={20} bold fs={12.5}>
        HTTP の要求と応答
      </T>
      {lane(80, 'ブラウザー')}
      {lane(300, 'サーバー')}
      {msg(80, 300, 90, 'GET /articles/1')}
      {msg(300, 80, 126, '200 HTML', { dashed: true })}
      <T x={190} y={168} anchor="middle" fs={11} tone="muted">
        ここでやり取りは終わる
      </T>
      <T x={190} y={210} anchor="middle" fs={11} tone="muted">
        サーバーは要求が来ないと
      </T>
      <T x={190} y={228} anchor="middle" fs={11} tone="muted">
        何も送れない
      </T>
      {msg(80, 300, 280, 'GET /articles/1（次の要求）')}
      {msg(300, 80, 314, '200 HTML', { dashed: true })}

      <T x={410} y={20} bold fs={12.5}>
        WebSocket
      </T>
      {lane(470, 'ブラウザー')}
      {lane(720, 'サーバー（/cable）')}
      {msg(470, 720, 82, 'GET /cable  Upgrade: websocket')}
      {msg(720, 470, 112, '101 Switching Protocols', { dashed: true })}
      <rect x={462} y={124} width={266} height={206} rx={6} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <T x={595} y={140} anchor="middle" fs={10.5} tone="acc">
        同じ接続が開いたまま
      </T>
      {msg(720, 470, 168, '{"type":"welcome"}', { dashed: true })}
      {msg(470, 720, 198, '{"command":"subscribe", …}')}
      {msg(720, 470, 228, '{"type":"confirm_subscription"}', { dashed: true })}
      {msg(720, 470, 262, '{"type":"ping"}（3秒ごと）', { dashed: true })}
      {msg(720, 470, 300, '<turbo-stream action="append" …>', { dashed: true, accent: true })}
      <T x={595} y={348} anchor="middle" fs={10.5} tone="muted">
        サーバーから要求を待たずに送れる
      </T>
    </Svg>
  )
}

const ch17: Chapter = {
  number: 17,
  part: 4,
  title: 'Hotwire と ActionCable',
  summary:
    'ページ全体を読み込み直す移動と、JavaScript で画面の一部を書き換える方式の違い、Hotwire（Turbo と Stimulus）が受け持つこと、HTTP の要求と応答と WebSocket の違いを、ブラウザーでの記録とデモの出力で確かめてから、Turbo Drive・Frames・Streams がサーバーにどんな要求を送り、どんな応答を期待するかを、ブラウザーで記録した通信をもとに説明します。Stimulus の役割、ActionCable の WebSocket の処理とスレッド、Turbo Streams のブロードキャストがアダプターを通って各ブラウザーに届くまでも扱います。',
  goals: [
    '通常のページの移動と Turbo の移動の違いを、要求の種類と JavaScript の変数が残るかどうかで説明できる',
    'HTTP ではサーバーから送れないことと、WebSocket の接続が 101 の応答の後も開いたままになることを説明できる',
    'Turbo Drive・Frames・Streams が送るヘッダーと、サーバーが返すべき応答（303・422・turbo_stream 形式）を説明できる',
    'Turbo Frame の要求で turbo-rails が使うレイアウトと、応答から取り出される部分を説明できる',
    'Stimulus が data-controller 属性で JavaScript を HTML に結び付ける仕組みを説明できる',
    'ActionCable が WebSocket を Puma から引き取り、イベントループとワーカープールで処理することを説明できる',
    'turbo_stream_from の署名付きのストリーム名と、ブロードキャストが届く経路を説明できる',
    'サブスクリプションアダプター（async・Redis・Solid Cable）の違いと、本番環境で async を使えない理由を説明できる',
  ],
  prerequisites: [10, 14, 16],
  sections: [
    {
      id: 'page-update',
      title: 'ページの読み込み直しと一部の書き換え',
      body: (
        <>
          <p>
            ブラウザーでリンクをクリックすると、ブラウザーは通常、表示中のページを捨てて、リンク先の URL に GET の要求を送ります。届いた HTML を最初から読み、CSS と JavaScript も読み込み直して、画面を描き直します（
            <ChapterLink n={16} section="asset-requests" />
            ）。このとき、ページの中で JavaScript が持っていた値（変数など）も、ページと一緒に消えます。
          </p>
          <p>
            もう1つの方式では、ページの中で動いている JavaScript が要求を送り、受け取った内容で画面の一部だけを書き換えます。JavaScript から HTTP の要求を送るには、ブラウザーの fetch という機能を使います
            <Ref n={12} />。ブラウザーは読み込んだ HTML を要素の木の形でメモリーに持っていて、これを <Term en="Document Object Model">DOM</Term> と呼びます。JavaScript は DOM
            の要素を探したり、別の要素に置き換えたりでき、置き換えた部分の表示はすぐに変わります
            <Ref n={11} />。
          </p>
          <p>
            記事1のページ（/articles/1）を開いた状態で、ブラウザーの中で次の JavaScript を実行しました。記事2のページの HTML を fetch で取得し、その中の h1 要素で、表示中のページの h1 要素を置き換えます。
          </p>
          <Code
            lang="js"
            title="/articles/1 を開いたブラウザーで実行した JavaScript"
            code={`
window.__marker = "入れ替える前の値"          // ページの変数に値を入れておく
const res = await fetch("/articles/2")      // 記事2のページの HTML を取得する
const html = await res.text()
const doc = new DOMParser().parseFromString(html, "text/html")
document.querySelector("h1").replaceWith(doc.querySelector("h1")) // h1 だけを置き換える
`}
          />
          <Code
            lang="text"
            title="実行の前後の状態（Chrome を Playwright で操作して記録）"
            code={`
前 {"h1":"変更後のタイトル","url":"/articles/1"}
  要求: GET /articles/2 (fetch)
後 {"status":200,"h1":"タイトル2改","url":"/articles/1","marker":"入れ替える前の値","comments":2}
`}
          />
          <p>
            見出しだけが記事2のもの（タイトル2改）に変わり、URL とコメントの一覧（comments の2件）は記事1のままです。ページを読み込み直していないので、実行の前に入れた <code>window.__marker</code>{' '}
            も残っています。window はブラウザーがページごとに用意するオブジェクトで、その属性にはページの JavaScript のどこからでも参照できます。
          </p>
          <p>
            デモのアプリケーションには Turbo という JavaScript のライブラリが入っていて、リンクのクリックをこの方式に変えています。記事のページの「一覧へ」のリンクで、2つの方式を比べました。リンクに{' '}
            <code>data-turbo="false"</code> という属性を付けると、Turbo はそのリンクを扱わないので、ブラウザーの通常の移動になります。どちらもクリックの前に <code>window.__marker</code> に値を入れておきました。
          </p>
          <Code
            lang="text"
            title="「一覧へ」をクリックしたときの要求（Chrome の記録。type は要求の種類。一部を省略）"
            code={`
--- data-turbo="false" のリンク（通常の移動）
  GET /articles                           type=Document   status=200
  GET /assets/application-8b441ae0.css    type=Stylesheet status=200  ← ブラウザーのキャッシュから
  GET /assets/application-bfcdf840.js     type=Script     status=200  ← キャッシュから
  GET /assets/turbo.min-9fd88cd5.js       type=Script     status=200  ← キャッシュから
  …（JavaScript があと5つ、アイコンが2つ。どれもキャッシュから）
  移動後: URL=/articles window.__marker=undefined

--- Turbo Drive のリンク
  GET /articles                           type=Fetch      status=200
  GET /icon.svg                           type=Other      status=200  ← キャッシュから
  GET /icon.png                           type=Other      status=200  ← キャッシュから
  移動後: URL=/articles window.__marker=移動前に入れた値
`}
          />
          <p>
            通常の移動では、/articles を Document（ページとしての読み込み）で要求し、CSS と JavaScript もキャッシュから読み込み直して、<code>window.__marker</code> は消えました。Turbo の移動では、/articles
            を Fetch で取得しただけで、JavaScript の変数は残りました。どちらも URL は /articles に変わり、サーバーが返した HTML も同じです。違うのは、ブラウザーが受け取った HTML を画面に反映する方法です（図 17-1）。
          </p>
          <Figure n="17-1" title="通常の移動と Turbo Drive の移動" caption="デモのアプリケーションで「一覧へ」をクリックしたときの記録（Chrome、turbo-rails 2.0.23）をもとにした模式図。">
            <NavigationFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'hotwire-role',
      title: 'Hotwire が受け持つこと',
      body: (
        <>
          <p>
            画面の一部を書き換える方式のアプリケーションには、大きく2つの作り方があります。1つは、サーバーが JSON（データだけを決まった形式で書いた文字列）を返し、ブラウザーの JavaScript がそのデータから HTML
            の要素を組み立てる作り方です。画面を作る処理のほとんどがブラウザー側の JavaScript になり、サーバーはデータを返すだけになります。もう1つは、サーバーが HTML を返し、ブラウザーの JavaScript
            はそれを画面に入れるだけにする作り方です。前の節の fetch の例はこちらで、置き換えた h1 の HTML を作ったのは Rails のテンプレートでした。
          </p>
          <p>
            <Term>Hotwire</Term> は後者の作り方のための JavaScript のライブラリ群です。サーバーが返す HTML で画面を更新するので、権限の確認やデータベースの読み書き、HTML
            を作る処理は、サーバー側の Ruby のコードに残ります
            <Ref n={10} />
            <Ref n={9} />。Hotwire の中心は次の2つです。
          </p>
          <ul>
            <li>
              Turbo：同じサイトの中のリンクのクリックやフォームの送信を fetch に置き換え、返ってきた HTML でページの全体か一部を入れ替える。前の節の移動を行ったのは Turbo です。
            </li>
            <li>
              Stimulus：ボタンを押したらメニューを開くといった、サーバーに問い合わせずにブラウザーの中だけで済む動きを、HTML の要素に JavaScript を結び付けて書く（「Stimulus の役割」の節）。
            </li>
          </ul>
          <p>
            rails new で作ったアプリケーションには、初めから両方が入っています。デモのアプリケーションでは、次のファイルがそれぞれを読み込んでいます。importmap.rb の <code>pin</code> は、
            <code>import</code> で使う名前と JavaScript のファイルを対応させる設定です（<ChapterLink n={16} section="assets" />
            ）。
          </p>
          <Code
            lang="ruby"
            title="Gemfile・config/importmap.rb・app/javascript/application.js（デモ。rails new が作ったもの、一部を省略）"
            code={`
# Gemfile
gem "turbo-rails"
gem "stimulus-rails"

# config/importmap.rb
pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin_all_from "app/javascript/controllers", under: "controllers"

// app/javascript/application.js
import "@hotwired/turbo-rails"
import "controllers"
`}
          />
          <p>
            application.js で Turbo を読み込むだけで、Turbo はページのリンクとフォームを扱い始めます。前の節の比較でも、Rails のコントローラーとテンプレートは何も変えていません。サーバーから見ると、Turbo
            の移動の要求も普通の GET です。Turbo が要求にどんなヘッダーを付け、サーバーにどんな応答を求めるかは「Turbo Drive」の節から扱います。
          </p>
        </>
      ),
    },
    {
      id: 'http-websocket',
      title: 'HTTP の要求と応答と WebSocket',
      body: (
        <>
          <p>
            ここまでの通信は、どれもブラウザーが要求を送り、サーバーが応答を返す HTTP のやり取りでした（<ChapterLink n={6} section="http-message" />
            ）。HTTP では、やり取りを始めるのは常にブラウザー（クライアント）の側で、サーバーは要求が来なければ何も送れません
            <Ref n={13} />。そのため、ほかの利用者がコメントを投稿しても、表示中のページには、ブラウザーが次に要求を送るまで届きません。数秒ごとに要求を送って確かめる方法（ポーリング）もありますが、変化が無いときも要求と応答が続きます。
          </p>
          <p>
            <Term>WebSocket</Term> は1本の接続を開いたままにして、ブラウザーとサーバーのどちらからでもメッセージを送れるようにする通信の方式です。接続は HTTP の要求から始まります。ブラウザーが{' '}
            <code>Upgrade: websocket</code> ヘッダーを付けた GET を送り、サーバーが <code>101 Switching Protocols</code> を返すと、その接続は HTTP のやり取りをやめ、WebSocket のメッセージのやり取りに使われます
            <Ref n={14} />。Rails では ActionCable という機能がこの接続を受け持ち、/cable というパスで受け付けます。
          </p>
          <p>
            デモのアプリケーションの /cable に、Node.js（ブラウザーの外で JavaScript を実行するプログラム）から WebSocket の接続を開きました。接続の後、記事1のコメントの更新を受け取る登録（購読）をしてから、別のプロセスの{' '}
            <code>bin/rails runner</code> で、記事1を購読している接続へメッセージを送りました。
          </p>
          <Code
            lang="text"
            title="WebSocket の接続と届いたメッセージ（Node.js で /cable に接続して記録。identifier の中身と subscribe の後半を省略）"
            code={`
--- 送った要求
GET /cable HTTP/1.1
Host: localhost:3300
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Protocol: actioncable-v1-json
Origin: http://localhost:3300

--- 受け取った応答のヘッダー
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: actioncable-v1-json

--- その後のメッセージ（接続してからの秒数）
 0.0s  受信 {"type":"welcome"}
 0.0s  送信 {"command":"subscribe","identifier":"{\\"channel\\":\\"Turbo::StreamsChannel\\",\\"signed_strea…
 0.0s  受信 {"identifier":"{…}","type":"confirm_subscription"}
 0.0s  （別のプロセスで bin/rails runner を起動）
 0.3s  受信 {"type":"ping","message":1794812791}
 1.8s  受信 {"identifier":"{…}","message":"<turbo-stream action=\\"append\\" target=\\"comments\\"><template><li>runner から送信</li></template></turbo-stream>"}
 3.3s  受信 {"type":"ping","message":1794812794}
 6.3s  受信 {"type":"ping","message":1794812797}
 9.3s  受信 {"type":"ping","message":1794812800}
`}
          />
          <Code
            lang="ruby"
            title="別のプロセスで実行したコード（bin/rails runner）"
            code={`
Turbo::StreamsChannel.broadcast_append_to(Article.find(1), target: "comments", html: "<li>runner から送信</li>")
`}
          />
          <ul>
            <li>101 の応答の後も接続は切れず、サーバーは welcome と confirm_subscription（購読を受け付けたという知らせ）を送ってきました。</li>
            <li>ping はサーバーが3秒ごとに送るメッセージで、クライアントは何も要求していません。message の数値は送った時刻（1970年1月1日からの秒数）です。</li>
            <li>
              1.8 秒の行は、runner が送ったメッセージです。中身は <code>{'<turbo-stream action="append" target="comments">'}</code> の HTML で、Turbo を読み込んだページなら、id が comments
              の要素の末尾に <code>{'<li>runner から送信</li>'}</code> を追加します（「Turbo Streams」の節）。
            </li>
          </ul>
          <p>
            サーバーはクライアントの要求を待たずにメッセージを送れました（図 17-2）。Hotwire では HTTP の応答として返る HTML と、WebSocket で届く HTML の両方で画面を更新します。次の節から、Turbo
            の3つの働きと、それぞれがサーバーに送る要求を順に確かめます。WebSocket の接続を Rails の中で処理する仕組みは「ActionCable の WebSocket」の節で扱います。
          </p>
          <Figure n="17-2" title="HTTP の要求と応答、WebSocket" caption="デモのアプリケーションの /cable に接続して記録したメッセージをもとにした模式図。">
            <WebSocketFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'overview',
      title: 'Hotwire の構成',
      body: (
        <>
          <p>
            Hotwire は、サーバーが返す HTML でページを更新するための JavaScript のライブラリ群で、主に Turbo と Stimulus からなります。Rails では turbo-rails と stimulus-rails の gem
            がヘルパーと設定を提供します。Turbo には次の3つの働きがあり、どれもサーバーには HTML を要求します（図 17-3）
            <Ref n={1} />。
          </p>
          <ul>
            <li>Turbo Drive：リンクとフォームの送信を JavaScript の fetch に置き換え、ページ全体を読み込み直さずに本文を入れ替える</li>
            <li>Turbo Frames：ページの一部（<code>{'<turbo-frame>'}</code> 要素）だけを、別の URL の応答で入れ替える</li>
            <li>Turbo Streams：<code>{'<turbo-stream>'}</code> 要素に書いた指示（追加・置換・削除など）でページの一部を変更する。HTTP の応答でも WebSocket でも届けられる</li>
          </ul>
          <p>
            この章では、記事のページにコメントの一覧と投稿フォームを置き、Chrome で操作したときの通信を記録しました。サーバーはデモのアプリケーションを Docker の Puma（スレッド3）で起動しています。
          </p>
          <Code
            lang="erb"
            title="app/views/articles/show.html.erb（デモ）"
            code={`
<h1><%= @article.title %></h1>
<%= turbo_stream_from @article %>
<ul id="comments">
  <%= render @article.comments.order(:id).last(2) %>
</ul>
<%= turbo_frame_tag "comment_form" do %>
  <%= link_to "コメントを書く", new_article_comment_path(@article) %>
<% end %>
<p><%= link_to "一覧へ", articles_path %></p>
`}
          />
          <Figure n="17-3" title="Turbo の要求と応答" caption="Chrome で記録した要求ヘッダーと応答をもとにまとめた。turbo-rails 2.0.23、Rails 8.1.4.1。">
            <RequestsFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'drive',
      title: 'Turbo Drive',
      body: (
        <>
          <p>ページを開いた後、ページの JavaScript の変数に印を付けてから「一覧へ」をクリックしました。</p>
          <Code
            lang="text"
            code={`
[A] → GET /articles  accept=text/html, application/xhtml+xml  x-turbo-request-id=…
[A] ← 200 text/html; charset=utf-8                 /articles
A url=/articles marker=same-document
`}
          />
          <p>
            URL は変わりましたが、印（<code>window.__marker</code>）は残っています。ブラウザーはページを読み込み直しておらず、Turbo が fetch で取得した HTML の <code>{'<body>'}</code>{' '}
            を入れ替えたことがわかります。サーバーから見ると普通の GET で、コントローラーは何も変える必要がありません。<code>X-Turbo-Request-Id</code> は Turbo が付けるヘッダーです。turbo-rails はこの値を、ページの再読み込みを指示するブロードキャスト（<code>broadcast_refresh</code>
            の turbo-stream 要素）の request-id 属性に入れます。Turbo は、自分が最近送った要求の ID が入った再読み込みの指示を無視します（turbo.js の <code>refresh</code>）。
          </p>
          <p>
            フォームの送信では、サーバーに決まった応答が求められます。Turbo の説明書によると、Turbo Drive は送信の後に 303 のリダイレクトを期待し、それに従ってページを移動します。例外は 4xx と 5xx
            で、入力の誤りは 422 Unprocessable Content でフォームを描画し直して返します
            <Ref n={2} />。Rails 8.1 のコントローラーでは、次のように書きます。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/comments_controller.rb（デモ）"
            code={`
  def create
    @comment = @article.comments.build(params.expect(comment: [:body]))
    if @comment.save
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to @article }
      end
    else
      render :new, status: :unprocessable_content
    end
  end
`}
          />
          <p>応答の状態コードを変えて、Turbo の動きを確かめました。302 でリダイレクトするアクションと、200 で HTML を返すアクションにフォームを送信しています。</p>
          <Code
            lang="text"
            code={`
--- 302 を返すアクションに送信
  ← 302 POST /probe/turbo_302
  ← 200 GET /articles
  url=/articles marker=same-document
--- 200 を返すアクションに送信
  ← 200 POST /probe/turbo_200
  console.error: Error: Form responses must redirect to another location
  url=/probe/turbo_form marker=same-document ok要素=なし
`}
          />
          <p>
            <code>redirect_to</code> の既定の 302 でも、fetch がリダイレクト先を GET で取得するので、ページは移動しました。一方、200 の応答は表示されず、ブラウザーのコンソールにエラーが出るだけで画面は変わりません。入力の誤りを 200
            で返す古い書き方のアプリケーションに Turbo を入れると、送信しても何も起きないように見えるのはこのためです。
          </p>
          <p>
            importmap のタグには <code>data-turbo-track="reload"</code> が付いていました（<ChapterLink n={16} section="assets" />
            ）。Turbo は移動のたびにこの属性を持つ要素を比べ、ダイジェストが変わっていればページ全体を読み込み直します。デプロイで JavaScript が変わったとき、古い JavaScript のまま動き続けないようにするためです。
          </p>
        </>
      ),
    },
    {
      id: 'frames',
      title: 'Turbo Frames',
      body: (
        <>
          <p>フレームの中の「コメントを書く」をクリックしたときの記録です。</p>
          <Code
            lang="text"
            code={`
[A] → GET /articles/1/comments/new  accept=text/html, application/xhtml+xml  turbo-frame=comment_form  x-turbo-request-id=…
[A] ← 200 text/html; charset=utf-8                 /articles/1/comments/new
A url=/articles/1 marker=same-document h1=変更後のタイトル
`}
          />
          <p>
            要求には <code>Turbo-Frame: comment_form</code> が付きます。turbo-rails は、このヘッダーがあるときに簡略化したレイアウトを使うよう、コントローラーに設定を加えています。
          </p>
          <Code
            lang="ruby"
            title="turbo-rails: app/controllers/turbo/frames/frame_request.rb（コメントを除く）"
            href={`${TR}/app/controllers/turbo/frames/frame_request.rb`}
            code={`
module Turbo::Frames::FrameRequest
  extend ActiveSupport::Concern

  included do
    layout -> { "turbo_rails/frame" if turbo_frame_request? }
    etag { :frame if turbo_frame_request? }

    helper_method :turbo_frame_request?, :turbo_frame_request_id
  end

  private
    def turbo_frame_request?
      turbo_frame_request_id.present?
    end

    def turbo_frame_request_id
      request.headers["Turbo-Frame"]
    end
end
`}
          />
          <p>
            turbo_rails/frame のレイアウトは、<code>{'<head>'}</code> に CSRF のメタタグ（フォームの送信がこのアプリケーションのページからであることを確かめるための値を入れたタグ。<ChapterLink n={21} section="csrf" />）などだけを出力します。同じ URL を curl で要求すると、ヘッダーがある場合は 981 バイト、無い場合は 2541
            バイトでした。<code>etag</code> の行は、フレーム用の応答と通常の応答で ETag を変え、HTTP のキャッシュが混ざらないようにするものです（ETag は<ChapterLink n={22} />
            ）。サーバーのログにも、使ったレイアウトが出ます。
          </p>
          <Code
            lang="text"
            code={`
Started GET "/articles/1/comments/new" for 172.29.0.1 at 2026-11-11 09:57:42 +0000
  Rendering layout /work/gems/gems/turbo-rails-2.0.23/app/views/layouts/turbo_rails/frame.html.erb
  Rendering comments/new.html.erb within layouts/turbo_rails/frame
`}
          />
          <p>
            応答の new.html.erb には <code>{'<h1>コメントの作成</h1>'}</code> がありますが、ページの見出しは変わっていません。Turbo は応答から同じ id の <code>{'<turbo-frame>'}</code>{' '}
            だけを取り出して入れ替え、それ以外は使いません
            <Ref n={3} />（図 17-4）。応答に同じ id のフレームが無いと、フレームには「Content missing」と表示されます。
          </p>
          <Figure n="17-4" title="Turbo Frame の置き換え" caption="デモアプリケーションでの実測（Chrome、turbo-rails 2.0.23）をもとにした模式図。">
            <FrameFigure />
          </Figure>
          <p>
            フレームの中のフォームを空のまま送信すると、422 と new.html.erb が返り、フレームの中に検証のエラーが表示されました。フレームの中のフォームの送信にも Turbo-Frame
            ヘッダーが付くので、422 の応答も同じ方法でフレームだけが入れ替わります。
          </p>
          <Code
            lang="text"
            code={`
[A] → POST /articles/1/comments  accept=text/vnd.turbo-stream.html, text/html, application/xhtml+xml  turbo-frame=comment_form
[A] ← 422 text/html; charset=utf-8                 /articles/1/comments
A frame: Body can't be blank
`}
          />
        </>
      ),
    },
    {
      id: 'streams',
      title: 'Turbo Streams',
      body: (
        <>
          <p>
            上の POST の Accept の先頭には <code>text/vnd.turbo-stream.html</code> があります。Turbo は POST・PUT・PATCH・DELETE のフォームを送信するとき、この MIME タイプを Accept
            に加えます
            <Ref n={4} />。Rails の側では、turbo-rails がこの MIME タイプを <code>:turbo_stream</code> という形式として登録しています。
          </p>
          <Code
            lang="ruby"
            title="turbo-rails: lib/turbo/engine.rb（76〜85行目）"
            href={`${TR}/lib/turbo/engine.rb#L76-L85`}
            code={`
    initializer "turbo.mimetype" do
      Mime::Type.register "text/vnd.turbo-stream.html", :turbo_stream
    end

    initializer "turbo.renderer" do
      ActionController::Renderers.add :turbo_stream do |turbo_streams_html, options|
        self.content_type = Mime[:turbo_stream] if media_type.nil?
        turbo_streams_html
      end
    end
`}
          />
          <p>
            登録されたので、コントローラーの <code>format.turbo_stream</code> が Accept で選ばれ、<ChapterLink n={16} section="lookup" />
            で見た探索の formats が <code>[:turbo_stream]</code> になります。テンプレートは create.turbo_stream.erb です。
          </p>
          <Code
            lang="erb"
            title="app/views/comments/create.turbo_stream.erb（デモ）"
            code={`
<%= turbo_stream.append "comments", @comment %>
<%= turbo_stream.update "comment_form" do %>
  <%= link_to "コメントを書く", new_article_comment_path(@article) %>
<% end %>
`}
          />
          <p>
            <code>turbo_stream.append</code> は、<code>@comment</code> を comments/_comment パーシャルで描画し、<code>{'<turbo-stream action="append" target="comments"><template>…</template></turbo-stream>'}</code>{' '}
            を出力します。応答の Content-Type は <code>text/vnd.turbo-stream.html; charset=utf-8</code> でした。Turbo はこの応答を受け取ると、各要素の action（append・prepend・replace・update・remove
            など）を target の id の要素に適用します。ページの移動はしません。
          </p>
          <p>
            1つのコントローラーで HTML の画面と Turbo Streams の両方に対応するには、<code>respond_to</code> で両方を書きます。Accept に text/vnd.turbo-stream.html が無い要求（JavaScript
            が無効のブラウザーや、テストでの普通の POST）には、<code>format.html</code> のリダイレクトが返ります。
          </p>
        </>
      ),
    },
    {
      id: 'stimulus',
      title: 'Stimulus の役割',
      body: (
        <>
          <p>
            Turbo がページの更新を受け持つのに対し、Stimulus はクリックで表示を切り替えるといった、ブラウザーの中だけで済む処理を受け持ちます。Stimulus は HTML の <code>data-controller</code>{' '}
            属性を監視し、属性の値に対応する JavaScript のクラスのインスタンスを作って要素に結び付けます
            <Ref n={5} />。Turbo で HTML が入れ替わっても、新しい要素に属性があれば自動で結び付きます。
          </p>
          <Code
            lang="js"
            title="app/javascript/controllers/hello_controller.js（stimulus:install が生成）"
            code={`
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.element.textContent = "Hello World!"
  }
}
`}
          />
          <p>
            <code>{'<div data-controller="hello">'}</code> を出力すると、この <code>connect</code> が呼ばれます。デモの config/importmap.rb には <code>pin_all_from "app/javascript/controllers", under: "controllers"</code>{' '}
            があり、controllers/index.js が <code>*_controller.js</code> をすべて登録します。サーバーの側ですることは、ビューで <code>data-controller</code>・<code>data-action</code>・
            <code>data-*-target</code> の属性を出力することだけです。
          </p>
        </>
      ),
    },
    {
      id: 'actioncable',
      title: 'ActionCable の WebSocket',
      body: (
        <>
          <p>
            記事のページを開くと、ブラウザーは <code>ws://localhost:3100/cable</code> に WebSocket で接続しました。<code>/cable</code> は、ActionCable のエンジンがルーティングの先頭に追加する
            mount（URL のパスに Rack のアプリケーションを割り当てるルーティングの書き方。<ChapterLink n={9} section="mount" />）です。
          </p>
          <Code
            lang="ruby"
            title="actioncable/lib/action_cable/engine.rb（62〜71行目）・server/base.rb（39〜43行目）"
            href={`${GH}/actioncable/lib/action_cable/engine.rb#L62-L71`}
            code={`
    initializer "action_cable.routes" do
      config.after_initialize do |app|
        config = app.config
        unless config.action_cable.mount_path.nil?
          app.routes.prepend do
            mount ActionCable.server => config.action_cable.mount_path, internal: true, anchor: true
          end
        end
      end
    end

      # server/base.rb
      def call(env)
        return config.health_check_application.call(env) if env["PATH_INFO"] == config.health_check_path
        setup_heartbeat_timer
        config.connection_class.call.new(self, env).process
      end
`}
          />
          <p>
            接続の <code>process</code> は、WebSocket の要求であることと、Origin ヘッダー（要求を送ったページのスキーム・ホスト・ポート。<ChapterLink n={21} section="csrf" />）が許可されていることを確かめます。開発環境では <code>{'/https?:\\/\\/localhost:\\d+/'}</code>{' '}
            が許可されています。本番環境ではこの許可が無くなり、Origin が要求のスキームと Host に一致する場合（<code>allow_same_origin_as_host</code>、既定で true）か、
            <code>config.action_cable.allowed_request_origins</code> に一致する場合だけ接続できます
            <Ref n={6} />（Nginx を前に置いたときの例は<ChapterLink n={24} section="websocket" />）。許可されると、Rack の hijack でソケットを Puma から引き取ります。
          </p>
          <Code
            lang="ruby"
            title="actioncable/lib/action_cable/connection/client_socket.rb（58〜74行目）"
            href={`${GH}/actioncable/lib/action_cable/connection/client_socket.rb#L58-L74`}
            code={`
      def start_driver
        return if @driver.nil? || @driver_started
        @stream.hijack_rack_socket

        if callback = @env["async.callback"]
          callback.call([101, {}, @stream])
        end

        @driver_started = true
        @driver.start
      end

      def rack_response
        start_driver
        [ -1, {}, [] ]
      end
`}
          />
          <p>
            <code>hijack_rack_socket</code> はソケットを ActionCable のイベントループ（複数の接続を監視し、データを読み書きできる接続の処理を進める仕組み。nio4r を使う1つのスレッドで動作します）に登録します。Puma のスレッドは応答を返したものとして次の要求の処理に戻るので、WebSocket
            の接続が Puma のスレッドを占有することはありません。3スレッドの Puma に6つのページから WebSocket で接続した状態でも、<code>GET /up</code> は 0.008 秒で返りました。
          </p>
          <p>
            受信したメッセージの処理（チャネルの <code>subscribed</code> や独自のアクション）は、ActionCable のワーカープール（既定 4 スレッド）で実行されます。ここで ActiveRecord を使うと、Puma
            のスレッドとは別に接続プールの接続を使います（<ChapterLink n={15} section="pool" />
            ）。ブラウザー側では次のメッセージが流れました（3秒ごとの ping は省略）。
          </p>
          <Code
            lang="text"
            code={`
[A] ws← {"type":"welcome"}
[A] ws→ {"command":"subscribe","identifier":"{\\"channel\\":\\"Turbo::StreamsChannel\\",\\"signed_stream_name\\":\\"IloybGtPaTh2WkdWdGJ5OUJjblJwWTJ4bEx6RSI=--516a67a9…\\"}"}
[A] ws← {"identifier":"{…}","type":"confirm_subscription"}
`}
          />
          <Figure n="17-5" title="ActionCable の構成" caption="Rails 8.1.4.1 の actioncable（server/base.rb・client_socket.rb・stream_event_loop.rb・subscription_adapter）を読んでまとめた模式図。">
            <CableFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'broadcast',
      title: 'Turbo Streams のブロードキャスト',
      body: (
        <>
          <p>
            subscribe の <code>signed_stream_name</code> は、ビューの <code>turbo_stream_from @article</code> が出力したものです。
          </p>
          <Code
            lang="ruby"
            title="turbo-rails: app/helpers/turbo/streams_helper.rb（56〜62行目）・app/channels/turbo/streams_channel.rb"
            href={`${TR}/app/helpers/turbo/streams_helper.rb#L56-L62`}
            code={`
  def turbo_stream_from(*streamables, **attributes)
    raise ArgumentError, "streamables can't be blank" unless streamables.any?(&:present?)
    attributes[:channel] = attributes[:channel]&.to_s || "Turbo::StreamsChannel"
    attributes[:"signed-stream-name"] = Turbo::StreamsChannel.signed_stream_name(streamables)

    tag.turbo_cable_stream_source(**attributes)
  end

class Turbo::StreamsChannel < ActionCable::Channel::Base
  def subscribed
    if stream_name = verified_stream_name_from_params
      stream_from stream_name
    else
      reject
    end
  end
end
`}
          />
          <p>
            ストリーム名は、Article の GlobalID（<code>gid://アプリケーション名/クラス名/id</code>、<ChapterLink n={18} section="serialize" />
            ）を Base64 にした文字列で、それに MessageVerifier の署名が付いています。前半を復号すると次のとおりです。
          </p>
          <Code
            lang="bash"
            code={`
$ echo "IloybGtPaTh2WkdWdGJ5OUJjblJwWTJ4bEx6RSI=" | base64 -d
"Z2lkOi8vZGVtby9BcnRpY2xlLzE"
$ echo "Z2lkOi8vZGVtby9BcnRpY2xlLzE" | base64 -d
gid://demo/Article/1
`}
          />
          <p>
            署名があるので、ブラウザーで名前を書き換えて他の記事のストリームを購読しようとしても、<code>verified_stream_name_from_params</code> が nil を返して購読は拒否されます。ただし、署名は名前の改ざんを防ぐだけで、そのページを見る権限があるかは確かめません。利用者ごとに見せる内容が違う場合は、
            <code>turbo_stream_from current_user, :notifications</code> のように、ストリーム名に利用者を含めます。
          </p>
          <p>Comment のモデルには、作成をブロードキャストするコールバックを書きました。</p>
          <Code
            lang="ruby"
            title="app/models/comment.rb（デモ）"
            code={`
class Comment < ApplicationRecord
  belongs_to :article, counter_cache: true
  validates :body, presence: true
  after_create_commit -> { broadcast_append_to article, target: "comments" }
end
`}
          />
          <p>ブラウザー A と B で同じ記事を開き、A からコメントを送信したときの記録とサーバーのログです。</p>
          <Code
            lang="text"
            code={`
[A] → POST /articles/1/comments  accept=text/vnd.turbo-stream.html, text/html, application/xhtml+xml  turbo-frame=comment_form
[B] ws← {"identifier":"{…}","message":"\\u003cturbo-stream action=\\"append\\" target=\\"comments\\"\\u003e…
[A] ws← {"identifier":"{…}","message":"\\u003cturbo-stream action=\\"append\\" target=\\"comments\\"\\u003e…
[A] ← 200 text/vnd.turbo-stream.html; charset=utf-8 /articles/1/comments
A comments: ["comment_2187:コメント","comment_2188:コメント","comment_2971:ブラウザーAから送信"]
B comments: ["comment_2187:コメント","comment_2188:コメント","comment_2971:ブラウザーAから送信"]

（サーバーのログ）
[ActionCable] Broadcasting to Z2lkOi8vZGVtby9BcnRpY2xlLzE: "<turbo-stream action=\\"append\\" target=\\"comments\\"><template>…<li id=\\"comment_2971\\">ブラウザーAから送信</li>…
Turbo::StreamsChannel transmitting "<turbo-stream action=\\"append\\" …
Turbo::StreamsChannel transmitting "<turbo-stream action=\\"append\\" …
  Rendered comments/create.turbo_stream.erb (Duration: 2.0ms | GC: 0.0ms)
`}
          />
          <p>
            after_create_commit は COMMIT の直後、コントローラーがまだ応答を描画する前に実行されます（<ChapterLink n={14} section="after-commit" />
            ）。そのため、A には WebSocket のメッセージが POST の応答より先に届きました。A は同じコメントを WebSocket と応答の両方で受け取りますが、表示は1件です。Turbo の append は、追加する要素の id
            が既に対象の中にあれば、追加せずに置き換えるからです
            <Ref n={7} />。
          </p>
          <p>
            <code>broadcast_append_to</code> はコールバックの中でパーシャルを描画して送信するので、その分だけ保存の処理が遅くなります。<code>broadcast_append_later_to</code> や{' '}
            <code>broadcasts_to</code> は、描画と送信を ActiveJob のジョブにします（<ChapterLink n={18} />
            ）。
          </p>
          <Figure n="17-6" title="ブロードキャストの流れ" caption="Redis のアダプターを使った場合。デモアプリケーションでの実測をもとにした模式図。">
            <BroadcastFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'adapter',
      title: 'サブスクリプションアダプター',
      body: (
        <>
          <p>
            <code>ActionCable.server.broadcast</code> は、サブスクリプションアダプターの <code>broadcast</code> を呼ぶだけです。どのプロセスに届くかはアダプターで決まります。新規のアプリケーションの
            config/cable.yml は、開発環境が async です。async はプロセスの中の Hash で購読者を管理するので、同じプロセスの中にしか届きません
            <Ref n={6} />。
          </p>
          <p>Puma で記事のページを開いたまま、別のプロセスの <code>bin/rails runner</code> でコメントを作成しました。</p>
          <Code
            lang="text"
            code={`
（cable.yml の development が adapter: async）
created 2972 adapter=async
B comments: ["comment_2188:コメント","comment_2971:ブラウザーAから送信"]     ← 届かない

（adapter: redis に変えて Puma を再起動）
created 2973 adapter=redis
[B] ws← {"identifier":"{…}","message":"\\u003cturbo-stream action=\\"append\\" …
B comments: ["comment_2971:ブラウザーAから送信","comment_2972:runner から作成","comment_2973:runner から作成"]

$ redis-cli PUBSUB CHANNELS '*'          （ページを開いている間）
demo_development:Z2lkOi8vZGVtby9BcnRpY2xlLzE
_action_cable_internal
`}
          />
          <p>
            Redis のアダプターでは、<code>stream_from</code> が Redis の SUBSCRIBE に、broadcast が PUBLISH になります。チャネル名には cable.yml の <code>channel_prefix</code>{' '}
            が付きます。本番環境で Puma のワーカーが複数ある場合や、Sidekiq のジョブからブロードキャストする場合は、プロセスの外を通るアダプター（Redis、PostgreSQL、Solid Cable）が必要です。Solid Cable
            はメッセージをデータベースのテーブルに書き、各プロセスが定期的に読みにいく方式です。
          </p>
          <p>
            Nginx を前段に置く場合、WebSocket の接続には Upgrade ヘッダーを転送する設定が要ります（<ChapterLink n={24} />
            ）。ALB（AWS が提供する、要求を複数のサーバーに振り分ける装置）や Nginx のアイドルタイムアウト（データが流れない接続を切るまでの時間）より ping の間隔（3秒）が短いので、通常は接続が切られません。
          </p>
          <Callout kind="v72">
            <p>
              ここまでの ActionCable の処理は Rails 7.2.4 でも同じです。Rails 8.0 から、新規のアプリケーションは本番環境のアダプターに Solid Cable を使うようになりました
              <Ref n={8} />。7.2 で作ったアプリケーションの本番環境は Redis のアダプターです。turbo-rails と stimulus-rails は Rails とは別の gem なので、7.2 でも同じバージョンを使えます。
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
          <li>通常の移動では、ブラウザーがページを捨てて読み込み直します。Turbo は fetch で HTML を取得して body を入れ替えるので、JavaScript の変数が残ります。</li>
          <li>Hotwire はサーバーが返す HTML で画面を更新します。Turbo がページの更新を、Stimulus がブラウザーの中だけで済む動きを受け持ちます。</li>
          <li>HTTP ではクライアントが要求を送らないとサーバーは何も送れません。WebSocket は 101 の応答の後も接続を開いたままにし、サーバーから要求を待たずにメッセージを送れます。</li>
          <li>Turbo Drive は普通の GET と POST を送ります。フォームの送信には 303 のリダイレクトか、入力の誤りなら 422 を返します。</li>
          <li>Turbo Frames の要求には Turbo-Frame ヘッダーが付き、turbo-rails は簡略化したレイアウトを使います。応答のうち同じ id のフレームだけが使われます。</li>
          <li>Turbo Streams は Accept の text/vnd.turbo-stream.html で選ばれ、*.turbo_stream.erb の turbo-stream 要素でページの一部を変更します。</li>
          <li>Stimulus は data-controller 属性に JavaScript のクラスを結び付けます。サーバーは属性を出力するだけです。</li>
          <li>ActionCable は WebSocket を hijack で Puma から引き取り、イベントループとワーカープールで処理します。WebSocket の接続は Puma のスレッドを占有しません。</li>
          <li>turbo_stream_from のストリーム名は署名付きの GlobalID です。after_create_commit のブロードキャストは、アダプターを通って購読中の全ブラウザーに届きます。</li>
          <li>async のアダプターは同じプロセスの中にしか届かないので、本番環境では Redis や Solid Cable を使います。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Working with JavaScript in Rails（Turbo）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/working_with_javascript_in_rails.html#turbo', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Turbo Drive・Frames・Streams の概要と、turbo_frame_tag・format.turbo_stream。' },
    { title: 'Turbo Handbook: Navigate with Turbo Drive', publisher: 'Hotwire（37signals）', url: 'https://turbo.hotwired.dev/handbook/drive', accessed: '2026-11-11', version: 'Turbo 8', note: 'フォームの送信の後に 303 を期待し、4xx・5xx なら応答を描画すること（422 Unprocessable Content）。' },
    { title: 'Turbo Handbook: Decompose with Turbo Frames', publisher: 'Hotwire（37signals）', url: 'https://turbo.hotwired.dev/handbook/frames', accessed: '2026-11-11', version: 'Turbo 8', note: '応答から同じ id の turbo-frame だけが取り出され、frame の外の要素は使われないこと。' },
    { title: 'Turbo Handbook: Come Alive with Turbo Streams', publisher: 'Hotwire（37signals）', url: 'https://turbo.hotwired.dev/handbook/streams', accessed: '2026-11-11', version: 'Turbo 8', note: 'POST・PUT・PATCH・DELETE のフォームで Accept に text/vnd.turbo-stream.html が加わること。' },
    { title: 'Stimulus Handbook: Introduction', publisher: 'Hotwire（37signals）', url: 'https://stimulus.hotwired.dev/handbook/introduction', accessed: '2026-11-11', version: 'Stimulus 3', note: 'data-controller 属性を監視してコントローラーのインスタンスを要素に結び付けること。' },
    { title: 'Action Cable Overview', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/action_cable_overview.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'allowed_request_origins、ワーカープール（既定4）とデータベース接続、async アダプターは同じプロセスの中だけで動くこと。' },
    { title: 'Turbo Reference: Streams', publisher: 'Hotwire（37signals）', url: 'https://turbo.hotwired.dev/reference/streams', accessed: '2026-11-11', version: 'Turbo 8', note: 'append・prepend で、同じ id の子要素が既にあれば置き換えること。' },
    { title: 'railties CHANGELOG（8.0.0）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v8.0.0/railties/CHANGELOG.md', accessed: '2026-11-11', version: 'Rails 8.0.0', note: '本番環境の Action Cable のアダプターの既定を Solid Cable にしたこと。' },
    { title: 'Turbo Handbook: Introduction', publisher: 'Hotwire（37signals）', url: 'https://turbo.hotwired.dev/handbook/introduction', accessed: '2026-11-16', version: 'Turbo 8', note: 'Turbo Drive が同じドメインのリンクのクリックを fetch に置き換え、body を入れ替えて head を合わせ、window と document が残ること。サーバーが HTML を返し、権限の確認などのロジックをサーバー側に置けること。' },
    { title: 'Hotwire', publisher: 'Hotwire（37signals）', url: 'https://hotwired.dev/', accessed: '2026-11-16', note: 'JSON ではなく HTML を送ってアプリケーションを作る方法であること。Turbo と Stimulus。' },
    { title: 'Document Object Model (DOM)', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model', accessed: '2026-11-16', note: 'DOM が HTML の文書の構造をメモリーの中に木として表し、プログラムから構造や内容を変えられること。' },
    { title: 'Fetch API', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API', accessed: '2026-11-16', note: 'JavaScript からネットワークの要求を送る API。実行例はデモ（Chrome）で実測。' },
    { title: 'An overview of HTTP', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview', accessed: '2026-11-16', note: 'HTTP がクライアントとサーバーの間の取り決めで、要求はクライアントの側から始めること。' },
    { title: 'RFC 6455: The WebSocket Protocol', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc6455.html', accessed: '2026-11-16', note: 'HTTP の Upgrade で始まるハンドシェイクと 101 の応答、その後の双方向のメッセージ。HTTP のポーリングの代わりになること。接続の記録はデモで実測。' },
  ],
}

export default withExplanations(ch17, explanation17)
