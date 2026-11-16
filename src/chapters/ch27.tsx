import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation27 } from '../explanations/operations'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

/* ---------- 図 27-1 テーブルの構造 ---------- */
function TableFigure() {
  const cell = (x: number, y: number, w: number, h: number, text: string | string[], fill: 'box' | 'box4' | 'box5' | 'bg', mono?: boolean) => (
    <Box x={x} y={y} w={w} h={h} lines={text} fs={11} fill={fill} rx={0} mono={mono} subTone="muted" />
  )
  return (
    <Svg
      id="27-1"
      w={780}
      h={318}
      label="authors テーブルは id・name・email の列を持ち、id は主キー、name と email は NOT NULL、email には一意の索引 index_authors_on_email がある。1行が1人の著者を表す。articles テーブルの author_id には外部キー制約があり、authors テーブルに有る id だけを入れられる"
    >
      <T x={20} y={20} bold>
        authors テーブル
      </T>
      {cell(20, 34, 70, 44, ['id', 'bigint'], 'box')}
      {cell(90, 34, 120, 44, ['name', 'varchar(255)'], 'box')}
      {cell(210, 34, 180, 44, ['email', 'varchar(255)'], 'box')}
      {cell(20, 78, 70, 24, '主キー', 'box5')}
      {cell(90, 78, 120, 24, 'NOT NULL', 'box5')}
      {cell(210, 78, 180, 24, 'NOT NULL・UNIQUE', 'box5')}
      {cell(20, 102, 70, 26, '1', 'box4')}
      {cell(90, 102, 120, 26, '佐藤', 'box4')}
      {cell(210, 102, 180, 26, 'sato@example.com', 'box4', true)}
      {cell(20, 128, 70, 26, '2', 'box4')}
      {cell(90, 128, 120, 26, '鈴木', 'box4')}
      {cell(210, 128, 180, 26, 'suzuki@example.com', 'box4', true)}
      <T x={20} y={174} fs={11.5}>
        列：名前と型（入れられる値の種類）を持つ
      </T>
      <T x={20} y={194} fs={11.5}>
        行：1件のデータ。Author のオブジェクト1つに当たる
      </T>
      <Box x={110} y={212} w={280} h={46} lines={['索引 index_authors_on_email', 'email の値から行をすぐに探す']} fs={11} fill="bg" subTone="muted" />
      <Arrow x1={370} y1={212} x2={370} y2={156} />

      <T x={440} y={20} bold>
        articles テーブル
      </T>
      {cell(440, 34, 60, 44, ['id', 'bigint'], 'box')}
      {cell(500, 34, 150, 44, ['title', 'varchar(255)'], 'box')}
      {cell(650, 34, 110, 44, ['author_id', 'bigint'], 'box')}
      {cell(440, 78, 60, 24, '主キー', 'box5')}
      {cell(500, 78, 150, 24, '（制約なし）', 'bg')}
      {cell(650, 78, 110, 24, '外部キー', 'box5')}
      {cell(440, 102, 60, 26, '1', 'box4')}
      {cell(500, 102, 150, 26, 'Rails の起動', 'box4')}
      {cell(650, 102, 110, 26, '1', 'box4')}
      {cell(440, 128, 60, 26, '2', 'box4')}
      {cell(500, 128, 150, 26, 'ルーティング', 'box4')}
      {cell(650, 128, 110, 26, '2', 'box4')}
      <Arrow d="M705,156 L705,282 L8,282 L8,141 L18,141" dashed />
      <T x={420} y={300} fs={11} tone="muted">
        外部キー制約：author_id には authors に有る id だけを入れられる
      </T>
    </Svg>
  )
}

/* ---------- 図 27-2 db:migrate で変わるもの ---------- */
function MigrateFlowFigure() {
  return (
    <Svg
      id="27-2"
      w={780}
      h={262}
      label="bin/rails db:migrate は、db/migrate のマイグレーションのファイルのうち未適用のものを実行する。1. MySQL に ALTER TABLE を送って articles に display_title 列を追加し、2. schema_migrations テーブルに番号を記録し、3. DB の今の構造を db/schema.rb に書き出す。db:rollback は逆の操作を実行し、記録を消して schema.rb を書き直す"
    >
      <Box x={20} y={74} w={200} h={64} lines={['db/migrate/2026…_add_', 'display_title_to_articles.rb', 'add_column …']} fs={11} fill="box" mono subTone="muted" />
      <Arrow x1={220} y1={106} x2={268} y2={106} />
      <Box x={270} y={84} w={170} h={44} lines="bin/rails db:migrate" fs={12} mono bold fill="box5" />
      <Arrow x1={440} y1={100} x2={508} y2={44} />
      <Arrow x1={440} y1={106} x2={508} y2={114} />
      <Arrow x1={440} y1={112} x2={508} y2={184} />
      <T x={466} y={60} fs={11} tone="muted">
        1
      </T>
      <T x={466} y={100} fs={11} tone="muted">
        2
      </T>
      <T x={466} y={164} fs={11} tone="muted">
        3
      </T>
      <Box x={510} y={16} w={250} h={56} lines={['MySQL の articles テーブル', 'ALTER TABLE … ADD display_title']} fs={11.5} fill="box4" subTone="muted" />
      <Box x={510} y={86} w={250} h={56} lines={['schema_migrations テーブル', '番号 20261116070437 を記録']} fs={11.5} fill="box4" subTone="muted" />
      <Box x={510} y={156} w={250} h={56} lines={['db/schema.rb', 't.string "display_title" の行が増える']} fs={11.5} fill="box" subTone="muted" />
      <T x={20} y={236} fs={11} tone="muted">
        db:rollback は逆の操作（remove_column）を実行し、記録を消して schema.rb を書き直す
      </T>
    </Svg>
  )
}

/* ---------- 図 27-3 動いているアプリケーションとテーブルの変更 ---------- */
function LiveChangeFigure() {
  const x0 = 150
  const sec = 28 // 1秒あたりの幅
  const bar = (x1: number, x2: number, y: number, text: string, fill: 'box' | 'box4' | 'box5' | 'bg', opts: { dashed?: boolean; danger?: boolean } = {}) => (
    <g>
      <rect x={x1} y={y} width={x2 - x1} height={26} rx={4} fill={`var(--fig-${fill})`} stroke="var(--fig-line)" strokeDasharray={opts.dashed ? '5 4' : undefined} />
      <T x={x1 + 8} y={y + 13} fs={11} tone={opts.danger ? 'danger' : undefined}>
        {text}
      </T>
    </g>
  )
  return (
    <Svg
      id="27-3"
      w={780}
      h={350}
      label="上は列名を変えた場合。古いプロセスは改名の前は title で読み書きできたが、改名の後は title が無いので例外になった。改名の後に起動した新しいプロセスは display_title で読み書きできた。下は約79万行の articles で列の型を変えた場合。ALTER TABLE はテーブルを写すのに約21秒かかり、その途中の SELECT は0.57秒で返ったが、UPDATE は ALTER TABLE が終わるまで約18秒待った"
    >
      <T x={20} y={20} bold>
        列名を変えたとき（rename_column）
      </T>
      <T x={20} y={51} fs={11.5}>
        古いプロセス
      </T>
      {bar(x0, 440, 38, 'title で読み書きできる', 'box')}
      {bar(440, 760, 38, 'title が無いので例外になる', 'bg', { danger: true })}
      <T x={20} y={91} fs={11.5}>
        マイグレーション
      </T>
      <Box x={384} y={78} w={112} h={26} lines="rename_column" fs={11} mono fill="box5" />
      <T x={20} y={131} fs={11.5}>
        新しいプロセス
      </T>
      {bar(500, 760, 118, 'display_title で読み書きできる', 'box')}
      <line x1={440} y1={32} x2={440} y2={76} stroke="var(--fig-accent)" strokeDasharray="4 3" />
      <line x1={440} y1={106} x2={440} y2={150} stroke="var(--fig-accent)" strokeDasharray="4 3" />

      <T x={20} y={184} bold>
        列の型を変えたとき（change_column、約79万行）
      </T>
      <T x={20} y={215} fs={11.5}>
        ALTER TABLE
      </T>
      {bar(x0, x0 + 20.9 * sec, 202, 'テーブルを写す（約 21 秒）', 'box5')}
      <T x={20} y={255} fs={11.5}>
        SELECT
      </T>
      {bar(x0 + 2.5 * sec, x0 + 3.1 * sec, 242, '', 'box4')}
      <T x={x0 + 3.1 * sec + 8} y={255} fs={11}>
        0.57 秒で返る
      </T>
      <T x={20} y={295} fs={11.5}>
        UPDATE
      </T>
      {bar(x0 + 3.1 * sec, x0 + 20.7 * sec, 282, 'メタデータロックを待つ（約 18 秒）', 'bg', { dashed: true })}
      {bar(x0 + 20.7 * sec, x0 + 21.2 * sec, 282, '', 'box4')}
      <T x={20} y={334} fs={11} tone="muted">
        デモのコピー（MySQL 8.4）での実測をもとにした模式図。時間の軸は下の段だけが実際の秒数に比例する
      </T>
    </Svg>
  )
}

function DeploymentFigure() {
  const rows = [
    ['① 新しい列を追加', '旧コードは title を使用', 'title / display_title（NULL可）'],
    ['② 両方に書くコードを配布', '全プロセスの切替完了を待つ', '旧列と新列を同じ更新で保存'],
    ['③ 過去の行を補完', '新規の更新は両方に書く', '未補完の行だけ分割して更新'],
    ['④ 読み取りを新列へ', '差分確認後に切替', '戻す期間中は旧列にも書く'],
    ['⑤ 旧列の利用を終了', '旧列を無視するコードを配布', '全プロセスの切替後に旧列を削除'],
  ]
  return <Svg id="27-4" w={760} h={422} label="列名の変更を段階的に行う模式図。列の追加、両方に書くコードの配布、既存行の補完、読み取りの切替、旧列の利用終了と削除の順に進む。各段階でWebとジョブの全プロセスの切替を確認する。">
    {rows.map(([a, b, c], i) => <g key={a}>
      <Box x={20} y={12 + i * 82} w={230} h={60} lines={[a, b]} fs={12} bold subTone="muted" />
      <Arrow x1={252} y1={42 + i * 82} x2={286} y2={42 + i * 82} />
      <Box x={290} y={12 + i * 82} w={450} h={60} lines={c} fs={13} fill="box4" />
      {i < 4 && <Arrow x1={135} y1={72 + i * 82} x2={135} y2={92 + i * 82} />}
    </g>)}
  </Svg>
}

function LockFigure() {
  return <Svg id="27-5" w={720} h={274} label="メタデータロック待ちの模式図。接続Aの未完了トランザクションがテーブルの定義を保護する。接続BのALTER TABLEは定義変更用のロックを待ち、さらに接続CのSELECTも待つことがある。Aを終了するとBが進める。">
    <Box x={20} y={18} w={200} h={64} lines={['接続A：トランザクション', 'SELECT 後も未完了']} fs={12} subTone="muted" />
    <Box x={260} y={18} w={200} h={64} lines={['接続B：ALTER TABLE', '定義変更用のロック待ち']} fs={12} fill="box5" subTone="muted" />
    <Box x={500} y={18} w={200} h={64} lines={['接続C：後続の SELECT', '待たされることがある']} fs={12} subTone="muted" />
    <Arrow x1={220} y1={50} x2={258} y2={50} dashed />
    <Arrow x1={460} y1={50} x2={498} y2={50} dashed />
    <T x={30} y={122}>待ち時間の確認：SHOW FULL PROCESSLIST</T>
    <T x={30} y={154} mono fs={12}>Waiting for table metadata lock</T>
    <Box x={20} y={186} w={680} h={68} lines={['LOCK=NONE でも、定義を切り替えるロックは必要', '長いトランザクションと待ち時間を確認してから変更する']} fs={13} fill="bg" subTone="muted" />
  </Svg>
}

function RecoveryFigure() {
  return <Svg id="27-6" w={720} h={260} label="マイグレーションの途中失敗の模式図。列の追加は成功し、続くSQLは失敗した。MySQLでは列が残る場合がある。適用済み一覧だけでなく実際のテーブルを確認し、継続・修正・復元の手順を選ぶ。">
    <Box x={20} y={20} w={190} h={62} lines={['1. 列の追加', '成功して残る']} fs={13} fill="box4" subTone="muted" />
    <Arrow x1={212} y1={51} x2={258} y2={51} />
    <Box x={260} y={20} w={190} h={62} lines={['2. 次の SQL', '失敗']} fs={13} fill="bg" subTone="danger" />
    <Arrow x1={452} y1={51} x2={498} y2={51} />
    <Box x={500} y={20} w={200} h={62} lines={['3. 状態を調査', 'テーブルと適用履歴を照合']} fs={12} subTone="muted" />
    <Box x={20} y={122} w={680} h={110} lines={['アプリを戻す：旧コードが現在の DB で動くか', 'DB 定義を戻す：逆の変更を実行できるか', 'データを戻す：バックアップなどから復元できるか']} fs={13} fill="bg" />
  </Svg>
}

const ch27: Chapter = {
  number: 27,
  part: 5,
  title: '安全なDBマイグレーション',
  summary: 'テーブルの列・型・索引・制約と、マイグレーションを書いて bin/rails db:migrate で適用したときの出力と schema.rb の変化を確かめ、動いているアプリケーションのテーブルを変えたときに古いコードが失敗することと、変更中のロックの待ちを実測します。そのうえで、DBの構造変更を、動いているアプリケーションと両立させる手順を説明します。MySQLのDDLとロック、列の追加・削除、既存行の分割更新、索引と制約、失敗時の調査を具体例で扱います。',
  goals: [
    'テーブルの列・型・索引・制約が何を決めるかを、SHOW CREATE TABLE と制約に反したときの例外から説明できる',
    'マイグレーションを書いて適用・取り消しし、db:migrate の出力と schema.rb の変化を読める',
    'マイグレーションの適用履歴と実際のDBの状態を区別できる',
    '旧コードと新コードが同時に動く期間を考え、変更の順序を組み立てられる',
    'MySQLのDDLの実行方式と、メタデータロック待ちを説明できる',
    '既存行を分割して更新し、途中からやり直せる条件を考えられる',
    '逆のマイグレーションとデータ復元の違いを説明できる',
  ],
  prerequisites: [11, 14, 15, 23],
  sections: [
    {
      id: 'table-structure',
      title: 'テーブルの列・型・索引・制約',
      body: (
        <>
          <p>
            Rails のアプリケーションは記事や著者などのデータを MySQL などのデータベース（DB）に保存します。MySQL はデータを表の形で持ち、この表を<Term en="table">テーブル</Term>
            と呼びます。テーブルの1件のデータが行、行が持つ項目が列です。デモのアプリケーションでは著者を authors テーブルに、記事を articles テーブルに保存しています。ActiveRecord
            のモデルのクラスが1つのテーブルに対応し、Author のオブジェクト1つが authors テーブルの1行に当たります（<ChapterLink n={11} />）。
          </p>
          <p>
            テーブルの作りは MySQL の <code>SHOW CREATE TABLE</code> で確かめられます<Ref n={12} />。この章の実験はデモのアプリケーションをコピーし、別のデータベース（demo_ch27）を作って行いました。そのコピーの
            authors テーブルを表示しました。
          </p>
          <Code
            lang="sql"
            title="SHOW CREATE TABLE authors の出力（MySQL 8.4。枠の行を省略）"
            code={`
CREATE TABLE \`authors\` (
  \`id\` bigint NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`email\` varchar(255) NOT NULL,
  \`created_at\` datetime(6) NOT NULL,
  \`updated_at\` datetime(6) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`index_authors_on_email\` (\`email\`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
`}
          />
          <p>
            括弧の中の1行が1つの列の定義で、列の名前の後ろに<Term en="data type">型</Term>が続きます。型はその列に入れられる値の種類です。bigint は整数、varchar(255) は255文字までの文字列、datetime(6)
            は日時（秒の小数点以下6桁まで）です<Ref n={13} />。<code>NOT NULL</code> は、値が無いこと（NULL）を許さない指定です。後ろの2行は索引の定義で、<code>PRIMARY KEY</code> は id
            の値で行を区別すること、<code>UNIQUE KEY</code> は email に同じ値が2つ入らないことを表します。
          </p>
          <p>
            <Term>索引</Term>（インデックス）は、ある列の値から行をすぐに見つけるために、DB がその列の値を並べて持っているデータです。索引の無い列で探すと、MySQL
            は先頭の行から順にすべての行を調べます<Ref n={10} />。SQL をどう実行するかを表示する EXPLAIN（<ChapterLink n={12} section="explain" />）で比べました。
          </p>
          <Code
            lang="text"
            title="EXPLAIN の出力（列の一部を抜き出した）"
            code={`
EXPLAIN SELECT * FROM authors WHERE email = 'sato@example.com';
type   possible_keys           key                     rows
const  index_authors_on_email  index_authors_on_email  1

EXPLAIN SELECT * FROM authors WHERE name = '佐藤';
type   possible_keys           key                     rows
ALL    NULL                    NULL                    2
`}
          />
          <p>
            email で探す SELECT は索引 index_authors_on_email を使い（key）、1行だけを読みました。name には索引が無いので、type が ALL（すべての行を調べる）になりました。この表の行は2つだけですが、行が100万あれば100万行を調べます。
          </p>
          <p>
            NOT NULL や UNIQUE のように、列に入れてよい値を DB が確かめる決まりを<Term en="constraint">制約</Term>と呼びます。articles テーブルの author_id には<Term en="foreign key">外部キー</Term>
            の制約があり、authors テーブルに有る id だけを入れられます<Ref n={11} />。制約に反する行を保存しようとすると、MySQL がエラーを返し、ActiveRecord はそれを例外に変えます。
          </p>
          <Code
            lang="ruby"
            title="script/ch27_constraints.rb（bin/rails runner で実行）"
            code={`
def try(label)
  yield
  puts "#{label}: 保存できた"
rescue => e
  puts "#{label}: #{e.class}"
  puts "  #{e.message.lines.first.strip}"
end

try("name なし") { Author.create!(name: nil, email: "x@example.com") }
try("同じ email") { Author.create!(name: "高橋", email: "sato@example.com") }
try("存在しない著者") { Article.create!(title: "x", author_id: 999) }
`}
          />
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4）"
            code={`
name なし: ActiveRecord::NotNullViolation
  Mysql2::Error: Column 'name' cannot be null
同じ email: ActiveRecord::RecordNotUnique
  Mysql2::Error: Duplicate entry 'sato@example.com' for key 'authors.index_authors_on_email'
存在しない著者: ActiveRecord::InvalidForeignKey
  Mysql2::Error: Cannot add or update a child row: a foreign key constraint fails (\`demo_ch27\`.\`articles\`, CONSTRAINT \`fk_rails_e74ce85cbc\` FOREIGN KEY (\`author_id\`) REFERENCES \`authors\` (\`id\`))
`}
          />
          <p>
            3つとも MySQL が保存を断り、行は増えませんでした。アプリケーションのコードに誤りがあっても、制約があれば矛盾したデータは DB に入りません。テーブルの列・型・索引・制約をまとめて、テーブルの構造と呼びます（図
            27-1）。この章で扱うマイグレーションは、この構造を変えるためのコードです。
          </p>
          <Figure n="27-1" title="テーブルの構造" caption="デモのコピーの authors と articles テーブル（列の一部）。">
            <TableFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'migrate-run',
      title: 'マイグレーションを書いて適用する',
      body: (
        <>
          <p>
            テーブルの構造を変えるには、DB に ALTER TABLE などの SQL を送ります。Rails ではこの変更を<Term en="migration">マイグレーション</Term>と呼ぶ Ruby のクラスに書き、
            <code>bin/rails db:migrate</code> で実行します。ファイルは決まった形のファイルを作るコマンド（ジェネレーター）で作れます。デモのコピーで、articles テーブルに文字列の列 display_title
            を追加するマイグレーションを作りました<Ref n={1} />。
          </p>
          <Code
            lang="text"
            title="マイグレーションのファイルを作る"
            code={`
$ bin/rails generate migration AddDisplayTitleToArticles display_title:string
      invoke  active_record
      create    db/migrate/20261116070437_add_display_title_to_articles.rb
`}
          />
          <Code
            lang="ruby"
            title="db/migrate/20261116070437_add_display_title_to_articles.rb（作られたまま）"
            code={`
class AddDisplayTitleToArticles < ActiveRecord::Migration[8.1]
  def change
    add_column :articles, :display_title, :string
  end
end
`}
          />
          <p>
            ファイル名の先頭の 20261116070437 は、ファイルを作った日時（UTC の 2026年11月16日 07:04:37）です。この数字がマイグレーションの番号（バージョン）になります。<code>add_column</code>{' '}
            は列を追加するメソッドで、テーブル名・列名・型を渡します。<code>:string</code> は MySQL では varchar(255) になります。<code>Migration[8.1]</code> の 8.1 は、このファイルを Rails 8.1
            の動作で実行するという指定で、MySQL のバージョンとは関係ありません。
          </p>
          <p>
            ファイルを作っただけでは、DB は変わりません。<code>bin/rails db:migrate:status</code> で各マイグレーションが適用済み（up）か未適用（down）かを確かめてから、db:migrate を実行しました。
          </p>
          <Code
            lang="text"
            title="適用の前後の状態と db:migrate の出力（一部を省略）"
            code={`
$ bin/rails db:migrate:status
database: demo_ch27

 Status   Migration ID    Migration Name
--------------------------------------------------
   up     20261111035924  Create articles
（中略）
  down    20261116070437  Add display title to articles

$ bin/rails db:migrate
== 20261116070437 AddDisplayTitleToArticles: migrating ========================
-- add_column(:articles, :display_title, :string)
   -> 0.0465s
== 20261116070437 AddDisplayTitleToArticles: migrated (0.0465s) ===============

$ bin/rails db:migrate:status
（中略）
   up     20261116070437  Add display title to articles
`}
          />
          <p>
            db:migrate は未適用のマイグレーションを番号の順に実行し、呼んだメソッド（add_column）とかかった時間を表示します。このとき Rails が MySQL に送った SQL は、ログ（log/development.log）に残ります。
          </p>
          <Code
            lang="text"
            title="log/development.log（該当する2行。色の指定と行末のコメントを除いた）"
            code={`
   (45.4ms)  ALTER TABLE \`articles\` ADD \`display_title\` varchar(255)
  ActiveRecord::SchemaMigration Create (8.6ms)  INSERT INTO \`schema_migrations\` (\`version\`) VALUES ('20261116070437')
`}
          />
          <p>
            1行目が列を追加する SQL です。2行目は適用したマイグレーションの番号を schema_migrations というテーブルに記録する SQL で、db:migrate:status の up と down はこの記録から決まります。db:migrate
            は最後に、DB の今の構造を db/schema.rb に Ruby の形で書き出します。実行の前後で schema.rb を比べました。
          </p>
          <Code
            lang="text"
            title="db/schema.rb の差分（一部を省略）"
            code={`
-ActiveRecord::Schema[8.1].define(version: 2026_11_11_101414) do
+ActiveRecord::Schema[8.1].define(version: 2026_11_16_070437) do
（中略）
     t.integer "lock_version", default: 0, null: false
+    t.string "display_title"
     t.index ["author_id"], name: "index_articles_on_author_id"
`}
          />
          <p>
            version が今回のマイグレーションの番号に変わり、articles の定義に display_title の行が増えました。schema.rb
            の先頭のコメントは、このファイルをバージョン管理（Git など）に含めるよう勧めています。新しい環境で DB を作るときは、古いマイグレーションをすべて実行し直す代わりに、
            <code>bin/rails db:schema:load</code> で schema.rb から構造を作ります<Ref n={1} />。
          </p>
          <p>
            適用を取り消すには <code>bin/rails db:rollback</code> を実行します。最後に適用したマイグレーションの change が逆向きに実行され、add_column の逆の remove_column
            で列が消えました。schema_migrations の記録も消え、schema.rb も書き直されます（図 27-2）。
          </p>
          <Code
            lang="text"
            title="db:rollback の出力"
            code={`
$ bin/rails db:rollback
== 20261116070437 AddDisplayTitleToArticles: reverting ========================
-- remove_column(:articles, :display_title, :string)
   -> 0.0724s
== 20261116070437 AddDisplayTitleToArticles: reverted (0.0759s) ===============
`}
          />
          <Figure n="27-2" title="db:migrate で変わるもの" caption="デモのコピーでの実行とログをもとにした図。">
            <MigrateFlowFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'live-change',
      title: '動いているアプリケーションのテーブルを変える',
      body: (
        <>
          <p>
            開発環境では、マイグレーションを実行するのは自分だけで、失敗してもやり直せます。本番環境では、利用者の要求を処理しているアプリケーションが、変更している間も同じテーブルを使い続けます。新しいコードを本番環境に置いて動かすこと（デプロイ）は、ふつう、マイグレーションの実行と、アプリケーションのプロセス（実行中のプログラム）の入れ替えを含みます。プロセスを1つずつ入れ替える方法では、入れ替えの途中で、古いコードのプロセスと新しいコードのプロセスが同時に動きます（
            <ChapterLink n={23} section="restart-timeout" />）。
          </p>
          <p>
            このとき起きることを、デモのコピーで確かめました。まず、古いコードのプロセスを起動して記事を読みます。次に、別のプロセスで articles の title 列を display_title
            に改名するマイグレーションを実行し、その後で古いプロセスに同じ処理を続けさせました。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261116080000_rename_title_to_display_title.rb"
            code={`
class RenameTitleToDisplayTitle < ActiveRecord::Migration[8.1]
  def change
    rename_column :articles, :title, :display_title
  end
end
`}
          />
          <Code
            lang="ruby"
            title="script/ch27_old.rb と script/ch27_new.rb"
            code={`
# ch27_old.rb　古いコード：起動したときに読んだ列の一覧（title がある）を使い続けるプロセス
require_relative "../config/environment"

puts "旧: #{Article.first.title}"
sleep 0.2 until File.exist?("tmp/ch27_migrated") # 別のプロセスがマイグレーションを終えるまで待つ
puts "旧: マイグレーションの後"
begin
  puts "旧: #{Article.first.title}"
rescue => e
  puts "旧: #{e.class}: #{e.message}"
end
begin
  Article.create!(title: "新しい記事")
rescue => e
  puts "旧: #{e.class}"
  puts "    #{e.message.lines.first.strip}"
end

# ch27_new.rb　新しいコード：マイグレーションの後に起動したプロセス
require_relative "../config/environment"

puts "新: #{Article.first.display_title}"
Article.create!(display_title: "新しい記事")
puts "新: 保存できた（#{Article.count} 件）"
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
$ ruby script/ch27_old.rb      # 起動したまま、別のプロセスで bin/rails db:migrate を実行する
旧: Rails の起動
旧: マイグレーションの後
旧: ActiveModel::MissingAttributeError: missing attribute 'title' for Article
旧: ActiveRecord::StatementInvalid
    Mysql2::Error: Unknown column 'title' in 'field list'

$ ruby script/ch27_new.rb      # マイグレーションの後に起動する
新: Rails の起動
新: 保存できた（4 件）
`}
          />
          <p>
            ActiveRecord のモデルは、最初にテーブルを使うときに列の一覧を DB から読み込み、その後は読み込んだ一覧を使い続けます（<ChapterLink n={11} section="schema" />
            ）。古いプロセスの一覧には title が残っているので、改名の後に読んだ行から title を取り出せずに MissingAttributeError になりました。保存では、無くなった title 列への INSERT を MySQL
            が断りました。改名の後に起動したプロセスは新しい一覧を読むので、display_title で読み書きできました。本番環境なら、入れ替えが終わるまでの間、古いプロセスが受けた要求がこの例外で失敗します。
          </p>
          <p>
            もう1つは、変更している間の待ちです。DB は、ある処理が使っているデータをほかの処理が同時に変えないように、<Term en="lock">ロック</Term>
            をかけます。ロックは、使っている処理が終わるまで、ほかの処理を待たせる仕組みです。テーブルの構造を変える SQL も、変え終わるまでそのテーブルへの一部の操作を待たせます。デモのコピーの articles に
            786,432 行を入れ、views_count 列の型を int から bigint（より大きな整数）に変えるマイグレーションを実行し、その途中で別のプロセスから同じテーブルを読み書きしました。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261116090000_change_views_count_to_bigint.rb と script/ch27_during.rb"
            code={`
class ChangeViewsCountToBigint < ActiveRecord::Migration[8.1]
  def up
    change_column :articles, :views_count, :bigint, null: false, default: 0
  end

  def down
    change_column :articles, :views_count, :integer, null: false, default: 0
  end
end

# script/ch27_during.rb　マイグレーションの途中に、同じテーブルを読み書きする
require_relative "../config/environment"

def measure(label)
  start = Time.now
  yield
  puts format("%-6s %5.2f 秒かかった（%s に開始）", label, Time.now - start, start.strftime("%T.%L"))
end

measure("SELECT") { Article.where(id: 1).pick(:title) }
measure("UPDATE") { Article.where(id: 1).update_all(views_count: 10) }
`}
          />
          <Code
            lang="text"
            title="実行結果（SHOW PROCESSLIST は demo_ch27 の行と一部の列だけを抜き出した）"
            code={`
$ bin/rails db:migrate
== 20261116090000 ChangeViewsCountToBigint: migrating =========================
-- change_column(:articles, :views_count, :bigint, {null: false, default: 0})
   -> 20.8694s
== 20261116090000 ChangeViewsCountToBigint: migrated (20.8696s) ===============

$ ruby script/ch27_during.rb   # db:migrate の途中で実行する
SELECT  0.57 秒かかった（07:08:33.348 に開始）
UPDATE 17.62 秒かかった（07:08:33.920 に開始）

mysql> SHOW PROCESSLIST;       # UPDATE が待っている間
Time  State                            Info
4     copy to tmp table                ALTER TABLE \`articles\` CHANGE \`views_count\` \`views_count\` bigint DEFAULT 0 NOT NULL …
1     Waiting for table metadata lock  UPDATE \`articles\` SET \`articles\`.\`views_count\` = 10, …
`}
          />
          <p>
            MySQL は列の型を変えるとき、新しい型のテーブルを作り、すべての行を写します（SHOW PROCESSLIST の copy to tmp table）。この変更の間は同じテーブルに書き込めません<Ref n={3} />
            。約21秒の間に送った SELECT は 0.57 秒で返りましたが、UPDATE は Waiting for table metadata lock（テーブルの定義にかかるロックの待ち）の状態になり、ALTER TABLE
            が終わるまで約18秒待ちました（図 27-3）。本番環境なら、その間に記事を保存しようとした要求は、応答を返せずに待ち続けます。一方、同じ 786,432 行のテーブルに add_column で列を追加したときは
            0.0939 秒で終わりました。MySQL 8.4 は列の追加を、行を写さずにテーブルの定義の情報だけを書き換える方式（INSTANT）で行うからです<Ref n={3} />。
          </p>
          <p>
            このように、本番環境のマイグレーションでは変更の内容に加えて、変更の間に動いているコードと、変更にかかる時間とロックを考えます。次の節では適用の記録をもう一度整理し、その後の節で、古いコードと新しいコードが同時に動いても失敗しない変更の順序と、MySQL
            の変更方式とロックの待ちを扱います。
          </p>
          <Figure n="27-3" title="動いているアプリケーションとテーブルの変更" caption="デモのコピー（Rails 8.1.4.1・MySQL 8.4）での実測をもとにした模式図。">
            <LiveChangeFigure />
          </Figure>
        </>
      ),
    },
    { id: 'basics', title: 'マイグレーションはDBの構造を変更するコード', body: <>
      <p>テーブル、列、型、索引、制約などのDBの構造を<Term en="schema">スキーマ</Term>と呼びます。マイグレーションはこの構造を変更するSQLを対象の環境で実行します。本章では「何を変更するか」に加え「いつ、どのコードと組み合わせて変更するか」を扱います。</p>
      <p>Railsは、適用が完了したマイグレーションの番号を schema_migrations テーブルに記録します。番号は通常、ファイル名の先頭の日時です。db/schema.rb はDBの構造をRubyで表した記録で、業務データそのものを保存したバックアップではありません。DB固有の機能を記録したい場合はSQL形式の structure.sql も選べます。<Ref n={1} /></p>
      <Code lang="bash" title="開発用DBで適用状況と構造の変更を確認する" code={`
bin/rails generate migration AddDisplayTitleToArticles display_title:string
bin/rails db:migrate:status
bin/rails db:migrate
# 新規の変更が意図した列・型になっているか、db/schema.rb の差分も確認する
`} />
      <p>すでに共有環境で適用したファイルを編集しても、その番号が適用済みならRailsは再実行しません。変更履歴を作り直すのではなく、必要な修正を新しいマイグレーションとして追加します。ローカルで作ったばかりの変更を試す場合と、すでに利用者のデータが入った環境の変更は分けて考えます。</p>
      <Callout title="この章の実例の範囲"><p>実測は、業務アプリと接続しない検証用DBで行いました。Ruby 4.0.9、ActiveRecord 8.1.4.1、MySQL 8.4.13です。実測と明記していないコードは説明用です。小さなテーブルで成功したことは、本番と同じ時間や負荷で終わることを保証しません。</p></Callout>
    </> },
    { id: 'reversible', title: 'change・up/down と戻せるものの範囲', body: <>
      <p>change に書いた操作の逆をRailsが判断できる場合、ロールバックでは逆の操作が実行されます。例えば add_column の逆は列の削除です。up と down を使うと、適用時と戻すときの処理をそれぞれ書けます。逆の操作が分かることと、元のデータを取り戻せることは別です。<Ref n={1} /></p>
      <Code lang="ruby" title="列を追加するマイグレーションの例" code={`
class AddDisplayTitleToArticles < ActiveRecord::Migration[8.1]
  def change
    add_column :articles, :display_title, :string
  end
end
`} />
      <p>検証用の lab_articles テーブルでは、適用後に display_title が存在し、逆方向の実行後には存在しなくなることを確認しました。追加した列に値を書いていた場合、その値も削除されます。remove_column に型を添えて逆に列を作れるようにしても、消えた値までは復元されません。</p>
      <p>MySQLで ALTER TABLE などの構造変更を行うSQLを<Term en="Data Definition Language">DDL</Term>と呼びます。多くのDDLは実行中のトランザクションを暗黙に確定します。第15章の transaction で囲めば、複数のDDLがまとめて取り消される、とは考えられません。MySQLの「atomic DDL」も、1つの対応するDDL文の整合性を守る仕組みであり、マイグレーション全体をユーザーのROLLBACKで戻す機能ではありません。<Ref n={2} /><Ref n={7} /></p>
      <Code lang="text" title="隔離したDBでの実測：列の追加に続けて不正なSQLを実行" code={`
add_column :lab_articles, :display_title, :string  # 成功
execute "INVALID SQL FOR LAB"                     # 失敗
# 例外を捕捉した後の column_exists? => true
`} />
      <p>失敗したマイグレーションは途中まで作用している可能性があります。番号の適用状況だけを見て同じ処理を再実行すると、「列がすでに存在する」という別のエラーになります。まず実際の定義を調べます。</p>
    </> },
    { id: 'deploy-order', title: '列名を変えるときは複数回の変更に分ける', body: <>
      <p>デプロイでWebプロセスを順番に入れ替える間は、旧コードと新コードが同時に動きます。Sidekiqのワーカー（ジョブを実行する別のプロセス。<ChapterLink n={18} section="sidekiq" />）や定期処理も、Webとは別に古いコードを実行していることがあります。title をいきなり display_title に改名すると、まだ title を読む旧コードは失敗します。</p>
      <p>そこで、先に使える構造を増やし、コードとデータを移してから不要な構造を減らします。この進め方は expand/contract と呼ばれます。図27-4は、名前を変えるために新しい列を追加する例です。矢印の各段階を、一度のデプロイに詰め込まずに進めます。<Ref n={6} /></p>
      <Figure n="27-4" title="列とコードを段階的に切り替える" caption="模式図。両方の列へ書く処理は、すべての書き込み経路で必要です。"><DeploymentFigure /></Figure>
      <p>新しい列は、まずNULLを許す状態で追加します。その後、両方の列に同じ値を書くコードを配布します。古い書き込み処理が残っていると、新しい列に値がある行でも旧列だけが変更されて不一致になります。Web・ジョブ・バッチの切替完了を確認してから、過去の行を補完します。</p>
      <Code lang="ruby" title="同じ更新で両方の列を保存する例" code={`
article.update!(title: new_title, display_title: new_title)
`} />
      <p>読み取り先を変える前に、NULLが残っていないか、両列の値が意図どおりかを確認します。NULLの補完だけでは、旧コードが動いていた間に生じた「両列に値はあるが異なる」行は直りません。この例ではtitleを正として、そのような行も分割して同期し、再度照合します。新コードに問題があって旧コードへ戻す期間は、旧列への書き込みも続けます。旧列の更新をやめた後は、旧コードへ戻すだけでは古い値を表示するため、どの段階まで戻せるかを先に決めます。</p>
    </> },
    { id: 'backfill', title: '既存のデータは分割して補完する', body: <>
      <p>すでに存在する行に、新しい列の値を補う処理を<Term en="backfill">バックフィル</Term>と呼びます。大量の行をマイグレーションの中で一度に更新すると、デプロイが長時間終わらず、行ロックも長く保持します。構造の変更と、大量のデータの更新を別の処理に分けると、負荷を見て止めたり再開したりできます。<Ref n={1} /></p>
      <Code lang="ruby" title="説明用：新列がNULLの行だけを、まとまりごとに補完する" code={`
# 通常の Article の検証やコールバックを持たない、作業専用のモデル
class BackfillArticle < ActiveRecord::Base
  self.table_name = "articles"
end

BackfillArticle.where(display_title: nil).in_batches(of: 500) do |batch|
  # 対象IDの取得後に別処理が書いた値も、UPDATE時の条件で保護する
  changed = batch.where(display_title: nil).update_all("display_title = title")
  puts "updated=#{changed}"
  sleep 0.1
end
`} />
      <p>500件と0.1秒は設定例です。1回の時間、DBの負荷を見て調整します。更新を複製する別のDB（レプリカ）がある構成では、そちらへの反映の遅れも確認します。全体を1つの transaction で囲むと、分割しても長いトランザクションになってしまいます。進捗は処理件数やIDの範囲で記録し、記事の内容などをログに出す必要はありません。</p>
      <p>この例は「両列へ書くコードが全プロセスに行き渡っている」「NULLは未処理を意味する」という前提です。値を意図的にNULLにする仕様なら、別の進捗管理が必要です。隔離したDBでは、未補完の2行がコピーされ、再実行しても新列に書かれた編集済みの値が上書きされないことを確認しました。</p>
      <p>update_all は検証とコールバックを呼びません（<ChapterLink n={14} />）。それが適切な更新かを判断し、必要な日時や関連データの更新は別途設計します。アプリの現在のモデルに依存したデータ更新を古いマイグレーションに埋め込むと、将来そのモデルが変わったときに再実行できなくなる点にも注意します。分割処理自体にも同時更新の競合があるため、条件と完了後の照合が必要です。<Ref n={8} /></p>
    </> },
    { id: 'ddl-locks', title: 'MySQLの変更方式とメタデータロック', body: <>
      <p>DDLの実行時間は、Railsのコードの行数では決まりません。MySQLがどの方式で変更するか、テーブルの大きさ、他の接続が何をしているかで変わります。ALGORITHM は変更方式を指定するオプションです。<Ref n={3} /></p>
      <div className="table-wrap"><table><thead><tr><th>方式</th><th>意味</th><th>注意点</th></tr></thead><tbody>
        <tr><td>INSTANT</td><td>対応する変更を、主に定義情報の更新で行う</td><td>すべての列変更に使えるわけではない。ロック待ちは起こり得る</td></tr>
        <tr><td>INPLACE</td><td>従来のテーブルコピー方式を避けて変更する</td><td>操作によっては内部でテーブルを再構築し、多くの時間や領域を使う</td></tr>
        <tr><td>COPY</td><td>変更後のテーブルへデータをコピーする</td><td>書き込みへの影響と作業領域を考慮する</td></tr>
      </tbody></table></div>
      <p>MySQLのオンラインDDLは、対応する構造変更を通常の読み書きと並行して進める仕組みです。ただし、テーブルの列などの定義を保護する<Term en="metadata lock">メタデータロック</Term>は必要です。行を更新していないSELECTでも、トランザクションが終わるまでこのロックを保持する場合があります。図27-5のように、待っているDDLが後続の処理を待たせることもあります。<Ref n={4} /></p>
      <Figure n="27-5" title="オンラインDDLでも起こるロック待ち" caption="模式図。破線は、一方の処理が他方を待たせる関係を表します。"><LockFigure /></Figure>
      <Code lang="sql" title="隔離したDBで確認した、待ち時間を制限する例" code={`
-- 接続A（SELECT後、まだトランザクションを終えない）
START TRANSACTION;
SELECT * FROM lab_articles;

-- 接続B
SET SESSION lock_wait_timeout = 1;
ALTER TABLE lab_articles ADD COLUMN extra_note VARCHAR(255), ALGORITHM=INSTANT;
-- 接続Aが保持するロックを待ち、エラー1205になった

-- 接続A：検証後に終了する
ROLLBACK;
`} />
      <p>この実測では1秒で待ちを打ち切りました。lock_wait_timeout はメタデータロックの待ち時間の設定で、行ロック用の innodb_lock_wait_timeout とは別です。また、DDLの作業時間全体の上限でもありません。接続に設定する値なので、接続をプール（作った接続をためておき、使い回す仕組み。<ChapterLink n={15} section="pool" />）へ戻す運用では変更前の値へ戻す扱いも必要です。<Ref n={9} /></p>
    </> },
    { id: 'indexes-constraints', title: '索引・NOT NULL・一意制約を追加する', body: <>
      <p>索引を追加すると、検索条件によってはクエリ（DBへの問い合わせのSQL）が速くなります。ただし、索引の作成時には既存のデータを読みます。主キー以外の通常の索引（セカンダリー索引）を追加するとき、MySQLでは INPLACE と LOCK=NONE を明示できる場合があります。対応できない変更ならエラーになり、意図せずより強いロックの方式へ切り替わることを避けられます。対象のDBのバージョンと操作の組み合わせを確認します。<Ref n={3} /></p>
      <Code lang="sql" title="隔離した検証用テーブルで実行した例" code={`
ALTER TABLE lab_articles
  ADD INDEX idx_lab_title (title),
  ALGORITHM=INPLACE, LOCK=NONE;
`} />
      <p>LOCK=NONE は、主な処理中に読み書きを許す指定であり、メタデータロックが不要になる意味ではありません。Railsで execute を使うなら、逆のSQLを down に用意するか、戻せない理由を明示します。PostgreSQL向けの algorithm: :concurrently をMySQLにそのまま持ち込むこともできません。</p>
      <p>NOT NULL は、既存行の補完と、新たなNULLを書かないコードの配布が済んでから付けます。NULLが0件だった一時点の確認だけでは、確認直後の書き込みを防げません。MySQLのNOT NULLへの変更は、INPLACEでも再構築を伴う場合があり、単なる設定値の更新とは限りません。</p>
      <p>一意制約も同様です。第14章で見たとおり、アプリの uniqueness 検証だけでは同時登録を防げません。まず、どの組み合わせを一意にするかを決め、既存の重複を解消し、新しい重複が入らないよう書き込みを制御してから索引を作ります。作成に失敗したら、重複の再発や、文字列の比較規則（照合順序）も調べます。例えば、大文字と小文字を区別しない設定では、見た目が異なる文字列も同じ値と判定されます。<ChapterLink n={14} section="uniqueness" /></p>
      <Code lang="sql" title="会社内でコードを一意にする場合の、重複の調査例" code={`
SELECT company_id, external_code, COUNT(*) AS total
FROM articles
WHERE external_code IS NOT NULL
GROUP BY company_id, external_code
HAVING COUNT(*) > 1;
`} />
      <p>上の列は説明用です。NULLを許すことと一意であることは別の条件なので、NULLも禁止したいならNOT NULLを別途検討します。外部キーを追加するときも、参照先のない行の有無を先に確認します。制約を付ける前の調査と、DBが実際に制約を受け入れたことの確認を両方行います。</p>
    </> },
    { id: 'remove-columns', title: '列を削除する前にコードから参照をなくす', body: <>
      <p>削除予定の列をコードから参照しなくなったとしても、長く動いているプロセスは列の情報をキャッシュしています（読み込んだ列の一覧を使い続けること。『動いているアプリケーションのテーブルを変える』の節）。Railsには、対象の列をモデルが扱わないよう指定する ignored_columns があります。削除を先に実行するのではなく、列を無視するコードを配布して全プロセスの切替を確認してから、列を削除します。<Ref n={5} /></p>
      <Code lang="ruby" title="旧列の利用を終えた段階でArticleモデルに指定する" code={`
class Article < ApplicationRecord
  self.ignored_columns += ["title"]
end
`} />
      <p>フォーム、ビュー、検索条件、並び順、直接書いたSQL、シリアライズ（値を文字列などに変えて列に保存すること）、バッチの参照も先に除きます。この指定は、SQL文字列の中の title を自動で直すものではありません。また、列をまだ必要とする旧コードへ戻す予定がある間は削除できません。</p>
      <p>strong_migrations は、危険になりやすい変更を見つけて説明する補助gemです。MySQLにも対応する確認項目がありますが、アプリ独自の書き込み経路や、本番のデータ量まで保証するものではありません。本章では補助として紹介し、参照した業務アプリへの導入や、このgemによる実行検証は行っていません。<Ref n={6} /></p>
    </> },
    { id: 'recovery', title: '失敗したら定義・データ・コードを分けて確認する', body: <>
      <p>失敗したときは、まずどのSQLまで成功したか、現在どのコードが動いているかを確認します。db:migrate:status、実行ログ、SHOW CREATE TABLE、索引と制約の情報を照合します。schema.rbは手元の記録なので、失敗した環境の実際の状態と一致するとは限りません。</p>
      <Figure n="27-6" title="途中失敗から復旧方法を選ぶ" caption="模式図。列が残る現象は、本章のMySQL検証でも確認しました。"><RecoveryFigure /></Figure>
      <p>問題が新しいコードだけにあり、DBは旧コードと互換なら、コードだけ戻す選択肢があります。一方、列を削除した後に旧コードへ戻しても動きません。DBの逆操作を実行する場合も、その操作でさらにデータを失わないか、実行に必要な時間とロックを確認します。</p>
      <p>削除・変換で失った値は、バックアップや更新履歴からの復元が必要です。バックアップの取得時点以降の更新をどう扱うかまで含めて復旧方法を考えます。適用履歴を手で書き換えて成功したことにする、エラーを無条件で無視する、といった対処では、環境ごとの状態の違いが残ります。</p>
      <p>事前検証では、本番に近いテーブル定義とデータ量を用意し、旧コード・新コードとの組み合わせを確かめます。所要時間だけでなく、待ち時間、追加領域、更新中の読み書き、失敗後の状態も観察します。変更を中止する条件と復旧担当を決めておくと、待ち続けるDDLを前に判断が遅れることを防げます。</p>
      <Callout kind="v72"><p>段階的なデプロイ、MySQLのDDL、ロック、データ復元という考え方はRails 7.2でも必要です。マイグレーションの継承元に書く [7.2] や [8.1] は、そのバージョンの互換動作を選ぶ指定です。既存ファイルの番号を一括で書き換えて新しいバージョンに合わせるものではありません。<Ref n={1} /></p></Callout>
    </> },
    { id: 'summary', title: 'まとめ', body: <ul>
      <li>テーブルの構造は列・型・索引・制約からなり、制約に反する行はDBが保存を断ります。db:migrate はマイグレーションのSQLを実行し、番号を schema_migrations に記録し、構造を schema.rb に書き出します。</li>
      <li>古いコードのプロセスは、読み込んだ列の一覧で動き続けます。列名を一度に変えると古いプロセスが失敗し、行を写す変更の間は書き込みが待たされます。</li>
      <li>スキーマの変更、データの補完、コードの切替を分け、旧コードが動く期間を考慮します。</li>
      <li>changeで逆操作ができても、削除されたデータが戻るとは限りません。MySQLではDDLの途中失敗後にも変更が残り得ます。</li>
      <li>バックフィルは分割し、同時更新を上書きしない条件と、再開・完了確認の方法を用意します。</li>
      <li>INPLACEやLOCK=NONEでも負荷とメタデータロック待ちは起こります。実際のDBのバージョンと変更内容で検証します。</li>
      <li>制約を付ける前に既存データと書き込み経路を整え、列を消す前に全プロセスから参照をなくします。</li>
    </ul> },
  ],
  sources: [
    { title: 'Active Record Migrations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_migrations.html', accessed: '2026-11-12', version: 'Rails 8.1', note: '適用履歴、changeとup/down、スキーマの記録、データ更新を分離する考え方。' },
    { title: 'Statements That Cause an Implicit Commit', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html', accessed: '2026-11-12', version: 'MySQL 8.4', note: 'ALTER TABLEなどの暗黙コミット。' },
    { title: 'Online DDL Operations', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl-operations.html', accessed: '2026-11-12', version: 'MySQL 8.4', note: '索引追加、列変更、NOT NULLの方式と制約。' },
    { title: 'Online DDL Performance and Concurrency', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl-performance.html', accessed: '2026-11-12', version: 'MySQL 8.4', note: 'LOCK指定とメタデータロックによる待ち。' },
    { title: 'ActiveRecord::ModelSchema — ignored_columns=', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v8.1.4.1/activerecord/lib/active_record/model_schema.rb', accessed: '2026-11-12', version: 'Rails 8.1.4.1', note: 'ローカルの同版gemのソースで、列を無視してから削除する説明を確認。' },
    { title: 'strong_migrations README', publisher: 'ankane/strong_migrations（GitHub）', url: 'https://github.com/ankane/strong_migrations', accessed: '2026-11-12', note: '列の削除・変更・改名を段階化する方法、MySQLの検査項目。gemの実行検証は未実施。' },
    { title: 'Atomic Data Definition Statement Support', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/atomic-ddl.html', accessed: '2026-11-12', version: 'MySQL 8.4', note: 'atomic DDLとユーザーのトランザクションの区別。' },
    { title: 'ActiveRecord::Batches', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1.0/classes/ActiveRecord/Batches.html', accessed: '2026-11-12', version: 'Rails 8.1.0', note: 'in_batchesによる分割と、同時更新による競合への注意。' },
    { title: 'Server System Variables — lock_wait_timeout', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html#sysvar_lock_wait_timeout', accessed: '2026-11-12', version: 'MySQL 8.4', note: 'メタデータロックの待ち時間。' },
    { title: 'How MySQL Uses Indexes', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/mysql-indexes.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: '索引が特定の値の行をすぐに見つけるためのものであること、索引が無ければ先頭から表全体を読むこと。EXPLAIN の出力はデモのコピーで実測。' },
    { title: 'FOREIGN KEY Constraints', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: '外部キー制約が、親テーブルに無い値を子テーブルに入れることを拒むこと。制約に反したときの例外は Rails 8.1.4.1 で実測。' },
    { title: 'SHOW CREATE TABLE Statement', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/show-create-table.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: 'テーブルを作る CREATE TABLE 文を表示すること。' },
    { title: 'Data Types', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/data-types.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: 'BIGINT・VARCHAR・DATETIME の値の範囲と、DATETIME の小数秒の桁数（fsp）。' },
  ],
}
export default withExplanations(ch27, explanation27)
