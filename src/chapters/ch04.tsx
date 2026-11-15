import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 4-1 クロージャが変数を捕まえる ---------- */
function ClosureFigure() {
  return (
    <Svg
      id="4-1"
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

/* ---------- 図 4-2 スコープゲート ---------- */
function ScopeGateFigure() {
  return (
    <Svg
      id="4-2"
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

/* ---------- 図 4-3 self とメソッドの定義先 ---------- */
function EvalFigure() {
  const rows: { code: string; self: string; target: string; fill: 'box' | 'box3' }[] = [
    { code: 'w.instance_eval { def only_me }', self: 'w', target: '#<Class:w>（w の特異クラス）', fill: 'box3' },
    { code: 'Widget.class_eval { def size }', self: 'Widget', target: 'Widget（インスタンスメソッド）', fill: 'box' },
    { code: 'Widget.instance_eval { def build }', self: 'Widget', target: '#<Class:Widget>（クラスメソッド）', fill: 'box3' },
  ]
  return (
    <Svg
      id="4-3"
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

/* ---------- 図 4-4 routes.draw のブロックが実行される流れ ---------- */
function DslFigure() {
  return (
    <Svg
      id="4-4"
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

const ch04: Chapter = {
  number: 4,
  part: 1,
  title: 'ブロック・Proc・lambda とスコープ',
  summary:
    'ブロックとクロージャの性質、Proc と lambda の違い、新しいスコープが作られる場所、instance_eval・class_eval による self の切り替えを説明します。routes.rb や scope のブロックが Rails の中でどう実行されるかが分かります。',
  goals: [
    'yield と &block の違いを理解し、ブロックを Proc として受け渡せる',
    'Proc と lambda の引数と return の違いを説明できる',
    'クロージャが変数そのものを参照することと、class・module・def が新しいスコープを作ることを説明できる',
    'instance_eval・class_eval・instance_exec で self とメソッドの定義先がどう変わるかを説明できる',
    'routes.draw や scope、has_many のスコープのブロックが Rails の中で実行される仕組みを説明できる',
  ],
  prerequisites: [2, 3],
  sections: [
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
            など、「前後の処理はメソッドが行い、間の処理を呼び出し側が渡す」形でよく使われます。
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
            主な違いは<strong>渡す引数の数が合わないときの動作</strong>と、<strong>中で return を書いたときに終了する範囲</strong>の2つです<Ref n={2} />。
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
            通常の Proc の中に書いた <code>return</code> も、<strong>その Proc を作ったメソッドを終了します</strong>。
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
            lambda の中の <code>return</code> は、<strong>その lambda の実行だけを終了します</strong>。
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
            ブロック・Proc・lambda は作られた場所のローカル変数を参照できます。値をコピーするのではなく、変数そのものを参照します。このような性質を持つ関数を<Term en="closure">クロージャ</Term>
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
          <Figure n="4-1" title="クロージャが変数を参照する" caption="模式図。counter が終わった後も、lambda が参照している count は残り続ける。">
            <ClosureFigure />
          </Figure>
          <p>
            <code>counter</code> メソッドの実行が終わっても、2つの lambda が <code>count</code> を参照しているので、<code>count</code> は消えずに残ります。<code>binding</code>{' '}
            は、クロージャが参照しているローカル変数の環境を表すオブジェクトです
            <Ref n={3} />。
          </p>
          <p>
            この性質は、Rails の DSL に渡すブロックのように、後で実行されるブロックに関係します。ブロックの中から、ブロックを書いた場所のローカル変数を参照できます。ただし、変数そのものを参照するので、ブロックが後で実行されるときには、その時点の値が使われます。
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
          <Figure n="4-2" title="スコープゲートとブロック" caption="class・module・def は新しいスコープを作る。Class.new や define_method に渡すブロックは外側のスコープを引き継ぐ。">
            <ScopeGateFigure />
          </Figure>
          <p>
            <code>class</code> キーワードの代わりに <code>Class.new</code> を、<code>def</code> の代わりに <code>define_method</code>{' '}
            を使うと、ブロックを使ってクラスやメソッドを定義できるため、外側の変数を内側に持ち込めます。Rails が <code>define_method</code> を多用する理由の1つがこれです。たとえば第3章で見た{' '}
            <code>scope</code> の実装では、<code>define_method</code> のブロックの中から、<code>scope</code> メソッドの引数 <code>body</code> と、ブロックから作ったローカル変数 <code>extension</code>{' '}
            を参照しています。
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
              の特異メソッドになります。
            </li>
            <li>
              <code>obj.instance_exec(args) {'{ |...| ... }'}</code>：<code>instance_eval</code> と同じですが、ブロックに引数を渡せます。
            </li>
            <li>
              <code>Klass.class_eval {'{ ... }'}</code>（別名 <code>module_eval</code>）：<code>self</code> を <code>Klass</code> にしてブロックを実行します。中で <code>def</code>{' '}
              すると、<code>Klass</code> のインスタンスメソッドになります。クラスを再オープンするのと同じ効果です。
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
          <Figure n="4-3" title="self とメソッドの定義先" caption="instance_eval はレシーバの特異クラスに、class_eval はレシーバのクラス自身に def の結果を定義する。">
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
            をレシーバなしで呼べます。これは、Rails が <code>Mapper</code> オブジェクトを self として、そのブロックを <code>instance_exec</code> で実行しているからです。
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
          <Figure n="4-4" title="routes.draw のブロックが実行される流れ" caption="ブロックは routes.rb で作られたクロージャのまま、self だけが Mapper のインスタンスに切り替わって実行される。">
            <DslFigure />
          </Figure>
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
            <code>scope :published, where(published: true)</code> と書くと、クラスの読み込み時に <code>where</code> を実行し、その戻り値を scope に渡します。
            この戻り値は、検索条件や並び順を保持する Relation オブジェクトで、<code>call</code> を持たないためエラーになります。
            <code>-&gt; {'{ where(published: true) }'}</code> と書けば、where を実行する処理を lambda として渡せるので、スコープを呼ぶたびに条件を組み立てられます。
          </p>
          <p>
            次に、この lambda を実行するときの <code>self</code> と、<code>where</code> の呼び出し先を確認します。第3章で見た <code>scope</code> の実装は、
            <code>all._exec_scope(*args, &body)</code> を呼んでいました。<code>_exec_scope</code> は次のとおりです。
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
            同様に、外側のオブジェクトのメソッドをレシーバなしで呼ぶと、<code>self</code> である Mapper や Relation のメソッドとして探されます。DSL のブロックの中で外側の値を使いたい場合は、ローカル変数に入れてから参照します。
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
  ],
}

export default ch04
