import { useState } from 'react'
import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { Callout, ChapterLink, Code, Figure, Ref } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const figure = (n: number) => `${chapterNumber(115)}-${n}`
const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const SK = 'https://github.com/sidekiq/sidekiq/blob/v8.1.7'

/* ---------- 判断の流れの図（各事例で共通の形） ---------- */
type Step = { q: string[]; yes: string[] }

/** 上から問いに答え、「はい」なら右の案、「いいえ」なら下の問いへ進む図。 */
function DecisionFigure({ id, label, start, steps, last }: { id: string; label: string; start?: string[]; steps: Step[]; last: string[] }) {
  const top = start ? 100 : 20
  const rowH = 92
  const h = top + steps.length * rowH + 76
  return (
    <Svg id={id} w={780} h={h} label={label}>
      {start && (
        <>
          <Box x={20} y={20} w={360} h={56} lines={start} fill="box5" />
          <Arrow x1={200} y1={76} x2={200} y2={top - 2} />
        </>
      )}
      {steps.map((s, i) => {
        const y = top + i * rowH
        return (
          <g key={i}>
            <Box x={20} y={y} w={360} h={60} lines={s.q} fill="box" />
            <Arrow x1={380} y1={y + 30} x2={438} y2={y + 30} accent />
            <T x={409} y={y + 18} fs={11} anchor="middle" tone="acc">はい</T>
            <Box x={440} y={y} w={320} h={60} lines={s.yes} fill="box4" />
            <Arrow x1={200} y1={y + 60} x2={200} y2={y + rowH - 2} />
            <T x={208} y={y + 76} fs={11} tone="muted">いいえ</T>
          </g>
        )
      })}
      <Box x={20} y={top + steps.length * rowH} w={360} h={56} lines={last} fill="bg" dashed />
    </Svg>
  )
}

/* ---------- 図：構成ごとの完了件数（5 巡の測定） ---------- */
const benchRows = [
  { label: '1 プロセス × 3', rps: [18.5, 34.1, 22.0, 28.3, 18.5], median: 22.0, note: '103 MB・接続 3・CPU 63%' },
  { label: '1 プロセス × 5', rps: [26.8, 38.4, 27.2, 34.8, 32.5], median: 32.5, note: '110 MB・接続 5・CPU 73%' },
  { label: '2 ワーカー × 3', rps: [41.7, 60.3, 45.2, 40.6, 18.4], median: 41.7, note: '269 MB・接続 6・CPU 113%' },
  { label: '2 ワーカー × 5', rps: [57.1, 50.0, 42.7, 33.1, 20.5], median: 42.7, note: '277 MB・接続 10・CPU 115%' },
  { label: '2 ワーカー × 10', rps: [72.0, 55.0, 50.9, 47.1, 16.1], median: 50.9, note: '299 MB・接続 20・CPU 135%' },
  { label: '4 ワーカー × 3', rps: [70.3, 36.2, 42.3, 54.3, 45.7], median: 45.7, note: '455 MB・接続 12・CPU 137%' },
]
function BenchFigure() {
  const x0 = 140
  const s = 5 // 1 件/秒あたりの幅
  return (
    <Svg id={figure(2)} w={780} h={370} label="Puma の 6 つの構成で、16 クライアントの閉ループの負荷を 15 秒かけた 1 秒あたりの完了件数。6 つの構成を順に測る巡を 5 回繰り返した。棒は中央値、点は各巡の値。1 プロセスのまま 3 スレッドから 5 スレッドにすると 5 巡とも増えた。ワーカーを 2 つ以上にした構成は中央値で 41.7〜50.9 件/秒と 1 プロセスより多いが、巡ごとの差が大きい。右の値は RSS の合計、MySQL への接続数、Puma のコンテナが使った CPU の中央値">
      <T x={20} y={20} bold>1 秒あたりの完了件数（CPU の上限 2、16 クライアント、15 秒、5 巡）</T>
      {benchRows.map((r, i) => {
        const y = 44 + i * 48
        const end = Math.max(...r.rps)
        return (
          <g key={r.label}>
            <T x={20} y={y + 12} fs={12}>{r.label}</T>
            <rect x={x0} y={y + 3} width={r.median * s} height={18} rx={2} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            {r.rps.map((v, k) => (
              <circle key={k} cx={x0 + v * s} cy={y + 12} r={3.5} fill="var(--fig-accent)" stroke="var(--fig-bg)" />
            ))}
            <T x={x0 + end * s + 10} y={y + 12} fs={11}>{`中央値 ${r.median.toFixed(1)}`}</T>
            <T x={760} y={y + 12} fs={10.5} tone="muted" anchor="end">{r.note}</T>
          </g>
        )
      })}
      <rect x={140} y={336} width={18} height={11} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={164} y={342} fs={11}>5 巡の中央値</T>
      <circle cx={290} cy={342} r={3.5} fill="var(--fig-accent)" />
      <T x={300} y={342} fs={11}>各巡の値</T>
      <T x={760} y={342} fs={10.5} tone="muted" anchor="end">右の値は RSS・接続・Puma の CPU（中央値）</T>
    </Svg>
  )
}

/* ---------- 図：接続プールの上限と待ち ---------- */
function PoolWaveFigure() {
  const x0 = 170
  const s = 1.0 // 1ms あたりの幅
  const row = (y: number, label: string, waves: number[], total: string) => (
    <g>
      <T x={20} y={y + 12} fs={12}>{label}</T>
      {waves.map((n, i) => (
        <g key={i}>
          <rect x={x0 + i * 104 * s} y={y} width={100 * s} height={24} rx={3} fill={i === 0 ? 'var(--fig-box4)' : 'var(--fig-box5)'} stroke="var(--fig-line)" />
          <T x={x0 + i * 104 * s + 50} y={y + 12} fs={11} anchor="middle">{`${n} 件`}</T>
        </g>
      ))}
      <T x={x0 + waves.length * 104 * s + 8} y={y + 12} fs={11} tone="muted">{total}</T>
    </g>
  )
  return (
    <Svg id={figure(4)} w={780} h={220} label="10 スレッドが同時に 100ms の SQL を 1 回ずつ実行する。max_connections が 2 なら 2 件ずつ 5 回に分かれて全体で 535ms、5 なら 5 件ずつ 2 回で 216ms、10 なら 1 回で 112ms だった">
      <T x={20} y={20} bold>10 スレッドが SELECT SLEEP(0.1) を同時に 1 回ずつ実行</T>
      {row(40, 'max_connections 2', [2, 2, 2, 2, 2], '全体 535 ms')}
      {row(80, 'max_connections 5', [5, 5], '全体 216 ms')}
      {row(120, 'max_connections 10', [10], '全体 112 ms')}
      <rect x={20} y={176} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={40} y={182} fs={11}>すぐに接続を借りた SQL</T>
      <rect x={220} y={176} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={240} y={182} fs={11}>接続が返るのを待ってから実行した SQL</T>
      <T x={20} y={206} fs={11} tone="muted">100ms ごとに区切って描いた模式図。実測では接続を待った時間の最大が 415 ms（上限 2）、102 ms（上限 5）、0 ms（上限 10）</T>
    </Svg>
  )
}

/* ---------- 図：接続プールの上限と待ち（操作できる図） ---------- */
/** スレッドが同時に 100ms の SQL を 1 回ずつ実行する。接続は待ち始めた順に渡し、100ms ごとにまとめて返ると仮定する */
function poolModel(threads: number, max: number, timeout: number) {
  const lanes = Array.from({ length: threads }, (_, i) => {
    const wait = Math.floor(i / max) * 100
    return wait < timeout ? { wait, ok: true } : { wait: timeout, ok: false }
  })
  const ok = lanes.filter((l) => l.ok)
  const total = Math.max(...lanes.map((l) => (l.ok ? l.wait + 100 : l.wait)))
  return { lanes, total, maxWait: Math.max(...ok.map((l) => l.wait)), waiting: Math.max(0, threads - max), errors: threads - ok.length }
}

function PoolModelFigure() {
  const [threads, setThreads] = useState(10)
  const [max, setMax] = useState(2)
  const [timeout, setTimeoutMs] = useState(1000)
  const m = poolModel(threads, max, timeout)
  const range = Math.ceil(Math.max(m.total, timeout) / 100) * 100
  const x0 = 120
  const x = (ms: number) => x0 + (ms / range) * 630
  const top = 46
  const bottom = top + threads * 14
  const step = range > 600 ? 200 : 100
  return (
    <Figure n={figure(5)} title="スレッド数・接続プールの上限・checkout_timeout を変える" caption="概念モデルです。どのスレッドも 0 ms に同時に 100 ms の SQL を 1 回実行し、接続は待ち始めた順に渡され、100 ms ごとにまとめて返ると仮定しています。実際には接続の受け渡しと SQL の送受信に数 ms かかるので、上限 2 の全体は実測の 535 ms のように、この図の 500 ms より少し長くなります。Puma のスレッドの待ちや DB の中の待ちは含みません。">
      <div className="sim-controls">
        <label>
          <span>同時に SQL を実行するスレッド <output>{threads}</output> 本</span>
          <input type="range" min={1} max={20} step={1} value={threads} onChange={(e) => setThreads(e.target.valueAsNumber)} />
        </label>
        <label>
          <span>max_connections（プールの上限） <output>{max}</output></span>
          <input type="range" min={1} max={12} step={1} value={max} onChange={(e) => setMax(e.target.valueAsNumber)} />
        </label>
        <label>
          <span>checkout_timeout <output>{timeout}</output> ms</span>
          <input type="range" min={50} max={1000} step={50} value={timeout} onChange={(e) => setTimeoutMs(e.target.valueAsNumber)} />
        </label>
      </div>
      <Svg id={figure(5)} w={780} h={bottom + 64} label={`${threads} 本のスレッドが同時に 100 ms の SQL を実行する。max_connections が ${max} なら ${max} 本ずつ順に実行し、全体で ${m.total} ms。checkout_timeout ${timeout} ms までに接続を借りられなかった ${m.errors} 本は ConnectionTimeoutError になる。`}>
        <T x={20} y={16} bold fs={12}>スレッドごとの接続の待ちと SQL（上から 1 本目、2 本目…）</T>
        {m.lanes.map((l, i) => {
          const y = top + i * 14
          return (
            <g key={i}>
              <T x={x0 - 12} y={y + 5} fs={10} anchor="end" tone="muted">{`${i + 1}`}</T>
              {l.wait > 0 && <rect x={x0} y={y} width={x(l.wait) - x0} height={10} fill="var(--fig-box5)" stroke="var(--fig-line)" strokeDasharray="3 2" />}
              {l.ok
                ? <rect x={x(l.wait)} y={y} width={x(l.wait + 100) - x(l.wait)} height={10} fill="var(--fig-box4)" stroke="var(--fig-line)" />
                : <rect x={x(l.wait) - 3} y={y - 1} width={6} height={12} fill="var(--fig-danger)" />}
            </g>
          )
        })}
        <line x1={x(timeout)} y1={top - 6} x2={x(timeout)} y2={bottom} stroke="var(--fig-accent)" strokeDasharray="5 3" />
        <T x={x(timeout) - 4} y={34} fs={10.5} anchor="end" tone="acc">checkout_timeout</T>
        <line x1={x0} y1={bottom + 4} x2={x(range)} y2={bottom + 4} stroke="var(--fig-line)" />
        {Array.from({ length: range / step + 1 }, (_, k) => k * step).map((ms) => (
          <T key={ms} x={x(ms)} y={bottom + 16} fs={10} anchor="middle" tone="muted">{`${ms}`}</T>
        ))}
        <rect x={20} y={bottom + 38} width={14} height={10} fill="var(--fig-box5)" stroke="var(--fig-line)" strokeDasharray="3 2" />
        <T x={40} y={bottom + 43} fs={11}>接続を待つ</T>
        <rect x={150} y={bottom + 38} width={14} height={10} fill="var(--fig-box4)" stroke="var(--fig-line)" />
        <T x={170} y={bottom + 43} fs={11}>SQL（100 ms）</T>
        <rect x={300} y={bottom + 37} width={6} height={12} fill="var(--fig-danger)" />
        <T x={314} y={bottom + 43} fs={11}>ConnectionTimeoutError</T>
        <T x={760} y={bottom + 43} fs={10.5} anchor="end" tone="muted">横軸は経過時間（ms）</T>
      </Svg>
      <div className="table-wrap" aria-live="polite"><table>
        <thead><tr><th scope="col">全体の時間</th><th scope="col">接続を待った時間の最大（成功分）</th><th scope="col">接続を待ったスレッドの最大数</th><th scope="col">ConnectionTimeoutError</th></tr></thead>
        <tbody><tr><td>{m.total} ms</td><td>{m.maxWait} ms</td><td>{m.waiting} 本</td><td>{m.errors} 本</td></tr></tbody>
      </table></div>
    </Figure>
  )
}

/* ---------- 図：DB の CPU を使う SQL の同時実行数 ---------- */
const dbRows = [
  { n: 1, qps: 1.7, ms: 600 },
  { n: 2, qps: 1.6, ms: 1243 },
  { n: 4, qps: 1.8, ms: 2113 },
  { n: 8, qps: 1.8, ms: 4324 },
  { n: 16, qps: 2.0, ms: 7692 },
]
function DbSaturationFigure() {
  return (
    <Svg id={figure(6)} w={780} h={270} label="MySQL の CPU を使う SQL を同時に 1 本から 16 本まで実行した。1 秒あたりの完了数は 1.6 から 2.0 回でほとんど変わらず、1 回の平均時間は 600ms から 7692ms に延びた">
      <T x={20} y={20} bold>同時に実行する本数</T>
      <T x={170} y={20} bold>1 秒あたりの完了数</T>
      <T x={430} y={20} bold>1 回の平均時間</T>
      {dbRows.map((r, i) => {
        const y = 40 + i * 40
        return (
          <g key={r.n}>
            <T x={20} y={y + 12} fs={12}>{`${r.n} 本`}</T>
            <rect x={170} y={y} width={r.qps * 100} height={22} rx={3} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            <T x={176 + r.qps * 100} y={y + 11} fs={11}>{`${r.qps} 回`}</T>
            <rect x={430} y={y} width={r.ms / 30} height={22} rx={3} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={436 + r.ms / 30} y={y + 11} fs={11}>{`${r.ms} ms`}</T>
          </g>
        )
      })}
      <T x={20} y={252} fs={11} tone="muted">SELECT BENCHMARK(2000000, SHA2('rails', 256)) を各接続から 4 回ずつ。MySQL 8.4.13（CPU の上限なし、ほかの作業と共有）</T>
    </Svg>
  )
}

/* ---------- 図：キャッシュのキーに入れる値 ---------- */
function CacheKeyFigure() {
  return (
    <Svg id={figure(8)} w={780} h={300} label="キャッシュのキー ag115:description/products/1-20261127123135323230/ja は、名前空間、部分の名前、モデルの名前と ID、更新時刻から作ったバージョン、ロケールからできている。商品を更新すると更新時刻が変わるので新しいキーになる。会員価格は利用者の区分で変わるのでキャッシュの外に置く。商品 ID だけをキーにすると、会員の価格が一般の利用者にも表示された">
      <T x={20} y={20} bold>Redis に保存されたキー（実測）</T>
      <Box x={20} y={34} w={70} h={34} lines="ag115" fs={12} mono fill="box" />
      <Box x={94} y={34} w={110} h={34} lines="description" fs={12} mono fill="box" />
      <Box x={208} y={34} w={110} h={34} lines="products/1" fs={12} mono fill="box" />
      <Box x={322} y={34} w={200} h={34} lines="20261127123135323230" fs={12} mono fill="box5" accent />
      <Box x={526} y={34} w={50} h={34} lines="ja" fs={12} mono fill="box" />
      <T x={55} y={86} fs={10.5} anchor="middle" tone="muted">名前空間</T>
      <T x={149} y={86} fs={10.5} anchor="middle" tone="muted">部分の名前</T>
      <T x={263} y={86} fs={10.5} anchor="middle" tone="muted">モデルと ID</T>
      <T x={422} y={86} fs={10.5} anchor="middle" tone="muted">updated_at から作るバージョン</T>
      <T x={551} y={86} fs={10.5} anchor="middle" tone="muted">ロケール</T>
      <T x={20} y={114} fs={12}>商品を更新するとバージョンが変わり、次の読み込みは新しいキーでミスになる（古いキーは期限か容量の上限で消える）</T>
      <T x={20} y={154} bold>同じページの中で、キャッシュする部分としない部分を分ける</T>
      <Box x={20} y={168} w={360} h={44} lines={['商品説明・レビューの集計', '全員に同じ。キャッシュする']} fs={12} fill="box4" subTone="muted" />
      <Box x={400} y={168} w={360} h={44} lines={['価格（会員は 10% 引き）', '利用者の区分で変わる。キャッシュの外']} fs={12} fill="box" subTone="muted" />
      <Box x={20} y={232} w={740} h={44} lines={['失敗例：価格の部分を ["price-box", 商品 ID] のキーで保存', '会員が先に表示すると、一般の利用者にも「価格 4482 円」（会員価格）が表示された（実測）']} fs={12} fill="bg" accent subTone="danger" />
    </Svg>
  )
}

/* ---------- 図：期限切れの直後に同時に読む ---------- */
function StampedeFigure() {
  const x0 = 210
  const lane = (y: number, rebuild: boolean, k: number) => (
    <g key={k}>
      {rebuild ? (
        <rect x={x0} y={y} width={200} height={8} rx={2} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
      ) : (
        <rect x={x0} y={y} width={12} height={8} rx={2} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      )}
    </g>
  )
  return (
    <Svg id={figure(9)} w={780} h={290} label="期限が切れた直後に 20 スレッドが同じキーを読む。race_condition_ttl なしでは 20 スレッドすべてが値を作り直した。race_condition_ttl を 10 秒にすると、作り直したのは 1 回（別の実行では 2 回）で、ほかのスレッドは古い値を受け取った">
      <T x={20} y={20} bold>race_condition_ttl なし</T>
      {Array.from({ length: 10 }, (_, k) => lane(34 + k * 10, true, k))}
      <T x={20} y={60} fs={11.5}>20 スレッドすべてが</T>
      <T x={20} y={78} fs={11.5}>200ms かけて作り直す</T>
      <T x={x0 + 210} y={80} fs={11.5}>実測：ブロックの実行 20 回、DB への問い合わせも 20 回分</T>
      <T x={20} y={164} bold>race_condition_ttl 10 秒</T>
      {Array.from({ length: 10 }, (_, k) => lane(178 + k * 10, k === 0, k))}
      <T x={20} y={204} fs={11.5}>最初の 1 スレッドが作り直し、</T>
      <T x={20} y={222} fs={11.5}>ほかは古い値をすぐ返す</T>
      <T x={x0 + 210} y={224} fs={11.5}>実測：ブロックの実行 1 回（別の実行では 2 回）</T>
      <rect x={20} y={268} width={14} height={8} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
      <T x={40} y={272} fs={11}>値を作り直す（200ms）</T>
      <rect x={200} y={268} width={14} height={8} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={220} y={272} fs={11}>キャッシュの値を返す</T>
      <T x={400} y={272} fs={11} tone="muted">20 スレッドのうち 10 本を描いた模式図</T>
    </Svg>
  )
}

/* ---------- 図：期限切れの直後の作り直し（段階送り） ---------- */
function CacheState({ value, expires, first, others }: { value: string; expires: string; first: string; others: string }) {
  return (
    <div className="table-wrap"><table>
      <thead><tr><th scope="col">Redis の ranking の値</th><th scope="col">値の期限（expires_at）</th><th scope="col">最初に読んだスレッド A</th><th scope="col">ほかの 19 本</th></tr></thead>
      <tbody><tr><td>{value}</td><td>{expires}</td><td>{first}</td><td>{others}</td></tr></tbody>
    </table></div>
  )
}

const stampedeSteps = [
  {
    label: 'ttl なしの場合',
    detail: (
      <>
        <CacheState value="古い値（期限切れ）→ 削除" expires="過ぎている" first="ブロックを実行（200ms）" others="同じくブロックを実行" />
        <p><code>race_condition_ttl</code> を付けないと、期限切れの値を読んだスレッドはその値を消して、自分でブロックを実行します。20 本がほぼ同時に読むと、20 本とも作り直します（実測でブロックの実行 20 回）。以下の段階は <code>race_condition_ttl: 10</code> を付けた場合です。</p>
      </>
    ),
  },
  {
    label: '期限が切れる',
    detail: (
      <>
        <CacheState value="古い値" expires="過ぎている" first="まだ読んでいない" others="まだ読んでいない" />
        <p>値は <code>expires_in: 1</code> で保存してあります。<code>race_condition_ttl</code> を指定すると、RedisCacheStore は Redis のキーを <code>expires_in</code> より 5 分長く残すので、期限の過ぎた古い値をまだ読めます。</p>
      </>
    ),
  },
  {
    label: 'A が期限を延ばす',
    detail: (
      <>
        <CacheState value="古い値" expires="今から 10 秒後に書き換え" first="ブロックを実行（200ms）" others="まだ読んでいない" />
        <p>最初に読んだスレッド A は、値の期限が過ぎているのを見つけます。期限が過ぎてから 10 秒以内なので、古い値の期限を今から 10 秒後に書き換えて Redis に書き戻し、自分はブロックの実行に進みます（<code>handle_expired_entry</code>）。</p>
      </>
    ),
  },
  {
    label: 'ほかの 19 本が読む',
    detail: (
      <>
        <CacheState value="古い値" expires="期限内" first="ブロックを実行中" others="古い値をすぐ返す" />
        <p>ほかのスレッドが読むと、古い値は期限内に見えるので、ブロックを実行せずにそのまま返します。実測では 19 本が「古い値」を受け取りました。</p>
      </>
    ),
  },
  {
    label: 'A が書き込む',
    detail: (
      <>
        <CacheState value="新しい値" expires="今から 1 秒後" first="新しい値を返す" others="次の読み込みから新しい値" />
        <p>A は 200ms でブロックを終え、新しい値を <code>expires_in: 1</code> で書き込みます。作り直しは A の 1 回だけです。</p>
      </>
    ),
  },
  {
    label: '2 本が同時に読んだ場合',
    detail: (
      <>
        <CacheState value="古い値（2 回書き戻される）" expires="今から 10 秒後" first="ブロックを実行" others="1 本は A と同じくブロックを実行。残りは古い値" />
        <p>A が期限を書き戻す前に別のスレッドも期限切れの値を読むと、そのスレッドも期限を書き戻してブロックを実行します。1 回目の実行で作り直しが 2 回になったのは、この順序で読んだためと考えられます。<code>race_condition_ttl</code> はロックを取らないので、作り直しを必ず 1 回にする仕組みではありません。</p>
      </>
    ),
  },
]

/* ---------- 図：ジョブを入れる時点（段階送り） ---------- */
function JobState({ c, d }: { c: [string, string, string]; d: [string, string, string] }) {
  return (
    <div className="table-wrap"><table>
      <thead><tr><th scope="col">方式</th><th scope="col">注文の行（ほかの接続から）</th><th scope="col">Sidekiq のキュー</th><th scope="col">ジョブ</th></tr></thead>
      <tbody>
        <tr><th scope="row">C トランザクションの中で投入（既定）</th>{c.map((v, i) => <td key={i}>{v}</td>)}</tr>
        <tr><th scope="row">D コミットの後に投入</th>{d.map((v, i) => <td key={i}>{v}</td>)}</tr>
      </tbody>
    </table></div>
  )
}

const jobSteps = [
  {
    label: '注文を INSERT',
    detail: (
      <>
        <JobState c={['見えない（未コミット）', '空', 'なし']} d={['見えない（未コミット）', '空', 'なし']} />
        <p>トランザクションを始めて注文の行を INSERT します。コミットするまで、この行はほかの接続（Sidekiq のプロセスを含む）からは見えません。</p>
      </>
    ),
  },
  {
    label: 'perform_later',
    detail: (
      <>
        <JobState c={['見えない（未コミット）', 'ReceiptJob が入る', '実行待ち']} d={['見えない（未コミット）', '空', 'コミットまで投入を保留']} />
        <p><code>enqueue_after_transaction_commit</code> が false の C では、<code>perform_later</code> がすぐに Redis のキューへジョブを入れます。true の D では、Rails がトランザクションのコミットまで投入を保留します。</p>
      </>
    ),
  },
  {
    label: '3 ms 後に実行',
    detail: (
      <>
        <JobState c={['見えない（未コミット）', '空（再試行の予定に移る）', '注文が見つからず失敗']} d={['見えない（未コミット）', '空', '保留中']} />
        <p>C では Sidekiq がジョブを 3 ms 後に取り出しました。<code>ShopOrder.find_by</code> は nil を返し、ジョブは失敗して再試行の予定に入ります。D のジョブはまだキューにありません。</p>
      </>
    ),
  },
  {
    label: '0.5 秒後に COMMIT',
    detail: (
      <>
        <JobState c={['見える', '空（再試行の予定）', '再試行を待つ']} d={['見える', 'ReceiptJob が入る', '実行待ち']} />
        <p>在庫の更新などを終えてコミットすると、注文の行がほかの接続からも見えるようになります。D ではこの時点でジョブがキューに入ります。C のジョブは 15 秒以上後の再試行を待っています。</p>
      </>
    ),
  },
  {
    label: '領収書を送信',
    detail: (
      <>
        <JobState c={['見える', '空', '24,276 ms に再試行で送信']} d={['見える', '空', '1,057 ms に 1 回目で送信']} />
        <p>D は 1 回目の実行で注文を読めたので、開始から 1,057 ms で領収書を送りました。C は再試行で注文を読めましたが、送信は 24,276 ms 後でした。</p>
      </>
    ),
  },
]

/* ---------- 図：同期と非同期の時系列 ---------- */
function AsyncTimelineFigure() {
  const x0 = 160
  const s = 0.62 // 1ms あたりの幅
  const seg = (x: number, y: number, ms: number, label: string, fill: string, accent = false) => (
    <g>
      <rect x={x0 + x * s} y={y} width={ms * s} height={22} rx={3} fill={fill} stroke={accent ? 'var(--fig-accent)' : 'var(--fig-line)'} />
      <T x={x0 + x * s + (ms * s) / 2} y={y + 11} fs={11} anchor="middle">{label}</T>
    </g>
  )
  return (
    <Svg id={figure(12)} w={780} h={300} label="同期では注文の保存、PDF の生成 300ms、メール 200ms の後に応答し、応答まで約 530ms だった。非同期ではコミットの後にジョブを投入して約 13ms で応答し、ジョブが PDF とメールを済ませて約 553ms で送信が終わった。トランザクションの中で投入すると、コミット前にジョブが実行されて注文が見つからず、再試行で 24 秒後に送信された">
      <T x={20} y={20} bold>A 同期</T>
      <T x={20} y={46} fs={11.5}>Web の要求</T>
      {seg(0, 35, 30, '', 'var(--fig-box)')}
      {seg(30, 35, 300, 'PDF 300ms', 'var(--fig-box4)')}
      {seg(330, 35, 200, 'メール 200ms', 'var(--fig-box4)')}
      <T x={x0 + 540 * s} y={46} fs={11} tone="muted">応答 529〜533 ms</T>
      <T x={20} y={92} bold>B コミットの後に投入</T>
      <T x={20} y={118} fs={11.5}>Web の要求</T>
      {seg(0, 107, 14, '', 'var(--fig-box)')}
      <T x={x0 + 22} y={118} fs={11} tone="muted">応答 12.8〜14.7 ms</T>
      <T x={20} y={150} fs={11.5}>Sidekiq</T>
      {seg(30, 139, 300, 'PDF', 'var(--fig-box4)')}
      {seg(330, 139, 200, 'メール', 'var(--fig-box4)')}
      <T x={x0 + 540 * s} y={150} fs={11} tone="muted">送信 553 ms</T>
      <T x={20} y={196} bold>C トランザクションの中で投入（Rails 8.1 の既定）</T>
      <T x={20} y={222} fs={11.5}>Web の要求</T>
      {seg(0, 211, 510, 'COMMIT まで 0.5 秒', 'var(--fig-box)')}
      <T x={20} y={254} fs={11.5}>Sidekiq</T>
      {seg(3, 243, 40, '', 'var(--fig-box5)', true)}
      <T x={x0 + 50 * s} y={276} fs={11} tone="danger">3 ms で実行し、注文が見つからず失敗</T>
      <T x={x0 + 560 * s} y={254} fs={11} tone="muted">再試行で 24 秒後に送信</T>
    </Svg>
  )
}

const benchAppCode = `
# config.ru：1 ファイルの Rails アプリ。/orders は DB で 30ms 待ち、Ruby で JSON を作る
require "rails"
require "action_controller/railtie"
require "active_record/railtie"

class BenchApp < Rails::Application
  config.load_defaults 8.1
  config.eager_load = true
  config.api_only = true
  config.logger = Logger.new(nil)
  config.secret_key_base = "x" * 64
  config.hosts.clear
end

ENV["DATABASE_URL"] = "mysql2://root:pass@rbdemo-mysql/ag_115?max_connections=#{ENV.fetch('POOL', '5')}"

class OrdersController < ActionController::API
  ITEMS = Integer(ENV.fetch("CPU_ITEMS", "24000"))
  def index
    ActiveRecord::Base.connection.select_value("SELECT SLEEP(0.03)")         # DB の応答を 30ms 待つ
    bytes = Array.new(ITEMS) { |i| { id: i, name: "商品#{i}", price: i * 3 } }.to_json.bytesize  # Ruby の処理
    render json: { bytes: bytes, pid: Process.pid }
  end
end

BenchApp.initialize!
BenchApp.routes.draw { get "/orders" => "orders#index" }
run BenchApp
`

const pumaCode = `
# puma.rb
workers Integer(ENV.fetch("WEB_CONCURRENCY", "0"))
threads_count = Integer(ENV.fetch("RAILS_MAX_THREADS", "3"))
threads threads_count, threads_count
bind "tcp://0.0.0.0:3000"
preload_app!
`

const loadCode = `
# load.rb（抜粋）：CLIENTS 本のスレッドが、応答を受け取るたびに次の要求を送る
c0 = Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID)
clients.times.map {
  Thread.new {
    while Process.clock_gettime(Process::CLOCK_MONOTONIC) < stop
      t = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      res = Net::HTTP.get_response(uri) rescue nil      # 要求ごとに TCP 接続を作る
      ms = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - t) * 1000
      m.synchronize { res&.code == "200" ? lat << ms : errors += 1 }
    end
  }
}.each(&:join)
# 負荷をかける側が使った CPU 時間 ÷ 経過時間。100% に近ければ、負荷をかける側が先に詰まっている
cpu = Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID) - c0
`

const benchCmd = `
# bench.sh（抜粋）：構成を変えて Puma を起動し、別のコンテナから負荷をかける
docker run -d --name ag-115-puma --network rbdemo --cpus 2 \\
  -e WEB_CONCURRENCY=$WK -e RAILS_MAX_THREADS=$TH -e POOL=$TH ... ruby:4.0 puma -C puma.rb config.ru
u0=$(docker exec ag-115-puma cat /sys/fs/cgroup/cpuacct/cpuacct.usage)   # Puma のコンテナが使った CPU 時間（ns）
docker run --rm --network rbdemo -e CLIENTS=16 ... ruby:4.0 ruby load.rb
u1=$(docker exec ag-115-puma cat /sys/fs/cgroup/cpuacct/cpuacct.usage)   # (u1 - u0) ÷ 15 秒 を CPU の使用とする
docker exec ag-115-puma ruby /work/rss.rb             # プロセスごとの RSS を合計する
# MySQL の information_schema.processlist で、この DB への接続を数える

# rounds.sh：6 つの構成を同じ順に 1 巡ずつ測り、5 巡くり返す
for r in 1 2 3 4 5; do
  for c in "0 3" "0 5" "2 3" "2 5" "2 10" "4 3"; do ./bench.sh $c 16; done
done
`

const benchOut = `
== 1 プロセス × 3（クライアント 1）：1 件ずつ送った場合
完了 198 件  13.2 件/秒  p50 54.8 ms  p95 152.8 ms

== 16 クライアント、15 秒。6 構成 × 5 巡（負荷平均 4.3〜14.4）
構成              完了/秒の中央値（1〜5 巡目）            p50 の中央値  p95 の中央値  Puma の CPU  負荷側の CPU  RSS      接続
1 プロセス × 3     22.0（18.5 / 34.1 / 22.0 / 28.3 / 18.5）  682.6 ms    1248.5 ms     63%        3〜5%      103 MB    3 本
1 プロセス × 5     32.5（26.8 / 38.4 / 27.2 / 34.8 / 32.5）  460.4 ms     905.0 ms     73%        4〜5%      110 MB    5 本
2 ワーカー × 3     41.7（41.7 / 60.3 / 45.2 / 40.6 / 18.4）  351.5 ms     899.8 ms    113%        3〜8%      269 MB    6 本
2 ワーカー × 5     42.7（57.1 / 50.0 / 42.7 / 33.1 / 20.5）  352.6 ms     771.4 ms    115%        4〜8%      277 MB   10 本
2 ワーカー × 10    50.9（72.0 / 55.0 / 50.9 / 47.1 / 16.1）  275.1 ms     677.3 ms    135%        3〜10%     299 MB   20 本
4 ワーカー × 3     45.7（70.3 / 36.2 / 42.3 / 54.3 / 45.7）  300.8 ms     838.5 ms    137%        6〜10%     455 MB   12 本
（Puma の CPU は上限 200%。RSS と Puma の CPU は 5 巡の中央値。失敗はどの回も 0 件）
`

const pumaChosen = `
# 本番と同じ CPU の割り当ての検証環境で、次の値から測り直す
WEB_CONCURRENCY=2        # CPU の数に合わせる
RAILS_MAX_THREADS=5      # DB を待つ時間が半分を超えるので 3 から増やす。3・10 とも比べ直す
`

const forkCode = `
# fork_conn.rb：fork の前に開いた MySQL と Redis の接続を、子プロセスで使う
ActiveRecord::Base.establish_connection(adapter: "mysql2", host: "rbdemo-mysql", database: "ag_115", ...)
redis = Redis.new(url: "redis://rbdemo-redis:6379/0")
show = ->(who) {
  printf("%-6s PID %-4d MySQL の CONNECTION_ID %s  Redis の CLIENT ID %s\n", who, Process.pid,
         ActiveRecord::Base.connection.select_value("SELECT CONNECTION_ID()"), redis.call("CLIENT", "ID"))
}
show.("親")
Process.wait(fork { show.("子") })
show.("親")
`

const forkOut = `
親      PID 1    MySQL の CONNECTION_ID 201  Redis の CLIENT ID 13
子      PID 13   MySQL の CONNECTION_ID 202  Redis の CLIENT ID 14
親      PID 1    MySQL の CONNECTION_ID 201  Redis の CLIENT ID 13
`

const poolCode = `
# pool.rb（抜粋）
def connect(max, timeout = 5)
  ActiveRecord::Base.establish_connection(adapter: "mysql2", host: "rbdemo-mysql", username: "root",
    password: "pass", database: "ag_115", max_connections: max, checkout_timeout: timeout)
end

[2, 5, 10].each do |max|
  connect(max)
  pool = ActiveRecord::Base.connection_pool
  # 別のスレッドで pool.stat[:waiting] を 5ms ごとに読み、最大値を記録する（省略）
  10.times.map {
    Thread.new { pool.with_connection { |c| c.select_value("SELECT SLEEP(0.1)") } }
  }.each(&:join)
end

connect(2, 0.15)   # checkout_timeout を 0.15 秒にして、同じ 10 スレッドを実行する

# DB の CPU を使う SQL を、同時に 1・2・4・8・16 本の接続から 4 回ずつ実行する
sql = "SELECT BENCHMARK(2000000, SHA2('rails', 256))"
`

const poolOut = `
== 10 スレッドが同時に SELECT SLEEP(0.1) を 1 回ずつ実行
max_connections  2: 全体 535 ms  接続を待った時間 最大 415 ms  待ったスレッドの最大数 8
max_connections  5: 全体 216 ms  接続を待った時間 最大 102 ms  待ったスレッドの最大数 5
max_connections 10: 全体 112 ms  接続を待った時間 最大   0 ms  待ったスレッドの最大数 0

== checkout_timeout 0.15 秒、max_connections 2 で同じ 10 スレッド
ConnectionTimeoutError 6 件
  could not obtain a connection from the pool within 0.150 seconds (waited 0.150 seconds);
  all pooled connections were in use

== DB の CPU を使う SQL（BENCHMARK）を同時に実行する数を変える
同時  1 本:  4 回を  2.40 秒  1.7 回/秒  1 回の平均  600 ms
同時  2 本:  8 回を  5.00 秒  1.6 回/秒  1 回の平均 1243 ms
同時  4 本: 16 回を  8.66 秒  1.8 回/秒  1 回の平均 2113 ms
同時  8 本: 32 回を 17.89 秒  1.8 回/秒  1 回の平均 4324 ms
同時 16 本: 64 回を 31.67 秒  2.0 回/秒  1 回の平均 7692 ms
`

const dbYaml = `
# config/database.yml（production の部分）
production:
  <<: *default
  database: shop_production
  # Puma のスレッド数と同じ値にする（Rails 8.1 の rails new が生成する形）
  max_connections: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  checkout_timeout: 2
`

const cacheCode = `
# cache.rb（抜粋）。Redis 8 に名前空間 ag115 で保存する
CACHE = ActiveSupport::Cache::RedisCacheStore.new(url: "redis://rbdemo-redis:6379/0", namespace: "ag115")

def render_description(p) = TEMPLATE.result_with_hash(p: p)     # ERB で 200 行の HTML を作る
def render_with_reviews(p)                                       # レビュー 100,000 行を集計する
  count, avg = Review.where(product_id: p.id).pick(Arel.sql("COUNT(*)"), Arel.sql("AVG(rating)"))
  render_description(p) + "<p>レビュー #{count} 件、平均 #{avg.to_f.round(2)}</p>"
end

# バージョンとロケールを含むキーで保存する
p = Product.find(product.id)
CACHE.fetch(["description", p.cache_key_with_version, :ja]) { render_description(p) }
CACHE.fetch(["reviewed", p.cache_key_with_version, :ja], expires_in: 10.minutes) { render_with_reviews(p) }

# 失敗例：利用者で変わる価格を、商品 ID だけのキーで保存する
CACHE.fetch(["price-box", product.id]) { "<p>価格 #{price_for.(user)} 円</p>" }

# 期限が切れた直後に 20 スレッドが同時に読む。作り直しに 200ms かかる
20.times.map {
  Thread.new { CACHE.fetch("ranking", expires_in: 1, race_condition_ttl: rttl) { sleep 0.2; "新しい値" } }
}.each(&:join)
`

const cacheOut = `
== 商品説明の部分（DB の 1 行を読んで HTML を作る）を 200 回
                          1 回目の実行  2 回目の実行
キャッシュなし               0.61 ms      1.53 ms
キャッシュあり（2 回目以降）  0.73 ms      1.28 ms
Redis のキー: ag115:description/products/1-20261127123135323230/ja
説明を更新した後の 1 回目: ミス（新しいキーで作り直した）

== レビューの集計を含む部分（reviews 100,000 行を索引なしで集計）を 20 回
キャッシュなし           20.64 ms/回
キャッシュあり（2 回目以降） 2.24 ms/回

== 会員価格を含む部分を商品 ID だけのキーで保存すると
会員が先に表示:   <p>価格 4482 円</p>
一般の利用者:     <p>価格 4482 円</p>   ← 会員価格が表示される

== 期限切れの直後に 20 スレッドが同時に読む（作り直しに 200ms）
race_condition_ttl nil: ブロックを実行 20 回、受け取った値 {"新しい値" => 20}
race_condition_ttl 10: ブロックを実行  1 回、受け取った値 {"古い値" => 19, "新しい値" => 1}
（1 回目の実行では 2 回、受け取った値 {"古い値" => 18, "新しい値" => 2}）

== cache_idx.rb：同じ集計に (product_id, rating) の索引を加えた場合
索引なし: 21.36 ms/回（20 回）
(product_id, rating) の索引: 0.96 ms/回（20 回）
product_id=1 のレビュー: 2000 件
-> Aggregate: count(0), avg(reviews.rating)
    -> Covering index lookup on reviews using idx_reviews_product_rating (product_id=1)
`

const controllerCacheCode = `
# app/controllers/products_controller.rb（show の部分）
def show
  @product = Product.find(params[:id])
  @review_summary = @product.reviews.pick(Arel.sql("COUNT(*)"), Arel.sql("AVG(rating)"))  # 索引で 1 ms 前後
  # 全員に同じで、10 分の遅れを許せる売れ筋ランキングだけをキャッシュする
  @ranking = Rails.cache.fetch(["sales-ranking", I18n.locale], expires_in: 10.minutes,
                               race_condition_ttl: 10.seconds) { SalesRanking.top(10) }
end
`

const viewCode = `
<%# app/views/products/show.html.erb：価格は利用者の区分で変わるので、どのキャッシュにも入れない %>
<%= render "description", product: @product %>
<%= render "review_summary", summary: @review_summary %>
<%= render "price", product: @product, member: current_user&.member? %>
<%= render "ranking", items: @ranking %>
`

const jobCode = `
# jobapp.rb（抜粋）：Web 側とジョブ側の両方が読み込む
ActiveJob::Base.queue_adapter = :sidekiq
# Rails アプリでは railtie が組み込む。この実験は Rails を起動しないので自分で組み込む
ActiveJob::Base.include ActiveJob::EnqueueAfterTransactionCommit

def generate_receipt_pdf = sleep(0.3)   # PDF の生成に 300ms かかると仮定
def deliver_receipt_mail = sleep(0.2)   # メールの送信に 200ms かかると仮定

class ReceiptJob < ActiveJob::Base
  queue_as :ag115
  def perform(order_id)
    order = ShopOrder.find_by(id: order_id)
    unless order
      JobEvent.create!(order_id: order_id, event: "注文が見つからない（コミット前に実行）")
      raise ActiveRecord::RecordNotFound, "ShopOrder #{order_id}"
    end
    # 同じ注文で 2 回実行されてもメールを 1 回にする：送る権利を条件付き UPDATE で取る
    claimed = ShopOrder.where(id: order_id, receipt_sent_at: nil).update_all(receipt_sent_at: Time.current)
    return JobEvent.create!(order_id: order_id, event: "送信済みなので何もしない") if claimed == 0
    generate_receipt_pdf
    deliver_receipt_mail
    JobEvent.create!(order_id: order_id, event: "領収書を送信")
  end
end

class ReceiptJobAfterCommit < ReceiptJob
  self.enqueue_after_transaction_commit = true
end
`

const asyncCode = `
# async.rb（抜粋）
# B コミットの後で投入する
order = ShopOrder.transaction do
  o = ShopOrder.create!(total_cents: 4_980)
  ActiveRecord.after_all_transactions_commit { ReceiptJob.perform_later(o.id) }
  o
end

# C トランザクションの中で投入し、コミットまで 0.5 秒かかる
order = ShopOrder.transaction do
  o = ShopOrder.create!(total_cents: 4_980)
  ReceiptJob.perform_later(o.id)
  sleep 0.5                                   # 在庫の更新など、コミットまでの残りの処理
  o
end

# D は C の ReceiptJob を ReceiptJobAfterCommit にしたもの
# E は同じ注文の ReceiptJob を 2 回投入したもの
`

const asyncOut = `
== A 同期：注文の保存、PDF、メールを同じ要求で行う（5 回の平均）
応答まで 533 ms

== B 非同期：コミットの後でジョブを投入（5 回の平均）
応答まで 12.8 ms、領収書の送信完了まで 553 ms

== C トランザクションの中で投入し、コミットまで 0.5 秒かかる（Rails 8.1 の既定）
enqueue_after_transaction_commit = false
送信完了まで 24276 ms
  3 ms: 注文が見つからない（コミット前に実行）
  24245 ms: 領収書を送信

== D 同じ条件で enqueue_after_transaction_commit = true のジョブ
送信完了まで 1057 ms
  領収書を送信

== E 同じ注文でジョブが 2 回実行される
  送信済みなので何もしない
  領収書を送信
`

const chapter: Chapter = {
  number: 115,
  part: 11,
  title: "Puma・接続プール・キャッシュ・ジョブを選ぶ",
  summary: "Puma のワーカー数とスレッド数、接続プールの上限、キャッシュの対象とキー、同期処理と非同期処理の分け方を、測定条件を付けた実測値から決める四つの事例です。",
  goals: [
    "DB を待つ時間と Ruby の処理時間を分けて測り、ワーカー数とスレッド数を選ぶ",
    "接続プールの上限を、プロセスごとの必要数と DB の処理能力から決める",
    "キャッシュする部分、キー、期限を、結果を共有できる範囲と許容できる古さから決める",
    "応答の時点で約束する結果から、ジョブに移す処理と投入の時点を決める",
  ],
  prerequisites: [18, 22, 23, 113],
  sections: [
    {
      id: "overview",
      title: "この章で扱う四つの事例と読み方",
      body: (
        <>
          <p>この章では注文を受け付ける EC サイトの Web とジョブの設定を決める四つの事例を扱います。どの事例も Docker の上で Puma・MySQL・Redis・Sidekiq を実際に動かし、測った値をもとに案を選びます。</p>
          <ul>
            <li>Puma のワーカー数・スレッド数を決定する：セールの時間帯に商品一覧 API の p95 が悪化した</li>
            <li>コネクションプールのサイズを決定する：スレッドを増やしたら ActiveRecord::ConnectionTimeoutError が出た</li>
            <li>キャッシュ戦略を選択する：商品ページのどの部分を、どのキーで、どれだけの期間キャッシュするか</li>
            <li>同期処理と非同期処理を使い分ける：注文の確定に、領収書の作成とメールの時間が含まれている</li>
          </ul>
          <p>各事例は <ChapterLink n={114} section="overview" /> と同じ7項目（課題、原因や背景、解決方法の選択肢、判断基準、具体的な実装例、メリット・デメリット、トレードオフ）の順で書きます。各事例に、判断の順序を示す図を置きます。</p>
          <p>仕組みの説明は既存の章に任せます。Puma のプロセスとスレッド、GVL は <ChapterLink n={23} section="gvl" />、ワーカー数と接続数の計算は <ChapterLink n={113} section="capacity" />、接続プールの仕組みは <ChapterLink n={15} section="pool" />、キャッシュの種類は <ChapterLink n={22} section="cache-basics" />、ジョブとトランザクションの関係は <ChapterLink n={18} section="transaction" /> で扱っています。</p>
          <p>この章の数値はほかの作業も動いている共有のマシンで測りました。同じ設定でも測るたびに値が変わったので、Puma の事例では 5 巡測った値と中央値を示します。設定を決めるときは、自分のアプリケーションを本番と同じ CPU とメモリーの割り当てで測り直してください。</p>
        </>
      ),
    },
    {
      id: "setup",
      title: "測定に使った環境とアプリケーション",
      body: (
        <>
          <p>測定には Intel Core i7-1270P のマシンで WSL2 の上に 4 vCPU とメモリー 15GB を割り当てた Docker を使いました。Puma のコンテナは <code>--cpus 2</code> で CPU を 2 つ分に制限しています。MySQL 8.4.13 と Redis 8 は別のコンテナで動かし、CPU の上限は付けていません。ソフトウェアは Ruby 4.0.9、Rails 8.1.4.1、Puma 8.0.2、mysql2 0.5.7、Sidekiq 8.1.7、redis 5.4.1 です。</p>
          <p>Puma の事例では次の 1 ファイルの Rails アプリケーションを使いました。<code>/orders</code> は MySQL で 30ms 待つ SQL を実行し、その後に 24,000 件のハッシュを JSON にします。前半は DB の応答を待つ時間、後半は Ruby が CPU を使う時間です。</p>
          <Code lang="ruby" title="測定に使った Rails アプリケーション" code={benchAppCode} />
          <Code lang="ruby" title="Puma の設定" code={pumaCode} />
          <p>1 件ずつ要求を送ると、応答時間の中央値（p50）は 53.6 ms と 54.8 ms でした（2 回の測定。この値もマシンの負荷で変わります）。30 ms が DB の待ちなので、残りの約 24 ms の大部分が Ruby の処理です。1 件の時間のうち DB を待つ時間は半分を少し超えます。</p>
          <p>負荷は別のコンテナの Ruby スクリプトからかけました。16 本のスレッドが、応答を受け取るたびに次の要求を送る閉ループの負荷を 15 秒続け、完了した件数と応答時間の分布を集計します。負荷をかける側が先に詰まると、サーバーではなく負荷をかける側の限界を測ることになるので、負荷をかける側のプロセスが使った CPU の割合も記録します。p95 は完了した応答の時間を短い順に並べて 95% の位置にある値です。</p>
          <Code lang="ruby" title="負荷をかけるスクリプト" code={loadCode} />
          <Callout kind="note" title="閉ループの負荷と実際の到着">
            <p>閉ループの負荷では、応答が遅くなると次の要求も遅れて送られるので、要求の到着が自動的に減ります。利用者が実際に送る要求はサーバーの応答の速さに関係なく届きます。このため、サーバーの処理能力を超えたときの待ち時間は、本番ではこの測定よりも急に長くなることがあります（<ChapterLink n={111} section="queueing" />）。</p>
          </Callout>
        </>
      ),
    },
    {
      id: "workers",
      title: "Puma のワーカー数とスレッド数を決める",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>セールの時間帯に、商品一覧 API の応答時間の p95 が 300 ms 台から 700 ms 前後に悪化しました。エラーは増えていません。Web のコンテナは 2 vCPU で、Puma は rails new が作った設定のまま、1 プロセス（シングルモード）で 3 スレッドです。コンテナを大きくする前に、今の CPU とメモリーの範囲で改善できるかを調べます。</p>
          <h3>2. 原因や背景</h3>
          <p>1 件の処理時間は DB を待つ約 30 ms と、Ruby が JSON を作る約 24 ms に分かれます。CRuby の GVL により、1 つのプロセスで Ruby のコードを同時に実行できるスレッドは 1 本だけです。DB を待っている間は GVL を手放すので、ほかのスレッドが Ruby の処理を進められます（<ChapterLink n={23} section="gvl" />）。1 件ずつ送った測定では Ruby の処理が約 24 ms だったので、1 プロセスが 1 秒に完了できる件数は 1,000 ÷ 24 ≒ 42 件前後が上限の目安になります。これは 1 つの CPU を使い切れる場合の目安です。実装例の測定ではほかの作業と CPU を取り合い、1 プロセスの Puma が使えた CPU は 1 つ分に届かず（中央値 63〜73%）、完了件数は 18.5〜38.4 件/秒でした。</p>
          <p>Rails 8.1 の rails new が作る config/puma.rb はスレッド数だけを決め、ワーカー数は環境変数 WEB_CONCURRENCY に任せています。この環境変数を設定していなかったので、Puma はシングルモードで動き、2 つある CPU のうち Ruby の処理には 1 つしか使えていませんでした<Ref n={9} />。到着する要求が処理できる件数を超えると、要求は Puma の待ち行列で順番を待ち、その待ち時間が p95 に加わります。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：1 プロセスのまま、スレッドを 3 から 5 に増やす。</li>
            <li>案 2：ワーカーを CPU の数と同じ 2 にし、各ワーカーのスレッドを 3 か 5 にする。</li>
            <li>案 3：ワーカーを CPU の数より多い 4 にする。</li>
            <li>案 4：設定は変えず、JSON を作る Ruby の処理を減らす（返す項目を絞る、結果をキャッシュするなど。<ChapterLink n={112} section="profile" />）。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>スレッドを増やす効果は 1 件の時間のうち DB や外部 API を待つ時間の割合で決まります。Rails のガイドは、待つ時間が処理時間の 50% を超えないアプリケーションでは、1 プロセスあたり 3 スレッドを超えても効果が小さいとしています<Ref n={7} />。この API は待つ時間が半分を少し超えるので、5 スレッドを試す価値があります。</p>
          <p>ワーカーを増やすと、プロセスごとに GVL があるので、Ruby の処理を CPU の数まで同時に進められます。Puma の説明書はワーカー数を CPU のコア数に合わせることを出発点として勧めています<Ref n={8} />。CPU の数より多くのワーカーを置くと、あるプロセスが DB を待っている間に別のプロセスが CPU を使えますが、CPU を取り合う時間も増えます。</p>
          <p>増やした分の費用も同時に見ます。ワーカー 1 つでメモリーが約 100 MB 増え（実装例を参照）、DB への接続はワーカー数 × スレッド数まで増えます。接続の合計は次の事例で確かめます。値は測るたびに変わるので、同じ構成を 5 回以上測って中央値を比べ、1 回の結果で順位を決めないようにします。</p>
          <Figure n={figure(1)} title="ワーカー数とスレッド数を決める判断の流れ" caption="この事例の流れです。図は判断の順序を単純化したもので、変更のたびに同じ負荷で測り直します。">
            <DecisionFigure
              id={figure(1)}
              label="ワーカー数とスレッド数を決める判断の流れ。先に 1 件の時間を DB の待ちと Ruby の処理に分けて測る。CPU に余裕があり待つ時間が半分以上ならスレッドを増やす。CPU のコアを 1 プロセスしか使っていなければワーカーを CPU の数まで増やす。メモリーと DB の接続にさらに余裕があれば CPU の数より多いワーカーと比べる。どれでもなければ Ruby の処理を減らすか CPU を増やす"
              start={['1 件の時間を、DB の待ちと', 'Ruby の処理に分けて測る']}
              steps={[
                { q: ['CPU に余裕があり、DB や外部を', '待つ時間が半分以上か'], yes: ['スレッドを 3 から 5 に増やして測る'] },
                { q: ['CPU のコアを 1 プロセスしか', '使っていないか'], yes: ['ワーカーを CPU の数まで増やす'] },
                { q: ['メモリーと DB の接続に', 'さらに余裕があるか'], yes: ['CPU の数より多いワーカーと比べる'] },
              ]}
              last={['Ruby の処理を減らすか、', 'CPU を増やす']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>6 つの構成に同じ負荷を 1 つずつ順にかける巡を、5 回繰り返しました。巡ごとに同じ順で測るので、時間とともに変わるマシンの負荷がどの構成にも入ります。各構成で、負荷をかける側の CPU の使用、Puma のコンテナが使った CPU（cgroup の <code>cpuacct.usage</code> の増分を 15 秒で割った値）、Puma のプロセスの RSS の合計、MySQL への接続数を記録しています。</p>
          <Code lang="bash" title="構成を変えて測る" code={benchCmd} />
          <Code lang="text" title="実行結果" code={benchOut} />
          <Figure n={figure(2)} title="構成ごとの 1 秒あたりの完了件数（5 巡の測定）" caption="上の実行結果をまとめた図。棒は 5 巡の中央値、点は各巡の値です。右の値は RSS の合計、MySQL への接続数、Puma のコンテナが使った CPU の中央値です。">
            <BenchFigure />
          </Figure>
          <p>負荷をかける側の CPU の使用はどの回も 3〜10% で、負荷をかける側が先に詰まってはいませんでした。一方、マシン全体の負荷平均は 4.3〜14.4 と高く、Puma のコンテナが使えた CPU は構成ごとの中央値で 63〜137% でした。上限の 200% に対して 180% を超えたのは 1 回（4 ワーカー × 3 の 1 巡目、192%）だけです。同じマシンのほかの作業と CPU を取り合っていたので、この測定の件数は CPU を 2 つ専有できた場合より少なく、ばらつきも大きくなっています。</p>
          <p>5 巡すべてで同じ傾向が出たのは、1 プロセスのままスレッドを 3 から 5 にした変更です。完了件数は毎回増え、中央値は 22.0 件/秒から 32.5 件/秒に、p95 の中央値は 1,248.5 ms から 905.0 ms になりました。DB を待つ時間に別のスレッドが Ruby の処理を進めた結果です。</p>
          <p>ワーカーを 2 つ以上にした構成は、完了件数の中央値が 41.7〜50.9 件/秒で、1 プロセスの構成（22.0〜32.5 件/秒）より多く完了しました。巡ごとに比べると、1 プロセス × 5 を上回ったのは、2 ワーカー × 5 で 5 巡のうち 3 巡、ほかの 3 つの構成で 4 巡です。負荷平均が 8.8〜14.4 だった 5 巡目には、2 ワーカーの 3 つの構成がすべて 1 プロセス × 5 を下回りました（16.1〜20.5 件/秒）。複数のプロセスで Ruby を同時に実行する構成は CPU を実際に使うので、同じマシンのほかの処理と CPU を取り合うと影響を大きく受けます。</p>
          <p>2 ワーカーのままスレッドを 3・5・10 と変えた 3 つの構成は、巡ごとに順位が入れ替わりました。2 ワーカー × 10 は中央値が最も大きく（50.9 件/秒）、2 ワーカー × 5 を 5 巡のうち 4 巡で上回りましたが、MySQL への接続は 20 本に増えます。2 ワーカー × 3 と 2 ワーカー × 5 の中央値の差（41.7 と 42.7 件/秒）は、巡ごとの変動よりずっと小さい値です。Puma が CPU を 2 つ使えない状態で測ったので、スレッド数の違いが CPU を専有した環境で同じように出るかは、この測定からは分かりません。</p>
          <p>RSS の合計の中央値は 1 プロセスの 103〜110 MB に対して、2 ワーカーで 269〜299 MB、4 ワーカーで 455 MB でした。RSS の合計は <code>preload_app!</code> でプロセスの間で共有しているページを重ねて数えるので、実際の使用量より大きく出ます（共有分を割り振った値の測り方は <ChapterLink n={23} section="memory" />）。それでも、ワーカー 1 つにつき約 100 MB の増加はコンテナのメモリーの上限と比べる必要があります。</p>
          <p>この測定から、次の順に決めました。まず、ワーカーを CPU の数と同じ 2 にします。2 ワーカーの構成は 5 巡のうち 3〜4 巡で 1 プロセス × 5 より多く完了し、完了件数の中央値は 1 プロセス × 5 の 1.3〜1.6 倍でした。スレッド数はこの測定では決められなかったので、DB を待つ時間が半分を少し超えることから 5 を出発点にします。そのうえで、本番と同じ CPU の割り当てで、ほかの作業が動いていない検証環境を用意し、2 ワーカー × 3・5・10 を同じ負荷で比べ直します。メモリーの上限に 500 MB 以上の余裕があれば、4 ワーカー × 3 スレッドも同じ環境で比べます。</p>
          <Code lang="bash" title="最初に試す設定" code={pumaChosen} />
          <h3>6. メリット・デメリット</h3>
          <p>メリットは、コンテナを大きくせずに 2 つの CPU を Ruby の処理に使えることです。5 巡の中央値では 1 プロセス × 3 の 22.0 件/秒に対して 2 ワーカー × 5 は 42.7 件/秒で、p95 も 1,248.5 ms から 771.4 ms に短くなりました。ただし、CPU をほかの作業と取り合った測定なので、本番の環境での値は検証環境で測り直します。</p>
          <p>デメリットは、メモリーが約 170 MB 増え（RSS の合計の中央値で 103 MB から 277 MB）、MySQL への接続の上限が 1 コンテナあたり 3 本から 10 本に増えることです。クラスタモードではワーカーを fork します。マスターが fork の前に開いた DB の接続は、Active Record が fork を検知してワーカーの側でプールを捨てて作り直すので、開き直す設定は要りません<Ref n={18} />（<ChapterLink n={23} section="preload" />）。この事例で使う redis 5.4.1（redis-client 0.31.0）も、接続を使う前にプロセス ID を比べ、fork の後なら接続を作り直します<Ref n={19} />。次のように、子プロセスでは MySQL も Redis も親とは別の接続を使いました。</p>
          <Code lang="ruby" title="fork の前に開いた接続を子プロセスで使う（Rails 8.1.4.1、redis 5.4.1）" code={forkCode} />
          <Code lang="text" title="実行結果" code={forkOut} />
          <p>開き直しが要るのは、fork を検知しないライブラリでマスターが開いた接続やソケットだけです。そのような接続は Puma の <code>before_worker_boot</code> で開き直します。また、<code>preload_app!</code> を使うと、ワーカーを 1 つずつ入れ替える phased restart は使えません。</p>
          <h3>7. トレードオフ</h3>
          <p>この事例ではメモリーと DB の接続を払って、同じ CPU で完了できる件数を増やしました（5 巡の中央値で 22.0 件/秒から 42.7 件/秒）。スレッドを増やすとメモリーの増加は小さく済みますが、Ruby の処理が多い要求では効果がなくなります。ワーカーを増やすと CPU を使えますが、メモリーと接続が増え、CPU をほかと取り合う環境では結果が安定しません。</p>
          <p>Ruby の処理が 1 件の時間の大部分を占める API なら、スレッドもワーカーも上限に早く達します。その場合は案 4 のように Ruby の処理そのものを減らすか、CPU を増やします。設定を変えて改善できるのは、CPU が空いているか、待つ時間が多い場合に限られます。</p>
          <Ref n={1} />
        </>
      ),
    },
    {
      id: "pool",
      title: "接続プールの上限を決める",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>前の事例で RAILS_MAX_THREADS を 5 にした後、セールの開始直後に一部の要求が <code>ActiveRecord::ConnectionTimeoutError</code> で失敗しました。チームの中では「接続プールの上限をすべて 20 にすれば足りる」という案が出ています。同じ MySQL には Sidekiq と管理画面の集計も接続しています。</p>
          <h3>2. 原因や背景</h3>
          <p>database.yml の production に、以前の設定で書いた <code>max_connections: 3</code> が残っていました。1 プロセスの 5 本のスレッドが 3 本の接続を取り合い、接続を借りられないスレッドは <code>checkout_timeout</code>（既定 5 秒）まで待った後で例外になります<Ref n={2} />。Rails 8.1 の rails new が作る database.yml は <code>max_connections</code> を RAILS_MAX_THREADS から決めますが<Ref n={10} />、値を直接書いたことでスレッド数と合わなくなっていました。</p>
          <p>上限を 20 にする案には二つの問題があります。接続プールはプロセスごとにあるので、上限を 20 にするとプロセスの数だけ合計が増えます（<ChapterLink n={113} section="capacity" />）。また、DB の処理能力が上限に達しているときに同時に送る SQL を増やしても、DB が 1 秒に終えられる件数は増えません。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：<code>max_connections</code> を 1 プロセスのスレッド数と同じにする（Rails の生成する設定と同じ）。</li>
            <li>案 2：スレッド数より大きくする。<code>load_async</code> のように 1 つの要求が複数の接続を使う場合に必要になる。</li>
            <li>案 3：スレッド数より小さくし、DB に同時に送る SQL の数を抑える。接続の待ちが起きることを受け入れる。</li>
            <li>案 4：上限は変えずに、接続を長く借りている処理（長いトランザクション、トランザクション中の外部 API の呼び出し）を短くする。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>1 プロセスの中では DB を同時に使うスレッドの数だけ接続が必要です。Puma のスレッドがすべて DB を使うなら、上限はスレッド数と同じにします。<code>ActiveRecord::Base.connection_pool.stat</code> の <code>waiting</code> が 0 より大きい時間が続くなら、そのプロセスでは接続が足りていません<Ref n={2} />。</p>
          <p>全体では、すべてのプロセスの上限の合計を MySQL の <code>max_connections</code>（既定 151）と比べます<Ref n={3} />。デプロイ中に一時的に増えるコンテナ、Sidekiq、管理用のコンソールとマイグレーションの分も足し、運用のための余裕を残します。</p>
          <p>DB に余裕があるかは、MySQL の CPU、実行中の SQL の数、ロックの待ちで判断します。DB の CPU が上限に近いときは、上限を増やすより、時間のかかる SQL を直すほうが先です。案 4 はどの場合でも併せて確かめます。</p>
          <Figure n={figure(3)} title="接続プールの上限を決める判断の流れ" caption="この事例の流れです。図は判断の順序を単純化したもので、変更のたびにプールの待ちと DB の負荷を測り直します。">
            <DecisionFigure
              id={figure(3)}
              label="接続プールの上限を決める判断の流れ。先にプールの busy と waiting、MySQL の負荷を同じ時間帯で見る。max_connections がプロセスのスレッド数より小さければスレッド数に合わせる。DB の CPU やロックの待ちに余裕がなければ上限は増やさず SQL と保持時間を直す。全プロセスの合計が MySQL の上限に近ければプロセス数かスレッド数を減らす。どれでもなければ上限を一段ずつ上げて待ちと DB を測る"
              start={['プールの busy・waiting と', 'MySQL の負荷を同じ時間帯で見る']}
              steps={[
                { q: ['max_connections が', 'プロセスのスレッド数より小さいか'], yes: ['スレッド数に合わせる'] },
                { q: ['DB の CPU やロックの待ちに', '余裕がないか'], yes: ['上限は増やさず、', 'SQL と接続を借りる時間を直す'] },
                { q: ['全プロセスの合計が', 'MySQL の上限に近いか'], yes: ['プロセス数かスレッド数を減らす'] },
              ]}
              last={['上限を一段ずつ上げて、', 'プールの待ちと DB を測る']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>Puma を使わずに、1 つの Ruby プロセスの 10 本のスレッドから同時に 100 ms の SQL を実行し、プールの上限による違いを測りました。続けて、MySQL の CPU を使う SQL を同時に実行する本数を変え、DB 側が上限に達したときの動きを確かめました。</p>
          <Code lang="ruby" title="プールの上限と DB の同時実行数を変えて測る" code={poolCode} />
          <Code lang="text" title="実行結果" code={poolOut} />
          <p>上限が 2 のとき、10 本のスレッドは 2 本ずつ順番に SQL を実行し、全体で 535 ms かかりました。接続を待ったスレッドは最大 8 本で、最も長く待ったスレッドは 415 ms 待っています。上限を 5 にすると 216 ms、10 にすると 112 ms で、待ちはなくなりました。<code>checkout_timeout</code> を 0.15 秒にすると、10 本のうち 6 本が <code>ConnectionTimeoutError</code> になりました。課題の例外は、この状態が 5 秒続いたときに起きたものです。</p>
          <Figure n={figure(4)} title="接続プールの上限と SQL の待ち" caption="上の実行結果の 1 つ目の測定をもとにした模式図です。">
            <PoolWaveFigure />
          </Figure>
          <p>次の図ではスレッドの本数、<code>max_connections</code>、<code>checkout_timeout</code> を変えて、同じ実験の待ち方を確かめられます。スレッドの本数が上限を超えた分だけ接続を待つ列ができ、上限 2 では 100 ms ごとに 2 本ずつ SQL を実行します。<code>checkout_timeout</code> を 150 ms まで下げると、3 回目以降に接続を受け取るはずの 6 本が <code>ConnectionTimeoutError</code> になり、上の実行結果の 6 件と同じになります。</p>
          <PoolModelFigure />
          <p>DB の CPU を使う SQL では同時に実行する本数を 1 本から 16 本に増やしても、1 秒あたりの完了数は 1.7 回から 2.0 回にしか増えませんでした。1 回の平均時間は 600 ms から 7,692 ms に延びています<Ref n={17} />。このマシンでは 2 本の時点で完了数が増えなくなりました。ほかの作業と CPU を共有していたことが影響した可能性がありますが、原因は切り分けていません。DB が処理できる量を超えると、接続を増やしても待つ場所がアプリケーションのプールから DB の中に移るだけで、1 件ごとの時間は長くなります。</p>
          <Figure n={figure(6)} title="DB の CPU を使う SQL の同時実行数" caption="上の実行結果の BENCHMARK の測定をもとにした図。BENCHMARK は式を指定回数だけ評価する MySQL の関数です。">
            <DbSaturationFigure />
          </Figure>
          <p>この事例では database.yml を次のように戻し、スレッド数と同じ上限にしました。<code>checkout_timeout</code> は 2 秒にして、接続が足りない状態をロードバランサーのタイムアウトより先にアプリケーションのログに出すようにしています。</p>
          <Code lang="yaml" title="スレッド数から上限を決める" code={dbYaml} />
          <p>全体の接続数は Web のコンテナ 2 台 × 2 ワーカー × 5 本で 20 本、デプロイ中に 1 台増える分で 10 本、Sidekiq 2 プロセス × 5 本（concurrency の既定値 5 に合わせた上限）で 10 本、コンソールやマイグレーションの分として 10 本を見込み、合計 50 本です<Ref n={14} />。MySQL の上限 151 本に対して余裕があります。</p>
          <h3>6. メリット・デメリット</h3>
          <p>メリットは、スレッドが接続を待たずに SQL を実行でき、ConnectionTimeoutError がなくなることです。上限をスレッド数に合わせたので、Puma の設定を変えたときにプールの上限も一緒に変わります。</p>
          <p>デメリットは MySQL に同時に届く SQL が増えることです。時間のかかる SQL が集中すると、DB の CPU やロックの待ちが増え、すべての要求が遅くなります。プールの上限は DB を守るための制限としては働かなくなります。</p>
          <h3>7. トレードオフ</h3>
          <p>プールの上限を大きくすると、アプリケーション側の待ちは減りますが、DB 側の負荷が増えます。小さくすると、DB の負荷は抑えられますが、アプリケーション側で接続の待ちと ConnectionTimeoutError が増えます。どちらの待ちを受け入れるかは、DB にどれだけ余裕があるかで決めます。</p>
          <p>この事例の DB には余裕があったので、上限をスレッド数に合わせました。DB の CPU が上限に近い状態なら、上限をスレッド数より小さくして同時に送る SQL を抑え、時間のかかる SQL を直すほうを先にします。上限の値だけで解決しようとせず、接続を借りている時間を短くする案 4 も確かめます。</p>
          <Ref n={2} />
        </>
      ),
    },
    {
      id: "cache",
      title: "キャッシュする部分とキーと期限を決める",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>商品詳細ページの表示に時間がかかっています。ページには商品説明、レビューの件数と平均点、価格、全商品の売れ筋ランキングがあります。チームからは「ページ全体を商品 ID をキーにして 10 分キャッシュする」という案が出ています。ただし、価格は会員と一般の利用者で異なり、商品説明を編集したらすぐに新しい内容を表示する必要があります。</p>
          <h3>2. 原因や背景</h3>
          <p>部分ごとに時間を測ると、商品説明の HTML の生成は 1 回 0.61〜1.53 ms、レビューの集計は 20.64 ms でした。レビューの集計は 100,000 行の reviews テーブルから、索引のない product_id で該当する行を探して数えています。売れ筋ランキングは全注文を集計する SQL で、この事例では 1 回に約 200 ms かかると仮定します（測定では sleep で置き換えました）。</p>
          <p>ページ全体を商品 ID だけのキーで保存すると、最初に表示した利用者の価格が保存されます。会員が先に表示すると、一般の利用者にも会員価格が表示されます（実装例で再現しました）。また、期限で更新する値は、人気のページで期限が切れた直後に多くの要求が同時に作り直します。ランキングの集計が同時に何本も実行されると、DB の負荷が一時的に上がります。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：キャッシュせずに、遅い処理そのものを直す（reviews.product_id の索引など）。</li>
            <li>案 2：全員に同じ部分をフラグメントキャッシュにし、キーにレコードのバージョンとロケールを入れる。価格はキャッシュの外に置く。</li>
            <li>案 3：ランキングのような値だけを <code>Rails.cache.fetch</code> で期限付きで保存する（データのキャッシュ）。</li>
            <li>案 4：ログインしていない利用者のページに HTTP キャッシュ（Cache-Control、ETag）を使う（<ChapterLink n={22} section="http-cache" />）。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>最初に、キャッシュしなくても直せるかを確かめます。案 1 で十分に速くなれば、古い値を返す危険も、キャッシュの保存先の運用も増えません。</p>
          <p>キャッシュする場合は、同じキーで保存した値を受け取る全員にとって、その値が正しいかを確かめます。値を作るときに使った入力（レコード、ロケール、利用者の区分など）はすべてキーに入れるか、利用者ごとに変わる部分はキャッシュの外に出します。</p>
          <p>次に、どれだけ古い値を許せるかを決めます。編集をすぐに反映する必要がある部分は、期限ではなく、レコードの更新時刻から作るバージョンをキーに入れます。更新するとキーが変わるので、古い値を返しません<Ref n={4} />。ランキングのように数分の遅れを許せる値は、期限（<code>expires_in</code>）で更新します。</p>
          <p>最後に、キャッシュから読む費用と、値を作り直す費用を比べます。Redis から読むにも通信と値の復元の時間がかかるので、作り直す費用が小さい部分をキャッシュしても速くなりません。キャッシュが空になったとき（Redis の再起動、キーの期限切れ）に、DB が作り直しの負荷に耐えられるかも確かめます。</p>
          <Figure n={figure(7)} title="キャッシュの対象とキーを決める判断の流れ" caption="この事例の流れです。図は判断の順序を単純化したもので、ページの部分ごとにこの流れをたどります。">
            <DecisionFigure
              id={figure(7)}
              label="キャッシュの対象とキーを決める判断の流れ。先に時間のかかる部分をプロファイルで特定する。SQL や処理を直せば十分に速くなるならキャッシュせずに直す。利用者ごとに値が変わる部分ならキャッシュの外に置くか利用者の区分をキーに入れる。更新をすぐに反映する必要があればレコードのバージョンをキーに入れる。どれでもなければ expires_in で期限を決め race_condition_ttl を付ける"
              start={['時間のかかる部分を', 'プロファイルで特定する']}
              steps={[
                { q: ['SQL や処理を直せば', '十分に速くなるか'], yes: ['キャッシュせずに直す'] },
                { q: ['利用者ごとに値が変わる部分か'], yes: ['キャッシュの外に置く', '（または区分をキーに入れる）'] },
                { q: ['更新をすぐに反映する', '必要があるか'], yes: ['レコードのバージョンをキーに入れる'] },
              ]}
              last={['expires_in で期限を決め、', 'race_condition_ttl を付ける']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>Redis 8 に名前空間 <code>ag115</code> を付けた RedisCacheStore を作り、商品説明だけの部分、レビューの集計を含む部分、価格の部分、ランキングに見立てた値を保存して、時間と結果を確かめました。この測定では Rails のビューを使わず、ERB で HTML を作っています。最後に、レビューの集計に索引を加えた場合も測りました。</p>
          <Code lang="ruby" title="キャッシュの効果と失敗例を確かめる" code={cacheCode} />
          <Code lang="text" title="実行結果" code={cacheOut} />
          <p>商品説明だけの部分ではキャッシュから読んだ時間（0.73 ms、1.28 ms）と作り直した時間（0.61 ms、1.53 ms）にほとんど差がありませんでした。Redis への往復と値の復元に、HTML を作るのと同じ程度の時間がかかっています。レビューの集計を含む部分はキャッシュで 20.64 ms が 2.24 ms になりました。ところが、(product_id, rating) の索引を加えると、キャッシュを使わずに 0.96 ms になりました。索引だけで集計できる（Covering index lookup）ので、表の本体を読みません。この集計はキャッシュより索引のほうが速く、古い値を返すこともありません。</p>
          <p>キーは <code>ag115:description/products/1-20261127123135323230/ja</code> でした。<code>cache_key_with_version</code> が返すモデルの名前・ID・更新時刻のバージョンの後にロケールが付いています。説明を更新するとバージョンが変わり、次の読み込みは新しいキーでミスになって、新しい内容で作り直しました。</p>
          <Figure n={figure(8)} title="キャッシュのキーに入れる値" caption="上の実行結果のキーと失敗例をもとにした図です。">
            <CacheKeyFigure />
          </Figure>
          <p>期限が切れた直後に 20 スレッドが同時に読むと、<code>race_condition_ttl</code> なしでは 20 スレッドすべてがブロックを実行しました。10 秒を指定すると、最初に期限切れに気づいたスレッドが古い値の期限を延ばしてから作り直し、ほかのスレッドは古い値を受け取りました<Ref n={11} />。作り直した回数は 2 回の実行で 2 回と 1 回です。期限を延ばす書き込みの前に複数のスレッドが期限切れを読むと、それぞれが作り直すので、作り直しを必ず 1 回に限る仕組みではありません。RedisCacheStore は <code>race_condition_ttl</code> を指定すると、Redis のキーの有効期間を <code>expires_in</code> より 5 分長くして、期限切れの値を残しておきます<Ref n={12} />。</p>
          <Figure n={figure(9)} title="期限切れの直後に同時に読んだときの作り直し" caption="上の実行結果をもとにした模式図。20 スレッドのうち 10 本を描いています。">
            <StampedeFigure />
          </Figure>
          <p>次の段階送りで、<code>race_condition_ttl</code> を付けたときに Redis の値とスレッドがどの順で変わるかを確かめられます。</p>
          <Figure n={figure(10)} title="期限切れの直後に作り直すスレッドが決まる順序（段階送り）" caption="概念モデルです。ActiveSupport::Cache の fetch の処理（handle_expired_entry）を、上の 20 スレッドの実験に当てはめて段階に分けました。実際にはスレッドが読む時刻は少しずつずれ、Redis への往復にも時間がかかるので、作り直しの回数は実行ごとに変わります（実測では 1 回と 2 回）。">
            <Stepper steps={stampedeSteps} />
          </Figure>
          <p>この結果から、部分ごとに次のように決めました。商品説明はキャッシュしません。レビューの集計は索引を加えて直し、キャッシュしません。価格はどのキャッシュにも入れません。キャッシュするのは、全員に同じで 10 分の遅れを許せる売れ筋ランキングだけで、<code>expires_in</code> と <code>race_condition_ttl</code> を付けます。</p>
          <Code lang="ruby" title="ランキングだけをキャッシュする" code={controllerCacheCode} />
          <Code lang="erb" title="ビュー" code={viewCode} />
          <p>今後、商品説明の HTML の生成が重くなった場合は、ビューの <code>cache</code> ヘルパーで説明の部分を囲みます。<code>cache</code> ヘルパーは渡したレコードのバージョンに加えてテンプレートのダイジェストをキーに入れるので、テンプレートを変えたときも古い HTML を返しません<Ref n={13} />。</p>
          <h3>6. メリット・デメリット</h3>
          <p>メリットはキャッシュを 1 か所に絞ったことで、古い値を返す部分がランキングだけになり、どのデータがいつの時点のものかを説明しやすいことです。レビューの集計は索引で 20.64 ms から 0.96 ms になり、投稿したレビューがすぐに反映されます。ランキングの集計は 10 分に 1 回（期限切れの直後も測定では 1〜2 回）に減ります。価格はキャッシュの外にあるので、会員価格が別の利用者に表示されることはありません。</p>
          <p>デメリットは、ランキングが最大 10 分古いことと、Redis を運用する必要があることです。索引は reviews への書き込みのたびに更新されます。また Redis のキャッシュが空になると、最初の要求でランキングを作り直すので、その要求だけ約 200 ms 遅くなります。古いキーを消すために、Redis の <code>maxmemory</code> と、上限に達したときに消すキーの決め方（eviction の方針）を設定します。</p>
          <h3>7. トレードオフ</h3>
          <p>キャッシュはデータの新しさと作り直しの費用を交換します。この事例では遅い原因を直せる部分（レビューの集計）は直し、作り直しが安い部分（商品説明）はキャッシュせず、直せずに作り直しが高い部分（ランキング）だけで古さを受け入れました。</p>
          <p>ページ全体をキャッシュする案は、一つのキーで最も多くの処理を省けますが、価格のように利用者で変わる値を含むと誤った表示になり、編集の反映も期限まで遅れます。部分ごとに分けると、省ける処理は減りますが、どの部分がどれだけ古いかを部分ごとに決められます。</p>
          <Ref n={4} />
        </>
      ),
    },
    {
      id: "async",
      title: "領収書の作成を同期処理と分ける",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>注文確定の API の応答に約 530 ms かかっています。内訳は、注文の保存が十数 ms、領収書の PDF の生成が約 300 ms、領収書のメールの送信が約 200 ms です。応答が遅いので確定のボタンを二度押す利用者がいて、メールの送信が失敗すると、注文は保存されているのに API がエラーを返していました。</p>
          <h3>2. 原因や背景</h3>
          <p>注文の保存、PDF の生成、メールの送信を、同じ要求の中で順番に実行しています。利用者が待つ時間には、領収書を作る時間がすべて含まれます。外部のメールサービスが遅いと、その分だけ応答も遅れ、Puma のスレッドも占有されます。メールの失敗をエラーとして返すと、利用者は注文が失敗したと考えて再び注文します。</p>
          <p>Rails 8.1 の Active Job では <code>enqueue_after_transaction_commit</code> の既定値が false です<Ref n={15} />。トランザクションの中で <code>perform_later</code> を呼ぶと、コミットを待たずにすぐキューに入ります。Sidekiq がコミットの前にジョブを実行すると、ジョブからはまだ注文が見えません（<ChapterLink n={18} section="transaction" />）。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：同期のまま、PDF の生成とメールの送信を速くする。</li>
            <li>案 2：注文の保存だけを同期で行い、コミットの後に領収書のジョブを投入する（<code>ActiveRecord.after_all_transactions_commit</code> か <code>enqueue_after_transaction_commit = true</code>）。</li>
            <li>案 3：トランザクショナルアウトボックスで、注文と同じトランザクションに送信予定を保存し、中継の処理がジョブを投入する（<ChapterLink n={53} section="idea" />）。</li>
            <li>案 4：領収書を事前に作らず、利用者がダウンロードしたときに作る。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>最初に、応答の時点で利用者に何を約束するかを決めます。この API で約束するのは「注文を受け付けたこと」で、「領収書を送ったこと」ではありません。領収書が数秒後に届けば利用者の目的は満たせるので、領収書の作成は応答の外に出せます。</p>
          <p>次に、ジョブが投入されなかった場合の影響を見ます。コミットの後に投入する方式では、コミットと投入の間にプロセスが止まると、ジョブが失われます。領収書は注文のデータから後で作り直せるので、送られていない注文を定期的に探して投入し直せば十分です。取りこぼしが業務を止める連携（配送の依頼など）なら、案 3 を選びます（採用の判断は <ChapterLink n={116} section="pattern" />）。</p>
          <p>ジョブは同じ注文で 2 回以上実行されることがあります。Sidekiq は失敗したジョブを再試行し、ジョブを処理している途中でプロセスが止まると同じジョブを再び実行します。メールを二重に送らないように、ジョブを冪等（同じジョブを何回実行しても、1回実行したときと同じ結果になること）にします（<ChapterLink n={18} section="idempotency" />）。</p>
          <Figure n={figure(11)} title="同期処理と非同期処理を分ける判断の流れ" caption="この事例の流れです。図は判断の順序を単純化したもので、処理ごとにこの流れをたどります。">
            <DecisionFigure
              id={figure(11)}
              label="同期処理と非同期処理を分ける判断の流れ。先に応答の時点で利用者に約束する結果を決める。その処理の結果が応答に必要なら同期のまま速くする。取りこぼすと業務が止まるならアウトボックスで記録してから送る。後から作り直せるならコミット後にジョブを投入し冪等にする。どれでもなければ同期で行い失敗を利用者に返す"
              start={['応答の時点で利用者に', '約束する結果を決める']}
              steps={[
                { q: ['その処理の結果が', '応答に必要か'], yes: ['同期のまま速くする'] },
                { q: ['取りこぼすと業務が止まるか', '（配送の依頼など）'], yes: ['アウトボックスに記録してから送る'] },
                { q: ['後から作り直せるか', '（領収書・メールなど）'], yes: ['コミット後にジョブを投入し、', 'ジョブを冪等にする'] },
              ]}
              last={['同期で行い、', '失敗を利用者に返す']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>Sidekiq 8.1.7 のプロセスを別のコンテナで起動し（concurrency 5、Redis の DB 11 を使用）、注文の保存とジョブの投入を測りました。PDF の生成とメールの送信は sleep で置き換えています。ジョブは注文の <code>receipt_sent_at</code> を条件付き UPDATE で埋めてから送るので、同じ注文で 2 回実行されてもメールは 1 回です。</p>
          <Code lang="ruby" title="領収書のジョブ" code={jobCode} />
          <Code lang="ruby" title="投入の方法を変えて測る" code={asyncCode} />
          <Code lang="text" title="実行結果" code={asyncOut} />
          <p>同期の A は応答まで 533 ms、コミットの後に投入する B は 12.8 ms でした。B の領収書は応答から約 0.5 秒後の 553 ms に送られています。利用者が待つ時間は 1/40 になり、領収書が届くまでの時間は同期とほぼ同じです。</p>
          <p>C では、トランザクションの中で投入したジョブが 3 ms 後に実行され、まだコミットされていない注文を読めずに失敗しました。Sidekiq の再試行で 24 秒後に送信されています。Sidekiq は 1 回目の再試行を 15 秒以上後に予定し、予定の時刻を定期的に確かめて実行するので、この例では 24 秒後になりました<Ref n={16} />。<code>enqueue_after_transaction_commit = true</code> にした D では、コミットの後に投入されたので、1 回目の実行で送信できました。</p>
          <Figure n={figure(12)} title="同期・コミット後の投入・トランザクション中の投入" caption="上の実行結果をもとにした模式図。C の再試行までの 24 秒は省略しています。">
            <AsyncTimelineFigure />
          </Figure>
          <p>C と D の違いは、ジョブがキューに入る時点と、注文の行がほかの接続から見えるようになる時点の順序です。次の段階送りで、二つの方式を同じ時点で並べて確かめられます。</p>
          <Figure n={figure(13)} title="ジョブを入れる時点と注文が見える時点（段階送り）" caption="概念モデルです。上の C と D の実行結果を段階に分け、時刻は実測の値を使いました。Sidekiq が再試行の予定を確かめる間隔や、ジョブを取り出すまでの細かい時間は省いています。">
            <Stepper steps={jobSteps} />
          </Figure>
          <p>E では同じ注文のジョブを 2 回投入しました。先に <code>receipt_sent_at</code> を埋めたジョブだけがメールを送り、もう一方は「送信済みなので何もしない」で終わりました。ただし、この形では、送る権利を取った後で PDF の生成やメールが失敗すると、その注文の領収書は送られないまま <code>receipt_sent_at</code> が埋まります。失敗したときに <code>receipt_sent_at</code> を空に戻すか、送信の記録を別の表に持つかを、メールサービスの仕様に合わせて決めます。</p>
          <p>Rails アプリケーションでは <code>config/application.rb</code> などで <code>config.active_job.enqueue_after_transaction_commit = true</code> を設定するか、ジョブごとに <code>self.enqueue_after_transaction_commit = true</code> を書きます。この実験は Rails を起動しないスクリプトなので、Rails の railtie が行う <code>ActiveJob::EnqueueAfterTransactionCommit</code> の組み込みを自分で書いています<Ref n={15} />。</p>
          <h3>6. メリット・デメリット</h3>
          <p>メリットは、応答が 533 ms から十数 ms になり、メールサービスの遅れや失敗が注文の確定に影響しなくなることです。Puma のスレッドが PDF の生成で占有されないので、同じ設定で多くの要求を処理できます。</p>
          <p>デメリットは、領収書が届くまでの状態を扱う必要が出ることです。注文の確認画面には「領収書は数分以内にメールで届きます」と表示し、届いていない注文を問い合わせで調べられるようにします。Sidekiq のプロセス、キューの長さ、失敗したジョブを監視する運用も増えます。Sidekiq も DB の接続を使うので、接続プールの事例で見積もった接続数に含めます。</p>
          <h3>7. トレードオフ</h3>
          <p>この事例では、利用者が待つ時間を短くすることと、領収書が遅れて届くことを交換しました。また、コミットの後に投入する方式を選び、プロセスがコミットと投入の間で止まったときの取りこぼしを、定期的な確認で補う方針にしました。取りこぼしをなくすアウトボックスと比べると、送信予定の表と中継の処理を持たずに済みます。</p>
          <p>すべての処理をジョブにすればよいわけではありません。在庫の引き当てのように、結果を応答で返す必要がある処理は同期のままにします。ジョブに移すと、処理の順序、失敗の扱い、完了するまでの状態の表示を設計する必要があり、コードも運用も増えます。</p>
          <Ref n={5} /><Ref n={6} />
        </>
      ),
    },
    {
      id: "judgment",
      title: "四つの設定を合わせて見積もる",
      body: (
        <>
          <p>四つの事例の設定は互いに影響します。Puma のスレッドを増やすと DB の接続が増え、ジョブに処理を移すと Sidekiq の接続が増えます。キャッシュは DB の負荷を減らしますが、Redis への接続と Redis のメモリーを使います。この章の事例で決めた値を並べると次のようになります。</p>
          <Figure n={figure(14)} title="四つの事例で決めた値と、増えた費用" caption="この章の測定と見積もりをまとめた表。台数や concurrency は例です。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>事例</th><th>決めた値</th><th>根拠にした測定</th><th>増えた費用</th></tr>
                </thead>
                <tbody>
                  <tr><td>Puma</td><td>WEB_CONCURRENCY=2、RAILS_MAX_THREADS=5 から検証</td><td>1 プロセスでスレッド 3→5 は 5 巡とも完了件数が増加。2 ワーカーは中央値で 1 プロセス × 5 の 1.3〜1.6 倍だが、巡ごとに変動</td><td>メモリー約 170 MB、接続 3→10 本（1 コンテナ）</td></tr>
                  <tr><td>接続プール</td><td>max_connections をスレッド数に合わせる、checkout_timeout 2 秒</td><td>上限 2 で 415 ms 待ち、DB が上限に達すると本数を増やしても完了数は横ばい</td><td>DB に同時に届く SQL が増える</td></tr>
                  <tr><td>キャッシュ</td><td>ランキングだけを期限 10 分と race_condition_ttl で保存。レビューの集計は索引で直す。価格は外</td><td>集計はキャッシュで 2.24 ms、索引で 0.96 ms。説明の部分はキャッシュの効果なし</td><td>ランキングが最大 10 分古い、Redis の運用、索引の更新</td></tr>
                  <tr><td>ジョブ</td><td>コミット後に投入、ジョブを冪等にする</td><td>応答 533 ms → 12.8 ms。中で投入すると 3 ms 後に失敗</td><td>Sidekiq の運用と接続、未送信の確認</td></tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>MySQL への接続の合計は、Web が平常時 20 本とデプロイ中の 10 本、Sidekiq が 10 本、運用の分が 10 本で 50 本です。ここに Puma のスレッドを 5 から 10 に増やす変更を加えると、Web だけで 40 本、デプロイ中は 60 本になります。設定を一つ変えたら、この合計を計算し直します。</p>
          <p>四つの事例に共通する手順は次のとおりです。</p>
          <ol>
            <li>1 件の時間を、待つ時間と CPU を使う時間に分けて測る。どの設定が効くかは、この割合で決まります。</li>
            <li>同じ構成を複数回測り、中央値と、毎回同じ傾向が出たかを見る。負荷をかける側と測る対象が使えた CPU も記録する。共有の環境では巡ごとに構成の順位が入れ替わりました。</li>
            <li>どこで待っているかを確かめてから上限を増やす。Puma の待ち行列、接続プール、DB の中のどこで待っているかによって、増やす値が変わります。DB が上限に達しているなら、手前の上限を増やしても待つ場所が移るだけです。</li>
            <li>増やしたものの合計を、メモリー、DB の接続、Redis のメモリーの上限と比べる。</li>
          </ol>
          <p>変えないという判断もあります。測定で遅い区間が見つからない設定を、ほかのサービスの推奨値に合わせて変える必要はありません。設定を変えると、メモリーや接続の見積もりを直す作業も増えます。これは本書の意見で、変更するかどうかは、測った値と運用の手間を比べて決めます。</p>
        </>
      ),
    },
    {
      id: "related",
      title: "関連する章",
      body: (
        <>
          <p>この章の事例で使った仕組みは次の章で詳しく扱っています。</p>
          <ul>
            <li>Puma のプロセス・スレッド・メモリー：<ChapterLink n={23} section="cluster" />、<ChapterLink n={23} section="sizing" />、<ChapterLink n={23} section="memory" /></li>
            <li>待ち行列と処理能力：<ChapterLink n={111} section="queueing" />、<ChapterLink n={113} section="budgets" /></li>
            <li>接続プール：<ChapterLink n={15} section="pool" />、<ChapterLink n={113} section="verify" /></li>
            <li>キャッシュ：<ChapterLink n={22} section="fragment" />、<ChapterLink n={22} section="rails-cache" />、<ChapterLink n={22} section="http-cache" /></li>
            <li>ジョブ：<ChapterLink n={18} section="transaction" />、<ChapterLink n={18} section="retry" />、<ChapterLink n={18} section="idempotency" /></li>
          </ul>
          <p>クエリ・索引・トランザクションを判断する事例は <ChapterLink n={114} />、アウトボックスなどの設計パターンを採用するかを判断する事例は <ChapterLink n={116} /> で扱います。</p>
        </>
      ),
    },
  ],
  sources: [
    { title: "Puma README", publisher: "puma/puma（GitHub）", url: "https://github.com/puma/puma/blob/v8.0.2/README.md", accessed: "2026-11-27", version: "Puma 8.0.2", note: "クラスタモード、ワーカーとスレッドプール" },
    { title: "activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb", publisher: "rails/rails（GitHub）", url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb#L100-L118`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "checkout_timeout（既定 5 秒）と max_connections の説明、stat の項目（875 行）" },
    { title: "Server System Variables（max_connections）", publisher: "MySQL Reference Manual", url: "https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html#sysvar_max_connections", accessed: "2026-11-27", version: "MySQL 8.4", note: "MySQL の接続の上限（既定 151）" },
    { title: "Caching with Rails", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/caching_with_rails.html", accessed: "2026-11-27", version: "Rails 8.1", note: "フラグメントキャッシュ、キーとバージョン、touch による更新" },
    { title: "Active Job Basics", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_job_basics.html", accessed: "2026-11-27", version: "Rails 8.1", note: "ジョブの投入とトランザクション" },
    { title: "activerecord/lib/active_record.rb（after_all_transactions_commit）", publisher: "rails/rails（GitHub）", url: `${GH}/activerecord/lib/active_record.rb#L573-L591`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "開いているトランザクションがすべてコミットした後にブロックを実行すること" },
    { title: "Tuning Performance for Deployment", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/tuning_performance_for_deployment.html", accessed: "2026-11-27", version: "Rails 8.1", note: "I/O の待ちが 50% を超えない場合に 3 スレッドを超える効果が小さいこと、プロセスによる並列性" },
    { title: "Puma: docs/deployment.md", publisher: "puma/puma（GitHub）", url: "https://github.com/puma/puma/blob/v8.0.2/docs/deployment.md", accessed: "2026-11-27", version: "Puma 8.0.2", note: "ワーカー数をコア数に合わせる出発点、スレッド数の決め方" },
    { title: "railties/lib/rails/generators/rails/app/templates/config/puma.rb.tt", publisher: "rails/rails（GitHub）", url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/puma.rb.tt`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "RAILS_MAX_THREADS（既定 3）と、ワーカー数を WEB_CONCURRENCY に任せること" },
    { title: "railties/lib/rails/generators/rails/app/templates/config/databases/mysql.yml.tt", publisher: "rails/rails（GitHub）", url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/databases/mysql.yml.tt#L15`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "max_connections を RAILS_MAX_THREADS から決めること" },
    { title: "activesupport/lib/active_support/cache.rb（race_condition_ttl）", publisher: "rails/rails（GitHub）", url: `${GH}/activesupport/lib/active_support/cache.rb#L380-L436`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "期限切れの値の期限を延ばして作り直す動き。handle_expired_entry は 1095〜1109 行" },
    { title: "activesupport/lib/active_support/cache/redis_cache_store.rb", publisher: "rails/rails（GitHub）", url: `${GH}/activesupport/lib/active_support/cache/redis_cache_store.rb#L380-L391`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "race_condition_ttl があるとき Redis の有効期間を 5 分延ばすこと" },
    { title: "ActionView::Helpers::CacheHelper", publisher: "Ruby on Rails API", url: "https://api.rubyonrails.org/v8.1/classes/ActionView/Helpers/CacheHelper.html", accessed: "2026-11-27", version: "Rails 8.1", note: "cache ヘルパーのキーとテンプレートのダイジェスト" },
    { title: "lib/sidekiq/config.rb", publisher: "sidekiq/sidekiq（GitHub）", url: `${SK}/lib/sidekiq/config.rb#L15`, accessed: "2026-11-27", version: "Sidekiq 8.1.7", note: "concurrency の既定値 5" },
    { title: "activejob/lib/active_job/enqueuing.rb・railtie.rb", publisher: "rails/rails（GitHub）", url: `${GH}/activejob/lib/active_job/enqueuing.rb#L15-L23`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "enqueue_after_transaction_commit の既定値 false。railtie.rb の 29〜35 行で EnqueueAfterTransactionCommit を組み込むこと" },
    { title: "lib/sidekiq/job_retry.rb（delay_for）", publisher: "sidekiq/sidekiq（GitHub）", url: `${SK}/lib/sidekiq/job_retry.rb#L219-L247`, accessed: "2026-11-27", version: "Sidekiq 8.1.7", note: "再試行までの秒数 (count**4) + 15" },
    { title: "Information Functions（BENCHMARK）", publisher: "MySQL Reference Manual", url: "https://dev.mysql.com/doc/refman/8.4/en/information-functions.html#function_benchmark", accessed: "2026-11-27", version: "MySQL 8.4", note: "式を指定した回数だけ評価する関数" },
    { title: "activerecord/lib/active_record/connection_adapters/pool_config.rb", publisher: "rails/rails（GitHub）", url: `${GH}/activerecord/lib/active_record/connection_adapters/pool_config.rb#L83`, accessed: "2026-11-28", version: "Rails 8.1.4.1", note: "ActiveSupport::ForkTracker の after_fork で、fork した子プロセスの接続プールを捨てる（discard_pools!）" },
    { title: "lib/redis_client.rb（ensure_connected）・lib/redis_client/pid_cache.rb", publisher: "redis-rb/redis-client（GitHub）", url: "https://github.com/redis-rb/redis-client/blob/v0.31.0/lib/redis_client.rb#L769-L770", accessed: "2026-11-28", version: "redis-client 0.31.0", note: "接続を開いたときのプロセス ID と今のプロセス ID が違えば、接続を閉じて開き直す（inherit_socket が false のとき）" },
  ],
}

export default chapter
