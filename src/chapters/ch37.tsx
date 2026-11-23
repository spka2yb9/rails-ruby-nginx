import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { SqlLab } from '../components/SqlLab'
import { BTreeFigure, CompositeFigure, ExplainFlowFigure, RangeAndInFigure, ScanAndSearchFigure, TableAndIndexFigure } from '../visuals/ch37-figures'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1/activerecord'

const chapter: Chapter = {
  number: 37,
  part: 3,
  title: 'インデックスと実行計画',
  summary:
    '年齢を指定して利用者を探すとき、DB は表の全員を調べるのでしょうか。検索用の索引を作る前後で実行計画を読み比べ、複数の列を索引に入れた場合や、データを書き換えた場合の違いを確かめます。',
  goals: [
    'SQLite と MySQL の実行計画で、表全体を読む場合と索引で探す場合を読み分けられる',
    '複数の列をまとめた索引では、列の順番と検索条件がどう関係するかを説明できる',
    'Rails で索引を追加し、読み取りの効果と書き込み時の負担を比べられる',
  ],
  prerequisites: [35, 36],
  sections: [
    {
      id: 'what-is-index',
      title: 'インデックスは列の値の順に並べた別のデータ',
      body: (
        <>
          <p>
            <ChapterLink n={35} /> と <ChapterLink n={36} /> では WHERE で条件に合う行を選び、JOIN や GROUP BY で表を組み合わせて集計しました。この章では、条件に合う行を DB がどうやって見つけるかを扱います。例として、サンプル DB の users
            テーブル（8行）からメールアドレスが alice@example.com の行を探します。
          </p>
          <Code lang="sql" code={`SELECT * FROM users WHERE email = 'alice@example.com';`} />
          <p>
            Rails で <code>User.find_by(email: "alice@example.com")</code> と書くと、この形の SQL が DB に送られます。行の少ない開発環境ではすぐに結果が返る SQL が、行の多い本番環境では遅くなることがあります。この節で説明する行の探し方が、その理由の1つです。
          </p>
          <p>
            users テーブルの行は主キーの id の順に格納されています。SQLite の表は行を rowid（INTEGER PRIMARY KEY の列はその別名）の順に持ち
            <Ref n={2} />、MySQL の InnoDB（MySQL が既定で使うストレージエンジン）も行を主キーの順に並べて格納します
            <Ref n={7} />。email の値は格納の順と関係がないので、DB は alice@example.com の行がどこにあるかを知りません。そこで先頭の行から最後の行まで1行ずつ読み、email が一致するかを確かめます。これを
            <Term en="full table scan">全件の走査</Term>と呼びます。8行なら8回の確認で済みますが、100万行あれば100万行を読みます。一致する行が1行しかなくても、ほかに一致する行が無いことを確かめるために最後まで読みます
            <Ref n={4} />。
          </p>
          <p>
            <Term en="index">インデックス</Term>は、指定した列の値と、その値を持つ行の位置を組にして、表とは別に列の値の順に並べたデータです。本書のほかの章や MySQL の日本語の資料では索引とも書きます。SQLite
            の資料はインデックスを「元の表とは別の表で、列の値を rowid の前に置き、列の値の順に並べたもの」と説明しています
            <Ref n={2} />。
          </p>
          <p>
            サンプル DB では名前のアルファベット順に id を振ってあるので、email の順と id の順がたまたま一致します。並び方の違いがわかるように、図 13-1 では age 列のインデックスを例にします。左の表は id
            の順、右のインデックスは age の小さい順に並び、各項目は行の id を持っています。
          </p>
          <Figure
            n="13-1"
            title="表と age 列のインデックス"
            caption="サンプル DB の users（8行、一部の列）と、age 列に作ったインデックスの模式図。インデックスの内部の形（B-tree）は省略し、値の並びだけを示している。"
          >
            <TableAndIndexFigure />
          </Figure>
          <p>
            <code>WHERE age = 20</code> の行を探すとき、DB はまずインデックスの中で 20 の位置を探します。インデックスは age の順に並んでいるので、真ん中の値と比べて、探す値が小さければ前半だけ、大きければ後半だけを残す比較を繰り返せます。この探し方を
            <Term en="binary search">二分探索</Term>と呼び、n 個の値から位置を決める比較はおよそ log<sub>2</sub>n 回で済みます
            <Ref n={2} />（8個なら3回、1万個なら13〜14回）。同じ値の項目は隣り合っているので、20 の項目を続けて読み、各項目の id（1 と 6）で表の行を読みます。インデックスでの探索は「インデックスで位置を探す」と「表の行を読む」の2段階になります
            <Ref n={2} />。
          </p>
          <p>
            実際の DB はインデックスを配列ではなく B-tree という木の形のデータで持ち、行の追加や削除があっても値の順を保ちます。MySQL の主なインデックス（PRIMARY KEY・UNIQUE・INDEX）は B-tree に格納されます
            <Ref n={4} />。配列のままでは、途中に値を1つ入れるたびに、それより後ろの値をすべてずらす必要があります。B-tree はインデックスの項目を<Term en="page">ページ</Term>
            という決まった大きさの単位に分けて持ちます。InnoDB の既定では1ページが 16KB です。ページには次の2種類があります。
          </p>
          <ul>
            <li>葉のページ（leaf page）：インデックスの項目（列の値と行の位置の組）が、値の順に入っています。</li>
            <li>
              途中のページ（interior page）：区切りの値と、下にあるページの番号が入っています。探す値を区切りの値と比べると、次に読むページが1つに決まります。いちばん上にある1つのページを根（root
              page）と呼び、探索は根から始めます。
            </li>
          </ul>
          <p>
            次の図は、図 13-1 の age 列のインデックスを、1ページに3項目までしか入らないと仮定して B-tree の形にしたものです。<code>WHERE age = 20</code> では、根のページで 20
            を区切りの値と比べて、中央の葉のページに進みます。そのページの中で 20 の項目を2つ読み、次の項目が 24 なので読み終えます。読んだページは根と葉の2ページで、左右の葉のページは読みません。
          </p>
          <Figure
            title="B-tree での age = 20 の探索"
            caption="サンプル DB の8行で作った age 列のインデックスを、1ページに3項目までしか入らないと仮定して描いた模式図。実際の1ページにはもっと多くの項目が入るので、8行のインデックスは1ページに収まる。"
          >
            <BTreeFigure />
          </Figure>
          <p>
            1つのページから下に分かれる数は2つに限りません。たとえば根から100ページに分かれ、その各ページからさらに100ページに分かれるとすると、3段目の葉のページは 100 × 100 = 1万ページになります。葉の1ページに100項目が入れば、合計で100万項目です。この場合、100万行の表でも、根、2段目、葉の3ページを読めば目的の項目に着きます。二分探索が1回の比較で範囲を2分の1にするのに対し、この例の
            B-tree は1ページを読むごとに範囲を100分の1にします。
          </p>
          <p>
            行を追加するときは、主にその値が入る葉のページを書き換えるだけで済み、配列のように後ろの値をすべてずらす必要がありません。項目が値の順に並んでいる点は配列と同じです。そのため B-tree のインデックスは =
            の検索だけでなく、BETWEEN や不等号での範囲の検索にも使えます。後の節で扱う複合インデックスの列の順や、インデックスが使われない条件も、項目がどの値の順に並んでいるかから説明できます。この後の図は木の形を省略し、値の並びだけを示します。
          </p>
          <p>
            InnoDB では、表の行そのものが主キーの順に並んだインデックス（<Term en="clustered index">クラスタインデックス</Term>）に入っていて、それ以外のインデックス（
            <Term en="secondary index">セカンダリインデックス</Term>）の各項目は、行の位置として主キーの値を持ちます。セカンダリインデックスで見つけた主キーの値で、クラスタインデックスから行を読みます
            <Ref n={7} />。email のインデックスで1行を探すときは、email のインデックスの B-tree をたどった後、見つけた主キーの値でクラスタインデックスの B-tree をもう一度たどります。
          </p>
          <p>図 13-2 は email での検索を、インデックスが無い場合とある場合で比べたものです。この章の実行欄に出る比較図と同じ考え方で描いています。</p>
          <Figure
            n="13-2"
            title="全件の走査とインデックスでの探索"
            caption="サンプル DB の users（8行）で email = 'alice@example.com' を探す場合。右は値を並べた配列での二分探索のモデルで、実際の B-tree の内部の動きや、SQLite が読んだ行の数を測ったものではない。"
          >
            <ScanAndSearchFigure />
          </Figure>
          <p>
            左の全件の走査では、alice の行は1行目にありますが、残りの7行も確かめます。右の二分探索では、dave、bob と比べて範囲を半分ずつに絞り、3回目の比較で alice の位置が決まります。行が増えるほど差は大きくなり、10,008
            行では 10,008 行の確認と13回の比較の差になります。
          </p>
          <p>
            インデックスを作っても、SELECT の書き方も結果も変わりません。DB は SQL を受け取ると、どのインデックスを使い、表をどの順に読むかを決めてから実行します。この手順を<Term en="query plan">実行計画</Term>
            と呼びます。SQLite では SQL の前に EXPLAIN QUERY PLAN を、MySQL では EXPLAIN を付けると、結果の行の代わりに実行計画が返ります
            <Ref n={1} />
            <Ref n={9} />。次の節では SQLite の実行計画で、全件の走査を表す <code>SCAN</code> と、インデックスなどで読む範囲を絞る <code>SEARCH</code> を見分けます。読み方の詳細は後の EXPLAIN の節で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'index',
      title: '単一列のインデックスでメールアドレスの検索を速くする',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>
            インデックスは検索に使う列の値から対象の行をたどるためのデータで、全件を順に調べるより読む行の候補を絞れる場合があります。作るときは CREATE INDEX の後にインデックスの名前を、ON
            の後に表と列を書き、消すときは DROP INDEX を使います。
          </p>
          <Code
            lang="sql"
            title="実行欄の Index のサンプル（SQLite）"
            code={`
-- ①メール検索
SELECT * FROM users WHERE email = 'alice@example.com';

-- ②Index作成：CREATE INDEX インデックスの名前 ON 表(列)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ③Index削除
DROP INDEX IF EXISTS idx_users_email;
`}
          />
          <p>
            <code>IF NOT EXISTS</code> は同じ名前のインデックスがすでにあれば何もしない指定、<code>IF EXISTS</code> は無ければ何もしない指定で、サンプルを何度実行してもエラーにならないように付けてあります。インデックスの名前は表の中で重ならなければ自由に付けられ、ここでは
            idx_表_列 の形にしています。
          </p>

          <h3>実行欄で試す</h3>
          <p>
            次の実行欄では、下の「Index と実行計画・Table / Schema の一覧」が最初から開いています。表の構造は <ChapterLink n={35} /> で説明したサンプル DB と同じです。次の順に操作します。
          </p>
          <ol>
            <li>
              入力欄に入っている「①メール検索」の SELECT を実行します。結果は Alice の1行で、「EXPLAIN · 実際のSQLite実行計画」には全件の走査を表す <code>SCAN users</code> が出ます。
            </li>
            <li>
              Example の選択欄で「②Index作成」を選び、「サンプルSQL挿入」を押して実行します。CREATE INDEX は結果の行を返しません。実行計画の欄は直前に実行した SELECT（監視中の SQL）の計画を取り直し、Before に{' '}
              <code>SCAN users</code>、After に <code>SEARCH users USING INDEX idx_users_email (email=?)</code> と「計画が変化」を表示します。Index一覧にも idx_users_email が加わります。
            </li>
            <li>
              「Table / Schema / Index」の「Generate 10,000 rows」を押すと、users に10,000行が加わり 10,008 行になります。加わる行は name が「User 番号」、email が「user番号@example.com」、age が 18〜67 の繰り返し、department_id
              が NULL です。計画は変わらないので「計画は同じ」と表示されます。追加は合計 20,000 行までで、10,008 行のときにもう一度 10,000 行を追加しようとすると「教材の上限は20,000行です」と表示されます。
            </li>
          </ol>
          <SqlLab lesson="Index" title="SQL を実行する：Index" openIndex />
          <p>
            実行計画の下の「探索をイメージする」には、総行数、email の Cardinality（列の異なる値の数）、Selectivity（条件に一致する行の割合）と2つの比較図が出ます。8行のときは「Indexなし · 全行確認モデル」が確認対象 8 行、「Indexあり · 順序付きキーの探索モデル」が
            dave@example.com → bob@example.com → alice@example.com の3回の比較で、図 13-2 と同じです。10,008 行では確認対象が 10,008 行、比較が13回になります。
          </p>
          <p>
            行が多い状態で Before と After を比べるには、「③Index削除」、「①メール検索」（SCAN users）、「②Index作成」の順に実行します。「サンプルDB初期化」を押すと users は8行に戻り、作ったインデックスも消えます。このデータベースは同じページのほかの実行欄と共有していて、ページを再読み込みすると初期の状態に戻ります。
          </p>

          <h3>なぜそうなるか</h3>
          <p>
            インデックスが無いと email の値から行の位置を知る方法が無いので SCAN になり、idx_users_email があると email の順に並んだ値の中で位置を探せるので SEARCH になります。<code>(email=?)</code>{' '}
            は、インデックスを使った条件です
            <Ref n={1} />。
          </p>
          <p>
            Cardinality は列の異なる値の数で、ここでの Selectivity（該当率）は条件に一致する行の割合です。10,008 行のうち alice@example.com は1行なので、該当率は 0.01% です。該当率が低い検索ほど、インデックスで候補を絞る効果が大きくなります。該当率が高い検索では、この効果が小さくなります。たとえば orders の status のように値が数種類しか無い列では、1つの値に表の何割もの行が一致します。全件に近い行を取り出す検索や小さな表では、インデックスがあっても全件の走査が選ばれることがあります。インデックスで見つけた項目ごとに表の行を読みにいく処理が加わるので、ほとんどの行を読むなら表を先頭から順に読むほうが速いためです
            <Ref n={4} />
            <Ref n={6} />。SQLite はこのサンプルの8行でも SEARCH を選びましたが、MySQL の資料は、10行未満で1行の短い表ではインデックスを使うより全件の走査のほうが速いことがよくあるとしています
            <Ref n={11} />。どちらを選ぶかは DB ごとに異なるので、実際の実行計画で確かめます。
          </p>
          <p>
            比較図はソート済みの配列を二分探索するモデルで、SQLite の測定値や B+Tree の内部の構造を示すものではありません。実行欄の注記にある B+Tree は B-tree の一種です。同じ値が複数あるときにそれらをすべて読む処理と、表の行を読む処理も図には含まれていません。実行計画、結果の行、Cardinality、該当率は実行欄の
            SQLite から取得した値です。
          </p>
          <p>
            主キーでの検索はインデックスを作らなくても SEARCH になります。<code>SELECT * FROM users WHERE id = 3;</code> を実行すると、計画は <code>SEARCH users USING INTEGER PRIMARY KEY (rowid=?)</code>{' '}
            です。SQLite の表は rowid の順に行を持っているので、表そのものを二分探索できます
            <Ref n={2} />。この探索に使う構造は Index一覧には現れません。
          </p>
        </>
      ),
    },
    {
      id: 'index-rails',
      title: 'Active Record ではマイグレーションの add_index でインデックスを作る',
      body: (
        <>
          <p>
            Rails のアプリケーションではインデックスを SQL ではなく<Term en="migration">マイグレーション</Term>で作ります。マイグレーションは DB の表の構造を変える Ruby のクラスで、
            <code>bin/rails db:migrate</code> で実行すると、Rails が CREATE TABLE や CREATE INDEX の SQL を作って DB に送ります（詳しくは <ChapterLink n={11} section="migration" />{' '}
            と <ChapterLink n={27} section="basics" />）。
          </p>
          <p>
            ここからは、サンプル DB と同じ構造の表を MySQL 8.4.13 に作り、Rails 8.1.4.1（Ruby 4.0.9）で確かめた結果を示します。users にはサンプルと同じ8行と、実行欄の Generate と同じ規則で作った
            20,000 行を入れ、合計 20,008 行にしました。
          </p>
          <Code
            lang="ruby"
            title="検証に使ったマイグレーション（departments は省略）"
            code={`
class CreateTables < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.integer :age, null: false
      t.bigint :department_id
      t.datetime :created_at, null: false
    end
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :amount, null: false
      t.string :status, null: false
      t.datetime :created_at, null: false
    end
  end
end

class User < ApplicationRecord
  has_many :orders
end
`}
          />
          <p>
            まだ email にインデックスはありません。<code>User.find_by(email: "alice@example.com")</code> と <code>User.where(email: "alice@example.com")</code> は、次の SQL
            になります。find_by は1件だけ返すので <code>LIMIT 1</code> が付きます。
          </p>
          <Code
            lang="sql"
            title="ログに出た SQL"
            code={`
SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`email\` = 'alice@example.com' LIMIT 1
SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`email\` = 'alice@example.com'
`}
          />
          <p>
            Relation の <code>explain</code> を呼ぶと、MySQL の EXPLAIN の結果を表の形で返します
            <Ref n={16} />。コンソールでは戻り値がそのまま表示されます。
          </p>
          <Code
            lang="text"
            title="User.where(email: &quot;alice@example.com&quot;).explain（インデックスなし）"
            code={`
EXPLAIN SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`email\` = 'alice@example.com'
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows  | filtered | Extra       |
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-------------+
|  1 | SIMPLE      | users | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 20168 |     10.0 | Using where |
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-------------+
1 row in set (0.00 sec)
`}
          />
          <p>
            <code>type</code> の <code>ALL</code> は表全体の走査で SQLite の SCAN に当たり、<code>key</code> の NULL は使うインデックスが無いことを表します。<code>rows</code>{' '}
            は読む必要があると MySQL が見積もった行数で、実際の 20,008 行と少し違う 20,168 になっています。InnoDB の表では見積もりなので、正確な値とは限りません
            <Ref n={8} />。最後の行の (0.00 sec) は EXPLAIN 自体にかかった時間で、SELECT の実行時間ではありません。
          </p>
          <p>
            <code>explain(:analyze)</code> と書くと、Rails は EXPLAIN ANALYZE を送ります。MySQL は SQL を実際に実行し、実行計画の各段階で返した行の数と時間を、木の形（TREE 形式）で表示します
            <Ref n={9} />。
          </p>
          <Code
            lang="text"
            title="User.where(email: &quot;alice@example.com&quot;).explain(:analyze)（インデックスなし。表の枠を省略）"
            code={`
EXPLAIN ANALYZE SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`email\` = 'alice@example.com'
-> Filter: (users.email = 'alice@example.com')  (cost=2041 rows=2017) (actual time=0.661..8.82 rows=1 loops=1)
    -> Table scan on users  (cost=2041 rows=20168) (actual time=0.0325..6.04 rows=20008 loops=1)
`}
          />
          <p>
            下の行から読みます。Table scan で表の 20,008 行をすべて読み（actual の rows=20008）、上の Filter で email が一致する1行だけを残しました。actual time
            の2つの値は最初の行を返すまでの時間と、すべての行を返すまでの時間（ミリ秒）です
            <Ref n={9} />。一致する行は1行なのに、約 8.8 ミリ秒かけて全行を読んでいます。
          </p>
          <p>インデックスを追加するマイグレーションを書き、実行します。</p>
          <Code
            lang="ruby"
            title="db/migrate/xxxx_add_email_index.rb と、実行したときの出力"
            code={`
class AddEmailIndex < ActiveRecord::Migration[8.1]
  def change
    add_index :users, :email
  end
end

# ==  AddEmailIndex: migrating ==================================================
# -- add_index(:users, :email)
#    -> 0.1930s
# ==  AddEmailIndex: migrated (0.1930s) =========================================
`}
          />
          <p>
            <code>add_index :users, :email</code> は <code>CREATE INDEX</code> の SQL を作って実行します。名前を指定しなければ、Rails は「index_表_on_列」の名前を付け、ここでは
            index_users_on_email になります
            <Ref n={17} />。名前が DB の上限より長くなるときは、<code>idx_on_</code> で始まる短い名前の末尾にハッシュ値を付けます
            <Ref n={22} />。db/schema.rb には、表の定義の中に次の行が加わります。
          </p>
          <Code lang="ruby" title="db/schema.rb（users の部分）" code={`    t.index ["email"], name: "index_users_on_email"`} />
          <p>同じ Relation の実行計画は次のように変わりました。</p>
          <Code
            lang="text"
            title="インデックスを追加した後の explain と explain(:analyze)（表の枠を省略）"
            code={`
EXPLAIN SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`email\` = 'alice@example.com'
| type | possible_keys        | key                  | key_len | ref   | rows | filtered | Extra |
| ref  | index_users_on_email | index_users_on_email | 1022    | const |    1 |    100.0 | NULL  |

EXPLAIN ANALYZE SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`email\` = 'alice@example.com'
-> Index lookup on users using index_users_on_email (email='alice@example.com')
   (cost=0.35 rows=1) (actual time=0.0101..0.0109 rows=1 loops=1)
`}
          />
          <p>
            <code>type</code> が <code>ref</code>（インデックスで値が一致する行を読む）に、<code>key</code> が index_users_on_email に、<code>rows</code> が 1 に変わりました。SQLite の
            SEARCH に当たります。<code>key_len</code> は使ったインデックスの長さ（バイト）で、email 列（最大255文字の utf8mb4 の文字列）の 1022 バイトです。<code>ref</code> の const
            は、インデックスと比べた値が定数であることを表します
            <Ref n={8} />。EXPLAIN ANALYZE では Index lookup の1段階だけになり、時間は約 0.011 ミリ秒でした。
          </p>
          <p>
            同じ値を2つ入れてはいけない列には、<code>unique: true</code> を付けて<Term en="unique index">一意インデックス</Term>にします。email の一意インデックスで同じ検索をすると、<code>type</code>{' '}
            は <code>const</code>（一致する行が最大1行）になりました
            <Ref n={8} />。同じメールアドレスの行を保存しようとすると、MySQL が拒否し、Active Record は例外を発生させます。
          </p>
          <Code
            lang="ruby"
            title="add_index :users, :email, unique: true の後"
            code={`
User.where(email: "alice@example.com").explain
# | type  | key                  | key_len | ref   | rows |
# | const | index_users_on_email | 1022    | const |    1 |

User.create!(name: "Alice2", email: "alice@example.com", age: 30)
# ActiveRecord::RecordNotUnique: Mysql2::Error: Duplicate entry 'alice@example.com'
#   for key 'users.index_users_on_email'
`}
          />
          <p>
            モデルの <code>validates :email, uniqueness: true</code> は保存の前に SELECT で同じ値を探すだけなので、同時に保存されると重複を防げません。一意インデックスは保存のたびに DB が確かめます（
            <ChapterLink n={14} section="uniqueness" />）。
          </p>
          <p>
            外部キーの列を <code>t.references</code>（または <code>add_reference</code>）で作ると、インデックスも作られます。<code>index</code> オプションの既定値が true だからです
            <Ref n={17} />。検証用の orders にも index_orders_on_user_id ができました。実行欄の SQLite のサンプル DB では、orders.user_id にインデックスはありません。
          </p>
          <Callout kind="note" title="MySQL には CREATE INDEX IF NOT EXISTS が無い">
            <p>
              実行欄のサンプルの <code>CREATE INDEX IF NOT EXISTS</code> は SQLite の構文で、MySQL 8.4 に送ると構文エラーになりました。MySQL で Rails の <code>add_index :users, :email, if_not_exists: true</code>{' '}
              を使うと、SQL に IF NOT EXISTS を付けず、先に同じ名前のインデックスがあるかを調べて、あれば何もしません
              <Ref n={21} />。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'index-cost',
      title: 'インデックスには容量と書き込みの費用がかかる',
      body: (
        <>
          <p>
            インデックスを作っても、すべての SQL が速くなるわけではなく、SQL の結果も変わりません。インデックスは表とは別のデータなので格納領域を使い、INSERT・UPDATE・DELETE
            のたびに、表に加えてインデックスも更新する処理が加わります。MySQL の資料も、不要なインデックスは領域と、どのインデックスを使うかを決める時間を無駄にし、各インデックスの更新が INSERT・UPDATE・DELETE
            の費用を増やすとしています
            <Ref n={12} />。
          </p>
          <p>
            users と同じ構造の表 bench_users を、インデックスが主キーだけの場合と、email と (age, name) のインデックスがある場合の2通りで作り、200,000 行の追加と、全行の name の更新にかかる時間を比べました。行は
            <code>INSERT … SELECT</code> で MySQL の中で作り、Ruby の処理時間が入らないようにしています。それぞれ3回測った中央値です。
          </p>
          <Code
            lang="text"
            title="MySQL 8.4.13（開発用の PC 上の Docker）での測定"
            code={`
                                             主キーだけ   email と (age, name) あり
200,000 行の INSERT … SELECT                   1.95 秒          3.49 秒
  バッファープールへの書き込み要求の回数      410,548          832,582
全行の name を UPDATE（name は (age, name) に含まれる）
                                               2.45 秒          4.54 秒
  バッファープールへの書き込み要求の回数      404,565          817,072

ANALYZE TABLE 後の大きさ（innodb_index_stats の size × ページサイズ）
  PRIMARY（行のデータ）34.6 MB
  index_bench_users_on_age_and_name 19.3 MB
  index_bench_users_on_email 12.5 MB
`}
          />
          <p>
            2つのインデックスを加えると、INSERT の時間は約1.8倍になり、InnoDB がメモリー上のページに書き込みを求めた回数（Innodb_buffer_pool_write_requests）は約2倍になりました。name を更新すると、(age, name)
            のインデックスの中で項目の位置を変える処理が加わるので、UPDATE も遅くなりました。時間の値は PC の状態で変わるので、比率を見てください。インデックスの大きさは合計で約 32 MB で、行のデータ（34.6 MB）に近い量です。
          </p>
          <p>
            使われていないインデックスを消す前には、Rails 8.1 の <code>disable_index</code>（MySQL 8.0 以降の不可視インデックス）で、消したときの影響を先に確かめられます。不可視にしたインデックスは実行計画に使われませんが、行の変更に合わせた更新や一意の確認は続きます。不可視と可視の切り替えはその場で済む操作で、インデックスを消して作り直すより短時間で終わります
            <Ref n={14} />。検証用の表で <code>disable_index :users, :index_users_on_email</code> を実行すると、email の検索は <code>type</code> が ALL に戻り、
            <code>enable_index</code> で ref に戻りました。
          </p>
          <Callout kind="v72">
            <p>
              <code>add_index</code> の <code>enabled: false</code> と、マイグレーションの <code>enable_index</code>・<code>disable_index</code> は Rails 8.1.0 で加わり
              <Ref n={23} />、7.2 にはありません。7.2 では <code>execute</code> で <code>ALTER TABLE users ALTER INDEX index_users_on_email INVISIBLE</code> を送ります。
            </p>
          </Callout>
          <p>本番の DB にインデックスを追加・削除するときは、次の点も確かめます。</p>
          <ul>
            <li>
              インデックスを作るときは、表の既存の行をすべて読みます。行の多い表では時間がかかり、MySQL の変更方式やメタデータロックによって、ほかの SQL を待たせることがあります。手順は <ChapterLink n={27} section="ddl-locks" />{' '}
              と <ChapterLink n={27} section="indexes-constraints" /> で扱います。
            </li>
            <li>
              FOR UPDATE や条件付きの UPDATE は、検索の途中で読んだ行にロックを掛けます。条件の列にインデックスが無いと、表のすべての行をロックすることがあります（<ChapterLink n={15} section="lock-index" />
              ）。インデックスを消す前に、そのインデックスを使っている更新の SQL も調べます。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'composite-index',
      title: '複合インデックスは列の順序で並ぶ',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>
            <Term en="composite index">複合インデックス</Term>は、複数の列を順番に並べたインデックスです。CREATE INDEX の括弧の中に列を並べて書きます。
          </p>
          <Code
            lang="sql"
            title="実行欄の Composite Index のサンプル"
            code={`
-- 複合Index作成
CREATE INDEX IF NOT EXISTS idx_users_age_name ON users(age, name);

-- 先頭列だけ
SELECT * FROM users WHERE age = 20;
-- 両方の条件
SELECT * FROM users WHERE age = 20 AND name = 'Alice';
-- 後続列だけ
SELECT * FROM users WHERE name = 'Alice';
-- Covering Index
SELECT age, name FROM users WHERE age = 20 AND name = 'Alice';
`}
          />
          <p>
            (age, name) のインデックスの項目は、まず age の順に並び、同じ age の中では name の順に並びます。並びは CREATE INDEX に書いた列の順で決まり、WHERE に条件を書く順とは関係ありません。
            <code>WHERE name = 'Alice' AND age = 20</code> と書いても、SQLite は <code>(age=? AND name=?)</code> の同じ計画を選びました。(age, name) と (name, age) は別のインデックスで、(name, age)
            の項目は name の順に並びます。
          </p>
          <Figure
            n="13-3"
            title="複合インデックス (age, name) の並びと3つの検索"
            caption="サンプル DB の8行で作ったインデックスの模式図。右の実行計画は実行欄の SQLite（3.49.1）の EXPLAIN QUERY PLAN の結果。"
          >
            <CompositeFigure />
          </Figure>
          <p>
            図 13-3 の左は8行から作った (age, name) の項目です。A は 20 の項目が連続しているので2項目だけを読み、B は age 20 の中が name の順に並んでいるので1項目に絞れます。C は name が age
            ごとに並んでいるだけで、全体では Hana、Carol、Alice、Frank、Bob の順なので、Alice の位置を決められません。
          </p>

          <h3>実行欄で試す</h3>
          <p>
            Example の選択欄でサンプルを選び、「サンプルSQL挿入」を押してから実行します。最初に入力欄に入っている「複合Index作成」を実行してから、「先頭列だけ」「両方の条件」「後続列だけ」の3つの SELECT
            を1つずつ実行し、それぞれの実行計画を比べます。
          </p>
          <SqlLab lesson="Composite Index" title="SQL を実行する：Composite Index" openIndex />
          <p>見る場所と、8行のサンプル DB で表示された内容は次のとおりです。</p>
          <ul>
            <li>
              この実行欄の実行計画の欄は、最初から「先頭列だけ」の SELECT（<code>WHERE age = 20</code>）を監視しています。「複合Index作成」を実行すると、その SELECT の計画を取り直し、Before に <code>SCAN users</code>、After に{' '}
              <code>SEARCH users USING INDEX idx_users_age_name (age=?)</code> を表示します。Index一覧にも idx_users_age_name が加わります。
            </li>
            <li>
              「先頭列だけ」は Alice と Frank の2行を返し、計画は <code>SEARCH users USING INDEX idx_users_age_name (age=?)</code> です。前の実行欄で 10,000 行を追加していれば、age が 20
              の生成行も含めて202行が一致し、結果の表には先頭の200行が表示されます。
            </li>
            <li>「両方の条件」は Alice の1行で、計画は <code>(age=? AND name=?)</code> になり、2つの列でインデックスを使っています。</li>
            <li>
              「後続列だけ」は同じ1行を返しますが、計画は <code>SCAN users</code> です。「探索をイメージする」の比較図は name の値だけを並べ替えたモデルなので、この SQL では実行計画と一致しません。実行計画のほうを見ます。
            </li>
            <li>
              「Covering Index」は age と name だけを返し、計画は <code>SEARCH users USING COVERING INDEX idx_users_age_name (age=? AND name=?)</code> です。
            </li>
          </ul>
          <p>
            インデックスが無い状態との違いを Before / After で見るには、<code>DROP INDEX IF EXISTS idx_users_age_name;</code> を入力して実行した後、「先頭列だけ」を実行し（SCAN users）、続けて「複合Index作成」を実行します。実行計画の欄の「Composite
            Index · 列順とCovering Index」を開くと、ここで説明した並び方の要約が表示されます。
          </p>

          <h3>なぜそうなるか</h3>
          <p>
            複合インデックスでは、先頭の列から連続した条件で読む範囲が決まります。これを<Term en="leftmost prefix">左端の列の決まり</Term>と呼びます。(col1, col2, col3)
            のインデックスは、(col1)、(col1, col2)、(col1, col2, col3) の条件での検索に使えます
            <Ref n={5} />。SQLite の資料もインデックスの先頭の列から順に = や IN で条件を付け、使う列の間を空けないことを条件にしています
            <Ref n={3} />。name だけの条件は先頭の age を含まないので、検索の範囲が age ごとの各範囲に分かれ、通常は連続した範囲を特定できません。
          </p>
          <p>
            先頭の列に範囲の条件を付けると、後ろの列は読む範囲を絞るのに使えなくなります。<code>SELECT * FROM users WHERE age BETWEEN 20 AND 25 AND name = 'Alice';</code> の計画は{' '}
            <code>SEARCH users USING INDEX idx_users_age_name (age&gt;? AND age&lt;?)</code> で、範囲は age だけで決まり、name は読んだ項目ごとに確かめます。不等号を使った列より右の列は、通常は検索の範囲に使われません
            <Ref n={3} />。
          </p>
          <p>
            「Covering Index」の SQL では、取り出す列が age と name だけで、どちらもインデックスに入っているので、DB はインデックスだけで結果を作り、表の行を読みにいきません。これを
            <Term en="covering index">カバリングインデックス</Term>と呼びます。行ごとに表を探す処理が無くなるので、多くの場合に速くなります
            <Ref n={2} />
            <Ref n={3} />。
          </p>
          <p>
            ただし、DB が実行計画を選ぶときには例外があります。SQLite では、ANALYZE を実行して先頭の列に同じ値が多いことが統計でわかると、先頭の列を指定しない検索でもインデックスを使うことがあります（skip-scan）。ANALYZE
            を実行していない DB では、この方法は使われません
            <Ref n={3} />。後の SQL Sandbox の節で試します。最終的には、実際の実行計画で判断します。
          </p>
        </>
      ),
    },
    {
      id: 'composite-rails',
      title: 'add_index に列の配列を渡して複合インデックスを作る',
      body: (
        <>
          <p>
            Active Record では <code>add_index</code> に列の配列を渡します。配列の順がインデックスの列の順になり、名前は列を _and_ でつないだ index_users_on_age_and_name になります
            <Ref n={17} />。
          </p>
          <Code
            lang="ruby"
            title="マイグレーションと db/schema.rb"
            code={`
class AddIndexToUsersAgeAndName < ActiveRecord::Migration[8.1]
  def change
    add_index :users, [:age, :name]
  end
end

# db/schema.rb
    t.index ["age", "name"], name: "index_users_on_age_and_name"
`}
          />
          <p>前の節と同じ MySQL の users（20,008 行）で、email のインデックスを消してから作り、Relation ごとの実行計画を比べました。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Relation</th>
                  <th>type</th>
                  <th>key_len</th>
                  <th>rows</th>
                  <th>Extra</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>User.where(age: 20)</code>
                  </td>
                  <td>ref</td>
                  <td>4</td>
                  <td>402</td>
                  <td>NULL</td>
                </tr>
                <tr>
                  <td>
                    <code>User.where(age: 20, name: "Alice")</code>
                  </td>
                  <td>ref</td>
                  <td>1026</td>
                  <td>1</td>
                  <td>NULL</td>
                </tr>
                <tr>
                  <td>
                    <code>User.where(name: "Alice", age: 20)</code>
                  </td>
                  <td>ref</td>
                  <td>1026</td>
                  <td>1</td>
                  <td>NULL</td>
                </tr>
                <tr>
                  <td>
                    <code>User.where(name: "Alice")</code>
                  </td>
                  <td>ALL</td>
                  <td>NULL</td>
                  <td>20197</td>
                  <td>Using where</td>
                </tr>
                <tr>
                  <td>
                    <code>User.select(:age, :name).where(age: 20, name: "Alice")</code>
                  </td>
                  <td>ref</td>
                  <td>1026</td>
                  <td>1</td>
                  <td>Using index</td>
                </tr>
                <tr>
                  <td>
                    <code>User.select(:age, :name).where(name: "Alice")</code>
                  </td>
                  <td>range</td>
                  <td>1026</td>
                  <td>2019</td>
                  <td>Using where; Using index for skip scan</td>
                </tr>
                <tr>
                  <td>
                    <code>User.where(age: 20..25, name: "Alice")</code>
                  </td>
                  <td>range</td>
                  <td>1026</td>
                  <td>2003</td>
                  <td>Using index condition</td>
                </tr>
                <tr>
                  <td>
                    <code>User.where(age: [20, 21], name: "Alice")</code>
                  </td>
                  <td>range</td>
                  <td>1026</td>
                  <td>2</td>
                  <td>Using index condition</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            どの行も key は index_users_on_age_and_name です（ALL の行だけ NULL）。<code>key_len</code> を見ると、インデックスの何列目まで使ったかがわかります
            <Ref n={8} />。age（4バイトの整数）だけなら 4、age と name（1022 バイト）なら 1026 です。<code>where</code> のハッシュの順を入れ替えても計画は変わりません。name
            だけの条件は SQLite と同じく全件の走査になりました。
          </p>
          <p>
            取り出す列を age と name に絞ると、Extra に <code>Using index</code> が出ます。表の行を読まずにインデックスだけで値を返したことを表し、SQLite の USING COVERING INDEX に当たります
            <Ref n={8} />。InnoDB のセカンダリインデックスは主キーの値も持つので
            <Ref n={7} />、<code>User.select(:id, :age, :name).where(age: 20)</code> も Using index になりました。
          </p>
          <p>
            name だけの条件でも、取り出す列が age と name だけのときは、MySQL は <code>Using index for skip scan</code> を選びました。Skip Scan は先頭の列の値ごとに後ろの列の条件で範囲を読む方法で、1つの表だけを使い、インデックスに入っている列だけを参照する、などの条件を満たすときに選ばれます
            <Ref n={10} />。<code>SELECT *</code> のように表の列が必要な SQL では選ばれず、ALL になりました。EXPLAIN ANALYZE では次のように表示されます。
          </p>
          <Code
            lang="text"
            title="User.select(:age, :name).where(name: &quot;Alice&quot;).explain(:analyze)（一部を省略）"
            code={`
-> Filter: (users.\`name\` = 'Alice')  (cost=0.411..829 rows=2019) (actual time=0.565..0.71 rows=1 loops=1)
    -> Covering index skip scan on users using index_users_on_age_and_name over name = 'Alice'
       (cost=0.411..829 rows=2019) (actual time=0.033..0.177 rows=1 loops=1)
`}
          />
          <p>
            age に範囲の条件（<code>20..25</code> は BETWEEN 20 AND 25 になる）を付けると、rows の見積もりは 2003 行で、age が 20〜25 の項目をすべて読みます。name は読んだ項目の中で確かめ、表の行を読む前に絞り込みます。これが Extra の{' '}
            <code>Using index condition</code> です
            <Ref n={8} />。age を <code>[20, 21]</code>（IN）にすると、age と name の組ごとに位置を決められるので、rows は 2 になりました。
          </p>
          <p>
            次の図は図 13-3 と同じ8行の (age, name) の項目で、範囲の条件と IN の条件のそれぞれで読む項目を比べたものです。左の範囲の条件では age だけで読む範囲が決まり、その中の項目を1つずつ name で確かめます。右の IN の条件では age と name の組ごとに位置を探します。
          </p>
          <Figure
            title="範囲の条件と IN の条件で読む項目"
            caption="図 13-3 と同じサンプル DB の8行で作った (age, name) のインデックスの模式図。色を付けた行が読む項目。左の図の縦線は age の条件だけで決まる読む範囲を表す。表の行を読む段階は省略している。"
          >
            <RangeAndInFigure />
          </Figure>
          <p>並べ替えにも複合インデックスが使われます。</p>
          <Code
            lang="text"
            title="ORDER BY の実行計画（表の枠と一部の列を省略）"
            code={`
User.where(age: 20).order(:name)
| type | key                         | rows | Extra |
| ref  | index_users_on_age_and_name |  402 | NULL  |

User.select(:name, :age).order(age: :desc)   # (age, name) を作る前
| type | key  | rows  | Extra          |
| ALL  | NULL | 20168 | Using filesort |

User.select(:name, :age).order(age: :desc)   # (age, name) を作った後
| type  | key                         | rows  | Extra                            |
| index | index_users_on_age_and_name | 20197 | Backward index scan; Using index |
`}
          />
          <p>
            age が 20 の項目の中は name の順に並んでいるので、<code>order(:name)</code> を付けても並べ替えの処理（Using filesort）が要りません。age の降順の一覧はインデックスを末尾から順に読む（Backward index
            scan）だけで並び、age と name しか使わないので表も読みません。<code>type</code> の <code>index</code> はインデックス全体を順に読むことを表します
            <Ref n={8} />。
          </p>

          <h3>注意点</h3>
          <ul>
            <li>
              列の順はよく使う検索の条件から決めます。= で比べる列を先に、範囲で比べる列や ORDER BY に使う列を後に置くと、上の例のように範囲の絞り込みと並べ替えに同じインデックスを使えます
              <Ref n={3} />。<ChapterLink n={12} section="explain" /> の (status, published_at) も同じ考え方です。
            </li>
            <li>
              (age, name) があれば、age だけの検索にも使えるので、(age) のインデックスを別に作る必要は通常ありません。SQLite の資料は、あるインデックスが別のインデックスの先頭部分になっている組を持たず、列の少ないほうを消すよう勧めています
              <Ref n={2} />。
            </li>
            <li>
              1つのインデックスに含められる列は16列までです
              <Ref n={5} />。列を増やすほどインデックスが大きくなり、前の節で見た書き込みの費用も増えます。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'explain',
      title: 'EXPLAIN QUERY PLAN で SQLite の実行計画を読む',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>
            EXPLAIN QUERY PLAN は、SQLite がどの表とインデックスをどう使う予定かを返します。SELECT の前に付けて実行すると計画の行が返り、SQL の結果や実際にかかった処理時間は返りません。
          </p>
          <Code
            lang="sql"
            title="実行欄の EXPLAIN のサンプル"
            code={`
-- 生の実行計画
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'alice@example.com';
-- ソートの計画
SELECT name, age FROM users ORDER BY age DESC;
-- JOINの計画
SELECT u.name, o.amount FROM users u JOIN orders o ON u.id = o.user_id;
`}
          />
          <p>
            結果は id・parent・notused・detail の4列で、各行が計画の木の1つの節を表します。parent は親の節の id、notused は使われていない列で、読むのは detail です
            <Ref n={1} />。detail に出る主な語は次のとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>detail の例</th>
                  <th>意味</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>SCAN users</code>
                  </td>
                  <td>表を先頭から順に読む（全件の走査）</td>
                </tr>
                <tr>
                  <td>
                    <code>SEARCH users USING INDEX i (email=?)</code>
                  </td>
                  <td>インデックス i を使い、表の行の一部だけを読む。括弧の中はインデックスを使った条件</td>
                </tr>
                <tr>
                  <td>
                    <code>SEARCH users USING INTEGER PRIMARY KEY (rowid=?)</code>
                  </td>
                  <td>主キー（rowid）で行を探す</td>
                </tr>
                <tr>
                  <td>
                    <code>… USING COVERING INDEX i</code>
                  </td>
                  <td>インデックスだけで必要な列がそろい、表の行を読まない</td>
                </tr>
                <tr>
                  <td>
                    <code>SCAN users USING COVERING INDEX i</code>
                  </td>
                  <td>インデックスを先頭から順にすべて読む。インデックスを使っても、読む範囲を絞る SEARCH とは異なる</td>
                </tr>
                <tr>
                  <td>
                    <code>USE TEMP B-TREE FOR ORDER BY</code>
                  </td>
                  <td>並べ替えのために一時的な B-tree を作る。GROUP BY・DISTINCT のときも同じ形で出る</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            JOIN では計画の行の順がループの入れ子の順（上が外側）を表します
            <Ref n={1} />。SQLite の資料は、この出力を対話的な調査のためのものとし、出力の形式が SQLite のバージョンによって変わることがあると注意しています
            <Ref n={1} />。
          </p>

          <h3>実行欄で試す</h3>
          <p>3つのサンプルを順に実行し、結果の表と実行計画の欄から SCAN、SEARCH、一時 B-tree を探します。</p>
          <SqlLab lesson="EXPLAIN" title="SQL を実行する：EXPLAIN" openIndex />
          <ul>
            <li>
              「生の実行計画」は、結果の表に id・parent・notused・detail の列が出ます。detail は、前の実行欄で作った idx_users_email が残っていれば{' '}
              <code>SEARCH users USING INDEX idx_users_email (email=?)</code>、無ければ <code>SCAN users</code> です。実行計画の欄には、EXPLAIN QUERY PLAN を除いた SELECT の計画が表示されます。
            </li>
            <li>
              「ソートの計画」は、idx_users_age_name が無ければ <code>SCAN users</code> と <code>USE TEMP B-TREE FOR ORDER BY</code> の2行です。複合インデックスの実行欄で作ったインデックスが残っていれば、
              <code>SCAN users USING COVERING INDEX idx_users_age_name</code> の1行になり、一時 B-tree が消えます。
            </li>
            <li>
              「JOINの計画」は <code>SCAN o</code> と <code>SEARCH u USING INTEGER PRIMARY KEY (rowid=?)</code> の2行です。
            </li>
          </ul>

          <h3>なぜそうなるか</h3>
          <p>
            SEARCH は検索の範囲を絞る計画、SCAN は順に読む計画です。「ソートの計画」では、インデックスが無いと表を読んだ後に age で並べ替える必要があり、そのための一時 B-tree が計画に出ます。(age, name)
            のインデックスがあれば、項目はすでに age の順に並び、name も入っているので、インデックスを末尾から読むだけで結果がそろいます。インデックス上の SCAN です
            <Ref n={1} />
            <Ref n={2} />。このとき、age が同じ Alice と Frank の順が、インデックスが無いときと入れ替わりました。ORDER BY の値が同じ行の順は決まっていないので、実行計画が変わると順も変わることがあります。
          </p>
          <p>
            「JOINの計画」では、外側のループで orders（別名 o）を1行ずつ読み、その行の user_id で users（別名 u）を主キーから探します。orders の6行それぞれについて、users の1行を二分探索で探します。
          </p>
          <p>
            SEARCH と表示されても、その SQL がすぐに終わるとは限りません。SEARCH は計画上の読み方を示すだけで、かかる時間は条件に一致する行の数、表の行を読む回数、JOIN の相手の表の読み方などで決まります。たとえば (age, name) のインデックスがあり 10,008 行のときの <code>age = 20</code> は SEARCH ですが、一致する202行それぞれについて表の行を読みます。
          </p>
          <p>
            この計画は SQLite のもので、MySQL の EXPLAIN とは出力の形式も、計画を選ぶ仕組み（オプティマイザー）も異なるため、そのまま MySQL の計画として読むことはできません。次の節で MySQL の EXPLAIN
            と対応させます。
          </p>
        </>
      ),
    },
    {
      id: 'explain-rails',
      title: 'MySQL の EXPLAIN と Relation#explain',
      body: (
        <>
          <p>
            利用者をメールアドレスで1人探すとき、MySQL はどこを読みに行くのでしょうか。ここで使う表形式の EXPLAIN では、まず <code>type</code> で表の読み方を、<code>key</code> で選んだインデックスを確かめます。ほかの列も含めて、次のように読めます
            <Ref n={8} />。
          </p>
          <ul>
            <li>
              <code>type</code>：表の読み方。<code>const</code> は一致する行が最大1行（主キーや一意インデックスで = の検索）、<code>eq_ref</code> は JOIN で相手の1行ごとに主キーなどで1行を読む、
              <code>ref</code> はインデックスで値が一致する行を読む、<code>range</code> はインデックスで範囲を読む、<code>index</code> はインデックス全体を順に読む、<code>ALL</code> は表全体を読む。
            </li>
            <li>
              <code>possible_keys</code>：使える候補のインデックス。<code>key</code>：実際に使うことにしたインデックス。<code>key_len</code>：使ったインデックスの長さ。
            </li>
            <li>
              <code>rows</code>：読む必要があると見積もった行数。<code>filtered</code>：そのうち条件で残る行の割合の見積もり（%）。
            </li>
            <li>
              <code>Extra</code>：<code>Using where</code>（読んだ行を WHERE で絞る）、<code>Using index</code>（インデックスだけで値を取り出す）、<code>Using index condition</code>
              （インデックスの値で先に条件を確かめる）、<code>Using filesort</code>（並べ替えの処理を追加で行う）、<code>Using temporary</code>（結果を一時的な表に入れる）。
            </li>
          </ul>
          <p>
            下の表の最初の2行は、どちらも同じメールアドレスを探す SQL です。インデックスを作る前は MySQL の <code>type</code> が <code>ALL</code> で、表を順に読みます。
            作った後は <code>ref</code> で、<code>key</code> に出た <code>index_users_on_email</code> から一致する行を探します。実際に返る利用者は同じでも、そこに至るまでに調べる行数は変わります。<code>rows</code> は MySQL が読むと見積もった行数です。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SQL の例</th>
                  <th>SQLite の detail</th>
                  <th>MySQL の type・key・Extra</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>email で検索（インデックスなし）</td>
                  <td>
                    <code>SCAN users</code>
                  </td>
                  <td>ALL・NULL・Using where</td>
                </tr>
                <tr>
                  <td>email で検索（インデックスあり）</td>
                  <td>
                    <code>SEARCH users USING INDEX … (email=?)</code>
                  </td>
                  <td>ref・index_users_on_email</td>
                </tr>
                <tr>
                  <td>email で検索（一意インデックス）</td>
                  <td>
                    <code>SEARCH users USING INDEX … (email=?)</code>
                  </td>
                  <td>const・index_users_on_email</td>
                </tr>
                <tr>
                  <td>age と name で検索し、age と name だけを返す</td>
                  <td>
                    <code>SEARCH users USING COVERING INDEX …</code>
                  </td>
                  <td>ref・index_users_on_age_and_name・Using index</td>
                </tr>
                <tr>
                  <td>age の範囲と name で検索</td>
                  <td>
                    <code>SEARCH … (age&gt;? AND age&lt;?)</code>
                  </td>
                  <td>range・index_users_on_age_and_name・Using index condition</td>
                </tr>
                <tr>
                  <td>age の降順で name と age を返す（インデックスなし）</td>
                  <td>
                    <code>SCAN users</code>、<code>USE TEMP B-TREE FOR ORDER BY</code>
                  </td>
                  <td>ALL・NULL・Using filesort</td>
                </tr>
                <tr>
                  <td>同じ SQL（(age, name) あり）</td>
                  <td>
                    <code>SCAN users USING COVERING INDEX …</code>
                  </td>
                  <td>index・index_users_on_age_and_name・Backward index scan; Using index</td>
                </tr>
                <tr>
                  <td>department_id ごとの件数（GROUP BY）</td>
                  <td>
                    <code>SCAN users</code>、<code>USE TEMP B-TREE FOR GROUP BY</code>
                  </td>
                  <td>ALL・NULL・Using temporary</td>
                </tr>
                <tr>
                  <td>users と orders の JOIN</td>
                  <td>
                    <code>SCAN o</code>、<code>SEARCH u USING INTEGER PRIMARY KEY</code>
                  </td>
                  <td>orders が ALL、users が eq_ref・PRIMARY</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            JOIN の行は <code>User.joins(:orders).select("users.name, orders.amount")</code> の結果で、MySQL でも orders を先に読み、user_id で users を主キーから探しました。
          </p>

          <h3>Relation#explain の動き</h3>
          <p>
            <code>explain</code> は ExplainProxy というオブジェクトを返すだけで、この時点では SQL を送りません。<code>inspect</code> が呼ばれると、Relation の SELECT を実際に実行し、その間に送られた SQL
            を集めてから、SQL ごとに EXPLAIN を付けて実行します
            <Ref n={18} />
            <Ref n={19} />。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation.rb（Rails 8.1.4.1、一部を省略）"
            href={`${GH}/lib/active_record/relation.rb#L6-L51`}
            code={`
class ExplainProxy  # :nodoc:
  def initialize(relation, options)
    @relation = relation
    @options  = options
  end

  def inspect
    exec_explain { @relation.send(:exec_queries) }
  end

  # count・first・pluck・sum なども同じ形で定義されている

  private
    def exec_explain(&block)
      @relation.exec_explain(@relation.collecting_queries_for_explain { block.call }, @options)
    end
end
`}
          />
          <p>
            MySQL 用のアダプターは、オプションが無ければ <code>EXPLAIN</code>、あれば <code>EXPLAIN</code> の後にオプションを大文字にしてつなげた文字列を SQL の前に付けます
            <Ref n={20} />。<code>explain(:analyze)</code> は EXPLAIN ANALYZE に、<code>explain("FORMAT=TREE")</code> は EXPLAIN FORMAT=TREE になります。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/connection_adapters/mysql/database_statements.rb（Rails 8.1.4.1）"
            href={`${GH}/lib/active_record/connection_adapters/mysql/database_statements.rb#L27-L46`}
            code={`
def explain(arel, binds = [], options = [])
  sql     = build_explain_clause(options) + " " + to_sql(arel, binds)
  start   = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  result  = internal_exec_query(sql, "EXPLAIN", binds)
  elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - start

  MySQL::ExplainPrettyPrinter.new.pp(result, elapsed)
end

def build_explain_clause(options = [])
  return "EXPLAIN" if options.empty?

  explain_clause = "EXPLAIN #{options.join(" ").upcase}"

  if analyze_without_explain? && explain_clause.include?("ANALYZE")
    explain_clause.sub("EXPLAIN ", "")
  else
    explain_clause
  end
end
`}
          />
          <Figure n="13-4" title="Relation#explain が実行計画を返すまで" caption="Rails 8.1.4.1 の relation.rb・explain.rb・mysql/database_statements.rb をもとにした流れ。">
            <ExplainFlowFigure />
          </Figure>
          <p>
            図 13-4 のとおり、表示のきっかけは <code>inspect</code> です。コンソールは戻り値を inspect で表示するので、explain を呼ぶだけで結果が出ます。一方、<code>bin/rails runner</code>{' '}
            などのスクリプトで <code>puts User.where(age: 20).explain</code> と書くと、<code>#&lt;ActiveRecord::Relation::ExplainProxy:0x…&gt;</code> と表示されるだけでした。スクリプトでは{' '}
            <code>puts User.where(age: 20).explain.inspect</code> と書きます。
          </p>
          <p>
            集めた SQL ごとに EXPLAIN を実行するので、関連を先読みする Relation では SQL ごとの計画が並びます。<code>User.where(email: "alice@example.com").includes(:orders).explain</code> は、users の
            SELECT（ref・index_users_on_email）と、orders の <code>WHERE orders.user_id = 1</code>（ref・index_orders_on_user_id）の2つの計画を返しました。Rails ガイドも、explain は SQL
            を実行してから実行計画を求めると説明しています
            <Ref n={16} />。
          </p>
          <p>
            Rails 7.2 からは explain の戻り値に <code>count</code>・<code>first</code>・<code>pluck</code>・<code>sum</code> なども呼べ、その SQL の計画を返します
            <Ref n={24} />。<code>User.where(age: 20).explain.count</code> は <code>EXPLAIN SELECT COUNT(*) FROM users WHERE users.age = 20</code> を実行し、件数を数えるだけなので Extra が Using
            index になりました。
          </p>

          <h3>注意点</h3>
          <ul>
            <li>
              <code>explain(:analyze)</code> は SQL を実際に実行します。Rails が計画を求める前の SELECT と合わせると、同じ SQL が2回実行されます。本番の DB で重い SQL に使うときは、その負荷を考えます。
            </li>
            <li>
              rows は統計からの見積もりで、実際の行数とずれることがあります。ANALYZE TABLE を実行すると、MySQL がインデックスの値の分布の統計を作り直します
              <Ref n={11} />
              <Ref n={15} />。見積もりと actual の rows の差が大きいときは、統計が古くないかを確かめます。
            </li>
            <li>
              開発環境の DB は行が少なく、値の分布も本番と違うので、計画が本番と同じになるとは限りません。計画の確認と測定は、本番に近い行数と分布のデータで行います。
            </li>
            <li>
              同じ SQL でも SQLite と MySQL で計画が違うことがあります。全行が一致する <code>age &gt;= 18</code> は SQLite で SEARCH、MySQL で ALL、<code>email LIKE 'alice%'</code>{' '}
              は MySQL でだけインデックスを使いました。
            </li>
          </ul>
          <Callout kind="v72">
            <p>
              Relation#explain と ExplainProxy、オプションの渡し方、<code>explain.count</code> などは Rails 7.2.4 でも同じです。explain にオプションを渡す機能は 7.1.0 で加わったので
              <Ref n={26} />、7.0 以前では <code>explain(:analyze)</code> を使えません。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'index-not-used',
      title: 'インデックスが使われない条件を EXPLAIN で確かめる',
      body: (
        <>
          <p>
            インデックスがあっても、条件の書き方によっては使われません。MySQL の users（20,008 行）に index_users_on_email と index_users_on_age_and_name がある状態で、次の Relation の計画を確かめました。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Relation</th>
                  <th>type</th>
                  <th>key</th>
                  <th>rows</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>User.where("LOWER(email) = ?", "alice@example.com")</code>
                  </td>
                  <td>ALL</td>
                  <td>NULL</td>
                  <td>20197</td>
                </tr>
                <tr>
                  <td>
                    <code>User.where("email LIKE ?", "%alice%")</code>
                  </td>
                  <td>ALL</td>
                  <td>NULL</td>
                  <td>20197</td>
                </tr>
                <tr>
                  <td>
                    <code>User.where("email LIKE ?", "alice%")</code>
                  </td>
                  <td>range</td>
                  <td>index_users_on_email</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>
                    <code>User.where("email = 0")</code>
                  </td>
                  <td>ALL</td>
                  <td>NULL</td>
                  <td>20168</td>
                </tr>
                <tr>
                  <td>
                    <code>User.where(email: "alice@example.com").or(User.where(department_id: 1))</code>
                  </td>
                  <td>ALL</td>
                  <td>NULL</td>
                  <td>20168</td>
                </tr>
                <tr>
                  <td>
                    <code>User.where(age: 18..)</code>
                  </td>
                  <td>ALL</td>
                  <td>NULL</td>
                  <td>20197</td>
                </tr>
                <tr>
                  <td>
                    <code>User.where(age: 66..)</code>
                  </td>
                  <td>range</td>
                  <td>index_users_on_age_and_name</td>
                  <td>800</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul>
            <li>
              列に関数をかけると、インデックスは使われません。インデックスが持っているのは email の値で、LOWER(email) の値ではないからです。MySQL 8.4 では式の値をインデックスにできます（関数インデックス）。
              <code>add_index :users, "(lower(email))", name: "index_users_on_lower_email"</code> で作ると、同じ式の条件で <code>ref</code> になりました。インデックスを使うには、WHERE
              に同じ式を書きます
              <Ref n={13} />。
            </li>
            <li>
              検証した表の照合順序（MySQL 8.4 の既定の utf8mb4_0900_ai_ci）は大文字と小文字を区別しないので、<code>User.where(email: "ALICE@example.com")</code> も alice@example.com の行を返し、計画は ref
              でした。大文字と小文字を区別しない比較のために LOWER を使う必要は、MySQL では通常ありません。実行欄の SQLite の = は大文字と小文字を区別し、同じ条件で0行でした。
            </li>
            <li>
              LIKE は、パターンが % や _ で始まらない定数なら、インデックスで範囲を読めます。先頭が % だと、どこから読めばよいか決まらないので、全件の走査になります
              <Ref n={6} />。SQLite の LIKE は既定で大文字と小文字を区別しないので、通常の（区別する）インデックスは <code>LIKE 'alice%'</code> にも使われず、実行欄では SCAN users でした
              <Ref n={3} />。
            </li>
            <li>
              文字列の列を数値と比べると、値の変換が要るので、インデックスを使えないことがあります
              <Ref n={4} />。<code>email = 0</code> は key が NULL でした。Rails の <code>where(email: 0)</code> は値を列の型（文字列）に変換するので、このずれは主に SQL を文字列で書いたときに起きます。
            </li>
            <li>
              OR でつないだ条件の片方の列にインデックスが無いと、表全体を読みます
              <Ref n={6} />。両方の列にインデックスがあると、MySQL は2つのインデックスの結果を合わせる計画（type が index_merge）を選ぶことがあり、<code>email</code> と <code>age</code> の OR
              ではそうなりました。
            </li>
            <li>
              一致する行が表の大部分になる条件では、インデックスがあっても全件の走査が選ばれます。age が 18 以上の行は全行なので ALL、66 以上の行は 800 行なので range でした。ALL のときも possible_keys
              にはインデックスが出ていて、使えるのに使わなかったことがわかります
              <Ref n={6} />
              <Ref n={11} />。
            </li>
          </ul>
          <p>
            どれも、インデックスを足す前に <code>explain</code> で key と rows を確かめれば見つけられます。遅い要求の中から時間のかかる SQL を探す手順は <ChapterLink n={22} section="slow-parts" /> で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'sandbox',
      title: 'SQL Sandbox で JOIN・集計・インデックスの SQL を試す',
      body: (
        <>
          <p>
            最後の実行欄は決まったレッスンを持たない自由入力の欄（SQL Sandbox）で、<ChapterLink n={35} />・<ChapterLink n={36} /> とこの章の SQL を続けて試せます。この章の実行欄は SQL の教材「RailsエンジニアのためのSQL/データベース」の実行欄を本書の章の中に置いたもので、SQL の実行には
            sql.js（ブラウザー上で動く SQLite。この実行欄の SQLite は 3.49.1）を使っています
            <Ref n={25} />。
          </p>
          <SqlLab lesson="sandbox" title="SQL Sandbox" openIndex />
          <h3>使い方</h3>
          <ul>
            <li>
              入力欄に SQL を書き、「実行 · Ctrl + Enter」を押すか、Ctrl + Enter（Mac では ⌘ + Enter）で実行します。; で区切った複数の文は順に実行し、途中の文でエラーになっても、それより前の文は取り消しません。結果は先頭の200行まで表示します。
            </li>
            <li>
              Example の選択欄には全件の SELECT、JOIN（LEFT・INNER・CROSS）、WHERE と HAVING、Subquery（WHERE IN・FROM 内・相関 EXISTS）、この章の Index・Composite Index・EXPLAIN
              のサンプルが入っています。選んで「サンプルSQL挿入」を押すと、入力欄に入ります。
            </li>
            <li>
              「SQLリセット」は入力欄を空にするだけです。「サンプルDB初期化」は departments・users・orders・accounts の4つの表を最初の行に戻し、作ったインデックスや追加した行を消します。この操作は同じページのほかの実行欄にも反映されます。
            </li>
            <li>実行すると、結果の表、SQL の構造、論理的な処理の順、JOIN の対応図、グループのメンバー、Subquery の内側の結果、EXPLAIN、表・Schema・Index の一覧が表示されます。</li>
          </ul>
          <h3>試すとよい SQL</h3>
          <p>
            次の3つは、ここまでの節の内容を確かめる例です。どれも 8 行のサンプル DB に「Generate 10,000 rows」で行を加え、10,008 行にした状態で試しました。
          </p>
          <Code
            lang="sql"
            title="1. JOIN の相手の列にインデックスを作る"
            code={`
CREATE INDEX idx_orders_user_id ON orders(user_id);
-- 続けて Example の「LEFT JOIN」を実行する
`}
          />
          <p>
            LEFT JOIN のサンプル（users を左に、orders を右に置く）の計画は、<code>SCAN u</code> と <code>SEARCH o USING INDEX idx_orders_user_id (user_id=?) LEFT-JOIN</code>{' '}
            になりました。users を1行ずつ読み、その id で orders をインデックスから探します。Rails の <code>t.references :user</code> が orders.user_id に作るインデックスと同じものです。
          </p>
          <Code
            lang="sql"
            title="2. GROUP BY の計画"
            code={`
EXPLAIN QUERY PLAN SELECT department_id, COUNT(*) FROM users GROUP BY department_id;
`}
          />
          <p>
            結果は <code>SCAN users</code> と <code>USE TEMP B-TREE FOR GROUP BY</code> の2行で、department_id ごとにまとめるための一時 B-tree が出ます。<code>CREATE INDEX idx_users_department_id ON
            users(department_id);</code> を実行してから同じ SQL を実行すると、<code>SCAN users USING COVERING INDEX idx_users_department_id</code> の1行になります。インデックスは department_id
            の順に並んでいるので、同じ値の行を順に数えるだけで済みます。
          </p>
          <Code
            lang="sql"
            title="3. ANALYZE で統計を作ると計画が変わる"
            code={`
-- 1文ずつ入力して実行する
CREATE INDEX IF NOT EXISTS idx_users_age_name ON users(age, name);
SELECT * FROM users WHERE name = 'Alice';   -- SCAN users
ANALYZE;                                    -- 統計を作る
`}
          />
          <p>
            SELECT の後で ANALYZE を実行すると、実行計画の欄は監視中の SELECT の計画を取り直し、Before に <code>SCAN users</code>、After に{' '}
            <code>SEARCH users USING INDEX idx_users_age_name (ANY(age) AND name=?)</code> を表示します。CREATE INDEX と SELECT を一度に実行すると、CREATE INDEX IF NOT EXISTS
            の解析に失敗して、実行計画の欄が SELECT に切り替わらないことがあるので、1文ずつ実行します。age の値は51種類で、ほとんどの値に約200行ある、という統計から、SQLite は age の値ごとに name を探す skip-scan を選びました
            <Ref n={3} />。複合インデックスの節で見た MySQL の Skip Scan と同じ考え方です。統計は「サンプルDB初期化」で消えます。
          </p>
          <h3>学習用の範囲と制限</h3>
          <ul>
            <li>
              SQL を実行するのは SQLite です。MySQL とは型、照合順序（文字列の比べ方）、関数、AUTO_INCREMENT、GROUP BY の制約（MySQL の ONLY_FULL_GROUP_BY）、DDL の暗黙の COMMIT
              などが違うので、実行欄の結果が MySQL でも同じになるとは限りません。
            </li>
            <li>
              SQL の構造の解析には MySQL の構文の解析器を使っています。<code>EXPLAIN QUERY PLAN</code> や <code>CREATE INDEX IF NOT EXISTS</code> のように、SQLite では実行できても解析に失敗する SQL
              があります。解析に失敗しても SQL の実行は止めません。
            </li>
            <li>
              論理的な処理の順の表示は解析結果から作った SELECT を段階ごとに実行し直したもので、DB が実際に処理した順の記録ではありません。複数の文を実行したときは、最後の SELECT を、すべての文を実行した後の状態で表示します。段階の表示は基本的な SELECT
              が対象で、CTE・UNION・ウィンドウ関数は最終結果と EXPLAIN だけを表示します。
            </li>
            <li>表示する行には上限があります（結果は200行、段階の表示は40行、JOIN の対応は30行、グループの図は先頭200行から最大20グループ・各6行）。集計そのものは DB が全行で計算します。</li>
            <li>
              sql.js はブラウザーのメインスレッドで動きます。表示の上限は計算量の上限ではないので、大きな CROSS JOIN、重い並べ替え、再帰の SQL などを実行すると、終わるまでブラウザーが操作を受け付けなくなることがあります。中断するボタンはありません。
            </li>
            <li>
              BEGIN・COMMIT・ROLLBACK は SQLite の1つの接続の中で動きます。2つのトランザクションの同時実行は <ChapterLink n={38} /> のシミュレーターで扱います。
            </li>
            <li>データはメモリー上にあり、ページを再読み込みすると、作った表・インデックス・追加した行は消えます。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>インデックスは表とは別に、列の値と行の位置の組を値の順に並べたデータです。並んでいるので二分探索で位置を決められ、全件の走査より読む行を減らせます。</li>
          <li>インデックスでの探索は、インデックスで位置を探す段階と表の行を読む段階に分かれます。一致する行が表の大部分なら、全件の走査のほうが速いことがあります。</li>
          <li>
            Rails では <code>add_index :users, :email</code> でインデックスを作り、名前は index_users_on_email になります。<code>unique: true</code> で一意インデックスになり、<code>t.references</code>{' '}
            は外部キーの列のインデックスも作ります。
          </li>
          <li>インデックスは容量を使い、INSERT・UPDATE・DELETE のたびに更新されます。測定では、2つのインデックスで 200,000 行の INSERT の時間が約1.8倍になりました。</li>
          <li>
            複合インデックスは CREATE INDEX や <code>add_index</code> の配列に書いた列の順で並び、先頭の列から連続した条件で使われます。後ろの列だけの条件では通常使われず、例外として Skip Scan があります。
          </li>
          <li>
            SQLite の SCAN・SEARCH・USING COVERING INDEX・USE TEMP B-TREE は、MySQL の ALL・ref や range・Using index・Using filesort などにおおよそ対応します。計画を選ぶ仕組みは DB ごとに違います。
          </li>
          <li>
            <code>explain</code> は SQL を実行して送った SQL を集め、SQL ごとに EXPLAIN を実行します。<code>explain(:analyze)</code> は EXPLAIN ANALYZE で、見積もりと実際の行数・時間を比べられます。
          </li>
          <li>関数をかけた列、先頭が % の LIKE、型の違う比較、インデックスの無い列との OR では、インデックスが使われないことがあります。key と rows で確かめます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    {
      title: 'EXPLAIN QUERY PLAN',
      publisher: 'SQLite',
      url: 'https://www.sqlite.org/eqp.html',
      accessed: '2026-11-20',
      version: 'SQLite 3.49.1（sql.js 1.13.0 に含まれる版）',
      note: 'SCAN・SEARCH・USING INDEX・USING COVERING INDEX・USE TEMP B-TREE の意味、出力の行の順と JOIN の入れ子、対話的な調査用で形式が版により変わること。実行例は実行欄の sql.js で実測。',
    },
    {
      title: 'Query Planning',
      publisher: 'SQLite',
      url: 'https://www.sqlite.org/queryplanner.html',
      accessed: '2026-11-20',
      version: 'SQLite 3.49.1',
      note: '表が rowid の順に行を持つこと、全件の走査、二分探索で logN、インデックスは列の値と rowid を並べた別の表であること、2回の二分探索、カバリングインデックス、先頭部分が重なるインデックスを持たないこと。',
    },
    {
      title: 'The SQLite Query Optimizer Overview',
      publisher: 'SQLite',
      url: 'https://www.sqlite.org/optoverview.html',
      accessed: '2026-11-20',
      version: 'SQLite 3.49.1',
      note: 'インデックスの先頭の列から間を空けずに使う決まり、不等号の右の列、skip-scan と ANALYZE、LIKE の最適化の条件、カバリングインデックス。',
    },
    {
      title: 'How MySQL Uses Indexes',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/mysql-indexes.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: 'インデックスが無いと先頭の行から表全体を読むこと、主なインデックスが B-tree に格納されること、大部分の行を読むなら順に読むほうが速いこと、型の違う比較。',
    },
    {
      title: 'Multiple-Column Indexes',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/multiple-column-indexes.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: '複合インデックスは16列まで、左端の列（leftmost prefix）の組み合わせでだけ検索に使えること。',
    },
    {
      title: 'Comparison of B-Tree and Hash Indexes',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/index-btree-hash.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: 'LIKE のパターンが % で始まるとインデックスを使わないこと、OR とインデックス、大部分の行を読むと見積もった場合に表を走査すること。',
    },
    {
      title: 'Clustered and Secondary Indexes',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: 'InnoDB の行がクラスタインデックスに格納されること、セカンダリインデックスの項目が主キーの値を持ち、それでクラスタインデックスから行を探すこと。',
    },
    {
      title: 'EXPLAIN Output Format',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/explain-output.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: 'type（const・eq_ref・ref・range・index・ALL）、possible_keys・key・key_len・rows・filtered、Extra の Using where・Using index・Using index condition・Using filesort・Using temporary。実行例は MySQL 8.4.13 で実測。',
    },
    {
      title: 'EXPLAIN Statement',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/explain.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: 'EXPLAIN ANALYZE が SQL を実行し、TREE 形式で各段階の行数・時間を表示すること、使える文の種類。',
    },
    {
      title: 'Range Optimization（Skip Scan Range Access Method）',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/range-optimization.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: 'Skip Scan が選ばれる条件と、Extra の Using index for skip scan。',
    },
    {
      title: 'Avoiding Full Table Scans',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/table-scan-avoidance.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: 'type が ALL になる条件（小さな表、使える条件が無い、定数が表の大部分に当たる）と ANALYZE TABLE。',
    },
    {
      title: 'Optimization and Indexes',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/optimization-indexes.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: '不要なインデックスが領域と時間を使い、INSERT・UPDATE・DELETE の費用を増やすこと。測定は MySQL 8.4.13 で実施。',
    },
    {
      title: 'CREATE INDEX Statement',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/create-index.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: '関数インデックス（functional key parts）と、クエリに同じ式を書く必要があること。',
    },
    {
      title: 'Invisible Indexes',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/invisible-indexes.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: '不可視インデックスは実行計画に使われないが更新は続くこと、削除の影響を確かめる用途。',
    },
    {
      title: 'SHOW INDEX Statement',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/show-index.html',
      accessed: '2026-11-20',
      version: 'MySQL 8.4',
      note: 'Cardinality は異なる値の数の見積もりで、ANALYZE TABLE で更新されること。',
    },
    {
      title: 'Active Record Query Interface（Running explain）',
      publisher: 'Ruby on Rails Guides',
      url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html#running-explain',
      accessed: '2026-11-20',
      version: 'Rails 8.1',
      note: 'explain が SQL を実行してから実行計画を求めること、MySQL での :analyze オプション。',
    },
    {
      title: 'ActiveRecord::ConnectionAdapters::SchemaStatements',
      publisher: 'Ruby on Rails API',
      url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/ConnectionAdapters/SchemaStatements.html',
      accessed: '2026-11-20',
      version: 'Rails 8.1.4.1',
      note: 'add_index の名前の付け方・unique・複数列・if_not_exists、add_reference の index オプションの既定値が true であること。',
    },
    {
      title: 'activerecord/lib/active_record/relation.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/lib/active_record/relation.rb`,
      accessed: '2026-11-20',
      version: 'Rails 8.1.4.1',
      note: 'explain が ExplainProxy を返し、inspect で exec_queries を実行すること（6〜51行、342〜344行）。',
    },
    {
      title: 'activerecord/lib/active_record/explain.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/lib/active_record/explain.rb`,
      accessed: '2026-11-20',
      version: 'Rails 8.1.4.1',
      note: 'collecting_queries_for_explain で送った SQL を集め、exec_explain で SQL ごとに EXPLAIN を実行すること。',
    },
    {
      title: 'activerecord/lib/active_record/connection_adapters/mysql/database_statements.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/lib/active_record/connection_adapters/mysql/database_statements.rb`,
      accessed: '2026-11-20',
      version: 'Rails 8.1.4.1',
      note: 'MySQL 用の explain と build_explain_clause（27〜46行）。',
    },
    {
      title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/lib/active_record/connection_adapters/abstract_mysql_adapter.rb`,
      accessed: '2026-11-20',
      version: 'Rails 8.1.4.1',
      note: 'add_index の if_not_exists を index_exists? で確かめること（489〜495行）、enable_index・disable_index が ALTER INDEX … VISIBLE / INVISIBLE を送ること。',
    },
    {
      title: 'activerecord/lib/active_record/connection_adapters/abstract/schema_statements.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/lib/active_record/connection_adapters/abstract/schema_statements.rb`,
      accessed: '2026-11-20',
      version: 'Rails 8.1.4.1',
      note: 'generate_index_name による index_表_on_列 の名前と、長い場合の idx_on_ とハッシュ値。',
    },
    {
      title: 'activerecord/CHANGELOG.md',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/CHANGELOG.md`,
      accessed: '2026-11-20',
      version: 'Rails 8.1.4.1',
      note: 'Rails 8.1.0 で MySQL 8.0 以降のインデックスの無効化（enabled: false、enable_index・disable_index）が加わったこと。',
    },
    {
      title: 'activerecord/CHANGELOG.md',
      publisher: 'rails/rails（GitHub）',
      url: 'https://github.com/rails/rails/blob/v7.2.4/activerecord/CHANGELOG.md',
      accessed: '2026-11-20',
      version: 'Rails 7.2.4',
      note: 'explain の戻り値が pluck・first・last・average・count・maximum・minimum・sum に応じるようになったこと。7.2.4 の relation.rb に ExplainProxy があることも確認。',
    },
    {
      title: 'sql.js Documentation',
      publisher: 'sql.js',
      url: 'https://sql.js.org/documentation/',
      accessed: '2026-11-20',
      version: 'sql.js 1.13.0',
      note: '実行欄の SQL エンジン（ブラウザー上で動く SQLite）。',
    },
    {
      title: 'activerecord/CHANGELOG.md',
      publisher: 'rails/rails（GitHub）',
      url: 'https://github.com/rails/rails/blob/v7.1.0/activerecord/CHANGELOG.md',
      accessed: '2026-11-20',
      version: 'Rails 7.1.0',
      note: 'Relation#explain がオプション（MySQL では :analyze など）を受け付けるようになったこと（7.1.0.beta1 の項）。',
    },
  ],
}

export default chapter
