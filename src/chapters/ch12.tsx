import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { withExplanations } from '../explanations/shared'
import { explanation12 } from '../explanations/database'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const figure = (n: number) => `${chapterNumber(12)}-${n}`

/* ---------- 読み込み済みの Relation に where と where! を呼ぶ（番号なし） ---------- */
function WhereBangFigure() {
  return (
    <Svg
      id="ch12-where-bang"
      w={760}
      h={372}
      label="r3 は each で読み込み済みの Relation で、@values に where: author_id = 3 と limit: 2 を持ち、@loaded が true、@records に記事2件を持つ。r3.where(id: 1) は spawn（clone）で複製を作る。複製では @values が複製され、@records は引き継がれない。複製の where! が assert_modifiable! を呼ぶが、複製は読み込み前なので例外にならず、複製の @values の where が author_id = 3 AND id = 1 になる。戻り値はこの複製で、r3 は変わらない。この複製を使うときに SQL をもう1回送る。r3.where!(id: 1) は複製を作らず、書き込む先は r3 自身になる。r3 の where! が assert_modifiable! を呼び、r3 は @loaded が true なので ActiveRecord::UnmodifiableRelation が発生し、条件は書き込まれない"
    >
      <Box x={150} y={14} w={460} h={64} lines={['r3（each で読み込み済みの Relation）', '@values：where: author_id = 3、limit: 2', '@loaded：true、@records：記事2件']} fs={12.5} subTone="muted" />

      <Arrow x1={200} y1={78} x2={200} y2={116} />
      <T x={210} y={98} mono fs={12} tone="acc">
        where(id: 1)
      </T>
      <Arrow x1={570} y1={78} x2={570} y2={116} />
      <T x={580} y={98} mono fs={12} tone="acc">
        where!(id: 1)
      </T>

      <Box x={30} y={118} w={340} h={46} lines={['spawn（clone）で複製を作る', '@values は複製、@records は引き継がない']} fs={12.5} subTone="muted" />
      <Box x={400} y={118} w={340} h={46} lines={['複製を作らない', '書き込む先は r3 自身']} fs={12.5} subTone="muted" />
      <Arrow x1={200} y1={164} x2={200} y2={194} />
      <Arrow x1={570} y1={164} x2={570} y2={194} />

      <Box x={30} y={196} w={340} h={46} lines={['複製の where! → assert_modifiable!', '複製は読み込み前なので例外にならない']} fs={12.5} subTone="muted" />
      <Box x={400} y={196} w={340} h={46} lines={['r3 の where! → assert_modifiable!', 'r3 は @loaded が true']} fs={12.5} subTone="muted" />
      <Arrow x1={200} y1={242} x2={200} y2={272} />
      <Arrow x1={570} y1={242} x2={570} y2={272} />

      <Box x={30} y={274} w={340} h={46} lines={['複製の @values に条件を足す', 'where: author_id = 3 AND id = 1、limit: 2']} fs={12.5} fill="box5" subTone="muted" />
      <Box x={400} y={274} w={340} h={46} fill="bg" lines={[]} />
      <T x={570} y={289} anchor="middle" mono fs={12} tone="danger">
        ActiveRecord::UnmodifiableRelation
      </T>
      <T x={570} y={307} anchor="middle" fs={11.5} tone="muted">
        条件は書き込まれない
      </T>

      <T x={200} y={338} anchor="middle" fs={11.5}>
        戻り値はこの複製で、r3 は変わらない
      </T>
      <T x={200} y={358} anchor="middle" fs={11.5}>
        この複製を使うときに SQL をもう1回送る
      </T>
    </Svg>
  )
}

/* ---------- 図 22-3 Relation の値から SQL まで ---------- */
function ArelFigure() {
  return (
    <Svg
      id={figure(3)}
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

/* ---------- 図 22-4（段階送り）Relation の組み立てと読み込み ---------- */
const lifecycleBoxes: { x: number; y: number; lines: string[] }[] = [
  { x: 20, y: 30, lines: ['組み立て', 'where・order・limit'] },
  { x: 205, y: 30, lines: ['load', 'to_a → records から'] },
  { x: 390, y: 30, lines: ['exec_queries'] },
  { x: 575, y: 30, lines: ['exec_main_query', 'with_connection'] },
  { x: 575, y: 120, lines: ['select_all', '_query_by_sql から'] },
  { x: 390, y: 120, lines: ['to_sql_and_binds', 'visitor.compile'] },
  { x: 205, y: 120, lines: ['select → raw_execute', 'log → MySQL'] },
  { x: 20, y: 120, lines: ['instantiate_records', '@records に保存'] },
]

function LifecycleSnapshot({ active }: { active: number }) {
  const current = active < lifecycleBoxes.length ? lifecycleBoxes[active].lines[0] : '2回目の to_a'
  return (
    <Svg
      id={`${figure(4)}-${active + 1}`}
      w={760}
      h={250}
      label={`Relation を組み立ててから読み込むまでの段の並び。上の段は左から、組み立て、load、exec_queries、exec_main_query。下の段は右から、select_all、to_sql_and_binds、select から log まで、instantiate_records。最後に2回目の to_a が SQL を送らずに @records を返す。いま強調している段は ${current}`}
    >
      <T x={20} y={18} fs={11.5} tone="muted">
        SQL を送らない
      </T>
      <T x={205} y={18} fs={11.5} tone="muted">
        読み込み（each・to_a・first など）
      </T>
      {lifecycleBoxes.map((b, i) => (
        <Box key={b.lines[0]} x={b.x} y={b.y} w={165} h={50} lines={b.lines} mono fs={12} bold={i === active} fill={i === active ? 'box5' : 'box'} subTone="muted" />
      ))}
      <Arrow x1={185} y1={55} x2={203} y2={55} />
      <Arrow x1={370} y1={55} x2={388} y2={55} />
      <Arrow x1={555} y1={55} x2={573} y2={55} />
      <Arrow x1={657} y1={80} x2={657} y2={118} />
      <Arrow x1={575} y1={145} x2={557} y2={145} />
      <Arrow x1={390} y1={145} x2={372} y2={145} />
      <Arrow x1={205} y1={145} x2={187} y2={145} />
      <Arrow x1={102} y1={170} x2={102} y2={198} dashed />
      <Box x={20} y={200} w={350} h={36} lines="2回目の to_a：@records を返す（SQL なし）" fs={12} bold={active === 8} fill={active === 8 ? 'box5' : 'bg'} dashed />
    </Svg>
  )
}

const lifecycleSteps = [
  {
    label: '組み立て',
    detail: (
      <>
        <LifecycleSnapshot active={0} />
        <p>
          <code>r = Article.where(status: :published).order(published_at: :desc).limit(3)</code> の where・order・limit は Relation を複製して <code>@values</code> に値を足すだけです。デモでは、この時点で{' '}
          <code>r.loaded?</code> は nil、送られた SQL は0回、<code>r.values.keys</code> は <code>[:where, :order, :limit]</code> でした。
        </p>
      </>
    ),
  },
  {
    label: 'load',
    detail: (
      <>
        <LifecycleSnapshot active={1} />
        <p>
          <code>r.to_a</code> は <code>records</code> を通して <code>load</code> を呼びます。<code>loaded?</code> が偽なので、load は <code>exec_queries</code> を呼びます（relation.rb の 1207〜1214行目）。
        </p>
      </>
    ),
  },
  {
    label: 'exec_queries',
    detail: (
      <>
        <LifecycleSnapshot active={2} />
        <p>
          load_async で予約した結果（<code>scheduled?</code>）が無いので、<code>exec_main_query</code> を呼んで行を受け取ります。受け取った行からレコードを作る処理は、最後の段で同じ exec_queries が続けて行います。
        </p>
      </>
    ),
  },
  {
    label: 'exec_main_query',
    detail: (
      <>
        <LifecycleSnapshot active={3} />
        <p>
          none でも、条件が矛盾した Relation でもなく、eager_load（関連を JOIN でまとめて読む指定）も使っていないので、<code>model.with_connection</code> で接続プールから接続を借り、<code>model._query_by_sql(c, arel)</code> を呼びます。ここで渡す <code>arel</code> は、build_arel が作った構文木です。
        </p>
      </>
    ),
  },
  {
    label: 'select_all',
    detail: (
      <>
        <LifecycleSnapshot active={4} />
        <p>
          _query_by_sql は <code>c.select_all(arel, "Article Load", [])</code> を呼びます。select_all は mysql2 用、クエリキャッシュ用（QueryCache）、共通の DatabaseStatements の3つのモジュールが重ねて定義していて、この順に super で進みます。
        </p>
      </>
    ),
  },
  {
    label: 'SQL の文字列',
    detail: (
      <>
        <LifecycleSnapshot active={5} />
        <p>
          共通の select_all は <code>to_sql_and_binds</code> を呼び、その中の <code>visitor.compile</code> が構文木を次の文字列にしました。mysql2 はプリペアドステートメントを使わないので、値は文字列に埋め込まれ、binds は空の配列です。
        </p>
        <p>
          <code>{'SELECT `articles`.* FROM `articles` WHERE `articles`.`status` = 1 ORDER BY `articles`.`published_at` DESC LIMIT 3'}</code>
        </p>
      </>
    ),
  },
  {
    label: 'SQL を送る',
    detail: (
      <>
        <LifecycleSnapshot active={6} />
        <p>
          select、internal_exec_query、raw_execute を経て、log の中の perform_query が mysql2 で MySQL に SQL を送ります。log は SQL の実行を囲んで sql.active_record を通知し、ログに Article Load の行が出ます。
        </p>
      </>
    ),
  },
  {
    label: 'レコードを作る',
    detail: (
      <>
        <LifecycleSnapshot active={7} />
        <p>
          exec_queries に戻り、<code>instantiate_records</code> が <code>_load_from_sql</code> を呼んで、3行から Article のインスタンスを3つ作ります。load がそれを <code>@records</code> に入れ、<code>@loaded</code> を真にします。デモでは <code>r.loaded?</code> が true、送られた SQL は1回でした。
        </p>
      </>
    ),
  },
  {
    label: '2回目の to_a',
    detail: (
      <>
        <LifecycleSnapshot active={8} />
        <p>
          同じ r にもう一度 to_a を呼ぶと、<code>loaded?</code> が真なので load は exec_queries を呼ばず、<code>@records</code> の複製を返します。デモでは SQL の回数は1回のままでした。読み込み済みの r に <code>where!(id: 1)</code> を呼ぶと、<code>ActiveRecord::UnmodifiableRelation</code> が発生しました。
        </p>
      </>
    ),
  },
]

/* ---------- 図 22-5 Relation からクラスメソッドを呼ぶ ---------- */
function DelegationFigure() {
  return (
    <Svg
      id={figure(5)}
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

/* ---------- 図 22-6 複合索引 (status, published_at) ---------- */
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
      id={figure(6)}
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

/* ---------- 図 22-1 WHERE・ORDER BY・LIMIT ---------- */
function WhereOrderLimitFigure() {
  const steps = [
    { x: 20, lines: ['articles', '10004 行', '（すべての行）'], fill: 'box4' as const },
    { x: 220, lines: ['author_id = 3 の行', '482 行', '並びは決まっていない'], fill: 'box' as const },
    { x: 420, lines: ['views_count の大きい順', '482 行', '996, 996, 994, 993, …'], fill: 'box' as const },
    { x: 620, lines: ['先頭の 3 行', 'id 5200・5085・4874'], fill: 'box5' as const },
  ]
  const labels = ['WHERE', 'ORDER BY', 'LIMIT 3']
  return (
    <Svg
      id={figure(1)}
      w={780}
      h={230}
      label="articles テーブルの10004行から、WHERE author_id = 3 で条件に合う482行を選び、ORDER BY views_count DESC で views_count の大きい順に並べ、LIMIT 3 で先頭の3行を取り出す。結果は id が 5200・5085・4874 の3行。SQL の中では WHERE・ORDER BY・LIMIT の順に書く"
    >
      {steps.map((st, i) => (
        <Box key={i} x={st.x} y={40} w={150} h={76} lines={st.lines} fs={i === 3 ? 12 : 11.5} fill={st.fill} subTone="muted" />
      ))}
      {labels.map((l, i) => (
        <g key={l}>
          <Arrow x1={172 + i * 200} y1={78} x2={218 + i * 200} y2={78} />
          <line x1={195 + i * 200} y1={34} x2={195 + i * 200} y2={72} stroke="var(--fig-accent)" strokeDasharray="2 3" />
          <T x={195 + i * 200} y={26} fs={11} mono anchor="middle" tone="acc">
            {l}
          </T>
        </g>
      ))}
      <T x={20} y={150} fs={11.5} mono>
        SELECT id, title, author_id, views_count FROM articles
      </T>
      <T x={20} y={172} fs={11.5} mono>
        WHERE author_id = 3 ORDER BY views_count DESC LIMIT 3
      </T>
      <T x={20} y={206} fs={11} tone="muted">
        条件で行を選び、選んだ行を並べ、先頭から指定した数の行を取る。値が同じ行（996 の2行）の順番は決まっていない
      </T>
    </Svg>
  )
}

/* ---------- 図 22-2 メソッドチェーンと SQL ---------- */
function ChainFigure() {
  const rows = [
    { code: 'Article.where(author_id: 3)', sql: 'WHERE `articles`.`author_id` = 3' },
    { code: '.order(views_count: :desc)', sql: '+ ORDER BY `articles`.`views_count` DESC' },
    { code: '.limit(3)', sql: '+ LIMIT 3' },
  ]
  return (
    <Svg
      id={figure(2)}
      w={780}
      h={300}
      label="Article.where(author_id: 3) は WHERE の条件を持つ Relation を返す。それに order を続けると ORDER BY が加わった Relation が、さらに limit を続けると LIMIT 3 が加わった Relation が返る。ここまで SQL は送られない。each や to_a で中身を使うと、ためた条件から1つの SELECT を作って MySQL に1回だけ送り、返ってきた3行から Article のインスタンスを3つ作る"
    >
      {rows.map((r, i) => (
        <g key={i}>
          <Box x={20} y={20 + i * 60} w={240} h={40} lines={r.code} mono fs={12} align="start" fill="bg" />
          <Arrow x1={260} y1={40 + i * 60} x2={318} y2={40 + i * 60} />
          <Box x={320} y={20 + i * 60} w={440} h={40} lines={['Relation', r.sql]} mono fs={11} subTone="muted" />
        </g>
      ))}
      <T x={290} y={196} fs={11} tone="muted" anchor="middle">
        ここまで SQL は送らない
      </T>
      <Box x={20} y={214} w={240} h={40} lines=".each・.to_a・.map" mono fs={12} align="start" fill="box5" />
      <Arrow x1={260} y1={234} x2={318} y2={234} />
      <Box x={320} y={208} w={440} h={52} lines={['MySQL に SELECT を1回送る', '… WHERE … ORDER BY … LIMIT 3 → Article のインスタンス3つ']} fs={11.5} fill="box4" subTone="muted" />
      <T x={20} y={284} fs={11} tone="muted">
        where・order・limit は、条件を加えた新しい Relation を返す。元の Relation は変わらない
      </T>
    </Svg>
  )
}

const ch12: Chapter = {
  number: 12,
  part: 3,
  title: 'Relation と Arel による SQL 生成',
  summary:
    '公開中の記事を新しい順に数件表示する例で、検索条件を組み立てるところと、DB から行を読むところを追います。同じ条件を Rails、生成された SQL、実行時のログの3つで見比べます。',
  goals: [
    'where・order・limit をつないだ結果が持つ条件を読み取れる',
    'SQL の条件を表す Ruby のオブジェクトから SQL 文ができ、結果が記事に変わる順を説明できる',
    '同じ検索を繰り返したとき、どの時点で SQL を送り、いつ以前の結果を使ったかをログで確認できる',
  ],
  prerequisites: [4, 11, 35],
  sections: [
    {
      id: 'where-order-limit',
      title: 'WHERE・ORDER BY・LIMIT で行を選んで並べる',
      body: (
        <>
          <p>
            デモの articles テーブルには約1万件の記事があり、一覧のページにすべてを表示することはありません。SELECT では WHERE で条件に合う行を選び、ORDER BY で並べ、LIMIT
            で先頭から何行を取り出すかを決めます
            <Ref n={13} />。WHERE と ORDER BY の書き方は <ChapterLink n={35} section="where" /> で扱いました。ここでは articles テーブルで、LIMIT を加えたときの結果を確かめます。MySQL
            のクライアント（mysql コマンド）で、著者の id が 3 の記事を選びました。
          </p>
          <Code
            lang="text"
            title="mysql コマンドで実行（MySQL 8.4.13。行の一部を省略）"
            code={`
mysql> SELECT id, title, author_id, views_count FROM articles WHERE author_id = 3;
+------+------------+-----------+-------------+
| id   | title      | author_id | views_count |
+------+------------+-----------+-------------+
|   11 | 記事11     |         3 |         241 |
|   13 | 記事13     |         3 |          80 |
|   71 | 記事71     |         3 |         372 |
（中略）
| 9987 | 記事9987   |         3 |         298 |
| 9992 | 記事9992   |         3 |         381 |
+------+------------+-----------+-------------+
482 rows in set (0.00 sec)
`}
          />
          <p>
            <code>WHERE author_id = 3</code> は、author_id 列の値が 3 の行だけを選ぶ条件です。482行が条件に合いました。この結果は id の小さい順に見えますが、ORDER BY
            を書かない場合の行の並びは決まっていません
            <Ref n={11} />。
          </p>
          <p>次に、ORDER BY で views_count（記事が読まれた回数）の大きい順（DESC）に並べました。</p>
          <Code
            lang="text"
            title="（行の一部を省略）"
            code={`
mysql> SELECT id, title, author_id, views_count FROM articles
    ->   WHERE author_id = 3 ORDER BY views_count DESC;
+------+------------+-----------+-------------+
| id   | title      | author_id | views_count |
+------+------------+-----------+-------------+
| 5085 | 記事5085   |         3 |         996 |
| 5200 | 記事5200   |         3 |         996 |
| 4874 | 記事4874   |         3 |         994 |
| 1073 | 記事1073   |         3 |         993 |
（中略）
| 2915 | 記事2915   |         3 |           3 |
| 4705 | 記事4705   |         3 |           0 |
+------+------------+-----------+-------------+
482 rows in set (0.00 sec)
`}
          />
          <p>最後に LIMIT を加えました。</p>
          <Code
            lang="text"
            code={`
mysql> SELECT id, title, author_id, views_count FROM articles
    ->   WHERE author_id = 3 ORDER BY views_count DESC LIMIT 3;
+------+------------+-----------+-------------+
| id   | title      | author_id | views_count |
+------+------------+-----------+-------------+
| 5200 | 記事5200   |         3 |         996 |
| 5085 | 記事5085   |         3 |         996 |
| 4874 | 記事4874   |         3 |         994 |
+------+------------+-----------+-------------+
3 rows in set (0.00 sec)
`}
          />
          <p>
            <code>LIMIT 3</code> は並べた結果の先頭から3行だけを返す指定です。SQL の中では WHERE・ORDER BY・LIMIT の順に書き、結果は「条件で行を選び、選んだ行を並べ、先頭から3行を取る」とした場合と同じになります（図
            22-1）。
          </p>
          <p>
            views_count が 996 の記事は2件あり、LIMIT の無い結果では 5085 が先、LIMIT 3 の結果では 5200 が先でした。ORDER BY で指定した列の値が同じ行の順番は決まっておらず、MySQL
            の実行のしかたによって変わります
            <Ref n={12} />。順番を決めたいときは、<code>ORDER BY views_count DESC, id DESC</code> のように2つ目の並べ方を加えます。こうすると、views_count が同じ行は id の大きい順に並びます。
          </p>
          <p>行の中身ではなく、条件に合う行の数が必要なときは、列の代わりに COUNT(*) を書きます。</p>
          <Code
            lang="text"
            code={`
mysql> SELECT COUNT(*) FROM articles WHERE author_id = 3;
+----------+
| COUNT(*) |
+----------+
|      482 |
+----------+
1 row in set (0.01 sec)
`}
          />
          <Figure n={figure(1)} title="WHERE・ORDER BY・LIMIT" caption="この節の実行結果をもとにした模式図。行の数はデモの articles テーブル（10004行）での値。">
            <WhereOrderLimitFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'chain',
      title: 'where・order・limit をつなげて書く',
      body: (
        <>
          <p>ActiveRecord では同じ条件を where・order・limit のメソッドで書きます。前の節の SQL と同じ条件の記事を、デモのアプリケーションで取り出しました。</p>
          <Code
            lang="text"
            title="bin/rails runner で実行"
            code={`
Article.where(author_id: 3).order(views_count: :desc).limit(3).map(&:id)
  Article Load (2.3ms)  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`author_id\` = 3 ORDER BY \`articles\`.\`views_count\` DESC LIMIT 3
# => [5200, 5085, 4874]
`}
          />
          <p>
            <code>where</code> には「列の名前: 値」の形で条件を、<code>order</code> には「列の名前: <code>:desc</code>（大きい順）か <code>:asc</code>（小さい順）」を、
            <code>limit</code> には行の数を渡します。<code>Article.where(...)</code> の戻り値に <code>.order(...)</code> を続け、その戻り値に <code>.limit(...)</code>{' '}
            を続けています。このように、メソッドの戻り値に続けて次のメソッドを呼ぶ書き方を<Term en="method chain">メソッドチェーン</Term>と呼びます。<code>map(&amp;:id)</code>{' '}
            は取り出した記事の id を集めて配列にします。ログのとおり、Rails は3つのメソッドの条件をまとめた1つの SELECT を MySQL に送りました。
          </p>
          <p>それぞれのメソッドが何を返し、いつ SQL を送るかを、1つずつ確かめました。</p>
          <Code
            lang="text"
            title="bin/rails runner で実行（SQL の一部を … で省略）"
            code={`
r1 = Article.where(author_id: 3); r1.class   # => Article::ActiveRecord_Relation
r1.to_sql     # => "SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`author_id\` = 3"
r2 = r1.order(views_count: :desc); r2.class  # => Article::ActiveRecord_Relation
r2.to_sql     # => "SELECT … WHERE \`articles\`.\`author_id\` = 3 ORDER BY \`articles\`.\`views_count\` DESC"
r3 = r2.limit(3); r3.class                   # => Article::ActiveRecord_Relation
r3.to_sql     # => "SELECT … ORDER BY \`articles\`.\`views_count\` DESC LIMIT 3"
r3.loaded?    # => nil

r3.each { |a| puts "#{a.id} #{a.title} #{a.views_count}" }
  Article Load (3.2ms)  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`author_id\` = 3 ORDER BY \`articles\`.\`views_count\` DESC LIMIT 3
5200 記事5200 996
5085 記事5085 996
4874 記事4874 994
r3.loaded?        # => true
r3.map(&:title)   # => ["記事5200", "記事5085", "記事4874"]
r1.to_sql     # => "SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`author_id\` = 3"
`}
          />
          <p>
            where・order・limit は、どれも Article::ActiveRecord_Relation のオブジェクトを返しました。このオブジェクトを <Term>Relation</Term> と呼びます。Relation
            は記事の配列ではなく、「articles テーブルから、どの条件で、どの順に、何行を取り出すか」を覚えておくオブジェクトです。<code>to_sql</code> はその Relation から作られる SQL
            を返すメソッドで、order や limit を続けるたびに、SQL に ORDER BY と LIMIT が加わりました（図 {figure(2)}）
            <Ref n={14} />。
          </p>
          <p>
            r1・r2・r3 を作っている間、ログに SQL は出ていません。<code>each</code> で記事を1件ずつ使おうとした時点で、SELECT が1回だけ送られました。<code>loaded?</code>{' '}
            は、その Relation が SQL を実行して結果を受け取ったかどうかを返すメソッドで、受け取る前は nil、受け取った後は true でした。結果を受け取った後の <code>r3.map(&amp;:title)</code>{' '}
            では、SQL は送られていません。r3 を作った後も <code>r1.to_sql</code> は WHERE だけのままで、order や limit は元の r1 を書き換えていません。
          </p>
          <p>メソッドによって、戻り値と SQL を送る時点が違います。</p>
          <Code
            lang="text"
            title="bin/rails runner で実行（ログの一部を省略）"
            code={`
Article.all.class          # => Article::ActiveRecord_Relation
Article.all.to_sql         # => "SELECT \`articles\`.* FROM \`articles\`"
Article.recent.class       # => Article::ActiveRecord_Relation
Article.recent.limit(2).to_sql
# => "SELECT \`articles\`.* FROM \`articles\` ORDER BY \`articles\`.\`published_at\` DESC LIMIT 2"
Article.where(author_id: 3).first.class
  Article Load (0.8ms)  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`author_id\` = 3 ORDER BY \`articles\`.\`id\` ASC LIMIT 1
# => Article(id: integer, title: string, body: text, published: boolean, …)
Article.where(author_id: 3).count
  Article Count (0.9ms)  SELECT COUNT(*) FROM \`articles\` WHERE \`articles\`.\`author_id\` = 3
# => 482
Article.where(author_id: 3).order(views_count: :desc).limit(3).to_a.class   # => Array
`}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>メソッド</th>
                  <th>戻り値</th>
                  <th>SQL を送る時点</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>all</code>・<code>where</code>・<code>order</code>・<code>limit</code>・scope
                  </td>
                  <td>Relation</td>
                  <td>中身を使うとき</td>
                </tr>
                <tr>
                  <td>
                    <code>each</code>・<code>map</code>・<code>to_a</code>
                  </td>
                  <td>ブロックの結果・配列</td>
                  <td>呼んだとき（読み込み済みなら送らない）</td>
                </tr>
                <tr>
                  <td>
                    <code>first</code>・<code>find</code>
                  </td>
                  <td>モデルのインスタンス</td>
                  <td>呼んだとき</td>
                </tr>
                <tr>
                  <td>
                    <code>count</code>
                  </td>
                  <td>整数</td>
                  <td>呼んだとき</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>all</code> は条件の無い Relation を返します。デモの Article には <code>scope :recent, -&gt; {'{'} order(published_at: :desc) {'}'}</code> が書いてあります。scope
            は検索条件に名前を付ける宣言で、<code>Article.recent</code> は published_at の新しい順に並べる Relation を返し、続けて limit などを呼べます。<code>first</code> と{' '}
            <code>count</code> は呼んだ時点で SQL を送り、インスタンスや数を返しました。
          </p>
          <p>
            <code>bin/rails console</code>（Ruby の式を1行ずつ入力して実行できる Rails のコマンド）では、Relation を代入しただけでも SQL が送られることがあります。コンソールは入力した式の結果を表示するので、表示のために
            Relation の中身を読み込むからです。
          </p>
          <Code
            lang="text"
            title="bin/rails console での入力と出力（記事の表示とログの末尾のコメントを省略。長い行は折り返した）"
            code={`
r = Article.where(author_id: 3).order(views_count: :desc); nil
# => nil
r
  Article Load (2.4ms)  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`author_id\` = 3 /* loading for pp */
                        ORDER BY \`articles\`.\`views_count\` DESC LIMIT 11
# => [#<Article id: 5200, …>, …, "..."]
`}
          />
          <p>
            行の末尾に <code>; nil</code> を付けて結果の表示を nil にした1行目では SQL が送られず、r を表示させた2行目で送られました。表示用の SQL は最大11件を読み、10件より多ければ最後に{' '}
            <code>"..."</code> を表示します（<code>relation.rb</code> の <code>pretty_print</code>）
            <Ref n={1} />。コンソールで SQL を送る時点を確かめるときは、<code>to_sql</code> や <code>loaded?</code> を使います。
          </p>
          <Figure n={figure(2)} title="メソッドチェーンと SQL" caption="この節の実行結果をもとにした模式図。">
            <ChainFigure />
          </Figure>
          <p>
            次の節からは、Rails のソースコードを読みながら、<code>Article.where</code> がどこに定義されているか、Relation が条件をどう保存し、いつ SQL にして送るかを確かめます。
          </p>
        </>
      ),
    },
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
            確かめるのは最後の行です。<code>delegate</code> は Active Support がクラスとモジュールに追加しているメソッドで、渡した名前のメソッドを定義します。定義されるメソッドは{' '}
            <code>to:</code> に指定した <code>all</code> を呼び、その戻り値に対して同じ名前のメソッドを呼びます。<code>*QUERYING_METHODS</code> の <code>*</code>{' '}
            は、配列の要素を1つずつの引数として渡す書き方です。<code>where</code> について書くと、この1行は次の定義と同じ動作になります。
          </p>
          <Code
            lang="ruby"
            title="delegate が定義するメソッドと同じ動作の書き方（where の場合）"
            code={`
def where(...)
  all.where(...)
end
`}
          />
          <p>
            引数の <code>(...)</code> は、受け取った引数とブロックをすべてそのまま次の呼び出しに渡す Ruby の書き方です。配列には <code>find</code>・<code>first</code>・
            <code>count</code>・<code>exists?</code>・<code>pluck</code> も入っているので、<code>Article.find(5)</code> や <code>Article.count</code> も、<code>all</code>{' '}
            が返す Relation の同じ名前のメソッドを呼んでいます。
          </p>
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
            1行目の <code>status: :published</code> は、Article の <code>enum :status</code> の宣言（<ChapterLink n={11} section="attribute-api" />）により、SQL では{' '}
            <code>status = 1</code> になりました。この変換がどこで起きるかは「Arel の構文木と SQL」の節で確かめます。<code>r3</code> は <code>each</code>{' '}
            で読み込んだ後なので、次の <code>to_a</code> では SQL が実行されません。最後の行の <code>where!</code>{' '}
            は、複製を作らずにその Relation 自身に条件を加えるメソッドです（実装は次の節で読みます）。読み込み済みの Relation は条件を変えられないので、例外{' '}
            <code>ActiveRecord::UnmodifiableRelation</code> が発生しました。
          </p>
          <p>
            Relation のクラスは <code>Article::ActiveRecord_Relation</code> です。Rails はモデルごとに Relation のサブクラスを作り、そのモデル用の委譲メソッドをそこに定義します（「スコープとクラスメソッドの委譲」の節）。
          </p>
          <p>
            SQL が送られる時点は、ログを読むときと、例外の発生場所を調べるときに関係します。コントローラーのアクションに{' '}
            <code>@articles = Article.where(author_id: 3).order(views_count: :desc)</code> と書いても、この行では SQL は送られません。ビューの{' '}
            <code>@articles.each</code> で初めて送られるので、ログの Article Load の行は、ビューを描画している間に出ます。<code>where("veiws_count &gt; 900")</code>{' '}
            のように列の名前をつづり間違えた場合の例外も、<code>where</code> の行ではなく、SQL を送る <code>each</code> の行で発生します。
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
            <code>where</code> が元の Relation を書き換えずに、条件を加えた別の Relation を返すことを、実装で確かめます。Relation の <code>where</code> は ActiveRecord::QueryMethods
            にあり、実装は次のとおりです。
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
          <ul>
            <li>
              <code>where(*args)</code> は渡された引数を配列 <code>args</code> で受け取り、3つの場合に分けています。
            </li>
            <li>
              引数が無いとき（<code>args.empty?</code>）は <code>WhereChain</code> を返します。WhereChain は <code>not</code> などのメソッドを持つクラスです。
              <code>where.not(status: :draft)</code> と書けるのは、引数の無い <code>where</code> がこのオブジェクトを返すためです。
            </li>
            <li>
              引数が1つで、それが nil や空のハッシュのとき（<code>blank?</code>）は、条件を加えずに <code>self</code> を返します。
            </li>
            <li>
              それ以外のときは <code>spawn.where!(*args)</code> を呼びます。
            </li>
            <li>
              <code>where!</code> の <code>build_where_clause(opts, rest)</code> は、ハッシュや文字列の引数から、WHERE の条件を表すオブジェクト（<code>WhereClause</code>）を作ります。
              <code>self.where_clause += …</code> は、今の条件と新しい条件を合わせた WhereClause を作って保存します。<code>where</code> を2回続けると2つの条件が AND
              でつながるのは、ここで条件を足しているためです。
            </li>
            <li>
              <code>where!</code> は最後に <code>self</code> を返します。<code>spawn.where!(*args)</code> では self が複製のほうなので、<code>where</code> の戻り値は複製の Relation です。
            </li>
          </ul>
          <p>
            <code>spawn</code> は、通常は自分を <code>clone</code> したものを返します（<code>spawn_methods.rb</code> の 9〜11 行目）。Relation を clone すると、<code>@values</code>{' '}
            のハッシュが複製され、読み込んだレコードは引き継がれません（<code>relation.rb</code> の <code>initialize_copy</code>）。複製した Relation に <code>where!</code>{' '}
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
            <code>class_eval</code> に文字列を渡すと、Ruby はその文字列をコードとして実行し、メソッドを定義します（<ChapterLink n={5} section="define-method" />）。
            <code>{'#{method_name}'}</code> と <code>{'#{name}'}</code> には値の名前が埋め込まれます。各行の右側のコメントは、name が <code>includes</code>{' '}
            のときにできるコードです。同じ形のメソッドが、<code>where_clause</code>・<code>order_values</code>・<code>limit_value</code> など、Relation
            が保存する値の種類ごとに作られます。読むほうのメソッドは、<code>@values</code> に値が無ければ既定値（空の配列や nil）を返します。書くほうのメソッドは、
            <code>assert_modifiable!</code> を呼んでから <code>@values</code> に保存します。
          </p>
          <p>
            値を書き込む前の <code>assert_modifiable!</code> は、読み込み済み（<code>@loaded</code>）か Arel を作成済み（<code>@arel</code>）なら <code>UnmodifiableRelation</code>{' '}
            を投げます（同じファイルの 1774〜1776 行目）
            <Ref n={2} />。前節の <code>where!</code> の例外はこれです。<code>!</code> の無い <code>where</code>{' '}
            は複製に条件を加えるので、読み込み済みの Relation に呼んでも例外になりません。複製は読み込んだレコードを引き継がないので、ビューで読み込み済みの{' '}
            <code>@articles</code> に <code>@articles.where(...)</code> を呼ぶと、その結果を使う時点で SQL がもう1回送られます。
          </p>
          <p>
            次の図は前節の読み込み済みの <code>r3</code> に <code>where</code> と <code>where!</code> を呼んだとき、どのオブジェクトに条件が書き込まれるかを並べたものです。左の列が{' '}
            <code>where</code>、右の列が <code>where!</code> で、上から下へ処理が進みます。
          </p>
          <Figure
            title="読み込み済みの Relation に where と where! を呼ぶ"
            caption="前節の r3 に、この節で読んだ where・where!・値を書き込むメソッドを当てはめた模式図。@values の where の値は実際には WhereClause のオブジェクト。assert_modifiable! は @arel を作成済みの Relation でも同じ例外を投げる。"
          >
            <WhereBangFigure />
          </Figure>
          <p>
            複製されることを、前の節の <code>r</code>（<code>Article.where(status: :published)</code>）で確かめました。
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
            <code>equal?</code> は、2つが同じオブジェクトかどうかを返します。<code>values</code> は <code>@values</code> の複製を返すメソッドで、r には where
            の値だけが入っています。order と limit の値は r2 のほうにだけ保存されました。
          </p>
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
            前節で作った「公開記事を新しい順に3件」という Relation を、Rails はどうやって SQL にするのでしょうか。まず <code>build_arel</code> が、保存しておいた条件・順序・件数から <Term>Arel</Term> の構文木を組み立てます。
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
            この例で見るのは3か所です。<code>arel.where(where_clause.ast)</code> が「公開済み」という条件を加え、<code>arel.take</code> が上限の 3 を設定し、<code>build_order</code> が公開日時の降順を加えます。
            <code>group_values.empty?</code> は真なので、指定していない GROUP BY の行は飛ばします。メソッドが最後に返すのは、ここまでの指定を持つ <code>arel</code> です。
          </p>
          <p>
            この木を <code>arel</code> メソッドが <code>@arel</code> に保存します。実際に中身を見ると、条件に <code>Equality</code>、順序に <code>Descending</code>、件数に <code>Limit</code> が見つかります。<Ref n={2} />
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
          <Figure n={figure(3)} title="Relation の値から SQL まで" caption="上の実行結果を図にしたもの。構文木は主な節点だけを描いている。">
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
              アダプターは、値の位置を空けた SQL を事前に準備し、実行時に値を渡す仕組み（プリペアドステートメント）を既定で使わないので（<code>mysql2_adapter.rb</code> の <code>default_prepared_statements</code> が false）、実行時には値をクォートして（文字列の値を ' で囲み、中の ' などを SQL の区切りとして読まれない形に置き換えて）SQL
              の文字列に埋め込みます。ログに値が入った SQL が出るのはこのためです
              <Ref n={4} />。
            </p>
          </Callout>
          <p>
            visitor が構文木をたどる入口は、ToSql の <code>compile</code> です。Arel::Visitors::MySQL は ToSql のサブクラスで、compile を定義し直していないので、ToSql の compile が使われます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/arel/visitors/to_sql.rb（17〜19行目）"
            href={`${GH}/activerecord/lib/arel/visitors/to_sql.rb#L17-L19`}
            code={`
      def compile(node, collector = Arel::Collectors::SQLString.new)
        accept(node, collector).value
      end
`}
          />
          <Code
            lang="ruby"
            title="activerecord/lib/arel/visitors/visitor.rb（10〜12行目、17〜21行目、27〜42行目）"
            href={`${GH}/activerecord/lib/arel/visitors/visitor.rb#L10-L42`}
            code={`
      def accept(object, collector = nil)
        visit object, collector
      end

        def self.dispatch_cache
          @dispatch_cache ||= Hash.new do |hash, klass|
            hash[klass] = :"visit_#{(klass.name || "").gsub("::", "_")}"
          end.compare_by_identity
        end

        def visit(object, collector = nil)
          dispatch_method = dispatch[object.class]
          if collector
            send dispatch_method, object, collector
          else
            send dispatch_method, object
          end
        rescue NoMethodError => e
          raise e if respond_to?(dispatch_method, true)
          superklass = object.class.ancestors.find { |klass|
            respond_to?(dispatch[klass], true)
          }
          raise(TypeError, "Cannot visit #{object.class}") unless superklass
          dispatch[object.class] = dispatch[superklass]
          retry
        end
`}
          />
          <p>
            compile は SQL の断片をためるオブジェクト（collector）を accept に渡し、最後に collector がためた文字列（<code>value</code>）を返します。accept は visit を呼ぶだけです。visit は節点のクラス名の <code>::</code> を <code>_</code> に置き換えて、呼ぶメソッドの名前を作ります。Arel::Nodes::Equality なら <code>visit_Arel_Nodes_Equality</code> で、作った名前は dispatch_cache に保存して使い回します。そのクラス用のメソッドが無いときは、先祖のクラスを順に調べ、メソッドが見つかったクラスの名前に置き換えてやり直します（<code>retry</code>）。<Ref n={15} />
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/arel/visitors/to_sql.rb（633〜646行目）"
            href={`${GH}/activerecord/lib/arel/visitors/to_sql.rb#L633-L646`}
            code={`
        def visit_Arel_Nodes_Equality(o, collector)
          right = o.right

          return collector << "1=0" if unboundable?(right)

          collector = visit o.left, collector

          if right.nil?
            collector << " IS NULL"
          else
            collector << " = "
            visit right, collector
          end
        end
`}
          />
          <p>
            visit_ で始まるメソッドは collector に SQL の断片を足し（<code>collector &lt;&lt; " = "</code>）、子の節点を visit で同じように処理します。<Ref n={16} />Equality では左辺の列を visit してから <code>" = "</code> を足し、右辺の値を visit します（右辺が nil なら <code>" IS NULL"</code> を足す）。
          </p>
          <p>デモのアプリケーション（Rails 8.1.4.1・MySQL 8.4）で、上の r を visitor に直接渡しました。</p>
          <Code
            lang="ruby"
            code={`
Article.with_connection do |c|
  c.visitor.class               # => Arel::Visitors::MySQL
  c.visitor.class.superclass    # => Arel::Visitors::ToSql
  c.prepared_statements         # => false
  c.visitor.compile(r.arel.ast, c.send(:collector))
  # => "SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`status\` = 1 ORDER BY \`articles\`.\`published_at\` DESC LIMIT 3"
end
`}
          />
          <p>
            <code>collector</code> は接続のアダプターが持つ private メソッドなので、<code>send</code> で呼びました。プリペアドステートメントを使わない mysql2 では、値を SQL に埋め込む collector（Arel::Collectors::SubstituteBinds）を返します。そのため、<code>r.arel.to_sql</code> では <code>?</code> だった位置に 1 と 3 が入りました。
          </p>
          <p>
            compile の間に呼ばれたメソッドのうち、compile・accept と、名前が visit で始まるものを TracePoint（メソッドの呼び出しと戻りを記録する Ruby の機能）で記録すると、次の順でした。字下げは呼び出しの深さで、左はメソッドを定義したクラス（Arel::Visitors:: を省略）です。
          </p>
          <Code
            lang="text"
            code={`
ToSql#compile
  Visitor#accept
    Visitor#visit
      MySQL#visit_Arel_Nodes_SelectStatement
        ToSql#visit_Arel_Nodes_SelectStatement
          MySQL#visit_Arel_Nodes_SelectCore
            ToSql#visit_Arel_Nodes_SelectCore
              Visitor#visit
                ToSql#visit_Arel_Attributes_Attribute      ← SELECT の列（articles.*）
              Visitor#visit
                ToSql#visit_Arel_Nodes_JoinSource          ← FROM
                  Visitor#visit
                    ToSql#visit_Arel_Table
              Visitor#visit
                ToSql#visit_Arel_Nodes_Equality            ← WHERE
                  Visitor#visit
                    ToSql#visit_Arel_Attributes_Attribute
                  Visitor#visit
                    ToSql#visit_ActiveModel_Attribute      ← 右辺の値（1）
          Visitor#visit
            ToSql#visit_Arel_Nodes_Descending              ← ORDER BY
              Visitor#visit
                ToSql#visit_Arel_Attributes_Attribute
          ToSql#visit_Arel_Nodes_SelectOptions
            Visitor#visit
              ToSql#visit_Arel_Nodes_Limit                 ← LIMIT
                Visitor#visit
                  ToSql#visit_ActiveModel_Attribute        ← 件数（3）
`}
          />
          <p>
            MySQL の visit_Arel_Nodes_SelectStatement と visit_Arel_Nodes_SelectCore が先に呼ばれ、super で ToSql の同じ名前のメソッドに進んでいます。図 {figure(3)} の構文木を、列、FROM、WHERE、ORDER BY、LIMIT の順にたどり、SQL の文字列を前から組み立てています。WHERE の右辺の QueryAttribute と LIMIT の値（ActiveModel::Attribute::WithCastValue）には専用のメソッドが無いので、先祖の ActiveModel::Attribute 用の <code>visit_ActiveModel_Attribute</code> が呼ばれました。
          </p>
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
            初めて一覧を表示する通常の同期処理では、<code>exec_main_query</code> が SELECT を実行して、結果の行を <code>rows</code> に入れます。
            <code>instantiate_records(rows)</code> は、その行から <code>Article</code> のインスタンスを作ります。内部で使う <code>instantiate_instance_of</code> は<ChapterLink n={11} />で読んだメソッドです。
            関連も先に読む指定があれば、続く <code>preload_associations</code> が担当します（<ChapterLink n={13} />）。<Ref n={1} />
          </p>
          <p>
            上の <code>load</code> に戻ると、完成した記事の配列は <code>@records</code> に入り、<code>@loaded</code> が真になります。<code>r.load</code> の戻り値は最後の行の <code>self</code>、つまり Relation 自身です。
            同じ <code>r</code> にもう一度 <code>to_a</code> を呼ぶと、保存済みの記事を配列で受け取れます。ここで同じ SELECT を再実行する必要はありません。
          </p>
          <p>SQL の文字列を作って DB に送るのは、exec_queries が呼ぶ <code>exec_main_query</code> から先です。</p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation.rb（1455〜1485行目）"
            href={`${GH}/activerecord/lib/active_record/relation.rb#L1455-L1485`}
            code={`
      def exec_main_query(async: false)
        if @none
          if async
            return FutureResult.wrap([])
          else
            return []
          end
        end

        skip_query_cache_if_necessary do
          if where_clause.contradiction?
            [].freeze
          elsif eager_loading?
            model.with_connection do |c|
              apply_join_dependency do |relation, join_dependency|
                if relation.null_relation?
                  [].freeze
                else
                  relation = join_dependency.apply_column_aliases(relation)
                  @_join_dependency = join_dependency
                  c.select_all(relation.arel, "#{model.name} Eager Load", async: async)
                end
              end
            end
          else
            model.with_connection do |c|
              model._query_by_sql(c, arel, async: async)
            end
          end
        end
      end
`}
          />
          <p>
            <code>none</code> を指定した Relation と、条件が矛盾していて行が無いと分かる Relation は、SQL を送らずに空の配列を返します。デモでは <code>Article.none.to_a</code> と <code>Article.where(id: []).to_a</code> のどちらも、SQL は0回でした。eager_load（関連を JOIN でまとめて読む指定）を使う場合を除くと、最後の <code>else</code> に進みます。<code>model.with_connection</code> で接続プールから接続を借り（<ChapterLink n={15} section="pool" />
            ）、<code>_query_by_sql</code> に <code>arel</code>（build_arel が作った構文木）を渡します。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/querying.rb（79〜81行目）"
            href={`${GH}/activerecord/lib/active_record/querying.rb#L79-L81`}
            code={`
    def _query_by_sql(connection, sql, binds = [], preparable: nil, async: false, allow_retry: false) # :nodoc:
      connection.select_all(sanitize_sql(sql), "#{name} Load", binds, preparable: preparable, async: async, allow_retry: allow_retry)
    end
`}
          />
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb（72〜80行目）"
            href={`${GH}/activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb#L72-L80`}
            code={`
      def select_all(arel, name = nil, binds = [], preparable: nil, async: false, allow_retry: false)
        arel = arel_from_relation(arel)
        sql, binds, preparable, allow_retry = to_sql_and_binds(arel, binds, preparable, allow_retry)

        select(sql, name, binds,
          prepare: prepared_statements && preparable,
          async: async && FutureResult::SelectAll,
          allow_retry: allow_retry
        )
`}
          />
          <p>
            _query_by_sql はログの行に出る名前（<code>"Article Load"</code>）を付けて select_all を呼びます。select_all は 74 行目の <code>to_sql_and_binds</code> で、「Arel の構文木と SQL」の節で見た <code>visitor.compile</code> を呼んで構文木を SQL の文字列にし、76 行目の <code>select</code> で実行します。<Ref n={17} />
          </p>
          <p>
            「Arel の構文木と SQL」の節と同じ r で <code>r.to_a</code> を1回実行し、その間に呼ばれた主なメソッドを TracePoint で記録しました。字下げは呼び出しの深さ、右はメソッドを定義したファイルと行です。
          </p>
          <Code
            lang="text"
            code={`
ActiveRecord::Relation#load  relation.rb:1207
  ActiveRecord::Relation#exec_queries  relation.rb:1431
    ActiveRecord::Relation#exec_main_query  relation.rb:1455
      ActiveRecord::ConnectionHandling#with_connection  connection_handling.rb:312
        ActiveRecord::ConnectionAdapters::ConnectionPool#with_connection  connection_pool.rb:452
          ActiveRecord::Querying#_query_by_sql  querying.rb:79
            ActiveRecord::ConnectionAdapters::Mysql2::DatabaseStatements#select_all  database_statements.rb:8
              ActiveRecord::ConnectionAdapters::QueryCache#select_all  query_cache.rb:263
                ActiveRecord::ConnectionAdapters::DatabaseStatements#select_all  database_statements.rb:72
                  ActiveRecord::ConnectionAdapters::DatabaseStatements#to_sql_and_binds  database_statements.rb:17
                    Arel::Visitors::ToSql#compile  to_sql.rb:17
                  ActiveRecord::ConnectionAdapters::DatabaseStatements#select  database_statements.rb:698
                    ActiveRecord::ConnectionAdapters::DatabaseStatements#internal_exec_query  database_statements.rb:554
                      ActiveRecord::ConnectionAdapters::DatabaseStatements#raw_execute  database_statements.rb:567
                        ActiveRecord::ConnectionAdapters::AbstractAdapter#log  abstract_adapter.rb:1217
                          ActiveRecord::ConnectionAdapters::Mysql2::DatabaseStatements#perform_query  database_statements.rb:41
   [sql.active_record] Article Load: SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`status\` = 1 ORDER BY \`articles\`.\`published_at\` DESC LIMIT 3
    ActiveRecord::Relation#instantiate_records  relation.rb:1487
      ActiveRecord::Querying#_load_from_sql  querying.rb:83
`}
          />
          <p>
            select_all は3つのモジュールが同じ名前で定義していて、mysql2 用、クエリキャッシュ用（QueryCache）、共通の DatabaseStatements の順に super で進みました。共通の select_all の中で、to_sql_and_binds が ToSql#compile を呼んで SQL の文字列を作り、戻ってから select に進みます。perform_query が mysql2 のドライバーで SQL を MySQL に送り、それを囲む log が終わったところで sql.active_record の通知が出ました（[sql.active_record] の行）。exec_main_query から戻った exec_queries は、instantiate_records で行から Article のインスタンスを作ります。
          </p>
          <p>
            このデモは Rails の要求の外で実行したので、クエリキャッシュは無効でした。要求を処理している間はクエリキャッシュが有効になり、QueryCache の select_all が先に SQL の文字列を作って、同じ SQL の結果が保存されていないかを調べます（「クエリキャッシュ」の節）。1件の要求の中でこの呼び出しがどこから始まるかは、<ChapterLink n={26} section="call-order" /> で確かめられます。
          </p>
          <p>ここまでの流れを、段ごとに送って確かめられるようにしたのが図 {figure(4)} です。</p>
          <Figure
            n={figure(4)}
            title="Relation の組み立てと読み込み（段階送り）"
            caption="Rails 8.1.4.1・MySQL 8.4 で r.to_a を1回実行したときの呼び出しを、8つの段と2回目の to_a にまとめた概念モデル。「次の段階」で1段ずつ進む。実際には with_connection や select_all のように同じ名前のメソッドを複数のモジュールが重ねて定義していて、段の間にほかのメソッドも入る。クエリキャッシュが有効なときは QueryCache の select_all が先に SQL を作って保存済みの結果を探し、見つかれば MySQL に SQL を送らない。"
          >
            <Stepper steps={lifecycleSteps} />
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
            表の <code>where.not</code> が作る <code>!=</code> の条件では、列の値が NULL の行は返りません。NULL を入れてよい列で否定の条件を使うときの注意は{' '}
            <ChapterLink n={36} section="not-and-null" /> で扱いました。
          </p>
          <p>
            文字列で条件を書いた場合、Rails はその中身を解釈せず、括弧で囲んでそのまま SQL に入れます。<code>?</code> を使えば値はクォートされますが、文字列の式展開（
            <code>{'"title = \'#{params[:q]}\'"'}</code>）で値を入れると SQL インジェクション（入力した文字列が SQL の一部として解釈され、意図しない SQL が実行される攻撃）になります。安全な書き方は<ChapterLink n={21} />で扱います。
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
            のサブクラスの <code>method_missing</code>（呼ばれたメソッドが見つからないときに Ruby が呼ぶメソッド。<ChapterLink n={2} section="method-missing" />）が、モデルにそのメソッドがあれば委譲メソッドを生成して呼びます。
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
          <Figure n={figure(5)} title="Relation からクラスメソッドを呼ぶ" caption="Rails 8.1.4.1 の relation/delegation.rb を読んでまとめた図。">
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
      id: 'scope-design',
      title: "用途を表すスコープを組み合わせる",
      body: (
        <>
          <p>
            <code>visible</code> や <code>recent</code> のような業務上の語で条件をまとめると、一覧やジョブの両方で同じルールを使えます。日付など毎回変わる値はラムダの内側で評価します。値の有無で選ぶ場合も <code>Relation</code> を返せるようにしておくと、呼び出し側で続けて条件を足せます。<Ref n={14} />
          </p>
          <Code
            lang="ruby"
            title={"Article に追加するスコープ"}
            code={`
scope :visible, -> { where.not(published_at: nil) }
scope :recent, -> { order(published_at: :desc, id: :desc) }
scope :published_since, ->(date) { where(published_at: date..) if date }

Article.visible.published_since(1.week.ago).recent
`}
          />
          <p>
            上の条件付きスコープが <code>nil</code> を返す場合、<code>scope</code> は条件を足さずにチェーンを続けます。同じ用途をクラスメソッドで書く場合は、条件がない場合の Relation も明示して返すと、戻り値が揃います。
          </p>
          <p>
            <code>default_scope</code> は普通の取得にも条件を足し、等値条件は <code>new</code> や <code>create</code> の初期属性にも影響することがあります。たとえば論理削除のために全件を隠すと、管理画面、ユニーク制約、関連からの操作で「見えないが DB には存在する行」を考慮する必要があります。<code>unscoped</code> ではそのモデルに付いていた条件を外すため、親に紐づけた絞り込みまで落ちないよう、必要な条件を組み立て直します。通常の画面だけが特定の行を求めるなら、明示的に <code>Article.visible</code> を使えます。<Ref n={14} />
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
              <code>first</code> は主キーの順に並べますが、<code>take</code> は並べません（ORDER BY の無い結果の並びは決まっていません）。順序が要らないなら <code>take</code> のほうが負荷の小さい SQL です。
            </li>
            <li>
              <code>exists?</code> の <code>SELECT 1 AS one … LIMIT 1</code> は、列の値を読まずに、条件に合う行が1つあるかだけを確かめる SQL です。<code>count</code> は常に COUNT の SQL を実行します。<code>size</code> は、読み込み前なら COUNT を、読み込み後なら <code>@records</code> の数を返します。デモでは、読み込み前の{' '}
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
            Executor の中では2回目に CACHE と記録され、外では2回とも実行されました。キャッシュは接続プールごとに、さらにスレッド（またはファイバー。1つのスレッドの中で、処理を途中で止めて別の処理に切り替えるための Ruby の仕組み）ごとに分けて保存され（<code>connection_adapters/abstract/query_cache.rb</code> の QueryCacheRegistry）、INSERT・UPDATE・DELETE を実行すると消えます。この実測の「外」は、config/environment を require しただけのスクリプトで取りました。このようなスクリプトや自分で作ったスレッドで動かすコードでは、Executor
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
          <p>
            各列の意味は <ChapterLink n={37} section="explain-rails" /> で確認できます。ここでは、似た条件でもどの索引が選ばれ、別の並べ替え処理が必要になるかを比べます。<Ref n={7} />
          </p>
          <p>
            ① は status = 1 の行だけを索引で読み、同じ status の中では published_at の順に並んでいるので、末尾から逆向きに読むだけで並べ替えが要りません。MySQL のマニュアルも、索引の1列目が定数で ORDER BY
            が2列目なら、索引から読んだ行はすでに2列目の順に並んでいると説明しています
            <Ref n={8} />。④ は published_at だけを条件にしているので、(status, published_at) の索引を使えず全件走査になりました。複合索引が先頭の列から順に使われる決まりと、その例外は{' '}
            <ChapterLink n={37} section="composite-index" /> で扱いました。③ は title に索引が無いので全件走査です。
          </p>
          <Figure n={figure(6)} title="複合索引 (status, published_at)" caption="模式図。索引の並びは単純化している。右の結果はデモのアプリケーション（MySQL 8.4.13）の EXPLAIN による。">
            <CompositeIndexFigure />
          </Figure>
          <p>
            Rails 7.1 以降の <code>explain</code> にはオプションを渡せ、<code>explain(:analyze)</code> は MySQL の EXPLAIN ANALYZE を実行します。EXPLAIN ANALYZE は問い合わせを実際に実行し、木の形式（TREE）で結果を表示します
            <Ref n={9} />。① の結果は次のとおりです。
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
              <Ref n={10} />。<code>explain</code> にオプションを渡す機能は 7.1 からあり、7.2 でも使えます。
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
          <li>LIMIT は並べた結果の先頭から、指定した数の行を返します。ORDER BY の値が同じ行の順番は決まっておらず、LIMIT の有無で変わることもあるので、順を決めたいときは2つ目の並べ方を加えます。</li>
          <li>where・order・limit は Relation を返すので、メソッドチェーンでつなげて書けます。SQL は each・to_a などで中身を使うときに1回だけ送られ、first や count は呼んだ時点で送られます。</li>
          <li>Article.where などは all に委譲され、条件を保存した Relation を返します。SQL は each・to_a・first などでレコードが必要になったときに実行されます。</li>
          <li>チェーンのたびに Relation は複製され、元の Relation は変わりません。読み込み済みの Relation は変更できません。</li>
          <li>Relation の値は build_arel で Arel の構文木になり、MySQL 用の visitor が SQL の文字列にします。enum などの値は列の型で変換されます。</li>
          <li>Relation からモデルのクラスメソッドを呼ぶと、scoping の中で実行されるので、Relation の条件が引き継がれます。</li>
          <li>count は常に COUNT、size は読み込み状態で切り替わり、find はステートメントキャッシュを使います。同じ SELECT はリクエストの中でクエリキャッシュされます。</li>
          <li>EXPLAIN の type・key・rows・Extra で索引の使われ方を確かめます。(status, published_at) の複合索引は、status を条件にしない問い合わせでは使われませんでした。explain(:analyze) では、見積もりの行数と実際に読んだ行数を比べられます。</li>
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
    { title: 'EXPLAIN Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/explain.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: 'EXPLAIN ANALYZE の構文と、TREE 形式が常に使われること。' },
    { title: 'activerecord/lib/active_record/relation.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/activerecord/lib/active_record/relation.rb', accessed: '2026-11-11', version: 'Rails 7.2.4', note: '7.2 の Relation が klass 属性を持つこと（8.1.4.1 の model と alias :klass との差分で確認）。' },
    { title: 'Sorting Rows', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/sorting-rows.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: 'ORDER BY が無い結果の行は決まった順に並ばないこと。ORDER BY と DESC・ASC。' },
    { title: 'LIMIT Query Optimization', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/limit-optimization.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: 'ORDER BY の列の値が同じ行は、どの順で返してもよく、実行計画によって順が変わること。' },
    { title: 'SELECT Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/select.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: 'WHERE・ORDER BY・LIMIT の書き方と、書く順。実行例は MySQL 8.4.13 で実測。' },
    { title: 'Active Record Query Interface', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'where・order・limit と all が ActiveRecord::Relation を返し、続けてメソッドを呼べること。scope。実行例は Rails 8.1.4.1 で実測。' },
    { title: 'activerecord/lib/arel/visitors/visitor.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/arel/visitors/visitor.rb#L10-L42`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'accept と visit。節点のクラス名から visit_ のメソッド名を作り、無ければ先祖のクラスのメソッドを使うこと。' },
    { title: 'activerecord/lib/arel/visitors/to_sql.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/arel/visitors/to_sql.rb#L17-L19`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'compile（17〜19行目）と visit_Arel_Nodes_Equality（633〜646行目）。collector に SQL の断片を足していくこと。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb#L72-L80`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'select_all が to_sql_and_binds（17〜51行目）で visitor.compile を呼び、select で実行すること。' },
  ],
}

export default withExplanations(ch12, explanation12)
