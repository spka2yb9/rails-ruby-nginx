import type { Chapter } from '../content/types'
import { ChapterLink, Code, Figure, Ref } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 26-1 リクエスト全体のシーケンス ---------- */
function SequenceFigure() {
  const lanes = [
    { x: 44, t: 'ブラウザー' },
    { x: 134, t: 'ALB' },
    { x: 224, t: 'Nginx' },
    { x: 314, t: 'Puma' },
    { x: 404, t: 'ミドルウェア' },
    { x: 494, t: 'コントローラー' },
    { x: 584, t: 'DB・ビュー' },
  ]
  const steps: { a: number; b: number; y: number; t: string; ch: string; back?: boolean; self?: boolean }[] = [
    { a: 0, b: 1, y: 60, t: 'GET /articles/1（HTTPS）', ch: '25' },
    { a: 1, b: 2, y: 92, t: 'HTTP、X-Forwarded-*', ch: '25' },
    { a: 2, b: 2, y: 116, t: 'location / → try_files → @app', ch: '24', self: true },
    { a: 2, b: 3, y: 148, t: 'proxy_pass、X-Request-Id', ch: '24' },
    { a: 3, b: 3, y: 172, t: 'reactor → スレッド', ch: '23', self: true },
    { a: 3, b: 4, y: 204, t: 'app.call(env)', ch: '6' },
    { a: 4, b: 4, y: 228, t: 'SSL・Executor・RequestId・RemoteIp・Logger など', ch: '6・8・21・25', self: true },
    { a: 4, b: 5, y: 260, t: 'ルーティング → articles#show', ch: '9・10' },
    { a: 5, b: 6, y: 292, t: 'Article.find(1) → SQL', ch: '11・12・15' },
    { a: 5, b: 6, y: 324, t: '描画（パーシャル・関連の SQL）', ch: '13・16' },
    { a: 5, b: 3, y: 360, t: '[status, headers, body]', ch: '6・10', back: true },
    { a: 3, b: 2, y: 392, t: '応答を書き込む（Nginx がバッファー）', ch: '23・24', back: true },
    { a: 2, b: 0, y: 424, t: '200 text/html（ALB を通って）', ch: '24・25', back: true },
    { a: 0, b: 2, y: 460, t: 'GET /assets/…（Nginx が直接返す）', ch: '16・24' },
    { a: 0, b: 3, y: 492, t: 'WebSocket /cable（turbo_stream_from）', ch: '17・24' },
  ]
  return (
    <Svg
      id="26-1"
      w={790}
      h={520}
      label="GET /articles/1 は、ブラウザーから ALB に HTTPS で届き、ALB が TLS を終端して Nginx に HTTP で送る。Nginx は location / の try_files でファイルが無いことを確かめ、@app から Puma に送る。Puma の reactor が要求を読み切ってスレッドに渡し、Rails のミドルウェア（AssumeSSL、SSL、Executor、RequestId、RemoteIp、Logger など）を通ってルーティングが articles#show を選ぶ。コントローラーが Article.find(1) で SQL を送り、ビューがレイアウトとパーシャルを描画する途中で関連の SQL を送る。応答は Puma のスレッドが Nginx に書き込み、Nginx がバッファーして ALB を通ってブラウザーに返す。その後、ブラウザーはアセットを Nginx から直接取得し、/cable に WebSocket で接続する。各段の横の数字は、その段を扱った章の番号"
    >
      {lanes.map((l) => (
        <g key={l.t}>
          <T x={l.x} y={20} anchor="middle" bold fs={11.5}>
            {l.t}
          </T>
          <line x1={l.x} y1={32} x2={l.x} y2={506} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {steps.map((st) => {
        const x1 = lanes[st.a].x
        const x2 = lanes[st.b].x
        if (st.self) {
          return (
            <g key={st.t}>
              <rect x={x1 - 6} y={st.y - 8} width={12} height={16} fill="var(--fig-box5)" stroke="var(--fig-line)" />
              <T x={x1 + 12} y={st.y} fs={10} tone="muted">
                {`${st.t}（第${st.ch}章）`}
              </T>
            </g>
          )
        }
        const lx = Math.min(x1, x2)
        return (
          <g key={st.t}>
            <Arrow x1={x1} y1={st.y} x2={x2 + (x2 > x1 ? -4 : 4)} y2={st.y} dashed={st.back} />
            <T x={lx + 6} y={st.y - 9} fs={10}>
              {`${st.t}（第${st.ch}章）`}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 26-2 段階とログの対応 ---------- */
function LogsFigure() {
  const rows = [
    { s: 'ALB', log: 'アクセスログ：elb_status_code・target_status_code・target_processing_time', demo: '172.29.0.1 "GET /articles/1" 200 lb_time=0.008 upstream_status=200' },
    { s: 'Nginx', log: 'access.log（$request_id・$request_time・$upstream_response_time）・error.log', demo: 'request_id=e18060ac… rt=0.007 urt=0.007' },
    { s: 'Puma', log: '/stats（backlog・busy_threads）、標準出力（ワーカーの起動・停止）', demo: 'backlog=0 busy_threads=0' },
    { s: 'Rails|ミドルウェア・コントローラー', log: 'Started・Processing by・Parameters・Completed（log_tags で request_id）', demo: 'Completed 200 OK in 5ms (Views: 2.9ms | ActiveRecord: 0.6ms …)' },
    { s: 'ActiveRecord・MySQL', log: 'SQL の行（debug）、スロークエリログ、EXPLAIN', demo: 'Article Load (0.4ms) SELECT … WHERE id = 1 LIMIT 1' },
    { s: 'ビュー', log: 'Rendering・Rendered（debug）、Server-Timing（開発環境）', demo: 'Rendered layout layouts/application.html.erb (Duration: 2.8ms)' },
  ]
  return (
    <Svg
      id="26-2"
      w={790}
      h={rows.length * 58 + 30}
      label="段階ごとに見るログを並べた。ALB はアクセスログの elb_status_code・target_status_code・target_processing_time、Nginx は request_id と処理時間を入れた access.log と error.log、Puma は /stats の backlog と busy_threads と標準出力、Rails は Started から Completed までの行（request_id の印付き）、ActiveRecord は SQL の行とスロークエリログ、ビューは Rendered の行。下段はデモで GET /articles/1 を1回送ったときの値"
    >
      {rows.map((r, i) => {
        const y = 14 + i * 58
        return (
          <g key={r.s}>
            <Box x={14} y={y} w={190} h={48} lines={r.s.split('|')} fs={11.5} bold fill={i < 3 ? 'box' : 'box5'} subTone="muted" />
            <T x={216} y={y + 16} fs={11}>
              {r.log}
            </T>
            <T x={216} y={y + 36} fs={10.5} tone="muted" mono>
              {r.demo}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

const ch26: Chapter = {
  number: 26,
  part: 5,
  title: '総まとめ：1リクエストを LB から DB まで追う',
  summary:
    'GET /articles/1 を、ロードバランサー・Nginx・Puma・ミドルウェア・ルーティング・コントローラー・ActiveRecord・ビューの順に追い、各段で何が起きるか、どの章で扱ったか、起きうる問題、確かめるログをまとめます。デモの3段の構成に実際に1回要求を送り、各層のログを同じ ID で並べます。',
  goals: [
    '1つの要求が ALB から DB まで通る段階を順に挙げ、それぞれを扱った章を参照できる',
    '各段で起きうる問題と、そのときに見るログを対応させられる',
    'X-Request-Id を使って、ALB・Nginx・Rails のログを1つの要求で並べられる',
    '応答の各ヘッダーが、どの段で付けられたかを説明できる',
  ],
  prerequisites: [6, 9, 10, 12, 16, 23, 24, 25],
  sections: [
    {
      id: 'setup',
      title: '追いかける要求',
      body: (
        <>
          <p>
            この章では、これまでの章で作ったデモの構成に、<code>GET /articles/1</code> を1回だけ送ります。構成は次のとおりです。
          </p>
          <ul>
            <li>ロードバランサー役の Nginx（ALB の代わり、TLS を終端）：<ChapterLink n={25} /></li>
            <li>
              Nginx 1.30.6（try_files・proxy_pass・X-Request-Id）：<ChapterLink n={24} />
            </li>
            <li>
              Puma 8.0.2（本番環境の設定、ワーカー2・スレッド3、assume_ssl と force_ssl を有効）：<ChapterLink n={23} />
            </li>
            <li>Rails 8.1.4.1・MySQL 8.4（ログを debug にして SQL と描画の行も出す）</li>
          </ul>
          <p>
            記事のページは、記事を読み、最新のコメント2件をパーシャルで描画し、<code>turbo_stream_from</code> を出力するビューです（<ChapterLink n={17} section="overview" />
            ）。要求が通る段階の全体を図 26-1 に示します。各段の横の数字が、その段を扱った章です。
          </p>
          <Figure n="26-1" title="リクエスト全体のシーケンス" caption="デモの3段の構成（Rails 8.1.4.1・Puma 8.0.2・Nginx 1.30.6）で GET /articles/1 を処理したときの流れ。括弧の中は参照する章。">
            <SequenceFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'front',
      title: 'ロードバランサーから Puma まで',
      body: (
        <>
          <p>実際に送った要求の、ロードバランサー役と Nginx のアクセスログです。</p>
          <Code
            lang="text"
            code={`
（ロードバランサー役）
172.29.0.1 "GET /articles/1 HTTP/1.1" 200 lb_time=0.008 upstream=172.29.0.5:80 upstream_status=200
（Nginx）
172.29.0.6 xff="172.29.0.1" "GET /articles/1 HTTP/1.1" 200 request_id=e18060ac5cdf0a5095a71d12a45ef5be rt=0.007 urt=0.007
`}
          />
          <ol>
            <li>
              ロードバランサーが HTTPS を終端し、X-Forwarded-For にブラウザーの IP を、X-Forwarded-Proto に https を入れて Nginx に送ります。ここで起きうる問題は、ターゲットが1つも登録されていないときの 503、ヘルスチェックの失敗、接続できないときの
              502・504、アイドルタイムアウト（ALB の既定 60 秒）による 504 です（<ChapterLink n={25} section="triage" />
              ）。
            </li>
            <li>
              Nginx は、<code>location /</code> の <code>try_files $uri @app</code> で public/articles/1 が無いことを確かめ、<code>@app</code> から Puma に送ります（
              <ChapterLink n={24} section="location" />
              ）。Host・X-Forwarded-For・X-Forwarded-Proto・X-Request-Id をここで付けます。本文が client_max_body_size を超えれば、ここで 413 になり Rails には届きません。
            </li>
            <li>
              Puma のワーカーの reactor が要求を最後まで読み、スレッドに渡します（<ChapterLink n={23} section="cluster" />
              ）。スレッドがすべてふさがっていれば、ここで待たされます。待ち時間は Rails のログには出ないので、Puma の /stats の backlog か、X-Request-Start との差で確かめます。
            </li>
          </ol>
          <p>
            ロードバランサーで 8ms、Nginx で 7ms、次に見る Rails の Completed が 5ms でした。差の 1〜2ms が、それぞれの層の転送と待ちにかかった時間です。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'ミドルウェアからビューまで',
      body: (
        <>
          <p>本番環境のミドルウェアの順は次のとおりです（<code>bin/rails middleware</code>、末尾のルーティングは省略）。</p>
          <Code
            lang="text"
            code={`
use ActionDispatch::AssumeSSL                 ← 第25章：https とみなす
use ActionDispatch::SSL                       ← 第21・25章：HSTS、secure な Cookie
use Rack::Sendfile
use ActionDispatch::Static                    ← 第16章：public のファイル（Nginx があれば通常は届かない）
use ActionDispatch::Executor                  ← 第8・23章：クエリキャッシュ、CurrentAttributes の後始末
use Rack::Runtime                             ← X-Runtime
use Rack::MethodOverride
use ActionDispatch::RequestId                 ← 第25章：X-Request-Id
use ActionDispatch::RemoteIp                  ← 第25章：request.remote_ip
use Rails::Rack::SilenceRequest               ← 第25章：/up のログを出さない
use Rails::Rack::Logger                       ← ここで "Started GET" を書く
use ActionDispatch::ShowExceptions            ← 第10章：例外を 404・500 などに
use ActionDispatch::DebugExceptions
use ActionDispatch::Callbacks
use ActionDispatch::Cookies                   ← 第10章
use ActionDispatch::Session::CookieStore      ← 第10・21章
use ActionDispatch::Flash
use ActionDispatch::ContentSecurityPolicy::Middleware
use Rack::Head
use Rack::ConditionalGet                      ← 第22章
use Rack::ETag                                ← 第22章
use Rack::TempfileReaper
`}
          />
          <p>
            本番環境では config.hosts が空なので HostAuthorization は無く、Server-Timing も入っていません（<ChapterLink n={6} section="rails-stack" />
            ）。Logger より前のミドルウェアが返した応答（SSL のリダイレクトなど）は、Rails のログに出ません。同じ要求の Rails のログを、X-Request-Id で抜き出しました。
          </p>
          <Code
            lang="text"
            code={`
[e18060ac5cdf0a5095a71d12a45ef5be] Started GET "/articles/1" for 172.29.0.1 at 2026-11-11 11:10:02 +0000
[e18060ac5cdf0a5095a71d12a45ef5be] Processing by ArticlesController#show as */*
[e18060ac5cdf0a5095a71d12a45ef5be]   Parameters: {"id" => "1"}
[e18060ac5cdf0a5095a71d12a45ef5be]   Article Load (0.4ms)  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 1 LIMIT 1
[e18060ac5cdf0a5095a71d12a45ef5be]   Rendering layout layouts/application.html.erb
[e18060ac5cdf0a5095a71d12a45ef5be]   Rendering articles/show.html.erb within layouts/application
[e18060ac5cdf0a5095a71d12a45ef5be]   Comment Load (0.3ms)  SELECT \`comments\`.* FROM \`comments\` WHERE \`comments\`.\`article_id\` = 1 ORDER BY \`comments\`.\`id\` DESC LIMIT 2
[e18060ac5cdf0a5095a71d12a45ef5be]   Rendered collection of comments/_comment.html.erb [2 times] (Duration: 0.1ms | GC: 0.0ms)
[e18060ac5cdf0a5095a71d12a45ef5be]   Rendered articles/show.html.erb within layouts/application (Duration: 1.9ms | GC: 0.0ms)
[e18060ac5cdf0a5095a71d12a45ef5be]   Rendered layout layouts/application.html.erb (Duration: 2.8ms | GC: 0.3ms)
[e18060ac5cdf0a5095a71d12a45ef5be] Completed 200 OK in 5ms (Views: 2.9ms | ActiveRecord: 0.6ms (2 queries, 0 cached) | GC: 0.3ms)
`}
          />
          <p>
            Started の行の <code>for 172.29.0.1</code> は RemoteIp が求めたクライアントの IP で、Nginx やロードバランサーの IP ではありません（<ChapterLink n={25} section="client-ip" />
            ）。行の先頭の ID は、Nginx が作った <code>$request_id</code> と同じです。
          </p>
          <ol start={4}>
            <li>
              ルーティング：<code>recognize_path("/articles/1")</code> の結果は <code>&#123;controller: "articles", action: "show", id: "1"&#125;</code> でした。Journey が resources
              のルートから選び、ArticlesController の <code>show</code> を呼びます（<ChapterLink n={9} section="recognize" />
              ）。合うルートが無ければ 404 です。
            </li>
            <li>
              コントローラー：<code>Processing by</code> の行から、before_action（このデモでは request.variant の設定）、アクション、暗黙の render の順に進みます（
              <ChapterLink n={10} section="dispatch" />
              ）。<code>as */*</code> は、curl の Accept が <code>*/*</code> だったことを表します。
            </li>
            <li>
              ActiveRecord：<code>Article.find(1)</code> が SQL を送ります（<ChapterLink n={12} />
              ）。接続は、このスレッドが接続プールから借りたものです（<ChapterLink n={15} section="pool" />
              ）。接続が足りなければここで ConnectionTimeoutError、ロックの待ちがあればここで時間がかかります。
            </li>
            <li>
              ビュー：レイアウトとテンプレートを描画する途中で、<code>@article.comments</code> の SQL が送られています（<ChapterLink n={16} section="flow" />
              ）。コメントを表示件数ぶん別々に読む書き方なら、ここで N+1 になります（<ChapterLink n={13} section="n-plus-one" />
              ）。
            </li>
          </ol>
        </>
      ),
    },
    {
      id: 'response',
      title: '応答のヘッダー',
      body: (
        <>
          <p>ブラウザーが受け取った応答のヘッダーです。どのヘッダーをどの段が付けたかを右に書きました。</p>
          <Code
            lang="text"
            code={`
HTTP/1.1 200 OK
Server: nginx/1.30.6                                      ← Nginx（ロードバランサー役）
x-frame-options: SAMEORIGIN                               ← Rails の既定のヘッダー
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
link: </assets/application-8b441ae0.css>; rel=preload; as=style; nopush   ← stylesheet_link_tag（第16章）
vary: Accept, X-Requested-With
etag: W/"5c28e0b585c11476428a4cf5abcb8da1"                ← Rack::ETag（第22章）
cache-control: max-age=0, private, must-revalidate
set-cookie: _demo_session=…; path=/; secure; httponly; samesite=lax   ← CookieStore と SSL の secure（第10・21章）
x-request-id: e18060ac5cdf0a5095a71d12a45ef5be           ← RequestId（Nginx の $request_id を引き継いだ）
x-runtime: 0.005802                                       ← Rack::Runtime
strict-transport-security: max-age=63072000; includeSubDomains   ← ActionDispatch::SSL（既定 2 年）
X-Served-By: app-nginx                                    ← デモの Nginx の add_header
X-Served-By: lb                                           ← デモのロードバランサー役の add_header
`}
          />
          <p>
            応答の本文は Puma のスレッドが Nginx に書き込み、Nginx がバッファーしてからロードバランサーに送ります（<ChapterLink n={24} section="buffering" />
            ）。ブラウザーはその後、HTML の中の <code>/assets/…</code> を要求しますが、これは Nginx が public/assets から直接返し、Rails には届きません（
            <ChapterLink n={24} section="static" />
            ）。最後に、<code>turbo_stream_from</code> により <code>/cable</code> に WebSocket で接続し、ActionCable がソケットを Puma のスレッドから引き取ります（
            <ChapterLink n={17} section="actioncable" />
            ）。
          </p>
        </>
      ),
    },
    {
      id: 'timing',
      title: '時間の内訳を読む',
      body: (
        <>
          <p>
            各層のログに残る時間は、それぞれ次の範囲を表しています（Nginx の変数の意味は説明書による<Ref n={4} />）。デモの値を並べました。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ログの値</th>
                  <th>範囲</th>
                  <th>デモ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ロードバランサーの lb_time（ALB では各 processing_time の合計）</td>
                  <td>ロードバランサーが要求を受けてから、応答を送り終えるまで</td>
                  <td>8ms</td>
                </tr>
                <tr>
                  <td>
                    Nginx の <code>$request_time</code>（rt）
                  </td>
                  <td>Nginx が要求を読み始めてから、応答を送り終えるまで</td>
                  <td>7ms</td>
                </tr>
                <tr>
                  <td>
                    Nginx の <code>$upstream_response_time</code>（urt）
                  </td>
                  <td>Puma に接続してから、Puma の応答を受け取り終えるまで</td>
                  <td>7ms</td>
                </tr>
                <tr>
                  <td>Rails の Completed</td>
                  <td>process_action の長さ（コールバック・アクション・描画）</td>
                  <td>5ms</td>
                </tr>
                <tr>
                  <td>Views・ActiveRecord</td>
                  <td>描画（描画中の SQL を除く）と SQL の時間。重ならない（第22章）</td>
                  <td>2.9ms・0.6ms</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            urt と Rails の Completed の差には、Puma のスレッドの空きを待った時間、ミドルウェアとルーティングの処理、応答の書き込みが含まれます。この差が大きいときは、Rails のコードではなく Puma
            の混み具合を疑います。Puma の説明書は、前段の Nginx に <code>proxy_set_header X-Request-Start "t=$&#123;msec&#125;";</code> を書き、Rack のミドルウェアでその時刻と現在の時刻の差を記録して、スレッドを待った時間を計る方法を紹介しています
            <Ref n={3} />。APM の多くも、このヘッダーを読んで待ち時間を表示します。
          </p>
          <p>
            反対に、rt と urt の差が大きいときは、Nginx とクライアントの間（遅い回線や大きな応答）で時間がかかっています。ALB の各 processing_time と Nginx の rt の差は、ALB と Nginx の間の転送や接続の確立の時間です。2回目以降の同じ要求では、テンプレートのコンパイル（
            <ChapterLink n={16} section="compile" />
            ）やスキーマの読み込み（<ChapterLink n={11} section="schema" />
            ）が済んでいるので、起動直後の1回目より速くなります。性能を比べるときは、1回目を除いて測ります。
          </p>
        </>
      ),
    },
    {
      id: 'map',
      title: '段階・問題・ログの対応',
      body: (
        <>
          <p>ここまでの段階で起きうる主な問題と、確かめるログ・参照する章をまとめます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>段階</th>
                  <th>起きうる問題</th>
                  <th>見るもの</th>
                  <th>章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ALB</td>
                  <td>503（ターゲットが登録されていない）、502・504、ヘルスチェックの失敗</td>
                  <td>ALB のアクセスログ、ターゲットグループの状態</td>
                  <td>25</td>
                </tr>
                <tr>
                  <td>Nginx</td>
                  <td>413、location の誤り、ヘッダーの継承漏れ、502・504、499</td>
                  <td>access.log・error.log</td>
                  <td>24</td>
                </tr>
                <tr>
                  <td>Puma</td>
                  <td>スレッドの空き待ち、ワーカーの停止、メモリー不足</td>
                  <td>/stats の backlog、標準出力</td>
                  <td>23</td>
                </tr>
                <tr>
                  <td>ミドルウェア</td>
                  <td>SSL のリダイレクトの繰り返し、Host の拒否、CSRF の 422</td>
                  <td>応答のヘッダー（Rails のログに出ない場合がある）</td>
                  <td>6・21・25</td>
                </tr>
                <tr>
                  <td>ルーティング・コントローラー</td>
                  <td>404、406、例外の 500</td>
                  <td>Started・Processing・Completed の行、例外のバックトレース</td>
                  <td>9・10</td>
                </tr>
                <tr>
                  <td>ActiveRecord</td>
                  <td>N+1、遅い SQL、接続プールの枯渇、ロックの待ち・デッドロック</td>
                  <td>SQL の行・回数、EXPLAIN、MySQL のスロークエリログ</td>
                  <td>12・13・15</td>
                </tr>
                <tr>
                  <td>ビュー</td>
                  <td>ビューの中の N+1、描画の遅さ、エスケープ漏れ</td>
                  <td>Rendered の行、Server-Timing（開発環境）</td>
                  <td>16・21・22</td>
                </tr>
                <tr>
                  <td>非同期の処理</td>
                  <td>COMMIT 前のジョブの実行、再試行の重複</td>
                  <td>Sidekiq のログ、retry・dead</td>
                  <td>18</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            どの段でも、最初に確かめるのは「その要求がどの層まで届いたか」です。X-Request-Id（ALB では X-Amzn-Trace-Id も）で各層のログを並べると、届いていない層と、時間がかかった層がわかります（図
            26-2）。Rails のログの ID は、ActionDispatch::RequestId が受け取った X-Request-Id をそのまま使ったものです
            <Ref n={1} />。
          </p>
          <Figure n="26-2" title="段階とログの対応" caption="各段で見るログと、デモで GET /articles/1 を1回送ったときの値。">
            <LogsFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>GET /articles/1 は、ALB（TLS の終端）→ Nginx（try_files・proxy_pass）→ Puma（reactor・スレッド）→ ミドルウェア → ルーティング → コントローラー → ActiveRecord → ビューの順に処理され、同じ経路を戻ります。</li>
          <li>Logger より前のミドルウェアと、Nginx・ALB が返した応答は、Rails のログに出ません。Rails のログに無いときは、前段のログを見ます。</li>
          <li>Rails のログの Views と ActiveRecord の時間、Nginx の rt と urt、ALB の lb_time の差から、どの層で時間がかかったかがわかります。</li>
          <li>X-Request-Id を Nginx で作って渡すと、Nginx と Rails のログを1つの要求で並べられます。</li>
          <li>応答のヘッダーには、ETag・Cookie・HSTS・X-Request-Id・X-Runtime など、各段が付けた値が並びます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'actionpack/lib/action_dispatch/middleware/request_id.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/request_id.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '受け取った X-Request-Id を要求の ID として使い、応答にも付けること。' },
    { title: 'railties/lib/rails/application/default_middleware_stack.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/default_middleware_stack.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '本番環境のミドルウェアの順と、設定によって入るミドルウェア（AssumeSSL・SSL・HostAuthorization・SilenceRequest）。' },
    { title: 'Puma: docs/deployment.md（Measuring utilization and queue time）', publisher: 'puma/puma（GitHub）', url: 'https://github.com/puma/puma/blob/v8.0.2/docs/deployment.md', accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'X-Request-Start を前段で付け、スレッドを待った時間を計る方法。' },
    { title: 'Module ngx_http_log_module・ngx_http_upstream_module（Embedded Variables）', publisher: 'nginx.org', url: 'https://nginx.org/en/docs/http/ngx_http_upstream_module.html#var_upstream_response_time', accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: '$request_time（最初のバイトを読んでから最後のバイトを送ってログを書くまで）と $upstream_response_time（upstream の応答の受信にかかった時間）。' },
  ],
}

export default ch26
