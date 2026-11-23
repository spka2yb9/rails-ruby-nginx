import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 59-1 ポイントの付与の構成と、問題が起きる箇所 ---------- */
const sceneStores = [
  { y: 20, lines: ['orders', '過去1年の SUM（SELECT）'], from: 90 },
  { y: 84, lines: ['campaigns', '期間中のもの（SELECT）'], from: 120 },
  { y: 148, lines: ['時計', 'Time.current・1.year.ago'], from: 150 },
  { y: 250, lines: ['point_entries', '付与したポイント（INSERT）'], from: 200 },
]

function SceneFigure() {
  return (
    <Svg
      id="59-1"
      w={780}
      h={392}
      label="発送の処理が AwardPointsJob を perform_later で投入し、Sidekiq のワーカーがジョブを実行する。ジョブはキューの待ちや再試行で、注文から時間がたって動く。ジョブは Order#award_points! を呼び、このメソッドが、過去1年の購入額を orders から SUM で読み、ランクと率を決め、期間中のキャンペーンを campaigns から読み、ボーナスを計算し、point_entries に保存する。過去1年の範囲とキャンペーンの期間は、時計（Time.current と 1.year.ago）で決める。時計はジョブが動いた時刻を返すので、ランクとキャンペーンが、注文した時刻ではなくジョブが動いた時刻で決まる。また計算が、DB と時計の読み取りと保存の間にある"
    >
      <Box x={20} y={20} w={200} h={40} lines="発送の処理（出荷の画面）" fs={12} bold />
      <Arrow x1={120} y1={60} x2={120} y2={100} />
      <T x={128} y={80} fs={11} mono>
        perform_later
      </T>
      <Box x={20} y={102} w={200} h={44} lines={['AwardPointsJob', 'Sidekiq のワーカーが実行']} fs={12} bold subTone="muted" />
      <T x={20} y={166} fs={11} tone="danger">
        キューの待ちや再試行で、
      </T>
      <T x={20} y={182} fs={11} tone="danger">
        注文から時間がたって動く
      </T>
      <Arrow x1={220} y1={124} x2={258} y2={124} />
      <Box
        x={260}
        y={70}
        w={240}
        h={150}
        lines={['Order#award_points!', '① 過去1年の購入額を読む', '② ランクと率を決める', '③ キャンペーンを読む', '④ ボーナスを計算する', '⑤ point_entries に保存する']}
        fs={12}
        fill="box5"
        bold
        accent
        subTone="muted"
      />
      <T x={260} y={240} fs={11} tone="danger">
        計算（②④）が、DB と時計の読み取りと
      </T>
      <T x={260} y={256} fs={11} tone="danger">
        保存の間にある
      </T>
      {sceneStores.map((s) => (
        <g key={s.lines[0]}>
          <Box x={580} y={s.y} w={180} h={44} lines={s.lines} fs={12} fill="box4" bold subTone="muted" />
          <Arrow x1={500} y1={s.from} x2={578} y2={s.y + 22} />
        </g>
      ))}
      <T x={580} y={212} fs={11} tone="danger">
        ジョブが動いた時刻を返す
      </T>
      <T x={20} y={320} fs={12} tone="danger">
        ランクとキャンペーンが、注文した時刻ではなく、ジョブが動いた時刻で決まる
      </T>
      <T x={20} y={372} fs={11} tone="muted">
        右の色付きの箱はデータと時計。実線の矢印は呼び出し（SELECT・INSERT・時刻の読み取り）。赤い文字は次の項で確かめる問題
      </T>
    </Svg>
  )
}

/* ---------- 図 59-2 ジョブが動いた時刻と、付いたポイント ---------- */
// 横軸は 11/27 0:00 から 12/3 0:00 までの6日。1日 = 105px
const tx = (day: number, hour: number) => 110 + (day + hour / 24) * 105
const days = ['11/27', '11/28', '11/29', '11/30', '12/1', '12/2', '12/3']
const jobs = [
  { no: '①', x: tx(3, 23.75), label: '① 11/30 23:45', anchor: 'end' as const, lx: tx(3, 23.75) - 8, ly: 212, ya: 'end' as const },
  { no: '②', x: tx(4, 9), label: '② 12/1 9:00', anchor: 'middle' as const, lx: tx(4, 9) + 14, ly: 152, ya: 'start' as const },
  { no: '③', x: tx(5, 10), label: '③ 12/2 10:00', anchor: 'middle' as const, lx: tx(5, 10), ly: 212, ya: 'end' as const },
]

function TimelineFigure() {
  const order2025 = tx(4, 18)
  return (
    <Svg
      id="59-2"
      w={780}
      h={420}
      label="上の時間軸は2026年11月27日から12月3日。キャンペーン「ブラックフライデー 2倍」は11月27日0時から12月1日0時の前まで。注文は11月30日23時30分、5,000円。ジョブは①11月30日23時45分、②12月1日9時、③12月2日10時に動いた場合を比べる。下の時間軸は同じ月日の2025年で、3,000円の注文が2025年12月1日18時にある。各ジョブの時刻の1年前より後の注文が、過去1年の購入額に入る。①と②の1年前は3,000円の注文より前なので合計は30,000円でシルバー、③の1年前は3,000円の注文より後なので合計は27,000円でレギュラーになる。①はキャンペーン中なので200ポイント、②はキャンペーンの後なので100ポイント、③は50ポイント。正しい値は、注文した11月30日23時30分の時点で決めた200ポイント"
    >
      <T x={10} y={24} bold fs={12}>
        2026年
      </T>
      <rect x={tx(0, 0)} y={40} width={tx(4, 0) - tx(0, 0)} height={18} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
      <T x={(tx(0, 0) + tx(4, 0)) / 2} y={49} anchor="middle" fs={11}>
        ブラックフライデー 2倍（11/27 0:00 〜 12/1 0:00 の前まで）
      </T>
      <line x1={tx(3, 23.5)} y1={30} x2={tx(3, 23.5)} y2={88} stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={tx(3, 23.5) - 6} y={24} anchor="end" fs={11} tone="acc">
        注文 11/30 23:30（5,000円）
      </T>
      <line x1={110} y1={88} x2={740} y2={88} stroke="var(--fig-line)" strokeWidth={1.5} />
      <line x1={110} y1={230} x2={740} y2={230} stroke="var(--fig-line)" strokeWidth={1.5} />
      {days.map((d, i) => (
        <g key={d}>
          <line x1={tx(i, 0)} y1={82} x2={tx(i, 0)} y2={94} stroke="var(--fig-line)" />
          <T x={tx(i, 0)} y={106} anchor="middle" fs={11} tone="muted">
            {d}
          </T>
          <line x1={tx(i, 0)} y1={224} x2={tx(i, 0)} y2={236} stroke="var(--fig-line)" />
          <T x={tx(i, 0)} y={248} anchor="middle" fs={11} tone="muted">
            {d}
          </T>
        </g>
      ))}
      {jobs.map((j) => (
        <g key={j.no}>
          <circle cx={j.x} cy={88} r={5} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={2} />
          <T x={j.lx} y={128} anchor={j.anchor} fs={11} bold>
            {j.label}
          </T>
          <line x1={j.x} y1={94} x2={j.x} y2={230} stroke="var(--fig-line)" strokeDasharray="3 4" />
          <T x={j.ya === 'end' ? j.x - 4 : j.x + 4} y={j.ly} anchor={j.ya} fs={11}>
            {j.no}の1年前
          </T>
        </g>
      ))}
      <T x={10} y={168} bold fs={12}>
        2025年
      </T>
      <line x1={order2025} y1={176} x2={order2025} y2={230} stroke="var(--fig-line)" strokeWidth={3} />
      <T x={order2025 + 6} y={170} fs={11}>
        3,000円の注文（12/1 18:00）
      </T>
      <T x={10} y={272} fs={11} tone="muted">
        破線より右（後）の注文が、過去1年の購入額に入る。③の1年前は 3,000円の注文より後なので、合計から外れる
      </T>
      <T x={20} y={302} bold fs={12}>
        付いたポイント
      </T>
      <T x={20} y={326} fs={12}>
        ① 11/30 23:45 に動く：1年間 30,000円 → シルバー 2%、キャンペーン中 → 200 ポイント
      </T>
      <T x={20} y={348} fs={12} tone="danger">
        ② 12/1 9:00 に動く：1年間 30,000円 → シルバー 2%、キャンペーンの後 → 100 ポイント
      </T>
      <T x={20} y={370} fs={12} tone="danger">
        ③ 12/2 10:00 に動く：1年間 27,000円 → レギュラー 1%、キャンペーンの後 → 50 ポイント
      </T>
      <T x={20} y={400} fs={12} tone="acc">
        正しい値は、注文した 11/30 23:30 の時点で決めた 200 ポイント
      </T>
    </Svg>
  )
}

/* ---------- 図 59-3 純粋な計算と副作用の位置 ---------- */
const beforeLines: [string, string, string, boolean][] = [
  ['①', 'member', 'SELECT members', true],
  ['②', '1.year.ago...Time.current', '時計を読む', true],
  ['③', '.where(…).sum(:total)', 'SELECT SUM(orders)', true],
  ['④', 'if past_total >= 100_000 …', 'ランクを決める', false],
  ['⑤', 'total * RATES[rank] / 100', '基本のポイント', false],
  ['⑥', 'Campaign.where(…Time.current…)', '時計・SELECT campaigns', true],
  ['⑦', '[base * (m - 1), BONUS_CAP].min', 'ボーナス', false],
  ['⑧', 'create_point_entry!(…)', 'INSERT point_entries', true],
]

function SideEffectsFigure() {
  return (
    <Svg
      id="59-3"
      w={780}
      h={400}
      label="左は直す前の award_points! を上から順に並べたもの。① member で SELECT members、② 1.year.ago と Time.current で時計を読む、③ sum で SELECT SUM、④ ランクを決める計算、⑤ 基本のポイントの計算、⑥ Campaign.where で時計を読んで SELECT campaigns、⑦ ボーナスの計算、⑧ create_point_entry! で INSERT。計算の行（④⑤⑦）が読み取りの行の間にある。右は直した後で、シェルが①②③⑥を ordered_at を基準に Member#purchase_total_before と Campaign.covering で読み、値をコアの PointCalculation.calculate に渡し、コアが④⑤⑦を計算して Result を返し、シェルが⑧の create_point_entry! で書く"
    >
      <T x={20} y={20} bold>
        直す前：award_points! の中の順序
      </T>
      {beforeLines.map(([no, code, desc, effect], i) => (
        <g key={no}>
          <Box x={20} y={36 + i * 38} w={420} h={30} fill={effect ? 'box4' : 'box'} accent={!effect} />
          <T x={32} y={51 + i * 38} fs={12} bold={!effect}>
            {no}
          </T>
          <T x={56} y={51 + i * 38} fs={11} mono>
            {code}
          </T>
          <T x={300} y={51 + i * 38} fs={11} tone={effect ? 'muted' : undefined} bold={!effect}>
            {desc}
          </T>
        </g>
      ))}
      <T x={20} y={352} fs={12} tone="danger">
        計算の行が、読み取りの行の間にある
      </T>
      <T x={480} y={20} bold>
        直した後：シェル → コア → シェル
      </T>
      <Box
        x={480}
        y={36}
        w={280}
        h={88}
        lines={['シェル：読む（① ② ③ ⑥）', '基準の時刻は ordered_at', 'Member#purchase_total_before', 'Campaign.covering']}
        fs={12}
        fill="box4"
        bold
        subTone="muted"
      />
      <Arrow x1={620} y1={124} x2={620} y2={150} />
      <T x={630} y={137} fs={11} tone="muted">
        値を渡す
      </T>
      <Box
        x={480}
        y={152}
        w={280}
        h={76}
        lines={['コア：計算する（④ ⑤ ⑦）', 'PointCalculation.calculate', '値を受け取り、Result を返す']}
        fs={12}
        fill="box5"
        accent
        bold
        subTone="muted"
      />
      <Arrow x1={620} y1={228} x2={620} y2={254} dashed />
      <T x={630} y={241} fs={11} tone="muted">
        Result が返る
      </T>
      <Box x={480} y={256} w={280} h={56} lines={['シェル：書く（⑧）', 'create_point_entry!']} fs={12} fill="box4" bold subTone="muted" />
      <T x={480} y={352} fs={12} tone="acc">
        読み取りは最初に、書き込みは最後に集める
      </T>
      <T x={20} y={384} fs={11} tone="muted">
        色付きの箱は副作用（DB・時計）、強調の枠は計算。実線の矢印は値の受け渡し、破線は戻り値
      </T>
    </Svg>
  )
}

/* ---------- 図 59-4 コアと2つのシェル ---------- */
function CoreShellsFigure() {
  return (
    <Svg
      id="59-4"
      w={780}
      h={410}
      label="中央にコア PointCalculation（純粋な関数、calculate が Result を返す）がある。左のシェル Order#award_points! は AwardPointsJob から呼ばれ、基準の時刻は ordered_at。右のシェル CartsController#show は GET /cart で呼ばれ、基準の時刻は Time.current。どちらのシェルも、基準の時刻を Member#purchase_total_before(time) と Campaign.covering(time) に渡して MySQL から値を読み、コアに渡して Result を受け取る。左のシェルは結果を point_entries に INSERT し、右のシェルは見込みの文言を render plain で返す。コアは1つで、どの時刻の値を読むかと、結果をどう使うかはシェルごとに決める"
    >
      <Box x={20} y={14} w={230} h={36} lines="AwardPointsJob（発送の後）" fs={12} />
      <Box x={530} y={14} w={230} h={36} lines="GET /cart（カートの画面）" fs={12} />
      <Arrow x1={135} y1={50} x2={135} y2={88} />
      <Arrow x1={645} y1={50} x2={645} y2={88} />
      <Box x={20} y={90} w={230} h={76} lines={['Order#award_points!', 'シェル：ポイントを付与する', '基準の時刻：ordered_at']} fs={12} bold subTone="muted" />
      <Box x={530} y={90} w={230} h={76} lines={['CartsController#show', 'シェル：見込みを表示する', '基準の時刻：Time.current']} fs={12} bold subTone="muted" />
      <Box x={290} y={90} w={200} h={76} lines={['PointCalculation', 'コア（純粋な関数）', 'calculate → Result']} fs={12} fill="box5" accent bold subTone="muted" />
      <Arrow x1={250} y1={114} x2={288} y2={114} />
      <Arrow x1={290} y1={142} x2={252} y2={142} dashed />
      <Arrow x1={530} y1={114} x2={492} y2={114} />
      <Arrow x1={490} y1={142} x2={528} y2={142} dashed />
      <Box x={290} y={210} w={200} h={56} lines={['purchase_total_before(time)', 'Campaign.covering(time)']} fs={11} fill="box2" mono />
      <Arrow x1={190} y1={166} x2={288} y2={226} />
      <Arrow x1={590} y1={166} x2={492} y2={226} />
      <Box x={320} y={306} w={140} h={36} lines="MySQL" fs={12} fill="box4" bold />
      <Arrow x1={390} y1={266} x2={390} y2={304} />
      <Box x={20} y={306} w={200} h={36} lines="INSERT point_entries" fs={11} fill="box4" mono />
      <Arrow x1={80} y1={166} x2={80} y2={304} />
      <Box x={560} y={306} w={200} h={36} lines="render plain:（見込みの文言）" fs={11} fill="box4" />
      <Arrow x1={700} y1={166} x2={700} y2={304} />
      <T x={20} y={372} fs={12}>
        コアは1つ。どの時刻の値を読むかと、結果をどう使うか（保存・表示）は、シェルごとに決める
      </T>
      <T x={20} y={396} fs={11} tone="muted">
        強調の枠はコア、色付きの箱は DB と外への出力。実線の矢印は呼び出し、破線は戻り値
      </T>
    </Svg>
  )
}

/* ---------- 図 59-5 直す前と後：計算を確かめる1件のテストに要るもの ---------- */
const beforeSteps: [string, string][] = [
  ['Member.create!', 'INSERT'],
  ['member.orders.create!（過去の注文）', 'INSERT'],
  ['Campaign.create!', 'INSERT'],
  ['member.orders.create!（付与する注文）', 'INSERT'],
  ['travel_to(ordered_at)', '時計を差し替える'],
  ['order.award_points!', 'SELECT 3回・INSERT'],
  ['order.point_entry.points', '保存した行を読む'],
]
// 実行時間の棒。1秒 = 400px
const bars = [
  { y: 318, label: '直す前（8件）', load: 0.8, run: 0.17, text: '読み込み 0.80秒 + 実行 0.17秒' },
  { y: 352, label: '直した後（9件）', load: 0.08, run: 0.002, text: '読み込み 0.08秒 + 実行 0.002秒' },
]

function TestCompareFigure() {
  return (
    <Svg
      id="59-5"
      w={780}
      h={428}
      label="直す前に award_points! の計算を1件確かめるには、Member.create!、過去の注文の create!、Campaign.create!、付与する注文の create! の4回の INSERT、travel_to で時計の差し替え、award_points! の実行（SELECT 3回と INSERT）、保存した point_entry の読み直しが要る。直した後は、PointCalculation.calculate に total、past_year_total、campaigns の値を渡し、points を期待する値と比べるだけで、DB・時計・Rails を使わない。読み取りの時刻と保存は、シェルのテスト3件で確かめる。実行時間は、直す前の8件が読み込み0.80秒と実行0.17秒、直した後のコアの9件が読み込み0.08秒と実行0.002秒"
    >
      <T x={20} y={18} bold>
        直す前：award_points! の1件のテスト
      </T>
      {beforeSteps.map(([label, note], i) => (
        <g key={label}>
          <Box x={20} y={34 + i * 36} w={380} h={30} fill="box4" />
          <T x={32} y={49 + i * 36} fs={11} mono>
            {label}
          </T>
          <T x={390} y={49 + i * 36} anchor="end" fs={11} tone="muted">
            {note}
          </T>
        </g>
      ))}
      <T x={420} y={18} bold>
        直した後：PointCalculation の1件のテスト
      </T>
      <Box x={420} y={34} w={340} h={48} lines={['PointCalculation.calculate(', '  total:, past_year_total:, campaigns:)']} fs={11} accent mono align="start" />
      <Box x={420} y={94} w={340} h={30} lines=".points を期待する値と比べる" fs={11} accent />
      <T x={420} y={148} fs={12} tone="acc">
        DB・時計・Rails を使わない
      </T>
      <T x={420} y={172} fs={11} tone="muted">
        読み取りの時刻と保存は、シェルのテスト（3件）で確かめる
      </T>
      <line x1={10} y1={290} x2={770} y2={290} stroke="var(--fig-line)" />
      <T x={20} y={304} fs={12} bold>
        実行時間（bundle exec rspec の Finished の行）
      </T>
      {bars.map((b) => (
        <g key={b.label}>
          <T x={20} y={b.y + 9} fs={12}>
            {b.label}
          </T>
          <rect x={150} y={b.y} width={b.load * 400} height={18} fill="var(--fig-box)" stroke="var(--fig-line)" />
          <rect x={150 + b.load * 400} y={b.y} width={Math.max(b.run * 400, 2)} height={18} fill="var(--fig-box4)" stroke="var(--fig-line)" />
          <T x={150 + (b.load + b.run) * 400 + 10} y={b.y + 9} fs={11}>
            {b.text}
          </T>
        </g>
      ))}
      <rect x={20} y={388} width={14} height={12} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={40} y={394} fs={11} tone="muted">
        読み込み（files took の値。直す前は Rails・rails_helper・MySQL の接続を含む）
      </T>
      <rect x={20} y={406} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={40} y={412} fs={11} tone="muted">
        実行（Finished in の値）。どちらも環境で変わる
      </T>
    </Svg>
  )
}

/* ---------- 図 59-7 どこまでをコアに入れるか ---------- */
const cells = [
  { x: 150, y: 48, lines: ['SQL のまま書く', 'DB を使うテストで確かめる', '例：一覧の検索・並べ替え'], fill: 'box2' as const },
  { x: 460, y: 48, lines: ['SQL で絞り・集計し、結果をコアに渡す', '絞り込みの境界はシェルのテストで確かめる', '例：過去1年の購入額 → 整数1つ'], fill: 'box2' as const },
  { x: 150, y: 194, lines: ['シェルにそのまま書く', 'コアを作っても確かめる規則がない', '例：発送した日時を保存する'], fill: 'box2' as const },
  { x: 460, y: 194, lines: ['コアに分ける', '値を受け取り、値を返す関数にする', '例：ランク・率・ボーナスの上限'], fill: 'box5' as const },
]

function JudgeFigure() {
  return (
    <Svg
      id="59-7"
      w={780}
      h={430}
      label="横の軸は計算と判定の規則の数（分岐・境界・組み合わせ）、縦の軸は計算に必要なデータの量。規則が少なくデータが少ない処理は、シェルにそのまま書く（例は発送した日時を保存する。コアを作っても確かめる規則がない）。規則が多くデータが少ない処理は、コアに分け、値を受け取り値を返す関数にする（例はランク・率・ボーナスの上限）。規則が少なくデータが多い処理は、SQL のまま書き、DB を使うテストで確かめる（例は一覧の検索・並べ替え）。規則が多くデータも多い処理は、SQL で絞り・集計して、結果の値をコアに渡し、絞り込みの境界はシェルのテストで確かめる（例は過去1年の購入額を整数1つにして渡す）。この場合に全件を読み込んでコアで絞るのは当てはめすぎ"
    >
      <Arrow x1={140} y1={340} x2={770} y2={340} />
      <Arrow x1={140} y1={340} x2={140} y2={36} />
      {cells.map((c) => (
        <Box key={c.lines[0]} x={c.x} y={c.y} w={300} h={140} lines={c.lines} fs={12} fill={c.fill} bold subTone="muted" accent={c.fill === 'box5'} />
      ))}
      <T x={472} y={174} fs={11} tone="danger">
        全件を読み込んでコアで絞るのは当てはめすぎ
      </T>
      <T x={128} y={56} anchor="end" fs={11} tone="muted">
        多い
      </T>
      <T x={128} y={326} anchor="end" fs={11} tone="muted">
        少ない
      </T>
      <T x={16} y={176} fs={12} bold>
        計算に必要な
      </T>
      <T x={16} y={194} fs={12} bold>
        データの量
      </T>
      <T x={150} y={356} fs={11} tone="muted">
        少ない
      </T>
      <T x={760} y={356} anchor="end" fs={11} tone="muted">
        多い
      </T>
      <T x={455} y={380} anchor="middle" fs={12} bold>
        計算と判定の規則の数（分岐・境界・組み合わせ）
      </T>
      <T x={20} y={414} fs={11} tone="muted">
        強調の枠は、この章でコアに移した部分。右上は、この章の過去1年の購入額のように、集計した値だけをコアに渡す
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 78,
  part: 8,
  title: 'Functional Core, Imperative Shell：ポイントの計算を DB と現在時刻から切り離す',
  summary:
    'EC サイトの注文に付けるポイントを、会員のランクとキャンペーンで計算する処理を例にします。計算が DB と Time.current を読みながら進むため、ジョブが遅れて動くと付くポイントが変わり、計算を確かめるテストにはレコードの作成と時刻の固定が要る場面から始めます。Gary Bernhardt の2012年のスクリーンキャストで原則の意味を確かめ、計算を値だけを受け取るモジュールに分け、どの時刻の値を読むかをシェルで決めます。',
  goals: [
    '計算の途中で DB と現在時刻を読むコードが、実行した時刻で結果を変え、テストを重くする理由を説明できる',
    'Functional Core, Imperative Shell の定義と由来、命令と問い合わせの分離・ヘキサゴナルアーキテクチャとの違いを説明できる',
    'モデルのメソッドから計算をコアのモジュールに取り出し、モデルのメソッドを読み込みと保存のシェルとして残せる',
    '現在時刻ではなく、業務の規則が決める時刻（注文した時刻など）をシェルで選び、その時点の値をコアに渡せる',
    'SQL の絞り込みと集計をシェルに残し、集計した値をコアに渡す判断ができる',
    'コアのテストを rails_helper なしで書き、シェルのテストを少数の統合テストにする分担を説明できる',
  ],
  prerequisites: [18, 45],
  sections: [
    {
      id: 'scene',
      title: 'ジョブが遅れて動くと、同じ注文に付くポイントが変わる',
      body: (
        <>
          <p>
            この章では注文に付けるポイントの計算を例に、<Term en="Functional Core, Imperative Shell">Functional Core, Imperative Shell</Term>（以下 FCIS）を扱います。FCIS は計算と判定の処理と、DB の読み書きや現在時刻の読み取りのような処理を分ける原則です。計算と判定を、DB も時刻の固定も使わずに独立してテストできるようにします。まず、2つが混ざったコードを動かして、何が起きるかを確かめます。
          </p>
          <h3>そもそも何をする業務か</h3>
          <p>EC サイトでは注文の支払額に応じてポイントを付け、会員は次の買い物でそのポイントを代金に使えます。この章のサイトでは次の規則でポイントを計算します。</p>
          <ul>
            <li>会員のランクは注文した時点より前の1年間の購入額の合計で決まります。10万円以上ならゴールド、3万円以上ならシルバー、それ以外はレギュラーです。</li>
            <li>基本のポイントは支払額にランクの率（ゴールド3%、シルバー2%、レギュラー1%）を掛けた値で、1ポイント未満は切り捨てます。</li>
            <li>
              注文した時点でキャンペーンの期間中なら、ボーナスを足します。「2倍」のキャンペーンなら、基本のポイントと同じ量を足します。ボーナスは1注文につき1,000ポイントまでで、キャンペーンが重なったときは倍率の最も高い1つだけを使います。
            </li>
            <li>ポイントは商品を発送したときに付けます。ランクとキャンペーンは注文した時点で決まり、発送が遅れても変わりません。</li>
          </ul>
          <p>
            発送の処理は注文を発送済みにした後、ポイントを付けるジョブ AwardPointsJob を <code>perform_later</code> でキューに入れます。ジョブは Sidekiq のワーカーがキューから取り出して実行するので、実行されるのはキューに入れた時刻より後です。キューが混んでいるときや、失敗して再試行されたときは、さらに遅れます（ジョブの再試行は<ChapterLink n={18} section="retry" />で扱いました）。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000001_create_point_tables.rb"
            code={`
class CreatePointTables < ActiveRecord::Migration[8.1]
  def change
    create_table :members do |t|
      t.string :name, null: false
    end
    create_table :orders do |t|
      t.references :member, null: false, foreign_key: true
      t.integer :total, null: false        # 支払額（円）
      t.datetime :ordered_at, null: false  # 注文した日時
    end
    add_index :orders, [:member_id, :ordered_at]
    create_table :campaigns do |t|
      t.string :name, null: false
      t.integer :multiplier, null: false   # ポイントの倍率（2 なら 2倍）
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false     # この時刻を含まない
    end
    create_table :point_entries do |t|
      t.references :member, null: false, foreign_key: true
      t.references :order, null: false, foreign_key: true, index: { unique: true }
      t.integer :points, null: false
      t.string :description, null: false
    end
  end
end
`}
          />
          <h3>直す前のコード</h3>
          <p>
            ポイントの計算は Order のメソッド <code>award_points!</code> に書かれていて、ジョブはこのメソッドを呼ぶだけです。Member と PointEntry には関連の定義だけがあり、Campaign にはメソッドがありません。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直す前）"
            code={`
class Order < ApplicationRecord
  belongs_to :member
  has_one :point_entry

  RATES = { gold: 3, silver: 2, regular: 1 }.freeze # 購入額に対するポイントの率（%）
  BONUS_CAP = 1_000                                  # キャンペーンのボーナスの上限（1注文あたり）

  # 発送したときに AwardPointsJob から呼ぶ。ポイントを計算して付与する
  def award_points!
    past_total = member.orders.where(ordered_at: 1.year.ago...Time.current).where.not(id:).sum(:total)
    rank = if past_total >= 100_000 then :gold
           elsif past_total >= 30_000 then :silver
           else :regular
           end
    base = total * RATES[rank] / 100

    campaign = Campaign.where("starts_at <= ? AND ends_at > ?", Time.current, Time.current).order(multiplier: :desc).first
    bonus = campaign ? [base * (campaign.multiplier - 1), BONUS_CAP].min : 0

    create_point_entry!(member:, points: base + bonus,
                        description: "#{rank} #{RATES[rank]}%#{" + #{campaign.name}" if campaign}")
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/jobs/award_points_job.rb"
            code={`
# 発送の処理から perform_later で呼ばれ、注文のポイントを付与する
class AwardPointsJob < ApplicationJob
  def perform(order)
    order.award_points!
  end
end
`}
          />
          <p>
            <code>award_points!</code> は、関連 <code>member</code> から過去1年の注文を合計してランクと率を決め、期間中のキャンペーンを探してボーナスを計算し、<code>create_point_entry!</code> で保存します。「過去1年」と「期間中」は、どちらも <code>Time.current</code> を基準にしています（<code>1.year.ago</code> も現在時刻から1年前を計算します）。
          </p>
          <Figure n="59-1" title="ポイントの付与の構成と、問題が起きる箇所" caption="赤い文字は、次の項で確かめる問題。">
            <SceneFigure />
          </Figure>
          <p>
            図 59-1 はジョブから呼ばれる <code>award_points!</code> が何を読み、何を書くかを示したものです。ランクと率、ボーナスの計算（②④）は、orders と campaigns の読み取り、時計の読み取り、point_entries への保存の間にあります。
          </p>
          <p>
            このようなコードは、付与の時期を後から変えたときにできあがりやすい形です。たとえば、最初は注文を受け付けたリクエストの中で <code>award_points!</code> を呼んでいたとします。このときは <code>Time.current</code> が注文した時刻とほぼ同じなので、規則どおりの結果になります。その後、取り消された注文にポイントを付けないように、付与を発送のときのジョブに移しました。メソッドの中身は変えていないので、<code>Time.current</code> が指す時刻だけが「注文した時刻」から「ジョブが動いた時刻」に変わりました。
          </p>
          <h3>動かして確かめる</h3>
          <p>
            会員の佐藤さんが2026年11月30日23時30分に5,000円の注文をしたとします。佐藤さんの過去の注文は2025年12月1日18時の3,000円と、2026年6月15日の27,000円で、注文した時点より前の1年間の合計は30,000円です。キャンペーン「ブラックフライデー 2倍」は、11月27日0時から12月1日0時の前までです。規則どおりに計算すると、シルバーの2%で基本は100ポイント、2倍のボーナスが100ポイントで、合計200ポイントが正しい値です。
          </p>
          <p>この注文のジョブが3つの時刻に動いた場合を比べるスクリプトを書きました。時刻は <code>travel_to</code> で固定しています。</p>
          <Code
            lang="ruby"
            title="script/data.rb"
            code={`
# 会員・過去の注文・キャンペーン・ポイントを付与する注文を作り直し、付与する注文を返す
def seed_order
  ActiveRecord::Base.connection.truncate_tables("point_entries", "orders", "campaigns", "members")
  member = Member.create!(name: "佐藤")
  member.orders.create!(total: 3_000, ordered_at: Time.zone.parse("2025-12-01 18:00"))
  member.orders.create!(total: 27_000, ordered_at: Time.zone.parse("2026-06-15 12:00"))
  Campaign.create!(name: "ブラックフライデー 2倍", multiplier: 2,
                   starts_at: Time.zone.parse("2026-11-27 00:00"), ends_at: Time.zone.parse("2026-12-01 00:00"))
  member.orders.create!(total: 5_000, ordered_at: Time.zone.parse("2026-11-30 23:30"))
end
`}
          />
          <Code
            lang="ruby"
            title="script/scene.rb"
            code={`
# 11月30日 23時30分の注文のポイントを、ジョブが動いた時刻ごとに計算する
require "active_support/testing/time_helpers"
require_relative "data"
include ActiveSupport::Testing::TimeHelpers

["2026-11-30 23:45", "2026-12-01 09:00", "2026-12-02 10:00"].each do |at|
  order = seed_order
  travel_to(Time.zone.parse(at)) { AwardPointsJob.perform_now(order) }
  entry = order.reload.point_entry
  puts "ジョブが #{at} に動いた → #{entry.points} ポイント（#{entry.description}）"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb）"
            code={`
ジョブが 2026-11-30 23:45 に動いた → 200 ポイント（silver 2% + ブラックフライデー 2倍）
ジョブが 2026-12-01 09:00 に動いた → 100 ポイント（silver 2%）
ジョブが 2026-12-02 10:00 に動いた → 50 ポイント（regular 1%）
`}
          />
          <Figure n="59-2" title="ジョブが動いた時刻と、付いたポイント" caption="上は2026年、下は同じ月日の2025年。破線は各ジョブの時刻とその1年前を結ぶ。">
            <TimelineFigure />
          </Figure>
          <p>図 59-2 のとおり、同じ注文なのに、ジョブが動いた時刻で付くポイントが変わりました。</p>
          <ul>
            <li>①はジョブが注文の15分後に動いたので、注文した時点とほぼ同じ値で計算され、200ポイントになりました。</li>
            <li>②は12月1日9時に動きました。キャンペーンは12月1日0時に終わっているので、ボーナスが付かず100ポイントです。発送の作業が翌朝に始まるなら、キャンペーンの最終日の夜の注文は、どれもこうなります。</li>
            <li>
              ③は12月2日10時に動きました。「1年前」が2025年12月2日10時になり、2025年12月1日18時の3,000円の注文が合計から外れて27,000円になりました。ランクがレギュラーに下がり、50ポイントです。
            </li>
          </ul>
          <p>①の時刻で、<code>award_points!</code> が実行した SQL を並べると、基準の時刻がどこで決まっているかが分かります。</p>
          <Code
            lang="ruby"
            title="script/sql_log.rb"
            code={`
# award_points! の中で実行される SQL を並べる
require "active_support/testing/time_helpers"
require_relative "data"
include ActiveSupport::Testing::TimeHelpers

order = Order.find(seed_order.id) # 関連を読み込んでいない状態から始める
sqls = []
log = ->(*, payload) { sqls << payload[:sql].squish.sub(%r{ /\\*.*\\*/\\z}, "") unless payload[:name] == "SCHEMA" }
travel_to(Time.zone.parse("2026-11-30 23:45")) do
  ActiveSupport::Notifications.subscribed(log, "sql.active_record") { order.award_points! }
end
sqls.each { |sql| puts sql }
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/sql_log.rb）"
            code={`
SELECT \`members\`.* FROM \`members\` WHERE \`members\`.\`id\` = 1 LIMIT 1
SELECT SUM(\`orders\`.\`total\`) FROM \`orders\` WHERE \`orders\`.\`member_id\` = 1 AND \`orders\`.\`ordered_at\` >= '2025-11-30 14:45:00' AND \`orders\`.\`ordered_at\` < '2026-11-30 14:45:00' AND \`orders\`.\`id\` != 3
SELECT \`campaigns\`.* FROM \`campaigns\` WHERE (starts_at <= '2026-11-30 14:45:00' AND ends_at > '2026-11-30 14:45:00') ORDER BY \`campaigns\`.\`multiplier\` DESC LIMIT 1
BEGIN
INSERT INTO \`point_entries\` (\`member_id\`, \`order_id\`, \`points\`, \`description\`) VALUES (1, 3, 200, 'silver 2% + ブラックフライデー 2倍')
COMMIT
SELECT \`point_entries\`.* FROM \`point_entries\` WHERE \`point_entries\`.\`order_id\` = 3 LIMIT 1
`}
          />
          <p>
            datetime の列は UTC で保存されます（<code>config.active_record.default_timezone</code> の既定は <code>:utc</code><Ref n={1} />）。SQL の '2026-11-30 14:45:00' は日本時間の11月30日23時45分で、ジョブが動いた時刻です。注文した23時30分ではありません。1行目は関連 <code>member</code> の読み込み、2行目と3行目が合計とキャンペーンの読み取り、その後が保存です。最後の SELECT は、<code>create_point_entry!</code> が保存の後で、この注文に前からポイントの行があるかを確かめるために実行します<Ref n={2} />。
          </p>
          <h3>テストを書く</h3>
          <p>ランクの境界とキャンペーンの組み合わせを、このメソッドに対して確かめるテストです。</p>
          <Code
            lang="ruby"
            title="before/spec/order_award_points_spec.rb（直す前のコードのテスト）"
            code={`
require "rails_helper"

# 直す前の Order#award_points! のテスト。ランクの境界とキャンペーンの組み合わせを確かめる
RSpec.describe "Order#award_points!（直す前）" do
  include ActiveSupport::Testing::TimeHelpers

  let(:ordered_at) { Time.zone.parse("2026-11-30 23:30") }

  [
    ["レギュラー（29,999円）", 29_999, [], 5_000, 50],
    ["シルバー（30,000円）", 30_000, [], 5_000, 100],
    ["シルバー（99,999円）", 99_999, [], 5_000, 100],
    ["ゴールド（100,000円）", 100_000, [], 5_000, 150],
    ["レギュラー・2倍", 0, [2], 5_000, 100],
    ["シルバー・2倍", 30_000, [2], 5_000, 200],
    ["シルバー・2倍と3倍が重なる", 30_000, [2, 3], 5_000, 300],
    ["ゴールド・2倍で上限に届く", 100_000, [2], 50_000, 2_500],
  ].each do |label, past_total, multipliers, total, expected|
    it "#{label}なら #{expected} ポイント" do
      member = Member.create!(name: "佐藤")
      member.orders.create!(total: past_total, ordered_at: ordered_at - 30.days) if past_total.positive?
      multipliers.each do |m|
        Campaign.create!(name: "#{m}倍", multiplier: m, starts_at: ordered_at - 3.days, ends_at: ordered_at + 1.day)
      end
      order = member.orders.create!(total:, ordered_at:)

      travel_to(ordered_at) { order.award_points! }

      expect(order.point_entry.points).to eq expected
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（直す前のコードで bundle exec rspec before/spec/order_award_points_spec.rb）"
            code={`
........

Finished in 0.16747 seconds (files took 0.79845 seconds to load)
8 examples, 0 failures
`}
          />
          <p>8件とも通りました。それでも、このテストには次の点があります。</p>
          <ul>
            <li>1件ごとに、会員・過去の注文・キャンペーン・付与する注文を DB に作り、時刻を固定し、保存されたポイントを読み直しています。計算の結果がメソッドの戻り値ではなく、point_entries の行としてしか外に出てこないからです。</li>
            <li>実行は0.17秒でしたが、その前の読み込み（Rails・rails_helper・MySQL への接続）に0.80秒かかりました。ランクの境界やキャンペーンの組み合わせを足すたびに、DB に作るレコードも増えます。</li>
            <li>どのテストも <code>travel_to(ordered_at)</code> で「注文した時刻にジョブが動いた」場合だけを確かめているので、前の項の②と③は見つかりません。</li>
          </ul>
          <h3>このコードの問題</h3>
          <ul>
            <li>ランクの境界・率・ボーナスの上限という計算の規則が、SQL・時計の読み取り・保存の間に書かれていて、計算だけを呼び出せません。</li>
            <li>どの時刻の値で計算するかが、コードのどこにも書かれていません。<code>Time.current</code> を2か所で読んでいるので、結果はジョブが動いた時刻で決まります。</li>
            <li>カートの画面に「この注文で付くポイントの見込み」を出したくなっても、このメソッドは保存までするので使えません。同じ規則を画面のために書き写すことになります。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'Functional Core, Imperative Shell の意味と由来',
      body: (
        <>
          <h3>FCIS の定義</h3>
          <p>
            FCIS は純粋なビジネスロジックと、副作用を伴う処理を分ける原則です。計算と判定を受け持つ部分を<Term en="functional core">コア</Term>と呼び、値を受け取って値を返すだけにします。DB・時計・外部のサービスとのやり取りは、その外側の<Term en="imperative shell">シェル</Term>にまとめます。こうすると、計算と判定の処理を、DB も時刻の固定も使わずに独立してテストできます。
          </p>
          <p>
            ここでの「純粋」は<Term en="pure function">純粋な関数</Term>の性質のことです。純粋な関数は同じ引数を渡せば必ず同じ結果を返し、関数の外のものを変えません。たとえば、支払額5,000円とシルバーを渡せば、いつ呼んでも100ポイントを返す関数です。<Term en="side effect">副作用</Term>は値を返す以外に関数の外へ影響する動作で、DB への書き込み、メールの送信、外部の API の呼び出しなどです。この章では <ChapterLink n={45} section="idea" /> と同じく、DB の値や現在時刻のように関数の外にあるものを読む処理も副作用に含めます。同じ引数で呼んでも、読んだ時点によって結果が変わるからです。前の節の <code>award_points!</code> では、<code>member</code>・<code>Time.current</code>・<code>sum</code>・<code>Campaign.where</code>・<code>create_point_entry!</code> が副作用です。
          </p>
          <Figure n="59-3" title="純粋な計算と副作用の位置" caption="左は前の節の award_points!、右は次の節で直した後の形。番号は左右で同じ処理を指す。">
            <SideEffectsFigure />
          </Figure>
          <p>
            図 59-3 の左は前の節の <code>award_points!</code> を上から順に並べたものです。計算の行（④⑤⑦）が読み取りの行（①②③⑥）の間にあります。右は FCIS に沿って並べ直した形で、読み取りをシェルの最初に、書き込みを最後に集め、その間でコアを1回だけ呼びます。左のままでは、④⑤⑦だけを呼び出す方法がありません。
          </p>
          <h3>Gary Bernhardt のスクリーンキャスト</h3>
          <p>
            この名前は、Gary Bernhardt が Destroy All Software で2012年7月12日に公開したスクリーンキャストの題名です。Ruby 1.9.3 で書かれた Twitter のクライアントを例にしています。ツイートの管理、受け取ったタイムラインとの同期、一覧の中のカーソルの位置の記憶、表示用の文字列の作成を関数型のコアで行い、その周りの命令型のシェルが、コアの作った値に基づいて標準入出力・データベース・ネットワークを操作します<Ref n={3} />。スクリーンキャストの紹介文は次のように説明しています。
          </p>
          <blockquote>
            純粋な関数型のコードは、値が変わらないので、関数を呼んでも戻り値だけを気にすればよく、関数の外は何も変わらない。そのため理解しやすくなる部分がある。しかしそのままでは、データベースや画面への書き込みをどう書くかが問題になり、多くの実用のアプリケーションは書きにくい。（中略）この設計には多くの利点がある。たとえば、関数型の部分のテストがとても簡単になり、多くの場合、テストダブルを使わずに単独でテストできる。また、条件分岐の少ない命令型のシェルになり、時間とともに変わるプログラムの状態を考えやすくなる。（スクリーンキャストの紹介文から訳した）
          </blockquote>
          <p>
            依頼の定義にある「計算・判定処理を独立してテストできるようにする」は、紹介文の「テストダブルを使わずに単独でテストできる」に当たります。<Term en="test double">テストダブル</Term>は、テストで本物の代わりに渡すオブジェクトです。コアが DB も時計も使わなければ、代わりのオブジェクトを用意する必要がありません。
          </p>
          <p>
            Bernhardt は同じ2012年の SCNA の講演「Boundaries」で、単純な値を、データを持つためだけでなく、コンポーネントやサブシステムの境界として使う考え方を説明し、講演の最後でこのスクリーンキャストを紹介しています<Ref n={4} />。コアとシェルの間を、Active Record のオブジェクトではなく整数や Data の値で受け渡すのは、この考え方によります。
          </p>
          <h3>第9部の同じ名前の章との違い</h3>
          <p>
            FCIS は <ChapterLink n={45} /> でも設計パターンとして扱いました。その章ではプラン変更の判断（すぐに値上げする・期間の終わりに値下げする・受け付けない）を Data の値で返し、シェルが <code>case/in</code> で書き込みを選ぶ構成と、<code>Date.today</code> と <code>Date.current</code> のタイムゾーンの違いを詳しく扱いました。この章では原則を当てはめるときの次の2つの判断に絞ります。
          </p>
          <ul>
            <li>どの時刻の値で計算するかを、シェルで業務の規則から選ぶこと。基準の時刻は現在時刻とは限りません。</li>
            <li>副作用と計算の境目をどこに引くか。特に、SQL の絞り込みと集計をシェルに残し、集計した値をコアに渡すこと。</li>
          </ul>
          <h3>似た原則との違い</h3>
          <ul>
            <li>
              命令と問い合わせの分離（Command-Query Separation）：Bertrand Meyer が著書『Object Oriented Software Construction』で名付けた原則で、オブジェクトのメソッドを、状態を変えずに結果を返す問い合わせと、状態を変える命令に分けます<Ref n={5} />。<ChapterLink n={77} />（Tell, Don't Ask）でも、この分け方を扱いました。命令と問い合わせの分離はメソッド1つずつの性質を決め、FCIS はモジュールの構成を決めます。また、問い合わせのメソッドは DB を読んでもかまいませんが、FCIS のコアは DB も読みません。
            </li>
            <li>
              ヘキサゴナルアーキテクチャ（Ports and Adapters）：Alistair Cockburn が2005年に説明したパターンで、アプリケーションを UI やデータベースなしでも動かしてテストできるように、外部とのやり取りをポートとアダプターの向こうに置きます。アプリケーションは外へ送るものがあると、ポートを通じてアダプターに送ります<Ref n={6} />。つまり、アプリケーションの中に、副作用を起こす呼び出しが残ります。FCIS のコアは外へ何も送らず、送る内容を値で返し、送るのはシェルです。<ChapterLink n={67} />（DIP）で DB への依存を抽象に替えた場合も同じで、コアの中から抽象を通じて DB を呼べば、コアは純粋ではありません。
            </li>
            <li>
              <ChapterLink n={68} />（SoC）と <ChapterLink n={63} />（SRP）：どちらも処理を分ける原則ですが、何を軸に分けるかは場面ごとに決めます。FCIS は「副作用があるか」という1つの軸で分けます。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: '計算をコアに取り出し、どの時刻の値を読むかをシェルで決める',
      body: (
        <>
          <h3>手順1：計算を、値だけを受け取るモジュールに取り出す</h3>
          <p>まず、ランク・率・ボーナスの計算を、値だけを受け取るモジュール PointCalculation に移します。</p>
          <Code
            lang="ruby"
            title="app/models/point_calculation.rb"
            code={`
# Functional Core：ポイントの計算。引数の値だけから結果を決め、DB・現在時刻・設定を読まない
module PointCalculation
  Campaign = Data.define(:name, :multiplier)
  Result = Data.define(:rank, :rate, :base, :bonus, :campaign_name) do
    def points = base + bonus
  end

  RATES = { gold: 3, silver: 2, regular: 1 }.freeze # 購入額に対するポイントの率（%）
  BONUS_CAP = 1_000                                  # キャンペーンのボーナスの上限（1注文あたり）

  module_function

  # 過去1年間の購入額から会員のランクを決める
  def rank_for(past_year_total)
    if past_year_total >= 100_000 then :gold
    elsif past_year_total >= 30_000 then :silver
    else :regular
    end
  end

  # total：注文の支払額（円）、campaigns：注文した時点で期間中のキャンペーン（Campaign の配列）
  def calculate(total:, past_year_total:, campaigns:)
    rank = rank_for(past_year_total)
    rate = RATES.fetch(rank)
    base = total * rate / 100
    campaign = campaigns.max_by(&:multiplier) # 重なったときは倍率の高い1つだけ
    bonus = campaign ? [base * (campaign.multiplier - 1), BONUS_CAP].min : 0
    Result.new(rank:, rate:, base:, bonus:, campaign_name: campaign&.name)
  end
end
`}
          />
          <p>
            引数は支払額・過去1年の購入額・注文した時点で期間中のキャンペーンの3つです。キャンペーンも Active Record のオブジェクトではなく、名前と倍率だけを持つ値（<code>PointCalculation::Campaign</code>）で受け取ります。メソッドの中で DB も時計も読まないので、同じ引数ならいつ呼んでも同じ結果を返します。ランクの境界・率・ボーナスの上限・キャンペーンが重なったときの選び方という規則は、すべてこのファイルにあります。
          </p>
          <p>
            結果は <code>Data.define</code> で作った Result で返し、ランク・率・基本・ボーナスの内訳を持たせました。<code>Data</code> は決まった項目だけを持つ読み取り専用の値のクラスで、Ruby 3.2 で追加されました<Ref n={7} />。判断の種類を Data で表して <code>case/in</code> で分ける書き方は、<ChapterLink n={45} section="rails-impl" />で扱いました。このモジュールは Ruby の標準の機能だけで書いていて、Rails の機能を使っていません。
          </p>
          <h3>手順2：読み取りを、基準の時刻を受け取るメソッドにする</h3>
          <Code
            lang="ruby"
            title="app/models/member.rb・campaign.rb（直した後）"
            code={`
class Member < ApplicationRecord
  has_many :orders

  # time より前の1年間の購入額（time の注文は含めない）
  def purchase_total_before(time)
    orders.where(ordered_at: (time - 1.year)...time).sum(:total)
  end
end

class Campaign < ApplicationRecord
  # time の時点で期間中のキャンペーン（ends_at は含めない）
  scope :covering, ->(time) { where("starts_at <= ? AND ends_at > ?", time, time) }

  def to_value = PointCalculation::Campaign.new(name:, multiplier:)
end
`}
          />
          <p>
            直す前は、「過去1年」も「期間中」も <code>Time.current</code> を基準にしていました。直した後は、基準の時刻を引数 <code>time</code> で受け取ります。絞り込み（<code>where</code>）と合計（<code>sum</code>）は SQL のまま DB に任せ、結果の整数とキャンペーンの値だけをコアに渡します。<code>Campaign#to_value</code> は、Active Record のオブジェクトを、コアが使う値に変えるメソッドです。
          </p>
          <h3>手順3：Order のメソッドをシェルにする</h3>
          <Code
            lang="ruby"
            title="app/models/order.rb（直した後）"
            code={`
class Order < ApplicationRecord
  belongs_to :member
  has_one :point_entry

  # Imperative Shell：注文した時点の値を DB から読み、PointCalculation で計算し、結果を保存する
  def award_points!
    result = PointCalculation.calculate(
      total:,
      past_year_total: member.purchase_total_before(ordered_at),
      campaigns: Campaign.covering(ordered_at).map(&:to_value)
    )
    create_point_entry!(member:, points: result.points,
                        description: "#{result.rank} #{result.rate}%#{" + #{result.campaign_name}" if result.campaign_name}")
    result
  end
end
`}
          />
          <p>
            <code>award_points!</code> は、注文した時刻 <code>ordered_at</code> を基準に値を読み、コアを1回呼び、結果を保存して返します。メソッドの中に <code>Time.current</code> はありません。業務の規則は「ランクとキャンペーンは注文した時点で決まる」なので、基準の時刻は注文の <code>ordered_at</code> です。ジョブがいつ動いても、読む値は同じになります。注文そのものは範囲の終わり（<code>ordered_at</code> を含まない <code>...</code>）で合計から外れるので、直す前の <code>where.not(id:)</code> は要らなくなりました。
          </p>
          <p>
            シェルはサービスのクラスにせず、Order のメソッドのまま残しました。<ChapterLink n={45} /> ではシェルを ChangePlan というクラスにしましたが、シェルの仕事は「読む → コアを呼ぶ → 書く」を順に並べることなので、モデルのメソッドでも書けます。読み込みと保存の手順が増え、複数のモデルにまたがるようになったら、Use Case のクラス（<ChapterLink n={44} section="idea" />）に移します。
          </p>
          <h3>手順4：もう1つのシェルから同じコアを使う</h3>
          <p>カートの画面に、今注文したら付くポイントの見込みを表示します。</p>
          <Code
            lang="ruby"
            title="app/controllers/carts_controller.rb"
            code={`
# カートの画面：この注文で付くポイントの見込みを表示する（もう1つのシェル）
class CartsController < ApplicationController
  def show
    member = Member.find(params[:member_id]) # 実際はログイン中の会員
    total = Integer(params[:total])          # 実際はカートの中身から計算する
    now = Time.current                       # 今注文したら、という見込みなので現在時刻を使う

    result = PointCalculation.calculate(
      total:,
      past_year_total: member.purchase_total_before(now),
      campaigns: Campaign.covering(now).map(&:to_value)
    )
    render plain: "この注文で #{result.points} ポイント付きます（見込み）"
  end
end
`}
          />
          <p>
            見込みは「今注文したら」という意味なので、基準の時刻は現在時刻です。シェルが <code>Time.current</code> を1回だけ読み、同じ読み取りのメソッドとコアに渡します。コアは保存しないので、見込みの計算にそのまま使えます。ルーティングには <code>resource :cart, only: :show</code> を足しました。
          </p>
          <Figure n="59-4" title="コアと2つのシェル" caption="中央がコア。左右のシェルは、基準の時刻と結果の使い方だけが違う。">
            <CoreShellsFigure />
          </Figure>
          <p>
            図 59-4 のとおり、コアは1つで、シェルが2つあります。どちらのシェルも同じ読み取りのメソッドを使い、違うのは基準の時刻と、結果の使い方（保存か表示か）だけです。ランクの境界やボーナスの上限を変えるときは、PointCalculation だけを直せば、付与と見込みの両方が同じ規則になります。
          </p>
          <h3>動かして確かめる</h3>
          <p>前の節と同じ scene.rb と sql_log.rb を、直した後のコードで実行しました。</p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb）"
            code={`
ジョブが 2026-11-30 23:45 に動いた → 200 ポイント（silver 2% + ブラックフライデー 2倍）
ジョブが 2026-12-01 09:00 に動いた → 200 ポイント（silver 2% + ブラックフライデー 2倍）
ジョブが 2026-12-02 10:00 に動いた → 200 ポイント（silver 2% + ブラックフライデー 2倍）
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/sql_log.rb）"
            code={`
SELECT \`members\`.* FROM \`members\` WHERE \`members\`.\`id\` = 1 LIMIT 1
SELECT SUM(\`orders\`.\`total\`) FROM \`orders\` WHERE \`orders\`.\`member_id\` = 1 AND \`orders\`.\`ordered_at\` >= '2025-11-30 14:30:00' AND \`orders\`.\`ordered_at\` < '2026-11-30 14:30:00'
SELECT \`campaigns\`.* FROM \`campaigns\` WHERE (starts_at <= '2026-11-30 14:30:00' AND ends_at > '2026-11-30 14:30:00')
BEGIN
INSERT INTO \`point_entries\` (\`member_id\`, \`order_id\`, \`points\`, \`description\`) VALUES (1, 3, 200, 'silver 2% + ブラックフライデー 2倍')
COMMIT
SELECT \`point_entries\`.* FROM \`point_entries\` WHERE \`point_entries\`.\`order_id\` = 3 LIMIT 1
`}
          />
          <p>ジョブがいつ動いても200ポイントになりました。SQL の基準の時刻は '2026-11-30 14:30:00'、つまり日本時間で注文した23時30分です。</p>
          <h3>テストを分ける</h3>
          <p>コアのテストは rails_helper を読み込まず、<code>require_relative</code> でコアのファイルだけを読み込みます。前の節のテストと同じ8つの場面を、値の表で書きました。</p>
          <Code
            lang="ruby"
            title="spec/models/point_calculation_spec.rb"
            code={`
# コアのテスト。rails_helper を読み込まず、DB にもつながない
require_relative "../../app/models/point_calculation"

RSpec.describe PointCalculation do
  double = PointCalculation::Campaign.new(name: "2倍", multiplier: 2)
  triple = PointCalculation::Campaign.new(name: "3倍", multiplier: 3)

  [
    ["レギュラー（29,999円）", 29_999, [], 5_000, 50],
    ["シルバー（30,000円）", 30_000, [], 5_000, 100],
    ["シルバー（99,999円）", 99_999, [], 5_000, 100],
    ["ゴールド（100,000円）", 100_000, [], 5_000, 150],
    ["レギュラー・2倍", 0, [double], 5_000, 100],
    ["シルバー・2倍", 30_000, [double], 5_000, 200],
    ["シルバー・2倍と3倍が重なる", 30_000, [double, triple], 5_000, 300],
    ["ゴールド・2倍で上限に届く", 100_000, [double], 50_000, 2_500],
  ].each do |label, past_year_total, campaigns, total, expected|
    it "#{label}なら #{expected} ポイント" do
      expect(described_class.calculate(total:, past_year_total:, campaigns:).points).to eq expected
    end
  end

  it "結果に内訳を持つ" do
    expect(described_class.calculate(total: 50_000, past_year_total: 100_000, campaigns: [double]))
      .to eq PointCalculation::Result.new(rank: :gold, rate: 3, base: 1_500, bonus: 1_000, campaign_name: "2倍")
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/point_calculation_spec.rb --format documentation）"
            code={`
PointCalculation
  レギュラー（29,999円）なら 50 ポイント
  シルバー（30,000円）なら 100 ポイント
  シルバー（99,999円）なら 100 ポイント
  ゴールド（100,000円）なら 150 ポイント
  レギュラー・2倍なら 100 ポイント
  シルバー・2倍なら 200 ポイント
  シルバー・2倍と3倍が重なるなら 300 ポイント
  ゴールド・2倍で上限に届くなら 2500 ポイント
  結果に内訳を持つ

Finished in 0.00215 seconds (files took 0.07599 seconds to load)
9 examples, 0 failures
`}
          />
          <p>
            9件が0.002秒で終わり、読み込みも0.08秒でした。Rails も MySQL も起動していません。前の節のテストは同じ8つの場面に、実行0.17秒と読み込み0.80秒がかかっていました。最後の例のように、Result は <code>eq</code> で項目ごとに比べられるので、内訳もそのまま確かめられます。
          </p>
          <p>シェルのテストはコアの規則の組み合わせを繰り返さず、「どの時刻の値を読むか」と保存を確かめます。</p>
          <Code
            lang="ruby"
            title="spec/models/order_spec.rb"
            code={`
require "rails_helper"

# シェルの統合テスト。注文した時点の値を DB から読み、結果を保存することを確かめる
RSpec.describe Order do
  include ActiveSupport::Testing::TimeHelpers

  let(:member) { Member.create!(name: "佐藤") }
  let(:ordered_at) { Time.zone.parse("2026-11-30 23:30") }
  let(:order) { member.orders.create!(total: 5_000, ordered_at:) }

  before do
    member.orders.create!(total: 3_000, ordered_at: Time.zone.parse("2025-12-01 18:00"))
    member.orders.create!(total: 27_000, ordered_at: Time.zone.parse("2026-06-15 12:00"))
    Campaign.create!(name: "ブラックフライデー 2倍", multiplier: 2,
                     starts_at: Time.zone.parse("2026-11-27 00:00"), ends_at: Time.zone.parse("2026-12-01 00:00"))
  end

  it "ジョブが遅れて動いても、注文した時点のランクとキャンペーンで付与する" do
    travel_to(Time.zone.parse("2026-12-02 10:00")) { AwardPointsJob.perform_now(order) }

    expect(order.point_entry).to have_attributes(points: 200, description: "silver 2% + ブラックフライデー 2倍")
  end

  it "キャンペーンの終わりの時刻ちょうどの注文は、キャンペーンの対象にしない" do
    order.update!(ordered_at: Time.zone.parse("2026-12-01 00:00"))

    expect(order.award_points!).to have_attributes(rank: :silver, bonus: 0)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/requests/carts_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "カートのポイントの見込み", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  it "今の時刻のランクとキャンペーンで見込みを出す" do
    member = Member.create!(name: "佐藤")
    member.orders.create!(total: 30_000, ordered_at: Time.zone.parse("2026-06-15 12:00"))
    Campaign.create!(name: "ブラックフライデー 2倍", multiplier: 2,
                     starts_at: Time.zone.parse("2026-11-27 00:00"), ends_at: Time.zone.parse("2026-12-01 00:00"))

    travel_to(Time.zone.parse("2026-11-30 23:00")) { get cart_path(member_id: member.id, total: 5_000) }
    expect(response.body).to eq "この注文で 200 ポイント付きます（見込み）"

    travel_to(Time.zone.parse("2026-12-01 00:00")) { get cart_path(member_id: member.id, total: 5_000) }
    expect(response.body).to eq "この注文で 100 ポイント付きます（見込み）"
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/order_spec.rb spec/requests --format documentation）"
            code={`
Order
  ジョブが遅れて動いても、注文した時点のランクとキャンペーンで付与する
  キャンペーンの終わりの時刻ちょうどの注文は、キャンペーンの対象にしない

カートのポイントの見込み
  今の時刻のランクとキャンペーンで見込みを出す

Finished in 0.11878 seconds (files took 0.85918 seconds to load)
3 examples, 0 failures
`}
          />
          <ul>
            <li>Order の1件目はジョブを12月2日10時に動かし、遅れても注文した時点の値で付与することを確かめます。前の節の③の場面です。</li>
            <li>2件目は SQL に書いたキャンペーンの終わりの境界（ends_at を含まない）を確かめます。SQL の条件はコアのテストでは確かめられないので、DB を使うシェルのテストで確かめます。</li>
            <li>カートのテストは現在時刻を基準にすることを、キャンペーンの終わりの前と後の2つの時刻で確かめます。現在時刻を読むのは、2つのシェルのうちこちらだけです。</li>
          </ul>
          <h3>直す前と後の比較</h3>
          <Figure n="59-5" title="直す前と後：計算を確かめる1件のテストに要るもの" caption="上は1件のテストの手順、下はテストの実行時間。直す前は8件、直した後はコアの9件。">
            <TestCompareFigure />
          </Figure>
          <p>
            図 59-5 の上は計算を1件確かめるテストに要るものを、直す前と後で比べたものです。直す前は4回の INSERT と時計の差し替えを用意し、保存された行を読み直していました。直した後は、値を渡して戻り値を比べるだけです。下の棒は実行時間で、直す前は Rails と MySQL の接続の読み込みが大部分を占めています。コアのテストは1件あたり約0.2ミリ秒（9件で0.002秒）なので、規則の組み合わせを増やしても、全体の時間はほとんど変わりません。
          </p>
          <Figure n="59-6" title="テストの分担と、プラン変更の日割りの章との対応" caption="時間は各章のアプリで bundle exec rspec を実行した値。環境で変わる。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">項目</th>
                    <th scope="col">プラン変更の日割り（第9部）</th>
                    <th scope="col">この章のポイントの計算</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">コア</th>
                    <td>
                      <code>PlanChange.decide</code>・<code>prorate</code>：月額・日付・真偽値から判断の Data を返す
                    </td>
                    <td>
                      <code>PointCalculation.calculate</code>：支払額・1年間の購入額・キャンペーンの値から内訳の Data を返す
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">シェル</th>
                    <td>ChangePlan（サービスのクラス）とコントローラー</td>
                    <td>
                      <code>Order#award_points!</code>（モデルのメソッド）と CartsController
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">シェルが決める時刻</th>
                    <td>
                      <code>Date.current</code>（日本時間の今日）
                    </td>
                    <td>
                      付与は <code>ordered_at</code>（注文した時刻）、見込みは <code>Time.current</code>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">コアのテスト</th>
                    <td>10件、0.017秒（読み込み 0.07秒）。DB なし</td>
                    <td>9件、0.002秒（読み込み 0.08秒）。DB なし</td>
                  </tr>
                  <tr>
                    <th scope="row">シェルのテスト</th>
                    <td>4件、0.16秒（読み込み 0.9秒）。MySQL・WebMock・travel_to</td>
                    <td>3件、0.12秒（読み込み 0.86秒）。MySQL・travel_to</td>
                  </tr>
                  <tr>
                    <th scope="row">直す前のテスト</th>
                    <td>5件、0.18秒（読み込み 0.94秒）</td>
                    <td>8件、0.17秒（読み込み 0.80秒）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 59-6 はこの章のテストの分担を、<ChapterLink n={45} /> の例と並べたものです。どちらも、規則の組み合わせはコアのテストで数多く確かめ、シェルのテストは DB を使う少数にしています。違いはシェルが決める時刻で、プラン変更は「今日」を、ポイントの付与は「注文した時刻」を基準にします。どちらの時刻を使うかは業務の規則で決まり、コアの書き方では決まりません。テストの層の分け方は <ChapterLink n={20} section="test-strategy" /> でも扱いました。
          </p>
          <h3>直す順序</h3>
          <ol className="steps">
            <li>メソッドの中の副作用に印を付ける（SQL・時計の読み取り・保存・外部の呼び出し）。図 59-3 の左のように、計算の行と分けて並べる</li>
            <li>計算の行を、値だけを受け取るモジュールに移す。直す前のメソッドからそのモジュールを呼ぶ形にして、前の節のテストが通ることを確かめる</li>
            <li>時計を読む箇所をシェルの1か所に集め、業務の規則がどの時刻を基準にするかを決める（この章では ordered_at）。読み取りのメソッドには基準の時刻を引数で渡す</li>
            <li>コアのテストを値の表で書き、DB を使うテストは読み取りの境界と保存を確かめる少数に減らす</li>
            <li>同じ計算を使う別の画面や処理（見込みの表示など）があれば、そこにもシェルを書き、計算を書き写さない</li>
          </ol>
        </>
      ),
    },
    {
      id: 'overuse',
      title: 'SQL の集計までコアに入れようとしたとき',
      body: (
        <>
          <h3>1年間の絞り込みと合計もコアで行う</h3>
          <p>
            「SQL の where も条件の判定なので、コアに入れて値でテストしたい」と考えると、会員の注文をすべて読み込んでコアに渡すことになります。過去1年の範囲の判定と合計を、コアのメソッドにした例です。
          </p>
          <Code
            lang="ruby"
            title="script/overuse/past_year_total_in_core.rb（当てはめすぎた例）"
            code={`
# 当てはめすぎた例：1年間の絞り込みと合計もコアで行うため、会員の注文をすべて受け取る
module PointCalculation
  OrderValue = Data.define(:ordered_at, :total)

  # orders：会員のすべての注文（OrderValue の配列）
  def self.past_year_total(orders, at:)
    from = at - 1.year # 1.year は Active Support の機能
    orders.sum { |o| (from...at).cover?(o.ordered_at) ? o.total : 0 }
  end
end
`}
          />
          <p>3,000件の注文を持つ会員で、SQL で合計する場合と比べました。</p>
          <Code
            lang="ruby"
            title="script/overuse.rb"
            code={`
# 1年間の購入額を、SQL で合計する場合と、注文をすべて読み込んでコアで合計する場合で比べる
require_relative "overuse/past_year_total_in_core"

ActiveRecord::Base.connection.truncate_tables("point_entries", "orders", "campaigns", "members")
member = Member.create!(name: "よく買う会員")
first = Time.zone.parse("2023-12-01 10:00")
Order.insert_all!(Array.new(3_000) { |i| { member_id: member.id, total: 1_000 + i % 7 * 100, ordered_at: first + i * 8.hours } })
at = Time.zone.parse("2026-11-30 23:30")

def measure
  sqls = records = 0
  subs = [
    ActiveSupport::Notifications.subscribe("sql.active_record") { |*, p| sqls += 1 unless p[:name] == "SCHEMA" },
    ActiveSupport::Notifications.subscribe("instantiation.active_record") { |*, p| records += p[:record_count] },
  ]
  started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  value = yield
  ms = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - started) * 1000
  subs.each { |s| ActiveSupport::Notifications.unsubscribe(s) }
  format("合計 %d円、SQL %d回、作った Order %d件、%.1f ミリ秒", value, sqls, records, ms)
end

in_sql = -> { member.purchase_total_before(at) }
in_core = -> { PointCalculation.past_year_total(Order.where(member:).map { |o| PointCalculation::OrderValue.new(o.ordered_at, o.total) }, at:) }
in_sql.(); in_core.() # 1回目の読み込みの時間を除くため、先に1回ずつ動かす

puts "会員の注文：#{member.orders.count}件（#{first.to_date} から8時間ごと）"
puts "SQL で合計してコアに渡す        ：#{measure(&in_sql)}"
puts "すべて読み込み、コアで絞って合計：#{measure(&in_core)}"
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/overuse.rb）"
            code={`
会員の注文：3000件（2023-12-01 から8時間ごと）
SQL で合計してコアに渡す        ：合計 1050100円、SQL 1回、作った Order 0件、0.9 ミリ秒
すべて読み込み、コアで絞って合計：合計 1050100円、SQL 1回、作った Order 3000件、38.0 ミリ秒
`}
          />
          <p>どちらも合計は同じで、SQL も1回ずつですが、次の違いがあります。</p>
          <ul>
            <li>SQL で合計した場合は、DB が整数を1つ返すだけで、Order のオブジェクトを1つも作りませんでした。すべて読み込んだ場合は、範囲の外の注文も含めて3,000件の Order を作り、40倍ほどの時間がかかりました。注文が増えるほど差は広がり、ポイントを付けるたびにこの読み込みが起きます。</li>
            <li>「1年前」を求める <code>1.year</code> は Active Support の機能なので、このコアのテストでは Active Support を読み込む必要があります。コアを Ruby の標準の機能だけで書くという、手順1の利点が減りました。</li>
          </ul>
          <p>
            絞り込みと集計は DB の得意な処理です。SQL の条件の境界（範囲の始まりと終わりを含むか）は、前の節の「キャンペーンの終わりの時刻ちょうど」のように、シェルの統合テストで少数確かめます。コアには集計した結果の値だけを渡します。
          </p>
          <h3>読み込みと保存しかない処理まで分ける</h3>
          <p>
            発送の処理で、注文を発送済みにして発送した日時を保存するだけの部分には、計算や判定の規則がありません。ここにコアを作ると、コアのテストは「渡した時刻がそのまま返る」ことを確かめるだけになり、ファイルとクラスが増えた分だけ読む量が増えます。FCIS で分ける価値があるのは、規則が多く、テストで確かめたい場面が多い計算と判定です。
          </p>
          <h3>時計のオブジェクトをコアに渡す</h3>
          <p>
            現在時刻をテストで替えられるように、時計のオブジェクト（<code>now</code> を返すオブジェクト）を引数で受け取る書き方もあります。これは依存先を引数で受け取って替える <ChapterLink n={40} section="idea" />（Dependency Injection）の形です。コアの中で時計を呼んで時刻を読むので、同じ時計を渡しても、呼んだ時刻によって結果が変わります。コアが必要とするのは「どの時刻の値か」なので、時計ではなく時刻そのもの、またはその時刻で読んだ値をシェルから渡します。この章のコアは時刻も受け取らず、シェルが <code>ordered_at</code> を基準に読んだ合計とキャンペーンだけを受け取りました。
          </p>
          <h3>テストのためだけにコアを作る</h3>
          <p>
            コアはほかのモジュールから呼ばれる公開のメソッドを持ちます。この章の PointCalculation は、付与と見込みの2つのシェルから呼ばれるので、公開する理由があります。呼び出し元が1つしかなく、規則も少ない計算を、テストを書きやすくするためだけにコアとして公開すると、内部の手順を外から呼べるようにすることになります。そのような場合は、シェルのメソッドの公開された振る舞いを通してテストします。この判断は <ChapterLink n={93} section="encapsulation-testing" /> でも扱います。
          </p>
          <h3>判断の目安</h3>
          <Figure n="59-7" title="どこまでをコアに入れるか" caption="模式図。横の軸は規則の数、縦の軸は計算に必要なデータの量。">
            <JudgeFigure />
          </Figure>
          <p>
            図 59-7 は処理をコアに入れるかの目安です。規則が多く、必要なデータが数個の値なら、コアに分けます（右下）。規則が多くても、必要なデータが大量の行なら、SQL で絞り・集計して、結果の値をコアに渡します（右上）。この節の最初の例は右上の処理を右下と同じように扱おうとして、すべての行をコアに渡したものです。規則が少ない処理は、データの量によらず、シェルや SQL にそのまま書きます（左）。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Active Record・Time.current・ジョブと FCIS',
      body: (
        <>
          <h3>Active Record のモデルには、計算と DB の読み書きが同じ場所に集まりやすい</h3>
          <p>
            Rails のモデルでは、関連（<code>member</code> や <code>orders</code>）を読むだけで SQL が実行され、<code>Time.current</code> でどこからでも現在時刻を読めます。直す前の <code>award_points!</code> のように、計算の途中で DB と時計を読むコードは、特別な書き方をしなくてもできあがります。
          </p>
          <p>
            Rails Doctrine の「No one paradigm」は、Rails が1つの考え方だけで作られていないことを説明する節です。その中で、concern を使ってモデルに多くのメソッドを持たせることを、メソッドが扱うデータと保存先に直接触れられる点で Active Record のパターンに合う、と書いています<Ref n={8} />。同じ節は Rails を使うにはオブジェクト指向だけでなく、手続き型と関数型の経験もあるほうがよいとも書いています<Ref n={8} />。
          </p>
          <p>
            この章の直し方は、この2つの説明のどちらとも矛盾しません。読み込みと保存は Order のメソッドに残し、データと保存先に直接触れる形のままです。そのうえで、規則の多い計算だけを、関数型の書き方のモジュールに切り出しました。モデル全体を純粋にする必要はありません。
          </p>
          <h3>コアを置く場所と、テストでの読み込み</h3>
          <p>
            コアは app/models に置いた普通の Ruby のモジュールです。Rails のアプリでは、Zeitwerk が app/models/point_calculation.rb から PointCalculation を読み込むので、シェルの側では require を書かずに使えます。ファイル名と定数名の対応は <ChapterLink n={8} section="naming" />、app/models に Active Record 以外のクラスを置く考え方は <ChapterLink n={33} section="domain-application-service" /> で扱いました。
          </p>
          <p>
            コアのテストでは <code>require_relative</code> でファイルを直接読み込むので、Rails を起動せずに済みます。ただし、コアの中で Active Support の機能（<code>1.year</code>・<code>present?</code>・<code>Time.zone</code> など）を使うと、テストでも Active Support を読み込む必要があります。この章のコアは Ruby の標準の機能だけで書きました。
          </p>
          <p>
            Ruby には、メソッドが純粋かどうかを確かめる仕組みはありません。コアの中で DB や時計を呼んでもエラーにはならないので、純粋に保てているかはコードを読んで確かめます。rails_helper なしのテストは、その確認の一部になります。コアが <code>Time.current</code> や Active Record のモデルを使うと、Rails を読み込んでいないテストでは NoMethodError や NameError で失敗するからです。ただし、Ruby の標準の <code>Time.now</code> や <code>rand</code> は Rails がなくても動くので、このテストでは見つかりません。
          </p>
          <h3>Time.current・travel_to と、基準の時刻</h3>
          <p>
            <code>Time.current</code> は、<code>Time.zone</code>（<code>config.time_zone</code>）が設定されていれば <code>Time.zone.now</code> を、なければ <code>Time.now</code> を返します<Ref n={9} />。どちらにしても、呼んだ瞬間の時刻です。テストでは <code>travel_to</code> が <code>Time.now</code>・<code>Date.today</code>・<code>DateTime.now</code> を差し替えて、時刻を固定します<Ref n={10} />。
          </p>
          <p>
            <code>travel_to</code> は現在時刻を読むコードをテストするための Rails の標準の方法で、この章でもカートの見込みと、ジョブが遅れて動く場面のテストで使いました。ただし、時刻を固定して確かめられるのは「その時刻に動いたら何が起きるか」です。コードがどの時刻を基準にすべきかを間違えていても、テストの時刻の選び方によっては見つかりません。前の節のテストが <code>travel_to(ordered_at)</code> で通ったのはそのためです。
          </p>
          <p>
            ジョブはキューに入れた時刻より後に動きます。ジョブの中で使う時刻は <code>Time.current</code> ではなく、出来事の時刻を記録した列（この章では <code>ordered_at</code>）から読みます。発送の処理を始めた時刻のように、レコードに残していない時刻が要るなら、その時刻をジョブの引数で渡します。Active Job は Time と <code>ActiveSupport::TimeWithZone</code> を引数として受け付けます<Ref n={14} />。
          </p>
          <h3>コールバックで付与しない</h3>
          <p>
            ポイントの付与を Order の <code>after_commit</code> のようなコールバックに書くと、保存のたびに付与の処理が動き、どの操作で付与されるかを呼び出し元から読めなくなります。シェルはジョブやコントローラーから明示的に呼ぶメソッド（<code>award_points!</code>）にします。コールバックに置く処理の選び方は <ChapterLink n={30} section="callback-design" /> で扱いました。
          </p>
          <Callout kind="v72">
            <p>
              <code>Data.define</code> は Ruby 3.2 で追加されたクラスです<Ref n={7} />。Rails 7.2 は Ruby 3.1 以上で動くので<Ref n={11} />、Ruby 3.1 のアプリでは使えません。その場合は <code>Struct.new(:name, :multiplier, keyword_init: true)</code> で値のクラスを作ります。Struct には項目を書き換えるメソッド（<code>multiplier=</code> など）があるので、コアの中で項目を書き換えないようにします。Ruby 3.2 からは <code>keyword_init: true</code> を書かなくても Struct をキーワード引数で作れます<Ref n={7} />。この章で使った <code>Time.current</code> と <code>travel_to</code> は、Rails 7.2 の API ドキュメントにも同じ説明があります<Ref n={12} /><Ref n={13} />。
            </p>
          </Callout>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={45} />：判断の結果を Data で返し、シェルが <code>case/in</code> で書き込みを選ぶ構成、<code>Date.today</code> と <code>Date.current</code> の違い、すべての日を並べて確かめる性質のテストを扱いました。
            </li>
            <li>
              <ChapterLink n={77} section="apply" />：<code>usable_on?(date)</code> が今日の日付を引数で受け取りました。この章ではそれを計算全体に広げ、基準の時刻をシェルで選びました。
            </li>
            <li>
              <ChapterLink n={40} section="idea" />（Dependency Injection）：依存先を引数で受け取り、テストで代わりのオブジェクトに替えます。FCIS はコアから依存先そのものをなくすので、コアのテストでは何も替えません。シェルの側で DI を使うことはあります。
            </li>
            <li>
              <ChapterLink n={44} section="idea" />（Use Case）：シェルの手順が長くなり、複数のモデルにまたがるようになったときの置き場所です。
            </li>
            <li>
              <ChapterLink n={18} section="retry" />：ジョブの再試行の仕組みです。再試行されたジョブは最初の実行より後の時刻に動きます。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>FCIS は計算と判定（コア）を、値を受け取って値を返す純粋な関数にし、DB・時計・外部とのやり取り（シェル）をその外側にまとめる原則です。Gary Bernhardt が2012年のスクリーンキャストで示しました。</li>
          <li>計算の途中で DB と <code>Time.current</code> を読むと、結果が実行した時刻で変わります。この章では、ジョブが遅れて動くと、同じ注文のポイントが200・100・50と変わりました。</li>
          <li>どの時刻の値で計算するかは、シェルで業務の規則から選びます。ポイントの付与は注文した時刻 <code>ordered_at</code>、カートの見込みは <code>Time.current</code> を基準にしました。</li>
          <li>コアは Active Record のオブジェクトではなく、整数や Data の値を受け取ります。SQL の絞り込みと集計はシェルに残し、集計した値を渡します。全件を読み込んでコアで絞ると、この章の例では40倍ほど遅くなりました。</li>
          <li>コアのテストは rails_helper なしで書け、9件が0.002秒で終わりました。シェルは読み取りの時刻・SQL の境界・保存を、DB を使う少数の統合テストで確かめます。</li>
          <li>シェルはモデルのメソッドのままでかまいません。同じコアを、ジョブと画面のような複数のシェルから使えます。</li>
          <li>規則の少ない処理や、テストのためだけに公開するコアは作りません。分ける価値があるのは、規則が多く、確かめたい場面が多い計算と判定です。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Configuring Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'config.active_record.default_timezone の既定が :utc で、datetime の列の値を UTC で保存すること。' },
    { title: 'activerecord/lib/active_record/associations/has_one_association.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/associations/has_one_association.rb#L59-L93`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'create_point_entry! のような has_one の create が、保存の後に set_new_record から replace を呼び、load_target で既存の関連の行を読むこと（実行結果の最後の SELECT）。' },
    { title: 'Functional Core, Imperative Shell', publisher: 'Gary Bernhardt／Destroy All Software', url: 'https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell', accessed: '2026-11-22', version: '2012年7月12日', note: '原則の名前の由来。Ruby 1.9.3 の Twitter のクライアントを例に、関数型のコアと、コアの値に基づいて標準入出力・データベース・ネットワークを操作する命令型のシェルに分けること。関数型の部分がテストダブルなしで単独にテストでき、シェルの条件分岐が減ること（紹介文）。' },
    { title: 'Boundaries', publisher: 'Gary Bernhardt／Destroy All Software（SCNA 2012 の講演）', url: 'https://www.destroyallsoftware.com/talks/boundaries', accessed: '2026-11-22', version: '2012年', note: '単純な値を、コンポーネントやサブシステムの境界として使う考え方。講演の最後で FCIS のスクリーンキャストに触れていること。' },
    { title: 'CommandQuerySeparation', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/CommandQuerySeparation.html', accessed: '2026-11-22', version: '2005年12月5日', note: 'command query separation という言葉を Bertrand Meyer が『Object Oriented Software Construction』で使い始めたこと。問い合わせは結果を返して状態を変えず、命令は状態を変えるという分け方。' },
    { title: 'Hexagonal architecture（The Hexagonal (Ports & Adapters) Architecture）', publisher: 'Alistair Cockburn', url: 'https://alistair.cockburn.us/hexagonal-architecture/', accessed: '2026-11-22', version: '2005年', note: 'アプリケーションを UI やデータベースなしで動かしてテストできるようにする目的。アプリケーションが外へ送るものを、ポートを通じてアダプターに送ること。' },
    { title: 'Ruby 3.2.0 Released', publisher: 'ruby-lang.org', url: 'https://www.ruby-lang.org/en/news/2022/12/25/ruby-3-2-0-released/', accessed: '2026-11-22', version: 'Ruby 3.2.0', note: '読み取り専用の値のクラス Data が追加されたこと（項目への代入は NoMethodError）。Struct を keyword_init: true なしでキーワード引数で作れるようになったこと。' },
    { title: 'The Rails Doctrine', publisher: 'Ruby on Rails / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-22', note: '「No one paradigm」で、concern がモデルのメソッドにデータと保存先への直接の手段を与え Active Record のパターンに合うと述べていること。Rails を使うには手続き型と関数型の経験もあるほうがよいと述べていること。' },
    { title: 'activesupport/lib/active_support/core_ext/time/calculations.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/core_ext/time/calculations.rb#L39-L42`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'Time.current が、Time.zone があれば Time.zone.now、なければ Time.now を返すこと。' },
    { title: 'ActiveSupport::Testing::TimeHelpers', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveSupport/Testing/TimeHelpers.html', accessed: '2026-11-22', version: 'Rails 8.1', note: 'travel・travel_to が Time.now・Date.today・DateTime.now を差し替え、テストの終わりに元に戻すこと。' },
    { title: 'Ruby on Rails 7.2 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/7_2_release_notes.html', accessed: '2026-11-22', version: 'Rails 7.2', note: 'Rails 7.2 で Ruby 3.1 が最低のバージョンになったこと。' },
    { title: 'ActiveSupport::Testing::TimeHelpers（Rails 7.2）', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v7.2/classes/ActiveSupport/Testing/TimeHelpers.html', accessed: '2026-11-22', version: 'Rails 7.2', note: 'Rails 7.2 にも travel_to があり、同じ説明であること。' },
    { title: 'Time（Rails 7.2）', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v7.2/classes/Time.html', accessed: '2026-11-22', version: 'Rails 7.2', note: 'Rails 7.2 の Time.current も、Time.zone か config.time_zone があれば Time.zone.now を返すこと。' },
    { title: 'Active Job Basics（Supported Argument Types for perform）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_job_basics.html#supported-argument-types-for-perform', accessed: '2026-11-22', version: 'Rails 8.1', note: 'Active Job が Time・DateTime・ActiveSupport::TimeWithZone を引数として受け付けること。' },
  ],
}

export default chapter
