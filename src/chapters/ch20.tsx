import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const RC = 'https://github.com/rspec/rspec/blob/rspec-core-v3.13.7/rspec-core/lib/rspec/core'
const RR = 'https://github.com/rspec/rspec-rails/blob/v8.1.0/lib/rspec/rails'

/* ---------- 図 20-1 RSpec の DSL が作るもの ---------- */
function DslFigure() {
  return (
    <Svg
      id="20-1"
      w={780}
      h={290}
      label="RSpec.describe Article は RSpec::Core::ExampleGroup の子クラス RSpec::ExampleGroups::Article を作る。入れ子の describe はさらにその子クラス RSpec::ExampleGroups::Article::Comments になる。let は LetDefinitions モジュールにメソッドを定義し、クラスにはメモ化するメソッドを定義する。it は Example のオブジェクトを作ってブロックを保存する。実行時には例ごとにクラスの新しいインスタンスが作られ、before とブロックがそのインスタンスを self として実行される"
    >
      <Box x={20} y={20} w={230} h={40} lines="RSpec::Core::ExampleGroup" mono fs={11.5} fill="box" />
      <Arrow x1={135} y1={98} x2={135} y2={62} />
      <Box x={20} y={100} w={230} h={44} lines={['RSpec::ExampleGroups::Article', 'RSpec.describe Article']} mono fs={11} fill="box" subTone="muted" />
      <Arrow x1={135} y1={198} x2={135} y2={146} />
      <Box x={20} y={200} w={230} h={44} lines={['…::Article::Comments', 'describe "#comments"']} mono fs={11} fill="box" subTone="muted" />
      <T x={140} y={80} fs={10.5} tone="muted">
        継承
      </T>
      <Box x={300} y={94} w={210} h={56} lines={['LetDefinitions（include される）', 'def article', '  Article.new(…) end']} mono fs={10.5} fill="box2" subTone="muted" />
      <Arrow x1={300} y1={122} x2={252} y2={122} dashed />
      <Box x={300} y={170} w={210} h={44} lines={['クラスの article', '__memoized に保存して super']} fs={10.5} fill="box" subTone="muted" />
      <Arrow d="M300,192 L270,192 L270,140 L252,140" dashed />
      <Box x={560} y={20} w={200} h={44} lines={['it "…" do … end', 'Example（ブロックを保存）']} fs={11} fill="box4" subTone="muted" />
      <Arrow d="M558,42 L400,42 L400,60 L252,110" dashed />
      <T x={560} y={100} bold fs={12}>
        実行時（例ごと）
      </T>
      <Box x={560} y={112} w={200} h={44} lines={['ExampleGroups::Article.new', '（例ごとのインスタンス）']} fs={10.5} fill="box5" subTone="muted" />
      <Arrow x1={660} y1={156} x2={660} y2={176} />
      <Box x={560} y={178} w={200} h={44} lines={['before → ブロック', '→ after']} fs={11} fill="box" />
      <T x={560} y={244} fs={10.5} tone="muted">
        例が変わると別のインスタンスになり、
      </T>
      <T x={560} y={262} fs={10.5} tone="muted">
        let の値も @変数も引き継がれない
      </T>
    </Svg>
  )
}

/* ---------- 図 20-2 テストの種類と通る層 ---------- */
function LayersFigure() {
  const layers = ['ブラウザー（JavaScript）', 'HTTP サーバー（Puma）', 'ミドルウェア', 'ルーティング', 'コントローラー', 'ビュー', 'モデル・DB']
  const kinds = [
    { t: 'model spec', from: 6, x: 340 },
    { t: 'request spec', from: 2, x: 470 },
    { t: 'system spec', from: 0, x: 600 },
  ]
  const rowH = 34
  return (
    <Svg
      id="20-2"
      w={760}
      h={layers.length * rowH + 70}
      label="model spec はモデルとデータベースだけを通る。request spec は Rails.application をミドルウェアから呼ぶので、ミドルウェア、ルーティング、コントローラー、ビュー、モデルを通るが、HTTP サーバーとブラウザーは通らない。system spec は Capybara がブラウザーを操作し、テストのプロセスの中で起動した Puma に HTTP で要求するので、JavaScript を含むすべての層を通る"
    >
      {layers.map((l, i) => (
        <Box key={l} x={20} y={30 + i * rowH} w={260} h={rowH - 6} lines={l} fs={12} fill={i < 2 ? 'bg' : 'box'} />
      ))}
      {kinds.map((k) => (
        <g key={k.t}>
          <T x={k.x + 50} y={18} anchor="middle" bold fs={12}>
            {k.t}
          </T>
          <rect x={k.x} y={30 + k.from * rowH} width={100} height={(layers.length - k.from) * rowH - 6} rx={6} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
        </g>
      ))}
      <T x={20} y={layers.length * rowH + 50} fs={11} tone="muted">
        紫の帯：そのテストが実際に通る層（rspec-rails 8.1.0、Rails 8.1.4.1）
      </T>
    </Svg>
  )
}

/* ---------- 図 20-3 テストのトランザクション ---------- */
function RollbackFigure() {
  return (
    <Svg
      id="20-3"
      w={780}
      h={260}
      label="実行の最初に fixtures が投入され、COMMIT される。各例の前に、接続を固定して BEGIN し、例の中の保存は SAVEPOINT と RELEASE SAVEPOINT になる。外側のトランザクションが参加不可なので、RELEASE の時点で after_commit が実行される。例が終わると ROLLBACK し、次の例は fixtures だけがある状態から始まる。同じプロセスの別のスレッドも固定された接続を使うのでデータが見えるが、Sidekiq などの別のプロセスからは見えない"
    >
      <Box x={20} y={30} w={170} h={64} lines={['fixtures の投入', 'DELETE・INSERT', 'COMMIT（1回だけ）']} fs={11} fill="box4" subTone="muted" />
      {[0, 1].map((n) => {
        const x = 220 + n * 280
        return (
          <g key={n}>
            <rect x={x} y={20} width={260} height={150} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
            <T x={x + 10} y={38} bold fs={12}>
              {`例 ${n + 1}：BEGIN（接続を固定）`}
            </T>
            <Box x={x + 14} y={52} w={232} h={40} lines={['SAVEPOINT active_record_1', 'INSERT …']} mono fs={10.5} fill="box" />
            <Box x={x + 14} y={98} w={232} h={30} lines="RELEASE SAVEPOINT → after_commit" mono fs={10.5} fill="box5" />
            <T x={x + 10} y={152} bold fs={12} tone="danger">
              ROLLBACK
            </T>
          </g>
        )
      })}
      <Arrow x1={190} y1={62} x2={218} y2={62} />
      <Arrow x1={480} y1={95} x2={498} y2={95} />
      <Box x={220} y={192} w={260} h={50} lines={['同じプロセスの別のスレッド', '固定された接続を共有 → 見える']} fs={11} fill="box" subTone="muted" />
      <Box x={500} y={192} w={260} h={50} lines={['Sidekiq などの別のプロセス', '別の接続 → COMMIT 前なので見えない']} fs={11} fill="bg" subTone="muted" />
    </Svg>
  )
}

const ch20: Chapter = {
  number: 20,
  part: 4,
  title: 'テスト（RSpec 中心）',
  summary:
    'RSpec で最初の model spec と request spec を書き、実行して結果を読むところから始め、describe・it・let がどんなクラスとメソッドを作るかを、実行時の出力で確かめます。model・request・system の各テストが通る層、例ごとのトランザクションによるデータの巻き戻しとその例外、fixtures と FactoryBot の違い、ジョブとメールのテスト、Minitest との対応も扱います。',
  goals: [
    'rspec-rails を準備し、準備・実行・確認に分けた model spec を書いて実行できる',
    '失敗したときの表示から、失敗した expect・期待した値・実際の値・再実行のコマンドを読み取れる',
    'describe がクラス、it がそのインスタンスで実行されるブロック、let がメモ化されたメソッドであることを説明できる',
    'model・request・system の各テストがアプリケーションのどの層を通るかを説明できる',
    '例ごとのトランザクションの BEGIN・SAVEPOINT・ROLLBACK の流れと、after_commit が実行される理由を説明できる',
    'テストのトランザクションが届かない場合（別のプロセス、並行するトランザクション）を説明できる',
    'fixtures と FactoryBot が SQL を実行する時点の違いを説明できる',
    'ジョブとメールのテストで使うアダプターとマッチャーを説明できる',
  ],
  prerequisites: [3, 10, 15, 18],
  sections: [
    {
      id: 'first-spec',
      title: 'RSpec で最初のテストを書く',
      body: (
        <>
          <p>
            テストは、コードが期待どおりに動くことを、別のコードで確かめるものです。<ChapterLink n={11} section="crud" />で使った「タイトルが空なら保存しない」検証を例に、RSpec
            でテストを書いて実行し、失敗したときの表示を読むところまで進めます。
          </p>
          <h3>準備</h3>
          <p>
            Rails で RSpec を使うには、Gemfile の development と test のグループに rspec-rails を入れ、<code>bin/rails generate rspec:install</code> を実行します。このコマンドは{' '}
            <code>.rspec</code>、<code>spec/spec_helper.rb</code>、<code>spec/rails_helper.rb</code> を作ります
            <Ref n={8} />。
          </p>
          <Code
            lang="ruby"
            title="Gemfile（抜粋）"
            code={`
group :development, :test do
  gem "rspec-rails"
end
`}
          />
          <Code
            lang="bash"
            code={`
bundle install
bin/rails generate rspec:install
`}
          />
          <p>
            <code>rails_helper.rb</code> は、テスト用の環境（RAILS_ENV=test）で Rails を読み込みます。テストのデータベースの構造が古ければ <code>db/schema.rb</code>{' '}
            から作り直す処理と、例ごとにデータを巻き戻す設定（<ChapterLink n={20} section="transaction">この章の「トランザクションによる巻き戻し」</ChapterLink>）も入っています。モデルのテストは{' '}
            <code>spec/models/</code> に置きます。<code>bin/rails generate rspec:model Article</code> を実行すると、中身が <code>pending</code>（未実装の印）だけの{' '}
            <code>spec/models/article_spec.rb</code> が作られます
            <Ref n={8} />。
          </p>
          <h3>テストを書く</h3>
          <p>Article に <code>validates :title, presence: true</code> がある状態で、次のテストを書きました。</p>
          <Code
            lang="ruby"
            title="spec/models/article_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Article, type: :model do
  describe "#valid?" do
    it "タイトルがあれば有効" do
      article = Article.new(title: "Rails入門")

      result = article.valid?

      expect(result).to be(true)
    end

    it "タイトルが空なら無効で、title にエラーが入る" do
      article = Article.new(title: "")

      result = article.valid?

      expect(result).to be(false)
      expect(article.errors[:title]).to include("can't be blank")
    end
  end
end
`}
          />
          <ul>
            <li>
              <code>require "rails_helper"</code> は、準備で作ったファイルを読み込み、Rails とテストのデータベースを使えるようにします。
            </li>
            <li>
              <code>RSpec.describe Article, type: :model do ... end</code> は、Article についてのテストをまとめるグループです。<code>type: :model</code> は model spec であることを表し、rspec-rails
              がモデルのテスト用の機能を組み込みます
              <Ref n={9} />。
            </li>
            <li>
              内側の <code>describe "#valid?"</code> は、さらに細かいグループです。<code>#</code> を付けて「インスタンスメソッドの valid? について」を表す書き方がよく使われます。
            </li>
            <li>
              <code>it "..." do ... end</code> が1つの例（example）で、文字列には確かめる動作を書きます。1つの例が1つのテストの単位です。
            </li>
            <li>
              各例の中は、空行で「準備（オブジェクトを作る）」「実行（調べたいメソッドを呼ぶ）」「確認（結果を期待と比べる）」の3つに分けています。
            </li>
            <li>
              <code>expect(result).to be(true)</code> は「result が true であること」を確かめます。<code>to</code> の後ろの <code>be(true)</code> や <code>include(...)</code>{' '}
              を<Term en="matcher">マッチャー</Term>と呼びます。<code>be</code> は同じオブジェクトか（<code>equal?</code>）、<code>eq</code> は <code>==</code> で等しいかを調べます
              <Ref n={10} />。<code>article.errors[:title]</code> は title のエラーメッセージの配列で、<code>include</code> はその中に指定した文字列があるかを調べます。
            </li>
          </ul>
          <h3>実行する</h3>
          <Code
            lang="bash"
            code={`
$ bundle exec rspec spec/models/article_spec.rb --format documentation

Article
  #valid?
    タイトルがあれば有効
    タイトルが空なら無効で、title にエラーが入る

Finished in 0.0648 seconds (files took 1.03 seconds to load)
2 examples, 0 failures
`}
          />
          <p>
            <code>--format documentation</code> を付けると、describe と it の文字列が入れ子で表示されます。付けなければ、成功した例は <code>.</code>、失敗した例は <code>F</code>{' '}
            の1文字で表示されます。<code>2 examples, 0 failures</code> は、2つの例を実行して失敗が0件だったことを表します。
          </p>
          <h3>失敗したときの表示を読む</h3>
          <p>
            テストが本当に検証を確かめているかを知るには、意図的にコードを変更して期待した動作をしない状態にし、テストを失敗させてみます。モデルから <code>validates :title, presence: true</code> を消して実行しました。
          </p>
          <Code
            lang="text"
            code={`
Article
  #valid?
    タイトルがあれば有効
    タイトルが空なら無効で、title にエラーが入る (FAILED - 1)

Failures:

  1) Article#valid? タイトルが空なら無効で、title にエラーが入る
     Failure/Error: expect(result).to be(false)

       expected false
            got true
     # ./spec/models/article_spec.rb:18:in 'block (3 levels) in <top (required)>'

Finished in 0.03962 seconds (files took 0.97699 seconds to load)
2 examples, 1 failure

Failed examples:

rspec ./spec/models/article_spec.rb:13 # Article#valid? タイトルが空なら無効で、title にエラーが入る
`}
          />
          <ul>
            <li>
              <code>(FAILED - 1)</code> が付いた例が失敗しました。番号は、下の <code>Failures:</code> の一覧の番号です。
            </li>
            <li>
              <code>Failure/Error:</code> の行は、失敗した expect です。<code>expected false</code> と <code>got true</code> は「false を期待したが、実際は true だった」という意味です。検証が無いので、空のタイトルでも{' '}
              <code>valid?</code> が true を返しました。
            </li>
            <li>
              <code># ./spec/models/article_spec.rb:18</code> は、失敗した expect の行です。
            </li>
            <li>
              最後の <code>rspec ./spec/models/article_spec.rb:13</code> は、失敗した例だけを実行し直すコマンドです。13 は、その例の <code>it</code> の行番号です。
            </li>
          </ul>
          <p>
            1つ目の例（タイトルがあれば有効）は、検証を消しても成功しました。成功する入力だけを確かめるテストでは、検証が無くなっても気付けません。失敗するはずの入力の例も書くのは、このためです。確かめたら検証を元に戻し、もう一度実行して{' '}
            <code>0 failures</code> になることを確認します。
          </p>
          <h3>フォームの送信を確かめる request spec</h3>
          <p>
            <ChapterLink n={16} section="form">
              第16章の「フォームから保存まで」
            </ChapterLink>
            の create アクションは、要求を送って応答を確かめる request spec でテストできます。<code>post</code> で要求を送ると、<code>response</code> に応答が入ります。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/articles_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "記事の作成", type: :request do
  it "タイトルが空なら 422 を返し、保存しない" do
    post articles_path, params: { article: { title: "" } }

    expect(response).to have_http_status(:unprocessable_content)
    expect(Article.count).to eq(0)
  end

  it "保存できたら記事の画面へリダイレクトする" do
    post articles_path, params: { article: { title: "フォームの例" } }

    article = Article.last
    expect(article.title).to eq("フォームの例")
    expect(response).to redirect_to(article_path(article))
  end
end
`}
          />
          <p>
            <code>have_http_status</code> は応答の状態コードを、<code>redirect_to</code> はリダイレクト先を確かめるマッチャーです。デモで実行すると、2つとも成功しました。<code>eq</code>{' '}
            のマッチャーが失敗したときは、たとえば <code>eq(0)</code> を <code>eq(1)</code> に変えると、
            <code>expected: 1</code>、<code>got: 0</code>、<code>(compared using ==)</code> と表示されます。request spec がミドルウェアからビューまでのどこを通るかは、
            <ChapterLink n={20} section="types">
              この章の「テストの種類と通る層」
            </ChapterLink>
            で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'dsl',
      title: 'RSpec の DSL をクラスとメソッドとして読む',
      body: (
        <>
          <p>
            前の節で使った <code>describe</code>・<code>it</code> と、<code>let</code> は、<ChapterLink n={4} />
            で見た「ブロックを受け取るメソッド」です。次の spec で、何が作られるかを表示しました。
          </p>
          <Code
            lang="ruby"
            title="spec/models/dsl_spec.rb（デモ、抜粋）"
            code={`
RSpec.describe Article do
  let(:article) { Article.new(title: "let で作成") }
  before { @before_ran = true }

  it "describe はクラス、it はそのインスタンスで実行される" do
    puts "self.class = #{self.class}"
    # …
  end

  describe "#comments" do
    it "入れ子の describe は子クラス" do
      # …
    end
  end
end
`}
          />
          <Code
            lang="text"
            code={`
  self.class                = RSpec::ExampleGroups::Article
  self.class.superclass     = RSpec::Core::ExampleGroup
  ancestors に LetDefinitions = RSpec::ExampleGroups::Article::LetDefinitions
  article の定義元          = RSpec::ExampleGroups::Article
  article.equal?(article)   = true
  @before_ran               = true
  object_id                 = 8272
（次の例）
  object_id                 = 8280
（入れ子の describe の例）
  self.class                = RSpec::ExampleGroups::Article::Comments
  self.class.superclass     = RSpec::ExampleGroups::Article
`}
          />
          <p>
            <code>describe</code> は ExampleGroup の子クラスを作り、ブロックをそのクラスの本体として <code>module_exec</code> で評価します
            <Ref n={1} />。入れ子の describe は、外側のクラスの子クラスになります。外側の <code>let</code> や <code>before</code> が内側でも使えるのは、継承しているからです。
          </p>
          <Code
            lang="ruby"
            title="rspec-core: lib/rspec/core/example_group.rb（402〜414行目）"
            href={`${RC}/example_group.rb#L402-L414`}
            code={`
      def self.subclass(parent, description, args, registration_collection, &example_group_block)
        subclass = Class.new(parent)
        subclass.set_it_up(description, args, registration_collection, &example_group_block)
        subclass.module_exec(&example_group_block) if example_group_block

        # The LetDefinitions module must be included _after_ other modules
        # to ensure that it takes precedence when there are name collisions.
        # Thus, we delay including it until after the example group block
        # has been eval'd.
        MemoizedHelpers.define_helpers_on(subclass)

        subclass
      end
`}
          />
          <p>
            <code>let(:article)</code> は、LetDefinitions モジュールにブロックをそのままメソッドとして定義し、クラスにはその結果を <code>__memoized</code> に保存するメソッドを定義します。1つの例の中で何度呼んでも同じオブジェクト（
            <code>equal?</code> が true）になるのはこのためです。
          </p>
          <Code
            lang="ruby"
            title="rspec-core: lib/rspec/core/memoized_helpers.rb（317〜344行目から抜粋）"
            href={`${RC}/memoized_helpers.rb#L306-L345`}
            code={`
          our_module = MemoizedHelpers.module_for(self)
          # …
          our_module.__send__(:define_method, name, &block)
          # …
          # Apply the memoization. The method has been defined in an ancestor
          # module so we can use \`super\` here to get the value.
          if block.arity == 1
            define_method(name) { __memoized.fetch_or_store(name) { super(RSpec.current_example, &nil) } }
          else
            define_method(name) { __memoized.fetch_or_store(name) { super(&nil) } }
          end
`}
          />
          <p>
            <code>it</code> はブロックを Example のオブジェクトに保存するだけで、実行はしません。実行するときは、例ごとにクラスの新しいインスタンスを作り、そのインスタンスを self として before とブロックを実行します（上の出力の object_id
            が例ごとに違う）。そのため、ある例で代入したインスタンス変数や let の値は、次の例には残りません（図 20-1）。
          </p>
          <Code
            lang="ruby"
            title="rspec-core: lib/rspec/core/example_group.rb（648〜659行目）"
            href={`${RC}/example_group.rb#L648-L659`}
            code={`
      def self.run_examples(reporter)
        ordering_strategy.order(filtered_examples).map do |example|
          next if RSpec.world.wants_to_quit
          instance = new(example.inspect_output)
          set_ivars(instance, before_context_ivars)
          succeeded = example.run(instance, reporter)
          if !succeeded && reporter.fail_fast_limit_met?
            RSpec.world.wants_to_quit = true
          end
          succeeded
        end.all?
      end
`}
          />
          <Figure n="20-1" title="RSpec の DSL が作るもの" caption="rspec-core 3.13.7 の example_group.rb・memoized_helpers.rb を読み、デモの出力で確かめてまとめた模式図。">
            <DslFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'types',
      title: 'テストの種類と通る層',
      body: (
        <>
          <p>
            rspec-rails は、spec の <code>type:</code>（model・request・system など）に応じて、Rails のテスト用のモジュールを include します。どのモジュールを include するかで、テストがアプリケーションのどの層から処理を呼び出すかが決まります（図
            20-2）。
          </p>
          <ul>
            <li>model spec：モデルのクラスを直接呼ぶ。コントローラーやルーティングは通らない</li>
            <li>request spec：<code>get</code>・<code>post</code> が Rails.application を Rack のアプリケーションとして呼ぶ。HTTP サーバーは通らない</li>
            <li>system spec：Capybara がブラウザー（既定では headless の Chrome）を操作し、テストのプロセスの中で起動した Puma に HTTP で要求する。JavaScript も実行される</li>
          </ul>
          <Code
            lang="ruby"
            title="rspec-rails: lib/rspec/rails/example/request_example_group.rb（コメントを除く）"
            href={`${RR}/example/request_example_group.rb`}
            code={`
    module RequestExampleGroup
      extend ActiveSupport::Concern
      include RSpec::Rails::RailsExampleGroup
      include ActionDispatch::Integration::Runner
      include ActionDispatch::Assertions
      include RSpec::Rails::Matchers::RedirectTo
      include RSpec::Rails::Matchers::RenderTemplate
      include ActionController::TemplateAssertions
      include ActionDispatch::IntegrationTest::Behavior

      def app
        ::Rails.application
      end
`}
          />
          <p>
            request spec は Rails 自身の結合テスト（ActionDispatch::IntegrationTest）と同じ仕組みです
            <Ref n={2} />。<ChapterLink n={17} section="streams" />
            のコメント投稿を request spec で確かめました。
          </p>
          <Code
            lang="text"
            code={`
  status=200 content-type=text/vnd.turbo-stream.html
  app=Demo::Application request.env の数=69 remote_ip=127.0.0.1
（存在しない記事）
  status=404
`}
          />
          <p>
            Accept ヘッダーで Turbo Stream が選ばれ、ミドルウェアからビューまでを通った応答が返っています。存在しない記事の要求が例外ではなく 404 になったのは、テスト環境の設定ファイルに{' '}
            <code>config.action_dispatch.show_exceptions = :rescuable</code> があり、ShowExceptions のミドルウェアが RecordNotFound を 404 に変えたからです（
            <ChapterLink n={10} section="exceptions" />
            ）。一方、HTTP サーバーを通らないので、Puma の設定や Nginx は request spec では確かめられません。
          </p>
          <Figure n="20-2" title="テストの種類と通る層" caption="rspec-rails 8.1.0 の example グループのモジュールと、Testing Rails Applications（ガイド）をもとにまとめた図。">
            <LayersFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'transaction',
      title: 'トランザクションによる巻き戻し',
      body: (
        <>
          <p>
            rails_helper.rb の <code>config.use_transactional_fixtures = true</code> は、各例をデータベースのトランザクションで包み、例が終わったらロールバックする設定です。テストのログを見ると、次の順に SQL
            が実行されていました。
          </p>
          <Code
            lang="text"
            code={`
  TRANSACTION (0.2ms)  BEGIN
   (0.1ms)  SET FOREIGN_KEY_CHECKS = 0
  Fixtures Load (0.7ms)  DELETE FROM \`authors\`;
INSERT INTO \`authors\` (\`id\`, \`name\`, \`email\`, …) VALUES (663665735, 'Alice', …
   (0.1ms)  SET FOREIGN_KEY_CHECKS = 1
  TRANSACTION (17.2ms)  COMMIT                       ← fixtures の投入（最初の1回だけ）
  TRANSACTION (0.1ms)  BEGIN                         ← 例 1
  Author Load (0.3ms)  SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` = 663665735 LIMIT 1
  TRANSACTION (0.3ms)  ROLLBACK
  TRANSACTION (0.2ms)  BEGIN                         ← 例 2
  TRANSACTION (0.2ms)  SAVEPOINT active_record_1
  Author Create (0.5ms)  INSERT INTO \`authors\` …
  TRANSACTION (0.2ms)  RELEASE SAVEPOINT active_record_1
  TRANSACTION (0.3ms)  SAVEPOINT active_record_1
  Article Create (0.7ms)  INSERT INTO \`articles\` …
  TRANSACTION (0.2ms)  RELEASE SAVEPOINT active_record_1
  TRANSACTION (3.9ms)  ROLLBACK
`}
          />
          <p>
            例の中の <code>create!</code> は、外側にテストのトランザクションがあるので SAVEPOINT になります（<ChapterLink n={15} section="nested" />
            ）。テストのトランザクションを始めるのは、test_fixtures.rb から呼ばれる接続プールの <code>pin_connection!</code> です
            <Ref n={6} />。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb（368〜382行目）"
            href={`${GH}/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb#L368-L382`}
            code={`
      def pin_connection!(lock_thread) # :nodoc:
        @pinned_connection ||= (connection_lease&.connection || checkout)
        @pinned_connections_depth += 1

        # Any leased connection must be in @connections otherwise
        # some methods like #connected? won't behave correctly
        unless @connections.include?(@pinned_connection)
          @connections << @pinned_connection
        end

        @pinned_connection.lock_thread = ActiveSupport::IsolatedExecutionState.context if lock_thread
        @pinned_connection.pinned = true
        @pinned_connection.verify! # eagerly validate the connection
        @pinned_connection.begin_transaction joinable: false, _lazy: false
      end
`}
          />
          <p>
            読み取れることが2つあります。1つ目は、接続が1本に固定（pin）されることです。同じプロセスの別のスレッドが接続を求めても、この接続が渡されます。2つ目は、トランザクションが <code>joinable: false</code>{' '}
            で始まることです。Rails の <code>begin_transaction</code> は、外側が参加不可（joinable でない）のときに、内側のトランザクションの終わりで after_commit を実行するように作られています（transaction.rb の{' '}
            <code>run_commit_callbacks = !current_transaction.joinable?</code>）
            <Ref n={7} />。デモで確かめました。
          </p>
          <Code
            lang="text"
            code={`
  SQL: ["SAVEPOINT active_record_1", "INSERT INTO \`articles\` …", "RELEASE SAVEPOINT active_record_1"]
  コールバック: ["after_commit"]
  transaction_open? true open_transactions=1
  同じスレッドから: 1 件 / 別のスレッドから: 1 件
（次の例）
  件数: 0
`}
          />
          <p>
            実際には COMMIT されていませんが、after_commit は実行されました。別のスレッドからも作成した行が見えたのは、固定された接続を共有しているからです。system spec でテストのスレッドと Puma
            のスレッドが同じデータを見られるのも、この仕組みによります（図 20-3）。
          </p>
          <Figure n="20-3" title="テストのトランザクション" caption="Rails 8.1.4.1 の test_fixtures.rb・connection_pool.rb・transaction.rb を読み、デモのテストのログで確かめてまとめた模式図。">
            <RollbackFigure />
          </Figure>
          <p>トランザクションによる巻き戻しが適用されない、または期待どおりに動かない場合があります。</p>
          <ul>
            <li>
              別のプロセス：Sidekiq のプロセスや、別に起動したサーバーは別の接続を使うので、COMMIT されていない行は見えません（<ChapterLink n={18} section="transaction" />
              ）。テストではジョブをテスト用のアダプターに入れ、同じプロセスで実行します（次節）
            </li>
            <li>
              並行するトランザクション：<ChapterLink n={14} section="uniqueness" />
              の一意性の競合のように、複数のスレッドが別々のトランザクションで動く処理は、1本の接続を共有するので再現できません。ガイドは、そのテストのクラスでトランザクションを無効にし（
              <code>self.use_transactional_tests = false</code>）、作ったデータを自分で消すよう説明しています
              <Ref n={3} />
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'data',
      title: 'fixtures と FactoryBot',
      body: (
        <>
          <p>
            テストのデータの用意には、YAML で書く <Term en="fixtures">フィクスチャー</Term>と、Ruby で書く FactoryBot がよく使われます。前節のログのとおり、fixtures は実行の最初に1回だけ投入されて COMMIT され、各例はそれを前提に始まります。id
            はラベル（<code>alice</code>）から計算された値（663665735）になります。FactoryBot の <code>create</code> は、例の中で毎回 INSERT します。
          </p>
          <Code
            lang="text"
            code={`
  authors(:alice) => id=663665735 SQL=["SELECT \`authors\`.* FROM \`authors\` WHERE \`authors\`.\`id\` = 663665735 LIMIT 1"]

  create(:article) SQL:
    SAVEPOINT active_record_1
    INSERT INTO \`authors\` (\`name\`, \`email\`, …) VALUES ('著者2', 'author2@example.com', …
    RELEASE SAVEPOINT active_record_1
    SAVEPOINT active_record_1
    INSERT INTO \`articles\` (\`title\`, \`body\`, …
    RELEASE SAVEPOINT active_record_1
  build_stubbed(:article) => id=1002 persisted?=true SQL=0件
`}
          />
          <p>
            <code>create(:article)</code> は、ファクトリーの <code>author</code> の行に従って著者も作りました。関連の多いファクトリーでは、1つの <code>create</code>{' '}
            が多数の INSERT になり、テストが遅くなる主な原因になります。<code>build_stubbed</code> は SQL を実行せずに、id を持ち保存済みに見えるオブジェクトを作ります。データベースを使わない処理のテストに向いています。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>fixtures</th>
                  <th>FactoryBot</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>投入の時点</td>
                  <td>実行の最初に1回（全例で共有）</td>
                  <td>例の中で create を呼ぶたび</td>
                </tr>
                <tr>
                  <td>速さ</td>
                  <td>例の数が増えても投入は1回</td>
                  <td>関連を含めて毎回 INSERT</td>
                </tr>
                <tr>
                  <td>データの見通し</td>
                  <td>全例に同じデータがあるので、件数を数えるテストで前提がずれやすい</td>
                  <td>例ごとに必要なデータだけを作る</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'jobs-mail',
      title: 'ジョブとメールのテスト',
      body: (
        <>
          <p>
            テスト環境では、ActiveJob のアダプターの既定値が <code>:test</code> です（activejob の railtie.rb に <code>Rails.env.test? ? :test : :async</code>
            ）。デモでも、テスト環境の設定ファイルにアダプターを書いていませんが、TestAdapter になっていました。TestAdapter はジョブを実行せず、投入されたジョブを配列に記録します。
          </p>
          <Code
            lang="ruby"
            title="spec/jobs/mail_spec.rb（デモ、抜粋）"
            code={`
    expect {
      ArticleMailer.with(article: FactoryBot.create(:article)).published.deliver_later
    }.to have_enqueued_mail(ArticleMailer, :published)
    expect(ActionMailer::Base.deliveries.size).to eq 0
    perform_enqueued_jobs
    # => perform_enqueued_jobs 後の deliveries = 1 subject=記事「FactoryBot の記事」を公開しました
`}
          />
          <p>
            <code>deliver_later</code> の時点ではメールは送られず、<code>perform_enqueued_jobs</code> で記録されたジョブを同じプロセスで実行すると、テスト用の配送方法（
            <code>delivery_method = :test</code>）の <code>deliveries</code> に入りました。rspec-rails は、Rails 用のすべての例に ActiveJob::TestHelper を include しています
            <Ref n={4} />。
          </p>
          <p>
            Sidekiq::Job を直接使うジョブ（<ChapterLink n={18} section="direct" />
            ）は ActiveJob を通らないので、これらのマッチャーでは確かめられません。Sidekiq の gem の <code>Sidekiq::Testing</code> を使い、fake（配列に記録）か inline（その場で実行）を選びます。
          </p>
        </>
      ),
    },
    {
      id: 'minitest',
      title: 'Minitest との対応',
      body: (
        <>
          <p>Rails の既定のテストフレームワークは Minitest で、ガイドの例も Minitest で書かれています。RSpec の書き方との主な対応は次のとおりです。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>RSpec（rspec-rails）</th>
                  <th>Minitest（Rails）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>RSpec.describe Article do … end</code>
                  </td>
                  <td>
                    <code>class ArticleTest &lt; ActiveSupport::TestCase</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>it "…" do … end</code>
                  </td>
                  <td>
                    <code>test "…" do … end</code>（<code>test_…</code> というメソッドを定義する）
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>let</code>・<code>before</code>
                  </td>
                  <td>
                    <code>setup do … end</code> でインスタンス変数に入れる
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>expect(x).to eq y</code>
                  </td>
                  <td>
                    <code>assert_equal y, x</code>
                  </td>
                </tr>
                <tr>
                  <td>request spec</td>
                  <td>ActionDispatch::IntegrationTest</td>
                </tr>
                <tr>
                  <td>system spec</td>
                  <td>ApplicationSystemTestCase（ActionDispatch::SystemTestCase）</td>
                </tr>
                <tr>
                  <td>
                    <code>have_enqueued_job</code>・<code>have_enqueued_mail</code>
                  </td>
                  <td>
                    <code>assert_enqueued_with</code>・<code>assert_enqueued_email_with</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>use_transactional_fixtures</code>
                  </td>
                  <td>
                    <code>use_transactional_tests</code>（既定で有効）
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            rspec-rails は、内部でこれらの Rails のテスト用モジュールを include して使っているので、トランザクションや fixtures の仕組みは両者で同じです。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2.4 の test_fixtures.rb と connection_pool.rb にも同じ <code>pin_connection!</code>（<code>joinable: false</code>、スレッドの共有）があり、テスト環境の ActiveJob
              のアダプターの既定値も <code>:test</code> です
              <Ref n={5} />。この章の内容は 7.2 でも同じです。
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
            spec は describe（グループ）・it（1つの例）・expect とマッチャー（確認）で書きます。成功する入力だけでなく、失敗するはずの入力の例も書き、コードに意図的な誤りを加えてテストが失敗することを確かめます。
          </li>
          <li>describe は ExampleGroup の子クラスを作り、it は例ごとに作られるそのインスタンスを self として実行されます。let は LetDefinitions モジュールのメソッドで、例の中でメモ化されます。</li>
          <li>request spec は Rails.application をミドルウェアから呼び、system spec はブラウザーと Puma を通ります。</li>
          <li>テストのトランザクションは接続を固定し、参加不可のトランザクションとして始まります。例の中の保存は SAVEPOINT になり、after_commit も実行され、最後に ROLLBACK されます。</li>
          <li>同じプロセスのスレッドは固定された接続を共有しますが、別のプロセスからは COMMIT 前のデータは見えません。並行するトランザクションのテストはトランザクションを無効にします。</li>
          <li>fixtures は最初に1回投入され、FactoryBot の create は例ごとに関連を含めて INSERT します。</li>
          <li>テスト環境の ActiveJob は TestAdapter で、perform_enqueued_jobs でジョブを同じプロセスで実行できます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'rspec-core: lib/rspec/core/example_group.rb・memoized_helpers.rb', publisher: 'rspec/rspec（GitHub）', url: `${RC}/example_group.rb`, accessed: '2026-11-11', version: 'rspec-core 3.13.7', note: 'describe が ExampleGroup の子クラスを作ること、let の LetDefinitions とメモ化、例ごとのインスタンスの生成。' },
    { title: 'Testing Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/testing.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '結合テストとシステムテスト（Capybara、ブラウザー）、テストのトランザクション、Minitest の書き方。' },
    { title: 'Testing Rails Applications（Testing Parallel Transactions）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/testing.html#testing-parallel-transactions', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '並行するトランザクションはテストのトランザクションの中で互いに待つので、use_transactional_tests = false にしてデータを自分で消すこと。' },
    { title: 'rspec-rails: lib/rspec/rails/example/rails_example_group.rb・request_example_group.rb', publisher: 'rspec/rspec-rails（GitHub）', url: `${RR}/example/rails_example_group.rb`, accessed: '2026-11-11', version: 'rspec-rails 8.1.0', note: 'すべての Rails 用の例に ActiveJob::TestHelper を include すること、request spec が ActionDispatch::Integration::Runner を使うこと。' },
    { title: 'activerecord/lib/active_record/test_fixtures.rb・connection_pool.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb#L336-L350', accessed: '2026-11-11', version: 'Rails 7.2.4', note: '7.2 にも同じ pin_connection! があること。テスト環境の ActiveJob のアダプターの既定値（activejob/lib/active_job/railtie.rb）。' },
    { title: 'activerecord/lib/active_record/test_fixtures.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/test_fixtures.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'setup_transactional_fixtures と teardown_transactional_fixtures（pin_connection!・unpin_connection!）。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/transaction.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/transaction.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'begin_transaction で、外側が joinable でなければ内側の終わりで commit のコールバックを実行すること。' },
    { title: 'rspec-rails: lib/generators/rspec/install/install_generator.rb・model/templates/model_spec.rb', publisher: 'rspec/rspec-rails（GitHub）', url: 'https://github.com/rspec/rspec-rails/blob/v8.1.0/lib/generators/rspec/install/install_generator.rb', accessed: '2026-11-13', version: 'rspec-rails 8.1.0', note: 'rspec:install が .rspec・spec_helper.rb・rails_helper.rb を作ること。rspec:model が pending だけの spec を作ること。rails_helper の maintain_test_schema! と use_transactional_fixtures。' },
    { title: 'Model specs', publisher: 'RSpec（rspec.info）', url: 'https://rspec.info/features/8-0/rspec-rails/model-specs/', accessed: '2026-11-13', version: 'rspec-rails 8.x', note: 'model spec は type: :model で指定し、ActiveSupport::TestCase の機能を含むこと。' },
    { title: 'Built in matchers', publisher: 'RSpec（rspec.info）', url: 'https://rspec.info/features/3-13/rspec-expectations/built-in-matchers/', accessed: '2026-11-13', version: 'rspec-expectations 3.13', note: 'be は equal?、eq は == で比べること。include などの組み込みのマッチャー。' },
  ],
}

export default ch20
