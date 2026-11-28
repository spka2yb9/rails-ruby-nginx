import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation20 } from '../explanations/features'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const RC = 'https://github.com/rspec/rspec/blob/rspec-core-v3.13.7/rspec-core/lib/rspec/core'
const RR = 'https://github.com/rspec/rspec-rails/blob/v8.1.0/lib/rspec/rails'

/* ---------- 図 31-1 期待する結果と実際の結果を比べる ---------- */
function CompareFigure() {
  return (
    <Svg
      id="31-1"
      w={780}
      h={300}
      label="上段は1つのテストの中身。準備で入力の文字列を用意し、実行で short_title を呼び、比較で実際の結果と期待する結果を == で比べる。下段はテストを使う流れ。コードを書き換えたらテストを実行し、すべての比較が等しければ成功、1つでも違えば失敗として、期待した値と実際の値が表示されるので、変更で動作が変わったことに気付ける"
    >
      <T x={20} y={20} bold>
        1つのテストの中身
      </T>
      <Box x={20} y={34} w={220} h={56} lines={['準備', '入力 "RSpecでテストを書く方法"']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={240} y1={62} x2={278} y2={62} />
      <Box x={280} y={34} w={200} h={56} lines={['実行', 'short_title(入力)']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={480} y1={62} x2={518} y2={62} />
      <Box x={520} y={34} w={240} h={56} lines={['比較（==）', '期待 "RSpecでテストを…" と実際']} fs={11.5} fill="box5" subTone="muted" />
      <T x={20} y={130} bold>
        テストを使う流れ
      </T>
      <Box x={20} y={150} w={180} h={56} lines={['コードを書き換える', 'title[0, max - 1] など']} fs={11.5} fill="bg" subTone="muted" />
      <Arrow x1={200} y1={178} x2={248} y2={178} />
      <Box x={250} y={150} w={180} h={56} lines={['テストを実行する', 'rspec short_title_spec.rb']} fs={11.5} fill="box" subTone="muted" />
      <Arrow d="M430,170 L480,170 L480,150 L518,150" />
      <Arrow d="M430,186 L480,186 L480,222 L518,222" />
      <Box x={520} y={126} w={240} h={48} lines={['すべて等しい → 成功', '2 examples, 0 failures']} fs={11.5} fill="box4" subTone="muted" />
      <Box x={520} y={196} w={240} h={56} lines={['1つでも違う → 失敗', 'expected（期待）と got（実際）、', '失敗した行を表示']} fs={11} fill="bg" subTone="danger" />
      <T x={20} y={282} fs={11} tone="muted">
        一度書いたテストは、コードを書き換えるたびに何度でも同じ確認を繰り返せる
      </T>
    </Svg>
  )
}

/* ---------- 図 31-2 環境ごとの設定とデータベース ---------- */
function EnvFigure() {
  const cols = [
    { x: 20, key: 'development', name: 'development（開発）', run: 'bin/rails server など', file: 'development.rb', db: 'demo_development', fill: 'box' as const },
    { x: 280, key: 'test', name: 'test（テスト）', run: 'bundle exec rspec など', file: 'test.rb', db: 'demo_test', fill: 'box5' as const },
    { x: 540, key: 'production', name: 'production（本番）', run: '本番のサーバー', file: 'production.rb', db: 'demo_production', fill: 'box' as const },
  ]
  return (
    <Svg
      id="31-2"
      w={780}
      h={300}
      label="Rails には development・test・production の3つの環境があり、環境変数 RAILS_ENV でどれを使うかが決まる。bin/rails server は development、bundle exec rspec は test で動く。環境ごとに config/environments の設定ファイルと、config/database.yml に書いたデータベースが別々で、テストは demo_test を使うので、開発用の demo_development のデータは変わらない"
    >
      <T x={390} y={20} anchor="middle" bold>
        環境変数 RAILS_ENV で環境を選ぶ
      </T>
      {cols.map((c) => (
        <g key={c.name}>
          <rect x={c.x} y={36} width={220} height={236} rx={8} fill="var(--fig-bg)" stroke={c.fill === 'box5' ? 'var(--fig-accent)' : 'var(--fig-line)'} strokeWidth={c.fill === 'box5' ? 2 : 1} />
          <T x={c.x + 110} y={56} anchor="middle" bold fs={12.5}>
            {c.name}
          </T>
          <Box x={c.x + 14} y={72} w={192} h={44} lines={['起動の例', c.run]} fs={11} fill={c.fill} subTone="muted" />
          <Box x={c.x + 14} y={128} w={192} h={44} lines={['設定ファイル', `config/environments/${c.file}`]} fs={10.5} fill={c.fill} subTone="muted" />
          <Box x={c.x + 14} y={184} w={192} h={68} lines={['データベース', `database.yml の ${c.key}:`, c.db]} fs={11} fill="box4" subTone="muted" />
        </g>
      ))}
      <T x={20} y={290} fs={11} tone="muted">
        データベースの名前は rails new demo -d mysql が作る config/database.yml のもの。テストで作った行は開発用のデータベースに入らない
      </T>
    </Svg>
  )
}

/* ---------- 図 31-3 RSpec の DSL が作るもの ---------- */
function DslFigure() {
  return (
    <Svg
      id="31-3"
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

/* ---------- 図 31-4 テストの種類と通る層 ---------- */
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
      id="31-4"
      w={760}
      h={layers.length * rowH + 70}
      label="記事を保存して表示する例。model spec はモデルから、request spec はミドルウェアから Rails の処理を呼ぶ。Selenium を使う system spec はブラウザーを操作して Puma に HTTP で要求し、画面の JavaScript も実行する"
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
        帯はこの例でテストが通る層。system spec は Selenium でブラウザーを操作する場合
      </T>
    </Svg>
  )
}

/* ---------- 図 31-5 テストのトランザクション ---------- */
function RollbackFigure() {
  return (
    <Svg
      id="31-5"
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

/* ---------- 失敗の出力と spec の行の対応 ---------- */
function FailureMapFigure() {
  const LH = 18
  const code: [string, number, string][] = [
    ['3', 0, 'RSpec.describe Article, type: :model do'],
    ['4', 2, 'describe "#valid?" do'],
    ['', 4, '…'],
    ['13', 4, 'it "タイトルが空なら無効で、title にエラーが入る" do'],
    ['14', 6, 'article = Article.new(title: "")'],
    ['16', 6, 'result = article.valid?'],
    ['18', 6, 'expect(result).to be(false)'],
  ]
  const out: [number, string, string][] = [
    [2, '1) Article#valid? タイトルが空なら無効で、title にエラーが入る', '例の名前（describe と it の文字列）'],
    [5, 'Failure/Error: expect(result).to be(false)', '失敗した expect'],
    [7, 'expected false', '期待した値'],
    [12, 'got true', '実際の値'],
    [5, '# ./spec/models/article_spec.rb:18:in …', '失敗した expect の行（18 行目）'],
    [0, 'rspec ./spec/models/article_spec.rb:13 # Article#valid? …', '失敗した例だけを実行し直す'],
  ]
  const codeY = 46
  const outY = 222
  const yOf = (top: number, i: number) => top + i * LH
  return (
    <Svg
      id="ch20-failure-map"
      w={780}
      h={336}
      label="上は spec/models/article_spec.rb の一部に行番号を付けたもの。13 行目が失敗した例の it、18 行目が失敗した expect。下は失敗したときの出力。1) の行にある例の名前は、describe の Article と #valid? と it の文字列をつなげたもの。Failure/Error の行は失敗した expect、expected false は期待した値、got true は実際の値。# ./spec/models/article_spec.rb:18 は 18 行目の expect を、最後の rspec ./spec/models/article_spec.rb:13 は 13 行目の it を指し、その例だけを実行し直すコマンドになる"
    >
      <T x={56} y={16} bold fs={12}>
        spec/models/article_spec.rb（行番号を付けて一部を表示）
      </T>
      <rect x={56} y={30} width={470} height={138} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      {[3, 6].map((i) => (
        <rect key={i} x={62} y={yOf(codeY, i) - LH / 2} width={458} height={LH} rx={3} fill="var(--fig-box5)" />
      ))}
      {code.map(([n, indent, text], i) => (
        <g key={i}>
          <T x={86} y={yOf(codeY, i)} anchor="end" mono fs={11.5} tone="muted">
            {n}
          </T>
          <T x={98 + indent * 6.9} y={yOf(codeY, i)} mono fs={11.5}>
            {text}
          </T>
        </g>
      ))}
      <T x={544} y={yOf(codeY, 3)} fs={11.5}>
        13 行目：失敗した例の it
      </T>
      <T x={544} y={yOf(codeY, 6)} fs={11.5}>
        18 行目：失敗した expect
      </T>

      <T x={56} y={192} bold fs={12}>
        失敗したときの出力（一部を省略）
      </T>
      <rect x={56} y={206} width={470} height={120} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      {[4, 5].map((i) => (
        <rect key={i} x={62} y={yOf(outY, i) - LH / 2} width={458} height={LH} rx={3} fill="var(--fig-box5)" />
      ))}
      {out.map(([indent, text, note], i) => (
        <g key={i}>
          <T x={70 + indent * 6.9} y={yOf(outY, i)} mono fs={11.5}>
            {text}
          </T>
          <T x={544} y={yOf(outY, i)} fs={11.5} tone="muted">
            {note}
          </T>
        </g>
      ))}

      <Arrow d={`M62,${yOf(outY, 4)} L42,${yOf(outY, 4)} L42,${yOf(codeY, 6)} L60,${yOf(codeY, 6)}`} dashed />
      <Arrow d={`M62,${yOf(outY, 5)} L26,${yOf(outY, 5)} L26,${yOf(codeY, 3)} L60,${yOf(codeY, 3)}`} dashed />
    </Svg>
  )
}

/* ---------- let と let! で記事を作る時点 ---------- */
function LetTimingFigure() {
  const rows = [
    { y: 50, h: 44, label: '例の開始', mono: false },
    { y: 118, h: 52, label: 'get articles_path', mono: true },
    { y: 194, h: 52, label: 'article.title', mono: true },
  ]
  return (
    <Svg
      id="ch20-let-timing"
      w={780}
      h={260}
      label="例の中の処理を上から時間の順に並べ、let と let! を比べた図。let では例の開始時には記事を作らない。get articles_path の応答を作る時点ではこの記事が DB に無いので、一覧に記事が出ない。後で article.title を読んだ時点で初めて INSERT するが、受け取った一覧は変わらない。let! では各例の開始時に create で記事を INSERT する。get articles_path の時点で記事は DB にあり、一覧に記事が出る。article.title は開始時に作った記事を返す"
    >
      <T x={30} y={34} anchor="middle" fs={11.5} tone="muted">
        時間
      </T>
      <Arrow x1={30} y1={46} x2={30} y2={248} />
      {rows.map((r) => (
        <T key={r.label} x={44} y={r.y + r.h / 2} mono={r.mono} fs={12}>
          {r.label}
        </T>
      ))}
      <T x={320} y={24} anchor="middle" mono bold fs={12}>
        {'let(:article) { create(:article) }'}
      </T>
      <T x={620} y={24} anchor="middle" mono bold fs={12}>
        {'let!(:article) { create(:article) }'}
      </T>

      <Box x={180} y={50} w={280} h={44} lines="記事はまだ作らない" fs={12} fill="bg" />
      <Arrow x1={320} y1={94} x2={320} y2={116} />
      <Box x={180} y={118} w={280} h={52} lines={['この記事は DB に無い', '応答の一覧に記事が出ない']} fs={12.5} fill="box" subTone="danger" />
      <Arrow x1={320} y1={170} x2={320} y2={192} />
      <Box x={180} y={194} w={280} h={52} lines={['ここで初めて INSERT する', '受け取った一覧は変わらない']} fs={12.5} fill="box" subTone="muted" />

      <Box x={480} y={50} w={280} h={44} lines={['記事を INSERT する', '各例の開始時に create']} fs={12.5} fill="box" subTone="muted" />
      <Arrow x1={620} y1={94} x2={620} y2={116} />
      <Box x={480} y={118} w={280} h={52} lines={['記事は DB にある', '応答の一覧に記事が出る']} fs={12.5} fill="box" subTone="acc" />
      <Arrow x1={620} y1={170} x2={620} y2={192} />
      <Box x={480} y={194} w={280} h={52} lines="開始時に作った記事を返す" fs={12} fill="box" />
    </Svg>
  )
}

/* ---------- deliver_later から deliveries まで ---------- */
function EnqueuedMailFigure() {
  return (
    <Svg
      id="ch20-enqueued-mail"
      w={780}
      h={290}
      label="上の段は deliver_later の時点。deliver_later はメールを送るジョブを登録し、テスト用の TestAdapter はジョブを実行せずに配列に記録する。記録したジョブは ArticleMailer の published。下の段は perform_enqueued_jobs の時点。perform_enqueued_jobs は記録したジョブを、テストと同じプロセスで実行する。ジョブがメールを送ると、delivery_method = :test により ActionMailer::Base.deliveries の配列に入る。have_enqueued_mail は記録したジョブを調べ、deliveries は deliver_later の直後は 0 件、perform_enqueued_jobs の後は 1 件になる。本番では Sidekiq などの別のプロセスがジョブを取り出して実行する"
    >
      <Box x={20} y={40} w={200} h={50} lines={['deliver_later', 'メールを送るジョブを登録']} fs={12.5} fill="box" subTone="muted" />
      <Arrow x1={220} y1={65} x2={258} y2={65} />
      <Box x={260} y={40} w={220} h={50} lines={['TestAdapter', 'ジョブを実行せずに記録']} fs={12.5} fill="box" subTone="muted" />
      <Arrow x1={480} y1={65} x2={518} y2={65} />
      <Box x={520} y={40} w={240} h={50} lines={['記録したジョブの配列', 'ArticleMailer の published']} fs={12.5} fill="box4" subTone="muted" />
      <T x={20} y={22} bold fs={12}>
        deliver_later の時点
      </T>

      <Arrow x1={640} y1={90} x2={640} y2={148} />
      <T x={20} y={132} bold fs={12}>
        perform_enqueued_jobs の時点
      </T>
      <Box x={520} y={150} w={240} h={50} lines={['perform_enqueued_jobs', 'テストと同じプロセスで実行']} fs={12.5} fill="box5" subTone="muted" />
      <Arrow x1={520} y1={175} x2={482} y2={175} />
      <Box x={280} y={150} w={200} h={50} lines={['ジョブがメールを送る', 'delivery_method = :test']} fs={12.5} fill="box" subTone="muted" />
      <Arrow x1={280} y1={175} x2={242} y2={175} />
      <Box x={20} y={150} w={220} h={50} lines={['ActionMailer::Base.deliveries', 'テスト用の配送先の配列']} fs={12.5} fill="box4" subTone="muted" />

      <T x={20} y={226} fs={11.5}>
        have_enqueued_mail は上の段の「記録したジョブの配列」を調べる
      </T>
      <T x={20} y={246} fs={11.5}>
        ActionMailer::Base.deliveries の件数：deliver_later の直後は 0 件、perform_enqueued_jobs の後は 1 件
      </T>
      <T x={20} y={274} fs={11.5} tone="muted">
        本番では、Sidekiq などの別のプロセスがジョブを取り出して実行する
      </T>
    </Svg>
  )
}

const ch20: Chapter = {
  number: 20,
  part: 4,
  title: 'テスト（RSpec 中心）',
  summary:
    '「タイトルが空の記事は保存できない」という仕様を RSpec で確かめます。テストをわざと失敗させて出力を読み、モデルだけで調べることと、フォームを送って初めて分かることを区別します。',
  goals: [
    '入力・実行する操作・期待する結果を1件のテストに書き、失敗した行を見つけられる',
    'モデル、HTTP の要求、ブラウザー操作のうち、確かめたい動作が通る範囲を選べる',
    'テストが使うデータの作成時点と、各テストの後に DB の変更が戻る条件を説明できる',
  ],
  prerequisites: [3, 10, 15, 18],
  sections: [
    {
      id: 'why-test',
      title: '期待する結果と実際の結果をプログラムで比べる',
      body: (
        <>
          <p>
            プログラムを書き換えたときは、前から動いていた機能が変わっていないかを確かめる必要があります。ブラウザーで画面を開いて確かめる方法では、機能が増えるほど時間がかかり、確かめ忘れも起きます。テストは「この入力ならこの結果になるはず」という期待する結果と、実際にプログラムを動かした結果を、プログラムで比べるコードです。一度書けば、同じ確認を何度でも短い時間で繰り返せます。
          </p>
          <p>一覧のページで長いタイトルを短くして表示するメソッドを例にします。</p>
          <Code
            lang="ruby"
            title="short_title.rb"
            code={`
# 一覧に表示するために、長いタイトルを短くする
def short_title(title, max = 10)
  title.length > max ? title[0, max] + "…" : title
end
`}
          />
          <p>
            このメソッドを確かめるプログラムを、Ruby だけで書きました。<code>check</code> は期待する結果と実際の結果を <code>==</code> で比べ、等しければ OK を、違えば NG と両方の値を表示します。
          </p>
          <Code
            lang="ruby"
            title="check_short_title.rb"
            code={`
require_relative "short_title"

def check(name, expected, actual)
  if actual == expected
    puts "OK  #{name}"
  else
    puts "NG  #{name}: 期待 #{expected.inspect}、実際 #{actual.inspect}"
  end
end

check("短いタイトルはそのまま", "Rails入門", short_title("Rails入門"))
check("長いタイトルは10文字で切る", "RSpecでテストを…", short_title("RSpecでテストを書く方法"))
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
OK  短いタイトルはそのまま
OK  長いタイトルは10文字で切る
`}
          />
          <p>
            後で誰かが short_title を書き換え、10文字ではなく9文字で切るようにしてしまったとします（<code>title[0, max]</code> を <code>title[0, max - 1]</code>{' '}
            に変更）。同じプログラムを実行すると、2つ目の確認が NG になりました。
          </p>
          <Code
            lang="text"
            title="書き換えた後の実行結果"
            code={`
OK  短いタイトルはそのまま
NG  長いタイトルは10文字で切る: 期待 "RSpecでテストを…"、実際 "RSpecでテスト…"
`}
          />
          <p>
            確認をプログラムにしておくと、変更で動作が変わったことに、実行するだけで気付けます（図 31-1）。確認が数百、数千と増えると、どの確認が失敗したか、期待した値と実際の値は何か、どのファイルの何行目かを見やすく表示する仕組みが欲しくなります。これをまとめた道具がテストのフレームワークで、Ruby
            のテストフレームワークには RSpec などがあります。同じ確認を RSpec で書きました。
          </p>
          <Code
            lang="ruby"
            title="short_title_spec.rb"
            code={`
require_relative "short_title"

RSpec.describe "short_title" do
  it "短いタイトルはそのまま返す" do
    expect(short_title("Rails入門")).to eq("Rails入門")
  end

  it "10文字より長いタイトルは10文字で切って…を付ける" do
    expect(short_title("RSpecでテストを書く方法")).to eq("RSpecでテストを…")
  end
end
`}
          />
          <p>
            <code>RSpec.describe</code> は確認をまとめるグループ、<code>it</code> は1つの確認（RSpec では例と呼びます）です。<code>expect(実際の値).to eq(期待する値)</code> は、
            <code>check</code> と同じく <code>==</code> で比べます
            <Ref n={10} />。rspec コマンドにファイルを渡して実行しました
            <Ref n={11} />。
          </p>
          <Code
            lang="text"
            title="rspec short_title_spec.rb の出力（rspec-core 3.13.7）"
            code={`
..

Finished in 0.01454 seconds (files took 1.18 seconds to load)
2 examples, 0 failures
`}
          />
          <p>
            <code>.</code> は成功した例が1つあるごとに1文字表示されます。<code>2 examples, 0 failures</code> は、2つの例を実行して失敗が0件だったことを表します。9文字で切るように書き換えたコードで実行すると、次のようになりました。
          </p>
          <Code
            lang="text"
            title="書き換えた後の rspec の出力"
            code={`
.F

Failures:

  1) short_title 10文字より長いタイトルは10文字で切って…を付ける
     Failure/Error: expect(short_title("RSpecでテストを書く方法")).to eq("RSpecでテストを…")

       expected: "RSpecでテストを…"
            got: "RSpecでテスト…"

       (compared using ==)
     # ./short_title_spec.rb:9:in 'block (2 levels) in <top (required)>'

Finished in 0.03575 seconds (files took 0.43348 seconds to load)
2 examples, 1 failure

Failed examples:

rspec ./short_title_spec.rb:8 # short_title 10文字より長いタイトルは10文字で切って…を付ける
`}
          />
          <p>
            失敗した例は <code>F</code> で表示され、その後に、失敗した expect の行、期待した値（expected）と実際の値（got）、失敗した行の番号（short_title_spec.rb の9行目）が並びます。自分で書いた{' '}
            <code>check</code> と同じ内容を、RSpec が決まった形で表示しています。表示の読み方は「RSpec で最初のテストを書く」の節でも確かめます。
          </p>
          <Figure n="31-1" title="期待する結果と実際の結果を比べる" caption="short_title の例（Ruby 4.0.9・rspec-core 3.13.7 で実行）をもとにした模式図。">
            <CompareFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'test-db',
      title: 'テスト用の環境とデータベース',
      body: (
        <>
          <p>
            Rails のアプリケーションのテストでは、モデルを保存したり記事を数えたりと、データベースを使う確認が多くなります。開発中に使っているデータベースでテストをすると、テストが作ったり消したりした記事が開発用のデータに混ざります。逆に、開発用のデータが残っているせいで、記事の数を数えるテストの結果が変わることもあります。そのため、Rails
            はテスト専用のデータベースを使います。
          </p>
          <p>
            Rails には、development（開発）、test（テスト）、production（本番）の3つの環境があります。環境は同じアプリケーションを目的に合わせた設定で動かすための区別です。どの環境で動かすかは環境変数（プログラムの外から渡す設定の値）の
            RAILS_ENV で決まり、テストは test の環境で動きます。環境ごとの設定は config/environments/ の development.rb・test.rb・production.rb に、環境ごとの接続先のデータベースは
            config/database.yml に書きます
            <Ref n={2} />。<code>rails new demo -d mysql</code> で作ったアプリケーションの database.yml は次のとおりです。
          </p>
          <Code
            lang="yaml"
            title="config/database.yml（rails new demo -d mysql で作ったもの。一部を省略）"
            href={`${GH}/railties/lib/rails/generators/rails/app/templates/config/databases/mysql.yml.tt`}
            code={`
default: &default
  adapter: mysql2
  encoding: utf8mb4
  max_connections: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  username: root
  password:
  host: <%= ENV.fetch("DB_HOST") { "127.0.0.1" } %>

development:
  <<: *default
  database: demo_development

# Warning: The database defined as "test" will be erased and
# re-generated from your development database when you run "rake".
# Do not set this db to the same as development or production.
test:
  <<: *default
  database: demo_test
`}
          />
          <p>
            開発用は demo_development、テスト用は demo_test という別のデータベースです。test の上のコメントには、test のデータベースは rake を実行したときに消して作り直されるので、開発用や本番用と同じデータベースにしてはいけないと書かれています
            <Ref n={12} />。
          </p>
          <p>
            デモのアプリケーションで、2つの環境の接続先と記事の数を確かめました（デモでは、同じ名前のデータベースを環境変数 DATABASE_URL で指定しています）。<code>bin/rails runner</code>{' '}
            はアプリケーションを読み込んで Ruby のコードを実行するコマンドで、RAILS_ENV=test を付けるとテスト環境で動きます。
          </p>
          <Code
            lang="text"
            title="bin/rails runner で環境・データベース・記事の数を表示した結果"
            code={`
環境=development データベース=demo_development 記事の数=10004
環境=test データベース=demo_test 記事の数=0
`}
          />
          <p>次に、記事を3件作る例と、その後で記事を数える例を書き、テスト環境で実行しました。</p>
          <Code
            lang="ruby"
            title="spec/models/basics20_spec.rb（デモ）"
            code={`
require "rails_helper"

RSpec.describe "テスト用のデータベース" do
  it "記事を3件作る" do
    puts "環境=#{Rails.env} データベース=#{ActiveRecord::Base.connection.current_database}"
    puts "作る前の記事の数=#{Article.count}"
    3.times { |i| Article.create!(title: "テストの記事#{i + 1}") }
    puts "作った後の記事の数=#{Article.count}"
  end

  it "前の例で作った記事は残っていない" do
    puts "次の例での記事の数=#{Article.count}"
  end
end
`}
          />
          <Code
            lang="text"
            title="bundle exec rspec spec/models/basics20_spec.rb --format documentation の出力"
            code={`
テスト用のデータベース
環境=test データベース=demo_test
作る前の記事の数=0
作った後の記事の数=3
  記事を3件作る
次の例での記事の数=0
  前の例で作った記事は残っていない

Finished in 0.19226 seconds (files took 1.73 seconds to load)
2 examples, 0 failures
`}
          />
          <p>
            テストは demo_test で動き、1つ目の例で作った3件の記事は、2つ目の例では0件に戻っていました。実行した後も、テスト用のデータベースの記事は0件、開発用のデータベースの記事は 10004
            件のままでした。rspec-rails が作る rails_helper.rb には、例が終わるたびにデータベースの変更を取り消す設定が入っているので、どの例も同じ状態のデータベースから始まります。この仕組みは「トランザクションによる巻き戻し」の節で扱います。
          </p>
          <p>テスト環境の設定ファイルにはテストのための設定も入っています。</p>
          <Code
            lang="ruby"
            title="config/environments/test.rb（rails new demo -d mysql で作ったもの。一部を省略）"
            href={`${GH}/railties/lib/rails/generators/rails/app/templates/config/environments/test.rb.tt`}
            code={`
  config.cache_store = :null_store

  # Render exception templates for rescuable exceptions and raise for other exceptions.
  config.action_dispatch.show_exceptions = :rescuable

  # Disable request forgery protection in test environment.
  config.action_controller.allow_forgery_protection = false

  # Store uploaded files on the local file system in a temporary directory.
  config.active_storage.service = :test

  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test
`}
          />
          <p>
            <code>delivery_method = :test</code> はメールを実際には送らずに <code>ActionMailer::Base.deliveries</code> という配列に入れる設定です。<code>cache_store = :null_store</code>{' '}
            はキャッシュに何も保存しない設定で、<code>active_storage.service = :test</code> は添付したファイルを一時的なディレクトリに保存する設定です
            <Ref n={13} />。テストの結果が、メールの送信先や、前のテストが残したキャッシュやファイルに左右されないようにしています（図 31-2）。
          </p>
          <p>次の節では Rails のアプリケーションに RSpec を入れて、テスト環境で Article のモデルを確かめるテストを書きます。</p>
          <Figure n="31-2" title="環境ごとの設定とデータベース" caption="rails new demo -d mysql（Rails 8.1.4.1）が作る database.yml・config/environments と、デモでの実測をもとにした模式図。">
            <EnvFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'first-spec',
      title: 'RSpec で最初のテストを書く',
      body: (
        <>
          <p>
            モデルの具体例として、<ChapterLink n={11} section="crud" />で使った「タイトルが空なら保存しない」検証を取り上げます。RSpec で入力と期待値を記述して実行すると、失敗した場合は実際の値との差も表示されます。
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
            次の図はこの節の spec に行番号を付けたもの（図の上）と、失敗したときの出力（図の下）を並べたものです。出力の右に書いた説明を上から読み、色を付けた2つの行が spec のどの行を指すかを左の破線でたどってください。
          </p>
          <Figure
            title="失敗の出力と spec の行の対応"
            caption="この節の article_spec.rb と、検証を消して実行した出力をもとにした図。spec は 3・4・13・14・16・18 行目だけを載せ、出力は前後の行と行末を省略した。破線の矢印は出力の行番号が指す spec の行を表す。"
          >
            <FailureMapFigure />
          </Figure>
          <p>
            1つ目の例（タイトルがあれば有効）は、検証を消しても成功しました。成功する入力だけを確かめるテストでは、検証が無くなっても気付けません。失敗するはずの入力の例も書くのは、このためです。確かめたら検証を元に戻し、もう一度実行して{' '}
            <code>0 failures</code> になることを確認します。
          </p>
          <h3>フォームの送信を確かめる request spec</h3>
          <p>
            <ChapterLink n={16} section="form" />
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
            <code>have_http_status</code> は応答のステータスコードを、<code>redirect_to</code> はリダイレクト先を確かめるマッチャーです。デモで実行すると、2つとも成功しました。<code>eq</code>{' '}
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
            が例ごとに違う）。そのため、ある例で代入したインスタンス変数や let の値は、次の例には残りません（図 31-3）。
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
          <Figure n="31-3" title="RSpec の DSL が作るもの" caption="rspec-core 3.13.7 の example_group.rb・memoized_helpers.rb を読み、デモの出力で確かめてまとめた模式図。">
            <DslFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'test-strategy',
      title: "テストをどの層に置くか",
      body: (
        <>
          <p>
            「空のタイトルを保存できない」という規則なら、モデルに値を渡して <code>valid?</code> を呼べば確かめられます。「保存に失敗したら入力画面を返す」まで調べるには、フォームと同じ値を <code>post</code> で送り、返った応答を調べます。ボタンを押すと JavaScript で入力欄が増える仕様なら、ブラウザーでボタンを押すテストが必要です。
          </p>
          <p>
            小さい範囲のテストを多めにし、ブラウザーを動かす時間のかかるテストを代表的な操作に絞る考え方をテストピラミッドと呼びます。どの層で失敗したら何が分かるかを基準に、確かめる場所を選びます。<Ref n={14} /><Ref n={15} />
          </p>
          <p>
            公開済みの記事だけが一覧に出るなら、モデルのスコープを公開・下書き両方のデータで確かめます。編集権限まで必要なら、request spec で所有者か他人かを変え、ステータスだけでなく「他人のデータが更新されない」ことも確認します。テスト名は対象のメソッド名だけでなく、満たすべき振る舞いがわかる形にします。
          </p>
          <p>
            TDD（テスト駆動開発）では、期待する振る舞いを失敗するテストで表し、必要な実装で成功させてから整理します。既存の不具合では先に再現テストを追加すると修正の有無がわかります。仕様もまだ探索中の画面では、小さな試作で振る舞いを決め、確定した部分をテストに残す進め方もあります。<Ref n={14} />
          </p>
        </>
      ),
    },
    {
      id: 'types',
      title: 'テストの種類と通る層',
      body: (
        <>
          <p>
            rspec-rails は、spec の <code>type:</code>（model・request・system など）に応じて、Rails のテスト用のモジュールを include します。どのモジュールを include するかで、テストがアプリケーションのどの層から処理を呼び出すかが決まります（図 31-4）。
          </p>
          <ul>
            <li>model spec：モデルのクラスを直接呼ぶ。コントローラーやルーティングは通らない</li>
            <li>request spec：<code>get</code>・<code>post</code> が Rails.application を Rack のアプリケーションとして呼ぶ。HTTP サーバーは通らない</li>
            <li>system spec で Selenium を使うと、Capybara が Chrome などのブラウザーを操作する。ブラウザーはテスト用の Puma に HTTP で要求を送り、受け取った画面の JavaScript も実行する</li>
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
            <Ref n={2} />。記事を表示する要求なら、存在する記事には 200、存在しない記事には 404 が返ることを確かめられます。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/articles_spec.rb の例"
            code={`
require "rails_helper"

RSpec.describe "記事の表示", type: :request do
  it "保存された記事のページを返す" do
    article = Article.create!(title: "Rails 入門", body: "本文")
    get article_path(article)
    expect(response).to have_http_status(:ok)
    expect(response.body).to include("Rails 入門")
  end
end
`}
          />
          <p>
            このテストはルーティングからビューまでを通った結果を確認します。存在しない記事の要求で <code>RecordNotFound</code> が発生した場合、テスト環境の設定ファイルに{' '}
            <code>config.action_dispatch.show_exceptions = :rescuable</code> があれば、ミドルウェアの ShowExceptions が例外を 404 の応答に変えます（
            <ChapterLink n={10} section="exceptions" />
            ）。一方、HTTP サーバーを通らないので、Puma の設定や Nginx は request spec では確かめられません。
          </p>
          <Figure n="31-4" title="テストの種類と通る層" caption="rspec-rails 8.1.0 の example グループのモジュールと、Testing Rails Applications（ガイド）をもとにまとめた図。">
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
            のスレッドが同じデータを見られるのも、この仕組みによります（図 31-5）。
          </p>
          <Figure n="31-5" title="テストのトランザクション" caption="Rails 8.1.4.1 の test_fixtures.rb・connection_pool.rb・transaction.rb を読み、デモのテストのログで確かめてまとめた模式図。">
            <RollbackFigure />
          </Figure>
          <p>トランザクションによる巻き戻しが適用されない、または期待どおりに動かない場合があります。</p>
          <ul>
            <li>
              別のプロセス：Sidekiq のプロセスや、別に起動したサーバーは別の接続を使うので、COMMIT されていない行は見えません（<ChapterLink n={18} section="transaction" />
              ）。テストではジョブをテスト用のアダプターに入れ、同じプロセスで実行します（<ChapterLink n={20} section="jobs-mail">ジョブとメールのテスト</ChapterLink>）
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
      id: 'test-fixture-boundaries',
      title: "テストデータの作成範囲と副作用を選ぶ",
      body: (
        <>
          <p>
            たとえば記事一覧が新しい記事を表示するかを試すとします。<code>let(:article) &#123; create(:article) &#125;</code> は、<code>article</code> を初めて参照した時点で記事を保存します。同じ例の中で2回目に参照すると、最初に作った記事が返ります。
          </p>
          <p>
            記事に触れる前に <code>get articles_path</code> を呼ぶと、その応答を作った時点では記事はまだ DB にありません。比較のために後から <code>article.title</code> を読んでも、すでに受け取った一覧の内容は変わりません。要求の前に明示的に記事を作るか、各例の開始時に作成する <code>let!</code> を使います。<code>before</code> には各例に共通の準備を置きます。<Ref n={15} />
          </p>
          <p>
            次の図は同じ例を <code>let</code>（左）と <code>let!</code>（右）で書いた場合に、例の中で何が起きるかを上から時間の順に並べたものです。左端の列は例の中で実行するコードです。真ん中の get articles_path の行で、2つの列の結果が分かれます。
          </p>
          <Figure
            title="let と let! で記事を作る時点"
            caption="本文の記事一覧の例をもとにした模式図。上の行は spec に書く定義、左端の列は例の中で実行する順のコード。赤い文字は一覧に記事が出ない結果を表す。"
          >
            <LetTimingFigure />
          </Figure>
          <p>
            FactoryBot の <code>trait :published</code> のような名前付きの変化を使うと、基本の factory を小さく保ち、記事の公開や付随するデータを各例が選べます。<code>build</code>、<code>build_stubbed</code>、<code>create</code> の選び方に加え、factory 内の関連が実際に何件 INSERT するかも見ます。作るだけで大量の関連を作る定義を避けると、テストの前提と時間を把握しやすくなります。<Ref n={16} />
          </p>
          <p>
            スタブは依存先の戻り値を差し替え、モックは依存先が決めた約束どおり呼ばれたかを確かめる方法です。HTTP/API などアプリの外との境界に使うと、通信に依存せずに成功・タイムアウト・エラーの経路を再現できます。アプリ内部では、メソッドの呼び順を全て固定するより、保存結果や応答のような外から見える変化を確認すると、仕様が同じまま実装を整理できます。<Ref n={15} /><Ref n={17} />
          </p>
          <Code
            lang="ruby"
            title={"外部の HTTP 応答をテスト内で返す例"}
            code={`
# spec/support などで require "webmock/rspec" を読み込む
WebMock.disable_net_connect!(allow_localhost: true)

stub_request(:get, "https://catalog.example.test/items/42")
  .to_return(status: 200, body: '{"id":42}',
             headers: { "Content-Type" => "application/json" })
`}
          />
          <p>
            テスト全体で外部通信を止める場合は、ブラウザードライバーが使うローカルの接続を許可するなど、スイートが必要とする経路を確認します。記録済み通信を再生するツールを使う場合も、記録にトークンや個人情報が入らないようにします。<Ref n={17} />
          </p>
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
            次の図は上のコードでジョブとメールがどこに入るかを、2つの時点に分けて並べたものです。上の段を左から右へ、右端の矢印で下の段へ移り、下の段を右から左へ読んでください。記録したジョブの配列と deliveries の配列は別のものです。
          </p>
          <Figure
            title="deliver_later から deliveries に入るまで"
            caption="この節の mail_spec.rb の実行結果をもとにした模式図。緑の箱はデータを入れる配列、実線の矢印は処理の流れを表す。TestAdapter はテスト環境の ActiveJob のアダプターの既定値。"
          >
            <EnqueuedMailFigure />
          </Figure>
          <p>
            Sidekiq::Job を直接使うジョブ（<ChapterLink n={18} section="direct" />
            ）は ActiveJob を通らないので、これらのマッチャーでは確かめられません。Sidekiq の gem の <code>Sidekiq::Testing</code> を使い、fake（配列に記録）か inline（その場で実行）を選びます。
          </p>
        </>
      ),
    },
    {
      id: 'integration-ci',
      title: "リクエスト・ブラウザー・CI の実行条件を揃える",
      body: (
        <>
          <p>
            Devise を使う構成では request spec に <code>Devise::Test::IntegrationHelpers</code> を組み込んで <code>sign_in(user)</code> で認証済みの条件を作れます。ログインそのものを試す目的なら、フォームやログインのリクエストを経由して、セッション成立を別のテストで確認します。<Ref n={15} /><Ref n={18} />
          </p>
          <p>
            system spec では Capybara を使ってフォームに入力し、ボタンを押せます。<code>driven_by</code> で選ぶドライバーによって動かし方が変わります。<code>:rack_test</code> は Ruby からアプリを呼びます。JavaScript で入力欄が増えるところも試すなら、Selenium などのドライバーで実際のブラウザーを使います。画面のラベルやボタンの名前で操作対象を探せば、Capybara が対象の表示を待てます。<Ref n={14} /><Ref n={19} />
          </p>
          <p>
            CI（継続的インテグレーション）では、PR と更新を契機に同じ設定でテストを実行します。GitHub Actions で Ruby を用意するなら <code>ruby/setup-ruby</code> の <code>bundler-cache: true</code> を使えます。MySQL や PostgreSQL を使うスイートならサービスと接続用のテスト設定を用意し、<code>RAILS_ENV=test bin/rails db:prepare</code> でスキーマを揃えてから <code>bundle exec rspec</code> を実行します。ブラウザーの失敗時にはスクリーンショットを成果物として残せます。デプロイへ進む条件とテスト環境の設定をリポジトリで共有しておくと、手作業での確認漏れを減らせます。<Ref n={20} /><Ref n={21} />
          </p>
        </>
      ),
    },
    {
      id: 'test-doubles',
      title: '外部サービスをスタブに替えてテストする',
      body: (
        <>
          <p>送料の見積もりが外部サービスに依存していると、テストを実行するたびにネットワークやサービスの状態の影響を受けます。通常の戻り値やタイムアウト時の表示を確かめるテストでは、外部サービスを呼ぶクライアントをテスト用の代役に替えられます。</p>
          <p><code>allow</code> は、指定したメソッドが決めた値を返すか、例外を発生させるように差し替えます。この代役をスタブと呼びます。<code>expect(...).to receive</code> は呼び出し自体を確認します。外部サービスへの依頼が一度だけ送られることが仕様なら、呼び出し回数を確認します。画面に表示する値が仕様なら、内部の呼び出し順や回数まで固定するとテストを保ちにくくなります。<Ref n={22} /></p>
          <Code lang="ruby" title="RSpec でクライアントの代役を使う例" code={`
require "rspec"

class ShippingClient
  def quote(postal_code:)
    raise NotImplementedError
  end
end

class ShippingFee
  def initialize(client:)
    @client = client
  end

  def call(postal_code:)
    @client.quote(postal_code: postal_code)
  end
end

RSpec.describe ShippingFee do
  it "送料の見積もりを返す" do
    client = instance_double(ShippingClient)
    allow(client).to receive(:quote).with(postal_code: "1000001").and_return(800)
    fee = ShippingFee.new(client: client)
    expect(fee.call(postal_code: "1000001")).to eq(800)
  end
end
`} />
          <p><code>instance_double(ShippingClient)</code> を使うと、実際のクラスにないメソッドや合わない引数を指定したときに RSpec が検出します。HTTP の URL や JSON の変換はクライアント自体のテストで確かめます。アプリが外部 API の仕様に追従できているかは、仕様の資料や提供元のテスト環境でも確認します（<ChapterLink n={101} />）。</p>
          <h3>ブラウザーでしか分からない挙動を system spec に残す</h3>
          <p>入力したタイトルが保存後に表示されるかは、フォームを操作する system spec で確かめられます。注文の認可や失敗応答は request spec で分岐ごとに確認し、system spec は入力から表示までを通して確認する場面に絞れます。<Ref n={19} /></p>
          <Code lang="ruby" title="spec/system/articles_spec.rb の例" code={`
require "rails_helper"

RSpec.describe "記事の作成", type: :system do
  before { driven_by(:rack_test) }

  it "作成した記事の題名を表示する" do
    visit new_article_path
    fill_in "タイトル", with: "Rails 入門"
    fill_in "本文", with: "最初の記事です"
    click_button "作成"
    expect(page).to have_content("Rails 入門")
  end
end
`} />
          <p>この例は JavaScript を使わないフォームを想定し、Capybara の RackTest ドライバーを使います。入力欄とボタンの名前は、対象の画面に合わせて指定します。JavaScript の動作も確認する例では、Selenium など実ブラウザーを操作するドライバーを選びます。</p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>テストは、期待する結果と実際の結果をプログラムで比べるコードです。RSpec の expect(実際の値).to eq(期待する値) は == で比べ、失敗すると expected と got を表示します。</li>
          <li>Rails は RAILS_ENV で環境を選び、テストは test の環境で、開発用とは別のデータベース（demo_test など）を使います。テスト環境の設定はメールを送らずに配列に入れるなど、テストのための値になっています。</li>
          <li>
            spec は describe（グループ）・it（1つの例）・expect とマッチャー（確認）で書きます。成功する入力だけでなく、失敗するはずの入力の例も書き、コードに意図的な誤りを加えてテストが失敗することを確かめます。
          </li>
          <li>describe は ExampleGroup の子クラスを作り、it は例ごとに作られるそのインスタンスを self として実行されます。let は LetDefinitions モジュールのメソッドで、例の中でメモ化されます。</li>
          <li>request spec は Rails.application をミドルウェアから呼びます。画面の操作や JavaScript の動きは、ブラウザーを動かすドライバーを使った system spec で確かめられます。</li>
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
    { title: 'Testing Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/testing.html', accessed: '2026-11-27', version: 'Rails 8.1', note: '結合テストとシステムテスト（Capybara、ブラウザー）、テストのトランザクション。' },
    { title: 'Testing Rails Applications（Testing Parallel Transactions）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/testing.html#testing-parallel-transactions', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '並行するトランザクションはテストのトランザクションの中で互いに待つので、use_transactional_tests = false にしてデータを自分で消すこと。' },
    { title: 'rspec-rails: lib/rspec/rails/example/rails_example_group.rb・request_example_group.rb', publisher: 'rspec/rspec-rails（GitHub）', url: `${RR}/example/rails_example_group.rb`, accessed: '2026-11-11', version: 'rspec-rails 8.1.0', note: 'すべての Rails 用の例に ActiveJob::TestHelper を include すること、request spec が ActionDispatch::Integration::Runner を使うこと。' },
    { title: 'activerecord/lib/active_record/test_fixtures.rb・connection_pool.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb#L336-L350', accessed: '2026-11-11', version: 'Rails 7.2.4', note: '7.2 にも同じ pin_connection! があること。テスト環境の ActiveJob のアダプターの既定値（activejob/lib/active_job/railtie.rb）。' },
    { title: 'activerecord/lib/active_record/test_fixtures.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/test_fixtures.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'setup_transactional_fixtures と teardown_transactional_fixtures（pin_connection!・unpin_connection!）。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/transaction.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/transaction.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'begin_transaction で、外側が joinable でなければ内側の終わりで commit のコールバックを実行すること。' },
    { title: 'rspec-rails: lib/generators/rspec/install/install_generator.rb・model/templates/model_spec.rb', publisher: 'rspec/rspec-rails（GitHub）', url: 'https://github.com/rspec/rspec-rails/blob/v8.1.0/lib/generators/rspec/install/install_generator.rb', accessed: '2026-11-13', version: 'rspec-rails 8.1.0', note: 'rspec:install が .rspec・spec_helper.rb・rails_helper.rb を作ること。rspec:model が pending だけの spec を作ること。rails_helper の maintain_test_schema! と use_transactional_fixtures。' },
    { title: 'Model specs', publisher: 'RSpec（rspec.info）', url: 'https://rspec.info/features/8-0/rspec-rails/model-specs/', accessed: '2026-11-13', version: 'rspec-rails 8.x', note: 'model spec は type: :model で指定し、ActiveSupport::TestCase の機能を含むこと。' },
    { title: 'Built in matchers', publisher: 'RSpec（rspec.info）', url: 'https://rspec.info/features/3-13/rspec-expectations/built-in-matchers/', accessed: '2026-11-13', version: 'rspec-expectations 3.13', note: 'be は equal?、eq は == で比べること。include などの組み込みのマッチャー。' },
    { title: 'RSpec Core 3.13（rspec コマンド）', publisher: 'RSpec（rspec.info）', url: 'https://rspec.info/features/3-13/rspec-core/', accessed: '2026-11-16', version: 'rspec-core 3.13', note: 'rspec コマンドに spec のファイルを渡して実行すること。short_title の例は rspec-core 3.13.7（Ruby 4.0.9）で実測。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/config/databases/mysql.yml.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/databases/mysql.yml.tt`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'development・test・production のデータベース名（アプリケーション名_development など）と、test のデータベースは作り直されるので開発用・本番用と同じにしないという注意書き。rails new demo -d mysql で生成して確認。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/config/environments/test.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/environments/test.rb.tt`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'テスト環境の cache_store = :null_store、active_storage.service = :test、delivery_method = :test（deliveries の配列に入れる）。' },
    { title: "Testing Rails Applications", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/testing.html", accessed: "2026-11-20", version: "Rails 8.1", note: "Rails のテストの種類、システムテストの実行条件。" },
    { title: "RSpec Rails", publisher: "RSpec", url: "https://rspec.info/features/8-0/rspec-rails/", accessed: "2026-11-20", version: "RSpec Rails 8.0", note: "RSpec Rails の各 spec と仕様の記述。" },
    { title: "FactoryBot Getting Started", publisher: "thoughtbot/factory_bot", url: "https://github.com/thoughtbot/factory_bot/blob/main/GETTING_STARTED.md", accessed: "2026-11-20", note: "factory の作成方法、trait、関連データ。" },
    { title: "WebMock", publisher: "bblimke/webmock", url: "https://github.com/bblimke/webmock", accessed: "2026-11-20", note: "HTTP スタブと外部通信の制限。" },
    { title: "Devise", publisher: "heartcombo/devise", url: "https://github.com/heartcombo/devise", accessed: "2026-11-20", note: "構成モジュール、設定、テストと画面のカスタマイズ。" },
    { title: "Capybara", publisher: "teamcapybara/capybara", url: "https://github.com/teamcapybara/capybara", accessed: "2026-11-20", note: "ドライバーとブラウザーの操作・待機。" },
    { title: "ruby/setup-ruby", publisher: "ruby/setup-ruby", url: "https://github.com/ruby/setup-ruby", accessed: "2026-11-20", note: "CI の Ruby と Bundler の設定。" },
    { title: "Building and testing Ruby", publisher: "GitHub Docs", url: "https://docs.github.com/en/actions/tutorials/build-and-test-code/ruby", accessed: "2026-11-20", note: "Ruby のテストの自動実行と成果物の保存。" },
    { title: "RSpec Mocks – Verifying doubles", publisher: "RSpec", url: "https://rspec.info/features/3-13/rspec-mocks/verifying-doubles/", accessed: "2026-11-27", version: "RSpec Mocks 3.13", note: "実際のクラスが提供するメソッドと引数を確認するテスト用の代役。" },
  ],
}

export default withExplanations(ch20, explanation20)
