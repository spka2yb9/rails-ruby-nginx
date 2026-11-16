import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation03 } from '../explanations/ruby'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 3-1 include と prepend の挿入位置 ---------- */
function IncludePrependFigure() {
  const col = (x: number, title: string, code: string, items: { n: string; mod?: boolean; hl?: boolean }[]) => (
    <g>
      <T x={x + 110} y={18} anchor="middle" bold>
        {title}
      </T>
      <T x={x + 110} y={40} anchor="middle" fs={12} tone="muted" mono>
        {code}
      </T>
      {items.map((it, i) => (
        <g key={it.n}>
          <Box x={x + 30} y={60 + i * 56} w={160} h={36} lines={it.n} mono fill={it.mod ? 'box2' : 'box'} accent={it.hl} />
          {i < items.length - 1 && <Arrow x1={x + 110} y1={96 + i * 56} x2={x + 110} y2={116 + i * 56} />}
        </g>
      ))}
    </g>
  )
  return (
    <Svg
      id="3-1"
      w={500}
      h={240}
      label="include と prepend の比較。class C に include M した場合、ancestors は C、M、Object の順になり、C のメソッドが先に見つかる。prepend M した場合は M、C、Object の順になり、M のメソッドが先に見つかる"
    >
      {col(0, 'include M', 'class C; include M; end', [{ n: 'C' }, { n: 'M', mod: true, hl: true }, { n: 'Object' }])}
      {col(260, 'prepend M', 'class C; prepend M; end', [{ n: 'M', mod: true, hl: true }, { n: 'C' }, { n: 'Object' }])}
      <T x={20} y={228} fs={12} tone="muted">
        上から下へ探索する。矢印は探索の順序
      </T>
    </Svg>
  )
}

/* ---------- 図 3-2 super による呼び出しと戻り値 ---------- */
function SuperChainFigure() {
  return (
    <Svg
      id="3-2"
      w={680}
      h={290}
      label="Child.new.greet('  ruby ', polite: true) の流れ。Child 自身には greet が無いので Trim#greet が呼ばれる。Trim は名前の空白を取り除いて super に渡す。Loud#greet は引数を変えずに super を呼ぶ。Base#greet が 'こんにちは、rubyさん' を返し、Loud がそれを大文字にして返す"
    >
      <Box x={130} y={16} w={300} h={40} lines={'Child.new.greet("  ruby ", polite: true)'} mono fs={12} fill="bg" />
      <Box x={230} y={86} w={140} h={36} lines="Trim#greet" mono fill="box2" />
      <Box x={230} y={160} w={140} h={36} lines="Loud#greet" mono fill="box2" />
      <Box x={230} y={234} w={140} h={36} lines="Base#greet" mono />

      <Arrow x1={280} y1={56} x2={280} y2={84} />
      <Arrow x1={270} y1={122} x2={270} y2={158} />
      <T x={260} y={140} anchor="end" fs={11.5} mono>
        super("ruby", polite: true)
      </T>
      <Arrow x1={270} y1={196} x2={270} y2={232} />
      <T x={260} y={214} anchor="end" fs={11.5} mono>
        super（同じ引数）
      </T>

      <Arrow x1={330} y1={232} x2={330} y2={198} accent />
      <T x={342} y={214} fs={11.5} tone="acc">
        "こんにちは、rubyさん"
      </T>
      <Arrow x1={330} y1={158} x2={330} y2={124} accent />
      <T x={342} y={140} fs={11.5} tone="acc">
        "こんにちは、RUBYさん"（upcase した値）
      </T>
      <T x={390} y={104} fs={12} tone="muted">
        name.strip した値を渡す
      </T>
      <T x={390} y={178} fs={12} tone="muted">
        受け取った戻り値を upcase する
      </T>
      <T x={390} y={252} fs={12} tone="muted">
        挨拶の文字列を作る
      </T>
    </Svg>
  )
}

/* ---------- 図 3-3 オブジェクトの特異クラス ---------- */
function SingletonFigure() {
  return (
    <Svg
      id="3-3"
      w={560}
      h={250}
      label="obj は特異クラス #<Class:obj> を持ち、そこに greet が定義されている。obj のメソッド探索は特異クラスから始まり、Object、Kernel、BasicObject と続く。特異メソッドを持たない other は、Object から探索を始める"
    >
      <Box x={20} y={20} w={100} h={36} lines="obj" mono />
      <Box x={20} y={90} w={100} h={36} lines="other" mono />
      <Box x={180} y={20} w={190} h={50} lines={['#<Class:obj>', 'greet']} mono fill="box3" bold />
      <Box x={180} y={110} w={190} h={34} lines="Object" mono />
      <Box x={180} y={160} w={190} h={34} lines="Kernel" mono fill="box2" />
      <Box x={180} y={210} w={190} h={34} lines="BasicObject" mono />
      <Arrow x1={120} y1={38} x2={178} y2={42} accent />
      <Arrow x1={275} y1={70} x2={275} y2={108} accent />
      <Arrow x1={275} y1={144} x2={275} y2={158} />
      <Arrow x1={275} y1={194} x2={275} y2={208} />
      <Arrow x1={120} y1={108} x2={178} y2={124} />
      <T x={390} y={45} fs={12} tone="muted">
        obj だけが持つクラス
      </T>
      <T x={390} y={127} fs={12} tone="muted">
        obj.class と other.class
      </T>
    </Svg>
  )
}

/* ---------- 図 3-4 クラスと特異クラスの並行する継承 ---------- */
function ClassMethodFigure() {
  const L = 30
  const R = 330
  const rows = [
    ['User', '#<Class:User>'],
    ['Record', '#<Class:Record>'],
    ['Object', '#<Class:Object>'],
    ['BasicObject', '#<Class:BasicObject>'],
  ]
  return (
    <Svg
      id="3-4"
      w={600}
      h={330}
      label="左の列は User、Record、Object、BasicObject の superclass の連鎖。右の列はそれぞれの特異クラスで、#<Class:User> の superclass は #<Class:Record>、その superclass は #<Class:Object>、#<Class:BasicObject>、Class と続く。User.all を呼ぶと、User の特異クラス #<Class:User> から探索が始まり、#<Class:Record> に定義された all が見つかる"
    >
      <T x={L + 90} y={14} anchor="middle" fs={12} tone="muted">
        クラス
      </T>
      <T x={R + 110} y={14} anchor="middle" fs={12} tone="muted">
        特異クラス（クラスメソッドの置き場所）
      </T>
      {rows.map(([c, s], i) => {
        const y = 30 + i * 62
        return (
          <g key={c}>
            <Box x={L} y={y} w={180} h={36} lines={c} mono />
            <Box x={R} y={y} w={220} h={36} lines={i === 1 ? `${s}  all, table` : s} mono fill="box3" accent={i === 1} fs={i === 1 ? 12 : 13} />
            <Arrow x1={L + 180} y1={y + 18} x2={R - 2} y2={y + 18} dashed />
            {i < rows.length - 1 && <Arrow x1={L + 90} y1={y + 36} x2={L + 90} y2={y + 60} dashed />}
            {i < rows.length - 1 && <Arrow x1={R + 110} y1={y + 36} x2={R + 110} y2={y + 60} dashed accent={i === 0} />}
          </g>
        )
      })}
      <Box x={R} y={30 + 4 * 62} w={220} h={36} lines="Class → Module → Object …" mono fs={12} />
      <Arrow x1={R + 110} y1={30 + 3 * 62 + 36} x2={R + 110} y2={30 + 4 * 62 - 2} dashed />
      <T x={L + 190} y={20 + 18} fs={11} tone="muted">
        singleton_class
      </T>
      <T x={L} y={30 + 4 * 62 + 18} fs={12} tone="muted">
        縦の破線は superclass
      </T>
    </Svg>
  )
}

const ch03: Chapter = {
  number: 3,
  part: 1,
  title: 'モジュールと特異クラス',
  summary:
    'モジュールが ancestors のどこに入るか、super が次にどこを探すか、クラスメソッドがどこに定義されるかを説明します。Rails のクラスに数十個のモジュールが並ぶ理由と、その読み方が分かるようになります。',
  goals: [
    'include・prepend・extend で、モジュールが ancestors のどこに入るかを説明できる',
    'super が ancestors の次の要素からメソッドを探すことを理解し、複数のモジュールにまたがる呼び出し順を追える',
    '特異クラスと特異メソッドを理解し、クラスメソッドが特異クラスに定義されることを説明できる',
    'クラスメソッドが継承される理由を、特異クラスの superclass の関係で説明できる',
    'included・inherited などのフックが呼ばれる時点と、Rails での使われ方を理解する',
  ],
  prerequisites: [2],
  sections: [
    {
      id: 'module-basics',
      title: 'モジュールの2つの用途',
      body: (
        <>
          <p>
            <Term en="module">モジュール</Term>は、メソッドや定数をまとめたものです。クラスと違ってインスタンスを作れず、継承もできません。実は <code>Class</code> は <code>Module</code>{' '}
            のサブクラスで（<ChapterLink n={2} section="class-is-object" />の図2-2）、クラスは「インスタンスを作れるモジュール」とも言えます。
          </p>
          <p>モジュールには2つの用途があります。</p>
          <ol>
            <li>
              名前空間：<code>ActiveRecord::Base</code> の <code>ActiveRecord</code> のように、クラスや定数をまとめて名前の衝突を防ぎます。
            </li>
            <li>
              Mix-in：<code>include</code> などでクラスに組み込み、モジュールのメソッドをそのクラスのインスタンスのメソッドとして使えるようにします。
            </li>
          </ol>
          <p>
            Rails では両方の用途が使われています。第2章の図2-4 で見た Article の ancestors に並ぶ65個のモジュールは、2つ目の用途で <code>ActiveRecord::Base</code>{' '}
            に組み込まれたものです。保存、バリデーション、コールバックといった機能ごとにモジュールを分け、それらを <code>ActiveRecord::Base</code> に組み込む構成になっています。
          </p>
        </>
      ),
    },
    {
      id: 'include',
      title: 'include の挿入位置',
      body: (
        <>
          <p>
            クラスでモジュールを <code>include</code> すると、そのモジュールは ancestors の中で「クラスの直後」に入ります。複数のモジュールを include すると、後から include
            したものほどクラスに近い位置に入ります
            <Ref n={1} />。
          </p>
          <Code
            lang="ruby"
            code={`
module Publishable
  def publish = "#{self.class}を公開"
end

module Searchable
  def publish = "検索索引を更新してから" + super
end

class Post
  include Publishable
  include Searchable
end

Post.ancestors.take(4) # => [Post, Searchable, Publishable, Object]
Post.new.publish       # => "検索索引を更新してからPostを公開"

class Post
  include Publishable  # すでに入っているモジュールをもう一度 include しても位置は変わらない
end
Post.ancestors.take(4) # => [Post, Searchable, Publishable, Object]
`}
          />
          <p>
            <code>Post.new.publish</code> では、まず <code>Post</code> で <code>publish</code> を探します。定義が無いので次の <code>Searchable</code> を探すと見つかります。<code>Searchable#publish</code> の中の{' '}
            <code>super</code> は、ancestors で次にある <code>Publishable</code> の <code>publish</code> を呼びます。
          </p>
          <p>
            include したモジュールはクラスより後ろにあるので、クラス自身に同じ名前のメソッドを定義すると、クラスのメソッドが先に見つかります。モデルで <code>save</code>{' '}
            などのメソッドを定義すると ActiveRecord の定義を上書きでき、その中で <code>super</code> を呼べば元の処理を実行できるのは、このためです。
          </p>
        </>
      ),
    },
    {
      id: 'prepend',
      title: 'prepend：クラスより先に探されるモジュール',
      body: (
        <>
          <p>
            <code>prepend</code> は、モジュールを「クラスの手前」に入れます。クラスに同じ名前のメソッドがあっても、モジュールのメソッドが先に見つかります
            <Ref n={1} />。モジュールの中で <code>super</code> を呼ぶと、クラス自身のメソッドが呼ばれます。
          </p>
          <Code
            lang="ruby"
            code={`
module Logging
  def save
    puts "保存前: #{self.class}"
    result = super          # Draft#save を呼ぶ
    puts "保存後: #{result}"
    result
  end
end

class Draft
  prepend Logging
  def save = :ok
end

Draft.ancestors.take(3) # => [Logging, Draft, Object]
Draft.new.save
# 保存前: Draft
# 保存後: ok
# => :ok
`}
          />
          <Figure n="3-1" title="include と prepend の挿入位置" caption="include したモジュールはクラスの後ろ、prepend したモジュールはクラスの前に入る。">
            <IncludePrependFigure />
          </Figure>
          <p>
            include では、モジュールのメソッドからクラスのメソッドを <code>super</code> で呼ぶことはできません。モジュールがクラスの後ろにあるためです。既存のクラスのメソッドに前後の処理を追加したい場合は{' '}
            <code>prepend</code> を使います。
          </p>
          <p>
            Rails では、非推奨（deprecated）になったメソッドに警告を追加する処理で <code>prepend</code> が使われています。対象のメソッドと同じ名前のメソッドを持つモジュールを作り、警告を出してから{' '}
            <code>super</code> で元のメソッドを呼びます。
          </p>
          <Code
            lang="ruby"
            title="activesupport/lib/active_support/deprecation/method_wrappers.rb（53〜64行）"
            href={`${GH}/activesupport/lib/active_support/deprecation/method_wrappers.rb#L53-L64`}
            code={`
            mod ||= Module.new
            mod.module_eval do
              define_method(method_name) do |*args, &block|
                deprecator.deprecation_warning(method_name, message)
                super(*args, &block)
              end
              ruby2_keywords(method_name)
            end
          end
        end

        target_module.prepend(mod) if mod
`}
          />
          <Callout title="alias_method による包み込みとの違い">
            <p>
              <code>prepend</code> が使えるようになる前は、元のメソッドに別名を付けてから同じ名前で再定義する方法（<code>alias_method</code>）が使われていました。この方法は、複数の gem
              が同じメソッドを包むと別名が衝突しやすく、包んだ順序も追いにくいものでした。<code>prepend</code> では包み込みの順序が ancestors にそのまま表れるので、<code>ancestors</code> と{' '}
              <code>super_method</code> で確認できます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'super',
      title: 'super は ancestors の次から探す',
      body: (
        <>
          <p>
            <code>super</code> の動作を正確に言うと、「レシーバのクラスの ancestors の中で、いま実行しているメソッドの定義元（owner）より後ろにある要素から、同じ名前のメソッドを探して呼ぶ」です
            <Ref n={2} />。親クラスのメソッドを呼ぶとは限らず、間にモジュールがあればそのモジュールのメソッドが呼ばれます。
          </p>
          <p>引数の渡し方は書き方で変わります。</p>
          <ul>
            <li>
              <code>super</code>（括弧も引数もなし）：いまのメソッドが受け取った引数をそのまま渡します。ブロックも渡されます。
            </li>
            <li>
              <code>super()</code>：引数を渡しません（ブロックは渡されます）。
            </li>
            <li>
              <code>super(a, b)</code>：指定した引数を渡します。
            </li>
          </ul>
          <Code
            lang="ruby"
            code={`
class Base
  def greet(name, polite: false) = polite ? "こんにちは、#{name}さん" : "やあ、#{name}"
end

module Loud
  def greet(name, polite: false) = super.upcase   # 受け取った引数をそのまま渡す
end

module Trim
  def greet(name, polite: false)
    super(name.strip, polite: polite)             # 引数を変えて渡す
  end
end

class Child < Base
  include Loud
  include Trim
end

Child.ancestors.take(4)              # => [Child, Trim, Loud, Base]
Child.new.greet("  ruby ", polite: true) # => "こんにちは、RUBYさん"
`}
          />
          <Figure n="3-2" title="super による呼び出しと戻り値" caption="黒の矢印が呼び出し、青の矢印が戻り値。各メソッドは super の前後に自分の処理を加えている。">
            <SuperChainFigure />
          </Figure>
          <p>
            第1章で調べた <code>process_action</code> の7つの定義が上から順に呼ばれるのも、同じ規則によるものです。<code>ApplicationController.ancestors</code> から <code>process_action</code>{' '}
            を定義しているものだけを取り出すと、第1章の図1-3 と同じ順序になります。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行"
            code={`
ApplicationController.ancestors.select do |m|
  m.instance_methods(false).include?(:process_action) ||
    m.private_instance_methods(false).include?(:process_action)
end
# => [ActiveRecord::Railties::ControllerRuntime, ActionController::ParamsWrapper,
#     ActionController::Instrumentation, ActionController::Rescue,
#     AbstractController::Callbacks, ActionController::Rendering, AbstractController::Base]
`}
          />
          <p>
            どのモジュールがどの順で組み込まれるかは、各モジュールを include する順序で決まります。<code>ActionController::Base</code> がモジュールを include
            する部分は<ChapterLink n={10} />で読みます。
          </p>
        </>
      ),
    },
    {
      id: 'singleton',
      title: '特異メソッドと特異クラス',
      body: (
        <>
          <p>
            Ruby では特定の1つのオブジェクトだけにメソッドを定義できます。これを<Term en="singleton method">特異メソッド</Term>と呼びます。
          </p>
          <Code
            lang="ruby"
            code={`
obj = Object.new
def obj.greet = "この obj だけのメソッド"

obj.greet            # => "この obj だけのメソッド"
obj.singleton_methods # => [:greet]

other = Object.new
other.respond_to?(:greet) # => false
`}
          />
          <p>
            メソッドはクラスが持つ、と<ChapterLink n={2} />で説明しました。特異メソッドも例外ではなく、そのオブジェクト専用のクラスに定義されます。このクラスは <code>obj.class</code> の結果には現れません。これを<Term en="singleton class">特異クラス</Term>
            と呼び、<code>singleton_class</code> で取り出せます
            <Ref n={3} />。
          </p>
          <Code
            lang="ruby"
            code={`
obj.singleton_class                         # => #<Class:#<Object:0x00007f2b54e186e8>>
obj.singleton_class.instance_methods(false) # => [:greet]
obj.singleton_class.ancestors.take(3)
# => [#<Class:#<Object:0x00007f2b54e186e8>>, Object, Kernel]
`}
          />
          <p>
            特異クラスはそのオブジェクトのメソッド探索で最初に探される場所です。<code>obj.class</code> は <code>Object</code> のままですが、探索は特異クラスから始まり、その後に{' '}
            <code>Object</code> へ進みます。<code>#&lt;Class:...&gt;</code> は特異クラスを表す表記です。
          </p>
          <Figure n="3-3" title="オブジェクトの特異クラス" caption="青の矢印が obj のメソッド探索の始まり。other には特異クラスに定義されたメソッドが無いので、Object から探索する。">
            <SingletonFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'class-methods',
      title: 'クラスメソッドの実体',
      body: (
        <>
          <p>
            クラスもオブジェクトなので、特異クラスを持ちます。<code>def self.foo</code> や <code>class &lt;&lt; self</code> の中で定義するクラスメソッドは、クラスというオブジェクトの特異メソッド、つまりクラスの特異クラスに定義されたメソッドです
            <Ref n={3} />。
          </p>
          <Code
            lang="ruby"
            code={`
class Record
  def self.table = name.downcase + "s"     # 特異メソッドとして定義

  class << self                            # 特異クラスを開いて定義
    def all = "SELECT * FROM #{table}"
  end
end

class User < Record; end

Record.singleton_methods.sort      # => [:all, :table]
User.all                           # => "SELECT * FROM users"
User.method(:all).owner            # => #<Class:Record>
User.singleton_class.superclass    # => #<Class:Record>
User.singleton_class.ancestors.take(4)
# => [#<Class:User>, #<Class:Record>, #<Class:Object>, #<Class:BasicObject>]
`}
          />
          <p>
            <code>class &lt;&lt; self</code> は、<code>self</code>（ここでは Record）の特異クラスを開く構文です。中で <code>def</code> したメソッドは、特異クラスのインスタンスメソッド、つまり
            Record のクラスメソッドになります。
          </p>
          <p>
            子クラス <code>User</code> で親のクラスメソッド <code>all</code> を呼べるのは、<code>User</code> の特異クラスの superclass が <code>Record</code>{' '}
            の特異クラスになっているからです。クラスの継承と並行して、特異クラスの継承関係が作られます。<code>User.all</code> の中の <code>table</code> と <code>name</code> は self（
            <code>User</code>）に対して呼ばれるので、結果は <code>"users"</code> になります。
          </p>
          <Figure n="3-4" title="クラスと特異クラスの並行する継承" caption="User.all の探索は #<Class:User> から始まり、#<Class:Record> で見つかる（青の経路）。">
            <ClassMethodFigure />
          </Figure>
          <h3>Rails のモデルで確かめる</h3>
          <p>
            第1章の TracePoint の出力で、<code>published</code> の定義元が <code>#&lt;Class:Article(...)&gt;</code> と表示されていました。<code>scope</code> は、Article
            の特異クラスにメソッドを定義します。<code>ActiveRecord::Scoping::Named</code> の該当部分を引用します。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/scoping/named.rb（173〜178行）"
            href={`${GH}/activerecord/lib/active_record/scoping/named.rb#L173-L178`}
            code={`
          if body.respond_to?(:to_proc)
            singleton_class.define_method(name) do |*args|
              scope = all._exec_scope(*args, &body)
              scope = scope.extending(extension) if extension
              scope
            end
`}
          />
          <p>
            <code>singleton_class.define_method(name)</code> は「自分（Article）の特異クラスに、<code>name</code> という名前のインスタンスメソッドを定義する」という意味で、結果として{' '}
            <code>Article.published</code> というクラスメソッドができます。<code>define_method</code> とブロックの扱いは<ChapterLink n={4} />と<ChapterLink n={5} />で説明します。
          </p>
          <p>Article の特異クラスの ancestors の先頭も見ておきます。</p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行"
            code={`
Article.singleton_class.ancestors.first(4)
# => [#<Class:Article(...)>, #<Class:ApplicationRecord(abstract)>,
#     ActiveRecord::SignedId::DeprecateSignedIdVerifierSecret, #<Class:ActiveRecord::Base>]
`}
          />
          <p>
            <code>#&lt;Class:ActiveRecord::Base&gt;</code> の手前にモジュールが1つあります。これは <code>ActiveRecord::Base</code> の特異クラスに prepend
            されたモジュールです。特異クラスもクラスなので、include や prepend でモジュールを組み込めます。
          </p>
        </>
      ),
    },
    {
      id: 'extend',
      title: 'extend：特異クラスへの include',
      body: (
        <>
          <p>
            <code>obj.extend(M)</code> は、モジュール <code>M</code> を <code>obj</code> の特異クラスに include します。その結果、<code>M</code> のメソッドが <code>obj</code>{' '}
            の特異メソッドとして使えるようになります
            <Ref n={1} />。
          </p>
          <Code
            lang="ruby"
            code={`
module Greeting
  def hello = "hello from #{self}"
end

s = +"str"           # 凍結されていない文字列を作る
s.extend(Greeting)
s.hello                               # => "hello from str"
s.singleton_class.include?(Greeting)  # => true

class Tool
  extend Greeting    # self（Tool）に対する extend
end
Tool.hello                            # => "hello from Tool"
Tool.singleton_class.ancestors.take(3)
# => [#<Class:Tool>, Greeting, #<Class:Object>]
`}
          />
          <p>
            クラス本体で <code>extend M</code> と書くと、<code>M</code> のメソッドがそのクラスのクラスメソッドになります。Rails のモデルで使う <code>has_many</code> の定義元{' '}
            <code>ActiveRecord::Associations::ClassMethods</code> も、この形で組み込まれています。実際に <code>Article.singleton_class.ancestors</code>{' '}
            を調べると、このモジュールが含まれています。どのようにして extend されるかは、<ChapterLink n={5} />の <code>ActiveSupport::Concern</code> で説明します。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>書き方</th>
                  <th>モジュールが入る場所</th>
                  <th>モジュールのメソッドの使われ方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>include M</code>
                  </td>
                  <td>クラスの ancestors の、クラスの直後</td>
                  <td>インスタンスメソッド（クラス自身の定義が優先）</td>
                </tr>
                <tr>
                  <td>
                    <code>prepend M</code>
                  </td>
                  <td>クラスの ancestors の、クラスの直前</td>
                  <td>インスタンスメソッド（モジュールの定義が優先）</td>
                </tr>
                <tr>
                  <td>
                    <code>extend M</code>
                  </td>
                  <td>レシーバの特異クラスの ancestors</td>
                  <td>レシーバの特異メソッド（クラスで書けばクラスメソッド）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'hooks',
      title: 'フック：組み込まれたとき・継承されたときの処理',
      body: (
        <>
          <p>
            Ruby には、モジュールが組み込まれたときや、クラスが継承されたときに自動で呼ばれるメソッドがあります。これらを<Term en="hook">フック</Term>と呼びます
            <Ref n={1} />
            <Ref n={4} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>フック</th>
                  <th>呼ばれる時点</th>
                  <th>引数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>Module#included</code>
                  </td>
                  <td>モジュールが include された後</td>
                  <td>include したクラス（またはモジュール）</td>
                </tr>
                <tr>
                  <td>
                    <code>Module#prepended</code>
                  </td>
                  <td>モジュールが prepend された後</td>
                  <td>prepend したクラス</td>
                </tr>
                <tr>
                  <td>
                    <code>Module#extended</code>
                  </td>
                  <td>モジュールで extend された後</td>
                  <td>extend したオブジェクト</td>
                </tr>
                <tr>
                  <td>
                    <code>Class#inherited</code>
                  </td>
                  <td>クラスが継承されたとき（子クラスの本体が実行される前）</td>
                  <td>作られた子クラス</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>include の内部：append_features と included</h3>
          <p>
            <code>include M</code> を実行すると、Ruby はまず <code>M.append_features(クラス)</code> を呼んで ancestors にモジュールを挿入し、その後で{' '}
            <code>M.included(クラス)</code> を呼びます
            <Ref n={1} />。両方を定義して順序を確かめると次のようになります。
          </p>
          <Code
            lang="ruby"
            code={`
module Trackable
  def self.append_features(base)
    puts "append_features(#{base})  ancestors含む? #{base.ancestors.include?(self)}"
    super   # Module#append_features が実際の挿入を行う
    puts "super の後             ancestors含む? #{base.ancestors.include?(self)}"
  end

  def self.included(base)
    puts "included(#{base})"
    base.extend(ClassMethods)  # クラスメソッド用のモジュールを extend する
  end

  module ClassMethods
    def tracked? = true
  end
end

class Order
  include Trackable
end
# append_features(Order)  ancestors含む? false
# super の後             ancestors含む? true
# included(Order)

Order.tracked? # => true
`}
          />
          <p>
            <code>included</code> の中で <code>base.extend(ClassMethods)</code> を呼ぶ書き方は、「include するだけでインスタンスメソッドとクラスメソッドの両方を追加する」ための定番の書き方でした。
            <code>ActiveSupport::Concern</code> はこの書き方を簡潔にするためのもので、<code>append_features</code> を上書きして同じことを行います（<ChapterLink n={5} />）。
          </p>
          <h3>inherited：子クラスごとの準備</h3>
          <p>
            <code>inherited</code> は、子クラスごとに初期値を用意するときに使われます。クラスのインスタンス変数は子クラスに引き継がれないため、子クラスが作られた時点で設定します。
          </p>
          <Code
            lang="ruby"
            code={`
class Model
  def self.inherited(subclass)
    super
    subclass.instance_variable_set(:@table_name, subclass.name.downcase + "s")
  end

  def self.table_name = @table_name
end

class Invoice < Model; end
Invoice.table_name # => "invoices"
Model.table_name   # => nil
`}
          />
          <p>ActiveRecord も、モデルのクラスが作られるたびに <code>inherited</code> でキャッシュ用のインスタンス変数を初期化しています。</p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/core.rb（410〜430行）"
            href={`${GH}/activerecord/lib/active_record/core.rb#L410-L430`}
            code={`
        def inherited(subclass)
          super

          # initialize cache at class definition for thread safety
          subclass.initialize_find_by_cache
          unless subclass.base_class?
            klass = self
            until klass.base_class?
              klass.initialize_find_by_cache
              klass = klass.superclass
            end
          end

          subclass.class_eval do
            @arel_table = nil
            @predicate_builder = nil
            @inspection_filter = nil
            @filter_attributes ||= nil
            @generated_association_methods ||= nil
          end
        end
`}
          />
          <p>
            コメントにあるとおり、クラスを定義した時点でキャッシュを初期化しておくことで、複数のスレッドが同時に初回アクセスしたときの競合を避けています。最後の{' '}
            <code>@generated_association_methods</code> は、<code>comments</code> などの関連メソッドを入れるモジュール（図2-4 の添字1）を指す変数です。
          </p>
          <Callout kind="warn">
            <p>
              フックを上書きするときは、必ず <code>super</code> を呼びます。Rails の多くのモジュールが同じフック（とくに <code>inherited</code>）を使っているため、<code>super</code>{' '}
              を呼ばないと、ほかのモジュールの初期化が行われなくなります。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'refinements',
      title: 'Refinements：範囲を限定したクラスの変更',
      body: (
        <>
          <p>
            <ChapterLink n={2} section="open-class" />で説明したクラスの再オープンは、プログラム全体に影響します。<Term>Refinements</Term>{' '}
            は、変更を有効にする範囲を限定する仕組みです。<code>refine</code> で変更内容を定義し、<code>using</code> を書いたファイルやモジュールの中だけで有効になります
            <Ref n={5} />。
          </p>
          <Code
            lang="ruby"
            code={`
module StringExt
  refine String do
    def shout = upcase + "!"
  end
end

"x".respond_to?(:shout) # => false

module UsesIt
  using StringExt
  "hi".shout        # => "HI!"
  "hi".send(:shout) # => "HI!"
end

"hi".shout
# undefined method 'shout' for an instance of String (NoMethodError)
`}
          />
          <p>
            <code>using</code> の効果は、それを書いた場所からファイル（またはモジュール定義）の終わりまでです。呼び出された先のメソッドの中には及びません。このため、別のファイルのコードからは変更が見えず、gem
            同士の衝突を避けられます。
          </p>
          <p>
            Refinements は ActiveSupport のコア拡張とは異なる方法です。Rails 8.1.4.1 の各 gem の <code>lib</code> ディレクトリを筆者が検索した範囲では、<code>refine</code>{' '}
            を使ったコードは見つかりませんでした。業務のコードで見かけることは少ない機能ですが、ancestors に表れない変更なので、ancestors だけを見ても、この変更には気付けません。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>
            <code>include</code> はクラスの直後、<code>prepend</code> はクラスの直前にモジュールを入れます。後から include したモジュールほどクラスに近い位置に入ります。
          </li>
          <li>
            <code>super</code> は、レシーバのクラスの ancestors で、いまのメソッドの定義元より後ろから同じ名前のメソッドを探します。<code>process_action</code> の7段の呼び出しもこの規則で決まります。
          </li>
          <li>特異メソッドは、そのオブジェクト専用の特異クラスに定義されます。クラスメソッドは、クラスの特異クラスに定義されたメソッドです。</li>
          <li>子クラスの特異クラスの superclass は親クラスの特異クラスなので、クラスメソッドも継承されます。</li>
          <li>
            <code>extend</code> は特異クラスへの include です。<code>include</code> は内部で <code>append_features</code> → <code>included</code> の順に呼びます。
          </li>
          <li>
            <code>inherited</code> などのフックを上書きするときは <code>super</code> を呼びます。ActiveRecord は <code>inherited</code> でモデルごとのキャッシュを初期化しています。
          </li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'class Module', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Module.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'include・prepend・extend_object・append_features・included・prepended・extended の仕様。' },
    { title: 'Calling Methods（Method Lookup）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/calling_methods_rdoc.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'prepend したモジュール、クラス、include したモジュール、superclass の順に探索する規則。' },
    { title: 'Modules and Classes（Singleton Classes）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/modules_and_classes_rdoc.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: '特異クラス、class << self、クラスメソッドの定義場所。' },
    { title: 'class Class', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Class.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'Class#inherited が呼ばれる時点。' },
    { title: 'Refinements', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/refinements_rdoc.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'refine と using、有効範囲（クラス・モジュール定義の終わり、またはトップレベルならファイルの終わりまで）、レキシカルスコープであること。' },
    { title: 'activesupport/lib/active_support/deprecation/method_wrappers.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/deprecation/method_wrappers.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'prepend したモジュールで警告を出してから super を呼ぶ実装。' },
    { title: 'activerecord/lib/active_record/core.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/core.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'inherited でモデルごとのキャッシュを初期化する実装。' },
    { title: 'activerecord/lib/active_record/scoping/named.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/scoping/named.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'scope が singleton_class.define_method でクラスメソッドを定義する実装。' },
  ],
}

export default withExplanations(ch03, explanation03)
