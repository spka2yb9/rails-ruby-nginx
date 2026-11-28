import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation25 } from '../explanations/operations'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const AWS = 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application'

/* ---------- 図 41-1 ロードバランサーによる振り分け ---------- */
function BalanceFigure() {
  const panel = (x: number, title: string, a1: string, a2: string, down: boolean) => (
    <g>
      <T x={x} y={22} bold fs={12}>
        {title}
      </T>
      <Arrow x1={x + 60} y1={50} x2={x + 60} y2={98} />
      <T x={x + 70} y={70} fs={10.5} tone="muted">
        20件の要求
      </T>
      <Box x={x} y={100} w={130} h={60} lines={['ロードバランサー', '振り分ける']} fs={12} bold fill="box" subTone="muted" />
      <Arrow x1={x + 130} y1={118} x2={x + 228} y2={78} />
      <Arrow x1={x + 130} y1={142} x2={x + 228} y2={186} dashed={down} />
      <Box x={x + 230} y={50} w={120} h={52} lines={['app1', a1]} fs={12} bold fill="box5" subTone="muted" />
      <Box x={x + 230} y={160} w={120} h={52} lines={['app2', a2]} fs={12} bold fill={down ? 'bg' : 'box5'} dashed={down} subTone={down ? 'danger' : 'muted'} />
    </g>
  )
  return (
    <Svg
      id="41-1"
      w={780}
      h={320}
      label="左は2台とも動いているとき。ロードバランサー役の Nginx は、20件の要求を app1 に12件、app2 に8件振り分けた。右は app2 がポート 80 で接続を受け付けないとき。app2 に接続できなかった要求は app1 に送り直され、20件すべてを app1 が処理した。下は ALB のヘルスチェックで、利用者の要求とは別に、決まった間隔で各サーバーへ確認の要求を送り、正常な応答が返らないサーバーには利用者の要求を送らない"
    >
      {panel(20, '2台とも動いている', '12件', '8件', false)}
      {panel(410, 'app2 がポート 80 で受け付けない', '20件', '接続できない', true)}
      <T x={540} y={236} fs={10.5} tone="muted">
        接続に失敗した要求は app1 に送り直す
      </T>
      <rect x={20} y={252} width={740} height={56} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={32} y={270} fs={11.5} bold>
        ALB のヘルスチェック
      </T>
      <T x={32} y={292} fs={11} tone="muted">
        利用者の要求とは別に、決まった間隔で各サーバーに確認の要求（/up など）を送り、正常な応答が返らないサーバーには振り分けない
      </T>
    </Svg>
  )
}

/* ---------- 図 41-2 接続ごとに見える IP アドレス ---------- */
function IpFigure() {
  const nodes = [
    { x: 20, t: 'curl のホスト', s: '172.29.0.1' },
    { x: 220, t: 'ロードバランサー役', s: '172.29.0.12・ポート 443' },
    { x: 420, t: 'Nginx', s: '172.29.0.7・ポート 80' },
    { x: 620, t: 'Puma・Rails', s: '172.29.0.14・ポート 3000' },
  ]
  const seen = [
    { x: 300, a: '相手は 172.29.0.1', b: '（access.log の先頭）' },
    { x: 500, a: '相手は 172.29.0.12', b: '（access.log の先頭）' },
    { x: 700, a: '相手は 172.29.0.7', b: '（REMOTE_ADDR）' },
  ]
  return (
    <Svg
      id="41-2"
      w={780}
      h={270}
      label="curl のホスト 172.29.0.1 から、ロードバランサー役 172.29.0.12 のポート 443、Nginx 172.29.0.7 のポート 80、Puma 172.29.0.14 のポート 3000 の順に、別々の接続で要求が送られる。ロードバランサー役から見た接続の相手は 172.29.0.1、Nginx から見た相手は 172.29.0.12、Rails の REMOTE_ADDR は Nginx の 172.29.0.7。元の IP アドレスは X-Forwarded-For に書き足されて、Rails には 172.29.0.1, 172.29.0.12 が届く"
    >
      {nodes.map((n, i) => (
        <g key={n.t}>
          <Box x={n.x} y={30} w={160} h={60} lines={[n.t, n.s]} fs={11.5} bold fill={i === 0 ? 'bg' : i === 3 ? 'box5' : 'box'} subTone="muted" />
          {i < nodes.length - 1 && <Arrow x1={n.x + 160} y1={60} x2={nodes[i + 1].x - 2} y2={60} />}
        </g>
      ))}
      {seen.map((s) => (
        <g key={s.a}>
          <T x={s.x} y={116} anchor="middle" fs={11}>
            {s.a}
          </T>
          <T x={s.x} y={134} anchor="middle" fs={10.5} tone="muted">
            {s.b}
          </T>
        </g>
      ))}
      <Box x={420} y={160} w={340} h={52} lines={['Rails に届いた X-Forwarded-For', '172.29.0.1, 172.29.0.12']} mono fs={11} fill="box4" align="start" />
      <T x={20} y={176} fs={11} tone="muted">
        接続から直接わかるのは、1つ手前の相手だけ
      </T>
      <T x={20} y={196} fs={11} tone="muted">
        元の IP アドレスは X-Forwarded-For で伝える
      </T>
      <T x={20} y={248} fs={10.5} tone="muted">
        IP アドレスは Docker のネットワーク 172.29.0.0/16 の中のもの（コンテナを起動し直すと変わることがある）
      </T>
    </Svg>
  )
}

/* ---------- 図 41-3 ヘッダーの受け渡し ---------- */
function HeadersFigure() {
  const hops = [
    { x: 20, t: 'ブラウザー', s: '203.0.113.7（例）' },
    { x: 215, t: 'ALB', s: 'TLS を終端' },
    { x: 410, t: 'Nginx', s: 'try_files・proxy_pass' },
    { x: 605, t: 'Puma・Rails', s: 'RemoteIp・SSL など' },
  ]
  return (
    <Svg
      id="41-3"
      w={780}
      h={300}
      label="ブラウザーは ALB に HTTPS で接続する。ALB は TLS を終端し、Nginx には HTTP で、X-Forwarded-For にブラウザーの IP を加え、X-Forwarded-Proto に https を入れて送る。Nginx は X-Forwarded-For に ALB の IP を加え、X-Forwarded-Proto は ALB の値をそのまま渡し、X-Request-Id に自分で作った ID を入れて Puma に送る。Rails は RemoteIp で X-Forwarded-For から信頼するプロキシの IP を除いてクライアントの IP を求め、X-Forwarded-Proto で https の要求と判断し、X-Request-Id をログの印に使う"
    >
      {hops.map((h, i) => (
        <g key={h.t}>
          <Box x={h.x} y={20} w={155} h={50} lines={[h.t, h.s]} fs={12} fill={i === 3 ? 'box5' : i === 0 ? 'bg' : 'box'} subTone="muted" />
          {i < hops.length - 1 && <Arrow x1={h.x + 155} y1={45} x2={hops[i + 1].x - 2} y2={45} />}
        </g>
      ))}
      <T x={192} y={88} anchor="middle" fs={10.5} tone="muted">
        HTTPS
      </T>
      <T x={387} y={88} anchor="middle" fs={10.5} tone="muted">
        HTTP
      </T>
      <T x={582} y={88} anchor="middle" fs={10.5} tone="muted">
        HTTP
      </T>
      <Box x={215} y={110} w={350} h={74} lines={['ALB → Nginx', 'X-Forwarded-For: 203.0.113.7', 'X-Forwarded-Proto: https　X-Amzn-Trace-Id: Root=1-…']} mono fs={10.5} fill="box4" align="start" />
      <Box x={410} y={196} w={350} h={74} lines={['Nginx → Puma', 'X-Forwarded-For: 203.0.113.7, 10.0.1.25（ALB）', 'X-Forwarded-Proto: https　X-Request-Id: 89e6d2…']} mono fs={10.5} fill="box4" align="start" />
      <T x={20} y={140} fs={11} tone="muted">
        X-Forwarded-Proto を $scheme で
      </T>
      <T x={20} y={158} fs={11} tone="muted">
        上書きすると http になる
      </T>
      <T x={20} y={288} fs={11} tone="muted">
        IP アドレスは説明のための例。デモでは Docker のネットワークの 172.29.0.0/16 のアドレスになった
      </T>
    </Svg>
  )
}

/* ---------- 図 41-4 タイムアウトの関係 ---------- */
function TimeoutFigure() {
  const x0 = 170
  const s = 7 // 1秒あたりの幅
  return (
    <Svg
      id="41-4"
      w={780}
      h={300}
      label="ALB のアイドルタイムアウトの既定値は60秒、Nginx の proxy_read_timeout の既定値も60秒で、Puma には要求の処理時間の上限が無い。デモでは、ロードバランサー役の Nginx のタイムアウトを5秒にして、8秒かかる要求を送った。ロードバランサーは5秒で 504 を返し、後段の Nginx のログには 499（クライアントが接続を閉じた）が残り、Rails は処理を続けて8秒後に 200 で完了とログに書いた"
    >
      <T x={20} y={20} bold>
        既定値（目安）
      </T>
      {[
        { t: 'ALB のアイドルタイムアウト', v: 60 },
        { t: 'Nginx proxy_read_timeout', v: 60 },
      ].map((r, i) => (
        <g key={r.t}>
          <T x={x0 - 8} y={46 + i * 28} anchor="end" fs={11}>
            {r.t}
          </T>
          <rect x={x0} y={36 + i * 28} width={r.v * s} height={18} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
          <T x={x0 + r.v * s + 6} y={46 + i * 28} fs={10.5} tone="muted">
            {`${r.v} 秒`}
          </T>
        </g>
      ))}
      <T x={x0 - 8} y={102} anchor="end" fs={11}>
        Puma
      </T>
      <T x={x0} y={102} fs={10.5} tone="muted">
        要求の処理時間の上限は無い（worker_timeout は別物）
      </T>
      <T x={20} y={146} bold>
        デモ：LB のタイムアウトを 5 秒にして 8 秒かかる要求を送る
      </T>
      {[0, 2, 4, 6, 8, 10].map((t) => (
        <g key={t}>
          <line x1={x0 + t * 40} y1={160} x2={x0 + t * 40} y2={262} stroke="var(--fig-line)" strokeDasharray="2 4" opacity={0.6} />
          <T x={x0 + t * 40} y={272} anchor="middle" fs={10} tone="muted">
            {`${t}s`}
          </T>
        </g>
      ))}
      <T x={x0 - 8} y={176} anchor="end" fs={11}>
        LB（応答 504）
      </T>
      <rect x={x0} y={166} width={5 * 40} height={18} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
      {/* 結果の文字の下を背景色で塗り、目盛りの点線が文字に重ならないようにする */}
      <rect x={x0 + 5 * 40 + 3} y={168} width={84} height={16} fill="var(--fig-bg)" />
      <T x={x0 + 5 * 40 + 6} y={176} fs={10.5} tone="danger">
        5.006s で 504
      </T>
      <T x={x0 - 8} y={206} anchor="end" fs={11}>
        Nginx（ログ 499）
      </T>
      <rect x={x0} y={196} width={5 * 40} height={18} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <rect x={x0 + 5 * 40 + 3} y={198} width={96} height={16} fill="var(--fig-bg)" />
      <T x={x0 + 5 * 40 + 6} y={206} fs={10.5} tone="muted">
        LB が切断 → 499
      </T>
      <T x={x0 - 8} y={236} anchor="end" fs={11}>
        Rails（ログ 200）
      </T>
      <rect x={x0} y={226} width={8 * 40} height={18} rx={3} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <rect x={x0 + 8 * 40 + 3} y={228} width={146} height={16} fill="var(--fig-bg)" />
      <T x={x0 + 8 * 40 + 6} y={236} fs={10.5} tone="muted">
        8001ms で Completed 200
      </T>
    </Svg>
  )
}

/* ---------- 図 41-5 502・504 の切り分け ---------- */
function TriageFigure() {
  return (
    <Svg
      id="41-5"
      w={780}
      h={430}
      label="502 か 504 かを受けたら、まずどの層が応答を作ったかを確かめる。ALB のアクセスログで target_status_code が - なら ALB が作った応答で、Nginx の応答なら Nginx のアクセスログに同じ要求がある。ALB が作った 502 は、ターゲットが接続を拒否・切断した場合で、Nginx の keep-alive がアイドルタイムアウトより短い場合も含む。ALB が作った 504 は、ターゲットへの接続が10秒以内にできないか、アイドルタイムアウトまで応答が無い場合。Nginx が作った 502 は、Puma への接続の失敗（connect() failed）か、処理中の切断（upstream prematurely closed connection）。Nginx が作った 504 は upstream timed out。Rails のログに同じ要求の Completed があれば、処理は最後まで続いている"
    >
      <Box x={250} y={14} w={280} h={40} lines="502 / 504 を受けた" fs={13} bold fill="box5" />
      <Arrow x1={390} y1={54} x2={390} y2={74} />
      <Box x={190} y={76} w={400} h={46} lines={['どの層が応答を作ったか', 'ALB の target_status_code・Nginx のアクセスログ']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={290} y1={122} x2={190} y2={152} />
      <Arrow x1={490} y1={122} x2={590} y2={152} />
      <T x={24} y={140} fs={10.5} tone="muted">
        ALB（target_status_code が -）
      </T>
      <T x={756} y={140} anchor="end" fs={10.5} tone="muted">
        Nginx（アクセスログにある）
      </T>
      <Box x={20} y={154} w={360} h={112} lines={['502：ターゲットが接続を拒否・切断した', '　・Nginx が止まっている', '　・keep-alive がアイドルタイムアウトより短い', '504：10 秒以内に接続できない（Nginx が無い）', '　 　またはアイドルタイムアウトまで応答が無い']} fs={11} fill="box" align="start" />
      <Box x={400} y={154} w={360} h={112} lines={['502：connect() failed（Puma が止まっている）', '502：upstream prematurely closed connection', '　 　（処理中にワーカーが落ちた）', '504：upstream timed out', '　 　（proxy_read_timeout まで応答が無い）']} fs={11} fill="box" align="start" />
      <Arrow x1={200} y1={266} x2={330} y2={300} />
      <Arrow x1={580} y1={266} x2={450} y2={300} />
      <Box x={190} y={302} w={400} h={46} lines={['X-Request-Id で Rails のログを探す', 'Started はあるか、Completed はあるか']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={390} y1={348} x2={390} y2={366} />
      <Box x={20} y={368} w={360} h={46} lines={['Started が無い：Puma まで届いていない', 'スレッドの空き待ち・Puma の停止・SSL のリダイレクト']} fs={11} fill="bg" subTone="muted" />
      <Box x={400} y={368} w={360} h={46} lines={['Completed が遅い：Rails の処理が遅い', '前段が切った後も処理は続いている']} fs={11} fill="bg" subTone="muted" />
    </Svg>
  )
}

/* ---------- X-Forwarded-Proto の上書きとリダイレクトの繰り返し（番号なし） ---------- */
function ProtoLoopFigure() {
  const ys = [36, 100, 164, 228, 292, 356]
  const col = (px: number, ok: boolean) => {
    const cx = px + 105
    return (
      <g>
        <Box x={px} y={ys[0]} w={210} h={42} lines={['ブラウザー', 'https://…/articles/1']} fs={12.5} fill="bg" subTone="muted" />
        <Box x={px} y={ys[1]} w={210} h={42} lines={['ロードバランサー役', 'X-Forwarded-Proto: https']} fs={12.5} subTone="muted" />
        <Box x={px} y={ys[2]} w={210} h={42} lines={['後段の Nginx', `X-Forwarded-Proto: ${ok ? 'https' : 'http'}`]} fs={12.5} subTone={ok ? 'muted' : 'danger'} />
        <Box x={px} y={ys[3]} w={210} h={42} lines={['ActionDispatch::SSL', `request.ssl? が ${ok}`]} fs={12.5} fill="box5" subTone={ok ? 'muted' : 'danger'} />
        <Box x={px} y={ys[4]} w={210} h={42} lines={['Rails::Rack::Logger', ok ? 'ログを書く' : '届かない（ログは 0 行）']} fs={12.5} fill={ok ? 'box' : 'bg'} dashed={!ok} subTone="muted" />
        <Box x={px} y={ys[5]} w={210} h={42} lines={['アクション', ok ? '200 を返す' : '届かない']} fs={12.5} fill={ok ? 'box' : 'bg'} dashed={!ok} subTone="muted" />
        {[0, 1, 2, 3, 4].map((i) => (i < 3 || ok) && <Arrow key={i} x1={cx} y1={ys[i] + 42} x2={cx} y2={ys[i + 1] - 2} />)}
        <T x={cx + 8} y={89} fs={11.5} tone="muted">
          HTTPS
        </T>
        <T x={cx + 8} y={153} fs={11.5} tone="muted">
          HTTP
        </T>
      </g>
    )
  }
  return (
    <Svg
      id="ch25-proto-loop"
      w={780}
      h={436}
      label="左は後段の Nginx が X-Forwarded-Proto を $scheme で上書きする前章の設定。ブラウザーは HTTPS でロードバランサー役に接続し、ロードバランサー役は X-Forwarded-Proto: https を付けて HTTP で後段の Nginx に送る。後段の Nginx は X-Forwarded-Proto を http に上書きし、ActionDispatch::SSL では request.ssl? が false になって、同じ URL への 301 を返す。要求は Rails::Rack::Logger にもアクションにも届かず、ログは0行。ブラウザーは同じ URL を要求し直し、これを繰り返す。右は後段の Nginx が $http_x_forwarded_proto で ALB の値をそのまま渡す設定。X-Forwarded-Proto は https のまま届き、request.ssl? が true になり、Rails::Rack::Logger がログを書き、アクションが 200 を返す"
    >
      <T x={20} y={18} bold fs={12}>
        X-Forwarded-Proto $scheme（前章の設定）
      </T>
      <T x={410} y={18} bold fs={12}>
        X-Forwarded-Proto $http_x_forwarded_proto
      </T>
      <line x1={395} y1={30} x2={395} y2={400} stroke="var(--fig-line)" strokeDasharray="2 4" opacity={0.6} />
      {col(20, false)}
      {col(410, true)}
      <Arrow d="M 230 249 H 270 V 57 H 232" accent />
      <T x={278} y={112} fs={11.5} tone="danger" bold>
        301
      </T>
      <T x={278} y={132} fs={11.5} tone="muted">
        Location は
      </T>
      <T x={278} y={150} fs={11.5} tone="muted">
        同じ URL
      </T>
      <T x={278} y={186} fs={11.5} tone="muted">
        ブラウザーは
      </T>
      <T x={278} y={204} fs={11.5} tone="muted">
        同じ URL を
      </T>
      <T x={278} y={222} fs={11.5} tone="muted">
        要求し直す
      </T>
      <T x={20} y={422} fs={11.5} tone="muted">
        Rails の設定は両方とも force_ssl = true、assume_ssl = false
      </T>
    </Svg>
  )
}

/* ---------- X-Forwarded-For を右から見る（番号なし） ---------- */
function RemoteIpFigure() {
  const xs = [20, 200, 380]
  const ips = ['1.2.3.4', '172.29.0.1', '172.29.0.6']
  const rows = [
    { y: 130, title: '既定：プライベートな IP の範囲をすべて信頼する', subs: ['最初に残る', '除く（プライベート）', '除く（プライベート）'], pick: 0, ip: '1.2.3.4', note: '偽の値が採用された' },
    { y: 218, title: 'trusted_proxies を2台（172.29.0.6・172.29.0.5）に絞る', subs: ['見ない', '最初に残る', '除く（指定した IP）'], pick: 1, ip: '172.29.0.1', note: '本物のクライアント' },
  ]
  return (
    <Svg
      id="ch25-remote-ip"
      w={780}
      h={306}
      label="クライアントが X-Forwarded-For: 1.2.3.4 を付けて送ると、ロードバランサー役が 172.29.0.1 を、後段の Nginx が 172.29.0.6 を右に書き足し、Rails には 1.2.3.4, 172.29.0.1, 172.29.0.6 が届く。RemoteIp は右から順に見て、信頼するプロキシの IP を除く。既定ではプライベートな範囲をすべて信頼するので、172.29.0.6 と 172.29.0.1 を除き、最初に残った 1.2.3.4 が remote_ip になる。trusted_proxies を 172.29.0.6 と 172.29.0.5 の2台に絞ると、172.29.0.6 だけを除き、最初に残った 172.29.0.1 が remote_ip になり、1.2.3.4 は見ない"
    >
      <T x={20} y={18} bold fs={12}>
        Rails に届いた X-Forwarded-For（クライアントが偽の値を付けた要求）
      </T>
      {ips.map((ip, i) => (
        <Box key={ip} x={xs[i]} y={32} w={150} h={36} lines={ip} mono fs={12.5} fill="box4" />
      ))}
      {['クライアントが付けた', 'ロードバランサーが書き足した', 'Nginx が書き足した'].map((t, i) => (
        <T key={t} x={xs[i] + 75} y={84} anchor="middle" fs={11.5} tone="muted">
          {t}
        </T>
      ))}
      <T x={570} y={42} fs={11.5} tone="muted">
        右（Rails に近い側）から順に見て、
      </T>
      <T x={570} y={60} fs={11.5} tone="muted">
        信頼する IP を除く
      </T>
      {rows.map((r) => (
        <g key={r.title}>
          <T x={20} y={r.y - 14} bold fs={12}>
            {r.title}
          </T>
          {ips.map((ip, i) => (
            <Box
              key={ip}
              x={xs[i]}
              y={r.y}
              w={150}
              h={44}
              lines={[ip, r.subs[i]]}
              fs={12.5}
              fill={i === r.pick ? 'box5' : 'bg'}
              dashed={i !== r.pick}
              accent={i === r.pick}
              subTone="muted"
            />
          ))}
          {[1, 2].map((i) => i > r.pick && <Arrow key={i} x1={xs[i] - 2} y1={r.y + 22} x2={xs[i] - 28} y2={r.y + 22} />)}
          <T x={570} y={r.y + 12} fs={12} mono tone={r.pick === 0 ? 'danger' : 'acc'}>
            {`remote_ip = ${r.ip}`}
          </T>
          <T x={570} y={r.y + 32} fs={11.5} tone="muted">
            {r.note}
          </T>
        </g>
      ))}
      <T x={20} y={290} fs={11.5} tone="muted">
        172.29.0.1 は Docker のホスト（本物のクライアント）、172.29.0.6 はロードバランサー役、172.29.0.5 は後段の Nginx
      </T>
    </Svg>
  )
}

/* ---------- 2つの ID で3つのログをつなぐ（番号なし） ---------- */
function LogJoinFigure() {
  const acc = { fill: 'var(--fig-accent)' }
  const logs = [
    { y: 22, h: 62, title: 'ALB のアクセスログ', lines: [<>… 504 … "GET …/lab/slow?s=8 HTTP/1.1" … <tspan style={acc}>"Root=1-…"</tspan></>] },
    { y: 122, h: 62, title: '後段の Nginx のアクセスログ', lines: [<>… 499 trace=<tspan style={acc}>"Root=1-…"</tspan> request_id=<tspan style={acc}>b07c47fe…</tspan></>] },
    {
      y: 222,
      h: 80,
      title: 'Rails のログ（log_tags = [ :request_id ]）',
      lines: [<><tspan style={acc}>[b07c47fe…]</tspan> Started GET "/lab/slow?s=8" …</>, <><tspan style={acc}>[b07c47fe…]</tspan> Completed 200 OK in 8001ms</>],
    },
  ]
  const layers = ['ALB', '後段の Nginx', 'Puma・Rails']
  return (
    <Svg
      id="ch25-log-join"
      w={780}
      h={318}
      label="ALB は要求に X-Amzn-Trace-Id を付けて後段の Nginx に送り、自分のアクセスログにも Root=1-… の値を書く。後段の Nginx は受け取った X-Amzn-Trace-Id と、自分で作った request_id b07c47fe… の両方をアクセスログの同じ行に書き、request_id を X-Request-Id で Puma に渡す。Rails は log_tags の設定で、ログの各行の先頭に [b07c47fe…] を付ける。ALB の行と Nginx の行は Trace-Id で、Nginx の行と Rails の Started・Completed の行は request_id で結び付けられる"
    >
      {layers.map((t, i) => (
        <g key={t}>
          <Box x={20} y={30 + i * 100} w={150} h={46} lines={t} fs={12.5} />
          <Arrow x1={170} y1={53 + i * 100} x2={228} y2={53 + i * 100} />
          {i < 2 && <Arrow x1={95} y1={76 + i * 100} x2={95} y2={128 + i * 100} />}
        </g>
      ))}
      <T x={103} y={102} fs={11.5} mono tone="muted">
        X-Amzn-Trace-Id
      </T>
      <T x={103} y={202} fs={11.5} mono tone="muted">
        X-Request-Id
      </T>
      {logs.map((l) => (
        <g key={l.title}>
          <Box x={230} y={l.y} w={530} h={l.h} fill="box4" />
          <T x={244} y={l.y + 18} bold fs={12}>
            {l.title}
          </T>
          {l.lines.map((line, j) => (
            <T key={j} x={244} y={l.y + 40 + j * 20} mono fs={11.5}>
              {line}
            </T>
          ))}
        </g>
      ))}
      <Arrow x1={600} y1={86} x2={600} y2={120} dashed both />
      <T x={612} y={103} fs={11.5} tone="muted">
        同じ Trace-Id で探す
      </T>
      <Arrow x1={600} y1={186} x2={600} y2={220} dashed both />
      <T x={612} y={203} fs={11.5} tone="muted">
        同じ request_id で探す
      </T>
    </Svg>
  )
}

const ch25: Chapter = {
  number: 25,
  part: 5,
  title: 'ロードバランサー配下の構成と障害対応',
  summary:
    'ブラウザーに 504 が表示されても、Rails 側では同じ要求を処理し終えていることがあります。ロードバランサーが要求を振り分ける構成で、誰が応答を返し、誰が待つのをやめたのかをログから調べます。',
  goals: [
    '接続元の IP と HTTPS の情報が、ロードバランサーから Rails までどう伝わるかを説明できる',
    'ヘルスチェックが成功する条件と、タイムアウトがどの接続にかかるかを確かめられる',
    '502・504 を返した場所を特定し、同じ要求の Nginx と Rails のログを照合できる',
  ],
  prerequisites: [6, 21, 23, 24],
  sections: [
    {
      id: 'load-balancer',
      title: 'ロードバランサーが要求を振り分ける',
      body: (
        <>
          <p>
            1台のサーバーで動かせる Puma のワーカーやスレッドの数は、CPU とメモリーで決まります（<ChapterLink n={23} section="sizing" />
            ）。それより多くの要求を処理するには、同じアプリケーションを動かすサーバーを増やします。サーバーが複数あれば、1台が故障したときや、デプロイで再起動しているときも、ほかのサーバーで要求を受け続けられます。
          </p>
          <p>
            ただし、利用者にサーバーを選んで接続してもらうわけにはいきません。利用者には1つの URL を見せ、届いた要求を後ろの複数のサーバーに振り分ける装置やプログラムを
            <Term en="load balancer">ロードバランサー</Term>と呼びます。AWS の ALB（Application Load Balancer）の説明書も、ロードバランサーはクライアントにとっての1つの接続先で、届いた要求を複数のターゲット（振り分け先のサーバー）に分けると書いています
            <Ref n={11} />。
          </p>
          <p>
            Nginx もロードバランサーとして使えます。自分の名前だけを返す Nginx を2つ（app1 と app2）起動して後ろのサーバーの代わりにし、その前にロードバランサー役の Nginx を置きました。<code>return</code>{' '}
            は要求を転送せずに、その場でステータスコードと本文を返すディレクティブです。
          </p>
          <Code
            lang="nginx"
            title="app1 と、ロードバランサー役の conf.d/default.conf（app2 は返す文字だけが違う）"
            code={`
# app1
server {
    listen 80;
    default_type text/plain;
    location / {
        return 200 "app1\\n";
    }
}

# ロードバランサー役
upstream servers {
    server app1:80;
    server app2:80;
}

server {
    listen 80;

    location / {
        proxy_pass http://servers;
    }
}
`}
          />
          <p>
            upstream ブロックに並べたサーバーには、既定では順に1件ずつ振り分けます（ラウンドロビン）
            <Ref n={12} />。20回要求して、返った文字ごとに数えました（<code>sort | uniq -c</code> は同じ行の数を数えるコマンドの組み合わせです）。
          </p>
          <Code
            lang="text"
            code={`
$ for i in $(seq 1 20); do curl -s http://127.0.0.1:8080/; done | sort | uniq -c
     12 app1
      8 app2
`}
          />
          <p>
            Nginx のワーカーごとに順番を数えるので、ちょうど10件ずつにはなりませんでしたが、2台に振り分けられています。次に、app2 の <code>listen</code> を 81 に変えて読み込ませ、ポート 80
            では接続を受け付けない状態にしました。サーバーのプログラムが止まった状態の代わりです。
          </p>
          <Code
            lang="text"
            title="app2 がポート 80 で受け付けないとき（error.log の日時などは省略）"
            code={`
$ for i in $(seq 1 20); do curl -s http://127.0.0.1:8080/; done | sort | uniq -c
     20 app1

（ロードバランサー役の error.log。同じ2行がもう1組あった）
[error] connect() failed (111: Connection refused) while connecting to upstream, … upstream: "http://172.29.0.10:80/"
[warn] upstream server temporarily disabled while connecting to upstream, … upstream: "http://172.29.0.10:80/"

（app2 の listen を 80 に戻し、10秒以上たってから）
$ for i in $(seq 1 20); do curl -s http://127.0.0.1:8080/; done | sort | uniq -c
     11 app1
      9 app2
`}
          />
          <p>
            app2 に接続できなかった要求は、ロードバランサー役が app1 に送り直したので、20件すべてに app1 が応答しました。error.log には、app2 への接続が拒否されたこと（Connection refused）と、app2
            を一時的に使わないこと（temporarily disabled）が記録されています。説明書によると、接続に失敗したサーバーは fail_timeout（既定10秒）の間、振り分けの対象から外れます
            <Ref n={12} />。app2 の listen を 80 に戻すと、10秒以上たってから、再び振り分けられました（図 41-1）。
          </p>
          <p>
            このロードバランサー役は利用者の要求を送って失敗したときに、初めてサーバーの異常に気づきます。ALB は利用者の要求とは別に、決まった間隔で各サーバーへ確認の要求を送り、期待した応答が返らないサーバーには利用者の要求を送りません。この確認を
            <Term en="health check">ヘルスチェック</Term>と呼びます。Rails のアプリケーションでは確認の要求に /up の URL を使います（「ヘルスチェック（/up）」の節）。Nginx
            の説明書によると、定期的なヘルスチェックは商用版の機能です
            <Ref n={12} />。
          </p>
          <Figure n="41-1" title="ロードバランサーによる振り分け" caption="ロードバランサー役の Nginx 1.30.6 で20件ずつ要求したときの実測と、ALB のヘルスチェックをもとにした模式図。">
            <BalanceFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'ip-port',
      title: 'IP アドレスとポート',
      body: (
        <>
          <p>
            ネットワークにつながったコンピューターには、IP アドレスという番号が付いています。172.29.0.12 のように、0〜255 の4つの数をドットで区切って書きます。要求を送る側は接続先の IP
            アドレスを指定して接続します。puma や example.com のようなホスト名で接続先を書いた場合は、ホスト名を IP アドレスに変換してから接続します。
          </p>
          <p>
            1台のコンピューターでは複数のプログラムが接続を待つので、どのプログラムに接続するかをポート番号で区別します。HTTP は 80 番、HTTPS は 443 番が標準のポートで
            <Ref n={13} />、この本のデモの Puma は 3000 番で待っています。この章のデモの3つのコンテナ（ロードバランサー役・Nginx・Puma）の IP アドレスを、Docker のネットワークの情報から調べました。
          </p>
          <Code
            lang="text"
            title="（この章で使う3つのコンテナの行だけを抜き出した）"
            code={`
$ docker network inspect rbdemo --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{"\\n"}}{{end}}'
ch25-lb 172.29.0.12/16
ch25-nginx 172.29.0.7/16
ch24-puma 172.29.0.14/16
`}
          />
          <p>
            IP アドレスは全体で32ビットの数です。後ろの /16 は、先頭の16ビット（172.29）が同じアドレスを1つのネットワークとして扱うことを表し、172.29.0.0/16 は 172.29.0.0 から 172.29.255.255
            までの範囲になります。curl を実行したホストは、このネットワークでは 172.29.0.1 です。
          </p>
          <p>
            ロードバランサー役に https で /lab/headers を要求し、3か所で接続の相手として記録された IP アドレスを並べました（<code>-k</code> の意味は「HTTPS と TLS」の節で説明します）。
          </p>
          <Code
            lang="text"
            title="1件の要求を3か所で見る（Rails が受け取った値は一部だけ）"
            code={`
$ curl -sk https://127.0.0.1:8443/lab/headers

（ロードバランサー役の access.log）
172.29.0.1 "GET /lab/headers HTTP/1.1" 200 lb_time=0.068 upstream=172.29.0.7:80 upstream_status=200
（Nginx の access.log）
172.29.0.12 xff="172.29.0.1" "GET /lab/headers HTTP/1.1" 200 request_id=b9672fd220609c706366c39e0e538fa7 rt=0.065 urt=0.066
（Rails が受け取った値）
REMOTE_ADDR="172.29.0.7"
HTTP_X_FORWARDED_FOR="172.29.0.1, 172.29.0.12"
`}
          />
          <p>
            ロードバランサー役から見た接続の相手は curl のホスト（172.29.0.1）、Nginx から見た相手はロードバランサー役（172.29.0.12）、Puma から見た相手（REMOTE_ADDR）は Nginx（172.29.0.7）でした（図 41-2）。プロキシを1つ通るたびに新しい接続が作られるので、後ろのサーバーが接続から直接知れるのは、1つ手前の相手の IP アドレスだけです。元のクライアントの IP アドレスは、途中のプロキシが
            X-Forwarded-For ヘッダーに書き足して伝えます。その扱いは「クライアントの IP」の節で詳しく見ます。
          </p>
          <p>
            IP アドレスにはインターネットで使うグローバルなアドレスと、会社やクラウドの中のネットワークで使うプライベートなアドレスがあります。プライベートなアドレスの範囲は 10.0.0.0/8・172.16.0.0/12・192.168.0.0/16
            の3つで、インターネットの経路には流れません
            <Ref n={14} />。デモの 172.29.x.x は 172.16.0.0/12（172.16.0.0〜172.31.255.255）に含まれます。Rails はこの3つの範囲を、既定で信頼するプロキシのアドレスとして扱います（「クライアントの
            IP」の節）。この章の図ではインターネットから来るブラウザーの IP アドレスとして、説明用の例のアドレス 203.0.113.7 を使います（203.0.113.0/24 は説明書や本で例に使うために用意された範囲です
            <Ref n={17} />）。
          </p>
          <Figure n="41-2" title="接続ごとに見える IP アドレス" caption="デモの3段の構成（Nginx 1.30.6・Puma 8.0.2）で /lab/headers を1回要求したときの実測をもとにした図。">
            <IpFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'dns',
      title: "URL のホスト名から接続先を調べる",
      body: (
        <>
          <p>
            ブラウザーは URL を開くと、ホスト名の接続先を DNS（Domain Name System）で調べます。DNS の応答などから IP アドレスを得た後で接続を作り、HTTPS なら TLS で相手を確認して HTTP の要求を送ります。名前に複数の候補アドレスがある場合や、以前の問い合わせをキャッシュしていた場合もあります。DNS が決めるのは名前に対応する候補で、URL のパスや Rails のアクションを選ぶのは後の処理です。<Ref n={22} />
          </p>
        </>
      ),
    },
    {
      id: 'status',
      title: 'ステータスコードと 502・504',
      body: (
        <>
          <p>
            応答の1行目にある3桁の数をステータスコードと呼びます（<ChapterLink n={24} section="web-server" />
            ）。最初の桁が結果の種類を表し、2xx は成功、3xx はリダイレクト（別の URL を開き直させる応答）、4xx は要求の側の誤り、5xx はサーバーの側の失敗です
            <Ref n={13} />。この章と前後の章に出てくるステータスコードは次のとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>コード</th>
                  <th>意味</th>
                  <th>この本で出てくる場面</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>200 OK</td>
                  <td>成功</td>
                  <td>通常の応答。ALB のヘルスチェックが正常とみなすコード</td>
                </tr>
                <tr>
                  <td>301 Moved Permanently</td>
                  <td>別の URL に移った（Location ヘッダーに移動先）</td>
                  <td>force_ssl が https の URL に移らせる（「TLS の終端と force_ssl のリダイレクトの繰り返し」の節）</td>
                </tr>
                <tr>
                  <td>403 Forbidden</td>
                  <td>要求を拒否した</td>
                  <td>
                    HostAuthorization が知らないホスト名を拒否する（<ChapterLink n={24} section="headers" />）
                  </td>
                </tr>
                <tr>
                  <td>404 Not Found</td>
                  <td>見つからない</td>
                  <td>ルートや記事が無い。Nginx が返すファイルが無い</td>
                </tr>
                <tr>
                  <td>413 Content Too Large</td>
                  <td>要求の本文が大きすぎる</td>
                  <td>
                    Nginx の client_max_body_size（<ChapterLink n={24} section="body-size" />）
                  </td>
                </tr>
                <tr>
                  <td>422 Unprocessable Content</td>
                  <td>要求の内容を処理できない</td>
                  <td>
                    CSRF のトークンの検査に失敗した（<ChapterLink n={21} section="csrf" />）
                  </td>
                </tr>
                <tr>
                  <td>500 Internal Server Error</td>
                  <td>サーバーの中で失敗した</td>
                  <td>Rails で例外が起きた</td>
                </tr>
                <tr>
                  <td>502 Bad Gateway</td>
                  <td>転送先から正しい応答を受け取れなかった</td>
                  <td>転送先に接続できない、転送先が途中で接続を切った</td>
                </tr>
                <tr>
                  <td>503 Service Unavailable</td>
                  <td>一時的に処理できない</td>
                  <td>ALB の振り分け先が1台も登録されていない</td>
                </tr>
                <tr>
                  <td>504 Gateway Timeout</td>
                  <td>転送先から時間内に応答が無かった</td>
                  <td>転送先の処理が遅い、転送先に接続できない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            502 と 504 は、Nginx や ALB のように要求を転送するサーバーが、転送先から応答を受け取れなかったときに自分で作るステータスコードです。RFC 9110 は 502
            を「ゲートウェイやプロキシとして動くサーバーが、転送先から不正な応答を受け取った」、504 を「転送先から時間内に応答を受け取れなかった」と定めています
            <Ref n={13} />。Nginx を Puma の前に置いて確かめました。Puma の応答を待つ時間（proxy_read_timeout）を3秒にし、Puma が動いていない状態の代わりに、Puma が待っていないポート 3001
            に転送する location も用意しました。
          </p>
          <Code
            lang="nginx"
            title="conf.d/default.conf（ステータスコードを確かめるための設定）"
            code={`
server {
    listen 80;

    location / {
        proxy_pass http://puma:3000;
        proxy_read_timeout 3s;      # Puma の応答を待つのは3秒まで
    }

    location /stopped/ {
        proxy_pass http://puma:3001;   # Puma が待っていないポート
    }
}
`}
          />
          <Code
            lang="text"
            title="4つの要求のステータスコードとかかった時間"
            code={`
$ curl -s -o /dev/null -w '%{http_code} %{time_total}s\\n' 'http://127.0.0.1:8080/articles/1'
200 0.362758s
$ curl -s -o /dev/null -w '%{http_code} %{time_total}s\\n' 'http://127.0.0.1:8080/articles/999999'
404 0.086481s
$ curl -s -o /dev/null -w '%{http_code} %{time_total}s\\n' 'http://127.0.0.1:8080/lab/slow?s=5'
504 3.013381s
$ curl -s -o /dev/null -w '%{http_code} %{time_total}s\\n' 'http://127.0.0.1:8080/stopped/articles/1'
502 0.002085s
`}
          />
          <Code
            lang="text"
            title="Nginx の error.log と Rails のログ（一部を省略）"
            code={`
（Nginx の error.log）
[error] upstream timed out (110: Connection timed out) while reading response header from upstream, … request: "GET /lab/slow?s=5 HTTP/1.1"
[error] connect() failed (111: Connection refused) while connecting to upstream, … request: "GET /stopped/articles/1 HTTP/1.1"

（Rails のログ）
Started GET "/articles/1" for 172.29.0.11 at 2026-11-16 07:24:36 +0000
Completed 200 OK in 314ms
Started GET "/articles/999999" for 172.29.0.11 at 2026-11-16 07:24:36 +0000
Completed 404 Not Found in 15ms
Started GET "/lab/slow?s=5" for 172.29.0.11 at 2026-11-16 07:24:36 +0000
Completed 200 OK in 5009ms
`}
          />
          <p>
            404 は、id が 999999 の記事が無いので Rails が返したもので、Rails のログに Completed 404 があります。504 は、Nginx が3秒待ってやめたときに自分で作ったもので、error.log に upstream timed
            out（転送先の応答を待つ時間が切れた）とあります。Rails は Nginx がやめた後も処理を続け、5秒後に 200 で完了しました。502 は、Nginx が Puma に接続できなかった（Connection refused）ときに作ったもので、Rails
            のログには何も残っていません。
          </p>
          <p>
            このように、502 と 504 は Rails の外で作られることが多く、Rails のログだけを見ても原因はわかりません。ロードバランサーと Nginx の2つが転送する構成で、どちらが作った 502・504
            かを見分ける手順は「502 と 504 の切り分け」の節で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'tls',
      title: 'HTTPS と TLS',
      body: (
        <>
          <p>
            HTTP の要求と応答は、そのままでは書いたとおりの文字で送られます（<ChapterLink n={24} section="web-server" />
            ）。途中のネットワークの機器で通信を読めれば、Cookie やフォームに入力したパスワードも読めてしまい、内容を書き換えることもできます。HTTPS は TLS で暗号化した接続の上で HTTP を送る方式です。TLS
            は通信の盗み見・改ざん・なりすましを防ぐための取り決めです
            <Ref n={15} />。
          </p>
          <p>
            暗号化しても、接続した相手が本物のサーバーでなければ意味がありません。そこで、サーバーは接続のはじめに証明書を送ります。証明書は、このサーバーが example.com
            のサーバーであることを示すデータで、ブラウザーが信頼する認証局（証明書を発行する組織）の署名が付いています。ブラウザーは、署名が信頼できる認証局のものかと、証明書のホスト名が URL
            のホスト名と一致するかを確かめます
            <Ref n={13} />。
          </p>
          <p>デモのロードバランサー役の Nginx は、自分で署名した証明書（自己署名の証明書）を使っています。どの認証局の署名も無いので、curl は確認に失敗します。</p>
          <Code
            lang="text"
            title="証明書の確認（curl の説明の行は省略）"
            code={`
$ openssl x509 -in cert.pem -noout -subject -issuer
subject=CN=localhost
issuer=CN=localhost
$ curl -sS -o /dev/null https://localhost:8443/up
curl: (60) SSL certificate OpenSSL verify result: self-signed certificate (18)
$ curl -sS -o /dev/null https://127.0.0.1:8443/up
curl: (60) SSL: certificate subject name 'localhost' does not match target hostname '127.0.0.1'
$ curl -sS -o /dev/null -w '%{http_code}\\n' --cacert cert.pem https://localhost:8443/up
200
$ curl -sk -o /dev/null -w '%{http_code}\\n' https://127.0.0.1:8443/up
200
`}
          />
          <p>
            subject は証明書の持ち主のホスト名（CN=localhost）、issuer は署名した者で、自己署名なので同じ localhost です。https://localhost で接続すると自己署名の証明書（self-signed
            certificate）として拒否され、https://127.0.0.1 で接続すると、証明書のホスト名 localhost が接続先の 127.0.0.1 と一致しないとして拒否されました。<code>--cacert</code>{' '}
            でこの証明書を信頼するよう指定すると、localhost への接続は成功しました。<code>-k</code> は証明書の確認を省く指定で、この章の以降の例では実験のために -k を付けています。インターネットに公開するサーバーには、認証局が発行した証明書を使います。
          </p>
          <p>確認を省いた接続でも、暗号化はされています。curl の -v で、接続の様子を見ました。</p>
          <Code
            lang="text"
            title="curl -skv の出力（TLS と証明書の行だけを抜き出した）"
            code={`
$ curl -skv -o /dev/null https://127.0.0.1:8443/up
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519MLKEM768 / RSASSA-PSS
*   subject: CN=localhost
*   start date: Nov 11 11:00:30 2026 GMT
*   expire date: Dec 11 11:00:30 2026 GMT
*   issuer: CN=localhost
`}
          />
          <p>
            TLSv1.3 は TLS のバージョンで、その後ろは暗号の方式です。証明書には有効期間（start date から expire date まで）があります。
          </p>
          <p>
            ロードバランサーが HTTPS の接続を受けて暗号を解き、後ろのサーバーには HTTP で送ることを、TLS の終端と呼びます。ALB の説明書も HTTPS のリスナー（受け付けるポートと方式の設定）では、ロードバランサーが証明書を使ってクライアントとの接続を終端し、要求を復号してからターゲットに送ると書いています
            <Ref n={16} />。暗号化されるのはブラウザーとロードバランサーの間だけで、後ろの Nginx や Puma には HTTP で届くので、Rails は接続そのものからは、ブラウザーが https で接続したことを知れません。次の節から、ALB
            が TLS を終端する構成を Nginx で再現し、ブラウザーの IP アドレスや https で接続したことを、ヘッダーで後ろに伝える方法を確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'composition',
      title: '構成とヘッダーの受け渡し',
      body: (
        <>
          <p>
            業務の構成は、ALB（Application Load Balancer）が HTTPS を受けて TLS を終端し（<Term en="TLS termination">TLS の終端</Term>：暗号化を解いて HTTP にすること）、EC2 などの Nginx に HTTP で転送し、Nginx が Puma に転送する形です。ALB はローカルで動かせないので、この章では Nginx 1.30.6
            をもう1つ起動して ALB の代わりにしました。自己署名の証明書で HTTPS を受け、ALB と同じように X-Forwarded-For・X-Forwarded-Proto・X-Forwarded-Port を付けて、
            <ChapterLink n={24} />
            の Nginx に転送します。タイムアウトは、確かめやすいように5秒にしています。
          </p>
          <Code
            lang="nginx"
            title="lb.conf（ロードバランサー役の Nginx、デモ）"
            code={`
server {
    listen 443 ssl;
    ssl_certificate     /lb/cert.pem;
    ssl_certificate_key /lb/key.pem;

    location / {
        proxy_pass http://rbdemo-nginx:80;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Port 443;
        proxy_set_header X-Amzn-Trace-Id "Root=1-$request_id";   # ALB の追跡用ヘッダーの代わり
        proxy_read_timeout 5s;   # ALB のアイドルタイムアウト（既定 60 秒）の代わりに短くした
        add_header X-Served-By lb always;
    }
}
`}
          />
          <p>
            ALB の説明書によると、ALB は X-Forwarded-For が無ければクライアントの IP で作り、あれば末尾に追加します（既定の append モード）。X-Forwarded-Proto には、クライアントが ALB
            に接続したプロトコル（http か https）を入れます
            <Ref n={1} />。どのヘッダーが Rails のどこで使われるかは図 41-3 のとおりです。後段の Nginx の設定は、Host を <code>$http_host</code> にし、<code>X-Request-Id $request_id</code>{' '}
            を加えた以外は前章と同じです。
          </p>
          <Figure n="41-3" title="ヘッダーの受け渡し" caption="ALB の説明書（X-Forwarded headers）と、デモの3段の構成での実測をもとにした模式図。">
            <HeadersFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'tls-proto',
      title: 'TLS の終端と force_ssl のリダイレクトの繰り返し',
      body: (
        <>
          <p>
            Rails を <code>force_ssl = true</code>、<code>assume_ssl = false</code> にして、後段の Nginx を前章の設定のまま（<code>X-Forwarded-Proto $scheme</code>）にすると、次のようになりました。
          </p>
          <Code
            lang="text"
            code={`
$ curl -sk -L --max-redirs 4 https://127.0.0.1:8443/articles/1
最終: 301 リダイレクト 4 回 https://127.0.0.1:8443/articles/1

HTTP/1.1 301 Moved Permanently
location: https://127.0.0.1:8443/articles/1      ← 同じ URL へのリダイレクト
X-Served-By: app-nginx
X-Served-By: lb

Rails のログに出た /articles/1 の行: 0
`}
          />
          <p>
            ブラウザーは HTTPS で接続していますが、後段の Nginx は ALB から HTTP で受けているので、<code>$scheme</code> は http です。Nginx は ALB が付けた{' '}
            <code>X-Forwarded-Proto: https</code> を http で上書きし、Rails は http の要求と判断して https の同じ URL にリダイレクトします。ブラウザーではリダイレクトが繰り返されてエラーになります。
          </p>
          <p>
            Rails のログに1行も出ていないことにも注意します。リダイレクトする ActionDispatch::SSL は、ログを書く Rails::Rack::Logger より前のミドルウェアです（<ChapterLink n={6} section="rails-stack" />
            ）。ログに何も無いのにリダイレクトされるときは、ミドルウェアの段階で返された応答を疑います。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/ssl.rb（88〜98行目）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/ssl.rb#L88-L98`}
            code={`
    def call(env)
      request = Request.new env

      if request.ssl?
        @app.call(env).tap do |status, headers, body|
          set_hsts_header! headers
          flag_cookies_as_secure! headers if @secure_cookies && !@exclude.call(request)
        end
      else
        return redirect_to_https request unless @exclude.call(request)
        @app.call(env)
`}
          />
          <p>
            次の図は、1件の要求が通る順を上から並べたものです。左の列は前章の設定のままの場合、右の列は後段の Nginx で ALB の値をそのまま渡した場合（下の対処の1つ目）です。左の列では、ActionDispatch::SSL が上の
            <code>request.ssl?</code> の分岐で 301 を返すので、要求は Rails::Rack::Logger に届きません。
          </p>
          <Figure
            title="X-Forwarded-Proto の上書きとリダイレクトの繰り返し"
            caption="この節のデモをもとにした模式図。ロードバランサー役と後段の Nginx の箱の2行目は、その層が次に送る X-Forwarded-Proto の値。破線の箱は要求が届かない層。太い青の矢印は 301 の応答で、実際には後段の Nginx とロードバランサー役を通ってブラウザーに戻る。Puma は省いた。"
          >
            <ProtoLoopFigure />
          </Figure>
          <p>対処は2通りあります。</p>
          <ul>
            <li>
              後段の Nginx で <code>proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;</code> とし、ALB の値をそのまま渡す。デモではこれで 200 になり、Rails の{' '}
              <code>request.ssl?</code> が true、<code>request.url</code> が https://… になった
            </li>
            <li>
              Rails で <code>config.assume_ssl = true</code> にする。ActionDispatch::AssumeSSL が、すべての要求を https として扱う
            </li>
          </ul>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/assume_ssl.rb（コメントを除く）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/assume_ssl.rb`}
            code={`
  class AssumeSSL
    def initialize(app)
      @app = app
    end

    def call(env)
      env["HTTPS"] = "on"
      env["HTTP_X_FORWARDED_PORT"] = "443"
      env["HTTP_X_FORWARDED_PROTO"] = "https"
      env["rack.url_scheme"] = "https"
      @app.call(env)
    end
  end
`}
          />
          <p>
            新規のアプリケーションの本番環境の設定ファイルには、両方（<code>assume_ssl</code> と <code>force_ssl</code>）が true で入っています。assume_ssl は、ALB を通らずに届いた要求も https
            とみなすので、Puma や Nginx に外から直接届かないネットワークの構成であることが前提です。X-Forwarded-Proto がずれると、<ChapterLink n={21} section="csrf" />
            の Origin の検査でも、正しいトークンの POST が 422 になります。
          </p>
        </>
      ),
    },
    {
      id: 'client-ip',
      title: 'クライアントの IP',
      body: (
        <>
          <p>X-Forwarded-Proto を直した設定で、Rails が受け取ったヘッダーと <code>request.remote_ip</code> を表示しました。</p>
          <Code
            lang="text"
            code={`
HTTP_X_FORWARDED_FOR="172.29.0.1, 172.29.0.6"     ← ブラウザー（Docker のホスト）、ロードバランサー
HTTP_X_FORWARDED_PROTO="https"
request.remote_ip=172.29.0.1 request.ssl?=true request.url=https://127.0.0.1:8443/lab/headers

（クライアントが X-Forwarded-For: 1.2.3.4 を付けて送った場合）
HTTP_X_FORWARDED_FOR="1.2.3.4, 172.29.0.1, 172.29.0.6"
request.remote_ip=1.2.3.4                          ← 偽の値が採用された
`}
          />
          <p>
            ActionDispatch::RemoteIp は、X-Forwarded-For を右（自分に近い側）から見て、信頼するプロキシの IP を取り除き、最初に残った IP をクライアントの IP とします。既定で信頼するのは、プライベートな IP
            アドレスの範囲です
            <Ref n={2} />。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/remote_ip.rb（40〜49行目）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/remote_ip.rb#L40-L49`}
            code={`
    TRUSTED_PROXIES = [
      "127.0.0.0/8",    # localhost IPv4 range, per RFC-3330
      "::1",            # localhost IPv6
      "fc00::/7",       # private IPv6 range fc00::/7
      "10.0.0.0/8",     # private IPv4 range 10.x.x.x
      "172.16.0.0/12",  # private IPv4 range 172.16.0.0 .. 172.31.255.255
      "192.168.0.0/16", # private IPv4 range 192.168.x.x
      "169.254.0.0/16", # link-local IPv4 range 169.254.x.x
      "fe80::/10",      # link-local IPv6 range fe80::/10
    ].map { |proxy| IPAddr.new(proxy) }
`}
          />
          <p>
            デモでは、本物のクライアント（172.29.0.1）もプライベートな IP なので、プロキシとして取り除かれ、その左の偽の値 1.2.3.4 が残りました。インターネットからの要求ではクライアントの IP
            はグローバルなアドレスなので、そこで止まり、偽の値は使われません。ただし、社内のネットワークや VPN（自宅などから社内のネットワークに暗号化してつなぐ仕組み）のようにプライベートな IP から来る利用者は、自分で付けた X-Forwarded-For で IP を偽れます。IP
            でアクセスを制限する機能があるなら、<code>config.action_dispatch.trusted_proxies</code> を実際のロードバランサーと Nginx の範囲だけにします。デモで2台の IP だけを指定すると、偽の値は使われなくなりました。
          </p>
          <Code
            lang="text"
            code={`
（trusted_proxies = [ロードバランサー 172.29.0.6, Nginx 172.29.0.5]）
HTTP_X_FORWARDED_FOR="1.2.3.4, 172.29.0.1, 172.29.0.6"
request.remote_ip=172.29.0.1
`}
          />
          <p>
            次の図は、偽の値を付けた要求の X-Forwarded-For を、既定の設定（上の段）と trusted_proxies を絞った設定（下の段）で、RemoteIp が右から順に見ていく様子を並べたものです。一番上の行でそれぞれの値をどの層が付けたかを確かめてから、各段を右の箱から左へ読んでください。
          </p>
          <Figure
            title="X-Forwarded-For を右から見る"
            caption="この節の2つの実行例をもとにした模式図。破線の箱は信頼するプロキシとして除いた値か、見ない値。紫の箱が最初に残った値で、request.remote_ip になる。細い矢印は見ていく順。REMOTE_ADDR の扱いは省いた。"
          >
            <RemoteIpFigure />
          </Figure>
          <p>
            Nginx のアクセスログの <code>$remote_addr</code> は、直前の接続の相手（ロードバランサー）の IP です。Nginx の realip モジュールを使うと、信頼するアドレスから来た要求について、X-Forwarded-For
            からクライアントの IP を復元して $remote_addr に入れます
            <Ref n={3} />。
          </p>
          <Code
            lang="text"
            code={`
（realip なし）172.29.0.6 xff="172.29.0.1" "GET /lab/headers HTTP/1.1" 200 …

set_real_ip_from 172.29.0.6;
real_ip_header X-Forwarded-For;
real_ip_recursive on;

（realip あり）172.29.0.1 xff="1.2.3.4, 172.29.0.1" "GET /lab/headers HTTP/1.1" 200 …
`}
          />
          <p>
            realip を使うと、<code>$proxy_add_x_forwarded_for</code> が加える IP も復元した値になります。デモでは Rails に届く X-Forwarded-For の末尾がロードバランサーではなくクライアントの IP（
            <code>"1.2.3.4, 172.29.0.1, 172.29.0.1"</code>）になりました。Rails の remote_ip の結果は変わりませんが、ログを読むときに混乱しないよう、どちらで IP を復元するかを決めておきます。
          </p>
        </>
      ),
    },
    {
      id: 'health',
      title: 'ヘルスチェック（/up）',
      body: (
        <>
          <p>
            ALB は登録したターゲットに定期的に要求を送り、応答のコードで正常かどうかを判断します。説明書によると、既定の間隔は30秒、タイムアウトは5秒、正常とみなすのは連続5回の成功、異常とみなすのは連続2回の失敗で、正常とみなすコードは
            200 です
            <Ref n={4} />。Rails 7.1 以降の新規のアプリケーションには、<code>/up</code> のルートと Rails::HealthController があります。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/health_controller.rb（コメントを除く、抜粋）"
            href={`${GH}/railties/lib/rails/health_controller.rb`}
            code={`
  class HealthController < ActionController::Base
    rescue_from(Exception) { render_down }

    def show
      render_up
    end
    # render_up は緑、render_down は赤の HTML（または JSON）を返し、render_down は 500
`}
          />
          <p>
            <code>show</code> は何も確かめずに 200 を返します。アプリケーションが起動して要求を処理できることはわかりますが、DB に接続できるかは確かめません。DB
            なども確かめたい場合は、独自のアクションを作るかを決めます。
          </p>
          <p>ヘルスチェックは、ALB からターゲット（Nginx）に HTTP で直接送られ、X-Forwarded-Proto は付きません。force_ssl だけを有効にした状態で、同じように送りました。</p>
          <Code
            lang="text"
            code={`
（force_ssl=true、assume_ssl=false）
$ curl -D - http://127.0.0.1:8080/up
HTTP/1.1 301 Moved Permanently
location: https://127.0.0.1:8080/up        ← 200 でないので、ALB は異常と判断する

（force_ssl=true、assume_ssl=true）
ヘルスチェック（http で直接）: 200
`}
          />
          <p>
            301 が返るので、ALB はターゲットを異常と判断します。説明書によると、異常なターゲットには要求が送られなくなりますが、ターゲットグループのすべてが異常になった場合は、ALB は正常・異常の判定にかかわらずすべてのターゲットに要求を送ります（fail open）
            <Ref n={4} />。いずれにしても、デプロイのときの入れ替えなどで、ヘルスチェックの結果が判断に使えなくなります。assume_ssl を有効にするか、production.rb のコメントにある{' '}
            <code>config.ssl_options = &#123; redirect: &#123; exclude: -&gt;(request) &#123; request.path == "/up" &#125; &#125; &#125;</code> で /up をリダイレクトの対象から外します。
          </p>
          <p>
            <ChapterLink n={21} section="host-ssl-csp" />
            のとおり本番環境で <code>config.hosts</code> を設定する場合も注意します。ALB のヘルスチェックの Host にはターゲットの IP アドレスが入るので、/up が HostAuthorization で 403 になります。production.rb
            のコメントにある <code>config.host_authorization = &#123; exclude: -&gt;(request) &#123; request.path == "/up" &#125; &#125;</code> で /up を検査の対象から外します。
          </p>
          <p>
            また、新規のアプリケーションの本番環境には <code>config.silence_healthcheck_path = "/up"</code> があり、Rails::Rack::SilenceRequest が /up のログを出しません。デモでも、/up
            の要求のログは1行もありませんでした。30秒ごとの要求でログが埋まらないための設定ですが、ヘルスチェックの失敗を調べるときは、Rails のログではなく Nginx のアクセスログを見ます。
          </p>
        </>
      ),
    },
    {
      id: 'timeouts',
      title: 'タイムアウトの関係',
      body: (
        <>
          <p>
            ALB のアイドルタイムアウトの既定値は60秒で、その間データの送受信が無いと接続を閉じます
            <Ref n={5} />。Nginx の proxy_read_timeout の既定値も60秒です（<ChapterLink n={24} section="websocket" />
            ）。Puma には要求の処理時間の上限がありません（<ChapterLink n={23} section="restart-timeout" />
            ）。ロードバランサー役のタイムアウトを5秒にして、8秒かかる要求を送りました。
          </p>
          <Code
            lang="text"
            code={`
$ curl -sk -D - "https://127.0.0.1:8443/lab/slow?s=8"
HTTP/1.1 504 Gateway Time-out  Server: nginx/1.30.6  X-Served-By: lb   経過 5.01s

（ロードバランサー役の error.log）
upstream timed out (110: Connection timed out) while reading response header from upstream, … upstream: "http://172.29.0.5:80/…"
（ロードバランサー役の access.log）
172.29.0.1 "GET /lab/slow?s=8 HTTP/1.1" 504 lb_time=5.006 upstream=172.29.0.5:80 upstream_status=504
（後段の Nginx の access.log）
172.29.0.6 xff="172.29.0.1" "GET /lab/slow?s=8 HTTP/1.1" 499 request_id=b07c47fe380d1468dd0ec1a4fa4bb9c6 rt=5.005 urt=5.005
（Rails のログ）
[b07c47fe380d1468dd0ec1a4fa4bb9c6] Started GET "/lab/slow?s=8" for 172.29.0.1 at 2026-11-11 11:04:06 +0000
[b07c47fe380d1468dd0ec1a4fa4bb9c6] Completed 200 OK in 8001ms
`}
          />
          <p>
            ブラウザーは5秒で 504 を受け取りましたが、Rails は処理を続けて8秒後に 200 と記録しました。後段の Nginx の 499 は、応答を返す前にクライアント（ここではロードバランサー）が接続を閉じたときに Nginx
            がログに記録するコードで、HTTP の標準のコードではありません。Rails のログだけを見ると成功に見えるので、利用者が見たエラーとログが食い違います（図 41-4）。前段がタイムアウトしても、DB の更新などは最後まで実行されるので、利用者が再送すると二重に実行されることもあります。
          </p>
          <p>
            keep-alive の接続を閉じるタイミングにも順序があります。ALB の説明書は、アプリケーション側のアイドルタイムアウトを ALB のものより長くするよう勧めています。アプリケーションが先に接続を閉じると、ALB
            がそれに気づく前に要求を送り、502 になることがあるからです
            <Ref n={5} />。ALB の次が Nginx なら Nginx の <code>keepalive_timeout</code>（公式イメージの設定では65秒）、Nginx を置かずに Puma なら <code>persistent_timeout</code>（既定 65 秒）が、ALB の60秒より長くなっています。ALB
            のアイドルタイムアウトを延ばすときは、これらも合わせて延ばします。
          </p>
          <Figure n="41-4" title="タイムアウトの関係" caption="既定値は ALB と Nginx の説明書による。下段はデモ（ロードバランサー役のタイムアウトを5秒にした）での実測。">
            <TimeoutFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'triage',
      title: '502 と 504 の切り分け',
      body: (
        <>
          <p>デモで、各層を止めたり遅くしたりして、どの層が何を返すかを記録しました。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>状況</th>
                  <th>ブラウザーが受けた応答</th>
                  <th>応答を作った層のログ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Puma が止まっている</td>
                  <td>502（X-Served-By: app-nginx）</td>
                  <td>
                    Nginx：<code>connect() failed (113: No route to host) while connecting to upstream</code>
                  </td>
                </tr>
                <tr>
                  <td>処理中にワーカーのプロセスが落ちた（kill -9）</td>
                  <td>502（app-nginx）</td>
                  <td>
                    Nginx：<code>upstream prematurely closed connection while reading response header from upstream</code>。Puma のマスターはワーカーを作り直した
                  </td>
                </tr>
                <tr>
                  <td>後段の Nginx の proxy_read_timeout を超えた（この行だけ 3 秒に変更）</td>
                  <td>504（app-nginx）</td>
                  <td>
                    Nginx：<code>upstream timed out (110: Connection timed out) while reading response header from upstream</code>
                  </td>
                </tr>
                <tr>
                  <td>ロードバランサーのタイムアウト（5秒）を超えた</td>
                  <td>504（lb のみ）</td>
                  <td>ロードバランサー：upstream timed out。後段の Nginx には 499、Rails には 200</td>
                </tr>
                <tr>
                  <td>後段の Nginx が止まっている</td>
                  <td>504（lb のみ）</td>
                  <td>
                    ロードバランサー：<code>upstream timed out (110: Connection timed out) while connecting to upstream</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            デモのロードバランサー役は Nginx なので、Puma が止まっている場合の「接続できない」は 502、接続の待ちのタイムアウトは 504 になりました。ALB の説明書は、502 と 504 の原因を次のように挙げています
            <Ref n={6} />。
          </p>
          <ul>
            <li>502：ターゲットへの接続の試みに TCP の RST（接続を拒否・中断する合図）が返った、要求の処理中にターゲットが接続を閉じた（keep-alive の時間がアイドルタイムアウトより短い場合を含む）、応答が不正、応答ヘッダーが 32KB を超えた、など</li>
            <li>504：接続のタイムアウト（10秒）までにターゲットに接続できない、接続できたがアイドルタイムアウトまでに応答が無い、Content-Length が実際の本文より大きい、など</li>
          </ul>
          <p>
            たとえば利用者が 504 を受け取ったら、まず ALB のアクセスログで同じ行の2つの欄を見ます。<code>elb_status_code</code> は利用者に返したコード、<code>target_status_code</code> は後ろのサーバーから受け取ったコードです。後者が <code>-</code> なら、ALB は転送先から応答コードを受け取れませんでした。<code>target_processing_time</code> が -1 なら、ターゲットへ送れなかった場合や、期限までに応答を受け取れなかった場合を調べます。<Ref n={7} />
          </p>
          <p>
            後者にも 504 があれば、今回は後ろのサーバーが 504 を返しています。そのサーバーの Nginx で同じ要求のアクセスログとエラーログを開き、Puma から応答を待っていたかを調べます。Rails まで届いていれば、同じ要求の Started と Completed に進みます（図 41-5）。
          </p>
          <Figure n="41-5" title="502・504 の切り分け" caption="ALB の説明書（Troubleshoot・Access logs）と、デモで各層を止めたり遅くしたりした結果をもとにまとめた手順。">
            <TriageFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'request-id',
      title: 'X-Request-Id でログを突き合わせる',
      body: (
        <>
          <p>
            各層のログを同じ要求で突き合わせるには、要求ごとの ID を各層で記録します。デモの後段の Nginx は、<code>$request_id</code>（Nginx が要求ごとに作る16バイトの乱数の16進表記<Ref n={10} />）を X-Request-Id
            ヘッダーで Puma に渡し、自分のアクセスログにも書きました。Rails の ActionDispatch::RequestId は、受け取った X-Request-Id を、記号を除いて255文字までに切り詰めてから要求の ID
            として使います
            <Ref n={8} />。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/request_id.rb（31〜44行目から抜粋）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/request_id.rb#L31-L44`}
            code={`
    def call(env)
      req = ActionDispatch::Request.new env
      req.request_id = make_request_id(req.get_header(@env_header))
      @app.call(env).tap { |_status, headers, _body| headers[@header] = req.request_id }
    end

    private
      def make_request_id(request_id)
        if request_id.presence
          request_id.gsub(/[^\\w\\-@]/, "").first(255)
        else
          internal_request_id
        end
      end
`}
          />
          <p>
            本番環境の <code>config.log_tags = [ :request_id ]</code> は、Rails のログの先頭に要求 ID を付ける設定です。前節の 504 の例では、Nginx の <code>request_id=b07c47fe380d1468dd0ec1a4fa4bb9c6</code> と Rails の <code>[b07c47fe380d1468dd0ec1a4fa4bb9c6]</code> が一致しました。こうすると利用者に 504 を返した記録と、後から Rails の処理が終わった記録を結び付けられます。
          </p>
          <p>
            Rails の応答がブラウザーまで届いた場合は、応答の <code>X-Request-Id</code> にも同じ値が入ります。前段が自分でエラーを返した場合は、その応答に Rails の ID があるとは限りません。
          </p>
          <p>
            ALB は、要求に <code>X-Amzn-Trace-Id</code> ヘッダーを付け、アクセスログにも記録します
            <Ref n={9} />。これは後段の Nginx が作る <code>X-Request-Id</code> と別の値です。Nginx の <code>log_format</code> に <code>$http_x_amzn_trace_id</code> と <code>$request_id</code> の両方を入れておけば、同じ1行から前者で ALB、後者で Rails の記録を探せます。
          </p>
          <p>
            次の図は、前節の 504 の要求について、3つのログの記録を2つの ID で結び付けたものです。左の列はヘッダーで ID を渡す順、右の列は各層のログで、青い文字はログどうしで一致する値を示します。真ん中の Nginx の行が、上の ALB の行と下の Rails の行の両方につながります。
          </p>
          <Figure
            title="2つの ID で3つのログをつなぐ"
            caption="前節の 504 の例をもとにした模式図。ALB の行は形式を簡略化した例。Nginx の行の trace= は、log_format に $http_x_amzn_trace_id を加えた場合に出る値で、デモのログには無い。実線の矢印はヘッダーの受け渡しとログへの書き込み、破線の矢印は同じ値で探せる記録どうしを表す。"
          >
            <LogJoinFigure />
          </Figure>
          <Callout kind="v72">
            <p>
              RemoteIp・SSL・AssumeSSL・RequestId・/up の HealthController は Rails 7.2.4 にもあります（AssumeSSL と /up は 7.1 から）。<code>silence_healthcheck_path</code>{' '}
              による /up のログの抑制は 8.0 から（railties の 8.0.0 の CHANGELOG）なので、7.2 のアプリケーションでは /up の要求も Rails のログに出ます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'production-observability',
      title: "本番で監視し、異常時に復旧する",
      body: (
        <>
          <p>
            死活監視の <code>/up</code> に加え、要求の成功率、応答時間、同時実行、DB の接続や遅い SQL、キューの待ち時間、ディスクの残量を見ます。「利用者の一部がログインできない」「メールが通常より遅い」のように、利用者が受ける影響とメトリクスを結び付けてアラートを設定します。ログにはリクエスト ID と操作がわかる項目を含め、同じ要求を Nginx・Rails・ジョブへ追えるようにします。この本のリクエスト ID の例で見た方法は、障害の範囲を限定するのにも使えます。<Ref n={18} />
          </p>
          <p>
            DB の遅い問い合わせは、本番で集めた遅い SQL の記録や監視の集計から候補を見つけ、条件・件数・実行計画を確かめます。たとえば PostgreSQL では <code>log_min_duration_statement</code>、MySQL ではスロークエリログの設定が出発点です。機密値やログ量を考慮し、再現や実行付きの計画確認は影響の少ない環境で行います。Rails が使う接続数も、Web とジョブの両方を含めて確認します。<Ref n={19} /><Ref n={20} />（<ChapterLink n={12} section="explain">実行計画</ChapterLink>、<ChapterLink n={23} section="sizing">接続数</ChapterLink>）。
          </p>
          <h3>障害対応と報告</h3>
          <ul>
            <li>発生時刻と、どの機能・利用者が影響を受けるかを確かめます。直前のリリースやアラートを確認し、一次報告には判明した影響、実施中の対応、次の報告時刻を書きます。原因が確定する前でも、既知の事実を共有できます。</li>
            <li>影響を止める措置を優先します。転送先を旧版に戻す、対象の機能を止めるなど、今のデータと構成で実行できる手段を選び、復旧指標を確認します。意図せず範囲を広げないよう、変更の主体と記録を揃えます。</li>
            <li>復旧後は時系列と検知・復旧を妨げた条件を調べ、再発を減らす対策を担当・期限と共に決めます。個人の責任追及では原因や対策を確認できないので、変更手順や検知がどう働いたかを振り返ります。<Ref n={18} /><Ref n={21} /></li>
          </ul>
          <p>障害のときに原因をたどれるように、ログ・メトリクス・トレースを残す考え方は、<ChapterLink n={89} /> で原則として扱います。</p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>ロードバランサーは1つの接続先で受けた要求を複数のサーバーに振り分けます。ALB はヘルスチェックで各サーバーを定期的に確かめ、正常でないサーバーには振り分けません。</li>
          <li>プロキシを通るたびに新しい接続ができるので、後ろのサーバーから接続で直接わかるのは1つ手前の IP アドレスだけです。10.0.0.0/8・172.16.0.0/12・192.168.0.0/16 はプライベートなアドレスです。</li>
          <li>502 と 504 は、Nginx や ALB が転送先から応答を受け取れなかったときに自分で作るステータスコードで、Rails のログには出ないことがあります。</li>
          <li>HTTPS は TLS で暗号化した接続で HTTP を送ります。証明書で相手のサーバーを確かめ、ロードバランサーが TLS を終端すると、後ろには HTTP で届きます。</li>
          <li>ALB が TLS を終端する構成では、後段の Nginx が X-Forwarded-Proto を $scheme で上書きすると、force_ssl が同じ URL へのリダイレクトを繰り返します。このリダイレクトは Rails のログに出ません。</li>
          <li>ALB の値をそのまま渡すか、assume_ssl を有効にします。assume_ssl は、外から直接届かない構成が前提です。</li>
          <li>RemoteIp は X-Forwarded-For から信頼するプロキシ（既定ではプライベートな IP）を除いてクライアントの IP を求めます。プライベートな IP から来る利用者はクライアントの IP を偽れるので、必要なら trusted_proxies を絞ります。</li>
          <li>/up は何も確かめずに 200 を返します。force_ssl のリダイレクトでヘルスチェックが失敗しないよう、assume_ssl か ssl_options の exclude を使います。</li>
          <li>ALB と Nginx の既定のタイムアウトは60秒で、Puma には上限がありません。前段が 504 を返しても Rails の処理は続き、ログには 200 が残ります。</li>
          <li>502・504 は、ALB の target_status_code、Nginx のアクセスログと error.log、Rails のログの順に、どの層が応答を作ったかを確かめて切り分けます。</li>
          <li>Nginx の $request_id を X-Request-Id で渡すと、Nginx と Rails のログを同じ ID で突き合わせられます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'HTTP headers and Application Load Balancers（X-Forwarded headers）', publisher: 'AWS Documentation', url: `${AWS}/x-forwarded-headers.html`, accessed: '2026-11-11', version: '—', note: 'X-Forwarded-For の append・preserve・remove（既定は append）と、X-Forwarded-Proto・X-Forwarded-Port。' },
    { title: 'actionpack/lib/action_dispatch/middleware/remote_ip.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/remote_ip.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'TRUSTED_PROXIES（プライベートな IP の範囲）、calculate_ip、trusted_proxies の指定。' },
    { title: 'Module ngx_http_realip_module', publisher: 'nginx.org', url: 'https://nginx.org/en/docs/http/ngx_http_realip_module.html', accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'set_real_ip_from・real_ip_header・real_ip_recursive。' },
    { title: 'Health checks for Application Load Balancer target groups', publisher: 'AWS Documentation', url: `${AWS}/target-group-health-checks.html`, accessed: '2026-11-11', version: '—', note: 'ヘルスチェックの既定値（間隔30秒、タイムアウト5秒、正常5回、異常2回、成功のコード200）。' },
    { title: 'Edit attributes for your Application Load Balancer（Connection idle timeout）', publisher: 'AWS Documentation', url: `${AWS}/edit-load-balancer-attributes.html`, accessed: '2026-11-11', version: '—', note: 'アイドルタイムアウトの既定値60秒と、アプリケーションのアイドルタイムアウトをそれより長くする理由（502）。' },
    { title: 'Troubleshoot your Application Load Balancers', publisher: 'AWS Documentation', url: `${AWS}/load-balancer-troubleshooting.html`, accessed: '2026-11-11', version: '—', note: 'HTTP 502・503・504 の原因の一覧（接続のタイムアウト10秒を含む）。' },
    { title: 'Access logs for your Application Load Balancer', publisher: 'AWS Documentation', url: `${AWS}/load-balancer-access-logs.html`, accessed: '2026-11-11', version: '—', note: 'target_status_code が - になる条件、target_processing_time が -1 になる条件。' },
    { title: 'actionpack/lib/action_dispatch/middleware/request_id.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/request_id.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '受け取った X-Request-Id の使い方（記号を除いて255文字まで）と、応答への付与。' },
    { title: 'Request tracing for your Application Load Balancer', publisher: 'AWS Documentation', url: `${AWS}/load-balancer-request-tracing.html`, accessed: '2026-11-11', version: '—', note: 'X-Amzn-Trace-Id の追加とアクセスログへの記録。' },
    { title: 'Module ngx_http_core_module（Embedded Variables）', publisher: 'nginx.org', url: 'https://nginx.org/en/docs/http/ngx_http_core_module.html#var_request_id', accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: '$request_id が16バイトの乱数の16進表記であること。' },
    { title: 'What is an Application Load Balancer?', publisher: 'AWS Documentation', url: `${AWS}/introduction.html`, accessed: '2026-11-16', version: '—', note: 'ロードバランサーがクライアントにとっての1つの接続先で、要求を複数のターゲットに振り分けること。リスナー・ターゲットグループ・ヘルスチェック。' },
    { title: 'Module ngx_http_upstream_module', publisher: 'nginx.org', url: 'https://nginx.org/en/docs/http/ngx_http_upstream_module.html', accessed: '2026-11-16', version: 'nginx 1.30（説明書は最新の版）', note: '既定の振り分けが重み付きラウンドロビンであること、失敗したら次のサーバーに送ること、max_fails（既定1）と fail_timeout（既定10秒）、zone がワーカーの間で状態を共有すること、定期的なヘルスチェックが商用版の機能であること。実行例は nginx 1.30.6 で実測。' },
    { title: 'RFC 9110: HTTP Semantics', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110.html', accessed: '2026-11-16', version: 'RFC 9110', note: 'ステータスコードの種類（1xx〜5xx）と各コード（502・503・504 など）の意味、http は 80 番・https は 443 番が既定のポートであること、https での証明書の確認。' },
    { title: 'RFC 1918: Address Allocation for Private Internets', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc1918.html', accessed: '2026-11-16', version: 'RFC 1918', note: 'プライベートなアドレスの3つの範囲（10/8・172.16/12・192.168/16）。' },
    { title: 'RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc8446.html', accessed: '2026-11-16', version: 'RFC 8446', note: 'TLS が盗み見・改ざん・なりすましを防ぐための取り決めであること。実行例は curl 8.23.0 と nginx 1.30.6 で実測。' },
    { title: 'Create an HTTPS listener for your Application Load Balancer', publisher: 'AWS Documentation', url: `${AWS}/create-https-listener.html`, accessed: '2026-11-16', version: '—', note: 'HTTPS のリスナーでは、ロードバランサーが証明書を使ってクライアントとの接続を終端し、要求を復号してからターゲットに送ること。' },
    { title: 'RFC 5737: IPv4 Address Blocks Reserved for Documentation', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc5737.html', accessed: '2026-11-16', version: 'RFC 5737', note: '203.0.113.0/24 が説明のための例に使う範囲であること。' },
    { title: "Managing Incidents", publisher: "Google SRE", url: "https://sre.google/sre-book/managing-incidents/", accessed: "2026-11-20", note: "障害の影響、役割、記録、復旧。" },
    { title: "Error Reporting and Logging", publisher: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/current/runtime-config-logging.html", accessed: "2026-11-20", note: "log_min_duration_statement とログ設定。" },
    { title: "The Slow Query Log", publisher: "MySQL Reference Manual", url: "https://dev.mysql.com/doc/refman/8.4/en/slow-query-log.html", accessed: "2026-11-20", version: "MySQL 8.4", note: "時間を要する問い合わせの記録。" },
    { title: "Postmortem Culture: Learning from Failure", publisher: "Google SRE", url: "https://sre.google/sre-book/postmortem-culture/", accessed: "2026-11-20", note: "障害後の振り返りと再発予防。" },
    { title: "RFC 1034: Domain Names", publisher: "IETF", url: "https://www.rfc-editor.org/rfc/rfc1034.html", accessed: "2026-11-20", note: "ホスト名の問い合わせとキャッシュ。" },
  ],
}

export default withExplanations(ch25, explanation25)
