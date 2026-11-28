import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 86-1 注文の合計を2か所に持つ構成と、欠品の後に食い違う箇所 ---------- */
const sceneReaders = [
  { y: 12, lines: ['管理画面の注文の一覧', 'total_amount の大きい順'], tone: 'muted' as const, x1: 500, y1: 36 },
  { y: 76, lines: ['変更のお知らせのメール', 'total_amount → 3,754円'], tone: 'danger' as const, x1: 500, y1: 50 },
  { y: 140, lines: ['決済の管理画面（返金）', 'amount − total_amount → 0円'], tone: 'danger' as const, x1: 500, y1: 64 },
  { y: 216, lines: ['注文の詳細ページ', 'calculate_total → 2,474円'], tone: 'muted' as const, x1: 500, y1: 230 },
]

function SceneFigure() {
  return (
    <Svg
      id="86-1"
      w={780}
      h={420}
      label="直す前の構成。中央に4つのテーブルがある。orders は total_amount を持ち、注文した時の 3,754円のまま。payments は決済サービスが確定した amount 3,754円を持つ。order_items は注文した時点の価格 unit_price と数量 quantity を持ち、欠品の後はコーヒー豆1袋とフィルター3箱。products は今の価格を持ち、注文した時に unit_price へ写す。左の Checkout は orders・payments・order_items に書き、StockShortageJob は order_items の数量だけを減らし、total_amount は直さない。右の読む側のうち、管理画面の一覧・変更のお知らせのメール・決済の管理画面は total_amount を読み、メールは 3,754円、返金する金額は 0円になる。注文の詳細ページは calculate_total で明細から計算し、2,474円を表示する"
    >
      <T x={20} y={12} fs={11} tone="muted">
        書く処理
      </T>
      <T x={270} y={12} fs={11} tone="muted">
        テーブル
      </T>
      <Box x={20} y={30} w={190} h={80} lines={['Checkout', '注文と明細を作り、', '合計を保存して決済する']} fs={12} bold subTone="muted" />
      <Box x={20} y={200} w={190} h={56} lines={['StockShortageJob', '明細の数量だけを減らす']} fs={12} bold subTone="muted" />
      <T x={20} y={276} fs={11} tone="danger">
        total_amount は直さない
      </T>
      <Box x={270} y={20} w={230} h={60} fill="box4" lines={['orders', 'total_amount 3,754（注文した時のまま）']} fs={12} bold subTone="danger" />
      <Box x={270} y={110} w={230} h={60} fill="box4" lines={['payments', 'amount 3,754（決済サービスが確定）']} fs={12} bold subTone="muted" />
      <Box x={270} y={200} w={230} h={60} fill="box4" lines={['order_items（明細）', '1,280円×1袋、398円×3箱']} fs={12} bold subTone="muted" />
      <Box x={270} y={290} w={230} h={50} fill="box4" lines={['products', 'price（今の価格）']} fs={12} bold subTone="muted" />
      <Arrow x1={385} y1={290} x2={385} y2={262} dashed />
      <T x={393} y={276} fs={10} tone="muted">
        注文した時に写す
      </T>
      <Arrow x1={210} y1={50} x2={268} y2={45} />
      <Arrow x1={210} y1={75} x2={268} y2={135} />
      <Arrow x1={210} y1={100} x2={268} y2={215} />
      <Arrow x1={210} y1={228} x2={268} y2={232} />
      {sceneReaders.map((r) => (
        <g key={r.y}>
          <Box x={570} y={r.y} w={190} h={50} lines={r.lines} fs={12} bold subTone={r.tone} />
          <Arrow x1={r.x1} y1={r.y1} x2={568} y2={r.y + 25} dashed />
        </g>
      ))}
      <Arrow x1={500} y1={140} x2={568} y2={172} dashed />
      <T x={570} y={292} fs={11} tone="muted">
        破線の矢印：読む
      </T>
      <T x={20} y={370} fs={12} tone="danger">
        赤：コーヒー豆の欠品で数量を2から1にした後に、明細の合計（2,474円）と食い違った値
      </T>
      <T x={20} y={396} fs={12}>
        合計を計算するコードは calculate_total の1か所だが、計算した結果を total_amount に保存したので、合計が2か所にある
      </T>
    </Svg>
  )
}

/* ---------- 図 86-2 2つの欠品のジョブが同時に動いたときの、合計の食い違い ---------- */
const raceRows = [
  { who: '', text: '開始', items: '豆2・フィルター3', total: '3,754' },
  { who: 'A', text: 'UPDATE 豆の数量 2→1' },
  { who: 'A', text: 'SUM → 2,474（フィルターは3と読む）', sum: true },
  { who: 'B', text: 'UPDATE フィルターの数量 3→1' },
  { who: 'B', text: 'SUM → 2,958（豆は2と読む）', sum: true },
  { who: 'B', text: 'total_amount = 2,958、COMMIT', items: '豆2・フィルター1', total: '2,958' },
  { who: 'A', text: 'total_amount = 2,474、COMMIT', items: '豆1・フィルター1', total: '2,474', bad: true },
]

function RaceFigure() {
  const rowY = (i: number) => 64 + i * 40
  return (
    <Svg
      id="86-2"
      w={780}
      h={392}
      label="同じ注文の2つの明細について、欠品のジョブ A（コーヒー豆）と B（フィルター）が同時に動いたときのタイムライン。上から下へ時間が進む。開始時の明細は豆2袋・フィルター3箱で total_amount は 3,754。A が豆の数量を1にし、SUM で 2,474 を求める。このとき B の変更は見えずフィルターは3と読む。次に B がフィルターの数量を1にし、SUM で 2,958 を求める。A の変更は COMMIT 前なので豆は2と読む。B が total_amount に 2,958 を書いて COMMIT し、続いて A が 2,474 を書いて COMMIT する。明細は豆1袋・フィルター1箱で合計 1,678円なのに、total_amount には 2,474 が残る"
    >
      <T x={165} y={22} anchor="middle" fs={12} bold>
        ジョブ A（コーヒー豆の欠品）
      </T>
      <T x={405} y={22} anchor="middle" fs={12} bold>
        ジョブ B（フィルターの欠品）
      </T>
      <T x={601} y={22} anchor="middle" fs={11} tone="muted">
        COMMIT 済みの明細
      </T>
      <T x={721} y={22} anchor="middle" fs={11} tone="muted">
        total_amount
      </T>
      <Arrow x1={24} y1={44} x2={24} y2={326} />
      <T x={32} y={330} fs={10} tone="muted">
        時間
      </T>
      {raceRows.map((r, i) => {
        const x = r.who === 'B' ? 290 : 50
        return (
          <g key={`${i}-${r.text}`}>
            <line x1={18} y1={rowY(i)} x2={30} y2={rowY(i)} stroke="var(--fig-line)" />
            {r.who === '' ? (
              <T x={60} y={rowY(i)} fs={12} tone="muted">
                {r.text}
              </T>
            ) : (
              <Box x={x} y={rowY(i) - 15} w={230} h={30} fill={r.sum ? 'box5' : 'box'} lines={r.text} fs={11} mono={!r.sum} />
            )}
            {r.items && (
              <Box x={536} y={rowY(i) - 15} w={130} h={30} fill="box4" lines={r.items} fs={11} />
            )}
            {r.total && (
              <g>
                <Box x={676} y={rowY(i) - 15} w={90} h={30} fill="box4" lines="" fs={12} />
                <T x={721} y={rowY(i)} anchor="middle" fs={12} tone={r.bad ? 'danger' : undefined} bold={r.bad}>
                  {r.total}
                </T>
              </g>
            )}
          </g>
        )
      })}
      <T x={50} y={352} fs={12} tone="danger">
        明細の合計は 1,678円なのに、後から COMMIT した A の 2,474円が total_amount に残った
      </T>
      <T x={50} y={376} fs={11} tone="muted">
        どちらのジョブが後に書くかは実行ごとに変わり、2,958円が残ることもある。紫の SUM は、一度も存在しなかった明細の組み合わせを足している
      </T>
    </Svg>
  )
}

/* ---------- 図 86-3 正本・派生データ・別の事実の記録 ---------- */
const derivedBoxes = [
  { y: 30, lines: ['orders.total_amount', '一覧の並べ替えと絞り込み'] },
  { y: 88, lines: ['売上の集計表', '日ごとの売上（Materialized View）'] },
  { y: 146, lines: ['検索の索引・Rails.cache の値', '速く読むために変換した値'] },
]

function SourceFigure() {
  return (
    <Svg
      id="86-3"
      w={780}
      h={420}
      label="上の段は、注文の合計の正本と派生データ。正本は order_items の unit_price × quantity。そこから作る派生データとして、orders.total_amount、売上の集計表、検索の索引や Rails.cache の値があり、正本が変わったら作り直す。下の段は、別の事実の記録。products.price は今の価格の正本で、注文した時に order_items.unit_price へ写し、その後は作り直さない。決済サービスは請求した金額の正本で、決済した時に payments.amount へ写す。unit_price は、写した記録であると同時に、注文の合計の正本の一部でもある"
    >
      <T x={40} y={14} fs={12} bold>
        正本
      </T>
      <T x={430} y={14} fs={12} bold>
        派生データ（正本から作り直せる）
      </T>
      <Box x={40} y={64} w={250} h={70} fill="box5" lines={['order_items（明細）', '注文の合計の正本', 'unit_price × quantity']} fs={12} bold subTone="muted" />
      {derivedBoxes.map((b) => (
        <g key={b.y}>
          <Box x={430} y={b.y} w={320} h={46} lines={b.lines} fs={12} bold subTone="muted" />
          <Arrow x1={290} y1={99} x2={428} y2={b.y + 23} />
        </g>
      ))}
      <T x={300} y={58} fs={11} tone="muted">
        作る・作り直す
      </T>
      <line x1={20} y1={214} x2={760} y2={214} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={40} y={238} fs={12} bold>
        ほかの事実の正本
      </T>
      <T x={430} y={238} fs={12} bold>
        別の事実の記録（写した時点の値を残す）
      </T>
      <Box x={40} y={256} w={250} h={50} fill="box4" lines={['products.price', '今の価格の正本']} fs={12} bold subTone="muted" />
      <Box x={430} y={256} w={320} h={50} lines={['order_items.unit_price', '注文した時点の価格']} fs={12} bold subTone="muted" />
      <Arrow x1={290} y1={281} x2={428} y2={281} dashed />
      <T x={300} y={270} fs={11} tone="muted">
        注文した時に写す
      </T>
      <Box x={40} y={322} w={250} h={50} fill="box4" lines={['決済サービス', '請求した金額の正本']} fs={12} bold subTone="muted" />
      <Box x={430} y={322} w={320} h={50} lines={['payments.amount', '決済サービスが確定した金額']} fs={12} bold subTone="muted" />
      <Arrow x1={290} y1={347} x2={428} y2={347} dashed />
      <T x={300} y={336} fs={11} tone="muted">
        決済した時に写す
      </T>
      <T x={40} y={400} fs={11} tone="muted">
        実線：正本が変わったら作り直す。破線：その時点の値を写して残し、後から作り直さない
      </T>
    </Svg>
  )
}

/* ---------- 図 86-6 直す前と後：合計を書く場所と読む場所 ---------- */
const beforeWriters = [
  { x: 12, lines: ['Checkout', 'create!'], ax: 80 },
  { x: 132, lines: ['StockShortageJob', 'update!'], ax: 100 },
  { x: 252, lines: ['SalePriceCorrection', 'update_all'], ax: 130 },
]
const afterWriters = [
  { x: 402, lines: ['Checkout', '明細を作る'] },
  { x: 525, lines: ['StockShortageJob', '数量を減らす'] },
  { x: 648, lines: ['SalePriceCorrection', '単価を直す'] },
]

function CompareFigure() {
  return (
    <Svg
      id="86-6"
      w={780}
      h={392}
      label="左は直す前（コールバックを足した後）。Checkout・StockShortageJob・SalePriceCorrection がそれぞれ order_items を直接変え、OrderItem の after_save が total_amount を作り直す。SalePriceCorrection の update_all は after_save を通らず、同時の更新では古い明細の合計が残る。注文の詳細ページは calculate_total で明細を読み、メール・返金・一覧は total_amount を読む。右は直した後。3つの処理は Order#change_items! の中で明細を変え、change_items! は注文の行をロックして、明細の変更と recalculate_total! を同じトランザクションで行う。詳細ページ・メール・返金は Order#total で明細から金額を求め、管理画面の一覧だけが派生データの total_amount を読む"
    >
      <T x={12} y={16} fs={13} bold>
        直す前（コールバックを足した後）
      </T>
      <T x={402} y={16} fs={13} bold>
        直した後
      </T>
      {beforeWriters.map((w) => (
        <g key={w.x}>
          <Box x={w.x} y={36} w={116} h={44} lines={w.lines} fs={10} bold subTone="muted" />
          <Arrow x1={w.x + 58} y1={80} x2={w.ax} y2={194} />
        </g>
      ))}
      <Box x={20} y={196} w={140} h={44} fill="box4" lines={['order_items', '明細']} fs={12} bold subTone="muted" />
      <Box x={230} y={196} w={140} h={44} fill="box4" lines={['orders.total_amount', '金額にも使う']} fs={11} bold subTone="danger" />
      <Arrow x1={160} y1={218} x2={228} y2={218} />
      <T x={166} y={206} fs={10} tone="muted">
        after_save
      </T>
      <Box x={20} y={280} w={140} h={50} lines={['注文の詳細ページ', 'calculate_total']} fs={11} bold subTone="muted" />
      <Box x={230} y={280} w={140} h={50} lines={['メール・返金・一覧', 'total_amount']} fs={11} bold subTone="danger" />
      <Arrow x1={90} y1={278} x2={90} y2={242} dashed />
      <Arrow x1={300} y1={278} x2={300} y2={242} dashed />
      <T x={12} y={354} fs={11} tone="danger">
        update_all は after_save を通らない
      </T>
      <T x={12} y={374} fs={11} tone="danger">
        同時の更新では、古い明細の合計が残る
      </T>
      <line x1={390} y1={8} x2={390} y2={384} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {afterWriters.map((w) => (
        <g key={w.x}>
          <Box x={w.x} y={36} w={118} h={44} lines={w.lines} fs={10} bold subTone="muted" />
          <Arrow x1={w.x + 59} y1={80} x2={w.x + 59} y2={108} />
        </g>
      ))}
      <Box x={410} y={110} w={350} h={46} fill="box5" lines={['Order#change_items!', '注文の行をロックし、明細の変更と合計を同じトランザクションで']} fs={11} bold subTone="muted" />
      <Box x={410} y={196} w={150} h={44} fill="box4" lines={['order_items', '合計の正本']} fs={12} bold subTone="acc" />
      <Box x={610} y={196} w={150} h={44} fill="box4" lines={['orders.total_amount', '派生データ']} fs={11} bold subTone="muted" />
      <Arrow x1={485} y1={156} x2={485} y2={194} />
      <T x={493} y={176} fs={10} tone="muted">
        yield
      </T>
      <Arrow x1={685} y1={156} x2={685} y2={194} />
      <T x={693} y={176} fs={10} tone="muted">
        recalculate_total!
      </T>
      <Box x={410} y={280} w={150} h={50} lines={['詳細ページ・メール・返金', 'Order#total（明細から）']} fs={11} bold subTone="acc" />
      <Box x={610} y={280} w={150} h={50} lines={['管理画面の一覧', 'total_amount の順']} fs={11} bold subTone="muted" />
      <Arrow x1={485} y1={278} x2={485} y2={242} dashed />
      <Arrow x1={685} y1={278} x2={685} y2={242} dashed />
      <T x={402} y={354} fs={11} tone="acc">
        合計を書くのは change_items! の中だけ
      </T>
      <T x={402} y={374} fs={11} tone="acc">
        金額を扱う処理は、正本の明細から求める
      </T>
    </Svg>
  )
}

/* ---------- 図 86-7 派生データを正本にそろえる方法と、集計表の章との対応 ---------- */
const rebuildRows = [
  { method: ['正本と同じトランザクションで', '作り直す'], stale: 0, staleText: 'COMMIT と同時にそろう', here: ['change_items! の中で', 'recalculate_total!'], mv: ['書き込みと同時に足す', '（差分を足す形）'] },
  { method: ['正本が変わった後に、', 'ジョブで作り直す'], stale: 70, staleText: 'ジョブが動くまで', here: ['使わない'], mv: ['after_commit から', 'ジョブを積む'] },
  { method: ['決めた時刻に、', 'まとめて作り直す'], stale: 150, staleText: '次に作り直すまで', here: ['rebuild_totals!', '（食い違った注文）'], mv: ['RebuildDailySalesJob', '（全期間）'] },
  { method: ['正本と比べて、', '食い違いを見つける'], stale: -1, staleText: '作り直す前に使う', here: ['with_stale_total'], mv: ['refreshed_at の監視', '（作り直しの遅れ）'] },
]

function RebuildFigure() {
  const rowY = (i: number) => 52 + i * 78
  return (
    <Svg
      id="86-7"
      w={780}
      h={380}
      label="派生データを正本にそろえる4つの方法を、正本が変わってからそろうまでの時間、この章のコード、売上の集計表の章のコードと並べた。1つ目は正本と同じトランザクションで作り直す方法で、COMMIT と同時にそろう。この章の change_items! と recalculate_total! が当たり、集計表の章では書き込みと同時に差分を足す方式が近い。2つ目は正本が変わった後にジョブで作り直す方法で、ジョブが動くまで古い。この章では使わず、集計表の章では after_commit からジョブを積む。3つ目は決めた時刻にまとめて作り直す方法で、次に作り直すまで古い。この章の rebuild_totals! と、集計表の章の RebuildDailySalesJob が当たる。4つ目は正本と比べて食い違いを見つける方法で、この章の with_stale_total と、集計表の章の refreshed_at の監視が当たる"
    >
      <T x={20} y={20} fs={12} bold>
        方法
      </T>
      <T x={270} y={20} fs={12} bold>
        正本が変わってからそろうまで
      </T>
      <T x={484} y={20} fs={12} bold>
        この章
      </T>
      <T x={634} y={20} fs={12} bold>
        集計表の章
      </T>
      {rebuildRows.map((r, i) => (
        <g key={r.staleText}>
          <Box x={20} y={rowY(i)} w={230} h={60} lines={r.method} fs={12} bold={false} />
          {r.stale >= 0 && (
            <g>
              <line x1={280} y1={rowY(i) + 30} x2={470} y2={rowY(i) + 30} stroke="var(--fig-line)" strokeOpacity={0.4} />
              <line x1={280} y1={rowY(i) + 20} x2={280} y2={rowY(i) + 40} stroke="var(--fig-line)" />
              {r.stale > 0 && <rect x={281} y={rowY(i) + 24} width={r.stale} height={12} fill="var(--fig-danger)" opacity={0.55} />}
            </g>
          )}
          <T x={280} y={rowY(i) + 12} fs={11} tone={r.stale === 0 ? 'acc' : 'muted'}>
            {r.staleText}
          </T>
          <Box x={484} y={rowY(i)} w={140} h={60} fill={r.here[0] === '使わない' ? 'bg' : 'box5'} lines={r.here} fs={11} />
          <Box x={634} y={rowY(i)} w={136} h={60} fill="box4" lines={r.mv} fs={11} />
        </g>
      ))}
      <T x={280} y={rowY(4) - 2} fs={10} tone="muted">
        縦線：正本が変わった時点。赤い帯：派生データが古いままの時間（模式）
      </T>
    </Svg>
  )
}

/* ---------- 図 86-8 2か所にある値をどう扱うかの判断 ---------- */
function JudgeFigure() {
  return (
    <Svg
      id="86-8"
      w={780}
      h={400}
      label="2か所に同じ値があるように見えたときの判断の流れ。問1は、片方が変わったらもう片方も必ず同じに変わるべきか。いいえなら、別の事実の記録として、写した時点の値を残し、作り直さない。例は unit_price、payments.amount、送ったメールの本文。はいなら問2に進む。問2は、毎回正本から求めて必要な速さに間に合うかを、測って確かめる。はいなら派生データを持たず、Order#total のように正本から求めるメソッドを読む。いいえなら派生データとして持ち、書く場所を1つにし、正本と同じトランザクションで作り、作り直しと照合を用意する。例は orders.total_amount"
    >
      <Box x={220} y={10} w={340} h={40} dashed fill="bg" lines="2か所に同じ値があるように見える" fs={12} />
      <Arrow x1={390} y1={50} x2={390} y2={72} />
      <Box x={200} y={74} w={380} h={52} fill="box2" lines={['問1：片方が変わったら、もう片方も', '必ず同じに変わるべきか']} fs={12} bold />
      <Arrow x1={200} y1={100} d="M 200 100 L 135 100 L 135 160" />
      <T x={150} y={90} fs={11} tone="muted">
        いいえ
      </T>
      <Box x={20} y={162} w={230} h={110} fill="box4" lines={['別の事実の記録', '写した時点の値を残し、', '正本から作り直さない', '例：unit_price、', 'payments.amount、送ったメール']} fs={12} bold subTone="muted" />
      <Arrow x1={440} y1={126} x2={440} y2={158} />
      <T x={448} y={142} fs={11} tone="muted">
        はい
      </T>
      <Box x={290} y={160} w={350} h={52} fill="box2" lines={['問2：毎回正本から求めて、必要な速さに', '間に合うか（測って確かめる）']} fs={12} bold />
      <Arrow x1={380} y1={212} x2={380} y2={254} />
      <T x={388} y={232} fs={11} tone="muted">
        はい
      </T>
      <Arrow x1={560} y1={212} x2={640} y2={254} />
      <T x={610} y={226} fs={11} tone="muted">
        いいえ
      </T>
      <Box x={270} y={256} w={230} h={90} fill="box5" lines={['派生データを持たない', '正本から求めるメソッドを読む', '例：Order#total']} fs={12} bold subTone="muted" />
      <Box x={520} y={256} w={250} h={110} lines={['派生データとして持つ', '書く場所を1つにする', '正本と同じトランザクションで作る', '作り直しと照合を用意する', '例：orders.total_amount']} fs={12} bold subTone="muted" />
      <T x={20} y={388} fs={11} tone="muted">
        問2で「いいえ」でも、正しさが要る処理（決済・返金）は正本から求め、派生データは一覧や検索に使う
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 88,
  part: 8,
  title: 'Single Source of Truth：注文の合計を2か所に持たない',
  summary:
    '注文の合計を orders の列と明細の2か所に持ったために、欠品で数量を減らした後に画面・メール・返金の金額が食い違う場面から始めます。Codd・Kent のデータベースの論文と、DRY・SPOT・Kleppmann の説明から、正本と派生データの区別を確かめ、明細を正本にして合計の列を派生データとして作り直す形に直します。最後に、決済した金額のような別の事実まで正本に寄せたときの誤りと、Rails の counter_cache・生成列・attr_readonly・schema.rb を扱います。',
  goals: [
    '同じ情報を2か所に保存したときに、どんな操作とタイミングで値が食い違うかを、コールバックを通らない更新と同時の更新の例で説明できる',
    '正本・派生データ・別の事実の記録を区別し、Single Source of Truth と DRY の違いを説明できる',
    '明細を正本にし、派生データの列を書く場所を1つにして、注文の行のロックと同じトランザクションで作り直すコードを書ける',
    '正本と派生データの食い違いを見つけるクエリと、作り直しの処理を用意できる',
    '決済した金額や注文した時点の価格のように、正本から作り直してはいけない値を見分けられる',
    'counter_cache・MySQL の生成列・attr_readonly・schema.rb が、正本と派生データをどう扱うかを説明できる',
  ],
  prerequisites: [14, 15, 59],
  sections: [
    {
      id: 'scene',
      title: '注文の合計を orders と明細の2か所に持つコード',
      body: (
        <>
          <p>
            この章では EC サイトの注文の合計を例に、<Term en="SSOT">Single Source of Truth</Term>を扱います。Single Source of Truth は、同じ情報について、正しい値として扱う保存場所（<Term en="source of truth">正本</Term>）を1つに決め、複数持たないという原則です。まず、注文の合計を orders テーブルの列と、明細の行の2か所に持ったコードを動かし、欠品で数量を減らしたときに、画面・メール・返金の金額がどう食い違うかを確かめます。
          </p>
          <h3>そもそも注文の合計はどこで決まるのか</h3>
          <p>
            コーヒー豆と器具を売る EC サイトを考えます。商品の価格は税込みで登録します。消費税の計算は<ChapterLink n={59} />で扱ったので、この章では税込みの価格だけを使います。注文は orders テーブルに1行、注文した商品は order_items テーブルに商品ごとに1行ずつ保存します。order_items の1行を、この章では明細と呼びます。
          </p>
          <p>
            明細には注文した時点の商品の価格を unit_price として写します。商品の価格（products.price）は後で変わることがありますが、利用者が注文した時に見た価格は、後から変わってはいけないからです。products.price と unit_price は、値が同じでも「今の価格」と「注文した時点の価格」という別の事実です。明細に価格を写さないと、商品の価格を直しただけで過去の注文の金額が変わることは、<ChapterLink n={58} section="overuse" />で確かめました。
          </p>
          <p>
            注文の合計は明細ごとの「unit_price × quantity」を足した値です。コーヒー豆（1,280円）を2袋と、ドリップフィルター（398円）を3箱買うと、2,560円 + 1,194円 = 3,754円です。この合計は次の4か所で使います。
          </p>
          <ul>
            <li>注文の詳細ページ：利用者が明細と合計を見る。</li>
            <li>変更のお知らせのメール：欠品などで注文の内容が変わったときに、変更後の明細と支払う金額を利用者に送る。</li>
            <li>決済の管理画面：決済した金額と注文の合計の差を、返金する金額として表示する。</li>
            <li>管理画面の注文の一覧：注文を合計の大きい順に並べ、金額で絞り込む。</li>
          </ul>
          <h3>テーブルとモデル</h3>
          <p>
            orders テーブルには管理画面の一覧で並べ替えるために、合計を total_amount 列として保存し、インデックスを張っています。payments テーブルには、決済サービスが確定した金額を amount 列に保存します。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000001_create_shop_tables.rb（orders・order_items・payments の部分）"
            code={`
    # …（省略。products の表）
    create_table :orders do |t|
      t.string :number, null: false, index: { unique: true }
      t.string :email, null: false
      t.integer :total_amount, null: false, index: true # 注文の合計。注文した時に明細から計算して保存する
      t.timestamps
    end

    create_table :order_items do |t|
      t.references :order, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :unit_price, null: false # 注文した時点の価格（税込み）
      t.integer :quantity, null: false
      t.timestamps
    end

    create_table :payments do |t|
      t.references :order, null: false, foreign_key: true, index: { unique: true }
      t.string :charge_id, null: false # 決済サービスが返した ID
      t.integer :amount, null: false # 決済サービスが確定した金額
      t.timestamps
    end
`}
          />
          <Code
            lang="ruby"
            title="app/models/order.rb（直す前）"
            code={`
class Order < ApplicationRecord
  has_many :order_items
  has_one :payment

  # 明細から合計を計算する（合計の計算はここにだけある）
  def calculate_total = order_items.sum("unit_price * quantity")
end
`}
          />
          <Code
            lang="ruby"
            title="app/services/checkout.rb（直す前）"
            code={`
# カートの中身から注文を作り、決済する
class Checkout
  def self.call(number:, email:, lines:)
    order = Order.transaction do
      order = Order.create!(number:, email:, total_amount: 0)
      lines.each do |product, quantity|
        order.order_items.create!(product:, unit_price: product.price, quantity:)
      end
      order.update!(total_amount: order.calculate_total)
      order
    end
    charge = PaymentGateway.charge(order.total_amount)
    order.create_payment!(charge_id: charge[:id], amount: charge[:amount])
    order
  end
end
`}
          />
          <p>
            合計を計算するコードは Order#calculate_total の1か所にあります。sum に SQL の式を渡すと、Active Record は <code>SELECT SUM(unit_price * quantity) FROM order_items WHERE order_id = …</code> を実行します。Checkout はこのメソッドで計算した値を total_amount に保存し、その金額で決済します。PaymentGateway はこの章のアプリで決済サービスの代わりに置いたモジュールで、確定した金額と ID を返します。
          </p>
          <h3>欠品で数量を減らす処理</h3>
          <p>
            倉庫で商品をそろえるときに在庫が足りないと、倉庫のシステムから明細ごとに欠品の知らせが届きます。StockShortageJob は、届いた数だけ明細の数量を減らし、変更のお知らせのメールを送ります。
          </p>
          <Code
            lang="ruby"
            title="app/jobs/stock_shortage_job.rb（直す前）"
            code={`
# 倉庫から欠品の知らせが届いたら、明細の数量を減らし、変更をメールで知らせる
class StockShortageJob < ApplicationJob
  def perform(order_item, available_quantity)
    order_item.update!(quantity: available_quantity)
    OrderMailer.with(order: order_item.order).items_changed.deliver_now
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/order_mailer/items_changed.text.erb（直す前）"
            code={`
<%= @order.number %> のご注文の内容を変更しました。
<% @order.order_items.each do |item| -%>
<%= item.product.name %> <%= item.quantity %>点
<% end -%>
変更後のお支払い金額: <%= number_with_delimiter(@order.total_amount) %>円
`}
          />
          <Code
            lang="erb"
            title="app/views/orders/show.html.erb（直す前。合計の行）"
            code={`
<%# …（省略。明細の表） %>
<p>合計 <%= number_with_delimiter(@order.calculate_total) %>円</p>
`}
          />
          <Code
            lang="ruby"
            title="app/models/payment.rb（直す前）"
            code={`
class Payment < ApplicationRecord
  belongs_to :order

  # 返金する金額：決済した金額のうち、注文の合計を超える分
  def refund_due = amount - order.total_amount
end
`}
          />
          <p>
            注文の詳細ページは明細の行と同じ値から合計を出すために calculate_total を呼びます。メールと決済の管理画面は、保存してある total_amount を読みます。どちらも書いた人にとっては自然な選び方でした。
          </p>
          <h3>欠品の後の金額を比べる</h3>
          <p>
            注文して決済した後に、コーヒー豆の欠品で数量を2袋から1袋に減らし、4か所の金額を取り出すスクリプトを実行しました。詳細ページは ActionDispatch::Integration::Session で実際に要求を送って HTML から、メールは送った本文から、金額を取り出しています。
          </p>
          <Code
            lang="ruby"
            title="script/shortage.rb"
            code={`
# 注文して決済した後、コーヒー豆の欠品で数量を 2 から 1 に減らし、画面・メール・返金の金額を比べる
[Payment, OrderItem, Order, Product].each(&:delete_all)
beans = Product.create!(name: "コーヒー豆（200g）", price: 1280)
filter = Product.create!(name: "ドリップフィルター（100枚）", price: 398)

order = Checkout.call(number: "A0001", email: "a@example.com", lines: { beans => 2, filter => 3 })
puts "注文した時: 合計 #{order.total_amount}円、決済した金額 #{order.payment.amount}円"

StockShortageJob.perform_now(order.order_items.find_by!(product: beans), 1)

browser = ActionDispatch::Integration::Session.new(Rails.application)
browser.get "/orders/#{order.id}"
puts "欠品の後"
puts "  注文の詳細ページの合計: #{browser.response.body[/合計 ([\\d,]+)円/, 1]}円"
puts "  変更のお知らせのメール: #{ActionMailer::Base.deliveries.last.body.to_s[/金額: ([\\d,]+)円/, 1]}円"
puts "  返金する金額（決済の管理画面）: #{order.payment.reload.refund_due}円"
puts "  orders.total_amount: #{order.reload.total_amount}"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/shortage.rb。直す前）"
            code={`
注文した時: 合計 3754円、決済した金額 3754円
欠品の後
  注文の詳細ページの合計: 2,474円
  変更のお知らせのメール: 3,754円
  返金する金額（決済の管理画面）: 0円
  orders.total_amount: 3754
`}
          />
          <p>
            コーヒー豆を1袋減らすと、詳細ページの合計は 2,474円になりましたが、メールには 3,754円と書かれ、返金する金額は0円でした。利用者は届かないコーヒー豆の1,280円を返してもらえず、メールと画面で違う金額を見ることになります。total_amount は注文した時の 3,754円のままです。数量を変えた StockShortageJob が、total_amount を直していないからです。
          </p>
          <Figure n="86-1" title="注文の合計を2か所に持つ構成と、欠品の後に食い違う箇所" caption="左が書く処理、中央がテーブル、右が読む処理。赤い文字は欠品の後に明細の合計と食い違った値。">
            <SceneFigure />
          </Figure>
          <p>
            図 86-1 はテーブルと、それを書く処理・読む処理の関係です。合計を計算するコードは calculate_total の1か所だけなので、計算の規則を重ねて書かないという DRY（<ChapterLink n={59} />）には反していません。問題は計算した結果を total_amount として保存したことで、合計という1つの情報が「明細の行」と「orders の列」の2か所にあり、片方だけが変わったことです。
          </p>
          <h3>明細を保存するたびに合計を作り直すコールバックを足す</h3>
          <p>
            よくある直し方は明細を保存するたびに合計を計算し直すコールバックです。開発者は OrderItem に after_save を足しました。after_save はレコードを save や update! で保存した後、同じトランザクションの中で呼ばれるコールバックです。
          </p>
          <Code
            lang="ruby"
            title="app/models/order_item.rb（コールバックを足した版）"
            code={`
class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product

  # 明細を保存するたびに、注文の合計を作り直す
  after_save :refresh_order_total

  private

  def refresh_order_total = order.update!(total_amount: order.calculate_total)
end
`}
          />
          <p>このアプリには、欠品のほかにも明細を変える処理があります。</p>
          <ul>
            <li>
              セールの価格が反映されていなかった注文の明細の単価を、まとめて直す SalePriceCorrection。対象の注文が多いので、update_all で1回の UPDATE にしています。
            </li>
            <li>
              欠品の知らせは明細ごとに届くので、同じ注文の2つの明細の StockShortageJob が、Sidekiq の別々のスレッドで同時に動くことがあります。
            </li>
          </ul>
          <Code
            lang="ruby"
            title="app/services/sale_price_correction.rb（コールバックを足した版）"
            code={`
# セールの価格が反映されていなかった注文の明細の単価を、まとめて直す
class SalePriceCorrection
  def self.call(product, sale_price, orders)
    OrderItem.where(order: orders, product:).update_all(unit_price: sale_price)
  end
end
`}
          />
          <p>
            3つの処理の後で total_amount が明細の合計と一致するかを確かめるテストを書きました。2つのジョブが同時に動く状態は毎回は起きないので、テストでは、合計を計算する SELECT の直後で2つのジョブが互いを待つようにしています。ActiveSupport::Notifications の sql.active_record は、SQL を1つ実行するたびに、実行したスレッドで通知を送る仕組みです。2つのスレッドはそれぞれ別の DB 接続を使います。
          </p>
          <Code
            lang="ruby"
            title="spec/order_total_spec.rb（コールバックを足した版）"
            code={`
require "rails_helper"

RSpec.describe "注文の合計（orders.total_amount）" do
  self.use_transactional_tests = false
  after { [Payment, OrderItem, Order, Product].each(&:delete_all) }

  let(:beans) { Product.create!(name: "コーヒー豆（200g）", price: 1280) }
  let(:filter) { Product.create!(name: "ドリップフィルター（100枚）", price: 398) }
  let!(:order) { Checkout.call(number: "A0001", email: "a@example.com", lines: { beans => 2, filter => 3 }) }
  let(:beans_item) { order.order_items.find_by!(product: beans) }
  let(:filter_item) { order.order_items.find_by!(product: filter) }

  it "欠品で数量を減らすと、明細の合計と一致する" do
    StockShortageJob.perform_now(beans_item, 1)
    expect(order.reload.total_amount).to eq(order.calculate_total)
  end

  it "セールの価格をまとめて直すと、明細の合計と一致する" do
    SalePriceCorrection.call(beans, 1080, Order.where(id: order.id))
    expect(order.reload.total_amount).to eq(order.calculate_total)
  end

  it "2つの明細の欠品を同時に処理すると、明細の合計と一致する" do
    # 合計を計算する SELECT の直後で、2つのジョブが互いを待つようにして、同時に動いた状態を作る
    barrier = Concurrent::CyclicBarrier.new(2)
    subscriber = ActiveSupport::Notifications.subscribe("sql.active_record") do |event|
      barrier.wait(2) if event.payload[:sql].include?("SUM(unit_price * quantity)")
    end
    [beans_item.id, filter_item.id].map { |item_id|
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          StockShortageJob.perform_now(OrderItem.find(item_id), 1) # Sidekiq と同じく、ジョブごとに読み込む
        end
      end
    }.each(&:join)
    ActiveSupport::Notifications.unsubscribe(subscriber)

    expect(order.reload.total_amount).to eq(order.calculate_total)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation。コールバックを足した版）"
            code={`
注文の合計（orders.total_amount）
  欠品で数量を減らすと、明細の合計と一致する
  セールの価格をまとめて直すと、明細の合計と一致する (FAILED - 1)
  2つの明細の欠品を同時に処理すると、明細の合計と一致する (FAILED - 2)

Failures:

  1) 注文の合計（orders.total_amount） セールの価格をまとめて直すと、明細の合計と一致する
     Failure/Error: expect(order.reload.total_amount).to eq(order.calculate_total)

       expected: 3354
            got: 3754

  2) 注文の合計（orders.total_amount） 2つの明細の欠品を同時に処理すると、明細の合計と一致する
     Failure/Error: expect(order.reload.total_amount).to eq(order.calculate_total)

       expected: 1678
            got: 2474

3 examples, 2 failures
`}
          />
          <p>
            1つ目の欠品の例は通りましたが、残りの2つは失敗しました。セールの価格の訂正では、明細の単価は 1,080円になったのに、total_amount は 3,754円のままです。update_all は SQL の UPDATE を直接送るので、after_save を含むコールバックを呼びません。Rails Guides は update_all・update_column・insert_all・delete_all などをコールバックを通らないメソッドとして挙げています<Ref n={9} />。コールバックを通らない更新の一覧は<ChapterLink n={14} section="skip" />で扱いました。
          </p>
          <h3>同時に動いた2つのジョブで、合計が食い違うタイミング</h3>
          <p>
            2つのジョブを同時に動かした例では、明細の合計は 1,678円なのに、total_amount は 2,474円になりました。図 86-2 は、このとき2つのジョブが実行した SQL を時間の順に並べたものです。
          </p>
          <Figure n="86-2" title="2つの欠品のジョブが同時に動いたときの、合計の食い違い" caption="sql.active_record の通知で記録した SQL の順序をもとにした図。上から下へ時間が進む。">
            <RaceFigure />
          </Figure>
          <p>
            各ジョブは update! のトランザクションの中で自分の明細を UPDATE し、after_save で SUM を実行します。MySQL の既定の分離レベル REPEATABLE READ では、SELECT はロックを取らず、トランザクションで最初に読んだ時点のスナップショットを読みます。この読み方を<Term en="consistent nonlocking read">一貫性読み取り</Term>と呼びます。自分が UPDATE した行は新しい値を読みますが、ほかのトランザクションがまだ COMMIT していない変更は見えません。MySQL のマニュアルは、この読み方では、データベースに一度も存在しなかった状態の表が見えることがあると書いています<Ref n={7} />。
          </p>
          <p>
            ジョブ A は「豆1袋・フィルター3箱」で 2,474円、ジョブ B は「豆2袋・フィルター1箱」で 2,958円を求めました。どちらも、実際には一度も存在しなかった明細の組み合わせです。total_amount には後から書いたほうの値が残ります。この実行では A が後に書いたので 2,474円でしたが、同じテストを何度か実行すると、2,958円が残ることもありました。一貫性読み取りと行のロックの仕組みは、<ChapterLink n={38} section="mvcc" />で扱いました。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>注文の合計が明細の行と total_amount の2か所に保存されています。明細を変える処理のすべてが total_amount も直さないと、2つの値が食い違います。</li>
            <li>コールバックで直そうとしても、コールバックを通らない更新（update_all や SQL の直接の実行）と、同時の更新で、食い違いが残ります。</li>
            <li>どちらが正しい値かがコードに書かれていないので、詳細ページは明細を読み、メールと返金は total_amount を読みます。その結果、利用者に違う金額が届き、返金の額も誤ります。</li>
          </ul>
          <p>次の節では情報ごとに正本を1つに決めるという Single Source of Truth の考え方を説明します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'Single Source of Truth の意味：正本を1つに決め、ほかは正本から作る',
      body: (
        <>
          <h3>定義：同じ情報の正本を複数持たない</h3>
          <p>
            Single Source of Truth は、同じ情報の正本を複数持たないという原則です。正本を1つに決めることで、データの不整合（2か所の値が食い違うこと）や、更新の漏れ（片方だけを直し忘れること）を防ぎます。この章の注文の合計では、明細の unit_price と quantity が正本です。
          </p>
          <p>本書ではこの原則を次の3つの判断として扱います。</p>
          <ul>
            <li>情報ごとに、正本を1つ決める。</li>
            <li>
              正本から計算や変換で作った値（<Term en="derived data">派生データ</Term>）は、正本からだけ作り、正本と別に書き換えない。失っても正本から作り直せるようにしておく。total_amount、売上の集計表、検索の索引、キャッシュが派生データです。
            </li>
            <li>
              値が同じに見えても、別の時点や別の主体が決めた値は、別の事実の記録として扱い、正本から作り直さない。明細の unit_price（注文した時点の価格）や payments.amount（決済サービスが確定した金額）が当たります。
            </li>
          </ul>
          <p>
            正本はデータだけでなく、設定の値にもあります。たとえば、送料が無料になる金額を、管理画面で変えられるテーブルとコードの定数の両方に持つと、管理画面で金額を変えても、定数を読んでいる画面の表示は変わりません。設定の正本の置き場所は Rails の節で扱います。
          </p>
          <h3>由来：言葉の提唱者は確かめられない</h3>
          <p>
            この章の調査では、「Single Source of Truth」という言葉を最初に使った人や資料は確かめられませんでした。ただし、同じ考え方はデータベースの設計とソフトウェアの設計の両方で、早くから述べられています。以下の資料はこの言葉の出典ではなく、同じ考え方を述べた一次資料です。
          </p>
          <h3>Codd の冗長性と一貫性（1970年）</h3>
          <p>
            関係データベースの考え方を示した Edgar F. Codd の論文「A Relational Model of Data for Large Shared Data Banks」（Communications of the ACM、1970年）は、2節で<Term en="redundancy">冗長性</Term>と<Term en="consistency">一貫性</Term>を扱っています。Codd は関係（テーブル）の集まりの中に、ある関係の列の組（射影）が、集まりの中のほかの列の組から導けるものがあるとき、その集まりを強い意味で冗長（strongly redundant）だと定義しました。例として社員の関係 employee(serial#, name, manager#, managername) を挙げ、上司の名前 managername は上司の社員番号 manager# から導けるので不要だとしています<Ref n={1} />。この章の total_amount も、order_items から導けるので、Codd の定義では冗長です。
          </p>
          <p>
            一貫性について Codd は、冗長な関係の集まりには関係の間で成り立つべき制約を書いた文を結び付け、ある時点の値がその制約を満たすかどうかで、一貫しているかを決めるとしました。一貫性はある時点の状態の性質で、その状態がどう作られたかには関係しないとも書いています<Ref n={1} />。食い違いを見つける方法として、挿入・削除・キーの更新のたびに確かめる方法（その分、更新は遅くなる）と、1日1回などまとめて確かめる方法（すべての変更の記録があれば、食い違いを生んだ入力をたどれる）の2つを挙げています<Ref n={1} />。この2つは、次の節の直し方にそのまま対応します。
          </p>
          <h3>Kent の更新時の異常（1983年）</h3>
          <p>
            William Kent の論文「A Simple Guide to Five Normal Forms in Relational Database Theory」（Communications of the ACM、1983年）は、正規化の規則は、更新時の異常とデータの不整合を防ぐためにあると説明しています<Ref n={2} />。倉庫の住所を部品の在庫のレコードごとに持つ例では、住所が変わるとすべてのレコードを直す必要があり、冗長なので、同じ倉庫について違う住所を示すレコードができうると書いています<Ref n={2} />。
          </p>
          <p>
            同じ論文は、正規形が扱うのは1種類のレコードの中の冗長性だけで、複数の種類のレコードにまたがる冗長性は、第3正規形を満たしていても残ると述べています<Ref n={2} />。orders と order_items は、それぞれの表の中では正規化されていますが、2つの表にまたがって合計を重ねて持っています。そのため、表ごとに正規形を確かめても見つかりません。一方で Kent は実際の性能の要件を考えたうえでなら、すべてのレコードを完全に正規化する義務はないとも書いています<Ref n={2} />。
          </p>
          <h3>DRY と SPOT：データの重複とキャッシュ</h3>
          <p>
            ソフトウェアの設計では、Andy Hunt と Dave Thomas が『The Pragmatic Programmer』で名付けた DRY が、データの重複にも触れています。20周年記念版（2019年）は始点と終点と長さを持つ線のクラスを例に、長さは始点と終点から決まるので計算で求めるメソッドにするよう勧めています。性能のために値を保存するときは、その影響をクラスの中に閉じ込め、クラスのメソッドだけが値をそろえる責任を持つようにすると書いています<Ref n={3} />。DRY の定義は<ChapterLink n={59} section="meaning" />で扱いました。
          </p>
          <p>
            Eric S. Raymond は『The Art of Unix Programming』（2003年）で、DRY の定義を引用したうえで、Brian Kernighan の提案に従って、これを Single Point Of Truth（SPOT）の規則と呼んでいます<Ref n={4} />。同書は計算や検索の途中の結果を保存するためにデータを重ねて持っているなら、それが早すぎる最適化ではないかをよく考えるよう求めています。古くなったキャッシュと、キャッシュをそろえておくためのコードは不具合の多い原因になり、そろえる処理の費用が思ったより大きければ、全体の性能も下がると書いています<Ref n={4} />。
          </p>
          <h3>Kleppmann の正本と派生データ</h3>
          <p>
            Martin Kleppmann は『Designing Data-Intensive Applications』（2017年）の第3部で、データを保存して処理するシステムを、正式な値を持つ system of record と、そこから作る derived data（派生データ）のシステムに分けました。system of record は source of truth とも呼ばれ、正式なデータを持つと説明しています<Ref n={5} />。
          </p>
          <p>
            Kleppmann は2015年の講演の記録で、キャッシュの中身はデータベースの中身から作ったもので、キャッシュを失ってもデータベースから作り直せると説明しています。そのうえで、アプリケーションでキャッシュをそろえる処理は、無効化の複雑な処理や<Term en="race condition">競合状態</Term>を抱えやすいと述べています<Ref n={6} />。競合状態は、複数の処理の実行の順序によって結果が変わる状態のことです。図 86-2 の2つのジョブの食い違いは、その例です。
          </p>
          <Figure n="86-3" title="正本・派生データ・別の事実の記録" caption="上の段は注文の合計の正本と派生データ。下の段はほかの事実の正本と、そこから写した記録。">
            <SourceFigure />
          </Figure>
          <p>
            図 86-3 はこの章のテーブルと値を、正本・派生データ・別の事実の記録に分けたものです。上の段の派生データは、正本が変わったら作り直します。下の段の unit_price と payments.amount は、それぞれ products.price と決済サービスから、その時点の値を写した記録で、後から作り直しません。unit_price は写した記録であると同時に、注文の合計の正本の一部でもあります。
          </p>
          <h3>DRY との違い</h3>
          <p>
            DRY と Single Source of Truth は、どちらも「同じものを2か所に持たない」という形をしていますが、扱う対象と、食い違いが生まれる時期が違います。
          </p>
          <Figure n="86-4" title="DRY と Single Source of Truth の違い" caption="この章の直す前のコードは、左の列（DRY）は守っていたが、右の列は守っていなかった。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">観点</th>
                    <th scope="col">DRY（<ChapterLink n={59} />）</th>
                    <th scope="col">Single Source of Truth（この章）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">対象</th>
                    <td>知識の表現（コード・スキーマ・ドキュメントに書いた規則）</td>
                    <td>保存した値（DB の行と列、キャッシュ、設定の値）</td>
                  </tr>
                  <tr>
                    <th scope="row">食い違いが生まれるとき</th>
                    <td>規則を変えるとき。開発者がコードを直すたび</td>
                    <td>値を変えるとき。アプリが動いている間の操作やジョブのたび</td>
                  </tr>
                  <tr>
                    <th scope="row">直し方</th>
                    <td>規則を1か所に書き、ほかの場所はそれを呼ぶ</td>
                    <td>情報ごとに正本を決め、写しは正本から作るか、持たない</td>
                  </tr>
                  <tr>
                    <th scope="row">見つけ方</th>
                    <td>規則の書き方を grep で探す</td>
                    <td>正本と派生データを比べるクエリやテスト</td>
                  </tr>
                  <tr>
                    <th scope="row">本書の例</th>
                    <td>税率と端数の規則</td>
                    <td>注文の合計</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 86-4 のとおり、この章の直す前のコードは、合計の計算を calculate_total の1か所に書いていたので、DRY には反していませんでした。それでも、計算した結果を保存した total_amount が明細とは別に残り、明細だけが変わったときに食い違いました。DRY がコードを書くときの重複を扱うのに対し、Single Source of Truth は、アプリが動いている間に保存される値の重複を扱います。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則・パターン</th>
                  <th scope="col">何を扱うか</th>
                  <th scope="col">この章との関係</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Make Illegal States Unrepresentable（<ChapterLink n={81} />）</th>
                  <td>不正な状態の組み合わせ</td>
                  <td>status と shipped_at のように同じ事実を2つの列に持つと、食い違った組み合わせを保存できてしまう。正本を1つにすると、その組み合わせを作れなくなる</td>
                </tr>
                <tr>
                  <th scope="row">Atomicity（<ChapterLink n={84} />）</th>
                  <td>一連の変更を、すべて成功かすべて失敗にする</td>
                  <td>正本と派生データを同じトランザクションで変え、片方だけが変わった状態を残さない</td>
                </tr>
                <tr>
                  <th scope="row">Materialized View（<ChapterLink n={50} />）</th>
                  <td>参照用に事前に計算して保存したデータ</td>
                  <td>派生データを、正本から作り直せるように持つ設計パターン。この章の total_amount も派生データの1つ</td>
                </tr>
                <tr>
                  <th scope="row">Measure Before Optimizing（<ChapterLink n={90} />）</th>
                  <td>計測してから最適化する</td>
                  <td>派生データを持つのは、正本から毎回求めると遅いことを測って確かめてから</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: '明細を正本にし、合計の列を明細から作り直す',
      body: (
        <>
          <p>直す順序は5つの手順に分けます。どの値が正本かを決めてから、読む側、書く側、既存のデータの順に直します。</p>
          <h3>手順1：情報ごとに正本を決める</h3>
          <p>
            最初に、金額にかかわる列を1つずつ取り出し、何の事実を表しているか、正本か・派生データか・別の事実の記録かを決めます。図 86-5 はこの章のテーブルについて決めた結果です。
          </p>
          <Figure n="86-5" title="金額にかかわる列の分類と、直した後に書く場所" caption="分類は図 86-3 の3つ。書く場所は手順4までを終えた後のコード。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">列</th>
                    <th scope="col">何の事実か</th>
                    <th scope="col">分類</th>
                    <th scope="col">直した後に書く場所</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>order_items.unit_price・quantity</td>
                    <td>注文した時点の価格と、届ける数量</td>
                    <td>注文の合計の正本</td>
                    <td>Order#change_items! のブロックの中</td>
                  </tr>
                  <tr>
                    <td>orders.total_amount</td>
                    <td>明細の合計</td>
                    <td>派生データ</td>
                    <td>Order#recalculate_total! だけ</td>
                  </tr>
                  <tr>
                    <td>products.price</td>
                    <td>今の価格</td>
                    <td>今の価格の正本</td>
                    <td>商品の管理画面</td>
                  </tr>
                  <tr>
                    <td>payments.amount</td>
                    <td>決済サービスが確定した金額</td>
                    <td>別の事実の記録（正本は決済サービス）</td>
                    <td>Checkout が決済サービスの応答から1回だけ</td>
                  </tr>
                  <tr>
                    <td>送ったメールの本文</td>
                    <td>送った時点の明細と金額</td>
                    <td>別の事実の記録</td>
                    <td>作り直さない</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 86-5 で迷うのは total_amount の扱いです。派生データは、持たないのがいちばん簡単です。ただし、管理画面の一覧は注文を合計の大きい順に並べ、金額で絞り込むので、インデックスを張った列があると速く読めます。明細から毎回求めたときにどれだけ遅いかは、当てはめすぎの節で測ります。ここでは total_amount を一覧のための派生データとして残し、金額を扱う処理（詳細ページ・メール・返金）は正本の明細から求めると決めました。
          </p>
          <h3>手順2：正本と派生データがそろうことを確かめるテストを書く</h3>
          <p>
            場面の節の spec/order_total_spec.rb の3つの例は、そのまま残します（calculate_total は手順3で total に名前を変えます）。それに加えて、欠品の後に、利用者に見える3つの金額が明細の合計にそろうことを確かめる例を書きます。
          </p>
          <Code
            lang="ruby"
            title="spec/money_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "欠品の後の金額", type: :request do
  let(:beans) { Product.create!(name: "コーヒー豆（200g）", price: 1280) }
  let(:filter) { Product.create!(name: "ドリップフィルター（100枚）", price: 398) }
  let!(:order) { Checkout.call(number: "A0001", email: "a@example.com", lines: { beans => 2, filter => 3 }) }

  before { StockShortageJob.perform_now(order.order_items.find_by!(product: beans), 1) }

  it "詳細ページ・変更のメール・返金する金額が、明細の合計にそろう" do
    get order_path(order)
    expect(response.body).to include("合計 2,474円")
    expect(ActionMailer::Base.deliveries.last.body.to_s).to include("お支払い金額: 2,474円")
    expect(order.payment.reload.refund_due).to eq(1280)
  end
end
`}
          />
          <p>
            コールバックを足す前のコードでこの例を実行すると、メールの本文が「変更後のお支払い金額: 3,754円」なので失敗します。テストが確かめるのは利用者に見える金額で、total_amount をどう更新するかには触れません。そのため、手順3と手順4で書き方を変えても、同じテストで確かめられます。
          </p>
          <h3>手順3：金額を扱う処理を、正本から求めるメソッドに向ける</h3>
          <p>
            Order に、明細から合計を求める total を置きます。calculate_total と同じ SQL ですが、「金額を扱う処理はこのメソッドを読む」という役割をはっきりさせるために名前を変えました。メール・詳細ページ・返金の3か所を total に向けます。
          </p>
          <Code
            lang="text"
            title="変更（diff -u。メールと詳細ページ）"
            code={`
--- ch88cb/app/views/order_mailer/items_changed.text.erb
+++ ch88/app/views/order_mailer/items_changed.text.erb
@@ -2,4 +2,4 @@
 <% @order.order_items.each do |item| -%>
 <%= item.product.name %> <%= item.quantity %>点
 <% end -%>
-変更後のお支払い金額: <%= number_with_delimiter(@order.total_amount) %>円
+変更後のお支払い金額: <%= number_with_delimiter(@order.total) %>円
--- ch88cb/app/views/orders/show.html.erb
+++ ch88/app/views/orders/show.html.erb
@@ -8,4 +8,4 @@
     </tr>
   <% end %>
 </table>
-<p>合計 <%= number_with_delimiter(@order.calculate_total) %>円</p>
+<p>合計 <%= number_with_delimiter(@order.total) %>円</p>
`}
          />
          <Code
            lang="ruby"
            title="app/models/payment.rb（直した後）"
            code={`
class Payment < ApplicationRecord
  belongs_to :order
  # …（省略。attr_readonly :amount。Rails の節で扱う）

  # 返金する金額：決済した金額のうち、注文の合計を超える分
  def refund_due = amount - order.total
end
`}
          />
          <p>
            この時点で、金額を扱う処理は total_amount を読まなくなりました。total_amount が食い違っても、利用者に見える金額と返金の額は誤りません。残る問題は一覧の並び順に使う total_amount の食い違いです。
          </p>
          <h3>手順4：total_amount を書く場所を1つにし、同じトランザクションで作り直す</h3>
          <p>
            明細を変える処理は Order#change_items! に渡すブロックの中で変えることにします。change_items! は注文の行をロックしてから明細を変え、同じトランザクションの中で total_amount を作り直します。total_amount を書くのは recalculate_total! だけです。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直した後）"
            code={`
class Order < ApplicationRecord
  has_many :order_items
  has_one :payment

  # 合計の正本は明細（unit_price × quantity）。金額を扱う処理は、このメソッドで明細から求める
  def total = order_items.sum("unit_price * quantity")

  # 明細はこのメソッドに渡すブロックの中で変える。
  # 注文の行をロックし、同じトランザクションで total_amount を作り直す
  def change_items!
    with_lock do
      yield order_items
      recalculate_total!
    end
  end

  # total_amount は一覧の並べ替えと絞り込みのための派生データ。書くのはこのメソッドだけ
  def recalculate_total! = update!(total_amount: total)

  # total_amount が明細の合計と食い違っている注文
  scope :with_stale_total, -> {
    where(<<~SQL)
      orders.total_amount <> (SELECT SUM(unit_price * quantity) FROM order_items WHERE order_items.order_id = orders.id)
    SQL
  }

  # 食い違っている注文の total_amount を、明細から作り直す
  def self.rebuild_totals!
    with_stale_total.each { |order| order.with_lock { order.recalculate_total! } }
  end
end
`}
          />
          <p>
            with_lock はトランザクションを始めて <code>SELECT … FOR UPDATE</code> で自分の行をロックし、ブロックを実行するメソッドです<Ref n={8} />。同じ注文の明細を変えるもう1つのジョブは、注文の行のロックを待つので、1つ目のジョブが COMMIT するまで明細を変えられません。待った後のジョブが SUM を実行するときには、1つ目のジョブの変更は COMMIT 済みなので、両方の変更を含む合計になります。行のロックの使い方は<ChapterLink n={15} section="pessimistic" />で扱いました。
          </p>
          <p>
            total_amount が派生データであることは、コードを読む人だけでなく、DB を直接見る人にもわかるようにしておきます。列にコメントを付けると、MySQL の列の定義と db/schema.rb に残ります。初期値も 0 にして、注文を作る処理が total_amount に値を書かなくて済むようにしました。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000002_mark_orders_total_amount_as_derived.rb"
            code={`
class MarkOrdersTotalAmountAsDerived < ActiveRecord::Migration[8.1]
  def change
    change_column_default :orders, :total_amount, from: nil, to: 0
    change_column_comment :orders, :total_amount,
      from: nil, to: "order_items から作る派生データ。Order#recalculate_total! だけが書く"
  end
end
`}
          />
          <p>明細を変える3つの処理と、コールバックを消した OrderItem です。</p>
          <Code
            lang="ruby"
            title="app/services/checkout.rb・app/jobs/stock_shortage_job.rb・app/services/sale_price_correction.rb・app/models/order_item.rb（直した後）"
            code={`
# カートの中身から注文を作り、決済する
class Checkout
  def self.call(number:, email:, lines:)
    order = Order.transaction do
      order = Order.create!(number:, email:)
      order.change_items! do |items|
        lines.each do |product, quantity|
          items.create!(product:, unit_price: product.price, quantity:)
        end
      end
      order
    end
    charge = PaymentGateway.charge(order.total)
    order.create_payment!(charge_id: charge[:id], amount: charge[:amount])
    order
  end
end

# 倉庫から欠品の知らせが届いたら、明細の数量を減らし、変更をメールで知らせる
class StockShortageJob < ApplicationJob
  def perform(order_item, available_quantity)
    order = order_item.order
    order.change_items! { order_item.update!(quantity: available_quantity) }
    OrderMailer.with(order:).items_changed.deliver_now
  end
end

# セールの価格が反映されていなかった注文の明細の単価を、まとめて直す
class SalePriceCorrection
  def self.call(product, sale_price, orders)
    orders.find_each do |order|
      order.change_items! { |items| items.where(product:).update_all(unit_price: sale_price) }
    end
  end
end

class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product
end
`}
          />
          <p>
            SalePriceCorrection は、change_items! のブロックの中なら update_all を使ってかまいません。コールバックに頼らず、ブロックを抜けた後に recalculate_total! が必ず呼ばれるからです。そのかわり、注文ごとに1回の UPDATE とロックが要るので、何十万件もの注文を直すときは、作業の時間を見積もってから実行します。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation。直した後）"
            code={`
欠品の後の金額
  詳細ページ・変更のメール・返金する金額が、明細の合計にそろう

注文の合計（orders.total_amount）
  欠品で数量を減らすと、明細の合計と一致する
  セールの価格をまとめて直すと、明細の合計と一致する
  2つの明細の欠品を同時に処理すると、明細の合計と一致する

total_amount の作り直し
  食い違っている注文だけを見つけ、明細から作り直す

Finished in 2.71 seconds (files took 1.64 seconds to load)
5 examples, 0 failures
`}
          />
          <p>
            場面の節で失敗した2つの例も通りました。実行に2.71秒かかったのは、同時の例で1つ目のジョブが SUM の後に2秒待ったからです。2つ目のジョブは注文の行のロックを待っていて SUM まで進めないので、テストの中の待ち合わせは時間切れになり、1つ目のジョブはそのまま COMMIT しました。図 86-2 のように2つの SUM が重なることは、なくなりました。場面の節のスクリプトも実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/shortage.rb。直した後）"
            code={`
注文した時: 合計 3754円、決済した金額 3754円
欠品の後
  注文の詳細ページの合計: 2,474円
  変更のお知らせのメール: 2,474円
  返金する金額（決済の管理画面）: 1280円
  orders.total_amount: 2474
`}
          />
          <Figure n="86-6" title="直す前と後：合計を書く場所と読む場所" caption="左は場面の節でコールバックを足した後のコード。実線の矢印は書き込み、破線の矢印は読み取り。">
            <CompareFigure />
          </Figure>
          <p>
            図 86-6 の左では、明細を変える3つの処理がそれぞれ直接テーブルを書き、total_amount はコールバックを通ったときだけ作り直されていました。右では、明細を変える処理はすべて change_items! を通り、total_amount を書く場所は recalculate_total! の1か所です。金額を扱う処理は正本の明細を読み、派生データの total_amount を読むのは一覧だけです。DRY の線のクラスの例が勧めたとおり、値をそろえる責任を Order のメソッドの中に閉じ込めた形です<Ref n={3} />。
          </p>
          <h3>手順5：食い違った既存のデータを見つけて作り直す</h3>
          <p>
            直す前のコードが動いていた間に、total_amount が食い違った注文がすでにあるかもしれません。手順4の with_stale_total は、注文ごとに明細の合計を求めて total_amount と比べる SQL です。直す前のコードが残した状態を作り、見つけて作り直すスクリプトを実行しました。
          </p>
          <Code
            lang="ruby"
            title="script/stale_totals.rb"
            code={`
# 直す前のコードで total_amount が食い違った注文を探し、明細から作り直す
[Payment, OrderItem, Order, Product].each(&:delete_all)
beans = Product.create!(name: "コーヒー豆（200g）", price: 1280)
filter = Product.create!(name: "ドリップフィルター（100枚）", price: 398)
a1 = Checkout.call(number: "A0001", email: "a@example.com", lines: { beans => 2, filter => 3 })
Checkout.call(number: "A0002", email: "b@example.com", lines: { filter => 1 })
a3 = Checkout.call(number: "A0003", email: "c@example.com", lines: { beans => 1 })

# 直す前のコードが残した状態を作る（欠品で数量だけ減った注文、単価だけ直った注文）
a1.order_items.find_by!(product: beans).update_column(:quantity, 1)
a3.order_items.update_all(unit_price: 1080)

show = ->(label) do
  rows = Order.with_stale_total.map { |o| "#{o.number}（total_amount #{o.total_amount}、明細の合計 #{o.total}）" }
  puts "#{label}: #{rows.empty? ? 'なし' : rows.join('、')}"
end
show.("食い違っている注文")
Order.rebuild_totals!
show.("作り直した後")
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/stale_totals.rb）"
            code={`
食い違っている注文: A0001（total_amount 3754、明細の合計 2474）、A0003（total_amount 1280、明細の合計 1080）
作り直した後: なし
`}
          />
          <p>
            Codd が挙げた2つの方法に当てはめると、change_items! は「更新のたびに確かめる」方法、with_stale_total と rebuild_totals! は「まとめて確かめる」方法です<Ref n={1} />。本番では with_stale_total を毎晩のジョブで実行し、1件でも見つかったら通知します。見つかるのは、change_items! を通らずに明細を変えたコード（rails console での手作業の修正や、新しく足したバッチ）がある場合なので、通知を受けたら作り直すだけでなく、その経路を探して直します。定期的に動かすジョブの書き方は<ChapterLink n={18} section="recurring-jobs" />で扱いました。
          </p>
          <Figure n="86-7" title="派生データを正本にそろえる方法と、集計表の章との対応" caption="右の列は Materialized View の章（売上の集計表）のコード。赤い帯の長さは模式。">
            <RebuildFigure />
          </Figure>
          <p>
            図 86-7 は派生データを正本にそろえる方法を、正本が変わってからそろうまでの時間で並べたものです。この章の total_amount は、正本と同じトランザクションで作り直すので、COMMIT と同時にそろいます。<ChapterLink n={50} />の売上の集計表は、集計に時間がかかるので、after_commit から積むジョブや、決めた時刻の作り直しで更新し、その間は古い値が見えることを受け入れています。どの方法でも、正本から作り直す処理と、食い違いを見つける手段を用意しておく点は同じです。Azure の Materialized View パターンの説明も、マテリアライズドビューは元のデータから完全に作り直せるので捨ててよいものだとしています<Ref n={10} />。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '別の事実まで正本に寄せたときと、派生データを一切持たないとき',
      body: (
        <>
          <p>
            Single Source of Truth を「同じ値に見えるものは、すべて1か所から求める」と受け取ると、別の事実まで正本に寄せてしまいます。反対に、派生データを一切持たないことにこだわると、遅い画面が残ります。この節では両方を動かして確かめます。
          </p>
          <h3>決済した金額を明細から求める</h3>
          <p>
            直した後のコードを読んだ開発者が、「決済した金額は注文した時の合計と同じ値だから、payments.amount は合計の重複だ。Single Source of Truth に従って列を消し、明細から求めよう」と考えた場合です。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000003_remove_amount_from_payments.rb（当てはめすぎた例）"
            code={`
class RemoveAmountFromPayments < ActiveRecord::Migration[8.1]
  def change
    # 決済した金額は注文の合計と同じなので、明細から求めることにした（当てはめすぎた例）
    remove_column :payments, :amount, :integer, null: false
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/payment.rb（当てはめすぎた例）"
            code={`
class Payment < ApplicationRecord
  belongs_to :order

  # 決済した金額は、注文の合計を正本として明細から求める
  def amount = order.total

  # 返金する金額：決済した金額のうち、注文の合計を超える分
  def refund_due = amount - order.total
end
`}
          />
          <p>
            Checkout も決済サービスの応答の金額を保存しないように <code>order.create_payment!(charge_id: charge[:id])</code> に変えました。場面の節と同じく、コーヒー豆の欠品で数量を2袋から1袋に減らします。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/shortage.rb。payments.amount を消した版）"
            code={`
注文した時: 合計 3754円、決済した金額 3754円
欠品の後
  決済した金額（Payment#amount）: 2474円
  決済サービスに記録された金額: 3754円
  返金する金額（決済の管理画面）: 0円
`}
          />
          <p>
            「決済サービスに記録された金額」は、この章のアプリで決済サービスの代わりに置いたモジュールが、請求の時に記録した金額です。決済サービスは 3,754円を請求したのに、アプリの「決済した金額」は欠品の後に 2,474円に変わり、返金する金額は0円になりました。場面の節と同じ「返金0円」が、反対の理由で起きています。場面の節では派生データが正本に追いつかず、この節では別の事実を派生データにしてしまいました。
          </p>
          <p>
            3,754円を請求したという事実の正本は、決済サービスにあります。payments.amount はその事実を請求した時点でアプリに写した記録で、明細から作る派生データではありません。明細が後で変わっても、請求した金額は変わりません。正しい扱いは列を残し、作った後に変えないようにすることです（Rails の節の attr_readonly）。アプリの記録と決済サービスの記録が食い違っていないかは、決済サービスの取引の一覧と payments を定期的に突き合わせて確かめます。これは正本（決済サービス）と写し（payments）の照合で、手順5の with_stale_total と同じ考え方です。
          </p>
          <h3>注文した時点の価格を、今の価格から求める</h3>
          <p>
            同じ誤りは明細の unit_price を消して products.price から求める形でも起きます。商品の価格を直しただけで過去の注文の金額が変わることは、<ChapterLink n={58} section="overuse" />で動かして確かめました。products.price は今の価格の正本で、unit_price は注文した時点の価格の記録です。2つの値は注文した瞬間には同じでも、別の事実です。
          </p>
          <h3>派生データを一切持たない</h3>
          <p>
            反対の方向の当てはめすぎもあります。「派生データは持たない」を徹底して total_amount を消すと、管理画面の一覧は、表示のたびに明細を集計して並べ替えることになります。注文20万件・明細40万件のデータで、合計の大きい順に20件を取り出す時間を比べました。
          </p>
          <Code
            lang="ruby"
            title="script/list_benchmark.rb"
            code={`
# 注文 20万件で、管理画面の一覧（合計の大きい順に20件）を取り出す時間を比べる
if Order.count < 200_000
  [Payment, OrderItem, Order, Product].each(&:delete_all)
  products = 20.times.map { |i| Product.create!(name: "商品#{i}", price: 300 + i * 97) }
  now = Time.current
  200_000.step(1, -1).each_slice(10_000) do |slice|
    lines = slice.to_h { |n| [n, products.sample(1 + n % 3).map { |p| [p, 1 + n % 4] }] }
    Order.insert_all(slice.map { |n|
      { id: n, number: format("B%06d", n), email: "u#{n}@example.com",
        total_amount: lines[n].sum { |p, q| p.price * q }, created_at: now, updated_at: now }
    })
    OrderItem.insert_all(slice.flat_map { |n|
      lines[n].map { |p, q| { order_id: n, product_id: p.id, unit_price: p.price, quantity: q, created_at: now, updated_at: now } }
    })
  end
end
puts "注文 #{Order.count}件、明細 #{OrderItem.count}件"

queries = {
  "total_amount の列（インデックスあり）" => -> {
    Order.order(total_amount: :desc).limit(20).pluck(:number)
  },
  "明細から毎回計算する" => -> {
    Order.joins(:order_items).group(:id)
      .order(Arel.sql("SUM(order_items.unit_price * order_items.quantity) DESC")).limit(20).pluck(:number)
  },
}
# bin/rails runner はクエリキャッシュを有効にして実行するので、uncached で外して測る
ActiveRecord::Base.uncached do
  queries.each do |label, query|
    query.call
    times = 5.times.map do
      started = Process.clock_gettime(Process::CLOCK_MONOTONIC, :float_millisecond)
      query.call
      Process.clock_gettime(Process::CLOCK_MONOTONIC, :float_millisecond) - started
    end
    puts "#{label}: 中央値 #{times.sort[2].round(1)} ms"
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/list_benchmark.rb。4回目）"
            code={`
注文 200000件、明細 400001件
total_amount の列（インデックスあり）: 中央値 1.7 ms
明細から毎回計算する: 中央値 596.9 ms
`}
          />
          <p>
            同じスクリプトを4回実行すると、中央値は列を使うほうが 0.6〜2.1 ミリ秒、明細から計算するほうが 597〜671 ミリ秒でした（WSL2 上の Docker で動かした MySQL 8.4 での値）。列を使うほうは、total_amount のインデックスを大きい順にたどって20行で止まります。明細から計算するほうは、40万件の明細を集計してから並べ替えます。
          </p>
          <p>
            1回の表示に0.6秒かかることを受け入れるかどうかは、画面の使われ方で決まります。社内の数人が1日に数回開くだけなら、派生データを持たずに済ませる判断もあります。Raymond も途中の結果を保存する前に、それが早すぎる最適化ではないかを考えるよう求めていました<Ref n={4} />。この章のサイトでは、一覧を開く回数が多いので、計測した結果をもとに total_amount を残しました。計測の手順は<ChapterLink n={90} />で扱います。
          </p>
          <h3>判断の目安</h3>
          <Figure n="86-8" title="2か所にある値をどう扱うかの判断" caption="模式図。問1で別の事実を見分け、問2で派生データを持つかを決める。">
            <JudgeFigure />
          </Figure>
          <p>図 86-8 の2つの問いは次のように使います。</p>
          <ul>
            <li>
              問1「片方が変わったら、もう片方も必ず同じに変わるべきか」：total_amount は明細が変わったら必ず変わるべきなので「はい」です。payments.amount と unit_price は、明細や商品の価格が変わっても変わってはいけないので「いいえ」で、別の事実の記録として残します。
            </li>
            <li>
              問2「毎回正本から求めて、必要な速さに間に合うか」：推測ではなく、実際の件数に近いデータで測って答えます。間に合うなら派生データを持たず、Order#total のようなメソッドで正本から求めます。
            </li>
            <li>
              問2が「いいえ」で派生データを持つときは、書く場所を1つにし、正本と同じトランザクションで作るか、作り直しのジョブを用意します。どちらの場合も、食い違いを見つけるクエリと、全体を作り直す処理を用意します。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の counter_cache・生成列・attr_readonly・schema.rb と正本',
      body: (
        <>
          <h3>counter_cache：Rails が用意している派生データ</h3>
          <p>
            Rails には、派生データを持つための仕組みとして counter_cache があります。<code>belongs_to :author, counter_cache: true</code> と書くと、Rails は子のレコードを作るときと消すときに、親の books_count のような列を増減します。<code>author.books.size</code> は、COUNT を実行せずにこの列を読みます<Ref n={11} />。件数の正本は子のレコードで、books_count は派生データです。
          </p>
          <p>
            counter_cache もこの章の total_amount と同じ理由で食い違うことがあります。増減はレコードの作成と削除のときに行うので、insert_all や、Relation の delete_all のようにコールバックを通らない操作では変わりません（<ChapterLink n={13} section="counter-inverse" />）。Rails は作り直しの手段として reset_counters を用意していて、API の説明は新しく counter_cache を足したときや、数が壊れたとき、SQL で直接変えられたときに使うと書いています<Ref n={12} />。大きな表に counter_cache を足すときは、<code>counter_cache: {'{ active: false }'}</code> にしておくと、値を埋め終わるまでは size などが列を読まずに DB に数えさせます<Ref n={11} />。作り直しが終わるまで派生データを読まない、という使い方です。
          </p>
          <h3>MySQL の生成列：同じ行の中の派生データを DB に作らせる</h3>
          <p>
            MySQL の<Term en="generated column">生成列</Term>は、列の定義に書いた式から値を計算する列です。STORED を付けると、行を挿入・更新するたびに値を計算して保存し、インデックスも張れます。マニュアルは計算に費用のかかる条件を保存しておく用途を挙げる一方で、式に副問い合わせ（サブクエリ）は書けないとしています<Ref n={13} />。そのため、別の表の行を足し合わせる total_amount は生成列にできませんが、同じ行の unit_price × quantity なら生成列にできます。Rails の MySQL アダプターは、<code>:virtual</code> の型と as: で生成列を作り、stored: true で STORED を付けます<Ref n={14} />。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000003_add_subtotal_to_order_items.rb"
            code={`
class AddSubtotalToOrderItems < ActiveRecord::Migration[8.1]
  def change
    # 明細の金額を、MySQL が unit_price と quantity から作る生成列にする
    add_column :order_items, :subtotal, :virtual, type: :integer, as: "unit_price * quantity", stored: true
  end
end
`}
          />
          <p>
            生成列では、値を書く場所は DB の1か所だけになり、アプリのどのコードから更新しても、コールバックの有無にかかわらず値がそろいます。次の節の attr_readonly とあわせて、スクリプトで動きを確かめました。
          </p>
          <Code
            lang="ruby"
            title="script/rails_features.rb"
            code={`
# 生成列と attr_readonly の動きを確かめる
[Payment, OrderItem, Order, Product].each(&:delete_all)
beans = Product.create!(name: "コーヒー豆（200g）", price: 1280)
order = Checkout.call(number: "A0001", email: "a@example.com", lines: { beans => 2 })
item = order.order_items.first

# 1. 生成列：コールバックを通らない update_all で数量を変えても、subtotal は MySQL が作り直す
OrderItem.where(id: item.id).update_all(quantity: 3)
item.reload
puts "subtotal: #{item.subtotal}（unit_price #{item.unit_price} × quantity #{item.quantity}）"
begin
  OrderItem.where(id: item.id).update_all(subtotal: 1)
rescue ActiveRecord::StatementInvalid => e
  puts "subtotal に書く: #{e.cause.message}"
end

# 2. attr_readonly：決済サービスが確定した金額は、作った後に update! では変えられない
begin
  order.payment.update!(amount: 2474)
rescue ActiveRecord::ReadonlyAttributeError => e
  puts "amount を変える: #{e.class}（#{e.message}）"
end
Payment.where(id: order.payment.id).update_all(amount: 2474)
puts "update_all で変える: amount = #{order.payment.reload.amount}（止まらない）"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/rails_features.rb）"
            code={`
subtotal: 3840（unit_price 1280 × quantity 3）
subtotal に書く: The value specified for generated column 'subtotal' in table 'order_items' is not allowed.
amount を変える: ActiveRecord::ReadonlyAttributeError（amount）
update_all で変える: amount = 2474（止まらない）
`}
          />
          <p>
            update_all で数量を3にしても、subtotal は 1,280 × 3 = 3,840 になりました。subtotal に直接値を書こうとすると、MySQL がエラーにします。派生データを書けるのが DB だけなので、正本と食い違う経路がありません。
          </p>
          <h3>attr_readonly：別の事実の記録を変えないようにする</h3>
          <p>
            当てはめすぎの節の payments.amount のように、作った後に変えてはいけない値には、attr_readonly を宣言できます。直した後の Payment には、次の1行を足しています。
          </p>
          <Code
            lang="ruby"
            title="app/models/payment.rb（attr_readonly の部分）"
            code={`
  # 決済サービスが確定した金額。作った後は変えない
  attr_readonly :amount
`}
          />
          <p>
            上の実行結果のとおり、保存済みのレコードで amount を update! すると ActiveRecord::ReadonlyAttributeError が発生しました。Rails 7.1 の既定値（config.load_defaults "7.1" 以降）では、config.active_record.raise_on_assign_to_attr_readonly が true になり、代入した時点で例外が発生します<Ref n={15} />。update_columns も readonly の属性を渡すと例外を発生させます<Ref n={16} />。ただし、update_all はモデルの宣言を見ずに SQL を送るので、止まりませんでした。attr_readonly はアプリのコードの誤りを早く見つけるための宣言で、DB への書き込みそのものを禁止するものではありません。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 でも attr_readonly の動きは同じで、config.load_defaults が 7.1 以上なら代入した時点で例外が発生します。7.0 以前の既定値のままのアプリでは、raise_on_assign_to_attr_readonly が false なので例外は発生せず、値はメモリーの上だけで変わり、保存されません。counter_cache の active: false も 7.2.2.1 のソースにあります。
            </p>
          </Callout>
          <Figure n="86-9" title="Rails と MySQL の機能と、正本・派生データ" caption="どの機能も、update_all や SQL の直接の実行に対して何が起きるかを確かめてから使う。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">機能</th>
                    <th scope="col">扱うもの</th>
                    <th scope="col">値を書く場所</th>
                    <th scope="col">作り直し・注意</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>counter_cache</td>
                    <td>子のレコードの件数（派生データ）</td>
                    <td>Rails（作成と削除のとき）</td>
                    <td>reset_counters で作り直す。insert_all や Relation の delete_all では変わらない</td>
                  </tr>
                  <tr>
                    <td>生成列（STORED）</td>
                    <td>同じ行の値から計算する値（派生データ）</td>
                    <td>MySQL（行の挿入・更新のとき）</td>
                    <td>どの経路の更新でもそろう。別の表の値は使えない</td>
                  </tr>
                  <tr>
                    <td>この章の change_items!</td>
                    <td>明細の合計（派生データ）</td>
                    <td>recalculate_total! の1か所</td>
                    <td>rebuild_totals! で作り直す。change_items! を通らない更新は with_stale_total で見つける</td>
                  </tr>
                  <tr>
                    <td>attr_readonly</td>
                    <td>作った後に変えない値（別の事実の記録）</td>
                    <td>作成のときだけ</td>
                    <td>update! や代入では例外。update_all は止まらない</td>
                  </tr>
                  <tr>
                    <td>db/schema.rb</td>
                    <td>DB のスキーマ（DB から作る写し）</td>
                    <td>bin/rails db:schema:dump</td>
                    <td>手で直さない。空の DB を作るときは、こちらが読まれる（下の「スキーマの正本」）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <h3>スキーマの正本：DB と db/schema.rb</h3>
          <p>
            Rails Guides の Active Record Migrations は、マイグレーションはスキーマの正式な出典ではなく、データベースが source of truth のままだと書いています。db/schema.rb はデータベースのスキーマの今の状態を書き出したもので、データベースを作り直すときの正式な出典になるとも説明しています<Ref n={17} />。マイグレーションは変更の履歴、DB は正本、schema.rb は DB から作った写しです。
          </p>
          <p>
            この関係は過去のマイグレーションを直接書き換えたときに表に出ます。この章のアプリを作る途中で、payments の refunded_amount 列を使わなくなったので、schema.rb を作り直さないまま、最初のマイグレーションから refunded_amount の行を消しました。その後で DB を作り直した結果です。
          </p>
          <Code
            lang="text"
            title="実行結果（最初のマイグレーションから refunded_amount の行を消した後）"
            code={`
$ grep -c refunded_amount db/migrate/*.rb db/schema.rb
db/migrate/20261122000001_create_shop_tables.rb:0
db/migrate/20261122000002_mark_orders_total_amount_as_derived.rb:0
db/migrate/20261122000003_add_subtotal_to_order_items.rb:0
db/schema.rb:1
$ bin/rails db:drop db:create db:migrate
Database 'ch88schema_test' does not exist
Created database 'ch88schema_test'
$ bin/rails runner "p Payment.column_names"
["id", "order_id", "charge_id", "amount", "refunded_amount", "created_at", "updated_at"]
`}
          />
          <p>
            マイグレーションには refunded_amount がないのに、作り直した DB には列がありました。Rails 8.1 の db:migrate は schema_migrations の表がない空の DB では、schema.rb があればそれを読み込んでから、残りのマイグレーションだけを実行するからです<Ref n={18} />。このとき、書き換えた最初のマイグレーションは実行されません。スキーマを変えるときは、過去のマイグレーションを書き換えずに新しいマイグレーションを足し、schema.rb は db:migrate に書き出させます。動いている本番の DB で列を消す手順は、<ChapterLink n={27} section="schema-and-data-repair" />で扱いました。
          </p>
          <Callout kind="v72">
            <p>
              空の DB で schema.rb を読み込むこの処理（DatabaseTasks の initialize_database）は、activerecord 8.0.0 のソースにはあり、7.2.2.1 のソースにはありません<Ref n={18} />。Rails 7.2 の db:migrate は空の DB でもマイグレーションを最初から順に実行するので、上の例では refunded_amount のない表ができます。同じ操作でも、Rails のバージョンによって、どちらを正本として読むかが変わります。
            </p>
          </Callout>
          <h3>設定の正本</h3>
          <p>
            設定の値にも正本があります。Rails では、環境ごとの設定ファイル（config/environments/*.rb）、config_for で読む YAML のファイル<Ref n={19} />、暗号化して保存する credentials、環境変数が、設定を置く場所の候補です。1つの設定値はこのうち1か所だけから読むようにします。2か所を順に探して先に見つかった値を使う書き方にすると、どちらの値が使われているかを、その環境を見ないと判断できず、片方を変えても反映されないことがあります。秘密の値の置き場所は<ChapterLink n={21} section="secrets" />で、方針の値を YAML に出しすぎた例は<ChapterLink n={87} section="overuse" />で扱いました。
          </p>
          <h3>Rails Doctrine との関係</h3>
          <p>
            Rails Doctrine の「Value integrated systems」は、統合されたシステムでは不要な抽象化を省き、層の間の重複（サーバーとクライアントの両方にあるテンプレートなど）を減らせると述べ、本当に必要になるまでシステムを分散させないことを勧めています<Ref n={20} />。この章の change_items! は、注文と明細が同じ DB にあるので、1つのトランザクションで正本と派生データを変えられます。注文と決済を別々のサービスと DB に分けると、ほかのサービスのデータは、イベントなどで後から届く写しとして持つことになり、図 86-7 の「後で作り直す」方法を使うことになります。変更をイベントとして確実に届ける方法は<ChapterLink n={53} />で扱います。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={59} />（DRY）：知識の表現を1か所にする原則です。この章は保存した値の正本を1つにする原則として、DRY と分けて扱いました。
            </li>
            <li>
              <ChapterLink n={50} />（Materialized View）：売上の集計表と検索用の表を、元のデータから作り直す方法を扱います。図 86-7 の後で作り直す方法の詳しい実装です。
            </li>
            <li>
              <ChapterLink n={84} />（Atomicity）：一連の変更をすべて成功かすべて失敗にする原則と、外部の API を含む処理はトランザクションで原子的にできないことを扱います。
            </li>
            <li>
              <ChapterLink n={81} />（Make Illegal States Unrepresentable）：status と shipped_at のように、同じ事実を2つの列に持たない設計を扱います。
            </li>
            <li>
              <ChapterLink n={14} section="callback-boundaries" />：保存のたびに必要な処理をコールバックに置き、業務の操作は明示的に呼ぶという分け方を扱いました。この章では合計の作り直しを after_save から change_items! に移しました。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          情報ごとに正本を1つ決め、ほかの値は正本から作り直せる派生データにします。この章では明細を注文の合計の正本にし、total_amount を書く場所を recalculate_total! の1か所にしました。決済した金額や注文した時点の価格は、値が同じに見えても別の事実の記録なので、正本から作り直しません。
        </>
      ),
      benefit: {
        text: <>直す前は、欠品でコーヒー豆を1袋減らすと、詳細ページは 2,474円、メールは 3,754円、返金は0円になった。明細を変える処理をすべて change_items! に通し、同じトランザクションで total_amount を作り直すと、同時に動いた2つのジョブの例も含めて食い違いが残らなくなった。</>,
        basis: <><ChapterLink n={88} section="scene" />、<ChapterLink n={88} section="apply" /></>,
      },
      cost: {
        text: <>change_items! は注文の行をロックするので、同じ注文を変える2つ目のジョブは待つ（テストでは 2.71秒かかった）。何十万件もの注文を直すときは注文ごとに UPDATE とロックが要る。食い違いを見つける with_stale_total を毎晩のジョブで実行し、全体を作り直す処理も用意する。</>,
        basis: <ChapterLink n={88} section="apply" />,
      },
      alternative: {
        text: <>派生データを一切持たず、毎回明細から求めることもできる。注文20万件・明細40万件で合計の大きい順に20件を出すと、total_amount の列を使えば 0.6〜2.1 ミリ秒、明細から計算すると 597〜671 ミリ秒だった。社内の数人が1日に数回開くだけの画面なら、持たずに済ませる判断もある。</>,
        basis: <ChapterLink n={88} section="overuse" />,
      },
      criterion: {
        text: <>片方が変わったら、もう片方も必ず同じに変わるべきか（payments.amount を明細から求めた例では、3,754円を請求した事実がアプリから消えた）。毎回正本から求めて、必要な速さに間に合うかを、実際の件数に近いデータで測る。</>,
        basis: <ChapterLink n={88} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Single Source of Truth は、同じ情報の正本を複数持たないという原則です。情報ごとに正本を1つ決め、データの不整合や更新の漏れを防ぎます。</li>
          <li>注文の合計を明細と orders.total_amount の2か所に持つと、明細だけを変える処理、コールバックを通らない update_all、同時に動く2つのジョブで、2つの値が食い違います。合計の計算を1か所に書いて DRY を守っていても、この食い違いは防げません。</li>
          <li>Codd は冗長な値と一貫性の確かめ方を、Kent は表をまたぐ冗長性が正規形では見つからないことを、Kleppmann は正本と、そこから作り直せる派生データの区別を述べています。言葉の提唱者は確かめられませんでした。</li>
          <li>直すときは、列ごとに正本・派生データ・別の事実の記録を決め、金額を扱う処理は正本から求めます。派生データを持つなら、書く場所を1つにし、正本と同じトランザクションで作り直し、食い違いを見つけるクエリと作り直しの処理を用意します。</li>
          <li>決済した金額や注文した時点の価格は、値が同じに見えても別の事実の記録です。正本から作り直すと、返金の額や過去の注文の金額を誤ります。反対に、派生データを一切持たないと遅い画面が残るので、持つかどうかは計測して決めます。</li>
          <li>Rails の counter_cache と reset_counters、MySQL の生成列、attr_readonly、DB と db/schema.rb の関係は、それぞれ派生データと記録の扱い方の例です。どれも update_all や SQL の直接の実行で何が起きるかを確かめてから使います。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'A Relational Model of Data for Large Shared Data Banks', publisher: 'E. F. Codd / Communications of the ACM（University of Pennsylvania の講義のページに置かれた複製）', url: 'https://www.seas.upenn.edu/~zives/03f/cis550/codd.pdf', accessed: '2026-11-22', version: '13巻6号（1970年6月）377〜387ページ（DOI 10.1145/362384.362685）', note: '2.2節の冗長性の定義（ある関係の射影がほかの射影から導けること）と employee(serial#, name, manager#, managername) の例、2.3節の一貫性の定義（制約を満たすかどうかで決まり、状態がどう作られたかに関係しないこと）、食い違いを挿入・削除・キーの更新のたびに確かめる方法と、1日1回などまとめて確かめる方法。' },
    { title: 'A Simple Guide to Five Normal Forms in Relational Database Theory', publisher: 'William Kent / Communications of the ACM（著者のサイトに置かれた版）', url: 'https://www.bkent.net/Doc/simple5.htm', accessed: '2026-11-22', version: '26巻2号（1983年2月）120〜125ページ', note: '正規化の規則が更新時の異常とデータの不整合を防ぐためにあること、倉庫の住所の例、性能の要件を考えれば完全に正規化する義務はないこと、6節の複数の種類のレコードにまたがる冗長性は第3正規形でも残ること。' },
    { title: 'The Pragmatic Programmer, 20th Anniversary Edition（抜粋「DRY—The Evils of Duplication」）', publisher: 'The Pragmatic Bookshelf', url: 'https://media.pragprog.com/titles/tpp20/dry.pdf', accessed: '2026-11-22', version: '2019年9月刊（書籍ページ https://pragprog.com/titles/tpp20/ ）', note: '「DRY Violations in Data」の線のクラスの例（長さを計算で求める）、性能のために値を保存するときは影響をクラスの中に閉じ込め、クラスのメソッドだけが値をそろえること。' },
    { title: 'The Art of Unix Programming（Chapter 4. Modularity：Compactness and Orthogonality / The SPOT Rule）', publisher: 'Eric S. Raymond（著者のサイトの HTML 版を Internet Archive に保存したもの）', url: 'https://web.archive.org/web/20250125184200/http://www.catb.org/esr/writings/taoup/html/ch04s02.html', accessed: '2026-11-22', version: '2003年（HTML 版の Revision 1.0 は2003年9月19日）', note: 'DRY の定義を引用し、Brian Kernighan の提案に従って Single Point Of Truth（SPOT）の規則と呼んでいること。途中の結果を保存するためのデータの重複は早すぎる最適化でないかを考えること、古くなったキャッシュとそれをそろえるコードが不具合の多い原因になり、性能も下げうること。' },
    { title: 'Designing Data-Intensive Applications（Part III. Derived Data）', publisher: 'Martin Kleppmann / O\'Reilly Media（O\'Reilly のページを Internet Archive に保存したもの）', url: 'https://web.archive.org/web/20250304091224/https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/part03.html', accessed: '2026-11-22', version: '2017年3月刊', note: 'データシステムを systems of record と derived data のシステムに分けること、system of record は source of truth とも呼ばれ、正式なデータを持つこと。公開部分で確かめられたのは、この冒頭の説明まで。' },
    { title: 'Turning the database inside-out with Apache Samza', publisher: 'Martin Kleppmann（著者のブログ。講演の記録）', url: 'https://martin.kleppmann.com/2015/03/04/turning-the-database-inside-out.html', accessed: '2026-11-22', version: '2015年3月4日', note: 'キャッシュの中身はデータベースの中身から作ったもので、失ってもデータベースから作り直せること。アプリケーションでのキャッシュの維持が、無効化の複雑な処理や競合状態を抱えること。複製・索引・キャッシュ・マテリアライズドビューは、元のデータから作る派生データを扱う点で共通すること。' },
    { title: 'MySQL 8.4 Reference Manual：17.7.2.3 Consistent Nonlocking Reads', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html', accessed: '2026-11-22', version: 'MySQL 8.4', note: 'REPEATABLE READ では、トランザクションの中の一貫性読み取りが最初の読み取りで作ったスナップショットを読むこと。自分が更新した行は最新の値を読み、ほかの行は古い版を読むので、データベースに一度も存在しなかった状態が見えることがあること。' },
    { title: 'activerecord/lib/active_record/locking/pessimistic.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/locking/pessimistic.rb#L97-L104`, accessed: '2026-11-22', version: 'Rails 8.1.4.1（手元の gem で確認）', note: 'with_lock がトランザクションを始めて lock! で行をロックしてからブロックを実行すること。' },
    { title: 'Active Record Callbacks（Skipping Callbacks）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_callbacks.html#skipping-callbacks', accessed: '2026-11-22', version: 'Rails 8.1', note: 'update_all・update_column・update_columns・insert_all・delete_all などがコールバックを通らないメソッドであること。' },
    { title: 'Materialized View pattern', publisher: 'Microsoft Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view', accessed: '2026-11-22', note: 'マテリアライズドビューとその中のデータは元のデータから完全に作り直せるので捨ててよいこと、参照する側はビューを直接更新しないこと、全体を作り直すか差分を反映するかを決めること。' },
    { title: 'Active Record Associations（Counter Cache）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/association_basics.html#counter-cache', accessed: '2026-11-22', version: 'Rails 8.1', note: 'counter_cache で size が COUNT を実行せずに列を読むこと、既存の大きな表では counter_cache: { active: false } で値を埋めるまで DB から数えること、古くなった値は reset_counters で直すこと。' },
    { title: 'activerecord/lib/active_record/counter_cache.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/counter_cache.rb#L14-L37`, accessed: '2026-11-22', version: 'Rails 8.1.4.1（手元の gem で確認）', note: 'reset_counters が SQL の COUNT で値を作り直すこと、新しく counter_cache を足したときや値が壊れたとき・SQL で直接変えられたときに使うという説明。' },
    { title: 'MySQL 8.4 Reference Manual：15.1.20.8 CREATE TABLE and Generated Columns', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-generated-columns.html', accessed: '2026-11-22', version: 'MySQL 8.4', note: '生成列の値が列の定義の式から計算されること、STORED は挿入・更新のときに計算して保存しインデックスを張れること、式に副問い合わせを書けないこと、計算に費用のかかる条件を保存しておく用途。' },
    { title: 'activerecord/lib/active_record/connection_adapters/mysql/schema_creation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/mysql/schema_creation.rb#L81-L86`, accessed: '2026-11-22', version: 'Rails 8.1.4.1（手元の gem で確認）', note: 'as: のある列を AS (式) とし、stored: true なら STORED を付けること。同じディレクトリの schema_definitions.rb の81〜99行目で :virtual の型と as:・stored: の指定を受け付けること。' },
    { title: 'activerecord/lib/active_record/readonly_attributes.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/readonly_attributes.rb#L15-L36`, accessed: '2026-11-22', version: 'Rails 8.1.4.1（手元の gem で確認）', note: 'attr_readonly の属性に保存済みのレコードで代入すると ReadonlyAttributeError になること、raise_on_assign_to_attr_readonly が false なら値はメモリーの上で変わるが保存されないこと。load_defaults "7.1" でこの設定が true になることは railties/lib/rails/application/configuration.rb の284行目で確認。7.2.2.1 の gem でも同じ。' },
    { title: 'activerecord/lib/active_record/persistence.rb（update_columns）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L604-L629`, accessed: '2026-11-22', version: 'Rails 8.1.4.1（手元の gem で確認）', note: 'update_columns は、readonly の属性を渡すと ActiveRecordError を発生させること（977〜979行目の verify_readonly_attribute）。' },
    { title: 'Active Record Migrations（Schema Dumping and You・Old Migrations）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_migrations.html#schema-dumping-and-you', accessed: '2026-11-22', version: 'Rails 8.1', note: 'マイグレーションはスキーマの正式な出典ではなく、データベースが source of truth であること。db/schema.rb がデータベースの今の状態を書き出したもので、データベースを作り直すときの正式な出典であること。' },
    { title: 'activerecord/lib/active_record/tasks/database_tasks.rb（initialize_database）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/tasks/database_tasks.rb#L651-L668`, accessed: '2026-11-22', version: 'Rails 8.1.4.1（手元の gem で確認）。8.0.0 と 7.2.2.1 は rubygems.org の gem で確認', note: 'migrate が initialize_database を呼び（260〜266行目）、schema_migrations の表がなければスキーマのファイルを読み込むこと。activerecord 8.0.0 の同じファイルにも同じ処理があり、7.2.2.1 にはないこと。' },
    { title: 'Configuring Rails Applications（Custom Configuration）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html#custom-configuration', accessed: '2026-11-22', version: 'Rails 8.1', note: 'Rails::Application.config_for で設定のファイルをまとめて読み込めること。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-22', note: 'Value integrated systems：統合されたシステムでは不要な抽象化を省き、層の間の重複を減らせること、本当に必要になるまでシステムを分散させないこと。' },
  ],
}

export default chapter
