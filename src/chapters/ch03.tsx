import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation03 } from '../explanations/ruby'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 3-1 継承とメソッドを探す順番 ---------- */
function InheritFigure() {
  const left = [
    { n: ['PostsController', 'index / greeting'], fill: 'box' as const },
    { n: ['BaseController', 'render / greeting'], fill: 'box' as const },
    { n: ['Object'], fill: 'box' as const },
    { n: ['Kernel'], fill: 'box2' as const },
    { n: ['BasicObject'], fill: 'box' as const },
  ]
  const right = ['ArticlesController', 'ApplicationController', 'ActionController::Base', 'ActionController::Metal', 'AbstractController::Base', 'Object → … → BasicObject']
  return (
    <Svg
      id="3-1"
      w={780}
      h={340}
      label="左は PostsController の ancestors。PostsController、BaseController、Object、Kernel、BasicObject の順にメソッドを探す。c.index と c.greeting は PostsController で見つかり、index の中の render は BaseController で見つかる。PostsController の greeting の中の super は BaseController の greeting を呼ぶ。右はデモのアプリの ArticlesController の superclass をたどった結果で、ApplicationController、ActionController::Base、ActionController::Metal、AbstractController::Base、Object の順。上の2つはアプリのクラス、それより下は Rails のクラス"
    >
      <T x={20} y={18} bold>
        PostsController の ancestors
      </T>
      {left.map((b, i) => (
        <g key={b.n[0]}>
          <Box x={20} y={34 + i * 56} w={180} h={b.n.length > 1 ? 44 : 34} lines={b.n} mono fs={12} fill={b.fill} bold={b.n.length > 1} />
          {i < left.length - 1 && <Arrow x1={110} y1={34 + i * 56 + (b.n.length > 1 ? 44 : 34)} x2={110} y2={34 + (i + 1) * 56 - 2} />}
        </g>
      ))}
      <T x={212} y={50} fs={11.5} tone="acc">
        c.index・c.greeting が見つかる
      </T>
      <T x={212} y={106} fs={11.5} tone="acc">
        render が見つかる
      </T>
      <T x={212} y={124} fs={11.5} tone="muted">
        greeting の super の行き先
      </T>

      <T x={430} y={18} bold>
        ArticlesController の superclass
      </T>
      {right.map((name, i) => (
        <g key={name}>
          <Box x={430} y={34 + i * 46} w={230} h={32} lines={name} mono fs={12} fill={i < 2 ? 'box5' : 'box'} />
          {i < right.length - 1 && <Arrow x1={545} y1={66 + i * 46} x2={545} y2={78 + i * 46} />}
        </g>
      ))}
      <T x={672} y={62} fs={11.5} tone="muted">
        アプリで
      </T>
      <T x={672} y={80} fs={11.5} tone="muted">
        定義する
      </T>
      <T x={672} y={176} fs={11.5} tone="muted">
        Rails が
      </T>
      <T x={672} y={194} fs={11.5} tone="muted">
        定義する
      </T>
      <T x={20} y={322} fs={11.5} tone="muted">
        矢印は上から下へ。メソッドは上から順に探し、最初に見つかった定義を実行する
      </T>
    </Svg>
  )
}

/* ---------- 図 3-2 include したモジュールの位置 ---------- */
function IncludeShareFigure() {
  const rows: { y: number; i?: number; name?: string; dots?: string; mod?: boolean }[] = [
    { y: 34, i: 0, name: 'ActionController::Base' },
    { y: 78, dots: '1〜27番目（Turbo のモジュールなど）' },
    { y: 92, i: 28, name: 'ActionController::Cookies', mod: true },
    { y: 136, dots: '…' },
    { y: 150, i: 33, name: 'ActionController::MimeResponds', mod: true },
    { y: 194, dots: '…' },
    { y: 208, i: 47, name: 'ActionController::Redirecting', mod: true },
    { y: 252, dots: '…（59番目まで、すべてモジュール）' },
    { y: 266, i: 60, name: 'ActionController::Metal' },
  ]
  return (
    <Svg
      id="3-2"
      w={780}
      h={340}
      label="左は User と Shop の ancestors。どちらのクラスでも、include した Greeting がクラスのすぐ後ろに入り、その後に Object、Kernel、BasicObject が続く。Greeting は1つのモジュールで、両方のクラスの ancestors に入る。右は ActionController::Base の ancestors の一部。0番目が ActionController::Base、28番目に Cookies、33番目に MimeResponds、47番目に Redirecting があり、60番目の ActionController::Metal までの間の59個はすべてモジュール"
    >
      <T x={20} y={18} bold>
        User と Shop の ancestors
      </T>
      <Box x={20} y={40} w={110} h={34} lines="User" mono />
      <Box x={20} y={120} w={110} h={34} lines="Shop" mono />
      <Box x={190} y={64} w={150} h={50} lines={['Greeting', 'hello']} mono fs={12.5} fill="box2" bold accent />
      <Arrow x1={130} y1={57} x2={188} y2={82} />
      <Arrow x1={130} y1={137} x2={188} y2={100} />
      <Box x={190} y={160} w={150} h={32} lines="Object" mono fs={12.5} />
      <Box x={190} y={210} w={150} h={32} lines="Kernel" mono fs={12.5} fill="box2" />
      <Box x={190} y={260} w={150} h={32} lines="BasicObject" mono fs={12.5} />
      <Arrow x1={265} y1={114} x2={265} y2={158} />
      <Arrow x1={265} y1={192} x2={265} y2={208} />
      <Arrow x1={265} y1={242} x2={265} y2={258} />
      <T x={20} y={322} fs={11.5} tone="muted">
        Greeting は1つのモジュールで、両方の ancestors に入る
      </T>

      <T x={430} y={18} bold>
        ActionController::Base.ancestors（一部）
      </T>
      {rows.map((r) =>
        r.dots ? (
          <T key={r.y} x={470} y={r.y + 2} fs={11} tone="muted">
            {r.dots}
          </T>
        ) : (
          <g key={r.y}>
            <T x={455} y={r.y + 15} fs={11} tone="muted" mono anchor="end">
              {String(r.i)}
            </T>
            <Box x={462} y={r.y} w={290} h={30} lines={r.name} mono fs={12} fill={r.mod ? 'box2' : 'box'} />
          </g>
        ),
      )}
      <T x={430} y={322} fs={11.5} tone="muted">
        左の数字は配列の添字（全69個のうち、クラスは5つ）
      </T>
    </Svg>
  )
}

/* ---------- 図 3-3 include と prepend の挿入位置 ---------- */
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
      id="3-3"
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

/* ---------- 図 3-4 super による呼び出しと戻り値 ---------- */
function SuperChainFigure() {
  return (
    <Svg
      id="3-4"
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

/* ---------- 図 3-5 オブジェクトの特異クラス ---------- */
function SingletonFigure() {
  return (
    <Svg
      id="3-5"
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

/* ---------- 図 3-6 クラスと特異クラスの並行する継承 ---------- */
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
      id="3-6"
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

/* ---------- include を1行ずつ実行したときの ancestors（include の節） ---------- */
function IncludeOrderFigure() {
  const cols: { title: string; code: string; items: string[]; added?: string; notes: { t: string; acc?: boolean }[] }[] = [
    { title: 'include する前', code: 'class Post', items: ['Post', 'Object'], notes: [] },
    { title: '1つ目の include の後', code: 'include Publishable', items: ['Post', 'Publishable', 'Object'], added: 'Publishable', notes: [{ t: 'Post の直後に入る', acc: true }] },
    {
      title: '2つ目の include の後',
      code: 'include Searchable',
      items: ['Post', 'Searchable', 'Publishable', 'Object'],
      added: 'Searchable',
      notes: [{ t: 'Post の直後に入る', acc: true }, { t: 'Publishable は1つ後ろになる' }],
    },
    { title: 'もう一度 include した後', code: 'include Publishable', items: ['Post', 'Searchable', 'Publishable', 'Object'], notes: [{ t: '並びは変わらない' }] },
  ]
  return (
    <Svg
      id="ch03-include-order"
      w={780}
      h={330}
      label="Post に Publishable と Searchable を順に include したときの ancestors の変化。include する前は Post、Object の順。include Publishable の後は Post、Publishable、Object の順で、Publishable は Post の直後に入る。include Searchable の後は Post、Searchable、Publishable、Object の順で、Searchable も Post の直後に入り、Publishable は1つ後ろになる。もう一度 include Publishable しても、並びは変わらない"
    >
      {cols.map((c, ci) => {
        const cx = 97 + ci * 195
        return (
          <g key={c.title}>
            <T x={cx} y={18} anchor="middle" bold fs={12.5}>
              {c.title}
            </T>
            <T x={cx} y={38} anchor="middle" fs={12} tone="muted" mono>
              {c.code}
            </T>
            {c.items.map((n, i) => (
              <g key={n}>
                <Box x={cx - 75} y={58 + i * 50} w={150} h={34} lines={n} mono fs={12.5} fill={n === 'Post' || n === 'Object' ? 'box' : 'box2'} accent={n === c.added} />
                {i < c.items.length - 1 && <Arrow x1={cx} y1={92 + i * 50} x2={cx} y2={106 + i * 50} />}
              </g>
            ))}
            {c.notes.map((note, i) => (
              <T key={note.t} x={cx} y={272 + i * 18} anchor="middle" fs={11.5} tone={note.acc ? 'acc' : 'muted'}>
                {note.t}
              </T>
            ))}
          </g>
        )
      })}
      <T x={20} y={318} fs={11.5} tone="muted">
        上から下へ探索する。青い枠はその列の include で入ったモジュール
      </T>
    </Svg>
  )
}

/* ---------- scope を定義する時点と呼び出す時点（class-methods の節） ---------- */
function ScopeTimingFigure() {
  return (
    <Svg
      id="ch03-scope-timing"
      w={780}
      h={430}
      label="左は定義の時点。Article の本体で scope :published, -> { where(published: true) } を実行すると、self は Article なので、singleton_class.define_method(:published) が Article の特異クラス #<Class:Article(...)> に published を定義する。ブロックが published の本体になる。右は呼び出しの時点。Article.published を呼ぶと、特異クラスで published が見つかり、named.rb の174行目から本体を実行する。all は全件の Relation を返し、_exec_scope は self をその Relation にして lambda を実行する。lambda の中の where(published: true) は Relation に対して呼ばれ、lambda を実行して得た Relation が Article.published の戻り値になる"
    >
      <T x={20} y={18} bold>
        定義の時点
      </T>
      <T x={20} y={36} fs={11.5} tone="muted">
        Article の本体で scope の行を実行する
      </T>
      <Box x={20} y={52} w={310} h={48} lines={['scope :published,', '  -> { where(published: true) }']} mono fs={12} fill="bg" align="start" />
      <Arrow x1={110} y1={100} x2={110} y2={134} />
      <T x={122} y={117} fs={11.5} tone="muted">
        self は Article
      </T>
      <Box x={20} y={136} w={310} h={34} lines="singleton_class.define_method(:published)" mono fs={11.5} />
      <Arrow x1={110} y1={170} x2={110} y2={204} />
      <T x={122} y={187} fs={11.5} tone="muted">
        ブロックを本体にして定義
      </T>
      <Box x={20} y={206} w={310} h={50} lines={['#<Class:Article(...)>', 'published']} mono fill="box3" bold accent />

      <T x={430} y={18} bold>
        呼び出しの時点
      </T>
      <T x={430} y={36} fs={11.5} tone="muted">
        Article.published を呼ぶたびに実行する
      </T>
      <Box x={430} y={52} w={240} h={34} lines="Article.published" mono fill="bg" />
      <Arrow x1={520} y1={86} x2={290} y2={204} accent />
      <T x={420} y={150} fs={11.5} tone="acc">
        特異クラスで見つかる
      </T>
      <Arrow x1={330} y1={231} x2={428} y2={231} accent />
      <T x={379} y={221} anchor="middle" fs={11.5} tone="acc">
        本体を実行
      </T>
      <T x={379} y={245} anchor="middle" fs={11} tone="muted" mono>
        named.rb:174
      </T>
      <Box x={430} y={214} w={240} h={34} lines="all._exec_scope(*args, &body)" mono fs={12} />
      <T x={680} y={224} fs={11.5} tone="muted">
        all は全件の
      </T>
      <T x={680} y={240} fs={11.5} tone="muted">
        Relation
      </T>
      <Arrow x1={520} y1={248} x2={520} y2={298} />
      <T x={532} y={273} fs={11.5} tone="muted">
        self を Relation にして lambda を実行
      </T>
      <Box x={430} y={300} w={240} h={34} lines="where(published: true)" mono fs={12} />
      <Arrow x1={520} y1={334} x2={520} y2={378} />
      <T x={532} y={356} fs={11.5} tone="muted">
        lambda を実行して得た Relation を返す
      </T>
      <Box x={430} y={380} w={240} h={44} lines={['Relation', 'Article.published の戻り値']} fs={12.5} fill="bg" bold subTone="muted" />
    </Svg>
  )
}

/* ---------- extend したモジュールの位置（extend の節） ---------- */
function ExtendLookupFigure() {
  const L = 30
  const R = 330
  const left = ['Tool', 'Object', 'Kernel', 'BasicObject']
  return (
    <Svg
      id="ch03-extend-lookup"
      w={600}
      h={310}
      label="左は Tool.new.hello で探す順番で、Tool.ancestors の Tool、Object、Kernel、BasicObject。Greeting は入っていないので hello が見つからず、NoMethodError になる。右は Tool.hello で探す順番で、Tool.singleton_class.ancestors の #<Class:Tool>、Greeting、#<Class:Object>。extend した Greeting が #<Class:Tool> のすぐ後ろに入っていて、そこで hello が見つかる"
    >
      <T x={L + 90} y={16} anchor="middle" bold fs={12.5}>
        Tool.new.hello の探索
      </T>
      <T x={L + 90} y={34} anchor="middle" fs={11.5} tone="muted" mono>
        Tool.ancestors
      </T>
      <T x={R + 110} y={16} anchor="middle" bold fs={12.5}>
        Tool.hello の探索
      </T>
      <T x={R + 110} y={34} anchor="middle" fs={11.5} tone="muted" mono>
        Tool.singleton_class.ancestors
      </T>
      {left.map((n, i) => (
        <g key={n}>
          <Box x={L} y={50 + i * 56} w={180} h={34} lines={n} mono fill={n === 'Kernel' ? 'box2' : 'box'} />
          {i < left.length - 1 && <Arrow x1={L + 90} y1={84 + i * 56} x2={L + 90} y2={104 + i * 56} />}
        </g>
      ))}
      <T x={L + 90} y={272} anchor="middle" fs={11.5} tone="danger">
        hello が見つからず NoMethodError
      </T>

      <Box x={R} y={50} w={220} h={34} lines="#<Class:Tool>" mono fill="box3" />
      <Arrow x1={L + 180} y1={67} x2={R - 2} y2={67} dashed />
      <T x={L + 190} y={57} fs={11} tone="muted">
        singleton_class
      </T>
      <Arrow x1={R + 110} y1={84} x2={R + 110} y2={104} accent />
      <Box x={R} y={106} w={220} h={44} lines={['Greeting', 'hello']} mono fill="box2" bold accent />
      <T x={R - 10} y={128} anchor="end" fs={11.5} tone="acc">
        hello が見つかる
      </T>
      <Arrow x1={R + 110} y1={150} x2={R + 110} y2={170} />
      <Box x={R} y={172} w={220} h={34} lines="#<Class:Object>" mono fill="box3" />
      <T x={R + 110} y={224} anchor="middle" fs={12} tone="muted">
        …
      </T>
    </Svg>
  )
}

const ch03: Chapter = {
  number: 3,
  part: 1,
  title: 'モジュールと特異クラス',
  summary:
    'コントローラーは、自分のファイルに定義されていないメソッドも呼べます。親クラスから受け継ぐ場合と、複数のクラスでメソッドを共有する場合を比べ、同じ名前のメソッドがあるときの呼び出し順を追います。',
  goals: [
    '親クラスやモジュールからどのメソッドを使えるか、ancestors の表示から読み取れる',
    'include と prepend で呼び出し順がどう変わり、super がどの定義へ進むかを説明できる',
    '記事1件に対する呼び出しと Article クラスに対する呼び出しを区別し、クラスメソッドの定義場所を調べられる',
  ],
  prerequisites: [2],
  sections: [
    {
      id: 'inheritance',
      title: '継承でメソッドを受け継ぐ',
      body: (
        <>
          <p>
            Rails のコントローラーのファイルは、<code>class ArticlesController &lt; ApplicationController</code> のように始まります。この <code>&lt;</code> は<Term en="inheritance">継承</Term>
            を表します。<code>class A &lt; B</code> と書くと、クラス A はクラス B に定義されたメソッドを使えるようになります。B を A の<Term en="superclass">スーパークラス</Term>、A を B の
            <Term en="subclass">サブクラス</Term>と呼び、親クラス、子クラスとも呼びます
            <Ref n={3} />。
          </p>
          <p>Rails のコントローラーをまねた小さな例で確かめます。</p>
          <Code
            lang="ruby"
            title="inherit.rb"
            code={`
class BaseController
  def render(text) = "<html>#{text}</html>"
  def greeting = "ようこそ"
end

class PostsController < BaseController
  def index = render("記事の一覧")              # render は BaseController のメソッド
  def greeting = super + "（記事のページ）"     # 親の greeting の戻り値に付け足す
end

c = PostsController.new
puts c.index
puts c.greeting
p PostsController.superclass
p PostsController.ancestors
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
<html>記事の一覧</html>
ようこそ（記事のページ）
BaseController
[PostsController, BaseController, Object, Kernel, BasicObject]
`}
          />
          <p>
            PostsController には render を定義していませんが、index の中の <code>render("記事の一覧")</code> は親クラス BaseController の render として実行されました。greeting
            は両方のクラスに定義されているので、子クラス PostsController の定義が使われます。子クラスの greeting の中の <code>super</code> は、親クラスにある同じ名前のメソッドを呼びます。ここでは
            BaseController の greeting が返した「ようこそ」に、「（記事のページ）」を付け足しています。
          </p>
          <p>
            <code>superclass</code> は親クラスを返します。<code>ancestors</code> はメソッドを探す順番をクラスの配列で返します（<ChapterLink n={2} section="method-lookup" />
            ）。<code>c.index</code> を呼ぶと、Ruby は PostsController、BaseController、Object…の順に index を探し、最初に見つかった定義を実行します（図 3-1）。Object・Kernel・BasicObject
            は、親を書かずに定義したクラスの ancestors にも入る、Ruby に最初からあるものです。Kernel は次の節で説明するモジュールです。
          </p>
          <p>デモのアプリのクラスでも、親クラスをたどりました。</p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（デモのアプリ）"
            code={`
ArticlesController.superclass     # => ApplicationController
ApplicationController.superclass  # => ActionController::Base
Article.superclass                # => ApplicationRecord(abstract)
ApplicationRecord.superclass      # => ActiveRecord::Base
`}
          />
          <p>
            rails new で作ったアプリケーションでは、コントローラーは ApplicationController を継承し、ApplicationController は Rails の ActionController::Base を継承します
            <Ref n={9} />。モデルも同じ形で、Article は ApplicationRecord を、ApplicationRecord は ActiveRecord::Base を継承します
            <Ref n={10} />。すべてのコントローラーで使う処理は ApplicationController に、すべてのモデルで使う処理は ApplicationRecord に書けば、継承によってそれぞれのクラスから呼べます。
            <code>(abstract)</code> は、ApplicationRecord が継承されるためだけのクラス（抽象クラス）で、対応するテーブルを持たないことを表しています。
          </p>
          <p>
            では、コントローラーで使う respond_to や cookies は、どこに定義されているのでしょうか。<code>instance_method(:名前).owner</code>{' '}
            は、そのメソッドを定義しているクラスやモジュールを返します（<ChapterLink n={1} section="find-source" />
            ）。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（デモのアプリ）"
            code={`
ArticlesController.instance_method(:respond_to).owner # => ActionController::MimeResponds
ArticlesController.instance_method(:cookies).owner    # => ActionController::Cookies
ActionController::Base.ancestors.size                 # => 69
ActionController::Base.ancestors.select { |m| m.instance_of?(Class) }
# => [ActionController::Base, ActionController::Metal, AbstractController::Base, Object, BasicObject]
`}
          />
          <p>
            どちらの定義元も図 3-1 の右側に並ぶクラスではありません。ActionController::Base の ancestors には69個が並び、そのうちクラス（<code>instance_of?(Class)</code>{' '}
            が真のもの）は5つだけで、残りの64個はモジュールです。親クラスは1つしか指定できないので、Rails は機能ごとにモジュールを作り、ActionController::Base に組み込んでいます。次の節ではモジュールの作り方と組み込み方を確かめます。
          </p>
          <Figure n="3-1" title="継承とメソッドを探す順番" caption="左は inherit.rb の PostsController、右はデモのアプリで superclass をたどった結果（Rails 8.1.4.1）。">
            <InheritFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'module-include',
      title: 'モジュールを include してメソッドを共有する',
      body: (
        <>
          <p>
            <Term en="module">モジュール</Term>はメソッドをまとめて名前を付けたものです。<code>module 名前 … end</code> の中にメソッドを定義し、クラスの本体に{' '}
            <code>include モジュール名</code> と書くと、そのクラスのインスタンスからモジュールのメソッドを呼べます
            <Ref n={1} />。継承と違って、1つのクラスに複数のモジュールを include でき、親子の関係が無いクラスどうしでも同じモジュールを使えます。
          </p>
          <Code
            lang="ruby"
            title="module_share.rb"
            code={`
module Greeting
  def hello = "こんにちは、#{name}です"
end

class User
  include Greeting
  def initialize(name) = @name = name
  def name = @name
end

class Shop
  include Greeting
  def name = "Ruby書店"
end

puts User.new("田中").hello
puts Shop.new.hello
p User.ancestors
p Shop.ancestors
p User.include?(Greeting)
p User.instance_method(:hello).owner
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
こんにちは、田中です
こんにちは、Ruby書店です
[User, Greeting, Object, Kernel, BasicObject]
[Shop, Greeting, Object, Kernel, BasicObject]
true
Greeting
`}
          />
          <p>
            User と Shop には継承の関係がありませんが、どちらのインスタンスからも Greeting の hello を呼べました。hello の中の name は hello を呼んだインスタンスの name メソッドを呼ぶので、User
            では「田中」、Shop では「Ruby書店」になります。ancestors を見ると、include したモジュールがクラスのすぐ後ろに入っています（図 3-2）。User のインスタンスで hello を探すと、User
            には無く、次の Greeting で見つかります。include はモジュールのメソッドをクラスに写すのではなく、メソッドを探す順番にモジュールを加えます。<code>include?</code>{' '}
            はモジュールが ancestors に入っているかを返し、<code>owner</code> は hello の定義元が Greeting のままであることを示しています。
          </p>
          <p>
            ActionController::Base も同じ書き方で機能ごとのモジュールを include しています
            <Ref n={11} />。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_controller/base.rb（272〜289行）"
            href={`${GH}/actionpack/lib/action_controller/base.rb#L272-L289`}
            code={`
    include AbstractController::Rendering
    include AbstractController::Translation
    include AbstractController::AssetPaths
    include Helpers
    include UrlFor
    include Redirecting
    include ActionView::Layouts
    include Rendering
    include Renderers::All
    include ConditionalGet
    include EtagWithTemplateDigest
    include EtagWithFlash
    include Caching
    include MimeResponds
    include ImplicitRender
    include StrongParameters
    include ParameterEncoding
    include Cookies
`}
          />
          <p>
            前の節で owner として出てきた MimeResponds と Cookies が、ここで include されています（このファイルは ActionController の中に書かれているので、<code>ActionController::</code>{' '}
            を付けずに書けます）。ArticlesController のインスタンスで respond_to を呼ぶと、Ruby は ArticlesController、ApplicationController、ActionController::Base
            の順に探し、その後ろに並ぶモジュールの中で MimeResponds の respond_to を見つけます。モデルの ActiveRecord::Base も同じで、保存、バリデーション（保存の前に値を検査する機能）、コールバック（保存などの前後に自動で呼ばれる処理）を、それぞれ
            Persistence・Validations・Callbacks というモジュールに分けて include しています
            <Ref n={12} />。
          </p>
          <Figure n="3-2" title="include したモジュールの位置" caption="左は module_share.rb の実行結果、右はデモのアプリでの ActionController::Base.ancestors の一部（Rails 8.1.4.1）。">
            <IncludeShareFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'class-method-intro',
      title: 'クラスに対して呼ぶメソッド',
      body: (
        <>
          <p>
            Rails のコードには <code>Article.find(1)</code> や <code>Article.where(...)</code> のようにクラスの名前に続けて呼ぶメソッドと、<code>article.title</code> や{' '}
            <code>article.save</code> のように、find などで取り出したインスタンスに対して呼ぶメソッドがあります。クラスに対して呼ぶものを<Term en="class method">クラスメソッド</Term>
            、インスタンスに対して呼ぶものを<Term en="instance method">インスタンスメソッド</Term>と呼びます。ここまでの2つの節で扱ったメソッドは、すべてインスタンスメソッドです。
          </p>
          <Code
            lang="ruby"
            title="class_method.rb"
            code={`
class Book
  def self.table = "books"    # クラスメソッド：Book に対して呼ぶ
  def title = "Ruby入門"       # インスタンスメソッド：Book.new に対して呼ぶ
end

p Book.table
p Book.new.title
begin
  Book.title
rescue NoMethodError => e
  puts e.message
end
begin
  Book.new.table
rescue NoMethodError => e
  puts e.message
end
p Book.singleton_methods
p Book.instance_methods(false)
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
"books"
"Ruby入門"
undefined method 'title' for class Book
undefined method 'table' for an instance of Book
[:table]
[:title]
`}
          />
          <p>
            メソッド名の前に <code>self.</code> を付けて定義すると、クラスメソッドになります。クラスの本体の中では、self はそのクラス自身を指すからです（
            <ChapterLink n={2} section="self" />
            ）
            <Ref n={3} />。Book.table はクラスに対して呼べますが、インスタンスに対しては呼べません。title はその逆です。エラーの文の <code>for class Book</code> はクラスに対して呼んだこと、
            <code>for an instance of Book</code> はインスタンスに対して呼んだことを表しています。<code>singleton_methods</code> はクラスメソッドの名前の一覧を、
            <code>instance_methods(false)</code> はそのクラス自身に定義したインスタンスメソッドの名前の一覧を返します。
          </p>
          <p>デモのアプリの Article で、クラスメソッドの定義元を調べました。</p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（デモのアプリ。表示の一部を省略）"
            code={`
Article.method(:find).owner      # => ActiveRecord::Core::ClassMethods
Article.method(:has_many).owner  # => ActiveRecord::Associations::ClassMethods
Article.method(:recent).owner    # => #<Class:Article (...)>
Article.new.respond_to?(:has_many) # => false
`}
          />
          <p>
            <code>method(:名前).owner</code> は、そのオブジェクトに対して呼べるメソッドの定義元を返します。モデルの本体に書く has_many も、Article というクラスに対して呼ぶクラスメソッドで（
            <ChapterLink n={2} section="rails-syntax" />
            ）、インスタンスに対しては呼べません。find と has_many の定義元は、どちらも ClassMethods という名前のモジュールでした。前の節の include ではモジュールのメソッドがインスタンスメソッドになりましたが、モジュールのメソッドをクラスメソッドとして加える方法もあり、Rails
            はそれを使っています（「extend：特異クラスへの include」の節）。
          </p>
          <p>
            デモの Article には <code>scope :recent, -&gt; {'{ order(published_at: :desc) }'}</code> と書いてあり、この行で recent というクラスメソッドができます。その定義元は{' '}
            <code>#&lt;Class:Article (...)&gt;</code> と表示されました。これは Article というクラスのためだけに Ruby が用意するクラスで、特異クラスと呼びます。<code>#&lt;Class:名前&gt;</code> という表示は「その名前のクラスの特異クラス」と読みます。Article の後ろの括弧は Rails
            がモデルの表示に付け足す部分で、ここでは中身を <code>(...)</code> と省略しています。クラスメソッドが特異クラスに定義される仕組みは、「特異メソッドと特異クラス」と「クラスメソッドの実体」の節で説明します。
          </p>
          <p>
            この章ではここまでの3つの節で見た継承、モジュールの include、クラスメソッドを詳しく扱います。モジュールが ancestors のどこに入るか、super が次にどこを探すか、クラスメソッドがどこに定義されるかを順に確かめます。最初に、モジュールの2つの用途を整理します。
          </p>
        </>
      ),
    },
    {
      id: 'module-basics',
      title: 'モジュールの2つの用途',
      body: (
        <>
          <p>
            <Term en="module">モジュール</Term>は、メソッドや定数をまとめたものです。クラスと違ってインスタンスを作れず、継承もできません。実は <code>Class</code> は <code>Module</code>{' '}
            のサブクラスで（<ChapterLink n={2} section="class-is-object" />の図2-4）、クラスは「インスタンスを作れるモジュール」とも言えます。
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
            Rails では両方の用途が使われています。第2章の図2-6 で見た Article の ancestors に並ぶ65個のモジュールは、2つ目の用途で <code>ActiveRecord::Base</code>{' '}
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
            <code>take(4)</code> は配列の先頭から4つを取り出すメソッドで、ここでは ancestors の先頭だけを表示するために使っています。後から include した Searchable が、先に include した Publishable より前に並んでいます。
          </p>
          <p>
            次の図は上のコードの include を上から順に実行したときの ancestors を、左の列から並べたものです。新しく include したモジュールは、どの列でも Post のすぐ後ろに入ります。
          </p>
          <Figure title="include を1行ずつ実行したときの ancestors" caption="Object より後ろの Kernel と BasicObject は省略しています。">
            <IncludeOrderFigure />
          </Figure>
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
          <p>
            <code>Draft.ancestors</code> の先頭は Logging で、Draft はその次です。<code>Draft.new.save</code> を呼ぶと、Ruby は先頭の Logging で save を見つけて実行します。Logging の save は「保存前」を表示し、
            <code>super</code> で次の Draft の save を呼びます。Draft の save が返した <code>:ok</code> を result に入れ、「保存後」を表示してから、同じ値を返します。コメントに書いた出力の3行は、この順に対応しています。
          </p>
          <Figure n="3-3" title="include と prepend の挿入位置" caption="include したモジュールはクラスの後ろ、prepend したモジュールはクラスの前に入る。">
            <IncludePrependFigure />
          </Figure>
          <p>
            include では、モジュールのメソッドからクラスのメソッドを <code>super</code> で呼ぶことはできません。モジュールがクラスの後ろにあるためです。上の例の <code>prepend Logging</code> を <code>include Logging</code> に変えると、ancestors は{' '}
            <code>[Draft, Logging, Object]</code> になります。Draft の save が先に見つかるので、Logging の save は実行されず、「保存前」も表示されません。既存のクラスのメソッドに前後の処理を追加したい場合は{' '}
            <code>prepend</code> を使います。
          </p>
          <p>
            あるメソッドを呼んだとき、クラスに書いた定義より先に別の処理が実行されているように見える場合は、gem などが prepend したモジュールが無いかを確かめます。<code>ancestors</code>{' '}
            でクラスより前に並んでいるモジュールが、prepend されたモジュールです。<code>instance_method(:名前).owner</code> は最初に見つかる定義の定義元を返し、<code>super_method</code> はその定義の中の super
            が呼ぶ次の定義を返します（<ChapterLink n={1} section="find-source" />
            ）。
          </p>
          <Code
            lang="ruby"
            title="上の Draft で、save の定義元を順に調べる"
            code={`
Draft.instance_method(:save).owner              # => Logging（最初に実行される定義）
Draft.instance_method(:save).super_method.owner # => Draft（Logging の super が呼ぶ定義）
`}
          />
          <p>
            Rails では、非推奨（deprecated。将来のバージョンで削除する予定であること）になったメソッドに警告を追加する処理で <code>prepend</code> が使われています。対象のメソッドと同じ名前のメソッドを持つモジュールを作り、警告を出してから{' '}
            <code>super</code> で元のメソッドを呼びます。引用の中の <code>define_method</code> は、名前を指定してメソッドを定義するメソッドです（<ChapterLink n={5} section="define-method" />
            ）。次の引用では、モジュールを作る行、その中にメソッドを定義する行、prepend する行の3つを確かめます。
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
          <p>
            この引用は <code>deprecate_methods(target_module, *method_names)</code> というメソッドの後半です。target_module は警告を付ける対象のクラスかモジュール、method_name
            は対象のメソッドの名前（シンボル）です。引用したのは、target_module にその名前のメソッドがまだ定義されていない場合に実行される分岐です。すでに定義されている場合は、手前の43〜51行が、警告を出してから元の処理を呼ぶメソッドに定義し直します。
          </p>
          <ul>
            <li>
              <code>mod ||= Module.new</code>：名前の無い新しいモジュールを作り、変数 mod に入れます。<code>||=</code> は mod が nil のときだけ代入するので、対象のメソッドが複数あっても、作るモジュールは1つです。
            </li>
            <li>
              <code>mod.module_eval do … end</code>：self を mod にしてブロックを実行します（<ChapterLink n={4} section="self-switch" />
              ）。そのため、ブロックの中の define_method は mod にメソッドを定義します。
            </li>
            <li>
              <code>define_method(method_name) do |*args, &amp;block| … end</code>：対象と同じ名前のメソッドを定義します。<code>*args</code> は呼び出しのときに渡された引数のすべて、<code>&amp;block</code>{' '}
              は渡されたブロックです。
            </li>
            <li>
              <code>deprecator.deprecation_warning(method_name, message)</code>：<code>DEPRECATION WARNING:</code> で始まる警告を出します。
            </li>
            <li>
              <code>super(*args, &amp;block)</code>：受け取った引数とブロックをそのまま渡して、ancestors で mod より後ろにある同じ名前のメソッドを呼びます。mod は最後の行で target_module
              の手前に入るので、次に探されるのは target_module と、その後ろに並ぶクラスやモジュールです。
            </li>
            <li>
              <code>ruby2_keywords(method_name)</code>：<code>*args</code> で受け取ったキーワード引数を、super に渡すときにもキーワード引数として渡すための指定です。
            </li>
            <li>
              <code>target_module.prepend(mod) if mod</code>：mod が作られていれば、target_module に prepend します。prepend はメソッドなので、クラスの本体の外からもレシーバを付けて呼べます。
            </li>
          </ul>
          <Callout title="alias_method による包み込みとの違い">
            <Code
              lang="ruby"
              title="alias_method で save の前に処理を足す"
              code={`
class Memo
  def save = :ok
end

class Memo
  alias_method :save_without_log, :save  # 元の save に別名を付ける
  def save                               # 同じ名前で定義し直す
    puts "保存前"
    save_without_log                     # 別名で元の処理を呼ぶ
  end
end

Memo.new.save
# 保存前
# => :ok
Memo.instance_methods(false).sort # => [:save, :save_without_log]
`}
            />
            <p>
              <code>prepend</code> が使えるようになる前は、上の例のように、元のメソッドに別名を付けてから同じ名前で再定義する方法（<code>alias_method</code>）が使われていました。ancestors は変わらず、Memo に save_without_log
              というメソッドが1つ増えます。この方法は、複数の gem
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
            <Ref n={2} />。親クラスのメソッドを呼ぶとは限らず、間にモジュールがあればそのモジュールのメソッドが呼ばれます。レシーバはメソッドを呼ばれるオブジェクト（<code>obj.foo</code> の <code>obj</code>）です。
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
          <Figure n="3-4" title="super による呼び出しと戻り値" caption="黒の矢印が呼び出し、青の矢印が戻り値。各メソッドは super の前後に自分の処理を加えている。">
            <SuperChainFigure />
          </Figure>
          <p>
            図 3-4 を上から順に見ます。図の <code>Trim#greet</code> は「Trim に定義された greet」を表す書き方です。
          </p>
          <ol>
            <li>
              Child に greet の定義は無いので、ancestors で次にある Trim の greet が実行されます。引数は <code>"  ruby "</code> と <code>polite: true</code> です。
            </li>
            <li>
              Trim の greet は <code>name.strip</code> で前後の空白を取り除き、<code>super("ruby", polite: true)</code> にあたる呼び出しをします。いま実行しているメソッドの定義元は Trim なので、Ruby は Trim より後ろの Loud
              から greet を探します。
            </li>
            <li>
              Loud の greet は括弧なしの <code>super</code> なので、受け取った引数をそのまま渡します。Loud の次にある Base の greet が呼ばれます。
            </li>
            <li>
              Base の greet は <code>"こんにちは、rubyさん"</code> を返します。Loud はその戻り値に <code>upcase</code> を呼んで <code>"こんにちは、RUBYさん"</code> を返し、Trim はそれをそのまま返します。
            </li>
          </ol>
          <p>
            Child の親クラスは Base ですが、Trim の中の super が呼ぶのは Base ではなく Loud です。super の行き先は、super を書いたモジュールだけを見ても決まりません。そのモジュールを組み込んだクラスの ancestors で決まります。
          </p>
          <p>
            括弧なしの <code>super</code> と <code>super()</code> の違いでエラーになるのは、受け取る引数の数が親と子で違う場合です。次の例では、子クラスの initialize は引数を1つ受け取り、親クラスの initialize
            は引数を受け取りません。
          </p>
          <Code
            lang="ruby"
            title="super と super() の違い"
            code={`
class Parent
  def initialize = @items = []
end

class Kid < Parent
  def initialize(name)
    super          # 受け取った name をそのまま渡す
    @name = name
  end
end

Kid.new("a")
# wrong number of arguments (given 1, expected 0) (ArgumentError)

class Kid2 < Parent
  def initialize(name)
    super()        # 引数を渡さない
    @name = name
  end
end

Kid2.new("a").instance_variables # => [:@items, :@name]
`}
          />
          <p>
            Kid の <code>super</code> は name を親の initialize に渡すので、引数を受け取らない親の側で ArgumentError になります。エラーの文の <code>given 1</code> は渡した引数の数、<code>expected 0</code>{' '}
            は受け取れる引数の数です。<code>super()</code> と書いた Kid2 では親の initialize が引数なしで実行され、@items と @name の両方が設定されています。
          </p>
          <p>
            第1章で調べた <code>process_action</code>（コントローラーがアクションを実行するときに通るメソッド）の7つの定義が上から順に呼ばれるのも、同じ規則によるものです。<code>ApplicationController.ancestors</code> から <code>process_action</code>{' '}
            を定義しているものだけを取り出すと、第1章の図1-6 と同じ順序になります。
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
            <code>select</code> のブロックは、ancestors の要素（クラスかモジュール）を1つずつ m に受け取り、その要素自身が process_action を定義しているかを調べます。<code>instance_methods(false)</code> が返すのは public と
            protected のメソッドだけなので、private のメソッドを <code>private_instance_methods(false)</code> でも調べています。結果の7つは ancestors の順のままです。先頭の ControllerRuntime の process_action
            が最初に実行され、それぞれの定義が super を呼ぶたびに、次の要素の定義へ進みます。
          </p>
          <p>
            どのモジュールがどの順で組み込まれるかは、各モジュールを include する順序で決まります。<code>ActionController::Base</code> がモジュールを include
            する部分は<ChapterLink n={10} />で読みます。
          </p>
          <p>
            自分のコントローラーやモデルで Rails のメソッドを上書きして super を書いたときも、次に呼ばれる定義は同じ規則で決まります。実際の行き先は、インスタンスに対して{' '}
            <code>method(:名前).super_method</code> を呼ぶと確かめられます（<ChapterLink n={1} section="find-source" />
            ）。
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
            2行目の <code>instance_methods(false)</code> は、特異クラス自身に定義されたメソッドが greet だけであることを示しています。3行目の ancestors では特異クラスが先頭にあり、その次が obj のクラスの Object です。
          </p>
          <p>
            特異クラスはそのオブジェクトのメソッド探索で最初に探される場所です。<code>obj.class</code> は <code>Object</code> のままですが、探索は特異クラスから始まり、その後に{' '}
            <code>Object</code> へ進みます（図 3-5）。<code>#&lt;Class:...&gt;</code> は特異クラスを表す表記です。
          </p>
          <p>
            <code>#&lt;Class:...&gt;</code> のコロンの後ろには、どのオブジェクトの特異クラスかが入ります。上の実行結果と、この章のほかの節に出てくる表示を並べると、次のように読めます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>表示</th>
                  <th>読み方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>#&lt;Object:0x00007f2b54e186e8&gt;</code>
                  </td>
                  <td>Object クラスのインスタンス。obj を p で表示したときの形です。0x で始まる部分はオブジェクトを区別するための値で、実行するたびに変わります</td>
                </tr>
                <tr>
                  <td>
                    <code>#&lt;Class:#&lt;Object:0x00007f2b54e186e8&gt;&gt;</code>
                  </td>
                  <td>上のインスタンス（obj）の特異クラス。コロンの後ろに obj の表示がそのまま入っています</td>
                </tr>
                <tr>
                  <td>
                    <code>#&lt;Class:Book&gt;</code>
                  </td>
                  <td>Book というクラスの特異クラス。Book のクラスメソッドが定義される場所です（次の節）</td>
                </tr>
                <tr>
                  <td>
                    <code>#&lt;Class:Article(...)&gt;</code>
                  </td>
                  <td>Article というモデルのクラスの特異クラス。括弧は Rails がモデルの表示に付け足す部分です（次の節）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>owner</code> の結果や TracePoint の出力にこの表示が出てきたら、コロンの後ろのオブジェクトだけに定義されたメソッドを指している、と読めます。
          </p>
          <Figure n="3-5" title="オブジェクトの特異クラス" caption="青の矢印が obj のメソッド探索の始まり。other には特異クラスに定義されたメソッドが無いので、Object から探索する。">
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
            <code>User</code>）に対して呼ばれるので、結果は <code>"users"</code> になります。<code>name</code> はクラスの名前を文字列で返すメソッドで、<code>User.name</code> は <code>"User"</code> です。同じ all を{' '}
            <code>Record.all</code> として呼ぶと、self は Record なので <code>"SELECT * FROM records"</code> が返ります。
          </p>
          <p>
            実行結果の <code>User.method(:all).owner</code> が <code>#&lt;Class:Record&gt;</code> なのは、all を定義した場所が Record の特異クラスだからです。最後の行の{' '}
            <code>User.singleton_class.ancestors</code> は、User のクラスメソッドを探す順番です。<code>User.all</code> を呼ぶと、Ruby は <code>#&lt;Class:User&gt;</code>、<code>#&lt;Class:Record&gt;</code>{' '}
            の順に探し、2番目で all を見つけます。
          </p>
          <p>
            図 3-6 の左の列は、User から superclass をたどった並びです。右の列はそれぞれのクラスの特異クラスで、User のクラスメソッドはこの列を上から順に探します。横の破線は、左のクラスの特異クラスが右にあることを表します。右の列を下までたどると
            Class と Module に着きます。<code>User.new</code> や <code>User.name</code> のように、どのクラスに対しても呼べるメソッドは、この Class と Module に定義されています。
          </p>
          <Figure n="3-6" title="クラスと特異クラスの並行する継承" caption="User.all の探索は #<Class:User> から始まり、#<Class:Record> で見つかる（青の経路）。">
            <ClassMethodFigure />
          </Figure>
          <h3>Rails のモデルで確かめる</h3>
          <p>
            第1章の TracePoint（実行されたメソッドを記録する Ruby の機能）の出力で、<code>published</code> の定義元が <code>#&lt;Class:Article(...)&gt;</code> と表示されていました。<code>scope</code> は、Article
            の特異クラスにメソッドを定義します。<code>ActiveRecord::Scoping::Named</code> の該当部分を引用します。この引用では、メソッドをどこに定義しているかと、定義したメソッドが呼ばれたときに何を実行するかを確かめます。
          </p>
          <p>
            引用は <code>scope(name, body, &amp;block)</code> というクラスメソッドの中にあります。モデルに <code>scope :published, -&gt; {'{ where(published: true) }'}</code> と書くと、name に{' '}
            <code>:published</code> が、body に <code>-&gt;</code> で作った lambda（後で実行する処理をまとめたオブジェクト）が入ります。この行は Article の本体で実行されるので、scope の中の self は Article です。
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
          <p>引用を上から順に読みます。</p>
          <ul>
            <li>
              <code>if body.respond_to?(:to_proc)</code>：body をブロックとして渡せるかを調べています。lambda は to_proc を持つので、<code>-&gt;</code> で書いた scope はこの分岐に入ります。
            </li>
            <li>
              <code>singleton_class.define_method(name) do |*args| … end</code>：レシーバを省略した <code>singleton_class</code> は <code>self.singleton_class</code> のことで、Article の特異クラスを返します。そこに published
              という名前のメソッドを定義します。do から end までが、<code>Article.published</code> を呼んだときに実行される処理です。<code>*args</code> は呼び出しのときに渡された引数のすべてです。
            </li>
            <li>
              <code>scope = all._exec_scope(*args, &amp;body)</code>：<code>all</code> は <code>Article.all</code> のことで、全件を対象にした問い合わせを表すオブジェクト（Relation。<ChapterLink n={12} section="lazy" />
              ）を返します。<code>_exec_scope</code> は、self をその Relation に切り替えて lambda を実行します。そのため、lambda の中の <code>where(published: true)</code> は Relation に対して呼ばれます（
              <ChapterLink n={4} section="dsl" />
              ）。
            </li>
            <li>
              <code>scope = scope.extending(extension) if extension</code>：extension は、scope にブロックを渡したときだけ作られるモジュールです。ブロックを渡していなければ nil なので、この行は何もしません。
            </li>
            <li>
              <code>scope</code>：lambda を実行して得た Relation を返します。これが <code>Article.published</code> の戻り値です。
            </li>
          </ul>
          <p>
            <ChapterLink n={1} section="trace" />の TracePoint の出力にあった <code>named.rb:174</code> は、この引用の2行目です。define_method に渡したブロックがメソッドの本体になるので、<code>Article.published</code>{' '}
            を呼ぶと、174行目から実行が始まります。
          </p>
          <p>
            次の図は上の引用の処理を、scope の行を実行した時点と Article.published を呼んだ時点に分けて並べたものです。左の列で特異クラスに定義した published が、右の列の呼び出しで見つかり、その本体が実行されます。
          </p>
          <Figure
            title="scope を定義する時点と呼び出す時点"
            caption="青の矢印が Article.published を呼んだときの経路です。引用の extension の行は、scope にブロックを渡していないときは何もしないので省略しています。"
          >
            <ScopeTimingFigure />
          </Figure>
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
          <p>
            先頭の2つは Article と ApplicationRecord の特異クラスです。Rails のモデルのクラスを表示すると、クラス名の後ろに括弧が付きます。テーブルを持つモデルでは{' '}
            <code>Article(id: integer, title: string, …)</code> のようにカラムの一覧が入り、抽象クラスでは <code>(abstract)</code> が入ります。特異クラスの表示にはこの文字列がそのまま入るので、本書ではカラムの一覧を{' '}
            <code>(...)</code> と省略しています。テーブルの情報をまだ読み込んでおらず、データベースにも接続していない時点では、カラムの一覧の代わりに{' '}
            <code>(call 'Article.load_schema' to load schema informations)</code> という文が入ります。
          </p>
          <p>
            クラスメソッドの定義元を <code>Article.method(:名前).owner</code> で調べたときは、表示を次のように読み分けます。
          </p>
          <ul>
            <li>
              <code>#&lt;Class:Article(...)&gt;</code>：Article 自身に定義されたクラスメソッドです。app/models/article.rb の <code>def self.</code>、<code>class &lt;&lt; self</code>、<code>scope</code> などを探します。
            </li>
            <li>
              <code>#&lt;Class:ApplicationRecord(abstract)&gt;</code>：ApplicationRecord に定義されたクラスメソッドです。
            </li>
            <li>
              <code>ActiveRecord::Core::ClassMethods</code> のようなモジュール名：Rails や gem が特異クラスに組み込んだモジュールのメソッドです。<code>source_location</code> でファイルと行を調べます（
              <ChapterLink n={1} section="find-source" />
              ）。
            </li>
          </ul>
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
            最後の行の ancestors では、Greeting が <code>#&lt;Class:Tool&gt;</code> のすぐ後ろに入っています。クラスに include したモジュールがクラスのすぐ後ろに入るのと同じ位置です。Tool
            の特異クラスの ancestors は Tool のクラスメソッドを探す順番なので（前の節）、<code>Tool.hello</code> と呼ぶと Greeting の hello が見つかります。Tool 自身の ancestors には Greeting が入らないので、
            <code>Tool.new.hello</code> は NoMethodError になります。
          </p>
          <p>
            次の図は Tool に対する2つの呼び出しで、メソッドを探す順番を並べたものです。左の列が Tool.new.hello、右の列が Tool.hello の探索で、Greeting は右の列にだけ入っています。
          </p>
          <Figure
            title="extend したモジュールが入る場所"
            caption="縦の矢印は探索の順序、横の破線は Tool の特異クラスへの参照です。右の列は take(3) で表示した3つまでを描いています。"
          >
            <ExtendLookupFigure />
          </Figure>
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
            モデルに <code>include</code> を1行書くだけで、インスタンスメソッドに加えて、クラスメソッドや scope まで使えるようになるモジュールがあります。app/models/concerns に置くモジュールの{' '}
            <code>included do … end</code> がその例です。これは、include のときに Ruby が自動で呼ぶメソッドを使って作られています（<ChapterLink n={5} section="concern" />
            ）。クラスを継承したときにも、同じように自動で呼ばれるメソッドがあります。
          </p>
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
          <p>
            <code>Module#included</code> は「Module クラスのインスタンスメソッド included」を表す書き方です。どのモジュールも Module クラスのインスタンスなので、何も定義しなくても included
            を持っています。ただし、最初からある included は何もしません。モジュールの側で <code>def self.included(base)</code> のように同じ名前の特異メソッドを定義すると、Ruby は最初からあるものより先にそれを見つけて呼びます。
            <code>inherited</code> も同じで、継承される側のクラスに <code>def self.inherited(subclass)</code> を定義します。
          </p>
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
            <code>class Order</code> の後ろのコメント3行が、<code>include Trackable</code> を実行したときの出力です。
          </p>
          <ul>
            <li>
              1行目：append_features が先に呼ばれます。引数の base は include した側のクラスで、ここでは Order です。この時点では、Order の ancestors に Trackable はまだ入っていません。
            </li>
            <li>
              2行目：<code>super</code> の後では入っています。<code>def self.append_features</code> は Trackable の特異メソッドです。その中の super は、次に見つかる Module クラスの append_features
              を呼びます。ancestors にモジュールを挿入する処理は、Module クラスの側にあります。
            </li>
            <li>
              3行目：その後で included が呼ばれます。<code>base.extend(ClassMethods)</code> は <code>Order.extend(Trackable::ClassMethods)</code> と同じ意味なので、tracked? が Order のクラスメソッドになります。
            </li>
          </ul>
          <p>
            <code>included</code> の中で <code>base.extend(ClassMethods)</code> を呼ぶ書き方は、「include するだけでインスタンスメソッドとクラスメソッドの両方を追加する」ための定番の書き方でした。
            <code>ActiveSupport::Concern</code> はこの書き方を簡潔にするためのもので、<code>append_features</code> を上書きして同じことを行います（<ChapterLink n={5} />）。
          </p>
          <h3>inherited：子クラスごとの準備</h3>
          <p>
            <code>inherited</code> は、子クラスごとに初期値を用意するときに使われます。クラスの本体や <code>def self.</code> の中で <code>@</code> を付けて作る変数は、クラスというオブジェクトが持つインスタンス変数で、クラスのインスタンス変数と呼びます（
            <ChapterLink n={5} section="class-macro" />
            ）。クラスのインスタンス変数は子クラスに引き継がれません。親クラスに入れた値は子クラスからは見えないので、子クラスが作られた時点で、子クラスの側に設定します。
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
          <p>
            <code>class Invoice &lt; Model</code> を実行した時点で、Ruby は <code>Model.inherited(Invoice)</code> を呼びます。<code>instance_variable_set(:@table_name, 値)</code>{' '}
            は、レシーバのインスタンス変数に値を入れるメソッドです。ここでは Invoice というクラスの @table_name に <code>"invoices"</code> を入れています。<code>Invoice.table_name</code> の中の @table_name は、self である
            Invoice の変数を指すので、<code>"invoices"</code> が返ります。Model の inherited が呼ばれるのは、Model を継承したクラスが作られたときだけです。Model 自身の @table_name には何も入っていないので、
            <code>Model.table_name</code> は nil を返します。
          </p>
          <p>
            ActiveRecord も、モデルのクラスが作られるたびに <code>inherited</code> でキャッシュ（一度作った結果を保存しておき、次から使い回すもの）用のインスタンス変数を初期化しています。次の引用では、作られた子クラスに対して何を呼び、どの変数を設定しているかを確かめます。
          </p>
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
            このメソッドは <code>ActiveRecord::Core::ClassMethods</code> というモジュールの中にあります。「クラスに対して呼ぶメソッド」の節で find の定義元として出てきたモジュールです。このモジュールのメソッドは ActiveRecord::Base
            のクラスメソッドになるので、<code>def self.inherited</code> ではなく <code>def inherited</code> と書かれています。
          </p>
          <ul>
            <li>
              <code>super</code>：ほかのモジュールと Ruby 本体の inherited を先に呼びます。
            </li>
            <li>
              <code>subclass.initialize_find_by_cache</code>：subclass は作られた子クラスで、<code>class Article &lt; ApplicationRecord</code> なら Article です。このメソッドは、find や find_by
              が一度組み立てたクエリを保存しておく Hash を、子クラスのインスタンス変数に用意します。
            </li>
            <li>
              <code>unless subclass.base_class? … end</code>：<code>base_class?</code> は、そのクラスが ActiveRecord::Base か抽象クラスを直接継承しているときに真を返します。Article は抽象クラスの ApplicationRecord
              を直接継承しているので真になり、この部分は実行されません。モデルをさらに継承したクラスを作ったときだけ、base_class? が真のクラスに着くまで親をたどり、途中のクラスのキャッシュを作り直します。
            </li>
            <li>
              <code>subclass.class_eval do … end</code>：self を子クラスにしてブロックを実行します（<ChapterLink n={4} section="self-switch" />
              ）。ブロックの中の <code>@arel_table</code> などは、子クラスのインスタンス変数です。前の例の <code>instance_variable_set</code> と同じことを、5つの変数にしています。
            </li>
            <li>
              <code>@filter_attributes ||= nil</code>：<code>||=</code> は、変数が nil か false のときだけ右辺を代入します。すでに値が入っていれば、その値を変えません。
            </li>
          </ul>
          <p>
            コメントにあるとおり、クラスを定義した時点でキャッシュを初期化しておくことで、複数のスレッド（1つのプログラムの中で並行して処理を進める流れ。<ChapterLink n={23} section="thread" />）が同時に初回アクセスしたときの競合を避けています。最後の{' '}
            <code>@generated_association_methods</code> は、<code>comments</code> などの関連メソッドを入れるモジュール（図2-6 の添字1）を指す変数です。
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
            例の結果を上から順に見ます。using の前では <code>"x".respond_to?(:shout)</code> が false で、String に shout はありません。<code>using StringExt</code> を書いた UsesIt の中では、<code>"hi".shout</code>{' '}
            も、メソッド名をシンボルで渡して呼ぶ <code>send</code> も成功します。UsesIt を閉じた後の最後の行では、同じ <code>"hi".shout</code> が NoMethodError になります。
          </p>
          <p>
            <code>using</code> の効果は、それを書いた場所からファイル（またはモジュール定義）の終わりまでです。呼び出された先のメソッドの中には及びません。このため、別のファイルのコードからは変更が見えず、gem
            同士の衝突を避けられます。
          </p>
          <p>
            Refinements は ActiveSupport のコア拡張（String などの Ruby 標準のクラスを再オープンしてメソッドを足すもの）とは異なる方法です。Rails 8.1.4.1 の各 gem の <code>lib</code> ディレクトリを筆者が検索した範囲では、<code>refine</code>{' '}
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
            <code>class A &lt; B</code> の継承で、A は B のメソッドを使えます。メソッドは ancestors の順に探されます。Rails のコントローラーは ApplicationController を、モデルは ApplicationRecord
            を継承します。
          </li>
          <li>
            モジュールを include すると、ancestors のクラスのすぐ後ろにモジュールが入り、インスタンスからモジュールのメソッドを呼べます。ActionController::Base は機能ごとのモジュールを include しています。
          </li>
          <li>
            <code>def self.名前</code> で定義するクラスメソッドはクラスに対して、インスタンスメソッドはインスタンスに対して呼びます。has_many や scope で作ったメソッドもクラスメソッドです。
          </li>
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
    { title: 'Action Controller Overview', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/action_controller_overview.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'すべてのコントローラーが ApplicationController を継承し、ApplicationController が ActionController::Base を継承すること。' },
    { title: 'Active Record Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_record_basics.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'ApplicationRecord が ActiveRecord::Base を継承し、アプリのすべてのモデルの基底クラスになること。' },
    { title: 'actionpack/lib/action_controller/base.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/base.rb#L272-L312`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'ActionController::Base が MimeResponds・Cookies などのモジュールを include する部分。ancestors の実測はデモのアプリ（Rails 8.1.4.1）で行った。' },
    { title: 'activerecord/lib/active_record/base.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/base.rb#L299-L317`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'ActiveRecord::Base が Persistence・Validations・Callbacks などのモジュールを include する部分。' },
  ],
}

export default withExplanations(ch03, explanation03)
