import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation14 } from '../explanations/database'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 24-1 検証の結果と save ---------- */
function ValidateFlowFigure() {
  return (
    <Svg
      id="24-1"
      w={760}
      h={250}
      label="save または save! を呼ぶと、まず valid? で検証する。検証に通れば BEGIN・INSERT・COMMIT を送り、save は true を返す。通らなければ、見つかった問題を errors に記録し、SQL を送らずに、save は false を返し、save! は ActiveRecord::RecordInvalid を投げる"
    >
      <Box x={20} y={98} w={110} h={44} lines="save / save!" mono fs={12.5} />
      <Arrow x1={130} y1={120} x2={168} y2={120} />
      <Box x={170} y={92} w={150} h={56} lines={['valid?', '検証の規則を確かめる']} fs={12} fill="box5" subTone="muted" />
      <Arrow d="M320,108 L360,108 L360,52 L398,52" />
      <T x={330} y={36} fs={11.5} tone="acc">
        通る
      </T>
      <Box x={400} y={30} w={190} h={44} lines="BEGIN → INSERT → COMMIT" mono fs={11.5} fill="box4" />
      <Arrow x1={590} y1={52} x2={628} y2={52} />
      <Box x={630} y={30} w={110} h={44} lines="save は true" fs={12} />
      <Arrow d="M320,132 L360,132 L360,188 L398,188" />
      <T x={296} y={168} fs={11.5} tone="danger">
        通らない
      </T>
      <Box x={400} y={160} w={190} h={56} lines={['errors に問題を記録', 'SQL は送らない']} fs={12} fill="bg" subTone="danger" />
      <Arrow x1={590} y1={188} x2={628} y2={188} />
      <Box x={630} y={160} w={110} h={56} lines={['save は false', 'save! は例外']} fs={12} subTone="muted" />
      <T x={20} y={238} fs={11} tone="muted" mono>
        例：errors.full_messages =&gt; ["Title can't be blank"]　save! =&gt; ActiveRecord::RecordInvalid
      </T>
    </Svg>
  )
}

/* ---------- 図 24-2 コールバックが呼ばれた位置 ---------- */
function CallbackFlowFigure() {
  type Step = { t: string; kind: 'cb' | 'sql' | 'val' }
  const row = (y: number, steps: Step[]) =>
    steps.map((s, i) => {
      const x = 20 + i * 124
      return (
        <g key={`${y}-${i}`}>
          <Box x={x} y={y} w={114} h={44} lines={s.t.split('\n')} fs={10.5} mono={s.kind !== 'val'} fill={s.kind === 'cb' ? 'box5' : s.kind === 'sql' ? 'box4' : 'box'} />
          {i < steps.length - 1 && <Arrow x1={x + 114} y1={y + 22} x2={x + 123} y2={y + 22} />}
        </g>
      )
    })
  return (
    <Svg
      id="24-2"
      w={760}
      h={240}
      label="create! では、before_validation の strip_title、検証、BEGIN、INSERT、after_create の log_created、COMMIT の順に実行された。update! では、before_validation の strip_title、検証、BEGIN、UPDATE、COMMIT の順で、after_create は呼ばれなかった"
    >
      <T x={20} y={20} bold fs={12.5}>
        {'Article.create!(title: "\u00a0\u00a0前後に空白\u00a0\u00a0")'}
      </T>
      {row(34, [
        { t: 'before_validation\nstrip_title', kind: 'cb' },
        { t: '検証', kind: 'val' },
        { t: 'BEGIN', kind: 'sql' },
        { t: 'INSERT', kind: 'sql' },
        { t: 'after_create\nlog_created', kind: 'cb' },
        { t: 'COMMIT', kind: 'sql' },
      ])}
      <T x={20} y={114} bold fs={12.5}>
        a.update!(views_count: 1)
      </T>
      {row(128, [
        { t: 'before_validation\nstrip_title', kind: 'cb' },
        { t: '検証', kind: 'val' },
        { t: 'BEGIN', kind: 'sql' },
        { t: 'UPDATE', kind: 'sql' },
        { t: 'COMMIT', kind: 'sql' },
      ])}
      <T x={640} y={150} fs={11} tone="muted">
        after_create は
      </T>
      <T x={640} y={168} fs={11} tone="muted">
        呼ばれない
      </T>
      <rect x={20} y={200} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={40} y={206} fs={11}>
        登録したコールバック
      </T>
      <rect x={200} y={200} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={220} y={206} fs={11}>
        MySQL に送った SQL
      </T>
      <T x={20} y={230} fs={11} tone="muted">
        before_validation は新規作成でも更新でも呼ばれ、after_create は新規作成のときだけ呼ばれる
      </T>
    </Svg>
  )
}

/* ---------- 図 24-3 save の入れ子 ---------- */
function NestFigure() {
  const layers = [
    { t: 'Transactions#save', s: 'トランザクションを開始（with_transaction_returning_status）', fill: 'box4' as const },
    { t: 'Validations#save', s: 'valid? が偽なら false を返して終わる', fill: 'box' as const },
    { t: 'Callbacks#create_or_update', s: 'save のコールバック（before・around・after_save）', fill: 'box2' as const },
    { t: 'Callbacks#_create_record', s: 'create のコールバック（before・around・after_create）', fill: 'box2' as const },
    { t: 'Persistence#_create_record', s: 'INSERT を実行', fill: 'box5' as const },
  ]
  return (
    <Svg
      id="24-3"
      w={760}
      h={300}
      label="save は5層の入れ子になっている。一番外側の Transactions#save がトランザクションを開始し、その内側の Validations#save が valid? を実行する。検証に通ると、Callbacks#create_or_update が save のコールバックの中で、Callbacks#_create_record が create のコールバックの中で内側を呼び、一番内側の Persistence#_create_record が INSERT を実行する"
    >
      {layers.map((l, i) => {
        const x = 20 + i * 22
        const y = 14 + i * 44
        const w = 720 - i * 44
        const h = 272 - i * 52
        return (
          <g key={l.t}>
            <rect x={x} y={y} width={w} height={h} rx={8} fill={`var(--fig-${l.fill})`} stroke="var(--fig-line)" />
            <T x={x + 12} y={y + 18} mono fs={12} bold>
              {l.t}
            </T>
            <T x={x + 250} y={y + 18} fs={11.5} tone="muted">
              {l.s}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 24-4 create! のコールバックと SQL ---------- */
function TimelineFigure() {
  const items: { t: string; sql?: boolean; acc?: boolean }[] = [
    { t: 'before_validation' },
    { t: 'after_validation' },
    { t: 'before_save' },
    { t: 'around_save（前）' },
    { t: 'before_create' },
    { t: 'around_create（前）' },
    { t: 'BEGIN', sql: true },
    { t: 'INSERT INTO articles …', sql: true },
    { t: 'around_create（後）' },
    { t: 'after_create' },
    { t: 'around_save（後）' },
    { t: 'after_save' },
    { t: 'COMMIT', sql: true },
    { t: 'after_commit', acc: true },
  ]
  const rowH = 24
  return (
    <Svg
      id="24-4"
      w={760}
      h={items.length * rowH + 40}
      label="Article.create! で実際に記録した順。before_validation、after_validation、before_save、around_save の前半、before_create、around_create の前半の後に、BEGIN と INSERT が送られる。その後 around_create の後半、after_create、around_save の後半、after_save が実行され、COMMIT の後に after_commit が実行される。BEGIN はトランザクションの開始時ではなく、最初の SQL を送る直前に送られている"
    >
      <rect x={176} y={12} width={420} height={12 * rowH + 4} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <T x={604} y={22} fs={11.5} tone="acc">
        トランザクションの中
      </T>
      <T x={604} y={40} fs={11} tone="muted">
        （Rails の上では save の
      </T>
      <T x={604} y={56} fs={11} tone="muted">
        最初から開始済み）
      </T>
      {items.map((it, i) => {
        const y = 16 + i * rowH
        return (
          <g key={it.t}>
            <T x={160} y={y + rowH / 2} anchor="end" fs={11} tone="muted" mono>
              {String(i + 1)}
            </T>
            <Box x={186} y={y + 1} w={300} h={rowH - 4} lines={it.t} mono fs={11.5} rx={4} fill={it.sql ? 'box4' : it.acc ? 'box5' : 'box'} align="start" />
          </g>
        )
      })}
      <T x={20} y={items.length * rowH + 30} fs={11} tone="muted">
        緑：MySQL に送られた SQL
      </T>
    </Svg>
  )
}

/* ---------- 図 24-5 一意性の検証の競合 ---------- */
function RaceFigure() {
  return (
    <Svg
      id="24-5"
      w={760}
      h={300}
      label="2つのスレッドが同じメールアドレスの著者を作る。T1 と T2 はどちらも SELECT 1 で同じメールアドレスの行が無いことを確かめ、検証に通る。T1 が INSERT して COMMIT する。T2 も INSERT するが、データベースの一意の索引に違反して Duplicate entry のエラーになり、ActiveRecord::RecordNotUnique が発生してロールバックされる"
    >
      <T x={150} y={20} anchor="middle" bold>
        スレッド T1
      </T>
      <T x={560} y={20} anchor="middle" bold>
        スレッド T2
      </T>
      <line x1={150} y1={32} x2={150} y2={268} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={560} y1={32} x2={560} y2={290} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <Box x={40} y={44} w={220} h={34} lines="SELECT 1 … email = ?（0件）" mono fs={11} />
      <Box x={450} y={70} w={220} h={34} lines="SELECT 1 … email = ?（0件）" mono fs={11} />
      <T x={355} y={64} anchor="middle" fs={11.5} tone="muted">
        どちらも検証に通る
      </T>
      <Box x={40} y={124} w={220} h={34} lines="INSERT … race@example.com" mono fs={11} />
      <Box x={40} y={168} w={220} h={34} lines="COMMIT（成功）" mono fs={11} fill="box5" />
      <Box x={450} y={196} w={220} h={34} lines="INSERT … race@example.com" mono fs={11} />
      <Box x={410} y={242} w={300} h={44} lines={['Duplicate entry（一意の索引）', '→ RecordNotUnique、ROLLBACK']} fs={11.5} fill="bg" subTone="danger" />
      <Arrow x1={560} y1={230} x2={560} y2={240} />
      <T x={20} y={286} fs={11} tone="muted">
        検証の SELECT と INSERT の間に他のスレッドが入れる
      </T>
    </Svg>
  )
}

/* ---------- 図 24-6 外側のトランザクションと after_commit ---------- */
function OuterTxFigure() {
  return (
    <Svg
      id="24-6"
      w={760}
      h={210}
      label="ActiveRecord::Base.transaction のブロックの中で update! を呼ぶと、update! の after_save はブロックの途中で実行される。after_commit は、ブロックが終わって外側のトランザクションが COMMIT された後に実行される。ブロックの中で例外が起きてロールバックされた場合、after_commit は実行されない"
    >
      <rect x={20} y={20} width={560} height={140} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={40} mono fs={12} bold>
        ActiveRecord::Base.transaction do
      </T>
      <Box x={40} y={56} w={250} h={40} lines="a.update!(title: …)" mono fs={12} />
      <Box x={310} y={56} w={250} h={40} lines={['after_save はここで実行', '（まだ COMMIT 前）']} fs={11.5} fill="box2" subTone="muted" />
      <Arrow x1={290} y1={76} x2={308} y2={76} />
      <Box x={40} y={108} w={250} h={36} lines="（ブロックの残りの処理）" fs={11.5} fill="bg" />
      <T x={32} y={176} mono fs={12} bold>
        end → COMMIT
      </T>
      <Arrow x1={160} y1={186} x2={598} y2={186} />
      <Box x={600} y={166} w={140} h={40} lines="after_commit" mono fs={12} fill="box5" />
      <T x={600} y={150} fs={11} tone="muted">
        ロールバックなら実行されない
      </T>
    </Svg>
  )
}

/* ---------- save・create_or_update・_create_record の super の連鎖（番号なし） ---------- */
function SuperChainFigure() {
  const cols = [
    { name: 'save', next: 'create_or_update を呼ぶ', mods: ['Suppressor', 'Transactions', 'Validations'] },
    { name: 'create_or_update', next: '_create_record を呼ぶ', mods: ['Timestamp', 'Callbacks'] },
    {
      name: '_create_record',
      next: 'INSERT を送る',
      mods: ['Timestamp', 'Callbacks', 'AttributeMethods::Dirty', 'Encryption::EncryptableRecord', 'Locking::Optimistic', 'CounterCache'],
    },
  ]
  const read = ['Transactions', 'Validations', 'Callbacks']
  const colX = (c: number) => 16 + c * 264
  const rowY = (r: number) => 34 + r * 50
  return (
    <Svg
      id="ch14-super-chain"
      w={780}
      h={410}
      label="上の一覧の3つのメソッドの連鎖。save は Suppressor、Transactions、Validations、Persistence の順に super でつながる。Persistence の save が create_or_update を呼ぶと、Timestamp、Callbacks、Persistence の順に進む。Persistence の create_or_update が _create_record を呼ぶと、Timestamp、Callbacks、AttributeMethods::Dirty、Encryption::EncryptableRecord、Locking::Optimistic、CounterCache、Persistence の順に進み、最後の Persistence が INSERT を送る"
    >
      {cols.map((c, ci) => {
        const x = colX(ci)
        const last = c.mods.length
        return (
          <g key={c.name}>
            <T x={x + 112} y={18} anchor="middle" mono bold fs={12.5}>
              {c.name}
            </T>
            {c.mods.map((m, ri) => (
              <g key={m}>
                <Box x={x} y={rowY(ri)} w={224} h={36} lines={m} mono fs={12} fill="box2" accent={read.includes(m)} />
                <Arrow x1={x + 112} y1={rowY(ri) + 36} x2={x + 112} y2={rowY(ri) + 49} />
              </g>
            ))}
            <Box x={x} y={rowY(last)} w={224} h={36} lines={['Persistence', c.next]} mono fs={12.5} fill="box2" accent subTone="muted" />
            {ci < cols.length - 1 && (
              <Arrow d={`M${x + 224},${rowY(last) + 18} L${x + 244},${rowY(last) + 18} L${x + 244},${rowY(0) + 18} L${x + 262},${rowY(0) + 18}`} accent />
            )}
          </g>
        )
      })}
      <Arrow x1={16} y1={394} x2={56} y2={394} />
      <T x={64} y={394} fs={11.5}>
        super ですぐ下のモジュールの同じ名前のメソッドを呼ぶ
      </T>
      <Arrow x1={420} y1={394} x2={460} y2={394} accent />
      <T x={468} y={394} fs={11.5}>
        名前の違うメソッドを呼ぶ
      </T>
    </Svg>
  )
}

/* ---------- throw :abort で中断した save（番号なし） ---------- */
function HaltAroundFigure() {
  return (
    <Svg
      id="ch14-halt-around"
      w={760}
      h={436}
      label="throw :abort で中断した save の実行順。before_validation、after_validation、記録用の before_save の後に、around_save（前）が実行される。around_save より後に登録した before_save の stop_if_halt は、around_save の yield の中で呼ばれ、throw :abort を実行する。yield の中の create のコールバックと INSERT は実行されず、処理は around_save（後）に戻る。after_save は実行されない。save は false を返し、save! は RecordNotSaved を投げる。SQL は1つも送られない"
    >
      <Box x={40} y={12} w={300} h={28} lines="before_validation" mono fs={12} />
      <Arrow x1={190} y1={40} x2={190} y2={53} />
      <Box x={40} y={54} w={300} h={28} lines="after_validation" mono fs={12} />
      <Arrow x1={190} y1={82} x2={190} y2={95} />
      <Box x={40} y={96} w={300} h={28} lines="before_save（記録用）" mono fs={12} />
      <Arrow x1={190} y1={124} x2={190} y2={163} />

      <rect x={28} y={136} width={324} height={248} rx={8} fill="none" stroke="var(--fig-line)" />
      <T x={40} y={152} mono fs={11.5} tone="muted">
        around_save（記録用）
      </T>
      <Box x={44} y={164} w={292} h={28} lines="around_save（前）" mono fs={12} />
      <Arrow x1={190} y1={192} x2={190} y2={227} />
      <rect x={44} y={204} width={292} height={128} rx={6} fill="none" stroke="var(--fig-line)" />
      <T x={56} y={218} fs={11.5} tone="muted">
        yield の中
      </T>
      <Box x={58} y={228} w={264} h={40} lines={['before_save :stop_if_halt', 'throw :abort']} mono fs={12.5} subTone="danger" />
      <Box x={58} y={280} w={264} h={40} lines={['create のコールバックと INSERT', '実行されない']} fs={12.5} fill="bg" dashed subTone="muted" />
      <Box x={44} y={344} w={292} h={28} lines="around_save（後）" mono fs={12} />
      <Arrow d="M322,248 L376,248 L376,358 L338,358" accent />

      <Box x={40} y={396} w={300} h={28} lines="after_save（実行されない）" fs={12} fill="bg" dashed />

      <T x={392} y={224} fs={11.5} tone="muted">
        around_save より後に登録した before_save は、
      </T>
      <T x={392} y={242} fs={11.5} tone="muted">
        around_save の yield の中で呼ばれる
      </T>
      <T x={392} y={294} fs={11.5} tone="acc">
        中断すると、yield の中の残りを実行せずに
      </T>
      <T x={392} y={312} fs={11.5} tone="acc">
        around_save（後）に戻る
      </T>
      <T x={392} y={402} fs={12}>
        save は false、save! は RecordNotSaved
      </T>
      <T x={392} y={420} fs={11.5} tone="muted">
        SQL は1つも送られない
      </T>
    </Svg>
  )
}

const ch14: Chapter = {
  number: 14,
  part: 3,
  title: '保存処理：バリデーションとコールバック',
  summary:
    '空のタイトルを保存しようとしたときと、正しい記事を保存したときでは、save の中で通る処理が変わります。入力の検証、SQL の実行、保存後の処理をログに沿って並べます。',
  goals: [
    '検証に失敗したときの save の戻り値と save! の例外を読み分けられる',
    'モデルの一意性検証だけでは同時に入る同じ値を防ぎ切れない理由を説明できる',
    '保存中に実行するコールバックと、DB への変更が確定してから行う処理を使い分けられる',
  ],
  prerequisites: [5, 11],
  sections: [
    {
      id: 'validation-basics',
      title: '保存する前に値を検証する',
      body: (
        <>
          <p>
            Web アプリケーションでは、利用者がフォームに入力した値から記事などのレコードを作り、データベースに保存します。入力は空のことも、範囲外の数値のこともあります。デモの articles テーブルの title
            列は空の文字列も NULL も受け付けるので、何も確かめずに保存すると、タイトルの無い記事ができます。
          </p>
          <Code
            lang="ruby"
            title="検証の規則が無い Article（デモでの実行結果。INSERT の列は一部を省略）"
            code={`
a = Article.new(title: "")
a.save   # => true
#   BEGIN
#   INSERT INTO \`articles\` (\`title\`, \`body\`, ...) VALUES ('', NULL, ...)
#   COMMIT
`}
          />
          <p>
            保存する前に値が正しいかを確かめること（検証）を<Term en="validation">バリデーション</Term>と呼びます。Rails ではモデルに <code>validates</code>{' '}
            で検証の規則を書きます。<code>presence: true</code> は値が空でないこと、<code>numericality</code> は値が数値であることを確かめる規則です。ほかに、長さ（length）、形式（format）、一意性（uniqueness）などの規則があります
            <Ref n={5} />。デモの Article に次の2行を加えて試しました。
          </p>
          <Code
            lang="ruby"
            code={`
class Article < ApplicationRecord
  validates :title, presence: true
  validates :views_count, numericality: { greater_than_or_equal_to: 0 }
end
`}
          />
          <Code
            lang="ruby"
            title="デモでの実行結果（INSERT の列は一部を省略）"
            code={`
b = Article.new(title: "")
b.valid?                 # => false
b.errors.full_messages   # => ["Title can't be blank"]
b.errors[:title]         # => ["can't be blank"]
b.save                   # => false（SQL は1つも送られない）
b.persisted?             # => false
b.save!                  # => ActiveRecord::RecordInvalid: Validation failed: Title can't be blank

c = Article.new(title: "", views_count: -1)
c.valid?                 # => false
c.errors.full_messages   # => ["Title can't be blank", "Views count must be greater than or equal to 0"]

b.title = "検証の例"
b.save                   # => true
#   BEGIN
#   INSERT INTO \`articles\` (\`title\`, \`body\`, ...) VALUES ('検証の例', NULL, ...)
#   COMMIT
b.persisted?             # => true
`}
          />
          <p>
            <code>valid?</code> は規則を順に確かめ、問題が無ければ true を返します。見つかった問題は <code>errors</code> に属性ごとに記録され、<code>full_messages</code>{' '}
            は属性の名前を付けた文の配列を返します。タイトルも閲覧数も規則に合わない c では、2つの問題がまとめて記録されました。
          </p>
          <p>
            <code>save</code> は保存の前に検証を行い、通らなければ SQL を1つも送らずに false を返します。<code>persisted?</code>（保存済みかどうか）も false のままです。<code>save!</code>{' '}
            は、同じ場合に ActiveRecord::RecordInvalid の例外を投げます。タイトルを入れ直すと検証に通り、INSERT が送られました（図 24-1）
            <Ref n={5} />。
          </p>
          <Figure n="24-1" title="検証の結果と save" caption="上の実行結果をまとめた図。">
            <ValidateFlowFigure />
          </Figure>
          <p>
            コントローラーでは save の戻り値で処理を分けます。Rails のジェネレーター（ひな形のファイルを作るコマンド）で Article の scaffold_controller を作ると、create アクションとフォームのテンプレートは次のようになりました
            <Ref n={9} />。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/articles_controller.rb（生成されたファイルの create）"
            code={`
  def create
    @article = Article.new(article_params)

    if @article.save
      redirect_to @article, notice: "Article was successfully created."
    else
      render :new, status: :unprocessable_content
    end
  end
`}
          />
          <Code
            lang="erb"
            title="app/views/articles/_form.html.erb（生成されたファイルの先頭）"
            code={`
<%= form_with(model: article) do |form| %>
  <% if article.errors.any? %>
    <div style="color: red">
      <h2><%= pluralize(article.errors.count, "error") %> prohibited this article from being saved:</h2>

      <ul>
        <% article.errors.each do |error| %>
          <li><%= error.full_message %></li>
        <% end %>
      </ul>
    </div>
  <% end %>
`}
          />
          <p>
            保存できれば記事のページへ移動し（redirect_to）、保存できなければ入力フォーム（new）を 422 Unprocessable Content の状態で表示し直します。フォームは <code>article.errors</code>{' '}
            の問題を1件ずつ <code>full_message</code> で並べるので、利用者はどの入力を直せばよいかが分かります。
          </p>
          <p>
            バッチ処理やテストで save が false を返した理由を調べるときも、同じ <code>errors</code> を見ます。Rails コンソールで同じ値のレコードを作り、<code>valid?</code> と{' '}
            <code>errors.full_messages</code> を実行すると、どの属性がどの規則に合わなかったかが分かります。<code>errors</code> が空なのに save が false
            を返す場合は、検証ではなくコールバックが保存を中断しています（「保存の中断」の節）。
          </p>
        </>
      ),
    },
    {
      id: 'callback-basics',
      title: '保存の前後に処理を足すコールバック',
      body: (
        <>
          <p>
            保存するたびに必ず行いたい処理があります。たとえば、タイトルの前後の空白を取り除く、記事を作ったことをログに残す、コメントが付いたら記事を開いている画面に知らせる、などです。これらを保存するアクションごとに書くと、書き忘れる場所が出ます。Rails
            では保存の決まった時点で呼ぶメソッドをモデルに登録できます。このメソッドを<Term en="callback">コールバック</Term>と呼びます
            <Ref n={4} />。
          </p>
          <Code
            lang="ruby"
            code={`
class Article < ApplicationRecord
  before_validation :strip_title
  after_create :log_created

  private

  def strip_title
    puts "  before_validation: strip_title"
    self.title = title.strip if title
  end

  def log_created
    puts "  after_create: 記事 #{id} を作成しました"
  end
end
`}
          />
          <Code
            lang="ruby"
            title="デモでの実行結果（INSERT・UPDATE の列は一部を省略）"
            code={`
a = Article.create!(title: "  前後に空白  ")
#   before_validation: strip_title
#   BEGIN
#   INSERT INTO \`articles\` (\`title\`, \`body\`, ...) VALUES ('前後に空白', NULL, ...)
#   after_create: 記事 10016 を作成しました
#   COMMIT
a.title   # => "前後に空白"

a.update!(views_count: 1)
#   before_validation: strip_title
#   BEGIN
#   UPDATE \`articles\` SET \`articles\`.\`updated_at\` = ..., \`articles\`.\`views_count\` = 1, ...
#   COMMIT
`}
          />
          <p>
            before_validation に登録した strip_title は検証の前に呼ばれ、INSERT の値は空白を除いた「前後に空白」になりました。after_create に登録した log_created は INSERT の後に呼ばれ、MySQL
            が割り当てた id（10016）を使えています。update! でも strip_title は呼ばれましたが、送られたのは UPDATE で、after_create は呼ばれませんでした（図 24-2）。
          </p>
          <Figure n="24-2" title="コールバックが呼ばれた位置" caption="上の実行結果を図にしたもの。">
            <CallbackFlowFigure />
          </Figure>
          <p>コールバックの名前は before_（前）か after_（後）と、どの処理の前後かを組み合わせたものです。主なものを挙げます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>コールバック</th>
                  <th>呼ばれる時点</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>before_validation</code>・<code>after_validation</code>
                  </td>
                  <td>検証の前・後</td>
                </tr>
                <tr>
                  <td>
                    <code>before_save</code>・<code>after_save</code>
                  </td>
                  <td>新規作成と更新の両方で、INSERT・UPDATE の前・後</td>
                </tr>
                <tr>
                  <td>
                    <code>before_create</code>・<code>after_create</code>
                  </td>
                  <td>新規作成の INSERT の前・後</td>
                </tr>
                <tr>
                  <td>
                    <code>before_update</code>・<code>after_update</code>
                  </td>
                  <td>更新の UPDATE の前・後</td>
                </tr>
                <tr>
                  <td>
                    <code>after_commit</code>
                  </td>
                  <td>COMMIT の後</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            デモの Comment には <code>{'after_create_commit -> { broadcast_append_to article, target: "comments" }'}</code> が書かれています。after_create_commit
            は、新しいコメントの INSERT が COMMIT された後に呼ばれるコールバックです
            <Ref n={4} />。この処理は記事を開いているブラウザーに新しいコメントを送ります。
          </p>
          <p>
            検証とコールバックは、どちらも save の中で決まった順に実行されます。上の出力でも、log_created は INSERT の後、COMMIT の前に呼ばれていました。次の節からは、save を呼んだときに Rails
            の中で検証・コールバック・SQL がどの順に実行されるかを、Rails のコードと実測で確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'call-chain',
      title: 'save が通るモジュール',
      body: (
        <>
          <p>
            <ChapterLink n={11} section="crud" />で、<code>save</code> は検証に失敗すると SQL を実行せずに false を返し、<code>save!</code> は例外を投げることを確かめました。この章では、その動作が
            Rails の中でどう作られているかを見ます。
          </p>
          <p>
            <code>save</code> は1つのメソッドではなく、ActiveRecord::Base に include された複数のモジュールが同じ名前で定義し、<code>super</code> でつないでいます（<ChapterLink n={3} />
            ）。デモのアプリケーションで、Article の <code>save</code> などを <code>super_method</code>（super で次に呼ばれるメソッドを返す Ruby のメソッド）でたどりました。
          </p>
          <Code
            lang="text"
            code={`
save:
  ActiveRecord::Suppressor      (suppressor.rb:51)
  ActiveRecord::Transactions    (transactions.rb:383)
  ActiveRecord::Validations     (validations.rb:47)
  ActiveRecord::Persistence     (persistence.rb:390)
create_or_update:
  ActiveRecord::Timestamp       (timestamp.rb:125)
  ActiveRecord::Callbacks       (callbacks.rb:439)
  ActiveRecord::Persistence     (persistence.rb:923)
_create_record:
  ActiveRecord::Timestamp       (timestamp.rb:107)
  ActiveRecord::Callbacks       (callbacks.rb:443)
  ActiveRecord::AttributeMethods::Dirty  (attribute_methods/dirty.rb:239)
  ActiveRecord::Encryption::EncryptableRecord
  ActiveRecord::Locking::Optimistic      (locking/optimistic.rb:78)
  ActiveRecord::CounterCache             (counter_cache.rb:227)
  ActiveRecord::Persistence     (persistence.rb:952)
`}
          />
          <p>
            この一覧は、<ChapterLink n={1} section="find-source" />の方法（<code>super_method</code> を nil になるまで繰り返し呼ぶ）で出したものです。各行は、そのメソッドを定義しているモジュールと、定義のあるファイルと行です。上の行のメソッドが{' '}
            <code>super</code> を呼ぶと、すぐ下の行のメソッドが実行されます。
          </p>
          <p>
            次の図は上の一覧の3つのメソッドを左から列に並べたものです。左の列の Suppressor から下へ super をたどり、列の一番下の Persistence から、太い矢印で次の列の一番上へ移ります。
          </p>
          <Figure
            title="save から INSERT までの super の連鎖"
            caption="上の一覧を図にしたもの。モジュール名の ActiveRecord:: とファイルの行は省略している。太い枠はこの章でコードを引用して読むモジュール。更新のときは、中央の列の Persistence から _update_record の連鎖に進む（図では省略）。"
          >
            <SuperChainFigure />
          </Figure>
          <p>
            一覧が <code>save</code>・<code>create_or_update</code>・<code>_create_record</code> の3つに分かれているのは、メソッドの名前が途中で変わるためです。<code>save</code> の一番下にある Persistence の{' '}
            <code>save</code> は <code>create_or_update</code> を呼び、<code>create_or_update</code> の一番下にある Persistence の定義は、新規作成なら <code>_create_record</code>
            、更新なら <code>_update_record</code> を呼びます。3つのメソッドのどれも、複数のモジュールが同じ名前で定義して <code>super</code>{' '}
            でつないでいます。各モジュールがこの連鎖の中でしていることは次のとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>モジュール</th>
                  <th>この連鎖の中でしていること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Suppressor</td>
                  <td>
                    <code>Article.suppress {'{ … }'}</code> のブロックの中で呼ばれたときだけ、保存せずに true を返す。それ以外は何もせずに super を呼ぶ
                  </td>
                </tr>
                <tr>
                  <td>Transactions</td>
                  <td>内側をトランザクションの中で実行する</td>
                </tr>
                <tr>
                  <td>Validations</td>
                  <td>検証し、通らなければ内側を呼ばない</td>
                </tr>
                <tr>
                  <td>Callbacks</td>
                  <td>before_save や after_create などのコールバックを、内側の前後で実行する</td>
                </tr>
                <tr>
                  <td>Timestamp</td>
                  <td>
                    <code>created_at</code>・<code>updated_at</code> に現在の時刻を入れる
                  </td>
                </tr>
                <tr>
                  <td>Dirty</td>
                  <td>
                    保存が終わった後で、属性の変更の記録（<ChapterLink n={11} section="dirty" />）を保存済みの状態に切り替える
                  </td>
                </tr>
                <tr>
                  <td>Encryption::EncryptableRecord</td>
                  <td>暗号化を宣言した属性を、INSERT する列に必ず含める</td>
                </tr>
                <tr>
                  <td>Locking::Optimistic</td>
                  <td>
                    楽観的ロックの列（<code>lock_version</code>。<ChapterLink n={15} section="optimistic" />）を、INSERT する列に必ず含める
                  </td>
                </tr>
                <tr>
                  <td>CounterCache</td>
                  <td>
                    INSERT の後で、counter_cache を指定した関連の親の件数の列を1増やす（<ChapterLink n={13} section="counter-inverse" />）
                  </td>
                </tr>
                <tr>
                  <td>Persistence</td>
                  <td>
                    <code>save</code> から <code>create_or_update</code> を呼び、新規作成か更新かを判定して、INSERT か UPDATE を送る
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            この節では、保存の順序を決めている Transactions・Validations・Callbacks・Persistence の4つを読みます。外側から順に見ていきます。Transactions の <code>save</code>{' '}
            は、内側をトランザクションの中で呼びます。次の引用では、内側（検証から INSERT まで）がどの行で実行されるかと、その戻り値が偽のときに何が起きるかを確かめます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/transactions.rb（383〜385行目、431〜448行目）"
            href={`${GH}/activerecord/lib/active_record/transactions.rb#L431-L448`}
            code={`
    def save(**) # :nodoc:
      with_transaction_returning_status { super }
    end

    def with_transaction_returning_status
      self.class.with_connection do |connection|
        connection.pool.with_pool_transaction_isolation_level(ActiveRecord.default_transaction_isolation_level, connection.transaction_open?) do
          status = nil
          ensure_finalize = !connection.transaction_open?

          connection.transaction do
            add_to_transaction(ensure_finalize || has_transactional_callbacks?)
            remember_transaction_record_state

            status = yield
            raise ActiveRecord::Rollback unless status
          end
          @_last_transaction_return_status = status
          status
        end
      end
    end
`}
          />
          <ul>
            <li>
              <code>def save(**)</code> は、括弧の中の2つのアスタリスクで、<code>validate: false</code> のようなキーワード引数を名前を付けずに受け取ります。引数を書かない <code>super</code>{' '}
              は、受け取った引数をそのまま次の <code>save</code>（Validations の定義）に渡します。<code>{'{ super }'}</code> はブロックなので、この行ではまだ実行されません。
            </li>
            <li>
              <code>with_transaction_returning_status</code> の最初の2行（<code>with_connection</code> と <code>with_pool_transaction_isolation_level</code>
              ）は、データベースへの接続を取り出し、トランザクションの分離レベルを指定する処理です。保存の順序には関係しません（接続と分離レベルは
              <ChapterLink n={15} />）。
            </li>
            <li>
              <code>connection.transaction do … end</code> が、ブロックの中をトランザクションとして実行します。
            </li>
            <li>
              <code>status = yield</code> の <code>yield</code> が、<code>save</code> から渡されたブロック <code>{'{ super }'}</code>{' '}
              を実行します。検証、コールバック、INSERT はすべてこの1行の中で実行され、その結果（true か false）が <code>status</code> に入ります。
            </li>
            <li>
              最後の行の <code>status</code> が、このメソッドの戻り値です。<code>save</code> はそれをそのまま返します。
            </li>
          </ul>
          <p>
            内側が false を返すと <code>ActiveRecord::Rollback</code>（トランザクションを取り消すための Rails の例外）を投げてトランザクションを取り消します。この例外は <code>transaction</code>{' '}
            メソッドの中で受け止められるので、<code>save</code> を呼んだ側には届きません。呼んだ側には、戻り値の false だけが返ります。<code>add_to_transaction</code> は、このレコードを現在のトランザクションに登録する処理で、COMMIT
            の後に after_commit（<Term en="transaction callbacks">トランザクションのコールバック</Term>）を呼ぶために使われます
            <Ref n={1} />。その内側の Validations と Persistence は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/validations.rb（47〜49行目）・persistence.rb（390〜394行目、923〜928行目）"
            href={`${GH}/activerecord/lib/active_record/validations.rb#L47-L49`}
            code={`
    # validations.rb
    def save(**options)
      perform_validations(options) ? super : false
    end

    # persistence.rb
    def save(**options, &block)
      create_or_update(**options, &block)
    rescue ActiveRecord::RecordInvalid
      false
    end

      def create_or_update(**, &block)
        _raise_readonly_record_error if readonly?
        return false if destroyed?
        result = new_record? ? _create_record(&block) : _update_record(&block)
        result != false
      end
`}
          />
          <p>
            検証に通らなければ、Persistence の <code>save</code> を呼ばずに false を返します。通れば <code>create_or_update</code> が新規なら <code>_create_record</code>、既存なら{' '}
            <code>_update_record</code> を呼びます
            <Ref n={2} />。引用の中の次の4か所が、save の動作を決めています。
          </p>
          <ul>
            <li>
              <code>perform_validations(options) ? super : false</code> は、<code>perform_validations</code> が真なら <code>super</code>（Persistence の <code>save</code>
              ）を呼び、偽なら false を返します。<code>perform_validations</code> は <code>valid?</code> を呼ぶメソッドで、<code>save(validate: false)</code>{' '}
              と呼ばれたときだけ、検証せずに真を返します。
            </li>
            <li>
              Persistence の <code>save</code> の <code>rescue ActiveRecord::RecordInvalid</code> は、<code>create_or_update</code> の中でこの例外が起きたときに false
              を返します。たとえば、コールバックの中で別のレコードを <code>save!</code> して、そのレコードが検証に通らなかった場合です。
            </li>
            <li>
              <code>new_record?</code> は、まだ INSERT していないレコードで真になります。<code>Article.new</code> で作ったレコードは <code>_create_record</code> に、
              <code>Article.find</code> などで読み込んだレコードは <code>_update_record</code> に進みます。
            </li>
            <li>
              <code>result != false</code> は、内側の結果を true か false に直す式です。<code>_create_record</code> は id を、<code>_update_record</code>{' '}
              は更新した行数を返すので、内側が false を返したとき以外は true になります。<code>save</code> が id ではなく true を返すのはこの行のためです。
            </li>
          </ul>
          <p>
            Callbacks モジュールは、<code>_create_record</code>・<code>_update_record</code> と <code>create_or_update</code> をコールバックで包んでいます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/callbacks.rb（439〜449行目）"
            href={`${GH}/activerecord/lib/active_record/callbacks.rb#L439-L449`}
            code={`
    def create_or_update(**)
      _run_save_callbacks { super }
    end

    def _create_record
      _run_create_callbacks { super }
    end

    def _update_record
      _run_update_callbacks { record_update_timestamps { super } }
    end
`}
          />
          <p>
            <code>_run_save_callbacks</code> は、<ChapterLink n={5} />で見た ActiveSupport::Callbacks が <code>define_model_callbacks :save</code> から生成したメソッドです
            <Ref n={3} />。<code>{'_run_save_callbacks { super }'}</code> は、before_save のコールバック、ブロック、after_save のコールバックの順に実行します。ブロックの中の{' '}
            <code>super</code> は Persistence の <code>create_or_update</code> です。そこから呼ばれる <code>_create_record</code> も Callbacks の定義が先に見つかるので、INSERT は
            before_create と after_create の間で送られます。before のコールバックが保存を中断したときは、<code>_run_save_callbacks</code>{' '}
            はブロックを実行せずに false を返します（「保存の中断」の節）。
          </p>
          <p>ここまでをまとめると図 24-3 のようになります。外側の枠から内側へ、呼ばれる順に並べています。内側の処理が終わると、逆の順に外側へ戻ります。</p>
          <Figure n="24-3" title="save の入れ子" caption="新規作成の場合。Rails 8.1.4.1 の transactions.rb・validations.rb・callbacks.rb・persistence.rb を読んでまとめた模式図。Timestamp や Dirty などの層は省略している。">
            <NestFigure />
          </Figure>
          <p>この入れ子から、業務のコードで起きる次の動作を説明できます。</p>
          <ul>
            <li>
              before_save は Validations より内側にあるので、検証の後に呼ばれます。before_save で値を補っても、その値は検証に間に合いません。空のときに既定の値を入れるような処理は
              before_validation に書きます。
            </li>
            <li>検証に通らなかったときは Validations より内側が呼ばれないので、before_save も after_save も実行されません。</li>
            <li>
              after_save と after_create は Transactions の内側にあるので、呼ばれた時点ではまだ COMMIT されていません（「after_save と after_commit」の節）。
            </li>
            <li>検証も Transactions の内側にあるので、検証が送る SELECT は save のトランザクションの中で実行されます（「一意性の検証と競合」の節）。</li>
          </ul>
          <p>
            コールバックや INSERT の中で例外が起きると、バックトレース（例外が起きた時点で呼び出し中だったメソッドの一覧）には、persistence.rb、callbacks.rb、validations.rb、transactions.rb
            の <code>save</code> や <code>create_or_update</code> の行が内側から順に並びます。この並びは上の連鎖と同じです。調査では、その前後にあるアプリケーションの行（app/
            で始まるパス）を探すと、例外を起こしたコールバックと、save を呼んだ場所が分かります。
          </p>
        </>
      ),
    },
    {
      id: 'callback-order',
      title: 'コールバックの実行順と SQL',
      body: (
        <>
          <p>
            Article に保存に関わる主なコールバックを登録し、コールバックと SQL を実行順に同じ一覧に記録しました。around のコールバックはブロックを呼ぶ前と後に記録しています。
          </p>
          <Code
            lang="text"
            code={`
--- Article.create!(title: "新規", author_id: 1)
  before_validation
  after_validation
  before_save
  around_save（前）
  before_create
  around_create（前）
    SQL BEGIN
    SQL INSERT INTO \`articles\` (\`title\`, \`body\`, \`published\`, \`created_at\`, \`updated_at\`, \`author_id\`, ...
  around_create（後）
  after_create
  around_save（後）
  after_save
    SQL COMMIT
  after_commit
--- a.update!(title: "更新")
  before_validation
  after_validation
  before_save
  around_save（前）
  before_update
    SQL BEGIN
    SQL UPDATE \`articles\` SET \`articles\`.\`title\` = '更新', ...
  after_update
  around_save（後）
  after_save
    SQL COMMIT
  after_commit
`}
          />
          <Figure n="24-4" title="create! のコールバックと SQL" caption="上の実行結果を図にしたもの（Rails 8.1.4.1、MySQL 8.4.13）。">
            <TimelineFigure />
          </Figure>
          <p>この結果から、次のことが分かります。</p>
          <ul>
            <li>検証のコールバックが先に、save のコールバックがその後に、create（または update）のコールバックがさらに内側で実行されます。Rails ガイドに書かれた順と同じです <Ref n={4} />。</li>
            <li>
              BEGIN が送られたのは INSERT の直前でした。Rails の上では <code>save</code> の最初にトランザクションを開始していますが、実際の BEGIN は最初の SQL を送るときまで遅らせています。検証が失敗した場合や、変更が無くて UPDATE
              しない場合は、BEGIN も送られません（<ChapterLink n={11} />の2回目の <code>save!</code>）。
            </li>
            <li>after_save は COMMIT の前、つまりトランザクションの中で実行され、after_commit は COMMIT の後に実行されます。</li>
            <li>
              around_save（前）から around_save（後）までの間に、create のコールバックと INSERT が入っています。図 24-3 で、save のコールバックの層が create
              のコールバックの層を包んでいるのと同じ並びです。
            </li>
          </ul>
          <p>
            コールバックに書いた処理が期待した時点で動いているかを調べるときは、開発環境のログ（log/development.log）で、その処理が出したログの行と BEGIN・INSERT・COMMIT
            の行の前後を見ます。処理の行が COMMIT より前にあれば、その処理はトランザクションの中で実行されています。
          </p>
        </>
      ),
    },
    {
      id: 'validations',
      title: 'バリデーション',
      body: (
        <>
          <p>
            <code>valid?</code> は、検証のコールバック（<code>validates</code> で登録したもの）を実行し、<code>errors</code> が空かどうかを返します（<code>validations.rb</code> の 69〜73
            行目）
            <Ref n={2} />。デモでは <code>validates :title, presence: true</code> を加え、空のタイトルで <code>save</code> すると、before_validation と after_validation
            だけが実行されて false が返り、SQL は1つも送られませんでした。<code>errors.full_messages</code> は <code>["Title can't be blank"]</code> でした。
          </p>
          <p>
            検証の中には SQL を実行するものがあります。<code>belongs_to</code> は既定で相手の存在を検証し（<code>belongs_to_required_by_default</code>）、外部キーだけが設定されていると、相手を読み込んで確かめます。
            <code>belongs_to_required_by_default</code> は <code>load_defaults 5.0</code> 以降で true になる設定です。<code>belongs_to :article, optional: true</code>{' '}
            と書いた関連では、この検証は実行されません。
          </p>
          <Code
            lang="text"
            code={`
Comment.new(body: "x").valid?                     # => false  ["Article must exist"]
Comment.new(body: "x", article_id: 1).valid?      # => true
  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 1 LIMIT 1
Comment.new(body: "x", article_id: 999999).valid? # => false  ["Article must exist"]
`}
          />
          <p>
            1行目は article_id が nil なので、SELECT を送らずに「Article must exist」になります。2行目は article_id が 1 なので、articles テーブルから id が 1 の行を SELECT
            し、見つかったので検証に通りました。3行目も同じ形の SELECT を送りますが（上の出力には載せていません）、id が 999999 の行が無いので、1行目と同じエラーになります。
          </p>
          <p>
            コメントを大量に作る処理では、この確認の SELECT が1件ごとに実行されます。親のレコードを読み込んでから <code>article.comments.build</code> のように関連を通して作れば、読み込み済みの親が使われます。
          </p>
          <p>
            <code>validates :views_count, numericality: true</code> のような数値の検証は、型変換の前の値（<code>views_count_before_type_cast</code>）を調べます。
            <ChapterLink n={11} />で見たとおり、<code>"abc"</code> は Integer の型変換で 0 になりますが、検証では数値でないと判定されます。
          </p>
        </>
      ),
    },
    {
      id: 'validation-design',
      title: "入力の検証と固有の規則を書く",
      body: (
        <>
          <p>
            <code>validates</code> には空欄と数値の確認以外にも、よく使う条件が揃っています。たとえば <code>length: &#123; maximum: 120 &#125;</code> は長さ、<code>format: &#123; with: /\A[a-z0-9-]+\z/ &#125;</code> は文字の形式、<code>inclusion: &#123; in: %w[public private] &#125;</code> は候補への所属、<code>comparison: &#123; greater_than: :starts_at &#125;</code> は別の属性との比較です。<code>allow_nil: true</code> は <code>nil</code>、<code>allow_blank: true</code> は空文字なども含めた空の値のときにその検証を省きます。<Ref n={10} />
          </p>
          <p>
            公開済みの記事だけ本文が必須なら <code>validates :body, presence: true, if: :published?</code> と書けます。<code>on: :create</code> で作成時だけ、<code>on: :publish</code> のような独自の文脈では <code>valid?(:publish)</code> や <code>save(context: :publish)</code> でその検証を呼びます。どの保存経路でも守るべき条件は特定の画面や文脈に閉じ込めず、DB の制約（NOT NULL や一意の索引など）も組み合わせます。<Ref n={10} />
          </p>
          <Code
            lang="ruby"
            title={"同じレコードの複数属性を照合する例"}
            code={`
class Article < ApplicationRecord
  validate :publication_window

  private

  def publication_window
    return unless publish_at && expires_at && expires_at <= publish_at

    errors.add(:expires_at, "は公開日時より後にしてください")
  end
end
`}
          />
          <p>
            <code>validate</code>（末尾に s が無い）は、検証のときに呼ぶメソッドを登録します。<code>validates</code> が属性と規則の種類を指定するのに対して、<code>validate</code>{' '}
            では規則をメソッドの中に自分で書きます。メソッドの中で <code>errors.add(属性, 文)</code> を呼ぶと問題が1件記録され、<code>valid?</code> は false
            になります。上の例では、公開日時（publish_at）と期限（expires_at）の両方に値があり、期限が公開日時以前のときだけ、expires_at に問題を記録します。何も記録しなければ、この規則には通ったことになります。
          </p>
          <p>
            同じ属性の検証を複数モデルで使うときは <code>ActiveModel::EachValidator</code> を継承し、<code>validate_each(record, attribute, value)</code> に規則を書けます。規則が単一モデルに固有なら <code>validate</code> のメソッドに書くほうが、どこで使われるかを把握しやすくなります。<Ref n={10} />
          </p>
          <Code
            lang="ruby"
            title="EachValidator を継承した検証と、その使い方（Rails ガイドの例をもとにした形）"
            code={`
# app/validators/email_validator.rb
class EmailValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    unless URI::MailTo::EMAIL_REGEXP.match?(value)
      record.errors.add(attribute, options[:message] || "is not an email")
    end
  end
end

class Author < ApplicationRecord
  validates :email, presence: true, email: true
end
`}
          />
          <p>
            <code>validates</code> に <code>email: true</code> と書くと、Rails はキーの名前から EmailValidator というクラスを探し、email 属性の値を{' '}
            <code>validate_each</code> に渡します。引数の record は検証中のレコード、attribute は属性の名前（:email）、value はその属性の値です。問題があれば、<code>validate</code>{' '}
            のメソッドと同じように <code>record.errors.add</code> で記録します。
          </p>
        </>
      ),
    },
    {
      id: 'uniqueness',
      title: '一意性の検証と競合',
      body: (
        <>
          <p>
            <code>validates :email, uniqueness: true</code> は、同じ値の行があるかを SELECT で調べます。
          </p>
          <Code
            lang="text"
            code={`
Author.new(name: "x", email: "author1@example.com").valid?   # => false ["Email has already been taken"]
  SELECT 1 AS one FROM \`authors\` WHERE \`authors\`.\`email\` = 'author1@example.com' LIMIT 1
`}
          />
          <p>
            この確認と INSERT の間には時間の差があるので、同時に同じ値を保存すると、両方が確認に通ることがあります。同時の保存は、たとえば利用者が登録のボタンを続けて2回押し、同じ内容の要求が2つ届いたときに起こります。デモでは、検証の後に 0.3 秒待つコールバックを入れ、2つのスレッド（1つのプロセスの中で並行して進む処理の流れ。<ChapterLink n={23} section="thread" />）から同じメールアドレスで{' '}
            <code>Author.create!</code> を実行しました。
          </p>
          <Code
            lang="text"
            code={`
結果: ["成功", "ActiveRecord::RecordNotUnique: Mysql2::Error: Duplicate entry 'race@example.com'
       for key 'authors.index_authors_on_email'"]
  T1: BEGIN
  T1: SELECT 1 AS one FROM \`authors\` WHERE \`authors\`.\`email\` = 'race@example.com' LIMIT 1
  T1: INSERT INTO \`authors\` (\`name\`, \`email\`, \`created_at\`, \`updated_at\`) VALUES ('競合0', 'race@example.com', ...
  T1: COMMIT
  T2: BEGIN
  T2: SELECT 1 AS one FROM \`authors\` WHERE \`authors\`.\`email\` = 'race@example.com' LIMIT 1
  T2: INSERT INTO \`authors\` (\`name\`, \`email\`, \`created_at\`, \`updated_at\`) VALUES ('競合1', 'race@example.com', ...
  T2: ROLLBACK
`}
          />
          <Figure n="24-5" title="一意性の検証の競合" caption="上の実行結果を図にしたもの。ログはスレッドごとに並べ替えている。">
            <RaceFigure />
          </Figure>
          <p>
            1行目の「結果」は、2つのスレッドの <code>create!</code> の結果です。片方は成功し、もう片方は例外になりました。その下は各スレッドが送った SQL です。T1 も T2 も、BEGIN の次に検証の
            SELECT を送っています。検証は save のトランザクションの中で実行され（図 24-3）、この SELECT がそのトランザクションの最初の SQL だからです。どちらの SELECT も、相手の INSERT
            より前に実行されたので0件でした（図 24-5）。
          </p>
          <p>
            両方のスレッドが検証に通り、2件目の INSERT は authors テーブルの一意の索引（<code>index_authors_on_email</code>）で止められました。Rails ガイドも、uniqueness
            の検証はデータベースに一意性の制約を作らないので、別々の接続から同じ値を保存できてしまうと説明し、一意の索引を作るよう求めています
            <Ref n={5} />。索引があれば、重複は <code>ActiveRecord::RecordNotUnique</code> として検出できます。利用者に検証エラーとして見せたい場合は、この例外を rescue して{' '}
            <code>errors</code> に追加します。
          </p>
          <Code
            lang="ruby"
            title="RecordNotUnique を検証エラーと同じ表示にする書き方の例"
            code={`
  def create
    @author = Author.new(author_params)

    if @author.save
      redirect_to @author
    else
      render :new, status: :unprocessable_content
    end
  rescue ActiveRecord::RecordNotUnique
    @author.errors.add(:email, :taken)
    render :new, status: :unprocessable_content
  end
`}
          />
          <p>
            <code>save</code> は検証の失敗では false を返しますが、一意の索引の違反は検証を通った後の INSERT で起きるので、false ではなく例外になります。<code>errors.add(:email, :taken)</code>{' '}
            は、uniqueness の検証が失敗したときと同じ「has already been taken」の問題を email に記録します。uniqueness
            の検証を書いたモデルで、本番のログに ActiveRecord::RecordNotUnique が出ているときは、まずこの競合を疑います。
          </p>
        </>
      ),
    },
    {
      id: 'halting',
      title: '保存の中断',
      body: (
        <>
          <p>
            before で始まるコールバックの中で <code>throw :abort</code> を実行すると、保存が中断されます（<ChapterLink n={5} />）。デモでは、<code>halt</code>{' '}
            属性が真なら中断する before_save を、記録用の around_save より後に登録しました。中断するコールバックは、たとえば次のように書きます。
          </p>
          <Code
            lang="ruby"
            title="条件に合うときに保存を中断する before_save の例"
            code={`
class Article < ApplicationRecord
  attr_accessor :halt          # データベースの列ではない、確認用の属性

  before_save :stop_if_halt

  private

  def stop_if_halt
    throw :abort if halt
  end
end
`}
          />
          <Code
            lang="text"
            code={`
c = Article.new(title: "中断"); c.halt = true
c.save    # => false
  before_validation
  after_validation
  before_save            ← 記録用の before_save
  around_save（前）
  around_save（後）      ← 中断した before_save は around_save より後に登録したので、その内側にある
c.save!   # => ActiveRecord::RecordNotSaved: Failed to save the record
`}
          />
          <p>
            create のコールバックと INSERT は実行されず、SQL は1つも送られませんでした。<code>save</code> は false を返し、<code>save!</code> は{' '}
            <code>ActiveRecord::RecordNotSaved</code> を投げます。検証の失敗で <code>save!</code> が投げるのは <code>ActiveRecord::RecordInvalid</code> なので、例外のクラスで原因を区別できます。around_save
            の後半が実行されているのは、<ChapterLink n={5} />で見た「around は、それより後に登録したコールバックと本体を包む」規則のとおりです。
          </p>
          <p>
            次の図は上の出力を実行された順に上から並べ、around_save が包む範囲を外側の枠で示したものです。中断した before_save は内側の枠（yield の中）にあり、throw :abort の後、処理は太い矢印のとおり around_save（後）に戻ります。
          </p>
          <Figure
            title="throw :abort で中断した save"
            caption="上の出力をもとにした模式図。外側の枠は記録用の around_save、内側の枠はその yield で実行される範囲。破線の箱は実行されなかった処理。"
          >
            <HaltAroundFigure />
          </Figure>
          <p>
            <code>save!</code> が RecordNotSaved を投げるのは、Persistence の <code>save!</code> が、<code>create_or_update</code> の戻り値が偽のときにこの例外を投げるためです。中断されると Callbacks の{' '}
            <code>create_or_update</code> が false を返すので、<code>||</code> の右側が実行されます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/persistence.rb（423〜425行目）"
            href={`${GH}/activerecord/lib/active_record/persistence.rb#L423-L425`}
            code={`
    def save!(**options, &block)
      create_or_update(**options, &block) || raise(RecordNotSaved.new("Failed to save the record", self))
    end
`}
          />
          <h3>save が false を返した理由を調べる</h3>
          <p>
            <code>throw :abort</code> は <code>errors</code> に何も記録しません。そのため、中断された save は false を返しますが、<code>errors.full_messages</code>{' '}
            は空の配列です。save が false を返したときは、次の順に確かめます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>errors の状態</th>
                  <th>false になった理由</th>
                  <th>次に確かめること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>errors.full_messages</code> に文がある
                  </td>
                  <td>検証に通らなかった</td>
                  <td>文が示す属性の値と、その属性の validates の規則</td>
                </tr>
                <tr>
                  <td rowSpan={2}>
                    <code>errors</code> が空
                  </td>
                  <td>
                    before のコールバックが <code>throw :abort</code> を実行した
                  </td>
                  <td>
                    モデルと、モデルが include しているモジュールの中の <code>throw :abort</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    コールバックの中で、別のレコードの <code>save!</code> や <code>create!</code> が RecordInvalid を投げた（「save が通るモジュール」の節で読んだ Persistence の{' '}
                    <code>save</code> の rescue）
                  </td>
                  <td>
                    同じ値で <code>save!</code> を呼び、例外のメッセージとバックトレースを見る
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>errors</code> が空のときは、<code>save</code> を <code>save!</code> に変えて実行すると、例外のクラスで2つの理由を区別できます。before_save・before_create・before_update
            での中断なら RecordNotSaved、別のレコードの検証の失敗なら、そのレコードの RecordInvalid です。どのコールバックが登録されているかは、Rails コンソールで次の式を実行すると分かります。before_save
            に登録したメソッドの名前（ブロックで登録したものは Proc）を、登録した順に並べた配列が返ります。Rails や gem が登録したコールバックが含まれることもあります。
          </p>
          <Code
            lang="ruby"
            title="before_save に登録されているコールバックの一覧を取り出す式"
            code={`
Article._save_callbacks.select { |cb| cb.kind == :before }.map(&:filter)
`}
          />
          <p>
            <code>_save_callbacks</code> は、<ChapterLink n={5} section="callbacks" />で見た、コールバックのチェーンを返すクラスメソッドです。create のコールバックなら{' '}
            <code>_create_callbacks</code>、検証のコールバックなら <code>_validation_callbacks</code> を使います。
          </p>
          <p>
            中断した理由を呼び出し側に伝えたいときは、<code>throw :abort</code> の前に <code>errors.add</code> で理由を記録します。<code>errors.add</code>{' '}
            だけでは保存は止まりません。before_save が呼ばれる時点では検証がすでに終わっていて、その後に <code>errors</code> を調べる処理が無いためです。
          </p>
          <Code
            lang="ruby"
            title="理由を errors に記録してから中断する書き方"
            code={`
  def stop_if_halt
    return unless halt

    errors.add(:base, "halt が真のため保存を中断しました")
    throw :abort
  end
`}
          />
        </>
      ),
    },
    {
      id: 'insert-update',
      title: 'INSERT と UPDATE の中身',
      body: (
        <>
          <p>一番内側の Persistence の <code>_create_record</code> は次のとおりです。</p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/persistence.rb（952〜975行目）"
            href={`${GH}/activerecord/lib/active_record/persistence.rb#L952-L975`}
            code={`
      def _create_record(attribute_names = self.attribute_names)
        attribute_names = attributes_for_create(attribute_names)

        self.class.with_connection do |connection|
          returning_columns = self.class._returning_columns_for_insert(connection)

          returning_values = self.class._insert_record(
            connection,
            attributes_with_values(attribute_names),
            returning_columns
          )

          returning_columns.zip(returning_values).each do |column, value|
            _write_attribute(column, type_for_attribute(column).deserialize(value)) if !_read_attribute(column)
          end if returning_values
        end

        @new_record = false
        @previously_new_record = true

        yield(self) if block_given?

        id
      end
`}
          />
          <p>
            デモの INSERT には、値を代入していない列も含めてすべての列が入っていました。<code>load_defaults 7.0</code>（どのバージョンの Rails の既定の設定を使うかを決める config/application.rb の指定）以降は <code>partial_inserts</code>{' '}
            が false で、新規作成では列を絞らないためです（デモでも <code>Article.partial_inserts?</code> は false、<code>partial_updates?</code> は true）
            <Ref n={6} />。MySQL は INSERT の RETURNING（INSERT した行の列の値を結果として返す SQL の指定）に対応していないので（Rails の MySQL アダプターでは MariaDB 10.5 以上だけが対応）、主キーの値は接続が返す最後の挿入 ID（AUTO_INCREMENT の列に MySQL が割り当てた値）から設定されます。
            <code>created_at</code>・<code>updated_at</code> は、Timestamp モジュールの <code>_create_record</code> がこの前に設定しています。UPDATE で変更した列だけが送られる仕組みは
            <ChapterLink n={11} />で見たとおりです。
          </p>
        </>
      ),
    },
    {
      id: 'skip',
      title: '検証とコールバックを通らないメソッド',
      body: (
        <>
          <p>
            Rails ガイドは、コールバックを実行しないメソッドとして <code>update_column</code>・<code>update_columns</code>・<code>update_all</code>・<code>insert_all</code>・
            <code>upsert_all</code>・<code>delete</code>・<code>delete_all</code>・<code>increment!</code>・<code>touch_all</code> などを、検証を実行しないメソッドとして同様のものと{' '}
            <code>save(validate: false)</code> などを挙げています
            <Ref n={4} />
            <Ref n={5} />。デモでの SQL は次のとおりです。
          </p>
          <Code
            lang="text"
            code={`
a.update_column(:title, "列だけ")      # コールバックの記録なし
  UPDATE \`articles\` SET \`articles\`.\`title\` = '列だけ' WHERE \`articles\`.\`id\` = 10002 AND \`articles\`.\`lock_version\` = 1
Article.where(id: a.id).update_all(views_count: 5)
  UPDATE \`articles\` SET \`articles\`.\`views_count\` = 5,
         \`articles\`.\`lock_version\` = COALESCE(\`articles\`.\`lock_version\`, 0) + 1 WHERE \`articles\`.\`id\` = 10002
`}
          />
          <p>
            <code>update_column</code> は <code>updated_at</code> も更新しません。<code>update_all</code> には、楽観的ロックの列（更新のたびに1増やして、同時の更新を見つけるための番号の列。<ChapterLink n={15} section="optimistic" />
            ）があるモデルでは、指定していなくても <code>lock_version</code> を1増やす処理が入っています（<code>relation.rb</code> の 619〜625 行目）
            <Ref n={7} />。実際にデモでは、<code>update_all</code> の後に、それ以前に読み込んでいたレコードを <code>update!</code> すると <code>ActiveRecord::StaleObjectError</code>{' '}
            になりました。<code>insert_all</code> や <code>delete_all</code> はコールバックを通らないので、counter_cache の列（<ChapterLink n={13} />
            ）も更新されません。これらのメソッドは速い代わりに、モデルに書いた規則を通らないことを前提に使います。
          </p>
        </>
      ),
    },
    {
      id: 'after-commit',
      title: 'after_save と after_commit',
      body: (
        <>
          <p>
            下のコードでは、記事のタイトルを <code>update!</code> した後も、外側の <code>transaction</code> ブロックが続きます。ログの「ブロックの最後」を目印に、2つのコールバックがどこで呼ばれるかを追ってください。
          </p>
          <Code
            lang="text"
            code={`
ActiveRecord::Base.transaction do
  a.update!(title: "外側のトランザクション内")
  # （ブロックの最後）
end
  before_validation / after_validation / before_save / around_save（前） / before_update
    SQL BEGIN
    SQL UPDATE \`articles\` SET ...
  after_update / around_save（後） / after_save
  （ブロックの最後）
    SQL COMMIT
  after_commit
`}
          />
          <Figure n="24-6" title="外側のトランザクションと after_commit" caption="上の実行結果を図にしたもの。">
            <OuterTxFigure />
          </Figure>
          <p>
            <code>after_save</code> は UPDATE の直後、「ブロックの最後」より前にあります。ここで更新通知を送ると、ブロックの残りで例外が起きてタイトルが元に戻っても、通知は相手に届いてしまいます。
            <code>after_commit</code> はログの <code>SQL COMMIT</code> の後にあります。こちらから通知を送れば、記事の変更が取り消された場合には通知の処理も呼ばれません。<Ref n={4} />
            ジョブで更新後の記事を読む場合の例は<ChapterLink n={18} section="transaction" />にあります。
          </p>
          <Callout kind="v72">
            <p>
              save の入れ子、コールバックの順、検証の仕組みは Rails 7.2.4 でも同じです。ActiveJob の <code>enqueue_after_transaction_commit</code> は、7.2 の <code>load_defaults 7.2</code>{' '}
              ではアプリケーション全体の設定として <code>:default</code> が入ります
              <Ref n={8} />。8.1 ではアプリケーション全体の設定が削除され、ジョブのクラスごとの設定（既定は false）になっています（activejob の CHANGELOG）。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'callback-boundaries',
      title: "永続化の近くに置く処理と公開のような業務操作",
      body: (
        <>
          <p>
            保存のたびに必要な正規化なら、<code>normalizes :email, with: -&gt;(value) &#123; value.strip.downcase &#125;</code> のような属性の宣言や、必要に応じて <code>before_validation</code> に置けます。公開や承認のように、実行者・許可・日時の意味を持つ操作には <code>publish!(actor:)</code> のようなメソッドを用意すると、呼び出し側から何が起こるかを読めます。複数モデルの更新をコールバックで連鎖させる構成では、直接保存する経路と一括 SQL の経路で作用がずれることにも注意します。<Ref n={11} />
          </p>
          <p>
            <code>after_create_commit</code>、<code>after_update_commit</code>、<code>after_destroy_commit</code> は確定した操作の種類を絞るために使えます。コミット後のジョブへ通知を移した場合も、確定とジョブ投入の間の失敗はあり得ます。通知の記録まで確実に残す設計は <ChapterLink n={34} section="external-boundaries">外部決済・部分失敗・再実行の設計</ChapterLink>で扱います。<Ref n={11} />
          </p>
          <p>
            保存の検証を通さない操作にも違いがあります。<code>touch</code> はタイムスタンプを更新し、<code>after_touch</code> など対応するコールバックを通ります。<code>increment!</code> は数値列を DB で増やす操作で、通常の保存時の検証とコールバックを通りません。一括更新でカウンターやキャッシュの無効化がずれないかも、採用した経路で確認します。<Ref n={11} />
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>validates で書いた規則は valid? と save で確かめられ、問題は errors に記録されます。検証に通らなければ save は SQL を送らずに false を返し、save! は RecordInvalid を投げます。</li>
          <li>コールバックは保存の決まった時点で呼ばれるメソッドです。before_validation は検証の前、after_create は INSERT の後、after_commit は COMMIT の後に呼ばれます。</li>
          <li>save は Transactions → Validations → Callbacks → Persistence の順の入れ子で、検証とコールバックはトランザクションの中で実行されます。BEGIN は最初の SQL の直前に送られます。</li>
          <li>コールバックは、検証、save、create（update）の順に内側へ入り、after_save は COMMIT の前、after_commit は COMMIT の後に実行されます。</li>
          <li>belongs_to の存在確認と uniqueness の検証は SELECT を実行します。uniqueness だけでは同時の保存で重複が起きるので、一意の索引が必要です。</li>
          <li>before のコールバックの throw :abort で保存は中断され、save は false、save! は RecordNotSaved になります。</li>
          <li>新規作成の INSERT にはすべての列が入り、UPDATE には変更した列だけが入ります。</li>
          <li>update_column・update_all・insert_all などは検証とコールバックを通りません。update_all は lock_version を自動で増やします。</li>
          <li>外部に影響する処理は after_commit に書きます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'activerecord/lib/active_record/transactions.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/transactions.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'save と with_transaction_returning_status、add_to_transaction。' },
    { title: 'activerecord/lib/active_record/validations.rb・persistence.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Validations の save と valid?、Persistence の save・create_or_update・_create_record・_update_record。' },
    { title: 'activerecord/lib/active_record/callbacks.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/callbacks.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'create_or_update・_create_record・_update_record をコールバックで包む実装。' },
    { title: 'Active Record Callbacks', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_record_callbacks.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'コールバックの順、コールバックを実行しないメソッドの一覧、after_commit を外部のシステムとのやり取りに使うこと。' },
    { title: 'Active Record Validations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_record_validations.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '検証を実行しないメソッドの一覧、uniqueness の検証はデータベースの制約を作らないので一意の索引が必要なこと。' },
    { title: 'railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/configuration.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'load_defaults 7.0 で active_record.partial_inserts = false になること。' },
    { title: 'activerecord/lib/active_record/relation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'update_all が楽観的ロックの列を自動で1増やす処理。' },
    { title: 'railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/railties/lib/rails/application/configuration.rb', accessed: '2026-11-11', version: 'Rails 7.2.4', note: 'load_defaults 7.2 で active_job.enqueue_after_transaction_commit = :default が入ること。8.1 での削除は activejob/CHANGELOG.md（8.1.0）。' },
    { title: 'railties の scaffold_controller と erb の scaffold のテンプレート', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/scaffold_controller/templates/controller.rb.tt`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'create アクションが save の戻り値で redirect_to と render :new（422）を分けること。フォームのテンプレート（erb/scaffold/templates/_form.html.erb.tt）が errors を full_message で並べること。生成されたファイルはデモで確かめた。' },
    { title: "Active Record Validations", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_record_validations.html", accessed: "2026-11-20", version: "Rails 8.1", note: "各種の検証、条件、カスタムの検証。" },
    { title: "Active Record Callbacks", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_record_callbacks.html", accessed: "2026-11-20", version: "Rails 8.1", note: "コールバック、確定後の処理とスキップされる経路。" },
  ],
}

export default withExplanations(ch14, explanation14)
