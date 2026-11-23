import { ChapterLink, Code } from '../components/content'
import { guide, primarySource, type Explanations } from './shared'

export const explanation11: Explanations = {
  sources: [
    primarySource('SHOW COLUMNS Statement', 'MySQL 8.4 Reference Manual', 'https://dev.mysql.com/doc/refman/8.4/en/show-columns.html', 'MySQL 8.4'),
    primarySource('class Class（new・allocate）', 'Ruby Documentation', 'https://docs.ruby-lang.org/en/4.0/Class.html', 'Ruby 4.0'),
    primarySource('ActiveRecord::Enum', 'Rails API', 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Enum.html', 'Rails 8.1'),
    primarySource('ActiveModel::Dirty', 'Rails API', 'https://api.rubyonrails.org/v8.1/classes/ActiveModel/Dirty.html', 'Rails 8.1'),
  ],
  sections: {
    overview: cite => <>
      <p>
        「テーブルに対応するモデルのクラス」の節で見たとおり、Article のインスタンスは articles テーブルの1行を表し、title などの属性でその行の列の値を返します。
        published の列の型が tinyint(1) であることは全部の記事で同じですが、published の値は記事ごとに違います。
        この2つの情報をクラスとインスタンスのどちらが持つかを、デモで確かめました。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行" code={`Article.columns_hash["published"].sql_type   # => "tinyint(1)"
Article.attribute_types["published"].class   # => ActiveModel::Type::Boolean
a = Article.find(5)
b = Article.find(3)
a.published              # => true
b.published              # => false
a.persisted?             # => true（データベースに保存済み）
Article.new.persisted?   # => false`} />
      <p>
        列の型のように全部の記事で同じ情報は、Article クラスが1つだけ持ちます。published の値や、保存済みかどうかのように記事ごとに違う情報は、それぞれのインスタンスが持ちます。
        columns_hash は列の情報を、attribute_types は属性ごとの型を返すクラスのメソッドです。本文では、クラスとインスタンスが持つ情報を Rails の内部の名前で示します。{cite}
      </p>
    </>,
    schema: cite => <>
      <p>
        テーブルにどんな列があり、それぞれの型が何かという構造を、テーブルのスキーマと呼びます。「articles テーブルの列と型」の節の DESCRIBE が表示したものです。
        Rails はふだん、マイグレーションのファイルや db/schema.rb を読まず、動いているデータベースに問い合わせてスキーマを読みます。MySQL では SHOW FULL FIELDS という SQL を使います。
      </p>
      <Code lang="text" title="mysql コマンドで実行" code={`mysql> SHOW FULL FIELDS FROM articles WHERE Field IN ('id', 'title', 'published');
+-----------+--------------+--------------------+------+-----+---------+----------------+---------------------------------+---------+
| Field     | Type         | Collation          | Null | Key | Default | Extra          | Privileges                      | Comment |
+-----------+--------------+--------------------+------+-----+---------+----------------+---------------------------------+---------+
| id        | bigint       | NULL               | NO   | PRI | NULL    | auto_increment | select,insert,update,references |         |
| title     | varchar(255) | utf8mb4_0900_ai_ci | YES  |     | NULL    |                | select,insert,update,references |         |
| published | tinyint(1)   | NULL               | YES  |     | NULL    |                | select,insert,update,references |         |
+-----------+--------------+--------------------+------+-----+---------+----------------+---------------------------------+---------+
3 rows in set (0.01 sec)`} />
      <p>
        DESCRIBE と同じ項目に加えて、文字列の比べ方（Collation）、使える操作（Privileges）、列の説明（Comment）が返ります。Rails はこの結果から列の名前・型・既定値などを読み取り、読んだスキーマを保存して、次からは問い合わせずに使います。
        一度読んだ結果を保存して使い回すことをキャッシュと呼び、保存したスキーマをスキーマキャッシュと呼びます。{cite}
      </p>
    </>,
    instantiate: cite => <>
      <p>
        Rails が MySQL から受け取る SELECT の結果は、最初は列の名前と値の組です。ActiveRecord の接続の select_all で SQL を送ると、その形のまま受け取れます。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行" code={`rows = ActiveRecord::Base.connection.select_all("SELECT id, title, published FROM articles WHERE id = 3")
rows.class   # => ActiveRecord::Result
rows.to_a    # => [{"id" => 3, "title" => "記事3", "published" => 0}]`} />
      <p>
        published は MySQL の値の 0 のままで、まだ Article のインスタンスでもありません。Article.find(3) などは、この1行の値から Article のインスタンスを作ります。
        このとき、行の値に加えて「データベースから読んだ、保存済みの行である」という状態も設定します（persisted? が true になる）。
        Article.new で作る保存前のインスタンスとは状態が違うので、Rails は new を使わずに別の手順でインスタンスを作ります。
      </p>
      <p>
        Ruby の new はオブジェクトの領域を確保する allocate を呼んでから、そのオブジェクトの initialize を呼んで初期化します。本文の allocate はこのうち領域の確保だけを行うメソッドで、initialize は呼びません。{cite}
      </p>
    </>,
    types: cite => <>
      <p>
        同じ値でも、MySQL と Ruby では表し方が違います。id が 3 と 5 の記事を、mysql コマンドと Rails で読み比べました。
      </p>
      <Code lang="text" title="mysql コマンドと bin/rails runner で実行" code={`mysql> SELECT id, published, status, price, published_at FROM articles WHERE id IN (3, 5);
+----+-----------+--------+--------+----------------------------+
| id | published | status | price  | published_at               |
+----+-----------+--------+--------+----------------------------+
|  3 |         0 |      2 | 160.23 | NULL                       |
|  5 |         1 |      1 | 853.05 | 2026-10-21 07:53:47.260464 |
+----+-----------+--------+--------+----------------------------+
2 rows in set (0.00 sec)

a = Article.find(5)
a.published         # => true
a.price             # => 0.85305e3
a.price.class       # => BigDecimal
a.published_at      # => 2026-10-21 07:53:47.260464000 UTC +00:00
a.published_at.class                        # => ActiveSupport::TimeWithZone
Article.new(views_count: "12").views_count  # => 12`} />
      <p>
        MySQL の 1 は Ruby の true になりました。decimal(10,2) の 853.05 は BigDecimal（小数を誤差なく扱う Ruby のクラス）になり、0.85305e3（0.85305 × 10³）と表示されています。
        datetime(6) の日時は Rails の日時のクラス ActiveSupport::TimeWithZone になりました。フォームから届く値は "12" のような文字列ですが、整数の列の属性に代入すると整数の 12 になります。
      </p>
      <p>
        このように、値の表し方を変えることを型変換（型キャスト）と呼びます。変換の規則は型ごとにあり、Rails は列の型から属性の型を決めます。
        変換の方向は、データベースから読むとき・代入するとき・データベースに保存するときの3つです。{cite}
      </p>
    </>,
    'attribute-api': cite => <>
      <p>
        enum はデータベースには整数を入れ、Ruby では名前で扱うための宣言です。デモの Article には <code>enum :status, {'{'} draft: 0, published: 1, archived: 2 {'}'}</code> があり、status 列の 0・1・2
        を、下書き（draft）・公開（published）・保管（archived）という名前に対応させています。「列の型と型変換」の節の最初の SELECT で見たとおり、id が 5 の記事の status は 1、id が 3 の記事は 2 です。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行" code={`Article.statuses   # => {"draft" => 0, "published" => 1, "archived" => 2}
a = Article.find(5)
b = Article.find(3)
a.status           # => "published"
b.status           # => "archived"
a.published?       # => true
Article.published.to_sql
# => "SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`status\` = 1"`} />
      <p>
        status を読むと名前の文字列が返り、published? のような名前ごとのメソッドや、Article.published のような検索条件も使えるようになります。
        attribute は属性の型を指定する宣言です。列の型と違う型を使うときや、テーブルに無い属性を加えるときに書きます。
        articles テーブルを使う検証用のクラスに、列の無い reading_minutes という整数の属性を加えました（self.table_name はクラスが使うテーブルの名前を指定する設定です）。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行" code={`class Reading11 < ApplicationRecord
  self.table_name = "articles"
  attribute :reading_minutes, :integer, default: 3
end

r = Reading11.find(5)
r.reading_minutes          # => 3
r.reading_minutes = "10"
r.reading_minutes          # => 10
Reading11.column_names.include?("reading_minutes")   # => false`} />
      <p>
        reading_minutes は列が無いので保存されませんが、既定値の 3 が入り、代入した "10" は整数の 10 に変換されました。{cite}
      </p>
    </>,
    dirty: cite => <>
      <p>
        取得した記事の title に新しい値を代入しても、その時点ではデータベースは変わりません。データベースに書き込むのは save を呼んだときです。
        ActiveRecord は読み込んだときの値と今の値の両方を覚えていて、どの属性が変わったかを返せます。データベースは書き換えずに確かめました。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行" code={`a = Article.find(5)
a.changed?            # => false
a.title = "記事5（改）"
a.changed?            # => true
a.title_was           # => "記事5"
a.changes             # => {"title" => ["記事5", "記事5（改）"]}
a.restore_attributes  # 代入した値を取り消す
a.changed?            # => false`} />
      <p>
        title_was は代入する前の値を、changes は変わった属性ごとに「元の値と今の値」を返します。このように変更を記録する仕組みを変更の追跡（Dirty）と呼びます。
        save は変わった列と、Rails が自動で更新する列（updated_at など）だけを UPDATE に入れます。保存した後は、何を保存したかを saved_changes で確かめられます。{cite}
      </p>
    </>,
  },
}

export const explanation12: Explanations = {
  sources: [
    guide('active_record_querying', 'Active Record Query Interface'),
    primarySource('Working with NULL Values', 'MySQL 8.4 Reference Manual', 'https://dev.mysql.com/doc/refman/8.4/en/working-with-null.html', 'MySQL 8.4'),
    primarySource('Pattern Matching', 'MySQL 8.4 Reference Manual', 'https://dev.mysql.com/doc/refman/8.4/en/pattern-matching.html', 'MySQL 8.4'),
    primarySource('How MySQL Uses Indexes', 'MySQL 8.4 Reference Manual', 'https://dev.mysql.com/doc/refman/8.4/en/mysql-indexes.html', 'MySQL 8.4'),
    primarySource('Server Status Variables（Handler_read_*）', 'MySQL 8.4 Reference Manual', 'https://dev.mysql.com/doc/refman/8.4/en/server-status-variables.html', 'MySQL 8.4'),
  ],
  sections: {
    lazy: cite => <>
      <p>
        「where・order・limit をつなげて書く」の節では、<code>Article.where(...)</code> も <code>Article.all</code> も Relation を返しました。
        クラスの where と Relation の where がどこに定義されているかを、method(:where).owner（そのメソッドを定義しているモジュールを返す）で確かめました。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行" code={`Article.method(:where).owner       # => ActiveRecord::Querying
Article.all.method(:where).owner   # => ActiveRecord::QueryMethods
Article.where(author_id: 3).to_sql == Article.all.where(author_id: 3).to_sql   # => true`} />
      <p>
        Article.where の where は ActiveRecord::Querying にあり、Relation の where は ActiveRecord::QueryMethods にあります。Querying の where は受け取った引数を、all が返す Relation の where にそのまま渡すだけです。
        そのため Article.where(author_id: 3) と Article.all.where(author_id: 3) は同じ SQL になります。
        受け取った呼び出しを、別のオブジェクトの同じ名前のメソッドにそのまま渡すことを委譲と呼びます。
      </p>
      <p>
        all は、ふだんは条件の無い Relation（SELECT `articles`.* FROM `articles`）を返します。本文の「その時点のスコープ」は、後の「スコープとクラスメソッドの委譲」の節で扱う scoping の中にいるときに、all がそのときの条件を持った Relation を返すことを指します。{cite}
      </p>
    </>,
    values: cite => <>
      <p>
        「where・order・limit をつなげて書く」の節では、r3 を作った後も r1 の SQL は WHERE だけのままでした。条件を足すたびに新しい Relation ができるので、共通の条件から複数の検索を作れます。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行" code={`base   = Article.where(status: :published)
newest = base.order(published_at: :desc)
oldest = base.order(published_at: :asc)
[base.order_values.size, newest.order_values.size]   # => [0, 1]`} />
      <p>
        order_values は、Relation が覚えている並べ方の一覧です。newest に order を加えても、base には並べ方が加わっていません。
        もし order が base 自身を書き換えるなら、後から作った oldest には、大きい順と小さい順の2つの並べ方が入ってしまいます。
        本文では複製を作る spawn と、複製に条件を書き込む where! を見ます。{cite}
      </p>
    </>,
    arel: cite => <>
      <p>
        SQL の文字列をつなぎ合わせて条件を作ると、括弧の位置、値の囲み方、データベースごとの書き方の違いを、呼び出す側で気にする必要があります。
        Arel は SQL の部品（テーブル、列、比較、AND など）を Ruby のオブジェクトで表すライブラリで、Article.arel_table から使えます。
        title が 'Ruby' で published が真、という条件を Arel で組み立てました。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行" code={`t = Article.arel_table                      # Arel::Table
cond = t[:title].eq("Ruby").and(t[:published].eq(true))
cond.class                     # => Arel::Nodes::And
cond.children.map(&:class)     # => [Arel::Nodes::Equality, Arel::Nodes::Equality]
cond.children[0].left.name     # => "title"
cond.children[0].right.value   # => "Ruby"
Article.where(cond).to_sql
# => "SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`title\` = 'Ruby' AND \`articles\`.\`published\` = TRUE"`} />
      <p>
        eq は「等しい」の比較（Equality）を、and は AND（And）を表すオブジェクトを作ります。And は2つの Equality を子として持ち、1つ目の Equality は左辺に列の title を、右辺に値の "Ruby" を持ちます。
        このように、オブジェクトが子のオブジェクトを持ち、その子がさらに子を持つ形を木構造と呼びます。木の中の1つ1つのオブジェクトを節点（ノード）と呼び、SQL の文を木構造で表したものを構文木と呼びます。
        where に構文木を渡すと、Rails はそれを SQL の文字列にしました。構文木から SQL の文字列を作る処理は、本文の後半で扱います。{cite}
      </p>
    </>,
    load: cite => <>
      <p>
        「where・order・limit をつなげて書く」の節で見たとおり、Relation は each や to_a で中身が必要になったときに SQL を送り、結果を受け取ると loaded? が true になります。
        このとき Rails は Relation の条件から SQL を作る、MySQL に送る、返ってきた行からモデルのインスタンスを作る、の3つを順に行います。
      </p>
      <p>
        行からインスタンスを作る処理は、<ChapterLink n={11} section="instantiate" /> で見た instantiate_instance_of です。
        本文の load・exec_queries・records は、SQL を送ってからインスタンスを作るまでを受け持つメソッドです。{cite}
      </p>
    </>,
    conditions: cite => <>
      <p>
        WHERE の条件には、<code>=</code> のほかに次の書き方があります。デモの articles テーブルで、それぞれの条件に合う行の数を数えました。
      </p>
      <Code lang="text" title="mysql コマンドで実行（-- の後ろは COUNT(*) の結果）" code={`SELECT COUNT(*) FROM articles WHERE id IN (1, 2, 3);                   -- 3
SELECT COUNT(*) FROM articles WHERE views_count BETWEEN 100 AND 200;   -- 974
SELECT COUNT(*) FROM articles WHERE title LIKE '記事1%';               -- 1111
SELECT COUNT(*) FROM articles WHERE published_at IS NULL;              -- 3989
SELECT COUNT(*) FROM articles WHERE published_at = NULL;               -- 0`} />
      <p>
        IN は列の値が並べた値のどれかに一致する行を、BETWEEN 100 AND 200 は100以上200以下の行を選びます。LIKE は文字列の形で選ぶ条件で、% は0文字以上の任意の文字列を表すので、'記事1%' は「記事1」で始まる title に合います。
        OR はどちらかの条件に合う行を選びます。
      </p>
      <p>
        published_at = NULL に合う行が0件なのは、= で NULL と比べた結果が真にも偽にもならないためです。NULL との比較と、where に nil を渡すと IS NULL になることは
        <ChapterLink n={35} section="where-rails" /> で扱いました。{cite}
      </p>
    </>,
    delegation: cite => <>
      <p>
        「where・order・limit をつなげて書く」の節で見た recent のように、scope はよく使う検索条件に名前を付ける宣言です。
        デモの Article では、enum :status が published という名前の検索条件（WHERE status = 1）も作ります。そのため Article.published.recent は「公開済みの記事を新しい順に」並べる Relation になり、各呼び出しが Relation を返すので、さらに where や limit を続けられます。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行" code={`Article.published.recent.limit(5).to_sql
# => "SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`status\` = 1
#     ORDER BY \`articles\`.\`published_at\` DESC LIMIT 5"`} />
      <p>
        recent は Article クラスに定義されたメソッドですが、ここでの呼び出し先は published が返した Relation です。
        Relation から Article.recent をそのまま呼び直すと、published の条件が失われます。Rails はクラスのメソッドを実行している間だけ、呼び出し元の Relation の条件を引き継がせる仕組み（scoping）を使って、条件を保ちます。{cite}
      </p>
    </>,
    'query-cache': cite => <>
      <p>
        キャッシュは一度取り出した結果を保存しておき、同じものがもう一度必要になったときに、保存した結果を返す仕組みです。データベースに問い合わせる回数が減るぶん、早く応答できます。
        その代わり、保存した後にデータベースの値が変わると、保存した結果は古くなります。
      </p>
      <p>
        Rails のクエリキャッシュは結果を保存しておく期間を1件のリクエストの処理の間に限っています。
        Rails はリクエストを処理する前と後に決まった処理を実行し、この仕組みを Executor と呼びます（<ChapterLink n={8} section="executor" />）。
        処理の前に呼ばれる run でクエリキャッシュを有効にし、処理の後に呼ばれる complete で保存した結果を捨てます。
        たとえばビューの2か所で同じ Article.find(1) を呼ぶと、2回目は SQL を送らずに保存した結果を使います。
        本文の接続プールはデータベースとの接続をためておき、使い回す仕組みです（<ChapterLink n={15} section="pool" />）。{cite}
      </p>
    </>,
    explain: cite => <>
      <p>
        索引の無い列で探すと、MySQL は表の先頭の行から最後の行まで読み、1行ずつ条件を確かめます（全件走査）。索引があれば、条件の値の位置から読み始め、条件に合う範囲だけを読めます。
        索引の並び方と全件走査との違いは <ChapterLink n={37} section="what-is-index" /> で扱いました。
      </p>
      <p>
        デモの articles テーブルには author_id の索引があり、title には索引がありません。MySQL が行を読んだ回数を数える状態変数（Handler_read_ で始まる値）を FLUSH STATUS で0に戻してから、それぞれの列で検索しました。
      </p>
      <Code lang="text" title="mysql コマンドで実行（FLUSH STATUS の行を省略。SELECT の結果は -- の後ろに書き、SHOW SESSION STATUS は2つの値だけを表示）" code={`mysql> SELECT COUNT(*) FROM articles WHERE author_id = 3;     -- 482
mysql> SHOW SESSION STATUS LIKE 'Handler_read%';
| Handler_read_next     | 482   |
| Handler_read_rnd_next | 0     |

mysql> SELECT COUNT(*) FROM articles WHERE title = '記事5';   -- 1
mysql> SHOW SESSION STATUS LIKE 'Handler_read%';
| Handler_read_next     | 0     |
| Handler_read_rnd_next | 10005 |`} />
      <p>
        Handler_read_next は索引の順に次の行を読んだ回数、Handler_read_rnd_next はテーブルの行を順に読んだ回数です。
        author_id の検索では索引で author_id = 3 の位置を見つけ、条件に合う482行だけを読みました。title の検索では、合う行は1件なのに、テーブルの行を約1万回読んでいます。
      </p>
      <p>
        索引はマイグレーションで作ります。デモの2つの索引は <ChapterLink n={11} section="migration" /> で見た add_reference（author_id の列と一緒に索引も作る）と add_index で作りました。
        ただし、索引があっても MySQL がそれを使うとは限りません。MySQL は SQL を受け取ると、どの索引を使い、どの順に読むかを決めてから実行します。この手順を実行計画と呼び、SQL の前に EXPLAIN を付けると、MySQL は結果の行の代わりに実行計画を返します。{cite}
      </p>
    </>,
  },
}

export const explanation13: Explanations = {
  sources: [guide('association_basics', 'Active Record Associations'), guide('active_record_querying', 'Active Record Query Interface — Eager Loading'), guide('active_record_migrations', 'Active Record Migrations')],
  sections: {
    basics: cite => <>
      <p>
        「外部キーでテーブルをつなぐ」の節で見た外部キー制約と索引は、Rails のマイグレーションで作ったものです。
        マイグレーションを実行すると、Rails はその時点のテーブルの構造を db/schema.rb に書き出します。
        下の schema.rb の抜粋では、<code>create_table</code> がテーブルと列を、<code>t.index</code> が索引を、<code>add_foreign_key</code> が外部キー制約を表します。
        モデルに書く <code>has_many</code> や <code>belongs_to</code> は、すでにある列を Ruby から使うための宣言で、列や制約は作りません。
      </p>
      <p>
        この節の実行例のログには、INSERT や DELETE の前後に BEGIN・COMMIT・ROLLBACK が出てきます。
        これらは複数の変更をまとめて確定する（COMMIT）か、まとめて取り消す（ROLLBACK）ための SQL で、Rails は保存や削除の SQL を送るときに一緒に送ります（<ChapterLink n={38} section="transaction" />）。
        また、<code>valid?</code> と <code>errors</code> は保存する前に値を確かめるバリデーションの機能です（<ChapterLink n={14} section="validation-basics" />）。{cite}
      </p>
    </>,
    objects: cite => <>
      <p>
        <code>article.comments</code>を呼ぶには、相手のモデル名や外部キーの列名を特定する必要があります。
        その情報は記事ごとに同じです。一方、この記事のコメントをすでに取得したか、取得した結果は何かという状態は記事ごとに異なります。
        関連の定義と、個々の関連の読み込み状態を別々のオブジェクトで扱います。
      </p>
      <p>
        リフレクションは関連の定義を表す情報、Associationはある記事に対する関連の状態や取得処理を扱うオブジェクトです。
        has_manyの宣言が前者を登録し、生成したcommentsメソッドが後者を通じて結果を返します。
        こうして、宣言した1行から、必要なときに相手を取得する処理へつながります。{cite}
      </p>
    </>,
    'n-plus-one': cite => <>
      <p>
        一覧に記事と著者名を表示する場合、記事の行だけでは著者名は分かりません。
        記事のauthor_idを使い、authorsテーブルから名前を取得する必要があります。
        先読みやキャッシュがなく、記事ごとに異なる著者を取得するなら、3件の記事で次のような問い合わせが起きます。
      </p>
      <Code lang="text" title="記事3件の著者を別々に取得する場合" code={`1回目: 一覧の記事3件を取得
2回目: 1件目の記事の著者を取得
3回目: 2件目の記事の著者を取得
4回目: 3件目の記事の著者を取得`} />
      <p>
        最初の1回に、記事の件数Nに応じた問い合わせが加わるため、N+1問題と呼びます。
        1件ずつ表示するRubyのループが短くても、SQLの回数はデータ件数に合わせて増えます。
        一覧に必要な関連をまとめて取得する先読みを使えば、この増え方を変えられます。
      </p>
      <p>
        SQL を1回実行するたびに、アプリケーションは MySQL に SQL を送り、結果が返るまで待ちます。このやり取りを往復と呼びます。
        1回の往復は短くても、記事が100件なら、著者を読む往復も100回です。
        開発環境では、実行した SQL がログに1行ずつ出ます。下の実行例の <code>[Author Load]</code> は、Author のレコードを読み込んだ SQL という意味です。{cite}
      </p>
    </>,
    preload: cite => <>
      <p>
        記事を先に取得すると、必要なauthor_idの一覧が分かります。
        そのIDに一致する著者を1回のSELECTで取得し、IDで対応付けて各記事の関連へ設定すれば、著者ごとの問い合わせを避けられます。
        SQLの<code>IN (...)</code>は指定した複数の値のどれかに一致する条件です。
      </p>
      <p>
        preloadはこの別々の問い合わせでまとめる方法です。記事と著者の取得が別のSQLなので、各テーブルの行をそれぞれのモデルとして読み込めます。
        関連を取得するだけでなく、どの記事の関連へどの著者を設定するかという対応付けも、先読みの処理に含まれます。{cite}
      </p>
    </>,
    'eager-load': cite => <>
      <p>
        <ChapterLink n={36} section="join" /> で見たとおり、JOIN は ON の条件に合う行どうしをつないだ結果を1回の SELECT で返します。
        LEFT OUTER JOIN は相手の無い行も残し、相手の列を NULL にします。
        eager_load はこの LEFT OUTER JOIN を使って記事の列と著者の列を同じ結果の行で受け取るので、著者のいない記事も、著者の列が NULL の行として残ります。
      </p>
      <p>
        1対多をJOINすると、1つの記事がコメントの数だけ結果に現れることがあります。
        Railsは返った行をそのまま1行1記事として扱わず、主キーなどで重複をまとめ、記事と関連のオブジェクトへ組み立てます。
        SQLが1回であることと、転送する行数やRubyでの組み立てが少ないことは同じではありません。{cite}
      </p>
    </>,
    joins: cite => <>
      <p>
        著者の条件で記事を絞るためにJOINする場合、表示するのは記事の列だけでよいことがあります。
        一方、後でarticle.author.nameを表示するなら、著者のオブジェクトも用意したいところです。
        絞り込みに相手のテーブルを使うことと、関連として利用できる状態へ読み込むことは別の目的です。
      </p>
      <p>
        joinsは主に前者を行い、関連の読み込み済み状態を用意するとは限りません。
        includesは必要な問い合わせの形を判定し、先読みの処理まで行います。
        JOINしたという理由だけでN+1がなくなったと考えず、後の関連参照でSQLが追加されるかを確かめます。{cite}
      </p>
    </>,
  },
}

export const explanation14: Explanations = {
  sources: [guide('active_record_validations', 'Active Record Validations'), guide('active_record_callbacks', 'Active Record Callbacks')],
  sections: {
    'call-chain': cite => <>
      <p>
        「保存する前に値を検証する」と「保存の前後に処理を足すコールバック」の節で見たとおり、save を1回呼ぶと、検証、コールバック、SQL の送信が決まった順に実行されます。
        INSERT の前後の BEGIN と COMMIT は、保存の変更をまとめて確定するトランザクションの SQL で、途中で失敗すれば ROLLBACK で取り消します（<ChapterLink n={38} section="transaction" />）。
      </p>
      <p>
        Rails はこれらを1つの大きな save に書かず、機能ごとのモジュールに同じ名前の save を定義し、super でつないでいます。
        super は ancestors（メソッドを探す順に並べたクラスとモジュールの一覧）で次にある、同じ名前のメソッドを呼びます（<ChapterLink n={3} section="super" />）。小さな例で確かめます。
      </p>
      <Code lang="ruby" title="super_chain.rb と実行結果（Ruby 4.0.9）" code={`class Base
  def save
    puts "  SQL を送る"
    true
  end
end

module Validations
  def save
    puts "  検証する"
    super
  end
end

module Transactions
  def save
    puts "  BEGIN"
    result = super
    puts "  COMMIT"
    result
  end
end

class Record < Base
  include Validations
  include Transactions
end

p Record.ancestors.take(4)  # => [Record, Transactions, Validations, Base]
p Record.new.save
#   BEGIN
#   検証する
#   SQL を送る
#   COMMIT
# => true`} />
      <p>
        後から include した Transactions が ancestors の前のほうにあるので、先に呼ばれます。
        Transactions の save が BEGIN を出して super を呼ぶと Validations の save が呼ばれ、そこからさらに super で Base の save が呼ばれます。Base から戻った後に COMMIT が出ました。
        ActiveRecord の save も、同じ形でモジュールを順にたどります。{cite}
      </p>
    </>,
    'callback-order': cite => <>
      <p>
        「保存の前後に処理を足すコールバック」の節で見た before_ と after_ のほかに、around_ で始まるコールバックがあります。
        around のコールバックは対象の処理を自分の中から呼ぶメソッドです。次の例では、yield の行で保存の処理が実行されるので、前と後の両方を1つのメソッドで扱えます。
        yield を呼ばなければ、その先の処理には進みません。
      </p>
      <Code lang="ruby" title="around_save の書き方" code={`around_save :log_around

def log_around
  puts "around_save（前）"
  yield            # ここで保存の処理が進む
  puts "around_save（後）"
end`} />
      <p>
        保存には検証する段階、新規作成か更新かに応じてSQLを実行する段階、トランザクションを確定する段階があります。
        after_saveは保存処理の後、after_commitはDBでの確定後です。
        同じ「後」でも基準になる出来事が違うため、ログの順をこの段階に対応付けると、どの処理がまだ取り消され得るかを判断できます。{cite}
      </p>
    </>,
    validations: cite => <>
      <p>
        「保存する前に値を検証する」の節で見たとおり、<code>validates</code> は検証の規則を登録する宣言で、規則は valid? や save のときに確かめられます。
        規則を書いた時点でレコードを調べるわけではありません。
        この節では検証の中で SQL を実行する規則と、型変換の前の値を調べる規則を見ます。
      </p>
      <p>
        belongs_to の存在の検証は、外部キーが指す相手の行が本当にあるかを、相手のテーブルを SELECT して確かめます（<ChapterLink n={13} section="basics" />）。
        型変換はフォームから文字列で届いた値を、列の型に合わせて整数や日時に変えることです（<ChapterLink n={11} section="types" />）。{cite}
      </p>
    </>,
    uniqueness: cite => <>
      <p>
        「同じメールアドレスがないかを調べる」と「同じメールアドレスを保存させない」は、同時に処理が進む場合には別の条件になります。
        AとBがほぼ同時に存在確認を行い、どちらも「まだない」と判断した後、それぞれ保存することがあり得るためです。
        順番に1件ずつ試したときに成功しても、この競合は検出できません。
      </p>
      <p>
        索引は、列の値から行をすばやく探すために DB が作るデータです（<ChapterLink n={37} section="what-is-index" />）。
        索引を作るときに一意（unique）を指定すると、DB は同じ値を持つ2行目の INSERT や UPDATE を拒否します。これを一意の索引と呼びます。
        デモの authors テーブルの email 列に付いている index_authors_on_email が、一意の索引の例です。
      </p>
      <p>
        モデルの一意性の検証は利用者へ検証エラーを返すために使えます。
        同じ値の保存を確実に防ぐのは、DB 側の一意の索引です。
        検証と保存の間にも別の処理が入れることが、アプリ側の確認だけでは一意性を保証できない理由です。{cite}
      </p>
    </>,
    'after-commit': cite => <>
      <p>
        DBの変更はロールバックできますが、外部へ送ったメールをDBの操作で取り消すことはできません。
        たとえば保存直後にメールを送り、その後に同じトランザクション内で失敗すると、DBには保存が残らず、メールだけ送信済みという状態になります。
        保存後の外部処理を考えるときは、SQLの実行と変更の確定を区別します。
      </p>
      <p>
        after_commitは、DBの変更が確定した後に処理を実行する時点です。
        ただし、そこで行う外部処理自体の成功までDBが保証するわけではありません。
        保存の確定を前提にできることと、外部処理の失敗をどう記録・再試行するかは、別に設計する必要があります。{cite}
      </p>
    </>,
  },
}

export const explanation15: Explanations = {
  sources: [primarySource('Active Record Transactions', 'Ruby on Rails API', 'https://api.rubyonrails.org/v8.0/classes/ActiveRecord/Transactions/ClassMethods.html', 'Rails 8.0'), primarySource('Active Record Connection Pool', 'Ruby on Rails API', 'https://api.rubyonrails.org/v8.0/classes/ActiveRecord/ConnectionAdapters/ConnectionPool.html', 'Rails 8.0'), guide('active_record_querying', 'Active Record Query Interface — Locking'), primarySource('SET TRANSACTION Statement', 'MySQL 8.4 Reference Manual', 'https://dev.mysql.com/doc/refman/8.4/en/set-transaction.html', 'MySQL 8.4'), primarySource('EXPLAIN Output Format', 'MySQL 8.4 Reference Manual', 'https://dev.mysql.com/doc/refman/8.4/en/explain-output.html', 'MySQL 8.4')],
  sections: {
    transaction: cite => <>
      <p>
        <ChapterLink n={38} section="transaction" /> では、Account.transaction のブロックで BEGIN から COMMIT までの範囲を決め、ブロックの中で例外が起きると ROLLBACK が送られることを確かめました。この節では、そのブロックの中で Rails が何をしているかを見ます。
        ActiveRecord::Base.transaction は、そのスレッドが使っている接続（「データベースとの接続」の節）に、トランザクションを始めさせます。
      </p>
      <p>
        下のコードに出てくるスタックは、最後に積んだものから順に取り出すデータの並べ方です。
        <code>requires_new: true</code> を付けて transaction を入れ子にすると、内側のトランザクションが外側の上に積まれ、内側のブロックが終わると上から取り除かれます。
        ActiveRecord::Rollback は Rails が用意した例外で、ブロックの中で投げるとトランザクションを取り消しますが、ほかの例外と違ってブロックの外へは伝わりません。{cite}
      </p>
    </>,
    nested: cite => <>
      <p>
        保存処理を複数のメソッドへ分けると、呼び出した先でもtransactionを使っている場合があります。
        コード上でブロックが入れ子でも、DBで独立したトランザクションを同じように入れ子にできるとは限りません。
        Railsでは、通常は外側ですでに開始したトランザクションへ参加します。
      </p>
      <p>
        SAVEPOINTはトランザクションの途中に取り消し用の位置を設けるDBの機能です。
        <code>requires_new: true</code>を使う場合、対応するDBではこの機能で内側の範囲を分けます。
        外側へ参加しただけなのか、取り消し位置を新しく設けたのかが、内側で失敗した後に残る変更を左右します。{cite}
      </p>
    </>,
    isolation: cite => <>
      <p>
        COMMIT する前の変更は、ほかの接続からは見えません（<ChapterLink n={38} section="transaction" />）。
        ほかの接続が COMMIT した変更が、自分のトランザクションの途中でいつから見えるかを決めるのが分離レベルです。
        MySQL では READ UNCOMMITTED・READ COMMITTED・REPEATABLE READ・SERIALIZABLE の4つから選べ、既定は REPEATABLE READ です。
      </p>
      <p>
        分離レベルによって、通常の SELECT がいつの時点のスナップショット（ある時点で確定していたデータの状態）を読むかが変わります。
        分離レベルごとに読める値の違いと、スナップショットの仕組みは、<ChapterLink n={38} section="isolation" /> と同じ章の「<ChapterLink n={38} section="mvcc">MVCC：行のバージョンとスナップショット</ChapterLink>」の節で確かめました。この節では、Rails で分離レベルを指定したときの動作を見ます。{cite}
      </p>
    </>,
    optimistic: cite => <>
      <p>
        <ChapterLink n={38} section="concurrent-updates" /> では、2つのスレッドが同じ残高を読み、後から書いた値が先に書いた値を上書きしました。
        楽観的ロックはこの上書きを保存のときに見つける方法です。
        行にバージョン番号（更新のたびに増える番号）を持たせ、読んだ時点の番号と DB の番号が同じときだけ UPDATE すれば、読んだ後でほかの更新があったことが分かります。
      </p>
      <p>
        ActiveRecord の lock_version は、このバージョン番号の列で、UPDATE のたびに1増えます。
        編集を禁止するのではなく、更新が重なったときに例外で知らせるので、読み直しや入力のやり直しをどうするかはアプリケーションの側で決めます。{cite}
      </p>
    </>,
    pessimistic: cite => <>
      <p>
        <ChapterLink n={38} section="lock" /> で見たとおり、UPDATE は変更する行にロックを掛け、同じ行を変更するほかのトランザクションを COMMIT まで待たせます。
        悲観的ロックはこのロックを、UPDATE より前の読む時点で掛ける方法です。
        <code>SELECT ... FOR UPDATE</code> は、読んだ行に UPDATE と同じ種類のロックを掛ける SELECT です。
      </p>
      <p>
        在庫を読み、残数を確かめてから減らす処理なら、読む時点でロックを掛けておけば、確かめてから減らすまでの間にほかのトランザクションが同じ行を変えられません。
        ロックは COMMIT か ROLLBACK まで持ち続けるので、その間に外部のサービスの応答などを長く待つと、ほかの処理の待ち時間も延びます。
        楽観的ロックが保存のときに重なりを見つけるのに対し、悲観的ロックは重なる操作を待たせて順番に進めます。{cite}
      </p>
    </>,
    'lock-index': cite => <>
      <p>
        索引は、列の値から行をすばやく探すために DB が作るデータです（<ChapterLink n={37} section="what-is-index" />）。
        articles の author_id には索引があり、title にはありません。
        EXPLAIN（SQL をどう実行する予定かを MySQL に表示させる命令。<ChapterLink n={37} section="explain-rails" />）で、2つの条件を比べました。
      </p>
      <Code lang="text" title="EXPLAIN の結果から type・key・rows の列を抜き出したもの（MySQL 8.4.13）" code={`EXPLAIN SELECT * FROM articles WHERE title = '記事100';
  type: ALL   key: NULL                          rows: 9838
EXPLAIN SELECT * FROM articles WHERE author_id = 13;
  type: ref   key: index_articles_on_author_id   rows: 475`} />
      <p>
        type が ALL は、表のすべての行を順に読む（全件走査）という意味で、rows は読む予定の行の数の見積もりです。
        title で探すと表の約1万行を読み、author_id で探すと索引を使って 475 行だけを読みます。
        FOR UPDATE や UPDATE のロックは、このとき読んだ行に掛かります。BEGIN の後で FOR UPDATE を実行し、主キーの側でロックが掛かった行を data_locks（MySQL がロックの状態を表示する表。<ChapterLink n={38} section="lock" />）で数えました。
      </p>
      <Code lang="text" title="lockcount.rb の実行結果（数えた後は ROLLBACK）" code={`WHERE title = '記事100' FOR UPDATE: 一致した行 1 件、主キーで数えたロックした行 10004 行
WHERE author_id = 13 FOR UPDATE: 一致した行 475 件、主キーで数えたロックした行 475 行`} />
      <p>
        一致したのは1件でも、title で探すと表の 10,004 行すべてにロックが掛かりました。author_id で探すと、ロックが掛かったのは一致した 475 行でした。
        索引 index_articles_on_author_id の側にも、読んだ範囲にロックが掛かります。{cite}
      </p>
    </>,
    pool: cite => <>
      <p>
        「データベースとの接続」の節で見たとおり、接続を作るには SQL を1つ送るより長い時間がかかります。
        SQL のたびに接続を作って閉じる代わりに、作った接続を残しておき、スレッドに貸し出して使い回すのが接続プールです。
        SQL の条件や結果を保存する Relation やキャッシュとは異なり、通信に使う接続そのものを管理します。
      </p>
      <p>
        プロセス内で複数の要求を進めるスレッド（<ChapterLink n={23} section="thread" />）があっても、貸し出せる接続数には上限があります。
        空きがなければ、そのスレッドは接続を借りられるまで待ちます。
        DBへSQLを送った後の応答待ちや、行のロック待ちとは別の待ち時間です。スレッド数だけを増やしても、この上限は自動では増えません。{cite}
      </p>
    </>,
  },
}
