import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 86-1 書き込み用のモデルと参照用のモデル ---------- */
function ModelsFigure() {
  const sources = ['orders', 'order_items', 'products', 'categories', 'reviews']
  const views: { y: number; lines: string[]; fill: 'box5' | 'box4' }[] = [
    { y: 44, lines: ['daily_sales', '日付とカテゴリごとの売上：ジョブで作り直す'], fill: 'box5' },
    { y: 140, lines: ['product_searches', '1商品1行：変わった商品の行を作り直す'], fill: 'box5' },
    { y: 236, lines: ['検索エンジンの索引', '外部のサービス：変更を送って反映する'], fill: 'box4' },
  ]
  const links: [number, string][] = [
    [72, 'orders・order_items・products を集計'],
    [168, 'products・categories・reviews を結合'],
    [264, 'products などの変更を送る'],
  ]
  return (
    <Svg
      id="86-1"
      w={760}
      h={360}
      label="左は書き込み用のモデルで、正規化した orders、order_items、products、categories、reviews の表。右は参照用のモデルで、日付とカテゴリごとの売上を持つ daily_sales、1商品1行の product_searches、外部の検索エンジンの索引。daily_sales は orders・order_items・products を集計して作り、product_searches は products・categories・reviews を結合して作り、検索エンジンには products などの変更を送る。ダッシュボードと商品検索は右の表だけを読み、右の表はいつでも左の表から作り直せる"
    >
      <T x={20} y={22} bold>
        書き込み用のモデル（正しいデータ）
      </T>
      <rect x={14} y={34} width={172} height={282} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      {sources.map((name, i) => (
        <Box key={name} x={30} y={46 + i * 54} w={140} h={40} lines={name} fill="box4" mono />
      ))}
      <T x={470} y={22} bold>
        参照用のモデル（作り直せるデータ）
      </T>
      {views.map((v) => (
        <Box key={v.y} x={470} y={v.y} w={280} h={56} lines={v.lines} fill={v.fill} fs={12.5} subTone="muted" />
      ))}
      {links.map(([y, text]) => (
        <g key={text}>
          <Arrow x1={188} y1={y} x2={468} y2={y} dashed />
          <T x={328} y={y - 10} anchor="middle" fs={11} tone="muted">
            {text}
          </T>
        </g>
      ))}
      <T x={380} y={344} anchor="middle" fs={12}>
        ダッシュボードと商品検索は右の表だけを読む。右の表はいつでも左の表から作り直せる
      </T>
    </Svg>
  )
}

/* ---------- 図 86-2 参照用のモデルを更新する方式 ---------- */
const methodRows: { name: string[]; main: boolean; trigger: string[]; action: string[]; fresh: string[] }[] = [
  { name: ['全体を作り直す'], main: true, trigger: ['定期実行', '（毎晩など）'], action: ['RebuildDailySalesJob', '全期間を INSERT … SELECT'], fresh: ['作り直す間隔と、作り直しに', 'かかる時間の分だけ古い'] },
  { name: ['変わった部分だけ', '作り直す'], main: true, trigger: ['注文・レビューの COMMIT', '（after_commit）'], action: ['その日・その商品の行を', 'ジョブで作り直す'], fresh: ['ジョブが終わるまで古い', ''] },
  { name: ['書き込みと同時に', '加算する'], main: false, trigger: ['注文を保存する', 'トランザクションの中'], action: ['集計の行に', '今回の注文の分を足す'], fresh: ['常に最新。同じ行の更新が', '集中すると待ちが出る'] },
  { name: ['イベントで', '後から更新する'], main: false, trigger: ['イベントの発行', '（Domain Events・Outbox）'], action: ['購読者が参照用の', 'モデルを更新する'], fresh: ['反映までの遅れの分だけ古い。', '重複と欠落に備える'] },
]

function RefreshMethodsFigure() {
  const top = 44
  const step = 70
  return (
    <Svg
      id="86-2"
      w={780}
      h={top + methodRows.length * step + 6}
      label={`参照用のモデルを更新する4つの方式。${methodRows.map((r) => `${r.name.join('')}：きっかけは${r.trigger.join('')}、${r.action.join('')}。データの新しさは${r.fresh.join('')}`).join('。')}`}
    >
      <T x={85} y={22} anchor="middle" bold fs={12.5}>
        方式
      </T>
      <T x={266} y={22} anchor="middle" bold fs={12.5}>
        きっかけ
      </T>
      <T x={480} y={22} anchor="middle" bold fs={12.5}>
        更新する処理
      </T>
      <T x={680} y={22} anchor="middle" bold fs={12.5}>
        データの新しさ
      </T>
      {methodRows.map((r, i) => {
        const y = top + i * step
        return (
          <g key={r.name.join('')}>
            <Box x={10} y={y} w={150} h={56} lines={r.name} fs={12.5} fill={r.main ? 'box5' : 'box'} />
            <Box x={176} y={y} w={180} h={56} lines={r.trigger} fs={12} fill="bg" subTone="muted" />
            <Arrow x1={356} y1={y + 28} x2={378} y2={y + 28} />
            <Box x={380} y={y} w={200} h={56} lines={r.action} fs={12} fill="box" subTone="muted" />
            <T x={596} y={y + 22} fs={11.5}>
              {r.fresh[0]}
            </T>
            <T x={596} y={y + 40} fs={11.5}>
              {r.fresh[1]}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 86-3 定期的に作り直す方式でのデータの鮮度 ---------- */
function StalenessFigure() {
  const x = (h: number) => 60 + (h - 9) * 300
  return (
    <Svg
      id="86-3"
      w={720}
      h={250}
      label="RebuildDailySalesJob が 9 時と 10 時に売上を作り直す。9 時 10 分に注文が入っても、9 時 20 分にダッシュボードを開くと 9 時時点のデータが表示され、その注文は含まれない。10 時に作り直すと含まれる。画面には 9:00 時点と表示する"
    >
      <line x1={40} y1={120} x2={700} y2={120} stroke="var(--fig-line)" strokeWidth={2} />
      {[9, 10].map((h) => (
        <g key={h}>
          <line x1={x(h)} y1={105} x2={x(h)} y2={135} stroke="var(--fig-accent)" strokeWidth={3} />
          <T x={x(h)} y={152} anchor="middle" fs={12} tone="acc">
            {h}:00 作り直す
          </T>
        </g>
      ))}
      <rect x={x(9)} y={110} width={x(10) - x(9)} height={20} fill="var(--fig-box2)" opacity={0.6} />
      <T x={(x(9) + x(10)) / 2} y={182} anchor="middle" fs={12} tone="muted">
        この間、画面のデータは 9:00 時点のまま
      </T>
      <circle cx={x(9 + 10 / 60)} cy={120} r={6} fill="var(--fig-danger)" />
      <T x={x(9 + 10 / 60)} y={92} anchor="middle" fs={12} tone="danger">
        9:10 注文が入る
      </T>
      <Box x={x(9 + 20 / 60) - 10} y={20} w={200} h={44} lines={['9:20 画面を開く', '「9:00 時点」の売上を表示']} fs={12} subTone="muted" />
      <Arrow x1={x(9 + 20 / 60) + 20} y1={64} x2={x(9 + 20 / 60) + 20} y2={110} />
      <T x={x(10) - 20} y={214} anchor="end" fs={12}>
        10:00 に作り直すと、9:10 の注文が含まれる
      </T>
    </Svg>
  )
}

/* ---------- 図 86-5 日本時間の日付の求め方 ---------- */
const tzRows: { expr: string; result: string[]; note: string; bad?: boolean }[] = [
  { expr: 'DATE(ordered_at)', result: ['2026-11-12'], note: 'UTC の日付。1日前になる', bad: true },
  { expr: "DATE(CONVERT_TZ(ordered_at, '+00:00', '+09:00'))", result: ['2026-11-13'], note: '時差で指定。表がなくても動く' },
  { expr: 'DATE(ordered_at + INTERVAL 9 HOUR)', result: ['2026-11-13'], note: '日本は夏時間がないので同じ' },
  { expr: "DATE(CONVERT_TZ(ordered_at, 'UTC', 'Asia/Tokyo'))", result: ['2026-11-13', '表がないと NULL'], note: 'タイムゾーン表が必要' },
]

function TimeZoneFigure() {
  const top = 92
  const step = 52
  const bottom = top + tzRows.length * step + 8
  return (
    <Svg
      id="86-5"
      w={780}
      h={bottom + 76}
      label={`日本時間の 2026-11-13 08:30 に入った注文は、orders.ordered_at に UTC の 2026-11-12 23:30:00 として保存される。${tzRows.map((r) => `${r.expr} は ${r.result.join('、')}。${r.note}`).join('。')}。日本時間の 11月13日 の注文を絞るときは、ordered_at が 2026-11-12 15:00:00 以上 2026-11-13 15:00:00 未満という UTC の範囲で比べ、インデックスを使えるようにする`}
    >
      <Box x={20} y={16} w={250} h={48} lines={['画面で入力した日時（日本時間）', '2026-11-13 08:30']} fs={12.5} fill="bg" subTone="muted" />
      <Arrow x1={270} y1={40} x2={428} y2={40} />
      <T x={349} y={30} anchor="middle" fs={11} tone="muted">
        Rails が UTC に変換
      </T>
      <Box x={430} y={16} w={330} h={48} lines={['orders.ordered_at に保存される値（UTC）', '2026-11-12 23:30:00']} fs={12.5} fill="box4" subTone="muted" />
      {tzRows.map((r, i) => {
        const y = top + i * step
        return (
          <g key={r.expr}>
            <Box x={20} y={y} w={410} h={40} lines={r.expr} fs={12} fill="box" mono />
            <Arrow x1={430} y1={y + 20} x2={452} y2={y + 20} />
            {r.bad ? (
              <>
                <rect x={454} y={y} width={130} height={40} rx={6} fill="none" stroke="var(--fig-danger)" strokeWidth={2} />
                <T x={519} y={y + 25} anchor="middle" fs={12.5} tone="danger" bold>
                  {r.result[0]}
                </T>
              </>
            ) : (
              <Box x={454} y={y} w={130} h={40} lines={r.result} fs={r.result.length > 1 ? 11.5 : 12.5} fill="bg" bold subTone="muted" />
            )}
            <T x={596} y={y + 24} fs={11.5} tone={r.bad ? 'danger' : undefined}>
              {r.note}
            </T>
          </g>
        )
      })}
      <Box
        x={20}
        y={bottom}
        w={740}
        h={60}
        lines={['日本時間の 11月13日 の注文を絞る条件（列に関数を使わないので、インデックスを使える）', "ordered_at >= '2026-11-12 15:00:00' AND ordered_at < '2026-11-13 15:00:00'"]}
        fs={12}
        fill="box5"
        subTone="muted"
      />
    </Svg>
  )
}

/* ---------- 図 86-4 作り直しの INSERT … SELECT と注文の取り消し ---------- */
function LockTimelineFigure() {
  const ty = (t: number) => 74 + t * 20
  const panels = [
    { x: 10, title: 'REPEATABLE READ（MySQL の既定）', commit: 10.69, done: 10.71, wait: true },
    { x: 400, title: 'READ COMMITTED', commit: 7.8, done: 1.02, wait: false },
  ]
  return (
    <Svg
      id="86-4"
      w={780}
      h={ty(11) + 36}
      label="左は REPEATABLE READ で作り直した場合。作り直しのジョブが 0 秒に INSERT … SELECT を始め、1 秒に別の接続が注文 1000 を取り消そうとすると、その UPDATE は作り直しが 10.69 秒に COMMIT するまで待ち、10.71 秒に終わった。右は READ COMMITTED で作り直した場合。同じ UPDATE は 1.02 秒に終わり、作り直しは 7.80 秒に COMMIT した"
    >
      {panels.map((p) => (
        <g key={p.x}>
          <T x={p.x + 185} y={20} anchor="middle" bold fs={12.5}>
            {p.title}
          </T>
          <T x={p.x + 115} y={46} anchor="middle" fs={12}>
            作り直しのジョブ
          </T>
          <T x={p.x + 285} y={46} anchor="middle" fs={12}>
            注文の取り消し
          </T>
          {[0, 5, 10].map((t) => (
            <T key={t} x={p.x + 30} y={ty(t) + 4} anchor="end" fs={11} tone="muted">
              {t}秒
            </T>
          ))}
          <line x1={p.x + 36} y1={ty(0)} x2={p.x + 36} y2={ty(11)} stroke="var(--fig-line)" />
          <rect x={p.x + 50} y={ty(0)} width={130} height={ty(p.commit) - ty(0)} rx={6} fill="var(--fig-box5)" stroke="var(--fig-line)" />
          <T x={p.x + 115} y={ty(0) + 20} anchor="middle" fs={11.5}>
            INSERT … SELECT
          </T>
          <T x={p.x + 115} y={ty(0) + 38} anchor="middle" fs={11} tone="muted">
            {p.wait ? '元の行に共有ロック' : 'ロックを取らずに読む'}
          </T>
          <T x={p.x + 115} y={ty(p.commit) + 16} anchor="middle" fs={11.5} tone="acc" bold>
            {p.commit.toFixed(2)}秒 COMMIT
          </T>
          <Box x={p.x + 215} y={ty(1) - 18} w={140} h={36} lines={['UPDATE orders', '（ID 1000）']} fs={11} fill="box" />
          {p.wait ? (
            <>
              <rect x={p.x + 272} y={ty(1) + 18} width={26} height={ty(p.done) - ty(1) - 18} fill="none" stroke="var(--fig-danger)" strokeDasharray="5 4" />
              <T x={p.x + 306} y={ty(5)} fs={11.5} tone="danger">
                ロックの
              </T>
              <T x={p.x + 306} y={ty(5) + 16} fs={11.5} tone="danger">
                解放を待つ
              </T>
              <T x={p.x + 285} y={ty(p.done) + 16} anchor="middle" fs={11.5}>
                {p.done.toFixed(2)}秒 終わる
              </T>
            </>
          ) : (
            <T x={p.x + 285} y={ty(1) + 36} anchor="middle" fs={11.5} tone="acc">
              {p.done.toFixed(2)}秒 終わる
            </T>
          )}
        </g>
      ))}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 50,
  part: 9,
  title: 'Materialized View：売上の集計表と商品検索用のテーブルを用意する',
  summary:
    '管理画面の売上のダッシュボードと商品検索が、表示のたびに大きな表を結合して集計しているために遅くなる場面から始めます。MySQL にはマテリアライズドビューがないので、集計した結果を通常のテーブルに保存し、ジョブで作り直す方式を Rails で実装します。日本時間の日付の求め方、作り直しのロック、いつ時点のデータかの表示を、MySQL 8.4 と RSpec で確かめます。',
  goals: [
    '表示のたびに集計するコードの問題を、速さと、同じ集計が複数の場所に書かれることの2つの観点で説明できる',
    '書き込み用のモデル（正しいデータ）と参照用のモデル（作り直せるデータ）を分ける考え方と、4つの更新の方式を説明できる',
    'MySQL で集計表を INSERT … SELECT … ON DUPLICATE KEY UPDATE と upsert_all で作り直し、READ COMMITTED で元の表をロックしないようにできる',
    'UTC で保存した datetime の列から日本時間の日付を求め、CONVERT_TZ とタイムゾーン表の関係を説明できる',
    '参照用のモデルを読み取り専用にし、いつ時点のデータかを画面に表示し、元の表から集計した結果と一致することをテストで確かめられる',
    'counter_cache・Rails.cache・検索エンジン・PostgreSQL のマテリアライズドビュー・CQRS との違いを踏まえて、採用するかを判断できる',
  ],
  prerequisites: [18, 36, 37],
  sections: [
    {
      id: 'scene',
      title: '売上のダッシュボードと商品検索が遅くなる',
      body: (
        <>
          <p>
            この章の題材は、お茶や食器を売る EC サイトの2つの画面です。1つは社内の担当者が見る管理画面の売上のダッシュボードで、直近30日の売上を、日本時間の日付と商品のカテゴリ（飲料・食器・茶葉など）ごとに一覧にします。担当者は朝の会議の前にこの画面を開き、前日までの売上の推移を確かめます。同じ数字は経理に渡す CSV の出力と月次のレポートにも使います。もう1つは利用者が使う商品検索で、「茶」のような言葉と「評価が4以上」という条件で商品を探し、レビューの平均の評価が高い順に20件を表示します。
          </p>
          <p>データは次の5つのテーブルに保存しています。同じ情報を1か所にだけ持つように表を分けた、正規化した形です。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">テーブル</th>
                  <th scope="col">主な列</th>
                  <th scope="col">内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>categories</code></th>
                  <td><code>name</code></td>
                  <td>商品のカテゴリ</td>
                </tr>
                <tr>
                  <th scope="row"><code>products</code></th>
                  <td><code>name</code>・<code>category_id</code>・<code>price</code></td>
                  <td>商品と現在の価格（円）</td>
                </tr>
                <tr>
                  <th scope="row"><code>orders</code></th>
                  <td><code>ordered_at</code>・<code>status</code></td>
                  <td>注文。<code>status</code> は <code>placed</code>（確定）か <code>cancelled</code>（取り消し）</td>
                </tr>
                <tr>
                  <th scope="row"><code>order_items</code></th>
                  <td><code>order_id</code>・<code>product_id</code>・<code>quantity</code>・<code>unit_price</code></td>
                  <td>注文の明細。注文した時点の単価を保存する</td>
                </tr>
                <tr>
                  <th scope="row"><code>reviews</code></th>
                  <td><code>product_id</code>・<code>rating</code></td>
                  <td>商品のレビュー。評価は 1〜5</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>表示のたびに集計するコード</h3>
          <p>ダッシュボードのコントローラーは画面を開くたびに注文の明細を注文と商品に結合し、日付とカテゴリごとに金額を合計しています。</p>
          <Code
            lang="ruby"
            title="app/controllers/admin/sales_dashboards_controller.rb（パターンを使う前）"
            code={`
module Admin
  class SalesDashboardsController < ApplicationController
    def show
      @to = Date.current
      @from = @to - 29
      # { [日付, カテゴリの ID] => 売上 } のハッシュ
      @sales = OrderItem.joins(:order, :product).merge(Order.placed)
        .where(orders: { ordered_at: @from.beginning_of_day..@to.end_of_day })
        .group(Arel.sql("DATE(CONVERT_TZ(orders.ordered_at, '+00:00', '+09:00'))"), "products.category_id")
        .sum("order_items.quantity * order_items.unit_price")
    end
  end
end
`}
          />
          <p>
            <code>CONVERT_TZ(orders.ordered_at, '+00:00', '+09:00')</code> は、UTC で保存された日時を日本時間に直す MySQL の関数で、詳しくは<ChapterLink n={50} section="mysql-summary">「MySQL で集計表を作り直す」の節</ChapterLink>で説明します。経理に渡す CSV は、別の担当者が書いたジョブで出力しています。
          </p>
          <Code
            lang="ruby"
            title="app/jobs/sales_csv_export_job.rb（パターンを使う前）"
            code={`
class SalesCsvExportJob < ApplicationJob
  def perform(from, to)
    from, to = Date.parse(from), Date.parse(to)
    rows = OrderItem.joins(:order, :product).merge(Order.placed)
      .where(orders: { ordered_at: from.beginning_of_day..to.end_of_day })
      .group(Arel.sql("DATE(orders.ordered_at)"), "products.category_id") # 日本時間に直していない
      .sum("order_items.quantity * order_items.unit_price")
    lines = rows.map { |(date, category_id), revenue| [date, category_id, revenue].join(",") }
    ["日付,カテゴリ,売上", *lines].join("\\n")
  end
end
`}
          />
          <p>商品検索は商品・カテゴリ・レビューを結合し、商品ごとにレビューの件数と平均を求めてから、平均で絞り込んで並べています。</p>
          <Code
            lang="ruby"
            title="app/controllers/products_controller.rb（パターンを使う前）"
            code={`
class ProductsController < ApplicationController
  def index
    @products = Product.joins(:category).left_joins(:reviews)
      .where("products.name LIKE ?", "%#{Product.sanitize_sql_like(params[:q].to_s)}%")
      .group("products.id", "categories.name")
      .having("AVG(reviews.rating) >= ?", params[:min_rating].to_f)
      .order(Arel.sql("AVG(reviews.rating) DESC"), :id)
      .limit(20)
      .select("products.*", "categories.name AS category_name",
              "COUNT(reviews.id) AS review_count", "ROUND(AVG(reviews.rating), 1) AS average_rating")
  end
end
`}
          />
          <h3>データを増やして実行する</h3>
          <p>
            開発環境の DB（MySQL 8.4.13。WSL2 の上の Docker で動かしている）に、1年分の注文 547,500 件（1日あたり 1,500 件）、明細 1,095,000 件、商品 20,000 件、レビュー 1,000,000 件を SQL で入れました。日付は 2026-11-20 として、ダッシュボードと同じ処理を rails runner で3回ずつ実行しました。2回目以降も同じ SQL を DB に送るよう、Active Record のクエリキャッシュは外しています。
          </p>
          <Code
            lang="text"
            title="実行結果（ダッシュボードの集計にかかった時間）"
            code={`
注文 547500 件・明細 1095000 件・商品 20000 件
30日分 1回目: 757 ms
30日分 2回目: 355 ms
30日分 3回目: 317 ms
365日分 1回目: 7161 ms
365日分 2回目: 7471 ms
365日分 3回目: 5066 ms
`}
          />
          <p>
            30日分で 0.3〜0.8 秒、月次のレポートのように1年分を集計すると 5〜7 秒かかりました。時間がどこにかかっているかを、MySQL の <code>EXPLAIN ANALYZE</code> で調べます。EXPLAIN ANALYZE は SQL を実際に実行し、実行計画の各段階で読んだ行数とかかった時間を表示します<Ref n={13} />（実行計画の読み方は<ChapterLink n={37} section="explain-rails" />の「MySQL の EXPLAIN と Relation#explain」）。
          </p>
          <Code
            lang="text"
            title="実行結果（30日分の集計の EXPLAIN ANALYZE。cost の値は省略）"
            code={`
-> Table scan on <temporary>  (actual time=338..338 rows=174 loops=1)
    -> Aggregate using temporary table  (actual time=338..338 rows=174 loops=1)
        -> Nested loop inner join  (actual time=0.787..306 rows=85260 loops=1)
            -> Nested loop inner join  (actual time=0.782..212 rows=85260 loops=1)
                -> Filter: (orders.\`status\` = 'placed')  (actual time=0.495..63.5 rows=42630 loops=1)
                    -> Index range scan on orders using index_orders_on_ordered_at over
                       ('2026-10-21 15:00:00.000000' <= ordered_at <= '2026-11-20 14:59:59.999999')
                       (actual time=0.18..58.5 rows=43501 loops=1)
                -> Index lookup on order_items using index_order_items_on_order_id (order_id=orders.id)
                   (actual time=0.00291..0.00329 rows=2 loops=42630)
            -> Single-row index lookup on products using PRIMARY (id=order_items.product_id)
               (actual time=956e-6..979e-6 rows=1 loops=85260)
`}
          />
          <p>
            下から読みます。<code>orders</code> は <code>ordered_at</code> のインデックスで30日分の 43,501 行に絞られ、ここまでで 63.5 ミリ秒です。その後、確定した 42,630 件の注文ごとに明細を探し（loops=42630）、85,260 行の明細ごとに商品を探して（loops=85260）、306 ミリ秒の時点で結合が終わります。最後に一時テーブルで日付とカテゴリごとにまとめ、174 行の結果になりました。インデックスはすでに使われていて、時間の大半は 85,260 行の明細の結合と集計にかかっています。集計する明細の数は期間に比例するので、1年分では約12倍になります。
          </p>
          <p>商品検索も、「茶」を含み評価が4以上の商品を探す処理を3回実行しました。</p>
          <Code
            lang="text"
            title="実行結果（商品検索にかかった時間と EXPLAIN ANALYZE の抜粋）"
            code={`
商品 20000 件・レビュー 1000000 件
「茶」・評価4以上 1回目: 1810 ms（20件）
「茶」・評価4以上 2回目: 1555 ms（20件）
「茶」・評価4以上 3回目: 1603 ms（20件）

-> Limit: 20 row(s)  (actual time=1467..1467 rows=20 loops=1)
    -> Sort: ??? DESC, products.id  (actual time=1467..1467 rows=20 loops=1)
        -> Filter: (??? >= '4')  (actual time=1460..1465 rows=3000 loops=1)
            -> Table scan on <temporary>  (actual time=1460..1464 rows=10000 loops=1)
                -> Aggregate using temporary table  (actual time=1460..1460 rows=10000 loops=1)
                    -> Nested loop left join  (actual time=0.285..999 rows=500000 loops=1)
                        … 名前に「茶」を含む商品 10,000 件（categories と結合）
                        -> Index lookup on reviews using index_reviews_on_product_id (product_id=products.id)
                           (actual time=0.0909..0.0943 rows=50 loops=10000)
`}
          />
          <p>
            表示するのは20件ですが、名前に「茶」を含む 10,000 件の商品のレビュー 500,000 行を結合し、商品ごとの平均を求めてから、平均が4以上の 3,000 件に絞って並べています。平均の評価で絞り込みと並べ替えをするので、集計を終えるまで件数を減らせません。<code>???</code> は、MySQL が集計の結果の式（ここでは <code>AVG(reviews.rating)</code>）を表すときの表記です。
          </p>
          <h3>画面ごとに数字が食い違う</h3>
          <p>
            日本時間の 2026-11-13 08:30 に入った注文（緑茶 300 円 × 2）を、ダッシュボードと CSV の両方で集計しました。ID は表示を整えています。
          </p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4.13。日時の値の一部を省略）"
            code={`
  Order Create  INSERT INTO \`orders\` (\`ordered_at\`, \`status\`, …) VALUES ('2026-11-12 23:30:00', 'placed', …)
  OrderItem Create  INSERT INTO \`order_items\` (\`order_id\`, \`product_id\`, \`quantity\`, \`unit_price\`) VALUES (1, 1, 2, 300)
ダッシュボード: {[Fri, 13 Nov 2026, 1] => 600}
CSV:
日付,カテゴリ,売上
2026-11-12,1,600
`}
          />
          <p>
            Rails は日本時間の 08:30 を UTC の 23:30（前日）に直して保存しています。ダッシュボードは日本時間に直してから日付にするので 11月13日、CSV は UTC のまま日付にするので 11月12日に数えました。同じ注文が画面と CSV で別の日の売上になっています。
          </p>
          <p>このコードには、次の問題があります。</p>
          <ul>
            <li>① 画面を開くたびに、期間内のすべての明細を結合して集計します。注文が増えるほど遅くなり、多くの人が同時に開けば DB の負荷になります。インデックスはすでに使われているので、インデックスを追加しても集計する行の数は減りません。</li>
            <li>② 同じ集計を、ダッシュボード、CSV の出力、月次のレポートがそれぞれ別に書いています。日付の区切り方のような定義が少しずつ違うと、画面ごとに数字が合わなくなります。</li>
            <li>③ 商品検索は、20件を表示するために 500,000 行のレビューを毎回集計します。評価の平均で絞り込むので、集計の前に件数を減らせません。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'idea',
      title: '集計した結果を保存し、元のデータから作り直せるようにする考え方',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term en="Materialized View">Materialized View</Term> は、画面の表示・検索・レポートが必要とする形に、元のデータを集計・結合した結果を保存しておくパターンです。表示のたびに元の表を結合して集計する代わりに、保存しておいた結果を読むので、読み取りが速くなります。この章では、保存した結果を<Term en="read model">参照用のモデル</Term>、書き込みを受け付ける元のデータを<Term en="write model">書き込み用のモデル</Term>と呼びます。前の節の例では、<code>orders</code> や <code>reviews</code> が書き込み用のモデルで、日付とカテゴリごとの売上を保存する <code>daily_sales</code> と、1商品1行に件数と平均をまとめた <code>product_searches</code> が参照用のモデルです。
          </p>
          <p>
            「マテリアライズドビュー」はもともと DB の機能の名前です。PostgreSQL では、SELECT の結果を表のように保存し、後で作り直せるオブジェクトを指します<Ref n={3} />。MSDP のカタログでは、この言葉をもっと広く、参照のために事前に計算して保存したデータ全般の意味で使い、集計の表、検索用に結合した表、検索エンジンの索引も含めます。Azure Architecture Center も、Materialized View パターンを1つ以上の元のデータから作る参照用のデータとして説明しています<Ref n={1} />。
          </p>
          <Callout kind="note" title="原典との定義のずれ">
            <p>
              DB の用語の「マテリアライズドビュー」は、CREATE MATERIALIZED VIEW で作る DB のオブジェクトだけを指します。MSDP のカタログの Materialized View は、アプリケーションのジョブで作り直す普通のテーブルや、外部の検索エンジンの索引まで含む、設計の考え方の名前です。MySQL 8.4 には DB の機能としてのマテリアライズドビューがないので<Ref n={2} />、この章の Rails の実装は、すべて後者の意味の Materialized View です。
            </p>
          </Callout>
          <p>
            このパターンで最も重要な性質は、参照用のモデルを作り直せることです。Azure の説明は、マテリアライズドビューとその中のデータは元のデータから完全に作り直せるので、捨ててよいものだとしています<Ref n={1} />。正しいデータは書き込み用のモデルにあり、参照用のモデルはその写しです。
          </p>
          <h3>使う場面</h3>
          <p>
            DB の表は書き込みのしやすさと矛盾のなさを優先して正規化します。注文なら、注文・明細・商品を別々の表に持ちます。この形は書き込みに向いていますが、「日付とカテゴリごとの売上」を表示するには、毎回3つの表を結合して集計します。Azure の説明も、開発者はデータをどう保存するかを優先しがちで、それが読み取りに向いた形とは限らないと指摘しています<Ref n={1} />。典型的な使い方は次のとおりです。
          </p>
          <ul>
            <li>集計済みのデータ：日別の売上、月別の会員数、ランキング</li>
            <li>ダッシュボードやレポート：管理画面の数値の一覧</li>
            <li>検索用のデータ：商品とカテゴリとレビューを結合した1行、全文検索エンジンの索引</li>
            <li>件数：投稿ごとのコメントの数、商品ごとのレビューの数</li>
          </ul>
          <p>次のような兆候があれば、このパターンが必要になっている可能性があります。</p>
          <ul>
            <li>画面を開くたびに、大きな表を結合して集計する SQL が実行され、データが増えるほど表示が遅くなっている</li>
            <li>同じ集計の SQL が、画面、CSV の出力、レポートなどに別々に書かれている</li>
            <li>一覧の画面で、1行ごとに件数や平均を求める SQL が実行されている</li>
          </ul>
          <h3>設計上の制約</h3>
          <ul>
            <li>表示を速くしたい。一方で、事前に計算した結果は、元のデータが変わった時点から古くなる。</li>
            <li>参照用のモデルを常に最新にしたい。一方で、書き込みのたびに更新すると、書き込みが遅くなり、同じ集計の行の更新が集中する。</li>
            <li>まとめて作り直す方が単純で確実である。一方で、データが多いと作り直しに時間がかかり、その間の読み取りと書き込みへの影響も考える必要がある。</li>
            <li>同じデータを2か所に持つので、両者の食い違いを見つけ、直す方法が必要になる。</li>
          </ul>
          <h3>解決方法</h3>
          <p>Materialized View は次の3つの要素で作ります。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">この章の例</th>
                  <th scope="col">責務</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">書き込み用のモデル</th>
                  <td><code>orders</code>・<code>order_items</code>・<code>products</code>・<code>categories</code>・<code>reviews</code></td>
                  <td>正しいデータを持つ。書き込みはここに対して行う</td>
                </tr>
                <tr>
                  <th scope="row">参照用のモデル</th>
                  <td><code>daily_sales</code>（DailySale）・<code>product_searches</code>（ProductSearch）</td>
                  <td>参照に向いた形のデータを持つ。読み取りだけに使い、直接は書き込まない</td>
                </tr>
                <tr>
                  <th scope="row">更新の処理</th>
                  <td><code>DailySale.rebuild</code>・<code>ProductSearch.refresh</code> と、それを呼ぶジョブ</td>
                  <td>書き込み用のモデルから参照用のモデルを作る、または更新する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Figure n="86-1" title="書き込み用のモデルと参照用のモデル" caption="この章の Rails の実装の構成をまとめた模式図。破線の矢印は、左の表（破線の枠）から右のデータを作ることを表す。矢印の上の文字は、使う表と作り方。">
            <ModelsFigure />
          </Figure>
          <p>
            図 86-1 の左が書き込み用のモデル、右が参照用のモデルです。ダッシュボードと商品検索は右の表だけを読みます。正しいデータは左の表にあり、右のデータはいつでも左の表から作り直せます。検索エンジンの索引は外部のサービスにありますが、商品の情報から作り直せる点は同じです。
          </p>
          <h3>解決方法：更新の方式を選ぶ</h3>
          <p>
            参照用のモデルをいつ、どう更新するかには、4つの方式があります。Azure の説明も、全体を作り直すか変更を差分として反映するか、作り直しの間に読み取りを止めるかを決める必要があるとしています<Ref n={1} />。
          </p>
          <Figure n="86-2" title="参照用のモデルを更新する方式" caption="MSDP の第11章の比較をもとに、この章の Rails のクラスに置き換えた図。上の2行（色を付けた行）が、この章で実装する方式。">
            <RefreshMethodsFigure />
          </Figure>
          <p>図 86-2 は4つの方式を、更新のきっかけ・更新する処理・データの新しさで比べたものです。</p>
          <ul>
            <li>
              全体を作り直す：元の表から全体を集計し直します。PostgreSQL のマテリアライズドビューでは <code>REFRESH MATERIALIZED VIEW</code> がこれに当たり、中身を全部入れ替えます<Ref n={4} />。この章の <code>RebuildDailySalesJob</code> を引数なしで動かすと、注文のある全期間を作り直します。
            </li>
            <li>変わった部分だけ作り直す：注文やレビューが変わったときに、その日の売上の行や、その商品の検索用の行だけを、元の表から作り直します。この章では、モデルの <code>after_commit</code> からジョブを積みます。</li>
            <li>書き込みと同時に加算する：注文を保存するトランザクションの中で、集計の表の該当する行に今回の注文の分を足します。注文を保存した直後から最新の値になりますが、同じ日・同じカテゴリの注文はすべて同じ行を更新するので、その行のロックを待ち合うことになります。この方式の注意点は<ChapterLink n={50} section="anti-patterns">「よくある誤用」の節</ChapterLink>で扱います。</li>
            <li>
              イベントで後から更新する：書き込みの処理とは別の処理が、変更の知らせ（イベント）を受けて参照用のモデルを更新します。イベントの発行と購読は<ChapterLink n={51} section="idea" />、イベントを確実に届ける方法は<ChapterLink n={53} section="idea" />、同じイベントが2回届いたときに重複を捨てる方法は<ChapterLink n={52} section="idea" />で扱います。
            </li>
          </ul>
          <h3>解決方法：データの鮮度を決める</h3>
          <p>
            書き込みと同時に加算する方式以外では、参照用のモデルは元のデータより遅れます。ただし、元のデータへの新しい更新がなければ、いずれ参照用のモデルも追いつき、どの読み取りも最新の値を返すようになります。この性質を<Term en="eventual consistency">結果整合性</Term>と呼びます<Ref n={6} />。PostgreSQL の説明も、マテリアライズドビューは元の表を読むより速いことが多いが、データは常に最新とは限らないとしています<Ref n={5} />。Azure の説明は、どこまで古くてよいかを先に決めてから方式を選ぶべきだとしています<Ref n={1} />。
          </p>
          <ul>
            <li>どこまで古くてよいかを、画面ごとに決めます。売上の推移なら1時間前でよい、在庫の数は最新でなければならない、などです。</li>
            <li>画面に「いつ時点のデータか」を表示します。この章の参照用の表は、行を作り直した時刻を <code>refreshed_at</code> 列に記録します。</li>
            <li>作り直しが止まっていないかを監視します。Azure の説明も、最後の作り直しからの時間が許容範囲を超えたら通知するよう勧めています<Ref n={1} />。</li>
          </ul>
          <h3>解決方法：作り直せるようにしておく</h3>
          <p>
            差分を足していく方式では、不具合や手作業の修正で、集計の表が元のデータとずれることがあります。そのため、どの方式でも、元のデータから全体を作り直す処理を用意しておきます。集計の定義を変えたときにも使います。
          </p>
          <h3>構造</h3>
          <p>
            書き込み用のモデル、参照用のモデル、更新の処理の関係は図 86-1 のとおりです。ここでは、時間の経過に沿って、参照用のモデルのデータがどう古くなるかを見ます。
          </p>
          <Figure n="86-3" title="定期的に作り直す方式でのデータの鮮度" caption="1時間ごとに作り直す場合の模式図。">
            <StalenessFigure />
          </Figure>
          <p>
            図 86-3 は売上を1時間ごとに作り直す場合のデータの古さを示したものです。9時に作り直した後に入った注文は、次に作り直す10時まで画面に出ません。画面に「9:00 時点」と表示しておけば、利用者は数値がいつのものかを知ることができます。データは最大で、作り直す間隔と作り直しにかかる時間を足した分だけ古くなります。
          </p>
        </>
      ),
    },
    {
      id: 'mysql-summary',
      title: 'MySQL で集計表を作り直す',
      body: (
        <>
          <h3>MySQL にはマテリアライズドビューがない</h3>
          <p>
            MySQL 8.4 のマニュアルの FAQ は、「MySQL にマテリアライズドビューはあるか」という問いに「No」と答えています<Ref n={2} />。そこで、集計した結果を通常のテーブルとして作り、アプリケーションのジョブで作り直します。MSDP の第11章も、MySQL ではアプリケーションで更新する表を作るとし、この方式を Materialized View に含めています。PostgreSQL のマテリアライズドビューとの違いは次のとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">観点</th>
                  <th scope="col">PostgreSQL のマテリアライズドビュー</th>
                  <th scope="col">MySQL の集計表とジョブ（この章）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">集計の定義</th>
                  <td>CREATE MATERIALIZED VIEW の SELECT</td>
                  <td>アプリケーションのコード（<code>DailySale.source_totals</code>）</td>
                </tr>
                <tr>
                  <th scope="row">作り直し</th>
                  <td><code>REFRESH MATERIALIZED VIEW</code> で全体を入れ替える<Ref n={4} /></td>
                  <td>INSERT … SELECT … ON DUPLICATE KEY UPDATE と、不要になった行の DELETE</td>
                </tr>
                <tr>
                  <th scope="row">作り直しの間の読み取り</th>
                  <td>CONCURRENTLY を付けなければ待たされる。付けるには一意のインデックスが要る<Ref n={4} /></td>
                  <td>InnoDB の一貫性読み取りで、作り直しが COMMIT するまで前の行を読める</td>
                </tr>
                <tr>
                  <th scope="row">一部だけ作り直す</th>
                  <td>できない（全体を作り直す）</td>
                  <td>WHERE の条件で、日付の範囲や商品を絞って作り直せる</td>
                </tr>
                <tr>
                  <th scope="row">いつ時点か</th>
                  <td>自分で記録する</td>
                  <td>自分で記録する（この章では <code>refreshed_at</code> 列）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            InnoDB の SELECT は既定ではロックを取らない一貫性読み取り（スナップショットを読む方式）で行われ、ほかのセッションが同じ表を同時に変更できます<Ref n={9} />。そのため、ダッシュボードが <code>daily_sales</code> を読む SELECT は、作り直しの途中の行ではなく、COMMIT 済みの行を読みます（MVCC の仕組みは<ChapterLink n={38} section="mvcc" />の「MVCC：行のバージョンとスナップショット」）。
          </p>
          <h3>INSERT … SELECT … ON DUPLICATE KEY UPDATE</h3>
          <p>
            <code>ON DUPLICATE KEY UPDATE</code> を付けた INSERT は、主キーか一意インデックスが同じ行がすでにあれば、追加する代わりにその行を更新します。行がなければ追加し、あれば更新するこの操作を <Term en="upsert">upsert</Term> と呼びます。更新する値には追加しようとした行の値を使います。以前は <code>VALUES(列名)</code> で参照しましたが、この書き方は非推奨で、MySQL 8.4 では行の別名（<code>AS new</code> など）を使います<Ref n={7} />。
          </p>
          <p>
            SELECT の結果をまとめて upsert する INSERT … SELECT では、GROUP BY を使った SELECT の列を ON DUPLICATE KEY UPDATE から直接参照できません。マニュアルは、SELECT を派生テーブル（FROM の中に書いた副問い合わせ）にして、その列を参照する書き方を示しています<Ref n={7} />。この章の作り直しも、次の形にしています。
          </p>
          <Code
            lang="sql"
            title="集計の結果を daily_sales に upsert する SQL の形"
            code={`
INSERT INTO daily_sales (sales_date, category_id, revenue, order_count, refreshed_at)
SELECT * FROM (
  SELECT … AS sales_date, … AS category_id, SUM(…) AS revenue, … -- 集計の SELECT
    FROM orders JOIN order_items … GROUP BY …
) AS totals
ON DUPLICATE KEY UPDATE revenue = totals.revenue, order_count = totals.order_count,
                        refreshed_at = totals.refreshed_at
`}
          />
          <p>
            Ruby の側で行の配列を作ってから upsert する場合は、Active Record の <code>upsert_all</code> を使えます。Rails 8.1 の MySQL のアダプターは、MySQL 8.0.19 以降なら <code>INSERT … VALUES … AS 表名_values ON DUPLICATE KEY UPDATE</code> の形の SQL を作ります<Ref n={14} />。PostgreSQL と違い、MySQL では衝突を調べる一意インデックスを <code>unique_by:</code> で指定できず、指定すると ArgumentError になります<Ref n={15} />。主キーかいずれかの一意インデックスが同じなら更新になるので、参照用の表の一意インデックスは集計の単位（日付とカテゴリ、商品）に合わせて1つにしておきます。
          </p>
          <h3>作り直しの SELECT が元の表をロックする</h3>
          <p>
            INSERT … SELECT には、MySQL 特有の注意点があります。マニュアルによると、<code>INSERT INTO T SELECT … FROM S</code> は、分離レベルが READ COMMITTED なら S を一貫性読み取りで読み、ロックを取りません。それ以外の分離レベル（MySQL の既定の REPEATABLE READ を含む）では、S から読んだ行に共有のネクストキーロック（行とその手前の隙間をまとめて押さえるロック）を取ります<Ref n={8} />。つまり、既定のままで1年分を作り直すと、作り直しが COMMIT するまで、読んだ注文の行を更新できなくなります。
          </p>
          <p>
            開発環境の 547,500 件の注文で確かめました。1つのスレッドで全期間の INSERT … SELECT を実行し、1秒後に別の接続で過去の注文（ID 1000）を取り消す UPDATE と、新しい注文の INSERT を送りました。分離レベルは作り直しのトランザクションに <code>transaction(isolation: …)</code> で指定しています。
          </p>
          <Code
            lang="text"
            title="実行結果（作り直しと同時に注文を変更する。経過時間は作り直しの開始から）"
            code={`
== REPEATABLE READ（既定）
 0.00s 作り直し開始
 1.00s 過去の注文（ID 1000）を取り消す
 1.01s 新しい注文を INSERT する
 1.03s 新しい注文を INSERT した
10.69s 作り直し COMMIT
10.71s 過去の注文（ID 1000）を取り消した
== read_committed
 0.00s 作り直し開始
 1.00s 過去の注文（ID 1000）を取り消す
 1.01s 新しい注文を INSERT する
 1.02s 過去の注文（ID 1000）を取り消した
 1.03s 新しい注文を INSERT した
 7.80s 作り直し COMMIT
`}
          />
          <Figure n="86-4" title="作り直しの INSERT … SELECT と、同時に送った注文の取り消し" caption="上の実行結果のうち、作り直しと注文の取り消しを、接続ごとの列に並べた図。上から下へ時間が進む。">
            <LockTimelineFigure />
          </Figure>
          <p>
            図 86-4 の左のとおり、REPEATABLE READ では、注文の取り消しが作り直しの COMMIT まで約 9.7 秒待たされました。管理画面で注文を取り消す操作や、決済の結果を反映するジョブが、集計のジョブのせいで止まることになります。READ COMMITTED にすると、取り消しはすぐに終わりました。新しい注文の INSERT は、この実行ではどちらの分離レベルでも待ちませんでした。分離レベルの違いは<ChapterLink n={38} section="isolation" />の「Isolation Level：ほかのトランザクションの変更の見え方」で、Rails での指定方法は<ChapterLink n={15} section="isolation" />の「分離レベルの指定」で扱いました。
          </p>
          <p>
            READ COMMITTED で作り直しても、集計の SELECT は1つの文なので、文を始めた時点の COMMIT 済みのデータを読みます。この章の <code>DailySale.rebuild</code> は、作り直しのトランザクションに READ COMMITTED を指定します。もう1つの方法は、集計の結果を普通の SELECT で Ruby に読み込んでから <code>upsert_all</code> で書き込むことで、SELECT は一貫性読み取りなのでロックを取りません。この章の <code>ProductSearch.refresh</code> はこちらの方法です。
          </p>
          <p>
            表全体を一度に入れ替えたい場合は、新しい表に作ってから <code>RENAME TABLE</code> で名前を入れ替える方法もあります。RENAME TABLE は名前の変更を不可分に行い、変更の途中ではほかのセッションはどちらの表にもアクセスできません<Ref n={12} />。ただし DDL なので、マイグレーションの外でスキーマを変える運用になり、Rails のスキーマのキャッシュや権限の設計も考える必要があります。この章では使いません。
          </p>
          <h3>UTC で保存した日時から日本時間の日付を求める</h3>
          <p>
            Rails は datetime の列を UTC で保存します。この章の最初の節の実行結果では、日本時間の 08:30 が <code>'2026-11-12 23:30:00'</code> として INSERT されていました。MySQL の DATETIME 型はタイムゾーンの情報を持たず、セッションのタイムゾーンの設定は DATETIME の値に影響しません<Ref n={10} />。そのため、<code>DATE(ordered_at)</code> は UTC の日付を返し、日本時間の 0 時から 9 時までの注文は前の日に数えられます。日本時間の日付は、次のどれかの式で求めます。
          </p>
          <ul>
            <li>
              <code>CONVERT_TZ(ordered_at, '+00:00', '+09:00')</code>：時差の形でタイムゾーンを指定します。
            </li>
            <li>
              <code>ordered_at + INTERVAL 9 HOUR</code>：9時間を足します。日本は夏時間を使っていないので、上と同じ結果になります。
            </li>
            <li>
              <code>CONVERT_TZ(ordered_at, 'UTC', 'Asia/Tokyo')</code>：タイムゾーンの名前で指定します。名前を使えるのは、<code>mysql</code> データベースのタイムゾーンの表が作られ、データが入っている場合だけです。MySQL のインストールは表を作りますが、データは入れません<Ref n={10} />。CONVERT_TZ は引数が正しくないときに NULL を返します<Ref n={11} />。
            </li>
          </ul>
          <p>
            日本時間の 08:30 の注文（保存値は UTC の 23:30）で、それぞれの式を実行しました。上はこの章で使う Docker の MySQL（公式のイメージ）、下は環境変数 <code>MYSQL_INITDB_SKIP_TZINFO=1</code> を付けて初期化した MySQL 8.4.13 です。
          </p>
          <Code
            lang="text"
            title="実行結果（日付の求め方の比較。表示を整えた）"
            code={`
== この章の MySQL（タイムゾーンの表 mysql.time_zone_name は 1795 行）
ordered_at=2026-11-12 23:30:00 UTC
DATE(ordered_at)                                   => 2026-11-12
DATE(CONVERT_TZ(ordered_at, '+00:00', '+09:00'))   => 2026-11-13
DATE(ordered_at + INTERVAL 9 HOUR)                 => 2026-11-13
DATE(CONVERT_TZ(ordered_at, 'UTC', 'Asia/Tokyo'))  => 2026-11-13

== タイムゾーンの表を読み込まずに初期化した MySQL（time_zone_name は 0 行）
CONVERT_TZ('2026-11-12 23:30:00', 'UTC', 'Asia/Tokyo')   => NULL
CONVERT_TZ('2026-11-12 23:30:00', '+00:00', '+09:00')    => 2026-11-13 08:30:00
TIMESTAMP('2026-11-12 23:30:00') + INTERVAL 9 HOUR      => 2026-11-13 08:30:00
`}
          />
          <p>
            名前で指定した式は、タイムゾーンの表がない MySQL ではエラーにならずに NULL を返しました。手元の Docker では表が読み込まれていて動いても、本番のサーバーで表が空なら、集計の日付がすべて NULL になります。この章では、表の有無に左右されない時差の形（<code>'+00:00', '+09:00'</code>）を使います。夏時間のある地域の日付を求める場合は名前で指定する必要があるので、本番でもタイムゾーンの表を読み込み、タイムゾーンの規則の変更に合わせて更新します<Ref n={10} />。
          </p>
          <Figure n="86-5" title="日本時間の日付の求め方" caption="上の実行結果をまとめた図。下の枠は、日付で注文を絞るときの条件。">
            <TimeZoneFigure />
          </Figure>
          <p>
            図 86-5 の下の枠のとおり、日付で注文を絞る WHERE には関数を使わず、日本時間の日付の範囲を UTC の日時の範囲に直して比べます。Rails の <code>Date#in_time_zone</code> は <code>config.time_zone</code>（この章のアプリは Tokyo）の 0 時を返し、SQL では UTC に直されるので、<code>where(ordered_at: from.in_time_zone...(to + 1).in_time_zone)</code> と書けます。<code>WHERE DATE(CONVERT_TZ(ordered_at, …)) = '2026-11-13'</code> のように列に関数を使うと、<code>ordered_at</code> のインデックスを使えません（<ChapterLink n={37} section="index-not-used" />の「インデックスが使われない条件を EXPLAIN で確かめる」）。
          </p>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装：集計表をジョブで作り直す',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  models/daily_sale.rb              # 参照用のモデル（売上）。集計の定義と作り直し
  models/product_search.rb          # 参照用のモデル（商品検索）
  models/order.rb                   # after_commit で売上の作り直しのジョブを積む
  models/review.rb・product.rb・category.rb   # after_commit で検索用の行の作り直しを積む
  jobs/rebuild_daily_sales_job.rb
  jobs/refresh_product_search_job.rb
  controllers/admin/sales_dashboards_controller.rb
  controllers/products_controller.rb
  views/admin/sales_dashboards/show.html.erb
db/migrate/
  20261120000002_create_daily_sales.rb
  20261120000003_create_product_searches.rb
spec/models/daily_sale_spec.rb・order_spec.rb・product_search_spec.rb
spec/requests/sales_dashboards_spec.rb
`}
          />
          <h3>マイグレーション</h3>
          <Code
            lang="ruby"
            title="db/migrate/20261120000002_create_daily_sales.rb"
            code={`
class CreateDailySales < ActiveRecord::Migration[8.1]
  def change
    # 日本時間の日付とカテゴリごとの売上。orders などから作り直せる参照用の表
    create_table :daily_sales, primary_key: [:sales_date, :category_id] do |t|
      t.date :sales_date, null: false
      t.bigint :category_id, null: false
      t.bigint :revenue, null: false
      t.integer :order_count, null: false
      t.datetime :refreshed_at, null: false # この行を元の表から集計した時刻
    end
  end
end
`}
          />
          <p>
            <code>daily_sales</code> の主キーは日付とカテゴリの2列の複合主キーです。1日・1カテゴリに1行だけになり、upsert で同じ行を更新できます。Rails 7.1 以降は複合主キーを扱えるので、<code>DailySale.find([日付, カテゴリの ID])</code> で1行を取り出せます。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261120000003_create_product_searches.rb"
            code={`
class CreateProductSearches < ActiveRecord::Migration[8.1]
  def change
    # 商品検索用の表。1商品1行に、カテゴリ名とレビューの件数・平均を持つ
    # 主キーは products.id と同じ値にする。列を自分で定義し、AUTO_INCREMENT を付けない
    create_table :product_searches, primary_key: [:product_id] do |t|
      t.bigint :product_id, null: false
      t.string :name, null: false
      t.bigint :category_id, null: false
      t.string :category_name, null: false
      t.integer :price, null: false
      t.integer :review_count, null: false
      t.decimal :average_rating, precision: 2, scale: 1
      t.datetime :refreshed_at, null: false
      t.index [:category_id, :average_rating]
      t.index :average_rating
    end
  end
end
`}
          />
          <p>
            <code>create_table :product_searches, primary_key: :product_id</code> とだけ書くと、Rails は <code>product_id</code> を AUTO_INCREMENT の列として作ります。主キーは商品の ID と同じ値にしたいので、列を自分で定義しています。参照用の表には外部キーを付けていません。元の表から作り直すデータなので、商品を消した後に検索用の行が少しの間残っても、次の作り直しで消えれば十分だからです。
          </p>
          <h3>売上の定義を1か所にまとめる</h3>
          <p>
            最初に、ダッシュボードと CSV に別々に書かれていた集計を、<code>DailySale.source_totals</code> の1か所にまとめます。日付の区切り方（日本時間）もここで決めます。作り直しも、テストで正解を作る処理も、このメソッドを使います。
          </p>
          <Code
            lang="ruby"
            title="app/models/daily_sale.rb"
            code={`
# 日本時間の日付とカテゴリごとの売上（参照用のモデル）。orders などから作り直せる
class DailySale < ApplicationRecord
  belongs_to :category

  # orders.ordered_at は UTC で保存されている。日本時間に直してから日付にする
  JST_DATE = "DATE(CONVERT_TZ(orders.ordered_at, '+00:00', '+09:00'))"

  def readonly? = true

  # 売上の定義はここだけに書く。元の表を、日本時間の日付とカテゴリごとに集計する
  def self.source_totals(from, to)
    range = from.in_time_zone.beginning_of_day...(to + 1).in_time_zone.beginning_of_day
    Order.placed.where(ordered_at: range).joins(items: :product)
      .group(Arel.sql(JST_DATE), "products.category_id")
      .select(Arel.sql("#{JST_DATE} AS sales_date"), "products.category_id",
              "SUM(order_items.quantity * order_items.unit_price) AS revenue",
              "COUNT(DISTINCT orders.id) AS order_count")
  end

  # 日本時間の from〜to の日付の行を、元の表から作り直す
  def self.rebuild(from, to)
    refreshed_at = Time.current # この時刻までに確定した注文は、すべて集計に入る
    totals = source_totals(from, to).select(sanitize_sql(["? AS refreshed_at", refreshed_at]))

    # 集計の SELECT が orders などの行をロックしないように READ COMMITTED にする
    transaction(isolation: :read_committed) do
      with_connection do |c|
        c.update(<<~SQL, "DailySale Upsert")
          INSERT INTO daily_sales (sales_date, category_id, revenue, order_count, refreshed_at)
          SELECT * FROM (#{totals.to_sql}) AS totals
          ON DUPLICATE KEY UPDATE revenue = totals.revenue, order_count = totals.order_count,
                                  refreshed_at = totals.refreshed_at
        SQL
      end
      # 今回の集計に現れなかった行（注文の取り消しで売上がなくなった行）を消す
      where(sales_date: from..to).where(refreshed_at: ...refreshed_at).delete_all
    end
  end

  # いつ時点のデータか。範囲の中で最も古い集計の時刻を返す
  def self.as_of(from, to) = where(sales_date: from..to).minimum(:refreshed_at)
end
`}
          />
          <h3>作り直す</h3>
          <p>日本時間の 2026-11-13 08:30 の注文が1件ある状態で、<code>DailySale.rebuild(Date.new(2026, 11, 13), Date.new(2026, 11, 13))</code> を実行したときの SQL のログです。</p>
          <Code
            lang="text"
            title="実行結果（SQL のログ。日時の値を整えた）"
            code={`
TRANSACTION  SET TRANSACTION ISOLATION LEVEL READ COMMITTED
TRANSACTION  BEGIN
DailySale Upsert  INSERT INTO daily_sales (sales_date, category_id, revenue, order_count, refreshed_at)
SELECT * FROM (SELECT DATE(CONVERT_TZ(orders.ordered_at, '+00:00', '+09:00')) AS sales_date,
  \`products\`.\`category_id\`, SUM(order_items.quantity * order_items.unit_price) AS revenue,
  COUNT(DISTINCT orders.id) AS order_count, '2026-11-20 14:34:21.893022' AS refreshed_at
  FROM \`orders\` INNER JOIN \`order_items\` ON \`order_items\`.\`order_id\` = \`orders\`.\`id\`
  INNER JOIN \`products\` ON \`products\`.\`id\` = \`order_items\`.\`product_id\`
  WHERE \`orders\`.\`status\` = 'placed'
    AND \`orders\`.\`ordered_at\` >= '2026-11-12 15:00:00' AND \`orders\`.\`ordered_at\` < '2026-11-13 15:00:00'
  GROUP BY DATE(CONVERT_TZ(orders.ordered_at, '+00:00', '+09:00')), \`products\`.\`category_id\`) AS totals
ON DUPLICATE KEY UPDATE revenue = totals.revenue, order_count = totals.order_count,
                        refreshed_at = totals.refreshed_at
DailySale Delete All  DELETE FROM \`daily_sales\` WHERE \`daily_sales\`.\`sales_date\` = '2026-11-13'
  AND \`daily_sales\`.\`refreshed_at\` < '2026-11-20 14:34:21.893022'
TRANSACTION  COMMIT
[{"sales_date" => 2026-11-13, "category_id" => 1, "revenue" => 600, "order_count" => 1,
  "refreshed_at" => 2026-11-20 23:34:21.893022 JST +09:00}]
`}
          />
          <p>rebuild は1つのトランザクションで次の3つを行います。</p>
          <ol>
            <li>
              作り直しを始めた時刻を <code>refreshed_at</code> に入れて、集計の結果を upsert します。WHERE の <code>ordered_at</code> の範囲は、日本時間の 11月13日 0 時〜14日 0 時を UTC に直した値になっています。集計の SELECT は、この時刻より後に始まるので、この時刻までに COMMIT した注文はすべて集計に入ります。
            </li>
            <li>
              範囲の中で、今回 upsert しなかった行を消します。upsert した行の <code>refreshed_at</code> は今回の時刻になっているので、それより古い行は、今回の集計に現れなかった行です。注文の取り消しで、ある日のあるカテゴリの売上がなくなった場合がこれに当たります。upsert だけでは、こうした行が古い値のまま残ります。
            </li>
            <li>COMMIT するまで、ダッシュボードは前の行を読みます。途中まで作り直した状態は見えません。</li>
          </ol>
          <p>
            SQL は接続の <code>update</code> メソッドで送っています。<code>exec_update</code> でも同じ SQL を送れますが、Rails 8.1.4.1 では <code>exec_update</code> はクエリキャッシュを消す対象に入っていません<Ref n={16} />。ジョブやリクエストの中ではクエリキャッシュが有効なので、作り直した後に同じ処理の中で <code>DailySale</code> を読むと、作り直す前の結果が返ります。開発の途中で、upsert を2回実行しても値が変わらないように見える結果になり、この違いに気づきました。
          </p>
          <p>
            <code>transaction(isolation: :read_committed)</code> は新しいトランザクションを始めるときにだけ指定できるので、rebuild はほかのトランザクションの中からは呼べません。呼ぶと <code>ActiveRecord::TransactionIsolationError</code>（cannot set isolation when joining a transaction）になります。注文を保存するトランザクションの中から呼ぶのではなく、ジョブから呼びます。
          </p>
          <h3>参照用のモデルを読み取り専用にする</h3>
          <p>
            <code>readonly?</code> が true を返すモデルは、<code>save</code> や <code>update</code> で保存しようとすると <code>ActiveRecord::ReadOnlyRecord</code> の例外になります<Ref n={19} />。画面やコンソールから参照用の行を書き換えることを防げます。ただし、<code>readonly?</code> はレコードのオブジェクトを保存するときの確認で、<code>update_all</code>・<code>upsert_all</code>・<code>delete_all</code> のようなクラスのメソッドは確かめません。作り直しの処理はこれらで書き込めますが、ほかの場所から <code>update_all</code> で書き換えることも防げません（<ChapterLink n={50} section="test">「テストと動作の確認」の節</ChapterLink>で確かめます）。
          </p>
          <h3>ジョブで作り直す</h3>
          <Code
            lang="ruby"
            title="app/jobs/rebuild_daily_sales_job.rb"
            code={`
# 日本時間の from〜to の売上を作り直す。引数を省くと、注文のある全期間を作り直す
class RebuildDailySalesJob < ApplicationJob
  queue_as :summaries

  def perform(from = nil, to = nil)
    from ||= Order.minimum(:ordered_at)&.to_date
    to ||= Date.current
    DailySale.rebuild(from, to) if from
  end
end
`}
          />
          <p>このジョブを、2つの方式で使います。</p>
          <ul>
            <li>
              全体を作り直す：引数なしの <code>RebuildDailySalesJob.perform_later</code> を、毎晩など決まった時刻に積みます。Sidekiq の定期実行（Periodic Jobs）は有料版の Sidekiq Enterprise の機能なので<Ref n={30} />、無料版の Sidekiq では cron や sidekiq-cron などの gem を使います。Solid Queue なら config/recurring.yml に書けます（<ChapterLink n={18} section="recurring-jobs" />の「定期実行と、実行予定の監視」）。下の「変わった日だけ」の方式でジョブが失われたり、コールバックを通らない更新があったりしても、ここで元の表に合わせ直されます。
            </li>
            <li>変わった日だけ作り直す：注文を確定・取り消し・変更したときに、その注文の日付だけを作り直すジョブを積みます。</li>
          </ul>
          <Code
            lang="ruby"
            title="app/models/order.rb"
            code={`
class Order < ApplicationRecord
  has_many :items, class_name: "OrderItem"
  accepts_nested_attributes_for :items
  scope :placed, -> { where(status: "placed") }

  # 注文が確定・変更されたら、その日の売上を作り直すジョブを積む
  after_commit :rebuild_daily_sales

  def cancel! = update!(status: "cancelled")

  private

  def rebuild_daily_sales
    # ordered_at を変えた場合は、変更の前と後の両方の日付を作り直す
    dates = [ordered_at_before_last_save, ordered_at].compact.map(&:to_date).uniq
    dates.each { |date| RebuildDailySalesJob.perform_later(date, date) }
  end
end
`}
          />
          <p>
            <code>after_commit</code> は、注文を保存したトランザクションが COMMIT した後に呼ばれます（<ChapterLink n={14} section="after-commit" />の「after_save と after_commit」）。COMMIT の前にジョブを積むと、ワーカーが COMMIT 前の注文を読めずに古い集計を作ることがあるので、コミットの後に積みます（<ChapterLink n={18} section="transaction" />の「トランザクションと投入の時刻」）。<code>ordered_at</code> は日本時間の TimeWithZone なので、<code>to_date</code> で日本時間の日付になります。Active Job は Date を引数に渡せます<Ref n={21} />。
          </p>
          <p>
            このジョブは何回実行しても同じ結果になります（冪等）。今回の注文の分を足すのではなく、その日の行を元の表から作り直すからです。Sidekiq の再試行で2回動いても、同じ日のジョブが重なっても、売上は二重になりません。ただし、注文のたびに1日分（この章のデータでは約 2,900 行の明細）を集計し直すので、注文の多い店では無駄が増えます。その場合は、数分ごとに「今日と昨日」を作り直す定期実行のジョブに替える方法もあります。開発環境の 547,500 件のデータでは、全期間の作り直しに約6秒、1日分に約 0.05 秒かかりました（下の「速さを比べる」）。
          </p>
          <h3>画面に「いつ時点か」を表示する</h3>
          <Code
            lang="ruby"
            title="app/controllers/admin/sales_dashboards_controller.rb"
            code={`
module Admin
  class SalesDashboardsController < ApplicationController
    def show
      @to = Date.current
      @from = @to - 29
      @sales = DailySale.where(sales_date: @from..@to).includes(:category)
        .order(:sales_date, :category_id)
      @as_of = DailySale.as_of(@from, @to)
    end
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/admin/sales_dashboards/show.html.erb（表の部分は省略）"
            code={`
<h1>売上（<%= @from %>〜<%= @to %>）</h1>
<p>
  <% if @as_of %>
    <%= @as_of.strftime("%Y-%m-%d %H:%M") %> 時点の集計です。この時刻より後の注文は含みません。
  <% else %>
    まだ集計していません。
  <% end %>
</p>
`}
          />
          <p>
            日付ごとに作り直す時刻が違うので、表示する範囲の中で最も古い <code>refreshed_at</code> を「いつ時点」として表示します。どの日の行も、少なくともその時刻までの注文を含んでいます。
          </p>
          <h3>商品検索用のテーブル</h3>
          <p>
            商品検索用の <code>product_searches</code> は、商品とカテゴリとレビューを結合し、1商品1行にまとめた表です。商品・レビュー・カテゴリが変わったときに、その商品の行だけを作り直します。こちらは集計の結果を Ruby に読み込んでから <code>upsert_all</code> で書き込みます。
          </p>
          <Code
            lang="ruby"
            title="app/models/product_search.rb"
            code={`
# 商品検索用の表（参照用のモデル）。1商品1行に、カテゴリ名とレビューの件数・平均を持つ
class ProductSearch < ApplicationRecord
  def readonly? = true

  # 指定した商品の行を、元の表から作り直す。消えた商品の行は消す
  def self.refresh(product_ids)
    ids = Array(product_ids)
    now = Time.current
    rows = Product.where(id: ids).joins(:category).left_joins(:reviews)
      .group("products.id", "categories.name")
      .pluck("products.id", "products.name", "products.category_id", "categories.name",
             "products.price", Arel.sql("COUNT(reviews.id)"), Arel.sql("ROUND(AVG(reviews.rating), 1)"))
      .map do |id, name, category_id, category_name, price, review_count, average_rating|
        { product_id: id, name:, category_id:, category_name:, price:,
          review_count:, average_rating:, refreshed_at: now }
      end

    missing = ids - rows.map { |row| row[:product_id] }
    transaction do
      upsert_all(rows) if rows.any?
      where(product_id: missing).delete_all if missing.any?
    end
  end

  # すべての商品の行を作り直す（定期的なジョブから呼ぶ）
  def self.rebuild_all
    Product.in_batches(of: 1000) { |batch| refresh(batch.ids) }
    where.not(product_id: Product.select(:id)).delete_all
  end

  # 検索はこの表だけを読む。結合も集計もしない
  def self.search(keyword, min_rating: 0)
    where("name LIKE ?", "%#{sanitize_sql_like(keyword)}%")
      .where(average_rating: min_rating..)
      .order(average_rating: :desc, product_id: :asc)
      .limit(20)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（ProductSearch.refresh の SQL のログ。ID と日時を整えた）"
            code={`
Product Pluck  SELECT \`products\`.\`id\`, \`products\`.\`name\`, \`products\`.\`category_id\`, \`categories\`.\`name\`,
  \`products\`.\`price\`, COUNT(reviews.id), ROUND(AVG(reviews.rating), 1) FROM \`products\`
  INNER JOIN \`categories\` ON \`categories\`.\`id\` = \`products\`.\`category_id\`
  LEFT OUTER JOIN \`reviews\` ON \`reviews\`.\`product_id\` = \`products\`.\`id\`
  WHERE \`products\`.\`id\` = 1 GROUP BY \`products\`.\`id\`, \`categories\`.\`name\`
TRANSACTION  BEGIN
ProductSearch Upsert  INSERT INTO \`product_searches\` (\`product_id\`,\`name\`,\`category_id\`,\`category_name\`,\`price\`,
  \`review_count\`,\`average_rating\`,\`refreshed_at\`) VALUES (1, '緑茶', 1, '飲料', 300, 1, 5.0, '2026-11-20 14:34:21.914508')
  AS \`product_searches_values\` ON DUPLICATE KEY UPDATE \`name\`=\`product_searches_values\`.\`name\`, …,
  \`refreshed_at\`=\`product_searches_values\`.\`refreshed_at\`
TRANSACTION  COMMIT
`}
          />
          <p>
            <code>upsert_all</code> は、渡したハッシュの配列から1文の INSERT を作り、<code>AS `product_searches_values`</code> という行の別名を使って、主キーが同じ行を更新しています。<code>upsert_all</code> はモデルの検証とコールバックを通りません<Ref n={20} />。参照用のモデルにはコールバックを置かないので、ここでは問題になりません。
          </p>
          <p>行を作り直すきっかけは、元の表のモデルの <code>after_commit</code> です。</p>
          <Code
            lang="ruby"
            title="app/models/review.rb・product.rb・category.rb・app/jobs/refresh_product_search_job.rb"
            code={`
class Review < ApplicationRecord
  belongs_to :product

  # レビューの作成・変更・削除がコミットされたら、その商品の検索用の行を作り直す
  after_commit { RefreshProductSearchJob.perform_later(product_id) }
end

class Product < ApplicationRecord
  belongs_to :category
  has_many :reviews

  after_commit { RefreshProductSearchJob.perform_later(id) }
end

class Category < ApplicationRecord
  has_many :products

  # カテゴリ名を変えたら、そのカテゴリの全商品の検索用の行を作り直す
  after_update_commit if: :saved_change_to_name? do
    ActiveJob.perform_all_later(product_ids.map { |id| RefreshProductSearchJob.new(id) })
  end
end

class RefreshProductSearchJob < ApplicationJob
  queue_as :summaries

  def perform(product_id)
    ProductSearch.refresh(product_id)
  end
end
`}
          />
          <p>
            カテゴリ名は <code>product_searches</code> の各行に写しているので、カテゴリ名を変えると、そのカテゴリのすべての商品の行を作り直す必要があります。<code>ActiveJob.perform_all_later</code> は、複数のジョブを1回の操作でキューに積みます<Ref n={21} />。<code>after_commit</code> は <code>insert_all</code> や <code>update_all</code> では呼ばれないので<Ref n={20} />、こうした方法でレビューを入れた場合に備えて、<code>ProductSearch.rebuild_all</code> を毎晩の定期実行でも動かします。
          </p>
          <h3>速さを比べる</h3>
          <p>開発環境の同じデータで、参照用の表を作り直し、読む時間を測りました。</p>
          <Code
            lang="text"
            title="実行結果（参照用の表の作り直しと読み取り）"
            code={`
RebuildDailySalesJob（全期間）: 6015 ms  daily_sales=2190行
RebuildDailySalesJob（1日分）: 53 ms
参照用の表から30日分 1回目: 4 ms（180行）
参照用の表から30日分 2回目: 3 ms（180行）
参照用の表から30日分 3回目: 2 ms（180行）
参照用の表から365日分 1回目: 11 ms（2190行）
参照用の表から365日分 2回目: 9 ms（2190行）
参照用の表から365日分 3回目: 10 ms（2190行）
ProductSearch.rebuild_all: 7600 ms  product_searches=20000行
検索用の表から「茶」・評価4以上 1回目: 10 ms（20件）
検索用の表から「茶」・評価4以上 2回目: 6 ms（20件）
検索用の表から「茶」・評価4以上 3回目: 7 ms（20件）
[[8, "麦茶 8", "飲料", 50, "5.0"], [18, "麦茶 18", "飲料", 50, "5.0"], [28, "麦茶 28", "飲料", 50, "5.0"]]
`}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">処理</th>
                  <th scope="col">表示のたびに集計（最初の節）</th>
                  <th scope="col">参照用の表を読む</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">ダッシュボード 30日分</th>
                  <td>317〜757 ms</td>
                  <td>2〜4 ms</td>
                </tr>
                <tr>
                  <th scope="row">1年分のレポート</th>
                  <td>5,066〜7,471 ms</td>
                  <td>9〜11 ms</td>
                </tr>
                <tr>
                  <th scope="row">商品検索（「茶」・評価4以上）</th>
                  <td>1,555〜1,810 ms</td>
                  <td>6〜10 ms</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            読み取りは2桁以上速くなり、検索の結果も最初の節と同じ商品が返りました。その代わり、全期間の作り直しに約6秒、全商品の作り直しに約 7.6 秒かかります。この時間は画面を開いた人ではなく、ジョブのワーカーが払います。検索用の表を読む SQL は <code>product_searches</code> の 20,000 行を順に読んでいます。<code>LIKE '%茶%'</code> は B-tree のインデックスを使えないので、商品がさらに増えたら、全文検索のインデックスや検索エンジンを検討します（<ChapterLink n={50} section="alternatives">「ほかの方法との使い分けと採用の判断」の節</ChapterLink>）。
          </p>
          <h3>リファクタリングの順序</h3>
          <ol>
            <li>集計を1か所にまとめる：画面ごとに書かれていた集計を <code>DailySale.source_totals</code> にまとめ、日付の区切り方（日本時間）をここで決めます。ダッシュボードと CSV は、まずこのメソッドを直接呼ぶように替えます。この段階で、画面ごとの数字の食い違いが直ります。</li>
            <li>許される古さを決める：ダッシュボードは数分〜1時間前のデータでよいか、注文の直後に反映される必要があるかを、画面を使う人と決めます。</li>
            <li>参照用の表を作る：マイグレーションで <code>daily_sales</code> を作り、<code>rebuild</code> と <code>RebuildDailySalesJob</code> を書きます。本番では、最初に全期間を作り直してから次へ進みます。</li>
            <li>更新のきっかけを決める：毎晩の全体の作り直しと、注文の <code>after_commit</code> からの日ごとの作り直しを設定します。</li>
            <li>読む側を置き換える：画面と CSV を <code>DailySale</code> を読むように替え、「いつ時点か」を表示します。</li>
            <li>一致を確かめる：参照用の表と、<code>source_totals</code> で元の表から集計した結果が一致することをテストで確かめます。本番でも、定期的に両者を比べてずれを検知できます。</li>
          </ol>
          <h3>実務的な使用例</h3>
          <ul>
            <li>管理画面のダッシュボード、日次・月次のレポート、ランキングは、多くの場合に数分〜1日前のデータで足ります。毎晩の全体の作り直しと、直近の日だけの頻繁な作り直しを組み合わせます。</li>
            <li>
              全文検索エンジンの索引も、参照用のモデルの一種です。OpenSearch は、索引への変更を既定では1秒ごとに検索できる状態にします<Ref n={24} />。Elasticsearch も、既定では1秒ごとに索引を更新します。ただし、最近30秒間に検索のリクエストを受けていない索引は更新しません<Ref n={25} />。DB の更新から検索に反映されるまで遅れがあることを前提に、画面を設計します。
            </li>
            <li>参照用の表は、書き込み用の表と同じ DB に置くとトランザクションや JOIN を使えます。集計の負荷を本番の書き込みから分けたい場合は、レプリカ（読み取り専用の複製）で集計して書き込む構成もありますが、レプリカの遅れの分だけデータが古くなります。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストと動作の確認',
      body: (
        <>
          <p>参照用のモデルのテストでは、次の4つを確かめます。</p>
          <ul>
            <li>集計の定義：日本時間の日付の境界、取り消した注文を除くこと。</li>
            <li>元の表との一致：作り直した結果が、<code>source_totals</code> で元の表から集計した結果と同じであること。遅い方法の結果を正解として、速い方法の結果と比べます。</li>
            <li>古さと作り直し：作り直すまで新しい注文が反映されないこと、変わった日だけを作り直すこと、いつ時点かが正しいこと。</li>
            <li>更新のきっかけ：注文やレビューのコミットでジョブが積まれ、実行すると反映されること。</li>
          </ul>
          <Code
            lang="ruby"
            title="spec/models/daily_sale_spec.rb"
            code={`
require "rails_helper"

RSpec.describe DailySale do
  let(:drink) { Category.create!(name: "飲料") }
  let(:dish) { Category.create!(name: "食器") }
  let(:tea) { Product.create!(name: "緑茶", category: drink, price: 300) }
  let(:cup) { Product.create!(name: "湯のみ", category: dish, price: 1200) }
  let(:nov12) { Date.new(2026, 11, 12) }
  let(:nov13) { Date.new(2026, 11, 13) }

  def order!(at, product, quantity)
    Order.create!(ordered_at: Time.zone.parse(at),
                  items_attributes: [{ product:, quantity:, unit_price: product.price }])
  end

  def table = DailySale.order(:sales_date, :category_id)
    .map { |s| [s.sales_date.to_s, s.category.name, s.revenue, s.order_count] }

  it "日本時間の日付で集計する（0時をまたぐ注文）" do
    order!("2026-11-12 23:30", tea, 2)
    order!("2026-11-13 00:10", tea, 1)
    order!("2026-11-13 08:59", cup, 1) # UTC では 11月12日 23:59
    described_class.rebuild(nov12, nov13)

    expect(table).to eq([["2026-11-12", "飲料", 600, 1],
                         ["2026-11-13", "飲料", 300, 1],
                         ["2026-11-13", "食器", 1200, 1]])
  end

  it "作り直すまでは、新しい注文が反映されない" do
    order!("2026-11-13 10:00", tea, 2)
    described_class.rebuild(nov13, nov13)
    order!("2026-11-13 11:00", tea, 1)
    expect(described_class.find([nov13, drink.id]).revenue).to eq(600)

    described_class.rebuild(nov13, nov13)
    expect(described_class.find([nov13, drink.id])).to have_attributes(revenue: 900, order_count: 2)
  end

  it "作り直した結果は、元の表から毎回集計した結果と一致する" do
    order!("2026-11-12 09:00", tea, 3)
    order!("2026-11-12 20:00", cup, 1)
    order!("2026-11-13 07:00", tea, 1).cancel!
    order!("2026-11-13 12:00", cup, 2)
    described_class.rebuild(nov12, nov13)

    columns = ->(s) { [s.sales_date, s.category_id, s.revenue, s.order_count] }
    expected = described_class.source_totals(nov12, nov13).map(&columns)
    expect(described_class.all.map(&columns)).to match_array(expected)
  end

  it "注文の取り消しで売上がなくなった行は、作り直すと消える" do
    order = order!("2026-11-13 10:00", cup, 1)
    described_class.rebuild(nov13, nov13)
    expect(table).to eq([["2026-11-13", "食器", 1200, 1]])

    order.cancel!
    described_class.rebuild(nov13, nov13)
    expect(table).to eq([])
  end

  it "変わった日だけを作り直す。ほかの日の行と集計の時刻は変わらない" do
    order!("2026-11-12 10:00", tea, 1)
    order!("2026-11-13 10:00", tea, 1)
    travel_to(Time.zone.parse("2026-11-13 12:00")) { described_class.rebuild(nov12, nov13) }
    order!("2026-11-13 13:00", tea, 1)
    travel_to(Time.zone.parse("2026-11-13 14:00")) { described_class.rebuild(nov13, nov13) }

    expect(described_class.order(:sales_date).pluck(:sales_date, :revenue, :refreshed_at))
      .to eq([[nov12, 300, Time.zone.parse("2026-11-13 12:00")],
              [nov13, 600, Time.zone.parse("2026-11-13 14:00")]])
    expect(described_class.as_of(nov12, nov13)).to eq(Time.zone.parse("2026-11-13 12:00"))
  end

  it "読み取り専用で、モデルからは保存できない" do
    order!("2026-11-13 10:00", tea, 1)
    described_class.rebuild(nov13, nov13)
    expect { described_class.first.update!(revenue: 0) }.to raise_error(ActiveRecord::ReadOnlyRecord)
  end

  it "update_all は readonly? を確かめない。直接直した値は、作り直すと元に戻る" do
    order!("2026-11-13 10:00", tea, 1)
    described_class.rebuild(nov13, nov13)
    described_class.where(sales_date: nov13).update_all(revenue: 0)
    expect(described_class.first.revenue).to eq(0)

    described_class.rebuild(nov13, nov13)
    expect(described_class.first.revenue).to eq(300)
  end
end
`}
          />
          <p>
            最初の例は、日本時間の 0 時の前後と、UTC では前の日になる 08:59 の注文で、日付の境界を確かめています。3つ目の例は、取り消した注文を含むデータで、作り直した表と <code>source_totals</code> の結果を比べています。5つ目の例は <code>travel_to</code>（<code>ActiveSupport::Testing::TimeHelpers</code> のメソッドで、テストの間だけ現在の時刻を固定する。この章のアプリでは rails_helper.rb で include している）で作り直しの時刻を固定し、2回目の作り直しで 11月12日の行が変わらないことと、<code>as_of</code> が古い方の時刻を返すことを確かめています。
          </p>
          <p>
            これらの例は RSpec の既定どおり、例ごとに1つのトランザクションの中で実行し、最後にロールバックします（<ChapterLink n={20} section="transaction" />の「トランザクションによる巻き戻し」）。Rails 8.1.4.1 は、このテスト用のトランザクションの中で <code>transaction(isolation: …)</code> が呼ばれた場合、分離レベルの名前が正しいかを確かめたうえで、指定を無視します<Ref n={17} />。そのため、rebuild の結果はテストで確かめられますが、READ COMMITTED でロックを取らないことは確かめられません。ロックの違いは、<ChapterLink n={50} section="mysql-summary">「MySQL で集計表を作り直す」の節</ChapterLink>のように別々の接続で確かめます。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 では、テスト用のトランザクションの中で <code>transaction(isolation: :read_committed)</code> を呼ぶと、入れ子のトランザクション（セーブポイント）に分離レベルを指定したことになり、<code>ActiveRecord::TransactionIsolationError</code>（cannot set transaction isolation in a nested transaction）になります<Ref n={18} />。7.2 でこの章の rebuild をテストするには、その spec だけ <code>self.use_transactional_tests = false</code> にしてデータを自分で消すか、テストの環境では isolation を渡さないようにします。
            </p>
          </Callout>
          <p>ジョブを積むきっかけと、ジョブを実行したときの反映を確かめます。</p>
          <Code
            lang="ruby"
            title="spec/models/order_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Order do
  include ActiveJob::TestHelper

  let(:tea) { Product.create!(name: "緑茶", category: Category.create!(name: "飲料"), price: 300) }

  it "注文を保存・取り消しすると、その日の売上を作り直すジョブを積む" do
    order = nil
    expect {
      order = Order.create!(ordered_at: Time.zone.parse("2026-11-13 08:30"),
                            items_attributes: [{ product: tea, quantity: 2, unit_price: 300 }])
    }.to have_enqueued_job(RebuildDailySalesJob).with(Date.new(2026, 11, 13), Date.new(2026, 11, 13))

    expect { order.cancel! }.to have_enqueued_job(RebuildDailySalesJob).exactly(:once)
  end

  it "日付を変えたら、変更の前と後の両方の日を作り直す" do
    order = Order.create!(ordered_at: Time.zone.parse("2026-11-13 08:30"))
    expect { order.update!(ordered_at: Time.zone.parse("2026-11-14 09:00")) }
      .to have_enqueued_job(RebuildDailySalesJob).with(Date.new(2026, 11, 13), Date.new(2026, 11, 13))
      .and have_enqueued_job(RebuildDailySalesJob).with(Date.new(2026, 11, 14), Date.new(2026, 11, 14))
  end

  it "積んだジョブを実行すると、参照用の表に反映される" do
    perform_enqueued_jobs do
      Order.create!(ordered_at: Time.zone.parse("2026-11-13 08:30"),
                    items_attributes: [{ product: tea, quantity: 2, unit_price: 300 }])
    end
    expect(DailySale.pluck(:sales_date, :revenue)).to eq([[Date.new(2026, 11, 13), 600]])
  end
end
`}
          />
          <p>
            テストの環境では Active Job の :test アダプターを使うので、ジョブは実行されずに記録だけされます。<code>have_enqueued_job</code> は積まれたジョブのクラスと引数を、<code>perform_enqueued_jobs</code> はブロックの中で積まれたジョブをその場で実行します（<ChapterLink n={20} section="jobs-mail" />の「ジョブとメールのテスト」）。<code>after_commit</code> は、テスト用のトランザクションの中でも、<code>create!</code> のトランザクションが終わった時点で呼ばれます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/product_search_spec.rb（抜粋）"
            code={`
it "レビューを追加すると、ジョブがその商品の行を作り直す" do
  green, black = perform_enqueued_jobs do
    [Product.create!(name: "緑茶", category: drink, price: 300),
     Product.create!(name: "紅茶", category: drink, price: 400)]
  end
  expect(ProductSearch.find(green.id)).to have_attributes(review_count: 0, average_rating: nil)

  expect { Review.create!(product: green, rating: 5) }
    .to have_enqueued_job(RefreshProductSearchJob).with(green.id)
  perform_enqueued_jobs do
    Review.create!(product: green, rating: 4)
    Review.create!(product: black, rating: 3)
  end

  expect(ProductSearch.search("茶", min_rating: 4).map { |s| [s.name, s.review_count, s.average_rating.to_s] })
    .to eq([["緑茶", 2, "4.5"]])
end

it "insert_all はコールバックを通らないので反映されない。rebuild_all で作り直せる" do
  product = perform_enqueued_jobs { Product.create!(name: "緑茶", category: drink, price: 300) }
  Review.insert_all([{ product_id: product.id, rating: 5 }])
  expect(ProductSearch.find(product.id).review_count).to eq(0)

  ProductSearch.rebuild_all
  expect(ProductSearch.find(product.id).review_count).to eq(1)
end
# …（カテゴリ名の変更・商品の削除・読み取り専用の例は省略）
`}
          />
          <p>
            1つ目の例で、緑茶の最初のレビュー（評価5）は <code>perform_enqueued_jobs</code> の外で作ったので、ジョブは積まれただけで実行されていません。その後のブロックで緑茶のジョブが実行されたとき、元の表には評価5と4の2件があるので、行は2件・平均 4.5 で作り直されます。ジョブは「その時点の元の表から作り直す」ので、どのジョブがどの順で動いても、最後に動いたジョブの時点の値になります。
          </p>
          <p>最後に、ダッシュボードが参照用の表を読み、いつ時点かを表示することを、リクエストの spec で確かめます。</p>
          <Code
            lang="ruby"
            title="spec/requests/sales_dashboards_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "売上のダッシュボード", type: :request do
  it "参照用の表を読み、いつ時点の集計かを表示する" do
    tea = Product.create!(name: "緑茶", category: Category.create!(name: "飲料"), price: 300)
    travel_to(Time.zone.parse("2026-11-20 09:00")) do
      Order.create!(ordered_at: Time.zone.parse("2026-11-19 15:00"),
                    items_attributes: [{ product: tea, quantity: 2, unit_price: 300 }])
      RebuildDailySalesJob.perform_now
    end

    travel_to(Time.zone.parse("2026-11-20 09:40")) { get admin_sales_dashboard_path }
    expect(response.body).to include("2026-11-20 09:00 時点の集計です")
    expect(response.body).to include("<td>2026-11-19</td><td>飲料</td>")
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation。MySQL 8.4.13）"
            code={`
DailySale
  日本時間の日付で集計する（0時をまたぐ注文）
  作り直すまでは、新しい注文が反映されない
  作り直した結果は、元の表から毎回集計した結果と一致する
  注文の取り消しで売上がなくなった行は、作り直すと消える
  変わった日だけを作り直す。ほかの日の行と集計の時刻は変わらない
  読み取り専用で、モデルからは保存できない
  update_all は readonly? を確かめない。直接直した値は、作り直すと元に戻る

Order
  注文を保存・取り消しすると、その日の売上を作り直すジョブを積む
  日付を変えたら、変更の前と後の両方の日を作り直す
  積んだジョブを実行すると、参照用の表に反映される

ProductSearch
  レビューを追加すると、ジョブがその商品の行を作り直す
  カテゴリ名を変えると、そのカテゴリの全商品の行を作り直す
  商品を消すと、検索用の行も消える
  insert_all はコールバックを通らないので反映されない。rebuild_all で作り直せる
  読み取り専用で、モデルからは保存できない

環境
  MySQL 8.4 につながる

売上のダッシュボード
  参照用の表を読み、いつ時点の集計かを表示する

Finished in 0.39549 seconds (files took 0.85774 seconds to load)
17 examples, 0 failures
`}
          />
        </>
      ),
    },
    {
      id: 'consequences',
      title: '効果と代償',
      body: (
        <>
          <h3>得られるもの</h3>
          <ul>
            <li>表示のたびに結合や集計をしないので、読み取りが速くなり、データが増えても表示の時間が変わりにくくなります。この章のデータでは、30日分のダッシュボードが 0.3〜0.8 秒から 2〜4 ミリ秒に、商品検索が約 1.6 秒から 10 ミリ秒以下になりました。</li>
            <li>集計の定義が <code>source_totals</code> の1か所にまとまり、ダッシュボードと CSV とレポートで数字が食い違わなくなります。</li>
            <li>検索の SQL が1つの表だけを読む単純な形になり、評価の平均に直接インデックスを付けられます。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>同じデータを2か所に持つので、更新の処理と、ずれたときの作り直しの処理が必要になります。この章では、作り直しのジョブ2つ、コールバック4つ、参照用のモデル2つが増えました。</li>
            <li>データが古くなりうることを、画面の設計と、画面を使う人への説明に含める必要があります。</li>
            <li>作り直しのジョブを定期的に動かし、止まっていないかを監視する運用が必要になります。全期間の作り直しは、この章のデータで約6秒かかり、データとともに長くなります。</li>
            <li>MySQL では、作り直しの分離レベル、日本時間の日付、upsert の書き方など、DB の機能のマテリアライズドビューなら DB が受け持つ部分を、自分で書きます。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            参照用のモデルが正しいかは、元の表から集計した結果と比べるテストで確かめられます。集計の定義を1か所に置いたので、このテストの正解を作るコードと本番の作り直しのコードが同じ定義を使います。集計の定義を変えるときは、全期間を作り直す手順も一緒にリリースの手順に入れます。参照用のモデルには書き込みのコールバックを置かず、どの処理が参照用の表を書き換えるかを、作り直しのメソッドとジョブに限っておくと、不具合の調査で読むコードが少なくなります。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>参照用のモデルに直接書き込む</h3>
          <p>
            「昨日の売上が間違っている」と報告を受けて、集計の表を直接直すことがあります。
          </p>
          <Code
            lang="ruby"
            title="誤用：rails console で集計の表を直す"
            code={`
DailySale.where(sales_date: Date.new(2026, 11, 13)).update_all(revenue: 0)
`}
          />
          <p>
            <code>readonly?</code> は <code>update_all</code> を止めないので、この操作は成功します。しかし、元の表は直っていないので、次に作り直すと直した値は消えます（「テストと動作の確認」の節の daily_sale_spec.rb の最後の例）。CSV の出力などが元の表から直接集計していれば、画面と CSV の数字も食い違います。Azure の説明も、参照する側がビューを直接更新しないことを前提にしています<Ref n={1} />。直すときは、元の表（注文や明細）を直してから、その日を作り直します。
          </p>
          <h3>作り直せない集計を持つ</h3>
          <p>
            古い注文を消してテーブルを小さくする処理を入れると、集計だけが残り、作り直せなくなります。
          </p>
          <Code
            lang="ruby"
            title="誤用：古い注文を消した後に、全期間を作り直す"
            code={`
Order.where(ordered_at: ...2.years.ago).in_batches.destroy_all # 2年より前の注文を消す
DailySale.rebuild(Date.new(2020, 1, 1), Date.current)          # 2年より前の行も消える
`}
          />
          <p>
            <code>rebuild</code> は範囲の中で今回の集計に現れなかった行を消すので、元の注文がない期間を範囲に入れると、その期間の売上の行が消えます。元のデータを消す場合は、消した期間の集計を作り直す必要がないことを確かめ、その期間を作り直しの範囲から外します。あるいは、締めた月の売上を <code>monthly_sales_closings</code> のような別の表に正しいデータとして保存し、参照用のモデルとは別に扱います。
          </p>
          <h3>いつ時点かを示さない</h3>
          <p>
            古いデータを最新のように表示すると、画面を使う人は直前の注文が反映されていないことを不具合と考えます。画面に <code>as_of</code> の時刻を表示し、どれだけ古くなりうるかを決めておきます。作り直しのジョブが止まっていると、表示の時刻は古いまま進まないので、最新の <code>refreshed_at</code> が決めた古さ（たとえば毎晩の作り直しなら 26 時間）を超えたら通知する監視も用意します。
          </p>
          <h3>書き込みの処理の外で集計の表を更新する</h3>
          <p>
            集計の表に今回の注文の分を足す処理を、注文のコミットの後のジョブで行うと、注文の保存と加算が別々に確定します。ジョブが再試行で2回動けば2回足され、ジョブが失われれば足されません。注文の分を足すジョブと、この章の作り直すジョブを、それぞれ2回実行して比べました。
          </p>
          <Code
            lang="ruby"
            title="誤用：コミットの後のジョブで今回の注文の分を足す"
            code={`
class AddOrderToDailySalesJob < ApplicationJob
  def perform(order_id)
    order = Order.find(order_id)
    date = order.ordered_at.to_date
    totals = DailySale.source_totals(date, date).where(orders: { id: order.id })
      .select("NOW() AS refreshed_at")
    DailySale.with_connection do |c|
      c.update(<<~SQL)
        INSERT INTO daily_sales (sales_date, category_id, revenue, order_count, refreshed_at)
        SELECT * FROM (#{totals.to_sql}) AS totals
        ON DUPLICATE KEY UPDATE revenue = daily_sales.revenue + totals.revenue,
                                order_count = daily_sales.order_count + totals.order_count
      SQL
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（緑茶 300 円 × 2 の注文1件。[売上, 注文数]）"
            code={`
足すジョブ 1回目: [[600, 1]]
足すジョブ 2回目: [[1200, 2]]
作り直すジョブ 1回目: [[600, 1]]
作り直すジョブ 2回目: [[600, 1]]
`}
          />
          <p>
            足すジョブは2回目で売上が倍になり、作り直すジョブは何回動いても同じでした。Sidekiq は、ジョブが例外で終わったときや、ワーカーのプロセスが止まったときにジョブを再実行するので（<ChapterLink n={18} section="idempotency" />の「再試行や停止に備える冪等性」）、足す処理は二重に数えることがあります。
          </p>
          <p>
            足す方式で最新の値を保ちたいなら、注文を保存するトランザクションの中で足します。注文の保存が失敗すれば加算も取り消され、加算が失敗すれば注文も保存されません。それでも差分の加算は、不具合や手作業の修正でずれることがあるので、全体を作り直す処理も用意します。コミットの後に別の処理で反映するなら、作り直す方式にするか、イベントを確実に届ける仕組み（<ChapterLink n={53} section="idea" />）と、受け取る側で同じイベントの重複を捨てる仕組み（<ChapterLink n={52} section="idea" />）を組み合わせます。
          </p>
          <h3>何でも事前に計算する</h3>
          <p>
            元の表を直接読んでも十分に速い画面まで参照用のモデルを作ると、更新と監視の手間が増えるだけです。先に <code>EXPLAIN ANALYZE</code> で時間のかかっている部分を調べ、インデックスの追加や SQL の見直しで足りないかを確かめます。最初の節の30日分のダッシュボードは 0.3〜0.8 秒でした。社内の数人が1日に数回開くだけの画面なら、この時間を受け入れて、参照用のモデルを作らない判断もあります。作るのは、表示の遅さや DB の負荷が実際に問題になっている画面と、同じ集計を複数の場所で使っている場合です。
          </p>
        </>
      ),
    },
    {
      id: 'alternatives',
      title: 'ほかの方法との使い分けと採用の判断',
      body: (
        <>
          <h3>より単純な方法</h3>
          <ul>
            <li>
              インデックスと SQL を見直す：集計が遅い原因が、インデックスがないことや無駄な結合であれば、参照用のモデルを作らずに解決できます。<ChapterLink n={37} section="explain-rails" />の方法で実行計画を確かめ、読む行数を減らせないかを先に調べます。
            </li>
            <li>
              件数だけなら counter_cache：<code>belongs_to :product, counter_cache: true</code> とし、<code>products</code> に <code>reviews_count</code> 列を用意すると、Rails はレビューの作成と削除のたびに件数の列を1つずつ増減します<Ref n={22} />。書き込みと同時に更新する方式の、最も簡単な例です。ただし <code>insert_all</code> などコールバックを通らない書き込みでは更新されず、ずれた件数は <code>reset_counters</code> で直します<Ref n={22} />。平均や、複数の表を結合した値は扱えません。
            </li>
            <li>
              同じ結果を短い時間だけ使い回すなら Rails.cache：<code>Rails.cache.fetch(["daily_sales", from, to], expires_in: 1.hour) {'{'} … {'}'}</code> のように集計の結果をキャッシュに保存すると、2回目以降の表示は速くなります（<ChapterLink n={22} section="rails-cache" />の「Rails.cache とキャッシュストア」）。ただし、キャッシュが切れた後の最初の表示は元の表を集計するので遅く、期間や条件の組み合わせごとに別のキーになります。条件で絞り込んで並べ替える商品検索のように、条件の組み合わせが多い画面には向きません。
            </li>
          </ul>
          <h3>PostgreSQL ならマテリアライズドビューを使える</h3>
          <p>
            PostgreSQL を使うアプリなら、DB の機能のマテリアライズドビューを使えます。Rails のマイグレーションと schema.rb はマテリアライズドビューを扱う専用のメソッドを持たないので、scenic gem を使うと、ビューの定義を版ごとの SQL ファイルで管理し、マイグレーションで作れます<Ref n={23} />。次のコードは MSDP の第11章の Rails の例（PostgreSQL 18 で動かしたもの）で、本書の MySQL の環境では動かしていません。
          </p>
          <Code
            lang="ruby"
            title="PostgreSQL と scenic の例（MSDP の第11章から。db/migrate と app/models/daily_sale.rb の抜粋）"
            code={`
# db/views/daily_sales_v01.sql の SELECT でマテリアライズドビューを作る
create_view :daily_sales, materialized: true
# REFRESH ... CONCURRENTLY には、全行を対象にした一意のインデックスが必要
add_index :daily_sales, [:sales_date, :department], unique: true

class DailySale < ApplicationRecord
  self.table_name = "daily_sales"
  self.primary_key = [:sales_date, :department]

  def readonly? = true

  # 作り直す。CONCURRENTLY を付けると、作り直している間も古い内容を読める
  def self.refresh
    with_connection { |connection| connection.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales") }
  end
end
`}
          />
          <p>
            <code>REFRESH MATERIALIZED VIEW</code> は中身を全部入れ替えます。<code>CONCURRENTLY</code> を付けると、作り直している間もビューを読めますが、そのためには式や WHERE を使わず全行を対象にした一意のインデックスが必要です<Ref n={4} />。scenic の README も、CONCURRENTLY を付けない作り直しは終わるまで SELECT を止めると説明しています<Ref n={23} />。変わった部分だけを自動で反映する機能は、MSDP の制作時点で確認した PostgreSQL 19 のリリースノートにも含まれていません<Ref n={29} />。scenic は PostgreSQL のアダプターだけを同梱していて、MySQL の公式のアダプターはありません<Ref n={23} />。この章のように、日付の範囲だけを作り直したい場合は、PostgreSQL でも集計表とジョブの方式を選べます。
          </p>
          <h3>検索エンジン（OpenSearch・Elasticsearch）</h3>
          <p>
            キーワードの部分一致、表記の揺れ、関連度の順の並べ替えが必要な検索なら、OpenSearch や Elasticsearch のような検索エンジンに商品の索引を作ります。索引も商品の情報から作り直せる参照用のモデルで、この章の <code>product_searches</code> と同じく、商品やレビューのコミットの後にジョブで送り、定期的に全件を作り直します。索引への変更が検索できるようになるまでには遅れがあります<Ref n={24} /><Ref n={25} />。検索エンジンのサーバーの運用と、DB との食い違いの確認が増えるので、MySQL の表と LIKE やインデックスで足りるうちは、この章の方法で始めます。
          </p>
          <h3>キャッシュとの違い</h3>
          <p>
            Cache-Aside パターンは、必要になったときに元のデータを読み、キャッシュに保存します<Ref n={28} />。キャッシュは同じ結果を速く読むための写しで、消えたら元のデータから読み直します。Materialized View は、元のデータとは違う形（集計・結合した形）のデータを、表示より前に作っておく点が違います。Azure の説明は、マテリアライズドビューを特化したキャッシュの一種とも述べています<Ref n={1} />。
          </p>
          <h3>CQRS との違い</h3>
          <p>
            <Term en="Command Query Responsibility Segregation">CQRS</Term> は、更新に使うモデルと、読み取りに使うモデルを分ける考え方です。Fowler は、多くのシステムでは CQRS が危険な複雑さを持ち込むと注意しています<Ref n={26} />。Azure の CQRS の説明は、読み取り用のデータストアにマテリアライズドビューを置く例を挙げています<Ref n={27} />。この章は、CQRS の全体ではなく、特定の画面のために読み取り用のデータを用意する部分だけを扱っています。書き込みは今までどおり Active Record のモデルで行い、読み取り用の表を2つ加えただけです。
          </p>
                    <h3>採用する条件</h3>
          <ul>
            <li>結合や集計が重く、表示のたびに実行すると遅い（インデックスや SQL の見直しでは足りない）</li>
            <li>同じ集計を、複数の画面・CSV・レポートで使う</li>
            <li>表示するデータが、数分〜数時間古くても業務上問題がない（作り直す方式）。または、書き込みの負担を増やしてでも最新にしたい（同じトランザクションで加算する方式）</li>
          </ul>
          <h3>採用しない方がよい条件</h3>
          <ul>
            <li>元のデータが単純で、そのまま問い合わせても速い</li>
            <li>元のデータが非常に頻繁に変わり、事前に計算した結果がすぐに古くなる</li>
            <li>常に最新で、元のデータと完全に一致している必要がある（Azure の説明も、この3つを向かない場合に挙げています<Ref n={1} />）。在庫の数や残高のように、判断にそのまま使う値は、元の表から読みます</li>
          </ul>
          <h3>判断のチェックポイント</h3>
          <ol>
            <li>EXPLAIN ANALYZE で時間のかかっている部分を調べ、インデックスや SQL の見直しで足りないことを確かめたか</li>
            <li>画面ごとに、データがどれだけ古くてよいかを決めたか</li>
            <li>参照用のモデルを、元のデータから作り直せるか。元のデータを消す予定はないか</li>
            <li>画面に「いつ時点のデータか」を表示し、作り直しの停止を監視しているか</li>
            <li>参照用のモデルと元のデータの一致を、テストで確かめているか</li>
            <li>日付の区切り（タイムゾーン）を、集計の定義で明示しているか</li>
            <li>MySQL で INSERT … SELECT を使うなら、元の表をロックしない分離レベルにしたか</li>
          </ol>
          <Callout kind="note" title="この章の2つの方式の選び方">
            <p>
              ダッシュボードの売上の推移は、毎晩の全体の作り直しと、注文のコミットの後の日ごとの作り直しで足ります。「今日の売上」を注文の直後に正確に表示したい場合は、注文と同じトランザクションで加算する方式を選び、毎晩の全体の作り直しで、ずれを直します。在庫の数のように古い値で判断すると困る値は、参照用のモデルにせず、元の表から読みます。
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
          <li>Materialized View は、画面や検索が必要とする形に集計・結合したデータを保存し、読み取りを速くするパターンです。MSDP のカタログでは、DB のマテリアライズドビューに限らず、集計の表や検索用の表、検索エンジンの索引も含めます。</li>
          <li>正しいデータは書き込み用のモデルにあり、参照用のモデルはそこから作り直せる写しとして扱います。参照用のモデルは <code>readonly?</code> で保存を防ぎ、直すときは元の表を直して作り直します。</li>
          <li>更新の方式（全体の作り直し、変わった部分の作り直し、同じトランザクションでの加算、イベントによる更新）は、許されるデータの古さと書き込みの負担で選びます。コミットの後に別の処理で反映するなら、足すのではなく作り直す処理にすると、再実行されても結果が変わりません。</li>
          <li>MySQL 8.4 にはマテリアライズドビューがないので、通常のテーブルを INSERT … SELECT … ON DUPLICATE KEY UPDATE か upsert_all で作り直します。GROUP BY を使う SELECT は派生テーブルにし、今回の集計に現れなかった行は消します。</li>
          <li>既定の REPEATABLE READ の INSERT … SELECT は、読んだ元の行に共有ロックを取り、その間の注文の更新を待たせます。作り直しは READ COMMITTED で行うか、SELECT と upsert_all に分けます。</li>
          <li>Rails は datetime を UTC で保存します。日本時間の日付は <code>CONVERT_TZ(列, '+00:00', '+09:00')</code> か <code>+ INTERVAL 9 HOUR</code> で求め、名前で指定する CONVERT_TZ はタイムゾーンの表がないと NULL を返します。日付で絞る条件は UTC の範囲で書きます。</li>
          <li>画面には <code>refreshed_at</code> から求めた「いつ時点か」を表示し、テストでは参照用のモデルと元の表から集計した結果の一致、日付の境界、ジョブを積むきっかけを確かめます。</li>
          <li>インデックスや SQL の見直し、counter_cache、Rails.cache で足りるなら、参照用のモデルは作りません。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Materialized View pattern', publisher: 'Microsoft Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view', accessed: '2026-11-13', version: '2026年9月21日更新', note: '参照用のモデルとしての定義、作り直せること、鮮度と監視、更新の方式、直接更新しないこと、向かない場合。' },
    { title: 'MySQL 8.4 FAQ: Views', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/faqs-views.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'A.6.5「MySQL にマテリアライズドビューはあるか」の答えが No であること。' },
    { title: 'CREATE MATERIALIZED VIEW', publisher: 'PostgreSQL 18 Documentation', url: 'https://www.postgresql.org/docs/18/sql-creatematerializedview.html', accessed: '2026-11-13', note: 'SELECT の結果を保存し、後で作り直せるオブジェクトであること。' },
    { title: 'REFRESH MATERIALIZED VIEW', publisher: 'PostgreSQL 18 Documentation', url: 'https://www.postgresql.org/docs/18/sql-refreshmaterializedview.html', accessed: '2026-11-13', note: '中身を全部入れ替えること、CONCURRENTLY と、それに必要な一意のインデックスの条件。' },
    { title: 'Materialized Views', publisher: 'PostgreSQL 18 Documentation', url: 'https://www.postgresql.org/docs/18/rules-materializedviews.html', accessed: '2026-11-13', note: 'マテリアライズドビューのデータは常に最新とは限らないこと。' },
    { title: 'Eventually Consistent - Revisited', publisher: 'Werner Vogels／All Things Distributed', url: 'https://www.allthingsdistributed.com/2008/12/eventually_consistent.html', accessed: '2026-11-13', version: '2008年12月23日', note: '結果整合性の定義。' },
    { title: 'INSERT ... ON DUPLICATE KEY UPDATE Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/insert-on-duplicate.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'VALUES() による参照が非推奨で行の別名を使うこと、GROUP BY を使う INSERT … SELECT では派生テーブルの列を参照すること。' },
    { title: 'Locks Set by Different SQL Statements in InnoDB', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'INSERT INTO T SELECT … FROM S は、READ COMMITTED なら S を一貫性読み取りで読み、それ以外では S の行に共有のネクストキーロックを取ること。' },
    { title: 'Consistent Nonlocking Reads', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: '一貫性読み取りはロックを取らず、ほかのセッションが同時に表を変更できること。READ COMMITTED と REPEATABLE READ の SELECT の既定の方式であること。' },
    { title: 'MySQL Server Time Zone Support', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/time-zone-support.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'DATETIME の値はセッションのタイムゾーンに影響されないこと、名前のタイムゾーンには表の作成と読み込みが必要で、インストールは表を作るがデータは入れないこと、表を更新し続けること。' },
    { title: 'Date and Time Functions（CONVERT_TZ）', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'CONVERT_TZ は引数が正しくないと NULL を返すこと、時差の形と名前の形の指定。' },
    { title: 'RENAME TABLE Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/rename-table.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: '名前の変更は不可分に行われ、変更の途中ではほかのセッションがどちらの表にもアクセスできないこと。' },
    { title: 'EXPLAIN Statement（Obtaining Information with EXPLAIN ANALYZE）', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/explain.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'EXPLAIN ANALYZE が SQL を実行し、実行計画の各段階の時間と行数を表示すること。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L693-L716`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'MySQL 8.0.19 以降で upsert_all が行の別名（表名_values）を使う SQL を作ること。' },
    { title: 'activerecord/lib/active_record/insert_all.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/insert_all.rb#L186-L188`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '衝突の対象を指定できない DB（MySQL）で unique_by を渡すと ArgumentError になること。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/query_cache.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/query_cache.rb#L13-L15`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'クエリキャッシュを消すメソッドの一覧に update は含まれ、exec_update は含まれないこと。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb#L355-L370`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'テスト用のトランザクションの中では isolation の指定を確かめたうえで無視すること。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/transaction.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/activerecord/lib/active_record/connection_adapters/abstract/transaction.rb#L405-L412', accessed: '2026-11-20', version: 'Rails 7.2.4', note: 'セーブポイントのトランザクションに分離レベルを指定すると TransactionIsolationError になること。' },
    { title: 'activerecord/lib/active_record/persistence.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L923-L924`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '保存のときに readonly? が true なら ReadOnlyRecord を投げること。' },
    { title: 'Active Record Callbacks（Skipping Callbacks・Transaction Callbacks）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_record_callbacks.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'insert_all・update_all・upsert_all などがコールバックを通らないこと、after_commit。' },
    { title: 'Active Job Basics（Supported Argument Types・Bulk Enqueuing）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_job_basics.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'Date を引数に渡せること、perform_all_later で複数のジョブをまとめて積むこと。' },
    { title: 'Active Record Associations（Counter Cache）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/association_basics.html', accessed: '2026-11-13', version: 'v8.1.4.1', note: 'counter_cache による件数の列の更新と、reset_counters。' },
    { title: 'scenic-views/scenic（README）', publisher: 'GitHub', url: 'https://github.com/scenic-views/scenic', accessed: '2026-11-20', version: '1.9.0（2025年6月30日）', note: 'ビューを版ごとの SQL ファイルで管理すること、materialized の作り直しと concurrently の条件、PostgreSQL のアダプターだけを同梱していること。' },
    { title: 'Index settings（index.refresh_interval）', publisher: 'OpenSearch Documentation', url: 'https://docs.opensearch.org/latest/install-and-configure/configuring-opensearch/index-settings/', accessed: '2026-11-20', note: '変更を検索できるようにする間隔の既定値が1秒であること。' },
    { title: 'Near real-time search', publisher: 'Elastic Docs', url: 'https://www.elastic.co/docs/manage-data/data-store/near-real-time-search', accessed: '2026-11-20', note: '既定では1秒ごとに索引を更新し、最近30秒間に検索を受けていない索引は更新しないこと。' },
    { title: 'CQRS', publisher: 'Martin Fowler／martinfowler.com', url: 'https://martinfowler.com/bliki/CQRS.html', accessed: '2026-11-13', version: '2011年7月14日', note: '更新と読み取りのモデルを分ける考え方と、多くのシステムでは複雑さが増すという注意。' },
    { title: 'CQRS pattern', publisher: 'Microsoft Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs', accessed: '2026-11-13', note: '読み取り用のデータストアにマテリアライズドビューを置く例。' },
    { title: 'Cache-Aside pattern', publisher: 'Microsoft Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside', accessed: '2026-11-13', note: '必要になったときに元のデータからキャッシュに読み込むこと。' },
    { title: 'Release 19', publisher: 'PostgreSQL 19 Documentation', url: 'https://www.postgresql.org/docs/19/release-19.html', accessed: '2026-11-13', version: '2026年10月9日時点の版', note: 'マテリアライズドビューの差分の自動更新が含まれていないこと（MSDP の制作時点の確認）。' },
    { title: 'Ent Periodic Jobs', publisher: 'Sidekiq Wiki（GitHub）', url: 'https://github.com/sidekiq/sidekiq/wiki/Ent-Periodic-Jobs', accessed: '2026-11-20', note: '定期実行（periodic jobs）が Sidekiq Enterprise の機能であること。' },
  ],
}

export default chapter
