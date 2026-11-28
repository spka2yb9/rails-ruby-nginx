import { useState } from 'react'
import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'
import { FigureChoices } from '../visuals/study-figure'

const figure = (n: number) => `${chapterNumber(114)}-${n}`
const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const MY = 'https://dev.mysql.com/doc/refman/8.4/en'

/* ---------- 判断の流れの図（各事例で共通の形） ---------- */
type Step = { q: string[]; yes: string[] }

/** 上から問いに答え、「はい」なら右の案、「いいえ」なら下の問いへ進む図。 */
function DecisionFigure({ id, label, start, steps, last }: { id: string; label: string; start?: string[]; steps: Step[]; last: string[] }) {
  const top = start ? 100 : 20
  const rowH = 92
  const h = top + steps.length * rowH + 76
  return (
    <Svg id={id} w={780} h={h} label={label}>
      {start && (
        <>
          <Box x={20} y={20} w={360} h={56} lines={start} fill="box5" />
          <Arrow x1={200} y1={76} x2={200} y2={top - 2} />
        </>
      )}
      {steps.map((s, i) => {
        const y = top + i * rowH
        return (
          <g key={i}>
            <Box x={20} y={y} w={360} h={60} lines={s.q} fill="box" />
            <Arrow x1={380} y1={y + 30} x2={438} y2={y + 30} accent />
            <T x={409} y={y + 18} fs={11} anchor="middle" tone="acc">はい</T>
            <Box x={440} y={y} w={320} h={60} lines={s.yes} fill="box4" />
            <Arrow x1={200} y1={y + 60} x2={200} y2={y + rowH - 2} />
            <T x={208} y={y + 76} fs={11} tone="muted">いいえ</T>
          </g>
        )
      })}
      <Box x={20} y={top + steps.length * rowH} w={360} h={56} lines={last} fill="bg" dashed />
    </Svg>
  )
}

/* ---------- 図：OFFSET とキーセットが読む範囲 ---------- */
function OffsetKeysetFigure() {
  const x0 = 40
  const x1 = 740
  const mid = x0 + (x1 - x0) / 2
  return (
    <Svg id={figure(2)} w={780} h={290} label="注文 200,000 件を作成時刻と ID の新しい順に並べた帯。OFFSET 100000 では先頭から 100,000 件を読み飛ばした後の 50 件を返す。キーセットでは前のページの末尾の作成時刻と ID の位置を索引で探し、そこから 50 件だけを読む">
      <T x={x0} y={22} bold>(created_at, id) の新しい順に並べた注文 200,000 件</T>
      <rect x={x0} y={38} width={x1 - x0} height={22} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={x0} y={74} fs={11} tone="muted">1 件目（最新）</T>
      <T x={mid} y={74} fs={11} tone="muted" anchor="middle">100,001 件目</T>
      <T x={x1} y={74} fs={11} tone="muted" anchor="end">200,000 件目</T>
      <T x={x0} y={104} bold fs={12.5}>OFFSET 100000 LIMIT 50</T>
      <rect x={x0} y={116} width={mid - x0} height={22} rx={3} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={x0 + (mid - x0) / 2} y={127} fs={11.5} anchor="middle">並べ替えてから読み飛ばす 100,000 件</T>
      <rect x={mid} y={116} width={14} height={22} rx={2} fill="var(--fig-box5)" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={mid + 22} y={127} fs={11.5}>返す 50 件</T>
      <T x={x0} y={156} fs={11} tone="muted">実測：MySQL は索引を使わず 200,000 行を読み、上位 100,050 行を並べ替えた（27.8 秒）</T>
      <T x={x0} y={196} bold fs={12.5}>キーセット：created_at と id が末尾の値より小さい行</T>
      <Arrow d={`M ${x0 + 10} 216 C ${x0 + 120} 252, ${mid - 120} 252, ${mid - 4} 226`} accent />
      <T x={x0 + 150} y={266} fs={11.5}>B-Tree で (2026-08-03 06:10:47, 62842) の位置を探す</T>
      <rect x={mid} y={212} width={14} height={22} rx={2} fill="var(--fig-box5)" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={mid + 22} y={223} fs={11.5}>50 件だけ読む（28.4 ms）</T>
    </Svg>
  )
}

/* ---------- 図：preload と eager_load が受け取る行 ---------- */
function LoadShapesFigure() {
  const orderRow = (x: number, y: number, w: number, key: number) => (
    <rect key={key} x={x} y={y} width={w} height={12} rx={2} fill="var(--fig-box)" stroke="var(--fig-line)" />
  )
  const itemRow = (x: number, y: number, w: number, key: number) => (
    <rect key={key} x={x} y={y} width={w} height={12} rx={2} fill="var(--fig-box4)" stroke="var(--fig-line)" />
  )
  return (
    <Svg id={figure(4)} w={780} h={330} label="preload では注文 50 行と明細 150 行を別々の SQL で受け取る。eager_load で LIMIT と has_many を組み合わせると、先に注文の ID を DISTINCT で 50 個取り、次に注文と明細を結合した 150 行を受け取る。結合した行には注文の列が明細の数だけ繰り返される">
      <T x={20} y={20} bold>preload(:order_items)：SQL 2 回</T>
      <Box x={20} y={34} w={350} h={44} lines={['SELECT orders.* … LIMIT 50', '注文 50 行（note は 1 行 720 バイト）']} fs={12} mono fill="box" subTone="muted" />
      {[0, 1, 2].map((i) => orderRow(20, 88 + i * 16, 220, i))}
      <T x={250} y={110} fs={11} tone="muted">… 50 行</T>
      <Box x={20} y={150} w={350} h={44} lines={['SELECT order_items.* WHERE order_id IN (…)', '明細 150 行（明細の列だけ）']} fs={12} mono fill="box4" subTone="muted" />
      {[0, 1, 2, 3, 4, 5].map((i) => itemRow(20, 204 + i * 16, 70, i))}
      <T x={100} y={250} fs={11} tone="muted">… 150 行</T>
      <T x={410} y={20} bold>eager_load(:order_items)：SQL 2 回</T>
      <Box x={410} y={34} w={350} h={44} lines={['SELECT DISTINCT orders.id … LIMIT 50', '先に表示する注文の ID を 50 個決める']} fs={12} mono fill="box" subTone="muted" />
      <Box x={410} y={90} w={350} h={44} lines={['SELECT orders.*, order_items.* … JOIN', '注文と明細を結合した 150 行']} fs={12} mono fill="box" subTone="muted" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          {orderRow(410, 146 + i * 16, 220, i)}
          {itemRow(632, 146 + i * 16, 70, i + 100)}
        </g>
      ))}
      <T x={710} y={170} fs={11} tone="muted">… 150 行</T>
      <T x={410} y={258} fs={11.5}>同じ注文の列（note を含む）が明細の数だけ繰り返される</T>
      <rect x={410} y={300} width={14} height={12} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={430} y={306} fs={11}>注文の列</T>
      <rect x={520} y={300} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={540} y={306} fs={11}>明細の列</T>
    </Svg>
  )
}

/* ---------- 図：顧客 3 の履歴で索引を読む範囲 ---------- */
function IndexPathFigure() {
  // 左：作成時刻の索引。顧客 3 の注文（accent）は古い側に偏っている
  const left = Array.from({ length: 18 }, (_, i) => i)
  const hit = new Set([4, 11, 14, 15, 16, 17])
  return (
    <Svg id={figure(6)} w={780} h={330} label="左は (created_at, id) の索引を新しい順に読み、customer_id が 3 の行を探す計画。顧客 3 の注文は古い側に偏っているので、20 件を見つけるまでに 123,557 件を読んだ。右は (customer_id, created_at) の索引で、顧客 3 の注文が連続して並ぶので、その末尾から 20 件だけを読んだ">
      <T x={20} y={20} bold>変更前：idx_orders_created_at_id を逆向きに読む</T>
      {left.map((i) => (
        <rect key={i} x={20 + i * 19} y={40} width={17} height={30} rx={2} fill={hit.has(i) ? 'var(--fig-box5)' : 'var(--fig-box)'} stroke={hit.has(i) ? 'var(--fig-accent)' : 'var(--fig-line)'} />
      ))}
      <Arrow x1={20} y1={86} x2={360} y2={86} accent />
      <T x={20} y={104} fs={11} tone="muted">新しい注文</T>
      <T x={360} y={104} fs={11} tone="muted" anchor="end">古い注文</T>
      <T x={20} y={132} fs={12}>顧客 3 の行（色付き）以外も 1 件ずつ読んで捨てる</T>
      <T x={20} y={152} fs={12}>読んだ索引の項目：123,557 件 → 返した行：20 件</T>
      <T x={20} y={172} fs={12}>実測：10,736 ms（30 回の平均）</T>
      <T x={410} y={20} bold>変更後：idx_orders_customer_created</T>
      <Box x={410} y={40} w={100} h={30} lines="顧客 1" fs={12} fill="box" />
      <Box x={514} y={40} w={60} h={30} lines="顧客 2" fs={12} fill="box" />
      <Box x={578} y={40} w={182} h={30} lines="顧客 3（3,030 件）" fs={12} fill="box5" accent />
      <Arrow d="M 470 96 C 560 120, 700 120, 752 74" accent />
      <T x={410} y={132} fs={12}>customer_id = 3 の末尾（最新）へ B-Tree で移動し</T>
      <T x={410} y={152} fs={12}>created_at の逆順に 20 件だけ読む</T>
      <T x={410} y={172} fs={12}>実測：1.1 ms（30 回の平均）</T>
      <T x={20} y={220} bold fs={12.5}>どちらの計画も EXPLAIN ANALYZE の 1 行目は Limit: 20 row(s)</T>
      <T x={20} y={244} fs={12}>違いは Limit の下の行の rows（索引から読んだ件数）に出る：</T>
      <T x={20} y={266} fs={12} mono>Index scan … idx_orders_created_at_id (reverse) … rows=123557</T>
      <T x={20} y={288} fs={12} mono>Index lookup … idx_orders_customer_created (customer_id=3) (reverse) … rows=20</T>
      <T x={20} y={314} fs={11} tone="muted">左の帯の色の並びは模式的なもの。実際の索引は B-Tree のページに分かれて格納されている</T>
    </Svg>
  )
}

/* ---------- 図：ロック中に外部 API を待つ場合と待たない場合 ---------- */
function LockTimelineFigure() {
  const x0 = 140
  const s = 0.55 // 1ms あたりの幅
  const lane = (y: number, label: string) => (
    <T x={20} y={y + 9} fs={11.5}>{label}</T>
  )
  return (
    <Svg id={figure(9)} w={780} h={330} label="上はロックを取ってから外部 API を 200ms 待つ場合で、購入者 2 以降はロックが空くまで待つため、4 人目の確定は約 800ms 後になる。下は外部 API を先に呼び、短いトランザクションで在庫を減らす場合で、4 人とも約 200ms 後に確定する">
      <T x={20} y={20} bold>D：ロックを取ってから外部 API を待つ</T>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          {lane(36 + i * 26, `購入者 ${i + 1}`)}
          {i > 0 && <rect x={x0} y={36 + i * 26} width={i * 200 * s} height={18} rx={3} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />}
          <rect x={x0 + i * 200 * s} y={36 + i * 26} width={200 * s} height={18} rx={3} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
        </g>
      ))}
      <T x={x0 + 800 * s + 10} y={123} fs={11} tone="muted">4 人目の確定は約 800ms 後</T>
      <T x={20} y={162} bold>E：外部 API を先に呼び、短いトランザクションで在庫を減らす</T>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          {lane(178 + i * 26, `購入者 ${i + 1}`)}
          <rect x={x0} y={178 + i * 26} width={200 * s} height={18} rx={3} fill="var(--fig-box4)" stroke="var(--fig-line)" />
          <rect x={x0 + 200 * s + i * 6} y={178 + i * 26} width={6} height={18} rx={1} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
        </g>
      ))}
      <T x={x0 + 230 * s + 20} y={265} fs={11} tone="muted">4 人とも約 200ms 後に確定</T>
      <rect x={20} y={296} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
      <T x={40} y={302} fs={11}>行ロックを保持</T>
      <rect x={160} y={296} width={14} height={12} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />
      <T x={180} y={302} fs={11}>ロックが空くのを待つ</T>
      <rect x={340} y={296} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={360} y={302} fs={11}>外部 API の応答を待つ（ロックなし）</T>
    </Svg>
  )
}

/* ---------- 図：2つのトランザクションで在庫の行を更新する（操作できる図） ---------- */
type StockSnap = { label: string; who: 1 | 2; wait?: boolean; sql: string; t1: string[]; t2: string[]; row: number; pending?: string; lock: string; orders: number; text: string }

const STOCK_METHODS = ['A ロックなし', 'B FOR UPDATE', 'C 条件付き UPDATE'] as const
const STOCK_STARTS = [5, 1] as const

function stockSteps(method: number, s: number): StockSnap[] {
  const ok = s >= 2
  const pend = (v: number, by: string) => `${by} の変更 ${v}（未確定）`
  const measured = '実験（在庫 5 に 20 人）では B も C も 5 件が確定し、15 件が在庫切れになりました。'
  if (method === 0)
    return [
      { label: 'T1 が読む', who: 1, sql: 'SELECT … WHERE id = ?', t1: [`在庫 ${s} を読んだ`], t2: ['開始前'], row: s, lock: 'なし', orders: 0, text: 'ロックを付けない SELECT はロックを取らずにスナップショットを読みます。' },
      { label: 'T2 が読む', who: 2, sql: 'SELECT … WHERE id = ?', t1: [`在庫 ${s} を読んだ`], t2: [`在庫 ${s} を読んだ`], row: s, lock: 'なし', orders: 0, text: 'T1 はまだ書いていないので、T2 も同じ値を読みます。どちらも在庫が 1 以上なので、買えると判断します。' },
      { label: 'T1 が書く', who: 1, sql: `UPDATE … SET available = ${s - 1}、INSERT`, t1: [`${s - 1} を書いた`, '注文を INSERT'], t2: [`在庫 ${s} を読んだ`], row: s, pending: pend(s - 1, 'T1'), lock: 'T1', orders: 0, text: `update! は Ruby で計算した値 ${s - 1} を SET に書いた UPDATE を送り、在庫の行に排他ロックを取ります。` },
      { label: 'T2 が待つ', who: 2, wait: true, sql: `UPDATE … SET available = ${s - 1}`, t1: [`${s - 1} を書いた`, '注文を INSERT'], t2: [`${s - 1} を書こうとして`, 'T1 のロックを待つ'], row: s, pending: pend(s - 1, 'T1'), lock: 'T1', orders: 0, text: `T2 も自分が読んだ ${s} から計算した ${s - 1} を書こうとし、T1 のロックが外れるまで待ちます。` },
      { label: 'T1 がコミット', who: 1, sql: 'COMMIT', t1: ['コミットした'], t2: [`${s - 1} を書こうとして`, 'ロックを取った'], row: s - 1, lock: 'T2', orders: 1, text: 'T1 のロックが外れ、待っていた T2 の UPDATE がロックを取ります。' },
      { label: 'T2 が書いてコミット', who: 2, sql: `UPDATE … SET available = ${s - 1}、INSERT、COMMIT`, t1: ['コミットした'], t2: [`${s - 1} を書いた`, 'コミットした'], row: s - 1, lock: 'なし', orders: 2, text: `${ok ? `T2 は T1 の結果を見ずに ${s - 1} を書きました。注文は 2 件確定し、在庫は 1 しか減っていません。` : '在庫 1 個に対して注文が 2 件確定しました。'}実験では在庫 5 に 20 件の注文が確定し、在庫は 4 でした。` },
    ]
  if (method === 1)
    return [
      { label: 'T1 がロックして読む', who: 1, sql: 'SELECT … WHERE id = ? FOR UPDATE', t1: [`在庫 ${s} を読んだ`], t2: ['開始前'], row: s, lock: 'T1', orders: 0, text: 'FOR UPDATE を付けた SELECT は読んだ行に排他ロックを取ります。' },
      { label: 'T2 が待つ', who: 2, wait: true, sql: 'SELECT … WHERE id = ? FOR UPDATE', t1: [`在庫 ${s} を読んだ`], t2: ['まだ読めず', 'T1 のロックを待つ'], row: s, lock: 'T1', orders: 0, text: 'T2 の SELECT … FOR UPDATE は T1 のロックが外れるまで待ちます。この時点で T2 は在庫を読んでいません。' },
      { label: 'T1 が書く', who: 1, sql: `UPDATE … SET available = ${s - 1}、INSERT`, t1: [`${s - 1} を書いた`, '注文を INSERT'], t2: ['まだ読めず', 'T1 のロックを待つ'], row: s, pending: pend(s - 1, 'T1'), lock: 'T1', orders: 0, text: 'T1 は読んだ値から 1 を引いて書き、注文を追加します。' },
      { label: 'T1 がコミット', who: 1, sql: 'COMMIT', t1: ['コミットした'], t2: ['ロックを取った'], row: s - 1, lock: 'T2', orders: 1, text: 'T1 のロックが外れ、待っていた T2 の SELECT … FOR UPDATE がロックを取ります。' },
      { label: 'T2 が最新の値を読む', who: 2, sql: 'SELECT … FOR UPDATE（待った後）', t1: ['コミットした'], t2: [`在庫 ${s - 1} を読んだ`], row: s - 1, lock: 'T2', orders: 1, text: `ロックを付けた読み取りはスナップショットではなく最新の確定した値を読みます。T2 は T1 が書いた ${s - 1} を読みます。` },
      ok
        ? { label: 'T2 が書いてコミット', who: 2, sql: `UPDATE … SET available = ${s - 2}、INSERT、COMMIT`, t1: ['コミットした'], t2: [`${s - 2} を書いた`, 'コミットした'], row: s - 2, lock: 'なし', orders: 2, text: `在庫は 2 減り、注文は 2 件です。${measured}` }
        : { label: 'T2 がロールバック', who: 2, sql: 'raise OutOfStock → ROLLBACK', t1: ['コミットした'], t2: ['在庫切れ', 'ロールバックした'], row: 0, lock: 'なし', orders: 1, text: `在庫が 0 なので OutOfStock を発生させ、ロールバックします。注文は 1 件だけです。${measured}` },
    ]
  const cond = 'UPDATE … SET available = available - 1 WHERE id = ? AND available >= 1'
  return [
    { label: 'T1 が条件付きで更新', who: 1, sql: cond, t1: ['1 行を更新した'], t2: ['開始前'], row: s, pending: pend(s - 1, 'T1'), lock: 'T1', orders: 0, text: 'UPDATE は条件に合う行に排他ロックを取り、判定と更新を 1 文で行います。update_all は更新した行数 1 を返します。' },
    { label: 'T2 が待つ', who: 2, wait: true, sql: cond, t1: ['1 行を更新した'], t2: ['同じ UPDATE で', 'T1 のロックを待つ'], row: s, pending: pend(s - 1, 'T1'), lock: 'T1', orders: 0, text: 'T2 の UPDATE も同じ行を更新しようとし、T1 のロックが外れるまで待ちます。' },
    { label: 'T1 がコミット', who: 1, sql: 'INSERT、COMMIT', t1: ['注文を INSERT', 'コミットした'], t2: ['ロックを取った'], row: s - 1, lock: 'T2', orders: 1, text: 'T1 のロックが外れ、待っていた T2 の UPDATE が再開します。' },
    ok
      ? { label: 'T2 が条件を確かめる', who: 2, sql: cond, t1: ['コミットした'], t2: ['1 行を更新した'], row: s - 1, pending: pend(s - 2, 'T2'), lock: 'T2', orders: 1, text: `UPDATE は最新の確定した値 ${s - 1} で条件を確かめます。1 以上なので更新し、update_all は 1 を返します。` }
      : { label: 'T2 が条件を確かめる', who: 2, sql: cond, t1: ['コミットした'], t2: ['0 行を更新した'], row: 0, lock: 'T2', orders: 1, text: 'UPDATE は最新の確定した値 0 で条件を確かめます。available >= 1 に合わないので更新せず、update_all は 0 を返します。' },
    ok
      ? { label: 'T2 がコミット', who: 2, sql: 'INSERT、COMMIT', t1: ['コミットした'], t2: ['注文を INSERT', 'コミットした'], row: s - 2, lock: 'なし', orders: 2, text: `在庫は 2 減り、注文は 2 件です。${measured}` }
      : { label: 'T2 がロールバック', who: 2, sql: 'raise OutOfStock → ROLLBACK', t1: ['コミットした'], t2: ['在庫切れ', 'ロールバックした'], row: 0, lock: 'なし', orders: 1, text: `更新した行数が 0 なので OutOfStock を発生させ、ロールバックします。注文は 1 件だけです。${measured}` },
  ]
}

function StockSnapshot({ i, snap, start }: { i: number; snap: StockSnap; start: number }) {
  const expected = start - snap.orders
  const mismatch = expected !== snap.row
  const rowLines = ['在庫の行（available）', `確定した値 ${snap.row}`, snap.pending ?? '未確定の変更なし', `ロック：${snap.lock}`]
  return (
    <Svg id={`${figure(8)}-${i}`} w={760} h={150} label={`T1：${snap.t1.join('、')}。在庫の行：${rowLines.slice(1).join('、')}。T2：${snap.t2.join('、')}。確定した注文 ${snap.orders} 件。`}>
      <Box x={10} y={24} w={220} h={72} lines={['T1', ...snap.t1]} fs={12} bold subTone="muted" accent={snap.who === 1} />
      <Box x={270} y={10} w={220} h={100} lines={rowLines} fs={12} bold fill="box4" subTone="muted" />
      <Box x={530} y={24} w={220} h={72} lines={['T2', ...snap.t2]} fs={12} bold subTone="muted" accent={snap.who === 2} fill={snap.wait ? 'bg' : 'box'} dashed={snap.wait} />
      <Arrow x1={232} y1={60} x2={268} y2={60} accent={snap.who === 1} />
      <Arrow x1={528} y1={60} x2={492} y2={60} accent={snap.who === 2} dashed={snap.wait} />
      <T x={10} y={136} fs={11.5} tone={mismatch ? 'danger' : 'muted'}>
        {`確定した注文 ${snap.orders} 件。最初の在庫 ${start} − 注文 ${snap.orders} = ${expected}${mismatch ? `、在庫の行の確定した値は ${snap.row}（合わない）` : '（在庫の行の確定した値と一致）'}`}
      </T>
    </Svg>
  )
}

function StockRaceFigure() {
  const [method, setMethod] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const start = STOCK_STARTS[startIndex]
  const steps = stockSteps(method, start).map((snap, i) => ({
    label: snap.label,
    detail: (
      <>
        <StockSnapshot i={i + 1} snap={snap} start={start} />
        <p><code>{snap.sql}</code></p>
        <p>{snap.text}</p>
      </>
    ),
  }))
  return (
    <Figure
      n={figure(8)}
      title="2つのトランザクションが同じ在庫の行を更新する順序"
      caption="概念モデルです。T1 が先に動く1つの順序だけを描いています。20 スレッドの実験では、どのトランザクションが先に読むか、先にロックを取るかは実行ごとに変わります。各段階で待つかどうかと読んだ値は、この順序で2つの接続を動かし、MySQL 8.4.13（REPEATABLE READ）で確かめました。"
    >
      <FigureChoices label="方式" options={STOCK_METHODS} selected={method} onSelect={setMethod} />
      <FigureChoices label="最初の在庫" options={STOCK_STARTS.map((v) => `${v} 個`)} selected={startIndex} onSelect={setStartIndex} />
      <Stepper key={`${method}-${start}`} steps={steps} />
    </Figure>
  )
}

/* ---------- 図：一意性の検証と一意索引の競合 ---------- */
function RaceFigure() {
  const col = (x: number, title: string) => <T x={x + 80} y={50} fs={12} bold anchor="middle">{title}</T>
  const step = (x: number, y: number, lines: string[], tone: 'box' | 'box4' | 'box5' = 'box', accent = false) => (
    <Box x={x} y={y} w={160} h={44} lines={lines} fs={11.5} fill={tone} accent={accent} subTone="muted" />
  )
  return (
    <Svg id={figure(11)} w={780} h={330} label="左は一意索引がない場合。2 つのスレッドがどちらも検証の SELECT で該当なしと判断し、どちらも INSERT に成功して同じ番号の行が 2 つできる。右は一意索引がある場合。後から INSERT したスレッドは Duplicate entry のエラーを受け、ActiveRecord::RecordNotUnique になる">
      <T x={20} y={20} bold>一意性の検証だけ</T>
      <T x={410} y={20} bold>一意索引あり</T>
      {col(20, 'スレッド 0')}
      {col(200, 'スレッド 1')}
      {col(410, 'スレッド 0')}
      {col(590, 'スレッド 1')}
      {[20, 200, 410, 590].map((x) => <g key={x}>{step(x, 66, ['検証の SELECT', '該当する行なし'])}</g>)}
      {[20, 200, 410, 590].map((x) => <Arrow key={x} x1={x + 80} y1={110} x2={x + 80} y2={128} />)}
      {[20, 200, 410, 590].map((x) => <g key={x}>{step(x, 130, ['INSERT', "(1, 'A-1001')"])}</g>)}
      {[20, 200, 410, 590].map((x) => <Arrow key={x} x1={x + 80} y1={174} x2={x + 80} y2={192} />)}
      {step(20, 194, ['保存', 'COMMIT'], 'box4')}
      {step(200, 194, ['保存', 'COMMIT'], 'box4')}
      {step(410, 194, ['保存', 'COMMIT'], 'box4')}
      {step(590, 194, ['Duplicate entry', 'RecordNotUnique'], 'box5', true)}
      <T x={20} y={266} fs={12} tone="danger">同じ番号の行が 2 つ残る（実測）</T>
      <T x={410} y={266} fs={12}>行は 1 つ。後のスレッドは例外を受け取る</T>
      <T x={410} y={288} fs={12}>（実測）。例外を捕まえて既存の行と比べる</T>
      <T x={20} y={318} fs={11} tone="muted">実験では検証と INSERT の間に 200ms 待たせて、毎回この順序になるようにした</T>
    </Svg>
  )
}

const measureCode = `
# common.rb（抜粋）：SQL の回数・経過時間・割り当て数を測る
def measure(label, runs: 1)
  sqls = []
  sub = ActiveSupport::Notifications.subscribe("sql.active_record") do |*, payload|
    sqls << payload[:sql] unless %w[SCHEMA TRANSACTION].include?(payload[:name])
  end
  result = nil
  GC.start
  a0 = GC.stat(:total_allocated_objects)
  t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  runs.times { result = yield }
  ms = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - t0) * 1000 / runs
  alloc = (GC.stat(:total_allocated_objects) - a0) / runs
  ActiveSupport::Notifications.unsubscribe(sub)
  printf("%-38s SQL %3d回  %8.1f ms  割り当て %9d 個\\n", label, sqls.size / runs, ms, alloc)
  [result, sqls]
end
`

const schemaCode = `
# seed.rb（抜粋）：MySQL 8.4.13 のデータベース ag_114 に作った表
ActiveRecord::Schema.define do
  create_table :customers do |t|
    t.string :name, null: false
    t.string :email, null: false
    t.timestamps
  end
  create_table :orders do |t|
    t.references :customer, null: false   # index_orders_on_customer_id ができる
    t.string :status, null: false
    t.integer :total_cents, null: false
    t.text :note                            # 一覧では使わない長い列
    t.timestamps
  end
  create_table :order_items do |t|
    t.references :order, null: false
    t.string :product_name, null: false
    t.integer :quantity, null: false
    t.integer :price_cents, null: false
  end
end
`

const queryCode = `
# query.rb（抜粋）。各行を measure で囲み、runs: の回数の平均を出した
# A 最初の実装：全件を読み込んでから Ruby で並べ替える
Order.all.sort_by { |o| [o.created_at, o.id] }.reverse.first(50)
# B 並べ替えと件数の制限を SQL に移す
Order.order(created_at: :desc, id: :desc).limit(50).to_a
# C さらに画面で使う 3 列だけを取り出す
Order.order(created_at: :desc, id: :desc).limit(50).pluck(:id, :status, :created_at)

# ここで索引を追加して B と C を測り直す
ActiveRecord::Base.connection.add_index :orders, [:created_at, :id], name: "idx_orders_created_at_id"

base = Order.order(created_at: :desc, id: :desc)
# D 100,000 件目からの 50 件を OFFSET で取る
base.offset(100_000).limit(50).pluck(:id, :status, :created_at)
# E 100,000 件目の (created_at, id) を末尾として、その後ろの 50 件を取る
base.where("created_at < ? OR (created_at = ? AND id < ?)", last_at, last_at, last_id)
    .limit(50).pluck(:id, :status, :created_at)
`

const queryOut = `
== 索引なし（主キーと customer_id の索引だけ）
A Ruby で並べ替える           SQL 1回  43299.8 ms  割り当て 2410326 個
B DB で並べ替えて 50 件       SQL 1回  22185.7 ms  割り当て     763 個
C 必要な 3 列だけ pluck       SQL 1回  23616.7 ms  割り当て     444 個
A・B・C の 50 件の ID は同じ: 90649, 91446, ... 23827
-> Limit: 50 row(s)  (cost=24295 rows=50)
    -> Sort: orders.created_at DESC, orders.id DESC, limit input to 50 row(s) per chunk
        -> Table scan on orders  (cost=24295 rows=189486)

== 索引 (created_at, id) を追加
add_index: 15.1 秒
B DB で並べ替えて 50 件       SQL 1回     46.5 ms  割り当て     667 個
C 必要な 3 列だけ pluck       SQL 1回     43.7 ms  割り当て     370 個
-> Limit: 50 row(s)  (cost=1.54 rows=50)
    -> Index scan on orders using idx_orders_created_at_id (reverse)  (cost=1.54 rows=50)

== 2001 ページ目（100,000 件目から 50 件）
D OFFSET 100000               SQL 1回  27834.7 ms  割り当て     409 個
E 末尾の (created_at, id) から SQL 1回     28.4 ms  割り当て     389 個
D と E の 50 件は同じ
`

const explainOffsetOut = `
-- D の EXPLAIN ANALYZE（索引があっても全件を読んで並べ替えた）
-> Limit/Offset: 50/100000 row(s)  (actual time=29977..29977 rows=50 loops=1)
    -> Sort: orders.created_at DESC, orders.id DESC, limit input to 100050 row(s) per chunk
           (actual time=29814..29932 rows=100050 loops=1)
        -> Table scan on orders  (actual time=17.8..27359 rows=200000 loops=1)

-- E の EXPLAIN ANALYZE（索引の該当位置から 50 件だけ読んだ）
-> Limit: 50 row(s)  (actual time=89.7..89.7 rows=50 loops=1)
    -> Index range scan on orders using idx_orders_created_at_id over
       (created_at < '2026-08-03 06:10:47.000000') OR (created_at = '2026-08-03 06:10:47.000000' AND id < 62842)
       (reverse)  (actual time=89.6..89.6 rows=50 loops=1)
`

const controllerCode = `
# app/controllers/admin/orders_controller.rb（アプリケーションに組み込む形）
class Admin::OrdersController < ApplicationController
  PER_PAGE = 50

  def index
    scope = Order.order(created_at: :desc, id: :desc).limit(PER_PAGE)
    if (cursor = params[:before]).present?
      time, id = cursor.split(",", 2)
      scope = scope.where("created_at < :t OR (created_at = :t AND id < :id)",
                          t: Time.iso8601(time), id: Integer(id))
    end
    @orders = scope.select(:id, :status, :created_at).to_a
    last = @orders.last
    # マイクロ秒まで含めて次のページの条件を作る（created_at は datetime(6)）
    @next_cursor = last && [last.created_at.iso8601(6), last.id].join(",")
  rescue ArgumentError, TypeError
    head :bad_request   # 形式の違うカーソルは 400 にする
  end
end
`

const nplus1Code = `
# nplus1.rb（抜粋）。base は前の事例と同じ「新しい順に 50 件」の Relation
base = -> { Order.order(created_at: :desc, id: :desc).limit(50) }

measure("遅延読み込み（そのまま）", runs: 5) { base.call.map { |o| o.customer.name } }
measure("preload(:customer)", runs: 5)       { base.call.preload(:customer).map { |o| o.customer.name } }
measure("eager_load(:customer)", runs: 5)    { base.call.eager_load(:customer).map { |o| o.customer.name } }
measure("includes(:customer)", runs: 5)      { base.call.includes(:customer).map { |o| o.customer.name } }

measure("遅延読み込み（そのまま）", runs: 5) { base.call.map { |o| o.order_items.sum(&:quantity) } }
measure("preload(:order_items)", runs: 5)    { base.call.preload(:order_items).map { |o| o.order_items.sum(&:quantity) } }
measure("eager_load(:order_items)", runs: 5) { base.call.eager_load(:order_items).map { |o| o.order_items.sum(&:quantity) } }

begin
  base.call.strict_loading.each { |o| o.customer.name }
rescue ActiveRecord::StrictLoadingViolationError => e
  puts "#{e.class}: #{e.message}"
end
`

const nplus1Out = `
== 注文 50 件と顧客名
遅延読み込み（そのまま）    SQL 51回   105.5 ms  割り当て 7790 個
   SELECT \`customers\`.* FROM \`customers\` WHERE \`customers\`.\`id\` = 1534 LIMIT 1
   SELECT \`customers\`.* FROM \`customers\` WHERE \`customers\`.\`id\` = 728 LIMIT 1   ……
preload(:customer)          SQL  2回     5.7 ms  割り当て 1721 個
   SELECT \`customers\`.* FROM \`customers\` WHERE \`customers\`.\`id\` IN (1534, 728, 925, …)
eager_load(:customer)       SQL  1回    11.5 ms  割り当て 2268 個
includes(:customer)         SQL  2回     4.1 ms  割り当て 1744 個

== 注文 50 件と明細（1 件の注文に明細 3 行）
遅延読み込み（そのまま）    SQL 51回   302.9 ms  割り当て 9632 個
preload(:order_items)       SQL  2回    26.5 ms  割り当て 3435 個
eager_load(:order_items)    SQL  2回    36.0 ms  割り当て 5128 個
   SELECT DISTINCT \`orders\`.\`created_at\` AS alias_0, \`orders\`.\`id\` AS alias_1, \`orders\`.\`id\`
     FROM \`orders\` LEFT OUTER JOIN \`order_items\` ON … LIMIT 50
   SELECT \`orders\`.\`id\` AS t0_r0, … \`orders\`.\`note\` AS t0_r4, … FROM \`orders\` LEFT OUTER JOIN …
   結合の結果: 150 行（注文の列を明細の数だけ繰り返す。note は 1 行 720 バイト）

== strict_loading で遅延読み込みを例外にする
ActiveRecord::StrictLoadingViolationError: \`Order\` is marked for strict_loading.
  The Customer association named \`:customer\` cannot be lazily loaded.
`

const specCode = `
# order_list_spec.rb：一覧の SQL の回数を固定する spec
require_relative "common"

def recent_orders_for_list
  Order.order(created_at: :desc, id: :desc).limit(50).preload(:customer)
end

def count_queries
  count = 0
  counter = ->(*, payload) { count += 1 unless %w[SCHEMA TRANSACTION].include?(payload[:name]) }
  ActiveSupport::Notifications.subscribed(counter, "sql.active_record") { yield }
  count
end

RSpec.describe "注文一覧の読み込み" do
  it "表示件数が増えても SQL は 2 回" do
    queries = count_queries { recent_orders_for_list.each { |order| order.customer.name } }
    expect(queries).to eq 2
  end

  it "先読みを外すと失敗する（この spec が N+1 を検出できることの確認）" do
    queries = count_queries { Order.order(created_at: :desc, id: :desc).limit(50).each { |order| order.customer.name } }
    expect(queries).to eq 2
  end
end
`

const specOut = `
$ rspec order_list_spec.rb
.F

  1) 注文一覧の読み込み 先読みを外すと失敗する（この spec が N+1 を検出できることの確認）
     Failure/Error: expect(queries).to eq 2

       expected: 2
            got: 51

2 examples, 1 failure
`

const indexOut = `
== customer_id の索引と (created_at, id) の索引だけ
顧客 1（20,147 件） 20 件    SQL 1回      6.8 ms
   -> Limit: 20 row(s)  (actual time=0.118..0.526 rows=20 loops=1)
       -> Filter: (orders.customer_id = 1)  (actual time=0.116..0.523 rows=20 loops=1)
           -> Index scan on orders using idx_orders_created_at_id (reverse)  (actual time=0.037..0.506 rows=209 loops=1)
顧客 2（29 件） 20 件        SQL 1回      1.3 ms
   -> Limit: 20 row(s)  (actual time=0.246..0.251 rows=20 loops=1)
       -> Sort: orders.created_at DESC, orders.id DESC, limit input to 20 row(s) per chunk
           -> Index lookup on orders using index_orders_on_customer_id (customer_id=2)  (… rows=29 loops=1)
顧客 3（3,030 件） 20 件     SQL 1回  10736.4 ms
   -> Limit: 20 row(s)  (actual time=538..5274 rows=20 loops=1)
       -> Filter: (orders.customer_id = 3)  (actual time=538..5274 rows=20 loops=1)
           -> Index scan on orders using idx_orders_created_at_id (reverse)  (actual time=6.17..5268 rows=123557 loops=1)

add_index (customer_id, created_at): 2.8 秒
== (customer_id, created_at) を追加（id は書かない）
顧客 1（20,147 件） 20 件    SQL 1回      1.0 ms
   -> Index lookup on orders using idx_orders_customer_created (customer_id=1) (reverse)  (… rows=20 loops=1)
顧客 2（29 件） 20 件        SQL 1回      0.5 ms
   -> Index lookup on orders using idx_orders_customer_created (customer_id=2) (reverse)  (… rows=20 loops=1)
顧客 3（3,030 件） 20 件     SQL 1回      1.1 ms
   -> Index lookup on orders using idx_orders_customer_created (customer_id=3) (reverse)  (… rows=20 loops=1)

== 重複した索引（sys.schema_redundant_indexes）
   index_orders_on_customer_id | customer_id | idx_orders_customer_created | customer_id,created_at

== 索引の大きさ（mysql.innodb_index_stats, 16KB ページ）
   PRIMARY                        164.7 MB
   idx_orders_created_at_id         5.5 MB
   idx_orders_customer_created      6.5 MB
   index_orders_on_customer_id      7.5 MB
`

const indexCode = `
# index.rb（抜粋）
def history(customer_id) = Order.where(customer_id: customer_id).order(created_at: :desc, id: :desc).limit(20)

[1, 2, 3].each do |cid|
  measure("顧客 #{cid} 20 件", runs: 30) { history(cid).pluck(:id, :status, :created_at) }
  puts conn.select_all("EXPLAIN ANALYZE #{history(cid).select(:id, :status, :created_at).to_sql}").rows.flatten.first
end

conn.add_index :orders, [:customer_id, :created_at], name: "idx_orders_customer_created", algorithm: :inplace
# 追加後に同じ 3 人を測り直し、sys.schema_redundant_indexes と mysql.innodb_index_stats を読む
`

const indexMigration = `
# db/migrate/20261127000001_add_customer_history_index_to_orders.rb
class AddCustomerHistoryIndexToOrders < ActiveRecord::Migration[8.1]
  def change
    # ALGORITHM=INPLACE を付け、テーブルを複製する方式になる場合は失敗させる
    add_index :orders, [:customer_id, :created_at],
              name: "idx_orders_customer_created", algorithm: :inplace
  end
end

# db/migrate/20261204000001_remove_redundant_customer_index_from_orders.rb
# 新しい索引で計画が切り替わったことを本番で確かめてから、別のリリースで消す
# customer_id で絞って id の順に並べる SQL があれば、その計画も消す前に確かめる
class RemoveRedundantCustomerIndexFromOrders < ActiveRecord::Migration[8.1]
  def change
    remove_index :orders, :customer_id, name: "index_orders_on_customer_id"
  end
end
`

const dropOut = `
-- orders を複製した表で、customer_id だけの索引を削除する前後に実行（cost は省略）
EXPLAIN ANALYZE SELECT id, status FROM orders_dropcheck
  WHERE customer_id = ? ORDER BY id DESC LIMIT 20;

== 削除前（customer_id の索引と (customer_id, created_at) の索引がある）
顧客 1  -> Filter: (orders_dropcheck.customer_id = 1)
            -> Index scan on orders_dropcheck using PRIMARY (reverse)  (actual time=0.0503..0.13 rows=174 loops=1)
顧客 2  -> Index lookup on orders_dropcheck using index_orders_on_customer_id (customer_id=2) (reverse)  (actual time=0.147..8.46 rows=20 loops=1)
顧客 3  -> Index lookup on orders_dropcheck using index_orders_on_customer_id (customer_id=3) (reverse)  (actual time=51.8..51.8 rows=20 loops=1)

== 削除後（(customer_id, created_at) の索引だけ）
顧客 1  -> Filter: (orders_dropcheck.customer_id = 1)
            -> Index scan on orders_dropcheck using PRIMARY (reverse)  (actual time=0.0204..0.0963 rows=174 loops=1)
顧客 2  -> Sort: orders_dropcheck.id DESC, limit input to 20 row(s) per chunk  (actual time=18.6..18.6 rows=20 loops=1)
            -> Index lookup on orders_dropcheck using idx_orders_customer_created (customer_id=2)  (actual time=6.57..18.6 rows=29 loops=1)
顧客 3  -> Filter: (orders_dropcheck.customer_id = 3)  (actual time=1.37..337 rows=20 loops=1)
            -> Index scan on orders_dropcheck using PRIMARY (reverse)  (actual time=0.0794..324 rows=137742 loops=1)
`

const txCode = `
# transaction.rb（抜粋）。在庫の表 inventory_items と注文の表 stock_orders を使う
class OutOfStock < StandardError; end
def fake_payment_api = sleep(0.2)   # 外部の決済 API の応答を 200ms と仮定

# A ロックせずに読んで書く（最初の実装）
ActiveRecord::Base.transaction do
  item = InventoryItem.find(id)
  raise OutOfStock if item.available < 1
  sleep 0.01                                  # 読んでから書くまでの処理
  item.update!(available: item.available - 1)
  StockOrder.create!(inventory_item_id: id, status: "confirmed")
end

# B lock で行をロックする（SELECT ... FOR UPDATE）
ActiveRecord::Base.transaction do
  item = InventoryItem.lock.find(id)
  raise OutOfStock if item.available < 1
  sleep 0.01
  item.update!(available: item.available - 1)
  StockOrder.create!(inventory_item_id: id, status: "confirmed")
end

# C 条件付きの UPDATE と、更新した行数の確認
ActiveRecord::Base.transaction do
  changed = InventoryItem.where(id: id).where("available >= 1").update_all("available = available - 1")
  raise OutOfStock if changed == 0
  StockOrder.create!(inventory_item_id: id, status: "confirmed")
end

# D は B の sleep 0.01 を fake_payment_api に置き換えたもの（ロック中に外部 API を待つ）
# E は fake_payment_api を transaction の前で呼び、中身は C と同じもの
`

const txOut = `
== 最後の 5 個を 20 人が同時に買う
A ロックせずに読んで書く   在庫  5 に 20 人: 確定 20 件・在庫切れ  0 件・残り在庫 4・注文行 20・ 987 ms
B lock で行をロック        在庫  5 に 20 人: 確定  5 件・在庫切れ 15 件・残り在庫 0・注文行  5・ 257 ms
C 条件付きの UPDATE        在庫  5 に 20 人: 確定  5 件・在庫切れ 15 件・残り在庫 0・注文行  5・ 305 ms

== 在庫 10 個を 10 人が同時に買う（外部 API 200ms）
D ロック中に外部 API を待つ          在庫 10 に 10 人: 確定 10 件・残り在庫 0・2332 ms
E 外部 API をトランザクションの前に  在庫 10 に 10 人: 確定 10 件・残り在庫 0・ 980 ms

== B の 1 件分の SQL
   BEGIN
   SELECT \`inventory_items\`.* FROM \`inventory_items\` WHERE \`inventory_items\`.\`id\` = 6 LIMIT 1 FOR UPDATE
   UPDATE \`inventory_items\` SET \`inventory_items\`.\`available\` = 0 WHERE \`inventory_items\`.\`id\` = 6
   INSERT INTO \`stock_orders\` (\`inventory_item_id\`, \`status\`) VALUES (6, 'confirmed')
   COMMIT
`

const integrityOut = `
== 1. 一意性バリデーションだけで、同じ番号を 2 つのスレッドが同時に登録
スレッド0: 保存
スレッド1: 保存
   保存された行: 2

== 2. 既存の重複を探す
   SELECT store_id, external_number, COUNT(*) AS n, MIN(id) AS keep_id FROM channel_orders
   GROUP BY store_id, external_number HAVING COUNT(*) > 1
   => [1, "A-1001", 2, 1]

== 3. 重複が残ったまま一意索引を作る
   ActiveRecord::RecordNotUnique: Mysql2::Error: Duplicate entry '1-A-1001' for key 'channel_orders.idx_channel_orders_store_number'

== 4. 重複を片付けてから一意索引を作り、同じ競合を起こす
スレッド0: 保存
スレッド1: ActiveRecord::RecordNotUnique: Mysql2::Error: Duplicate entry '1-A-1001' for key 'channel_orders.idx_channel_orders_store_number'
   保存された行: 1

== 5. NULL は一意索引で重複とみなされない
   store_id=1 で external_number が NULL の行: 2
   NOT NULL にできない: ActiveRecord::StatementInvalid: Mysql2::Error: Invalid use of NULL value
   NULL の行を片付けた後、NOT NULL に変更

== 6. 一意制約の違反を、再送と別内容の競合に分ける
   A-2001 1200円 → id=7 を返す
   A-2001 1200円 → id=7 を返す
   A-2001 9900円 → DuplicateOrderConflict: A-2001 は別の内容で登録済み

== 7. CHECK 制約で在庫を負にしない
   ActiveRecord::CheckViolation: Mysql2::Error: Check constraint 'stock_levels_available_non_negative' is violated.
`

const integrityModel = `
# integrity.rb（抜粋）
class ChannelOrder < ActiveRecord::Base
  validates :external_number, uniqueness: { scope: :store_id }
  # 実験用：検証の SELECT と INSERT の間を 200ms 空けて、競合を毎回起こす
  before_create { sleep 0.2 }
end

# 同じ番号を 2 つのスレッドから同時に登録する
2.times.map do |i|
  Thread.new do
    ActiveRecord::Base.connection_pool.with_connection do
      ChannelOrder.create!(store_id: 1, external_number: "A-1001", amount_cents: 4_800)
      "スレッド#{i}: 保存"
    rescue => e
      "スレッド#{i}: #{e.class}: #{e.message}"
    end
  end
end.map(&:value)
`

const integrityMigration = `
# db/migrate/20261127000002_add_unique_external_number_to_channel_orders.rb
# 前提：重複と NULL の行は、業務の担当者が残す行を決めて片付け済み
class AddUniqueExternalNumberToChannelOrders < ActiveRecord::Migration[8.1]
  def change
    change_column_null :channel_orders, :external_number, false
    add_index :channel_orders, [:store_id, :external_number],
              unique: true, name: "idx_channel_orders_store_number"
  end
end

# 在庫の数のように、値の範囲の規則は CHECK 制約にできる
class AddNonNegativeCheckToStockLevels < ActiveRecord::Migration[8.1]
  def change
    add_check_constraint :stock_levels, "available >= 0",
                         name: "stock_levels_available_non_negative"
  end
end
`

const registerCode = `
class DuplicateOrderConflict < StandardError; end

# モールから届いた注文を登録する。同じ番号が来たら、内容を比べて扱いを分ける
def register(store_id:, number:, amount_cents:)
  ChannelOrder.create!(store_id: store_id, external_number: number, amount_cents: amount_cents)
rescue ActiveRecord::RecordNotUnique, ActiveRecord::RecordInvalid
  existing = ChannelOrder.find_by!(store_id: store_id, external_number: number)
  raise DuplicateOrderConflict, "#{number} は別の内容で登録済み" unless existing.amount_cents == amount_cents
  existing                                        # 同じ内容の再送：登録済みの行を返す
end
`

const chapter: Chapter = {
  number: 114,
  part: 11,
  title: "一覧の検索と注文の整合性を改善する",
  summary: "注文一覧のクエリ、N+1、索引、在庫の引き当てのトランザクション、外部注文番号の一意性を、MySQL 8.4.13 で測った結果から判断する五つの事例です。",
  goals: [
    "SQL の回数・読んだ行数・割り当て数を測り、クエリの書き方と索引を選ぶ",
    "preload と eager_load を、関連の種類と使い方から選ぶ",
    "トランザクションに入れる処理と、ロックの方式を決める",
    "DB の制約とバリデーションの役割を分け、制約に違反したときの扱いを決める",
  ],
  prerequisites: [12, 13, 15, 37, 38, 100],
  sections: [
    {
      id: "overview",
      title: "この章で扱う五つの事例と読み方",
      body: (
        <>
          <p>この章では EC サイトの管理画面と注文処理で起きた五つの問題を取り上げます。どの事例も MySQL 8.4.13 に同じデータを入れて実際に SQL を実行し、SQL の回数、時間、実行計画を測った結果をもとに案を選びます。</p>
          <ul>
            <li>Active Record のクエリを改善する：注文一覧の並べ替えとページ送りを DB に任せる</li>
            <li>N+1 問題を解消する：一覧に顧客名と明細の点数を出したら SQL が 101 回になった</li>
            <li>適切なインデックスを設計する：一部の顧客だけ注文履歴の表示に 10 秒かかる</li>
            <li>トランザクションの範囲を決定する：在庫 5 個の商品に 20 件の注文が確定した</li>
            <li>データの整合性を担保する：外部の注文番号が二重に登録された</li>
          </ul>
          <p>各事例は次の7項目をこの順に書きます。</p>
          <ol>
            <li>課題：利用者や運用担当者から見て何が起きているか</li>
            <li>原因や背景：計測やログで分かった原因と、その実装になった経緯</li>
            <li>解決方法の選択肢：検討した2〜4案</li>
            <li>判断基準：どの条件ならどの案を選ぶか</li>
            <li>具体的な実装例：実行したコードと、その出力</li>
            <li>メリット・デメリット：選んだ案で得られるものと、増える費用</li>
            <li>トレードオフ：何と何を交換したか、条件が違えば結論がどう変わるか</li>
          </ol>
          <p>仕組みの説明は既存の章に任せます。N+1 が起きる理由と preload・eager_load の SQL は <ChapterLink n={13} section="n-plus-one" />、B-Tree の索引と実行計画の読み方は <ChapterLink n={37} />、ロックと分離レベルは <ChapterLink n={38} />、Rails のトランザクションとロックの API は <ChapterLink n={15} section="transaction" />、取得する列とページ送りの一般的な考え方は <ChapterLink n={100} /> で扱っています。この章ではその知識を使って「この状況ではどの案を選ぶか」を決める手順に絞ります。</p>
          <p>五つの事例は同じ orders テーブルを使います。前の事例で加えた索引が後の事例の実行計画を変える、というように、前の事例の変更が後の事例の前提になる箇所は本文で示します。</p>
          <p>各事例には判断の流れを示す図を置きます。図は上から問いに答え、「はい」なら右の案、「いいえ」なら下の問いへ進む形です。実際の改修では複数の案を組み合わせることが多く、図は判断の順序を単純化したものです。</p>
        </>
      ),
    },
    {
      id: "setup",
      title: "検証に使ったデータと計測の方法",
      body: (
        <>
          <p>検証には Docker のコンテナで動かした MySQL 8.4.13 と、Ruby 4.0.9・Active Record 8.1.4.1・mysql2 0.5.7 を使いました。Rails アプリケーション全体は作らず、Active Record だけを読み込んだ Ruby スクリプトから MySQL に接続しています。モデルの定義と、そこから作られる SQL は Rails アプリケーションの場合と同じです。表は次のとおりです。</p>
          <Code lang="ruby" title="検証に使った表" code={schemaCode} />
          <p>データは顧客 5,000 人、注文 200,000 件、明細 600,000 行です。注文の作成時刻（created_at）は 2026 年 5 月から 10 月までの約 180 日に散らばっています。時刻は秒の単位でそろえたので、同じ時刻の注文が 1,262 組あります。顧客 1 は法人の顧客で、注文の約 10%（20,147 件）を占めます。顧客 3 は 5 月の古い注文を中心に 3,030 件を持ちます。注文の note 列には一覧では使わない 720 バイトの文字列を入れました。</p>
          <p>計測には次の measure を使いました。ActiveSupport::Notifications の <code>sql.active_record</code> を購読して SQL を数え、<code>Process.clock_gettime</code> で経過時間を、<code>GC.stat(:total_allocated_objects)</code> の増分で Ruby が割り当てたオブジェクトの数を測ります<Ref n={16} /><Ref n={17} />。スキーマ情報の取得（name が SCHEMA）と BEGIN・COMMIT（name が TRANSACTION）は回数に含めません。</p>
          <Code lang="ruby" title="common.rb の計測用メソッド" code={measureCode} />
          <p>測定に使ったマシンは Intel Core i7-1270P で、WSL2 の上で 4 vCPU とメモリー 15GB を Docker に割り当てています。MySQL の <code>innodb_buffer_pool_size</code> は既定値の 128MB のままで、orders テーブルのデータ（約 165MB）はバッファープールに収まりません<Ref n={15} />。そのため全行を読む SQL はディスクからの読み込みが多くなり、時間が長く出ます。測定中は同じマシンで別の作業も動いていて、負荷平均は 2〜30 の間で変わりました。とくにクエリの事例は負荷平均が 20〜30 の時間帯に測っています。</p>
          <Callout kind="note" title="読んだ行数で比べる">
            <p>時間の値はマシンや同時に動いている処理で大きく変わります。顧客 1 の注文履歴の SQL（索引の事例）は、負荷の違う 2 回の測定で 12.8 ms と 6.8 ms でした。この章では、同じ条件で続けて測った案どうしの比と、<code>EXPLAIN ANALYZE</code> が示す読んだ行数（rows）を判断の根拠にします。読んだ行数はマシンの負荷では変わりません<Ref n={2} />。自分のアプリケーションで判断するときは、本番に近いデータ量と分布で同じ値を測ります。</p>
          </Callout>
        </>
      ),
    },
    {
      id: "query",
      title: "注文一覧の並べ替えとページ送りを DB に任せる",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>管理画面の「最近の注文」一覧は注文 ID・状態・作成時刻を新しい順に 50 件ずつ表示します。注文が 200,000 件を超えたころから、一覧を開くたびに数十秒かかるようになりました。「次へ」で後ろのページに進むと、さらに時間がかかります。運用担当者は問い合わせに答えるために、数千件前の注文までさかのぼることがあります。同じ作成時刻の注文があるので、ページをまたいで同じ注文が二度表示されたり、表示から抜けたりしてはいけません。</p>
          <h3>2. 原因や背景</h3>
          <p>最初の実装は、注文が数百件だった時期に書かれた次のコードでした。</p>
          <Code lang="ruby" title="最初の実装" code={`@orders = Order.all.sort_by { |o| [o.created_at, o.id] }.reverse.first(50)`} />
          <p><code>Order.all</code> は条件のない SELECT を 1 回実行し、全行を Active Record のオブジェクトにします。その後で Ruby が配列を並べ替え、先頭の 50 件を取り出します。SQL は 1 回なので、ログで SQL の回数だけを見ていると問題に気づきません。下の実装例で測ると、この 1 回の処理で約 241 万個のオブジェクトを割り当て、43 秒かかりました。表示しない note 列（1 行 720 バイト）も 200,000 行分を受け取っています。</p>
          <p>ページ送りには OFFSET を使っていました。<code>OFFSET 100000</code> は「並べた結果の先頭から 100,000 行を読み飛ばす」という指定です。DB は読み飛ばす行も並べ替えて数える必要があるので、後ろのページほど読む行が増えます<Ref n={6} />。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：並べ替えと件数の制限を SQL に移す（<code>order</code> と <code>limit</code>）。Ruby が受け取る行は 50 行になる。</li>
            <li>案 2：案 1 に加えて、画面で使う列だけを取得する（<code>select</code> または <code>pluck</code>）。</li>
            <li>案 3：(created_at, id) の索引を作り、DB が並べ替えずに索引の順に読めるようにする。</li>
            <li>案 4：OFFSET の代わりに、前のページの末尾の (created_at, id) より後ろを取る<Term en="keyset pagination">キーセットページネーション</Term>にする（<ChapterLink n={100} section="pagination" />）。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>最初に確かめるのは、変更の前後で画面に出る注文が変わらないことです。並び順は (created_at, id) で一意に決めます。created_at だけでは同じ時刻の注文の順序が決まらず、OFFSET でもキーセットでも、ページの境目で同じ注文が二度出たり抜けたりします。</p>
          <p>次に、Ruby に渡している行数と画面が使う行数を比べます。画面が 50 件しか使わないなら、それより多い行を Ruby に渡す理由はありません。案 1 は条件を問わず採用できます。</p>
          <p>並べ替えに使う列に索引がなければ、DB は LIMIT 50 でも全行を読んで並べ替えます。一覧を何度も開く画面なら案 3 の索引を作ります。索引は書き込みのたびに更新され、容量も使います。その費用の見方は次の索引の事例で扱います。</p>
          <p>ページ送りは任意のページ番号へ移動する必要があるかで決めます。必要なら OFFSET を残し、深いページを開けないように上限を設けるか、日付や注文番号で絞る検索を用意します。「次へ」と「前へ」だけで足りるなら案 4 にします。</p>
          <p>列を絞る案 2 は、受け取る行が少ないときは効果が小さく、<code>pluck</code> にすると戻り値が配列になってモデルのメソッドを使えなくなります。表示にモデルのメソッドを使うなら <code>select</code>、使わないなら <code>pluck</code> を選び、測った差が小さければ変えない、という順に考えます。</p>
          <Figure n={figure(1)} title="一覧のクエリを直す判断の流れ" caption="上から順に問いに答えます。図は判断の順序を単純化したもので、実際には複数の案を組み合わせます（この事例では案 1・3・4 を採用）。">
            <DecisionFigure
              id={figure(1)}
              label="一覧のクエリを直す判断の流れ。画面が使う行数より多くを Ruby に渡していれば order と limit を SQL に移す。ORDER BY の列に合う索引がなければ索引を作る。深いページまで次へでたどるならキーセットにする。割り当てや転送量が応答時間の大部分なら列を絞る。どれにも当てはまらなければ、ほかの区間を計測する"
              steps={[
                { q: ['画面が使う行数より多くの行を', 'Ruby に渡しているか'], yes: ['order と limit を SQL に移す'] },
                { q: ['ORDER BY の列に合う索引がないか'], yes: ['(created_at, id) の索引を作る'] },
                { q: ['深いページまで「次へ」でたどるか'], yes: ['前のページ末尾の (created_at, id)', 'より後ろを取る'] },
                { q: ['割り当てや転送量が', '応答時間の大部分を占めるか'], yes: ['select や pluck で列を絞る'] },
              ]}
              last={['今の取得方法のまま、', 'ほかの区間（描画など）を測る']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>前の節の measure を使い、5 つの書き方を測りました。A は最初の実装、B は案 1、C は案 2、D は OFFSET のページ送り、E は案 4 です。B と C は索引を作る前と後の両方で測っています。</p>
          <Code lang="ruby" title="測った 5 つの書き方" code={queryCode} />
          <Code lang="text" title="実行結果（MySQL 8.4.13、負荷平均 20〜30 の時間帯）" code={queryOut} />
          <p>A と B はどちらも SQL が 1 回ですが、Ruby の割り当ては 2,410,326 個から 763 個に減り、時間は 43.3 秒から 22.2 秒になりました。3 つの書き方で返る 50 件の ID が同じであることも確かめています。</p>
          <p>B がまだ 22 秒かかる理由は、索引を作る前の実行計画に出ています。<code>Table scan on orders</code> は表の全行を読むこと、その上の <code>Sort … limit input to 50 row(s) per chunk</code> は上位 50 件だけを残しながら並べ替えることを示します<Ref n={5} />。返すのは 50 行でも、DB は 200,000 行を読んでいます。バッファープールに収まらない表なので、この読み込みの多くがディスクへのアクセスになりました。</p>
          <p>(created_at, id) の索引を作った後の B は 46.5 ms でした。実行計画は <code>Index scan on orders using idx_orders_created_at_id (reverse)</code> で、索引を末尾（新しい側）から逆向きに 50 件読んで止まります。InnoDB の索引は昇順に並んでいますが、逆向きに読めば降順の ORDER BY を満たせるので、並べ替えの段がなくなりました。C は 43.7 ms で、B との差は 3 ms 程度です。50 行では列を絞る効果は小さいことが分かります。</p>
          <p>深いページの D と E はどちらも同じ 50 件を返しました。違いは読んだ行数です。</p>
          <Code lang="text" title="D と E の EXPLAIN ANALYZE" code={explainOffsetOut} />
          <p>D では、索引があっても MySQL は全 200,000 行を読み、上位 100,050 行を並べ替えました。100,050 行を索引の順に読み、行ごとに表の本体を読みに行く費用よりも、全行を読んで並べ替える費用のほうが小さいと見積もったためです。E は索引の中で前のページの末尾の位置を探し、そこから 50 件だけを読みました。時間は 27.8 秒と 28.4 ms で、約 1,000 倍の差です。</p>
          <Figure n={figure(2)} title="OFFSET とキーセットが読む範囲" caption="上の実測値をもとにした模式図。帯の長さは件数の比を表します。">
            <OffsetKeysetFigure />
          </Figure>
          <p>アプリケーションに組み込むときは、次のようにコントローラーで前のページの末尾を受け取ります。上の測定は E と同じ条件の Relation を直接実行したもので、このコントローラー自体は実行していません。</p>
          <Code lang="ruby" title="キーセットのページ送りを組み込む例" code={controllerCode} />
          <p>カーソルには created_at をマイクロ秒まで含めて入れます。Rails 8.1 の MySQL では datetime 型の列が既定で datetime(6) になり、マイクロ秒まで保存されます<Ref n={22} />。秒までの文字列にすると、同じ秒の中で末尾より新しい注文を読み直したり、読み落としたりします。</p>
          <h3>6. メリット・デメリット</h3>
          <p>メリットは、Ruby の割り当てが 241 万個から数百個に減り、一覧の表示が 46 ms 前後になったことです。深いページも 28 ms で、ページの位置によって時間がほとんど変わりません。キーセットは前のページの末尾を条件にするので、閲覧中に新しい注文が入っても、次のページに同じ注文が再び出ることはありません。</p>
          <p>デメリットは三つあります。一つ目は索引が 5.5MB の容量を使い、注文を作るたびに更新されることです。今回の索引の作成は 15.1 秒かかりました。二つ目はキーセットではページ番号で任意のページへ移動できないことです。「全 4,000 ページ中 2,001 ページ目」のような表示も、件数を数える SQL を別に実行しないと作れません。三つ目は <code>select</code> で列を絞ると、読み込んでいない属性（たとえば note）をビューで参照したときに <code>ActiveModel::MissingAttributeError</code> になることです。</p>
          <h3>7. トレードオフ</h3>
          <p>この事例ではページ番号での移動をあきらめて、どの深さのページでも同じ時間で表示できることを選びました。運用担当者が「2,001 ページ目」ではなく「10 月 3 日ごろの注文」を探しているなら、日付で絞る検索欄を用意すれば、その目的はキーセットのままで満たせます。</p>
          <p>キーセットの並び順に使う列は、値が変わらない列にします。created_at は作成後に変わらないので、ページの境目は動きません。updated_at のように更新で変わる列で並べると、閲覧中に行がページの間を移動します。</p>
          <p>列を絞る案 2 は 50 行では 3 ms の差しか出ませんでした。ビューの変更と MissingAttributeError の危険を考えて、この画面ではモデルのメソッドを使わない部分だけ <code>select</code> にしています。CSV のように数万行を一度に出す処理では、列を絞る効果は大きくなります（<ChapterLink n={100} section="projection" />）。</p>
          <Ref n={1} />
        </>
      ),
    },
    {
      id: "eager-loading",
      title: "一覧の顧客名と明細で発生する N+1 を解消する",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>前の事例で直した注文一覧に、顧客名と明細の点数の列を足しました。その後、一覧の表示が再び遅くなりました。ログを見ると、1 回の表示で SQL が 101 回実行されています。50 件の一覧を開くたびに、顧客の SELECT が 50 回、明細の SELECT が 50 回ありました。</p>
          <h3>2. 原因や背景</h3>
          <p>ビューのループの中で <code>order.customer.name</code> と <code>order.order_items.sum(&amp;:quantity)</code> を呼んでいます。customer も order_items も読み込まれていないので、注文 1 件ごとに関連を読む SQL が実行されます。これが N+1 です（仕組みは <ChapterLink n={13} section="n-plus-one" />）。コントローラーのコードは変わっていないので、コントローラーだけを読んでも原因は見つかりません。</p>
          <p>開発環境の注文は数十件で、表示件数も 20 件だったため、SQL は 21 回でした。1 回あたり数 ms なので、画面の遅さとしては目立ちませんでした。クエリキャッシュは同じ SQL の結果を同じ要求の中で再利用しますが、顧客 ID が違えば別の SQL になるので、この状況では回数を減らしません（<ChapterLink n={12} section="query-cache" />）。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：<code>preload</code> で、関連を別の SQL でまとめて読む（<code>WHERE id IN (…)</code>）。</li>
            <li>案 2：<code>eager_load</code> で、LEFT OUTER JOIN の SQL で注文と関連を一緒に読む。</li>
            <li>案 3：<code>includes</code> に任せる。関連の表を条件に使っていなければ preload、使っていれば eager_load になる（<ChapterLink n={13} section="includes" />）。</li>
            <li>案 4：明細の点数のように集計した値だけを使うなら、SQL で集計するか、注文の表に件数の列を持たせる（counter_cache。<ChapterLink n={13} section="counter-inverse" />）。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>まず、関連先の列で絞り込みや並べ替えをしているかを確かめます。「顧客名で検索する」のように customers の列を WHERE や ORDER BY に使うなら、注文と顧客を結合する必要があるので eager_load（または joins と preload の組み合わせ）を選びます。この一覧は注文の作成時刻だけで並べるので、結合は必要ありません。</p>
          <p>次に、関連が一対一（belongs_to）か一対多（has_many）かを見ます。一対多の関連を結合すると、注文 1 件が明細の数だけの行になり、注文の列が繰り返し送られます。さらに LIMIT と組み合わせると、Rails は表示する注文の ID を先に決める SQL を別に実行します<Ref n={18} />。一対多の関連は preload を基本にします。</p>
          <p>集計した値だけを使うなら、明細の行そのものを Ruby に渡す必要はありません。ただし counter_cache は書き込みのたびに件数の列を更新するので、明細の追加と削除が多い表では費用が増えます。一覧の表示と書き込みのどちらが多いかで決めます。</p>
          <p><code>includes</code> は条件によって SQL の形が変わります。コードレビューで SQL の形を読み取りやすくするために、この一覧では preload を明示します。これは本書の設計上の意見で、includes を使っても結果は同じです。</p>
          <Figure n={figure(3)} title="N+1 を解消する方法を選ぶ判断の流れ" caption="SQL の回数が表示件数に比例して増えていることをログで確かめてから使う図です。案を組み合わせることもあります（この事例では顧客にも明細にも preload を採用）。">
            <DecisionFigure
              id={figure(3)}
              label="N+1 を解消する方法を選ぶ判断の流れ。関連先の列で絞り込みや並べ替えをするなら eager_load、関連の値を集計した数だけを表示するなら SQL の集計か counter_cache、表示する全行で関連を使うなら preload を選ぶ。どれでもなければ必要な行だけ遅延読み込みのままにする"
              start={['SQL の回数が表示件数に', '比例して増えていることを確かめる']}
              steps={[
                { q: ['関連先の列で絞り込みや', '並べ替えをするか'], yes: ['eager_load（または joins と', 'preload の組み合わせ）'] },
                { q: ['関連の値を集計した数だけを', '表示するか'], yes: ['SQL の集計か counter_cache'] },
                { q: ['表示する全行で関連を使うか'], yes: ['preload で別の SQL にまとめる'] },
              ]}
              last={['一部の行だけで使うなら', '遅延読み込みのままにする']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>顧客名と明細の点数のそれぞれについて、読み込み方を変えて 5 回ずつ測りました。<code>base</code> は前の事例と同じ「新しい順に 50 件」の Relation です。測定の前に 1 回実行して、スキーマ情報の取得を済ませています。</p>
          <Code lang="ruby" title="読み込み方を変えて測る" code={nplus1Code} />
          <Code lang="text" title="実行結果（5 回の平均）" code={nplus1Out} />
          <p>顧客名では遅延読み込みの 51 回（105.5 ms）が preload で 2 回（5.7 ms）になりました。eager_load は SQL が 1 回でも 11.5 ms で、preload より時間も割り当ても多くなりました。結合した SQL は注文と顧客の全列に別名を付けて返すので、Rails が 1 行ずつ列を振り分ける処理が増えるためです。includes は 2 回で、関連の表を条件に使っていないこの Relation では preload と同じ SQL になりました。</p>
          <p>明細では eager_load も SQL が 2 回になりました。1 回目の <code>SELECT DISTINCT orders.id … LIMIT 50</code> で表示する注文を決め、2 回目で注文と明細を結合した 150 行を受け取っています。LIMIT は SQL の結果の行数を制限するので、結合した 150 行にそのまま LIMIT 50 を付けると、50 件の注文ではなく 50 行の明細になってしまいます。Rails はこれを避けるために、先に注文の ID を決めています<Ref n={18} />。結合した 150 行には注文の列（720 バイトの note を含む）が明細の数だけ繰り返し入っています。</p>
          <Figure n={figure(4)} title="preload と eager_load が受け取る行" caption="上の実行結果の SQL をもとに、受け取る行の形を描いた図。行の数は省略して描いています。">
            <LoadShapesFigure />
          </Figure>
          <p><code>strict_loading</code> を付けた Relation では、読み込んでいない関連を参照したときに <code>ActiveRecord::StrictLoadingViolationError</code> が発生します（<ChapterLink n={13} section="strict-loading" />）。preload と組み合わせると例外は起きません。開発環境とテストで strict_loading を有効にしておくと、ビューに列を足して N+1 が戻ったときに、画面を開いた時点で気づけます。</p>
          <p>テストでも SQL の回数を固定できます。次の spec は一覧の読み込みで実行される SQL を数えます。2 つ目の例は先読みを外したもので、この spec が N+1 を検出できることを確かめるために書きました。</p>
          <Code lang="ruby" title="SQL の回数を数える RSpec の例" code={specCode} />
          <Code lang="text" title="実行結果（rspec-core 3.13.7）" code={specOut} />
          <p>先読みがある例は通り、先読みを外した例は「expected: 2, got: 51」で失敗しました。実際のアプリケーションでは 2 つ目の例は残さず、1 つ目だけを request spec などに置きます。</p>
          <h3>6. メリット・デメリット</h3>
          <p>preload にすると、表示件数を 50 件から 100 件に増やしても SQL は注文・顧客・明細の 3 回のままです。顧客名の表示は 105.5 ms から 5.7 ms、明細の点数は 302.9 ms から 26.5 ms になりました。</p>
          <p>デメリットは IN の中の ID の数が表示件数とともに増えることと、先読みした関連をすべてメモリーに置くことです。50 件なら問題になりませんが、数万件を一度に先読みすると、IN のリストが長くなり、メモリーも増えます。大量の行を扱う処理では <code>find_each</code> などでバッチに分けて、バッチごとに preload します（<ChapterLink n={100} section="batches" />）。もう一つはビューで使わなくなった関連の preload が残りやすいことです。使わない関連の SQL が毎回実行されるので、ビューを変えたときは preload も見直します。</p>
          <h3>7. トレードオフ</h3>
          <p>顧客名の表示では、SQL の回数だけを比べれば eager_load の 1 回が最も少なく見えます（明細では LIMIT と組み合わせたため eager_load も 2 回でした）。しかし、この事例では顧客名で 2 倍、明細で 1.4 倍、preload より遅くなりました。SQL の回数を減らすことと、DB とアプリケーションが扱うデータの量を減らすことは別の目標です。この事例では、回数は 2 回で十分に少ないと判断し、扱うデータの量が少ない preload を選びました。</p>
          <p>顧客名で検索する機能を加えると判断は変わります。customers の列で絞るには結合が必要なので、<code>joins(:customer).where(customers: &#123; name: … &#125;).preload(:customer)</code> のように、絞り込みには結合、表示には preload を使う形を検討します。どの形でも、変更の後に SQL の回数と時間を測り直します。</p>
          <Ref n={1} />
        </>
      ),
    },
    {
      id: "index",
      title: "顧客ごとの注文履歴に複合インデックスを加える",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>マイページの注文履歴はログインした顧客の注文を新しい順に 20 件表示します。ほとんどの顧客では数 ms で表示されますが、一部の顧客だけ 10 秒以上かかるという問い合わせが来ました。注文の件数が最も多い法人の顧客 1 は速く、遅いのは半年前にまとめて注文し、最近はほとんど注文していない顧客 3 でした。注文の総数が増えるにつれて、この顧客の表示はさらに遅くなっています。</p>
          <h3>2. 原因や背景</h3>
          <p>orders テーブルの索引は主キー、<code>t.references</code> が作る <code>index_orders_on_customer_id</code>、前の事例で一覧のために加えた <code>idx_orders_created_at_id</code> の 3 つです。履歴の SQL は <code>WHERE customer_id = ? ORDER BY created_at DESC, id DESC LIMIT 20</code> です。顧客ごとに実行計画を調べると、顧客によって違う計画が選ばれていました（実装例の出力を参照）。</p>
          <p>顧客 3 の計画は (created_at, id) の索引を新しい側から読み、customer_id が 3 の行だけを残すものでした。20 件見つかった時点で止まりますが、顧客 3 の注文は古い側に偏っているので、20 件を見つけるまでに 123,557 件を読んでいます。MySQL は ORDER BY と LIMIT がある SQL で、並び順のそろった索引を使う計画を優先します（optimizer_switch の prefer_ordering_index。既定で on）<Ref n={6} />。読む件数は、顧客 3 の注文が全体に均等に散らばっていると仮定して見積もられるので、偏りがあると見積もりが大きく外れます。</p>
          <p>前の事例で一覧のための索引を加えたことで、この SQL の計画が変わったことにもなります。索引を加えるときは、目的の SQL だけでなく、同じ表を読むほかの SQL の計画も確かめる必要があります。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：(customer_id, created_at) の複合索引を加える。InnoDB では索引の末尾に主キーの id が自動で付く<Ref n={7} />。</li>
            <li>案 2：(customer_id, created_at, id) と id まで明示した複合索引を加える。</li>
            <li>案 3：索引を加えず、optimizer hints（<code>Order.optimizer_hints("INDEX(orders index_orders_on_customer_id)")</code>）で customer_id の索引を使わせる。</li>
            <li>案 4：status など表示する列も索引に含めて、表の本体を読まずに済ませる（カバリングインデックス）。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>複合索引の列の順は WHERE の等価条件の列を先に、ORDER BY の列を後に置きます（<ChapterLink n={37} section="composite-index" />）。こうすると、customer_id が同じ行が created_at の順に連続して並ぶので、目的の顧客の末尾から 20 件読めば終わります。</p>
          <p>索引を加えるかどうかは、件数の違う顧客を複数選んで計画と読んだ行数を確かめてから決めます。平均的な顧客だけを測ると、顧客 3 のような偏りを見逃します。この事例では注文の多い顧客（顧客 1）、少ない顧客（顧客 2）、古い注文に偏った顧客（顧客 3）の 3 人を選びました。</p>
          <p>案 3 の hints は計画を固定できますが、顧客 1 では 20,147 件を読んで並べ替えることになり、データの分布が変わっても計画は変わりません。索引で解決できるなら hints は使わず、索引を加えられない事情があるときの方法として残します。案 4 は 20 行の表示では本体を読む回数が 20 回なので、効果が小さいと判断しました。</p>
          <p>索引を加えた後は、重複する索引がないかも確かめます。(customer_id, created_at) の索引があれば、customer_id で絞る検索は新しい索引の先頭部分でも行えます。ただし、索引の中の並び順は変わります。InnoDB の二次索引は末尾に主キーの id を持つので、customer_id だけの索引は (customer_id, id) の順に、新しい索引は (customer_id, created_at, id) の順に並びます。customer_id で絞って id の順に並べる SQL は、古い索引を削除すると計画が変わることがあります（実装例で確かめます）。外部キー制約がある列でも、先頭が customer_id の索引が一つあれば MySQL の条件を満たします<Ref n={19} />。</p>
          <Figure n={figure(5)} title="索引を加えるかを決める判断の流れ" caption="この事例の流れです。範囲条件や OR を含む SQL では列の順の決め方が変わります（詳しくは本文で案内した節）。">
            <DecisionFigure
              id={figure(5)}
              label="索引を加えるかを決める判断の流れ。件数や分布の違う値で EXPLAIN ANALYZE を実行し、読む行数が返す行数に近ければ索引は変えない。等価条件の後に ORDER BY が続くなら等価の列を先頭にした複合索引を作る。書き込みが多く索引を増やせないなら既存の索引で読む範囲を条件で狭める。どれでもなければ範囲条件の列を含む索引を EXPLAIN で比べる"
              start={['件数や分布の違う値で', 'EXPLAIN ANALYZE を実行する']}
              steps={[
                { q: ['どの値でも、読む行数が', '返す行数に近いか'], yes: ['索引は変えない。', '転送や描画の時間を測る'] },
                { q: ['WHERE が等価条件で、', 'その後に ORDER BY が続くか'], yes: ['等価の列を先頭にした', '複合索引を作る'] },
                { q: ['書き込みが多く、', '索引を増やせない表か'], yes: ['既存の索引で読む範囲を', '条件で狭める'] },
              ]}
              last={['範囲条件の列を含む索引を', 'EXPLAIN で比べる']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>3 人の顧客について、履歴の SQL を 30 回ずつ実行した平均時間と、EXPLAIN ANALYZE の計画を記録しました。次に (customer_id, created_at) の索引を加え、同じ測定をしています。</p>
          <Code lang="ruby" title="顧客ごとに計画と時間を測る" code={indexCode} />
          <Code lang="text" title="実行結果（30 回の平均、負荷平均 2〜20）" code={indexOut} />
          <p>索引を加える前は 3 人で 3 通りの計画になりました。顧客 1 は (created_at, id) の索引を逆向きに読み、209 件で 20 件が見つかっています。注文全体の約 10% が顧客 1 なので、読む件数は少なく済みました。顧客 2 は customer_id の索引で 29 件を読み、並べ替えています。顧客 3 は顧客 1 と同じ計画で 123,557 件を読み、10.7 秒かかりました。</p>
          <p>索引を加えた後は 3 人とも <code>Index lookup on orders using idx_orders_customer_created (customer_id=N) (reverse)</code> になり、読んだ件数は 20 件でした。時間は 0.5〜1.1 ms です。ORDER BY には id も含まれていますが、索引に id を書かなくても並べ替えの段は出ていません。InnoDB の二次索引は末尾に主キーを持ち、MySQL はこれを並び順の列としても使うためです（use_index_extensions。既定で on）<Ref n={7} />。案 1 と案 2 はこの SQL では同じ計画になります。</p>
          <Figure n={figure(6)} title="顧客 3 の履歴で索引を読む範囲" caption="上の EXPLAIN ANALYZE の値をもとにした図。左の帯の色の並びは模式的なものです。">
            <IndexPathFigure />
          </Figure>
          <p>索引の作成は 200,000 行で 2.8 秒でした。<code>algorithm: :inplace</code> を付けると、Rails は <code>ALGORITHM = INPLACE</code> を付けた CREATE INDEX を実行します。InnoDB は二次索引の追加を表を複製せずに行い、作成中も行の追加や更新を受け付けます<Ref n={8} />。この指定があれば、表の複製が必要な変更だった場合に MySQL がエラーを返すので、意図しない長時間のロックを避けられます。</p>
          <p><code>sys.schema_redundant_indexes</code> は、customer_id だけの索引が新しい索引の先頭部分と重なることを示しました<Ref n={9} />。ただし、この一覧は索引に書いた列だけを比べるので、末尾に付く主キーの並び順を使う SQL があるかは分かりません。そこで orders を複製した表で customer_id だけの索引を削除し、<code>WHERE customer_id = ? ORDER BY id DESC LIMIT 20</code> の計画を削除の前後で比べました。</p>
          <Code lang="text" title="customer_id だけの索引を削除する前後の計画（MySQL 8.4.13）" code={dropOut} />
          <p>削除の前は、顧客 2 と顧客 3 は customer_id の索引を逆向きに読み、並べ替えずに 20 件で止まりました。削除の後、顧客 2 は新しい索引で 29 件を読んでから id で並べ替える計画（Sort）になりました。顧客 3 は主キーを新しい側から読んで customer_id が 3 の行を探す計画に変わり、137,742 件を読んでいます。課題の SQL と同じく、古い注文に偏った顧客で読む件数が増える計画です。顧客 1 は削除の前後とも主キーを逆向きに読みました。</p>
          <p>このように、id の順に並べる SQL は古い索引を削除すると計画が変わります。削除の前に、その表を読む SQL を集め、件数の違う値で EXPLAIN を実行して計画が変わらないかを確かめます。計画が変わる SQL があれば、ORDER BY を索引の並び順に合わせるか、古い索引を残します。この表には外部キー制約がありませんが、制約がある場合も新しい索引で条件を満たします。古い索引は本番で新しい索引の計画に切り替わったことを確かめてから、別のリリースで削除します。</p>
          <Code lang="ruby" title="索引の追加と、重複する索引の削除" code={indexMigration} />
          <h3>6. メリット・デメリット</h3>
          <p>メリットは、顧客 3 の表示が 10,736 ms から 1.1 ms になり、顧客ごとの差がなくなったことです。顧客の注文がどれだけ古くても、読む件数は 20 件のままです。古い索引を削除すれば、索引の数は増えません。</p>
          <p>デメリットは索引の容量と書き込みの費用です。新しい索引は 6.5MB でした。注文を 1 件作るたびにこの索引も更新されます。また、古い索引を削除するまでの間は、索引が一つ多い状態で書き込みます。この事例では書き込みの費用を測っていないので、書き込みの多い表では索引を加える前後で INSERT の時間を測ります（<ChapterLink n={37} section="index-cost" />）。</p>
          <p>測定結果では後から作った複合索引（6.5MB）のほうが、customer_id だけの索引（7.5MB）より小さくなりました。customer_id の索引は行の追加のたびに少しずつ育ち、ページの分割で空きが残ったと考えられます。InnoDB は索引を一括で作るとき、並べ替えたデータから順にページを埋めます<Ref n={20} />。この差は作り方によるもので、列の多い索引のほうが小さくなるという意味ではありません。</p>
          <h3>7. トレードオフ</h3>
          <p>この事例では 6.5MB の容量と書き込みのたびの更新を払って、顧客による表示時間の差をなくしました。注文履歴はマイページを開くたびに読まれ、注文の作成より何倍も多く実行されます。読み込みの回数が書き込みより多い SQL では、この交換が成り立ちます。</p>
          <p>この索引は「顧客で絞り、作成時刻で並べる」SQL にしか使えません。「状態が shipped の注文を新しい順に」のような別の条件の検索が増えたら、その SQL ごとに同じ手順で計画を確かめます。条件の組み合わせごとに索引を加えると、書き込みの費用が増えます。検索の条件が多い画面では、検索の専用の表やサービスを使う方法も比べます。</p>
          <p>計画はデータの分布で変わります。今回の問題は、索引が足りないことに加えて、分布の偏りで MySQL の見積もりが外れたことから起きました。索引を加えた後も件数や分布の違う顧客で計画を確かめる手順を残しておきます。</p>
          <Ref n={2} />
        </>
      ),
    },
    {
      id: "transaction",
      title: "在庫の引き当てでトランザクションに入れる処理を決める",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>在庫が 5 個の限定商品を発売した直後に、20 人が同時に注文しました。20 件の注文がすべて確定し、在庫の数は 4 になりました。在庫の数と注文の数が合わず、15 人に「確定した注文を取り消す」連絡をする必要がありました。</p>
          <p>別の問題もあります。不具合の後、在庫の確認と決済 API の呼び出しを一つのトランザクションに入れたところ、人気の商品で注文の完了が遅くなりました。決済 API の応答は 200ms 程度ですが、同じ商品の注文が並ぶと、後の人ほど長く待ちます。</p>
          <h3>2. 原因や背景</h3>
          <p>最初の実装は在庫を読み、残りがあれば 1 を引いた値を書く、という手順をトランザクションで囲んでいました（実装例の A）。MySQL の既定の分離レベルである REPEATABLE READ では、ロックを付けない SELECT はロックを取らずにスナップショットを読みます。20 のトランザクションがほぼ同時に「在庫 5」を読み、それぞれ「4」を書いたので、在庫は 4 になり、注文は 20 件確定しました。後の書き込みが前の書き込みを上書きする、更新の消失です（<ChapterLink n={38} section="concurrent-updates" />）。トランザクションで囲むことは、途中で失敗したときに変更を取り消すことを保証しますが、同時に読んだ値を書き戻す競合は防ぎません。</p>
          <p>決済 API の待ちは行ロックを持ったまま外部の応答を待ったことが原因です。在庫の行に排他ロックを取ってから API を呼ぶと、200ms の間、同じ商品を買うほかのトランザクションは SELECT … FOR UPDATE で待ちます。API が応答しなければ、ほかのトランザクションは innodb_lock_wait_timeout（既定 50 秒）まで待ち、<code>ActiveRecord::LockWaitTimeout</code> になります<Ref n={10} /><Ref n={14} />。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：<code>lock.find</code> で在庫の行に排他ロックを取ってから読み、判定して更新する（悲観的ロック。<ChapterLink n={15} section="pessimistic" />）。</li>
            <li>案 2：<code>UPDATE … SET available = available - 1 WHERE id = ? AND available &gt;= 1</code> を実行し、更新した行数で成否を判定する（<ChapterLink n={49} section="stock-update" />）。</li>
            <li>案 3：lock_version を使う楽観的ロックで、競合したら再試行するか利用者にやり直してもらう（<ChapterLink n={15} section="optimistic" />）。</li>
            <li>案 4：決済 API の呼び出しをトランザクションの外に出す。先に与信（支払いの枠の確保）を取り、短いトランザクションで在庫と注文を確定し、在庫切れなら与信を取り消す。</li>
          </ul>
          <p>案 1〜3 は同時の更新を防ぐ方法、案 4 はトランザクションに何を入れるかの方法で、案 4 は案 1 か案 2 と組み合わせます。</p>
          <h3>4. 判断基準</h3>
          <p>トランザクションに入れるのは、一緒に確定しなければ矛盾が生じる DB の変更だけです。この事例では「在庫を 1 減らす」と「注文を確定にする」がそれに当たります。片方だけが確定すると、在庫と注文の数が合わなくなります。決済 API、メール、ファイルの作成は DB のトランザクションで取り消せないので、入れても一緒に取り消されることはありません。外に出し、失敗したときの処理を別に書きます（<ChapterLink n={34} section="transaction-design" />）。</p>
          <p>ロックの方式は判定に使う条件の形で選びます。「残りが 1 以上なら 1 減らす」のように条件を UPDATE の WHERE に書けるなら案 2 にします。UPDATE の 1 文で判定と更新が終わり、ロックはその行に対して UPDATE からコミットまでの間だけ持ちます。セット商品で複数の在庫の行を読んでから判断するなど、条件を SQL の 1 文で書けないなら案 1 にします。複数の行をロックするときは、デッドロックを避けるために ID の順など決まった順に取ります（<ChapterLink n={38} section="deadlock" />）。</p>
          <p>案 3 は、競合がまれで、競合したときに利用者に入力をやり直してもらえる画面（管理画面で商品の情報を編集するなど）に向きます。発売直後に注文が集中する在庫の引き当てでは競合が頻繁に起き、再試行が増えるので選びません。</p>
          <Figure n={figure(7)} title="在庫の引き当てでロックの方式を選ぶ判断の流れ" caption="最初の箱は、どの方式でも先に行う手順です。図は判断の順序を単純化したもので、方式を組み合わせる場合もあります。">
            <DecisionFigure
              id={figure(7)}
              label="在庫の引き当てでロックの方式を選ぶ判断の流れ。先に外部 API やメールをトランザクションの外に出す。残数の判定を SQL の条件 1 つで書けるなら条件付き UPDATE と更新件数の確認。複数の行を読んで判断してから更新するなら lock で行をロックし、ID の順に取る。競合が少なく利用者にやり直しを頼めるなら楽観的ロック。どれでもなければ lock で行をロックし、保持時間を測る"
              start={['外部 API やメールを', 'トランザクションの外に出す']}
              steps={[
                { q: ['残数の判定を', 'SQL の条件 1 つで書けるか'], yes: ['条件付き UPDATE と', '更新した行数の確認'] },
                { q: ['複数の行を読んで判断してから', '更新するか'], yes: ['lock で行をロック', '（ID の順に取る）'] },
                { q: ['競合が少なく、', '利用者にやり直しを頼めるか'], yes: ['楽観的ロック（lock_version）'] },
              ]}
              last={['lock で行をロックし、', 'ロックの保持時間を測る']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>在庫の表と注文の表を作り、スレッドで同時に購入する実験をしました。接続プールの上限は 25 にして、すべてのスレッドが同時に接続を持てるようにしています。在庫 5 の商品に 20 スレッドが同時に買いに行く場合を A〜C の 3 つの方式で、在庫 10 の商品に 10 スレッドが同時に買いに行く場合を、決済 API の扱いを変えた D と E で測りました。</p>
          <Code lang="ruby" title="5 つの方式" code={txCode} />
          <Code lang="text" title="実行結果" code={txOut} />
          <p>A では 20 件の注文が確定し、在庫は 4 になりました。課題で起きたことが再現しています。B と C はどちらも 5 件が確定し、15 件が在庫切れになり、在庫は 0 で止まりました。B の SQL を見ると、<code>InventoryItem.lock.find</code> が <code>SELECT … FOR UPDATE</code> になり、コミットまでその行の排他ロックを持っています。後から来たトランザクションは、このロックが外れるまで SELECT で待ち、待った後で最新の在庫を読みます<Ref n={10} />。C では UPDATE の WHERE の <code>available &gt;= 1</code> が判定を兼ね、在庫が 0 の行は更新されないので、<code>update_all</code> が 0 を返します。</p>
          <p>図 {figure(8)} では方式と最初の在庫を選び、2つのトランザクション（T1 と T2）が同じ在庫の行を更新する順序を段階ごとに確かめられます。A では、T2 は T1 が書く前に読んだ値から次の値を計算するので、注文が 2 件確定しても在庫は 1 しか減りません。B では T2 は読む前に、C では UPDATE の途中で T1 のロックを待ちます。どちらも T1 のコミットの後の値で在庫を判定します。</p>
          <StockRaceFigure />
          <p>D は確定までに 2,332 ms かかりました。同じ測定を 3 回繰り返すと 2,259〜2,385 ms で、10 人 × 200ms の API の待ちが順番に並んだ時間とほぼ同じです。E は 980 ms で、3 回繰り返すと 437〜621 ms でした（最初の 980 ms は接続の確立を含みます）。E では 10 人が決済 API を同時に待ち、その後の短いトランザクションだけが順番に実行されます。</p>
          <Figure n={figure(9)} title="ロック中に外部 API を待つ場合と待たない場合" caption="10 人のうち 4 人を描いた模式図。実測では 10 人で D が約 2.3 秒、E が 0.44〜0.98 秒でした。">
            <LockTimelineFigure />
          </Figure>
          <p>E の形をアプリケーションに組み込むと、在庫切れのときに取った与信を取り消す処理が必要になります。与信の取り消しも失敗することがあるので、取り消せなかった与信を記録して後から再試行する仕組みを用意します。この部分は外部サービスの仕様で変わるので、ここでは実行していません。外部の決済とトランザクションを分ける手順は <ChapterLink n={55} section="stage2" /> で扱っています。</p>
          <h3>6. メリット・デメリット</h3>
          <p>条件付き UPDATE（C）を選んだ場合、在庫の数と確定した注文の数が一致し、ロックを持つ時間は UPDATE からコミットまでになります。SQL も 1 文で、判定の条件が UPDATE 文の中に見えます。決済 API をトランザクションの外に出すと、同じ商品の注文が集中しても、決済の待ちが順番に積み重なりません。</p>
          <p>デメリットは処理の順序と失敗時の扱いが増えることです。決済の与信を取ったのに在庫が切れていた場合の取り消し、与信の取り消しに失敗した場合の記録と再試行が必要になります。また C は、判定の条件が SQL の文字列に入るので、条件が複雑になると読みにくくなります。条件が増えて SQL の 1 文に収まらなくなったら、B に切り替えます。</p>
          <h3>7. トレードオフ</h3>
          <p>この事例では在庫の正しさを最優先にし、次に同じ商品への注文が集中したときの完了時間を短くしました（10 人の同時購入で 2.3 秒から 0.44〜0.98 秒）。その代わりに、与信の取り消しという失敗時の処理と、それを運用する費用を受け入れています。</p>
          <p>トランザクションの範囲を広げると、取り消せる範囲は広がりますが、ロックを持つ時間も長くなります。範囲を狭くすると、ロックの時間は短くなりますが、途中で失敗したときに手で戻す処理が増えます。外部 API のように DB の外にある処理は、範囲に入れても取り消せないので、狭くする方向で考えます。</p>
          <p>注文がまれな商品だけを扱う店なら、D の形でも待ちはほとんど起きません。それでも API が応答しない場合に 50 秒間ロックを持ち続ける危険は残るので、外部の呼び出しはトランザクションの外に出しておきます。</p>
          <Ref n={3} />
        </>
      ),
    },
    {
      id: "integrity",
      title: "外部の注文番号の重複を DB の制約で防ぐ",
      body: (
        <>
          <h3>1. 課題</h3>
          <p>外部のショッピングモールから注文を取り込んでいます。モールの注文は店舗の ID（store_id）とモールの注文番号（external_number）の組で区別します。ある日、同じ注文番号の注文が 2 件取り込まれ、同じ商品を 2 回発送しました。モールは Webhook で注文を送り、応答が遅いと同じ注文を再送します。夜間には取り込み漏れを補う一括取り込みも動いていて、Webhook と同じ注文を同時に処理することがあります。</p>
          <p>調べると、既存のデータにも同じ番号の注文が残っていました。注文番号が NULL の行もあり、どの注文かを特定できません。</p>
          <h3>2. 原因や背景</h3>
          <p>モデルには <code>validates :external_number, uniqueness: &#123; scope: :store_id &#125;</code> がありました。一意性のバリデーションは、保存の前に同じ値の行があるかを SELECT で調べます。2 つのプロセスがほぼ同時に調べると、どちらも「まだない」と判断し、どちらも INSERT します。Rails のガイドも、このバリデーションは一意であることを保証しないので、DB に一意索引を作るよう説明しています<Ref n={4} />。</p>
          <p>また、バリデーションは Active Record の save を通る書き込みでしか実行されません。<code>insert_all</code>、<code>update_all</code>、SQL を直接実行するスクリプト、別のアプリケーションからの書き込みでは確かめられません。夜間の一括取り込みは速度のために <code>insert_all</code> を使っていました。</p>
          <h3>3. 解決方法の選択肢</h3>
          <ul>
            <li>案 1：バリデーションだけのまま、Webhook の処理と一括取り込みが同時に動かないように実行の時刻をずらす。</li>
            <li>案 2：(store_id, external_number) の一意索引と NOT NULL 制約を加える。バリデーションは利用者向けのメッセージのために残す。</li>
            <li>案 3：取り込みの前に店舗の行を <code>lock</code> でロックするなど、アプリケーションで取り込みを店舗ごとに順番に実行する。</li>
            <li>案 4：案 2 に加えて、一意索引の違反を「同じ注文の再送」と「同じ番号で内容が違う注文」に分けて扱う（<ChapterLink n={52} section="webhook" />）。</li>
          </ul>
          <h3>4. 判断基準</h3>
          <p>最初の基準は、その規則がどの書き込み経路でも守られる必要があるかです。「同じ注文番号の注文は一つ」は、Webhook、一括取り込み、管理画面の手入力のどれから書き込んでも成り立つ必要があります。どの経路からでも守らせる規則は DB の制約にします。案 1 と案 3 は、すべての経路が決まった手順を守ることを前提にしているので、新しい経路が増えたときに守られなくなります。</p>
          <p>次の基準は、既存のデータが制約を満たせるかです。一意索引は重複が残っていると作れません。どちらの行を残すかは、発送の記録や問い合わせの履歴を見て業務の担当者が決めることで、マイグレーションで機械的に決めることではありません。</p>
          <p>NULL の扱いも決めます。MySQL の一意索引は NULL の値を何行でも許します<Ref n={11} />。注文番号のない注文を認めない仕様なら NOT NULL 制約を加えます。番号のない注文を認める仕様なら、NULL の行どうしの重複は一意索引では防げないので、別の方法で区別します。</p>
          <p>最後に、違反したときにどう応答するかを決めます。利用者が入力した値の誤りならバリデーションのメッセージで知らせます。同じ注文の再送なら、登録済みの注文を返して成功として扱います。同じ番号で金額が違うなら、どちらかのデータが間違っているので、競合として記録し、担当者に知らせます。</p>
          <Figure n={figure(10)} title="一意制約に違反したときの扱いを決める判断の流れ" caption="最初の箱は、制約を加える前に済ませる作業です。この事例では再送と内容の違う競合を分けて扱います。">
            <DecisionFigure
              id={figure(10)}
              label="一意制約に違反したときの扱いを決める判断の流れ。先に既存の重複と NULL を片付け、一意索引と NOT NULL を加える。利用者の入力の誤りならバリデーションでメッセージを返す。同じ要求の再送で内容も同じなら登録済みの行を返す。同じ番号で内容が違うなら競合として記録し担当者に知らせる。どれでもなければ例外をそのまま上げて調べる"
              start={['既存の重複と NULL を片付け、', '一意索引と NOT NULL を加える']}
              steps={[
                { q: ['利用者が入力した値の誤りか'], yes: ['バリデーションで', 'メッセージを返す'] },
                { q: ['同じ要求の再送で、', '内容も同じか'], yes: ['登録済みの行を返す'] },
                { q: ['同じ番号で内容が違うか'], yes: ['競合として記録し、', '担当者に知らせる'] },
              ]}
              last={['例外をそのまま上げて調べる']}
            />
          </Figure>
          <h3>5. 具体的な実装例</h3>
          <p>注文の表 channel_orders を作り、最初は external_number の NULL を許し、一意索引も付けない状態から始めました。検証の SELECT と INSERT の間に 200ms の待ちを入れて、2 つのスレッドが毎回競合するようにしています。この待ちは実験のためのもので、実際のアプリケーションには入れません。</p>
          <Code lang="ruby" title="一意性の検証と同時の登録" code={integrityModel} />
          <p>手順は 7 段階です。1 で競合を起こし、2 で重複を探し、3 で重複が残ったまま一意索引を作り、4 で重複を片付けて索引を作ってから同じ競合を起こしました。5 では NULL の扱いを、6 では再送と内容の違う注文の扱いを、7 では CHECK 制約を確かめています。</p>
          <Code lang="text" title="実行結果" code={integrityOut} />
          <p>1 では、どちらのスレッドもバリデーションを通り、同じ番号の行が 2 つ保存されました。3 では、重複が残っていると一意索引を作れないことを確かめました。MySQL のエラーは Rails で <code>ActiveRecord::RecordNotUnique</code> になります<Ref n={13} />。4 では、一意索引を作った後に同じ競合を起こすと、後から INSERT したスレッドだけが <code>RecordNotUnique</code> を受け取り、行は 1 つになりました。バリデーションは両方とも通っているので、競合を防いだのは DB の一意索引です。</p>
          <Figure n={figure(11)} title="一意性の検証と一意索引の競合" caption="実行結果の 1 と 4 を時系列に並べた図です。">
            <RaceFigure />
          </Figure>
          <p>5 では、一意索引があっても、同じ店舗で external_number が NULL の行を 2 つ保存できました。NULL の行が残っていると NOT NULL 制約も加えられず、MySQL は <code>Invalid use of NULL value</code> を返しました。NULL の行を片付けてから NOT NULL に変更しています。マイグレーションにすると次のようになります。</p>
          <Code lang="ruby" title="一意索引・NOT NULL・CHECK 制約のマイグレーション" code={integrityMigration} />
          <p>6 は違反したときの扱いを分ける次のメソッドで確かめました。同じ内容の 2 回目は登録済みの id=7 を返し、金額の違う 3 回目は <code>DuplicateOrderConflict</code> になりました。順番に呼んだ場合はバリデーションが先に重複を見つけて <code>ActiveRecord::RecordInvalid</code> になり、同時に呼んだ場合は一意索引の <code>RecordNotUnique</code> になります。どちらの例外でも同じ処理をするように、2 つを捕まえています。</p>
          <Code lang="ruby" title="再送と内容の違う注文を分ける" code={registerCode} />
          <p>7 は在庫の数のように値の範囲の規則を CHECK 制約にした例です。MySQL 8.4 は CHECK 制約を評価し、違反した UPDATE を拒否します<Ref n={12} />。Rails 8.1 はこのエラーを <code>ActiveRecord::CheckViolation</code> にしました<Ref n={13} />。前の事例の条件付き UPDATE と組み合わせると、アプリケーションのコードに誤りがあっても在庫が負の値になりません。</p>
          <h3>6. メリット・デメリット</h3>
          <p>メリットはどの書き込み経路でも、同時に実行されても、同じ注文番号の行が一つに限られることです。<code>insert_all</code> を使う一括取り込みでも、違反した行は DB が拒否します。再送を成功として扱うので、モールが Webhook を再送しても二重に発送しません。</p>
          <p>デメリットは制約を加える前の作業です。既存の重複と NULL を調べ、残す行を業務の担当者と決めて片付ける必要があります。また、<code>RecordNotUnique</code> を捕まえる処理を、登録するすべての経路に書く必要があります。一括取り込みの <code>insert_all</code> は一意索引に違反する行を例外にせずに飛ばします（<code>insert_all!</code> なら例外になります）<Ref n={21} />。飛ばされた行が再送なのか内容の違う注文なのかは区別されないので、一括取り込みでは飛ばした番号を記録して内容を比べるか、<code>register</code> で 1 件ずつ登録するかを決めます。</p>
          <h3>7. トレードオフ</h3>
          <p>この事例では既存データを片付ける手間と、例外を扱うコードの追加を受け入れて、二重発送をなくしました。バリデーションと DB の制約は役割が違います。バリデーションは利用者に分かるメッセージを返し、DB の制約は同時の書き込みと Rails を通らない書き込みから規則を守ります。片方だけでは足りないので、両方を置きます。</p>
          <p>一意索引で区別できるのは「同じ番号か」だけで、「同じ注文の再送か」「別の注文か」は区別できません。この区別は金額などの内容を比べるアプリケーションの処理で行います。内容の比べ方を誤ると、別の注文を再送として扱ってしまうので、比べる項目はモールの仕様で決まる値（金額と商品の組など）にします。</p>
          <p>CHECK 制約は値の範囲を守れますが、違反したときのメッセージは DB のエラーになります。利用者に見せる画面ではバリデーションで同じ規則を確かめてから保存します。</p>
          <Ref n={4} />
        </>
      ),
    },
    {
      id: "judgment",
      title: "五つの事例の判断基準とトレードオフ",
      body: (
        <>
          <p>五つの事例で確かめた値、選んだ案、得たもの、払ったものを並べます。</p>
          <Figure n={figure(12)} title="五つの事例の判断のまとめ" caption="この章の実測値（MySQL 8.4.13、注文 200,000 件）をもとにした表です。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>事例</th><th>最初に確かめた値</th><th>選んだ案</th><th>得たもの</th><th>払ったもの</th></tr>
                </thead>
                <tbody>
                  <tr><td>一覧のクエリ</td><td>Ruby に渡す行数と、EXPLAIN の読んだ行数</td><td>SQL での並べ替え、(created_at, id) の索引、キーセット</td><td>43 秒 → 46 ms。深いページ 27.8 秒 → 28 ms</td><td>ページ番号での移動、索引 5.5MB</td></tr>
                  <tr><td>N+1</td><td>1 回の表示の SQL の回数</td><td>preload</td><td>51 回 → 2 回（顧客・明細それぞれ）</td><td>IN のリストとメモリー</td></tr>
                  <tr><td>索引</td><td>顧客ごとの計画と読んだ行数</td><td>(customer_id, created_at) の索引</td><td>10,736 ms → 1.1 ms</td><td>索引 6.5MB、書き込み時の更新</td></tr>
                  <tr><td>トランザクション</td><td>確定した注文の数と在庫の数</td><td>条件付き UPDATE、決済 API はトランザクションの外</td><td>在庫どおりの確定、10 人で 2.3 秒 → 0.44〜0.98 秒</td><td>与信の取り消しの処理</td></tr>
                  <tr><td>整合性</td><td>同時に登録したときの行の数</td><td>一意索引、NOT NULL、再送の判定</td><td>同時に登録しても 1 行</td><td>既存データの整理、例外の処理</td></tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>五つの事例に共通する手順は次の 4 つです。</p>
          <ol>
            <li>結果が変わらないことを先に決める。並び順を一意にする、在庫と注文の数を一致させる、同じ注文を一つにする、といった条件を満たさない案は、速くても採用しません。</li>
            <li>件数とともに増える値を測る。時間はマシンの負荷で変わるので、SQL の回数、EXPLAIN ANALYZE の読んだ行数、ロックを待つ時間のように、データ量や同時実行の数とともに増える値を根拠にします。</li>
            <li>測った値を減らす案のうち、変更の小さい案から試す。N+1 は preload を 1 行足すだけで解消し、索引の事例ではヒントより索引を先に試しました。</li>
            <li>新しく増える費用を数える。索引の書き込みと容量、例外を扱うコード、与信の取り消しのように、改善と引き換えに増えるものを書き出し、運用できるかを確かめます。</li>
          </ol>
          <p>事例の間の影響にも注意が必要です。一覧のために加えた (created_at, id) の索引は、顧客ごとの履歴の計画を変え、顧客 3 の表示を遅くしました。SELECT … FOR UPDATE は条件に使う列に索引がないと、目的の行より多くの行をロックします（<ChapterLink n={15} section="lock-index" />）。一つの変更の後で、同じ表を使うほかの SQL の計画とロックの範囲も確かめます。</p>
          <p>変更しない判断もあります。ある処理が SQL を数回余分に実行していても、利用者が待つ時間や DB の負荷に表れていなければ、その処理を直すより、測定で遅いと分かった別の箇所を直すほうが効果があります。どの処理から直すかは、<ChapterLink n={112} section="reading-results" /> の手順で、時間のかかっている区間から決めます。これは本書の意見で、どの程度の余分を許すかはサービスの要件で変わります。</p>
        </>
      ),
    },
    {
      id: "related",
      title: "関連する章",
      body: (
        <>
          <p>この章の事例で使った仕組みは次の章で詳しく扱っています。</p>
          <ul>
            <li>N+1 と読み込み方式：<ChapterLink n={13} section="preload" />、<ChapterLink n={13} section="eager-load" />、<ChapterLink n={13} section="strict-loading" /></li>
            <li>索引と実行計画：<ChapterLink n={37} section="composite-index" />、<ChapterLink n={37} section="explain-rails" />、<ChapterLink n={37} section="index-cost" /></li>
            <li>取得する列・バッチ・ページ送り：<ChapterLink n={100} section="projection" />、<ChapterLink n={100} section="pagination" /></li>
            <li>ロックと同時の更新：<ChapterLink n={38} section="lost-update-fix" />、<ChapterLink n={38} section="deadlock" />、<ChapterLink n={15} section="pessimistic" /></li>
            <li>在庫の減算と楽観的ロック：<ChapterLink n={49} section="stock-update" /></li>
            <li>再送と重複の扱い：<ChapterLink n={52} section="webhook" /></li>
            <li>計測の手順：<ChapterLink n={112} section="benchmark" /></li>
          </ul>
          <p>Puma のスレッド数、接続プール、キャッシュ、ジョブを選ぶ事例は <ChapterLink n={115} />、設計をどこまで変えるかを判断する事例は <ChapterLink n={116} /> で扱います。</p>
        </>
      ),
    },
  ],
  sources: [
    { title: "Active Record Query Interface", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_record_querying.html", accessed: "2026-11-27", version: "Rails 8.1", note: "order、limit、pluck、select、preload・eager_load・includes、strict_loading、lock" },
    { title: "EXPLAIN Statement", publisher: "MySQL Reference Manual", url: `${MY}/explain.html`, accessed: "2026-11-27", version: "MySQL 8.4", note: "EXPLAIN FORMAT=TREE と EXPLAIN ANALYZE の actual time と rows" },
    { title: "activerecord/lib/active_record/transactions.rb", publisher: "rails/rails（GitHub）", url: `${GH}/activerecord/lib/active_record/transactions.rb`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "トランザクションと例外によるロールバック" },
    { title: "Active Record Validations（uniqueness）", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_record_validations.html#uniqueness", accessed: "2026-11-27", version: "Rails 8.1", note: "一意性のバリデーションは一意であることを保証せず、DB の一意索引が必要であること" },
    { title: "ORDER BY Optimization", publisher: "MySQL Reference Manual", url: `${MY}/order-by-optimization.html`, accessed: "2026-11-27", version: "MySQL 8.4", note: "索引による並べ替えの省略と filesort" },
    { title: "LIMIT Query Optimization / Switchable Optimizations（prefer_ordering_index）", publisher: "MySQL Reference Manual", url: `${MY}/limit-optimization.html`, accessed: "2026-11-27", version: "MySQL 8.4", note: "ORDER BY と LIMIT の組み合わせ、OFFSET の行の読み飛ばし、並び順の索引を優先する設定" },
    { title: "Use of Index Extensions", publisher: "MySQL Reference Manual", url: `${MY}/index-extensions.html`, accessed: "2026-11-27", version: "MySQL 8.4", note: "InnoDB の二次索引が主キーの列を含み、use_index_extensions でそれを使うこと" },
    { title: "Online DDL Operations", publisher: "MySQL Reference Manual", url: `${MY}/innodb-online-ddl-operations.html`, accessed: "2026-11-27", version: "MySQL 8.4", note: "二次索引の追加を INPLACE で行い、作成中も DML を受け付けること" },
    { title: "The schema_redundant_indexes View", publisher: "MySQL Reference Manual", url: `${MY}/sys-schema-redundant-indexes.html`, accessed: "2026-11-27", version: "MySQL 8.4", note: "他の索引の先頭部分と重なる索引の一覧" },
    { title: "Locking Reads", publisher: "MySQL Reference Manual", url: `${MY}/innodb-locking-reads.html`, accessed: "2026-11-27", version: "MySQL 8.4", note: "SELECT ... FOR UPDATE が読んだ行に排他ロックを取ること" },
    { title: "CREATE INDEX Statement", publisher: "MySQL Reference Manual", url: `${MY}/create-index.html`, accessed: "2026-11-27", version: "MySQL 8.4", note: "UNIQUE 索引が NULL を含む行を複数許すこと" },
    { title: "CHECK Constraints", publisher: "MySQL Reference Manual", url: `${MY}/create-table-check-constraints.html`, accessed: "2026-11-27", version: "MySQL 8.4", note: "CHECK 制約の評価と違反時のエラー" },
    { title: "activerecord/lib/active_record/errors.rb", publisher: "rails/rails（GitHub）", url: `${GH}/activerecord/lib/active_record/errors.rb`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "RecordNotUnique（228 行）、CheckViolation（296 行）、LockWaitTimeout（578 行）" },
    { title: "InnoDB Startup Options and System Variables（innodb_lock_wait_timeout）", publisher: "MySQL Reference Manual", url: `${MY}/innodb-parameters.html#sysvar_innodb_lock_wait_timeout`, accessed: "2026-11-27", version: "MySQL 8.4", note: "行ロックを待つ時間の上限（既定 50 秒）" },
    { title: "InnoDB Startup Options and System Variables（innodb_buffer_pool_size）", publisher: "MySQL Reference Manual", url: `${MY}/innodb-parameters.html#sysvar_innodb_buffer_pool_size`, accessed: "2026-11-27", version: "MySQL 8.4", note: "バッファープールの既定値 128MB" },
    { title: "Active Support Instrumentation（sql.active_record）", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_support_instrumentation.html#sql-active-record", accessed: "2026-11-27", version: "Rails 8.1", note: "sql.active_record の payload（sql、name）" },
    { title: "GC.stat", publisher: "Ruby Documentation", url: "https://docs.ruby-lang.org/en/4.0/GC.html#method-c-stat", accessed: "2026-11-27", version: "Ruby 4.0", note: "total_allocated_objects。実測は Ruby 4.0.9" },
    { title: "activerecord/lib/active_record/relation/finder_methods.rb（apply_join_dependency）", publisher: "rails/rails（GitHub）", url: `${GH}/activerecord/lib/active_record/relation/finder_methods.rb#L458-L486`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "LIMIT と has_many の eager_load で、先に主キーを DISTINCT で取得すること" },
    { title: "FOREIGN KEY Constraints", publisher: "MySQL Reference Manual", url: `${MY}/create-table-foreign-keys.html`, accessed: "2026-11-27", version: "MySQL 8.4", note: "参照する側の表に、外部キーの列を先頭に持つ索引が必要なこと" },
    { title: "Sorted Index Builds", publisher: "MySQL Reference Manual", url: `${MY}/sorted-index-builds.html`, accessed: "2026-11-27", version: "MySQL 8.4", note: "索引を一括で作るときにページを順に埋めること（innodb_fill_factor）" },
    { title: "activerecord/lib/active_record/relation.rb（insert_all）", publisher: "rails/rails（GitHub）", url: `${GH}/activerecord/lib/active_record/relation.rb#L680-L702`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "一意索引に重複する行を飛ばすこと、unique_by は PostgreSQL と SQLite だけで使えること" },
    { title: "activerecord/lib/active_record/connection_adapters/abstract/schema_definitions.rb", publisher: "rails/rails（GitHub）", url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/schema_definitions.rb#L556-L558`, accessed: "2026-11-27", version: "Rails 8.1.4.1", note: "datetime 型の列の precision を既定で 6 にすること" },
  ],
}

export default chapter
