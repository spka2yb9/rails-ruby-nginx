import { figureNumber } from '../content/label'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const RB = 'https://github.com/ruby/ruby/blob/v4.0.9'
const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 1 実行の単位と共有するもの ---------- */
function UnitsFigure() {
  const fiber = (x: number, y: number, label: string) => (
    <Box x={x} y={y} w={112} h={40} lines={[label, 'VM スタック 128KiB']} fs={11} fill="box5" subTone="muted" />
  )
  return (
    <Svg id="98-1" w={760} h={300} label="1つのプロセスの中に Ruby のヒープと GVL があり、2本のスレッドが同じヒープのオブジェクトを読み書きする。スレッドはそれぞれ OS のスレッドと 1MiB の VM スタックを持つ。スレッドの中には Fiber があり、Fiber ごとに小さな VM スタックを持つ。別のプロセスはヒープも GVL も別に持つ">
      <rect x={10} y={10} width={560} height={280} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={22} y={28} bold fs={12}>プロセス（PID 31）</T>
      <Box x={22} y={40} w={350} h={40} lines={['Ruby のヒープ：クラス・定数・オブジェクト', 'すべてのスレッドと Fiber から見える']} fs={11.5} fill="box4" subTone="muted" />
      <Box x={384} y={40} w={174} h={40} lines={['GVL（Ractor ごとに1つ）', 'Ruby を実行できるのは1本']} fs={11} fill="box" accent subTone="muted" />
      {[0, 1].map((i) => {
        const x = 22 + i * 274
        return (
          <g key={i}>
            <rect x={x} y={96} width={262} height={182} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
            <T x={x + 10} y={112} bold fs={12}>{i === 0 ? 'メインスレッド' : 'Thread.new のスレッド'}</T>
            <T x={x + 10} y={130} fs={11} tone="muted">OS のスレッド・VM スタック 1MiB</T>
            {fiber(x + 10, 144, i === 0 ? 'ルートの Fiber' : 'ルートの Fiber')}
            {i === 0 && fiber(x + 136, 144, 'Fiber.new の Fiber')}
            <T x={x + 10} y={208} fs={11}>Fiber は resume と Fiber.yield で</T>
            <T x={x + 10} y={224} fs={11}>同じスレッドの中で交代する</T>
            <T x={x + 10} y={248} fs={11} tone="muted">Thread.current[:x] は Fiber ごと、</T>
            <T x={x + 10} y={264} fs={11} tone="muted">thread_variable_get はスレッドごと</T>
          </g>
        )
      })}
      <rect x={590} y={10} width={160} height={150} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={602} y={28} bold fs={12}>別のプロセス</T>
      <Box x={602} y={40} w={136} h={40} lines={['自分のヒープ', '自分の GVL']} fs={11} fill="box4" />
      <T x={602} y={104} fs={11} tone="muted">変数は共有しない。</T>
      <T x={602} y={120} fs={11} tone="muted">共有する値は DB や</T>
      <T x={602} y={136} fs={11} tone="muted">Redis に置く</T>
    </Svg>
  )
}

/* ---------- 図 2 SizedQueue で待つ順序 ---------- */
function SizedQueueFigure() {
  const rows: { t: string; who: 'p' | 'c' | 'n'; text: string }[] = [
    { t: '0.00', who: 'p', text: 'push 0（入れ物の中 1 個）' },
    { t: '0.00', who: 'p', text: 'push 1（2 個。満杯）' },
    { t: '0.00', who: 'p', text: 'push 2 で待つ' },
    { t: '0.20', who: 'c', text: 'pop 0 → 空きができる' },
    { t: '0.20', who: 'p', text: 'push 2（再び満杯）→ push 3 で待つ' },
    { t: '0.25', who: 'c', text: 'pop 1' },
    { t: '0.25', who: 'p', text: 'push 3 → push 4 で待つ' },
    { t: '…', who: 'n', text: '取り出すたびに1個ずつ入る' },
  ]
  return (
    <Svg id="98-2" w={720} h={300} label="上限2の SizedQueue に5個入れる。作る側は2個入れた後、3個目で待つ。0.2秒後に使う側が1個取り出すと空きができ、作る側が次の1個を入れて再び待つ。以後、取り出すたびに1個ずつ入る">
      <T x={70} y={18} anchor="middle" bold fs={12}>経過（秒）</T>
      <T x={250} y={18} anchor="middle" bold fs={12}>作る側（producer）</T>
      <T x={560} y={18} anchor="middle" bold fs={12}>使う側（consumer）</T>
      <line x1={250} y1={30} x2={250} y2={290} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={560} y1={30} x2={560} y2={290} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {rows.map((r, i) => {
        const y = 38 + i * 31
        return (
          <g key={i}>
            <T x={70} y={y + 13} anchor="middle" fs={11} mono tone="muted">{r.t}</T>
            {r.who !== 'n' && <Box x={r.who === 'p' ? 130 : 440} y={y} w={240} h={26} lines={r.text} fs={11.5} fill={r.text.includes('待つ') ? 'box4' : r.who === 'p' ? 'box' : 'box5'} />}
            {r.who === 'n' && <T x={405} y={y + 13} anchor="middle" fs={11.5} tone="muted">{r.text}</T>}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 3 更新が消える順序 ---------- */
function RaceFigure() {
  const step = (x: number, y: number, text: string, fill: 'box' | 'box4' | 'box5' = 'box', accent = false) => (
    <Box x={x} y={y} w={128} h={30} lines={text} fs={11.5} fill={fill} accent={accent} />
  )
  return (
    <Svg id="98-3" w={760} h={276} label="Mutex がない場合、スレッド A が count の100を読んで minus_one を呼ぶ。minus_one から戻るところで割り込みを調べ、B に交代する。B も100を読み、99を書く。A に戻ると、A は先に読んだ100から計算した99を書き、B の更新が消える。Mutex がある場合、B は A が synchronize を抜けるまで待ち、99を読んで98を書く">
      <T x={14} y={18} bold fs={12}>Mutex なし（decrement_unsafe）</T>
      <T x={14} y={46} fs={12}>スレッド A</T>
      <T x={14} y={90} fs={12}>スレッド B</T>
      {step(100, 32, '@count を読む（100）')}
      {step(236, 32, 'minus_one を呼ぶ')}
      {step(372, 76, '@count を読む（100）', 'box5')}
      {step(508, 76, '99 を書く', 'box5')}
      {step(620, 32, '99 を書く', 'box4', true)}
      <Arrow x1={364} y1={56} x2={372} y2={80} dashed />
      <Arrow x1={636} y1={90} x2={644} y2={64} dashed />
      <T x={236} y={122} fs={11} tone="muted">minus_one の leave で割り込みを調べ、B に交代</T>
      <T x={520} y={122} fs={11} tone="danger">B の 99 を上書きし、1 回分が消える</T>
      <T x={14} y={152} bold fs={12}>Mutex あり（decrement_safe）</T>
      <T x={14} y={180} fs={12}>スレッド A</T>
      <T x={14} y={224} fs={12}>スレッド B</T>
      <rect x={96} y={162} width={372} height={38} rx={6} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      {step(100, 166, '読む（100）')}
      {step(236, 166, 'minus_one')}
      <Box x={338} y={166} w={124} h={30} lines="99 を書く" fs={11.5} />
      {step(100, 210, 'synchronize で待つ', 'box4')}
      <rect x={474} y={206} width={276} height={38} rx={6} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <Box x={480} y={210} w={128} h={30} lines="読む（99）" fs={11.5} fill="box5" />
      <Box x={616} y={210} w={128} h={30} lines="98 を書く" fs={11.5} fill="box5" />
      <T x={14} y={262} fs={11} tone="muted">枠は Mutex を持っている区間。途中で交代しても、もう一方は枠に入れない</T>
    </Svg>
  )
}

/* ---------- 図 4 2本のスレッドが交代する時刻（実測） ---------- */
function TimesliceFigure() {
  const scale = 0.9
  const x0 = 120
  const panels = [
    { title: '既定（100ms ごと）', y: 30, a: [[0, 19], [21, 103], [204, 305], [406, 508], [610, 611]], b: [[103, 204], [305, 406], [508, 704]] },
    { title: 'RUBY_THREAD_TIMESLICE=20', y: 140, a: [[0, 20], [44, 64], [87, 108], [130, 150], [173, 194], [214, 234]], b: [[20, 44], [64, 87], [108, 130], [150, 173], [194, 214], [234, 255]] },
  ]
  return (
    <Svg id="98-4" w={780} h={262} label="2本のスレッド A と B が Ruby の計算を続けると、既定では約100ms ごとに交代し、A と B が同時に進んだ時間は0ms だった。RUBY_THREAD_TIMESLICE=20 では約20ms ごとに交代した">
      {panels.map((p) => (
        <g key={p.title}>
          <T x={20} y={p.y} bold fs={12}>{p.title}</T>
          {[['A', p.a, 'box5'], ['B', p.b, 'box4']].map(([name, segs, fill], k) => (
            <g key={name as string}>
              <T x={20} y={p.y + 26 + k * 30} fs={12} mono>{`スレッド ${name}`}</T>
              {(segs as number[][]).map(([s, e], j) => (
                <rect key={j} x={x0 + s * scale} y={p.y + 15 + k * 30} width={Math.max(2, (e - s) * scale)} height={22} fill={`var(--fig-${fill})`} stroke="var(--fig-line)" />
              ))}
            </g>
          ))}
        </g>
      ))}
      {[0, 100, 200, 300, 400, 500, 600, 700].map((ms) => (
        <T key={ms} x={x0 + ms * scale} y={232} fs={11} anchor="middle" mono tone="muted">{`${ms}`}</T>
      ))}
      <T x={20} y={232} fs={11} tone="muted">経過（ms）</T>
      <T x={20} y={252} fs={11} tone="muted">timeline.rb の出力（各スレッドの先頭 6 区間まで）。塗った区間がそのスレッドの進んでいた時間</T>
    </Svg>
  )
}

/* ---------- 図 5 B の処理と A の進み方（実測） ---------- */
function NogvlFigure() {
  const rows = [
    { name: 'B も Ruby の計算', ms: 502, note: 'GVL を交代で使う' },
    { name: 'B は sleep', ms: 991, note: '待つ間は GVL を手放す' },
    { name: 'B は SHA256（digest）', ms: 355, note: 'C の処理の間も GVL を持ったまま' },
    { name: 'B は圧縮（zlib）', ms: 995, note: '圧縮の間は GVL を手放す' },
  ]
  const scale = 0.3
  const x0 = 200
  return (
    <Svg id="98-5" w={760} h={226} label="スレッド A が1秒間 Ruby の計算を続ける間に、B が Ruby の計算をすると A は502ms 進み、B が sleep すると991ms、SHA256 を計算すると355ms、zlib で圧縮すると995ms 進んだ">
      <T x={20} y={18} bold fs={12}>A が 1000ms のうち進めた時間</T>
      {rows.map((r, i) => {
        const y = 34 + i * 40
        return (
          <g key={r.name}>
            <T x={20} y={y + 13} fs={12}>{r.name}</T>
            <Box x={x0} y={y} w={r.ms * scale} h={26} fill={r.ms > 900 ? 'box5' : 'box'} rx={3} />
            <T x={x0 + r.ms * scale + 8} y={y + 13} fs={12} mono>{`${r.ms}ms`}</T>
            <T x={x0 + 1000 * scale + 60} y={y + 13} fs={11} tone="muted">{r.note}</T>
          </g>
        )
      })}
      <line x1={x0 + 1000 * scale} y1={28} x2={x0 + 1000 * scale} y2={192} stroke="var(--fig-line)" strokeDasharray="3 3" />
      <T x={20} y={212} fs={11} tone="muted">timeline2.rb の1回の実行結果。CRuby 4.0.9、Docker 上の ruby:4.0、4 コアのマシン</T>
    </Svg>
  )
}

/* ---------- 図 6 外部イテレーターと Fiber ---------- */
function EnumeratorFigure() {
  const calls = [
    { call: 'e.next', back: '10', sw: 2 },
    { call: 'e.peek', back: '20', sw: 2 },
    { call: 'e.next', back: '20（覚えた値）', sw: 0 },
    { call: 'e.next', back: '30', sw: 2 },
    { call: 'e.next', back: 'StopIteration', sw: 2 },
  ]
  return (
    <Svg id="98-6" w={760} h={278} label="e.next を呼ぶと、Enumerator が持つ Fiber に切り替わり、each のブロックが値を1つ渡したところで Fiber.yield して呼び出し元に戻る。peek で取り出した値は覚えておくので、次の next では切り替わらない。each が終わると StopIteration が起きる。5回の呼び出しで切り替わりは8回だった">
      <T x={150} y={18} anchor="middle" bold fs={12}>呼び出し元（メインの Fiber）</T>
      <T x={560} y={18} anchor="middle" bold fs={12}>Enumerator の Fiber（each を実行）</T>
      <line x1={150} y1={28} x2={150} y2={250} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={560} y1={28} x2={560} y2={250} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {calls.map((c, i) => {
        const y = 40 + i * 42
        return (
          <g key={i}>
            <Box x={84} y={y} w={132} h={30} lines={c.call} fs={12} mono />
            {c.sw > 0 ? (
              <>
                <Arrow x1={216} y1={y + 8} x2={474} y2={y + 8} />
                <Box x={476} y={y} w={168} h={30} lines={i === 4 ? 'each が終わる' : `ブロックが ${c.back} を渡す`} fs={11.5} fill="box5" />
                <Arrow x1={474} y1={y + 24} x2={218} y2={y + 24} dashed />
                <T x={345} y={y + 2} fs={10.5} anchor="middle" tone="muted">resume</T>
                <T x={345} y={y + 34} fs={10.5} anchor="middle" tone="muted">{i === 4 ? '例外' : 'Fiber.yield'}</T>
              </>
            ) : (
              <T x={240} y={y + 15} fs={11.5} tone="muted">peek で覚えた 20 を返す（切り替えなし）</T>
            )}
            <T x={660} y={y + 15} fs={11} mono tone="muted">{`切り替え ${c.sw}`}</T>
          </g>
        )
      })}
      <T x={20} y={268} fs={11} tone="muted">enum.rb の TracePoint(:fiber_switch) で数えた切り替えは合計 8 回。Fiber を作るのは最初の next のとき</T>
    </Svg>
  )
}

/* ---------- 図 7 スケジューラーがあるときの待ち方（実測） ---------- */
function SchedulerFigure() {
  const scale = 500
  const x0 = 190
  const bar = (y: number, s: number, e: number, label: string, fill: 'box' | 'box4' | 'box5') => (
    <Box key={`${y}-${s}`} x={x0 + s * scale} y={y} w={(e - s) * scale} h={24} lines={label} fs={11} fill={fill} rx={3} />
  )
  return (
    <Svg id="98-7" w={760} h={300} label="スケジューラーがないと sleep 0.3 を3回で0.9秒かかる。async の中では、3つの read と1つの sleep が1本のスレッドで同時に待ち、0.3秒で終わる。1つのタスクが Ruby の計算を続けると、0.1秒の sleep を終えたタスクも計算が終わる0.88秒まで再開できない">
      <T x={20} y={18} bold fs={12}>スケジューラーなし</T>
      {[0, 1, 2].map((i) => bar(26, i * 0.3, i * 0.3 + 0.3, 'sleep 0.3', 'box4'))}
      <T x={20} y={39} fs={11} tone="muted">3 回を順に</T>
      <T x={20} y={78} bold fs={12}>Async（1 本のスレッド）</T>
      {['read（pipe 0）', 'read（pipe 1）', 'read（pipe 2）', 'sleep 0.3'].map((name, i) => (
        <g key={name}>
          <T x={20} y={98 + i * 28} fs={11} mono>{name}</T>
          {bar(86 + i * 28, 0, 0.3, i < 3 ? 'io_wait で待つ' : 'kernel_sleep', 'box4')}
        </g>
      ))}
      <T x={20} y={214} bold fs={12}>Async で一方が計算を続ける</T>
      <T x={20} y={238} fs={11} mono>タスク A</T>
      {bar(226, 0, 0.1, '', 'box4')}
      <rect x={x0 + 0.1 * scale} y={226} width={0.78 * scale} height={24} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />
      <T x={x0 + 0.12 * scale} y={238} fs={11} tone="danger">sleep は終わったが再開できない</T>
      <T x={20} y={266} fs={11} mono>タスク B</T>
      {bar(254, 0, 0.88, '20,000,000 回の足し算', 'box5')}
      {[0, 0.3, 0.6, 0.9].map((s) => (
        <T key={s} x={x0 + s * scale} y={290} fs={11} anchor="middle" mono tone="muted">{`${s} 秒`}</T>
      ))}
    </Svg>
  )
}

/* ---------- 図 8 CurrentAttributes の値の置き場所 ---------- */
function CurrentFigure() {
  return (
    <Svg id="98-8" w={760} h={250} label="Current.user は Current.instance を呼び、ExecutionContext の current_attributes_instances からインスタンスを探す。その入れ物は IsolatedExecutionState に置かれ、isolation_level が :thread なら Thread.current、:fiber なら Fiber.current の active_support_execution_state に入る">
      <Box x={14} y={20} w={150} h={40} lines="Current.user" fs={12} mono />
      <Arrow x1={164} y1={40} x2={196} y2={40} />
      <Box x={198} y={20} w={170} h={40} lines={['Current.instance', 'クラスごとに1個']} fs={11.5} mono subTone="muted" />
      <Arrow x1={368} y1={40} x2={400} y2={40} />
      <Box x={402} y={20} w={344} h={40} lines={['ExecutionContext.current_attributes_instances', '{ Current: #<Current user="alice"> }']} fs={11} mono subTone="muted" />
      <Arrow x1={574} y1={60} x2={574} y2={88} />
      <Box x={330} y={90} w={416} h={40} lines={['IsolatedExecutionState[:active_support_execution_context]', '入れ物を置く場所を isolation_level で切り替える']} fs={11} mono fill="box5" accent subTone="muted" />
      <Arrow x1={440} y1={130} x2={200} y2={166} />
      <Arrow x1={600} y1={130} x2={600} y2={166} />
      <Box x={20} y={168} w={330} h={44} lines={[':thread（既定）', 'Thread.current.active_support_execution_state']} fs={11} mono fill="box4" subTone="muted" />
      <Box x={410} y={168} w={336} h={44} lines={[':fiber', 'Fiber.current.active_support_execution_state']} fs={11} mono fill="box4" subTone="muted" />
      <T x={20} y={232} fs={11} tone="muted">同じスレッドの Fiber どうしは値を共有する</T>
      <T x={410} y={232} fs={11} tone="muted">Fiber ごとに別の値になる</T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 98,
  part: 1,
  title: 'スレッド・Fiber・GVL',
  summary: 'Ruby の実行を切り替える単位を区別し、Thread・Mutex・Queue で処理を受け渡す方法、GVL が並行に進める処理と進めない処理、Fiber とスケジューラー、Ractor を実測で確かめます。最後に、Rails のコードでスレッドの間に値が混ざる場所と CurrentAttributes の仕組みを読みます。',
  goals: [
    'プロセス、スレッド、Fiber、Ractor が何を共有し、どの単位で交代するかを説明できる',
    'Thread・Mutex・Queue・ConditionVariable を使い、競合状態を再現して直せる',
    'GVL を手放す処理と手放さない処理を、実測と CRuby のソースで見分けられる',
    'Fiber、Enumerator の外部イテレーター、Fiber スケジューラーの関係を説明できる',
    'クラス変数・クラスの属性・CurrentAttributes のどれに要求ごとの値を置けるかを判断できる',
  ],
  prerequisites: [95, 97],
  sections: [
    { id: 'execution-units', title: 'プロセス、スレッド、Fiber の単位', body: <>
      <p>記事一覧を二人が同時に開くと、サーバーは2件の要求を扱います。処理を同じ時期に進めることを<Term en="concurrency">並行</Term>、複数の CPU コアが同じ時点で処理を実行することを<Term en="parallelism">並列</Term>と呼んで区別します。並行に進む処理には、データベースの応答を待つなど、その時点で CPU を使っていないものも含まれます。どこで待つかを知ると、次にだれが実行できるかを考えられます。</p>
      <p><Term>プロセス</Term>は実行中のプログラムで、プロセスごとにメモリーが分かれています。Rails サーバーを2つのプロセスで動かすと、それぞれに Ruby の VM とヒープがあり、片方で Ruby の変数を書き換えてももう片方には伝わりません。両方から使いたい値はデータベースや Redis などプロセスの外に置きます。</p>
      <p><Term>スレッド</Term>はプロセスの中で命令を順に実行する流れです。同じプロセスの複数のスレッドは同じ Ruby のオブジェクトを読み書きできます。<Term>Fiber</Term>はスレッドの中で実行を途中で止め、後で同じ位置から再開できる単位です。Fiber は作っただけでは動かず、<code>resume</code> で動き始め、<code>Fiber.yield</code> で呼び出し元に戻ります。スレッドの交代は Ruby の VM が決めますが、Fiber の交代はプログラムが決めます。<Ref n={1} /><Ref n={2} /></p>
      <p><code>fork</code> で作ったプロセスの変数が分かれることと、スレッドの変数が共有されることは、<ChapterLink n={23} section="process" />と<ChapterLink n={23} section="thread" />の小さな実験で確かめられます。同じ節の <code>ps</code> の出力では、Ruby のスレッド1本が OS のスレッド1本に対応していました。この章では、1つのプロセスの中の動きを詳しく見ます。</p>
      <Figure n={figureNumber(98, 1)} title="実行の単位と共有するもの" caption={<>CRuby 4.0.9 で Ractor を使わない場合の構成です。VM スタックの大きさは RubyVM::DEFAULT_PARAMS の既定値です（<ChapterLink n={97} section="memory" />で実測）。</>}>
        <UnitsFigure />
      </Figure>
      <p>同じプロセスのスレッドはヒープを共有しますが、Ruby のコードを実行できるのは同時に1本だけです。この制約を作っているのが、後で扱う GVL です。並列に計算したいときはプロセスを増やすか、Ractor を使います。</p>
    </> },
    { id: 'thread-api', title: 'Thread・Mutex・Queue・ConditionVariable', body: <>
      <p><code>Thread.new</code> にブロックを渡すと、新しいスレッドがそのブロックを実行します。<code>join</code> はスレッドが終わるまで待ち、<code>value</code> は待ったうえでブロックの値を返します。スレッドの中で例外が起きた場合の動きも確かめます。<Ref n={1} /></p>
      <Code lang="ruby" title="tapi.rb" code={`t = Thread.new { 6 * 7 }
p t.value                       # 終わるまで待ち、ブロックの値を受け取る

failing = Thread.new { raise ArgumentError, "価格が負です" }
sleep 0.1                       # 例外で終わるまで待つ（この間に警告が出る）
p failing.status                # 例外で終わったスレッドは nil
begin
  failing.join                  # join したスレッドで同じ例外が起きる
rescue ArgumentError => e
  p [:rescued, e.message]
end`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`42
#<Thread:0x00007f246d69b318 tapi.rb:5 run> terminated with exception (report_on_exception is true):
tapi.rb:5:in 'block in <main>': 価格が負です (ArgumentError)
nil
[:rescued, "価格が負です"]`} />
      <p>スレッドの中の例外は作った側のスレッドにはすぐには伝わりません。<code>report_on_exception</code> が既定で true なので標準エラーに警告が出て、そのスレッドだけが終わります。<code>join</code> か <code>value</code> を呼んだときに、呼んだ側で同じ例外が起きます。スレッドを作ったら、どこかで <code>join</code> して結果と例外を受け取ります。</p>
      <h3>Queue で仕事を受け渡す</h3>
      <p>複数のスレッドで同じ配列に <code>push</code> と <code>shift</code> をすると、取り出しの判定と取り出しの間に別のスレッドが割り込むおそれがあります。<code>Thread::Queue</code> はスレッドの間で値を安全に受け渡す入れ物です。<code>pop</code> は空なら値が入るまで待ちます。<code>close</code> した後に空になると <code>nil</code> を返すので、使う側のループを終わらせられます。<Ref n={7} /></p>
      <Code lang="ruby" title="queue.rb" code={`jobs = Thread::Queue.new
results = Thread::Queue.new

workers = 3.times.map do |n|
  Thread.new do
    while (id = jobs.pop)        # close 後に空になると nil が返り、ループを抜ける
      sleep 0.05                 # 外部 API の応答を待つ代わり
      results << [id, "worker#{n}"]
    end
  end
end

started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
(1..9).each { |id| jobs << id }
jobs.close                       # これ以上入れないことを知らせる
workers.each(&:join)
elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started

p results.size.times.map { results.pop }.sort
printf("9件を 3 スレッドで %.2f 秒\\n", elapsed)`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`[[1, "worker0"], [2, "worker1"], [3, "worker2"], [4, "worker2"], [5, "worker1"], [6, "worker0"], [7, "worker1"], [8, "worker2"], [9, "worker0"]]
9件を 3 スレッドで 0.22 秒`} />
      <p>9件を0.05秒ずつ順に処理すると約0.45秒かかるところを、3本のスレッドで分けて0.22秒で終えました（計算上は0.15秒ですが、測ったマシンでは別の作業も動いていました）。どの仕事をどのスレッドが受け取るかは実行のたびに変わります。Sidekiq や Solid Queue のようなジョブの仕組みも、別のプロセスとの間で同じ形の受け渡しをしています。</p>
      <p><code>Thread::SizedQueue</code> は上限のある Queue で、満杯なら <code>push</code> した側を待たせます。作る側が使う側より速いとき、溜まる量に上限を付けられます。</p>
      <Code lang="ruby" title="sized.rb" code={`q = Thread::SizedQueue.new(2)
log = Thread::Queue.new
producer = Thread.new do
  5.times { |i| q << i; log << "push #{i}（待ち #{q.size}）" }
  q.close
end
sleep 0.2
log << "--- 0.2 秒後に取り出し開始"
consumer = Thread.new { while (v = q.pop); log << "pop  #{v}"; sleep 0.05; end }
[producer, consumer].each(&:join)
puts log.size.times.map { log.pop }`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`push 0（待ち 1）
push 1（待ち 2）
--- 0.2 秒後に取り出し開始
pop  0
push 2（待ち 2）
pop  1
push 3（待ち 2）
pop  2
push 4（待ち 2）
pop  3
pop  4`} />
      <Figure n={figureNumber(98, 2)} title="上限のある Queue で待つ順序" caption="sized.rb の出力を、作る側と使う側に分けて並べた図です。経過時間は sleep の値から求めた目安です。">
        <SizedQueueFigure />
      </Figure>
      <h3>ConditionVariable で条件を待つ</h3>
      <p>「設定を読み込み終えるまで待つ」のように、ある条件が成り立つまで待たせたい場合は <code>ConditionVariable</code> を <code>Mutex</code> と組み合わせます。<code>wait(mutex)</code> は Mutex を手放して眠り、起こされると Mutex を取り直してから戻ります。<Ref n={9} /></p>
      <Code lang="ruby" title="condvar.rb" code={`mutex = Mutex.new
ready = ConditionVariable.new
config = nil

waiters = 2.times.map do |n|
  Thread.new do
    mutex.synchronize do
      ready.wait(mutex) until config        # 待つ間は mutex を手放す
      puts "スレッド#{n}: #{config[:endpoint]} を使う"
    end
  end
end

sleep 0.1                                    # 設定を読み込む処理の代わり
mutex.synchronize do
  config = { endpoint: "https://api.example.test" }
  ready.broadcast                            # 待っているスレッドをすべて起こす
end
waiters.each(&:join)`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`スレッド0: https://api.example.test を使う
スレッド1: https://api.example.test を使う`} />
      <p><code>wait</code> を <code>if</code> ではなく <code>until</code> の中で呼ぶのは、起こされた時点で条件がまだ成り立っていない場合があるからです（別のスレッドが先に値を変えた場合など）。条件の確認と <code>wait</code> を同じ Mutex の中で行うので、確認してから眠るまでの間に起こされて合図を逃すことはありません。業務のコードで ConditionVariable を直接使う場面は少なく、多くは Queue で足ります。</p>
    </> },
    { id: 'race', title: '競合状態を再現して Mutex で直す', body: <>
      <p>複数のスレッドが同じ値を読んで書き戻すと、互いの更新を上書きして結果が合わなくなることがあります。これを<Term en="race condition">競合状態</Term>と呼びます。在庫の数を4本のスレッドから10万回ずつ減らし、読み出しと書き込みの間にメソッドの呼び出しを挟みました。</p>
      <Code lang="ruby" title="race.rb" code={`class Stock
  attr_reader :count

  def initialize(count)
    @count = count
    @lock = Mutex.new
  end

  def decrement_unsafe
    @count = minus_one(@count)   # 読む → メソッドを呼ぶ → 書く
  end

  def decrement_safe
    @lock.synchronize { @count = minus_one(@count) }
  end

  private

  def minus_one(n) = n - 1
end

[:decrement_unsafe, :decrement_safe].each do |name|
  3.times do
    stock = Stock.new(400_000)
    4.times.map { Thread.new { 100_000.times { stock.public_send(name) } } }.each(&:join)
    puts "#{name}: 残り #{stock.count}（正しくは 0）"
  end
end`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`decrement_unsafe: 残り 34391（正しくは 0）
decrement_unsafe: 残り 206462（正しくは 0）
decrement_unsafe: 残り 69414（正しくは 0）
decrement_safe: 残り 0（正しくは 0）
decrement_safe: 残り 0（正しくは 0）
decrement_safe: 残り 0（正しくは 0）`} />
      <p>Mutex を使わない decrement_unsafe では、40万回減らしたはずの在庫が3万〜20万も残りました。残る数は実行のたびに変わります。GVL があっても、Ruby のコードを実行するスレッドが途中で交代するからです。交代できる位置は VM が決めていて、メソッドから戻る <code>leave</code> 命令（フレームを取り除く <code>vm_pop_frame</code> の中）や、ループで戻る <code>jump</code> などの命令で、交代の要求が来ていないかを調べます（vm_insnhelper.c の 452 行目、insns.def の <code>jump</code> と <code>branchif</code> など）。<Ref n={10} /> <code>minus_one</code> から戻るときに交代すると、別のスレッドが同じ古い値を読み、両方が同じ値を書きます（図 {figureNumber(98, 3)}）。</p>
      <Figure n={figureNumber(98, 3)} title="更新が消える順序と Mutex" caption="race.rb で起きる順序の一例を描いた模式図です。実際に何回目で交代するかは実行のたびに変わります。">
        <RaceFigure />
      </Figure>
      <p>同じ実験を <code>count += 1</code> だけで行うと、4本 × 10万回の結果はこの環境では4回とも 400000 でした。<code>+=</code> の読み出しから書き込みまでの間にメソッドの呼び出しも <code>jump</code> もなく、交代できる位置がないからです。ただし、これは CRuby の今の命令列の作り方に依存した結果で、言語として保証されたものではありません。命令が変われば、同じコードでも結果が変わる可能性があります。共有する値を読み書きする処理は、短く見えても Mutex で囲みます。</p>
      <p>同じことは、確認してから書き込む処理でも起きます。共有のハッシュにキーがあるかを確かめ、なければ外部 API を呼んで値を入れる処理では、外部 API を待つ間に GVL が手放されるので、2本のスレッドがどちらも「キーがない」と判定して両方が API を呼ぶことがあります。GVL が保証するのは Ruby の命令を同時に2つ実行しないことだけで、アプリケーションの一連の操作をまとめて実行することまでは保証しません。</p>
      <p><code>Mutex#synchronize</code> のブロックの中にいる間、同じ Mutex を使う別のスレッドはブロックに入れず待ちます。途中で GVL が交代しても、もう一方は待つだけなので、読み出しから書き込みまでが続けて実行されます。保護する範囲には必要な操作だけを入れます。たとえばロックの中で外部 API の応答を待つと、その間はほかのスレッドが在庫を減らせません。また、Mutex が守るのは1つのプロセスの中だけです。Puma のワーカーやサーバーが複数あるときは、データベースの行ロックや一意制約で守ります（<ChapterLink n={15} section="pessimistic" />）。<Ref n={8} /></p>
    </> },
    { id: 'gvl', title: 'GVL：I/O を待つ間は手放し、計算では1本ずつ進む', body: <>
      <p>CRuby には <Term en="Global VM Lock">GVL</Term> があり、1つのプロセス（正確には1つの Ractor）の中で Ruby のコードを実行できるスレッドは同時に1本だけです。スレッドは Ruby のコードを実行する前に GVL を取り、ファイルやネットワークを待つときや <code>sleep</code> の間は GVL を手放します。C で書かれた処理は、Ruby のオブジェクトに触らない間だけ <code>rb_thread_call_without_gvl</code>（thread.c の 1738〜1742 行目で <code>rb_nogvl</code> を呼ぶ）を使って GVL を手放せます。<Ref n={5} /></p>
      <p>同じ処理を4回、順番に実行した場合と4本のスレッドで実行した場合を比べました。Ruby のループ、Digest の SHA256、Zlib の圧縮、<code>sleep</code> の4種類です。</p>
      <Code lang="ruby" title="gvl.rb" code={`require "digest"
require "zlib"

DATA = Random.new(1).bytes(8 * 1024 * 1024)   # 8MB の乱数
def ruby_loop = (x = 0; 3_000_000.times { |i| x += i }; x)

TASKS = {
  "Ruby のループ"         => -> { ruby_loop },
  "SHA256（digest）"      => -> { Digest::SHA256.hexdigest(DATA * 4) },
  "圧縮（zlib）"         => -> { Zlib::Deflate.deflate(DATA, 6) },
  "sleep 0.3"            => -> { sleep 0.3 },
}

def measure
  wall = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  cpu = Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID)
  yield
  [Process.clock_gettime(Process::CLOCK_MONOTONIC) - wall, Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID) - cpu]
end

TASKS.each do |name, task|
  seq_wall, seq_cpu = measure { 4.times { task.call } }
  thr_wall, thr_cpu = measure { 4.times.map { Thread.new { task.call } }.each(&:join) }
  printf("%-16s 順番に4回: 経過 %.2f 秒 CPU %.2f 秒 ｜ 4スレッド: 経過 %.2f 秒 CPU %.2f 秒 CPU÷経過 %.2f\\n",
         name, seq_wall, seq_cpu, thr_wall, thr_cpu, thr_cpu / thr_wall)
end`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9、Docker 上の ruby:4.0、4 コアのマシン）" code={`Ruby のループ        順番に4回: 経過 0.95 秒 CPU 0.94 秒 ｜ 4スレッド: 経過 0.95 秒 CPU 0.91 秒 CPU÷経過 0.96
SHA256（digest）   順番に4回: 経過 0.70 秒 CPU 0.70 秒 ｜ 4スレッド: 経過 0.71 秒 CPU 0.70 秒 CPU÷経過 0.98
圧縮（zlib）         順番に4回: 経過 1.29 秒 CPU 1.23 秒 ｜ 4スレッド: 経過 0.59 秒 CPU 1.28 秒 CPU÷経過 2.19
sleep 0.3        順番に4回: 経過 1.20 秒 CPU 0.00 秒 ｜ 4スレッド: 経過 0.30 秒 CPU 0.00 秒 CPU÷経過 0.00`} />
      <p>Ruby のループと SHA256 は、4本のスレッドにしても経過時間が変わりませんでした。CPU 時間を経過時間で割った値が約1なので、同じ時点で使っていたコアは1つだけです。一方、zlib の圧縮は経過時間が半分以下になり、CPU÷経過が 2.19 でした。同じ時点で2つ以上のコアが圧縮を進めていたことになります。zlib の拡張ライブラリは、圧縮の処理を <code>rb_nogvl</code> で GVL を手放して実行しています（ext/zlib/zlib.c の 1057〜1059 行目）。<Ref n={11} /> <code>sleep</code> は CPU を使わずに待つだけなので、4本が同時に待って0.3秒で終わりました。</p>
      <p>このマシンでは別の作業も動いていたので、経過時間は実行のたびに数十%変わりました。同じ傾向を、負荷に左右されにくい方法でも確かめます。</p>
      <h3>2本のスレッドが交代する時刻</h3>
      <p>2本のスレッドに Ruby の計算を続けさせ、それぞれが時刻を読み続けます。時刻が1ms 以上飛んだら、その間は止められていたとみなして区間を記録します。</p>
      <Code lang="ruby" title="timeline.rb" code={`def record(seconds)
  t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC, :millisecond)
  segments = []
  start = last = t0
  loop do
    now = Process.clock_gettime(Process::CLOCK_MONOTONIC, :millisecond)
    if now - last > 1
      segments << [start, last]
      start = now
    end
    last = now
    break if now - t0 > seconds * 1000
  end
  segments << [start, last]
end

base = Process.clock_gettime(Process::CLOCK_MONOTONIC, :millisecond)
a = Thread.new { record(0.6) }
b = Thread.new { record(0.6) }
{ "A" => a.value, "B" => b.value }.each do |name, segs|
  puts "#{name}: " + segs.first(6).map { |s, e| "#{s - base}-#{e - base}" }.join(" ") + " …（#{segs.size} 区間）"
end
both = a.value.sum { |s1, e1| b.value.sum { |s2, e2| [[e1, e2].min - [s1, s2].max, 0].max } }
puts "A と B が同時に進んでいた時間の合計: #{both}ms"`} />
      <Code lang="text" title="ruby timeline.rb と RUBY_THREAD_TIMESLICE=20 ruby timeline.rb の実行結果" code={`A: 0-19 21-103 204-305 406-508 610-610 …（5 区間）
B: 103-204 305-406 508-704 …（3 区間）
A と B が同時に進んでいた時間の合計: 0ms
--- RUBY_THREAD_TIMESLICE=20
A: 0-20 44-64 87-108 130-150 173-194 214-234 …（16 区間）
B: 20-44 64-87 108-130 150-173 194-214 234-255 …（15 区間）
A と B が同時に進んでいた時間の合計: 0ms`} />
      <Figure n={figureNumber(98, 4)} title="Ruby の計算を続ける2本のスレッドが交代する時刻" caption="timeline.rb の出力を描いた図です。2本が同時に進んでいた時間は、どちらの設定でも 0ms でした。">
        <TimesliceFigure />
      </Figure>
      <p>A と B は約100ms ごとに交代し、同時に進んでいた時間は 0ms でした。この100ms は thread.c の <code>thread_default_quantum_ms</code>（118 行目、値は 100）で、環境変数 <code>RUBY_THREAD_TIMESLICE</code> で変えられます（同じファイルの 5792 行目）。20 にすると約20ms ごとに交代しました。間隔を短くすると1件ごとの待ち時間は均等になりますが、交代の回数が増えます。</p>
      <h3>C の処理が GVL を手放すかどうか</h3>
      <p>次に、スレッド A に1秒間 Ruby の計算をさせ、その間にスレッド B に別の処理を繰り返させました。A が止められずに進めた時間の合計を比べます。A の側は timeline.rb と同じ <code>record</code> で区間を記録し、B の処理だけを4通りに替えます。</p>
      <Code lang="ruby" title="timeline2.rb（record は timeline.rb と同じなので省略）" code={`require "digest"
require "zlib"

DATA = Random.new(1).bytes(4 * 1024 * 1024)
JOBS = {
  "B も Ruby の計算"      => -> { x = 0; 10_000_000.times { |i| x += i } },
  "B は sleep"            => -> { sleep 0.05 },
  "B は SHA256（digest）" => -> { Digest::SHA256.digest(DATA) },
  "B は圧縮（zlib）"      => -> { Zlib::Deflate.deflate(DATA) },
}
JOBS.each do |name, job|
  stop = false
  b = Thread.new { job.call until stop }
  sleep 0.01
  segs = record(1.0)
  stop = true
  b.join
  running = segs.sum { |s, e| e - s }
  printf("%-20s A が進めた時間 %4dms / 1000ms（止められた回数 %d）\\n", name, running, segs.size - 1)
end`} />
      <Code lang="text" title="timeline2.rb の実行結果（CRuby 4.0.9）" code={`B も Ruby の計算         A が進めた時間  502ms / 1000ms（止められた回数 13）
B は sleep            A が進めた時間  991ms / 1000ms（止められた回数 1）
B は SHA256（digest）   A が進めた時間  355ms / 1000ms（止められた回数 5）
B は圧縮（zlib）          A が進めた時間  995ms / 1000ms（止められた回数 2）`} />
      <Figure n={figureNumber(98, 5)} title="B が実行する処理と、A が進めた時間" caption="もう1回の実行では、上から 493、996、286、934ms でした。">
        <NogvlFigure />
      </Figure>
      <p>B が Ruby の計算なら、A は半分の時間しか進めません。B が <code>sleep</code> や zlib の圧縮なら、A はほぼ1秒間進めました。B が SHA256 を計算する場合は、A は半分よりさらに少なくなりました。digest の拡張ライブラリは計算の間も GVL を持ったままで、C の関数の途中では交代の要求を調べないので、1回の SHA256 が終わるまで A は待たされます。重いネイティブ処理を含む gem を Web の要求の中で使うときは、その gem が GVL を手放すかを、ソースか同じような実測で確かめます。</p>
      <p>Puma のスレッドで DB の待ちと Ruby の計算を比べた実測は <ChapterLink n={23} section="gvl" />にあります。この節の後の操作できる図では2本のスレッドの順序を段階ごとに確かめられます。</p>
    </> },
    { id: 'fiber', title: 'Fiber が中断した場所から再開する', body: <>
      <p>次のコードは同じスレッドで実行します。1回目の <code>resume</code> は Fiber を開始し、<code>Fiber.yield</code> まで進めます。<code>yield</code> の引数が呼び出し元に返ります。2回目の <code>resume</code> は中断した場所から処理を続けます。このとき <code>resume</code> へ渡した値が、Fiber 内にある <code>Fiber.yield</code> の戻り値になります。<Ref n={2} /></p>
      <Code lang="ruby" code={`fiber = Fiber.new do
  id = 42
  title = Fiber.yield(id)
  { id: id, title: title }
end

p fiber.resume            # => 42
p fiber.resume("Ruby")    # => {id: 42, title: "Ruby"}
p fiber.alive?            # => false`} />
      <p>Fiber のローカル変数 <code>id</code> が2回の呼び出しをまたいで使われています。Fiber は自分の VM スタックを持ち、中断した時点のフレームとローカル変数をそこに残しておくからです。終了した Fiber の <code>resume</code> は例外（FiberError）になります。</p>
      <p>スレッドと違い、Fiber は時間で交代しません。長い計算が <code>Fiber.yield</code> や待ちを経ずに続く間、同じスレッドの別の Fiber はその計算に割り込めません。交代する位置がプログラムに書いてあるので、値を読んでから書くまでの間に同じスレッドの別の Fiber が割り込むことはありません（別のスレッドは割り込めます）。その一方、1つの Fiber が CPU を使い続けると同じスレッドの Fiber 全体が止まります。また、Fiber は作ったスレッドの中でだけ再開でき、別のスレッドから <code>resume</code> すると FiberError になります。</p>
      <p>Fiber はスレッドより軽く作れます。1万個の Fiber と1万本の Thread を作り、全部を動かして途中で止めるまでの時間と、RSS の増え方を比べました。</p>
      <Code lang="ruby" title="cost.rb" code={`def rss_mb = File.read("/proc/self/status")[/VmRSS:\\s+(\\d+)/, 1].to_i / 1024
def wall = Process.clock_gettime(Process::CLOCK_MONOTONIC)

GC.start
base = rss_mb
t = wall
fibers = Array.new(10_000) { Fiber.new { Fiber.yield; :done } }
fibers.each(&:resume)               # 全部を1回ずつ動かして途中で止める
puts format("Fiber  1万個: 作成と開始 %.3f 秒 / RSS +%d MB", wall - t, rss_mb - base)
fibers.each(&:resume)               # 最後まで動かす
fibers = nil
GC.start

base = rss_mb
t = wall
q = Thread::Queue.new
threads = Array.new(10_000) { Thread.new { q.pop } }
sleep 0.01 until threads.all? { _1.status == "sleep" }
puts format("Thread 1万本: 作成と開始 %.3f 秒 / RSS +%d MB / OS のスレッド数 %d", wall - t, rss_mb - base, Dir.children("/proc/self/task").size)
10_000.times { q << :go }
threads.each(&:join)`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`Fiber  1万個: 作成と開始 0.147 秒 / RSS +126 MB
Thread 1万本: 作成と開始 6.398 秒 / RSS +252 MB / OS のスレッド数 10002`} />
      <p>Fiber は1万個を約0.15秒で作って動かしました。Thread は OS のスレッドを1万本作るので6秒以上かかり、RSS の増え方も Fiber の2倍でした（別の実行では Fiber 0.080 秒、Thread 5.2 秒）。Fiber の VM スタックの既定は 128KiB で、スレッドの 1MiB より小さく、深い再帰には向きません（<ChapterLink n={97} section="memory" />で実測しました）。</p>
    </> },
    { id: 'enumerator', title: 'Enumerator の外部イテレーターと Fiber', body: <>
      <p><code>each</code> にブロックを渡すと、配列の側が要素を1つずつブロックに渡します。これを内部イテレーターと呼びます。反対に、呼び出し元が「次の要素をください」と1つずつ取り出す書き方を外部イテレーターと呼び、Ruby では <code>Enumerator#next</code> で使えます。ブロックを付けずに <code>each</code> を呼ぶと Enumerator が返ります。<Ref n={12} /></p>
      <Code lang="ruby" title="enum.rb（前半）" code={`switches = 0
trace = TracePoint.new(:fiber_switch) { switches += 1 }

e = [10, 20, 30].each
trace.enable do
  p e.next      # => 10
  p e.peek      # => 20（進めずにのぞく）
  p e.next      # => 20
  p e.next      # => 30
  begin
    e.next
  rescue StopIteration => ex
    p [:stop, ex.result]  # each の戻り値
  end
end
p switches: switches

ids = Enumerator.new do |y|        # 終わりのない列から、必要な分だけ取り出す
  n = 0
  loop { y << (n += 1) }
end
p ids.next, ids.next, ids.take(3)`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9）" code={`10
20
20
30
[:stop, [10, 20, 30]]
{switches: 8}
1
2
[1, 2, 3]`} />
      <p><code>each</code> は最後の要素を渡し終えるまで戻らないメソッドです。それを1要素ずつ止めるために、CRuby は Enumerator の中で Fiber を使っています。最初の <code>next</code> で <code>rb_fiber_new</code> により each を実行する Fiber を作り（enumerator.c の 769〜773 行目）、<code>next</code> のたびにその Fiber を <code>resume</code> します（778〜799 行目）。each のブロックが値を受け取ると <code>rb_fiber_yield</code> で呼び出し元に戻ります（747 行目）。<Ref n={12} /></p>
      <Figure n={figureNumber(98, 6)} title="next と peek で Fiber が切り替わる順序" caption="enum.rb の前半の5回の呼び出しを描いた図です。切り替えの回数は TracePoint の :fiber_switch で数えた値です。">
        <EnumeratorFigure />
      </Figure>
      <p>TracePoint の <code>:fiber_switch</code> で数えた切り替えは8回でした。<code>next</code> 1回につき、Enumerator の Fiber に入るときと戻るときで2回です。<code>peek</code> で取り出した値は覚えておくので、その直後の <code>next</code> では切り替わりません。each が終わると <code>StopIteration</code> が起き、<code>result</code> で each の戻り値を読めます。<code>loop</code> は StopIteration を受け取るとループを終えるので、<code>loop {'{'} v = e.next {'}'}</code> と書けます。</p>
      <p>Fiber の切り替えには費用がかかります。100万要素の配列の合計を、<code>each</code> と <code>loop {'{'} sum += e.next {'}'}</code> で比べました。</p>
      <Code lang="text" title="enum.rb（後半）の実行結果" code={`100万要素：each 0.089 秒 / next 0.550 秒（6 倍）`} />
      <p>外部イテレーターは2つの列を同時に1要素ずつ進める場合や、終わりのない列から必要な分だけ取り出す場合に向いています。配列の全要素を順に処理するだけなら、<code>each</code> や <ChapterLink n={96} section="each">Enumerable のメソッド</ChapterLink>を使います。</p>
    </> },
    { id: 'scheduler', title: 'Fiber スケジューラーが I/O を待つ', body: <>
      <p>Fiber は自分で <code>resume</code> と <code>Fiber.yield</code> を書かないと交代しません。Fiber スケジューラーはこの交代を I/O の待ちに合わせて自動で行う仕組みです。<code>Fiber.set_scheduler</code> でスレッドにスケジューラーを設定すると、そのスレッドでブロックしない（<code>Fiber.new(blocking: false)</code> の）Fiber が <code>IO#read</code> や <code>sleep</code> で待つときに、CRuby がスケジューラーの <code>io_wait</code> や <code>kernel_sleep</code> などのフックを呼びます。スケジューラーは待っている Fiber を止めておき、読み込める状態になった Fiber から再開します。<Ref n={3} /></p>
      <p>Ruby にはスケジューラーのインターフェースだけがあり、実装は gem が提供します。ここでは async gem（2.46.0）を使いました。3つのパイプからの <code>read</code> と1つの <code>sleep</code> を、1本のスレッドの中の4つのタスク（Fiber）で待ちます。io_wait フックが呼ばれた回数も数えます。<Ref n={16} /></p>
      <Code lang="ruby" title="sched.rb" code={`require "async"

LOG = []
module HookLog # io_wait フックが呼ばれた回数を数える
  %i[io_wait].each do |hook|
    define_method(hook) do |*args|
      LOG << hook
      super(*args)
    end
  end
end
Async::Scheduler.prepend(HookLog)

def wall = Process.clock_gettime(Process::CLOCK_MONOTONIC)

t = wall
3.times { sleep 0.3 }
printf("スケジューラーなし: %.2f 秒\\n", wall - t)

t = wall
Async do |task|
  readers = 3.times.map do |i|
    r, w = IO.pipe
    Thread.new { sleep 0.3; w.write("reply #{i}"); w.close } # 0.3 秒後に応答する相手の代わり
    task.async { r.read }                                   # 届くまで待つ
  end
  sleeper = task.async { sleep 0.3; "slept" }
  p readers.map(&:wait) + [sleeper.wait]
  p Fiber.scheduler.class
end
printf("Async（3つの read と 1つの sleep）: %.2f 秒\\n", wall - t)
p LOG.tally

t = wall
Async do |task|
  a = task.async { s = wall; sleep 0.1; format("A: 0.1 秒の sleep が %.2f 秒後に終了", wall - s) }
  b = task.async { x = 0; 20_000_000.times { |i| x += i }; "B: 計算を終了" }
  puts a.wait, b.wait
end
printf("全体: %.2f 秒\\n", wall - t)`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9、async 2.46.0。IO::Buffer が実験的であるという警告の行を省略）" code={`スケジューラーなし: 0.90 秒
["reply 0", "reply 1", "reply 2", "slept"]
Async::Reactor
Async（3つの read と 1つの sleep）: 0.30 秒
{io_wait: 3}
A: 0.1 秒の sleep が 0.88 秒後に終了
B: 計算を終了
全体: 0.88 秒`} />
      <Figure n={figureNumber(98, 7)} title="スケジューラーがあるときの待ち方" caption="sched.rb の実行結果を描いた図です。パイプに書き込む相手は別のスレッドで動かしています。">
        <SchedulerFigure />
      </Figure>
      <p>スケジューラーがなければ <code>sleep 0.3</code> を3回で0.9秒かかります。async の中では、4つの待ちが1本のスレッドで同時に進み、0.3秒で終わりました。3つの <code>read</code> は、データが届いていなかったので <code>io_wait</code> フックを1回ずつ呼びました。一方、最後の例では、タスク B が Ruby の計算を続けている間、0.1秒の sleep を終えたタスク A も再開できず、B が終わる0.88秒まで待たされました。スケジューラーは I/O の待ちを重ねられますが、CPU を使う処理の間に別の Fiber へ交代させることはできません。</p>
      <p>同時に始められる処理の数が増えても、外部サービスの同時要求数、データベースの接続数、プロセスのメモリーには上限があります。また、スケジューラーに対応しない C 拡張の中で待つと、その Fiber だけでなくスレッド全体が止まります。Rails の標準の構成（Puma）はスレッドで要求を処理するので、この仕組みを使うのは Falcon のような Fiber で要求を処理するサーバーや、async を使うライブラリを選ぶ場合です。</p>
      <h3>Fiber ごとの値とスレッドごとの値</h3>
      <p><code>Thread.current[:request_id]</code> のような添字の API は、名前に反して Fiber ごとに値を持ちます。スレッド全体で値を保持するのは <code>thread_variable_get</code> と <code>thread_variable_set</code> です。取り違えると、同じスレッドの別の Fiber で値が見えなかったり、逆に別の処理から読めてしまったりします。<Ref n={1} /></p>
      <p>メインの Fiber に要求 ID を置いて子の Fiber を作り、スレッドに置いた <code>:worker</code> と Fiber ごとに保持する <code>:request_id</code> を読みます。<code>TracePoint</code> で <code>:fiber_switch</code> を受け取るたびに <code>Fiber.current</code> から切り替え先を記録します。<Ref n={4} /></p>
      <Code lang="ruby" title="スケジューラーを使わずに Fiber の切り替えを観察する" code={`thread = Thread.current
thread[:request_id] = :main
thread.thread_variable_set(:worker, :shared)

fiber = Fiber.new do
  p [Thread.current.equal?(thread), thread[:request_id]]
  thread[:request_id] = :child
  Fiber.yield
  p [thread[:request_id], thread.thread_variable_get(:worker)]
end

switches = []
trace = TracePoint.new(:fiber_switch) do
  switches << (Fiber.current.equal?(fiber) ? :child : :main)
end
trace.enable do
  fiber.resume
  p [thread[:request_id], thread.thread_variable_get(:worker)]
  fiber.resume
end
p switches`} />
      <Code lang="text" title="CRuby 4.0.9 の実行結果" code={`[true, nil]
[:main, :shared]
[:child, :shared]
[:child, :main, :child, :main]`} />
      <p>1行目の <code>true</code> は同じスレッドで実行していることを示し、<code>nil</code> は子に要求 ID が引き継がれていないことを表します。子が値を書いて中断してもメインの要求 ID は <code>:main</code> のままで、子を再開すると <code>:child</code> を読めます。<code>:worker</code> はどちらから読んでも <code>:shared</code> です。最後の行には再開・中断・再開・終了の順に切り替わった先が並びます。Rails で要求ごとの値を持つ CurrentAttributes がどちらの単位を使うかは、後の節で確かめます。</p>
    </> },
    { id: 'ractor', title: 'Ractor：GVL を分けて並列に計算する', body: <>
      <p><Term>Ractor</Term> は1つのプロセスの中で Ruby の計算を並列に実行するための単位です。GVL は Ractor ごとにあるので、別々の Ractor のスレッドは同時に Ruby のコードを実行できます。その代わり、Ractor の間では原則としてオブジェクトを共有できません。値は引数やメッセージとしてコピーして渡し、共有するなら freeze した値（<code>Ractor.make_shareable</code>）にします。<Ref n={13} /></p>
      <p>Ruby 4.0.0 の NEWS によると、4.0 では Ractor の間で値をやり取りする <code>Ractor::Port</code> が入り、<code>Ractor.yield</code> と <code>Ractor#take</code> は削除されました。終了を待つ <code>Ractor#join</code> と <code>Ractor#value</code> も加わっています。NEWS は安定性と性能の改善によって実験的な扱いから外れる段階に近づいたとしていますが、4.0.9 でも <code>Ractor.new</code> を呼ぶと「Ractor API は実験的」という警告が出ます。<Ref n={6} /></p>
      <Code lang="ruby" title="ractor.rb" code={`def work(n) = (x = 0; i = 0; while i < n; x += i; i += 1; end; x)
def measure
  w = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  c = Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID)
  yield
  w2 = Process.clock_gettime(Process::CLOCK_MONOTONIC) - w
  c2 = Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID) - c
  format("経過 %.2f 秒 CPU %.2f 秒", w2, c2)
end
N = 20_000_000

puts "順番に4回: " + measure { 4.times { work(N) } }
puts "4スレッド: " + measure { 4.times.map { Thread.new { work(N) } }.each(&:join) }
puts "4 Ractor:  " + measure { 4.times.map { Ractor.new(N) { |n| work(n) } }.each(&:value) }`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9、4 コアのマシン）" code={`ractor.rb:15: warning: Ractor API is experimental and may change in future versions of Ruby.
順番に4回: 経過 3.69 秒 CPU 3.32 秒
4スレッド: 経過 3.66 秒 CPU 3.37 秒
4 Ractor:  経過 2.29 秒 CPU 3.33 秒`} />
      <p>4本のスレッドでは順番に実行した場合と同じ時間がかかりましたが、4つの Ractor では経過時間が約6割になりました。CPU 時間は同じ約3.3秒なので、同じ計算を複数のコアで同時に進めたことになります。マシンでは別の作業も動いていたため、4倍にはなっていません（もう1回の実行でも 2.26 秒）。</p>
      <p>共有できない値に触ると、Ractor を作る時点か実行中にエラーになります。</p>
      <Code lang="ruby" title="ractor2.rb" code={`config = { endpoint: "https://api.example.test" }
begin
  Ractor.new { config[:endpoint] }.value     # 外側のローカル変数は参照できない
rescue ArgumentError => e
  puts "ArgumentError: #{e.message[0, 60]}"
end

r = Ractor.new(config) { |c| c[:endpoint] }  # 引数で渡すとコピーされる
p r.value
p config.frozen?, Ractor.shareable?(config)

SETTINGS = Ractor.make_shareable({ limit: 10 }) # 深く freeze して共有できる値にする
p Ractor.new { SETTINGS[:limit] }.value

COUNTS = { views: 0 }                         # 共有できない値を入れた定数
begin
  Ractor.new { COUNTS[:views] }.value
rescue Ractor::RemoteError => e
  puts "#{e.cause.class}: #{e.cause.message[0, 70]}"
end

port = Ractor::Port.new                       # Ruby 4.0 で入った Port でやり取りする
3.times { |i| Ractor.new(port, i) { |pt, n| pt << n * 10 } }
p 3.times.map { port.receive }.sort`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9。警告の行を省略）" code={`ArgumentError: can not isolate a Proc because it accesses outer variables (
"https://api.example.test"
false
false
10
#<Thread:0x00007f1cc25a9d90 run> terminated with exception (report_on_exception is true):
ractor2.rb:18:in 'block in <main>': can not access non-shareable objects in constant Object::COUNTS by non-main Ractor. (Ractor::IsolationError)
Ractor::IsolationError: can not access non-shareable objects in constant Object::COUNTS by non
[0, 10, 20]`} />
      <p>外側のローカル変数を使うブロックは Ractor にできず、freeze していないハッシュを入れた定数はメイン以外の Ractor から読めません。Rails のアプリケーションはクラスや定数に freeze していない設定やキャッシュを多く持ち、gem の多くもメインの Ractor から使う前提で書かれています。そのため、Rails の要求の処理を Ractor で並列にすることは、Ruby 4.0 の時点では現実的ではありません。Ractor を使うなら、入力と出力を値で受け渡せる計算（画像の解析、集計など）を切り出す場合に限られます。これは筆者の判断で、Rails の公式な指針ではありません。Web の要求を並列に処理するには、これまでどおり Puma のワーカー（プロセス）を増やします。</p>
    </> },
    { id: 'thread-safety', title: 'Rails のスレッド安全性：クラス変数・クラスの属性・CurrentAttributes', body: <>
      <p>Puma の1つのワーカーでは、複数のスレッドが同じクラスと定数を使って要求を処理します。そのため、クラスに置いた値はすべての要求から見えます。クラス変数と <code>class_attribute</code> の値がどの範囲で共有されるかを確かめました。</p>
      <Code lang="ruby" title="classvar.rb" code={`require "active_support"
require "active_support/core_ext/class/attribute"

class ApplicationService
  @@last_user = nil                 # クラス変数：サブクラスとも共有する
  class_attribute :locale, default: "ja"
  def self.last_user = @@last_user
  def self.last_user=(v)
    @@last_user = v
  end
end
class ExportService < ApplicationService; end

ExportService.last_user = "alice"     # サブクラスから書いても
p ApplicationService.last_user        # => "alice"（親から同じ値が見える）

ExportService.locale = "en"           # class_attribute はサブクラスに別の値を持てる
p [ApplicationService.locale, ExportService.locale]

t = Thread.new { ApplicationService.locale = "fr" } # 別のスレッドで書き換える
t.join
p ApplicationService.locale           # => "fr"（すべてのスレッドで共有）`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9、activesupport 8.1.4.1）" code={`"alice"
["ja", "en"]
"fr"`} />
      <p>クラス変数 <code>@@last_user</code> は、親クラスとすべてのサブクラスで1つの値を共有します。<code>class_attribute</code> はサブクラスごとに別の値を持てますが（仕組みは <ChapterLink n={5} />）、スレッドごとには分かれません。どちらも、起動時に一度だけ決める設定には使えますが、ログイン中の利用者のような要求ごとの値を入れると、別の要求の処理に混ざります。Puma に同時に要求を送って実際に混ざる様子は <ChapterLink n={23} section="thread-safety" />で再現しました。</p>
      <h3>CurrentAttributes の値はどこに置かれるか</h3>
      <p>要求ごとの値は <code>ActiveSupport::CurrentAttributes</code> を継承したクラス（慣習で <code>Current</code>）に置きます。<code>Current.user</code> はクラスごとに1つのインスタンスを返す <code>Current.instance</code> に委ねられ、そのインスタンスは <code>ExecutionContext.current_attributes_instances</code> というハッシュに入っています。このハッシュの置き場所を決めるのが <code>IsolatedExecutionState</code> です。<Ref n={15} /></p>
      <Code lang="ruby" title="activesupport/lib/active_support/isolated_execution_state.rb（13〜40行目と74行目から抜粋）" href={`${GH}/activesupport/lib/active_support/isolated_execution_state.rb#L13-L40`} code={`      def isolation_level=(level)
        ...
        @scope =
          case level
          when :thread; Thread
          when :fiber; Fiber
          end
        @isolation_level = level
      end

      def [](key)
        if state = @scope.current.active_support_execution_state
          state[key]
        end
      end

      def []=(key, value)
        state = (@scope.current.active_support_execution_state ||= {})
        state[key] = value
      end
    ...
    self.isolation_level = :thread`} />
      <p>既定の <code>isolation_level</code> は <code>:thread</code> で、値は <code>Thread.current</code> に付けた属性に入ります。<code>:fiber</code> にすると <code>Fiber.current</code> に入ります。アプリケーションでは <code>config.active_support.isolation_level</code> で設定し、起動の最後に反映されます（railtie.rb の 16〜22 行目）。<Ref n={14} /></p>
      <Figure n={figureNumber(98, 8)} title="CurrentAttributes の値の置き場所" caption="activesupport 8.1.4.1 の current_attributes.rb、execution_context.rb、isolated_execution_state.rb をたどった図です。">
        <CurrentFigure />
      </Figure>
      <p>2本のスレッドと、1本のスレッドの中の2つの Fiber で、それぞれが <code>Current.user</code> に別の名前を入れてから読み出しました。Fiber の側は、両方が代入してから中断し、再開して読み出します。</p>
      <Code lang="ruby" title="current.rb" code={`require "active_support"
require "active_support/current_attributes"

class Current < ActiveSupport::CurrentAttributes
  attribute :user
end

def two_threads
  2.times.map { |i| Thread.new { Current.user = "user#{i}"; sleep 0.05; Current.user } }.map(&:value)
end

def two_fibers # 1本のスレッドの中で、2件の要求を Fiber で交互に進める
  fibers = 2.times.map { |i| Fiber.new { Current.user = "user#{i}"; Fiber.yield; Current.user } }
  fibers.each(&:resume)        # 両方が代入してから中断する
  fibers.map(&:resume)         # 再開して読み出す
end

[:thread, :fiber].each do |level|
  ActiveSupport::IsolatedExecutionState.isolation_level = level
  p level => { threads: two_threads, fibers: two_fibers }
end`} />
      <Code lang="text" title="実行結果（CRuby 4.0.9、activesupport 8.1.4.1）" code={`{thread: {threads: ["user0", "user1"], fibers: ["user1", "user1"]}}
{fiber: {threads: ["user0", "user1"], fibers: ["user0", "user1"]}}`} />
      <p><code>:thread</code> では、スレッドごとの値は分かれましたが、同じスレッドの2つの Fiber は1つの値を共有し、先に代入した user0 が user1 で上書きされました。<code>:fiber</code> にすると、Fiber ごとに分かれました。Puma のように1本のスレッドが1件の要求を最後まで処理するサーバーでは既定の <code>:thread</code> で足ります。Falcon のように1本のスレッドの中で複数の要求を Fiber で処理するサーバーを使う場合は、<code>:fiber</code> に変えなければ要求の値が混ざります。Rails の設定のガイドも、Falcon のような Fiber で動くサーバーやジョブの処理系では <code>:fiber</code> にし、それ以外では <code>:thread</code> を使うよう書いています。<Ref n={18} /></p>
      <p>CurrentAttributes の値は Rails の Executor が要求の終わりに <code>clear_all</code> で消します（Executor の仕組みは <ChapterLink n={8} section="executor" />）。自分で作ったスレッドの中で Current を使う場合は、そのスレッドの処理を <code>Rails.application.executor.wrap</code> で囲むと、同じように始まりと終わりの処理が行われます。<Ref n={17} /></p>
      <p>クラスのレベルで <code>@cache ||= 計算</code> とメモ化する書き方も、最初の数回は複数のスレッドが同時に計算する可能性があります。結果が同じ値なら害はありませんが、ハッシュに少しずつ追加する場合は Mutex で囲むか、起動時に作り終えて freeze します。</p>
    </> },
    { id: 'rails', title: 'Puma の同時実行を負荷に合わせる', body: <>
      <p>Rails アプリケーションで時間の大半を DB や外部 API の応答待ちに使う場合、1本のスレッドが待つ間に別のスレッドが進めます。スレッド数を増やすと、同じプロセスで待機中の要求を多く抱えられます。各要求がデータベースへの接続を使うなら、プールが小さい場合には接続を待つ要求も増えます。<ChapterLink n={15} section="pool">コネクションプール</ChapterLink>の値を確認してからスレッド数を変えます。</p>
      <p>応答の生成で Ruby の計算を多く実行するなら、同じプロセスのスレッドだけを増やすより、ワーカーを複数にして別のコアで実行できる構成が候補です。gvl.rb の Ruby のループのように、スレッドを増やしても計算は速くならず、1件ごとの応答が遅くなるだけだからです。ただしプロセスごとに VM があり、接続プールやメモリーも必要です。CPU の上限に達していれば、プロセスを追加しても計算は速くならず、交代の費用も加わります。</p>
      <p>負荷を測るときは、同じ要求を送ってスレッド数とワーカー数を1つずつ変え、処理件数と待ち時間、CPU 使用率、DB の接続待ちを比較します。待ち時間が伸びた場合は、サーバーでスレッドが空くまでの時間と、Ruby を実行し始めた後の内訳を切り分けます。プロセスとスレッドを Puma がどう組み合わせるかは <ChapterLink n={23} section="cluster">ワーカー構成</ChapterLink>、ワーカー数と接続数の見積もりは <ChapterLink n={113} /> で扱います。</p>
      <p>画像の変換を受け付ける画面を考えます。受付の要求では仕事を登録して応答を返し、別プロセスのジョブとして変換を行うと、変換の時間が Web のスレッドを占有しなくなります。変換自体の CPU 時間はかかり続けます。ワーカーの上限や、Web とジョブが CPU を共有するかを設計してから変更します。</p>
      <p>複数の要求が同じ外部サービスを待つ場合、同時実行数を増やすと相手側の制限に達することがあります。エラー率や再試行数も待ち時間と合わせて観測し、アクセスを受け付ける数と外部へ送る数を必要に応じて別に制御します。</p>
    </> },
    { id: 'tradeoffs', title: '判断基準とトレードオフ', body: <>
      <p>この章で扱った単位と道具を、選ぶ場面ごとにまとめます。</p>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">やりたいこと</th><th scope="col">候補</th><th scope="col">確かめることと代償</th></tr></thead>
        <tbody>
          <tr><th scope="row">外部 API を複数同時に呼んで待ち時間を重ねる</th><td>Thread と Queue（または Fiber スケジューラー）</td><td>呼ぶ gem が待つ間に GVL を手放すか、スケジューラーに対応するか。相手の同時接続数の上限</td></tr>
          <tr><th scope="row">Ruby の計算を並列にする</th><td>プロセス（Puma のワーカー、ジョブのプロセス）、Ractor</td><td>プロセスはメモリーを多く使う。Ractor は共有できない値に触れず、Ruby 4.0 では実験的</td></tr>
          <tr><th scope="row">共有する値を複数のスレッドから更新する</th><td>Mutex、Queue</td><td>ロックの中で待たない。複数のプロセスやサーバーをまたぐ更新は DB の制約やロックで守る</td></tr>
          <tr><th scope="row">要求ごとの値をコードのあちこちから読む</th><td>CurrentAttributes</td><td>Fiber で要求を処理するサーバーなら isolation_level を :fiber にする。クラス変数や class_attribute には入れない</td></tr>
          <tr><th scope="row">列から1要素ずつ取り出す</th><td>Enumerator#next</td><td>Fiber の切り替えの分だけ each より遅い（この章の実測で約6倍）</td></tr>
        </tbody>
      </table></div>
      <p>スレッドを使うコードは並行に動かしたときにだけ失敗することが多く、1回の実行で問題が出なくても安全とは言えません。共有する値を減らし、受け渡しは Queue や戻り値で行い、残った共有の値だけを Mutex で守る、という順に考えると、確かめる範囲を小さくできます。これは筆者の意見です。</p>
      <Callout kind="note" title="関連する章">
        <ul>
          <li>プロセスとスレッドの実験、Puma の GVL の実測、スレッド安全性の再現：<ChapterLink n={23} section="process" />、<ChapterLink n={23} section="gvl" />、<ChapterLink n={23} section="thread-safety" /></li>
          <li>VM スタックとヒープ、GC：<ChapterLink n={97} /></li>
          <li>Executor とコードの再読み込み：<ChapterLink n={8} section="executor" /></li>
          <li>行ロックと同時更新：<ChapterLink n={15} section="pessimistic" /></li>
          <li>Puma と DB の同時処理能力の設計：<ChapterLink n={113} /></li>
        </ul>
      </Callout>
    </> },
  ],
  sources: [
    { title: 'Thread', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Thread.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: 'join・value・report_on_exception、Fiber ローカルの値とスレッド変数' },
    { title: 'Fiber', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Fiber.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: '中断、再開、終了、ブロックしない Fiber' },
    { title: 'Fiber::Scheduler', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Fiber/Scheduler.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: 'io_wait・kernel_sleep などの待ちを通知するフック' },
    { title: 'TracePoint', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/TracePoint.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: 'Fiber の切り替わりを検出する :fiber_switch イベント' },
    { title: 'thread.c', publisher: 'Ruby', url: `${RB}/thread.c`, accessed: '2026-11-27', version: '4.0.9', note: 'thread_default_quantum_ms（118行目）、rb_thread_call_without_gvl（1738〜1742行目）、RUBY_THREAD_TIMESLICE（5792行目）' },
    { title: 'NEWS for Ruby 4.0.0', publisher: 'Ruby', url: `${RB}/NEWS.md`, accessed: '2026-11-27', version: '4.0.9 のタグの NEWS.md', note: 'Ractor::Port の追加、Ractor.yield と Ractor#take の削除、Ractor の改善、Fiber::Scheduler の変更' },
    { title: 'Thread::Queue', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Thread/Queue.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: 'pop の待ち、close、SizedQueue' },
    { title: 'Thread::Mutex', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Thread/Mutex.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: 'synchronize' },
    { title: 'Thread::ConditionVariable', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Thread/ConditionVariable.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: 'wait・signal・broadcast' },
    { title: 'vm_insnhelper.c と insns.def', publisher: 'Ruby', url: `${RB}/vm_insnhelper.c#L446-L456`, accessed: '2026-11-27', version: '4.0.9', note: 'vm_pop_frame の RUBY_VM_CHECK_INTS（452行目）。insns.def の jump・branchif なども割り込みを調べる' },
    { title: 'ext/zlib/zlib.c', publisher: 'Ruby', url: `${RB}/ext/zlib/zlib.c#L1057-L1059`, accessed: '2026-11-27', version: '4.0.9', note: '圧縮の処理を GVL を手放して実行する' },
    { title: 'enumerator.c と Enumerator', publisher: 'Ruby', url: `${RB}/enumerator.c#L769-L799`, accessed: '2026-11-27', version: '4.0.9', note: 'next が Fiber を作って resume する。API は https://docs.ruby-lang.org/en/4.0/Enumerator.html' },
    { title: 'Ractor', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Ractor.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: '共有できる値、make_shareable、Port' },
    { title: 'activesupport/lib/active_support/railtie.rb', publisher: 'Ruby on Rails', url: `${GH}/activesupport/lib/active_support/railtie.rb#L16-L22`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'config.active_support.isolation_level を起動の最後に反映する' },
    { title: 'activesupport/lib/active_support/isolated_execution_state.rb', publisher: 'Ruby on Rails', url: `${GH}/activesupport/lib/active_support/isolated_execution_state.rb`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: ':thread と :fiber の切り替え。CurrentAttributes の instance は current_attributes.rb の102〜104行目、入れ物は execution_context.rb の111〜118行目' },
    { title: 'async 2.46.0', publisher: 'RubyGems.org', url: 'https://rubygems.org/gems/async/versions/2.46.0', accessed: '2026-11-27', version: '2.46.0', note: 'Fiber スケジューラーを実装した gem' },
    { title: 'Threading and Code Execution in Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/threading_and_code_execution.html', accessed: '2026-11-27', version: 'Rails 8.1', note: '自分で作ったスレッドを Rails.application.executor.wrap で囲む' },
    { title: 'Configuring Rails Applications（config.active_support.isolation_level）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/configuring.html#config-active-support-isolation-level', accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: '既定は :thread。Falcon のような Fiber で動くサーバーでは :fiber にする' },
  ],
}

export default chapter
