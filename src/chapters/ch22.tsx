import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation22 } from '../explanations/features'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { labelFor } from '../content/label'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 34-1 応答時間と、Rails が測る時間 ---------- */
function ResponseTimeFigure() {
  const x0 = 250
  const scale = 44 // 1ms あたりの幅
  const rows: { t: string; s: number; d: number; fill: 'bg' | 'box' | 'box2' | 'box4' | 'box5'; label: string }[] = [
    { t: 'curl の time_total', s: 0, d: 11.2, fill: 'bg', label: '11.2ms' },
    { t: 'x-runtime（Rack::Runtime）', s: 1.2, d: 8.7, fill: 'box', label: '8.7ms' },
    { t: 'Completed の行', s: 2.6, d: 7, fill: 'box2', label: '7ms' },
  ]
  return (
    <Svg
      id="34-1"
      w={780}
      h={260}
      label="同じ GET /articles/1 の要求で、curl が測った応答時間は11.2ms、Rack::Runtime のミドルウェアが測った x-runtime は8.7ms、ログの Completed の行は7ms だった。外側の時間ほど、通信や Puma の処理、ミドルウェアの処理を多く含む。Completed の7ms のうち、Views が3.6ms、ActiveRecord が1.3ms（SQL 2回）で、残りはコントローラーなどの Ruby の処理"
    >
      {rows.map((r, i) => {
        const y = 24 + i * 40
        return (
          <g key={r.t}>
            <T x={x0 - 10} y={y + 13} anchor="end" fs={11.5}>
              {r.t}
            </T>
            <Box x={x0 + r.s * scale} y={y} w={r.d * scale} h={26} lines={r.label} fs={11} fill={r.fill} />
          </g>
        )
      })}
      <T x={x0 - 10} y={157} anchor="end" fs={11.5}>
        Completed の内訳
      </T>
      <Box x={x0 + 2.6 * scale} y={144} w={3.6 * scale} h={26} lines="Views 3.6ms" fs={10.5} fill="box5" />
      <Box x={x0 + 6.2 * scale} y={144} w={1.3 * scale} h={26} lines="AR" fs={10.5} fill="box4" />
      <Box x={x0 + 7.5 * scale} y={144} w={2.1 * scale} h={26} lines="その他" fs={10.5} fill="bg" dashed />
      <T x={x0 + 6.85 * scale} y={186} anchor="middle" fs={10.5} tone="muted">
        1.3ms（SQL 2回）
      </T>
      <T x={20} y={214} fs={11} tone="muted">
        外側ほど、通信・Puma・外側のミドルウェアの時間を多く含む。棒の左端の位置と内訳の並び順は模式的なもので、長さは実測値
      </T>
      <T x={20} y={234} fs={11} tone="muted">
        AR は ActiveRecord（SQL の時間）。その他は Views にも ActiveRecord にも入らない Ruby の処理など
      </T>
    </Svg>
  )
}

/* ---------- 図 34-2 時間のかかる場所の違い ---------- */
function SlowPartsFigure() {
  const rows = [
    { t: 'GET /articles/1', total: 7, v: 3.6, ar: 1.3, note: '7ms（2 queries）' },
    { t: 'GET /lab/io', total: 202, v: 0.4, ar: 200.6, note: '202ms（1 query）' },
    { t: 'GET /lab/cpu', total: 546, v: 0.7, ar: 0, note: '546ms（0 queries）' },
  ]
  const x0 = 170
  const W = 420
  return (
    <Svg
      id="34-2"
      w={780}
      h={230}
      label="3つの要求の Completed の行を、全体を100%とした内訳で並べた。記事のページ（7ms）は Views が約半分、ActiveRecord が2割弱。DB で0.2秒待つ /lab/io（202ms）はほぼすべてが ActiveRecord。Ruby で計算する /lab/cpu（546ms）は Views も ActiveRecord もほぼ0で、残りがすべて Ruby の処理だった"
    >
      {rows.map((r, i) => {
        const y = 24 + i * 50
        const wv = (r.v / r.total) * W
        const wa = (r.ar / r.total) * W
        return (
          <g key={r.t}>
            <T x={x0 - 10} y={y + 14} anchor="end" fs={11.5} mono>
              {r.t}
            </T>
            <rect x={x0} y={y} width={Math.max(wv, 1.5)} height={28} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            {wa > 0 && <rect x={x0 + wv} y={y} width={wa} height={28} fill="var(--fig-box4)" stroke="var(--fig-line)" />}
            <rect x={x0 + wv + wa} y={y} width={W - wv - wa} height={28} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="4 3" />
            <T x={x0 + W + 12} y={y + 14} fs={11}>
              {r.note}
            </T>
          </g>
        )
      })}
      <rect x={20} y={186} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={40} y={192} fs={11}>
        Views（描画）
      </T>
      <rect x={160} y={186} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={180} y={192} fs={11}>
        ActiveRecord（SQL）
      </T>
      <rect x={340} y={186} width={14} height={12} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="4 3" />
      <T x={360} y={192} fs={11}>
        その他（コントローラーなどの Ruby の処理）
      </T>
      <T x={20} y={216} fs={11} tone="muted">
        各要求の Completed の時間を100%とした割合（デモの開発環境での実測）
      </T>
    </Svg>
  )
}

/* ---------- 図 34-4 キャッシュのヒットとミス ---------- */
function CacheFigure() {
  return (
    <Svg
      id="34-4"
      w={780}
      h={290}
      label="Rails.cache.fetch はキーでキャッシュを探す。見つかればヒットで、保存した値をすぐに返す（0.1ms）。見つからないか有効期限が切れていればミスで、ブロックの処理（約500ms）を実行し、結果をキーと有効期限とともに保存してから返す。元のデータが変わっても、有効期限が来るまでは保存した古い値が返る"
    >
      <Box x={20} y={90} w={170} h={56} lines={['fetch("basics22/', 'article_count")']} mono fs={11} fill="box5" />
      <Arrow x1={190} y1={118} x2={238} y2={118} />
      <Box x={240} y={90} w={160} h={56} lines={['キャッシュストア', 'キーで探す']} fs={11.5} fill="box4" subTone="muted" />
      <Arrow d="M400,104 L440,104 L440,50 L478,50" />
      <Arrow d="M400,132 L440,132 L440,190 L478,190" />
      <T x={446} y={80} fs={10.5} tone="muted">
        ある
      </T>
      <T x={446} y={150} fs={10.5} tone="muted">
        ない・期限切れ
      </T>
      <Box x={480} y={24} w={280} h={52} lines={['ヒット', '保存した値を返す（0.1ms）']} fs={11.5} fill="box4" subTone="muted" />
      <Box x={480} y={164} w={280} h={52} lines={['ミス', 'ブロックを実行（約 500ms）']} fs={11.5} fill="bg" subTone="muted" />
      <Arrow d="M520,216 L520,240 L320,240 L320,148" dashed />
      <T x={330} y={228} fs={10.5} tone="muted">
        結果を有効期限とともに保存
      </T>
      <T x={20} y={272} fs={11} tone="muted">
        元のデータが変わっても、有効期限が来るまではヒットして古い値が返る
      </T>
    </Svg>
  )
}

/* ---------- 図 34-3 1リクエストの処理時間の内訳 ---------- */
function BreakdownFigure() {
  // デモの実測（ms）。start はリクエストの開始からの時刻
  const rows: { t: string; start: number; dur: number; fill: 'box' | 'box2' | 'box4' | 'box5' }[] = [
    { t: 'request（ミドルウェア全体）', start: 0, dur: 6.9, fill: 'box' },
    { t: 'process_action（コントローラー）', start: 1.06, dur: 5.41, fill: 'box2' },
    { t: 'sql（記事）', start: 1.61, dur: 0.52, fill: 'box4' },
    { t: 'render_layout', start: 3.24, dur: 3.12, fill: 'box5' },
    { t: 'render_template（show）', start: 3.29, dur: 2.55, fill: 'box5' },
    { t: 'sql（コメント）', start: 4.21, dur: 0.61, fill: 'box4' },
    { t: 'render_collection', start: 5.54, dur: 0.08, fill: 'box5' },
  ]
  const x0 = 250
  const scale = 70 // 1ms あたりの幅
  const rowH = 30
  return (
    <Svg
      id="34-3"
      w={780}
      h={rows.length * rowH + 80}
      label="GET /articles/1 の処理をイベントの開始時刻と処理時間で並べた。リクエスト全体が約6.9ms、そのうちコントローラーの処理が約5.4ms。記事を読む SQL が0.5ms、レイアウトの描画が3.1ms で、その中のテンプレートの描画が2.6ms、テンプレートの中で関連のコメントを読む SQL が0.6ms、コメントのパーシャルの描画が0.08ms だった。SQL がテンプレートの描画の中で実行されている。ログの Views は描画の時間からこの SQL の時間を引いた値になる"
    >
      {[0, 1, 2, 3, 4, 5, 6, 7].map((ms) => (
        <g key={ms}>
          <line x1={x0 + ms * scale} y1={24} x2={x0 + ms * scale} y2={rows.length * rowH + 30} stroke="var(--fig-line)" strokeDasharray="2 4" opacity={0.6} />
          <T x={x0 + ms * scale} y={16} anchor="middle" fs={10} tone="muted">
            {`${ms}ms`}
          </T>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = 30 + i * rowH
        return (
          <g key={r.t}>
            <T x={x0 - 8} y={y + 11} anchor="end" fs={11}>
              {r.t}
            </T>
            <Box x={x0 + r.start * scale} y={y} w={Math.max(4, r.dur * scale)} h={22} fill={r.fill} rx={3} />
            {/* 処理時間の文字の下を背景色で塗り、目盛りの点線が文字に重ならないようにする */}
            <rect x={x0 + (r.start + r.dur) * scale + 3} y={y + 3} width={44} height={16} fill="var(--fig-bg)" />
            <T x={x0 + (r.start + r.dur) * scale + 6} y={y + 11} fs={10.5} tone="muted">
              {`${r.dur}ms`}
            </T>
          </g>
        )
      })}
      <T x={20} y={rows.length * rowH + 58} fs={11} tone="muted">
        ログ：Completed 200 OK in 5ms (Views: 2.9ms | ActiveRecord: 1.1ms (2 queries, 0 cached) | GC: 0.0ms)
      </T>
    </Svg>
  )
}

/* ---------- 図 34-5 キャッシュの層 ---------- */
function LayersFigure() {
  const rows = [
    { t: 'ブラウザーの HTTP キャッシュ', s: 'Cache-Control・ETag・Last-Modified に従い、要求しないか条件付き GET を送る', fill: 'bg' as const },
    { t: `CDN・Nginx（${labelFor(24)}）`, s: 'public な応答や、ダイジェスト付きのアセットを保存して返す', fill: 'bg' as const },
    { t: '条件付き GET', s: 'fresh_when・stale? が一致すれば 304。テンプレートの描画を省ける', fill: 'box2' as const },
    { t: 'フラグメントキャッシュ', s: 'cache・cached: true で、描画した HTML の断片を Rails.cache に保存', fill: 'box' as const },
    { t: '低レベルのキャッシュ', s: 'Rails.cache.fetch で、計算結果や外部 API の応答を保存', fill: 'box' as const },
    { t: 'キャッシュストア', s: 'MemoryStore（プロセスごと）・Redis・Memcached・Solid Cache（DB）', fill: 'box4' as const },
  ]
  return (
    <Svg
      id="34-5"
      w={780}
      h={rows.length * 46 + 26}
      label="キャッシュの層を、ブラウザーに近い順に並べた。ブラウザーの HTTP キャッシュ、CDN や Nginx、Rails の条件付き GET（fresh_when・stale? による 304）、フラグメントキャッシュ（描画した HTML の断片）、低レベルのキャッシュ（Rails.cache.fetch）、そしてそれらを保存するキャッシュストア（MemoryStore、Redis、Memcached、Solid Cache）。上の層で返せるほど、下の層の処理を省ける"
    >
      {rows.map((r, i) => {
        const y = 12 + i * 46
        return (
          <g key={r.t}>
            <Box x={20 + i * 10} y={y} w={290 - i * 10} h={38} lines={r.t} fs={11.5} bold fill={r.fill} />
            <T x={336} y={y + 19} fs={11}>
              {r.s}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- イベントを発行する処理と購読するブロック ---------- */
function NotificationsFigure() {
  const pubs = [
    ['SQL の実行', 'sql.active_record'],
    ['テンプレートの描画', 'render_template.action_view'],
    ['アクションの処理', 'process_action.action_controller'],
    ['自分のコード（Ranking.calculate）', 'ranking.demo'],
  ]
  const subs = [
    ['LogSubscriber', 'ログの行（Completed など）'],
    ['ActionDispatch::ServerTiming', 'Server-Timing ヘッダー'],
    ['APM・rack-mini-profiler', '処理時間を集める'],
    ['subscribe("ranking.demo")', 'Rails.logger.info でログに書く'],
  ]
  const rowY = (i: number) => 32 + i * 58
  const hubY = (i: number) => 127 + i * 10
  return (
    <Svg
      id="ch22-notifications"
      w={780}
      h={262}
      label="左に instrument でイベントを発行する処理として、SQL の実行（sql.active_record）、テンプレートの描画（render_template.action_view）、アクションの処理（process_action.action_controller）、自分のコード（ranking.demo）を並べた。発行されたイベントは中央の ActiveSupport::Notifications を通り、右の subscribe で購読する側に渡される。右には LogSubscriber（ログの行）、ActionDispatch::ServerTiming（Server-Timing ヘッダー）、APM や rack-mini-profiler（処理時間を集める）、ranking.demo を購読するブロック（Rails.logger.info でログに書く）を並べた。渡すのはイベントの名前、開始と終了の時刻、ペイロード"
    >
      <T x={130} y={16} anchor="middle" fs={11.5} tone="muted">
        instrument で発行する処理
      </T>
      <T x={650} y={16} anchor="middle" fs={11.5} tone="muted">
        subscribe で購読する側
      </T>
      {pubs.map((p, i) => (
        <g key={p[1]}>
          <Box x={20} y={rowY(i)} w={220} h={46} lines={p} fs={11.5} subTone="muted" />
          <Arrow x1={240} y1={rowY(i) + 23} x2={290} y2={hubY(i)} />
        </g>
      ))}
      <Box x={290} y={114} w={200} h={56} lines={['ActiveSupport::', 'Notifications']} fs={12} fill="box5" />
      <T x={390} y={194} anchor="middle" fs={11} tone="muted">
        渡すもの：イベントの名前、
      </T>
      <T x={390} y={212} anchor="middle" fs={11} tone="muted">
        開始と終了の時刻、ペイロード
      </T>
      {subs.map((s, i) => (
        <g key={s[0]}>
          <Arrow x1={490} y1={hubY(i)} x2={540} y2={rowY(i) + 23} />
          <Box x={540} y={rowY(i)} w={220} h={46} lines={s} fs={11.5} subTone="muted" />
        </g>
      ))}
    </Svg>
  )
}

/* ---------- Rack::ETag と fresh_when が If-None-Match と比べる時点 ---------- */
function EtagTimingFigure() {
  type Step = { lines: string[]; fill?: 'bg' | 'box' | 'box5'; tone?: 'acc' | 'danger' }
  const left: Step[] = [
    { lines: ['要求（If-None-Match に前回の ETag）'], fill: 'bg' },
    { lines: ['アクションを実行'] },
    { lines: ['テンプレートを描画（1回）'] },
    { lines: ['Rack::ETag が本文全体のダイジェストを ETag にする'] },
    { lines: ['Rack::ConditionalGet が If-None-Match と比べる', '一致しない（CSRF のメタタグで本文が毎回違う）'], fill: 'box5', tone: 'danger' },
    { lines: ['200・本文 2787B'], fill: 'bg' },
  ]
  const right: Step[] = [
    { lines: ['要求（If-None-Match に前回の ETag）'], fill: 'bg' },
    { lines: ['アクションで記事を読む（SQL 1回）'] },
    { lines: ['fresh_when が ETag を作る', 'cache_key_with_version とテンプレートのダイジェストから'] },
    { lines: ['request.fresh?(response) で If-None-Match と比べる', '一致する'], fill: 'box5', tone: 'acc' },
    { lines: ['head :not_modified で 304・本文 0B'], fill: 'bg' },
  ]
  const top = 34
  const step = 54
  const h = 40
  const col = (steps: Step[], x: number) =>
    steps.map((s, i) => {
      const y = top + i * step
      return (
        <g key={s.lines[0]}>
          <Box x={x} y={y} w={350} h={h} lines={s.lines} fs={11.5} fill={s.fill ?? 'box'} subTone={s.tone ?? 'muted'} />
          {i < steps.length - 1 && <Arrow x1={x + 175} y1={y + h} x2={x + 175} y2={y + step - 1} />}
        </g>
      )
    })
  return (
    <Svg
      id="ch22-etag-timing"
      w={780}
      h={400}
      label="2つのデモで、If-None-Match に前回の ETag を入れた要求を処理する順を上から並べた。左の Rack::ETag の場合は、アクションを実行し、テンプレートを1回描画した後で、Rack::ETag が本文全体のダイジェストを ETag にし、Rack::ConditionalGet が If-None-Match と比べる。CSRF のメタタグで本文が毎回違うので一致せず、200 と2787バイトの本文を返す。比べる時点で描画は終わっている。右の fresh_when の場合は、アクションで記事を読む SQL を1回実行し、fresh_when が cache_key_with_version とテンプレートのダイジェストから ETag を作り、request.fresh?(response) で If-None-Match と比べる。一致するので head :not_modified で本文0バイトの304を返す。描画の前に比べるので、テンプレートの描画は0回で、1ms で返った"
    >
      <T x={195} y={16} anchor="middle" fs={12} bold>
        Rack::ETag（/articles/1）
      </T>
      <T x={585} y={16} anchor="middle" fs={12} bold>
        fresh_when（/cached/articles/1）
      </T>
      {col(left, 20)}
      {col(right, 410)}
      <T x={195} y={top + 6 * step + 4} anchor="middle" fs={11} tone="muted">
        比べる時点で、描画は終わっている
      </T>
      <T x={585} y={top + 5 * step + 4} anchor="middle" fs={11} tone="muted">
        描画の前に比べる。描画は0回で、1ms で返った
      </T>
    </Svg>
  )
}

/* ---------- touch の前後で、フラグメントキャッシュのバージョンを比べる ---------- */
function FragmentVersionFigure() {
  const panels = [
    { x: 20, title: 'touch の前（show 2回目）', now: '20261111102904565673', nowFill: 'box' as const, cmp: '一致', tone: 'acc' as const, result: ['ヒット（hit=true）', '保存した HTML を使う'] },
    {
      x: 410,
      title: 'touch の後',
      now: '20261111102924312343',
      nowFill: 'box5' as const,
      cmp: '不一致',
      tone: 'danger' as const,
      result: ['ミス（hit=false）', '描画し、バージョン 20261111102924312343 で上書き'],
    },
  ]
  return (
    <Svg
      id="ch22-fragment-version"
      w={780}
      h={300}
      label="フラグメントキャッシュのキー views/cached_articles/show:56f144d2a3735c2ad85933a601e3409e/articles/1 は touch の前と後で同じ。touch の前は、読むときのバージョン（記事の updated_at）20261111102904565673 が保存されているバージョン 20261111102904565673 と一致し、ヒットして保存した HTML を使う。touch の後は、読むときのバージョンが 20261111102924312343 に変わり、保存されているバージョン 20261111102904565673 と一致しないのでミスになり、描画してバージョン 20261111102924312343 で同じキーに上書きする"
    >
      <T x={20} y={14} fs={11.5} tone="muted">
        キー（touch の前と後で同じ）
      </T>
      <Box x={20} y={26} w={740} h={32} lines="views/cached_articles/show:56f144d2a3735c2ad85933a601e3409e/articles/1" mono fs={11.5} fill="bg" />
      {panels.map((p) => (
        <g key={p.title}>
          <T x={p.x + 175} y={84} anchor="middle" fs={12} bold>
            {p.title}
          </T>
          <Box x={p.x} y={98} w={350} h={44} lines={['読むときのバージョン（記事の updated_at）', p.now]} fs={11.5} fill={p.nowFill} />
          <T x={p.x + 175} y={158} anchor="middle" fs={12} tone={p.tone} bold>
            {p.cmp}
          </T>
          <Box x={p.x} y={174} w={350} h={44} lines={['保存されているバージョン', '20261111102904565673']} fs={11.5} fill="box4" />
          <Arrow x1={p.x + 175} y1={218} x2={p.x + 175} y2={237} />
          <Box x={p.x} y={238} w={350} h={44} lines={p.result} fs={11.5} fill="bg" bold />
        </g>
      ))}
    </Svg>
  )
}

const ch22: Chapter = {
  number: 22,
  part: 4,
  title: '性能：計測・改善・キャッシュ',
  summary:
    '記事の表示に時間がかかるときは、SQL の回数と画面を描く時間を別々に調べられます。1回の要求で記録された時間を読み、同じ記事をもう一度開いたときにどの処理を省けるかを確かめます。',
  goals: [
    'ブラウザーから見た応答時間と、Rails のログが測る区間を区別できる',
    'ログと処理ごとの計測値から、時間のかかった SQL や描画を特定できる',
    '応答の本文、HTML の一部分、計算結果のどれを使い回すかを選び、記事の更新後に値が切り替わる条件を説明できる',
  ],
  prerequisites: [12, 13, 16],
  sections: [
    {
      id: 'response-time',
      title: '応答時間とログの Completed の行',
      body: (
        <>
          <p>
            Web アプリケーションの速さを測るときは、まず応答時間を見ます。応答時間はブラウザーが要求を送ってから応答を受け取り終えるまでの時間です。1秒の1000分の1を1ミリ秒（ms）と呼び、Rails
            のログも処理の時間をミリ秒で出します。
          </p>
          <p>
            curl の <code>-w</code> オプションを使うと、応答時間（time_total、単位は秒）を表示できます
            <Ref n={9} />。デモの記事のページを要求し、応答ヘッダーの x-runtime も表示しました。
          </p>
          <Code
            lang="text"
            title={'curl -s -D - -o /dev/null -w "curl の time_total: %{time_total} 秒\\n" http://127.0.0.1:3300/articles/1 の出力（x-runtime 以外のヘッダーを省略）'}
            code={`
x-runtime: 0.008743
curl の time_total: 0.011154 秒
`}
          />
          <p>同じ要求を処理したときの、開発環境のログです。</p>
          <Code
            lang="text"
            title="開発環境のログ（Rails 8.1.4.1、MySQL 8.4）"
            code={`
Started GET "/articles/1" for 172.29.0.1 at 2026-11-16 07:31:55 +0000
Processing by ArticlesController#show as */*
  Parameters: {"id" => "1"}
  Article Load (0.6ms)  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 1 LIMIT 1 /*action='show',application='Demo',controller='articles'*/
  ↳ app/controllers/articles_controller.rb:9:in 'ArticlesController#show'
  Rendering layout layouts/application.html.erb
  Rendering articles/show.html.erb within layouts/application
  Comment Load (0.7ms)  SELECT \`comments\`.* FROM \`comments\` WHERE \`comments\`.\`article_id\` = 1 ORDER BY \`comments\`.\`id\` DESC LIMIT 2 /*action='show',application='Demo',controller='articles'*/
  ↳ app/views/articles/show.html.erb:5
  Rendered collection of comments/_comment.html.erb [2 times] (Duration: 0.1ms | GC: 0.0ms)
  Rendered articles/show.html.erb within layouts/application (Duration: 3.0ms | GC: 0.0ms)
  Rendered layout layouts/application.html.erb (Duration: 3.7ms | GC: 0.0ms)
Completed 200 OK in 7ms (Views: 3.6ms | ActiveRecord: 1.3ms (2 queries, 0 cached) | GC: 0.4ms)
`}
          />
          <p>
            Started の行は要求を受け取ったこと、Processing by の行はどのコントローラーのどのアクションが動いたかを表します。Article Load と Comment Load の行は実行した SQL
            とその時間、Rendered の行は描画したテンプレートとその時間です。最後の Completed の行がこの要求のまとめです
            <Ref n={7} />。
          </p>
          <ul>
            <li>
              <code>200 OK</code>：応答のステータスコード
            </li>
            <li>
              <code>in 7ms</code>：コントローラーがアクションを処理するのにかかった時間
            </li>
            <li>
              <code>Views: 3.6ms</code>：テンプレートの描画にかかった時間（描画の途中で実行した SQL の時間を除く）
            </li>
            <li>
              <code>ActiveRecord: 1.3ms (2 queries, 0 cached)</code>：SQL の時間の合計（0.6ms と 0.7ms）と回数。cached は同じ SQL の結果を使い回した回数（
              <ChapterLink n={12} section="query-cache" />）
            </li>
            <li>
              <code>GC: 0.4ms</code>：使わなくなったオブジェクトのメモリーを回収する処理（GC、ガベージコレクション）にかかった時間
            </li>
          </ul>
          <p>
            3つの時間を比べると、curl の 11.2ms、x-runtime の 8.7ms、Completed の 7ms の順に短くなっています。x-runtime は Rack::Runtime というミドルウェア（要求の前後に処理を挟む部品）が付けるヘッダーで、そのミドルウェアから内側の処理にかかった時間です
            <Ref n={8} />。Completed の時間は、コントローラーがアクションを処理した時間で、その外側のミドルウェアの処理は含みません。curl の時間には、さらに通信と Puma の処理が加わります（図 34-1）。利用者が待つのは、いちばん外側の時間です。
          </p>
          <p>
            Completed の 7ms のうち、Views と ActiveRecord を足すと 4.9ms で、残りの約 2ms はどちらにも入りません。コントローラーの Ruby の処理などが、この残りに入ります。次の節では、要求によってこの内訳がどう違うかを比べます。
          </p>
          <Figure n="34-1" title="応答時間と、Rails が測る時間" caption="デモの GET /articles/1 を1回要求したときの実測値（curl・x-runtime・ログ）をもとにした模式図。">
            <ResponseTimeFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'slow-parts',
      title: '時間のかかる場所をログから探す',
      body: (
        <>
          <p>
            遅い要求を見つけたら、まず Completed の行で、時間が Views・ActiveRecord・それ以外のどこにかかっているかを確かめます。デモには DB の応答を 0.2 秒待つアクション（/lab/io。
            <code>SELECT SLEEP(0.2)</code> を実行する）と、Ruby で計算を続けるアクション（/lab/cpu）があります。それぞれ3回ずつ要求したときの Completed の行です。
          </p>
          <Code
            lang="text"
            title="開発環境のログの Completed の行"
            code={`
/lab/io  Completed 200 OK in 206ms (Views: 1.1ms | ActiveRecord: 201.4ms (1 query, 0 cached) | GC: 0.2ms)
/lab/io  Completed 200 OK in 202ms (Views: 0.3ms | ActiveRecord: 200.9ms (1 query, 0 cached) | GC: 0.0ms)
/lab/io  Completed 200 OK in 202ms (Views: 0.4ms | ActiveRecord: 200.6ms (1 query, 0 cached) | GC: 0.0ms)
/lab/cpu Completed 200 OK in 475ms (Views: 0.6ms | ActiveRecord: 0.0ms (0 queries, 0 cached) | GC: 0.0ms)
/lab/cpu Completed 200 OK in 596ms (Views: 0.7ms | ActiveRecord: 0.0ms (0 queries, 0 cached) | GC: 0.0ms)
/lab/cpu Completed 200 OK in 546ms (Views: 0.7ms | ActiveRecord: 0.0ms (0 queries, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            /lab/io は約 202ms のほとんどが ActiveRecord で、SQL の応答を待つ時間でした。/lab/cpu は 475〜596ms かかりましたが、Views も ActiveRecord もほぼ 0
            で、残りはすべてコントローラーの中の Ruby の計算です（図 34-2）。ActiveRecord が長ければ SQL を、Views が長ければテンプレートを調べます。どちらも短ければ、コントローラーやモデルの Ruby
            のコードや、外部の API の応答を待つ時間を調べます。
          </p>
          <p>
            SQL の回数も確かめます。一覧のページで記事ごとに関連のコメントを読むと、記事の数だけ SQL が増えます（N+1 問題。<ChapterLink n={13} section="n-plus-one" />
            ）。記事を50件並べて各記事のコメントの数を出すページを rails runner の中で作り、関連をまとめて読む <code>includes</code> の有無で比べました。
          </p>
          <Code
            lang="ruby"
            title="script/basics22_n1.rb（デモ、一部を省略）"
            code={`
class Basics22Controller < ApplicationController
  def index
    articles = Article.order(:id).limit(50)
    articles = articles.includes(:comments) if params[:fix]
    render inline: <<~ERB, locals: { articles: articles }
      <% articles.each do |a| %>
        <p><%= a.title %>（コメント <%= a.comments.length %> 件）</p>
      <% end %>
    ERB
  end
end
`}
          />
          <Code
            lang="text"
            title="それぞれ3回要求したときの Completed の行（SQL の呼び出し元をログに書く開発環境の設定を止めて実行）"
            code={`
/basics22        Completed 200 OK in 215ms (Views: 136.1ms | ActiveRecord: 57.8ms (51 queries, 0 cached) | GC: 0.0ms)
/basics22        Completed 200 OK in 100ms (Views: 63.1ms | ActiveRecord: 36.1ms (51 queries, 0 cached) | GC: 0.0ms)
/basics22        Completed 200 OK in 80ms (Views: 47.9ms | ActiveRecord: 31.0ms (51 queries, 0 cached) | GC: 0.0ms)
/basics22?fix=1  Completed 200 OK in 42ms (Views: 39.8ms | ActiveRecord: 1.7ms (2 queries, 0 cached) | GC: 32.1ms)
/basics22?fix=1  Completed 200 OK in 11ms (Views: 7.7ms | ActiveRecord: 2.1ms (2 queries, 0 cached) | GC: 1.1ms)
/basics22?fix=1  Completed 200 OK in 8ms (Views: 5.5ms | ActiveRecord: 2.2ms (2 queries, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            includes が無いと、SQL が 51 回（記事の一覧で1回と、記事ごとのコメントで50回）実行され、80〜215ms かかりました。includes でコメントをまとめて読むと SQL は2回になり、8〜42ms
            になりました。どちらも1回目は長く、2回目以降で落ち着いています。ActiveRecord だけでなく Views も減ったのは、読み込んだ行からオブジェクトを作る処理など、SQL の実行の前後の Ruby
            の処理も、描画の途中で行われると Views に数えられるからです。変更の前と後で同じ要求を何回か測って比べると、変更の効果を確かめられます。
          </p>
          <p>
            Completed の行の Views と ActiveRecord の値は、Rails の中の各処理が発行するイベントから計算されています。次の節では1件の要求の中で発行されるイベントを時刻順に並べて、内訳の計算を確かめます。
          </p>
          <Figure n="34-2" title="時間のかかる場所の違い" caption="デモの開発環境で、3つの要求を処理したときの Completed の行（/lab/cpu は 546ms の回）をもとにした図。">
            <SlowPartsFigure />
          </Figure>
          <p>直す前に測って遅い場所を確かめる考え方は、<ChapterLink n={90} /> で原則として扱います。</p>
        </>
      ),
    },
    {
      id: 'breakdown',
      title: '1リクエストの処理時間の内訳',
      body: (
        <>
          <p>
            Rails のログには、リクエストごとに次のような行が出ます。デモのアプリケーション（開発環境、MySQL）で <code>GET /articles/1</code> を処理したときのものです。
          </p>
          <Code
            lang="text"
            code={`
Completed 200 OK in 5ms (Views: 2.9ms | ActiveRecord: 1.1ms (2 queries, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            下の記録の左端は要求を受けてからの経過時間、隣はその行の処理にかかった時間です。たとえば <code>+1.61ms　0.52ms</code> は、1.61ms の時点で記事を読む SQL が始まり、0.52ms かかったという意味です。Rails が処理ごとに出す通知（<Term>ActiveSupport::Notifications</Term> のイベント）を同じ要求の間だけ記録して並べました。<code>!</code> で始まる内部用のイベントは除いています。
          </p>
          <Code
            lang="text"
            code={`
  +  0.00ms    6.90ms  request.action_dispatch
  +  0.96ms    0.01ms  start_processing.action_controller ArticlesController#show
  +  1.06ms    5.41ms  process_action.action_controller   ArticlesController#show
  +  1.61ms    0.52ms  sql.active_record                  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = …
  +  2.72ms    0.05ms  instantiation.active_record
  +  3.24ms    3.12ms  render_layout.action_view          app/views/layouts/application.html.erb
  +  3.29ms    2.55ms  render_template.action_view        app/views/articles/show.html.erb
  +  4.21ms    0.61ms  sql.active_record                  SELECT \`comments\`.* FROM \`comments\` WHERE \`comments\`.\`article_id\` …
  +  5.28ms    0.13ms  instantiation.active_record
  +  5.54ms    0.08ms  render_collection.action_view      app/views/comments/_comment.html.erb
  app.call を呼んでから戻るまで 8.1ms、割り当てたオブジェクト 3028 個
  Server-Timing: start_processing.action_controller;dur=0.01, sql.active_record;dur=1.13, instantiation.active_record;dur=0.18,
                 render_collection.action_view;dur=0.08, render_template.action_view;dur=2.55, render_layout.action_view;dur=3.12,
                 process_action.action_controller;dur=5.41
`}
          />
          <p>
            コメントを読む SQL は、テンプレートの描画の途中（+4.21ms）で実行されています。ビューで関連をたどると、そこで初めて SQL が送られるからです（<ChapterLink n={12} section="lazy" />
            ）。render_template などのイベントの時間にはこの SQL も含まれますが、ログの Views は描画の時間から描画中の SQL の時間を引いた値で、引いた分は ActiveRecord に加えられます（activerecord の
            controller_runtime.rb の <code>cleanup_view_runtime</code>）。デモでも、ActiveRecord の 1.1ms は2つの SQL（0.52ms と 0.61ms）の合計でした（図 34-3）。Views と ActiveRecord
            は重ならないので、どちらが長いかで、描画と SQL のどちらに時間がかかったかを判断できます。
          </p>
          <p>
            Server-Timing は、開発環境の設定ファイルの <code>config.server_timing = true</code> で入る ActionDispatch::ServerTiming のミドルウェアが付けるヘッダーで、イベントの名前ごとの合計時間です
            <Ref n={1} />。ブラウザーの開発者ツールのネットワークの画面で、サーバー側の内訳として表示されます。
          </p>
          <Figure n="34-3" title="1リクエストの処理時間の内訳" caption="デモアプリケーション（Rails 8.1.4.1、開発環境、MySQL 8.4）での GET /articles/1 の実測。1回の計測なので、値は目安。">
            <BreakdownFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'notifications',
      title: 'ActiveSupport::Notifications',
      body: (
        <>
          <p>
            Notifications は処理を <code>instrument</code> で包んで名前付きのイベントを発行し、<code>subscribe</code> したブロックに、名前・開始と終了の時刻・ペイロード（SQL の文字列やテンプレートのパスなど）を渡す仕組みです
            <Ref n={2} />。ログの出力（LogSubscriber）、Server-Timing、<ChapterLink n={16} section="compile" />
            で使った描画の記録も、すべてこの購読で作られています。自分のコードの処理を計測するには、次のように書きます。
          </p>
          <Code
            lang="ruby"
            code={`
# 計測したい処理を包む
ActiveSupport::Notifications.instrument("ranking.demo", period: "week") do
  Ranking.calculate
end

# config/initializers などで購読する
ActiveSupport::Notifications.subscribe("ranking.demo") do |event|
  Rails.logger.info "ranking #{event.payload[:period]} #{event.duration.round(1)}ms"
end
`}
          />
          <p>
            New Relic や Datadog などの APM（アプリケーションの性能の監視サービス）の Ruby のエージェントや、rack-mini-profiler も、Rails のイベントを購読して処理時間を集めています。本番環境で遅いリクエストを調べるときは、こうしたツールで、遅いリクエストのイベントの内訳を見ます。
          </p>
          <p>
            次の図はイベントを発行する処理を左に、受け取る側を右に並べたものです。左の処理が instrument で発行したイベントは、中央の ActiveSupport::Notifications を通って、そのイベントの名前を購読している右の箱に渡されます。
          </p>
          <Figure
            title="イベントを発行する処理と、購読する側"
            caption="模式図。実線の矢印はイベントが渡る向き。右の箱が受け取るのは、購読した名前のイベントだけ。左右の箱はこの章に出てきた例で、Rails が発行するイベントと購読する側はほかにもある。"
          >
            <NotificationsFigure />
          </Figure>
          <p>
            <ChapterLink n={19} section="variants" />のデモのログの SQL には、<code>/*action='show',application='Demo',controller='redirect'*/</code>（ActiveStorage の RedirectController の要求）のようなコメントが付いていました。開発環境の設定ファイルの{' '}
            <code>config.active_record.query_log_tags_enabled = true</code> による ActiveRecord::QueryLogs の機能です。MySQL のスロークエリログ（実行に時間がかかった SQL を記録するログ）にもこのコメントが残るので、遅い SQL
            を送ったコントローラーとアクションを特定できます。
          </p>
        </>
      ),
    },
    {
      id: 'db-memory',
      title: 'DB・メモリー・YJIT',
      body: (
        <>
          <p>遅い要求を調べるときは、ログの ActiveRecord の時間と SQL の回数から、DB を先に確かめます。第3部で扱った内容が、そのまま確かめる手順になります。</p>
          <ul>
            <li>
              SQL の回数：ログの <code>(2 queries, 0 cached)</code> が表示件数に応じて増えるなら、N+1 を疑い、繰り返される SQL と呼び出し元を確認します（<ChapterLink n={13} section="n-plus-one" />
              ）。関連の遅延読み込みは strict_loading でも検出できますが、count などの集計や直接の find は SQL ログでも確認します
            </li>
            <li>
              SQL の1回の実行時間：実行時間の長い SQL は EXPLAIN で索引が使われているかを確かめます（<ChapterLink n={37} section="explain-rails" />
              ）
            </li>
            <li>
              ロックの待ち：書き込みが集中する行では、ロックの待ちで遅くなります（<ChapterLink n={15} section="lock-index" />
              ）
            </li>
          </ul>
          <p>
            ログの <code>GC:</code> は、そのリクエストの間に GC（ガベージコレクション）に使った時間です。デモの <code>/articles/1</code> は1回で約3000個のオブジェクトを割り当てていました。GC
            はオブジェクトを多く作るほど頻繁に起き、実行中は同じプロセスのすべてのスレッドが止まります
            <Ref n={3} />。デモの別の計測では、<code>GC: 16.7ms</code> の行もありました。大量のレコードを <code>each</code> で読むと、1件ごとにオブジェクトができるので、<code>find_each</code> で分けるか、
            <code>pluck</code> で必要な列だけを読みます。
          </p>
          <p>
            YJIT は Ruby の JIT コンパイラーで、メモリーを多めに使う代わりに Ruby のコードの実行を速くします。ガイドによると、Rails 7.2 以降は Ruby 3.3 以上で YJIT が自動で有効になります
            <Ref n={3} />。<ChapterLink n={7} section="app-class" />
            で見たとおり、<code>load_defaults 8.1</code> では <code>config.yjit = !Rails.env.local?</code>（開発環境とテスト環境以外で有効）になるので、デモの開発環境では無効（
            <code>RubyVM::YJIT.enabled?</code> が false）でした。Puma のスレッドと GVL の関係は
            <ChapterLink n={23} />で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'db-read-design',
      title: "一覧と集計を DB の仕事にする",
      body: (
        <>
          <p>
            一覧画面では、一度に表示する件数を決めます。ページ番号を使うページネーションでは、決まった順に並べて <code>LIMIT</code> と <code>OFFSET</code> を設定します。Kaminari なら <code>Article.order(created_at: :desc, id: :desc).page(params[:page]).per(25)</code> のようにし、ビューで <code>paginate</code> を使えます。並び順の値が同じ行にも ID で順序を付けておくと、順番が安定します。深いページや、表示中にも増えるデータなら、最後に受け取った行の日時と ID を次の取得条件にする方法もあります。<Ref n={10} /><Ref n={11} />
          </p>
          <p>
            <ChapterLink n={13} section="n-plus-one-check">関連の件数を数える例</ChapterLink> のように、明細が不要な一覧では集計済みの値だけを読み取れます（GROUP BY で行をまとめて数える SQL は <ChapterLink n={36} section="group-by" />）。加えて、要求のたびに大量のデータから集計する必要があるかを考えます。多少古くてもよいランキングなら定期ジョブで計算して保存でき、更新直後に必要な件数なら DB の集計や整合性を保つカウンターを選べます。時間がかかる出力ファイルはジョブへ回し、画面には受付済み・完了・失敗を区別して返します。<Ref n={12} />
          </p>
        </>
      ),
    },
    {
      id: 'cache-basics',
      title: '作った結果を保存して使い回すキャッシュ',
      body: (
        <>
          <p>
            同じ計算や同じ問い合わせを何度も繰り返すと、そのたびに時間がかかります。キャッシュは一度作った結果を保存しておき、次に同じものが必要になったときに、作り直さずに保存した結果を使う仕組みです
            <Ref n={5} />。Ruby の Hash で試しました。
          </p>
          <Code
            lang="ruby"
            title="cache_hash.rb"
            code={`
articles = ["Rails 入門", "Ruby のブロック"]

# 時間のかかる処理の代わり（0.5 秒かけて件数を数える）
def count_articles(articles)
  sleep 0.5
  articles.size
end

cache = {}
3.times do |i|
  start = Time.now
  count = cache[:article_count] ||= count_articles(articles)
  puts format("%d回目: %d 件（%.3f 秒）", i + 1, count, Time.now - start)
end

articles << "SQL の基本"
puts "記事を追加した後: #{cache[:article_count]} 件（実際は #{articles.size} 件）"
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
1回目: 2 件（0.500 秒）
2回目: 2 件（0.000 秒）
3回目: 2 件（0.000 秒）
記事を追加した後: 2 件（実際は 3 件）
`}
          />
          <p>
            1回目は 0.5 秒かけて数え、結果を <code>cache[:article_count]</code> に保存しました。2回目と3回目は保存した値を返したので、ほぼ0秒でした。キャッシュに値が見つかることをヒット、見つからずに元の処理をすることをミスと呼びます。一方、記事を追加した後もキャッシュの値は2件のままで、実際の3件と食い違いました。保存した結果は、元のデータが変わっても自動では変わりません。
          </p>
          <p>
            Rails では <code>Rails.cache</code> でキャッシュを使います。<code>Rails.cache.fetch</code> はキー（保存した結果を区別する名前）で値を探し、無ければブロックを実行して、その結果を保存してから返します。
            <code>expires_in</code> は有効期限で、期限を過ぎた値は使わずに作り直します
            <Ref n={5} />。
          </p>
          <Code
            lang="ruby"
            title="script/basics22_cache.rb（デモ。bin/rails runner で実行）"
            code={`
puts "Rails.cache = #{Rails.cache.class}"
4.times do |i|
  sleep 1.1 if i == 3 # 有効期限（1秒）を過ぎるまで待つ
  ran = false
  start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  count = Rails.cache.fetch("basics22/article_count", expires_in: 1.second) do
    ran = true
    sleep 0.5 # 時間のかかる処理の代わり
    Article.count
  end
  ms = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000
  puts format("%d回目: %d 件 %6.1fms ブロックを実行=%s", i + 1, count, ms, ran)
end
`}
          />
          <Code
            lang="text"
            title="出力（開発環境、Rails 8.1.4.1）"
            code={`
Rails.cache = ActiveSupport::Cache::MemoryStore
1回目: 10004 件  532.4ms ブロックを実行=true
2回目: 10004 件    0.1ms ブロックを実行=false
3回目: 10004 件    0.0ms ブロックを実行=false
4回目: 10004 件  502.5ms ブロックを実行=true
`}
          />
          <p>
            1回目はミスで、ブロックを実行して約 530ms かかりました。2回目と3回目はヒットで、0.1ms 以下でした。有効期限の1秒を過ぎた4回目は、もう一度ブロックを実行しました（図 34-4）。有効期限は、古い値が使われる時間を区切ります。元のデータが変わったときにキーを変えて、古い値を使わないようにする方法もあり、「フラグメントキャッシュ」の節で扱います。値の保存先をキャッシュストアと呼び、デモの開発環境はプロセスのメモリーに保存する
            MemoryStore です（「Rails.cache とキャッシュストア」の節）。
          </p>
          <p>
            キャッシュはブラウザー、ブラウザーと Rails の間のサーバー、Rails の中の各所に置けます（図 34-5）。ブラウザーに近いところで応答を返せるほど、その後ろの処理を省けます。次の節では、ブラウザーが保存した応答を使い回す
            HTTP キャッシュを扱います。
          </p>
          <Figure n="34-4" title="キャッシュのヒットとミス" caption="デモでの Rails.cache.fetch（MemoryStore、有効期限1秒）の実測をもとにした模式図。">
            <CacheFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'http-cache',
      title: 'HTTP キャッシュ',
      body: (
        <>
          <p>
            では、記事を更新せずに同じページをもう一度開いたら、描画も省けるでしょうか。デモでは Rails の標準のミドルウェア Rack::ETag と Rack::ConditionalGet を使い、最初の応答でもらった ETag を次の要求の <code>If-None-Match</code> に入れました。
          </p>
          <Code
            lang="text"
            code={`
  /articles/1           => 200 etag=W/"f7efee4fbb5845e17320cfcfebfd5b55" cache-control=max-age=0, private, must-revalidate
  If-None-Match         => 200 本文=2787B テンプレートの描画=1回 新しい etag=W/"d14110f69e59a6b813d2dcfa95a64672"
  2つの本文の違い: ["csrf-token\\" content=\\"MSdlqkdniRi6"]
`}
          />
          <p>
            同じ ETag を送ったのに 200 が返りました。Rack::ETag は、描画を終えた本文全体のダイジェストを ETag にします
            <Ref n={4} />。レイアウトの CSRF のメタタグ（<ChapterLink n={21} section="csrf" />
            ）が描画のたびに値を変えるので、本文が毎回違い、ETag も一致しません。仮に一致して 304 になったとしても、テンプレートの描画は済んだ後なので、サーバーの処理時間は減りません。
          </p>
          <p>
            描画も省くには、コントローラーで <code>fresh_when</code> か <code>stale?</code> を使い、描画の前に判定します。次の引用の最後にある <code>request.fresh?(response)</code> が、ブラウザーの持つ版がまだ使えるかを確かめる行です。使えれば <code>head :not_modified</code> が本文のない 304 を返します。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_controller/metal/conditional_get.rb（137〜155行目から抜粋）"
            href={`${GH}/actionpack/lib/action_controller/metal/conditional_get.rb#L137-L155`}
            code={`
    def fresh_when(object = nil, etag: nil, weak_etag: nil, strong_etag: nil, last_modified: nil, public: false, cache_control: {}, template: nil)
      weak_etag ||= etag || object unless strong_etag
      last_modified ||= object.try(:updated_at) || object.try(:maximum, :updated_at)
      # …
      elsif weak_etag || template
        response.weak_etag = combine_etags weak_etag,
          last_modified: last_modified, public: public, template: template
      # …
      response.last_modified = last_modified if last_modified
      # …
      head :not_modified if request.fresh?(response)
    end
`}
          />
          <Code
            lang="text"
            code={`
  /cached/articles/1    => 200 etag=W/"daff1921329afbbb9b4c7507faecff88" last-modified=Wed, 11 Nov 2026 10:29:04 GMT 描画=1回
  fresh_when + If-None-Match => 304 本文=0B テンプレートの描画=0回
  ログ: Completed 304 Not Modified in 1ms (ActiveRecord: 0.3ms (1 query, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            次の図は2つのデモで要求を受けてから応答を返すまでの処理を、上から順に並べたものです。紫の箱が If-None-Match と比べる所で、左の Rack::ETag では描画の後に、右の fresh_when では描画の前にあります。
          </p>
          <Figure
            title="Rack::ETag と fresh_when が If-None-Match と比べる時点"
            caption="上の2つの実行結果をもとにした模式図。実線の矢印は処理の順。右の fresh_when の列には、テンプレートを描画する箱がない。"
          >
            <EtagTimingFigure />
          </Figure>
          <p>
            <code>fresh_when @article</code> は、記事の <code>cache_key_with_version</code>（id と updated_at）とテンプレートのダイジェストから ETag を作り、要求の If-None-Match
            と一致すれば <code>head :not_modified</code> で応答します。記事を読む SQL の1回だけで、描画をせずに1ms で返りました。既定の Cache-Control は <code>private</code>{' '}
            なので、利用者のブラウザーに保存でき、複数の利用者で共有するキャッシュには保存できません。ログインした利用者ごとに内容が違うページを <code>public: true</code> にすると、CDN（配信する内容の複製を多数のサーバーに置いて返すサービス）などで他の利用者に同じ応答が返るので注意します。
          </p>
          <Figure n="34-5" title="キャッシュの層" caption="Caching with Rails（ガイド）と、この章の実測をもとにまとめた図。">
            <LayersFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'fragment',
      title: 'フラグメントキャッシュ',
      body: (
        <>
          <p>ページの一部の描画結果を保存するのがフラグメントキャッシュです。デモでは次の2つの書き方を試しました。</p>
          <Code
            lang="erb"
            title="app/views/cached_articles/show.html.erb と index.html.erb（デモ）"
            code={`
<% cache @article do %>
  <h1><%= @article.title %></h1>
<% end %>

<ul>
  <%= render partial: "articles/article", collection: @articles, cached: true %>
</ul>
`}
          />
          <p>
            開発環境でキャッシュを有効にするには <code>bin/rails dev:cache</code>（tmp/caching-dev.txt を作る）を実行します。キャッシュの読み書きのイベントを記録しました。
          </p>
          <Code
            lang="text"
            code={`
  show 1回目:  cache_read  "views/cached_articles/show:56f144d2a3735c2ad85933a601e3409e/articles/1" hit=false
               cache_write "views/cached_articles/show:56f144d2a3735c2ad85933a601e3409e/articles/1"
  show 2回目:  cache_read  "views/cached_articles/show:56f144d2a3735c2ad85933a601e3409e/articles/1" hit=true
  index 1回目: cache_read_multi "views/articles/_article:994fc1f07e48f4f5607b97fba48116db/articles/1" … hits=0
               cache_write_multi …
  index 2回目: cache_read_multi … hits=3
  cache_key_with_version=articles/1-20261111102904565673
  touch 後          =articles/1-20261111102924312343
  touch 後の show: cache_read hit=false → cache_write
  ログ: Read fragment views/cached_articles/show:56f144…/articles/1-20261111102904565673 (0.1ms)
        Read fragment views/cached_articles/show:56f144…/articles/1-20261111102924312343 (0.1ms)
        Write fragment views/cached_articles/show:56f144…/articles/1-20261111102924312343 (0.0ms)
`}
          />
          <p>キーは次の3つの部分からなります。</p>
          <ul>
            <li>
              <code>views/cached_articles/show</code>：テンプレートのパス
            </li>
            <li>
              <code>56f144d2…</code>：テンプレートと、その中で描画するパーシャルの内容のダイジェスト。テンプレートを変更してデプロイすると変わり、古いキャッシュは使われなくなる
            </li>
            <li>
              <code>articles/1</code>：レコードの <code>cache_key</code>。updated_at（バージョン）はキーとは別に保存される
            </li>
          </ul>
          <p>
            ログの Read fragment にはバージョン（<code>-20261111…</code>）付きの名前が出ていますが、キャッシュストアのキー自体はバージョンを含みません。<code>touch</code>{' '}
            で updated_at が変わると、同じキーで読んでもバージョンが一致しないのでキャッシュミス（hit=false）になり、新しい内容で上書きされます。キーの数が増え続けないようにするための仕組みです（cache versioning）
            <Ref n={5} />。
          </p>
          <p>
            次の図は touch の前と後で同じキーを読んだときに比べる値を、左右に並べたものです。上のキーは前と後で同じで、その下の2つのバージョンが一致するかどうかで、ヒットとミスが決まります。
          </p>
          <Figure
            title="touch の前後で比べるバージョン"
            caption="上の記録（show 2回目と、touch 後の show）をもとにした模式図。紫の箱は touch で変わった値。"
          >
            <FragmentVersionFigure />
          </Figure>
          <p>
            <code>cached: true</code> のコレクションの描画は、全要素のキーを <code>read_multi</code> でまとめて1回で読み、無かった分だけを描画して <code>write_multi</code>{' '}
            で書き込みます。2回目は3件とも見つかり（hits=3）、パーシャルは描画されませんでした。コメントの描画を記事のキャッシュの中に入れ子にする場合は、Comment に{' '}
            <code>belongs_to :article, touch: true</code> と書き、コメントの変更で記事の updated_at も更新されるようにします（Russian doll caching）
            <Ref n={5} />。
          </p>
        </>
      ),
    },
    {
      id: 'rails-cache',
      title: 'Rails.cache とキャッシュストア',
      body: (
        <>
          <p>
            フラグメントキャッシュは <code>Rails.cache</code> に保存されます。描画以外の計算結果は、<code>Rails.cache.fetch</code> で直接保存できます。Redis のストアで確かめました。
          </p>
          <Code
            lang="ruby"
            code={`
store = ActiveSupport::Cache::RedisCacheStore.new(url: ENV["REDIS_URL"], namespace: "demo")
store.fetch("ranking/top", expires_in: 10.minutes) { Article.order(views_count: :desc).limit(3).pluck(:id) }
`}
          />
          <Code
            lang="text"
            code={`
  fetch 1回目 => [1885, 1872, 5314]（ブロックの実行 1 回）
  fetch 2回目 => [1885, 1872, 5314]（ブロックの実行 1 回）
  Redis のキー=["demo:ranking/top"] TTL=600秒
  Rails.cache（開発環境）=ActiveSupport::Cache::MemoryStore
`}
          />
          <p>
            <code>fetch</code> は、キーが無いときだけブロックを実行して結果を保存します。2回目はブロックが実行されませんでした。Redis には namespace（キーの前に付ける共通の文字列。ここでは demo:）を付けたキーで保存され、
            <code>expires_in</code> が TTL になっています。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ストア</th>
                  <th>保存先</th>
                  <th>注意点</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>MemoryStore</td>
                  <td>プロセスのメモリー（既定 32MB）</td>
                  <td>Puma のワーカーやコンソールの間で共有されない。開発環境の既定</td>
                </tr>
                <tr>
                  <td>FileStore</td>
                  <td>ファイル</td>
                  <td>サーバーが複数台なら共有されない</td>
                </tr>
                <tr>
                  <td>MemCacheStore・RedisCacheStore</td>
                  <td>Memcached・Redis</td>
                  <td>複数プロセスで共有できる。Redis 8 のデモの既定値は <code>maxmemory=0</code>、<code>maxmemory-policy=noeviction</code>。上限を設定するときは、同時にどのキーを削除できるかを決める。<Ref n={18} /></td>
                </tr>
                <tr>
                  <td>Solid Cache</td>
                  <td>データベース</td>
                  <td>Rails 8 の新規アプリケーションの既定。メモリーより大きな容量を持てる</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            ガイドによると、MemoryStore はプロセスごとのメモリーに保存するので、Puma のクラスタモードで複数のワーカーを動かすと、ワーカーごとに別々のキャッシュになります
            <Ref n={5} />。コンソールで <code>Rails.cache.clear</code> を実行しても、動いているサーバーのキャッシュは消えません。
          </p>
          <p>Redis をキャッシュ専用にする場合、上限到達時に最終アクセスが古いと見なしたキーを削除する <code>allkeys-lru</code> などを選べます。ジョブのキューと同じインスタンスに置くと、キャッシュ容量の都合でジョブに必要なキーまで削除される構成になり得ます。また、Redis に接続できないと Rails の RedisCacheStore ではキャッシュミスが増え、普段キャッシュから返せていた要求も DB に届きます。<Ref n={18} /><Ref n={19} />（<ChapterLink n={106} />）。</p>
          <Callout kind="v72">
            <p>
              Notifications、Server-Timing、ETag、フラグメントキャッシュの仕組みは Rails 7.2.4 でも同じです。Rails 8.0 から、新規のアプリケーションの本番環境のキャッシュストアは Solid Cache
              になりました
              <Ref n={6} />。7.2 で作ったアプリケーションの本番環境の設定ファイルでは <code>config.cache_store</code> がコメントになっていて、明示的に設定していなければ既定のストアが使われます。業務のアプリケーションでは、production.rb の{' '}
              <code>config.cache_store</code> の値を確かめます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'index-and-caching-decisions',
      title: "MySQL の実行計画とキャッシュの判断",
      body: (
        <>
          <p>
            関連を <code>preload</code> すると、親の ID を使う <code>IN (...)</code> の問い合わせが作られます。大量の ID を一度に渡すと、MySQL の通信サイズの制限に達したり、範囲を最適化するメモリーの上限を超えて実行計画が変わったりすることがあります。管理バッチでは件数を分けて読み、ページの表示では必要な範囲だけを取得します。<Ref n={13} /><Ref n={14} />（<ChapterLink n={13} section="preload">先読みの SQL</ChapterLink>）。
          </p>
          <p>
            一覧の読み取りが重いときは、<ChapterLink n={37} section="explain-rails">MySQL の実行計画</ChapterLink>で、索引を使うか、どの段階で何行を処理するかを確認します。<code>EXPLAIN ANALYZE</code> では推定行数と実測行数、<code>loops</code>（繰り返し回数）を比べられます。対象の文を実行するため、負荷や変更の影響を確認した環境で使います。<Ref n={15} />
          </p>
          <p>
            関連の読み込み回数を減らしても重い処理にはキャッシュを検討できます。 Solid Cache を使うときは、<code>config/cache.yml</code> の <code>max_age</code> や <code>max_size</code> などで、有効期間・容量に合う保管量を決めます。<Ref n={16} /><code>Rails.cache.fetch</code> で検索結果を保存するなら、検索条件・利用者に見せてよい範囲・有効期限をキーや設計に反映します。無効化条件とヒット率を見て、保存する費用に見合うかを確かめます。<Ref n={10} /><Ref n={17} />
          </p>
          <p>前日分のランキングなら有効期限まで同じ計算結果を使えます。記事本文なら <code>cache_key_with_version</code> にレコードのバージョンを含め、更新後の要求で別のキーを使えます。記事とコメントをまとめた結果では、コメントだけの更新でもバージョンが変わるよう、コメントの変更をキーに反映します。古い情報を表示できない権限判定では、失効を即時に反映できる経路を先に決めます。<Ref n={5} /></p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>応答時間はブラウザーが要求を送ってから応答を受け取り終えるまでの時間です。curl の time_total、x-runtime、ログの Completed の行の順に、測る範囲が内側になります。</li>
          <li>Completed の行の Views は描画、ActiveRecord は SQL の時間と回数で、どちらにも入らない残りはコントローラーなどの Ruby の処理です。SQL の回数が表示件数とともに増えるなら N+1 を疑います。</li>
          <li>ログの Completed の行と Server-Timing は、ActiveSupport::Notifications のイベントから作られます。イベントを購読すれば処理の内訳を時刻順に調べられます。</li>
          <li>ビューの中で関連をたどると、SQL はテンプレートの描画の途中で実行されます。ログの Views はその SQL の時間を除いた値で、SQL の時間は ActiveRecord に入ります。</li>
          <li>遅さの原因は、SQL の回数・1回の時間・ロックの待ち・GC の順に確かめます。SQL のコメント（QueryLogs）で、遅い SQL を送ったアクションがわかります。</li>
          <li>キャッシュは一度作った結果をキーで保存して使い回します。元のデータが変わっても保存した値は変わらないので、有効期限やキーの変更で古い値を使わないようにします。</li>
          <li>Rack::ETag は描画後の本文から ETag を作るので処理時間は減らず、CSRF のメタタグがあると一致もしません。fresh_when・stale? なら描画の前に 304 を返せます。</li>
          <li>フラグメントキャッシュのキーはテンプレートのパスとダイジェストとレコードのキーからなり、updated_at はバージョンとして別に比べられます。cached: true は read_multi でまとめて読みます。</li>
          <li>MemoryStore はプロセスごとです。複数のプロセスで共有するには Redis・Memcached・Solid Cache を使います。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'actionpack/lib/action_dispatch/middleware/server_timing.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/server_timing.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'リクエストの間のイベントを購読し、名前ごとの合計時間を Server-Timing ヘッダーにすること。' },
    { title: 'Active Support Instrumentation', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_support_instrumentation.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'instrument と subscribe、Rails が発行するイベントの一覧とペイロード。' },
    { title: 'Tuning Performance for Deployment', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/tuning_performance_for_deployment.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'GVL と stop-the-world の GC、Rails 7.2 以降は Ruby 3.3 以上で YJIT が自動で有効になること。' },
    { title: 'rack: lib/rack/etag.rb', publisher: 'rack/rack（GitHub）', url: 'https://github.com/rack/rack/blob/v3.2.8/lib/rack/etag.rb', accessed: '2026-11-11', version: 'Rack 3.2.8', note: '200 の応答の本文全体のダイジェストから弱い ETag を作ること。' },
    { title: 'Caching with Rails: An Overview', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/caching_with_rails.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'フラグメント・コレクション・Russian doll のキャッシュ、cache_key_with_version、条件付き GET、MemoryStore がプロセスごとであること、Solid Cache が既定のストアであること。' },
    { title: 'railties CHANGELOG（8.0.0）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v8.0.0/railties/CHANGELOG.md', accessed: '2026-11-11', version: 'Rails 8.0.0', note: '本番環境の Rails.cache の既定を Solid Cache にしたこと。' },
    { title: 'actionpack/lib/action_controller/log_subscriber.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/log_subscriber.rb`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'Completed の行が process_action のイベントの時間と、Views・ActiveRecord・GC の値から作られること。' },
    { title: 'rack: lib/rack/runtime.rb', publisher: 'rack/rack（GitHub）', url: 'https://github.com/rack/rack/blob/v3.2.8/lib/rack/runtime.rb', accessed: '2026-11-16', version: 'Rack 3.2.8', note: 'Rack::Runtime が、自分より内側の処理にかかった時間を x-runtime ヘッダーに入れること。デモのミドルウェアの一覧で8番目にあることを確認。' },
    { title: 'curl man page（-w, --write-out の time_total）', publisher: 'curl', url: 'https://curl.se/docs/manpage.html', accessed: '2026-11-16', version: 'curl 8.x', note: 'time_total は転送全体にかかった秒数であること。curl 8.23.0 で実測。' },
    { title: "Active Record Querying", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_record_querying.html", accessed: "2026-11-20", version: "Rails 8.1", note: "Relation、スコープ、バッチ、一覧と集計の問い合わせ。" },
    { title: "Kaminari", publisher: "kaminari/kaminari", url: "https://github.com/kaminari/kaminari", accessed: "2026-11-20", note: "Relation のページ番号・件数・表示用ヘルパー。" },
    { title: "Active Job Basics", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_job_basics.html", accessed: "2026-11-20", version: "Rails 8.1", note: "ジョブの設定、キュー、再試行、定期実行。" },
    { title: "Packet Too Large", publisher: "MySQL Reference Manual", url: "https://dev.mysql.com/doc/refman/8.4/en/packet-too-large.html", accessed: "2026-11-20", version: "MySQL 8.4", note: "max_allowed_packet の制限。" },
    { title: "Range Optimization", publisher: "MySQL Reference Manual", url: "https://dev.mysql.com/doc/refman/8.4/en/range-optimization.html", accessed: "2026-11-20", version: "MySQL 8.4", note: "多数の値を渡す範囲最適化とメモリー上限。" },
    { title: "EXPLAIN Statement", publisher: "MySQL Reference Manual", url: "https://dev.mysql.com/doc/refman/8.4/en/explain.html", accessed: "2026-11-27", version: "MySQL 8.4", note: "EXPLAIN ANALYZE で文を実行し、推定行数と実測値、繰り返し回数を出すこと。" },
    { title: "Solid Cache", publisher: "rails/solid_cache", url: "https://github.com/rails/solid_cache", accessed: "2026-11-20", note: "DB をキャッシュストアに使う構成。" },
    { title: "Caching with Rails", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/caching_with_rails.html", accessed: "2026-11-20", version: "Rails 8.1", note: "フラグメントやキャッシュストアの使用法。" },
    { title: "Key eviction", publisher: "Redis Documentation", url: "https://redis.io/docs/latest/develop/reference/eviction/", accessed: "2026-11-27", version: "Redis 8", note: "maxmemory と削除方針の関係。デモと同じ redis:8 イメージで既定値を確認した。" },
    { title: "RedisCacheStore", publisher: "Rails API", url: "https://api.rubyonrails.org/v8.1/classes/ActiveSupport/Cache/RedisCacheStore.html", accessed: "2026-11-27", version: "Rails 8.1", note: "キャッシュ用 Redis をキューと分けること、接続に失敗したときの読み書き。" },
  ],
}

export default withExplanations(ch22, explanation22)
