import { useState } from 'react'
import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const figure = (n: number) => `${chapterNumber(111)}-${n}`

/* ---------- 図1 1件の要求の区間と、測る位置 ---------- */
function MeasurePointsFigure() {
  const x = (ms: number) => 150 + ms * 5
  const segs: { s: number; e: number; label: string; kind: 'net' | 'wait' | 'work'; fs?: number }[] = [
    { s: 0, e: 6, label: '通信', kind: 'net', fs: 10 },
    { s: 6, e: 26, label: 'Puma 待ち', kind: 'wait' },
    { s: 26, e: 40, label: 'Ruby', kind: 'work' },
    { s: 40, e: 50, label: '接続待ち', kind: 'wait' },
    { s: 50, e: 84, label: 'SQL（MySQL）', kind: 'work' },
    { s: 84, e: 104, label: 'Ruby・描画', kind: 'work' },
    { s: 104, e: 110, label: '送信', kind: 'net', fs: 10 },
    { s: 110, e: 116, label: '通信', kind: 'net', fs: 10 },
  ]
  const ranges: { s: number; e: number; y: number; label: string; acc?: boolean }[] = [
    { s: 0, e: 116, y: 130, label: 'ブラウザーで測る時間（利用者が待つ時間）', acc: true },
    { s: 3, e: 113, y: 170, label: 'Nginx の $request_time（Puma の待ちを含む）' },
    { s: 26, e: 104, y: 210, label: 'Rails のログの Completed の時間（Puma の待ちを含まない）' },
    { s: 50, e: 84, y: 250, label: 'sql.active_record のイベント' },
  ]
  return (
    <Svg id={figure(1)} w={780} h={270} label="1件の要求を左から右へ時間の順に描いた図。通信、Puma でスレッドの空きを待つ時間、Ruby の処理、接続プールの接続待ち、SQL、Ruby と描画、送信、通信の順に進む。その下に、ブラウザー、Nginx の request_time、Rails の Completed の時間、SQL のイベントがそれぞれどの範囲を測るかを線で示す。Rails の Completed の時間は Puma の待ちを含まない。">
      <T x={20} y={57} bold fs={12}>1件の要求</T>
      {segs.map((g) => (
        <Box key={g.s} x={x(g.s)} y={40} w={(g.e - g.s) * 5} h={34} rx={3} lines={g.label} fs={g.fs ?? 11}
          fill={g.kind === 'work' ? 'box' : g.kind === 'wait' ? 'box5' : 'bg'} dashed={g.kind === 'wait'} />
      ))}
      {[0, 20, 40, 60, 80, 100, 120].map((ms) => (
        <g key={ms}>
          <line x1={x(ms)} y1={76} x2={x(ms)} y2={82} stroke="var(--fig-line)" />
          <T x={x(ms)} y={92} fs={10} anchor="middle" tone="muted">{`${ms} ms`}</T>
        </g>
      ))}
      {ranges.map((r) => (
        <g key={r.y}>
          <T x={x(r.s)} y={r.y - 12} fs={11} tone={r.acc ? 'acc' : undefined}>{r.label}</T>
          <Arrow x1={x(r.s)} y1={r.y} x2={x(r.e)} y2={r.y} both accent={r.acc} />
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図2 応答時間のヒストグラム ---------- */
// latency.rb の実測（2,000件）を 5 ms ごとに数えた値。最後は 150 ms 以上
const HIST = [732, 358, 230, 146, 114, 94, 57, 41, 37, 22, 22, 18, 14, 20, 10, 9, 6, 8, 1, 10, 2, 5, 3, 4, 3, 4, 3, 2, 0, 1, 24]
const MARKS = { p50: 8.4, mean: 18.6, p95: 68.0, p99: 159.5 }

function HistogramFigure() {
  const x0 = 70
  const base = 250
  const h = (count: number) => (count * 205) / 750
  const xAt = (ms: number) => x0 + ms * 4
  const mark = (ms: number, y: number, label: string) => (
    <g>
      <line x1={xAt(ms)} y1={36} x2={xAt(ms)} y2={base} stroke="var(--fig-accent)" strokeDasharray="4 3" />
      <T x={xAt(ms) + 4} y={y} fs={11} tone="acc">{label}</T>
    </g>
  )
  return (
    <Svg id={figure(2)} w={780} h={300} label="2,000件の応答時間を 5 ms ごとに数えたヒストグラム。0〜5 ms が 732件で最も多く、右へ行くほど件数が減るが、150 ms 以上も 24件ある。中央値は 8.4 ms、平均は 18.6 ms、p95 は 68.0 ms、p99 は 159.5 ms。">
      {HIST.map((count, i) => (
        <rect key={i} x={x0 + i * 20 + 1} y={base - h(count)} width={18} height={h(count)}
          fill={i === HIST.length - 1 ? 'var(--fig-box5)' : 'var(--fig-box)'} stroke="var(--fig-line)" strokeWidth={0.5} />
      ))}
      <line x1={x0} y1={base} x2={x0 + HIST.length * 20} y2={base} stroke="var(--fig-line)" />
      <line x1={x0} y1={base} x2={x0} y2={36} stroke="var(--fig-line)" />
      {[0, 200, 400, 600].map((c) => (
        <g key={c}>
          <line x1={x0 - 4} y1={base - h(c)} x2={x0} y2={base - h(c)} stroke="var(--fig-line)" />
          <T x={x0 - 8} y={base - h(c)} fs={10} anchor="end" tone="muted">{c}</T>
        </g>
      ))}
      <T x={20} y={24} fs={11} tone="muted">件数</T>
      {[0, 25, 50, 75, 100, 125].map((ms) => (
        <T key={ms} x={xAt(ms)} y={264} fs={10} anchor="middle" tone="muted">{`${ms}`}</T>
      ))}
      <T x={x0 + 30 * 20 + 10} y={264} fs={10} anchor="middle" tone="muted">150以上</T>
      <T x={720} y={284} fs={11} anchor="end" tone="muted">応答時間（ms）</T>
      {mark(MARKS.p50, 24, `中央値 ${MARKS.p50} ms`)}
      {mark(MARKS.mean, 64, `平均 ${MARKS.mean} ms`)}
      {mark(MARKS.p95, 140, `p95 ${MARKS.p95.toFixed(1)} ms`)}
      <T x={x0 + 30 * 20 + 10} y={196} fs={11} anchor="end" tone="acc">{`p99 ${MARKS.p99} ms はこの帯の中`}</T>
      <Arrow x1={x0 + 30 * 20 + 10} y1={204} x2={x0 + 30 * 20 + 10} y2={236} accent />
    </Svg>
  )
}

/* ---------- 図3 利用率と平均応答時間 ---------- */
// queue_sim.rb の出力（平均応答時間 ms）
const SIM = [
  { rho: 0.5, mm1: 100, md1: 75, mm3: 58 },
  { rho: 0.7, mm1: 167, md1: 108, mm3: 78 },
  { rho: 0.8, mm1: 252, md1: 149, mm3: 105 },
  { rho: 0.9, mm1: 508, md1: 274, mm3: 190 },
  { rho: 0.95, mm1: 1059, md1: 524, mm3: 373 },
  { rho: 0.98, mm1: 2372, md1: 1537, mm3: 812 },
]

function UtilizationFigure() {
  const px = (rho: number) => 80 + ((rho - 0.4) / 0.6) * 620
  const py = (ms: number) => 280 - (Math.min(ms, 2500) / 2500) * 240
  const path = (key: 'mm1' | 'md1' | 'mm3') => SIM.map((p, i) => `${i ? 'L' : 'M'}${px(p.rho)},${py(p[key])}`).join(' ')
  const theory = Array.from({ length: 59 }, (_, i) => 0.4 + i * 0.01).map((rho, i) => `${i ? 'L' : 'M'}${px(rho)},${py(50 / (1 - rho))}`).join(' ')
  const series = [
    { key: 'mm1' as const, label: '1枠・処理時間がばらつく', stroke: 'var(--fig-accent)', dash: undefined, width: 2.5 },
    { key: 'md1' as const, label: '1枠・処理時間が一定', stroke: 'var(--fig-line)', dash: undefined, width: 1.5 },
    { key: 'mm3' as const, label: '3枠・処理時間がばらつく', stroke: 'var(--fig-line)', dash: '6 4', width: 1.5 },
  ]
  return (
    <Svg id={figure(3)} w={780} h={320} label="横軸が利用率 0.4 から 1.0、縦軸が平均応答時間 0 から 2,500 ms のグラフ。処理時間がばらつく1枠のモデルは、利用率 0.8 で 252 ms、0.9 で 508 ms、0.95 で 1,059 ms、0.98 で 2,372 ms と急に伸びる。処理時間が一定のモデルと3枠のモデルは同じ利用率で短いが、1 に近づくと同じように伸びる。">
      <line x1={80} y1={280} x2={700} y2={280} stroke="var(--fig-line)" />
      <line x1={80} y1={280} x2={80} y2={34} stroke="var(--fig-line)" />
      {[0, 500, 1000, 1500, 2000, 2500].map((ms) => (
        <g key={ms}>
          <line x1={76} y1={py(ms)} x2={700} y2={py(ms)} stroke="var(--fig-line)" strokeOpacity={ms ? 0.25 : 1} />
          <T x={70} y={py(ms)} fs={10} anchor="end" tone="muted">{ms.toLocaleString('en-US')}</T>
        </g>
      ))}
      {[0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((rho) => (
        <T key={rho} x={px(rho)} y={294} fs={10} anchor="middle" tone="muted">{rho.toFixed(1)}</T>
      ))}
      <T x={700} y={312} fs={11} anchor="end" tone="muted">利用率（到着数 × 平均処理時間 ÷ 処理枠の数）</T>
      <T x={20} y={22} fs={11} tone="muted">平均応答時間（ms）</T>
      <path d={theory} fill="none" stroke="var(--fig-line)" strokeDasharray="2 3" />
      {series.map((s) => (
        <g key={s.key}>
          <path d={path(s.key)} fill="none" stroke={s.stroke} strokeWidth={s.width} strokeDasharray={s.dash} />
          {SIM.map((p) => <circle key={p.rho} cx={px(p.rho)} cy={py(p[s.key])} r={3} fill={s.stroke} />)}
        </g>
      ))}
      {SIM.slice(2).map((p) => (
        p.rho === 0.98
          ? <T key={p.rho} x={px(p.rho) + 8} y={py(p.mm1)} fs={10} tone="acc">{`${p.mm1} ms`}</T>
          : <T key={p.rho} x={px(p.rho) - 8} y={py(p.mm1) - 10} fs={10} anchor="end" tone="acc">{`${p.mm1} ms`}</T>
      ))}
      {series.map((s, i) => (
        <g key={s.key}>
          <line x1={110} y1={56 + i * 22} x2={150} y2={56 + i * 22} stroke={s.stroke} strokeWidth={s.width} strokeDasharray={s.dash} />
          <T x={158} y={56 + i * 22} fs={11}>{s.label}</T>
        </g>
      ))}
      <line x1={110} y1={122} x2={150} y2={122} stroke="var(--fig-line)" strokeDasharray="2 3" />
      <T x={158} y={122} fs={11} tone="muted">理論値 50 ms ÷（1 − 利用率）</T>
    </Svg>
  )
}

/* ---------- 図4 到着数と処理時間を変える（操作できる図） ---------- */
function QueueModel() {
  const [rate, setRate] = useState(16)
  const [service, setService] = useState(50)
  const rho = (rate * service) / 1000
  const stable = rho < 1
  const w = stable ? service / (1 - rho) : Infinity
  const l = (rate * w) / 1000
  const lq = (rate * (w - service)) / 1000
  const p95 = w * Math.log(20)
  const fmt = (v: number, unit: string) => (Number.isFinite(v) ? `${v < 10 ? v.toFixed(2) : Math.round(v).toLocaleString('en-US')} ${unit}` : '増え続ける')
  const px = (r: number) => 70 + r * 300
  const py = (m: number) => 200 - (Math.min(m, 20) / 20) * 160
  const curve = Array.from({ length: 96 }, (_, i) => i / 100).map((r, i) => `${i ? 'L' : 'M'}${px(r)},${py(1 / (1 - r))}`).join(' ')
  const waiting = stable ? Math.round(lq) : 30
  const shown = Math.min(waiting, 14)
  return (
    <Figure n={figure(4)} title="到着数と処理時間を変えて待ち行列を見る" caption="概念モデルです。処理枠は1つで、到着の間隔と処理時間は指数分布に従ってばらつき、待ち行列に上限が無いと仮定した M/M/1 の公式で計算しています。実際の Puma は複数のスレッドを持ち、到着は時間帯で偏り、タイムアウトで打ち切られる要求もあります。">
      <div className="sim-controls">
        <label>
          <span>1秒あたりの到着数 <output>{rate}</output> 件</span>
          <input type="range" min={1} max={40} step={1} value={rate} onChange={(e) => setRate(e.target.valueAsNumber)} />
        </label>
        <label>
          <span>1件の平均処理時間 <output>{service}</output> ms</span>
          <input type="range" min={10} max={200} step={5} value={service} onChange={(e) => setService(e.target.valueAsNumber)} />
        </label>
      </div>
      <Svg id={figure(4)} w={780} h={230} label={`利用率 ${rho.toFixed(2)} のとき、待ち行列に平均 ${stable ? lq.toFixed(1) : '無限に増える'} 件が並ぶ。右は利用率と、処理時間に対する平均応答時間の倍率の曲線。`}>
        <T x={20} y={24} bold fs={12}>待ち行列（平均の件数を四角で表示）</T>
        <Box x={330} y={70} w={110} h={60} lines={['処理中', `利用率 ${Math.min(rho, 9.99).toFixed(2)}`]} fill={stable ? 'box' : 'box5'} accent={!stable} fs={12} subTone={stable ? 'muted' : 'danger'} />
        <Arrow x1={300} y1={100} x2={328} y2={100} />
        {Array.from({ length: shown }, (_, i) => (
          <rect key={i} x={282 - (i % 7) * 38} y={i < 7 ? 82 : 112} width={30} height={22} rx={3} fill="var(--fig-box4)" stroke="var(--fig-line)" />
        ))}
        <T x={20} y={160} fs={11} tone={stable ? 'muted' : 'danger'}>{stable ? `並んでいる平均 ${lq.toFixed(1)} 件${waiting > shown ? '（14件まで描画）' : ''}` : '到着が処理を上回り、列は時間とともに伸び続ける'}</T>
        <T x={20} y={182} fs={11} tone="muted">{`系の中の平均 L = λ × W = ${stable ? l.toFixed(2) : '―'} 件`}</T>
        <line x1={470} y1={200} x2={770} y2={200} stroke="var(--fig-line)" />
        <line x1={470} y1={200} x2={470} y2={36} stroke="var(--fig-line)" />
        <g transform="translate(400 0)">
          <path d={curve} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
          {stable && <circle cx={px(rho)} cy={py(1 / (1 - rho))} r={5} fill="var(--fig-accent)" />}
          {[0, 0.5, 1].map((r) => <T key={r} x={px(r)} y={214} fs={10} anchor="middle" tone="muted">{r.toFixed(1)}</T>)}
          {[1, 10, 20].map((m) => <T key={m} x={64} y={py(m)} fs={10} anchor="end" tone="muted">{`${m}倍`}</T>)}
        </g>
        <T x={480} y={26} fs={11} tone="muted">応答時間 ÷ 処理時間</T>
        <T x={770} y={226} fs={10} anchor="end" tone="muted">利用率</T>
      </Svg>
      <div className="table-wrap" aria-live="polite"><table>
        <thead><tr><th scope="col">利用率 ρ</th><th scope="col">平均応答時間 W</th><th scope="col">応答時間の p95</th><th scope="col">待っている平均件数</th></tr></thead>
        <tbody><tr>
          <td>{rho.toFixed(2)}</td><td>{fmt(w, 'ms')}</td><td>{fmt(p95, 'ms')}</td><td>{stable ? lq.toFixed(2) : '増え続ける'}</td>
        </tr></tbody>
      </table></div>
    </Figure>
  )
}

/* ---------- 図5 RED と USE ---------- */
function UseRedFigure() {
  const cols = [
    { x: 160, label: '利用率（U）' },
    { x: 360, label: '飽和（S）' },
    { x: 560, label: 'エラー（E）' },
  ]
  const rows: [string[], string[], string[], string[]][] = [
    [['CPU'], ['使用率（%）'], ['実行を待つスレッド数', '（load average など）'], ['ハードウェアの異常', '（まれ）']],
    [['メモリー'], ['使用量・RSS'], ['スワップ・GC の時間'], ['OOM による強制終了']],
    [['Puma の', 'スレッド'], ['(busy_threads − backlog)', '÷ max_threads'], ['backlog', '（スレッドを待つ要求）'], ['上流の 502・504', '（Nginx・LB のログ）']],
    [['接続プール', '（Active Record）'], ['busy ÷ size'], ['waiting', '（接続を待つスレッド）'], ['ConnectionTimeoutError']],
    [['MySQL'], ['Threads_connected', '÷ max_connections'], ['Threads_running・', 'ロック待ち'], ['Too many connections', '・デッドロック']],
  ]
  return (
    <Svg id={figure(5)} w={780} h={420} label="上段は RED。要求の種類ごとに、1秒あたりの件数、失敗の割合、応答時間の分布を測る。下段は USE。CPU、メモリー、Puma のスレッド、接続プール、MySQL の5つの資源について、利用率、飽和、エラーに当たる指標を表にしている。">
      <Box x={20} y={14} w={740} h={56} lines={['RED：要求の種類ごとに、利用者から見た結果を測る', 'Rate（1秒あたりの件数）・Errors（失敗の割合）・Duration（p50・p95・p99）']} fs={12} bold fill="box4" subTone="muted" />
      <Arrow x1={390} y1={70} x2={390} y2={104} accent />
      <T x={400} y={88} fs={11} tone="acc">悪化した時間帯と要求の種類が分かったら、資源ごとに USE で調べる</T>
      <Box x={20} y={110} w={140} h={30} lines="資源" fill="bg" bold fs={12} rx={0} />
      {cols.map((c) => <Box key={c.x} x={c.x} y={110} w={200} h={30} lines={c.label} fill="bg" bold fs={12} rx={0} />)}
      {rows.map((r, i) => (
        <g key={i}>
          <Box x={20} y={140 + i * 54} w={140} h={54} lines={r[0]} fill="box" bold fs={12} rx={0} />
          {cols.map((c, j) => (
            <Box key={c.x} x={c.x} y={140 + i * 54} w={200} h={54} lines={r[j + 1]} fill="bg" fs={11} rx={0} mono={/^[A-Za-z(]/.test(r[j + 1][0])} />
          ))}
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図6 経過時間に占める CPU 時間 ---------- */
// cpu_io.rb の実測（ms）
const CPU_IO = [
  { label: 'JSON を作る', wall: 20.5, cpu: 10.1 },
  { label: 'MySQL の応答を待つ', wall: 318.9, cpu: 1.3 },
  { label: 'コメント502件を読む', wall: 160.8, cpu: 33.2 },
]

function CpuShareFigure() {
  const x0 = 170
  const full = 320
  return (
    <Svg id={figure(6)} w={780} h={200} label={`経過時間を100%とした横棒で、CPU を使った時間の割合を示す。${CPU_IO.map((r) => `${r.label}は経過 ${r.wall} ms のうち CPU ${r.cpu} ms`).join('、')}。`}>
      {CPU_IO.map((r, i) => {
        const y = 24 + i * 52
        const cw = (r.cpu / r.wall) * full
        return (
          <g key={r.label}>
            <T x={20} y={y + 15} fs={12}>{r.label}</T>
            <rect x={x0} y={y} width={full} height={30} rx={3} fill="var(--fig-box4)" stroke="var(--fig-line)" strokeDasharray="4 3" />
            <rect x={x0} y={y} width={Math.max(cw, 2)} height={30} rx={3} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={x0 + full + 12} y={y + 15} fs={11}>{`経過 ${r.wall} ms・CPU ${r.cpu} ms（${Math.round((r.cpu / r.wall) * 100)}%）`}</T>
          </g>
        )
      })}
      <rect x={x0} y={180} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={x0 + 20} y={186} fs={11}>CPU を使った時間</T>
      <rect x={x0 + 150} y={180} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" strokeDasharray="3 2" />
      <T x={x0 + 170} y={186} fs={11}>それ以外（I/O の応答や CPU の空きを待つ時間）</T>
    </Svg>
  )
}

/* ---------- 図7 アムダールの法則 ---------- */
function AmdahlFigure() {
  const ns = [1, 2, 4, 8, 16, 32, 64]
  const px = (i: number) => 80 + i * 100
  const py = (s: number) => 280 - Math.min(s, 21) * 11.5
  const speed = (serial: number, n: number) => 1 / (serial + (1 - serial) / n)
  const line = (f: (n: number) => number) => ns.map((n, i) => `${i ? 'L' : 'M'}${px(i)},${py(f(n))}`).join(' ')
  return (
    <Svg id={figure(7)} w={780} h={320} label="横軸が台数 1 から 64、縦軸が1台に対して何倍速く終わるか。並列にできない部分が5%なら64台で15.4倍、上限は20倍。20%なら64台で4.7倍、上限は5倍。理想の直線は台数と同じ倍率。">
      <line x1={80} y1={280} x2={700} y2={280} stroke="var(--fig-line)" />
      <line x1={80} y1={280} x2={80} y2={30} stroke="var(--fig-line)" />
      {[0, 5, 10, 15, 20].map((s) => (
        <g key={s}>
          <line x1={76} y1={py(s)} x2={700} y2={py(s)} stroke="var(--fig-line)" strokeOpacity={s ? 0.25 : 1} />
          <T x={70} y={py(s)} fs={10} anchor="end" tone="muted">{`${s}倍`}</T>
        </g>
      ))}
      {ns.map((n, i) => <T key={n} x={px(i)} y={294} fs={10} anchor="middle" tone="muted">{`${n}台`}</T>)}
      <path d={line((n) => n)} fill="none" stroke="var(--fig-line)" strokeDasharray="2 3" />
      <path d={line((n) => speed(0.05, n))} fill="none" stroke="var(--fig-accent)" strokeWidth={2.5} />
      <path d={line((n) => speed(0.2, n))} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
      {ns.map((n, i) => <circle key={n} cx={px(i)} cy={py(speed(0.05, n))} r={3} fill="var(--fig-accent)" />)}
      {ns.map((n, i) => <circle key={n} cx={px(i)} cy={py(speed(0.2, n))} r={3} fill="var(--fig-line)" />)}
      <T x={688} y={py(speed(0.05, 64))} fs={11} tone="acc">15.4倍</T>
      <T x={688} y={py(speed(0.2, 64)) + 9} fs={11}>4.7倍</T>
      <line x1={100} y1={58} x2={130} y2={58} stroke="var(--fig-accent)" strokeWidth={2.5} />
      <T x={138} y={58} fs={11} tone="acc">並列にできない部分 5%（上限 20倍）</T>
      <line x1={100} y1={78} x2={130} y2={78} stroke="var(--fig-line)" strokeWidth={1.5} />
      <T x={138} y={78} fs={11}>並列にできない部分 20%（上限 5倍）</T>
      <line x1={100} y1={98} x2={130} y2={98} stroke="var(--fig-line)" strokeDasharray="2 3" />
      <T x={138} y={98} fs={11} tone="muted">台数に比例する理想の直線</T>
      <T x={700} y={312} fs={11} anchor="end" tone="muted">台数（横軸は2倍ずつ）</T>
    </Svg>
  )
}

/* ---------- 図8 スケールアップとスケールアウト ---------- */
function ScalingFigure() {
  return (
    <Svg id={figure(8)} w={780} h={340} label="左はスケールアップ。1台のサーバーを CPU とメモリーの大きい台に替え、ワーカーを増やす。右はスケールアウト。ロードバランサーの後ろに同じサーバーを3台並べる。どちらの構成も同じ MySQL を共有する。下に、それぞれが成り立つ条件を書いている。">
      <T x={20} y={22} bold fs={13}>スケールアップ</T>
      <rect x={40} y={36} width={320} height={116} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={54} y={54} fs={12}>サーバー1台（4コア → 16コア）</T>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Box key={i} x={54 + (i % 4) * 74} y={68 + Math.floor(i / 4) * 40} w={66} h={32} lines="ワーカー" fs={11} fill={i < 2 ? 'box' : 'box5'} dashed={i >= 2} />
      ))}
      <T x={420} y={22} bold fs={13}>スケールアウト</T>
      <Box x={500} y={34} w={180} h={32} lines="ロードバランサー" fs={12} fill="box4" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Arrow x1={590} y1={66} x2={470 + i * 120} y2={98} />
          <Box x={420 + i * 120} y={100} w={100} h={50} lines={[`サーバー ${'ABC'[i]}`, '2ワーカー']} fs={12} fill={i ? 'box5' : 'box'} dashed={i > 0} subTone="muted" />
        </g>
      ))}
      <Box x={240} y={190} w={300} h={40} lines="MySQL（どちらの構成でも共有）" fs={12} fill="box4" bold />
      <Arrow x1={200} y1={152} x2={300} y2={188} />
      {[0, 1, 2].map((i) => <Arrow key={i} x1={470 + i * 120} y1={150} x2={480 - (2 - i) * 20} y2={188} />)}
      {[
        '1台の大きさに上限がある',
        '台を替えるときに止める時間が要る',
        '1台が止まると処理がすべて止まる',
      ].map((t, i) => <T key={t} x={40} y={262 + i * 22} fs={11}>{`・${t}`}</T>)}
      {[
        'セッションやファイルを各台の外に置く',
        'ヘルスチェックで外す仕組みが要る',
        '台数に比例して DB の接続数が増える',
      ].map((t, i) => <T key={t} x={420} y={262 + i * 22} fs={11}>{`・${t}`}</T>)}
      <T x={40} y={326} fs={11} tone="muted">破線は増やした部分です。</T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 111,
  part: 10,
  title: "性能の基礎とボトルネック",
  summary: "レイテンシ、スループット、同時処理数の関係から、Rails のどこに処理が滞っているかを考えます。",
  goals: [
    "レイテンシとスループットを単位と測る位置から区別する",
    "パーセンタイルで応答時間の分布を読み、平均だけで判断しない",
    "利用率と待ち時間の関係、リトルの法則、アムダールの法則で改善の効果を見積もる",
    "USE と RED の観点で、CPU・メモリー・I/O・接続の観測からボトルネックを絞る",
  ],
  prerequisites: [26],
  sections: [
    {
      id: "latency",
      title: "1件にかかる時間と完了する件数",
      body: (
        <>
          <p>記事一覧の画面が「遅い」と言われたとき、最初に決めるのは何を測るかです。利用者が画面を開いてから表示されるまでの時間を短くしたいのか、サーバーが1秒間に処理し終える要求の数を増やしたいのかで、測る値も改善の方法も変わります。この章では前者をレイテンシ、後者をスループットと呼んで区別し、待ち時間が生じる仕組みと、時間のかかる場所を絞る手順を、Docker で実際に動かした結果とともに説明します。</p>
          <p><Term en="latency">レイテンシ</Term>は要求が始まってから応答を受けるまでにかかる時間です。単位はミリ秒（ms）や秒です。「一覧画面を開くまで」でも、ブラウザーが最初の応答を受け取るまでと、画像や追加の要求を終えて利用者に表示するまででは、値が違います。測定範囲は開始点と終了点で示します。</p>
          <p><Term en="throughput">スループット</Term>は一定の時間に完了した仕事の量です。1秒に処理できるリクエスト数（requests per second、rps と略します）や、1分に処理できるジョブ数で表せます。到着数と完了数を同じ期間で測り、到着数が完了数を上回り続けるなら、待っている要求が増えるか、受け付けられなかった要求があります。エラーの応答を含めた件数と、処理に成功した件数を区別します。</p>
          <p>二つの値は別々に変わります。1件を 100 ms で処理するスレッドが1本なら、レイテンシは 100 ms、スループットは最大で毎秒10件です。同じ処理をするスレッドを4本にすると、互いに待たせ合わない限り、レイテンシは 100 ms のまま、スループットは最大で毎秒40件になります。逆に、10件ずつまとめて処理する方式に変えると、1件あたりの手間が減って完了件数は増えても、まとめる間に待つ分だけ各要求のレイテンシが長くなる場合があります。改善の前に、どちらの値を目標にするかを決めます。</p>
          <Figure n={figure(1)} title="1件の要求の区間と、それぞれの時間を測る位置" caption="模式図です。区間の長さは説明のための値で、実測値ではありません。破線の区間は処理の順番や接続の空きを待っている時間です。">
            <MeasurePointsFigure />
          </Figure>
          <p>図 {figure(1)} のように、測る位置によって含まれる区間が変わります。Rails のログの Completed の行の時間は、コントローラーのアクションを処理し始めてから終えるまでで、Puma のスレッドが空くまで待った時間は含みません。Nginx の <code>$request_time</code> はクライアントから最初のバイトを読んでから応答を送り終えるまでの時間なので、Puma で待った時間を含みます。<Ref n={3} /> 利用者が「遅い」と感じているのに Rails のログの時間が短いときは、Rails より前で待っている可能性があります。同じ要求の時間を Nginx と Rails のログで突き合わせる方法は <ChapterLink n={22} section="response-time" /> と <ChapterLink n={26} section="timing" /> で、実際のログを使って説明しています。</p>
          <p>図 {figure(1)} の「Puma 待ち」と「接続待ち」は、この章で何度も扱う2つの待ちです。Puma は要求を受け取って Rails に渡すアプリケーションサーバーです。Rails を読み込んだプロセスを複数動かす構成（クラスタモード）では、その子プロセスを<Term en="worker">ワーカー</Term>と呼びます。各プロセスは決まった本数のスレッドを持ち、1本のスレッドが1件の要求を処理します。すべてのスレッドが処理中なら、届いた要求はスレッドが空くまで Puma の中で待ちます。Puma が状態として返す <code>backlog</code> は、この待っている要求の数です。<Term en="connection pool">接続プール</Term>は、Active Record がプロセスごとに持つ MySQL への接続の集まりです。SQL を実行するスレッドはプールから接続を借り、使い終えると返します。上限の本数をすべて貸し出している間、次のスレッドは接続が返るまで待ちます。ワーカーとスレッドは <ChapterLink n={23} section="cluster" />、<code>backlog</code> は <ChapterLink n={104} section="backlog" />、接続プールは <ChapterLink n={15} section="pool" /> で詳しく説明します。</p>
          <p>CPU 使用率や接続数は、どの資源に余裕があるかを判断する材料です。利用者から見た応答の指標と対にして、要求が増えた期間の値を読みます。アイドル時間が長い日の平均 CPU 使用率では、昼の数分間だけ利用者の要求が詰まったことを見落とす場合があります。</p>
          <Ref n={1} />
        </>
      ),
    },
    {
      id: "percentile",
      title: "平均とパーセンタイルで分布を読む",
      body: (
        <>
          <p>レイテンシは要求ごとにばらつきます。たとえば記事ごとにコメントの数が違えば、コメントの多い記事の応答は遅くなります。多数の要求の値を1つの数にまとめるとき、平均だけでは、少数の遅い応答が利用者に与える影響が分かりません。そこで、値を小さい順に並べたときの位置で表す<Term en="percentile">パーセンタイル</Term>を使います。p95（95 パーセンタイル）は「要求の 95% がこの値以下で終わった」という値で、p50 は真ん中の値（中央値）です。</p>
          <h3>実際の応答時間から p50・p95・p99 を計算する</h3>
          <p>分布を実際に作って計算します。MySQL 8.4.13 にデータベース <code>ag_111</code> を作り、記事 1,000 件分のコメント 29,339 行を入れました。コメント数は、記事の 95% が 0〜10 件、5% が 200〜800 件です。人気のある記事にだけコメントが集まる状態を単純にしたものです。記事のコメントを JSON で返す Rack アプリを Puma 8.0.2（1スレッド）で起動します。</p>
          <Code lang="ruby" title="comments.ru" code={`require "json"
require "mysql2"

DB = Mysql2::Client.new(host: "rbdemo-mysql", username: "root", password: "pass", database: "ag_111")
FIND = DB.prepare("SELECT id, body, created_at FROM comments WHERE article_id = ? ORDER BY id")

run lambda { |env|
  id = Integer(env["PATH_INFO"][%r{\\A/articles/(\\d+)/comments\\z}, 1] || 0)
  rows = FIND.execute(id).map { |r| { id: r["id"], body: r["body"], created_at: r["created_at"].iso8601 } }
  body = JSON.generate(article_id: id, comments: rows)
  [200, { "content-type" => "application/json", "x-comments" => rows.size.to_s }, [body]]
}`} />
          <p>同じコンテナでクライアントを動かします。乱数の種を固定して記事を選び、2,100 件の要求を1件ずつ送ります。前の応答を受け取ってから次を送るので、要求どうしが Puma の中で待たせ合うことはありません。最初の 100 件は接続や JIT の準備を含むため予行として捨て、残りの 2,000 件の時間とコメント数を記録します。</p>
          <Code lang="ruby" title="latency.rb" code={`require "net/http"

rng = Random.new(2026)
ids = Array.new(2_100) { rng.rand(1..1_000) }
rows = []
Net::HTTP.start("127.0.0.1", 9292) do |http|
  ids.each_with_index do |id, i|
    t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    res = http.get("/articles/#{id}/comments")
    ms = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - t0) * 1_000
    raise res.code unless res.code == "200"
    rows << [ms, res["x-comments"].to_i] if i >= 100 # 最初の100件は予行
  end
end
File.write("latencies.txt", rows.map { |ms, c| format("%.3f %d", ms, c) }.join("\\n"))`} />
          <p>記録した値からパーセンタイルを計算します。計算方法は2通り書きました。最近順位法は小さい順に並べて <code>ceil(p ÷ 100 × n)</code> 番目の値をそのまま使います。線形補間は <code>(n − 1) × p ÷ 100</code> の位置が2つの値の間に来たとき、前後の値を距離で按分します。<Ref n={4} /></p>
          <Code lang="ruby" title="percentile.rb" code={`rows = File.readlines("latencies.txt").map { |line| ms, c = line.split; [ms.to_f, c.to_i] }
latencies = rows.map(&:first)
sorted = latencies.sort
n = sorted.size

nearest = ->(p) { sorted.fetch((p / 100.0 * n).ceil - 1) }
linear = ->(p) {
  pos = (n - 1) * p / 100.0
  lo = pos.floor
  hi = [lo + 1, n - 1].min
  sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

printf "n=%d  平均=%.1f ms\\n", n, latencies.sum / n
[50, 90, 95, 99, 99.9].each do |p|
  printf "p%-4s 最近順位=%6.1f ms  線形補間=%6.1f ms\\n", p, nearest.(p), linear.(p)
end
printf "最大=%.1f ms\\n", sorted.last

big, small = rows.partition { |_, c| c >= 100 }
[["コメント100件未満", small], ["コメント100件以上", big]].each do |label, group|
  ms = group.map(&:first).sort
  printf "%s: %d件  中央値=%.1f ms  p95=%.1f ms\\n", label, ms.size, ms[ms.size / 2], ms[(ms.size * 0.95).ceil - 1]
end`} />
          <Code lang="text" title="実行結果（4コアのホストの ruby:4.0 コンテナ、CPU を2つに制限、ほかの作業で load average が 20 前後。Ruby 4.0.9・Puma 8.0.2・MySQL 8.4.13）" code={`n=2000  平均=18.6 ms
p50   最近順位=   8.4 ms  線形補間=   8.4 ms
p90   最近順位=  43.0 ms  線形補間=  43.1 ms
p95   最近順位=  68.0 ms  線形補間=  68.1 ms
p99   最近順位= 159.5 ms  線形補間= 159.5 ms
p99.9 最近順位= 306.7 ms  線形補間= 302.2 ms
最大=356.6 ms
コメント100件未満: 1886件  中央値=7.7 ms  p95=56.3 ms
コメント100件以上: 114件  中央値=42.7 ms  p95=233.6 ms`} />
          <Figure n={figure(2)} title="2,000件の応答時間の分布" caption="上の実行結果のもとになった値を 5 ms ごとに数えたヒストグラムです。右端の帯は 150 ms 以上をまとめています。">
            <HistogramFigure />
          </Figure>
          <p>平均の 18.6 ms は中央値の 8.4 ms の2倍以上です。半数の要求は 8.4 ms 以下で終わっていますが、右に長く伸びた少数の遅い要求が平均を引き上げています。p99 の 159.5 ms は、100件に1件の要求が中央値のおよそ19倍待つことを示します。1つの画面で複数の API を呼ぶ場合や、利用者が1日に何十回も操作する場合、p99 に当たる遅さに出会う利用者の割合は 1% より多くなります。</p>
          <p>コメント数で分けると、100件以上の記事への要求（114件）は中央値が 42.7 ms で、100件未満の記事への要求の中央値 7.7 ms より長くなりました。遅い要求が特定の条件に集まっているなら、その条件で分けて測ると原因を絞れます。一方、100件未満の記事でも p95 が 56.3 ms あり、コメント数だけでは遅さを説明できません。この実行はほかの作業と同じホストで行っており、CPU を待った時間も含まれます。こうした要因は区間ごとの計測（<ChapterLink n={112} />）で調べます。</p>
          <h3>パーセンタイルを扱うときの注意</h3>
          <p>2つの計算方法の差は、件数が多い範囲では小さく、端に近いほど大きくなります。この例では p99.9 の位置に入る値が2件しかなく、方法によって 4.5 ms 違いました。100件しか測っていなければ、最近順位法の p99 は遅い方から2番目の値で、たまたま1件遅い要求があるだけで大きく動きます。監視サービスの多くは、値を範囲ごとの件数（ヒストグラム）として集め、そこから近似値を計算します。比べる値は同じ方法と同じ集計期間で計算したものにそろえます。</p>
          <p>パーセンタイルは平均できません。上の結果で2つのグループの p95（56.3 ms と 233.6 ms）を単純に平均すると 145 ms ですが、全体の p95 は 68.0 ms です。サーバーごと・1分ごとの p95 をまとめて全体の値を求めたいときは、元の値かヒストグラムの件数を合算してから計算し直します。種類の違うエンドポイントを1つにまとめると、件数の少ない遅い処理が上位の値に表れないこともあります。<Ref n={1} /></p>
        </>
      ),
    },
    {
      id: "queueing",
      title: "待ち行列：利用率が上がると待ち時間が急に伸びる",
      body: (
        <>
          <p>アプリケーションのスレッドがすべて仕事をしていると、次の要求は空きを待ちます。スレッドが DB に接続しようとしても空き接続がなければ、スレッドに仕事を割り当てた後でまた待ちが生じます。さらに DB でも CPU、ディスク、ロックなどの待ちがあります。1件の合計時間からは、どの待ちが増えたか分かりません。</p>
          <p>このように、処理する場所（Puma のスレッド、接続プール、MySQL など）の前で要求が順番を待つ列を<Term en="queue">待ち行列</Term>と呼びます。待ち行列の振る舞いは1秒あたりの到着数 λ（ラムダ）、1件の平均処理時間 S、処理枠の数 c で説明できます。処理枠が忙しい時間の割合を<Term en="utilization">利用率</Term>と呼び、ρ（ロー）= λ × S ÷ c で求めます。1件を平均 50 ms で処理する枠が1つあり、毎秒16件届くなら、ρ = 16 × 0.05 = 0.8 で、時間の 80% は処理中です。</p>
          <p>到着数が処理能力を上回る場合は単純です。1件をちょうど 50 ms で処理し、同時には 1件しか処理できない場所は、待ちが途切れないとき 1秒に最大 20 件を完了します。1秒に 30 件ずつ到着し続ける場合、受付を制限しなければ差の約 10 件ずつが毎秒たまります。待ち行列の上限を増やしても、この場所で完了する速さは変わりません。</p>
          <p>分かりにくいのは、到着数が処理能力より少ない（ρ が 1 未満の）場合にも待ちが生じることです。要求は等間隔には届かず、処理時間もばらつくため、短い間に到着が重なると列ができます。どれだけ待つかを、Ruby で書いた小さなシミュレーションで確かめます。</p>
          <h3>Ruby で待ち行列を再現する</h3>
          <p>次のスクリプトは到着の間隔と処理時間を指数分布の乱数で作り、先着順に処理します。<code>servers</code> は処理枠の数、<code>fixed: true</code> は処理時間を 50 ms に固定する指定です。各条件で 20 万件を発生させ、最初の 5% を捨ててから応答時間（待ち時間と処理時間の合計）を集計します。後で使うので、ランダムに選んだ時刻に系の中（待っているか処理中）にいた件数の平均 L も数えます。</p>
          <Code lang="ruby" title="queue_sim.rb" code={`SERVICE = 0.050 # 1件の平均処理時間（秒）

def simulate(rho:, servers:, fixed: false, n: 200_000, seed: 1)
  rng = Random.new(seed)
  exp = ->(mean) { -mean * Math.log(1 - rng.rand) }
  lambda_ = rho * servers / SERVICE            # 1秒あたりの到着数
  free_at = Array.new(servers, 0.0)             # 各処理枠が空く時刻
  now = 0.0
  arrivals = []
  departures = []
  n.times do
    now += exp.(1 / lambda_)                    # 次の要求が届く時刻
    i = free_at.each_with_index.min_by(&:first).last
    start = [now, free_at[i]].max               # 枠が空くまで待つ
    finish = start + (fixed ? SERVICE : exp.(SERVICE))
    free_at[i] = finish
    arrivals << now
    departures << finish
  end
  warm = n / 20                                 # 最初の5%は捨てる
  w = arrivals.zip(departures).drop(warm).map { |a, d| d - a }.sort
  # ある時刻に系の中にいる件数を、ランダムな時刻で数えて平均する
  sorted_dep = departures.sort
  t0, t1 = arrivals[warm], arrivals.last
  samples = Array.new(20_000) { t0 + rng.rand * (t1 - t0) }
  l = samples.sum { |t| arrivals.bsearch_index { |x| x > t }.to_i - (sorted_dep.bsearch_index { |x| x > t } || n) } / samples.size.to_f
  { lambda: lambda_, mean: w.sum / w.size, p95: w[(w.size * 0.95).ceil - 1], l: l }
end

puts "利用率  到着/秒  平均応答  p95応答  理論値  L(実測)  λ×W   | 一定時間の平均 | 3枠の平均  3枠のp95"
[0.5, 0.7, 0.8, 0.9, 0.95, 0.98].each do |rho|
  m = simulate(rho: rho, servers: 1)
  d = simulate(rho: rho, servers: 1, fixed: true)
  c = simulate(rho: rho, servers: 3)
  printf "%5.2f  %6.1f  %6.0fms %6.0fms %6.0fms %6.2f %6.2f | %10.0fms | %7.0fms %7.0fms\\n",
         rho, m[:lambda], m[:mean] * 1e3, m[:p95] * 1e3, SERVICE / (1 - rho) * 1e3,
         m[:l], m[:lambda] * m[:mean], d[:mean] * 1e3, c[:mean] * 1e3, c[:p95] * 1e3
end`} />
          <Code lang="text" title="実行結果（Ruby 4.0.9。乱数の種を固定しているので、同じ値が出ます）" code={`利用率  到着/秒  平均応答  p95応答  理論値  L(実測)  λ×W   | 一定時間の平均 | 3枠の平均  3枠のp95
 0.50    10.0     100ms    299ms    100ms   1.01   1.00 |         75ms |      58ms     167ms
 0.70    14.0     167ms    496ms    167ms   2.34   2.34 |        108ms |      78ms     214ms
 0.80    16.0     252ms    750ms    250ms   4.01   4.03 |        149ms |     105ms     289ms
 0.90    18.0     508ms   1515ms    500ms   9.20   9.15 |        274ms |     190ms     533ms
 0.95    19.0    1059ms   3286ms   1000ms  20.27  20.12 |        524ms |     373ms    1116ms
 0.98    19.6    2372ms   7497ms   2500ms  46.63  46.48 |       1537ms |     812ms    2519ms`} />
          <Figure n={figure(3)} title="利用率と平均応答時間" caption="上の実行結果の平均応答時間を描いたグラフです。点線は、処理枠が1つで到着と処理時間が指数分布に従う待ち行列（M/M/1）の理論値です。">
            <UtilizationFigure />
          </Figure>
          <p>処理時間は平均 50 ms なのに、利用率 0.5 で平均応答時間は 100 ms、0.8 で 252 ms、0.9 で 508 ms になりました。到着数を 16 件から 18 件へ 12.5% 増やしただけで、応答時間は2倍になっています。0.95 ではさらに2倍の 1,059 ms です。理論値の列は M/M/1 と呼ばれるモデルの公式 W = S ÷ (1 − ρ) で計算した値で、シミュレーションの結果とほぼ一致します。<Ref n={5} /> p95 は平均のおよそ3倍で、利用率 0.9 では 1.5 秒に達しました。</p>
          <p>処理時間を一定にした列は、同じ利用率で待ち時間がおよそ半分です。ばらつきが小さいほど待ちは短くなります。処理枠を3つにした列は同じ利用率でも1枠より短く済みます。1つの枠が長い処理をしている間に、別の枠が次の要求を処理できるためです。ただし、どの列も利用率が 1 に近づくと急に伸びます。</p>
          <p>このモデルは、到着が互いに独立して不規則に起き、待ち行列に上限が無く、タイムアウトで打ち切られる要求も無いと仮定しています。実際のアクセスは時刻によって偏り、一時的に集中すると平均の利用率が同じでも待ちは長くなります。逆に、前の応答を受け取ってから次を送る利用者や負荷試験の道具は、サーバーが遅くなると送る数も減るので、待ち行列は際限なく伸びません。数値そのものではなく、「ボトルネックの資源を 90% 以上の利用率で使い続ける計画では、少しの増加で応答時間が大きく伸びる」という傾向を設計に使います。</p>
        </>
      ),
    },
    {
      id: "little",
      title: "リトルの法則 L = λW で同時に処理している数を見積もる",
      body: (
        <>
          <p>前の節の実行結果には、L（実測）と λ×W の列がほぼ同じ値で並んでいます。これは<Term en="Little's law">リトルの法則</Term>と呼ばれる関係で、「系の中にいる平均の件数 L は、1秒あたりの到着数 λ と、1件が系の中にいる平均時間 W の積に等しい」というものです。<Ref n={6} /> 長い期間で見て到着数と完了数が釣り合っていれば、到着の間隔や処理時間がどんな分布でも成り立ちます。シミュレーションでは利用率 0.8 のとき、L が 4.01 件、λ × W が 16 × 0.252 = 4.03 件でした。</p>
          <p>Rails の運用では「系」をどこに取るかを決めて使います。たとえば2ワーカー × 3スレッドの Puma には、要求を処理する枠が6つあります。1件がスレッドを使う平均時間が 120 ms なら、6つの枠をすべて使い続けても完了できるのは 6 ÷ 0.12 = 毎秒50件までです。毎秒40件届くなら、処理中のスレッドの平均は 40 × 0.12 = 4.8 本で、利用率は 0.8 です。前の節の結果から、この状態ではすでに待ちが目立ち始めると予想できます。</p>
          <p>接続プールにも同じ計算を当てはめられます。1件が DB の接続を借りている平均時間が 30 ms で、毎秒40件の要求がすべて DB を使うなら、使われている接続の平均は 40 × 0.03 = 1.2 本です。プールの上限が各ワーカー3本で、平均の使用数がこれより十分小さいのに接続待ちが起きるなら、平均ではなく一時的な集中や、接続を長く借りる一部の処理を調べます。</p>
          <p>逆向きの確認にも使えます。監視で Puma の処理中のスレッドが平均5本、完了数が毎秒50件なら、1件あたりの平均時間は 5 ÷ 50 = 0.1 秒のはずです。ログから求めた平均の応答時間と大きく違えば、測っている範囲がそろっていないか、集計に含めていない要求があると考えられます。L・λ・W は同じ期間・同じ範囲で測った平均値として扱います。p95 などの分布の値はこの式からは求められません。</p>
          <p>次の図で、到着数と処理時間を変えると待ち行列と応答時間がどう変わるかを確かめられます。処理時間 50 ms のまま到着数を 16 から 18、19 と上げると、利用率は 0.8 から 0.95 へ少し上がるだけですが、待っている件数と応答時間は大きく増えます。処理時間を 40 ms に縮めると、同じ到着数でも利用率が下がり、待ち時間がそれ以上に減ることも分かります。</p>
          <QueueModel />
        </>
      ),
    },
    {
      id: "use-red",
      title: "ボトルネックの見つけ方：USE と RED",
      body: (
        <>
          <p>処理が進む経路のうち、全体の完了件数を制限している資源を<Term en="bottleneck">ボトルネック</Term>と呼びます。ボトルネック以外の資源を増やしても完了件数は増えません。どの資源がボトルネックかを推測で決めないために、観測する指標を決めておく方法が2つ知られています。</p>
          <p>RED は要求の種類（エンドポイントやジョブの種類）ごとに Rate（1秒あたりの件数）、Errors（失敗の件数や割合）、Duration（かかった時間の分布）を測る方法です。提案した Tom Wilkie は、RED の値が利用者から見たサービスの状態を表すとしています。<Ref n={7} /> USE は CPU やメモリー、接続などの資源ごとに Utilization（利用率：資源が忙しかった時間の割合）、Saturation（飽和：資源が処理しきれずに待っている仕事の量）、Errors（エラー）を確かめる方法で、Brendan Gregg が提案しました。<Ref n={2} /> RED で「いつ・どの要求が」悪くなったかを見つけ、USE で「どの資源が」原因かを絞る順に使います。</p>
          <h3>Puma の stats を USE で読む</h3>
          <p>Puma はスレッドの状態をコントロールサーバーの <code>/stats</code> や <code>Puma.stats</code> で返します。<Ref n={8} /> 200 ms 待ってから応答する Rack アプリを2スレッドの Puma で起動し、6件の要求を同時に送って、処理の途中で stats を読みました。</p>
          <Code lang="ruby" title="slow.ru" code={`run lambda { |_env|
  sleep 0.2 # DB の応答を待つ代わりに 200 ms 待つ
  [200, { "content-type" => "text/plain" }, ["ok\\n"]]
}`} />
          <Code lang="bash" title="起動（コントロールサーバーを 9293 番で開く）" code={`puma -b tcp://127.0.0.1:9292 -t 2:2 --control-url tcp://127.0.0.1:9293 --control-token demo slow.ru`} />
          <Code lang="ruby" title="use_puma.rb" code={`require "net/http"
require "json"

KEYS = %w[max_threads running busy_threads pool_capacity backlog]
stats = -> { JSON.parse(Net::HTTP.get(URI("http://127.0.0.1:9293/stats?token=demo"))).slice(*KEYS) }
puts "待機中:     #{stats.call}"

clients = Array.new(6) { Thread.new { Net::HTTP.get_response(URI("http://127.0.0.1:9292/")).code } }
sleep 0.1
puts "6件を送信後: #{stats.call}"
sleep 0.2
puts "200ms 後:    #{stats.call}"
puts "応答: #{clients.map(&:value).tally}"
puts "終了後:     #{stats.call}"`} />
          <Code lang="text" title="実行結果（Puma 8.0.2、Ruby 4.0.9。2回実行して同じ値）" code={`待機中:     {"max_threads" => 2, "running" => 2, "busy_threads" => 0, "pool_capacity" => 2, "backlog" => 0}
6件を送信後: {"max_threads" => 2, "running" => 2, "busy_threads" => 6, "pool_capacity" => 0, "backlog" => 4}
200ms 後:    {"max_threads" => 2, "running" => 2, "busy_threads" => 4, "pool_capacity" => 0, "backlog" => 2}
応答: {"200" => 6}
終了後:     {"max_threads" => 2, "running" => 2, "busy_threads" => 0, "pool_capacity" => 2, "backlog" => 0}`} />
          <p>6件を送った直後、<code>backlog</code> は 4 でした。2本のスレッドが2件を処理し、残りの4件はスレッドの空きを待っています。<code>busy_threads</code> の 6 は、Puma の説明では「起動しているスレッド数 − 仕事を待っているスレッド数 + スレッドを待っている要求の数」で、処理中の2件と待っている4件の合計です。USE に当てはめると、利用率は (6 − 4) ÷ 2 = 100%、飽和は backlog の 4 件です。200 ms 後には最初の2件が終わり、backlog は 2 に減りました。<code>pool_capacity</code> は新しい要求をすぐに受けられるスレッドの数で、0 なら空きがありません。</p>
          <p>stats は読んだ時点の値です。この例のように 200 ms で値が変わるので、数十秒ごとに読んだ値だけでは短い集中を見落とします。<code>backlog_max</code> は前回読んでから今回までの最大値で、読むたびに 0 に戻ります。定期的に記録する場合は、読む間隔と、どの値を記録したかを残します。</p>
          <Figure n={figure(5)} title="RED で悪化を見つけ、USE で資源を絞る" caption="Rails のアプリケーションでよく使う資源と、それぞれの利用率・飽和・エラーに当たる指標の例です。どの指標を取れるかは実行環境と監視の道具によって違います。">
            <UseRedFigure />
          </Figure>
          <p>図 {figure(5)} の指標は、取り方がそれぞれ違います。接続プールの <code>busy</code> と <code>waiting</code> は <code>ActiveRecord::Base.connection_pool.stat</code> で読めます（<ChapterLink n={15} section="pool" />）。MySQL の <code>Threads_connected</code> と <code>Threads_running</code> は <code>SHOW GLOBAL STATUS</code> で、CPU とメモリーはプロセスやコンテナごとの値を OS から読みます（<ChapterLink n={103} section="observation" />）。利用率が高いだけでは問題とは限りません。CPU 使用率が 90% でも飽和（実行待ち）が無ければ、要求は CPU を待っていません。逆に、利用率の平均が 50% でも、短い時間に飽和していれば利用者は待ちます。</p>
        </>
      ),
    },
    {
      id: "constraints",
      title: "CPU バウンドと I/O バウンドを実測で見分ける",
      body: (
        <>
          <p>処理時間が主に CPU での計算に制約される場合を <Term en="CPU-bound">CPU バウンド</Term>と呼びます。Ruby で大きな JSON を作る、画像を変換する、同じ計算を何度も繰り返す処理が例です。計算量を減らす、プロセスを増やして利用できる CPU コアを活用する、要件に応じて異なる処理方式を選ぶなどの選択肢があります。</p>
          <p>ファイルやネットワークの応答などの待ちが長く、CPU が計算している時間が短い場合は <Term en="I/O-bound">I/O バウンド</Term>と呼びます。待ち行列が増えている場所がネットワークの先にあるなら、スレッドを増やして一部の待ちを重ねられる場合があります。その先の DB がすでに混雑していれば、同時に要求を受けるほど遅くなる場合もあります。</p>
          <h3>経過時間と CPU 時間を同時に測る</h3>
          <p>どちらに当たるかは経過時間と CPU 時間を同時に測ると分かります。Ruby の <code>Process.clock_gettime</code> に <code>CLOCK_MONOTONIC</code> を渡すと経過時間、<code>CLOCK_THREAD_CPUTIME_ID</code> を渡すと、そのスレッドが CPU を使った時間を読めます。<Ref n={9} /> 前の節の <code>ag_111</code> を使い、3種類の処理を5回ずつ実行して比べます。</p>
          <Code lang="ruby" title="cpu_io.rb" code={`require "json"
require "mysql2"

db = Mysql2::Client.new(host: "rbdemo-mysql", username: "root", password: "pass", database: "ag_111")
articles = Array.new(2_000) { |i| { id: i, title: "記事#{i}", tags: %w[ruby rails], body: "本文" * 50 } }

work = {
  "JSON を作る"           => -> { 5.times { JSON.generate(articles) } },
  "MySQL の応答を待つ"     => -> { 5.times { db.query("SELECT SLEEP(0.04)").to_a } },
  "コメント502件を読む"   => -> { 5.times { JSON.generate(db.query("SELECT * FROM comments WHERE article_id = 79").to_a) } },
}

work.each_value(&:call) # 予行
work.each do |name, job|
  wall0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  cpu0 = Process.clock_gettime(Process::CLOCK_THREAD_CPUTIME_ID)
  job.call
  wall = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - wall0) * 1_000
  cpu = (Process.clock_gettime(Process::CLOCK_THREAD_CPUTIME_ID) - cpu0) * 1_000
  printf "%-12s 経過 %6.1f ms  CPU %6.1f ms  CPU の割合 %3.0f%%\\n", name, wall, cpu, cpu / wall * 100
end`} />
          <Code lang="text" title="実行結果（4コアのホストで CPU を1つに制限したコンテナ、ほかの作業で load average が 20 前後。3回実行した3回目。Ruby 4.0.9・MySQL 8.4.13）" code={`JSON を作る     経過   20.5 ms  CPU   10.1 ms  CPU の割合  49%
MySQL の応答を待つ 経過  318.9 ms  CPU    1.3 ms  CPU の割合   0%
コメント502件を読む  経過  160.8 ms  CPU   33.2 ms  CPU の割合  21%`} />
          <Figure n={figure(6)} title="経過時間に占める CPU 時間の割合" caption="上の実行結果を、経過時間を 100% とした横棒で描いた図です。CPU 時間はこのスレッドの値で、MySQL のサーバーが使った CPU は含みません。">
            <CpuShareFigure />
          </Figure>
          <p><code>SELECT SLEEP(0.04)</code> を5回実行する処理は、経過時間のほとんどで CPU を使っていません。Ruby のスレッドは MySQL の応答を待っているだけなので、同じプロセスの別のスレッドがこの間に Ruby のコードを実行できます。コメント502件を読む処理も CPU の割合は 21% で、時間の多くは MySQL の処理と通信を待っています。</p>
          <p>JSON を作る処理は、待つ相手がいないのに CPU の割合が 49% でした。このときホストではほかの作業も動いており、コンテナの CPU が割り当てられるのを待った時間が経過時間に入っています。CPU 時間が同じでも、CPU が混んでいれば経過時間は伸びます。<code>SELECT SLEEP(0.04)</code> の5回が 200 ms ではなく 318.9 ms かかったのも、同じホストの MySQL のコンテナが CPU を待ったためと考えられます。これは USE の「CPU の飽和」に当たる状態で、CPU バウンドの処理ほど影響を受けます。CPU の割合を判断に使うときは、同じ時間帯の CPU の飽和も確かめます。</p>
          <p>Rails の要求1件でも同じ考え方で内訳を取れます。経過時間に対する CPU 時間の割合が高い要求は、同じプロセスのスレッドを増やしても速くなりません。CRuby の GVL（Global VM Lock）により、1つのプロセスで Ruby のコードを実行できるスレッドは同時に1つだからです。スレッド数とワーカー数を変えたときの実測は <ChapterLink n={23} section="gvl" /> に、GVL の仕組みは <ChapterLink n={98} section="gvl" /> にあります。Rails ガイドは、よく調整された Rails アプリケーションでは I/O 待ちが処理時間の 50% を超えることは少なく、1プロセスあたり3スレッドを超えても効果は小さいとしています。<Ref n={10} /></p>
          <p>メモリーの上限に近い場合は、割り当てを減らす、プロセス数を調整する、メモリーが大きい実行環境を選ぶなどの選択肢があります。Ruby の GC の頻度、プロセスの RSS、コンテナの利用量のどれが増えたかで、調整する条件を変えます。ディスクの場合は読み書きの回数や量と待ちの長さ、ネットワークの場合は転送量と接続先の応答時間も確認します。</p>
        </>
      ),
    },
    {
      id: "amdahl",
      title: "アムダールの法則で改善の上限を見積もる",
      body: (
        <>
          <p>ある区間を速くしたとき、全体がどこまで速くなるかは、その区間が全体に占める割合で決まります。全体に占める割合が p の部分を s 倍速くしたときの全体の短縮倍率は 1 ÷ ((1 − p) + p ÷ s) です。これを<Term en="Amdahl's law">アムダールの法則</Term>と呼びます。<Ref n={11} /> もともとは、並列にできない部分がある計算を多数のプロセッサーで実行したときの上限を論じたものです。s をどれだけ大きくしても、全体の倍率は 1 ÷ (1 − p) を超えません。</p>
          <Code lang="ruby" title="amdahl.rb" code={`# 全体に占める割合 p の部分を s 倍速くしたときの、全体の短縮倍率
amdahl = ->(p, s) { 1 / ((1 - p) + p / s) }

base = { ruby: 20.0, sql: 80.0 } # 1要求の内訳（ms）
total = base.values.sum
[[:sql, 2], [:sql, Float::INFINITY], [:ruby, 2], [:ruby, Float::INFINITY]].each do |part, s|
  p = base[part] / total
  printf "%-4s を %s倍: %5.1f ms（%.2f 倍）\\n", part, s.infinite? ? "∞" : s, total / amdahl.(p, s), amdahl.(p, s)
end

puts
puts "並列にできない割合   2台   4台   8台  16台  64台  上限"
[0.05, 0.2].each do |serial|
  row = [2, 4, 8, 16, 64].map { |n| format("%5.2f", amdahl.(1 - serial, n)) }
  printf "%13d%%    %s  %5.1f\\n", (serial * 100).round, row.join(" "), 1 / serial
end`} />
          <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`sql  を 2倍:  60.0 ms（1.67 倍）
sql  を ∞倍:  20.0 ms（5.00 倍）
ruby を 2倍:  90.0 ms（1.11 倍）
ruby を ∞倍:  80.0 ms（1.25 倍）

並列にできない割合   2台   4台   8台  16台  64台  上限
            5%     1.90  3.48  5.93  9.14 15.42   20.0
           20%     1.67  2.50  3.33  4.00  4.71    5.0`} />
          <p>前半は Ruby の処理 20 ms と SQL 80 ms からなる要求の例です。Ruby の処理を完全に無くしても 80 ms までしか縮まず、全体は 1.25 倍速くなるだけです。SQL を半分にすれば 60 ms になります。プロファイルで「Ruby のこのメソッドが遅い」と見つけても、そのメソッドが全体の何割かを先に確かめると、改修に見合う効果があるかを判断できます。</p>
          <p>後半は台数やワーカーを増やして並列に処理する場合です。たとえば夜間の集計ジョブの 95% は記事ごとに分けて並列に実行でき、残りの 5% は最後に1つのトランザクションでまとめて書き込む処理だとします。8台に分けても 5.93 倍、64台でも 15.42 倍で、計算上 20倍を超えません。並列にできない部分が 20% なら、64台でも 4.71 倍です。</p>
          <Figure n={figure(7)} title="並列にできない部分の割合と、台数を増やしたときの倍率" caption="上の実行結果を描いたグラフです。点線は台数に比例して速くなる場合です。アムダールの法則は台数を増やしたときの調整の費用（通信やロックの待ち）を含まないので、実際の倍率はさらに小さくなることがあります。">
            <AmdahlFigure />
          </Figure>
          <p>Web アプリケーションでは、すべての Web サーバーが同じ MySQL の同じ行を更新する処理や、1つのロックを順に取る処理が「並列にできない部分」に当たります。Web サーバーを増やしても、その部分の待ちは減りません。増やす前に、並列にできない部分がどれだけあるかを測ります。</p>
        </>
      ),
    },
    {
      id: "example",
      title: "CPU を増やす案と SQL を直す案を比べる",
      body: (
        <>
          <p>前の節の例で、Ruby の CPU 時間 20 ミリ秒と MySQL の応答待ち 80 ミリ秒がかかる要求をもう一度考えます。待ちが重ならず、ほかの時間も省いた場合、アプリケーションの経過時間は 100 ミリ秒です。Ruby の計算時間だけを半分にできても、経過時間は 90 ミリ秒です。MySQL の応答待ちを半分にできれば 60 ミリ秒になります。どの区間で時間を使ったかによって、改善可能な時間の大きさが違います。</p>
          <p>ただし、MySQL の応答を待つ間に、CPU は別の要求を処理できる場合があります。同じ例で 1要求あたり 20 ミリ秒ぶんの CPU 時間を消費するなら、他の負荷がなく 1 コアをすべて使えるという仮定でも、そのコアで処理できるのは最大 1秒に50要求ぶんです。ここではアプリケーションの CPU だけを計算しています。DB の容量やプロセスの処理枠、OS が使う時間によって、実際の完了数は変わります。</p>
          <p>この2つの見方を合わせると、案の効果が分かれます。CPU コアを2倍にする案は、ピーク時に CPU が飽和しているなら完了件数の上限を上げますが、1件のレイテンシはほとんど変わりません。SQL を直す案は1件のレイテンシを縮めるうえ、リトルの法則により同時に使うスレッドと DB の接続も減らします。毎秒40件なら、1件 100 ms で平均4本使っていたスレッドが、60 ms なら 2.4 本になります。</p>
          <p>単一要求を速くする改善と、ピーク時に完了件数を増やす改善は結果がそろわないことがあります。前者を比較するときは、負荷の低い状態でも同じ要求を測ります。後者を比較するときは、一件当たりの経過時間に加え、どれだけ同時に処理を進められるかを調べます。</p>
        </>
      ),
    },
    {
      id: "scaling",
      title: "スケールアップとスケールアウト",
      body: (
        <>
          <p>処理能力を増やす方法は2つに分けられます。<Term en="scale up">スケールアップ</Term>は1台を CPU やメモリーの大きい台に替えて、1台で使える資源を増やす方法です。<Term en="scale out">スケールアウト</Term>は同じ役割の台やコンテナを増やし、ロードバランサーで要求を分ける方法です。Puma ではどちらの場合も、増えた CPU コアを使うためにワーカー数を合わせて変えます。</p>
          <Figure n={figure(8)} title="スケールアップとスケールアウト" caption="どちらの構成でも、後ろの MySQL は1つのままです。Web の処理能力を増やしても、DB がボトルネックなら完了件数は増えません。">
            <ScalingFigure />
          </Figure>
          <p>スケールアップはアプリケーションの構成を変えずに済むことが多い方法です。セッションやアップロードしたファイルを1台のディスクに置いていても動き続けます。Rails ガイドは少ない台数で1台あたりのプロセスを多くする構成の方が、CPU コアあたりのメモリーを効率よく使えるとしています。<Ref n={10} /> 一方で、1台の大きさには上限があり、台を替えるときには止める時間や切り替えの手順が要ります。1台が止まると、その間の処理はすべて止まります。</p>
          <p>スケールアウトは、台数を増やす限り処理能力を足していけますが、条件があります。どの台に要求が届いても同じ結果を返せるよう、セッション、キャッシュ、ファイルを各台の外（DB、Redis、オブジェクトストレージなど）に置きます。ロードバランサーには、止まった台を外すヘルスチェックが要ります。AWS の Well-Architected フレームワークは、1つの大きな資源を複数の小さな資源に置き換えて、1か所の故障が全体に与える影響を減らすことを設計原則に挙げています。<Ref n={12} /></p>
          <p>どちらの方法でも、共有している資源の上限は変わりません。図 {figure(8)} の MySQL がボトルネックなら、Web を増やしても完了件数は増えず、DB への同時接続と負荷が増えるだけです。スケールアウトでは台数に比例して接続プールの数も増えるため、MySQL の <code>max_connections</code> を超えないかを確かめます。台数・ワーカー数・接続数を具体的に決める手順は <ChapterLink n={113} section="scaling" /> で扱います。</p>
        </>
      ),
    },
    {
      id: "decision",
      title: "改善前後で同じ結果を測る",
      body: (
        <>
          <p>一覧の応答が遅いとき、SQL の実行時間が長ければ、読む行や索引を調べます。似た SQL を何度も発行していれば関連の先読みが候補です。SQL の総時間が短く Ruby の処理時間が長いなら、プロファイルで集計や整形の処理を調べます。同じ画面でも、時間のかかる区間によって選択肢は変わります。区間ごとの時間とプロファイルの取り方は <ChapterLink n={112} /> で扱います。</p>
          <p>CPU の使用率が高いことと、要求の大部分が CPU を待っていることは同じ観測ではありません。前の節までの USE の指標に加え、要求の各区間にかかった時間を同じ期間で比べて、どの待ちが応答時間を伸ばしているかを確かめてから対策を選びます。</p>
          <p>改善前後では成功率とレイテンシの分布、完了した件数を同じ負荷条件で測ります。たとえばタイムアウトで早く失敗するように構成を変えると、成功と失敗を合わせたレイテンシは改善して見えることがあります。利用者が求める結果が返る件数も調べると、単に処理を早く打ち切った場合と区別できます。</p>
          <p>負荷条件には到着数（毎秒何件か）、要求の種類と割合、データの件数、試行時間、ウォームアップの有無を含めます。待ち行列の節で見たとおり、利用率 0.8 と 0.9 では応答時間が2倍違うので、到着数が少し違うだけで比較の結果が逆になることがあります。改善前の測定と同じ条件をそろえられないときは、そろえられなかった条件を記録に残します。</p>
        </>
      ),
    },
    {
      id: "tradeoffs",
      title: "判断基準とトレードオフ",
      body: (
        <>
          <p>この章の内容から、改善策を選ぶときの判断を整理します。どれも、測った値に基づいて決めることを前提にしています。</p>
          <div className="table-wrap"><table>
            <caption>観測した状態と、最初に検討する対策</caption>
            <thead><tr><th scope="col">観測した状態</th><th scope="col">最初に検討する対策</th><th scope="col">代わりに増えるもの・注意</th></tr></thead>
            <tbody>
              <tr><th scope="row">特定の条件に当てはまる要求だけ p95 が高い</th><td>その条件の処理（SQL・取得件数・整形）を直す</td><td>全体の平均は変わらないことがある。条件ごとに分けて測る</td></tr>
              <tr><th scope="row">Puma の backlog が続けて 0 より大きく、CPU に余裕がある</th><td>I/O 待ちの割合を測ってからスレッドを増やす</td><td>接続プールと DB の同時実行が増える</td></tr>
              <tr><th scope="row">CPU が飽和し、要求の CPU 時間の割合が高い</th><td>計算量を減らす、ワーカーと CPU コアを増やす</td><td>メモリーと DB の接続数が増える</td></tr>
              <tr><th scope="row">接続プールの waiting が多く、MySQL に余裕がある</th><td>接続を借りている時間を短くする、プールの上限を見直す</td><td>MySQL の接続数の合計を確かめる</td></tr>
              <tr><th scope="row">MySQL の実行中のスレッドやロック待ちが多い</th><td>SQL と索引を直す、同時に送る数を抑える</td><td>Web を増やすと悪化することがある</td></tr>
              <tr><th scope="row">ボトルネックの資源の利用率が 0.8 を超えて続く</th><td>処理時間を縮めるか、処理枠を増やして利用率を下げる</td><td>到着の偏りが大きいほど余裕を多く取る</td></tr>
            </tbody>
          </table></div>
          <p>利用率をどこまで上げてよいかに決まった値はありません。待ち行列のモデルは、処理枠が多く、処理時間のばらつきが小さいほど、高い利用率でも待ちが短いことを示しています。本書ではピーク時のボトルネックの利用率と、そのときの p95 を一緒に記録し、p95 が目標を超え始める利用率をその環境の上限として扱うことを勧めます。これは設計上の意見で、目標値は画面の用途や利用者との約束で決まります。</p>
          <p>計測には費用もかかります。パーセンタイルを正しく集計するにはヒストグラムか元の値を保存する必要があり、stats やプロファイルを頻繁に取るとその処理自体が CPU を使います。最初は RED の3つの値をエンドポイントごとに取り、悪化したときに USE の指標と区間の時間を追加で調べる順にすると、常に記録する量を抑えられます。</p>
          <p>関連する章：区間の時間とプロファイルの取り方は <ChapterLink n={112} />、Puma のワーカー数・スレッド数と DB の接続数の決め方は <ChapterLink n={113} />、Puma のプロセスとスレッドの構成は <ChapterLink n={23} />、測ってから直す進め方の事例は <ChapterLink n={90} />、ログ・メトリクス・トレースの記録は <ChapterLink n={89} />、容量を判断する事例は <ChapterLink n={115} /> にあります。</p>
        </>
      ),
    },
  ],
  sources: [
    {
      title: "Monitoring Distributed Systems",
      publisher: "Google SRE",
      url: "https://sre.google/sre-book/monitoring-distributed-systems/",
      accessed: "2026-11-27",
      version: "Site Reliability Engineering",
      note: "レイテンシ、トラフィック、エラー、飽和。平均ではなく分布で見ること",
    },
    {
      title: "The USE Method",
      publisher: "Brendan Gregg",
      url: "https://www.brendangregg.com/usemethod.html",
      accessed: "2026-11-27",
      version: "USE Method",
      note: "リソースの利用率、飽和、エラー",
    },
    {
      title: "Module ngx_http_log_module（$request_time）",
      publisher: "nginx",
      url: "https://nginx.org/en/docs/http/ngx_http_log_module.html",
      accessed: "2026-11-27",
      version: "nginx 1.30",
      note: "$request_time はクライアントから最初のバイトを読んでから、最後のバイトを送った後にログを書くまでの時間",
    },
    {
      title: "Percentiles（Engineering Statistics Handbook 7.2.6.2）",
      publisher: "NIST/SEMATECH",
      url: "https://www.itl.nist.gov/div898/handbook/prc/section2/prc262.htm",
      accessed: "2026-11-27",
      version: "e-Handbook of Statistical Methods",
      note: "順序統計量の間を線形補間してパーセンタイルを推定する方法",
    },
    {
      title: "Performance Modeling and Design of Computer Systems: Queueing Theory in Action",
      publisher: "Mor Harchol-Balter, Cambridge University Press",
      url: "https://www.cs.cmu.edu/~harchol/PerformanceModeling/book.html",
      accessed: "2026-11-27",
      version: "2013",
      note: "M/M/1 の平均応答時間（13章）、リトルの法則（6章）",
    },
    {
      title: "A Proof for the Queuing Formula: L = λW",
      publisher: "John D. C. Little, Operations Research 9(3)",
      url: "https://doi.org/10.1287/opre.9.3.383",
      accessed: "2026-11-27",
      version: "1961",
      note: "系の中の平均件数と到着率と平均滞在時間の関係",
    },
    {
      title: "The RED Method: How to instrument your services",
      publisher: "Grafana Labs",
      url: "https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/",
      accessed: "2026-11-27",
      version: "2018-08-02",
      note: "Tom Wilkie による Rate・Errors・Duration と USE との関係",
    },
    {
      title: "docs/stats.md",
      publisher: "Puma",
      url: "https://github.com/puma/puma/blob/v8.0.2/docs/stats.md",
      accessed: "2026-11-27",
      version: "Puma 8.0.2",
      note: "backlog・running・busy_threads・pool_capacity・backlog_max の意味",
    },
    {
      title: "Process.clock_gettime",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/Process.html#method-c-clock_gettime",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "CLOCK_MONOTONIC と CLOCK_THREAD_CPUTIME_ID",
    },
    {
      title: "Tuning Performance for Deployment",
      publisher: "Ruby on Rails Guides",
      url: "https://guides.rubyonrails.org/v8.1/tuning_performance_for_deployment.html",
      accessed: "2026-11-27",
      version: "Rails 8.1",
      note: "I/O 待ちの割合とスレッド数、プロセス数と CPU コア、台数とメモリーの効率",
    },
    {
      title: "Validity of the single processor approach to achieving large scale computing capabilities",
      publisher: "Gene M. Amdahl, AFIPS Spring Joint Computer Conference",
      url: "https://doi.org/10.1145/1465482.1465560",
      accessed: "2026-11-27",
      version: "1967",
      note: "並列にできない部分が全体の高速化を制限すること（アムダールの法則）",
    },
    {
      title: "Reliability Pillar: Design principles",
      publisher: "AWS Well-Architected Framework",
      url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html",
      accessed: "2026-11-27",
      version: "Reliability Pillar",
      note: "Scale horizontally to increase aggregate workload availability",
    },
  ],
}

export default chapter
