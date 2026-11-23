import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation24 } from '../explanations/operations'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const NG = 'https://nginx.org/en/docs'

/* ---------- 図 27-1 HTTP の要求と応答 ---------- */
function MessageFigure() {
  const rows = [
    { label: '1行目', y: 50, h: 46, req: ['GET /hello.html HTTP/1.1', 'メソッド・パス・HTTP のバージョン'], res: ['HTTP/1.1 200 OK', 'HTTP のバージョン・状態コード・説明'], fill: 'box5' as const },
    { label: 'ヘッダー', y: 104, h: 72, req: ['Host: 127.0.0.1:8080', 'User-Agent: curl/8.23.0', 'Accept: */*'], res: ['Server: nginx/1.30.6', 'Content-Type: text/html', 'Content-Length: 26'], fill: 'box' as const },
    { label: '空の行', y: 184, h: 26, req: ['（ヘッダーの終わり）'], res: ['（ヘッダーの終わり）'], fill: 'bg' as const },
    { label: '本文', y: 218, h: 34, req: ['（GET の要求には無い）'], res: ['<h1>Hello from Nginx</h1>'], fill: 'box4' as const },
  ]
  return (
    <Svg
      id="27-1"
      w={780}
      h={300}
      label="curl が送った要求と Nginx が返した応答を、同じ並びで比べた図。要求の1行目はメソッド GET、パス /hello.html、HTTP のバージョン。応答の1行目は HTTP のバージョンと状態コード 200 OK。2行目からはヘッダーで、要求には Host・User-Agent・Accept、応答には Server・Content-Type・Content-Length がある。空の行でヘッダーが終わり、その後が本文。GET の要求には本文が無く、応答の本文は hello.html の中身"
    >
      <T x={130} y={30} bold fs={12}>
        要求（curl が送る）
      </T>
      <T x={460} y={30} bold fs={12}>
        応答（Nginx が返す）
      </T>
      <Arrow x1={418} y1={30} x2={452} y2={30} />
      {rows.map((r) => (
        <g key={r.label}>
          <T x={20} y={r.y + r.h / 2} fs={11.5} bold>
            {r.label}
          </T>
          <Box x={120} y={r.y} w={310} h={r.h} lines={r.req} mono={r.label !== '空の行'} fs={11} fill={r.fill} subTone={r.label === '1行目' ? 'muted' : undefined} dashed={r.label === '空の行'} align="start" />
          <Box x={450} y={r.y} w={310} h={r.h} lines={r.res} mono={r.label !== '空の行'} fs={11} fill={r.fill} subTone={r.label === '1行目' ? 'muted' : undefined} dashed={r.label === '空の行'} align="start" />
        </g>
      ))}
      <T x={20} y={280} fs={11} tone="muted">
        ヘッダーは「名前: 値」の形で1行に1つ。応答のヘッダーは一部を省略した
      </T>
    </Svg>
  )
}

/* ---------- 図 27-2 リバースプロキシの流れ ---------- */
function ProxyFigure() {
  return (
    <Svg
      id="27-2"
      w={780}
      h={300}
      label="ブラウザー（ここでは curl）が Nginx のポート 80 に要求を送る。Nginx は proxy_pass に書いた Puma のポート 3000 に、同じ内容の要求を新しい接続で送る。Puma が Rails を呼び、Rails が作った応答を Nginx が受け取ってブラウザーに返す。ブラウザーと Nginx の間の接続では Nginx から見た相手は 172.29.0.1、Nginx と Puma の間の接続では Rails から見た相手は Nginx の 172.29.0.15 になる。静的ファイルは、設定すれば Nginx が Rails を通さずに返す"
    >
      <Box x={20} y={50} w={140} h={90} lines={['ブラウザー', '（curl）', '172.29.0.1']} fs={12} bold fill="bg" subTone="muted" />
      <Box x={260} y={40} w={180} h={110} lines={['Nginx', 'ポート 80 で待つ', 'proxy_pass で', 'Puma に転送する']} fs={12} bold fill="box" subTone="muted" />
      <Box x={560} y={40} w={200} h={110} lines={['Puma（ポート 3000）', 'Rails を呼ぶ', 'Rails が応答を作る']} fs={12} bold fill="box5" subTone="muted" />
      <Arrow x1={160} y1={78} x2={258} y2={78} />
      <T x={210} y={68} anchor="middle" fs={10.5} tone="muted" mono>
        GET /articles
      </T>
      <Arrow x1={258} y1={114} x2={162} y2={114} />
      <T x={210} y={128} anchor="middle" fs={10.5} tone="muted">
        応答
      </T>
      <Arrow x1={440} y1={78} x2={558} y2={78} />
      <T x={500} y={68} anchor="middle" fs={10.5} tone="muted">
        同じ内容の要求
      </T>
      <Arrow x1={558} y1={114} x2={442} y2={114} />
      <T x={500} y={128} anchor="middle" fs={10.5} tone="muted">
        応答
      </T>
      <T x={20} y={172} fs={11} bold>
        接続 1：ブラウザー → Nginx
      </T>
      <T x={20} y={190} fs={11} tone="muted">
        Nginx のログの相手は 172.29.0.1
      </T>
      <T x={500} y={172} fs={11} bold>
        接続 2：Nginx → Puma
      </T>
      <T x={500} y={190} fs={11} tone="muted">
        Rails のログの相手は 172.29.0.15（Nginx）
      </T>
      <Arrow x1={350} y1={150} x2={350} y2={218} dashed />
      <Box x={260} y={220} w={180} h={44} lines={['public のファイル', '（静的ファイル）']} fs={11.5} fill="box4" subTone="muted" />
      <T x={452} y={236} fs={11} tone="muted">
        設定すれば、Rails を通さずに
      </T>
      <T x={452} y={254} fs={11} tone="muted">
        Nginx が直接返す
      </T>
    </Svg>
  )
}

/* ---------- 図 27-3 nginx.conf の階層 ---------- */
function HierarchyFigure() {
  return (
    <Svg
      id="27-3"
      w={780}
      h={330}
      label="nginx.conf の一番外側（main）には worker_processes などのプロセスの設定があり、events ブロックに worker_connections がある。http ブロックには MIME タイプやログの設定があり、conf.d の設定ファイルを include する。その中の upstream ブロックが Puma のアドレスを、server ブロックが待ち受けるポートと root を決める。server の中の location ブロックが URI ごとの処理を決める。下の階層は上の階層の設定を引き継ぐが、proxy_set_header や add_header は、下の階層で1つでも書くと上の階層の値を引き継がない"
    >
      <rect x={20} y={14} width={740} height={300} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={32} bold mono fs={12}>
        main（nginx.conf の一番外側）
      </T>
      <T x={320} y={32} fs={11} tone="muted" mono>
        worker_processes auto; error_log …; pid …;
      </T>
      <Box x={32} y={44} w={300} h={30} lines="events { worker_connections 1024; }" mono fs={11} fill="box" align="start" />
      <rect x={32} y={84} width={716} height={220} rx={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={44} y={102} bold mono fs={12}>
        http
      </T>
      <T x={100} y={102} fs={11} tone="muted" mono>
        include mime.types; access_log …; keepalive_timeout 65; include conf.d/*.conf;
      </T>
      <Box x={44} y={116} w={210} h={56} lines={['upstream app', 'server rbdemo-puma:3000;']} mono fs={11} fill="box4" subTone="muted" />
      <rect x={270} y={116} width={466} height={176} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={282} y={134} bold mono fs={12}>
        server
      </T>
      <T x={346} y={134} fs={11} tone="muted" mono>
        listen 80; server_name _; root /app/public;
      </T>
      <Box x={282} y={148} w={140} h={40} lines={['location /assets/', '直接返す']} mono fs={10.5} fill="box2" subTone="muted" />
      <Box x={432} y={148} w={140} h={40} lines={['location /cable', 'WebSocket']} mono fs={10.5} fill="box2" subTone="muted" />
      <Box x={582} y={148} w={140} h={40} lines={['location /', 'try_files']} mono fs={10.5} fill="box2" subTone="muted" />
      <Box x={582} y={198} w={140} h={40} lines={['location @app', 'proxy_pass']} mono fs={10.5} fill="box2" subTone="muted" />
      <Arrow x1={652} y1={188} x2={652} y2={196} />
      <Arrow d="M582,218 L260,218 L260,160 L256,160" dashed />
      <T x={282} y={258} fs={11} tone="muted">
        下の階層は上の設定を引き継ぐ。ただし proxy_set_header・add_header は、
      </T>
      <T x={282} y={276} fs={11} tone="muted">
        その階層に1つでも書くと、上の階層の値を引き継がない
      </T>
    </Svg>
  )
}

/* ---------- 図 27-4 要求の振り分け ---------- */
function RoutingFigure() {
  const rows = [
    { u: '/assets/application-8b441ae0.css', l: 'location /assets/', r: 'public/assets から返す（200、1年キャッシュ）', fill: 'box4' as const },
    { u: '/assets/nothing.css', l: 'location /assets/', r: 'ファイルが無い → 404（Rails には渡さない）', fill: 'bg' as const },
    { u: '/robots.txt', l: 'location / → try_files', r: 'public/robots.txt があるので返す', fill: 'box4' as const },
    { u: '/articles/1', l: 'location / → @app', r: 'ファイルが無いので Puma へ', fill: 'box5' as const },
    { u: '/cable', l: 'location /cable', r: 'Upgrade を付けて Puma へ（WebSocket）', fill: 'box5' as const },
  ]
  return (
    <Svg
      id="27-4"
      w={780}
      h={rows.length * 46 + 40}
      label="デモの設定で、要求の URI ごとに選ばれた location と処理を並べた。/assets/ で始まる要求は location /assets/ が選ばれ、ファイルがあれば Nginx が返し、無ければ 404 を返して Rails には渡さない。/robots.txt は location / の try_files で public のファイルが見つかり、Nginx が返す。/articles/1 はファイルが無いので名前付きの location @app に移り、Puma に渡される。/cable は location /cable が選ばれ、Upgrade ヘッダーを付けて Puma に渡される"
    >
      <T x={20} y={18} bold fs={12}>
        要求の URI
      </T>
      <T x={300} y={18} bold fs={12}>
        選ばれた location
      </T>
      <T x={500} y={18} bold fs={12}>
        処理
      </T>
      {rows.map((r, i) => {
        const y = 30 + i * 46
        return (
          <g key={r.u}>
            <Box x={20} y={y} w={262} h={36} lines={r.u} mono fs={11} fill="bg" align="start" />
            <Arrow x1={282} y1={y + 18} x2={296} y2={y + 18} />
            <Box x={298} y={y} w={190} h={36} lines={r.l} mono fs={11} fill="box2" />
            <Arrow x1={488} y1={y + 18} x2={498} y2={y + 18} />
            <Box x={500} y={y} w={262} h={36} lines={r.r} fs={10.5} fill={r.fill} />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 27-5 バッファリングの有無 ---------- */
function BufferFigure() {
  return (
    <Svg
      id="27-5"
      w={780}
      h={290}
      label="proxy_buffering が on なら、Nginx は Puma から応答をできるだけ速く受け取り、メモリーや一時ファイルに保存してから、遅いクライアントにゆっくり送る。Puma のスレッドはすぐに次の要求を処理できる。off なら、Nginx は受け取った分をそのままクライアントに送るので、クライアントが遅いと Puma のスレッドは応答を書き終わるまでふさがる。デモでは、3つのスレッドがすべてふさがり、別の要求が空きを 8.6 秒待った"
    >
      <T x={20} y={20} bold>
        proxy_buffering on（既定）
      </T>
      <Box x={20} y={34} w={150} h={44} lines={['Puma のスレッド', 'すぐに空く']} fs={11.5} fill="box5" subTone="muted" />
      <Arrow x1={170} y1={56} x2={278} y2={56} accent />
      <T x={224} y={46} anchor="middle" fs={10.5} tone="acc">
        速く送る
      </T>
      <Box x={280} y={30} w={230} h={52} lines={['Nginx', 'メモリーと一時ファイルに保存']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={510} y1={56} x2={608} y2={56} dashed />
      <T x={559} y={46} anchor="middle" fs={10.5} tone="muted">
        ゆっくり
      </T>
      <Box x={610} y={34} w={150} h={44} lines={['遅いクライアント', '200KB/s']} fs={11.5} fill="bg" subTone="muted" />
      <T x={20} y={104} fs={11} tone="muted" mono>
        6秒後: busy_threads=0 / 別の要求 /lab/info 200 0.002s（3秒後に送った要求も 0.003s）
      </T>
      <T x={20} y={150} bold>
        proxy_buffering off
      </T>
      <Box x={20} y={164} w={150} h={44} lines={['Puma のスレッド', '書き終わるまで占有']} fs={11.5} fill="box5" subTone="danger" />
      <Arrow x1={170} y1={186} x2={278} y2={186} dashed />
      <Box x={280} y={160} w={230} h={52} lines={['Nginx', '受け取った分をそのまま送る']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={510} y1={186} x2={608} y2={186} dashed />
      <Box x={610} y={164} w={150} h={44} lines={['遅いクライアント', '200KB/s']} fs={11.5} fill="bg" subTone="muted" />
      <T x={20} y={234} fs={11} tone="muted" mono>
        3秒後: busy_threads=3 / 別の要求 /lab/info 200 8.569s（空きスレッドを待った）
      </T>
      <T x={20} y={268} fs={11} tone="muted">
        デモ：Puma 1ワーカー・3スレッド、64MB の応答を 200KB/s のクライアント3つで受け取る
      </T>
    </Svg>
  )
}

/* ---------- location を探す順（番号なし） ---------- */
function LocationSearchFigure() {
  const yes = (y: number) => (
    <>
      <Arrow x1={380} y1={y} x2={458} y2={y} />
      <T x={419} y={y - 12} anchor="middle" fs={11.5} tone="muted">
        はい
      </T>
    </>
  )
  const no = (y: number) => (
    <>
      <Arrow x1={200} y1={y} x2={200} y2={y + 22} accent />
      <T x={210} y={y + 11} fs={11.5} tone="muted">
        いいえ
      </T>
    </>
  )
  return (
    <Svg
      id="ch24-location-search"
      w={780}
      h={412}
      label="要求のパスに対して、まず接頭辞の location のうち最も長く一致するものを覚える。= の location が完全に一致すれば、その location を使って終わる。覚えた location に ^~ が付いていれば、正規表現を調べずにその location を使う。そうでなければ正規表現の location を書いた順に調べ、最初に一致したものを使う。1つも一致しなければ、覚えた接頭辞の location を使う。デモの /assets/application-8b441ae0.css は location / と location /assets/ に一致し、長いほうの /assets/ を覚える。デモの設定には =・^~・正規表現の location が無いので、location /assets/ が使われる"
    >
      <Box x={20} y={16} w={360} h={44} lines={['要求のパス', '例：/assets/application-8b441ae0.css']} fs={12.5} bold fill="bg" subTone="muted" />
      <Arrow x1={200} y1={60} x2={200} y2={82} accent />
      <Box x={20} y={84} w={360} h={44} lines={['接頭辞の location で最も長く一致するものを覚える', '例：/ と /assets/ が一致し、/assets/ を覚える']} fs={12.5} subTone="muted" />
      <Arrow x1={200} y1={128} x2={200} y2={150} accent />
      <Box x={20} y={152} w={360} h={40} lines="= の location が完全に一致したか" fs={12} fill="bg" />
      {yes(172)}
      <Box x={460} y={152} w={300} h={40} lines="その location を使う（ここで終わる）" fs={12} />
      {no(192)}
      <Box x={20} y={216} w={360} h={40} lines="覚えた location に ^~ が付いているか" fs={12} fill="bg" />
      {yes(236)}
      <Box x={460} y={216} w={300} h={40} lines="覚えた location を使う（正規表現は調べない）" fs={12} />
      {no(256)}
      <Box x={20} y={280} w={360} h={48} lines={['正規表現の location（~・~*）を', '書いた順に調べ、一致したものがあるか']} fs={12} fill="bg" />
      {yes(304)}
      <Box x={460} y={284} w={300} h={40} lines="最初に一致した location を使う" fs={12} />
      {no(328)}
      <Box x={20} y={352} w={360} h={44} lines={['覚えた接頭辞の location を使う', '例：location /assets/（X-Location: assets）']} fs={12.5} bold fill="box5" accent subTone="muted" />
      <T x={460} y={374} fs={11.5} tone="muted">
        デモの設定には =・^~・正規表現の location が無い
      </T>
    </Svg>
  )
}

/* ---------- 接続 1 の値を接続 2 のヘッダーで送る（番号なし） ---------- */
function HeaderRelayFigure() {
  const rows = [
    { y: 128, from: '接続の相手：172.29.0.1', header: 'X-Forwarded-For: 172.29.0.1', v: '← $proxy_add_x_forwarded_for' },
    { y: 152, from: 'Host: 127.0.0.1:8080', header: 'Host: 127.0.0.1', v: '← $host' },
    { y: 176, from: 'http で接続', header: 'X-Forwarded-Proto: http', v: '← $scheme' },
  ]
  const rails = [
    { y: 284, k: 'REMOTE_ADDR', v: 'Nginx のコンテナの IP' },
    { y: 306, k: 'request.remote_ip', v: '172.29.0.1' },
    { y: 328, k: 'request.url', v: 'http://127.0.0.1/lab/headers' },
  ]
  return (
    <Svg
      id="ch24-header-relay"
      w={780}
      h={356}
      label="ブラウザー（curl、172.29.0.1）から Nginx への接続 1 と、Nginx から Puma への接続 2 がある。接続 1 から Nginx が分かる値は、接続の相手 172.29.0.1、Host: 127.0.0.1:8080、http で接続したこと。Nginx はこれらを proxy_set_header で接続 2 のヘッダーに入れる。$proxy_add_x_forwarded_for で X-Forwarded-For: 172.29.0.1、$host でポート番号を除いた Host: 127.0.0.1、$scheme で X-Forwarded-Proto: http になる。Host を書かなければ、proxy_pass に書いた名前の app が送られる。Rails では REMOTE_ADDR が Nginx のコンテナの IP になるが、Nginx の IP は RemoteIp が信頼するプロキシの範囲なので、request.remote_ip は X-Forwarded-For から求めた 172.29.0.1 になる。request.url は http://127.0.0.1/lab/headers になる"
    >
      <Box x={20} y={16} w={200} h={44} lines={['ブラウザー（curl）', '172.29.0.1']} fs={12.5} bold fill="bg" subTone="muted" />
      <Box x={300} y={16} w={180} h={44} lines="Nginx" fs={12.5} bold />
      <Box x={580} y={16} w={180} h={44} lines="Puma・Rails" fs={12.5} bold />
      <Arrow x1={220} y1={38} x2={298} y2={38} />
      <T x={259} y={26} anchor="middle" fs={11.5} tone="muted">
        接続 1
      </T>
      <Arrow x1={480} y1={38} x2={578} y2={38} />
      <T x={529} y={26} anchor="middle" fs={11.5} tone="muted">
        接続 2
      </T>

      <Box x={20} y={84} w={230} h={108} fill="bg" />
      <T x={32} y={104} bold fs={12}>
        接続 1 から分かること
      </T>
      <Box x={330} y={84} w={430} h={132} fill="box4" />
      <T x={342} y={104} bold fs={12}>
        接続 2 で Puma に送るヘッダー
      </T>
      {rows.map((r) => (
        <g key={r.header}>
          <T x={32} y={r.y} fs={11.5} mono={r.from.startsWith('Host')}>
            {r.from}
          </T>
          <Arrow x1={250} y1={r.y} x2={328} y2={r.y} />
          <T x={342} y={r.y} fs={11.5} mono>
            {r.header}
          </T>
          <T x={548} y={r.y} fs={11.5} mono tone="muted">
            {r.v}
          </T>
        </g>
      ))}
      <T x={342} y={200} fs={11.5} tone="muted">
        Host を書かなければ Host: app（proxy_pass に書いた名前）
      </T>

      <Arrow x1={545} y1={216} x2={545} y2={240} />
      <Box x={330} y={242} w={430} h={100} fill="box5" />
      <T x={342} y={262} bold fs={12}>
        Rails で読める値
      </T>
      {rails.map((r) => (
        <g key={r.k}>
          <T x={342} y={r.y} fs={11.5} mono>
            {r.k}
          </T>
          <T x={482} y={r.y} fs={11.5} mono={!r.v.startsWith('Nginx')}>
            {r.v}
          </T>
        </g>
      ))}
      <T x={20} y={284} fs={11.5} tone="muted">
        Nginx の IP は RemoteIp が信頼する
      </T>
      <T x={20} y={306} fs={11.5} tone="muted">
        プロキシの範囲なので、remote_ip は
      </T>
      <T x={20} y={328} fs={11.5} tone="muted">
        X-Forwarded-For から求める
      </T>
    </Svg>
  )
}

/* ---------- /cable の要求が通る検査（番号なし） ---------- */
function CableCheckFigure() {
  return (
    <Svg
      id="ch24-cable-check"
      w={780}
      h={376}
      label="ブラウザーは GET /cable の要求に Upgrade: websocket と Connection: Upgrade、Origin: http://localhost:8080 を付けて送る。Nginx の location /cable は、Upgrade と Connection を proxy_set_header で書いたときだけ Puma に送る。ActionCable はまず Upgrade と Connection が届いたかを調べ、届かなければ Failed to upgrade to WebSocket をログに書いて 404 を返す（Upgrade の設定なし）。届いていれば、Origin と Host が同じかを調べる。Host を $host にすると Host は localhost になり、Origin の localhost:8080 と一致しないので、Request origin not allowed をログに書いて 404 を返す。$http_host なら Host は localhost:8080 で一致し、Successfully upgraded to WebSocket をログに書いて接続できる"
    >
      <Box x={20} y={16} w={380} h={62} lines={['ブラウザー：GET /cable', 'Upgrade: websocket・Connection: Upgrade', 'Origin: http://localhost:8080']} fs={12.5} bold fill="bg" subTone="muted" />
      <Arrow x1={210} y1={78} x2={210} y2={98} accent />
      <Box x={20} y={100} w={380} h={62} lines={['Nginx（location /cable）', 'Upgrade・Connection は', 'proxy_set_header で書いたときだけ送る']} fs={12.5} bold subTone="muted" />
      <Arrow x1={210} y1={162} x2={210} y2={182} accent />
      <Box x={20} y={184} w={380} h={40} lines="ActionCable：Upgrade・Connection が届いたか" fs={12} fill="bg" />
      <Arrow x1={400} y1={204} x2={478} y2={204} />
      <T x={439} y={192} anchor="middle" fs={11.5} tone="muted">
        いいえ
      </T>
      <Box x={480} y={180} w={280} h={48} lines={['404（Upgrade の設定なし）', 'Failed to upgrade to WebSocket']} fs={12.5} fill="bg" subTone="danger" />
      <Arrow x1={210} y1={224} x2={210} y2={246} accent />
      <T x={220} y={235} fs={11.5} tone="muted">
        はい
      </T>
      <Box x={20} y={248} w={380} h={48} lines={['Origin と Host が同じか', '$host：localhost／$http_host：localhost:8080']} fs={12.5} fill="bg" subTone="muted" />
      <Arrow x1={400} y1={272} x2={478} y2={272} />
      <T x={439} y={260} anchor="middle" fs={11.5} tone="muted">
        いいえ
      </T>
      <Box x={480} y={248} w={280} h={48} lines={['404（Host $host のとき）', 'Request origin not allowed']} fs={12.5} fill="bg" subTone="danger" />
      <Arrow x1={210} y1={296} x2={210} y2={318} accent />
      <T x={220} y={307} fs={11.5} tone="muted">
        はい
      </T>
      <Box x={20} y={320} w={380} h={44} lines={['接続できた（Host $http_host のとき）', 'Successfully upgraded to WebSocket']} fs={12.5} bold fill="box5" accent subTone="muted" />
    </Svg>
  )
}

const ch24: Chapter = {
  number: 24,
  part: 5,
  title: 'Nginx のリバースプロキシ設定',
  summary:
    '同じサイトでも、CSS は Nginx がファイルを読み出して返し、記事ページは Puma に転送して Rails が作る構成があります。2つの URL を設定とログに当てはめ、どこから応答が返るかをたどります。',
  goals: [
    '要求のパスから使われる location を選び、ファイルを返すか Puma へ転送するかを追える',
    'Puma に伝えるホスト名や元の接続方式と、転送時に設定するヘッダーを対応付けられる',
    '大きな応答やアップロードを例に、Nginx が一時保存するデータと、待ち時間への影響を説明できる',
  ],
  prerequisites: [16, 23],
  sections: [
    {
      id: 'web-server',
      title: 'Web サーバーと HTTP の要求・応答',
      body: (
        <>
          <p>
            ブラウザーでページを開くと、ブラウザーはサーバーのコンピューターに HTTP の要求（リクエスト）を送り、サーバーは要求に応じた応答（レスポンス）を返します。HTTP は要求と応答をどんな形式で書いて送るかを決めた通信の取り決めです。要求を受け取って応答を返すプログラムを
            <Term en="web server">Web サーバー</Term>と呼びます。Nginx（エンジンエックス）は Web サーバーの1つで、指定したディレクトリのファイルを返すことも、受け取った要求を別のサーバーに転送することもできます
            <Ref n={1} />。
          </p>
          <p>
            Nginx 1.30.6 を Docker で起動して、ファイルを返させました。Docker はプログラムと動かすのに必要なファイルをまとめたもの（イメージ）から、ほかのプログラムと分けた環境（コンテナ）でプログラムを動かす道具です。Nginx
            の公式イメージはコンテナの中の /usr/share/nginx/html にあるファイルを返す設定になっています。<code>-p 127.0.0.1:8080:80</code>{' '}
            は手元のマシンのポート 8080 への接続をコンテナのポート 80 に渡す指定、<code>-v</code> は手元の site ディレクトリをコンテナの中の /usr/share/nginx/html として見せる指定です
            <Ref n={14} />。ポートは1台のコンピューターで動く複数のプログラムを区別する番号で、Nginx はポート 80 で要求を待ちます。
          </p>
          <Code
            lang="text"
            title="hello.html を置いて Nginx を起動する"
            code={`
$ mkdir site
$ echo '<h1>Hello from Nginx</h1>' > site/hello.html
$ docker run -d --name ch24-web -p 127.0.0.1:8080:80 -v "$PWD/site:/usr/share/nginx/html:ro" nginx:1.30.6
$ curl -sv http://127.0.0.1:8080/hello.html
`}
          />
          <Code
            lang="text"
            title="curl の出力（接続の経過を表す * の行は省略）"
            code={`
> GET /hello.html HTTP/1.1
> Host: 127.0.0.1:8080
> User-Agent: curl/8.23.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Server: nginx/1.30.6
< Date: Mon, 16 Nov 2026 07:11:43 GMT
< Content-Type: text/html
< Content-Length: 26
< Last-Modified: Mon, 16 Nov 2026 07:11:36 GMT
< Connection: keep-alive
< ETag: "6afaaca8-1a"
< Accept-Ranges: bytes
<
<h1>Hello from Nginx</h1>
`}
          />
          <p>
            127.0.0.1 はコマンドを実行しているマシン自身を指す IP アドレス（ネットワークの中でコンピューターを区別する番号。<ChapterLink n={25} section="ip-port" />
            ）です。curl の <code>-v</code> は送った要求の行に「&gt;」、受け取った応答の行に「&lt;」を付けて表示します（図 27-1）。
          </p>
          <p>
            要求の1行目はメソッド（GET はデータを取り出す要求）、パス（/hello.html）、HTTP のバージョンです。2行目からはヘッダーで、「名前: 値」の形で要求に情報を添えます。Host は接続先のホスト名とポート番号、User-Agent
            は要求を送ったプログラム、Accept は受け取れるデータの種類（<code>*/*</code> はすべて）です。空の行でヘッダーが終わります。GET の要求には本文がありませんが、フォームの内容を POST
            で送るときは、空の行の後に本文が続きます
            <Ref n={10} />。
          </p>
          <p>
            応答の1行目にある 200 は、要求が成功したことを表す状態コードです（状態コードは <ChapterLink n={25} section="status" /> で詳しく扱います）
            <Ref n={11} />。ヘッダーの Server は応答を返したプログラム、Content-Type は本文の種類（text/html は HTML）、Content-Length は本文のバイト数です。空の行の後が本文で、hello.html
            の中身がそのまま届きました。
          </p>
          <p>
            無いファイル（/nothing.html）も要求してから、Nginx のログを見ました。公式イメージの Nginx はログを標準出力（コンテナの外から <code>docker logs</code> で読める出力）に書きます。
          </p>
          <Code
            lang="text"
            title="無いファイルを要求したときのログ（起動時のログは省略）"
            code={`
$ curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:8080/nothing.html
404
$ docker logs ch24-web
172.17.0.1 - - [16/Nov/2026:07:11:43 +0000] "GET /hello.html HTTP/1.1" 200 26 "-" "curl/8.23.0" "-"
2026/11/16 07:11:43 [error] 29#29: *2 open() "/usr/share/nginx/html/nothing.html" failed (2: No such file or directory), client: 172.17.0.1, server: localhost, request: "GET /nothing.html HTTP/1.1", host: "127.0.0.1:8080"
172.17.0.1 - - [16/Nov/2026:07:11:43 +0000] "GET /nothing.html HTTP/1.1" 404 153 "-" "curl/8.23.0" "-"
`}
          />
          <p>
            1行目と3行目はアクセスログ（access.log）の行です。要求ごとに、接続の相手の IP アドレス、時刻、要求の1行目、状態コード、本文のバイト数、User-Agent を1行に書きます。2行目はエラーログ（error.log）の行で、
            /usr/share/nginx/html/nothing.html が無い（No such file or directory）ので、404（見つからない）を返したことがわかります。
          </p>
          <p>
            hello.html のように、要求のたびに同じ内容を返すファイルを静的ファイルと呼びます。静的ファイルなら、Nginx はファイルを読むだけで応答を作れます。記事の一覧のように、要求のたびにデータベースを読んで HTML
            を作るページは、Rails でなければ作れません。そのようなページの要求は、次の節のように Nginx から Puma に転送します。
          </p>
          <Figure n="27-1" title="HTTP の要求と応答" caption="curl -sv で hello.html を要求したときの出力（Nginx 1.30.6）をもとにした図。">
            <MessageFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'reverse-proxy',
      title: 'リバースプロキシとして Puma に転送する',
      body: (
        <>
          <p>
            <ChapterLink n={23} section="app-server" /> で見たとおり、Rails のアプリケーションでは、Puma がポート（ここでは 3000）で要求を待ち、Rails を呼んで応答を返します。Puma の前に Nginx
            を置くと、ブラウザーの要求はまず Nginx に届きます。Nginx は同じ内容の要求を Puma に送り、Puma の応答を受け取ってブラウザーに返します。このように、受け取った要求を後ろのサーバーに転送し、そのサーバーの応答をクライアント（要求を送った側）に返すサーバーを
            <Term en="reverse proxy">リバースプロキシ</Term>と呼びます
            <Ref n={1} />。
          </p>
          <p>
            本番環境の設定で動かしている Puma（ホスト名 puma、ポート 3000）に転送する設定を、conf.d/default.conf に書きました。Nginx のコンテナは Puma のコンテナと同じ Docker のネットワーク（rbdemo）につなぎ、puma
            という名前で Puma に接続できるようにしています。
          </p>
          <Code
            lang="nginx"
            title="conf.d/default.conf（Puma に転送する最小の設定）"
            code={`
server {
    listen 80;

    location / {
        proxy_pass http://puma:3000;
    }
}
`}
          />
          <p>
            <code>listen 80</code> はポート 80 で要求を待つこと、<code>location /</code> はパスが / で始まるすべての要求をこのブロックの設定で処理すること、<code>proxy_pass</code>{' '}
            は転送先の URL を表します。書き方の決まりは次の節で扱います。この設定で Nginx を起動し、/articles を要求しました。curl の <code>-D -</code> は応答のヘッダーを表示する指定、<code>-o /dev/null</code>{' '}
            は本文を捨てる指定です。
          </p>
          <Code
            lang="text"
            title="Nginx を通して /articles を要求する（応答のヘッダーは一部を省略）"
            code={`
$ docker run -d --name ch24-nginx --network rbdemo -p 127.0.0.1:8080:80 -v "$PWD/conf.d:/etc/nginx/conf.d:ro" nginx:1.30.6
$ curl -s -D - -o /dev/null http://127.0.0.1:8080/articles
HTTP/1.1 200 OK
Server: nginx/1.30.6
Content-Type: text/html; charset=utf-8
Content-Length: 2034
x-request-id: 29c5c0d9-4e47-4186-9e11-03624c6a503d
x-runtime: 0.113286
`}
          />
          <p>
            Server は Nginx が付けたヘッダーで、x-request-id（要求ごとに付ける ID）と x-runtime（Rails の処理にかかった秒数）は Rails が付けたヘッダーです。Nginx が Puma
            から受け取った応答を返したことがわかります。Nginx と Rails のログも比べました。
          </p>
          <Code
            lang="text"
            title="同じ要求の2つのログ（Rails のログは一部を省略）"
            code={`
（Nginx のアクセスログ）
172.29.0.1 - - [16/Nov/2026:07:11:56 +0000] "GET /articles HTTP/1.1" 200 2034 "-" "curl/8.23.0" "-"

（Rails のログ）
[29c5c0d9-4e47-4186-9e11-03624c6a503d] Started GET "/articles" for 172.29.0.15 at 2026-11-16 07:11:56 +0000
[29c5c0d9-4e47-4186-9e11-03624c6a503d] Processing by ArticlesController#index as */*
[29c5c0d9-4e47-4186-9e11-03624c6a503d] Completed 200 OK in 100ms (Views: 53.0ms | ActiveRecord: 14.0ms (1 query, 0 cached) | GC: 5.3ms)
`}
          />
          <p>
            Nginx のログの相手は curl を実行したマシン（172.29.0.1）ですが、Rails のログの <code>for 172.29.0.15</code> は Nginx のコンテナの IP アドレスです。ブラウザーと Nginx の間、Nginx と
            Puma の間で別々の接続が作られ、Puma から見ると要求を送ってきたのは Nginx だからです（図 27-2）。元のブラウザーの IP アドレスを Rails に伝える方法は「proxy_set_header」の節で扱います。
          </p>
          <p>
            Puma は単独でも要求を受け付けられます。Puma の README もリバースプロキシなしで運用できると書いています
            <Ref n={9} />。Rails 8.1 の rails new が作る Dockerfile は、Nginx ではなく Thruster というプロキシを Puma の前で動かします（<ChapterLink n={29} section="kamal-thruster" />
            ）。この章の構成で Puma の前に Nginx を置くのは、次のことを Nginx に任せるためです。
          </p>
          <ul>
            <li>画像・CSS・JavaScript などの静的ファイルを、Rails を通さずに返す（「静的ファイルとアセット」の節）</li>
            <li>回線の遅いブラウザーへの応答の送信を Nginx が引き受け、Puma のスレッドを早く空ける（「バッファリングと Puma のスレッド」の節）</li>
            <li>大きすぎる要求を、Puma に届く前に断る（「client_max_body_size」の節）</li>
            <li>パスごとに、ファイルを返すか Puma に転送するかを決める（「location の選択」の節）</li>
          </ul>
          <Figure n="27-2" title="リバースプロキシの流れ" caption="最小の設定で /articles を要求したときの実測（IP アドレスはデモの値）と、後の節で加える静的ファイルの配信をもとにした模式図。">
            <ProxyFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'config-syntax',
      title: '設定ファイルの書き方',
      body: (
        <>
          <p>
            前の節の conf.d/default.conf を例に、Nginx の設定ファイルの書き方を確かめます。設定ファイルにはディレクティブ（Nginx への指示）を並べます。ディレクティブには2種類あります。単純なディレクティブは名前と値を空白で区切って並べ、セミコロン（;）で終えます。ブロックのディレクティブはセミコロンの代わりに波括弧（{'{'}{' '}と{' '}{'}'}）で別のディレクティブを囲みます
            <Ref n={1} />。
          </p>
          <Code
            lang="nginx"
            title="conf.d/default.conf の各行"
            code={`
server {                            # ブロック：1つの Web サーバーの設定
    listen 80;                      # 単純なディレクティブ：ポート 80 で待つ

    location / {                    # ブロック：パスが / で始まる要求の処理
        proxy_pass http://puma:3000;   # 単純なディレクティブ：転送先
    }
}
`}
          />
          <p>
            中に別のディレクティブを書けるブロックをコンテキストと呼びます。events・http・server・location がその例です。どのブロックにも入っていない位置は main コンテキストと呼び、events と http は main
            に、server は http の中に、location は server の中に書きます。# から行の終わりまではコメントです
            <Ref n={1} />。
          </p>
          <p>
            conf.d/default.conf には http ブロックがありませんが、Nginx はこのファイルの内容を http の中に書いたものとして読みます。公式イメージの /etc/nginx/nginx.conf の http ブロックに、conf.d
            のファイルを読み込む include の行があるからです。include は指定したファイルの内容をその位置に書いたものとして扱うディレクティブです
            <Ref n={13} />。<code>docker exec</code> は動いているコンテナの中でコマンドを実行します。
          </p>
          <Code
            lang="text"
            code={`
$ docker exec ch24-nginx grep -n include /etc/nginx/nginx.conf
15:    include       /etc/nginx/mime.types;
31:    include /etc/nginx/conf.d/*.conf;
`}
          />
          <p>
            設定ファイルを書き換えても、動いている Nginx にはすぐには反映されません。<code>nginx -t</code> で誤りが無いかを確かめてから、<code>nginx -s reload</code> で読み込ませます
            <Ref n={12} />。proxy_pass の行の末尾のセミコロンを消して確かめました。
          </p>
          <Code
            lang="text"
            title="セミコロンを消して確かめる（日時の付いた同じ内容の行は省略）"
            code={`
（5行目の末尾のセミコロンを消した状態）
$ docker exec ch24-nginx nginx -t
nginx: [emerg] unexpected "}" in /etc/nginx/conf.d/default.conf:6
nginx: configuration file /etc/nginx/nginx.conf test failed
$ docker exec ch24-nginx nginx -s reload
nginx: [emerg] unexpected "}" in /etc/nginx/conf.d/default.conf:6
$ curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:8080/articles
200

（セミコロンを戻した後）
$ docker exec ch24-nginx nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
$ docker exec ch24-nginx nginx -s reload
`}
          />
          <p>
            セミコロンが無いので、Nginx は次の行の {'}'} までを proxy_pass の値の続きとして読もうとし、6行目の {'}'}{' '}
            で誤りと判断しました。報告される行が直す行（5行目）の次の行になることがあります。誤りがあると <code>nginx -s reload</code> も同じ誤りを表示して止まり、動いている Nginx は前の設定のまま要求を処理し続けました（状態コード
            200）。説明書によると、reload の合図を受けた Nginx も新しい設定を確かめ、使えない設定なら古い設定のまま動き続けます
            <Ref n={1} />。
          </p>
          <p>
            Nginx の設定はこのように main・events・http・server・location のコンテキストを入れ子にして組み立てます。次の節では、Nginx がどんなプロセスで動くかを確かめてから、公式イメージの nginx.conf
            の全体と、この章で使う Rails のための設定を見ます。
          </p>
        </>
      ),
    },
    {
      id: 'process-config',
      title: 'プロセスと設定の階層',
      body: (
        <>
          <p>
            Nginx は1つのマスターのプロセスと複数のワーカーのプロセスで動きます。マスターは設定を読んでワーカーを管理し、要求を処理するのはワーカーです
            <Ref n={1} />。Puma と違い、1つのワーカーがイベント駆動で多数の接続を同時に扱います。Docker の公式イメージ（nginx:1.30.6）で起動して、プロセスを確かめました。
          </p>
          <Code
            lang="text"
            code={`
nginx: master process nginx -g daemon off;
nginx: worker process
nginx: worker process
nginx: worker process
nginx: worker process          ← worker_processes auto（CPU 4 つ）
`}
          />
          <p>公式イメージの /etc/nginx/nginx.conf は次のとおりです（コメントを除く）。</p>
          <Code
            lang="nginx"
            title="/etc/nginx/nginx.conf（nginx:1.30.6 のイメージ）"
            code={`
user  nginx;
worker_processes  auto;
error_log  /var/log/nginx/error.log notice;
pid        /run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;
    sendfile        on;
    keepalive_timeout  65;
    include /etc/nginx/conf.d/*.conf;
}
`}
          />
          <p>
            設定は、一番外側（main）、<code>events</code>、<code>http</code>、その中の <code>server</code>、さらにその中の <code>location</code> という階層になっています（図 27-3）。Rails のための設定は、conf.d に置いた次のファイルに書きました。この章の実測はすべてこの設定（と一部を変えたもの）で行っています。
          </p>
          <Code
            lang="nginx"
            title="conf.d/default.conf（デモ）"
            code={`
upstream app {
    server rbdemo-puma:3000;
}

server {
    listen 80;
    server_name _;
    root /app/public;

    # ダイジェスト付きのアセットは Nginx が直接返す
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        gzip_static on;
        try_files $uri =404;
    }

    # ActionCable の WebSocket
    location /cable {
        proxy_pass http://app;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # public のファイルがあれば返し、無ければ Rails へ
    location / {
        try_files $uri @app;
    }

    location @app {
        proxy_pass http://app;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-Start "t=\${msec}";
    }
}
`}
          />
          <p>
            下の階層は上の階層の設定を引き継ぎます。ただし、<code>proxy_set_header</code> は「その階層に proxy_set_header が1つも無い場合に限り」上の階層の値を引き継ぎます
            <Ref n={2} />（add_header も同じです）。server に2行、location に1行だけ書いた設定で確かめました。
          </p>
          <Code
            lang="text"
            code={`
server {
    proxy_set_header X-Forwarded-Proto $scheme;               # server のレベル
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    location /lab/headers { proxy_pass http://app; proxy_set_header Host $host; }
    location / { proxy_pass http://app; }
}

== /lab/headers（location で Host だけを書いた）
HTTP_HOST="127.0.0.1"   HTTP_X_FORWARDED_FOR=nil   HTTP_X_FORWARDED_PROTO=nil
== /lab/echo（location / では何も書いていない）
HTTP_HOST="app"         HTTP_X_FORWARDED_FOR="172.29.0.1"   HTTP_X_FORWARDED_PROTO="http"
`}
          />
          <p>
            location で Host を1行書いただけで、server の X-Forwarded-For と X-Forwarded-Proto が送られなくなりました。location に proxy_set_header を書くときは、必要なものをすべて書き直します。
          </p>
          <Figure n="27-3" title="nginx.conf の階層" caption="nginx:1.30.6 のイメージの nginx.conf とデモの conf.d/default.conf をもとにした図。">
            <HierarchyFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'location',
      title: 'location の選択',
      body: (
        <>
          <p>Nginx の説明書によると、要求に合う location は次の順に探されます。</p>
          <ul>
            <li>
              文字列（接頭辞）の location のうち、最も長く一致するものを選んで覚えておく。<code>=</code>（完全一致）が一致すればそこで終わり、<code>^~</code>{' '}
              が付いたものが最長の一致なら正規表現を調べない
            </li>
            <li>
              正規表現の location（<code>~</code>・<code>~*</code>）を設定ファイルに書いた順に調べ、最初に一致したものを使う
            </li>
            <li>正規表現が1つも一致しなければ、覚えておいた接頭辞の location を使う</li>
          </ul>
          <p>次の図は、この順を上から下へ並べたものです。左の列を上からたどり、「はい」になった所で右の箱の location に決まります。</p>
          <Figure title="location を探す順" caption="Nginx の説明書の手順をもとにした模式図。太い青の矢印は、デモの設定で /assets/application-8b441ae0.css を要求したときの経路です。">
            <LocationSearchFigure />
          </Figure>
          <p>
            正規表現を使わなければ、「最も長く一致する接頭辞」で決まります。デモの設定で、要求ごとに選ばれた location をヘッダー（<code>X-Location</code>）に出して確かめました
            <Ref n={3} />。
          </p>
          <Code
            lang="text"
            code={`
/assets/application-8b441ae0.css   HTTP/1.1 200 OK  X-Location: assets  Cache-Control: public, max-age=31536000, immutable
/assets/nothing.css                HTTP/1.1 404 Not Found  X-Location: assets
/robots.txt                        HTTP/1.1 200 OK  X-Location: root
/up                                HTTP/1.1 200 OK  X-Location: app
/articles/1                        HTTP/1.1 200 OK  X-Location: app
/cable                             HTTP/1.1 404 Not Found  X-Location: cable   ← WebSocket でない GET なので Rails が 404
`}
          />
          <p>
            同じ 200 でも、<code>/robots.txt</code> の <code>X-Location: root</code> と <code>/articles/1</code> の <code>X-Location: app</code> は意味が違います。<code>try_files $uri @app</code> の <code>$uri</code> は要求のパスです。Nginx は <code>root</code> に指定したディレクトリの下でそのファイルを探します。robots.txt は見つかるので Nginx が返します。記事のパスにはファイルがないので、最後の <code>@app</code> に進み、Puma に要求を送ります（図 27-4）。
          </p>
          <p>
            <code>/assets/nothing.css</code> も存在しないファイルですが、この場合は <code>location /assets/</code> が選ばれます。そこの <code>try_files $uri =404</code> は、見つからなければ Nginx から 404 を返す指定です。配備の前後で古い HTML がすでにない CSS を参照したときも、この要求は Rails まで届きません。
          </p>
          <Figure n="27-4" title="要求の振り分け" caption="デモの設定（Nginx 1.30.6）で、要求ごとに選ばれた location を X-Location ヘッダーで確かめた結果。">
            <RoutingFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'upstream',
      title: 'upstream と proxy_pass',
      body: (
        <>
          <p>
            <code>upstream app</code> は Puma のアドレスに名前を付け、<code>proxy_pass http://app;</code> がそこへ要求を送ります。デモの Nginx と Puma は別のコンテナなので TCP で接続しました。同じサーバーで動かす場合は、Puma
            を Unix ソケットで待ち受けさせ（<code>bind "unix:///app/tmp/sockets/puma.sock"</code>）、<code>server unix:/app/tmp/sockets/puma.sock;</code> と書く構成もよく使われます。Puma
            の説明書の Nginx の設定例も Unix ソケットを使っています
            <Ref n={4} />。
          </p>
          <p>
            Nginx から Puma への接続が使い回されているかを、Puma で見た相手のポート番号で確かめました。Nginx 1.30.6 の既定の設定のまま、12回要求しています。
          </p>
          <Code
            lang="text"
            code={`
      9 peer_port=36990        ← 同じ接続を使い回している
      1 peer_port=36994
      1 peer_port=37006
      1 peer_port=37008        ← 最初の数回は、Nginx のワーカーごとに新しい接続を作る
SERVER_PROTOCOL="HTTP/1.1"
`}
          />
          <p>
            説明書によると、Nginx 1.29.7 から <code>proxy_http_version</code> の既定値が 1.0 から 1.1 に変わり、upstream への接続を保持する <code>keepalive</code>{' '}
            も既定で有効（32本）になりました
            <Ref n={2} />
            <Ref n={5} />。Nginx のワーカーは4つあり、それぞれが自分の接続を持つので、最初の数回は新しい接続が作られています。
          </p>
          <Callout kind="warn" title="Nginx 1.29.7 より前の場合">
            <p>
              1.29.7 より前の Nginx では、既定のまま設定すると HTTP/1.0 で接続し、要求ごとに接続を作って閉じます。接続を使い回すには、upstream に <code>keepalive 32;</code>、location に{' '}
              <code>proxy_http_version 1.1;</code> と <code>proxy_set_header Connection "";</code> を書きます。業務の環境では <code>nginx -v</code> でバージョンを確かめ、そのバージョンの説明書の既定値で判断します。
            </p>
          </Callout>
          <p>
            Ruby の更新で新旧の Puma を別々に起動したときは、この <code>upstream</code> の転送先を切り替えます。新版を確認してから設定を再読み込みする手順は
            <ChapterLink n={23} section="ruby-upgrade">Ruby 更新時の Puma とトラフィックの切り替え</ChapterLink>で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'headers',
      title: 'proxy_set_header',
      body: (
        <>
          <p>
            Nginx は元の要求の Host ヘッダーをそのまま転送しません。既定では <code>proxy_set_header Host $proxy_host;</code>、つまり proxy_pass に書いた名前（ここでは <code>app</code>
            ）を送ります
            <Ref n={2} />。Rails の側で受け取った値を、Puma のアクションで表示しました。
          </p>
          <Code
            lang="text"
            code={`
== Host を指定しない
HTTP_HOST="app"          request.url=http://app/lab/headers
== proxy_set_header Host $host;
HTTP_HOST="127.0.0.1"    request.url=http://127.0.0.1/lab/headers
== Puma に直接（比較用）
HTTP_HOST="127.0.0.1:3200"
`}
          />
          <p>
            Host が <code>app</code> のままだと、<code>redirect_to</code> や <code>*_url</code> のヘルパーが作る URL が http://app/… になり、本番環境で <code>config.hosts</code>{' '}
            を設定していれば HostAuthorization に 403（アクセスを拒否したことを表す状態コード）で拒否されます（<ChapterLink n={21} section="host-ssl-csp" />
            ）。<code>$host</code> は要求の Host ヘッダーからポート番号を除いた値で、<code>$http_host</code> は Host ヘッダーそのままです。デモはポート 8080 で受けているので、$host
            ではポート番号が落ちました。通常の 80・443 番で公開する場合は、どちらでも同じになります。後で見る WebSocket では、この違いが問題になります。
          </p>
          <p>その他のヘッダーは Rails の次の部分に使われます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>設定</th>
                  <th>Rails の側</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>X-Forwarded-For $proxy_add_x_forwarded_for</code>
                  </td>
                  <td>
                    <code>request.remote_ip</code>（ActionDispatch::RemoteIp）。Nginx が受け取った X-Forwarded-For の後ろに、接続してきた相手の IP を足す。ロードバランサーがある場合は<ChapterLink n={25} />
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>X-Forwarded-Proto $scheme</code>
                  </td>
                  <td>
                    <code>request.ssl?</code>・<code>request.url</code> のスキーム。force_ssl のリダイレクトと CSRF の Origin の検査に使われる
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>X-Request-Start "t=$&#123;msec&#125;"</code>
                  </td>
                  <td>Nginx が要求を受け取った時刻。Puma の説明書は、これと Rails が処理を始めた時刻の差で、スレッドの空きを待った時間を計ることを勧めている</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            デモでは <code>HTTP_X_FORWARDED_FOR="172.29.0.1"</code>、<code>HTTP_X_REQUEST_START="t=1794394142.962"</code> が届き、<code>request.remote_ip</code>{' '}
            は Nginx のコンテナの IP（REMOTE_ADDR）ではなく、ブラウザー側の IP（172.29.0.1）になりました。Nginx のアドレスが RemoteIp の信頼するプロキシ（プライベートな IP アドレス。会社や家庭の中のネットワークで使う範囲のアドレスで、<ChapterLink n={25} section="ip-port" /> で扱います）に含まれるからです。
          </p>
          <p>
            次の図は、接続 1 から分かる値が、接続 2 のどのヘッダーに入って Rails に届くかを、デモの値で並べたものです。中段の左の箱の各行から、右の箱の同じ高さの行へ矢印が向いています。
          </p>
          <Figure
            title="接続 1 の値を接続 2 のヘッダーで送る"
            caption="この節と「プロセスと設定の階層」の節の実測の値をもとにした模式図。中段の矢印は、Nginx が左の値を右のヘッダーに入れることを表します。X-Request-Start は省略しました。"
          >
            <HeaderRelayFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'static',
      title: '静的ファイルとアセット',
      body: (
        <>
          <p>
            assets:precompile で public/assets に出力したファイル（<ChapterLink n={16} section="assets" />
            ）は、Nginx が直接返します。デモで /assets/ のファイルを要求したとき、Puma のログに /assets/ の要求は1件もありませんでした。ファイル名にダイジェストが入っているので、内容が変われば URL
            も変わります。そのため <code>Cache-Control: public, max-age=31536000, immutable</code> で、ブラウザーに1年間保存させても問題ありません。
          </p>
          <p>
            <code>gzip_static on</code> は、要求されたファイルの隣に .gz のファイルがあれば、それを Content-Encoding: gzip で返す設定です
            <Ref n={6} />。デモで確かめました。
          </p>
          <Code
            lang="text"
            code={`
$ ls public/assets | grep -c '\\.gz$'
0                                              ← Propshaft は .gz を作らない
GET /assets/turbo.min-9fd88cd5.js（Accept-Encoding: gzip） → Content-Length: 105579（圧縮なし）

$ gzip -k -9 public/assets/turbo.min-9fd88cd5.js
GET /assets/turbo.min-9fd88cd5.js（Accept-Encoding: gzip） → Content-Length: 28542  Content-Encoding: gzip
`}
          />
          <p>
            Propshaft は圧縮しない（<ChapterLink n={16} section="assets" />
            ）ので、gzip_static を書いただけでは何も変わりません。デプロイの手順で .gz を作るか、Nginx の <code>gzip on;</code> と <code>gzip_types</code>{' '}
            で要求のたびに圧縮するか、前段の CDN（利用者に近い場所に置いたサーバーからファイルを配信するサービス）に圧縮させます。Sprockets は、README によると既定で CSS や JavaScript の .gz も作るので<Ref n={8} />、Sprockets のアプリケーションでは gzip_static がそのまま効きます。
          </p>
        </>
      ),
    },
    {
      id: 'buffering',
      title: 'バッファリングと Puma のスレッド',
      body: (
        <>
          <p>
            Nginx の <code>proxy_buffering</code> は、Puma が返した応答を一時保存する設定です（既定は on）。たとえば利用者が大きなファイルを受信中でも、Puma が Nginx に渡し切れば、そのスレッドは別の記事を表示できます。<Ref n={2} />
          </p>
          <p>
            Puma をワーカー1・スレッド3 にして、64MB の応答を 200KB/s で受け取るクライアントを3つ動かし、3秒ごとに別の要求（/lab/info）の時間を測りました（Docker のネットワークの中から実行）。
          </p>
          <Code
            lang="text"
            code={`
== proxy_buffering on（既定）
3秒後: Puma busy_threads=3 backlog=0 / 別の要求 /lab/info 200 0.003084s
6秒後: Puma busy_threads=0 backlog=0 / 別の要求 /lab/info 200 0.002463s
9秒後: Puma busy_threads=0 backlog=0 / 別の要求 /lab/info 200 0.002536s
== proxy_buffering off
3秒後: Puma busy_threads=3 backlog=0 / 別の要求 /lab/info 200 8.568964s
6秒後: Puma busy_threads=2 backlog=0 / 別の要求 /lab/info 200 0.003191s
9秒後: Puma busy_threads=2 backlog=0 / 別の要求 /lab/info 200 0.006094s
`}
          />
          <p>
            Puma の統計は数秒おきに更新されるので、少し遅れて表示されます。buffering on では、3つの大きな応答を Nginx がすぐに受け取ったので、6秒後にはスレッドがすべて空き、別の要求もすぐに処理されました。off
            では3つのスレッドが応答の書き込みでふさがり、3秒後に送った要求は空きを 8.6 秒待ちました（図 27-5）。その後スレッドが1つ空いた理由は確かめていませんが、残りの2つは書き込みを続けています。
          </p>
          <p>
            反対向きの転送を扱うのが <code>proxy_request_buffering</code> です。既定の on では、画像のアップロードなどでブラウザーから届く要求の本文を Nginx が受け取り終えてから Puma に送ります。<code>request</code> が付くほうはブラウザーから送るデータ、付かないほうは Rails が返すデータに適用されます。
          </p>
          <p>
            <code>ActionController::Live</code> や Server-Sent Events のように少しずつ送る応答は、一時保存すると、途中のデータがブラウザーにすぐには届かないことがあります。その応答だけ Rails で{' '}
            <code>X-Accel-Buffering: no</code> のヘッダーを付けると、Nginx はその応答のバッファリングをやめます
            <Ref n={2} />。
          </p>
          <Figure n="27-5" title="バッファリングの有無" caption="Nginx 1.30.6・Puma 8.0.2（1ワーカー・3スレッド）での実測をもとにした模式図。">
            <BufferFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'body-size',
      title: 'client_max_body_size',
      body: (
        <>
          <p>
            <code>client_max_body_size</code> は要求の本文の上限で、既定値は 1m（1MB）です
            <Ref n={3} />。2MB の本文を POST しました。
          </p>
          <Code
            lang="text"
            code={`
$ curl -X POST --data-binary @2mb.bin http://127.0.0.1:8080/lab/headers
413
<title>413 Request Entity Too Large

（Nginx の error.log）
[error] 21#21: *2 client intended to send too large body: 2097152 bytes, client: 172.29.0.1, server: _, request: "POST /lab/headers HTTP/1.1", host: "127.0.0.1:8080"
`}
          />
          <p>
            Nginx が 413 を返し、Rails には要求が届いていません。Rails のログに何も出ないので、画像のアップロードが「たまに失敗する」ときは Nginx の error.log を確かめます。ファイルをアップロードする画面があるなら、上限をその用途に合わせて上げるか、ActiveStorage の直接アップロード（
            <ChapterLink n={19} section="direct-upload" />
            ）で Nginx を通さないようにします。
          </p>
        </>
      ),
    },
    {
      id: 'websocket',
      title: 'WebSocket のプロキシ',
      body: (
        <>
          <p>
            WebSocket は HTTP/1.1 の Upgrade の仕組みで接続を切り替えます。Upgrade と Connection は隣の相手との間だけで意味を持つヘッダー（<Term en="hop-by-hop header">ホップバイホップのヘッダー</Term>）なので、Nginx はクライアントから受け取っても Puma
            に転送しません。説明書は、次のように明示的に設定するよう書いています
            <Ref n={7} />。
          </p>
          <Code
            lang="nginx"
            title="nginx.org の WebSocket proxying の例"
            code={`
location /chat/ {
    proxy_pass http://backend;
    # proxy_http_version 1.1; # before version 1.29.7
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
`}
          />
          <p>本番環境の設定の Puma の前に Nginx を置き、Chrome で記事のページ（turbo_stream_from を含む）を開いて、/cable の接続を3通りの設定で確かめました。</p>
          <Code
            lang="text"
            code={`
== Upgrade あり、Host $host
socketerror Error during WebSocket handshake: Unexpected response code: 404
（Rails のログ）Request origin not allowed: http://localhost:8080
              Failed to upgrade to WebSocket (REQUEST_METHOD: GET, HTTP_CONNECTION: upgrade, HTTP_UPGRADE: websocket)
== Upgrade あり、Host $http_host
ws← {"type":"welcome"}
ws← {"identifier":"{\\"channel\\":\\"Turbo::StreamsChannel\\",…
（Rails のログ）Successfully upgraded to WebSocket (REQUEST_METHOD: GET, HTTP_CONNECTION: upgrade, HTTP_UPGRADE: websocket)
== Upgrade なし
socketerror Error during WebSocket handshake: Unexpected response code: 404
（Rails のログ）Failed to upgrade to WebSocket (REQUEST_METHOD: GET, HTTP_CONNECTION: , HTTP_UPGRADE: )
`}
          />
          <p>
            Upgrade のヘッダーが無いと、ActionCable は WebSocket の要求と認めず 404 を返します。Upgrade があっても、Host を $host にした設定では Origin の検査で拒否されました。本番環境では allowed_request_origins を設定していないので、ActionCable は Origin と Host
            が同じかどうかで判断します（<code>allow_same_origin_as_host</code>、既定で true）。ブラウザーの Origin は http://localhost:8080 で、$host はポート番号を落とした localhost
            なので一致しませんでした。<code>$http_host</code> にすると接続できました。本番環境では、allowed_request_origins に公開する URL を書いておくのが確実です。
          </p>
          <p>次の図は、/cable の要求が通る検査を上から順に並べ、3通りの設定がそれぞれどこで止まったかを示したものです。左の列を上からたどり、「いいえ」のときは右の箱の 404 で止まります。</p>
          <Figure
            title="/cable の要求が通る検査"
            caption="本番環境の設定の Puma（allowed_request_origins は未設定）に、Chrome から3通りの設定で接続した結果をもとにした図。太い青の矢印は、接続できた設定の経路です。右の箱と一番下の箱の2行目は Rails のログの文言です。"
          >
            <CableCheckFigure />
          </Figure>
          <p>
            説明書によると、プロキシ先から60秒間データが来ないと、Nginx は WebSocket の接続を閉じます（<code>proxy_read_timeout</code>
            ）。ActionCable はサーバーから3秒ごとに ping（接続が切れていないことを確かめる短いメッセージ）を送るので、この既定値のままで切れません。
          </p>
          <Callout kind="v72">
            <p>
              この章の Rails 側の挙動（RemoteIp、ActionCable の Origin の検査、Propshaft が .gz を作らないこと）は Rails 7.2.4 でも同じです。7.2 で Sprockets
              を使っているアプリケーションでは、既定で .gz も作られるので gzip_static が効きます（<ChapterLink n={16} section="assets" />
              ）。Nginx の既定値は、Rails ではなく Nginx のバージョンで決まります（上の注意を参照）。
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
          <li>HTTP の要求は1行目（メソッド・パス・バージョン）・ヘッダー・本文、応答は1行目（状態コード）・ヘッダー・本文でできています。Nginx は静的ファイルなら自分で応答を作り、それ以外はリバースプロキシとして Puma に転送します。</li>
          <li>リバースプロキシを通すと、ブラウザーと Nginx、Nginx と Puma の間に別々の接続ができ、Rails から見た相手は Nginx になります。</li>
          <li>設定はディレクティブ（; で終える）とブロック（{'{ }'} で囲む）で書き、nginx -t で確かめてから nginx -s reload で読み込ませます。誤りがあれば、動いている Nginx は前の設定のまま動き続けます。</li>
          <li>Nginx はマスターと複数のワーカーで動き、設定は main・events・http・server・location の階層です。proxy_set_header と add_header は、その階層に1つでも書くと上の値を引き継ぎません。</li>
          <li>location は最も長く一致する接頭辞で選ばれ、try_files で public のファイルと Rails（@app）に振り分けます。アセットは Rails に渡さず 404 にします。</li>
          <li>Host を指定しないと proxy_pass の名前が Rails に届きます。$host はポート番号を含まず、$http_host は含みます。</li>
          <li>Nginx 1.29.7 以降は、upstream に HTTP/1.1 で接続を使い回すのが既定です。それより前のバージョンでは明示的に設定します。</li>
          <li>Propshaft は .gz を作らないので、gzip_static を効かせるには自分で圧縮するか、gzip on を使います。</li>
          <li>proxy_buffering（既定で on）は、遅いクライアントに応答を送る間、Puma のスレッドがふさがるのを防ぎます。</li>
          <li>client_max_body_size（既定 1MB）を超えると Nginx が 413 を返し、Rails にはログが残りません。</li>
          <li>WebSocket には Upgrade と Connection の転送が必要です。Origin の検査のために、Host の扱いか allowed_request_origins を合わせます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Beginner’s Guide', publisher: 'nginx.org', url: `${NG}/beginners_guide.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'マスターとワーカーのプロセス、設定の階層とブロック。' },
    { title: 'Module ngx_http_proxy_module', publisher: 'nginx.org', url: `${NG}/http/ngx_http_proxy_module.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'proxy_set_header の既定値（Host $proxy_host）と継承の条件、proxy_http_version の既定値が 1.29.7 から 1.1、proxy_buffering と X-Accel-Buffering、proxy_read_timeout 60s。' },
    { title: 'Module ngx_http_core_module', publisher: 'nginx.org', url: `${NG}/http/ngx_http_core_module.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'location の選択の順、try_files、client_max_body_size の既定値 1m。' },
    { title: 'Puma: docs/nginx.md', publisher: 'puma/puma（GitHub）', url: 'https://github.com/puma/puma/blob/v8.0.2/docs/nginx.md', accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'Unix ソケットの upstream を使う Nginx の設定例。' },
    { title: 'Module ngx_http_upstream_module', publisher: 'nginx.org', url: `${NG}/http/ngx_http_upstream_module.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'keepalive が 1.29.7 から既定で有効（32本、local）になったこと。' },
    { title: 'Module ngx_http_gzip_static_module', publisher: 'nginx.org', url: `${NG}/http/ngx_http_gzip_static_module.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: '.gz の付いたファイルを事前に圧縮したものとして返すこと。' },
    { title: 'WebSocket proxying', publisher: 'nginx.org', url: `${NG}/http/websocket.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'Upgrade と Connection が hop-by-hop で転送されないこと、設定例、60秒でデータが無ければ閉じること。' },
    { title: 'Sprockets README（Gzip）', publisher: 'rails/sprockets（GitHub）', url: 'https://github.com/rails/sprockets/blob/v4.4.1/README.md#gzip', accessed: '2026-11-11', version: 'Sprockets 4.4.1', note: 'コンパイルしたファイルの .gz を既定で作ること（CSS・JavaScript・SVG）。' },
    { title: 'Puma README', publisher: 'puma/puma（GitHub）', url: 'https://github.com/puma/puma/blob/v8.0.2/README.md', accessed: '2026-11-16', version: 'Puma 8.0.2', note: 'Puma はリバースプロキシなしでも運用できる（Standalone）と書いていること。' },
    { title: 'RFC 9112: HTTP/1.1', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9112.html', accessed: '2026-11-16', version: 'RFC 9112', note: '要求の1行目（メソッド・パス・バージョン）、応答の1行目（状態行）、ヘッダーの行、空の行、本文という HTTP/1.1 のメッセージの形式。' },
    { title: 'RFC 9110: HTTP Semantics', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110.html', accessed: '2026-11-16', version: 'RFC 9110', note: '状態コードの意味（200・404 など）、Host・Server・Content-Type・Content-Length の各ヘッダー。' },
    { title: 'Command-line parameters', publisher: 'nginx.org', url: `${NG}/switches.html`, accessed: '2026-11-16', version: 'nginx 1.30（説明書は最新の版）', note: 'nginx -t が設定の書き方を確かめること、nginx -s reload が新しい設定でワーカーを起動し直すこと。実行例は nginx 1.30.6 で実測。' },
    { title: 'Core functionality（include・worker_connections）', publisher: 'nginx.org', url: `${NG}/ngx_core_module.html`, accessed: '2026-11-16', version: 'nginx 1.30（説明書は最新の版）', note: 'include が別のファイルの内容を設定に読み込むこと。' },
    { title: 'docker container run', publisher: 'Docker Docs', url: 'https://docs.docker.com/reference/cli/docker/container/run/', accessed: '2026-11-16', version: 'Docker CLI', note: '-p（ポートの公開）・-v（ディレクトリのマウント）・--network の指定。' },
  ],
}

export default withExplanations(ch24, explanation24)
