import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation14 } from '../explanations/database'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 14-1 save の入れ子 ---------- */
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
      id="14-1"
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

/* ---------- 図 14-2 create! のコールバックと SQL ---------- */
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
      id="14-2"
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

/* ---------- 図 14-3 一意性の検証の競合 ---------- */
function RaceFigure() {
  return (
    <Svg
      id="14-3"
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
      <line x1={150} y1={32} x2={150} y2={290} stroke="var(--fig-line)" strokeDasharray="3 4" />
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

/* ---------- 図 14-4 外側のトランザクションと after_commit ---------- */
function OuterTxFigure() {
  return (
    <Svg
      id="14-4"
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

const ch14: Chapter = {
  number: 14,
  part: 3,
  title: '保存処理：バリデーションとコールバック',
  summary:
    'save が Transactions・Validations・Callbacks・Persistence の各モジュールをどの順に通り、いつ SQL を送るかを、コールバックの実行順の実測とともに説明します。一意性の検証の競合、保存の中断、検証やコールバックを通らないメソッド、after_save と after_commit の使い分けも扱います。',
  goals: [
    'save が通るモジュールの順と、トランザクション・検証・コールバックの入れ子を説明できる',
    'create と update のコールバックの実行順と、BEGIN・COMMIT との前後関係を説明できる',
    '検証の失敗、belongs_to の存在確認、一意性の検証が実行する SQL を説明できる',
    'uniqueness の検証だけでは重複を防げない理由と、一意の索引の必要性を説明できる',
    'throw :abort による中断と、save・save! の戻り値の違いを説明できる',
    'update_column・update_all などがコールバックを通らないことと、after_commit を使う場面を説明できる',
  ],
  prerequisites: [5, 11],
  sections: [
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
            ）。デモのアプリケーションで、Article の <code>save</code> などを <code>super_method</code> でたどりました。
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
          <p>外側から順に見ていきます。Transactions の <code>save</code> は、内側をトランザクションの中で呼びます。</p>
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
          <p>
            内側が false を返すと <code>ActiveRecord::Rollback</code> を投げてトランザクションを取り消します。<code>add_to_transaction</code> は、このレコードを現在のトランザクションに登録する処理で、COMMIT
            の後に after_commit（<Term en="transaction callbacks">トランザクションのコールバック</Term>）を呼ぶために使われます
            <Ref n={1} />。その内側の Validations と Persistence は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/validations.rb（47〜49行目）・persistence.rb（923〜928行目）"
            href={`${GH}/activerecord/lib/active_record/validations.rb#L47-L49`}
            code={`
    # validations.rb
    def save(**options)
      perform_validations(options) ? super : false
    end

    # persistence.rb
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
            <Ref n={2} />。Callbacks モジュールは、この2つと <code>create_or_update</code> をコールバックで包んでいます。
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
            <Ref n={3} />。ここまでをまとめると図 14-1 のようになります。
          </p>
          <Figure n="14-1" title="save の入れ子" caption="新規作成の場合。Rails 8.1.4.1 の transactions.rb・validations.rb・callbacks.rb・persistence.rb を読んでまとめた模式図。Timestamp や Dirty などの層は省略している。">
            <NestFigure />
          </Figure>
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
          <Figure n="14-2" title="create! のコールバックと SQL" caption="上の実行結果を図にしたもの（Rails 8.1.4.1、MySQL 8.4.13）。">
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
          </ul>
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
            この確認と INSERT の間には時間の差があるので、同時に同じ値を保存すると、両方が確認に通ることがあります。デモでは、検証の後に 0.3 秒待つコールバックを入れ、2つのスレッドから同じメールアドレスで{' '}
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
          <Figure n="14-3" title="一意性の検証の競合" caption="上の実行結果を図にしたもの。ログはスレッドごとに並べ替えている。">
            <RaceFigure />
          </Figure>
          <p>
            両方のスレッドが検証に通り、2件目の INSERT は authors テーブルの一意の索引（<code>index_authors_on_email</code>）で止められました。Rails ガイドも、uniqueness
            の検証はデータベースに一意性の制約を作らないので、別々の接続から同じ値を保存できてしまうと説明し、一意の索引を作るよう求めています
            <Ref n={5} />。索引があれば、重複は <code>ActiveRecord::RecordNotUnique</code> として検出できます。利用者に検証エラーとして見せたい場合は、この例外を rescue して{' '}
            <code>errors</code> に追加します。
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
            属性が真なら中断する before_save を、記録用の around_save より後に登録しました。
          </p>
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
            デモの INSERT には、値を代入していない列も含めてすべての列が入っていました。<code>load_defaults 7.0</code> 以降は <code>partial_inserts</code>{' '}
            が false で、新規作成では列を絞らないためです（デモでも <code>Article.partial_inserts?</code> は false、<code>partial_updates?</code> は true）
            <Ref n={6} />。MySQL は INSERT の RETURNING に対応していないので（Rails の MySQL アダプターでは MariaDB 10.5 以上だけが対応）、主キーの値は接続が返す最後の挿入 ID から設定されます。
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
            <code>update_column</code> は <code>updated_at</code> も更新しません。<code>update_all</code> には、楽観的ロックの列（<ChapterLink n={15} />
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
            after_save はトランザクションの中で実行されます。外側で <code>ActiveRecord::Base.transaction</code> を使っている場合も同じで、デモでは update! の after_save
            がブロックの途中で、after_commit がブロックの終わりの COMMIT の後に実行されました。
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
          <Figure n="14-4" title="外側のトランザクションと after_commit" caption="上の実行結果を図にしたもの。">
            <OuterTxFigure />
          </Figure>
          <p>
            メールの送信、外部 API の呼び出し、ジョブの登録のように、データベースの外に影響する処理を after_save に書くと、その後にトランザクションがロールバックされても取り消せません。また、別のプロセスで動くジョブが、まだ
            COMMIT されていないレコードを読もうとして見つからないことがあります。Rails ガイドも、外部のシステムとやり取りする処理には after_commit を使うよう説明しています
            <Ref n={4} />。ジョブの登録を COMMIT の後に遅らせる ActiveJob の設定は<ChapterLink n={18} />で扱います。
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
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
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
  ],
}

export default withExplanations(ch14, explanation14)
