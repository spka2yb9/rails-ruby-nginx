import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 13-1 外部キーと関連のメソッド ---------- */
function ForeignKeyFigure() {
  return (
    <Svg
      id="13-1"
      w={760}
      h={290}
      label="articles テーブルの author_id 列が、authors テーブルの id を指す。外部キーを持つ Article には belongs_to :author を、Author には has_many :articles を書く。article.author は authors から id が 23 の行を1件読み、author.articles は articles から author_id が 23 の行を読む"
    >
      <T x={20} y={22} bold>
        articles テーブル
      </T>
      <Box x={20} y={38} w={360} h={30} fill="bg" />
      <Box x={20} y={68} w={360} h={30} />
      <Box x={20} y={98} w={360} h={30} />
      <Box x={272} y={68} w={108} h={60} fill="box5" accent />
      <T x={36} y={53} mono fs={12} bold>
        id
      </T>
      <T x={116} y={53} mono fs={12} bold>
        title
      </T>
      <T x={284} y={53} mono fs={12} bold>
        author_id
      </T>
      <T x={36} y={83} mono fs={12}>
        10007
      </T>
      <T x={116} y={83} fs={12}>
        関連の例
      </T>
      <T x={284} y={83} mono fs={12}>
        23
      </T>
      <T x={36} y={113} mono fs={12}>
        10008
      </T>
      <T x={116} y={113} fs={12}>
        下書き
      </T>
      <T x={284} y={113} mono fs={12}>
        23
      </T>

      <T x={520} y={22} bold>
        authors テーブル
      </T>
      <Box x={520} y={38} w={220} h={30} fill="bg" />
      <Box x={520} y={68} w={220} h={30} fill="box5" accent />
      <T x={536} y={53} mono fs={12} bold>
        id
      </T>
      <T x={604} y={53} mono fs={12} bold>
        name
      </T>
      <T x={536} y={83} mono fs={12}>
        23
      </T>
      <T x={604} y={83} fs={12}>
        山田
      </T>
      <Arrow x1={382} y1={83} x2={518} y2={83} dashed />
      <Arrow x1={382} y1={113} x2={518} y2={90} dashed />
      <T x={450} y={140} fs={11.5} tone="muted" anchor="middle">
        外部キーが相手の id を指す
      </T>

      <Box x={20} y={162} w={360} h={64} lines={['class Article < ApplicationRecord', '  belongs_to :author', 'end']} mono fs={12} align="start" />
      <Box x={420} y={162} w={320} h={64} lines={['class Author < ApplicationRecord', '  has_many :articles', 'end']} mono fs={12} align="start" />
      <T x={20} y={248} mono fs={12}>
        article.author
      </T>
      <T x={20} y={270} mono fs={11} tone="muted">
        SELECT … FROM authors WHERE id = 23 LIMIT 1
      </T>
      <T x={420} y={248} mono fs={12}>
        author.articles
      </T>
      <T x={420} y={270} mono fs={11} tone="muted">
        SELECT … FROM articles WHERE author_id = 23
      </T>
    </Svg>
  )
}

/* ---------- 図 13-2 関連を作るオブジェクト ---------- */
function ObjectsFigure() {
  return (
    <Svg
      id="13-2"
      w={760}
      h={300}
      label="Article クラスは関連ごとにリフレクションを持つ。comments は HasManyReflection、author は BelongsToReflection、tags は ThroughReflection。Article のインスタンスの association(:comments) は、初めて呼ばれたときに HasManyAssociation を作り、@association_cache に保存する。Association は owner、reflection、読み込んだ target と、読み込み済みかどうかを持つ。a.comments が返すのは CollectionProxy で、Relation のサブクラスなので where などを続けられる。a.author は BelongsToAssociation の reader で、読み込んだ Author を返す"
    >
      <Box x={20} y={20} w={250} h={110} fill="bg" lines={[]} />
      <T x={32} y={40} bold fs={12.5}>
        Article クラス（リフレクション）
      </T>
      <T x={32} y={64} mono fs={11.5}>
        comments: HasManyReflection
      </T>
      <T x={32} y={86} mono fs={11.5}>
        author: BelongsToReflection
      </T>
      <T x={32} y={108} mono fs={11.5}>
        tags: ThroughReflection
      </T>

      <Box x={20} y={160} w={250} h={120} fill="bg" lines={[]} />
      <T x={32} y={180} bold fs={12.5}>
        Article のインスタンス
      </T>
      <T x={32} y={204} mono fs={11.5}>
        @association_cache
      </T>
      <T x={44} y={228} mono fs={11.5}>
        :comments → HasManyAssociation
      </T>
      <T x={44} y={252} mono fs={11.5}>
        :author → BelongsToAssociation
      </T>

      <Box x={340} y={150} w={200} h={140} fill="box" lines={[]} />
      <T x={352} y={170} bold fs={12} mono>
        HasManyAssociation
      </T>
      <T x={352} y={194} mono fs={11.5}>
        owner（記事）
      </T>
      <T x={352} y={216} mono fs={11.5}>
        reflection
      </T>
      <T x={352} y={238} mono fs={11.5}>
        target（読んだレコード）
      </T>
      <T x={352} y={260} mono fs={11.5}>
        loaded?
      </T>
      <Arrow x1={272} y1={228} x2={338} y2={228} dashed />
      <Arrow x1={440} y1={148} x2={200} y2={132} dashed />
      <T x={330} y={126} fs={11} tone="muted">
        reflection を参照
      </T>

      <Box x={580} y={150} w={160} h={70} lines={['a.comments', 'CollectionProxy', '（Relation のサブクラス）']} mono fs={11} fill="box5" subTone="muted" />
      <Arrow x1={542} y1={185} x2={578} y2={185} />
      <Box x={580} y={236} w={160} h={54} lines={['a.author', 'Author のレコード']} mono fs={11} fill="box4" subTone="muted" />
      <T x={580} y={140} fs={11} tone="muted">
        reader が返すもの
      </T>
    </Svg>
  )
}

/* ---------- 図 13-3 読み込み方式と SQL の回数 ---------- */
function StrategiesFigure() {
  const rows = [
    { name: '何もしない（N+1）', n: '6回', sql: ['SELECT articles … LIMIT 5', 'SELECT authors WHERE id = 15 LIMIT 1', '…（記事ごとに1回、計5回）'] },
    { name: 'preload', n: '2回', sql: ['SELECT articles … LIMIT 5', 'SELECT authors WHERE id IN (15, 14, 9, 6, 20)'] },
    { name: 'eager_load', n: '1回', sql: ['SELECT articles.id AS t0_r0, …, authors.id AS t1_r0, …', 'FROM articles LEFT OUTER JOIN authors …'] },
  ]
  return (
    <Svg
      id="13-3"
      w={760}
      h={300}
      label="公開済みの記事5件とその著者を表示する場合の比較。何もしないと、記事の SELECT が1回と、著者の SELECT が記事ごとに1回で、計6回になる。preload は、記事の SELECT と、著者を IN でまとめて取る SELECT の2回になる。eager_load は、記事と著者を LEFT OUTER JOIN でつないだ1回の SELECT になり、列には t0_r0 や t1_r0 のような別名が付く"
    >
      {rows.map((r, i) => {
        const y = 14 + i * 96
        return (
          <g key={r.name}>
            <Box x={20} y={y} w={170} h={80} lines={[r.name, `SQL ${r.n}`]} fs={12.5} bold fill={i === 0 ? 'bg' : 'box'} subTone={i === 0 ? 'danger' : 'acc'} />
            <Box x={200} y={y} w={540} h={80} fill="box4" lines={[]} />
            {r.sql.map((s, j) => (
              <T key={s} x={212} y={y + 22 + j * 20} mono fs={11.5} tone={s.startsWith('…') ? 'muted' : undefined}>
                {s}
              </T>
            ))}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 13-5 includes がどちらになるか ---------- */
function IncludesFigure() {
  return (
    <Svg
      id="13-5"
      w={760}
      h={290}
      label="includes を指定した Relation が eager_load になるかは eager_loading? で決まる。eager_load を指定していれば eager_load。includes の関連が joins にも指定されているか、references に、JOIN していないテーブルが含まれていれば eager_load。それ以外は preload になる。where(authors: ...) のようにハッシュで関連のテーブルの条件を書くと、references が自動で追加されるので eager_load になる。order に authors.name のような文字列を書いた場合も同じ"
    >
      <Box x={20} y={14} w={260} h={44} lines={['eager_load を指定した', '（eager_load_values がある）']} fs={12} subTone="muted" />
      <Arrow x1={280} y1={36} x2={518} y2={36} />
      <T x={300} y={26} fs={11.5}>
        はい
      </T>
      <Arrow x1={150} y1={58} x2={150} y2={88} />
      <T x={158} y={74} fs={11.5}>
        いいえ
      </T>
      <Box x={20} y={90} w={260} h={44} lines={['includes の関連が joins にもある', '（joined_includes_values）']} fs={12} subTone="muted" />
      <Arrow x1={280} y1={112} x2={518} y2={60} />
      <T x={290} y={128} fs={11.5}>
        はい
      </T>
      <Arrow x1={150} y1={134} x2={150} y2={164} />
      <T x={158} y={150} fs={11.5}>
        いいえ
      </T>
      <Box x={20} y={166} w={260} h={56} lines={['references に JOIN していない', 'テーブルがある', '（where(authors: …) で自動追加）']} fs={12} subTone="muted" />
      <Arrow x1={280} y1={194} x2={518} y2={62} />
      <T x={290} y={210} fs={11.5}>
        はい
      </T>
      <Arrow x1={150} y1={222} x2={150} y2={246} />
      <T x={158} y={236} fs={11.5}>
        いいえ
      </T>
      <Box x={20} y={248} w={260} h={34} lines="preload（別の SELECT で IN）" fs={12} fill="box5" />
      <Box x={520} y={14} w={220} h={56} lines={['eager_load', '（LEFT OUTER JOIN の1回）']} fs={12.5} fill="box5" subTone="muted" />

      <Box x={400} y={130} w={340} h={140} fill="bg" lines={[]} />
      <T x={412} y={150} fs={12} bold>
        デモでの eager_loading? の結果
      </T>
      <T x={412} y={174} mono fs={11}>
        includes(:author) → false
      </T>
      <T x={412} y={196} mono fs={11}>
        includes(:author).where(status: …) → false
      </T>
      <T x={412} y={218} mono fs={11}>
        includes(:author).where(authors: …) → true
      </T>
      <T x={412} y={240} mono fs={11}>
        includes(:author).references(:authors) → true
      </T>
      <T x={412} y={262} mono fs={11}>
        includes(:author).order("authors.name") → true
      </T>
    </Svg>
  )
}

/* ---------- 図 13-4 JOIN の結果の行とレコード ---------- */
function JoinRowsFigure() {
  return (
    <Svg
      id="13-4"
      w={760}
      h={250}
      label="eager_load で has_many の comments を読み込むと、記事1件にコメントが3件あれば、JOIN の結果は記事の列が同じ3行になる。JoinDependency は t0_r0（記事の id）が同じ行を1件の記事にまとめ、t1_ で始まる列からコメントのレコードを作って、記事の comments の target に入れる。行が増えるので、LIMIT を付けると Rails はまず DISTINCT で記事の id を LIMIT 件取り、その id で本体の SELECT を絞る"
    >
      <T x={20} y={20} fs={12} tone="muted">
        JOIN の結果（記事1にコメント3件）
      </T>
      <Box x={20} y={30} w={80} h={26} lines="t0_r0" mono fs={11} fill="box2" rx={0} />
      <Box x={100} y={30} w={100} h={26} lines="t0_r1" mono fs={11} fill="box2" rx={0} />
      <Box x={200} y={30} w={80} h={26} lines="t1_r0" mono fs={11} fill="box2" rx={0} />
      {[
        ['1', 'タイトル', '11'],
        ['1', 'タイトル', '12'],
        ['1', 'タイトル', '13'],
      ].map((r, i) => (
        <g key={i}>
          <Box x={20} y={56 + i * 26} w={80} h={26} lines={r[0]} mono fs={11} fill="box5" rx={0} />
          <Box x={100} y={56 + i * 26} w={100} h={26} lines={r[1]} mono fs={11} fill="box5" rx={0} />
          <Box x={200} y={56 + i * 26} w={80} h={26} lines={r[2]} mono fs={11} fill="box4" rx={0} />
        </g>
      ))}
      <Arrow x1={282} y1={95} x2={398} y2={95} />
      <T x={340} y={84} fs={11} anchor="middle" mono>
        JoinDependency
      </T>
      <Box x={400} y={40} w={150} h={50} lines={['Article id=1', '（1件にまとめる）']} mono fs={11.5} fill="box5" subTone="muted" />
      <Box x={580} y={30} w={160} h={30} lines="Comment id=11" mono fs={11.5} fill="box4" />
      <Box x={580} y={66} w={160} h={30} lines="Comment id=12" mono fs={11.5} fill="box4" />
      <Box x={580} y={102} w={160} h={30} lines="Comment id=13" mono fs={11.5} fill="box4" />
      <Arrow x1={550} y1={60} x2={578} y2={46} plain />
      <Arrow x1={550} y1={65} x2={578} y2={81} plain />
      <Arrow x1={550} y1={70} x2={578} y2={116} plain />
      <T x={400} y={112} fs={11} tone="muted">
        comments の target に入れる
      </T>
      <Box x={20} y={160} w={720} h={74} fill="bg" lines={[]} />
      <T x={32} y={180} fs={11.5}>
        LIMIT 3 を付けた場合（デモでの実測）
      </T>
      <T x={32} y={202} mono fs={11}>
        ① SELECT DISTINCT `articles`.`id` FROM `articles` LEFT OUTER JOIN `comments` … LIMIT 3
      </T>
      <T x={32} y={222} mono fs={11}>
        ② SELECT … FROM `articles` LEFT OUTER JOIN `comments` … AND `articles`.`id` IN (1, 2, 3)
      </T>
    </Svg>
  )
}

const ch13: Chapter = {
  number: 13,
  part: 3,
  title: '関連と読み込み方式・N+1 問題',
  summary:
    '外部キーと has_many・belongs_to の基本的な使い方を確かめた後、has_many や belongs_to の関連が、リフレクションと Association のオブジェクトでどう表され、いつ SQL を実行するかを説明します。N+1 問題と、preload・eager_load・includes の違い、joins との使い分け、counter_cache と inverse_of、strict_loading を MySQL での実測とともに扱います。',
  goals: [
    '外部キーを持つ側に belongs_to、相手の側に has_many を書く理由と、関連のメソッドが実行する SQL を説明できる',
    'belongs_to の存在の検証と、親を削除するときの dependent の選択肢を説明できる',
    'リフレクション、Association、CollectionProxy の関係を説明できる',
    '関連を読んだときに SQL が実行される時点と、N+1 問題が起きる理由を説明できる',
    '一覧画面の N+1 を SQL ログで見つけ、必要な関連の一括読み込みや件数の集計で解消できる',
    'preload と eager_load が実行する SQL の違いと、それぞれの注意点を説明できる',
    'includes が preload と eager_load のどちらになるかの判定を説明できる',
    'joins と includes の違い、counter_cache と inverse_of の効果を説明できる',
    'strict_loading で遅延読み込みを禁止する方法を説明できる',
  ],
  prerequisites: [5, 12],
  sections: [
    {
      id: 'basics',
      title: '関連の基本的な使い方',
      body: (
        <>
          <p>
            記事には著者がいて、1人の著者は複数の記事を書きます。このような1対多のつながりは、テーブルでは「多」の側（記事）に相手の id を入れる列を作って表します。この列を
            <Term en="foreign key">外部キー</Term>と呼びます。デモの articles テーブルでは <code>author_id</code> が外部キーで、MySQL の外部キー制約（存在しない著者の id を入れられないようにする
            データベースの仕組み）も付けてあります。
          </p>
          <Code
            lang="ruby"
            title="db/schema.rb（デモ、抜粋）"
            code={`
create_table "articles" do |t|
  t.string "title"
  t.bigint "author_id"
  # …（ほかの列は省略）
  t.index ["author_id"], name: "index_articles_on_author_id"
end

create_table "authors" do |t|
  t.string "name", null: false
  t.string "email", null: false
  # …
end

add_foreign_key "articles", "authors"
`}
          />
          <p>
            モデルには、外部キーを持つ側に <code>belongs_to</code> を、相手の側に <code>has_many</code> を書きます。<code>belongs_to :author</code> は「自分の <code>author_id</code>{' '}
            と同じ id を持つ authors の行」を、<code>has_many :articles</code> は「<code>author_id</code> が自分の id と同じ articles の行」を相手にします。外部キーの列名は関連の名前から決まり、
            <code>belongs_to :author</code> なら <code>author_id</code> です
            <Ref n={10} />。
          </p>
          <Code
            lang="ruby"
            title="app/models/author.rb・article.rb（デモ、抜粋）"
            code={`
class Author < ApplicationRecord
  has_many :articles
end

class Article < ApplicationRecord
  belongs_to :author, optional: true
end
`}
          />
          <Figure n="13-1" title="外部キーと関連のメソッド" caption="模式図。下段の SQL は、この節の実行結果を短く書いたもの。">
            <ForeignKeyFigure />
          </Figure>
          <h3>関連を通して読む・作る</h3>
          <p>著者を1人作り、関連のメソッドで記事を作って読みました（デモのアプリケーションで実行）。</p>
          <Code
            lang="ruby"
            code={`
author = Author.create!(name: "山田", email: "yamada@example.com")   # id は 23
author.articles.to_a      # => []
#   SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`author_id\` = 23

article = author.articles.create!(title: "関連の例")
#   BEGIN
#   INSERT INTO \`articles\` (\`title\`, …, \`author_id\`, …) VALUES ('関連の例', …, 23, …)
#   COMMIT
article.author_id         # => 23

x = Article.find(article.id)
#   SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 10007 LIMIT 1
x.author.name             # => "山田"
#   SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` = 23 LIMIT 1

author.articles.count     # => 1
#   SELECT COUNT(*) FROM \`articles\` WHERE \`articles\`.\`author_id\` = 23
author.articles.where(title: "関連の例").to_a.size   # => 1
#   SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`author_id\` = 23 AND \`articles\`.\`title\` = '関連の例'
`}
          />
          <p>
            <code>author.articles.create!</code> は、<code>author_id</code> に著者の id を入れて INSERT しました。<code>author.articles</code> には、<code>where</code>{' '}
            のように条件を続けられ、<code>count</code> は件数だけを数える SQL になります。逆向きの <code>x.author</code> は、<code>x</code> の <code>author_id</code> を使って authors
            から1件を読みます。
          </p>
          <Code
            lang="ruby"
            code={`
d = author.articles.build(title: "下書き")
d.author_id     # => 23
d.persisted?    # => false（まだ保存されていない）
d.save          # => true（ここで INSERT が実行される）

n = Article.new(title: "別の書き方", author: author)
n.author_id     # => 23
`}
          />
          <p>
            <code>build</code> は、<code>author_id</code> を入れたオブジェクトを作るだけで、保存はしません。<code>create!</code> と <code>build</code> の関係は、
            <ChapterLink n={11} section="crud" />で見た <code>create!</code> と <code>new</code> の関係と同じです。<code>belongs_to</code> の側からは、<code>author:</code>{' '}
            に相手のオブジェクトを渡すと <code>author_id</code> が設定されます。
          </p>
          <h3>belongs_to の存在の検証</h3>
          <p>
            <code>belongs_to</code> は、既定で相手のレコードが存在することを検証します
            <Ref n={10} />。デモの Comment は <code>belongs_to :article</code> なので、記事を指定しないと保存できません。
          </p>
          <Code
            lang="ruby"
            code={`
c = Comment.new(body: "x")
c.valid?                 # => false
c.errors.full_messages   # => ["Article must exist"]
`}
          />
          <p>
            デモの Article は、著者のいない記事も保存できるように <code>optional: true</code> を付けて、この検証を外しています。この検証が SQL を実行する場合があることは
            <ChapterLink n={14} section="validations" />で扱います。
          </p>
          <h3>親を削除するときの dependent</h3>
          <p>上で作った <code>author</code> には、記事が2件（10007 と 10008）残っています。この著者を削除しようとしました。</p>
          <Code
            lang="ruby"
            code={`
author.destroy
#   BEGIN
#   DELETE FROM \`authors\` WHERE \`authors\`.\`id\` = 23
#   ROLLBACK
# ActiveRecord::InvalidForeignKey: Mysql2::Error: Cannot delete or update a parent row:
#   a foreign key constraint fails (\`demo_development\`.\`articles\`, CONSTRAINT \`fk_rails_e74ce85cbc\`
#   FOREIGN KEY (\`author_id\`) REFERENCES \`authors\` (\`id\`))
`}
          />
          <p>
            MySQL の外部キー制約が DELETE を拒否し、ActiveRecord::InvalidForeignKey になりました。トランザクションは ROLLBACK で取り消され、著者も記事も残っています。外部キー制約が無いデータベースでは、この DELETE
            は成功し、存在しない著者を指す記事が残ります。著者と一緒に記事も削除するなら、<code>has_many</code> に <code>dependent: :destroy</code> を指定します。
          </p>
          <Code
            lang="ruby"
            code={`
class Author < ApplicationRecord
  has_many :articles, dependent: :destroy
end

author.destroy
#   BEGIN
#   SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`author_id\` = 23
#   DELETE FROM \`articles\` WHERE \`articles\`.\`id\` = 10007 AND …
#   DELETE FROM \`articles\` WHERE \`articles\`.\`id\` = 10008 AND …
#   DELETE FROM \`authors\` WHERE \`authors\`.\`id\` = 23
#   COMMIT
`}
          />
          <p>
            <code>dependent: :destroy</code> は、著者を削除する前に記事を読み込み、1件ずつ <code>destroy</code> します（記事ごとに ActiveStorage の添付を調べる SELECT もありましたが、省略しています）。記事のコールバックも実行されますが、記事の数だけ SQL
            が増えます。ほかに、コールバックを実行せずに1つの DELETE で消す <code>:delete_all</code>、外部キーを NULL にする <code>:nullify</code>、記事が残っていれば例外を投げて削除しない{' '}
            <code>:restrict_with_exception</code> などがあります
            <Ref n={10} />。子のレコードを親と一緒に消してよいか、残すべきかで選びます。
          </p>
          <p>
            記事とタグのような多対多のつながりは、中間のテーブル（taggings）を通す <code>has_many :through</code> で表します（
            <ChapterLink n={13} section="through">
              この章の後の節
            </ChapterLink>
            ）。次の節からは、<code>has_many</code> や <code>belongs_to</code> が定義したメソッドが、どのオブジェクトを使い、いつ SQL を実行しているかを見ていきます。
          </p>
        </>
      ),
    },
    {
      id: 'objects',
      title: '関連を表すオブジェクト',
      body: (
        <>
          <p>
            <code>has_many :comments</code> は、クラスに<Term en="reflection">リフレクション</Term>（関連の定義を表すオブジェクト）を登録し、<code>comments</code>{' '}
            などのメソッドを生成済みモジュールに定義します（<ChapterLink n={5} />）。生成された <code>comments</code> は <code>association(:comments).reader</code>{' '}
            を呼びます。<code>association</code> は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/associations.rb（53〜65行目）"
            href={`${GH}/activerecord/lib/active_record/associations.rb#L53-L65`}
            code={`
    def association(name) # :nodoc:
      association = association_instance_get(name)

      if association.nil?
        unless reflection = self.class._reflect_on_association(name)
          raise AssociationNotFoundError.new(self, name)
        end
        association = reflection.association_class.new(self, reflection)
        association_instance_set(name, association)
      end

      association
    end
`}
          />
          <p>
            関連ごとの <code>Association</code> のオブジェクトは、レコードごとに1つ作られ、<code>@association_cache</code> に保存されます。Association は、持ち主のレコード（owner）、リフレクション、読み込んだ相手（target）、読み込み済みかどうかを持ちます
            <Ref n={1} />。デモのアプリケーションで確かめました。
          </p>
          <Code
            lang="ruby"
            code={`
Article.reflect_on_association(:comments).class  # => ActiveRecord::Reflection::HasManyReflection
Article.reflect_on_association(:author).class    # => ActiveRecord::Reflection::BelongsToReflection
Article.reflect_on_association(:tags).class      # => ActiveRecord::Reflection::ThroughReflection
a = Article.find(1)
a.association(:comments).class   # => ActiveRecord::Associations::HasManyAssociation
a.comments.class                 # => Comment::ActiveRecord_Associations_CollectionProxy
a.comments.is_a?(ActiveRecord::Relation)  # => true
a.comments.to_sql  # => "SELECT \`comments\`.* FROM \`comments\` WHERE \`comments\`.\`article_id\` = 1"
`}
          />
          <p>
            <code>a.comments</code> が返す CollectionProxy は Relation のサブクラスです（<code>collection_proxy.rb</code> の 31 行目）。そのため <code>a.comments.where(...)</code>{' '}
            のように条件を続けられ、この時点ではまだ SQL を実行しません。belongs_to の <code>a.author</code> は、未読み込みなら <code>reload</code> で読み込んでから相手のレコードを返します（
            <code>singular_association.rb</code> の 7〜15 行目）。
          </p>
          <Figure n="13-2" title="関連を表すオブジェクト" caption="上の実行結果と associations.rb・association.rb を読んでまとめた模式図。">
            <ObjectsFigure />
          </Figure>
          <p>関連の相手を読み込む処理は次のとおりです。</p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/associations/association.rb（260〜286行目）"
            href={`${GH}/activerecord/lib/active_record/associations/association.rb#L260-L286`}
            code={`
        def find_target(async: false)
          if violates_strict_loading?
            Base.strict_loading_violation!(owner: owner.class, reflection: reflection)
          end

          scope = self.scope
          if skip_statement_cache?(scope)
            if async
              return scope.load_async.then(&:to_a)
            else
              return scope.to_a
            end
          end

          sc = reflection.association_scope_cache(klass, owner) do |params|
            as = AssociationScope.create { params.bind }
            target_scope.merge!(as.scope(self))
          end

          binds = AssociationScope.get_bind_values(owner, reflection.chain)
          klass.with_connection do |c|
            sc.execute(binds, c, async: async) do |record|
              set_inverse_instance(record)
              set_strict_loading(record)
            end
          end
        end
`}
          />
          <p>
            <ChapterLink n={12} />の <code>find</code> と同じく、関連ごとに文キャッシュを作り、owner の外部キーなどの値を当てはめて実行します。読み込んだ各レコードには、逆向きの関連（
            <code>set_inverse_instance</code>）と strict_loading の設定を引き継ぎます
            <Ref n={1} />。
          </p>
        </>
      ),
    },
    {
      id: 'n-plus-one',
      title: 'N+1 問題',
      body: (
        <>
          <p>
            関連のデータを必要になった時点で取得することを、遅延読み込みと呼びます。記事の一覧を取得しただけでは、各記事の著者まで読み込まれているとは限りません。ループの中で未読み込みの author を参照すると、記事ごとに著者を取得する SQL が実行されます。公開済みの記事5件の著者名を表示するコードで確かめました。
          </p>
          <Code
            lang="text"
            code={`
Article.where(status: :published).limit(5).each { |x| x.author&.name }   # SQL 6回
  [Article Load] SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`status\` = 1 LIMIT 5
  [Author Load]  SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` = 15 LIMIT 1
  [Author Load]  SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` = 14 LIMIT 1
  [Author Load]  SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` = 9 LIMIT 1
  [Author Load]  SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` = 6 LIMIT 1
  [Author Load]  SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` = 20 LIMIT 1
`}
          />
          <p>
            一覧の1回（1）と、記事ごとの著者の読み込み（N）を合わせて N+1 回の SQL になります。これを<Term en="N+1 queries">N+1 問題</Term>と呼びます。1回あたりは速くても、件数が増えるとその分だけ往復の回数が増え、応答時間が長くなります。対策は、一覧を読み込むときに関連もまとめて読み込むことで、Rails
            には preload、eager_load、includes の3つの方法があります。
          </p>
          <Figure n="13-3" title="読み込み方式と SQL の回数" caption="デモのアプリケーション（MySQL 8.4.13）で、公開済みの記事5件と著者を読み込んだときの SQL。">
            <StrategiesFigure />
          </Figure>
          <p>
            図の上段では記事ごとに著者を取得していますが、中段では必要な著者をまとめて取得しています。下段は記事と著者を SQL の結合（JOIN）で同時に取得する方法です。
            この例の N は記事の件数です。著者がすべて異なり、関連をまだ読み込んでいない場合、記事20件なら21回、100件なら101回になります。
            これは仕組みから求めた回数で、新たな実測値ではありません。クエリキャッシュや取得対象によって実際の回数は変わりますが、「一覧の件数に応じて追加の問い合わせが増える」点に注目します。
            <Ref n={8} />
          </p>
          <h3>一覧画面では、取得する側で関連を指定する</h3>
          <p>
            次のコードは、記事のタイトルと著者名を並べる画面の例です。ビューは HTML を作るテンプレートで、詳しい仕組みは<ChapterLink n={16} />で扱います。
            著者名を表示する行で SQL が実行されるため、コントローラーだけを見ると N+1 を見落とします。
          </p>
          <Code lang="ruby" title="修正前：コントローラーで記事だけを取得する" code={`
@articles = Article.where(status: :published).order(:id).limit(20)
`} />
          <Code lang="erb" title="一覧のビュー：各記事の著者名を表示する" code={`
<% @articles.each do |article| %>
  <p><%= article.title %> — <%= article.author&.name %></p>
<% end %>
`} />
          <Code lang="ruby" title="修正後：表示に必要な著者をまとめて読み込む" code={`
@articles = Article.where(status: :published)
                   .order(:id).limit(20).preload(:author)
`} />
          <p>
            ビューのコードは同じです。記事を読み込むときに著者も取得済みになるので、各行の author を参照するための追加 SQL が不要になります。
            この単純な belongs_to の例では、記事が1件以上あり著者も存在するとき、記事の取得と著者の取得の計2回です。
            preload の内部処理と、includes・eager_load との違いは次の各節で説明します。
          </p>
          <Callout kind="note">
            <p>
              SQL の回数だけを最小にすればよいわけではありません。不要な関連まで読み込むと、取得する行数とメモリー使用量が増えます。
              表示に必要な関連だけを指定し、一覧の件数にも上限を設けます。JOIN では結果の行が増えることもあるため、回数に加えて処理時間や取得量を確認します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'preload',
      title: 'preload：別の SELECT でまとめて読む',
      body: (
        <>
          <p>
            <code>preload(:author)</code> は、記事を読み込んだ後に、著者を IN でまとめて読みます。<ChapterLink n={12} />の <code>exec_queries</code> の中の <code>preload_associations</code>{' '}
            がこの処理です。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation.rb（1349〜1356行目）"
            href={`${GH}/activerecord/lib/active_record/relation.rb#L1349-L1356`}
            code={`
    def preload_associations(records) # :nodoc:
      preload = preload_values
      preload += includes_values unless eager_loading?
      scope = strict_loading_value ? StrictLoadingScope : nil
      preload.each do |associations|
        ActiveRecord::Associations::Preloader.new(records: records, associations: associations, scope: scope).call
      end
    end
`}
          />
          <p>
            Preloader は、読み込んだ記事の <code>author_id</code> を集め、<code>scope.where(association_key_name =&gt; keys)</code> で相手をまとめて読み込みます（
            <code>associations/preloader/association.rb</code> の 41〜57 行目）。読み込んだ著者は、各記事の Association の target に入れられ、読み込み済みになります
            <Ref n={2} />。
          </p>
          <Code
            lang="text"
            code={`
Article.where(status: :published).limit(5).preload(:author).each { |x| x.author&.name }   # SQL 2回
  [Article Load] SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`status\` = 1 LIMIT 5
  [Author Load]  SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` IN (15, 14, 9, 6, 20)
`}
          />
          <p>
            preload の SQL はテーブルごとに独立しているので、各 SQL は単純で、関連のテーブルの条件で記事を絞り込むことはできません。IN に入る値の数は最大で記事の件数になる（重複は除かれる）ので、数万件をまとめて読み込むと大きな IN
            になります。その場合は <code>find_each</code> などで件数を区切ります。
          </p>
        </>
      ),
    },
    {
      id: 'eager-load',
      title: 'eager_load：JOIN の1回で読む',
      body: (
        <>
          <p>
            <code>eager_load(:author)</code> は、LEFT OUTER JOIN で記事と著者を1回の SELECT で読みます。デモのアプリケーションで生成された SQL は次のとおりです（列の一部を省略）。
          </p>
          <Code
            lang="sql"
            code={`
SELECT \`articles\`.\`id\` AS t0_r0, \`articles\`.\`title\` AS t0_r1, ...（articles の残りの列）,
       \`authors\`.\`id\` AS t1_r0, \`authors\`.\`name\` AS t1_r1, ...（authors の残りの列）
FROM \`articles\` LEFT OUTER JOIN \`authors\` ON \`authors\`.\`id\` = \`articles\`.\`author_id\`
WHERE \`authors\`.\`name\` = '著者3' LIMIT 3
`}
          />
          <p>
            どのテーブルのどの列かを区別するため、すべての列に <code>t0_r0</code>（0番目のテーブルの0番目の列）のような別名が付きます。結果の行からレコードを組み立てるのは JoinDependency
            です。関連のテーブルの列を WHERE や ORDER BY に使えるのが eager_load の利点です。
          </p>
          <p>
            has_many の関連を eager_load すると、記事1件に対してコメントの数だけ行ができます。JoinDependency は記事の id が同じ行を1件の記事にまとめますが、そのままでは LIMIT
            が行の数に効いてしまいます。デモのアプリケーションで <code>eager_load(:comments).limit(3)</code> を実行すると、Rails は SQL を2回に分けました。
          </p>
          <Code
            lang="text"
            code={`
Article.where(id: [1, 2, 3, 4, 5]).eager_load(:comments).limit(3).to_a
  [SQL] SELECT DISTINCT \`articles\`.\`id\` FROM \`articles\` LEFT OUTER JOIN \`comments\` ON ...
        WHERE \`articles\`.\`id\` IN (1, 2, 3, 4, 5) LIMIT 3
  [Article Eager Load] SELECT ...（列の別名）... FROM \`articles\` LEFT OUTER JOIN \`comments\` ON ...
        WHERE \`articles\`.\`id\` IN (1, 2, 3, 4, 5) AND \`articles\`.\`id\` IN (1, 2, 3)
`}
          />
          <p>まず DISTINCT で記事の id を3件決め、その id で本体の SELECT を絞っています。</p>
          <Figure n="13-4" title="JOIN の結果の行とレコード" caption="模式図。下段の SQL はデモのアプリケーションでの実測（列の別名は省略）。">
            <JoinRowsFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'includes',
      title: 'includes の判定',
      body: (
        <>
          <p>
            <code>includes</code> は、状況に応じて preload か eager_load のどちらかになります。判定は Relation の <code>eager_loading?</code> です。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation.rb（1266〜1270行目）"
            href={`${GH}/activerecord/lib/active_record/relation.rb#L1266-L1270`}
            code={`
    def eager_loading?
      @should_eager_load ||=
        eager_load_values.any? ||
        includes_values.any? && (joined_includes_values.any? || references_eager_loaded_tables?)
    end
`}
          />
          <p>
            includes の関連が <code>joins</code> にも指定されているか、<code>references</code> に、JOIN していないテーブルの名前が入っていれば eager_load になります
            <Ref n={3} />。<code>references</code> は自分で書くこともできますが、<code>where(authors: {'{ name: "著者3" }'})</code> のように関連のテーブル名をキーにしたハッシュで条件を書くと自動で追加されます。デモのアプリケーションでの結果は次のとおりです。
          </p>
          <Code
            lang="ruby"
            code={`
Article.includes(:author).where(authors: { name: "著者3" }).references_values  # => ["authors"]
Article.includes(:author).where(authors: { name: "著者3" }).eager_loading?     # => true
Article.includes(:author).where(status: :published).eager_loading?            # => false
Article.includes(:author).references(:authors).eager_loading?                 # => true
Article.includes(:author).order("authors.name").eager_loading?                # => true
`}
          />
          <Figure n="13-5" title="includes がどちらになるか" caption="Rails 8.1.4.1 の relation.rb の eager_loading? と、デモでの実行結果をまとめた図。">
            <IncludesFigure />
          </Figure>
          <p>
            includes は便利ですが、同じコードでも条件の書き方によって実行される SQL が変わります。SQL の形を決めたい場合は、preload か eager_load を明示します。
          </p>
        </>
      ),
    },
    {
      id: 'joins',
      title: 'joins との違い',
      body: (
        <>
          <p>
            <code>joins</code> は INNER JOIN を付けるだけで、関連のレコードは読み込みません。関連のテーブルの条件で絞り込むためのものです。
          </p>
          <Code
            lang="text"
            code={`
Article.joins(:author).where(authors: { name: "著者3" }).limit(2).each { |x| x.author&.name }   # SQL 3回
  [Article Load] SELECT \`articles\`.* FROM \`articles\` INNER JOIN \`authors\` ON \`authors\`.\`id\` = \`articles\`.\`author_id\`
                 WHERE \`authors\`.\`name\` = '著者3' LIMIT 2
  [Author Load]  SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` = 3 LIMIT 1
  [Author Load]  SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` = 3 LIMIT 1
`}
          />
          <p>
            JOIN した著者のデータは記事のレコードには入らないので、<code>author</code> を読むと記事ごとにもう一度 SELECT が実行されました。絞り込みと読み込みの両方が必要なら、
            <code>joins(:author).preload(:author)</code> や <code>eager_load(:author)</code> を使います。
          </p>
          <p>
            has_many を joins すると、相手の件数だけ行が増えます。デモのアプリケーションでは、<code>Article.where(id: 1..5).joins(:comments).count</code> が 6、
            <code>.distinct.count</code> が 2 でした。件数を数えるときは <code>distinct</code> を付けるか、<code>where(id: Comment.select(:article_id))</code>{' '}
            のような副問い合わせにします。
          </p>
        </>
      ),
    },
    {
      id: 'counter-inverse',
      title: 'counter_cache と inverse_of',
      body: (
        <>
          <p>
            デモの Comment には <code>belongs_to :article, counter_cache: true</code> を指定しており、articles テーブルの <code>comments_count</code>{' '}
            列にコメントの数が保存されます。<code>a.comments.size</code> は、読み込み前ならこの列の値を返します。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/associations/has_many_association.rb（80〜85行目）"
            href={`${GH}/activerecord/lib/active_record/associations/has_many_association.rb#L80-L96`}
            code={`
        def count_records
          count = if reflection.has_active_cached_counter?
            owner.read_attribute(reflection.counter_cache_column).to_i
          else
            scope.count(:all)
          end
`}
          />
          <p>
            実測では、<code>a.comments.size</code> は SQL を実行せず、<code>a.comments.count</code> は <code>SELECT COUNT(*) FROM `comments` WHERE `comments`.`article_id` = 1</code>{' '}
            を実行しました。<code>count</code> は常にデータベースに数えさせ、<code>size</code> は counter_cache や読み込み済みの target を使い、<code>length</code>{' '}
            は全件を読み込みます
            <Ref n={4} />。counter_cache の列は、コメントの作成・削除のときに Rails が UPDATE で増減します。<code>insert_all</code> や、<code>Comment.where(...).delete_all</code> のような Relation の <code>delete_all</code>{' '}
            ではコールバックが動かないので、列の値がずれます（関連の <code>article.comments.delete_all</code> は列を更新します）（<ChapterLink n={14} />）。
          </p>
          <p>
            <code>a.comments.first.article</code> は、記事をもう一度読み込みませんでした。has_many と belongs_to の名前が対応している場合、Rails は逆向きの関連を自動で見つけ（
            <code>Article.reflect_on_association(:comments).inverse_of.name</code> は <code>:article</code>）、読み込んだコメントの <code>article</code> に持ち主の記事を入れておきます。
            Rails ガイドによると、<code>:through</code> や <code>:foreign_key</code> を指定した関連や、相手側にスコープがある関連では自動で見つからないので、その場合は <code>inverse_of:</code> を明示します
            <Ref n={7} />。
          </p>
        </>
      ),
    },
    {
      id: 'through',
      title: 'has_many :through',
      body: (
        <>
          <p>
            <code>has_many :tags, through: :taggings</code> は、中間のテーブルを JOIN して相手を読み込みます。リフレクションは ThroughReflection です。
          </p>
          <Code
            lang="text"
            code={`
a.tags.to_a
  [Tag Load] SELECT \`tags\`.* FROM \`tags\` INNER JOIN \`taggings\` ON \`tags\`.\`id\` = \`taggings\`.\`tag_id\`
             WHERE \`taggings\`.\`article_id\` = 1
`}
          />
          <p>
            through の関連を preload すると、まず中間の taggings を、次に tags を、それぞれ IN で読み込みます。デモの taggings テーブルには <code>(article_id, tag_id)</code>{' '}
            の一意の複合索引があり、<code>WHERE taggings.article_id = ?</code> の検索にはこの索引の先頭の列が使えます（<ChapterLink n={12} />）。
          </p>
        </>
      ),
    },
    {
      id: 'n-plus-one-check',
      title: 'N+1 の見つけ方と、先読みしても残る問い合わせ',
      body: (
        <>
          <p>BulletでN+1の候補を通知する設定とテストでの利用は、<ChapterLink n={28} section="bullet" />で説明します。</p>
          <h3>修正前後で同じ画面の SQL を比べる</h3>
          <p>
            SQL ログで、同じ形の SELECT が id などの値だけを変えて繰り返されていないか調べます。
            一覧の表示件数を増やしたとき、その SELECT も増えるなら、ループの中で取得している箇所を探します。
            ビューや、その中から呼ぶメソッドも確認対象です。各 SQL が短時間で終わる場合でも、合計の待ち時間は増えるため、遅い SQL だけを記録するログでは見逃すことがあります。
          </p>
          <ol>
            <li>著者が異なる記事など、追加の問い合わせが現れるデータで、同じ一覧を少ない件数と多い件数で表示する。</li>
            <li>繰り返す SELECT と、その取得結果を使っているコードを対応付ける。</li>
            <li>必要な関連をまとめて読み込むよう変更し、同じデータ・表示条件で再確認する。</li>
            <li>繰り返しが減ったことに加え、表示内容が変わっていないこと、不要なデータを大量に取得していないことを確認する。</li>
          </ol>
          <p>
            同じ著者ばかりのデータでは、<ChapterLink n={12} />のクエリキャッシュによって、問い合わせの結果が再利用されることがあります。
            ログの CACHE 表示を区別し、著者が異なる場合も確かめます。コンソールで同じ記事オブジェクトを使い回すと、その関連が読み込み済みになっている場合もあるので、比較ごとに記事の取得からやり直します。
            計測の仕組みは<ChapterLink n={22} />で説明します。
          </p>
          <h3>count は、関連を先読みしても SQL を実行する</h3>
          <Code lang="ruby" title="コメントを先読みしても、記事ごとの COUNT が残る例" code={`
articles = Article.order(:id).limit(20).preload(:comments)
articles.each do |article|
  puts article.comments.count
end
`} />
          <p>
            引数やブロックのない count は、データベースに件数を問い合わせます。読み込み済みのコメントを数えたいなら size を使います。
            ただし件数しか表示しない画面で、全コメントを読み込んで数えるのは無駄です。本章で説明した counter_cache を使うか、次のように記事ごとの件数をまとめて集計します。
            <Ref n={4} /><Ref n={9} />
          </p>
          <Code lang="ruby" title="件数だけが必要な場合：表示する記事の分をまとめて集計する例" code={`
articles = Article.order(:id).limit(20).to_a
counts = Comment.where(article_id: articles.map(&:id))
                .group(:article_id).count
articles.each do |article|
  puts counts.fetch(article.id, 0)
end
`} />
          <p>
            group(:article_id).count は、記事の id をキー、コメント数を値とするハッシュを返します。コメントがない記事は集計結果に含まれないので、fetch の第2引数で 0 を使います。
            コメント本文のレコードを作らず、一覧全体の件数をまとめて取得できます。
          </p>
          <h3>先読みした関連と、実際に使う関連を一致させる</h3>
          <Code lang="ruby" title="並び順を後から加えると、別の問い合わせになる例" code={`
Article.preload(:comments).limit(20).each do |article|
  article.comments.order(:created_at).each { |comment| puts comment.id }
end
`} />
          <p>
            preload(:comments) が読み込んだものと、order で新しく組み立てた Relation は別です。上のコードは、記事ごとに並べ替え用の SQL を実行します。
            この順序で繰り返し使うなら、順序を持つ関連を定義し、その関連を先読みして参照する方法があります。
          </p>
          <Code lang="ruby" title="並び順を関連に定義する例" code={`
class Article < ApplicationRecord
  has_many :chronological_comments,
           -> { order(:created_at, :id) },
           class_name: "Comment", foreign_key: :article_id
end

# 取得側と利用側で同じ関連名を使う
Article.preload(:chronological_comments).limit(20).each do |article|
  article.chronological_comments.each { |comment| puts comment.id }
end
`} />
          <p>
            joins だけでは関連のレコードは読み込み済みになりません。また、ある関連を先読みしても、その先の関連まで自動で読み込まれるわけではありません。
            「一覧に使う取得処理」と「各行で参照する関連」を一緒に確認することが、N+1 を解消する出発点です。
          </p>
        </>
      ),
    },
    {
      id: 'strict-loading',
      title: 'strict_loading で遅延読み込みを禁止する',
      body: (
        <>
          <p>
            N+1 問題を開発中に見つけるには、<Term en="strict loading">strict_loading</Term> を使います。strict_loading を指定したレコードで、読み込まれていない関連を読もうとすると例外になります。
          </p>
          <Code
            lang="ruby"
            code={`
Article.strict_loading.first.author
# => ActiveRecord::StrictLoadingViolationError: \`Article\` is marked for strict_loading.
#    The Author association named \`:author\` cannot be lazily loaded.
`}
          />
          <p>
            strict_loading が検出するのは、関連の遅延読み込みです。ループ内で直接 find を呼ぶ場合や、上の例の count のような集計 SQL を、すべて検出する機能ではありません。
            strict_loading を有効にしても、SQL ログによる確認は必要です。<Ref n={8} />
          </p>
          <p>判定は Association の次のメソッドで行われ、章の冒頭で示した <code>find_target</code> の先頭で呼ばれます。</p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/associations/association.rb（235〜245行目）"
            href={`${GH}/activerecord/lib/active_record/associations/association.rb#L235-L245`}
            code={`
      def violates_strict_loading?
        return unless find_target?

        return if @skip_strict_loading

        return unless owner.validation_context.nil?

        return reflection.strict_loading? if reflection.options.key?(:strict_loading)

        owner.strict_loading? && !owner.strict_loading_n_plus_one_only?
      end
`}
          />
          <p>
            strict_loading は、Relation の <code>strict_loading</code>、関連の定義の <code>strict_loading: true</code>、モデルの <code>self.strict_loading_by_default = true</code>
            、アプリケーション全体の <code>config.active_record.strict_loading_by_default</code> で指定できます。<code>strict_loading!(mode: :n_plus_one_only)</code>{' '}
            は、そのレコード自身の関連の遅延読み込みは許し、関連から読み込んだレコードでさらに関連を遅延読み込みしたとき（N+1 になる読み込み）だけ例外にするモードです。違反したときの動作は{' '}
            <code>config.active_record.action_on_strict_loading_violation</code> で、既定の <code>:raise</code> のほかに、ログに出すだけの <code>:log</code> を選べます
            <Ref n={5} />。既存のアプリケーションでは、まず development で <code>:log</code> にして違反を洗い出す方法が取れます。
          </p>
          <Callout kind="v72">
            <p>
              ここで扱った関連の仕組み（Association と CollectionProxy、Preloader、eager_loading? の判定、strict_loading）は Rails 7.2.4 でも同じです。8.1 では、関連を非推奨にする{' '}
              <code>deprecated: true</code> のオプションが追加されています（<ChapterLink n={5} />）
              <Ref n={6} />。
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
            1対多のつながりは、「多」の側のテーブルに外部キー（<code>author_id</code>）を置いて表します。外部キーを持つモデルに <code>belongs_to</code>、相手に <code>has_many</code>{' '}
            を書きます。<code>belongs_to</code> は既定で相手の存在を検証し、<code>optional: true</code> で外せます。
          </li>
          <li>
            親を削除するとき、外部キー制約があれば子が残っていると削除は失敗します。<code>dependent: :destroy</code> などで子をどう扱うかを指定します。
          </li>
          <li>関連の定義はリフレクションとしてクラスに、読み込みの状態は Association としてレコードごとに保存されます。has_many の reader は Relation のサブクラスの CollectionProxy を返します。</li>
          <li>一覧を取得する1回に加え、各行で未読み込みの関連を取得すると、件数に応じて SQL が増えます。これが N+1 問題です。必要な関連を取得側でまとめて読み込みます。</li>
          <li>先読みしても count や追加の order で問い合わせが残る場合があります。実際に表示する処理の SQL ログを、修正前後で比較します。</li>
          <li>preload は別の SELECT で IN を使ってまとめて読み、eager_load は LEFT OUTER JOIN の1回で読みます。has_many の eager_load に LIMIT を付けると、DISTINCT の SQL が先に実行されます。</li>
          <li>includes は、joins や references（where のハッシュで自動追加）があれば eager_load、なければ preload になります。</li>
          <li>joins は絞り込みのためのもので、関連のレコードは読み込みません。has_many の joins は行が増えます。</li>
          <li>size は counter_cache や読み込み済みの target を使い、count は常に COUNT を実行します。名前の対応する関連は逆向きが自動で設定されます。</li>
          <li>strict_loading を使うと、読み込まれていない関連の遅延読み込みを例外やログで検出できます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'activerecord/lib/active_record/associations.rb・associations/association.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/associations/association.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'association による Association の作成とキャッシュ、find_target（文キャッシュ、逆向きの関連、strict_loading）。' },
    { title: 'activerecord/lib/active_record/associations/preloader/association.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/associations/preloader/association.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Preloader が外部キーの値を集めて where(... => keys) で読み込む処理。呼び出し元は relation.rb の preload_associations。' },
    { title: 'activerecord/lib/active_record/relation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'eager_loading? と references_eager_loaded_tables? による includes の判定。' },
    { title: 'activerecord/lib/active_record/associations/collection_association.rb・has_many_association.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/associations/has_many_association.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'size の分岐と、counter_cache の列を使う count_records。' },
    { title: 'activerecord/lib/active_record.rb・core.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/core.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'strict_loading! のモード（:all、:n_plus_one_only）と、action_on_strict_loading_violation の既定値 :raise（active_record.rb）。' },
    { title: 'activerecord/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/CHANGELOG.md`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '8.1 で関連の deprecated オプションが追加されたこと。' },
    { title: 'Active Record Associations（Bi-directional Associations）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/association_basics.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '逆向きの関連の自動検出と、:through・:foreign_key・スコープがある場合に検出されないこと。' },
    { title: 'Active Record Query Interface — Eager Loading Associations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html#eager-loading-associations', accessed: '2026-11-12', version: 'Rails 8.1', note: 'N+1、includes・preload・eager_load、strict_loading、group による件数の集計。追加例は説明用であり、新たな実測結果ではない。' },
    { title: 'ActiveRecord::Associations::CollectionProxy', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1.0/classes/ActiveRecord/Associations/CollectionProxy.html', accessed: '2026-11-12', version: 'Rails 8.1.0', note: 'count と size の違い。読み込み済みの関連の件数を size が利用すること。' },
    { title: 'Active Record Associations（belongs_to・has_many・dependent）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/association_basics.html', accessed: '2026-11-13', version: 'Rails 8.1', note: '外部キーを持つ側に belongs_to を書くこと、外部キーの列名、belongs_to が既定で相手の存在を検証し optional: true で外せること、dependent の :destroy・:delete_all・:nullify・:restrict_with_exception。' },
  ],
}

export default ch13
