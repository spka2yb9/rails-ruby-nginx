import { useState } from 'react'
import { figureNumber } from '../content/label'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 1,000 件を読む3つの方法 ---------- */
function ProjectionFigure() {
  const rows = [
    { name: 'to_a（全列）', bytes: 721493, alloc: 15160, ms: 61.9 },
    { name: 'select(:id, :title)', bytes: 29149, alloc: 11138, ms: 38.8 },
    { name: 'pluck(:id, :title)', bytes: 29149, alloc: 5136, ms: 9.7 },
  ]
  const panels = [
    { x: 180, title: '転送量（バイト）', max: 721493, w: 120, get: (r: (typeof rows)[0]) => r.bytes, fmt: (v: number) => `${v.toLocaleString('en-US')} B` },
    { x: 390, title: '割り当てたオブジェクト', max: 15160, w: 110, get: (r: (typeof rows)[0]) => r.alloc, fmt: (v: number) => v.toLocaleString('en-US') },
    { x: 580, title: '時間の中央値', max: 61.9, w: 120, get: (r: (typeof rows)[0]) => r.ms, fmt: (v: number) => `${v} ms` },
  ]
  return (
    <Svg
      id="100-2"
      w={780}
      h={256}
      label="公開記事 1,000 件の番号と題名を3つの方法で読んだ結果。to_a は全列を受け取り転送量は 721,493 バイト、select と pluck は 29,149 バイト。割り当てたオブジェクトは to_a が 15,160、select が 11,138、pluck が 5,136。時間の中央値は 61.9 ミリ秒、38.8 ミリ秒、9.7 ミリ秒"
    >
      {panels.map((p) => (
        <T key={p.title} x={p.x} y={30} bold fs={12}>
          {p.title}
        </T>
      ))}
      {rows.map((r, i) => {
        const y = 52 + i * 50
        return (
          <g key={r.name}>
            <T x={20} y={y + 13} fs={12} mono>
              {r.name}
            </T>
            {panels.map((p) => {
              const v = p.get(r)
              const bw = Math.max(2, (v / p.max) * p.w)
              return (
                <g key={p.title}>
                  <rect x={p.x} y={y} width={bw} height={26} rx={3} fill={i === 2 ? 'var(--fig-box5)' : 'var(--fig-box4)'} stroke="var(--fig-line)" />
                  <T x={p.x + bw + 6} y={y + 13} fs={11}>
                    {p.fmt(v)}
                  </T>
                </g>
              )
            })}
          </g>
        )
      })}
      <T x={20} y={214} fs={11} tone="muted">
        公開記事 1,000 件。3つとも SQL は1回、MySQL が読んだ行は 1,111 行で同じ（MySQL 8.4.13・Active Record 8.1.4.1）
      </T>
      <T x={20} y={234} fs={11} tone="muted">
        時間は3つを交互に21回ずつ実行した中央値。ほかの作業が動く共有のマシンで、回によって2〜3倍ぶれた
      </T>
    </Svg>
  )
}

/* ---------- 件数・有無のメソッドと Relation の状態 ---------- */
function CountStateFigure() {
  const rows: { m: string; unloaded: string; loaded: string; heavy?: boolean; none?: boolean }[] = [
    { m: 'count', unloaded: 'SELECT COUNT(*) を送る', loaded: 'SELECT COUNT(*) を送る' },
    { m: 'size', unloaded: 'SELECT COUNT(*) を送る', loaded: 'SQL なし（読み込んだ件数）', none: true },
    { m: 'length', unloaded: '全行を読み込む SELECT *', loaded: 'SQL なし（読み込んだ件数）', heavy: true, none: true },
    { m: 'exists?', unloaded: 'SELECT 1 … LIMIT 1 を送る', loaded: 'SELECT 1 … LIMIT 1 を送る' },
    { m: 'any? / empty?', unloaded: 'SELECT 1 … LIMIT 1 を送る', loaded: 'SQL なし', none: true },
    { m: 'present? / blank?', unloaded: '全行を読み込む SELECT *', loaded: 'SQL なし', heavy: true, none: true },
  ]
  return (
    <Svg
      id="100-4"
      w={780}
      h={330}
      label="Relation がまだ読み込まれていないとき、count と size は COUNT を、exists?、any?、empty? は LIMIT 1 の SELECT を送り、length と present? と blank? は全行を読み込む。読み込み済みのときは、size、length、any?、empty?、present?、blank? は SQL を送らず、count と exists? は SQL を送る"
    >
      <T x={330} y={24} anchor="middle" bold>
        まだ読み込んでいない Relation
      </T>
      <T x={630} y={24} anchor="middle" bold>
        読み込み済みの Relation
      </T>
      {rows.map((r, i) => {
        const y = 42 + i * 40
        return (
          <g key={r.m}>
            <T x={20} y={y + 15} fs={12.5} mono>
              {r.m}
            </T>
            <Box x={180} y={y} w={300} h={30} lines={r.unloaded} fs={12} fill={r.heavy ? 'box5' : 'box'} accent={r.heavy} />
            <Box x={490} y={y} w={280} h={30} lines={r.loaded} fs={12} fill={r.none ? 'bg' : 'box'} dashed={r.none} />
          </g>
        )
      })}
      <rect x={20} y={295} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={40} y={301} fs={11}>
        条件に合う全行を Ruby のオブジェクトにする
      </T>
      <rect x={360} y={295} width={14} height={12} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={380} y={301} fs={11}>
        読み込んだ配列を使い、SQL を送らない
      </T>
    </Svg>
  )
}

/* ---------- find_each の SQL とメモリー ---------- */
function BatchFigure() {
  const steps = [
    { x: 20, lines: ['1回目', 'id の条件なし', '→ 1,000 件（id 1〜1111）'] },
    { x: 215, lines: ['2回目', 'id > 1111', '→ 1,000 件'] },
    { x: 410, lines: ['3〜90回目', '前回の最後の id より後', '→ 1,000 件ずつ'] },
    { x: 605, lines: ['91回目', 'id > 99986', '→ 12 件で終わる'] },
  ]
  const mem = [
    { name: 'each（一括）', mb: 301 },
    { name: 'find_each', mb: 63 },
    { name: 'find_each + select', mb: 57 },
    { name: 'in_batches + pluck', mb: 50 },
  ]
  const x0 = 190
  const scale = 1.55
  return (
    <Svg
      id="100-5"
      w={780}
      h={350}
      label="find_each は公開記事を id の順に1,000件ずつ読む。2回目からは前回の最後の id より大きい行を条件にし、91回目に12件だけ返ったところで終わる。プロセスの物理メモリーの最大値は、全件を一度に読む each が 301MB、find_each が 63MB、select を付けた find_each が 57MB、in_batches と pluck が 50MB。開始時は約48MB"
    >
      <T x={20} y={20} bold>
        find_each(batch_size: 1000) が送る SQL
      </T>
      {steps.map((s, i) => (
        <g key={s.x}>
          <Box x={s.x} y={34} w={175} h={66} lines={s.lines} fs={12} fill={i === 3 ? 'box5' : 'box'} subTone="muted" bold />
          {i < 3 && <Arrow x1={s.x + 175} y1={67} x2={s.x + 193} y2={67} />}
        </g>
      ))}
      <T x={20} y={122} fs={11} tone="muted">
        どの回も WHERE published = TRUE AND id &gt; 前回の最後の id ORDER BY id LIMIT 1000（1回目は id の条件なし）
      </T>
      <T x={20} y={162} bold>
        公開記事 90,012 件を処理したときのメモリーの最大値（RSS）
      </T>
      <line x1={x0 + 48 * scale} y1={176} x2={x0 + 48 * scale} y2={310} stroke="var(--fig-accent)" strokeDasharray="4 3" />
      <T x={x0 + 48 * scale + 6} y={318} fs={11} tone="acc">
        開始時 約 48MB
      </T>
      {mem.map((m, i) => {
        const y = 184 + i * 30
        return (
          <g key={m.name}>
            <T x={20} y={y + 11} fs={12} mono>
              {m.name}
            </T>
            <rect x={x0} y={y} width={m.mb * scale} height={22} rx={3} fill={i === 0 ? 'var(--fig-box5)' : 'var(--fig-box4)'} stroke="var(--fig-line)" />
            <T x={x0 + m.mb * scale + 8} y={y + 11} fs={11}>
              {`${m.mb} MB`}
            </T>
          </g>
        )
      })}
      <T x={20} y={340} fs={11} tone="muted">
        各方法を別のプロセスで実行し、/proc/self/status の VmHWM を読んだ値（Ruby 4.0.9）
      </T>
    </Svg>
  )
}

/* ---------- OFFSET とキーセットで読んだ行 ---------- */
function PageDepthFigure() {
  const data = [
    { page: '1ページ目', off: 'OFFSET 0', o: 23, k: 23 },
    { page: '100ページ目', off: 'OFFSET 1,980', o: 2202, k: 24 },
    { page: '1,000ページ目', off: 'OFFSET 19,980', o: 22165, k: 21 },
    { page: '4,500ページ目', off: 'OFFSET 89,980', o: 99987, k: 24 },
  ]
  const x0 = 210
  const scale = 420 / 100000
  return (
    <Svg
      id="100-7"
      w={780}
      h={330}
      label="公開記事を id の降順に20件ずつ表示する。OFFSET の方式では MySQL が読んだ行は1ページ目で23行、100ページ目で2,202行、1,000ページ目で22,165行、4,500ページ目で99,987行に増えた。キーセットの方式ではどのページも21〜24行だった"
    >
      <T x={20} y={20} bold>
        id の降順に 20 件ずつ表示するとき MySQL が読んだ行
      </T>
      {data.map((d, i) => {
        const y = 44 + i * 64
        const ow = Math.max(2, d.o * scale)
        const kw = Math.max(2, d.k * scale)
        return (
          <g key={d.page}>
            <T x={20} y={y + 12} fs={12} bold>
              {d.page}
            </T>
            <T x={20} y={y + 32} fs={11} tone="muted" mono>
              {d.off}
            </T>
            <rect x={x0} y={y} width={ow} height={22} rx={3} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={x0 + ow + 8} y={y + 11} fs={11}>
              {`OFFSET：${d.o.toLocaleString('en-US')} 行`}
            </T>
            <rect x={x0} y={y + 26} width={kw} height={22} rx={3} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            <T x={x0 + kw + 8} y={y + 37} fs={11}>
              {`キーセット：${d.k} 行`}
            </T>
          </g>
        )
      })}
      <T x={20} y={308} fs={11} tone="muted">
        articles 100,000 行（公開 90,012 行）、索引は主キーと author_id だけ。読んだ行は performance_schema の値
      </T>
    </Svg>
  )
}

/* ---------- ページの深さを変える（操作できる図） ---------- */
const PUBLISHED_RATIO = 90012 / 100000
const MEASURED = [
  { page: 1, o: 23, ot: '1.60 ／ 0.86 ms', k: 23, kt: '0.93 ／ 0.54 ms' },
  { page: 100, o: 2202, ot: '0.68 ／ 0.64 ms', k: 24, kt: '0.35 ／ 0.33 ms' },
  { page: 1000, o: 22165, ot: '12.50 ／ 5.61 ms', k: 21, kt: '10.01 ／ 0.95 ms' },
  { page: 4500, o: 99987, ot: '525.15 ／ 333.49 ms', k: 24, kt: '1.08 ／ 0.77 ms' },
]

function PageDepthSlider() {
  const [page, setPage] = useState(1000)
  const fmt = (v: number) => v.toLocaleString('en-US')
  const skipped = (page - 1) * 20
  const offsetRows = Math.round((page * 20) / PUBLISHED_RATIO)
  const keysetRows = Math.round(20 / PUBLISHED_RATIO)
  const near = MEASURED.reduce((a, b) => (Math.abs(b.page - page) < Math.abs(a.page - page) ? b : a))
  const x0 = 130
  const width = 620
  const xAt = (rows: number) => x0 + (rows / 100000) * width
  const readW = Math.max(3, xAt(offsetRows) - x0)
  const jumpX = xAt(skipped / PUBLISHED_RATIO)
  const keyW = Math.max(3, xAt(keysetRows) - x0)
  return (
    <Figure
      n={figureNumber(100, 8)}
      title="ページ番号を変えて、2つの方式で読む行を比べる"
      caption="概念モデルです。公開記事 90,012 行が 100,000 行の中に一様に混ざっていると仮定し、読む行を OFFSET の方式ではページ番号 × 20 ÷ 0.90012、キーセットの方式では 20 ÷ 0.90012 で計算しています。実測した4つのページとの差は 100 ページ目以降で 1% 未満、1 ページ目とキーセットで 1〜2 行です。時間は計算せず、最も近い実測点の値を表に出します。実際の時間は、読む行がメモリーに載っているかや同時に動く処理で変わり、読む行の数に比例するとは限りません。"
    >
      <div className="sim-controls">
        <label>
          <span>ページ番号 <output>{fmt(page)}</output>（OFFSET {fmt(skipped)}）</span>
          <input type="range" min={1} max={4500} step={1} value={page} onChange={(e) => setPage(e.target.valueAsNumber)} />
        </label>
        <div>
          <span>実測したページへ移る</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {MEASURED.map((m) => (
              <button key={m.page} type="button" aria-pressed={page === m.page} onClick={() => setPage(m.page)} style={page === m.page ? { color: 'var(--accent)', borderColor: 'var(--accent)', background: 'var(--accent-soft)' } : undefined}>
                {fmt(m.page)} ページ目
              </button>
            ))}
          </div>
        </div>
      </div>
      <Svg
        id="100-8"
        w={780}
        h={230}
        label={`${fmt(page)} ページ目を表示するとき、OFFSET の方式は先頭から約 ${fmt(offsetRows)} 行を読み、そのうち公開記事 ${fmt(skipped)} 行を捨てて20行を返す。キーセットの方式は索引で直前のページの末尾の位置へ移り、約 ${keysetRows} 行だけを読む。`}
      >
        <T x={20} y={20} bold>
          {`${fmt(page)} ページ目を表示するとき MySQL が読む行（帯の全体が articles の 100,000 行）`}
        </T>
        <T x={20} y={58} fs={12} bold>OFFSET</T>
        <rect x={x0} y={44} width={width} height={26} rx={3} fill="var(--fig-bg)" stroke="var(--fig-line)" />
        <rect x={x0} y={44} width={readW} height={26} rx={3} fill="var(--fig-box5)" stroke="var(--fig-line)" />
        <rect x={x0 + readW - 3} y={44} width={3} height={26} fill="var(--fig-accent)" />
        <T x={x0} y={88} fs={11}>
          {`読む 約 ${fmt(offsetRows)} 行 = 捨てる公開記事 ${fmt(skipped)} 行 + 返す 20 行 + 条件に合わない非公開 約 ${fmt(offsetRows - page * 20)} 行`}
        </T>
        <T x={20} y={140} fs={12} bold>キーセット</T>
        <rect x={x0} y={126} width={width} height={26} rx={3} fill="var(--fig-bg)" stroke="var(--fig-line)" />
        {jumpX - x0 > 16 && <Arrow d={`M${x0 + 4},${124} Q${(x0 + jumpX) / 2},${100} ${jumpX},${124}`} dashed />}
        <rect x={Math.min(jumpX, x0 + width - keyW)} y={126} width={keyW} height={26} rx={1} fill="var(--fig-accent)" stroke="var(--fig-line)" />
        <T x={x0} y={170} fs={11}>
          {`読む 約 ${keysetRows} 行 = 返す 20 行 + 条件に合わない非公開 約 ${keysetRows - 20} 行`}
        </T>
        <T x={x0} y={188} fs={11} tone="muted">
          破線は索引で直前のページの末尾の id の位置へ移ること。移る間の行は読まない
        </T>
        <T x={x0} y={216} fs={11} tone="muted">← 新しい記事（id が大きい）</T>
        <T x={x0 + width} y={216} fs={11} tone="muted" anchor="end">古い記事（id が小さい）→</T>
      </Svg>
      <div className="table-wrap" aria-live="polite">
        <table>
          <thead>
            <tr>
              <th scope="col">方式</th>
              <th scope="col">読む行（モデル）</th>
              <th scope="col">{`実測：${fmt(near.page)} ページ目で読んだ行`}</th>
              <th scope="col">{`実測：${fmt(near.page)} ページ目の時間（中央値／最小）`}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>OFFSET</td><td>{fmt(offsetRows)}</td><td>{fmt(near.o)}</td><td>{near.ot}</td></tr>
            <tr><td>キーセット</td><td>{keysetRows}</td><td>{near.k}</td><td>{near.kt}</td></tr>
          </tbody>
        </table>
      </div>
    </Figure>
  )
}

/* ---------- EXPLAIN ANALYZE の木 ---------- */
function ExplainTreeFigure() {
  const trees = [
    {
      x: 20,
      title: 'OFFSET 89980（id の降順）',
      nodes: [
        { op: 'Limit/Offset: 20/89980', act: 'rows=20・118 ms で終了' },
        { op: 'Filter: published = true', act: 'rows=90000' },
        { op: 'Index scan using PRIMARY (reverse)', act: 'rows=99987・93.9 ms で終了' },
      ],
    },
    {
      x: 410,
      title: 'キーセット id < 38',
      nodes: [
        { op: 'Limit: 20', act: 'rows=20・0.033 ms で終了' },
        { op: 'Filter: published = true AND id < 38', act: 'rows=20' },
        { op: 'Index range scan on PRIMARY (id < 38)', act: 'rows=24・0.025 ms で終了' },
      ],
    },
  ]
  return (
    <Svg
      id="100-10"
      w={780}
      h={320}
      label="EXPLAIN ANALYZE の木を下から読む。OFFSET の場合、主キーを逆順に 99,987 行読み、公開済みの 90,000 行を Filter が残し、Limit/Offset が最初の 89,980 行を捨てて20行を返した。キーセットの場合、主キーの id が 38 より小さい範囲だけを 24 行読み、Filter が20行を残した"
    >
      {trees.map((t) => (
        <g key={t.x}>
          <T x={t.x} y={22} bold>
            {t.title}
          </T>
          {t.nodes.map((n, i) => {
            const y = 40 + i * 84
            return (
              <g key={n.op}>
                <Box x={t.x} y={y} w={350} h={54} lines={[n.op, n.act]} fs={12} mono={false} fill={i === 2 ? 'box4' : 'box'} subTone="muted" />
                {i < 2 && <Arrow x1={t.x + 175} y1={y + 82} x2={t.x + 175} y2={y + 56} />}
              </g>
            )
          })}
        </g>
      ))}
      <T x={20} y={290} fs={11} tone="muted">
        矢印は行が渡る向き。下の段が読んだ行を上の段へ渡し、上の段が絞り込みや件数の制限をする
      </T>
      <T x={20} y={308} fs={11} tone="muted">
        rows は各段が返した行の数。時間は最後の行を返すまでの時間（MySQL 8.4.13、索引は主キーと author_id）
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 100,
  part: 3,
  title: 'クエリと Active Record の最適化',
  summary:
    '一覧や集計が遅いとき、SQL の回数、MySQL が読んだ行、返した行と転送量、Ruby で作るオブジェクトの数を測ってから読み込み方を選びます。MySQL 8.4 で 10 万件の記事を使って手法ごとに実測します。',
  goals: [
    'SQL の回数・読んだ行・転送量・オブジェクト数を区別して測れる',
    'pluck・select・count・exists? などが送る SQL を Relation の状態とあわせて説明できる',
    'find_each・in_batches・insert_all・update_all を、通らない処理とあわせて使い分けられる',
    'OFFSET とキーセットのページ送りを実行計画とスロークエリログで比べられる',
  ],
  prerequisites: [37, 12, 13, 15],
  sections: [
    {
      id: 'measure',
      title: 'SQL の回数と一回あたりの費用を測る',
      body: (
        <>
          <p>
            記事の一覧画面が遅いと報告されたとします。時間を使っている場所の候補は少なくとも4つあります。1つ目は Rails が MySQL に SQL を何回送ったか（往復の回数）、2つ目は MySQL が条件に合う行を探すために何行を調べたか、3つ目は MySQL が Rails に何行・何バイトを返したか、4つ目は Rails が受け取った行から Ruby のオブジェクトをいくつ作ったかです。同じ「遅い」でも、どれが多いかで直し方が変わります。この章ではこの4つと時間を同じ表に並べて、手法ごとの違いを確かめます。
          </p>
          <p>
            2つ目の数を<Term en="rows examined">読んだ行</Term>、3つ目の行数を<Term en="rows sent">返した行</Term>と呼びます。たとえば公開済みの記事を1件だけ返す SQL でも、公開済みの記事が見つかるまでに非公開の記事を100行調べたなら、読んだ行は 101、返した行は 1 です。後の節で扱う MySQL のスロークエリログにも同じ意味の Rows_examined と Rows_sent が記録されます。
          </p>
          <h3>実験に使うデータと測り方</h3>
          <p>
            計測には MySQL 8.4.13（Docker のコンテナ）、Ruby 4.0.9、Active Record 8.1.4.1 を使い、Rails アプリは起動せず Active Record だけを読み込んだスクリプトから SQL を送りました。表は authors（1,000 行）、articles（100,000 行。公開済みは 90,012 行で、本文は約 230 文字）、comments（200,000 行）です。articles の索引は主キーと author_id だけで、索引を足す実験は後の節で行います。
          </p>
          <p>
            マシンは Core i7-1270P（4 CPU）の WSL2 上の Docker で、同じマシンでほかの作業も動いていました。そのため同じ SQL でも時間は回によって2〜3倍ぶれました。時間の比較には、比べる方法を同じ回の中で交互に何度も実行した中央値を使います。回によって変わらない SQL の回数、読んだ行、返した行、転送量、割り当てたオブジェクト数もあわせて見ます。
          </p>
          <Code
            lang="ruby"
            title="lab.rb（計測に使った部分）"
            code={`
# 計測する接続の番号。performance_schema はこの番号で接続ごとの統計を持つ
TID = ActiveRecord::Base.connection.select_value("SELECT PS_CURRENT_THREAD_ID()")
# 統計を読むための別の接続（計測する接続の SQL の数を増やさない）
MONITOR = Mysql2::Client.new(host: "rbdemo-mysql", username: "root", password: "pass")

def server_stats
  MONITOR.query(<<~SQL).first
    SELECT SUM(SUM_ROWS_EXAMINED) AS examined, SUM(SUM_ROWS_SENT) AS sent
    FROM performance_schema.events_statements_summary_by_thread_by_event_name
    WHERE THREAD_ID = #{TID}
  SQL
end

def counts
  sqls = []
  sub = ActiveSupport::Notifications.subscribe("sql.active_record") do |*, payload|
    sqls << payload[:sql] unless payload[:name] == "SCHEMA" || payload[:cached]
  end
  before = server_stats
  alloc = GC.stat(:total_allocated_objects)
  result = yield
  allocated = GC.stat(:total_allocated_objects) - alloc
  sleep 0.2 # MySQL が統計を更新するのを待つ
  after = server_stats
  ActiveSupport::Notifications.unsubscribe(sub)
  { sql: sqls.size, examined: after["examined"] - before["examined"],
    sent: after["sent"] - before["sent"], allocated:, result: }
end
`}
          />
          <p>
            Active Record は SQL を送るたびに <code>sql.active_record</code> という名前の通知を出し、通知の中身（payload）に SQL の文字列や名前を入れます
            <Ref n={9} />。スキーマを調べる SQL（名前が SCHEMA）とクエリキャッシュから返したもの（cached が true）を除いて数えると、MySQL に実際に送った SQL の回数になります。読んだ行と返した行は、MySQL の performance_schema にある接続ごとの集計表から、実行の前後の差で求めます
            <Ref n={10} />。統計を読む SQL を計測する接続で送ると、その SQL 自体も数に入るので、別の接続から読みます。<code>GC.stat(:total_allocated_objects)</code> は Ruby がそれまでに作ったオブジェクトの累計で、前後の差がその処理で作ったオブジェクトの数です。転送量は同じ考え方で performance_schema.status_by_thread の Bytes_sent を読みました。
          </p>
          <Code
            lang="text"
            title="出力の例（公開記事 1,000 件を pluck で読んだとき）"
            code={`pluck(:id, :title)   SQL 1 | 読んだ行 1111 | 返した行 1000 | 転送 29149 B | 割り当て 5136 | 中央値 9.73 ms (最小 3.52)`}
          />
          <p>
            SQL を実行した時間だけでは、Rails が受け取った行を Ruby のオブジェクトにする時間や、接続が空くまで待った時間は分かりません。応答の全体時間とデータベース部分の時間を比べ、残りが多ければアプリケーション側でも計測します。改善前後で画面または API が同じ記事を同じ順序で返すことも確かめます。
          </p>
          <Figure n={figureNumber(100, 1)} title="費用の出どころと選べる手段" caption="クエリの改善と Ruby 側の改善で観測する値が異なります。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>観測結果</th>
                    <th>次に確認すること</th>
                    <th>手段の例（この章の節）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>一覧に出した記事の数に応じて SQL が増える</td>
                    <td>繰り返しの中で関連や件数を読み込んでいるか</td>
                    <td>関連をまとめて読み込む、counter_cache</td>
                  </tr>
                  <tr>
                    <td>SQL が少なくても一回が遅い</td>
                    <td>読んだ行と返した行の差、並べ替えの有無</td>
                    <td>EXPLAIN ANALYZE、キーセット、索引</td>
                  </tr>
                  <tr>
                    <td>SQL の時間に比べて応答が遅い</td>
                    <td>転送量、オブジェクト数、HTML の描画</td>
                    <td>pluck・select、バッチ分割</td>
                  </tr>
                  <tr>
                    <td>書き込みの処理が件数に比例して遅い</td>
                    <td>1件ごとに COMMIT していないか</td>
                    <td>トランザクション、insert_all・update_all</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            記事ごとに著者を読み込む N+1 問題の見つけ方と直し方は <ChapterLink n={13} section="n-plus-one" />で、索引の仕組みと EXPLAIN の基本の読み方は <ChapterLink n={37} section="explain" />で扱いました。この章はその2つを前提に、一覧・集計・一括処理で使うメソッドの選び方を測って比べます。
          </p>
        </>
      ),
    },
    {
      id: 'projection',
      title: '必要な列と行だけを読み込む',
      body: (
        <>
          <p>
            一覧のテンプレートが記事の番号と題名だけを表示するなら、本文を取得する必要はありません。SQL では <code>SELECT id, title</code> と列を指定できます。Active Record では <code>select(:id, :title)</code> と書くと、指定した列だけを持つモデルのインスタンスを作ります。<code>pluck(:id, :title)</code> はモデルのインスタンスを作らず、値の配列を返します。
          </p>
          <Code
            lang="ruby"
            title="公開記事 1,000 件の番号と題名を3つの方法で読む"
            code={`
def scope = Article.where(published: true).order(:id).limit(1000)

scope.to_a.map { |a| [a.id, a.title] }                     # 全列を読む
scope.select(:id, :title).to_a.map { |a| [a.id, a.title] } # 2列だけのモデル
scope.pluck(:id, :title)                                   # 値の配列
# => [[1, "記事 1 の題名"], [2, "記事 2 の題名"], ...]
`}
          />
          <Code
            lang="text"
            title="それぞれが送った SQL"
            code={`
SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE ORDER BY \`articles\`.\`id\` ASC LIMIT 1000
SELECT \`articles\`.\`id\`, \`articles\`.\`title\` FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE ORDER BY \`articles\`.\`id\` ASC LIMIT 1000
SELECT \`articles\`.\`id\`, \`articles\`.\`title\` FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE ORDER BY \`articles\`.\`id\` ASC LIMIT 1000
`}
          />
          <Figure n={figureNumber(100, 2)} title="1,000 件の番号と題名を読む3つの方法" caption="SQL の回数と MySQL が読んだ行は同じです。違うのは MySQL から受け取るバイト数と、Ruby で作るオブジェクトの数です。">
            <ProjectionFigure />
          </Figure>
          <p>
            3つとも SQL は1回で、MySQL が読んだ行も 1,111 行で同じでした。公開済みの記事を主キーの順に探し、途中にある非公開の記事 111 行も調べたからです。列を減らしても、MySQL が調べる行の数は変わりません。変わったのは転送量で、全列の 721,493 バイトに対して2列では 29,149 バイトと、約25分の1になりました。本文の列を受け取らないからです。
          </p>
          <p>
            割り当てたオブジェクトは、<code>to_a</code> が 15,160、<code>select</code> が 11,138、<code>pluck</code> が 5,136 でした。<code>select</code> でもモデルのインスタンスと属性を管理するオブジェクトを1件ごとに作るので、<code>pluck</code> の約2倍になります。時間の中央値はこの回で 61.9 ミリ秒、38.8 ミリ秒、9.7 ミリ秒でした。別の回では3つとも2〜3倍長くなりましたが、順位は同じでした。
          </p>
          <h3>読み込んでいない属性と、読み込み済みの Relation</h3>
          <p>
            <code>select</code> で読み込んだインスタンスで、読み込んでいない列を参照すると例外になります。モデルのメソッドやビューの部分テンプレートが本文を使っていると、ここで気付きます。
          </p>
          <Code
            lang="ruby"
            title="select で読まなかった列を参照する"
            code={`
article = Article.select(:id, :title).first
article.body
# ActiveModel::MissingAttributeError: missing attribute 'body' for Article
`}
          />
          <p>
            <code>pluck</code> は、Relation がすでに読み込み済みで、指定した列がすべて属性にあるときは SQL を送らず、読み込んだレコードから値を取り出します（<code>calculations.rb</code> の 304〜305 行目）
            <Ref n={5} />。実際に <code>load</code> した Relation に <code>pluck(:id, :title)</code> を呼ぶと、SQL は0回でした。読み込み前に <code>pluck</code> を呼ぶか、読み込んだ後に呼ぶかで、送る SQL の回数が変わります。1件の値だけが必要なら <code>pick(:id, :title)</code>（<code>LIMIT 1</code> を付けて最初の1件の値を返す）、主キーだけなら <code>ids</code> も使えます
            <Ref n={1} />。
          </p>
          <p>
            <code>pluck</code> の戻り値は配列なので、インスタンスメソッドや関連は使えません。JSON に番号と題名を並べるだけなら値の配列で足ります。表示用のメソッド（たとえば題名を整形するメソッド）を使う必要があれば、<code>select</code> で必要な列を明示してモデルとして読み込みます。その場合はメソッドが参照する列もすべて <code>select</code> に含めます。
          </p>
          <p>
            著者名も一覧に出すときに、記事の列を絞っても記事ごとに著者を検索すれば SQL の回数は増えます。著者をまとめて読み込むか、必要な値を結合で取り出すかを検討します。著者を持たない記事も一覧に出す仕様なら、内部結合（INNER JOIN）に変えたことでその記事が消えていないかも確認します。回数が減っても返す行の集合が変わった場合は、性能だけを比べたことになりません。
          </p>
        </>
      ),
    },
    {
      id: 'counting',
      title: '件数と有無を調べるメソッドが送る SQL',
      body: (
        <>
          <p>
            一覧の上に「公開記事 90,012 件」と表示する、記事が1件もないときだけ「まだ記事がありません」と表示する、という2つの処理を考えます。どちらも記事の中身は要りません。Relation には <code>count</code>・<code>size</code>・<code>length</code>・<code>exists?</code>・<code>any?</code>・<code>empty?</code>・<code>present?</code> があり、結果は似ていますが送る SQL が違います。まだ読み込んでいない Relation で7つを実行し、測りました。
          </p>
          <Code
            lang="text"
            title="Article.where(published: true) に対して各メソッドが送った SQL"
            code={`
count     SELECT COUNT(*) FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE       => 90012
size      SELECT COUNT(*) FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE       => 90012
exists?   SELECT 1 AS one FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE LIMIT 1 => true
any?      SELECT 1 AS one FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE LIMIT 1 => true
empty?    SELECT 1 AS one FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE LIMIT 1 => false
present?  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE         => true
length    SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE         => 90012
`}
          />
          <Figure n={figureNumber(100, 3)} title="件数と有無を調べたときの実測値" caption="まだ読み込んでいない Relation で実行しました。published には索引がありません。時間は同じ回で交互に7回ずつ実行した中央値です。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>メソッド</th>
                    <th>SQL</th>
                    <th>読んだ行</th>
                    <th>返した行</th>
                    <th>転送量</th>
                    <th>割り当て</th>
                    <th>時間の中央値</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>count</code></td><td>1</td><td>100,000</td><td>1</td><td>67 B</td><td>149</td><td>139.6 ms</td></tr>
                  <tr><td><code>size</code></td><td>1</td><td>100,000</td><td>1</td><td>67 B</td><td>121</td><td>117.8 ms</td></tr>
                  <tr><td><code>exists?</code></td><td>1</td><td>1</td><td>1</td><td>58 B</td><td>116</td><td>1.6 ms</td></tr>
                  <tr><td><code>any?</code></td><td>1</td><td>1</td><td>1</td><td>58 B</td><td>116</td><td>0.9 ms</td></tr>
                  <tr><td><code>empty?</code></td><td>1</td><td>1</td><td>1</td><td>58 B</td><td>115</td><td>0.7 ms</td></tr>
                  <tr><td><code>present?</code></td><td>1</td><td>100,000</td><td>90,012</td><td>65,229,781 B</td><td>1,080,300</td><td>3,763 ms</td></tr>
                  <tr><td><code>length</code></td><td>1</td><td>100,000</td><td>90,012</td><td>65,229,781 B</td><td>1,080,252</td><td>3,578 ms</td></tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            <code>count</code> は MySQL に数えさせるので、返した行は1行、転送量は 67 バイトでした。それでも published に索引がないため、MySQL は表の 100,000 行をすべて調べています。<code>exists?</code>・<code>any?</code>・<code>empty?</code> は <code>LIMIT 1</code> を付けた SQL で、最初に条件に合う行が見つかった時点で読むのをやめるので、読んだ行は1行でした。<code>present?</code> と <code>length</code> は 90,012 件をすべてモデルにして、約 65MB を受け取り、100 万個以上のオブジェクトを作りました。
          </p>
          <h3>Relation の状態で送る SQL が変わる</h3>
          <p>
            同じメソッドでも、Relation を読み込み済みかどうかで動作が変わります。Active Record 8.1.4.1 の <code>relation.rb</code> では、<code>size</code> は読み込み済みなら配列の長さを返し、そうでなければ <code>count(:all)</code> を呼びます。<code>empty?</code> は読み込み済みなら配列が空かを調べ、そうでなければ <code>!exists?</code> を返します。<code>any?</code> は引数もブロックもなければ <code>!empty?</code> です
            <Ref n={4} />。<code>present?</code> は <code>!blank?</code> で、<code>blank?</code> は <code>records.blank?</code> と定義されているので、まだ読み込んでいなければ全行を読み込みます（1302 行目）。<code>length</code> は読み込んだ配列に処理を任せます。
          </p>
          <Figure n={figureNumber(100, 4)} title="件数・有無のメソッドと Relation の状態" caption="Active Record 8.1.4.1 の relation.rb の定義と、実際に送った SQL から作った表です。any? などにブロックや引数を渡した場合は、全行を読み込んでから Ruby で調べます。">
            <CountStateFigure />
          </Figure>
          <p>
            読み込み済みの Relation（公開記事を20件読み込んだもの）では、<code>size</code>・<code>length</code>・<code>any?</code> は SQL を送りませんでした。一方 <code>count</code> は <code>SELECT COUNT(*) FROM (SELECT 1 AS one FROM articles WHERE published = TRUE LIMIT 20) subquery_for_count</code> を、<code>exists?</code> は <code>LIMIT 1</code> の SELECT を送りました。<code>count</code> と <code>exists?</code> は、読み込み済みかどうかに関係なく MySQL に問い合わせます。
          </p>
          <p>
            <code>exists?</code> がいつも速いわけではありません。条件に合う行が1件もないときは、MySQL は「ない」と答えるために対象の行をすべて調べます。<code>Article.where(published: true, comments_count: 1000).exists?</code>（該当なし）では、読んだ行は 100,000 行でした。逆に author_id のように索引のある列の条件なら、索引で候補を絞れます。著者1人の非公開記事（14件）では、<code>count</code> の読んだ行が 96 行、<code>exists?</code> は 4 行でした。
          </p>
          <h3>ビューでの使い分け</h3>
          <p>
            一覧のビューで <code>{'<% if @articles.any? %>'}</code> と書いてから <code>@articles.each</code> で表示すると、<code>any?</code> の <code>SELECT 1 … LIMIT 1</code> と、<code>each</code> の <code>SELECT *</code> の2回になります。どうせ全件を表示するなら、先に <code>@articles.load</code> するか <code>present?</code> で読み込めば、その後の <code>any?</code> や <code>each</code> は読み込んだ配列を使い、SQL は1回です。逆に、有無だけを知りたい場面で <code>present?</code> を使うと、条件に合う全行を読み込みます。関連の <code>size</code> が counter_cache の列を使う動作は <ChapterLink n={13} section="counter-inverse" />で扱いました。
          </p>
        </>
      ),
    },
    {
      id: 'batches',
      title: '全件を処理するときのバッチ分割',
      body: (
        <>
          <p>
            全記事の題名を書き出す処理では、必要な列に絞っても対象が何十万行になることがあります。<code>Article.where(published: true).each</code> は、最初に条件に合う全行を読み込んでモデルにしてから、1件ずつブロックに渡します。<Term>バッチ</Term>は対象を一定の件数に分けた処理単位です。<code>find_each</code> は記事をバッチごとに読み込み、ブロックへ1件ずつ渡します。
          </p>
          <Code
            lang="ruby"
            title="公開記事の題名のバイト数を合計する4つの書き方"
            code={`
scope = Article.where(published: true)
total = 0

scope.each { |a| total += a.title.bytesize }                        # 一括
scope.find_each(batch_size: 1000) { |a| total += a.title.bytesize }  # 1,000 件ずつ
scope.select(:id, :title).find_each(batch_size: 1000) { |a| total += a.title.bytesize }
scope.in_batches(of: 1000) { |rel| rel.pluck(:title).each { |t| total += t.bytesize } }
`}
          />
          <p>
            それぞれを別の Ruby のプロセスで実行し、終了時に <code>/proc/self/status</code> の VmHWM（プロセスが使った物理メモリーの最大値）を読みました。プロセスごとに測るのは、一度増えたメモリーの最大値が同じプロセスの次の計測に残るからです。
          </p>
          <Figure n={figureNumber(100, 5)} title="find_each が送る SQL と、使ったメモリーの最大値" caption="公開記事 90,012 件を処理しました。メモリーは各方法を別のプロセスで1回ずつ実行した値です。">
            <BatchFigure />
          </Figure>
          <Code
            lang="text"
            title="4つの方法の実測値（1回ずつ。時間は負荷のある共有マシンでの値）"
            code={`
each               SQL   1 | 読んだ行 100000 | 返した行  90012 | 転送 65229781 B | 時間 1016 ms | RSS 49 MB → 最大 301 MB
find_each          SQL  91 | 読んだ行 100000 | 返した行  90012 | 転送 65284231 B | 時間 2832 ms | RSS 48 MB → 最大  63 MB
find_each_select   SQL  91 | 読んだ行 100000 | 返した行  90012 | 転送  2962543 B | 時間 2480 ms | RSS 48 MB → 最大  57 MB
in_batches_pluck   SQL 182 | 読んだ行 190012 | 返した行 180024 | 転送  3324684 B | 時間 1273 ms | RSS 48 MB → 最大  50 MB
`}
          />
          <p>
            <code>each</code> はメモリーの最大値が 301MB まで増えました。<code>find_each</code> は 1,000 件ずつ読み、前のバッチのオブジェクトは次のバッチを処理する間に使われなくなるので、63MB で済みました。その代わり SQL は 91 回です。90 回目までは 1,000 件ずつ返り、91 回目は 12 件だけ返ったので、Rails はそれ以上ないと判断して終わりました。この回の時間は <code>find_each</code> のほうが長くなりました（<code>each</code> の 1,016 ミリ秒に対して 2,832 ミリ秒）。バッチ分割で減るのは使うメモリーの最大値で、時間は短くなるとは限りません。
          </p>
          <p>
            <code>find_each</code> は <code>find_in_batches</code> を、<code>find_in_batches</code> は <code>in_batches(load: true)</code> を呼びます（<code>batches.rb</code> の 171 行目）
            <Ref n={6} />。2回目以降の SQL の <code>id &gt; 1111</code> は前のバッチの最後の id で、後の節で扱うキーセット方式と同じ考え方です。<code>OFFSET</code> を使わないので、後ろのバッチになっても読む行は増えません。
          </p>
          <h3>in_batches は2回ずつ SQL を送ることがある</h3>
          <p>
            <code>in_batches</code> は各バッチをモデルの配列ではなく Relation として渡します。読み込み方は条件で変わります。Active Record 8.1.4.1 では、条件のない全件（<code>Article.in_batches</code>）なら、各バッチの最後の id を <code>OFFSET</code> と <code>pick</code> で調べて <code>id</code> の範囲の条件を作ります（<code>use_ranges</code>）。条件がある場合は、まずそのバッチの id を <code>pluck</code> で読み、<code>WHERE id IN (…)</code> の Relation を渡します
            <Ref n={6} />。実測でも、条件付きの <code>in_batches</code> と <code>pluck(:title)</code> の組み合わせは SQL が 182 回、読んだ行は 190,012 行で、id を読む SQL と題名を読む SQL の2回ずつになっていました。それでもモデルを作らないので、メモリーの最大値は 50MB でした。
          </p>
          <p>
            Rails 8.1 では <code>cursor:</code> と <code>order:</code> で基準にする列と向きを指定できます。複数列の場合、同じ値があっても次のバッチを決められるよう、一意な列を含めます。途中で値が変わる列を基準にすると、同じ行を二度読むことや、行を飛ばすことがあります。スコープに付けた <code>order</code> は使われず、設定と引数に応じて無視されるか例外になります
            <Ref n={2} />。
          </p>
          <p>
            バッチ化は途中でデータが更新されないことを保証しません。監査用の書き出しで開始時点の状態が必要なら、データベースのスナップショットや、変更されない書き出し対象を別に用意します。単発の保守処理なら処理済みの id を記録して、失敗した後にどこまで終わったかを確認できるようにします。再実行したときに保存や通知を重ねて行わない仕組みも必要です。
          </p>
        </>
      ),
    },
    {
      id: 'bulk-write',
      title: 'まとめて書き込む insert_all・upsert_all・update_all',
      body: (
        <>
          <p>
            CSV の 5,000 行をタグとして登録する処理を考えます。<code>create!</code> を 5,000 回呼ぶと、Rails は1件ごとに <code>BEGIN</code>・<code>INSERT</code>・<code>COMMIT</code> を送ります。<code>insert_all</code> は複数行を1つの <code>INSERT</code> 文にまとめ、モデルのインスタンスを作らずに送ります
            <Ref n={8} />。tags 表には name の一意索引を付け、モデルには検証と保存前のコールバックを書きました。
          </p>
          <Code
            lang="ruby"
            title="tags 表とモデル、4つの登録方法"
            code={`
create_table :tags do |t|
  t.string :name, null: false
  t.integer :uses, null: false, default: 0
  t.timestamps
  t.index :name, unique: true
end

class Tag < ActiveRecord::Base
  validates :name, presence: true
  before_save { self.name = name.downcase }
end

rows = (1..5000).map { |i| { name: "tag-#{i}" } }
rows.each { |r| Tag.create!(r) }                          # 1件ずつ
Tag.transaction { rows.each { |r| Tag.create!(r) } }      # 1つのトランザクション
rows.each_slice(1000) { |s| Tag.insert_all(s) }           # 1,000 件ずつ
Tag.insert_all(rows)                                      # 1回
`}
          />
          <Figure n={figureNumber(100, 6)} title="5,000 件の登録にかかった時間" caption="毎回 tags を空にしてから実行し、3回の中央値を取りました。計測した時間帯はマシンの負荷が高く（load average 14〜20 程度）、COMMIT の待ち時間が長くなっています。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>方法</th>
                    <th>SQL の内訳</th>
                    <th>時間の中央値</th>
                    <th>1件あたり</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>create!</code> を 5,000 回</td><td>BEGIN 5,000・INSERT 5,000・COMMIT 5,000</td><td>186,394 ms</td><td>37.3 ms</td></tr>
                  <tr><td>1つのトランザクションで <code>create!</code></td><td>BEGIN 1・INSERT 5,000・COMMIT 1</td><td>7,907 ms</td><td>1.58 ms</td></tr>
                  <tr><td><code>insert_all</code> を 1,000 件ずつ</td><td>INSERT 5</td><td>956 ms</td><td>0.19 ms</td></tr>
                  <tr><td><code>insert_all</code> を1回</td><td>INSERT 1</td><td>618 ms</td><td>0.12 ms</td></tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            1件ずつの <code>create!</code> が極端に遅かったのは、COMMIT のたびに MySQL がログをディスクへ書き終えるまで待つからです。この MySQL の <code>innodb_flush_log_at_trx_commit</code> は既定値の 1 で、COMMIT ごとにログを書き出して同期します
            <Ref n={16} />。同じ 5,000 回の <code>INSERT</code> でも、トランザクションを1つにすると COMMIT が1回になり、約24分の1になりました。<code>insert_all</code> はさらに SQL の往復とモデルの生成もなくすので、1回なら 618 ミリ秒でした。COMMIT の待ち時間はディスクと負荷で大きく変わるので、この倍率は環境ごとに測り直します。
          </p>
          <h3>insert_all が通らないもの</h3>
          <Code
            lang="ruby"
            title="検証・コールバックと insert_all"
            code={`
Tag.insert_all([{ name: "" }, { name: "UPPER" }])
Tag.order(:id).pluck(:name, :created_at)
# => [["", 2026-11-27 11:48:26 UTC], ["UPPER", 2026-11-27 11:48:26 UTC]]

Tag.create!(name: "")
# ActiveRecord::RecordInvalid: Validation failed: Name can't be blank
`}
          />
          <p>
            <code>insert_all</code> は検証も <code>before_save</code> も実行しないので、空の名前が保存され、"UPPER" も小文字になりませんでした。<code>created_at</code> と <code>updated_at</code> には値が入っています。モデルの <code>record_timestamps</code> が真（既定）なら、<code>insert_all</code> は SQL の <code>CURRENT_TIMESTAMP(6)</code> でタイムスタンプを補います（<code>insert_all.rb</code> の 22 行目と 77 行目）
            <Ref n={7} />。counter_cache の列も更新しません。この章のデータを作るときにコメント 200,000 件を <code>insert_all!</code> で登録したところ、記事 100,000 件の comments_count はすべて 0 のままでした。コールバックを通らないメソッドの一覧は <ChapterLink n={14} section="skip" />にあります。
          </p>
          <Code
            lang="text"
            title="一意索引と重なる行を insert_all・insert_all! で送ったとき"
            code={`
Tag.insert_all([{ name: "UPPER" }, { name: "new" }])
  INSERT INTO \`tags\` (\`name\`,\`created_at\`,\`updated_at\`) VALUES ('UPPER', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
    ('new', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)) AS \`tags_values\` ON DUPLICATE KEY UPDATE \`name\`=\`tags\`.\`name\`
  # => ActiveRecord::Result（行なし）。"UPPER" は変わらず、"new" だけが加わる

Tag.insert_all!([{ name: "UPPER" }])
  # ActiveRecord::RecordNotUnique: Mysql2::Error: Duplicate entry 'UPPER' for key 'tags.index_tags_on_name'
`}
          />
          <p>
            MySQL の <code>insert_all</code> は重複した行を <code>ON DUPLICATE KEY UPDATE name = name</code>（同じ値を書く何もしない更新）で読み飛ばします。どの行を飛ばしたかは戻り値から分かりません。MySQL は <code>RETURNING</code> に対応していないので、戻り値の <code>ActiveRecord::Result</code> は行を持ちません。重複を例外にしたいときは <code>insert_all!</code> を使います。
          </p>
          <h3>upsert_all と MySQL の一意索引</h3>
          <Code
            lang="text"
            title="upsert_all が送った SQL"
            code={`
Tag.upsert_all([{ name: "UPPER", uses: 3 }, { name: "x", uses: 1 }])
  INSERT INTO \`tags\` (\`name\`,\`uses\`,\`created_at\`,\`updated_at\`) VALUES ('UPPER', 3, …), ('x', 1, …) AS \`tags_values\`
  ON DUPLICATE KEY UPDATE updated_at=(CASE WHEN (\`tags\`.\`name\`<=>\`tags_values\`.\`name\` AND \`tags\`.\`uses\`<=>\`tags_values\`.\`uses\`)
    THEN \`tags\`.updated_at ELSE CURRENT_TIMESTAMP(6) END),\`name\`=\`tags_values\`.\`name\`,\`uses\`=\`tags_values\`.\`uses\`

Tag.upsert_all([{ name: "x", uses: 2 }], unique_by: :name)
  # ArgumentError: ActiveRecord::ConnectionAdapters::Mysql2Adapter does not support :unique_by
`}
          />
          <p>
            <code>upsert_all</code> は一意索引にぶつかった行を新しい値で更新します。<code>updated_at</code> は、ほかの列の値が変わったときだけ現在時刻にする式になっています。PostgreSQL や SQLite では <code>unique_by:</code> でどの一意索引を基準にするかを指定できますが、MySQL は指定できず <code>ArgumentError</code> になりました（<code>insert_all.rb</code> の 186〜187 行目）
            <Ref n={7} />。MySQL の <code>ON DUPLICATE KEY UPDATE</code> は、主キーを含む表のどの一意索引で重なっても更新します
            <Ref n={14} />。一意索引が2つ以上ある表では、意図しない索引で重なった行も更新されることに注意します。更新する列を限りたいときは <code>update_only: [:uses]</code> を使います。
          </p>
          <h3>update_all と in_batches</h3>
          <p>
            <code>Article.where(author_id: 7).update_all(published: false)</code> は、1つの <code>UPDATE … WHERE</code> を送り、変更した行数を返します。<code>update_all</code> も検証とコールバックを通らず、指定しなければ <code>updated_at</code> も変えません。楽観的ロックの列があるモデルでは <code>lock_version</code> を1増やす式が加わります（実際の SQL は <ChapterLink n={14} section="skip" />）。1回の <code>UPDATE</code> で数十万行を変えると、その行のロックを COMMIT まで持ち続け、レプリカへの反映も一度に大きくなります。<code>in_batches(of: 1000).update_all(…)</code> にすると、1,000 件ずつの <code>UPDATE</code> に分かれます。
          </p>
          <p>
            1つの <code>INSERT</code> にまとめられる量にも上限があります。この MySQL の <code>max_allowed_packet</code> は 67,108,864 バイト（64MB）で、SQL 文がこれを超えると MySQL は受け付けません。行が大きい表では <code>each_slice</code> で分けて送ります。
          </p>
        </>
      ),
    },
    {
      id: 'pagination',
      title: '次のページを最後に読んだ値から探す',
      body: (
        <>
          <p>
            <code>LIMIT</code> と <code>OFFSET</code> を使うページ送りでは、ページ番号から読み始める位置を計算します。20件ずつ表示する一覧の 100 ページ目は <code>LIMIT 20 OFFSET 1980</code> です。MySQL は先頭から 1,980 行を数えて捨ててから、次の 20 行を返します。深いページほど捨てる行が増えます。
          </p>
          <p>
            「次へ」をたどる用途では、直前のページの末尾にあるソートキーより後ろの行を取得できます。この方式を<Term en="keyset pagination">キーセットページネーション</Term>と呼びます。番号の大きい記事から並べる例では、末尾の id より小さい行を次に取得します。
          </p>
          <Code
            lang="ruby"
            title="画面に表示した最後の id より古い記事を取得"
            code={`
scope = Article.where(published: true)
first_page = scope.order(id: :desc).limit(20)
last_id = first_page.last.id   # 画面に表示した最後の記事の id
next_page = scope.where("id < ?", last_id).order(id: :desc).limit(20)
`}
          />
          <p>
            2つの方式で、同じ位置のページを読んだときの値を比べました。キーセットの条件の id は OFFSET の方式でそのページの直前に表示した最後の id です。
          </p>
          <Figure n={figureNumber(100, 7)} title="ページの深さと MySQL が読んだ行" caption="公開記事を id の降順に 20 件ずつ表示したときの実測値です。キーセットの棒は短すぎるので最小の幅で描いています。">
            <PageDepthFigure />
          </Figure>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ページ</th>
                  <th>OFFSET：読んだ行</th>
                  <th>OFFSET：時間（中央値／最小）</th>
                  <th>キーセット：読んだ行</th>
                  <th>キーセット：時間（中央値／最小）</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1</td><td>23</td><td>1.60 ／ 0.86 ms</td><td>23</td><td>0.93 ／ 0.54 ms</td></tr>
                <tr><td>100</td><td>2,202</td><td>0.68 ／ 0.64 ms</td><td>24</td><td>0.35 ／ 0.33 ms</td></tr>
                <tr><td>1,000</td><td>22,165</td><td>12.50 ／ 5.61 ms</td><td>21</td><td>10.01 ／ 0.95 ms</td></tr>
                <tr><td>4,500</td><td>99,987</td><td>525.15 ／ 333.49 ms</td><td>24</td><td>1.08 ／ 0.77 ms</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            OFFSET の方式では、読んだ行がページの深さにほぼ比例して増え、4,500 ページ目では 99,987 行を読んで 20 行を返しました。キーセットはどのページも 21〜24 行です。主キーの索引で <code>id &lt; 38</code> の位置へ直接移り、そこから 20 件を集めたからです。時間の中央値は負荷の影響でぶれており、1,000 ページ目のキーセットの 10.01 ミリ秒もその一例です（最小は 0.95 ミリ秒）。読んだ行の数は何度実行しても同じでした。
          </p>
          <p>
            図 {figureNumber(100, 8)} では測っていないページも含めて、ページ番号と読む行の関係を確かめられます。OFFSET の方式ではページ番号を大きくするほど、先頭から読む範囲が右へ伸びます。伸びた分のほとんどは読んでから捨てる行です。キーセットの方式では、帯の中の位置が右へ移るだけで、読む行は 22 行前後のままです。
          </p>
          <PageDepthSlider />
          <Figure n={figureNumber(100, 9)} title="ソート済み一覧の続きの求め方" caption="最初の3件が ID 42、41、38 のときの例です。削除済みの ID に対応する行はありません。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>方法</th>
                    <th>2ページ目を求める条件</th>
                    <th>先頭に記事が1件追加されたとき</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>OFFSET</td>
                    <td>先頭3件を飛ばす</td>
                    <td>2ページ目に ID 38 が再び出ることがある</td>
                  </tr>
                  <tr>
                    <td>キーセット</td>
                    <td>ID が 38 より小さい順序範囲を読む</td>
                    <td>ID 38 は含めない</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            OFFSET の方式には結果のずれもあります。記事の追加や削除で先頭の行がずれると、続けて表示したページで同じ記事が現れたり、記事が抜けたりします。キーセットは直前の値を基準にするので、先頭に記事が追加されても次のページはずれません。
          </p>
          <h3>同じ値がある列で並べるときは id も条件に入れる</h3>
          <p>
            公開日時の新しい順で並べる場合、次のページの条件は「公開日時が直前の末尾より古い、または同じ日時で id が小さい」です。並べ替えも公開日時の降順と id の降順にそろえます。この章のデータは公開日時を1時間単位にそろえたので、同じ日時の記事が5〜6件ずつあります。日時だけを条件にすると何が起きるかを確かめました。
          </p>
          <Code
            lang="text"
            title="2ページ目の続きを日時だけで探した場合と、日時と id で探した場合"
            code={`
2 ページ目の末尾: 2026-11-26 03:00 id=99958 / 2026-11-26 03:00 id=99957 / 2026-11-26 03:00 id=99956
日時だけ（published_at < ?）:                           [99953, 99952, 99951, 99950, 99949]
日時と id（published_at < ? OR (published_at = ? AND id < ?)）: [99955, 99954, 99953, 99952, 99951]
飛ばした id: [99955, 99954]
`}
          />
          <p>
            2ページ目は 03:00 の記事の途中（id 99956）で終わっていました。日時だけで「03:00 より前」を探すと、同じ 03:00 で id が小さい 99955 と 99954 が、どのページにも表示されません。同じ値を持つ行をテストデータに入れると、ページの境界での抜けを見つけられます。
          </p>
          <p>
            キーセットではページ番号から任意のページへ直接移れません。検索条件を変えた場合も、以前の末尾をそのまま使うと新しい検索の先頭を飛ばしてしまいます。クエリの条件とページ送りの値を同じ画面の状態として扱います。結果を常に同じ状態に固定する必要がある場合は、キーセットだけでは保証できず、書き出しのように対象の集合を固定する方法が別に必要です。
          </p>
        </>
      ),
    },
    {
      id: 'explain-analyze',
      title: 'EXPLAIN ANALYZE で読んだ行と並べ替えを確かめる',
      body: (
        <>
          <p>
            前の節で、OFFSET の方式は読んだ行が多いことを数で確かめました。どの段階で行を読み、どこで捨てたかは、MySQL 8.4 の <code>EXPLAIN ANALYZE</code> で確かめられます。Rails では <code>explain(:analyze)</code> と書きます。<code>EXPLAIN ANALYZE</code> は SQL を実際に実行し、実行計画の各段階が返した行の数と時間を木の形（TREE 形式）で表示します
            <Ref n={3} />。表の形の <code>EXPLAIN</code> の列の意味と、木の基本の読み方は <ChapterLink n={37} section="explain-rails" />で扱いました。
          </p>
          <Code
            lang="text"
            title="Article.where(published: true).order(id: :desc).limit(20).offset(89_980).explain(:analyze)"
            code={`
-> Limit/Offset: 20/89980 row(s)  (cost=10029 rows=0) (actual time=118..118 rows=20 loops=1)
    -> Filter: (articles.published = true)  (cost=10029 rows=9000) (actual time=0.051..114 rows=90000 loops=1)
        -> Index scan on articles using PRIMARY (reverse)  (cost=10029 rows=90000) (actual time=0.0444..93.9 rows=99987 loops=1)
`}
          />
          <Code
            lang="text"
            title="Article.where(published: true).where(&quot;id < ?&quot;, 38).order(id: :desc).limit(20).explain(:analyze)"
            code={`
-> Limit: 20 row(s)  (cost=7.68 rows=3.7) (actual time=0.0103..0.0325 rows=20 loops=1)
    -> Filter: ((articles.published = true) and (articles.id < 38))  (cost=7.68 rows=3.7) (actual time=0.00931..0.0301 rows=20 loops=1)
        -> Index range scan on articles using PRIMARY over (id < 38) (reverse)  (cost=7.68 rows=37) (actual time=0.00725..0.0251 rows=24 loops=1)
`}
          />
          <Figure n={figureNumber(100, 10)} title="EXPLAIN ANALYZE の木を下から読む" caption="上の2つの出力から、各段階の名前と actual の値だけを抜き出した図です。cost や見積もりの rows は省いています。">
            <ExplainTreeFigure />
          </Figure>
          <p>
            木は下の段から読みます。OFFSET の場合、一番下の段は主キーの索引を逆順にたどり（Index scan … (reverse)）、99,987 行を上へ渡しました。真ん中の Filter が公開済みの 90,000 行を残し、一番上の Limit/Offset が最初の 89,980 行を捨てて 20 行を返しています。actual time の2つの値は最初の行を返すまでと最後の行を返すまでの時間（ミリ秒）です。全体の 118 ミリ秒のうち約 94 ミリ秒が一番下の段で行を読む時間でした。キーセットでは一番下の段が Index range scan … over (id &lt; 38) になり、範囲の中の 24 行だけを読んでいます。
          </p>
          <p>
            括弧の中の <code>cost</code> と <code>rows</code> は実行前の見積もりで、<code>actual</code> の後ろが実測値です。OFFSET の Filter の見積もりは rows=9000 でしたが、実際は 90,000 行でした。published 列には索引がなく、MySQL は条件に合う割合を 10% と見積もりました（表の形の EXPLAIN の filtered も 10.0）。見積もりと実測が大きく違う段は、MySQL が別の計画を選び間違える原因になりえます。
          </p>
          <h3>並べ替えの段（Sort）が出る場合</h3>
          <p>
            公開日時の新しい順で 1 ページ目を表示する SQL は、索引がないと次の計画になりました。
          </p>
          <Code
            lang="text"
            title="公開日時の降順の 1 ページ目（索引なし）"
            code={`
-> Limit: 20 row(s)  (cost=10692 rows=20) (actual time=151..151 rows=20 loops=1)
    -> Sort: articles.published_at DESC, articles.id DESC, limit input to 20 row(s) per chunk  (actual time=151..151 rows=20 loops=1)
        -> Filter: (articles.published = true)  (actual time=0.0195..97.5 rows=90012 loops=1)
            -> Table scan on articles  (cost=10692 rows=95466) (actual time=0.018..80.4 rows=100000 loops=1)

EXPLAIN（表の形）: type=ALL  key=NULL  rows=95466  Extra=Using where; Using filesort
`}
          />
          <p>
            Table scan で 100,000 行を読み、Filter で 90,012 行を残し、Sort ですべてを並べ替えてから上位 20 行を返しています。1 ページ目しか表示しなくても、条件に合う全行を並べ替えるので読んだ行は 100,020 でした。表の形の <code>EXPLAIN</code> では、<code>type</code> が ALL（表全体の走査）、Extra が Using filesort（索引の順序を使わずに並べ替える）と表示されます
            <Ref n={12} />。この状態ではキーセットの条件を足しても並べ替えの前に全行を読むので、読んだ行は 100,020 のままでした。キーセットの効果を得るには、並べ替えの順序と同じ索引が必要です。次の節で索引を足します。
          </p>
          <Callout kind="warn">
            <p>
              <code>EXPLAIN ANALYZE</code> は SQL を実際に実行します。SELECT でも本番の MySQL では重い SQL がそのまま負荷になるので、実行してよい環境と時間を選びます。表の形の <code>EXPLAIN</code> は実行せずに見積もりだけを返します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'indexes',
      title: '検索の改善と書き込みの費用を比べる',
      body: (
        <>
          <p>
            公開記事を公開日時の降順に並べる一覧のために、<code>(published, published_at, id)</code> の順に列を並べた複合索引を追加しました。published で公開記事の範囲に絞り、その中が公開日時と id の順に並んでいるので、MySQL は索引を逆順にたどるだけで並べ替え済みの行を得られます。複合索引で列を並べる順序の考え方は <ChapterLink n={37} section="composite-index" />を参照してください。
          </p>
          <Code
            lang="ruby"
            title="索引の追加"
            code={`add_index :articles, [:published, :published_at, :id], name: "idx_pub_at"   # 100,000 行で 720 ms`}
          />
          <Code
            lang="text"
            title="索引を追加した後の 1 ページ目と、キーセットの2つの書き方"
            code={`
1 ページ目
-> Limit: 20 row(s)  (actual time=0.675..0.714 rows=20 loops=1)
    -> Index lookup on articles using idx_pub_at (published=true) (reverse)  (actual time=0.674..0.711 rows=20 loops=1)

キーセット（OR で書く）: published_at < ? OR (published_at = ? AND id < ?)
-> Limit: 20 row(s)  (actual time=0.0152..0.056 rows=20 loops=1)
    -> Index range scan on articles using idx_pub_at over (published = 1 AND NULL < published_at < '2025-01-01 06:00:00.000000')
       OR (published = 1 AND published_at = '2025-01-01 06:00:00.000000' AND id < 38) (reverse), with index condition: …

キーセット（行の比較で書く）: (published_at, id) < (?, ?)
-> Limit: 20 row(s)  (actual time=189..189 rows=20 loops=1)
    -> Filter: ((articles.published_at,articles.id) < ('2025-01-01 06:00:00','38'))  (actual time=189..189 rows=20 loops=1)
        -> Index lookup on articles using idx_pub_at (published=true) (reverse)  (actual time=0.0153..179 rows=90000 loops=1)
`}
          />
          <p>
            1 ページ目は Sort の段が消え、索引を逆順に 20 行読むだけになりました。キーセットを OR で書いた条件は Index range scan になり、4,500 ページ目に当たる位置でも 20 行で済みました。一方、同じ意味の <code>(published_at, id) &lt; (?, ?)</code>（行の比較）で書くと、MySQL 8.4.13 は範囲の読み取りにせず、索引の先頭の published だけを使って公開記事を先頭から 90,000 行読み、Filter で比べました。MySQL のマニュアルも、行の比較が索引の先頭の列から始まっていないと索引の一部しか使われないことがあると説明し、同じ例で <code>c2 &gt; 1 OR (c2 = 1 AND c3 &gt; 1)</code> のように OR で書き直す方法を示しています
            <Ref n={13} />。書き方を決めたら、深いページで <code>EXPLAIN ANALYZE</code> を確かめます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ページ（公開日時の降順）</th>
                  <th>索引なし OFFSET</th>
                  <th>索引あり OFFSET</th>
                  <th>索引あり キーセット（OR）</th>
                  <th>索引あり キーセット（行の比較）</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1</td><td>100,020 行／124.8 ms</td><td>20 行／0.53 ms</td><td>20 行／0.53 ms</td><td>20 行／0.48 ms</td></tr>
                <tr><td>100</td><td>102,000 行／114.6 ms</td><td>2,000 行／1.09 ms</td><td>20 行／1.03 ms</td><td>2,000 行／1.22 ms</td></tr>
                <tr><td>1,000</td><td>120,000 行／93.8 ms</td><td>20,000 行／4.41 ms</td><td>20 行／0.93 ms</td><td>20,000 行／5.16 ms</td></tr>
                <tr><td>4,500</td><td>190,000 行／102.9 ms</td><td>90,000 行／35.75 ms</td><td>20 行／1.46 ms</td><td>90,000 行／43.98 ms</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            表の値は読んだ行と時間の中央値です。索引がないときの OFFSET は、並べ替えるために読んだ行に、並べ替えた後に読み飛ばした行も加わって数えられています。索引を足すと OFFSET の方式も速くなりましたが（4,500 ページ目で 102.9 ミリ秒から 35.75 ミリ秒）、読んだ行はページの深さに比例したままです。
          </p>
          <h3>索引の費用</h3>
          <p>
            索引は無料ではありません。索引を足す前と後で、articles の索引の大きさ（information_schema の index_length）と、5,000 行を <code>insert_all</code> で追加する時間（3回の中央値）を比べました。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>索引の大きさ</th>
                  <th>データの大きさ</th>
                  <th>5,000 行の insert_all</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>主キーと author_id の索引だけ</td><td>4.5MB</td><td>71.6MB</td><td>398 ms</td></tr>
                <tr><td>idx_pub_at を追加</td><td>7.0MB</td><td>71.6MB</td><td>621 ms</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            索引が 2.5MB 増え、追加の時間も長くなりました（負荷のあるマシンでの3回の中央値なので、増え方は目安です）。行を追加・削除するたび、また索引に含む列を更新するたびに、MySQL は表と索引の両方を書き換えます。索引を追加した後は、一覧の時間に加えて、記事の作成・更新の時間とストレージ量も比べます。
          </p>
          <p>
            実行計画を比べるときは、テストデータの分布も記録します。全記事のうち公開済みの記事が少ない表と、ほぼすべてが公開済みの表では、条件で対象を絞る効果が異なります。開発環境で索引が選ばれたことから、本番でも選ばれるとは判断できません。列の種類や行数とともに、検索条件に一致する割合を確認し、実際の問い合わせを再現します。
          </p>
        </>
      ),
    },
    {
      id: 'counter-cache',
      title: '一覧に件数を出すときの counter_cache',
      body: (
        <>
          <p>
            記事の一覧に各記事のコメント数を表示するとします。記事ごとに <code>article.comments.count</code> を呼ぶと、記事 20 件に対して <code>COUNT</code> の SQL が 20 回送られます。これも N+1 の一種です。直し方は2つあります。表示する記事のコメント数を <code>group(:article_id).count</code> で1回の SQL にまとめる方法と、記事の表にコメント数の列（comments_count）を持たせる <Term>counter_cache</Term> です。counter_cache は <code>belongs_to :article, counter_cache: true</code> と書くと、コメントの作成・削除のたびに Rails が記事の comments_count を増減します
            <Ref n={18} />。
          </p>
          <Code
            lang="ruby"
            title="最新の公開記事 20 件とコメント数を読む3つの方法"
            code={`
def latest = Article.where(published: true).order(id: :desc).limit(20)

latest.map { |a| [a.id, a.comments.count] }               # 記事ごとに COUNT

arts = latest.to_a                                         # まとめて COUNT
counts = Comment.where(article_id: arts.map(&:id)).group(:article_id).count
arts.map { |a| [a.id, counts.fetch(a.id, 0)] }

latest.map { |a| [a.id, a.comments.size] }                 # comments_count の列を使う
`}
          />
          <Figure n={figureNumber(100, 11)} title="コメント数を表示する3つの方法の実測値" caption="3つの結果が同じことを確かめた上で、交互に15回ずつ実行した中央値です。comments.article_id には索引があります。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>方法</th>
                    <th>SQL</th>
                    <th>読んだ行</th>
                    <th>割り当て</th>
                    <th>時間の中央値</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>記事ごとに <code>comments.count</code></td><td>21</td><td>71</td><td>3,615</td><td>40.29 ms</td></tr>
                  <tr><td><code>group(:article_id).count</code></td><td>2</td><td>71</td><td>803</td><td>2.86 ms</td></tr>
                  <tr><td>counter_cache の列（<code>size</code>）</td><td>1</td><td>23</td><td>1,508</td><td>3.34 ms</td></tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            記事ごとの <code>count</code> と <code>group</code> はどちらもコメントの索引をたどって 48 件のコメントを数えるので、読んだ行は同じ 71 行でした。違いは SQL の回数で、往復が 21 回から 2 回に減ったことが時間の差になっています。counter_cache は記事を読むだけで済むので SQL は1回です。この規模では <code>group</code> と counter_cache の時間の差はわずかでした。コメントの多い記事が並ぶ一覧や、コメント数で並べ替える一覧では、数える行が増える分だけ counter_cache の利点が大きくなります。
          </p>
          <h3>書き込みのたびに記事の行を更新する</h3>
          <Code
            lang="text"
            title="counter_cache があるときのコメント作成の SQL"
            code={`
BEGIN
INSERT INTO \`comments\` (\`article_id\`, \`body\`, \`created_at\`, \`updated_at\`) VALUES (99999, '計測', …)
UPDATE \`articles\` SET \`articles\`.\`comments_count\` = COALESCE(\`articles\`.\`comments_count\`, 0) + 1 WHERE \`articles\`.\`id\` = 99999
COMMIT
`}
          />
          <p>
            counter_cache がないモデルでは、同じ作成の SQL は BEGIN・INSERT・COMMIT の3つでした。500 件を順に作成すると、1件あたり 30.18 ミリ秒（counter_cache あり）と 23.5 ミリ秒（なし）でした。差が大きくなるのは、同じ記事に同時にコメントが付く場合です。<code>UPDATE</code> は記事の行に排他ロックをかけ、COMMIT まで持ち続けるので、同じ記事への作成は1件ずつ順番になります。4 スレッドで 100 件ずつ作成したところ、次の結果になりました。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>4 スレッド × 100 件</th>
                  <th>counter_cache あり</th>
                  <th>counter_cache なし</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>同じ記事にコメントする</td><td>10,341 ms</td><td>2,845 ms</td></tr>
                <tr><td>別々の記事にコメントする</td><td>3,355 ms</td><td>2,364 ms</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            同じ記事に集中したときだけ、counter_cache ありの時間が約 3.6 倍になりました。人気の記事に短時間でコメントや「いいね」が集まるアプリでは、この行のロック待ちが書き込みの応答時間に出ます。行ロックの仕組みは <ChapterLink n={38} section="lock" />で扱いました。
          </p>
          <h3>件数がずれる場合と reset_counters</h3>
          <p>
            counter_cache の列はモデルのコールバックで更新されます。<code>insert_all</code> や <code>delete_all</code> で行を増減すると、列は変わりません。実験では、counter_cache を指定していないモデル（同じ comments 表を使う PlainComment）でも計測用のコメントを 501 件作り、その後 <code>Comment.where(…).delete_all</code> で計測用のコメント 1,002 件を消しました。残ったコメントは 3 件ですが、comments_count は 504 でした。counter_cache を通った 501 件の作成で増えた値が、削除で減らなかったからです。<code>Article.reset_counters(99999, :comments)</code> は、関連を数え直して列を書き直します（<code>counter_cache.rb</code> の 37 行目）
            <Ref n={15} />。
          </p>
          <Code
            lang="text"
            title="reset_counters が送った SQL"
            code={`
SELECT COUNT(*) AS \`count_all\`, \`articles\`.\`id\` AS \`articles_id\` FROM \`articles\`
  INNER JOIN \`comments\` ON \`comments\`.\`article_id\` = \`articles\`.\`id\` WHERE \`articles\`.\`id\` = 99999 GROUP BY \`articles\`.\`id\`
UPDATE \`articles\` SET \`articles\`.\`comments_count\` = 3 WHERE \`articles\`.\`id\` = 99999
`}
          />
          <p>
            一括削除や一括登録を使う処理を書いたら、同じ処理の中で counter_cache の列も直すか、定期的に数え直す仕組みを用意します。<code>size</code> がこの列を使う動作と <code>inverse_of</code> との関係は <ChapterLink n={13} section="counter-inverse" />にあります。
          </p>
        </>
      ),
    },
    {
      id: 'slow-query-log',
      title: 'スロークエリログで遅い SQL を集める',
      body: (
        <>
          <p>
            ここまでの計測は、遅い処理が分かっている場合の比べ方でした。本番では、まずどの SQL が遅いかを知る必要があります。MySQL の<Term en="slow query log">スロークエリログ</Term>は、実行に <code>long_query_time</code> 秒以上かかった SQL をファイル（または表）に記録する機能です
            <Ref n={11} />。既定では無効で、<code>long_query_time</code> の既定値は 10 秒です。
          </p>
          <p>
            スロークエリログを有効にするには MySQL の全体の設定を変えます。実験では、共有の MySQL の設定を変えないように、同じ mysql:8.4 のイメージで別のコンテナを起動し、同じ形の記事 100,000 行を入れました。
          </p>
          <Code
            lang="bash"
            title="スロークエリログを有効にした MySQL 8.4.13 を起動する"
            code={`
docker run -d --rm --name ag-100-slowlog --network rbdemo -e MYSQL_ROOT_PASSWORD=pass mysql:8.4 \\
  --slow-query-log=ON --long-query-time=0.05 --log-slow-extra=ON \\
  --slow-query-log-file=/var/lib/mysql/slow.log
`}
          />
          <p>
            <code>long_query_time=0.05</code> で 50 ミリ秒以上の SQL を記録します。<code>log_slow_extra</code> を ON にすると、読み取りの種類や並べ替えの回数などの項目が増えます。どのコントローラーのどのアクションが送った SQL かを記録に残すため、Active Record 側では <code>ActiveRecord::QueryLogs</code> を有効にして、SQL の末尾にコメントを付けました
            <Ref n={17} />。Rails アプリでは <code>config.active_record.query_log_tags_enabled = true</code> で有効になります（<ChapterLink n={22} section="notifications" />）。
          </p>
          <Code
            lang="text"
            title="/var/lib/mysql/slow.log に記録された OFFSET の SQL（log_slow_extra の項目を一部省略）"
            code={`
# Time: 2026-11-27T11:45:38.494797Z
# User@Host: root[root] @  [172.29.0.10]  Id:    12
# Query_time: 0.728048  Lock_time: 0.000002 Rows_sent: 20  Rows_examined: 100000 Thread_id: 12 Errno: 0
  Bytes_received: 165 Bytes_sent: 26984 Read_first: 0 Read_last: 1 Read_key: 1 Read_next: 0 Read_prev: 99999
  Read_rnd: 0 Read_rnd_next: 0 Sort_merge_passes: 0 Sort_rows: 0 Created_tmp_tables: 0
SET timestamp=1795779937;
SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE ORDER BY \`articles\`.\`id\` DESC
  LIMIT 20 OFFSET 89980 /*action:index,controller:articles*/;
`}
          />
          <p>
            Query_time は実行時間（秒）、Lock_time はロックを待った時間、Rows_sent と Rows_examined は返した行と読んだ行です。20 行を返すために 100,000 行を読んでいることが、この1件の記録から分かります。Read_last: 1 と Read_prev: 99999 は索引の末尾に移り、そこから逆向きに 99,999 回読み進めたことを表します。SQL の末尾には QueryLogs が付けたコメントが残り、ArticlesController の index アクションから送られたことが分かります。
          </p>
          <p>
            公開日時で並べる索引なしの SQL の記録では、Read_rnd_next: 100001（表を先頭から順に読んだ回数）と Sort_merge_passes: 78 が記録されていました。Sort_merge_passes は並べ替えの作業領域（<code>sort_buffer_size</code>）に収まらず、一時ファイルを使って分けて並べ替えた回数です
            <Ref n={12} />。本文の列まで含めた <code>SELECT *</code> の行を並べ替えたので、作業領域に収まらなかったと考えられます。
          </p>
          <h3>同じ形の SQL をまとめて見る</h3>
          <p>
            スロークエリログは1回の実行ごとの記録なので、同じ形の SQL が何度も遅いのか、まれに1回だけ遅いのかは並べて数える必要があります。MySQL の performance_schema には、値を <code>?</code> に置き換えて同じ形の SQL（ダイジェスト）ごとに集計する表があります
            <Ref n={10} />。
          </p>
          <Code
            lang="sql"
            title="ダイジェストごとの合計時間と読んだ行"
            code={`
SELECT LEFT(DIGEST_TEXT, 90) AS digest_text, COUNT_STAR AS calls,
       ROUND(SUM_TIMER_WAIT/1e12, 3) AS total_s, SUM_ROWS_EXAMINED AS rows_examined,
       SUM_ROWS_SENT AS rows_sent, SUM_NO_INDEX_USED AS no_index
FROM performance_schema.events_statements_summary_by_digest
WHERE SCHEMA_NAME = 'ag_100_slow' AND DIGEST_TEXT LIKE 'SELECT%'
ORDER BY SUM_TIMER_WAIT DESC LIMIT 3;
`}
          />
          <Code
            lang="text"
            title="実行結果（digest_text は途中で切っている）"
            code={`
| digest_text                                          | calls | total_s | rows_examined | rows_sent | no_index |
| SELECT \`articles\` . * FROM \`articles\` WHERE … LIMIT ? OFFSET ? |  3 | 3.009 | 299934 | 60 | 0 |
| SELECT \`articles\` . * FROM \`articles\` WHERE … ORDER BY \`articles\` . \`published_at\` DESC … |  1 | 0.336 | 100020 | 20 | 1 |
| SELECT COUNT ( * ) FROM \`articles\` WHERE \`articles\` . \`published\` = TRUE |  1 | 0.330 | 100000 |  1 | 1 |
`}
          />
          <p>
            OFFSET の値が違う3回の SQL が <code>LIMIT ? OFFSET ?</code> の1行にまとまり、合計 3.009 秒、読んだ行は 299,934 行でした。ダイジェストでは QueryLogs のコメントは取り除かれます。no_index は索引を使わずに実行した回数で、索引なしの並べ替えと COUNT に 1 が入っています。合計時間の多い順に並べると、1回は速くても回数の多い SQL も上位に出ます。
          </p>
          <p>
            <code>long_query_time</code> を 0 にするとすべての SQL を記録できますが、ログのファイルが急に大きくなり、書き込みの負荷も増えます。調査の間だけ短くし、終わったら戻します。読んだ行が少ない SQL を記録から外す <code>min_examined_row_limit</code> や、索引を使わない SQL を時間に関係なく記録する <code>log_queries_not_using_indexes</code> もあります
            <Ref n={11} />。本番での遅い SQL の探し方と監視の組み立ては <ChapterLink n={25} section="production-observability" />も参照してください。
          </p>
        </>
      ),
    },
    {
      id: 'tradeoffs',
      title: '判断基準とトレードオフ',
      body: (
        <>
          <p>
            この章の実測から、手法ごとに減らせるものと、代わりに増えるものや失うものをまとめます。どの手法も、減らすのは SQL の回数、読んだ行、転送量、メモリー、書き込みの手間のどれかです。測った値のうち、どれが大きいかで選びます。
          </p>
          <Figure n={figureNumber(100, 12)} title="手法ごとに減るものと、代わりに生じるもの" caption="この章の実測（MySQL 8.4.13、articles 100,000 行）に基づく整理です。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>手法</th>
                    <th>減ったもの（実測）</th>
                    <th>代わりに生じるもの</th>
                    <th>使う場面</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>pluck</code>・<code>select</code></td><td>転送量 約25分の1、オブジェクト数</td><td>モデルのメソッドや関連が使えない（pluck）、読んでいない属性で例外（select）</td><td>一覧や JSON で使う列が決まっている</td></tr>
                  <tr><td><code>exists?</code>・<code>any?</code></td><td>読んだ行 100,000 → 1</td><td>該当がないと全行を調べる</td><td>有無だけを知りたい</td></tr>
                  <tr><td><code>find_each</code>・<code>in_batches</code></td><td>メモリーの最大値 301MB → 63MB</td><td>SQL の回数が増え、時間は短くならない。途中の更新は防げない</td><td>全件の書き出しや保守処理</td></tr>
                  <tr><td><code>insert_all</code>・<code>update_all</code></td><td>COMMIT と往復の回数、5,000 件で数百分の1の時間</td><td>検証・コールバック・counter_cache を通らない</td><td>取り込みや一括変更で、規則を DB 制約で守れる</td></tr>
                  <tr><td>キーセット</td><td>深いページの読んだ行 99,987 → 24</td><td>任意のページへ移れない。並べ替えと同じ索引と、id を含む条件が必要</td><td>「次へ」や無限スクロール、API のカーソル</td></tr>
                  <tr><td>複合索引</td><td>並べ替えと読んだ行</td><td>索引の大きさ、追加・更新の時間</td><td>同じ形の一覧を頻繁に読む</td></tr>
                  <tr><td>counter_cache</td><td>件数の SQL（21 回 → 1 回）</td><td>書き込みごとの UPDATE、同じ行のロック待ち、一括処理でのずれ</td><td>件数の表示や並べ替えが多く、同じ親への書き込みが集中しない</td></tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            判断の順序の一例です。まず遅い画面やジョブで SQL の回数を数え、記事の数に比例して増えていれば関連や件数の読み込み方を直します。回数が少ないのに遅ければ、スロークエリログやダイジェストの集計から対象の SQL を選び、<code>EXPLAIN ANALYZE</code> で読んだ行と返した行の差、並べ替えの段を確かめます。SQL の時間に比べて応答が遅ければ、転送量とオブジェクト数を減らします。どの手法でも、変更の前後で返す行の集合と順序が同じかをテストで確かめます。
          </p>
          <p>
            この章の時間の値は負荷のある1台のマシンで測ったものです。読んだ行や SQL の回数は環境によらず再現しますが、時間の倍率はディスク、CPU、同時に動く処理で変わります。本番に近いデータ量と分布で、同じ手順で測り直します。
          </p>
          <p>
            関連する章：N+1 と読み込み方式は <ChapterLink n={13} section="n-plus-one" />、索引と実行計画の基本は <ChapterLink n={37} section="explain" />、Relation が SQL を組み立てる仕組みは <ChapterLink n={12} />、ロックとトランザクションは <ChapterLink n={38} />、応答時間の内訳とキャッシュは <ChapterLink n={22} />で扱います。
          </p>
        </>
      ),
    },
  ],
  sources: [
    { title: 'Active Record Query Interface', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html', accessed: '2026-11-27', version: 'Rails 8.1', note: 'pluck・pick・ids、select と関連の事前読み込み' },
    { title: 'Active Record Batches', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Batches.html', accessed: '2026-11-27', version: 'Rails 8.1', note: 'カーソルの列と順序、バッチ処理' },
    { title: 'EXPLAIN Statement', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/explain.html', accessed: '2026-11-27', version: 'MySQL 8.4', note: 'EXPLAIN ANALYZE が SQL を実行し、TREE 形式で実測値を出すこと' },
    { title: 'activerecord/lib/active_record/relation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb`, accessed: '2026-11-27', version: '8.1.4.1', note: 'size（363 行目）・empty?・any?・blank?（1302 行目）・update_all・insert_all・upsert_all' },
    { title: 'activerecord/lib/active_record/relation/calculations.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/calculations.rb`, accessed: '2026-11-27', version: '8.1.4.1', note: '読み込み済みの Relation に対する pluck（304〜305 行目）' },
    { title: 'activerecord/lib/active_record/relation/batches.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/batches.rb`, accessed: '2026-11-27', version: '8.1.4.1', note: 'find_in_batches から in_batches(load: true) を呼ぶこと（171 行目）、use_ranges と pluck による分割（426〜470 行目）' },
    { title: 'activerecord/lib/active_record/insert_all.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/insert_all.rb`, accessed: '2026-11-27', version: '8.1.4.1', note: 'record_timestamps（22・77 行目）、MySQL で unique_by を受け付けないこと（186〜187 行目）' },
    { title: 'ActiveRecord::Relation', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Relation.html', accessed: '2026-11-27', version: 'Rails 8.1', note: 'insert_all・upsert_all・update_all の引数とコールバックを通らないこと' },
    { title: 'Active Support Instrumentation', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_support_instrumentation.html', accessed: '2026-11-27', version: 'Rails 8.1', note: 'sql.active_record と instantiation.active_record の payload' },
    { title: 'Statement Summary Tables', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/performance-schema-statement-summary-tables.html', accessed: '2026-11-27', version: 'MySQL 8.4', note: 'スレッドごと・ダイジェストごとの SUM_ROWS_EXAMINED などの集計' },
    { title: 'The Slow Query Log', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/slow-query-log.html', accessed: '2026-11-27', version: 'MySQL 8.4', note: 'long_query_time、log_slow_extra、min_examined_row_limit、log_queries_not_using_indexes' },
    { title: 'ORDER BY Optimization', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/order-by-optimization.html', accessed: '2026-11-27', version: 'MySQL 8.4', note: 'filesort、sort_buffer_size と Sort_merge_passes' },
    { title: 'Row Constructor Expression Optimization', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/row-constructor-optimization.html', accessed: '2026-11-27', version: 'MySQL 8.4', note: '行の比較が索引の先頭を含まないと索引の一部しか使われないこと、OR による書き直し' },
    { title: 'INSERT ... ON DUPLICATE KEY UPDATE Statement', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/insert-on-duplicate.html', accessed: '2026-11-27', version: 'MySQL 8.4', note: '主キーと一意索引のどれで重なっても更新すること' },
    { title: 'activerecord/lib/active_record/counter_cache.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/counter_cache.rb`, accessed: '2026-11-27', version: '8.1.4.1', note: 'reset_counters（37 行目）' },
    { title: 'InnoDB Startup Options and System Variables: innodb_flush_log_at_trx_commit', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html#sysvar_innodb_flush_log_at_trx_commit', accessed: '2026-11-27', version: 'MySQL 8.4', note: '既定値 1 で COMMIT ごとにログを書き出して同期すること' },
    { title: 'ActiveRecord::QueryLogs', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/QueryLogs.html', accessed: '2026-11-27', version: 'Rails 8.1', note: 'SQL のコメントにコントローラーやアクションを付ける設定' },
    { title: 'Active Record Associations: counter_cache', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/association_basics.html#counter-cache', accessed: '2026-11-27', version: 'Rails 8.1', note: 'counter_cache の列と更新の時機' },
  ],
}

export default chapter
