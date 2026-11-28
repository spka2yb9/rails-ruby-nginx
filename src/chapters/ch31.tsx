import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { PublicationFigure } from '../visuals/rails-figures'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 53-1 原典の主張を3つの問いで読む ---------- */
function ReadingFigure() {
  return (
    <Svg
      id="53-1"
      w={760}
      h={300}
      label="左に原典の主張として、Concern でモデルの関心事をまとめるという2012年の記事を置く。そこから3本の矢印が、何を得たいのか（仕様を探す場所が名前で分かる）、何を引き受けるのか（同じクラスに組み込まれ状態を共有する）、どの条件なら見直すのか（独自の状態や関連を持ち始めた）の3つの問いに分かれる。3つの問いの答えと、下から入る自分のアプリの事実（チーム、要件、運用）を合わせて、右端で自分のアプリの判断（公開は Concern に、検索用のデータは別のオブジェクトに）を決める"
    >
      <Box x={20} y={95} w={170} h={110} lines={['原典の主張', 'Concern でモデルの', '関心事をまとめる', '（2012年）']} fill="box4" bold subTone="muted" />
      <Box x={250} y={20} w={250} h={64} lines={['何を得たいのか', '仕様を探す場所が名前で分かる']} bold subTone="muted" />
      <Box x={250} y={118} w={250} h={64} lines={['何を引き受けるのか', '同じクラスに組み込まれ状態を共有']} bold subTone="muted" />
      <Box x={250} y={216} w={250} h={64} lines={['どの条件なら見直すのか', '独自の状態や関連を持ち始めた']} bold subTone="muted" />
      <Arrow x1={190} y1={150} x2={248} y2={52} />
      <Arrow x1={190} y1={150} x2={248} y2={150} />
      <Arrow x1={190} y1={150} x2={248} y2={248} />
      <Box x={570} y={60} w={170} h={110} lines={['自分のアプリの判断', '公開は Concern に', '検索用のデータは', '別のオブジェクトに']} fill="box5" bold subTone="muted" />
      <Arrow x1={500} y1={52} x2={568} y2={115} />
      <Arrow x1={500} y1={150} x2={568} y2={115} />
      <Arrow x1={500} y1={248} x2={568} y2={115} />
      <Box x={570} y={214} w={170} h={60} lines={['自分のアプリの事実', 'チーム・要件・運用']} fill="box4" bold subTone="muted" />
      <Arrow x1={655} y1={214} x2={655} y2={172} />
    </Svg>
  )
}

/* ---------- 図 53-2 Majestic Monolith と Citadel ---------- */
function CitadelFigure() {
  return (
    <Svg
      id="53-2"
      w={760}
      h={300}
      label="左は Majestic Monolith。1つの Rails アプリの中に Web のプロセス（Puma）とジョブのプロセス（Sidekiq）があり、同じコードの同じリリースを動かし、同じモデルを呼んで MySQL を使う。右は Citadel。中心のモノリスはそのまま残り、負荷の性質が違う一部だけを Outpost として外に出す。モノリスと Outpost の間は通信でつながり、認証、API の互換性、通信の失敗、配備の順序を扱う仕事が増える"
    >
      <T x={190} y={22} anchor="middle" bold>Majestic Monolith</T>
      <Box x={20} y={36} w={340} h={144} fill="bg" dashed />
      <T x={34} y={58} fs={12}>1つの Rails アプリ（同じコード・同じリリース）</T>
      <Box x={40} y={74} w={140} h={56} lines={['Web のプロセス', 'Puma']} subTone="muted" />
      <Box x={200} y={74} w={140} h={56} lines={['ジョブのプロセス', 'Sidekiq']} subTone="muted" />
      <T x={190} y={160} anchor="middle" fs={12} tone="muted">どちらも同じモデルを呼ぶ</T>
      <Arrow x1={190} y1={180} x2={190} y2={218} />
      <Box x={110} y={220} w={160} h={48} lines="MySQL" fill="box4" />

      <T x={490} y={22} anchor="middle" bold>Citadel</T>
      <Box x={390} y={36} w={200} h={144} fill="bg" dashed />
      <T x={402} y={58} fs={12}>中心のモノリス</T>
      <Box x={402} y={74} w={88} h={56} lines={['Web', 'Puma']} fs={12} subTone="muted" />
      <Box x={496} y={74} w={86} h={56} lines={['ジョブ', 'Sidekiq']} fs={12} subTone="muted" />
      <Arrow x1={490} y1={180} x2={490} y2={218} />
      <Box x={410} y={220} w={160} h={48} lines="MySQL" fill="box4" />
      <Arrow x1={592} y1={108} x2={638} y2={108} both />
      <T x={615} y={98} anchor="middle" fs={11} tone="muted">通信</T>
      <Box x={640} y={58} w={110} h={100} lines={['Outpost', '負荷の性質が', '違う一部']} fs={12} fill="box5" bold subTone="muted" />
      <T x={575} y={292} anchor="middle" fs={11} tone="muted">Outpost で増える仕事：認証・API の互換性・通信の失敗・配備の順序</T>
    </Svg>
  )
}

/* ---------- 図 53-3 Concern と別のオブジェクト ---------- */
function ConcernFigure() {
  return (
    <Svg
      id="53-3"
      w={760}
      h={260}
      label="左は Concern に分けた場合。Publishable と Searchable の2つのモジュールは同じ1つの Article のオブジェクトに組み込まれ、Publishable の prepare_search が @search_payload というインスタンス変数に書き、Searchable の push_to_index がそれを読む。右は別のオブジェクトに分けた場合。Article を引数として Search::Document に渡し、Search::Document は attributes の Hash を戻り値として返し、ジョブがその Hash を検索サービスへ送る"
    >
      <T x={185} y={22} anchor="middle" bold>Concern に分けた場合</T>
      <Box x={20} y={36} w={330} h={204} />
      <T x={34} y={56} fs={12} bold>Article のオブジェクト（1つ）</T>
      <Box x={34} y={72} w={148} h={60} lines={['Publishable', 'prepare_search']} fill="box2" mono fs={12} subTone="muted" />
      <Box x={190} y={72} w={148} h={60} lines={['Searchable', 'push_to_index']} fill="box2" mono fs={12} subTone="muted" />
      <Arrow x1={108} y1={132} x2={150} y2={176} />
      <Arrow x1={220} y1={176} x2={264} y2={134} />
      <T x={110} y={162} fs={11} tone="muted" anchor="end">書く</T>
      <T x={262} y={162} fs={11} tone="muted">読む</T>
      <Box x={95} y={178} w={180} h={44} lines="@search_payload" fill="box5" mono fs={12} />

      <T x={570} y={22} anchor="middle" bold>別のオブジェクトに分けた場合</T>
      <Box x={396} y={46} w={150} h={46} lines="Article" mono fs={12} />
      <Arrow x1={546} y1={69} x2={594} y2={69} />
      <T x={570} y={60} anchor="middle" fs={11} tone="muted">引数</T>
      <Box x={596} y={46} w={150} h={46} lines="Search::Document" mono fs={12} />
      <Arrow x1={671} y1={92} x2={671} y2={128} />
      <T x={679} y={114} fs={11} tone="muted">戻り値</T>
      <Box x={596} y={130} w={150} h={46} lines="attributes（Hash）" fill="box4" mono fs={12} />
      <Arrow x1={671} y1={176} x2={671} y2={198} />
      <T x={663} y={192} fs={11} tone="muted" anchor="end">ジョブが送る</T>
      <Box x={596} y={200} w={150} h={40} lines="検索サービス" fill="box4" fs={12} />
    </Svg>
  )
}

/* ---------- 図 53-4 公開の要求の流れ ---------- */
function PublishSequenceFigure() {
  const lanes = [80, 280, 490, 680]
  return (
    <Svg
      id="53-4"
      w={760}
      h={430}
      label="ブラウザー、Articles::PublicationsController、Article（Publishable）、DB の4つを左から並べ、上から時間の順に書いた図。ブラウザーが POST /articles/42/publication を送る。コントローラーが Current.user.articles から記事を取得し、DB が自分の記事を返す。コントローラーが publish! を呼ぶ。Article が SELECT FOR UPDATE で記事を読み直し、DB が現在の状態を返す。Article が公開済みか下書きかを判断し、UPDATE と COMMIT を送る。Article が self を返し、コントローラーが 303 See Other で記事のページへ移動させる"
    >
      <Box x={20} y={16} w={120} h={44} lines="ブラウザー" fill="box4" />
      <Box x={190} y={16} w={180} h={44} lines={['Articles::', 'PublicationsController']} mono fs={11.5} />
      <Box x={400} y={16} w={180} h={44} lines={['Article', '（Publishable）']} fill="box5" fs={12} />
      <Box x={620} y={16} w={120} h={44} lines="DB" fill="box4" />
      {lanes.map((x) => (
        <Arrow key={x} x1={x} y1={60} x2={x} y2={420} dashed plain />
      ))}
      <Arrow x1={80} y1={90} x2={278} y2={90} />
      <T x={180} y={82} anchor="middle" fs={11} mono>POST /articles/42/publication</T>
      <Arrow x1={280} y1={130} x2={678} y2={130} />
      <T x={385} y={122} anchor="middle" fs={11}>Current.user.articles から記事を取得</T>
      <Arrow x1={680} y1={165} x2={282} y2={165} dashed />
      <T x={385} y={157} anchor="middle" fs={11} tone="muted">自分の記事</T>
      <Arrow x1={280} y1={205} x2={488} y2={205} />
      <T x={385} y={197} anchor="middle" fs={11} mono>publish!</T>
      <Arrow x1={490} y1={245} x2={678} y2={245} />
      <T x={585} y={237} anchor="middle" fs={11}>SELECT … FOR UPDATE</T>
      <Arrow x1={680} y1={280} x2={492} y2={280} dashed />
      <T x={585} y={272} anchor="middle" fs={11} tone="muted">現在の状態</T>
      <Arrow d="M490,302 L530,302 L530,324 L494,324" />
      <T x={538} y={317} fs={11}>公開済みか・下書きかを判断</T>
      <Arrow x1={490} y1={355} x2={678} y2={355} />
      <T x={585} y={347} anchor="middle" fs={11}>UPDATE と COMMIT</T>
      <Arrow x1={490} y1={385} x2={282} y2={385} dashed />
      <T x={385} y={377} anchor="middle" fs={11} mono tone="muted">self</T>
      <Arrow x1={280} y1={412} x2={82} y2={412} dashed />
      <T x={180} y={404} anchor="middle" fs={11} tone="muted">303 See Other（記事のページへ）</T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 31,
  part: 7,
  title: 'DHH の思想・設計',
  summary:
    'Rails の作者 DHH の主張を、製品とチームの条件とあわせて読みます。Rails Doctrine、Majestic Monolith、モデルの API、Concern、REST、コールバックと CurrentAttributes、テストの考え方を記事アプリに当てはめ、編集者の承認つきの公開の設計と、レビューでの説明まで進めます。',
  goals: [
    'DHH の主張を、得たいもの・引き受けるもの・見直す条件に分けて読める',
    'Rails Doctrine の柱と Majestic Monolith・Citadel を、自分のアプリの構成の判断に当てはめられる',
    'モデルの API、PORO、Concern の使い分けと、Concern に移しても残る依存を説明できる',
    '公開のような操作を REST のリソースとして表し、HTTP のリソースとテーブルを区別できる',
    'コールバックと CurrentAttributes の使いどころと、ジョブに実行者を渡す方法を説明できる',
    'テストの配置を守りたい振る舞いから決め、承認つきの公開を DB の制約・ロック・テストで設計できる',
  ],
  prerequisites: [1, 5, 9, 14, 15, 18, 20, 30],
  sections: [
    {
      id: 'reading-dhh',
      title: 'DHH の設計論をどう読むか',
      body: (
        <>
          <p>
            Rails の作者 David Heinemeier Hansson（DHH）は、Basecamp や HEY を開発する 37signals の共同所有者です。本人のサイトによると、Rails は 2003 年に作られ、2004 年に公開した Basecamp が最初の Rails アプリケーションです。<Ref n={1} />
            DHH の設計論は、自社の製品を作り続けている開発者が、その製品で選んだ方法を説明したものです。
          </p>
          <p>
            2016 年の記事「The Majestic Monolith」によると、Basecamp は Web・iOS・Android・Mac・Windows・メールの6つの経路で提供され、それを 12 人のプログラマーと 7 人のデザイナーで作っていました。同じ記事は、数千人の開発者がいる Amazon や Google のような組織では、サービスに分ける以外に作業を調整する方法がないとも書いています。<Ref n={2} />
            2018 年の動画シリーズ「On Writing Software Well」も、実際の Basecamp のコードを題材に、その選択をしたときに何を考えていたかを説明するものです。<Ref n={3} />
            同じ主張でも、少人数で一つの製品を育てるチームと数千人の組織とでは、当てはまる度合いが変わります。
          </p>
          <h3>主張を3つの問いで読む</h3>
          <p>本章では DHH の主張を次の3つの問いで読みます。</p>
          <ol>
            <li>何を得たいのか：読みやすい API、変更の速さ、少人数で全体を把握できることなど。</li>
            <li>何を引き受けるのか：Rails への依存、コードに書かれない暗黙の処理、複数の箇所で共有する実行時の値など。</li>
            <li>どの条件なら見直すのか：独立した業務の概念が見つかった、副作用を追えなくなった、性能の限界を計測で確かめた、など。</li>
          </ol>
          <p>
            例として、2012 年の記事で DHH が勧めた Concern（モデルのメソッドや関連をモジュールに分けて include する書き方。仕組みは<ChapterLink n={5} section="concern" />）を読みます（図 53-1）。<Ref n={4} />
            得たいものは <code>current_account.posts.visible_to(current_user)</code> のように呼び出し側から自然に読める API と、仕様を探す場所が名前で分かることです。引き受けるものは、Concern がすべて同じクラスに組み込まれ、インスタンス変数とメソッドを共有することです。見直す条件は、まとめた関心事が独自の状態や関連を持ち始めたときです。結論だけを真似て関係のないメソッドを詰めると、得たいものは得られず、引き受けるものだけが残ります。
          </p>
          <Figure n="53-1" title="原典の主張を3つの問いで読む" caption="Concern の記事を例にした模式図。右端の判断は本書の記事アプリでの例。">
            <ReadingFigure />
          </Figure>
          <p>
            図は左から右へ読みます。原典の主張から自分の判断へ直接の矢印を引かず、3つの問いと、自分のアプリの事実（チームの人数、要件、運用の体制）を経由させています。原典の結論をそのまま採用せず、自分の条件を確かめる段階を置くためです。
          </p>
          <p>
            本章では DHH 本人の主張に原典を示し、37signals の Jorge Manrubia の記事は著者を明記して、同社の実践の説明として使います。記事アプリのコードと判断の基準は本書の応用例で、原典のコードを写したものではありません。
          </p>
          <h3>強い言葉をそのまま禁止のルールにしない</h3>
          <p>
            記事の題名は議論を起こすために強い言葉を使うことがあります。次の表の右の列は、原典を踏まえて本書が立てた問いで、DHH の発言の引用ではありません。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">読み違えやすい結論</th>
                  <th scope="col">設計するときに問い直すこと</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>「モデルに置くなら、全部 Active Record のクラスに書く」</td>
                  <td>モデル層で表す概念は何か。普通の Ruby のクラスや別のモデルに任せる部分はあるか</td>
                </tr>
                <tr>
                  <td>「Concern なら何でも分けてよい」</td>
                  <td>同じオブジェクトのどの関心事をまとめるのか。別のオブジェクトにした方が自然ではないか</td>
                </tr>
                <tr>
                  <td>「モノリスなら構造を整理しなくてよい」</td>
                  <td>一人で変更を追えるように、アプリの内部の依存と呼び出しの流れが整理されているか</td>
                </tr>
                <tr>
                  <td>「TDD 批判は、テストが要らないという意味」</td>
                  <td>テストの価値と、テストの方式のために払う設計の費用を分けて考えているか</td>
                </tr>
                <tr>
                  <td>「Rails の流儀なら Service Object は禁止」</td>
                  <td>そのクラスが解決する具体的な問題は何か。モデルの操作で足りないか</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            たとえばレビューで「公開の処理を Service に移すべきか」が議題になったら、賛否より先に、公開日時の更新、通知の失敗、承認の履歴の保存を書き出します。日時は記事のモデル、履歴は専用の記録、通知は配信の境界と持ち主を決めてから、それらを順に呼ぶ進行役が要るかを判断します（<ChapterLink n={33} section="service-contract">Service Object の契約</ChapterLink>）。
          </p>
        </>
      ),
    },
    {
      id: 'doctrine',
      title: 'Rails Doctrine の9つの柱',
      body: (
        <>
          <p>
            The Rails Doctrine は、DHH が Rails の価値観を9つの柱にまとめた文書です。<Ref n={5} />
            設定より規約と omakase の基本は<ChapterLink n={1} section="rails-way">Rails の規約と設計思想</ChapterLink>で説明したので、ここでは各柱が本章のどこに関わるかを示します。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">柱</th>
                  <th scope="col">内容</th>
                  <th scope="col">本章で関わる箇所</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Optimize for programmer happiness</td>
                  <td>プログラマーが気持ちよく書き、読み、変更できることを優先する</td>
                  <td>章全体</td>
                </tr>
                <tr>
                  <td>Convention over Configuration</td>
                  <td>共通の決まりを用意して、個別の設定を減らす</td>
                  <td>規約が画面までつながる例</td>
                </tr>
                <tr>
                  <td>The menu is omakase</td>
                  <td>組み合わせを考えた道具一式を提供する</td>
                  <td>テストの道具の差し替え</td>
                </tr>
                <tr>
                  <td>No one paradigm</td>
                  <td>一つの設計の考え方の純粋さにこだわらない</td>
                  <td>Active Record、Concern</td>
                </tr>
                <tr>
                  <td>Exalt beautiful code</td>
                  <td>コードの美しさも設計の価値として扱う</td>
                  <td>モデルの API の名前</td>
                </tr>
                <tr>
                  <td>Provide sharp knives</td>
                  <td>強力な道具を渡し、使い方を学ぶ開発者を信頼する</td>
                  <td>Concern、コールバック、CurrentAttributes</td>
                </tr>
                <tr>
                  <td>Value integrated systems</td>
                  <td>統合された一つのシステムで問題の全体を扱う</td>
                  <td>Majestic Monolith</td>
                </tr>
                <tr>
                  <td>Progress over stability</td>
                  <td>必要な変更を受け入れてフレームワークを進化させる</td>
                  <td>Rails の既定のテスト構成の変更</td>
                </tr>
                <tr>
                  <td>Push up a big tent</td>
                  <td>好みや使い方の違う人もコミュニティに迎え入れる</td>
                  <td>（本章では扱わない）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            No one paradigm は、Active Record がデータベースとのやり取りと業務のロジックを一つのクラスに混ぜることを、純粋さを重んじる人が嫌うと認めたうえで選んでいます。Provide sharp knives は Concern を誤用もできる道具の例に挙げ、一つのクラスに、関係しながら別々に理解できる複数の関心事を収める仕組みだと説明しています。<Ref n={5} />
          </p>
          <h3>規約と omakase で判断の数を減らす</h3>
          <p>
            2012 年の「Rails is omakase」で DHH は、料理人が材料と出す順番を選ぶ「おまかせ」の献立のように、Rails の作り手が道具と API を選んで組み合わせていると説明しました。差し替えも常識の範囲で認めていて、test/unit が嫌なら RSpec を持ち込めばよいと書いています。<Ref n={6} />
            本書の読者の多くが使っている RSpec は、この差し替えの例です。差し替えるときは、必要な機能、既存のコードとの整合、チームが保守できるかを比べます（<ChapterLink n={28} section="gem-selection">gem の選び方</ChapterLink>）。
          </p>
          <h3>規約が画面までつながる例</h3>
          <p>
            記事アプリに「自分の記事の一覧」を加えるなら、最初は次の構成で足ります。ログインした利用者が <code>Current.user</code> に入っていて（<ChapterLink n={21} section="authentication">認証</ChapterLink>）、User に <code>has_many :articles</code> がある前提です。
          </p>
          <Code
            lang="ruby"
            title="config/routes.rb と app/controllers/articles_controller.rb"
            code={`
# config/routes.rb
resources :articles, only: %i[index show]

# app/controllers/articles_controller.rb
class ArticlesController < ApplicationController
  def index
    @articles = Current.user.articles.order(created_at: :desc, id: :desc).limit(30)
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/articles/index.html.erb と _article.html.erb"
            code={`
<%# app/views/articles/index.html.erb %>
<h1>自分の記事</h1>
<%= render @articles %>

<%# app/views/articles/_article.html.erb %>
<article>
  <h2><%= link_to article.title, article %></h2>
</article>
`}
          />
          <p>
            ルート、コントローラー、テンプレート、パーシャルの名前の規約がつながっているので（<ChapterLink n={16} section="layout-partial">レイアウトとパーシャル</ChapterLink>）、「どのクラスがどのテンプレートを呼ぶか」を設定せずに、認可の範囲（<code>Current.user.articles</code>）と並び順に集中できます。パーシャルの選び方はテンプレートの言語の外にある規約なので、Slim で書いても変わりません。本章の検証では Rails 8.1.4.1 の1ファイルのアプリでこの3つのファイルを使い、ログインした利用者の記事だけが表示されることを確かめました。
          </p>
          <p>
            一方、組織ごとの公開件数を比べるダッシュボードのように検索の条件が複雑になったら、Query Object を候補にします（<ChapterLink n={33} section="query-objects">Query Object</ChapterLink>）。規約に従うことは、業務に固有の複雑さをコントローラーに詰める理由にはなりません。
          </p>
          <h3>美しさを読み手の体験として考える</h3>
          <p>
            Exalt beautiful code の柱は、<code>people.include? person</code> より <code>person.in? people</code> を好むと書いています。注目している person が先に来るからです。<Ref n={5} />
            本章では、呼び出しを読んで対象と目的が分かるかどうかで、コードの美しさを評価します。
          </p>
          <Code
            lang="ruby"
            code={`
# 記事に何をするのかが読める
article.publish!
article.comments.create!(body: "参考になりました", user: Current.user)

# 公開・集計・削除のどれが起きるのか読めない
article.process!
`}
          />
          <h3>一つの流儀にそろえる費用</h3>
          <p>
            同じ記事アプリでも、保存には Active Record、読了時間には普通の Ruby のクラス、表示の繰り返しにはパーシャルが合います。次の表は Doctrine の考え方を変更の例に当てはめた本書の比較です。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">変更</th>
                  <th scope="col">まず試す構成</th>
                  <th scope="col">設計を進める根拠</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>記事に副題を加える</td>
                  <td>マイグレーション、モデル、フォーム、パーシャルを変更する</td>
                  <td>複数の画面で違う入力の規則が増えたら Form Object を検討する</td>
                </tr>
                <tr>
                  <td>読了時間を表示する</td>
                  <td>小さなモデルのメソッド。意味が増えたら PORO にする</td>
                  <td>言語、文字の数え方、読む速さの方針がそれぞれ変わる</td>
                </tr>
                <tr>
                  <td>社外の検索 API に記事を送る</td>
                  <td>専用のジョブと外部との境界</td>
                  <td>タイムアウト、重複、再送を管理する必要がある</td>
                </tr>
                <tr>
                  <td>管理画面で一括修正する</td>
                  <td>認可と検証をはっきり書いた専用の操作</td>
                  <td>コールバックを通すか、失敗したときにどこまで戻すかが通常の保存と違う</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            すべてを Service にそろえたり、データベースに依存しない形にしたりする前に、変更する人が理解しやすくなるかを確かめます。本章の「美しい」は短さに加えて、意図、失敗したときの結果、依存先を追えることも含みます。
          </p>
          <p>Rails の考え方と、KISS・DRY などのプログラミングの原則との関係は、<ChapterLink n={56} /> で扱います。</p>
        </>
      ),
    },
    {
      id: 'monolith',
      title: 'Majestic Monolith と Citadel',
      body: (
        <>
          <p>
            2016 年の「The Majestic Monolith」で DHH は、少人数のチームが大きな製品を保守するという条件から、統合したアプリケーションを選ぶ理由を説明しています。サービスに分けると、分散システムの多くの失敗の状態、サービスが止まったときの対応、複数のサービスをそろえて移行する作業を引き受けます。不要な概念をできるだけ減らした統合システムを、Majestic（堂々とした）と呼んでいます。<Ref n={2} />
          </p>
          <p>
            ここでいうモノリスは、アプリのコードと機能を一つにまとめる設計のことです。Web とジョブを別のプロセスで動かすこと、Web サーバーを複数台にすること、データベースを別のサーバーに置くこととも両立します（<ChapterLink n={23} section="process">プロセス</ChapterLink>、<ChapterLink n={25} section="composition">構成</ChapterLink>）。記事アプリなら、公開・コメント・通知を同じアプリに置き、画面の表示もジョブ（<ChapterLink n={18} />）も同じモデルを呼びます。アプリの中はクラス・モジュール・名前空間で整理します。
          </p>
          <h3>限界が具体的になったら Citadel にする</h3>
          <p>
            2020 年の「The Majestic Monolith can become The Citadel」で DHH は、モノリスを中心に残したまま、性質の違う一部の振る舞いを Outpost と呼ぶ別の部品に任せる形を、Citadel と名付けました。ほとんどのアプリケーションは Majestic Monolith で始めて最後まで足りるとし、限界に当たってもまずモノリスを改善するよう勧めています。Outpost を検討する場面として挙げているのは、大きなチームで変更が頻繁に衝突する場合と、極端な負荷での性能・可用性の問題をモノリスの技術の選択の中で解決できない場合です。<Ref n={7} />
          </p>
          <p>
            実例は 2005 年のチャット Campfire です。各クライアントが3秒ごとに新しいメッセージを問い合わせ、応答の大半は空でも、要求のたびに認証とデータベースへの問い合わせが必要でした。この処理は全要求の約 99% を占める一方、Ruby で 20 行ほどの単純な処理だったので、Outpost として切り出されました。<Ref n={7} />
          </p>
          <Figure n="53-2" title="Majestic Monolith と Citadel" caption="DHH の2つの記事をもとにした模式図。プロセスの名前とデータベースは本書の構成に合わせた。">
            <CitadelFigure />
          </Figure>
          <p>
            図の左の Majestic Monolith では、Web とジョブは別のプロセスでも、同じコードの同じリリースを動かします。右の Citadel では、負荷の性質が違う一部だけを Outpost にしています。図の下に書いた、認証・API の互換性・通信の失敗・配備の順序を扱う仕事は、切り出すと増えるものです。切り出すかどうかは、これらの仕事を引き受けるかどうかの判断でもあります。
          </p>
          <p>
            本書では、どの処理の負荷や障害を分けたいのかと、分けた後の通信・データの整合性・運用を誰が扱うのかを説明できることを、切り出しの条件にします。まず計測で遅い箇所を特定し（<ChapterLink n={22} section="breakdown">処理時間の内訳</ChapterLink>）、その後で検討します。
          </p>
          <h3>記事の PDF 出力が遅くなった場合</h3>
          <p>PDF の出力を加えたらブラウザーへの応答が遅くなった、という本書の架空の例です。別のサービスにすると決める前に、どの資源が足りないのかを調べます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">観測した問題</th>
                  <th scope="col">最初の改善</th>
                  <th scope="col">さらに分ける条件</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>出力する記事を読む SQL が遅い</td>
                  <td>クエリ、インデックス、取得する件数を改善する</td>
                  <td>データベースの読み取りの設計では解決しない独立した要件がある</td>
                </tr>
                <tr>
                  <td>PDF の生成が Web のスレッドを長く占有する</td>
                  <td>ジョブに移し、受け付けとダウンロードを分ける</td>
                  <td>同じ実行環境のほかのジョブに影響する</td>
                </tr>
                <tr>
                  <td>PDF の生成だけがメモリーを多く使う</td>
                  <td>専用のキューとワーカーのプロセスを用意する</td>
                  <td>別の実行環境や障害の隔離が必要になる</td>
                </tr>
                <tr>
                  <td>生成エンジンの依存と障害がほかと独立している</td>
                  <td>入力・出力・状態を記録する境界を作る</td>
                  <td>通信・再試行・配備を引き受ける費用に見合う</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            同じコードベースのジョブを専用のキューとワーカーで動かす構成は（<ChapterLink n={18} section="queue-planning">キューの設計</ChapterLink>）、まだモノリスです。別のサービスにすると、呼び出しのタイムアウト、PDF ができたか分からない状態、出力の重複、互換性の維持が加わります。
          </p>
          <Code
            lang="ruby"
            title="app/jobs/render_article_pdf_job.rb"
            code={`
class RenderArticlePdfJob < ApplicationJob
  queue_as :exports

  def perform(export_id)
    export = ArticleExport.find(export_id)
    export.render!
  end
end
`}
          />
          <p>
            <code>ArticleExport</code> は本書で想定する出力の依頼のモデルで、出力する改訂、依頼者、pending・running・completed・failed の状態、生成したファイルを持ち、<code>render!</code> がやり直しと保存を受け持ちます。ジョブに移しただけでは、この取り決めは実装されません。「画面が待たなくてよいこと」と「重複や途中の失敗から回復できること」は分けて確かめます（<ChapterLink n={18} section="idempotency">べき等性</ChapterLink>）。
          </p>
          <p>
            DDD（ドメイン駆動設計）や Clean Architecture との比較は<ChapterLink n={34} section="rails-way-ddd">Rails の流儀と DDD</ChapterLink>で扱います。本章の立場からは、Active Record の取得や検証を中継するだけの Repository を全モデルに作ると、独自の取り決めがないまま読む箇所だけが増えると判断します。
          </p>
        </>
      ),
    },
    {
      id: 'model-api',
      title: 'モデルの API で業務の意味を表す',
      body: (
        <>
          <p>
            前節で挙げた Concern の記事で DHH は、<code>current_account.posts.visible_to(current_user)</code> と書けることを、3つ目のクエリ用のオブジェクトを持ち出すより好むと書いています。<Ref n={4} />
            呼び出し側から自然に使えるモデルの API を重視しています。記事アプリなら、「記事を公開する」を、属性を更新する手順から、モデルに頼む操作にまとめます。
          </p>
          <Code
            lang="ruby"
            code={`
# 呼び出し側が、公開した状態の作り方を知っている
article.update!(status: :published, published_at: Time.current)

# 公開の条件と状態の変更を、モデルの API にまとめる
article.publish!
`}
          />
          <p>
            あとから「アーカイブした記事は公開できない」「公開済みの記事に再び実行しても公開日時を変えない」という規則が増えても、<code>publish!</code> を直せば、コントローラーとジョブの両方に反映されます。ただし、別のコードが <code>update!</code> を直接呼べば規則は通らないので、どの経路でも守る条件は検証や DB の制約でも守ります（<ChapterLink n={14} section="validation-design">検証の設計</ChapterLink>、<ChapterLink n={27} section="indexes-constraints">インデックスと制約</ChapterLink>）。
          </p>
          <h3>モデル層には Active Record も普通の Ruby のクラスも置ける</h3>
          <p>
            Jorge Manrubia の「Vanilla Rails is plenty」（2022 年）によると、37signals はアプリケーション層とドメイン層を分けず、ドメインのモデルをアプリケーションの API とみなし、単純な場面ではコントローラーからモデルを直接使います。アクションごとに service や interactor を作ることは既定にしておらず、この作り方で約 400 のコントローラーと 500 のモデルを持つ Basecamp 3 を保守しています。複雑な操作の中身は別のクラスに任せていて、<code>recording.incinerate</code>（記録を完全に消す）の中では <code>Recording::Incineration</code> というクラスが仕事をします。<Ref n={8} />
          </p>
          <Code
            lang="ruby"
            title="「Vanilla Rails is plenty」が比べた3つの呼び出し方"
            code={`
recording.incinerate
Recording::Incineration.new(recording).run
Recording::IncinerationService.execute(recording)
`}
          />
          <p>
            記事は1行目の形で呼べるようにしたうえで、手続きを表す名前（〜Service）より、業務の名前を持つオブジェクトを選んでいます。
          </p>
          <p>
            Active Record を継承しない普通の Ruby のクラスを <Term en="Plain Old Ruby Object">PORO</Term> と呼びます。記事アプリでは表したいものごとに次のように分けられます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">表したいもの</th>
                  <th scope="col">設計の候補</th>
                  <th scope="col">選ぶ理由</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>保存された記事</td>
                  <td><code>Article &lt; ApplicationRecord</code></td>
                  <td>属性・関連・業務の振る舞いを持つ</td>
                </tr>
                <tr>
                  <td>記事を公開する操作</td>
                  <td><code>Article#publish!</code>、必要なら <code>Article::Publishable</code></td>
                  <td>記事への操作として読める</td>
                </tr>
                <tr>
                  <td>読了時間の計算</td>
                  <td><code>Article::ReadingTime</code> などの PORO</td>
                  <td>計算に独自の意味があり、データベースの行がなくても計算できる</td>
                </tr>
                <tr>
                  <td>誰がいつ公開したかの記録</td>
                  <td><code>Publication &lt; ApplicationRecord</code></td>
                  <td>公開そのものの属性と関連を保存する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            「モデルに振る舞いを置く」方針でも、Article が計算や処理をすべて自分で実装する必要はありません。Service Object を検討するときも、そのクラスが表す概念と、読み手の理解がどう変わるかを先に確かめます。名前を変えただけでは責務は変わりません。大きくなったモデルの整理は<ChapterLink n={30} section="fat-model">Fat Model の評価</ChapterLink>で扱います。
          </p>
          <h3>ReadingTime はデータベースの行を使わない</h3>
          <p>日本語の記事が中心のアプリで、本文の文字数から読了時間を見積もる例です。1分あたり 500 文字は本章の仮の製品仕様で、一般的な読む速さを示す数字ではありません。</p>
          <Code
            lang="ruby"
            title="app/models/article/reading_time.rb と、Article に加えるメソッド"
            code={`
# app/models/article/reading_time.rb
class Article::ReadingTime
  def initialize(text:, characters_per_minute: 500)
    unless characters_per_minute.is_a?(Integer) && characters_per_minute.positive?
      raise ArgumentError, "positive reading speed required"
    end
    @text = text
    @characters_per_minute = characters_per_minute
  end

  def minutes
    characters = @text.gsub(/[[:space:]]/, "").length
    characters.fdiv(@characters_per_minute).ceil
  end
end

# app/models/article.rb に加えるメソッド
class Article < ApplicationRecord
  def reading_minutes
    Article::ReadingTime.new(text: body.to_s).minutes
  end
end
`}
          />
          <p>
            この例の body はプレーンテキストです。Action Text なら <code>body.to_plain_text</code> で表示される文字列を渡します。HTML のタグまで数えると見積もりが変わるので、テキストへの変換は Article の側が受け持ちます。空の本文は 0 分とし、「1分未満」と表示するかは表示の側で決めます。
          </p>
          <p>
            ReadingTime は Article のオブジェクトを受け取らず、本文と1分あたりの文字数だけを受け取るので、保存や関連を知らずに計算できます。計算が1行のうちは Article に直接書いて構いません。言語、文字の数え方、読む速さの方針がそれぞれ変わるようになったら、それが切り出す理由になります。次の spec はデータベースに接続せずに実行できます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/article/reading_time_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Article::ReadingTime do
  it "空白を除いた文字数を1分あたりの文字数で割り、切り上げる" do
    expect(described_class.new(text: "あ" * 501 + " \\n").minutes).to eq 2
  end

  it "空の本文は0分" do
    expect(described_class.new(text: " \\n").minutes).to eq 0
  end
end
`}
          />
          <p>
            データベースを使わないのは ReadingTime の責務が文字列の計算だからで、データベースを避けるために記事全体を Repository で包む設計とは理由が違います。
          </p>
          <h3>Model と Service の見た目が似ているとき</h3>
          <Code
            lang="ruby"
            code={`
# どちらも Ruby のオブジェクトに仕事を頼んでいる
article.publish!
Articles::Publish.new(article: article).call
`}
          />
          <p>
            書き方だけでは優劣は決まりません。公開してよいかの判断と日時の更新だけなら1行目が素直で、2行目のクラスが <code>article.update!</code> を呼ぶだけなら読む箇所が増えるだけです。複数の配信先への公開の依頼と、失敗したときの取り消しまで進める独立した仕事なら、専用の進行役を置く理由があります。その場合も Service から <code>article.publish!</code> を呼び、記事に固有の条件を外に写しません。「DHH ならどちらを選ぶか」を推測するより、原典にあるモデルの API への関心を手がかりに、今回の境界を説明します。
          </p>
        </>
      ),
    },
    {
      id: 'concern',
      title: 'Concern で一つのモデルの関心事をまとめる',
      body: (
        <>
          <p>
            Concern は一つのモデルの関心事を整理するためにも使います。2012 年の記事で DHH は、Basecamp に Trashable、Searchable、Visible、Movable、Taggable のような Concern が 40 近くあると書き、Person モデルだけに組み込む Dropboxed も例に挙げています。<Ref n={4} />
            複数のクラスで再利用することは、Concern を使う条件ではありません。include したときに何が起きるかは<ChapterLink n={5} section="concern">ActiveSupport::Concern の実装</ChapterLink>で扱いました。
          </p>
          <p>
            Jorge Manrubia の「Good concerns」（2022 年）によると、37signals は複数のモデルで使う Concern を <code>app/models/concerns</code> に、一つのモデルに固有の Concern をモデル名のディレクトリ（<code>app/models/recording/</code> など）に置きます。Concern には「〜という性質を持つ」「〜として振る舞う」と言える意味が必要で、大きなモデルを分けるための任意の入れ物にすると害の方が大きいとしています。<code>Account::Closable</code> の <code>terminate</code> が、実際の処理を <code>Account::Closing::Purging</code> などのクラスに任せる例も示しています。<Ref n={9} />
          </p>
          <p>次は記事の「公開」という関心事をまとめた例です。status は enum で draft・published・archived を持つ前提です。</p>
          <Code
            lang="ruby"
            title="app/models/article.rb と app/models/article/publishable.rb"
            code={`
# app/models/article.rb
class Article < ApplicationRecord
  include Publishable

  belongs_to :author, class_name: "User"
  enum :status, { draft: 0, published: 1, archived: 2 }
end

# app/models/article/publishable.rb
module Article::Publishable
  extend ActiveSupport::Concern

  class NotPublishable < StandardError; end

  def publish!
    with_lock do
      next if published?
      raise NotPublishable, "下書きの記事だけ公開できます" unless draft?

      update!(status: :published, published_at: Time.current)
    end
    self
  end
end
`}
          />
          <p>
            <code>publish!</code> は、公開済みなら何もせずに self を返し、下書きなら公開し、それ以外の状態なら例外を発生させます。<code>with_lock</code> は記事を FOR UPDATE で読み直してからブロックを実行するので（<ChapterLink n={15} section="pessimistic" />）、同時に呼ばれても順に処理され、2回目の実行で公開日時を上書きしません。<code>next</code> はブロックを抜けるだけで、トランザクションはコミットされます。ロックは本章の例で置いた要件のためのもので、DHH がすべてのメソッドにロックを勧めているわけではありません。
          </p>
          <p>
            この例は保存前の変更を一緒に公開する操作や予約投稿を扱っていないので、呼び出し元は保存済みで未保存の変更がない記事を渡します。そうした要件を加えるときは、状態の遷移とロックの範囲を設計し直します（<ChapterLink n={30} section="state-management">状態管理</ChapterLink>）。
          </p>
          <h3>分けた効果を判断する</h3>
          <p>
            公開の仕様を知りたい人は、<code>Article::Publishable</code> を開けば読めます。<code>ArticleMethods1</code> と <code>ArticleMethods2</code> のように機械的に分けても、変更する場所を判断する手がかりは増えません。また、Concern に移しても、実行時にはメソッドとコールバックが同じクラスに組み込まれます（図 53-3）。次の兆候があれば、別のクラスに任せることを検討します。
          </p>
          <ul>
            <li>複数の Concern が互いのインスタンス変数や private メソッドを前提にしている。</li>
            <li>include する順序によって業務の結果が変わる。</li>
            <li>その関心事が独自の状態・関連・ライフサイクルを持ち始めている。</li>
            <li>一つの仕様変更を追うだけで、関係の薄いファイルを何度も行き来する。</li>
          </ul>
          <Figure n="53-3" title="Concern と別のオブジェクトの違い" caption="次のコード例の2つの構成を比べた模式図。">
            <ConcernFigure />
          </Figure>
          <p>
            図の左では、Publishable と Searchable が同じ1つの Article のオブジェクトに組み込まれ、<code>@search_payload</code> を読み書きしています。右では、<code>Search::Document</code> が記事を引数で受け取り、作ったデータを戻り値で返します。右の形なら、何を受け取って何を返すかがメソッドの呼び出しに現れます。左の形で起きる問題を、次のコードで見ます。
          </p>
          <h3>Concern に移しただけでは変わらない依存</h3>
          <Code
            lang="ruby"
            title="避けたい例：別の Concern が作る状態を暗黙に前提にする"
            code={`
module Article::Searchable
  def push_to_index
    SearchClient.upsert(@search_payload)
  end
end

module Article::Publishable
  def prepare_search
    @search_payload = { id: id, title: title }
  end
end
`}
          />
          <p>
            <code>push_to_index</code> の前に <code>prepare_search</code> を呼ぶ必要があることが、引数にも名前にも現れていません。別の場所から <code>push_to_index</code> だけを呼ぶと、<code>@search_payload</code> が nil のまま検索サービスに送られます。改善するなら、検索用のデータをその場で作るメソッドにするか、ジョブから <code>Search::Document.new(article).attributes</code> を使い、外部の検索 API の呼び出しは専用の境界に置きます（<ChapterLink n={33} section="adapters">Adapter</ChapterLink>）。Concern は公開のコードを読む場所、Document は検索用のデータを作る責任、ジョブは実行の方法と、それぞれ変わる理由が違います。
          </p>
          <Code
            lang="text"
            code={`
app/models/article.rb                 記事の関連と、公開などの API を呼ぶ場所
app/models/article/publishable.rb     同じ Article の「公開」という関心事
app/models/article/reading_time.rb    値を受け取って計算する独立した PORO
app/models/publication.rb             公開の履歴を保存するモデル（必要になったら）
`}
          />
          <p>
            同じ <code>app/models</code> にあっても、ファイルごとに役割は違います。モデル層に置くクラスは、Active Record のサブクラスとは限りません。
          </p>
        </>
      ),
    },
    {
      id: 'rest-resources',
      title: 'REST で操作からリソースを見つける',
      body: (
        <>
          <p>
            DHH は 2006 年に Rails 1.2 のリリース候補を紹介した記事で、15 個のアクションを持つコントローラーを、それぞれ一つのリソースを CRUD で扱う2〜3個のコントローラーに変えることを勧め、コントローラーの設計がはっきりして複雑さが減ることを理由に挙げています。<Ref n={10} />
            REST はコントローラーの責務を考える道具でもあります。
          </p>
          <p>
            記事アプリの「記事を公開する」を、記事に対する公開（publication）を作る操作と捉え直します。単数リソースのルートと URL ヘルパーの名前は<ChapterLink n={9} section="resource-design">URL に表すリソースを選ぶ</ChapterLink>で説明しました。<code>POST /articles/:article_id/publication</code> が届くコントローラーは次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/articles/publications_controller.rb"
            code={`
class Articles::PublicationsController < ApplicationController
  before_action :set_article

  rescue_from Article::Publishable::NotPublishable do |error|
    redirect_to @article, alert: error.message, status: :see_other
  end

  def create
    @article.publish!
    redirect_to @article, notice: "公開しました", status: :see_other
  end

  def destroy
    @article.unpublish!
    redirect_to @article, notice: "公開を取り消しました", status: :see_other
  end

  private
    def set_article
      @article = Current.user.articles.find(params.expect(:article_id))
    end
end
`}
          />
          <p>
            「自分の記事だけ公開できる」という認可は、<code>Current.user.articles</code> の中から探すことで表しています。他人の記事の ID なら <code>find</code> が <code>ActiveRecord::RecordNotFound</code> を発生させ、応答は 404 になります（<ChapterLink n={21} section="object-authorization">レコード単位の認可</ChapterLink>）。コントローラーは HTTP の入力、許可された対象の取得、操作の呼び出し、応答を受け持ち、公開できる状態かどうかはモデルが判断します。
          </p>
          <p>
            本章の検証では Rails 8.1.4.1 の1ファイルのアプリでこのルートとコントローラーを動かしました。公開と取り消しが 303 で記事のページに戻ること、アーカイブした記事では状態を変えずに「下書きの記事だけ公開できます」を表示すること、他人の記事では 404 になることを、結合テストで確かめています。
          </p>
          <Callout kind="v72">
            <p>
              <code>params.expect</code> は Rails 8.0 で加わったメソッドです。Rails 7.2 では <code>params.require(:article_id)</code> か <code>params[:article_id]</code> で ID を受け取ります。
            </p>
          </Callout>
          <p>
            HTTP のリソースを加えても、同じ名前のテーブルが必要になるとは限りません。この例は status と published_at だけで公開の状態を持ち、公開した人や承認を記録したくなったら Publication モデルを検討します（<a href="#publication-case">承認を加える節</a>）。独自のアクションを見つけるたびに分ける必要もなく、責務を追いやすくなるかを変更の前後のコードで比べます。
          </p>
          <h3>公開の取り消しも同じリソースで扱う</h3>
          <p>公開の取り消しを destroy で表すと、記事の削除との違いがルートに現れます。Publishable に次のメソッドを加え、コントローラーの destroy から呼びます。</p>
          <Code
            lang="ruby"
            title="app/models/article/publishable.rb に加えるメソッド"
            code={`
def unpublish!
  with_lock do
    next if draft?
    raise NotPublishable, "公開中の記事だけ取り消せます" unless published?

    update!(status: :draft, published_at: nil)
  end
  self
end
`}
          />
          <p>
            この設計の published_at は「現在の公開が始まった時刻」で、取り消しで nil にし、再び公開したら新しい時刻を入れます。最初に公開した日や取り消した人を残すなら、別の列か履歴のモデルが必要です。ルートを REST の形にしただけでは、日時の意味や履歴の要件は決まりません。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">リクエスト</th>
                  <th scope="col">この例での業務の操作</th>
                  <th scope="col">対象の扱い</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>POST /articles/42/publication</code></td>
                  <td>記事 42 を公開する</td>
                  <td>現在の公開の状態を作る</td>
                </tr>
                <tr>
                  <td><code>DELETE /articles/42/publication</code></td>
                  <td>記事 42 の公開を取り消す</td>
                  <td>記事は残る</td>
                </tr>
                <tr>
                  <td><code>DELETE /articles/42</code></td>
                  <td>記事 42 を削除する</td>
                  <td>記事そのものの扱いを別に決める</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            すべての操作を ArticlesController に集め続けると、公開、購読、添付、承認のそれぞれの認可と失敗の処理が一つのクラスに混ざります。リソースは、責務を見つける手がかりとして使います。
          </p>
        </>
      ),
    },
    {
      id: 'callbacks-current',
      title: 'コールバックと CurrentAttributes',
      body: (
        <>
          <p>
            Jorge Manrubia の「Globals, callbacks and other sacrileges」（2023 年）によると、Basecamp はプロジェクトの作成に付随する単純な処理を <code>after_create</code> に書き、作成者の関連を <code>belongs_to :creator, class_name: "Person", default: -&gt; &#123; Current.person &#125;</code> と書いています。作成者は監査のための情報なので、コントローラーが知らなくてよいという理由です。複雑な記録の作成には専用のクラスを使い、コールバックと Current が誤用すると深刻な問題を起こす強力な道具（sharp knives）であることも認めています。<Ref n={11} />
          </p>
          <h3>保存に伴う処理を宣言する</h3>
          <p>記事アプリで同じ形を使うと、次のようになります。</p>
          <Code
            lang="ruby"
            title="app/models/article.rb（抜粋）"
            code={`
class Article < ApplicationRecord
  belongs_to :author, class_name: "User", default: -> { Current.user }
  normalizes :title, with: ->(title) { title.strip }
end
`}
          />
          <p>
            本章の検証では、<code>Current.set(user: author)</code> のブロックの中で作った記事には author が入り、Current.user が空のときは「Author must exist」の検証エラーになりました。要求の外で Current を設定し忘れると保存できないということです。
          </p>
          <p>
            「公開する」「承認する」のように利用者の意図を表す仕事は、<code>publish!</code> のような明示的なメソッドにします（<ChapterLink n={14} section="callback-boundaries">永続化の近くに置く処理</ChapterLink>）。外部への処理は after_commit とジョブで行いますが、after_commit の中で例外が発生しても確定したデータはロールバックされず<Ref n={12} />、ジョブの登録の漏れや重複も別に扱います（<ChapterLink n={30} section="callback-design">コールバックの設計</ChapterLink>、<ChapterLink n={34} section="external-boundaries">外部サービスとの境界</ChapterLink>）。<code>update_all</code> のようにコールバックを通らない更新もあります（<ChapterLink n={14} section="skip" />）。
          </p>
          <h3>Current に入れる値を少なく保つ</h3>
          <p>
            CurrentAttributes は要求ごとの値をスレッドごとに分けて持つクラスで、要求の終わりに Executor が値を消します（<ChapterLink n={23} section="thread-safety">Executor とスレッド安全性</ChapterLink>）。この章の例では次の Current を使います。
          </p>
          <Code
            lang="ruby"
            title="app/models/current.rb（この章の例）"
            code={`
class Current < ActiveSupport::CurrentAttributes
  attribute :user, :request_id
end
`}
          />
          <p>
            <code>Current.user</code> を使うと、要求の全体で使う情報をすべてのメソッドの引数に渡さずに済む代わりに、引数だけでは依存が見えなくなります。Rails の API ドキュメントも、Current は使いすぎてモデルを絡ませやすく、アカウント・利用者・要求の情報のような少数の最上位の値に限るよう注意しています。<Ref n={13} />
            本章の記事アプリでは次のように扱います。
          </p>
          <ul>
            <li>ログインした利用者と要求の ID は、before_action などで要求を受けた直後に設定する。</li>
            <li>特定の画面だけで使う検索の条件やフォームの値は、引数や専用のオブジェクトに持たせる。</li>
            <li>ジョブには必要な ID を引数で渡し、Current.user が引き継がれる前提を置かない。</li>
            <li>コンソールやテストでは、Current が空の場合の動きと、値を設定する方法を決めておく。</li>
          </ul>
          <p>
            要求の外で一時的に値を設定するときは <code>Current.set(user: user) &#123; ... &#125;</code> を使い、ブロックを抜けると元の値に戻ります（検証でも、中では bob、抜けた後は元の alice でした）。
          </p>
          <Callout kind="note">
            <p>
              Rails 8.1 の認証ジェネレーター（<code>bin/rails generate authentication</code>）が作る Current は <code>attribute :session</code> を持ち、user は <code>delegate :user, to: :session</code> で取り出します。この形では <code>Current.user = …</code> も <code>Current.set(user: …)</code> も NoMethodError になることを確かめました。要求の外で利用者が必要なら、引数で渡すか、Current に user の属性を加えます。
            </p>
          </Callout>
          <h3>実行者をジョブに渡す</h3>
          <p>公開した人を記録するようになると、誰が実行したかは業務の入力です。要求の Current.user は、ジョブには引き継がれません。</p>
          <Code
            lang="ruby"
            title="要求の中でジョブを登録し、ジョブの中で実行者を探し直す"
            code={`
# 要求の中：保存できる ID をジョブの引数にする
PublishArticleJob.perform_later(article.id, Current.user.id)

# app/jobs/publish_article_job.rb
class PublishArticleJob < ApplicationJob
  def perform(article_id, actor_id)
    actor = User.find(actor_id)
    article = actor.articles.find(article_id)

    Current.set(user: actor) do
      article.publish!(actor: actor)
    end
  end
end
`}
          />
          <p>
            ActiveJob はジョブの引数をキューに保存できる形に直列化します。<Ref n={20} />
            本章の検証で <code>Current.set</code> のブロックの中で作ったジョブを <code>serialize</code> すると、arguments は <code>[1, 1]</code> で、Current の値は含まれていませんでした。Rails 8.1.4.1 の activejob の lib にも、CurrentAttributes を参照する箇所はありません。
          </p>
          <p>
            <code>publish!(actor:)</code> は後の節で承認と履歴を加えたメソッドです。ジョブは実行するときに、実行者の記事の範囲から記事を探し直します。アカウントの停止や権限の変更があったジョブを再試行し続けない方針も決めます。<code>Current.set</code> は共通のログのように実行時の値を読む処理のためのもので、なければ省けます。公開した人は監査に必要な入力なので引数に書きます。
          </p>
          <h3>宣言した属性とただのインスタンス変数の違い</h3>
          <Code
            lang="ruby"
            title="避けたい例：宣言していない値を Current に覚えさせる"
            code={`
class Current < ActiveSupport::CurrentAttributes
  attribute :user

  def editable_articles
    @editable_articles ||= user.articles.to_a
  end
end
`}
          />
          <p>
            Rails 8.1.4.1 の current_attributes.rb では、<code>reset</code> は宣言した属性を入れた Hash（<code>@attributes</code>）を初期値に戻すだけで、Executor が要求の終わりに呼ぶ <code>clear_all</code> はインスタンスそのものを捨てます。<Ref n={14} />
            上のクラスで確かめた結果は次のとおりです。
          </p>
          <Code
            lang="text"
            code={`
Current.user = alice; Current.editable_articles   # => ["alice の記事"]
Current.user = bob;   Current.editable_articles   # => ["alice の記事"]
Current.reset   → user は nil、@editable_articles は ["alice の記事"] のまま
ActiveSupport::CurrentAttributes.clear_all → インスタンスが作り直され、@editable_articles は nil
`}
          />
          <p>
            Current.user を bob に替えても覚えた記事は alice のもので、reset の後にも残り、clear_all で初めて消えました。宣言していない値がいつ消えるかは、コードを読む人には分かりません。記事の配列を丸ごと持つと、メモリーの量とデータの鮮度も問題になります。この場合は、編集できる記事の範囲を返すスコープや Query Object に移し、必要な場所でページングして取得します。
          </p>
        </>
      ),
    },
    {
      id: 'behavior-tests',
      title: 'テストの配置を守りたい振る舞いから決める',
      body: (
        <>
          <p>
            DHH のテストに関する主張は、時期を並べると変化が分かります。2014 年 4 月の「TDD is dead. Long live testing.」は、テストを先に書くことを絶対の規則にする姿勢を批判しました。自動の回帰テストの価値は認め、モデルはデータベースとフィクスチャーを使って直接テストし、依存をすべてモックにする単体テストはほとんど書かないと述べ、Capybara などのシステムテストに比重を移すことも提案しています。<Ref n={15} />
            同じ月の「Test-induced design damage」は、テストのためだけに形をゆがめたコードを「テストが引き起こす設計の損傷」と呼びました。テストしにくさが設計の問題を示す場合もあると認めたうえで、コントローラーを単体テストするために間接の層を足す設計を批判しています。<Ref n={16} />
          </p>
          <p>
            2024 年 5 月の「System tests have failed」では、HEY の 300 ほどのシステムテストが遅く不安定だったので、数を大きく減らす方針を示しました。システムテストは最上位の確認（スモークテスト）に使い、業務のロジックはモデルとコントローラーのテストで、UI は人が操作して確かめるとしています。<Ref n={17} />
            Rails 8.1.0 の railties の CHANGELOG には、scaffold が既定でシステムテストを作らなくなったことが記録されています。作るときは <code>--system-tests=true</code> を渡すか、<code>bin/rails generate system_test</code> を使います。<Ref n={18} />
          </p>
          <p>
            ここから本章が読み取るのは、テストの構成も、得られる確信と保守の費用に応じて見直すという姿勢です。2014 年の記事だけで「DHH はシステムテストを増やせと言っている」と決めると、その後の経験が抜け落ちます。テストの種類ごとに通る層は<ChapterLink n={20} section="types">テストの種類と通る層</ChapterLink>で確かめました。
          </p>
          <h3>公開という振る舞いを直接確かめる</h3>
          <p>
            Concern の節の <code>publish!</code> を、保存した記事で確かめます。rails_helper.rb で <code>config.include ActiveSupport::Testing::TimeHelpers</code> を設定している前提です（rspec-rails 8.1.0 は自動では include しません）。
          </p>
          <Code
            lang="ruby"
            title="spec/models/article_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Article, type: :model do
  let(:author) { User.create!(name: "著者") }
  let(:article) { Article.create!(author: author, title: "下書き", body: "本文") }

  describe "#publish!" do
    it "下書きを公開すると、状態と公開日時を保存する" do
      freeze_time do
        article.publish!

        expect(article.reload).to be_published
        expect(article.published_at).to eq Time.current
      end
    end

    it "公開済みの記事をもう一度公開しても、公開日時を変えない" do
      article.publish!
      first_published_at = article.reload.published_at

      travel 1.minute do
        article.publish!
        expect(article.reload.published_at).to eq first_published_at
      end
    end

    it "アーカイブした記事は公開できず、状態と公開日時も変わらない" do
      article.update!(status: :archived)

      expect { article.publish! }.to raise_error(Article::Publishable::NotPublishable)
      expect(article.reload).to be_archived
      expect(article.published_at).to be_nil
    end
  end
end
`}
          />
          <p>
            確かめているのは、公開の結果が保存されること、再実行で日時が変わらないこと、公開できない状態では何も変えないことです。内部のメソッドの呼び出しは固定していないので、処理を Concern や PORO に移してもこの spec は通ります。本章ではこの spec を ActiveRecord 8.1.4.1 と SQLite で実行しました。2つ目は順に2回実行するテストなので、同時の公開を順に処理できることは、別の接続から同時に実行して確かめます（<ChapterLink n={15} section="pessimistic" />）。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">確かめたいこと</th>
                  <th scope="col">主に確かめる場所</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>公開できる状態、再実行、保存に失敗したときの結果</td>
                  <td>model spec</td>
                </tr>
                <tr>
                  <td>ログインしていない利用者や他人の記事への要求、HTTP の応答</td>
                  <td>request spec</td>
                </tr>
                <tr>
                  <td>ジョブの再試行や外部への通知との境界</td>
                  <td>ジョブ・連携処理のテスト</td>
                </tr>
                <tr>
                  <td>主要な画面の操作が最後までつながること</td>
                  <td>数を絞ったシステムテスト</td>
                </tr>
                <tr>
                  <td>表示の自然さ、操作の感触、読みやすさ</td>
                  <td>ブラウザーでの確認</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            外部 API の失敗を再現するテストダブルのように、境界を制御する道具は必要に応じて使います（<ChapterLink n={20} section="test-fixture-boundaries">テストデータと境界</ChapterLink>）。
          </p>
          <h3>壊れてほしいテストと壊れてほしくないテスト</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">変更</th>
                  <th scope="col">失敗してほしいテスト</th>
                  <th scope="col">失敗してほしくないテスト</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>再実行のときに公開日時を上書きしてしまった</td>
                  <td>再実行の model spec</td>
                  <td>関係のない読了時間の spec</td>
                </tr>
                <tr>
                  <td>Concern を Article の private メソッドに整理した</td>
                  <td>（意味が同じなら既存のテストはすべて通る）</td>
                  <td>include 先や内部の呼び出しだけを固定したテスト</td>
                </tr>
                <tr>
                  <td>他人の記事を公開できるようにしてしまった</td>
                  <td>ログインした利用者を使う request spec</td>
                  <td>公開の条件だけを扱う spec（認可の確認をすべて任せない）</td>
                </tr>
                <tr>
                  <td>公開ボタンの移動先を間違えた</td>
                  <td>主要な画面の操作のテスト</td>
                  <td>業務のロジックの全組み合わせ（ブラウザーで確かめる必要はない）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            テストの方式の価値は、防いだ不具合と、実行と修正の費用で評価します。不安定な画面のテストが増えたら、待ち方、外部への依存、対象の範囲を見直し、条件の組み合わせはモデルのテストに移します。すでに不具合を見つけている有用なテストを、記事の結論だけを理由に消すことはしません。
          </p>
        </>
      ),
    },
    {
      id: 'publication-case',
      title: '公開の流れをつなげて読み、承認を加える',
      body: (
        <>
          <p>ここまでの例をつなぐと、HTTP の要求からデータベースまでの役割が見えます。</p>
          <Figure n="53-4" title="記事を公開する要求の流れ" caption="REST の節のコントローラーと、Concern の節の publish! をつないだ図。ログインした利用者が自分の下書きを公開し、保存が成功する場合。">
            <PublishSequenceFigure />
          </Figure>
          <p>
            図は上から下へ時間の順に読みます。コントローラーは HTTP と許可された記事の取得を受け持ち、公開の規則は Article（Publishable）が、ロックを取って読み直してから判断します。内部に独立した複雑さが生まれても、<code>publish!</code> という呼び出し方を保ったまま、別のオブジェクトに任せられます。外側の API と内側の分担を両方設計しているので、「コントローラーを3行にする」のような行数の目標では評価できません。
          </p>
          <h3>要件が変わったときの問い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">新しい要件や問題</th>
                  <th scope="col">次に考えること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>公開日時に加えて、公開した人や承認の経緯を残したい</td>
                  <td>公開や承認を独立した記録としてモデルにする必要があるか</td>
                </tr>
                <tr>
                  <td>公開したときに外部へ通知を送る</td>
                  <td>データベースの確定との関係、登録の漏れ、再試行、重複をどう扱うか</td>
                </tr>
                <tr>
                  <td>公開の条件が複数の Concern にまたがって絡み合う</td>
                  <td>どの業務の概念が状態と判断を持つべきか</td>
                </tr>
                <tr>
                  <td>ほかの画面やジョブからも公開したい</td>
                  <td>同じモデルの API を使えるか。認可と実行者をどう渡すか</td>
                </tr>
                <tr>
                  <td>公開の処理の負荷が増えた</td>
                  <td>計測でボトルネックを特定し、クエリ・ジョブ・構成のどこを改善するか</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>どの場合も、最初に新しい層を決めず、加わった条件を言葉にして、最も追いやすい場所に置きます。</p>
          <h3>公開に編集者の承認が必要になった</h3>
          <p>ここからは、Concern の節の例を発展させた本書の設計案です。DHH や 37signals のコードを再現したものではありません。要件を次のように決めます。</p>
          <ol>
            <li>下書きの編集と公開は、記事の著者が行う。</li>
            <li>著者とは別の編集者が内容を承認する。編集者の役割は管理者が与える。</li>
            <li>承認の後にタイトルか本文を変えたら、もう一度承認が必要になる。</li>
            <li>誰がどの改訂を承認し、誰が公開したかを保存する。</li>
            <li>同じ公開の要求を繰り返しても、公開の記録を増やさない。</li>
          </ol>
          <p>
            一つの編集チームを想定し、<code>User#editor?</code> を認可の条件にします（複数の組織を持つ製品なら、組織への所属と組織の中の権限で判定します）。公開後の編集、取り消し、予約投稿は対象外です。REST の節の取り消しを混ぜると、同じ改訂を再び公開したときの記録の方法を別に決める必要が出ます。
          </p>
          <h3>approved の真偽値だけで表す案</h3>
          <Code
            lang="ruby"
            title="要件 3・4 を満たせない案"
            code={`
article.update!(approved: true)
article.update!(body: "承認したときとは違う本文")
article.publish! if article.approved?
`}
          />
          <p>
            真偽値では、何を承認したかが分かりません。編集のたびに false に戻しても、承認した人と履歴は残らず、更新の経路のどれかで戻し忘れる危険があります。そこで承認を独立した記録にします。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">モデル</th>
                  <th scope="col">保存する事実</th>
                  <th scope="col">変更する理由</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>Article</code></td>
                  <td>タイトル、本文、現在の状態、改訂番号（revision）</td>
                  <td>記事を編集する・公開する</td>
                </tr>
                <tr>
                  <td><code>Article::Approval</code></td>
                  <td>記事、承認した改訂、編集者、承認した時刻</td>
                  <td>承認の記録を加える</td>
                </tr>
                <tr>
                  <td><code>Publication</code></td>
                  <td>記事、対象の改訂、根拠にした承認、公開した人、公開した時刻</td>
                  <td>公開の記録を加える</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Code
            lang="text"
            code={`
app/models/article.rb
app/models/article/approvable.rb
app/models/article/publishable.rb
app/models/article/approval.rb
app/models/publication.rb
app/controllers/articles/approvals_controller.rb
app/controllers/articles/publications_controller.rb
`}
          />
          <p>
            呼び出す側の API は、引き続き <code>article.approve!(actor:)</code> と <code>article.publish!(actor:)</code> で、内部で別のレコードに仕事を任せます。モデルの API を保つことと、すべてを articles テーブルに入れることは別のことです。
          </p>
          <h3>記録の一意性をデータベースでも守る</h3>
          <p>articles に本文と status がすでにある前提のマイグレーションです。一つの改訂への承認は最初の1件を使い、公開も1回だけという要件に限っています。</p>
          <Code
            lang="ruby"
            title="db/migrate/xxxx_add_article_approval_records.rb"
            code={`
class AddArticleApprovalRecords < ActiveRecord::Migration[8.1]
  def change
    add_column :articles, :revision, :integer, null: false, default: 1
    add_check_constraint :articles, "revision > 0", name: "articles_revision_positive"

    create_table :article_approvals do |t|
      t.references :article, null: false, foreign_key: true
      t.references :reviewer, null: false, foreign_key: { to_table: :users }
      t.integer :revision, null: false
      t.datetime :approved_at, null: false
    end
    add_index :article_approvals, %i[article_id revision], unique: true

    create_table :publications do |t|
      t.references :article, null: false, foreign_key: true
      t.references :approval, null: false, foreign_key: { to_table: :article_approvals }
      t.references :publisher, null: false, foreign_key: { to_table: :users }
      t.integer :revision, null: false
      t.datetime :published_at, null: false
    end
    add_index :publications, %i[article_id revision], unique: true
  end
end
`}
          />
          <p>
            2つの複合の一意インデックスが再実行や別の経路による記録の重複を防ぎます。Rails ガイドも、外部キーと一意インデックスはデータベースの側で強制する方が一般に安全だとしています。<Ref n={19} />
            本番での加え方は<ChapterLink n={27} section="indexes-constraints">インデックスと制約</ChapterLink>で扱いました。外部キーだけでは「承認が同じ記事の同じ改訂のものか」までは保証できないので、Publication のモデルでも対応を検証します。
          </p>
          <Code
            lang="ruby"
            title="app/models/article/approval.rb と app/models/publication.rb"
            code={`
class Article::Approval < ApplicationRecord
  belongs_to :article
  belongs_to :reviewer, class_name: "User"
  validates :revision, numericality: { only_integer: true, greater_than: 0 }
  validates :approved_at, presence: true
end

class Publication < ApplicationRecord
  belongs_to :article
  belongs_to :approval, class_name: "Article::Approval"
  belongs_to :publisher, class_name: "User"
  validates :revision, numericality: { only_integer: true, greater_than: 0 }
  validates :published_at, presence: true
  validate :approval_matches_revision

  private
    def approval_matches_revision
      return unless approval
      unless approval.article_id == article_id && approval.revision == revision
        errors.add(:approval, "が公開する改訂と一致しません")
      end
    end
end
`}
          />
          <p>
            <code>Article::Approval</code> のテーブル名は親のテーブル名の単数形を前に付けた article_approvals になります。本章の検証（SQLite）では、同じ改訂への承認を直接作ると <code>ActiveRecord::RecordNotUnique</code>、revision を 0 にすると CHECK 制約の違反になり、別の記事の承認を指す Publication は「Approval が公開する改訂と一致しません」の検証エラーになりました。
          </p>
          <h3>編集・承認・公開で同じ記事をロックする</h3>
          <p>編集のたびに改訂番号を進めるので、承認の後に本文が変わったことを判定できます。次は既存の関連と enum に加える実装です。</p>
          <Code
            lang="ruby"
            title="app/models/article.rb、article/approvable.rb、article/publishable.rb"
            code={`
class Article < ApplicationRecord
  class NotAuthorized < StandardError; end
  class InvalidTransition < StandardError; end

  include Approvable, Publishable

  belongs_to :author, class_name: "User"
  has_many :approvals, class_name: "Article::Approval", dependent: :restrict_with_exception
  has_many :publications, dependent: :restrict_with_exception
  enum :status, { draft: 0, published: 1, archived: 2 }
  validates :title, :body, presence: true

  def revise!(attributes:, actor:)
    with_lock do
      raise NotAuthorized unless author_id == actor.id
      raise InvalidTransition, "下書きだけ編集できます" unless draft?

      assign_attributes(attributes.slice(:title, :body))
      if will_save_change_to_title? || will_save_change_to_body?
        self.revision += 1
        save!
      end
    end
    self
  end
end

module Article::Approvable
  extend ActiveSupport::Concern

  def approve!(actor:)
    with_lock do
      raise Article::NotAuthorized unless actor.editor? && actor.id != author_id
      raise Article::InvalidTransition, "下書きだけ承認できます" unless draft?
      raise ActiveRecord::RecordInvalid.new(self) unless valid?

      approvals.find_by(revision: revision) ||
        approvals.create!(revision: revision, reviewer: actor, approved_at: Time.current)
    end
  end
end

module Article::Publishable
  extend ActiveSupport::Concern

  def publish!(actor:)
    with_lock do
      raise Article::NotAuthorized unless author_id == actor.id
      next if published?
      raise Article::InvalidTransition, "下書きだけ公開できます" unless draft?

      approval = approvals.find_by(revision: revision)
      raise Article::InvalidTransition, "現在の改訂の承認が必要です" unless approval

      now = Time.current
      publications.create!(approval: approval, publisher: actor, revision: revision, published_at: now)
      update!(status: :published, published_at: now)
    end
    self
  end
end
`}
          />
          <PublicationFigure />
          <p>
            この操作の図は、公開できるかどうかが「現在の改訂」への承認で決まることを確かめるために置きました。直前の操作を順に選ぶと、本文の改訂番号、承認がある改訂番号、記事の状態が変わります。「本文を編集」を選ぶと改訂番号が 2 に進み、承認は改訂 1 のものしかないので、「公開を試す」は拒否されます。
          </p>
          <p>
            <code>revise!</code> は渡された属性から title と body だけを取り出し、改訂番号や状態を入力で変えさせません。3つの操作が同じ記事のロックを取るので、同時に起きても、読み直した最新の改訂番号で判定します。公開の記録と記事の更新は同じトランザクションの中なので、更新が検証で失敗すれば記録も残りません（検証でも、タイトルを空にした記事の <code>publish!</code> は RecordInvalid になり、publications に行は残りませんでした）。コントローラーは NotAuthorized を 403、InvalidTransition を 409 か画面での案内、RecordInvalid を入力の見直しに変えます。
          </p>
          <p>
            ただし、本文を直接 <code>update!</code> すれば改訂番号の更新を迂回できます。画面・API・管理の処理を同じ操作にそろえ、常に守る必要があるならモデルでの変更の検証やデータベースの仕組みも検討します。また、改訂番号だけでは過去の本文を復元できないので、承認したときの文章を監査で見せるなら、ArticleRevision のようなモデルに本文の写しを保存します。
          </p>
          <h3>要件の変更を確かめるテスト</h3>
          <Code
            lang="ruby"
            title="spec/models/article_approval_flow_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Article, "承認つきの公開" do
  let(:author) { User.create!(name: "著者") }
  let(:editor) { User.create!(name: "編集者", editor: true) }
  let(:article) { Article.create!(author: author, title: "下書き", body: "本文") }

  it "承認した後に本文を変えると、再び承認されるまで公開できない" do
    article.approve!(actor: editor)
    article.revise!(attributes: { body: "承認後に変えた本文" }, actor: author)

    expect { article.publish!(actor: author) }.to raise_error(Article::InvalidTransition)
    expect(article.reload).to be_draft
    expect(article.publications).to be_empty
  end

  it "公開を2回要求しても、公開の記録は1件だけ作る" do
    article.approve!(actor: editor)

    expect {
      article.publish!(actor: author)
      article.publish!(actor: author)
    }.to change(Publication, :count).by(1)
  end

  it "著者は自分の記事を承認できない" do
    expect { article.approve!(actor: author) }.to raise_error(Article::NotAuthorized)
  end
end
`}
          />
          <p>
            このほかに、他人による公開の拒否、編集と承認の同時実行、公開の記録と状態の更新のロールバックを確かめます。本章では同時実行以外を SQLite で実行しました。同時実行は MySQL などで別の接続を使って確かめます。Concern を別の形に整理しても、要件が同じならテストが期待する結果は変わりません。
          </p>
          <h3>増やしたものと引き受けたもの</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">変更</th>
                  <th scope="col">解決した問題</th>
                  <th scope="col">あわせて引き受けること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>revision（改訂番号）</td>
                  <td>承認の後の内容の変更を見分けられる</td>
                  <td>すべての編集の経路で改訂番号を進める決まり</td>
                </tr>
                <tr>
                  <td><code>Article::Approval</code></td>
                  <td>誰がどの改訂を承認したかを保存できる</td>
                  <td>承認の再利用・取り消し・権限の変更のときの方針</td>
                </tr>
                <tr>
                  <td><code>Publication</code></td>
                  <td>公開の根拠と公開した人を保存できる</td>
                  <td>再公開を同じ事実とみなす範囲、履歴の保持</td>
                </tr>
                <tr>
                  <td>Concern による整理</td>
                  <td>編集・承認・公開の仕様を探しやすい</td>
                  <td>同じ Article への依存を共有すること</td>
                </tr>
                <tr>
                  <td>同じトランザクションと DB の制約</td>
                  <td>公開の記録だけが残ることと、記録の重複を防ぐ</td>
                  <td>ロックの順序と、直接更新する経路の管理</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            外部の審査の結果を待つ、複数段の承認の担当者に依頼を振り分ける、期限切れのときに元の状態に戻す、といった手順が独立して増えたら、専用の進行管理のオブジェクトを検討します（<ChapterLink n={33} section="domain-application-service">Domain Service と Application Service</ChapterLink>）。通知を加えるなら、Publication の ID で「どの公開についての通知か」を特定し、配信が必須なら送信予定を公開の記録と同じトランザクションで保存します。
          </p>
        </>
      ),
    },
    {
      id: 'review-explanation',
      title: '原則を自分の判断に変える',
      body: (
        <>
          <p>次は DHH の考え方を設計のレビューに使うための本書のチェックリストです。DHH が定めた公式のルールではありません。</p>
          <ol>
            <li>呼び出しが業務の言葉で読めるか。<code>publish!</code>、<code>approve!</code> などの名前と実際の振る舞いが合っているか。</li>
            <li>規則の持ち主が決まっているか。画面・ジョブ・バッチに同じ状態の遷移を重ねて書いていないか。</li>
            <li>Rails の規約で減らせる設定やつなぎのコードはあるか。独自の仕組みを加えるなら、その効果を説明できるか。</li>
            <li>分けたことで、読む範囲が分かりやすくなったか。Concern やクラスの名前から責務を予想できるか。</li>
            <li>暗黙の処理の前提を説明できるか。コールバックの条件、Current を設定する場所、トランザクションの範囲が分かるか。</li>
            <li>失敗と再実行を扱えるか。無効な状態、保存の失敗、二重の実行、外部の処理の失敗のときに何が残るか。</li>
            <li>テストが必要な振る舞いを守っているか。見つけられる不具合と、遅さ・不安定さ・修正の費用を比べているか。</li>
            <li>設計の前提が自分の現場と合っているか。チームの経験、製品の要件、運用の体制を踏まえているか。</li>
          </ol>
          <h3>コードレビューでの説明の例</h3>
          <p>承認つきの公開の変更をレビューに出すなら、次のように説明できます。</p>
          <blockquote>
            <p>
              承認の後に本文を変えても公開できてしまう問題を防ぐため、記事が改訂番号を持ち、承認の記録が承認した改訂を記録するようにします。編集・承認・公開は同じ記事の行をロックし、公開の記録と状態の更新を同じトランザクションで保存します。コントローラーは許可された記事を取得してモデルの操作を呼びます。公開後の編集と承認の取り消しは、今回の範囲外の業務の操作として別に定義します。
            </p>
          </blockquote>
          <p>
            この説明は「DHH が Concern を使っているから」という権威づけをせず、問題、責任の持ち主、加えた保証、今回の範囲を書いています。原典は判断を考える材料として使い、採用した理由は自分のアプリの事実で示します。
          </p>
          <h3>現場での使い方</h3>
          <ul>
            <li>原典と日付を添えて話す。「DHH がそう言っている」で終わらせず、どの記事の、どの条件での判断かを共有する。</li>
            <li>小さな変更で比べる。記事の公開のような一つの操作を題材にし、変更の前後で追いやすさ・再利用・テストを比べる。</li>
            <li>トレードオフを記録する。コールバックなら呼ばれる経路、PORO なら責務、サービスに分けたなら運用上の理由を残す。</li>
            <li>コードを読んで動作を確かめてから改善する（<ChapterLink n={28} section="workflow">改修の進め方</ChapterLink>）。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <>
          <ul>
            <li>DHH の主張は Basecamp や HEY を少人数で作ってきた製品・チーム・時期とあわせて読み、得たいもの、引き受けるもの、見直す条件に分ける。</li>
            <li>Rails Doctrine と omakase は、規約と一緒に動く道具一式で、アプリに固有の問題に時間を使えるようにする。</li>
            <li>Majestic Monolith は Web とジョブを別のプロセスにすることとも両立する。Citadel は、モノリスを改善した後に性質の違う一部を切り出す選択肢である。</li>
            <li>モデルの API で業務の意味を表し、Active Record・PORO・Concern を責務に応じて組み合わせる。Concern は同じオブジェクトに組み込まれる。</li>
            <li>REST はコントローラーの責務を整理するために使う。HTTP のリソースとテーブルは1対1とは限らない。</li>
            <li>ジョブには実行者を引数で渡し、Current には宣言した少数の値だけを入れる。</li>
            <li>テストの配置も、得られる確信と保守の費用から見直す。</li>
            <li>承認つきの公開は、改訂番号、承認と公開の記録、一意制約、同じ記事のロックで守り、増やしたものと引き受けたものを説明する。</li>
          </ul>
        </>
      ),
    },
  ],
  sources: [
    { title: 'David Heinemeier Hansson', publisher: 'dhh.dk', url: 'https://dhh.dk/', accessed: '2026-11-20', note: 'Rails の作者、37signals の共同所有者、Basecamp が最初の Rails アプリケーションであること。' },
    { title: 'The Majestic Monolith', publisher: 'Signal v. Noise / DHH', url: 'https://signalvnoise.com/svn3/the-majestic-monolith/', accessed: '2026-11-20', version: '2016-02-29', note: 'Basecamp のチームの人数と提供の経路、統合したアプリケーションを選ぶ理由。' },
    { title: 'On Writing Software Well', publisher: 'Signal v. Noise / DHH', url: 'https://signalvnoise.com/svn3/on-writing-software-well/', accessed: '2026-11-20', version: '2018-02-20', note: '実際の Basecamp のコードで設計の判断を説明する動画シリーズ。' },
    { title: 'Put chubby models on a diet with concerns', publisher: 'Signal v. Noise / DHH', url: 'https://signalvnoise.com/posts/3372-put-chubby-models-on-a-diet-with-concerns', accessed: '2026-11-20', version: '2012-12-18', note: 'Basecamp の Concern の数と名前、一つのモデルだけで使う Concern、visible_to の例。' },
    { title: 'The Rails Doctrine', publisher: 'Ruby on Rails / DHH', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-20', note: '9つの柱。Active Record と Concern、sharp knives、integrated systems、person.in? people の例。' },
    { title: 'Rails is omakase', publisher: 'dhh.dk', url: 'https://dhh.dk/2012/rails-is-omakase.html', accessed: '2026-11-20', version: '2012-12-27', note: '作り手が道具を選ぶ考え方と、RSpec などへの差し替え。' },
    { title: 'The Majestic Monolith can become The Citadel', publisher: 'Signal v. Noise / DHH', url: 'https://signalvnoise.com/svn3/the-majestic-monolith-can-become-the-citadel/', accessed: '2026-11-20', version: '2020-04-08', note: 'Citadel と Outpost、Campfire のポーリングの例、切り出す前にモノリスを改善すること。' },
    { title: 'Vanilla Rails is plenty', publisher: '37signals Dev / Jorge Manrubia', url: 'https://dev.37signals.com/vanilla-rails-is-plenty/', accessed: '2026-11-20', version: '2022-11-08', note: 'ドメインのモデルを API とみなす作り方、recording.incinerate と委譲するクラス。' },
    { title: 'Good concerns', publisher: '37signals Dev / Jorge Manrubia', url: 'https://dev.37signals.com/good-concerns/', accessed: '2026-11-20', version: '2022-10-10', note: 'Concern の置き場所、性質を表す Concern、Account::Closable の委譲の例。' },
    { title: 'Rails 1.2: Release Candidate 1', publisher: 'Ruby on Rails / DHH', url: 'https://rubyonrails.org/2006/11/23/rails-1-2-release-candidate-1', accessed: '2026-11-20', version: '2006-11-23', note: '多くのアクションを持つコントローラーを、リソースごとの CRUD のコントローラーに分ける考え方。' },
    { title: 'Globals, callbacks and other sacrileges', publisher: '37signals Dev / Jorge Manrubia', url: 'https://dev.37signals.com/globals-callbacks-and-other-sacrileges/', accessed: '2026-11-20', version: '2023-07-31', note: 'after_create と Current.person を既定値にする例、複雑な作成にはファクトリーを使う判断。' },
    { title: 'Active Record Callbacks', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_callbacks.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'トランザクションのコールバックと、after_commit の中の例外ではロールバックされないこと。' },
    { title: 'ActiveSupport::CurrentAttributes', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveSupport/CurrentAttributes.html', accessed: '2026-11-20', version: 'Rails 8.1', note: '使いすぎへの注意、少数の最上位の値に限ること、set と reset。' },
    { title: 'activesupport/lib/active_support/current_attributes.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/current_attributes.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'reset が @attributes だけを初期値に戻し、clear_all がインスタンスを捨てること。' },
    { title: 'TDD is dead. Long live testing.', publisher: 'dhh.dk', url: 'https://dhh.dk/2014/tdd-is-dead-long-live-testing.html', accessed: '2026-11-20', version: '2014-04-23', note: 'テストを先に書くことを絶対視する姿勢への批判、データベースを使うモデルのテスト。' },
    { title: 'Test-induced design damage', publisher: 'dhh.dk', url: 'https://dhh.dk/2014/test-induced-design-damage.html', accessed: '2026-11-20', version: '2014-04-29', note: 'テストのためだけの境界と間接の層が設計に与える費用。' },
    { title: 'System tests have failed', publisher: 'HEY World / DHH', url: 'https://world.hey.com/dhh/system-tests-have-failed-d90af718', accessed: '2026-11-20', version: '2024-05-17', note: 'HEY のシステムテストを減らす方針、スモークテスト、モデルとコントローラーのテスト、人による確認。' },
    { title: 'railties/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/CHANGELOG.md`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '8.1.0 で scaffold がシステムテストを既定で作らなくなった変更と、8.1.2 のアプリ生成時の変更。' },
    { title: 'Active Record Migrations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_migrations.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'change で戻せる add_check_constraint、外部キーと一意インデックスをデータベースで強制すること。' },
    { title: 'Active Job Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_job_basics.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'perform に渡せる引数の型と直列化。' },
  ],
}

export default chapter
