import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation04 } from '../explanations/ruby'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 4-1 map がブロックを要素ごとに実行する ---------- */
function MapBlockFigure() {
  const rows = [
    ['"Ruby入門"', '6'],
    ['"Rails入門"', '7'],
    ['"SQL入門"', '5'],
  ]
  return (
    <Svg
      id="4-1"
      w={720}
      h={260}
      label="titles.map { |title| title.size } の流れ。map は配列の要素を1つずつブロックに渡す。1回目は title に Ruby入門 が入り、ブロックの値は 6。2回目は Rails入門 で 7、3回目は SQL入門 で 5。map はブロックの値を集めて [6, 7, 5] を返す。each も要素ごとにブロックを実行するが、値は集めず、元の配列を返す"
    >
      <Box x={20} y={12} w={360} h={34} lines="titles.map { |title| title.size }" mono fs={12.5} fill="bg" />
      <T x={20} y={68} fs={11.5} tone="muted">
        要素
      </T>
      <T x={200} y={68} fs={11.5} tone="muted">
        ブロックを実行（要素ごとに1回）
      </T>
      <T x={470} y={68} fs={11.5} tone="muted">
        ブロックの値
      </T>
      {rows.map(([el, v], i) => {
        const y = 84 + i * 50
        return (
          <g key={el}>
            <Box x={20} y={y} w={130} h={34} lines={el} mono fs={12} fill="box4" />
            <Arrow x1={150} y1={y + 17} x2={198} y2={y + 17} />
            <Box x={200} y={y} w={240} h={34} lines={`title = ${el}`} mono fs={12} fill="box5" />
            <Arrow x1={440} y1={y + 17} x2={478} y2={y + 17} />
            <Box x={480} y={y} w={60} h={34} lines={v} mono fs={12.5} />
            <Arrow x1={540} y1={y + 17} x2={588} y2={135} />
          </g>
        )
      })}
      <Box x={590} y={107} w={110} h={56} lines={['map の戻り値', '[6, 7, 5]']} fs={12} fill="box4" accent />
      <T x={20} y={246} fs={11.5} tone="muted">
        each も要素ごとにブロックを実行するが、ブロックの値は集めず、titles をそのまま返す
      </T>
    </Svg>
  )
}

/* ---------- 図 4-2 ブロックを実行する時点 ---------- */
function BlockTimingFigure() {
  const rows = [
    ['titles.each do |title| … end', 'すぐに、要素の数だけ（3回）'],
    ['Article.transaction do … end', 'すぐに1回。SQL は BEGIN と COMMIT の間'],
    ['respond_to do |format| … end', 'すぐに1回。中のブロックは形式が合う1つだけ'],
    ['Rails.application.routes.draw do … end', 'config/routes.rb を読み込むときに1回'],
    ['before_action { … }', '保存しておき、アクションの前に毎回'],
  ]
  return (
    <Svg
      id="4-2"
      w={780}
      h={300}
      label="ブロックを受け取るメソッドと、ブロックを実行する時点の比較。each はすぐに要素の数だけ実行する。transaction はすぐに1回実行し、ブロックの中の SQL は BEGIN と COMMIT の間に入る。respond_to はすぐに1回実行し、中の format.html などのブロックは形式が合う1つだけを実行する。routes.draw は config/routes.rb を読み込むときに1回実行する。before_action はブロックを保存しておき、アクションを実行する前に毎回実行する"
    >
      <T x={20} y={18} fs={12} tone="muted">
        ブロックを渡すメソッド
      </T>
      <T x={420} y={18} fs={12} tone="muted">
        ブロックを実行する時点と回数
      </T>
      {rows.map(([code, when], i) => {
        const y = 34 + i * 50
        const later = i === rows.length - 1
        return (
          <g key={code}>
            <Box x={20} y={y} w={350} h={38} lines={code} mono fs={11.5} fill="bg" />
            <Arrow x1={370} y1={y + 19} x2={418} y2={y + 19} />
            <Box x={420} y={y} w={340} h={38} lines={when} fs={12} fill={later ? 'box5' : 'box'} accent={later} />
          </g>
        )
      })}
      <T x={20} y={290} fs={11.5} tone="muted">
        上の4つは受け取ったブロックをその場で実行し、before_action は保存して後で実行する
      </T>
    </Svg>
  )
}

/* ---------- 図 4-3 クロージャが変数を捕まえる ---------- */
function ClosureFigure() {
  return (
    <Svg
      id="4-3"
      w={600}
      h={250}
      label="counter メソッドを呼ぶと、ローカル変数 count を持つ領域が作られる。その中で作った2つの lambda、increment と read は、どちらも同じ count を参照する。counter メソッドが終わった後も、呼び出し元が inc と read を持っている間は count が残り、inc を2回呼ぶと read は 2 を返す"
    >
      <rect x={20} y={20} width={330} height={210} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={34} y={40} fs={12} tone="muted">
        counter メソッドの実行で作られた領域
      </T>
      <Box x={110} y={60} w={160} h={44} lines={['count', '0 → 1 → 2']} mono fill="box4" bold subTone="muted" />
      <Box x={40} y={160} w={130} h={40} lines="increment" mono />
      <Box x={200} y={160} w={130} h={40} lines="read" mono />
      <Arrow x1={105} y1={158} x2={160} y2={106} dashed />
      <Arrow x1={265} y1={158} x2={220} y2={106} dashed />
      <T x={64} y={130} fs={11.5} tone="muted">
        参照
      </T>
      <T x={260} y={130} fs={11.5} tone="muted">
        参照
      </T>

      <Box x={420} y={110} w={160} h={70} lines={['呼び出し元', 'inc, read = counter']} mono={false} fill="bg" subTone="muted" />
      <Arrow x1={418} y1={150} x2={352} y2={150} />
      <T x={500} y={98} fs={11.5} tone="muted" anchor="middle">
        2つの lambda を保持
      </T>
      <T x={430} y={210} fs={12} tone="muted">
        メソッドが終わっても
      </T>
      <T x={430} y={228} fs={12} tone="muted">
        count は残る
      </T>
    </Svg>
  )
}

/* ---------- 図 4-4 スコープゲート ---------- */
function ScopeGateFigure() {
  return (
    <Svg
      id="4-4"
      w={640}
      h={300}
      label="トップレベルのローカル変数 level は、class Gate の本体や def show の中からは見えない。class、module、def は新しいスコープを作るためである。一方、Class.new に渡したブロックや define_method に渡したブロックの中からは level が見える。ブロックは外側のスコープを引き継ぐためである"
    >
      <rect x={10} y={10} width={620} height={280} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={24} y={30} bold>
        トップレベル
      </T>
      <T x={150} y={30} mono fs={12.5}>
        level = "top"
      </T>

      <rect x={30} y={50} width={280} height={225} rx={8} fill="var(--fig-box)" stroke="var(--fig-line)" strokeWidth={2.5} />
      <T x={44} y={70} mono fs={12.5}>
        class Gate
      </T>
      <T x={44} y={92} fs={12} tone="danger">
        level は見えない（nil）
      </T>
      <rect x={50} y={110} width={240} height={110} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={2.5} />
      <T x={64} y={130} mono fs={12.5}>
        def show
      </T>
      <T x={64} y={152} fs={12} tone="danger">
        level は見えない（nil）
      </T>
      <T x={44} y={248} fs={11.5} tone="muted">
        太い枠：新しいスコープを作る（ゲート）
      </T>

      <rect x={330} y={50} width={280} height={225} rx={8} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={344} y={70} mono fs={12.5}>
        Class.new do
      </T>
      <T x={344} y={92} fs={12} tone="acc">
        level が見える
      </T>
      <rect x={350} y={110} width={240} height={110} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={364} y={130} mono fs={12.5}>
        define_method(:show) do
      </T>
      <T x={364} y={152} fs={12} tone="acc">
        level が見える
      </T>
      <T x={344} y={248} fs={11.5} tone="muted">
        破線の枠：外側のスコープを引き継ぐ（ブロック）
      </T>
    </Svg>
  )
}

/* ---------- 図 4-5 self とメソッドの定義先 ---------- */
function EvalFigure() {
  const rows: { code: string; self: string; target: string; fill: 'box' | 'box3' }[] = [
    { code: 'w.instance_eval { def only_me }', self: 'w', target: '#<Class:w>（w の特異クラス）', fill: 'box3' },
    { code: 'Widget.class_eval { def size }', self: 'Widget', target: 'Widget（インスタンスメソッド）', fill: 'box' },
    { code: 'Widget.instance_eval { def build }', self: 'Widget', target: '#<Class:Widget>（クラスメソッド）', fill: 'box3' },
  ]
  return (
    <Svg
      id="4-5"
      w={660}
      h={190}
      label="w.instance_eval のブロックでは self は w で、def は w の特異クラスにメソッドを定義する。Widget.class_eval のブロックでは self は Widget で、def は Widget のインスタンスメソッドを定義する。Widget.instance_eval のブロックでは self は Widget で、def は Widget の特異クラスにメソッドを定義し、クラスメソッドになる"
    >
      <T x={20} y={18} fs={12} tone="muted">
        呼び出し
      </T>
      <T x={330} y={18} fs={12} tone="muted" anchor="middle">
        ブロック内の self
      </T>
      <T x={410} y={18} fs={12} tone="muted">
        def の定義先
      </T>
      {rows.map((r, i) => {
        const y = 34 + i * 52
        return (
          <g key={r.code}>
            <Box x={20} y={y} w={262} h={38} lines={r.code} mono fs={11.5} fill="bg" />
            <T x={330} y={y + 19} anchor="middle" mono>
              {r.self}
            </T>
            <Arrow x1={366} y1={y + 19} x2={406} y2={y + 19} />
            <Box x={410} y={y} w={232} h={38} lines={r.target} fs={12} fill={r.fill} />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 4-6 routes.draw のブロックが実行される流れ ---------- */
function DslFigure() {
  return (
    <Svg
      id="4-6"
      w={640}
      h={250}
      label="config/routes.rb の Rails.application.routes.draw に渡したブロックは、RouteSet#draw から eval_block に渡される。eval_block は Mapper のインスタンスを作り、mapper.instance_exec(&block) でブロックを実行する。ブロックの中では self が mapper になるので、get や resources は mapper のメソッドとして呼ばれる。ブロックはクロージャなので、routes.rb のローカル変数も参照できる"
    >
      <Box x={20} y={20} w={280} h={78} lines={['# config/routes.rb', 'Rails.application.routes.draw do', '  resources :articles', 'end']} mono fs={11.5} fill="bg" align="start" />
      <Box x={360} y={20} w={260} h={40} lines="RouteSet#draw(&block)" mono fs={12.5} />
      <Box x={360} y={90} w={260} h={40} lines="RouteSet#eval_block(block)" mono fs={12.5} />
      <Box x={360} y={160} w={260} h={50} lines={['mapper.instance_exec(&block)', 'self = Mapper のインスタンス']} mono fs={12} fill="box5" subTone="muted" />
      <Arrow x1={300} y1={40} x2={358} y2={40} />
      <T x={329} y={28} fs={11} anchor="middle" tone="muted">
        ブロック
      </T>
      <Arrow x1={490} y1={60} x2={490} y2={88} />
      <Arrow x1={490} y1={130} x2={490} y2={158} />
      <Arrow d="M358,185 C 250,185 200,150 160,100" accent />
      <T x={24} y={140} fs={12} tone="acc">
        ブロックの中身を
      </T>
      <T x={24} y={158} fs={12} tone="acc">
        self を変えて実行
      </T>
      <T x={20} y={232} fs={12} tone="muted">
        resources は self（mapper）に対する呼び出し。routes.rb のローカル変数も参照できる
      </T>
    </Svg>
  )
}

/* ---------- 図（番号なし） with_log と yield の実行順 ---------- */
function YieldSequenceFigure() {
  // 列：呼び出し側 10〜186、with_log の本体 266〜466、ブロック 596〜770
  return (
    <Svg
      id="ch04-yield-sequence"
      w={780}
      h={380}
      label="yield_before_after.rb の with_log の実行順です。呼び出し側が with_log を呼ぶと、with_log の本体は「集計を開始」を表示し、result = yield の行で実行がブロックへ移ります。ブロックは「ブロックの中」を表示し、最後の式 [100, 250, 400].sum の値 750 が yield の戻り値として result に入ります。with_log の本体は次の行から続けて「集計を終了」を表示し、最後に result の 750 を返すので、呼び出し側の total は 750 です"
    >
      <Box x={10} y={10} w={176} h={34} lines="呼び出し側（トップレベル）" fs={12} fill="bg" />
      <Box x={266} y={10} w={200} h={34} lines="with_log の本体" fs={12} fill="bg" />
      <Box x={596} y={10} w={174} h={34} lines="ブロック（do … end）" fs={12} fill="bg" />

      <Box x={10} y={62} w={176} h={48} lines={['total = with_log("集計")', 'do … end']} mono fs={11.5} />
      <Arrow x1={186} y1={86} x2={264} y2={86} />
      <T x={226} y={74} fs={11.5} tone="muted" anchor="middle">
        呼び出す
      </T>
      <Box x={266} y={62} w={200} h={48} lines={['puts "#{label}を開始"', '出力：集計を開始']} mono fs={12.5} subTone="muted" />
      <Arrow x1={366} y1={110} x2={366} y2={126} />

      <Box x={266} y={128} w={200} h={104} lines="result = yield" mono fs={12} fill="box5" accent />
      <Arrow x1={466} y1={150} x2={594} y2={150} accent />
      <T x={531} y={138} fs={11.5} tone="acc" anchor="middle">
        ブロックを実行
      </T>
      <Box x={596} y={128} w={174} h={44} lines={['puts "ブロックの中"', '出力：ブロックの中']} mono fs={12.5} subTone="muted" />
      <Arrow x1={683} y1={172} x2={683} y2={186} />
      <Box x={596} y={188} w={174} h={44} lines={['[100, 250, 400].sum', '最後の式の値は 750']} mono fs={12.5} subTone="muted" />
      <Arrow x1={596} y1={210} x2={468} y2={210} accent />
      <T x={531} y={198} fs={11.5} tone="acc" anchor="middle">
        750 を返す
      </T>

      <Arrow x1={366} y1={232} x2={366} y2={248} />
      <Box x={266} y={250} w={200} h={48} lines={['puts "#{label}を終了"', '出力：集計を終了']} mono fs={12.5} subTone="muted" />
      <Arrow x1={366} y1={298} x2={366} y2={314} />
      <Box x={266} y={316} w={200} h={48} lines={['result', 'with_log の戻り値は 750']} mono fs={12.5} subTone="muted" />
      <Arrow x1={266} y1={340} x2={188} y2={340} />
      <T x={226} y={328} fs={11.5} tone="muted" anchor="middle">
        750 を返す
      </T>
      <Box x={10} y={322} w={176} h={36} lines="total に 750 が入る" fs={12} />
    </Svg>
  )
}

/* ---------- 図（番号なし） has_many のスコープを arity で分ける ---------- */
function BuildScopeFigure() {
  // 左の列 20〜370（引数のない lambda）、右の列 410〜760（引数を1つ取る lambda）
  return (
    <Svg
      id="ch04-build-scope"
      w={780}
      h={450}
      label="has_many に書いた lambda が保存されてから実行されるまでを、引数の数で左右に分けた図です。build_scope は if scope && scope.arity == 0 で分岐します。左の -> { order(:created_at) } は arity が 0 なので、返すのは proc { instance_exec(&scope) } で包んだ通常の Proc です。右の ->(article) { where(...) } は arity が 1 なので、lambda をそのまま返します。関連を読み込むときの呼び出しは、どちらも relation.instance_exec(owner, &scope) です。左では包んだ Proc が owner を使わず、instance_exec(&scope) で元の lambda を引数なしで実行し、右では owner が lambda の引数 article に入ります。どちらも self は relation です。左の lambda を包まずにこの形で実行すると、引数が1つ多いので ArgumentError になります"
    >
      <T x={20} y={14} fs={12} tone="muted">
        has_many の2番目の引数に書いた lambda（build_scope の引数 scope）
      </T>
      <Box x={20} y={28} w={350} h={48} lines={['-> { order(:created_at) }', 'arity は 0']} mono fs={12.5} fill="bg" subTone="muted" />
      <Box x={410} y={28} w={350} h={48} lines={['->(article) { where(...) }', 'arity は 1']} mono fs={12.5} fill="bg" subTone="muted" />
      <Arrow x1={195} y1={76} x2={318} y2={105} />
      <Arrow x1={585} y1={76} x2={462} y2={105} />

      <Box x={230} y={106} w={320} h={48} lines={['build_scope', 'if scope && scope.arity == 0']} mono fs={12} />
      <Arrow x1={300} y1={154} x2={197} y2={196} />
      <T x={236} y={168} fs={11.5} tone="muted" anchor="end">
        arity が 0
      </T>
      <Arrow x1={480} y1={154} x2={583} y2={196} />
      <T x={544} y={168} fs={11.5} tone="muted">
        それ以外
      </T>

      <Box x={20} y={198} w={350} h={48} lines={['proc { instance_exec(&scope) }', '通常の Proc で包んで返す']} mono fs={12.5} fill="box5" subTone="muted" />
      <Box x={410} y={198} w={350} h={48} lines={['scope', 'lambda をそのまま返す']} mono fs={12.5} fill="bg" subTone="muted" />

      <Arrow x1={195} y1={246} x2={195} y2={296} />
      <Arrow x1={585} y1={246} x2={585} y2={296} />
      <T x={390} y={271} fs={12} tone="muted" anchor="middle">
        関連を読み込むとき（reflection.rb の scope_for）
      </T>

      <Box x={20} y={298} w={350} h={36} lines="relation.instance_exec(owner, &scope)" mono fs={12} fill="bg" />
      <Box x={410} y={298} w={350} h={36} lines="relation.instance_exec(owner, &scope)" mono fs={12} fill="bg" />
      <Arrow x1={195} y1={334} x2={195} y2={352} />
      <Arrow x1={585} y1={334} x2={585} y2={352} />

      <Box x={20} y={354} w={350} h={64} lines={['owner を使わず、instance_exec(&scope) で', '元の lambda を引数なしで実行', 'self は relation']} fs={12} />
      <Box x={410} y={354} w={350} h={64} lines={['owner が lambda の引数 article に入る', 'self は relation']} fs={12} />

      <T x={20} y={438} fs={11.5} tone="danger">
        左の lambda を包まずにこの形で実行すると、引数が1つ多いので ArgumentError
      </T>
    </Svg>
  )
}

const ch04: Chapter = {
  number: 4,
  part: 1,
  title: 'ブロック・Proc・lambda とスコープ',
  summary:
    '配列の each に渡した処理は要素ごとにすぐ動きます。一方、Rails には、受け取った処理を後で呼ぶメソッドもあります。ブロックをいつ、どのオブジェクトを相手に実行するかで、同じ書き方の意味がどう変わるかを確かめます。',
  goals: [
    'do と end で囲んだ処理に、どの値がいつ渡るかを追える',
    'ブロックを Proc として保存する例を読み、Proc と lambda の引数や return の違いを説明できる',
    'ブロックから読めるローカル変数と、実行時の self が持つ値を区別できる',
    'routes.rb の中で、誰に対して get などのメソッドを呼んでいるかを確かめられる',
  ],
  prerequisites: [2, 3],
  sections: [
    {
      id: 'block-basics',
      title: 'メソッドにブロックを渡す',
      body: (
        <>
          <p>
            Ruby の配列には、要素を1つずつ取り出して処理する <code>each</code> メソッドがあります。each の後ろに <code>do … end</code>{' '}
            で囲んだコードを書くと、each は配列の要素を1つずつそのコードに渡して実行します。このように、メソッドを呼ぶときに付けて渡すコードのまとまりを<Term en="block">ブロック</Term>と呼びます
            <Ref n={1} />。
          </p>
          <Code
            lang="ruby"
            title="block_basics.rb"
            code={`
titles = ["Ruby入門", "Rails入門", "SQL入門"]

titles.each do |title|
  puts "タイトル: #{title}"
end

sizes = titles.map { |title| title.size }
p sizes

rails_only = titles.select { |title| title.start_with?("R") }
p rails_only

3.times { |i| puts "#{i}回目" }
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
タイトル: Ruby入門
タイトル: Rails入門
タイトル: SQL入門
[6, 7, 5]
["Ruby入門", "Rails入門"]
0回目
1回目
2回目
`}
          />
          <p>
            each は要素の数だけ、つまり3回ブロックを実行し、そのたびに要素を <code>title</code> に入れました。<code>|title|</code> はブロックの引数です。縦棒の間に書いた名前で、メソッドから渡された値を受け取ります。名前は自由に決められます。
          </p>
          <p>
            ブロックは <code>do … end</code> のほかに、<code>{'{ … }'}</code> でも書けます。どちらも同じブロックです。この例では1行で書けるブロックを <code>{'{ … }'}</code>{' '}
            で、複数行のブロックを <code>do … end</code> で書いています。
          </p>
          <p>
            <code>map</code> は要素ごとにブロックを実行し、ブロックの最後の式の値を集めた新しい配列を返します（図 4-1）。<code>title.size</code> は文字数を返すので、<code>[6, 7, 5]</code>{' '}
            になりました。<code>select</code> はブロックの値が真になった要素だけを集めます
            <Ref n={12} />。<code>start_with?("R")</code> は文字列が R で始まるかどうかを返します。<code>3.times</code>{' '}
            は 0、1、2 を順にブロックに渡して3回実行します。どのメソッドでも、ブロックを何回、どの値で実行するかはメソッドが決め、1回ごとに何をするかは呼び出す側がブロックに書きます。
          </p>
          <Figure n="4-1" title="map がブロックを要素ごとに実行する" caption="block_basics.rb の titles.map の流れ。">
            <MapBlockFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'rails-blocks',
      title: 'Rails でブロックを書く場面',
      body: (
        <>
          <p>
            Rails のアプリケーションでも、ブロックを渡すメソッドを多く使います。どのメソッドも受け取ったブロックをいつ、何回実行するかを自分で決めています。デモのアプリで代表的な例を確かめます。
          </p>
          <h3>routes.rb の draw</h3>
          <p>
            config/routes.rb は、URL とコントローラーのアクションの対応（ルーティング）を書くファイルです。ファイルの全体が <code>Rails.application.routes.draw</code>{' '}
            に渡すブロックになっています。
          </p>
          <Code
            lang="ruby"
            title="config/routes.rb（デモのアプリ。一部を省略）"
            code={`
Rails.application.routes.draw do
  resources :articles, only: [:index, :show] do
    resources :comments, only: [:new, :create]
  end
  get "up" => "rails/health#show", as: :rails_health_check
  # …（検証用のルートを省略）
end
`}
          />
          <p>
            draw は config/routes.rb を読み込むときにこのブロックを1回実行します。ブロックの中の <code>resources</code> や <code>get</code> の呼び出しが、URL とアクションの対応を1つずつ登録します
            <Ref n={13} />。登録された対応は <code>bin/rails routes</code> で表示できます。
          </p>
          <Code
            lang="text"
            title="bin/rails routes の出力（デモのアプリ。一部を省略）"
            code={`
$ bin/rails routes -c articles
         Prefix Verb URI Pattern                    Controller#Action
       articles GET  /articles(.:format)            articles#index
        article GET  /articles/:id(.:format)        articles#show

$ bin/rails routes -c comments
             Prefix Verb URI Pattern                                  Controller#Action
   article_comments POST /articles/:article_id/comments(.:format)     comments#create
new_article_comment GET  /articles/:article_id/comments/new(.:format) comments#new
`}
          />
          <p>
            Verb は HTTP の要求の種類で、GET はページの取得、POST はフォームの送信などに使います。URI Pattern の <code>:id</code> の部分には記事の番号などが入ります。
            <code>resources :articles, only: [:index, :show]</code> の1行から、<code>/articles</code> を articles#index（ArticlesController の index アクション）に、
            <code>/articles/:id</code> を articles#show に対応させる2つのルートができました。resources に渡したブロックの中の <code>resources :comments</code> からは、記事の URL の下に続く{' '}
            <code>/articles/:article_id/comments</code> のルートができています。
          </p>
          <h3>transaction</h3>
          <p>
            データベースのトランザクションは、複数の変更をまとめて、すべて成功したときだけ確定し、途中で失敗したらすべて取り消す仕組みです（<ChapterLink n={38} section="transaction" />
            ）。Rails では <code>transaction</code> メソッドにブロックを渡して使います
            <Ref n={14} />。デモのアプリで、実行した SQL のログを画面に出しながら試しました。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（デモのアプリ）"
            code={`
ActiveRecord::Base.logger = Logger.new($stdout)   # SQL のログを画面に出す
result = Article.transaction do
  puts "ブロックの1行目"
  first = Article.where(id: 1).exists?
  second = Article.where(id: 2).exists?
  puts "ブロックの最後の行"
  [first, second]
end
p result
`}
          />
          <Code
            lang="text"
            title="出力（ログの書式を整え、末尾の /*application='Demo'*/ を省略）"
            code={`
ブロックの1行目
  TRANSACTION (0.9ms)  BEGIN
  Article Exists? (0.8ms)  SELECT 1 AS one FROM \`articles\` WHERE \`articles\`.\`id\` = 1 LIMIT 1
  Article Exists? (0.6ms)  SELECT 1 AS one FROM \`articles\` WHERE \`articles\`.\`id\` = 2 LIMIT 1
ブロックの最後の行
  TRANSACTION (0.3ms)  COMMIT
[true, true]
`}
          />
          <p>
            BEGIN はトランザクションを始める SQL、COMMIT は確定する SQL です。transaction はブロックをすぐに1回実行し、ブロックの中で送った2つの SQL は BEGIN と COMMIT の間に入りました。ログでは、BEGIN
            はブロックの1行目より後、最初の SQL の直前に出ています。transaction の戻り値はブロックの最後の式の値（ここでは <code>[first, second]</code>）です。
          </p>
          <h3>respond_to</h3>
          <p>
            コントローラーの <code>respond_to</code> は、要求が求める形式（HTML か JSON かなど）に合わせて、返す応答を選ぶメソッドです
            <Ref n={15} />。デモの CommentsController では、コメントを保存した後に次のように使っています。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/comments_controller.rb（デモのアプリ。create アクションの一部）"
            code={`
    if @comment.save
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to @article }
      end
`}
          />
          <p>
            respond_to のブロックは引数 <code>format</code> を受け取ります。<code>format.turbo_stream</code> や <code>format.html</code>{' '}
            は形式ごとの処理を登録するメソッドで、要求の形式に合ったものだけが実行されます。turbo_stream はページの一部だけを書き換えるための形式です。動きを確かめるため、HTML と JSON を返す小さなコントローラーを bin/rails runner の中で定義し、要求の形式を変えて呼びました。要求の形式は要求に付ける
            Accept ヘッダー（ブラウザーなどが受け取りたい形式を伝える情報）で指定します。
          </p>
          <p>
            コードの後半では、<code>Rack::MockRequest.env_for</code> で要求の内容を表す Hash を作り、<code>Basics04Controller.action(:show).call(env)</code>{' '}
            でその要求に対して show アクションを実行しています。戻り値はステータスコード、ヘッダー、本文の3つで、最後の puts がこの3つを1行に表示します。要求を Hash で渡して3つの値を受け取る呼び出し方は
            <ChapterLink n={6} />で説明します。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（デモのアプリ）"
            code={`
class Basics04Controller < ActionController::Base
  def show
    respond_to do |format|
      puts "respond_to のブロック: format は #{format.class}"
      format.html { render plain: "HTML を返す" }
      format.json { render json: { message: "JSON を返す" } }
    end
  end
end

# ブラウザーの代わりに、Accept を変えた要求を作ってアクションを呼ぶ
["text/html", "application/json"].each do |accept|
  env = Rack::MockRequest.env_for("/basics04", "HTTP_ACCEPT" => accept)
  status, headers, body = Basics04Controller.action(:show).call(env)
  puts "Accept: #{accept} => #{status} #{headers["content-type"]} #{body.each.to_a.join}"
end
`}
          />
          <Code
            lang="text"
            title="出力"
            code={`
respond_to のブロック: format は ActionController::MimeResponds::Collector
Accept: text/html => 200 text/html; charset=utf-8 HTML を返す
respond_to のブロック: format は ActionController::MimeResponds::Collector
Accept: application/json => 200 application/json; charset=utf-8 {"message":"JSON を返す"}
`}
          />
          <p>
            respond_to のブロックはどちらの要求でも1回実行されました。format には、Rails が用意した ActionController::MimeResponds::Collector のオブジェクトが入っています。text/html
            を求める要求では format.html のブロックが、application/json を求める要求では format.json のブロックが実行され、応答の本文が変わりました。
          </p>
          <h3>before_action のブロック</h3>
          <p>
            ブロックをすぐには実行せず、保存しておいて後で実行するメソッドもあります。デモの ArticlesController の先頭には{' '}
            <code>before_action {'{ request.variant = :phone if params[:phone] }'}</code> と書いてあります（URL に phone が付いていれば、スマートフォン用のテンプレートを選ぶ設定です）。before_action
            はこのブロックを保存し、アクションを実行する前に毎回実行します
            <Ref n={16} />。
          </p>
          <p>
            図 4-2 に、ここまでのメソッドがブロックを実行する時点をまとめます。ブロックを受け取るメソッドを読むときは、そのメソッドがブロックをすぐに実行するのか、保存して後で実行するのか、何回実行するのかを確かめます。
          </p>
          <Figure n="4-2" title="ブロックを実行する時点" caption="この節の実行例と、各メソッドの説明書をもとにまとめた表。">
            <BlockTimingFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'local-scope',
      title: 'ローカル変数が見える範囲',
      body: (
        <>
          <p>
            <code>total = 0</code> のように、名前に値を代入して作る変数を<Term en="local variable">ローカル変数</Term>と呼びます。ローカル変数を使える範囲は、作った場所によって決まっています。この範囲を
            <Term en="scope">スコープ</Term>と呼びます
            <Ref n={11} />。ブロックの内側と外側、メソッドの内側と外側で確かめます。
          </p>
          <Code
            lang="ruby"
            title="block_scope.rb"
            code={`
total = 0
[100, 250, 400].each do |price|
  tax = price / 10
  total += price + tax   # ブロックの外の total を書き換える
end
p total
p defined?(tax)    # ブロックの中で作った変数
p defined?(price)  # ブロックの引数

def show_total
  total            # メソッドの外の total を読もうとする
end

begin
  show_total
rescue NameError => e
  puts e.message
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
825
nil
nil
undefined local variable or method 'total' for main
`}
          />
          <p>
            ブロックの中から、ブロックの外で作った total を読み書きできました。3回の実行で値段と税を足し、total は 825 になっています。一方、ブロックの中で作った tax と、ブロックの引数の price
            は、ブロックの外では使えません。<code>defined?</code> は名前が変数やメソッドとして使えるかを調べるもので、使えなければ nil を返します。
          </p>
          <p>
            def で定義したメソッドの中からは、メソッドの外のローカル変数は見えません。show_total の中の total はローカル変数としてもメソッドとしても見つからず、NameError（名前が見つからないことを示す例外）になりました
            <Ref n={4} />。メッセージの末尾の <code>for main</code> は、名前を探した相手がトップレベルの self である main だったことを表します（
            <ChapterLink n={2} section="self" />）。メソッドの中で外の値を使いたいときは、引数で渡します。
          </p>
          <p>
            ブロックの中から外のローカル変数を使えるので、each や transaction のブロックでは、ブロックの前に用意した変数をそのまま使えます。ブロックが外の変数を参照する性質は、ブロックを保存して後で実行するときにも残ります。これは「クロージャ：作られた場所の変数を参照する」の節で扱います。
          </p>
          <p>
            ここまでは、each や transaction のように Ruby や Rails が用意したメソッドにブロックを渡してきました。次の節ではブロックを受け取るメソッドを自分で定義し、受け取ったブロックを{' '}
            <code>yield</code> で実行します。
          </p>
        </>
      ),
    },
    {
      id: 'block-yield',
      title: 'ブロックと yield',
      body: (
        <>
          <p>
            ブロックはメソッド呼び出しに付けて渡すコードのまとまりです。<code>do ... end</code> または <code>{'{ ... }'}</code>{' '}
            で書きます。メソッドの中では <code>yield</code> でブロックを実行でき、<code>yield</code> に渡した値がブロックの引数になり、ブロックの最後の式の値が <code>yield</code>{' '}
            の戻り値になります
            <Ref n={1} />。
          </p>
          <Code
            lang="ruby"
            code={`
def with_timing
  return "ブロックがありません" unless block_given?
  result = yield 3        # ブロックを実行し、引数に 3 を渡す
  "結果=#{result}"
end

with_timing { |n| n * 2 } # => "結果=6"
with_timing               # => "ブロックがありません"
`}
          />
          <p>
            ブロックはメソッドの引数リストとは別枠で渡され、1回の呼び出しに1つだけ付けられます。<code>block_given?</code> でブロックが渡されたかどうかを調べられます。Rails のコードでは{' '}
            <code>transaction do ... end</code>、<code>respond_to do |format| ... end</code>、<code>run_callbacks(:save) {'{ ... }'}</code>{' '}
            （第5章で扱う、コールバックを実行するメソッド）など、「前後の処理はメソッドが行い、間の処理を呼び出し側が渡す」形でよく使われます。
          </p>
          <p>
            この形を小さなメソッドで確かめます。次の <code>with_log</code> はブロックを実行する前と後にメッセージを表示します。
          </p>
          <Code
            lang="ruby"
            title="yield_before_after.rb"
            code={`
def with_log(label)
  puts "#{label}を開始"
  result = yield            # ここでブロックを実行する
  puts "#{label}を終了"
  result
end

total = with_log("集計") do
  puts "ブロックの中"
  [100, 250, 400].sum
end
p total

def call_block
  yield
end

begin
  call_block                # ブロックを付けずに呼ぶ
rescue LocalJumpError => e
  puts "#{e.class}: #{e.message}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
集計を開始
ブロックの中
集計を終了
750
LocalJumpError: no block given (yield)
`}
          />
          <p>
            次の図は、yield_before_after.rb の前半で with_log を呼んでから total に 750 が入るまでを、上から下へ時間の順に並べたものです。列は左から呼び出し側、with_log
            の本体、ブロックで、横向きの矢印は実行がほかの列へ移る所を表します。
          </p>
          <Figure
            title="with_log と yield の実行順"
            caption="模式図です。縦の矢印は同じ列の中で次の行へ進むこと、強調色の矢印は with_log の本体とブロックの間で実行が移ることを表します。箱の2行目は、その行の出力や値です。"
          >
            <YieldSequenceFigure />
          </Figure>
          <p>
            最初の3行は「集計を開始」「ブロックの中」「集計を終了」の順に出ています。with_log の本体が yield の行まで進み、そこでブロックを実行し、ブロックが終わると yield
            の次の行から続きを実行しました。ブロックの最後の式の値 750 は yield の戻り値として <code>result</code> に入り、with_log の戻り値になっています。「Rails でブロックを書く場面」の節の
            transaction も、ブロックの実行が終わった後に COMMIT を送り、ブロックの最後の式の値を戻り値にしていました。メソッドがブロックの実行の前後に処理を足すという形は with_log と同じです。
          </p>
          <p>
            最後の行の <code>LocalJumpError</code> は、ブロックを付けずに呼んだメソッドの中で yield を実行したときの例外です。<code>no block given (yield)</code>{' '}
            というメッセージが出たら、呼び出し側でブロックを付け忘れていないかを確かめます。ブロックが無くても動くメソッドにするときは、最初の例のように <code>block_given?</code> で処理を分けます。
          </p>
        </>
      ),
    },
    {
      id: 'block-to-proc',
      title: 'ブロックと Proc を受け渡す',
      body: (
        <>
          <p>
            ブロックそのものはオブジェクトではありません。メソッドの仮引数に <code>&block</code> を書くと、渡されたブロックが <code>Proc</code>{' '}
            オブジェクトに変換されて変数に入ります。Proc にすると、変数に保存したり、ほかのメソッドに渡したり、後で何度でも呼び出したりできます
            <Ref n={2} />。
          </p>
          <Code
            lang="ruby"
            code={`
def capture(&block) = block

pr = capture { |x| x + 1 }
pr.class     # => Proc
pr.call(1)   # => 2

def apply_twice(x, &block) = block.call(block.call(x))
apply_twice(1) { |n| n * 10 } # => 100
`}
          />
          <p>
            <code>capture</code> は受け取ったブロックを Proc にして、そのまま返すだけのメソッドです。<code>pr.class</code> が Proc なので、ブロックがオブジェクトになって変数 pr
            に入ったことが分かります。<code>pr.call(1)</code> はブロックの引数 x に 1 を渡して実行します。<code>apply_twice</code> は yield の代わりに <code>block.call</code>{' '}
            でブロックを2回実行しています。内側の <code>block.call(1)</code> が 10 を返し、その 10 を外側の <code>block.call</code> に渡すので、結果は 100 になります。
          </p>
          <h3>Proc に保存した処理を map のブロックとして渡す</h3>
          <p>
            配列の <code>map</code> は、各要素をブロックに渡し、その結果を集めた新しい配列を返します。
            次の例では、<code>word</code> に順に <code>"a"</code> と <code>"b"</code> が入り、<code>upcase</code> で大文字にします。
          </p>
          <Code
            lang="ruby"
            code={`
words = ["a", "b"]
words.map { |word| word.upcase } # => ["A", "B"]
`}
          />
          <p>
            この「受け取った文字列を大文字にする処理」を、<code>proc {'{ ... }'}</code> で Proc オブジェクトにして、変数 <code>uppercase</code> に保存することもできます。
            <code>uppercase.call("a")</code> は、その処理に <code>"a"</code> を渡して実行します。
          </p>
          <Code
            lang="ruby"
            code={`
uppercase = proc { |word| word.upcase }
uppercase.call("a") # => "A"

words = ["a", "b"]
words.map(&uppercase) # => ["A", "B"]
`}
          />
          <p>
            最後の行の <code>&uppercase</code> は、「この Proc を、map に渡すブロックとして使う」という指定です。
            上の <code>map {'{ |word| word.upcase }'}</code> と、各要素に行う処理は同じです。
            メソッド定義の <code>def capture(&block)</code> ではブロックを Proc として受け取り、呼び出しの <code>map(&uppercase)</code> では Proc をブロックとして渡します。
            <code>&</code> がどちらに書かれているかで役割を区別します<Ref n={1} />。
          </p>
          <h3>map(&:upcase) を分解する</h3>
          <p>
            <code>:upcase</code> は、<code>upcase</code> という名前を表すシンボルです。
            これに <code>to_proc</code> を呼ぶと、「受け取ったオブジェクトの upcase メソッドを呼ぶ Proc」が得られます。
            その時点では、文字列の変換はまだ実行しません。次の <code>call("a")</code> で <code>"a".upcase</code> が実行されます<Ref n={10} />。
          </p>
          <Code
            lang="ruby"
            code={`
uppercase = :upcase.to_proc
uppercase.call("a") # => "A"

words = ["a", "b"]
words.map(&uppercase) # => ["A", "B"]
words.map(&:upcase)   # => ["A", "B"]
`}
          />
          <p>
            最後の <code>&:upcase</code> は、<code>&</code> と <code>:upcase</code> に分けて読みます。
            呼び出しの <code>&</code> にシンボルを渡すと、Ruby がその <code>to_proc</code> を呼び、得られた Proc をブロックとして使います。
            そのため、この例の <code>words.map(&:upcase)</code> は <code>words.map {'{ |word| word.upcase }'}</code> と同じ結果になります<Ref n={2} />。
          </p>
          <h3>ブロックの引数名を省略する記法</h3>
          <p>
            <code>_1</code> は番号指定パラメーター（Ruby 2.7 以降）、<code>it</code> は引数が1つのブロックで使える暗黙のパラメーター（Ruby 3.4 以降）で、どちらもブロックの第1引数を表します
            <Ref n={2} />。
          </p>
          <Code
            lang="ruby"
            code={`
[1, 2].map { |n| n * 3 } # => [3, 6]
[1, 2].map { _1 * 3 }    # => [3, 6]
[1, 2].map { it * 3 }    # => [3, 6]
`}
          />
          <p>
            次節で説明する <code>-&gt; {'{ ... }'}</code> は lambda を作る記法です。Rails で <code>before_action -&gt; {'{ ... }'}</code> や <code>scope :published, -&gt; {'{ ... }'}</code>{' '}
            のように Proc を渡すと、Rails はそれをオブジェクトとして保存しておき、リクエストのたびやスコープを呼ぶたびに実行します。保存できることが、ブロックを Proc にする目的です。
          </p>
        </>
      ),
    },
    {
      id: 'proc-lambda',
      title: 'Proc と lambda の違い',
      body: (
        <>
          <p>
            前の節では、処理を Proc オブジェクトにして変数に保存し、<code>call</code> で実行しました。
            <code>lambda</code>（ラムダ）も、同じように処理を保存して実行するためのものです。まず、数を2倍にする処理で比べます。
          </p>
          <Code
            lang="ruby"
            title="どちらも、call に渡した数を2倍にする"
            code={`
double_proc = proc { |number| number * 2 }
double_lambda = lambda { |number| number * 2 }

double_proc.call(3)   # => 6
double_lambda.call(3) # => 6
`}
          />
          <p>
            <code>|number|</code> は受け取る値の名前です。<code>call(3)</code> の3が <code>number</code> に入り、<code>number * 2</code> が実行されます。
            どちらも、最後に実行した式の値である6を返します。ここでは <code>return</code> を書く必要はありません。
          </p>
          <p>
            lambda も Proc クラスのオブジェクトです。この節では、<code>proc {'{ ... }'}</code> で作るものを「通常の Proc」、
            <code>lambda {'{ ... }'}</code> で作るものを「lambda」と呼び分けます。
            主な違いは渡す引数の数が合わないときの動作と、中で return を書いたときに終了する範囲の2つです<Ref n={2} />。
          </p>

          <h3>違い①：引数の数が合わないとき</h3>
          <p>
            次の処理は、<code>|name|</code> と書いているので、名前を1つ受け取るつもりで作っています。
            通常の Proc は値が渡されなければ <code>name</code> を <code>nil</code> にし、余分な値があれば使わずに処理を続けます。
          </p>
          <Code
            lang="ruby"
            title="通常の Proc：足りない値は nil、余分な値は使わない"
            code={`
read_name = proc { |name| name }

read_name.call("田中")         # => "田中"
read_name.call()               # => nil
read_name.call("田中", "佐藤") # => "田中"
`}
          />
          <p>
            lambda は必要な引数が足りないと処理の中身を実行せず、<code>ArgumentError</code>（引数の渡し方が不正なことを示す例外）になります。
            次の例では、必要な名前を渡し忘れた時点で分かります。
          </p>
          <Code
            lang="ruby"
            title="lambda：1つ必要なのに0個なら、その呼び出しでエラーになる"
            code={`
read_name = lambda { |name| name }

read_name.call("田中") # => "田中"
read_name.call()
# ArgumentError: wrong number of arguments (given 0, expected 1)
`}
          />
          <p>
            エラーの <code>given 0</code> は「渡された数は0個」、<code>expected 1</code> は「必要な数は1個」という意味です。
            この lambda に名前を2つ渡した場合も、今度は1個多いので ArgumentError になります。
            通常の Proc は引数が不足しても呼び出せますが、その後の処理が <code>nil</code> を扱えずに失敗することはあります。
          </p>

          <h3>違い②：return で終了する範囲</h3>
          <p>
            普通のメソッドに書く <code>return</code> は、そのメソッドを途中で終了し、呼び出し元へ値を返します。
            通常の Proc の中に書いた <code>return</code> も、その Proc を作ったメソッドを終了します。
            次の例では <code>greet_with_proc</code> の中で Proc を作っているので、終了するのは greet_with_proc です。
          </p>
          <Code
            lang="ruby"
            title="通常の Proc：greeting.call から、そのままメソッドの外へ戻る"
            code={`
def greet_with_proc
  greeting = proc { return "こんにちは" }
  message = greeting.call
  "#{message}、Ruby" # この行は実行されない
end

greet_with_proc # => "こんにちは"
`}
          />
          <ol>
            <li><code>greet_with_proc</code> を呼ぶと、Proc を作って <code>greeting</code> に保存します。この時点では中の return は実行しません。</li>
            <li><code>greeting.call</code> で Proc を実行すると、<code>return "こんにちは"</code> に到達します。</li>
            <li>そこで <code>greet_with_proc</code> 全体が終了し、呼び出し元へ <code>"こんにちは"</code> を返します。<code>message</code> への結果の代入も、最後の行も実行されません。</li>
          </ol>
          <p>
            次は <code>proc</code> を <code>lambda</code> に変えた例です。
            lambda の中の <code>return</code> は、その lambda の実行だけを終了します。
            そのため、<code>greeting.call</code> が値を返した後、メソッドの続きを実行します。
          </p>
          <Code
            lang="ruby"
            title="lambda：greeting.call の結果を受け取り、次の行へ進む"
            code={`
def greet_with_lambda
  greeting = lambda { return "こんにちは" }
  message = greeting.call
  "#{message}、Ruby" # この行も実行される
end

greet_with_lambda # => "こんにちは、Ruby"
`}
          />
          <ol>
            <li><code>greeting.call</code> で lambda を実行し、中の <code>return "こんにちは"</code> に到達します。</li>
            <li>lambda が終了し、call の結果である <code>"こんにちは"</code> が <code>message</code> に入ります。</li>
            <li>続く行で <code>"こんにちは、Ruby"</code> を作ります。これがメソッドの最後の式なので、greet_with_lambda の戻り値になります。</li>
          </ol>
          <p>
            この違いが出るのは、例のように明示的な <code>return</code> を書いたときです。
            通常の Proc でも <code>proc {'{ "こんにちは" }'}</code> のように最後の式だけを書けば、<code>call</code> に値を返して、呼び出した側の処理が続きます<Ref n={2} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>比べること</th><th>通常の Proc</th><th>lambda</th></tr></thead>
              <tbody>
                <tr><td>処理を実行する方法</td><td>call で実行する</td><td>call で実行する</td></tr>
                <tr><td>必要な引数の数と違う場合</td><td>足りない値は nil、余分な値は使わない</td><td>ArgumentError になる</td></tr>
                <tr><td>中に return を書いた場合</td><td>その Proc を作ったメソッドを終了する</td><td>その lambda だけ終了し、call の後の処理へ進む</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Rails でよく見る -&gt; も lambda</h3>
          <p>
            <code>-&gt;</code> は lambda を作る短い書き方です。引数は丸括弧に書き、実行する処理は波括弧に書きます。
            次の2つは、どちらも引数を1つ受け取る lambda を作ります。
          </p>
          <Code
            lang="ruby"
            title="lambda と -> の書き方を対応させる"
            code={`
long_form = lambda { |number| number * 2 }
short_form = ->(number) { number * 2 }

long_form.call(3)  # => 6
short_form.call(3) # => 6
`}
          />
          <p>
            引数がなければ <code>-&gt; {'{ ... }'}</code> と書けます。
            Rails の <code>scope :published, -&gt; {'{ where(published: true) }'}</code> にもこの記法が使われています。
            Rails が保存した処理をいつ、どのオブジェクトに対して実行するかは、<ChapterLink n={4} section="dsl">後の Rails の DSL の節</ChapterLink>で説明します。
          </p>
          <p>
            自分で「値を受け取り、計算結果を返す処理」を変数に保存するなら、引数の渡し忘れを検出でき、return がその処理の中だけで完結する lambda を選ぶと扱いやすくなります。
            ライブラリや Rails に処理を渡すときは、その機能が求める引数と書き方に合わせます。
          </p>

          <h3>補足：Proc を作ったメソッドの終了後に実行する場合</h3>
          <p>
            通常の Proc の return が、作ったメソッドを終了することは説明しました。
            では、そのメソッドが終わった後に Proc を実行するとどうなるでしょうか。次の例では、Proc を作る時点と、実行する時点を分けています。
          </p>
          <Code
            lang="ruby"
            title="終了済みの build_proc へ return しようとして失敗する"
            code={`
def build_proc
  proc { return "完了" }
end

task = build_proc # Proc が返され、build_proc の実行はここで終わる
task.call        # Proc の中の return を実行する
# LocalJumpError: unexpected return
`}
          />
          <p>
            <code>build_proc</code> の最後の式は Proc オブジェクトなので、それが <code>task</code> に入ります。
            次の行で task を実行すると、return が終了済みの build_proc へ戻ろうとするため、<code>LocalJumpError</code>（戻ろうとした先へ戻れないことを示す例外）になります。
            lambda にすると、return はその lambda の実行だけを終了するため、この問題は起きません。
          </p>
          <Code
            lang="ruby"
            title="lambda なら、作ったメソッドが終わった後もこの return を使える"
            code={`
def build_lambda
  lambda { return "完了" }
end

task = build_lambda
task.call # => "完了"
`}
          />
          <p>
            通常の Proc も、保存して後で実行できます。上の build_proc を <code>proc {'{ "完了" }'}</code> と書けば、
            明示的な return を使わず、最後の式の値を call の結果として返せます。
          </p>

          <h3>補足：配列1つと引数2つの扱い</h3>
          <p>
            <code>call(10, 20)</code> は値を2つ渡しています。一方、<code>call([10, 20])</code> は、2つの値が入った配列を1つ渡しています。
            引数を2つ受け取る次の通常の Proc では、配列の中身を分けて <code>left</code> と <code>right</code> に入れます。
          </p>
          <Code
            lang="ruby"
            title="引数を2つ受け取る通常の Proc：配列の要素をそれぞれに入れる"
            code={`
pair = proc { |left, right| [left, right] }

pair.call(10, 20)   # => [10, 20]
pair.call([10, 20]) # => [10, 20]
`}
          />
          <p>
            同じ引数の書き方をした lambda はこの配列を自動では分けません。
            必要な引数は2つなのに配列を1つだけ渡しているので、引数が足りないエラーになります<Ref n={2} />。
          </p>
          <Code
            lang="ruby"
            title="引数を2つ受け取る lambda：配列1つでは引数が1つ足りない"
            code={`
pair = lambda { |left, right| [left, right] }

pair.call(10, 20) # => [10, 20]
pair.call([10, 20])
# ArgumentError: wrong number of arguments (given 1, expected 2)
`}
          />
        </>
      ),
    },
    {
      id: 'closure',
      title: 'クロージャ：作られた場所の変数を参照する',
      body: (
        <>
          <p>
            ブロック・Proc・lambda は作られた場所のローカル変数を参照できます。値をコピーするのではなく、変数そのものを参照します。このような性質を持つ関数（呼び出して実行できる処理のまとまり）を<Term en="closure">クロージャ</Term>
            と呼びます
            <Ref n={2} />
            <Ref n={4} />。
          </p>
          <Code
            lang="ruby"
            code={`
def counter
  count = 0
  increment = -> { count += 1 }
  read      = -> { count }
  [increment, read]
end

inc, read = counter
inc.call
inc.call
read.call # => 2   （increment と read は同じ count を参照している）

x = 10
add = ->(n) { n + x }
x = 20
add.call(1)                         # => 21（作った後に変えた x の値が使われる）
add.binding.local_variable_get(:x)  # => 20
`}
          />
          <p>
            コードの前半の <code>counter</code> は、ローカル変数 count と、count を使う2つの lambda を作り、lambda を配列に入れて返します。<code>inc, read = counter</code>{' '}
            は、返された配列の1つ目を inc に、2つ目を read に代入します。inc を2回呼ぶと count は 2 になり、read は同じ count を読むので 2 を返します（図 4-3）。counter
            をもう一度呼ぶと、新しい count と新しい2つの lambda が作られ、最初の count とは別に 0 から数えます。
          </p>
          <Figure n="4-3" title="クロージャが変数を参照する" caption="模式図。counter が終わった後も、lambda が参照している count は残り続ける。">
            <ClosureFigure />
          </Figure>
          <p>
            <code>counter</code> メソッドの実行が終わっても、2つの lambda が <code>count</code> を参照しているので、<code>count</code> は消えずに残ります。<code>binding</code>{' '}
            は、クロージャが参照しているローカル変数の環境を表すオブジェクトです
            <Ref n={3} />。
          </p>
          <p>
            コードの後半では、lambda を作った後で x を 20 に変えています。<code>add.call(1)</code> が 11 にならず 21 になるのは、lambda が作られた時点の値 10 を保存しておらず、変数 x
            を参照しているからです。最後の行は add の binding から変数 x の今の値を取り出していて、20 が返ります。
          </p>
          <p>
            この性質は、Rails の DSL（routes.rb の resources や、モデルの scope・has_many のように、宣言の形で書くメソッド呼び出し）に渡すブロックのように、後で実行されるブロックに関係します。ブロックの中から、ブロックを書いた場所のローカル変数を参照できます。ただし、変数そのものを参照するので、ブロックが後で実行されるときには、その時点の値が使われます。「Rails
            の DSL でブロックが実行される仕組み」の節の例では、ルートを定義するブロックの中から、ブロックの外で作ったローカル変数 prefix を使います。
          </p>
        </>
      ),
    },
    {
      id: 'scope-gate',
      title: 'スコープゲート：新しいスコープが作られる場所',
      body: (
        <>
          <p>
            <code>class</code>、<code>module</code>、<code>def</code> の3つは、新しいローカル変数のスコープを作ります。その内側からは、外側のローカル変数が見えません。この境界をスコープゲートと呼ぶことがあります。一方、ブロックは新しいスコープを作らず、外側のローカル変数をそのまま参照できます
            <Ref n={4} />。
          </p>
          <Code
            lang="ruby"
            code={`
level = "top"

class Gate
  p defined?(level)          # => nil（class の内側からは見えない）
  def show = defined?(level) # def の内側からも見えない
end
Gate.new.show                # => nil

Klass = Class.new do         # ブロックなので外側が見える
  p level                    # => "top"
  define_method(:show) { level }  # これもブロック
end
Klass.new.show               # => "top"
`}
          />
          <p>
            コードの前半の Gate は class と def で書いています。class の本体でも show の中でも <code>defined?(level)</code> は nil を返していて、トップレベルの level
            は見えていません。「ローカル変数が見える範囲」の節で、def の中から外の total が見えなかったのと同じ動作です。
          </p>
          <p>
            後半は同じ形のクラスを <code>Class.new</code> と <code>define_method</code> で書いています。<code>Class.new do … end</code>{' '}
            は、ブロックをクラスの本体として実行し、新しいクラスを作るメソッドです（<ChapterLink n={2} section="class-is-object" />）。
            <code>define_method(:show) {'{ level }'}</code> は、show という名前のメソッドを、ブロックを本体として定義するメソッドです。どちらに渡したものもブロックなので、中から level
            が見えています。図 4-4 では、左の太い枠が外側の変数を見えなくする class と def、右の破線の枠が外側の変数を引き継ぐブロックです。
          </p>
          <Figure n="4-4" title="スコープゲートとブロック" caption="class・module・def は新しいスコープを作る。Class.new や define_method に渡すブロックは外側のスコープを引き継ぐ。">
            <ScopeGateFigure />
          </Figure>
          <p>
            <code>class</code> キーワードの代わりに <code>Class.new</code> を、<code>def</code> の代わりに <code>define_method</code>{' '}
            を使うと、ブロックを使ってクラスやメソッドを定義できるため、外側の変数を内側に持ち込めます。Rails が <code>define_method</code> を多用する理由の1つがこれです。たとえば第3章で見た{' '}
            <code>scope</code> の実装では、<code>define_method</code> のブロックの中から、<code>scope</code> メソッドの引数 <code>body</code> と、ブロックから作ったローカル変数 <code>extension</code>{' '}
            を参照しています。該当する行をもう一度引用します。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/scoping/named.rb（171〜178行。scope メソッドの一部）"
            href={`${GH}/activerecord/lib/active_record/scoping/named.rb#L171-L178`}
            code={`
          extension = Module.new(&block) if block

          if body.respond_to?(:to_proc)
            singleton_class.define_method(name) do |*args|
              scope = all._exec_scope(*args, &body)
              scope = scope.extending(extension) if extension
              scope
            end
`}
          />
          <p>
            モデルに <code>scope :published, -&gt; {'{ where(published: true) }'}</code> と書いた場合で読みます。
          </p>
          <ul>
            <li>
              <code>name</code> は <code>:published</code>、<code>body</code> は <code>-&gt; {'{ where(published: true) }'}</code> の lambda です。どちらも scope
              メソッドの引数で、scope メソッドのローカル変数です。
            </li>
            <li>
              1行目の <code>extension</code> は scope にブロックも付けて呼んだときだけモジュールが入るローカル変数です。この書き方ではブロックを付けていないので nil のままです。
            </li>
            <li>
              <code>singleton_class.define_method(name) do |*args| … end</code> は、published という名前のクラスメソッドを、ブロックを本体として定義します。ブロックの中の{' '}
              <code>body</code> と <code>extension</code> は、ブロックの外にある scope メソッドのローカル変数です。def で定義していたら、この2つは見えません。
            </li>
          </ul>
          <p>
            scope メソッドの実行はモデルのクラスを読み込んだ時点で終わります。それでも、後で <code>Article.published</code> を呼ぶたびに、定義されたメソッドの本体は body
            を参照して lambda を実行できます。前の節の counter が終わった後も count が残ったのと同じで、ブロックが参照している body は残り続けるためです。
          </p>
          <h3>繰り返しの中でメソッドを定義する</h3>
          <p>
            アプリケーションのコードでも、配列の要素ごとに似たメソッドを作るときに <code>define_method</code> を使うことがあります。次の例は状態の名前から <code>draft?</code> と{' '}
            <code>published?</code> を定義します。比較のため、同じことを def で書いた Broken クラスも実行します。
          </p>
          <Code
            lang="ruby"
            title="define_method_loop.rb"
            code={`
class Article
  attr_reader :status
  def initialize(status) = @status = status

  ["draft", "published"].each do |name|
    define_method("#{name}?") { status == name }   # name はブロックの外のローカル変数
  end
end

article = Article.new("draft")
p article.draft?
p article.published?

class Broken
  ["draft"].each do |name|
    def check = name        # def の内側からは name が見えない
  end
end

begin
  Broken.new.check
rescue NameError => e
  puts e.message
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
true
false
undefined local variable or method 'name' for an instance of Broken
`}
          />
          <p>
            Article では each のブロックを2回実行し、1回目に <code>draft?</code>、2回目に <code>published?</code> を定義しています。define_method のブロックは each
            のブロックの引数 name を参照しています。そのため draft? は status を "draft" と比べ、published? は "published" と比べます。status が "draft" の記事では、1行目が
            true、2行目が false になりました。
          </p>
          <p>
            Broken の <code>def check = name</code> は、def が新しいスコープを作るので、each のブロックの引数 name が見えません。メソッドを定義した時点ではエラーにならず、check
            を呼んだ時点で NameError になります。コードレビューで each と define_method の組み合わせを見たときは、ブロックの外の変数をメソッドの中で使うために def を避けている、と読めます。
          </p>
        </>
      ),
    },
    {
      id: 'self-switch',
      title: 'self を切り替えてブロックを実行する',
      body: (
        <>
          <p>
            通常、ブロックの中の <code>self</code> は、ブロックを書いた場所の <code>self</code> と同じです。しかし、次のメソッドを使うと、<code>self</code>{' '}
            を別のオブジェクトに切り替えてブロックを実行できます
            <Ref n={5} />
            <Ref n={6} />。
          </p>
          <ul>
            <li>
              <code>obj.instance_eval {'{ ... }'}</code>：<code>self</code> を <code>obj</code> にしてブロックを実行します。中で <code>def</code> すると、<code>obj</code>{' '}
              の特異メソッド（その1つのオブジェクトだけに定義されたメソッド。<ChapterLink n={3} section="singleton" />）になります。
            </li>
            <li>
              <code>obj.instance_exec(args) {'{ |...| ... }'}</code>：<code>instance_eval</code> と同じですが、ブロックに引数を渡せます。
            </li>
            <li>
              <code>Klass.class_eval {'{ ... }'}</code>（別名 <code>module_eval</code>）：<code>self</code> を <code>Klass</code> にしてブロックを実行します。中で <code>def</code>{' '}
              すると、<code>Klass</code> のインスタンスメソッドになります。クラスを再オープン（定義済みのクラスにもう一度 class 〜 end を書いてメソッドを足すこと）するのと同じ効果です。
            </li>
          </ul>
          <Code
            lang="ruby"
            code={`
class Widget
  def initialize = @secret = 42
end
w = Widget.new

w.instance_eval { @secret }      # => 42（self が w なので w のインスタンス変数が読める）
w.instance_eval { self.class }   # => Widget
w.instance_exec(8) { |n| @secret + n } # => 50

w.instance_eval { def only_me = :singleton }
w.singleton_methods              # => [:only_me]

Widget.class_eval { def size = :instance }
Widget.new.size                  # => :instance

Widget.instance_eval { def build = :class_method }
Widget.build                     # => :class_method
`}
          />
          <p>
            Widget には @secret を外から読むためのメソッドがありません。それでも <code>w.instance_eval {'{ @secret }'}</code> が 42 を返すのは、ブロックの中の self が w
            になり、<code>@secret</code> が w のインスタンス変数を指すからです。instance_exec の行では、引数の 8 がブロックの引数 n に入り、42 + 8 で 50 になります。
          </p>
          <p>
            残りの3組はブロックの中で def したメソッドがどこに定義されるかを比べています（図 4-5）。<code>w.instance_eval</code> の中で定義した only_me は w
            だけが持つメソッドで、<code>w.singleton_methods</code> に出ます。別に作った Widget のインスタンスからは呼べません。図の <code>#&lt;Class:w&gt;</code> は w
            の特異クラスで、特異メソッドの定義先になるクラスです。
          </p>
          <Figure n="4-5" title="self とメソッドの定義先" caption="instance_eval はレシーバの特異クラスに、class_eval はレシーバのクラス自身に def の結果を定義する。">
            <EvalFigure />
          </Figure>
          <p>
            <code>instance_eval</code> と <code>class_eval</code> は、どちらもブロック内の <code>self</code> をレシーバにします。違いは <code>def</code>{' '}
            したメソッドの定義先です。<code>Widget.instance_eval</code> では Widget の特異クラスに定義されるのでクラスメソッドになり、<code>Widget.class_eval</code>{' '}
            では Widget 自身に定義されるのでインスタンスメソッドになります。
          </p>
          <p>
            これらのメソッドはブロックの代わりに文字列を受け取ることもできます（<code>class_eval "def foo; end"</code>）。Rails はメソッドを生成するときに文字列版の{' '}
            <code>class_eval</code> をよく使います。その理由は<ChapterLink n={5} />で説明します。
          </p>
          <h3>設定ファイルの configure のブロック</h3>
          <p>
            アプリケーションのファイルにも、self を切り替えて実行されるブロックがあります。config/environments/development.rb などの環境ごとの設定ファイルは、次の形をしています。
          </p>
          <Code
            lang="ruby"
            title="config/environments/development.rb（rails new が作るファイルの形。一部を省略）"
            code={`
Rails.application.configure do
  config.eager_load = false
  # …
end
`}
          />
          <p>
            ブロックの中の <code>config</code> はローカル変数としてどこにも代入されておらず、レシーバを省略したメソッド呼び出しです。どのオブジェクトの config
            が呼ばれるのかを、<code>configure</code> の実装で確かめます。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/railtie.rb（254〜256行）"
            href={`${GH}/railties/lib/rails/railtie.rb#L254-L256`}
            code={`
    def configure(&block) # :nodoc:
      instance_eval(&block)
    end
`}
          />
          <ul>
            <li>
              <code>Rails.application</code> はアプリケーション全体を表すオブジェクトです。そのクラスは Rails::Railtie を継承しているので、この configure が呼ばれます。
            </li>
            <li>
              <code>def configure(&block)</code> の <code>&block</code> は、development.rb に書いたブロックを Proc として受け取ります。
            </li>
            <li>
              <code>instance_eval(&block)</code> は、レシーバを省略しているので self（Rails.application）に対する呼び出しです。受け取った Proc をブロックとして渡し、self を
              Rails.application にして実行します。
            </li>
            <li>
              <code># :nodoc:</code> はこのメソッドを API の説明書に載せないことを示すコメントで、動作には関係しません。
            </li>
          </ul>
          <p>
            ブロックの中の self は Rails.application なので、<code>config.eager_load = false</code> は <code>Rails.application.config.eager_load = false</code>{' '}
            と同じ呼び出しになります。設定ファイルの中で config に続けて書ける項目を調べるときは、Rails.application.config が返すオブジェクトのメソッドを調べます。
          </p>
        </>
      ),
    },
    {
      id: 'dsl',
      title: 'Rails の DSL でブロックが実行される仕組み',
      body: (
        <>
          <p>
            ここまでの知識で、Rails の DSL に渡したブロックがどう実行されるかを読めます。3つの例を見ます。
          </p>
          <h3>routes.rb：Mapper を self としてブロックを実行する</h3>
          <p>
            <code>config/routes.rb</code> の <code>Rails.application.routes.draw do ... end</code> に渡したブロックの中では、<code>get</code> や <code>resources</code>{' '}
            をレシーバなしで呼べます。これは、Rails が <code>Mapper</code>（ルートの定義を受け付けるオブジェクト）を self として、そのブロックを <code>instance_exec</code> で実行しているからです。
          </p>
          <p>
            <code>Rails.application.routes</code> は、ActionDispatch::Routing::RouteSet というクラスのオブジェクトを返します。<code>draw</code>{' '}
            はこのクラスのメソッドで、受け取ったブロックを同じクラスの <code>eval_block</code> に渡します。ブロックを実行しているのは eval_block なので、その実装を読みます。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/routing/route_set.rb（472〜479行）"
            href={`${GH}/actionpack/lib/action_dispatch/routing/route_set.rb#L472-L479`}
            code={`
      def eval_block(block)
        mapper = Mapper.new(self)
        if default_scope
          mapper.with_default_scope(default_scope, &block)
        else
          mapper.instance_exec(&block)
        end
      end
`}
          />
          <ul>
            <li>
              引数の <code>block</code> には routes.rb に書いた <code>do … end</code> のブロックが Proc として入っています。
            </li>
            <li>
              <code>mapper = Mapper.new(self)</code> は、Mapper のオブジェクトを作ります。ここの self は RouteSet で、Mapper はルートを登録する先としてこの RouteSet を受け取ります。
            </li>
            <li>
              <code>if default_scope</code> はすべてのルートに共通で付ける指定を RouteSet に設定している場合の分岐です。モデルに書く default_scope
              とは別のものです。設定していなければ nil なので、else の行に進みます。設定している場合に呼ばれる with_default_scope も、その中で同じ{' '}
              <code>instance_exec(&block)</code> を実行します。
            </li>
            <li>
              <code>mapper.instance_exec(&block)</code> は、Proc をブロックとして渡し、self を mapper にして実行します。routes.rb のブロックの中に書いた{' '}
              <code>resources :articles</code> は、<code>mapper.resources(:articles)</code> と同じ呼び出しになります。
            </li>
          </ul>
          <p>
            図 4-6 はこの流れを routes.rb から順にたどったものです。右の列を上から下へ読むと、ブロックが draw、eval_block、instance_exec の順に渡されます。左へ戻る矢印は instance_exec
            が routes.rb のブロックの中身を実行することを表しています。
          </p>
          <Figure n="4-6" title="routes.draw のブロックが実行される流れ" caption="ブロックは routes.rb で作られたクロージャのまま、self だけが Mapper のインスタンスに切り替わって実行される。">
            <DslFigure />
          </Figure>
          <p>
            routes.rb で使えるメソッドを調べるときは、Mapper のメソッドを探します。routes.rb でメソッド名を書き間違えたときの例外のメッセージも、末尾が{' '}
            <code>for an instance of ActionDispatch::Routing::Mapper</code> になります。この部分は、メソッドを探した相手が Mapper のオブジェクトだったことを表しています。
          </p>
          <p>同じ仕組みを、小さな例で再現すると次のようになります。</p>
          <Code
            lang="ruby"
            code={`
class RouteMapper
  def initialize = @routes = []
  attr_reader :routes
  def get(path, to:) = @routes << "GET #{path} → #{to}"
end

def draw(&block)
  mapper = RouteMapper.new
  mapper.instance_exec(&block)   # self を mapper にしてブロックを実行
  mapper.routes
end

prefix = "/admin"
draw {
  get "/articles", to: "articles#index"
  get "#{prefix}/users", to: "admin/users#index"   # 外側のローカル変数も使える
}
# => ["GET /articles → articles#index", "GET /admin/users → admin/users#index"]
`}
          />
          <p>
            この例の <code>draw</code> が Rails の eval_block に、<code>RouteMapper</code> が Mapper に当たります。ブロックの中の get は self になった mapper の get
            メソッドを呼び、<code>@routes</code> に文字列を1つずつ足します。draw は最後に mapper.routes を返すので、戻り値は足された2つの文字列の配列です。
          </p>
          <p>
            2つ目の get では、ブロックの外のローカル変数 prefix を使えています。instance_exec が切り替えるのは self だけで、ブロックが外側のローカル変数を参照する性質は変わりません。routes.rb
            でも、ブロックの中で作ったローカル変数を、入れ子の resources のブロックの中から使えます。
          </p>
          <h3>scope：Relation を self としてブロックを実行する</h3>
          <p>
            <code>scope</code> は、渡されたものが呼び出し可能（<code>call</code> を持つ）かどうかを最初に検査します。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/scoping/named.rb（154〜157行）"
            href={`${GH}/activerecord/lib/active_record/scoping/named.rb#L154-L157`}
            code={`
        def scope(name, body, &block)
          unless body.respond_to?(:call)
            raise ArgumentError, "The scope body needs to be callable."
          end
`}
          />
          <p>
            <code>scope :published, -&gt; {'{ … }'}</code> と書いた場合、引数の <code>name</code> は <code>:published</code>、<code>body</code> は2番目に渡した lambda
            です。<code>body.respond_to?(:call)</code> は body が call メソッドを持つかどうかを返します。持たなければ、ArgumentError を発生させて scope の実行をやめます。
          </p>
          <p>
            <code>scope :published, where(published: true)</code> と書くと、クラスの読み込み時に <code>where</code> を実行し、その戻り値を scope に渡します。
            この戻り値は、検索条件や並び順を保持する Relation オブジェクトで、<code>call</code> を持たないためエラーになります。
            <code>-&gt; {'{ where(published: true) }'}</code> と書けば、where を実行する処理を lambda として渡せるので、スコープを呼ぶたびに条件を組み立てられます。
          </p>
          <p>
            次に、この lambda を実行するときの <code>self</code> と、<code>where</code> の呼び出し先を確認します。第3章で見た <code>scope</code> の実装は、
            <code>all._exec_scope(*args, &body)</code> を呼んでいました。
          </p>
          <p>
            この呼び出しは、scope が定義したクラスメソッド（<code>Article.published</code>）の本体にあります。<code>all</code> は Article のすべての行を対象にした Relation
            を返すメソッドです。<code>*args</code> は Article.published に渡した引数で、<code>&body</code> は scope に渡した lambda をブロックとして渡す指定です。つまり
            _exec_scope は、Article.all が返した Relation に対して、lambda をブロックとして付けて呼ばれます。<code>_exec_scope</code> は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation.rb（566〜572行）"
            href={`${GH}/activerecord/lib/active_record/relation.rb#L566-L572`}
            code={`
    def _exec_scope(...) # :nodoc:
      @delegate_to_model = true
      registry = model.scope_registry
      _scoping(nil, registry) { instance_exec(...) || self }
    ensure
      @delegate_to_model = false
    end
`}
          />
          <p>
            <code>(...)</code> は受け取った引数とブロックをすべてそのまま転送する記法です。つまり <code>instance_exec(*args, &body)</code> が実行され、lambda の中の <code>self</code> は Relation（
            <code>Article.all</code>）になります。<code>where</code> は Relation のメソッドとして呼ばれます。<code>|| self</code> により、lambda が <code>nil</code> や{' '}
            <code>false</code> を返した場合は、条件を加えない Relation がそのまま返ります。
          </p>
          <p>残りの行は次のように読みます。</p>
          <ul>
            <li>
              <code>@delegate_to_model = true</code> と、<code>ensure</code> の下の <code>@delegate_to_model = false</code> は、インスタンス変数 @delegate_to_model を lambda の実行中だけ true
              にします。ensure の下の行は、途中で例外が起きても必ず実行されます。この変数は、次の節の末尾の注意書きにある、モデルのクラスメソッドへの転送で使われます。
            </li>
            <li>
              <code>_scoping(nil, registry) {'{ … }'}</code> の <code>_scoping</code> は、渡したブロックを実行してその値を返すメソッドです。実行の前後で、モデルごとに記録している「現在のスコープ」という値を入れ替えて元に戻します。前の行の <code>registry</code>{' '}
              はその記録を持つオブジェクトです。lambda
              の self を決めているのは、ブロックの中の <code>instance_exec(...)</code> のほうです。
            </li>
          </ul>
          <p>
            スコープの lambda が引数を取る場合も、同じ経路で読めます。たとえば <code>scope :published_after, -&gt;(time) {'{ where("published_at > ?", time) }'}</code>{' '}
            と書いて <code>Article.published_after(1.week.ago)</code> を呼ぶと、引数は <code>*args</code> で受け取られ、<code>instance_exec(*args, &body)</code> を通って lambda
            の引数 time に入ります。self は同じく Relation なので、where は Relation のメソッドとして呼ばれます。
          </p>
          <h3>has_many のスコープ：引数の数で実行方法を変える</h3>
          <p>
            <code>has_many :comments, -&gt; {'{ order(:created_at) }'}</code> のように関連にもスコープを付けられます。Rails は、lambda の引数の数（<code>arity</code>）を見て、実行方法を変えています。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/associations/builder/association.rb（53〜59行）"
            href={`${GH}/activerecord/lib/active_record/associations/builder/association.rb#L53-L59`}
            code={`
    def self.build_scope(scope)
      if scope && scope.arity == 0
        proc { instance_exec(&scope) }
      else
        scope
      end
    end
`}
          />
          <p>
            引数の <code>scope</code> は、has_many の2番目の引数に書いた lambda です。モデルの scope メソッドのことではなく、同じ名前の変数です。<code>arity</code> は Proc
            や lambda が受け取る引数の数を返します。
          </p>
          <Code
            lang="ruby"
            title="arity は引数の数を返す"
            code={`
no_arg  = -> { :ok }
one_arg = ->(article) { article }

no_arg.arity   # => 0
one_arg.arity  # => 1
`}
          />
          <ul>
            <li>
              <code>if scope && scope.arity == 0</code> は、lambda が渡されていて、その引数が0個の場合です。has_many に lambda を書かなかったときは scope が nil
              なので、else に進みます。
            </li>
            <li>
              <code>proc {'{ instance_exec(&scope) }'}</code> は、新しい通常の Proc を作って返します。この Proc は実行されると、Proc の中の self をそのまま self として、元の lambda
              を実行します。
            </li>
            <li>
              else の <code>scope</code> は引数を取る lambda（または nil）をそのまま返します。
            </li>
          </ul>
          <p>
            通常の Proc で包むことは、「Proc と lambda の違い」の節で見た引数の検査に関係します。関連を読み込むとき、Rails は{' '}
            <code>relation.instance_exec(owner, &scope)</code> の形で、関連の持ち主であるモデルのインスタンス（owner）を引数に渡してスコープを実行します（activerecord/lib/active_record/reflection.rb
            の scope_for）。引数を取らない lambda をこの形で直接実行すると、引数が1つ多いので ArgumentError になります。通常の Proc は余分な引数を使わずに処理を続けるので、包んだ Proc
            は owner を渡されても実行でき、中の <code>instance_exec(&scope)</code> が引数なしで元の lambda を実行します。
          </p>
          <p>
            次の図は、has_many に書いた lambda が build_scope を通って保存され、関連を読み込むときに実行されるまでを、引数の数で左右に分けたものです。上から順に、has_many に書いた
            lambda、build_scope の分岐、保存されるもの、関連を読み込むときの呼び出し、lambda の実行され方を並べています。
          </p>
          <Figure
            title="has_many のスコープを arity で分けて実行する"
            caption="模式図です。実線の矢印は処理の流れを表します。scope_for の scope に入るのは build_scope が返したものです。has_many に lambda を書かなかったとき（scope が nil）も右の分岐に進みますが、図では省略しています。"
          >
            <BuildScopeFigure />
          </Figure>
          <p>
            引数のない lambda は <code>instance_exec</code> で包まれ、Relation を self として実行されます。<code>-&gt;(article) {'{ where(...) }'}</code>{' '}
            のように引数を1つ取る lambda はそのまま保存され、関連を読み込むときにモデルのインスタンスを引数として受け取ります。Proc の <code>arity</code> で引数の数がわかるので、Rails は書き方を区別できます。
          </p>
        </>
      ),
    },
    {
      id: 'pitfalls',
      title: 'self を切り替えるブロックの注意点',
      body: (
        <>
          <p>
            <code>instance_exec</code> で実行されるブロックでは、ローカル変数は外側のものが見えますが、<code>self</code>{' '}
            は切り替わります。インスタンス変数は <code>self</code> のものを指すので、外側のインスタンス変数は見えなくなります。
          </p>
          <p>
            次の例は前の節の小さな例で定義した <code>RouteMapper</code> と <code>draw</code> をそのまま使います。draw はブロックを、self を RouteMapper
            のインスタンスにして実行するメソッドでした。Page クラスのメソッドの中から draw を呼び、ブロックの中で Page のインスタンス変数とメソッドを使ってみます。
          </p>
          <Code
            lang="ruby"
            code={`
class Page
  def initialize = @title = "Page のタイトル"

  def build
    draw { get "/#{@title}", to: "x#y" }  # @title は mapper のインスタンス変数（nil）
  end

  def build2
    t = @title                            # ローカル変数に移しておく
    draw { get "/#{t}", to: "x#y" }
  end
end

Page.new.build  # => ["GET / → x#y"]
Page.new.build2 # => ["GET /Page のタイトル → x#y"]
`}
          />
          <p>
            build のブロックの中の <code>@title</code> は、self になった mapper のインスタンス変数として読まれます。mapper は @title を持たないので nil になり、パスは{' '}
            <code>"/"</code> だけになりました。例外は出ないので、戻り値を確かめないと気付けません。build2 は draw を呼ぶ前に @title をローカル変数 t
            に入れています。ローカル変数はブロックの中からも見えるので、タイトルが入りました。
          </p>
          <p>
            同様に、外側のオブジェクトのメソッドをレシーバなしで呼ぶと、<code>self</code> である Mapper や Relation のメソッドとして探されます。DSL のブロックの中で外側の値を使いたい場合は、ローカル変数に入れてから参照します。
          </p>
          <p>メソッドの場合を、同じ RouteMapper と draw で確かめます。</p>
          <Code
            lang="ruby"
            title="ブロックの中から外側のオブジェクトのメソッドを呼ぶ"
            code={`
class Page
  def path = "/pages"

  def build3
    draw { get path, to: "x#y" }          # path は Page のメソッド
  end

  def build4
    page = self                           # 外側の self をローカル変数に入れておく
    draw { get page.path, to: "x#y" }
  end
end

Page.new.build3
# NameError: undefined local variable or method 'path' for an instance of RouteMapper
Page.new.build4 # => ["GET /pages → x#y"]
`}
          />
          <p>
            build3 のブロックの中の <code>path</code> は、self になった mapper のメソッドとして探され、見つからないので NameError になりました。メッセージの末尾の{' '}
            <code>for an instance of RouteMapper</code> は、名前を探した相手が Page ではなく RouteMapper のインスタンスだったことを表しています。build4 は外側の self
            をローカル変数 page に入れ、<code>page.path</code> とレシーバを書いて呼んでいます。
          </p>
          <p>
            Rails のブロックの中で「定義したはずのメソッドが見つからない」というエラーが出たときは、メッセージの <code>for</code>{' '}
            の後ろに書かれたクラスを読みます。そこが自分のクラスと違い、Mapper や Relation などになっていれば、そのブロックは self を切り替えて実行されています。
          </p>
          <Callout kind="warn">
            <p>
              スコープの lambda の中で、モデルのクラスメソッドを呼べるのは、Relation が見つからないメソッドをモデルクラスに転送する仕組み（<code>_exec_scope</code> の{' '}
              <code>@delegate_to_model</code> など）があるからです。この転送の仕組みは<ChapterLink n={12} />で扱います。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>
            ブロックはメソッドを呼ぶときに渡すコードのまとまりで、<code>do … end</code> か <code>{'{ … }'}</code> で書きます。each や map は要素ごとにブロックを実行し、map はブロックの値を集めます。
          </li>
          <li>
            Rails の transaction・respond_to はブロックをすぐに1回実行し、routes.rb の draw は読み込むときに1回実行し、before_action はブロックを保存してアクションの前に毎回実行します。
          </li>
          <li>ブロックの中からは外のローカル変数を読み書きできますが、ブロックの中で作った変数は外から使えません。def の中からは外のローカル変数が見えません。</li>
          <li>
            ブロックは <code>yield</code> で実行します。<code>&block</code> で受けると Proc オブジェクトになり、保存して後で呼べます。
          </li>
          <li>通常の Proc と lambda はどちらも処理を保存して call で実行できます。lambda は引数の数を検査し、中の return は lambda の実行だけを終了します。通常の Proc の return はその Proc を作ったメソッドを終了します。</li>
          <li>ブロックはクロージャで、作られた場所のローカル変数そのものを参照します。class・module・def は新しいスコープを作り、外側のローカル変数を見えなくします。</li>
          <li>instance_eval・instance_exec はレシーバを self にしてブロックを実行し、class_eval はレシーバ（クラス）自身にメソッドを定義する状態でブロックを実行します。</li>
          <li>
            routes.rb のブロックは Mapper を self として、scope の lambda は Relation を self として instance_exec されます。has_many のスコープは lambda の arity で実行方法が変わります。
          </li>
          <li>self が切り替わるブロックでは、外側のインスタンス変数とメソッドは見えません。ローカル変数に移してから使います。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Methods（Block Argument）・Calling Methods（Block Argument）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/calling_methods_rdoc.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'ブロック引数と yield。' },
    { title: 'class Proc', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Proc.html', accessed: '2026-11-13', version: 'Ruby 4.0', note: 'Proc の作成と & による変換、to_proc、lambda との違い（引数の扱い、return）、番号指定パラメーターと it。' },
    { title: 'class Binding', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Binding.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'binding と local_variable_get。' },
    { title: '変数と定数（ローカル変数のスコープ）', publisher: 'Ruby リファレンスマニュアル', url: 'https://docs.ruby-lang.org/ja/latest/doc/spec=2fvariables.html', accessed: '2026-11-11', note: 'ローカル変数のスコープ（クラス・モジュール・メソッド定義の本体）、Proc 化されたブロックが参照する変数は Proc が消えるまで残り、同じスコープを参照する Proc 間で共有されること。' },
    { title: 'class BasicObject（instance_eval、instance_exec）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/BasicObject.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'instance_eval と instance_exec の仕様。' },
    { title: 'class Module（class_eval、module_eval、define_method）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Module.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'class_eval でのメソッド定義先、define_method。' },
    { title: 'actionpack/lib/action_dispatch/routing/route_set.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/routing/route_set.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'routes.draw のブロックを Mapper を self として instance_exec する実装。' },
    { title: 'activerecord/lib/active_record/relation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '_exec_scope の実装。' },
    { title: 'activerecord/lib/active_record/associations/builder/association.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/associations/builder/association.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '関連のスコープを arity で区別する build_scope の実装。' },
    { title: 'class Symbol（to_proc）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Symbol.html#method-i-to_proc', accessed: '2026-11-13', version: 'Ruby 4.0', note: 'シンボルが表す名前のメソッドを、受け取ったオブジェクトに対して呼ぶ Proc。' },
    { title: 'Assignment（Local Variable Scope）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/assignment_rdoc.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: 'ブロックの中で作ったローカル変数は外に出ず、外で作ったローカル変数はブロックの中から見えること。block_scope.rb の結果は Ruby 4.0.9 で実測。' },
    { title: 'class Array（each・map・select）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Array.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: 'each が要素ごとにブロックを呼んで自身を返すこと、map がブロックの値を集めた配列を返すこと、select がブロックの値が真の要素を集めること。' },
    { title: 'Rails Routing from the Outside In', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/routing.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'routes.draw のブロックがルーターの DSL の範囲を決めること、resources が対応するルートを宣言すること、入れ子のリソース。' },
    { title: 'ActiveRecord::Transactions::ClassMethods', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1.4.1/classes/ActiveRecord/Transactions/ClassMethods.html', accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'トランザクションはブロックの中の SQL がすべて成功したときだけ確定すること。ログはデモのアプリで実測。' },
    { title: 'ActionController::MimeResponds', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1.4.1/classes/ActionController/MimeResponds.html', accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'respond_to のブロックに渡される format と、要求の形式に合うものだけを実行すること。' },
    { title: 'Action Controller Overview（Controller Callbacks）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/action_controller_overview.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'before_action がアクションの前に実行される処理を登録すること。ブロックも渡せること。' },
  ],
}

export default withExplanations(ch04, explanation04)
