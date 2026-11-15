import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 11-1 レコードの状態と、状態を変えるメソッド ---------- */
function RecordStateFigure() {
  return (
    <Svg
      id="11-1"
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

/* ---------- 図 11-2 クラス側とインスタンス側が持つもの ---------- */
function ClassInstanceFigure() {
  return (
    <Svg
      id="11-2"
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

/* ---------- 図 11-3 行から値を読むまで ---------- */
function LazyFigure() {
  return (
    <Svg
      id="11-3"
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

/* ---------- 図 11-4 3つの値と変換 ---------- */
function ThreeValuesFigure() {
  return (
    <Svg
      id="11-4"
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

/* ---------- 図 11-5 代入と変更の検出 ---------- */
function DirtyFigure() {
  return (
    <Svg
      id="11-5"
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

const ch11: Chapter = {
  number: 11,
  part: 3,
  title: 'モデルクラスと属性',
  summary:
    'レコードを作成・取得・更新・削除する基本のメソッドの戻り値と使い分けを確かめた後、ActiveRecord のモデルが列の情報をいつ読み込み、属性メソッドをどこに定義し、データベースの値を Ruby の値にいつ変換するかを、MySQL 8.4 で実測しながら説明します。型変換の規則、enum などの属性 API、変更の追跡も扱います。',
  goals: [
    'new・save・create・find・find_by・where・update・destroy の戻り値と、実行される SQL、失敗したときの動作を説明できる',
    'save と save!、find と find_by を、失敗したときに処理をどう続けるかで使い分けられる',
    'モデルのクラスとインスタンスがそれぞれどんな情報を持つかを説明できる',
    '列の情報を読み込む時点と、属性メソッドが定義される時点を説明できる',
    'データベースの行からレコードが作られ、値が読まれたときに型変換される流れを説明できる',
    'MySQL の列の型と Rails の型の対応、代入したときの変換規則を説明できる',
    'value_before_type_cast・value・value_for_database の違いを説明できる',
    '変更の追跡（changes、saved_changes）と、変更した列だけを UPDATE する仕組みを説明できる',
  ],
  prerequisites: [5, 8],
  sections: [
    {
      id: 'crud',
      title: '基本操作と使い分け',
      body: (
        <>
          <p>
            第3部では、<ChapterLink n={1} />で説明したデモのアプリケーションに著者（authors）・記事（articles）・コメント（comments）・タグ（tags、taggings）のテーブルを加え、MySQL 8.4.13
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
            内部の仕組みを見る前に、レコードを作成・取得・更新・削除する基本のメソッドについて、戻り値と実行される SQL、失敗したときの動作を確かめます。この節では、モデルに{' '}
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
            を<Term en="transaction">トランザクション</Term>（複数の SQL をまとめて確定するか、まとめて取り消す仕組み。<ChapterLink n={15} />）の中で実行し、成功すると true を返します。BEGIN で始めて COMMIT で確定しています。保存すると、データベースが採番した id がオブジェクトに入ります。
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
            を返す代わりに ActiveRecord::RecordInvalid という例外を投げます。<code>create</code> は <code>new</code> と <code>save</code> を続けて行うメソッドで、保存できたかどうかに関係なく、作ったオブジェクトを返します
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
            <code>find</code> は主キー（id）で1件を取り出し、見つからなければ ActiveRecord::RecordNotFound を投げます。コントローラーの中でこの例外が起きると、Rails は 404
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
            <code>lock_version</code> は<ChapterLink n={15} section="optimistic" />の楽観的ロックに使う列で、デモの articles テーブルにあるため一緒に更新されています。検証に失敗すると false
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
          <p>ここまでの結果をまとめると、図 11-1 と次の表のようになります。</p>
          <Figure n="11-1" title="レコードの状態と、状態を変えるメソッド" caption="この節の実行結果をまとめた模式図。破線は、検証に失敗して状態が変わらない場合を表す。">
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
                第16章の「フォームから保存まで」
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
      id: 'overview',
      title: 'クラスとインスタンスが持つもの',
      body: (
        <>
          <p>
            モデルの情報はクラスとインスタンスに分かれて保存されています。クラスはテーブルの列の情報（<code>columns_hash</code>）、属性ごとの型（<code>attribute_types</code>
            ）、新しいレコードの初期値（<code>_default_attributes</code>）を持ち、祖先には <code>title</code> などのメソッドを定義したモジュールがあります。インスタンスは、属性の値の集合（<Term en="attribute set">AttributeSet</Term>）である{' '}
            <code>@attributes</code> と、保存済みかどうかなどの状態を持ちます。
          </p>
          <Figure n="11-2" title="クラス側とインスタンス側が持つもの" caption="模式図。Rails 8.1.4.1 の model_schema.rb・attributes.rb・core.rb を読んでまとめた。">
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
            列の情報は接続プールごとのスキーマキャッシュ（<code>schema_cache</code>）から取り出します。キャッシュに無ければ、MySQL では <code>SHOW FULL FIELDS</code>{' '}
            で問い合わせます。<code>ignored_columns</code> や <code>only_columns</code> で指定した列は、ここで取り除かれます
            <Ref n={1} />。<code>load_schema</code> は Monitor で排他しており（同じファイルの 550〜562 行目）、複数のスレッドから同時に呼ばれても読み込みは1回です。
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
            <Ref n={2} />。デモのアプリケーション（development）で、起動直後に <code>Article.first</code> を実行したときの SQL を記録しました。
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
            <code>allocate</code> はインスタンスの領域を確保するだけのメソッドで、<code>initialize</code> を呼びません。データベースから読み込んだレコードでは、<code>new</code>{' '}
            のときの初期化（既定値の設定や代入）を行わず、<code>init_with_attributes</code> で属性の集合と状態を直接設定します（<code>core.rb</code> の 509〜521 行目）。after_find と
            after_initialize のコールバックはここで実行されます
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
            属性が読まれたときに初めて、その列の型の <code>deserialize</code> で Ruby の値に変換し、<code>@casted_values</code> に保存します
            <Ref n={5} />。1万件のレコードを読み込んでも、表示に使ういくつかの列しか読まなければ、残りの列の変換は行われません。
          </p>
          <Figure n="11-3" title="行から値を読むまで" caption="Rails 8.1.4.1 の persistence.rb・core.rb・attribute_set/builder.rb を読んでまとめた図。">
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
            <code>define_attribute_methods</code> が定義する <code>title</code> メソッドの中身は、次のコードで生成されます。
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
            の図 2-4 では添字 2 でしたが、第3部の Article には enum を定義したので、enum のメソッドを入れる無名のモジュールが添字 1 に入り、1つずれています）。そのため、モデルで <code>def title</code>{' '}
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
            属性の型は列の <code>sql_type</code> から接続アダプターの型の対応表で決まります。デモのアプリケーションでの結果は次のとおりです。
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
          <Figure n="11-4" title="3つの値と変換" caption="模式図。ActiveModel::Attribute の FromDatabase は deserialize、FromUser は cast を使う（attribute.rb の 181〜208 行目）。">
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
            <code>"abc"</code> は 0 になります（<code>type/integer.rb</code> の 112〜122 行目）。フォームから来た数値を検証するときは、numericality のバリデーションが{' '}
            <code>value_before_type_cast</code> を見るので、<code>"abc"</code> を誤りとして検出できます（<ChapterLink n={14} />）。
          </p>
          <Callout kind="warn">
            <p>
              日時の列は、既定では UTC で保存され、読み込むと <code>config.time_zone</code> のタイムゾーンの ActiveSupport::TimeWithZone になります。デモのアプリケーションは{' '}
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
            <code>changed?</code> は、代入による変更か、読み出した値そのものを書き換えた変更（<code>title &lt;&lt; "!"</code> のような操作）があれば真になります。後者は、元のデータベースの値と現在の値を型の{' '}
            <code>changed_in_place?</code> で比べて検出します
            <Ref n={5} />。
          </p>
          <Figure n="11-5" title="代入と変更の検出" caption="模式図。save に成功すると changes_applied が呼ばれ、forgetting_assignment で現在の値を元の値とする属性に置き換わる。">
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
              Rails 8.1 の新規アプリケーションの production では <code>config.active_record.attributes_for_inspect = [ :id ]</code> が設定されており、デモのアプリケーションでも{' '}
              <code>Article.first.inspect</code> は <code>#&lt;Article id: 1&gt;</code> だけを表示しました。ログやエラー通知に属性の値が出るのを減らす設定です。また、
              <code>config.filter_parameters</code> に入っている <code>:email</code> などに一致する属性は、<code>inspect</code> で <code>[FILTERED]</code> と表示されます。
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
  ],
}

export default ch11
