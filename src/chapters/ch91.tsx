import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 89-1 商品ページの構成と、問題が起きる箇所 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="89-1"
      w={780}
      h={360}
      label="ブラウザーが GET /products/1 を送ると、ProductsController#show は Product.find で MySQL の products テーブルから商品を読み、RecommendationClient#product_ids でおすすめ API（別のチームが運用）からおすすめの商品の id を受け取り、両方をそろえてから表示する。RecommendationClient にはタイムアウトの設定がなく、おすすめ API が応答しないと既定の60秒まで待つ。おすすめ API が応答しないときや 503 を返したときは、例外がそのままコントローラーまで伝わって 500 になり、商品名・価格・カートに入れるボタンも表示されない"
    >
      <Box x={20} y={150} w={130} h={56} lines={['ブラウザー', 'GET /products/1']} fs={12} bold subTone="muted" />
      <Arrow x1={150} y1={178} x2={198} y2={178} />
      <Box x={200} y={146} w={200} h={64} lines={['ProductsController#show', '商品とおすすめを', 'そろえてから表示する']} fs={12} bold subTone="muted" />
      <Arrow x1={400} y1={164} x2={438} y2={86} />
      <Arrow x1={400} y1={192} x2={438} y2={258} accent />
      <Box x={440} y={52} w={170} h={50} lines={['Product', 'find(params[:id])']} fs={12} bold subTone="muted" />
      <Arrow x1={610} y1={77} x2={638} y2={77} />
      <Box x={640} y={52} w={120} h={50} lines={['MySQL', 'products']} fs={12} fill="box4" subTone="muted" />
      <Box x={440} y={236} w={170} h={52} lines={['RecommendationClient', 'product_ids']} fs={12} bold subTone="muted" />
      <Arrow x1={610} y1={262} x2={638} y2={262} accent />
      <Box x={640} y={236} w={120} h={52} lines={['おすすめ API', '別のチームが運用']} fs={12} fill="box4" subTone="muted" />
      <T x={525} y={306} anchor="middle" fs={12} tone="danger">
        タイムアウトの設定がない
      </T>
      <T x={525} y={324} anchor="middle" fs={12} tone="danger">
        → 既定の 60 秒まで待つ
      </T>
      <T x={700} y={306} anchor="middle" fs={12} tone="danger">
        応答しない・503
      </T>
      <T x={300} y={236} anchor="middle" fs={12} tone="danger">
        例外がそのまま伝わって 500
      </T>
      <T x={300} y={254} anchor="middle" fs={12} tone="danger">
        商品名・価格・カートも出ない
      </T>
      <T x={20} y={348} fs={11} tone="muted">
        青い矢印は、この章で問題になる呼び出し。緑の箱は DB と外部のサービス
      </T>
    </Svg>
  )
}

/* ---------- 図 89-2 おすすめ API が応答しないときの、3つの要求のタイムライン ---------- */
const tlCols = [
  { x: 110, lines: ['利用者 A', '/products/1'] },
  { x: 235, lines: ['利用者 B', '/products/2'] },
  { x: 360, lines: ['利用者 C', '/cart'] },
  { x: 520, lines: ['Puma', 'スレッド2つ'] },
  { x: 690, lines: ['おすすめ API', '応答しない'] },
]

function TimelineFigure() {
  return (
    <Svg
      id="89-2"
      w={780}
      h={420}
      label="Puma のスレッドを2つにして、3人の利用者が0.1秒ずつずらして要求を送ったときのタイムライン。0秒に利用者 A が /products/1 を送り、スレッド1がおすすめ API に要求を送って応答を待つ。0.1秒に利用者 B が /products/2 を送り、スレッド2も同じように待つ。0.2秒に利用者 C が、おすすめ API を使わない /cart を送るが、空いているスレッドがないので待たされる。約60秒後、Net::HTTP の読み込みのタイムアウトで2つのスレッドが例外になり、A には60.18秒、B には60.25秒で 500 を返す。空いたスレッドが C の要求を処理し、C には60.26秒で 200 を返す"
    >
      {tlCols.map((c) => (
        <g key={c.lines[0]}>
          <Box x={c.x - 58} y={10} w={116} h={44} lines={c.lines} fs={12} fill={c.x === 690 ? 'box4' : 'box'} bold subTone="muted" />
          <line x1={c.x} y1={54} x2={c.x} y2={384} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <T x={10} y={84} fs={11} tone="muted">
        0 秒
      </T>
      <T x={10} y={134} fs={11} tone="muted">
        0.1 秒
      </T>
      <T x={10} y={184} fs={11} tone="muted">
        0.2 秒
      </T>
      <T x={10} y={335} fs={11} tone="muted">
        60.2 秒
      </T>

      <Arrow x1={110} y1={84} x2={518} y2={84} />
      <T x={118} y={75} fs={11}>
        GET /products/1
      </T>
      <Arrow x1={522} y1={104} x2={688} y2={104} accent />
      <T x={530} y={95} fs={11} tone="acc">
        スレッド1 が待つ
      </T>
      <Arrow x1={235} y1={134} x2={518} y2={134} />
      <T x={243} y={125} fs={11}>
        GET /products/2
      </T>
      <Arrow x1={522} y1={154} x2={688} y2={154} accent />
      <T x={530} y={145} fs={11} tone="acc">
        スレッド2 が待つ
      </T>
      <Arrow x1={360} y1={184} x2={518} y2={184} />
      <T x={368} y={175} fs={11}>
        GET /cart
      </T>
      <T x={530} y={196} fs={11} tone="danger">
        空いているスレッドがない
      </T>
      <line x1={360} y1={190} x2={360} y2={352} stroke="var(--fig-danger)" strokeWidth={4} />
      <T x={368} y={272} fs={11} tone="danger">
        C は待たされる
      </T>

      <rect x={60} y={222} width={710} height={30} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={415} y={237} anchor="middle" fs={12} tone="muted">
        約 60 秒たつ（おすすめ API は応答しないまま）
      </T>

      <T x={530} y={282} fs={11} tone="danger">
        読み込みのタイムアウト
      </T>
      <T x={530} y={298} fs={11} tone="danger">
        （Faraday::TimeoutError）
      </T>
      <Arrow x1={518} y1={316} x2={112} y2={316} dashed />
      <T x={118} y={307} fs={11} tone="danger">
        500（60.18 秒）
      </T>
      <Arrow x1={518} y1={335} x2={237} y2={335} dashed />
      <T x={243} y={326} fs={11} tone="danger">
        500（60.25 秒）
      </T>
      <Arrow x1={518} y1={360} x2={362} y2={360} dashed />
      <T x={368} y={372} fs={11}>
        200（60.26 秒）
      </T>
      <T x={10} y={404} fs={11} tone="muted">
        開発環境で測定。おすすめ API の代わりに、90 秒たつまで応答しないサーバーを使った
      </T>
    </Svg>
  )
}

/* ---------- 図 89-3 商品ページの部分と、ハードな依存・ソフトな依存 ---------- */
function DependencyFigure() {
  return (
    <Svg
      id="89-3"
      w={780}
      h={380}
      label="商品ページを、商品名・価格・在庫、カートに入れるボタン、おすすめの3つの部分に分けた。商品名・価格・在庫とカートに入れるボタンは MySQL の products テーブルにハードに依存し、MySQL が失敗したらページもエラーにする（止める）。おすすめはおすすめ API にソフトに依存し、API が失敗したら、前回の結果、人気の商品、または欄を出さないことで代える（続ける）。AWS Well-Architected Framework の REL05-BP01 の考え方を、この章の商品ページに当てはめた"
    >
      <Box x={20} y={14} w={300} h={300} fill="bg" />
      <T x={36} y={36} bold>
        商品ページ（/products/1）
      </T>
      <Box x={40} y={56} w={260} h={64} lines={['ノートPCスタンド', '¥4,980　在庫あり']} fs={13} bold subTone="muted" />
      <Box x={40} y={136} w={260} h={44} lines="カートに入れる" fs={13} />
      <Box x={40} y={198} w={260} h={96} lines={['この商品を見た人はこちらも見ています', 'デスクライト', 'デスクマット']} fs={12} dashed subTone="muted" />

      <Arrow x1={300} y1={88} x2={556} y2={96} />
      <Arrow x1={300} y1={158} x2={556} y2={112} />
      <T x={410} y={80} anchor="middle" fs={12} bold>
        ハードな依存
      </T>
      <Box x={560} y={74} w={200} h={56} lines={['MySQL', 'products テーブル']} fs={12} fill="box4" bold subTone="muted" />
      <T x={560} y={148} fs={12} tone="danger">
        失敗したら：ページもエラー
      </T>
      <T x={560} y={166} fs={12} tone="danger">
        （止める）
      </T>

      <Arrow x1={300} y1={246} x2={556} y2={246} dashed />
      <T x={410} y={236} anchor="middle" fs={12} bold>
        ソフトな依存
      </T>
      <Box x={560} y={218} w={200} h={56} lines={['おすすめ API', '別のチームが運用']} fs={12} fill="box4" bold subTone="muted" />
      <T x={560} y={292} fs={12} tone="acc">
        失敗したら：前回の結果・人気の商品
      </T>
      <T x={560} y={310} fs={12} tone="acc">
        ・欄を出さない（続ける）
      </T>
      <T x={20} y={344} fs={11} tone="muted">
        実線はハードな依存、破線はソフトな依存。破線の枠は、なくても買い物を続けられる部分
      </T>
      <T x={20} y={364} fs={11} tone="muted">
        AWS Well-Architected Framework の REL05-BP01 の考え方を、この章の商品ページに当てはめた
      </T>
    </Svg>
  )
}

/* ---------- 図 89-4 タイムアウトと代わりの表示の流れ ---------- */
function FlowFigure() {
  return (
    <Svg
      id="89-4"
      w={780}
      h={460}
      label="Recommendations#for の処理の流れ。RecommendationClient#product_ids は接続に0.3秒、応答に0.5秒まで待つ。成功したら、最後に成功した結果としてキャッシュに1日書き、おすすめを表示する（source は :api）。RecommendationClient::Error なら、Rails.error.report で失敗を報告し、キャッシュに前回の結果があれば前回のおすすめを表示し（:cache）、なければ同じカテゴリの人気の商品を表示する（:popular）。それ以外の例外（NoMethodError や DB のエラー）は捕まえずに 500 にし、アプリの中の誤りを隠さない。人気の商品も0件なら、おすすめの欄を出さない"
    >
      <Box x={250} y={10} w={280} h={40} lines="Recommendations#for(product)" fs={13} bold mono />
      <Arrow x1={390} y1={50} x2={390} y2={72} />
      <Box x={230} y={74} w={320} h={50} lines={['RecommendationClient#product_ids', '接続 0.3 秒・応答 0.5 秒まで待つ']} fs={12} bold subTone="muted" />

      <Arrow x1={300} y1={124} x2={132} y2={168} />
      <T x={196} y={136} anchor="middle" fs={11}>
        成功
      </T>
      <Arrow x1={390} y1={124} x2={390} y2={168} accent />
      <T x={398} y={146} fs={11} tone="acc">
        RecommendationClient::Error
      </T>
      <Arrow x1={550} y1={104} x2={658} y2={168} />
      <T x={640} y={122} fs={11} tone="danger">
        それ以外の例外
      </T>

      <Box x={20} y={170} w={224} h={50} lines={['キャッシュに書く', '最後に成功した結果（1日）']} fs={12} subTone="muted" />
      <Arrow x1={132} y1={220} x2={132} y2={258} />
      <Box x={20} y={260} w={224} h={50} lines={['おすすめを表示', 'source: :api']} fs={12} fill="box5" bold subTone="muted" />

      <Box x={280} y={170} w={220} h={50} lines={['Rails.error.report', '失敗を報告して続ける']} fs={12} subTone="muted" />
      <Arrow x1={390} y1={220} x2={390} y2={258} />
      <Box x={280} y={260} w={220} h={50} lines={['キャッシュに', '前回の結果があるか']} fs={12} />
      <Arrow x1={330} y1={310} x2={260} y2={358} />
      <T x={276} y={328} anchor="end" fs={11}>
        ある
      </T>
      <Arrow x1={450} y1={310} x2={520} y2={358} />
      <T x={500} y={328} fs={11}>
        ない
      </T>
      <Box x={120} y={360} w={224} h={50} lines={['前回のおすすめを表示', 'source: :cache']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={420} y={360} w={224} h={50} lines={['同じカテゴリの人気の商品', 'source: :popular']} fs={12} fill="box5" bold subTone="muted" />

      <Box x={560} y={170} w={200} h={50} lines={['NoMethodError', 'DB のエラーなど']} fs={12} subTone="muted" />
      <Arrow x1={660} y1={220} x2={660} y2={258} />
      <Box x={560} y={260} w={200} h={50} lines={['捕まえずに 500', 'アプリの誤りを隠さない']} fs={12} bold subTone="muted" accent />

      <T x={20} y={440} fs={11} tone="muted">
        色の付いた箱は、利用者に見せる結果。人気の商品も0件なら、おすすめの欄を出さない
      </T>
    </Svg>
  )
}

/* ---------- 図 89-5 直す前と直した後：例外が届く範囲 ---------- */
function CompareFigure() {
  return (
    <Svg
      id="89-5"
      w={780}
      h={420}
      label="直す前は、ProductsController が RecommendationClient を直接呼び、RecommendationClient にはタイムアウトがない。おすすめ API が応答しないと、60秒後の例外がコントローラーまで上がり、商品ページは60.18秒で 500、カートも60.26秒待った。直した後は、ProductsController と RecommendationClient の間に Recommendations を置き、RecommendationClient は接続0.3秒・応答0.5秒で打ち切って RecommendationClient::Error を投げる。例外は Recommendations で止まり、Rails.cache の前回の結果か MySQL の人気の商品で代える。商品ページは0.54秒で 200、カートは0.55秒で 200 になった"
    >
      <T x={10} y={18} bold>
        直す前
      </T>
      <Box x={20} y={40} w={190} h={44} lines="ProductsController#show" fs={12} bold />
      <Arrow x1={115} y1={84} x2={115} y2={128} />
      <Box x={20} y={130} w={190} h={50} lines={['RecommendationClient', 'タイムアウトの設定なし']} fs={12} bold subTone="muted" />
      <Arrow x1={115} y1={180} x2={115} y2={224} />
      <Box x={20} y={226} w={190} h={50} lines={['おすすめ API', '応答しない']} fs={12} fill="box4" bold subTone="muted" />
      <path d="M232,250 L232,62 L216,62" fill="none" stroke="var(--fig-danger)" strokeWidth={2} />
      <T x={240} y={150} fs={11} tone="danger">
        例外が
      </T>
      <T x={240} y={166} fs={11} tone="danger">
        そのまま上がる
      </T>
      <T x={20} y={312} fs={12} tone="danger">
        商品ページ：60.18 秒で 500
      </T>
      <T x={20} y={332} fs={12} tone="danger">
        カート：60.26 秒待って 200
      </T>

      <line x1={370} y1={8} x2={370} y2={360} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={390} y={18} bold>
        直した後
      </T>
      <Box x={390} y={40} w={200} h={44} lines="ProductsController#show" fs={12} bold />
      <Arrow x1={490} y1={84} x2={490} y2={118} />
      <Box x={390} y={120} w={200} h={50} lines={['Recommendations', '失敗をここで止める']} fs={12} fill="box5" bold subTone="muted" accent />
      <Arrow x1={490} y1={170} x2={490} y2={204} />
      <Box x={390} y={206} w={200} h={50} lines={['RecommendationClient', '接続 0.3 秒・応答 0.5 秒']} fs={12} bold subTone="muted" />
      <Arrow x1={490} y1={256} x2={490} y2={290} />
      <Box x={390} y={292} w={200} h={44} lines={['おすすめ API', '応答しない']} fs={12} fill="box4" bold subTone="muted" />
      <path d="M380,231 L372,231 L372,145 L386,145" fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <Box x={620} y={96} w={150} h={44} lines={['Rails.cache', '前回の結果']} fs={12} fill="box4" subTone="muted" />
      <Box x={620} y={160} w={150} h={44} lines={['MySQL', '人気の商品']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={590} y1={136} x2={618} y2={120} dashed />
      <Arrow x1={590} y1={152} x2={618} y2={180} dashed />
      <T x={600} y={240} fs={11} tone="acc">
        RecommendationClient::Error
      </T>
      <T x={600} y={256} fs={11} tone="acc">
        だけを受け取る
      </T>
      <T x={390} y={372} fs={12} tone="acc">
        商品ページ：0.54 秒で 200（人気の商品）
      </T>
      <T x={390} y={392} fs={12} tone="acc">
        カート：0.55 秒で 200
      </T>
      <T x={10} y={412} fs={11} tone="muted">
        赤い線は直す前に例外が伝わる道、青い線は直した後の道。時間は図 89-2 と同じ条件で測った
      </T>
    </Svg>
  )
}

/* ---------- 図 89-6 Fail Fast と Graceful Degradation の使い分け ---------- */
const quadrants = [
  { x: 170, y: 64, lines: ['止める（Fail Fast）', '例外のまま 500 にし、テストと報告で見つける'], fill: 'box' as const },
  { x: 475, y: 64, lines: ['開発とテストでは止める', '本番は報告して続けてもよい（unexpected）'], fill: 'box' as const },
  { x: 170, y: 192, lines: ['止めて、エラーを示す', '古い価格・在庫で代えない（再試行は別に考える）'], fill: 'box' as const },
  { x: 475, y: 192, lines: ['隔離して続ける', 'タイムアウト・代わりの表示・報告'], fill: 'box5' as const },
]

function JudgeFigure() {
  return (
    <Svg
      id="89-6"
      w={780}
      h={364}
      label="失敗の原因と機能の位置づけの2つの軸で、止めるか続けるかを決める。原因がアプリの中の誤りやデータの不整合で、なければページの目的を果たせない機能なら、止める（Fail Fast）。原因がアプリの中の誤りで、なくても続けられる機能なら、開発とテストでは止め、本番は報告して続けてもよい（Rails.error.unexpected）。原因が外部のサービスの障害で、なければ目的を果たせない機能（価格・在庫・決済）なら、止めてエラーを示し、古い値で代えない。原因が外部のサービスの障害で、なくても続けられる機能（おすすめ）なら、隔離して続ける（Graceful Degradation）"
    >
      <T x={322} y={22} anchor="middle" fs={12} bold>
        なければ目的を果たせない
      </T>
      <T x={322} y={42} anchor="middle" fs={11} tone="muted">
        商品・価格・在庫・決済
      </T>
      <T x={627} y={22} anchor="middle" fs={12} bold>
        なくても続けられる
      </T>
      <T x={627} y={42} anchor="middle" fs={11} tone="muted">
        おすすめ・閲覧履歴
      </T>
      <T x={10} y={110} fs={12} bold>
        アプリの中の誤り
      </T>
      <T x={10} y={128} fs={11} tone="muted">
        データの不整合
      </T>
      <T x={10} y={238} fs={12} bold>
        外部のサービスの
      </T>
      <T x={10} y={256} fs={12} bold>
        障害・遅延
      </T>
      {quadrants.map((q) => (
        <Box key={q.lines[0]} x={q.x} y={q.y} w={295} h={110} lines={q.lines} fs={12} fill={q.fill} bold subTone="muted" accent={q.fill === 'box5'} />
      ))}
      <T x={10} y={330} fs={11} tone="muted">
        横は失敗する機能の位置づけ、縦は失敗の原因。色の付いた箱が、この章で Graceful Degradation を当てはめた範囲
      </T>
      <T x={10} y={350} fs={11} tone="muted">
        右上の unexpected は Rails.error.unexpected（Rails 7.2 以降）。再試行の判断は Retry with Backoff の章で扱う
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 91,
  part: 8,
  title: 'Graceful Degradation：おすすめ商品の API が止まっても商品ページを表示する',
  summary:
    'おすすめ商品の API が応答しないと、商品ページが60秒待ったうえで 500 になり、API を使わないカートのページまで待たされる場面から始めます。タイムアウト・失敗を1つの例外にまとめるクライアント・前回の結果と人気の商品による代わりの表示・エラーの報告で、商品ページを表示し続ける形に直し、WebMock と Puma で確かめます。最後に、何でも rescue する当てはめすぎと、Fail Fast との使い分け、Rails.error.handle などの Rails の仕組みを扱います。',
  goals: [
    '外部のサービスの障害が、タイムアウトのない呼び出しと Puma のスレッドを通じて、関係のないページにまで広がる理由を説明できる',
    'ページの機能を、なければ目的を果たせない機能（ハードな依存）と、なくても続けられる機能（ソフトな依存）に分けられる',
    'タイムアウト・例外のまとめ方・代わりの表示・エラーの報告を組み合わせて、外部 API の失敗を1か所で止めるコードを書き、WebMock でテストできる',
    '何でも rescue する書き方がアプリの中の誤りを隠すことを確かめ、Fail Fast と Graceful Degradation を失敗の原因と機能の位置づけで使い分けられる',
    'Rails.error.handle・Rails.error.unexpected・Rails.cache の失敗時の動きを、Graceful Degradation の道具として使える',
  ],
  prerequisites: [25],
  sections: [
    {
      id: 'scene',
      title: 'おすすめ API の障害で、商品ページとカートが表示されなくなる',
      body: (
        <>
          <p>
            この章では EC サイトの商品ページを例に、<Term en="Graceful Degradation">Graceful Degradation</Term>（段階的機能低下）を扱います。Graceful Degradation は、一部の機能が障害を起こしても、可能な範囲でサービスを続けるという原則です。まず、外部のサービスの障害がページ全体に広がるコードを動かして、何が起きるかを確かめます。
          </p>
          <h3>そもそも商品ページで何を表示するのか</h3>
          <p>
            EC サイトの商品ページには商品名・価格・在庫と「カートに入れる」ボタンを表示します。利用者はこのページを見て、商品を買うかどうかを決めます。ページの下には「この商品を見た人はこちらも見ています」という欄があり、おすすめの商品を並べます。
          </p>
          <p>
            商品名・価格・在庫は自分たちのアプリの MySQL にあります。一方、おすすめの商品は、閲覧の履歴を分析する別のチームが運用する API（おすすめ API）が決めます。Rails のアプリは商品の id を送っておすすめの商品の id の一覧を受け取り、その id の商品を自分の DB から読んで表示します。おすすめの欄は売り上げを増やすための機能ですが、なくても利用者は商品を見て、カートに入れられます。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_shop_tables.rb"
            code={`
class CreateShopTables < ActiveRecord::Migration[8.1]
  def change
    create_table :categories do |t|
      t.string :name, null: false
    end
    create_table :products do |t|
      t.references :category, null: false, foreign_key: true
      t.string :name, null: false
      t.integer :price, null: false
      t.integer :stock, null: false, default: 0
      t.integer :sales_count, null: false, default: 0 # 人気の順に並べるための販売数
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/category.rb・product.rb"
            code={`
class Category < ApplicationRecord
  has_many :products
end

class Product < ApplicationRecord
  belongs_to :category

  scope :popular, -> { order(sales_count: :desc) }
end
`}
          />
          <h3>おすすめ API を呼ぶコード</h3>
          <p>
            おすすめ API のクライアントは Ruby の HTTP クライアントの gem である Faraday で書きました。<code>f.response :raise_error</code> は 4xx・5xx の応答を例外にするミドルウェア、<code>f.response :json</code> は JSON の本文をハッシュに変えるミドルウェアです。
          </p>
          <Code
            lang="ruby"
            title="app/clients/recommendation_client.rb（直す前）"
            code={`
# 別のチームが運用する、おすすめ商品の API のクライアント（直す前）
class RecommendationClient
  def initialize(base_url: ENV.fetch("RECOMMENDATION_API_URL", "http://recommend.example"))
    @conn = Faraday.new(url: base_url) do |f|
      f.response :raise_error # 4xx・5xx を例外にする
      f.response :json
    end
  end

  # おすすめの商品の id の配列を返す
  def product_ids(product_id)
    @conn.get("v1/recommendations", product_id:).body.fetch("product_ids")
  end
end
`}
          />
          <p>コントローラーは商品を読み、おすすめの id を受け取って、その順に商品を並べます。<code>in_order_of</code> は指定した値の順に並べる Active Record のメソッドです。</p>
          <Code
            lang="ruby"
            title="app/controllers/products_controller.rb（直す前）"
            code={`
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])
    ids = RecommendationClient.new.product_ids(@product.id)
    @recommended = Product.where(id: ids).in_order_of(:id, ids)
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/products/show.html.erb（直す前）"
            code={`
<h1><%= @product.name %></h1>
<p><%= number_to_currency(@product.price, unit: "¥", precision: 0) %></p>
<p><%= @product.stock.positive? ? "在庫あり" : "在庫なし" %></p>
<button>カートに入れる</button>

<section>
  <h2>この商品を見た人はこちらも見ています</h2>
  <ul>
    <% @recommended.each do |product| %>
      <li><%= product.name %></li>
    <% end %>
  </ul>
</section>
`}
          />
          <Figure n="89-1" title="商品ページの構成と、問題が起きる箇所" caption="赤い文字は、この節で確かめる問題。">
            <SceneFigure />
          </Figure>
          <p>
            図 89-1 のとおり、コントローラーは商品とおすすめの両方をそろえてから表示します。おすすめ API の呼び出しで例外が起きると、商品の表示に必要なデータはそろっていても、ページ全体が表示されません。
          </p>
          <h3>おすすめ API の失敗をテストで再現する</h3>
          <p>
            外部の API の失敗は WebMock で再現しました。WebMock は Ruby の HTTP の要求を横取りして、決めた応答を返す gem です。<code>stub_request(:get, url).to_timeout</code> はタイムアウトを、<code>to_return(status: 503)</code> は 503 の応答を返します。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/products_spec.rb（直す前に実行したもの）"
            code={`
require "rails_helper"

RSpec.describe "商品ページ", type: :request do
  let(:desk) { Category.create!(name: "デスク周り") }
  let!(:product) { desk.products.create!(name: "ノートPCスタンド", price: 4980, stock: 3) }
  let!(:lamp) { desk.products.create!(name: "デスクライト", price: 6980, stock: 5, sales_count: 120) }
  let!(:mat) { desk.products.create!(name: "デスクマット", price: 2480, stock: 8, sales_count: 300) }
  let(:api) { "http://recommend.example/v1/recommendations?product_id=#{product.id}" }
  let(:json) { { "Content-Type" => "application/json" } }

  it "おすすめの商品を表示する" do
    stub_request(:get, api).to_return(body: { product_ids: [lamp.id] }.to_json, headers: json)
    get product_path(product)
    expect(response.body).to include("ノートPCスタンド", "デスクライト")
  end

  it "おすすめ API がタイムアウトしても、商品を表示する" do
    stub_request(:get, api).to_timeout
    get product_path(product)
    expect(response).to have_http_status(:ok)
    expect(response.body).to include("ノートPCスタンド", "カートに入れる")
  end

  it "おすすめ API が 503 を返しても、商品を表示する" do
    stub_request(:get, api).to_return(status: 503)
    get product_path(product)
    expect(response).to have_http_status(:ok)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests。Rails と gem のバックトレースは省略）"
            code={`
.FF

Failures:

  1) 商品ページ おすすめ API がタイムアウトしても、商品を表示する
     Failure/Error: @conn.get("v1/recommendations", product_id:).body.fetch("product_ids")

     Faraday::ConnectionFailed:
       execution expired
     # ./app/clients/recommendation_client.rb:12:in 'RecommendationClient#product_ids'
     # ./app/controllers/products_controller.rb:4:in 'ProductsController#show'
     # ./spec/requests/products_spec.rb:19:in 'block (2 levels) in <top (required)>'
     # ------------------
     # --- Caused by: ---
     # Net::OpenTimeout:
     #   execution expired

  2) 商品ページ おすすめ API が 503 を返しても、商品を表示する
     Failure/Error: @conn.get("v1/recommendations", product_id:).body.fetch("product_ids")

     Faraday::ServerError:
       the server responded with status 503 for GET http://recommend.example/v1/recommendations?product_id=34
     # ./app/clients/recommendation_client.rb:12:in 'RecommendationClient#product_ids'
     # ./app/controllers/products_controller.rb:4:in 'ProductsController#show'
     # ./spec/requests/products_spec.rb:26:in 'block (2 levels) in <top (required)>'

3 examples, 2 failures
`}
          />
          <p>
            WebMock の <code>to_timeout</code> は、Net::HTTP の接続のタイムアウト（Net::OpenTimeout）を起こします<Ref n={15} />。Faraday の Net::HTTP のアダプターはこの例外を Faraday::ConnectionFailed に変えます<Ref n={13} />。503 は raise_error のミドルウェアが Faraday::ServerError にしました。どちらの例外もコントローラーまで伝わっています。テストの環境は例外をそのままテストに伝える設定なので、例外として失敗しましたが、本番では 500 のエラーのページになります。商品名も価格も DB から読めているのに、利用者には何も表示されません。
          </p>
          <h3>応答しない API と Puma のスレッド</h3>
          <p>
            障害のときのおすすめ API はすぐにエラーを返すとは限らず、接続は受け付けたまま応答を返さないこともあります。この状態を再現するために、接続を受け付けてから90秒たつまで応答しないサーバーを書き、おすすめ API の代わりにしました。
          </p>
          <Code
            lang="ruby"
            title="script/slow_api.rb"
            code={`
# 応答しないおすすめ API の代わり。接続は受け付けるが、DELAY 秒たつまで応答しない
require "socket"

delay = Float(ENV.fetch("DELAY", "90"))
server = TCPServer.new("127.0.0.1", 4000)
loop do
  Thread.new(server.accept) do |client|
    nil while (line = client.gets) && line != "\\r\\n" # 要求の行とヘッダーを読み飛ばす
    sleep delay
    body = '{"product_ids":[]}'
    client.write "HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\nContent-Length: #{body.bytesize}\\r\\n\\r\\n#{body}"
    client.close
  end
end
`}
          />
          <p>
            Rails のアプリは Puma で動かします。Puma は決まった数のスレッドで要求を処理し、すべてのスレッドが使用中なら、次の要求は空くまで待ちます（スレッドの数の決め方は <ChapterLink n={23} section="sizing" />）。違いがわかりやすいように、スレッドを2つにして起動し、3人の利用者が 0.1 秒ずつずらして、商品ページ2つと、おすすめ API を使わないカートのページを開く場面を作りました。
          </p>
          <Code
            lang="ruby"
            title="script/load.rb と script/run_load.sh"
            code={`
# load.rb　3人の利用者が 0.1 秒ずつずらして、商品ページ2つとカートを開く
require "net/http"

clock = -> { Process.clock_gettime(Process::CLOCK_MONOTONIC) }
t0 = clock.call
requests = [[0.0, "/products/1"], [0.1, "/products/2"], [0.2, "/cart"]]
threads = requests.map do |delay, path|
  Thread.new do
    sleep delay
    started = clock.call - t0
    res = Net::HTTP.start("127.0.0.1", 3000, read_timeout: 120) { |http| http.get(path) }
    format("%-12s 開始 %4.1f 秒  終了 %5.2f 秒  %s", path, started, clock.call - t0, res.code)
  end
end
puts threads.map(&:value)

# run_load.sh　Puma のスレッドを2つにして起動し、応答しない API に向けて load.rb を実行する
ruby script/slow_api.rb &
RECOMMENDATION_API_URL=http://127.0.0.1:4000 RAILS_MAX_THREADS=2 bin/rails server -p 3000 > log/puma.log 2>&1 &
until curl -s -o /dev/null http://127.0.0.1:3000/cart; do sleep 0.5; done
ruby script/load.rb
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bash script/run_load.sh と、log/puma.log の抜粋）"
            code={`
/products/1  開始  0.0 秒  終了 60.18 秒  500
/products/2  開始  0.1 秒  終了 60.25 秒  500
/cart        開始  0.2 秒  終了 60.26 秒  200

（log/puma.log）
*  Min threads: 2
*  Max threads: 2
Started GET "/products/1" for 127.0.0.1 at 2026-11-21 02:16:50 +0000
Started GET "/products/2" for 127.0.0.1 at 2026-11-21 02:16:51 +0000
Completed 500 Internal Server Error in 60058ms (ActiveRecord: 4.5ms (1 query, 0 cached) | GC: 0.0ms)
Faraday::TimeoutError (Net::ReadTimeout with #<TCPSocket:(closed)>)
Completed 500 Internal Server Error in 60072ms (ActiveRecord: 0.3ms (1 query, 0 cached) | GC: 26.6ms)
Faraday::TimeoutError (Net::ReadTimeout with #<TCPSocket:(closed)>)
Started GET "/cart" for 127.0.0.1 at 2026-11-21 02:17:51 +0000
Completed 200 OK in 0ms (Views: 0.2ms | ActiveRecord: 0.0ms (0 queries, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            商品ページは約60秒待ってから 500 になりました。Faraday にタイムアウトを設定していないので、Net::HTTP の既定の読み込みのタイムアウト（60秒）が使われ、その時間がたって初めて Faraday::TimeoutError になります<Ref n={14} /><Ref n={16} />。もう1つの問題はカートです。カートはおすすめ API を使いませんが、Puma の2つのスレッドが商品ページの処理で待っている間は、処理するスレッドがありません。ログの <code>Started GET "/cart"</code> は 02:17:51 で、利用者 C の要求は約60秒待ってから処理されました。処理そのものは 0ms で終わっています。
          </p>
          <Figure n="89-2" title="おすすめ API が応答しないときの、3つの要求のタイムライン" caption="縦は時間、列は関係者。途中の約60秒を省いている。">
            <TimelineFigure />
          </Figure>
          <p>
            図 89-2 はこの3つの要求を時間の順に並べたものです。おすすめ API を待つスレッドが増えるほど、ほかのページを処理できるスレッドが減ります。本番でスレッドの数が多くても、商品ページへの要求が続けば同じことが起きます。さらに、ロードバランサーや Nginx のタイムアウトも既定では60秒前後なので、利用者は Rails の 500 より先に、ロードバランサーの 504 を受け取ることもあります（<ChapterLink n={25} section="timeouts" />）。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>なくても買い物を続けられるおすすめの欄の失敗で、商品名・価格・カートに入れるボタンまで表示されません。</li>
            <li>おすすめ API の呼び出しに上限の時間がなく、障害のときは60秒待ちます。</li>
            <li>待っている間、Puma のスレッドを使い続けるので、おすすめ API と関係のないカートのページも待たされます。</li>
            <li>おすすめ API の失敗のしかた（接続できない・応答しない・5xx・形式の違う本文）ごとに、別の例外がコントローラーまで伝わります。</li>
            <li>失敗したことが、500 のエラーとしてしか記録されません。おすすめ API の障害なのか、アプリの誤りなのかを、ログから区別しにくくなっています。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'Graceful Degradation の意味と、使われてきた分野',
      body: (
        <>
          <h3>Graceful Degradation の定義</h3>
          <p>
            Graceful Degradation（段階的機能低下）は、一部の機能が障害を起こしても、可能な範囲でサービスを続けるという原則です。すべての機能がそろわないときに全体を止めるのではなく、障害を起こした機能だけを外したり、質を下げた代わりのもので補ったりして、残りの機能を利用者に提供します。
          </p>
          <p>
            Graceful Degradation は、特定の人が論文や書籍で名付けた原則ではありません。いくつかの分野で、それぞれの意味で使われてきた言葉です。この章では Web アプリケーションのサーバー側の設計で使われる意味を扱います。
          </p>
          <h3>Web のフロントエンドでの意味</h3>
          <p>
            Web のフロントエンドでは、新しいブラウザーで最もよく動くサイトを作り、古いブラウザーでも、体験は劣るが必要な内容と機能は届くようにする設計の考え方を Graceful Degradation と呼びます<Ref n={3} />。MDN の用語集は基本の内容から作って新しいブラウザーで機能を足していく Progressive Enhancement を、関係はあるが逆の向きから考える方法として挙げています<Ref n={3} />。ブラウザーの違いを扱う意味なので、この章の外部のサービスの障害とは対象が違います。
          </p>
          <h3>Google の SRE 本での意味：過負荷のときに応答の質を下げる</h3>
          <p>
            Google の『Site Reliability Engineering』の第22章「Addressing Cascading Failures」は、過負荷のときに一部の要求を捨てる load shedding（負荷の切り捨て）と並べて、Graceful Degradation を説明しています。Graceful Degradation は load shedding をさらに進めて、行う仕事の量そのものを減らすものです。例として、検索のアプリケーションが過負荷のときに、ディスクの全データではなくメモリーのキャッシュにある一部だけを検索したり、精度の低い（そのかわり速い）順位付けを使ったりすることを挙げています<Ref n={2} />。応答の質を下げて、応答すること自体は続けるという考え方です。
          </p>
          <h3>AWS Well-Architected Framework での意味：ハードな依存をソフトな依存に変える</h3>
          <p>
            AWS Well-Architected Framework の信頼性の柱には「Implement graceful degradation to transform applicable hard dependencies into soft dependencies」（REL05-BP01）という項目があります<Ref n={1} />。依存先（呼び出す先のサービスやデータベース）が使えなくなったときに、呼び出し側も一緒に失敗する依存をハードな依存、呼び出し側は機能を落として動き続けられる依存をソフトな依存と呼び分け、当てはまる依存をソフトなものに変えるよう勧めています。
          </p>
          <ul>
            <li>依存先が使えなくなっても、部品は中心の機能を続けます。そのとき、少し古いデータ、別のデータ、またはデータなしで応答してよいとしています<Ref n={1} />。</li>
            <li>
              例として、EC サイトのトップページが、個人ごとのおすすめ・売れ筋の商品・注文の状況を別々のシステムから集めている場合を挙げ、1つのシステムが失敗しても、エラーのページを出すより残りを表示するほうがよいとしています<Ref n={1} />。この章の場面と同じ形です。
            </li>
            <li>
              何を中心の機能とするかは、技術だけでなく業務の判断でもあります。決済の処理なら一貫性を、リアルタイムのアプリケーションなら可用性を優先するというように、どちらかを諦めなければならないときにどちらが大切かを決めておきます<Ref n={1} />。
            </li>
            <li>
              よくない例として、中心の機能を決めていないこと、依存先が失敗しているときに部品が動くかをテストしていないこと、一部の結果を返せるのに何も返さないことを挙げています<Ref n={1} />。
            </li>
          </ul>
          <Figure n="89-3" title="商品ページの部分と、ハードな依存・ソフトな依存" caption="REL05-BP01 の考え方を、この章の商品ページに当てはめた模式図。">
            <DependencyFigure />
          </Figure>
          <p>
            図 89-3 はこの章の商品ページを3つの部分に分けたものです。商品名・価格・在庫と「カートに入れる」ボタンは、MySQL の products テーブルにハードに依存します。MySQL が使えなければ、正しい価格も在庫も示せないので、ページをエラーにします。おすすめの欄はおすすめ API にソフトに依存させます。おすすめ API が使えなければ、前回の結果や人気の商品で代えるか、欄を出さずにページを表示します。
          </p>
          <h3>Fail Fast との違い</h3>
          <p>
            <ChapterLink n={79} />（Fail Fast）は不正な状態や入力をできるだけ早く見つけ、問題を隠したまま処理を続けないという原則でした。Jim Shore は IEEE Software の 2004年のコラム「Fail Fast」で、問題を自動で回避してソフトウェアを頑丈にしようとすると、エラーの後も動き続けて、後で奇妙な形で失敗する（failing slowly）と書き、問題が起きたらすぐに、目に見える形で失敗させるよう勧めています<Ref n={5} />。「続ける」と「止める」なので、2つの原則は逆を向いているように見えます。
          </p>
          <p>
            2つの原則は、扱う失敗の種類が違います。Shore が例に挙げたのは、設定ファイルの書き間違いのような、プログラムを直せば二度と起きない誤りです<Ref n={5} />。こうした誤りを既定の値などで隠すと、原因を見つけるのに時間がかかります。一方、Graceful Degradation が扱うのは、自分たちのコードを直しても防げない外部のサービスの障害です。おすすめ API が止まったことは、商品ページのコードの誤りではありません。この章では次のように使い分けます。
          </p>
          <ul>
            <li>アプリの中の誤りやデータの不整合（nil への呼び出し、定義していないメソッド、設定の抜け）は止める（Fail Fast）。</li>
            <li>外部のサービスの障害や遅延は、なくても続けられる機能に限って、その機能の中に閉じ込めて続ける（Graceful Degradation）。</li>
          </ul>
          <p>
            Shore も、本番で例外がすべてクラッシュになることを勧めているわけではありません。アプリケーション全体の例外ハンドラー（global exception handler）で予期しない例外を受け止めて開発者に知らせ、バッチなら次の処理に進むという中間の方法を示しています。そのうえで、全体のハンドラーを使うなら、アプリケーションのほかの場所ではすべての例外を捕まえるハンドラー（catch-all）を避けるよう書いています。例外が全体のハンドラーまで届かなくなるからです<Ref n={5} />。この注意は後の「当てはめすぎたとき」の節で使います。
          </p>
          <h3>似た考え方との関係</h3>
          <ul>
            <li>
              Michael Nygard の『Release It!』（第2版、2018年）は、本番で動き続けるための安定性のパターン（Stability Patterns）として、Timeouts・Circuit Breaker・Bulkheads・Fail Fast・Shed Load などを並べています<Ref n={6} />。この章のタイムアウトはそのうちの Timeouts にあたります。
            </li>
            <li>
              <ChapterLink n={54} />（Retry with Backoff）は、一時的な失敗を待ち時間を延ばしながらやり直すパターンです。再試行は「同じ結果を得る」ための方法で、Graceful Degradation は「結果が得られないときに何を表示するか」を決める方法です。画面の表示の中で再試行すると利用者を待たせるので、この章では再試行しません。
            </li>
            <li>
              <ChapterLink n={82} />（Defensive Programming）は、外部の入力や信頼できないデータで問題が起きないようにする原則です。この章のクライアントもおすすめ API の応答の形を確かめてから使います。
            </li>
            <li>
              Amazon の Jacob Gabrielson は「Avoiding fallback in distributed systems」（2019年）で、失敗したときに別の仕組みで同じ結果を得ようとする fallback（代替の手段）を、Amazon ではほとんど使わないと書いています<Ref n={4} />。ただし、この記事が扱うのは、商品の情報を DB から読めないような、ページの目的を果たせなくなる重大な失敗です<Ref n={4} />。おすすめの欄のように、なくても続けられる機能を外すこととは区別して読みます。この記事の注意は当てはめすぎの節でも扱います。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: 'タイムアウト・代わりの表示・報告で、おすすめの失敗を1か所で止める',
      body: (
        <>
          <h3>直す順序</h3>
          <p>次の順に、1つずつテストを通しながら直します。</p>
          <ol>
            <li>ページの部分ごとに、失敗したら止めるのか続けるのかを決める（図 89-3）。</li>
            <li>おすすめ API の呼び出しにタイムアウトを設定し、失敗を1つの例外のクラスにまとめる。</li>
            <li>おすすめを返すクラスを作り、その例外だけを受け取って、前回の結果か人気の商品で代える。</li>
            <li>失敗をエラーの報告に送り、代わりの表示がどれくらい使われているかを見られるようにする。</li>
            <li>失敗のしかたごとに、WebMock でテストを書く。</li>
          </ol>
          <p>
            1番目はコードより先に決めることです。この章では、商品名・価格・在庫・カートは止める側、おすすめの欄は続ける側にしました。おすすめの代わりに何を表示するかは、売り場の担当者と相談して決めます。ここでは「同じ商品の前回のおすすめ」「なければ同じカテゴリの人気の商品」「それもなければ欄を出さない」の順にしました。
          </p>
          <h3>タイムアウトを決めて、失敗を1つの例外にまとめる</h3>
          <Code
            lang="ruby"
            title="app/clients/recommendation_client.rb"
            code={`
# 別のチームが運用する、おすすめ商品の API のクライアント
class RecommendationClient
  Error = Class.new(StandardError)

  def initialize(base_url: ENV.fetch("RECOMMENDATION_API_URL", "http://recommend.example"),
                 open_timeout: 0.3, timeout: 0.5)
    @conn = Faraday.new(url: base_url, request: { open_timeout:, timeout: }) do |f|
      f.response :raise_error # 4xx・5xx を例外にする
      f.response :json, parser_options: { symbolize_names: true }
    end
  end

  # おすすめの商品の id の配列を返す。API の失敗と形式の違う応答は Error にまとめる
  def product_ids(product_id)
    case @conn.get("v1/recommendations", product_id:).body
    in { product_ids: Array => ids } then ids
    else raise Error, "おすすめ API の応答の形式が違う"
    end
  rescue Faraday::Error => e
    raise Error, "おすすめ API の呼び出しに失敗した（#{e.class}）"
  end
end
`}
          />
          <ul>
            <li>
              <code>request: {'{ open_timeout:, timeout: }'}</code> がタイムアウトの設定です。<code>open_timeout</code> は接続を確立するまで、<code>timeout</code> は応答を読み終えるまでに待つ秒数の上限です<Ref n={14} />。この章では接続に 0.3 秒、応答に 0.5 秒としました。値はおすすめ API のふだんの応答時間を測ってから決めます。ふだんの応答の大部分が収まる時間より少し長くし、利用者を待たせてよい時間より短くします。決め方は <ChapterLink n={54} section="idea" />、ロードバランサーなどのタイムアウトとの関係は <ChapterLink n={25} section="timeouts" /> で扱いました。
            </li>
            <li>
              Faraday の例外（接続の失敗・タイムアウト・4xx・5xx・JSON の解析の失敗）は、どれも Faraday::Error のサブクラスです<Ref n={21} />。<code>rescue Faraday::Error</code> でこれらを受け取り、RecommendationClient::Error に変えて投げ直します。呼び出し側は、おすすめ API がどう失敗したかを知らなくても、この1つのクラスだけを受け取れば済みます。外部のサービスの事情をアプリの言葉に変える形は、<ChapterLink n={42} /> の Adapter と同じです。
            </li>
            <li>
              応答の本文は <code>case/in</code> のパターンマッチで確かめます。<code>in {'{ product_ids: Array => ids }'}</code> は「product_ids というキーがあり、値が配列のハッシュ」に一致したときだけ、その値を <code>ids</code> に入れます。キーがない、値が配列でない、本文がハッシュでない、のどれも <code>else</code> に進み、Error になります。Ruby のハッシュのパターンはキーに記号（Symbol）しか書けないので<Ref n={17} />、JSON を読むときに <code>symbolize_names: true</code> でキーを記号にしています。
            </li>
            <li>
              <code>rescue StandardError</code> とは書きません。Faraday 以外の例外（たとえば、このクラスの中の書き間違いによる NoMethodError）は、そのまま呼び出し側に伝わります。
            </li>
          </ul>
          <h3>おすすめを返すクラスで、例外を受け取って代える</h3>
          <p>
            コントローラーから、おすすめを決める処理を Recommendations というクラスに移します。このクラスは RecommendationClient::Error だけを受け取り、前回の結果か人気の商品で代えます。結果には、どこから得たおすすめかを表す <code>source</code> を付けます。
          </p>
          <Code
            lang="ruby"
            title="app/models/recommendations.rb"
            code={`
# 商品ページのおすすめ。おすすめ API が使えないときは、前回の結果か人気の商品で代える
class Recommendations
  Result = Data.define(:products, :source) # source は :api・:cache・:popular のどれか
  LIMIT = 4

  def initialize(client: RecommendationClient.new, cache: Rails.cache)
    @client = client
    @cache = cache
  end

  def for(product)
    key = ["recommendations", product.id]
    ids = @client.product_ids(product.id)
    @cache.write(key, ids, expires_in: 1.day) # 最後に成功した結果を残す
    Result.new(products: find_in_order(ids), source: :api)
  rescue RecommendationClient::Error => e
    Rails.error.report(e, handled: true, severity: :warning, context: { product_id: product.id })
    if (cached = @cache.read(key))
      Result.new(products: find_in_order(cached), source: :cache)
    else
      popular = product.category.products.popular.where.not(id: product.id).limit(LIMIT)
      Result.new(products: popular.to_a, source: :popular)
    end
  end

  private

  def find_in_order(ids)
    ids = ids.first(LIMIT)
    Product.where(id: ids).in_order_of(:id, ids).to_a
  end
end
`}
          />
          <ul>
            <li>
              おすすめ API が成功したら、受け取った id の一覧を Rails.cache に1日の期限で書きます。次に失敗したときは、この「最後に成功した結果」を使います。少し古いおすすめでも、商品ページの役に立つからです。Rails.cache の使い方は <ChapterLink n={22} section="rails-cache" /> で扱いました。
            </li>
            <li>
              前回の結果もなければ、同じカテゴリの商品を販売数の多い順に並べます。このデータは自分たちの MySQL にあるので、おすすめ API の障害に影響されません。
            </li>
            <li>
              <code>rescue RecommendationClient::Error</code> はメソッド全体に付けていますが、受け取るのはこのクラスの例外だけです。<code>find_in_order</code> の中の DB のエラーや、コードの誤りによる例外は捕まえずに、呼び出し側に伝えます。
            </li>
            <li>
              <code>Data.define</code> は値を持つだけの変更できないオブジェクトのクラスを作る Ruby の機能です（Ruby 3.2 から）<Ref n={22} />。結果の値をまとめる用途は <ChapterLink n={46} /> の Value Object と同じです。
            </li>
          </ul>
          <Figure n="89-4" title="タイムアウトと代わりの表示の流れ" caption="Recommendations#for の処理を上から順に追った模式図。">
            <FlowFigure />
          </Figure>
          <p>
            図 89-4 は Recommendations#for の流れです。成功・RecommendationClient::Error・それ以外の例外の3つに分かれます。利用者に見せる結果（色の付いた箱）は3通りあり、どれもページを表示します。右の列の、アプリの中の誤りによる例外だけは、代わりの表示を使わずに 500 にします。
          </p>
          <p>コントローラーは Recommendations を呼ぶだけになり、ビューは source を見て見出しを変えます。代わりの商品も0件なら、おすすめの欄そのものを出しません。</p>
          <Code
            lang="ruby"
            title="app/controllers/products_controller.rb"
            code={`
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])
    @recommendations = Recommendations.new.for(@product)
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/products/show.html.erb"
            code={`
<h1><%= @product.name %></h1>
<p><%= number_to_currency(@product.price, unit: "¥", precision: 0) %></p>
<p><%= @product.stock.positive? ? "在庫あり" : "在庫なし" %></p>
<button>カートに入れる</button>

<% if @recommendations.products.any? %>
  <section>
    <h2><%= @recommendations.source == :popular ? "このカテゴリの人気の商品" : "この商品を見た人はこちらも見ています" %></h2>
    <ul>
      <% @recommendations.products.each do |product| %>
        <li><%= product.name %></li>
      <% end %>
    </ul>
  </section>
<% end %>
`}
          />
          <h3>失敗を報告する</h3>
          <p>
            代わりの表示を使うと、利用者にはエラーが見えなくなります。開発者にも見えなくなると、おすすめ API が何日も止まっていることに気づけません。Recommendations は失敗を <code>Rails.error.report</code> で Rails のエラーの報告の仕組み（ActiveSupport::ErrorReporter）に送ります。<code>handled: true</code> は「アプリが処理した失敗」、<code>severity: :warning</code> は重要度が警告であることを、購読者（subscriber）に伝えます<Ref n={7} />。購読者は報告を受け取ってエラーの監視のサービスなどに送るオブジェクトです。この章ではログに書く購読者を登録しました。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/error_subscriber.rb"
            code={`
# エラーの報告をログに書く（本番では Sentry などのサービスに送る購読者を登録する）
class LogErrorSubscriber
  def report(error, handled:, severity:, context:, source:)
    Rails.logger.warn("[error_report] #{error.class}: #{error.message} " \\
                      "handled=#{handled} severity=#{severity} product_id=#{context[:product_id].inspect}")
  end
end

Rails.error.subscribe(LogErrorSubscriber.new)
`}
          />
          <Code
            lang="text"
            title="実行結果（テストを実行した後の log/test.log の抜粋）"
            code={`
[error_report] RecommendationClient::Error: おすすめ API の呼び出しに失敗した（Faraday::ConnectionFailed） handled=true severity=warning product_id=61
[error_report] RecommendationClient::Error: おすすめ API の呼び出しに失敗した（Faraday::ServerError） handled=true severity=warning product_id=64
[error_report] RecommendationClient::Error: おすすめ API の応答の形式が違う handled=true severity=warning product_id=67
`}
          />
          <p>
            どの失敗も RecommendationClient::Error と元の例外のクラスで記録されています。報告の数を数えれば、代わりの表示がどれくらいの頻度で使われているかがわかります。ログ・メトリクスで障害に気づく方法は <ChapterLink n={89} /> で扱います。
          </p>
          <h3>テストで確かめる</h3>
          <p>
            代わりの表示は、ふだんは使われない処理です。ふだん使われない処理ほど、壊れていても気づきにくくなります（当てはめすぎの節で扱います）。そこで、失敗のしかたごとにテストを書きます。テストの環境の Rails.cache は、何も保存しない null_store なので<Ref n={12} />、前回の結果を使うテストのために、メモリーに保存するストアに替えています。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/products_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "商品ページ", type: :request do
  let(:desk) { Category.create!(name: "デスク周り") }
  let!(:product) { desk.products.create!(name: "ノートPCスタンド", price: 4980, stock: 3) }
  let!(:lamp) { desk.products.create!(name: "デスクライト", price: 6980, stock: 5, sales_count: 120) }
  let!(:mat) { desk.products.create!(name: "デスクマット", price: 2480, stock: 8, sales_count: 300) }
  let(:api) { "http://recommend.example/v1/recommendations?product_id=#{product.id}" }
  let(:json) { { "Content-Type" => "application/json" } }

  # テストの環境の Rails.cache は null_store なので、メモリーに保存するものに替える
  before { allow(Rails).to receive(:cache).and_return(ActiveSupport::Cache::MemoryStore.new) }

  it "おすすめの商品を表示する" do
    stub_request(:get, api).to_return(body: { product_ids: [lamp.id] }.to_json, headers: json)
    get product_path(product)
    expect(response.body).to include("ノートPCスタンド", "この商品を見た人はこちらも見ています", "デスクライト")
  end

  it "おすすめ API がタイムアウトしたら、同じカテゴリの人気の商品を表示する" do
    stub_request(:get, api).to_timeout
    get product_path(product)
    expect(response).to have_http_status(:ok)
    expect(response.body).to include("ノートPCスタンド", "カートに入れる", "このカテゴリの人気の商品")
    expect(response.body.index("デスクマット")).to be < response.body.index("デスクライト")
  end

  it "おすすめ API が 503 を返しても、商品を表示する" do
    stub_request(:get, api).to_return(status: 503)
    get product_path(product)
    expect(response).to have_http_status(:ok)
    expect(response.body).to include("このカテゴリの人気の商品")
  end

  it "応答の形式が違うときも、人気の商品を表示する" do
    stub_request(:get, api).to_return(body: { items: [lamp.id] }.to_json, headers: json)
    get product_path(product)
    expect(response.body).to include("このカテゴリの人気の商品")
  end

  it "前に成功した結果があれば、それを表示する" do
    stub_request(:get, api).to_return(body: { product_ids: [lamp.id] }.to_json, headers: json).then.to_timeout
    get product_path(product)
    get product_path(product)
    expect(response.body).to include("この商品を見た人はこちらも見ています", "デスクライト")
    expect(response.body).not_to include("デスクマット")
  end

  it "おすすめ API の失敗を、エラーの報告に送る" do
    reports = []
    spy = Struct.new(:reports) { def report(error, **options) = reports << [error.class, options[:context][:product_id]] }
    Rails.error.subscribe(subscriber = spy.new(reports))
    stub_request(:get, api).to_timeout
    get product_path(product)
    expect(reports).to eq([[RecommendationClient::Error, product.id]])
  ensure
    Rails.error.unsubscribe(subscriber)
  end

  it "アプリの中の誤りは、代わりの表示で隠さない" do
    allow_any_instance_of(RecommendationClient).to receive(:product_ids).and_raise(NoMethodError)
    expect { get product_path(product) }.to raise_error(NoMethodError)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests --format documentation）"
            code={`
商品ページ
  おすすめの商品を表示する
  おすすめ API がタイムアウトしたら、同じカテゴリの人気の商品を表示する
  おすすめ API が 503 を返しても、商品を表示する
  応答の形式が違うときも、人気の商品を表示する
  前に成功した結果があれば、それを表示する
  おすすめ API の失敗を、エラーの報告に送る
  アプリの中の誤りは、代わりの表示で隠さない

7 examples, 0 failures
`}
          />
          <p>
            <code>to_return(...).then.to_timeout</code> は、1回目は成功、2回目はタイムアウトを返す指定です。最後の例は、RecommendationClient の中で NoMethodError が起きたときに、Recommendations がそれを受け取らずに伝えることを確かめています。代わりの表示を加えても、アプリの中の誤りはこれまでどおり例外として見つかります。
          </p>
          <h3>応答しない API に向けて、もう一度測る</h3>
          <p>直したコードで、前の節と同じ script/run_load.sh を実行しました。</p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bash script/run_load.sh と、log/puma.log の抜粋）"
            code={`
/products/1  開始  0.0 秒  終了  0.54 秒  200
/products/2  開始  0.1 秒  終了  0.62 秒  200
/cart        開始  0.2 秒  終了  0.55 秒  200

（log/puma.log）
[error_report] RecommendationClient::Error: おすすめ API の呼び出しに失敗した（Faraday::TimeoutError） handled=true severity=warning product_id=1
Completed 200 OK in 541ms (Views: 4.6ms | ActiveRecord: 5.8ms (3 queries, 0 cached) | GC: 0.2ms)
Started GET "/cart" for 127.0.0.1 at 2026-11-21 02:19:45 +0000
Completed 200 OK in 0ms (Views: 0.2ms | ActiveRecord: 0.0ms (0 queries, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            商品ページは 0.5 秒のタイムアウトで打ち切り、人気の商品を表示して 200 を返しました。スレッドが 0.5 秒ほどで空くので、カートの要求も 0.55 秒で返っています。
          </p>
          <Figure n="89-5" title="直す前と直した後：例外が届く範囲" caption="時間は、図 89-2 と同じ条件（Puma のスレッド2つ、応答しない API）で測った値。">
            <CompareFigure />
          </Figure>
          <p>
            図 89-5 の左は直す前で、おすすめ API の失敗がコントローラーまで上がり、ページ全体を失敗させました。右は直した後で、失敗は RecommendationClient::Error に変わって Recommendations で止まり、コントローラーには必ず結果が返ります。おすすめ API の障害が影響する範囲が、おすすめの欄の中に限られました。
          </p>
          <Callout kind="note" title="障害が長く続くとき">
            <p>
              直した後も、おすすめ API が止まっている間は、商品ページの要求ごとに 0.5 秒待ちます。障害が長く続き、この待ち時間も避けたいときは、失敗が続いたら一定の時間は呼び出しそのものをやめる Circuit Breaker を組み合わせます。Ruby の stoplight などの gem と、Retry with Backoff との使い分けは <ChapterLink n={54} section="alternatives" /> で扱います。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '何でも rescue したとき：アプリの中の誤りまで代わりの表示で隠れる',
      body: (
        <>
          <h3>何でも rescue して空の一覧を返す書き方</h3>
          <p>
            「おすすめの欄で何が起きても、商品ページは表示したい」と考えると、メソッド全体で例外を受け取って空の一覧を返す書き方になりがちです。次の SafeRecommendations は、その考えで書いたクラスです。<code>rescue =&gt; e</code> は例外のクラスを書かない rescue で、StandardError とそのサブクラスをすべて受け取ります。
          </p>
          <p>
            このクラスに、売り場の担当者から頼まれた「在庫のない商品はおすすめに出さない」という変更を加えました。在庫のある商品に絞る <code>in_stock</code> というスコープを呼んでいますが、Product にはまだ定義していません。
          </p>
          <Code
            lang="ruby"
            title="app/models/safe_recommendations.rb"
            code={`
# 何でも rescue して、空の一覧で続ける（当てはめすぎの例）
class SafeRecommendations
  def for(product)
    ids = RecommendationClient.new.product_ids(product.id)
    Product.where(id: ids).in_stock.to_a # 在庫のある商品だけにする変更。scope の in_stock はまだ定義していない
  rescue => e
    []
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/models/safe_recommendations_spec.rb"
            code={`
require "rails_helper"

RSpec.describe SafeRecommendations do
  let(:desk) { Category.create!(name: "デスク周り") }
  let!(:product) { desk.products.create!(name: "ノートPCスタンド", price: 4980, stock: 3) }
  let!(:lamp) { desk.products.create!(name: "デスクライト", price: 6980, stock: 5) }

  it "API が成功しても、例外を出さずに空の一覧を返す" do
    stub_request(:get, "http://recommend.example/v1/recommendations?product_id=#{product.id}")
      .to_return(body: { product_ids: [lamp.id] }.to_json, headers: { "Content-Type" => "application/json" })
    expect(SafeRecommendations.new.for(product)).to eq([])
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models --format documentation）"
            code={`
SafeRecommendations
  API が成功しても、例外を出さずに空の一覧を返す

1 example, 0 failures
`}
          />
          <p>
            このテストは、誤りが隠れることを示すために書いたものです。おすすめ API は成功し、在庫のあるデスクライトの id を返しています。それでも結果は空の一覧でした。<code>in_stock</code> の呼び出しで NoMethodError が起き、<code>rescue =&gt; e</code> がそれを受け取って <code>[]</code> を返したからです。このクラスを商品ページで使うと、すべての商品ページで、おすすめの一覧が空になります。ページは 200 で表示され、エラーの報告もないので、開発者は売り上げの数字が下がるまで気づけません。
          </p>
          <h3>同じ誤りを Recommendations に入れると、テストで見つかる</h3>
          <p>比べるために、前の節の Recommendations の find_in_order に同じ変更を入れ、商品ページのテストの最初の例を実行しました。</p>
          <Code
            lang="ruby"
            title="app/models/recommendations.rb（find_in_order に同じ変更を入れたもの）"
            code={`
  def find_in_order(ids)
    ids = ids.first(LIMIT)
    Product.where(id: ids).in_stock.in_order_of(:id, ids).to_a
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests/products_spec.rb:14。Rails と gem のバックトレースは省略）"
            code={`
F

Failures:

  1) 商品ページ おすすめの商品を表示する
     Failure/Error: Product.where(id: ids).in_stock.in_order_of(:id, ids).to_a

     NoMethodError:
       undefined method 'in_stock' for an instance of ActiveRecord::Relation
     # ./app/models/recommendations.rb:30:in 'Recommendations#find_in_order'
     # ./app/models/recommendations.rb:15:in 'Recommendations#for'
     # ./app/controllers/products_controller.rb:4:in 'ProductsController#show'

1 example, 1 failure
`}
          />
          <p>
            Recommendations が受け取るのは RecommendationClient::Error だけなので、NoMethodError はテストまで伝わり、最初の例で見つかりました。代わりの表示で受け取る例外を外部のサービスの失敗に限っておけば、アプリの中の誤りは Fail Fast のとおりにすぐ見つかります。Jim Shore もすべての例外を捕まえるハンドラーをコードから探し、取り除くか書き直すよう勧めています<Ref n={5} />。
          </p>
          <h3>代わりの手段そのものが、障害を広げる</h3>
          <p>
            代わりの表示のための処理は障害のときにだけ動きます。Gabrielson はこの章の意味と由来の節で挙げた記事で、2001年ごろに Amazon の通販サイトで起きた障害を紹介しています<Ref n={4} />。
          </p>
          <ul>
            <li>商品ごとの配送の速さを、Web サーバーごとのキャッシュから読み、キャッシュが使えないときはデータベースを直接読むようにしていた。</li>
            <li>数か月は問題なく動いたが、キャッシュがほぼ同時にすべて失敗し、すべての Web サーバーがデータベースを直接読んだ。データベースは負荷で応答しなくなり、Web サーバーのプロセスがすべてデータベースを待って、サイト全体が止まった。</li>
            <li>配送の速さを表示できないだけで済むはずの部分的な障害が、どのページも表示されない障害になった。</li>
          </ul>
          <p>
            記事は、代わりの手段は試すのが難しく、本番で長い間動かないので、誤りが残ったまま気づかれにくいとも書いています<Ref n={4} />。この章のコードにも、同じ形の箇所があります。
          </p>
          <ul>
            <li>人気の商品は MySQL から読みます。おすすめ API が止まると、すべての商品ページで、ふだんは実行しない人気の商品のクエリが1回ずつ増えます。障害のときの MySQL の負荷を、このクエリの分だけ見積もっておきます。</li>
            <li>前回の結果を読む Rails.cache も、依存先の1つです。次の節で、Redis が応答しないと Rails.cache の1回の操作に約2秒かかることを確かめます。</li>
            <li>代わりの手段を重ねるほど、障害のときにだけ動くコードが増えます。この章では代わりの手段ごとにテストを書いたうえで、前回の結果・人気の商品・欄を出さない、の3段にとどめました。</li>
          </ul>
          <p>
            記事は代わりの手段に頼らない方法として、要求を処理するときにほかのサービスを呼ばずに済むよう、必要なデータを前もって送っておく方法も挙げています<Ref n={4} />。Rails なら、おすすめを定期的なジョブで取得して自分たちの DB に保存し、商品ページはその表を読む形がこれに当たります（定期的なジョブは <ChapterLink n={18} section="recurring-jobs" />）。商品ページから外部の呼び出しがなくなり、代わりの表示の処理も要らなくなります。おすすめが何時間前のものでもよいかどうかで、どちらの形にするかを決めます。
          </p>
          <h3>判断の目安</h3>
          <Figure n="89-6" title="Fail Fast と Graceful Degradation の使い分け" caption="失敗の原因と、失敗する機能の位置づけの組み合わせごとに、止めるか続けるかを示した。">
            <JudgeFigure />
          </Figure>
          <p>
            図 89-6 は止めるか続けるかを、失敗の原因と失敗する機能の位置づけの2つで決める図です。この章で続ける形にしたのは、右下の「外部のサービスの障害で、なくても続けられる機能」だけです。ほかの3つの場合は、次のように扱います。
          </p>
          <ul>
            <li>
              外部のサービスの障害でも、価格・在庫・決済のように、なければページの目的を果たせない機能は、古い値で代えずにエラーを示します（左下）。古い価格でカートに入れられると、利用者が見た価格と請求する価格が食い違います。AWS の文書も決済の処理なら一貫性を優先するという例を挙げています<Ref n={1} />。
            </li>
            <li>なければ目的を果たせない機能で、アプリの中の誤りやデータの不整合が起きたら、止めます（左上）。</li>
            <li>
              なくても続けられる機能でも、アプリの中の誤りは少なくとも開発とテストでは止めます（右上）。前の項の in_stock の誤りは、止める書き方にしていたのでテストで見つかりました。本番でも止めるか、報告して続けるかは選べます。「開発とテストでは止め、本番では報告して続ける」動きは、Rails では Rails.error.unexpected で書けます（次の節）。
            </li>
          </ul>
          <p>
            続ける形にするか迷ったら、次の3つを確かめます。受け取る例外のクラスを外部のサービスの失敗に絞れるか。代わりの表示ごとにテストを書けるか。失敗を報告して、代わりの表示が使われた回数を数えられるか。どれかができないなら、続けるコードを書くより、止めて原因を早く見つけるほうを選びます。2つの原則の比べ方は <ChapterLink n={93} section="failfast-graceful" /> でまとめます。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails.error・Rails.cache と Graceful Degradation',
      body: (
        <>
          <h3>Rails.error.handle：報告と代わりの値を1か所に書く</h3>
          <p>
            Rails.error.handle は、ブロックの中で起きた例外を Rails のエラーの報告の仕組みに送り、ブロックの外には伝えずに、<code>fallback</code> に渡した処理の値を返すメソッドです<Ref n={7} />。Recommendations#for は、rescue の代わりに handle で書くこともできます。
          </p>
          <Code
            lang="ruby"
            title="app/models/recommendations.rb（Rails.error.handle で書いたもの）"
            code={`
# 商品ページのおすすめ（Rails.error.handle で書いたもの）
class Recommendations
  # …（省略。Result・LIMIT・initialize は rescue で書いたものと同じ）

  def for(product)
    key = ["recommendations", product.id]
    Rails.error.handle(RecommendationClient::Error, context: { product_id: product.id },
                                                    fallback: -> { fallback(product, key) }) do
      ids = @client.product_ids(product.id)
      @cache.write(key, ids, expires_in: 1.day) # 最後に成功した結果を残す
      Result.new(products: find_in_order(ids), source: :api)
    end
  end

  private

  def fallback(product, key)
    if (cached = @cache.read(key))
      Result.new(products: find_in_order(cached), source: :cache)
    else
      popular = product.category.products.popular.where.not(id: product.id).limit(LIMIT)
      Result.new(products: popular.to_a, source: :popular)
    end
  end

  # …（省略。find_in_order は rescue で書いたものと同じ）
end
`}
          />
          <Code
            lang="text"
            title="実行結果（上のファイルに置き換えて bundle exec rspec spec/requests --format documentation）"
            code={`
商品ページ
  おすすめの商品を表示する
  おすすめ API がタイムアウトしたら、同じカテゴリの人気の商品を表示する
  おすすめ API が 503 を返しても、商品を表示する
  応答の形式が違うときも、人気の商品を表示する
  前に成功した結果があれば、それを表示する
  おすすめ API の失敗を、エラーの報告に送る
  アプリの中の誤りは、代わりの表示で隠さない

7 examples, 0 failures
`}
          />
          <p>
            7つの例は rescue で書いたコードと同じように通りました。handle は報告するときに <code>handled: true</code> を渡し、severity を指定しなければ <code>:warning</code> にします<Ref n={8} />。rescue で書いたコードでは <code>Rails.error.report</code> に渡していた2つの値を、書かなくて済みます。
          </p>
          <p>
            気をつけるのは、handle の最初の引数です。例外のクラスを省くと、handle は StandardError とそのサブクラスをすべて受け取ります<Ref n={8} />。試しに <code>RecommendationClient::Error</code> を消して、同じテストを実行しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/recommendations.rb（handle の例外のクラスを消したもの）"
            code={`
    Rails.error.handle(context: { product_id: product.id },
                       fallback: -> { fallback(product, key) }) do
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests。gem のバックトレースは省略）"
            code={`
......F

Failures:

  1) 商品ページ アプリの中の誤りは、代わりの表示で隠さない
     Failure/Error: expect { get product_path(product) }.to raise_error(NoMethodError)
       expected NoMethodError but nothing was raised

7 examples, 1 failure
`}
          />
          <p>
            NoMethodError も代わりの値に置き換わり、最後の例が失敗しました。報告には送られますが、テストでも画面でも誤りは見えません。前の節の SafeRecommendations と同じ問題なので、handle には受け取る例外のクラスを書きます。
          </p>
          <h3>Rails.error.unexpected：開発とテストでは止め、本番では報告して続ける</h3>
          <p>
            Rails.error.unexpected は、本番では失敗を報告して nil を返し、開発とテストでは例外を投げるメソッドです<Ref n={7} />。どちらの動きにするかは Rails.error.debug_mode で決まり、Rails は <code>config.consider_all_requests_local</code> が true のとき（新しいアプリケーションの開発とテストの環境）に debug_mode を true にします<Ref n={9} />。図 89-6 の右上、つまりなくても続けられる機能で「起きないはずの状態」を見つけたときに使います。
          </p>
          <Code
            lang="ruby"
            title="script/unexpected.rb"
            code={`
# Rails.error.unexpected の動きを、debug_mode を切り替えて確かめる（bin/rails runner で実行する）
Rails.logger = ActiveSupport::Logger.new($stdout) # LogErrorSubscriber が書くログを画面に出す

Rails.error.debug_mode = false # 本番と同じ（consider_all_requests_local が false のとき）
p Rails.error.unexpected("おすすめ API が、存在しない商品の id を返した", context: { product_id: 1 })

Rails.error.debug_mode = true # 開発とテストと同じ
begin
  Rails.error.unexpected("おすすめ API が、存在しない商品の id を返した", context: { product_id: 1 })
rescue => e
  puts "rescue => e で捕まえた: #{e.class}"
rescue Exception => e # UnexpectedError は StandardError のサブクラスではない
  puts "#{e.class}: #{e.message}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/unexpected.rb）"
            code={`
[error_report] RuntimeError: おすすめ API が、存在しない商品の id を返した handled=true severity=warning product_id=1
nil
ActiveSupport::ErrorReporter::UnexpectedError: RuntimeError: おすすめ API が、存在しない商品の id を返した
`}
          />
          <p>
            debug_mode が false のときは、文字列から RuntimeError を作って報告し、nil を返しました。true のときは ActiveSupport::ErrorReporter::UnexpectedError を投げました。UnexpectedError は StandardError ではなく Exception のサブクラスなので<Ref n={8} />、<code>rescue =&gt; e</code> では受け取られず、2つ目の rescue まで進んでいます。途中に何でも rescue するコードがあっても、開発とテストでは誤りが画面やテストに出ます。
          </p>
          <h3>Rails.cache：Redis が止まっても例外にしない</h3>
          <p>
            Rails の中にも、Graceful Degradation で作られた部品があります。Rails.cache の保存先に Redis を使う RedisCacheStore は、Redis が使えないときに例外を投げません。読み込みはキャッシュにないものとして nil を返し、書き込みは捨てます<Ref n={10} /><Ref n={11} />。失敗は error_handler に渡され、既定の error_handler はログに書いたうえで、Rails のエラーの報告に <code>severity: :warning</code> で送ります<Ref n={10} />。
          </p>
          <p>
            検証の環境は gem を全員で共有しているので、redis の gem は Gemfile に入れず、このアプリの下のディレクトリ（vendor/redisgem）に入れました。そのため、次のスクリプトは bundler を使わずに ruby で実行しています。Redis の代わりに、何も動いていないポートと、接続を受け付けても応答しない script/slow_api.rb に向けました。
          </p>
          <Code
            lang="ruby"
            title="script/cache_down.rb"
            code={`
# Redis に接続できないとき・Redis が応答しないときの RedisCacheStore の動き
# redis の gem は Gemfile に入れず vendor/redisgem に入れたので、bundler を使わずに実行する
require "active_support/all"
require "logger"

ActiveSupport::Cache::Store.logger = Logger.new($stdout, level: :error, formatter: ->(*, msg) { "  ログ: #{msg}\\n" })
reporter = Object.new
def reporter.report(error, handled:, severity:, context:, source:)
  puts "  報告: #{error.class} handled=#{handled} severity=#{severity} source=#{source}"
end
ActiveSupport.error_reporter.subscribe(reporter)

clock = -> { Process.clock_gettime(Process::CLOCK_MONOTONIC) }
{ "接続できない（何も動いていないポート）" => "redis://127.0.0.1:6390/0",
  "応答しない（script/slow_api.rb）" => "redis://127.0.0.1:4000/0" }.each do |label, url|
  puts label
  cache = ActiveSupport::Cache.lookup_store(:redis_cache_store, url:)
  t = clock.call
  puts "  write => #{cache.write(%w[recommendations 1], [2, 3]).inspect}"
  puts "  read  => #{cache.read(%w[recommendations 1]).inspect}"
  puts "  fetch => #{cache.fetch("popular") { "ブロックで作った値" }.inspect}"
  puts format("  3つの操作で %.2f 秒", clock.call - t)
end
`}
          />
          <Code
            lang="text"
            title="実行結果（DELAY=30 ruby script/slow_api.rb を起動してから、GEM_PATH に vendor/redisgem を加えて ruby script/cache_down.rb）"
            code={`
接続できない（何も動いていないポート）
  ログ: RedisCacheStore: write_entry failed, returned nil: Redis::CannotConnectError: Connection refused - connect(2) for 127.0.0.1:6390 (redis://127.0.0.1:6390)
  報告: Redis::CannotConnectError handled=true severity=warning source=redis_cache_store.active_support
  write => nil
  ログ: RedisCacheStore: read_entry failed, returned nil: Redis::CannotConnectError: Connection refused - connect(2) for 127.0.0.1:6390 (redis://127.0.0.1:6390)
  報告: Redis::CannotConnectError handled=true severity=warning source=redis_cache_store.active_support
  read  => nil
  （fetch の読み込みと書き込みの、ログと報告の4行は省略）
  fetch => "ブロックで作った値"
  3つの操作で 0.01 秒
応答しない（script/slow_api.rb）
  ログ: RedisCacheStore: write_entry failed, returned nil: Redis::TimeoutError: Waited 1 seconds
  報告: Redis::TimeoutError handled=true severity=warning source=redis_cache_store.active_support
  write => nil
  （read のログと報告の2行は省略）
  read  => nil
  （fetch の読み込みと書き込みの、ログと報告の4行は省略）
  fetch => "ブロックで作った値"
  3つの操作で 8.02 秒
`}
          />
          <p>
            どちらの場合も、write と read は nil を返し、fetch はブロックで作った値を返しました。例外は投げず、失敗のたびにログと報告が出ています。この章の Recommendations も、Redis が止まると前回の結果を読めなくなるだけで、人気の商品で代えてページを表示します。
          </p>
          <p>
            ただし、応答しない Redis では3つの操作に 8.02 秒かかりました。fetch はキャッシュにない値を読んでからブロックの値を書くので、Redis への操作は全部で4回です。読み書きのタイムアウトの既定は1秒で、接続に失敗したときは1回だけ再接続するので<Ref n={11} />、1回の操作で約2秒待ちます。<code>reconnect_attempts: 0</code> を指定すると、1回の操作が 1.00 秒になることも確かめました。Rails のガイドは、値を作り直すほうが1秒以上待つより速いことが多いとして、タイムアウトを短めにするよう勧めています<Ref n={11} />。Rails.cache も外部 API と同じ依存先として、1回の要求で何回読むかを数え、タイムアウトを決めます。
          </p>
          <Figure n="89-7" title="例外を受け取る書き方と、Rails の仕組みの比較" caption="この章で動かした書き方を、受け取る例外・例外のあとの動き・報告で並べた。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">書き方</th>
                    <th scope="col">受け取る例外</th>
                    <th scope="col">例外のあと</th>
                    <th scope="col">報告</th>
                    <th scope="col">この章での使い道</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>rescue RecommendationClient::Error</code></td>
                    <td>書いたクラスだけ</td>
                    <td>rescue の中の値を返す</td>
                    <td>自分で Rails.error.report を呼ぶ</td>
                    <td>Recommendations#for（直した版）</td>
                  </tr>
                  <tr>
                    <td><code>rescue =&gt; e</code></td>
                    <td>StandardError のすべて</td>
                    <td>空の一覧を返す</td>
                    <td>なし</td>
                    <td>使わない（アプリの中の誤りを隠す）</td>
                  </tr>
                  <tr>
                    <td><code>Rails.error.handle(クラス, fallback:)</code></td>
                    <td>書いたクラス（省くと StandardError のすべて）</td>
                    <td>fallback の値を返す（fallback がなければ nil）</td>
                    <td>handled: true、既定は :warning</td>
                    <td>Recommendations#for の別の書き方</td>
                  </tr>
                  <tr>
                    <td><code>Rails.error.record(クラス)</code></td>
                    <td>書いたクラス（省くと StandardError のすべて）</td>
                    <td>報告してから、同じ例外を投げ直す</td>
                    <td>handled: false、既定は :error</td>
                    <td>報告してから止めるとき</td>
                  </tr>
                  <tr>
                    <td><code>Rails.error.unexpected</code></td>
                    <td>（例外は受け取らない。コードの中で呼ぶ）</td>
                    <td>本番は nil を返して続ける。開発とテストは UnexpectedError を投げる</td>
                    <td>本番は handled: true、既定は :warning</td>
                    <td>起きないはずの状態を見つけたとき</td>
                  </tr>
                  <tr>
                    <td>RedisCacheStore</td>
                    <td>Redis の接続・タイムアウトのエラー</td>
                    <td>読み込みは nil、書き込みは捨てる</td>
                    <td>ログと、:warning の報告</td>
                    <td>前回の結果を読むキャッシュ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 89-7 はこの章で動かした書き方を並べたものです。Rails.error.record だけは動かしていませんが、Rails のソースで、報告してから同じ例外を投げ直すことを確かめました<Ref n={8} />。続ける書き方（上から1・3・5・6行目）は、どれも受け取る例外を絞り、報告を残しています。2行目だけが、受け取る範囲が広く、報告もありません。
          </p>
          <h3>受け取らなかった例外は Rails に任せる</h3>
          <p>
            Recommendations が受け取らなかった例外は、コントローラーを通って Rails まで伝わり、本番では 500 のエラーのページになります。このように処理されなかった例外は、Rails が Rails.error の購読者にも自動で報告します<Ref n={7} />。Jim Shore が勧めるアプリケーション全体の例外ハンドラーにあたる仕組みは、Rails にすでにあります<Ref n={5} />。この章ではおすすめ API の失敗だけを Recommendations で受け取り、ほかの例外はこの仕組みに任せました。例外のクラスごとに応答を変える rescue_from は <ChapterLink n={10} section="exceptions" /> で扱いました。
          </p>
          <h3>Rails Doctrine との関係</h3>
          <p>
            Rails Doctrine の「Value integrated systems」は、Rails は統合されたシステム（1つのアプリケーションで問題全体を扱うシステム）を第一に考えると述べています。オブジェクトのメソッドの呼び出しはマイクロサービスの間の遠隔の呼び出しよりはるかに単純で、分散すると、失敗の状態・遅延・依存の更新の予定という新しい問題が増えるとも書いています。さらに、外から要求を受けるより、外へ要求を送るほうが扱いにくいとも述べています<Ref n={18} />。
          </p>
          <p>
            この章のおすすめ API の呼び出しは外へ要求を送る部分で、その失敗の状態を商品ページの側で扱う必要がありました。商品・価格・在庫のように、1つのアプリケーションと1つの DB の中で完結する部分は、失敗したら止めます。外へ出る呼び出しのうち、なくても続けられる部分にだけ Graceful Degradation を当てはめる、と範囲を決めておくと、この章の当てはめすぎを避けられます。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 では、この章で使った Rails.error.report・handle・unexpected と debug_mode の決め方、RedisCacheStore の失敗のときの動き（ログ・報告・1秒のタイムアウト）は 8.1 と同じです（activesupport 7.2.0 と railties 7.2.0 の gem で確かめました）<Ref n={19} />。Rails.error.unexpected は 7.2 で足されたメソッドで、7.1 にはありません。
            </p>
            <p>
              7.0 にはさらに違いがあります。購読者の report に <code>source:</code> が渡されないので、この章の LogErrorSubscriber のように <code>source:</code> を必須のキーワード引数にせず、Rails のガイドの例のように <code>source: nil</code> と書きます。handle に書ける例外のクラスは1つです。RedisCacheStore は失敗をログに書くだけで Rails.error には報告せず、接続のタイムアウトの既定は20秒です<Ref n={20} />。Data.define は Ruby 3.2 以降で使えます<Ref n={22} />。
            </p>
          </Callout>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          続ける形にするのは、外部のサービスの障害で、なくてもページの目的を果たせる機能だけです。この章ではおすすめ API の呼び出しにタイムアウトを決めて失敗を1つの例外のクラスにまとめ、その例外だけを受け取って前回の結果か人気の商品で代えました。価格・在庫・決済のように、なければ目的を果たせない機能や、アプリの中の誤りは止めます。
        </>
      ),
      benefit: {
        text: <>直す前は、応答しないおすすめ API を約60秒待ってから商品ページが 500 になり、その間 Puma のスレッドを使い続けて、カートのページまで待たされた。直した後は、同じ条件で商品ページは 0.5 秒のタイムアウトで打ち切って人気の商品を表示して 200 を返し、カートの要求も 0.55 秒で返った。</>,
        basis: <><ChapterLink n={91} section="scene" />、<ChapterLink n={91} section="apply" /></>,
      },
      cost: {
        text: <>代わりの表示はふだん動かないので、タイムアウト・503・形式の違う応答・前回の結果のそれぞれを WebMock でテストする必要がある。おすすめ API が止まっている間は、商品ページの要求ごとに 0.5 秒待つことが残る。</>,
        basis: <ChapterLink n={91} section="apply" />,
      },
      alternative: {
        text: <>障害が長く続くなら、失敗が続いた間は呼び出しそのものをやめる Circuit Breaker を組み合わせる。何でも rescue した例では、在庫で絞る変更の NoMethodError が空の一覧に置き換わり、テストも通った。代わりの手段がデータベースを直接読むような重い処理だと、障害のときに負荷を増やしてサイト全体を止めることがある。</>,
        basis: <><ChapterLink n={91} section="apply" />、<ChapterLink n={91} section="overuse" /></>,
      },
      criterion: {
        text: <>失敗の原因はアプリの中の誤りか、外部のサービスの障害か。その機能がなくてもページの目的を果たせるか。受け取る例外のクラスを外部のサービスの失敗に絞れるか、代わりの表示ごとにテストを書けるか、代わりの表示が使われた回数を数えられるか。</>,
        basis: <ChapterLink n={91} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Graceful Degradation（段階的機能低下）は、一部の機能が障害を起こしても、可能な範囲でサービスを続ける原則です。AWS Well-Architected Framework はハードな依存をソフトな依存に変えることとして、Google の SRE 本は過負荷のときに応答の質を下げることとして説明しています。</li>
          <li>タイムアウトのないおすすめ API の呼び出しは、障害のときに約60秒待ってから商品ページを 500 にし、その間 Puma のスレッドを使い続けて、おすすめ API を使わないカートのページまで待たせました。</li>
          <li>直すときは、ページの部分ごとに止めるか続けるかを決め、外部 API の呼び出しにタイムアウトを設定して失敗を1つの例外のクラスにまとめ、その例外だけを受け取って前回の結果か人気の商品で代え、失敗を Rails.error.report で報告しました。同じ条件で、商品ページは 0.54 秒で 200、カートは 0.55 秒で 200 になりました。</li>
          <li>代わりの表示はふだん動かない処理なので、タイムアウト・503・形式の違う応答・前回の結果のそれぞれを WebMock でテストし、アプリの中の誤りを代わりの表示で隠さないことも確かめます。</li>
          <li>何でも rescue すると、在庫で絞る変更の NoMethodError が空の一覧に置き換わり、テストも通りました。Rails.error.handle も、例外のクラスを省くと同じことが起きます。代わりの手段そのものが障害のときに負荷を増やして、障害を広げることもあります。</li>
          <li>止めるか続けるかは失敗の原因（アプリの中の誤りか、外部のサービスの障害か）と、機能の位置づけ（なければページの目的を果たせないか）で決めます。価格・在庫・決済は古い値で代えずにエラーを示します。</li>
          <li>Rails では Rails.error.handle・Rails.error.unexpected と、RedisCacheStore の失敗のときの動きを使えます。RedisCacheStore は例外を投げませんが、応答しない Redis では1回の操作に約2秒待つので、キャッシュのタイムアウトも決めておきます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'REL05-BP01 Implement graceful degradation to transform applicable hard dependencies into soft dependencies', publisher: 'AWS Well-Architected Framework（Reliability Pillar）', url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_mitigate_interaction_failure_graceful_degradation.html', accessed: '2026-11-22', note: 'ハードな依存をソフトな依存に変える項目であること。依存先が使えなくても部品は中心の機能を続け、少し古いデータ・別のデータ・データなしで応答してよいこと。EC サイトがおすすめ・売れ筋・注文の状況を別々のシステムから集める例。決済の処理なら一貫性、リアルタイムのアプリケーションなら可用性を優先する例。よくない例（中心の機能を決めていない、依存先の失敗のときに動くかをテストしていない、一部の結果を返せるのに何も返さない）。' },
    { title: 'Addressing Cascading Failures（Site Reliability Engineering 第22章）', publisher: 'Mike Ulrich / Google（sre.google）', url: 'https://sre.google/sre-book/addressing-cascading-failures/', accessed: '2026-11-22', note: 'Graceful degradation は load shedding をさらに進めて行う仕事の量を減らすもので、応答の質を下げて仕事や時間を減らすこと。検索のアプリケーションがメモリーのキャッシュにある一部のデータだけを検索したり、精度の低い順位付けを使ったりする例。' },
    { title: 'Graceful degradation', publisher: 'MDN Web Docs（Glossary）', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Graceful_degradation', accessed: '2026-11-22', note: '新しいブラウザーで最もよく動くサイトを作り、古いブラウザーでも体験は劣るが必要な内容と機能を届ける設計の考え方であること。Progressive Enhancement を関係のある逆の向きの方法として挙げていること。' },
    { title: 'Avoiding fallback in distributed systems', publisher: 'Jacob Gabrielson / Amazon Builders\' Library', url: 'https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/', accessed: '2026-11-22', note: '商品の情報を DB から読めないような重大な失敗を扱うこと、Amazon は fallback をほとんど使わないこと、fallback は試すのが難しく潜在的な誤りになりやすいこと。2001年ごろの配送の速さのキャッシュの例（キャッシュがほぼ同時に失敗して DB に問い合わせが集中し、サイト全体が止まった）。代わりの方法として、データを前もって送っておくこと。' },
    { title: 'Fail Fast（IEEE Software, Design 欄）', publisher: 'Jim Shore / IEEE Software（martinfowler.com に置かれた PDF）', url: 'https://www.martinfowler.com/ieeeSoftware/failFast.pdf', accessed: '2026-11-22', version: '2004年9・10月号', note: '問題を自動で回避するとエラーの後も動き続けて後で奇妙な形で失敗する（failing slowly）こと、設定ファイルの書き間違いの例。全体の例外ハンドラーで予期しない例外を開発者に知らせ、バッチなら次の処理に進むこと。全体のハンドラーを使うなら、ほかの場所で catch-all の例外ハンドラーを避け、既存のコードから探して取り除くか書き直すこと。' },
    { title: 'Release It! Second Edition: Design and Deploy Production-Ready Software', publisher: 'Michael T. Nygard / The Pragmatic Bookshelf', url: 'https://pragprog.com/titles/mnee2/release-it-second-edition/', accessed: '2026-11-22', version: '第2版（2018年1月）', note: '目次の Stability Patterns に Timeouts・Circuit Breaker・Bulkheads・Fail Fast・Shed Load などが並ぶこと。' },
    { title: 'Error Reporting in Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/error_reporting.html', accessed: '2026-11-22', version: 'Rails 8.1', note: '処理されなかった例外が購読者に自動で報告されること。購読者は report を持つオブジェクトで、Rails.error.subscribe で登録すること。handled と severity の意味。Rails.error.handle が例外を報告して受け取り、fallback の値を返すこと。Rails.error.unexpected が本番では報告して nil を返し、開発とテストでは別のクラスの例外で包んで投げること。購読者の例が source: nil と書いていること。' },
    { title: 'activesupport/lib/active_support/error_reporter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/error_reporter.rb#L29-L155`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'DEFAULT_RESCUE が StandardError で、handle と record は例外のクラスを省くとそれを受け取ること（29・80・116行目）。UnexpectedError が Exception のサブクラスであること（33行目）。handle が handled: true・既定の severity :warning で報告して fallback を呼ぶこと（79〜84行目）。record が handled: false・既定の :error で報告して投げ直すこと（115〜121行目）。unexpected が debug_mode なら UnexpectedError を投げ、そうでなければ報告すること（146〜155行目）。' },
    { title: 'railties/lib/rails/application/bootstrap.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/bootstrap.rb#L66-L72`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'config.consider_all_requests_local が true なら Rails.error.debug_mode を true にし、そうでなければ Rails.error.logger を設定すること。' },
    { title: 'activesupport/lib/active_support/cache/redis_cache_store.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/cache/redis_cache_store.rb#L31-L53`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'Redis が使えないときに例外を投げず、読み込みはすべてキャッシュにないものとし、書き込みは捨てること（31〜32行目）。接続・読み込み・書き込みのタイムアウトの既定が1秒であること（38〜42行目）。既定の error_handler がログに書き、ActiveSupport.error_reporter に severity: :warning、source: "redis_cache_store.active_support" で報告すること（44〜53行目）。failsafe が Redis のエラーを受け取って error_handler を呼び、既定の値を返すこと（490〜503行目）。' },
    { title: 'Caching with Rails: An Overview', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/caching_with_rails.html', accessed: '2026-11-22', version: 'Rails 8.1', note: 'Redis のキャッシュストアの読み書きは例外を投げず nil を返すこと、読み書きのタイムアウトの既定が1秒で、値を作り直すほうが1秒以上待つより速いことが多いのでタイムアウトを短めにすること、接続に失敗したときに既定で1回再接続すること、error_handler で失敗を報告できること。NullStore が値を保存しないこと。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/config/environments/test.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/environments/test.rb.tt#L22-L23`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '新しいアプリケーションのテストの環境で consider_all_requests_local を true にし、cache_store を :null_store にすること。' },
    { title: 'lib/faraday/adapter/net_http.rb', publisher: 'lostisland/faraday-net_http（GitHub）', url: 'https://github.com/lostisland/faraday-net_http/blob/v3.5.0/lib/faraday/adapter/net_http.rb#L44-L89', accessed: '2026-11-22', version: 'faraday-net_http 3.5.0（手元の gem で確認）', note: 'Net::OpenTimeout を NET_HTTP_EXCEPTIONS に入れて Faraday::ConnectionFailed に変え、ほかの Timeout::Error を Faraday::TimeoutError に変えること。' },
    { title: 'Request Options', publisher: 'Faraday Documentation（lostisland/faraday）', url: 'https://github.com/lostisland/faraday/blob/v2.15.1/docs/customization/request-options.md', accessed: '2026-11-22', version: 'Faraday 2.15.1', note: 'timeout が要求の完了まで、open_timeout が接続の確立までに待つ秒数の上限で、どちらも既定は nil（アダプターの既定の値）であること。接続のコンストラクターの request に渡せること。' },
    { title: 'lib/webmock/http_lib_adapters/net_http.rb', publisher: 'bblimke/webmock（GitHub）', url: 'https://github.com/bblimke/webmock/blob/v3.36.0/lib/webmock/http_lib_adapters/net_http.rb#L203-L205', accessed: '2026-11-22', version: 'WebMock 3.36.0（手元の gem で確認）', note: 'to_timeout の応答で Net::OpenTimeout を発生させること。' },
    { title: 'class Net::HTTP', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Net/HTTP.html', accessed: '2026-11-22', note: 'read_timeout の初期値が60秒であること。手元の net-http 0.10.0 の gem でも、open_timeout・read_timeout・write_timeout の既定が60であることを確かめた。' },
    { title: 'Pattern matching', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/pattern_matching_rdoc.html', accessed: '2026-11-22', note: 'ハッシュのパターンは記号（Symbol）のキーだけに対応すること。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-22', note: 'Value integrated systems：統合されたシステムを第一に考えること、メソッドの呼び出しはマイクロサービスの間の遠隔の呼び出しより単純で、分散すると失敗の状態・遅延・依存の更新の予定の問題が増えること、外から要求を受けるほうが外へ要求を送るより扱いやすいこと。' },
    { title: 'activesupport/lib/active_support/error_reporter.rb（Rails 7.2.0）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.0/activesupport/lib/active_support/error_reporter.rb#L145-L154', accessed: '2026-11-22', version: 'Rails 7.2.0（rubygems.org の gem で確認）', note: '7.2.0 に unexpected があり、7.1.0 の error_reporter.rb にはないこと。activesupport 7.2.0 の CHANGELOG に ErrorReporter#unexpected の追加があること。railties 7.2.0 の bootstrap.rb の69〜75行目で debug_mode を 8.1 と同じく決めること。redis_cache_store.rb の DEFAULT_ERROR_HANDLER と1秒のタイムアウトも 8.1 と同じであること。' },
    { title: 'activesupport/lib/active_support/error_reporter.rb（Rails 7.0.0）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.0.0/activesupport/lib/active_support/error_reporter.rb#L57-L115', accessed: '2026-11-22', version: 'Rails 7.0.0（rubygems.org の gem で確認）', note: 'handle と record が例外のクラスを1つだけ受け取ること、購読者の report に source: を渡さないこと。7.0.0 の cache/redis_cache_store.rb の50〜62行目で、接続のタイムアウトの既定が20秒、reconnect_attempts が0で、DEFAULT_ERROR_HANDLER がログに書くだけであること。' },
    { title: 'lib/faraday/error.rb', publisher: 'lostisland/faraday（GitHub）', url: 'https://github.com/lostisland/faraday/blob/v2.15.1/lib/faraday/error.rb#L6-L227', accessed: '2026-11-22', version: 'Faraday 2.15.1（手元の gem で確認）', note: 'Faraday::Error が StandardError のサブクラスで、ClientError・ServerError・TimeoutError（ServerError のサブクラス）・ConnectionFailed・SSLError・ParsingError がどれも Faraday::Error のサブクラスであること。' },
    { title: 'class Data', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Data.html', accessed: '2026-11-22', note: 'Data.define で作るクラスが書き込み用のメソッドを持たず、変更しない値を入れるためのものであること。Ruby 3.2 で入ったことは Ruby 3.2 の NEWS（https://docs.ruby-lang.org/en/4.0/NEWS/NEWS-3_2_0_md.html）で確認した。' },
  ],
}

export default chapter
