import { figureNumber } from '../content/label'
import { useState } from 'react'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const RB = 'https://github.com/ruby/ruby/blob/v4.0.9'
const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 1 ソースから実行まで ---------- */
function PipelineFigure() {
  return (
    <Svg id="97-1" w={760} h={214} label="ソースを Prism が解析して構文木を作り、prism_compile.c が命令列に変換し、VM が命令を1つずつ実行する。YJIT か ZJIT を有効にすると、何度も呼ばれたメソッドの命令列を機械語に変換し、CPU がそれを直接実行する">
      <Box x={10} y={30} w={128} h={60} lines={['ソース', 'app.rb の文字列']} fs={12} subTone="muted" />
      <Arrow x1={138} y1={60} x2={164} y2={60} />
      <Box x={166} y={30} w={170} h={60} lines={['Prism が構文解析', '構文木（AST）を作る']} fs={12} subTone="muted" />
      <Arrow x1={336} y1={60} x2={362} y2={60} />
      <Box x={364} y={30} w={170} h={60} lines={['prism_compile.c', '命令列（ISeq）を作る']} fs={12} fill="box5" accent subTone="muted" />
      <Arrow x1={534} y1={60} x2={560} y2={60} />
      <Box x={562} y={30} w={188} h={60} lines={['VM（vm_exec.c）', '命令を1つずつ実行する']} fs={12} subTone="muted" />
      <T x={251} y={108} fs={11} anchor="middle" mono tone="muted">ruby --dump=parsetree</T>
      <T x={449} y={108} fs={11} anchor="middle" mono tone="muted">ruby --dump=insns</T>
      <Arrow x1={520} y1={90} x2={520} y2={124} dashed />
      <Box x={488} y={126} w={262} h={50} lines={['YJIT・ZJIT（有効にしたときだけ）', '何度も呼ばれたメソッドを機械語にする']} fs={12} fill="box4" dashed subTone="muted" />
      <T x={10} y={150} fs={11.5}>ここまでは起動時やファイルの読み込み時に1回だけ行う</T>
      <T x={10} y={196} fs={11} tone="muted">機械語にしたメソッドは CPU が直接実行し、想定と違う型が来ると命令列の実行に戻る</T>
    </Svg>
  )
}

/* ---------- 図 2 VM のスタックの移り変わり ---------- */
function StackFigure() {
  const steps: { insn: string[]; stack: string[]; local: string }[] = [
    { insn: ['putobject', '120'], stack: ['120'], local: 'price = 未設定' },
    { insn: ['setlocal_WC_0', 'price@0'], stack: [], local: 'price = 120' },
    { insn: ['getlocal_WC_0', 'price@0'], stack: ['120'], local: 'price = 120' },
    { insn: ['putobject', '20'], stack: ['120', '20'], local: 'price = 120' },
    { insn: ['opt_plus', 'mid:+'], stack: ['140'], local: 'price = 120' },
    { insn: ['leave', ''], stack: [], local: '140 を返す' },
  ]
  const col = 122
  return (
    <Svg id="97-2" w={760} h={262} label="price = 120; price + 20 の6つの命令を実行するたびに、VM のスタックとローカル変数がどう変わるかを示す。putobject 120 でスタックに120を積み、setlocal で取り出して price に入れる。getlocal で price の値を積み、putobject 20 で20を積む。opt_plus が2つを取り出して140を積み、leave がそれを呼び出し元に返す">
      {steps.map((s, i) => {
        const x = 18 + i * col
        return (
          <g key={i}>
            <T x={x + 52} y={16} fs={11} anchor="middle" tone="muted">{`${i + 1}`}</T>
            <T x={x + 52} y={34} fs={11.5} anchor="middle" mono bold>{s.insn[0]}</T>
            <T x={x + 52} y={51} fs={11} anchor="middle" mono tone="muted">{s.insn[1]}</T>
            <rect x={x} y={66} width={104} height={110} rx={4} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            {s.stack.map((v, k) => (
              <Box key={k} x={x + 10} y={140 - k * 32} w={84} h={28} lines={v} fs={12} mono fill={k === s.stack.length - 1 ? 'box5' : 'box'} />
            ))}
            {s.stack.length === 0 && <T x={x + 52} y={154} fs={11} anchor="middle" tone="muted">（空）</T>}
            <Box x={x} y={190} w={104} h={30} lines={s.local} fs={11} fill="box4" />
            {i < steps.length - 1 && <Arrow x1={x + 106} y1={120} x2={x + col - 2} y2={120} />}
          </g>
        )
      })}
      <T x={18} y={238} fs={11} tone="muted">上段の枠は VM のスタック（下ほど先に積んだ値、色の濃い箱が先頭）、下段の箱はローカル変数 price の値</T>
      <T x={18} y={254} fs={11} tone="muted">CRuby 4.0.9 の命令列をもとにした模式図。実際のローカル変数もフレームの領域（スタックの一部）に置かれる</T>
    </Svg>
  )
}

/* ---------- 図 3 インラインキャッシュ ---------- */
function InlineCacheFigure() {
  return (
    <Svg id="97-3" w={760} h={292} label="article.title の呼び出し位置ごとに call data があり、ci にはメソッド名と引数の数、cc には前回の受け手のクラスと見つけたメソッドを持つ。呼び出すたびに、受け手のクラスが cc のクラスと同じで、メソッドが無効化されていなければ、そのメソッドを呼ぶ。違えばクラスごとのキャッシュを引き、それにもなければ祖先をたどって探し、cc を書き換える">
      <Box x={10} y={20} w={190} h={44} lines={['呼び出し位置', 'article.title']} fs={12} mono subTone="muted" />
      <Arrow x1={105} y1={64} x2={105} y2={86} />
      <rect x={10} y={88} width={190} height={118} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={22} y={106} fs={12} bold>call data（命令の引数）</T>
      <Box x={22} y={118} w={166} h={36} lines={['ci：mid=title, argc=0']} fs={11.5} mono fill="box" />
      <Box x={22} y={160} w={166} h={38} lines={['cc：klass=Article', 'cme=Article#title']} fs={11} mono fill="box5" />
      <Arrow x1={200} y1={150} x2={248} y2={150} />
      <Box x={250} y={118} w={236} h={64} lines={['受け手のクラス == cc の klass', 'かつメソッドが無効化されていない']} fs={12} fill="box" accent />
      <Arrow x1={486} y1={136} x2={540} y2={70} accent />
      <T x={462} y={104} fs={11} tone="acc">はい</T>
      <Box x={542} y={40} w={208} h={50} lines={['ヒット', 'cme のメソッドをすぐ呼ぶ']} fs={12} fill="box5" subTone="muted" />
      <Arrow x1={486} y1={166} x2={540} y2={196} />
      <T x={462} y={194} fs={11} tone="muted">いいえ</T>
      <Box x={542} y={170} w={208} h={50} lines={['クラスごとの cc の表を引く', '（vm_search_cc）']} fs={12} subTone="muted" />
      <Arrow x1={646} y1={220} x2={646} y2={238} />
      <Box x={482} y={240} w={268} h={42} lines={['なければ祖先をたどって探し、cc を作る']} fs={12} subTone="muted" />
      <Arrow d="M482,261 L105,261 L105,200" dashed />
      <T x={130} y={276} fs={11} tone="muted">見つけた cc で call data を書き換える（次の呼び出しはこの cc と比べる）</T>
    </Svg>
  )
}

/* ---------- 図 4 JIT の実測 ---------- */
function JitFigure() {
  const rows = [
    { name: 'インタープリター', sec: 1.34, rss: 12.5 },
    { name: 'YJIT（--yjit）', sec: 0.24, rss: 15.1 },
    { name: 'ZJIT（--zjit）', sec: 0.91, rss: 15.5 },
  ]
  const scale = 270
  return (
    <Svg id="97-4" w={760} h={196} label="同じ計算の3回目の CPU 時間は、インタープリターが1.34秒、YJIT が0.24秒、ZJIT が0.91秒だった。プロセスの RSS は12.5MB、15.1MB、15.5MB だった">
      <T x={20} y={18} fs={12} bold>subtotal を 20 万回（3回目の CPU 時間）</T>
      <T x={630} y={18} fs={12} bold>RSS</T>
      {rows.map((r, i) => {
        const y = 36 + i * 42
        return (
          <g key={r.name}>
            <T x={20} y={y + 14} fs={12}>{r.name}</T>
            <Box x={160} y={y} w={r.sec * scale} h={28} fill={i === 1 ? 'box5' : 'box'} rx={3} />
            <T x={166 + r.sec * scale} y={y + 14} fs={12} mono>{`${r.sec.toFixed(2)} 秒`}</T>
            <T x={630} y={y + 14} fs={12} mono>{`${r.rss} MB`}</T>
          </g>
        )
      })}
      <T x={20} y={174} fs={11} tone="muted">Docker 上の ruby:4.0（CRuby 4.0.9）、4 コアのマシン。3つの実行方式を同じ条件で1回ずつ実行した値</T>
    </Svg>
  )
}

/* ---------- 図 5 ヒープのページとスロット ---------- */
function HeapFigure() {
  const heaps = [
    { size: 40, examples: '10 文字の String・インスタンス変数3個の Object・2**64' },
    { size: 80, examples: '20〜50 文字の String' },
    { size: 160, examples: '100 文字の String・空の Hash' },
    { size: 320, examples: 'これより長い本文を埋め込む String など' },
    { size: 640, examples: '300〜600 文字の String' },
  ]
  return (
    <Svg id="97-5" w={760} h={330} label="VM のスタックのフレームには、小さな整数やシンボルや nil が値そのものとして入り、文字列や配列はヒープのスロットへの参照として入る。ヒープはスロットの大きさが40、80、160、320、640バイトの5種類に分かれ、それぞれ64KiB のページの集まりでできている。1000文字の文字列は40バイトのスロットに本体を置き、本文の1001バイトを malloc の領域に置く">
      <T x={14} y={18} fs={12} bold>VM のスタック（フレーム）</T>
      <rect x={14} y={30} width={196} height={176} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <Box x={24} y={40} w={176} h={28} lines="count = 1" fs={12} mono fill="box4" />
      <Box x={24} y={72} w={176} h={28} lines="kind = :title" fs={12} mono fill="box4" />
      <Box x={24} y={104} w={176} h={28} lines="memo = nil" fs={12} mono fill="box4" />
      <Box x={24} y={136} w={176} h={28} lines="name = → (参照)" fs={12} mono />
      <Box x={24} y={168} w={176} h={28} lines="body = → (参照)" fs={12} mono />
      <T x={14} y={224} fs={11} tone="muted">上の3つは値そのもの</T>
      <T x={14} y={240} fs={11} tone="muted">（memsize_of は 0）</T>
      <T x={236} y={18} fs={12} bold>Ruby のヒープ（スロットの大きさごとに5種類）</T>
      {heaps.map((h, i) => {
        const y = 30 + i * 40
        const n = Math.max(1, Math.round(160 / (h.size / 10)))
        return (
          <g key={h.size}>
            <T x={236} y={y + 15} fs={12} mono>{`${h.size} B`}</T>
            {Array.from({ length: Math.min(n, 16) }).map((_, k) => (
              <rect key={k} x={284 + k * (160 / Math.min(n, 16))} y={y + 4} width={160 / Math.min(n, 16) - 2} height={22} rx={2} fill={k === 1 ? 'var(--fig-box5)' : 'var(--fig-box)'} stroke="var(--fig-line)" />
            ))}
            <T x={456} y={y + 15} fs={11}>{h.examples}</T>
          </g>
        )
      })}
      <Arrow d="M200,150 L276,150 C292,150 300,96 298,58" />
      <Arrow d="M200,182 L224,182 L224,259 L282,259" />
      <Box x={284} y={244} w={160} h={30} lines="40 B の本体" fs={11} fill="box5" />
      <Arrow x1={444} y1={259} x2={470} y2={259} />
      <Box x={472} y={238} w={270} h={44} lines={['malloc の領域（1000 文字なら 1001 B）', 'GC のスロットとは別に OS から取る']} fs={11.5} fill="box4" subTone="muted" />
      <T x={236} y={300} fs={11} tone="muted">1 ページは 64KiB。40 B のスロットなら 1 ページに約 1,637 個並ぶ（GC.stat_heap の値から計算）</T>
      <T x={236} y={318} fs={11} tone="muted">ページの中のスロット数は模式的に描いた。どの大きさに入るかは CRuby 4.0.9 での実測</T>
    </Svg>
  )
}

/* ---------- 図 6 世代別 GC と書き込みバリア（操作できる図） ---------- */
function GenerationalFigure() {
  const [step, setStep] = useState(0)
  const steps = [
    { label: '配列を作る', detail: '定数 CACHE から新しい配列を参照します。作ったばかりのオブジェクトは若い世代です。' },
    { label: '3回生き延びる', detail: 'GC を3回生き延びると古い世代になります（RVALUE_OLD_AGE が 3）。minor GC では古いオブジェクトの中を調べ直しません。' },
    { label: '古い配列に追加', detail: '古い配列に新しい文字列 "q1" を入れます。書き込みバリアが働き、配列を「覚えておく集合」（remembered set）に入れます。' },
    { label: 'minor GC', detail: '出発点と覚えておく集合からたどって若いオブジェクトだけに印を付けます。"q1" は残り、どこからも参照されない "tmp" は回収されます。' },
    { label: 'major GC', detail: 'CACHE を別の配列に差し替えた後の major GC では、古い世代も含めて全体をたどります。参照されなくなった古い配列と "q1" も回収されます。' },
  ]
  const oldArray = step >= 1 && step < 4
  const q1 = step >= 2 && step < 4
  const tmp = step >= 2 && step < 3
  const remembered = step === 2 || step === 3
  return (
    <Figure n={figureNumber(97, 6)} title="世代別 GC と書き込みバリア" caption="CRuby 4.0.9 の既定 GC の考え方を示す模式図です。実際には minor GC の後に覚えておく集合を作り直し、書き込みバリアを持たないオブジェクトは別に扱います。マークの順序やインクリメンタルな進め方は省いています。">
      <Stepper steps={steps.map((s) => ({ label: s.label, detail: s.detail }))} onStepChange={setStep} />
      <Svg id="97-6" w={720} h={200} label={steps[step].detail}>
        <Box x={14} y={70} w={120} h={46} lines={['出発点', '定数 CACHE']} fs={12} subTone="muted" />
        <rect x={160} y={14} width={250} height={170} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
        <T x={172} y={32} fs={12} bold>古い世代</T>
        <rect x={430} y={14} width={276} height={170} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
        <T x={442} y={32} fs={12} bold>若い世代</T>
        {step === 0 && <Box x={460} y={70} w={110} h={46} lines={['配列', 'age 0']} fs={12} fill="box5" />}
        {step === 0 && <Arrow x1={134} y1={93} x2={458} y2={93} />}
        {oldArray && <Box x={190} y={70} w={130} h={46} lines={remembered ? ['配列 age 3', '覚えておく集合'] : ['配列', 'age 3']} fs={12} fill="box5" accent={remembered} />}
        {oldArray && <Arrow x1={134} y1={93} x2={188} y2={93} />}
        {step === 4 && <Box x={190} y={70} w={130} h={46} lines={['配列', '回収']} fs={12} fill="none" dashed />}
        {step === 4 && <Box x={460} y={60} w={120} h={40} lines="新しい配列" fs={12} fill="box5" />}
        {step === 4 && <Arrow d="M134,85 C250,40 380,50 458,74" />}
        {q1 && <Box x={600} y={70} w={90} h={46} lines={['"q1"', step === 3 ? '残る' : 'age 0']} fs={12} fill="box" />}
        {q1 && <Arrow d="M320,93 L598,93" accent={step === 2} />}
        {step === 4 && <Box x={600} y={120} w={90} h={40} lines={['"q1"', '回収']} fs={12} fill="none" dashed />}
        {tmp && <Box x={460} y={130} w={110} h={40} lines={['"tmp"', '参照なし']} fs={12} fill="none" />}
        {step === 3 && <Box x={460} y={130} w={110} h={40} lines={['"tmp"', '回収']} fs={12} fill="none" dashed />}
      </Svg>
    </Figure>
  )
}

/* ---------- 図 7 GC の状態の移り変わり（実測） ---------- */
function GcTimelineFigure() {
  const x0 = 110
  const scale = 630 / 50000
  const X = (i: number) => x0 + i * scale
  const major = [
    { s: 600, m: 1400, e: 2600, by: 'oldgen' },
    { s: 14300, m: 14800, e: 14800, by: 'nofree' },
    { s: 46000, m: 48700, e: 49800, by: 'nofree' },
  ]
  const minor = [
    { s: 3900, e: 3900 },
    { s: 10100, e: 11500 },
    { s: 13200, e: 13200 },
    { s: 24600, e: 27000 },
    { s: 29500, e: 30700 },
    { s: 42500, e: 46000 },
  ]
  return (
    <Svg id="97-7" w={760} h={210} label="文字列を5万個追加する間に、major GC が3回、minor GC が6回あった。600個目で始まった major GC は1400個目までマーク中、2600個目までスイープ中で、その間もプログラムは文字列を追加し続けた。minor GC の多くもスイープを後回しにし、数千個分の追加の間にスイープを終えた">
      <T x={20} y={20} fs={12} bold>追加した文字列の数（i）</T>
      {[0, 10000, 20000, 30000, 40000, 50000].map((i) => (
        <g key={i}>
          <line x1={X(i)} y1={50} x2={X(i)} y2={150} stroke="var(--fig-line)" strokeDasharray="2 4" />
          <T x={X(i)} y={40} fs={11} anchor="middle" mono tone="muted">{i.toLocaleString('en-US')}</T>
        </g>
      ))}
      <T x={20} y={74} fs={12}>major GC</T>
      {major.map((g, k) => (
        <g key={k}>
          <rect x={X(g.s)} y={62} width={Math.max(3, (g.m - g.s) * scale)} height={24} fill="var(--fig-box5)" stroke="var(--fig-line)" />
          {g.e > g.m && <rect x={X(g.m)} y={62} width={(g.e - g.m) * scale} height={24} fill="var(--fig-box4)" stroke="var(--fig-line)" />}
          <T x={X(g.s)} y={100} fs={11} mono tone="muted">{g.by}</T>
        </g>
      ))}
      <T x={20} y={130} fs={12}>minor GC</T>
      {minor.map((g, k) => (
        <g key={k}>
          <line x1={X(g.s)} y1={116} x2={X(g.s)} y2={144} stroke="var(--fig-accent)" strokeWidth={2} />
          {g.e > g.s && <rect x={X(g.s)} y={118} width={(g.e - g.s) * scale} height={24} fill="var(--fig-box4)" stroke="var(--fig-line)" />}
        </g>
      ))}
      <rect x={20} y={164} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={40} y={170} fs={11}>マーク中（state=marking）</T>
      <rect x={220} y={164} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={240} y={170} fs={11}>スイープ中（state=sweeping）</T>
      <line x1={420} y1={162} x2={420} y2={178} stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={428} y={170} fs={11}>GC の開始（次に調べた時点で終了済み）</T>
      <T x={20} y={196} fs={11} tone="muted">incr.rb の出力を描いた図。100 個ごとに調べたので、区間の端は最大 100 個分ずれる</T>
    </Svg>
  )
}

/* ---------- 図 8 malloc のアリーナと RSS（実測） ---------- */
function ArenaFigure() {
  const rows = [
    { name: '既定（glibc）', rss: 455, note: 'アリーナ 9 個' },
    { name: 'MALLOC_ARENA_MAX=2', rss: 211, note: 'アリーナ 2 個' },
    { name: 'jemalloc 5.3.0', rss: 359, note: 'LD_PRELOAD で置き換え' },
  ]
  const scale = 0.8
  const x0 = 190
  return (
    <Svg id="97-8" w={760} h={208} label="8本のスレッドで文字列を作っては捨て、100MB だけ残した後の RSS は、glibc の既定で455MB（アリーナ9個）、MALLOC_ARENA_MAX=2 で211MB（アリーナ2個）、jemalloc で359MB だった">
      <T x={20} y={18} fs={12} bold>GC 後の RSS（残した文字列は 3 通りとも 100.1MB）</T>
      {rows.map((r, i) => {
        const y = 34 + i * 44
        return (
          <g key={r.name}>
            <T x={20} y={y + 15} fs={12} mono>{r.name}</T>
            <Box x={x0} y={y} w={r.rss * scale} h={30} fill={i === 1 ? 'box5' : 'box'} rx={3} />
            <T x={x0 + r.rss * scale + 8} y={y + 9} fs={12} mono>{`${r.rss} MB`}</T>
            <T x={x0 + r.rss * scale + 8} y={y + 24} fs={11} tone="muted">{r.note}</T>
          </g>
        )
      })}
      <line x1={x0 + 100 * scale} y1={28} x2={x0 + 100 * scale} y2={166} stroke="var(--fig-accent)" strokeWidth={2} strokeDasharray="4 3" />
      <T x={x0 + 100 * scale + 6} y={176} fs={11} tone="acc">残した 100MB</T>
      <T x={20} y={198} fs={11} tone="muted">arena.rb を同じコンテナで順に実行した最後の回の値。4 回の実行の範囲は、既定 452〜521MB、2 個 195〜214MB、jemalloc 303〜359MB</T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 97,
  part: 1,
  title: 'Ruby VM とメモリー管理',
  summary: 'CRuby 4.0.9 がコードを命令列に変換して実行する過程を、実際の命令列とソースで追います。メソッド呼び出しのキャッシュと JIT を確かめ、オブジェクトを置くスロット、GC の世代と進め方、Rails のプロセスでメモリーが増える理由を実測します。',
  goals: [
    'RubyVM::InstructionSequence の出力を読み、命令とスタックの動きを対応させられる',
    'インラインキャッシュと JIT が何を速くし、どんな書き方で効かなくなるかを説明できる',
    'オブジェクトがどの大きさのスロットに置かれ、いつ malloc の領域を使うかを確かめられる',
    'GC.stat と ObjectSpace で、割り当て・保持・GC の回数を分けて測れる',
    'Ruby のヒープの外で RSS が増える理由を説明し、MALLOC_ARENA_MAX や jemalloc の効果を測って判断できる',
  ],
  prerequisites: [95, 2, 4],
  sections: [
    { id: 'iseq', title: 'ソースコードを命令列に変える', body: <>
      <p>ターミナルで <code>ruby app.rb</code> と打つと、まず Ruby の処理系というプログラムが起動します。処理系は app.rb の文字列を読み、その内容に従って動きます。Ruby の処理系には JRuby（Java の上で動く）や TruffleRuby などもありますが、rails new で作ったアプリケーションをふつうに動かす処理系は、C で書かれた <Term en="CRuby">CRuby</Term> です。この章では CRuby 4.0.9 を扱います。</p>
      <p>CRuby はプログラムを次の3段階で実行します（図 {figureNumber(97, 1)}）。最初に Prism という構文解析器が文字列を読み、「ローカル変数 price に 120 を代入する」「price の + メソッドを 20 を引数に呼ぶ」といった構造を木の形で組み立てます。これを<Term en="Abstract Syntax Tree">構文木</Term>と呼びます。次に prism_compile.c が構文木を<Term en="instruction sequence、略して ISeq">命令列</Term>に変換します。最後に、命令列を1命令ずつ実行するプログラムである<Term en="Virtual Machine、略して VM">仮想マシン</Term>が動きます。CRuby の VM は歴史的に YARV と呼ばれます。<Ref n={1} /></p>
      <Figure n={figureNumber(97, 1)} title="ソースから VM の実行まで" caption="CRuby 4.0.9 の代表的な経路です。eval や require で読み込んだコードも同じ段階を通ります。">
        <PipelineFigure />
      </Figure>
      <p>途中の結果は <code>ruby</code> コマンドの <code>--dump</code> オプションで表示できます。1行だけの t.rb（<code>price = 120; price + 20</code>）の構文木を表示しました。</p>
      <Code lang="text" title="ruby --dump=parsetree t.rb の出力（CRuby 4.0.9、後半を省略）" code={`@ ProgramNode (location: (1,0)-(1,23))
+-- locals: [:price]
+-- statements:
    @ StatementsNode (location: (1,0)-(1,23))
    +-- body: (length: 2)
        +-- @ LocalVariableWriteNode (location: (1,0)-(1,11))
        |   +-- name: :price
        |   +-- value:
        |   |   @ IntegerNode (location: (1,8)-(1,11))
        |   |   +-- value: 120
        +-- @ CallNode (location: (1,13)-(1,23))
            +-- receiver:
            |   @ LocalVariableReadNode (location: (1,13)-(1,18))
            +-- name: :+
            ...`} />
      <p>文の区切りの <code>;</code> で分かれた2つの文が、代入（LocalVariableWriteNode）とメソッド呼び出し（CallNode）になっています。<code>price + 20</code> も構文木の上では price を受け手とする <code>+</code> メソッドの呼び出しです。</p>
      <p>Ruby のプログラムの中からは <code>RubyVM::InstructionSequence</code> を使います。<code>compile</code> でソースコードを命令列に変換し、<code>disasm</code> で命令の名前と引数を人が読める形で表示します。この API や命令の名前は CRuby に固有で、バージョンによって変わります。業務の Rails アプリケーションで命令名に依存する処理を書くと、Ruby を更新したときに壊れるおそれがあります。調べるための道具として使います。</p>
      <Code lang="ruby" title="iseq.rb" code={`source = "price = 120; price + 20"
sequence = RubyVM::InstructionSequence.compile(source)

puts sequence.disasm
p sequence.eval # => 140`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`== disasm: #<ISeq:<compiled>@<compiled>:1 (1,0)-(1,23)>
local table (size: 1, argc: 0 [opts: 0, rest: -1, post: 0, block: -1, kw: -1@-1, kwrest: -1])
[ 1] price@0
0000 putobject                              120                       (   1)[Li]
0002 setlocal_WC_0                          price@0
0004 getlocal_WC_0                          price@0
0006 putobject                              20
0008 opt_plus                               <calldata!mid:+, argc:1, ARGS_SIMPLE>[CcCr]
0010 leave
140`} />
      <p>1行目は命令列の名前と、ソースのどの範囲（1行目の0文字目から23文字目）から作ったかです。<code>local table</code> はこの命令列が使うローカル変数の一覧で、price が0番に割り当てられています。その下が命令です。左端の数字は命令列の中の位置、中央が命令の名前、右がその引数です。右端の <code>(   1)</code> はソースの行番号、<code>[Li]</code> はその命令で行のイベントが起きることを表します。<code>[CcCr]</code> は C で書かれたメソッドの呼び出しと戻りのイベントで、<code>TracePoint</code> がこの位置で動けることを示します（iseq.c の表示処理）。<Ref n={9} /></p>
      <p>解析と命令列への変換が終わった時点では、まだ何も計算していません。<code>eval</code> が命令列を VM で実行し、最後の式の値 140 を返します。この例は実行する式を自分で書いています。利用者が入力した文字列を <code>eval</code> に渡すと任意のコードを実行されるので、そのような使い方はしません。</p>
    </> },
    { id: 'execution', title: 'VM が値を読み出してメソッドを呼ぶ', body: <>
      <p>CRuby の VM は<Term en="stack machine">スタックマシン</Term>です。命令は値をスタック（後から積んだものを先に取り出す入れ物）に積み、次の命令がそこから値を取り出して使います。<code>putobject</code> は値を積み、<code>setlocal_WC_0</code> は先頭の値を取り出して今のフレームのローカル変数に入れ、<code>getlocal_WC_0</code> はローカル変数の値を積みます。名前の <code>WC_0</code> は「0段外側」、つまりブロックの外側ではなく今のスコープの変数であることを表します。</p>
      <Figure n={figureNumber(97, 2)} title="命令ごとの VM のスタック" caption="iseq.rb の命令列を1つずつ実行した様子です。命令の引数（120 や price@0）は命令列に埋め込まれていて、スタックを通るのは計算に使う値です。">
        <StackFigure />
      </Figure>
      <p><code>opt_plus</code> は <code>+</code> の呼び出しを速くするための命令です。insns.def での定義を読むと、まず <code>vm_opt_plus</code> を試し、それが <code>Qundef</code>（結果なし）を返したときだけ、通常のメソッド呼び出し（<code>CALL_SIMPLE_METHOD</code>）に進みます。<Ref n={3} /></p>
      <Code lang="text" title="insns.def（1316〜1328行目）と vm_insnhelper.c（6734〜6743行目）から抜粋" href={`${RB}/insns.def#L1316-L1328`} code={`DEFINE_INSN
opt_plus
(CALL_DATA cd)
(VALUE recv, VALUE obj)
(VALUE val)
{
    val = vm_opt_plus(recv, obj);

    if (UNDEF_P(val)) {
        CALL_SIMPLE_METHOD();
    }
}

vm_opt_plus(VALUE recv, VALUE obj)
{
    if (FIXNUM_2_P(recv, obj) &&
        BASIC_OP_UNREDEFINED_P(BOP_PLUS, INTEGER_REDEFINED_OP_FLAG)) {
        return rb_fix_plus_fix(recv, obj);
    }
    ...`} />
      <p><code>FIXNUM_2_P</code> は2つの値がどちらも小さな整数かを調べ、<code>BASIC_OP_UNREDEFINED_P</code> は Integer#+ が定義し直されていないかを調べます。両方を満たせば、メソッドを探さずにその場で足し算します。だれかが <code>class Integer; def +(o) ... end; end</code> と定義し直すと、この近道は使われず、定義し直した + を呼びます。<Ref n={8} /></p>
      <h3>同じ加算命令で呼び出す相手が変わる</h3>
      <p>整数と、自分で <code>+</code> を定義した <code>Price</code> の両方を <code>total</code> に渡します。<code>InstructionSequence.of</code> で <code>total</code> の命令列を表示し、<code>TracePoint</code> で実行時に Ruby で定義された <code>+</code> の呼び出しを記録します。<Ref n={6} /></p>
      <Code lang="ruby" title="整数と Price を同じ命令列で加算する（iseq2.rb）" code={`class Price
  def +(tax)
    120 + tax
  end
end

def total(price)
  price + 20
end

puts RubyVM::InstructionSequence.of(method(:total)).disasm
calls = []
trace = TracePoint.new(:call) do |event|
  calls << event.defined_class if event.method_id == :+
end

results = trace.enable { [total(120), total(Price.new)] }
p results # => [140, 140]
p calls   # => [Price]`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`== disasm: #<ISeq:total@iseq2.rb:7 (7,0)-(9,3)>
local table (size: 1, argc: 1 [opts: 0, rest: -1, post: 0, block: -1, kw: -1@-1, kwrest: -1])
[ 1] price@0<Arg>
0000 getlocal_WC_0                          price@0                   (   8)[LiCa]
0002 putobject                              20
0004 opt_plus                               <calldata!mid:+, argc:1, ARGS_SIMPLE>[CcCr]
0006 leave                                                            (   9)[Re]
[140, 140]
[Price]`} />
      <p><code>total</code> の命令列には <code>opt_plus</code> が1つだけあり、<code>price@0&lt;Arg&gt;</code> は price が引数であることを表します。結果はどちらも 140 です。記録に <code>Price</code> が1件だけ出たのは、<code>Price.new</code> を渡したときだけ <code>vm_opt_plus</code> が近道を使えず、Ruby で定義した <code>Price#+</code> を呼んだからです。<code>:call</code> は Ruby で定義したメソッドの呼び出しだけを記録するので、整数の側でメソッドを呼ばなかったことは、この出力ではなく上のソースから分かります。</p>
      <p>メソッドを呼ぶと、VM は呼び出しごとに<Term en="control frame">フレーム</Term>を作ります。フレームには実行中の命令列、次に実行する命令の位置、self、ローカル変数の置き場所が入ります。<code>leave</code> はフレームを取り除き、戻り値を呼び出し元のスタックに積みます。例外のバックトレースに呼び出し元のファイル名と行番号が並ぶのは、このフレームの連なりをたどって表示しているからです。どのクラスのメソッドが呼ばれるかの規則は <ChapterLink n={2} section="method-lookup" />で扱いました。</p>
      <p>引数に <code>article.title.upcase</code> のような普通のメソッド呼び出しを書くと、<code>opt_send_without_block</code> という命令になります。</p>
      <Code lang="text" title="def label(article) = article.title.upcase の命令列（抜粋）" code={`0000 getlocal_WC_0                          article@0                 (   2)[LiCa]
0002 opt_send_without_block                 <calldata!mid:title, argc:0, ARGS_SIMPLE>
0004 opt_send_without_block                 <calldata!mid:upcase, argc:0, ARGS_SIMPLE>
0006 leave                                                            (   3)[Re]`} />
      <p>命令の短さだけでアプリケーションの速さは決まりません。<code>article.title</code> の1命令の先で Active Record が属性を読み、データベースに問い合わせることもあります。遅いメソッドを調べるときは、命令列、実際に呼ばれているメソッド、データベースなど外部を待つ時間を分けて考えます。</p>
    </> },
    { id: 'inline-cache', title: 'メソッド呼び出しとインラインキャッシュ', body: <>
      <p>Ruby では、同じ <code>article.title</code> でも、article がどのクラスのオブジェクトかによって呼ぶメソッドが変わります。クラスの祖先を1つずつたどってメソッドを探す処理を毎回行うと時間がかかります。コードの中でメソッドの呼び出しを書いた場所を<Term en="call site">呼び出し位置</Term>と呼びます。CRuby は呼び出し位置ごとに、前回見つけたメソッドを覚えておきます。これを<Term en="inline cache">インラインキャッシュ</Term>と呼びます。</p>
      <p>disasm の <code>&lt;calldata!mid:title, argc:0, ARGS_SIMPLE&gt;</code> が、呼び出し位置ごとのデータです。中には変わらない情報（ci：メソッド名と引数の数）と、実行中に書き換わる情報（cc：前回の受け手のクラスと、そのとき見つけたメソッド）があります。呼び出すたびに VM は次の関数で cc を確かめます。<Ref n={8} /></p>
      <Code lang="text" title="vm_insnhelper.c（2363〜2389行目、デバッグ用の行を省略）" href={`${RB}/vm_insnhelper.c#L2363-L2389`} code={`static const struct rb_callcache *
vm_search_method_fastpath(VALUE cd_owner, struct rb_call_data *cd, VALUE klass)
{
    const struct rb_callcache *cc = cd->cc;
#if OPT_INLINE_METHOD_CACHE
    if (LIKELY(vm_cc_class_check(cc, klass))) {
        if (LIKELY(!METHOD_ENTRY_INVALIDATED(vm_cc_cme(cc)))) {
            return cc;
        }
    }
#endif
    return vm_search_method_slowpath0(cd_owner, cd, klass);
}`} />
      <p><code>vm_cc_class_check</code> は、受け手のクラスが cc に記録したクラスと同じかを比べるだけの処理です（vm_callinfo.h）。同じで、メソッドが定義し直されて無効になっていなければ、記録したメソッドをそのまま呼びます。違えば <code>vm_search_method_slowpath0</code> に進み、クラスごとに持つ cc の表を引き、それにもなければ祖先をたどって探し、見つけた cc で呼び出し位置のデータを書き換えます（図 {figureNumber(97, 3)}）。</p>
      <Figure n={figureNumber(97, 3)} title="呼び出し位置ごとのキャッシュ" caption="CRuby 4.0.9 の vm_search_method_fastpath と vm_search_method_slowpath0 の流れを図にしたものです。Ractor を使うときのロックや、メソッドが見つからない場合の処理は省いています。">
        <InlineCacheFigure />
      </Figure>
      <p>呼び出し位置1つにつき覚えられるクラスは1つです。同じ位置に複数のクラスのオブジェクトが交互に来ると、毎回クラスが一致せず、遅い経路を通ります。<code>label(article)</code> の中の <code>article.title</code> に、1種類のクラスだけを渡す場合と、4種類のクラスを順に渡す場合、特異メソッドを定義した（それぞれが自分の特異クラスを持つ）オブジェクトを渡す場合を比べました。</p>
      <Code lang="ruby" title="ic.rb" code={`classes = 4.times.map do |i|
  Class.new { define_method(:title) { i } }
end

def label(article)
  article.title
end

def bench(objects, n = 2_000_000)
  t = Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID)
  i = 0
  while i < n
    label(objects[i & 3])
    i += 1
  end
  Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID) - t
end

one  = Array.new(4) { classes[0].new }                         # 4個とも同じクラス
four = classes.map(&:new)                                      # 4個が別々のクラス
sing = Array.new(4) { o = classes[0].new; def o.extra = 1; o } # 4個とも特異メソッドを持つ

results = { one: [], four: [], sing: [] }
5.times do
  results[:one]  << bench(one)
  results[:four] << bench(four)
  results[:sing] << bench(sing)
end
results.each { |k, v| printf("%-5s 中央値 %.3f 秒 %p\\n", k, v.sort[2], v.map { _1.round(3) }) }`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9、JIT なし。200 万回の呼び出しの CPU 時間）" code={`one   中央値 0.372 秒 [0.376, 0.392, 0.367, 0.372, 0.354]
four  中央値 0.436 秒 [0.46, 0.423, 0.448, 0.435, 0.436]
sing  中央値 0.456 秒 [0.47, 0.495, 0.444, 0.421, 0.456]`} />
      <p>ほかの作業でマシンの負荷が高かったため、経過時間ではなくプロセスの CPU 時間を測り、5回の中央値で比べました。1種類のクラスだけのときに比べて、4種類では約17%、特異メソッドを持つオブジェクトでは約23%長くかかりました。特異メソッドを定義すると、そのオブジェクトだけのクラス（特異クラス）ができるので、同じクラスから作ったオブジェクトでも呼び出し位置から見れば別のクラスになります。ループや <code>label</code> の呼び出しの費用も含めた全体の時間で、この程度の差です。</p>
      <p>メソッドや定数を定義し直したときは、キャッシュを捨てる必要があります。次の例は一度呼んだ後に同じ名前のメソッドと定数を定義し直しています。</p>
      <Code lang="ruby" title="inval.rb" code={`class Article
  def title = "Ruby"
end
LIMIT = 10
def show(article) = "#{article.title} #{LIMIT}"

article = Article.new
show(article)
before = RubyVM.stat
Article.class_eval { def title = "Rails" }   # 同じ名前のメソッドを定義し直す
Object.send(:remove_const, :LIMIT); LIMIT = 20 # 同じ名前の定数を定義し直す
p show(article)
after = RubyVM.stat
p after.to_h { |k, v| [k, v - before[k]] }`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`"Rails 20"
{constant_cache_invalidations: 2, constant_cache_misses: 4, global_cvar_state: 0, next_shape_id: 0, shape_cache_size: 0}`} />
      <p>2回目の <code>show</code> は新しい定義を使い、<code>"Rails 20"</code> を返しました。古い cc はメソッドの無効化の印（<code>METHOD_ENTRY_INVALIDATED</code>）で使われなくなり、定数のキャッシュは無効化と取り直しの回数が <code>RubyVM.stat</code> に数えられています。<Ref n={15} /> 正しさは保たれますが、キャッシュを作り直す分の時間がかかります。</p>
      <p>業務のコードでこの差を気にする場面は多くありません。ただし、要求ごとにオブジェクトへ <code>extend</code> や <code>define_singleton_method</code> を使う、実行中に定数を定義し直す、といった書き方をすると、同じ呼び出し位置に別々のクラスのオブジェクトが来ます。呼び出し位置のキャッシュも後で扱う JIT も、同じ位置に同じクラスが来るときに速くなる仕組みです。これは CRuby の仕組みから導かれる一般的な注意で、どの程度遅くなるかは実測で確かめます。</p>
    </> },
    { id: 'jit', title: 'JIT：YJIT と ZJIT', body: <>
      <p>ここまでの VM は命令を1つ読んではその処理を実行する<Term en="interpreter">インタープリター</Term>です。命令ごとに「次の命令は何か」を調べる費用がかかり、型を調べる処理も毎回行います。<Term en="Just-In-Time compiler">JIT コンパイラー</Term>は、実行中に何度も呼ばれたメソッドの命令列を CPU の機械語に変換し、以後はその機械語を直接実行します。実行時に見た型（たとえば price はいつも Integer だった）を前提に機械語を作り、実行中に違う型の値が来たら命令列の実行に戻ります。</p>
      <p>Ruby 4.0 には2つの JIT があります。Ruby 4.0.0 の NEWS によると、次のとおりです。<Ref n={7} /></p>
      <ul>
        <li>YJIT：Ruby 3.1 から入っている JIT です。4.0 では <code>RubyVM::YJIT.enable</code> に <code>mem_size:</code> と <code>call_threshold:</code> を渡せるようになりました。統計の <code>ratio_in_yjit</code> は通常のビルドでは使えなくなりました。</li>
        <li>ZJIT：4.0 で入った、メソッド単位でコンパイルする実験的な JIT です。<code>--zjit</code> オプションか <code>RubyVM::ZJIT.enable</code> で有効にします。NEWS は「4.0.0 の時点でインタープリターより速いが、YJIT ほどは速くない」とし、本番環境での利用は今のところ勧めていません。Ruby 4.1 で YJIT より速くし、本番で使える状態にすることを目標にしています。</li>
      </ul>
      <p>YJIT は、メソッドが30回呼ばれるとコンパイルを始めます（yjit/src/options.rs の <code>SMALL_CALL_THRESHOLD</code>）。読み込んだ命令列が4万個を超える大きなアプリケーションでは、120回に引き上げます（同じファイルの <code>LARGE_CALL_THRESHOLD</code> と yjit.rs の判定）。使うメモリーの目安は <code>--yjit-mem-size</code> で、既定は 128MiB です。<Ref n={12} /><Ref n={10} /> ZJIT の既定の閾値も30回です（zjit/src/options.rs）。<Ref n={11} /></p>
      <p>同じ計算を、JIT なし、<code>--yjit</code>、<code>--zjit</code> で実行しました。50個の商品の小計を20万回求めるスクリプトで、属性の読み出し、掛け算、ブロックの呼び出しを繰り返します。</p>
      <Code lang="ruby" title="jit.rb" code={`Item = Struct.new(:name, :price, :qty)

def subtotal(items)
  sum = 0
  items.each { |item| sum += item.price * item.qty }
  sum
end

def run
  items = Array.new(50) { |i| Item.new("item#{i}", 100 + i, i % 5 + 1) }
  total = 0
  200_000.times { total += subtotal(items) }
  total
end

def cpu = Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID)
def rss_mb = File.read("/proc/self/status")[/VmRSS:\\s+(\\d+)/, 1].to_i / 1024.0

times = 3.times.map { t = cpu; run; cpu - t }
mode = if defined?(RubyVM::YJIT) && RubyVM::YJIT.enabled? then "YJIT"
       elsif defined?(RubyVM::ZJIT) && RubyVM::ZJIT.enabled? then "ZJIT"
       else "インタープリター" end
printf("%-8s 1回目 %.2f 秒 / 2回目 %.2f 秒 / 3回目 %.2f 秒  RSS %.1f MB\\n", mode, *times, rss_mb)
if mode == "YJIT"
  s = RubyVM::YJIT.runtime_stats
  p s.slice(:compiled_iseq_count, :compiled_block_count, :inline_code_size, :outlined_code_size, :code_region_size, :yjit_alloc_size)
end`} />
      <Code lang="text" title="ruby jit.rb、ruby --yjit jit.rb、ruby --zjit jit.rb の実行結果" code={`インタープリター 1回目 1.35 秒 / 2回目 1.31 秒 / 3回目 1.34 秒  RSS 12.5 MB
YJIT     1回目 0.24 秒 / 2回目 0.24 秒 / 3回目 0.24 秒  RSS 15.1 MB
{compiled_iseq_count: 5, compiled_block_count: 40, inline_code_size: 2050, outlined_code_size: 3296, code_region_size: 12288, yjit_alloc_size: 156424}
ZJIT     1回目 0.94 秒 / 2回目 0.88 秒 / 3回目 0.92 秒  RSS 15.5 MB`} />
      <Figure n={figureNumber(97, 4)} title="インタープリター・YJIT・ZJIT の CPU 時間と RSS" caption="jit.rb の3回目の値です。JIT がコンパイルする対象が少ない小さなスクリプトなので、増えたメモリーも数 MB です。">
        <JitFigure />
      </Figure>
      <p>この計算では、YJIT が JIT なしの約5.6倍の速さになりました。ZJIT は JIT なしより CPU 時間が約3割短く、YJIT よりは長い結果でした。NEWS の説明と同じ順序です。YJIT がコンパイルした命令列は5個（<code>compiled_iseq_count</code>）で、機械語に約12KB（<code>code_region_size</code>）、管理用のデータに約150KB（<code>yjit_alloc_size</code>）を使いました。</p>
      <p>Rails のアプリケーションでは、要求の時間の多くをデータベースや外部 API の待ちに使うので、この例ほどの差は出ません。また、コンパイルするメソッドの数が多いため、JIT が使うメモリーも増えます。ワーカーのプロセスごとに機械語を持つので、増えた量はワーカーの数だけかかります。Rails 8.1 の <code>load_defaults "8.1"</code> は、development と test 以外の環境で <code>config.yjit</code> を true にし、起動時に <code>RubyVM::YJIT.enable</code> を呼びます（<ChapterLink n={7} section="finisher" />）。<Ref n={13} /> 設定のコメントには、開発やテストではコードの再読み込みやメソッドの定義し直し（モックなど）が多く、YJIT で速くなりにくいと書かれています。前の節の「定義し直すとキャッシュを捨てる」と同じ理由です。</p>
    </> },
    { id: 'memory', title: 'スタックとヒープで寿命が異なる', body: <>
      <p>メソッドを呼ぶと、VM はフレームと、そのメソッドが使うローカル変数や計算途中の値の領域を、スレッドごとの <Term>VM スタック</Term>に確保します。メソッドから戻ると、その領域はすぐに次の呼び出しで使われます。スタックの大きさには上限があり、<code>RubyVM::DEFAULT_PARAMS</code> で確かめられます。深く再帰させて、<code>SystemStackError</code> になるまでの深さを数えました。<Ref n={15} /></p>
      <Code lang="ruby" title="stack.rb" code={`p RubyVM::DEFAULT_PARAMS
def down(n)
  down(n + 1)
rescue SystemStackError
  n
end
p main: down(0)
p thread: Thread.new { down(0) }.value
p fiber: Fiber.new { down(0) }.resume`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`{thread_vm_stack_size: 1048576, thread_machine_stack_size: 1048576, fiber_vm_stack_size: 131072, fiber_machine_stack_size: 524288}
{main: 10917}
{thread: 10917}
{fiber: 1360}`} />
      <p>スレッドの VM スタックは 1MiB で、この単純なメソッドなら約1万1千段まで呼べました。Fiber の VM スタックは 128KiB と小さく、約1,360段で上限に達しました。<code>thread_machine_stack_size</code> は、C で書かれた処理が使う OS のスタックの大きさです。VM スタックと OS のスタックは別の領域です。Fiber のスタックが小さい理由と使い方は <ChapterLink n={98} section="fiber" />で扱います。</p>
      <p>一方、オブジェクトは作ったメソッドから戻った後も使われることがあります。<code>def title = String.new("Ruby")</code> が返した文字列は、呼び出し元が変数に入れて使い続けられます。このような値は、フレームとは別の<Term>ヒープ</Term>に置きます。VM スタックのローカル変数には、ヒープ上のオブジェクトを指す参照が入ります。</p>
      <p>ただし、すべての値がヒープに置かれるわけではありません。小さな整数、多くの Float、シンボル、nil、true、false は、参照の代わりに値そのものを VM スタックやオブジェクトの中に入れます。CRuby ではこれらを特殊定数と呼びます。<code>ObjectSpace.memsize_of</code> でオブジェクトが使うバイト数を調べると、特殊定数は 0 になります。<Ref n={14} /></p>
      <Code lang="text" title="ObjectSpace.memsize_of の結果（require 'objspace' の後、CRuby 4.0.9）" code={`1                    => 0
1099511627776        => 0     # 2**40 も値そのもの
18446744073709551616 => 40    # 2**64 はヒープの Integer（Bignum）
1.5                  => 0
:title               => 0
nil                  => 0`} />
      <p>ブロックが外側のローカル変数を参照し、作った Proc がメソッドの外に出る場合は、メソッドが終わった後も変数の値を読めなければなりません。CRuby はこの場合、ローカル変数の領域をヒープに移します。フレームが消えたことだけでは、関係する値が回収されるとは限りません。<ChapterLink n={4} section="closure">クロージャー</ChapterLink>を使うと、たとえばコールバックの登録が大きなオブジェクトへの参照を保持し続けることがあります。</p>
    </> },
    { id: 'allocation', title: 'オブジェクトの割り当て：スロット・ページ・可変幅', body: <>
      <p><code>String.new</code> や <code>{}</code> でオブジェクトを作ることを、ヒープへの<Term en="allocation">割り当て</Term>と呼びます。CRuby の既定の GC は OS から 64KiB の<Term en="heap page">ページ</Term>を取り、それを同じ大きさの<Term en="slot">スロット</Term>に区切って並べます。オブジェクト1個は1つのスロットに入ります。スロットの大きさは1種類ではなく、40・80・160・320・640バイトの5種類あり、大きさごとに別のヒープとしてページを持ちます。これを<Term en="Variable Width Allocation">可変幅の割り当て</Term>（VWA）と呼びます。<Ref n={4} /></p>
      <Code lang="ruby" title="slots.rb（一部）" code={`require "objspace"
p GC.stat_heap.transform_values { |h| h.slice(:slot_size, :heap_eden_pages, :heap_eden_slots) }
p GC::INTERNAL_CONSTANTS.slice(:BASE_SLOT_SIZE, :RVALUE_OVERHEAD, :HEAP_PAGE_SIZE, :HEAP_COUNT, :RVALUE_OLD_AGE)
[0, 10, 20, 50, 100, 300, 600, 1000].each do |n|
  s = "a" * n
  printf("%4d 文字の String: memsize_of=%d\\n", n, ObjectSpace.memsize_of(s))
end`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9、起動直後）" code={`{0 => {slot_size: 40, heap_eden_pages: 12, heap_eden_slots: 19649}, 1 => {slot_size: 80, heap_eden_pages: 10, heap_eden_slots: 8183}, 2 => {slot_size: 160, heap_eden_pages: 8, heap_eden_slots: 3270}, 3 => {slot_size: 320, heap_eden_pages: 3, heap_eden_slots: 611}, 4 => {slot_size: 640, heap_eden_pages: 3, heap_eden_slots: 305}}
{BASE_SLOT_SIZE: 40, RVALUE_OVERHEAD: 0, HEAP_PAGE_SIZE: 65536, HEAP_COUNT: 5, RVALUE_OLD_AGE: 3}
   0 文字の String: memsize_of=40
  10 文字の String: memsize_of=40
  20 文字の String: memsize_of=80
  50 文字の String: memsize_of=80
 100 文字の String: memsize_of=160
 300 文字の String: memsize_of=640
 600 文字の String: memsize_of=640
1000 文字の String: memsize_of=1041`} />
      <p>起動直後のヒープは40バイトのスロットのページが12枚（19,649個）で最も多く、大きいスロットほど少なくなっています。文字列は、本文が短ければスロットの中に本文ごと入ります（埋め込み）。10文字までは40バイト、50文字までは80バイト、100文字は160バイト、300文字と600文字は640バイトのスロットに入りました。1000文字では 1041 バイトで、40バイトのスロットに文字列の情報だけを置き、本文の 1001 バイト（終端の1バイトを含む）を C の <code>malloc</code> で別に確保しています。</p>
      <p>同じ方法で、ほかのオブジェクトも測りました。要素3個の配列は 40、要素100個の配列は 840（40 + 800）、空のハッシュは 160、要素100個のハッシュは 3,488 バイトでした。インスタンス変数を3個持つ <code>Article</code> のオブジェクトは 40 バイトのスロットに収まりました。どの大きさのスロットを選ぶか、どこから malloc に移すかは Ruby のバージョンで変わります。Ruby 4.0 の NEWS には、大きさの違うヒープが別々に増えるようになり、一部のヒープにだけ長く残るオブジェクトがある場合のメモリー使用量が減ったこと、より大きな Bignum も埋め込めるようになったことが書かれています。<Ref n={7} /></p>
      <Figure n={figureNumber(97, 5)} title="VM スタックとヒープのスロット" caption="CRuby 4.0.9 での実測（slots.rb と memsize_of）をもとにした模式図です。スロットの右に書いたのは、そのスロットに入った例です。">
        <HeapFigure />
      </Figure>
      <p>この区別はメモリーの量を読むときに関係します。<code>GC.stat</code> のスロットの数が同じでも、malloc に置いた本文が大きければプロセスのメモリーは多くなります。大きな JSON の文字列や、要素の多い配列とハッシュは、スロットの外の領域をおもに使います。スロットの外の領域を増やす割り当ては <code>GC.stat(:malloc_increase_bytes)</code> に数えられ、一定量を超えると GC のきっかけにもなります。</p>
    </> },
    { id: 'gc', title: 'GC は実行中にたどれる値を残す', body: <>
      <p><Term en="Garbage Collection">GC</Term> は、今後どこからも使えないオブジェクトのスロットを空きに戻し、次の割り当てに使えるようにします。まず、実行中のフレーム、定数、グローバル変数などの出発点から参照をたどり、たどれたオブジェクトに印を付けます（マーク）。次にヒープのページを順に見て、印のないスロットを空きに戻します（スイープ）。互いに参照し合う配列 A と B でも、出発点からたどれなければ回収されます。参照を外したときにどうなるかは、この節の後の操作できる図で確かめられます。</p>
      <p>調べる対象の GC が既定の実装かどうかを、先に確かめます。Ruby 4.0 では GC の実装を差し替えられる構成があり、<code>GC.config</code> で今の実装の名前を読めます。この章の実行環境では <code>{'{rgengc_allow_full_mark: true, implementation: "default"}'}</code> で、以下はこの既定の GC（gc/default/default.c）の話です。<Ref n={5} /></p>
      <h3>世代別 GC</h3>
      <p>Rails のプロセスでは、起動時に読み込んだクラスや設定のように最後まで残るオブジェクトと、1回の要求の中だけで使う一時的な文字列やハッシュが混ざっています。毎回すべてのオブジェクトをたどると、残り続けるオブジェクトを何度も調べることになります。そこで既定の GC は、GC を3回生き延びたオブジェクトを<Term>古い世代</Term>として扱います（default.c の <code>RVALUE_OLD_AGE</code> が 3）。ふだんの <Term en="minor GC">minor GC</Term> は若いオブジェクトだけを調べ、ときどき行う <Term en="major GC">major GC</Term> で全体を調べます。</p>
      <p>短命なオブジェクトだけを作る場合と、作ったオブジェクトを配列に残し続ける場合で、GC の回数の内訳を比べました。</p>
      <Code lang="ruby" title="gen.rb" code={`KEYS = %i[count minor_gc_count major_gc_count old_objects heap_live_slots total_allocated_objects total_freed_objects]
def diff(before, after) = KEYS.to_h { [_1, after[_1] - before[_1]] }

GC.start
before = GC.stat
1_000_000.times { |i| "tmp #{i}" }            # 作ってすぐ使わなくなる文字列
p short_lived: diff(before, GC.stat)

GC.start
before = GC.stat
kept = Array.new(1_000_000) { |i| "keep #{i}" } # 配列から参照し続ける文字列
p long_lived: diff(before, GC.stat)
p latest: GC.latest_gc_info.slice(:major_by, :gc_by, :immediate_sweep)
p GC.stat.slice(:old_objects, :old_objects_limit, :heap_live_slots, :heap_free_slots, :time, :marking_time, :sweeping_time)`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9。値は前後の差）" code={`{short_lived: {count: 308, minor_gc_count: 308, major_gc_count: 0, old_objects: 5667, heap_live_slots: 4153, total_allocated_objects: 1999993, total_freed_objects: 1995840}}
{long_lived: {count: 22, minor_gc_count: 17, major_gc_count: 5, old_objects: 506586, heap_live_slots: 1089931, total_allocated_objects: 1999996, total_freed_objects: 910065}}
{latest: {major_by: nil, gc_by: :newobj, immediate_sweep: false}}
{old_objects: 525289, old_objects_limit: 893500, heap_live_slots: 1108715, heap_free_slots: 58024, time: 399, marking_time: 254, sweeping_time: 145}`} />
      <p>どちらも約200万個を割り当てました（式展開の結果と、<code>i</code> を文字列にした値で1回につき2個）。短命な場合は GC が308回起きましたが、すべて minor GC で、使用中のスロットはほとんど増えていません。残し続ける場合は GC の回数が22回と少ない一方、major GC が5回起き、古い世代のオブジェクトが約50万個増えました。若いオブジェクトが多いほど minor GC が多くなり、古い世代が増えると major GC が起きます。最後の行の <code>old_objects_limit</code> は、古い世代がこの数を超えると次の GC を major GC にする上限です。</p>
      <h3>書き込みバリア</h3>
      <p>minor GC が古いオブジェクトの中を調べないと、古い配列に後から入れた新しい文字列を見落とすおそれがあります。これを防ぐのが<Term en="write barrier">書き込みバリア</Term>です。C で書かれた Array や Hash の更新処理は、参照を書き込むときに <code>RB_OBJ_WRITE</code> などを通して GC に知らせます。古いオブジェクトが若いオブジェクトへの参照を持ったときは、その古いオブジェクトを「覚えておく集合」（remembered set）に入れます。minor GC は出発点に加えてこの集合からもたどります。<Ref n={4} /></p>
      <Code lang="text" title="gc/default/default.c（6031〜6052行目から抜粋）" href={`${RB}/gc/default/default.c#L6031-L6052`} code={`gc_writebarrier_generational(VALUE a, VALUE b, rb_objspace_t *objspace)
{
    /* mark \`a' and remember (default behavior) */
    if (!RVALUE_REMEMBERED(objspace, a)) {
        ...
            rgengc_remember(objspace, a);
        ...
    }
}`} />
      <GenerationalFigure />
      <p>C 拡張の中には、書き込みバリアを通さずに参照を書き換えるオブジェクトもあります。GC はそれらを書き込みバリアを持たないオブジェクトとして別に扱い、minor GC のたびに中を調べます。Ruby 4.0 の NEWS には、<code>Random</code> や <code>StringScanner</code> などが書き込みバリアに対応し、GC の負担が減ったことが書かれています。<Ref n={7} /></p>
    </> },
    { id: 'gc-timing', title: 'GC を少しずつ進める：インクリメンタルマークとコンパクション', body: <>
      <p>GC がマークやスイープをしている間、Ruby のコードは止まります。major GC で全体を一度にマークすると、生きているオブジェクトが多いプロセスでは止まる時間が長くなります。そこで既定の GC は、major GC のマークを小分けにし、割り当ての合間に少しずつ進めます（<Term en="incremental marking">インクリメンタルマーク</Term>）。スイープも、空きが必要になった分のページから順に行います（遅延スイープ）。default.c では、マークを1回進めるまでの割り当て数の目安が <code>INCREMENTAL_MARK_STEP_ALLOCATIONS</code>（500）です。<Ref n={4} /></p>
      <p>長く残る文字列を増やしながら、100個ごとに <code>GC.latest_gc_info(:state)</code> を調べ、GC の状態が変わった時点を表示しました。state は、GC がしていない間は <code>none</code>、マークの途中なら <code>marking</code>、スイープの途中なら <code>sweeping</code> です。</p>
      <Code lang="ruby" title="incr.rb" code={`kept = []
last = nil
100_000.times do |i|
  kept << "keep #{i}"
  next unless i % 100 == 0
  now = [GC.stat(:count), GC.stat(:major_gc_count), GC.latest_gc_info(:major_by), GC.latest_gc_info(:state)]
  puts "i=#{i} GC回数=#{now[0]} major=#{now[1]} major_by=#{now[2].inspect} state=#{now[3]}" if now != last
  last = now
end`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9、先頭の18行）" code={`i=0 GC回数=3 major=1 major_by=nil state=none
i=600 GC回数=4 major=2 major_by=:oldgen state=marking
i=1400 GC回数=4 major=2 major_by=:oldgen state=sweeping
i=2600 GC回数=4 major=2 major_by=:oldgen state=none
i=3900 GC回数=5 major=2 major_by=nil state=none
i=10100 GC回数=6 major=2 major_by=nil state=sweeping
i=11500 GC回数=6 major=2 major_by=nil state=none
i=13200 GC回数=7 major=2 major_by=nil state=none
i=14300 GC回数=8 major=3 major_by=:nofree state=marking
i=14800 GC回数=8 major=3 major_by=:nofree state=none
i=24600 GC回数=9 major=3 major_by=nil state=sweeping
i=27000 GC回数=9 major=3 major_by=nil state=none
i=29500 GC回数=10 major=3 major_by=nil state=sweeping
i=30700 GC回数=10 major=3 major_by=nil state=none
i=42500 GC回数=11 major=3 major_by=nil state=sweeping
i=46000 GC回数=12 major=4 major_by=:nofree state=marking
i=48700 GC回数=12 major=4 major_by=:nofree state=sweeping
i=49800 GC回数=12 major=4 major_by=:nofree state=none`} />
      <p>600個目で4回目の GC（major GC）が始まり、1400個目を調べた時点ではマークを終えてスイープ中、2600個目で終わっていました。その間もループは文字列を追加し続けています。<code>major_by</code> は major GC になった理由で、<code>oldgen</code> は古い世代が上限を超えたこと、<code>nofree</code> はスイープしても空きが足りなかったことを表します。minor GC（major_by が nil の回）の多くも、スイープを後回しにして数千個分の追加の間に終えています（図 {figureNumber(97, 7)}）。</p>
      <Figure n={figureNumber(97, 7)} title="文字列を追加しながら観測した GC の状態" caption="incr.rb の出力（i が 5 万までの範囲）を時間の代わりに追加した個数で並べた図です。GC が止めている時間の長さは表していません。">
        <GcTimelineFigure />
      </Figure>
      <p>小分けにしても、GC にかかる時間の合計は減りません。要求1件の応答時間に GC の時間が入るかどうかが変わるだけです。<code>GC.stat</code> の <code>time</code>（GC の合計時間、ミリ秒）、<code>marking_time</code>、<code>sweeping_time</code> で合計を確かめられます。gen.rb の最後の行に表示した値は、それぞれ 399、254、145 でした。</p>
      <h3>コンパクション</h3>
      <p>スイープで空いたスロットは、ページのあちこちに散らばります。1ページに生きたオブジェクトが1個でも残れば、そのページを OS に返せません。<Term en="compaction">コンパクション</Term>は、オブジェクトを別のスロットへ移して参照を書き換え、空いたページを作ります。50万個のオブジェクトを作り、1つおきに参照を外してから <code>GC.compact</code> を呼びました。</p>
      <Code lang="ruby" title="compact.rb" code={`def heap0 = GC.stat_heap(0).slice(:heap_eden_pages, :heap_eden_slots, :heap_live_slots, :heap_free_slots)

objects = Array.new(500_000) { Object.new }
GC.start
p before_drop: heap0
objects.each_index { |i| objects[i] = nil if i.odd? } # 半分を参照から外す
GC.start
p after_drop: heap0
result = GC.compact
p after_compact: heap0
p moved: result[:moved].values.sum, considered: result[:considered].values.sum
p auto_compact: GC.auto_compact`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9、40 バイトのスロットのヒープ）" code={`{before_drop: {heap_eden_pages: 314, heap_eden_slots: 514143, heap_live_slots: 513167, heap_free_slots: 976}}
{after_drop: {heap_eden_pages: 314, heap_eden_slots: 514143, heap_live_slots: 263177, heap_free_slots: 250966}}
{after_compact: {heap_eden_pages: 164, heap_eden_slots: 268534, heap_live_slots: 263141, heap_free_slots: 5393}}
{moved: 128752, considered: 128756}
{auto_compact: false}`} />
      <p>半分を外して GC した後も、ページは314枚のままで、空きスロットが約25万個に増えただけでした。<code>GC.compact</code> で約12万9千個を移すと、ページは164枚に減りました。<code>GC.auto_compact</code> は既定で false で、major GC のたびに自動で行う設定は有効になっていません。C 拡張が直接アドレスを持っているオブジェクトなど、移せないものもあります。</p>
      <p>Puma の <code>preload_app!</code> を使う構成では、ワーカーを fork する前に親のプロセスで GC とコンパクションを済ませておくと、ワーカーが共有したまま使えるページが増える場合があります（<ChapterLink n={23} section="preload" />）。効果はアプリケーションによって違うので、PSS（複数のプロセスが共有しているページを、共有しているプロセスの数で割って数えたメモリーの量）を測って判断します。</p>
    </> },
    { id: 'diagnostics', title: '割り当てと保持を分けて測る', body: <>
      <p>メモリーの問題には、大きく2種類あります。1つは、一時的なオブジェクトを大量に作り、GC が頻繁に動くこと（割り当てが多い）です。もう1つは、要求が終わった後もオブジェクトを参照し続け、GC しても使用中のスロットが減らないこと（保持が多い）です。対策が違うので、まずどちらが起きているかを見分けます。よく使う <code>GC.stat</code> の値は次のとおりです。<Ref n={5} /></p>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">キー</th><th scope="col">意味</th><th scope="col">読み方</th></tr></thead>
        <tbody>
          <tr><th scope="row"><code>total_allocated_objects</code></th><td>起動からの割り当ての累計</td><td>処理の前後の差が、その処理で作ったオブジェクトの数</td></tr>
          <tr><th scope="row"><code>heap_live_slots</code></th><td>今使っているスロットの数</td><td>GC の直後に測ると、保持しているオブジェクトの数に近い</td></tr>
          <tr><th scope="row"><code>minor_gc_count</code>・<code>major_gc_count</code></th><td>GC の種類ごとの回数</td><td>major が増え続けるなら古い世代が増えている</td></tr>
          <tr><th scope="row"><code>old_objects</code></th><td>古い世代のオブジェクトの数</td><td>要求を繰り返すたびに増えるなら、どこかで保持している</td></tr>
          <tr><th scope="row"><code>time</code></th><td>GC に使った時間の合計（ミリ秒）</td><td>負荷をかける前後の差を、処理件数で割る</td></tr>
          <tr><th scope="row"><code>malloc_increase_bytes</code></th><td>前回の GC からの malloc の増加量</td><td>スロットの外に大きな本文を作っているかの手がかり</td></tr>
        </tbody>
      </table></div>
      <p>最初の例は1万個の文字列を作る前後の値です。</p>
      <Code lang="ruby" title="diag1.rb" code={`before = GC.stat
items = Array.new(10_000) { |i| "Article #{i}" }
after = GC.stat
p allocated: after.fetch(:total_allocated_objects) - before.fetch(:total_allocated_objects)
p live: after.fetch(:heap_live_slots)
p items.size`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`{allocated: 19996}
{live: 34777}
10000`} />
      <p>割り当ては約2万個で、1万個ではありません。式展開の <code>"Article #{'{'}i{'}'}"</code> は、<code>i</code> を文字列にした値と、つなげた結果の2個を作るからです。<code>heap_live_slots</code> は起動時に読み込んだクラスなども含む、プロセス全体の値です。</p>
      <p>次に、要求を模した処理を5回繰り返し、毎回 GC の直後に使用中のスロットを測りました。検索結果をクラスのハッシュに保存し続ける場合（<code>cache: true</code>）と保存しない場合を比べます。</p>
      <Code lang="ruby" title="diag2.rb" code={`class SearchCache
  @results = {}
  class << self
    attr_reader :results
  end
end

def handle_request(n, cache:)
  rows = Array.new(2_000) { |i| { id: i, title: "Article #{n}-#{i}" } } # 一時的なハッシュと文字列
  html = rows.map { |r| "<li>#{r[:title]}</li>" }.join
  SearchCache.results["q#{n}"] = rows if cache                         # 結果をクラスに保存し続ける
  html.bytesize
end

handle_request(0, cache: false) # 1回目の呼び出しで作られる定数などを除くための準備

[false, true].each do |cache|
  live = 5.times.map do |n|
    before = GC.stat(:total_allocated_objects)
    handle_request(n, cache: cache)
    allocated = GC.stat(:total_allocated_objects) - before
    GC.start
    [allocated, GC.stat(:heap_live_slots)]
  end
  puts "cache=#{cache}"
  live.each_with_index { |(a, l), n| puts "  #{n + 1}回目 割り当て #{a} 個 / GC 後の使用中スロット #{l}" }
end`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`cache=false
  1回目 割り当て 7994 個 / GC 後の使用中スロット 20760
  2回目 割り当て 7993 個 / GC 後の使用中スロット 22761
  3回目 割り当て 7993 個 / GC 後の使用中スロット 22762
  4回目 割り当て 7993 個 / GC 後の使用中スロット 22763
  5回目 割り当て 7993 個 / GC 後の使用中スロット 22764
cache=true
  1回目 割り当て 7997 個 / GC 後の使用中スロット 24775
  2回目 割り当て 7995 個 / GC 後の使用中スロット 28778
  3回目 割り当て 7995 個 / GC 後の使用中スロット 32781
  4回目 割り当て 7995 個 / GC 後の使用中スロット 36784
  5回目 割り当て 7995 個 / GC 後の使用中スロット 40787`} />
      <p>どちらも1回あたりの割り当ては約8,000個で、割り当ての量は同じです。違うのは GC 後の値の増え方です。<code>cache=false</code> では、2回目以降は1回に1つずつしか増えていません（結果を入れる配列の要素の分）。1回目と2回目の間の約2,000の差は、この実験では原因を特定していません。<code>cache=true</code> では、毎回約4,000ずつ増え続けています。保存した2,000個のハッシュと2,000個の文字列が、要求の後も残っているからです。1回の値ではなく、同じ処理を繰り返したときの増え方を見ると、保持が起きているかを判断できます。</p>
      <p>残っているオブジェクトがどこで作られたかは、<code>ObjectSpace.trace_object_allocations</code> で調べられます。記録を有効にしている間に作ったオブジェクトに、ファイル名と行番号が付きます。<Ref n={14} /></p>
      <Code lang="ruby" title="diag3.rb" code={`require "objspace"
def build_rows = Array.new(3) { |i| { id: i, title: "Article #{i}" } }

ObjectSpace.trace_object_allocations_start
kept = build_rows
ObjectSpace.trace_object_allocations_stop
GC.start

counts = Hash.new(0)
ObjectSpace.each_object(String) do |s|
  file = ObjectSpace.allocation_sourcefile(s)
  next unless file == __FILE__
  counts["#{File.basename(file)}:#{ObjectSpace.allocation_sourceline(s)}"] += 1
end
p counts
p ObjectSpace.count_objects.slice(:TOTAL, :FREE, :T_OBJECT, :T_STRING, :T_ARRAY, :T_HASH)
puts ObjectSpace.dump(kept.first[:title])`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`{"diag3.rb:3" => 3}
{TOTAL: 32021, FREE: 8501, T_OBJECT: 247, T_STRING: 13786, T_ARRAY: 1491, T_HASH: 116}
{"address":"0x7fa8e85e9dc0", "type":"STRING", "shape_id":0, "slot_size":40, "class":"0x7fa8ea4cec40", "embedded":true, "bytesize":9, "value":"Article 0", "encoding":"UTF-8", "coderange":"unknown", "file":"diag3.rb", "line":3, "method":"build_rows", "generation":3, "memsize":40, "flags":{"wb_protected":true, "age":2}}`} />
      <p>GC の後も残っている文字列のうち、このファイルで作ったものは3行目の3個でした。<code>ObjectSpace.count_objects</code> は種類ごとのスロットの数、<code>ObjectSpace.dump</code> は1個のオブジェクトの詳細を JSON で返します。dump の <code>slot_size</code>、<code>embedded</code>、<code>age</code> は、前の節までで見たスロットの大きさ、埋め込み、世代に対応しています。<code>ObjectSpace.dump_all</code> を使えばヒープ全体を書き出せますが、大きなプロセスでは時間とディスクを多く使うので、本番のプロセスで実行する前に検証環境で試します。</p>
      <p>Rails のアプリケーションで測るときは、起動直後の値ではなく、同じ要求を何度か送った後の値を比べます。最初の数回はクラスの読み込みやキャッシュの作成で値が動くからです。要求ごとに <code>GC.start</code> を呼ぶと、その GC の時間が応答時間に入るので、応答時間の計測と保持の調査は分けて行います。Rails のプロファイラーやベンチマークの使い方は <ChapterLink n={112} /> で扱います。</p>
    </> },
    { id: 'process-memory', title: 'Rails のプロセスでメモリーが増える理由', body: <>
      <p>ここまでの <code>GC.stat</code> は Ruby のヒープの中だけを数えています。OS から見たプロセスのメモリー（RSS：物理メモリーに載っているページの合計）には、ほかにも次のものが入ります。</p>
      <ul>
        <li>malloc で確保した領域：長い文字列の本文、配列やハッシュの要素の表、C 拡張（mysql2、nokogiri など）が使う領域</li>
        <li>読み込んだ共有ライブラリ（libruby など）と、YJIT が作った機械語</li>
        <li>スレッドごとの VM スタックと OS のスタック</li>
      </ul>
      <p>Linux の多くのディストリビューションの malloc は glibc の実装です。glibc の malloc は、複数のスレッドが同時に malloc を呼んでも待たずに済むよう、<Term en="arena">アリーナ</Term>と呼ぶ独立した領域を複数持ち、スレッドごとに別のアリーナを使います。各アリーナは解放された領域を自分の中で再利用します。あるアリーナで空いた領域を、別のスレッドのアリーナが使うことはありません。アリーナの中で、まだ使っている小さな領域が空き領域の間に散らばると、OS に返せる連続した空きができません。この状態を<Term en="fragmentation">断片化</Term>と呼びます。Puma のように複数のスレッドが要求を処理するプロセスでは、アリーナの数と断片化の両方で RSS が増えます。</p>
      <p>8本のスレッドが、malloc に本文を置く大きさ（700〜8,000 バイト）の文字列を作っては捨て、その1%だけを残し続けるスクリプトで確かめました。残す文字列の量は、3つの条件で同じ約100MB です。</p>
      <Code lang="ruby" title="arena.rb" code={`require "fiddle"

def rss_mb = File.read("/proc/self/status")[/VmRSS:\\s+(\\d+)/, 1].to_i / 1024

KEEP = Queue.new
threads = 8.times.map do |t|
  Thread.new do
    rng = Random.new(t)
    300.times do |round|
      batch = Array.new(1_000) { "x" * rng.rand(700..8_000) } # 700 バイト以上は malloc の領域に本文を置く
      KEEP << batch.sample(10, random: rng)                   # 1% だけを残す（キャッシュを模す）
    end
  end
end
threads.each(&:join)
GC.start

kept_bytes = 0
KEEP.size.times { KEEP.pop.each { |s| kept_bytes += s.bytesize } }
printf("残した文字列 %.1f MB / GC 後の RSS %d MB\\n", kept_bytes / 1024.0 / 1024, rss_mb)
if ENV["LD_PRELOAD"].to_s.empty?
  # glibc の malloc_stats() が標準エラーに出すアリーナごとの統計から、アリーナの数を数える
  libc = Fiddle.dlopen(nil)
  malloc_stats = Fiddle::Function.new(libc["malloc_stats"], [], Fiddle::TYPE_VOID)
  r, w = IO.pipe
  saved = $stderr.dup
  $stderr.reopen(w); malloc_stats.call; $stderr.reopen(saved); w.close
  out = r.read
  puts "glibc のアリーナ数: #{out.scan(/^Arena \\d+:/).size}"
end`} />
      <Code lang="bash" title="同じコンテナで3通りに実行する" code={`apt-get install -y libjemalloc2
ruby arena.rb
MALLOC_ARENA_MAX=2 ruby arena.rb
LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2 ruby arena.rb`} />
      <Code lang="text" title="実行結果（ruby:4.0 のコンテナ、glibc 2.41、jemalloc 5.3.0、4 コアのマシン）" code={`== 既定
残した文字列 100.1 MB / GC 後の RSS 455 MB
glibc のアリーナ数: 9
== MALLOC_ARENA_MAX=2
残した文字列 100.1 MB / GC 後の RSS 211 MB
glibc のアリーナ数: 2
== jemalloc
残した文字列 100.1 MB / GC 後の RSS 359 MB`} />
      <Figure n={figureNumber(97, 8)} title="malloc の実装と設定による RSS の違い" caption="arena.rb の結果です。同じ量の文字列を残しても、malloc の領域の使い方で RSS が変わります。この負荷での結果で、どの設定が少なくなるかはアプリケーションによって違います。">
        <ArenaFigure />
      </Figure>
      <p>既定では、メインのアリーナと8本のスレッドの分で9個のアリーナができ、残した量の4倍を超える 455MB になりました。<code>MALLOC_ARENA_MAX=2</code> はアリーナの数の上限を決める環境変数で、glibc の説明書では、同じ働きを持つ <code>glibc.malloc.arena_max</code> を「CPU のコア数に関係なくプロセスで使うアリーナの数」としています。<Ref n={16} /> アリーナが2個になると、空いた領域を別のスレッドも再利用できるので、RSS は 211MB に下がりました。その代わり、同時に malloc を呼ぶスレッドがロックを待つことがあります。</p>
      <p>jemalloc は glibc とは別の malloc の実装で、<code>LD_PRELOAD</code> で読み込むと malloc の呼び出しを置き換えます。Rails 8.1 の rails new が作る Dockerfile は、libjemalloc2 を入れて <code>LD_PRELOAD</code> を設定し、コメントで「メモリー使用量と遅延を減らすため」と説明しています。<Ref n={17} /> この実験では、jemalloc は既定の glibc より約100MB 少なくなりましたが、アリーナを2個にした glibc よりは多くなりました。jemalloc は空いた領域をすぐには OS に返さず、時間をおいて返すので、測るタイミングでも値が変わります。どの方法が少なくなるかは、割り当てる大きさの分布、スレッドの数、測る時点で変わるので、自分のアプリケーションで同じ負荷をかけて比べます。</p>
      <h3>Rails のプロセスで測る</h3>
      <p>本番に近い環境で、次の順に値を集めます。</p>
      <ol>
        <li>ワーカーのプロセスの RSS と PSS を、起動直後と、同じ負荷を一定時間かけた後に記録する（Linux の <code>/proc/PID/status</code> と <code>/proc/PID/smaps_rollup</code>）。Puma のワーカーごとの見方は <ChapterLink n={23} section="memory" />で扱いました。</li>
        <li>同じ時点の <code>GC.stat</code> の <code>heap_live_slots</code>、<code>old_objects</code>、<code>major_gc_count</code> を、ワーカーの中で記録する。</li>
        <li>RSS は増え続けるのに Ruby のヒープの値が横ばいなら、malloc の断片化、C 拡張、スレッドの数を疑い、<code>MALLOC_ARENA_MAX</code> や jemalloc を1つずつ試す。</li>
        <li>Ruby のヒープの値も増え続けるなら、前の節の方法で保持している場所を探す。</li>
      </ol>
      <p>RSS がすぐに下がらないことだけでは、解放漏れとも、GC が動いていないとも判断できません。GC で空いたスロットのページや、malloc が解放した領域は、次の割り当てのためにプロセスの中に残ることが多いからです。</p>
    </> },
    { id: 'tradeoffs', title: '判断基準とトレードオフ', body: <>
      <p>この章の内容を実務で判断する場面ごとにまとめます。</p>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">場面</th><th scope="col">まず確かめること</th><th scope="col">選択肢とその代償</th></tr></thead>
        <tbody>
          <tr><th scope="row">Ruby の計算が遅い</th><td>YJIT が有効か（<code>RubyVM::YJIT.enabled?</code>）。時間の多くが DB や外部の待ちでないか</td><td>YJIT はワーカーごとにメモリーを使う。ZJIT は Ruby 4.0 では実験的で、NEWS は本番での利用を勧めていない</td></tr>
          <tr><th scope="row">同じ位置で多くのクラスを扱う</th><td>要求ごとの <code>extend</code> や特異メソッド、定数の定義し直しがないか</td><td>書き方を変えるとキャッシュが効きやすくなる。差は小さいことが多いので、実測で効果がある箇所だけ直す</td></tr>
          <tr><th scope="row">GC の回数が多い</th><td><code>total_allocated_objects</code> の増え方。一時的な配列やハッシュを大量に作っていないか</td><td><code>pluck</code> で必要な列だけ取る、<code>find_each</code> で分ける、などで割り当てを減らす。コードが読みにくくなる場合がある</td></tr>
          <tr><th scope="row">使用中のスロットが増え続ける</th><td>繰り返しの後の <code>heap_live_slots</code> と <code>old_objects</code>。クラスや定数に要求ごとの値を入れていないか</td><td>保存する期間や件数に上限を付ける。プロセス内に保存するより Rails.cache などに移す</td></tr>
          <tr><th scope="row">RSS だけが増える</th><td>Ruby のヒープの値との差。スレッドの数と C 拡張</td><td><code>MALLOC_ARENA_MAX=2</code> はロックの待ちが増える場合がある。jemalloc はイメージに追加するライブラリが増える。どちらも同じ負荷で比べてから採る</td></tr>
        </tbody>
      </table></div>
      <p>GC の動きを環境変数（<code>RUBY_GC_HEAP_*</code> など）で調整することもできます。ただし、割り当てや保持の原因がアプリケーションにある場合、GC の設定では解決しません。まずこの章の方法で原因の種類を見分け、設定の変更は最後の選択肢にします。これは筆者の意見です。</p>
      <Callout kind="note" title="関連する章">
        <ul>
          <li>メソッドの探索順：<ChapterLink n={2} section="method-lookup" /></li>
          <li>クロージャーが参照を保持する例：<ChapterLink n={4} section="closure" /></li>
          <li>Rails が YJIT を有効にする場所：<ChapterLink n={7} section="finisher" /></li>
          <li>スレッド・Fiber と GVL：<ChapterLink n={98} /></li>
          <li>Puma のワーカーとメモリー、preload_app!：<ChapterLink n={23} section="memory" />、<ChapterLink n={23} section="preload" /></li>
          <li>プロファイリングとベンチマーク：<ChapterLink n={112} /></li>
        </ul>
      </Callout>
    </> },
  ],
  sources: [
    { title: 'RubyVM::InstructionSequence', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/RubyVM/InstructionSequence.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: '命令列の生成、表示、評価' },
    { title: 'vm_exec.c', publisher: 'Ruby', url: `${RB}/vm_exec.c`, accessed: '2026-11-27', version: '4.0.9', note: 'VM の実行処理' },
    { title: 'insns.def', publisher: 'Ruby', url: `${RB}/insns.def`, accessed: '2026-11-27', version: '4.0.9', note: 'VM の命令の定義。opt_plus（1316〜1328行目）' },
    { title: '既定 GC の実装（gc/default/default.c）', publisher: 'Ruby', url: `${RB}/gc/default/default.c`, accessed: '2026-11-27', version: '4.0.9', note: 'RVALUE_OLD_AGE（746行目）、INCREMENTAL_MARK_STEP_ALLOCATIONS（698〜699行目）、HEAP_PAGE_SIZE、書き込みバリア（6031〜6052行目）' },
    { title: 'GC', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/GC.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: 'GC.stat、GC.stat_heap、GC.latest_gc_info、GC.compact、GC.config' },
    { title: 'TracePoint', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/TracePoint.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: 'Ruby メソッドの呼び出しを検出する :call イベント' },
    { title: 'NEWS for Ruby 4.0.0', publisher: 'Ruby', url: `${RB}/NEWS.md`, accessed: '2026-11-27', version: '4.0.9 のタグの NEWS.md', note: 'ZJIT（実験的、本番での利用は勧めない）、YJIT の変更、GC と可変幅の割り当ての改善、書き込みバリアに対応したクラス' },
    { title: 'vm_insnhelper.c', publisher: 'Ruby', url: `${RB}/vm_insnhelper.c`, accessed: '2026-11-27', version: '4.0.9', note: 'vm_search_method_fastpath（2363〜2389行目）、vm_opt_plus（6734行目〜）' },
    { title: 'iseq.c', publisher: 'Ruby', url: `${RB}/iseq.c#L2772-L2783`, accessed: '2026-11-27', version: '4.0.9', note: 'disasm に表示するイベントの略号（Li・Ca・Re・Cc・Cr など）' },
    { title: 'YJIT - Yet Another Ruby JIT（doc/jit/yjit.md）', publisher: 'Ruby', url: `${RB}/doc/jit/yjit.md`, accessed: '2026-11-27', version: '4.0.9', note: '--yjit-mem-size の既定値 128MiB、--yjit-call-threshold' },
    { title: 'ZJIT（doc/jit/zjit.md）', publisher: 'Ruby', url: `${RB}/doc/jit/zjit.md`, accessed: '2026-11-27', version: '4.0.9', note: 'ZJIT のオプション。既定の閾値は zjit/src/options.rs の DEFAULT_CALL_THRESHOLD（30）' },
    { title: 'yjit/src/options.rs', publisher: 'Ruby', url: `${RB}/yjit/src/options.rs#L6-L18`, accessed: '2026-11-27', version: '4.0.9', note: 'SMALL_CALL_THRESHOLD（30）、LARGE_CALL_THRESHOLD（120）、LARGE_ISEQ_COUNT（40,000）。切り替えは yjit/src/yjit.rs の176〜177行目' },
    { title: 'railties/lib/rails/application/configuration.rb', publisher: 'Ruby on Rails', url: `${GH}/railties/lib/rails/application/configuration.rb#L340-L349`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'load_defaults "8.1" で yjit を !Rails.env.local? にする。有効にするのは finisher.rb の enable_yjit（230〜235行目）' },
    { title: 'ObjectSpace', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/ObjectSpace.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: 'count_objects、each_object、memsize_of、trace_object_allocations、dump（objspace ライブラリ）' },
    { title: 'RubyVM', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/RubyVM.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: 'RubyVM.stat、RubyVM::DEFAULT_PARAMS' },
    { title: 'Memory Allocation Tunables', publisher: 'The GNU C Library', url: 'https://sourceware.org/glibc/manual/latest/html_node/Memory-Allocation-Tunables.html', accessed: '2026-11-27', version: 'glibc マニュアル（latest）。実験は glibc 2.41', note: 'glibc.malloc.arena_max は CPU のコア数に関係なくアリーナの数を決め、MALLOC_ARENA_MAX と同じ働きを持つ' },
    { title: 'Dockerfile.tt（rails new のテンプレート）', publisher: 'Ruby on Rails', url: `${GH}/railties/lib/rails/generators/rails/app/templates/Dockerfile.tt#L18-L28`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'libjemalloc2 を入れ、LD_PRELOAD で jemalloc を使う' },
  ],
}

export default chapter
