import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation02 } from '../explanations/ruby'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 2-3 オブジェクトとクラスが持つもの ---------- */
function ObjectStructureFigure() {
  return (
    <Svg
      id="2-3"
      w={600}
      h={230}
      label="2つのオブジェクト a と b は、それぞれ自分のインスタンス変数 @title を持ち、自分のクラス Article への参照を持つ。メソッド initialize と title は、オブジェクトではなく Article クラスが持っている"
    >
      <Box x={20} y={20} w={240} h={76} lines={['a（Article のインスタンス）', '@title = "Rails入門"']} bold mono={false} />
      <Box x={20} y={130} w={240} h={76} lines={['b（Article のインスタンス）', '@title = "Ruby入門"']} bold />
      <Box x={360} y={56} w={220} h={120} fill="box" lines={[]} />
      <T x={470} y={78} anchor="middle" bold>
        Article（クラス）
      </T>
      <T x={470} y={104} anchor="middle" fs={12} tone="muted">
        メソッドの一覧
      </T>
      <Box x={385} y={118} w={170} h={22} lines="initialize" mono fs={12} fill="bg" rx={3} />
      <Box x={385} y={144} w={170} h={22} lines="title" mono fs={12} fill="bg" rx={3} />
      <Arrow x1={260} y1={58} x2={358} y2={100} dashed />
      <Arrow x1={260} y1={168} x2={358} y2={140} dashed />
      <T x={300} y={64} fs={12} tone="muted" anchor="middle">
        class
      </T>
      <T x={300} y={170} fs={12} tone="muted" anchor="middle">
        class
      </T>
    </Svg>
  )
}

/* ---------- 図 2-4 class と superclass の関係 ---------- */
function ClassRelationFigure() {
  return (
    <Svg
      id="2-4"
      w={690}
      h={220}
      label="a の class は Article。Article の superclass は Object、Object の superclass は BasicObject、BasicObject の superclass は nil。Article 自身もオブジェクトで、その class は Class。Class の superclass は Module、Module の superclass は Object"
    >
      <Box x={20} y={30} w={100} h={40} lines="a" mono />
      <Box x={170} y={30} w={130} h={40} lines="Article" mono />
      <Box x={380} y={30} w={110} h={40} lines="Object" mono />
      <Box x={560} y={30} w={115} h={40} lines="BasicObject" mono />
      <Box x={170} y={150} w={130} h={40} lines="Class" mono />
      <Box x={380} y={150} w={110} h={40} lines="Module" mono />

      <Arrow x1={120} y1={50} x2={168} y2={50} dashed />
      <T x={144} y={38} fs={11} anchor="middle" tone="muted" mono>
        class
      </T>
      <Arrow x1={300} y1={50} x2={378} y2={50} dashed />
      <T x={339} y={38} fs={11} anchor="middle" tone="muted" mono>
        superclass
      </T>
      <Arrow x1={490} y1={50} x2={558} y2={50} dashed />
      <T x={524} y={38} fs={11} anchor="middle" tone="muted" mono>
        superclass
      </T>
      <T x={617} y={88} fs={11} anchor="middle" tone="muted">
        superclass は nil
      </T>

      <Arrow x1={235} y1={70} x2={235} y2={148} dashed />
      <T x={243} y={110} fs={11} tone="muted" mono>
        class
      </T>
      <Arrow x1={300} y1={170} x2={378} y2={170} dashed />
      <T x={339} y={158} fs={11} anchor="middle" tone="muted" mono>
        superclass
      </T>
      <Arrow x1={435} y1={150} x2={435} y2={72} dashed />
      <T x={443} y={110} fs={11} tone="muted" mono>
        superclass
      </T>
    </Svg>
  )
}

/* ---------- 図 2-5 メソッド探索の順序 ---------- */
const lookupRows: { name: string; module?: boolean; toS: string; frozen: string }[] = [
  { name: 'Report', toS: '×', frozen: '×' },
  { name: 'Document', toS: '実行', frozen: '×' },
  { name: 'Object', toS: '', frozen: '×' },
  { name: 'Kernel', module: true, toS: '', frozen: '実行' },
  { name: 'BasicObject', toS: '', frozen: '' },
]

function LookupFigure() {
  const top = 46
  const step = 56
  return (
    <Svg
      id="2-5"
      w={600}
      h={top + step * lookupRows.length + 30}
      label="r.to_s と r.frozen? のメソッド探索。r のクラス Report から始めて、Document、Object、Kernel、BasicObject の順に探す。to_s は Document で見つかって実行される。frozen? は Report、Document、Object には無く、Kernel で見つかって実行される"
    >
      <Box x={20} y={top} w={110} h={36} lines="r" mono />
      <Arrow x1={130} y1={top + 18} x2={178} y2={top + 18} dashed />
      <T x={154} y={top + 6} fs={11} anchor="middle" tone="muted" mono>
        class
      </T>
      <T x={430} y={20} anchor="middle" mono fs={12.5} bold>
        r.to_s
      </T>
      <T x={530} y={20} anchor="middle" mono fs={12.5} bold>
        r.frozen?
      </T>
      {lookupRows.map((r, i) => {
        const y = top + i * step
        return (
          <g key={r.name}>
            <Box x={180} y={y} w={180} h={36} lines={r.name} mono fill={r.module ? 'box2' : 'box'} />
            {i < lookupRows.length - 1 && <Arrow x1={270} y1={y + 36} x2={270} y2={y + step} />}
            <T x={430} y={y + 18} anchor="middle" tone={r.toS === '実行' ? 'acc' : 'muted'} bold={r.toS === '実行'}>
              {r.toS}
            </T>
            <T x={530} y={y + 18} anchor="middle" tone={r.frozen === '実行' ? 'acc' : 'muted'} bold={r.frozen === '実行'}>
              {r.frozen}
            </T>
          </g>
        )
      })}
      <T x={20} y={top + step * lookupRows.length + 8} fs={12} tone="muted">
        × は「このクラス・モジュールには定義が無い」、空欄は「見つかった後なので探さない」を表す
      </T>
    </Svg>
  )
}

/* ---------- 図 2-6 Article.ancestors の構成 ---------- */
const ancestorRows: { idx: string; label: string; kind: 'box' | 'box2'; dashed?: boolean }[] = [
  { idx: '0', label: 'Article', kind: 'box' },
  { idx: '1', label: 'Article::GeneratedAssociationMethods', kind: 'box2' },
  { idx: '2', label: 'Article::GeneratedAttributeMethods', kind: 'box2' },
  { idx: '3', label: 'ApplicationRecord', kind: 'box' },
  { idx: '4〜5', label: 'ApplicationRecord 用の Generated〜 モジュール 2個', kind: 'box2' },
  { idx: '6', label: 'ActiveRecord::Base', kind: 'box' },
  { idx: '7〜71', label: 'ActiveRecord・ActiveModel などのモジュール 65個', kind: 'box2', dashed: true },
  { idx: '72', label: 'Object', kind: 'box' },
  { idx: '73〜75', label: 'Object に include されたモジュール 3個', kind: 'box2' },
  { idx: '76', label: 'Kernel', kind: 'box2' },
  { idx: '77', label: 'BasicObject', kind: 'box' },
]

function AncestorsFigure() {
  const top = 12
  const step = 40
  return (
    <Svg
      id="2-6"
      w={600}
      h={top + step * ancestorRows.length}
      label={`Article.ancestors の78個の要素を上から順にまとめた図。${ancestorRows.map((r) => `${r.idx}番目 ${r.label}`).join('、')}`}
    >
      {ancestorRows.map((r, i) => {
        const y = top + i * step
        return (
          <g key={r.idx}>
            <T x={70} y={y + 15} anchor="end" fs={12} tone="muted" mono>
              {r.idx}
            </T>
            <Box x={84} y={y} w={480} h={30} lines={r.label} fill={r.kind} dashed={r.dashed} mono={!r.label.includes('個')} fs={12.5} />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 2-1 メソッドの呼び出しの各部分 ---------- */
function MethodCallFigure() {
  const row = (y: number, recv: string, name: string, args: string, ret: string, retNote: string, recvNote: string) => (
    <g>
      <Box x={20} y={y} w={120} h={40} lines={recv} mono fs={13} fill="box4" />
      <T x={150} y={y + 20} mono fs={16} anchor="middle">
        .
      </T>
      <Box x={160} y={y} w={100} h={40} lines={name} mono fs={13} fill="box5" />
      <T x={270} y={y + 20} mono fs={16} anchor="middle">
        (
      </T>
      <Box x={280} y={y} w={110} h={40} lines={args} mono fs={13} fill="bg" />
      <T x={400} y={y + 20} mono fs={16} anchor="middle">
        )
      </T>
      <Arrow x1={414} y1={y + 20} x2={496} y2={y + 20} />
      <T x={455} y={y + 10} fs={10.5} anchor="middle" tone="muted">
        実行
      </T>
      <Box x={500} y={y} w={180} h={40} lines={ret} mono fs={12.5} fill="box4" />
      <T x={80} y={y + 56} fs={11} anchor="middle" tone="muted">
        {recvNote}
      </T>
      <T x={210} y={y + 56} fs={11} anchor="middle" tone="muted">
        メソッド名
      </T>
      <T x={335} y={y + 56} fs={11} anchor="middle" tone="muted">
        引数
      </T>
      <T x={590} y={y + 56} fs={11} anchor="middle" tone="muted">
        {retNote}
      </T>
    </g>
  )
  return (
    <Svg
      id="2-1"
      w={700}
      h={200}
      label={'メソッドの呼び出しの各部分。"rails".center(11, "-") では、レシーバが "rails"、メソッド名が center、引数が 11 と "-" で、実行すると戻り値の "---rails---" が返る。Article.order(:id) では、レシーバが Article クラス、メソッド名が order、引数が :id で、戻り値は SQL の条件を持ったオブジェクト'}
    >
      {row(20, '"rails"', 'center', '11, "-"', '"---rails---"', '戻り値', 'レシーバ')}
      {row(110, 'Article', 'order', ':id', '条件を持ったオブジェクト', '戻り値', 'レシーバ（クラス）')}
    </Svg>
  )
}

/* ---------- 図 2-2 クラスの本体で呼ぶメソッド ---------- */
function ClassBodyFigure() {
  return (
    <Svg
      id="2-2"
      w={760}
      h={290}
      label={'クラスの本体は、定義を読み込むときに上から順に実行される。Note の本体の label "メモ帳" はクラスメソッド label を呼び、その場で文字を表示する。attr_reader :title は Note に title メソッドを追加し、def initialize は initialize を定義する。Ch02Article の本体の has_many :comments は、comments メソッドを追加する'}
    >
      <Box
        x={20}
        y={20}
        w={340}
        h={130}
        lines={['class Note', '  def self.label(text) … end', '  label "メモ帳"', '  attr_reader :title', '  def initialize(title) … end', 'end']}
        mono
        fs={12.5}
        align="start"
        fill="bg"
      />
      <Box x={480} y={60} w={260} h={32} lines="表示：3. label が呼ばれた: メモ帳" fs={11.5} fill="bg" dashed />
      <Box x={480} y={104} w={260} h={46} lines={['Note のメソッド', 'title・initialize']} fs={12} subTone="muted" />
      <Arrow x1={360} y1={76} x2={478} y2={76} />
      <T x={420} y={68} fs={10.5} anchor="middle" tone="muted">
        その場で実行
      </T>
      <Arrow x1={360} y1={94} x2={478} y2={120} />
      <T x={420} y={99} fs={10.5} tone="muted">
        追加
      </T>
      <Arrow x1={360} y1={111} x2={478} y2={136} />
      <T x={404} y={136} fs={10.5} tone="muted">
        定義
      </T>

      <Box
        x={20}
        y={180}
        w={340}
        h={70}
        lines={['class Ch02Article < ApplicationRecord', '  has_many :comments', 'end']}
        mono
        fs={12.5}
        align="start"
        fill="bg"
      />
      <Box x={480} y={192} w={260} h={46} lines={['Ch02Article のメソッド', 'comments など']} fs={12} subTone="muted" />
      <Arrow x1={360} y1={215} x2={478} y2={215} />
      <T x={420} y={207} fs={10.5} anchor="middle" tone="muted">
        追加
      </T>
      <T x={20} y={276} fs={11} tone="muted">
        クラスの本体は、Ruby がクラスの定義を読み込むときに、上から順に実行される
      </T>
    </Svg>
  )
}

/* ---------- 呼び出しの引数が届く先（validates と has_many） ---------- */
function ArgumentDestinationFigure() {
  const param = (x: number, y: number, w: number, name: string, value: string, passed: boolean) => (
    <g>
      <Box x={x} y={y} w={w} h={48} fill={passed ? 'box4' : 'bg'} dashed={!passed} />
      <T x={x + w / 2} y={y + 16} anchor="middle" mono fs={12.5}>
        {name}
      </T>
      <T x={x + w / 2} y={y + 34} anchor="middle" mono={passed} fs={12} tone={passed ? undefined : 'muted'}>
        {value}
      </T>
    </g>
  )
  return (
    <Svg
      id="ch02-arg-destination"
      w={780}
      h={404}
      label="呼び出しに書いた引数が、定義のどの引数に入るかの比較。validates :title, presence: true では、validates が def validates(*attributes) と定義されているので、:title と presence: true の両方が attributes という1つの配列に入り、presence: true は配列の最後の Hash になる。has_many :comments, dependent: :destroy では、has_many が def has_many(name, scope = nil, **options, &extension) と定義されているので、:comments は name に、dependent: :destroy は options の Hash に入る。scope は渡していないので nil になり、extension にはブロックを付けていない"
    >
      <T x={20} y={20} fs={12} tone="muted">
        定義
      </T>
      <T x={110} y={20} mono fs={12.5}>
        def validates(*attributes)
      </T>
      <T x={20} y={60} fs={12} tone="muted">
        呼び出し
      </T>
      <T x={110} y={60} mono fs={12.5}>
        validates
      </T>
      <Box x={190} y={42} w={100} h={36} lines=":title" mono fs={12.5} fill="bg" />
      <Box x={320} y={42} w={160} h={36} lines="presence: true" mono fs={12.5} fill="bg" />
      <T x={20} y={160} fs={12} tone="muted">
        届く先
      </T>
      <Box x={110} y={112} w={540} h={84} fill="box4" />
      <Arrow x1={240} y1={78} x2={240} y2={140} />
      <Arrow x1={400} y1={78} x2={400} y2={140} />
      <Box x={190} y={142} w={100} h={36} lines=":title" mono fs={12.5} fill="bg" />
      <Box x={310} y={142} w={180} h={36} lines="{presence: true}" mono fs={12.5} fill="bg" />
      <T x={510} y={150} mono fs={12.5}>
        attributes
      </T>
      <T x={510} y={170} fs={12} tone="muted">
        1つの配列に入る
      </T>

      <T x={20} y={240} fs={12} tone="muted">
        定義
      </T>
      <T x={110} y={240} mono fs={12.5}>
        def has_many(name, scope = nil, **options, &amp;extension)
      </T>
      <T x={20} y={280} fs={12} tone="muted">
        呼び出し
      </T>
      <T x={110} y={280} mono fs={12.5}>
        has_many
      </T>
      <Box x={180} y={262} w={110} h={36} lines=":comments" mono fs={12.5} fill="bg" />
      <Box x={428} y={262} w={164} h={36} lines="dependent: :destroy" mono fs={12.5} fill="bg" />
      <Arrow x1={235} y1={298} x2={190} y2={340} />
      <Arrow x1={510} y1={298} x2={510} y2={340} />
      <T x={20} y={366} fs={12} tone="muted">
        届く先
      </T>
      {param(110, 342, 140, 'name', ':comments', true)}
      {param(265, 342, 130, 'scope', 'nil（渡していない）', false)}
      {param(410, 342, 200, 'options', '{dependent: :destroy}', true)}
      {param(625, 342, 140, 'extension', 'ブロックなし', false)}
    </Svg>
  )
}

/* ---------- find_by_title を呼んだときの流れ（DynamicMatchers） ---------- */
function DynamicFinderFlowFigure() {
  const step = (y: number, code: string, note: string, fill: 'box' | 'box5' = 'box') => (
    <g>
      <Box x={20} y={y} w={400} h={44} fill={fill} />
      <T x={220} y={y + 14} anchor="middle" mono fs={12.5}>
        {code}
      </T>
      <T x={220} y={y + 31} anchor="middle" fs={12} tone="muted">
        {note}
      </T>
    </g>
  )
  return (
    <Svg
      id="ch02-dynamic-finder"
      w={780}
      h={570}
      label={'Article.find_by_title("x") を呼んだときの流れ。まずメソッド探索で find_by_title を探し、見つかればそれを実行する（2回目以降の呼び出し）。見つからなければ（1回目）method_missing が呼ばれ、name に :find_by_title が入る。Method.match(name) で名前が find_by_〜 か find_by_〜! の形かを調べ、違う形なら super で祖先の method_missing を呼び、NoMethodError になる。形が合えば match.valid? で title が Article のテーブルの列の名前かを調べ、列が無ければ同じく NoMethodError になる。列があれば match.define で Article に find_by_title を定義し、send で最初の呼び出しの引数を渡して呼ぶ。find_by_title は find_by(title: "x") に当たる呼び出しを実行する'}
    >
      <Box x={90} y={14} w={260} h={34} lines={'Article.find_by_title("x")'} mono fs={12.5} fill="bg" />
      <Arrow x1={220} y1={48} x2={220} y2={74} />
      <Box x={20} y={76} w={400} h={40} lines="メソッド探索で find_by_title が見つかるか" fs={12.5} />
      <Arrow d="M420,96 L760,96 L760,534 L422,534" accent />
      <T x={440} y={82} fs={12} tone="acc">
        見つかる（2回目以降の呼び出し）
      </T>
      <Arrow x1={220} y1={116} x2={220} y2={150} />
      <T x={230} y={133} fs={12} tone="muted">
        見つからない（1回目）
      </T>
      {step(152, 'method_missing(name, ...)', 'name に :find_by_title が入る')}
      <Arrow x1={220} y1={196} x2={220} y2={224} />
      {step(226, 'Method.match(name)', '名前が find_by_〜 か find_by_〜! の形か')}
      <Arrow x1={220} y1={270} x2={220} y2={296} />
      <T x={230} y={283} fs={12} tone="muted">
        find_by_〜 の形
      </T>
      {step(298, 'match.valid?(self, name)', 'title が Article のテーブルの列の名前か')}
      <Arrow x1={220} y1={342} x2={220} y2={370} />
      <T x={230} y={356} fs={12} tone="muted">
        列がある
      </T>
      {step(372, 'match.define(self, name)', 'Article にクラスメソッド find_by_title を定義する', 'box5')}
      <Arrow x1={220} y1={416} x2={220} y2={440} />
      {step(442, 'send(name, ...)', '定義した find_by_title を、最初の呼び出しの引数で呼ぶ')}
      <Arrow x1={220} y1={486} x2={220} y2={510} />
      <Box x={20} y={512} w={400} h={44} />
      <T x={220} y={526} anchor="middle" fs={12.5}>
        find_by_title を実行する
      </T>
      <T x={220} y={543} anchor="middle" mono fs={12} tone="muted">
        {'find_by(title: "x") に当たる呼び出し'}
      </T>

      <Arrow x1={420} y1={248} x2={478} y2={248} />
      <T x={449} y={236} anchor="middle" fs={12} tone="muted">
        違う形
      </T>
      <Arrow x1={420} y1={320} x2={478} y2={320} />
      <T x={449} y={308} anchor="middle" fs={12} tone="muted">
        列が無い
      </T>
      <Box x={480} y={226} w={260} h={116} fill="bg" />
      <T x={610} y={250} anchor="middle" fs={12}>
        super で祖先の method_missing を呼ぶ
      </T>
      <T x={610} y={280} anchor="middle" mono bold tone="danger">
        NoMethodError
      </T>
      <T x={610} y={312} anchor="middle" fs={11.5} tone="muted">
        {'例：Article.find_by_titel("x")'}
      </T>
    </Svg>
  )
}

const ch02: Chapter = {
  number: 2,
  part: 1,
  title: 'オブジェクトとクラスの構造',
  summary:
    '同じ title メソッドを呼んでも、記事が違えば別のタイトルが返ります。小さな Ruby クラスで値の保存先とメソッドの定義場所を確かめ、その仕組みで Rails のモデルを読みます。',
  goals: [
    '呼び出しを「誰に、どのメソッドを、どの引数で呼ぶか」に分けて読める',
    'クラスとインスタンスの違いを、2件の記事が別々の値を持つ例で説明できる',
    'has_many など、括弧や引数の一部の記号を省略した Rails のコードを読める',
    'self と ancestors を使い、メソッドを呼ばれた相手と、定義を探す順番を確かめられる',
  ],
  prerequisites: [1],
  sections: [
    {
      id: 'objects',
      title: 'オブジェクトとメソッドの呼び出し',
      body: (
        <>
          <p>
            Ruby のプログラムが扱う値は、文字列の <code>"rails"</code> も、整数の <code>10</code> も、<code>[3, 1, 2]</code> のように値を並べた配列も、すべて<Term en="object">オブジェクト</Term>
            です。オブジェクトはデータと、そのデータに対してできる操作をまとめたものです。この操作を<Term en="method">メソッド</Term>と呼び、オブジェクトにメソッドを実行させることを「メソッドを呼び出す」と言います。呼び出しは{' '}
            <code>オブジェクト.メソッド名</code> の形で書きます
            <Ref n={1} />。
          </p>
          <Code
            lang="ruby"
            title="メソッドの呼び出し（# => の後ろは戻り値。Ruby 4.0.9 で実行）"
            code={`
"rails".upcase                # => "RAILS"
"rails".length                # => 5
"rails".include?("ai")        # => true
"rails".center(11, "-")       # => "---rails---"
[3, 1, 2].sort                # => [1, 2, 3]
10.to_s                       # => "10"
`}
          />
          <p>
            <code>.</code> の前に書いたオブジェクトを<Term en="receiver">レシーバ</Term>、括弧の中に書いてメソッドに渡す値を<Term en="argument">引数</Term>と呼びます。
            <code>"rails".center(11, "-")</code> では、レシーバが <code>"rails"</code>、メソッド名が center、引数が 11 と <code>"-"</code> で、全体が11文字になるように前後を - で埋めます。メソッドが処理を終えて返す値を
            <Term en="return value">戻り値</Term>と呼び、この例の戻り値は <code>"---rails---"</code> です（図 2-1）。引数を渡さないときは、upcase や length のように括弧を省略して書くのがふつうです。
          </p>
          <Figure n="2-1" title="メソッドの呼び出しの各部分" caption="上は Ruby だけの例、下は第1章で見た Rails のコードの一部。">
            <MethodCallFigure />
          </Figure>
          <p>
            どのオブジェクトもどの<Term en="class">クラス</Term>のオブジェクトかが決まっています。クラスはオブジェクトの種類で、<code>class</code> メソッドで調べられます。
          </p>
          <Code
            lang="ruby"
            code={`
"rails".class                 # => String
10.class                      # => Integer
[3, 1, 2].class               # => Array
{ title: "Ruby" }.class       # => Hash
nil.class                     # => NilClass
true.class                    # => TrueClass
`}
          />
          <p>
            String は文字列、Integer は整数、Array は配列、Hash はキーと値の組を集めたもののクラスです（Hash は「Rails でよく見る Ruby の書き方」の節で詳しく見ます）。値が無いことを表す <code>nil</code>{' '}
            や、真を表す <code>true</code> もオブジェクトで、それぞれ NilClass と TrueClass のオブジェクトです。
          </p>
          <p>
            呼び出せるメソッドはクラスごとに決まっています。String のオブジェクトには upcase がありますが、Integer のオブジェクトにはありません。<code>respond_to?</code>{' '}
            は、引数に渡した名前のメソッドを呼べるかどうかを返すメソッドです
            <Ref n={3} />（<code>:upcase</code> はメソッドの名前などを表すシンボルという値で、「Rails でよく見る Ruby の書き方」の節で扱います）。
          </p>
          <Code
            lang="ruby"
            code={`
"rails".respond_to?(:upcase)  # => true
10.respond_to?(:upcase)       # => false
10.upcase
# undefined method 'upcase' for an instance of Integer (NoMethodError)
`}
          />
          <p>
            呼べないメソッドを呼ぶと、Ruby は NoMethodError という<Term en="exception">例外</Term>を発生させます。例外は処理を続けられないことを知らせるオブジェクトで、エラーの種類ごとにクラスがあります。例外を受け止める処理（rescue）を書いていなければ、プログラムはその行で止まり、例外のメッセージを表示します
            <Ref n={16} />。メッセージの「for an instance of Integer」は「Integer のオブジェクトに対して」という意味です（インスタンスという言葉は次の節で説明します）。
          </p>
          <p>メソッドの戻り値もオブジェクトなので、続けてメソッドを呼べます。</p>
          <Code
            lang="ruby"
            code={`
"rails".upcase.reverse        # => "SLIAR"
1 + 2                         # => 3
1.+(2)                        # => 3
`}
          />
          <p>
            <code>"rails".upcase.reverse</code> は、<code>"rails".upcase</code> の戻り値の <code>"RAILS"</code> に、文字を逆の順に並べる reverse を呼んでいます。<code>1 + 2</code> の +
            もメソッドで、<code>1.+(2)</code> と書いても同じ結果になります。Ruby では + や == のような演算子の多くがメソッドとして定義されていて、演算子の形で書いても、括弧を省略して書いても、メソッドの呼び出しであることは変わりません
            <Ref n={9} />。
          </p>
          <p>
            Rails のコードも同じ形で読めます。<ChapterLink n={1} section="request-flow" />で見た <code>Article.order(:id).limit(3)</code> は、Article に order を呼び、その戻り値に limit
            を呼んでいます。モデルに書く <code>has_many :comments</code> もメソッドの呼び出しですが、レシーバと括弧を省略しているので、そうは見えにくくなっています。このことは「クラスの本体で呼ぶメソッド」の節で確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'class-instance',
      title: 'クラスとインスタンス',
      body: (
        <>
          <p>
            String や Integer は Ruby に最初からあるクラスです。<code>class</code> 〜 <code>end</code> で自分のクラスを定義すると、新しい種類のオブジェクトを作れます。次の Note はタイトルを持つメモを表すクラスです。
          </p>
          <Code
            lang="ruby"
            title="note.rb（# => の後ろは p で表示した値）"
            code={`
class Note
  def initialize(title)
    @title = title
  end

  def title
    @title
  end

  def rename(new_title)
    @title = new_title
  end
end

first = Note.new("Ruby")
second = Note.new("Rails")
first.title    # => "Ruby"
second.title   # => "Rails"

first.rename("Ruby 4.0")
first.title    # => "Ruby 4.0"
second.title   # => "Rails"

first          # => #<Note:0x00007fd6c67ab4e0 @title="Ruby 4.0">
first.class    # => Note
`}
          />
          <p>
            クラスの中で <code>def</code> で定義したメソッドは、そのクラスのオブジェクトで呼べます。<code>Note.new("Ruby")</code> は、Note のオブジェクトを新しく1つ作って返します。クラスから作ったオブジェクトを、そのクラスの
            <Term en="instance">インスタンス</Term>と呼び、first と second は Note の2つのインスタンスです。new は作ったインスタンスの initialize を、new に渡した引数で呼びます
            <Ref n={15} />。
          </p>
          <p>
            initialize の中の <code>@title</code> のように、<code>@</code> で始まる変数を<Term en="instance variable">インスタンス変数</Term>と呼びます。インスタンス変数はインスタンスごとに別々にあり、同じインスタンスのどのメソッドからも読み書きできます
            <Ref n={14} />。first.rename で first の @title を書き換えても、second の @title は "Rails" のままでした。p で first を表示すると、クラス名と、インスタンスを区別する番号（0x
            で始まる部分。実行のたびに変わります）に続いて、インスタンス変数の値が表示されます。
          </p>
          <p>
            一方、<code>@</code> の付かない変数（ローカル変数）は、それを書いたメソッドの実行が終わると使えなくなります。initialize の引数の title もローカル変数なので、title
            メソッドから読めるように、値をインスタンス変数に入れています。<ChapterLink n={1} section="request-flow" />で見た ArticlesController#index の <code>@articles</code>{' '}
            もインスタンス変数で、Rails はアクションの実行が終わった後、コントローラーのインスタンス変数をビューに渡します（<ChapterLink n={16} />）。
          </p>
          <p>
            クラスを定義するときに <code>&lt;</code> の後ろに別のクラスを書くと、そのクラスのメソッドを受け継げます。これを<Term en="inheritance">継承</Term>
            と呼び、受け継ぐ元のクラスを親クラス（スーパークラス）、受け継いだクラスを子クラス（サブクラス）と呼びます。
          </p>
          <Code
            lang="ruby"
            title="inherit.rb（note.rb の Note の定義に続けて書いた。# => の後ろは p で表示した値）"
            code={`
class Memo < Note
  def summary
    "メモ: #{title}"
  end
end

memo = Memo.new("買い物")
memo.title                              # => "買い物"
memo.summary                            # => "メモ: 買い物"
Memo.superclass                         # => Note
Note.new("Ruby").respond_to?(:summary)  # => false
`}
          />
          <p>
            summary の中の <code>{'"メモ: #{title}"'}</code> は、<code>{'#{}'}</code> の中に書いた式の値を文字列に埋め込む書き方です。ここでは title の戻り値が入ります。この title
            はレシーバを省略したメソッドの呼び出しで、summary を呼ばれたインスタンス自身の title を呼びます。<code>memo.summary</code> の実行中は、<code>memo.title</code>{' '}
            と書いたときと同じ値が返ります（レシーバを省略したときの規則は「self の決まり方」の節で扱います）。
          </p>
          <p>
            Memo には initialize も title も書いていませんが、親クラスの Note から受け継いでいるので、<code>Memo.new("買い物")</code> で作ったインスタンスで呼べます。反対に、Memo に足した summary
            は Note のインスタンスでは呼べません
            <Ref n={15} />。Rails のモデルの <code>class Article &lt; ApplicationRecord</code> も継承です。rails new が作る app/models/application_record.rb は{' '}
            <code>class ApplicationRecord &lt; ActiveRecord::Base</code> と定義されているので、Article のインスタンスでは、Article に書いていない save などの、Rails が用意したメソッドを呼べます。どの順番でメソッドを探すかは「メソッド探索」の節で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'class-body',
      title: 'クラスの本体で呼ぶメソッド',
      body: (
        <>
          <p>
            <code>class</code> と <code>end</code> の間を、クラスの本体と呼びます。クラスの本体には def によるメソッドの定義だけでなく、ふつうの Ruby のコードも書けます。本体のコードは、Ruby
            がクラスの定義を読み込むときに上から順に実行されます
            <Ref n={4} />。表示される順番で確かめます。
          </p>
          <Code
            lang="ruby"
            title="class_body.rb"
            code={`
puts "1. ファイルの先頭"

class Note
  puts "2. Note の本体を実行中"

  def self.label(text)
    puts "3. label が呼ばれた: #{text}"
  end

  label "メモ帳"

  p instance_methods(false)
  attr_reader :title
  p instance_methods(false)

  def initialize(title)
    @title = title
  end
end

puts "4. Note の定義の後"
p Note.new("Ruby").title
p Note.method(:attr_reader).owner
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
1. ファイルの先頭
2. Note の本体を実行中
3. label が呼ばれた: メモ帳
[]
[:title]
4. Note の定義の後
"Ruby"
Module
`}
          />
          <p>
            <code>puts</code> は引数の文字列を1行表示するメソッドです。<code>p</code> は引数の値を、文字列なら <code>"Ruby"</code>{' '}
            のように引用符を付けた形で表示するメソッドで、値が文字列なのかシンボルなのか配列なのかを確かめるときに使います。
          </p>
          <p>
            2行目の表示から、クラスの定義を読み込む途中で、本体の <code>puts</code> が実行されたことが分かります。<code>def self.label</code> のように、メソッド名の前に <code>self.</code>{' '}
            を付けて定義したメソッドは、インスタンスではなくクラスに対して <code>Note.label("…")</code> の形で呼ぶメソッドで、<Term en="class method">クラスメソッド</Term>
            と呼びます。これに対して、<code>first.title</code> のようにインスタンスに対して呼ぶメソッドをインスタンスメソッドと呼びます。本体に書いた <code>label "メモ帳"</code>{' '}
            は、レシーバと括弧を省略して label を呼んだもので、<code>Note.label("メモ帳")</code> と同じ動作をします。省略できる理由は「self の決まり方」の節で説明します。
          </p>
          <p>
            <code>attr_reader :title</code> もメソッドの呼び出しです。<code>instance_methods(false)</code> は、そのクラスに定義したインスタンスメソッドの名前の一覧を返すメソッドで、その結果は attr_reader
            を呼ぶ前は空、呼んだ後は <code>[:title]</code> でした。attr_reader は引数に渡した名前で、同じ名前のインスタンス変数の値を返すメソッドをクラスに追加します。「クラスとインスタンス」の節で
            def を使って書いた title と同じ働きのメソッドを、1行で作れます。
          </p>
          <p>
            実行結果の最後の行の <code>Module</code> は、<code>Note.method(:attr_reader).owner</code> の値です。<code>method</code>{' '}
            はメソッドを表すオブジェクトを返し、その <code>owner</code> はメソッドを定義したクラスかモジュールを返します（
            <ChapterLink n={1} section="find-source" />
            ）。attr_reader は Ruby の Module クラスに定義されたメソッドで、Note には書いていません
            <Ref n={5} />。Note に対して Module のメソッドを呼べる理由は、「クラスもオブジェクトである」の節で確かめます。
          </p>
          <p>
            本体のコードはクラスの定義を読み込むときに実行されるので、本体に書いた呼び出しの誤りも、読み込んだ時点でエラーになります。次の例では label を labl と打ち間違えています。
          </p>
          <Code
            lang="ruby"
            title="class_body_error.rb"
            code={`
puts "1. 読み込みを始めた"

class Note
  def self.label(text)
    puts "label: #{text}"
  end

  labl "メモ帳"
  puts "2. ここは実行されない"
end

puts "3. Note の定義の後"
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
1. 読み込みを始めた
class_body_error.rb:8:in '<class:Note>': undefined method 'labl' for class Note (NoMethodError)
Did you mean?  label
	from class_body_error.rb:3:in '<main>'
`}
          />
          <p>
            Note のインスタンスを1つも作っていなくても、8行目の labl を実行した時点で NoMethodError になり、その後の行は実行されませんでした。メッセージの「in '&lt;class:Note&gt;'」は Note
            の本体を実行中だったことを、「for class Note」はレシーバが Note クラスだったことを表します。Rails のモデルの本体で has_many を has_meny
            と打ち間違えたときも、同じ理由で、そのモデルのクラスを読み込んだ時点で NoMethodError になります。
          </p>
          <p>
            Rails のモデルの <code>has_many :comments</code> もクラスの本体で、レシーバと括弧を省略して呼んだクラスメソッドです。デモのアプリケーションで新しいモデルのクラスを定義し、has_many
            を呼ぶ前と後で comments メソッドがあるかどうかを調べました。<code>method_defined?</code> は、そのクラスのインスタンスで呼べるメソッドに、引数の名前が含まれるかどうかを返します。データベースのテーブルを読まずに調べられるので、このクラスに対応するテーブルは作っていません。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（# => の後ろは p で表示した値）"
            code={`
class Ch02Article < ApplicationRecord
  p method_defined?(:comments)   # => false
  has_many :comments
  p method_defined?(:comments)   # => true
end

Ch02Article.instance_method(:comments).owner
# => Ch02Article::GeneratedAssociationMethods
ArticlesController.method(:before_action).owner
# => AbstractController::Callbacks::ClassMethods
`}
          />
          <p>
            has_many を呼んだ後に、comments メソッドができました（図 2-2）。has_many は関連するコメントを取り出す comments などのメソッドを、Ch02Article::GeneratedAssociationMethods
            というモジュール（メソッドをまとめて定義し、クラスに組み込んで使うもの。<ChapterLink n={3} />）に定義します
            <Ref n={17} />。<code>Ch02Article.instance_method(:comments).owner</code> の結果が、このモジュールの名前です（<code>instance_method</code>{' '}
            は、クラスからインスタンスメソッドを表すオブジェクトを取り出すメソッドです）。comments は Ch02Article のインスタンスで呼べますが、定義されている場所は Ch02Article
            そのものではありません。
          </p>
          <p>
            コントローラーに書く <code>before_action :set_article</code> も同じ形で、アクションの前に実行するメソッドを登録するクラスメソッドの呼び出しです
            <Ref n={18} />。コードの最後の行の結果から、before_action が Rails の AbstractController::Callbacks::ClassMethods
            というモジュールに定義されていることが分かります。このように、クラスの本体で呼んで、そのクラスにメソッドや設定を加えるクラスメソッドを、クラスマクロと呼びます（<ChapterLink n={5} section="class-macro" />
            ）。
          </p>
          <Figure n="2-2" title="クラスの本体で呼ぶメソッド" caption="class_body.rb と bin/rails runner の実行結果をもとにした模式図。">
            <ClassBodyFigure />
          </Figure>
          <p>
            <code>has_many :comments, dependent: :destroy</code> のように引数が増えると、括弧のほかに <code>{'{}'}</code> も省略した書き方が重なります。
          </p>
        </>
      ),
    },
    {
      id: 'rails-syntax',
      title: 'Rails でよく見る Ruby の書き方',
      body: (
        <>
          <p>
            Rails のコードには、括弧や <code>{'{}'}</code> を省略したメソッド呼び出しが多く、Ruby とは別の言語のように見えることがあります。この節では、よく見る書き方を省略しない形に書き直し、それぞれが Ruby
            のどの文法かを確かめます。次のモデルとコントローラーを例にします。
          </p>
          <Code
            lang="ruby"
            title="app/models/article.rb（例）"
            code={`
class Article < ApplicationRecord
  has_many :comments, dependent: :destroy
  validates :title, presence: true
  scope :recent, -> { order(published_at: :desc) }
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/articles_controller.rb（例）"
            code={`
class ArticlesController < ApplicationController
  before_action :set_article, only: %i[show edit]

  def index
    @titles = Article.recent.map(&:title)
  end

  def show
  end

  def edit
  end

  private

  def set_article
    @article = Article.find(params[:id])
  end
end
`}
          />
          <h3>括弧とレシーバの省略</h3>
          <p>
            Ruby ではメソッド呼び出しの括弧を省略できます。レシーバ（<code>obj.foo</code> の <code>obj</code>）を省略すると、<code>self</code>（いま処理の対象になっているオブジェクト）に対する呼び出しになります
            <Ref n={1} />。クラスの本体では <code>self</code> はそのクラスなので、<code>has_many :comments</code> は <code>Article.has_many(:comments)</code> と同じです（
            <code>self</code> の決まり方は、この章の後の節で説明します）。上の例を、省略しない形に書き直すと次のようになります。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>書いてあるコード</th>
                  <th>省略しない形</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>has_many :comments, dependent: :destroy</code>
                  </td>
                  <td>
                    <code>self.has_many(:comments, dependent: :destroy)</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>validates :title, presence: true</code>
                  </td>
                  <td>
                    <code>self.validates(:title, {'{'} presence: true {'}'})</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>scope :recent, -&gt; {'{'} order(published_at: :desc) {'}'}</code>
                  </td>
                  <td>
                    <code>self.scope(:recent, lambda {'{'} order({'{'} published_at: :desc {'}'}) {'}'})</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>before_action :set_article, only: %i[show edit]</code>
                  </td>
                  <td>
                    <code>self.before_action(:set_article, {'{'} only: [:show, :edit] {'}'})</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>Article.recent.map(&amp;:title)</code>
                  </td>
                  <td>
                    <code>Article.recent().map {'{'} |article| article.title {'}'}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>has_many</code> や <code>validates</code> は、Rails が用意したクラスメソッドです。どこに定義されているかは、<code>method</code> で取り出したメソッドの <code>owner</code>{' '}
            で確かめられます（デモのアプリケーションで実行）。
          </p>
          <Code
            lang="ruby"
            code={`
Article.method(:has_many).owner   # => ActiveRecord::Associations::ClassMethods
Article.method(:validates).owner  # => ActiveModel::Validations::ClassMethods
`}
          />
          <p>
            どちらも <code>ClassMethods</code> という名前のモジュール（メソッドをまとめて定義し、クラスに組み込んで使うもの）に定義されています。モジュールのメソッドがクラスメソッドとして呼べるようになる仕組みは、<ChapterLink n={3} />と
            <ChapterLink n={5} />で説明します。表の各行に出てくる書き方を、順に見ていきます。
          </p>
          <h3>シンボル</h3>
          <p>
            <code>:title</code> のようにコロンで始まる値は <Term en="Symbol">シンボル</Term> で、名前を表すオブジェクトです。同じ名前のシンボルはプログラムの実行中ずっと同じ1つのオブジェクトです
            <Ref n={10} />。文字列は、書くたびに別のオブジェクトが作られます。Rails では、列名・関連名・メソッド名・アクション名をシンボルで渡します。
          </p>
          <Code
            lang="ruby"
            code={`
:title.class              # => Symbol
:title.equal?(:title)     # => true（同じオブジェクト）
"title".equal?("title")   # => false（別々の文字列オブジェクト）

%i[show edit]             # => [:show, :edit]
%w[show edit]             # => ["show", "edit"]
`}
          />
          <p>
            <code>%i[...]</code> はシンボルの配列を、<code>%w[...]</code> は文字列の配列を作る書き方です
            <Ref n={12} />。<code>only: %i[show edit]</code> は <code>only: [:show, :edit]</code> と同じです。
          </p>
          <h3>Hash と最後の引数の {'{}'} の省略</h3>
          <p>
            Hash はキーと値の組を集めたオブジェクトです。<code>{'{'} title: "Rails入門" {'}'}</code> の <code>title:</code> は、キーがシンボル <code>:title</code>{' '}
            であることを表します。シンボルのキーと文字列のキーは別のキーとして扱われます。
          </p>
          <Code
            lang="ruby"
            code={`
h = { title: "Rails入門" }   # { :title => "Rails入門" } と同じ
h[:title]                   # => "Rails入門"
h["title"]                  # => nil（文字列のキー "title" は入っていない）
`}
          />
          <p>
            コントローラーの <code>params</code> は Hash ではなく、<code>params[:id]</code> と <code>params["id"]</code> のどちらでも同じ値を取り出せるように作られた別のクラスです（
            <ChapterLink n={10} section="params" />
            ）。
          </p>
          <p>
            メソッドを呼ぶとき、最後の引数に <code>presence: true</code> のような「名前: 値」を書くと、<code>{'{}'}</code> を書かなくても、まとめて1つの引数として渡せます。受け取る側がどう定義されているかで、
            それが Hash として届くか、次に説明するキーワード引数として届くかが変わります。
          </p>
          <h3>キーワード引数</h3>
          <p>
            メソッドの定義で <code>name:</code> のように書いた引数を <Term en="keyword argument">キーワード引数</Term> と呼びます。呼び出すときは名前を付けて渡すので、順番を入れ替えても構いません。
          </p>
          <Code
            lang="ruby"
            code={`
def greet(name:, greeting: "こんにちは")
  "#{greeting}、#{name}"
end

greet(name: "田中")                        # => "こんにちは、田中"
greet(greeting: "おはよう", name: "田中")  # => "おはよう、田中"
greet                                      # ArgumentError: missing keyword: :name
greet(name: "田中", nickname: "たなっち")  # ArgumentError: unknown keyword: :nickname
`}
          />
          <p>
            <code>greeting: "こんにちは"</code> のように値を書いた引数は、渡さなければ書いた値が使われます。値を書いていない <code>name:</code> は必須で、渡さないと ArgumentError（引数の渡し方が正しくないことを表す例外）になります。定義に無い名前を渡しても
            ArgumentError です
            <Ref n={9} />。
          </p>
          <p>
            <code>*</code> と <code>**</code> を付けた引数は、残りの引数をまとめて受け取ります。<code>*args</code> は名前の無い引数を配列で、<code>**options</code> は名前を付けて渡された引数を Hash
            で受け取ります。キーワード引数を1つも定義していないメソッドに「名前: 値」を渡すと、それは最後の Hash として <code>*args</code> に入ります
            <Ref n={9} />。
          </p>
          <Code
            lang="ruby"
            code={`
def collect(*args) = args
def collect_options(name, **options) = [name, options]

collect(:title, presence: true)                  # => [:title, {presence: true}]
collect_options(:comments, dependent: :destroy)  # => [:comments, {dependent: :destroy}]
`}
          />
          <p>
            <code>def collect(*args) = args</code> は、<code>def collect(*args); args; end</code> を1行で書いたものです（Ruby 3.0 以降の構文）。この章の後の例でも、短いメソッドはこの形で書きます。1つ目の結果では{' '}
            <code>presence: true</code> が配列の最後の要素の Hash になり、2つ目の結果では <code>dependent: :destroy</code> が options の Hash になっています。
          </p>
          <p>
            Rails 8.1.4.1 の <code>validates</code> は <code>def validates(*attributes)</code> と定義されているので、<code>presence: true</code> は <code>attributes</code>{' '}
            の最後の Hash として届きます。<code>has_many</code> は <code>def has_many(name, scope = nil, **options, &amp;extension)</code> と定義されているので、<code>dependent: :destroy</code> は{' '}
            <code>options</code> に入ります
            <Ref n={11} />。呼び出す側の書き方は同じでも、メソッドの中に届く形は定義によって違います。
          </p>
          <p>has_many の定義の引数は、左から次のように読みます。</p>
          <ul>
            <li>
              <code>name</code>：1つ目の引数です。<code>has_many :comments</code> では <code>:comments</code> が入ります。
            </li>
            <li>
              <code>scope = nil</code>：2つ目の引数です。<code>= nil</code> は、渡さなかったときに nil になることを表します。<code>has_many :comments, -&gt; {'{'} order(:id) {'}'}</code>{' '}
              のように、関連を取り出すときの条件を lambda で渡すときに使います。
            </li>
            <li>
              <code>options</code>：名前の前に <code>*</code> を2つ付けた引数で、「名前: 値」の形で渡した引数をまとめた Hash が入ります。<code>dependent: :destroy</code> はここに入ります。
            </li>
            <li>
              <code>&amp;extension</code>：呼び出しに付けたブロックを受け取る引数です。ブロックは次の「&amp; と -&gt;」で説明します。
            </li>
          </ul>
          <p>
            次の図は validates と has_many の呼び出しに書いた値が、定義のどの引数に入るかを並べたものです。上が validates、下が has_many で、それぞれ「呼び出し」の行から「届く先」の行へ矢印をたどります。
          </p>
          <Figure title="呼び出しの引数が届く先" caption="模式図。実線の矢印は呼び出しに書いた値が入る引数を指す。破線の箱はこの呼び出しでは渡していない引数。validates では2つの値が1つの配列に入り、has_many では別々の引数に分かれる。">
            <ArgumentDestinationFigure />
          </Figure>
          <p>
            メソッドの定義をこのように読めると、<code>wrong number of arguments</code> や <code>unknown keyword</code> の ArgumentError が出たときに、定義と呼び出しのどの引数が合っていないかを照らし合わせられます。Rails
            のメソッドの定義の場所は、<ChapterLink n={1} section="find-source" />の source_location で調べられます。
          </p>
          <h3>&amp; と -&gt;</h3>
          <p>
            <code>map(&amp;:title)</code> は、この例では <code>map {'{'} |article| article.title {'}'}</code> と同じ結果になります。<code>{'{'} ... {'}'}</code> や <code>do ... end</code>{' '}
            で書いてメソッドに渡す処理を<Term en="block">ブロック</Term>と呼びます。<code>map</code> は、要素を1つずつブロックに渡し、ブロックの結果を集めた配列を返すメソッドです。<code>|article|</code>{' '}
            はブロックが受け取る引数で、ここには要素の Article のインスタンスが1つずつ入ります（<ChapterLink n={4} section="block-basics" />
            ）。呼び出しの <code>&amp;</code> は、後ろに書いたものをブロックとして渡す記号です。シンボルからブロックを作る手順は、
            <ChapterLink n={4} section="block-to-proc">
              第4章の「ブロックと Proc を受け渡す」
            </ChapterLink>
            で説明します。
          </p>
          <p>
            <code>-&gt; {'{'} ... {'}'}</code> は、<code>lambda {'{'} ... {'}'}</code> と同じく lambda（処理を保存しておき、後で <code>call</code> で実行できるオブジェクト）を作る書き方です（
            <ChapterLink n={4} section="proc-lambda">
              第4章の「Proc と lambda の違い」
            </ChapterLink>
            ）。<code>scope</code> は、検索の条件に名前を付けて、<code>Article.recent</code> のようにクラスメソッドとして呼べるようにするメソッドです。<code>scope</code> に lambda を渡すのは、<code>Article.recent</code> を呼ぶたびに <code>order(...)</code> を実行させるためです。lambda にしないで{' '}
            <code>order(...)</code> を直接書くと、クラスを読み込んだときに1回だけ実行されてしまいます。Rails 8.1.4.1 の <code>scope</code> は、呼び出せない値（<code>call</code>{' '}
            を持たない値）を渡されると例外を投げます
            <Ref n={13} />。
          </p>
          <Code
            lang="ruby"
            code={`
class Article < ApplicationRecord
  scope :recent, order(published_at: :desc)   # lambda にしていない
end
# クラスを読み込んだ時点で ArgumentError: The scope body needs to be callable.
`}
          />
          <h3>self. を省略できない代入</h3>
          <p>
            モデルの属性（列の値を読み書きするメソッド）を読むときは <code>self.</code> を省略できますが、代入では省略できません。モデルのメソッドの中で <code>title = ...</code> と書くと、Ruby は属性への代入ではなく、
            <code>title</code> という名前のローカル変数への代入だと解釈します
            <Ref n={14} />。
          </p>
          <Code
            lang="ruby"
            code={`
class Article < ApplicationRecord
  def strip_title_wrong
    title = title.strip        # title はローカル変数になる
  end

  def strip_title
    self.title = title.strip   # 属性を書き換える title= を呼ぶ
  end
end

a = Article.new(title: " Rails入門 ")
a.strip_title_wrong   # NoMethodError: undefined method 'strip' for nil
a.title               # => " Rails入門 "（変わっていない）
a.strip_title
a.title               # => "Rails入門"
`}
          />
          <p>
            <code>strip_title_wrong</code> では、代入の左辺に <code>title</code> があるため、右辺の <code>title</code> も同じローカル変数を指します。まだ値が入っていないので <code>nil</code>{' '}
            になり、<code>nil.strip</code> で NoMethodError（呼んだメソッドが見つからないことを表す例外）になりました。<code>self.title =</code> と書くと、属性を書き換えるメソッド <code>title=</code> が呼ばれます（デモのアプリケーションで実行）。
          </p>
          <h3>その他によく見る書き方</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>書き方</th>
                  <th>意味</th>
                  <th>例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    名前が <code>?</code> で終わるメソッド
                  </td>
                  <td>真偽を返すメソッドに付ける慣習<Ref n={9} /></td>
                  <td>
                    <code>article.valid?</code>、<code>article.persisted?</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    名前が <code>!</code> で終わるメソッド
                  </td>
                  <td>
                    同じ名前で <code>!</code> の無いメソッドより注意が必要なものに付ける慣習<Ref n={9} />。ActiveRecord では、失敗したときに false を返す代わりに例外を投げるメソッドに付いている（
                    <ChapterLink n={11} section="crud" />）
                  </td>
                  <td>
                    <code>save!</code>、<code>create!</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>@article</code>
                  </td>
                  <td>
                    インスタンス変数。コントローラーのアクションで代入すると、ビューでも同じ名前で使える（<ChapterLink n={16} />）
                  </td>
                  <td>
                    <code>@article = Article.find(params[:id])</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>&amp;.</code>
                  </td>
                  <td>
                    レシーバが <code>nil</code> なら、メソッドを呼ばずに <code>nil</code> を返す
                    <Ref n={1} />
                  </td>
                  <td>
                    <code>article.author&amp;.name</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>x ||= y</code>
                  </td>
                  <td>
                    <code>x</code> が <code>nil</code> か <code>false</code> のときだけ <code>y</code> を代入する。一度計算した値を保存しておくときに使う
                    <Ref n={14} />
                  </td>
                  <td>
                    <code>@current_user ||= User.find_by(id: session[:user_id])</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'object-contents',
      title: 'オブジェクトが持っているもの',
      body: (
        <>
          <p>同じ構造の Article クラスで、インスタンスが持つ変数と、クラスが持つメソッドの定義を実際に取り出します。この例は Rails を使わず、Ruby だけで実行できます。</p>
          <Code
            lang="ruby"
            code={`
class Article
  def initialize(title)
    @title = title
  end

  def title
    @title
  end
end

a = Article.new("Rails入門")
b = Article.new("Ruby入門")

a.instance_variables             # => [:@title]
a.instance_variable_get(:@title) # => "Rails入門"
a.class                          # => Article
Article.instance_methods(false)  # => [:title]
a.method(:title).owner           # => Article
`}
          />
          <p>
            <code>instance_variables</code> は、そのオブジェクトが持つインスタンス変数の名前の一覧を返します。<code>instance_variable_get</code>{' '}
            は、名前を指定してインスタンス変数の値を返します。どちらも、クラスに title のような読み取り用のメソッドが無くても使えます。
          </p>
          <p>
            <code>instance_methods(false)</code> は、そのクラス自身に定義されたメソッドだけを返します（<code>false</code> を付けないと、親クラスから受け継いだメソッドも含まれます）。
            <code>initialize</code> は private メソッド（レシーバを付けて呼べないメソッド。「self の決まり方」の節で扱います）なので、この一覧には出ません。
          </p>
          <p>この結果から、オブジェクトとクラスの役割分担が分かります。</p>
          <ul>
            <li>
              オブジェクト <code>a</code> と <code>b</code> は、それぞれ自分の<Term en="instance variable">インスタンス変数</Term>（<code>@title</code>）を持っています。値はオブジェクトごとに異なります。
            </li>
            <li>
              各オブジェクトは、自分が作られたクラス（<code>a.class</code>）への参照を持っています。
            </li>
            <li>
              メソッド <code>title</code> はオブジェクトではなく <code>Article</code> クラスが持っています。<code>a.method(:title).owner</code> が <code>Article</code> を返すのはこのためです。
            </li>
          </ul>
          <Figure n="2-3" title="オブジェクトとクラスが持つもの" caption="模式図。オブジェクトは自分のインスタンス変数とクラスへの参照を持ち、メソッドはクラス側にある。">
            <ObjectStructureFigure />
          </Figure>
          <p>
            <code>a.title</code> を呼ぶと、Ruby は <code>a</code> のクラスである <code>Article</code> から <code>title</code> を探し、見つかったメソッドを <code>a</code> を対象にして実行します。メソッドの中の{' '}
            <code>@title</code> は「いま対象になっているオブジェクトのインスタンス変数」を意味するので、<code>a.title</code> と <code>b.title</code>{' '}
            は同じメソッドを実行しながら別の値を返します。インスタンス変数は代入した時点で作られるもので、クラス側で事前に宣言する必要はありません。
          </p>
          <p>
            コントローラーの <code>@article</code> も同じ規則に従います。Rails はリクエストごとにコントローラーのクラスから新しいインスタンスを作り、アクションの中で代入した{' '}
            <code>@article</code> はそのインスタンスが持ちます（<ChapterLink n={10} section="dispatch" />
            ）。次のリクエストは別のインスタンスが処理するので、前のリクエストで代入したインスタンス変数は残っていません。まだ代入していないインスタンス変数を読むと nil が返ります。show
            アクションで代入した <code>@article</code> を、別のリクエストで実行される update アクションの中で読むと nil になるのは、このためです。
          </p>
          <Callout title="ActiveRecord の属性はインスタンス変数ではない">
            <p>
              ActiveRecord のモデルでは、<code>article.title</code> の値は <code>@title</code> ではなく、属性をまとめて管理するオブジェクト（<code>@attributes</code>
              ）に入っています。<code>title</code> メソッドは、テーブルのカラム情報をもとに Rails が実行時に定義したものです。この仕組みは<ChapterLink n={11} />で説明します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'class-is-object',
      title: 'クラスもオブジェクトである',
      body: (
        <>
          <p>
            Ruby ではクラスもオブジェクトです。<code>Article</code> という定数には、クラスを表すオブジェクトが入っています。そのオブジェクトのクラスは <code>Class</code> です。
          </p>
          <Code
            lang="ruby"
            code={`
Article.class        # => Class
Article.superclass   # => Object
Object.superclass    # => BasicObject
BasicObject.superclass # => nil

Class.superclass     # => Module
Module.superclass    # => Object
Class.class          # => Class
`}
          />
          <p>ここには2種類の関係が出てきます。混同しやすいので区別しておきます。</p>
          <ul>
            <li>
              <code>class</code>：あるオブジェクトが「どのクラスのインスタンスか」。<code>a.class</code> は <code>Article</code>、<code>Article.class</code> は <code>Class</code> です。
            </li>
            <li>
              <code>superclass</code>：あるクラスが「どのクラスを継承しているか」。クラスにだけある関係です。<code>class Article</code> のように親を書かずに定義したクラスの superclass は{' '}
              <code>Object</code> になります。
            </li>
          </ul>
          <p>
            図 2-4 は、この2種類の関係を矢印で描き分けたものです。左上の <code>a</code> から右へたどると、a の class が Article で、Article の superclass が Object、その superclass が
            BasicObject です。Article から下へたどると、Article の class が Class で、Class の superclass が Module、その superclass が Object です。
          </p>
          <Figure n="2-4" title="class と superclass の関係" caption="横向きの矢印が superclass、Article から下向きの矢印が class。Class 自身の class も Class だが、図では省略している。">
            <ClassRelationFigure />
          </Figure>
          <p>
            「クラスとインスタンス」の節で見たとおり、インスタンスでは、自分のクラスと親クラスのメソッドを呼べます。Article は Class のインスタンスなので、Article に対しては、Class のメソッドと、その親クラスの Module
            のメソッドを呼べます。<code>Article.new</code> の new は Class に定義されたメソッドです。「クラスの本体で呼ぶメソッド」の節で attr_reader の owner が Module だったのは、attr_reader が Module
            に定義されていて、Note が Class のインスタンスだからです。
          </p>
          <p>
            クラスがオブジェクトであることは、<code>Class.new</code> でクラスを作れることからも確認できます<Ref n={6} />。<code>Class.new</code> の引数には親クラスを渡します。<code>class</code> キーワードを使わずに作ったクラスでも、定数に代入すると通常のクラスと同じように名前が付きます。
          </p>
          <Code
            lang="ruby"
            code={`
Book = Class.new(Article) do
  def summary = "#{title}の概要"
end

Book.new("Ruby").summary # => "Rubyの概要"
Book.name                # => "Book"
Book.superclass          # => Article
`}
          />
          <p>
            <code>def summary = ...</code> は1行で書くメソッド定義（Ruby 3.0 以降の構文）で、<code>def summary; ...; end</code> と同じ意味です。<code>Class.new</code>{' '}
            に渡したブロックの中で <code>def</code> を書くと、作られたクラスのインスタンスメソッドになります。ブロックの中で何が <code>self</code> になるかは<ChapterLink n={4} />で扱います。
          </p>
          <p>
            クラスがオブジェクトなので、クラスに対してもメソッドを呼べます。<code>Article.new</code> の <code>new</code> や、モデルで書く <code>has_many</code>{' '}
            は、クラスというオブジェクトに対するメソッド呼び出しです。クラスに対するメソッドがどこに定義されているかは<ChapterLink n={3} />で説明します。
          </p>
          <p>
            クラスはオブジェクトなので、変数に入れたり、メソッドの引数に渡したりもできます。コントローラーの{' '}
            <code>rescue_from ActiveRecord::RecordNotFound, with: :not_found</code> は、例外のクラス ActiveRecord::RecordNotFound を1つ目の引数として rescue_from に渡しています（
            <ChapterLink n={10} section="exceptions" />
            ）。
          </p>
        </>
      ),
    },
    {
      id: 'self',
      title: 'self の決まり方',
      body: (
        <>
          <p>
            <code>self</code> は「いま処理の対象になっているオブジェクト」を指します。レシーバ（<code>obj.foo</code> の <code>obj</code>）を省略してメソッドを呼ぶと、<code>self</code>{' '}
            に対して呼んだことになります。また、インスタンス変数 <code>@x</code> は常に <code>self</code> のインスタンス変数を指します。<code>self</code> が何になるかは、コードの位置で決まります
            <Ref n={4} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>コードの位置</th>
                  <th>self</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ファイルの一番外側（トップレベル）</td>
                  <td>
                    <code>main</code> という名前の、Object のインスタンス
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>class Article</code> 〜 <code>end</code> の直下
                  </td>
                  <td>
                    そのクラス（<code>Article</code>）
                  </td>
                </tr>
                <tr>
                  <td>インスタンスメソッドの中</td>
                  <td>メソッドを呼び出されたオブジェクト（レシーバ）</td>
                </tr>
                <tr>
                  <td>
                    <code>def self.foo</code> の中
                  </td>
                  <td>そのクラス</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Code
            lang="ruby"
            code={`
p self        # => main
p self.class  # => Object

# 「オブジェクトが持っているもの」の節で定義した Article にメソッドを追加する
class Article
  p self      # => Article
  def whoami = self
end

a = Article.new("Rails入門")
a.whoami.equal?(a) # => true
`}
          />
          <p>
            すでに定義したクラスの名前でもう一度 <code>class Article</code> と書くと、新しいクラスは作られず、既存の Article にメソッドが追加されます（「クラスの再オープンと Rails
            のコア拡張」の節で扱います）。whoami は self をそのまま返すメソッドです。<code>equal?</code> は2つが同じオブジェクトのときだけ true を返すので、最後の行から、インスタンスメソッドの中の self
            はレシーバの <code>a</code> だと分かります。
          </p>
          <p>
            クラス定義の本体でも Ruby のコードは実行され、そのときの <code>self</code> はクラスです。モデルのクラス本体に <code>has_many :comments</code> と書くと、レシーバを省略しているので{' '}
            <code>self.has_many(:comments)</code>、つまり <code>Article.has_many(:comments)</code> が実行されます。Rails の DSL（クラス本体に宣言のように書く記法）は、この性質を使っています。
          </p>
          <p>
            Rails のコードでは、書く場所ごとに self は次のようになります。右の列のメソッドは、どれもレシーバを省略して書くので、その場所の self に対する呼び出しです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>書く場所</th>
                  <th>self</th>
                  <th>レシーバを省略して呼ぶメソッドの例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>モデルのクラスの本体</td>
                  <td>モデルのクラス（Article）</td>
                  <td>
                    <code>has_many</code>、<code>validates</code>、<code>scope</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    モデルのインスタンスメソッドの中（<code>def publish</code> など）
                  </td>
                  <td>
                    メソッドを呼ばれたレコード（<code>article.publish</code> なら article）
                  </td>
                  <td>
                    <code>title</code>、<code>save</code>、<code>update</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    モデルの <code>def self.〜</code> の中
                  </td>
                  <td>モデルのクラス（Article）</td>
                  <td>
                    <code>where</code>、<code>order</code>、<code>find_by</code>
                  </td>
                </tr>
                <tr>
                  <td>コントローラーのアクションの中</td>
                  <td>そのリクエストを処理しているコントローラーのインスタンス</td>
                  <td>
                    <code>params</code>、<code>render</code>、<code>redirect_to</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            同じ <code>where</code> でも、モデルのインスタンスメソッドの中にレシーバなしで書くと、self はレコードなので、レコードに対する呼び出しになります。where
            はモデルのクラスに対して呼ぶメソッドなので、この場合は NoMethodError です。インスタンスメソッドの中からは <code>Article.where(...)</code> か{' '}
            <code>self.class.where(...)</code> のように、クラスをレシーバにして書きます。
          </p>
          <h3>private メソッドとレシーバ</h3>
          <p>
            private メソッドは、レシーバを省略した形（または <code>self.</code> を付けた形）でしか呼べません。外から <code>obj.private_method</code> の形で呼ぶとエラーになります。
          </p>
          <p>
            次の例では、タイトルを受け取る <code>Article</code> を定義し、<code>Article.new</code> で作ったインスタンスを <code>a</code> に代入します。
            <code>strip</code> は、文字列の前後の空白を取り除くメソッドです。
          </p>
          <Code
            lang="ruby"
            code={`
class Article
  def initialize(title)
    @title = title
  end

  def title = @title
  def label = "[#{normalized_title}]"

  private

  def normalized_title = title.strip
end

a = Article.new(" Rails入門 ")
a.label            # => "[Rails入門]"
a.normalized_title
# private method 'normalized_title' called for an instance of Article (NoMethodError)
`}
          />
          <p>
            <code>private</code> だけを書いた行より後に定義したメソッドが private になります。この例で private なのは normalized_title だけです。label の中ではレシーバを省略して
            normalized_title を呼んでいるので実行でき、<code>a.normalized_title</code> はレシーバを付けているので NoMethodError になりました。このときのメッセージは「private method … called」で始まり、メソッドが無いときの「undefined
            method」とは先頭が違います。メソッドが無いのか、あるが private なのかを、メッセージの先頭で区別できます。
          </p>
          <p>
            Rails のコントローラーで <code>before_action</code> に指定するメソッドや、Strong Parameters（フォームから受け取った値のうち、保存してよい項目を指定する仕組み）用の <code>article_params</code> を private にするのは、ルーティングから呼ばれるアクションとして公開しないためです（
            <ChapterLink n={10} />）。
          </p>
        </>
      ),
    },
    {
      id: 'method-lookup',
      title: 'メソッド探索',
      body: (
        <>
          <p>
            <code>obj.foo</code> を実行すると、Ruby は <code>obj</code> のクラスから <code>foo</code> を探し、見つからなければ superclass、さらにその superclass
            と順にたどります。最初に見つかった定義を実行し、それより上は探しません。これを<Term en="method lookup">メソッド探索</Term>と呼びます
            <Ref n={1} />。
          </p>
          <Code
            lang="ruby"
            code={`
class Document
  def to_s = "Document: #{title}"
  def title = "(無題)"
end

class Report < Document
end

r = Report.new
Report.ancestors  # => [Report, Document, Object, Kernel, BasicObject]
r.to_s            # => "Document: (無題)"
r.method(:to_s).owner     # => Document
r.method(:frozen?).owner  # => Kernel
`}
          />
          <p>
            <code>ancestors</code> は、メソッド探索でたどる順序を配列で返します<Ref n={5} />。<code>Report</code> → <code>Document</code> → <code>Object</code> → <code>Kernel</code> →{' '}
            <code>BasicObject</code> の順です。<code>Kernel</code> はクラスではなくモジュールですが、<code>Object</code> に組み込まれているので探索の対象になります。モジュールが ancestors
            のどこに入るかは<ChapterLink n={3} />で説明します。
          </p>
          <p>
            図 2-5 は、<code>r.to_s</code> と <code>r.frozen?</code> の探索を、ancestors の順に上から並べたものです。to_s は Report に無く、次の Document で見つかります。<code>frozen?</code>{' '}
            はオブジェクトが変更を禁止されているかどうかを返すメソッドで、Report・Document・Object には無く、Kernel で見つかります。コードの最後の2行の owner の値が、それぞれの見つかった場所です。
          </p>
          <Figure n="2-5" title="メソッド探索の順序" caption="r.to_s は Document で見つかり、r.frozen? は Kernel で見つかる。">
            <LookupFigure />
          </Figure>
          <p>
            <code>Object</code> にも <code>to_s</code> はありますが、その手前の <code>Document</code> で見つかるので <code>Object</code> の <code>to_s</code>{' '}
            は使われません。子クラスで同名のメソッドを定義すると親の定義が使われなくなるのは、この「最初に見つかったものを使う」規則によるものです。これを<Term en="override">オーバーライド</Term>
            と呼びます。オーバーライドしたメソッドの中から親の定義を呼ぶには <code>super</code> を使います（<ChapterLink n={3} />）。
          </p>
          <p>
            メソッド探索は、メソッドを呼ぶたびに行われます。そのため、クラスにメソッドを後から追加すると、すでに作られているオブジェクトでも、次の呼び出しから新しいメソッドが使われます。Rails
            が実行中にクラスへメソッドを追加できるのは、この性質があるためです。
          </p>
          <p>
            Rails のコントローラーでも同じ規則で探します。<code>class ArticlesController &lt; ApplicationController</code> と書いているので、ArticlesController
            のインスタンスで呼んだメソッドは、ArticlesController、ApplicationController の順に探されます。ApplicationController に書いた <code>require_login</code>{' '}
            のようなメソッドを、各コントローラーの <code>before_action :require_login</code> で指定できるのはこのためです。同じ名前のメソッドを ArticlesController
            にも書くと、そちらが先に見つかり、ApplicationController の定義は実行されません。意図せず同じ名前を付けていないかを確かめるときは、
            <code>ArticlesController.instance_method(:require_login).owner</code> で、探索で見つかるクラスを調べられます。
          </p>
        </>
      ),
    },
    {
      id: 'kernel',
      title: 'Object・Kernel・BasicObject',
      body: (
        <>
          <p>
            クラスを定義すると、ancestors の末尾には必ず <code>Object</code>、<code>Kernel</code>、<code>BasicObject</code> が並びます。それぞれの役割を説明します
            <Ref n={2} />
            <Ref n={3} />。
          </p>
          <ul>
            <li>
              <code>BasicObject</code>：すべてのクラスの最上位にあるクラスです。持っているメソッドは <code>==</code>、<code>equal?</code>、<code>!</code>、<code>__send__</code>、
              <code>instance_eval</code> など、ごくわずかです。
            </li>
            <li>
              <code>Kernel</code>：<code>puts</code>、<code>p</code>、<code>require</code>、<code>raise</code> など、どこからでもレシーバなしで呼べるメソッドを持つモジュールです。これらは
              Kernel の private メソッドとして定義されています。
            </li>
            <li>
              <code>Object</code>：通常のクラスの既定の親クラスです。<code>Kernel</code> を組み込んでいるので、すべてのオブジェクトで Kernel のメソッドが使えます。
            </li>
          </ul>
          <Code
            lang="ruby"
            code={`
BasicObject.instance_methods.sort
# => [:!, :!=, :==, :__id__, :__send__, :equal?, :instance_eval, :instance_exec]

Kernel.private_instance_methods.include?(:puts)    # => true
Kernel.private_instance_methods.include?(:require) # => true
r.method(:puts).owner                              # => Kernel
`}
          />
          <p>
            <code>r</code> は「メソッド探索」の節で作った Report のインスタンスです。1つ目の結果は、BasicObject のインスタンスでレシーバを付けて呼べるメソッドの全部で、8個しかありません。
            <code>private_instance_methods</code> は、そのクラスやモジュールが持つ private メソッドの名前の一覧を返します。それを使った2行から puts と require が Kernel の private
            メソッドであること、最後の行から、r に対する puts の探索が Kernel で見つかることが分かります。
          </p>
          <p>
            クラス本体で <code>puts</code> や <code>require</code> をレシーバなしで呼べるのは、Object を継承したクラスでは、ancestors に <code>Kernel</code>{' '}
            が含まれているからです。モデルやコントローラーのメソッドの中に書く <code>raise</code> や <code>puts</code> も、レシーバを省略した self への呼び出しで、同じように Kernel
            で見つかります。private メソッドなので、<code>r.puts "x"</code> のようにレシーバを付けて呼ぶと、「private method 'puts' called for an instance of Report」の NoMethodError になります。
          </p>
          <p>
            <code>BasicObject</code> を直接継承すると、Kernel のメソッドを持たない、ほぼ空のクラスを作れます。ほかのオブジェクトへの呼び出しを中継するプロキシ（代理）オブジェクトを作るときに、Kernel
            のメソッドと名前が衝突しないようにする目的で使われます。
          </p>
        </>
      ),
    },
    {
      id: 'method-missing',
      title: 'メソッドが見つからなかったとき',
      body: (
        <>
          <p>
            <code>BasicObject</code> までたどってもメソッドが見つからない場合、Ruby は同じ順序で <code>method_missing</code> というメソッドを探して呼び出します。<code>BasicObject</code> が持つ既定の{' '}
            <code>method_missing</code> は <code>NoMethodError</code>（<code>NameError</code> のサブクラス）を発生させます
            <Ref n={1} />
            <Ref n={2} />。いつも見ている「undefined method」のエラーは、ここで作られています。なお、レシーバも引数も付けずに書いた名前（<code>foo</code> だけの行など）は、ローカル変数の可能性もあるため{' '}
            <code>NameError</code>（undefined local variable or method）になります。
          </p>
          <p>
            クラスで <code>method_missing</code> を定義すると、存在しないメソッドの呼び出しを受け取って処理できます。次の例は、ハッシュのキーをメソッドのように呼べるようにしたものです。
            <code>"host" =&gt; "db.example.com"</code> は、文字列の "host" をキーにした Hash の書き方です。
          </p>
          <Code
            lang="ruby"
            code={`
class Settings
  def initialize(hash) = @hash = hash

  def method_missing(name, *args)
    key = name.to_s
    if @hash.key?(key)
      @hash[key]
    else
      super # 対象外の名前は、既定の method_missing（NoMethodError）に任せる
    end
  end

  def respond_to_missing?(name, include_private = false)
    @hash.key?(name.to_s) || super
  end
end

s = Settings.new("host" => "db.example.com")
s.host              # => "db.example.com"
s.respond_to?(:host) # => true
s.port
# undefined method 'port' for an instance of Settings (NoMethodError)
`}
          />
          <p>この例は次の順に動きます。</p>
          <ul>
            <li>
              <code>s.host</code>：Settings にも、その祖先にも host の定義は無いので、Ruby は <code>method_missing</code> を呼びます。引数の <code>name</code>{' '}
              には、呼ばれたメソッドの名前がシンボル（<code>:host</code>）で入ります。<code>*args</code> には、呼び出しに付けた引数が配列で入ります（この例では使っていません）。
            </li>
            <li>
              @hash のキーは文字列なので、<code>name.to_s</code> で <code>"host"</code> に変換します。<code>@hash.key?(key)</code> はそのキーがあるかどうかを返し、あれば{' '}
              <code>@hash[key]</code> の値を戻り値にします。
            </li>
            <li>
              <code>s.port</code>：キー <code>"port"</code> は無いので <code>super</code> を呼びます。super は祖先にある同じ名前のメソッド、ここでは BasicObject の method_missing
              を呼び、NoMethodError になります。
            </li>
            <li>
              <code>s.respond_to?(:host)</code>：respond_to? は、その名前のメソッドの定義が無いときに <code>respond_to_missing?</code> を呼び、その結果を返します。キーがあれば true
              を返すように定義したので、true になりました。
            </li>
          </ul>
          <p>
            <code>method_missing</code> を定義するときは、対応しない名前を <code>super</code> に渡すことと、<code>respond_to_missing?</code> もあわせて定義することが慣例です。
            <code>respond_to_missing?</code> を定義しないと、実際には呼べるメソッドに対して <code>respond_to?</code> が <code>false</code> を返し、<code>method(:host)</code>{' '}
            でメソッドオブジェクトを取り出すこともできません
            <Ref n={3} />。
          </p>
          <h3>Rails での例：動的な find_by_〜</h3>
          <p>
            ActiveRecord の <code>Article.find_by_title("…")</code> のような、カラム名を含むメソッドは <code>method_missing</code> で実現されています。次に引用するのは{' '}
            <code>ActiveRecord::DynamicMatchers</code> の該当部分です<Ref n={7} />。<code>def find_by_title</code> はアプリケーションにも Rails のソースにも書かれていません。それでも呼べる理由と、2回目の呼び出しから何が変わるかを、この引用で確かめます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/dynamic_matchers.rb（17〜26行）"
            href={`${GH}/activerecord/lib/active_record/dynamic_matchers.rb#L17-L26`}
            code={`
      def method_missing(name, ...)
        match = Method.match(name)

        if match && match.valid?(self, name)
          match.define(self, name)
          send(name, ...)
        else
          super
        end
      end
`}
          />
          <p>
            ActiveRecord::Base はこのモジュールのメソッドをクラスメソッドとして取り込んでいるので、この method_missing は、モデルのクラスに対する呼び出しが見つからなかったときに呼ばれます。引用の中の{' '}
            <code>self</code> は、Article のようなモデルのクラスです。上から順に読みます。
          </p>
          <ul>
            <li>
              <code>def method_missing(name, ...)</code>：<code>name</code> には <code>:find_by_title</code> が入ります。<code>...</code>{' '}
              は、受け取った引数をすべてそのまま別のメソッドに渡すための書き方で、6行目の <code>send(name, ...)</code> で使っています。
            </li>
            <li>
              <code>Method.match(name)</code>：この <code>Method</code> は Ruby の Method クラスではなく、同じファイルで定義された ActiveRecord::DynamicMatchers::Method です。名前が{' '}
              <code>find_by_〜</code> か <code>find_by_〜!</code> の形のときに、その形を扱うクラスを返します。どちらの形でもなければ偽の値を返します。
            </li>
            <li>
              <code>match.valid?(self, name)</code>：<code>〜</code> の部分が、そのモデルのテーブルの列の名前かどうかを調べます。
            </li>
            <li>
              <code>match.define(self, name)</code>：モデルのクラスに <code>find_by_title</code> という名前のクラスメソッドを定義します。定義されるメソッドの中身は、
              <code>find_by(title: 引数)</code> に当たる呼び出しです。
            </li>
            <li>
              <code>send(name, ...)</code>：定義したばかりのメソッドを、最初の呼び出しの引数で呼びます。
            </li>
            <li>
              <code>else</code> の <code>super</code>：名前の形が違うか、列が無いときは、祖先の method_missing に渡します。最後は NoMethodError になります。<code>Article.find_by_titel("x")</code>{' '}
              のように列の名前を打ち間違えたときは、こちらを通ります。
            </li>
          </ul>
          <p>
            次の図は <code>Article.find_by_title("x")</code> を呼んだときの流れを、上から順に並べたものです。左の列が1回目の呼び出しで通る流れで、右端の太い青の経路が find_by_title を定義した後の2回目以降の流れです。
          </p>
          <Figure title="find_by_title を呼んだときの流れ" caption="模式図。method_missing(name, ...) から send(name, ...) までの5つの箱と、右の NoMethodError の箱が、引用した method_missing の各行に当たる。紫の箱で find_by_title を定義した後の呼び出しは、太い青の経路を通り、method_missing を通らない。">
            <DynamicFinderFlowFigure />
          </Figure>
          <p>
            名前が <code>find_by_〜</code> の形で、<code>〜</code> の部分が実在するカラムであれば、<code>match.define</code> でそのクラスに通常のクラスメソッドを定義してから、<code>send</code>
            （引数で受け取った名前のメソッドを呼ぶメソッド。<ChapterLink n={5} section="send" />）で呼び直します。一度定義されると、2回目以降の呼び出しはメソッド探索で見つかるため、<code>method_missing</code> を通りません。実際に確かめると次のようになります。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行"
            code={`
Article.singleton_class.method_defined?(:find_by_title) # => false
Article.respond_to?(:find_by_title)                     # => true（respond_to_missing? による）
Article.find_by_title("x")
Article.singleton_class.method_defined?(:find_by_title) # => true
`}
          />
          <p>
            <code>singleton_class</code> は、クラスメソッドが定義される場所（特異クラス）を返します。<ChapterLink n={3} />で説明します。
          </p>
          <p>
            1行目は呼ぶ前で、find_by_title はまだ定義されていません。それでも2行目の respond_to? が true を返すのは、同じファイルの respond_to_missing? が、名前の形と列の有無を method_missing
            と同じ方法で調べているためです。3行目で1回呼ぶと、4行目では定義済みに変わっています。
          </p>
          <p>
            アプリケーションと gem のソースを検索しても <code>def</code> が見つからないメソッドに出会ったら、このように method_missing で受けているか、実行時にメソッドを定義している（
            <ChapterLink n={5} section="define-method" />
            ）可能性があります。
          </p>
          <h3>NoMethodError のメッセージからレシーバを読む</h3>
          <p>
            NoMethodError のメッセージには、メソッドを探したレシーバが書かれています。「self の決まり方」の節の Article（Rails を使わない、Ruby だけのクラス）で、3通りのメッセージを出しました。
          </p>
          <Code
            lang="ruby"
            title="Ruby 4.0.9 で実行"
            code={`
article = Article.new("Rails入門")
article.titel
# undefined method 'titel' for an instance of Article (NoMethodError)

Article.titel
# undefined method 'titel' for class Article (NoMethodError)

found = nil
found.title
# undefined method 'title' for nil (NoMethodError)
`}
          />
          <p>
            <code>for</code> の後ろがレシーバです。「for an instance of Article」は Article のインスタンスに対して、「for class Article」は Article
            クラスに対して呼んだことを表します。この2つは、メソッド名の打ち間違いか、インスタンスとクラスの取り違えを疑います。「for nil」は、メソッド名が正しくても、レシーバが nil
            だったことを表します。Rails では、find_by が行を見つけられずに nil を返した後や、代入していないインスタンス変数をビューで使ったときに出ます。この場合に直すのは title
            を呼んでいる行ではなく、レシーバに nil が入った箇所です。
          </p>
        </>
      ),
    },
    {
      id: 'open-class',
      title: 'クラスの再オープンと Rails のコア拡張',
      body: (
        <>
          <p>
            Ruby ではすでに定義されているクラスに対して、もう一度 <code>class</code> 文を書くと、そのクラスにメソッドを追加できます。新しいクラスが作られるのではなく、既存のクラスが開き直されます。これを
            <Term en="open class">クラスの再オープン</Term>と呼びます。<code>String</code> のような組み込みクラス（Ruby に最初から用意されているクラス）も例外ではありません。
          </p>
          <Code
            lang="ruby"
            code={`
class String
  def shout = upcase + "!"
end

"hello".shout # => "HELLO!"
`}
          />
          <p>
            ActiveSupport のコア拡張は、この方法で Ruby の組み込みクラスにメソッドを追加しています。たとえば Rails でよく使う <code>blank?</code> は、Ruby 本体にはないメソッドで、ActiveSupport が{' '}
            <code>Object</code>、<code>NilClass</code>、<code>String</code> などを再オープンして定義しています<Ref n={8} />。
          </p>
          <Code
            lang="ruby"
            title="activesupport/lib/active_support/core_ext/object/blank.rb（135〜136行、153〜159行）"
            href={`${GH}/activesupport/lib/active_support/core_ext/object/blank.rb#L135-L159`}
            code={`
class String
  BLANK_RE = /\\A[[:space:]]*\\z/
  # ...（省略）
  def blank?
    # The regexp that matches blank strings is expensive. For the case of empty
    # strings we can speed up this method (~3.5x) with an empty? call. The
    # penalty for the rest of strings is marginal.
    empty? ||
      begin
        BLANK_RE.match?(self)
`}
          />
          <p>
            引用は String を再オープンしている部分です。途中の行と、blank? の末尾（文字コードが合わないときの処理と <code>end</code>）は省いています。
          </p>
          <ul>
            <li>
              <code>class String</code>：Ruby の String をもう一度開いています。この中の <code>def blank?</code> は、すべての文字列で呼べるメソッドになります。
            </li>
            <li>
              <code>BLANK_RE = /\A[[:space:]]*\z/</code>：正規表現（文字の並び方の条件を表す値）を定数に入れています。<code>\A</code> は文字列の先頭、<code>[[:space:]]*</code>{' '}
              は空白文字の0回以上の繰り返し、<code>\z</code> は文字列の末尾を表し、全体で「空文字列か、空白文字だけの文字列」に一致します。
            </li>
            <li>
              <code>empty? ||</code>：レシーバを省略しているので、self、つまり blank? を呼ばれた文字列に対する <code>empty?</code> です。空文字列ならここで true を返します。
            </li>
            <li>
              <code>BLANK_RE.match?(self)</code>：空文字列でなければ、その文字列（self）が正規表現に一致するかどうかを返します。英語のコメントは、正規表現の照合は遅いので、空文字列を empty?
              で先に判定して速くしている、という説明です。
            </li>
          </ul>
          <p>
            Rails アプリの中では <code>"".method(:blank?).owner</code> が <code>String</code> を返します。Ruby だけのスクリプトで <code>"".respond_to?(:blank?)</code> を調べると{' '}
            <code>false</code> になることから、このメソッドが Rails（ActiveSupport）によって追加されたものだと分かります。
          </p>
          <p>
            Rails のコードで使われているメソッドが Ruby のリファレンスに載っていないときは、コア拡張の可能性があります。<code>"".method(:blank?).source_location</code>{' '}
            で、定義しているファイルと行を調べられます（<ChapterLink n={1} section="find-source" />
            ）。同じファイルで定義されている <code>present?</code> も含め、コア拡張のメソッドは Rails を読み込まない Ruby のスクリプトでは使えず、呼ぶと NoMethodError になります。
          </p>
          <Callout kind="warn">
            <p>
              再オープンは、既存のメソッドを意図せず上書きする危険があります。gem 同士が同じクラスに同じ名前のメソッドを追加すると、後から読み込まれた方が使われます。影響範囲を限定したい場合は
              <ChapterLink n={3} />で扱う Refinements を、元のメソッドを残したまま処理を加えたい場合は <code>prepend</code> によるメソッドの包み込みを検討します（prepend の影響はプログラム全体に及びます）。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'rails-ancestors',
      title: 'Rails のモデルで ancestors を確かめる',
      body: (
        <>
          <p>
            ここまでの知識を使って、Rails のモデルの ancestors を見てみます。次のコードの <code>a</code> は Article のインスタンスではなく、ancestors が返した配列です。<code>first(7)</code>{' '}
            は先頭の7個、<code>last(6)</code> は末尾の6個を取り出します。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（has_many :comments を持つ Article）"
            code={`
a = Article.ancestors
a.size  # => 78
a.first(7)
# => [Article, Article::GeneratedAssociationMethods, Article::GeneratedAttributeMethods,
#     ApplicationRecord, ApplicationRecord::GeneratedAssociationMethods,
#     ApplicationRecord::GeneratedAttributeMethods, ActiveRecord::Base]
a.last(6)
# => [Object, ActiveSupport::ToJsonWithActiveSupportEncoder, JSON::GeneratorMethods,
#     ActiveSupport::Tryable, Kernel, BasicObject]
`}
          />
          <p>
            Article のメソッド探索では、78個のクラスとモジュールを順にたどります。<code>Article</code> の superclass は <code>ApplicationRecord</code>、その superclass は{' '}
            <code>ActiveRecord::Base</code>、その superclass は <code>Object</code>、さらにその superclass は <code>BasicObject</code> です。クラスはこの5つで、残りの73個はすべてモジュールです。
          </p>
          <Figure n="2-6" title="Article.ancestors の構成" caption="Rails 8.1.4.1 で has_many :comments を持つ Article の場合。左の数字は配列の添字。7〜71番目は個別の名前を省略している。">
            <AncestorsFigure />
          </Figure>
          <p>図2-6 から、次のことが読み取れます。</p>
          <ul>
            <li>
              Article の直後に <code>Article::GeneratedAssociationMethods</code> があります。第1章で見たとおり、<code>comments</code> メソッドはこのモジュールに定義されています。モデルで{' '}
              <code>def comments</code> を書くとこのメソッドより先に見つかるので上書きでき、中で <code>super</code> を呼べば元の <code>comments</code> を実行できます。
            </li>
            <li>
              その次の <code>Article::GeneratedAttributeMethods</code> には、<code>title</code> や <code>title=</code> などの属性のメソッドが定義されます（
              <ChapterLink n={11} section="accessors" />
              ）。これも Article より後にあるので、モデルに <code>def title</code> を書くと Article の定義が先に見つかり、その中の <code>super</code> で Rails が定義した title を呼べます。
            </li>
            <li>
              <code>ActiveRecord::Base</code> の後には65個のモジュールが並びます。<code>save</code> や <code>valid?</code> など、モデルで使うメソッドのほとんどはこれらのモジュールに定義されています。
            </li>
            <li>
              <code>Object</code> の後にも、ActiveSupport などが組み込んだモジュールがあります。<code>try</code> メソッドを持つ <code>ActiveSupport::Tryable</code> はその1つです。
            </li>
          </ul>
          <p>
            あるメソッドがこの78個のどこで見つかるかを知りたいときは、配列を目で追う代わりに <code>Article.instance_method(:save).owner</code>{' '}
            のように owner を調べます。返るのは、メソッド探索で最初に見つかるクラスかモジュールです（<ChapterLink n={1} section="find-source" />
            ）。
          </p>
          <p>
            モジュールがなぜこの位置に入るのか、同じ名前のメソッドが複数のモジュールにあるとどうなるのかを、次の<ChapterLink n={3} />で説明します。
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
            Ruby の値はすべてオブジェクトで、メソッドは「レシーバ.メソッド名(引数)」の形で呼び、戻り値を受け取ります。呼べないメソッドを呼ぶと、NoMethodError の例外が発生します。
          </li>
          <li>
            クラスから new で作ったオブジェクトがインスタンスです。<code>@</code> で始まるインスタンス変数は、インスタンスごとに値を持ちます。<code>&lt;</code> で親クラスを指定すると、そのメソッドを継承します。
          </li>
          <li>
            クラスの本体のコードは、クラスの定義を読み込むときに実行されます。attr_reader・has_many・before_action は、本体で呼んでクラスにメソッドや設定を加えるクラスメソッドです。
          </li>
          <li>
            Rails のコードは、括弧・レシーバ・最後の引数の <code>{'{}'}</code> を省略したメソッド呼び出しです。<code>validates :title, presence: true</code> は{' '}
            <code>self.validates(:title, {'{'} presence: true {'}'})</code> と同じです。
          </li>
          <li>
            「名前: 値」の引数は、受け取る側の定義によって、キーワード引数として届くか、最後の Hash として届くかが変わります。属性への代入は <code>self.title =</code> のように <code>self.</code>{' '}
            を付けて書きます。
          </li>
          <li>オブジェクトはインスタンス変数とクラスへの参照を持ちます。メソッドはクラスが持ちます。</li>
          <li>
            クラスもオブジェクトで、その class は <code>Class</code> です。<code>class</code>（何のインスタンスか）と <code>superclass</code>（何を継承しているか）は別の関係です。
          </li>
          <li>
            <code>self</code> はコードの位置で決まります。クラス本体では self はクラスなので、<code>has_many :comments</code> は Article に対するメソッド呼び出しになります。
          </li>
          <li>
            メソッド探索は ancestors の順に進み、最初に見つかった定義を実行します。見つからなければ <code>method_missing</code> が呼ばれます。
          </li>
          <li>
            <code>method_missing</code> を定義するときは <code>respond_to_missing?</code> も定義します。ActiveRecord の <code>find_by_〜</code> は初回の呼び出し時に通常のメソッドを定義します。
          </li>
          <li>ActiveSupport のコア拡張（<code>blank?</code> など）は、クラスの再オープンで組み込みクラスにメソッドを追加しています。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Calling Methods（Method Lookup）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/calling_methods_rdoc.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'メソッド探索の順序、レシーバの省略、method_missing が呼ばれる条件。' },
    { title: 'class BasicObject', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/BasicObject.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'BasicObject の役割、method_missing の既定の動作、BasicObject を継承したプロキシ。' },
    { title: 'class Object', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Object.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'Object と Kernel の関係、respond_to_missing? の役割。' },
    { title: 'クラス／メソッドの定義', publisher: 'Ruby リファレンスマニュアル', url: 'https://docs.ruby-lang.org/ja/latest/doc/spec=2fdef.html', accessed: '2026-11-11', note: 'クラス定義の本体が実行されること、メソッド定義と呼び出し制限（private）。' },
    { title: 'class Module', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Module.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'ancestors、instance_methods の仕様。' },
    { title: 'class Class', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Class.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'Class.new、superclass、クラスとメタクラスの関係。' },
    { title: 'activerecord/lib/active_record/dynamic_matchers.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/dynamic_matchers.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'find_by_〜 を method_missing で受け取り、メソッドを定義してから呼び直す実装。' },
    { title: 'activesupport/lib/active_support/core_ext/object/blank.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/core_ext/object/blank.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'String などを再オープンして blank? を定義する実装。' },
    { title: 'Methods（Method Names・Array/Hash Argument・Keyword Arguments）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/methods_rdoc.html', accessed: '2026-11-13', version: 'Ruby 4.0', note: '? と ! で終わるメソッド名の慣習、*args と **options、必須のキーワード引数と未定義のキーワードで ArgumentError になること、キーワード引数の無いメソッドでは最後の Hash になること。' },
    { title: 'class Symbol', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Symbol.html', accessed: '2026-11-13', version: 'Ruby 4.0', note: '同じ名前のシンボルは実行中ずっと同じオブジェクトであること。' },
    { title: 'activemodel/lib/active_model/validations/validates.rb・activerecord/lib/active_record/associations.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/validations/validates.rb#L111`, accessed: '2026-11-13', version: 'Rails 8.1.4.1', note: 'validates(*attributes) と has_many(name, scope = nil, **options, &extension)（associations.rb の 1427 行目）の定義。' },
    { title: 'Literals（Percent Literals）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/literals_rdoc.html', accessed: '2026-11-13', version: 'Ruby 4.0', note: '%w と %i で文字列とシンボルの配列を作る書き方。' },
    { title: 'activerecord/lib/active_record/scoping/named.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/scoping/named.rb#L154-L156`, accessed: '2026-11-13', version: 'Rails 8.1.4.1', note: 'scope の本体が call を持たなければ ArgumentError を投げる処理。' },
    { title: 'Assignment（Local Variables and Methods・Abbreviated Assignment）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/assignment_rdoc.html', accessed: '2026-11-13', version: 'Ruby 4.0', note: '代入した名前はローカル変数として扱われ、代入メソッドを呼ぶにはレシーバが必要なこと。||= の動作。' },
    { title: 'Modules and Classes', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/modules_and_classes_rdoc.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: 'class によるクラスの定義、< による継承と、親クラスで定義したメソッドを子クラスから呼べること。' },
    { title: 'class NoMethodError', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/NoMethodError.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: 'レシーバに定義されていないメソッドを呼ぶと発生する例外であること。' },
    { title: 'ActiveRecord::Associations::ClassMethods', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Associations/ClassMethods.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'has_many などの関連の宣言が、関連を扱うメソッドをクラスに追加すること。' },
    { title: 'AbstractController::Callbacks::ClassMethods', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/AbstractController/Callbacks/ClassMethods.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'before_action がアクションの前に実行するコールバックを登録するクラスメソッドであること。' },
  ],
}

export default withExplanations(ch02, explanation02)
