import { useState } from 'react'
import { figureNumber } from '../content/label'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'
import { FigureChoices } from '../visuals/study-figure'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const RD = 'https://docs.ruby-lang.org/en/4.0'

/* ---------- 図 1 Enumerable のメソッドが each を呼ぶ順 ---------- */
function EnumerableFigure() {
  const lanes = [
    { x: 110, label: '呼び出し側' },
    { x: 390, label: 'Enumerable#map' },
    { x: 650, label: 'ArticleList#each' },
  ]
  const yields = [
    { y: 130, v: '"Ruby"', r: '"ruby"' },
    { y: 165, v: '"Rails"', r: '"rails"' },
    { y: 200, v: '"HTTP"、"SQL"', r: '"http"、"sql"' },
  ]
  return (
    <Svg id={figureNumber(96, 1)} w={780} h={305}
      label="list.map(&:downcase) を呼ぶと、Enumerable の map が ArticleList の each を呼ぶ。each は Ruby、Rails、HTTP、SQL を1つずつ yield し、map は受け取った値を小文字にして結果の配列に追加する。each が終わると、map は配列を呼び出し側に返す。ArticleList が定義したのは each だけで、map は Enumerable のメソッド">
      {lanes.map((lane) => (
        <g key={lane.label}>
          <T x={lane.x} y={20} anchor="middle" bold fs={12} mono={lane.x > 200}>{lane.label}</T>
          <line x1={lane.x} y1={32} x2={lane.x} y2={278} stroke="var(--fig-line)" strokeDasharray="4 4" />
        </g>
      ))}
      <T x={250} y={52} anchor="middle" fs={11} mono>list.map(&amp;:downcase)</T>
      <Arrow x1={110} y1={62} x2={388} y2={62} />
      <T x={520} y={87} anchor="middle" fs={11}>each を呼ぶ（map のブロックを渡す）</T>
      <Arrow x1={390} y1={97} x2={648} y2={97} />
      {yields.map((item) => (
        <g key={item.y}>
          <T x={520} y={item.y - 8} anchor="middle" fs={11} mono>{`yield ${item.v}`}</T>
          <Arrow x1={650} y1={item.y} x2={392} y2={item.y} />
          <T x={384} y={item.y + 12} anchor="end" fs={10.5} tone="muted">{`${item.r} を結果に追加`}</T>
        </g>
      ))}
      <T x={520} y={227} anchor="middle" fs={11} tone="muted">each が終わる</T>
      <Arrow x1={650} y1={237} x2={392} y2={237} dashed />
      <T x={250} y={256} anchor="middle" fs={11} mono>{'["ruby", "rails", "http", "sql"]'}</T>
      <Arrow x1={390} y1={266} x2={112} y2={266} accent />
      <T x={20} y={294} fs={11} tone="muted">ArticleList が定義したのは each だけ。map・select・find などは Enumerable が each を呼んで実現する</T>
    </Svg>
  )
}

/* ---------- 図 3 reduce と each_with_object の途中の値 ---------- */
function AccumulatorFigure() {
  const sums = [['sum = 0', '初期値'], ['20', '0 + 20'], ['28', '20 + 8'], ['42', '28 + 14'], ['73', '42 + 31（戻り値）']]
  const hashes = [['（空）'], ['ruby: 20'], ['ruby: 20', 'rails: 8'], ['ruby: 20', 'rails: 8', 'web: 14'], ['ruby: 51', 'rails: 8', 'web: 14']]
  return (
    <Svg id={figureNumber(96, 3)} w={780} h={270}
      label="reduce(0) では、ブロックの戻り値が次の sum になり、0、20、28、42、73 と変わって 73 が戻り値になる。each_with_object(Hash.new(0)) では、同じ1つの Hash を書き換え続け、最後に ruby 51、rails 8、web 14 になった Hash が戻り値になる。each_with_object(0) で sum += と書くと、変数 sum に新しい値を代入するだけなので、戻り値は 0 のまま">
      <T x={20} y={18} bold fs={12} mono>{'reduce(0) { |sum, a| sum + a.views }'}</T>
      <T x={330} y={18} fs={11} tone="muted">ブロックの戻り値が次の sum になる</T>
      {sums.map((lines, i) => (
        <g key={i}>
          <Box x={20 + i * 150} y={30} w={130} h={44} lines={lines} fs={12} subTone="muted" fill={i === 4 ? 'box5' : 'box'} accent={i === 4} />
          {i < 4 && <Arrow x1={150 + i * 150} y1={52} x2={168 + i * 150} y2={52} />}
        </g>
      ))}
      <T x={20} y={102} bold fs={12} mono>{'each_with_object(Hash.new(0)) { |a, views| views[a.category] += a.views }'}</T>
      <T x={20} y={120} fs={11} tone="muted">同じ1つの Hash を書き換え続け、最後にその Hash を返す</T>
      {hashes.map((lines, i) => (
        <g key={i}>
          <Box x={20 + i * 150} y={132} w={130} h={58} lines={lines} fs={11} mono fill={i === 4 ? 'box5' : 'box4'} accent={i === 4} />
          {i < 4 && <Arrow x1={150 + i * 150} y1={161} x2={168 + i * 150} y2={161} />}
        </g>
      ))}
      <T x={20} y={222} bold fs={12} mono>{'each_with_object(0) { |a, sum| sum += a.views }  # => 0'}</T>
      <T x={20} y={244} fs={11} tone="muted">sum += は変数 sum に新しい Integer を代入するだけで、each_with_object が持っている 0 は変わらない</T>
    </Svg>
  )
}

/* ---------- 図 4 通常の評価と lazy の評価の順 ---------- */
function LazyOrderFigure() {
  const eager = ['sel 1', 'sel 2', 'sel 3', 'sel 4', 'sel 5', 'sel 6', 'map 2', 'map 4', 'map 6']
  const lazy = ['sel 1', 'sel 2', 'map 2', 'sel 3', 'sel 4', 'map 4']
  const cell = (label: string, i: number, y: number) => (
    <Box key={`${y}-${i}`} x={250 + i * 58} y={y} w={54} h={30} lines={label} fs={11} mono fill={label.startsWith('map') ? 'box5' : 'box'} />
  )
  return (
    <Svg id={figureNumber(96, 4)} w={780} h={200}
      label="(1..6) に select と map と first(2) を続けた場合のブロックの実行順。通常は select のブロックが 1 から 6 まで6回動いてから、map のブロックが 2、4、6 で3回動く。lazy を付けると、select 1、select 2、map 2、select 3、select 4、map 4 の順に1要素ずつ流れ、2件そろった時点で止まる">
      <T x={20} y={32} fs={12}>通常</T>
      <T x={20} y={50} fs={11} tone="muted" mono>select→map→first(2)</T>
      {eager.map((label, i) => cell(label, i, 26))}
      <T x={20} y={92} fs={12}>.lazy を付けた場合</T>
      <T x={20} y={110} fs={11} tone="muted" mono>lazy.select→map→first(2)</T>
      {lazy.map((label, i) => cell(label, i, 86))}
      <Box x={250 + 6 * 58} y={86} w={110} h={30} lines="2件そろって終了" fs={11} dashed fill="none" />
      <T x={20} y={150} fs={11} tone="muted">sel は select のブロック、map は map のブロックの1回の実行。数字はブロックに渡った要素（lazy_trace.rb の出力）</T>
      <T x={20} y={172} fs={11} tone="muted">1,000,000 要素で first(10) にすると、通常は select 1,000,000 回・map 500,000 回、lazy は select 20 回・map 10 回</T>
    </Svg>
  )
}

/* ---------- 図 6 SQL で絞る場合と Ruby で絞る場合 ---------- */
function RelationFigure() {
  const rows = [
    { y: 26, code: 'Article.where(published: true).map(&:title)', sql: ['SQL に WHERE が付く', 'published = TRUE'], result: ['3行を受け取る', 'モデル 3件'], bad: false },
    { y: 106, code: 'Article.all.select(&:published)', sql: ['SQL に WHERE がない', '全行を読む'], result: ['6行・モデル 6件', 'Ruby の select で3件に'], bad: true },
    { y: 186, code: 'Article.where(published: true).pluck(:title)', sql: ['SELECT title だけ', 'WHERE が付く'], result: ['3行を受け取る', 'モデル 0件（文字列）'], bad: false },
  ]
  return (
    <Svg id={figureNumber(96, 6)} w={780} h={285}
      label="where で絞ると SQL に WHERE が付き、公開済みの3行だけを受け取ってモデルを3件作る。all.select にブロックを渡すと WHERE のない SQL で全6行を読み、モデルを6件作ってから Ruby で3件に絞る。pluck は title の列だけを WHERE 付きで読み、モデルを作らずに文字列の配列を返す">
      {rows.map((row) => (
        <g key={row.y}>
          <Box x={20} y={row.y} w={300} h={48} lines={row.code} fs={11} mono />
          <Arrow x1={320} y1={row.y + 24} x2={348} y2={row.y + 24} />
          <Box x={350} y={row.y} w={210} h={48} lines={row.sql} fs={12} fill="box4" subTone="muted" />
          <Arrow x1={560} y1={row.y + 24} x2={588} y2={row.y + 24} />
          <Box x={590} y={row.y} w={170} h={48} lines={row.result} fs={12} fill={row.bad ? 'box5' : 'box'} accent={row.bad} subTone="muted" />
        </g>
      ))}
      <T x={20} y={258} fs={11} tone="muted">MySQL 8.4.13、articles 6行（公開済み3行）での実行結果。B の行数とモデルの数は、テーブルの全行数に応じて増える</T>
      <T x={6} y={50} fs={11} bold>A</T>
      <T x={6} y={130} fs={11} bold>B</T>
      <T x={6} y={210} fs={11} bold>C</T>
    </Svg>
  )
}

/* ---------- 図 8 begin・rescue・else・ensure の実行経路 ---------- */
function FlowFigure() {
  const cols = ['"42"（変換できる）', '"abc"（ArgumentError）', 'nil（TypeError）']
  const rows: { label: string; cells: string[] }[] = [
    { label: 'begin（変換の前）', cells: ['実行', '実行', '実行'] },
    { label: 'begin（変換の後）', cells: ['実行', '—', '—'] },
    { label: 'rescue ArgumentError', cells: ['—', '実行', '—'] },
    { label: 'else', cells: ['実行', '—', '—'] },
    { label: 'ensure', cells: ['実行', '実行', '実行'] },
    { label: 'メソッドの結果', cells: [':ok（else の値）', ':invalid（rescue の値）', '呼び出し元へ TypeError'] },
  ]
  const x0 = 200
  const cw = 190
  return (
    <Svg id={figureNumber(96, 8)} w={780} h={300}
      label="load_article に 42、abc、nil を渡したときに実行された節。42 では begin の全体、else、ensure が動き、結果は else の値 :ok。abc では begin の途中で ArgumentError が起き、rescue と ensure が動き、結果は rescue の値 :invalid。nil では TypeError が起き、対応する rescue がないので ensure だけが動いて、例外が呼び出し元へ伝わる。ensure の最後の式は結果にならない">
      {cols.map((c, i) => (
        <T key={c} x={x0 + i * cw + cw / 2} y={20} anchor="middle" fs={12} mono={false}>{c}</T>
      ))}
      {rows.map((row, r) => (
        <g key={row.label}>
          <T x={16} y={52 + r * 38} fs={12} mono={r < 5}>{row.label}</T>
          {row.cells.map((cell, i) => {
            const on = cell !== '—'
            const result = r === 5
            return (
              <g key={i}>
                <rect x={x0 + i * cw + 4} y={36 + r * 38} width={cw - 8} height={32} rx={4}
                  fill={result ? (i === 2 ? 'var(--fig-box5)' : 'var(--fig-box4)') : on ? 'var(--fig-box)' : 'none'}
                  stroke={result && i === 2 ? 'var(--fig-accent)' : 'var(--fig-line)'} strokeDasharray={on ? undefined : '3 3'} />
                <T x={x0 + i * cw + cw / 2} y={52 + r * 38} anchor="middle" fs={12} tone={on ? undefined : 'muted'}>{cell}</T>
              </g>
            )
          })}
        </g>
      ))}
      <T x={16} y={286} fs={11} tone="muted">ensure の最後の式（:ignored）はどの場合もメソッドの結果にならない（flow.rb の実行結果）</T>
    </Svg>
  )
}

/* ---------- 図 11 例外クラスの階層 ---------- */
function HierarchyFigure() {
  const outside = ['NoMemoryError', 'ScriptError（LoadError など）', 'SecurityError', 'SignalException（Interrupt など）', 'SystemExit（exit で発生）', 'SystemStackError']
  return (
    <Svg id={figureNumber(96, 11)} w={780} h={345}
      label="Exception の直下には StandardError のほか、NoMemoryError、ScriptError、SecurityError、SignalException、SystemExit、SystemStackError がある。rescue => e が捕まえるのは StandardError とその子孫だけで、ArgumentError、IndexError と KeyError と ParameterMissing、NameError と NoMethodError、TypeError、ZeroDivisionError、RuntimeError と FrozenError と Timeout::Error、JSON::ParserError、Active Record の例外、自作の例外がここに入る">
      <Box x={320} y={8} w={140} h={32} lines="Exception" fs={13} bold />
      <Arrow x1={360} y1={40} x2={140} y2={66} />
      <Arrow x1={420} y1={40} x2={515} y2={66} />
      {outside.map((name, i) => (
        <Box key={name} x={20} y={70 + i * 34} w={230} h={28} lines={name} fs={11} dashed fill="none" />
      ))}
      <T x={20} y={290} fs={11} tone="muted">rescue =&gt; e では捕まえない</T>
      <rect x={270} y={62} width={490} height={250} rx={8} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <Box x={290} y={72} w={450} h={30} lines="StandardError（rescue => e が捕まえる範囲）" fs={12} fill="box5" bold />
      <Box x={290} y={114} w={225} h={28} lines="ArgumentError" fs={11} mono align="start" />
      <Box x={290} y={148} w={225} h={60} lines={['IndexError', '└ KeyError', '   └ ParameterMissing（Rails）']} fs={11} align="start" />
      <Box x={290} y={214} w={225} h={44} lines={['NameError', '└ NoMethodError']} fs={11} align="start" />
      <Box x={290} y={264} w={225} h={28} lines="TypeError・ZeroDivisionError" fs={11} align="start" />
      <Box x={525} y={114} w={225} h={44} lines={['RuntimeError', '└ FrozenError・Timeout::Error']} fs={11} align="start" />
      <Box x={525} y={164} w={225} h={44} lines={['JSON::JSONError', '└ JSON::ParserError']} fs={11} align="start" />
      <Box x={525} y={214} w={225} h={44} lines={['ActiveRecord::ActiveRecordError', '└ RecordNotFound・RecordInvalid']} fs={11} align="start" />
      <Box x={525} y={264} w={225} h={28} lines="自作の例外（Payments::Error など）" fs={11} align="start" fill="box2" />
      <T x={20} y={332} fs={11} tone="muted">rescue Exception =&gt; e は左の列も捕まえるので、exit や Ctrl-C（Interrupt）による終了も止めてしまう</T>
    </Svg>
  )
}

/* ---------- 図 5（段階送り）ブロックが1回ずつ動く順 ---------- */
// lazy_trace.rb の出力の順。s は select、m は map のブロックの1回の実行、f は first(2) が配列から2件を取る処理
const EAGER = ['s1', 's2', 's3', 's4', 's5', 's6', 'm2', 'm4', 'm6', 'f']
const LAZY = ['s1', 's2', 'm2', 's3', 's4', 'm4']

function LazyPanel({ x0, title, events, k }: { x0: number; title: string; events: string[]; k: number }) {
  const done = events.slice(0, k)
  const lazy = events === LAZY
  const taken = (n: number) => n <= 4 && n % 2 === 0 && done.includes(lazy ? `m${n}` : 'f')
  const rows = [
    { name: 'select', key: (n: number) => `s${n}`, value: (n: number) => String(n % 2 === 0) },
    { name: 'map', key: (n: number) => `m${n}`, value: (n: number) => String(n * 10) },
    { name: 'first(2)', key: (n: number) => (lazy ? `m${n}` : 'f'), value: (n: number) => String(n * 10) },
  ]
  const blocks = done.filter((e) => e !== 'f').length
  const eagerNote = k < 6 ? 'select が全要素を調べ終えるまで、map は動かない' : k === 6 ? 'select が配列 [2, 4, 6] を作った' : k < 9 ? 'map が配列 [2, 4, 6] を前から処理している' : k === 9 ? 'map が配列 [20, 40, 60] を作った' : 'first(2) が先頭の2件を取り、[20, 40] を返した'
  const lazyNote = k < 3 ? 'first(2) が受け取った値：まだない' : k < 6 ? 'first(2) が受け取った値：20' : k === 6 ? '2件そろったので止まる。結果は [20, 40]' : '終わっている（要素5と6は調べない）'
  return (
    <g>
      <T x={x0} y={18} fs={12} bold>{title}</T>
      {[1, 2, 3, 4, 5, 6].map((n) => <T key={n} x={x0 + 101 + (n - 1) * 46} y={42} fs={11} anchor="middle" tone="muted">{n}</T>)}
      {rows.map((row, r) => (
        <g key={row.name}>
          <T x={x0} y={67 + r * 32} fs={11} mono>{row.name}</T>
          {[1, 2, 3, 4, 5, 6].map((n) => {
            const on = row.name === 'first(2)' ? taken(n) : done.includes(row.key(n))
            const current = on && events[k - 1] === row.key(n)
            return (
              <g key={n}>
                <rect x={x0 + 80 + (n - 1) * 46} y={54 + r * 32} width={42} height={26} rx={4}
                  fill={current ? 'var(--fig-box5)' : on ? 'var(--fig-box)' : 'none'}
                  stroke={current ? 'var(--fig-accent)' : 'var(--fig-line)'} strokeWidth={current ? 2 : 1} strokeDasharray={on ? undefined : '3 3'} />
                {on && <T x={x0 + 101 + (n - 1) * 46} y={67 + r * 32} fs={11} anchor="middle" mono>{row.value(n)}</T>}
              </g>
            )
          })}
        </g>
      ))}
      <T x={x0} y={166} fs={11.5}>{`ブロックの実行 ${blocks} 回`}</T>
      <T x={x0} y={186} fs={11} tone="muted">{lazy ? lazyNote : eagerNote}</T>
    </g>
  )
}

const lazyTexts = [
  <>どちらも select のブロックが要素1を調べます。1は奇数なので false を返します。</>,
  <>どちらも select のブロックが要素2を調べて true を返します。ここから先の順が分かれます。</>,
  <>通常の書き方では、select が次の要素3を調べます。lazy では、select を通った要素2がすぐに map へ渡って 20 になり、first(2) に届きます。</>,
  <>通常の書き方は要素4を、lazy は要素3を select で調べます。lazy は1つの要素を map まで流してから次の要素へ進みます。</>,
  <>通常の書き方は要素5を、lazy は要素4を select で調べます。通常の書き方では、map はまだ1回も動いていません。</>,
  <>通常の書き方では、select が要素6を調べ終えて、偶数だけの配列 [2, 4, 6] を作ります。lazy では要素4が map で 40 になり、first(2) に2件そろったので、ここで止まります。要素5と6は一度も調べません。</>,
  <>通常の書き方では、ここから map が配列 [2, 4, 6] を前から処理します。要素2が 20 になります。lazy はすでに終わっています。</>,
  <>map が要素4を 40 にします。</>,
  <>map が要素6を 60 にして、配列 [20, 40, 60] を作ります。60 は次の first(2) で使われませんが、通常の書き方では計算します。</>,
  <>first(2) が配列の先頭2件を取り、[20, 40] を返します。結果は lazy と同じですが、ブロックは通常の書き方が9回、lazy が6回動きました。</>,
]

const lazySteps = lazyTexts.map((text, i) => ({
  label: i < 9 ? `${i + 1}回目` : 'first(2)',
  detail: (
    <>
      <Svg id={`${figureNumber(96, 5)}-${i + 1}`} w={780} h={198}
        label={`通常の書き方とlazyで、select・map・first(2)がそれぞれどの要素を処理したかを表にした図。${i + 1}段階目。`}>
        <LazyPanel x0={10} title="通常（select → map → first(2)）" events={EAGER} k={i + 1} />
        <LazyPanel x0={400} title=".lazy を付けた場合" events={LAZY} k={i + 1} />
      </Svg>
      <p>{text}</p>
    </>
  ),
}))

/* ---------- 図 10 例外の有無と種類で変わる経路（選ぶと通る節が光る） ---------- */
type Clause = 'begin' | 'rescueArg' | 'rescueTemp' | 'else' | 'ensure'
const CLAUSES: { key: Clause; y: number; h: number; lines: string[] }[] = [
  { key: 'begin', y: 28, h: 58, lines: ['begin', '  attempts += 1', '  value = 処理(input)  # ここで例外が起きる'] },
  { key: 'rescueArg', y: 94, h: 40, lines: ['rescue ArgumentError', '  :invalid'] },
  { key: 'rescueTemp', y: 142, h: 58, lines: ['rescue TemporaryFailure', '  retry if attempts < 3', '  raise'] },
  { key: 'else', y: 208, h: 40, lines: ['else', '  :ok'] },
  { key: 'ensure', y: 256, h: 40, lines: ['ensure', '  後片付け'] },
]
const PATHS: { option: string; trace: [Clause, string][]; result: string; text: string }[] = [
  {
    option: '例外なし',
    trace: [['begin', 'begin（1回目）：最後まで進む'], ['else', 'else：:ok を結果にする'], ['ensure', 'ensure：後片付け']],
    result: '結果は :ok（else の値）',
    text: '例外が起きないので begin の最後まで進み、else と ensure が動きます。結果は begin の最後の式ではなく、else の最後の式 :ok です。',
  },
  {
    option: 'ArgumentError',
    trace: [['begin', 'begin（1回目）：ArgumentError'], ['rescueArg', 'rescue ArgumentError：:invalid'], ['ensure', 'ensure：後片付け']],
    result: '結果は :invalid（rescue の値）',
    text: 'ArgumentError が起きると begin の残りを飛ばし、型が合う rescue ArgumentError に移ります。else は動きません。',
  },
  {
    option: 'TypeError（対応する rescue なし）',
    trace: [['begin', 'begin（1回目）：TypeError'], ['ensure', 'ensure：後片付け']],
    result: '呼び出し元へ TypeError が伝わる',
    text: 'TypeError に合う rescue がないので、ensure だけが動いてから、例外が呼び出し元に伝わります。',
  },
  {
    option: 'TemporaryFailure が2回',
    trace: [
      ['begin', 'begin（1回目）：TemporaryFailure'], ['rescueTemp', 'rescue TemporaryFailure：retry'],
      ['begin', 'begin（2回目）：TemporaryFailure'], ['rescueTemp', 'rescue TemporaryFailure：retry'],
      ['begin', 'begin（3回目）：最後まで進む'], ['else', 'else：:ok を結果にする'], ['ensure', 'ensure：後片付け'],
    ],
    result: '結果は :ok（else の値）',
    text: 'retry は begin の先頭に戻ります。attempts は begin の外で 0 にしているので、戻っても回数は残ります。retry で戻るときには ensure は動かず、3回目で成功して begin 全体を抜けるときに1回だけ動きます。',
  },
  {
    option: 'TemporaryFailure が3回',
    trace: [
      ['begin', 'begin（1回目）：TemporaryFailure'], ['rescueTemp', 'rescue TemporaryFailure：retry'],
      ['begin', 'begin（2回目）：TemporaryFailure'], ['rescueTemp', 'rescue TemporaryFailure：retry'],
      ['begin', 'begin（3回目）：TemporaryFailure'], ['rescueTemp', 'rescue TemporaryFailure：raise'], ['ensure', 'ensure：後片付け'],
    ],
    result: '呼び出し元へ TemporaryFailure が伝わる',
    text: '3回目も失敗すると、attempts が 3 なので retry せず、引数なしの raise で同じ例外を伝え直します。呼び出し元へ伝わる前に、ensure が1回だけ動きます。',
  },
]

function ExceptionPathFigure() {
  const [selected, setSelected] = useState(0)
  const path = PATHS[selected]
  const retried = path.trace.some(([, t]) => t.endsWith('retry'))
  return (
    <Figure n={figureNumber(96, 10)} title="例外の有無と種類で変わる経路（選ぶと通る節が光る）" caption="flow.rb の load_article に retry.rb の再試行を足した形の概念モデルです。経路は同じ形のメソッドを Ruby 4.0.9 で5つの場合について実行して確かめました。実際のコードでは再試行の前に待ち時間を入れ、例外を記録します。">
      <FigureChoices label="begin の中で起きること" options={PATHS.map((p) => p.option)} selected={selected} onSelect={setSelected} />
      <Svg id={figureNumber(96, 10)} w={780} h={330} label={`${path.option}の場合、${path.trace.map(([, t]) => t).join('、')}の順に動き、${path.result}。`}>
        <T x={24} y={14} fs={11.5} mono>attempts = 0</T>
        {CLAUSES.map((c) => {
          const order = path.trace.flatMap(([k], i) => (k === c.key ? [i + 1] : []))
          return (
            <g key={c.key}>
              <Box x={20} y={c.y} w={330} h={c.h} lines={c.lines} fs={11.5} mono align="start"
                fill={order.length ? 'box5' : 'none'} accent={order.length > 0} dashed={!order.length} />
              {order.length > 0 && <T x={362} y={c.y + c.h / 2} fs={12} bold>{order.join('・')}</T>}
            </g>
          )
        })}
        <T x={24} y={312} fs={11.5} mono>end</T>
        {retried && <Arrow d="M20,171 L8,171 L8,57 L18,57" accent />}
        <T x={430} y={14} fs={12} bold>実行の順</T>
        {path.trace.map(([, t], i) => <T key={i} x={430} y={40 + i * 24} fs={11.5}>{`${i + 1}  ${t}`}</T>)}
        <T x={430} y={40 + path.trace.length * 24 + 8} fs={12} bold tone={path.result.startsWith('呼び出し元') ? 'danger' : undefined}>{path.result}</T>
      </Svg>
      <p aria-live="polite">{path.text}</p>
    </Figure>
  )
}

const chapter: Chapter = {
  number: 96,
  part: 1,
  title: 'Enumerable と例外処理',
  summary: '記事の一覧から条件に合うものを選び、変換し、集計するメソッドを Ruby 4.0.9 で動かします。同じ書き方が ActiveRecord::Relation ではどんな SQL になるかを MySQL で確かめ、処理できなかった場合に例外をどこで捕捉し、Rails でどのステータスコードを返すかを考えます。',
  goals: [
    'each を定義したクラスに Enumerable を include すると map や select が使える仕組みを説明できる',
    '選択、変換、集計のメソッドを、戻り値と途中の値から使い分ける',
    'Relation で SQL を使って絞る場合と、配列にしてから Ruby で絞る場合の違いを SQL のログで確かめられる',
    'begin・rescue・else・ensure・retry の実行順と、例外クラスの階層をもとに捕捉する範囲を決める',
    '独自の例外クラスを定義し、rescue_from で例外ごとのステータスコードを返せる',
  ],
  prerequisites: [95, 4],
  sections: [
    { id: 'each', title: 'each をもとに一覧を処理する', body: <>
      <p>記事の配列を画面に並べるとき、同じ表示処理を各記事に対して呼び出します。<code>each</code> にブロックを渡すと、配列が要素を順にブロックの引数へ渡します（ブロックと <code>yield</code> の仕組みは <ChapterLink n={4} section="block-yield" />）。<ChapterLink n={95} section="conditions" />で見たとおり、<code>Array#each</code> はブロックの戻り値を集めず、レシーバの配列をそのまま返します。変換結果の一覧が必要な場合は <code>map</code> を使います。</p>
      <Code lang="ruby" title="each と map の戻り値（# => の後ろは p で表示した値）" code={`
titles = ["Ruby", "Rails"]
p titles.each { |title| title.downcase } # => ["Ruby", "Rails"]
p titles.map { |title| title.downcase }  # => ["ruby", "rails"]
`} />
      <p><code>downcase</code> は小文字に変換した文字列を返します。例の <code>map</code> はその結果を新しい配列に集めるので、元の配列の文字列は変わりません。ただし <code>map</code> 自体がブロックの副作用を防ぐわけではありません。ブロックが文字列を直接書き換えれば元の配列が指す値も変化します。表示のための変換であれば、入力を書き換えない方法を選ぶと、その後の処理で元の題名を使えます。</p>
      <h3>Enumerable は each だけを前提にする</h3>
      <p><Term>Enumerable</Term> は要素を順に取り出せるクラスに選択や変換のメソッドを提供するモジュールです。自作のクラスで使うには、<code>include Enumerable</code> を書き、要素を順にブロックへ渡す <code>each</code> を定義します<Ref n={1} />。記事の題名の一覧を表すクラスで確かめます。<code>each</code> が何回値を渡したかを数えるため、<code>@yielded</code> を足しています。</p>
      <Code lang="ruby" title="enumerable.rb" code={`
class ArticleList
  include Enumerable

  def initialize(*titles)
    @titles = titles
    @yielded = 0
  end
  attr_reader :yielded

  def each
    @titles.each do |title|
      @yielded += 1
      yield title
    end
    self
  end
end

list = ArticleList.new("Ruby", "Rails", "HTTP", "SQL")
p list.map(&:downcase)
p list.select { |t| t.length == 4 }
p list.sort_by(&:length)
p list.min_by(&:length)
p list.include?("HTTP")
p list.each_slice(2).to_a
p list.to_a
p list.yielded

list2 = ArticleList.new("Ruby", "Rails", "HTTP", "SQL")
p list2.find { |t| t.start_with?("R") }
p list2.yielded

p ArticleList.ancestors.take(3)
p ArticleList.instance_method(:map).owner
p Array.instance_method(:map).owner
p Array.instance_method(:each_slice).owner
p Hash.include?(Enumerable)
p Range.include?(Enumerable)
p Enumerable.instance_methods.size

class NoEach
  include Enumerable
end
begin
  NoEach.new.map { it }
rescue NoMethodError => e
  puts "NoMethodError: #{e.message}"
end
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
["ruby", "rails", "http", "sql"]
["Ruby", "HTTP"]
["SQL", "Ruby", "HTTP", "Rails"]
"SQL"
true
[["Ruby", "Rails"], ["HTTP", "SQL"]]
["Ruby", "Rails", "HTTP", "SQL"]
27
"Ruby"
1
[ArticleList, Enumerable, Object]
Enumerable
Array
Enumerable
true
true
61
NoMethodError: undefined method 'each' for an instance of NoEach
`} />
      <p>ArticleList に書いたメソッドは <code>initialize</code> と <code>each</code> だけですが、<code>map</code>、<code>select</code>、<code>sort_by</code>、<code>min_by</code>、<code>include?</code>、<code>each_slice</code>、<code>to_a</code> が使えました。<code>&amp;:downcase</code> は各要素に <code>downcase</code> を呼ぶブロックの短い書き方です。<code>ancestors</code> の結果に Enumerable があり、<code>ArticleList.instance_method(:map).owner</code> は Enumerable を返しました。Enumerable の <code>map</code> はレシーバの <code>each</code> を呼び、渡された値をブロックで変換して配列に集めます（図 {figureNumber(96, 1)}）。</p>
      <Figure n={figureNumber(96, 1)} title="Enumerable#map が each を呼ぶ順" caption="enumerable.rb の list.map(&amp;:downcase) を時間の順に並べた模式図。Enumerable の実際の実装は C で書かれていて、内部の呼び出しはこの図より細かい。">
        <EnumerableFigure />
      </Figure>
      <p><code>yielded</code> の 27 は、7つのメソッドが合わせて <code>each</code> から27回値を受け取ったことを示します。<code>include?("HTTP")</code> は3つ目で見つけて止まるので3回、ほかの6つは4回ずつです。<code>find</code> も最初に条件に合った <code>"Ruby"</code> で止まり、1回でした。Enumerable のメソッドは必要な分だけ <code>each</code> を進めて止められます。</p>
      <p>Array の <code>map</code> の owner は Array でした。Array、Hash、Range は Enumerable を include していますが、よく使うメソッドは各クラスが C で速く書き直しています。動作は Enumerable の同じ名前のメソッドと同じです。<code>each_slice</code> のように書き直していないメソッドは Enumerable のものが使われます。Enumerable のメソッドは Ruby 4.0.9 で61個あり、<code>each</code> を定義しないクラスで <code>map</code> を呼ぶと、Enumerable の中から呼んだ <code>each</code> がないため NoMethodError になりました。<code>{'{ it }'}</code> の <code>it</code> は、引数が1つのブロックで、その引数を名前を付けずに参照する書き方です（Ruby 3.4 以降）。</p>
      <p>Hash の <code>each</code> では、<code>{'hash.each { |key, value| ... }'}</code> のように書くとキーと値を受け取れます。Hash の <code>map</code> や <code>select</code> も同じようにキーと値を受け取ります（<code>select</code> は Hash を、<code>map</code> は配列を返します）。</p>
    </> },
    { id: 'enumerator', title: 'ブロックを渡さない each と Enumerator', body: <>
      <p><code>each</code> や <code>map</code> をブロックなしで呼ぶと、エラーにはならず Enumerator というオブジェクトが返ります。Enumerator は「この列挙をこれから行う」という状態を表すオブジェクトで、後からブロックを渡したり、1つずつ取り出したりできます<Ref n={4} />。</p>
      <Code lang="ruby" title="enumerator.rb" code={`
titles = ["Ruby", "Rails", "HTTP"]
e = titles.each
p e.class
p e.next
p e.next
p e.next
begin
  e.next
rescue StopIteration => ex
  puts "StopIteration: #{ex.message}"
end
p titles.map.with_index(1) { |t, i| "#{i}. #{t}" }
p titles.each_with_index.to_a
p titles.each_slice(2).to_a
p titles.select.with_index { |_, i| i.even? }

class ArticleList
  include Enumerable
  def initialize(*titles) = @titles = titles
  def each
    return to_enum(:each) unless block_given?
    @titles.each { |t| yield t }
    self
  end
end
en = ArticleList.new("a", "b").each
p en.class
p en.next

fib = Enumerator.new do |y|
  a, b = 0, 1
  loop do
    y << a
    a, b = b, a + b
  end
end
p fib.take(10)
p fib.lazy.select(&:even?).first(5)
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
Enumerator
"Ruby"
"Rails"
"HTTP"
StopIteration: iteration reached an end
["1. Ruby", "2. Rails", "3. HTTP"]
[["Ruby", 0], ["Rails", 1], ["HTTP", 2]]
[["Ruby", "Rails"], ["HTTP"]]
["Ruby", "HTTP"]
Enumerator
"a"
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
[0, 2, 8, 34, 144]
`} />
      <p><code>next</code> は要素を1つずつ取り出し、最後まで進んだ後に呼ぶと StopIteration が発生します。よく使うのは <code>with_index</code> です。<code>map.with_index(1)</code> は <code>map</code> のブロックに要素と1から始まる番号を渡すので、「1. Ruby」のような番号付きの一覧を作れます。<code>select.with_index</code> のように、ほかのメソッドにも番号を付けられます。</p>
      <p>自作の <code>each</code> の先頭に <code>return to_enum(:each) unless block_given?</code> を書くと、ブロックなしで呼んだときに Enumerator を返せます。<code>block_given?</code> はブロックが渡されたかを返すメソッドです。この1行がないと、ブロックなしの <code>each</code> は <code>yield</code> の行で LocalJumpError になります。Rails の <code>find_each</code> もブロックなしで呼ぶと Enumerator を返すので、<code>Article.find_each.with_index</code> と書けます<Ref n={12} />。</p>
      <p><code>Enumerator.new</code> を使うと、<code>each</code> を持つクラスを定義せずに列挙を作れます。ブロックの引数 <code>y</code> に <code>&lt;&lt;</code> で渡した値が、1つずつ列挙されます。フィボナッチ数を作るこの例は <code>loop</code> で終わりなく値を渡し続けますが、<code>take(10)</code> は10個を受け取った時点で止めます。終わりのない列挙を <code>select</code> で絞るには、次の次の節で扱う <code>lazy</code> が必要です。</p>
    </> },
    { id: 'selection', title: '見つける、選ぶ、変換する', body: <>
      <p>公開済みの記事を一覧にするときは、公開状態を条件にして <code>select</code> を使います。最初に見つかった記事だけを読むなら <code>find</code>、該当する記事があるかだけ調べるなら <code>any?</code> を使います。<code>find</code> と <code>any?</code> は、条件に合う要素が見つかれば、それ以降の要素を確認する必要がありません。すべてを要する処理で <code>find</code> を選ぶと、該当する記事が複数あっても1件しか返りません。</p>
      <Code lang="ruby" title="selection.rb（# => の後ろは p で表示した値）" code={`
articles = [
  { title: "Ruby", published: true, views: 20 },
  { title: "Rails", published: false, views: 8 },
  { title: "HTTP", published: true, views: 14 }
]

published = articles.select { |article| article.fetch(:published) }
p published.map { |article| article.fetch(:title) } # => ["Ruby", "HTTP"]
p articles.any? { |article| article.fetch(:views) > 15 } # => true
p articles.reject { |article| article.fetch(:published) }.size # => 1
pub, draft = articles.partition { |article| article.fetch(:published) }
p [pub.size, draft.size] # => [2, 1]
p articles.filter_map { |a| a.fetch(:title) if a.fetch(:views) > 10 } # => ["Ruby", "HTTP"]
`} />
      <p>この例では公開状態や閲覧数を必須と考えて <code>fetch</code> を使います。公開状態を欠いた記事を下書きとして扱う契約なら、<code>fetch(:published, false)</code> と書けば既定値が明確です。<code>reject</code> は <code>select</code> の逆で、条件に合わない要素を残します。<code>partition</code> は条件に合う要素と合わない要素の2つの配列を返すので、<code>pub, draft = ...</code> のように2つの変数で受け取れます（多重代入）。公開済みと下書きの両方を使う画面で <code>select</code> と <code>reject</code> を続けて呼ぶと配列を2回たどりますが、<code>partition</code> なら1回です。</p>
      <Figure n={figureNumber(96, 2)} title="同じコレクションを処理したときの戻り値" caption="空のときや該当する要素がないときの値も、呼び出し側が必要とする形に合わせる。"><div className="table-wrap"><table><thead><tr><th>欲しい結果</th><th>メソッド</th><th>該当する値がないとき</th></tr></thead><tbody>
        <tr><td>該当する全要素</td><td><code>select</code>（<code>filter</code>）</td><td><code>[]</code></td></tr>
        <tr><td>該当しない全要素</td><td><code>reject</code></td><td><code>[]</code></td></tr>
        <tr><td>該当する要素と、しない要素の組</td><td><code>partition</code></td><td><code>[[], [全要素]]</code></td></tr>
        <tr><td>最初の該当要素</td><td><code>find</code>（<code>detect</code>）</td><td>既定では <code>nil</code></td></tr>
        <tr><td>該当する要素があるか</td><td><code>any?</code></td><td><code>false</code></td></tr>
        <tr><td>全要素の変換結果</td><td><code>map</code>（<code>collect</code>）</td><td>空配列に対しては <code>[]</code></td></tr>
        <tr><td>変換結果のうち nil と false 以外</td><td><code>filter_map</code></td><td><code>[]</code></td></tr>
      </tbody></table></div></Figure>
      <p>選択と変換の両方を <code>filter_map</code> にまとめることもできますが、戻り値が偽と判定される <code>false</code> や <code>nil</code> は結果から除かれます。上の例では閲覧数が10以下の記事でブロックが nil を返すので、その記事は結果に入りません。変換後の <code>false</code> に意味がある場合は、選択と変換を別々に行います。</p>
      <p><code>select</code> に渡すブロックは残すかどうかを表す値を返します。値そのものを返して選択と変換の両方を行うことはできません。例の <code>select</code> のブロックから <code>article.fetch(:title)</code> を返すと、題名が空文字列でも真と判定され、元の記事全体が残ります。条件を決める式と、結果に含めたい形式を作る式は、呼び出しているメソッドの役割を見て読み分けます。</p>
    </> },
    { id: 'aggregation', title: '複数の値から集計結果を作る', body: <>
      <p>集計の例では記事を <code>Struct</code> で表します。<code>Struct.new(:title, :category, :views, :published)</code> は、4つの属性を持つ小さなクラスを作り、<code>a.views</code> のように属性を読めるようにします。</p>
      <Code lang="ruby" title="aggregate.rb" code={`
Article = Struct.new(:title, :category, :views, :published)
articles = [
  Article.new("Ruby の文字列", "ruby", 20, true),
  Article.new("Rails の起動", "rails", 8, false),
  Article.new("HTTP の基本", "web", 14, true),
  Article.new("Ruby の例外", "ruby", 31, true),
]

p articles.sum(&:views)
p articles.sort_by(&:views).map(&:views)
p articles.sort_by { -it.views }.map(&:views)
p articles.max_by(&:views).title
p articles.map(&:category).tally
p articles.group_by(&:category).transform_values { |list| list.map(&:title) }
p articles.count(&:published)

total = articles.reduce(0) do |sum, a|
  puts "  sum=#{sum} + #{a.views}"
  sum + a.views
end
p total

by_cat = articles.each_with_object(Hash.new(0)) do |a, views|
  views[a.category] += a.views
end
p by_cat

p articles.each_with_object(0) { |a, sum| sum += a.views }

begin
  articles.reduce({}) { |h, a| h[a.category] = a.views }
rescue => e
  puts "#{e.class}: #{e.message}"
end

p [].sum
p [].reduce(:+)
p ["a", "b"].sum("")
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
73
[8, 14, 20, 31]
[31, 20, 14, 8]
"Ruby の例外"
{"ruby" => 2, "rails" => 1, "web" => 1}
{"ruby" => ["Ruby の文字列", "Ruby の例外"], "rails" => ["Rails の起動"], "web" => ["HTTP の基本"]}
3
  sum=0 + 20
  sum=20 + 8
  sum=28 + 14
  sum=42 + 31
73
{"ruby" => 51, "rails" => 8, "web" => 14}
0
NoMethodError: undefined method '[]=' for an instance of Integer
0
nil
"ab"
`} />
      <p><code>sum(&amp;:views)</code> は各記事の閲覧数を合計します。<code>sort_by</code> はブロックが返した値の小さい順に並べた新しい配列を返し、大きい順にしたいときは例のように符号を反転させるか、並べた後に <code>reverse</code> します。<code>max_by</code> と <code>min_by</code> は、ブロックの値が最大や最小の要素を返します。</p>
      <p><code>tally</code> は同じ値が何回現れたかを数えた Hash を返し、<code>group_by</code> はブロックの値ごとに元の要素をまとめた Hash を返します。<code>group_by</code> の結果には各グループに属する元の要素が残ります。カテゴリごとの記事を後ろの処理でも扱うなら便利ですが、件数だけが必要なら、カテゴリの一覧を作って <code>tally</code> で数えられます。データを残す範囲を結果の用途から決めます。</p>
      <h3>reduce と each_with_object</h3>
      <p><code>reduce</code> では前の要素までの結果と現在の要素から次の結果を作ります。順に実行すると、<code>sum</code> は初期値の <code>0</code> から <code>20</code>、<code>28</code>、<code>42</code> に変わり、最後のブロックの戻り値 <code>73</code> が <code>reduce</code> の戻り値になりました。計算が進んだという事実は、その都度ブロックの戻り値として次の回に渡ります。初期値を指定しないと、空の配列に対する <code>[].reduce(:+)</code> は nil を返します。初期値を指定すると、入力が空の場合にも結果が定まります。</p>
      <p><code>each_with_object</code> は引数に渡したオブジェクトを各回のブロックに渡し、最後にそのオブジェクトを返します。ブロックの戻り値は使いません。カテゴリごとの閲覧数の合計を Hash に集める処理は、同じ1つの Hash を書き換え続けるので、ブロックの最後で Hash を返す式を書かずに済む <code>each_with_object</code> のほうが短く書けます（図 {figureNumber(96, 3)}）。</p>
      <Figure n={figureNumber(96, 3)} title="reduce と each_with_object の途中の値" caption="aggregate.rb の実行結果をもとにした図。each_with_object の Hash は、図では「キー: 値」の形に簡略化して書いている。">
        <AccumulatorFigure />
      </Figure>
      <p>2つを取り違えると、実行結果の後半の2つの誤りになります。<code>each_with_object(0)</code> で <code>sum += a.views</code> と書くと、ブロックの変数 <code>sum</code> に新しい Integer を代入するだけで、<code>each_with_object</code> が持っている 0 は変わらないため、戻り値は 0 でした。Integer は書き換えられないオブジェクトなので、数値の合計には <code>sum</code> か <code>reduce</code> を使います。逆に <code>reduce({})</code> で Hash に代入する式をブロックの最後に書くと、代入式の値（閲覧数の Integer）が次の回の <code>h</code> になり、2回目に Integer の <code>[]=</code> を呼んで NoMethodError になりました。</p>
      <p>同じ仕事を <code>sum</code> や <code>tally</code> で表現できるときは、何を計算しているかがメソッド名から分かります。Float の合計では <code>sum</code> と <code>reduce(:+)</code> の結果が違うことがある点に注意します（<ChapterLink n={95} section="numbers" />）。文字列をつなぐ <code>sum</code> には初期値の <code>""</code> を渡します。</p>
      <p>記事がすでに配列に入っているなら Ruby で集計できます。データベースにある全記事を件数だけ知るために読み込むと、各行を転送してオブジェクトを作る費用がかかります。データベースで表現できる条件や集計には <code>where</code>、<code>group</code>、<code>count</code> が使えます。この違いを「Relation と配列」の節で確かめます。</p>
    </> },
    { id: 'lazy', title: '必要な分だけ処理する', body: <>
      <p><code>select</code> や <code>map</code> は通常、列挙した要素をすべて評価して結果の配列を返します。たとえば無限に続く範囲へ普通の <code>select</code> を使うと、処理が終わりません。<code>lazy</code> を使うと、後ろの処理が要求した分だけ要素を評価する <code>Enumerator::Lazy</code> を作れます<Ref n={5} />。大量の入力のうち先頭の数件だけが必要なときにも使えます。</p>
      <Code lang="ruby" title="lazy_trace.rb" code={`
log = []
eager = (1..6).select { |n| log << "select #{n}"; n.even? }
              .map    { |n| log << "map #{n}"; n * 10 }
              .first(2)
p eager
puts log.join(" / ")

log = []
lazy = (1..6).lazy
             .select { |n| log << "select #{n}"; n.even? }
             .map    { |n| log << "map #{n}"; n * 10 }
             .first(2)
p lazy
puts log.join(" / ")

l = (1..6).lazy.map { |n| n * 10 }
p l.class
p l.to_a
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
[20, 40]
select 1 / select 2 / select 3 / select 4 / select 5 / select 6 / map 2 / map 4 / map 6
[20, 40]
select 1 / select 2 / map 2 / select 3 / select 4 / map 4
Enumerator::Lazy
[10, 20, 30, 40, 50, 60]
`} />
      <p>結果はどちらも <code>[20, 40]</code> ですが、ブロックが動いた順が違います。通常の書き方では、<code>select</code> が1から6まで全部を調べて <code>[2, 4, 6]</code> を作り、次に <code>map</code> が3回動いてから、<code>first(2)</code> が先頭の2件を取りました。<code>lazy</code> では1つの要素を <code>select</code> から <code>map</code> へ流し、2件そろった時点で止まりました（図 {figureNumber(96, 4)}）。<code>lazy</code> のメソッドは <code>Enumerator::Lazy</code> を返すだけで、<code>first</code> や <code>to_a</code> を呼んだときに初めて評価します。</p>
      <Figure n={figureNumber(96, 4)} title="通常の評価と lazy の評価の順" caption="lazy_trace.rb と lazy_count.rb の出力をもとにした図。">
        <LazyOrderFigure />
      </Figure>
      <p>図 {figureNumber(96, 5)} では、ブロックが1回動くごとに段階を進めます。通常の書き方と <code>lazy</code> で、どの要素がどの段階まで処理されたかを並べて確かめられます。</p>
      <Figure n={figureNumber(96, 5)} title="ブロックが1回ずつ動く順（段階送り）" caption="lazy_trace.rb の出力の順をもとにした概念モデルです。1段階はブロックの1回の実行で、かかる時間は表していません。lazy は要素ごとに処理を受け渡す手間がかかるため、同じ回数でも実際の時間は通常の書き方と同じにはなりません。">
        <Stepper steps={lazySteps} />
      </Figure>
      <p>要素が多いと差が大きくなります。1から1,000,000までの範囲で <code>select(&amp;:even?)</code>、<code>map</code>、<code>first(10)</code> を続け、ブロックが動いた回数を数えました（lazy_count.rb）。通常の書き方では select のブロックが 1,000,000 回、map のブロックが 500,000 回動き、500,000 要素の配列を2つ作りました。<code>lazy</code> では select が20回、map が10回でした。</p>
      <p>一方、全要素を最後まで使う処理では <code>lazy</code> は速くなりません。同じ範囲で select、map、<code>sum</code> を続けて5回ずつ実行した中央値は、通常の書き方が 2,109 ms、<code>lazy</code> が 4,215 ms でした（Docker の ruby:4.0、Ruby 4.0.9、Core i7-1270P の4コアを割り当てた WSL2 上。ほかの処理も動いていて load average は約22だったので、絶対値ではなく比を参考にしてください）。<code>lazy</code> は要素ごとに処理を受け渡す分の手間がかかるためです。先頭の数件だけ使う場合や、終わりのない列挙を扱う場合に使います。</p>
      <p><code>&amp;:even?</code> はそれぞれの要素へ <code>even?</code> を呼ぶ書き方です。入力をすでに全件読み込んでいる場合、<code>lazy</code> を付けても読み込み時の費用は戻りません。<code>File.foreach</code> のようにファイルから1行ずつ値を受け取る処理と組み合わせると、ファイル全体をメモリーに読まずに先頭の数件を探せます。SQL で対象を絞れる Relation の処理は、次の節で区別します。</p>
    </> },
    { id: 'relation', title: 'ActiveRecord::Relation と配列', body: <>
      <p>この節では、Rails がデータベースに送った SQL を見比べます。データベースは記事などのデータを、行（記事1件）と列（題名、公開済みかどうか、閲覧数などの項目）からなる表に入れています。SQL はどの表のどの行と列を読むか、読んだ行をどう数えるかをデータベースに指示する言語です。この節の実行結果に出てくる SQL の書き方は次のとおりです。</p>
      <ul>
        <li><code>SELECT 列 FROM 表</code>：表から指定した列を読みます。列に <code>*</code> を書くと、すべての列を読みます。</li>
        <li><code>WHERE 条件</code>：条件に合う行だけを読みます。<code>published = TRUE</code> なら公開済みの行だけです。複数の条件を <code>AND</code> でつなぐと、すべての条件に合う行だけになります。</li>
        <li><code>COUNT(*)</code>・<code>SUM(列)</code>：行の数や列の値の合計を計算し、1つの数にして返します。</li>
        <li><code>GROUP BY 列</code>：列の値が同じ行を1つのグループにまとめ、グループごとに COUNT などを計算します。</li>
        <li><code>ORDER BY 列</code>・<code>LIMIT n</code>：行を列の値の順に並べ、先頭から n 行だけを返します。</li>
      </ul>
      <p>実行結果の SQL では <code>`articles`.`published`</code> のように名前がバッククォートで囲まれています。これは MySQL の名前の書き方で、articles 表の published 列を表します。データベースが行を絞ったり数えたりした結果だけを Rails が受け取り、受け取った行1つごとにモデルのオブジェクトを1件作ります。SQL の文の書き方は <ChapterLink n={35} /> で、GROUP BY による集計は <ChapterLink n={36} section="group-by" /> で詳しく扱います。</p>
      <p>Rails の <code>Article.where(published: true)</code> が返す ActiveRecord::Relation も Enumerable を include していて、<code>map</code> や <code>select</code> を呼べます<Ref n={8} />。ただし、同じ名前のメソッドでも SQL で絞るものと、行を全部読み込んでから Ruby で絞るものがあります。MySQL 8.4.13 に記事を6件（公開済み3件）入れ、Active Record 8.1.4.1 から実行された SQL と、作られたモデルの数を記録しました。SQL は <code>sql.active_record</code>、モデルの数は <code>instantiation.active_record</code> の通知を購読して数えています。</p>
      <Code lang="ruby" title="relation.rb（抜粋。接続、テーブルの作成、通知の購読は省略）" code={`
r = Article.where(published: true)
p r.class
p r.class.ancestors.include?(Enumerable)
p r.loaded?

p r.map(&:title)                                  # A
arr = Article.all.select(&:published)             # B
p arr.class
p Article.select(:id, :title).where(published: true).map(&:title)
p Article.where(published: true).pluck(:title)    # C
p Article.where(published: true).count
p Article.where(published: true).length
p Article.where(published: true).sum(:views)
p Article.where(published: true).sum(&:views)
p Article.group(:category).count
p Article.all.group_by(&:category).transform_values(&:size)
Article.where(published: true).find_each(batch_size: 2) { |a| print a.title, " " }
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9、Rails 8.1.4.1、MySQL 8.4.13。SQL とモデルの数を各行の下に書いた）" code={`
Article::ActiveRecord_Relation
true
nil                     # where を作っただけでは SQL を実行しない
["記事1", "記事3", "記事5"]
  SQL: SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE
  モデル 3件
Array
  SQL: SELECT \`articles\`.* FROM \`articles\`
  モデル 6件
["記事1", "記事3", "記事5"]
  SQL: SELECT \`articles\`.\`id\`, \`articles\`.\`title\` FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE
  モデル 3件
["記事1", "記事3", "記事5"]
  SQL: SELECT \`articles\`.\`title\` FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE
  モデル 0件
3
  SQL: SELECT COUNT(*) FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE
3
  SQL: SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE
  モデル 3件
45
  SQL: SELECT SUM(\`articles\`.\`views\`) FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE
45
  SQL: SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE
  モデル 3件
{"ruby" => 2, "rails" => 2, "web" => 2}
  SQL: SELECT COUNT(*) AS \`count_all\`, \`articles\`.\`category\` AS \`articles_category\` FROM \`articles\` GROUP BY \`articles\`.\`category\`
{"ruby" => 2, "rails" => 2, "web" => 2}
  SQL: SELECT \`articles\`.* FROM \`articles\`
  モデル 6件
記事1 記事3 記事5
  SQL: SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE ORDER BY \`articles\`.\`id\` ASC LIMIT 2
  SQL: SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE AND \`articles\`.\`id\` > 3 ORDER BY \`articles\`.\`id\` ASC LIMIT 2
  モデル 3件
`} />
      <p><code>where</code> で作った Relation は <code>loaded?</code> が nil で、まだ SQL を実行していません。<code>map</code> を呼んだ時点で WHERE 付きの SQL が1回実行され、公開済みの3行からモデルが3件作られました。Relation の <code>each</code> や <code>length</code> は読み込んだレコードの配列に処理を任せるように定義されているため、最初に呼んだときに SQL を実行します<Ref n={9} />。SQL をいつ実行するかは <ChapterLink n={12} section="lazy" />で詳しく扱います。</p>
      <p><code>Article.all.select(&amp;:published)</code> は結果が同じ3件でも、SQL に WHERE がなく、全6行からモデルを6件作ってから Ruby で絞りました。Relation の <code>select</code> はブロックを渡すと Enumerable の <code>select</code> を呼び、引数で列名を渡すと SQL の SELECT 句を作ります<Ref n={10} />。<code>select(:id, :title)</code> の行では SELECT 句が2列に変わっています。同じ名前でも、ブロックがあるかどうかで SQL と Ruby のどちらで処理するかが変わります（図 {figureNumber(96, 6)}）。</p>
      <Figure n={figureNumber(96, 6)} title="SQL で絞る場合と Ruby で絞る場合" caption="relation.rb の実行結果をもとにした図。モデルの数は instantiation.active_record の通知で数えた。">
        <RelationFigure />
      </Figure>
      <p>件数や合計でも同じ違いが出ます。<code>count</code> と <code>sum(:views)</code> は COUNT や SUM の SQL を実行し、モデルを作りません。<code>length</code> は全行を読み込んでから配列の長さを返し、<code>sum(&amp;:views)</code> はブロックがあるので全行を読み込んで Ruby で足します<Ref n={11} />。<code>size</code> は読み込み前なら COUNT の SQL を実行し、読み込み済みなら配列の長さを返します。カテゴリごとの件数も <code>group(:category).count</code> なら GROUP BY の SQL 1回で、<code>all.group_by</code> では全行のモデルを作りました。</p>
      <Figure n={figureNumber(96, 7)} title="Relation で同じ結果を得る2つの書き方" caption="relation.rb の実行結果（Rails 8.1.4.1、MySQL 8.4.13）。モデルの数はこの6行のテーブルでの値。"><div className="table-wrap"><table><thead><tr><th>欲しい結果</th><th>SQL で処理する書き方（データベースが絞る・数える）</th><th>全行を読んで Ruby で処理する書き方</th></tr></thead><tbody>
        <tr><td>公開済みの記事</td><td><code>where(published: true)</code>（モデル 3件）</td><td><code>all.select(&amp;:published)</code>（モデル 6件）</td></tr>
        <tr><td>題名の一覧</td><td><code>pluck(:title)</code>（モデル 0件）</td><td><code>map(&amp;:title)</code>（モデル 3件）</td></tr>
        <tr><td>件数</td><td><code>count</code>（COUNT の SQL）</td><td><code>length</code>（全行を読む）</td></tr>
        <tr><td>合計</td><td><code>sum(:views)</code>（SUM の SQL）</td><td><code>sum(&amp;:views)</code>（全行を読む）</td></tr>
        <tr><td>カテゴリごとの件数</td><td><code>group(:category).count</code>（GROUP BY の SQL）</td><td><code>all.group_by(&amp;:category)</code>（モデル 6件）</td></tr>
        <tr><td>全件を順に処理</td><td><code>find_each</code>（バッチごとに SQL）</td><td><code>each</code>（1回の SQL で全行）</td></tr>
      </tbody></table></div></Figure>
      <p>最後の <code>find_each(batch_size: 2)</code> は、主キーの順に2行ずつ読み込みました。2回目の SQL には <code>id &gt; 3</code> が付いていて、1回目に読んだ最後の ID より後ろから続けています<Ref n={12} />。<code>each</code> はすべての行を1回の SQL で読んでモデルを全部作るので、件数が多いとメモリーを多く使います。<code>find_each</code> は一度に作るモデルを <code>batch_size</code>（既定は1000）件までにします。バッチの大きさや並び順の決め方は <ChapterLink n={100} section="batches" />で扱います。</p>
      <p>判断の目安は、データベースで表現できる条件・並べ替え・集計は SQL で行い、Ruby のメソッドでしか書けない処理（文字列の加工、外部のデータとの突き合わせ）だけを Ruby で行うことです。行の内容が本当に必要かを区別し、必要な列や行を絞る方法は <ChapterLink n={100} section="projection">取得する列や行を絞る節</ChapterLink>へ進みます。関連先を読み込むときに SQL が増える問題は <ChapterLink n={13} section="n-plus-one" />で扱います。</p>
    </> },
    { id: 'exceptions', title: '例外を捕捉して後片付けをする', body: <>
      <p>ファイルが見つからなかったときや、JSON の構文を解釈できなかったとき、Ruby のメソッドは<dfn>例外</dfn>を起こすことがあります。例外は処理を続けられないことを知らせるオブジェクトで、種類ごとにクラスがあります。例外が起きると現在の処理を中断し、その例外を捕捉できる場所を呼び出し元へ向かって探します。<code>begin</code> と <code>rescue</code> を使うと、復旧方法が分かる例外を受け取れます<Ref n={3} />。</p>
      <p>まず、<code>begin</code>・<code>rescue</code>・<code>else</code>・<code>ensure</code> の各節がどの順に動くかを確かめます。メソッドの本体に直接 <code>rescue</code> を書くと、<code>begin</code> を書かなくてもメソッド全体が対象になります。</p>
      <Code lang="ruby" title="flow.rb" code={`
$stdout.sync = true
def load_article(input)
  puts "  begin: 処理を始める"
  value = Integer(input)
  puts "  begin: 変換できた"
  value
rescue ArgumentError => e
  puts "  rescue: #{e.class}"
  :invalid
else
  puts "  else: 例外が起きなかった"
  :ok
ensure
  puts "  ensure: 必ず実行する"
  :ignored
end

["42", "abc"].each do |input|
  puts "load_article(#{input.inspect})"
  p load_article(input)
end
puts "load_article(nil)"
begin
  load_article(nil)
rescue TypeError => e
  puts "  呼び出し元の rescue: #{e.class}: #{e.message}"
end

def swallow
  raise "保存に失敗"
ensure
  return :from_ensure
end
p swallow
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
load_article("42")
  begin: 処理を始める
  begin: 変換できた
  else: 例外が起きなかった
  ensure: 必ず実行する
:ok
load_article("abc")
  begin: 処理を始める
  rescue: ArgumentError
  ensure: 必ず実行する
:invalid
load_article(nil)
  begin: 処理を始める
  ensure: 必ず実行する
  呼び出し元の rescue: TypeError: can't convert nil into Integer
:from_ensure
`} />
      <p><code>"42"</code> では begin の最後まで進み、<code>else</code> と <code>ensure</code> が動きました。メソッドの結果は begin の最後の式 <code>value</code>（42）ではなく、<code>else</code> の値 <code>:ok</code> です。<code>else</code> を書くと、例外が起きなかった場合の結果は <code>else</code> の最後の式になります。<code>"abc"</code> では <code>Integer</code> が ArgumentError を起こし、begin の残りを飛ばして <code>rescue</code> に移りました。<code>nil</code> では TypeError が起き、対応する <code>rescue</code> がないので <code>ensure</code> だけが動いてから、例外が呼び出し元に伝わりました（図 {figureNumber(96, 8)}）。</p>
      <Figure n={figureNumber(96, 8)} title="begin・rescue・else・ensure の実行経路" caption="flow.rb の3つの入力で、各節が実行されたかを表にした図。">
        <FlowFigure />
      </Figure>
      <p><code>ensure</code> は正常終了、例外、途中の <code>return</code> のどれでも実行されますが、<code>ensure</code> の最後の式（<code>:ignored</code>）は結果になりません。ただし、<code>ensure</code> の中で <code>return</code> すると、前の処理が返そうとしていた結果や例外を覆い隠します。<code>swallow</code> は「保存に失敗」の RuntimeError を起こしたのに、呼び出し元には <code>:from_ensure</code> が返り、例外は消えました。後片付けの節は片付けの操作だけに絞ります。</p>
      <h3>例外の型で処理を分ける</h3>
      <Code lang="ruby" title="parse_article.rb" code={`
require "json"

def parse_article(raw)
  result = JSON.parse(raw)
  return { error: :invalid_shape } unless result.is_a?(Hash)

  { article: result }
rescue JSON::ParserError
  { error: :invalid_json }
end

p parse_article('{"title":"Ruby"}')
p parse_article("not JSON")
p parse_article("[]")
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
{article: {"title" => "Ruby"}}
{error: :invalid_json}
{error: :invalid_shape}
`} />
      <Figure n={figureNumber(96, 9)} title="構文とデータの形で異なる戻り値" caption="呼び出し元は戻り値から失敗の種類を判別できる。"><div className="table-wrap"><table><thead><tr><th>入力</th><th>起きること</th><th>戻り値のキー</th></tr></thead><tbody>
        <tr><td>JSON オブジェクト</td><td>構文と形の検査を通る</td><td><code>article</code></td></tr>
        <tr><td>JSON 配列</td><td>構文は正しく、期待した形と異なる</td><td><code>error: :invalid_shape</code></td></tr>
        <tr><td>壊れた JSON</td><td><code>JSON::ParserError</code> を捕捉する</td><td><code>error: :invalid_json</code></td></tr>
      </tbody></table></div></Figure>
      <p><code>rescue</code> に例外の型を書かない場合は <code>StandardError</code> とそのサブクラスを捕捉します。上の例では <code>JSON::ParserError</code> だけに絞ります。そのため、定義の誤りによって想定していないメソッドを呼んだ場合などは、異常を呼び出し元に伝えられます。</p>
      <p>同じ <code>begin</code> に複数の <code>rescue</code> を書くと、上から順に照合し、先に条件に当てはまった節だけを実行します。広い型の節を先に書くと、後ろで細かい型に分けた処理へ到達しません。捕捉した例外と同じものを呼び出し元へ伝え直すときは、<code>rescue</code> の中で引数なしの <code>raise</code> を使えます。調査のために情報を記録してから失敗を伝え直す、という動作を表せます。</p>
      <h3>raise と retry</h3>
      <Code lang="ruby" title="retry.rb" code={`
$stdout.sync = true
class TemporaryFailure < StandardError; end
calls = 0
fetch = -> { calls += 1; raise TemporaryFailure, "#{calls} 回目は応答なし" if calls < 3; "応答" }

attempts = 0
begin
  attempts += 1
  result = fetch.call
  puts "成功: #{result}（#{attempts} 回目）"
rescue TemporaryFailure => e
  puts "失敗: #{e.message}"
  if attempts < 3
    sleep 0.1 * attempts
    retry
  end
  raise
end

e1 = (raise "メッセージだけ" rescue $!)
p e1.class
e2 = (raise ArgumentError rescue $!)
p [e2.class, e2.message]
e3 = (raise ArgumentError, "page は1以上" rescue $!)
p [e3.class, e3.message]

begin
  begin
    Integer("abc")
  rescue ArgumentError
    raise TemporaryFailure, "ページ番号を読めない"
  end
rescue => e
  p [e.class, e.message]
  p [e.cause.class, e.cause.message]
end
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
失敗: 1 回目は応答なし
失敗: 2 回目は応答なし
成功: 応答（3 回目）
RuntimeError
[ArgumentError, "ArgumentError"]
[ArgumentError, "page は1以上"]
[TemporaryFailure, "ページ番号を読めない"]
[ArgumentError, "invalid value for Integer(): \\"abc\\""]
`} />
      <p><code>retry</code> は <code>rescue</code> の中だけで使え、<code>begin</code> の先頭からやり直します<Ref n={3} />。この例は1回目と2回目に失敗する処理を、待ち時間を 0.1 秒、0.2 秒と延ばしながら3回目まで試しました。回数の上限を書かないと、失敗が続く限り繰り返し続けます。上限に達したら引数なしの <code>raise</code> で同じ例外を呼び出し元に伝えます。<code>attempts</code> を <code>begin</code> の外で初期化しているのは、<code>retry</code> で begin の先頭に戻っても回数が消えないようにするためです。どの失敗を何回まで再試行してよいかは、副作用の有無で決まります（「どこで失敗を結果に変換するか」の節と <ChapterLink n={101} section="retries" />）。</p>
      <p>flow.rb の各節に retry を足した形で、begin の中で起きることを選ぶと、どの節がどの順に動くかを図 {figureNumber(96, 10)} で確かめられます。retry で begin の先頭に戻るときには ensure は動かず、ensure は begin 全体を抜けるときに1回だけ動きます。</p>
      <ExceptionPathFigure />
      <p><code>raise</code> は文字列だけを渡すと RuntimeError を、クラスだけを渡すとメッセージがクラス名の例外を、クラスとメッセージを渡すとそのクラスの例外を起こします。例の <code>(式 rescue $!)</code> は、起きた例外（<code>$!</code> に入る）を値として取り出すための書き方で、ここでは結果を表示するためだけに使っています。<code>rescue</code> の中で別の例外を起こすと、元の例外が <code>cause</code> に自動で入ります。外側では TemporaryFailure を受け取り、<code>cause</code> から元の ArgumentError とそのメッセージを読めました。例外を変換しても、調査に必要な元の情報は残ります。</p>
      <p>ファイルの中身を扱う処理では <code>File.open</code> にブロックを渡すと、ブロックを抜けるときに Ruby がファイルを閉じます。すでに資源を解放する API があるなら、それを使って取得と解放を対応させられます。個別に解放する必要がある資源だけを、処理の成功や失敗にかかわらず <code>ensure</code> で後片付けします。</p>
    </> },
    { id: 'hierarchy', title: '例外クラスの階層と独自の例外', body: <>
      <p>例外のクラスは継承の木を作っていて、<code>rescue 親クラス</code> と書くとその子孫もまとめて捕捉します。<code>rescue =&gt; e</code> が既定で StandardError を捕捉する理由と、Exception を捕捉すると何が起きるかを、Ruby 4.0.9 で確かめました<Ref n={6} />。</p>
      <Code lang="ruby" title="hierarchy.rb" code={`
$stdout.sync = true
require "json"
require "timeout"
[ArgumentError, KeyError, NoMethodError, JSON::ParserError, Timeout::Error,
 FrozenError, Interrupt, SystemExit, LoadError].each do |k|
  puts "#{k}: #{k.ancestors.take_while { it != Object }.reject { it.instance_of?(Module) }.join(' < ')}"
end

def save_all
  yield
rescue => e
  puts "rescue => e が捕捉: #{e.class}"
end
save_all { raise KeyError }
begin
  save_all { exit 1 }
rescue SystemExit => e
  puts "rescue => e は SystemExit を捕捉しない（status=#{e.status}）"
end

def swallow_all
  yield
rescue Exception => e
  puts "rescue Exception が捕捉: #{e.class}"
end
swallow_all { exit 1 }
puts "exit 1 を呼んだのにプログラムが続いている"
swallow_all { raise Interrupt }
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9。終了ステータスは 0）" code={`
ArgumentError: ArgumentError < StandardError < Exception
KeyError: KeyError < IndexError < StandardError < Exception
NoMethodError: NoMethodError < NameError < StandardError < Exception
JSON::ParserError: JSON::ParserError < JSON::JSONError < StandardError < Exception
Timeout::Error: Timeout::Error < RuntimeError < StandardError < Exception
FrozenError: FrozenError < RuntimeError < StandardError < Exception
Interrupt: Interrupt < SignalException < Exception
SystemExit: SystemExit < Exception
LoadError: LoadError < ScriptError < Exception
rescue => e が捕捉: KeyError
rescue => e は SystemExit を捕捉しない（status=1）
rescue Exception が捕捉: SystemExit
exit 1 を呼んだのにプログラムが続いている
rescue Exception が捕捉: Interrupt
`} />
      <p>アプリのコードで起きる誤り（引数の誤り、キーがない、nil にメソッドを呼んだ、JSON の構文の誤り、タイムアウト）は、どれも StandardError の子孫でした。一方、<code>exit</code> で起きる SystemExit、Ctrl-C で起きる Interrupt、<code>require</code> の失敗で起きる LoadError は StandardError の外にあります（図 {figureNumber(96, 11)}）。<code>rescue =&gt; e</code> がこれらを捕捉しないので、<code>exit 1</code> はプログラムを終了させられます。</p>
      <Figure n={figureNumber(96, 11)} title="例外クラスの階層（抜粋）" caption="hierarchy.rb の ancestors の結果と Exception.subclasses をもとに、主なクラスだけを抜き出した図。Active Record と Action Controller の例外は Rails 8.1.4.1 で確かめた。">
        <HierarchyFigure />
      </Figure>
      <p><code>rescue Exception =&gt; e</code> と書くと、SystemExit も Interrupt も捕捉しました。<code>exit 1</code> を呼んだのにプログラムが続き、終了ステータスは 0 でした。ジョブを止めるために送ったシグナルや、メモリー不足の例外まで捕捉して処理を続けてしまうので、アプリのコードでは Exception を捕捉しません。Rails の内部（<ChapterLink n={10} section="exceptions" />で読む <code>rescue Exception =&gt; exception</code>）は、捕捉した例外を記録や応答に使ったうえで、処理できないものを <code>raise</code> で伝え直しています。</p>
      <h3>独自の例外クラスを定義する</h3>
      <p>アプリの業務の失敗（カードが使えない、在庫が足りない）を表すには、StandardError を継承した独自の例外クラスを定義します。同じ領域の例外に共通の親クラスを作っておくと、呼び出し元は細かい種類を知らなくても、親クラスでまとめて捕捉できます。</p>
      <Code lang="ruby" title="custom_error.rb" code={`
module Payments
  class Error < StandardError; end

  class CardDeclined < Error
    attr_reader :code

    def initialize(code:, message: "カードが利用できません")
      @code = code
      super(message)
    end
  end

  class GatewayTimeout < Error; end
end

def charge(amount)
  raise Payments::CardDeclined.new(code: "insufficient_funds") if amount > 10_000
  raise Payments::GatewayTimeout, "決済サービスが 5 秒以内に応答しない" if amount == 0
  "決済完了"
end

[500, 20_000, 0].each do |amount|
  puts charge(amount)
rescue Payments::CardDeclined => e
  puts "#{e.class}: #{e.message}（code=#{e.code}）"
rescue Payments::Error => e
  puts "#{e.class}: #{e.message}"
end
p Payments::CardDeclined.ancestors.take(4)
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
決済完了
Payments::CardDeclined: カードが利用できません（code=insufficient_funds）
Payments::GatewayTimeout: 決済サービスが 5 秒以内に応答しない
[Payments::CardDeclined, Payments::Error, StandardError, Exception]
`} />
      <p>CardDeclined は、決済サービスが返した理由のコードを属性 <code>code</code> に持ちます。<code>initialize</code> の最後の <code>super(message)</code> で親クラスにメッセージを渡すと、<code>e.message</code> で読めます。例外に属性を持たせると、呼び出し元はメッセージの文字列を解析せずに、理由ごとに画面の表示を変えられます。<code>do ... end</code> のブロックの中にも <code>rescue</code> を直接書けます（Ruby 2.5 以降）。</p>
      <p>rescue の順は細かい型（CardDeclined）を先に、親の型（Payments::Error）を後に書きます。GatewayTimeout は専用の節がないので、親クラスの Payments::Error の節で捕捉されました。新しい種類の失敗を Payments::Error の子として追加すれば、呼び出し元を変えなくても捕捉の範囲に入ります。設計上の意見として、例外クラスはメッセージを変えたいだけの理由では増やさず、呼び出し元が異なる対処をする失敗ごとに分けると、数を抑えられます。</p>
    </> },
    { id: 'rescue-modifier', title: 'rescue 修飾子が隠す誤り', body: <>
      <p><code>式 rescue 代わりの値</code> の形で、文の後ろに <code>rescue</code> を書けます（rescue 修飾子）。短く書けますが、捕捉する例外の型を指定できず、常に StandardError とその子孫をすべて捕捉します<Ref n={3} />。何が一緒に捕捉されるかを確かめます。</p>
      <Code lang="ruby" title="modifier.rb" code={`
def page_from(raw)
  Integer(raw) rescue 1
end
p page_from("3")
p page_from("abc")

def page_with_typo(raw)
  Integr(raw) rescue 1
end
p page_with_typo("3")

require "json"
def settings_from(raw)
  JSON.parse(raw) rescue {}
end
p settings_from('{"theme":"dark"}')
p settings_from("{broken")
p settings_from(nil)

value = Integer("abc") rescue 0
p value

def page_strict(raw)
  Integer(raw, 10)
rescue ArgumentError, TypeError
  1
end
p page_strict("abc")
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
3
1
1
{"theme" => "dark"}
{}
{}
0
1
`} />
      <p><code>page_with_typo</code> はメソッド名を <code>Integr</code> と打ち間違えていますが、<code>"3"</code> を渡しても例外にならず、1 を返しました。打ち間違いで起きる NoMethodError も StandardError の子孫なので、rescue 修飾子が捕捉して 1 に置き換えたためです。このメソッドはどんな入力にも 1 を返す誤ったコードのまま、テストで入力が不正な場合だけを確かめていれば見つかりません。<code>settings_from(nil)</code> も JSON の構文の誤りではなく nil を渡した呼び出し側の誤り（TypeError）を <code>{'{}'}</code> に置き換えました。</p>
      <p><code>value = Integer("abc") rescue 0</code> は、代入の右辺だけでなく <code>value = Integer("abc")</code> 全体に rescue が掛かるように見えますが、結果は <code>value</code> に 0 が入りました。代入文に付けた rescue 修飾子は右辺の式に対して働くように解釈されます<Ref n={19} />。</p>
      <p>捕捉したい例外の型が決まっているなら、<code>page_strict</code> のように <code>rescue ArgumentError, TypeError</code> と型を並べて書きます。打ち間違いのような想定外の誤りは例外のまま伝わり、テストやエラーの記録で見つけられます。rescue 修飾子を使ってよいのは、失敗したときに代わりの値でよいことが確かで、捕捉の範囲が広くても問題にならない短い式（ログに出す補助的な情報の整形など）に限るのが本書の推奨です。</p>
    </> },
    { id: 'rails-rescue', title: 'Rails の rescue_from と例外ごとのステータスコード', body: <>
      <p>コントローラーのアクションで例外が起きたとき、その例外をどのステータスコードの応答にするかを決める方法は2つあります。1つは <code>rescue_from</code> で例外ごとの処理（ハンドラ）を登録し、応答を自分で作る方法です。もう1つは例外のクラス名とステータスコードの対応表 <code>config.action_dispatch.rescue_responses</code> に登録し、Rails のエラーページに任せる方法です<Ref n={15} /><Ref n={16} />。例外がコントローラーからミドルウェアへ伝わり、エラー応答になるまでの内部の処理は <ChapterLink n={10} section="exceptions" />でソースを読んで確かめます。この節ではアプリのコードに何を書くかを扱います。</p>
      <p>railties と actionpack 8.1.4.1 で1ファイルの Rails アプリを作り、<code>Rack::MockRequest</code> で要求を送りました。設定は production と同じく、詳しいエラー画面を出さない（<code>consider_all_requests_local = false</code>）ようにしています。</p>
      <Code lang="ruby" title="app.rb（抜粋。アプリの初期化と要求の送信は省略）" code={`
module Orders
  class OutOfStock < StandardError; end
  class AlreadyShipped < StandardError; end
end

# config に書く設定
config.action_dispatch.rescue_responses["Orders::AlreadyShipped"] = :conflict

class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  private

  def not_found(exception)
    render json: { error: "not_found", model: exception.model }, status: :not_found
  end
end

class ArticlesController < ApplicationController
  def show
    raise ActiveRecord::RecordNotFound.new("Couldn't find Article", "Article", "id", params[:id])
  end

  def create
    params.require(:article).permit(:title)
    head :created
  end
end

class OrdersController < ApplicationController
  rescue_from Orders::OutOfStock do |exception|
    render json: { error: "out_of_stock", message: exception.message }, status: :conflict
  end

  def create = raise(Orders::OutOfStock, "在庫が足りません")
  def update = raise(Orders::AlreadyShipped, "発送済みの注文は変更できません")
  def boom = raise("想定していない失敗")
end

class ReversedController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "not_found" }, status: :not_found
  end
  rescue_from StandardError do |e|
    render json: { error: "internal" }, status: :internal_server_error
  end

  def show = raise(ActiveRecord::RecordNotFound)
end
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9、Rails 8.1.4.1）" code={`
GET    /articles/999  404 {"error":"not_found","model":"Article"}
POST   /articles      400 （本文なし）
POST   /orders/1      409 {"error":"out_of_stock","message":"在庫が足りません"}
PATCH  /orders/1      409 （本文なし）
GET    /boom          500 （本文なし）
GET    /reversed/1    500 {"error":"internal"}
`} />
      <Figure n={figureNumber(96, 12)} title="例外と、応答を作った場所" caption="app.rb の実行結果。本文なしの応答は public に該当するエラーページのファイルがないため。"><div className="table-wrap"><table><thead><tr><th>要求</th><th>起きた例外</th><th>応答を作った場所</th><th>ステータス</th></tr></thead><tbody>
        <tr><td><code>GET /articles/999</code></td><td>ActiveRecord::RecordNotFound</td><td>ApplicationController の rescue_from（not_found）</td><td>404</td></tr>
        <tr><td><code>POST /articles</code></td><td>ActionController::ParameterMissing</td><td>rescue_responses の既定の対応（bad_request）</td><td>400</td></tr>
        <tr><td><code>POST /orders/1</code></td><td>Orders::OutOfStock</td><td>OrdersController の rescue_from のブロック</td><td>409</td></tr>
        <tr><td><code>PATCH /orders/1</code></td><td>Orders::AlreadyShipped</td><td>config で追加した rescue_responses（conflict）</td><td>409</td></tr>
        <tr><td><code>GET /boom</code></td><td>RuntimeError</td><td>どちらにも登録がない</td><td>500</td></tr>
        <tr><td><code>GET /reversed/1</code></td><td>ActiveRecord::RecordNotFound</td><td>後に書いた <code>rescue_from StandardError</code></td><td>500</td></tr>
      </tbody></table></div></Figure>
      <p><code>rescue_from</code> は、登録した例外が起きたときに <code>with:</code> のメソッドかブロックを呼び、そこで <code>render</code> した内容が応答になります。ApplicationController に書いた登録は、それを継承したすべてのコントローラーで有効です。<code>POST /articles</code> の ParameterMissing と <code>PATCH /orders/1</code> の AlreadyShipped は rescue_from に登録していませんが、rescue_responses に対応があるので、それぞれ 400 と 409 になりました。rescue_responses には、Rails があらかじめ ParameterMissing を 400、RecordNotFound を 404、RecordInvalid を 422、StaleObjectError を 409 として登録しています<Ref n={17} /><Ref n={18} />。どちらにも登録がない RuntimeError は 500 です。</p>
      <p>最後の行は RecordNotFound を起こしたのに 500 になりました。ReversedController は RecordNotFound の後に <code>rescue_from StandardError</code> を書いています。<code>rescue_from</code> は登録を配列の末尾に追加し、例外が起きたときは後から登録したものから順に照合します<Ref n={14} />。RecordNotFound も StandardError の子孫なので、後に書いた StandardError のハンドラが先に一致しました。<code>begin</code> と <code>rescue</code> では上の節から照合するのと逆なので、rescue_from は広い型を先に、細かい型を後に書きます。</p>
      <Code lang="ruby" title="activesupport/lib/active_support/rescuable.rb（124〜133行目）" href={`${GH}/activesupport/lib/active_support/rescuable.rb#L124-L133`} code={`
        def find_rescue_handler(exception)
          if exception
            # Handlers are in order of declaration but the most recently declared
            # is the highest priority match, so we search for matching handlers
            # in reverse.
            _, handler = rescue_handlers.reverse_each.detect do |class_or_name, _|
              if klass = constantize_rescue_handler_class(class_or_name)
                klass === exception
              end
            end
`} />
      <p><code>rescue_handlers.reverse_each.detect</code> が、登録の配列を後ろから順にたどり、<code>klass === exception</code>（例外がそのクラスか子孫か）が真になった最初のハンドラを選ぶ部分です。一致するハンドラがないときは、例外の <code>cause</code> についても同じ照合をします（同じファイルの90〜103行目）。</p>
      <p>Rails ガイドは、<code>rescue_from</code> に Exception や StandardError を指定すると Rails が例外を正しく処理できなくなるため、強い理由がなければ勧めないとしています<Ref n={15} />。実際に ReversedController では、404 になるはずの RecordNotFound が 500 に変わりました。想定外の例外は rescue_from で応答に変えず、Rails のエラーページとエラーの記録に任せます。</p>
      <h3>どちらの方法を選ぶか</h3>
      <p>ステータスコードだけを決めればよく、本文は Rails のエラーページ（public/404.html など）でよい例外は、rescue_responses に登録します。応答の本文に理由のコードを入れたい API や、画面に戻してメッセージを表示したい場合は rescue_from で応答を作ります。どちらの場合も、ステータスコードは例外が何を意味するかで決めます。入力の誤りは 400 か 422、見つからないものは 404、現在の状態と競合する操作（在庫切れ、発送済み、楽観的ロックの衝突）は 409、権限がないなら 403 が目安です。予期しない誤りは 500 のままにして、ログとエラーの記録で調べられるようにします（<ChapterLink n={28} section="backtrace" />）。</p>
    </> },
    { id: 'boundaries', title: 'どこで失敗を結果に変換するか', body: <>
      <p>コントローラーが入力に誤りのある JSON を受け取ったときは、その入力を使えないことを要求元に伝えられます。一方、外部サービスが壊れた JSON を返したときの原因はクライアントの入力とは限りません。同じ型の例外でも、どこから届いたデータかによって、利用者へ返す説明や記録するログが変わります。JSON を解釈するメソッドが例外を判別し、応答を作るコントローラーがステータスを決めると、処理を分担できます。</p>
      <p>レコードを保存する場合、<code>save</code> は検証を通らなければ <code>false</code> を返し、<code>save!</code> は検証失敗を例外（ActiveRecord::RecordInvalid）として通知します。入力を修正してほしいフォームなら戻り値で分岐し、画面に検証エラーを表示できます。複数の保存をまとめた処理で一つでも失敗すると取り消すなら、失敗を例外としてトランザクションの外へ伝える書き方が使えます（<ChapterLink n={15} section="transaction" />）。データベースへの接続が途切れた失敗を入力エラーとして表示すると調査できないため、捕捉する型と範囲を確認します。</p>
      <p>例外が起きた場合の分岐と資源の寿命を分けて考えると、入力エラーが増えたときにもファイルや接続が残り続ける事態を防げます。外部通信の失敗から復旧する条件は <ChapterLink n={101} section="failures">外部 API の失敗の分類</ChapterLink>で扱います。</p>
      <p>例外が発生した後に処理をやり直す場合は、どこまで変更したかも確認します。データベースの更新が取り消されても、すでに送信したメールまで取り消せるとは限りません。メールの送信を同じコードでやり直すなら、同じ通知を送ってよいか判断する仕組みが必要です。例外の型が一時的な失敗を表す場合でも、その操作を再試行してよいかは副作用の契約で決まります。</p>
      <p>呼び出し元が対処できない失敗を既定値に置き換えると、処理全体が成功したように見えます。配送状況が欠けても注文の画面を表示できるなら、配送状況だけ取得できなかったことを画面へ伝えられます。注文を保存できなかった場合は利用者に成功を表示できません。どちらも例外になり得ますが、復旧後に提供できる機能の範囲が異なります。</p>
    </> },
    { id: 'tradeoffs', title: '判断基準とトレードオフ', body: <>
      <p>この章の内容から、選択肢と判断の目安をまとめます。「判断の目安」は本書の推奨で、実行結果で確かめた事実は各節を参照してください。</p>
      <Figure n={figureNumber(96, 13)} title="選択肢と判断の目安" caption="判断の目安は設計上の意見。"><div className="table-wrap"><table><thead><tr><th>場面</th><th>選択肢</th><th>判断の目安</th></tr></thead><tbody>
        <tr><td>一覧を変換する</td><td><code>map</code>、<code>each</code> で別の配列に追加</td><td>結果の配列が欲しいなら <code>map</code>。<code>each</code> は表示や保存など副作用だけの処理に使う</td></tr>
        <tr><td>集計する</td><td><code>sum</code>・<code>tally</code>・<code>group_by</code>、<code>reduce</code>、<code>each_with_object</code></td><td>専用のメソッドがあればそれを使う。数値の畳み込みは <code>reduce</code>、Hash や配列に集めるなら <code>each_with_object</code></td></tr>
        <tr><td>先頭の数件だけ使う</td><td>通常の書き方、<code>lazy</code></td><td>入力が大きいか終わりがないときだけ <code>lazy</code>。全件を使うなら通常の書き方のほうが速い</td></tr>
        <tr><td>DB の行を絞る・数える</td><td>Relation のメソッド（SQL）、配列にして Ruby のメソッド</td><td>SQL で書ける条件と集計は SQL で。ブロックを渡す <code>select</code>・<code>sum</code> や <code>length</code> は全行を読む</td></tr>
        <tr><td>全件を順に処理する</td><td><code>each</code>、<code>find_each</code></td><td>件数が増えるテーブルでは <code>find_each</code></td></tr>
        <tr><td>捕捉する例外の範囲</td><td>型を指定した <code>rescue</code>、<code>rescue =&gt; e</code>、rescue 修飾子、<code>rescue Exception</code></td><td>復旧方法が分かる型だけを指定する。<code>rescue Exception</code> はアプリのコードでは使わない</td></tr>
        <tr><td>業務の失敗を表す</td><td>独自の例外、戻り値（<code>false</code> や結果のオブジェクト）</td><td>呼び出し元がその場で分岐するなら戻り値、何段も上の呼び出し元で扱うなら例外</td></tr>
        <tr><td>例外を HTTP の応答にする</td><td><code>rescue_from</code>、<code>rescue_responses</code></td><td>本文を作るなら <code>rescue_from</code>、ステータスだけなら <code>rescue_responses</code>。StandardError は登録しない</td></tr>
      </tbody></table></div></Figure>
      <p>Enumerable のメソッドは配列でも Relation でも同じ名前で書けます。そのため、Ruby の配列で書いた処理をそのまま Relation に当てはめると、全行を読み込む SQL になっていることに気づきにくくなります。開発中は SQL のログを見て、WHERE や COUNT が付いているかを確かめます。例外も同じで、<code>rescue</code> の範囲を広げるほど画面はエラーを出さなくなりますが、誤りの原因はログから消えます。どちらも、Ruby の書き方の短さよりも、データベースとログに何が残るかを基準に選びます。</p>
      <Callout kind="note" title="例外とエラーの記録">
        <p>捕捉して応答に変えた例外は、Rails のエラーページまで届かないので、そのままでは記録されないことがあります。復旧したが調査したい失敗は、<code>Rails.error.report</code> などでエラーの記録に送ります。ログの読み方とバックトレースは <ChapterLink n={28} section="backtrace" />で扱います。</p>
      </Callout>
      <h3>関連する章</h3>
      <ul>
        <li>値の種類、nil と false の判定、Float と BigDecimal：<ChapterLink n={95} /></li>
        <li>ブロック、yield、Proc と lambda：<ChapterLink n={4} section="block-yield" />、<ChapterLink n={4} section="proc-lambda" /></li>
        <li>Relation が SQL を実行する時点：<ChapterLink n={12} section="lazy" /></li>
        <li>関連先の読み込みと N+1：<ChapterLink n={13} section="n-plus-one" /></li>
        <li>必要な列と行だけを読む方法、find_each のバッチ：<ChapterLink n={100} section="projection" />、<ChapterLink n={100} section="batches" /></li>
        <li>例外がエラー応答になるまでの内部の処理：<ChapterLink n={10} section="exceptions" /></li>
        <li>外部 API の失敗の分類と再試行：<ChapterLink n={101} section="failures" />、<ChapterLink n={101} section="retries" /></li>
      </ul>
    </> },
  ],
  sources: [
    { title: 'module Enumerable', publisher: 'Ruby Documentation', url: `${RD}/Enumerable.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'each を定義したクラスに include すると使えるメソッド、選択・変換・集計の API。実行例は Ruby 4.0.9 で実測。' },
    { title: 'Ruby Syntax', publisher: 'Ruby Documentation', url: `${RD}/syntax_rdoc.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'メソッド定義とブロックの構文の一覧。' },
    { title: 'Exception Handling', publisher: 'Ruby Documentation', url: `${RD}/syntax/exceptions_rdoc.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'rescue が既定で StandardError を捕捉すること、上から照合すること、retry、else と ensure の戻り値、rescue 修飾子。' },
    { title: 'class Enumerator', publisher: 'Ruby Documentation', url: `${RD}/Enumerator.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'ブロックなしの each が返す Enumerator、next と StopIteration、with_index、Enumerator.new。' },
    { title: 'class Enumerator::Lazy', publisher: 'Ruby Documentation', url: `${RD}/Enumerator/Lazy.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'lazy が要求された分だけ要素を評価すること、first や to_a で評価が始まること。' },
    { title: 'class Exception', publisher: 'Ruby Documentation', url: `${RD}/Exception.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: '組み込みの例外クラスの階層、message、cause。' },
    { title: 'class Array（sum）', publisher: 'Ruby Documentation', url: `${RD}/Array.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'Array#sum の初期値と Float の補正つき加算。' },
    { title: 'activerecord/lib/active_record/relation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb#L67`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'Relation が Enumerable を include すること（67行目）、size が読み込み前は count(:all) を呼ぶこと（363〜369行目）。' },
    { title: 'activerecord/lib/active_record/relation/delegation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/delegation.rb#L100-L103`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'each・length などを records に委譲すること。' },
    { title: 'activerecord/lib/active_record/relation/query_methods.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/query_methods.rb#L413-L420`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'select にブロックを渡すと super（Enumerable#select）を呼ぶこと。' },
    { title: 'activerecord/lib/active_record/relation/calculations.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/calculations.rb#L171-L177`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'sum にブロックを渡すと map(&block).sum になり、渡さないと SQL の SUM を使うこと。' },
    { title: 'ActiveRecord::Batches（find_each）', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Batches.html', accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'find_each の batch_size の既定値 1000、ブロックなしで Enumerator を返すこと。batches.rb の85行目で定義を確かめた。' },
    { title: 'Active Record Query Interface（Retrieving Multiple Records in Batches）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html#retrieving-multiple-records-in-batches', accessed: '2026-11-27', version: 'Rails 8.1', note: 'find_each と find_in_batches の使い方。' },
    { title: 'activesupport/lib/active_support/rescuable.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/rescuable.rb#L53-L133`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'rescue_from が登録を末尾に追加すること（53〜74行目）、cause の照合（90〜103行目）、後から登録したものから照合すること（124〜133行目）。' },
    { title: 'Action Controller Advanced Topics（rescue_from）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/action_controller_advanced_topics.html#rescue-from', accessed: '2026-11-27', version: 'Rails 8.1', note: 'rescue_from の with: とブロック、Exception や StandardError を指定することを勧めないこと。' },
    { title: 'Configuring Rails Applications（config.action_dispatch.rescue_responses）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html#config-action-dispatch-rescue-responses', accessed: '2026-11-27', version: 'Rails 8.1', note: '例外のクラス名とステータスの対応を設定すること。' },
    { title: 'actionpack/lib/action_dispatch/middleware/exception_wrapper.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/exception_wrapper.rb#L12-L25`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'rescue_responses の既定値（表にない例外は internal_server_error、ParameterMissing は bad_request）。' },
    { title: 'activerecord/lib/active_record/railtie.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/railtie.rb#L23-L26`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'RecordNotFound を not_found、StaleObjectError を conflict、RecordInvalid を unprocessable_content として登録すること。' },
    { title: 'Operator Precedence', publisher: 'Ruby Documentation', url: `${RD}/syntax/precedence_rdoc.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'rescue 修飾子の優先順位。代入文に付けた場合の解釈は Ruby 4.0.9 の実行結果で確かめた。' },
  ],
}

export default chapter
