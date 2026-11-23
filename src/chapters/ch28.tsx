import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation28 } from '../explanations/operations'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

/* ---------- 図 32-1 調査の手掛かり ---------- */
function CluesFigure() {
  const clues = [
    ['応答', 'ステータス 500 とエラーの画面'],
    ['ログ', 'どの処理が動き、何を返したか'],
    ['例外とバックトレース', 'どこで、どんなエラーが起きたか'],
    ['止めた時点の変数の値', 'デバッガーで調べる'],
  ]
  return (
    <Svg
      id="32-1"
      w={780}
      h={282}
      label="curl で GET /price?quantity=2 を送ると、Rails の PricesController#show が PriceCalculator#total を呼ぶ。調査の手掛かりは、応答（ステータス 500 とエラーの画面）、ログ（どの処理が動き、何を返したか）、例外とバックトレース（どこで、どんなエラーが起きたか）、止めた時点の変数の値（デバッガーで調べる）の4つ"
    >
      <Box x={20} y={100} w={110} h={56} lines={['curl', '（ブラウザー）']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={130} y1={128} x2={248} y2={128} />
      <T x={140} y={106} fs={10.5} mono tone="muted">
        GET /price
      </T>
      <T x={140} y={146} fs={10.5} mono tone="muted">
        ?quantity=2
      </T>
      <Box x={250} y={70} w={210} h={116} lines={['Rails のアプリケーション', 'PricesController#show', '↓', 'PriceCalculator#total']} fs={12} fill="box" subTone="muted" />
      {clues.map(([a, b], i) => (
        <g key={a}>
          <Box x={530} y={14 + i * 62} w={230} h={50} lines={[a, b]} fs={12} fill="box4" subTone="muted" />
          <Arrow x1={460} y1={100 + i * 18} x2={528} y2={39 + i * 62} dashed={i === 3} />
        </g>
      ))}
      <T x={20} y={266} fs={11} tone="muted">
        期待（合計: 2900 円）と実際（500 のエラー）の違いがどこで生まれたかを、これらの手掛かりから探す
      </T>
    </Svg>
  )
}

/* ---------- 図 32-2 開発環境のエラー画面 ---------- */
function ErrorPageFigure() {
  const notes: [number, string][] = [
    [31, '例外のクラスと、起きたアクション'],
    [66, 'メッセージ'],
    [136, '例外が起きた行の前後のソース'],
    [226, 'バックトレース（アプリケーションの行）'],
    [290, '要求のパラメーター（"2" は文字列）'],
  ]
  return (
    <Svg
      id="32-2"
      w={780}
      h={322}
      label="開発環境のエラー画面。一番上に例外のクラスと、例外が起きたアクション（TypeError in PricesController#show）、次にメッセージ（String can't be coerced into Integer）、例外が起きた行の前後のソース（3行目が強調される）、Application Trace としてアプリケーションのファイルの行だけのバックトレース、最後に要求のパラメーター（quantity は文字列の 2）が表示される"
    >
      <rect x={20} y={14} width={470} height={296} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <rect x={20} y={14} width={470} height={34} rx={6} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={32} y={31} bold fs={13} tone="danger">
        TypeError in PricesController#show
      </T>
      <T x={32} y={66} bold fs={12} tone="danger">
        String can't be coerced into Integer
      </T>
      <rect x={32} y={80} width={446} height={100} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={40} y={94} fs={10.5}>
        Extracted source (around line #3):
      </T>
      <rect x={33} y={136} width={444} height={16} fill="var(--fig-box5)" />
      {['1  class PriceCalculator', '2    def total(unit_price, quantity)', '3      subtotal = unit_price * quantity', '4      subtotal + 500'].map((l, i) => (
        <text key={l} x={40} y={112 + i * 16} fontSize={10.5} dominantBaseline="central" className="mono" style={{ whiteSpace: 'pre' }}>
          {l}
        </text>
      ))}
      <T x={32} y={196} fs={10.5} tone="acc">
        Application Trace | Framework Trace | Full Trace
      </T>
      {["lib/price_calculator.rb:3:in 'Integer#*'", "lib/price_calculator.rb:3:in 'PriceCalculator#total'", "app/controllers/prices_controller.rb:3:in 'PricesController#show'"].map((l, i) => (
        <T key={l} x={32} y={214 + i * 15} fs={10} mono>
          {l}
        </T>
      ))}
      <T x={32} y={270} bold fs={12} tone="danger">
        Request
      </T>
      <T x={32} y={290} fs={10.5} mono>
        {'Parameters: {"quantity" => "2"}'}
      </T>
      {notes.map(([y, text]) => (
        <g key={text}>
          <Arrow x1={514} y1={y} x2={494} y2={y} />
          <T x={520} y={y} fs={11.5}>
            {text}
          </T>
        </g>
      ))}
    </Svg>
  )
}

/* ---------- ログの行が表すもの（番号なし） ---------- */
function LogLinesFigure() {
  const lines = [
    'Started GET "/articles/1" for 172.29.0.1 at …',
    'Processing by ArticlesController#show as */*',
    '  Parameters: {"id" => "1"}',
    '  Article Load (0.4ms)  SELECT … LIMIT 1',
    '  ↳ app/controllers/articles_controller.rb:9:in …',
    '  Rendering layout layouts/application.html.erb',
    '  Rendering articles/show.html.erb within …',
    '  Comment Load (0.4ms)  SELECT … LIMIT 2',
    '  ↳ app/views/articles/show.html.erb:5',
    '  Rendered collection of templates [0 times] …',
    '  Rendered articles/show.html.erb within …',
    '  Rendered layout layouts/application.html.erb …',
    'Completed 200 OK in 70ms (Views: 29.0ms | ActiveRecord: 7.5ms …',
  ]
  const yOf = (i: number) => 46 + i * 19
  const groups: [number, number, string[]][] = [
    [0, 0, ['始まり：メソッド・パス・IP・時刻']],
    [1, 2, ['処理したコントローラーとアクション', 'アクションが受け取った params']],
    [3, 4, ['実行した SQL とかかった時間', '↳ は SQL を実行させたコードの場所']],
    [5, 6, ['Rendering の行', 'HTML を作るテンプレート']],
    [7, 8, ['同じく SQL と ↳ の行', 'ビューの5行目から実行された']],
    [9, 11, ['Rendered の行', '描画したテンプレートと時間']],
    [12, 12, ['終わり：ステータスと全体・ビュー・DB の時間']],
  ]
  return (
    <Svg
      id="ch28-log-lines"
      w={780}
      h={300}
      label="GET /articles/1 のログの13行に、行が表すものを書き添えた図。Started の行は1件の始まりで、メソッド・パス・送信元の IP・時刻。Processing by の行は処理したコントローラーとアクション、Parameters の行はアクションが受け取った params。Article Load の行は実行した SQL とかかった時間で、その下の ↳ の行は SQL を実行させたコードの場所。Rendering と Rendered の行は HTML を作ったテンプレートで、その間の Comment Load と ↳ の行は、ビューの5行目から実行された SQL。Completed の行は1件の終わりで、ステータスと、全体・ビュー・DB の時間"
    >
      <T x={14} y={16} bold fs={12}>
        GET /articles/1 のログ（上から出た順）
      </T>
      <T x={510} y={16} bold fs={12}>
        行が表すもの
      </T>
      <Box x={12} y={32} w={478} h={256} fill="bg" />
      {lines.map((l, i) => (
        <text key={l} x={22} y={yOf(i)} fontSize={11.5} dominantBaseline="central" className="mono" style={{ whiteSpace: 'pre' }}>
          {l}
        </text>
      ))}
      {groups.map(([a, b, label]) => {
        const mid = (yOf(a) + yOf(b)) / 2
        return (
          <g key={label[0]}>
            <Arrow d={`M496,${yOf(a) - 7} L502,${yOf(a) - 7} L502,${yOf(b) + 7} L496,${yOf(b) + 7}`} plain />
            {label.map((t, k) => (
              <T key={t} x={510} y={mid + (k - (label.length - 1) / 2) * 18} fs={12} tone={k > 0 ? 'muted' : undefined}>
                {t}
              </T>
            ))}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- バックトレースの行と呼び出しの順（番号なし） ---------- */
function BacktraceOrderFigure() {
  const rows = [
    { line: "price.rb:3:in 'Integer#*': … (TypeError)", note: 'Integer#* の中で TypeError が起きた' },
    { line: "from price.rb:3:in 'PriceCalculator#total'", note: '3行目で 1200 * "2" を計算した' },
    { line: "from price.rb:9:in 'Object#checkout'", note: '9行目で params[:quantity] の "2" を渡した' },
    { line: "from price.rb:13:in '<main>'", note: '13行目で checkout({ quantity: "2" }) を呼んだ' },
  ]
  const top = (i: number) => 30 + i * 64
  return (
    <Svg
      id="ch28-backtrace-order"
      w={780}
      h={286}
      label="ruby price.rb のバックトレースの4行を、出力と同じ順に上から並べた図。一番上は Integer#* の中で TypeError が起きた行、その下は PriceCalculator#total の3行目で 1200 掛ける文字列の 2 を計算した行、Object#checkout の9行目で params[:quantity] の文字列の 2 を渡した行、<main> の13行目で checkout を呼んだ行。呼び出した順は下から上で、<main> が checkout を、checkout が total を、total が Integer#* を呼んだ。Integer#* は Ruby の中のメソッドで、直すのは自分のコード。最初に出てくる自分のコードの行（PriceCalculator#total）から読み始め、渡された値の出どころを下の行へたどる"
    >
      <T x={200} y={14} bold fs={12}>
        バックトレースの行（出力の順。上ほど新しい呼び出し）
      </T>
      {rows.map((r, i) => (
        <g key={r.line}>
          <Box x={200} y={top(i)} w={360} h={50} fill={i === 0 ? 'bg' : i === 1 ? 'box5' : 'box'} accent={i === 1} />
          <T x={212} y={top(i) + 16} fs={12} mono>
            {r.line}
          </T>
          <T x={212} y={top(i) + 35} fs={11.5} tone={i === 0 ? 'danger' : 'muted'}>
            {r.note}
          </T>
        </g>
      ))}
      <Arrow x1={186} y1={top(3) + 25} x2={186} y2={top(0) + 25} />
      <T x={174} y={142} anchor="end" bold fs={12}>
        呼び出した順
      </T>
      <T x={174} y={160} anchor="end" fs={11.5} tone="muted">
        下から上へ
      </T>
      <T x={580} y={top(0) + 16} fs={11.5} tone="muted">
        Ruby の中のメソッド
      </T>
      <T x={580} y={top(0) + 34} fs={11.5} tone="muted">
        直すのは自分のコード
      </T>
      <Arrow x1={598} y1={top(1) + 25} x2={564} y2={top(1) + 25} accent />
      <T x={606} y={top(1) + 16} fs={12} bold tone="acc">
        ここから読む
      </T>
      <T x={606} y={top(1) + 34} fs={11.5} tone="muted">
        最初に出る自分のコード
      </T>
      <Arrow x1={580} y1={top(2) - 6} x2={580} y2={top(3) + 25} accent />
      <T x={594} y={top(2) + 30} fs={12}>
        渡された値の出どころを
      </T>
      <T x={594} y={top(2) + 48} fs={12}>
        下の行へたどる
      </T>
    </Svg>
  )
}

function InvestigationFigure() {
  const rows = [
    ['再現する', '入力・実行環境・操作順を固定する'],
    ['止めて観察する', '例外、値、型、呼び出し元を確認する'],
    ['原因を絞る', '期待と実際が最初に違う位置を探す'],
    ['修正して確かめる', '再現ケースと周辺ケースをテストする'],
  ]
  return <Svg id="32-3" w={700} h={332} label="調査の進め方。条件を固定して再現し、値や呼び出し元を観察し、期待と実際が分かれる箇所を特定して修正する。最後に同じ条件と周辺条件でテストする。">
    {rows.map(([a, b], i) => <g key={a}>
      <Box x={20} y={14 + i * 80} w={180} h={58} lines={a} fs={14} bold />
      <Arrow x1={202} y1={43 + i * 80} x2={238} y2={43 + i * 80} />
      <Box x={240} y={14 + i * 80} w={440} h={58} lines={b} fs={13} fill="box4" />
      {i < 3 && <Arrow x1={110} y1={72 + i * 80} x2={110} y2={92 + i * 80} />}
    </g>)}
  </Svg>
}

function FramesFigure() {
  return <Svg id="32-4" w={700} h={294} label="呼び出し履歴の模式図。コントローラーがサービスを呼び、サービスの掛け算でTypeErrorが発生する。呼び出しごとの実行状態をフレームと呼び、上のフレームへ移って入力の由来を調べる。">
    <Box x={20} y={18} w={300} h={62} lines={['#2 コントローラー', 'フォームから quantity = "2"']} fs={13} subTone="muted" />
    <Arrow x1={170} y1={80} x2={170} y2={110} />
    <Box x={20} y={112} w={300} h={62} lines={['#1 PriceCalculator#total', 'unit_price = 1200 / quantity = "2"']} fs={12} subTone="muted" />
    <Arrow x1={170} y1={174} x2={170} y2={204} />
    <Box x={20} y={206} w={300} h={62} lines={['#0 Integer#*', '型が合わず TypeError']} fs={13} fill="bg" subTone="danger" />
    <Box x={370} y={68} w={310} h={160} lines={['bt：呼び出し履歴を一覧にする', 'frame / up：調べる呼び出しを選ぶ', 'p quantity.class：型を確かめる', '例外の行だけでなく、入力の由来も追う']} fs={12} fill="box5" />
  </Svg>
}

function ToolsFigure() {
  const rows = [
    ['値や分岐がおかしい', 'debug / pry-byebug', '停止して、値と型を調べる'],
    ['例外画面から調べたい', 'better_errors / web-console', '呼び出し履歴と変数を確認'],
    ['SQL の繰り返しが気になる', 'Bullet', 'N+1 と不要な先読みの候補'],
    ['応答が遅い', 'rack-mini-profiler', '時間のかかる処理を絞る'],
    ['メールの内容がおかしい', 'letter_opener_web', '保存したメールを表示する'],
  ]
  return <Svg id="32-5" w={760} h={352} label="症状と道具の対応。値や分岐にはdebugやpry-byebug、例外画面にはbetter_errorsやweb-console、SQLの繰り返しにはBullet、性能にはrack-mini-profiler、メールの確認にはletter_opener_webを使う。">
    {rows.map(([a, b, c], i) => <g key={a}>
      <Box x={20} y={12 + i * 68} w={230} h={54} lines={a} fs={12.5} />
      <Arrow x1={252} y1={39 + i * 68} x2={286} y2={39 + i * 68} />
      <Box x={290} y={12 + i * 68} w={450} h={54} lines={[b, c]} fs={12.5} fill="box4" subTone="muted" />
    </g>)}
  </Svg>
}

const ch28: Chapter = {
  number: 28,
  part: 5,
  title: 'Rails の改修・デバッグ・コードレビュー',
  summary:
    '数量に「2」を入力すると、合計金額を表示する画面でエラーが起きます。入力した値が計算式に届くまでをログとデバッガで追い、修正後は同じ不具合を見つけられるテストを残します。',
  goals: [
    '改修後に誰が何をできればよいかを、具体的な入力と結果で合意できる',
    'エラーが出た行と呼び出し元を読み、実行を止めて数量の値と型を確かめられる',
    '修正前に失敗して修正後に通るテストを作り、理由と確認結果をレビューで伝えられる',
  ],
  prerequisites: [1, 10, 13, 18, 19, 20, 22],
  sections: [
    {
      id: 'delivery-planning',
      title: "改修の要件・見積もり・受け入れ条件を決める",
      body: (
        <>
          <p>
            「記事を予約公開したい」という依頼なら、「何時に誰からどう見えるか」を先に決めます。たとえば「10時に予約した記事は、一般の読者の一覧に9時59分には出ず、10時には出る」と書けば、作る人と確認する人が同じ条件で試せます。完成したと判断できるこうした条件を、受け入れ条件と呼びます。
          </p>
          <p>
            画面については、誰が日時を設定できるか、予約を変更・取り消せるのはいつまでかを決めます。表示だけなら、一覧を取得する時刻と予約日時を比べる方法があります。「公開したときにメールも送る」なら、送信を始める仕組みと、送信済みかどうかの記録も必要です。必要な機能と保留した条件を Issue に残します。
          </p>
          <p>
            最初の見積もりでは仕様や既存データに不明点が多く、調査により見積もりの幅を狭められます。この傾向を不確実性のコーンと呼びます。画面、モデル、DB、権限、試験、配備に分け、決められない箇所はまず調査の範囲と到達条件を合意します。幅を持つ見積もりには、データ量などの前提と、既存 API の変更有無など見積もりが動く理由を書きます。決まったことと保留したことが次の人にも伝わるよう、Issue や設計記録を更新します。
          </p>
          <p>未確定の外部 API がある場合は、調査の期限と成果物を「接続条件を確かめて実装案と再見積もりを出す」と定めます。既知の実装工数とリスク分の余裕を分け、レビュー待ちやデータ量など余裕を取った理由を示します。着手後は見積もりと実績の差を共有し、前提が変わった項目を更新します。</p>
        </>
      ),
    },
    {
      id: 'gem-selection',
      title: "改修に使う gem を選ぶ",
      body: (
        <>
          <p>
            追加する gem は、Rails 標準ですでに満たせる条件を確かめてから選びます。必要な Ruby・Rails の版、変更履歴、依存 gem、保守状況、ライセンス、セキュリティ対応、外すときの影響を確認します。ミドルウェアや Railtie を差し込むもの、他のクラスを変更するものは、どの経路が影響を受けるかも見ます。数行の業務規則ならアプリで持てますが、認証などでは実績のある仕組みと更新手順を使う利点があります。<Ref n={15} /><Ref n={16} />
          </p>
        </>
      ),
    },
    {
      id: 'bug-clues',
      title: '不具合の調査で確かめること',
      body: (
        <>
          <p>
            <Term>不具合</Term>（バグ）は、プログラムが期待どおりに動かないことです。この章ではデモのアプリケーションをコピーし、単価1200円に数量を掛けて送料500円を足す画面 /price
            を加えて例にします。数量が2なら、期待する結果は 1200 × 2 + 500 = 2900 円です。
          </p>
          <Code
            lang="ruby"
            title="lib/price_calculator.rb と app/controllers/prices_controller.rb（デモのコピー）"
            code={`
class PriceCalculator
  def total(unit_price, quantity)
    subtotal = unit_price * quantity
    subtotal + 500
  end
end

class PricesController < ApplicationController
  def show
    total = PriceCalculator.new.total(1200, params[:quantity])
    render plain: "合計: #{total} 円\\n"
  end
end
`}
          />
          <p>開発環境で起動し、ブラウザーの代わりに curl で数量2を送りました。</p>
          <Code
            lang="text"
            title="curl の出力（ヘッダーの一部を省略）"
            code={`
$ curl -i 'http://127.0.0.1:3328/price?quantity=2'
HTTP/1.1 500 Internal Server Error
content-type: text/html; charset=UTF-8
x-request-id: f0f667f8-5e60-4452-9e2e-20e1c1979c9e
`}
          />
          <p>
            期待した「合計: 2900 円」ではなく、ステータス 500（Internal Server Error。サーバーの中でエラーが起きたことを表す）が返りました。これが不具合です。不具合の調査は、期待した結果と実際の結果がどこで分かれたかを探し、その原因を突き止める作業です。
          </p>
          <p>
            手掛かりは4つあります。1つ目は応答で、ステータスや画面から何が起きたかの見当を付けます。2つ目はログで、Rails がその要求をどう処理したかの記録です。3つ目は例外とバックトレースで、どこでどんなエラーが起きたかを示します。4つ目は実行を途中で止めて見る変数の値です（図 32-1）。次の3つの節で、ログ、例外とバックトレース、実行を止める方法を、この /price の不具合で順に確かめます。
          </p>
          <Figure n="32-1" title="不具合の調査の手掛かり" caption="デモのコピー（Rails 8.1.4.1）の /price を例にした図。">
            <CluesFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'rails-log',
      title: 'Rails のログを読む',
      body: (
        <>
          <p>
            Rails は要求を1件処理するたびに、何をしたかをログに書きます。開発環境では <code>bin/rails server</code> を起動した端末と log/development.log の両方に出ます<Ref n={1} />
            。まず、正常に処理された GET /articles/1 のログを見ます。
          </p>
          <Code
            lang="text"
            title="GET /articles/1 のログ（開発環境。色の指定と SQL の末尾のコメントを除いた）"
            code={`
Started GET "/articles/1" for 172.29.0.1 at 2026-11-16 07:09:48 +0000
Processing by ArticlesController#show as */*
  Parameters: {"id" => "1"}
  Article Load (0.4ms)  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 1 LIMIT 1
  ↳ app/controllers/articles_controller.rb:9:in 'ArticlesController#show'
  Rendering layout layouts/application.html.erb
  Rendering articles/show.html.erb within layouts/application
  Comment Load (0.4ms)  SELECT \`comments\`.* FROM \`comments\` WHERE \`comments\`.\`article_id\` = 1 ORDER BY \`comments\`.\`id\` DESC LIMIT 2
  ↳ app/views/articles/show.html.erb:5
  Rendered collection of templates [0 times] (Duration: 0.0ms | GC: 0.0ms)
  Rendered articles/show.html.erb within layouts/application (Duration: 22.9ms | GC: 0.0ms)
  Rendered layout layouts/application.html.erb (Duration: 27.2ms | GC: 0.0ms)
Completed 200 OK in 70ms (Views: 29.0ms | ActiveRecord: 7.5ms (2 queries, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            1件の要求のログは <code>Started</code> の行で始まり、<code>Completed</code> の行で終わります。Started の行には要求のメソッドとパス、送ってきた相手の IP アドレス、時刻があります。
            <code>Processing by</code> はその要求を処理したコントローラーとアクション（ArticlesController#show）、<code>Parameters</code> はアクションが受け取った params です。
            <code>Article Load (0.4ms)</code> の行は実行した SQL とかかった時間で、その下の ↳ の行はその SQL を実行させたコードの場所です。Rendering と Rendered の行は、HTML を作ったテンプレートです。最後の行は応答のステータス（200
            OK）と全体の時間、そのうちビューと DB にかかった時間を示します。
          </p>
          <p>次の図は、上のログの各行が何を表すかを、行の右に書き添えたものです。上の Started の行から順に、右の説明と見比べてください。</p>
          <Figure title="ログの行が表すもの" caption="上の GET /articles/1 のログをもとにした図。長い行は途中や末尾を … で省いた。右の括弧は説明がどの行に当たるかを示す。">
            <LogLinesFigure />
          </Figure>
          <p>次は不具合の /price のログです。</p>
          <Code
            lang="text"
            title="GET /price?quantity=2 のログ（開発環境）"
            code={`
Started GET "/price?quantity=2" for 172.29.0.1 at 2026-11-16 07:09:48 +0000
Processing by PricesController#show as */*
  Parameters: {"quantity" => "2"}
Completed 500 Internal Server Error in 1ms (ActiveRecord: 0.0ms (0 queries, 0 cached) | GC: 0.0ms)

TypeError (String can't be coerced into Integer):

lib/price_calculator.rb:3:in 'Integer#*'
lib/price_calculator.rb:3:in 'PriceCalculator#total'
app/controllers/prices_controller.rb:3:in 'PricesController#show'
`}
          />
          <p>
            PricesController#show が動き、1ms で 500 を返したことが分かります。Parameters の <code>"quantity" =&gt; "2"</code> は、数量が引用符の付いた文字列で届いたことを示しています。その後の
            <code>TypeError (String can't be coerced into Integer):</code> と3行が、起きた例外とその場所です。読み方は次の節で扱います。
          </p>
          <p>本番環境の設定でも同じ要求を送りました。</p>
          <Code
            lang="text"
            title="本番環境のログ（RAILS_ENV=production。同じ2つの要求）"
            code={`
[db1ec7d7-3323-433e-b3b9-844268dc6613] Started GET "/price?quantity=2" for 172.29.0.1 at 2026-11-16 07:11:19 +0000
[db1ec7d7-3323-433e-b3b9-844268dc6613] Processing by PricesController#show as */*
[db1ec7d7-3323-433e-b3b9-844268dc6613]   Parameters: {"quantity" => "2"}
[db1ec7d7-3323-433e-b3b9-844268dc6613] Completed 500 Internal Server Error in 7ms (ActiveRecord: 0.0ms (0 queries, 0 cached) | GC: 0.0ms)
[db1ec7d7-3323-433e-b3b9-844268dc6613]
[db1ec7d7-3323-433e-b3b9-844268dc6613] TypeError (String can't be coerced into Integer):
[db1ec7d7-3323-433e-b3b9-844268dc6613]
[db1ec7d7-3323-433e-b3b9-844268dc6613] lib/price_calculator.rb:3:in 'Integer#*'
[db1ec7d7-3323-433e-b3b9-844268dc6613] lib/price_calculator.rb:3:in 'PriceCalculator#total'
[db1ec7d7-3323-433e-b3b9-844268dc6613] app/controllers/prices_controller.rb:3:in 'PricesController#show'
[033d908d-fe50-402d-aa1e-1435fb747c34] Started GET "/articles/1" for 172.29.0.1 at 2026-11-16 07:11:20 +0000
[033d908d-fe50-402d-aa1e-1435fb747c34] Processing by ArticlesController#show as */*
[033d908d-fe50-402d-aa1e-1435fb747c34]   Parameters: {"id" => "1"}
[033d908d-fe50-402d-aa1e-1435fb747c34]   Rendered layout layouts/application.html.erb (Duration: 18.5ms | GC: 0.0ms)
[033d908d-fe50-402d-aa1e-1435fb747c34] Completed 200 OK in 79ms (Views: 16.0ms | ActiveRecord: 13.6ms (2 queries, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            違いは2つあります。1つ目は行の先頭の <code>[db1ec7d7-…]</code> で、要求ごとに付く番号（リクエスト ID）です。本番環境では複数の要求を同時に処理するので、別々の要求の行が混ざって出力されます。rails new
            が作る config/environments/production.rb の <code>config.log_tags = [ :request_id ]</code> がこの番号を行に付け、同じ番号の行を選べば1件の要求の記録だけを取り出せます。2つ目は、SQL
            の行が無いことです。ログの各行には重要度（ログレベル。debug・info・warn・error など）があり、設定したレベルより低い行は出力されません。production.rb のログレベルは info で、SQL
            の行は debug なので出ません<Ref n={1} /><Ref n={14} />。
          </p>
        </>
      ),
    },
    {
      id: 'backtrace',
      title: '例外とバックトレースを読む',
      body: (
        <>
          <p>
            <Term en="exception">例外</Term>は、処理を続けられないエラーが起きたことを表す Ruby のオブジェクトです。エラーが起きると Ruby は例外を発生させ、その時点の処理を中断します。rescue
            で受け止めなければ、例外はメソッドの呼び出し元へ順に伝わり、最後はプログラムが止まります<Ref n={13} />。Rails では、アクションで受け止められなかった例外を Rails が受け止め、ステータス
            500 などのエラーの応答に変えます（<ChapterLink n={10} section="exceptions" />）。
          </p>
          <p>/price と同じエラーを、Rails を使わない Ruby のファイルで起こしました。</p>
          <Code
            lang="ruby"
            title="price.rb"
            code={`
class PriceCalculator
  def total(unit_price, quantity)
    subtotal = unit_price * quantity
    subtotal + 500
  end
end

def checkout(params)
  PriceCalculator.new.total(1200, params[:quantity])
end

puts checkout({ quantity: 2 })
puts checkout({ quantity: "2" })
`}
          />
          <Code
            lang="text"
            title="ruby price.rb の出力（Ruby 4.0.9）"
            code={`
2900
price.rb:3:in 'Integer#*': String can't be coerced into Integer (TypeError)

    subtotal = unit_price * quantity
                            ^^^^^^^^
	from price.rb:3:in 'PriceCalculator#total'
	from price.rb:9:in 'Object#checkout'
	from price.rb:13:in '<main>'
`}
          />
          <p>
            12行目の整数の2では 2900 と表示され、13行目の文字列の "2" で例外が起きました。2行目は、例外が起きた場所（price.rb の3行目の、Integer の * メソッドの中）、メッセージ（文字列を整数に変えられない）、例外のクラス（TypeError）です。^^^^^^^^
            は、原因になった式の位置を示します。
          </p>
          <p>
            from で始まる行は、例外が起きた時点で実行の途中だったメソッドの呼び出しを、新しいものから順に並べたものです。この並びを<Term>バックトレース</Term>
            （スタックトレース）と呼びます。下から読むと、ファイルの一番外側（&lt;main&gt;）の13行目が checkout を呼び、checkout の9行目が total を呼び、total の3行目の掛け算で例外が起きたことが分かります。例外が起きたのは
            Ruby の Integer#* の中ですが、直すのは自分のコードです。上から順に見て最初に出てくる自分のコードの行（price.rb:3）から読み始め、そこに渡された値がどこから来たかを、下の行へたどります。
          </p>
          <p>次の図は、上の出力のバックトレースの4行を、出力と同じ順に上から並べたものです。左の矢印が呼び出した順、右の矢印が調べる順を表します。</p>
          <Figure title="バックトレースの行と呼び出しの順" caption="ruby price.rb の出力をもとにした図。1行目のメッセージは … で省いた。実線の矢印は呼び出した順、強調色の矢印は調べる順、強調色の枠は最初に読む行を表す。">
            <BacktraceOrderFigure />
          </Figure>
          <p>rescue で例外を受け止めると、例外のオブジェクトからクラス・メッセージ・バックトレースを取り出せます。</p>
          <Code
            lang="ruby"
            title="rescue.rb（price_lib.rb は price.rb の PriceCalculator のクラスだけを書いたファイル）"
            code={`
require_relative "price_lib"

begin
  PriceCalculator.new.total(1200, "2")
rescue TypeError => e
  puts "クラス:     #{e.class}"
  puts "メッセージ: #{e.message}"
  puts "バックトレース:"
  puts e.backtrace
end
puts "rescue したので、処理はここまで進む"
`}
          />
          <Code
            lang="text"
            title="ruby rescue.rb の出力"
            code={`
クラス:     TypeError
メッセージ: String can't be coerced into Integer
バックトレース:
/ex/price_lib.rb:3:in 'Integer#*'
/ex/price_lib.rb:3:in 'PriceCalculator#total'
rescue.rb:4:in '<main>'
rescue したので、処理はここまで進む
`}
          />
          <p>
            Rails のアプリケーションで例外が起きたときも、同じ情報が出ます。開発環境で /price?quantity=2 をブラウザーで開くと、Rails は例外の情報を並べたエラーの画面を返します（図 32-2）。Extracted source
            は例外が起きた行の前後のソースで、3行目が強調されます。Application Trace はバックトレースのうちアプリケーションのファイル（app や lib）の行だけ、Framework Trace は Rails などの gem
            の行だけ、Full Trace はすべての行です。前の節のログに出た3行も、Application Trace と同じ行です。Request の Parameters を見れば、quantity が文字列の "2" で届いたことも分かります。
          </p>
          <p>
            この画面は、設定の <code>config.consider_all_requests_local</code> が true のとき（開発環境とテスト環境の既定）に表示されます。本番環境では false なので、利用者にはソースやパラメーターを含まない汎用のエラーの画面が返り、調査にはログを使います
            <Ref n={14} />。
          </p>
          <Figure n="32-2" title="開発環境のエラー画面" caption="デモのコピーで /price?quantity=2 を開いた画面をもとにした図。パスの先頭の /work/demo/ を省き、Request の下の欄を省略した。">
            <ErrorPageFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'breakpoint',
      title: 'ブレークポイントで実行を止める',
      body: (
        <>
          <p>
            バックトレースから、例外が起きた行と、そこまでの呼び出しが分かりました。次に知りたいのは、その時点の変数の値です。手軽な方法は p で値を表示する行を足して実行し直すことです。
          </p>
          <Code
            lang="ruby"
            title="p_debug.rb と出力"
            code={`
class PriceCalculator
  def total(unit_price, quantity)
    p quantity
    p quantity.class
    subtotal = unit_price * quantity
    subtotal + 500
  end
end

PriceCalculator.new.total(1200, "2")

# 出力
"2"
String
p_debug.rb:5:in 'Integer#*': String can't be coerced into Integer (TypeError)
`}
          />
          <p>
            p は値を inspect の形で表示するので、文字列には引用符が付きます。"2" と String が表示されたので、quantity は文字列でした。ただし、ほかの値を見たくなるたびに、コードを書き換えて実行し直す必要があります。
          </p>
          <p>
            デバッガは実行中のプログラムを途中で止め、その時点の変数を調べる道具です。止める場所を<Term en="breakpoint">ブレークポイント</Term>と呼びます。Ruby の debug gem
            ではコードに <code>binding.break</code> を書くと、実行がその行に来たところで止まり、端末に (rdbg) という入力の印（プロンプト）が出ます。止まっている間は、p で変数を表示し、bt
            でバックトレースを表示し、c（continue）で実行を再開できます<Ref n={2} />。
          </p>
          <Code
            lang="ruby"
            title="break.rb"
            code={`
require "debug"

class PriceCalculator
  def total(unit_price, quantity)
    binding.break
    subtotal = unit_price * quantity
    subtotal + 500
  end
end

puts PriceCalculator.new.total(1200, "2")
`}
          />
          <Code
            lang="text"
            title="ruby break.rb の画面（Ruby 4.0.9・debug 1.11.1。色の指定と入力の補足表示を除いた）"
            code={`
[1, 10] in break.rb
     1| require "debug"
     2|
     3| class PriceCalculator
     4|   def total(unit_price, quantity)
=>   5|     binding.break
     6|     subtotal = unit_price * quantity
     7|     subtotal + 500
     8|   end
     9| end
    10|
=>#0	PriceCalculator#total(unit_price=1200, quantity="2") at break.rb:5
  #1	<main> at break.rb:11
(rdbg) p quantity
=> "2"
(rdbg) p quantity.class
=> String
(rdbg) p unit_price
=> 1200
(rdbg) bt
=>#0	PriceCalculator#total(unit_price=1200, quantity="2") at break.rb:5
  #1	<main> at break.rb:11
(rdbg) c
break.rb:6:in 'Integer#*': String can't be coerced into Integer (TypeError)
`}
          />
          <p>
            止まると、まわりのソースが表示され、=&gt; の付いた5行目が次に実行する行です。その下の #0 と #1 は止まった時点の呼び出しの並び（バックトレース）で、#0 には total
            に渡された引数（unit_price=1200、quantity="2"）も出ます。停止中は <code>p quantity</code> で値を、<code>p quantity.class</code> で型を確認できます。この例では数量は文字列で、整数を使う計算にそのまま渡っています。c で再開すると、6行目で TypeError が起きました。
          </p>
          <p>
            rails new が作る Gemfile には、開発環境とテスト環境で使う debug gem が入っています。コントローラーやモデルに <code>debugger</code>（binding.break と同じ）を書いて要求を送ると、
            <code>bin/rails server</code> を起動した端末に (rdbg) が出ます<Ref n={1} />。ここまでで、応答・ログ・例外とバックトレース・止めた時点の値という4つの手掛かりを見ました。次の節からはこれらを使って不具合を再現し、原因を絞り、修正を確かめるまでの進め方と、業務のアプリケーションで使われる調査用の
            gem を扱います。
          </p>
        </>
      ),
    },
    { id: 'workflow', title: '再現条件を固定して期待と実際を比べる', body: <>
      <p>デバッグでは、期待した結果と実際の結果が分かれた位置を探し、なぜそうなったかを確かめます。第1章では調査用のコマンドを紹介しました。本章では、どの場面で何を調べ、修正の確認までどう進めるかを扱います。</p>
      <p>最初に、操作順、入力、期待する結果、実際の結果を揃えます。同じ画面でも、利用者の権限、データの状態、環境変数、実行しているコードのバージョンによって動きが変わります。ローカルで作った架空のデータで再現できれば、調べる範囲を狭められます。失敗したリクエストやジョブを識別するIDは、複数のログを結び付ける手掛かりになります。</p>
      <Figure n="32-3" title="再現から修正確認まで" caption="模式図。観察で仮説が外れたら、条件を整理して調べ直します。"><InvestigationFigure /></Figure>
      <p>値がおかしいのか、例外が発生したのか、応答が遅いのかで道具を選びます。停止するデバッガは値の調査に向きますが、止めた時間が混ざるので応答時間の測定には向きません。ログを増やす場合も、調べたい値と期間を絞ります。<Ref n={1} /></p>
    </> },
    { id: 'environments', title: '教材の環境と参照した業務アプリの構成', body: <>
      <p>教材のdebugの例はRuby 4.0.9とdebug 1.11.1で確認しました。一方、参照した業務アプリはRuby 3.4.8、Rails 8.1.2です。以下は2026年11月12日にGemfile・Gemfile.lockと設定から確認した構成です。業務アプリのコードやデータを例として転載せず、以下の調査例は独立した小さな題材を使います。</p>
      <div className="table-wrap"><table><thead><tr><th>gemと固定されたバージョン</th><th>役割</th><th>Gemfile上の範囲</th></tr></thead><tbody>
        <tr><td>pry 0.16.0 / pry-byebug 3.12.0 / pry-rails 0.3.11</td><td>対話的な調査とステップ実行</td><td>pry-byebugは開発・テスト、pry-railsはグループ指定なし</td></tr>
        <tr><td>better_errors 2.10.1 / binding_of_caller 1.0.1</td><td>例外画面と呼び出しごとの変数</td><td>開発・テスト</td></tr>
        <tr><td>web-console 4.2.1</td><td>ブラウザー内のRubyコンソール</td><td>開発</td></tr>
        <tr><td>bullet 8.1.0</td><td>N+1や不要な先読みの検出</td><td>開発・テスト</td></tr>
        <tr><td>rack-mini-profiler 4.0.1</td><td>リクエストとSQLの性能調査</td><td>開発</td></tr>
        <tr><td>letter_opener_web 3.0.0</td><td>メールの確認</td><td>開発・テスト・ステージング</td></tr>
        <tr><td>honeybadger 6.3.0 / lograge 0.14.0</td><td>例外通知とログの整理</td><td>グループ指定なし</td></tr>
      </tbody></table></div>
      <p>Gemfileのグループ指定は、実際にその環境で機能が有効であることまで保証しません。Bundlerの除外設定、初期化処理、ミドルウェア（要求がアクションに届く前後で処理を加える部品。<ChapterLink n={6} section="middleware" />）の順序も確認します。業務アプリにはdebugの直接指定はなく、Pry系が宣言されていました。debugとpry-byebugは、同じ停止位置に両方を差し込まず、調査ごとに使う道具を決めます。</p>
      <Callout title="確認済みの範囲"><p>業務アプリのDocker Compose環境で、上表の解決済みバージョンとpry-byebug・better_errorsの読み込みを確認しました。Pryの停止・ステップ実行も独立したRubyファイルで確認しています。ブラウザー内のgemの画面、メール配信、外部への例外送信は実行していません。設定例は各gemの公式資料と照合しています。</p></Callout>
    </> },
    { id: 'debug', title: 'debugで止めて値と型を確認する', body: <>
      <p>次の計算処理は、単価と数量を掛け、送料500円を加える例です。数量に文字列の "2" が渡ると例外になります。フォームなどから受け取った値を、想定した型のまま使っていないか調べます。<Term en="breakpoint">ブレークポイント</Term>は、実行を一時停止する位置や条件のことです。</p>
      <Code lang="ruby" title="lib/price_calculator.rb：不具合を再現する小さな例" code={`
class PriceCalculator
  def total(unit_price, quantity)
    subtotal = unit_price * quantity
    subtotal + 500
  end
end
`} />
      <Code lang="ruby" title="debugを使用する開発・テスト環境のGemfileの例" code={`
group :development, :test do
  gem "debug", require: "debug/prelude"
end
`} />
      <Code lang="ruby" title="停止位置を入れる場合：totalの先頭に一時的に追加" code={`
binding.break
# debugger も binding.break の別名
`} />
      <p>Railsで読み込んだdebugを使う場合は、端末からリクエスト処理やテストを起動し、その端末に出る (rdbg) プロンプトで操作します。普通のRubyファイルなら require "debug" が必要です。教材の実測では、クラスを定義した後に停止し、メソッドへのブレークポイントを設定してから計算を呼びました。<Ref n={2} /></p>
      <Code lang="text" title="debug 1.11.1の実測から、確認に必要な部分を抜粋" code={`
(rdbg) break PriceCalculator#total
(rdbg) continue
# totalに入り、掛け算の行の前で停止
(rdbg) p quantity
=> "2"
(rdbg) p quantity.class
=> String
(rdbg) bt
#0 PriceCalculator#total(unit_price=1200, quantity="2")
#1 <main>
`} />
      <p>文字列に数字が入っていることと、整数であることは違います。次に呼び出し元でその値がどこから来たかを確認します。その場で quantity = 2 と書き換えると処理が進む場合がありますが、それは停止中の状態を変えただけです。元のコードを修正したことにはならないので、再実行とテストが必要です。</p>
      <div className="table-wrap"><table><thead><tr><th>debugのコマンド</th><th>調べること</th></tr></thead><tbody>
        <tr><td>next / n</td><td>呼び出したメソッドの内部へ入らず、次の行へ進む</td></tr>
        <tr><td>step / s</td><td>呼び出したメソッドの内部も追う</td></tr>
        <tr><td>finish / fin</td><td>現在のメソッドを抜けるまで進む</td></tr>
        <tr><td>continue / c</td><td>次の停止条件まで実行する</td></tr>
        <tr><td>bt / frame / up / down</td><td>呼び出し履歴を表示し、調べる実行状態を選ぶ</td></tr>
        <tr><td>p 式</td><td>選択中の実行状態で値を評価して表示する</td></tr>
      </tbody></table></div>
    </> },
    { id: 'exceptions', title: '例外と条件付きブレークポイントで範囲を絞る', body: <>
      <p>大量のリクエストやループのすべてで止めると、目的の状態へたどり着くのに時間がかかります。debugは、停止条件を付けたり、特定の例外が発生した時点で止めたりできます。次の例は、メソッドの引数が文字列である場合にだけ止める指定です。<Ref n={2} /></p>
      <Code lang="text" title="debugの条件付き停止と例外の捕捉" code={`
(rdbg) break PriceCalculator#total if: quantity.is_a?(String)
(rdbg) catch TypeError
(rdbg) continue
`} />
      <p>catch TypeError は、TypeErrorが発生した時点を調べます。後でrescueされる例外でも止まるため、「レスポンスは返るが内部で失敗を握りつぶしている」ケースの調査にも使えます。実測では Integer#* の中で停止し、btでPriceCalculatorへ戻る経路を確認できました。</p>
      <p>呼び出し1回ごとの変数や実行位置を持つ状態を<Term en="stack frame">フレーム</Term>と呼びます。図32-4は、Rubyだけの実測例をRailsのコントローラーから呼ぶ構成へ広げた模式図です。例外が出た最深部だけでなく、入力を渡した側も調べます。</p>
      <Figure n="32-4" title="例外から入力の由来をたどる" caption="模式図。実際のフレーム番号はライブラリや停止位置によって変わります。"><FramesFigure /></Figure>
      <p>Rails内部へ進みたいときは、<ChapterLink n={1} />の owner・source_location と、停止中の呼び出し履歴を組み合わせます。全メソッドを順に追うより、期待と実際が分かれる処理の開始位置で止める方が、調べる範囲を限定できます。条件式も実行されるコードなので、DBへの更新など副作用のある式は使いません。</p>
    </> },
    { id: 'pry', title: 'pry-byebugとpry-rails：既存アプリの道具を使う', body: <>
      <p>Pryは、Rubyの式を対話的に実行し、オブジェクトやメソッドを調べるコンソールです。Pry単体と、実行を1行ずつ進める機能は区別します。pry-byebugはPryにステップ実行と呼び出し履歴の移動を追加し、pry-railsはRails consoleへの組み込みやRails向けの調査コマンドを提供します。<Ref n={3} /><Ref n={4} /><Ref n={5} /></p>
      <Code lang="ruby" title="pry-byebugを使う場合：totalの先頭で停止する" code={`
require "pry-byebug" # RailsでBundlerが読み込み済みなら不要
class PriceCalculator
  def total(unit_price, quantity)
    binding.pry
    subtotal = unit_price * quantity
    subtotal + 500
  end
end
PriceCalculator.new.total(1200, 2)
`} />
      <Code lang="text" title="Ruby 3.4.8・pry-byebug 3.12.0での確認例" code={`
[1] pry(...)> quantity
=> 2
[2] pry(...)> quantity.class
=> Integer
[3] pry(...)> next
[3] pry(...)> subtotal
=> 2400
[4] pry(...)> continue
# メソッドの戻り値は2900
`} />
      <p>debugでは n・s・c の短縮形を使えますが、pry-byebugでは同じ短縮形を当然に使えるとは限りません。既定では変数名との衝突を避けるため短縮形がなく、next・step・continueのように書きます。使用中のプロンプトが (rdbg) か pry かを確認します。<Ref n={4} /></p>
      <Code lang="text" title="Pryとpry-railsの調査コマンドの例" code={`
show-source PriceCalculator#total
ls PriceCalculator
show-models
show-routes --grep articles
`} />
      <p>show-source はメソッドの実装を読み、ls はメソッドなどを一覧にします。show-modelsとshow-routesはpry-railsの機能です。これらのコマンドは普通のRubyの式ではなく、Pryのプロンプトで使います。アプリの構造確認には便利ですが、全モデルを読み込むことがあるため、大きなアプリでは対象を絞るか通常のRailsコマンドも使います。</p>
      <h3>Docker Composeで入力できる端末を使う</h3>
      <Code lang="bash" title="appサービスを持つ開発環境での起動例" code={`
# consoleやテストを対話できる端末で起動する
# 起動済みの必要な開発用サービスに接続する設定を前提とする
docker compose run --rm app bundle exec rails console
docker compose run --rm app bundle exec rspec spec/services/price_calculator_spec.rb
`} />
      <p>サーバーのログを眺めるだけでは、別プロセスに出たPryの入力先にはなりません。停止位置を通るプロセスの標準入力（プログラムが入力を読み取る先。端末から起動したプログラムなら、その端末のキーボード）につながった端末が必要です。参照したCompose設定には、端末を割り当てる tty と、標準入力を開いておく stdin_open がありました。ただし、-dを付けてバックグラウンドで起動したサーバーへ接続する方法は、実際の起動コマンドやプロセス管理によって異なります。まずconsoleや単独のspecで再現すると、入力先を揃えやすくなります。</p>
    </> },
    { id: 'browser-tools', title: 'better_errors・binding_of_caller・web-console', body: <>
      <p>better_errorsは、例外のソース位置、呼び出し履歴、変数を調べやすいエラー画面を提供します。binding_of_callerは、呼び出し履歴にある実行状態へアクセスするための補助gemです。この2つを組み合わせると、各フレームで変数を確認したりRubyの式を評価したりできます。<Ref n={6} /></p>
      <p>web-consoleは、ブラウザー内にRubyの対話コンソールを表示するgemです。エラー時だけでなく、ビューに一時的にconsoleを置いて、そのビューで参照できる値を調べる使い方もあります。第20章のテンプレートの変数が想定どおりか調べる場面に向きます。<Ref n={7} /></p>
      <Code lang="erb" title="web-consoleを有効にした開発環境での、一時的な調査例" code={`
<% console %>
`} />
      <p>例えば、画面に値が出ないときは、変数がnilなのか、空の配列なのか、別のオブジェクトなのかを確認します。consoleで式を実行して結果が分かれば、次に値を設定したコントローラーへ調査を戻します。エラーを捕捉した時点の変数を見ることと、その前の処理をステップ実行することは違います。</p>
      <Callout kind="warn"><p>これらのコンソールはサーバー上でRubyを実行できます。教材の例はローカル開発用です。参照アプリの許可IP設定をそのまま複製せず、Docker越しに使う場合も必要な接続元に限定します。両方を入れた場合にどちらのエラー画面が出るかは、実際のミドルウェア構成で確認します。調査のために本番のエラー画面を公開する運用にはしません。</p></Callout>
    </> },
    { id: 'bullet', title: 'BulletでN+1を見つけてSQLで修正を確認する', body: <>
      <p>Bulletは、関連の読み込み方を監視し、N+1や使われなかった先読み、counter_cacheが使えそうな場面を通知します。すべてのSQLの性能を判定する機能ではありません。<ChapterLink n={13} section="n-plus-one-check" />で見たSQLログの確認と組み合わせます。<Ref n={8} /></p>
      <Code lang="ruby" title="開発環境の最小設定例" code={`
# config/environments/development.rb
config.after_initialize do
  Bullet.enable = true
  Bullet.bullet_logger = true
  Bullet.rails_logger = true
  Bullet.add_footer = true
end
`} />
      <p>一覧で記事ごとにauthorを読んだときの警告なら、その一覧の取得処理を探します。preload(:author)などで必要な関連をまとめて取得し、同じ画面・同じデータで再確認します。警告が消えたことに加え、SQLの回数と表示内容を確かめます。先読みが多すぎるという警告なら、表示に必要な関連を見直します。</p>
      <p>参照アプリは、開発環境でログと画面への通知を有効にし、テスト環境では Bullet.raise = true を指定していました。ただしraiseの指定だけで、すべての種類のspecが自動的に監視対象になるわけではありません。リクエストのミドルウェアを通らないサービスのspecなどでは、検出を開始して結果を通知する範囲を用意します。</p>
      <Code lang="ruby" title="ミドルウェアを通さない単独spec向けの監視範囲の例" code={`
# Bullet.enable = true / Bullet.raise = true をテスト環境で設定済み
# 通常のリクエストの監視と二重に囲まない
RSpec.describe "記事一覧の関連読み込み" do
  it "N+1の警告を出さない" do
    # この位置で、著者の異なる記事を複数件用意しておく
    Bullet.start_request
    begin
      Article.preload(:author).limit(5).each { |article| article.author&.name }
      Bullet.perform_out_of_channel_notifications if Bullet.notification?
    ensure
      Bullet.end_request
    end
  end
end
`} />
      <p>検出できるデータを用意しないと、問題のあるコードでもテストが通ります。また参照アプリには、特定のspecで検出を無効にする指定もありました。例外指定を増やして警告を消す前に、検出の根拠と許容する理由を確認します。strict_loadingはRailsの関連の遅延読み込みを制限し、Bulletは監視結果から候補を通知する、という違いがあります。</p>
    </> },
    { id: 'profiling', title: 'rack-mini-profilerで遅い処理を絞り込む', body: <>
      <p>処理にかかった時間を測り、内訳を調べることを<Term en="profiling">プロファイリング</Term>と呼びます。rack-mini-profilerは、HTMLページに処理時間の表示を加え、SQLなどの内訳を確認する道具です。参照アプリでは開発環境のGemfileに含まれていました。<Ref n={9} /></p>
      <Code lang="ruby" title="開発環境への導入例：DBのgemより後に置く" code={`
gem "mysql2"
group :development do
  gem "rack-mini-profiler"
end
`} />
      <p>遅い画面を開き、まずSQLに時間がかかるのか、それ以外の処理に時間がかかるのかを分けます。同じSQLが多数あればN+1を疑い、1回のSQLが遅ければ実行計画や索引を調べます。Ruby側の処理に時間がかかるなら、呼び出しごとの内訳を見る段階へ進みます。具体的な計測の考え方は<ChapterLink n={22} />と共通です。</p>
      <p>呼び出しの積み重なりと時間の割合を帯で表した図を<Term en="flame graph">フレームグラフ</Term>と呼びます。rack-mini-profilerでこの表示を使うにはstackprofなどの追加gemが必要です。メモリーの内訳にはmemory_profilerを追加できます。参照アプリのGemfileでは両者の直接指定は確認していないため、本章では追加候補として紹介します。<Ref n={9} /></p>
      <p>初回の読み込み、キャッシュ、データ量で時間は変わります。同じ条件で複数回測り、計測用ツール自体の負荷も考慮します。処理時間が短くなっても、必要な関連を落として表示が欠けていれば改善にはなりません。修正後は機能の確認と性能の確認を両方行います。</p>
      <Figure n="32-5" title="症状に合わせた調査用gemの選択" caption="用途の対応図。すべてを同時に使う必要はありません。"><ToolsFigure /></Figure>
    </> },
    { id: 'mail', title: 'letter_opener_webでメールを確認する', body: <>
      <p>メールの宛先や本文を調べるときは、実際に外へ送る前に、開発環境で生成結果を確認します。letter_opener_webは保存されたメールをブラウザーで読むための画面を提供します。delivery_methodを :letter_opener_web にすると、メールをこの仕組みに渡します。<Ref n={10} /></p>
      <Code lang="ruby" title="ローカル開発環境の設定例" code={`
# config/environments/development.rb
config.action_mailer.delivery_method = :letter_opener_web

# config/routes.rb の routes.draw 内
if Rails.env.development?
  mount LetterOpenerWeb::Engine, at: "/letter_opener"
end
`} />
      <p>参照アプリにも、この配信方法と /letter_opener のルートがありました。教材では開発環境だけに限定した例を示しています。差出人、宛先、件名、本文、リンク先を確認し、HTML版とテキスト版に差がないかを調べます。ここで表示できても、外部メールサービスが受信先へ届けることまで確認できたわけではありません。</p>
      <p>deliver_laterを使う場合は、<ChapterLink n={18} />のジョブが実際に動いて初めてメールが生成されます。別コンテナでジョブを実行する構成では、生成側と閲覧側が保存場所を共有する必要があります。画面に何もないときは、Mailerだけでなく、ジョブの実行と保存先まで追います。保存したメールにも個人情報が入り得るので、教材の検証には架空の宛先と本文を使います。</p>
    </> },
    { id: 'logs-errors', title: 'LogrageとHoneybadgerでリクエスト・例外を追う', body: <>
      <p>停止できない環境では、ログと例外の記録が調査の出発点になります。Logrageは、Railsのリクエストに関するログを整理して出力するgemです。参照アプリでは本番用の設定にJSON形式（名前と値の組を決まった書き方で並べる、データの形式）が指定されていました。時刻、リクエストID、処理名、ステータス、所要時間などを使い、関係する記録を検索します。<Ref n={11} /></p>
      <Code lang="ruby" title="説明用：リクエストIDを付けるLogrageの設定例" code={`
config.lograge.enabled = true
config.lograge.formatter = Lograge::Formatters::Json.new
config.lograge.custom_payload do |controller|
  { request_id: controller.request.request_id }
end
`} />
      <p>Honeybadgerは例外の発生を記録・通知する仕組みです。例外の種類と呼び出し履歴、例外が発生したときのバージョン、関連する処理の情報を見て再現条件を探します。参照アプリにも、捕捉した例外をnotifyする呼び出しがありました。本章の調査では外部への送信はしていません。<Ref n={12} /></p>
      <Code lang="ruby" title="説明用：捕捉した例外に、調査に必要な情報だけを添える" code={`
begin
  ExternalService.sync_catalog
rescue ExternalService::Timeout => error
  Honeybadger.notify(error, context: { operation: "catalog_sync" })
  raise
end
`} />
      <p>例の外部サービスと例外クラスは仮の名前です。自動通知される例外を手動でも送ると重複する場合があるので、アプリの通知設定と捕捉方法に合わせます。contextは例外に添える情報です。リクエストの全パラメーター、Cookie、トークン、認証情報、メール本文などを一括で渡さず、必要な識別情報を選びます。例のraiseは例外を再送出します。これを取り除いて例外を呼び出し元に伝えないようにすると、ジョブの再試行など元の制御も変えてしまいます。</p>
    </> },
    { id: 'regression', title: '修正をテストに残して調査を終える', body: <>
      <p>
        修正前の画面では、数量が整数の <code>2</code> なら合計は 2900 円、フォームから来た文字列の <code>"2"</code> だと掛け算で例外になりました。この計算では、正の整数と、それを10進数で書いた文字列を受け付けたいとします。単価は整数で渡す前提です。
      </p>
      <p>
        <code>Integer(quantity.to_s, 10)</code> は引数を文字列にそろえ、10進数の整数として読み取ります。<code>"abc"</code> や空欄ならここで例外になり、0 や負数は次の <code>positive?</code> の行で拒否します。数字以外を <code>to_i</code> で 0 にしてしまうと、入力が不正だったのか、実際に 0 を指定したのかを区別できません。
      </p>
      <Code lang="ruby" title="lib/price_calculator.rb：仕様を明示した修正例" code={`
class PriceCalculator
  def total(unit_price, quantity)
    quantity = Integer(quantity.to_s, 10)
    raise ArgumentError, "quantity must be positive" unless quantity.positive?
    unit_price * quantity + 500
  end
end
`} />
      <Code lang="ruby" title="spec/services/price_calculator_spec.rb：不具合の再発を検出する例" code={`
require "spec_helper"
require_relative "../../lib/price_calculator"

RSpec.describe PriceCalculator do
  subject(:calculator) { described_class.new }

  it "数字の文字列を数量として扱う" do
    expect(calculator.total(1200, "2")).to eq(2900)
  end

  it "整数の数量も扱う" do
    expect(calculator.total(1200, 2)).to eq(2900)
  end

  it "不正な数量を拒否する" do
    ["abc", "", "0", "-1"].each do |quantity|
      expect { calculator.total(1200, quantity) }.to raise_error(ArgumentError)
    end
  end
end
`} />
      <p>この3つのテストは、Ruby 4.0.9で修正前に2件が失敗し、修正後にはすべて通ることを確認しました。修正前の失敗を確かめると、元の不具合を検出できるテストになっているか判断できます。必要ならリクエストのテストも追加し、不正な入力にどう応答するかを確認します。単独のRubyのテストが通っても、コントローラーでのエラー処理まで確認したことにはなりません。</p>
      <p>最後に、一時的なbinding.break・binding.pry・consoleや詳細ログを取り除きます。停止によってタイムアウトやロック待ちが起きていた場合は、通常の速度で再実行します。「どの条件で再現したか」「どの値が期待と違ったか」「どのテストで修正を確認したか」を残すと、同じ症状が出たときの調査にも使えます。</p>
      <Callout kind="v72"><p>ここで扱うgemはRailsとは別にバージョンが決まります。Rails 7.2から8.xへ上げる場合も、debuggerのコマンドや検出gemの対応状況はGemfile.lockと各gemの資料で確認します。Ruby 3.4で動いたpry-byebugを、そのままRuby 4.0でも確認済みとは扱いません。</p></Callout>
    </> },
    {
      id: 'dependency-and-review',
      title: "変更を PR にまとめてレビューする",
      body: (
        <>
          <p>
            この数量の修正をプルリクエスト（PR）に出すなら、「フォームからの数量は文字列で届くため、掛け算で例外になっていた」と理由を書けます。確認結果には「数量が <code>"2"</code> でも整数の <code>2</code> でも 2900 円、不正な数量では例外」と残します。レビューする人は、テストの入力と期待値をこの説明に照らして読めます。<Ref n={17} />
          </p>
          <p>
            提出前には一時的な <code>binding.break</code> や調査用の出力が差分に残っていないかを確認します。データや権限も変更する PR なら、失敗したときに何が残るか、配備の順番に条件があるかも書き添えます。レビューでは修正が必要な指摘と任意の提案に、その理由と確認方法を添えます。
          </p>
          <p>
            変更を見直すときは、Rails のリリースノート、対象バージョンのガイドとソース、手元の再現条件をつなぎます。Ruby や Rails のコミュニティで事例を持ち寄ると、文書に載らない選択の背景も学べます。
          </p>
        </>
      ),
    },
    { id: 'summary', title: 'まとめ', body: <ul>
      <li>着手前に期待する動作と受け入れ条件を決めます。見積もりには前提を書き、gem を加える場合は互換性・依存関係・保守状況を確かめます。</li>
      <li>Rails のログは要求ごとに Started から Completed までの行で、アクション・params・SQL・ステータスを記録します。このデモの本番設定では要求 ID が付きます。SQL の詳細が出るかはログレベルなどの設定で変わります。</li>
      <li>バックトレースは例外が起きた時点の呼び出しの並びで、上ほど新しい呼び出しです。最初に出てくる自分のコードの行から読み、ブレークポイントで止めて値と型を確かめます。</li>
      <li>再現条件を固定し、値と型、例外、呼び出し元から期待と実際の違いを調べます。</li>
      <li>debugとpry-byebugのプロンプトやコマンドを区別し、入力できる端末で使います。</li>
      <li>Better Errors・web-consoleは例外や変数、Bulletは関連読み込み、rack-mini-profilerは処理時間の調査に使います。</li>
      <li>メールの生成・保存・実配送、ログの記録・例外の外部通知は、それぞれ別に確認します。</li>
      <li>元の不具合を再現するテストと周辺ケースを確かめ、一時的な停止位置を除いて調査を終えます。</li>
      <li>PR に変更理由・確認した手順・データ変更や配備の影響を残し、仕様、権限、失敗時の整合性、性能をレビューします。</li>
    </ul> },
  ],
  sources: [
    { title: 'Debugging Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/debugging_rails_applications.html', accessed: '2026-11-12', version: 'Rails 8.1', note: 'ログ、debug、web-consoleによる調査。' },
    { title: 'ruby/debug README', publisher: 'ruby/debug（GitHub）', url: 'https://github.com/ruby/debug', accessed: '2026-11-12', note: '停止、条件付きブレークポイント、catch、フレームの移動。教材での実測は1.11.1。' },
    { title: 'Pry README', publisher: 'pry/pry（GitHub）', url: 'https://github.com/pry/pry', accessed: '2026-11-12', note: 'binding.pry、show-source、ls、対話的なオブジェクト調査。' },
    { title: 'pry-byebug README', publisher: 'deivid-rodriguez/pry-byebug（GitHub）', url: 'https://github.com/deivid-rodriguez/pry-byebug', accessed: '2026-11-12', note: 'ステップ実行、フレーム移動、短縮形の扱い。実測は3.12.0。' },
    { title: 'pry-rails README', publisher: 'pry/pry-rails（GitHub）', url: 'https://github.com/pry/pry-rails', accessed: '2026-11-12', note: 'Rails consoleへの組み込み、show-models、show-routes。' },
    { title: 'Better Errors README', publisher: 'BetterErrors/better_errors（GitHub）', url: 'https://github.com/BetterErrors/better_errors', accessed: '2026-11-12', note: 'エラー画面、binding_of_callerによる高度な機能、開発環境での利用。' },
    { title: 'Web Console README', publisher: 'rails/web-console（GitHub）', url: 'https://github.com/rails/web-console', accessed: '2026-11-12', note: 'console、許可する接続元、任意のRubyコードを実行できること。' },
    { title: 'Bullet README', publisher: 'flyerhzm/bullet（GitHub）', url: 'https://github.com/flyerhzm/bullet', accessed: '2026-11-12', note: '検出対象、通知設定、RSpecなどでの検出範囲の管理。' },
    { title: 'rack-mini-profiler README', publisher: 'MiniProfiler/rack-mini-profiler（GitHub）', url: 'https://github.com/MiniProfiler/rack-mini-profiler', accessed: '2026-11-12', note: '処理時間とSQL、追加のstackprof・memory_profiler、gemの読み込み順。' },
    { title: 'letter_opener_web README', publisher: 'fgrehm/letter_opener_web（GitHub）', url: 'https://github.com/fgrehm/letter_opener_web', accessed: '2026-11-12', note: 'delivery_method、閲覧ルート、保存場所。' },
    { title: 'Lograge README', publisher: 'roidrage/lograge（GitHub）', url: 'https://github.com/roidrage/lograge', accessed: '2026-11-12', note: 'JSON形式、custom_payload、Railsのログの整理。' },
    { title: 'Honeybadger for Ruby', publisher: 'Honeybadger Docs', url: 'https://docs.honeybadger.io/lib/ruby/', accessed: '2026-11-12', note: '例外通知、context、機密情報のフィルタリングへの案内。外部送信は未実施。' },
    { title: 'class Exception', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Exception.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: '例外の発生と rescue、message と backtrace。実行例は Ruby 4.0.9 で実測。' },
    { title: 'Configuring Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'consider_all_requests_local の既定値（開発・テストは true、本番は false）、log_level の既定値（本番は info）、log_tags。' },
    { title: "RubyGems Command Reference", publisher: "RubyGems Guides", url: "https://guides.rubygems.org/command-reference/", accessed: "2026-11-20", note: "gem dependency による依存関係の確認。" },
    { title: "Securing Rails Applications", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/security.html", accessed: "2026-11-20", version: "Rails 8.1", note: "認証、セッション、CSRF、入力、アップロードの安全性。" },
    { title: "Reviewing changes in pull requests", publisher: "GitHub Docs", url: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests", accessed: "2026-11-20", note: "差分の確認とレビューの流れ。" },
  ],
}
export default withExplanations(ch28, explanation28)
