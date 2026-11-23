import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation06 } from '../explanations/request'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const PUMA = 'https://github.com/puma/puma/blob/v8.0.2'
const RACK = 'https://github.com/rack/rack/blob/v3.2.8'

/* ---------- 図 6-1 HTTP の要求と応答の形 ---------- */
function HttpMessageFigure() {
  const part = (x: number, y: number, h: number, label: string) => (
    <T x={x} y={y + h / 2} fs={12} bold>
      {label}
    </T>
  )
  return (
    <Svg
      id="6-1"
      w={780}
      h={316}
      label="HTTP の要求と応答は、どちらも1行目、ヘッダー、空行、本文の順に並ぶ。要求の1行目は要求行で、GET /articles/1 HTTP/1.1 のようにメソッド、パス、バージョンを並べる。ヘッダーは Host、User-Agent、Accept。GET の要求には本文が無い。応答の1行目は状態行で、HTTP/1.1 200 OK のようにバージョン、状態コード、語句を並べる。ヘッダーは content-type、content-length、set-cookie、x-request-id など。空行の後の本文は HTML。行の区切りは CR LF"
    >
      <T x={20} y={18} bold>
        要求（ブラウザー・curl → サーバー）
      </T>
      {part(20, 34, 30, '要求行')}
      <Box x={92} y={34} w={288} h={30} lines="GET /articles/1 HTTP/1.1" mono fs={11.5} fill="box5" align="start" />
      {part(20, 72, 84, 'ヘッダー')}
      <Box x={92} y={72} w={288} h={84} lines={['Host: 127.0.0.1:3300', 'User-Agent: curl/8.23.0', 'Accept: */*']} mono fs={11} align="start" />
      {part(20, 164, 22, '空行')}
      <Box x={92} y={164} w={288} h={22} lines="（ヘッダーの終わり）" fs={10.5} fill="bg" dashed />
      {part(20, 194, 48, '本文')}
      <Box x={92} y={194} w={288} h={48} lines="GET では本文が無い" fs={11} fill="bg" dashed />

      <T x={410} y={18} bold>
        応答（サーバー → ブラウザー・curl）
      </T>
      {part(410, 34, 30, '状態行')}
      <Box x={482} y={34} w={288} h={30} lines="HTTP/1.1 200 OK" mono fs={11.5} fill="box5" align="start" />
      {part(410, 72, 84, 'ヘッダー')}
      <Box
        x={482}
        y={72}
        w={288}
        h={84}
        lines={['content-type: text/html; charset=utf-8', 'content-length: 2787', 'set-cookie: _demo_session=…', 'x-request-id: b7fbc33e-…']}
        mono
        fs={10.5}
        align="start"
      />
      {part(410, 164, 22, '空行')}
      <Box x={482} y={164} w={288} h={22} lines="（ヘッダーの終わり）" fs={10.5} fill="bg" dashed />
      {part(410, 194, 48, '本文')}
      <Box x={482} y={194} w={288} h={48} lines={['<!DOCTYPE html>', '<html> …（2787 バイト）']} mono fs={11} fill="box4" align="start" />

      <T x={20} y={270} fs={11.5} tone="muted">
        要求行・状態行：メソッド・パス・バージョン／バージョン・状態コード・語句を空白で区切る
      </T>
      <T x={20} y={294} fs={11.5} tone="muted">
        ヘッダーは「名前: 値」を1行に1つ。行の区切りは CR LF（\r\n）で、空行がヘッダーの終わりを表す
      </T>
    </Svg>
  )
}

/* ---------- 図 6-2 前後に処理を挟んだときの呼び出しの順 ---------- */
function WrapOrderFigure() {
  return (
    <Svg
      id="6-2"
      w={780}
      h={300}
      label="wrapped は Announce A で、A の @app が Announce B、B の @app が app（lambda）を指す。呼ぶ側が A の call を呼ぶと、A は前の表示をしてから B の call を呼び、B は前の表示をしてから app を呼ぶ。app が [200, 本文] を返すと、B が後の表示をして返し、最後に A が後の表示をして呼ぶ側に返す。要求は外側から内側へ、応答は内側から外側へ順に処理される"
    >
      <Box x={10} y={104} w={110} h={80} lines={['呼ぶ側', 'wrapped.call']} fs={12} fill="bg" subTone="muted" />
      <rect x={150} y={20} width={610} height={248} rx={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={164} y={40} bold fs={12.5}>
        Announce A（外側）
      </T>
      <rect x={290} y={56} width={456} height={176} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={304} y={76} bold fs={12.5}>
        Announce B
      </T>
      <Box x={440} y={96} w={290} h={120} lines={['③ app（lambda）', '本文を作り', '[200, 本文] を返す']} fs={12} fill="box5" subTone="muted" />

      <Arrow x1={120} y1={124} x2={438} y2={124} />
      <T x={164} y={112} fs={11.5}>
        ① → A：前の表示
      </T>
      <T x={304} y={112} fs={11.5}>
        ② → B：前の表示
      </T>
      <Arrow x1={438} y1={168} x2={122} y2={168} dashed />
      <T x={304} y={188} fs={11.5}>
        ④ ← B：後の表示
      </T>
      <T x={164} y={188} fs={11.5}>
        ⑤ ← A：後の表示
      </T>
      <T x={20} y={286} fs={11.5} tone="muted">
        実線：内側を呼ぶ　破線：戻り値を返す。要求は外側から、応答は内側から順に処理される
      </T>
    </Svg>
  )
}

/* ---------- 図 6-3 Puma と Rack アプリケーションの分担 ---------- */
function ServerAppFigure() {
  return (
    <Svg
      id="6-3"
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

/* ---------- 図 6-4 ミドルウェアを1つ挟んだときの呼び出し順 ---------- */
function MiddlewareSeqFigure() {
  const cols = [
    { x: 100, name: 'Puma' },
    { x: 340, name: 'Timing（ミドルウェア）' },
    { x: 580, name: 'アプリ本体（lambda）' },
  ]
  return (
    <Svg
      id="6-4"
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

/* ---------- 図 6-5 Rails のミドルウェアスタック（production） ---------- */
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
      id="6-5"
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

/* ---------- 図 6-6 reverse と inject による組み立て ---------- */
function BuildFigure() {
  return (
    <Svg
      id="6-6"
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

/* ---------- 内側を呼ばずに返す応答と、例外の行き先（番号なし） ---------- */
function StackReachFigure() {
  const rows: { name: string; mono?: boolean; omit?: boolean; focus?: boolean }[] = [
    { name: 'AssumeSSL', mono: true },
    { name: 'SSL', mono: true },
    { name: 'Rack::Sendfile', mono: true },
    { name: 'Static', mono: true },
    { name: 'Executor … RemoteIp（5個）', omit: true },
    { name: 'SilenceRequest', mono: true },
    { name: 'Logger', mono: true, focus: true },
    { name: 'ShowExceptions', mono: true, focus: true },
    { name: 'DebugExceptions', mono: true },
    { name: 'Callbacks … TempfileReaper（9個）', omit: true },
    { name: 'RouteSet（ルーティング）' },
    { name: 'コントローラー' },
  ]
  const top = 88
  const step = 32
  const rh = 26
  const cy = (i: number) => top + i * step + rh / 2
  return (
    <Svg
      id="ch06-stack-reach"
      w={780}
      h={480}
      label="production のミドルウェアの並びを縮めて、上から Puma、AssumeSSL、SSL、Rack::Sendfile、Static、省略した5個、SilenceRequest、Logger、ShowExceptions、DebugExceptions、省略した9個、RouteSet、コントローラーの順に並べた図。左側：① SSL が HTTPS へのリダイレクトを返した要求と、② Static が public/ のファイルを返した要求は、そこから Puma へ応答が戻る。Logger から内側は実行されないので、ログに Started の行が出ない。右側：③ ShowExceptions より内側で起きた例外は、ShowExceptions がエラーの応答に変える。④ ShowExceptions より外側で起きた例外は Puma まで伝わり、Puma が 500 の応答を作る。production では本文が空になる"
    >
      <T x={270} y={18} fs={11.5} tone="muted">
        上ほど外側で、要求を先に受け取る
      </T>
      <Box x={270} y={36} w={240} h={32} lines="Puma（Web サーバー）" fs={12} />
      <Arrow x1={390} y1={68} x2={390} y2={86} />
      {rows.map((r, i) => (
        <Box
          key={r.name}
          x={270}
          y={top + i * step}
          w={240}
          h={rh}
          lines={r.name}
          mono={r.mono}
          fs={11.5}
          rx={4}
          dashed={r.omit}
          fill={r.omit ? 'bg' : r.focus ? 'box5' : 'box'}
        />
      ))}

      {/* 左：内側を呼ばずに応答を返す */}
      <Arrow x1={270} y1={cy(1)} x2={232} y2={cy(1)} plain />
      <Arrow d={`M270,${cy(3)} H232 V52 H268`} />
      <T x={222} y={cy(1) - 8} fs={11.5} anchor="end">
        ① SSL が HTTPS への
      </T>
      <T x={222} y={cy(1) + 8} fs={11.5} anchor="end">
        リダイレクトを返す
      </T>
      <T x={222} y={cy(3) - 8} fs={11.5} anchor="end">
        ② Static が public/ の
      </T>
      <T x={222} y={cy(3) + 8} fs={11.5} anchor="end">
        ファイルを返す
      </T>
      <path d={`M264,${top + 6 * step + 2} H256 V${top + 11 * step + rh - 2} H264`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
      <T x={246} y={cy(8) - 16} fs={11.5} anchor="end">
        ①② の要求では
      </T>
      <T x={246} y={cy(8)} fs={11.5} anchor="end">
        Logger から内側が
      </T>
      <T x={246} y={cy(8) + 16} fs={11.5} anchor="end">
        実行されない
      </T>
      <T x={246} y={cy(8) + 32} fs={11.5} anchor="end" tone="muted">
        （Started の行が出ない）
      </T>

      {/* 右：例外の行き先 */}
      <path d={`M516,${top + 2} H524 V${top + 6 * step + rh - 2} H516`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
      <Arrow d={`M526,${cy(3)} H560 V52 H512`} accent />
      <T x={572} y={cy(3) - 16} fs={11.5}>
        ④ ここで例外が起きると
      </T>
      <T x={572} y={cy(3)} fs={11.5} tone="danger">
        Puma が 500 の応答を作る
      </T>
      <T x={572} y={cy(3) + 16} fs={11.5} tone="muted">
        （production では本文が空）
      </T>
      <path d={`M516,${top + 8 * step + 2} H524 V${top + 11 * step + rh - 2} H516`} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
      <Arrow d={`M526,${cy(9) + 16} H560 V${cy(7)} H512`} accent />
      <T x={572} y={cy(9) - 8} fs={11.5}>
        ③ ここで例外が起きると
      </T>
      <T x={572} y={cy(9) + 8} fs={11.5}>
        ShowExceptions がエラーの
      </T>
      <T x={572} y={cy(9) + 24} fs={11.5}>
        応答に変える
      </T>
      <T x={572} y={cy(9) + 40} fs={11.5} tone="muted">
        （public/500.html など）
      </T>
    </Svg>
  )
}

/* ---------- config.middleware の操作を書いた順と適用する順（番号なし） ---------- */
function MergeOrderFigure() {
  const L = 20
  const R = 330
  const w = 230
  const h = 34
  const rw = 244
  const X = R + rw + 14
  return (
    <Svg
      id="ch06-merge-order"
      w={780}
      h={276}
      label="検証用の初期化ファイルに書いた順は、1 insert_before Logger, Timing、2 delete Rack::Runtime、3 use Rack::Runtime。1 と 3 は @operations に、2 は @delete_operations にためられる。merge_into は @operations を先に、@delete_operations を後に適用するので、適用した順は insert_before、use、delete になる。insert_before で Timing が Logger の直前に入り、use で Rack::Runtime が末尾に入って既定の分と合わせて2つになり、delete で Rack::Runtime が2つとも取り除かれる。bin/rails middleware の結果では、Timing は Logger の直前にあり、Rack::Runtime は無い"
    >
      <T x={L} y={16} bold fs={12.5}>
        書いた順（記録するだけ）
      </T>
      <T x={R} y={16} bold fs={12.5}>
        merge_into で適用した順
      </T>
      <T x={X} y={16} bold fs={12.5}>
        適用したときの変化
      </T>

      <Box x={L} y={52} w={w} h={h} lines="1 insert_before Logger, Timing" mono fs={11.5} fill="bg" align="start" />
      <Box x={L} y={100} w={w} h={h} lines="2 delete Rack::Runtime" mono fs={11.5} fill="bg" align="start" />
      <Box x={L} y={148} w={w} h={h} lines="3 use Rack::Runtime" mono fs={11.5} fill="bg" align="start" />

      <T x={R} y={40} fs={11.5} tone="muted">
        @operations（追加系）
      </T>
      <Box x={R} y={52} w={rw} h={h} lines="① insert_before Logger, Timing" mono fs={11.5} align="start" />
      <Box x={R} y={100} w={rw} h={h} lines="② use Rack::Runtime" mono fs={11.5} align="start" />
      <T x={R} y={154} fs={11.5} tone="muted">
        @delete_operations（削除・移動系）
      </T>
      <Box x={R} y={166} w={rw} h={h} lines="③ delete Rack::Runtime" mono fs={11.5} align="start" accent />

      <Arrow x1={L + w} y1={69} x2={R - 2} y2={69} />
      <Arrow x1={L + w} y1={165} x2={R - 2} y2={117} />
      <Arrow x1={L + w} y1={117} x2={R - 2} y2={183} accent />

      <T x={X} y={69} fs={11.5}>
        Timing が Logger の直前に入る
      </T>
      <T x={X} y={109} fs={11.5}>
        Rack::Runtime が末尾に入る
      </T>
      <T x={X} y={125} fs={11.5} tone="muted">
        （既定の分と合わせて2つ）
      </T>
      <T x={X} y={175} fs={11.5}>
        Rack::Runtime を2つとも
      </T>
      <T x={X} y={191} fs={11.5}>
        取り除く
      </T>

      <Box
        x={L}
        y={226}
        w={740}
        h={34}
        lines="bin/rails middleware の結果：Timing は Logger の直前にあり、Rack::Runtime は無い"
        fs={12}
        fill="box5"
      />
    </Svg>
  )
}

const ch06: Chapter = {
  number: 6,
  part: 2,
  title: 'Rack とミドルウェア',
  summary:
    'Puma はブラウザーから来た要求を Ruby の値にして Rails に渡します。小さな Ruby アプリで、要求を渡す順番と、できた応答にヘッダーを加えて返す順番を確かめます。',
  goals: [
    'Rack の call が受け取る値と、返す状態コード・ヘッダー・本文を対応付けられる',
    'ミドルウェアが次の処理を呼ぶ場合と、自分で応答を返す場合を追える',
    'bin/rails middleware の並びから、追加した処理が要求と応答のどこで働くか判断できる',
  ],
  prerequisites: [1, 4],
  sections: [
    {
      id: 'http-message',
      title: 'HTTP の要求と応答',
      body: (
        <>
          <p>
            ブラウザーで記事のページの URL を開くと、ブラウザーはその URL のサーバーに接続し、「このパスのページを返してください」という内容を、決まった書き方の文字の並びで送ります。サーバーはページの HTML
            などを同じように決まった書き方で送り返します。この書き方の取り決めを <Term en="Hypertext Transfer Protocol">HTTP</Term> と呼び、ブラウザーが送るものを要求（リクエスト）、サーバーが返すものを応答（レスポンス）と呼びます
            <Ref n={17} />。
          </p>
          <p>
            curl はコマンドラインから HTTP の要求を送るプログラムです。<code>-v</code> を付けると、送った要求を <code>{'>'}</code> で始まる行に、受け取った応答のヘッダーを <code>{'<'}</code>{' '}
            で始まる行に表示します
            <Ref n={19} />。デモのアプリケーションを開発環境の Puma で動かし（手元の 3300 番のポートで受け付けるようにしています）、記事1件のページを要求しました。
          </p>
          <Code
            lang="text"
            title="curl -v の出力（Rails 8.1.4.1・Puma 8.0.2。接続の情報と長い値の一部を省略）"
            code={`
$ curl -v http://127.0.0.1:3300/articles/1
> GET /articles/1 HTTP/1.1
> Host: 127.0.0.1:3300
> User-Agent: curl/8.23.0
> Accept: */*
>
< HTTP/1.1 200 OK
< x-frame-options: SAMEORIGIN
< x-xss-protection: 0
< x-content-type-options: nosniff
< x-permitted-cross-domain-policies: none
< referrer-policy: strict-origin-when-cross-origin
< link: </assets/application-8b441ae0.css>; rel=preload; as=style; nopush
< content-type: text/html; charset=utf-8
< vary: Accept, X-Requested-With
< etag: W/"52704b7419f5cd12be2592943966f5e9"
< cache-control: max-age=0, private, must-revalidate
< set-cookie: _demo_session=DBZIxnM%2Boy77…（省略）; path=/; httponly; samesite=lax
< x-request-id: b7fbc33e-a5c1-4de7-ab20-0a3f1ef474c0
< x-runtime: 0.089790
< server-timing: start_processing.action_controller;dur=0.03, …（省略）
< content-length: 2787
<
<!-- BEGIN app/views/layouts/application.html.erb
--><!DOCTYPE html>
<html>
  <head>
    <title>Demo</title>
（以下省略）
`}
          />
          <p>
            <code>{'>'}</code> の行が curl の送った要求です。1行目を要求行と呼び、メソッド（<code>GET</code>）、パス（<code>/articles/1</code>）、HTTP のバージョン（<code>HTTP/1.1</code>
            ）を空白で区切って並べます
            <Ref n={16} />。メソッドは要求の種類で、GET はページなどを取得するとき、POST はフォームに入力した内容などを送るときに使います。2行目からはヘッダーで、「名前: 値」の形で1行に1つずつ情報を書きます。Host
            は接続先のホスト名とポート番号、User-Agent は要求を送ったプログラム、Accept は受け取りたい本文の種類（<code>*/*</code> はどれでもよいという意味）です。ヘッダーの後の空行で要求が終わります。GET
            の要求には本文がありません。
          </p>
          <p>
            <code>{'<'}</code> の行が応答です。1行目を状態行と呼び、バージョン、状態コード（<code>200</code>）、状態コードの意味を表す語句（<code>OK</code>
            ）を並べます。続くヘッダーで、本文についての情報などを伝えます。content-type は本文の種類で、ここでは文字コードが UTF-8 の HTML です。content-length は本文のバイト数です。set-cookie
            はブラウザーに値を保存させるヘッダーで、ブラウザーは次の要求から cookie ヘッダーでその値を送り返します。Rails はこの値で同じブラウザーからの要求を見分けます（
            <ChapterLink n={10} section="cookies-session" />
            ）。etag は本文の内容から作った識別子で、内容が前と変わったかを調べるのに使います（<ChapterLink n={22} section="http-cache" />
            ）。空行の後が本文で、記事のページの HTML です。本文の先頭のコメントは、開発環境の Rails がどのテンプレート（HTML のひな形のファイル）から作った部分かを書き込んだものです。
          </p>
          <p>
            ヘッダーの名前は大文字と小文字を区別しません
            <Ref n={17} />。curl は <code>Host</code> のように先頭を大文字で書き、Rails は <code>content-type</code> のようにすべて小文字で書いています。小文字で書く理由は「Rack 3 での変更点」の節で扱います。
          </p>
          <p>本文のある要求も送りました。curl の <code>-d</code> に渡した値は、要求の本文として送られます。</p>
          <Code
            lang="text"
            title="本文のある要求（応答のヘッダーの一部を省略）"
            code={`
$ curl -v -X POST http://127.0.0.1:3300/probe/echo/hello -d 'body=Hi'
> POST /probe/echo/hello HTTP/1.1
> Host: 127.0.0.1:3300
> User-Agent: curl/8.23.0
> Accept: */*
> Content-Length: 7
> Content-Type: application/x-www-form-urlencoded
>
< HTTP/1.1 200 OK
< content-type: application/json; charset=utf-8
< content-length: 66
<
{"body":"Hi","controller":"probe","action":"echo","title":"hello"}
`}
          />
          <p>
            要求のヘッダーに、本文の長さ（Content-Length の7バイト）と形式（Content-Type。フォームの入力と同じ「名前=値」の形）が加わりました。<code>/probe/echo</code>{' '}
            は受け取った値をそのまま JSON で返すように作った検証用のアクションで、応答の本文から、サーバーが本文の <code>body=Hi</code> を受け取ったことが分かります。
          </p>
          <p>
            状態コードは3桁の数字で、最初の桁が種類を表します
            <Ref n={17} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>状態コード</th>
                  <th>種類</th>
                  <th>例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1xx</td>
                  <td>処理の途中経過の通知</td>
                  <td>本書ではほとんど扱わない</td>
                </tr>
                <tr>
                  <td>2xx</td>
                  <td>成功</td>
                  <td>200 OK：要求どおりに処理した</td>
                </tr>
                <tr>
                  <td>3xx</td>
                  <td>リダイレクトなど（別の URL を開き直させる）</td>
                  <td>302 Found：location ヘッダーの URL へ移動させる。304 Not Modified：前に受け取った内容から変わっていない</td>
                </tr>
                <tr>
                  <td>4xx</td>
                  <td>要求の側の誤り</td>
                  <td>404 Not Found：そのパスに対応するものが無い</td>
                </tr>
                <tr>
                  <td>5xx</td>
                  <td>サーバーの側の誤り</td>
                  <td>500 Internal Server Error：処理の途中で例外が起きた</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            デモで、ルートが無いパスと、例外を起こすように作った検証用のアクションを要求すると、それぞれ 404 と 500 が返りました（<code>{"-w '%{http_code}'"}</code> は状態コードだけを表示させるオプションです）。
          </p>
          <Code
            lang="text"
            code={`
$ curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:3300/nothing
404
$ curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:3300/probe/boom
500
`}
          />
          <p>
            要求も応答も1行目、ヘッダー、空行、本文の順に並んだ文字の並びです（図 6-1）。ネットワークからこの文字の並びを読み取り、応答の文字の並びを書き出すのは、Rails ではなく Web サーバーの Puma
            です。次の節ではその仕事を小さな Ruby のプログラムで確かめます。
          </p>
          <Figure n="6-1" title="HTTP の要求と応答の形" caption="上の curl -v の出力から主な行を抜き出した図。">
            <HttpMessageFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'web-server',
      title: 'Web サーバーが受け持つこと',
      body: (
        <>
          <p>
            <code>bin/rails server</code> は Puma という Web サーバーを起動します（Puma の構成は
            <ChapterLink n={23} section="app-server" />
            で扱います）。Puma はポート（同じコンピューターで動く複数のプログラムを区別する通信用の番号。Rails の既定は
            3000）で接続を待ち、届いた要求を Rails に渡し、Rails が作った応答を送り返します。ここでは、Web サーバーの仕事のうち、要求を読み取って応答を書き出す部分を、Ruby の標準ライブラリだけで書いて動かします。
          </p>
          <Code
            lang="ruby"
            title="tiny_server.rb"
            code={`
require "socket"
$stdout.sync = true                   # puts の表示をすぐ画面に出す

server = TCPServer.new(8000)          # 8000 番ポートで接続を待つ
puts "8000 番ポートで待っています"

loop do
  client = server.accept              # 接続が来るまでここで止まる
  request_line = client.gets          # 1行目（要求行）を読む
  puts "受け取った要求行: #{request_line.inspect}"
  while (line = client.gets) != "\\r\\n" # 空行までがヘッダー
    puts "受け取ったヘッダー: #{line.inspect}"
  end

  method, path, _version = request_line.split(" ")
  body = "#{method} #{path} を受け取りました\\n"
  client.write "HTTP/1.1 200 OK\\r\\n"
  client.write "content-type: text/plain; charset=utf-8\\r\\n"
  client.write "content-length: #{body.bytesize}\\r\\n"
  client.write "\\r\\n"
  client.write body
  client.close
end
`}
          />
          <p>
            1つの端末で <code>ruby tiny_server.rb</code> を実行したまま、別の端末から curl で要求を送りました。<code>-i</code> は応答のヘッダーも表示させるオプションです。
          </p>
          <Code
            lang="text"
            title="curl の出力と、tiny_server.rb の表示（Ruby 4.0.9）"
            code={`
$ curl -i "http://127.0.0.1:8000/articles/1?page=2"
HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8
content-length: 48

GET /articles/1?page=2 を受け取りました

（tiny_server.rb を実行した端末）
8000 番ポートで待っています
受け取った要求行: "GET /articles/1?page=2 HTTP/1.1\\r\\n"
受け取ったヘッダー: "Host: 127.0.0.1:8000\\r\\n"
受け取ったヘッダー: "User-Agent: curl/8.23.0\\r\\n"
受け取ったヘッダー: "Accept: */*\\r\\n"
`}
          />
          <p>
            <code>TCPServer.new(8000)</code> は、8000 番ポートで接続を受け付ける準備をします。<code>accept</code>{' '}
            は接続が来るまで待ち、来たら、その接続を読み書きするためのオブジェクトを返します。このオブジェクトはソケット（ネットワークの接続を読み書きするために OS が用意するもの）を表します
            <Ref n={18} />。<code>gets</code> で1行ずつ読むと、前の節の curl -v の表示と同じ要求行とヘッダーが届いていました。行の終わりの <code>\r\n</code>（CR と LF の2文字）は、HTTP
            で決められた行の区切りで、<code>\r\n</code> だけの空行がヘッダーの終わりです
            <Ref n={16} />。応答も同じ形で、状態行、ヘッダー、空行、本文の順に <code>write</code> で書き出し、<code>close</code> で接続を閉じました。
          </p>
          <p>
            このプログラムのうち、応答の内容を決めているのは <code>body</code> を作る1行だけです。ほかの行はどのページを返すときも変わりません。実際の Web サーバーはほかにも次のことを受け持ちます。
          </p>
          <ul>
            <li>
              複数の要求を同時に処理する。Puma はスレッド（1つのプログラムの中で並行して進む処理の流れ）を使います（<ChapterLink n={23} section="thread" />
              ）。
            </li>
            <li>POST などの本文のある要求で、content-length の長さだけ本文を読む。</li>
            <li>1つの接続で続けて届く要求を、接続を閉じずに処理する（keep-alive）。</li>
            <li>形式の誤った要求に、400 などの状態コードで応答する。</li>
          </ul>
          <p>
            Rails はこれらを自分では行いません。Puma から受け取った要求の内容をもとに、状態コード・ヘッダー・本文を作ることだけを受け持ちます。小さなサーバーで言えば、<code>body</code>{' '}
            を作る1行を、別のオブジェクトに任せる形です。Web サーバーとアプリケーションをこのように分けておくと、同じ Rails のアプリケーションを Puma 以外の Web サーバーでも動かせます。分けたことで、要求と応答の間に別の処理を挟むこともできるようになります。次の節でその書き方を見ます。
          </p>
        </>
      ),
    },
    {
      id: 'wrap',
      title: '要求と応答の間に処理を挟む',
      body: (
        <>
          <p>
            「HTTP の要求と応答」の節の応答には、<code>x-request-id</code> と <code>x-runtime</code> というヘッダーがありました。x-request-id は要求ごとに振った識別子、x-runtime
            は処理にかかった秒数です。この2つは、記事のページを作る ArticlesController ではなく、Rails がコントローラーの前後で実行する処理が付けたものです。ルートが無いため、コントローラーを通らずに 404
            になった <code>/nothing</code> の応答にも付いています。
          </p>
          <Code
            lang="text"
            title="curl -si の出力（ヘッダーの一部を抜き出し、本文を省略）"
            code={`
$ curl -si http://127.0.0.1:3300/nothing
HTTP/1.1 404 Not Found
content-type: text/html; charset=UTF-8
x-request-id: 57c6f87a-7e4b-4640-b078-30d0db13584c
x-runtime: 0.094512
content-length: 58166
`}
          />
          <p>
            このように、アプリケーションの本体を呼ぶ前と後に、決まった処理を入れたいことがあります。要求の記録、処理時間の計測、ログインしていない要求を断る処理などです。Ruby では、本体と同じ呼び出し方ができるオブジェクトを作り、本体の代わりにそのオブジェクトを呼ばせると、呼ぶ側を変えずに処理を足せます。Rack
            を使わない Ruby だけの例で確かめます。
          </p>
          <Code
            lang="ruby"
            title="wrap.rb"
            code={`
# 応答を作る処理。要求（ハッシュ）を受け取り、[状態コード, 本文] を返す
app = ->(request) {
  puts "    アプリ: #{request[:path]} の本文を作る"
  [200, "#{request[:path]} のページ"]
}

# 内側の処理を呼ぶ前と後に、名前を表示する
class Announce
  def initialize(name, app)
    @name = name
    @app = app   # 内側の処理
  end

  def call(request)
    puts "→ #{@name}: 要求を受け取った"
    status, body = @app.call(request)   # 内側を呼ぶ
    puts "← #{@name}: 状態コード #{status} を返す"
    [status, body]
  end
end

wrapped = Announce.new("A", Announce.new("B", app))
p wrapped.call({ method: "GET", path: "/articles/1" })
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
→ A: 要求を受け取った
→ B: 要求を受け取った
    アプリ: /articles/1 の本文を作る
← B: 状態コード 200 を返す
← A: 状態コード 200 を返す
[200, "/articles/1 のページ"]
`}
          />
          <p>
            <code>app</code> は lambda（<code>{'->(引数) { 処理 }'}</code> で作り、<code>call</code> で呼び出せる処理のまとまり。<ChapterLink n={4} section="proc-lambda" />
            ）で、要求を表すハッシュを受け取り、<code>[状態コード, 本文]</code> の配列を返します。Announce も <code>call(request)</code> で呼べて、同じ形の配列を返します。そのため、呼ぶ側の{' '}
            <code>wrapped.call(...)</code> は、相手が app なのか Announce なのかを区別せずに呼べます。Announce は <code>new</code> のときに内側の処理を受け取って <code>@app</code>{' '}
            に入れ、<code>call</code> の中で <code>@app.call(request)</code> の前と後に表示をします。<code>status, body = ...</code>{' '}
            は返ってきた配列の要素を前から順に2つの変数に入れる書き方（多重代入）です。
          </p>
          <p>
            表示の順を見ると、A の「→」、B の「→」、アプリ、B の「←」、A の「←」の順でした。外側の A が内側の B を呼び、B が app を呼ぶので、要求は外側から順に、応答は内側から順に処理されます（図
            6-2）。Rails の x-request-id や x-runtime も、この形でコントローラーより外側に置かれた処理が付けています。アプリケーションの本体を内側に持ち、その前後で処理を行うオブジェクトを
            <Term en="middleware">ミドルウェア</Term>と呼びます。
          </p>
          <Figure n="6-2" title="前後に処理を挟んだときの呼び出しの順" caption="wrap.rb の実行結果をもとにした模式図。">
            <WrapOrderFigure />
          </Figure>
          <p>
            この例の request のハッシュと <code>[状態コード, 本文]</code> の配列は、この節のために決めた形です。Puma と Rails、それにいろいろな gem（インストールして使う Ruby のライブラリ）のミドルウェアを組み合わせるには、受け渡す値の形を全員で同じにしておく必要があります。その形を決めたものが
            Rack です。
          </p>
        </>
      ),
    },
    {
      id: 'rack-contract',
      title: 'Rack の取り決め',
      body: (
        <>
          <p>
            <Term>Rack</Term> はこの受け渡しの仕様と、それに沿った部品をまとめた gem の両方を指します。Ruby の Web サーバーからアプリケーションを呼ぶ取り決めは次のとおりです
            <Ref n={1} />。
          </p>
          <ul>
            <li>
              Rack アプリケーションは <code>call</code> メソッドを持つオブジェクトです。<code>call</code> は引数を1つだけ受け取ります。この引数は <Term en="environment">env</Term>{' '}
              と呼ばれ、HTTP リクエストの内容を表すハッシュです。
            </li>
            <li>
              <code>call</code> は、ステータス・ヘッダー・本文（body）の3要素からなる配列を返します。この配列は凍結（freeze）されていてはいけません。凍結は freeze メソッドでオブジェクトを変更できない状態にすることです。
            </li>
          </ul>
          <p>
            <code>call</code> を持っていればよいので、lambda もそのまま Rack アプリケーションになります。次の <code>config.ru</code>（Web サーバーが起動時に読み込む、Rack アプリケーションを指定する Ruby のファイル）は、リクエストのメソッドとパスを返すだけのアプリケーションです。
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
          <p>
            <code>run</code> は引数のオブジェクトを、Web サーバーが呼ぶ Rack アプリケーションとして登録するメソッドです。この lambda は env から <code>REQUEST_METHOD</code>・<code>PATH_INFO</code>・
            <code>QUERY_STRING</code> の3つの値を読み、状態コードの 200、content-type だけのヘッダー、文字列1つの配列の本文を返します。Web サーバーで動かした結果は「ミドルウェアの形」の節に載せます。
          </p>
          <p>
            Rack アプリケーションは <code>call</code> を持つ Ruby のオブジェクトなので、Web サーバーを起動しなくても呼べます。同じ lambda に、手で作ったハッシュを env として渡しました。
          </p>
          <Code
            lang="ruby"
            title="call_app.rb"
            code={`
app = ->(env) {
  [200, { "content-type" => "text/plain" }, ["#{env["REQUEST_METHOD"]} #{env["PATH_INFO"]}?#{env["QUERY_STRING"]}\\n"]]
}

env = { "REQUEST_METHOD" => "GET", "PATH_INFO" => "/hello", "QUERY_STRING" => "x=1" }
status, headers, body = app.call(env)

p status
p headers
body.each { |part| print part }
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
200
{"content-type" => "text/plain"}
GET /hello?x=1
`}
          />
          <p>
            1行目が状態コード、2行目がヘッダーのハッシュです。3行目は、body の <code>each</code> で本文の文字列を1つずつ取り出して表示したものです。Puma がしていることも同じで、HTTP の要求から env
            のハッシュを作って <code>call</code> に渡し、戻り値の3要素を HTTP の応答の文字の並びにして送ります。Rails の統合テスト（ActionDispatch::IntegrationTest）が Web
            サーバーを起動せずにアプリケーション全体を実行できるのも、env を作って <code>call</code> を呼べば応答の配列を受け取れるためです。
          </p>
          <p>env には CGI（Web サーバーが別のプログラムを起動して要求の内容を渡すための、古くからある取り決め）の仕様に由来する大文字のキーと、Rack が定めた rack. で始まるキーが入ります。主なものを表にまとめます。</p>
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
                  <td>リクエスト本文を読む IO（ファイルなどを読み書きする Ruby のクラス）のようなオブジェクト（任意）</td>
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
            コントローラーで使う <code>request</code> のメソッドは、この env から値を読みます。<code>request.request_method</code> は <code>REQUEST_METHOD</code>、<code>request.path_info</code> は{' '}
            <code>PATH_INFO</code>、<code>request.query_string</code> は <code>QUERY_STRING</code> の値を返します。リクエストヘッダーは、User-Agent なら <code>HTTP_USER_AGENT</code>、X-Forwarded-For なら{' '}
            <code>HTTP_X_FORWARDED_FOR</code> というキーで env に入ります。<code>request.headers["User-Agent"]</code> と書くと、Rails は名前をこのキーの形に直して env から値を取り出します。
          </p>
          <p>
            env そのものは <code>request.env</code> で取り出せます。ロードバランサーや Nginx が付けたはずのヘッダーが Rails まで届いているかを調べるときは、開発環境のコントローラーで{' '}
            <code>{'request.env.select { |key, _| key.start_with?("HTTP_") }'}</code> の結果を表示すると、届いたリクエストヘッダーを一覧できます。Cookie の値も含まれるので、本番環境のログには出力しません。
          </p>
          <p>
            <code>SCRIPT_NAME</code> が空文字列でなくなるのは、routes.rb の <code>mount</code> で、別の Rack アプリケーションをあるパスの下に置いたときなどです。<code>/status</code> に置いたアプリケーションに{' '}
            <code>/status/db/ping</code> の要求が届くと、そのアプリケーションが受け取る env では <code>SCRIPT_NAME</code> が <code>"/status"</code>、<code>PATH_INFO</code> が <code>"/db/ping"</code> になります（
            <ChapterLink n={9} section="mount" />
            ）。
          </p>
          <p>
            <code>rack.url_scheme</code> について、仕様は「最後の区間の接続に合わせる」としています。ロードバランサー（受けた要求を複数のサーバーに振り分ける仕組み）までが HTTPS（通信を暗号化した HTTP）で、その先の Puma までが HTTP の場合、ここには <code>"http"</code>{' '}
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
              にストリーム（書き込んだ順にクライアントへ送られる出力先）を渡して書き込ませる形を Streaming Body と呼びます。body が <code>close</code> に応答する場合、サーバーは送信後に必ず <code>close</code> を呼びます。
            </li>
          </ul>
          <p>
            「<code>each</code> に応答する」は、そのオブジェクトが <code>each</code> メソッドを持つという意味で、<code>respond_to?</code> で確かめられます。配列は <code>each</code> を持つので、
            <code>["Hello"]</code> は body の条件を満たします。文字列は <code>each</code> を持たないので、本文を <code>"Hello"</code> のまま返すと条件を満たしません。
          </p>
          <Code
            lang="ruby"
            title="respond_to? で確かめる（Ruby 4.0.9）"
            code={`
["Hello"].respond_to?(:each)  # => true
"Hello".respond_to?(:each)    # => false
`}
          />
          <p>
            ヘッダーのハッシュが凍結されていると、外側のミドルウェアがヘッダーを書き足す行で FrozenError（凍結されたオブジェクトを変更しようとしたときの例外）になります。定数に入れて <code>freeze</code>{' '}
            したハッシュをそのまま返す書き方は、この条件に反します。自作のミドルウェアで 401 や 503 の応答の配列を自分で書くときは、本文を配列で包むこと、ヘッダー名を小文字で書くこと、ヘッダーのハッシュを凍結しないことの3つを確かめます。
          </p>
          <p>
            Rack には、アプリケーションやミドルウェアが仕様を守っているかを実行時に検査する <code>Rack::Lint</code> があります。自作のミドルウェアをテストするときに使えます。使い方の例は「Rack 3 での変更点」の節にあります。
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
          <Figure n="6-3" title="Puma と Rack アプリケーションの分担" caption="模式図。HTTP の解析と書き出しは Puma が行い、Rails は Ruby のオブジェクトだけを扱う。">
            <ServerAppFigure />
          </Figure>
          <p>
            Puma のソースでは、アプリケーションを呼ぶ部分は次のようになっています。Puma が <code>call(env)</code> を呼び、戻り値を3つの変数で受け取っていることを確かめるために読みます。見るのは先頭の <code>begin</code>{' '}
            の次の3行です。
          </p>
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
          <ul>
            <li>
              <code>status, headers, app_body = ... do @app.call(env) end</code>：<code>call</code> が返した配列を、多重代入で3つの変数に分けています。<code>@thread_pool.with_force_shutdown do ... end</code>{' '}
              は、Puma を強制的に止めるときに、ブロックの中の処理を例外で中断できるようにする Puma のメソッドです。ブロックの値をそのまま返すので、アプリケーションの呼び出し方は変わりません。
            </li>
            <li>
              <code>res_body = app_body</code>：body を別の変数にも入れています。Puma は応答を送り終えた後で <code>app_body.close if app_body.respond_to? :close</code> を実行します（同じファイルの 111
              行目）。「Rack の取り決め」の節の「サーバーは送信後に必ず close を呼ぶ」に当たる行です。
            </li>
            <li>
              <code>return :async if client.hijacked</code> と <code>if status == -1</code>：アプリケーションが応答を配列で返さず、後から自分で送る場合の分岐です。コントローラーのアクションが返す通常の応答では、どちらにも入りません。
            </li>
          </ul>
          <p>
            Puma が作る 500 の応答は、Rails のエラーページとは別のものです。Puma の <code>lowlevel_error_handler</code> を設定していなければ、production 環境では本文が空になり、development と test
            の環境では「Puma caught this error:」で始まる本文になります（<code>lib/puma/server.rb</code> の 598〜615 行目）。Rails は内側で起きた例外をミドルウェアでエラーの応答に変えるので（後の「Rails
            のミドルウェアスタック」の節）、Puma の 500 が返るのは、主にそのミドルウェアより外側で例外が起きたときです。本文が空の 500 が返ったときは、Rails のログだけでなく Puma の出力も確かめます。
          </p>
          <p>
            <code>@app</code> に入るオブジェクトは、起動時に <code>config.ru</code> を <code>Rack::Builder.parse_file</code> で評価して作られます
            <Ref n={10} />。<code>Rack::Builder</code> は config.ru に書いた <code>use</code> と <code>run</code> を読み取り、1つの Rack アプリケーションにまとめる Rack のクラスです。Rails が生成する{' '}
            <code>config.ru</code> は次の内容です。
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
            を Rack アプリケーションとして登録します。つまり Puma の <code>@app.call(env)</code> は、<code>Rails.application.call(env)</code> を呼んでいます。最後の行の{' '}
            <code>load_server</code> は、サーバーとして起動するときだけ必要な処理を実行する呼び出しで、要求の受け渡しには関係しません（<ChapterLink n={7} section="finisher" />
            ）。
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
          <p>
            config.ru のあるディレクトリで puma コマンドを実行すると、Puma はこのファイルを読み込み、既定の 9292 番ポートで要求を待ちます
            <Ref n={10} />。Puma 8.0.2 で起動してリクエストを送ると、次の応答が返りました。
          </p>
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
          <Figure n="6-4" title="ミドルウェアを1つ挟んだときの呼び出し順" caption="図 6-3 の Rails.application の位置に、Timing とアプリ本体が入った状態。">
            <MiddlewareSeqFigure />
          </Figure>
          <p>
            図 6-4 のように、<code>@app.call(env)</code> より前に書いた処理はリクエストが内側へ進むときに、後に書いた処理は応答が外側へ戻るときに実行されます。ミドルウェアが何段も重なると、リクエストは外側から順に、応答は内側から順に処理されます。
          </p>
          <p>
            内側を呼ばずに自分で配列を返すこともできます。認証に失敗したら 401 を返す、メンテナンス中なら 503 を返す、といった処理はこの形で書きます。その場合、内側のミドルウェアとアプリケーションは実行されません。
          </p>
          <p>
            次の Maintenance は、<code>tmp/maintenance.txt</code> というファイルがある間、すべての要求に 503 を返すミドルウェアです。「Rack の取り決め」の節と同じように、Web サーバーを使わず、手で作った env を渡して呼びました。
          </p>
          <Code
            lang="ruby"
            title="maintenance.rb"
            code={`
require "fileutils"

class Maintenance
  FLAG = "tmp/maintenance.txt"

  def initialize(app)
    @app = app
  end

  def call(env)
    if File.exist?(FLAG)
      # 内側を呼ばずに、ここで応答を返す
      return [503, { "content-type" => "text/plain; charset=utf-8" }, ["メンテナンス中です\\n"]]
    end
    @app.call(env)
  end
end

app = ->(env) {
  puts "アプリ本体が呼ばれた"
  [200, { "content-type" => "text/plain" }, ["ok\\n"]]
}
wrapped = Maintenance.new(app)
env = { "REQUEST_METHOD" => "GET", "PATH_INFO" => "/articles/1" }

p wrapped.call(env)                 # 1回目：ファイルが無い

FileUtils.mkdir_p("tmp")
File.write(Maintenance::FLAG, "")   # 目印のファイルを作る
p wrapped.call(env)                 # 2回目：ファイルがある
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
アプリ本体が呼ばれた
[200, {"content-type" => "text/plain"}, ["ok\\n"]]
[503, {"content-type" => "text/plain; charset=utf-8"}, ["メンテナンス中です\\n"]]
`}
          />
          <p>
            1回目はファイルが無いので <code>@app.call(env)</code> まで進み、「アプリ本体が呼ばれた」の表示と 200 の配列が出ています。2回目は <code>return</code> で 503 の配列を返したので、「アプリ本体が呼ばれた」は表示されていません。Rails
            に当てはめると、内側を呼ばずに返すミドルウェアより内側にあるログの出力、ルーティング、コントローラーは、その要求では実行されません。「コントローラーに書いた処理が実行されず、ログにも出ない」という場合は、外側のミドルウェアが応答を返していないかを確かめます。
          </p>
          <Callout kind="warn">
            <p>
              Rack 3 の仕様では、ミドルウェアが body の <code>each</code> を直接呼ぶことを禁じています。本文を加工したい場合は、元の body の <code>each</code>{' '}
              を呼ぶ新しい body を返します。また、元の body を新しい body に置き換える場合も、元の body の <code>close</code> が呼ばれるようにする必要があります
              <Ref n={1} />。Rack には、<code>close</code> のときに処理を追加するための <code>Rack::BodyProxy</code> があり、Rails の応答の body もこのクラスで包まれています。
            </p>
          </Callout>
          <p>
            この注意が関係するのは、応答の本文を読んだり置き換えたりするミドルウェアを書くときと、レビューするときです。ヘッダーを足すだけの Timing や、内側を呼ばずに返す Maintenance には関係しません。決まりの理由は次の2つです。
          </p>
          <ul>
            <li>
              body が <code>each</code> を持つとは限りません。Streaming Body は <code>call</code> しか持たないので、ミドルウェアが <code>body.each</code> を呼ぶと NoMethodError になります。<code>each</code>{' '}
              を持つ body でも、仕様は <code>each</code> を呼ぶ回数を1回だけと決めています。ミドルウェアが先に呼ぶと、Web サーバーが本文を送るための呼び出しが2回目になります。
            </li>
            <li>
              <code>close</code> のときに後片付けをするミドルウェアがあります。たとえば Rack::TempfileReaper は、ファイルのアップロードで作られた一時ファイルを消す処理を、<code>Rack::BodyProxy</code> を使って body の{' '}
              <code>close</code> のときに実行します。外側のミドルウェアが元の body を捨てて新しい body を返し、元の body の <code>close</code> を呼ばなければ、この処理は実行されません。
            </li>
          </ul>
          <p>
            body を置き換える正しい書き方の例として、Rails の既定のスタックにも入っている Rack::Head を読みます。HEAD（ヘッダーだけを求める HTTP のメソッド）の要求で、本文を空にするミドルウェアです。
          </p>
          <Code
            lang="ruby"
            title="rack/lib/rack/head.rb（14〜23行目）"
            href={`${RACK}/lib/rack/head.rb#L14-L23`}
            code={`
    def call(env)
      _, _, body = response = @app.call(env)

      if env[REQUEST_METHOD] == HEAD
        body.close if body.respond_to?(:close)
        response[2] = []
      end

      response
    end
`}
          />
          <ul>
            <li>
              <code>_, _, body = response = @app.call(env)</code>：内側が返した配列の全体を <code>response</code> に、3番目の要素を <code>body</code> に入れています。<code>_</code>{' '}
              は使わない値を受け取るときに慣習で使う変数名です。
            </li>
            <li>
              <code>env[REQUEST_METHOD] == HEAD</code>：<code>REQUEST_METHOD</code> と <code>HEAD</code> は Rack が定義した定数で、値は文字列の <code>"REQUEST_METHOD"</code> と <code>"HEAD"</code>{' '}
              です。
            </li>
            <li>
              <code>body.close if body.respond_to?(:close)</code>：元の body が <code>close</code> を持っていれば、捨てる前に呼んでいます。
            </li>
            <li>
              <code>response[2] = []</code>：配列の3番目の要素を空の配列に置き換えています。状態コードとヘッダーは内側が返したままなので、HEAD の応答は GET と同じヘッダーで、本文だけが無くなります。
            </li>
          </ul>
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
            上にあるものほど外側にあり、リクエストを先に受け取ります。最後の <code>run</code> の行には、ミドルウェアを通ったリクエストを最後に受け取るアプリケーション（ここではエンドポイントと呼びます）を指定します。これは、ルーティング（要求のメソッドとパスから、どのコントローラーのどのアクションを呼ぶかを決める処理）を行う <code>RouteSet</code>{' '}
            のインスタンスです。役割ごとにまとめると図 6-5 のようになります。各ミドルウェアの説明は Rails ガイドにもあります
            <Ref n={3} />。
          </p>
          <Figure
            n="6-5"
            title="Rails のミドルウェアスタック（production）"
            caption="Rails 8.1.4.1 の新規アプリケーションを production 環境で実行した結果を、役割ごとにまとめた図。役割の分け方は本書によるもの。"
          >
            <RailsStackFigure />
          </Figure>
          <p>
            一覧の <code>use</code> と <code>run</code> は、config.ru の <code>use</code> と <code>run</code> と同じ意味です。22個のうち、業務での調査や設定に関係するものを、何をするか、どの場面で関係するかと合わせて表にまとめます。表に無いものの働きは、図
            6-5 の「主な働き」の列に書いたとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ミドルウェア</th>
                  <th>すること</th>
                  <th>業務で関係する場面</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AssumeSSL・SSL</td>
                  <td>
                    AssumeSSL は要求を HTTPS で届いたものとして扱う。SSL は HTTP で届いた要求を HTTPS の URL へリダイレクトし、Cookie に secure 属性（HTTPS の要求でだけ送らせる指定）を付け、strict-transport-security ヘッダーを付ける
                  </td>
                  <td>
                    ロードバランサーの後ろでリダイレクトが繰り返すとき、ヘルスチェックがリダイレクトで失敗するとき（<ChapterLink n={25} section="tls-proto" />、<ChapterLink n={25} section="health" />）
                  </td>
                </tr>
                <tr>
                  <td>Static</td>
                  <td>GET と HEAD の要求で、パスに当たるファイルが public/ にあれば、内側を呼ばずにそのファイルを返す</td>
                  <td>
                    public/ に置いたファイルは、ルーティングもコントローラーも通らない。before_action に書いたログインの確認は実行されず、Rails のログにも出ない（<ChapterLink n={24} section="static" />）
                  </td>
                </tr>
                <tr>
                  <td>Executor</td>
                  <td>要求の処理の前の準備と、終わった後の片付け（Current の値の消去、データベース接続の返却など）を実行する</td>
                  <td>
                    要求が終わるたびに何が片付けられるかを調べるとき（<ChapterLink n={8} section="executor" />、<ChapterLink n={23} section="thread-safety" />）
                  </td>
                </tr>
                <tr>
                  <td>Rack::Runtime</td>
                  <td>このミドルウェアより内側の処理にかかった秒数を x-runtime ヘッダーに入れる</td>
                  <td>
                    curl やブラウザーの開発者ツールで、Rails の中でかかった時間を見るとき（<ChapterLink n={22} section="response-time" />）
                  </td>
                </tr>
                <tr>
                  <td>Rack::MethodOverride</td>
                  <td>
                    POST の要求に <code>_method</code> というパラメーターがあれば、env の <code>REQUEST_METHOD</code> をその値に書き換える
                  </td>
                  <td>
                    HTML のフォームは GET と POST しか送れない。<code>form_with</code> は PATCH や DELETE のフォームに hidden の <code>_method</code> を入れて POST で送り、このミドルウェアが書き換えるので、ルーティングは
                    PATCH・DELETE として扱う
                  </td>
                </tr>
                <tr>
                  <td>RequestId</td>
                  <td>要求ごとの ID を決めて x-request-id ヘッダーに入れる。X-Request-Id ヘッダーの付いた要求では、その値を使う</td>
                  <td>
                    1つの要求のログを集めるとき。<code>config.log_tags = [:request_id]</code> を設定すると、ログの各行にこの ID が付く（<ChapterLink n={25} section="request-id" />）
                  </td>
                </tr>
                <tr>
                  <td>RemoteIp</td>
                  <td>
                    <code>request.remote_ip</code> が返すクライアントの IP アドレスを、X-Forwarded-For などのヘッダーから求める
                  </td>
                  <td>
                    ロードバランサーの後ろで、ログや <code>request.remote_ip</code> の IP アドレスが期待と違うとき（<ChapterLink n={25} section="client-ip" />）
                  </td>
                </tr>
                <tr>
                  <td>SilenceRequest・Logger</td>
                  <td>
                    Logger はログに <code>Started GET "/articles/1" for 127.0.0.1 at …</code> の行を書く。SilenceRequest は <code>/up</code> の要求の間、エラーより低いレベルのログを出さない
                  </td>
                  <td>ログに Started の行が無い要求は、Logger より外側のミドルウェアが応答を返したか、Rails まで届いていない</td>
                </tr>
                <tr>
                  <td>ShowExceptions・DebugExceptions</td>
                  <td>
                    DebugExceptions は内側で起きた例外をログに書き、development ではデバッグ用のエラーページを返す。ShowExceptions は例外を public/500.html などのエラーの応答に変える
                  </td>
                  <td>
                    500 や 404 のページがどこで作られたかを調べるとき（<ChapterLink n={10} section="exceptions" />）
                  </td>
                </tr>
                <tr>
                  <td>Cookies・CookieStore・Flash</td>
                  <td>
                    コントローラーの <code>cookies</code>・<code>session</code>・<code>flash</code> の値を、要求の cookie ヘッダーから読み、応答の set-cookie ヘッダーに書く
                  </td>
                  <td>
                    ログインの状態が保たれないとき（<ChapterLink n={10} section="cookies-session" />）
                  </td>
                </tr>
                <tr>
                  <td>Rack::ConditionalGet・Rack::ETag</td>
                  <td>
                    ETag は本文から計算した値を etag ヘッダーに入れる。ConditionalGet は、要求の If-None-Match ヘッダーの値が etag と一致すれば、本文の無い 304 に変える
                  </td>
                  <td>
                    ブラウザーの開発者ツールに 304 が並ぶ理由を説明するとき（<ChapterLink n={22} section="http-cache" />）
                  </td>
                </tr>
                <tr>
                  <td>Rack::TempfileReaper</td>
                  <td>ファイルのアップロードで作られた一時ファイルを、応答を送り終えた後で消す</td>
                  <td>本文を置き換えるミドルウェアを自作するとき（「ミドルウェアの形」の節の close の注意）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>並びの順から、次の2つが分かります。</p>
          <ul>
            <li>
              内側を呼ばずに応答を返すミドルウェアがあると、それより内側は実行されません。SSL が HTTPS へのリダイレクトを返した要求と、Static が public/ のファイルを返した要求は、Logger まで届かないので、ログに Started
              の行が出ません。
            </li>
            <li>
              ShowExceptions がエラーの応答に変えられるのは、自分より内側で起きた例外だけです。ShowExceptions より外側のミドルウェアで起きた例外は Puma まで届き、Puma が 500 の応答を作ります（「Web
              サーバーとアプリケーションの分担」の節）。
            </li>
          </ul>
          <p>
            次の図は、production の並びを縮めて、内側を呼ばずに応答を返した要求（①②）と、例外が起きた要求（③④）が、どこまで進み、どこで応答になるかを描いたものです。左側が上の箇条書きの1つ目、右側が2つ目に当たります。
          </p>
          <Figure
            title="内側を呼ばずに返す応答と、例外の行き先"
            caption="production の並びをもとにした模式図。上ほど外側で、省略した段は破線の箱にまとめた。強調色の矢印は例外が伝わる経路。④ の本文が空になるのは、Puma の lowlevel_error_handler を設定していない場合。"
          >
            <StackReachFigure />
          </Figure>
          <p>
            「HTTP の要求と応答」の節の応答のヘッダーとも対応します。x-request-id は RequestId、x-runtime は Rack::Runtime、etag は Rack::ETag が付けたものです。server-timing は、後で見る development 環境だけの
            ServerTiming が付けています。応答の各ヘッダーをどこが付けたかは、<ChapterLink n={26} section="response" />でまとめて確かめます。
          </p>
          <p>
            この並びは、railties の DefaultMiddlewareStack が設定値を見ながら組み立てています。どの設定がどのミドルウェアを入れるかを確かめるため、前半を引用します。
          </p>
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
          <ul>
            <li>
              <code>{'ActionDispatch::MiddlewareStack.new do |middleware| ... end'}</code>：空のスタックを作り、ブロックの中で <code>middleware.use</code> を呼ぶたびに、ミドルウェアを末尾に1つ足します。
            </li>
            <li>
              <code>middleware.use クラス, 引数</code>：2つ目からの引数は、後でそのクラスを <code>new</code> するときに渡す値です。Rack::Sendfile には <code>config.action_dispatch.x_sendfile_header</code>{' '}
              の値が渡ります。<code>**config.host_authorization</code> のように引数の前にアスタリスクを2つ付けるのは、ハッシュの中身をキーワード引数として渡す書き方です。
            </li>
            <li>
              <code>::ActionDispatch::SSL</code> の先頭の <code>::</code>：名前空間の一番外側から定数を探す書き方です。
            </li>
            <li>
              <code>unless Array(config.hosts).empty?</code>：<code>config.hosts</code> が空でないときだけ HostAuthorization を足します。<code>Array(...)</code> は値が nil でも配列に直すメソッドです。
            </li>
          </ul>
          <p>
            <code>use</code> を呼んだ順がそのまま並び順になり、多くのミドルウェアは <code>if</code> で設定値を確かめてから追加されます
            <Ref n={4} />。新規アプリケーションの <code>config/environments/production.rb</code> には <code>config.assume_ssl = true</code>、<code>config.force_ssl = true</code>、
            <code>config.silence_healthcheck_path = "/up"</code> が書かれているので、AssumeSSL・SSL・SilenceRequest が入ります。AssumeSSL は、TLS（HTTPS で通信を暗号化する仕組み）を終端した（暗号化された通信を受けて復号し、後ろへは HTTP で送る）ロードバランサーの後ろでも
            HTTPS のリクエストとして扱えるように、env の <code>HTTPS</code> や <code>rack.url_scheme</code> を書き換えるミドルウェアです
            <Ref n={12} />。
          </p>
          <p>
            引用の続き（同じメソッドの 37〜108 行目）も同じ形です。設定値とミドルウェアの対応を表にまとめます。<code>bin/rails middleware</code> の結果が期待と違うときは、<code>config/environments/</code>{' '}
            のファイルでこの設定値を確かめます。たとえば production の一覧に SSL が無ければ、<code>config.force_ssl</code> が true になっていません。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>設定</th>
                  <th>入るミドルウェア</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>config.hosts</code> が空でない
                  </td>
                  <td>HostAuthorization</td>
                </tr>
                <tr>
                  <td>
                    <code>config.assume_ssl</code>
                  </td>
                  <td>AssumeSSL</td>
                </tr>
                <tr>
                  <td>
                    <code>config.force_ssl</code>
                  </td>
                  <td>SSL</td>
                </tr>
                <tr>
                  <td>
                    <code>config.public_file_server.enabled</code>
                  </td>
                  <td>Static</td>
                </tr>
                <tr>
                  <td>
                    <code>config.server_timing</code>
                  </td>
                  <td>ServerTiming</td>
                </tr>
                <tr>
                  <td>
                    <code>config.silence_healthcheck_path</code>
                  </td>
                  <td>SilenceRequest</td>
                </tr>
                <tr>
                  <td>
                    <code>config.consider_all_requests_local</code>
                  </td>
                  <td>ActionableExceptions</td>
                </tr>
                <tr>
                  <td>
                    <code>config.enable_reloading</code>
                  </td>
                  <td>Reloader</td>
                </tr>
                <tr>
                  <td>
                    <code>config.session_store</code>
                  </td>
                  <td>セッションのミドルウェア（既定は CookieStore）</td>
                </tr>
                <tr>
                  <td>
                    <code>config.api_only</code> が true
                  </td>
                  <td>MethodOverride・Cookies・セッション・Flash・ContentSecurityPolicy・TempfileReaper を入れない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>development 環境では、同じアプリケーションでも次の違いがありました。</p>
          <ul>
            <li>
              先頭に <code>ActionDispatch::HostAuthorization</code> が入る。development では <code>config.hosts</code> の既定値に <code>.localhost</code>・<code>.test</code> とすべての IP アドレスが入っており、空ではないため。
            </li>
            <li>
              <code>ActionDispatch::Reloader</code>（コードの再読み込み。<ChapterLink n={8} />）、<code>ActionDispatch::ActionableExceptions</code>（エラーページのボタンから、未実行のマイグレーションの実行などの操作を受け付ける）、
              <code>ActiveRecord::Migration::CheckPending</code>（未実行のマイグレーションの検出。マイグレーションは、データベースのテーブルを変更する手順を書いたファイル）、<code>ActionDispatch::ServerTiming</code>（処理時間の内訳を
              server-timing ヘッダーに入れる。<ChapterLink n={22} section="breakdown" />）が入る。
            </li>
            <li>
              アセット（CSS・JavaScript・画像などのファイル）配信の <code>Propshaft::Server</code> と、そのログを抑える <code>Propshaft::QuietAssets</code> が入る。
            </li>
            <li>
              <code>ActiveSupport::Cache::Strategy::LocalCache::Middleware</code> が入る。development のキャッシュストア（一度作った値を保存して使い回すための保存先。ここでは memory_store）が LocalCache（1つの要求の処理の間、キャッシュから読んだ値をメモリーに持ち、同じキーの読み出しを繰り返さないようにする仕組み）を持つため、Bootstrap（Rails
              が起動の最初に実行する初期化処理のまとまり。<ChapterLink n={7} section="initializers" />）の初期化処理がこのミドルウェアを加える。
            </li>
            <li>
              AssumeSSL・SSL・SilenceRequest は入らない。エンドポイントは <code>Rails::Engine::LazyRouteSet</code>（routes.rb を最初に必要になったときに読み込む RouteSet のサブクラス）になる。
            </li>
          </ul>
          <p>本書の各章とは次のように対応します。</p>
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
            <code>Rails.application.call(env)</code> の実装は、Rails::Engine にあります（Rails::Application は Rails::Engine のサブクラスです。<ChapterLink n={7} />）。要求のたびに呼ばれる{' '}
            <code>call</code> と、スタックを組み立てる <code>app</code> の2つのメソッドを読み、組み立てが要求のたびではなく1回だけであることを確かめます。
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
            <Ref n={5} />。<code>@app_build_lock</code> による排他（同時に1つのスレッドだけが実行できるようにすること）は、複数のスレッドが同時に組み立てを始めないためのものです。なお、この <code>app</code> は初期化の最後の段階（Finisher の{' '}
            <code>build_middleware_stack</code> という初期化処理。<ChapterLink n={7} section="finisher" />）で一度呼ばれるので、リクエストを受ける時点では組み立てが終わっています。
          </p>
          <p>書き方を行ごとに補います。下の <code>call</code> から読みます。</p>
          <ul>
            <li>
              <code>req = build_request env</code> と <code>app.call req.env</code>：メソッド呼び出しの括弧を省略した書き方で、<code>build_request(env)</code>、<code>app.call(req.env)</code> と同じです。<code>req</code>{' '}
              はコントローラーの <code>request</code> と同じ ActionDispatch::Request クラスのオブジェクトです。
            </li>
            <li>
              <code>{'@app || @app_build_lock.synchronize { ... }'}</code>：<code>@app</code> に値があればそれを返し、nil のときだけ <code>||</code> の右側を実行します。
            </li>
            <li>
              <code>@app ||= begin ... end</code>：<code>begin</code> から <code>end</code> までを実行し、最後の式の値を <code>@app</code> に入れます。2回目からは保存した <code>@app</code>{' '}
              を返すだけなので、組み立ては1回だけです。
            </li>
            <li>
              <code>begin</code> の中の3行：1行目の <code>default_middleware_stack</code> は、前節の <code>build_stack</code> が作った既定のスタックを返します。2行目の <code>build_middleware</code> は設定ファイルに書いた{' '}
              <code>config.middleware</code> の変更を返し、<code>merge_into(stack)</code> がその変更を既定のスタックに適用します（次の節）。3行目の <code>build(endpoint)</code> が、並びから入れ子のオブジェクトを作ります。
            </li>
            <li>
              <code>self.class.endpoint || routes</code>：エンドポイントを別に登録していなければ <code>routes</code> を返します。<code>routes</code> は config/routes.rb の定義を持つ RouteSet です。
            </li>
          </ul>
          <p>
            組み立ての本体は ActionDispatch::MiddlewareStack の build です。一覧の並びから、wrap.rb の <code>Announce.new("A", Announce.new("B", app))</code> と同じ入れ子をどう作るかを読みます。
          </p>
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
          <ul>
            <li>
              <code>instrumenting = ...</code>：ミドルウェアごとの計測を購読しているかを調べています。通常は false で、<code>else</code> の <code>e.build(a)</code> が実行されます（後の補足）。
            </li>
            <li>
              <code>middlewares.freeze.reverse</code>：<code>freeze</code> で配列を以後変更できないようにし、<code>reverse</code> で逆順に並べた新しい配列を作ります。
            </li>
            <li>
              <code>{'inject(app || block) do |a, e| ... end'}</code>：<code>a</code> の最初の値は引数の <code>app</code>、つまりエンドポイントです。<code>e</code> は逆順にした配列の要素で、<code>use</code>{' '}
              で登録したクラスと引数を持つオブジェクトです。ブロックの値が、次の回の <code>a</code> になります。
            </li>
            <li>
              <code>klass.new(a, *args, &block)</code>：<code>*args</code> は <code>use</code> に渡した2つ目からの引数を、<code>&block</code> は <code>use</code> に渡したブロックを、そのまま <code>new</code>{' '}
              に渡す書き方です。<code>config.middleware.use Foo, "x"</code> と書くと <code>Foo.new(内側のアプリケーション, "x")</code> が実行されます。ミドルウェアの <code>initialize</code>{' '}
              の第1引数が必ず内側のアプリケーションになるのは、この行のためです。
            </li>
          </ul>
          <p>
            図 6-6 は、ミドルウェアが SSL・Logger・ETag の3つの場合に、<code>a</code> と <code>e</code> がどう変わるかを示しています。1回目は <code>a</code> が routes、<code>e</code> が ETag で、<code>ETag.new(routes)</code>{' '}
            を作ります。2回目は <code>a</code> がその ETag のインスタンス、<code>e</code> が Logger です。3回目に作った SSL のインスタンスが <code>build</code> の戻り値になり、<code>Rails.application.app</code> が返すオブジェクトになります。
          </p>
          <Figure n="6-6" title="reverse と inject による組み立て" caption="模式図。ミドルウェアを3つに減らして描いている。実際の production 環境では、外側から AssumeSSL、SSL、Rack::Sendfile … と続く。">
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
            <code>instance_variable_get(:@app)</code> はオブジェクトのインスタンス変数を外から読むメソッドです。ミドルウェアは内側を <code>@app</code> に持つので、<code>@app</code> が nil
            になるまで繰り返すと、外側から順にクラス名が並びます。<code>bin/rails middleware</code> が表示するのは設定上の並びで、このスクリプトが表示するのは実際に作られたオブジェクトの並びです。
          </p>
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
            <Ref n={8} />。Flash の機能はリクエストのオブジェクトから必要になったときに読み込まれます。一覧に表示されることと、呼び出しの連鎖に入ることは別だという例です。
          </p>
          <Callout kind="note">
            <p>
              <code>process_middleware.action_dispatch</code> というイベントを購読しているときは、build が各ミドルウェアを <code>InstrumentationProxy</code>{' '}
              で包み、ミドルウェアごとの実行時間を ActiveSupport::Notifications（処理の開始と終了をイベントとして通知する仕組み。<ChapterLink n={22} section="notifications" />）で計測できるようにします（stack.rb の 52〜70 行目）
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
            既定のスタックを変更するのは、自作のミドルウェアを足すときと、ミドルウェアを含む gem の導入手順が位置を指定しているときです。たとえば <code>rails new --api</code> が作る{' '}
            <code>config/initializers/cors.rb</code> には、rack-cors という gem のミドルウェアを先頭に足す行が、コメントの形で入っています。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/cors.rb（rails new --api で生成。先頭のコメントを省略）"
            code={`
# Rails.application.config.middleware.insert_before 0, Rack::Cors do
#   allow do
#     origins "example.com"
#
#     resource "*",
#       headers: :any,
#       methods: [:get, :post, :put, :patch, :delete, :options, :head]
#   end
# end
`}
          />
          <p>
            <code>insert_before 0, Rack::Cors</code> は、並びの0番目（先頭）の前に Rack::Cors を足すという意味です。<code>do ... end</code> のブロックは、Rack::Cors を <code>new</code>{' '}
            するときに渡されます。このような行を読み書きするために、<code>config.middleware</code> のメソッドと、変更が適用される時点を見ていきます。
          </p>
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
            「既存」と「基準」には、ミドルウェアのクラスのほかに、cors.rb の <code>0</code> のような並びの番号も書けます。足す位置は、前の節で見た並びの性質から決めます。<code>use</code>{' '}
            で末尾に足したミドルウェアは ShowExceptions より内側に入るので、そこで起きた例外は Rails のエラーページになります。<code>unshift</code> や{' '}
            <code>insert_before 0</code> で先頭に足したミドルウェアは、public/ のファイルへの要求を含むすべての要求を受け取りますが、そこで起きた例外は ShowExceptions の外側なので、Puma が 500 の応答を作ります。
          </p>
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
          <ul>
            <li>
              <code>def insert_before(...)</code>：引数の <code>(...)</code> は、受け取った引数とブロックをすべて、そのまま別のメソッドに渡すための書き方です。中の <code>middleware.insert_before(...)</code>{' '}
              に同じ引数が渡ります。
            </li>
            <li>
              <code>{'-> middleware { ... }'}</code>：引数を1つ受け取る lambda で、<code>{'->(middleware) { ... }'}</code> と同じです。作った時点では中の処理は実行されません。<code>{'@operations << ...'}</code>{' '}
              で、配列の末尾に足されるだけです。
            </li>
            <li>
              <code>alias :insert :insert_before</code>：<code>insert</code> という名前でも同じメソッドを呼べるようにしています。
            </li>
            <li>
              <code>merge_into(other)</code>：<code>other</code> は既定のスタック（MiddlewareStack）です。<code>@operations + @delete_operations</code> で2つの配列をつなぎ、<code>operation.call(other)</code>{' '}
              で lambda を順に実行します。ここで初めて、MiddlewareStack の <code>insert_before</code> や <code>delete</code> が呼ばれます。
            </li>
          </ul>
          <p>
            ためた lambda は前節の Engine#app の <code>build_middleware.merge_into(stack)</code> で既定のスタックに順に適用されます
            <Ref n={7} />。<ChapterLink n={4} />で見た「lambda を保存して後で呼ぶ」使い方です。この実装から、次の2点が分かります。
          </p>
          <ul>
            <li>設定ファイルを読み込む時点では既定のスタックがまだ無くても、既定のミドルウェアを基準に insert_before などを書ける。</li>
            <li>
              適用の順は、追加系（<code>@operations</code>）が全部終わってから削除・移動系（<code>@delete_operations</code>）になる。書いた順ではない。
            </li>
          </ul>
          <p>
            2点目を確かめるため、デモのアプリケーションに次の初期化ファイル（config/initializers に置く、起動時に1回実行されるファイル。<ChapterLink n={7} section="environments" />
            ）を置きました。
          </p>
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
          <p>
            1行目の <code>require</code> は、<code>lib/middleware/timing.rb</code> に置いた「ミドルウェアの形」の節の Timing を読み込んでいます。require の後の3行が適用された順は、<code>insert_before</code>、<code>use</code>（3つ目に書いた行）、<code>delete</code>（2つ目に書いた行）です。既定のミドルウェアを別の位置へ移したいときに <code>delete</code> と <code>use</code> を並べて書くと、この例のように両方が消えます。位置を移すときは{' '}
            <code>move_before</code>・<code>move_after</code> を、別のクラスに替えるときは <code>swap</code> を使います。設定を書いた後は、<code>bin/rails middleware</code> で並びを確かめます。
          </p>
          <p>
            次の図は、検証用の3行を、左に書いた順、中央に merge_into が適用した順で並べたものです。2番目に書いた delete は @delete_operations に入るので、3番目に書いた use より後に適用されます。
          </p>
          <Figure
            title="config.middleware の操作を書いた順と適用する順"
            caption="検証用の初期化ファイルから、require を除いた3行をもとにした図。Rails::Rack::Logger を Logger と略した。強調色の矢印と枠は、書いた順より後に適用される delete。"
          >
            <MergeOrderFigure />
          </Figure>
          <Callout kind="warn">
            <p>
              自作のミドルウェアを <code>lib/middleware/</code> に置く場合、Rails ガイドは <code>config.autoload_lib(ignore: %w[assets tasks middleware])</code>{' '}
              のようにオートロードの対象から外すことを勧めています
              <Ref n={3} />。外さないと、Zeitwerk（ファイルの場所からクラス名を決めて、自動で読み込む gem）は <code>lib/middleware/timing.rb</code> に <code>Middleware::Timing</code> が定義されていると期待するため、production
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
            <Ref n={2} />。Rails のコードを読むときや、古いミドルウェアを使い続けるときに関係するものを表にまとめます。自分のアプリケーションがどちらの Rack で動いているかは、Gemfile.lock の rack の行か、<code>bin/rails console</code> で{' '}
            <code>Rack::RELEASE</code> を表示すると分かります。
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
          <p>
            表の語を補います。複数の値を持つヘッダーの例は set-cookie です。Cookie を2つ返すとき、Rack 3 ではヘッダーの値を <code>["a=1", "b=2"]</code> のような文字列の配列にします。rack.input
            の巻き戻し（rewind）は、一度読んだリクエスト本文を、もう一度先頭から読めるようにする操作です。rackup は config.ru を読み込んで Web サーバーを起動するコマンドです。
          </p>
          <p>
            大文字を含むヘッダー名は、Rack::Lint で検査すると例外になります。次の例の <code>Rack::MockRequest</code> は、Web サーバーを起動せずに Rack アプリケーションへ要求を送るための Rack のクラスです。
            <code>Rack::Lint.new(bad)</code> で <code>bad</code> を検査用のミドルウェアで包み、<code>get("/")</code> で GET の要求を1回送っています。
          </p>
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
            1行目の <code>if</code> は、読み込まれている rack gem のバージョン（<code>Rack::RELEASE</code>）が 3 より小さいかを調べています。<code>Gem::Version.new</code>{' '}
            はバージョンの番号どうしを大小で比べられるオブジェクトを作ります。3 より小さければ先頭が大文字の名前を、そうでなければ小文字の名前を定数に入れます。Rails のソースでは、ヘッダー名を文字列で直接書かず、この定数で書いている所があります。「Rails のミドルウェアスタック」の節で見た
            ShowExceptions は、応答のヘッダーを <code>response[1][Constants::X_CASCADE]</code> と読んでいます。
          </p>
          <p>
            応答のヘッダーを表すクラスも、Rack 3 では <code>Rack::Headers</code>、Rack 2 では <code>Rack::Utils::HeaderHash</code> を使います（<code>action_dispatch/http/response.rb</code> の 39〜47
            行目）
            <Ref n={11} />。<code>Rack::Headers</code> は、どの大文字小文字でキーを指定しても小文字のキーとして扱うハッシュなので、<code>response.headers["Content-Type"]</code>{' '}
            のように書いても動きます。一方、Rails を通さない自作のミドルウェアで普通のハッシュを返す場合は、小文字で書く必要があります。
          </p>
          <p>
            読む側にも同じ注意があります。普通のハッシュはキーの大文字と小文字を区別するので、<code>{'{ "content-type" => "text/html" }'}</code> から <code>["Content-Type"]</code> で値を取ろうとすると nil
            が返ります。Rack 2 のころに書かれたミドルウェアが <code>headers["Content-Type"]</code> のように大文字の名前で応答のヘッダーを読んでいる場合、内側が返したヘッダーが普通のハッシュだと値を取れません。rack を 3
            系に上げるときや、古い gem のミドルウェアを入れるときは、ヘッダー名の書き方を確かめます。
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
          <li>HTTP の要求と応答は、1行目（要求行・状態行）、ヘッダー、空行、本文の順に並んだ文字の並びです。状態コードの最初の桁が、成功・リダイレクト・要求の誤り・サーバーの誤りを表します。</li>
          <li>Web サーバーは接続を受け付けて要求を読み、応答を書き出します。Rails は要求の内容から状態コード・ヘッダー・本文を作ることだけを受け持ちます。</li>
          <li>本体と同じ呼び出し方ができるオブジェクトで本体を呼ぶと、前後に処理を挟めます。要求は外側から、応答は内側から順に処理されます。</li>
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
    { title: 'RFC 9112 HTTP/1.1', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9112.html', accessed: '2026-11-16', version: 'RFC 9112', note: 'メッセージの形（1行目・ヘッダーの行・空行・本文、行の区切りの CRLF）と、要求行（メソッド・要求の対象・バージョン）・状態行の書き方。' },
    { title: 'RFC 9110 HTTP Semantics', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110.html', accessed: '2026-11-16', version: 'RFC 9110', note: '要求と応答、ヘッダーの名前が大文字と小文字を区別しないこと（5.1節）、状態コードの5つの種類（15節）。' },
    { title: 'class TCPServer', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/TCPServer.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: 'TCPServer.new でポートを開き、accept が接続を待って TCPSocket を返すこと。tiny_server.rb の実行結果は Ruby 4.0.9 で実測。' },
    { title: 'curl man page', publisher: 'curl project', url: 'https://curl.se/docs/manpage.html', accessed: '2026-11-16', version: 'curl 8.23.0（実行に使った版）', note: '-v で送ったヘッダーを > 、受け取ったヘッダーを < で示すこと。-i・-d・-X・-w の働き。' },
  ],
}

export default withExplanations(ch06, explanation06)
