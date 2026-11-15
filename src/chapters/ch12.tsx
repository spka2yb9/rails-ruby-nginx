import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 12-1 Relation の値から SQL まで ---------- */
function ArelFigure() {
  return (
    <Svg
      id="12-1"
      w={760}
      h={330}
      label="Article.where(status: :published).order(published_at: :desc).limit(3) は、Relation の @values に where、order、limit の値を保存する。build_arel はそれを Arel の構文木に変換する。構文木の根は SelectStatement で、SelectCore の中に FROM と SELECT で取り出す列と WHERE の Equality があり、SelectStatement に ORDER の Descending と Limit がある。Equality の右辺は QueryAttribute で、enum の型により :published が 1 に変換される。MySQL 用の visitor が構文木をたどって SQL の文字列にする"
    >
      <Box x={20} y={20} w={226} h={130} fill="bg" lines={[]} />
      <T x={32} y={40} bold fs={12.5}>
        Relation の @values
      </T>
      <T x={32} y={66} mono fs={11.5}>
        where: status = :published
      </T>
      <T x={32} y={90} mono fs={11.5}>
        order: published_at DESC
      </T>
      <T x={32} y={114} mono fs={11.5}>
        limit: 3
      </T>
      <Arrow x1={246} y1={85} x2={318} y2={85} />
      <T x={283} y={74} mono fs={11} anchor="middle">
        build_arel
      </T>

      <Box x={320} y={20} w={420} h={210} fill="bg" lines={[]} />
      <T x={332} y={40} bold fs={12.5}>
        Arel の構文木
      </T>
      <Box x={440} y={52} w={180} h={30} lines="SelectStatement" mono fs={11.5} fill="box5" />
      <Box x={340} y={108} w={150} h={30} lines="SelectCore" mono fs={11.5} />
      <Box x={510} y={108} w={100} h={30} lines="Descending" mono fs={11} />
      <Box x={622} y={108} w={100} h={30} lines="Limit(3)" mono fs={11} />
      <Box x={330} y={172} w={90} h={30} lines="FROM articles" mono fs={10.5} fill="box4" />
      <Box x={428} y={172} w={90} h={30} lines="articles.*" mono fs={10.5} fill="box4" />
      <Box x={526} y={172} w={200} h={30} lines="Equality(status, QueryAttribute)" mono fs={10.5} fill="box4" />
      <Arrow x1={480} y1={82} x2={420} y2={106} plain />
      <Arrow x1={530} y1={82} x2={560} y2={106} plain />
      <Arrow x1={590} y1={82} x2={670} y2={106} plain />
      <Arrow x1={390} y1={138} x2={375} y2={170} plain />
      <Arrow x1={415} y1={138} x2={470} y2={170} plain />
      <Arrow x1={460} y1={138} x2={600} y2={170} plain />
      <T x={526} y={218} fs={11} tone="muted">
        :published → 1（enum の型で変換）
      </T>

      <Arrow x1={530} y1={230} x2={530} y2={262} />
      <T x={540} y={248} fs={11} mono>
        Arel::Visitors::MySQL
      </T>
      <Box x={20} y={266} w={720} h={50} lines={['SELECT `articles`.* FROM `articles` WHERE `articles`.`status` = 1', 'ORDER BY `articles`.`published_at` DESC LIMIT 3']} mono fs={11.5} fill="box4" />
    </Svg>
  )
}

/* ---------- 図 12-2 Relation の組み立てと読み込み ---------- */
function LifecycleFigure() {
  return (
    <Svg
      id="12-2"
      w={760}
      h={270}
      label="Article.where(author_id: 3) や limit(2) は、そのたびに Relation を複製して値を追加するだけで、SQL を実行しない。each や to_a などでレコードが必要になると load が呼ばれ、exec_queries が SQL を作って select_all で実行し、結果の行からレコードを作って @records に保存する。読み込み済みの Relation でもう一度 to_a を呼んでも SQL は実行されない。読み込み済みの Relation に where! で条件を追加しようとすると UnmodifiableRelation になる"
    >
      <T x={20} y={20} fs={12} tone="muted">
        組み立て（SQL は実行しない）
      </T>
      <Box x={20} y={32} w={150} h={40} lines="Article" mono fs={12} />
      <Arrow x1={170} y1={52} x2={208} y2={52} />
      <T x={189} y={42} fs={10.5} mono anchor="middle">
        where
      </T>
      <Box x={210} y={32} w={160} h={40} lines={['Relation', 'where: author_id=3']} mono fs={11} subTone="muted" />
      <Arrow x1={370} y1={52} x2={408} y2={52} />
      <T x={389} y={42} fs={10.5} mono anchor="middle">
        limit
      </T>
      <Box x={410} y={32} w={160} h={40} lines={['Relation（複製）', '+ limit: 2']} mono fs={11} subTone="muted" />

      <T x={20} y={110} fs={12} tone="muted">
        読み込み（each、to_a、first など）
      </T>
      <Box x={410} y={122} w={160} h={40} lines="load" mono fs={12} fill="box5" />
      <Arrow x1={490} y1={72} x2={490} y2={120} />
      <Arrow x1={570} y1={142} x2={608} y2={142} />
      <Box x={610} y={112} w={140} h={60} lines={['exec_queries', 'build_arel → SQL', 'select_all']} mono fs={11} subTone="muted" />
      <Arrow x1={680} y1={172} x2={680} y2={198} />
      <Box x={560} y={200} w={190} h={52} lines={['行からレコードを作り', '@records に保存（loaded）']} fs={11.5} fill="box4" />
      <T x={20} y={214} fs={11.5}>
        2回目の to_a：@records を返すだけ（SQL なし）
      </T>
      <T x={20} y={238} fs={11.5} tone="danger">
        読み込み後の where!：UnmodifiableRelation
      </T>
    </Svg>
  )
}

/* ---------- 図 12-3 Relation からクラスメソッドを呼ぶ ---------- */
function DelegationFigure() {
  return (
    <Svg
      id="12-3"
      w={760}
      h={230}
      label="Article.published は Relation を返す。その Relation で popular を呼ぶと、Relation には popular が無いので、Article::ActiveRecord_Relation の method_missing が Article クラスに popular があるかを調べ、GeneratedRelationMethods に委譲メソッドを定義する。委譲メソッドは scoping のブロックの中で Article.popular を呼ぶ。scoping の間は Article.where などが今の Relation から始まるので、popular の where は status = 1 の条件に追加される"
    >
      <Box x={20} y={30} w={220} h={44} lines={['Article.published', '（status = 1 の Relation）']} mono fs={11.5} subTone="muted" />
      <Arrow x1={240} y1={52} x2={298} y2={52} />
      <T x={269} y={40} mono fs={11} anchor="middle">
        .popular
      </T>
      <Box x={300} y={20} w={250} h={64} lines={['Article::ActiveRecord_Relation', 'method_missing → 委譲メソッドを', 'GeneratedRelationMethods に定義']} mono fs={11} subTone="muted" />
      <Arrow x1={425} y1={84} x2={425} y2={118} />
      <Box x={300} y={120} w={250} h={44} lines={['scoping { Article.popular }', '今の Relation を「現在のスコープ」に']} mono fs={11} fill="box5" subTone="muted" />
      <Arrow x1={550} y1={142} x2={598} y2={142} />
      <Box x={600} y={112} w={150} h={60} lines={['def self.popular', '  where("views_count', '    > 900")']} mono fs={11} align="start" />
      <Box x={20} y={190} w={730} h={30} lines="SELECT `articles`.* FROM `articles` WHERE `articles`.`status` = 1 AND (views_count > 900)" mono fs={11} fill="box4" />
    </Svg>
  )
}

/* ---------- 図 12-4 複合索引 (status, published_at) ---------- */
function CompositeIndexFigure() {
  const rows = [
    ['0', 'NULL'],
    ['0', 'NULL'],
    ['1', '2025-11-12'],
    ['1', '2026-03-05'],
    ['1', '2026-08-01'],
    ['1', '2026-11-10'],
    ['2', 'NULL'],
  ]
  return (
    <Svg
      id="12-4"
      w={760}
      h={300}
      label="索引 index_articles_on_status_and_published_at は、status の順に並び、同じ status の中では published_at の順に並んでいる。WHERE status = 1 ORDER BY published_at DESC LIMIT 10 は、status = 1 の範囲の末尾から逆向きに10件読めばよいので、並べ替えが要らない。EXPLAIN では type が ref、Extra が Backward index scan になった。WHERE published_at 以上の条件だけの場合は、published_at が索引の先頭の列ではないので索引を使えず、type が ALL の全件走査と filesort になった"
    >
      <T x={20} y={20} fs={12} tone="muted">
        索引の中身（模式図）
      </T>
      <Box x={20} y={30} w={90} h={26} lines="status" mono fs={11.5} fill="box2" />
      <Box x={110} y={30} w={130} h={26} lines="published_at" mono fs={11.5} fill="box2" />
      {rows.map(([s, p], i) => (
        <g key={i}>
          <Box x={20} y={58 + i * 26} w={90} h={26} lines={s} mono fs={11.5} rx={0} fill={s === '1' ? 'box5' : 'bg'} />
          <Box x={110} y={58 + i * 26} w={130} h={26} lines={p} mono fs={11.5} rx={0} fill={s === '1' ? 'box5' : 'bg'} />
        </g>
      ))}
      <Arrow x1={256} y1={196} x2={256} y2={118} accent />
      <T x={264} y={160} fs={11.5} tone="acc">
        逆向きに読む
      </T>

      <Box x={350} y={40} w={390} h={100} fill="bg" lines={[]} />
      <T x={362} y={60} mono fs={11.5}>
        WHERE status = 1
      </T>
      <T x={362} y={80} mono fs={11.5}>
        ORDER BY published_at DESC LIMIT 10
      </T>
      <T x={362} y={106} fs={11.5}>
        type=ref、key=この索引
      </T>
      <T x={362} y={126} fs={11.5}>
        Extra=Backward index scan（並べ替え不要）
      </T>

      <Box x={350} y={160} w={390} h={100} fill="bg" lines={[]} />
      <T x={362} y={180} mono fs={11.5}>
        WHERE published_at {'>='} '2026-10-11 …'
      </T>
      <T x={362} y={200} mono fs={11.5}>
        ORDER BY views_count DESC LIMIT 5
      </T>
      <T x={362} y={226} fs={11.5} tone="danger">
        type=ALL（全件走査）、key=NULL
      </T>
      <T x={362} y={246} fs={11.5} tone="danger">
        Extra=Using where; Using filesort
      </T>
      <T x={20} y={276} fs={11} tone="muted">
        published_at は2番目の列なので、status を指定しない条件では索引を使えない
      </T>
    </Svg>
  )
}

const ch12: Chapter = {
  number: 12,
  part: 3,
  title: 'Relation と Arel による SQL 生成',
  summary:
    'where や order が SQL をすぐに実行せずに Relation へ条件をためる仕組みと、Arel の構文木から MySQL の SQL が作られ、実行されてレコードになるまでを追います。スコープとクラスメソッドの委譲、find のステートメントキャッシュ、クエリキャッシュ、EXPLAIN による実行計画の読み方も扱います。',
  goals: [
    'Relation が条件を保存するだけで、必要になったときに SQL を実行することを説明できる',
    'メソッドチェーンのたびに Relation が複製される仕組みを説明できる',
    'Relation の値が Arel の構文木になり、MySQL 用の SQL になるまでを説明できる',
    'Relation からモデルのクラスメソッドを呼んだときに条件が引き継がれる理由を説明できる',
    'count・size・exists?・pluck などが実行する SQL の違いを説明できる',
    'MySQL の EXPLAIN の主な列を読み、複合索引が使われる条件を説明できる',
  ],
  prerequisites: [4, 11],
  sections: [
    {
      id: 'lazy',
      title: 'Relation は SQL をすぐに実行しない',
      body: (
        <>
          <p>
            <code>Article.where(...)</code> の <code>where</code> は Article クラスのメソッドではありません。ActiveRecord::Querying が、<code>where</code> や <code>find</code>{' '}
            などのメソッドを <code>all</code>（その時点のスコープの Relation）に委譲しています。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/querying.rb（5〜24行目、一部省略）"
            href={`${GH}/activerecord/lib/active_record/querying.rb#L5-L24`}
            code={`
    QUERYING_METHODS = [
      :find, :find_by, :find_by!, :take, :take!, :sole, :find_sole_by, :first, :first!, :last, :last!,
      # （省略）
      :exists?, :any?, :many?, :none?, :one?,
      # （省略）
      :select, :reselect, :order, :regroup, :in_order_of, :reorder, :group, :limit, :offset, :joins, :left_joins, :left_outer_joins,
      :where, :rewhere, :invert_where, :preload, :extract_associated, :eager_load, :includes, :from, :lock, :readonly,
      # （省略）
      :count, :average, :minimum, :maximum, :sum, :calculate,
      :pluck, :pick, :ids, :async_ids, :strict_loading, :excluding, :without, :with_recursive,
      # （省略）
    ].freeze # :nodoc:
    delegate(*QUERYING_METHODS, to: :all)
`}
          />
          <p>
            <code>where</code> が返すのは <Term>Relation</Term> です。Relation は「どのテーブルから、どんな条件で、どの順に取り出すか」を保存したオブジェクトで、作っただけでは SQL
            を実行しません
            <Ref n={1} />。デモのアプリケーションで確かめました。
          </p>
          <Code
            lang="ruby"
            code={`
r = Article.where(status: :published)
r.class      # => Article::ActiveRecord_Relation
r.loaded?    # => nil（まだ読み込んでいない。SQL も実行されていない）
r.to_sql     # => "SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`status\` = 1"

r3 = Article.where(author_id: 3).limit(2)   # この時点で SQL は0回
r3.each { |a| }                              # ここで SELECT ... WHERE author_id = 3 LIMIT 2
r3.to_a                                      # 2回目は SQL を実行しない
r3.where!(id: 1)   # => ActiveRecord::UnmodifiableRelation
`}
          />
          <p>
            Relation のクラスは <code>Article::ActiveRecord_Relation</code> です。Rails はモデルごとに Relation のサブクラスを作り、そのモデル用の委譲メソッドをそこに定義します（後述）。
          </p>
        </>
      ),
    },
    {
      id: 'values',
      title: '条件の保存と Relation の複製',
      body: (
        <>
          <p>
            <code>where</code> の実装は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation/query_methods.rb（1061〜1074行目）"
            href={`${GH}/activerecord/lib/active_record/relation/query_methods.rb#L1061-L1074`}
            code={`
    def where(*args)
      if args.empty?
        WhereChain.new(spawn)
      elsif args.length == 1 && args.first.blank?
        self
      else
        spawn.where!(*args)
      end
    end

    def where!(opts, *rest) # :nodoc:
      self.where_clause += build_where_clause(opts, rest)
      self
    end
`}
          />
          <p>
            <code>spawn</code> は、通常は自分を <code>clone</code> したものを返します（<code>spawn_methods.rb</code> の 9〜11 行目）。複製した Relation に <code>where!</code>{' '}
            で条件を加えるので、元の Relation は変わりません。<code>where_clause</code> などの値は <code>@values</code> というハッシュに保存されており、その読み書きのメソッドは{' '}
            <code>class_eval</code> で生成されています。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation/query_methods.rb（173〜182行目）"
            href={`${GH}/activerecord/lib/active_record/relation/query_methods.rb#L173-L182`}
            code={`
      class_eval <<-CODE, __FILE__, __LINE__ + 1
        def #{method_name}                     # def includes_values
          @values.fetch(:#{name}, #{default})  #   @values.fetch(:includes, FROZEN_EMPTY_ARRAY)
        end                                    # end

        def #{method_name}=(value)             # def includes_values=(value)
          assert_modifiable!                   #   assert_modifiable!
          @values[:#{name}] = value            #   @values[:includes] = value
        end                                    # end
      CODE
`}
          />
          <p>
            値を書き込む前の <code>assert_modifiable!</code> は、読み込み済み（<code>@loaded</code>）か Arel を作成済み（<code>@arel</code>）なら <code>UnmodifiableRelation</code>{' '}
            を投げます（同じファイルの 1774〜1776 行目）
            <Ref n={2} />。前節の <code>where!</code> の例外はこれです。
          </p>
          <Code
            lang="ruby"
            code={`
r2 = r.order(published_at: :desc).limit(3)
r.equal?(r2)          # => false（別のオブジェクト）
r.order_values        # => []（元の Relation は変わらない）
r.values.keys         # => [:where]
`}
          />
          <p>
            スコープを組み合わせても元の Relation が変わらないので、コントローラーで <code>base = Article.published</code> を作り、そこから条件の違う複数の Relation を作って使い分けられます。
          </p>
        </>
      ),
    },
    {
      id: 'arel',
      title: 'Arel の構文木と SQL',
      body: (
        <>
          <p>
            SQL を作るときは、Relation の値から <Term>Arel</Term> の構文木を組み立てます。Arel は SQL を Ruby のオブジェクトの木で表すライブラリで、Rails 本体に含まれています。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation/query_methods.rb（1778〜1800行目）"
            href={`${GH}/activerecord/lib/active_record/relation/query_methods.rb#L1778-L1800`}
            code={`
      def build_arel(aliases)
        arel = Arel::SelectManager.new(table)

        build_joins(arel.join_sources, aliases)

        arel.where(where_clause.ast) unless where_clause.empty?
        arel.having(having_clause.ast) unless having_clause.empty?
        arel.take(build_cast_value("LIMIT", limit_value)) if limit_value
        arel.skip(build_cast_value("OFFSET", offset_value.to_i)) if offset_value
        arel.group(*arel_columns(group_values)) unless group_values.empty?

        build_order(arel)
        build_with(arel)
        build_select(arel)

        arel.optimizer_hints(*optimizer_hints_values) unless optimizer_hints_values.empty?
        arel.comment(*annotate_values) unless annotate_values.empty?
        arel.distinct(distinct_value)
        arel.from(build_from) unless from_clause.empty?
        arel.lock(lock_value) if lock_value

        arel
      end
`}
          />
          <p>
            <code>@values</code> の各項目を、<code>Arel::SelectManager</code> の対応するメソッドに順に渡しています。作った Arel は <code>arel</code> メソッドが <code>@arel</code>{' '}
            に保存します（同じファイルの 1623〜1625 行目）
            <Ref n={2} />。デモのアプリケーションで構文木の中身を調べると、次のようになりました。
          </p>
          <Code
            lang="text"
            code={`
r = Article.where(status: :published).order(published_at: :desc).limit(3)
r.arel.ast                       # => Arel::Nodes::SelectStatement
  cores[0]: SelectCore  source=JoinSource  projections=[Arel::Attributes::Attribute]
  wheres=[Arel::Nodes::Equality]  orders=[Arel::Nodes::Descending]  limit=Arel::Nodes::Limit
Equality の左辺: articles.status（Arel::Attributes::Attribute）
Equality の右辺: ActiveRecord::Relation::QueryAttribute
  value=:published  value_for_database=1
`}
          />
          <Figure n="12-1" title="Relation の値から SQL まで" caption="上の実行結果を図にしたもの。構文木は主な節点だけを描いている。">
            <ArelFigure />
          </Figure>
          <p>
            WHERE の右辺の <code>QueryAttribute</code> は、<ChapterLink n={11} />で見た ActiveModel::Attribute のサブクラスです。<code>status</code> 列の型（EnumType）を持っているので、
            <code>:published</code> は SQL に入れるときに 1 に変換されます。構文木を SQL の文字列にするのは visitor で、MySQL では <code>Arel::Visitors::MySQL</code>{' '}
            が使われました。テーブル名や列名をバッククォートで囲む、OFFSET だけを指定したときに大きな LIMIT を補う、などの MySQL 向けの処理が入っています（<code>arel/visitors/mysql.rb</code>）
            <Ref n={3} />。
          </p>
          <Callout kind="note">
            <p>
              <code>r.arel.to_sql</code> は <code>... WHERE `articles`.`status` = ? ... LIMIT ?</code> のように値の位置を <code>?</code> にした SQL を返します。mysql2
              アダプターは、値の位置を空けた SQL を事前に準備し、実行時に値を渡す仕組み（プリペアドステートメント）を既定で使わないので（<code>mysql2_adapter.rb</code> の <code>default_prepared_statements</code> が false）、実行時には値をクォートして SQL
              の文字列に埋め込みます。ログに値が入った SQL が出るのはこのためです
              <Ref n={4} />。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'load',
      title: '実行してレコードにする',
      body: (
        <>
          <p>
            <code>each</code> や <code>to_a</code> は、Relation の <code>records</code> を通して <code>load</code> を呼びます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation.rb（1207〜1214行目、1431〜1453行目）"
            href={`${GH}/activerecord/lib/active_record/relation.rb#L1207-L1214`}
            code={`
    def load(&block)
      if !loaded? || scheduled?
        @records = exec_queries(&block)
        @loaded = true
      end

      self
    end

      def exec_queries(&block)
        if lock_value && model.current_preventing_writes
          raise ActiveRecord::ReadOnlyError, "Lock query attempted while in readonly mode"
        end

        skip_query_cache_if_necessary do
          rows = if scheduled?
            future = @future_result
            @future_result = nil
            future.result
          else
            exec_main_query
          end

          records = instantiate_records(rows, &block)
          preload_associations(records) unless skip_preloading_value

          records.each(&:readonly!) if readonly_value
          records.each { |record| record.strict_loading!(strict_loading_value) } unless strict_loading_value.nil?

          records
        end
      end
`}
          />
          <p>
            <code>exec_main_query</code> は、通常は <code>model._query_by_sql(c, arel)</code> で接続の <code>select_all</code> を呼びます（同じファイルの 1455〜1485 行目）。結果の行は
            <code>_load_from_sql</code> から<ChapterLink n={11} />の <code>instantiate_instance_of</code> が呼ばれてレコードになります。<code>preload_associations</code> は <code>includes</code> などで指定した関連を読み込む処理で、
            <ChapterLink n={13} />で扱います
            <Ref n={1} />。
          </p>
          <Figure n="12-2" title="Relation の組み立てと読み込み" caption="Rails 8.1.4.1 の relation.rb・query_methods.rb・spawn_methods.rb を読んでまとめた図。">
            <LifecycleFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'conditions',
      title: '条件の書き方と生成される SQL',
      body: (
        <>
          <p>
            <code>where</code> にハッシュを渡すと、値の種類に応じて Arel の節点が選ばれます。デモのアプリケーションで <code>to_sql</code> を調べた結果です（SELECT 句は省略）。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>書き方</th>
                  <th>WHERE 句</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>where(id: [1, 2, 3])</code>
                  </td>
                  <td>
                    <code>`articles`.`id` IN (1, 2, 3)</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>where(published_at: nil)</code>
                  </td>
                  <td>
                    <code>`articles`.`published_at` IS NULL</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>where(views_count: 100..200)</code>
                  </td>
                  <td>
                    <code>`articles`.`views_count` BETWEEN 100 AND 200</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>where.not(status: :draft)</code>
                  </td>
                  <td>
                    <code>`articles`.`status` != 0</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>where(status: :draft).or(where(views_count: 0))</code>
                  </td>
                  <td>
                    <code>(`articles`.`status` = 0 OR `articles`.`views_count` = 0)</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>where(Article.arel_table[:views_count].gt(900))</code>
                  </td>
                  <td>
                    <code>`articles`.`views_count` &gt; 900</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>where("title LIKE ?", "記事1%")</code>
                  </td>
                  <td>
                    <code>(title LIKE '記事1%')</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            文字列で条件を書いた場合、Rails はその中身を解釈せず、括弧で囲んでそのまま SQL に入れます。<code>?</code> を使えば値はクォートされますが、文字列の式展開（
            <code>{'"title = \'#{params[:q]}\'"'}</code>）で値を入れると SQL インジェクションになります。安全な書き方は<ChapterLink n={21} />で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'delegation',
      title: 'スコープとクラスメソッドの委譲',
      body: (
        <>
          <p>
            <code>Article.published.recent</code> のように、Relation に対してスコープやクラスメソッドを続けて呼べます。Relation に無いメソッドが呼ばれると、モデルごとの Relation
            のサブクラスの <code>method_missing</code> が、モデルにそのメソッドがあれば委譲メソッドを生成して呼びます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation/delegation.rb（73〜89行目）"
            href={`${GH}/activerecord/lib/active_record/relation/delegation.rb#L73-L89`}
            code={`
      def generate_method(method)
        MUTEX.synchronize do
          return if method_defined?(method)

          if /\\A[a-zA-Z_]\\w*[!?]?\\z/.match?(method) && !::ActiveSupport::Delegation::RESERVED_METHOD_NAMES.include?(method.to_s)
            module_eval <<-RUBY, __FILE__, __LINE__ + 1
              def #{method}(...)
                scoping { model.#{method}(...) }
              end
            RUBY
          else
            define_method(method) do |*args, **kwargs, &block|
              scoping { model.public_send(method, *args, **kwargs, &block) }
            end
          end
        end
      end
`}
          />
          <p>
            生成されるメソッドは、<code>scoping</code> のブロックの中でモデルのクラスメソッドを呼びます。<code>scoping</code> の間は、その Relation が「現在のスコープ」として登録され、クラスメソッドの中の{' '}
            <code>where</code> などはそこから始まります
            <Ref n={5} />。2回目からは <code>method_missing</code> を通らず、生成済みのメソッドが直接呼ばれます。
          </p>
          <Code
            lang="ruby"
            code={`
def Article.popular = where("views_count > 900")   # 検証用に定義したクラスメソッド
Article.published.popular.to_sql
# => SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`status\` = 1 AND (views_count > 900)
Article.where(nil).class.ancestors[1]   # => Article::GeneratedRelationMethods
`}
          />
          <Figure n="12-3" title="Relation からクラスメソッドを呼ぶ" caption="Rails 8.1.4.1 の relation/delegation.rb を読んでまとめた図。">
            <DelegationFigure />
          </Figure>
          <p>
            <ChapterLink n={4} />で見たように、<code>scope</code> で定義したスコープの lambda も、Relation を self として実行されます。scope とクラスメソッドの違いは主に戻り値で、scope は lambda が nil
            を返しても <code>all</code> を返します。
          </p>
        </>
      ),
    },
    {
      id: 'finders',
      title: 'first・find・count などの SQL',
      body: (
        <>
          <p>読み込み用のメソッドがそれぞれ実行する SQL を確かめました。</p>
          <Code
            lang="text"
            code={`
Article.first                    SELECT \`articles\`.* FROM \`articles\` ORDER BY \`articles\`.\`id\` ASC LIMIT 1
Article.take                     SELECT \`articles\`.* FROM \`articles\` LIMIT 1
Article.find(5)                  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 5 LIMIT 1
Article.find_by(title: "記事9")  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`title\` = '記事9' LIMIT 1
where(status: :published).count  SELECT COUNT(*) FROM \`articles\` WHERE \`articles\`.\`status\` = 1
where(author_id: 3).exists?      SELECT 1 AS one FROM \`articles\` WHERE \`articles\`.\`author_id\` = 3 LIMIT 1
where(author_id: 3).limit(3).pluck(:id, :title)
                                 SELECT \`articles\`.\`id\`, \`articles\`.\`title\` FROM \`articles\` WHERE ... LIMIT 3
`}
          />
          <ul>
            <li>
              <code>first</code> は主キーの順に並べますが、<code>take</code> は並べません。順序が要らないなら <code>take</code> のほうが負荷の小さい SQL です。
            </li>
            <li>
              <code>count</code> は常に COUNT の SQL を実行します。<code>size</code> は、読み込み前なら COUNT を、読み込み後なら <code>@records</code> の数を返します。デモでは、読み込み前の{' '}
              <code>size</code> で COUNT が1回、<code>load</code> の後の <code>size</code> では SQL が実行されませんでした。<code>length</code> は必ず全件を読み込みます。
            </li>
            <li>
              <code>pluck</code> はレコードを作らず、指定した列の値の配列を返します。
            </li>
          </ul>
          <p>
            <code>Article.find(5)</code> と <code>find_by</code> には、Relation を毎回組み立てないための仕組みがあります。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/core.rb（442〜461行目）"
            href={`${GH}/activerecord/lib/active_record/core.rb#L442-L461`}
            code={`
        def cached_find_by(keys, values)
          with_connection do |connection|
            statement = cached_find_by_statement(connection, keys) { |params|
              wheres = keys.index_with do |key|
                if key.is_a?(Array)
                  [key.map { params.bind }]
                else
                  params.bind
                end
              end
              where(wheres).limit(1)
            }

            statement.execute(values.flatten, connection).then do |r|
              r.first
            rescue TypeError
              raise ActiveRecord::StatementInvalid
            end
          end
        end
`}
          />
          <p>
            検索に使う列の組み合わせごとに、値の部分を差し替えられる文（<code>StatementCache</code>）を1回だけ作って保存し、2回目からは値を当てはめて実行します。主キー1つの{' '}
            <code>find</code> は、スコープが無い場合にこの経路を通ります（同じファイルの 269〜280 行目）
            <Ref n={6} />。
          </p>
        </>
      ),
    },
    {
      id: 'query-cache',
      title: 'クエリキャッシュ',
      body: (
        <>
          <p>
            同じリクエストの中で同じ SELECT を2回実行すると、2回目はデータベースに問い合わせず、1回目の結果を返します。この<Term en="query cache">クエリキャッシュ</Term>は、
            <ChapterLink n={8} />で見た Executor の run で有効になり、complete で消えます。
          </p>
          <Code
            lang="text"
            code={`
Rails.application.executor.wrap { Article.find(1); Article.find(1) }
  [Article Load]       SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 1 LIMIT 1
  [Article Load CACHE] SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 1 LIMIT 1

Article.find(1); Article.find(1)    # Executor の外
  [Article Load] SELECT ... WHERE \`articles\`.\`id\` = 1 LIMIT 1
  [Article Load] SELECT ... WHERE \`articles\`.\`id\` = 1 LIMIT 1
`}
          />
          <p>
            Executor の中では2回目に CACHE と記録され、外では2回とも実行されました。キャッシュは接続プールごとに、さらにスレッド（またはファイバー）ごとに分けて保存され（<code>connection_adapters/abstract/query_cache.rb</code> の QueryCacheRegistry）、INSERT・UPDATE・DELETE を実行すると消えます。この実測の「外」は、config/environment を require しただけのスクリプトで取りました。このようなスクリプトや自分で作ったスレッドで動かすコードでは、Executor
            で包まない限りクエリキャッシュは効きません（<code>rails runner</code> は既定で Executor で包みます。<code>-w</code> を付けると包みません）。
          </p>
        </>
      ),
    },
    {
      id: 'explain',
      title: 'EXPLAIN で実行計画を読む',
      body: (
        <>
          <p>
            Relation の <code>explain</code> は、SQL の先頭に EXPLAIN を付けて実行し、MySQL の実行計画を表示します。デモのアプリケーションの articles テーブル（1万件）には、
            <code>author_id</code> の索引と、<code>(status, published_at)</code> の複合索引があります。4つの問い合わせの結果を並べます（id、select_type などの列は省略）。
          </p>
          <Code
            lang="text"
            code={`
① where(status: :published).order(published_at: :desc).limit(10)
type=ref  key=index_articles_on_status_and_published_at  key_len=4  rows=4919  filtered=100.0
Extra=Backward index scan

② where(author_id: 3)
type=ref  key=index_articles_on_author_id  key_len=9  rows=482  filtered=100.0  Extra=NULL

③ where(title: "記事5")
type=ALL  key=NULL  rows=9838  filtered=10.0  Extra=Using where

④ where(published_at: 1.month.ago..).order(views_count: :desc).limit(5)
type=ALL  key=NULL  rows=9838  filtered=33.33  Extra=Using where; Using filesort
`}
          />
          <p>MySQL のリファレンスマニュアルによると、主な列の意味は次のとおりです <Ref n={7} />。</p>
          <ul>
            <li>
              <code>type</code>：表の読み方。<code>const</code> は一致する行が最大1行（主キーでの検索）、<code>ref</code> は索引の値が一致する行を読む、<code>range</code>{' '}
              は索引で範囲を読む、<code>index</code> は索引全体を走査、<code>ALL</code> は表全体を走査。
            </li>
            <li>
              <code>key</code>：実際に使うことにした索引。<code>possible_keys</code> は候補の索引。
            </li>
            <li>
              <code>rows</code>：調べる必要があると MySQL が見積もった行数。<code>filtered</code> は、そのうち条件で残る割合の見積もり（%）。
            </li>
            <li>
              <code>Extra</code>：<code>Using filesort</code> は並べ替えのために追加の処理が必要なこと、<code>Using index</code> は索引だけで値を取り出せること、<code>Backward index scan</code>{' '}
              は索引を逆向きに読むこと。
            </li>
          </ul>
          <p>
            ① は status = 1 の行だけを索引で読み、同じ status の中では published_at の順に並んでいるので、末尾から逆向きに読むだけで並べ替えが要りません。MySQL のマニュアルも、索引の1列目が定数で ORDER BY
            が2列目なら、索引から読んだ行はすでに2列目の順に並んでいると説明しています
            <Ref n={8} />。④ は published_at だけを条件にしているので、(status, published_at) の索引を使えず全件走査になりました。複合索引は先頭の列から順に使えるもので、先頭の列を含まない条件では原則として検索に使えません（MySQL の Skip Scan のように条件付きで使える例外はあります）
            <Ref n={9} />。③ は title に索引が無いので全件走査です。
          </p>
          <Figure n="12-4" title="複合索引 (status, published_at)" caption="模式図。索引の並びは単純化している。右の結果はデモのアプリケーション（MySQL 8.4.13）の EXPLAIN による。">
            <CompositeIndexFigure />
          </Figure>
          <p>
            Rails 7.1 以降の <code>explain</code> にはオプションを渡せ、<code>explain(:analyze)</code> は MySQL の EXPLAIN ANALYZE を実行します。EXPLAIN ANALYZE は問い合わせを実際に実行し、木の形式（TREE）で結果を表示します
            <Ref n={10} />。① の結果は次のとおりです。
          </p>
          <Code
            lang="text"
            code={`
-> Limit: 10 row(s)  (cost=565 rows=10) (actual time=0.0486..0.0692 rows=10 loops=1)
    -> Index lookup on articles using index_articles_on_status_and_published_at (status=1) (reverse)
       (cost=565 rows=4919) (actual time=0.0443..0.0644 rows=10 loops=1)
`}
          />
          <p>
            見積もりでは 4919 行（status = 1 の行数）ですが、実際には10行読んだところで LIMIT により止まっています（actual の rows=10）。EXPLAIN の rows だけで判断せず、実行時間や実際の行数も確かめると、遅い問い合わせの原因を絞り込めます。性能の改善は
            <ChapterLink n={22} />で扱います。
          </p>
          <Callout kind="v72">
            <p>
              Relation の組み立てと読み込みの仕組みは Rails 7.2.4 でも同じです。7.2 では Relation の <code>klass</code> 属性が使われており、8.1 では同じものが <code>model</code>{' '}
              という名前になって <code>klass</code> は別名として残っています
              <Ref n={11} />。<code>explain</code> にオプションを渡す機能は 7.1 からあり、7.2 でも使えます。
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
          <li>Article.where などは all に委譲され、条件を保存した Relation を返します。SQL は each・to_a・first などでレコードが必要になったときに実行されます。</li>
          <li>チェーンのたびに Relation は複製され、元の Relation は変わりません。読み込み済みの Relation は変更できません。</li>
          <li>Relation の値は build_arel で Arel の構文木になり、MySQL 用の visitor が SQL の文字列にします。enum などの値は列の型で変換されます。</li>
          <li>Relation からモデルのクラスメソッドを呼ぶと、scoping の中で実行されるので、Relation の条件が引き継がれます。</li>
          <li>count は常に COUNT、size は読み込み状態で切り替わり、find はステートメントキャッシュを使います。同じ SELECT はリクエストの中でクエリキャッシュされます。</li>
          <li>EXPLAIN の type・key・rows・Extra で索引の使われ方を確かめます。複合索引は先頭の列から順に使われます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'activerecord/lib/active_record/querying.rb・relation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'QUERYING_METHODS の all への委譲、load・exec_queries・exec_main_query・to_sql。' },
    { title: 'activerecord/lib/active_record/relation/query_methods.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/query_methods.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'where と where!、値の読み書きメソッドの生成、assert_modifiable!、arel と build_arel。spawn は spawn_methods.rb。' },
    { title: 'activerecord/lib/arel/visitors/mysql.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/arel/visitors/mysql.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'MySQL 用の visitor（OFFSET だけのときの LIMIT の補完など）。' },
    { title: 'activerecord/lib/active_record/connection_adapters/mysql2_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/mysql2_adapter.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'mysql2 アダプターの default_prepared_statements が false であること。' },
    { title: 'activerecord/lib/active_record/relation/delegation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/delegation.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'GeneratedRelationMethods と method_missing による、scoping の中でのクラスメソッドの呼び出し。' },
    { title: 'activerecord/lib/active_record/core.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/core.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'find・find_by と StatementCache による cached_find_by。' },
    { title: 'EXPLAIN Output Format', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/explain-output.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: 'type（const・ref・range・index・ALL）、key、rows、filtered、Extra（Using filesort・Using index・Backward index scan）の意味。' },
    { title: 'ORDER BY Optimization', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/order-by-optimization.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: '索引の1列目が定数で ORDER BY が2列目なら、索引から読んだ行は2列目の順に並んでいること。Using filesort の意味。' },
    { title: 'Multiple-Column Indexes', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: '複合索引は左端からの列の組み合わせ（leftmost prefix）でだけ検索に使えること。' },
    { title: 'EXPLAIN Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/explain.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: 'EXPLAIN ANALYZE の構文と、TREE 形式が常に使われること。' },
    { title: 'activerecord/lib/active_record/relation.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/activerecord/lib/active_record/relation.rb', accessed: '2026-11-11', version: 'Rails 7.2.4', note: '7.2 の Relation が klass 属性を持つこと（8.1.4.1 の model と alias :klass との差分で確認）。' },
  ],
}

export default ch12
