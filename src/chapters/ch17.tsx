import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const TR = 'https://github.com/hotwired/turbo-rails/blob/v2.0.23'

/* ---------- 図 17-1 Turbo の要求と応答 ---------- */
function RequestsFigure() {
  const rows = [
    { what: 'Turbo Drive', act: 'リンクのクリック', req: ['Accept: text/html, …'], res: ['200 HTML（ページ全体）'], turbo: ['<body> を入れ替え、', '<head> を合わせる'] },
    { what: 'Turbo Frames', act: 'フレーム内の操作', req: ['Accept: text/html, …', 'Turbo-Frame: comment_form'], res: ['200 HTML（レイアウトは', 'turbo_rails/frame）'], turbo: ['同じ id の <turbo-frame>', 'だけを取り出して入れ替え'] },
    { what: 'Turbo Streams', act: 'POST などの送信', req: ['Accept: text/vnd.turbo-', 'stream.html, text/html, …'], res: ['200（turbo-stream 形式）', '<turbo-stream> の並び'], turbo: ['action と target に従い', 'ページの一部を変更'] },
  ]
  const rowH = 74
  return (
    <Svg
      id="17-1"
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

/* ---------- 図 17-2 Turbo Frame の置き換え ---------- */
function FrameFigure() {
  return (
    <Svg
      id="17-2"
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

/* ---------- 図 17-3 ActionCable の構成 ---------- */
function CableFigure() {
  return (
    <Svg
      id="17-3"
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

/* ---------- 図 17-4 ブロードキャストの流れ ---------- */
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
      id="17-4"
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

const ch17: Chapter = {
  number: 17,
  part: 4,
  title: 'Hotwire と ActionCable',
  summary:
    'Turbo Drive・Frames・Streams がサーバーにどんな要求を送り、どんな応答を期待するかを、ブラウザーで記録した通信をもとに説明します。Stimulus の役割、ActionCable の WebSocket の処理とスレッド、Turbo Streams のブロードキャストがアダプターを通って各ブラウザーに届くまでも扱います。',
  goals: [
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
      id: 'overview',
      title: 'Hotwire の構成',
      body: (
        <>
          <p>
            Hotwire は、サーバーが返す HTML でページを更新するための JavaScript のライブラリ群で、主に Turbo と Stimulus からなります。Rails では turbo-rails と stimulus-rails の gem
            がヘルパーと設定を提供します。Turbo には次の3つの働きがあり、どれもサーバーには HTML を要求します（図 17-1）
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
          <Figure n="17-1" title="Turbo の要求と応答" caption="Chrome で記録した要求ヘッダーと応答をもとにまとめた。turbo-rails 2.0.23、Rails 8.1.4.1。">
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
            要求には <code>Turbo-Frame: comment_form</code> が付きます。turbo-rails は、このヘッダーがあるときに軽いレイアウトを使うよう、コントローラーに設定を加えています。
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
            turbo_rails/frame のレイアウトは、<code>{'<head>'}</code> に CSRF のメタタグなどだけを出力します。同じ URL を curl で要求すると、ヘッダーがある場合は 981 バイト、無い場合は 2541
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
            <Ref n={3} />（図 17-2）。応答に同じ id のフレームが無いと、フレームには「Content missing」と表示されます。
          </p>
          <Figure n="17-2" title="Turbo Frame の置き換え" caption="デモアプリケーションでの実測（Chrome、turbo-rails 2.0.23）をもとにした模式図。">
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
            mount です。
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
          <Figure n="17-3" title="ActionCable の構成" caption="Rails 8.1.4.1 の actioncable（server/base.rb・client_socket.rb・stream_event_loop.rb・subscription_adapter）を読んでまとめた模式図。">
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
          <Figure n="17-4" title="ブロードキャストの流れ" caption="Redis のアダプターを使った場合。デモアプリケーションでの実測をもとにした模式図。">
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
            ）。ALB や Nginx のアイドルタイムアウトより ping の間隔（3秒）が短いので、通常は接続が切られません。
          </p>
          <Callout kind="v72">
            <p>
              ここまでの ActionCable の処理は Rails 7.2.4 でも同じです。Rails 8.0 から、新規のアプリケーションは本番環境のアダプターに Solid Cable を使うようになりました
              <Ref n={8} />。7.2 で作ったアプリケーションの本番環境は Redis のアダプターです。turbo-rails と stimulus-rails は Rails とは別の gem なので、7.2 でも同じ版を使えます。
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
          <li>Turbo Drive は普通の GET と POST を送ります。フォームの送信には 303 のリダイレクトか、入力の誤りなら 422 を返します。</li>
          <li>Turbo Frames の要求には Turbo-Frame ヘッダーが付き、turbo-rails は軽いレイアウトを使います。応答のうち同じ id のフレームだけが使われます。</li>
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
  ],
}

export default ch17
