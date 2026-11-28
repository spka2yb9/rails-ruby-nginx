import { useState } from 'react'
import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { FigureChoices } from '../visuals/study-figure'

const figure = (n: number) => `${chapterNumber(112)}-${n}`

/* ---------- 図1 問いと道具の対応 ---------- */
function ToolLadderFigure() {
  const rows: [string, string][] = [
    ['どの要求が、いつ遅いか', 'ログ・APM（件数・失敗・p95）'],
    ['その要求のどの区間か', 'Notifications・rack-mini-profiler'],
    ['その区間のどのメソッドか', 'stackprof・vernier'],
    ['どこでオブジェクトを作るか', 'memory_profiler'],
    ['直した版は速くなったか', 'Benchmark・benchmark-ips'],
    ['全体で何件処理できるか', '負荷試験の道具'],
  ]
  return (
    <Svg id={figure(1)} w={780} h={330} label="上から順に、どの要求が遅いかはログと APM、要求のどの区間かは ActiveSupport::Notifications と rack-mini-profiler、区間のどのメソッドかは stackprof と vernier、どこでオブジェクトを作るかは memory_profiler で調べる。その後、直した版が速いかを Benchmark と benchmark-ips で、全体で何件処理できるかを負荷試験で確かめる。">
      <T x={150} y={18} bold fs={12}>知りたいこと</T>
      <T x={500} y={18} bold fs={12}>使う道具</T>
      {rows.map(([q, tool], i) => (
        <g key={q}>
          <Box x={150} y={30 + i * 48} w={280} h={36} lines={q} fs={12} fill={i < 4 ? 'box' : 'box4'} />
          <Arrow x1={430} y1={48 + i * 48} x2={468} y2={48 + i * 48} />
          <Box x={470} y={30 + i * 48} w={290} h={36} lines={tool} fs={12} fill="bg" mono={i > 0 && i < 5} />
        </g>
      ))}
      <Arrow x1={110} y1={34} x2={110} y2={214} accent />
      <T x={20} y={110} fs={11} tone="acc">範囲を</T>
      <T x={20} y={128} fs={11} tone="acc">狭める</T>
      <Arrow x1={110} y1={226} x2={110} y2={310} accent />
      <T x={20} y={262} fs={11} tone="acc">直した後</T>
      <T x={20} y={280} fs={11} tone="acc">に比べる</T>
    </Svg>
  )
}

/* ---------- 図2 経過時間と割り当て数の再現性 ---------- */
function VarianceFigure() {
  const runs = [
    { label: '1回目', records: 265.4, values: 36.5 },
    { label: '2回目', records: 80.3, values: 19.2 },
  ]
  const tx = (ms: number) => ms * 1.05
  const ax = (n: number) => n / 300
  return (
    <Svg id={figure(2)} w={780} h={250} label="左は経過時間の中央値。select と map は1回目 265.4 ms、2回目 80.3 ms、pluck は 36.5 ms と 19.2 ms で、実行ごとに大きく変わった。右は割り当て数の中央値で、どちらの実行でも select と map が 90,800 個、pluck が 30,740 個で同じだった。">
      <T x={20} y={20} bold fs={12}>経過時間の中央値（10回の読み取り）</T>
      <T x={430} y={20} bold fs={12}>割り当て数の中央値</T>
      {runs.map((r, i) => {
        const y = 44 + i * 96
        return (
          <g key={r.label}>
            <T x={20} y={y + 30} fs={12}>{r.label}</T>
            <rect x={80} y={y} width={tx(r.records)} height={26} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <rect x={80} y={y + 32} width={tx(r.values)} height={26} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={84 + tx(r.records)} y={y + 13} fs={11}>{`${r.records} ms`}</T>
            <T x={84 + tx(r.values)} y={y + 45} fs={11}>{`${r.values} ms`}</T>
            <rect x={430} y={y} width={ax(90800)} height={26} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <rect x={430} y={y + 32} width={ax(30740)} height={26} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={434 + ax(90800)} y={y + 13} fs={11}>90,800</T>
            <T x={434 + ax(30740)} y={y + 45} fs={11}>30,740</T>
          </g>
        )
      })}
      <rect x={80} y={226} width={14} height={12} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={100} y={232} fs={11}>select + map</T>
      <rect x={200} y={226} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={220} y={232} fs={11}>pluck</T>
    </Svg>
  )
}

/* ---------- 図3 1回目の遅さと YJIT の準備 ---------- */
function WarmupFigure() {
  const firstCalls = [24.01, 0.32, 0.13, 0.07, 0.07]
  const ly = (ms: number) => 200 - ((Math.log10(ms) + 2) / 4) * 160
  const interp = [42, 45, 42, 41, 40, 40, 44, 42, 40, 40]
  const yjit = [7, 4, 3, 4, 6, 15, 8, 15, 3, 4]
  const by = (ms: number) => 200 - (ms / 50) * 160
  return (
    <Svg id={figure(3)} w={780} h={250} label="左は Article.find(1) を5回続けて呼んだ時間を対数の縦軸で描いたもの。1回目は 24.01 ms、2回目は 0.32 ms、4回目以降は 0.07 ms。右は fib(27) を10回呼んだ時間で、YJIT なしは毎回 40〜45 ms、YJIT ありは1回目が 7 ms、その後は多くが 3〜8 ms。">
      <T x={20} y={18} bold fs={12}>Article.find(1) を続けて呼ぶ（縦軸は対数）</T>
      {[0.01, 0.1, 1, 10, 100].map((v) => (
        <g key={v}>
          <line x1={66} y1={ly(v)} x2={330} y2={ly(v)} stroke="var(--fig-line)" strokeOpacity={0.25} />
          <T x={60} y={ly(v)} fs={10} anchor="end" tone="muted">{`${v} ms`}</T>
        </g>
      ))}
      {firstCalls.map((ms, i) => (
        <g key={i}>
          <rect x={80 + i * 50} y={ly(ms)} width={34} height={200 - ly(ms)} fill={i ? 'var(--fig-box)' : 'var(--fig-box5)'} stroke="var(--fig-line)" />
          <T x={97 + i * 50} y={216} fs={10} anchor="middle" tone="muted">{`${i + 1}回目`}</T>
        </g>
      ))}
      <T x={120} y={ly(24.01) - 2} fs={11} tone="acc">24.01 ms</T>
      <T x={420} y={18} bold fs={12}>fib(27) を10回呼ぶ</T>
      {[0, 25, 50].map((v) => (
        <g key={v}>
          <line x1={446} y1={by(v)} x2={760} y2={by(v)} stroke="var(--fig-line)" strokeOpacity={0.25} />
          <T x={440} y={by(v)} fs={10} anchor="end" tone="muted">{`${v}`}</T>
        </g>
      ))}
      {interp.map((ms, i) => (
        <g key={i}>
          <rect x={452 + i * 30} y={by(ms)} width={12} height={200 - by(ms)} fill="var(--fig-box)" stroke="var(--fig-line)" />
          <rect x={465 + i * 30} y={by(yjit[i])} width={12} height={200 - by(yjit[i])} fill="var(--fig-box5)" stroke="var(--fig-line)" />
        </g>
      ))}
      <T x={452} y={216} fs={10} tone="muted">1回目</T>
      <T x={752} y={216} fs={10} anchor="end" tone="muted">10回目</T>
      <rect x={452} y={228} width={14} height={12} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={472} y={234} fs={11}>YJIT なし</T>
      <rect x={560} y={228} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={580} y={234} fs={11}>YJIT あり（ms）</T>
    </Svg>
  )
}

/* ---------- 図4 フレームグラフ ---------- */
function FlameGraphFigure() {
  const s = 740 / 244
  const top = (level: number) => 46 + (6 - level) * 30
  const frames: { level: number; start: number; n: number; label: string; fill?: 'box' | 'box5' | 'box4' | 'bg'; fs?: number }[] = [
    { level: 0, start: 0, n: 216, label: '<main> から Integer#times まで（5段をまとめて表示）', fill: 'bg' },
    { level: 0, start: 216, n: 28, label: 'GC（28）', fill: 'box4' },
    { level: 1, start: 0, n: 216, label: 'Object#render_comments（216）' },
    { level: 1, start: 216, n: 16, label: 'sweep', fill: 'box4', fs: 10 },
    { level: 1, start: 232, n: 12, label: 'mark', fill: 'box4', fs: 10 },
    { level: 2, start: 0, n: 203, label: 'Array#map（203）' },
    { level: 2, start: 203, n: 13, label: 'JSON', fs: 10 },
    { level: 3, start: 0, n: 203, label: 'render_comments のブロック（203）' },
    { level: 3, start: 203, n: 13, label: 'C 拡張', fs: 10 },
    { level: 4, start: 0, n: 202, label: 'Object#serialize（202）' },
    { level: 5, start: 0, n: 173, label: 'Object#strip_tags（173）' },
    { level: 5, start: 173, n: 23, label: 'format_time', fs: 10 },
    { level: 6, start: 0, n: 169, label: 'String#gsub（169）', fill: 'box5' },
    { level: 6, start: 173, n: 22, label: 'strftime', fill: 'box5', fs: 10 },
  ]
  return (
    <Svg id={figure(4)} w={780} h={290} label="stackprof の CPU プロファイル 244 サンプルを描いたフレームグラフ。下の段が呼び出し元、上の段が呼び出し先で、横幅はサンプル数。render_comments が 216、その中の serialize が 202、strip_tags が 173、一番上の String#gsub が 169 で全体の 69%。format_time の上の Time#strftime は 22。右端の GC が 28。">
      <T x={20} y={20} fs={11} tone="acc">一番上に出ている幅が、そのメソッド自身が CPU を使った時間です（String#gsub は 169 / 244）</T>
      {frames.map((f) => (
        <Box key={`${f.level}-${f.start}`} x={20 + f.start * s} y={top(f.level)} w={f.n * s} h={26} rx={2} lines={f.label} fs={f.fs ?? 11}
          fill={f.fill ?? 'box'} mono={/^[A-Z<]/.test(f.label) && f.level > 0} />
      ))}
      <T x={20 + 202 * s + 4} y={top(5) + 13} fs={10} tone="muted">← serialize 自身（6）</T>
      <T x={20} y={276} fs={11} tone="muted">横幅＝サンプル数（合計 244）。下が呼び出し元、上が呼び出し先。左右の並びは時刻の順ではありません。</T>
    </Svg>
  )
}

/* ---------- 図5 クラスごとの割り当て数 ---------- */
function AllocationFigure() {
  const k = 600 / 9064
  const bars = [
    { label: 'select + map', total: 9064, parts: [['Hash', 3009, 'box5'], ['String', 2003, 'box'], ['Array', 1038, 'box4'], ['LazyAttributeSet', 1000, 'box2'], ['その他', 2014, 'bg']] as [string, number, 'box' | 'box2' | 'box4' | 'box5' | 'bg'][] },
    { label: 'pluck', total: 3058, parts: [['String', 2003, 'box'], ['Array', 1035, 'box4'], ['Hash', 5, 'box5'], ['その他', 15, 'bg']] as [string, number, 'box' | 'box2' | 'box4' | 'box5' | 'bg'][] },
  ]
  return (
    <Svg id={figure(5)} w={780} h={200} label="1,000件の題名を読む1回で作ったオブジェクトの数をクラスごとに積んだ横棒。select と map は合計 9,064 個で、Hash 3,009、String 2,003、Array 1,038、ActiveModel::LazyAttributeSet 1,000、その他 2,014。pluck は合計 3,058 個で、String 2,003、Array 1,035、Hash 5、その他 15。">
      {bars.map((b, i) => {
        let x = 130
        const y = 30 + i * 70
        return (
          <g key={b.label}>
            <T x={20} y={y + 17} fs={12} mono>{b.label}</T>
            {b.parts.map(([name, n, fill]) => {
              const w = n * k
              const el = (
                <g key={name}>
                  <rect x={x} y={y} width={Math.max(w, 1)} height={34} fill={`var(--fig-${fill})`} stroke="var(--fig-line)" strokeWidth={0.8} />
                  {w > name.length * 7 + 8 && <T x={x + w / 2} y={y + 17} fs={10} anchor="middle" mono={name !== 'その他'}>{name}</T>}
                  {w <= name.length * 7 + 8 && n >= 500 && <T x={x + w / 2} y={y - 8} fs={10} anchor="middle" mono>{name}</T>}
                </g>
              )
              x += w
              return el
            })}
            <T x={x + 8} y={y + 17} fs={11}>{`${b.total.toLocaleString('en-US')} 個`}</T>
          </g>
        )
      })}
      <T x={130} y={180} fs={11} tone="muted">String と Array はどちらにもあります。select + map だけに Hash と LazyAttributeSet（モデルの属性の入れ物）が多く出ます。</T>
    </Svg>
  )
}

/* ---------- 図6 入れ子の区間と待ち時間 ---------- */
function EventsFigure() {
  const k = 600 / 52.5
  const x = (ms: number) => 150 + ms * k
  return (
    <Svg id={figure(6)} w={780} h={230} label="export.demo の 52.50 ms の中に、load.demo 1.52 ms（その中に sql.active_record 0.55 ms）、upload.demo 50.12 ms、encode.demo 0.60 ms が順に入っている。upload.demo はほぼすべてが待ち時間で、CPU 時間は 0.06 ms。">
      {[0, 10, 20, 30, 40, 50].map((ms) => (
        <T key={ms} x={x(ms)} y={204} fs={10} anchor="middle" tone="muted">{`${ms} ms`}</T>
      ))}
      <T x={20} y={52} fs={12} mono>export.demo</T>
      <rect x={x(0)} y={40} width={52.5 * k} height={24} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <rect x={x(0)} y={40} width={2.45 * k} height={24} fill="var(--fig-box5)" stroke="none" />
      <T x={x(52.5) - 6} y={52} fs={11} anchor="end">経過 52.50 ms・CPU 2.45 ms・割り当て 6,219</T>
      <T x={20} y={102} fs={12} mono>1段下</T>
      <rect x={x(0)} y={90} width={1.52 * k} height={24} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <rect x={x(1.6)} y={90} width={50.12 * k} height={24} fill="var(--fig-box4)" stroke="var(--fig-line)" strokeDasharray="4 3" />
      <rect x={x(51.8)} y={90} width={0.6 * k} height={24} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={x(26)} y={102} fs={11} anchor="middle" mono>upload.demo 50.12 ms（CPU 0.06 ms）</T>
      <T x={20} y={152} fs={12} mono>2段下</T>
      <rect x={x(0.4)} y={140} width={0.55 * k} height={24} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <Arrow x1={x(0.8)} y1={176} x2={x(0.8)} y2={166} />
      <T x={x(0)} y={184} fs={11} mono>sql.active_record 0.55 ms（load.demo の中）</T>
      <Arrow x1={x(0.8)} y1={82} x2={x(0.8)} y2={89} />
      <T x={x(0)} y={74} fs={11} mono>load.demo 1.52 ms</T>
      <Arrow x1={x(52.1)} y1={128} x2={x(52.1)} y2={116} />
      <T x={x(52.5)} y={136} fs={11} anchor="end" mono>encode.demo 0.60 ms</T>
      <rect x={150} y={212} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={170} y={218} fs={11}>CPU を使った時間</T>
      <rect x={300} y={212} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" strokeDasharray="3 2" />
      <T x={320} y={218} fs={11}>待ち時間（idle_time）</T>
    </Svg>
  )
}

/* ---------- 図7 閉じたモデルと開いたモデル ---------- */
function LoadModelFigure() {
  const x = (ms: number) => 160 + ms
  const closed = [0, 50, 100, 150, 200, 250, 300, 450]
  const closedLen = (s: number) => (s < 300 ? 50 : 150)
  const arrivals = Array.from({ length: 12 }, (_, i) => i * 50)
  return (
    <Svg id={figure(7)} w={780} h={250} label="上は前の応答を受け取ってから次を送る負荷のかけ方。前半は 50 ms ごとに6件送るが、後半に応答が 150 ms に延びると2件しか送らない。下は到着の間隔を決めて送るかけ方で、応答が遅くなっても 50 ms ごとに送り続けるので、サーバーの前に待つ要求が増える。">
      <T x={20} y={40} fs={12} bold>前の応答を</T>
      <T x={20} y={58} fs={12} bold>待って送る</T>
      {closed.map((s) => (
        <rect key={s} x={x(s) + 1} y={36} width={closedLen(s) - 2} height={24} rx={3} fill={s < 300 ? 'var(--fig-box)' : 'var(--fig-box5)'} stroke="var(--fig-line)" />
      ))}
      <T x={x(0)} y={80} fs={11} tone="muted">前半 300 ms で6件</T>
      <T x={x(300)} y={80} fs={11} tone="muted">応答が 150 ms に延びると後半は2件</T>
      <T x={20} y={140} fs={12} bold>到着の間隔を</T>
      <T x={20} y={158} fs={12} bold>決めて送る</T>
      {arrivals.map((a) => (
        <g key={a}>
          <line x1={x(a)} y1={126} x2={x(a)} y2={170} stroke="var(--fig-accent)" strokeWidth={2} />
        </g>
      ))}
      <T x={x(0)} y={186} fs={11} tone="muted">50 ms ごとに送り続ける（縦線が到着）</T>
      <T x={x(300)} y={206} fs={11} tone="acc">応答が延びても到着は減らず、待つ要求が増える</T>
      {[0, 100, 200, 300, 400, 500, 600].map((ms) => (
        <T key={ms} x={x(ms)} y={232} fs={10} anchor="middle" tone="muted">{`${ms} ms`}</T>
      ))}
    </Svg>
  )
}

/* ---------- 図8 負荷のかけ方を切り替える（操作できる図） ---------- */
const SLOW_AT = 400
const LOAD_END = 1200

/** 1件ずつ順に処理するサーバーに要求を送ったときの、到着・処理開始・終了の時刻（ms） */
function simulateLoad(open: boolean, slow: number) {
  const reqs: { a: number; s: number; e: number }[] = []
  let free = 0
  for (let a = 0; a < LOAD_END; ) {
    const s = Math.max(a, free)
    const e = s + (s < SLOW_AT ? 40 : slow)
    reqs.push({ a, s, e })
    free = e
    a = open ? a + 50 : e + 10
  }
  const after = reqs.filter((r) => r.a >= SLOW_AT)
  const times = after.map((r) => r.e - r.a)
  return {
    reqs,
    after: after.length,
    avg: times.reduce((x, y) => x + y, 0) / times.length,
    max: Math.max(...times),
    waiting: reqs.filter((r) => r.s >= LOAD_END).length,
  }
}

const LOAD_MODES = ['前の応答を待って送る（閉ループ）', '50 ms ごとに送る（開ループ）'] as const

function LoadModeSim() {
  const [mode, setMode] = useState(0)
  const [slow, setSlow] = useState(120)
  const results = [simulateLoad(false, slow), simulateLoad(true, slow)]
  const shown = results[mode]
  const x = (ms: number) => 150 + Math.min(ms, LOAD_END) / 2
  const rowY = (i: number) => 44 + i * 8
  return (
    <Figure
      n={figure(8)}
      title="負荷のかけ方を切り替えて、サーバーが遅くなったときの記録を比べる"
      caption="概念モデルです。サーバーは要求を1件ずつ順に処理し、400 ms 以降に処理を始めた要求の処理時間がスライダーの値になると仮定しています。それより前の処理時間は 40 ms です。閉ループは送り手が1つで、応答を受け取ってから 10 ms 後に次を送ります。実際の負荷試験の道具は送り手を複数持ち、Puma も複数の要求を並行して処理するので、待ちの伸び方は変わります。"
    >
      <FigureChoices label="負荷のかけ方" options={LOAD_MODES} selected={mode} onSelect={setMode} />
      <label className="sim-range">
        <span>400 ms 以降の処理時間 <output>{slow}</output> ms</span>
        <input type="range" min={40} max={200} step={10} value={slow} onChange={(e) => setSlow(e.target.valueAsNumber)} />
      </label>
      <Svg
        id={figure(8)}
        w={780}
        h={276}
        label={`${LOAD_MODES[mode]}。0〜1,200 ms に ${shown.reqs.length} 件を送った。400 ms 以降に届いた要求は ${shown.after} 件で、応答時間の平均は ${Math.round(shown.avg)} ms、最大は ${Math.round(shown.max)} ms。`}
      >
        <T x={20} y={18} fs={12} bold>要求ごとの待ち（破線の枠）と処理（塗り）。1行が1件で、上から届いた順</T>
        <line x1={x(SLOW_AT)} y1={36} x2={x(SLOW_AT)} y2={rowY(24)} stroke="var(--fig-accent)" strokeDasharray="4 3" />
        <T x={x(SLOW_AT) + 6} y={34} fs={11} tone="acc">ここから遅くなる</T>
        <T x={20} y={60} fs={11} tone="muted">{`送った要求 ${shown.reqs.length} 件`}</T>
        <T x={20} y={78} fs={11} tone="muted">{`400 ms 以降 ${shown.after} 件`}</T>
        {shown.reqs.map((r, i) => (
          <g key={i}>
            {r.s > r.a && <rect x={x(r.a)} y={rowY(i)} width={x(r.s) - x(r.a)} height={6} fill="none" stroke="var(--fig-line)" strokeDasharray="2 2" />}
            {r.s < LOAD_END && <rect x={x(r.s)} y={rowY(i)} width={Math.max(1, x(r.e) - x(r.s))} height={6} fill={r.s < SLOW_AT ? 'var(--fig-box)' : 'var(--fig-box5)'} stroke="var(--fig-line)" />}
          </g>
        ))}
        <line x1={x(0)} y1={rowY(24) + 4} x2={x(LOAD_END)} y2={rowY(24) + 4} stroke="var(--fig-line)" />
        {[0, 400, 800, 1200].map((ms) => (
          <T key={ms} x={x(ms)} y={rowY(24) + 18} fs={10} anchor="middle" tone="muted">{`${ms.toLocaleString('en-US')} ms`}</T>
        ))}
      </Svg>
      <div className="table-wrap" aria-live="polite">
        <table>
          <thead>
            <tr>
              <th scope="col">負荷のかけ方</th>
              <th scope="col">400 ms 以降に届いた要求</th>
              <th scope="col">その応答時間（平均／最大）</th>
              <th scope="col">1,200 ms の時点で待っている要求</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <th scope="row">{LOAD_MODES[i]}</th>
                <td>{r.after} 件</td>
                <td>{`${Math.round(r.avg).toLocaleString('en-US')} ／ ${Math.round(r.max).toLocaleString('en-US')} ms`}</td>
                <td>{r.waiting} 件</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  )
}

const chapter: Chapter = {
  number: 112,
  part: 10,
  title: "Rails のプロファイリングとベンチマーク",
  summary: "遅い処理の内訳を調べ、候補を絞ってから、条件をそろえた計測で改善を確かめます。",
  goals: [
    "ログ、計測イベント、プロファイル、ベンチマークを目的に応じて選ぶ",
    "CPU 時間・経過時間・割り当てを区別し、ウォームアップ・GC・キャッシュの影響を除いて比べる",
    "stackprof のフレームグラフと memory_profiler の出力を読む",
    "比較の条件と計測結果の適用範囲を記録する",
  ],
  prerequisites: [111],
  sections: [
    {
      id: "observe",
      title: "どの区間に時間がかかるかを観測する",
      body: (
        <>
          <p>記事一覧の API が遅いと分かったとき、すぐにコードを書き換えるのではなく、まずどこに時間を使っているかを調べます。調べる作業には2種類あります。<Term en="profiling">プロファイリング</Term>は実行中の処理を観測して、どのメソッドや種類の仕事に時間やメモリーを使ったかを調べる作業です。<Term en="benchmark">ベンチマーク</Term>は入力と条件を決めて実行し、処理時間や完了数を測る作業です。一覧 API の例ではプロファイルで改修の候補を探し、ベンチマークで修正前後を比較します。</p>
          <p>まず URL やリクエスト ID を手掛かりに、同じ要求の応答時間とエラーを特定します。Nginx が要求を受けてから測る時間と、Rails がアクションに入ってから測る時間には違いがあります（<ChapterLink n={111} section="latency" />）。それぞれで計測した時間が重なる場合、単純に足すと同じ時間を二度数えます。どちらの時刻から計ったかを確かめて、Rails の区間外の待ちを推定します。</p>
          <Figure n={figure(1)} title="知りたいことと使う道具" caption="上の4段で調べる範囲を狭め、下の2段で直した結果を確かめます。この章では各段の道具を Docker で実行した結果とともに扱います。">
            <ToolLadderFigure />
          </Figure>
          <p>図 {figure(1)} の上の段ほど広い範囲を安い費用で観測でき、下の段ほど狭い範囲を詳しく調べられます。いきなりプロファイラーを全体にかけると、遅い要求と関係の無い処理の結果も混ざります。ログや監視で遅い要求の種類を決め、区間の時間で SQL か Ruby かを分け、その区間だけをプロファイルにかける順に進めます。この章で使う道具のうち、benchmark-ips・stackprof・vernier・memory_profiler は Ruby の標準添付ではない gem で、実行には Gemfile への追加が要ります。</p>
          <Ref n={1} />
        </>
      ),
    },
    {
      id: "plan",
      title: "計測の前に決めること：何を・どの条件で・何回",
      body: (
        <>
          <p>計測を始める前に、何を測るか、どの条件で測るか、何回測るかを決めて書き出します。決めずに測り始めると、改善前と改善後で条件がずれ、差が変更の効果なのか条件の違いなのかを区別できなくなります。</p>
          <div className="table-wrap"><table>
            <caption>計測の前に決めることと、その例</caption>
            <thead><tr><th scope="col">決めること</th><th scope="col">例</th><th scope="col">決めないと起きること</th></tr></thead>
            <tbody>
              <tr><th scope="row">何を測るか</th><td>経過時間、CPU 時間、割り当て数、SQL の回数、1秒あたりの完了件数</td><td>経過時間だけを比べ、待ちが減ったのか計算が減ったのか分からない</td></tr>
              <tr><th scope="row">入力とデータ</th><td>記事 1,000 件、コメント 0〜800 件の分布、本番と同じ索引</td><td>開発用の 10 件のデータでは差が出ない</td></tr>
              <tr><th scope="row">実行環境</th><td>Ruby 4.0.9、YJIT の有無、RAILS_ENV、CPU の割り当て、同時に動く処理</td><td>development と production でキャッシュや YJIT の設定が違う</td></tr>
              <tr><th scope="row">状態</th><td>予行の回数、クエリキャッシュ、GC の直後か</td><td>1回目だけ遅い結果を改善前の値として使ってしまう</td></tr>
              <tr><th scope="row">回数と集計</th><td>7回繰り返して中央値、最小と最大も記録、実行順を入れ替える</td><td>1回の値が偶然の揺れか差なのか判断できない</td></tr>
            </tbody>
          </table></div>
          <p>測る値は改善したいことに合わせます。Rails の応答を速くしたいなら経過時間ですが、その中身を分けるには CPU 時間と待ち時間を別に取ります。メモリーや GC を減らしたいなら割り当て数を数えます。割り当て数は同じコードと入力なら実行ごとにほぼ変わらないので、時間より小さな差を確かめやすい値です（次の節で確かめます）。</p>
          <p>実行環境のうち、Rails では RAILS_ENV の違いが大きく影響します。development ではコードの再読み込みのための確認が入り、Rails 8.1 の <code>load_defaults 8.1</code> は development と test で YJIT を有効にしません。<Ref n={13} /> 本番の性能を見積もるには、production と同じ設定で測ります。Ruby 4.0 では <code>benchmark</code> が標準添付の default gem から bundled gem に移ったため、Bundler を使うアプリケーションで <code>require "benchmark"</code> するには Gemfile に <code>gem "benchmark"</code> を書きます。<Ref n={10} /></p>
          <p>回数は結果の揺れを確かめられる数にします。この章の実験はほかの作業も動いている4コアのホストで、CPU を1つに制限した Docker のコンテナ（ruby:4.0、Ruby 4.0.9）を使いました。同じスクリプトでも経過時間は実行ごとに2倍以上変わることがあり、1回の値では判断できません。繰り返した値の中央値と、最小・最大を一緒に記録します。</p>
        </>
      ),
    },
    {
      id: "benchmark",
      title: "変更する条件を一つに絞る",
      body: (
        <>
          <p>単体ベンチマークでは同じ引数で同じ処理を繰り返したときの CPU 時間や経過時間を比較できます。以下は Ruby の <code>Benchmark</code> を使う例です。一方は配列の各要素を変換した配列を作った後で集計し、もう一方は要素の変換と集計を同時に行います。結果が一致することを測る前に確かめています。</p>
          <Code lang="ruby" title="bmbm.rb" code={`require "benchmark"

values = (1..10_000).to_a
raise unless values.map { |n| n * n }.sum == values.sum { |n| n * n }

Benchmark.bmbm do |bench|
  bench.report("map then sum") { 100.times { values.map { |n| n * n }.sum } }
  bench.report("sum with block") { 100.times { values.sum { |n| n * n } } }
end`} />
          <Code lang="text" title="実行結果（CPU を1つに制限したコンテナ、Ruby 4.0.9、YJIT なし、benchmark 0.5.0）" code={`Rehearsal --------------------------------------------------
map then sum     0.094788   0.000000   0.094788 (  0.107846)
sum with block   0.083065   0.000000   0.083065 (  0.085728)
----------------------------------------- total: 0.177853sec

                     user     system      total        real
map then sum     0.099047   0.000000   0.099047 (  0.121873)
sum with block   0.086423   0.000000   0.086423 (  0.129590)`} />
          <p><code>bmbm</code> は同じ処理を2回ずつ実行します。前半の Rehearsal は予行で、後半が本計測です。列の user はプロセスがユーザー空間で CPU を使った秒数、system はカーネルの処理に使った秒数、total はその合計、括弧の中の real が経過時間です。<Ref n={3} /> 本計測の user では sum with block の方が短いのに、real では逆になりました。real にはほかの処理が CPU を使っている間に待った時間が入るためです。CPU の計算量を比べたいときは user や total を、待ちも含めた体感の速さを比べたいときは real を使います。</p>
          <p>同じプロセスで動かすと、先に実行した処理がメモリーの状態に影響し得ます。この方法では予行と本計測が分かれますが、実行順や負荷などの影響がすべてなくなるわけではありません。Ruby のバージョン、JIT の有無、入力、試行回数、計測環境を記録し、処理順を逆にした試行などでも傾向を確認します。この例の結果から、Rails の応答全体がどれだけ速くなるかを見積もることはできません。</p>
          <h3>SQL の本数が同じでも Ruby 側の費用は変わる</h3>
          <p>記事の題名を一覧にする処理を <code>select(:title).map(&amp;:title)</code> と <code>pluck(:title)</code> で比べます。<code>select</code> では各行からモデルを作って題名を読み、<code>pluck</code> はモデルを作らずに列の値を取得します。<Ref n={5} /> <code>title</code> は標準の属性の読み取りメソッドです。</p>
          <p>Active Record 8.1.4.1 と sqlite3 gem 2.10.2 を利用できる Ruby 4.0.9 の環境で <code>ruby benchmark-ar.rb</code> を実行します。スクリプトはメモリー上に専用 DB を作り、1,000件の題名が順序も含めて一致することを確認します。クエリキャッシュを無効にした測定では、1試行に読み取りを10回実行します。両方式を7試行ずつ測り、先に測る方式は試行ごとに入れ替えます。経過時間は <code>Process.clock_gettime</code> の単調増加時計で、割り当て数は <code>GC.stat(:total_allocated_objects)</code> の差で測ります。<Ref n={6} /></p>
          <Code lang="ruby" title="benchmark-ar.rb" code={`require "active_record"

ActiveRecord::Base.establish_connection(adapter: "sqlite3", database: ":memory:")
ActiveRecord::Schema.verbose = false
ActiveRecord::Schema.define do
  create_table(:articles) { |table| table.string :title, null: false }
end

class Article < ActiveRecord::Base; end
Article.insert_all!(1_000.times.map { |n| { title: "Article #{n}" } })

workloads = {
  records: -> { Article.order(:id).select(:title).map(&:title) },
  values: -> { Article.order(:id).pluck(:title) }
}

def select_count(work)
  count = 0
  subscriber = ->(_name, _start, _finish, _id, payload) do
    count += 1 if payload[:sql].start_with?("SELECT") && !payload[:cached]
  end
  ActiveSupport::Notifications.subscribed(subscriber, "sql.active_record", &work)
  count
end

def measure(work)
  before = GC.stat(:total_allocated_objects)
  start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  10.times { work.call }
  elapsed_ms = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1_000
  [elapsed_ms, GC.stat(:total_allocated_objects) - before]
end

Article.uncached do
  results = workloads.values.map(&:call)
  raise "results differ" unless results[0].size == 1_000 && results[0] == results[1]

  samples = { records: [], values: [] }
  workloads.each { |name, work| puts "#{name}: SELECT=#{select_count(work)}" }
  7.times do |i|
    order = i.even? ? workloads.keys : workloads.keys.reverse
    order.each { |name| samples.fetch(name) << measure(workloads.fetch(name)) }
  end
  samples.each do |name, trials|
    times, allocations = trials.transpose
    printf "%s: median %.1f ms, median %d objects\\n",
           name, times.sort.fetch(3), allocations.sort.fetch(3)
  end
end`} />
          <Code lang="text" title="同じスクリプトを2回実行した結果（CPU を1つに制限したコンテナ、CRuby 4.0.9・JIT なし・SQLite 3.54.1）" code={`# 1回目（ホストの load average が 20 前後）
records: SELECT=1
values: SELECT=1
records: median 265.4 ms, median 90800 objects
values: median 36.5 ms, median 30740 objects

# 2回目
records: SELECT=1
values: SELECT=1
records: median 80.3 ms, median 90800 objects
values: median 19.2 ms, median 30740 objects`} />
          <Figure n={figure(2)} title="経過時間は実行ごとに変わり、割り当て数は変わらない" caption="上の2回の実行結果を並べたものです。経過時間はホストの混み具合で3倍以上変わりましたが、割り当て数は2回とも同じでした。">
            <VarianceFigure />
          </Figure>
          <p>SELECT の回数はどちらも1回でした。各行からモデルを作る方式は2回の実行のどちらでも経過時間が長く、割り当て数も約3倍でした。一方、経過時間そのものは1回目が 265.4 ms、2回目が 80.3 ms と大きく違います。ホストで動いていたほかの処理の量が違ったためで、時間の絶対値は環境の状態に強く左右されます。割り当て数は同じコードと入力では毎回同じなので、Ruby 側の仕事の量を比べる指標として扱いやすい値です。</p>
          <p>割り当て数は試行中に作ったオブジェクトの数です。処理後に残ったオブジェクト数やプロセスの常駐メモリーを確かめる場合は <ChapterLink n={97} section="diagnostics">GC の計測</ChapterLink>で扱う指標を別に測ります。経過時間には SQLite と Ruby の処理が含まれます。実際のページではモデル固有の処理が必要かを確かめ、DB やレスポンス生成を含めた条件で改めて測ります。</p>
        </>
      ),
    },
    {
      id: "ips",
      title: "benchmark-ips で1秒あたりの実行回数を比べる",
      body: (
        <>
          <p><code>Benchmark</code> では繰り返す回数（上の例では100回）を自分で決めます。処理が速すぎると計測の誤差に埋もれ、遅すぎると待ち時間が長くなります。benchmark-ips は決めた時間（既定は5秒）の間に処理を何回実行できたかを数え、1秒あたりの実行回数（iterations per second、i/s）とその標準偏差を表示する gem です。<Ref n={7} /> 回数を調整する必要が無く、比べた結果に誤差の範囲を付けて表示します。</p>
          <p>コメント1万件を記事ごとに数える3つの書き方を比べます。<code>Comment</code> は id と記事の id だけを持つ構造体で、乱数の種を固定して作ります。3つの結果が同じであることを測る前に確かめます。</p>
          <Code lang="ruby" title="ips.rb" code={`require "benchmark/ips"

Comment = Struct.new(:id, :article_id)
rng = Random.new(1)
comments = Array.new(10_000) { |i| Comment.new(i, rng.rand(1..1_000)) }

group = -> { comments.group_by(&:article_id).transform_values(&:size) }
tally = -> { comments.map(&:article_id).tally }
count = -> { comments.each_with_object(Hash.new(0)) { |c, h| h[c.article_id] += 1 } }
raise "results differ" unless [group, tally, count].map(&:call).uniq.size == 1

Benchmark.ips do |x|
  x.config(warmup: 2, time: 5)
  x.report("group_by + size") { group.call }
  x.report("map + tally") { tally.call }
  x.report("each_with_object") { count.call }
  x.compare!
end`} />
          <Code lang="text" title="実行結果（CPU を1つに制限したコンテナ、Ruby 4.0.9、benchmark-ips 2.15.1）" code={`ruby 4.0.9 (2026-10-23 revision 3e93b23afc) +PRISM [x86_64-linux]
Warming up --------------------------------------
     group_by + size    46.000 i/100ms
         map + tally    47.000 i/100ms
    each_with_object    11.000 i/100ms
Calculating -------------------------------------
     group_by + size    549.773 (±12.0%) i/s    (1.82 ms/i) -      2.760k in   5.020250s
         map + tally    476.034 (±41.8%) i/s    (2.10 ms/i) -      2.397k in   5.035358s
    each_with_object    276.585 (±40.9%) i/s    (3.62 ms/i) -      1.386k in   5.011113s

Comparison:
 group_by + size:      549.8 i/s
     map + tally:      476.0 i/s - same-ish: difference falls within error
each_with_object:      276.6 i/s - 1.99x  slower`} />
          <p>Warming up の段は2秒間の予行で、100 ms あたりに実行できた回数（i/100ms）から、本計測で何回実行するかの目安を決めます。Calculating の段が5秒間の本計測です。<code>549.773 (±12.0%) i/s</code> は1秒あたり約550回で、括弧の中は標準偏差の割合です。<code>(1.82 ms/i)</code> は1回あたりの時間です。</p>
          <p>Comparison の段では最も速い書き方に対する倍率を示します。map + tally は group_by + size より数字の上では遅いものの、<code>same-ish: difference falls within error</code>（差が誤差の範囲内）と表示されました。benchmark-ips は2つの結果で誤差の範囲が重なるとき、この表示にします。この実行では ±41.8% と揺れが大きく、差があるとは言えません。each_with_object は 1.99 倍遅いと表示されましたが、こちらも ±40.9% の揺れがあります。揺れが大きいときは、ほかの処理を止める、実行時間を延ばす、何度か実行して同じ順位になるかを見る、のいずれかで確かめてから結論を出します。</p>
          <p>benchmark-ips が向いているのは、数行のコードの書き方を比べる場合です。1回の実行が数百 ms を超える処理や、DB の状態が実行ごとに変わる処理では、1秒あたりの回数が少なくなり、標準偏差の推定も不安定になります。その場合は前の節のように回数を決めて <code>Benchmark</code> や単調増加時計で測ります。</p>
        </>
      ),
    },
    {
      id: "warmup",
      title: "ウォームアップ・GC・キャッシュの影響",
      body: (
        <>
          <p>同じ処理でも、1回目と2回目以降で時間が大きく違うことがあります。1回目にはクラスの読み込み、テーブルの列の情報の取得、SQL の準備、メソッドの探索結果のキャッシュの作成などが含まれるためです。この準備を済ませるために本計測の前に実行することを<Term en="warm-up">ウォームアップ</Term>（予行）と呼びます。GC とキャッシュも測る時点の状態によって結果を変えます。次のスクリプトで3つの影響を確かめます。</p>
          <Code lang="ruby" title="warmup.rb" code={`require "active_record"

ActiveRecord::Base.establish_connection(adapter: "sqlite3", database: ":memory:")
db = ActiveRecord::Base.connection
db.execute("CREATE TABLE articles (id INTEGER PRIMARY KEY, title TEXT NOT NULL)")
db.execute("WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 1000) INSERT INTO articles (title) SELECT 'Article ' || i FROM n")
class Article < ActiveRecord::Base; end

def ms
  t = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  yield
  (Process.clock_gettime(Process::CLOCK_MONOTONIC) - t) * 1_000
end

puts "== 1. 同じ処理の1回目と2回目以降"
5.times { |i| printf "%d回目: %6.2f ms\\n", i + 1, ms { Article.find(1) } }

puts "== 2. GC の回数と時間"
titles = Article.pluck(:title)
work = -> { 300.times { titles.map(&:upcase) } }
[false, true].each do |gc_first|
  rows = 5.times.map do
    GC.start if gc_first
    count, time, pages = GC.count, GC.total_time, GC.stat(:heap_allocated_pages)
    elapsed = ms(&work)
    [elapsed, GC.count - count, (GC.total_time - time) / 1e6, GC.stat(:heap_allocated_pages) - pages]
  end
  puts gc_first ? "毎回 GC.start してから測る:" : "そのまま続けて測る:"
  rows.each { |e, c, t, pg| printf "  経過 %6.2f ms  GC %2d 回  GC の時間 %5.2f ms  増えたヒープのページ %d\\n", e, c, t, pg }
end

puts "== 3. クエリキャッシュ"
ActiveSupport::Notifications.subscribe("sql.active_record") do |event|
  next unless event.payload[:sql].include?("articles")
  printf "  %-5s %.3f ms  cached=%s\\n", event.payload[:name] || "SQL", event.duration, event.payload[:cached].inspect
end
ActiveRecord::Base.cache do
  2.times { Article.where(id: 1..100).to_a }
end`} />
          <Code lang="text" title="実行結果（CPU を1つに制限したコンテナ、Ruby 4.0.9・Active Record 8.1.4.1）" code={`== 1. 同じ処理の1回目と2回目以降
1回目:  24.01 ms
2回目:   0.32 ms
3回目:   0.13 ms
4回目:   0.07 ms
5回目:   0.07 ms
== 2. GC の回数と時間
そのまま続けて測る:
  経過 134.29 ms  GC 12 回  GC の時間 30.30 ms  増えたヒープのページ 25
  経過 113.05 ms  GC 13 回  GC の時間 14.62 ms  増えたヒープのページ 0
  経過 116.38 ms  GC 13 回  GC の時間 15.12 ms  増えたヒープのページ 0
  経過 129.43 ms  GC 12 回  GC の時間 13.65 ms  増えたヒープのページ 0
  経過 103.19 ms  GC 13 回  GC の時間 13.99 ms  増えたヒープのページ 0
毎回 GC.start してから測る:
  経過 111.41 ms  GC 12 回  GC の時間 14.29 ms  増えたヒープのページ 0
  経過 118.49 ms  GC 12 回  GC の時間 13.16 ms  増えたヒープのページ 0
  経過 185.55 ms  GC 12 回  GC の時間 14.43 ms  増えたヒープのページ 0
  経過 185.14 ms  GC 12 回  GC の時間 15.07 ms  増えたヒープのページ 0
  経過 214.03 ms  GC 12 回  GC の時間 18.44 ms  増えたヒープのページ 0
== 3. クエリキャッシュ
  Article Load 0.800 ms  cached=nil
  Article Load 0.021 ms  cached=true`} />
          <p>1つ目では <code>Article.find(1)</code> の1回目が 24.01 ms、4回目以降は 0.07 ms でした。1回目にはテーブルの列の情報を DB から読んでモデルの属性を定義する処理などが入っています。改善前に1回目だけを測り、改善後に準備済みの状態で測ると、改修と無関係な差が出ます。逆に、デプロイ直後の最初の要求を速くしたい場合は、準備済みの状態だけを測っても目的を確かめられません。</p>
          <p>2つ目では1回目の試行だけ GC の時間が 30.30 ms と、2回目以降の約2倍でした。この試行でヒープのページが 25 増えています。Ruby のヒープが必要な大きさまで広がるまでは、GC が多く働きます。2回目以降は GC の回数も時間もほぼ同じなのに、経過時間は 103〜214 ms と変わりました。<code>GC.start</code> の有無ではなく、ホストのほかの処理の影響です。GC の影響を比べたいときは、経過時間と一緒に GC の回数と時間を記録すると、時間の差が GC によるものかを切り分けられます。GC の仕組みは <ChapterLink n={97} section="gc" /> で扱います。</p>
          <p>3つ目では <code>ActiveRecord::Base.cache</code> のブロックの中で同じ SQL を2回実行しました。2回目は <code>cached=true</code> で、DB に問い合わせずに結果を返しています。Rails の要求の中では、クエリキャッシュが既定で有効です。同じ処理を要求の中で繰り返すベンチマークでは、2回目以降が DB の時間を含まなくなります。<code>benchmark-ar.rb</code> で <code>Article.uncached</code> を使ったのはこのためです。</p>
          <h3>YJIT の準備</h3>
          <p>YJIT は実行中によく呼ばれる Ruby のコードを機械語に変換する JIT コンパイラーです。変換は実行中に行うので、JIT を有効にしたときの計測では、変換が済む前と後で時間が変わります。再帰でフィボナッチ数を求める <code>fib(27)</code> を10回呼び、YJIT なしとありで比べました。</p>
          <Code lang="ruby" title="yjit.rb（ruby yjit.rb と ruby --yjit yjit.rb で実行）" code={`def fib(n) = n < 2 ? n : fib(n - 1) + fib(n - 2)

times = 10.times.map do
  t = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  fib(27)
  (Process.clock_gettime(Process::CLOCK_MONOTONIC) - t) * 1_000
end
puts "YJIT=#{RubyVM::YJIT.enabled?}: #{times.map { |t| format('%.0f', t) }.join(' ')} ms"`} />
          <Code lang="text" title="実行結果（CPU を1つに制限したコンテナ、Ruby 4.0.9）" code={`YJIT=false: 42 45 42 41 40 40 44 42 40 40 ms
YJIT=true: 7 4 3 4 6 15 8 15 3 4 ms`} />
          <Figure n={figure(3)} title="1回目の遅さと YJIT の準備" caption="上の2つの実行結果を描いた図です。左は縦軸を対数にしています。右の YJIT ありの 15 ms はほかの処理の影響と考えられる揺れです。">
            <WarmupFigure />
          </Figure>
          <p>YJIT ありの1回目は 7 ms で、その後の多くは 3〜4 ms でした。1回目の中で変換が進んでいます。この計算は Ruby のメソッド呼び出しを大量に行う処理なので差が大きく出ていますが、DB の待ちが多い Rails の要求では差は小さくなります。YJIT の効果を見積もるときも、ウォームアップの後の値と、起動直後の値を分けて記録します。</p>
        </>
      ),
    },
    {
      id: "profile",
      title: "CPU・経過時間・割り当てを見る",
      body: (
        <>
          <p>サンプリング型のプロファイラーは、実行中のスタックを一定の間隔などで採取します。スタックは、その時点で実行しているメソッドと呼び出し元の並びです。同じスタックが多数のサンプルに現れれば、計測した条件ではその経路に時間を使った可能性があります。個々のメソッドの呼び出し回数をすべて記録した結果とは異なります。</p>
          <p>StackProf には CPU 時間で採取する <code>:cpu</code>、経過時間で採取する <code>:wall</code>、オブジェクトの割り当てで採取する <code>:object</code> のモードがあります。<Ref n={2} /> Ruby の計算が長い場合は <code>:cpu</code> が候補です。接続先を待つ時間も含めて調べたいときは <code>:wall</code> を使います。大量に一時オブジェクトを作っていると見られる処理では、どこで割り当てが起きたかを <code>:object</code> で調べます。アプリケーションの外で発生する待ちは、接続先側の観測値も使って切り分けます。</p>
          <h3>stackprof で CPU を使ったメソッドを探す</h3>
          <p>コメント 2,000 件を JSON にする処理を用意します。本文から HTML のタグを取り除く <code>strip_tags</code> と、日時を整形する <code>format_time</code> を各コメントに適用します。</p>
          <Code lang="ruby" title="render.rb" code={`require "json"
require "time"

Comment = Struct.new(:id, :body, :created_at)
COMMENTS = Array.new(2_000) do |i|
  Comment.new(i, "<p>コメント #{i} です。<b>Ruby</b> の話</p>" * 5, Time.at(1_700_000_000 + i * 60))
end

def strip_tags(html) = html.gsub(/<[^>]+>/, "")
def format_time(time) = time.strftime("%Y年%m月%d日 %H:%M")
def serialize(comment)
  { id: comment.id, body: strip_tags(comment.body), created_at: format_time(comment.created_at) }
end
def render_comments(comments) = JSON.generate(comments.map { |c| serialize(c) })`} />
          <Code lang="ruby" title="stackprof_cpu.rb" code={`require "stackprof"
require_relative "render"

render_comments(COMMENTS) # 予行
profile = StackProf.run(mode: :cpu, interval: 500, raw: true) do
  100.times { render_comments(COMMENTS) }
end
File.binwrite("stackprof-cpu.dump", Marshal.dump(profile))
StackProf::Report.new(profile).print_text(false, 8)`} />
          <Code lang="text" title="実行結果（CPU を1つに制限したコンテナ、Ruby 4.0.9、stackprof 0.2.28）" code={`==================================
  Mode: cpu(500)
  Samples: 244 (0.00% miss rate)
  GC: 28 (11.48%)
==================================
     TOTAL    (pct)     SAMPLES    (pct)     FRAME
       169  (69.3%)         169  (69.3%)     String#gsub
        22   (9.0%)          22   (9.0%)     Time#strftime
        16   (6.6%)          16   (6.6%)     (sweeping)
        13   (5.3%)          13   (5.3%)     JSON::Ext::Generator::State.generate
        12   (4.9%)          12   (4.9%)     (marking)
       202  (82.8%)           6   (2.5%)     Object#serialize
       173  (70.9%)           4   (1.6%)     Object#strip_tags
       216  (88.5%)           1   (0.4%)     Object#render_comments`} />
          <p><code>interval: 500</code> は CPU 時間 500 マイクロ秒ごとにスタックを採取する指定で、244 個のサンプルが集まりました。SAMPLES はそのメソッドがスタックの一番上にいた（そのメソッド自身が CPU を使っていた）回数、TOTAL はスタックのどこかにいた（そこから呼んだ処理も含む）回数です。<code>String#gsub</code> は SAMPLES と TOTAL がどちらも 169 で、全体の 69.3% です。<code>Object#serialize</code> は TOTAL が 202 でも SAMPLES は 6 で、時間の大部分は呼び出した先で使っています。GC の 28 サンプル（11.48%）は GC の処理中に採取したサンプルです。</p>
          <p>この結果から、改修の候補は <code>strip_tags</code> の <code>gsub</code> だと分かります。<code>format_time</code>（<code>Time#strftime</code> の 22 サンプル）を速くしても、全体の約9% にしか効きません（<ChapterLink n={111} section="amdahl" />）。</p>
          <h3>フレームグラフの読み方</h3>
          <p><code>raw: true</code> を付けて採取すると、サンプルごとのスタックが残り、<Term en="flame graph">フレームグラフ</Term>を描けます。stackprof では <code>stackprof --d3-flamegraph stackprof-cpu.dump &gt; flamegraph.html</code> でブラウザーで見られる HTML を作れます。<Ref n={2} /> 次の図は同じ 244 サンプルを集計して描いたものです。</p>
          <Figure n={figure(4)} title="stackprof の CPU プロファイルのフレームグラフ" caption="上の実行の raw のデータを print_stackcollapse で集計して描いた図です。最下段の5つのフレーム（<main>、StackProf.run、ブロック、Integer#times、ブロック）は1つにまとめています。">
            <FlameGraphFigure />
          </Figure>
          <p>フレームグラフは、下の段が呼び出し元、上の段が呼び出し先で、箱の横幅がサンプル数を表します。読むときは次の順に見ます。まず、幅の広い箱をたどって上へ進みます。この図では render_comments → map のブロック → serialize → strip_tags → gsub です。次に、箱の上に何も載っていない部分を探します。その部分が、そのメソッド自身が CPU を使った時間です。gsub は上に何も無く、幅いっぱいが自身の時間です。serialize の右端の上には何も載っていない部分（6 サンプル）があり、これが serialize 自身の時間です。左右の並びは時刻の順ではなく、同じ呼び出し元の中でまとめて並べたものです。</p>
          <p>プロファイルを採取する処理自体が実行時間に影響することもあります。必要な範囲と期間だけで採取し、結果を比べる条件をそろえます。サンプリングは一定間隔で採るので、間隔より短い処理は現れなかったり、現れる回数が実際の時間の割合とずれたりします。結論を出す前に、サンプル数が十分か（この例では 244）を確かめます。</p>
          <h3>vernier で GVL と GC の待ちも記録する</h3>
          <p>vernier は Ruby 3.3 以降で使えるサンプリング型のプロファイラーで、複数のスレッド、GVL の取得待ち、GC の停止、待機の時間も記録します。<Ref n={9} /> 結果は JSON で保存し、Firefox Profiler をもとにした vernier.prof などの画面で、フレームグラフや時刻順のスタックを見ます。同じ <code>render_comments</code> を記録しました。</p>
          <Code lang="ruby" title="vernier_run.rb" code={`require "vernier"
require "json"
require_relative "render"

render_comments(COMMENTS) # 予行
Vernier.profile(out: "vernier.json") do
  100.times { render_comments(COMMENTS) }
end
data = JSON.parse(File.read("vernier.json"))
thread = data.fetch("threads").first
puts "形式: #{data.dig("meta", "product")}  スレッド数: #{data["threads"].size}  サンプル数: #{thread.dig("samples", "length")}"
puts "記録したマーカーの種類: #{thread.dig("stringArray").grep(/GVL|GC/).uniq.first(6).join(", ")}"`} />
          <Code lang="text" title="実行結果（Ruby 4.0.9、vernier 1.12.0。出力の vernier.json は 79 KB）" code={`形式: Ruby/Vernier  スレッド数: 1  サンプル数: 1622
記録したマーカーの種類: GC end sweeping, GC pause, GC start, GC end marking`} />
          <p>vernier は既定で経過時間に基づいて採取するので、stackprof の <code>:cpu</code> より多い 1,622 サンプルになりました。GC の開始と停止がマーカーとして記録されており、画面ではサンプルと同じ時間軸に並びます。Puma のように複数のスレッドが動くプロセスで、あるスレッドが GVL を待っていた時間を調べたいときは vernier が向いています。1つのスレッドで CPU を使っている場所を探すだけなら、stackprof の出力の方が短く読めます。</p>
        </>
      ),
    },
    {
      id: "memory",
      title: "memory_profiler で割り当てを数える",
      body: (
        <>
          <p>前の節までで、select + map は pluck の約3倍のオブジェクトを作ることが分かりました。どのクラスのオブジェクトを、どの行で作ったかは memory_profiler で調べられます。memory_profiler はブロックの実行中に作られたオブジェクトを記録し、割り当て（allocated）と、ブロックの終了後も残っているもの（retained）を、gem・ファイル・行・クラスごとに集計します。<Ref n={8} /></p>
          <Code lang="ruby" title="memory.rb" code={`require "active_record"
require "memory_profiler"

ActiveRecord::Base.establish_connection(adapter: "sqlite3", database: ":memory:")
ActiveRecord::Schema.verbose = false
ActiveRecord::Schema.define { create_table(:articles) { |t| t.string :title, null: false } }
class Article < ActiveRecord::Base; end
Article.insert_all!(1_000.times.map { |n| { title: "Article #{n}" } })

work = {
  "select + map" => -> { Article.order(:id).select(:title).map(&:title) },
  "pluck" => -> { Article.order(:id).pluck(:title) },
}
work.each_value(&:call) # 予行

Article.uncached do
  work.each do |name, job|
    report = MemoryProfiler.report { job.call }
    printf "== %s: 割り当て %d 個（%.1f KB）、残った %d 個\\n", name,
           report.total_allocated, report.total_allocated_memsize / 1024.0, report.total_retained
    report.allocated_objects_by_class.first(4).each { |row| printf "   %-28s %6d\\n", row[:data], row[:count] }
  end
  puts "== pluck の詳細（allocated objects by location の上位3件）"
  report = MemoryProfiler.report { work.fetch("pluck").call }
  report.allocated_objects_by_location.first(3).each do |row|
    printf "   %6d  %s\\n", row[:count], row[:data].sub(%r{\\A/usr/local/bundle/gems/}, "")
  end
end`} />
          <Code lang="text" title="実行結果（Ruby 4.0.9、Active Record 8.1.4.1、memory_profiler 1.1.0）" code={`== select + map: 割り当て 9064 個（1058.9 KB）、残った 0 個
   Hash                           3009
   String                         2003
   Array                          1038
   ActiveModel::LazyAttributeSet   1000
== pluck: 割り当て 3058 個（140.5 KB）、残った 0 個
   String                         2003
   Array                          1035
   Hash                              5
   ActiveRecord::Relation            3
== pluck の詳細（allocated objects by location の上位3件）
     2000  sqlite3-2.10.2-x86_64-linux-gnu/lib/sqlite3/statement.rb:159
     1000  activemodel-8.1.4.1/lib/active_model/type/string.rb:39
        2  activerecord-8.1.4.1/lib/active_record/connection_adapters/sqlite3/database_statements.rb:123`} />
          <Figure n={figure(5)} title="1回の読み取りで作ったオブジェクトのクラス別の数" caption="上の実行結果を描いた図です。その他は表示した上位4クラス以外の合計です。">
            <AllocationFigure />
          </Figure>
          <p>1回の読み取りで、select + map は 9,064 個、pluck は 3,058 個のオブジェクトを作りました。<code>benchmark-ar.rb</code> で10回分として測った 90,800 個と 30,740 個の約10分の1で、2つの方法の結果が合っています。差の大部分は Hash と <code>ActiveModel::LazyAttributeSet</code> で、モデルを1行ごとに作るときに属性を入れる入れ物です。メモリーの量では 1,058.9 KB と 140.5 KB で、約7.5倍の差があります。</p>
          <p>pluck でも行ごとに3つのオブジェクトを作っています。場所で見ると、sqlite3 gem の <code>statement.rb</code> の159行目（<code>val = step</code>。1行分の値を配列と文字列で受け取る）で 2,000 個、Active Model の <code>type/string.rb</code> の39行目（<code>::String.new(value)</code>。文字列の型変換で複製を作る）で 1,000 個です。これ以上減らすには取得する行や列を減らす方法を考えます。</p>
          <p>retained（残った）はどちらも 0 個でした。ブロックが返した配列は呼び出し元で使われずに捨てられるためです。retained が多い場合は、キャッシュやクラス変数などに参照が残っている可能性があり、メモリーが増え続ける原因を調べる手掛かりになります。memory_profiler はすべての割り当てを記録するため、実行時間が数倍以上に延びます。本番の要求に常時かけるのではなく、開発環境で特定の処理を調べるときに使います。Ruby の割り当てと保持の測り方は <ChapterLink n={97} section="diagnostics" /> にあります。</p>
        </>
      ),
    },
    {
      id: "notifications",
      title: "ActiveSupport::Notifications で区間の時間を取る",
      body: (
        <>
          <p>プロファイラーはメソッド単位で時間を示しますが、アプリケーションでは「記事を読む」「外部に送る」のような業務上の区間ごとに時間を知りたいことがあります。Active Support は、アクションや SQL などで計測イベントを発行します。自分のコードでも <code>ActiveSupport::Notifications.instrument</code> で区間に名前を付けてイベントを発行し、<code>subscribe</code> で受け取れます。<Ref n={1} /> 仕組みの説明と Rails が発行するイベントの一覧は <ChapterLink n={22} section="notifications" /> にあります。ここでは、受け取ったイベントから何を読めるかを確かめます。</p>
          <p>Rails 8.1 のイベント（<code>ActiveSupport::Notifications::Event</code>）は、経過時間の <code>duration</code> のほかに、そのスレッドの CPU 時間の <code>cpu_time</code>、経過時間から CPU 時間を引いた <code>idle_time</code>、割り当て数の <code>allocations</code>、GC の時間の <code>gc_time</code> を持ちます。<Ref n={11} /> 次のスクリプトは題名を読み、外部への送信を待ち、JSON にする3つの区間を、全体を表す <code>export.demo</code> の中で発行します。外部への送信は 50 ms の <code>sleep</code> で代わりにしています。</p>
          <Code lang="ruby" title="notify.rb" code={`require "active_record"
require "json"

ActiveRecord::Base.establish_connection(adapter: "sqlite3", database: ":memory:")
ActiveRecord::Schema.verbose = false
ActiveRecord::Schema.define { create_table(:articles) { |t| t.string :title, null: false } }
class Article < ActiveRecord::Base; end
Article.insert_all!(1_000.times.map { |n| { title: "Article #{n}" } })

# 自分のコードの区間に名前を付けて、イベントを発行する
def export_titles
  ActiveSupport::Notifications.instrument("export.demo", format: "json") do
    titles = ActiveSupport::Notifications.instrument("load.demo") { Article.order(:id).pluck(:title) }
    ActiveSupport::Notifications.instrument("upload.demo") { sleep 0.05 } # 外部への送信を待つ代わり
    ActiveSupport::Notifications.instrument("encode.demo") { JSON.generate(titles.map { |t| { title: t.upcase } }) }
  end
end

export_titles # 予行
ActiveSupport::Notifications.subscribe(/\\.demo\\z|\\Asql\\.active_record\\z/) do |event|
  printf "%-18s 経過 %6.2f ms  CPU %5.2f ms  待ち %5.2f ms  割り当て %5d  GC %4.2f ms\\n",
         event.name, event.duration, event.cpu_time, event.idle_time, event.allocations, event.gc_time
end
export_titles`} />
          <Code lang="text" title="実行結果（CPU を1つに制限したコンテナ、Ruby 4.0.9、Active Support 8.1.4.1。3回実行した3回目）" code={`sql.active_record  経過   0.55 ms  CPU  0.55 ms  待ち  0.00 ms  割り当て  2010  GC 0.00 ms
load.demo          経過   1.52 ms  CPU  1.51 ms  待ち  0.00 ms  割り当て  3124  GC 0.00 ms
upload.demo        経過  50.12 ms  CPU  0.06 ms  待ち 50.06 ms  割り当て     0  GC 0.00 ms
encode.demo        経過   0.60 ms  CPU  0.60 ms  待ち  0.00 ms  割り当て  3002  GC 0.00 ms
export.demo        経過  52.50 ms  CPU  2.45 ms  待ち 50.06 ms  割り当て  6219  GC 0.00 ms`} />
          <Figure n={figure(6)} title="入れ子のイベントと待ち時間" caption="上の実行結果を時間の順に描いた図です。イベントは終わった順に通知されるので、出力では内側のイベントが先に並びます。">
            <EventsFigure />
          </Figure>
          <p>イベントは区間が終わった順に通知されます。そのため、内側の <code>sql.active_record</code> が <code>load.demo</code> より先に、外側の <code>export.demo</code> が最後に出ました。外側のイベントの値は内側の値を含みます。<code>export.demo</code> の割り当て 6,219 は <code>load.demo</code> の 3,124 と <code>encode.demo</code> の 3,002 などの合計です。全体を求めるために、入れ子のイベントの値を足してはいけません。</p>
          <p><code>upload.demo</code> は経過 50.12 ms のうち CPU 時間が 0.06 ms で、ほぼすべてが待ち時間です。この区間を速くするには、Ruby のコードではなく送信先の応答時間や送り方を変える必要があります。待ち時間を測るときに使う <code>idle_time</code> は、CPU を待っていた時間（ほかのスレッドが GVL を持っていた時間や、ホストの CPU が混んでいた時間）も含みます。同じスクリプトを最初に実行したときは、<code>load.demo</code> の待ち時間が 49 ms と出ました。I/O を待った時間と CPU を待った時間はこの値だけでは区別できないので、何回か実行して確かめます。</p>
          <p>一時的に購読したい場合は <code>ActiveSupport::Notifications.subscribed</code> を使います。<code>benchmark-ar.rb</code> の <code>select_count</code> は、ブロックを実行する間だけ <code>sql.active_record</code> を購読して SELECT の回数を数えています。<code>sql.active_record</code> のペイロードにはキャッシュから応答した SQL（<code>cached: true</code>）やスキーマの問い合わせ（<code>name: "SCHEMA"</code>）も含まれるので、数える目的に合わせて除外します。購読している間は同じプロセスのほかのスレッドが発行したイベントも受け取ります。区間の時間をログに出したり監視サービスに送ったりする方法は <ChapterLink n={89} section="apply" /> で扱います。</p>
        </>
      ),
    },
    {
      id: "reading-results",
      title: "計測値から次に調べる場所を決める",
      body: (
        <>
          <p>計測例として、一覧の応答に 300 ミリ秒かかり、その間に 180 ミリ秒が SQL の計測イベントに含まれるとします。イベントを調べると、同じ形の短い問い合わせが数十回ある場合と、一つの問い合わせに時間の大半を使う場合があります。前者では Active Record の関連をまとめて読む方法を、後者では実行計画やデータの分布を調べます。合計時間は同じでも、選ぶ改修は異なります。</p>
          <p>この例で SQL 以外に 120 ミリ秒かかったとは、区間が互いに重複せず、同じ要求の中で計測した場合に限っていえます。別のスレッドが行った処理や、SQL の子イベントの結果を合算している場合は、重なった箇所を取り除きます。残った時間の中にレンダリング、接続待ち、外部サービスとの通信が含まれる場合は、さらに区間を測ります。</p>
          <p>残った 120 ミリ秒の CPU 時間が長ければ、その区間を stackprof の <code>:cpu</code> で調べます。CPU 時間が短く待ち時間が長ければ、<code>:wall</code> や vernier で何を待っているかを調べます。割り当て数が多く GC の時間も長ければ、memory_profiler で割り当ての多い行を探します。前の節の <code>cpu_time</code>・<code>idle_time</code>・<code>allocations</code>・<code>gc_time</code> は、次にどの道具を使うかを決める材料になります。</p>
          <p>初回の実行だけが遅い場合は、Ruby の定数の読み込み、DB への接続、各層のキャッシュの準備が原因の場合があります。通常時の比較で事前の実行を行うなら、その回数や条件も記録します。デプロイ直後の応答を改善したい場合は、準備済みの状態だけを測っても目的を達成したか分かりません。</p>
        </>
      ),
    },
    {
      id: "tools",
      title: "rack-mini-profiler と本番の APM",
      body: (
        <>
          <p>ここまでの道具はスクリプトやコンソールで特定の処理を調べるものでした。画面を開いたときの内訳をその場で見るには rack-mini-profiler を使います。rack-mini-profiler は Rack のミドルウェアとして要求の処理時間と SQL を記録し、HTML のページの隅に内訳を表示します。<code>?pp=flamegraph</code> を URL に付けると stackprof を使ってフレームグラフを、<code>?pp=profile-memory</code> を付けると memory_profiler を使って割り当てを表示します。<Ref n={12} /> 導入の手順と、Bullet などの調査用の gem との使い分けは <ChapterLink n={28} section="profiling" /> で扱っています。</p>
          <p>本番環境では開発環境と違ってデータの量、同時に届く要求、キャッシュの状態が実際の値になります。本番で遅い要求を調べるには、APM（Application Performance Monitoring）のサービスを使うのが一般的です。New Relic、Datadog、Skylight などの Ruby のエージェントは、Rails が発行する計測イベントを購読して、要求ごとの区間の時間を集め、エンドポイントごとの件数・失敗・応答時間の分布を表示します（<ChapterLink n={22} section="notifications" />）。サービスによっては、要求の一部を抽出してスタックのサンプリングも行います。</p>
          <p>APM を使うときは、次の点を事前に確かめます。1つ目は費用と負荷で、エージェントは要求ごとに処理を加え、送信するデータの量に応じて料金がかかります。2つ目はデータの扱いで、SQL の文やパラメーターに個人情報が含まれる場合、送る前に伏せる設定が要ります。3つ目は抽出で、すべての要求を記録しない設定では、まれな遅い要求が記録に残らないことがあります。OpenTelemetry のような共通の形式でトレースを送る方法は <ChapterLink n={89} /> で扱います。</p>
          <div className="table-wrap"><table>
            <caption>道具ごとの用途と、使う環境</caption>
            <thead><tr><th scope="col">道具</th><th scope="col">分かること</th><th scope="col">使う環境</th><th scope="col">実行への負荷</th></tr></thead>
            <tbody>
              <tr><th scope="row">APM</th><td>どの要求が、いつ、どれだけ遅いか</td><td>本番</td><td>小〜中（抽出の設定による）</td></tr>
              <tr><th scope="row">ActiveSupport::Notifications</th><td>名前を付けた区間の時間・CPU・割り当て</td><td>本番・開発</td><td>小（購読する処理による）</td></tr>
              <tr><th scope="row">rack-mini-profiler</th><td>画面1つ分の区間と SQL、必要に応じてフレームグラフ</td><td>開発・検証</td><td>中</td></tr>
              <tr><th scope="row">stackprof・vernier</th><td>時間を使ったメソッド</td><td>開発・検証（本番は限定して）</td><td>小〜中（採取の間隔による）</td></tr>
              <tr><th scope="row">memory_profiler</th><td>割り当てと保持の場所・クラス</td><td>開発</td><td>大</td></tr>
              <tr><th scope="row">Benchmark・benchmark-ips</th><td>2つの書き方の速さの差</td><td>開発・検証</td><td>計測専用</td></tr>
            </tbody>
          </table></div>
          <p>表の負荷の欄は本書での目安です。実際の負荷はアプリケーションと設定で変わるので、本番で新しい道具を有効にするときは、有効にする前後で応答時間と CPU 使用率を比べます。</p>
        </>
      ),
    },
    {
      id: "load",
      title: "HTTP の計測と SQL の実行計画を使い分ける",
      body: (
        <>
          <p>SQL の改善では、テーブルの件数や値の分布をそろえて実行計画を見ます。MySQL の <code>EXPLAIN</code> はオプティマイザーが選んだ計画を表示し、 <code>EXPLAIN ANALYZE</code> は文を実際に実行して時間や行数などを示します。<Ref n={4} /> 実行する文の影響と負荷を確認し、調査用のデータで確かめます。実行計画の読み方は <ChapterLink n={37} /> で扱います。</p>
          <p>アプリ全体の負荷試験では、到着率、同時接続数、要求の種類と割合、試行時間を指定します。少しずつ負荷を上げると、待ちが増え始める条件を確認できます。前の応答が返るまで次の要求を送らない試験では、サーバーが遅くなると試験から届く要求数も減ります。利用者の到着数がサーバー応答と独立している状態を再現したい場合は、到着率を指定できる方法も使います。</p>
          <Figure n={figure(7)} title="前の応答を待って送る試験と、到着の間隔を決めて送る試験" caption="模式図です。1つの送り手が 50 ms ごとに送る場合を描いています。前の応答を待つ方式では、サーバーが遅くなると送る数が減るので、待ち時間の増え方が実際より小さく見えます。">
            <LoadModelFigure />
          </Figure>
          <p>図 {figure(7)} の上の方式はテストの送り手の数だけ同時に要求が存在する状態を作ります。サーバーが遅くなると送る数も減るので、サーバーの前に要求が並ぶ状態を作れません。下の方式は、利用者がサーバーの状態と関係なく到着する本番の状態に近く、<ChapterLink n={111} section="queueing" /> で見た待ち行列の伸びを再現できます。どちらの方式で測ったかを、結果と一緒に記録します。Rails ガイドは、負荷試験には自作のスクリプトではなく負荷試験用のプログラムを使い、本番と同等のハードウェアで、ウォームアップの要求を含めて測ることを勧めています。<Ref n={14} /> Puma の設定を変えて負荷をかける実験は <ChapterLink n={113} section="verify" /> で扱います。</p>
          <p>前の応答を待って次を送る方式を<Term en="closed-loop">閉ループ</Term>、応答と関係なく決めた間隔で送る方式を<Term en="open-loop">開ループ</Term>と呼びます。図 {figure(8)} では2つの方式を切り替えて、同じようにサーバーが遅くなったときの記録を比べられます。閉ループでは遅くなった後に送る要求が減り、応答時間は処理時間と同じ値のままです。開ループでは届く要求の数は変わらず、処理時間が送る間隔の 50 ms を超えると、後に届いた要求ほど長く待ちます。閉ループの記録だけを見ると、到着が減ったことに気付かず、応答時間の悪化を小さく見積もります。</p>
          <LoadModeSim />
        </>
      ),
    },
    {
      id: "record",
      title: "計測結果の記録と、判断基準・トレードオフ",
      body: (
        <>
          <p>計測の結果は後で同じ条件で測り直せる形で残します。プルリクエストや作業記録に、次の項目を書きます。数値だけを貼ると、半年後に見直したとき、その値がどの条件のものか分からなくなります。</p>
          <Code lang="text" title="計測の記録の例（この章の pluck の比較）" code={`目的: 記事の題名一覧で、モデルを作らない方式の効果を確かめる
仮説: select + map を pluck にすると、割り当て数と経過時間が減る
対象: Article.order(:id).select(:title).map(&:title) → .pluck(:title)
データ: 記事 1,000 件（SQLite のメモリー上の DB）、題名はすべて一致することを確認
環境: ruby:4.0 コンテナ、CPU 1つに制限、Ruby 4.0.9、YJIT なし、Active Record 8.1.4.1
状態: 予行 1回、クエリキャッシュ無効（uncached）、実行順を交互に入れ替え
手順: ruby benchmark-ar.rb を2回実行（スクリプトは作業記録に添付）
結果: 割り当て数の中央値 90,800 → 30,740（2回とも同じ）
      経過時間の中央値 265.4 → 36.5 ms（1回目）、80.3 → 19.2 ms（2回目）
注意: 経過時間はホストの負荷で3倍以上変わった。比率は 4〜7 倍で揺れた
結論: 題名だけを使う画面では pluck に替える。モデルのメソッドを使う画面には当てはまらない`} />
          <p>結論の欄には結果を当てはめられる範囲も書きます。この例は SQLite で 1,000 件を読んだ結果なので、MySQL で 10 万件を読む画面に同じ倍率が出るとは限りません。適用範囲を書いておくと、条件が違う場面で同じ数字を根拠に使うことを防げます。</p>
          <h3>判断基準とトレードオフ</h3>
          <p>道具の選び方は知りたいことの範囲で決まります。どの要求が遅いか分からない段階でプロファイラーをかけても、遅い要求と関係の無い結果が多く出ます。広い範囲を安い道具で絞り、狭い範囲を詳しい道具で調べる順に進めると、計測にかける時間と、計測が実行に与える負荷の両方を抑えられます。</p>
          <p>ベンチマークの結果は比べた条件の中でだけ成り立ちます。マイクロベンチマークで2倍速い書き方が見つかっても、その処理が要求全体の 1% なら応答はほとんど変わりません（<ChapterLink n={111} section="amdahl" />）。改修の候補は、プロファイルで時間を使っていた場所から選び、ベンチマークは候補の効果を確かめるために使います。本書では読みやすさを下げる書き換えを、プロファイルで要求全体にかかる時間のうち一定の割合（たとえば 10% 以上）を占めることを確かめた場所に限ることを勧めます。これは設計上の意見で、割合の目安はチームで決めます。</p>
          <p>経過時間、CPU 時間、割り当て数は、それぞれ揺れ方が違います。割り当て数は再現しやすく小さな差も確かめられますが、利用者が感じる速さそのものではありません。経過時間は利用者の体感に近い一方、環境の状態で大きく揺れます。両方を記録し、割り当て数で変更の効果を確かめ、経過時間で利用者への影響を確かめます。</p>
          <p>関連する章：性能の指標と待ち行列は <ChapterLink n={111} />、Puma と DB の同時処理能力は <ChapterLink n={113} />、N+1 の見つけ方と直し方は <ChapterLink n={13} section="n-plus-one" />、計測してから直す進め方の事例は <ChapterLink n={90} />、Ruby の GC と割り当ては <ChapterLink n={97} /> にあります。</p>
        </>
      ),
    },
  ],
  sources: [
    {
      title: "Active Support Instrumentation",
      publisher: "Ruby on Rails",
      url: "https://guides.rubyonrails.org/v8.1/active_support_instrumentation.html",
      accessed: "2026-11-27",
      version: "Rails 8.1",
      note: "計測イベントと購読",
    },
    {
      title: "StackProf README",
      publisher: "StackProf",
      url: "https://github.com/tmm1/stackprof/blob/v0.2.28/README.md",
      accessed: "2026-11-27",
      version: "stackprof 0.2.28",
      note: "cpu・wall・object のモード、interval、raw と d3-flamegraph",
    },
    {
      title: "Benchmark",
      publisher: "Ruby",
      url: "https://github.com/ruby/benchmark",
      accessed: "2026-11-27",
      version: "benchmark 0.5.0（Ruby 4.0 の bundled gem）",
      note: "bmbm の予行と、user・system・total・real の列",
    },
    {
      title: "EXPLAIN Statement",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/explain.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "計画および実行時の情報",
    },
    {
      title: "ActiveRecord::Calculations#pluck",
      publisher: "Ruby on Rails",
      url: "https://github.com/rails/rails/blob/v8.1.4.1/activerecord/lib/active_record/relation/calculations.rb",
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: "未読込の Relation で、選択した列を取得して型を変換する処理",
    },
    {
      title: "Process.clock_gettime",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/Process.html#method-c-clock_gettime",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "経過時間の差を求めるための単調増加時計",
    },
    {
      title: "benchmark-ips README",
      publisher: "benchmark-ips",
      url: "https://github.com/evanphx/benchmark-ips/blob/v2.15.1/README.md",
      accessed: "2026-11-27",
      version: "benchmark-ips 2.15.1",
      note: "1秒あたりの実行回数、標準偏差、warmup と time の設定、compare!",
    },
    {
      title: "memory_profiler README",
      publisher: "memory_profiler",
      url: "https://github.com/SamSaffron/memory_profiler/blob/v1.1.0/README.md",
      accessed: "2026-11-27",
      version: "memory_profiler 1.1.0",
      note: "allocated と retained、gem・ファイル・行・クラスごとの集計",
    },
    {
      title: "Vernier README",
      publisher: "Vernier",
      url: "https://github.com/jhawthorn/vernier/blob/v1.12.0/README.md",
      accessed: "2026-11-27",
      version: "vernier 1.12.0",
      note: "Ruby 3.3 以上、複数スレッド・GVL・GC・待機の記録、結果の表示",
    },
    {
      title: "NEWS for Ruby 4.0.0",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/NEWS_md.html",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "benchmark が default gem から bundled gem になったこと",
    },
    {
      title: "activesupport/lib/active_support/notifications/instrumenter.rb",
      publisher: "Ruby on Rails",
      url: "https://github.com/rails/rails/blob/v8.1.4.1/activesupport/lib/active_support/notifications/instrumenter.rb",
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: "Event の duration・cpu_time・idle_time・allocations・gc_time",
    },
    {
      title: "rack-mini-profiler README",
      publisher: "MiniProfiler",
      url: "https://github.com/MiniProfiler/rack-mini-profiler",
      accessed: "2026-11-27",
      version: "README",
      note: "pp=flamegraph と pp=profile-memory、stackprof と memory_profiler の利用",
    },
    {
      title: "railties/lib/rails/application/configuration.rb",
      publisher: "Ruby on Rails",
      url: "https://github.com/rails/rails/blob/v8.1.4.1/railties/lib/rails/application/configuration.rb",
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: "load_defaults 8.1 で config.yjit を Rails.env.local? でない環境だけ true にする",
    },
    {
      title: "Tuning Performance for Deployment",
      publisher: "Ruby on Rails Guides",
      url: "https://guides.rubyonrails.org/v8.1/tuning_performance_for_deployment.html",
      accessed: "2026-11-27",
      version: "Rails 8.1",
      note: "負荷試験の道具、本番と同等の環境、ウォームアップ、平均ではなくパーセンタイル",
    },
  ],
}

export default chapter
