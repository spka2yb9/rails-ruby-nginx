import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { withExplanations } from '../explanations/shared'
import { explanation26 } from '../explanations/operations'
import { ChapterLink, Code, Figure, Ref } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 29-1 要求が通る部品 ---------- */
function PartsFigure() {
  const front = [
    { x: 20, t: 'ブラウザー', s: 'URL を開く' },
    { x: 220, t: 'ロードバランサー', s: '第28章' },
    { x: 420, t: 'Nginx', s: '第27章' },
    { x: 620, t: 'Puma', s: '第26章' },
  ]
  const rails = [
    { x: 34, t: 'ミドルウェア', s: '第6章' },
    { x: 174, t: 'ルーティング', s: '第9章' },
    { x: 314, t: 'コントローラー', s: '第10章' },
    { x: 454, t: 'モデル', s: '第15〜17章' },
  ]
  return (
    <Svg
      id="29-1"
      w={780}
      h={330}
      label="GET /articles/1 が通る部品を順に並べた図。ブラウザーの要求は、ロードバランサー（第28章）、Nginx（第27章）、Puma（第26章）の順に届く。Puma が呼ぶ Rails のアプリケーションの中では、ミドルウェア（第6章）、ルーティング（第9章）、コントローラー（第10章）の順に進み、コントローラーはモデル（第15〜17章）を通して MySQL（第16・19章）から記事を読み、ビュー（第20章）で HTML を作る。応答は同じ経路を逆にたどってブラウザーに戻る"
    >
      {front.map((b, i) => (
        <g key={b.t}>
          <Box x={b.x} y={20} w={150} h={56} lines={[b.t, b.s]} fs={12} bold fill={i === 0 ? 'bg' : 'box'} subTone="muted" />
          {i < front.length - 1 && <Arrow x1={b.x + 150} y1={48} x2={front[i + 1].x - 2} y2={48} />}
        </g>
      ))}
      <rect x={20} y={110} width={580} height={180} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <Arrow d="M695,76 L695,96 L94,96 L94,144" />
      <T x={340} y={126} fs={11} tone="muted">
        Rails のアプリケーション（Puma が呼ぶ）
      </T>
      {rails.map((b, i) => (
        <g key={b.t}>
          <Box x={b.x} y={146} w={120} h={52} lines={[b.t, b.s]} fs={12} bold fill="box5" subTone="muted" />
          {i < rails.length - 1 && <Arrow x1={b.x + 120} y1={172} x2={rails[i + 1].x - 2} y2={172} />}
        </g>
      ))}
      <Arrow x1={374} y1={198} x2={374} y2={224} />
      <Box x={314} y={226} w={120} h={52} lines={['ビュー', '第20章']} fs={12} bold fill="box5" subTone="muted" />
      <Arrow x1={574} y1={172} x2={628} y2={172} both />
      <Box x={630} y={146} w={130} h={52} lines={['MySQL', '第16・19章']} fs={12} bold fill="box4" subTone="muted" />
      <T x={600} y={160} fs={10} tone="muted" mono>
        SQL
      </T>
      <T x={20} y={314} fs={11} tone="muted">
        応答（HTML）は、ビュー → コントローラー → ミドルウェア → Puma → Nginx → ロードバランサー → ブラウザーの順に戻る
      </T>
    </Svg>
  )
}

/* ---------- 図 29-2 リクエスト全体のシーケンス ---------- */
function SequenceFigure() {
  const lanes = [
    { x: 36, t: 'ブラウザー' },
    { x: 88, t: 'ALB' },
    { x: 132, t: 'Nginx' },
    { x: 179, t: 'Puma' },
    { x: 242, t: 'ミドルウェア' },
    { x: 325, t: 'コントローラー' },
    { x: 406, t: 'DB・ビュー' },
  ]
  const steps: { a: number; b: number; y: number; t: string; chapters: number[]; back?: boolean; self?: boolean }[] = [
    { a: 0, b: 1, y: 60, t: 'GET /articles/1（HTTPS）', chapters: [25] },
    { a: 1, b: 2, y: 92, t: '転送元の情報を付けて HTTP で転送', chapters: [25] },
    { a: 2, b: 2, y: 116, t: 'try_files でファイルが見つからず @app へ', chapters: [24], self: true },
    { a: 2, b: 3, y: 148, t: '要求 ID を付けて Puma に転送', chapters: [24] },
    { a: 3, b: 3, y: 172, t: 'スレッドが要求を受け取る', chapters: [23], self: true },
    { a: 3, b: 4, y: 204, t: 'app.call(env) で Rails を呼ぶ', chapters: [6] },
    { a: 4, b: 4, y: 228, t: 'HTTPS の確認、要求 ID やログの処理', chapters: [6, 8, 21, 25], self: true },
    { a: 4, b: 5, y: 260, t: 'ルーティング → articles#show', chapters: [9, 10] },
    { a: 5, b: 6, y: 292, t: 'Article.find(1) → SQL', chapters: [11, 12, 15] },
    { a: 5, b: 6, y: 324, t: '描画（パーシャル・関連の SQL）', chapters: [13, 16] },
    { a: 5, b: 3, y: 360, t: 'Rails が [status, headers, body] を返す', chapters: [6, 10], back: true },
    { a: 3, b: 2, y: 392, t: 'Puma が Nginx に応答を書き込む', chapters: [23, 24], back: true },
    { a: 2, b: 0, y: 424, t: 'ALB を通って HTML が届く（200）', chapters: [24, 25], back: true },
    { a: 0, b: 2, y: 460, t: '別の要求で CSS などを取得', chapters: [16, 24] },
    { a: 0, b: 3, y: 492, t: '/cable への接続を Puma に転送', chapters: [24] },
  ]
  return (
    <Svg
      id="29-2"
      w={820}
      h={520}
      label="GET /articles/1 は、ブラウザーから ALB に HTTPS で届き、ALB が TLS を終端して Nginx に HTTP で送る。Nginx は location / の try_files でファイルが無いことを確かめ、@app から Puma に送る。Puma が要求を読み、スレッドで Rails を呼ぶと、Rails のミドルウェア（AssumeSSL、SSL、Executor、RequestId、RemoteIp、Logger など）を通ってルーティングが articles#show を選ぶ。コントローラーが Article.find(1) で SQL を送り、ビューがレイアウトとパーシャルを描画する途中で関連の SQL を送る。応答は Puma のスレッドが Nginx に書き込み、Nginx がバッファーして ALB を通ってブラウザーに返す。その後、ブラウザーはアセットを Nginx から直接取得し、/cable に WebSocket で接続する。各段の横の数字は、その段を扱った章の番号"
    >
      <T x={454} y={20} bold fs={12}>この時点の処理</T>
      <T x={808} y={20} anchor="end" bold fs={12}>参照する章</T>
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
        return (
          <g key={st.t}>
            {st.self ? (
              <rect x={x1 - 5} y={st.y - 5} width={10} height={10} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            ) : (
              <Arrow x1={x1} y1={st.y} x2={x2 + (x2 > x1 ? -2 : 2)} y2={st.y} dashed={st.back} />
            )}
            <T x={454} y={st.y} fs={12}>{st.t}</T>
            <T x={808} y={st.y} anchor="end" fs={12} tone="muted">{st.chapters.map(chapterNumber).join('・')}</T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 29-3 段階とログの対応 ---------- */
function LogsFigure() {
  const rows = [
    { s: 'ロードバランサー', log: 'AWS の ALB なら elb_status_code・target_status_code・target_processing_time', demo: 'デモの Nginx：lb_time=0.008 upstream_status=200' },
    { s: 'Nginx', log: 'access.log（$request_id・$request_time・$upstream_response_time）・error.log', demo: 'request_id=e18060ac… rt=0.007 urt=0.007' },
    { s: 'Puma', log: '/stats（backlog・busy_threads）、標準出力（ワーカーの起動・停止）', demo: 'backlog=0 busy_threads=0' },
    { s: 'Rails|ミドルウェア・コントローラー', log: 'Started・Processing by・Parameters・Completed（log_tags で request_id）', demo: 'Completed 200 OK in 5ms (Views: 2.9ms | ActiveRecord: 0.6ms …)' },
    { s: 'ActiveRecord・MySQL', log: 'SQL の行（debug）、スロークエリログ、EXPLAIN', demo: 'Article Load (0.4ms) SELECT … WHERE id = 1 LIMIT 1' },
    { s: 'ビュー', log: 'Rendering・Rendered（debug）、Server-Timing（開発環境）', demo: 'Rendered layout layouts/application.html.erb (Duration: 2.8ms)' },
  ]
  return (
    <Svg
      id="29-3"
      w={790}
      h={rows.length * 58 + 30}
      label="各段の上段に調べるログ、下段にデモの記録を示す。ロードバランサーは、AWS の ALB ではアクセスログを調べ、Nginx を使ったデモでは lb_time が 8ms だった。その後の Nginx は access.log と error.log、Puma は /stats と標準出力、Rails は Started から Completed までの行、ActiveRecord は SQL の行、ビューは Rendered の行を見る"
    >
      {rows.map((r, i) => {
        const y = 14 + i * 58
        return (
          <g key={r.s}>
            <Box x={14} y={y} w={190} h={48} lines={r.s.split('|')} fs={12} bold fill={i < 3 ? 'box' : 'box5'} subTone="muted" />
            <T x={216} y={y + 16} fs={11}>
              {r.log}
            </T>
            <T x={216} y={y + 36} fs={11.5} tone="muted" mono>
              {r.demo}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 各ログの時間が測る範囲（番号なし） ---------- */
function TimeRangesFigure() {
  const x0 = 210
  const sc = 58 // 1ms あたりの幅
  const bx = (ms: number) => x0 + ms * sc
  const rows = [
    { t: 'ロードバランサー役の lb_time', s: 0, d: 8 },
    { t: 'Nginx の rt', s: 0.5, d: 7 },
    { t: 'Nginx の urt', s: 0.5, d: 7 },
    { t: 'Rails の Completed', s: 1.5, d: 5 },
  ]
  return (
    <Svg
      id="ch26-time-ranges"
      w={780}
      h={320}
      label="GET /articles/1 の1回の記録で、各ログの時間が測る範囲を棒で並べた図。ロードバランサー役の lb_time が 8ms で最も外側にあり、その中に Nginx の rt の 7ms と urt の 7ms、さらにその中に Rails の Completed の 5ms がある。urt と Completed の差の約2ms には、スレッドの空き待ち、ミドルウェア、ルーティング、応答の書き戻しが含まれる。Completed の 5ms のうち、Views が 2.9ms、ActiveRecord が 0.6ms で、残りはどちらにも入らない時間。外側の値に内側の値を足すと、内側の時間を二重に数える"
    >
      {rows.map((r, i) => {
        const y = 16 + i * 40
        return (
          <g key={r.t}>
            <T x={x0 - 12} y={y + 14} anchor="end" fs={11.5}>
              {r.t}
            </T>
            <Box x={bx(r.s)} y={y} w={r.d * sc} h={28} lines={`${r.d}ms`} fs={12} />
          </g>
        )
      })}
      <T x={bx(7.5) + 10} y={110} fs={11.5} tone="muted">
        rt と同じ値
      </T>
      <Box x={bx(0.5)} y={136} w={sc} h={28} fill="box5" dashed />
      <Box x={bx(6.5)} y={136} w={sc} h={28} fill="box5" dashed />
      <T x={x0 - 60} y={182} fs={11.5} tone="acc">
        Completed の左右の区間：合わせて約2ms。スレッドの空き待ち、ミドルウェア、ルーティング、応答の書き戻し
      </T>
      <T x={x0 - 12} y={214} anchor="end" fs={11.5}>
        Completed の内訳
      </T>
      <Box x={bx(1.5)} y={200} w={2.9 * sc} h={28} lines="Views 2.9ms" fs={11.5} />
      <Box x={bx(4.4)} y={200} w={0.6 * sc} h={28} lines="AR" fs={11.5} fill="box4" />
      <Box x={bx(5)} y={200} w={1.5 * sc} h={28} lines="残り" fs={11.5} fill="bg" dashed />
      <T x={bx(4.7)} y={244} anchor="middle" fs={11.5} tone="muted">
        ActiveRecord 0.6ms（SQL 2回）
      </T>
      <T x={20} y={278} fs={11.5} tone="muted">
        上の行ほど外側で測った時間で、下の行の範囲を含む。外側の値に内側の値を足すと、内側の時間を二重に数える
      </T>
      <T x={20} y={300} fs={11.5} tone="muted">
        スレッドの空き待ちは Rails のログに出ない。Puma の backlog か X-Request-Start との差で調べる
      </T>
    </Svg>
  )
}

const ch26: Chapter = {
  number: 26,
  part: 5,
  title: '記事表示のリクエストを LB から DB まで追う',
  summary:
    '記事を1件開いたときの要求を、ロードバランサーから Rails、MySQL、ブラウザーへの応答まで追います。各ログに残る要求 ID と時間を照合し、1件の処理を異なる場所から読んでみます。',
  goals: [
    'GET /articles/1 が通る順番と、記事やコメントを読む SQL が送られる場所を説明できる',
    '要求の識別子を使い、前段のアクセスログと Rails のログから対応する記録を探せる',
    '各層の時間が重なっている範囲を読み、次にどのログを調べるかを判断できる',
  ],
  prerequisites: [6, 9, 10, 12, 15, 16, 21, 23, 24, 25],
  sections: [
    {
      id: 'parts',
      title: '要求が通る部品',
      body: (
        <>
          <p>
            記事のページ（/articles/1）をブラウザーで開くと、ブラウザーには HTML が1つ届きます。デモの構成に、curl で同じ要求を送りました（<code>-k</code> は自己署名の証明書の確認を省く指定です。
            <ChapterLink n={25} section="tls" />）。
          </p>
          <Code
            lang="text"
            code={`
$ curl -sk -o /dev/null -w '%{http_code} %{size_download} bytes %{time_total}s\\n' https://127.0.0.1:8443/articles/1
200 2391 bytes 0.131696s
`}
          />
          <p>
            ステータスコード 200 で、2391 バイトの HTML が約 0.13 秒で届きました。ブラウザーから見れば、URL を1つ開いて HTML を受け取っただけです。この間に、次の部品が順に動いています（図 29-1）。
          </p>
          <ol>
            <li>
              ロードバランサー：HTTPS の接続を受けて暗号を解き（TLS の終端）、後ろの複数のサーバーのうち1台に要求を送ります（<ChapterLink n={25} section="load-balancer" />
              ）。
            </li>
            <li>
              Nginx：パスを見て、public にファイルがあればそれを返し、無ければ Puma に転送します（<ChapterLink n={24} section="reverse-proxy" />
              ）。/articles/1 にあたるファイルは無いので、Puma に送られます。
            </li>
            <li>
              Puma：要求を最後まで読み取り、空いているスレッドで Rails のアプリケーションを呼びます（<ChapterLink n={23} section="app-server" />
              ）。
            </li>
            <li>
              ミドルウェア：Rails がすべての要求に同じ順で行う処理の並びです。https で届いたかの確認、要求 ID の付与、ログの書き出し、Cookie の読み書きなどを1つずつ行います（<ChapterLink n={6} />
              ）。
            </li>
            <li>
              ルーティング：GET というメソッドと /articles/1 というパスから、ArticlesController の show アクションを選び、パスから id の 1 を取り出します（<ChapterLink n={9} />
              ）。
            </li>
            <li>
              コントローラー：show アクションのメソッドを実行し、モデルを使って記事を読み、ビューに渡します（<ChapterLink n={10} />
              ）。
            </li>
            <li>
              モデル（ActiveRecord）：<code>Article.find(1)</code> を SELECT の SQL に変えて MySQL に送り、返ってきた行を Article のオブジェクトにします（<ChapterLink n={11} />・
              <ChapterLink n={12} />
              ）。記事のコメントのような関連するデータも、使う時点で SQL を送って読みます（<ChapterLink n={13} />
              ）。
            </li>
            <li>
              MySQL：SQL を実行して、条件に合う行を返します。Rails はスレッドごとに、接続プールから MySQL への接続を借りて使います（<ChapterLink n={15} />
              ）。
            </li>
            <li>
              ビュー：テンプレートに記事の値を埋め込んで HTML を作ります（<ChapterLink n={16} />
              ）。
            </li>
          </ol>
          <p>
            できた HTML はミドルウェアを逆の順に通り、Puma、Nginx、ロードバランサーを経てブラウザーに届きます。途中の部品は応答にヘッダーを付け足します（「応答のヘッダー」の節）。次の節から、この1件の要求を各部品がどう処理し、どんなログと時間を残したかを順に読みます。
          </p>
          <Figure n="29-1" title="要求が通る部品" caption="デモの構成（Rails 8.1.4.1・Puma 8.0.2・Nginx 1.30.6・MySQL 8.4）で記事のページを開いたときに動く部品と、それを扱った章。">
            <PartsFigure />
          </Figure>
        </>
      ),
    },
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
            記事のページは、記事を読み、最新のコメント2件をパーシャルで描画し、<code>turbo_stream_from</code>（ブラウザーが WebSocket で更新を受け取るためのタグを出すヘルパー）を出力するビューです。要求が通る段階の全体を図 29-2 に示します。各段の横の数字が、その段を扱った章です。
          </p>
          <Figure n="29-2" title="リクエスト全体のシーケンス" caption="上から順に、左の矢印と同じ高さにある右の説明を読む。四角はその部品の中で行う処理、破線の矢印は応答を表す。末尾の2行は HTML を受け取ったブラウザーからの別の要求で、途中の中継を省略している。">
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
              Puma のワーカーが要求を読み、処理用のスレッドで Rails を呼びます（<ChapterLink n={23} section="cluster" />
              ）。スレッドがすべてふさがっていれば、ここで待たされます。待ち時間は Rails のログには出ないので、Puma の /stats の backlog か、X-Request-Start との差で確かめます。
            </li>
          </ol>
          <p>
            このアクセスログの時間の単位は秒です。たとえば後段の <code>rt=0.007</code> は、Nginx が要求を受けて応答を送り終えるまでの 7ms に当たります。次の Rails のログには、これと同じ要求について、アクションの実行にかかった時間が出ます。
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
use ActionDispatch::AssumeSSL                 ← 第28章：https とみなす
use ActionDispatch::SSL                       ← 第24・28章：HSTS、secure な Cookie
use Rack::Sendfile
use ActionDispatch::Static                    ← 第20章：public のファイル（Nginx があれば通常は届かない）
use ActionDispatch::Executor                  ← 第8・26章：クエリキャッシュ、CurrentAttributes の後始末
use Rack::Runtime                             ← X-Runtime
use Rack::MethodOverride
use ActionDispatch::RequestId                 ← 第28章：X-Request-Id
use ActionDispatch::RemoteIp                  ← 第28章：request.remote_ip
use Rails::Rack::SilenceRequest               ← 第28章：/up のログを出さない
use Rails::Rack::Logger                       ← ここで "Started GET" を書く
use ActionDispatch::ShowExceptions            ← 第10章：例外を 404・500 などに
use ActionDispatch::DebugExceptions
use ActionDispatch::Callbacks
use ActionDispatch::Cookies                   ← 第10章
use ActionDispatch::Session::CookieStore      ← 第10・24章
use ActionDispatch::Flash
use ActionDispatch::ContentSecurityPolicy::Middleware
use Rack::Head
use Rack::ConditionalGet                      ← 第25章
use Rack::ETag                                ← 第25章
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
link: </assets/application-8b441ae0.css>; rel=preload; as=style; nopush   ← stylesheet_link_tag（第20章）
vary: Accept, X-Requested-With
etag: W/"5c28e0b585c11476428a4cf5abcb8da1"                ← Rack::ETag（第25章）
cache-control: max-age=0, private, must-revalidate
set-cookie: _demo_session=…; path=/; secure; httponly; samesite=lax   ← CookieStore と SSL の secure（第10・24章）
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
            ）。最後に、<code>turbo_stream_from</code> により <code>/cable</code> に WebSocket で接続し、ActionCable がソケットを Puma のスレッドから引き取ります。
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
                  <td>デモのロードバランサー役（Nginx）の lb_time</td>
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
                  <td>process_action の処理時間（コールバック・アクション・描画）</td>
                  <td>5ms</td>
                </tr>
                <tr>
                  <td>Views・ActiveRecord</td>
                  <td>描画（描画中の SQL を除く）と SQL の時間。重ならない（第25章）</td>
                  <td>2.9ms・0.6ms</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            この記録では urt が 7ms、Completed が 5ms です。約2ms の差には、Puma がスレッドの空きを待つ時間のほか、ミドルウェア、ルーティング、応答を書き戻す時間も含まれます。待ち時間を調べたい場合は Puma の <code>backlog</code> と突き合わせます。
          </p>
          <p>
            次の図は、表の値を棒の長さにして、図 25-1 と同じように上下に並べたものです。上の行ほど外側の部品が測った時間で、下の行の範囲を含みます。
          </p>
          <Figure
            title="各ログの時間が測る範囲"
            caption="デモで GET /articles/1 を1回送ったときの値をもとにした模式図。棒の長さは値に合わせ、左端の位置と内訳の並び順は模式的なもの。紫の破線の箱は urt に含まれ、Completed に含まれない区間。AR は ActiveRecord（SQL の時間）、残りは Completed から Views と ActiveRecord を引いた時間。"
          >
            <TimeRangesFigure />
          </Figure>
          <p>
            Puma の説明書では、Nginx に <code>proxy_set_header X-Request-Start "t=$&#123;msec&#125;";</code> を設定し、転送時の時刻を記録する方法も紹介しています。Rack のミドルウェアで現在時刻との差を取ると、転送から Rails が要求を受け取るまでに経過した時間が分かります。<Ref n={3} />
          </p>
          <p>
            rt に比べて urt が短い場合は、Nginx が要求を受け取る区間やクライアントへ本文を返す区間も調べます。表の <code>lb_time</code> はデモで Nginx が付けた名前です。AWS の ALB のアクセスログでは3つの処理時間を記録し、最後の <code>response_processing_time</code> はクライアントに応答を送り始めた時点までを測ります。本文を送り終える時点まで測るデモの 8ms とは、終点が違います。<Ref n={5} />
          </p>
          <p>
            同じ記事でも、起動直後の要求には<ChapterLink n={16} section="compile">テンプレートのコンパイル</ChapterLink>や<ChapterLink n={11} section="schema">列の情報の読み込み</ChapterLink>が含まれることがあります。ふだんの応答時間を比べるときは、起動直後の値と、同じ要求を繰り返した値を分けて記録します。
          </p>
        </>
      ),
    },
    {
      id: 'map',
      title: 'リクエスト追跡のまとめ',
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
                  <td><ChapterLink n={25} /></td>
                </tr>
                <tr>
                  <td>Nginx</td>
                  <td>413、location の誤り、ヘッダーの継承漏れ、502・504、499</td>
                  <td>access.log・error.log</td>
                  <td><ChapterLink n={24} /></td>
                </tr>
                <tr>
                  <td>Puma</td>
                  <td>スレッドの空き待ち、ワーカーの停止、メモリー不足</td>
                  <td>/stats の backlog、標準出力</td>
                  <td><ChapterLink n={23} /></td>
                </tr>
                <tr>
                  <td>ミドルウェア</td>
                  <td>SSL のリダイレクトの繰り返し、Host の拒否</td>
                  <td>応答のヘッダー（Rails のログに出ない場合がある）</td>
                  <td><ChapterLink n={6} />・<ChapterLink n={21} />・<ChapterLink n={25} /></td>
                </tr>
                <tr>
                  <td>ルーティング・コントローラー</td>
                  <td>404、406、CSRF の検証による 422、例外の 500</td>
                  <td>Started・Processing・Completed の行、例外のバックトレース</td>
                  <td><ChapterLink n={9} />・<ChapterLink n={10} />・<ChapterLink n={21} /></td>
                </tr>
                <tr>
                  <td>ActiveRecord</td>
                  <td>N+1、遅い SQL、接続プールの枯渇、ロックの待ち・デッドロック</td>
                  <td>SQL の行・回数、EXPLAIN、MySQL のスロークエリログ</td>
                  <td><ChapterLink n={12} />・<ChapterLink n={13} />・<ChapterLink n={15} /></td>
                </tr>
                <tr>
                  <td>ビュー</td>
                  <td>ビューの中の N+1、描画の遅さ、エスケープ漏れ</td>
                  <td>Rendered の行、Server-Timing（開発環境）</td>
                  <td><ChapterLink n={16} />・<ChapterLink n={21} />・<ChapterLink n={22} /></td>
                </tr>
                <tr>
                  <td>非同期の処理</td>
                  <td>COMMIT 前のジョブの実行、再試行の重複</td>
                  <td>Sidekiq のログ、retry・dead</td>
                  <td><ChapterLink n={18} /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            デモでは、Nginx の <code>request_id=e18060ac…</code> と Rails の行頭の ID が同じです。これは Nginx がヘッダーで渡した値を Rails が採用したためです。<Ref n={1} /> 図 29-3 のログを照合するときも、まず同じ要求の行を探し、それぞれが測った区間を比べます。
          </p>
          <p>
            AWS の ALB までさかのぼるには、Nginx 側にも ALB の <code>X-Amzn-Trace-Id</code> を記録して、ALB の追跡 ID と Rails 側の要求 ID を対応付けます（<ChapterLink n={25} section="request-id">要求 ID でログを突き合わせる</ChapterLink>）。
          </p>
          <Figure n="29-3" title="段階とログの対応" caption="各段で見るログと、デモで GET /articles/1 を1回送ったときの値。">
            <LogsFigure />
          </Figure>
          <p>
            ここまでで、記事を表示する1件のリクエストがどの層を通り、どこで時間を使ったかを追えました。この経路に書き込みの規則を加える例は、<ChapterLink n={31} section="publication-case">記事の承認と公開</ChapterLink>で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>GET /articles/1 は、ALB（TLS の終端）→ Nginx（try_files・proxy_pass）→ Puma のスレッド→ ミドルウェア → ルーティング → コントローラー → ActiveRecord → ビューの順に処理され、同じ経路を戻ります。</li>
          <li>Logger より前のミドルウェアと、Nginx・ALB が返した応答は、Rails のログに出ません。Rails のログに無いときは、前段のログを見ます。</li>
          <li>Rails のログでは描画と SQL の時間を確認できます。Nginx の rt と urt を合わせて見ると、Rails のログに含まれない区間も調べられます。</li>
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
    { title: 'Access logs for your Application Load Balancer（処理時間の各フィールド）', publisher: 'AWS Documentation', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html', accessed: '2026-11-22', note: 'ALB が測る3つの区間と、クライアントへの送信開始時点。' },
  ],
}

export default withExplanations(ch26, explanation26)
