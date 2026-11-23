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
      {/* 文字の下を背景色で塗り、Commentable の縦の破線が文字に重ならないようにする */}
      <rect x={(N + G) / 2 - 140} y={187} width={280} height={18} fill="var(--fig-bg)" />
      <T x={(N + G) / 2} y={196} fs={11.5} anchor="middle">
        ④ Note.extend(Taggable::ClassMethods)
      </T>
      <Arrow x1={G} y1={254} x2={N + 2} y2={254} />
      <rect x={(N + G) / 2 - 160} y={233} width={320} height={18} fill="var(--fig-bg)" />
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

/* ---------- 図（番号なし）クラスのインスタンス変数とクラス変数の保存場所 ---------- */
function ClassVariableFigure() {
  return (
    <Svg
      id="ch05-class-vars"
      w={780}
      h={250}
      label="左はクラスのインスタンス変数で書いた場合。Member で validates_presence_of :name, :email を呼ぶと、concat で Member の @presence に [:name, :email] が入る。Member を継承した Admin は何も呼んでいないので、Admin の @presence は無く、Admin.presence_attributes は nil を返す。右はクラス変数で書いた場合。MiniModel を継承した Member と Product がそれぞれ validates_presence_of を呼ぶと、どちらも MiniModel と子クラスで1つの @@presence に concat するので、Member と Product の presence_attributes はどちらも [:name, :email, :price] を返す"
    >
      <line x1={390} y1={8} x2={390} y2={242} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={20} y={18} fs={12} tone="muted">
        クラスのインスタンス変数（@presence）
      </T>
      <Box x={20} y={34} w={170} h={62} lines={['Member < MiniModel', 'validates_presence_of', ':name, :email']} mono fs={12} bold />
      <Box x={200} y={34} w={170} h={62} lines={['Admin < Member', '（何も呼んでいない）']} mono fs={12} bold />
      <Arrow x1={105} y1={96} x2={105} y2={136} />
      <T x={113} y={116} fs={11.5} tone="muted" mono>
        concat
      </T>
      <Box x={20} y={138} w={170} h={50} lines={['Member の @presence', '[:name, :email]']} mono fs={12} fill="box4" />
      <Box x={200} y={138} w={170} h={50} lines={['Admin の @presence', '（無い）']} mono fs={12} fill="bg" dashed />
      <T x={20} y={212} fs={11.5} mono>
        Member.presence_attributes → [:name, :email]
      </T>
      <T x={20} y={232} fs={11.5} mono>
        Admin.presence_attributes → nil
      </T>

      <T x={410} y={18} fs={12} tone="muted">
        クラス変数（@@presence）
      </T>
      <Box x={410} y={34} w={170} h={62} lines={['Member < MiniModel', 'validates_presence_of', ':name, :email']} mono fs={12} bold />
      <Box x={590} y={34} w={170} h={62} lines={['Product < MiniModel', 'validates_presence_of', ':price']} mono fs={12} bold />
      <Arrow x1={495} y1={96} x2={495} y2={136} />
      <T x={503} y={116} fs={11.5} tone="muted" mono>
        concat
      </T>
      <Arrow x1={675} y1={96} x2={675} y2={136} />
      <T x={683} y={116} fs={11.5} tone="muted" mono>
        concat
      </T>
      <Box x={410} y={138} w={350} h={50} lines={['@@presence（MiniModel と子クラスで1つ）', '[:name, :email, :price]']} mono fs={12} fill="box4" accent />
      <T x={410} y={212} fs={11.5}>
        Member と Product の presence_attributes
      </T>
      <T x={410} y={232} fs={11.5} mono>
        → どちらも [:name, :email, :price]
      </T>
    </Svg>
  )
}

/* ---------- 図（番号なし）before_action を読み込むときと要求が届いたときの処理 ---------- */
function BeforeActionFlowFigure() {
  const LX = 20
  const LW = 240
  const RX = 290
  const RW = 270
  return (
    <Svg
      id="ch05-before-action"
      w={780}
      h={450}
      label="before_action :set_article, only: %i[show edit] が、クラスを読み込むときと要求が届いたときに行う処理。読み込むときは、define_method で定義されたクラスメソッドの before_action が、_insert_callbacks で only: を if: の条件に変換し、set_callback(:process_action, :before, :set_article, if: [...]) を呼ぶ。set_callback は class_attribute の __callbacks[:process_action] のチェーンを複製してコールバックを追加する。show の要求が届いたときは、AbstractController::Callbacks#process_action が run_callbacks(:process_action) を呼び、このチェーンの before コールバックを順に実行する。:set_article は send で呼ばれる。1つ実行するごとに performed? を調べ、真なら中断して、次の before コールバック、show アクション、after コールバックを実行しない。すべて偽なら、ブロックの中の super で次の process_action（ActionController::Rendering）に進み、show アクションを実行してから after コールバックを実行する"
    >
      <T x={LX} y={18} fs={12} tone="muted">
        クラスを読み込むとき
      </T>
      <Box x={LX} y={32} w={LW} h={44} lines={['before_action :set_article,', '  only: %i[show edit]']} mono fs={11.5} fill="bg" align="start" />
      <Arrow x1={LX + LW / 2} y1={76} x2={LX + LW / 2} y2={94} />
      <Box x={LX} y={96} w={LW} h={44} lines={['before_action', 'define_method で定義したメソッド']} fs={12} bold />
      <Arrow x1={LX + LW / 2} y1={140} x2={LX + LW / 2} y2={158} />
      <Box x={LX} y={160} w={LW} h={44} lines={['_insert_callbacks', 'only: を if: の条件に変換']} fs={12} bold />
      <Arrow x1={LX + LW / 2} y1={204} x2={LX + LW / 2} y2={222} />
      <Box x={LX} y={224} w={LW} h={62} lines={['set_callback(', '  :process_action, :before,', '  :set_article, if: [...])']} mono fs={11.5} align="start" />
      <Arrow x1={LX + LW / 2} y1={286} x2={LX + LW / 2} y2={304} />
      <Box x={LX} y={306} w={LW} h={62} lines={['__callbacks[:process_action]', 'チェーンを複製して追加', '（class_attribute）']} mono fs={11.5} fill="box4" />

      <T x={RX} y={18} fs={12} tone="muted">
        要求が届いたとき（show の場合）
      </T>
      <Box x={RX} y={32} w={RW} h={44} lines={['AbstractController::Callbacks', '#process_action(...)']} mono fs={12} />
      <Arrow x1={RX + RW / 2} y1={76} x2={RX + RW / 2} y2={94} />
      <Box x={RX} y={96} w={RW} h={62} lines={['run_callbacks(:process_action) do', '  super', 'end']} mono fs={11.5} align="start" />
      <Arrow x1={RX + RW / 2} y1={158} x2={RX + RW / 2} y2={176} />
      <Box x={RX} y={178} w={RW} h={66} lines={['before コールバックを順に実行', ':set_article は send で呼ぶ', '1つごとに performed? を調べる']} fs={12} />
      <Arrow x1={RX + RW / 2} y1={244} x2={RX + RW / 2} y2={272} />
      <T x={RX + RW / 2 + 8} y={258} fs={11.5} tone="muted">
        すべて偽
      </T>
      <Box x={RX} y={274} w={RW} h={44} lines={['super で次の process_action へ', '（ActionController::Rendering）']} fs={12} />
      <Arrow x1={RX + RW / 2} y1={318} x2={RX + RW / 2} y2={336} />
      <Box x={RX} y={338} w={RW} h={36} lines="show アクション" fs={12.5} fill="box5" accent />
      <Arrow x1={RX + RW / 2} y1={374} x2={RX + RW / 2} y2={392} />
      <Box x={RX} y={394} w={RW} h={36} lines="after コールバック（after_action）" fs={12} />

      <Arrow x1={RX + RW} y1={211} x2={588} y2={211} />
      <T x={574} y={200} fs={12} anchor="middle">
        真
      </T>
      <Box x={590} y={163} w={170} h={96} lines={['中断する', '次の before コールバック、', 'show アクション、', 'after コールバックは', '実行しない']} fs={12} bold fill="bg" />

      <Arrow d={`M${RX},127 H275 V337 H${LX + LW + 2}`} dashed />
    </Svg>
  )
}

const ch05: Chapter = {
  number: 5,
  part: 1,
  title: 'メタプログラミングと Rails の DSL',
  summary:
    'Article に comments というメソッドを書いていなくても、has_many :comments と宣言すれば記事のコメントを読めます。この宣言を実行する時点と、記事に対してメソッドを呼ぶ時点を分けて Rails のコードを追います。',
  goals: [
    'モデルに直接書かれていないメソッドの定義元を調べられる',
    'メソッドの名前を値として渡し、呼び出したり新しく定義したりする Ruby のコードを読める',
    'has_many や before_action がクラスに登録する情報と、その情報を使うタイミングを説明できる',
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
          <p>この実行例で使ったメソッドは次のとおりです。</p>
          <ul>
            <li>
              <code>Article.instance_method(:title)</code> は、Article のインスタンスで呼べる title をメソッドのオブジェクトとして取り出します。<code>owner</code>{' '}
              はそのメソッドが定義されているクラスかモジュールを、<code>source_location</code> は定義が書かれたファイルと行番号を返します。
            </li>
            <li>
              <code>const_get(:GeneratedAssociationMethods)</code> は、名前を指定して定数（ここではモジュール）を取り出します。この2つのモジュールは、Rails が <code>private_constant</code>{' '}
              で Article の外から参照できない定数にしています。<code>Article::GeneratedAssociationMethods</code> と直接書くと NameError になりますが、const_get では取り出せます。
            </li>
            <li>
              <code>instance_methods(false)</code> は、そのモジュール自身に定義されたインスタンスメソッドの名前を配列で返します。false を渡さないと、include
              したモジュールのメソッドも含みます。<code>size</code> でその個数を数えています。
            </li>
            <li>
              <code>grep(/\Atitle/)</code> は、名前が title で始まるものだけを残します。
            </li>
          </ul>
          <p>
            title は Article::GeneratedAttributeMethods、comments は Article::GeneratedAssociationMethods というモジュールに定義されていました。どちらも Rails が Article のために作り、Article に include
            したモジュールです（<ChapterLink n={3} section="module-include" />
            ）。comments と draft? の source_location は、アプリのファイルではなく、ActiveRecord の gem の中の association.rb と enum.rb を指しています。Rails のコードが実行されて、Article
            のためにこれらのメソッドを作ったということです。エディターで <code>def title</code> や <code>def comments</code> を検索しても定義が見つからないときは、このように owner と source_location
            で定義元を調べられます。
          </p>
          <p>
            2つのモジュールのメソッドを数えると、関連のメソッドが37個、属性のメソッドが287個ありました。title だけでも、値を書き込む title= や、値が変更されたかを返す title_changed? など16個あります（図
            5-1）。has_many などの関連が作るメソッドは Rails のガイドに一覧があります
            <Ref n={10} />。
          </p>
          <p>
            図 5-1 の左は Article の宣言と articles テーブルの列、右は Rails が作ったメソッドの置き場所です。矢印は、どの宣言からどこにメソッドが作られたかを示します。右の上から3つ目の{' '}
            <code>#&lt;Class:Article&gt;</code> は Article の特異クラスで、<code>Article.recent</code> のようなクラスメソッドが定義される場所です（
            <ChapterLink n={3} section="class-methods" />
            ）。<code>enum :status</code> は、draft? などのインスタンスメソッドを名前の無いモジュールに作り、draft や published などのクラスメソッドも作っています。
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
            出力の1〜3行目が has_many、4〜7行目が attribute を確かめた結果です。<code>method_defined?</code> はインスタンスメソッドが定義されているかを返します。has_many :comments を実行する前は comments は無く、実行した後は comments、comments=、comment_ids、comment_ids=
            の4つができました。<code>foreign_key: :article_id</code> は comments テーブルで記事を指す列の名前を指定するオプションです。クラスの名前が Article05 なので、指定しなければ article05_id
            という列を探します。<code>attribute</code> は型を指定して属性を定義するメソッドで
            <Ref n={11} />
            、実行した後はテーブルに無い memo を読み書きできるようになりました。<code>respond_to?</code> は、そのオブジェクトでその名前のメソッドを呼べるかを返します。attribute
            を実行する前は false、実行した後は true でした。
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
            実行したコードの1行目の <code>Comment.validators</code> は、Comment に登録されたバリデーター（検査をするオブジェクト）の配列を返します。それぞれについて、クラス名と、検査の対象の属性（
            <code>v.attributes</code>）を表示しました。<code>demodulize</code> は ActiveSupport が文字列に足したメソッドで、モジュール名を含むクラス名から、最後の <code>::</code>{' '}
            より後ろだけを取り出します。出力の1行目がその結果です。
          </p>
          <p>
            コードの3行目からは、ArticlesController に登録されたコールバックを1つずつ表示しています。<code>c.kind</code> は :before、:after、:around
            のどれかで、アクションの前、後、前後のどこで実行するかを表します。<code>c.filter</code> は登録された処理です。メソッドの名前で登録した場合はシンボルが、ブロックや lambda で登録した場合は
            Proc（ブロックをオブジェクトにしたもの。
            <ChapterLink n={4} section="block-to-proc" />
            ）が入っています。Proc にはメソッドのような名前が無いので、代わりに source_location で、そのブロックが書かれたファイル名と行番号を表示しました。出力の2行目から後が、チェーンに並んでいる順のコールバックです。
          </p>
          <p>
            デモの Comment モデルには <code>belongs_to :article</code> と <code>validates :body, presence: true</code> が書いてあります。validators の結果から、body
            の値が空でないことを検査する PresenceValidator が登録されていることが分かります。belongs_to も、記事が指定されていることを検査する PresenceValidator を登録していました
            <Ref n={10} />。
          </p>
          <p>
            <code>_process_action_callbacks</code> は、アクションの前後に実行する処理の列を返す、Rails の内部向けのメソッドです。名前の中の process_action は、コントローラーがアクションを実行するときに通るメソッドの名前です（
            <ChapterLink n={1} section="find-source" />
            ）。ArticlesController には7つが登録されていました。最後の articles_controller.rb の2行目は、ArticlesController に書いた before_action のブロックです。その1つ前の allow_browser.rb の58行目は、ApplicationController
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
            1行目の引数はすべてキーワード引数です。<code>versions:</code> は許可するブラウザーの指定、<code>block:</code> は断るときに実行する処理で、block: を指定しなければ{' '}
            <code>-&gt; {'{ render … }'}</code> の lambda が使われます。この lambda は public/406-unsupported-browser.html を HTTP のステータスコード 406 で返します。<code>**options</code>{' '}
            は残りのキーワード引数をハッシュで受け取ります（
            <ChapterLink n={2} section="rails-syntax" />
            ）。
          </p>
          <p>
            2行目は、lambda と options を before_action に渡しています。allow_browser に <code>only: :show</code> のようなオプションを書くと、options を通って before_action に届きます。lambda
            の中で呼んでいる allow_browser は、同じ名前の別のメソッドです。コントローラーのインスタンスに定義された private メソッドで、要求を送ってきたブラウザーを調べ、許可していないブラウザーなら block
            を実行します。先ほどの出力の allow_browser.rb:58 は、この2行目の lambda が書かれた行を指しています。
          </p>
          <p>
            登録された検査は valid? や save のときに、before_action の処理はアクションを実行する前に、Rails が呼び出します（図 5-2）。DSL の1行を読むときは、その宣言が何を登録し、登録したものがいつ使われるかを確かめます。書いた覚えのない処理がアクションの前に動いているときは、この節のように{' '}
            <code>_process_action_callbacks</code> を表示すると、親のコントローラーや gem が登録したものも含めて一覧できます。
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
            <code>def balance = 100</code> は、本体が1つの式のメソッドを1行で書く書き方です。<code>private def secret …</code> と書くと、そのメソッドだけが private になります。最後の2行は、public_send
            で secret を呼ぶと NoMethodError になることを示しています。
          </p>
          <p>
            <code>send</code> は private メソッドも呼べますが、<code>public_send</code> は通常の呼び出しと同じく public メソッドだけを呼びます。外部から受け取った文字列をメソッド名として使う場合は、意図しない
            private メソッドを呼ばないよう <code>public_send</code> を使います。<code>send</code> という名前のメソッドを独自に定義するクラスもあるため、確実に元の動作を使いたい場合は別名の{' '}
            <code>__send__</code> を使います。
          </p>
          <p>
            public_send を使っても、public なメソッドはどれでも呼べます。外部から受け取った値をメソッド名にするときは、呼んでよい名前の一覧を用意して、そこに含まれる名前だけを呼びます。次の例の Memo
            は、Rails を使わない小さなクラスです。
          </p>
          <Code
            lang="ruby"
            title="allowed_names.rb（Ruby 4.0.9 で実行）"
            code={`
class Memo
  attr_reader :title, :body
  def initialize(title, body)
    @title = title
    @body = body
  end
  def destroy = "削除した"
end

memo = Memo.new("題名", "本文")
name = "destroy"            # 画面から送られてきた値だとする
memo.public_send(name)      # => "削除した"（public なので呼べてしまう）

ALLOWED = %w[title body]
ALLOWED.include?(name) ? memo.public_send(name) : nil   # => nil
name = "title"
ALLOWED.include?(name) ? memo.public_send(name) : nil   # => "題名"
`}
          />
          <p>
            destroy は public なので、public_send でも呼べました。ALLOWED に含まれるかを先に調べると、destroy は呼ばれず、title は呼ばれます。レビューで{' '}
            <code>send(params[:…])</code> や <code>public_send(params[:…])</code> のように、要求のパラメーターをメソッド名にしているコードを見つけたら、渡せる名前を限定しているかを確かめます。
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
            <code>%w[…]</code> は文字列の配列を作る書き方です（
            <ChapterLink n={2} section="rails-syntax" />
            ）。each のブロックは draft、published、archived の順に3回実行され、そのたびに define_method が <code>draft?</code>、<code>published?</code>、<code>archived?</code>{' '}
            という名前のメソッドを Product に定義します。最後の行の instance_methods の結果に、その3つが並んでいます。
          </p>
          <p>
            define_method に渡したブロックは、定義したときには実行されず、<code>pr.published?</code> のようにメソッドを呼んだときに実行されます。そのときの self は pr なので、<code>@state</code>{' '}
            は pr のインスタンス変数です。
          </p>
          <p>
            <code>define_method</code> のブロックはクロージャなので、ループ変数 <code>state</code> を参照できます（<ChapterLink n={4} section="closure" />）。published? の本体が参照する state は
            "published" なので、<code>@state == state</code> は、このインスタンスの状態が published かどうかを返します。
          </p>
          <h3>Rails が文字列の class_eval を使う理由</h3>
          <p>
            Rails のソースでは、<code>define_method</code> よりも、Ruby のコードを文字列で組み立てて <code>class_eval</code> に渡す書き方がよく出てきます。第1章で見た{' '}
            <code>comments</code> メソッドも、この方法で定義されています。次に引用するのは、関連を読むメソッド（comments など）を定義する <code>define_readers</code>{' '}
            です。メソッドの本体をどう組み立て、どこに定義しているかを読みます。引数の <code>mixin</code> は関連メソッドを置くモジュール（Article の場合は
            Article::GeneratedAssociationMethods）、<code>name</code> は関連の名前です。
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
            <Ref n={2} />。ヒアドキュメントを始める <code>&lt;&lt;-CODE</code> の後ろには、同じ行に残りの引数を続けて書けます。文字列の中身は、次の行から <code>CODE</code> だけの行の前までです。
          </p>
          <Code
            lang="ruby"
            title="name が :comments のときに class_eval に渡る文字列"
            code={`
def comments
  association = association(:comments)
  deprecated_associations_api_guard(association, __method__)
  association.reader
end
`}
          />
          <p>
            <code>mixin.class_eval(文字列)</code> は、その文字列を mixin の本体に書いたコードとして実行します。def が実行されるので、mixin に comments
            というインスタンスメソッドができます。self とメソッドの定義先は、ブロックを渡す class_eval と同じです（
            <ChapterLink n={4} section="self-switch" />
            ）。
          </p>
          <p>
            できたメソッドの本体は3行です。1行目の <code>association(:comments)</code> は、このレコードの comments の関連を扱うオブジェクトを取り出します。2行目は Rails 8.1 で加わった呼び出しで、
            <code>deprecated:</code> オプションを付けた関連のメソッドが使われたことを報告します。引数の <code>__method__</code> は実行中のメソッドの名前で、ここでは :comments です。3行目の{' '}
            <code>association.reader</code> が関連先のレコードを読み、その結果が comments の戻り値になります。
          </p>
          <p>この書き方には次の性質があります。</p>
          <ul>
            <li>
              できあがるメソッドは、<code>def</code> で書いたものと同じ通常のメソッドです。ブロックではないので、定義したときのローカル変数を参照し続けることはありません。
            </li>
            <li>
              第2・第3引数の <code>__FILE__, __LINE__ + 1</code> は、評価する文字列を「どのファイルの何行目にあるものとして扱うか」の指定です。<code>__FILE__</code>{' '}
              はこのコードが書かれているファイルのパスを、<code>__LINE__</code> は書かれている行の番号を返します。class_eval の行は association.rb の103行目で、文字列の最初の行の def
              はその次の行にあるので、1を足して104行目としています。第1章で <code>comments</code> の{' '}
              <code>source_location</code> が <code>builder/association.rb</code> の104行目を指していたのは、この指定によるものです。例外が起きたときのバックトレース（例外が起きるまでに通ったメソッドの場所の一覧）にも、この位置が表示されます。
            </li>
          </ul>
          <p>
            source_location やバックトレースが、gem の中のヒアドキュメントの行を指していることがあります。そのときは、その行を含む文字列が、生成されたメソッドの本体です。<code>#{'{name}'}</code>{' '}
            を実際の名前に置き換えて読みます。
          </p>
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
            <ChapterLink n={2} section="method-missing" />
            で確かめた結果をもう一度示します。
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
            1行目の時点では、Article の特異クラス（クラスメソッドが定義される場所）に find_by_title はありません。それでも2行目の respond_to? が true を返すのは、ActiveRecord が
            respond_to_missing? を定義しているからです。3行目で初めて呼ぶと method_missing が呼ばれ、その中で find_by_title が定義されます。4行目では true
            に変わっていて、次の呼び出しからは method_missing を通りません。
          </p>
          <p>ここまでに見た、実行中にメソッドを用意する3つの方法を表にまとめます。</p>
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
            <code>*names</code> は渡された引数をまとめて配列で受け取る書き方で（
            <ChapterLink n={2} section="rails-syntax" />
            ）、<code>validates_presence_of :name, :email</code> の names は [:name, :email] です。<code>@presence ||= []</code> は、@presence がまだ無いときだけ空の配列を入れます。この行は Member
            のクラス本体から呼ばれるので self は Member で、@presence は Member のインスタンス変数になります。
          </p>
          <p>
            <code>Admin</code> は <code>Member</code> を継承しているのに、設定が引き継がれていません。クラスのインスタンス変数は「そのクラスというオブジェクト」だけのもので、子クラスは別のオブジェクトだからです。
          </p>
          <p>
            クラス変数（<code>@@presence</code>）を使うと子クラスからも見えますが、今度は子クラスで値を変えると親クラスや兄弟クラスの値も変わってしまいます。同じ MiniModel
            をクラス変数で書き直して確かめます。
          </p>
          <Code
            lang="ruby"
            title="class_variable.rb（Ruby 4.0.9 で実行）"
            code={`
class MiniModel
  @@presence = []
  def self.validates_presence_of(*names) = @@presence.concat(names)
  def self.presence_attributes = @@presence
end

class Member < MiniModel
  validates_presence_of :name, :email
end

class Product < MiniModel
  validates_presence_of :price
end

Member.presence_attributes  # => [:name, :email, :price]
Product.presence_attributes # => [:name, :email, :price]
`}
          />
          <p>
            クラス変数は、親クラスとすべての子クラスで1つの変数を共有します。Product で足した :price が、Member の設定にも入りました。
          </p>
          <p>
            次の図は2つの書き方で設定がどこに保存されるかを横に並べたものです。左がクラスのインスタンス変数、右がクラス変数の例で、上の段は validates_presence_of を呼んだクラス、下の段は値が入った変数です。
          </p>
          <Figure title="クラスのインスタンス変数とクラス変数の保存場所" caption="この節の2つの実行例をもとにした模式図。実線の矢印は validates_presence_of の中の concat が値を足す処理。破線の箱は、Admin にはインスタンス変数が無いことを表す。">
            <ClassVariableFigure />
          </Figure>
          <p>
            Rails のモデルでは「親の設定を引き継ぎつつ、子クラスで変更しても親には影響しない」動作が必要です。そのために作られたのが <code>class_attribute</code>{' '}
            です。自分でクラスマクロを書くときや、クラスメソッドの中で <code>@presence ||= …</code> のようにクラスのインスタンス変数へ保存するコードをレビューするときは、そのクラスを継承したクラスで値がどうなるかを確かめます。
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
          <p>
            3行目の <code>Child.settings.merge(timeout: 10)</code> は新しいハッシュを作るので、Child には Base のものとは別のハッシュを代入しています。
          </p>
          <h3>実装：特異クラスにメソッドを定義し直す</h3>
          <p>
            class_attribute は、値をインスタンス変数に入れる代わりに、値を返すクラスメソッドを定義します。子クラスで代入されたときは、子クラスの特異クラスに同じ名前のメソッドを定義します。次の例は、Rails
            のソースを読む前に、この仕組みだけを ActiveSupport を使わずに書いたものです。Base、Child、Other は上の例とは別のファイルで定義し直しています。
          </p>
          <Code
            lang="ruby"
            title="singleton_value.rb（Ruby 4.0.9 で実行）"
            code={`
class Base
  def self.settings = { timeout: 5 }      # Base の特異クラスに定義される
end
class Child < Base; end
class Other < Base; end

Child.settings   # => {timeout: 5}（Child の特異クラスに無いので、Base の特異クラスで見つかる）

# Child の特異クラスに、同じ名前のメソッドを定義する
Child.singleton_class.define_method(:settings) { { timeout: 10 } }

Child.settings   # => {timeout: 10}
Other.settings   # => {timeout: 5}
Base.settings    # => {timeout: 5}
`}
          />
          <p>
            クラスメソッドは特異クラスに定義され、子クラスの特異クラスは親クラスの特異クラスを継承します（
            <ChapterLink n={3} section="class-methods" />
            ）。Child の特異クラスにメソッドを足すと、Child.settings だけが新しい値を返し、Base と Other は変わりません。class_attribute は、代入のたびにこの定義を自動で実行します。
          </p>
          <p>
            Rails 8.1 の <code>class_attribute</code> は、値をインスタンス変数ではなく、特異クラスに定義したメソッドの戻り値として保持します。中心となる <code>ActiveSupport::ClassAttribute.redefine</code>{' '}
            を引用します。確かめるのは、値を返すメソッドをどこに定義しているかと、子クラスで代入したときに何が起きるかの2点です。
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
          <p>この引用に出てくる引数とメソッドは次のとおりです。</p>
          <ul>
            <li>
              redefine の引数：<code>owner</code> は属性を定義するクラス、<code>name</code> は属性の名前（:settings）、<code>namespaced_name</code>{' '}
              は値を返す内部用のメソッドの名前（:__class_attr_settings）、<code>value</code> は値です。class_attribute は <code>default:</code> に指定された値を value として渡します。
            </li>
            <li>
              <code>redefine_method(定義先, 名前, private: true) {'{ 本体 }'}</code> は、同じファイルにある補助のメソッドです。定義先に対して define_method を呼び、<code>private: true</code>{' '}
              ならそのメソッドを private にします。
            </li>
            <li>
              <code>owner.singleton_class</code> は owner の特異クラスを返します。ここに定義したメソッドは、owner のクラスメソッドになります。
            </li>
            <li>
              <code>owner.singleton_class?</code> は owner 自身が特異クラスかどうかを、<code>owner.equal?(self)</code> は owner と self が同じオブジェクトかどうかを返します。最初の if の中の{' '}
              <code>attached_object</code> は、特異クラスの持ち主のオブジェクトを返すメソッドです。
            </li>
            <li>
              先頭に <code>::</code> を付けた <code>::ActiveSupport::ClassAttribute</code> は、定数を最上位から探す書き方です。
            </li>
          </ul>
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
          <p>
            Base に <code>class_attribute :settings</code> を定義した例で <code>Child.settings = …</code> を実行したときは、次の順に処理されます。図 5-3 は、この代入の後の状態です。
          </p>
          <ol>
            <li>
              <code>settings=</code> は <code>self.__class_attr_settings = 値</code> を呼びます。Child の特異クラスには <code>__class_attr_settings=</code> が無いので、Base
              の特異クラスに定義されたものが実行されます。
            </li>
            <li>
              このメソッドの本体はブロックなので、ブロックを作ったときの owner（Base）を参照できます。self は呼び出しのレシーバの Child です。owner と self が違うので else に進みます。
            </li>
            <li>
              <code>redefine(Child, :settings, :__class_attr_settings, 新しい値)</code> が、Child の特異クラスに <code>__class_attr_settings</code> と{' '}
              <code>__class_attr_settings=</code> を定義します。このときの value は新しい値です。
            </li>
            <li>
              この後の Child.settings は、Child の特異クラスの <code>__class_attr_settings</code> を呼び、新しい値を返します。Base の特異クラスのメソッドと、そのメソッドが返す value
              は変わっていません。
            </li>
          </ol>
          <p>
            <code>Base.settings = …</code> のように、属性を定義したクラス自身に代入した場合は、owner と self が同じなので <code>value = new_value</code> が実行されます。値を返すブロック{' '}
            <code>{'{ value }'}</code> と代入のブロックは、redefine の引数である同じ変数 value を参照しています（
            <ChapterLink n={4} section="closure" />
            ）。そのため、次に読むと新しい値が返ります。
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
          <p>
            <code>private_method_defined?</code> の第2引数の false は、superclass をたどらず、その特異クラス自身に定義されたメソッドだけを調べる指定です。
          </p>
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
            <code>Other.settings[:timeout] = 99</code> は <code>settings=</code> を呼びません。Other.settings で読んだハッシュに対して <code>[]=</code>{' '}
            を呼んでいます。Other は代入をしていないので、読んだハッシュは Base が返すものと同じオブジェクトです。
          </p>
          <p>
            自分で class_attribute を使うときも同じです。配列やハッシュを値にした属性に、子クラスで <code>&lt;&lt;</code> や <code>[]=</code> を使うと、親クラスとほかの子クラスの値も変わります。
            <code>self.settings = settings.merge(timeout: 10)</code> のように、新しいオブジェクトを作って代入します。
          </p>
          <p>
            このため Rails の内部では、<code>class_attribute</code> の値を変えるときに、必ず新しいオブジェクトを作って代入しています。<code>has_many</code> が関連の情報を登録する{' '}
            <code>add_reflection</code> がその例です。引数の <code>ar</code> は関連を定義したモデルのクラス（Article など）です。<code>_reflections</code> は関連の名前から Reflection
            を引くハッシュで、class_attribute で定義されています。Reflection は関連の名前や相手のクラスを持つオブジェクトで、この章の最後の節で確かめます。
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
            <Ref n={4} />。Commentable が Taggable のクラスメソッドを使う例で確かめます。
          </p>
          <Code
            lang="ruby"
            title="included フックだけで書いた場合（Ruby 4.0.9 で実行）"
            code={`
module Taggable
  def self.included(base) = base.extend(ClassMethods)

  module ClassMethods
    def tag_column(name) = puts("#{self} のタグの列は #{name}")
  end
end

module Commentable
  def self.included(base)
    base.tag_column :comment_tags     # Taggable が足すクラスメソッドを使う
  end
end

class Note
  include Commentable
end
# undefined method 'tag_column' for class Note (NoMethodError)
`}
          />
          <p>
            Note は Taggable を include していないので tag_column を持たず、Commentable の included の中で NoMethodError になります。Note に <code>include Taggable</code> を{' '}
            <code>include Commentable</code> より前に書けば動きます。しかしその書き方では、Commentable が何に依存しているかを、Commentable を使うクラスがすべて書くことになります。
          </p>
          <p>
            Commentable の本体に <code>include Taggable</code> を書いても解決しません。そのとき Taggable.included に渡る base は Commentable で、ClassMethods は Commentable に extend
            されるだけです。Note には tag_column ができず、同じ NoMethodError になります。
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
          <p>
            # で始まる2行の出力は、Note の中の <code>include Commentable</code> を実行したときに表示されました。最後の3行は結果の確認です。ancestors には、Note に書いていない Taggable
            も入っています。<code>tagged_with</code> は Taggable の class_methods のブロックに書いたメソッドで、Note のクラスメソッドとして呼べました（本体の <code>name</code>{' '}
            はクラスの名前を返すメソッドです）。<code>instance_variable_get</code> は、名前を指定してインスタンス変数を読むメソッドです。Commentable というモジュールが持つ @_dependencies に Taggable
            が入っていることが分かります。
          </p>
          <h3>append_features の上書き</h3>
          <p>
            これを実現しているのが、<code>append_features</code> の上書きです。<ChapterLink n={3} section="hooks" />で見たとおり、<code>include</code> は内部で{' '}
            <code>append_features</code> を呼びます。
          </p>
          <p>
            <code>extend ActiveSupport::Concern</code> を実行したモジュール（Taggable や Commentable）では、Concern に定義された append_features、included、class_methods
            が、そのモジュール自身のメソッドとして呼べるようになります（
            <ChapterLink n={3} section="extend" />
            ）。そのため <code>include Taggable</code> が呼ぶ <code>Taggable.append_features</code> は、Ruby に最初からあるものに代わって、次に引用するものになります。引用の中の self と{' '}
            <code>@_dependencies</code> は、include されるモジュール（Taggable など）と、そのモジュールのインスタンス変数です。<code>base</code> は include した側です。
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
          <p>引用の中の書き方を補います。</p>
          <ul>
            <li>
              if の側では <code>super</code> を呼びません。ancestors への挿入は <code>Module#append_features</code> がするので、super を呼ばなければ base の ancestors は変わりません。
            </li>
            <li>
              <code>base &lt; self</code> は、base がすでに self を include しているときに true を返します。同じモジュールを2回組み込まないための行です。
            </li>
            <li>
              <code>const_defined?(:ClassMethods)</code> は、self の中に ClassMethods という定数があるかを調べます。<code>const_get(:ClassMethods)</code> はその定数（モジュール）を取り出します。
            </li>
            <li>
              <code>base.class_eval(&amp;@_included_block)</code> の <code>&amp;</code> は、保存しておいた Proc をブロックとして渡す書き方です（
              <ChapterLink n={4} section="block-to-proc" />
              ）。class_eval は base を self にしてブロックを実行します（
              <ChapterLink n={4} section="self-switch" />
              ）。そのため、included のブロックに書いた attr_accessor や scope は、base のクラス本体に書いたときと同じ結果になります。
            </li>
            <li>
              <code># :nodoc:</code> は、そのメソッドを API ドキュメントに載せないことを示すコメントです。
            </li>
          </ul>
          <p>Taggable と Commentable の例を、この引用に当てはめます。丸数字は図 5-4 の番号です。</p>
          <ol>
            <li>
              Commentable の本体の <code>include Taggable</code> で、<code>Taggable.append_features(Commentable)</code> が呼ばれます。Commentable は{' '}
              <code>extend ActiveSupport::Concern</code> を実行済みで @_dependencies を持つので、if の側に進みます。Commentable の @_dependencies に Taggable を足すだけで終わります。
            </li>
            <li>
              Note の <code>include Commentable</code> で、<code>Commentable.append_features(Note)</code> が呼ばれます（①）。Note は @_dependencies を持たないので、else の側に進みます。
            </li>
            <li>
              <code>@_dependencies.each</code> の行が <code>Note.include(Taggable)</code> を実行します（②）。<code>Taggable.append_features(Note)</code> も else の側に進みます。super で
              Note の ancestors に Taggable を入れ（③）、Note に Taggable::ClassMethods を extend し（④）、Taggable の included ブロックを Note で実行します（⑤）。ここで「included ブロック:
              self=Note」が表示されます。
            </li>
            <li>
              Commentable の処理に戻り、super で Note の ancestors に Commentable を入れ（⑥）、Commentable の included ブロックを Note で実行します（⑦）。Commentable には ClassMethods
              が無いので、extend はしません。
            </li>
          </ol>
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
            1行目の <code>&amp;class_methods_module_definition</code> は、class_methods に渡されたブロックを受け取る引数です。2〜4行目は、条件演算子（<code>条件 ? A : B</code>
            ）を3行に分けて書いたものです。self（Taggable など）に ClassMethods という定数がすでにあればそれを取り出し、無ければ <code>Module.new</code> で作った新しいモジュールに{' '}
            <code>const_set</code> で ClassMethods という名前を付けます。<code>const_defined?</code> の第2引数の false は、include しているモジュールなどをたどらず、self
            自身の定数だけを調べる指定です。
          </p>
          <p>
            最後の <code>mod.module_eval(&amp;…)</code> は、mod を self にしてブロックを実行します。ブロックの中の def は mod のインスタンスメソッドになります。
          </p>
          <p>
            つまり <code>class_methods do ... end</code> は、昔ながらの <code>module ClassMethods ... end</code> を書くのと同じ結果になります。Rails のソースには両方の書き方が混在しています。第1章で{' '}
            <code>has_many</code> の定義元が <code>ActiveRecord::Associations::ClassMethods</code> だったのは、<code>ActiveRecord::Associations</code> が Concern で、その{' '}
            <code>ClassMethods</code> が <code>ActiveRecord::Base</code> に extend されているからです。
          </p>
          <p>
            scope や has_many、validates を Concern に書くときは、included のブロックの中に書きます。モジュールの本体に直接書くと、その行はモジュールを定義したときに、モジュールを self
            として実行されます。モジュールには scope というメソッドが無いので、<code>{`undefined method 'scope' for module Publishable`}</code> のような NoMethodError になります。
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
          <p>
            Document は ActiveRecord を使わない普通のクラスです。set_callback の3つ目の引数には、メソッドの名前（:check、:timing）か lambda を渡せます。lambda は、save を呼ばれた Document
            のインスタンスを self として実行されます。<code>Document.new.save</code> の出力は次のように読みます。
          </p>
          <ul>
            <li>最初の「before: check」は、:before で登録した check の出力です。本体より前に実行されます。</li>
            <li>
              「around: 前」と「around: 後」は、:around で登録した timing の出力です。timing の中の <code>yield</code> で本体（run_callbacks のブロック）が実行され、「本体の保存」が表示されます。
            </li>
            <li>after は登録と逆の順に実行されるので、after(2)、after(1) の順に表示されます。</li>
            <li>
              run_callbacks の戻り値はブロックの戻り値（:saved）です。save はそれをそのまま返しています。
            </li>
          </ul>
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
          <p>
            この6行は、Document と同じように <code>define_callbacks :save</code> を実行したクラスの本体に書いたものです。around に lambda
            を渡すときは、引数を2つ受け取る形で書きます。1つ目は実行中のオブジェクトで、この例では使わないので <code>_</code> という名前にしています。2つ目は残りのコールバックと本体を実行する処理です。
            <code>blk.call</code> が、メソッドで書いたときの yield に当たります。出力は、実行された順に / で区切って1行に並べました。
          </p>
          <p>
            図 5-5 の左は定義の順、右は実行の順です。右の外側の枠が around1、内側の枠が around2 の範囲です。around1 より後に定義した5つのコールバックと本体は、around1 の枠の中で実行されます。after A
            は around2 より前に定義したので around2 の枠には入らず、around2 が終わった後に実行されます。
          </p>
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
            1行目の <code>extend Concern</code> と3行目からの <code>included do … end</code> は、前の節で読んだ書き方です。ActiveSupport::Callbacks を include
            したクラスで、ブロックの中の2行が実行されます。<code>extend ActiveSupport::DescendantsTracker</code> は、そのクラスを継承したクラスの一覧を <code>descendants</code>{' '}
            で取り出せるようにします。<code>class_attribute :__callbacks</code> の <code>instance_writer: false</code> はインスタンスからの代入用のメソッドを、
            <code>instance_predicate: false</code> は値があるかを返す <code>__callbacks?</code> を作らない指定です。既定値は空のハッシュです。
          </p>
          <p>
            <code>ActiveSupport::Callbacks</code> 自身も Concern で、include したクラスに <code>__callbacks</code> を用意します。<code>set_callback</code>{' '}
            は、チェーンを複製してからコールバックを追加し、そのクラスと子孫クラスのそれぞれに設定し直します。<code>class_attribute</code>{' '}
            の性質により、子クラスで追加したコールバックは親クラスに影響しません。また <code>define_callbacks :save</code> は、<code>_run_save_callbacks</code>{' '}
            などのメソッドを文字列の <code>module_eval</code> で定義します。
          </p>
          <p>
            define_callbacks は、チェーンを取り出すクラスメソッドも同じ module_eval で定義します。:save なら <code>_save_callbacks</code> という名前です。「宣言の形で書く Rails の
            DSL」の節で使った <code>_process_action_callbacks</code> はこうして定義されたメソッドで、<code>__callbacks[:process_action]</code> を返します。
          </p>
          <h3>中断</h3>
          <p>
            before コールバックで <code>throw :abort</code> を実行すると、チェーンが中断され、本体は実行されません。<code>run_callbacks</code> は <code>false</code> を返します。中断の判定方法は{' '}
            <code>define_callbacks</code> の <code>terminator</code> オプションで変えられます
            <Ref n={5} />。
          </p>
          <p>
            <code>throw</code> は Ruby に最初からあるメソッドで、対になる <code>catch(:abort) {'{ … }'}</code> のブロックをその場で抜けます。ブロックの中の throw
            より後ろの処理は実行されません。ActiveSupport::Callbacks は before コールバックを <code>catch(:abort)</code> のブロックの中で実行し、throw :abort で抜けてきたときにチェーンを中断します。
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
            HaltDoc は Document を継承しているので、Document のチェーン（check、2つの after、timing）を引き継ぎます。<code>prepend: true</code> で、その先頭に throw :abort を実行する lambda
            を足しました。先頭で中断するので、その後ろの check も実行されていません。
          </p>
          <p>
            本体も around も実行されていませんが、after コールバックは実行されています。既定では、中断しても after コールバックは実行されます。この動作は{' '}
            <code>define_callbacks</code> の <code>skip_after_callbacks_if_terminated: true</code> で変えられ、コントローラーの <code>process_action</code>{' '}
            のチェーンはこの指定をしています（次の節）。
          </p>
          <p>
            モデルの before_save などでも、before コールバックが throw :abort を実行すると保存は中断され、save は false を返します。バリデーションのエラーが無いのに save が false
            を返すときは、コールバックの中で throw :abort が実行されていないかを調べます（
            <ChapterLink n={14} section="halting" />
            ）。
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
            terminator の lambda には、コントローラーのインスタンス（controller）と、before コールバックを1つ実行する処理（result_lambda）が渡されます。<code>result_lambda.call</code>{' '}
            でコールバックを実行し、その後の <code>controller.performed?</code> の値が、中断するかどうかの答えになります。中断すると、その後ろに登録した before_action も実行されません。判定に使うのは
            performed? だけなので、before_action のメソッドが false を返しても、レスポンスを作っていなければアクションは実行されます。引用の最後の <code>mattr_accessor</code>{' '}
            の行は別の設定を読み書きするメソッドを定義していて、コールバックの動作には関係しません。
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
            引用は ClassMethods モジュールの本体の一部で、each を閉じる end より前で切っています。:before、:after、:around のそれぞれについて define_method を実行するので、before_action、after_action、around_action
            の3つが同じ形で定義されます。ClassMethods のメソッドなので、コントローラーのクラスメソッドになります（前の節の Concern の仕組み）。
          </p>
          <p>
            <code>do |*names, &amp;blk|</code> は、定義するメソッドの引数です。<code>before_action :set_article, only: %i[show edit]</code> と書いた場合、names は{' '}
            <code>[:set_article, {'{only: [:show, :edit]}'}]</code> です。ブロックを付けて呼んだ場合は、blk にそのブロックが入ります。<code>_insert_callbacks</code> は names
            の最後のハッシュをオプションとして取り出します。そして、残った名前とブロックの1つずつについて、<code>do |name, options|</code> のブロックを実行します。このブロックの中の callback
            は、each のブロック変数（:before など）をクロージャとして参照しています。
          </p>
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
            引数の <code>(...)</code> は、受け取った引数をすべてそのまま super に渡す書き方です。
            <code>run_callbacks</code> のブロックの中の <code>super</code> が、ancestors で次にある <code>ActionController::Rendering#process_action</code>{' '}
            を経て、最終的にアクションを呼びます。before_action は「アクションを本体とするコールバックチェーン」の before コールバックです。
          </p>
          <p>
            次の図はここまでに読んだ before_action のコードを、クラスを読み込むときと要求が届いたときに分けて並べたものです。左の列は ArticlesController の本体で{' '}
            <code>before_action :set_article, only: %i[show edit]</code> を実行したときの処理、右の列は show の要求が届いたときの処理で、どちらも上から下へ進みます。右の列の run_callbacks
            が実行するのは、左の列の最後で __callbacks に入れたチェーンです。
          </p>
          <Figure
            title="before_action を読み込むときと、要求が届いたときの処理"
            caption="この節の引用と「ActiveSupport::Callbacks の仕組み」の節をもとにした模式図。実線の矢印は処理の順、破線の矢印は、左の列で登録したチェーンを run_callbacks が読むことを表す。performed? はレスポンスがすでに作られたかを返す。around コールバックは省略した。"
          >
            <BeforeActionFlowFigure />
          </Figure>
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
            引数の <code>model</code> は has_many を書いたクラス（Article）、<code>name</code> は関連の名前（:comments）です。上から順に次のことをしています。
          </p>
          <ol>
            <li>
              最初の if は、関連の名前が Active Record 自身のメソッド（save など）と同じときに ArgumentError を出します。
            </li>
            <li>
              <code>create_reflection</code> が Reflection を作ります。
            </li>
            <li>
              <code>define_accessors</code> が、関連を読むメソッド（comments）と書き込むメソッド（comments=）を定義します。「define_method と文字列の class_eval」の節で引用した define_readers
              は、ここから呼ばれます。
            </li>
            <li>
              <code>define_callbacks</code> は、<code>dependent:</code> オプションを指定したときに、レコードを削除する前に関連先を処理するコールバックを登録します。
            </li>
            <li>
              <code>define_validations</code> と <code>define_change_tracking_methods</code> は、Builder::Association では何もしないメソッドです。関連の種類ごとのクラスが、必要に応じて上書きします。
            </li>
            <li>
              最後の行の <code>reflection</code> が build の戻り値です。has_many はこれを add_reflection に渡します。
            </li>
          </ol>
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
          <p>
            このメソッドはモデルのクラスメソッドなので、self は Article です。<code>@generated_association_methods ||= begin … end</code> は、最初に呼ばれたときだけ begin から end
            までを実行し、最後の式（mod）をクラスのインスタンス変数に保存します。2回目からは保存したモジュールを返します。
          </p>
          <p>
            begin の中では、<code>Module.new</code> で名前の無いモジュールを作り、<code>const_set</code> で Article::GeneratedAssociationMethods という定数名を付けます。次に{' '}
            <code>private_constant</code> でその定数を Article の外から参照できないようにし、<code>include mod</code> で Article に組み込みます。この章の最初の節でこのモジュールを const_get
            で取り出したのは、private_constant が指定されているからです。
          </p>
          <p>
            図 5-6 は、ここまでの流れをまとめたものです。①の build の中で Reflection と関連メソッドが作られ、②の add_reflection が Reflection を _reflections に登録します。
          </p>
          <Figure n="5-6" title="has_many :comments が行うこと" caption="Rails 8.1.4.1 の has_many と Builder::Association.build を読んでまとめた図。">
            <HasManyFigure />
          </Figure>
          <p>
            「実行するとメソッドができる」の節で has_many :comments だけを実行した Article05 のモジュールを調べると、<code>comments</code> と <code>comments=</code>{' '}
            のほかに、コレクションの関連で追加される <code>comment_ids</code> と <code>comment_ids=</code> があります。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（「実行するとメソッドができる」の節の Article05）"
            code={`
Article05.const_get(:GeneratedAssociationMethods).instance_methods(false).sort
# => [:comment_ids, :comment_ids=, :comments, :comments=]
`}
          />
          <p>
            関連メソッドがクラス自身ではなく include されたモジュールに定義されるので、モデルで同じ名前のメソッドを定義して <code>super</code>{' '}
            で元の処理を呼べます（第3章の include の規則）。また、作られた Reflection は <code>class_attribute</code> の <code>_reflections</code>{' '}
            に新しいハッシュとして登録されるので、親クラスや別のモデルには影響しません。Reflection がどのように使われて SQL になるかは<ChapterLink n={13} />で説明します。
          </p>
          <Code
            lang="ruby"
            title="生成されたメソッドと同じ名前のメソッドを定義し、super で呼ぶ例"
            code={`
class Article < ApplicationRecord
  has_many :comments

  def comments
    Rails.logger.debug("comments を読む")
    super          # Article::GeneratedAssociationMethods の comments を呼ぶ
  end
end
`}
          />
          <p>
            Article 自身に定義した comments は、ancestors で後ろにある GeneratedAssociationMethods の comments より先に見つかります。その中の super が、生成された comments を呼びます（
            <ChapterLink n={3} section="super" />
            ）。
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
