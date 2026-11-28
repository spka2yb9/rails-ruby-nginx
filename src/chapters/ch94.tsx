import type { ReactNode } from 'react'
import { figureNumber } from '../content/label'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 URL の部分と要求に入る部分 ---------- */
function UrlFigure() {
  const parts = [
    { x: 20, w: 70, text: 'https', label: 'スキーム', sub: '接続の方式' },
    { x: 122, w: 130, text: 'example.test', label: 'ホスト', sub: '接続先の名前' },
    { x: 256, w: 60, text: ':443', label: 'ポート', sub: '省略できる' },
    { x: 320, w: 110, text: '/articles', label: 'パス', sub: '要求の対象' },
    { x: 434, w: 95, text: '?page=2', label: 'クエリ', sub: '条件' },
    { x: 533, w: 115, text: '#comments', label: 'フラグメント', sub: 'サーバーへ送らない' },
  ]
  return (
    <Svg id="94-1" w={720} h={200} label="URL https://example.test:443/articles?page=2#comments を、スキーム、ホスト、ポート、パス、クエリ、フラグメントに分けた図。ホストは Host ヘッダーに、パスとクエリは要求行に入る。フラグメントはサーバーへ送らない">
      {parts.map((p) => (
        <g key={p.text}>
          <Box x={p.x} y={22} w={p.w} h={34} lines={p.text} mono fs={14} fill={p.text === '#comments' ? 'none' : 'box'} dashed={p.text === '#comments'} />
          <T x={p.x + p.w / 2} y={76} anchor="middle" fs={12} bold>{p.label}</T>
          <T x={p.x + p.w / 2} y={94} anchor="middle" fs={11} tone="muted">{p.sub}</T>
        </g>
      ))}
      <T x={106} y={39} anchor="middle" fs={14} mono>://</T>
      <Box x={150} y={132} w={330} h={52} lines={['GET /articles?page=2 HTTP/1.1', 'Host: example.test']} mono fs={13} align="start" fill="box5" />
      <Arrow x1={187} y1={104} x2={215} y2={130} />
      <Arrow x1={430} y1={104} x2={390} y2={130} />
      <T x={500} y={150} fs={12} tone="muted">443 番へ TLS で接続した後に送る</T>
      <T x={500} y={170} fs={12} tone="muted">フラグメントは要求に含まれない</T>
    </Svg>
  )
}

/* ---------- 図 1回のページ表示で送る複数の要求（段階送り） ---------- */
const pageLoadMsgs: { y: number; right: boolean; label: string; mono?: boolean; step: number }[] = [
  { y: 84, right: true, label: 'GET /articles', step: 0 },
  { y: 118, right: false, label: '200 text/html（記事一覧）', mono: false, step: 1 },
  { y: 190, right: true, label: 'GET /assets/application.css', step: 3 },
  { y: 222, right: false, label: '200 text/css', step: 3 },
  { y: 256, right: true, label: 'GET /icon.png', step: 4 },
  { y: 288, right: false, label: '200 image/png', step: 4 },
]

function PageLoadFigure({ step }: { step: number }) {
  const shown = pageLoadMsgs.filter((m) => m.step <= step)
  const label = `時間は上から下へ進む。ブラウザーとサーバーの間で、ここまでに ${shown.map((m) => m.label).join('、')} が送られた${step >= 2 ? '。ブラウザーは HTML を読んで CSS と画像の参照を見つけた' : ''}`
  return (
    <Svg id={`94-2-${step + 1}`} w={720} h={305} label={label}>
      <Box x={50} y={14} w={160} h={40} lines="ブラウザー" bold />
      <Box x={500} y={14} w={160} h={40} lines="サーバー" bold accent />
      <Arrow x1={130} y1={54} x2={130} y2={296} plain dashed />
      <Arrow x1={580} y1={54} x2={580} y2={296} plain dashed />
      {shown.map((m) => (
        <g key={m.y}>
          <Arrow x1={m.right ? 132 : 578} y1={m.y} x2={m.right ? 578 : 132} y2={m.y} accent={m.step === step} />
          <T x={355} y={m.y - 10} anchor="middle" fs={12} mono={m.mono ?? true} bold={m.step === step}>{m.label}</T>
        </g>
      ))}
      {step >= 2 && <Box x={140} y={132} w={280} h={28} lines="HTML を読み、CSS と画像の参照を見つける" fs={12} fill="box4" accent={step === 2} />}
    </Svg>
  )
}

const pageLoadSteps = [
  { label: 'HTML を要求する', text: <>ブラウザーはアドレス欄の URL から <code>GET /articles</code> の要求を送ります。この時点ではページに CSS や画像が必要かどうかはまだ分かりません。</> },
  { label: 'HTML を受け取る', text: <>サーバーは記事一覧の HTML を返します。応答の <code>content-type</code> が <code>text/html</code> なので、ブラウザーは本文を HTML として読みます。</> },
  { label: '参照を見つける', text: <>ブラウザーは HTML の <code>link</code> 要素や <code>img</code> 要素などから、スタイルシートや画像の URL を見つけます。追加の要求が必要だと分かるのは、HTML を受け取って読んだ後です。</> },
  { label: 'CSS を要求する', text: <>見つけたスタイルシートの URL に GET を送り、<code>text/css</code> の応答を受け取ります。</> },
  { label: '画像を要求する', text: <>画像の URL にも GET を送ります。アドレス欄で1回移動しただけで、この図では3つの要求が送られました。開発者ツールのネットワーク欄では、これらが別々の行として表示されます。</> },
].map((s, i) => ({ label: s.label, detail: <><PageLoadFigure step={i} /><p>{s.text}</p></> }))

/* ---------- 図 HTTP/1.1 のメッセージの構造 ---------- */
function MessageFigure() {
  const row = (y: number, h: number, label: string, lines: string[], note: string, dashed = false) => (
    <g key={y}>
      <Box x={20} y={y} w={110} h={h} lines={label} fs={12} fill="box" dashed={dashed} />
      <Box x={140} y={y} w={420} h={h} lines={lines} mono fs={12.5} align="start" fill={dashed ? 'none' : 'box4'} dashed={dashed} />
      <T x={575} y={y + h / 2} fs={11.5} tone="muted">{note}</T>
    </g>
  )
  return (
    <Svg id="94-3" w={760} h={372} label="要求は要求行、ヘッダー、空行、本文の順に並ぶ。要求行は POST /articles HTTP/1.1。応答は状態行、ヘッダー、空行、本文の順に並び、状態行は HTTP/1.1 201 Created、location ヘッダーに作った記事の URL が入る">
      <T x={20} y={16} bold>要求（curl が送った POST）</T>
      {row(30, 28, '要求行', ['POST /articles HTTP/1.1'], 'メソッド・対象・バージョン')}
      {row(64, 62, 'ヘッダー', ['Host: 127.0.0.1:3000', 'Content-Type: application/json', 'Accept: application/json'], '「名前: 値」を1行に1つ')}
      {row(132, 20, '空行', [], 'ヘッダーの終わり', true)}
      {row(158, 28, '本文', ['{"article":{"title":"Cookie basics"}}'], 'Content-Length のバイト数')}
      <T x={20} y={210} bold>応答（Rails が返した 201）</T>
      {row(224, 28, '状態行', ['HTTP/1.1 201 Created'], 'バージョン・コード・語句')}
      {row(258, 44, 'ヘッダー', ['content-type: application/json; charset=utf-8', 'location: /articles/3'], 'location は作った記事の URL')}
      {row(308, 20, '空行', [], 'ヘッダーの終わり', true)}
      {row(334, 28, '本文', ['{"id":3,"title":"Cookie basics"}'], '作った記事の表現')}
    </Svg>
  )
}

/* ---------- 図 TLS が隠す範囲 ---------- */
function TlsFigure() {
  return (
    <Svg id="94-4" w={740} h={262} label="TCP 接続の中に TLS があり、その中に HTTP のメッセージがある。経路の途中からは IP アドレスとポート、接続先のホスト名（SNI）、通信の量と時刻が分かる。パス、クエリ、ヘッダー、Cookie、本文は TLS で暗号化される">
      <rect x={20} y={34} width={360} height={200} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={52} fs={12} bold>TCP 接続（IP アドレスとポートは見える）</T>
      <rect x={36} y={66} width={328} height={156} rx={8} fill="var(--fig-box)" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={48} y={84} fs={12} bold>TLS（証明書の確認・暗号化・改ざんの検出）</T>
      <Box x={56} y={100} w={288} h={108} lines={['HTTP のメッセージ', '要求行・メソッド・パス・クエリ', 'ヘッダー・Cookie・本文']} fs={12} fill="box5" bold subTone="muted" />
      <T x={410} y={52} bold>経路の途中から分かること</T>
      <Box x={410} y={64} w={310} h={72} lines={['送信元と宛先の IP アドレス・ポート', '接続先のホスト名（SNI）', '送った量と時刻']} fs={12} fill="box" />
      <T x={410} y={160} bold>TLS で暗号化されること</T>
      <Box x={410} y={172} w={310} h={62} lines={['パス・クエリ・ヘッダー・Cookie', '要求と応答の本文']} fs={12} fill="box5" />
      <T x={20} y={252} fs={11} tone="muted">SNI は接続の開始時に送るホスト名。暗号化する拡張を使わない場合は経路から見える</T>
    </Svg>
  )
}

/* ---------- 図 POST と DELETE を2回ずつ送ったときの状態 ---------- */
function IdempotentFigure() {
  const lane = (y: number, title: string, states: string[], codes: string[], same: boolean) => (
    <g key={y}>
      <T x={20} y={y} bold mono={false}>{title}</T>
      {states.map((s, i) => (
        <Box key={i} x={20 + i * 260} y={y + 14} w={150} h={46} lines={s} fs={13} fill={i === 0 ? 'box' : 'box4'} accent={same && i === 2} />
      ))}
      {codes.map((c, i) => (
        <g key={c + i}>
          <Arrow x1={170 + i * 260} y1={y + 37} x2={278 + i * 260} y2={y + 37} />
          <T x={224 + i * 260} y={y + 26} anchor="middle" fs={11} mono>{c}</T>
        </g>
      ))}
    </g>
  )
  return (
    <Svg id="94-5" w={760} h={250} label="POST /articles を同じ本文で2回送ると、記事は1・2から1・2・3、1・2・3・4へと2件増えた。DELETE /articles/4 を2回送ると、1回目で記事4が消えて 204、2回目は 404 だが、記事が1・2・3の状態は変わらない">
      {lane(22, 'POST /articles を同じ本文で2回', ['記事 1・2', '記事 1・2・3', '記事 1・2・3・4'], ['201 Created', '201 Created'], false)}
      {lane(112, 'DELETE /articles/4 を2回', ['記事 1・2・3・4', '記事 1・2・3', '記事 1・2・3'], ['204 No Content', '404 Not Found'], true)}
      <T x={20} y={206} fs={12}>POST：送った回数だけ記事が増える。2回目は1回目と別の効果を持つので冪等ではない</T>
      <T x={20} y={230} fs={12}>DELETE：1回でも2回でも「記事4がない」状態になる。応答のコードが違っても冪等</T>
    </Svg>
  )
}

/* ---------- 図 フォーム送信後のリダイレクト ---------- */
function PrgFigure() {
  const msg = (y: number, right: boolean, label: string) => (
    <g key={y}>
      <Arrow x1={right ? 132 : 598} y1={y} x2={right ? 598 : 132} y2={y} />
      <T x={365} y={y - 9} anchor="middle" fs={11.5} mono>{label}</T>
    </g>
  )
  return (
    <Svg id="94-6" w={760} h={330} label="保存できた場合、ブラウザーが POST /articles を送ると Rails は 303 See Other と location: /articles/4 を返し、ブラウザーは GET /articles/4 を送って 200 の記事の HTML を受け取る。再読み込みで送り直すのは GET。保存できなかった場合は POST に 422 と入力の誤りを示す HTML を返す">
      <Box x={50} y={14} w={160} h={40} lines="ブラウザー" bold />
      <Box x={520} y={14} w={160} h={40} lines="Rails" bold accent />
      <Arrow x1={130} y1={54} x2={130} y2={320} plain dashed />
      <Arrow x1={600} y1={54} x2={600} y2={320} plain dashed />
      <T x={365} y={66} anchor="middle" fs={12} bold>保存できた場合（題名あり）</T>
      {msg(96, true, 'POST /articles  article[title]=Form basics')}
      {msg(126, false, '303 See Other  location: /articles/4')}
      {msg(162, true, 'GET /articles/4')}
      {msg(192, false, '200  記事の HTML')}
      <Box x={140} y={204} w={300} h={28} lines="再読み込みで送り直すのは GET /articles/4" fs={12} fill="box4" />
      <T x={365} y={252} anchor="middle" fs={12} bold>保存できなかった場合（題名が空）</T>
      {msg(282, true, 'POST /articles  article[title]=')}
      {msg(312, false, '422  入力の誤りを示す HTML')}
    </Svg>
  )
}

/* ---------- 図 Cookie でセッションを運ぶ ---------- */
function CookieFigure() {
  const msg = (y: number, right: boolean, label: string, dashed = false) => (
    <g key={y}>
      <Arrow x1={right ? 232 : 618} y1={y} x2={right ? 618 : 232} y2={y} dashed={dashed} accent={dashed} />
      <T x={425} y={y - 9} anchor="middle" fs={11.5}>{label}</T>
    </g>
  )
  return (
    <Svg id="94-7" w={760} h={330} label="curl が Cookie なしで GET /visits を送ると、Rails は set-cookie で値A と visits=1 を返す。curl は値A を保存し、次の要求の cookie ヘッダーで送る。Rails は値B と visits=2 を返し、3回目は値C と visits=3。古い値A を送り直すと visits=2 になり、サーバーは古い値を拒否できない">
      <Box x={160} y={14} w={140} h={40} lines="curl" bold />
      <Box x={540} y={14} w={160} h={40} lines="Rails（CookieStore）" bold accent fs={12} />
      <Arrow x1={230} y1={54} x2={230} y2={290} plain dashed />
      <Arrow x1={620} y1={54} x2={620} y2={290} plain dashed />
      <T x={10} y={70} fs={11.5} bold>curl が保存した値</T>
      {msg(88, true, 'GET /visits（Cookie なし）')}
      {msg(118, false, 'set-cookie: 値A　本文 visits=1')}
      <Box x={10} y={126} w={140} h={26} lines="値A" fs={12} fill="box4" />
      {msg(166, true, 'GET /visits　cookie: 値A')}
      {msg(196, false, 'set-cookie: 値B　本文 visits=2')}
      <Box x={10} y={204} w={140} h={26} lines="値B" fs={12} fill="box4" />
      {msg(244, true, 'GET /visits　cookie: 値B')}
      {msg(274, false, 'set-cookie: 値C　本文 visits=3')}
      <Box x={10} y={282} w={140} h={26} lines="値C" fs={12} fill="box4" />
      <T x={250} y={306} fs={11.5} tone="danger">古い値A を cookie で送り直すと visits=2 が返る（値A の中身は count=1）</T>
      <T x={250} y={324} fs={11} tone="muted">サーバーは発行した値を記録していないので、古い値を見分けられない</T>
    </Svg>
  )
}

/* ---------- 図（段階送り）要求と応答の1往復 ---------- */
interface Exchange { req: string[]; res: string[]; client: string[]; server: string[] }
function ExchangeSvg({ id, server: serverName, ex }: { id: string; server: string; ex: Exchange }) {
  const lines = (arr: string[], arrowY: number) =>
    arr.map((t, k) => <T key={k} x={380} y={arrowY - 14 - (arr.length - 1 - k) * 16} anchor="middle" fs={11.5} mono>{t}</T>)
  return (
    <Svg id={id} w={760} h={262} label={`curl が ${ex.req.join('、')} を送り、${serverName}が ${ex.res.join('、')} を返す。${ex.client.join('：')}。${ex.server.join('：')}。`}>
      <Box x={10} y={8} w={130} h={34} lines="curl" bold />
      <Box x={600} y={8} w={150} h={34} lines={serverName} bold accent fs={12} />
      <Arrow x1={75} y1={42} x2={75} y2={186} plain dashed />
      <Arrow x1={675} y1={42} x2={675} y2={186} plain dashed />
      {lines(ex.req, 108)}
      <Arrow x1={77} y1={108} x2={673} y2={108} accent />
      {lines(ex.res, 176)}
      <Arrow x1={673} y1={176} x2={77} y2={176} />
      <Box x={10} y={196} w={360} h={58} lines={ex.client} fs={12} fill="box4" bold align="start" subTone="muted" />
      <Box x={390} y={196} w={360} h={58} lines={ex.server} fs={12} fill="box4" bold align="start" subTone="muted" />
    </Svg>
  )
}

const toSteps = (fig: number, server: string, list: { label: string; ex: Exchange; text: ReactNode }[]) =>
  list.map((s, i) => ({ label: s.label, detail: <><ExchangeSvg id={`94-${fig}-${i + 1}`} server={server} ex={s.ex} /><p>{s.text}</p></> }))

const prgSteps = toSteps(11, 'Rails', [
  {
    label: 'POST を送る',
    ex: {
      req: ['POST /articles HTTP/1.1', 'Content-Type: application/x-www-form-urlencoded', 'article[title]=Redirect basics'],
      res: ['HTTP/1.1 303 See Other', 'location: http://127.0.0.1:3000/articles/5', 'content-length: 0'],
      client: ['curl（-L 付き）', '303 なので、location の URL を GET で要求する'],
      server: ['Rails', '記事5を保存し、本文のない応答を返す'],
    },
    text: <>Rails は記事を保存し、本文のない 303 を返します。<code>-L</code> を付けた curl とブラウザーは 303 を受け取ると、<code>location</code> の URL へ GET で要求し直します。このとき POST の本文は送りません。</>,
  },
  {
    label: 'GET で取得し直す',
    ex: {
      req: ['GET /articles/5 HTTP/1.1', '（本文なし）'],
      res: ['HTTP/1.1 200 OK', 'content-type: text/html; charset=utf-8', 'Redirect basics'],
      client: ['curl（-L 付き）', '最後に送った要求は GET /articles/5'],
      server: ['Rails', '記事5を読んで返す。保存はしない'],
    },
    text: <>2つ目の要求は GET で、本文を持ちません。Rails は記事5を読み、HTML を返します。ブラウザーの場合は、アドレス欄に <code>/articles/5</code> が表示され、再読み込みで送り直す要求もこの GET になります。</>,
  },
  {
    label: '再読み込みする',
    ex: {
      req: ['GET /articles/5 HTTP/1.1'],
      res: ['HTTP/1.1 200 OK', 'Redirect basics'],
      client: ['curl', '同じ GET を送り直す'],
      server: ['Rails', '記事の件数は変わらない'],
    },
    text: <>再読み込みで送り直すのは <code>GET /articles/5</code> です。GET は安全なメソッドなので、何回送っても記事は増えません。同じアプリで GET を送り直した後に <code>GET /articles</code> で一覧を取得しても、件数は変わっていませんでした。</>,
  },
  {
    label: '題名が空の POST',
    ex: {
      req: ['POST /articles HTTP/1.1', 'article[title]='],
      res: ['HTTP/1.1 422 Unprocessable Content', 'content-type: text/html; charset=utf-8', '題名を入力してください'],
      client: ['curl', 'location がないので、次の要求は送らない'],
      server: ['Rails', '検証に失敗し、記事を保存しない'],
    },
    text: <>保存できなかった場合は、リダイレクトせずに 422 と誤りを示す本文を返します。<code>location</code> がないので、curl もブラウザーも次の要求を送りません。ブラウザーは返された本文をそのまま表示します。</>,
  },
])

const cookieSteps = toSteps(12, 'Rails（CookieStore）', [
  {
    label: '1回目（Cookie なし）',
    ex: {
      req: ['GET /visits HTTP/1.1', '（Cookie ヘッダーなし）'],
      res: ['HTTP/1.1 200 OK', 'set-cookie: _demo_app_session=値A; path=/; httponly; samesite=lax', 'visits=1'],
      client: ['curl の jar.txt', '値A（YHVUqVrxUrjpy8cP…）を保存する'],
      server: ['Rails が読んだセッション', '空 → count を 1 にして暗号化し、値A を返す', '発行した値はサーバーに残さない'],
    },
    text: <>要求に Cookie がないので、Rails は空のセッションから始めます。コントローラーが <code>session[:count]</code> を 1 にすると、CookieStore はセッション全体を暗号化した値A を <code>set-cookie</code> で返します。curl は <code>-c</code> の指定に従って値A を jar.txt に保存します。</>,
  },
  {
    label: '2回目（値A を送る）',
    ex: {
      req: ['GET /visits HTTP/1.1', 'Cookie: _demo_app_session=値A'],
      res: ['HTTP/1.1 200 OK', 'set-cookie: _demo_app_session=値B; path=/; httponly; samesite=lax', 'visits=2'],
      client: ['curl の jar.txt', '値A を値B（t3gQ48thuVB67DMl…）で上書きする'],
      server: ['Rails が読んだセッション', '値A を復号すると count=1', '2 にして暗号化し、値B を返す'],
    },
    text: <>curl は <code>-b</code> の指定に従い、jar.txt の値A を <code>Cookie</code> ヘッダーで送ります。Rails は値A を復号して count=1 を読み、2 に増やして暗号化し直した値B を返します。セッションの中身が変わったので、Cookie の値も変わります。</>,
  },
  {
    label: '3回目（値B を送る）',
    ex: {
      req: ['GET /visits HTTP/1.1', 'Cookie: _demo_app_session=値B'],
      res: ['HTTP/1.1 200 OK', 'set-cookie: _demo_app_session=値C; path=/; httponly; samesite=lax', 'visits=3'],
      client: ['curl の jar.txt', '値B を値C（u2FedtVuXc%2BKxgEX…）で上書きする'],
      server: ['Rails が読んだセッション', '値B を復号すると count=2', '3 にして暗号化し、値C を返す'],
    },
    text: <>同じ手順で count が 3 になり、値C が返ります。jar.txt に残るのは、最後に受け取った値C だけです。</>,
  },
  {
    label: '書き換えた値を送る',
    ex: {
      req: ['GET /visits HTTP/1.1', 'Cookie: _demo_app_session=値C の11文字目を A に変えた値'],
      res: ['HTTP/1.1 200 OK', 'set-cookie: _demo_app_session=新しい値; path=/; httponly; samesite=lax', 'visits=1'],
      client: ['curl', '-b で値を直接指定する（jar.txt は使わない）'],
      server: ['Rails が読んだセッション', '認証タグが合わず復号できない → 空として扱う', 'count を 1 にして、新しい値を返す'],
    },
    text: <>1文字でも書き換えると、認証タグ（改ざんを検出するための値）の検査に失敗して復号できません。Rails はエラーにせず、Cookie がない場合と同じく空のセッションとして処理するので、<code>visits=1</code> が返ります。</>,
  },
  {
    label: '古い値A を送る',
    ex: {
      req: ['GET /visits HTTP/1.1', 'Cookie: _demo_app_session=値A（1回目に受け取った値）'],
      res: ['HTTP/1.1 200 OK', 'set-cookie: _demo_app_session=新しい値; path=/; httponly; samesite=lax', 'visits=2'],
      client: ['curl', '-b で1回目の値A を直接指定する'],
      server: ['Rails が読んだセッション', '値A は正しく復号できる → count=1', '値A が古いことは分からない'],
    },
    text: <>値A は Rails 自身が暗号化した値なので、認証タグの検査に通ります。サーバーは発行した値を記録していないため、値C の後に値A が届いても古い値だと判断できず、count=1 から数えて <code>visits=2</code> を返します。CookieStore のセッションだけでログイン状態を管理すると、ログアウトの前に保存しておいた Cookie も同じ理由で受け付けられます。</>,
  },
])

const chapter: Chapter = {
  number: 94,
  part: 1,
  title: 'Web アプリケーションと HTTP',
  summary: 'ブラウザーから届く要求と Rails が返す応答を、curl で実際に送って読みます。メソッド、ステータスコード、ヘッダー、Cookie、リダイレクト、JSON を、HTML の画面と JSON API の両方で確かめます。',
  goals: [
    'URL の各部分と、要求の要求行・ヘッダー・本文、応答の状態行・ヘッダー・本文を区別して読める',
    'RFC 9110 の「安全」と「冪等」の定義を説明し、再送してよい要求かを判断できる',
    'Rails が返す 201・303・400・404・406・422 を実験で確かめ、どの状況で使うかを説明できる',
    'Set-Cookie と Cookie のやり取りから、Rails のセッションがどこに保存されるかを説明できる',
    '同じリソースを HTML と JSON で返す API を、REST の考え方と JSON の型の制約を踏まえて設計できる',
  ],
  prerequisites: [],
  sections: [
    {
      id: 'client-server',
      title: '記事一覧を表示するまで',
      body: <>
        <p>ブラウザーのアドレス欄に記事一覧の URL を入力すると、ブラウザーがサーバーに一覧を要求します。この要求を出す側が<Term>クライアント</Term>です。要求を受け、応答を返す側が<Term>サーバー</Term>です。スマートフォンのアプリやコマンドラインの <code>curl</code> もクライアントになれます。サーバーと呼ぶときは、機械全体を指すことも、要求を受けるプログラムを指すこともあります。この章では、Rails のアプリを動かして要求を受けるプログラムをサーバーと呼びます。</p>
        <p><Term>Web アプリケーション</Term>はクライアントから届いた要求に応じてサーバーで処理をして、結果を返すプログラムです。記事一覧なら、サーバーはデータベースから記事を検索し、一覧の HTML を作って返します。ブラウザーは受け取った HTML を表示するだけで、記事の検索はしません。どちらで何を実行しているかを区別しておくと、表示が遅いときや誤った内容が出たときに、調べる場所を決められます。たとえば検索条件の誤りはサーバー側のコードとログを、表示の崩れはブラウザーが受け取った HTML と CSS を調べます。</p>
        <p>URL が <code>https://example.test/articles?page=2</code> なら、<code>https</code> は接続方法を指定するスキーム、<code>example.test</code> はホスト、<code>/articles</code> はパスです。<code>page=2</code> はクエリ文字列で、この例では一覧の2ページ目を選ぶ条件に使います。ポート番号を省略すると、<code>https</code> では 443 番、<code>http</code> では 80 番に接続します<Ref n={1} />。URL の末尾に <code>#comments</code> があれば、ブラウザーが受け取った文書を表示するときに、その位置へ移動するために使います。この部分は HTTP の要求先としてサーバーに送られません。</p>
        <Figure n={figureNumber(94, 1)} title="URL の部分と、要求に入る部分" caption="RFC 9110 の URI の構成をもとにした図。ホストは Host ヘッダーに、パスとクエリは要求行に入ります。HTTP/2 以降では同じ情報を別の形式で送ります。">
          <UrlFigure />
        </Figure>
        <p>ブラウザーは要求を送る前に、ホスト名から接続先の IP アドレスを DNS で調べ、TCP で接続し、<code>https</code> なら TLS で暗号化の準備をします。この準備の手順は <ChapterLink n={104} /> と <ChapterLink n={105} /> で扱います。この章では、接続ができた後に送り合う HTTP のメッセージを読みます。</p>
        <p>ブラウザーは応答の HTML を読み、そこに画像やスタイルシートへの参照があれば追加で要求を送ります。アドレス欄で一度移動したときも、ネットワーク上で複数の要求が発生します（図 {figureNumber(94, 2)}）。開発者ツールのネットワーク欄で、文書の要求と画像の要求を個別に開くと、異なるパスやステータスを確認できます。</p>
        <Figure n={figureNumber(94, 2)} title="1回のページ表示で送る複数の要求（段階送り）" caption="順番を分かりやすくするための概念モデルです。実際のブラウザーは複数の要求を同時に送ることがあり、保存済みの CSS や画像は要求しないこともあります。Nginx などがファイルを直接返す構成では、CSS や画像の要求は Rails に届きません。">
          <Stepper steps={pageLoadSteps} />
        </Figure>
        <p>本番では、ブラウザーと Rails の間にロードバランサーや Nginx が入ることがあります。それぞれが要求を受け取り、次の段へ別の接続で送り直します。どの段がどのヘッダーを付けたかを含めた経路は <ChapterLink n={26}>本番のリクエスト経路</ChapterLink>で追います。</p>
      </>,
    },
    {
      id: 'lab',
      title: '実験用の Rails アプリを Docker で動かす',
      body: <>
        <p>この章の実験では、記事を扱う小さな Rails アプリを1つのファイルに書き、Docker のコンテナで動かして curl で要求を送ります。<code>rails new</code> で作るアプリと違い、データベースもビューのファイルも使いません。記事は Ruby のハッシュに入れておくので、サーバーを止めると消えます。HTTP のやり取りを観察するための作りで、本番のアプリの書き方ではありません。</p>
        <Code lang="ruby" title="app.rb（Rails 8.1.4.1・Ruby 4.0.9）" code={`
require "rails"
require "active_model/railtie"
require "action_controller/railtie"

class Article
  include ActiveModel::Model
  include ActiveModel::Serializers::JSON
  attr_accessor :id, :title
  validates :title, presence: true
  def attributes = { "id" => id, "title" => title }

  STORE = { 1 => "Rails basics", 2 => "HTTP basics" }
  LOCK = Mutex.new
  def self.all = LOCK.synchronize { STORE.map { |id, t| new(id:, title: t) } }
  def self.find(id) = (t = STORE[id.to_i]) && new(id: id.to_i, title: t)
  def save
    return false unless valid?
    LOCK.synchronize { self.id = STORE.keys.max.to_i + 1; STORE[id] = title }
    true
  end
  def destroy = LOCK.synchronize { STORE.delete(id) }
end

class DemoApp < Rails::Application
  config.load_defaults 8.1
  config.root = __dir__
  config.eager_load = false
  config.secret_key_base = "0" * 64 # 実験用の固定値。本物のアプリでは credentials などから渡す
  config.logger = ActiveSupport::Logger.new($stdout)
  config.log_level = :info
  routes.append do
    resources :articles, only: %i[index show create destroy]
    get "/visits", to: "visits#show"
  end
end
DemoApp.initialize!

class ArticlesController < ActionController::Base
  skip_forgery_protection # 実験で curl から送るため。本物のアプリでは外さない

  def index
    articles = Article.all
    respond_to do |format|
      format.html { render html: articles.map(&:title).join("\\n") }
      format.json { render json: articles }
    end
  end

  def show
    article = Article.find(params[:id])
    return head :not_found unless article
    respond_to do |format|
      format.html { render html: article.title }
      format.json { render json: article }
    end
  end

  def create
    article = Article.new(title: params.dig(:article, :title))
    if article.save
      respond_to do |format|
        format.html { redirect_to "/articles/#{article.id}", status: :see_other }
        format.json { render json: article, status: :created, location: "/articles/#{article.id}" }
      end
    else
      respond_to do |format|
        format.html { render html: "題名を入力してください", status: :unprocessable_content }
        format.json { render json: { errors: article.errors.full_messages }, status: :unprocessable_content }
      end
    end
  end

  def destroy
    article = Article.find(params[:id])
    return head :not_found unless article
    article.destroy
    head :no_content
  end
end

class VisitsController < ActionController::Base
  def show
    session[:count] = session[:count].to_i + 1
    render plain: "visits=#{session[:count]}\\n"
  end
end
`} />
        <p><code>Article</code> は題名が空なら保存しない検証を持つ、記事のクラスです。<code>routes.append</code> のブロックの <code>resources :articles</code> は、一覧・1件の表示・作成・削除の4つのアクションへのルートを作ります。<code>VisitsController</code> は、同じクライアントから何回目の要求かをセッションに数えます。Cookie の節で使います。</p>
        <p>Puma は Rails のアプリを読み込んで HTTP の要求を受け付けるサーバーです（<ChapterLink n={23} />）。<code>config.ru</code> に起動するアプリを書き、コンテナの中で Puma を起動します。curl は同じコンテナの中で実行しました。ruby:4.0 のイメージには curl 8.14.1 が入っています。</p>
        <Code lang="bash" title="起動と要求の送信（検証では gem を入れたディレクトリを /usr/local/bundle にマウントした）" code={`
# config.ru
require_relative "app"
run DemoApp

$ docker run -d --name http-lab -v "$PWD":/work -w /work ruby:4.0 \\
    sh -c 'gem install rails:8.1.4.1 puma:8.0.2 && puma -t 3:3 -b tcp://0.0.0.0:3000 config.ru'
$ docker exec http-lab curl -v http://127.0.0.1:3000/articles
`} />
        <Callout kind="warn" title="最初の実行で POST がすべて 422 になった">
          <p>最初は <code>DemoApp.initialize!</code> を <code>config.ru</code> に書き、コントローラーを定義した後で初期化していました。その状態では、題名を入れた POST も 422 になり、ログには <code>ActionController::InvalidAuthenticityToken</code> が出ました。<code>load_defaults 8.1</code> を指定したアプリでは、初期化の途中で <code>ActionController::Base</code> に CSRF の検査（<ChapterLink n={21} section="csrf" />）が加わります<Ref n={14} />。ActiveSupport のコールバックは親クラスに加えると定義済みのサブクラスにも加わるため、先に書いた <code>skip_forgery_protection</code> が効かなくなりました。初期化をコントローラーの定義より前に移すと、POST は期待どおりに処理されました。422 が返ったときは、検証の失敗と決めつけず、ログで例外の名前を確かめます。</p>
        </Callout>
      </>,
    },
    {
      id: 'request-response',
      title: '要求と応答のどこを読むか',
      body: <>
        <p><Term>HTTP</Term> は要求と応答の意味を定める通信規約です<Ref n={1} />。要求には操作を示すメソッドと対象、補足情報を載せるヘッダー、必要に応じて本文があります。応答には処理結果を示すステータスコード、ヘッダー、必要に応じて本文があります。実験用のアプリに <code>curl -v</code> で記事一覧を要求しました。<code>-v</code> を付けると、curl が送った行を <code>&gt;</code> で、受け取った行を <code>&lt;</code> で、接続の経過を <code>*</code> で始めて表示します<Ref n={12} />。</p>
        <Code lang="text" title="curl -v http://127.0.0.1:3000/articles の出力（Rails 8.1.4.1・Puma 8.0.2・curl 8.14.1）" code={`
*   Trying 127.0.0.1:3000...
* Connected to 127.0.0.1 (127.0.0.1) port 3000
> GET /articles HTTP/1.1
> Host: 127.0.0.1:3000
> User-Agent: curl/8.14.1
> Accept: */*
>
< HTTP/1.1 200 OK
< x-frame-options: SAMEORIGIN
< x-xss-protection: 0
< x-content-type-options: nosniff
< x-permitted-cross-domain-policies: none
< referrer-policy: strict-origin-when-cross-origin
< content-type: text/html; charset=utf-8
< vary: Accept, X-Requested-With
< etag: W/"fc21419d1bcedce2529972d3485ff11a"
< cache-control: max-age=0, private, must-revalidate
< x-request-id: ac035fc7-2033-423a-8adc-96647530b681
< x-runtime: 0.581750
< content-length: 24
<
Rails basics
HTTP basics
`} />
        <p>要求の1行目 <code>GET /articles HTTP/1.1</code> を要求行と呼び、メソッド、対象のパス、HTTP のバージョンを空白で区切って並べます。2行目からがヘッダーで、「名前: 値」を1行に1つずつ書きます。<code>Host</code> は接続先のホスト名とポート、<code>User-Agent</code> は要求を送ったプログラム、<code>Accept</code> は受け取りたい本文の種類です。<code>*/*</code> はどの種類でもよいという意味です。ヘッダーの後の空行で要求が終わります。GET の要求には本文がありません。</p>
        <p>応答の1行目を状態行と呼び、バージョン、ステータスコードの <code>200</code>、その説明の語句 <code>OK</code> を並べます。<code>content-type</code> は本文の種類と文字コード、<code>content-length</code> は本文のバイト数です。本文の「Rails basics」「HTTP basics」と改行1つで24バイトになります。<code>x-runtime</code> は Rails が応答を作るのにかかった秒数で、この要求はサーバーを起動した直後の1回目なので 0.58 秒かかりました。2回目以降の要求では 0.006 秒前後でした。<code>x-frame-options</code> などの行は、Rails が既定で付けるセキュリティ関連のヘッダーです。どのミドルウェアが付けるかは <ChapterLink n={6} section="http-message" />で読みます。</p>
        <Figure n={figureNumber(94, 3)} title="HTTP/1.1 のメッセージの構造" caption="後の節で送る JSON の POST と、その応答の実測をもとにした図。HTTP/2 以降は同じ項目をバイナリーの形式で送るため、curl の表示も変わります。">
          <MessageFigure />
        </Figure>
        <p>ヘッダーの名前は大文字と小文字を区別しません<Ref n={1} />。curl が送った <code>Host</code> と、Rails が返した小文字の <code>content-type</code> は、どちらも規約どおりの書き方です。Rack 3 はアプリが返すヘッダー名を小文字にする決まりなので、Rails の応答のヘッダー名は小文字で届きます。プログラムでヘッダーを読むときは、名前の大文字と小文字を区別しない方法で探します。</p>
        <h3>同じ URL から HTML と JSON を受け取る</h3>
        <p>同じ記事一覧を、<code>Accept: application/json</code> を付けて要求しました。コントローラーの <code>respond_to</code> は要求の <code>Accept</code> ヘッダーや URL の拡張子から形式を選び、対応するブロックだけを実行します<Ref n={5} />。</p>
        <Code lang="text" title="Accept を変えたときの応答（共通のヘッダーを省略）" code={`
$ curl -v -H 'Accept: application/json' http://127.0.0.1:3000/articles
> Accept: application/json
< HTTP/1.1 200 OK
< content-type: application/json; charset=utf-8
< vary: Accept, X-Requested-With
< content-length: 64
[{"id":1,"title":"Rails basics"},{"id":2,"title":"HTTP basics"}]

$ curl -i -H 'Accept: application/xml' http://127.0.0.1:3000/articles/1
HTTP/1.1 406 Not Acceptable
`} />
        <div className="table-wrap"><table>
          <thead><tr><th scope="col">要求</th><th scope="col">ステータスとメディアタイプ</th><th scope="col">本文</th></tr></thead>
          <tbody>
            <tr><td>GET /articles、<code>Accept: */*</code></td><td>200、<code>text/html</code></td><td>題名を改行で並べた24バイト</td></tr>
            <tr><td>GET /articles、<code>Accept: application/json</code></td><td>200、<code>application/json</code></td><td>記事の配列（64バイト）</td></tr>
            <tr><td>GET /articles/1.json</td><td>200、<code>application/json</code></td><td><code>{'{"id":1,"title":"Rails basics"}'}</code></td></tr>
            <tr><td>HEAD /articles/1、<code>Accept: application/json</code></td><td>200、<code>application/json</code></td><td>なし（<code>content-length: 0</code>）</td></tr>
            <tr><td>GET /articles/1、<code>Accept: application/xml</code></td><td>406</td><td>アクションが XML の形式を持たない</td></tr>
          </tbody>
        </table></div>
        <p><code>Accept</code> を変えると、応答の <code>content-type</code> と本文が変わりました。拡張子の <code>.json</code> を付けた場合も JSON が返ります。<code>respond_to</code> に XML の形式がないので、XML を求めた要求には 406 Not Acceptable が返りました。HEAD は GET と同じアクションを実行し、本文を除いた応答を返すメソッドで、curl では <code>-I</code> で送ります。RFC 9110 は HEAD の応答に、本文を作るときに決まるヘッダーを省いてよいとしています<Ref n={1} />。この実験では <code>content-length: 0</code> が返ったので、HEAD で本文の大きさを調べたいときは、相手のサーバーが何を返すかを先に確かめます。</p>
        <p><code>vary: Accept</code> は「この応答は <code>Accept</code> の値によって変わる」ことを、ブラウザーや途中のキャッシュに伝えるヘッダーです。キャッシュは URL が同じでも <code>Accept</code> が違えば別の応答として保存します。HTML と JSON を同じ URL で返す場合に、JSON を求めた要求に HTML が返る事故を防ぎます。実際の出力の <code>vary</code> に <code>X-Requested-With</code> も並ぶのは、Rails が形式を選ぶときに、JavaScript から送った要求に付くことがある <code>X-Requested-With: XMLHttpRequest</code> の有無も見るからです<Ref n={17} />。</p>
        <p><code>Accept</code> と <code>Content-Type</code> は役割が違います。<code>Accept</code> は応答としてほしい形式、<code>Content-Type</code> はそのメッセージに付いている本文の形式です。JSON を送るクライアントは要求の <code>Content-Type: application/json</code> で本文の形式を示し、Rails はその値を見て本文を JSON として読みます。フォームを送信するブラウザーは <code>application/x-www-form-urlencoded</code> などを使います。Rails が本文を何として解釈したかを調べるときは、実際に送ったヘッダーと本文を見ます。</p>
      </>,
    },
    {
      id: 'https',
      title: 'HTTPS で守られる範囲',
      body: <>
        <p><Term>HTTPS</Term> は HTTP のメッセージを TLS で保護して送る方式です。TLS は3つのことを行います。通信の暗号化、途中で書き換えられたことの検出、接続先が証明書の持ち主であることの確認です<Ref n={8} />。HTTPS でも、送り合う HTTP のメッセージの中身は前の節と同じです。違いはそのメッセージを TLS の接続の中で送ることです。</p>
        <p>実験用のアプリを、Puma の TLS の機能で 3443 番のポートでも受け付けるようにしました<Ref n={13} />。証明書は openssl で作った自己署名の証明書です。自己署名の証明書は、ブラウザーや curl が最初から信頼している認証局の署名を持ちません。</p>
        <Code lang="bash" title="自己署名の証明書を作り、HTTP と HTTPS の両方で起動する" code={`
$ openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 30 \\
    -subj '/CN=127.0.0.1' -addext 'subjectAltName=IP:127.0.0.1'
$ puma -t 3:3 -b tcp://0.0.0.0:3000 -b 'ssl://0.0.0.0:3443?key=key.pem&cert=cert.pem' config.ru
`} />
        <Code lang="text" title="証明書を信頼していない curl と、--cacert で信頼させた curl（一部を省略）" code={`
$ curl -v https://127.0.0.1:3443/articles
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (OUT), TLS alert, unknown CA (560):
* SSL certificate problem: self-signed certificate
$ echo $?
60

$ curl -v --cacert cert.pem https://127.0.0.1:3443/articles
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519MLKEM768 / RSASSA-PSS
* Server certificate:
*  subject: CN=127.0.0.1
*  subjectAltName: host "127.0.0.1" matched cert's IP address!
*  SSL certificate verify ok.
> GET /articles HTTP/1.1
> Host: 127.0.0.1:3443
< HTTP/1.1 200 OK
< content-type: text/html; charset=utf-8
Rails basics
HTTP basics
`} />
        <p>1つ目の curl は、サーバーから証明書を受け取った時点で「信頼できない認証局」と判断して接続を閉じ、終了コード 60 で終わりました。HTTP の要求は送られていません。Rails のログを数えると、この接続の前後で <code>Started GET</code> の行は増えていませんでした。2つ目は <code>--cacert</code> で証明書を信頼する対象に加えたので検証が通り、その後の <code>GET /articles</code> と応答は HTTP の場合と同じ形でした。</p>
        <Figure n={figureNumber(94, 4)} title="TLS で暗号化される範囲と、経路から分かること" caption="TLS 1.3（RFC 8446）をもとにした模式図。TLS を終端するロードバランサーや Nginx は暗号化を解くので、HTTP のメッセージ全体を読めます。">
          <TlsFigure />
        </Figure>
        <p>TLS で暗号化されるのは HTTP のメッセージ全体です。URL のパスとクエリ、Cookie、本文は、経路の途中からは読めません。一方で、接続先の IP アドレスとポート、通信の量と時刻は経路から分かります。ECH（Encrypted Client Hello）を使わない通常の接続では、TLS の始めにクライアントが送る SNI の接続先のホスト名も暗号化されません（<ChapterLink n={105} section="sni" />）。クエリにトークンを入れた URL は経路では隠れますが、サーバーのアクセスログや、ブラウザーの履歴には残ります。そのため、トークンのような秘密の値はクエリに入れず、ヘッダーや本文で送ります。</p>
        <p>TLS をロードバランサーで終端する構成では、ブラウザーとロードバランサーの間は HTTPS、ロードバランサーから Rails までは HTTP になることがあります。この場合、Rails は届いた要求だけでは元の要求が HTTPS だったかを判断できないため、ロードバランサーが <code>X-Forwarded-Proto</code> ヘッダーで元のスキームを伝えます。<code>config.force_ssl</code> による HTTPS への移動や Cookie の <code>Secure</code> 属性はこの値を使います（<ChapterLink n={21} section="host-ssl-csp" />、<ChapterLink n={105} section="termination" />）。</p>
        <p>開発時にブラウザーとサーバーのどちらが失敗したかを調べるときは、HTTP のステータスが届いたかを先に確認します。上の1つ目のように TLS の検証で止まった場合は、ステータスもヘッダーもなく、Rails のログにも何も出ません。ステータスが届いていれば、接続と TLS は成功しており、エラーはアプリケーションかその手前のプロキシが返したものです。</p>
      </>,
    },
    {
      id: 'methods',
      title: 'メソッドの意味と「安全」「冪等」',
      body: <>
        <p>HTTP メソッドは要求の意図を表します。<code>GET</code> では表現を取得し、<code>HEAD</code> は GET と同じ処理で本文を除いた応答を求めます。<code>POST</code> では対象のリソースに本文の処理を依頼します。記事一覧への POST は新しい記事を作る設計にできます。<code>PUT</code> は指定した対象の状態を、送った表現で置き換える要求です。<code>PATCH</code> は部分的な変更<Ref n={7} />、<code>DELETE</code> は対象と現在の機能の関連を削除する要求として使います。Rails の <code>resources</code> がメソッドとパスの組をどのアクションに割り当てるかは <ChapterLink n={9} section="resources" />で確認できます。</p>
        <p>RFC 9110 はメソッドの性質として「安全」と「冪等」を定義しています<Ref n={1} />。<dfn>安全</dfn>なメソッドとは、その定義上、クライアントがサーバーの状態の変更を要求せず、期待もしないメソッドです。GET、HEAD、OPTIONS、TRACE が該当します。アクセスログの記録やアクセス数の集計のように、要求の結果としてサーバー側で行われる処理はあり得ます。この定義が区別するのは、クライアントが変更を求めたかどうかです。クライアントは、求めていない変更の責任を問われません。</p>
        <p>この定義には実務上の意味があります。検索エンジンの巡回プログラムや、ブラウザーの先読みの機能は、安全なメソッドであることを前提に GET を自由に送ります。<code>GET /articles/4/delete</code> のようなリンクで記事を削除する設計にすると、利用者がクリックしなくても、巡回プログラムが記事を消すことがあります。RFC 9110 も GET などの安全なメソッドで状態を変える動作が起きるリソースでは、その動作を無効にするよう求めています。</p>
        <p>同じ要求を何回送っても、サーバーに対して意図した効果が1回送った場合と同じであることを<dfn>冪等</dfn>と呼びます。PUT、DELETE と、安全なメソッドのすべてが冪等です。冪等は応答の中身が同じという意味ではありません。DELETE の2回目の応答が 404 でも、対象が存在しないという結果が同じなら、冪等の性質に当てはまります。</p>
        <Figure n={figureNumber(94, 5)} title="RFC 9110 のメソッドの性質と Rails での主な使い方" caption="PATCH は RFC 5789 で定義され、安全でも冪等でもないメソッドとして扱われます。送る内容によっては冪等な使い方もできます。">
          <div className="table-wrap"><table><thead><tr><th scope="col">メソッド</th><th scope="col">安全</th><th scope="col">冪等</th><th scope="col">resources での主な使い方</th></tr></thead>
          <tbody>
            <tr><td>GET</td><td>はい</td><td>はい</td><td>一覧（index）、1件の表示（show）、フォームの表示（new・edit）</td></tr>
            <tr><td>HEAD</td><td>はい</td><td>はい</td><td>GET のルートで処理し、本文を除いて返す</td></tr>
            <tr><td>POST</td><td>いいえ</td><td>いいえ</td><td>作成（create）</td></tr>
            <tr><td>PUT</td><td>いいえ</td><td>はい</td><td>更新（update）。Rails は PATCH と同じアクションに割り当てる</td></tr>
            <tr><td>PATCH</td><td>いいえ</td><td>いいえ</td><td>更新（update）</td></tr>
            <tr><td>DELETE</td><td>いいえ</td><td>はい</td><td>削除（destroy）</td></tr>
          </tbody></table></div>
        </Figure>
        <p>実験用のアプリで、同じ本文の POST と、同じ記事への DELETE を2回ずつ送りました。サーバーを起動し直し、記事が1と2の2件ある状態から始めています。</p>
        <Code lang="text" title="POST を2回、DELETE を2回送った結果（共通のヘッダーを省略）" code={`
$ curl -i -H 'Content-Type: application/json' -H 'Accept: application/json' \\
    -d '{"article":{"title":"Cookie basics"}}' http://127.0.0.1:3000/articles
HTTP/1.1 201 Created
location: /articles/3
{"id":3,"title":"Cookie basics"}

$ curl -i （同じコマンドをもう一度）
HTTP/1.1 201 Created
location: /articles/4
{"id":4,"title":"Cookie basics"}

$ curl -i -X DELETE http://127.0.0.1:3000/articles/4
HTTP/1.1 204 No Content
$ curl -i -X DELETE http://127.0.0.1:3000/articles/4
HTTP/1.1 404 Not Found

$ curl -H 'Accept: application/json' http://127.0.0.1:3000/articles
[{"id":1,"title":"Rails basics"},{"id":2,"title":"HTTP basics"},{"id":3,"title":"Cookie basics"}]
`} />
        <Figure n={figureNumber(94, 6)} title="POST と DELETE を2回ずつ送ったときの記事の状態" caption="上の実行結果をもとにした図です。冪等かどうかは、応答のコードではなくサーバーの状態への効果で判断します。">
          <IdempotentFigure />
        </Figure>
        <p>POST は2回とも 201 を返し、同じ題名の記事が2件できました。DELETE は1回目が 204、2回目が 404 で、記事4がない状態はどちらの後でも同じです。</p>
        <p>冪等の性質は、通信が途中で切れたときの扱いに関わります。クライアントが要求を送った後に接続が切れると、サーバーが処理を終えたかどうかをクライアントは知ることができません。RFC 9110 は、冪等なメソッドの要求なら、応答を受け取る前に通信が失敗したときに自動で送り直してよいとしています。冪等でない要求は、冪等だと分かる手段がない限り自動で送り直すべきではないとしています。POST の作成を送り直すと、上の実験のように記事が2件できます。支払いのように重複が困る操作では、要求ごとの識別子をサーバーで記録して2回目を見分けます（<ChapterLink n={52} section="rails-impl" />）。</p>
        <p>PATCH は送る内容によって冪等にも冪等でなくもなります。<code>{'{"title":"新しい題名"}'}</code> のように値を指定して上書きする変更は、何回送っても題名は同じ値になります。「閲覧数を1増やす」のような相対的な変更は、送るたびに結果が変わります。Rails の <code>update</code> で属性に値を代入する書き方は前者です。相対的な変更を受け付ける API では、送り直しの扱いを別に決めます。</p>
      </>,
    },
    {
      id: 'status',
      title: 'ステータスコードの分類と Rails が返す値',
      body: <>
        <p>ステータスコードは3桁の数で、百の位が分類を表します<Ref n={1} />。1xx は処理が続いていることの通知、2xx は成功、3xx はクライアントに追加の動作を求めるリダイレクト、4xx はクライアントの要求に原因があるエラー、5xx はサーバー側のエラーです。RFC 9110 は、知らないコードを受け取ったクライアントは、同じ分類の x00 として扱うよう定めています。たとえば知らない 299 は 200 と同じく成功として扱います。</p>
        <p>実験用のアプリに、正しい JSON、題名が空の JSON、構文が壊れた JSON を送りました。</p>
        <Code lang="text" title="作成の要求に対する 201・422・400（共通のヘッダーを省略）" code={`
$ curl -i -H 'Content-Type: application/json' -H 'Accept: application/json' \\
    -d '{"article":{"title":"Cookie basics"}}' http://127.0.0.1:3000/articles
HTTP/1.1 201 Created
location: /articles/3
{"id":3,"title":"Cookie basics"}

$ curl -i （同じヘッダーで）-d '{"article":{"title":""}}' http://127.0.0.1:3000/articles
HTTP/1.1 422 Unprocessable Content
{"errors":["Title can't be blank"]}

$ curl -i （同じヘッダーで）-d '{"article":' http://127.0.0.1:3000/articles
HTTP/1.1 400 Bad Request
{"status":400,"error":"Bad Request"}
`} />
        <Code lang="text" title="Rails のログ（422 と 400）" code={`
Started POST "/articles" for 127.0.0.1 at 2026-11-27 11:40:31 +0000
Processing by ArticlesController#create as JSON
  Parameters: {"article" => {"title" => ""}}
Completed 422 Unprocessable Content in 248ms (Views: 0.3ms | GC: 0.0ms)

ActionDispatch::Http::Parameters::ParseError (Error occurred while parsing request parameters)
`} />
        <p>201 Created は新しいリソースを作ったことを表し、<code>location</code> ヘッダーで作った記事の URL を伝えます。題名が空の要求は、JSON としては正しく読めたものの、記事として保存できない内容でした。この場合はコントローラーが自分で 422 を返しています。構文が壊れた JSON は、Rails がパラメーターを作る段階で <code>ParseError</code> になり、アクションを実行する前に 400 が返りました。</p>
        <p>例外からステータスコードへの対応は、<code>ActionDispatch::ExceptionWrapper</code> の <code>rescue_responses</code> に登録されています。一覧にない例外は 500 になります<Ref n={10} />。</p>
        <Code lang="ruby" title="actionpack/lib/action_dispatch/middleware/exception_wrapper.rb（12〜29行目から抜粋）" href={`${GH}/actionpack/lib/action_dispatch/middleware/exception_wrapper.rb#L12-L29`} code={`
cattr_accessor :rescue_responses, default: Hash.new(:internal_server_error).merge!(
  "ActionController::RoutingError"                     => :not_found,
  "ActionController::UnknownFormat"                    => :not_acceptable,
  "ActionController::InvalidAuthenticityToken"         => ActionDispatch::Constants::UNPROCESSABLE_CONTENT,
  "ActionDispatch::Http::Parameters::ParseError"       => :bad_request,
  "ActionController::ParameterMissing"                 => :bad_request,
  # …
)
`} />
        <p><code>Hash.new(:internal_server_error)</code> は、登録のないキーを引いたときに <code>:internal_server_error</code>（500）を返すハッシュです。前の節の 406 は <code>UnknownFormat</code> から、実験の最初に起きた CSRF の 422 は <code>InvalidAuthenticityToken</code> から決まりました。Active Record を読み込んだアプリでは、<code>ActiveRecord::RecordNotFound</code> が 404 になるよう、この一覧に追加されます。開発環境では例外の詳細を示す画面が、本番環境では <code>public/404.html</code> などの固定の画面が返ります。この流れは <ChapterLink n={10} section="exceptions" />で追えます。</p>
        <Figure n={figureNumber(94, 7)} title="記事 API で使うステータスコードの例" caption="同じパスでも、操作と結果によって応答が変わります。表の右端は、この章の実験で見たものと Rails での返し方です。">
          <div className="table-wrap"><table><thead><tr><th scope="col">状況</th><th scope="col">コード</th><th scope="col">クライアントが受け取る情報</th><th scope="col">この章の実験と Rails での返し方</th></tr></thead>
          <tbody>
            <tr><td>記事を取得できた</td><td>200</td><td>記事の表現</td><td>GET /articles。<code>render</code> の既定</td></tr>
            <tr><td>記事を新規作成した</td><td>201</td><td>作成した記事の場所を示す <code>Location</code></td><td>JSON の POST。<code>status: :created, location:</code></td></tr>
            <tr><td>記事を削除した</td><td>204</td><td>成功を示すステータス。本文なし</td><td>DELETE。<code>head :no_content</code></td></tr>
            <tr><td>送信後に別の URL を表示する</td><td>303</td><td><code>Location</code>。フォーム送信後に GET の要求を送れる</td><td>フォームの POST。<code>redirect_to …, status: :see_other</code></td></tr>
            <tr><td>本文の構文が壊れている</td><td>400</td><td>要求を読めなかったこと</td><td>壊れた JSON。Rails が例外から決める</td></tr>
            <tr><td>認証情報を提示する必要がある</td><td>401</td><td><code>WWW-Authenticate</code> で認証方式を示す</td><td>API のトークン認証（<ChapterLink n={102} section="bearer" />）</td></tr>
            <tr><td>処理を許可しない</td><td>403</td><td>アクセスを拒否したこと</td><td>認可の失敗</td></tr>
            <tr><td>記事が見つからない</td><td>404</td><td>公開できる範囲の理由</td><td>存在しない ID。<code>head :not_found</code></td></tr>
            <tr><td>求められた形式で返せない</td><td>406</td><td>返せる形式がないこと</td><td><code>Accept: application/xml</code></td></tr>
            <tr><td>読めたが内容を処理できない</td><td>422</td><td>入力の誤りの説明</td><td>題名が空。<code>status: :unprocessable_content</code></td></tr>
            <tr><td>サーバーの処理で想定外の失敗が起きた</td><td>500</td><td>エラーの識別子など。内部の例外情報はログに記録する</td><td>一覧にない例外</td></tr>
          </tbody></table></div>
        </Figure>
        <p>400 と 422 の違いは、要求を読めたかどうかです。RFC 9110 では、422 Unprocessable Content は本文の形式を理解でき、構文も正しいが、含まれる指示を処理できなかったことを表します。クライアントの側では、400 なら送るデータの組み立てを、422 なら入力の値を直します。Rails 8 では、以前の <code>:unprocessable_entity</code> の代わりに、RFC 9110 の名前に合わせた <code>:unprocessable_content</code> を使います。</p>
        <p>401 と 403 も区別します。401 は「認証情報がない、または正しくない」ことを表し、応答の <code>WWW-Authenticate</code> ヘッダーで認証の方式を示します。403 は、認証できたかどうかに関係なく、その操作を許可しないことを表します。存在を知られたくない記事への要求に 403 ではなく 404 を返す設計もあります。どのコードを返しても、本文に内部の例外のメッセージやスタックトレースを含めません。それらはログに記録し、応答には <code>x-request-id</code> のような照合用の値だけを返すと、利用者からの問い合わせとログを結び付けられます。</p>
      </>,
    },
    {
      id: 'redirect',
      title: 'リダイレクトとフォーム送信後の移動',
      body: <>
        <p><Term>リダイレクト</Term>は 3xx のステータスと <code>Location</code> ヘッダーで、別の URL に要求し直すようクライアントに求める応答です。RFC 9110 は、移動が恒久的か一時的かと、要求し直すときにメソッドを変えてよいかで、次のコードを定めています<Ref n={1} />。</p>
        <div className="table-wrap"><table>
          <thead><tr><th scope="col">コード</th><th scope="col">移動</th><th scope="col">要求し直すときのメソッド</th></tr></thead>
          <tbody>
            <tr><td>301 Moved Permanently</td><td>恒久的</td><td>歴史的な理由で、POST を GET に変えるクライアントがある</td></tr>
            <tr><td>302 Found</td><td>一時的</td><td>同上</td></tr>
            <tr><td>303 See Other</td><td>一時的</td><td>GET（または HEAD）で <code>Location</code> を取得する</td></tr>
            <tr><td>307 Temporary Redirect</td><td>一時的</td><td>元のメソッドと本文のまま</td></tr>
            <tr><td>308 Permanent Redirect</td><td>恒久的</td><td>元のメソッドと本文のまま</td></tr>
          </tbody>
        </table></div>
        <p>実験用のアプリで、フォームと同じ形式の POST を送りました。curl の <code>-d</code> は本文を <code>application/x-www-form-urlencoded</code> の形式で送り、<code>-L</code> は <code>Location</code> をたどって要求し直します<Ref n={12} />。</p>
        <Code lang="text" title="フォーム形式の POST と、-L でリダイレクトをたどった結果（一部を省略）" code={`
$ curl -v -d 'article[title]=Form basics' http://127.0.0.1:3000/articles
> POST /articles HTTP/1.1
> Content-Length: 26
> Content-Type: application/x-www-form-urlencoded
< HTTP/1.1 303 See Other
< location: http://127.0.0.1:3000/articles/4
< content-length: 0

$ curl -v -L -d 'article[title]=Redirect basics' http://127.0.0.1:3000/articles
> POST /articles HTTP/1.1
< HTTP/1.1 303 See Other
< location: http://127.0.0.1:3000/articles/5
* Issue another request to this URL: 'http://127.0.0.1:3000/articles/5'
> GET /articles/5 HTTP/1.1
< HTTP/1.1 200 OK
Redirect basics

$ curl -i -d 'article[title]=' http://127.0.0.1:3000/articles
HTTP/1.1 422 Unprocessable Content
content-type: text/html; charset=utf-8
題名を入力してください
`} />
        <p>保存できた POST には 303 と作った記事の URL が返り、<code>-L</code> を付けた curl は2つ目の要求を GET で送りました。コントローラーには <code>/articles/4</code> と書きましたが、<code>location</code> には <code>http://127.0.0.1:3000</code> を補った URL が入っています。<code>redirect_to</code> は要求の Host ヘッダーとスキームから完全な URL を組み立てるためです。題名が空の POST にはリダイレクトせず、422 と誤りを示す本文を返しました。</p>
        <Figure n={figureNumber(94, 8)} title="フォーム送信後のリダイレクト（POST・リダイレクト・GET）" caption="上の実行結果をもとにした図。ブラウザーでは 422 の本文に、入力した値を残したフォームを表示します。">
          <PrgFigure />
        </Figure>
        <p>POST の後に 303 でリダイレクトし、表示は GET で行うこの形は、POST・リダイレクト・GET（PRG）と呼ばれます。POST の応答で直接 HTML を返すと、利用者が再読み込みしたときにブラウザーは POST を送り直そうとし、同じ記事が2件できることがあります。PRG なら、再読み込みで送り直すのは表示の GET です。ただし、応答が届く前にボタンを2回押した場合の重複は PRG では防げません。</p>
        <p>図 {figureNumber(94, 9)} では上のやり取りを要求と応答の1往復ずつ進め、それぞれの時点で curl が次に何をするか、Rails が記事を保存したかを確かめられます。</p>
        <Figure n={figureNumber(94, 9)} title="POST・303・GET を1往復ずつ進める（段階送り）" caption="上の curl -v -L と curl -i の実行結果を、要求と応答の1往復ずつに分けた概念モデルです。ヘッダーは一部だけを示しています。実際のブラウザーは Cookie や Accept などのヘッダーも送り、受け取った HTML を画面に表示します。">
          <Stepper steps={prgSteps} />
        </Figure>
        <p><code>redirect_to</code> の既定のステータスは 302 です<Ref n={11} />。302 の後に POST を GET に変えるかどうかはクライアントの実装によるため、POST・PATCH・DELETE の後のリダイレクトには <code>status: :see_other</code> を付けると、次の要求が GET になることをコードで示せます。<code>render</code> と <code>redirect_to</code> の使い分けは <ChapterLink n={10} section="render-redirect" />で、利用者が指定した URL へのリダイレクトを制限する方法は <ChapterLink n={21} section="redirects" />で扱います。</p>
      </>,
    },
    {
      id: 'cookies',
      title: 'Cookie とセッションで前の要求と結び付ける',
      body: <>
        <p>HTTP の要求は、それぞれ独立して処理できるように設計されています。サーバーは要求のメソッドとパスだけでは、ある要求が前の要求と同じブラウザーから来たかを区別できません。ログイン後のページで利用者を特定するには、クライアントから、前の要求と結び付けるための値を毎回受け取ります。そのための仕組みが <Term>Cookie</Term> です<Ref n={6} />。サーバーが応答に <code>Set-Cookie</code> ヘッダーを付けると、ブラウザーは条件に従って値を保存し、後続の対象となる要求に <code>Cookie</code> ヘッダーを付けます。</p>
        <p>実験用のアプリの <code>/visits</code> に、curl で3回要求しました。<code>-c</code> は受け取った Cookie をファイルに保存し、<code>-b</code> はファイルの Cookie を要求に付けます<Ref n={12} />。</p>
        <Code lang="text" title="curl -v -c jar.txt -b jar.txt http://127.0.0.1:3000/visits を3回（値の途中を省略）" code={`
# 1回目（jar.txt はまだない）
> GET /visits HTTP/1.1
< HTTP/1.1 200 OK
< set-cookie: _demo_app_session=YHVUqVrxUrjpy8cP…--KaeDaGOKYNB0da9d--Qcaeg7mzrZWXsl%2Fs6ug%2BDQ%3D%3D; path=/; httponly; samesite=lax
visits=1

# 2回目
> GET /visits HTTP/1.1
> Cookie: _demo_app_session=YHVUqVrxUrjpy8cP…--KaeDaGOKYNB0da9d--Qcaeg7mzrZWXsl%2Fs6ug%2BDQ%3D%3D
< HTTP/1.1 200 OK
< set-cookie: _demo_app_session=t3gQ48thuVB67DMl…--vvGtEFSTVAiCTkHs--kgOTqEhaKhaH%2BnuHUQZzvg%3D%3D; path=/; httponly; samesite=lax
visits=2

# 3回目
> Cookie: _demo_app_session=t3gQ48thuVB67DMl…
< set-cookie: _demo_app_session=u2FedtVuXc%2BKxgEX…
visits=3
`} />
        <p>1回目の応答の <code>set-cookie</code> は、<code>_demo_app_session</code> という名前の Cookie を、値と属性とともに保存させる指示です。2回目の要求では curl がその値を <code>Cookie</code> ヘッダーで送り返し、Rails は前回の続きとして <code>visits=2</code> を返しました。値は毎回変わっています。Rails の既定のセッションの保存先である CookieStore は、セッションの中身全体を暗号化して Cookie の値に入れるため、中身が変わるたびに新しい値を送ります<Ref n={4} />。値の <code>--</code> で区切られた3つの部分は、暗号文、初期化ベクトル、改ざんを検出するための認証タグです。</p>
        <Figure n={figureNumber(94, 10)} title="Cookie でセッションの値を運ぶ" caption="上の実行結果をもとにした図。値A〜C は暗号化したセッションの中身で、curl は中身を読めません。ブラウザーも同じように Cookie を保存して送り返します。">
          <CookieFigure />
        </Figure>
        <p>curl が保存したファイルを見ると、Cookie が付いている条件が分かります。</p>
        <Code lang="text" title="jar.txt（curl の Cookie ファイル。値を省略）" code={`
#HttpOnly_127.0.0.1	FALSE	/	FALSE	0	_demo_app_session	u2FedtVuXc%2BKxgEX…
`} />
        <p>列は左から、ホスト、サブドメインにも送るか、パス、HTTPS のときだけ送るか、有効期限、名前、値です。有効期限の <code>0</code> は <code>Set-Cookie</code> に <code>Expires</code> も <code>Max-Age</code> もなかったことを表します。このような Cookie はブラウザーを閉じるまで保持されます。属性の意味は次のとおりです<Ref n={6} />。</p>
        <div className="table-wrap"><table>
          <thead><tr><th scope="col">属性</th><th scope="col">意味</th><th scope="col">実験の応答</th></tr></thead>
          <tbody>
            <tr><td><code>Path</code>、<code>Domain</code></td><td>どのパスとホストへの要求に付けるか</td><td><code>path=/</code>。Domain なしなので発行したホストだけ</td></tr>
            <tr><td><code>Expires</code>、<code>Max-Age</code></td><td>いつまで保存するか</td><td>なし。ブラウザーを閉じるまで</td></tr>
            <tr><td><code>Secure</code></td><td>HTTPS の要求にだけ付ける</td><td>なし。HTTP の開発環境のため</td></tr>
            <tr><td><code>HttpOnly</code></td><td>ページの JavaScript から読めなくする</td><td>あり</td></tr>
            <tr><td><code>SameSite</code></td><td>別のサイトから始まった要求に付けるか</td><td><code>lax</code>。別のサイトからの POST には付けない</td></tr>
          </tbody>
        </table></div>
        <p>次に、Cookie の値を書き換えた場合と、古い値を送り直した場合を試しました。</p>
        <Code lang="text" title="書き換えた値と、1回目の値を送った結果" code={`
$ curl -b "_demo_app_session=（3回目の値の11文字目を A に変えたもの）" http://127.0.0.1:3000/visits
visits=1
$ curl -b "_demo_app_session=（1回目に受け取った値）" http://127.0.0.1:3000/visits
visits=2
`} />
        <p>1文字書き換えた値は復号できず、Rails は空のセッションとして扱いました。そのため visits は1から数え直しています。一方、1回目に受け取った値をそのまま送ると、3回目の後なのに <code>visits=2</code> が返りました。CookieStore ではセッションの中身がクライアント側にあり、サーバーは発行した値を記録していません。そのため、古い値が送られてきても、それが最新の値かどうかを判断できません。ログアウトした後も、以前の Cookie の値を持っている人はその値を送れます。</p>
        <p>ここまでの5回の要求を、要求と応答の1往復ずつ図 {figureNumber(94, 11)} に並べます。段階を進めると、curl が保存している値と、Rails が Cookie から読み出したセッションの中身の関係を確かめられます。</p>
        <Figure n={figureNumber(94, 11)} title="Set-Cookie と Cookie を1往復ずつ進める（段階送り）" caption="上の curl の実行結果を、要求と応答の1往復ずつに分けた概念モデルです。値A〜C は出力の値の先頭だけを示し、4回目と5回目に返った新しい値は省いています。実際のブラウザーは Cookie を属性の条件に合う要求にだけ付け、期限が切れた Cookie を消すなど、curl より多くの規則に従います。">
          <Stepper steps={cookieSteps} />
        </Figure>
        <p>この性質から、ログイン状態の管理では、サーバー側にもセッションの記録を持つ方法がよく使われます。Rails 8 の <code>bin/rails generate authentication</code> が作るコードは、ログインのたびにデータベースの <code>sessions</code> テーブルに行を作り、その ID を署名付きの Cookie に入れます。ログアウトで行を消せば、古い Cookie を送られても利用者を特定できません（<ChapterLink n={102} section="session" />）。Cookie の大きさにも上限があり、RFC 6265 はブラウザーに1つの Cookie で少なくとも 4096 バイトを扱えることを求めています。CookieStore では、セッションに大きな値を入れると上限を超えて例外になります。</p>
        <p>Cookie とセッションを Rails のどのミドルウェアが読み書きするかは <ChapterLink n={10} section="cookies-session" />で、セッションを盗まれたり固定されたりする攻撃への対策は <ChapterLink n={21} section="cookie-session" />で扱います。</p>
      </>,
    },
    {
      id: 'rest',
      title: 'リソースと表現から API を設計する',
      body: <>
        <p>記事そのものを<Term>リソース</Term>と考えると、<code>/articles/42</code> はその記事を指します。サーバーが返す HTML や JSON は、同じ記事を異なる形式で表したデータで、これを<Term>表現</Term>と呼びます。パスで対象を、メソッドで操作を指定すれば、<code>GET /articles/42</code> と <code>DELETE /articles/42</code> は同じ記事に対する別の要求だと読めます。この章の実験用のアプリも、<code>/articles</code> と <code>/articles/:id</code> の2種類のパスに、GET・POST・DELETE を組み合わせていました。</p>
        <p><Term>REST</Term> は Roy Fielding が博士論文で示したアーキテクチャスタイルです<Ref n={3} />。アーキテクチャスタイルとは、システムの構成要素に課す制約の組です。REST の制約と、この章の実験で見たことの対応を表にまとめます。</p>
        <Figure n={figureNumber(94, 12)} title="REST の制約と、この章の実験で見たこと" caption="Fielding の博士論文で REST を定義した章をもとにした表。コードを送ってクライアントで実行する制約（Code-On-Demand）は任意のため省いています。">
          <div className="table-wrap"><table><thead><tr><th scope="col">制約</th><th scope="col">内容</th><th scope="col">この章の実験で見たこと</th></tr></thead>
          <tbody>
            <tr><td>クライアントとサーバー</td><td>表示と、データの保存・処理を分ける</td><td>curl やブラウザーは表示し、Rails が記事を保存する</td></tr>
            <tr><td>ステートレス</td><td>各要求が、処理に必要な情報をすべて含む</td><td>ログイン状態も Cookie で毎回送る</td></tr>
            <tr><td>キャッシュ</td><td>応答がキャッシュしてよいかを示す</td><td><code>cache-control</code>、<code>etag</code>、<code>vary</code></td></tr>
            <tr><td>統一インターフェース</td><td>リソースの識別、表現による操作、自己記述的なメッセージ、ハイパーメディア</td><td>URL で記事を識別し、メソッドとヘッダーで意味を表す。<code>location</code> で次の URL を示す</td></tr>
            <tr><td>階層化システム</td><td>クライアントは途中の層を意識しない</td><td>ロードバランサーや Nginx を挟んでも curl の操作は同じ</td></tr>
          </tbody></table></div>
        </Figure>
        <p>ステートレスはログイン状態を持てないという意味ではありません。サーバーが要求の間でクライアントとの会話の状態を保持せず、各要求が自分で必要な情報を運ぶという制約です。Cookie で毎回セッションの値を送る方式はこれに沿います。ただし前の節のように、その値でサーバー側の <code>sessions</code> テーブルを引く設計は、サーバーに状態を置く設計でもあります。どこまで制約に従うかは、失効のしやすさなどとの比較で決めます。</p>
        <p>Rails のリソースルーティングは HTTP のメソッドとパスを7つのアクションに整理する機能です（<ChapterLink n={9} section="resources" />）。採用しただけで、アプリケーション全体が REST の制約を満たすわけではありません。特に統一インターフェースのハイパーメディアの制約、つまり応答に含まれるリンクから次の操作を選ぶ設計は、多くの JSON API では満たされていません。Fielding 自身も、ハイパーテキストを使わない API を REST と呼ぶことに否定的な見解を書いています<Ref n={15} />。この本では、URL でリソースを識別し、メソッドとステータスコードを RFC 9110 の意味どおりに使う API を「RESTful な API」と呼び、REST そのものとは区別します。</p>
        <p>RESTful な API を設計するときは、次の点を決めます。パスには対象を表す名詞を使います（<code>POST /articles/42/publish</code> より、公開を表すリソースへの <code>POST /articles/42/publication</code>）。作成には 201 と <code>Location</code>、削除には 204 を返し、入力の誤りには 422 と誤りの一覧を返します。一覧は件数が増えるので、ページの指定をクエリで受け取ります。</p>
        <p>管理者が記事を公開する処理では、記事の状態を <code>PATCH</code> で変更する方法と、公開という操作を独立したリソースとして作成する方法を比べられます。後者は公開時刻や実行者を履歴として扱いたいときに説明しやすくなります。どちらを選ぶ場合も、認可、同じ要求を受けたときの扱い、結果のステータスをクライアントとの契約に含めます。ルートの書き方は <ChapterLink n={9} section="resource-design" />で扱います。</p>
      </>,
    },
    {
      id: 'json',
      title: 'JSON の値とアプリケーションの型',
      body: <>
        <p><Term>JSON</Term> は値を文字列で表す交換形式です<Ref n={2} />。キーが文字列のオブジェクト、配列、文字列、数値、真偽値、<code>null</code> を表せます。記事に題名とタグと公開状態を持たせるなら、次のように異なる種類の値を組み合わせられます。</p>
        <Code lang="json" title="記事の表現" code={`{
  "id": 42,
  "title": "Rails basics",
  "tags": ["ruby", "web"],
  "published": false,
  "published_at": null
}`} />
        <p>Ruby の <code>JSON.parse</code> で、この形の JSON に価格と大きな整数を足したものを読み、値ごとのクラスを表示しました。Rails の <code>to_json</code> で Ruby の値を JSON にした結果も並べます。</p>
        <Code lang="ruby" title="json_demo.rb（Ruby 4.0.9・json 3.1.0・activesupport 8.1.4.1）" code={`
require "json"
require "bigdecimal"
require "active_support"
require "active_support/core_ext/object/json"
require "active_support/core_ext/time"

src = '{"id":42,"title":"Rails basics","tags":["ruby","web"],"published":false,' \\
      '"published_at":null,"price":12.50,"big":9007199254740993}'
h = JSON.parse(src)
h.each { |k, v| puts format("%-13s %-22s %s", k, v.inspect, v.class) }
p h.key?("published_at"), h["published_at"], h["missing"], h.key?("missing")

Time.zone = "Asia/Tokyo"
t = Time.zone.local(2026, 11, 27, 20, 0, 0)
puts({ "at" => t, "price" => BigDecimal("12.50"), "sym" => :draft }.to_json)
`} />
        <Code lang="text" title="実行結果" code={`
id            42                     Integer
title         "Rails basics"         String
tags          ["ruby", "web"]        Array
published     false                  FalseClass
published_at  nil                    NilClass
price         12.5                   Float
big           9007199254740993       Integer
true
nil
nil
false
{"at":"2026-11-27T20:00:00.000+09:00","price":"12.5","sym":"draft"}
`} />
        <p>オブジェクトは <code>Hash</code> に、配列は <code>Array</code> に、<code>null</code> は <code>nil</code> に、小数点のある数値は <code>Float</code> になりました。<code>12.50</code> は <code>12.5</code> になり、末尾の0は残りません。金額を Float で計算すると誤差が出るので、金額を受け取る API では整数の最小単位（円や銭）か文字列で受け渡す契約にします。Rails の <code>to_json</code> は <code>BigDecimal</code> を <code>"12.5"</code> という文字列にしました。</p>
        <p>大きな整数はクライアントによって正しく扱えません。Ruby は <code>9007199254740993</code> をそのまま読みましたが、同じ JSON を Node.js 26.13.1 の <code>JSON.parse</code> で読むと <code>9007199254740992</code> になりました。JavaScript の数値は倍精度の浮動小数点数で、正確に表せる整数の上限が 2<sup>53</sup> − 1 だからです。RFC 8259 も、この範囲を超える数値は相互運用性が保証されないと書いています<Ref n={2} />。外部に公開する長い ID は、文字列として契約する方法があります。</p>
        <p>JSON には日時の型がありません。Rails の <code>to_json</code> は <code>ActiveSupport::TimeWithZone</code> を、タイムゾーンの時差とミリ秒を含む ISO 8601 形式の文字列 <code>"2026-11-27T20:00:00.000+09:00"</code> にしました<Ref n={16} />。Ruby 標準の <code>Time#to_s</code> の形式（<code>2026-11-27 20:00:00 +0900</code>）とは違うので、API の契約には日時の書式とタイムゾーンを明記します。シンボルの <code>:draft</code> は文字列の <code>"draft"</code> になり、受け取った側で区別できません。</p>
        <p>上の結果で <code>published_at</code> は項目として存在し、値が <code>null</code> です。<code>h["published_at"]</code> と、存在しない <code>h["missing"]</code> は、どちらも <code>nil</code> を返しました。<code>key?</code> を使うと <code>true</code> と <code>false</code> で区別できます。項目を省略した場合と <code>null</code> を送った場合が同じ意味かは、API の契約で決めます。更新要求では、省略は「その項目を変更しない」、<code>null</code> は「現在の値を消す」と決めることがあります。区別する実装では、<code>[]</code> の結果だけでなく項目の有無も確かめます。</p>
        <p>形式が正しくても、記事として保存できるとは限りません。題名が欠けているときや、<code>published</code> に文字列が渡ったときは、要求に対する検査が必要です。構文が壊れた JSON は Rails が 400 にしますが、構文が正しい JSON の中身を確かめるのはアプリケーションの役割で、その誤りには 422 を返します（<ChapterLink n={94} section="status" />）。</p>
        <p>同じ一覧を人が読む場合は HTML、別のプログラムが内容を使う場合は JSON が候補です。HTML には表示用の要素が入り、JSON にはクライアントが判断に使う項目を入れます。認証に使うハッシュや管理者向けの項目がデータベースの同じ行にあっても、公開 API では返す項目を明示します。実験用のアプリでは <code>attributes</code> に id と title だけを並べたので、<code>render json:</code> はその2つだけを返しました。Rails での引数の受け取りと応答の組み立ては <ChapterLink n={10} section="response-formats" />で追えます。</p>
        <p>本文を使わない応答もあります。条件付き GET に対して以前取得した表現がまだ有効なら、サーバーは <code>304</code> を返せます。この応答に本文は入りません。クライアントは保存している表現を再利用します。毎回 JSON を読み取るプログラムでは、204 や 304 のように本文がないステータスを先に処理します。条件付き GET と保存したデータの扱いは <ChapterLink n={22} section="http-cache" />を参照してください。</p>
      </>,
    },
    {
      id: 'judgment',
      title: '判断基準とトレードオフ',
      body: <>
        <p>この章の内容を、Rails で画面や API を作るときの判断としてまとめます。表の「選ぶ条件」は一般的な目安で、既存のクライアントとの契約があればそちらを優先します。</p>
        <div className="table-wrap"><table>
          <thead><tr><th scope="col">判断すること</th><th scope="col">選択肢</th><th scope="col">選ぶ条件と代償</th></tr></thead>
          <tbody>
            <tr><td>保存に成功した後の応答</td><td>303 でリダイレクト／201 と <code>Location</code>／200 と本文</td><td>ブラウザーの画面なら 303。API なら 201 と作った表現。リダイレクトは要求が1往復増える</td></tr>
            <tr><td>入力の誤り</td><td>400／422</td><td>読めない要求は 400、読めたが保存できない内容は 422。クライアントの直し方が変わる</td></tr>
            <tr><td>状態の変更</td><td>PATCH で属性を変える／操作をリソースとして POST する</td><td>履歴や権限を操作ごとに持つなら後者。ルートとコントローラーが増える</td></tr>
            <tr><td>送り直しの扱い</td><td>冪等なメソッドで設計する／識別子で重複を見分ける</td><td>作成や支払いは POST になるので識別子を使う。識別子を保存する期間と場所が必要になる</td></tr>
            <tr><td>ログイン状態の保存</td><td>CookieStore だけ／サーバー側にもセッションを記録する</td><td>ログアウトや強制失効が必要なら後者。要求ごとにデータベースを引く</td></tr>
            <tr><td>同じ URL で HTML と JSON を返すか</td><td><code>respond_to</code> で切り替える／<code>/api/…</code> に分ける</td><td>認証方式やバージョンの管理が画面と違うなら分ける。分けると同じ処理を2か所から呼ぶ</td></tr>
          </tbody>
        </table></div>
        <p>保存に成功した後の応答では、利用者の操作の流れを優先します。ブラウザーの画面では、再読み込みで POST を送り直させないために 303 を使います。JSON API のクライアントはリダイレクトをたどる必要がないので、201 と作った表現を返せば、クライアントは追加の要求なしで ID を得られます。</p>
        <p>送り直しの扱いは、ネットワークが切れることを前提に決めます。GET・PUT・DELETE を RFC 9110 の意味どおりに実装すれば、クライアントや途中のプロキシは安全に送り直せます。GET で状態を変える実装は、巡回プログラムやプロキシが送り直したときに意図しない変更を起こすので避けます。POST の作成を送り直す可能性があるなら、識別子による重複の判定を API に含めます。</p>
        <p>ログイン状態の保存先は失効させる必要があるかで決めます。CookieStore はサーバーに保存先が要らず、複数のサーバーに要求が振り分けられても同じセッションを読めます。その代わり、実験で見たように、発行済みの値を個別に無効にできません。パスワードの変更時に他の端末をログアウトさせたい、管理画面で特定の利用者のセッションを切りたい、といった要件があれば、サーバー側にセッションの記録を持ちます。</p>
        <p>HTML と JSON を同じ URL で返す方法は、コントローラーが1つで済みます。ただし、画面は Cookie のセッションと CSRF のトークンで守り、API はトークンの認証で守るように、守り方が違う場合は混ぜると設定を誤りやすくなります。API の利用者が外部にいてバージョンを分けて管理する場合も、<code>/api/v1/…</code> のように URL を分けたほうが、変更の範囲を説明しやすくなります。</p>
      </>,
    },
    {
      id: 'related',
      title: '関連する章',
      body: <>
        <p>この章は HTTP の基礎を扱いました。ほかの章では、同じ要求と応答を別の層から読みます。</p>
        <ul>
          <li><ChapterLink n={1} section="http" />：記事一覧の通信記録から、HTML を作った Rails のコードを探します。</li>
          <li><ChapterLink n={6} section="http-message" />：Puma が受け取った要求と、ミドルウェアが付けた応答のヘッダーを比べます。</li>
          <li><ChapterLink n={9} section="url-method" />と<ChapterLink n={9} section="resources" />：メソッドとパスからアクションを選ぶルーティングを扱います。</li>
          <li><ChapterLink n={10} section="render-redirect" />と<ChapterLink n={10} section="cookies-session" />：コントローラーが応答を作る処理と、Cookie を書き出すミドルウェアを読みます。</li>
          <li><ChapterLink n={21} section="cookie-session" />と<ChapterLink n={21} section="csrf" />：Cookie とセッションを狙う攻撃と、その対策を扱います。</li>
          <li><ChapterLink n={22} section="http-cache" />：<code>etag</code> と 304 による HTTP キャッシュを扱います。</li>
          <li><ChapterLink n={104} />と<ChapterLink n={105} />：HTTP の要求を送る前の、TCP の接続、DNS の名前解決、TLS の手順を扱います。</li>
          <li><ChapterLink n={52} />：送り直された要求を識別子で見分ける方法を扱います。</li>
          <li><ChapterLink n={102} />：Cookie のセッションとトークンを使ったログインの確認を扱います。</li>
        </ul>
      </>,
    },
  ],
  sources: [
    { title: 'HTTP Semantics', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110', accessed: '2026-11-27', version: 'RFC 9110', note: 'URI の構成、メソッドの安全と冪等（9.2）、ヘッダー名の大文字と小文字、HEAD、ステータスコードの分類とリダイレクト（15）、422' },
    { title: 'The JSON Data Interchange Format', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc8259', accessed: '2026-11-27', version: 'RFC 8259', note: 'JSON の構文と数値の相互運用性' },
    { title: 'Architectural Styles and the Design of Network-based Software Architectures, Chapter 5: Representational State Transfer', publisher: 'Roy Fielding', url: 'https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm', accessed: '2026-11-27', version: '2000', note: 'REST の制約' },
    { title: 'Securing Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/security.html', accessed: '2026-11-27', version: 'Rails 8.1', note: 'CookieStore とセッション' },
    { title: 'ActionController::MimeResponds#respond_to', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActionController/MimeResponds.html#method-i-respond_to', accessed: '2026-11-27', version: 'Rails 8.1', note: '要求の形式に対応する応答処理を選ぶ' },
    { title: 'HTTP State Management Mechanism', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc6265', accessed: '2026-11-27', version: 'RFC 6265', note: 'Set-Cookie と Cookie、属性、Cookie の大きさ' },
    { title: 'PATCH Method for HTTP', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc5789', accessed: '2026-11-27', version: 'RFC 5789', note: 'PATCH の意味と冪等性' },
    { title: 'The Transport Layer Security (TLS) Protocol Version 1.3', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc8446', accessed: '2026-11-27', version: 'RFC 8446', note: 'TLS が提供する暗号化・完全性・認証' },
    { title: 'Action Controller Overview', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/action_controller_overview.html', accessed: '2026-11-27', version: 'Rails 8.1', note: 'セッション、Cookie、JSON のパラメーター' },
    { title: 'actionpack/lib/action_dispatch/middleware/exception_wrapper.rb', publisher: 'GitHub rails/rails', url: `${GH}/actionpack/lib/action_dispatch/middleware/exception_wrapper.rb#L12-L29`, accessed: '2026-11-27', version: 'v8.1.4.1', note: '例外とステータスコードの対応' },
    { title: 'actionpack/lib/action_controller/metal/redirecting.rb', publisher: 'GitHub rails/rails', url: `${GH}/actionpack/lib/action_controller/metal/redirecting.rb#L267-L275`, accessed: '2026-11-27', version: 'v8.1.4.1', note: 'redirect_to の既定のステータスが 302 であること' },
    { title: 'curl man page', publisher: 'curl', url: 'https://curl.se/docs/manpage.html', accessed: '2026-11-27', version: 'curl 8.14.1', note: '-v、-i、-I、-L、-d、-c、-b、--cacert の動作' },
    { title: 'Puma README: Binding TCP / Sockets', publisher: 'GitHub puma/puma', url: 'https://github.com/puma/puma/blob/v8.0.2/README.md', accessed: '2026-11-27', version: 'v8.0.2', note: 'ssl:// で TLS の待ち受けを指定する' },
    { title: 'actionpack/lib/action_controller/railtie.rb', publisher: 'GitHub rails/rails', url: `${GH}/actionpack/lib/action_controller/railtie.rb#L106-L112`, accessed: '2026-11-27', version: 'v8.1.4.1', note: '初期化の途中で ActionController::Base に protect_from_forgery を加える' },
    { title: 'REST APIs must be hypertext-driven', publisher: 'Roy Fielding', url: 'https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven', accessed: '2026-11-27', version: '2008', note: 'ハイパーテキストを使わない API と REST の関係についての見解' },
    { title: 'ActiveSupport::TimeWithZone#as_json', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveSupport/TimeWithZone.html#method-i-as_json', accessed: '2026-11-27', version: 'Rails 8.1', note: '日時を ISO 8601 の文字列にする' },
    { title: 'actionpack/lib/action_dispatch/http/mime_negotiation.rb', publisher: 'GitHub rails/rails', url: `${GH}/actionpack/lib/action_dispatch/http/mime_negotiation.rb#L218-L226`, accessed: '2026-11-28', version: 'v8.1.4.1', note: 'vary_headers が Accept と X-Requested-With を返すこと。formats は xhr? で形式を変える（L72-L90）。同じ Accept: application/json, */* でも、X-Requested-With: XMLHttpRequest がなければ HTML、あれば JSON を選ぶことを実行で確認' },
  ],
}

export default chapter
