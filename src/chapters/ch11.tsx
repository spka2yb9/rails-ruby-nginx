import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation11 } from '../explanations/database'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 15-3 レコードの状態と、状態を変えるメソッド ---------- */
function RecordStateFigure() {
  return (
    <Svg
      id="15-3"
      w={760}
      h={330}
      label="Article.new で作ったレコードは保存前の状態で、SQL は実行されない。save または save! で INSERT が実行されて保存済みになる。find・find_by・where で読み込んだレコードも保存済みである。保存済みのレコードは update で UPDATE が実行され、destroy で DELETE が実行されて削除済みになり、凍結される。検証に失敗した save は SQL を実行せずに false を返し、save! は例外を投げ、レコードは保存前のまま残る"
    >
      <Box x={30} y={24} w={160} h={38} lines="Article.new(...)" mono fs={12} fill="bg" />
      <Arrow x1={110} y1={62} x2={110} y2={138} />
      <T x={118} y={100} fs={11.5} tone="muted">
        SQL なし
      </T>
      <Box x={290} y={24} w={200} h={38} lines="find・find_by・where" mono fs={12} fill="bg" />
      <Arrow x1={390} y1={62} x2={390} y2={138} />
      <T x={398} y={100} fs={11.5} tone="muted">
        SELECT
      </T>

      <Box x={20} y={140} w={180} h={86} lines={['保存前', 'persisted? → false', 'id → nil']} bold fs={13} subTone="muted" />
      <Box x={300} y={140} w={180} h={86} lines={['保存済み', 'persisted? → true', 'id → 10006']} bold fs={13} fill="box5" subTone="muted" />
      <Box x={580} y={140} w={160} h={86} lines={['削除済み', 'destroyed? → true', '凍結される']} bold fs={13} subTone="muted" />

      <Arrow x1={200} y1={183} x2={298} y2={183} />
      <T x={249} y={168} fs={12} mono anchor="middle">
        save・save!
      </T>
      <T x={249} y={199} fs={11.5} tone="muted" anchor="middle">
        INSERT
      </T>
      <Arrow x1={480} y1={183} x2={578} y2={183} />
      <T x={529} y={168} fs={12} mono anchor="middle">
        destroy
      </T>
      <T x={529} y={199} fs={11.5} tone="muted" anchor="middle">
        DELETE
      </T>

      <Arrow d="M360,226 C360,282 420,282 420,228" />
      <T x={390} y={298} fs={12} mono anchor="middle">
        update・save
      </T>
      <T x={390} y={316} fs={11.5} tone="muted" anchor="middle">
        UPDATE
      </T>
      <Arrow d="M80,226 C80,282 140,282 140,228" dashed />
      <T x={20} y={298} fs={11.5}>
        検証に失敗：save は false
      </T>
      <T x={20} y={316} fs={11.5} tone="muted">
        save! は例外。SQL は実行しない
      </T>
    </Svg>
  )
}

/* ---------- 図 15-4 クラス側とインスタンス側が持つもの ---------- */
function ClassInstanceFigure() {
  return (
    <Svg
      id="15-4"
      w={760}
      h={300}
      label="Article クラスは、テーブルの列の情報 columns_hash、属性ごとの型 attribute_types、既定値の集合 _default_attributes を持ち、祖先には属性メソッドを定義したモジュール Article::GeneratedAttributeMethods がある。Article のインスタンスは、属性の集合 @attributes と、@new_record などの状態を持つ。データベースから読み込んだレコードの @attributes は LazyAttributeSet で、行の値をそのまま持ち、読まれたときに型変換する"
    >
      <Box x={20} y={14} w={340} h={272} fill="bg" lines={[]} />
      <T x={34} y={34} bold>
        Article クラス
      </T>
      <Box x={36} y={50} w={308} h={44} lines={['columns_hash', '列名 → 列の情報（sql_type、default など）']} mono fs={11.5} subTone="muted" align="start" />
      <Box x={36} y={102} w={308} h={44} lines={['attribute_types', '属性名 → 型（Integer、Boolean、EnumType …）']} mono fs={11.5} subTone="muted" align="start" />
      <Box x={36} y={154} w={308} h={44} lines={['_default_attributes', 'new したときの初期値の集合']} mono fs={11.5} subTone="muted" align="start" />
      <Box x={36} y={214} w={308} h={56} lines={['Article::GeneratedAttributeMethods', 'title / title= / title_changed? …']} mono fs={11.5} fill="box2" subTone="muted" align="start" />

      <Box x={420} y={14} w={320} h={272} fill="bg" lines={[]} />
      <T x={434} y={34} bold>
        Article のインスタンス
      </T>
      <Box x={436} y={50} w={288} h={150} fill="box4" lines={[]} />
      <T x={450} y={70} mono fs={12} bold>
        @attributes
      </T>
      <T x={450} y={92} fs={11.5} tone="muted">
        LazyAttributeSet（DB から読んだ場合）
      </T>
      <T x={450} y={118} mono fs={11.5}>
        行の値: {'{"id"=>1, "published"=>1, …}'}
      </T>
      <T x={450} y={142} mono fs={11.5}>
        型変換済みの値（読んだものだけ）
      </T>
      <T x={450} y={166} mono fs={11.5}>
        代入された属性（Attribute）
      </T>
      <Box x={436} y={214} w={288} h={56} lines={['@new_record・@destroyed など', 'レコードの状態']} fs={11.5} subTone="muted" />
      <Arrow x1={362} y1={126} x2={434} y2={126} dashed />
      <T x={398} y={116} fs={11} tone="muted" anchor="middle">
        型を参照
      </T>
    </Svg>
  )
}

/* ---------- 図 15-5 行から値を読むまで ---------- */
function LazyFigure() {
  return (
    <Svg
      id="15-5"
      w={760}
      h={250}
      label="SELECT の結果の1行は、列名と値のハッシュとして返る。instantiate_instance_of は、そのハッシュと型の一覧から LazyAttributeSet を作り、allocate したインスタンスに init_with_attributes で渡す。このときは型変換をしない。a.published を読むと、LazyAttributeSet が行の値 1 を Boolean 型の deserialize で true に変換し、結果を保存して返す。2回目からは保存した値を返す"
    >
      <Box x={20} y={30} w={200} h={70} lines={['SELECT の結果（1行）', '"published" => 1', '"published_at" => Time(UTC)']} mono fs={11.5} fill="box4" subTone="muted" />
      <Arrow x1={220} y1={65} x2={278} y2={65} />
      <Box x={280} y={30} w={220} h={70} lines={['instantiate_instance_of', 'allocate（initialize は呼ばない）', '+ init_with_attributes']} mono fs={11.5} subTone="muted" />
      <Arrow x1={500} y1={65} x2={558} y2={65} />
      <Box x={560} y={30} w={180} h={70} lines={['LazyAttributeSet', '型変換はまだしない']} mono fs={11.5} fill="box5" subTone="muted" />

      <Box x={280} y={150} w={220} h={60} lines={['a.published を読む', '→ _read_attribute("published")']} mono fs={11.5} subTone="muted" />
      <Arrow x1={500} y1={180} x2={558} y2={180} />
      <Box x={560} y={140} w={180} h={80} lines={['Boolean#deserialize(1)', '→ true', '結果を保存（2回目から再利用）']} mono fs={11.5} subTone="muted" />
      <Arrow x1={650} y1={100} x2={650} y2={138} dashed />
    </Svg>
  )
}

/* ---------- 図 15-6 3つの値と変換 ---------- */
function ThreeValuesFigure() {
  return (
    <Svg
      id="15-6"
      w={760}
      h={250}
      label="属性は3種類の値を持つ。value_before_type_cast は、データベースから来た値か、代入された値そのもの。value は Ruby で扱う値で、データベースからの値は deserialize、代入された値は cast で作られる。value_for_database は保存するときの値で、value を serialize して作られる。例として、published 列はデータベースでは 1、Ruby では true、保存するときは 1 になる"
    >
      <Box x={20} y={24} w={220} h={56} lines={['データベースの値', '例: 1（tinyint(1)）']} fs={12} fill="box4" subTone="muted" />
      <Box x={20} y={150} w={220} h={56} lines={['代入された値', '例: "0"、"yes"、"12abc"']} fs={12} fill="box4" subTone="muted" />
      <Box x={330} y={88} w={200} h={56} lines={['value（Ruby の値）', '例: true']} fs={12} fill="box5" subTone="muted" />
      <Box x={600} y={88} w={140} h={56} lines={['value_for_database', '例: 1']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={240} y1={52} x2={328} y2={104} />
      <T x={276} y={66} mono fs={12}>
        deserialize
      </T>
      <Arrow x1={240} y1={178} x2={328} y2={128} />
      <T x={290} y={176} mono fs={12}>
        cast
      </T>
      <Arrow x1={530} y1={116} x2={598} y2={116} />
      <T x={564} y={104} mono fs={12} anchor="middle">
        serialize
      </T>
      <T x={20} y={234} fs={11.5} tone="muted">
        左の2つが value_before_type_cast にあたる。read_attribute_before_type_cast で読める
      </T>
    </Svg>
  )
}

/* ---------- 図 15-7 代入と変更の検出 ---------- */
function DirtyFigure() {
  return (
    <Svg
      id="15-7"
      w={760}
      h={240}
      label="データベースから読み込んだ title の属性は FromDatabase で、値は記事1。a.title に新しい値を代入すると、FromUser の属性が新しく作られ、元の FromDatabase の属性を original_attribute として持つ。changed? は、代入による変更か、読んだ値をその場で書き換えた変更があれば真になる。save に成功すると changes_applied が呼ばれ、現在の値を元の値とする新しい属性に置き換わる"
    >
      <Box x={20} y={40} w={230} h={64} lines={['FromDatabase', 'title = "記事1"']} mono fs={12} subTone="muted" />
      <Box x={330} y={40} w={230} h={64} lines={['FromUser', 'title = "変更後のタイトル"']} mono fs={12} fill="box5" subTone="muted" />
      <Arrow x1={328} y1={72} x2={252} y2={72} dashed />
      <T x={290} y={60} fs={11} tone="muted" anchor="middle">
        original
      </T>
      <T x={445} y={24} fs={11.5} anchor="middle" mono>
        a.title = "変更後のタイトル"
      </T>
      <Box x={600} y={40} w={140} h={64} lines={['changed?', '→ true']} mono fs={12} fill="bg" subTone="acc" />
      <Arrow x1={560} y1={72} x2={598} y2={72} />

      <Arrow x1={445} y1={104} x2={445} y2={150} />
      <T x={455} y={128} mono fs={11.5}>
        save → changes_applied
      </T>
      <Box x={330} y={152} w={230} h={64} lines={['FromDatabase', 'title = "変更後のタイトル"']} mono fs={12} subTone="muted" />
      <Box x={600} y={152} w={140} h={64} lines={['saved_changes', 'に記録']} mono fs={12} fill="bg" subTone="muted" />
      <Arrow x1={560} y1={184} x2={598} y2={184} />
    </Svg>
  )
}

/* ---------- 図 15-1 articles テーブルの行と列 ---------- */
function TableFigure() {
  const cols = [
    { name: 'id', type: 'bigint', w: 70 },
    { name: 'title', type: 'varchar(255)', w: 190 },
    { name: 'published', type: 'tinyint(1)', w: 110 },
    { name: 'views_count', type: 'int', w: 120 },
  ]
  const rows = [
    ['1', '変更後のタイトル', '1', '1'],
    ['2', 'タイトル2改', '1', '222'],
    ['3', '記事3', '0', '60'],
  ]
  const xs = cols.reduce<number[]>((acc, _c, i) => [...acc, i === 0 ? 20 : acc[i - 1] + cols[i - 1].w], [])
  return (
    <Svg
      id="15-1"
      w={780}
      h={290}
      label="articles テーブルを表にした図。横の並びが行で、1行が1件の記事を表す。縦の並びが列で、id・title・published・views_count などの列ごとに、bigint・varchar(255)・tinyint(1)・int のような型が決まっている。id の列は主キーで、行を1つに特定する番号が入り、同じ値も NULL も入らない。published の 1 と 0 は、Rails では true と false として扱われる"
    >
      <T x={xs[1] + cols[1].w / 2} y={20} fs={11.5} tone="acc" anchor="middle">
        列（column）
      </T>
      <Arrow x1={xs[1] + cols[1].w / 2} y1={28} x2={xs[1] + cols[1].w / 2} y2={44} accent />
      {cols.map((c, i) => (
        <g key={c.name}>
          <Box x={xs[i]} y={46} w={c.w} h={30} lines={c.name} mono fs={12} bold rx={0} fill={i === 0 ? 'box5' : 'box'} />
          <Box x={xs[i]} y={76} w={c.w} h={24} lines={c.type} mono fs={12} rx={0} fill="bg" />
          {rows.map((r, j) => (
            <Box key={j} x={xs[i]} y={100 + j * 30} w={c.w} h={30} lines={r[i]} mono={i !== 1} fs={12} rx={0} fill={i === 0 ? 'box5' : 'bg'} />
          ))}
        </g>
      ))}
      <rect x={xs[1]} y={46} width={cols[1].w} height={144} fill="none" stroke="var(--fig-accent)" strokeWidth={2} strokeDasharray="5 4" />
      <rect x={20} y={130} width={490} height={30} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={300} y={206} fs={11} tone="muted">
        … 約1万行
      </T>

      <Arrow x1={556} y1={145} x2={514} y2={145} accent />
      <T x={562} y={138} fs={12} tone="acc">
        行（row）・レコード
      </T>
      <T x={562} y={156} fs={11.5}>
        1件の記事
      </T>
      <Arrow x1={556} y1={88} x2={514} y2={88} />
      <T x={562} y={88} fs={11.5}>
        列ごとに型が決まっている
      </T>

      <Arrow x1={55} y1={236} x2={55} y2={192} />
      <T x={70} y={238} fs={12}>
        id は主キー：行を1つに特定する番号（同じ値も NULL も入らない）
      </T>
      <T x={20} y={270} fs={11} tone="muted">
        published は tinyint(1)。MySQL では 1 と 0 で、Rails では true と false になる
      </T>
    </Svg>
  )
}

/* ---------- 図 15-2 マイグレーション・テーブル・モデル ---------- */
function ModelFigure() {
  return (
    <Svg
      id="15-2"
      w={780}
      h={290}
      label="マイグレーションのファイルに create_table :articles を書き、bin/rails db:migrate を実行すると、Rails が MySQL に CREATE TABLE を送って articles テーブルができ、実行したバージョンが schema_migrations に記録される。モデルの Article クラスで Article.first を呼ぶと、Rails が SELECT … LIMIT 1 を送り、返ってきた1行の値から Article のインスタンスを作る。インスタンスの title や published は列の値を返し、published は 1 から true に変換されている"
    >
      <Box x={20} y={44} w={226} h={56} lines={['マイグレーション', 'create_table :articles']} fs={12} mono subTone="muted" />
      <Box x={20} y={126} w={226} h={56} lines={['モデル', 'class Article < ApplicationRecord']} fs={11.5} mono subTone="muted" />

      <rect x={400} y={14} width={190} height={240} rx={8} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={495} y={34} bold anchor="middle">
        MySQL
      </T>
      <Box x={412} y={50} w={166} h={116} fill="bg" lines={['articles テーブル', 'id  title  published', '1   …      1', '2   …      1', '3   …      0']} mono fs={11} subTone="muted" />
      <Box x={412} y={186} w={166} h={52} fill="bg" lines={['schema_migrations', '20261116070447']} mono fs={11} subTone="muted" />

      <Arrow x1={246} y1={72} x2={410} y2={72} />
      <T x={328} y={60} fs={11} mono anchor="middle">
        bin/rails db:migrate
      </T>
      <T x={328} y={86} fs={10.5} tone="muted" anchor="middle">
        CREATE TABLE など
      </T>

      <Arrow x1={246} y1={154} x2={410} y2={154} />
      <T x={328} y={142} fs={11} mono anchor="middle">
        Article.first
      </T>
      <T x={328} y={168} fs={10.5} mono tone="muted" anchor="middle">
        SELECT … LIMIT 1
      </T>

      <Arrow x1={580} y1={108} x2={618} y2={108} />
      <Box x={620} y={60} w={150} h={96} lines={['インスタンス a', 'a.id → 1', 'a.title → "…"', 'a.published → true']} fs={11.5} fill="box5" subTone="muted" />
      <T x={20} y={276} fs={11} tone="muted">
        Article クラスは articles テーブルに、インスタンスはその1行に対応する。列の値は属性として読める
      </T>
    </Svg>
  )
}

/* ---------- 図（番号なし） 起動直後の Article.first で列の情報を読み込む順 ---------- */
function SchemaLoadOrderFigure() {
  // 左の列 20〜340（Ruby の処理）、右の列 430〜760（MySQL に送られる SQL）
  return (
    <Svg
      id="ch11-schema-load-order"
      w={780}
      h={440}
      label="起動直後に Article.first を実行したときの処理を、上から時間の順に並べた図。Article.first は接続の設定と主キーの列名の問い合わせ（[SCHEMA]）を送った後、SELECT … LIMIT 1 を送る。返ってきた1行からレコードを作るときに init_internals が define_attribute_methods を呼ぶ。define_attribute_methods は属性メソッドが定義済みならここで終わる。初回は load_schema から load_schema! に進み、schema_cache.columns_hash がキャッシュに無い列の情報を SHOW FULL FIELDS FROM articles で問い合わせる。返ってきた列の情報から @columns_hash を作り、属性メソッドを定義する。この後は method_defined?(:title) が true になる"
    >
      <T x={20} y={18} bold fs={12.5}>
        Ruby の処理（上から時間の順）
      </T>
      <T x={430} y={18} bold fs={12.5}>
        MySQL に送られる SQL（ログ）
      </T>

      <Box x={20} y={36} w={320} h={84} lines="Article.first" mono bold fs={12.5} />
      <Box x={430} y={36} w={330} h={36} lines="[SCHEMA] 接続の設定・主キーの列名" fs={11.5} fill="box4" />
      <Arrow x1={340} y1={54} x2={428} y2={54} />
      <Box x={430} y={84} w={330} h={36} lines="[Article Load] SELECT … LIMIT 1" mono fs={11.5} fill="box4" />
      <Arrow x1={340} y1={102} x2={428} y2={102} />
      <Arrow d="M560,120 L560,159 L342,159" />
      <T x={450} y={148} fs={11.5} tone="muted" anchor="middle">
        1行の値
      </T>

      <Arrow x1={180} y1={120} x2={180} y2={138} />
      <Box x={20} y={140} w={320} h={38} lines={['行からレコードを作る', 'init_internals（core.rb）']} fs={12} subTone="muted" />
      <Arrow x1={180} y1={178} x2={180} y2={194} />
      <Box x={20} y={196} w={320} h={44} lines={['define_attribute_methods', '定義済みなら、ここで終わる（2回目以降）']} mono fs={12} subTone="muted" />
      <Arrow x1={180} y1={240} x2={180} y2={256} />
      <Box x={20} y={258} w={320} h={44} lines={['load_schema → load_schema!', '同時に読み込む処理を1つに絞る']} mono fs={12} subTone="muted" />
      <Arrow x1={180} y1={302} x2={180} y2={318} />
      <Box x={20} y={320} w={320} h={44} lines={['schema_cache.columns_hash', 'キャッシュに無ければ問い合わせる']} mono fs={12} subTone="muted" />
      <Box x={430} y={324} w={330} h={36} lines="[SCHEMA] SHOW FULL FIELDS FROM `articles`" mono fs={11.5} fill="box4" accent />
      <Arrow x1={340} y1={342} x2={428} y2={342} accent />
      <Arrow d="M560,360 L560,404 L342,404" />
      <T x={450} y={393} fs={11.5} tone="muted" anchor="middle">
        列の情報
      </T>

      <Arrow x1={180} y1={364} x2={180} y2={380} />
      <Box x={20} y={382} w={320} h={44} lines={['@columns_hash を作り、属性メソッドを定義', 'method_defined?(:title) → true']} mono fs={12} fill="box5" subTone="muted" />
    </Svg>
  )
}

/* ---------- 図（番号なし） 3件の更新の途中で失敗したとき ---------- */
function UpdateLoopFailureFigure() {
  // 左の列 20〜340（update の戻り値を見ない）、右の列 420〜730（transaction の中で update!）
  return (
    <Svg
      id="ch11-update-loop-failure"
      w={780}
      h={420}
      label="3件の記事を順に更新し、2件目が検証に失敗した場合を2つの書き方で比べた図。左の update の戻り値を見ない書き方では、1件ごとに BEGIN と COMMIT が送られる。記事1の update は UPDATE を送って確定する。記事2の update は false を返し、SQL を送らない。戻り値を見ずに記事3へ進み、記事3の update は UPDATE を送って確定する。結果として記事1と記事3だけが更新される。右のトランザクションの中で update! を使う書き方では、最初に BEGIN を送り、記事1の UPDATE はまだ確定しない。記事2の update! が ActiveRecord::RecordInvalid を投げると、記事3の update! は実行されず、処理は ROLLBACK に進んで記事1の UPDATE も取り消される。結果としてどの記事も更新されない"
    >
      <T x={20} y={20} bold fs={12.5}>
        update の戻り値を見ない
      </T>
      <T x={20} y={40} fs={11.5} tone="muted">
        1件ごとに BEGIN … COMMIT
      </T>
      <T x={420} y={20} bold fs={12.5}>
        transaction の中で update!
      </T>
      <T x={420} y={40} fs={11.5} tone="muted">
        3件を1つのトランザクションにまとめる
      </T>

      <Box x={20} y={106} w={320} h={44} lines={['記事1：update → true', 'UPDATE して COMMIT（確定する）']} fs={12} subTone="muted" />
      <Arrow x1={180} y1={150} x2={180} y2={168} />
      <Box x={20} y={170} w={320} h={44} lines={['記事2：update → false', '検証に失敗。SQL は送らない']} fs={12} subTone="danger" />
      <Arrow x1={180} y1={214} x2={180} y2={232} />
      <T x={190} y={224} fs={11.5} tone="muted">
        戻り値を見ずに次へ
      </T>
      <Box x={20} y={234} w={320} h={44} lines={['記事3：update → true', 'UPDATE して COMMIT（確定する）']} fs={12} subTone="muted" />
      <Arrow x1={180} y1={278} x2={180} y2={360} />
      <Box x={20} y={362} w={320} h={44} lines={['結果', '記事1と記事3だけ更新される']} fs={12} fill="box5" subTone="muted" />

      <Box x={420} y={58} w={310} h={30} lines="BEGIN" mono fs={12} fill="bg" />
      <Arrow x1={575} y1={88} x2={575} y2={104} />
      <Box x={420} y={106} w={310} h={44} lines={['記事1：update! → true', 'UPDATE（まだ確定しない）']} fs={12} subTone="muted" />
      <Arrow x1={575} y1={150} x2={575} y2={168} />
      <Box x={420} y={170} w={310} h={44} lines={['記事2：update!', 'ActiveRecord::RecordInvalid（例外）']} fs={12} subTone="danger" />
      <Box x={420} y={234} w={310} h={44} lines={['記事3', '実行されない']} fs={12} fill="bg" dashed subTone="muted" />
      <Arrow d="M730,192 C766,192 766,320 732,320" accent />
      <Box x={420} y={298} w={310} h={44} lines={['ROLLBACK', '記事1の UPDATE も取り消す']} fs={12} fill="bg" subTone="muted" />
      <Arrow x1={575} y1={342} x2={575} y2={360} />
      <Box x={420} y={362} w={310} h={44} lines={['結果', 'どの記事も更新されない']} fs={12} fill="box5" subTone="muted" />
    </Svg>
  )
}

const ch11: Chapter = {
  number: 11,
  part: 3,
  title: 'モデルクラスと属性',
  summary:
    'articles テーブルの1行を取り出すと、Ruby では article.title のように値を読めます。行が記事のオブジェクトに変わる過程をたどり、タイトルを書き換えてから DB に保存するまでに何が変わるかを確かめます。',
  goals: [
    'テーブルの列の定義と、記事ごとに違う属性の値を区別できる',
    '取得・作成・保存のコードと、実際に送られた SQL を対応付けられる',
    '数値や日時が Ruby の値に変わる時点と、保存の前後で変更内容を調べる方法を説明できる',
  ],
  prerequisites: [5, 8, 35],
  sections: [
    {
      id: 'table',
      title: 'articles テーブルの列と型',
      body: (
        <>
          <p>
            ここからは、記事を投稿する Rails アプリケーションを使います。前の章の実行欄で扱った利用者や口座の表から、記事・著者・コメントの表に題材が変わります。
            まず、このアプリが使う MySQL のデータベース <code>demo_development</code> にどんなテーブルがあるかを、mysql コマンドで調べました。
          </p>
          <Code
            lang="text"
            title="mysql コマンドで実行（MySQL 8.4.13。起動時の表示は省略）"
            code={`
mysql> SHOW TABLES;
+--------------------------------+
| Tables_in_demo_development     |
+--------------------------------+
| active_storage_attachments     |
| active_storage_blobs           |
| active_storage_variant_records |
| ar_internal_metadata           |
| articles                       |
| authors                        |
| comments                       |
| schema_migrations              |
| taggings                       |
| tags                           |
+--------------------------------+
10 rows in set (0.00 sec)
`}
          />
          <p>
            articles は記事、authors は著者、comments はコメントを保存するテーブルです。schema_migrations と ar_internal_metadata は Rails が管理に使うテーブルで、「マイグレーションでテーブルを作る」の節で扱います。articles
            テーブルの中身を、先頭から3件だけ表示しました（SELECT の書き方は <ChapterLink n={35} section="select" /> で扱いました）。
          </p>
          <Code
            lang="text"
            code={`
mysql> SELECT id, title, published, views_count, created_at FROM articles LIMIT 3;
+----+--------------------------+-----------+-------------+----------------------------+
| id | title                    | published | views_count | created_at                 |
+----+--------------------------+-----------+-------------+----------------------------+
|  1 | 変更後のタイトル         |         1 |           1 | 2026-11-11 07:53:47.260464 |
|  2 | タイトル2改              |         1 |         222 | 2026-11-11 07:53:47.260464 |
|  3 | 記事3                    |         0 |          60 | 2026-11-11 07:53:47.260464 |
+----+--------------------------+-----------+-------------+----------------------------+
3 rows in set (0.00 sec)
`}
          />
          <p>
            1行が1件の記事で、id・title などの列が記事の項目です（図 15-1）。テーブル・行・列・主キーとは何かは、<ChapterLink n={35} section="database" />
            で扱いました。デモの articles テーブルには約1万行あります。1件目と2件目のタイトルは、この本のほかの節の実験で書き換えたものです。
          </p>
          <p>列ごとに、入れられる値の種類（型）が決まっています。DESCRIBE で articles テーブルの列と型を表示しました。</p>
          <Code
            lang="text"
            code={`
mysql> DESCRIBE articles;
+----------------+---------------+------+-----+---------+----------------+
| Field          | Type          | Null | Key | Default | Extra          |
+----------------+---------------+------+-----+---------+----------------+
| id             | bigint        | NO   | PRI | NULL    | auto_increment |
| title          | varchar(255)  | YES  |     | NULL    |                |
| body           | text          | YES  |     | NULL    |                |
| published      | tinyint(1)    | YES  |     | NULL    |                |
| created_at     | datetime(6)   | NO   |     | NULL    |                |
| updated_at     | datetime(6)   | NO   |     | NULL    |                |
| author_id      | bigint        | YES  | MUL | NULL    |                |
| status         | int           | NO   | MUL | 0       |                |
| views_count    | int           | NO   |     | 0       |                |
| comments_count | int           | NO   |     | 0       |                |
| price          | decimal(10,2) | YES  |     | NULL    |                |
| published_at   | datetime(6)   | YES  |     | NULL    |                |
| lock_version   | int           | NO   |     | 0       |                |
+----------------+---------------+------+-----+---------+----------------+
13 rows in set (0.00 sec)
`}
          />
          <p>
            Field が列の名前、Type が型です。bigint と int は整数、varchar(255) は255文字までの文字列、text は長い文字列、datetime(6) は日時（秒の小数点以下6桁まで）、decimal(10,2)
            は全体で10桁・小数点以下2桁の数を入れる型です
            <Ref n={7} />
            <Ref n={14} />
            <Ref n={15} />。tinyint(1) は小さな整数の型で、Rails はこの型の列を真偽値（true と false）の列として扱います。published の 1 は true、0 は false を表します（「列の型と型変換」の節）。Null
            が NO の列には、値が無いことを表す NULL を入れられません。Default は値を指定せずに行を追加したときに入る値です。
          </p>
          <p>
            created_at と updated_at は、Null が NO で Default も無い列です。この2つを省いて INSERT すると、エラーになりました（INSERT の書き方は <ChapterLink n={35} section="insert" />
            ）。既定値の無い列の値を省くと、デモの MySQL の設定ではエラーになります
            <Ref n={17} />。
          </p>
          <Code
            lang="text"
            code={`
mysql> INSERT INTO articles (title) VALUES ('日時なし');
ERROR 1364 (HY000): Field 'created_at' doesn't have a default value
`}
          />
          <p>
            Rails のメソッドで行を追加するときは、Rails がこの2つの列に今の日時を自動で入れます
            <Ref n={13} />。
          </p>
          <p>
            id の Key は PRI で、id がこのテーブルの主キーであることを表します。Extra の auto_increment は、行を追加するときに id を指定しなければ、MySQL
            がそれまでより大きい番号を自動で入れることを表します
            <Ref n={16} />。Rails で作るテーブルは、特に指定しなければ id という名前の主キーを持ちます
            <Ref n={18} />。
          </p>
          <p>
            author_id はその記事を書いた著者の id を入れる列で、authors テーブルの行を指します（<ChapterLink n={13} />
            ）。author_id と status の Key にある MUL は、その列から始まる索引（値から行を早く探すための仕組み。<ChapterLink n={37} section="what-is-index" />
            ）があることを表します
            <Ref n={19} />。
          </p>
          <Figure n="15-1" title="articles テーブルの行と列" caption="上の SELECT と DESCRIBE の結果をもとにした模式図。列は一部だけを描いている。">
            <TableFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'migration',
      title: 'マイグレーションでテーブルを作る',
      body: (
        <>
          <p>
            テーブルは CREATE TABLE という SQL の文で作ります。Rails では SQL を直接書く代わりに、<Term en="migration">マイグレーション</Term>という Ruby のファイルにテーブルの作り方を書き、
            <code>bin/rails db:migrate</code> で実行します。マイグレーションのファイルは db/migrate ディレクトリに置いて、アプリケーションのコードと一緒に管理するので、ほかの開発者の環境や本番環境のデータベースにも、同じ変更を同じ順に適用できます
            <Ref n={18} />。
          </p>
          <p>
            デモをコピーした環境で、記事のモデルとテーブルを作り直しました。デモのデータベースを変えないように、ch11_migrate という別のデータベースを使っています。
            <code>bin/rails generate model</code> にモデルの名前と「列の名前:型」を並べて渡すと、マイグレーションのファイルとモデルのファイルが作られます。
          </p>
          <Code
            lang="text"
            title="bin/rails generate model の出力"
            code={`
$ bin/rails generate model Article title:string body:text published:boolean
      invoke  active_record
      create    db/migrate/20261116070447_create_articles.rb
      create    app/models/article.rb
      invoke    rspec
      create      spec/models/article_spec.rb
      invoke      factory_bot
      create        spec/factories/articles.rb
`}
          />
          <Code
            lang="ruby"
            title="db/migrate/20261116070447_create_articles.rb（生成されたファイル）"
            code={`
class CreateArticles < ActiveRecord::Migration[8.1]
  def change
    create_table :articles do |t|
      t.string :title
      t.text :body
      t.boolean :published

      t.timestamps
    end
  end
end
`}
          />
          <p>
            <code>create_table :articles</code> のブロックの中で、<code>t.string :title</code> は title という文字列の列を、<code>t.text</code> は長い文字列の列を、<code>t.boolean</code>{' '}
            は真偽値の列を作る指定です。<code>t.timestamps</code> は created_at と updated_at の2つの列を作ります。id の列は書いていませんが、create_table が主キーの id
            を自動で加えます。ファイル名の先頭の 20261116070447 はファイルを作った日時で、マイグレーションを区別する番号（バージョン）として使われます
            <Ref n={18} />。rspec と factory_bot の行は、デモに入れてあるテスト用の gem がテストのファイルも作ったことを表します（<ChapterLink n={20} />
            ）。
          </p>
          <p>
            <code>bin/rails db:create</code> でデータベースを作り、<code>bin/rails db:migrate</code> でマイグレーションを実行しました。
          </p>
          <Code
            lang="text"
            code={`
$ bin/rails db:create
Created database 'ch11_migrate'
$ bin/rails db:migrate
== 20261116070447 CreateArticles: migrating ===================================
-- create_table(:articles)
   -> 0.0580s
== 20261116070447 CreateArticles: migrated (0.0580s) ==========================
`}
          />
          <p>ログ（log/development.log）には、実行された SQL が残っていました。</p>
          <Code
            lang="text"
            title="log/development.log（一部を省略）"
            code={`
CREATE TABLE \`articles\` (\`id\` bigint NOT NULL AUTO_INCREMENT PRIMARY KEY, \`title\` varchar(255),
  \`body\` text, \`published\` boolean, \`created_at\` datetime(6) NOT NULL, \`updated_at\` datetime(6) NOT NULL)
INSERT INTO \`schema_migrations\` (\`version\`) VALUES ('20261116070447')
`}
          />
          <p>
            Ruby で書いた create_table が CREATE TABLE の SQL になりました。string は varchar(255) に、boolean は MySQL の boolean になり、boolean の列は MySQL の中では tinyint(1)
            として作られます（前の節の DESCRIBE の published）
            <Ref n={7} />。
          </p>
          <p>
            続く INSERT は実行したマイグレーションのバージョンを schema_migrations テーブルに記録しています。db:migrate をもう一度実行すると、記録済みのマイグレーションは実行されず、何も表示されませんでした。
            <code>db:migrate:status</code> はマイグレーションごとに実行済み（up）かどうかを表示します。
          </p>
          <Code
            lang="text"
            code={`
$ bin/rails db:migrate
$ bin/rails db:migrate:status

database: ch11_migrate

 Status   Migration ID    Migration Name
--------------------------------------------------
   up     20261116070447  Create articles

mysql> SELECT * FROM schema_migrations;
+----------------+
| version        |
+----------------+
| 20261116070447 |
+----------------+
1 row in set (0.01 sec)
`}
          />
          <p>
            新しいマイグレーションのファイルを足して db:migrate を実行すると、まだ記録されていないファイルだけが実行されます。マイグレーションを実行した後、Rails はその時点のテーブルの構造を
            db/schema.rb に書き出します
            <Ref n={18} />。
          </p>
          <Code
            lang="ruby"
            title="db/schema.rb（コメントを除く）"
            code={`
ActiveRecord::Schema[8.1].define(version: 2026_11_16_070447) do
  create_table "articles", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.boolean "published"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end
end
`}
          />
          <p>
            デモの articles テーブルは、このマイグレーションの後に列を追加するマイグレーションを実行して、前の節で見た13列になっています。<code>add_reference</code> は著者の id を入れる
            author_id の列と、その列の索引を、<code>add_column</code> は列を、<code>add_index</code> は索引を追加します。<code>null: false</code> は NULL を入れられない列にする指定、
            <code>default: 0</code> は Default の値です。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261111100002_extend_articles.rb（デモ）"
            code={`
class ExtendArticles < ActiveRecord::Migration[8.1]
  def change
    add_reference :articles, :author, foreign_key: true
    add_column :articles, :status, :integer, null: false, default: 0
    add_column :articles, :views_count, :integer, null: false, default: 0
    add_column :articles, :comments_count, :integer, null: false, default: 0
    add_column :articles, :price, :decimal, precision: 10, scale: 2
    add_column :articles, :published_at, :datetime
    add_column :articles, :lock_version, :integer, null: false, default: 0
    add_index :articles, [:status, :published_at]
  end
end
`}
          />
        </>
      ),
    },
    {
      id: 'model',
      title: 'テーブルに対応するモデルのクラス',
      body: (
        <>
          <p>generate model が作った app/models/article.rb は、次の2行だけです。</p>
          <Code
            lang="ruby"
            title="app/models/article.rb（生成されたファイル）"
            code={`
class Article < ApplicationRecord
end
`}
          />
          <p>
            ApplicationRecord を継承したクラスを<Term en="model">モデル</Term>と呼びます。ApplicationRecord は ActiveRecord::Base を継承したクラスで、ActiveRecord は Rails
            のうちデータベースとのやり取りを受け持つ部分です。モデルのクラスは1つのテーブルに対応し、Article は articles テーブルを扱います。テーブル名はクラス名を小文字にして複数形にしたもので、クラスに書かなくても
            Rails が決めます
            <Ref n={13} />。
          </p>
          <p>
            デモのアプリケーションで Article のメソッドを呼び、送られた SQL を確かめました。<code>bin/rails runner</code>（アプリケーションを読み込んだ状態で Ruby のスクリプトを実行するコマンド）でスクリプトを実行し、ActiveRecord
            がログに書く SQL を画面に表示しています。
          </p>
          <Code
            lang="text"
            title="bin/rails runner で実行（インスタンスの表示とログの一部を省略）"
            code={`
Article.table_name       # => "articles"
  Article Load (0.5ms)  SELECT \`articles\`.* FROM \`articles\` ORDER BY \`articles\`.\`id\` ASC LIMIT 1
a = Article.first        # => #<Article id: 1, title: "変更後のタイトル", ...>
a.id                     # => 1
a.title                  # => "変更後のタイトル"
a.published              # => true
a.created_at             # => 2026-11-11 07:53:47.260464000 UTC +00:00
Article.column_names     # => ["id", "title", "body", "published", "created_at", "updated_at",
                         #     "author_id", "status", "views_count", "comments_count", "price", ...]
  Article Count (1.7ms)  SELECT COUNT(*) FROM \`articles\`
Article.count            # => 10004
  Article Load (0.6ms)  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 3 LIMIT 1
b = Article.find(3)      # => #<Article id: 3, title: "記事3", ...>
b.title                  # => "記事3"
b.published              # => false
`}
          />
          <p>
            <code>Article.first</code> は主キーの小さい順に並べた最初の1行を取り出す SELECT を送り、その行の値から Article のインスタンスを作って返しました。ログの Article Load
            は Article の行を読み込んだことを、括弧の中はかかった時間を表します。<code>`articles`.*</code> は articles のすべての列、<code>ORDER BY … ASC LIMIT 1</code>{' '}
            は id の小さい順に並べた先頭の1行という意味です（<ChapterLink n={35} section="where" />
            ）。<code>find(3)</code> は WHERE で id が 3 の行を取り出し、<code>count</code> は行の数を数える <code>COUNT(*)</code> を送りました。
          </p>
          <p>
            インスタンスの <code>title</code> や <code>published</code> は、その行の列の値を返します。article.rb には title というメソッドを書いていませんが、Rails
            がデータベースから列の一覧を読み、列と同じ名前のメソッドを用意します。<code>column_names</code> は Rails が読んだ列の名前です。このように列に対応してインスタンスが持つ値を
            <Term en="attribute">属性</Term>と呼び、<code>title</code> や <code>title=</code> のように属性を読み書きするメソッドを属性メソッドと呼びます。
          </p>
          <p>
            MySQL では published の値は 1 と 0 でしたが、Article のインスタンスでは true と false になっています。Rails は列の型に合わせて、データベースの値を Ruby
            の値に変換します（「列の型と型変換」の節）。ここまでのマイグレーション・テーブル・モデルの関係を図 15-2 にまとめます。
          </p>
          <Figure n="15-2" title="マイグレーション・テーブル・モデル" caption="この節と前の節の実行結果をもとにした模式図。">
            <ModelFigure />
          </Figure>
          <p>
            次の節からはデモの Article を使います。デモの Article には関連（<ChapterLink n={13} />
            ）などの宣言を足してありますが、列を読み書きするメソッドは書いていません。まず、行を作成・取得・更新・削除する Rails のメソッドと、それぞれが送る SQL を確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'crud',
      title: '基本操作と使い分け',
      body: (
        <>
          <p>
            この章から<ChapterLink n={15} />までは、<ChapterLink n={1} />で説明したデモのアプリケーションに著者（authors）・記事（articles）・コメント（comments）・タグ（tags、taggings）のテーブルを加え、MySQL 8.4.13
            につないで実測します。記事は1万件、コメントは2970件入れてあります。articles テーブルの列とモデルは次のとおりです。
          </p>
          <Code
            lang="text"
            code={`
id:bigint  title:varchar(255)  body:text  published:tinyint(1)  status:int
author_id:bigint  views_count:int  comments_count:int  price:decimal(10,2)
published_at:datetime(6)  lock_version:int  created_at:datetime(6)  updated_at:datetime(6)
`}
          />
          <Code
            lang="ruby"
            title="app/models/article.rb"
            code={`
class Article < ApplicationRecord
  belongs_to :author, optional: true
  has_many :comments
  has_many :taggings
  has_many :tags, through: :taggings
  enum :status, { draft: 0, published: 1, archived: 2 }
  scope :recent, -> { order(published_at: :desc) }
end
`}
          />
          <p>
            belongs_to と has_many は関連（<ChapterLink n={13} />）、enum は列の整数に名前を付ける宣言（「attribute API と enum」の節）、scope は検索条件に名前を付ける宣言（
            <ChapterLink n={12} section="chain" />）です。内部の仕組みを見る前に、レコードを作成・取得・更新・削除する基本のメソッドについて、戻り値と実行される SQL、失敗したときの動作を確かめます。create!・update!・destroy
            などが送る SQL は、同じ操作の SQL の文と並べて <ChapterLink n={35} section="insert-rails" /> などで確かめました。この節では、モデルに{' '}
            <code>validates :title, presence: true</code>（タイトルが空なら保存しないための検証。<ChapterLink n={14} section="validations" />）を加えて実行しました。コメントに書いた SQL
            は、デモのアプリケーションが実行したものです。
          </p>
          <h3>作成：new・save・create</h3>
          <Code
            lang="ruby"
            code={`
a = Article.new(title: "Rails入門")
a.persisted?   # => false（まだ保存されていない）
a.id           # => nil

a.save         # => true
#   BEGIN
#   INSERT INTO \`articles\` (\`title\`, \`body\`, …, \`lock_version\`) VALUES ('Rails入門', NULL, …, 0)
#   COMMIT
a.id           # => 10006
a.persisted?   # => true
`}
          />
          <p>
            <code>new</code> はオブジェクトを作るだけで、SQL を実行しません。データベースに行が入るのは <code>save</code> を呼んだときです。<code>save</code> は INSERT
            を<Term en="transaction">トランザクション</Term>（複数の SQL をまとめて確定するか、まとめて取り消す仕組み。<ChapterLink n={38} section="transaction" />）の中で実行し、成功すると true を返します。BEGIN で始めて COMMIT で確定しています。保存すると、データベースが採番した id がオブジェクトに入ります。
          </p>
          <p>保存に失敗したときの動作は、メソッドによって違います。タイトルを空にして試しました。</p>
          <Code
            lang="ruby"
            code={`
b = Article.new(title: "")
b.save                    # => false（SQL は実行されない）
b.errors.full_messages    # => ["Title can't be blank"]
b.save!                   # ActiveRecord::RecordInvalid: Validation failed: Title can't be blank

c = Article.create(title: "")   # 例外にならず、保存されていないオブジェクトが返る
c.persisted?                    # => false
Article.create!(title: "")      # ActiveRecord::RecordInvalid: Validation failed: Title can't be blank
`}
          />
          <p>
            <code>save</code> は、検証に失敗すると SQL を実行せずに false を返し、失敗の理由を <code>errors</code> に入れます。名前が <code>!</code> で終わる <code>save!</code> は、false
            を返す代わりに ActiveRecord::RecordInvalid という例外を投げます（例外は処理を途中で止めて失敗を呼び出し元に知らせる Ruby の仕組みです。rescue で受け止めなければ、それより後の処理は実行されません）。<code>create</code> は <code>new</code> と <code>save</code> を続けて行うメソッドで、保存できたかどうかに関係なく、作ったオブジェクトを返します
            <Ref n={13} />。そのため <code>if Article.create(...)</code> と書いても、失敗を判定できません。結果を確かめるには <code>persisted?</code> を使うか、<code>create!</code> を使います。
          </p>
          <h3>取得：find・find_by・where</h3>
          <Code
            lang="ruby"
            code={`
Article.find(10006)                     # => id が 10006 の Article
#   SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 10006 LIMIT 1
Article.find(0)                         # ActiveRecord::RecordNotFound: Couldn't find Article with 'id'=0

Article.find_by(title: "Rails入門")     # => 条件に合う最初の Article
#   SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`title\` = 'Rails入門' LIMIT 1
Article.find_by(title: "存在しない")    # => nil
Article.find_by!(title: "存在しない")   # ActiveRecord::RecordNotFound

r = Article.where(title: "Rails入門")   # => Relation（この時点では SQL を実行しない）
r.to_a.size                             # => 1
#   SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`title\` = 'Rails入門'
`}
          />
          <p>
            <code>find</code> は主キー（id）で1件を取り出し、見つからなければ ActiveRecord::RecordNotFound を投げます。コントローラーの中でこの例外が起きると、Rails は 404（ページが見つからないことを表す HTTP のステータスコード）
            の応答を返します（<ChapterLink n={10} section="exceptions" />）。<code>find_by</code> は条件に合う最初の1件を返し、見つからなければ nil を返します。<code>where</code>{' '}
            は条件に合うすべての行を表す Relation（検索条件を保存したオブジェクト）を返し、<code>each</code> や <code>to_a</code> で中身を使うときに初めて SQL を実行します（
            <ChapterLink n={12} />）。
          </p>
          <h3>更新：update・update!</h3>
          <p>最初に保存した <code>a</code>（id は 10006）を更新しました。</p>
          <Code
            lang="ruby"
            code={`
a.update(title: "Rails入門 第2版")   # => true
#   BEGIN
#   UPDATE \`articles\` SET \`articles\`.\`title\` = 'Rails入門 第2版', \`articles\`.\`updated_at\` = '…',
#     \`articles\`.\`lock_version\` = 1 WHERE \`articles\`.\`id\` = 10006 AND \`articles\`.\`lock_version\` = 0
#   COMMIT

a.update(title: "")    # => false（SQL は実行されない）
a.title                # => ""（オブジェクトの値は変わったまま）
a.reload.title         # => "Rails入門 第2版"（データベースから読み直す）
a.update!(title: "")   # ActiveRecord::RecordInvalid: Validation failed: Title can't be blank
`}
          />
          <p>
            <code>update</code> は、渡した値を代入してから <code>save</code> します。UPDATE に入るのは、変更した列と <code>updated_at</code> だけです（<ChapterLink n={11} section="dirty">この章の「変更の追跡」</ChapterLink>）。
            <code>lock_version</code> は<ChapterLink n={15} section="optimistic" />の楽観的ロック（同じ行を2つの処理が同時に書き換えたとき、後から保存したほうを失敗させる仕組み）に使う列で、デモの articles テーブルにあるため一緒に更新されています。検証に失敗すると false
            を返しますが、オブジェクトには代入した値が残ります。データベースの値に戻すには <code>reload</code> を使います。
          </p>
          <h3>削除：destroy</h3>
          <p>続けて、同じ <code>a</code> を削除しました。</p>
          <Code
            lang="ruby"
            code={`
a.destroy               # => 削除した Article（a 自身）
#   BEGIN
#   DELETE FROM \`articles\` WHERE \`articles\`.\`id\` = 10006 AND \`articles\`.\`lock_version\` = 1
#   COMMIT
a.destroyed?            # => true
Article.exists?(a.id)   # => false
a.update(title: "x")    # FrozenError: can't modify frozen attributes
`}
          />
          <p>
            <code>destroy</code> は DELETE を実行し、削除したオブジェクトを返します。削除したオブジェクトは凍結され、値を変更できなくなります。デモでは、BEGIN の後に ActiveStorage
            の添付ファイル（<ChapterLink n={19} />）を調べる SELECT も実行されましたが、上では省略しています。<code>destroy</code> はコールバック（保存や削除の前後に実行するように登録しておく処理。<ChapterLink n={14} />）を実行してから削除します。コールバックを実行しない{' '}
            <code>delete</code> との違いは<ChapterLink n={14} section="skip" />で扱います。
          </p>
          <p>ここまでの結果をまとめると、図 15-3 と次の表のようになります。</p>
          <Figure n="15-3" title="レコードの状態と、状態を変えるメソッド" caption="この節の実行結果をまとめた模式図。破線は、検証に失敗して状態が変わらない場合を表す。">
            <RecordStateFigure />
          </Figure>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>メソッド</th>
                  <th>成功したときの戻り値</th>
                  <th>失敗したとき</th>
                  <th>SQL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>new</code>
                  </td>
                  <td>保存前のオブジェクト</td>
                  <td>—</td>
                  <td>実行しない</td>
                </tr>
                <tr>
                  <td>
                    <code>save</code> / <code>save!</code>
                  </td>
                  <td>true</td>
                  <td>false / ActiveRecord::RecordInvalid</td>
                  <td>INSERT または UPDATE</td>
                </tr>
                <tr>
                  <td>
                    <code>create</code> / <code>create!</code>
                  </td>
                  <td>保存したオブジェクト</td>
                  <td>保存していないオブジェクト / ActiveRecord::RecordInvalid</td>
                  <td>INSERT</td>
                </tr>
                <tr>
                  <td>
                    <code>update</code> / <code>update!</code>
                  </td>
                  <td>true</td>
                  <td>false / ActiveRecord::RecordInvalid</td>
                  <td>UPDATE</td>
                </tr>
                <tr>
                  <td>
                    <code>find</code>
                  </td>
                  <td>1件のオブジェクト</td>
                  <td>ActiveRecord::RecordNotFound</td>
                  <td>SELECT … LIMIT 1</td>
                </tr>
                <tr>
                  <td>
                    <code>find_by</code> / <code>find_by!</code>
                  </td>
                  <td>1件のオブジェクト</td>
                  <td>nil / ActiveRecord::RecordNotFound</td>
                  <td>SELECT … LIMIT 1</td>
                </tr>
                <tr>
                  <td>
                    <code>where</code>
                  </td>
                  <td>Relation</td>
                  <td>（該当が無ければ中身が0件）</td>
                  <td>中身を使うときに SELECT</td>
                </tr>
                <tr>
                  <td>
                    <code>destroy</code> / <code>destroy!</code>
                  </td>
                  <td>削除したオブジェクト</td>
                  <td>false / ActiveRecord::RecordNotDestroyed（コールバックで中断したとき）</td>
                  <td>DELETE</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>destroy</code> の失敗は、削除の前に実行するコールバック（before_destroy）が削除を中断したときに起こります。デモで試すと、<code>destroy</code> は false を返し、
            <code>destroy!</code> は ActiveRecord::RecordNotDestroyed を投げました。
          </p>
          <h3>使い分け</h3>
          <p>
            <code>!</code> の有無は、失敗したときに処理をどう続けたいかで選びます
            <Ref n={13} />。
          </p>
          <ul>
            <li>
              利用者の入力を保存するコントローラーでは、検証に失敗するのは想定内です。<code>save</code> や <code>update</code> の戻り値で分岐し、入力画面にエラーを表示します（
              <ChapterLink n={16} section="form">
                第20章の「フォームから保存まで」
              </ChapterLink>
              ）。
            </li>
            <li>
              初期データの投入、バッチ、ジョブ、テストのデータの準備など、失敗しないはずの保存には <code>save!</code> や <code>create!</code> を使います。戻り値の false を見落として、保存されていないまま処理が続くことを防げます。
            </li>
            <li>
              URL の id で記事を表示するときのように、見つからなければ 404 にしてよい場合は <code>find</code> を使います。見つからないことが普通にある場合は <code>find_by</code> を使い、nil
              のときの処理を書きます。
            </li>
          </ul>
          <p>
            <code>save</code> がどのモジュールを通り、検証・コールバック・SQL がどの順に実行されるかは<ChapterLink n={14} />で、<code>where</code> が SQL になるまでは
            <ChapterLink n={12} />で扱います。この章では、これらのメソッドが扱うモデルのクラスとインスタンスの中身を見ていきます。
          </p>
        </>
      ),
    },
    {
      id: 'record-pattern',
      title: "テーブルの規約と Active Record パターン",
      body: (
        <>
          <p>
            Active Record パターンでは、DB の1行を表すオブジェクトが、属性と、その行に関する動作を持ちます。<code>article.title</code> で値を取得し、<code>article.save</code> で変更を保存できるのはそのためです。状態を表すオブジェクトと永続化を担当する別のオブジェクトに分ける Data Mapper 型の設計もあります。Rails では一つの行に紐づく規則をモデルに置くところから始めると、検証やトランザクションとつなげやすくなります。<Ref n={13} />
          </p>
          <p>
            <code>Person</code> が <code>people</code> になるように、不規則な複数形にも Rails の変換規則があります。既存の DB で主キー名が規約と異なる場合は <code>self.primary_key = "article_no"</code> と指定できます。Rails が使う主キー名と、DB が実際に保証する一意性を揃えます。<Ref n={13} />
          </p>
          <h3>更新処理の失敗を扱う単位</h3>
          <p>
            たとえば三件の記事をまとめて承認する処理で二件目の <code>update</code> が <code>false</code> になっても、戻り値を見ないままループを続ければ途中の更新が残ります。全件まとめて確定したいなら <code>update!</code> の失敗をトランザクションまで伝えるなど、失敗が処理全体に届く契約にします。<Ref n={13} />（<ChapterLink n={15} section="transaction">トランザクションの開始と終了</ChapterLink>）。
          </p>
          <p>
            次の図は3件の記事を順に更新して2件目が検証に失敗した場合を、2つの書き方で比べたものです。左は <code>update</code> の戻り値を見ずにループを続けた場合、右はトランザクションの中で{' '}
            <code>update!</code> を使った場合です。どちらも上から時間の順に並べています。
          </p>
          <Figure
            title="3件の更新の途中で失敗したとき"
            caption="模式図。左で1件ごとに BEGIN と COMMIT が送られることは、「基本操作と使い分け」の節で update を実行して確かめた。右の破線の箱は実行されない処理、右端の太い青の矢印は、例外が起きて記事3を実行せずに ROLLBACK に進む経路を表す。"
          >
            <UpdateLoopFailureFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'overview',
      title: 'クラスとインスタンスが持つもの',
      body: (
        <>
          <p>
            モデルの情報はクラスとインスタンスに分かれて保存されています。クラスはテーブルの列の情報（<code>columns_hash</code>）、属性ごとの型（<code>attribute_types</code>
            ）、新しいレコードの初期値（<code>_default_attributes</code>）を持ち、祖先（メソッドを探すときに Ruby が順にたどるクラスとモジュールの並び。<ChapterLink n={2} section="method-lookup" />）には <code>title</code> などのメソッドを定義したモジュールがあります。インスタンスは、属性の値の集合（<Term en="attribute set">AttributeSet</Term>）である{' '}
            <code>@attributes</code> と、保存済みかどうかなどの状態を持ちます。
          </p>
          <Figure n="15-4" title="クラス側とインスタンス側が持つもの" caption="模式図。Rails 8.1.4.1 の model_schema.rb・attributes.rb・core.rb を読んでまとめた。">
            <ClassInstanceFigure />
          </Figure>
          <p>この章では、これらがいつ、どのように作られるかを順に見ていきます。</p>
        </>
      ),
    },
    {
      id: 'schema',
      title: '列の情報を読み込む時点',
      body: (
        <>
          <p>
            Article クラスを定義しただけでは、列の情報は読み込まれません。読み込みは、最初にレコードを作るときなどに <code>load_schema</code> で行われます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/model_schema.rb（604〜618行目）"
            href={`${GH}/activerecord/lib/active_record/model_schema.rb#L604-L618`}
            code={`
        def load_schema!
          unless table_name
            raise ActiveRecord::TableNotSpecified, "#{self} has no table configured. Set one with #{self}.table_name="
          end

          columns_hash = schema_cache.columns_hash(table_name)
          if only_columns.present?
            columns_hash = columns_hash.slice(*only_columns)
          elsif ignored_columns.present?
            columns_hash = columns_hash.except(*ignored_columns)
          end
          @columns_hash = columns_hash.freeze

          _default_attributes # Precompute to cache DB-dependent attribute types
        end
`}
          />
          <p>
            列の情報は、接続プール（データベースとの接続をためておき、使い回す仕組み。<ChapterLink n={15} section="pool" />）ごとのスキーマキャッシュ（<code>schema_cache</code>）から取り出します。キャッシュに無ければ、MySQL では <code>SHOW FULL FIELDS</code>{' '}
            で問い合わせます。<code>only_columns</code> を指定したときの <code>slice</code> は、指定した列だけを残します。<code>ignored_columns</code> を指定したときの <code>except</code> は、指定した列を除きます。こうしてモデルが使う列の一覧が決まります。<Ref n={1} />
          </p>
          <p>
            初めて記事を読む要求が同時に2件届いても、同じ準備を二重にする必要はありません。<code>load_schema</code> は Ruby の Monitor で同時に読み込める処理を1つに絞り、後から入った処理は読み込み済みの情報を使います（同じファイルの 550〜562 行目）。
          </p>
          <p>
            <code>load_schema</code> を呼ぶのは、属性メソッドを定義する <code>define_attribute_methods</code> などです。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/attribute_methods.rb（104〜125行目）"
            href={`${GH}/activerecord/lib/active_record/attribute_methods.rb#L104-L125`}
            code={`
      def define_attribute_methods # :nodoc:
        return false if @attribute_methods_generated
        # Use a mutex; we don't want two threads simultaneously trying to define
        # attribute methods.
        GeneratedAttributeMethods::LOCK.synchronize do
          return false if @attribute_methods_generated

          superclass.define_attribute_methods unless base_class?

          unless abstract_class?
            load_schema
            super(attribute_names)
            alias_attribute :id_value, :id if _has_attribute?("id") && !_has_attribute?("id_value")
          end

          generate_alias_attributes

          @attribute_methods_generated = true
        end

        true
      end
`}
          />
          <p>
            <code>define_attribute_methods</code> は、レコードを初期化するとき（<code>core.rb</code> の <code>init_internals</code>）や、定義前のメソッドが呼ばれた{' '}
            <code>method_missing</code> から呼ばれます
            <Ref n={2} />。デモのアプリケーション（development。開発用の設定で動かす環境）で、起動直後に <code>Article.first</code> を実行したときの SQL を記録しました。
          </p>
          <Code
            lang="text"
            code={`
Article.method_defined?(:title)   # => false（まだ定義されていない）
Article.first
  [SCHEMA] SET @@SESSION.sql_mode = CONCAT(CONCAT(@@sql_mode, ',STRICT_ALL_TABLES'), ...
  [SCHEMA] SELECT table_name FROM information_schema.tables WHERE table_schema = database()
  [SCHEMA] SELECT column_name FROM information_schema.statistics WHERE index_name = 'PRIMARY' ...
  [Article Load] SELECT \`articles\`.* FROM \`articles\` ORDER BY \`articles\`.\`id\` ASC LIMIT 1
  [SCHEMA] SHOW FULL FIELDS FROM \`articles\`
Article.method_defined?(:title)   # => true
`}
          />
          <p>
            最初の SET は接続したときの設定です。主キーの列名を調べてから SELECT を実行し、取得した行からレコードを作る段階で <code>SHOW FULL FIELDS</code>{' '}
            が実行され、属性メソッドが定義されました。2回目以降のリクエストでは、スキーマの問い合わせは行われません。
          </p>
          <p>
            次の図は上の SQL の記録と、その間に呼ばれるメソッドを並べたものです。左の列を上から読むと時間の順になり、右の列にはそれぞれの時点で MySQL に送られた SQL を置きました。SHOW FULL FIELDS が SELECT
            の後に送られるのは、行からレコードを作る段階で列の情報を読み込むためです。
          </p>
          <Figure
            title="起動直後の Article.first で列の情報を読み込む順"
            caption="上の実行結果と引用したコードをもとにした模式図。右の最初の箱は [SCHEMA] が付いたログの最初の3行をまとめたもの。右から左への矢印は MySQL から返る結果、太い青の矢印は列の情報の問い合わせを表す。"
          >
            <SchemaLoadOrderFigure />
          </Figure>
          <Callout kind="note">
            <p>
              <code>bin/rails db:schema:cache:dump</code> で列の情報を <code>db/schema_cache.yml</code> に書き出しておくと、本番で起動した後の最初のリクエストでスキーマを問い合わせずに済みます。Rails
              8.1.4.1 の ActiveRecord::Railtie には、production でこのキャッシュがあり、<code>config.active_record.check_schema_cache_dump_version</code> が false の場合に、起動時に属性メソッドを定義しておく初期化処理があります。コメントによると、既定でこれを行わないのは、データベースが応答しないときでもアプリケーションを起動できるようにするためです（<code>railtie.rb</code>{' '}
              の 148〜185 行目）
              <Ref n={3} />。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'instantiate',
      title: 'データベースの行からレコードを作る',
      body: (
        <>
          <p>
            SELECT の結果の各行は、列名と値のハッシュとして ActiveRecord に渡され、次のメソッドでレコードになります。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/persistence.rb（311〜314行目）"
            href={`${GH}/activerecord/lib/active_record/persistence.rb#L311-L314`}
            code={`
        def instantiate_instance_of(klass, attributes, column_types = {}, &block)
          attributes = klass.attributes_builder.build_from_database(attributes, column_types)
          klass.allocate.init_with_attributes(attributes, &block)
        end
`}
          />
          <p>
            記事を読む例なら、<code>klass</code> は Article、最初の <code>attributes</code> は先ほどの id・title・published などの値です。<code>build_from_database</code> がこれらの値と列の型の情報を組み合わせます。
            次に <code>klass.allocate</code> で記事1件分のオブジェクトを用意し、<code>init_with_attributes</code> で属性を渡して保存済みの状態にします。取得後に呼ぶ処理を登録してあれば、ここで after_find、after_initialize の順に呼びます（<code>core.rb</code> の 509〜521 行目）
            <Ref n={4} />。
          </p>
          <p>
            <code>build_from_database</code> が作るのは <code>ActiveModel::LazyAttributeSet</code> です。行の値と型の一覧を受け取るだけで、型変換はしません。
          </p>
          <Code
            lang="ruby"
            title="activemodel/lib/active_model/attribute_set/builder.rb（41〜58行目）"
            href={`${GH}/activemodel/lib/active_model/attribute_set/builder.rb#L41-L58`}
            code={`
    def fetch_value(name, &block)
      if attr = @attributes[name]
        return attr.value(&block)
      end

      @casted_values.fetch(name) do
        value_present = true
        value = values.fetch(name) { value_present = false }

        if value_present
          type = additional_types.fetch(name, types[name])
          @casted_values[name] = type.deserialize(value)
        else
          attr = default_attribute(name, value_present, value)
          attr.value(&block)
        end
      end
    end
`}
          />
          <p>
            id が 3 の記事で <code>article.published</code> を初めて読むと、<code>name</code> は列名の <code>"published"</code>、<code>value</code> は DB から届いた 0 です。
            <code>type.deserialize(value)</code> が 0 を Ruby の <code>false</code> に変え、<code>@casted_values</code> に記録します。もう一度同じ記事の published を読むと、その値を取り出せます。まだ読んでいない列の変換は後に残ります。<Ref n={5} />
          </p>
          <Figure n="15-5" title="行から値を読むまで" caption="Rails 8.1.4.1 の persistence.rb・core.rb・attribute_set/builder.rb を読んでまとめた図。">
            <LazyFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'accessors',
      title: '属性メソッドの中身',
      body: (
        <>
          <p>
            Article に <code>def title</code> を書かなくても、<code>article.title</code> でその記事の見出しを読めます。
            次の引用は Rails が読み取り用のメソッドを作る箇所です。<code>batch &lt;&lt;</code> に続く3つの文字列を上からつなぐと、メソッドの定義文になります。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/attribute_methods/read.rb（11〜22行目）"
            href={`${GH}/activerecord/lib/active_record/attribute_methods/read.rb#L11-L22`}
            code={`
          def define_method_attribute(canonical_name, owner:, as: canonical_name)
            ActiveModel::AttributeMethods::AttrNames.define_attribute_accessor_method(
              owner, canonical_name
            ) do |temp_method_name, attr_name_expr|
              owner.define_cached_method(temp_method_name, as: as, namespace: :active_record) do |batch|
                batch <<
                  "def #{temp_method_name}" <<
                  "  _read_attribute(#{attr_name_expr}) { |n| missing_attribute(n, caller) }" <<
                  "end"
              end
            end
          end
`}
          />
          <p>
            <ChapterLink n={5} />で見た、文字列のコードを <code>class_eval</code> する方法です。生成される <code>title</code> は <code>_read_attribute("title")</code> を呼ぶだけで、
            <code>_read_attribute</code> は <code>@attributes.fetch_value</code> を呼びます。書き込みの <code>title=</code> も同じ形で、<code>_write_attribute</code>{' '}
            から <code>@attributes.write_from_user</code> を呼びます（<code>write.rb</code> の 15〜43 行目）
            <Ref n={6} />。
          </p>
          <p>メソッドが定義される場所を調べると、次のようになりました。</p>
          <Code
            lang="ruby"
            code={`
m = Article.instance_method(:title)
m.owner                       # => Article::GeneratedAttributeMethods
Article.ancestors.index(m.owner)  # => 3
`}
          />
          <p>
            属性メソッドは Article クラス自身ではなく、祖先に入った <code>Article::GeneratedAttributeMethods</code> モジュールに定義されます（<ChapterLink n={2} section="rails-ancestors" />
            の図 2-6 では添字 2 でしたが、第3部の Article には enum を定義したので、enum のメソッドを入れる無名のモジュールが添字 1 に入り、1つずれています）。そのため、モデルで <code>def title</code>{' '}
            を書いて上書きし、その中で <code>super</code> を呼ぶと、生成されたメソッドに処理を渡せます（<ChapterLink n={3} />）。関連のメソッドを入れる GeneratedAssociationMethods
            と同じ考え方です（<ChapterLink n={5} />）。
          </p>
        </>
      ),
    },
    {
      id: 'types',
      title: '列の型と型変換',
      body: (
        <>
          <p>
            属性の型は列の <code>sql_type</code> から、接続アダプター（ActiveRecord の中で、MySQL など特定のデータベースとのやり取りを受け持つ部分）の型の対応表で決まります。デモのアプリケーションでの結果は次のとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>列</th>
                  <th>MySQL の型</th>
                  <th>属性の型（attribute_types）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>id</td>
                  <td>bigint</td>
                  <td>ActiveModel::Type::Integer</td>
                </tr>
                <tr>
                  <td>title</td>
                  <td>varchar(255)</td>
                  <td>ActiveModel::Type::String</td>
                </tr>
                <tr>
                  <td>published</td>
                  <td>tinyint(1)</td>
                  <td>ActiveModel::Type::Boolean</td>
                </tr>
                <tr>
                  <td>status</td>
                  <td>int</td>
                  <td>ActiveRecord::Enum::EnumType（enum で置き換え）</td>
                </tr>
                <tr>
                  <td>price</td>
                  <td>decimal(10,2)</td>
                  <td>ActiveModel::Type::Decimal</td>
                </tr>
                <tr>
                  <td>published_at</td>
                  <td>datetime(6)</td>
                  <td>…TimeZoneConversion::TimeZoneConverter</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            MySQL には真偽値の型が無く、<code>BOOLEAN</code> は <code>TINYINT(1)</code> の別名です
            <Ref n={7} />。Rails の MySQL アダプターは、<code>tinyint(1)</code> の列を Boolean 型として扱います。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb（757〜763行目）"
            href={`${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L757-L763`}
            code={`
        def extended_type_map(default_timezone: nil, emulate_booleans:) # :nodoc:
          super(default_timezone: default_timezone).tap do |m|
            if emulate_booleans
              m.register_type %r(^tinyint\\(1\\))i, Type::Boolean.new
            end
          end
        end
`}
          />
          <p>
            <code>emulate_booleans</code> は既定で true です（同じファイルの 29 行目）
            <Ref n={8} />。tinyint(1) の列に 0 と 1 以外の数を入れて使っているテーブルでは、Rails からは真偽値に見えるので注意します。
          </p>
          <p>
            属性の値には3つの形があります。データベースから来た値または代入された値そのもの（<code>value_before_type_cast</code>）、Ruby で扱う値（<code>value</code>
            ）、保存するときの値（<code>value_for_database</code>）です。データベースからの値は型の <code>deserialize</code>、代入された値は <code>cast</code>{' '}
            で Ruby の値になり、保存するときは <code>serialize</code> で戻します
            <Ref n={5} />。
          </p>
          <Figure n="15-6" title="3つの値と変換" caption="模式図。ActiveModel::Attribute の FromDatabase は deserialize、FromUser は cast を使う（attribute.rb の 181〜208 行目）。">
            <ThreeValuesFigure />
          </Figure>
          <p>デモのアプリケーションで、読み込んだレコードの値と、代入したときの変換を調べました。</p>
          <Code
            lang="text"
            code={`
# Article.first の値（before = read_attribute_before_type_cast）
published:    before=1 (Integer)            value=true (TrueClass)
price:        before=0.7682e3 (BigDecimal)  value=0.7682e3 (BigDecimal)
published_at: before=2026-08-01 07:53:47.260464 UTC (Time)
              value=2026-08-01 07:53:47.260464000 UTC +00:00 (ActiveSupport::TimeWithZone)
status:       before=1 (Integer)            value="published" (String)

# Article.new に代入したときの変換
views_count = "12abc"             -> 12
views_count = "abc"               -> 0
published   = "0"                 -> false
published   = "yes"               -> true
published   = ""                  -> nil
price       = "12.345"            -> 0.1235e2（列の scale 2 に合わせて丸める）
published_at = "2026-11-11 10:00" -> 2026-11-11 10:00:00 UTC +00:00
status      = "archived"          -> "archived"
status      = "unknown"           -> ArgumentError: 'unknown' is not a valid status
`}
          />
          <p>Boolean の変換規則は次のとおりです。</p>
          <Code
            lang="ruby"
            title="activemodel/lib/active_model/type/boolean.rb（16〜25行目、40〜46行目）"
            href={`${GH}/activemodel/lib/active_model/type/boolean.rb#L16-L46`}
            code={`
      FALSE_VALUES = [
        false, 0,
        "0", :"0",
        "f", :f,
        "F", :F,
        "false", :false,
        "FALSE", :FALSE,
        "off", :off,
        "OFF", :OFF,
      ].to_set.freeze

        def cast_value(value)
          if value == ""
            nil
          else
            !FALSE_VALUES.include?(value)
          end
        end
`}
          />
          <p>
            空文字列は nil、FALSE_VALUES に含まれる値は false、それ以外はすべて true です
            <Ref n={9} />。<code>"yes"</code> だけでなく <code>"no"</code> も true になります。Integer の変換は文字列に <code>to_i</code> を呼ぶので、<code>"12abc"</code> は 12、
            <code>"abc"</code> は 0 になります（<code>type/integer.rb</code> の 112〜122 行目）。フォームから来た数値を検証するときは、numericality のバリデーション（値が数値かどうかを確かめる検証）が{' '}
            <code>value_before_type_cast</code> を見るので、<code>"abc"</code> を誤りとして検出できます（<ChapterLink n={14} />）。
          </p>
          <Callout kind="warn">
            <p>
              日時の列は、既定では UTC（世界の時刻の基準。日本時間は UTC より9時間進んでいる）で保存され、読み込むと <code>config.time_zone</code> のタイムゾーンの ActiveSupport::TimeWithZone になります。デモのアプリケーションは{' '}
              <code>config.time_zone</code> を設定していないので UTC のままです。業務のアプリケーションで <code>config.time_zone = "Tokyo"</code> としている場合も、MySQL に入る値は UTC
              です（<code>config.active_record.default_timezone</code> の既定は <code>:utc</code>）。MySQL のクライアントで直接 SELECT するときは9時間ずれて見えます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'attribute-api',
      title: 'attribute API と enum',
      body: (
        <>
          <p>
            モデルの <code>attribute</code> を使うと、列の型を上書きしたり、列の無い属性を追加したりできます。<code>attribute :name, :type, default: ...</code>{' '}
            は、最終的に次のメソッドで型と既定値を登録します。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/attributes.rb（243〜251行目）"
            href={`${GH}/activerecord/lib/active_record/attributes.rb#L243-L251`}
            code={`
      def define_attribute(
        name,
        cast_type,
        default: NO_DEFAULT_PROVIDED,
        user_provided_default: true
      )
        attribute_types[name] = cast_type
        define_default_attribute(name, default, cast_type, from_user: user_provided_default)
      end
`}
          />
          <p>
            <code>attribute</code> の指定はクラス本体を評価した時点ではすぐに適用されず、列の情報を読み込んで <code>_default_attributes</code> を作るときに、列から作った型の上に重ねて適用されます（
            <code>apply_pending_attribute_modifications</code>、同じファイルの 253〜266 行目）
            <Ref n={10} />。<code>enum</code> もこの仕組みを使っています。<code>status</code> 列の型は int から作った Integer ですが、<code>enum :status</code> がそれを{' '}
            <code>EnumType</code> で包むので、データベースの 1 は <code>"published"</code> に、代入した <code>"archived"</code> は 2 に変換されます。定義に無い値を代入すると、上の実行結果のように
            ArgumentError になります。
          </p>
          <p>
            <code>enum</code> は型の置き換えのほかに、<code>published?</code>・<code>published!</code> のメソッドと、<code>Article.published</code> のようなスコープも定義します。このスコープは{' '}
            <code>WHERE status = 1</code> を作ります（<ChapterLink n={12} />）。
          </p>
        </>
      ),
    },
    {
      id: 'dirty',
      title: '変更の追跡',
      body: (
        <>
          <p>
            属性に値を代入すると、元の Attribute を書き換えずに新しい Attribute が作られます。<code>write_from_user</code> は <code>with_value_from_user</code> を呼び、元の属性を{' '}
            <code>original_attribute</code> として持つ FromUser の属性に置き換えます。
          </p>
          <Code
            lang="ruby"
            title="activemodel/lib/active_model/attribute.rb（66〜81行目）"
            href={`${GH}/activemodel/lib/active_model/attribute.rb#L66-L81`}
            code={`
    def changed?
      changed_from_assignment? || changed_in_place?
    end

    def changed_in_place?
      has_been_read? && type.changed_in_place?(original_value_for_database, value)
    end

    def forgetting_assignment
      with_value_from_database(value_for_database)
    end

    def with_value_from_user(value)
      type.assert_valid_value(value)
      self.class.from_user(name, value, type, original_attribute || self)
    end
`}
          />
          <p>
            <code>changed?</code> は、代入による変更か、読み出した値そのものを書き換えた変更（<code>title &lt;&lt; "!"</code> で文字列の末尾に直接 ! を足すような操作）があれば真になります。後者は、元のデータベースの値と現在の値を型の{' '}
            <code>changed_in_place?</code> で比べて検出します
            <Ref n={5} />。
          </p>
          <Figure n="15-7" title="代入と変更の検出" caption="模式図。save に成功すると changes_applied が呼ばれ、forgetting_assignment で現在の値を元の値とする属性に置き換わる。">
            <DirtyFigure />
          </Figure>
          <p>デモのアプリケーションで、変更から保存までを確かめました。</p>
          <Code
            lang="text"
            code={`
a = Article.find(2)
a.title = "タイトル2改"
a.changes   # => {"title" => ["記事2", "タイトル2改"]}
a.save!
  [TRANSACTION] BEGIN
  [Article Update] UPDATE \`articles\` SET \`articles\`.\`title\` = 'タイトル2改',
                   \`articles\`.\`updated_at\` = '2026-11-11 07:55:12.878329', \`articles\`.\`lock_version\` = 1
                   WHERE \`articles\`.\`id\` = 2 AND \`articles\`.\`lock_version\` = 0
  [TRANSACTION] COMMIT
a.saved_changes.keys  # => ["title", "updated_at", "lock_version"]
a.save!               # 変更が無いので SQL は実行されない
a.body << "（追記）"
a.changes.keys        # => ["body"]（その場での書き換えも検出される）
`}
          />
          <p>
            UPDATE 文には、変更した <code>title</code> と、Rails が自動で更新する <code>updated_at</code>・<code>lock_version</code> だけが入りました。保存する列を変更されたものに絞る仕組みを<Term en="partial updates">部分更新</Term>と呼び、次のコードで決まります。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/attribute_methods/dirty.rb（233〜247行目）"
            href={`${GH}/activerecord/lib/active_record/attribute_methods/dirty.rb#L233-L247`}
            code={`
        def _update_record(attribute_names = attribute_names_for_partial_updates)
          affected_rows = super
          changes_applied
          affected_rows
        end

        def _create_record(attribute_names = attribute_names_for_partial_inserts)
          id = super
          changes_applied
          id
        end

        def attribute_names_for_partial_updates
          partial_updates? ? changed_attribute_names_to_save : attribute_names
        end
`}
          />
          <p>
            保存した後の <code>changes_applied</code> で、今回の変更は <code>saved_changes</code> に移り、<code>changes</code> は空になります
            <Ref n={11} />。2回目の <code>save!</code> では保存する列が無いので UPDATE を実行せず、トランザクションの BEGIN も送られませんでした。<code>lock_version</code>{' '}
            という名前の列があると楽観的ロックが自動で有効になり、WHERE に <code>lock_version = 0</code> が付きます。この仕組みは<ChapterLink n={15} />で扱います。
          </p>
          <Callout kind="note">
            <p>
              Rails 8.1 の新規アプリケーションの production（本番環境）では <code>config.active_record.attributes_for_inspect = [ :id ]</code> が設定されており、デモのアプリケーションでも{' '}
              <code>Article.first.inspect</code> は <code>#&lt;Article id: 1&gt;</code> だけを表示しました。ログやエラー通知に属性の値が出るのを減らす設定です。また、
              <code>config.filter_parameters</code>（ログに値を出さないパラメーター名の一覧）に入っている <code>:email</code> などに一致する属性は、<code>inspect</code> で <code>[FILTERED]</code> と表示されます。
            </p>
          </Callout>
          <Callout kind="v72">
            <p>
              列の情報の読み込み、LazyAttributeSet、属性メソッドの定義、変更の追跡の仕組みは Rails 7.2.4 でも同じです（7.2.4 の同じファイルと比べて確認）。<code>only_columns</code> は 8.1
              で追加されたもので、7.2 では <code>ignored_columns</code> だけが使えます
              <Ref n={12} />。<code>attributes_for_inspect</code> は 7.2 にもあり、7.2 の production の設定ファイルにも同じ行があります。
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
          <li>DESCRIBE は列ごとの型、NULL を入れられるか、既定値、主キーや索引の有無を表示します。NULL を入れられず既定値も無い列を省いて INSERT すると、デモの MySQL ではエラーになります。</li>
          <li>Rails ではマイグレーションでテーブルを作ります。db:migrate は CREATE TABLE などの SQL を送り、実行したバージョンを schema_migrations に記録します。</li>
          <li>モデルのクラスは1つのテーブルに対応します。Article.first は SELECT を送り、返ってきた行の値を属性として持つインスタンスを返します。</li>
          <li>
            new は SQL を実行せず、save・update・destroy がトランザクションの中で INSERT・UPDATE・DELETE を実行します。検証に失敗すると、save と update は false を返し、名前が ! で終わるメソッドは例外を投げます。create
            は失敗しても保存していないオブジェクトを返すので、結果は persisted? か create! で確かめます。
          </li>
          <li>find は見つからなければ RecordNotFound（コントローラーでは 404）、find_by は nil を返します。where は Relation を返し、中身を使うときに SQL を実行します。</li>
          <li>クラスは列の情報・属性の型・初期値と、属性メソッドのモジュールを持ち、インスタンスは属性の集合 @attributes と状態を持ちます。</li>
          <li>列の情報は最初に必要になったときに読み込まれ（MySQL では SHOW FULL FIELDS）、属性メソッドも同じときに GeneratedAttributeMethods に定義されます。</li>
          <li>データベースの行は allocate と init_with_attributes でレコードになり、LazyAttributeSet が値を読まれたときに型変換します。</li>
          <li>MySQL の tinyint(1) は Boolean 型になります。代入した値は型の cast で変換され、"abc" が 0 に、"no" が true になるなどの規則があります。</li>
          <li>attribute と enum は、列から作った型の上に別の型を重ねます。</li>
          <li>属性に値を代入すると、元の属性を残した新しい属性が作られます。changes で変更を、saved_changes で保存した変更を確認できます。UPDATE には変更した列だけが入ります。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'activerecord/lib/active_record/model_schema.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/model_schema.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'load_schema と load_schema!、スキーマキャッシュ、ignored_columns と only_columns。' },
    { title: 'activerecord/lib/active_record/attribute_methods.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/attribute_methods.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'define_attribute_methods と、method_missing から定義する処理。初期化時の呼び出しは core.rb。' },
    { title: 'activerecord/lib/active_record/railtie.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/railtie.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '起動時に属性メソッドを定義する初期化処理と、その条件・理由のコメント。' },
    { title: 'activerecord/lib/active_record/persistence.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'instantiate_instance_of が allocate と init_with_attributes でレコードを作る実装。' },
    { title: 'activemodel/lib/active_model/attribute_set/builder.rb・attribute.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/attribute.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'LazyAttributeSet の fetch_value、Attribute の value・changed?・with_value_from_user、FromDatabase と FromUser。' },
    { title: 'activerecord/lib/active_record/attribute_methods/read.rb・write.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/attribute_methods/read.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '属性の読み書きメソッドを生成するコード。' },
    { title: 'Numeric Data Type Syntax', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/numeric-type-syntax.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: 'BOOL・BOOLEAN が TINYINT(1) の別名であること。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'emulate_booleans と、tinyint(1) を Boolean 型にする対応表。' },
    { title: 'activemodel/lib/active_model/type/boolean.rb・integer.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/type/boolean.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Boolean の FALSE_VALUES と cast_value、Integer の cast_value。' },
    { title: 'activerecord/lib/active_record/attributes.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/attributes.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'define_attribute と _default_attributes。' },
    { title: 'activerecord/lib/active_record/attribute_methods/dirty.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/attribute_methods/dirty.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '部分更新・部分挿入と changes_applied、saved_changes。' },
    { title: 'activerecord/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/CHANGELOG.md`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '8.1.0 で ActiveRecord::Base.only_columns が追加されたこと。' },
    { title: 'Active Record Basics（CRUD・Validations）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_basics.html', accessed: '2026-11-13', version: 'Rails 8.1', note: 'new と create、find・find_by・where、update・destroy の使い方。検証に失敗したとき save・update が false を返し、save!・create!・update! が RecordInvalid を投げ、create は常にモデルを返すこと。' },
    { title: 'String Data Type Syntax', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/string-type-syntax.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: 'VARCHAR(M) の M が文字数で表した最大の長さであること。TEXT 型。' },
    { title: 'Date and Time Data Type Syntax', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/date-and-time-type-syntax.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: 'DATETIME(fsp) の fsp が秒の小数点以下の桁数（0〜6）であること。' },
    { title: 'CREATE TABLE Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: 'PRIMARY KEY は一意な索引で、列は NOT NULL であること。AUTO_INCREMENT の列に NULL か 0 を入れると次の番号が入ること。' },
    { title: 'INSERT Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/insert.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: 'INSERT INTO … (列) VALUES (値) の書き方と、値を指定しない列に既定値が入ること。実行例は MySQL 8.4.13 で実測。' },
    { title: 'Active Record Migrations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_migrations.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'generate model が作るマイグレーション、create_table が主キーの id を加えること、t.timestamps、schema_migrations に実行済みのバージョンを記録すること、db/schema.rb の更新。実行例は Rails 8.1.4.1 で実測。' },
  ],
}

export default withExplanations(ch11, explanation11)
