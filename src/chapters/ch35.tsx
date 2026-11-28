import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { ArFlowFigure, ClauseOrderFigure, DeleteParentFigure, SampleDbFigure, TwoChecksFigure, TwoPathsFigure, UsersTableFigure } from '../visuals/ch35-figures'
import { SqlLab } from '../components/SqlLab'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const RUN = 'Rails で実行'

const ch35: Chapter = {
  number: 35,
  part: 3,
  title: 'SQL で表を読み書きする',
  summary:
    '利用者一覧を例に、表から人を探す、1人追加する、その人の情報を更新する操作をブラウザーで試します。同じ操作を Rails で書いたときに、データベースへ送られる SQL と見比べます。',
  goals: [
    '利用者1人を表す行を主キーで特定し、必要な列を選べる',
    '条件に合う行や値のない行を探し、並べ替えた結果を実行欄で確かめられる',
    '追加・更新・削除の対象を SQL と Rails の両方で表し、変更前に件数を確かめられる',
    '保存できない入力を、Rails が検証する場合と DB の制約で拒む場合に分けて説明できる',
  ],
  prerequisites: [1],
  sections: [
    {
      id: 'database',
      title: 'データベースとテーブル',
      body: (
        <>
          <p>
            Web アプリケーションは利用者や注文のようなデータを保存しておき、必要になったときに取り出して画面に表示します。データを保存し、条件に合うデータを探して返すソフトウェアを
            <Term en="database">データベース</Term>（正確にはデータベース管理システム）と呼びます。本書のデモでは MySQL 8.4 を使い、この章の実行欄ではブラウザーの中で動く SQLite
            というデータベースを使います。
          </p>
          <p>
            MySQL と SQLite は、データを行と列からなる<Term en="table">テーブル</Term>として扱うリレーショナルデータベースです。利用者の行に部署の ID を保存すると、部署の名前を利用者ごとに持たなくても、別のテーブルから取得できます。この章のサンプル DB には、利用者の users、部署の
            departments、注文の orders、口座の accounts の4つのテーブルがあります。users テーブルの中身を図 17-1 に示します。
          </p>
          <Figure n="17-1" title="users テーブルの行・列・主キー" caption="サンプル DB の users テーブル（8行）のうち4行を描いた図。">
            <UsersTableFigure />
          </Figure>
          <p>
            表の横の並びを<Term en="row">行</Term>と呼び、1行が1人の利用者を表します。行はレコードとも呼びます。縦の並びを<Term en="column">列</Term>
            と呼び、name（名前）、email（メールアドレス）、age（年齢）、department_id（所属する部署の番号）が利用者の項目です。列ごとに入れる値の種類（<Term en="data type">型</Term>
            ）が決まっていて、age には整数を、name には文字列を入れます。
          </p>
          <p>
            id は行を1つに特定するための番号で、この列を<Term en="primary key">主キー</Term>と呼びます。主キーの列には2つの行に同じ値を入れることも、値を入れずにおくこともできません。そのため「id が 3
            の利用者」と書けば、Carol の行だけを指せます。
          </p>
          <p>
            Hana の department_id は NULL です。<Term>NULL</Term> は値が無いこと（値が分からないこと）を表す特別な値で、数値の 0 とも空の文字列とも違い、ここでは Hana
            がどの部署にも所属していないことを表しています。NULL を入れてよいかは列ごとに決め、users の name・email・age は NULL を入れられない列（NOT NULL の列）です。
          </p>
          <p>
            department_id の値は departments テーブルの id を指しています。Alice の department_id は 1 なので、Alice は departments の id が 1 の行（Engineering）に所属しています。このように、別のテーブルの主キーの値を入れて行を指す列を
            <Term en="foreign key">外部キー</Term>と呼びます。外部キーで2つのテーブルを組み合わせて読む方法は<ChapterLink n={36} />で、MySQL の列の型は
            <ChapterLink n={11} section="table" />で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'sql',
      title: 'SQL の文の書き方',
      body: (
        <>
          <p>
            データベースへの命令は <Term>SQL</Term> という言語で書きます。SQL の1つの命令を文と呼びます。テーブルの行を読み書きする基本の文は、行を取り出す SELECT、行を追加する INSERT、行の値を書き換える
            UPDATE、行を削除する DELETE の4つです。20歳以上の利用者の名前と年齢を取り出す SELECT の文は次のように書きます。
          </p>
          <Code lang="sql" code={`SELECT name, age FROM users WHERE age >= 20;`} />
          <p>
            SELECT・FROM・WHERE は SQL で意味の決まった語（キーワード）で、その後ろに列の名前、テーブルの名前、条件を書きます。キーワードとその後ろに書いた内容をまとめて
            <Term en="clause">句</Term>と呼びます。この文は SELECT 句（<code>SELECT name, age</code>）、FROM 句（<code>FROM users</code>）、WHERE 句（<code>WHERE age &gt;= 20</code>
            ）の3つの句でできていて、「users テーブルから、age が 20 以上の行の name と age を取り出す」という意味です。キーワードは小文字で書いても同じ意味になりますが、この本では列やテーブルの名前と見分けやすいように大文字で書きます。文字列の値は <code>'Alice'</code>{' '}
            のように <code>'</code> で囲み、数値はそのまま書きます。文の終わりには <code>;</code> を付け、途中で改行しても <code>;</code> までが1つの文です。
          </p>
          <p>
            データベースは SELECT の結果を列と行からなる表の形で返し、INSERT・UPDATE・DELETE には変更した行の数を返します。Rails のアプリケーションも、Active Record（Rails
            のうちデータベースを扱う部分）が Ruby のメソッド呼び出しから組み立てた、この形の SQL を MySQL に送っています。この章では SQL を実行欄で試してから、同じ操作を Active Record
            でどう書くかを確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'lab',
      title: 'この章の実行欄の使い方',
      body: (
        <>
          <p>
            SELECT・WHERE・INSERT・UPDATE・DELETE の節には、SQL を書いて実行できる欄（実行欄）を置いています。実行欄は教材「RailsエンジニアのためのSQL/データベース」の実行画面をレッスンごとに置いたものです。SQL
            はサーバーに送らず、sql.js（SQLite をブラウザーで動くようにしたライブラリ。1.13.0、SQLite 3.49.1）がブラウザーのメモリーの中のデータベースで実行します
            <Ref n={1} />。
          </p>
          <ul>
            <li>
              実行欄を表示した時点で、Example の先頭の例の SQL が入力欄に入っています。ほかの例は、Example で選んで「サンプルSQL挿入」を押すと入力欄に入ります。入力欄は自由に書き換えられます。
            </li>
            <li>
              「実行」か Ctrl + Enter（Mac では ⌘ + Enter）で実行します。<code>;</code> で区切った複数の文は上から順に実行し、文ごとに「結果 1」「結果 2」…を表示します。SELECT
              は先頭200行までの表を、INSERT・UPDATE・DELETE は変更行数を表示します。
            </li>
            <li>途中の文がエラーになると、エラーの内容を表示して止まります。エラーより前の文の変更は取り消されません。</li>
            <li>「SQLリセット」は入力欄を空にします。「サンプルDB初期化」はデータベースを初期状態に戻し、入力欄の SQL は残します。</li>
          </ul>
          <p>
            結果の下の「SQLの構造と内部処理」の「記述順」は、入力した SQL を node-sql-parser（5.3.8）で MySQL の文法として解析し、SELECT・FROM・WHERE などの句に分けて表示したものです
            <Ref n={2} />。「論理的な処理順」のボタン（FROM → WHERE → SELECT …）を押すと、その段階までを当てはめた行を40行まで表示します。この表示は SELECT を段階ごとの SQL
            に作り直して実行したもので、データベースが実際に行った処理の記録ではありません。複数の文を実行したときは、すべての文を実行した後のデータベースで、最後の SELECT を分解します。
          </p>
          <p>
            「Index と実行計画・Table / Schema の一覧」を開くと、テーブルごとの列の定義（Schema）と先頭30行（Data）を確かめられます。Schema の notnull が 1 の列は NOT NULL、pk が 1
            の列は主キーです。同じ欄には実行計画（データベースが SQL を処理する手順。EXPLAIN という文で表示する）と索引（値から行を早く探すための仕組み）も表示されます。この2つは
            <ChapterLink n={37} />で扱います。
          </p>
          <p>
            このページの実行欄はすべて同じ1つのデータベースを使うので、INSERT の節で追加した行は後の節の実行欄でも見えます。結果が本文と違うときは「サンプルDB初期化」を押してください。初期化はほかの実行欄にも反映され、ページを再読み込みしても初期状態に戻ります。とても大きな結果を作る
            SQL を実行すると、終わるまで画面を操作できなくなることがあります。
          </p>
          <h3>サンプル DB</h3>
          <p>
            サンプル DB のテーブルと列は図 17-2 のとおりです。図は中央の users から見てください。破線の矢印は外部キーで、users の department_id が departments の id を、orders と accounts の
            user_id が users の id を指しています。
          </p>
          <p>
            データベースは列やテーブルに付けた決まりに合わない行の追加や書き換えを拒否します。この決まりを<Term en="constraint">制約</Term>と呼び、サンプル DB には次の4種類があります。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>制約</th>
                  <th>拒否する書き込み</th>
                  <th>サンプル DB の例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>NOT NULL</td>
                  <td>その列が NULL になる書き込み</td>
                  <td>users の name・email・age</td>
                </tr>
                <tr>
                  <td>主キー</td>
                  <td>ほかの行と同じ値になる書き込み、NULL になる書き込み</td>
                  <td>4つのテーブルの id</td>
                </tr>
                <tr>
                  <td>外部キー</td>
                  <td>指す先のテーブルに無い値を入れる書き込み、指されている行の削除</td>
                  <td>users の department_id、orders と accounts の user_id</td>
                </tr>
                <tr>
                  <td>CHECK</td>
                  <td>書いた条件に合わない値になる書き込み</td>
                  <td>
                    accounts の balance（残高）の <code>balance &gt;= 0</code>。残高を 0 未満にできない
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            SQLite は外部キーの検査を既定では行わないので、実行欄はデータベースを作るときに <code>PRAGMA foreign_keys = ON</code> で検査を有効にしています
            <Ref n={6} />。PRAGMA は SQLite の設定を変える文です。制約に合わない SQL を実行したときのエラーは、INSERT・UPDATE・DELETE の節で確かめます。
          </p>
          <Figure n="17-2" title="サンプル DB の4つのテーブル" caption="実行欄のサンプル DB の構造。列の型は SQLite での型。">
            <SampleDbFigure />
          </Figure>
          <h3>SQLite と MySQL の違い</h3>
          <p>実行欄の SQLite と本書のデモの MySQL 8.4 では、同じ SQL でも結果が違うことがあります。この章に関係する違いは次の表のとおりで、どれも右端の節で確かめます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>実行欄（SQLite 3.49.1）</th>
                  <th>MySQL 8.4</th>
                  <th>節</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>列の型と違う値</td>
                  <td>INTEGER の列に 'twenty' を入れると文字列のまま保存する</td>
                  <td>エラー（既定の strict モード）</td>
                  <td>INSERT</td>
                </tr>
                <tr>
                  <td>文字列の比較</td>
                  <td>大文字と小文字を区別する</td>
                  <td>既定の照合順序では区別しない</td>
                  <td>where と order</td>
                </tr>
                <tr>
                  <td>id の割り当て</td>
                  <td>最大の id に1を足す。最大の行を消すと同じ id がまた使われることがある</td>
                  <td>AUTO_INCREMENT。割り当てた番号は再び使わない</td>
                  <td>INSERT</td>
                </tr>
                <tr>
                  <td>外部キーの検査</td>
                  <td>PRAGMA foreign_keys = ON のときだけ行う</td>
                  <td>InnoDB は foreign_key_checks が有効（既定）の間行う</td>
                  <td>DELETE</td>
                </tr>
                <tr>
                  <td>UPDATE の変更行数</td>
                  <td>値が変わらなくても、条件に合った行を数える</td>
                  <td>mysql コマンドは条件に合った行と値が変わった行を分けて表示する</td>
                  <td>UPDATE</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            表の中の照合順序は文字列の比べ方の規則、strict モードは不正な値をエラーにする MySQL の動作で、どちらも右端の節で説明します。InnoDB は MySQL
            が既定で使うストレージエンジン（テーブルの行を保存し、読み書きする部分）です。MySQL 8.4 で作るテーブルは、指定しなければ InnoDB になります。
          </p>
          <p>
            GROUP BY で集計するときの制限や、CREATE TABLE などがトランザクションを確定させる動作も違います。それらは<ChapterLink n={36} />と<ChapterLink n={38} />で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'active-record',
      title: 'Active Record でテーブルを扱う',
      body: (
        <>
          <p>
            Rails のアプリケーションでは SQL を直接書く代わりに Active Record のモデルのメソッドを呼びます。モデルは ApplicationRecord を継承したクラスで、1つのモデルが1つのテーブルに対応します。User
            クラスは users テーブルに、User のインスタンスは users の1行に対応し、インスタンスの name や age（属性）はその行の列の値を返します（<ChapterLink n={11} section="model" />
            ）。テーブル名はクラス名を複数形にしたもので、Rails が決めます
            <Ref n={21} />。
          </p>
          <p>
            この章ではサンプル DB と同じ構造のテーブルを MySQL 8.4.13 に create_table で作って同じ行を入れ、Rails 8.1.4.1 の Active Record（Ruby 4.0.9）から操作しました。Active Record
            だけを読み込んだので、新しく作った Rails 8.1 のアプリケーションと同じ動作になるように、2つの設定を加えています
            <Ref n={30} />。
          </p>
          <Code
            lang="ruby"
            title="テーブルとモデル（実測に使ったスクリプトから抜粋）"
            code={`
ActiveRecord::Base.partial_inserts = false                # config.load_defaults 7.0 以降の値
ActiveRecord::Base.belongs_to_required_by_default = true  # config.load_defaults 5.0 以降の値

ActiveRecord::Schema.define do
  create_table :departments do |t|
    t.string :name, null: false
  end
  create_table :users do |t|
    t.string :name, null: false
    t.string :email, null: false
    t.integer :age, null: false
    t.references :department, foreign_key: true   # NULL を入れてよい
    t.datetime :created_at, null: false
  end
  create_table :orders do |t|
    t.references :user, null: false, foreign_key: true
    t.integer :amount, null: false
    t.string :status, null: false
    t.datetime :created_at, null: false
  end
  create_table :accounts do |t|
    t.references :user, null: false, foreign_key: true
    t.integer :balance, null: false
    t.check_constraint "balance >= 0"
  end
end

# Rails のアプリケーションでは ApplicationRecord を継承する
class Department < ActiveRecord::Base
  has_many :users
end

class User < ActiveRecord::Base
  belongs_to :department, optional: true
  has_many :orders
  has_many :accounts
end

class Order < ActiveRecord::Base
  belongs_to :user
end

class Account < ActiveRecord::Base
  belongs_to :user
end
`}
          />
          <p>このスクリプトは上から次のように読みます。</p>
          <ul>
            <li>
              先頭の2行は、新しく作った Rails 8.1 のアプリケーションで有効になっている設定です。<code>partial_inserts = false</code> にすると、create! や save の INSERT
              に、値を渡さなかった department_id のような列も書きます。<code>belongs_to_required_by_default = true</code> にすると、belongs_to
              の関連に、関連先の行が存在しなければ保存しないバリデーションが付きます。どちらの動作も「create! と save」の節のログで確かめます。
            </li>
            <li>
              <code>ActiveRecord::Schema.define</code> のブロックは db/schema.rb と同じ書き方で、create_table がテーブルを作ります。id の列は書いていませんが、create_table が主キーの
              id を作ります。
            </li>
            <li>
              <code>null: false</code> を付けた列は NOT NULL になります。
            </li>
            <li>
              <code>t.references :department, foreign_key: true</code> は、department_id の列と、departments の id を指す外部キーの制約を作ります。null: false
              を付けていないので、department_id には NULL を入れられます。orders と accounts の <code>t.references :user</code> には null: false を付けたので、user_id は NOT NULL です。
            </li>
            <li>
              <code>t.check_constraint "balance &gt;= 0"</code> は CHECK 制約を作ります。
            </li>
            <li>
              モデルのクラスの belongs_to と has_many は、テーブルどうしのつながり（関連）の宣言です。User の <code>belongs_to :department, optional: true</code> の optional: true
              は、department_id が nil の User も保存できるようにする指定です。関連は<ChapterLink n={13} section="basics" />で扱います。
            </li>
          </ul>
          <p>
            列の型はサンプル DB と違いますが、行の値と制約はそろえています。たとえば id は bigint（大きな整数の型）の列で、AUTO_INCREMENT（行を追加するたびに MySQL
            が次の番号を入れる指定）が付いています。
          </p>
          <p>
            「Rails で実行」の結果はどれもこの環境で記録したものです。1行目が実行した Ruby の式、字下げした行が Active Record のログ（送った SQL。括弧の中はかかった時間）、<code># =&gt;</code>{' '}
            の後が式の値です。例外が起きたときは <code># !!</code> の後に例外のクラスとメッセージを書きます。
          </p>
          <Code
            lang="text"
            title="Rails 8.1.4.1・MySQL 8.4.13 で実行"
            code={`
User.table_name
# => "users"
User.column_names
# => ["id", "name", "email", "age", "department_id", "created_at"]
User.columns_hash["name"].null
# => false
User.all.to_sql
# => "SELECT \`users\`.* FROM \`users\`"
`}
          />
          <p>
            <code>column_names</code> は Rails がデータベースから読んだ列の名前で、name の列は NOT NULL なので <code>columns_hash</code> の null が false です。<code>to_sql</code>{' '}
            は組み立てた SQL をデータベースに送らずに文字列で返すので、ログに SQL が出ていません。名前を囲む <code>`</code>（バッククォート）は MySQL で名前を表す記号です。Active Record は列の名前の前にテーブルの名前を付けて SQL
            を組み立てるので、<code>`users`.*</code> は users テーブルのすべての列、後の節に出てくる <code>`users`.`name`</code> は users テーブルの name 列を表します。
          </p>
          <p>
            メソッドを呼んでから結果が Ruby の値になるまでを図 17-3 に示します。図は左上の Ruby のコードから右へ読みます。Active Record が SQL を組み立てて MySQL
            に送り、返ってきた行を Ruby の値にして、左下の戻り値として返します。図のコードの where・order・pluck は後の節で扱います。
          </p>
          <Figure n="17-3" title="Active Record のメソッドと SQL" caption="この章の実測をもとにした模式図。破線は SQL を送らずに確かめる経路を表す。">
            <ArFlowFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'select',
      title: 'SELECT で列を取り出す',
      body: (
        <>
          <p>
            SELECT はテーブルから必要な列を取り出す文です。FROM の後に読むテーブルを、SELECT の後に返す列を書きます。すべての列を返すときは、列の名前の代わりに <code>*</code> と書きます
            <Ref n={9} />。
          </p>
          <Code
            lang="sql"
            code={`
SELECT * FROM users;
SELECT name, age FROM users;
`}
          />
          <p>
            実行欄で Example の「全列」を実行すると、users の8行が6列すべて表示されます。次に Example で「列を選ぶ」を選んで「サンプルSQL挿入」を押し、実行すると、name と age の2列だけの8行になります。
          </p>
          <SqlLab lesson="SELECT" title="SQL を実行する：SELECT" />
          <p>
            「論理的な処理順」の FROM を押すと users の8行が6列のまま表示され、SELECT を押すと name と age の2列になります。FROM が対象の行を用意し、SELECT が出力する列を決める、と考えると結果の形を説明できます。「記述順」には
            SELECT の後に <code>`name`, `age`</code>、FROM の後に users と、書いた句が分かれて表示されます。
          </p>
          <p>
            <code>SELECT *</code> は列を書かずに済みますが、使わない列も読み出して送ります。実務のコードでは必要な列に絞ると、データベースから送るデータの量を抑えられます。
          </p>
          <p>
            結果の行は id の順に並んでいますが、この順は保証されていません。SQLite のマニュアルは ORDER BY の無い SELECT が返す行の順を未定義としています
            <Ref n={3} />。決まった順で受け取りたいときは、次の節の ORDER BY で指定します。
          </p>
        </>
      ),
    },
    {
      id: 'select-rails',
      title: 'all・select・pluck で読む',
      body: (
        <>
          <p>
            前の節の2つの SELECT を Active Record で書きます。<code>SELECT * FROM users</code> にあたるのが <code>User.all</code> です。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.all.class
# => User::ActiveRecord_Relation
User.all.map(&:name)
  User Load (0.5ms)  SELECT \`users\`.* FROM \`users\`
# => ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Hana"]
`}
          />
          <p>
            <code>User.all</code> が返すのは、どのテーブルからどの条件で行を読むかを覚えておくオブジェクト（Relation）です。Relation は作っただけでは SQL を送らず、<code>map</code> や{' '}
            <code>to_a</code> で中身を使うときに SELECT を送り、返ってきた8行を8つの User のインスタンスにします（<ChapterLink n={12} section="chain" />
            ）。ログの先頭の User Load は Active Record が SQL に付けた名前で、User の行を読み込む SQL であることを表します。この名前は操作ごとに変わり、pluck では User Pluck、後の節の
            create! では User Create になります。
          </p>
          <p>
            列を絞るときは <code>select</code> を、列の値だけが必要なときは <code>pluck</code> を使います。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.select(:name, :age).first(2)
  User Load (3.5ms)  SELECT \`users\`.\`name\`, \`users\`.\`age\` FROM \`users\` ORDER BY \`users\`.\`id\` ASC LIMIT 2
# => [#<User name: "Alice", age: 20, id: nil>, #<User name: "Bob", age: 24, id: nil>]
User.select(:name, :age).take.email
  User Load (0.3ms)  SELECT \`users\`.\`name\`, \`users\`.\`age\` FROM \`users\` LIMIT 1
# !! ActiveModel::MissingAttributeError: missing attribute 'email' for User

User.pluck(:name)
  User Pluck (0.3ms)  SELECT \`users\`.\`name\` FROM \`users\`
# => ["Alice", "Bob", "Carol", "Dave", "Eve", "Frank", "Grace", "Hana"]
User.pluck(:name, :age).first(3)
  User Pluck (0.3ms)  SELECT \`users\`.\`name\`, \`users\`.\`age\` FROM \`users\`
# => [["Alice", 20], ["Bob", 24], ["Carol", 19]]
`}
          />
          <p>
            <code>select(:name, :age)</code> は SELECT の列を name と age にします。1つ目の式は first(2) を付けたので、SQL の末尾に{' '}
            <code>ORDER BY `users`.`id` ASC LIMIT 2</code> が加わりました。ORDER BY … ASC は id の小さい順に並べる指定で、次の節で扱います。LIMIT 2
            は結果を先頭の2行までにする指定です。戻り値は User のインスタンスですが、読み込んだ name と age しか持たず、id は nil です。2つ目の式は take で1行を読み、その email
            を読んでいます。読み込んでいない email を読むと ActiveModel::MissingAttributeError になります
            <Ref n={22} />。アプリケーションでこの例外が出たときは、そのインスタンスを読んだ select に、読もうとした列が入っているかを確かめます。
          </p>
          <p>
            <code>pluck</code> は User のインスタンスを作らずに、列の値を Ruby の配列で返します
            <Ref n={22} />。列が1つなら値の配列、2つ以上なら行ごとの配列の配列です。名前の一覧だけが必要なときは、インスタンスを作らないぶん select より処理が少なくなります。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.first
  User Load (0.3ms)  SELECT \`users\`.* FROM \`users\` ORDER BY \`users\`.\`id\` ASC LIMIT 1
# => #<User id: 1, name: "Alice", email: "alice@example.com", age: 20, department_id: 1, ...>
User.take
  User Load (0.4ms)  SELECT \`users\`.* FROM \`users\` LIMIT 1
# => #<User id: 1, name: "Alice", ...>
`}
          />
          <p>
            <code>first</code> は主キーの順に並べる <code>ORDER BY `users`.`id` ASC</code> を付けて先頭の1行を返し、<code>take</code> は並べずに1行を返します。take
            も Alice を返しましたが、この順は保証されていません。<code>all</code> や <code>where</code> は ORDER BY を付けないので、順が必要なら <code>order</code>{' '}
            を書きます（first・find・count などの SQL は<ChapterLink n={12} section="finders" />）。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SQL</th>
                  <th>Active Record</th>
                  <th>戻り値</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>SELECT * FROM users</code>
                  </td>
                  <td>
                    <code>User.all</code>
                  </td>
                  <td>Relation（中身を使うときに User を読む）</td>
                </tr>
                <tr>
                  <td>
                    <code>SELECT name, age FROM users</code>
                  </td>
                  <td>
                    <code>User.select(:name, :age)</code>
                  </td>
                  <td>Relation（name と age だけを持つ User を読む）</td>
                </tr>
                <tr>
                  <td>
                    <code>SELECT name FROM users</code>
                  </td>
                  <td>
                    <code>User.pluck(:name)</code>
                  </td>
                  <td>文字列の配列（SQL はすぐに送る）</td>
                </tr>
                <tr>
                  <td>
                    <code>SELECT * FROM users ORDER BY id LIMIT 1</code>
                  </td>
                  <td>
                    <code>User.first</code>
                  </td>
                  <td>User のインスタンス1つ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'where',
      title: 'WHERE で行を絞り、ORDER BY で並べる',
      body: (
        <>
          <p>
            WHERE は条件に合う行だけを残す句で、FROM の後に書きます。条件には比較の演算子（<code>=</code>、<code>&lt;&gt;</code>（等しくない）、<code>&lt;</code>、<code>&lt;=</code>、
            <code>&gt;</code>、<code>&gt;=</code>）を使い、AND は両方の条件に合う行を、OR はどちらかの条件に合う行を残します。ORDER BY は結果の並べ方を決める句で、列の名前の後に DESC（大きい順）か
            ASC（小さい順）を書きます。どちらも書かなければ ASC です
            <Ref n={3} />。
          </p>
          <Code
            lang="sql"
            code={`
SELECT name, age FROM users
WHERE age >= 20
ORDER BY age DESC, id;
`}
          />
          <p>
            実行欄で Example の「絞り込みとソート」を実行すると、結果は Grace・Dave・Eve・Bob・Alice・Frank の6行です。「論理的な処理順」には FROM → WHERE → SELECT → ORDER BY
            が並びます。FROM では8行、WHERE を押すと age が 20 未満の Carol（19）と Hana（17）が除かれた6行になり、SELECT で2列に、ORDER BY で年齢の大きい順になります。
          </p>
          <SqlLab lesson="WHERE" title="SQL を実行する：WHERE" />
          <p>
            次に、入力欄の <code>age &gt;= 20</code> を <code>age &gt;= 30</code> に書き換えて実行し、WHERE の段階で残る行を比べます。残るのは Dave（32）と Grace（35）の2行です。「記述順」の
            ORDER BY には <code>`age` DESC, `id` null</code> と表示されます。id の後の null は並べる向きを書かなかったことを表し、このとき id は ASC で並びます。
          </p>
          <p>
            SQL は SELECT・FROM・WHERE・ORDER BY の順に書きますが、結果は FROM・WHERE・SELECT・ORDER BY の順に処理したと考えると説明できます（図 17-4）。WHERE は GROUP BY
            で行をグループにまとめる前の行に対して判定します（GROUP BY は<ChapterLink n={36} />）。
          </p>
          <Figure n="17-4" title="SQL を書く順と処理の順" caption="上の SQL を、実行欄の「論理的な処理順」の段階に対応させた模式図。">
            <ClauseOrderFigure />
          </Figure>
          <h3>NULL との比較</h3>
          <p>
            Example の「NULLを探す」（<code>WHERE department_id IS NULL</code>）を実行すると、Hana の1行が返ります。続けて、次の2つの SQL を1つずつ入力して実行してください。
          </p>
          <Code
            lang="sql"
            code={`
SELECT * FROM users WHERE department_id = NULL;
SELECT name, department_id FROM users WHERE department_id <> 1;
`}
          />
          <p>
            1つ目は0行で、Hana は <code>= NULL</code> では見つかりません。「部署1以外」を探す2つ目は Carol・Dave・Eve・Grace の4行で、Hana は含まれません。
          </p>
          <p>
            SQL の条件の結果には、TRUE（真）と FALSE（偽）のほかに UNKNOWN（不明）があります。NULL は値が分からないことを表すので、NULL を <code>=</code> や <code>&lt;&gt;</code>{' '}
            で比べた結果は TRUE にも FALSE にもならず、NULL（UNKNOWN）になります
            <Ref n={10} />。WHERE は条件が TRUE の行だけを残し、FALSE と UNKNOWN の行を除くので、Hana は2つの SQL のどちらでも除かれました。NULL の行は <code>IS NULL</code> で、NULL
            でない行は <code>IS NOT NULL</code> で探します。NULL と 0 は別の値なので、<code>department_id = 0</code> でも Hana は見つかりません。
          </p>
          <p>次の表は、users の8行を3つの条件で判定し、結果を TRUE・FALSE・UNKNOWN に分けたものです（括弧の中は department_id の値）。WHERE は TRUE の欄の利用者だけを残します。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">条件</th>
                  <th scope="col">TRUE（残る）</th>
                  <th scope="col">FALSE（除く）</th>
                  <th scope="col">UNKNOWN（除く）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>department_id = NULL</code>
                  </td>
                  <td>なし</td>
                  <td>なし</td>
                  <td>8人すべて（Hana の NULL も含む）</td>
                </tr>
                <tr>
                  <td>
                    <code>department_id &lt;&gt; 1</code>
                  </td>
                  <td>Carol（2）・Dave（2）・Eve（2）・Grace（3）</td>
                  <td>Alice（1）・Bob（1）・Frank（1）</td>
                  <td>Hana（NULL）</td>
                </tr>
                <tr>
                  <td>
                    <code>department_id IS NULL</code>
                  </td>
                  <td>Hana（NULL）</td>
                  <td>Hana 以外の7人</td>
                  <td>なし</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>同じ値の並び順と括弧</h3>
          <p>
            Alice と Frank はどちらも20歳で、<code>ORDER BY age DESC</code> だけでは2人の順は決まりません。MySQL のマニュアルも、ORDER BY
            の列の値が同じ行は、実行計画によってどの順でも返り得ると書いています
            <Ref n={11} />。サンプルは2つ目に id を加え、Alice（id 1）、Frank（id 6）の順に決めています。
          </p>
          <p>AND と OR を混ぜるときは括弧を付けます。次の2つの SQL を実行して、行の数を比べてください。</p>
          <Code
            lang="sql"
            code={`
SELECT name, department_id, age FROM users
WHERE department_id = 1 OR department_id = 2 AND age >= 25;

SELECT name, department_id, age FROM users
WHERE (department_id = 1 OR department_id = 2) AND age >= 25;
`}
          />
          <p>
            1つ目は Alice・Bob・Dave・Eve・Frank の5行、2つ目は Dave と Eve の2行です。AND は OR より先に結び付くので、1つ目は{' '}
            <code>department_id = 1 OR (department_id = 2 AND age &gt;= 25)</code> と同じ意味になり、部署1の利用者は年齢に関係なく残ります
            <Ref n={12} />。「部署1か2で、25歳以上」という意図なら、2つ目のように括弧で OR の範囲を示します。
          </p>
        </>
      ),
    },
    {
      id: 'where-rails',
      title: 'where と order で条件と順を書く',
      body: (
        <>
          <p>前の節の「絞り込みとソート」を Active Record の where と order で書きます。</p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.where("age >= ?", 20).order(age: :desc).to_sql
# => "SELECT \`users\`.* FROM \`users\` WHERE (age >= '20') ORDER BY \`users\`.\`age\` DESC"
User.where("age >= ?", 20).order(age: :desc, id: :asc).pluck(:name, :age)
  User Pluck (3.1ms)  SELECT \`users\`.\`name\`, \`users\`.\`age\` FROM \`users\` WHERE (age >= '20')
                      ORDER BY \`users\`.\`age\` DESC, \`users\`.\`id\` ASC
# => [["Grace", 35], ["Dave", 32], ["Eve", 28], ["Bob", 24], ["Alice", 20], ["Frank", 20]]
User.where("age >= :min", min: 20).to_sql
# => "SELECT \`users\`.* FROM \`users\` WHERE (age >= '20')"
`}
          />
          <p>
            where に渡した文字列は括弧で囲まれて WHERE に入ります。文字列の中の <code>?</code> を<Term en="placeholder">プレースホルダー</Term>
            と呼び、2つ目の引数の値をクォート（SQL の値として安全な形に変換すること）してそこに入れます。<code>:min</code> のように名前も付けられます。order には「列の名前: :desc」の形で並べ方を渡します
            <Ref n={22} />。結果は実行欄と同じ6人で、順も同じです。
          </p>
          <p>
            SQL の中で、値の 20 が <code>'20'</code> と文字列になっています。Rails のソースのコメントによると、MySQL のアダプター（Active Record のうち、MySQL に合わせた SQL
            を作って送る部分）は問い合わせを書き換える攻撃を防ぐために、プレースホルダーに入れる数値を文字列としてクォートします
            <Ref n={28} />。MySQL は文字列と数値を比べるときにどちらも数値に変換するので、文字列の列 email を数値の 0 と比べると、0 に変換される email がすべて条件に合います
            <Ref n={32} />。条件の文字列に 0 を直接書いた場合と、プレースホルダーに 0 を渡した場合を比べます。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.where("email = 0").count
  User Count (0.8ms)  SELECT COUNT(*) FROM \`users\` WHERE (email = 0)
# => 8
User.where("email = ?", 0).count
  User Count (0.7ms)  SELECT COUNT(*) FROM \`users\` WHERE (email = '0')
# => 0
`}
          />
          <p>
            1つ目は SQL に数値の 0 がそのまま入りました。MySQL は 'alice@example.com' のように数値として読めない文字列を 0 に変換して比べるので、8行すべてが条件に合いました。2つ目は
            Active Record が 0 を <code>'0'</code> という文字列にしたので、email が '0' という文字列と等しい行を探す条件になり、0行でした。文字列の列を探す条件のプレースホルダーに数値が渡されても、すべての行に合う条件にはなりません。
          </p>
          <p>整数の列 age と <code>'20'</code> の比較も数値どうしになるので、結果は <code>age &gt;= 20</code> と同じです。</p>
          <h3>ハッシュの条件と NULL</h3>
          <p>列の名前と値の組（ハッシュ）を where に渡すと、Active Record が列の型と値の種類を見て SQL を組み立てます。</p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.where(age: 20..).to_sql
# => "SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`age\` >= 20"
User.where(department_id: nil).pluck(:id, :name)
  User Pluck (2.4ms)  SELECT \`users\`.\`id\`, \`users\`.\`name\` FROM \`users\` WHERE \`users\`.\`department_id\` IS NULL
# => [[8, "Hana"]]
User.where(department_id: [1, nil]).to_sql
# => "SELECT \`users\`.* FROM \`users\` WHERE (\`users\`.\`department_id\` = 1 OR \`users\`.\`department_id\` IS NULL)"
User.where("department_id = ?", nil).count
  User Count (0.7ms)  SELECT COUNT(*) FROM \`users\` WHERE (department_id = NULL)
# => 0
`}
          />
          <p>
            範囲の <code>20..</code>（20以上）は <code>&gt;= 20</code> になり、整数はクォートされません。nil は <code>IS NULL</code> になって Hana が見つかり、配列の中の nil は{' '}
            <code>IS NULL</code> の条件として OR でつながります。文字列の条件にはこの変換が無く、<code>?</code> に nil を渡すと <code>= NULL</code> になって1行も見つかりません。
          </p>
          <p>
            次に、前の節の「部署1以外」（<code>department_id &lt;&gt; 1</code>）を where.not で書きます。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.where.not(department_id: 1).pluck(:name)
  User Pluck (0.5ms)  SELECT \`users\`.\`name\` FROM \`users\` WHERE \`users\`.\`department_id\` != 1
# => ["Carol", "Dave", "Eve", "Grace"]
User.where.not(department_id: 1).or(User.where(department_id: nil)).pluck(:name)
  User Pluck (0.7ms)  SELECT \`users\`.\`name\` FROM \`users\`
                      WHERE (\`users\`.\`department_id\` != 1 OR \`users\`.\`department_id\` IS NULL)
# => ["Hana", "Carol", "Dave", "Eve", "Grace"]
`}
          />
          <p>
            否定の条件の <code>where.not(department_id: 1)</code> は <code>!= 1</code> になり、前の節の <code>&lt;&gt; 1</code> と同じく Hana を含みません。Rails ガイドも NULL
            を入れてよい列に nil 以外の値で否定の条件を付けると、その列が nil の行は返らないと書いています
            <Ref n={22} />。NULL の行も含めたいときは、<code>or</code> で <code>IS NULL</code> の条件を加えます。
          </p>
          <h3>or と括弧</h3>
          <p>
            前の節の「部署1か2で、25歳以上」を or と where で書き、SQL のどこに括弧が付くかを to_sql で確かめます。3つ目の式は、括弧の無い条件を文字列で渡した場合です。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.where(department_id: 1).or(User.where(department_id: 2)).where(age: 25..).to_sql
# => "SELECT \`users\`.* FROM \`users\` WHERE (\`users\`.\`department_id\` = 1 OR \`users\`.\`department_id\` = 2)
#     AND \`users\`.\`age\` >= 25"
User.where(department_id: 1).or(User.where(department_id: 2)).where(age: 25..).pluck(:name)
# => ["Dave", "Eve"]
User.where("department_id = 1 OR department_id = 2 AND age >= 25").pluck(:name)
# => ["Alice", "Bob", "Frank", "Dave", "Eve"]
`}
          />
          <p>
            Active Record は <code>or</code> でつないだ条件を括弧で囲んでから AND で次の条件をつなぐので、結果は前の節の括弧を付けた SQL と同じ Dave と Eve です。文字列の条件は全体を括弧で囲むだけなので、中の括弧は自分で付けます。付けなければ、前の節の括弧の無い
            SQL と同じ5人が返ります。
          </p>
          <h3>値を条件の文字列に埋め込まない</h3>
          <p>
            条件の文字列に、Ruby の式展開（<code>{'"name = \'#{name}\'"'}</code>）で値を入れてはいけません。利用者が入力した値に <code>'</code> が入っていると、値が SQL の一部として解釈されます。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
name = "x' OR '1'='1"
User.where("name = '#{name}'").count
  User Count (3.6ms)  SELECT COUNT(*) FROM \`users\` WHERE (name = 'x' OR '1'='1')
# => 8
User.where("name = ?", name).count
  User Count (0.5ms)  SELECT COUNT(*) FROM \`users\` WHERE (name = 'x\\' OR \\'1\\'=\\'1')
# => 0
`}
          />
          <p>
            埋め込んだ SQL は <code>name = 'x' OR '1'='1'</code> となり、<code>'1'='1'</code> は常に TRUE なので8行すべてが合いました。プレースホルダーやハッシュで渡すと、値の中の{' '}
            <code>'</code> は <code>\'</code> にエスケープされ、名前がその文字列の利用者を探す条件のままです。入力が SQL の命令の一部として解釈されるこの攻撃を SQL インジェクションと呼びます
            <Ref n={22} />。対策の全体は<ChapterLink n={21} section="sqli" />で扱います。
          </p>
          <h3>文字列の大文字と小文字</h3>
          <p>先頭を小文字にした alice で、name が Alice の行を探します。</p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.where(name: "alice").pluck(:id, :name)
  User Pluck (0.5ms)  SELECT \`users\`.\`id\`, \`users\`.\`name\` FROM \`users\` WHERE \`users\`.\`name\` = 'alice'
# => [[1, "Alice"]]
`}
          />
          <p>
            MySQL 8.4 の既定の照合順序（文字列の比べ方の規則）utf8mb4_0900_ai_ci は大文字と小文字を区別しないので、<code>name = 'alice'</code> が Alice の行に合いました
            <Ref n={19} />。実行欄で <code>SELECT id, name FROM users WHERE name = 'alice';</code> を実行すると0行です。SQLite の既定の比べ方（BINARY）はバイトをそのまま比べるので、大文字と小文字を区別します
            <Ref n={4} />。
          </p>
        </>
      ),
    },
    {
      id: 'insert',
      title: 'INSERT で行を追加する',
      body: (
        <>
          <p>
            INSERT は新しい行を追加する文です。INSERT INTO の後にテーブル名と値を入れる列の名前を括弧で並べ、VALUES の後に値を同じ順で並べます。列の名前を書くと、どの値がどの列に入るかを読み取れます。書かなかった列にはその列の既定値が入り、既定値の無い列には
            NULL が入ります
            <Ref n={13} />。
          </p>
          <Code
            lang="sql"
            code={`
INSERT INTO users (name, email, age, department_id)
VALUES ('Iris', 'iris@example.com', 26, 3);
SELECT * FROM users WHERE name = 'Iris';
`}
          />
          <p>
            実行欄の Example「追加して確認」を実行すると、結果 1 に「変更行数 1」が、結果 2 に Iris の行が表示されます。id は書いていませんが 9 が入り、created_at には既定値の 2026-01-01
            が入っています。もう一度実行すると id が 10 の Iris が追加され、結果 2 は Iris の2行になります。Table / Schema の一覧の users でも確かめられます。
          </p>
          <SqlLab lesson="INSERT" title="SQL を実行する：INSERT" />
          <p>
            「SQLの構造と内部処理」の段階のボタンは SELECT にだけ表示されます。INSERT だけを実行すると INSERT の文だけが表示されるので、サンプルのように SELECT を続けて、追加した後の表で段階を確かめます。
          </p>
          <h3>id の割り当て</h3>
          <p>
            サンプル DB の id の列は SQLite の INTEGER PRIMARY KEY で、SQLite が行ごとに持つ番号（rowid）の別名です。id を書かなければ、ふつうはその時点の最大の番号に1を足した値が入るので、最大の番号の行を削除すると、同じ番号がまた使われることがあります
            <Ref n={5} />。Example を2回実行した後に次の SQL を実行すると、新しい Iris の id も 10 になります。
          </p>
          <Code
            lang="sql"
            code={`
DELETE FROM users WHERE id = 10;
INSERT INTO users (name, email, age, department_id)
VALUES ('Iris', 'iris@example.com', 26, 3);
SELECT id, name FROM users WHERE name = 'Iris';
`}
          />
          <p>
            MySQL の AUTO_INCREMENT は一度割り当てた番号を再び使いません。同じ操作を MySQL で行いました。使ったのは mysql コマンド（MySQL に付属し、入力した SQL を MySQL
            に送って結果を表示するコマンド）です。<code>mysql&gt;</code> の後が入力した SQL、<code>-&gt;</code> で始まる行はその続き、罫線で囲んだ表が結果です。MySQL のテーブルの created_at
            には既定値が無いので、今の日時を返す <code>NOW(6)</code>（6 は秒の小数点以下の桁数）を書いています。
          </p>
          <Code
            lang="text"
            title="mysql コマンドで実行（MySQL 8.4.13。サンプル DB と同じ行を入れた直後）"
            code={`
mysql> INSERT INTO users (name, email, age, department_id, created_at)
    ->   VALUES ('Iris', 'iris@example.com', 26, 3, NOW(6));
mysql> SELECT LAST_INSERT_ID();
+------------------+
| LAST_INSERT_ID() |
+------------------+
|                9 |
+------------------+
mysql> DELETE FROM users WHERE id = 9;
mysql> INSERT INTO users (name, email, age, department_id, created_at)
    ->   VALUES ('Iris', 'iris@example.com', 26, 3, NOW(6));
mysql> SELECT id, name FROM users WHERE name = 'Iris';
+----+------+
| id | name |
+----+------+
| 10 | Iris |
+----+------+
`}
          />
          <p>
            LAST_INSERT_ID() は直前の INSERT で割り当てた番号を返す関数です。MySQL は削除した 9 を使わずに 10 を割り当てました。InnoDB はロールバックした INSERT
            が割り当てた番号も再び使わないので、id には抜けができることがあります
            <Ref n={17} />。ロールバックは確定する前の変更を取り消すことで、次の節のログで確かめます。本番のテーブルで id の番号が飛んでいても、行が削除されたとは限りません。
          </p>
          <h3>制約に合わない行</h3>
          <p>次の SQL を1つずつ実行して、エラーを確かめます。</p>
          <Code
            lang="sql"
            code={`
INSERT INTO users (email, age) VALUES ('x@example.com', 30);
INSERT INTO users (name, email, age, department_id)
VALUES ('Jack', 'jack@example.com', 30, 99);
`}
          />
          <p>
            1つ目は name を書いていないので name が NULL になり、「NOT NULL constraint failed: users.name」で失敗します。NOT NULL の列に NULL を入れようとしても、空の文字列や 0
            に置き換えられることはなく、制約のエラーになります。2つ目は存在しない部署 99 を指そうとして「FOREIGN KEY constraint failed」で失敗します。どちらも行は追加されません。MySQL
            では次のエラーになりました。
          </p>
          <Code
            lang="text"
            title="mysql コマンドで実行（MySQL 8.4.13）"
            code={`
mysql> INSERT INTO users (name, email, age, created_at) VALUES (NULL, 'x@example.com', 30, NOW(6));
ERROR 1048 (23000): Column 'name' cannot be null
mysql> INSERT INTO users (name, email, age, department_id, created_at)
    ->   VALUES ('Jack', 'jack@example.com', 30, 99, NOW(6));
ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails
(\`ch35\`.\`users\`, CONSTRAINT \`fk_rails_f29bf9cdf2\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\` (\`id\`))
mysql> INSERT INTO users (name, email, age, created_at) VALUES ('X', 'x@example.com', 'twenty', NOW(6));
ERROR 1366 (HY000): Incorrect integer value: 'twenty' for column 'age' at row 1
`}
          />
          <p>
            ERROR の後の 1048 や 1452 は MySQL のエラー番号で、その後がメッセージです。外部キーのエラーの括弧の中は、違反した制約を表します。<code>`ch35`.`users`</code> は ch35
            というデータベースの users テーブル、fk_rails_f29bf9cdf2 は Rails が外部キーの制約に付けた名前です。<code>FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)</code>{' '}
            は、department_id が departments の id を指す制約であることを表します。Rails の例外にも同じメッセージが入るので、この部分から、どのテーブルのどの列が存在しない行を指したかを読み取れます。
          </p>
          <p>
            MySQL 8.4 の既定の SQL モード（SQL の文法や値の検査のしかたを切り替える MySQL の設定）には strict モード（STRICT_TRANS_TABLES）が含まれ、不正な値や足りない値はエラーになって、その文は取り消されます
            <Ref n={18} />。最後の例の、整数の列に 'twenty' を入れる INSERT もエラーです。SQLite は列の型を厳密には検査せず、INTEGER の列に数値として読めない文字列を入れると文字列のまま保存します
            <Ref n={4} />。実行欄で同じ値の INSERT と、age の値とその型を表示する SELECT を実行します。
          </p>
          <Code
            lang="sql"
            code={`
INSERT INTO users (name, email, age) VALUES ('Kate', 'kate@example.com', 'twenty');
SELECT name, age, typeof(age) FROM users;
`}
          />
          <p>
            INSERT はエラーにならず、結果 1 は「変更行数 1」です。typeof は値の型を返す SQLite の関数で、結果 2 の Kate の行は age が twenty、typeof(age) が text
            です。ほかの行の typeof(age) は integer です。
          </p>
          <p>成功する文と失敗する文をまとめて実行すると、実行欄は「エラー前の文は実行済みです」と表示します。</p>
          <Code
            lang="sql"
            code={`
INSERT INTO users (name, email, age) VALUES ('Leo', 'leo@example.com', 22);
INSERT INTO users (name, email, age) VALUES (NULL, 'x@example.com', 30);
SELECT id, name FROM users WHERE id > 8;
`}
          />
          <p>
            2つ目の INSERT のエラーで止まりますが、結果 1 の Leo の行は取り消されずに残ります。すべての文が成功したときだけ確定させるにはトランザクションを使います（
            <ChapterLink n={38} section="transaction" />）。試した後は「サンプルDB初期化」で元に戻すと、次の節からの結果が本文と合います。
          </p>
        </>
      ),
    },
    {
      id: 'insert-rails',
      title: 'create! と save：DB の制約とバリデーション',
      body: (
        <>
          <p>
            INSERT にあたる Active Record のメソッドは <code>create!</code>（または <code>new</code> の後の <code>save</code>）です。実行欄と同じ Iris を MySQL
            のサンプル DB に2回追加しました。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
iris = User.create!(name: "Iris", email: "iris@example.com", age: 26, department_id: 3)
  TRANSACTION (0.4ms)  BEGIN
  User Create (0.9ms)  INSERT INTO \`users\` (\`name\`, \`email\`, \`age\`, \`department_id\`, \`created_at\`)
                       VALUES ('Iris', 'iris@example.com', 26, 3, '2026-11-20 12:48:53.185652')
  TRANSACTION (25.6ms)  COMMIT
# => #<User id: 9, name: "Iris", email: "iris@example.com", age: 26, department_id: 3, created_at: "2026-11-20 12:48:53...">
User.create!(name: "Iris", email: "iris@example.com", age: 26, department_id: 3).id
  （ログは1回目と同じ形）
# => 10
`}
          />
          <p>
            create! は BEGIN でトランザクション（複数の SQL をまとめて確定するか、まとめて取り消す仕組み）を始め、INSERT を送って COMMIT で確定します。渡していない created_at には Rails
            が今の日時を入れました。戻り値は保存した User で、MySQL が割り当てた id が入っています。new・save・create の使い分けは<ChapterLink n={11} section="crud" />で扱います。
          </p>
          <h3>DB の制約が止めるもの</h3>
          <p>この時点の User には保存する前に値を検査する規則（バリデーション）を書いていません。name を nil にしたり、存在しない部署を指したりすると、MySQL が INSERT を拒否します。</p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.create!(name: nil, email: "nil@example.com", age: 30)
  TRANSACTION (0.2ms)  BEGIN
  User Create (1.0ms)  INSERT INTO \`users\` (\`name\`, \`email\`, \`age\`, \`department_id\`, \`created_at\`)
                       VALUES (NULL, 'nil@example.com', 30, NULL, '2026-11-20 12:48:53.235000')
  TRANSACTION (0.3ms)  ROLLBACK
# !! ActiveRecord::NotNullViolation: Mysql2::Error: Column 'name' cannot be null
User.create!(name: "", email: "empty@example.com", age: 30).name
  （BEGIN・INSERT・COMMIT）
# => ""
User.create!(name: "Jack", email: "jack@example.com", age: 30, department_id: 99)
  （BEGIN・INSERT の後に ROLLBACK）
# !! ActiveRecord::InvalidForeignKey: Mysql2::Error: Cannot add or update a child row: a foreign key constraint fails (...)
`}
          />
          <p>
            name が nil のときは INSERT に NULL が入り、MySQL が拒否しました。渡していない department_id も NULL として INSERT に入っていて、これが partial_inserts = false
            の動作です。Active Record はこのエラーを ActiveRecord::NotNullViolation の例外にして、トランザクションを ROLLBACK
            で取り消します。外部キーのエラーは ActiveRecord::InvalidForeignKey になりました。一方、空の文字列 "" は NULL ではないので、名前が空の利用者が保存されました。
          </p>
          <h3>バリデーションが止めるもの</h3>
          <p>
            NOT NULL が止めるのは値が無いことだけです。空の名前を止めたり、利用者に分かる言葉で理由を返したりするには、モデルにバリデーションを書きます（
            <ChapterLink n={14} section="validation-basics" />
            ）。User に presence の検証を加えて試しました。
          </p>
          <Code
            lang="text"
            title={`${RUN}（User に validates :name, :email, :age, presence: true を加えた）`}
            code={`
b = User.new(email: "nil2@example.com", age: 30); b.save
# => false
b.errors.full_messages
# => ["Name can't be blank"]
b.save!
# !! ActiveRecord::RecordInvalid: Validation failed: Name can't be blank
User.create!(name: "", email: "empty2@example.com", age: 30)
# !! ActiveRecord::RecordInvalid: Validation failed: Name can't be blank

b.save(validate: false)
  TRANSACTION (0.2ms)  BEGIN
  User Create (1.0ms)  INSERT INTO \`users\` (...) VALUES (NULL, 'nil2@example.com', 30, NULL, '2026-11-20 12:48:53.284766')
  TRANSACTION (0.2ms)  ROLLBACK
# !! ActiveRecord::NotNullViolation: Mysql2::Error: Column 'name' cannot be null

Order.create!(user_id: 999, amount: 1000, status: "paid")
  TRANSACTION (0.5ms)  BEGIN
  User Load (1.2ms)  SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`id\` = 999 LIMIT 1
  TRANSACTION (3.4ms)  ROLLBACK
# !! ActiveRecord::RecordInvalid: Validation failed: User must exist
`}
          />
          <p>
            presence は値が nil、空の文字列、空白だけの文字列のときに失敗します
            <Ref n={23} />。save は SQL を送らずに false を返して理由を errors に入れ、save! と create! は ActiveRecord::RecordInvalid の例外を投げます。空の文字列も、今度は保存されません。save(validate:
            false) や insert_all（複数の行を1つの INSERT で追加するメソッド）はバリデーションを実行しません
            <Ref n={23} />。<code>b.save(validate: false)</code> は INSERT を送り、MySQL の NOT NULL の制約が NULL を止めました。
          </p>
          <p>
            新しく作る Rails のアプリケーションでは、belongs_to の関連に、関連先が存在することを確かめるバリデーションが付きます。Order の user_id に存在しない 999 を入れると、Active Record が SELECT
            で users を探し、見つからないので「User must exist」で止めました。この章のスクリプトでは、belongs_to_required_by_default = true がこのバリデーションを付けています。User の
            belongs_to :department には optional: true を書いたのでこのバリデーションが無く、前の例の存在しない部署 99 は MySQL の外部キーの制約で止まりました。
          </p>
          <h3>2つの検査の使い分け</h3>
          <p>
            バリデーションと DB の制約は検査する場所と止める範囲が違います（図 17-5）。バリデーションは SQL を送る前に Rails のプロセス（実行中の Rails のアプリケーション）の中で値を検査し、利用者に見せるエラーメッセージを作れます。ただし、バリデーションを実行しないメソッドや、別のアプリケーション・mysql
            コマンドからの書き込みは検査しません。2つの処理が同時に同じメールアドレスを保存するときの重複も見つけられません（<ChapterLink n={14} section="uniqueness" />
            ）。この重複は、同じ値を2つの行に入れられなくする一意の索引を DB に作って止めます。DB の制約はどの経路の書き込みも MySQL が検査しますが、違反は例外として届くので、そのままでは利用者に分かるメッセージになりません。
          </p>
          <p>
            どちらの検査で止まったかは、例外のクラスで見分けられます。ActiveRecord::RecordInvalid はバリデーションが止めた保存です。ActiveRecord::NotNullViolation や
            ActiveRecord::InvalidForeignKey は MySQL の制約が止めた SQL で、バリデーションを通らない経路か、バリデーションに書いていない規則で、SQL が MySQL まで届いたことを表します。
          </p>
          <p>
            Rails ガイドもモデルのバリデーションを勧めたうえで、ほかのアプリケーションが同じデータベースを使う場合はデータベースの制約も使うとよいと書いています
            <Ref n={23} />。NOT NULL・外部キー・CHECK を DB に置き、利用者に理由を示したい規則はバリデーションにも書けば、一方を通らない経路でも、もう一方で止められます。
          </p>
          <Figure n="17-5" title="バリデーションと DB の制約" caption="この節の実行結果をまとめた模式図。破線の箱は保存できなかった場合を表す。">
            <TwoChecksFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'update',
      title: 'UPDATE で値を書き換える',
      body: (
        <>
          <p>
            UPDATE は既存の行の値を書き換える文です。UPDATE の後にテーブル名を、SET の後に「列 = 新しい値」をカンマで区切って並べ、WHERE で書き換える行を指定します。WHERE
            を省くと、テーブルのすべての行が書き換わります
            <Ref n={7} />
            <Ref n={14} />。
          </p>
          <Code
            lang="sql"
            code={`
UPDATE users SET age = 21 WHERE id = 1;
SELECT id, name, age FROM users WHERE id = 1;
`}
          />
          <p>
            実行欄の Example「1行を更新」を実行すると、結果 1 は「変更行数 1」、結果 2 は age が 21 になった Alice の行です。WHERE の <code>id = 1</code> に合う1行だけが変わりました。
          </p>
          <SqlLab lesson="UPDATE" title="SQL を実行する：UPDATE" />
          <p>
            UPDATE は WHERE の条件に合う行を探してから、その行の値を書き換えます。書き換える前に同じ WHERE で SELECT を実行し、対象の行を確かめておくと、意図しない行の書き換えを防げます。部署1の利用者の年齢を1ずつ増やす例で試します。
          </p>
          <Code
            lang="sql"
            code={`
SELECT id, name, age FROM users WHERE department_id = 1;
UPDATE users SET age = age + 1 WHERE department_id = 1;
SELECT id, name, age FROM users WHERE department_id = 1;
`}
          />
          <p>
            最初の SELECT で対象が Alice・Bob・Frank の3行だと確かめられます。UPDATE の変更行数は 3 で、最後の SELECT では3人の age がそれぞれ1増えています。<code>age = age + 1</code>{' '}
            の右辺の age は、その行を書き換える前の値です。
          </p>
          <Callout kind="warn" title="WHERE を省いた UPDATE">
            <p>
              実行欄で <code>UPDATE users SET age = 0;</code> を実行すると、変更行数は 8 になり、全員の age が 0 になります。試した後は「サンプルDB初期化」を押してください。
            </p>
          </Callout>
          <p>
            CHECK 制約に合わない値への書き換えは失敗します。<code>UPDATE accounts SET balance = -1 WHERE id = 3;</code> は「CHECK constraint failed: balance &gt;= 0」になり、balance は
            8000 のままです。MySQL 8.4 も CHECK 制約を INSERT と UPDATE で検査し、違反するとエラーにします
            <Ref n={20} />。
          </p>
          <p>
            索引（値から行を早く探すための仕組み）のある列を書き換えると、データベースは索引も書き換えます。索引は<ChapterLink n={37} />で、2つの処理が同じ行を同時に書き換えるときの動作（ロック）は
            <ChapterLink n={38} />のシミュレーターで扱います。
          </p>
          <h3>変更行数の数え方</h3>
          <p>
            Example の「1行を更新」をもう一度実行すると、age は 21 のままですが、SQLite は WHERE に合った行を数えるので、変更行数は 1 です。mysql
            コマンドは、条件に合った行（Rows matched）と値が変わった行（Changed）を分けて表示します。
          </p>
          <Code
            lang="text"
            title="mysql コマンドで実行（MySQL 8.4.13）"
            code={`
mysql> UPDATE users SET age = 21 WHERE id = 1;
Query OK, 1 row affected (0.03 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> UPDATE users SET age = 21 WHERE id = 1;
Query OK, 0 rows affected (0.00 sec)
Rows matched: 1  Changed: 0  Warnings: 0
`}
          />
        </>
      ),
    },
    {
      id: 'update-rails',
      title: 'update! と update_all',
      body: (
        <>
          <p>1行を書き換えるときは、行を読んでから update!（または update）を呼びます。サンプル DB を初期化した状態から実行しました。</p>
          <Code
            lang="text"
            title={RUN}
            code={`
alice = User.find(1)
  User Load (0.4ms)  SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`id\` = 1 LIMIT 1
# => #<User id: 1, name: "Alice", email: "alice@example.com", age: 20, department_id: 1, ...>
alice.update!(age: 21)
  TRANSACTION (0.3ms)  BEGIN
  User Update (0.9ms)  UPDATE \`users\` SET \`users\`.\`age\` = 21 WHERE \`users\`.\`id\` = 1
  TRANSACTION (14.4ms)  COMMIT
# => true
alice.update!(age: 21)
# => true
`}
          />
          <p>
            update! は渡した値を代入してから save! を呼びます
            <Ref n={26} />。UPDATE の SET には値が変わった age だけが入り、WHERE には主キーの id が入りました。同じ値でもう一度 update! を呼ぶと、変わった列が無いので SQL を1つも送らずに true
            を返しました。どの列が変わったかを記録する仕組みは<ChapterLink n={11} section="dirty" />で扱います。
          </p>
          <p>
            update と update! は保存の前にバリデーションを実行します。presence の検証がある User で name を nil にすると、update は SQL を送らずに false を返し、update!
            は例外を投げました。CHECK 制約の違反は ActiveRecord::CheckViolation になりました。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.find(1).update(name: nil)
  User Load (0.5ms)  SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`id\` = 1 LIMIT 1
# => false
User.find(1).update!(name: nil)
  User Load (0.5ms)  SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`id\` = 1 LIMIT 1
# !! ActiveRecord::RecordInvalid: Validation failed: Name can't be blank
Account.find(3).update!(balance: -1)
  （SELECT・BEGIN・UPDATE の後に ROLLBACK）
# !! ActiveRecord::CheckViolation: Mysql2::Error: Check constraint 'chk_rails_235761bce4' is violated.
`}
          />
          <h3>update_all でまとめて書き換える</h3>
          <p>
            条件に合う複数の行を1つの UPDATE で書き換えるときは、where で作った Relation に update_all を呼びます。1つ目の式は部署の無い利用者（Hana）の department_id を 3
            にします。2つ目以降は、前の節の「部署1の利用者の年齢を1ずつ増やす」操作です。update_all の前に、同じ Relation の to_sql と count で WHERE と対象の行の数を確かめています。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
User.where(department_id: nil).update_all(department_id: 3)
  User Update All (10.7ms)  UPDATE \`users\` SET \`users\`.\`department_id\` = 3 WHERE \`users\`.\`department_id\` IS NULL
# => 1
rel = User.where(department_id: 1); rel.to_sql
# => "SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`department_id\` = 1"
rel.count
  User Count (0.4ms)  SELECT COUNT(*) FROM \`users\` WHERE \`users\`.\`department_id\` = 1
# => 3
rel.update_all("age = age + 1")
  User Update All (9.1ms)  UPDATE \`users\` SET age = age + 1 WHERE \`users\`.\`department_id\` = 1
# => 3
`}
          />
          <p>
            update_all は Relation の条件を WHERE にした UPDATE を1回だけ送り、変わった行の数を返します。行を読み込まず、User のインスタンスも作らないので、バリデーションもコールバック（保存や削除の前後に実行するように登録した処理）も実行しません。updated_at
            の列も自動では書き換えません
            <Ref n={25} />。文字列を渡すとそのまま SET に入るので、<code>age = age + 1</code> のように今の値を使って書き換えられます。
          </p>
          <h3>WHERE の無い更新</h3>
          <p>
            Relation に条件が無ければ、update_all は WHERE の無い UPDATE を送ります。ここではトランザクションの中で実行し、ActiveRecord::Rollback で取り消しました。transaction
            のブロックの中で ActiveRecord::Rollback を raise すると、Active Record はブロックの中で送った変更を ROLLBACK で取り消し、この例外をブロックの外には伝えません。次のログでは、2つの式のどちらも最後が
            ROLLBACK で、行は書き換わっていません。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
ActiveRecord::Base.transaction { User.update_all(age: 0); raise ActiveRecord::Rollback }
  TRANSACTION (0.2ms)  BEGIN
  User Update All (0.9ms)  UPDATE \`users\` SET \`users\`.\`age\` = 0
  TRANSACTION (7.3ms)  ROLLBACK

ActiveRecord::Base.transaction { User.update(age: 30); raise ActiveRecord::Rollback }
  TRANSACTION (0.3ms)  BEGIN
  User Load (8.8ms)  SELECT \`users\`.* FROM \`users\`
  User Update (1.0ms)  UPDATE \`users\` SET \`users\`.\`age\` = 30 WHERE \`users\`.\`id\` = 1
  User Update (0.5ms)  UPDATE \`users\` SET \`users\`.\`age\` = 30 WHERE \`users\`.\`id\` = 2
  （中略。id 3〜7 も同じ）
  User Update (0.3ms)  UPDATE \`users\` SET \`users\`.\`age\` = 30 WHERE \`users\`.\`id\` = 8
  TRANSACTION (11.6ms)  ROLLBACK
`}
          />
          <p>
            <code>User.update_all(age: 0)</code> は <code>UPDATE `users` SET `users`.`age` = 0</code> を送り、条件を付け忘れるとすべての行が書き換わることが分かります。クラスの update に id
            を渡さずに属性だけを渡した場合も、すべての行が対象です。<code>User.update(age: 30)</code> は全員を読み込み、1行ずつ update します
            <Ref n={29} />。1行だけを書き換えるつもりなら、<code>User.update(1, age: 23)</code> のように id を渡すか、find で読んでから update します。
          </p>
        </>
      ),
    },
    {
      id: 'delete',
      title: 'DELETE で行を削除する',
      body: (
        <>
          <p>
            DELETE は行を削除する文です。DELETE FROM の後にテーブル名を書き、WHERE で削除する行を指定します。WHERE を省くと、すべての行が削除の対象になります
            <Ref n={8} />
            <Ref n={15} />。
          </p>
          <Code
            lang="sql"
            code={`
DELETE FROM users WHERE id = 8;
SELECT * FROM users;
`}
          />
          <p>
            実行欄の Example「参照のない行を削除」は、注文も口座も持たない Hana（id 8）を削除してから users を表示します。変更行数は 1 で、結果 2 は Hana のいない7行です。次に Example
            の「外部キー制約を試す」（<code>DELETE FROM users WHERE id = 1;</code>）を実行すると、「FOREIGN KEY constraint failed」で失敗し、「SQLは完了しませんでした」と表示されます。Alice
            の行は残ったままです。
          </p>
          <SqlLab lesson="DELETE" title="SQL を実行する：DELETE" />
          <p>
            Alice は orders の id 1・2 と accounts の id 1 から user_id で参照されています。Alice を消すと、それらの行（子の行）は存在しない利用者（親の行）を指すことになるので、外部キーの制約が削除を拒否しました。INSERT
            の節で存在しない部署 99 を指す行の追加を拒否したのと同じ規則です。
          </p>
          <p>
            次の図は、実行欄で試した2つの DELETE と、users の行を参照する orders・accounts の行を並べたものです。中央の users の行から見てください。Alice の行は右の3行から参照され、Hana
            の行はどの行からも参照されていません。
          </p>
          <Figure
            title="Alice を参照する子の行と2つの DELETE"
            caption="サンプル DB の初期状態の模式図。破線の矢印は外部キーの参照（子の行の user_id → 親の行の id）を表す。users のほかの6行と、Alice 以外を参照する子の行は省略した。"
          >
            <DeleteParentFigure />
          </Figure>
          <p>
            削除のときの動作は外部キーを作るときの ON DELETE で変えられます。何も書かなければ、MySQL は参照されている親の行の削除を拒否します（NO ACTION。InnoDB では RESTRICT と同じ）。CASCADE
            を書くと子の行も一緒に削除し、SET NULL を書くと子の行の外部キーの列を NULL にします
            <Ref n={16} />。サンプル DB は ON DELETE を書いていないので、削除は拒否されます。
          </p>
          <p>
            WHERE を省いた <code>DELETE FROM users;</code> も外部キーのエラーで失敗します。続けて <code>SELECT COUNT(*) FROM users;</code>{' '}
            を実行すると、参照されていない行も含めて1行も削除されていないことが分かります。参照されていないテーブルなら、WHERE の無い DELETE はすべての行を削除します。未払い（status が pending）の注文だけを削除するなら、WHERE
            を付けます。
          </p>
          <Code
            lang="sql"
            code={`
DELETE FROM orders WHERE status = 'pending';
SELECT * FROM orders;
`}
          />
          <p>変更行数は 2 で、orders には status が paid の4行が残ります。試した後は「サンプルDB初期化」で元に戻せます。</p>
          <p>
            SQLite は外部キーの検査を既定では行わず、接続ごとに <code>PRAGMA foreign_keys = ON</code> で有効にします
            <Ref n={6} />。MySQL の InnoDB は foreign_key_checks が有効（既定）の間、外部キーを検査します
            <Ref n={16} />。foreign_key_checks は MySQL の設定の名前です。mysql コマンドで Alice を削除すると、次のエラーになりました。
          </p>
          <Code
            lang="text"
            title="mysql コマンドで実行（MySQL 8.4.13）"
            code={`
mysql> DELETE FROM users WHERE id = 1;
ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails
(\`ch35\`.\`accounts\`, CONSTRAINT \`fk_rails_b1e30bebc8\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`))
`}
          />
          <p>
            INSERT の節のエラーは child row（子の行）の追加を拒否したもので、このエラーは parent row（親の行）の削除を拒否したものです。括弧の中は削除を止めた制約で、accounts の
            user_id が users の id を指す外部キーが表示されています。このメッセージから、Alice を参照する行が accounts にあると分かります。orders にも Alice
            を参照する行がありますが、メッセージに表示されたのは accounts の制約だけです。
          </p>
        </>
      ),
    },
    {
      id: 'delete-rails',
      title: 'destroy・delete・delete_all・destroy_all',
      body: (
        <>
          <p>まず、1行を削除する destroy と delete を比べます。サンプル DB を初期化した状態から実行しました。</p>
          <Code
            lang="text"
            title={RUN}
            code={`
hana = User.find(8); hana.destroy
  User Load (0.6ms)  SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`id\` = 8 LIMIT 1
  TRANSACTION (0.2ms)  BEGIN
  User Destroy (0.7ms)  DELETE FROM \`users\` WHERE \`users\`.\`id\` = 8
  TRANSACTION (8.6ms)  COMMIT
# => #<User id: 8, name: "Hana", email: "hana@example.com", age: 17, department_id: nil, ...>
hana.destroyed?
# => true

User.find(1).destroy
  User Load (0.4ms)  SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`id\` = 1 LIMIT 1
  TRANSACTION (0.3ms)  BEGIN
  User Destroy (1.7ms)  DELETE FROM \`users\` WHERE \`users\`.\`id\` = 1
  TRANSACTION (6.7ms)  ROLLBACK
# !! ActiveRecord::InvalidForeignKey: Mysql2::Error: Cannot delete or update a parent row: a foreign key constraint fails (...)
User.find(1).destroy!
  （ログは destroy と同じ）
# !! ActiveRecord::InvalidForeignKey: Mysql2::Error: Cannot delete or update a parent row: a foreign key constraint fails (...)

User.delete(7)
  User Delete All (14.9ms)  DELETE FROM \`users\` WHERE \`users\`.\`id\` = 7
# => 1
User.where(id: 6).delete_all
  User Delete All (14.4ms)  DELETE FROM \`users\` WHERE \`users\`.\`id\` = 6
# => 1
`}
          />
          <p>
            destroy は読み込んだインスタンスに対して呼び、トランザクションの中で DELETE を送ります。戻り値は削除したインスタンスで、destroyed? が true になります。参照されている Alice
            では、外部キーのエラーが ActiveRecord::InvalidForeignKey になって ROLLBACK され、destroy! も同じ例外でした。destroy! の ActiveRecord::RecordNotDestroyed
            は、コールバックが削除を中断したときの例外です
            <Ref n={26} />。
          </p>
          <p>
            クラスの delete は id を指定して DELETE を直接送ります。行を読み込まず、コールバックも実行しません
            <Ref n={24} />。where に続ける delete_all も、条件に合う行を1つの DELETE で削除し、削除した行の数を返します
            <Ref n={25} />。
          </p>
          <h3>複数の行を削除する</h3>
          <p>
            条件に合う行をまとめて削除するメソッドは destroy_all と delete_all です。1つ目の式は未払いの注文を destroy_all で削除します。2つ目と3つ目は、条件を付けずに delete_all
            を呼んだ場合です。前の例の続きなので、users は Hana・Grace・Frank を削除した後の5行です。
          </p>
          <Code
            lang="text"
            title={RUN}
            code={`
Order.where(status: "pending").destroy_all.map(&:id)
  Order Load (0.4ms)  SELECT \`orders\`.* FROM \`orders\` WHERE \`orders\`.\`status\` = 'pending'
  TRANSACTION (0.2ms)  BEGIN
  Order Destroy (0.9ms)  DELETE FROM \`orders\` WHERE \`orders\`.\`id\` = 2
  TRANSACTION (11.4ms)  COMMIT
  TRANSACTION (0.2ms)  BEGIN
  Order Destroy (1.1ms)  DELETE FROM \`orders\` WHERE \`orders\`.\`id\` = 5
  TRANSACTION (28.3ms)  COMMIT
# => [2, 5]

ActiveRecord::Base.transaction { p Order.delete_all; raise ActiveRecord::Rollback }
  TRANSACTION (0.3ms)  BEGIN
  Order Delete All (0.8ms)  DELETE FROM \`orders\`
4
  TRANSACTION (3.4ms)  ROLLBACK

User.delete_all
  User Delete All (4.8ms)  DELETE FROM \`users\`
# !! ActiveRecord::InvalidForeignKey: Mysql2::Error: Cannot delete or update a parent row: a foreign key constraint fails (...)
User.count
  User Count (0.8ms)  SELECT COUNT(*) FROM \`users\`
# => 5
`}
          />
          <p>
            destroy_all は条件に合う行を SELECT で読み込み、1行ずつ destroy します。1行ごとに BEGIN と COMMIT があるので、途中の行の削除が失敗しても、それより前に削除した行は削除されたままです。全体をまとめて確定させたいときは
            transaction のブロックで囲みます（<ChapterLink n={15} section="transaction" />
            ）。行の数だけ SQL を送るので、多くの行を削除するときは時間がかかります
            <Ref n={25} />。
          </p>
          <p>
            delete_all は DELETE を1つ送るだけです。条件の無い <code>Order.delete_all</code> は <code>DELETE FROM `orders`</code> で残りの4行をすべて削除しました（ロールバックしています）。ログの間にある 4 は、p が表示した delete_all の戻り値（削除した行の数）です。
            <code>User.delete_all</code> は外部キーのエラーで失敗し、users は1行も削除されませんでした（User.count の 5 は Hana・Frank・Grace を削除した後の行の数）。
          </p>
          <h3>dependent とコールバック</h3>
          <p>
            destroy と delete の違いは、コールバックを実行するかどうかです
            <Ref n={24} />。has_many に dependent: :destroy を付けると、親の行を destroy するときに、関連する子の行も destroy するコールバックが登録されます
            <Ref n={27} />。User の orders と accounts に付けて、Alice を destroy しました（ロールバックしています）。
          </p>
          <Code
            lang="text"
            title={`${RUN}（User に has_many :orders, dependent: :destroy と has_many :accounts, dependent: :destroy を書いた）`}
            code={`
ActiveRecord::Base.transaction { User.find(1).destroy; raise ActiveRecord::Rollback }
  TRANSACTION (1.3ms)  BEGIN
  User Load (1.6ms)  SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`id\` = 1 LIMIT 1
  Order Load (16.8ms)  SELECT \`orders\`.* FROM \`orders\` WHERE \`orders\`.\`user_id\` = 1
  Order Destroy (11.3ms)  DELETE FROM \`orders\` WHERE \`orders\`.\`id\` = 1
  Order Destroy (1.2ms)  DELETE FROM \`orders\` WHERE \`orders\`.\`id\` = 2
  Account Load (0.7ms)  SELECT \`accounts\`.* FROM \`accounts\` WHERE \`accounts\`.\`user_id\` = 1
  Account Destroy (2.8ms)  DELETE FROM \`accounts\` WHERE \`accounts\`.\`id\` = 1
  User Destroy (0.5ms)  DELETE FROM \`users\` WHERE \`users\`.\`id\` = 1
  TRANSACTION (4.9ms)  ROLLBACK
User.delete(1)
  User Delete All (14.3ms)  DELETE FROM \`users\` WHERE \`users\`.\`id\` = 1
# !! ActiveRecord::InvalidForeignKey: Mysql2::Error: Cannot delete or update a parent row: a foreign key constraint fails (...)

# has_many :orders, dependent: :restrict_with_error に変えた後
carol = User.find(3); carol.destroy
  User Load (3.3ms)  SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`id\` = 3 LIMIT 1
  TRANSACTION (0.3ms)  BEGIN
  Order Exists? (6.3ms)  SELECT 1 AS one FROM \`orders\` WHERE \`orders\`.\`user_id\` = 3 LIMIT 1
  TRANSACTION (0.4ms)  ROLLBACK
# => false
carol.errors.full_messages
# => ["Cannot delete record because dependent orders exist"]
`}
          />
          <p>
            destroy は Alice の注文2件と口座1件を1行ずつ削除してから Alice を削除しました。User.delete(1) はコールバックを実行しないので、子の行が残ったまま削除しようとして外部キーのエラーになります。dependent:
            :restrict_with_error にすると、子の行があるときは削除せずに false を返し、errors に理由を入れます
            <Ref n={27} />。
          </p>
          <p>更新と削除のメソッドを、行を読み込むかどうかで分けると図 17-6 のようになります。</p>
          <Figure n="17-6" title="モデルを通すメソッドと SQL を直接送るメソッド" caption="この節と「update! と update_all」の節の実行結果をまとめた模式図。">
            <TwoPathsFigure />
          </Figure>
          <p>
            戻り値は、update! が true、update_all が変わった行の数、destroy が削除したインスタンス、delete と delete_all が削除した行の数、destroy_all が削除したインスタンスの配列です。
          </p>
          <p>
            コールバックを通らないメソッドの一覧と、counter_cache などへの影響は<ChapterLink n={14} section="skip" />で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'check-sql',
      title: '送る SQL と対象の行を確かめる',
      body: (
        <>
          <p>UPDATE と DELETE は条件を間違えると多くの行を一度に変えるので、コードが送る SQL と対象の行を次の方法で確かめます。</p>
          <ul>
            <li>where・order・select などで作った Relation は SQL を送らない to_sql で確かめます。</li>
            <li>呼んだ時点で SQL を送る update_all と delete_all は、同じ Relation の to_sql と count で WHERE と行の数を確かめてから呼びます。</li>
            <li>create! や update! などが送る SQL は、開発環境のログ（log/development.log）や bin/rails console の表示で確かめます。</li>
            <li>
              データを残さずに試すときは、transaction のブロックの中で実行して ActiveRecord::Rollback で取り消すか、bin/rails console --sandbox を使います。--sandbox
              のコンソールはデータベースへの操作をトランザクションで囲み、終了するときにロールバックします
              <Ref n={31} />。
            </li>
          </ul>
          <p>
            SQL の実行計画を確かめる explain は<ChapterLink n={37} section="explain-rails" />と<ChapterLink n={12} section="explain" />で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>
            テーブルの1行が1件のデータ、列が項目です。主キーは行を1つに特定し、外部キーは別のテーブルの行を指します。NULL は値が無いことを表し、0 とも空の文字列とも違います。
          </li>
          <li>SELECT の結果の順は、ORDER BY が無ければ保証されません。</li>
          <li>WHERE は条件が TRUE の行だけを残します。NULL との比較は UNKNOWN になるので、NULL は IS NULL で探します。AND と OR を混ぜるときは括弧を付けます。</li>
          <li>
            where のハッシュの条件は nil を IS NULL にしますが、文字列の <code>?</code> に nil を渡すと <code>= NULL</code> になります。値はプレースホルダーかハッシュで渡します。
          </li>
          <li>NOT NULL・外部キー・CHECK の違反は MySQL が例外にし、バリデーションの違反は INSERT・UPDATE を送る前に止まります。どちらかを通らない経路があるので、両方を使います。</li>
          <li>UPDATE と DELETE は、WHERE を省くとすべての行が対象です。同じ条件の SELECT や count・to_sql で対象を確かめてから実行します。</li>
          <li>update_all・delete・delete_all は SQL を1つ送るだけで、バリデーションもコールバックも実行しません。destroy と destroy_all はコールバック（dependent を含む）を実行します。</li>
          <li>外部キーは存在しない行を指す行の追加と、参照されている行の削除を拒否します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'sql.js', publisher: 'sql.js', url: 'https://sql.js.org/documentation/', accessed: '2026-11-20', version: 'sql.js 1.13.0（SQLite 3.49.1）', note: '実行欄で SQLite を動かすライブラリ。SQLite のバージョンは実行欄の sqlite_version() で確認した。' },
    { title: 'node-sql-parser', publisher: 'taozhi8833998（GitHub）', url: 'https://github.com/taozhi8833998/node-sql-parser', accessed: '2026-11-20', version: '5.3.8', note: '実行欄の「記述順」と「論理的な処理順」に使う、MySQL の文法での SQL の解析。' },
    { title: 'SELECT', publisher: 'SQLite Documentation', url: 'https://sqlite.org/lang_select.html', accessed: '2026-11-20', version: 'SQLite 3.49', note: 'ORDER BY の無い SELECT の行の順は未定義であること。ASC と DESC を書かなければ昇順になること。' },
    { title: 'Datatypes In SQLite', publisher: 'SQLite Documentation', url: 'https://sqlite.org/datatype3.html', accessed: '2026-11-20', version: 'SQLite 3.49', note: 'INTEGER の列に整数として読めない文字列を入れると TEXT として保存されること。既定の照合順序 BINARY が memcmp で比べること。' },
    { title: 'SQLite Autoincrement', publisher: 'SQLite Documentation', url: 'https://sqlite.org/autoinc.html', accessed: '2026-11-20', version: 'SQLite 3.49', note: 'INTEGER PRIMARY KEY の列が ROWID の別名になること。新しい行に最大の ROWID より1大きい値を割り当て、削除した行の ROWID が再び使われることがあること。' },
    { title: 'SQLite Foreign Key Support', publisher: 'SQLite Documentation', url: 'https://sqlite.org/foreignkeys.html', accessed: '2026-11-20', version: 'SQLite 3.49', note: '外部キーの検査が既定では無効で、接続ごとに PRAGMA foreign_keys = ON で有効にすること。' },
    { title: 'UPDATE', publisher: 'SQLite Documentation', url: 'https://sqlite.org/lang_update.html', accessed: '2026-11-20', version: 'SQLite 3.49', note: 'WHERE の無い UPDATE がすべての行を書き換えること。' },
    { title: 'DELETE', publisher: 'SQLite Documentation', url: 'https://sqlite.org/lang_delete.html', accessed: '2026-11-20', version: 'SQLite 3.49', note: 'WHERE の無い DELETE がすべての行を削除すること。' },
    { title: 'SELECT Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/select.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'SELECT の列の指定、FROM、WHERE、ORDER BY、* がすべての列を表すこと。' },
    { title: 'Working with NULL Values', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/working-with-null.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'NULL を = や <> で比べた結果が NULL になり、IS NULL と IS NOT NULL で調べること。' },
    { title: 'LIMIT Query Optimization', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/limit-optimization.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'ORDER BY の列の値が同じ行は、実行計画によってどの順でも返り得ること。順を決めるには列を加えること。' },
    { title: 'Operator Precedence', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/operator-precedence.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'AND が OR より優先順位が高く、括弧で評価の順を変えること。' },
    { title: 'INSERT Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/insert.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'INSERT INTO … (列) VALUES (値) の書き方と、値を指定しない列に既定値が入ること。' },
    { title: 'UPDATE Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/update.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'WHERE が無ければすべての行が更新されること。実行例は MySQL 8.4.13 で実測。' },
    { title: 'DELETE Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/delete.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'WHERE が無ければすべての行が削除されること。' },
    { title: 'FOREIGN KEY Constraints', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'ON DELETE を書かなければ NO ACTION（InnoDB では RESTRICT と同じ）で親の行の削除を拒否すること。CASCADE と SET NULL。foreign_key_checks が既定で有効であること。' },
    { title: 'AUTO_INCREMENT Handling in InnoDB', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-auto-increment-handling.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'ロールバックした INSERT が割り当てた値は再び使われず、値に抜けができること。最大値を記録して、割り当てた値の再利用を防ぐこと。' },
    { title: 'Server SQL Modes', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/sql-mode.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: '既定の SQL モードに STRICT_TRANS_TABLES が含まれ、strict モードでは不正な値や足りない値がエラーになって文が取り消されること。' },
    { title: 'Case Sensitivity in String Searches', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/case-sensitivity.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: '既定の文字セットと照合順序が utf8mb4 と utf8mb4_0900_ai_ci で、文字列の比較が大文字と小文字を区別しないこと。' },
    { title: 'CHECK Constraints', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'CHECK 制約を INSERT と UPDATE で評価し、FALSE になるとエラーにすること。' },
    { title: 'Active Record Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_basics.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'モデルのクラス名を複数形にしたテーブルを使うこと。インスタンスが1行を表すこと。' },
    { title: 'Active Record Query Interface', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'プレースホルダー、select、pluck、order、NULL を許す列に対する where.not の動作。' },
    { title: 'Active Record Validations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_validations.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'モデルのバリデーションと、ほかのアプリケーションが使う場合のデータベースの制約。presence が blank? で判定すること。バリデーションを実行しないメソッドと save(validate: false)。' },
    { title: 'Active Record Callbacks', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_callbacks.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'delete・delete_all・update_all などがコールバックを実行しないこと。destroy のコールバックは delete では実行されないこと。' },
    { title: 'ActiveRecord::Relation', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Relation.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'update_all がインスタンスを作らずコールバックとバリデーションを実行せず、updated_at を更新しないこと。delete_all が1つの DELETE で dependent を考慮しないこと。destroy_all が1件ずつ destroy すること。' },
    { title: 'ActiveRecord::Persistence', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Persistence.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'update! が save! を呼ぶこと。destroy! がコールバックで中断したときに RecordNotDestroyed を投げること。delete がコールバックを実行しないこと。' },
    { title: 'ActiveRecord::Associations::ClassMethods（has_many の :dependent）', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Associations/ClassMethods.html', accessed: '2026-11-20', version: 'Rails 8.1', note: ':dependent がコールバックとして実装され、:destroy・:delete_all・:nullify・:restrict_with_exception・:restrict_with_error などを指定できること。' },
    { title: 'activerecord/lib/active_record/sanitization.rb（157〜163行目）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/sanitization.rb#L157-L163`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'MySQL ではプレースホルダーの数値を文字列としてクォートし、問い合わせを書き換える攻撃を防ぐというコメント。値の変換は connection_adapters/mysql/quoting.rb の cast_bound_value。' },
    { title: 'activerecord/lib/active_record/persistence.rb（105〜132行目）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L105-L132`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'クラスの update が id を省くとすべての行を対象にし、1行ずつ UPDATE を実行すること。' },
    { title: 'railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/configuration.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'load_defaults 5.0 で belongs_to_required_by_default が true に、7.0 で partial_inserts が false になること。' },
    { title: 'The Rails Command Line（bin/rails console --sandbox）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/command_line.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'sandbox モードがデータベースへの操作をトランザクションで囲み、終了するときにロールバックすること。' },
    { title: 'Type Conversion in Expression Evaluation', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/type-conversion.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: '文字列と数値の比較が浮動小数点数の比較になること。文字列の列を整数の 0 と比べるとすべての行に合い、\'0\' と書くと合わない例。' },
  ],
}

export default ch35
