import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation01 } from '../explanations/ruby'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 1-4 本番構成と本書の章 ---------- */
function ArchitectureFigure() {
  return (
    <Svg
      id="1-4"
      w={620}
      h={566}
      label="本番構成の模式図。上から順に、ブラウザー、ALB（第28章）、Nginx（第27章）、Puma（第26章）、Rails アプリケーションが並ぶ。Rails アプリケーションの中は Rack ミドルウェア（第6章）、ルーティング（第9章）、コントローラー（第10章）、ActiveRecord（第3部）と ActionView（第20章）の順に処理が進む。ActiveRecord は MySQL に SQL を送る。右側では Rails が Redis にジョブを登録し、Sidekiq（第21章）がそれを取り出して実行し、MySQL にアクセスする"
    >
      <Box x={30} y={16} w={380} h={40} lines="ブラウザー（クライアント）" fill="bg" />
      <Arrow x1={220} y1={56} x2={220} y2={80} />
      <T x={230} y={68} fs={12} tone="muted">HTTPS</T>
      <Box x={30} y={80} w={380} h={44} lines={['ALB（ロードバランサー）', 'TLS を終端し、サーバーに振り分ける']} bold subTone="muted" />
      <T x={400} y={102} fs={12} anchor="end" tone="acc">第28章</T>
      <Arrow x1={220} y1={124} x2={220} y2={148} />
      <T x={230} y={136} fs={12} tone="muted">HTTP</T>
      <Box x={30} y={148} w={380} h={44} lines={['Nginx', '静的ファイルを返し、それ以外を Puma へ転送']} bold subTone="muted" />
      <T x={400} y={170} fs={12} anchor="end" tone="acc">第27章</T>
      <Arrow x1={220} y1={192} x2={220} y2={216} />
      <T x={230} y={204} fs={12} tone="muted">HTTP</T>
      <Box x={30} y={216} w={380} h={44} lines={['Puma', 'ワーカー（プロセス）× スレッドで実行']} bold subTone="muted" />
      <T x={400} y={238} fs={12} anchor="end" tone="acc">第26章</T>
      <Arrow x1={220} y1={260} x2={220} y2={284} />
      <T x={230} y={272} fs={12} tone="muted">Rack の呼び出し（call）</T>

      <rect x={30} y={284} width={380} height={202} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={46} y={300} bold>Rails アプリケーション</T>
      <T x={400} y={300} fs={12} anchor="end" tone="acc">第2〜4部</T>
      <Box x={50} y={316} w={340} h={28} lines="Rack ミドルウェア（第6章）" />
      <Arrow x1={220} y1={344} x2={220} y2={358} />
      <Box x={50} y={358} w={340} h={28} lines="ルーティング（第9章）" />
      <Arrow x1={220} y1={386} x2={220} y2={400} />
      <Box x={50} y={400} w={340} h={28} lines="コントローラー（第10章）" />
      <Arrow x1={132} y1={428} x2={132} y2={442} />
      <Arrow x1={307} y1={428} x2={307} y2={442} />
      <Box x={50} y={442} w={165} h={28} lines="ActiveRecord（第3部）" fs={12} />
      <Box x={225} y={442} w={165} h={28} lines="ActionView（第20章）" fs={12} />

      <Arrow x1={132} y1={470} x2={132} y2={510} />
      <T x={140} y={494} fs={12} tone="muted">SQL</T>
      <Box x={50} y={510} w={165} h={40} lines="MySQL" fill="box4" />

      <Arrow x1={410} y1={336} x2={460} y2={336} />
      <T x={435} y={324} fs={12} anchor="middle" tone="muted">登録</T>
      <Box x={460} y={316} w={140} h={40} lines="Redis" fill="box4" />
      <Arrow x1={530} y1={356} x2={530} y2={400} />
      <T x={538} y={378} fs={12} tone="muted">取り出し</T>
      <Box x={460} y={400} w={140} h={48} lines={['Sidekiq', '第21章']} bold subTone="acc" />
      <Arrow d="M530,448 V530 H217" />
      <T x={540} y={490} fs={12} tone="muted">SQL</T>
    </Svg>
  )
}

/* ---------- 図 1-5 Rails を構成する gem の依存関係 ---------- */
function GemDependencyFigure() {
  return (
    <Svg
      id="1-5"
      w={640}
      h={330}
      label="Rails 8.1.4.1 を構成する gem の実行時の依存関係。最上段に railties、actioncable、actionmailer、activestorage がある。railties と actioncable は actionpack に依存する。actionmailer は actionpack、actionview、activejob に依存する。activestorage は actionpack、activerecord、activejob に依存する。中段の actionpack は actionview に、activerecord は activemodel に依存する。最下段の activesupport には全 gem が依存する"
    >
      <Box x={20} y={20} w={135} h={40} lines="railties" mono />
      <Box x={172} y={20} w={135} h={40} lines="actioncable" mono />
      <Box x={324} y={20} w={135} h={40} lines="actionmailer" mono />
      <Box x={476} y={20} w={144} h={40} lines="activestorage" mono />

      <Box x={80} y={115} w={140} h={40} lines="actionpack" mono />
      <Box x={430} y={115} w={150} h={40} lines="activerecord" mono />

      <Box x={20} y={205} w={150} h={40} lines="actionview" mono />
      <Box x={245} y={205} w={150} h={40} lines="activejob" mono />
      <Box x={470} y={205} w={150} h={40} lines="activemodel" mono />

      <Box x={20} y={280} w={600} h={36} lines="activesupport（すべての gem が依存する。矢印は省略）" fill="box5" />

      <Arrow x1={87} y1={60} x2={120} y2={113} />
      <Arrow x1={239} y1={60} x2={182} y2={113} />
      <Arrow x1={350} y1={60} x2={214} y2={113} />
      <Arrow x1={372} y1={60} x2={166} y2={203} />
      <Arrow x1={398} y1={60} x2={322} y2={203} />
      <Arrow x1={540} y1={60} x2={520} y2={113} />
      <Arrow d="M490,60 C 410,70 405,170 362,203" />
      <Arrow d="M500,60 L 224,142" />
      <Arrow x1={120} y1={155} x2={100} y2={203} />
      <Arrow x1={505} y1={155} x2={540} y2={203} />
    </Svg>
  )
}

/* ---------- 図 1-6 process_action の super の連鎖 ---------- */
const processActionChain: [string, string][] = [
  ['ActiveRecord::Railties::ControllerRuntime', 'DB の処理時間の集計をリセット'],
  ['ActionController::ParamsWrapper', 'JSON などのパラメーターをラップ'],
  ['ActionController::Instrumentation', '計測イベントを発行'],
  ['ActionController::Rescue', '例外を rescue_from の処理へ渡す'],
  ['AbstractController::Callbacks', 'before_action などを実行'],
  ['ActionController::Rendering', 'リクエストのフォーマットを設定'],
  ['AbstractController::Base', 'アクションのメソッドを呼ぶ'],
]

function ProcessActionChainFigure() {
  const top = 16
  const step = 52
  return (
    <Svg
      id="1-6"
      w={640}
      h={top + step * processActionChain.length - 4}
      label={`ApplicationController#process_action を呼んだときに super でたどられる7つの定義。上から順に ${processActionChain.map(([m, r]) => `${m}（${r}）`).join('、')}`}
    >
      {processActionChain.map(([mod, role], i) => {
        const y = top + i * step
        return (
          <g key={mod}>
            <Box x={20} y={y} w={340} h={34} lines={mod} mono fs={12} fill={i === 6 ? 'box' : 'box2'} />
            <T x={376} y={y + 17} fs={12.5}>
              {role}
            </T>
            {i < processActionChain.length - 1 && (
              <>
                <Arrow x1={190} y1={y + 34} x2={190} y2={y + step} />
                <T x={200} y={y + 43} fs={11} tone="muted" mono>
                  super
                </T>
              </>
            )}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 1-7 本書の図の凡例 ---------- */
function LegendFigure() {
  return (
    <Svg
      id="1-7"
      w={600}
      h={250}
      label="本書の図の凡例。灰色の箱はクラス・プロセス・構成要素、橙の箱はモジュール、青の箱は特異クラス、緑の箱はデータ・外部のサービス、紫の箱は特に注目してほしい要素、破線の箱は省略したものや概念上の要素を表す。実線の矢印は処理や呼び出しの流れ、破線の矢印は参照や所属、太い青の矢印は図の中で注目する経路を表す"
    >
      <Box x={20} y={16} w={170} h={40} lines="クラス・プロセス" />
      <Box x={215} y={16} w={170} h={40} lines="モジュール" fill="box2" />
      <Box x={410} y={16} w={170} h={40} lines="特異クラス" fill="box3" />
      <Box x={20} y={72} w={170} h={40} lines="データ・外部のサービス" fill="box4" fs={12} />
      <Box x={215} y={72} w={170} h={40} lines="注目してほしい要素" fill="box5" />
      <Box x={410} y={72} w={170} h={40} lines="省略・概念上の要素" fill="bg" dashed />

      <Arrow x1={30} y1={150} x2={150} y2={150} />
      <T x={170} y={150}>処理・呼び出しの流れ</T>
      <Arrow x1={30} y1={186} x2={150} y2={186} dashed />
      <T x={170} y={186}>参照・所属（superclass、クラスへの参照など）</T>
      <Arrow x1={30} y1={222} x2={150} y2={222} accent />
      <T x={170} y={222}>図の中で注目する経路</T>
    </Svg>
  )
}

/* ---------- 図 1-1 HTTP の要求と応答 ---------- */
function HttpFigure() {
  return (
    <Svg
      id="1-1"
      w={780}
      h={330}
      label="ブラウザー（curl）がサーバーに要求を送り、サーバーが応答を返す。要求の1行目は GET /articles HTTP/1.1 で、メソッド・パス・HTTP のバージョンを並べたもの。続く行は Host・User-Agent・Accept のヘッダー。応答の1行目は状態行の HTTP/1.1 200 OK で、200 がステータスコード。続いて content-type と content-length のヘッダー、空行、HTML の本文が並ぶ"
    >
      <Box x={20} y={128} w={120} h={60} lines={['ブラウザー', '（curl）']} fs={12} subTone="muted" />
      <Box x={640} y={128} w={120} h={60} lines={['サーバー', '（Puma と Rails）']} fs={12} subTone="muted" />

      <T x={160} y={18} bold fs={12}>
        要求（リクエスト）
      </T>
      <Box x={160} y={30} w={460} h={84} lines={['GET /articles HTTP/1.1', 'Host: 127.0.0.1:3300', 'User-Agent: curl/8.23.0', 'Accept: */*']} mono fs={12} align="start" fill="bg" />
      <T x={400} y={47} fs={11} tone="muted">
        メソッド・パス・HTTP のバージョン
      </T>
      <T x={400} y={80} fs={11} tone="muted">
        ヘッダー（名前: 値）
      </T>

      <Arrow x1={142} y1={146} x2={638} y2={146} />
      <T x={390} y={138} fs={11} anchor="middle" tone="muted">
        要求を送る
      </T>
      <Arrow x1={638} y1={172} x2={142} y2={172} />
      <T x={390} y={186} fs={11} anchor="middle" tone="muted">
        応答を返す
      </T>

      <T x={160} y={210} bold fs={12}>
        応答（レスポンス）
      </T>
      <Box
        x={160}
        y={220}
        w={460}
        h={100}
        lines={['HTTP/1.1 200 OK', 'content-type: text/html; charset=utf-8', 'content-length: 2532', '', '<!DOCTYPE html><html> … </html>']}
        mono
        fs={12}
        align="start"
        fill="bg"
      />
      <T x={470} y={236} fs={11} tone="muted">
        状態行（ステータスコード 200）
      </T>
      <T x={470} y={262} fs={11} tone="muted">
        ヘッダー
      </T>
      <T x={470} y={287} fs={11} tone="muted">
        空行
      </T>
      <T x={470} y={304} fs={11} tone="muted">
        本文（HTML）
      </T>
    </Svg>
  )
}

/* ---------- 図 1-2 モデルとテーブル ---------- */
const tableCols: { name: string; value: string; w: number }[] = [
  { name: 'id', value: '1', w: 40 },
  { name: 'title', value: 'はじめての記事', w: 130 },
  { name: 'body', value: '本文', w: 60 },
  { name: 'created_at', value: '2026-11-16 07:03…', w: 140 },
]

function ModelTableFigure() {
  const x0 = 390
  return (
    <Svg
      id="1-2"
      w={780}
      h={250}
      label="app/models/article.rb の Article クラスは、クラス名を複数形にした articles テーブルに対応する。テーブルの列は id・title・body・created_at など。Article.create! でテーブルに1行が加わり、その行の値を持つ Article のインスタンスが返る。テーブルの1行が、Article の1つのインスタンスに対応する"
    >
      <Box x={20} y={40} w={290} h={60} lines={['Article（クラス）', 'app/models/article.rb']} fs={12} subTone="muted" />
      <Box x={20} y={150} w={290} h={60} lines={['Article のインスタンス', 'id: 1, title: "はじめての記事" …']} fs={12} fill="box5" subTone="muted" />

      <T x={x0} y={24} bold fs={12}>
        articles テーブル
      </T>
      {tableCols.map((c, i) => {
        const x = x0 + tableCols.slice(0, i).reduce((s, d) => s + d.w, 0)
        return (
          <g key={c.name}>
            <Box x={x} y={40} w={c.w} h={30} lines={c.name} mono fs={11.5} fill="box4" rx={0} />
            <Box x={x} y={70} w={c.w} h={30} lines={c.value} fs={11.5} fill="bg" rx={0} />
          </g>
        )
      })}
      <T x={x0} y={122} fs={11.5}>
        列（カラム）：id・title・body・created_at・updated_at
      </T>
      <T x={x0} y={144} fs={11.5}>
        行：1件の記事のデータ
      </T>

      <Arrow x1={310} y1={62} x2={388} y2={55} dashed />
      <T x={349} y={46} fs={10.5} anchor="middle" tone="muted">
        複数形
      </T>
      <Arrow x1={310} y1={180} x2={388} y2={88} both />
      <T x={356} y={168} fs={10.5} tone="muted">
        1行が1つの
      </T>
      <T x={356} y={184} fs={10.5} tone="muted">
        インスタンス
      </T>
      <T x={20} y={236} fs={11} tone="muted">
        Article.create!(title: "はじめての記事", body: "本文") でテーブルに行が1つ加わり、その行の値を持つインスタンスが返る
      </T>
    </Svg>
  )
}

/* ---------- 図 1-3 1つの要求を処理する順番 ---------- */
function RequestFlowFigure() {
  return (
    <Svg
      id="1-3"
      w={780}
      h={390}
      label="GET /articles の要求を処理する順番。ブラウザーの要求を Puma が受け取って Rails に渡す。1. ルーティング（config/routes.rb）が articles#index に決める。2. コントローラー ArticlesController#index が Article.order(:id).limit(3) で条件を作り、@articles に入れる。この時点では SQL を実行しない。3. ビュー articles/index.html.erb が記事を1件ずつ表示する。4. そのときモデル Article が SQL を MySQL の articles テーブルに送り、記事を取り出す。5. ステータスコード 200 と HTML の応答がブラウザーに返る"
    >
      <Box x={20} y={30} w={100} h={56} lines={['ブラウザー', '（curl）']} fs={12} subTone="muted" />
      <Box x={160} y={30} w={100} h={56} lines={['Puma', '要求を受け取る']} fs={12} subTone="muted" />
      <Box x={290} y={30} w={170} h={56} lines={['1. ルーティング', 'config/routes.rb']} fs={12} subTone="muted" />
      <Box x={540} y={30} w={220} h={56} lines={['2. コントローラー', 'ArticlesController#index']} fs={12} fill="box5" subTone="muted" />
      <Box x={540} y={170} w={220} h={56} lines={['3. ビュー', 'articles/index.html.erb']} fs={12} fill="box5" subTone="muted" />
      <Box x={290} y={170} w={170} h={56} lines={['4. モデル', 'Article']} fs={12} fill="box5" subTone="muted" />
      <Box x={290} y={290} w={170} h={50} lines={['MySQL', 'articles テーブル']} fs={12} fill="box4" subTone="muted" />

      <Arrow x1={120} y1={58} x2={158} y2={58} />
      <Arrow x1={260} y1={58} x2={288} y2={58} />
      <Arrow x1={460} y1={58} x2={538} y2={58} />
      <T x={500} y={48} fs={10.5} anchor="middle" tone="muted" mono>
        index
      </T>

      <Arrow x1={650} y1={86} x2={650} y2={168} />
      <T x={658} y={128} fs={10.5} tone="muted">
        @articles を渡す
      </T>
      <Arrow x1={570} y1={86} x2={440} y2={168} dashed />
      <T x={488} y={112} fs={10.5} anchor="end" tone="muted">
        条件を作る
      </T>
      <T x={488} y={128} fs={10.5} anchor="end" tone="muted">
        （SQL はまだ実行しない）
      </T>
      <Arrow x1={540} y1={198} x2={462} y2={198} />
      <T x={500} y={188} fs={10.5} anchor="middle" tone="muted">
        記事を取り出す
      </T>
      <Arrow x1={375} y1={226} x2={375} y2={288} />
      <T x={383} y={258} fs={10.5} tone="muted">
        SQL を実行
      </T>

      <Arrow d="M650,226 V368 H70 V88" accent />
      <T x={180} y={356} fs={11} anchor="middle" tone="acc">
        5. 応答（200 OK と HTML）
      </T>
    </Svg>
  )
}

/* ---------- GET /articles のログの行と、処理の始まりと終わり ---------- */
const logRows: { text: string; depth: number; note?: string; muted?: boolean }[] = [
  { text: 'Started GET "/articles" for 172.29.0.1 …', depth: 0, note: '要求を受け取った', muted: true },
  { text: 'Processing by ArticlesController#index as */*', depth: 1, note: 'アクションの実行から応答まで（7ms）' },
  { text: 'Rendering layout layouts/application.html.erb', depth: 2, note: 'レイアウトの描画（4.4ms）' },
  { text: 'Rendering articles/index.html.erb within …', depth: 3, note: 'index.html.erb の描画（3.1ms）' },
  { text: 'Article Load (0.5ms) SELECT … LIMIT 3 …', depth: 4, note: 'SQL の実行（0.5ms）' },
  { text: '↳ app/views/articles/index.html.erb:3', depth: 4, note: 'SQL を実行させたファイルと行', muted: true },
  { text: 'Rendered collection of …/_article.html.erb [3 times] …', depth: 4, note: '_article.html.erb を3回使った（0.2ms）' },
  { text: 'Rendered articles/index.html.erb within … (Duration: 3.1ms …)', depth: 3 },
  { text: 'Rendered layout layouts/application.html.erb (Duration: 4.4ms …)', depth: 2 },
  { text: 'Completed 200 OK in 7ms (Views: 5.0ms | ActiveRecord: 0.5ms …)', depth: 1 },
]

function LogNestingFigure() {
  const y = (i: number) => 22 + i * 26
  const x = (depth: number) => 16 + depth * 14
  const right = (depth: number) => 778 - depth * 14
  // [始まりの行, 終わりの行, 深さ]
  const frames: [number, number, number][] = [
    [1, 9, 1],
    [2, 8, 2],
    [3, 7, 3],
  ]
  return (
    <Svg
      id="ch01-log-nesting"
      w={780}
      h={280}
      label="GET /articles のログの10行を、出力された順に上から並べた図。Processing の行から Completed の行までが、アクションの実行から応答までの枠で、7ms。その内側の Rendering layout の行から Rendered layout の行までがレイアウトの描画の枠で、4.4ms。さらに内側の Rendering articles/index.html.erb の行から Rendered articles/index.html.erb の行までが index.html.erb の描画の枠で、3.1ms。その中で、Article Load の SQL（0.5ms）と、SQL を実行させたファイルと行を示す ↳ の行が出力され、続いて _article.html.erb を3回使った Rendered collection の行（0.2ms）が出力される"
    >
      {frames.map(([from, to, depth]) => (
        <Box key={depth} x={x(depth) - 14} y={y(from) - 11} w={right(depth) - x(depth) + 14} h={y(to) - y(from) + 22} fill="bg" />
      ))}
      <Box x={x(4) - 14} y={y(4) - 11} w={right(4) - x(4) + 14} h={y(5) - y(4) + 22} fill="box5" />
      {logRows.map((r, i) => (
        <g key={r.text}>
          <T x={x(r.depth) - 4} y={y(i)} fs={11.5} mono>
            {r.text}
          </T>
          {r.note && (
            <T x={right(r.depth) - 12} y={y(i)} fs={12} anchor="end" tone={r.muted ? 'muted' : undefined}>
              {r.note}
            </T>
          )}
        </g>
      ))}
    </Svg>
  )
}

/* ---------- has_many :comments から comments の定義ができるまで ---------- */
function HasManyDefinitionFigure() {
  return (
    <Svg
      id="ch01-has-many-comments"
      w={780}
      h={356}
      label="has_many :comments の1行から comments の定義ができるまでの図。左上の app/models/article.rb の has_many :comments が、ActiveRecord::Associations::ClassMethods の has_many（associations.rb の1427行）を呼ぶ。has_many は Builder::HasMany.build を呼び、build は define_readers を呼ぶ。define_readers には mixin として Article::GeneratedAssociationMethods、name として :comments が渡る。define_readers は class_eval で def comments を実行し、Article::GeneratedAssociationMethods の中に comments（association.rb の104行として記録）ができる。左下の article.comments は、この comments を呼ぶ"
    >
      <Box x={20} y={28} w={230} h={56} lines={['app/models/article.rb', 'has_many :comments']} mono fs={12} fill="bg" />
      <Arrow x1={250} y1={56} x2={318} y2={56} />
      <T x={284} y={44} fs={11.5} anchor="middle" tone="muted">
        呼ぶ
      </T>
      <Box x={320} y={28} w={440} h={56} lines={['ActiveRecord::Associations::ClassMethods', 'has_many（associations.rb:1427）']} mono fs={12} fill="box2" />

      <Arrow x1={540} y1={84} x2={540} y2={110} />
      <Box x={320} y={110} w={440} h={36} lines="Builder::HasMany.build" mono fs={12} />
      <Arrow x1={540} y1={146} x2={540} y2={172} />
      <Box
        x={320}
        y={172}
        w={440}
        h={74}
        lines={['define_readers(mixin, name)  association.rb:102', 'mixin = Article::GeneratedAssociationMethods', 'name  = :comments']}
        mono
        fs={12}
        align="start"
      />

      <Arrow x1={540} y1={246} x2={540} y2={284} accent />
      <T x={552} y={265} fs={11.5} tone="acc">
        class_eval で def comments を実行
      </T>
      <Box x={320} y={286} w={440} h={56} lines={['Article::GeneratedAssociationMethods', 'comments（association.rb:104）']} mono fs={12} fill="box2" />

      <Box x={20} y={294} w={230} h={40} lines="article.comments" mono fs={12} fill="bg" />
      <Arrow x1={250} y1={314} x2={318} y2={314} />
      <T x={284} y={302} fs={11.5} anchor="middle" tone="muted">
        呼ぶ
      </T>
    </Svg>
  )
}

const ch01: Chapter = {
  number: 1,
  part: 1,
  title: '全体像とソースコードの調べ方',
  summary:
    'ブラウザーで記事の一覧を開くと、Rails のどのファイルが動くのでしょうか。画面に届く応答と Rails のログを見比べ、最後に、呼ばれたメソッドの定義をソースコードから探します。',
  goals: [
    '記事の一覧を開いたときの要求と応答を curl の出力から読み取れる',
    'URL から画面ができるまでに、どのファイルが記事を探し、どのファイルが HTML を作るかを追える',
    'アプリで使っている gem のバージョンを調べ、実際に呼ばれたメソッドの定義を開ける',
  ],
  prerequisites: [],
  sections: [
    {
      id: 'http',
      title: 'HTTP の要求と応答',
      body: (
        <>
          <p>
            ブラウザーのアドレス欄に URL を入力すると、ブラウザーはその URL が示すサーバーに<Term en="request">要求</Term>を送り、サーバーが返した<Term en="response">応答</Term>
            を画面に表示します。サーバーはネットワークを通じて届いた要求を受け取って応答を返すプログラムで、そのプログラムが動いているコンピューターもサーバーと呼びます。要求と応答の書き方を決めた規則が{' '}
            <Term en="Hypertext Transfer Protocol">HTTP</Term>です
            <Ref n={13} />。要求はリクエスト、応答はレスポンスとも呼び、本書でも両方の呼び方を使います。
          </p>
          <p>
            この章では、記事一覧を開いたときの通信記録を読みます。例の <code>http://127.0.0.1:3300/articles</code> は、記録に使ったデモアプリの URL です。
            まずこの節で、何を要求し、何が返ったかを確かめます。その結果を <ChapterLink n={1} section="request-flow">「1つの要求を処理する順番」</ChapterLink> のログと見比べると、表示された記事をどのコードが用意したかが分かります。URL を分けてみましょう。
          </p>
          <ul>
            <li>
              <code>http</code>：使う規則です。
            </li>
            <li>
              <code>127.0.0.1</code>：要求を送る先のコンピューターのアドレスです。127.0.0.1 は要求を送るコンピューター自身を表します。
            </li>
            <li>
              <code>3300</code>：ポート番号です。1台のコンピューターで動く複数のプログラムのうち、どれに要求を届けるかを番号で区別します。デモでは、3300 番に届いた要求が Rails のアプリケーションに渡るようにしています。
            </li>
            <li>
              <code>/articles</code>：パスです。サーバーの中のどのページを求めるかを表します。
            </li>
          </ul>
          <p>
            ブラウザーの代わりに curl というコマンドを使うと、送った要求と返ってきた応答を文字のまま見られます。<code>-v</code> を付けると、送った要求を <code>&gt;</code> で始まる行に、受け取った応答の先頭を{' '}
            <code>&lt;</code> で始まる行に表示します。
          </p>
          <Code
            lang="text"
            title="curl -v http://127.0.0.1:3300/articles の出力（一部を省略）"
            code={`
> GET /articles HTTP/1.1
> Host: 127.0.0.1:3300
> User-Agent: curl/8.23.0
> Accept: */*
>
< HTTP/1.1 200 OK
< content-type: text/html; charset=utf-8
< x-runtime: 0.009266
< content-length: 2532
<
`}
          />
          <p>
            要求の1行目の <code>GET /articles HTTP/1.1</code> は、メソッド（GET）、パス（/articles）、HTTP のバージョンを並べたものです。2行目からは<Term en="header">ヘッダー</Term>
            で、要求についての情報を「名前: 値」の形で1行に1つずつ書きます。Host は送り先のアドレスとポート番号、User-Agent は要求を送ったプログラム、Accept は受け取れるデータの種類です（<code>*/*</code>{' '}
            はどの種類でもよいという意味です）。ヘッダーの終わりは空行で示します
            <Ref n={14} />。
          </p>
          <p>
            応答の1行目の <code>HTTP/1.1 200 OK</code> は状態行で、200 が<Term en="status code">ステータスコード</Term>です。ステータスコードは要求をどう処理したかを表す3桁の数で、200 は要求が成功したことを表します。続くヘッダーの
            content-type は本文が HTML であること、x-runtime は Rails が応答を作るのにかかった秒数、content-length は本文の長さが 2532 バイトであることを表します。空行の後に本文が続きます（図 1-1）。
          </p>
          <Figure n="1-1" title="HTTP の要求と応答" caption="curl -v の出力をもとにした模式図。ヘッダーの一部と本文の中身は省略しています。Puma は要求を受け取って Rails に渡すプログラムで、「1つの要求を処理する順番」の節で説明します。">
            <HttpFigure />
          </Figure>
          <Code
            lang="html"
            title="応答の本文のうち body の部分（curl http://127.0.0.1:3300/articles の出力の一部）"
            code={`
  <body>
    <!-- BEGIN app/views/articles/index.html.erb
--><ul>
  <!-- BEGIN app/views/articles/_article.html.erb
--><li id="article_1">0: 変更後のタイトル</li>
<!-- END app/views/articles/_article.html.erb --><!-- BEGIN app/views/articles/_article.html.erb
--><li id="article_2">1: タイトル2改</li>
<!-- END app/views/articles/_article.html.erb --><!-- BEGIN app/views/articles/_article.html.erb
--><li id="article_3">2: 記事3</li>
<!-- END app/views/articles/_article.html.erb -->
</ul>
<!-- END app/views/articles/index.html.erb -->
  </body>
`}
          />
          <p>
            <Term en="HyperText Markup Language">HTML</Term>は、ページの内容を <code>&lt;ul&gt;</code>（箇条書き）や <code>&lt;li&gt;</code>（その1項目）のようなタグで区切って書く形式です。ブラウザーは受け取った
            HTML を読んで、箇条書きなどの形で画面に表示します。<code>&lt;!--</code> と <code>--&gt;</code> で囲んだ部分は HTML のコメントで、画面には表示されません。このコメントは開発環境の Rails が書き込んだもので、どのファイルから作った部分かを示しています。「1つの要求を処理する順番」の節で、このファイルの中身を見ます。
          </p>
          <h3>ステータスコード</h3>
          <p>存在しないパスを要求すると、ステータスコード 404 が返りました。</p>
          <Code
            lang="text"
            title="curl -i http://127.0.0.1:3300/no_such_page の出力（一部を省略）"
            code={`
HTTP/1.1 404 Not Found
content-type: text/html; charset=UTF-8
`}
          />
          <p>
            ステータスコードは先頭の数字で大まかな意味が決まっていて、200番台は成功、300番台は別の URL を示すもの、400番台は要求の側の誤り、500番台はサーバーの側のエラーを表します
            <Ref n={15} />。Rails のアプリケーションでよく見るものを次の表に示します。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ステータスコード</th>
                  <th>意味</th>
                  <th>返る場面の例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>200 OK</td>
                  <td>要求が成功した</td>
                  <td>記事の一覧を返した</td>
                </tr>
                <tr>
                  <td>302 Found</td>
                  <td>別の URL を開き直すよう指示する（リダイレクト）</td>
                  <td>コメントを保存した後、記事のページに移る</td>
                </tr>
                <tr>
                  <td>404 Not Found</td>
                  <td>求められたものが見つからない</td>
                  <td>存在しないパスを要求された</td>
                </tr>
                <tr>
                  <td>422 Unprocessable Content</td>
                  <td>送られた内容を処理できない</td>
                  <td>入力に誤りがあり、保存できなかった</td>
                </tr>
                <tr>
                  <td>500 Internal Server Error</td>
                  <td>サーバーの中でエラーが起きた</td>
                  <td>アプリケーションのコードでエラーが起きた</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>GET と POST</h3>
          <p>
            メソッドは要求で何をしたいかを表します。よく使うのは GET と POST です。GET はページなどを取り出す要求で、アドレス欄に URL を入力したときやリンクを押したときにブラウザーが送ります。POST
            はフォームに入力した内容などを要求の本文に入れてサーバーに送り、保存などの処理をさせる要求です
            <Ref n={15} />。デモのコメントの作成ページ（/articles/1/comments/new）が返す HTML には、次のフォームがあります。
          </p>
          <Code
            lang="html"
            title="GET /articles/1/comments/new の応答の本文（一部を省略）"
            code={`
<form action="/articles/1/comments" accept-charset="UTF-8" method="post">
  <input type="text" name="comment[body]" id="comment_body" />
  <input type="submit" name="commit" value="送信" data-disable-with="送信" />
</form>
`}
          />
          <p>
            <code>method="post"</code> と <code>action="/articles/1/comments"</code> は、送信ボタンを押したときに POST /articles/1/comments の要求を送ることを表し、入力欄の文字は{' '}
            <code>comment[body]=入力した文字</code> の形で要求の本文に入ります。curl でも <code>--data-urlencode</code> で本文を付けると、POST の要求を送れます。次の例の /probe/strong
            は、第10章の検証用にデモに用意した URL で、受け取ったタイトルを文字で返します。
          </p>
          <Code
            lang="text"
            title={'curl -v --data-urlencode "article[title]=はじめての記事" http://127.0.0.1:3300/probe/strong の出力（一部を省略）'}
            code={`
> POST /probe/strong HTTP/1.1
> Host: 127.0.0.1:3300
> User-Agent: curl/8.23.0
> Accept: */*
> Content-Length: 78
> Content-Type: application/x-www-form-urlencoded
>
< HTTP/1.1 200 OK
< content-type: text/plain; charset=utf-8
< content-length: 27
<
title=はじめての記事
`}
          />
          <p>
            要求のヘッダーの Content-Type は、本文がフォームと同じ「名前=値」の形式であることを表します。サーバーは本文から article[title] の値を取り出し、応答の本文で返しました。Rails
            のアプリケーションは届いた要求のメソッドとパスに応じた処理をして、ステータスコード・ヘッダー・本文からなる応答の内容を作ります。次の節では、Rails がそのためにどんな部品を用意しているかを、新しいアプリケーションを作って確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'rails-new',
      title: 'rails new で作るアプリケーション',
      body: (
        <>
          <p>
            要求を受け取って応答を返すプログラムは、Ruby だけでも書けます。ただしその場合は、要求の1行目からメソッドとパスを読み取る処理、パスごとに処理を分ける処理、データベースから記事を読み出す処理、HTML
            を組み立てる処理などを、すべて自分で書くことになります。Rails はこれらの処理を Ruby で書いて用意したライブラリ（ほかのプログラムから使うために作られたプログラム）の集まりです。Rails
            を使う開発者は、決められたディレクトリに決められた名前でファイルを置き、どの記事を表示するか、何を保存するかといった、そのアプリケーションに固有の処理だけを書きます。要求を受け取ってから応答を返すまでの処理の流れは
            Rails の中に書かれていて、その途中で開発者が書いたコードを呼び出します。このように、処理の流れを用意して、その途中で開発者のコードを呼び出すライブラリを<Term en="framework">フレームワーク</Term>と呼びます
            <Ref n={16} />。
          </p>
          <p>
            Rails のアプリケーションは <code>rails new</code> コマンドで作ります。<code>rails new blog</code> を実行すると blog というディレクトリができ、その中にアプリケーションに必要なファイルが作られます。
          </p>
          <Code
            lang="text"
            title="rails new blog の出力（Rails 8.1.4.1。一部を省略）"
            code={`
      create  Gemfile
      ...
      create  app/controllers/application_controller.rb
      ...
      create  app/models/application_record.rb
      create  app/views/layouts/application.html.erb
      ...
      create  config/routes.rb
      ...
      create  config/database.yml
      ...
      create  test/test_helper.rb
      ...
         run  bundle install --quiet
`}
          />
          <Code
            lang="text"
            title="作られたディレクトリ（ls と ls app の出力）"
            code={`
$ ls
Dockerfile  Gemfile  Gemfile.lock  README.md  Rakefile  app  bin  config  config.ru
db  lib  log  public  script  storage  test  tmp  vendor
$ ls app
assets  controllers  helpers  javascript  jobs  mailers  models  views
`}
          />
          <p>このうち、本書で多く扱う場所と、そこに置くものを次の表に示します。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>場所</th>
                  <th>置くもの</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>app/models</td>
                  <td>モデル：データベースのデータを読み書きするクラス</td>
                </tr>
                <tr>
                  <td>app/controllers</td>
                  <td>コントローラー：要求ごとの処理を書くクラス</td>
                </tr>
                <tr>
                  <td>app/views</td>
                  <td>ビュー：応答の HTML を作るためのテンプレート</td>
                </tr>
                <tr>
                  <td>app/jobs、app/mailers</td>
                  <td>後で実行する処理（ジョブ）、メールを送る処理</td>
                </tr>
                <tr>
                  <td>app/assets、app/javascript</td>
                  <td>CSS・画像・JavaScript のファイル</td>
                </tr>
                <tr>
                  <td>config/routes.rb</td>
                  <td>どの URL の要求でどのコントローラーを呼ぶか（ルーティング）</td>
                </tr>
                <tr>
                  <td>config/database.yml</td>
                  <td>接続するデータベースの設定</td>
                </tr>
                <tr>
                  <td>db</td>
                  <td>データベースの構造を表すファイル（schema.rb）と、構造を変える手順のファイル（db/migrate）</td>
                </tr>
                <tr>
                  <td>test</td>
                  <td>テストのコード</td>
                </tr>
                <tr>
                  <td>Gemfile、Gemfile.lock</td>
                  <td>アプリケーションで使う gem（Ruby のライブラリ）とそのバージョン</td>
                </tr>
                <tr>
                  <td>bin/rails</td>
                  <td>サーバーの起動などに使う rails コマンド</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            モデル・コントローラー・ビューがどう分担して1つの要求を処理するかは、次の節で確かめます。ここでは、モデルとデータベースの関係を見ておきます。
          </p>
          <h3>データベースとマイグレーション</h3>
          <p>
            <Term en="database">データベース</Term>は、データを保存し、条件を指定して取り出せるようにするソフトウェアです。データは表の形で保存し、表を<Term en="table">テーブル</Term>
            、表の横の1行を行（レコード）、縦の1列を列（カラム）と呼びます。rails new で作ったアプリケーションは既定では SQLite（データを1つのファイルに保存するデータベース）を使い、本書のデモのアプリケーションは
            MySQL を使っています。
          </p>
          <p>
            モデルとテーブルは <code>bin/rails generate model</code> で作れます。generate は決まった形のファイルをまとめて作るコマンド（ジェネレーター）です。記事を表す Article
            モデルを、タイトル（title、短い文字列）と本文（body、長い文字列）の列を持つように作りました。
          </p>
          <Code
            lang="text"
            title="bin/rails generate model Article title:string body:text の出力"
            code={`
      invoke  active_record
      create    db/migrate/20261116070332_create_articles.rb
      create    app/models/article.rb
      invoke    test_unit
      create      test/models/article_test.rb
      create      test/fixtures/articles.yml
`}
          />
          <Code
            lang="ruby"
            title="db/migrate/20261116070332_create_articles.rb"
            code={`
class CreateArticles < ActiveRecord::Migration[8.1]
  def change
    create_table :articles do |t|
      t.string :title
      t.text :body

      t.timestamps
    end
  end
end
`}
          />
          <p>
            db/migrate に作られたファイルを<Term en="migration">マイグレーション</Term>と呼びます。テーブルを作る、列を加えるといった、データベースの構造の変更を Ruby で書いたものです。このファイルは articles
            というテーブルを作り、title と body の列を加えます。<code>t.timestamps</code> は行を作った日時（created_at）と更新した日時（updated_at）の列を加えます。id の列は書かなくても作られます
            <Ref n={19} />。1行目の <code>ActiveRecord::Migration[8.1]</code> の 8.1 は、このマイグレーションを作った Rails のバージョンです。
          </p>
          <Code
            lang="text"
            title="bin/rails db:migrate の出力"
            code={`
== 20261116070332 CreateArticles: migrating ===================================
-- create_table(:articles)
   -> 0.0043s
== 20261116070332 CreateArticles: migrated (0.0044s) ==========================
`}
          />
          <p>
            <code>bin/rails db:migrate</code> はまだ実行していないマイグレーションを実行して、データベースにテーブルを作ります（本番環境のデータベースを安全に変える方法は<ChapterLink n={27} />
            で扱います）。作られたモデルのファイルには、クラスの定義しかありません。
          </p>
          <Code
            lang="ruby"
            title="app/models/article.rb"
            code={`
class Article < ApplicationRecord
end
`}
          />
          <p>
            それでも Article を使ってテーブルに行を加えられます。<code>&lt; ApplicationRecord</code> は、Article が ApplicationRecord のメソッドを受け継ぐことを表します。ApplicationRecord は rails new が
            app/models/application_record.rb に作ったクラスで、Rails の <code>ActiveRecord::Base</code> というクラスを受け継いでいます。次の例で使う <code>create!</code> と <code>count</code>{' '}
            は、Article がそこから受け継いだメソッドです。<code>bin/rails runner</code> はアプリケーションを読み込んだ状態で、引数に渡した Ruby のコードを実行するコマンドです。
          </p>
          <Code
            lang="text"
            title="bin/rails runner で実行"
            code={`
$ bin/rails runner 'a = Article.create!(title: "はじめての記事", body: "本文"); p a; p Article.count'
#<Article id: 1, title: "はじめての記事", body: "本文", created_at: "2026-11-16 07:03:35.800197000 +0000", updated_at: "2026-11-16 07:03:35.800197000 +0000">
1
`}
          />
          <p>
            <code>Article.create!</code> は articles テーブルに行を1つ加え、その行の値を持つ Article のインスタンス（Article というクラスから作った、1件の記事のデータを持つ値。
            <ChapterLink n={2} />
            ）を返しました。<code>Article.count</code> はテーブルの行の数です。Rails はクラス名の Article を複数形にした articles をテーブル名として使い、テーブルの列を調べて、title
            や body と同じ名前で値を読み書きできるようにします。テーブルの1行は Article の1つのインスタンスとして扱います（図 1-2）
            <Ref n={18} />。
          </p>
          <Figure n="1-2" title="モデルとテーブル" caption="rails new で作ったアプリケーションでの実行結果をもとにした模式図。updated_at の列は省略しています。">
            <ModelTableFigure />
          </Figure>
          <p>
            rails new で作ったアプリケーションには、要求を処理する部品と、それぞれのコードを置く場所が最初から決まっています。次の節ではデモのアプリケーションで、1つの要求をこれらの部品がどの順に処理するかを確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'request-flow',
      title: '1つの要求を処理する順番',
      body: (
        <>
          <p>
            「HTTP の要求と応答」の節で curl から送った GET /articles を、デモのアプリケーションがどう処理したかを、関係するファイルとログ（アプリケーションが処理の内容を書き出した記録）で順に確かめます。デモのアプリケーションは開発用の設定（開発環境）で{' '}
            <code>bin/rails server</code> を実行して起動しています。このコマンドは Puma というプログラムを起動し、Puma がポートで要求を待って、届いた要求を Rails に渡します（
            <ChapterLink n={23} section="app-server" />）。
          </p>
          <h3>ルーティング</h3>
          <p>
            Rails は最初に、要求のメソッドとパスから、どのコントローラーのどのメソッドを呼ぶかを決めます。この仕組みを<Term en="routing">ルーティング</Term>と呼び、対応は config/routes.rb
            に書きます。デモの config/routes.rb の記事の部分は次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="config/routes.rb（一部を省略）"
            code={`
Rails.application.routes.draw do
  resources :articles, only: [:index, :show] do
    resources :comments, only: [:new, :create]
  end
  # ...（省略）
end
`}
          />
          <p>
            <code>bin/rails routes</code> で、routes.rb から作られた対応を一覧にできます（<code>-c articles</code> で ArticlesController の分に絞りました）。
          </p>
          <Code
            lang="text"
            title="bin/rails routes -c articles の出力（一部を省略）"
            code={`
         Prefix Verb URI Pattern                    Controller#Action
       articles GET  /articles(.:format)            articles#index
        article GET  /articles/:id(.:format)        articles#show
`}
          />
          <p>
            2行目は GET /articles の要求で ArticlesController の index メソッドを呼ぶことを表します（<code>articles#index</code> はこの組を短く書いたものです）。3行目の <code>:id</code>{' '}
            にはパスの一部が入り、GET /articles/1 なら id が 1 になります。<code>(.:format)</code> は /articles.json のように、末尾で応答の形式を指定してもよいことを表します。routes.rb の
            resources の1行から、記事の一覧（index）と1件の表示（show）の2つの対応ができています
            <Ref n={17} />。ルーティングは<ChapterLink n={9} />で扱います。
          </p>
          <h3>コントローラー</h3>
          <p>
            <Term en="controller">コントローラー</Term>は、要求ごとの処理をメソッドとして書くクラスです。ルーティングから呼ばれるメソッドを<Term en="action">アクション</Term>と呼びます。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/articles_controller.rb（一部を省略）"
            code={`
class ArticlesController < ApplicationController
  # ...（省略）

  def index
    @articles = Article.order(:id).limit(3)
  end

  def show
    @article = Article.find(params[:id])
  end
end
`}
          />
          <p>
            index は記事を id の順に並べて先頭の3件を取り出す条件を作り、<code>@articles</code> に入れます。<code>@</code> で始まる変数はインスタンス変数（
            <ChapterLink n={2} section="class-instance" />
            ）で、Rails はアクションの実行が終わった後、コントローラーのインスタンス変数をビューに渡します。show の <code>params[:id]</code>{' '}
            は、ルーティングでパスから取り出した id です。index も show も HTML を作るコードを書いていません。アクションが応答を指定しなかった場合、Rails は app/views/articles/index.html.erb
            のように、コントローラーとアクションの名前に対応するビューを使って応答を作ります
            <Ref n={20} />。コントローラーは<ChapterLink n={10} />で扱います。
          </p>
          <h3>モデルと SQL</h3>
          <p>
            <Term en="model">モデル</Term>は、データベースのテーブルを読み書きするクラスで、Article は articles テーブルに対応します（「rails new で作るアプリケーション」の節）。
            <code>Article.order(:id).limit(3)</code> は、データベースに送る命令を組み立てます。データベースに送る命令を書く言語を <Term en="Structured Query Language">SQL</Term>
            と呼びます。組み立てた SQL を <code>to_sql</code> で表示しました。
          </p>
          <Code
            lang="text"
            title="bin/rails runner で実行"
            code={`
$ bin/rails runner 'puts Article.order(:id).limit(3).to_sql'
SELECT \`articles\`.* FROM \`articles\` ORDER BY \`articles\`.\`id\` ASC LIMIT 3
`}
          />
          <p>
            SELECT は行を取り出す命令で、この SQL は「articles テーブルのすべての列を、id の小さい順に並べ、3行まで取り出す」という意味です。MySQL に、取り出す列を id・title・created_at
            に絞った同じ条件の SQL を送ると、次の3行が返りました。
          </p>
          <Code
            lang="text"
            title="MySQL で実行した結果"
            code={`
mysql> SELECT id, title, created_at FROM articles ORDER BY id LIMIT 3;
+----+--------------------------+----------------------------+
| id | title                    | created_at                 |
+----+--------------------------+----------------------------+
|  1 | 変更後のタイトル         | 2026-11-11 07:53:47.260464 |
|  2 | タイトル2改              | 2026-11-11 07:53:47.260464 |
|  3 | 記事3                    | 2026-11-11 07:53:47.260464 |
+----+--------------------------+----------------------------+
`}
          />
          <p>
            ただし、コントローラーで <code>Article.order(:id).limit(3)</code> を実行した時点では、SQL はまだデータベースに送られません。この式が返すのは SQL
            の条件を持ったオブジェクトで、記事のデータが必要になったとき（このアプリケーションではビューが記事を1件ずつ表示するとき）に SQL を実行します。この仕組みは
            <ChapterLink n={12} section="lazy" />で扱います。
          </p>
          <h3>ビュー</h3>
          <p>
            <Term en="view">ビュー</Term>は応答の HTML を作るためのテンプレートです。HTML の中に Ruby のコードを埋め込む ERB という形式で書き、<code>&lt;%= %&gt;</code> の中に書いた Ruby
            の式の結果がその位置に入ります。
          </p>
          <Code
            lang="erb"
            title="app/views/articles/index.html.erb"
            code={`
<ul>
  <%= render @articles %>
</ul>
`}
          />
          <Code
            lang="erb"
            title="app/views/articles/_article.html.erb"
            code={`
<li id="<%= dom_id(article) %>"><%= article_counter %>: <%= article.title %></li>
`}
          />
          <p>
            <code>render @articles</code> は @articles の記事を1件ずつ取り出し、そのたびに _article.html.erb を使って HTML を作ります。_article.html.erb の中では、取り出した記事が{' '}
            <code>article</code> に、何件目か（0から数える）が <code>article_counter</code> に入っています
            <Ref n={20} />。<code>dom_id(article)</code> は記事の id から <code>article_1</code> のような名前を作ります。こうして作った3つの <code>&lt;li&gt;</code>{' '}
            が「HTTP の要求と応答」の節で見た本文です。その外側の <code>&lt;html&gt;</code> や <code>&lt;head&gt;</code> の部分は、すべてのページで共通に使うレイアウト（app/views/layouts/application.html.erb）から作られます。ビューは
            <ChapterLink n={16} />で扱います。
          </p>
          <h3>ログで順番を確かめる</h3>
          <p>この要求を処理したときに、Rails が出力したログです。</p>
          <Code
            lang="text"
            title="bin/rails server の出力（GET /articles の1件分）"
            code={`
Started GET "/articles" for 172.29.0.1 at 2026-11-16 07:04:40 +0000
Processing by ArticlesController#index as */*
  Rendering layout layouts/application.html.erb
  Rendering articles/index.html.erb within layouts/application
  Article Load (0.5ms)  SELECT \`articles\`.* FROM \`articles\` ORDER BY \`articles\`.\`id\` ASC LIMIT 3 /*action='index',application='Demo',controller='articles'*/
  ↳ app/views/articles/index.html.erb:3
  Rendered collection of articles/_article.html.erb [3 times] (Duration: 0.2ms | GC: 0.0ms)
  Rendered articles/index.html.erb within layouts/application (Duration: 3.1ms | GC: 0.0ms)
  Rendered layout layouts/application.html.erb (Duration: 4.4ms | GC: 0.0ms)
Completed 200 OK in 7ms (Views: 5.0ms | ActiveRecord: 0.5ms (1 query, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            1行目の Started は要求を受け取ったこと、2行目の Processing by ArticlesController#index は、ルーティングで決まったアクションを実行し始めたことを表します。Rendering
            の行でビューの処理が始まり、その後の Article Load の行で SQL が実行されていて、次の <code>↳</code> の行から、その SQL を実行させたのがビューの index.html.erb
            だと分かります。Rendered collection の行は _article.html.erb を3回使ったこと、最後の Completed 200 OK in 7ms は、ステータスコード 200 の応答を 7 ミリ秒で作り終えたことを表します。
          </p>
          <p>
            次の図はこのログの行を出力された順に上から並べ、Processing の行から Completed の行までと、Rendering の行から同じファイル名の Rendered の行までを、それぞれ枠で囲んだものです。外側の枠から順に見ると、レイアウトの描画の中で
            index.html.erb の描画が進み、その途中で SQL が実行されたことが分かります。
          </p>
          <Figure
            title="GET /articles のログの行と、処理の始まりと終わり"
            caption="上の bin/rails server の出力をもとにした模式図。行の一部を … で省略し、行の字下げを枠の深さに合わせて変えています。右側の時間はログに出力された値で、枠の高さは時間に比例しません。"
          >
            <LogNestingFigure />
          </Figure>
          <p>ログのほかの部分は次のように読みます。</p>
          <ul>
            <li>
              1行目の Started の行は、Puma とルーティングの間で要求を処理するミドルウェアが出力しています。ミドルウェアは要求がルーティングに届く前と、応答が Puma
              に戻る前に通る処理です（<ChapterLink n={6} />）。
            </li>
            <li>
              1行目の <code>for 172.29.0.1</code> は、要求を送った側のアドレスです。デモのアプリケーションは Docker のコンテナ（ほかのプログラムから分けた実行環境）の中で動かしています。コンテナの外で実行した curl
              の要求は、コンテナの中の Rails にはこのアドレスから届きます。
            </li>
            <li>
              2行目の <code>as */*</code> は、要求された応答の形式です。curl は <code>Accept: */*</code> を送って形式を指定しなかったので、<code>*/*</code> と表示されました。ブラウザーで開いたときは{' '}
              <code>as HTML</code> と表示されます。
            </li>
            <li>
              SQL の末尾の <code>/* */</code> で囲んだ部分は SQL のコメントで、データベースは実行するときに読み飛ばします。開発環境の Rails が、この SQL を実行したコントローラー（articles）とアクション（index）を書き込んでいます（
              <ChapterLink n={22} section="notifications" />）。
            </li>
            <li>
              <code>↳</code> の行の末尾の 3 は行番号です。index.html.erb で <code>render @articles</code> があるのは2行目ですが、開発環境の Rails は「HTTP の要求と応答」の節で見た BEGIN
              のコメントを出力するコードを、テンプレートの先頭に1行足してから実行します。このため、行番号はファイルより1つ大きく表示されます。
            </li>
            <li>
              最後の行の <code>Views: 5.0ms</code> は HTML を作るのにかかった時間、<code>ActiveRecord: 0.5ms (1 query, 0 cached)</code> はデータベースの処理にかかった時間と、実行した SQL
              が1つだったことを表します。<code>0 cached</code> は前に実行した結果を使い回した SQL が無かったことを表します（<ChapterLink n={12} section="query-cache" />
              ）。GC は Ruby が使い終わったメモリーを回収する処理（ガベージコレクション）にかかった時間です。
            </li>
          </ul>
          <p>
            業務でページの表示が遅いと言われたときも、同じ順でログを読みます。Completed の行で Views と ActiveRecord のどちらに時間がかかっているかを見て、SQL の行の数と <code>↳</code>{' '}
            の行から、どのファイルのどの行が SQL を実行させたかを確かめます。
          </p>
          <Figure n="1-3" title="1つの要求を処理する順番" caption="デモのアプリケーション（開発環境）での GET /articles のログをもとにした模式図。Puma と Rails の間のミドルウェアは省略しています。">
            <RequestFlowFigure />
          </Figure>
          <p>
            ここまでの分担をまとめると、モデル（Article）がデータベースのデータを扱い、ビュー（index.html.erb）が HTML を作り、コントローラー（ArticlesController）が要求を受けてモデルを使い、結果をビューに渡します。この3つに分ける構成を、それぞれの頭文字を取って{' '}
            <Term en="Model-View-Controller">MVC</Term>と呼びます
            <Ref n={16} />（図 1-3）。
          </p>
          <p>
            それぞれの部品は名前で対応していて、routes.rb の <code>resources :articles</code> は ArticlesController に、ArticlesController の index は app/views/articles/index.html.erb に、Article
            モデルは articles テーブルに対応します。この名前の決まりに従っていれば、Rails は対応を設定ファイルに書かなくても部品を結び付けます。Rails のガイドはこの考え方を「設定より規約（Convention over
            Configuration）」と呼んでいます
            <Ref n={16} />。
          </p>
        </>
      ),
    },
    {
      id: 'features',
      title: 'Rails のその他の機能と本書の章',
      body: (
        <>
          <p>
            Rails はここまでに見たルーティング・コントローラー・モデル・ビューのほかにも、Web アプリケーションでよく必要になる機能を用意していて、rails new で作ったディレクトリの多くはそのためのものです。次の表に、主な機能が何のためにあるかと、本書で扱う章を示します
            <Ref n={21} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>機能</th>
                  <th>何のためにあるか</th>
                  <th>コードを置く場所</th>
                  <th>扱う章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ルーティング</td>
                  <td>要求のメソッドとパスから、呼ぶアクションを決める</td>
                  <td>config/routes.rb</td>
                  <td>
                    <ChapterLink n={9} />
                  </td>
                </tr>
                <tr>
                  <td>コントローラー（ActionController）</td>
                  <td>要求ごとの処理を書き、応答を決める</td>
                  <td>app/controllers</td>
                  <td>
                    <ChapterLink n={10} />
                  </td>
                </tr>
                <tr>
                  <td>モデル（ActiveRecord）</td>
                  <td>テーブルの行を読み書きする。保存の前に値を検査する（例：タイトルが空なら保存しない）</td>
                  <td>app/models</td>
                  <td>
                    <ChapterLink n={11} />〜<ChapterLink n={15} />
                  </td>
                </tr>
                <tr>
                  <td>マイグレーション</td>
                  <td>テーブルや列を作る・変える</td>
                  <td>db/migrate</td>
                  <td>
                    <ChapterLink n={27} />
                  </td>
                </tr>
                <tr>
                  <td>ビュー（ActionView）とアセット</td>
                  <td>応答の HTML を作る。CSS・JavaScript・画像（アセット）をブラウザーに渡す</td>
                  <td>app/views、app/assets、app/javascript</td>
                  <td>
                    <ChapterLink n={16} />
                  </td>
                </tr>
                <tr>
                  <td>ActiveJob</td>
                  <td>メールの送信のように時間のかかる処理を、応答を返した後に、Rails の Web サーバーとは別に動くプログラムで実行する</td>
                  <td>app/jobs</td>
                  <td>
                    <ChapterLink n={18} />
                  </td>
                </tr>
                <tr>
                  <td>ActionMailer・ActiveStorage</td>
                  <td>メールを送る。画像などのファイルを受け取って保存し、記事などに添付する</td>
                  <td>app/mailers、storage</td>
                  <td>
                    <ChapterLink n={19} />
                  </td>
                </tr>
                <tr>
                  <td>テスト</td>
                  <td>コードが期待どおりに動くかを確かめるコードを書いて実行する</td>
                  <td>test（本書のデモは RSpec を使い spec）</td>
                  <td>
                    <ChapterLink n={20} />
                  </td>
                </tr>
                <tr>
                  <td>セキュリティの機能</td>
                  <td>ほかのサイトから利用者のブラウザーにフォームを勝手に送らせる攻撃などを防ぐ</td>
                  <td>既定の設定で有効</td>
                  <td>
                    <ChapterLink n={21} />
                  </td>
                </tr>
                <tr>
                  <td>キャッシュ</td>
                  <td>一度作った結果を保存しておき、次の要求で使い回して速く応答する</td>
                  <td>config/environments など</td>
                  <td>
                    <ChapterLink n={22} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            このほか、要求がルーティングに届く前に通る処理（ミドルウェア）は<ChapterLink n={6} />、Rails の起動の手順は<ChapterLink n={7} />、app のクラスを読み込む仕組みは
            <ChapterLink n={8} />で扱います。
          </p>
          <p>
            ここまでは、開発用の環境で起動した Puma に、curl から直接要求を送りました。利用者が実際に使う環境（本番環境）では、URL を https で始め、ブラウザーとサーバーの間の通信を TLS
            という方式で暗号化します（HTTPS）
            <Ref n={22} />。多くの要求を処理するために、Puma の前に Nginx やロードバランサーを置き、Puma を動かすサーバーも複数にします。次の節では本番環境での構成要素と、それぞれを扱う章を示します。
          </p>
        </>
      ),
    },
    {
      id: 'scope',
      title: '本書が扱う構成要素',
      body: (
        <>
          <p>
            図 1-4 では、まず左側の「ブラウザー」から「コントローラー」まで矢印を下にたどってください。先ほどの記事一覧の要求が、本番ではどこを通って自分の書いたコードに届くかが分かります。
            続いて「コントローラー」から分かれる2本を見てください。一方で記事を読み、もう一方で画面を作ります。各部品の章番号は、その部品を詳しく調べたいときの参照先です。
          </p>
          <Figure n="1-4" title="本番構成と本書の章" caption="模式図。サーバーの台数、Puma のワーカー数、DB の構成は省略しています。">
            <ArchitectureFigure />
          </Figure>
          <p>図の上から順に、各要素の役割を簡単に説明します。</p>
          <ul>
            <li>
              <Term en="Application Load Balancer">ALB</Term>：AWS（Amazon が提供するクラウドサービス）のロードバランサーです。ブラウザーとの HTTPS 通信（TLS）をここで終わらせ、復号した（暗号を解いた）HTTP
              リクエストを複数のサーバーに振り分けます。図の「TLS を終端」は、暗号化した通信をここで終わらせることを指します。後ろのサーバーには、元のクライアントの IP アドレスや、元の通信が HTTPS だったことをヘッダーで伝えます（
              <ChapterLink n={25} />）。
            </li>
            <li>
              <Term>Nginx</Term>：各サーバーの前段で HTTP を受け取ります。画像や CSS などの静的ファイルは自分で返し、それ以外のリクエストを Puma に転送します。このように、受け取ったリクエストを後ろのサーバーに転送するサーバーを
              <Term en="reverse proxy">リバースプロキシ</Term>と呼びます（<ChapterLink n={24} />）。
            </li>
            <li>
              <Term>Puma</Term>：Ruby で書かれたアプリケーションサーバーです。HTTP リクエストを解析し、Rails アプリを Ruby のメソッド呼び出しとして実行します。複数のプロセス（ワーカー）と、各プロセス内の複数のスレッドで、同時に複数のリクエストを処理します（
              <ChapterLink n={23} />）。
            </li>
            <li>
              Rails アプリケーション：Puma から Rack という規約に従って呼び出されます。リクエストはまずミドルウェア（ルーティングの前後でリクエストとレスポンスを処理する部品。
              <ChapterLink n={6} />）の列を通り、ルーティングで行き先のコントローラーとアクションが決まり、コントローラーがモデル（ActiveRecord）とビュー（ActionView）を使ってレスポンスを作ります（第2部〜第4部）。
            </li>
            <li>MySQL：ActiveRecord が SQL を送るデータベースです（第3部）。</li>
            <li>
              Redis と Sidekiq：時間のかかる処理（メール送信など）をリクエストとは別に実行する仕組みです。Rails はジョブを Redis に登録し、別プロセスの Sidekiq が取り出して実行します（
              <ChapterLink n={18} />）。
            </li>
          </ul>
          <p>
            第1部ではこの構成の説明に入る前に Ruby のオブジェクトモデルを扱います。オブジェクトモデルは、オブジェクト・クラス・メソッドがどう結び付いていて、メソッドを呼んだときにどの定義が実行されるかという仕組みのことです。Rails
            の内部コードはモジュールの組み込み、特異クラス、ブロック、メタプログラミングといった Ruby
            の機能を多用しています。たとえば、モデルに書く <code>has_many :comments</code> は Ruby のメソッド呼び出しであり、その実行結果としてクラスにメソッドが追加されます。この仕組みを説明できるようにすることが第1部の目的です。
          </p>
          <p>
            オブジェクトとクラスは<ChapterLink n={2} />、モジュールと特異クラスは<ChapterLink n={3} />、ブロックは<ChapterLink n={4} />
            、メタプログラミング（プログラムの実行中にメソッドやクラスを作るコードを書くこと）は<ChapterLink n={5} />で説明します。<code>has_many :comments</code>{' '}
            が追加するメソッドは、この章の「メソッドの定義場所を調べる」の節で実際に確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'rails-way',
      title: "Rails の規約と設計思想",
      body: (
        <>
          <p>
            Rails は、ルーティング、DB 操作、ビュー、ジョブなどが一緒に動く形で提供されるフルスタックのフレームワークです。「1つの要求を処理する順番」の節の記事の例では、routes.rb・コントローラー・ビュー・モデル・テーブルが、名前の決まりに従うだけで結び付きました（設定より規約）。規約に従うと、開発者は名前の対応を設定に書かずに済み、アプリ固有の判断に集中できます。別の Rails アプリを読むときも、同じ決まりで部品の場所を探せます。<Ref n={23} />
          </p>
          <p>
            規約は変えられます。たとえば、既存の DB のテーブル名が blog_posts で、Article というモデルから読み書きしたいときは、モデルでテーブル名を指定します。
          </p>
          <Code
            lang="ruby"
            title="app/models/article.rb（テーブル名の規約を変える例）"
            code={`
class Article < ApplicationRecord
  # 既存の DB のテーブル名に合わせる
  self.table_name = "blog_posts"
end
`}
          />
          <p>
            規約を変えた所はクラス名からテーブル名を推測できなくなります。上のコメントのように理由と影響のある範囲を残しておくと、次に読む人が判断を追えます。
          </p>
          <p>
            Rails の設計の考え方を表す語には、設定より規約のほかに次の4つがあります。レビューの指摘や設計の相談でそのまま使われる語なので、記事の例に当てはめて意味を確かめます。Rails の考え方の全体は
            <ChapterLink n={31} section="doctrine" />で扱います。
          </p>
          <ul>
            <li>
              <Term en="Don't Repeat Yourself">DRY</Term> は、同じ仕様や事実の定義を一か所にする考え方です。列の種類は DB のスキーマ（テーブルと列の定義）から読み取れるので、モデルにも同じ一覧を書く必要がありません。「rails new
              で作るアプリケーション」の節の app/models/article.rb に title や body の定義が無かったのはこのためです。たまたま同じ条件を使う別々の仕様は、それぞれが変わり得るかで共通化を判断します。たとえば、記事のタイトルとコメントの投稿者名の上限がどちらも100文字でも、片方だけ変える可能性があるなら、別々に書いたままにします（
              <ChapterLink n={59} />）。
            </li>
            <li>
              <Term>omakase</Term> は、開発を始められる一式を Rails が選んで提供する考え方です。日本語の「おまかせ」から来た語です。たとえばテストは Minitest（rails new
              で最初から使えるテスト用のライブラリ）を使って始められます。既存チームのテスト基盤に合わせて RSpec（別のテスト用のライブラリ。本書のデモも使っています）を選ぶなど、置き換える理由が具体的なら部品を替えられます（
              <ChapterLink n={20} />）。
            </li>
            <li>
              <Term>Majestic Monolith</Term> は、機能が増えても一つのアプリケーションとして育てる考え方です。モノリスは全体を1つにまとめたアプリケーションを指します。一つの DB
              トランザクションで更新でき、リリースの単位も揃います。トランザクションは複数の更新を、すべて成功するか、すべて取り消すかのどちらかにまとめる仕組みです（
              <ChapterLink n={15} section="transaction" />
              ）。たとえば、注文の保存と在庫の更新が同じ DB にあれば、1つのトランザクションにまとめて、片方だけが保存された状態を防げます。機能ごとにアプリケーションと DB
              を分けると、2つの DB にまたがる更新は1つのトランザクションにまとめられず、変更を本番環境に反映する作業もアプリケーションごとに必要です。独立した運用が必要な処理が現れたら、その境界を切り出す価値を検討します（
              <ChapterLink n={30} section="architecture-boundaries">機能を分ける境界</ChapterLink>）。
            </li>
            <li>
              <Term en="conceptual compression">概念の圧縮</Term> は、頻繁に使う複数の仕組みを、一つの操作として使えるようにすることです。<code>Article.where(published: true)</code>{' '}
              と書くと、Rails が値を列の型に合わせ、SQL を組み立てます。型の変換や SQL の書き方を意識しなくても、この1行で検索できます。普段はこの API で書き、計測結果から必要なときに SQL や接続の動きを調べます（SQL
              の組み立ては<ChapterLink n={12} />）。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'gems',
      title: 'Rails を構成する gem',
      body: (
        <>
          <p>
            Gemfile に書く <code>gem "rails"</code> の rails gem 自体には、ほとんどコードがありません。rails gem は Rails を構成する12個の gem に依存していて、それらがまとめてインストールされます
            <Ref n={10} />。本書で扱う gem と役割を次の表に示します。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>gem</th>
                  <th>主な役割</th>
                  <th>主に扱う章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>activesupport</code>
                  </td>
                  <td>
                    コア拡張（String や Integer のような Ruby に元からあるクラスにメソッドを足したもの。<code>blank?</code> や時刻の計算など）、<code>ActiveSupport::Concern</code>、<code>ActiveSupport::Callbacks</code>、計測用の通知など、他のすべての gem
                    が使う共通部品
                  </td>
                  <td>第5章ほか</td>
                </tr>
                <tr>
                  <td>
                    <code>activemodel</code>
                  </td>
                  <td>バリデーション、属性の型変換、変更の追跡など、データベースに依存しないモデルの機能</td>
                  <td>第15章、第18章</td>
                </tr>
                <tr>
                  <td>
                    <code>activerecord</code>
                  </td>
                  <td>データベースとのやり取り（テーブルとクラスの対応付け、SQL の生成、トランザクション）</td>
                  <td>第3部</td>
                </tr>
                <tr>
                  <td>
                    <code>actionpack</code>
                  </td>
                  <td>
                    ミドルウェア・ルーティング・リクエストとレスポンス（<code>ActionDispatch</code>）と、コントローラー（<code>ActionController</code>、<code>AbstractController</code>）
                  </td>
                  <td>第6章、第9章、第10章</td>
                </tr>
                <tr>
                  <td>
                    <code>actionview</code>
                  </td>
                  <td>テンプレートの探索と描画、ヘルパー</td>
                  <td>第20章</td>
                </tr>
                <tr>
                  <td>
                    <code>activejob</code>
                  </td>
                  <td>非同期ジョブの共通インターフェース</td>
                  <td>第21章</td>
                </tr>
                <tr>
                  <td>
                    <code>actionmailer</code>、<code>activestorage</code>
                  </td>
                  <td>メール送信、ファイル添付</td>
                  <td>第22章</td>
                </tr>
                <tr>
                  <td>
                    <code>railties</code>
                  </td>
                  <td>
                    <code>Rails::Application</code>、初期化処理、<code>rails</code> コマンド、ジェネレーター。各 gem を1つのアプリケーションにまとめる
                  </td>
                  <td>第7章</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            残りの <code>actiontext</code>（リッチテキスト）と <code>actionmailbox</code>（メールの受信）は本書の対象外です。
          </p>
          <p>
            gem の名前と、その gem が定義するモジュールの名前は対応しています。activerecord gem は <code>ActiveRecord</code>、actionpack gem は <code>ActionDispatch</code>・<code>ActionController</code>・
            <code>AbstractController</code> を定義します。<code>ActiveSupport::Concern</code> の <code>::</code> は、ActiveSupport というモジュールの中に定義された Concern を指す書き方です。
          </p>
          <p>
            この表はエラーの調査で場所の見当を付けるときに使えます。エラーのときに表示される呼び出しの履歴（バックトレース）には、<code>actionpack-8.1.4.1/lib/action_dispatch/…</code>{' '}
            のように gem の名前を含むファイルのパスが並びます。gem の名前が actionpack で、ディレクトリが action_dispatch なら、表から、ミドルウェアかルーティングの処理の中だと分かります。
          </p>
          <p>
            図1-5 は、これらの gem が実行時にどの gem に依存しているかを示したものです。各 gem の gemspec（gem の名前・バージョン・依存する gem を書いたファイル）に書かれた依存関係（開発時だけの依存を除く）から作りました
            <Ref n={10} />
            <Ref n={11} />。
          </p>
          <Figure
            n="1-5"
            title="Rails 8.1.4.1 を構成する gem の実行時の依存関係"
            caption="矢印は「依存する側 → 依存される側」。activesupport への矢印と、本書で扱わない actiontext・actionmailbox は省略しています。"
          >
            <GemDependencyFigure />
          </Figure>
          <p>図から読み取れることを3点挙げます。</p>
          <ol>
            <li>
              activesupport はすべての gem から使われます。<code>ActiveSupport::Concern</code> や <code>ActiveSupport::Callbacks</code> は、コントローラーにもモデルにも出てくるため、
              <ChapterLink n={5} />で先に説明します。
            </li>
            <li>
              railties は activerecord に依存していません。ActiveRecord は「Rails アプリに組み込まれるための設定」（Railtie）を持ち、アプリの初期化時にその設定が読み込まれることで Rails
              と結び付きます。このため、Rails アプリから ActiveRecord を外すこともできます。この仕組みは<ChapterLink n={7} />で説明します。
            </li>
            <li>actionpack は actionview に依存しています。コントローラーの描画処理が ActionView を呼び出すためです。</li>
          </ol>
          <Callout title="依存関係の確かめ方">
            <p>
              インストール済みの gem の依存関係は <code>gem dependency actionpack -v 8.1.4.1</code> で表示できます。開発時だけの依存には <code>development</code> と付くので、実行時の依存と区別できます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'rails-history',
      title: "Rails の歴史と古い情報の読み方",
      body: (
        <>
          <p>
            Rails は David Heinemeier Hansson が Basecamp の開発で使った仕組みを取り出し、2004年に公開しました。その後に入った機能を時系列で知ると、既存アプリや記事で異なる書き方に出会った理由がわかります。<Ref n={24} />
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">世代</th>
                  <th scope="col">変更の例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">1〜2</th>
                  <td>scaffold で一連の画面を生成する使い方が広まり、リソース中心のルーティングが整った</td>
                </tr>
                <tr>
                  <th scope="row">3</th>
                  <td>Merb との統合が進み、Bundler による依存管理と Arel によるクエリの組み立てが入った</td>
                </tr>
                <tr>
                  <th scope="row">4〜5</th>
                  <td>Rails 4 で Strong Parameters、Rails 5 で Action Cable と API モード、5.2 で credentials が入った</td>
                </tr>
                <tr>
                  <th scope="row">6〜7</th>
                  <td>Rails 6 の新規アプリは Webpacker を利用。Rails 7 の標準構成で importmap と Hotwire が使われ始めた</td>
                </tr>
                <tr>
                  <th scope="row">8</th>
                  <td>ジョブ・キャッシュ・WebSocket を DB で支える構成、Kamal 2、認証ジェネレーターを提供する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>表に出てきた語の意味は次のとおりです。本書で扱うものには、扱う節を添えています。</p>
          <ul>
            <li>
              scaffold：モデル・マイグレーション・コントローラー・ビュー・ルーティングを一度に作るジェネレーターです（<code>bin/rails generate scaffold</code>）。
            </li>
            <li>
              リソース中心のルーティング：「1つの要求を処理する順番」の節で見た <code>resources :articles</code> の書き方です（<ChapterLink n={9} section="resources" />）。
            </li>
            <li>Merb：Rails とは別に開発されていた Ruby の Web フレームワークです。</li>
            <li>
              Bundler と Arel：Bundler は Gemfile に書いた gem をインストールするツールです（「Rails を構成する gem」の節）。Arel は ActiveRecord が SQL を組み立てるときに内部で使うライブラリです（
              <ChapterLink n={12} section="arel" />）。
            </li>
            <li>
              Strong Parameters：フォームなどから受け取ってよい値の名前を、コントローラーで指定する仕組みです（<ChapterLink n={10} section="params" />）。
            </li>
            <li>
              Action Cable と WebSocket：WebSocket は、ブラウザーとサーバーが接続をつないだまま、どちらからでもデータを送れる通信の方式です。Action Cable は Rails で WebSocket を扱う機能です（Nginx の設定は
              <ChapterLink n={24} section="websocket" />）。
            </li>
            <li>
              API モード：HTML のビューを使わず、JSON などのデータだけを返すアプリケーションを作る構成です（<code>rails new</code> に <code>--api</code> を付けて作ります）。
            </li>
            <li>
              credentials：API キーやパスワードのような秘密の値を、暗号化したファイルに保存する仕組みです（<ChapterLink n={21} section="secrets" />）。
            </li>
            <li>
              Webpacker・importmap・Hotwire：どれも JavaScript の扱いに関係します。Webpacker は複数の JavaScript のファイルを1つにまとめるツール（webpack）を Rails から使うための gem です。importmap
              はファイルをまとめずにブラウザーに読み込ませる方式です。Hotwire はサーバーが返した HTML でページの一部を書き換える仕組みです（<ChapterLink n={16} section="assets" />）。
            </li>
            <li>
              ジョブ・キャッシュ・WebSocket を DB で支える構成：これらの処理を、Redis のような別のソフトウェアを使わずに DB のテーブルで動かす gem（Solid Queue・Solid Cache・Solid Cable）を指します（
              <ChapterLink n={18} section="solid-queue" />）。
            </li>
            <li>Kamal 2：Docker のコンテナを使って、アプリケーションをサーバーに配置して起動するツールです。</li>
            <li>
              認証ジェネレーター：ログインとログアウトのコードを作るジェネレーターです（<code>bin/rails generate authentication</code>。<ChapterLink n={21} section="authentication" />）。
            </li>
          </ul>
          <p>
            検索で見つけた記事や、以前から続いているアプリケーションのコードを読むときは、先に Rails のバージョンを確かめます。アプリケーションのバージョンは Gemfile.lock の rails の行で分かります（「Rails を構成する
            gem」の節）。記事は、書かれた日付と、本文に出てくる語から世代を見分けます。たとえば、<code>app/javascript/packs</code> や <code>config/webpacker.yml</code>{' '}
            が出てくる説明は Webpacker を使う構成のもので、importmap を使うアプリケーションには当てはまりません。業務のアプリケーションがどの構成かは、Gemfile に webpacker・importmap-rails・jsbundling-rails
            のどの gem が書かれているかで分かります。
          </p>
          <p>
            Rails 8 の「No PaaS Required」は、自前で用意したサーバーにもデプロイできる一式を提供する方針です。デプロイはアプリケーションのコードをサーバーに配置して、利用者が使える状態で動かす作業です。PaaS はデプロイや実行環境をサービス事業者に任せる選択肢です。アプリを置く場所と、使う Rails の機能は独立に選べるので、既存アプリでは導入済みの構成を調べてから手順を読みます。<Ref n={25} />（<ChapterLink n={29} section="kamal-thruster">Kamal と Thruster の位置付け</ChapterLink>）。
          </p>
        </>
      ),
    },
    {
      id: 'versions',
      title: '基準バージョンと Rails 7.2 との違いの示し方',
      body: (
        <>
          <p>本書の記述は2026年11月11日時点の次のバージョンを基準にしています。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ソフトウェア</th>
                  <th>バージョン</th>
                  <th>リリース日</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ruby on Rails</td>
                  <td>8.1.4.1</td>
                  <td>
                    2026-11-04 <Ref n={1} />
                  </td>
                </tr>
                <tr>
                  <td>Ruby（CRuby）</td>
                  <td>4.0.9</td>
                  <td>
                    2026-10-23 <Ref n={2} />
                  </td>
                </tr>
                <tr>
                  <td>Nginx</td>
                  <td>1.30.6（stable）</td>
                  <td>
                    2026-10-14 <Ref n={3} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            CRuby は C 言語で書かれた Ruby の処理系（Ruby のプログラムを読んで実行するプログラム）で、ruby コマンドとしてインストールされるものです。Nginx の stable は安定版を指します。
          </p>
          <p>
            Puma、Rack など、その他のソフトウェアのバージョンは<a href="#/">目次ページの「対象バージョン」</a>に載せています。本文のサンプルコードは Ruby 4.0.9 と Rails 8.1.4.1
            の環境で実行して出力を確認しました。オブジェクトの ID のように実行ごとに変わる値は、手元の結果と一致しません。
          </p>
          <h3>Rails のバージョン番号とサポート期間</h3>
          <p>
            Rails のバージョンは「メジャー.マイナー.パッチ」の3つの数字で表し、セキュリティ修正だけを含むリリースには4つ目の数字を付けます（8.1.4.1 は 8.1.4 にセキュリティ修正を加えたバージョンです）。Rails
            ではマイナーバージョン（8.0 から 8.1 など）でも互換性のない変更が入ることがあり、その場合は前のバージョンで非推奨の警告（使っている機能が将来のバージョンで削除や変更されることを知らせる警告）が出ます
            <Ref n={4} />。
          </p>
          <p>
            公式のメンテナンスポリシーでは、各マイナーバージョンは最初のリリースから1年間バグ修正を、2年間セキュリティ修正を受けます。新しいマイナーバージョンが1年以上出なかった場合は、次のバージョンが出るまで前のバージョンのサポートを延長するとされています
            <Ref n={4} />。業務で使っている Rails 7.x の各バージョンがいつまでサポートされるかは、付録Aで扱います。
          </p>
          <h3>Rails 7.2 との違いの示し方</h3>
          <p>
            業務のアプリは Rails 7.x 系です。本書は Rails 8.1 を基準に書きますが、Rails 7.2 と挙動や既定値が異なる箇所には、次のような枠で違いを示します。7.2
            より前のバージョンとの違いは影響の大きいものだけを補足します。
          </p>
          <Callout kind="v72">
            <p>この枠には Rails 7.2 で同じ処理がどう動くか、どのバージョンでいつ変わったかを書きます。</p>
          </Callout>
          <p>
            1つ注意があります。Rails をバージョンアップしても、<code>config/application.rb</code> の <code>config.load_defaults</code>{' '}
            に古いバージョンの番号が書かれていると、一部の設定は古いバージョンの既定値のまま動きます。そのため、Rails 8.1 にアップグレードしたアプリでも、設定によっては Rails 7.2
            と同じ挙動をします。<code>load_defaults</code> の仕組みは<ChapterLink n={7} />で説明します。
          </p>
          <Callout kind="note" title="本書のデモのアプリケーション">
            <p>
              各章の実測は、Docker の ruby:4.0 イメージから起動したコンテナ（Docker が作る、ほかのプログラムから分けた実行環境）の中で <code>rails new</code> した Rails 8.1.4.1 のアプリケーション（以下、デモのアプリケーション）で行いました。ActionMailbox・ActionText・Minitest
              を外して作り、章が進むにつれてモデルや gem を加えています。第2部までは SQLite、第3部からは MySQL 8.4 につなぎ、第4部で Sidekiq・Redis・turbo-rails・ActiveStorage・RSpec を、第5部で本番環境の
              Puma と Nginx の設定を加えました。各章では、その時点のモデルや設定を示してから実測します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'find-source',
      title: 'メソッドの定義場所を調べる',
      body: (
        <>
          <p>
            アプリのコードから呼んでいるメソッドの多くは、アプリの中ではなく Rails の gem の中で定義されています。Ruby には、メソッドを表すオブジェクトを取り出し、その定義場所を調べるメソッドが用意されています
            <Ref n={5} />。
          </p>
          <ul>
            <li>
              <code>obj.method(:name)</code>：オブジェクト <code>obj</code> に対して呼ばれるメソッドを、<code>Method</code> オブジェクトとして取り出します。private メソッド（レシーバを付けて外から呼べないメソッド）も取り出せます。レシーバは <code>article.title</code> の <code>article</code>{' '}
              のように、メソッドを呼ぶ相手のオブジェクトです。
            </li>
            <li>
              <code>Klass.instance_method(:name)</code>：クラス <code>Klass</code> のインスタンスに対して呼ばれるメソッドを、インスタンスを作らずに取り出します。返るのは{' '}
              <code>UnboundMethod</code> というクラスのオブジェクトで、次の <code>owner</code>・<code>source_location</code>・<code>super_method</code> を <code>Method</code> オブジェクトと同じように使えます。
            </li>
            <li>
              <code>owner</code>：そのメソッドが定義されているクラスまたはモジュールを返します。
            </li>
            <li>
              <code>source_location</code>：定義されているファイル名と行番号を返します。C で実装されたメソッドでは <code>nil</code> になります。
            </li>
            <li>
              <code>super_method</code>：そのメソッドの中で <code>super</code> を呼んだときに呼ばれる、次のメソッドを返します。次が無ければ <code>nil</code> です。
            </li>
          </ul>
          <p>
            次の例では、<code>has_many :comments</code> を書いた <code>Article</code> モデルで、<code>has_many</code> と <code>comments</code> の定義場所を調べています。
          </p>
          <Code
            lang="ruby"
            title="bin/rails console（Rails 8.1.4.1、ファイルパスの gem ディレクトリ部分は省略）"
            code={`
# app/models/article.rb
#   class Article < ApplicationRecord
#     has_many :comments
#   end

Article.method(:has_many).owner
# => ActiveRecord::Associations::ClassMethods
Article.method(:has_many).source_location
# => [".../activerecord-8.1.4.1/lib/active_record/associations.rb", 1427]

Article.instance_method(:comments).owner
# => Article::GeneratedAssociationMethods
Article.instance_method(:comments).source_location
# => [".../activerecord-8.1.4.1/lib/active_record/associations/builder/association.rb", 104]
`}
          />
          <p>
            <code>has_many :comments</code> はクラスの本体に書くので、Article クラスに対する呼び出しです。そのため <code>Article.method(:has_many)</code> で取り出します。<code>comments</code> は{' '}
            <code>article.comments</code> のように1件の記事（インスタンス）に対して呼ぶので、<code>Article.instance_method(:comments)</code> で取り出します。<code>source_location</code>{' '}
            の戻り値は配列で、1つ目がファイルのパス、2つ目が行番号です。
          </p>
          <p>
            <code>has_many</code> は <code>ActiveRecord::Associations::ClassMethods</code> というモジュールに定義されています。一方、<code>comments</code> は Article
            クラスにも、Rails のどのファイルにも、そのままの形では書かれていません。<code>has_many</code> を呼んだときに <code>Article::GeneratedAssociationMethods</code>{' '}
            というモジュールの中に作られたメソッドです。モジュールがクラスのメソッドとして使える理由は<ChapterLink n={3} />、メソッドが実行時に作られる仕組みは
            <ChapterLink n={5} />で説明します。
          </p>
          <p>
            <code>source_location</code> が返したファイルの行を開くと、定義を読めます。<code>has_many</code> の 1427 行目からの4行は「コードと図の表記」の節に引用しています。<code>comments</code>{' '}
            の 104 行目は、次の引用の3行目です。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/associations/builder/association.rb（102〜110行）"
            href={`${GH}/activerecord/lib/active_record/associations/builder/association.rb#L102-L110`}
            code={`
    def self.define_readers(mixin, name)
      mixin.class_eval <<-CODE, __FILE__, __LINE__ + 1
        def #{name}
          association = association(:#{name})
          deprecated_associations_api_guard(association, __method__)
          association.reader
        end
      CODE
    end
`}
          />
          <ul>
            <li>
              <code>has_many :comments</code> から呼ばれたとき、引数の <code>mixin</code> は <code>Article::GeneratedAssociationMethods</code>、<code>name</code> は <code>:comments</code> です。
            </li>
            <li>
              2行目の <code>&lt;&lt;-CODE</code> から8行目の <code>CODE</code> までは、複数行の文字列です。<code>{'#{name}'}</code> の位置に comments が入るので、文字列の中身は <code>def comments</code> で始まるメソッドの定義になります。
            </li>
            <li>
              <code>class_eval</code> は渡した文字列を Ruby のコードとして <code>mixin</code> の中で実行します。結果は <code>Article::GeneratedAssociationMethods</code> の中に <code>def comments</code>{' '}
              を書いたのと同じです。
            </li>
            <li>
              <code>__FILE__, __LINE__ + 1</code> は、作ったメソッドの定義場所として、このファイルの次の行（104 行目）を記録させる引数です。<code>source_location</code> が 104 を返したのはこのためです。
            </li>
          </ul>
          <p>
            アプリケーションや gem のコードを <code>def comments</code> で検索しても見つからないメソッドは、このように実行時に作られています。<code>owner</code> と <code>source_location</code>{' '}
            を使うと、作ったコードの場所が分かります。
          </p>
          <p>
            次の図は <code>has_many :comments</code> の1行から <code>comments</code> の定義ができるまでを、メソッドが呼ばれる順に並べたものです。左上の has_many の呼び出しから、右の列を上から下へたどってください。左下の{' '}
            <code>article.comments</code> は、最後にできた comments を呼びます。
          </p>
          <Figure
            title="has_many :comments から comments の定義ができるまで"
            caption="右の列の一番上と一番下の箱は、1行目が上の bin/rails console で調べた owner の値、2行目の括弧の中が source_location の値です。Builder::HasMany.build は「コードと図の表記」の節で引用する has_many の2行目で呼ばれます。太い矢印は comments の定義を作る処理です。"
          >
            <HasManyDefinitionFigure />
          </Figure>
          <h3>super でたどられる順序を調べる</h3>
          <p>
            Rails では、同じ名前のメソッドが複数のモジュールに定義され、それぞれが <code>super</code> で次の定義を呼ぶ形がよく使われます。<code>super_method</code>{' '}
            を繰り返し呼ぶと、その順序を一覧にできます。次の例は、コントローラーがアクションを実行するときに呼ばれる <code>process_action</code> を調べたものです。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行"
            code={`
m = ApplicationController.instance_method(:process_action)
while m
  path, line = m.source_location
  puts "#{m.owner}  #{path.sub(%r{.*/gems/}, '')}:#{line}"
  m = m.super_method
end
`}
          />
          <ul>
            <li>
              1行目は ApplicationController のインスタンスに対して呼ばれる <code>process_action</code> を取り出して <code>m</code> に入れます。
            </li>
            <li>
              <code>while m</code> は、<code>m</code> が <code>nil</code> になるまで中の3行を繰り返します。
            </li>
            <li>
              <code>path, line = m.source_location</code> は、戻り値の配列の1つ目（ファイルのパス）を <code>path</code> に、2つ目（行番号）を <code>line</code> に入れます。
            </li>
            <li>
              <code>{"path.sub(%r{.*/gems/}, '')"}</code> は、パスの先頭から <code>/gems/</code> までを取り除き、gem の名前から後ろだけを残します。<code>{'%r{ }'}</code> は正規表現の書き方の1つです。
            </li>
            <li>
              <code>m = m.super_method</code> で、<code>super</code> で呼ばれる次の定義に進みます。次が無ければ <code>nil</code> が入り、繰り返しが終わります。
            </li>
          </ul>
          <Code
            lang="text"
            title="出力"
            code={`
ActiveRecord::Railties::ControllerRuntime  activerecord-8.1.4.1/lib/active_record/railties/controller_runtime.rb:34
ActionController::ParamsWrapper  actionpack-8.1.4.1/lib/action_controller/metal/params_wrapper.rb:257
ActionController::Instrumentation  actionpack-8.1.4.1/lib/action_controller/metal/instrumentation.rb:59
ActionController::Rescue  actionpack-8.1.4.1/lib/action_controller/metal/rescue.rb:35
AbstractController::Callbacks  actionpack-8.1.4.1/lib/abstract_controller/callbacks.rb:265
ActionController::Rendering  actionpack-8.1.4.1/lib/action_controller/metal/rendering.rb:197
AbstractController::Base  actionpack-8.1.4.1/lib/abstract_controller/base.rb:220
`}
          />
          <p>
            <code>process_action</code> という1つのメソッド名に対して7つの定義があり、上から順に呼ばれます。各定義は自分の処理をしてから <code>super</code>{' '}
            を呼び、最後の <code>AbstractController::Base</code> がアクションのメソッド（<code>index</code> や <code>show</code>）を呼び出します。図1-6 は、各定義が何をしているかをソースから読み取って並べたものです。
          </p>
          <Figure n="1-6" title="ApplicationController#process_action の super の連鎖" caption="右側の説明は、各定義のソースを読んで要約したものです。">
            <ProcessActionChainFigure />
          </Figure>
          <p>
            たとえば、<code>before_action</code> で登録した処理は5番目の <code>AbstractController::Callbacks</code> で実行されます。その外側の4番目に{' '}
            <code>ActionController::Rescue</code> があるため、<code>before_action</code> の中で発生した例外も <code>rescue_from</code>{' '}
            で処理できます。この順序がどう決まるかは<ChapterLink n={3} />、それぞれの処理の中身は<ChapterLink n={10} />で扱います。
          </p>
          <h3>gem のソースファイルを開く</h3>
          <p>アプリが使っている gem のソースは、Bundler のコマンドで場所を調べられます。</p>
          <Code
            lang="bash"
            code={`
# gem がインストールされているディレクトリを表示する
bundle info activerecord --path

# 環境変数 EDITOR（または BUNDLER_EDITOR）に設定したエディタで gem のディレクトリを開く
bundle open activerecord
`}
          />
          <p>
            <code>bundle info --path</code> は gem のパスを表示し<Ref n={6} />、<code>bundle open</code> はそのディレクトリをエディタで開きます
            <Ref n={7} />。環境変数はシェル（ターミナルでコマンドを受け付けるプログラム）から起動するプログラムに渡す、名前の付いた値です。<code>EDITOR=code bundle open activerecord</code>{' '}
            のようにコマンドの前に書くと、その1回だけ指定できます（code は VS Code を開くコマンドです）。手元のファイルはアプリが実際に読み込んでいるバージョンなので、業務のアプリ（Rails 7.x）で調べるときは、本書が引用する 8.1.4.1 のソースと行番号や内容が異なることがあります。
          </p>
          <p>
            本書で Rails のソースを引用するときは、コードの見出しに GitHub 上の該当ファイルへのリンクを付けます。リンク先はタグ <code>v8.1.4.1</code>{' '}
            に固定しているので、Rails の開発が進んでもリンク先の内容は変わりません。
          </p>
        </>
      ),
    },
    {
      id: 'trace',
      title: '実行中の処理を追う',
      body: (
        <>
          <p>
            定義場所が分かっても、実際にどの順序で呼ばれ、そのとき変数に何が入っているかは、実行してみないと分からないことがあります。ここでは、実行中の処理を追う2つの方法を紹介します。
          </p>
          <p>不具合の再現から修正確認までの具体的な手順と、Pry・Better Errors・Bulletなどの使い分けは<ChapterLink n={28} />で扱います。</p>
          <h3>debug gem で止めて調べる</h3>
          <p>
            Rails 7 以降で新しく作ったアプリの Gemfile には、Ruby 公式のデバッガである debug gem が入っています
            <Ref n={9} />。Rails 8.1.4.1 の <code>rails new</code> で作った Gemfile では次のように書かれています。
          </p>
          <Code
            lang="ruby"
            title="Gemfile（rails new が生成した部分）"
            code={`
group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
end
`}
          />
          <p>
            <code>group :development, :test</code> は、開発環境とテスト環境でだけこの gem を読み込む指定です。本番環境では読み込まれません。<code>platforms:</code> はこの gem を使う Ruby の処理系を CRuby（mri）と
            Windows 版に限る指定です。
          </p>
          <p>
            止めたい行に <code>debugger</code>（<code>binding.break</code> の別名）を書き、その行を通るリクエストを送ると、<code>bin/rails server</code>{' '}
            を実行している端末でデバッガのプロンプト（コマンドの入力を待つ表示）が開きます
            <Ref n={8} />
            <Ref n={9} />。プロンプトでは Ruby の式を評価できるほか、次のようなコマンドが使えます
            <Ref n={8} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>コマンド</th>
                  <th>動作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>s</code>（step）
                  </td>
                  <td>次に止まれる位置まで進む。メソッド呼び出しがあればその中に入る</td>
                </tr>
                <tr>
                  <td>
                    <code>n</code>（next）
                  </td>
                  <td>次の行まで進む。メソッド呼び出しの中には入らない</td>
                </tr>
                <tr>
                  <td>
                    <code>fin</code>（finish）
                  </td>
                  <td>現在のメソッドが終わるまで進む</td>
                </tr>
                <tr>
                  <td>
                    <code>c</code>（continue）
                  </td>
                  <td>次のブレークポイント（実行を止める位置）まで実行を続ける</td>
                </tr>
                <tr>
                  <td>
                    <code>bt</code>（backtrace）
                  </td>
                  <td>現在位置までの呼び出し履歴を表示する。<code>bt /regexp/</code> で絞り込める</td>
                </tr>
                <tr>
                  <td>
                    <code>i</code>（info）
                  </td>
                  <td>現在選択しているメソッド呼び出しの実行状態（フレーム）にあるローカル変数・インスタンス変数・定数を表示する</td>
                </tr>
                <tr>
                  <td>
                    <code>l</code>（list）、<code>whereami</code>
                  </td>
                  <td>現在位置の周辺のソースを表示する</td>
                </tr>
                <tr>
                  <td>
                    <code>b Klass#method</code>（break）
                  </td>
                  <td>指定したメソッドが呼ばれたときに止まるブレークポイントを設定する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>たとえば、デモの ArticlesController の show アクションの先頭に <code>debugger</code> を書きます。</p>
          <Code
            lang="ruby"
            title="app/controllers/articles_controller.rb（debugger を足した show）"
            code={`
  def show
    debugger
    @article = Article.find(params[:id])
  end
`}
          />
          <p>
            この状態で /articles/1 を開くと、<code>debugger</code> の行で実行が止まり、<code>bin/rails server</code> の端末に <code>(rdbg)</code>{' '}
            というプロンプトが出ます。止まっている間、ブラウザーや curl は応答を待ったままです。プロンプトに <code>params[:id]</code> と入力すると、その時点の値が表示されます。<code>n</code>{' '}
            で1行ずつ進めると、<code>Article.find</code> の実行後に <code>@article</code> に入った記事も確かめられます。<code>c</code> で実行を再開すると、応答が返ります。止めて値を見る操作の実例は
            <ChapterLink n={28} section="debug" />にあります。
          </p>
          <p>
            Rails の内部を調べるときは、アプリのアクションに <code>debugger</code> を置いて止め、<code>bt</code> で呼び出し履歴を見るのが手軽です。履歴には、Puma
            からミドルウェア、ルーティング、コントローラーを経てアクションに至るまでのメソッドが並びます。この履歴の各行が何をしているかを説明することが、第2部の内容です。
          </p>
          <h3>TracePoint で呼ばれたメソッドを記録する</h3>
          <p>
            <code>TracePoint</code> はメソッドの呼び出しや例外の発生などのイベントが起きるたびにブロックを実行する Ruby の標準機能です
            <Ref n={12} />。デモの Article モデルには <code>scope :published, -&gt; {'{ where(published: true) }'}</code> を書いていて、<code>Article.published</code> で published の列が true
            の記事を取り出す条件を作れます。次の例は、<code>Article.published</code> の実行中に呼ばれた Ruby のメソッドを記録します（<code>:call</code> は Ruby で定義されたメソッドの呼び出しを表すイベントです。C
            で実装されたメソッドは <code>:c_call</code> という別のイベントになります）。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行"
            code={`
Article.published # 初回だけ起きる準備処理を先に済ませる
calls = []
trace = TracePoint.new(:call) do |tp|
  calls << "#{tp.defined_class}##{tp.method_id}  #{tp.path.sub(%r{.*/gems/}, '')}:#{tp.lineno}"
end
trace.enable { Article.published }
puts calls.size
puts calls.first(5)
`}
          />
          <ul>
            <li>
              1行目で <code>Article.published</code> を一度呼んでおくのは、初回だけ実行される準備の処理を記録に入れないためです。
            </li>
            <li>
              <code>TracePoint.new(:call) do |tp| … end</code> は記録の設定を作るだけで、この時点ではまだ記録を始めません。ブロックは Ruby で定義されたメソッドが呼ばれるたびに実行されます。
            </li>
            <li>
              ブロックの中では <code>tp</code> から4つの値を取り出して1行の文字列にし、<code>calls</code> に加えます。<code>defined_class</code> は呼ばれたメソッドが定義されているクラスまたはモジュール、
              <code>method_id</code> はメソッド名、<code>path</code> と <code>lineno</code> は定義されているファイルと行番号です。
            </li>
            <li>
              <code>trace.enable {'{ Article.published }'}</code> は、ブロックを実行している間だけ記録します。
            </li>
            <li>最後の2行は記録した呼び出しの数と、先頭の5件を表示します。</li>
          </ul>
          <Code
            lang="text"
            title="出力（1行目のクラス名の括弧内は省略）"
            code={`
108
#<Class:Article(...)>#published  activerecord-8.1.4.1/lib/active_record/scoping/named.rb:174
ActiveRecord::Scoping::Named::ClassMethods#all  activerecord-8.1.4.1/lib/active_record/scoping/named.rb:22
ActiveRecord::Scoping::ClassMethods#current_scope  activerecord-8.1.4.1/lib/active_record/scoping.rb:25
#<Class:ActiveRecord::Scoping::ScopeRegistry>#current_scope  activerecord-8.1.4.1/lib/active_record/scoping.rb:77
#<Class:ActiveRecord::Scoping::ScopeRegistry>#instance  activerecord-8.1.4.1/lib/active_record/scoping.rb:80
`}
          />
          <p>
            出力の1行目は記録した呼び出しの数です。2行目からは呼ばれた順に「定義されているクラスまたはモジュール#メソッド名」と「ファイル:行番号」を並べています。published、all、current_scope
            の順に呼ばれたことと、<code>scope</code> で作った published の定義が activerecord の lib/active_record/scoping/named.rb の 174 行目にあることが分かります。1行のコードに関係する Rails
            のファイルが分かるので、ソースをどのファイルから読むかを決められます。
          </p>
          <p>
            <code>scope :published, -&gt; {'{ where(published: true) }'}</code> と1行書いただけの処理でも、108回の Ruby メソッド呼び出しが起きています。1行目の{' '}
            <code>#&lt;Class:Article(...)&gt;</code> は「Article クラスの特異クラス」を表す表記で、<code>published</code> がクラスメソッドとして定義されていることを示しています。特異クラスは1つのオブジェクトだけが使うメソッドを置くクラスで、
            <code>Article.published</code> のようなクラスメソッドは、Article クラスの特異クラスに置かれます。特異クラスは
            <ChapterLink n={3} />で、<code>scope</code> の中のブロックが、検索条件や並び順を保持するオブジェクト（Relation）を self として実行される仕組みは<ChapterLink n={4} />で説明します。
          </p>
          <Callout kind="warn">
            <p>
              <code>debugger</code> の行を残したままデプロイしないよう注意してください。また、<code>TracePoint</code>{' '}
              を有効にしている間は、すべてのメソッド呼び出しでブロックが実行されるため処理が大幅に遅くなります。調査はコンソールや開発環境で、範囲を絞って行います。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'conventions',
      title: 'コードと図の表記',
      body: (
        <>
          <h3>コードの表記</h3>
          <ul>
            <li>
              <code># =&gt;</code> の後ろには、その式の戻り値（または <code>p</code> で表示される内容）を書きます。
            </li>
            <li>
              Rails や Ruby のソースを引用するときは、見出しにファイル名と行番号を書き、バージョンを固定した GitHub へのリンクを付けます。引用中のコメントは原文のままです。途中の行を省略した箇所には{' '}
              <code># ...（省略）</code> と書きます。
            </li>
            <li>アプリ側のサンプルコードは説明に必要な部分だけを示します。</li>
          </ul>
          <p>引用の例を示します。見出しのリンクから GitHub 上の該当行を開けます。</p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/associations.rb（1427〜1430行）"
            href={`${GH}/activerecord/lib/active_record/associations.rb#L1427-L1430`}
            code={`
        def has_many(name, scope = nil, **options, &extension)
          reflection = Builder::HasMany.build(self, name, scope, options, &extension)
          Reflection.add_reflection(self, name, reflection)
        end
`}
          />
          <p>
            この4行は「メソッドの定義場所を調べる」の節で <code>Article.method(:has_many).source_location</code> が返した 1427 行目からの定義です。次のように読みます。
          </p>
          <ul>
            <li>
              1行目：<code>has_many :comments</code> と書くと、<code>name</code> に <code>:comments</code> が入ります。<code>**options</code> は <code>dependent: :destroy</code>{' '}
              のような「名前: 値」の形の引数をまとめて受け取る書き方、<code>&amp;extension</code> は has_many に付けたブロックを受け取る書き方です。
            </li>
            <li>
              2行目：<code>self</code> は has_many を呼んだクラス（Article）です。<code>Builder::HasMany.build</code> の中で、<code>comments</code> などのメソッドが作られます。「メソッドの定義場所を調べる」の節で読んだ <code>define_readers</code> は、この build から呼ばれます。戻り値の <code>reflection</code>{' '}
              は、この関連の名前や設定を持つオブジェクトです。
            </li>
            <li>
              3行目：<code>reflection</code> を Article に登録します。関連の内部は<ChapterLink n={13} />で扱います。
            </li>
          </ul>
          <h3>図の凡例</h3>
          <p>本書の図は次の凡例に従って描いています。とくに断りがない限り、すべての章で共通です。</p>
          <Figure n="1-7" title="本書の図の凡例" caption="色だけでなく、箱の中のラベルでも種類が分かるように描いています。">
            <LegendFigure />
          </Figure>
          <p>
            図の多くは仕組みを説明するための模式図です。クラスの数やモジュールの並びを省略している場合は、図の説明文にその旨を書きます。
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
            HTTP の要求はメソッド・パス・ヘッダーからなり、応答はステータスコード・ヘッダー・本文からなります。GET はページなどを取り出す要求、POST はフォームの内容などを本文に入れて送る要求です。
          </li>
          <li>
            rails new は、モデル・コントローラー・ビュー・ルーティング・マイグレーションなどを置く場所を決めたアプリケーションを作ります。Article モデルは articles テーブルに対応し、テーブルの1行が1つのインスタンスになります。
          </li>
          <li>
            GET /articles は、routes.rb の対応で ArticlesController#index に渡り、index が条件を作り、ビューが記事を表示するときに SQL が実行され、HTML の応答が返ります。この分担を MVC と呼びます。
          </li>
          <li>ジョブ・メール・ファイル添付・テスト・セキュリティ・キャッシュなどの機能は、第20〜25章で扱います。</li>
          <li>リクエストは ALB → Nginx → Puma → Rails（ミドルウェア → ルーティング → コントローラー → モデル・ビュー）→ MySQL の順に通ります。本書はこの経路全体を扱います。</li>
          <li>
            rails gem は12個の gem に依存しています。activesupport はすべての gem から使われ、railties は activerecord に依存せず、Railtie を通じて各 gem と結び付きます。
          </li>
          <li>本書の基準は Rails 8.1.4.1、Ruby 4.0.9、Nginx 1.30.6 です。Rails 7.2 との違いは専用の枠で示します。</li>
          <li>
            <code>owner</code> と <code>source_location</code> で定義場所を、<code>super_method</code> で <code>super</code> の呼び出し順を調べられます。<code>process_action</code>{' '}
            には7つの定義があり、モジュールの並び順に従って呼ばれます。
          </li>
          <li>
            実行中の様子は debug gem（<code>debugger</code> と <code>bt</code> など）や <code>TracePoint</code> で追えます。
          </li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Release 8.1.4.1', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/releases/tag/v8.1.4.1', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Rails 8.1.4.1 のリリース日（2026-11-04）と変更内容。' },
    { title: 'Ruby 4.0.9 Released', publisher: 'ruby-lang.org', url: 'https://www.ruby-lang.org/en/news/2026/10/23/ruby-4-0-9-released/', accessed: '2026-11-11', version: 'Ruby 4.0.9', note: 'Ruby 4.0.9 のリリース日。' },
    { title: 'nginx news: 2026', publisher: 'nginx.org', url: 'https://nginx.org/2026.html', accessed: '2026-11-11', note: '安定版 1.30.6（2026-10-14）と mainline 1.31.8（2026-10-21）のリリース。' },
    { title: 'Maintenance Policy for Ruby on Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/maintenance_policy.html', accessed: '2026-11-11', note: 'バージョン番号の意味、バグ修正1年・セキュリティ修正2年の方針、サポート延長の条件。' },
    { title: 'class Method', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Method.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'owner、source_location、super_method の仕様。' },
    { title: 'bundle info', publisher: 'RubyGems Guides（Bundler コマンドリファレンス）', url: 'https://guides.rubygems.org/command-reference/bundle-info/', accessed: '2026-11-11', note: '--path オプション。' },
    { title: 'bundle open', publisher: 'RubyGems Guides（Bundler コマンドリファレンス）', url: 'https://guides.rubygems.org/command-reference/bundle-open/', accessed: '2026-11-11', note: 'EDITOR または BUNDLER_EDITOR で gem のディレクトリを開く。' },
    { title: 'ruby/debug README', publisher: 'ruby/debug（GitHub）', url: 'https://github.com/ruby/debug', accessed: '2026-11-11', version: 'debug 1.11.1', note: 'binding.break と別名 debugger、step・next・finish・continue・bt・info などのコマンド。' },
    { title: 'Debugging Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/debugging_rails_applications.html', accessed: '2026-11-11', version: 'Rails 8.1', note: 'Rails 7 以降の新規アプリの Gemfile に debug gem が含まれること、debugger でセッションに入る方法。' },
    { title: 'rails 8.1.4.1', publisher: 'RubyGems.org', url: 'https://rubygems.org/gems/rails/versions/8.1.4.1', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'rails gem の実行時依存（12個の gem と bundler）。' },
    { title: 'actionpack 8.1.4.1', publisher: 'RubyGems.org', url: 'https://rubygems.org/gems/actionpack/versions/8.1.4.1', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'actionpack の実行時依存（actionview、activesupport など）。他の gem も同様に gem dependency コマンドで確認した。' },
    { title: 'class TracePoint', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/TracePoint.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: ':call と :c_call イベント、defined_class・method_id・path・lineno。' },
    { title: 'An overview of HTTP', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview', accessed: '2026-11-16', note: 'HTTP はクライアントの要求とサーバーの応答をやり取りする規則であること。' },
    { title: 'HTTP messages', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages', accessed: '2026-11-16', note: '要求の1行目（メソッド・パス・バージョン）、ヘッダー、空行、本文と、応答の状態行の構成。' },
    { title: 'RFC 9110: HTTP Semantics', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110.html', accessed: '2026-11-16', note: 'GET と POST の意味（9.3.1・9.3.3）、ステータスコードの分類（15）と 200・302・404・422・500。' },
    { title: 'Getting Started with Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/getting_started.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'Rails はフレームワークであること、rails new が作るディレクトリの役割、MVC、Convention Over Configuration、generate model がマイグレーションとモデルを作ること。' },
    { title: 'Rails Routing from the Outside In', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/routing.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'resources が作るルートと、bin/rails routes の出力。' },
    { title: 'Active Record Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_basics.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'クラス名を複数形にした名前のテーブルに対応すること、インスタンスがテーブルの1行を表すこと。' },
    { title: 'Active Record Migrations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_migrations.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'create_table と timestamps、主キーの id が自動で加わること、db:migrate が未実行のマイグレーションを実行すること。' },
    { title: 'Layouts and Rendering in Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/layouts_and_rendering.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'アクションが応答を指定しなければ名前の対応するビューを描画すること、コレクションの描画と部分テンプレートの変数・カウンター。' },
    { title: 'Ruby on Rails Guides（目次）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/index.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'ActiveJob・ActionMailer・ActiveStorage・ActionCable・テスト・セキュリティ・キャッシュなど、Rails が用意する機能の一覧。' },
    { title: 'HTTPS', publisher: 'MDN Web Docs（Glossary）', url: 'https://developer.mozilla.org/en-US/docs/Glossary/HTTPS', accessed: '2026-11-16', note: 'HTTPS は TLS で通信を暗号化した HTTP であること。' },
    { title: "The Rails Doctrine", publisher: "Ruby on Rails", url: "https://rubyonrails.org/doctrine", accessed: "2026-11-20", note: "設定より規約、omakase、統合を大切にする Rails の設計思想。" },
    { title: "Ruby on Rails Release Notes", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/index.html#release-notes", accessed: "2026-11-20", note: "Rails の世代ごとの変更とリリースノートへの案内。" },
    { title: "Rails 8: No PaaS Required", publisher: "Ruby on Rails", url: "https://rubyonrails.org/2024/11/7/rails-8-no-paas-required", accessed: "2026-11-20", version: "Rails 8.0", note: "Rails 8 のデプロイ、Solid 系の gem と認証ジェネレーター。" },
  ],
}

export default withExplanations(ch01, explanation01)
