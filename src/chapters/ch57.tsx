import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 55-1 クーポンのルールエンジンの構成 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="55-1"
      w={780}
      h={470}
      label="カートの画面ではクーポンのコードを複数入力できる。CheckoutPricing がコードから coupons テーブルの行を読み、RuleEngine::Evaluator に渡す。Evaluator は priority の小さい順にルールを評価し、stop のルールを適用したら止める。Rule は Condition で条件を調べ、満たせば Actions の割引を適用する。Condition は Operators で比べ、Actions は Facts の割引と送料を書き換える。coupons テーブルの rules 列には JSON で、OFF500（priority 10・stop あり・3,000円以上で500円引き）、FREESHIP（priority 10・stop あり・2,000円以上で送料無料）、SALE10（priority 5・stop なし・5,000円以上で10%引き）が入っている。SALE10 が先に評価され、stop がないので OFF500 も適用され、割引が二重にかかる"
    >
      <Box x={20} y={16} w={220} h={46} lines={['カートの画面', 'クーポンのコードを複数入力できる']} fs={12} subTone="muted" />
      <Arrow x1={130} y1={62} x2={130} y2={90} />
      <Box x={20} y={92} w={220} h={46} lines={['CheckoutPricing', 'コードの配列から行を読む']} fs={12} subTone="muted" />
      <Arrow x1={130} y1={138} x2={130} y2={188} />

      <rect x={10} y={166} width={490} height={292} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={490} y={180} fs={11} tone="muted" anchor="end">
        app/services/rule_engine/（6ファイル）
      </T>
      <Box x={20} y={194} w={220} h={62} lines={['RuleEngine::Evaluator', 'priority の小さい順に評価し、', 'stop のルールで止める']} fs={12} fill="box5" subTone="danger" />
      <T x={262} y={210} fs={12} tone="danger">
        SALE10 → OFF500 の順に評価し、
      </T>
      <T x={262} y={230} fs={12} tone="danger">
        両方の割引をかける（1,300円）
      </T>
      <Arrow x1={130} y1={256} x2={130} y2={288} />
      <Box x={20} y={290} w={220} h={46} lines={['Rule', '条件をすべて満たせば割引を適用']} fs={12} subTone="muted" />
      <Arrow x1={240} y1={313} x2={268} y2={313} />
      <Box x={270} y={290} w={220} h={46} lines={['Actions', '定額・定率・送料無料（case 文）']} fs={12} subTone="muted" />
      <Arrow x1={130} y1={336} x2={130} y2={378} />
      <Box x={20} y={380} w={220} h={46} lines={['Condition', 'fact・op・value で比べる']} fs={12} subTone="muted" />
      <Arrow x1={240} y1={403} x2={268} y2={403} />
      <Box x={270} y={380} w={105} h={46} lines={['Operators', 'gte など']} fs={12} subTone="muted" />
      <Box x={385} y={380} w={105} h={46} lines={['Facts', '割引・送料']} fs={12} subTone="muted" />
      <Arrow x1={437} y1={336} x2={437} y2={378} />
      <T x={445} y={358} fs={11} tone="muted">
        書き換える
      </T>

      <T x={530} y={20} bold>
        coupons テーブル（rules 列は JSON）
      </T>
      <Box x={530} y={36} w={230} h={62} lines={['OFF500', 'priority 10・stop あり', '3,000円以上 → 500円引き']} fs={12} fill="box4" subTone="muted" />
      <Box x={530} y={108} w={230} h={62} lines={['FREESHIP', 'priority 10・stop あり', '2,000円以上 → 送料無料']} fs={12} fill="box4" subTone="muted" />
      <Box x={530} y={180} w={230} h={62} lines={['SALE10', 'priority 5・stop なし', '5,000円以上 → 10%引き']} fs={12} fill="box4" subTone="danger" />
      <Arrow x1={242} y1={115} x2={528} y2={115} dashed />
      <T x={385} y={103} fs={11} anchor="middle" tone="muted">
        読む
      </T>
      <T x={530} y={268} fs={12} tone="muted">
        運営担当が管理画面で JSON を書いて
      </T>
      <T x={530} y={286} fs={12} tone="muted">
        登録する
      </T>
    </Svg>
  )
}

/* ---------- 図 55-2 ルールを評価する流れ ---------- */
function EvaluationFigure() {
  const cols: { head: string; sort: string; steps: { lines: string[]; dashed?: boolean; danger?: boolean }[]; result: string[]; danger: boolean }[] = [
    {
      head: 'SALE10 の priority = 5',
      sort: 'SALE10（5）→ OFF500（10）',
      steps: [
        { lines: ['SALE10：8,000 ≥ 5,000 を満たす', '10%引き → 割引 800円', 'stop なし → 次のルールへ'], danger: true },
        { lines: ['OFF500：8,000 ≥ 3,000 を満たす', '500円引き → 割引 1,300円', 'stop あり → 評価をやめる'] },
      ],
      result: ['割引 1,300円（二重）', '支払い 7,300円'],
      danger: true,
    },
    {
      head: 'SALE10 の priority = 20',
      sort: 'OFF500（10）→ SALE10（20）',
      steps: [
        { lines: ['OFF500：8,000 ≥ 3,000 を満たす', '500円引き → 割引 500円', 'stop あり → 評価をやめる'] },
        { lines: ['SALE10', '評価しない'], dashed: true },
      ],
      result: ['割引 500円', '支払い 8,100円'],
      danger: false,
    },
  ]
  return (
    <Svg
      id="55-2"
      w={760}
      h={400}
      label="小計8,000円・送料600円のカートに OFF500 と SALE10 を入力したときの評価の流れ。SALE10 の priority が 5 のときは SALE10、OFF500 の順に並ぶ。SALE10 は条件を満たして800円引き、stop がないので次へ進み、OFF500 も条件を満たして500円引きを加え、stop で止まる。割引は1,300円で二重になり、支払いは7,300円。priority が 20 のときは OFF500、SALE10 の順に並び、OFF500 の500円引きの後に stop で止まり、SALE10 は評価しない。割引は500円、支払いは8,100円。コードもカートも入力も同じで、違うのは JSON の priority の値だけ"
    >
      {cols.map((c, i) => {
        const x0 = 20 + i * 380
        const cx = x0 + 170
        return (
          <g key={c.head}>
            <T x={cx} y={18} anchor="middle" bold>
              {c.head}
            </T>
            <Box x={x0} y={36} w={340} h={46} lines={['priority の小さい順に並べる', c.sort]} fs={12} fill="box5" subTone="muted" />
            <Arrow x1={cx} y1={82} x2={cx} y2={102} />
            <Box x={x0} y={104} w={340} h={64} lines={c.steps[0].lines} fs={12} subTone={c.steps[0].danger ? 'danger' : 'muted'} />
            <Arrow x1={cx} y1={168} x2={cx} y2={188} dashed={c.steps[1].dashed} />
            <Box x={x0} y={190} w={340} h={c.steps[1].dashed ? 46 : 64} lines={c.steps[1].lines} fs={12} dashed={c.steps[1].dashed} fill={c.steps[1].dashed ? 'bg' : 'box'} subTone="muted" />
            <Arrow x1={cx} y1={c.steps[1].dashed ? 236 : 254} x2={cx} y2={282} />
            <Box x={x0 + 70} y={284} w={200} h={48} lines={c.result} fs={13} fill="box4" bold accent={!c.danger} subTone={c.danger ? 'danger' : 'muted'} />
          </g>
        )
      })}
      <line x1={380} y1={10} x2={380} y2={340} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={20} y={366} fs={12} tone="muted">
        どちらも同じコード・同じカート（小計 8,000円・送料 600円）・同じ2つのコード。
      </T>
      <T x={20} y={386} fs={12} tone="muted">
        違うのは SALE10 の JSON に書かれた priority の値だけ。
      </T>
    </Svg>
  )
}

/* ---------- 図 55-3 割引の額に答えるために読む範囲 ---------- */
function ReadingScopeFigure() {
  const before: { file: string; why: string; kind?: 'data' | 'rule' }[] = [
    { file: 'checkout_pricing.rb', why: 'コードを複数受け取る' },
    { file: 'rule_engine/evaluator.rb', why: '並べ替えと stop' },
    { file: 'rule_engine/rule.rb', why: 'priority と stop の既定値' },
    { file: 'rule_engine/condition.rb', why: '条件の調べ方' },
    { file: 'rule_engine/operators.rb', why: 'gte の意味' },
    { file: 'rule_engine/facts.rb', why: 'subtotal の値' },
    { file: 'rule_engine/actions.rb', why: '割引の計算' },
    { file: 'coupons.rules（JSON 3行）', why: 'priority・stop の値', kind: 'data' },
    { file: 'sort_by と DB の行の順番', why: '同じ priority のとき', kind: 'rule' },
  ]
  const after: { file: string; why: string; kind?: 'data' }[] = [
    { file: 'checkout_pricing.rb', why: 'コードを1つ受け取る' },
    { file: 'models/coupon.rb', why: 'quote の case 文' },
    { file: 'coupons の3列（3行）', why: 'kind・value・min_subtotal', kind: 'data' },
  ]
  const rowH = 34
  return (
    <Svg
      id="55-3"
      w={780}
      h={430}
      label={`「OFF500 と SALE10 を両方入力したら割引はいくらか」に答えるために読む範囲。適用前は ${before.map((b) => `${b.file}（${b.why}）`).join('、')} を読む。7つのファイルと JSON の3行と並べ替えの規則が必要。適用後は ${after.map((b) => `${b.file}（${b.why}）`).join('、')} を読む。2つのファイルと列の値だけで答えられ、そもそも2つのコードは受け取らない`}
    >
      <T x={390} y={18} anchor="middle" bold>
        問い：OFF500 と SALE10 を両方入力したら、割引はいくらか
      </T>
      <T x={20} y={50} bold>
        ルールエンジン（適用前）
      </T>
      {before.map((b, i) => (
        <Box
          key={b.file}
          x={20}
          y={64 + i * rowH}
          w={350}
          h={28}
          lines={`${b.file}　… ${b.why}`}
          fs={12}
          fill={b.kind === 'data' ? 'box4' : b.kind === 'rule' ? 'bg' : 'box'}
          dashed={b.kind === 'rule'}
          align="start"
        />
      ))}
      <T x={20} y={386} fs={12} tone="danger">
        7ファイル＋JSON の3行＋並べ替えの規則を読む
      </T>

      <line x1={395} y1={36} x2={395} y2={420} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={420} y={50} bold>
        case 文（適用後）
      </T>
      {after.map((b, i) => (
        <Box key={b.file} x={420} y={64 + i * rowH} w={340} h={28} lines={`${b.file}　… ${b.why}`} fs={12} fill={b.kind === 'data' ? 'box4' : 'box'} align="start" />
      ))}
      <T x={420} y={190} fs={12} tone="acc">
        2ファイル＋列の値を読む
      </T>
      <T x={420} y={214} fs={12} tone="acc">
        そもそもコードを1つしか受け取らないので、
      </T>
      <T x={420} y={234} fs={12} tone="acc">
        2枚のクーポンが同時にかかることはない
      </T>
      <T x={20} y={414} fs={11} tone="muted">
        Cart の定義など、両方に共通するファイルは除いた
      </T>
    </Svg>
  )
}

/* ---------- 図 55-5 直す前と後の構造 ---------- */
function BeforeAfterFigure() {
  return (
    <Svg
      id="55-5"
      w={780}
      h={360}
      label="適用前は、CheckoutPricing がコードの配列を受け取り、RuleEngine の6つのファイル（Evaluator・Rule・Condition・Operators・Facts・Actions）が priority で並べ替えて stop で止めながら評価し、coupons.rules の JSON（priority・stop・conditions・actions）を読む。1注文に1枚かどうかは priority と stop の値の組み合わせで決まる。適用後は、CheckoutPricing がコードを1つ受け取り、Coupon#quote が最低金額に届かなければ割引なしとし、case kind で3種類を計算し、知らない種類なら ArgumentError を投げる。coupons テーブルは kind・value・min_subtotal の列を持ち、保存時に検証する。2枚目のコードを受け取る引数がないので、割引は必ず1つ以下になる"
    >
      <T x={20} y={20} bold>
        適用前
      </T>
      <Box x={20} y={36} w={340} h={46} lines={['CheckoutPricing', 'コードの配列を受け取る']} fs={12} subTone="muted" />
      <Arrow x1={190} y1={82} x2={190} y2={104} />
      <Box
        x={20}
        y={106}
        w={340}
        h={110}
        lines={['RuleEngine（6ファイル）', 'Evaluator・Rule・Condition', 'Operators・Facts・Actions', 'priority で並べ替え、stop で止める']}
        fs={12}
        fill="box2"
        dashed
        subTone="muted"
      />
      <Arrow x1={190} y1={216} x2={190} y2={240} dashed />
      <Box x={20} y={242} w={340} h={46} lines={['coupons.rules（JSON）', 'priority・stop・conditions・actions']} fs={12} fill="box4" subTone="muted" />
      <T x={20} y={314} fs={12} tone="danger">
        1注文に1枚かどうかは、priority と stop の
      </T>
      <T x={20} y={334} fs={12} tone="danger">
        値の組み合わせで決まる
      </T>

      <line x1={390} y1={10} x2={390} y2={350} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={420} y={20} bold>
        適用後
      </T>
      <Box x={420} y={36} w={340} h={46} lines={['CheckoutPricing', 'コードを1つ受け取る']} fs={12} accent subTone="muted" />
      <Arrow x1={590} y1={82} x2={590} y2={104} />
      <Box
        x={420}
        y={106}
        w={340}
        h={110}
        lines={['Coupon#quote', '最低金額に届かなければ割引なし', 'case kind で3種類を計算', '知らない種類は ArgumentError']}
        fs={12}
        subTone="muted"
      />
      <Arrow x1={590} y1={216} x2={590} y2={240} dashed />
      <Box x={420} y={242} w={340} h={46} lines={['coupons', 'kind・value・min_subtotal（保存時に検証）']} fs={12} fill="box4" subTone="muted" />
      <T x={420} y={314} fs={12} tone="acc">
        2枚目のコードを受け取る引数がないので、
      </T>
      <T x={420} y={334} fs={12} tone="acc">
        割引は必ず1つ以下になる
      </T>
    </Svg>
  )
}

/* ---------- 図 55-6 複雑さを数えた結果 ---------- */
const metrics: { label: string; sub: string; before: number; after: number }[] = [
  { label: '読むファイル', sub: 'Ruby のファイル', before: 9, after: 4 },
  { label: '行数', sub: '空行とコメントを除く', before: 128, after: 28 },
  { label: 'クラス・モジュール', sub: 'Data.define を含む', before: 14, after: 4 },
  { label: '分岐', sub: 'if・unless・when・&&・||', before: 8, after: 6 },
  { label: '結果を左右するデータの項目', sub: 'JSON のキー・テーブルの列', before: 7, after: 3 },
]

function MetricsFigure() {
  const x0 = 270
  const maxLen = 380
  const rowH = 56
  return (
    <Svg
      id="55-6"
      w={760}
      h={390}
      label={`script/complexity.rb などで数えた、適用前と適用後の比較。${metrics.map((m) => `${m.label}（${m.sub}）は適用前 ${m.before}、適用後 ${m.after}`).join('。')}。分岐の数はほとんど変わらず、違いは読むファイルとクラスの数、行数、結果を左右するデータの項目に出る`}
    >
      <rect x={x0} y={12} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={x0 + 20} y={18} fs={12}>
        適用前（ルールエンジン）
      </T>
      <rect x={x0 + 200} y={12} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
      <T x={x0 + 220} y={18} fs={12}>
        適用後（case 文）
      </T>
      {metrics.map((m, i) => {
        const y = 44 + i * rowH
        const max = Math.max(m.before, m.after)
        const lb = (m.before / max) * maxLen
        const la = (m.after / max) * maxLen
        return (
          <g key={m.label}>
            <T x={20} y={y + 10} fs={13} bold>
              {m.label}
            </T>
            <T x={20} y={y + 30} fs={11} tone="muted">
              {m.sub}
            </T>
            <rect x={x0} y={y} width={lb} height={18} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            <T x={x0 + lb + 8} y={y + 9} fs={12}>
              {m.before}
            </T>
            <rect x={x0} y={y + 22} width={la} height={18} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
            <T x={x0 + la + 8} y={y + 31} fs={12} tone="acc">
              {m.after}
            </T>
          </g>
        )
      })}
      <T x={20} y={340} fs={12} tone="muted">
        棒の長さは項目ごとに、大きいほうの値を同じ長さにしてそろえた。
      </T>
      <T x={20} y={362} fs={12} tone="muted">
        分岐の数は 8 と 6 でほとんど変わらない。ルールエンジンの複雑さは分岐ではなく、
      </T>
      <T x={20} y={382} fs={12} tone="muted">
        ファイルとクラスの数、評価の順番を決めるデータの項目に表れる。
      </T>
    </Svg>
  )
}

/* ---------- 図 55-7 当てはめすぎの判断 ---------- */
function JudgeFigure() {
  const ox = 110
  const oy = 360
  return (
    <Svg
      id="55-7"
      w={780}
      h={440}
      label="横軸は割引の種類と条件の数（左が少ない、右が多い）、縦軸は誰がどのくらいの頻度で変えるか（下が開発者がリリースのときに変える、上が運営担当が毎週変える）。左下は列と case 文で、この章の適用後のコードと3種類のクーポンの場面がここに入る。右下は種類ごとのクラスに分ける（Strategy / Policy）で、7種類と5つの条件に育った GrownCoupon はここに移す時期。左上は金額・率・最低金額・期間などの値だけを管理画面で変える。右上は範囲を絞ったルールの仕組みで、ルールの数を制限し、テストと評価の記録を用意する。最初のルールエンジンは3種類しかないのに右上の道具を選んでいた"
    >
      <Arrow x1={ox} y1={oy} x2={750} y2={oy} />
      <Arrow x1={ox} y1={oy} x2={ox} y2={38} />
      <T x={430} y={392} anchor="middle" fs={12} bold>
        割引の種類と条件の数
      </T>
      <T x={ox} y={378} fs={11} tone="muted">
        少ない（3種類）
      </T>
      <T x={750} y={378} anchor="end" fs={11} tone="muted">
        多い（数十）
      </T>
      <T x={20} y={16} fs={12} bold>
        縦軸：誰が・どのくらいの頻度で変えるか
      </T>
      <T x={20} y={110} fs={11} tone="muted">
        運営担当が
      </T>
      <T x={20} y={126} fs={11} tone="muted">
        毎週変える
      </T>
      <T x={20} y={318} fs={11} tone="muted">
        開発者が
      </T>
      <T x={20} y={334} fs={11} tone="muted">
        リリースで変える
      </T>
      <line x1={430} y1={40} x2={430} y2={350} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={120} y1={195} x2={745} y2={195} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <Box x={130} y={220} w={285} h={70} lines={['列と case 文', '種類の数だけ when を書く', 'この章の適用後のコード']} fs={12} fill="box5" accent bold subTone="muted" />
      <Box x={445} y={220} w={295} h={70} lines={['種類ごとのクラスに分ける', 'Strategy / Policy のパターン', '種類ごとに列や条件が違うとき']} fs={12} bold subTone="muted" />
      <Box x={130} y={60} w={285} h={70} lines={['値だけを管理画面で変える', '金額・率・最低金額・期間を列で持つ', '計算の種類はコードで決める']} fs={12} bold subTone="muted" />
      <Box x={445} y={60} w={295} h={70} lines={['範囲を絞ったルールの仕組み', 'ルールの数を制限する', 'テストと評価の記録を用意する']} fs={12} dashed bold subTone="muted" />

      <circle cx={170} cy={318} r={7} fill="var(--fig-accent)" />
      <T x={184} y={318} fs={12} tone="acc">
        この章の場面（3種類・開発者が変える）
      </T>
      <circle cx={470} cy={318} r={7} fill="none" stroke="var(--fig-line)" strokeWidth={2} />
      <T x={484} y={318} fs={12}>
        GrownCoupon（7種類・条件5つ）
      </T>
      <T x={140} y={160} fs={12} tone="danger">
        最初のルールエンジン：場面は左下なのに、
      </T>
      <T x={140} y={178} fs={12} tone="danger">
        右上で使う道具を選んでいた
      </T>
      <Arrow d="M410,166 C440,166 450,150 470,134" />
    </Svg>
  )
}

const chapter: Chapter = {
  number: 57,
  part: 8,
  title: 'KISS：3種類のクーポンのために汎用のルールエンジンを作らない',
  summary:
    'クーポンの条件と割引を JSON で書けるルールエンジンで、ルールを評価する順番によって割引が二重にかかる例から始め、KISS（不必要な複雑さを避ける）の意味と由来を確かめます。3種類のクーポンを列と case 文で表すように段階を分けて直し、読むファイル・行数・分岐の数で比べた後、当てはめすぎの例と判断の目安を示します。',
  goals: [
    '汎用のルールエンジンで、評価の順番と設定の組み合わせによって割引が二重にかかる仕組みを説明できる',
    'KISS の定義と由来、simple と easy の違い、YAGNI・DRY・AHA・OCP との違いを説明できる',
    '3種類のクーポンを enum の列と case 文で表すように、テストとマイグレーションを使って段階的に直せる',
    '読むファイルの数・行数・分岐の数・結果を左右するデータの項目で、複雑さを比べられる',
    '必要な検証まで省く、行数を減らすために詰め込む、種類が増えても case 文を守り続ける、といった当てはめすぎを見分けられる',
    'Rails の enum・バリデーション・Convention over Configuration と KISS の関係を説明できる',
  ],
  prerequisites: [56, 11, 14, 33],
  sections: [
    {
      id: 'scene',
      title: 'クーポンのルールエンジンと、二重にかかる割引',
      body: (
        <>
          <p>
            この章では EC サイトのクーポンの割引を計算する処理を例に、KISS を扱います。最初に、将来どんなクーポンにも対応できるように作った汎用のルールエンジンを動かし、ルールを評価する順番によって割引が二重にかかることを確かめます。
          </p>
          <h3>そもそもクーポンで何をするのか</h3>
          <p>
            家具と雑貨を売る EC サイトを考えます。購入の手続きの画面には、クーポンのコードを入力する欄があります。利用者が「OFF500」のようなコードを入力すると、商品の小計（送料を含まない商品の合計）から割引した金額と、送料が表示されます。
          </p>
          <p>このサイトで使っているクーポンは次の3種類です。どのクーポンにも「小計が○円以上」という条件が1つあり、条件を満たすと割引が1つかかります。また、1つの注文に使えるクーポンは1枚までと決めています。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">コード</th>
                  <th scope="col">種類</th>
                  <th scope="col">条件</th>
                  <th scope="col">割引</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">OFF500</th>
                  <td>定額引き</td>
                  <td>小計が 3,000円以上</td>
                  <td>500円引き</td>
                </tr>
                <tr>
                  <th scope="row">SALE10</th>
                  <td>定率引き</td>
                  <td>小計が 5,000円以上</td>
                  <td>小計の10%を引く（円未満は切り捨て）</td>
                </tr>
                <tr>
                  <th scope="row">FREESHIP</th>
                  <td>送料無料</td>
                  <td>小計が 2,000円以上</td>
                  <td>送料を0円にする</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>この章では小計 8,000円・送料 600円のカートを例に使います。OFF500 を使えば割引は 500円で支払いは 8,100円、SALE10 を使えば割引は 800円で支払いは 7,800円になります。</p>
          <h3>ルールエンジンとして作ったコード</h3>
          <p>
            開発を始めたとき、チームは「クーポンの条件はこれから増えるはずなので、コードを直さずに運営担当が新しいクーポンを作れるようにしたい」と考えました。そこで、条件と割引を JSON で書ける<Term en="rules engine">ルールエンジン</Term>を作りました。ルールエンジンは「条件」と「条件を満たしたときに行う処理」の組（ルール）をデータとして持ち、それを順に評価して実行する仕組みです。coupons テーブルには、クーポンのコードと、ルールを入れる JSON の列を作りました。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_coupons.rb"
            code={`
class CreateCoupons < ActiveRecord::Migration[8.1]
  def change
    create_table :coupons do |t|
      t.string :code, null: false, index: { unique: true }
      t.json :rules, null: false # 条件と割引を JSON で書く
      t.timestamps
    end
  end
end
`}
          />
          <p>次は OFF500 の rules 列の内容です（db/seeds.rb で登録した値を JSON で書いたもの）。</p>
          <Code
            lang="json"
            title="OFF500 の rules 列"
            code={`
{ "rules": [
  { "priority": 10, "stop": true,
    "conditions": [{ "fact": "subtotal", "op": "gte", "value": 3000 }],
    "actions": [{ "type": "amount_off", "value": 500 }] }
] }
`}
          />
          <p>
            conditions は条件の配列で、fact（調べる値）・op（比べ方）・value（比べる値）を書きます。gte は「以上」です。actions は割引の配列です。priority はルールを評価する順番で、値の小さいものから評価します。stop が true のルールを適用したら、それより後のルールは評価しません。チームは「1つの注文にクーポンは1枚まで」という決まりを、すべてのクーポンに stop: true を書くことで表すと取り決めました。
          </p>
          <p>ルールを評価するコードは、app/services/rule_engine/ の6つのファイルにあります。中心は Evaluator で、すべてのクーポンのルールを priority の順に並べて評価します。</p>
          <Code
            lang="ruby"
            title="app/services/rule_engine/evaluator.rb"
            code={`
module RuleEngine
  # すべてのクーポンのルールを priority の小さい順に評価し、
  # 条件を満たしたルールの割引を適用する。stop が true のルールを適用したら評価をやめる
  class Evaluator
    Result = Data.define(:discount, :shipping_fee, :applied)

    def initialize(coupons)
      @rules = coupons.flat_map do |coupon|
        coupon.rules.fetch("rules").map { |hash| Rule.from_hash(hash, source: coupon.code) }
      end
    end

    def call(cart)
      facts = Facts.new(cart)
      @rules.sort_by(&:priority).each do |rule|
        next unless rule.match?(facts)

        rule.actions.each { |action| action.apply(facts) }
        facts.applied << rule.source
        break if rule.stop?
      end
      Result.new(discount: facts.discount, shipping_fee: facts.shipping_fee, applied: facts.applied)
    end
  end
end
`}
          />
          <p>
            Rule は JSON の1つのルールをオブジェクトにします。<code>hash.fetch("stop", false)</code> のとおり、stop を書かなければ false、priority を書かなければ 100 になります。
          </p>
          <Code
            lang="ruby"
            title="app/services/rule_engine/rule.rb"
            code={`
module RuleEngine
  # 1つのルール。条件（conditions）をすべて満たしたら、割引（actions）を適用する
  class Rule
    attr_reader :priority, :conditions, :actions, :source

    def self.from_hash(hash, source:)
      new(
        priority: hash.fetch("priority", 100),
        stop: hash.fetch("stop", false),
        conditions: hash.fetch("conditions", []).map { |c| Condition.from_hash(c) },
        actions: hash.fetch("actions").map { |a| Actions.build(a) },
        source:
      )
    end

    def initialize(priority:, stop:, conditions:, actions:, source:)
      @priority = priority
      @stop = stop
      @conditions = conditions
      @actions = actions
      @source = source
    end

    def stop? = @stop

    def match?(facts)
      conditions.all? { |condition| condition.satisfied_by?(facts) }
    end
  end
end
`}
          />
          <p>条件の比べ方は Condition と Operators、条件から参照できる値は Facts に書いています。Facts は割引の途中の結果も持ち、割引のたびに書き換えられます。</p>
          <Code
            lang="ruby"
            title="app/services/rule_engine/condition.rb"
            code={`
module RuleEngine
  # 条件 1つ。{ "fact" => "subtotal", "op" => "gte", "value" => 3000 } なら「小計が3000円以上」
  class Condition
    def self.from_hash(hash)
      new(fact: hash.fetch("fact"), op: hash.fetch("op"), value: hash.fetch("value"))
    end

    def initialize(fact:, op:, value:)
      @fact = fact
      @op = op
      @value = value
    end

    def satisfied_by?(facts)
      Operators.fetch(@op).call(facts.fetch(@fact), @value)
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/services/rule_engine/operators.rb"
            code={`
module RuleEngine
  # 条件に書ける比較の演算子
  module Operators
    TABLE = {
      "eq" => ->(actual, expected) { actual == expected },
      "gte" => ->(actual, expected) { actual >= expected },
      "lte" => ->(actual, expected) { actual <= expected },
      "in" => ->(actual, expected) { expected.include?(actual) }
    }.freeze

    def self.fetch(name)
      TABLE.fetch(name) { raise ArgumentError, "unknown operator: #{name}" }
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/services/rule_engine/facts.rb"
            code={`
module RuleEngine
  # 条件から参照できる値と、割引の途中の結果を持つ
  class Facts
    attr_accessor :discount, :shipping_fee
    attr_reader :applied

    def initialize(cart)
      @cart = cart
      @discount = 0
      @shipping_fee = cart.shipping_fee
      @applied = []
    end

    def subtotal = @cart.subtotal

    def fetch(name)
      case name
      when "subtotal" then subtotal
      when "discount" then discount
      when "shipping_fee" then shipping_fee
      else raise ArgumentError, "unknown fact: #{name}"
      end
    end
  end
end
`}
          />
          <p>割引の計算は Actions にあります。3種類の割引に対応するクラスと、JSON の type からクラスを選ぶ case 文があります。</p>
          <Code
            lang="ruby"
            title="app/services/rule_engine/actions.rb"
            code={`
module RuleEngine
  # ルールに書ける割引の種類
  module Actions
    AmountOff = Data.define(:value) do
      def apply(facts) = facts.discount += value
    end

    PercentOff = Data.define(:value) do
      def apply(facts) = facts.discount += facts.subtotal * value / 100
    end

    FreeShipping = Data.define do
      def apply(facts) = facts.shipping_fee = 0
    end

    def self.build(hash)
      case hash.fetch("type")
      when "amount_off" then AmountOff.new(value: hash.fetch("value"))
      when "percent_off" then PercentOff.new(value: hash.fetch("value"))
      when "free_shipping" then FreeShipping.new
      else raise ArgumentError, "unknown action: #{hash["type"]}"
      end
    end
  end
end
`}
          />
          <p>
            購入の手続きの処理からは CheckoutPricing を呼びます。CheckoutPricing は入力されたコードの配列からクーポンを読み、Evaluator に渡します。Cart は小計と送料だけを持つ値のクラスで、Ruby の <code>Data.define</code>（指定したメンバーだけを持ち、作った後に書き換えられない値のクラスを作るメソッド）で定義しています<Ref n={14} />。
          </p>
          <Code
            lang="ruby"
            title="app/services/checkout_pricing.rb（適用前）と app/models/cart.rb"
            code={`
# カートに入力されたクーポンのコード（複数可）から、割引額と送料を計算する
class CheckoutPricing
  def initialize(cart, coupon_codes)
    @cart = cart
    @coupons = Coupon.where(code: coupon_codes).to_a
  end

  def call
    RuleEngine::Evaluator.new(@coupons).call(@cart)
  end
end

# app/models/cart.rb
# カートの金額。商品の小計（subtotal）と送料（shipping_fee）を円で持つ
Cart = Data.define(:subtotal, :shipping_fee)
`}
          />
          <p>
            図 55-1 はここまでのクラスとテーブルの関係です。カートの画面から CheckoutPricing、Evaluator、Rule、Condition へと処理が進み、割引は Actions が Facts を書き換えて積み上げます。クーポンごとの priority と stop の値は、右側の coupons テーブルの JSON にあります。
          </p>
          <Figure n="55-1" title="クーポンのルールエンジンの構成" caption="破線の枠は app/services/rule_engine/ の6つのファイル。破線の矢印はテーブルを読むことを表す。赤い文字は問題が起きる箇所。">
            <SceneFigure />
          </Figure>
          <h3>運営担当が SALE10 を登録した</h3>
          <p>
            夏のセールのために、運営担当が管理画面から SALE10 を登録しました。運営担当は priority を「優先したいクーポンほど小さい値にする」ものと理解して 5 を入れ、stop は書きませんでした。stop を書かなければ、Rule.from_hash の既定値の false になります。
          </p>
          <Code
            lang="json"
            title="SALE10 の rules 列"
            code={`
{ "rules": [
  { "priority": 5,
    "conditions": [{ "fact": "subtotal", "op": "gte", "value": 5000 }],
    "actions": [{ "type": "percent_off", "value": 10 }] }
] }
`}
          />
          <h3>テストを実行すると</h3>
          <p>3つのクーポンの仕様と、「1つの注文にクーポンは1枚まで」という決まりを RSpec で書きました。before で db/seeds.rb を読み込み、運営担当が登録したのと同じ3つのクーポンを作ります。</p>
          <Code
            lang="ruby"
            title="spec/services/checkout_pricing_spec.rb（適用前）"
            code={`
require "rails_helper"

RSpec.describe CheckoutPricing do
  before { load Rails.root.join("db/seeds.rb") }

  let(:cart) { Cart.new(subtotal: 8_000, shipping_fee: 600) }

  def price(*codes) = CheckoutPricing.new(cart, codes).call

  it "OFF500 は3,000円以上で500円引き" do
    expect(price("OFF500")).to have_attributes(discount: 500, shipping_fee: 600)
  end

  it "SALE10 は5,000円以上で10%引き" do
    expect(price("SALE10")).to have_attributes(discount: 800, shipping_fee: 600)
  end

  it "FREESHIP は2,000円以上で送料無料" do
    expect(price("FREESHIP")).to have_attributes(discount: 0, shipping_fee: 0)
  end

  it "小計が条件に届かなければ割引しない" do
    small = Cart.new(subtotal: 2_500, shipping_fee: 600)
    expect(CheckoutPricing.new(small, ["OFF500"]).call).to have_attributes(discount: 0, shipping_fee: 600)
  end

  it "クーポンは1注文に1枚まで（2枚入力しても割引は1つだけ）" do
    result = price("OFF500", "SALE10")
    expect(result.applied.size).to eq(1), "適用したクーポン: #{result.applied.inspect}、割引: #{result.discount}円"
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/services/checkout_pricing_spec.rb）"
            code={`
....F

Failures:

  1) CheckoutPricing クーポンは1注文に1枚まで（2枚入力しても割引は1つだけ）
     Failure/Error: expect(result.applied.size).to eq(1), "適用したクーポン: #{result.applied.inspect}、割引: #{result.discount}円"
       適用したクーポン: ["SALE10", "OFF500"]、割引: 1300円
     # ./spec/services/checkout_pricing_spec.rb:29:in 'block (2 levels) in <top (required)>'

Finished in 0.10388 seconds (files took 0.98694 seconds to load)
5 examples, 1 failure
`}
          />
          <p>1枚ずつ使う4つの例は通りました。2枚を入力した例では、SALE10 の 800円と OFF500 の 500円の両方がかかり、割引は 1,300円になりました。</p>
          <h3>priority の値で結果が変わる</h3>
          <p>SALE10 の priority だけを 5・10・20 に変えて、同じカートに OFF500 と SALE10 を入力しました。開発環境の DB に db/seeds.rb の3つのクーポンを入れて実行しています。</p>
          <Code
            lang="ruby"
            title="script/try_priority.rb"
            code={`
# SALE10 の priority だけを変えて、OFF500 と SALE10 を両方入力したときの結果を比べる
cart = Cart.new(subtotal: 8_000, shipping_fee: 600)
sale = Coupon.find_by!(code: "SALE10")

[5, 10, 20].each do |priority|
  sale.rules["rules"][0]["priority"] = priority
  sale.save!
  result = CheckoutPricing.new(cart, %w[OFF500 SALE10]).call
  puts "SALE10 の priority=#{priority}: 適用 #{result.applied.inspect} 割引 #{result.discount}円 支払い #{cart.subtotal - result.discount + result.shipping_fee}円"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/try_priority.rb）"
            code={`
SALE10 の priority=5: 適用 ["SALE10", "OFF500"] 割引 1300円 支払い 7300円
SALE10 の priority=10: 適用 ["OFF500"] 割引 500円 支払い 8100円
SALE10 の priority=20: 適用 ["OFF500"] 割引 500円 支払い 8100円
`}
          />
          <p>
            コードもカートも入力も同じなのに、SALE10 の priority の値で支払いが 7,300円にも 8,100円にもなりました。priority が 5 のときは SALE10 が先に評価されます。SALE10 には stop がないので評価が続き、OFF500 の割引も加わります。20 のときは OFF500 が先に評価され、OFF500 の stop で評価が止まります。図 55-2 はこの2つの場合の評価の流れを並べたものです。
          </p>
          <Figure n="55-2" title="ルールを評価する流れ（priority が 5 のときと 20 のとき）" caption="小計 8,000円・送料 600円のカートに OFF500 と SALE10 を入力した場合。破線の箱は評価されないルール。">
            <EvaluationFigure />
          </Figure>
          <p>
            priority が同じ 10 のときは、OFF500 が先に評価されました。Ruby のドキュメントは sort_by について、同じ値を持つ要素の並びは不定で、安定ではない場合があると書いています<Ref n={6} />。この実行では、Coupon.where が DB から受け取った行の順番がそのまま残りました。しかし、その順番はアプリのコードのどこにも書かれていません。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>「1つの注文にクーポンは1枚まで」という決まりが、コードのどこにも書かれていません。すべてのクーポンに stop: true を書くという取り決めと priority の値の組み合わせによって、結果として1枚になっているだけです。</li>
            <li>1枚のクーポンの設定が別のクーポンの結果を変えます。SALE10 の priority を変えると、OFF500 が適用されるかどうかが変わりました。</li>
            <li>「この2つのコードを入力したら割引はいくらか」に答えるには、6つのファイル、Rule の既定値、3行の JSON、sort_by の並びの規則を読む必要があります。</li>
            <li>3種類の割引の計算は結局 Actions.build の case 文に書かれています。ルールエンジンはその case 文の手前に、並べ替え・条件の評価・評価を止める仕組みを加えたものです。</li>
            <li>Operators の eq・lte・in と、Facts の discount・shipping_fee は、3つのクーポンのどれも使っていません。</li>
          </ul>
          <p>次の節ではこの問題を KISS の考え方で整理します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'KISS の意味と由来：不必要な複雑さを避ける',
      body: (
        <>
          <h3>KISS の定義</h3>
          <p>
            <Term en="Keep It Simple, Stupid">KISS</Term>は Keep It Simple, Stupid の頭文字で、「単純にしておけ」という意味です。この部では次の定義で扱います。
          </p>
          <ul>
            <li>不必要に複雑な実装を避ける。</li>
            <li>シンプルで理解しやすい設計を優先する。</li>
          </ul>
          <p>
            ここでの「不必要に複雑」とは、解く問題が求める以上の仕組みを持ち込むことです。この章の問題は3種類のクーポンについて最低金額を比べ、3つの式のどれかで割引を計算することでした。ルールエンジンはこの問題に「ルールの並べ替え」「評価を止める仕組み」「条件をデータで書く仕組み」を加えました。割引が二重にかかった原因は、問題そのものではなく、加えたほうの仕組みにあります。
          </p>
          <p>
            反対に、問題が求める複雑さは減らせません。「割引は小計を超えない」「定率引きの率は100%以下」は業務の決まりなので、どの書き方でもどこかに書く必要があります。KISS が避けるのは、問題が求めていない複雑さだけです。
          </p>
          <h3>言葉の由来</h3>
          <p>
            KISS は、米国の航空機メーカー Lockheed の技術者 Kelly Johnson が言い出した言葉、あるいは1960年ごろに米海軍で使われ始めた言葉とされることが多いです<Ref n={5} />。ただし本書では、Johnson 自身が書いた資料や、当時の海軍の資料を確かめられませんでした。出どころを確かめられる資料が少ないため、この章では「とされることが多い」以上のことは書きません。ソフトウェアの原則として、特定の論文や書籍が最初に定義したものでもありません。
          </p>
          <h3>simple と easy の違い</h3>
          <p>
            Python の設計の考え方をまとめた PEP 20（The Zen of Python）には、「Simple is better than complex.（単純は複雑よりよい）」と「Complex is better than complicated.（複雑は、込み入っているよりよい）」という2つの行があります<Ref n={3} />。単純さを目指すことと、複雑さが避けられないときに込み入らせないことを、別々の行で書いています。
          </p>
          <p>
            Clojure の作者 Rich Hickey は、2011年の講演「Simple Made Easy」で、simple（単純）と easy（容易）を区別しました。講演のページの要約によると、easy は「手の届くところにある」「取りかかりやすい」ことです。simple は complex（複雑）の反対で、complex は「絡み合っている」「結び付けられている」ことです<Ref n={2} />。KISS の「シンプル」を考えるときは、この区別が役に立ちます。
          </p>
          <ul>
            <li>ルールエンジンは運営担当にとって easy に見えます。JSON を書けば、コードを直さずにクーポンを作れるからです。しかし simple ではありません。priority・stop・Facts の割引の値を通じて、別々のクーポンのルールが絡み合っています。</li>
            <li>case 文は、種類を足すたびに開発者がコードを直す必要があるので、運営担当にとって easy ではありません。しかし3つの種類の計算は互いに独立していて、1つの種類の変更が別の種類の結果を変えることはありません。</li>
          </ul>
          <p>
            なお、同じ要約は条件分岐（Conditionals）や switch 文を complex な構成要素に、ルール（Rules）を simple な構成要素に分類しています<Ref n={2} />。ルールという形そのものが複雑なわけではありません。この章のルールエンジンが複雑になったのは、評価の順番と、書き換えられる共有の値（Facts）によって、ルール同士が影響し合うからです。
          </p>
          <h3>ルールエンジンについての指摘</h3>
          <p>Martin Fowler は2009年の記事「RulesEngine」で、ルールエンジンについて次のように書いています<Ref n={1} />。</p>
          <ul>
            <li>ルールエンジンを導入する主な理由として「業務の担当者が、プログラマーを介さずに自分でルールを書けるようになる」ことがよく挙げられるが、実際にうまくいくことはまれである。</li>
            <li>ルールを1つずつ見ればそれぞれ正しく見えても、ルール同士の相互作用は複雑になりやすい。「導入は簡単だったが、暗黙の処理の流れを誰も理解できないので、保守がとても難しい」という話をよく聞く。</li>
            <li>ルールの数を制限し、狭い範囲だけで動く、その領域に特化した小さな仕組みにすることを勧める。</li>
          </ul>
          <p>
            Alex Papadimoulis は2006年に、この種の作り込みを<Term en="Inner-Platform Effect">内部プラットフォーム効果</Term>と名付けました。システムを自由にカスタマイズできるように作り込んだ結果、そのシステムを作るのに使った基盤の劣った複製になってしまうことです<Ref n={4} />。この章の rules 列は Ruby の if（conditions）、足し算（actions）、ループからの脱出（stop）を JSON で書き直したものです。JSON で書いたルールには、Ruby のコードのように単体で動かすテストやデバッガーがありません。SALE10 の priority と stop の誤りは、エンジン全体を動かして2枚のコードを入力するまで見つかりませんでした。
          </p>
          <h3>理解するために読む範囲</h3>
          <p>
            コードの単純さは、ある問いに答えるために読む範囲の広さで比べられます。図 55-3 は、「OFF500 と SALE10 を両方入力したら、割引はいくらか」に答えるために読む範囲を、ルールエンジンと、次の節で書く case 文とで比べたものです。ルールエンジンでは7つのファイルに加えて、JSON の値と、コードに書かれていない並べ替えの規則まで読む必要があります。
          </p>
          <Figure n="55-3" title="割引の額に答えるために読む範囲" caption="緑の箱はデータ、破線の箱はコードに書かれていない規則。">
            <ReadingScopeFigure />
          </Figure>
          <h3>似た原則との違い</h3>
          <p>KISS は、ほかの原則と同じ場面で使われることがよくあります。図 55-4 は、それぞれの原則が何を問うかを、この章のクーポンの例で比べたものです。</p>
          <Figure n="55-4" title="KISS と似た原則の違い" caption="どの原則も判断の基準で、互いに対立することがある。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">原則</th>
                    <th scope="col">何を問うか</th>
                    <th scope="col">クーポンの例での問い</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">KISS</th>
                    <td>今の問題を解く仕組みが、問題より複雑になっていないか</td>
                    <td>3種類の計算に、並べ替えと評価を止める仕組みが要るか</td>
                  </tr>
                  <tr>
                    <th scope="row">YAGNI</th>
                    <td>今使わない機能を作っていないか</td>
                    <td>eq・lte・in や、運営担当が新しい種類を作れる機能を、今使っているか</td>
                  </tr>
                  <tr>
                    <th scope="row">DRY</th>
                    <td>同じ知識を2か所に書いていないか</td>
                    <td>「1枚まで」の決まりを、各クーポンの stop に1つずつ書いていないか</td>
                  </tr>
                  <tr>
                    <th scope="row">AHA</th>
                    <td>実例が少ないうちに抽象化していないか</td>
                    <td>3つの実例から、どんな条件にも対応する形を作っていないか</td>
                  </tr>
                  <tr>
                    <th scope="row">OCP</th>
                    <td>既存のコードを変えずに振る舞いを足せるか</td>
                    <td>種類を足すときに、quote の case 文を書き換える必要があるか</td>
                  </tr>
                  <tr>
                    <th scope="row">Explicit over Implicit</th>
                    <td>処理の流れがコードに書かれているか</td>
                    <td>どちらのクーポンが先に評価されるかが、コードを読んでわかるか</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            YAGNI（<ChapterLink n={58} />）とは特に近い関係にあります。YAGNI は「その機能を今作るか」を問い、KISS は「作ると決めた機能を、どれだけ単純な仕組みで作るか」を問います。この章のルールエンジンは両方に反しています。使う予定のない演算子や事実を用意した点は YAGNI に、3種類の計算に並べ替えと評価を止める仕組みを持ち込んだ点は KISS に反します。
          </p>
          <p>
            OCP（<ChapterLink n={64} />）とは対立することがあります。OCP に沿って種類ごとのクラスを作れば、種類を足すときに既存のコードを変えずに済みますが、クラスとファイルの数は増えます。種類が3つの間は、case 文に1行足すほうが読む範囲は狭くなります。この対立は<ChapterLink n={93} section="kiss-ocp" />で、両方の書き方を比べて扱います。
          </p>
        </>
      ),
    },
    {
      id: 'apply',
      title: 'クーポンの種類を列で持ち、case 文で計算する',
      body: (
        <>
          <h3>直す順序</h3>
          <p>ルールエンジンを一度に消すのではなく、次の5つの手順に分けて直します。手順ごとにテストを実行し、壊れた所を手順の範囲で見つけられるようにします。</p>
          <ol>
            <li>今のクーポンの仕様を表に書き出す</li>
            <li>今の挙動をテストで確かめておく</li>
            <li>列を足し、JSON の内容を列に移す</li>
            <li>Coupon#quote を case 文で書き、CheckoutPricing がコードを1つだけ受け取るようにする</li>
            <li>ルールエンジンのファイルと rules 列を消す</li>
          </ol>
          <h3>手順1：今の仕様を表に書き出す</h3>
          <p>本番の coupons テーブルにある JSON を読み、3つのクーポンが実際に使っている項目を書き出しました。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">種類（kind）</th>
                  <th scope="col">使う値</th>
                  <th scope="col">割引の計算</th>
                  <th scope="col">使っていない項目</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">amount_off（定額引き）</th>
                  <td>金額・最低金額</td>
                  <td>min(金額, 小計)</td>
                  <td rowSpan={3}>eq・lte・in の演算子、subtotal 以外の fact、2つ以上の条件や割引</td>
                </tr>
                <tr>
                  <th scope="row">percent_off（定率引き）</th>
                  <td>率・最低金額</td>
                  <td>小計 × 率 ÷ 100（切り捨て）</td>
                </tr>
                <tr>
                  <th scope="row">free_shipping（送料無料）</th>
                  <td>最低金額</td>
                  <td>送料を 0 にする</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            書き出すと、どのクーポンも「最低金額の条件1つと、割引1つ」でできていることがわかります。priority と stop は「1枚まで」を表すためだけに使われていて、コードを1つしか受け取らなければ要りません。金額と率は同じ value の列に入れ、送料無料では使いません。
          </p>
          <h3>手順2：今の挙動をテストで確かめておく</h3>
          <p>
            前の節の spec/services/checkout_pricing_spec.rb のうち、1枚ずつ使う4つの例が今の仕様です。この4つは、直した後も同じ期待値で通る必要があります。2枚を入力する例は直したい不具合なので、直した後は「コードを1つしか受け取らない」形に変えます。テストを先に用意しておくと、手順3以降で計算を書き換えたときに、仕様が変わっていないことを同じ期待値で確かめられます。
          </p>
          <h3>手順3：列を足して JSON の内容を移す</h3>
          <p>
            coupons テーブルに kind（種類）・value（金額または率）・min_subtotal（最低金額）の列を足し、rules 列の JSON から値を移すマイグレーションを書きました。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000002_move_coupon_rules_to_columns.rb"
            code={`
class MoveCouponRulesToColumns < ActiveRecord::Migration[8.1]
  # マイグレーションの中だけで使うモデル。app/models/coupon.rb の変更に影響されない
  class MigrationCoupon < ActiveRecord::Base
    self.table_name = "coupons"
  end

  def up
    # 先に全件を列の値に変換できるか確かめる。MySQL では列の追加を取り消せないので、列を足す前に止める
    values = MigrationCoupon.all.to_h { |coupon| [coupon.id, columns_for(coupon)] }

    add_column :coupons, :kind, :string
    add_column :coupons, :value, :integer, null: false, default: 0
    add_column :coupons, :min_subtotal, :integer, null: false, default: 0
    values.each { |id, attrs| MigrationCoupon.where(id:).update_all(attrs) }
    change_column_null :coupons, :kind, false
  end

  def down
    remove_column :coupons, :kind
    remove_column :coupons, :value
    remove_column :coupons, :min_subtotal
  end

  private

  # ルール・条件・割引がそれぞれ1つで、条件が「小計が○円以上」のものだけを移す。それ以外は例外で止める
  def columns_for(coupon)
    rule = coupon.rules.fetch("rules").sole
    condition = rule.fetch("conditions").sole
    action = rule.fetch("actions").sole
    raise "条件が「小計が○円以上」ではない" unless condition.values_at("fact", "op") == %w[subtotal gte]

    { kind: action.fetch("type"), value: action.fetch("value", 0), min_subtotal: condition.fetch("value") }
  rescue => e
    raise "列に移せないクーポンです: #{coupon.code}（#{e.message}）"
  end
end
`}
          />
          <p>
            <code>sole</code> は Active Support が Enumerable に加えるメソッドで、要素がちょうど1つならその要素を返し、0個か2つ以上なら Enumerable::SoleItemExpectedError を投げます<Ref n={11} />。ルール・条件・割引が1つずつであることを、移す前に確かめるために使っています。列に移せない形のクーポンが1つでもあれば、どのクーポンかを示して止まります。
          </p>
          <p>
            運営担当が試しに登録した、段階的な割引のクーポン（TIER。小計 5,000円以上で10%、10,000円以上で15%の2つのルールを持つ）が残っている状態で実行すると、次のように止まりました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails db:migrate。TIER が残っているとき。トレースを省略）"
            code={`
bin/rails aborted!
StandardError: An error has occurred, all later migrations canceled: (StandardError)
列に移せないクーポンです: TIER（multiple items found）
Caused by:
Enumerable::SoleItemExpectedError: multiple items found (Enumerable::SoleItemExpectedError)
Tasks: TOP => db:migrate
== 20261121000002 MoveCouponRulesToColumns: migrating =========================
`}
          />
          <p>TIER は使われていなかったので、運営担当に確認して削除しました。もう一度実行すると、3つのクーポンの値が列に入りました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails db:migrate と、各クーポンの列の値）"
            code={`
== 20261121000002 MoveCouponRulesToColumns: migrating =========================
-- add_column(:coupons, :kind, :string)
   -> 0.0343s
-- add_column(:coupons, :value, :integer, {null: false, default: 0})
   -> 0.0331s
-- add_column(:coupons, :min_subtotal, :integer, {null: false, default: 0})
   -> 0.0344s
-- change_column_null(:coupons, :kind, false)
   -> 0.1257s
== 20261121000002 MoveCouponRulesToColumns: migrated (0.2734s) ================

OFF500 amount_off 500 3000
FREESHIP free_shipping 0 2000
SALE10 percent_off 10 5000
`}
          />
          <Callout kind="warn" title="MySQL では、失敗したマイグレーションの列の追加が残る">
            <p>
              このマイグレーションを最初に書いたときは、列を足してから JSON を確かめていました。TIER が残っている状態で実行すると例外で止まりましたが、もう一度実行すると <code>Mysql2::Error: Duplicate column name 'kind'</code> になりました。止まる前に実行した add_column が取り消されていなかったからです。Rails のガイドは、スキーマを変える文をトランザクションに含められない DB では、失敗したマイグレーションのうち成功した部分は戻らず、手で戻す必要があると説明しています<Ref n={12} />。MySQL で動かすマイグレーションでは、データを確かめる処理を、スキーマを変える処理より前に置きます。
            </p>
          </Callout>
          <h3>手順4：Coupon#quote を case 文で書く</h3>
          <p>Coupon に種類の enum とバリデーションを書き、割引を計算する quote を case 文で書きます。</p>
          <Code
            lang="ruby"
            title="app/models/coupon.rb（適用後）"
            code={`
class Coupon < ApplicationRecord
  # クーポンの種類は3つ。種類を足すときは、ここと quote の case に1行ずつ足す
  enum :kind, { amount_off: "amount_off", percent_off: "percent_off", free_shipping: "free_shipping" }, validate: true

  validates :code, presence: true, uniqueness: true
  validates :min_subtotal, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :value, numericality: { only_integer: true, greater_than: 0 }, unless: :free_shipping?
  validates :value, numericality: { less_than_or_equal_to: 100 }, if: :percent_off?

  # このクーポンをカートに使ったときの割引額と送料を返す
  def quote(cart)
    return Quote.new(discount: 0, shipping_fee: cart.shipping_fee) if cart.subtotal < min_subtotal

    case kind
    when "amount_off" then Quote.new(discount: [value, cart.subtotal].min, shipping_fee: cart.shipping_fee)
    when "percent_off" then Quote.new(discount: cart.subtotal * value / 100, shipping_fee: cart.shipping_fee)
    when "free_shipping" then Quote.new(discount: 0, shipping_fee: 0)
    else raise ArgumentError, "unknown kind: #{kind}"
    end
  end
end
`}
          />
          <ul>
            <li>
              <code>enum :kind, {'{ … }'}, validate: true</code> は、kind 列が取る値を3つに決めます。値を文字列にしているので、DB の列を見ても種類がわかります。validate: true を付けると、一覧にない値も代入でき、valid? や通常の保存時のバリデーションで誤りになります。指定を省くと、nil や空文字などを除き、未定義の値を代入した時点で ArgumentError になります<Ref n={8} />。
            </li>
            <li>金額と率は1以上、率は100以下、最低金額は0以上と決め、管理画面で誤った値を保存できないようにします。</li>
            <li>quote は最低金額に届かなければ割引なしを返し、届いていれば種類ごとの式で計算します。定額引きは小計を超えて引かないように <code>[value, cart.subtotal].min</code> とします。</li>
            <li>enum に種類を足して case に足し忘れた場合は、nil を返さずに ArgumentError を投げます。</li>
          </ul>
          <p>計算の結果は割引額と送料を持つ値のクラス Quote で返します。CheckoutPricing はコードを1つだけ受け取るように変えました。</p>
          <Code
            lang="ruby"
            title="app/models/quote.rb と app/services/checkout_pricing.rb（適用後）"
            code={`
# app/models/quote.rb
# クーポンを使った結果。割引額（discount）と送料（shipping_fee）を円で持つ
Quote = Data.define(:discount, :shipping_fee)

# app/services/checkout_pricing.rb
# カートに入力されたクーポンのコード（1つ）から、割引額と送料を計算する
class CheckoutPricing
  def initialize(cart, coupon_code)
    @cart = cart
    @coupon = Coupon.find_by(code: coupon_code) if coupon_code.present?
  end

  def call
    return Quote.new(discount: 0, shipping_fee: @cart.shipping_fee) unless @coupon

    @coupon.quote(@cart)
  end
end
`}
          />
          <p>
            テストは1枚ずつ使う4つの例を同じ期待値のまま残し、2枚の例を「コードがなければ割引しない」に変えました。クーポンのデータは列の値で作ります。Coupon のバリデーションと、定額引きが小計を超えないことも確かめます。
          </p>
          <Code
            lang="ruby"
            title="spec/services/checkout_pricing_spec.rb（適用後）"
            code={`
require "rails_helper"

RSpec.describe CheckoutPricing do
  before do
    Coupon.create!(code: "OFF500", kind: :amount_off, value: 500, min_subtotal: 3_000)
    Coupon.create!(code: "SALE10", kind: :percent_off, value: 10, min_subtotal: 5_000)
    Coupon.create!(code: "FREESHIP", kind: :free_shipping, min_subtotal: 2_000)
  end

  let(:cart) { Cart.new(subtotal: 8_000, shipping_fee: 600) }

  def price(code) = CheckoutPricing.new(cart, code).call

  it "OFF500 は3,000円以上で500円引き" do
    expect(price("OFF500")).to have_attributes(discount: 500, shipping_fee: 600)
  end

  # …（SALE10・FREESHIP・小計が条件に届かない例は適用前と同じ期待値。省略）

  it "コードがなければ割引しない" do
    expect(price(nil)).to have_attributes(discount: 0, shipping_fee: 600)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/models/coupon_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Coupon do
  it "知らない種類は保存できない" do
    coupon = Coupon.new(code: "X", kind: "buy_one_get_one", value: 1)
    expect(coupon).not_to be_valid
    expect(coupon.errors[:kind]).to eq ["is not included in the list"]
  end

  it "定率引きは100%を超えられない" do
    coupon = Coupon.new(code: "X", kind: :percent_off, value: 150)
    expect(coupon).not_to be_valid
    expect(coupon.errors[:value]).to eq ["must be less than or equal to 100"]
  end

  it "500円引きは小計が500円より少なければ小計までしか引かない" do
    coupon = Coupon.new(code: "X", kind: :amount_off, value: 500, min_subtotal: 0)
    expect(coupon.quote(Cart.new(subtotal: 300, shipping_fee: 600))).to eq Quote.new(discount: 300, shipping_fee: 600)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
Coupon
  知らない種類は保存できない
  定率引きは100%を超えられない
  500円引きは小計が500円より少なければ小計までしか引かない

環境
  MySQL 8.4 につながる

CheckoutPricing
  OFF500 は3,000円以上で500円引き
  SALE10 は5,000円以上で10%引き
  FREESHIP は2,000円以上で送料無料
  小計が条件に届かなければ割引しない
  コードがなければ割引しない

Finished in 0.1374 seconds (files took 0.96214 seconds to load)
9 examples, 0 failures
`}
          />
          <p>
            「環境」の例は、検証用のアプリが MySQL 8.4 につながることを確かめるもので、この章のコードとは関係ありません。1枚ずつ使う4つの例は適用前と同じ期待値で通りました。
          </p>
          <p>
            コードを1つしか受け取らないことは、コントローラーでも確かめられます。strong parameters の permit に <code>:coupon_code</code> と書くと、許可されるのは文字列や数値などのスカラー値だけで、配列は取り除かれます<Ref n={13} />。
          </p>
          <Code
            lang="ruby"
            title="script/permit_check.rb"
            code={`
# permit(:coupon_code) が、文字列と配列をそれぞれどう扱うかを確かめる
[{ coupon_code: "OFF500" }, { coupon_code: %w[OFF500 SALE10] }].each do |hash|
  params = ActionController::Parameters.new(hash)
  puts "#{hash.inspect} → #{params.permit(:coupon_code)[:coupon_code].inspect}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/permit_check.rb）"
            code={`
{coupon_code: "OFF500"} → "OFF500"
{coupon_code: ["OFF500", "SALE10"]} → nil
`}
          />
          <h3>手順5：ルールエンジンと rules 列を消す</h3>
          <p>
            app/services/rule_engine/ の6つのファイルを消し、次のマイグレーションで rules 列を消しました。db/seeds.rb も列の値で書き直し、テストがすべて通ることを確かめています。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000003_remove_rules_from_coupons.rb"
            code={`
class RemoveRulesFromCoupons < ActiveRecord::Migration[8.1]
  def change
    remove_column :coupons, :rules, :json, null: false
  end
end
`}
          />
          <p>
            本番で動いているアプリから列を消すときは、先に ignored_columns でモデルが rules 列を扱わないようにしたコードを配布し、すべてのプロセスが入れ替わってから列を消します。手順は<ChapterLink n={27} section="live-change" />で説明しています。
          </p>
          <h3>直す前と後の比較</h3>
          <p>
            図 55-5 は直す前と後の構造を比べたものです。適用前は「1注文に1枚」がデータの組み合わせで決まっていました。適用後は CheckoutPricing の引数が1つなので、2枚目のコードを受け取る場所がありません。種類ごとの計算は Coupon#quote の case 文の1行ずつに書かれていて、1つの種類の変更が別の種類の結果を変えることはありません。
          </p>
          <Figure n="55-5" title="直す前と後の構造" caption="実線の矢印は呼び出し、破線の矢印はテーブルを読むことを表す。">
            <BeforeAfterFigure />
          </Figure>
          <h3>複雑さを数える</h3>
          <p>
            「単純になった」と感じるだけでなく、数えて比べます。Ruby 3.3 から標準で入っている構文解析器 Prism<Ref n={15} />で Ruby のファイルを読み、行数・分岐の数・クラスとモジュールの数を数えるスクリプトを書きました。
          </p>
          <Code
            lang="ruby"
            title="script/complexity.rb"
            code={`
# 割引の計算を理解するために読むファイルについて、行数・分岐の数・クラスとモジュールの数を数える
# 実行: ruby script/complexity.rb <ファイル> ...
require "prism"
require "set"

# 分岐として数える構文：if・unless（修飾子と三項演算子を含む）・case の when・&&・||・while・until・rescue 修飾子
BRANCHES = [Prism::IfNode, Prism::UnlessNode, Prism::WhenNode, Prism::AndNode, Prism::OrNode,
            Prism::WhileNode, Prism::UntilNode, Prism::RescueModifierNode].freeze

def walk(node, &block)
  return unless node

  yield node
  node.compact_child_nodes.each { |child| walk(child, &block) }
end

total_lines = 0
total_branches = 0
names = Set.new # クラス・モジュール・Data.define の定数名（同じ名前は1つと数える）
ARGV.each do |path|
  source = File.read(path)
  lines = source.lines.count { |l| !l.strip.empty? && !l.strip.start_with?("#") }
  branches = 0
  walk(Prism.parse(source).value) do |node|
    branches += 1 if BRANCHES.any? { |klass| node.is_a?(klass) }
    case node
    when Prism::ClassNode, Prism::ModuleNode then names << node.constant_path.slice
    when Prism::ConstantWriteNode then names << node.name.to_s if node.value.slice.start_with?("Data.define")
    end
  end
  printf("%-40s %4d 行  分岐 %2d\\n", path, lines, branches)
  total_lines += lines
  total_branches += branches
end
printf("%-40s %4d 行  分岐 %2d  ファイル %d  クラス・モジュール %d\\n", "合計", total_lines, total_branches, ARGV.size, names.size)
`}
          />
          <Code
            lang="text"
            title="実行結果（適用前：ruby script/complexity.rb app/services/checkout_pricing.rb app/services/rule_engine/*.rb app/models/coupon.rb app/models/cart.rb）"
            code={`
app/services/checkout_pricing.rb            9 行  分岐  0
app/services/rule_engine/actions.rb        21 行  分岐  3
app/services/rule_engine/condition.rb      15 行  分岐  0
app/services/rule_engine/evaluator.rb      20 行  分岐  2
app/services/rule_engine/facts.rb          21 行  分岐  3
app/services/rule_engine/operators.rb      13 行  分岐  0
app/services/rule_engine/rule.rb           25 行  分岐  0
app/models/coupon.rb                        3 行  分岐  0
app/models/cart.rb                          1 行  分岐  0
合計                                        128 行  分岐  8  ファイル 9  クラス・モジュール 14
`}
          />
          <Code
            lang="text"
            title="実行結果（適用後：ruby script/complexity.rb app/services/checkout_pricing.rb app/models/coupon.rb app/models/quote.rb app/models/cart.rb）"
            code={`
app/services/checkout_pricing.rb           10 行  分岐  2
app/models/coupon.rb                       16 行  分岐  4
app/models/quote.rb                         1 行  分岐  0
app/models/cart.rb                          1 行  分岐  0
合計                                         28 行  分岐  6  ファイル 4  クラス・モジュール 4
`}
          />
          <p>
            図 55-6 はこの結果に「結果を左右するデータの項目」を加えて並べたものです。データの項目は、適用前は JSON の priority・stop・fact・op・value（条件）・type・value（割引）の7つ、適用後は kind・value・min_subtotal の3つです。
          </p>
          <Figure n="55-6" title="複雑さを数えた結果（適用前と適用後）" caption="読むファイル・行数・分岐・クラスとモジュールは script/complexity.rb で数えた。データの項目は JSON のキーとテーブルの列を数えた。">
            <MetricsFigure />
          </Figure>
          <p>
            行数は 128 から 28 に、クラスとモジュールは 14 から 4 に減りました。一方で、分岐の数は 8 から 6 で、ほとんど変わっていません。適用後のコードは enum のバリデーションと最低金額の比較を足しているので、分岐の数だけを見ると差が出ないのです。ルールエンジンの複雑さは if の数ではなく、ファイルとクラスの間を行き来する呼び出しと、評価の順番を決めるデータに表れています。複雑さを測るときは、1つの数字ではなく、読むファイルの数・クラスの数・結果を左右するデータの項目を組み合わせて見ます。
          </p>
          <p>
            業務では RuboCop の Metrics/CyclomaticComplexity（メソッドの中を通る独立した経路の数を数え、既定では 7 を超えると警告）や Metrics/PerceivedComplexity（読む人が感じる複雑さに近づけた点数で、既定の上限は 8）で、メソッドごとの<Term en="cyclomatic complexity">循環的複雑度</Term>を見張ることができます<Ref n={16} />。ただし、どちらもメソッドの中だけを数えるので、この章のルールエンジンのように、1つ1つのメソッドは短く、複雑さがメソッドとデータの組み合わせにある場合は、数字に表れません。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '単純にしすぎたとき：検証を省く・詰め込む・case 文を育て続ける',
      body: (
        <>
          <p>KISS を「コードを少なくすること」と受け取ると、かえって間違いやすいコードや、読みにくいコードになります。この節では KISS を当てはめすぎた3つの例を動かします。</p>
          <h3>必要な検証まで省いたコード</h3>
          <p>
            「単純にするために」バリデーションと定額引きの上限の処理を省いたクーポンを書きました。管理画面で 15 と入力するつもりが 150 と入力した、という場面を作ります。テスト用の DB で、トランザクションの中で実行して最後に取り消しています。
          </p>
          <Code
            lang="ruby"
            title="script/overuse/bare_coupon.rb"
            code={`
# 「短くするために」検証と上限の処理を省いたクーポン（当てはめすぎの例）
class BareCoupon < ApplicationRecord
  self.table_name = "coupons"

  def quote(cart)
    return Quote.new(discount: 0, shipping_fee: cart.shipping_fee) if cart.subtotal < min_subtotal

    case kind
    when "amount_off" then Quote.new(discount: value, shipping_fee: cart.shipping_fee)
    when "percent_off" then Quote.new(discount: cart.subtotal * value / 100, shipping_fee: cart.shipping_fee)
    when "free_shipping" then Quote.new(discount: 0, shipping_fee: 0)
    end
  end
end

cart = Cart.new(subtotal: 8_000, shipping_fee: 600)
# 管理画面で 15 と入力するつもりが 150 と入力した
typo = BareCoupon.create!(code: "SALE15", kind: "percent_off", value: 150, min_subtotal: 5_000)
quote = typo.quote(cart)
puts "BareCoupon: 割引 #{quote.discount}円 支払い #{cart.subtotal - quote.discount + quote.shipping_fee}円"

# 同じ値を Coupon（適用後）で確かめると
coupon = Coupon.new(code: "SALE15B", kind: :percent_off, value: 150, min_subtotal: 5_000)
puts "Coupon: valid? #{coupon.valid?} #{coupon.errors.full_messages.inspect}"
`}
          />
          <Code
            lang="text"
            title={'実行結果（bin/rails runner \'ActiveRecord::Base.transaction { load "script/overuse/bare_coupon.rb"; raise ActiveRecord::Rollback }\'）'}
            code={`
BareCoupon: 割引 12000円 支払い -3400円
Coupon: valid? false ["Value must be less than or equal to 100"]
`}
          />
          <p>
            BareCoupon は 150% の割引を保存でき、支払いがマイナスの 3,400円になりました。「率は100%以下」「割引は小計を超えない」は業務の決まりで、問題が求める複雑さです。KISS が避けるのは問題が求めていない仕組みで、必要な検証は省きません。Coupon のバリデーションは7行ですが、どれも業務の決まりを1つずつ書いたもので、互いに絡み合っていません。
          </p>
          <h3>行数を減らすために詰め込んだコード</h3>
          <p>次は quote を短くするために、計算をラムダのハッシュにまとめて1行に詰め込んだ例です。</p>
          <Code
            lang="ruby"
            title="script/overuse/packed_coupon.rb"
            code={`
# 行数を減らすために詰め込んだ quote（当てはめすぎの例）
class PackedCoupon < ApplicationRecord
  self.table_name = "coupons"

  RULES = {
    "amount_off" => ->(v, c) { [[v, c.subtotal].min, c.shipping_fee] },
    "percent_off" => ->(v, c) { [c.subtotal * v / 100, c.shipping_fee] },
    "free_shipping" => ->(_, _) { [0, 0] }
  }.freeze

  def quote(c) = Quote.new(*(c.subtotal < min_subtotal ? [0, c.shipping_fee] : RULES.fetch(kind).(value, c)))
end
`}
          />
          <Code
            lang="text"
            title="実行結果（2つのカートと3つのクーポンで Coupon と比べた結果と、script/complexity.rb の結果）"
            code={`
8000円 OFF500: Coupon と同じ結果か true
8000円 SALE10: Coupon と同じ結果か true
8000円 FREESHIP: Coupon と同じ結果か true
2500円 OFF500: Coupon と同じ結果か true
2500円 SALE10: Coupon と同じ結果か true
2500円 FREESHIP: Coupon と同じ結果か true

app/models/coupon.rb                       16 行  分岐  4
script/overuse/packed_coupon.rb             9 行  分岐  1
`}
          />
          <p>
            結果は Coupon と同じで、分岐の数は 4 から 1 に減りました。数字だけを見ると単純になっています。しかし、quote の1行を読むには、三項演算子・ラムダの <code>.()</code> による呼び出し・配列を引数に展開する <code>*</code>・配列の1番目が割引で2番目が送料という並びの約束を、すべて頭に置く必要があります。書いた人にとっては短く書けて easy ですが、読む人にとって simple ではありません。前の節の数字は読む範囲を比べる目安であって、数字を小さくすること自体が目的ではありません。
          </p>
          <h3>種類が増えても case 文を守り続けたコード</h3>
          <p>
            反対に、要件が増えても「case 文が単純だから」と1つのメソッドに足し続けた場合を考えます。次は、2年の間に種類が7つ、共通の条件（期間・初回の注文だけ・会員ランク）が5つに増えた quote の例です。この例は動かしておらず、構文の解析だけを行っています。
          </p>
          <Code
            lang="ruby"
            title="script/overuse/grown_coupon.rb"
            code={`
# 種類と条件を quote の case 文に足し続けた例（当てはめすぎの例。種類が7つ、共通の条件が5つになった）
class GrownCoupon < ApplicationRecord
  self.table_name = "coupons"

  def quote(cart, member:, now: Time.current)
    none = Quote.new(discount: 0, shipping_fee: cart.shipping_fee)
    return none if cart.subtotal < min_subtotal
    return none if starts_at && now < starts_at
    return none if ends_at && now >= ends_at
    return none if first_order_only && member.orders_count > 0
    return none if required_rank && Member::RANKS.index(member.rank) < Member::RANKS.index(required_rank)

    case kind
    when "amount_off"
      Quote.new(discount: [value, cart.subtotal].min, shipping_fee: cart.shipping_fee)
    when "percent_off"
      discount = cart.subtotal * value / 100
      discount = [discount, max_discount].min if max_discount
      Quote.new(discount:, shipping_fee: cart.shipping_fee)
    when "free_shipping"
      Quote.new(discount: 0, shipping_fee: 0)
    when "category_percent_off"
      base = cart.items.select { |item| item.category == category }.sum(&:price)
      Quote.new(discount: base * value / 100, shipping_fee: cart.shipping_fee)
    when "tiered_percent_off"
      rate = cart.subtotal >= upper_subtotal ? upper_value : value
      Quote.new(discount: cart.subtotal * rate / 100, shipping_fee: cart.shipping_fee)
    when "buy_two_get_one"
      targets = cart.items.select { |item| item.category == category }.sort_by(&:price)
      Quote.new(discount: targets.size >= 3 ? targets.first.price : 0, shipping_fee: cart.shipping_fee)
    when "amount_off_and_free_shipping"
      Quote.new(discount: [value, cart.subtotal].min, shipping_fee: 0)
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（ruby script/complexity.rb app/models/coupon.rb script/overuse/grown_coupon.rb）"
            code={`
app/models/coupon.rb                       16 行  分岐  4
script/overuse/grown_coupon.rb             32 行  分岐 19
`}
          />
          <p>
            1つのメソッドの分岐が 19 になりました。coupons テーブルには、一部の種類でしか使わない列（max_discount・category・upper_subtotal・upper_value）が増え、ほかの種類の行ではそれらが NULL のままです。定率引きの上限を変えたいだけでも、7つの種類と5つの条件が並ぶメソッドを開き、ほかの種類に影響しないことを確かめる必要があります。種類ごとに使う列や計算が違ってきたら、種類ごとのクラスに分ける時期です。分け方は<ChapterLink n={41} />（Strategy / Policy）で扱っています。
          </p>
          <p>
            この時期の判断は KISS と OCP（<ChapterLink n={64} />）の対立そのものです。種類が3つのときに種類ごとのクラスを作るのは KISS に反し、種類が7つになっても case 文に足し続けるのは OCP に反します。どちらが正しいかは、種類の数と、変更の頻度で変わります。
          </p>
          <h3>判断の目安</h3>
          <p>
            図 55-7 は割引の種類と条件の数を横軸に、誰がどのくらいの頻度で変えるかを縦軸にとって、向いている作り方を4つに分けたものです。この章の場面は左下で、列と case 文が向いています。最初のルールエンジンは3種類しかないのに、右上で使う道具を選んでいました。運営担当が毎週ルールを足す必要が実際に生じたときでも、Fowler の勧めのとおり、ルールの数を制限し、範囲を絞った仕組みから始めます<Ref n={1} />。
          </p>
          <Figure n="55-7" title="当てはめすぎの判断：種類の数と、変える人・頻度" caption="模式図。境目の数は決まっていないので、チームで決める。破線の箱は、導入するならテストと評価の記録を一緒に用意することを表す。">
            <JudgeFigure />
          </Figure>
          <p>図の位置を決めるときは、次の問いを順に確かめます。</p>
          <ol>
            <li>今ある種類と条件は、いくつか。それぞれを、どの値で表せるか（手順1の表を書けるか）</li>
            <li>変えるのは誰か。値だけを変えるのか、計算の種類を足すのか</li>
            <li>種類ごとに、使う値や計算の形が違ってきていないか（一部の種類でしか使わない列が増えていないか）</li>
            <li>1つの変更で開くファイルと、確かめるテストの数は、問題の大きさに見合っているか</li>
            <li>省こうとしている処理は、業務の決まり（必要な検証）ではないか</li>
          </ol>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能・規約と KISS',
      body: (
        <>
          <h3>Rails の標準機能で表す</h3>
          <p>この章の適用後のコードは Rails と Ruby の標準機能だけで書いています。自分で仕組みを作る前に、標準機能で表せないかを先に確かめると、読む人が知っている書き方の範囲に収まります。</p>
          <ul>
            <li>
              enum：列が取る値に名前を付け、<code>percent_off?</code> のような問い合わせのメソッドと、<code>Coupon.percent_off</code> のようなスコープを定義します。validate: true を付けると、Rails は enum の値の一覧で validates_inclusion_of を定義します<Ref n={9} />。enum の基本は<ChapterLink n={11} section="attribute-api" />で扱っています。
            </li>
            <li>バリデーション：numericality の only_integer・greater_than・less_than_or_equal_to と、if・unless で、業務の決まりを1行ずつ書けます。バリデーションの仕組みは<ChapterLink n={14} section="validations" />で扱っています。</li>
            <li>Data.define：Cart と Quote のような、計算の入力と結果を表す値のクラスを1行で書けます。値のクラスの考え方は<ChapterLink n={33} section="value-objects" />で扱っています。</li>
            <li>Enumerable#sole：データを移すときに「ちょうど1つ」であることを確かめられます<Ref n={11} />。</li>
          </ul>
          <Callout kind="v72">
            <p>
              enum の validate オプションは Rails 7.1 で追加されたので<Ref n={10} />、Rails 7.2 でも同じように書けます。Rails 7.0 では validate を選べず、空でない未定義の値を代入すると ArgumentError になります。Data.define は Ruby 3.2 で追加されたクラスで<Ref n={14} />、Rails 7.2 が動く Ruby 3.1<Ref n={17} /> では使えません。Ruby 3.1 では、<code>Struct.new(:discount, :shipping_fee, keyword_init: true)</code> や通常のクラスで代わりに書きます。script/complexity.rb が使う Prism は、Ruby 3.3 から標準で入っています<Ref n={15} />。
            </p>
          </Callout>
          <h3>Rails Doctrine と KISS</h3>
          <p>
            Rails の設計思想をまとめた Rails Doctrine は、KISS という言葉は使っていませんが、単純さについていくつかの柱で書いています<Ref n={7} />。
          </p>
          <ul>
            <li>
              Convention over Configuration（設定より規約）：主キーの名前のような、毎回考える価値のない決定を規約に任せることで、本当に大事な部分に時間を使えると説明しています。規約から外れることの費用は過小評価されている、とも書いています。この章のルールエンジンは Ruby の if と足し算で書ける部分を、自分たちで決めた JSON の書き方に置き換えていました。
            </li>
            <li>
              Exalt beautiful code（美しいコードを称える）：belongs_to・has_many・validates_presence_of を並べたモデルの例を挙げ、特別なことは何もしていないが単純で、少ない宣言から大きな力が得られると書いています。適用後の Coupon も enum と validates の宣言と、短い case 文だけでできています。
            </li>
            <li>
              Value integrated systems（統合されたシステムを重んじる）：統合されたシステムでは不要な抽象化を省けると書き、システムの要素の間に境界を作ることが複雑さの多くを生むと述べています。この章では、データ（JSON）とコード（Ruby）の間に、自作の評価の仕組みという境界を作っていました。
            </li>
          </ul>
          <p>
            一方で、Doctrine は Ruby について、人の目には単純で美しく見えるものが、内部では複雑な仕組みで支えられていることが多いとも書いています<Ref n={7} />。Rails の enum や validates の内部は単純ではありません。KISS を当てはめるのは、自分たちが読み、直し続けるアプリのコードです。よく使われ、テストされたフレームワークの中に複雑さを任せることで、アプリのコードを単純に保てます。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={58} />（YAGNI）：使う予定のない機能を先に作らない、という判断を扱います。この章のルールエンジンが持っていた、使われていない演算子と事実はその例です。
            </li>
            <li>
              <ChapterLink n={41} />（Strategy / Policy）：種類ごとに計算や使う値が違ってきたときに、種類ごとのクラスに分ける方法を扱います。
            </li>
            <li>
              <ChapterLink n={62} />（Explicit over Implicit）：この章の priority による暗黙の評価順のように、コードに書かれていない処理の流れを表に出す方法を扱います。
            </li>
            <li>
              <ChapterLink n={76} />（AHA）：3つの実例からすぐに汎用の形を作らない、という判断を扱います。
            </li>
            <li>
              <ChapterLink n={33} section="service-contract" />：CheckoutPricing のようなサービスのクラスの入力と結果の決め方を扱っています。
            </li>
            <li>
              <ChapterLink n={56} section="rails-doctrine" />と<ChapterLink n={31} section="doctrine" />：Rails Doctrine と原則の対応、DHH の考え方を扱っています。
            </li>
            <li>
              <ChapterLink n={93} section="kiss-ocp" />：KISS と OCP の対立を、両方の書き方を比べて扱います。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          割引の種類が3つで、計算の種類を足すのが開発者のリリースのときだけなら、列と case 文で足ります。業務の決まりから来る検証は単純にするためでも省きません。種類ごとに使う列や計算が分かれてきたら、種類ごとのクラスに分けることを検討します。
        </>
      ),
      benefit: {
        text: <>ルールエンジンを列と case 文に置き換えると、行数が 128 から 28 に、クラスとモジュールが 14 から 4 に、結果を左右するデータの項目が7つから3つに減った。CheckoutPricing の引数が1つになり、2枚目のクーポンを受け取る場所がなくなった。</>,
        basis: <ChapterLink n={57} section="apply" />,
      },
      cost: {
        text: <>運営担当が JSON の条件を書き換えて割引を作ることはできなくなる。種類が7つ、共通の条件が5つに増えても case 文に足し続けた例では、quote の分岐が 19 になり、一部の種類でしか使わない列が4つ増えた。</>,
        basis: <ChapterLink n={57} section="overuse" />,
      },
      alternative: {
        text: <>種類ごとに使う値や計算が違ってきたら、種類ごとのクラス（Strategy・Policy）に分ける。値だけを変えるなら、金額・率・最低金額・期間を管理画面で変えられるようにする。運営担当が毎週ルールを足す必要が実際に生じたときは、ルールの数を制限した仕組みから始める。</>,
        basis: <ChapterLink n={57} section="overuse" />,
      },
      criterion: {
        text: <>今ある種類と条件の数、変えるのは誰か、1つの変更で開くファイルとテストの数を確かめる。分岐の数は 8 から 6 でほとんど変わらなかったので、1つの数字では比べない。率の上限のような検証を省いた例では、支払いがマイナスの 3,400円になった。</>,
        basis: <ChapterLink n={57} section="apply" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>KISS は不必要に複雑な実装を避け、シンプルで理解しやすい設計を優先するという判断の基準です。避けるのは問題が求めていない複雑さで、業務の決まりから来る検証は省きません。</li>
          <li>3種類のクーポンのために作った汎用のルールエンジンでは、priority と stop の組み合わせで割引が二重にかかり、同じ入力でも JSON の値で結果が変わりました。「1注文に1枚」という決まりはコードのどこにも書かれていませんでした。</li>
          <li>KISS は Kelly Johnson や米海軍に由来するとされることが多い言葉ですが、出どころを確かめられる資料は少ないです。simple（絡み合っていない）と easy（取りかかりやすい）を区別すると、運営担当には easy に見えるルールエンジンが simple ではない理由を説明できます。</li>
          <li>直すときは、仕様を表に書き出し、今の挙動をテストで確かめ、列を足してデータを移し、case 文に書き換え、最後に古い仕組みを消す、という順に分けます。MySQL ではデータを確かめる処理をスキーマの変更より前に置きます。</li>
          <li>複雑さは読むファイルの数・行数・クラスの数・結果を左右するデータの項目を組み合わせて比べます。この章の例では分岐の数はほとんど変わらず、1つの数字だけでは差が見えませんでした。</li>
          <li>検証を省く、行数を減らすために詰め込む、種類が増えても case 文に足し続ける、は当てはめすぎです。種類ごとに使う値や計算が違ってきたら、種類ごとのクラスに分けることを検討します。</li>
          <li>Rails の enum・バリデーション・Data.define で表せる問題には、自作の仕組みを持ち込まないことが、Rails Doctrine の Convention over Configuration とも一致します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'RulesEngine', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/RulesEngine.html', accessed: '2026-11-21', version: '2009年1月7日', note: 'ルールエンジン（プロダクションルールシステム）の説明、業務の担当者がルールを書くという狙いがうまくいくことはまれであること、ルール同士の相互作用と暗黙の処理の流れによる保守の難しさ、ルールの数を制限し範囲を絞った仕組みを勧めること。' },
    { title: 'Simple Made Easy', publisher: 'InfoQ / Rich Hickey（Strange Loop 2011）', url: 'https://www.infoq.com/presentations/Simple-Made-Easy/', accessed: '2026-11-21', version: '2011年10月20日公開', note: '講演ページの要約（Key Takeaways）。simple と easy の区別、complex は絡み合っていること、Conditionals と Switch を complex に、Rules を simple に分類していること。' },
    { title: 'PEP 20 – The Zen of Python', publisher: 'Python Software Foundation / Tim Peters', url: 'https://peps.python.org/pep-0020/', accessed: '2026-11-21', note: '「Simple is better than complex.」「Complex is better than complicated.」の行。' },
    { title: 'The Inner-Platform Effect', publisher: 'The Daily WTF / Alex Papadimoulis', url: 'https://thedailywtf.com/articles/The_Inner-Platform_Effect', accessed: '2026-11-21', version: '2006年4月21日', note: 'カスタマイズできるように作り込んだシステムが、それを作った基盤の劣った複製になるという内部プラットフォーム効果の定義。' },
    { title: 'KISS principle', publisher: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/KISS_principle', accessed: '2026-11-21', note: 'KISS が Kelly Johnson や1960年の米海軍に結び付けて説明されることが多いことの例として参照した二次資料。Johnson の伝記的記録（米国科学アカデミー）と当時の新聞の記事は取得できず、本書では一次資料を確かめていない。' },
    { title: 'Enumerable#sort_by', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Enumerable.html#method-i-sort_by', accessed: '2026-11-21', version: 'Ruby 4.0', note: '同じ値を持つ要素の並びは不定で、安定ではない場合があること。' },
    { title: 'The Rails Doctrine', publisher: 'Ruby on Rails / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: 'Convention over Configuration、Exalt beautiful code、Value integrated systems の内容。Ruby が内部の複雑な仕組みで単純に見せていること（Optimize for programmer happiness）。' },
    { title: 'ActiveRecord::Enum', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Enum.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'validate オプションを付けると、知らない値の代入で ArgumentError を投げずにバリデーションで誤りにすること。' },
    { title: 'activerecord/lib/active_record/enum.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/enum.rb#L249-L285`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'validate でないときは raise_on_invalid_values を有効にし、validate のときは validates_inclusion_of を定義すること。' },
    { title: 'Ruby on Rails 7.1 Release Notes', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/7_1_release_notes.html', accessed: '2026-11-21', version: 'Rails 7.1', note: 'Active Record の Notable changes に「Add validation option for enum.」があること。' },
    { title: 'activesupport/lib/active_support/core_ext/enumerable.rb（sole）', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/core_ext/enumerable.rb#L204-L229`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'sole が要素が1つならそれを返し、0個なら no item found、2つ以上なら multiple items found の SoleItemExpectedError を投げること。' },
    { title: 'Active Record Migrations（Transactions）', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_migrations.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'スキーマを変える文をトランザクションに含められない DB では、失敗したマイグレーションの成功した部分が戻らず、手で戻す必要があること。MySQL での再実行が Duplicate column name になることは実行して確認した。' },
    { title: 'Action Controller Overview（Strong Parameters）', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/action_controller_overview.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'permit したキーの値は許可されたスカラー値でなければならず、配列やハッシュは既定では取り除かれること。' },
    { title: 'Ruby 3.2.0 Released', publisher: 'ruby-lang.org', url: 'https://www.ruby-lang.org/en/news/2022/12/25/ruby-3-2-0-released/', accessed: '2026-11-21', version: 'Ruby 3.2.0', note: '値オブジェクトを表す新しいコアクラス Data が追加されたこと。' },
    { title: 'Ruby 3.3.0 Released', publisher: 'ruby-lang.org', url: 'https://www.ruby-lang.org/en/news/2023/12/25/ruby-3-3-0-released/', accessed: '2026-11-21', version: 'Ruby 3.3.0', note: '構文解析器 Prism が default gem として入ったこと。script/complexity.rb は Ruby 4.0.9 で実行した。' },
    { title: 'Metrics（CyclomaticComplexity・PerceivedComplexity）', publisher: 'RuboCop Docs', url: 'https://docs.rubocop.org/rubocop/latest/cops_metrics.html', accessed: '2026-11-21', version: 'RuboCop 1.92', note: '循環的複雑度は独立した経路の数で、判断の箇所を数えて1を足すこと。既定の上限は CyclomaticComplexity が 7、PerceivedComplexity が 8。' },
    { title: 'Ruby on Rails 7.2 Release Notes', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/7_2_release_notes.html', accessed: '2026-11-21', version: 'Rails 7.2', note: 'Rails 7.2 の Ruby の最低バージョンが 3.1 であること。' },
  ],
}

export default chapter
