import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation05 } from '../explanations/ruby'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 5-1 Article の宣言と Rails が作ったメソッドの置き場所 ---------- */
function GeneratedFigure() {
  const right: { y: number; lines: string[]; fill: 'box2' | 'box3' }[] = [
    { y: 30, lines: ['Article::GeneratedAssociationMethods', 'author / comments / comment_ids / tags …（37個）'], fill: 'box2' },
    { y: 88, lines: ['enum が作るモジュール（名前なし）', 'draft? / draft! / published? …（6個）'], fill: 'box2' },
    { y: 146, lines: ['#<Class:Article>（特異クラス）', 'recent / draft / published / statuses …'], fill: 'box3' },
    { y: 210, lines: ['Article::GeneratedAttributeMethods', 'title / title= / title_changed? …（287個）'], fill: 'box2' },
  ]
  return (
    <Svg
      id="5-1"
      w={780}
      h={320}
      label="デモの Article の宣言と、Rails が作ったメソッドの置き場所。belongs_to・has_many・has_one_attached からは、author、comments、comment_ids、tags などの37個のメソッドが Article::GeneratedAssociationMethods に作られる。enum :status からは draft? や draft! などの6個のメソッドが名前の無いモジュールに作られ、draft や published などのクラスメソッドも作られる。scope :recent からはクラスメソッド recent が Article の特異クラスに作られる。articles テーブルの列からは title、title=、title_changed? などの287個のメソッドが Article::GeneratedAttributeMethods に作られる。Article.ancestors では、Article の後ろに enum のモジュール、GeneratedAssociationMethods、GeneratedAttributeMethods の順に並ぶ"
    >
      <T x={20} y={18} fs={12} tone="muted">
        app/models/article.rb（デモ。一部を省略）
      </T>
      <Box
        x={20}
        y={30}
        w={330}
        h={160}
        lines={[
          'class Article < ApplicationRecord',
          '  belongs_to :author, optional: true',
          '  has_many :comments',
          '  has_many :taggings',
          '  has_many :tags, through: :taggings',
          '  enum :status, { draft: 0, … }',
          '  has_one_attached :cover …',
          '  scope :recent, -> { … }',
          'end',
        ]}
        mono
        fs={11}
        fill="bg"
        align="start"
      />
      <Box x={20} y={210} w={330} h={44} lines={['articles テーブルの列', 'id・title・body・status など13列']} fs={12} fill="box4" subTone="muted" />
      <T x={430} y={18} fs={12} tone="muted">
        Rails が作ったメソッドの置き場所
      </T>
      {right.map((r) => (
        <Box key={r.y} x={430} y={r.y} w={330} h={44} lines={r.lines} mono fs={11.5} fill={r.fill} bold subTone="muted" />
      ))}
      <Arrow x1={350} y1={79} x2={428} y2={52} />
      <Arrow x1={350} y1={125} x2={428} y2={110} />
      <Arrow x1={350} y1={156} x2={428} y2={168} />
      <Arrow x1={350} y1={232} x2={428} y2={232} />
      <T x={20} y={290} fs={11.5} tone="muted">
        Article.ancestors では、Article の後ろに enum のモジュール、GeneratedAssociationMethods、GeneratedAttributeMethods の順に並ぶ
      </T>
    </Svg>
  )
}

/* ---------- 図 5-2 DSL の宣言が登録するものと使われる時点 ---------- */
function DslRegisterFigure() {
  const rows = [
    ['resources :articles', 'ルートの一覧（URL とアクションの対応）', '要求が届いてアクションを選ぶとき'],
    ['before_action :set_article', 'process_action のコールバックの列', 'アクションを実行する前'],
    ['validates :body, presence: true', 'バリデーター（PresenceValidator）', 'valid? や save のとき'],
    ['has_many :comments', 'comments などのメソッドと関連の情報', 'comments を呼んだとき'],
  ]
  return (
    <Svg
      id="5-2"
      w={780}
      h={290}
      label="Rails の DSL の宣言は、ファイルやクラスを読み込むときに実行され、情報を登録する。resources :articles はルートの一覧に登録し、要求が届いてアクションを選ぶときに使われる。before_action :set_article は process_action のコールバックの列に登録し、アクションを実行する前に使われる。validates :body, presence: true はバリデーターを登録し、valid? や save のときに使われる。has_many :comments はメソッドと関連の情報を作り、comments を呼んだときに使われる"
    >
      <T x={20} y={18} fs={12} tone="muted">
        宣言（読み込むときに実行）
      </T>
      <T x={270} y={18} fs={12} tone="muted">
        登録されるもの
      </T>
      <T x={540} y={18} fs={12} tone="muted">
        使われる時点
      </T>
      {rows.map(([decl, reg, use], i) => {
        const y = 32 + i * 56
        return (
          <g key={decl}>
            <Box x={20} y={y} w={228} h={40} lines={decl} mono fs={11} fill="bg" />
            <Arrow x1={248} y1={y + 20} x2={268} y2={y + 20} />
            <Box x={270} y={y} w={252} h={40} lines={reg} fs={11.5} fill="box4" />
            <Arrow x1={522} y1={y + 20} x2={538} y2={y + 20} />
            <Box x={540} y={y} w={220} h={40} lines={use} fs={11.5} fill="box5" />
          </g>
        )
      })}
      <T x={20} y={270} fs={11.5} tone="muted">
        宣言は登録だけを行い、登録したものを Rails が後で使う
      </T>
    </Svg>
  )
}

/* ---------- 図 5-3 class_attribute の値の置き場所 ---------- */
function ClassAttributeFigure() {
  return (
    <Svg
      id="5-3"
      w={640}
      h={300}
      label="class_attribute :settings を Base に定義すると、Base の特異クラスに settings、settings=、private な __class_attr_settings（値 {timeout: 5} を返す）が定義される。Child.settings = ... を実行すると、Child の特異クラスに {timeout: 10} を返す __class_attr_settings が追加される。Other の特異クラスには定義がないので、Other.settings は superclass である Base の特異クラスの値を読む"
    >
      <Box
        x={160}
        y={16}
        w={320}
        h={100}
        lines={['#<Class:Base>', 'settings / settings=', '__class_attr_settings → {timeout: 5}', '__class_attr_settings=']}
        mono
        fs={12}
        fill="box3"
        bold
      />
      <Box
        x={20}
        y={176}
        w={290}
        h={70}
        lines={['#<Class:Child>', '__class_attr_settings → {timeout: 10}', '（Child.settings = … で追加）']}
        mono
        fs={11.5}
        fill="box3"
        bold
        accent
      />
      <Box x={330} y={176} w={290} h={70} lines={['#<Class:Other>', '（定義なし）']} mono fs={12} fill="box3" bold />
      <Arrow x1={165} y1={176} x2={260} y2={118} dashed />
      <Arrow x1={475} y1={176} x2={380} y2={118} dashed />
      <T x={196} y={140} fs={11} tone="muted" anchor="end" mono>
        superclass
      </T>
      <T x={444} y={140} fs={11} tone="muted" mono>
        superclass
      </T>
      <T x={20} y={270} fs={12} tone="muted">
        Child.settings → #&lt;Class:Child&gt; で見つかる（{'{timeout: 10}'}）
      </T>
      <T x={20} y={290} fs={12} tone="muted">
        Other.settings → #&lt;Class:Other&gt; に無いので #&lt;Class:Base&gt; で見つかる（{'{timeout: 5}'}）
      </T>
    </Svg>
  )
}

/* ---------- 図 5-4 Concern を include したときの処理順 ---------- */
function ConcernFigure() {
  const N = 90
  const C = 320
  const G = 545
  const lane = (x: number, name: string) => (
    <g key={name}>
      <Box x={x - 80} y={10} w={160} h={30} lines={name} mono fs={12.5} fill={name === 'Note' ? 'box' : 'box2'} />
      <line x1={x} y1={40} x2={x} y2={392} stroke="var(--fig-line)" strokeDasharray="3 4" />
    </g>
  )
  const self = (x: number, y: number, text: string) => <Box x={x - 105} y={y - 15} w={210} h={30} lines={text} fs={11.5} fill="box5" />
  return (
    <Svg
      id="5-4"
      w={680}
      h={430}
      label="Commentable（Taggable に依存する Concern）を Note に include したときの処理順。1. Note が Commentable.append_features(Note) を呼ぶ。2. Commentable は依存先の Taggable を先に Note に include する。3. Taggable は super で Note の ancestors に自分を挿入する。4. Taggable は Note.extend(ClassMethods) を行う。5. Taggable は自分の included ブロックを Note.class_eval で実行する。6. Commentable が super で Note の ancestors に自分を挿入する。7. Commentable の included ブロックを Note.class_eval で実行する"
    >
      {lane(N, 'Note')}
      {lane(C, 'Commentable')}
      {lane(G, 'Taggable')}

      <Arrow x1={N} y1={70} x2={C - 2} y2={70} />
      <T x={(N + C) / 2} y={58} fs={11.5} anchor="middle">
        ① include → append_features(Note)
      </T>
      <Arrow x1={C} y1={116} x2={G - 2} y2={116} />
      <T x={(C + G) / 2} y={104} fs={11.5} anchor="middle">
        ② 依存先を先に Note.include(Taggable)
      </T>
      {self(G, 162, '③ super：ancestors に挿入')}
      <Arrow x1={G} y1={208} x2={N + 2} y2={208} />
      <T x={(N + G) / 2} y={196} fs={11.5} anchor="middle">
        ④ Note.extend(Taggable::ClassMethods)
      </T>
      <Arrow x1={G} y1={254} x2={N + 2} y2={254} />
      <T x={(N + G) / 2} y={242} fs={11.5} anchor="middle">
        ⑤ Note.class_eval(Taggable の included ブロック)
      </T>
      {self(C, 300, '⑥ super：ancestors に挿入')}
      <Arrow x1={C} y1={346} x2={N + 2} y2={346} />
      <T x={(N + C) / 2} y={334} fs={11.5} anchor="middle">
        ⑦ class_eval(included ブロック)
      </T>
      <T x={20} y={414} fs={12} tone="muted" mono>
        結果：Note.ancestors → [Note, Commentable, Taggable, Object, …]
      </T>
    </Svg>
  )
}

/* ---------- 図 5-5 コールバックの定義順と実行の入れ子 ---------- */
function CallbackNestingFigure() {
  const defs = ['around1', 'before A', 'after A', 'around2', 'before B', 'after B']
  return (
    <Svg
      id="5-5"
      w={640}
      h={330}
      label="左は set_callback で定義した順序：around1、before A、after A、around2、before B、after B。右は実行時の入れ子：around1 の前半、before A、around2 の前半、before B、本体、after B、around2 の後半、after A、around1 の後半の順に実行される。around はそれより後に定義したコールバックと本体を包む"
    >
      <T x={20} y={18} fs={12} tone="muted">
        定義の順（set_callback）
      </T>
      {defs.map((d, i) => (
        <Box key={d} x={20} y={34 + i * 40} w={180} h={30} lines={d} mono fs={12.5} fill={d.startsWith('around') ? 'box2' : 'bg'} />
      ))}
      <T x={270} y={18} fs={12} tone="muted">
        実行の入れ子（上から順に実行）
      </T>
      <rect x={270} y={30} width={350} height={290} rx={8} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <T x={286} y={50} mono fs={12.5}>
        around1 前
      </T>
      <T x={300} y={78} mono fs={12.5}>
        before A
      </T>
      <rect x={290} y={96} width={310} height={160} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={306} y={116} mono fs={12.5}>
        around2 前
      </T>
      <T x={320} y={144} mono fs={12.5}>
        before B
      </T>
      <Box x={320} y={160} w={250} h={30} lines="本体（run_callbacks のブロック）" fs={12} fill="box5" accent />
      <T x={320} y={208} mono fs={12.5}>
        after B
      </T>
      <T x={306} y={236} mono fs={12.5}>
        around2 後
      </T>
      <T x={300} y={278} mono fs={12.5}>
        after A
      </T>
      <T x={286} y={304} mono fs={12.5}>
        around1 後
      </T>
    </Svg>
  )
}

/* ---------- 図 5-6 has_many :comments が行うこと ---------- */
function HasManyFigure() {
  const steps = [
    'create_reflection：HasManyReflection を作る',
    'define_accessors：関連メソッドを定義',
    'define_callbacks：dependent: 指定時の削除処理',
    'define_validations など（関連の種類ごと）',
  ]
  return (
    <Svg
      id="5-6"
      w={680}
      h={340}
      label="has_many :comments を実行すると、まず Builder::HasMany.build が呼ばれ、Reflection の作成、関連メソッドの定義、dependent オプションのコールバック登録、バリデーションなどの登録を行う。関連メソッドの comments、comments=、comment_ids、comment_ids= は、Article に include 済みの Article::GeneratedAssociationMethods モジュールに定義される。次に Reflection.add_reflection が、作った Reflection を class_attribute の _reflections に登録する"
    >
      <Box x={20} y={20} w={240} h={50} lines={['has_many :comments', 'Article のクラス本体で実行']} mono={false} bold fill="bg" subTone="muted" />
      <Box x={330} y={20} w={330} h={50} lines={['① Builder::HasMany.build', '(Article, :comments, scope, options)']} mono fs={12} />
      <Arrow x1={260} y1={45} x2={328} y2={45} />
      <line x1={345} y1={70} x2={345} y2={238} stroke="var(--fig-line)" strokeWidth={1.5} />
      {steps.map((s, i) => {
        const y = 86 + i * 42
        return (
          <g key={s}>
            <Arrow x1={345} y1={y + 15} x2={362} y2={y + 15} />
            <Box x={364} y={y} w={296} h={30} lines={s} fs={11.5} />
          </g>
        )
      })}
      <Box x={20} y={120} w={260} h={74} lines={['Article::GeneratedAssociationMethods', 'comments / comments=', 'comment_ids / comment_ids=']} mono fs={11.5} fill="box2" bold />
      <Arrow x1={362} y1={143} x2={282} y2={150} />
      <T x={20} y={210} fs={11.5} tone="muted">
        Article に include 済みのモジュール（図2-6 の1番目）
      </T>

      <Box x={20} y={262} w={260} h={44} lines="② Reflection.add_reflection" mono fs={12.5} />
      <Box x={350} y={262} w={310} h={44} lines={['Article._reflections', '= {comments: HasManyReflection}']} mono fs={11.5} fill="box4" />
      <Arrow x1={280} y1={284} x2={348} y2={284} />
      <Arrow d="M20,52 H10 V284 H18" />
      <T x={350} y={326} fs={11.5} tone="muted">
        class_attribute なので親クラスには影響しない
      </T>
    </Svg>
  )
}

const ch05: Chapter = {
  number: 5,
  part: 1,
  title: 'メタプログラミングと Rails の DSL',
  summary:
    'デモの Article で Rails が作ったメソッドを調べ、has_many や attribute を実行するとメソッドができること、Rails の DSL の宣言が何を登録するかを確かめます。そのうえで、send・define_method・method_missing によるメタプログラミングと、Rails がそれを使って作っている class_attribute、ActiveSupport::Concern、ActiveSupport::Callbacks の実装を読みます。最後に before_action と has_many が実際に何をしているかを確かめます。',
  goals: [
    'モデルに書いていないメソッドの定義元を owner と source_location で調べ、has_many などを実行したときにメソッドが作られることを説明できる',
    'Rails の DSL がメソッド呼び出しであり、宣言が情報を登録して後で使われることを説明できる',
    'send・public_send・define_method・文字列の class_eval の違いと使いどころを説明できる',
    'クラスマクロの仕組みと、クラスのインスタンス変数が継承されない問題を説明できる',
    'class_attribute が特異クラスとクロージャを使って、親子で別の値を持てる仕組みを説明できる',
    'ActiveSupport::Concern が append_features を上書きして、依存関係の解決・ClassMethods の extend・included ブロックの実行を行うことを説明できる',
    'ActiveSupport::Callbacks のコールバックの登録・実行順・中断の規則を説明できる',
    'before_action と has_many が、それぞれ何を呼び出し、クラスに何を追加するかを説明できる',
  ],
  prerequisites: [3, 4],
  sections: [
    {
      id: 'generated-methods',
      title: 'モデルに書いていないメソッド',
      body: (
        <>
          <p>デモのアプリの Article モデルのファイルは、次の11行です。</p>
          <Code
            lang="ruby"
            title="app/models/article.rb（デモのアプリ）"
            code={`
class Article < ApplicationRecord
  belongs_to :author, optional: true
  has_many :comments
  has_many :taggings
  has_many :tags, through: :taggings
  enum :status, { draft: 0, published: 1, archived: 2 }
  has_one_attached :cover do |attachable|
    attachable.variant :thumb, resize_to_limit: [100, 100]
  end
  scope :recent, -> { order(published_at: :desc) }
end
`}
          />
          <p>このファイルには def が1つもありませんが、Article のインスタンスでは title や comments、draft? を呼べ、Article というクラスに対しては recent を呼べます。</p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（デモのアプリ）"
            code={`
article = Article.new(title: "メタプログラミング")
article.title          # => "メタプログラミング"
article.comments.class # => Comment::ActiveRecord_Associations_CollectionProxy
article.draft?         # => true
Article.recent.class   # => Article::ActiveRecord_Relation
`}
          />
          <p>
            title は articles テーブルの title 列の値を返します。comments はこの記事に付いたコメントの一覧を返し、draft? は status 列が draft（下書き）かどうかを返します。recent は published_at
            の新しい順に並べる条件を持ったオブジェクトを返します。どれも、このファイルに定義を書いていないメソッドです。定義元を owner と source_location で調べました（
            <ChapterLink n={1} section="find-source" />
            ）。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（デモのアプリ。gem のパスの前半を省略）"
            code={`
Article.instance_method(:title).owner     # => Article::GeneratedAttributeMethods
Article.instance_method(:comments).owner  # => Article::GeneratedAssociationMethods
Article.instance_method(:comments).source_location
# => [".../activerecord-8.1.4.1/lib/active_record/associations/builder/association.rb", 104]
Article.instance_method(:draft?).source_location
# => [".../activerecord-8.1.4.1/lib/active_record/enum.rb", 307]

Article.const_get(:GeneratedAssociationMethods).instance_methods(false).size # => 37
Article.const_get(:GeneratedAttributeMethods).instance_methods(false).size   # => 287
Article.const_get(:GeneratedAttributeMethods).instance_methods(false).grep(/\\Atitle/).size # => 16
`}
          />
          <p>
            title は Article::GeneratedAttributeMethods、comments は Article::GeneratedAssociationMethods というモジュールに定義されていました。どちらも Rails が Article のために作り、Article に include
            したモジュールです（<ChapterLink n={3} section="module-include" />
            ）。comments と draft? の source_location は、アプリのファイルではなく、ActiveRecord の gem の中の association.rb と enum.rb を指しています。Rails のコードが実行されて、Article
            のためにこれらのメソッドを作ったということです。
          </p>
          <p>
            2つのモジュールのメソッドを数えると、関連のメソッドが37個、属性のメソッドが287個ありました。title だけでも、値を書き込む title= や、値が変更されたかを返す title_changed? など16個あります（図
            5-1）。has_many などの関連が作るメソッドは Rails のガイドに一覧があります
            <Ref n={10} />。
          </p>
          <Figure n="5-1" title="Article の宣言と、Rails が作ったメソッドの置き場所" caption="デモのアプリ（Rails 8.1.4.1）で owner・instance_methods・ancestors を調べた結果をまとめた図。">
            <GeneratedFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'runtime-define',
      title: '実行するとメソッドができる',
      body: (
        <>
          <p>
            前の節のメソッドはいつ作られるのでしょうか。Ruby はクラスの本体を上から順に実行し、本体に書いたメソッド呼び出しもそのときに実行します。Ruby に最初からある{' '}
            <code>attr_accessor</code> で確かめます。
          </p>
          <Code
            lang="ruby"
            title="class_body.rb"
            code={`
class Note
  puts "クラスの本体を実行中: self は #{self}"
  p instance_methods(false)
  attr_accessor :title
  p instance_methods(false)
end

note = Note.new
note.title = "メモ"
p note.title
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
クラスの本体を実行中: self は Note
[]
[:title, :title=]
"メモ"
`}
          />
          <p>
            クラスの本体の中の puts が実行され、そのときの self は Note でした。attr_accessor を実行する前の <code>instance_methods(false)</code> は空で、実行した後は title と title=
            が増えています。attr_accessor は指定した名前で値を読むメソッドと書き込むメソッドを作るメソッドです
            <Ref n={2} />。def を書かなくても、メソッドを呼んだ結果としてメソッドができました。
          </p>
          <p>
            has_many もクラスの本体で実行されるクラスメソッドです（<ChapterLink n={3} section="class-method-intro" />
            ）。デモの Article と同じ articles テーブルを使う Article05 というクラスを bin/rails runner の中で定義し、has_many と attribute を実行する前と後で比べました。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（デモのアプリ）"
            code={`
class Article05 < ApplicationRecord
  self.table_name = "articles"
end

p Article05.method_defined?(:comments)
Article05.has_many :comments, foreign_key: :article_id
p Article05.method_defined?(:comments)
p Article05.const_get(:GeneratedAssociationMethods).instance_methods(false).sort

p Article05.new.respond_to?(:memo)
Article05.attribute :memo, :string, default: "なし"
note = Article05.new
p note.respond_to?(:memo)
p note.memo
note.memo = "下書き"
p note.memo
`}
          />
          <Code
            lang="text"
            title="出力"
            code={`
false
true
[:comment_ids, :comment_ids=, :comments, :comments=]
false
true
"なし"
"下書き"
`}
          />
          <p>
            <code>method_defined?</code> はインスタンスメソッドが定義されているかを返します。has_many :comments を実行する前は comments は無く、実行した後は comments、comments=、comment_ids、comment_ids=
            の4つができました。<code>foreign_key: :article_id</code> は comments テーブルで記事を指す列の名前を指定するオプションです。クラスの名前が Article05 なので、指定しなければ article05_id
            という列を探します。<code>attribute</code> は型を指定して属性を定義するメソッドで
            <Ref n={11} />
            、実行した後はテーブルに無い memo を読み書きできるようになりました。
          </p>
          <p>
            このように、プログラムの実行中にメソッドを作ったり、名前を指定してメソッドを呼んだりする書き方を<Term en="metaprogramming">メタプログラミング</Term>
            と呼びます。attr_accessor や has_many を使う側は、メソッドを作るコードを書かずに、作ってほしいメソッドの名前と設定だけを書きます。Rails のモデルやコントローラーに並ぶ1行ずつの宣言の多くは、このようにメソッドや設定を作るメソッドの呼び出しです。次の節ではこの書き方を見ます。
          </p>
        </>
      ),
    },
    {
      id: 'dsl-intro',
      title: '宣言の形で書く Rails の DSL',
      body: (
        <>
          <p>
            Rails のアプリケーションのファイルには、何を設定するかを1行ずつ宣言するような書き方が多く出てきます。routes.rb の <code>resources :articles</code>、モデルの{' '}
            <code>has_many :comments</code> や <code>validates :body, presence: true</code>、コントローラーの <code>before_action :set_article</code> などです。このように、ある用途の内容を短く書けるように作った書き方を
            <Term en="domain-specific language">DSL</Term> と呼び、日本語ではドメイン固有言語と言います
            <Ref n={12} />。Rails のガイドも routes.rb の書き方をルーターの DSL と、マイグレーション（テーブルの構造を変える手順を書いたファイル）の書き方を Ruby の DSL と呼んでいます
            <Ref n={13} />
            <Ref n={14} />。
          </p>
          <p>
            Rails の DSL は新しく作った言語ではなく Ruby のメソッド呼び出しです。括弧とレシーバを省略しているので宣言のように見えますが、<code>has_many :comments</code> は{' '}
            <code>self.has_many(:comments)</code> と同じです（<ChapterLink n={2} section="rails-syntax" />
            ）。前の節で見たとおり、こうした呼び出しはクラスの本体やファイルを読み込むときに実行されます。
          </p>
          <p>実行された宣言は情報を登録します。デモのアプリで、登録された内容を確かめました。</p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（デモのアプリ）"
            code={`
p Comment.validators.map { |v| [v.class.name.demodulize, v.attributes] }

ArticlesController._process_action_callbacks.each do |c|
  where = c.filter.is_a?(Proc) ? File.basename(c.filter.source_location.join(":")) : c.filter
  p [c.kind, where]
end
`}
          />
          <Code
            lang="text"
            title="出力"
            code={`
[["PresenceValidator", [:article]], ["PresenceValidator", [:body]]]
[:before, :verify_authenticity_token]
[:after, :verify_same_origin_request]
[:before, "engine.rb:39"]
[:before, "railtie.rb:51"]
[:around, :turbo_tracking_request_id]
[:before, "allow_browser.rb:58"]
[:before, "articles_controller.rb:2"]
`}
          />
          <p>
            デモの Comment モデルには <code>belongs_to :article</code> と <code>validates :body, presence: true</code> が書いてあります。validators の結果から、body
            の値が空でないことを検査する PresenceValidator が登録されていることが分かります。belongs_to も、記事が指定されていることを検査する PresenceValidator を登録していました
            <Ref n={10} />。
          </p>
          <p>
            <code>_process_action_callbacks</code> は、アクションの前後に実行する処理の列を返す、Rails の内部向けのメソッドです。ArticlesController
            には7つが登録されていました。最後の articles_controller.rb の2行目は、ArticlesController に書いた before_action のブロックです。その1つ前の allow_browser.rb の58行目は、ApplicationController
            に書かれた <code>allow_browser versions: :modern</code>（古いブラウザーからの要求を断る設定）が登録したものです。allow_browser の中身は、before_action を呼ぶ1行です
            <Ref n={15} />。残りの5つは、Rails や gem が登録しています。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_controller/metal/allow_browser.rb（57〜59行）"
            href={`${GH}/actionpack/lib/action_controller/metal/allow_browser.rb#L57-L59`}
            code={`
      def allow_browser(versions:, block: -> { render file: Rails.root.join("public/406-unsupported-browser.html"), layout: false, status: :not_acceptable }, **options)
        before_action -> { allow_browser(versions: versions, block: block) }, **options
      end
`}
          />
          <p>
            登録された検査は valid? や save のときに、before_action の処理はアクションを実行する前に、Rails が呼び出します（図 5-2）。DSL の1行を読むときは、その宣言が何を登録し、登録したものがいつ使われるかを確かめます。
          </p>
          <Figure n="5-2" title="DSL の宣言が登録するものと、使われる時点" caption="この節と第4章の実行例をもとにまとめた表。">
            <DslRegisterFigure />
          </Figure>
          <p>
            <code>before_action :set_article</code> のように処理をシンボル（名前）で登録した場合、Rails は後でその名前のメソッドを呼びます。名前を値として受け取ってメソッドを呼ぶ方法が、次の節の send
            です。この章では send や define_method などのメタプログラミングのメソッドを確かめてから、Rails の DSL がそれらでどう作られているかを読みます。
          </p>
        </>
      ),
    },
    {
      id: 'send',
      title: 'send と public_send：名前を指定してメソッドを呼ぶ',
      body: (
        <>
          <p>
            <Term en="metaprogramming">メタプログラミング</Term>は、プログラムの実行中にメソッドを呼び分けたり、メソッドやクラスを作ったりする書き方です。その最も基本的なメソッドが{' '}
            <code>send</code> です。<code>obj.send(:name, 引数)</code> は <code>obj.name(引数)</code> と同じ呼び出しを、メソッド名をシンボルや文字列で指定して行います
            <Ref n={1} />。
          </p>
          <Code
            lang="ruby"
            code={`
class Account
  def balance = 100
  private def secret = "秘密"
end

acc = Account.new
acc.send(:balance)        # => 100
acc.send(:secret)         # => "秘密"（private メソッドも呼べる）
acc.public_send(:secret)
# private method 'secret' called for an instance of Account (NoMethodError)
`}
          />
          <p>
            <code>send</code> は private メソッドも呼べますが、<code>public_send</code> は通常の呼び出しと同じく public メソッドだけを呼びます。外部から受け取った文字列をメソッド名として使う場合は、意図しない
            private メソッドを呼ばないよう <code>public_send</code> を使います。<code>send</code> という名前のメソッドを独自に定義するクラスもあるため、確実に元の動作を使いたい場合は別名の{' '}
            <code>__send__</code> を使います。
          </p>
          <p>
            Rails はシンボルで指定された処理を呼ぶときに <code>send</code> を使います。<code>before_action :set_article</code> の <code>:set_article</code>{' '}
            は、コールバック（アクションの前など、決まった時点で Rails が呼ぶ処理）の実行時に <code>send</code> で呼ばれます。<code>set_article</code> を private にしていても呼べるのはこのためです。
          </p>
        </>
      ),
    },
    {
      id: 'define-method',
      title: 'define_method と文字列の class_eval：メソッドを作る',
      body: (
        <>
          <p>
            <code>define_method(名前) {'{ ブロック }'}</code> は、ブロックを本体とするメソッドを実行時に定義します
            <Ref n={2} />。名前を変数で指定できるので、同じ形のメソッドをまとめて作れます。
          </p>
          <Code
            lang="ruby"
            code={`
class Product
  %w[draft published archived].each do |state|
    define_method("#{state}?") { @state == state }   # state はクロージャとして捕まえる
  end

  def initialize(state) = @state = state
end

pr = Product.new("published")
pr.published?                       # => true
pr.draft?                           # => false
Product.instance_methods(false).sort # => [:archived?, :draft?, :published?]
`}
          />
          <p>
            <code>define_method</code> のブロックはクロージャなので、ループ変数 <code>state</code> を参照できます（<ChapterLink n={4} section="closure" />）。
          </p>
          <h3>Rails が文字列の class_eval を使う理由</h3>
          <p>
            Rails のソースでは、<code>define_method</code> よりも、Ruby のコードを文字列で組み立てて <code>class_eval</code> に渡す書き方がよく出てきます。第1章で見た{' '}
            <code>comments</code> メソッドも、この方法で定義されています。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/associations/builder/association.rb（102〜110行）"
            href={`${GH}/activerecord/lib/active_record/associations/builder/association.rb#L102-L110`}
            code={`
    def self.define_readers(mixin, name)
      mixin.class_eval <<-CODE, __FILE__, __LINE__ + 1
        def #{name}
          association = association(:#{name})
          deprecated_associations_api_guard(association, __method__)
          association.reader
        end
      CODE
    end
`}
          />
          <p>
            <code>&lt;&lt;-CODE</code> 〜 <code>CODE</code> はヒアドキュメント（複数行の文字列）で、<code>#{'{name}'}</code> の部分に関連名が埋め込まれます。<code>name</code>{' '}
            が <code>:comments</code> なら <code>def comments ... end</code> という通常のメソッド定義の文字列になり、それが <code>class_eval</code> で評価されます
            <Ref n={2} />。
          </p>
          <p>この書き方には次の性質があります。</p>
          <ul>
            <li>
              できあがるメソッドは、<code>def</code> で書いたものと同じ通常のメソッドです。ブロックではないので、定義したときのローカル変数を参照し続けることはありません。
            </li>
            <li>
              第2・第3引数の <code>__FILE__, __LINE__ + 1</code> は、評価する文字列を「どのファイルの何行目にあるものとして扱うか」の指定です。第1章で <code>comments</code> の{' '}
              <code>source_location</code> が <code>builder/association.rb</code> の104行目を指していたのは、この指定によるものです。例外が起きたときのバックトレース（例外が起きるまでに通ったメソッドの場所の一覧）にも、この位置が表示されます。
            </li>
          </ul>
          <p>
            一方で、文字列に外部からの入力を埋め込むと任意のコードを実行される危険があるため、埋め込むのはプログラム内で決まる名前（関連名や属性名）に限られます。
          </p>
        </>
      ),
    },
    {
      id: 'method-missing',
      title: 'method_missing と define_method の組み合わせ',
      body: (
        <>
          <p>
            <ChapterLink n={2} section="method-missing" />で説明した <code>method_missing</code> は、存在しないメソッドの呼び出しを受け取る仕組みでした。<code>method_missing</code>{' '}
            による処理は、呼び出しのたびにメソッド探索を最後まで行ってから実行されます。また、<code>respond_to_missing?</code>（method_missing で受け付ける名前を respond_to? に知らせるメソッド）を正しく定義しないと、<code>respond_to?</code>{' '}
            の結果と実際の動作が食い違います。
          </p>
          <p>
            このため Rails では、<code>method_missing</code> を使う場合でも、最初の呼び出しで通常のメソッドを定義し、2回目以降はメソッド探索で見つかるようにする実装がとられています。第2章で見た{' '}
            <code>find_by_title</code>（title 列の値で1件を探すメソッド）がその例でした。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>方法</th>
                  <th>メソッドができる時点</th>
                  <th>Rails での例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>define_method</code>
                  </td>
                  <td>呼び出したとき（名前を変数で指定できる）</td>
                  <td>
                    <code>scope</code>、<code>before_action</code> などの定義
                  </td>
                </tr>
                <tr>
                  <td>文字列の <code>class_eval</code></td>
                  <td>呼び出したとき（通常の def と同じメソッドになる）</td>
                  <td>関連メソッド、<code>class_attribute</code> のアクセサ</td>
                </tr>
                <tr>
                  <td>
                    <code>method_missing</code>
                  </td>
                  <td>存在しない名前で呼ばれたとき（Rails では初回に define して以後は通常のメソッド）</td>
                  <td>
                    <code>find_by_〜</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'class-macro',
      title: 'クラスマクロとクラスのインスタンス変数',
      body: (
        <>
          <p>
            クラス本体で呼び、そのクラスに設定やメソッドを追加するクラスメソッドを、<Term en="class macro">クラスマクロ</Term>と呼びます。<code>attr_accessor</code> や{' '}
            <code>has_many</code>、<code>validates</code>、<code>before_action</code> はすべてクラスマクロです。クラス本体の self はクラスなので（<ChapterLink n={2} section="self" />
            ）、レシーバなしで書けます。
          </p>
          <p>自分でクラスマクロを作ってみます。設定を保存する場所として、クラスのインスタンス変数（クラスというオブジェクトのインスタンス変数）を使います。</p>
          <Code
            lang="ruby"
            code={`
class MiniModel
  def self.validates_presence_of(*names)
    @presence ||= []        # self はクラスなので、クラスのインスタンス変数になる
    @presence.concat(names)
  end

  def self.presence_attributes = @presence
end

class Member < MiniModel
  validates_presence_of :name, :email
end

class Admin < Member; end

Member.presence_attributes # => [:name, :email]
Admin.presence_attributes  # => nil
`}
          />
          <p>
            <code>Admin</code> は <code>Member</code> を継承しているのに、設定が引き継がれていません。クラスのインスタンス変数は「そのクラスというオブジェクト」だけのもので、子クラスは別のオブジェクトだからです。
          </p>
          <p>
            クラス変数（<code>@@presence</code>）を使うと子クラスからも見えますが、今度は子クラスで値を変えると親クラスや兄弟クラスの値も変わってしまいます。Rails のモデルでは「親の設定を引き継ぎつつ、子クラスで変更しても親には影響しない」動作が必要です。そのために作られたのが{' '}
            <code>class_attribute</code> です。
          </p>
        </>
      ),
    },
    {
      id: 'class-attribute',
      title: 'class_attribute：親の値を引き継ぎ子で上書きできる設定',
      body: (
        <>
          <p>
            <code>class_attribute</code> は ActiveSupport のコア拡張（ActiveSupport が Ruby の標準のクラスに足したメソッド）で、親クラスの値を子クラスに引き継ぎ、子クラスで代入したときだけ子クラス専用の値になる属性を定義します
            <Ref n={3} />。
          </p>
          <Code
            lang="ruby"
            title="bundle exec ruby で実行（ActiveSupport 8.1.4.1）"
            code={`
class Base
  class_attribute :settings, default: { timeout: 5 }
end
class Child < Base; end
class Other < Base; end

Child.settings                 # => {timeout: 5}（親の値を引き継ぐ）
Child.settings = Child.settings.merge(timeout: 10)
Child.settings                 # => {timeout: 10}
Base.settings                  # => {timeout: 5}（親は変わらない）
`}
          />
          <h3>実装：特異クラスにメソッドを定義し直す</h3>
          <p>
            Rails 8.1 の <code>class_attribute</code> は、値をインスタンス変数ではなく、特異クラスに定義したメソッドの戻り値として保持します。中心となる <code>ActiveSupport::ClassAttribute.redefine</code>{' '}
            を引用します。
          </p>
          <Code
            lang="ruby"
            title="activesupport/lib/active_support/class_attribute.rb（6〜24行）"
            href={`${GH}/activesupport/lib/active_support/class_attribute.rb#L6-L24`}
            code={`
      def redefine(owner, name, namespaced_name, value)
        if owner.singleton_class?
          if owner.attached_object.is_a?(Module)
            redefine_method(owner, namespaced_name, private: true) { value }
          else
            redefine_method(owner, name) { value }
          end
        end

        redefine_method(owner.singleton_class, namespaced_name, private: true) { value }

        redefine_method(owner.singleton_class, "#{namespaced_name}=", private: true) do |new_value|
          if owner.equal?(self)
            value = new_value
          else
            ::ActiveSupport::ClassAttribute.redefine(self, name, namespaced_name, new_value)
          end
        end
      end
`}
          />
          <p>
            <code>class_attribute :settings</code> を <code>Base</code> で実行したときの動作を、上から順に読みます（<code>owner</code> は <code>Base</code>、<code>namespaced_name</code>{' '}
            は <code>:__class_attr_settings</code>）。
          </p>
          <ol>
            <li>
              <code>Base</code> は特異クラスではないので、最初の <code>if</code> は飛ばします。
            </li>
            <li>
              <code>Base</code> の特異クラスに、private メソッド <code>__class_attr_settings</code> を定義します。本体は <code>{'{ value }'}</code> というブロックなので、引数{' '}
              <code>value</code>（既定値）をクロージャとして返し続けます。
            </li>
            <li>
              同じく <code>__class_attr_settings=</code> を定義します。呼ばれたときの <code>self</code> が <code>Base</code> 自身なら、クロージャの <code>value</code>{' '}
              を書き換えます。<code>self</code> が子クラス（<code>Child</code> など）なら、<code>redefine</code> を子クラスに対して呼び直し、子クラスの特異クラスに専用のメソッドを定義します。
            </li>
          </ol>
          <p>
            公開用の <code>settings</code> と <code>settings=</code> は、<code>class_attribute</code> 本体が文字列の <code>class_eval</code> で定義し、内部で{' '}
            <code>__class_attr_settings</code> を呼びます。読み取りは<ChapterLink n={3} section="class-methods" />で説明した特異クラスのメソッド探索で行われます。<code>Child</code>{' '}
            の特異クラスに定義がなければ、superclass である <code>Base</code> の特異クラスのメソッドが見つかり、親の値が返ります。
          </p>
          <Figure n="5-3" title="class_attribute の値の置き場所" caption="模式図。値は特異クラスに定義されたメソッドのクロージャに保持される。子クラスで代入すると、子クラスの特異クラスにメソッドが追加される。">
            <ClassAttributeFigure />
          </Figure>
          <p>実行して確かめると、代入した子クラス（Child）にメソッドが追加されていることがわかります。</p>
          <Code
            lang="ruby"
            code={`
Base.singleton_class.private_method_defined?(:__class_attr_settings, false)  # => true
Child.singleton_class.private_method_defined?(:__class_attr_settings, false) # => true（代入したので追加された）
`}
          />
          <h3>注意：値そのものの変更が親クラスに与える影響</h3>
          <p>
            <code>class_attribute</code> が子クラスごとに分けるのは「どのオブジェクトを指すか」だけで、指しているハッシュや配列は共有されています。代入せずに中身を変更すると、親クラスの値も変わります。
          </p>
          <Code
            lang="ruby"
            code={`
Other.settings[:timeout] = 99   # 代入ではなく、共有しているハッシュの変更
Base.settings                   # => {timeout: 99}（親の値が変わってしまう）
`}
          />
          <p>
            このため Rails の内部では、<code>class_attribute</code> の値を変えるときに、必ず新しいオブジェクトを作って代入しています。<code>has_many</code> が関連の情報を登録する{' '}
            <code>add_reflection</code> がその例です。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/reflection.rb（23〜27行）"
            href={`${GH}/activerecord/lib/active_record/reflection.rb#L23-L27`}
            code={`
      def add_reflection(ar, name, reflection)
        ar.clear_reflections_cache
        name = name.to_sym
        ar._reflections = ar._reflections.except(name).merge!(name => reflection)
      end
`}
          />
          <p>
            <code>except</code> が新しいハッシュを返すので、<code>merge!</code> はその新しいハッシュを変更します。親クラスのハッシュはそのまま残り、関連を定義したモデルだけが新しいハッシュを持ちます。
          </p>
          <Callout title="インスタンスからの書き込み">
            <p>
              既定では、インスタンスにも <code>settings</code> と <code>settings=</code> が定義されます。インスタンスで <code>obj.settings = …</code>{' '}
              と代入すると、そのインスタンスのインスタンス変数に保存され、クラスの値は変わりません。インスタンスからの書き込みを禁止するには <code>instance_writer: false</code> を指定します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'concern',
      title: 'ActiveSupport::Concern の実装',
      body: (
        <>
          <p>
            <ChapterLink n={3} section="hooks" />で、include するだけでクラスメソッドも追加する定番の書き方（<code>self.included</code> の中で <code>base.extend(ClassMethods)</code>）を見ました。この書き方には、モジュール同士に依存関係があるときに問題があります。たとえば、モジュール
            B が <code>included</code> の中でモジュール A のクラスメソッドを使う場合、B を include するクラスは、先に A も include しておく必要があります
            <Ref n={4} />。
          </p>
          <p>
            <code>ActiveSupport::Concern</code> は、この依存関係の解決と、<code>ClassMethods</code> の extend、<code>included</code> ブロックの実行をまとめて行います。使う側は次のように書きます。
          </p>
          <Code
            lang="ruby"
            title="bundle exec ruby で実行（ActiveSupport 8.1.4.1）"
            code={`
module Taggable
  extend ActiveSupport::Concern

  included do
    puts "included ブロック: self=#{self}"
    attr_accessor :tags
  end

  class_methods do
    def tagged_with(tag) = "#{name}を#{tag}で検索"
  end

  def tag_list = Array(tags).join(", ")
end

module Commentable
  extend ActiveSupport::Concern
  include Taggable              # Concern の中で別の Concern を include する

  included do
    puts "Commentable の included: self=#{self}"
  end
end

class Note
  include Commentable           # Taggable を書かなくてよい
end
# included ブロック: self=Note
# Commentable の included: self=Note

Note.ancestors.take(3)      # => [Note, Commentable, Taggable]
Note.tagged_with("ruby")    # => "Noteをrubyで検索"
Commentable.instance_variable_get(:@_dependencies) # => [Taggable]
`}
          />
          <p>
            <code>Taggable</code> の <code>included</code> ブロックは、<code>Commentable</code> ではなく <code>Note</code> を self として実行されています。<code>Commentable</code>{' '}
            の中に書いた <code>include Taggable</code> は、その場では実行が保留され、<code>@_dependencies</code> に記録されています。
          </p>
          <h3>append_features の上書き</h3>
          <p>
            これを実現しているのが、<code>append_features</code> の上書きです。<ChapterLink n={3} section="hooks" />で見たとおり、<code>include</code> は内部で{' '}
            <code>append_features</code> を呼びます。
          </p>
          <Code
            lang="ruby"
            title="activesupport/lib/active_support/concern.rb（125〜140行）"
            href={`${GH}/activesupport/lib/active_support/concern.rb#L125-L140`}
            code={`
    def self.extended(base) # :nodoc:
      base.instance_variable_set(:@_dependencies, [])
    end

    def append_features(base) # :nodoc:
      if base.instance_variable_defined?(:@_dependencies)
        base.instance_variable_get(:@_dependencies) << self
        false
      else
        return false if base < self
        @_dependencies.each { |dep| base.include(dep) }
        super
        base.extend const_get(:ClassMethods) if const_defined?(:ClassMethods)
        base.class_eval(&@_included_block) if instance_variable_defined?(:@_included_block)
      end
    end
`}
          />
          <ul>
            <li>
              <code>self.extended</code>：モジュールで <code>extend ActiveSupport::Concern</code> を実行すると呼ばれ、そのモジュールに空の <code>@_dependencies</code> を用意します。
            </li>
            <li>
              include した側（<code>base</code>）が <code>@_dependencies</code> を持っている場合、つまり base も Concern である場合は、自分を base の依存先として記録するだけで、
              <code>false</code> を返して実際の組み込みは行いません。
            </li>
            <li>
              base が通常のクラスの場合は、まず記録されている依存先を base に include し（再帰的に同じ処理が起きます）、<code>super</code>（<code>Module#append_features</code>
              ）で自分を ancestors に挿入し、<code>ClassMethods</code> があれば base を extend し、最後に <code>included</code> ブロックを base の <code>class_eval</code>{' '}
              で実行します。
            </li>
          </ul>
          <Figure n="5-4" title="Concern を include したときの処理順" caption="Commentable（Taggable に依存）を Note に include した場合。紫の箱は、そのモジュールの append_features の中で行われる処理。">
            <ConcernFigure />
          </Figure>
          <p>
            依存先の Taggable が先に挿入され、その後に Commentable が挿入されるので、ancestors では Commentable が Note の近くに来ます（後から入れたものほど近い、という include
            の規則どおりです）。
          </p>
          <h3>included と class_methods</h3>
          <p>
            Concern 側の <code>included do ... end</code> は、<code>Module#included</code> フックとは別の使い方です。ブロック付きで引数なしに呼ばれた場合は、ブロックを{' '}
            <code>@_included_block</code> に保存するだけです。<code>class_methods do ... end</code> は、<code>ClassMethods</code> という名前のモジュールを作って（または既存のものを開いて）ブロックを{' '}
            <code>module_eval</code> します。
          </p>
          <Code
            lang="ruby"
            title="activesupport/lib/active_support/concern.rb（209〜215行）"
            href={`${GH}/activesupport/lib/active_support/concern.rb#L209-L215`}
            code={`
    def class_methods(&class_methods_module_definition)
      mod = const_defined?(:ClassMethods, false) ?
        const_get(:ClassMethods) :
        const_set(:ClassMethods, Module.new)

      mod.module_eval(&class_methods_module_definition)
    end
`}
          />
          <p>
            つまり <code>class_methods do ... end</code> は、昔ながらの <code>module ClassMethods ... end</code> を書くのと同じ結果になります。Rails のソースには両方の書き方が混在しています。第1章で{' '}
            <code>has_many</code> の定義元が <code>ActiveRecord::Associations::ClassMethods</code> だったのは、<code>ActiveRecord::Associations</code> が Concern で、その{' '}
            <code>ClassMethods</code> が <code>ActiveRecord::Base</code> に extend されているからです。
          </p>
        </>
      ),
    },
    {
      id: 'callbacks',
      title: 'ActiveSupport::Callbacks の仕組み',
      body: (
        <>
          <p>
            <code>before_action</code> や <code>before_save</code> は、どちらも <code>ActiveSupport::Callbacks</code> を使って実装されています。コントローラーとモデルで別々に作られているのではなく、同じ仕組みを使っています
            <Ref n={5} />。使うのは次の3つのメソッドです。
          </p>
          <ul>
            <li>
              <code>define_callbacks :save</code>：<code>save</code> という名前のコールバックの列（チェーン）を用意します。
            </li>
            <li>
              <code>set_callback :save, :before, :check</code>：チェーンにコールバックを追加します。種類は <code>:before</code>、<code>:after</code>、<code>:around</code> の3つです。
            </li>
            <li>
              <code>run_callbacks(:save) {'{ 本体 }'}</code>：チェーンのコールバックと本体を、決められた順に実行します。
            </li>
          </ul>
          <Code
            lang="ruby"
            title="bundle exec ruby で実行（ActiveSupport 8.1.4.1）"
            code={`
class Document
  include ActiveSupport::Callbacks
  define_callbacks :save

  set_callback :save, :before, :check
  set_callback :save, :after,  -> { puts "  after(1)" }
  set_callback :save, :after,  -> { puts "  after(2)" }
  set_callback :save, :around, :timing

  def save
    run_callbacks(:save) { puts "  本体の保存"; :saved }
  end

  def check = puts("  before: check")

  def timing
    puts "  around: 前"
    yield               # ここで、この around より後に定義したものと本体が実行される
    puts "  around: 後"
  end
end

Document.new.save
#   before: check
#   around: 前
#   本体の保存
#   around: 後
#   after(2)
#   after(1)
# => :saved
`}
          />
          <h3>実行順の規則</h3>
          <p>
            Rails のドキュメントでは「before と around は定義した順に呼ばれ、after は定義と逆の順に呼ばれる」とされています
            <Ref n={5} />。around と before・after が混ざる場合は、「around は、それより後に定義したコールバックと本体を包む」と考えると実行順を説明できます。around
            を先頭に置いた例で確かめます。
          </p>
          <Code
            lang="ruby"
            code={`
set_callback :save, :around, ->(_, blk) { puts "around1 前"; blk.call; puts "around1 後" }
set_callback :save, :before, -> { puts "before A" }
set_callback :save, :after,  -> { puts "after A" }
set_callback :save, :around, ->(_, blk) { puts "around2 前"; blk.call; puts "around2 後" }
set_callback :save, :before, -> { puts "before B" }
set_callback :save, :after,  -> { puts "after B" }
# run_callbacks(:save) { puts "本体" } の出力:
# around1 前 / before A / around2 前 / before B / 本体 / after B / around2 後 / after A / around1 後
`}
          />
          <Figure n="5-5" title="コールバックの定義順と実行の入れ子" caption="Rails 8.1.4.1 で実行した結果を図にしたもの。around は自分より後に定義したコールバックと本体を包み、after は包んでいる範囲の終わりに実行される。">
            <CallbackNestingFigure />
          </Figure>
          <h3>チェーンの保存場所</h3>
          <p>
            コールバックのチェーンは、<code>class_attribute</code> で定義された <code>__callbacks</code> というハッシュに、コールバック名をキーにして保存されます。
          </p>
          <Code
            lang="ruby"
            title="activesupport/lib/active_support/callbacks.rb（66〜71行）"
            href={`${GH}/activesupport/lib/active_support/callbacks.rb#L66-L71`}
            code={`
    extend Concern

    included do
      extend ActiveSupport::DescendantsTracker
      class_attribute :__callbacks, instance_writer: false, instance_predicate: false, default: {}
    end
`}
          />
          <p>
            <code>ActiveSupport::Callbacks</code> 自身も Concern で、include したクラスに <code>__callbacks</code> を用意します。<code>set_callback</code>{' '}
            は、チェーンを複製してからコールバックを追加し、そのクラスと子孫クラスのそれぞれに設定し直します。<code>class_attribute</code>{' '}
            の性質により、子クラスで追加したコールバックは親クラスに影響しません。また <code>define_callbacks :save</code> は、<code>_run_save_callbacks</code>{' '}
            などのメソッドを文字列の <code>module_eval</code> で定義します。
          </p>
          <h3>中断</h3>
          <p>
            before コールバックで <code>throw :abort</code> を実行すると、チェーンが中断され、本体は実行されません。<code>run_callbacks</code> は <code>false</code> を返します。中断の判定方法は{' '}
            <code>define_callbacks</code> の <code>terminator</code> オプションで変えられます
            <Ref n={5} />。
          </p>
          <Code
            lang="ruby"
            code={`
class HaltDoc < Document
  set_callback :save, :before, -> { throw :abort }, prepend: true   # チェーンの先頭に追加
end

HaltDoc.new.save
#   after(2)
#   after(1)
# => false
`}
          />
          <p>
            本体も around も実行されていませんが、after コールバックは実行されています。既定では、中断しても after コールバックは実行されます。この動作は{' '}
            <code>define_callbacks</code> の <code>skip_after_callbacks_if_terminated: true</code> で変えられ、コントローラーの <code>process_action</code>{' '}
            のチェーンはこの指定をしています（次の節）。
          </p>
        </>
      ),
    },
    {
      id: 'rails-dsl',
      title: 'before_action と has_many が行っていること',
      body: (
        <>
          <p>この章で説明した send・define_method・Concern・Callbacks・class_attribute を使って、Rails の代表的な2つのクラスマクロが何をしているかを読みます。</p>
          <h3>before_action</h3>
          <p>
            <code>AbstractController::Callbacks</code> は Concern で、include されたクラスに <code>process_action</code> という名前のチェーンを定義します。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/abstract_controller/callbacks.rb（34〜39行）"
            href={`${GH}/actionpack/lib/abstract_controller/callbacks.rb#L34-L39`}
            code={`
    included do
      define_callbacks :process_action,
                       terminator: ->(controller, result_lambda) { result_lambda.call; controller.performed? },
                       skip_after_callbacks_if_terminated: true
      mattr_accessor :raise_on_missing_callback_actions, default: false
    end
`}
          />
          <p>
            <code>terminator</code> は「before コールバックを実行した後、<code>performed?</code>（レスポンスがすでに作られたか）が真なら中断する」という判定です。before_action の中で{' '}
            <code>redirect_to</code> や <code>render</code> を呼ぶとアクションが実行されないのは、この判定によるものです。<code>skip_after_callbacks_if_terminated: true</code>{' '}
            により、中断したときは after_action も実行されません。
          </p>
          <p>
            <code>before_action</code> 自体は、<code>ClassMethods</code> の中で <code>define_method</code> を使って定義されています。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/abstract_controller/callbacks.rb（232〜237行）"
            href={`${GH}/actionpack/lib/abstract_controller/callbacks.rb#L232-L237`}
            code={`
      [:before, :after, :around].each do |callback|
        define_method "#{callback}_action" do |*names, &blk|
          _insert_callbacks(names, blk) do |name, options|
            set_callback(:process_action, callback, name, options)
          end
        end
`}
          />
          <p>
            <code>before_action :set_article, only: %i[show edit]</code> は、<code>_insert_callbacks</code> で <code>only:</code> を <code>if:</code>{' '}
            の条件（アクション名を照合するオブジェクト）に変換したうえで、<code>set_callback(:process_action, :before, :set_article, if: [...])</code> を呼びます。そして第1章の図1-6 で5番目にあった{' '}
            <code>AbstractController::Callbacks#process_action</code> が、このチェーンを実行します。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/abstract_controller/callbacks.rb（265〜269行）"
            href={`${GH}/actionpack/lib/abstract_controller/callbacks.rb#L265-L269`}
            code={`
      def process_action(...)
        run_callbacks(:process_action) do
          super
        end
      end
`}
          />
          <p>
            <code>run_callbacks</code> のブロックの中の <code>super</code> が、ancestors で次にある <code>ActionController::Rendering#process_action</code>{' '}
            を経て、最終的にアクションを呼びます。before_action は「アクションを本体とするコールバックチェーン」の before コールバックです。
          </p>
          <h3>has_many</h3>
          <p>
            <code>has_many</code> は、第1章の最後に引用したとおり、<code>Builder::HasMany.build</code> と <code>Reflection.add_reflection</code> の2つを呼ぶだけのメソッドです。Reflection は関連の名前や相手のクラス、外部キーの列名などの情報を持つオブジェクトです。<code>build</code>{' '}
            の中身は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/associations/builder/association.rb（25〜38行）"
            href={`${GH}/activerecord/lib/active_record/associations/builder/association.rb#L25-L38`}
            code={`
    def self.build(model, name, scope, options, &block)
      if model.dangerous_attribute_method?(name)
        raise ArgumentError, "You tried to define an association named #{name} on the model #{model.name}, but " \\
                             "this will conflict with a method #{name} already defined by Active Record. " \\
                             "Please choose a different association name."
      end

      reflection = create_reflection(model, name, scope, options, &block)
      define_accessors(model, reflection)
      define_callbacks(model, reflection)
      define_validations(model, reflection)
      define_change_tracking_methods(model, reflection)
      reflection
    end
`}
          />
          <p>
            <code>define_accessors</code> は、関連メソッドを <code>model.generated_association_methods</code> が返すモジュールに定義します。このモジュールは、初めて必要になったときに作られ、モデルに
            include されます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/core.rb（337〜344行）"
            href={`${GH}/activerecord/lib/active_record/core.rb#L337-L344`}
            code={`
      def generated_association_methods # :nodoc:
        @generated_association_methods ||= begin
          mod = const_set(:GeneratedAssociationMethods, Module.new)
          private_constant :GeneratedAssociationMethods
          include mod

          mod
        end
      end
`}
          />
          <Figure n="5-6" title="has_many :comments が行うこと" caption="Rails 8.1.4.1 の has_many と Builder::Association.build を読んでまとめた図。">
            <HasManyFigure />
          </Figure>
          <p>
            実際に作られたメソッドを調べると、<code>comments</code> と <code>comments=</code> のほかに、コレクションの関連で追加される <code>comment_ids</code> と{' '}
            <code>comment_ids=</code> があります。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行"
            code={`
Article.const_get(:GeneratedAssociationMethods).instance_methods(false).sort
# => [:comment_ids, :comment_ids=, :comments, :comments=]
`}
          />
          <p>
            関連メソッドがクラス自身ではなく include されたモジュールに定義されるので、モデルで同じ名前のメソッドを定義して <code>super</code>{' '}
            で元の処理を呼べます（第3章の include の規則）。また、作られた Reflection は <code>class_attribute</code> の <code>_reflections</code>{' '}
            に新しいハッシュとして登録されるので、親クラスや別のモデルには影響しません。Reflection がどのように使われて SQL になるかは<ChapterLink n={13} />で説明します。
          </p>
          <Callout kind="v72">
            <p>
              <code>define_readers</code>・<code>define_writers</code> が生成するメソッドの中の <code>deprecated_associations_api_guard</code> と、関連の <code>deprecated:</code> オプションは Rails 8.1 で追加されたもので、Rails 7.2
              の関連メソッドにはこの呼び出しはありません
              <Ref n={7} />。関連メソッドを生成済みモジュールに定義する構造そのものは 7.2 でも同じです。
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
            Article の title や comments は、Rails が作って Article に include したモジュールに定義されています。has_many や attribute を実行すると、その時点でメソッドができます。実行中にメソッドを作ったり、名前でメソッドを呼んだりする書き方をメタプログラミングと呼びます。
          </li>
          <li>
            Rails の DSL は Ruby のメソッド呼び出しで、読み込むときに実行されて情報を登録します。validates はバリデーターを、before_action はコールバックを登録し、Rails が後で使います。
          </li>
          <li>
            <code>send</code> は private メソッドも呼べ、<code>public_send</code> は public メソッドだけを呼びます。シンボルで指定したコールバックは <code>send</code> で呼ばれます。
          </li>
          <li>
            Rails は文字列の <code>class_eval</code> で通常のメソッドを生成し、<code>__FILE__, __LINE__</code> で定義位置を記録します。
          </li>
          <li>
            クラスのインスタンス変数は子クラスに引き継がれません。<code>class_attribute</code>{' '}
            は特異クラスのメソッドとクロージャで値を持ち、子クラスで代入したときだけ子クラス専用の値になります。中身の変更は親にも影響するので、新しいオブジェクトを代入します。
          </li>
          <li>
            <code>ActiveSupport::Concern</code> は <code>append_features</code> を上書きし、依存先の include、<code>ClassMethods</code> の extend、<code>included</code>{' '}
            ブロックの実行をまとめて行います。
          </li>
          <li>
            <code>ActiveSupport::Callbacks</code> は before と around を定義順に、after を逆順に実行し、around は後に定義したものを包みます。<code>throw :abort</code> で中断できます。
          </li>
          <li>
            <code>before_action</code> は <code>process_action</code> チェーンへの <code>set_callback</code> です。<code>has_many</code> は Reflection を作り、関連メソッドを生成済みモジュールに定義し、
            <code>_reflections</code> に登録します。
          </li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'class Object（send、public_send）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Object.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'send と public_send の違い、__send__。' },
    { title: 'class Module（define_method、class_eval）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Module.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'define_method、文字列を受け取る class_eval とファイル名・行番号の引数。' },
    { title: 'Active Support Core Extensions（Class Attributes）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_support_core_extensions.html#class-attributes', accessed: '2026-11-11', version: 'Rails 8.1', note: 'class_attribute の継承と上書き、instance_writer などのオプション。' },
    { title: 'ActiveSupport::Concern', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1.4.1/classes/ActiveSupport/Concern.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Concern が解決する依存関係の問題、included と class_methods。' },
    { title: 'ActiveSupport::Callbacks', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1.4.1/classes/ActiveSupport/Callbacks.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'define_callbacks・set_callback・run_callbacks、before/around と after の実行順、terminator、skip_after_callbacks_if_terminated。' },
    { title: 'activesupport/lib/active_support/class_attribute.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/class_attribute.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'class_attribute の値を特異クラスのメソッドとして保持する実装。' },
    { title: 'Ruby on Rails 8.1 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/8_1_release_notes.html', accessed: '2026-11-11', version: 'Rails 8.1', note: '関連の deprecated オプションなど 8.1 の変更点。' },
    { title: 'activesupport/lib/active_support/concern.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/concern.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'append_features・included・class_methods の実装。' },
    { title: 'actionpack/lib/abstract_controller/callbacks.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/abstract_controller/callbacks.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'process_action チェーンの定義、before_action の定義、process_action の上書き。' },
    { title: 'Active Record Associations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/association_basics.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'belongs_to・has_many などを宣言するとクラスにメソッドが加わること、belongs_to が既定で関連先の存在を検査すること。メソッドの数はデモのアプリで実測。' },
    { title: 'ActiveRecord::Attributes::ClassMethods（attribute）', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1.4.1/classes/ActiveRecord/Attributes/ClassMethods.html', accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'attribute が型を指定して属性を定義すること。' },
    { title: 'DomainSpecificLanguage', publisher: 'martinfowler.com', url: 'https://martinfowler.com/bliki/DomainSpecificLanguage.html', accessed: '2026-11-16', note: 'DSL は特定の種類の問題に向けたコンピューター言語であること。' },
    { title: 'Rails Routing from the Outside In', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/routing.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'routes.draw のブロックをルーターの DSL と呼んでいること。' },
    { title: 'Active Record Migrations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_record_migrations.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'マイグレーションがテーブルの変更を Ruby の DSL で書くものであること。' },
    { title: 'actionpack/lib/action_controller/metal/allow_browser.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/allow_browser.rb#L57-L59`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'allow_browser が before_action を呼んで処理を登録する実装。登録されたコールバックの一覧はデモのアプリで実測。' },
  ],
}

export default withExplanations(ch05, explanation05)
