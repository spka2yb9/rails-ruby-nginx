import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const PUMA = 'https://github.com/puma/puma/blob/v8.0.2'
const RACK = 'https://github.com/rack/rack/blob/v3.2.8'

/* ---------- 図 6-1 Puma と Rack アプリケーションの分担 ---------- */
function ServerAppFigure() {
  return (
    <Svg
      id="6-1"
      w={720}
      h={250}
      label="クライアントからの HTTP リクエストを Puma が受け取り、解析して env というハッシュを作る。Puma は Rails.application の call メソッドに env を渡して呼び出す。Rails.application は status、headers、body の3要素の配列を返す。Puma はそれを HTTP レスポンスとしてクライアントに書き出し、最後に body の close を呼ぶ"
    >
      <Box x={10} y={40} w={100} h={150} lines={['クライアント', '（ブラウザー・', 'LB・Nginx）']} subTone="muted" fill="bg" />

      <rect x={182} y={14} width={240} height={200} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={196} y={32} bold>
        Puma（Web サーバー）
      </T>
      <Box x={194} y={52} w={214} h={46} lines={['HTTP を解析して', 'env（Hash）を作る']} fs={12.5} />
      <Box x={194} y={140} w={214} h={56} lines={['status・headers・body を', 'HTTP の応答として書き出し、', 'body.close を呼ぶ']} fs={12} />

      <Box x={560} y={40} w={150} h={150} lines={['Rails.application', '（Rack アプリ）']} mono subTone="muted" fill="box5" />

      <Arrow x1={110} y1={75} x2={192} y2={75} />
      <T x={150} y={63} fs={11} tone="muted" anchor="middle">
        リクエスト
      </T>
      <Arrow x1={408} y1={75} x2={558} y2={75} />
      <T x={483} y={63} fs={12} anchor="middle" mono>
        call(env)
      </T>
      <Arrow x1={560} y1={168} x2={410} y2={168} />
      <T x={482} y={156} fs={11.5} anchor="middle" tone="muted">
        3要素の配列を返す
      </T>
      <Arrow x1={194} y1={168} x2={112} y2={168} />
      <T x={150} y={156} fs={11} tone="muted" anchor="middle">
        レスポンス
      </T>
      <T x={360} y={236} fs={12} tone="muted" anchor="middle">
        Puma は1つのリクエストにつき app.call(env) を1回呼ぶ
      </T>
    </Svg>
  )
}

/* ---------- 図 6-2 ミドルウェアを1つ挟んだときの呼び出し順 ---------- */
function MiddlewareSeqFigure() {
  const cols = [
    { x: 100, name: 'Puma' },
    { x: 340, name: 'Timing（ミドルウェア）' },
    { x: 580, name: 'アプリ本体（lambda）' },
  ]
  return (
    <Svg
      id="6-2"
      w={680}
      h={330}
      label="Puma が Timing の call を呼ぶ。Timing は開始時刻を記録してから、内側のアプリの call を呼ぶ。アプリは status、headers、body を Timing に返す。Timing は経過時間を x-elapsed-ms ヘッダーとして headers に追加し、配列を Puma に返す。前処理は内側を呼ぶ前、後処理は内側から戻った後に行われる"
    >
      {cols.map((c) => (
        <g key={c.name}>
          <Box x={c.x - 95} y={10} w={190} h={34} lines={c.name} fs={12.5} fill={c.name.startsWith('Timing') ? 'box5' : 'box'} />
          <line x1={c.x} y1={44} x2={c.x} y2={320} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <Arrow x1={100} y1={78} x2={336} y2={78} />
      <T x={218} y={66} mono fs={12} anchor="middle">
        call(env)
      </T>
      <Box x={350} y={96} w={170} h={34} lines="① 開始時刻を記録" fs={12} fill="bg" align="start" />
      <Arrow x1={340} y1={152} x2={576} y2={152} />
      <T x={458} y={140} mono fs={12} anchor="middle">
        @app.call(env)
      </T>
      <Box x={590} y={168} w={84} h={34} lines="② 応答を作る" fs={11.5} fill="bg" />
      <Arrow x1={580} y1={222} x2={344} y2={222} dashed />
      <T x={462} y={210} mono fs={11.5} anchor="middle">
        [200, headers, body]
      </T>
      <Box x={350} y={238} w={250} h={34} lines="③ x-elapsed-ms を headers に追加" fs={12} fill="bg" align="start" />
      <Arrow x1={340} y1={296} x2={104} y2={296} dashed />
      <T x={222} y={284} mono fs={11.5} anchor="middle">
        [200, headers, body]
      </T>
      <T x={380} y={316} fs={11} tone="muted">
        実線：呼び出し　破線：戻り値
      </T>
    </Svg>
  )
}

/* ---------- 図 6-3 Rails のミドルウェアスタック（production） ---------- */
function RailsStackFigure() {
  type Row = { name: string; role: string; dashed?: boolean; endpoint?: boolean }
  const groups: { label: string; rows: Row[] }[] = [
    {
      label: 'TLS と静的ファイル',
      rows: [
        { name: 'ActionDispatch::AssumeSSL', role: 'リクエストを HTTPS として扱う' },
        { name: 'ActionDispatch::SSL', role: 'HTTP を HTTPS へリダイレクト' },
        { name: 'Rack::Sendfile', role: 'ファイル送信を前段に任せる' },
        { name: 'ActionDispatch::Static', role: 'public/ のファイルを返す' },
      ],
    },
    {
      label: '実行の管理とログ',
      rows: [
        { name: 'ActionDispatch::Executor', role: '処理前の準備と終了後の片付け' },
        { name: 'Rack::Runtime', role: 'x-runtime（処理時間）を付ける' },
        { name: 'Rack::MethodOverride', role: '_method で PATCH・DELETE を表す' },
        { name: 'ActionDispatch::RequestId', role: 'x-request-id を付ける' },
        { name: 'ActionDispatch::RemoteIp', role: 'クライアントの IP を求める' },
        { name: 'Rails::Rack::SilenceRequest', role: '/up のログを出さない' },
        { name: 'Rails::Rack::Logger', role: '「Started GET …」のログ' },
      ],
    },
    {
      label: '例外',
      rows: [
        { name: 'ActionDispatch::ShowExceptions', role: '例外をエラー応答に変える' },
        { name: 'ActionDispatch::DebugExceptions', role: '例外をログに出す' },
      ],
    },
    {
      label: '状態とヘッダー',
      rows: [
        { name: 'ActionDispatch::Callbacks', role: 'リクエスト前後のコールバック' },
        { name: 'ActionDispatch::Cookies', role: 'Cookie を読み書きする' },
        { name: 'ActionDispatch::Session::CookieStore', role: 'セッションを Cookie に保存' },
        { name: 'ActionDispatch::Flash', role: '連鎖には入らない（後述）', dashed: true },
        { name: 'ActionDispatch::ContentSecurityPolicy::Middleware', role: 'CSP ヘッダーを付ける' },
      ],
    },
    {
      label: '応答の後処理',
      rows: [
        { name: 'Rack::Head', role: 'HEAD では本文を空にする' },
        { name: 'Rack::ConditionalGet', role: '条件付き GET で 304 を返す' },
        { name: 'Rack::ETag', role: 'etag ヘッダーを付ける' },
        { name: 'Rack::TempfileReaper', role: 'アップロードの一時ファイルを消す' },
      ],
    },
    { label: 'エンドポイント', rows: [{ name: 'ActionDispatch::Routing::RouteSet', role: 'ルーティング（第9章）', endpoint: true }] },
  ]
  const rowH = 24
  const gap = 4
  const groupGap = 12
  let y = 36
  const placed: { label: string; top: number; bottom: number; rows: ((typeof groups)[number]['rows'][number] & { y: number })[] }[] = []
  for (const g of groups) {
    const top = y
    const rows = []
    for (const r of g.rows) {
      rows.push({ ...r, y })
      y += rowH + gap
    }
    placed.push({ label: g.label, top, bottom: y - gap, rows })
    y += groupGap
  }
  const h = y + 8
  return (
    <Svg
      id="6-3"
      w={780}
      h={h}
      label="production 環境で bin/rails middleware が表示するミドルウェアを、上から順に役割ごとにまとめた図。TLS と静的ファイルの担当として AssumeSSL、SSL、Rack::Sendfile、Static。実行の管理とログとして Executor、Rack::Runtime、Rack::MethodOverride、RequestId、RemoteIp、SilenceRequest、Logger。例外の担当として ShowExceptions と DebugExceptions。状態とヘッダーの担当として Callbacks、Cookies、CookieStore、Flash、ContentSecurityPolicy::Middleware。応答の後処理として Rack::Head、ConditionalGet、ETag、TempfileReaper。最後にエンドポイントとしてルーティングの RouteSet がある。Flash は一覧には出るが、実際の呼び出しの連鎖には入らない"
    >
      <T x={150} y={16} fs={12} tone="muted" anchor="end">
        役割
      </T>
      <T x={170} y={16} fs={12} tone="muted">
        上から順にリクエストが通る
      </T>
      <T x={555} y={16} fs={12} tone="muted">
        主な働き
      </T>
      {placed.map((g) => (
        <g key={g.label}>
          <T x={146} y={(g.top + g.bottom) / 2} fs={12} anchor="end" bold>
            {g.label}
          </T>
          <line x1={156} y1={g.top + 2} x2={156} y2={g.bottom - 2} stroke="var(--fig-line)" strokeWidth={2} />
          {g.rows.map((r) => (
            <g key={r.name}>
              <Box
                x={168}
                y={r.y}
                w={372}
                h={rowH}
                lines={r.name}
                mono
                fs={11.5}
                rx={4}
                dashed={r.dashed}
                fill={r.endpoint ? 'box5' : r.dashed ? 'bg' : 'box'}
                align="start"
              />
              <T x={555} y={r.y + rowH / 2} fs={11.5} tone={r.dashed ? 'muted' : undefined}>
                {r.role}
              </T>
            </g>
          ))}
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図 6-4 reverse と inject による組み立て ---------- */
function BuildFigure() {
  return (
    <Svg
      id="6-4"
      w={740}
      h={300}
      label="ミドルウェアの配列が上から SSL、Logger、ETag の順で、エンドポイントが routes の場合の組み立て。配列を逆順にして、まず ETag.new(routes)、次に Logger.new(etag)、最後に SSL.new(logger) を作る。最後に作った SSL のインスタンスが Rails.application.app になり、SSL の @app が Logger、Logger の @app が ETag、ETag の @app が routes を指す入れ子の構造になる"
    >
      <T x={20} y={20} fs={12} tone="muted">
        middlewares（上から順）
      </T>
      <Box x={20} y={34} w={150} h={30} lines="SSL" mono />
      <Box x={20} y={70} w={150} h={30} lines="Logger" mono />
      <Box x={20} y={106} w={150} h={30} lines="ETag" mono />
      <Box x={20} y={160} w={150} h={30} lines="routes" mono fill="box5" />
      <T x={20} y={150} fs={12} tone="muted">
        endpoint
      </T>

      <T x={220} y={20} fs={12} tone="muted">
        reverse して先頭から inject
      </T>
      <Box x={220} y={34} w={240} h={34} lines="① etag = ETag.new(routes)" mono fs={12} fill="bg" align="start" />
      <Box x={220} y={84} w={240} h={34} lines="② logger = Logger.new(etag)" mono fs={12} fill="bg" align="start" />
      <Box x={220} y={134} w={240} h={34} lines="③ ssl = SSL.new(logger)" mono fs={12} fill="bg" align="start" />
      <Arrow x1={340} y1={68} x2={340} y2={82} />
      <Arrow x1={340} y1={118} x2={340} y2={132} />
      <Arrow x1={340} y1={168} x2={340} y2={200} />
      <T x={348} y={186} fs={11.5} tone="muted">
        戻り値
      </T>
      <Box x={220} y={204} w={240} h={34} lines="Rails.application.app" mono fs={12} fill="box5" />

      <rect x={500} y={34} width={225} height={248} rx={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={512} y={52} mono fs={12} bold>
        SSL
      </T>
      <rect x={515} y={66} width={195} height={204} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={527} y={84} mono fs={12} bold>
        Logger
      </T>
      <rect x={530} y={98} width={165} height={160} rx={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={542} y={116} mono fs={12} bold>
        ETag
      </T>
      <Box x={545} y={150} w={135} h={40} lines="routes" mono fill="box5" />
      <T x={612} y={226} fs={11.5} tone="muted" anchor="middle">
        内側ほど後に呼ばれる
      </T>
      <T x={600} y={292} fs={11.5} tone="muted" anchor="middle">
        外側の @app が内側を指す
      </T>
    </Svg>
  )
}

const ch06: Chapter = {
  number: 6,
  part: 2,
  title: 'Rack とミドルウェア',
  summary:
    'Web サーバーと Ruby のアプリケーションをつなぐ Rack の取り決め、ミドルウェアの形、Rails のミドルウェアスタックの中身と組み立て方を説明します。Puma から受け取ったリクエストが Rails のルーティングに届くまでの経路が分かります。',
  goals: [
    'Rack アプリケーションの条件（call(env) が3要素の配列を返す）を説明できる',
    'Puma と Rails の役割の分担と、env に入る主なキーを説明できる',
    'ミドルウェアの前処理・後処理と、内側を呼ばずに応答を返す書き方を理解する',
    'Rails の既定のミドルウェアと、その並び順が設定で決まる仕組みを説明できる',
    'config.middleware の変更がいつ、どの順で適用されるかを説明できる',
    'Rack 3 でのヘッダー名や body の扱いの変更を理解する',
  ],
  prerequisites: [1, 4],
  sections: [
    {
      id: 'rack-contract',
      title: 'Rack の取り決め',
      body: (
        <>
          <p>
            <Term>Rack</Term> は、Ruby の Web サーバーと Web アプリケーションの間の受け渡し方を決めた仕様と、その仕様に沿った部品をまとめた gem です。仕様の要点は次のとおりです
            <Ref n={1} />。
          </p>
          <ul>
            <li>
              Rack アプリケーションは <code>call</code> メソッドを持つオブジェクトです。<code>call</code> は引数を1つだけ受け取ります。この引数を <Term en="environment">env</Term>{' '}
              と呼び、HTTP リクエストの内容を表すハッシュです。
            </li>
            <li>
              <code>call</code> は、ステータス・ヘッダー・本文（body）の3要素からなる配列を返します。この配列は凍結（freeze）されていてはいけません。
            </li>
          </ul>
          <p>
            <code>call</code> を持っていればよいので、lambda もそのまま Rack アプリケーションになります。次の <code>config.ru</code> は、リクエストのメソッドとパスを返すだけのアプリケーションです。
          </p>
          <Code
            lang="ruby"
            title="config.ru"
            code={`
run ->(env) {
  [200, { "content-type" => "text/plain" }, ["#{env["REQUEST_METHOD"]} #{env["PATH_INFO"]}?#{env["QUERY_STRING"]}\\n"]]
}
`}
          />
          <p>env には、CGI の仕様に由来する大文字のキーと、Rack が定めた rack. で始まるキーが入ります。主なものを表にまとめます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>キー</th>
                  <th>内容</th>
                  <th>例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>REQUEST_METHOD</code>
                  </td>
                  <td>HTTP メソッド。空にはならない</td>
                  <td>
                    <code>"GET"</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>SCRIPT_NAME</code>
                  </td>
                  <td>アプリケーションが配置されたパスの部分。ルートに置いた場合は空文字列</td>
                  <td>
                    <code>""</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>PATH_INFO</code>
                  </td>
                  <td>SCRIPT_NAME より後ろのパス</td>
                  <td>
                    <code>"/articles/1"</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>QUERY_STRING</code>
                  </td>
                  <td>? より後ろの部分。空でもキーは必ずある</td>
                  <td>
                    <code>"page=2"</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>SERVER_NAME</code>・<code>SERVER_PORT</code>・<code>SERVER_PROTOCOL</code>
                  </td>
                  <td>ホスト名、ポート、HTTP のバージョン</td>
                  <td>
                    <code>"HTTP/1.1"</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>HTTP_*</code>
                  </td>
                  <td>リクエストヘッダー。名前を大文字にし、- を _ に変えて HTTP_ を付ける</td>
                  <td>
                    <code>HTTP_X_FORWARDED_FOR</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>CONTENT_TYPE</code>・<code>CONTENT_LENGTH</code>
                  </td>
                  <td>本文の種類と長さ。この2つは HTTP_ を付けない</td>
                  <td>
                    <code>"application/json"</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>rack.url_scheme</code>
                  </td>
                  <td>http・https など。直前の接続のスキームを入れる</td>
                  <td>
                    <code>"http"</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>rack.input</code>
                  </td>
                  <td>リクエスト本文を読む IO のようなオブジェクト（任意）</td>
                  <td>POST の本文</td>
                </tr>
                <tr>
                  <td>
                    <code>rack.errors</code>
                  </td>
                  <td>エラー出力先</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>rack.url_scheme</code> について、仕様は「最後の区間の接続に合わせる」としています。ロードバランサーまでが HTTPS で、その先の Puma までが HTTP の場合、ここには <code>"http"</code>{' '}
            が入ります
            <Ref n={1} />。Rails がこれを HTTPS と扱うための設定は、<ChapterLink n={25} />で説明します。
          </p>
          <p>応答の3要素には、次の条件があります。</p>
          <ul>
            <li>ステータスは 100 以上の整数です。</li>
            <li>
              ヘッダーは凍結されていないハッシュです。キーは文字列で、大文字を含んではいけません。値は文字列か、文字列の配列です。rack. で始まるキーはサーバーとの連絡用で、クライアントには送られません。
            </li>
            <li>
              body は <code>each</code> か <code>call</code> に応答するオブジェクトです。<code>each</code> で文字列を順に渡す形を Enumerable Body、<code>call</code>{' '}
              にストリームを渡して書き込ませる形を Streaming Body と呼びます。body が <code>close</code> に応答する場合、サーバーは送信後に必ず <code>close</code> を呼びます。
            </li>
          </ul>
          <p>
            Rack には、アプリケーションやミドルウェアが仕様を守っているかを実行時に検査する <code>Rack::Lint</code> があります。自作のミドルウェアをテストするときに使えます。
          </p>
        </>
      ),
    },
    {
      id: 'server-and-app',
      title: 'Web サーバーとアプリケーションの分担',
      body: (
        <>
          <p>
            Rack の仕様があるため、Web サーバーとアプリケーションは互いの実装を知らずに組み合わせられます。Puma の側は、通信の接続口であるソケットから HTTP リクエストを読んで解析し、env を作って{' '}
            <code>app.call(env)</code> を呼び、返ってきた配列を HTTP の応答として書き出します。Rails の側は、env を受け取って3要素の配列を返すことだけを担当します。
          </p>
          <Figure n="6-1" title="Puma と Rack アプリケーションの分担" caption="模式図。HTTP の解析と書き出しは Puma が行い、Rails は Ruby のオブジェクトだけを扱う。">
            <ServerAppFigure />
          </Figure>
          <p>Puma のソースでは、アプリケーションを呼ぶ部分は次のようになっています。</p>
          <Code
            lang="ruby"
            title="puma/lib/puma/response.rb（77〜97行目）"
            href={`${PUMA}/lib/puma/response.rb#L77-L97`}
            code={`
      begin
        status, headers, app_body = @thread_pool.with_force_shutdown do
          @app.call(env)
        end

        # app_body needs to always be closed, hold value in case lowlevel_error
        # is called
        res_body = app_body

        # full hijack, app called env['rack.hijack']
        return :async if client.hijacked

        status = status.to_i

        if status == -1
          unless headers.empty? and res_body == []
            raise "async response must have empty headers and body"
          end

          return :async
        end
`}
          />
          <p>
            <code>@app</code> が Rack アプリケーションです。この呼び出しの後で、Puma は応答の書き出しに進みます。アプリケーションが例外を投げた場合は、Puma が 500 の応答を作ります（同じファイルの 103〜107 行目）
            <Ref n={9} />。
          </p>
          <p>
            <code>@app</code> に入るオブジェクトは、起動時に <code>config.ru</code> を <code>Rack::Builder.parse_file</code> で評価して作られます
            <Ref n={10} />。Rails が生成する <code>config.ru</code> は次の内容です。
          </p>
          <Code
            lang="ruby"
            title="config.ru（rails new で生成）"
            code={`
require_relative "config/environment"

run Rails.application
Rails.application.load_server
`}
          />
          <p>
            <code>config/environment.rb</code> を読み込むとアプリケーションの初期化が終わり（<ChapterLink n={7} />）、<code>run</code> で <code>Rails.application</code>{' '}
            を Rack アプリケーションとして登録します。つまり Puma の <code>@app.call(env)</code> は、<code>Rails.application.call(env)</code> を呼んでいます。
          </p>
        </>
      ),
    },
    {
      id: 'middleware',
      title: 'ミドルウェアの形',
      body: (
        <>
          <p>
            <Term en="middleware">ミドルウェア</Term>は、別の Rack アプリケーションを内側に持ち、そのアプリケーションの前後で処理を行う Rack アプリケーションです。<code>initialize</code>{' '}
            で内側のアプリケーションを受け取り、<code>call</code> の中で内側の <code>call</code> を呼びます。次の例は、内側の処理にかかった時間をヘッダーに入れるミドルウェアです。
          </p>
          <Code
            lang="ruby"
            title="config.ru"
            code={`
class Timing
  def initialize(app)
    @app = app                     # 内側の Rack アプリケーション
  end

  def call(env)
    started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    status, headers, body = @app.call(env)                     # 内側を呼ぶ
    elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started
    headers["x-elapsed-ms"] = (elapsed * 1000).round(3).to_s   # 後処理
    [status, headers, body]
  end
end

use Timing
run ->(env) { [200, { "content-type" => "text/plain" }, ["#{env["REQUEST_METHOD"]} #{env["PATH_INFO"]}?#{env["QUERY_STRING"]}\\n"]] }
`}
          />
          <p>Puma 8.0.2 で起動してリクエストを送ると、次の応答が返りました。</p>
          <Code
            lang="text"
            code={`
$ curl -si "http://127.0.0.1:9292/hello?x=1"
HTTP/1.1 200 OK
content-type: text/plain
x-elapsed-ms: 0.004
content-length: 15

GET /hello?x=1
`}
          />
          <p>
            <code>x-elapsed-ms</code> は Timing が追加したヘッダー、<code>content-length</code> は Puma が本文の長さから付けたヘッダーです。<code>use</code> と <code>run</code> は{' '}
            <code>Rack::Builder</code> のメソッドで、<code>use Timing</code> は「<code>run</code> に渡したアプリケーションを <code>Timing.new</code> で包む」という意味になります。
          </p>
          <Figure n="6-2" title="ミドルウェアを1つ挟んだときの呼び出し順" caption="図 6-1 の Rails.application の位置に、Timing とアプリ本体が入った状態。">
            <MiddlewareSeqFigure />
          </Figure>
          <p>
            図 6-2 のように、<code>@app.call(env)</code> より前に書いた処理はリクエストが内側へ進むときに、後に書いた処理は応答が外側へ戻るときに実行されます。ミドルウェアが何段も重なると、リクエストは外側から順に、応答は内側から順に処理されます。
          </p>
          <p>
            内側を呼ばずに自分で配列を返すこともできます。認証に失敗したら 401 を返す、メンテナンス中なら 503 を返す、といった処理はこの形で書きます。その場合、内側のミドルウェアとアプリケーションは実行されません。
          </p>
          <Callout kind="warn">
            <p>
              Rack 3 の仕様では、ミドルウェアが body の <code>each</code> を直接呼ぶことを禁じています。本文を加工したい場合は、元の body の <code>each</code>{' '}
              を呼ぶ新しい body を返します。また、元の body を新しい body に置き換える場合も、元の body の <code>close</code> が呼ばれるようにする必要があります
              <Ref n={1} />。Rack には、<code>close</code> のときに処理を追加するための <code>Rack::BodyProxy</code> があり、Rails の応答の body もこのクラスで包まれています。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'rails-stack',
      title: 'Rails のミドルウェアスタック',
      body: (
        <>
          <p>
            Rails の多くの機能は、ルーティングより手前のミドルウェアとして実装されています。並び順は <code>bin/rails middleware</code> で確認できます。次は、Rails 8.1.4.1 で新規作成したアプリケーションを production
            環境で実行した結果です。
          </p>
          <Code
            lang="text"
            code={`
$ RAILS_ENV=production bin/rails middleware
use ActionDispatch::AssumeSSL
use ActionDispatch::SSL
use Rack::Sendfile
use ActionDispatch::Static
use ActionDispatch::Executor
use Rack::Runtime
use Rack::MethodOverride
use ActionDispatch::RequestId
use ActionDispatch::RemoteIp
use Rails::Rack::SilenceRequest
use Rails::Rack::Logger
use ActionDispatch::ShowExceptions
use ActionDispatch::DebugExceptions
use ActionDispatch::Callbacks
use ActionDispatch::Cookies
use ActionDispatch::Session::CookieStore
use ActionDispatch::Flash
use ActionDispatch::ContentSecurityPolicy::Middleware
use Rack::Head
use Rack::ConditionalGet
use Rack::ETag
use Rack::TempfileReaper
run Demo::Application.routes
`}
          />
          <p>
            上にあるものほど外側にあり、リクエストを先に受け取ります。最後の <code>run</code> の行には、ミドルウェアを通ったリクエストを最後に受け取るアプリケーション（ここではエンドポイントと呼びます）を指定します。これは、ルーティングを行う <code>RouteSet</code>{' '}
            のインスタンスです。役割ごとにまとめると図 6-3 のようになります。各ミドルウェアの説明は Rails ガイドにもあります
            <Ref n={3} />。
          </p>
          <Figure
            n="6-3"
            title="Rails のミドルウェアスタック（production）"
            caption="Rails 8.1.4.1 の新規アプリケーションを production 環境で実行した結果を、役割ごとにまとめた図。役割の分け方は本書によるもの。"
          >
            <RailsStackFigure />
          </Figure>
          <p>この並びは、railties の DefaultMiddlewareStack が設定値を見ながら組み立てています。前半を引用します。</p>
          <Code
            lang="ruby"
            title="railties/lib/rails/application/default_middleware_stack.rb（14〜35行目）"
            href={`${GH}/railties/lib/rails/application/default_middleware_stack.rb#L14-L35`}
            code={`
      def build_stack
        ActionDispatch::MiddlewareStack.new do |middleware|
          unless Array(config.hosts).empty?
            middleware.use ::ActionDispatch::HostAuthorization, config.hosts, **config.host_authorization
          end

          if config.assume_ssl
            middleware.use ::ActionDispatch::AssumeSSL
          end

          if config.force_ssl
            middleware.use ::ActionDispatch::SSL, **config.ssl_options,
              ssl_default_redirect_status: config.action_dispatch.ssl_default_redirect_status
          end

          middleware.use ::Rack::Sendfile, config.action_dispatch.x_sendfile_header

          if config.public_file_server.enabled
            headers = config.public_file_server.headers || {}

            middleware.use ::ActionDispatch::Static, paths["public"].first, index: config.public_file_server.index_name, headers: headers
          end
`}
          />
          <p>
            <code>use</code> を呼んだ順がそのまま並び順になり、多くのミドルウェアは <code>if</code> で設定値を確かめてから追加されます
            <Ref n={4} />。新規アプリケーションの <code>config/environments/production.rb</code> には <code>config.assume_ssl = true</code>、<code>config.force_ssl = true</code>、
            <code>config.silence_healthcheck_path = "/up"</code> が書かれているので、AssumeSSL・SSL・SilenceRequest が入ります。AssumeSSL は、TLS を終端したロードバランサーの後ろでも
            HTTPS のリクエストとして扱えるように、env の <code>HTTPS</code> や <code>rack.url_scheme</code> を書き換えるミドルウェアです
            <Ref n={12} />。
          </p>
          <p>development 環境では、同じアプリケーションでも次の違いがありました。</p>
          <ul>
            <li>
              先頭に <code>ActionDispatch::HostAuthorization</code> が入る。development では <code>config.hosts</code> の既定値に <code>.localhost</code>・<code>.test</code> とすべての IP アドレスが入っており、空ではないため。
            </li>
            <li>
              <code>ActionDispatch::Reloader</code>（コードの再読み込み。<ChapterLink n={8} />）、<code>ActionDispatch::ActionableExceptions</code>、
              <code>ActiveRecord::Migration::CheckPending</code>（未実行のマイグレーションの検出）、<code>ActionDispatch::ServerTiming</code> が入る。
            </li>
            <li>
              アセット配信の <code>Propshaft::Server</code> と、そのログを抑える <code>Propshaft::QuietAssets</code> が入る。
            </li>
            <li>
              <code>ActiveSupport::Cache::Strategy::LocalCache::Middleware</code> が入る。development のキャッシュストア（memory_store）が LocalCache を持つため、Bootstrap の初期化処理がこのミドルウェアを加える。
            </li>
            <li>
              AssumeSSL・SSL・SilenceRequest は入らない。エンドポイントは <code>Rails::Engine::LazyRouteSet</code>（routes.rb を最初に必要になったときに読み込む RouteSet のサブクラス）になる。
            </li>
          </ul>
          <p>本書の各章とは、次のように対応します。</p>
          <ul>
            <li>Executor・Reloader：<ChapterLink n={8} /></li>
            <li>エンドポイントの RouteSet：<ChapterLink n={9} /></li>
            <li>ShowExceptions・DebugExceptions・Cookies・CookieStore・Flash：<ChapterLink n={10} /></li>
            <li>SSL・HostAuthorization・ContentSecurityPolicy：<ChapterLink n={21} /></li>
            <li>ConditionalGet・ETag：<ChapterLink n={22} /></li>
            <li>Sendfile・Static：<ChapterLink n={24} /></li>
            <li>AssumeSSL・RequestId・RemoteIp・SilenceRequest：<ChapterLink n={25} /></li>
          </ul>
        </>
      ),
    },
    {
      id: 'build',
      title: 'スタックの組み立てと Rails.application.call',
      body: (
        <>
          <p>
            <code>Rails.application.call(env)</code> の実装は、Rails::Engine にあります（Rails::Application は Rails::Engine のサブクラスです。<ChapterLink n={7} />）。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/engine.rb（514〜535行目）"
            href={`${GH}/railties/lib/rails/engine.rb#L514-L535`}
            code={`
    # Returns the underlying Rack application for this engine.
    def app
      @app || @app_build_lock.synchronize {
        @app ||= begin
          stack = default_middleware_stack
          config.middleware = build_middleware.merge_into(stack)
          config.middleware.build(endpoint)
        end
      }
    end

    # Returns the endpoint for this engine. If none is registered,
    # defaults to an ActionDispatch::Routing::RouteSet.
    def endpoint
      self.class.endpoint || routes
    end

    # Define the Rack API for this engine.
    def call(env)
      req = build_request env
      app.call req.env
    end
`}
          />
          <p>
            <code>call</code> は、env から <code>ActionDispatch::Request</code> を作り（このとき <code>req.routes</code> などを設定します）、<code>app</code> が返すオブジェクトの{' '}
            <code>call</code> に env を渡します。<code>app</code> は、既定のスタック（前節の build_stack）にアプリケーションの設定（<code>config.middleware</code>）を適用し、エンドポイントを渡して{' '}
            <code>build</code> した結果を <code>@app</code> に保存します
            <Ref n={5} />。<code>@app_build_lock</code> による排他は、複数のスレッドが同時に組み立てを始めないためのものです。なお、この <code>app</code> は初期化の最後の段階（Finisher の{' '}
            <code>build_middleware_stack</code> という初期化処理）で一度呼ばれるので、リクエストを受ける時点では組み立てが終わっています。
          </p>
          <p>組み立ての本体は ActionDispatch::MiddlewareStack の build です。</p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/stack.rb（166〜175行目）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/stack.rb#L166-L175`}
            code={`
    def build(app = nil, &block)
      instrumenting = ActiveSupport::Notifications.notifier.listening?(InstrumentationProxy::EVENT_NAME)
      middlewares.freeze.reverse.inject(app || block) do |a, e|
        if instrumenting
          e.build_instrumented(a)
        else
          e.build(a)
        end
      end
    end
`}
          />
          <p>
            <code>middlewares</code> は <code>use</code> で登録した順の配列で、各要素の <code>build(a)</code> は <code>klass.new(a, *args, &block)</code> を実行します（同じファイルの 43〜45 行目）
            <Ref n={6} />。配列を逆順にしてから <code>inject</code> するので、最も内側（エンドポイントの直前）のミドルウェアから順にインスタンスが作られ、作ったインスタンスが1つ外側のミドルウェアの{' '}
            <code>new</code> に渡されます。最後に作られる、一番外側のインスタンスが戻り値です。
          </p>
          <Figure n="6-4" title="reverse と inject による組み立て" caption="模式図。ミドルウェアを3つに減らして描いている。実際の production 環境では、外側から AssumeSSL、SSL、Rack::Sendfile … と続く。">
            <BuildFigure />
          </Figure>
          <p>
            組み立てた結果を確かめるため、development 環境で <code>Rails.application.app</code> から <code>@app</code> を順にたどるスクリプトを実行しました。
          </p>
          <Code
            lang="ruby"
            code={`
obj = Rails.application.app
chain = []
while obj
  chain << obj.class.name
  obj = obj.instance_variable_get(:@app)
end
puts chain.size  # => 27
puts chain.first(3).join(" -> ")
# => ActionDispatch::HostAuthorization -> Rack::Sendfile -> ActionDispatch::Static
puts chain.last(3).join(" -> ")
# => Rack::ETag -> Rack::TempfileReaper -> Rails::Engine::LazyRouteSet
`}
          />
          <p>
            <code>bin/rails middleware</code>（development）には27個のミドルウェアが表示されるので、エンドポイントを加えると28個になるはずですが、たどれたのは27個でした。抜けていたのは{' '}
            <code>ActionDispatch::Flash</code> です。Flash はクラスですが、<code>self.new</code> が内側のアプリケーションをそのまま返すように定義されています。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/flash.rb（312行目）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/flash.rb#L312`}
            code={`
    def self.new(app) app; end
`}
          />
          <p>
            <code>new</code> が受け取った内側のアプリケーションをそのまま返すので、build の <code>inject</code> では Flash の段が消えます
            <Ref n={8} />。Flash の機能は、リクエストのオブジェクトから必要になったときに読み込まれます。一覧に表示されることと、呼び出しの連鎖に入ることは別だという例です。
          </p>
          <Callout kind="note">
            <p>
              <code>process_middleware.action_dispatch</code> というイベントを購読しているときは、build が各ミドルウェアを <code>InstrumentationProxy</code>{' '}
              で包み、ミドルウェアごとの実行時間を ActiveSupport::Notifications で計測できるようにします（stack.rb の 52〜70 行目）
              <Ref n={6} />。購読していなければ包まないので、通常の実行では余分な処理は入りません。
            </p>
          </Callout>
          <p>
            デモのアプリケーションに <code>GET /articles/1</code> を送り、<code>Rails.application.call(env)</code> の戻り値を調べると、ステータスは <code>200</code>、ヘッダーは{' '}
            <code>Rack::Headers</code>、body は <code>Rack::BodyProxy</code> のインスタンスでした。env には、ルーティングが設定した <code>action_dispatch.request.path_parameters</code>（値は{' '}
            <code>{'{controller: "articles", action: "show", id: "1"}'}</code>）が追加されていました。ルーティングが env に何を書き込むかは<ChapterLink n={9} />で説明します。
          </p>
        </>
      ),
    },
    {
      id: 'customize',
      title: 'スタックの変更',
      body: (
        <>
          <p>
            アプリケーションのミドルウェアは、<code>config/application.rb</code> や <code>config/environments/*.rb</code>、<code>config/initializers/*.rb</code> の中で{' '}
            <code>config.middleware</code> を使って変更します
            <Ref n={3} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>メソッド</th>
                  <th>働き</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>use(klass, *args)</code>
                  </td>
                  <td>末尾（エンドポイントの直前）に追加する</td>
                </tr>
                <tr>
                  <td>
                    <code>insert_before(既存, klass, *args)</code>
                  </td>
                  <td>既存のミドルウェアの直前（外側）に追加する。<code>insert</code> は同じ意味</td>
                </tr>
                <tr>
                  <td>
                    <code>insert_after(既存, klass, *args)</code>
                  </td>
                  <td>既存のミドルウェアの直後（内側）に追加する</td>
                </tr>
                <tr>
                  <td>
                    <code>unshift(klass, *args)</code>
                  </td>
                  <td>先頭（一番外側）に追加する</td>
                </tr>
                <tr>
                  <td>
                    <code>swap(既存, klass, *args)</code>
                  </td>
                  <td>既存のミドルウェアを置き換える</td>
                </tr>
                <tr>
                  <td>
                    <code>move_before(基準, 対象)</code>・<code>move_after(基準, 対象)</code>
                  </td>
                  <td>対象を基準の直前・直後へ移す</td>
                </tr>
                <tr>
                  <td>
                    <code>delete(klass)</code>
                  </td>
                  <td>取り除く。<code>delete!</code> は見つからないと例外を投げる</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>config.middleware</code> は MiddlewareStack そのものではなく、MiddlewareStackProxy というオブジェクトです。このオブジェクトは、呼ばれた操作を lambda にして配列にためておくだけで、その場ではスタックを変更しません。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/configuration.rb（52〜94行目、一部省略）"
            href={`${GH}/railties/lib/rails/configuration.rb#L52-L94`}
            code={`
      def insert_before(...)
        @operations << -> middleware { middleware.insert_before(...) }
      end

      alias :insert :insert_before

      def insert_after(...)
        @operations << -> middleware { middleware.insert_after(...) }
      end

      # （swap・use・unshift も同じ形で @operations に追加する）

      def delete(...)
        @delete_operations << -> middleware { middleware.delete(...) }
      end

      def move_before(...)
        @delete_operations << -> middleware { middleware.move_before(...) }
      end

      # （move_after も同じ形で @delete_operations に追加する）

      def merge_into(other) # :nodoc:
        (@operations + @delete_operations).each do |operation|
          operation.call(other)
        end

        other
      end
`}
          />
          <p>
            ためた lambda は、前節の Engine#app の <code>build_middleware.merge_into(stack)</code> で既定のスタックに順に適用されます
            <Ref n={7} />。<ChapterLink n={4} />で見た「lambda を保存して後で呼ぶ」使い方です。この実装から、次の2点が分かります。
          </p>
          <ul>
            <li>設定ファイルを読み込む時点では既定のスタックがまだ無くても、既定のミドルウェアを基準に insert_before などを書ける。</li>
            <li>
              適用の順は、追加系（<code>@operations</code>）が全部終わってから削除・移動系（<code>@delete_operations</code>）になる。書いた順ではない。
            </li>
          </ul>
          <p>2点目を確かめるため、デモのアプリケーションに次の初期化ファイルを置きました。</p>
          <Code
            lang="ruby"
            title="config/initializers/middleware.rb（検証用）"
            code={`
require Rails.root.join("lib/middleware/timing").to_s

Rails.application.config.middleware.insert_before Rails::Rack::Logger, Timing
Rails.application.config.middleware.delete Rack::Runtime
Rails.application.config.middleware.use Rack::Runtime   # delete の後に書いた
`}
          />
          <p>
            <code>bin/rails middleware</code> の結果では、Timing は Rails::Rack::Logger の直前に入りましたが、Rack::Runtime は一覧から消えていました。<code>use</code> で追加した Rack::Runtime
            も、後から適用された <code>delete</code> で取り除かれたためです（MiddlewareStack の <code>delete</code> は、同じクラスのものをすべて取り除きます）。
          </p>
          <Callout kind="warn">
            <p>
              自作のミドルウェアを <code>lib/middleware/</code> に置く場合、Rails ガイドは <code>config.autoload_lib(ignore: %w[assets tasks middleware])</code>{' '}
              のようにオートロードの対象から外すことを勧めています
              <Ref n={3} />。外さないと、Zeitwerk は <code>lib/middleware/timing.rb</code> に <code>Middleware::Timing</code> が定義されていると期待するため、production
              環境の一括読み込みで食い違いが起きます（<ChapterLink n={8} />）。また、ミドルウェアのスタックは起動時に一度だけ組み立てられ、開発環境でも再読み込みの対象になりません。変更したらサーバーを再起動します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'rack3',
      title: 'Rack 3 での変更点',
      body: (
        <>
          <p>
            Rack 3.0（2022年9月）と 3.1（2024年6月）で、仕様にいくつかの非互換な変更が入りました
            <Ref n={2} />。Rails のコードを読むときや、古いミドルウェアを使い続けるときに関係するものを表にまとめます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>Rack 2 まで</th>
                  <th>Rack 3 以降</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>応答ヘッダーの名前</td>
                  <td>大文字小文字は自由（<code>Content-Type</code>）</td>
                  <td>小文字のみ（<code>content-type</code>）。<code>Rack::Headers</code> が追加された</td>
                </tr>
                <tr>
                  <td>複数の値を持つヘッダー</td>
                  <td>改行で区切った1つの文字列</td>
                  <td>文字列の配列</td>
                </tr>
                <tr>
                  <td>body</td>
                  <td>
                    <code>each</code> に応答するもの
                  </td>
                  <td>
                    <code>call</code> に応答する Streaming Body も可。ミドルウェアは body の <code>each</code> を直接呼ばない
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>rack.input</code>
                  </td>
                  <td>必須で、巻き戻し（rewind）できること</td>
                  <td>巻き戻しは不要（3.0）、キー自体が任意（3.1）</td>
                </tr>
                <tr>
                  <td>
                    <code>rack.version</code>・<code>rack.multithread</code> など
                  </td>
                  <td>必須</td>
                  <td>必須ではなくなった</td>
                </tr>
                <tr>
                  <td>
                    <code>rackup</code> コマンドと <code>Rack::Server</code>
                  </td>
                  <td>rack gem に含まれる</td>
                  <td>rackup gem に分離</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>大文字を含むヘッダー名は、Rack::Lint で検査すると例外になります。</p>
          <Code
            lang="ruby"
            code={`
bad = ->(env) { [200, { "Content-Type" => "text/plain" }, ["x"]] }
Rack::MockRequest.new(Rack::Lint.new(bad)).get("/")
# => Rack::Lint::LintError: uppercase character in header name: Content-Type
`}
          />
          <p>
            Rails 8.1.4.1 の actionpack は rack 2.2.4 以上を要求しており、Rack 2.2 と 3 系のどちらでも動くように書かれています
            <Ref n={13} />。たとえば、Rails 自身が付けるヘッダー名の定数は、読み込まれた Rack のバージョンで切り替えています。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/constants.rb（9〜23行目）"
            href={`${GH}/actionpack/lib/action_dispatch/constants.rb#L9-L23`}
            code={`
    # Response Header keys for Rack 2.x and 3.x
    if Gem::Version.new(Rack::RELEASE) < Gem::Version.new("3")
      VARY = "Vary"
      CONTENT_ENCODING = "Content-Encoding"
      CONTENT_SECURITY_POLICY = "Content-Security-Policy"
      CONTENT_SECURITY_POLICY_REPORT_ONLY = "Content-Security-Policy-Report-Only"
      LOCATION = "Location"
      FEATURE_POLICY = "Feature-Policy"
      X_REQUEST_ID = "X-Request-Id"
      X_CASCADE = "X-Cascade"
      SERVER_TIMING = "Server-Timing"
      STRICT_TRANSPORT_SECURITY = "Strict-Transport-Security"
    else
      VARY = "vary"
      CONTENT_ENCODING = "content-encoding"
`}
          />
          <p>
            応答のヘッダーを表すクラスも、Rack 3 では <code>Rack::Headers</code>、Rack 2 では <code>Rack::Utils::HeaderHash</code> を使います（<code>action_dispatch/http/response.rb</code> の 39〜47
            行目）
            <Ref n={11} />。<code>Rack::Headers</code> は、どの大文字小文字でキーを指定しても小文字のキーとして扱うハッシュなので、<code>response.headers["Content-Type"]</code>{' '}
            のように書いても動きます。一方、Rails を通さない自作のミドルウェアで普通のハッシュを返す場合は、小文字で書く必要があります。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2.4 の actionpack は rack を 2.2.4 以上 3.3 未満に制限しています
              <Ref n={13} />。ミドルウェアの既定の並びはほぼ同じですが、<code>config.silence_healthcheck_path</code>（Rails::Rack::SilenceRequest）は 8.0 で追加されたもので、7.2 にはありません
              <Ref n={14} />。development 環境のエンドポイントを LazyRouteSet にする仕組み（ルートの描画を最初のリクエストまで遅らせる変更）も 8.0 からです
              <Ref n={15} />。業務のアプリケーションで Gemfile.lock の rack が 2.2 系のままの場合、Rack 3 の挙動を前提にした説明（ヘッダー名が小文字であることなど）は当てはまりません。
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
          <li>Rack アプリケーションは、env を受け取って [ステータス, ヘッダー, body] を返す call を持つオブジェクトです。</li>
          <li>Puma は HTTP の解析と env の作成、応答の書き出しを行い、各リクエストで Rails.application.call(env) を1回呼びます。</li>
          <li>ミドルウェアは内側のアプリケーションを @app に持ち、その前後で処理します。内側を呼ばずに応答を返すこともできます。</li>
          <li>Rails のミドルウェアは DefaultMiddlewareStack が設定値に応じて並べ、MiddlewareStack#build が reverse と inject で入れ子のオブジェクトを作ります。</li>
          <li>config.middleware は操作を lambda として記録し、初期化の最後に既定のスタックへ適用します。削除・移動は追加の後に適用されます。</li>
          <li>Rack 3 ではヘッダー名が小文字になり、Streaming Body が使えるようになりました。Rails 8.1 は Rack 2.2 と 3 系の両方に対応しています。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Rack Specification（SPEC.rdoc）', publisher: 'rack/rack（GitHub）', url: `${RACK}/SPEC.rdoc`, accessed: '2026-11-11', version: 'Rack 3.2.8', note: 'Rack アプリケーション・env・応答の条件、rack.url_scheme の扱い、body の each・call・close の規則。' },
    { title: 'CHANGELOG.md（3.0.0・3.1.0 の SPEC Changes）', publisher: 'rack/rack（GitHub）', url: `${RACK}/CHANGELOG.md`, accessed: '2026-11-11', version: 'Rack 3.2.8', note: 'Rack 3.0（2022-09-06）と 3.1（2024-06-11）の仕様変更、rackup の分離、Rack::Headers の追加。' },
    { title: 'Rails on Rack', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/rails_on_rack.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'ミドルウェアの役割の説明、config.middleware の各メソッド、lib/middleware をオートロードから外す設定、変更時の再起動。' },
    { title: 'railties/lib/rails/application/default_middleware_stack.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/default_middleware_stack.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '既定のミドルウェアを設定値に応じて並べる build_stack。' },
    { title: 'railties/lib/rails/engine.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/engine.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Engine#app・endpoint・call と build_request。' },
    { title: 'actionpack/lib/action_dispatch/middleware/stack.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/stack.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'MiddlewareStack#build、Middleware#build、InstrumentationProxy、delete。' },
    { title: 'railties/lib/rails/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/configuration.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'MiddlewareStackProxy が操作を記録し、merge_into で適用する実装。' },
    { title: 'actionpack/lib/action_dispatch/middleware/flash.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/flash.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Flash.new が内側のアプリケーションをそのまま返す定義。' },
    { title: 'lib/puma/response.rb', publisher: 'puma/puma（GitHub）', url: `${PUMA}/lib/puma/response.rb`, accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'Puma が @app.call(env) を呼び、例外時に 500 の応答を作る処理。' },
    { title: 'lib/puma/configuration.rb', publisher: 'puma/puma（GitHub）', url: `${PUMA}/lib/puma/configuration.rb`, accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'config.ru を Rack::Builder.parse_file で読み込む load_rackup。' },
    { title: 'actionpack/lib/action_dispatch/http/response.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/http/response.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Rack 3 では Rack::Headers、Rack 2 では Rack::Utils::HeaderHash を使う切り替え。ヘッダー名の定数は同じディレクトリの constants.rb。' },
    { title: 'actionpack/lib/action_dispatch/middleware/assume_ssl.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/assume_ssl.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'AssumeSSL が env の HTTPS・rack.url_scheme などを書き換える実装。' },
    { title: 'actionpack（8.1.4.1・7.2.4 の依存関係）', publisher: 'RubyGems.org', url: 'https://rubygems.org/gems/actionpack/versions/8.1.4.1', accessed: '2026-11-11', version: 'actionpack 8.1.4.1 / 7.2.4', note: '8.1.4.1 は rack >= 2.2.4、7.2.4 は rack >= 2.2.4, < 3.3 を要求する（各 gem のメタデータで確認）。' },
    { title: 'railties/lib/rails/application/default_middleware_stack.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/railties/lib/rails/application/default_middleware_stack.rb', accessed: '2026-11-11', version: 'Rails 7.2.4', note: '7.2 の既定のスタックに SilenceRequest が無いこと（8.1.4.1 との差分で確認）。' },
    { title: 'railties/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v8.0.0/railties/CHANGELOG.md', accessed: '2026-11-11', version: 'Rails 8.0.0', note: 'Rails::Rack::SilenceRequest と config.silence_healthcheck_path の追加、ルートの描画を最初のリクエストまで遅らせる変更が 8.0 の項目にあること。' },
  ],
}

export default ch06
