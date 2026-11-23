import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 62-1 注文の状態を書き込む処理と読む処理 ---------- */
const sceneWriters = [
  { y: 34, lines: ['管理画面「発送を取り消す」', 'cancel_shipment!', 'update!(status: :paid)'], note: 'shipped_at と追跡番号が残る' },
  { y: 144, lines: ['会員の画面「キャンセル」', '古い画面から cancel!', 'update!(status: :cancelled, …)'], note: '発送済みの注文がキャンセルになる' },
  { y: 254, lines: ['配達完了の CSV の取り込み', 'DeliveryImport', 'update_all(status: "delivered")'], note: 'delivered_at が空のまま' },
]
const sceneReaders = [
  { y: 34, lines: ['倉庫の発送待ちの一覧', 'Order.paid'], note: 'status を見る' },
  { y: 144, lines: ['月次の発送件数', 'where(shipped_at: 11月)'], note: 'shipped_at を見る' },
  { y: 254, lines: ['会員の注文の詳細', 'order_summary(order)'], note: 'status と shipped_at の両方を見る' },
]

function SceneFigure() {
  return (
    <Svg
      id="62-1"
      w={780}
      h={400}
      label="左に orders テーブルへ書き込む3つの処理、中央に orders テーブル、右に読む3つの処理を並べた。管理画面の発送の取り消しは status だけを paid に戻し、shipped_at と追跡番号が残る。会員が古い画面から押したキャンセルは、発送済みの注文を cancelled にする。配達完了の CSV の取り込みは update_all で status だけを delivered にし、delivered_at が空のまま残る。読む側は、倉庫の発送待ちの一覧が status を、月次の発送件数が shipped_at を、会員の注文の詳細が両方を見るので、結果が食い違う"
    >
      <T x={20} y={16} bold>
        書き込む処理
      </T>
      <T x={390} y={16} anchor="middle" bold>
        MySQL
      </T>
      <T x={530} y={16} bold>
        読む処理
      </T>
      {sceneWriters.map((w) => (
        <g key={w.note}>
          <Box x={20} y={w.y} w={230} h={64} lines={w.lines} fs={12} bold subTone="muted" />
          <Arrow x1={250} y1={w.y + 32} x2={298} y2={Math.min(Math.max(w.y + 32, 80), 270)} />
          <T x={20} y={w.y + 80} fs={11} tone="danger">
            {w.note}
          </T>
        </g>
      ))}
      <Box x={300} y={60} w={180} h={230} lines={['orders', 'status', 'paid_at', 'shipped_at', 'tracking_number', 'delivered_at', 'cancelled_at']} fs={12} fill="box4" bold mono />
      {sceneReaders.map((r) => (
        <g key={r.note}>
          <Box x={530} y={r.y} w={230} h={64} lines={r.lines} fs={12} bold subTone="muted" />
          <Arrow x1={528} y1={r.y + 32} x2={482} y2={Math.min(Math.max(r.y + 32, 80), 270)} dashed />
          <T x={530} y={r.y + 80} fs={11} tone="muted">
            {r.note}
          </T>
        </g>
      ))}
      <T x={20} y={360} fs={12} tone="danger">
        「発送したか」を status と shipped_at の2か所に持つので、片方だけを書き換える処理があると食い違う
      </T>
      <T x={20} y={384} fs={11} tone="muted">
        実線の矢印は書き込み、破線の矢印は読み取り。緑の箱は MySQL のテーブル
      </T>
    </Svg>
  )
}

/* ---------- 図 62-2 状態と4つの日時の列の組み合わせ ---------- */
const comboStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
const comboColumns = ['paid_at', 'shipped_at', 'delivered_at', 'cancelled_at']
const legalCombos: Record<string, number[]> = { pending: [0], paid: [8], shipped: [12], delivered: [14], cancelled: [1, 9] }
const sceneCombos: Record<string, { idx: number; label: string }> = {
  paid: { idx: 12, label: 'A-001' },
  cancelled: { idx: 13, label: 'A-002' },
  delivered: { idx: 12, label: 'A-003' },
}

function CombosFigure() {
  const x0 = 150
  const cw = 38
  const cx = (i: number) => x0 + i * cw
  const ry = (r: number) => 110 + r * 34
  const patterns = Array.from({ length: 16 }, (_, i) => [(i >> 3) & 1, (i >> 2) & 1, (i >> 1) & 1, i & 1])
  return (
    <Svg
      id="62-2"
      w={780}
      h={360}
      label="縦に5つの状態、横に4つの日時の列（paid_at・shipped_at・delivered_at・cancelled_at）のある・ないの16通りを並べた、80マスの表。正しい組み合わせは、pending で日時がすべて空、paid で paid_at だけ、shipped で paid_at と shipped_at、delivered で paid_at・shipped_at・delivered_at、cancelled で cancelled_at だけ、cancelled で paid_at と cancelled_at の6マスだけで、残りの74マスは不正な組み合わせ。場面の A-001 は paid で paid_at と shipped_at があるマス、A-002 は cancelled で paid_at・shipped_at・cancelled_at があるマス、A-003 は delivered で paid_at と shipped_at があり delivered_at がないマスに入る"
    >
      {comboColumns.map((c, k) => (
        <g key={c}>
          <T x={x0 - 8} y={22 + k * 18} anchor="end" fs={11} mono>
            {c}
          </T>
          {patterns.map((p, i) => (
            <T key={i} x={cx(i) + 17} y={22 + k * 18} anchor="middle" fs={11} tone={p[k] ? undefined : 'muted'}>
              {p[k] ? '○' : '·'}
            </T>
          ))}
        </g>
      ))}
      <line x1={x0} y1={96} x2={x0 + 16 * cw - 4} y2={96} stroke="var(--fig-line)" />
      {comboStatuses.map((s, r) => (
        <g key={s}>
          <T x={x0 - 8} y={ry(r) + 14} anchor="end" fs={12} mono>
            {s}
          </T>
          {patterns.map((_, i) => {
            const legal = legalCombos[s].includes(i)
            return <Box key={i} x={cx(i)} y={ry(r)} w={34} h={28} lines={legal ? '正' : ''} fs={12} fill={legal ? 'box5' : 'bg'} rx={3} />
          })}
          {sceneCombos[s] && (
            <g>
              <rect x={cx(sceneCombos[s].idx) - 2} y={ry(r) - 2} width={38} height={32} rx={4} fill="none" stroke="var(--fig-danger)" strokeWidth={2.5} />
              <T x={cx(sceneCombos[s].idx) + 17} y={ry(r) + 14} anchor="middle" fs={9} tone="danger">
                {sceneCombos[s].label}
              </T>
            </g>
          )}
        </g>
      ))}
      <Box x={150} y={290} w={34} h={22} lines="正" fs={11} fill="box5" rx={3} />
      <T x={192} y={301} fs={12}>
        正しい組み合わせ（6通り）
      </T>
      <Box x={370} y={290} w={34} h={22} fill="bg" rx={3} />
      <T x={412} y={301} fs={12}>
        不正な組み合わせ（74通り）
      </T>
      <rect x={570} y={289} width={34} height={24} rx={4} fill="none" stroke="var(--fig-danger)" strokeWidth={2.5} />
      <T x={612} y={301} fs={12} tone="danger">
        場面の3件
      </T>
      <T x={20} y={340} fs={11} tone="muted">
        横の16通りは、4つの日時の列のある（○）・ない（·）の組み合わせ。追跡番号は発送日時と同じ扱いにして省いた
      </T>
    </Svg>
  )
}

/* ---------- 図 62-3 Minsky の例と、Rails のテーブルでの対応 ---------- */
function MinskyFigure() {
  return (
    <Svg
      id="62-3"
      w={780}
      h={340}
      label="左は直す前の OCaml の型で、connection_info という1つのレコードが状態と、last_ping_time・last_ping_id・session_id・when_initiated・when_disconnected の5つの option の項目を持つ。右は直した後で、Connecting は when_initiated、Connected は last_ping と session_id、Disconnected は when_disconnected だけを持ち、connection_info は状態とサーバーだけを持つ。下の段は Rails での対応で、左が1つのテーブルに NULL を許す日時の列を並べた形、右が状態ごとに必要な列を CHECK 制約で決めるか、別のテーブルに分ける形"
    >
      <T x={20} y={16} bold>
        直す前：1つのレコードに option の項目を並べる
      </T>
      <Box
        x={20}
        y={30}
        w={350}
        h={170}
        lines={['type connection_info = {', '  state: connection_state;', '  server: Inet_addr.t;', '  last_ping_time: Time.t option;', '  last_ping_id: int option;', '  session_id: string option;', '  when_initiated: Time.t option;', '  when_disconnected: Time.t option;', '}']}
        fs={12}
        mono
        align="start"
      />
      <T x={410} y={16} bold>
        直した後：状態ごとに持つ項目を決める
      </T>
      <Box x={410} y={30} w={350} h={36} lines="Connecting of { when_initiated: Time.t }" fs={12} mono align="start" fill="box5" />
      <Box x={410} y={74} w={350} h={52} lines={['Connected of { last_ping: (Time.t * int) option;', '               session_id: string }']} fs={12} mono align="start" fill="box5" />
      <Box x={410} y={134} w={350} h={36} lines="Disconnected of { when_disconnected: Time.t }" fs={12} mono align="start" fill="box5" />
      <T x={410} y={190} fs={12} mono>
        type connection_info = {'{'} state; server {'}'}
      </T>
      <Arrow x1={372} y1={115} x2={406} y2={115} accent />
      <Box x={20} y={236} w={350} h={56} lines={['Rails：orders の1行に、', 'NULL を許す日時の列を並べる']} fs={12} subTone="muted" />
      <Box x={410} y={236} w={350} h={56} lines={['Rails：状態ごとに必要な列を CHECK 制約で決める', 'または、その状態だけの列を別のテーブルに分ける']} fs={12} subTone="muted" />
      <Arrow x1={372} y1={264} x2={406} y2={264} accent />
      <T x={20} y={322} fs={11} tone="muted">
        上の段の OCaml のコードは Minsky の記事（2011年）から。option は「値がないこともある」ことを表す型
      </T>
    </Svg>
  )
}

/* ---------- 図 62-4 不正な組み合わせを防ぐ3つのテーブルの設計 ---------- */
const designs = [
  {
    x: 20,
    head: ['NOT NULL', 'どの状態でも必要な列'],
    body: ['orders', 'number  NOT NULL', 'total   NOT NULL', 'status  NOT NULL'],
    ok: ['状態が空の注文', '番号・金額のない注文'],
    ng: ['状態ごとに違う列の有無'],
    how: ['DB が INSERT・UPDATE を拒否する'],
  },
  {
    x: 275,
    head: ['CHECK 制約', '状態ごとに列の有無を決める'],
    body: ['orders', "(status = 'delivered')", '  = (delivered_at IS NOT NULL)', "(status = 'cancelled')", '  = (cancelled_at IS NOT NULL)'],
    ok: ['発送日があるのに未発送', '配達済みなのに配達日が空'],
    ng: ['元の状態による規則', 'ほかのテーブルとの組み合わせ'],
    how: ['DB が INSERT・UPDATE を拒否する'],
  },
  {
    x: 530,
    head: ['別テーブル + NOT NULL', '発送したときだけ行を作る'],
    body: ['shipments', 'order_id  UNIQUE NOT NULL', 'tracking_number NOT NULL', 'shipped_at NOT NULL'],
    ok: ['追跡番号のない発送', '発送日があるのに未発送'],
    ng: ['キャンセル済みの注文の発送の行', '（テーブルをまたぐ組み合わせ）'],
    how: ['書く列がない＋DB が拒否する'],
  },
]

function DesignsFigure() {
  return (
    <Svg
      id="62-4"
      w={780}
      h={420}
      label="不正な組み合わせを防ぐ3つのテーブルの設計を横に並べた。左の NOT NULL は、number・total・status のようにどの状態でも必要な列に付け、状態が空の注文などを防ぐが、状態ごとに違う列の有無は決められない。中央の CHECK 制約は、status と日時の列の組み合わせを条件に書き、発送日があるのに未発送の注文や配達日が空の配達済みの注文を防ぐが、元の状態による規則とほかのテーブルとの組み合わせは検査できない。右の別テーブルは、発送したときだけ shipments の行を作り、追跡番号と発送日時を NOT NULL にする。発送日があるのに未発送という組み合わせは書く列がないので作れないが、キャンセル済みの注文に発送の行を作るような、テーブルをまたぐ組み合わせは防げない"
    >
      {designs.map((d) => (
        <g key={d.x}>
          <Box x={d.x} y={20} w={230} h={44} lines={d.head} fs={12} bold subTone="muted" />
          <Box x={d.x} y={76} w={230} h={110} lines={d.body} fs={11} mono align="start" fill="box4" />
          <T x={d.x} y={208} fs={12} tone="acc" bold>
            防げる
          </T>
          {d.ok.map((t, i) => (
            <T key={t} x={d.x + 8} y={228 + i * 18} fs={12}>
              {t}
            </T>
          ))}
          <T x={d.x} y={278} fs={12} tone="danger" bold>
            防げない
          </T>
          {d.ng.map((t, i) => (
            <T key={t} x={d.x + 8} y={298 + i * 18} fs={12}>
              {t}
            </T>
          ))}
          <Box x={d.x} y={340} w={230} h={34} lines={d.how} fs={11} dashed fill="none" />
        </g>
      ))}
      <T x={20} y={402} fs={11} tone="muted">
        この章の orders は左と中央の組み合わせで直した。右の設計は別の DB で動かして確かめた
      </T>
    </Svg>
  )
}

/* ---------- 図 62-5 直す前と後：書き込む経路と検査する場所 ---------- */
const writePaths = [
  { lines: 'モデルのメソッド（update!）', gate: true },
  { lines: 'update_columns・update_all', gate: false },
  { lines: 'コンソールの SQL・別のアプリ', gate: false },
  { lines: '古い画面からの操作', gate: true },
]

function PathsFigure() {
  const row = (top: number, i: number) => top + 30 + i * 42
  return (
    <Svg
      id="62-5"
      w={780}
      h={450}
      label="上は直す前で、モデルのメソッド、update_columns と update_all、コンソールの SQL や別のアプリ、古い画面からの操作の4つの経路が、どれも検査を通らずに orders テーブルに書き込み、ずれた組み合わせを書ける。下は直した後で、モデルのメソッドと古い画面からの操作は、まず transition! が行をロックして読み直し、元の状態を確かめる。そのうえで4つの経路すべてが MySQL の NOT NULL と CHECK 制約を通ってから orders に書き込まれる"
    >
      {[0, 220].map((top) => (
        <g key={top}>
          <T x={20} y={top + 14} bold tone={top === 0 ? 'danger' : 'acc'}>
            {top === 0 ? '直す前：どの経路からでも、ずれた組み合わせを書ける' : '直した後：遷移の処理と DB の制約の2か所で止める'}
          </T>
          {writePaths.map((p, i) => (
            <Box key={p.lines} x={20} y={row(top, i)} w={230} h={34} lines={p.lines} fs={12} />
          ))}
          <Box x={600} y={top + 30} w={160} h={160} lines={['orders', '（MySQL）']} fs={12} fill="box4" bold subTone="muted" />
        </g>
      ))}
      {writePaths.map((p, i) => (
        <Arrow key={p.lines} x1={250} y1={row(0, i) + 17} x2={598} y2={row(0, i) + 17} />
      ))}
      <T x={424} y={204} anchor="middle" fs={11} tone="danger">
        どの経路も、状態と日時の列の組み合わせを確かめない
      </T>
      {writePaths.map((p, i) => {
        const y = row(220, i) + 17
        return (
          <g key={p.lines}>
            {p.gate ? (
              <>
                <Arrow x1={250} y1={y} x2={290} y2={y} />
                <Box x={292} y={y - 17} w={128} h={34} lines="transition!" fs={12} mono fill="box2" />
                <Arrow x1={420} y1={y} x2={452} y2={y} />
              </>
            ) : (
              <Arrow x1={250} y1={y} x2={452} y2={y} />
            )}
            <Arrow x1={566} y1={y} x2={598} y2={y} />
          </g>
        )
      })}
      <Box x={454} y={250} w={112} h={160} lines={['MySQL', 'NOT NULL', 'CHECK 制約']} fs={12} fill="box5" bold />
      <T x={292} y={426} fs={11} tone="muted">
        transition! は行をロックして読み直し、元の状態を確かめる
      </T>
    </Svg>
  )
}

/* ---------- 図 62-7 注文の状態の遷移と、経費申請との対応 ---------- */
const orderStates = [
  { x: 20, lines: ['pending', '入金待ち', '列：なし'] },
  { x: 205, lines: ['paid', '発送の準備中', '+ paid_at'] },
  { x: 390, lines: ['shipped', '発送済み', '+ shipped_at・追跡番号'] },
  { x: 575, lines: ['delivered', '配達済み', '+ delivered_at'] },
]
const expenseStates = [
  { x: 20, lines: ['draft', '下書き'] },
  { x: 205, lines: ['submitted', '+ submitted_at'] },
  { x: 390, lines: ['approved', '+ approved_by・approved_at'] },
  { x: 575, lines: ['paid', '+ paid_at'] },
]

function TransitionsFigure() {
  return (
    <Svg
      id="62-7"
      w={780}
      h={470}
      label="上はこの章の注文の状態の遷移。pending から pay! で paid、ship! で shipped、deliver! で delivered に進み、shipped から cancel_shipment! で paid に戻る。pending と paid からは cancel! で cancelled になる。各状態には、paid_at、shipped_at と追跡番号、delivered_at、cancelled_at のうち、その状態で値がある列を書いた。下は Explicit State Machine の章の経費申請で、draft から submitted、approved、paid に進み、submitted から rejected に差し戻され、rejected から draft に戻る。どちらも、状態ごとに必要な列は CHECK 制約で決め、元の状態による規則は遷移の処理で守る"
    >
      <T x={20} y={16} bold>
        注文（この章）
      </T>
      {orderStates.map((s) => (
        <Box key={s.lines[0]} x={s.x} y={34} w={170} h={62} lines={s.lines} fs={12} bold subTone="muted" />
      ))}
      <Box x={112} y={168} w={170} h={62} lines={['cancelled', 'キャンセル', '+ cancelled_at']} fs={12} bold subTone="muted" />
      <Arrow x1={190} y1={58} x2={203} y2={58} />
      <Arrow x1={375} y1={58} x2={388} y2={58} />
      <Arrow x1={560} y1={58} x2={573} y2={58} />
      <T x={197} y={26} anchor="middle" fs={10} mono tone="acc">
        pay!
      </T>
      <T x={382} y={26} anchor="middle" fs={10} mono tone="acc">
        ship!
      </T>
      <T x={567} y={26} anchor="middle" fs={10} mono tone="acc">
        deliver!
      </T>
      <Arrow d="M 470 96 Q 420 150 300 96" />
      <T x={410} y={146} anchor="middle" fs={10} mono tone="acc">
        cancel_shipment!
      </T>
      <Arrow x1={105} y1={96} x2={160} y2={166} />
      <Arrow x1={260} y1={96} x2={230} y2={166} />
      <T x={196} y={130} anchor="middle" fs={10} mono tone="acc">
        cancel!
      </T>
      <line x1={20} y1={252} x2={760} y2={252} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={390} y={272} anchor="middle" fs={12} tone="acc">
        どちらも：状態ごとに必要な列は CHECK 制約、元の状態による規則は遷移の処理で守る
      </T>
      <T x={20} y={300} bold>
        経費申請（Explicit State Machine の章）
      </T>
      {expenseStates.map((s) => (
        <Box key={s.lines[0]} x={s.x} y={318} w={170} h={48} lines={s.lines} fs={12} bold subTone="muted" />
      ))}
      <Box x={205} y={404} w={170} h={48} lines={['rejected', '+ 差し戻した人・理由']} fs={12} bold subTone="muted" />
      <Arrow x1={190} y1={342} x2={203} y2={342} />
      <Arrow x1={375} y1={342} x2={388} y2={342} />
      <Arrow x1={560} y1={342} x2={573} y2={342} />
      <Arrow x1={290} y1={366} x2={290} y2={402} />
      <Arrow d="M 205 428 Q 100 428 100 368" />
    </Svg>
  )
}

const chapter: Chapter = {
  number: 81,
  part: 8,
  title: 'Make Illegal States Unrepresentable：発送日があるのに未発送の注文を作れなくする',
  summary:
    '注文の状態の列（status）と、入金・発送・配達・キャンセルの日時の列の組み合わせがずれ、発送日と追跡番号が残った「発送の準備中」の注文や、配達日のない「配達済み」の注文ができる場面から始めます。Yaron Minsky が講義と2011年の記事で示した考え方を確かめ、テーブルの設計（NOT NULL・CHECK 制約・別テーブル）で、ずれた組み合わせを MySQL が受け付けないように直します。最後に、変わりやすい業務の規則まで制約にしたときの問題と、Explicit State Machine・Value Object の章との分担を扱います。',
  goals: [
    '状態の列と日時の列のように、同じ事実を複数の列で持つテーブルで、不正な組み合わせができる経路を説明できる',
    'Yaron Minsky の「Make illegal states unrepresentable」の意味と、Rails のテーブルに当てはめるときの3つの方法（NOT NULL・CHECK 制約・別テーブル）を説明できる',
    '既存の行の組み合わせを SQL で数えて直してから、状態ごとの列の有無を CHECK 制約で書ける',
    'update_columns や update_all のようにモデルの検証を通らない書き換えも、NOT NULL と CHECK 制約が拒否することを確かめられる',
    'CHECK 制約で守れない規則（元の状態・ほかのテーブル・変わりやすい規則）を見分け、遷移の処理やモデルの検証に置ける',
  ],
  prerequisites: [27, 46, 47],
  sections: [
    {
      id: 'scene',
      title: '状態の列と日時の列がずれた注文',
      body: (
        <>
          <p>
            この章では EC サイトの注文の状態を例に、<Term en="Make Illegal States Unrepresentable">不正な状態を表現できないようにする</Term>原則を扱います。この原則は型やデータ構造の形によって、無効な組み合わせをそもそも作れないようにするという考え方です。まず、注文の状態の列と日時の列が別々に書き換えられ、組み合わせがずれていくコードを動かします。
          </p>
          <h3>そもそも注文の状態をどう持っているか</h3>
          <p>
            この EC サイトの注文は入金待ち → 発送の準備中 → 発送済み → 配達済み の順に進みます。入金の前と発送の準備中のときは、会員が注文をキャンセルできます。テーブルには今どの段階にあるかを表す <code>status</code> の列と、それぞれの出来事が起きた日時の列（入金日時・発送日時・配達日時・キャンセルの日時）があります。発送したときは、配送業者の追跡番号も記録します。
          </p>
          <p>
            状態の列と日時の列の両方を持っているのには理由があります。倉庫の発送待ちの一覧は <code>status</code> で絞り込み、会員の画面と月次の集計は日時の列を使います。状態の列だけでは「いつ発送したか」が分からず、日時の列だけでは一覧の絞り込みの条件が長くなるからです。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_orders.rb"
            code={`
class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :number, null: false, index: { unique: true }
      t.integer :total, null: false
      t.string :status, default: "pending"
      t.datetime :paid_at      # 入金を確認した日時
      t.datetime :shipped_at   # 倉庫が荷物を配送業者に渡した日時
      t.string :tracking_number # 配送業者の追跡番号
      t.datetime :delivered_at # 配達が完了した日時（後から足した列）
      t.datetime :cancelled_at # キャンセルした日時
      t.timestamps
    end
  end
end
`}
          />
          <p>
            モデルは <code>status</code> を enum で定義し、出来事ごとにメソッドを持っています。enum の <code>validate: true</code> は、5つの値のどれでもない文字列を代入したときに、例外ではなく検証のエラーにする指定です（Rails 7.1 から使えます<Ref n={15} />）。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直す前）"
            code={`
class Order < ApplicationRecord
  enum :status, { pending: "pending", paid: "paid", shipped: "shipped",
                  delivered: "delivered", cancelled: "cancelled" }, validate: true

  # 決済サービスから入金の通知が届いた
  def pay!
    update!(status: :paid, paid_at: Time.current)
  end

  # 倉庫の担当者が荷物を配送業者に渡した
  def ship!(tracking_number:)
    update!(status: :shipped, shipped_at: Time.current, tracking_number:)
  end

  # 管理画面の「発送を取り消す」。別の注文に発送を記録してしまったときに使う
  def cancel_shipment!
    update!(status: :paid)
  end

  # 会員が注文の詳細の画面で「キャンセルする」を押した
  def cancel!
    update!(status: :cancelled, cancelled_at: Time.current)
  end
end
`}
          />
          <p>
            配送業者からは毎晩「配達完了」の CSV が届きます。取り込みの処理は配達日時の列（delivered_at）を足す前に書かれたもので、件数が多いので <code>update_all</code> で1回の UPDATE にしています。
          </p>
          <Code
            lang="ruby"
            title="app/services/delivery_import.rb（直す前）"
            code={`
# 配送業者から毎晩届く「配達完了」の CSV を取り込む
# rows は [{ tracking_number: "4411-0003", delivered_at: 配達した日時 }, ...]
class DeliveryImport
  def self.call(rows)
    Order.where(tracking_number: rows.map { |row| row[:tracking_number] })
         .update_all(status: "delivered", updated_at: Time.current)
  end
end
`}
          />
          <p>会員の注文の詳細の画面には状態の名前と、発送日時があれば発送日と追跡番号を出します。</p>
          <Code
            lang="ruby"
            title="app/helpers/orders_helper.rb"
            code={`
module OrdersHelper
  STATUS_LABELS = { "pending" => "入金待ち", "paid" => "発送の準備中", "shipped" => "発送済み",
                    "delivered" => "配達済み", "cancelled" => "キャンセル" }.freeze

  # 会員の注文の詳細の画面に出す1行
  def order_summary(order)
    text = "#{order.number} #{STATUS_LABELS[order.status]}"
    text += " 発送日 #{order.shipped_at.strftime('%m/%d')} 追跡番号 #{order.tracking_number}" if order.shipped_at
    text += " 配達日 #{order.delivered_at&.strftime('%m/%d') || '—'}" if order.delivered?
    text
  end
end
`}
          />
          <h3>3つの処理を動かす</h3>
          <p>
            5件の注文を作り、A-005 以外の4件を入金済みにしてから、業務で実際に起きる3つの操作を行います。1つ目は倉庫の担当者が A-002 の荷物を誤って A-001 に記録し、管理画面で取り消す操作です。2つ目は会員が A-002 の詳細の画面を開いている間に倉庫が発送し、その後で会員がキャンセルを押す操作です。3つ目は A-003 を発送し、翌日に配達完了の CSV を取り込む操作です。
          </p>
          <Code
            lang="ruby"
            title="script/scene.rb（抜粋）"
            code={`
travel_to Time.zone.parse("2026-11-19 15:00")
# (1) A-002 の荷物を A-001 に記録してしまい、管理画面で取り消した
Order.find_by!(number: "A-001").ship!(tracking_number: "4411-0002")
Order.find_by!(number: "A-001").cancel_shipment!
# (2) 会員が A-002 の画面を開いている間に、倉庫が発送した。その後、会員がキャンセルを押した
page = Order.find_by!(number: "A-002")
Order.find_by!(number: "A-002").ship!(tracking_number: "4411-0002")
page.cancel!
# (3) A-003 を発送し、翌日に配達完了の CSV を取り込んだ
Order.find_by!(number: "A-003").ship!(tracking_number: "4411-0003")
travel_to Time.zone.parse("2026-11-20 21:00")
DeliveryImport.call([{ tracking_number: "4411-0003", delivered_at: Time.zone.parse("2026-11-20 14:30") }])
# …（省略）注文の行と、倉庫の一覧・月次の件数・会員の画面の結果を表示する
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene.rb）"
            code={`
number status    paid_at     shipped_at  tracking   delivered_at cancelled_at
A-001  paid      11/18 10:00 11/19 15:00 4411-0002  -            -
A-002  cancelled 11/18 10:00 11/19 15:00 4411-0002  -            11/19 15:00
A-003  delivered 11/18 10:00 11/19 15:00 4411-0003  -            -
A-004  paid      11/18 10:00 -           -          -            -
A-005  pending   -           -           -          -            -

倉庫の発送待ちの一覧（Order.paid）：A-001, A-004
11月の発送件数（shipped_at で数える）：3
11月の発送件数（status で数える）：1

会員の注文の詳細の画面：
  A-001 発送の準備中 発送日 11/19 追跡番号 4411-0002
  A-002 キャンセル 発送日 11/19 追跡番号 4411-0002
  A-003 配達済み 発送日 11/19 追跡番号 4411-0003 配達日 —
  A-004 発送の準備中
  A-005 入金待ち
`}
          />
          <p>どの操作も例外にならずに終わりましたが、3件の注文で状態の列と日時の列が食い違っています。</p>
          <ul>
            <li>
              A-001 は状態が「発送の準備中」なのに発送日時と追跡番号が残っています。<code>cancel_shipment!</code> が <code>status</code> だけを戻したからです。会員の画面には別の会員あての荷物（A-002）の追跡番号が出ています。
            </li>
            <li>
              A-002 は荷物が配送業者に渡った後でキャンセルになりました。会員の画面のオブジェクト <code>page</code> は発送の前に読み込んだもので、<code>cancel!</code> は今の状態を確かめずに <code>status</code> と <code>cancelled_at</code> だけを UPDATE しました。返金の処理が動けば、荷物が届くうえに代金も返ることになります。
            </li>
            <li>A-003 は「配達済み」ですが、配達日時が空です。取り込みの処理は delivered_at の列ができる前の書き方のままでした。</li>
          </ul>
          <p>
            読む側の結果も食い違っています。月次の発送件数は日時の列で数えると3件、状態の列で数えると1件です。どちらの数え方のコードも、それだけを見れば正しく書かれています。図 62-1 は書き込む3つの処理と読む3つの処理を、orders テーブルを挟んで並べたものです。
          </p>
          <Figure n="62-1" title="注文の状態を書き込む処理と読む処理" caption="赤の文字は書き込む処理が残したずれ。読む処理はそれぞれ別の列を見ている。">
            <SceneFigure />
          </Figure>
          <p>
            図 62-1 の左の3つの処理はどれも「状態を変えたら、関係する日時の列も書き換える」という取り決めを守っていません。右の3つの処理は取り決めが守られている前提で、status か日時の列のどちらか一方を読んでいます。どちらの側にも組み合わせが正しいかを確かめる箇所がありません。
          </p>
          <h3>状態と日時の列の組み合わせを数える</h3>
          <p>本番のテーブルでどの組み合わせが何件あるかは、次の SQL で数えられます。</p>
          <Code
            lang="sql"
            title="script/combinations.rb の SQL"
            code={`
SELECT status,
       paid_at IS NOT NULL      AS paid,
       shipped_at IS NOT NULL   AS shipped,
       delivered_at IS NOT NULL AS delivered,
       cancelled_at IS NOT NULL AS cancelled,
       COUNT(*)                 AS orders
FROM orders
GROUP BY 1, 2, 3, 4, 5
ORDER BY 1, 2, 3, 4, 5
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/combinations.rb）"
            code={`
status    paid      shipped   delivered cancelled orders
cancelled 1         1         0         1         1
delivered 1         1         0         0         1
paid      1         0         0         0         1
paid      1         1         0         0         1
pending   0         0         0         0         1
`}
          />
          <p>
            orders テーブルには状態が5つ、日時の列が4つあります。日時の列のある・ないは 2 × 2 × 2 × 2 = 16 通りなので、テーブルが受け付ける組み合わせは 5 × 16 = 80 通りです。業務の上で正しいのはそのうち6通りだけです（キャンセルは入金の前と後の両方がありうるので2通り）。図 62-2 は80通りを並べ、正しい6通りと、場面の3件が入ったマスを示したものです。
          </p>
          <Figure n="62-2" title="状態と4つの日時の列の組み合わせ" caption="80マスのうち、業務の上で正しいのは「正」の6マス。赤い枠は場面で作られた3件。">
            <CombosFigure />
          </Figure>
          <p>
            図 62-2 の白いマスの74通りはどれもテーブルに保存できてしまいます。今は3件ですが、書き込む処理が増えるたびに、白いマスに入る経路が増えます。モデルに検証（バリデーション）を足しても、Rails のガイドが挙げるとおり <code>update_all</code>・<code>update_columns</code>・<code>insert_all</code> などは検証を通らずに保存します<Ref n={7} />。場面の3つ目の処理も <code>update_all</code> でした。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '不正な状態を表現できないようにする原則の意味と由来',
      body: (
        <>
          <h3>原則の定義</h3>
          <p>
            Make Illegal States Unrepresentable（不正な状態を表現できないようにする）は、型やデータ構造の形によって、無効な組み合わせを作れないようにする原則です。不正な値を見つけて弾くのではなく、不正な値を書き表す方法がない形にデータを決めます。前の節の orders テーブルには、80通りのうち74通りの不正な組み合わせを書き表す方法がありました。この原則に沿うと、テーブルが受け付ける組み合わせを業務の上で正しい6通りに近づけることになります。
          </p>
          <h3>Yaron Minsky の講義と2011年の記事</h3>
          <p>
            この言葉は金融の会社 Jane Street で OCaml を使ってきた Yaron Minsky の講義から広まりました。Minsky は 2010年に Harvard と Northeastern の授業で「Effective ML」という題の講義を行い、2010年8月21日に Jane Street のブログでその録画を公開しています<Ref n={2} />。2011年3月9日の記事「Effective ML Revisited」では、翌年の Harvard の講義で使ったコードを、講義の要点ごとに見出しを付けて載せました。その見出しの1つが「Make illegal states unrepresentable」です<Ref n={1} />。
          </p>
          <p>
            記事の例はサーバーへの接続の情報を表す型です。直す前は、1つのレコードに接続の状態（接続中・接続済み・切断済み）と、5つの <code>option</code> の項目を並べています。OCaml の <code>option</code> は「値がないこともある」ことを表す型で、Rails のテーブルでいえば NULL を許す列にあたります。直した後は、状態ごとに別の型を作り、その状態で意味のある項目だけを持たせています<Ref n={1} />。
          </p>
          <Figure n="62-3" title="Minsky の例と、Rails のテーブルでの対応" caption="上の段は記事のコードを、型の宣言の部分だけ並べたもの。下の段はこの章での対応。">
            <MinskyFigure />
          </Figure>
          <p>
            図 62-3 の左の型では、状態が「接続中」なのに切断の日時が入っている値も作れます。右の型では、切断の日時（when_disconnected）は Disconnected の中にしかないので、接続中の値に切断の日時を入れる書き方がありません。OCaml では、存在しない項目を読もうとするコードはコンパイルの時点でエラーになります。この章の orders テーブルは左の型と同じ形をしています。
          </p>
          <h3>その後の広まり</h3>
          <p>
            F# の解説サイトを書いている Scott Wlaschin は、2013年1月の記事「Designing with types: Making illegal states unrepresentable」で、この言葉を Minsky から借りたと書いています<Ref n={3} />。記事の例は「連絡先には、メールアドレスか住所の少なくとも一方がある」という業務の規則です。両方を必須にすると片方だけの連絡先を表せず、両方を任意にすると、どちらもない連絡先を作れます。Wlaschin は「メールだけ」「住所だけ」「両方」の3つの場合を持つ型にして、4つ目の「どちらもない」場合を作れないようにしました<Ref n={3} />。
          </p>
          <p>
            Alexis King は2019年11月の記事「Parse, don't validate」で、入力を確かめるたびに結果を捨てる書き方より、確かめた結果をより正確な型に変換する書き方を勧めています。その中で「不正な状態を表現できないデータ構造を使う」ことを2つの要点の1つに挙げています<Ref n={4} />。King はこの記事で、同じデータを複数の場所に持つ（非正規化した）表現を避けるようにも書いています。複数の場所が食い違うという不正な状態を、簡単に表現できてしまうからです<Ref n={4} />。この章の status と shipped_at は、「発送したか」という同じ事実を2か所に持っていました。
          </p>
          <p>
            King は記事の終わりで、この記事の原則は目指す理想であって、必ず満たす要件ではないとも書いています<Ref n={4} />。この章でもすべての規則をデータの形で表すことを目標にはせず、どの規則をテーブルに持たせるかを「当てはめすぎたとき」の節で判断します。
          </p>
          <h3>Rails のテーブルに当てはめる</h3>
          <p>
            Ruby には OCaml や F# のような静的な型の検査がないので、Rails のアプリでこの原則の「データ構造」にあたるのは、主に DB のテーブルです。テーブルで不正な組み合わせを防ぐ方法には、強さの違う次の3つがあります。
          </p>
          <ol>
            <li>書く場所をなくす：その状態でしか意味のない列を別のテーブルに分け、行があるときだけ値を持たせる。Minsky の例の直し方に最も近い。</li>
            <li>DB が拒否する：<code>NOT NULL</code> と <Term en="CHECK constraint">CHECK 制約</Term>で、行の中の列の組み合わせに条件を付ける。CHECK 制約は表の各行が満たすべき条件を DB に登録し、条件を満たさない INSERT と UPDATE を DB が拒否する仕組み。</li>
            <li>アプリが拒否する：モデルの検証や遷移の処理で確かめる。検証を通らない書き換えや、別のアプリからの書き込みは止められない。</li>
          </ol>
          <p>
            1と2は、Rails のコードがどの経路で書き込んでも不正な組み合わせを防げます。3が防げるのは、Rails のモデルを通る書き込みだけです。場面の3つの処理のうち、モデルの検証で止められたのは、最大でも <code>update!</code> を使う2つです。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則・パターン</th>
                  <th scope="col">何をするか</th>
                  <th scope="col">この章との違い</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Fail Fast（<ChapterLink n={79} />）
                  </td>
                  <td>不正な状態や入力を、できるだけ早く見つけて止める</td>
                  <td>不正な状態ができた後に早く気づく。この章は不正な状態を作れなくする</td>
                </tr>
                <tr>
                  <td>
                    Design by Contract（<ChapterLink n={80} />）
                  </td>
                  <td>前提条件・事後条件・不変条件を明確にする</td>
                  <td>CHECK 制約はテーブルの不変条件を DB に書いたものと見ることもできる。契約は呼び出しの前後で確かめる</td>
                </tr>
                <tr>
                  <td>
                    Defensive Programming（<ChapterLink n={82} />）
                  </td>
                  <td>外部の入力や信頼できないデータによる問題を防ぐ</td>
                  <td>外から来た値を境界で確かめる。この章は内部のデータの形を決める</td>
                </tr>
                <tr>
                  <td>
                    Value Object（<ChapterLink n={46} />）
                  </td>
                  <td>金額や期間などの値に型を持たせ、作るときに値を確かめる</td>
                  <td>1つの値の正しさを扱う。この章は複数の列の組み合わせを扱う</td>
                </tr>
                <tr>
                  <td>
                    Explicit State Machine（<ChapterLink n={47} />）
                  </td>
                  <td>状態の一覧と遷移の規則を1か所に明示する</td>
                  <td>状態の間の移り方を扱う。この章は各状態で持つ列を扱う</td>
                </tr>
                <tr>
                  <td>
                    Single Source of Truth（<ChapterLink n={88} />）
                  </td>
                  <td>同じ情報の正本を複数持たない</td>
                  <td>同じ事実を2か所に持つと食い違いを表現できる。正本を1つにするのは、この原則の手段の1つ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: '状態ごとの列の有無を NOT NULL と CHECK 制約で決める',
      body: (
        <>
          <h3>3つのテーブルの設計から選ぶ</h3>
          <p>
            前の節で挙げた「書く場所をなくす」と「DB が拒否する」には、テーブルの設計として3つの方法があります。図 62-4 は、それぞれが防げる組み合わせと防げない組み合わせを並べたものです。
          </p>
          <Figure n="62-4" title="不正な組み合わせを防ぐ3つのテーブルの設計" caption="下の破線の箱は不正な組み合わせを防ぐ仕組み。">
            <DesignsFigure />
          </Figure>
          <p>
            図 62-4 の左の NOT NULL はどの状態でも必要な列に付けます。中央の CHECK 制約は1つの行の中で、状態と日時の列の組み合わせに条件を付けます。右の別テーブルはその状態でしか使わない列を別のテーブルに移し、行があるときだけ値を持たせます。左と中央は1つのテーブルのまま加えられるので、今の orders に対しては変更が小さく済みます。この節では左と中央で直し、右の設計は節の最後で動かして比べます。
          </p>
          <h3>直す順序</h3>
          <p>この節では、orders テーブルが正しい6通りの組み合わせだけを受け付けるように直します。次の順に進めます。</p>
          <ol>
            <li>今の行の組み合わせを数え、ずれた行を業務の担当者と1件ずつ直す</li>
            <li>状態ごとに、値がある列と空の列を表にする</li>
            <li>状態を変える処理を、状態と日時の列を一緒に書き換える形にする</li>
            <li>NOT NULL と CHECK 制約を加える</li>
            <li>場面と同じ操作と、モデルを通らない書き換えを試す</li>
          </ol>
          <p>
            3を4より先にするのは、制約を先に加えると、直す前のコードが本番で例外を出し始めるからです。たとえば直す前の <code>cancel_shipment!</code> は、制約を加えた時点から毎回 <code>ActiveRecord::CheckViolation</code> になります。
          </p>
          <h3>手順1：今の行の組み合わせを数えて直す</h3>
          <p>
            場面の節の SQL で、ずれた組み合わせの行を見つけます。どう直すかは行ごとに業務の事情で決まるので、機械的に直さず、担当者と1件ずつ決めます。この例では、A-001 は荷物を渡していなかったので発送の記録を消し、A-002 は荷物が配送業者に渡っていたのでキャンセルを取り消して返品として扱い、A-003 は配送業者の CSV にある配達日時を入れることにしました。
          </p>
          <Code
            lang="ruby"
            title="script/repair.rb"
            code={`
# 業務の担当者と1件ずつ決めた直し方で、組み合わせのずれた3件を直す
Order.transaction do
  # A-001：荷物は渡していなかった。発送の記録を消す
  Order.find_by!(number: "A-001").update_columns(shipped_at: nil, tracking_number: nil)
  # A-002：荷物は配送業者に渡っていた。キャンセルを取り消し、返品として会員に連絡する
  Order.find_by!(number: "A-002").update_columns(status: "shipped", cancelled_at: nil)
  # A-003：配送業者の CSV にある配達日時を入れる
  Order.find_by!(number: "A-003").update_columns(delivered_at: Time.zone.parse("2026-11-20 14:30"))
end
`}
          />
          <Code
            lang="text"
            title="実行結果（直した後に bin/rails runner script/combinations.rb）"
            code={`
status    paid      shipped   delivered cancelled orders
delivered 1         1         1         0         1
paid      1         0         0         0         2
pending   0         0         0         0         1
shipped   1         1         0         0         1
`}
          />
          <p>
            すべての行が正しい組み合わせになりました。本番の大きなテーブルで行を直すときは、件数を数えてから小分けに更新します。その手順は<ChapterLink n={27} section="schema-and-data-repair" />で扱っています。
          </p>
          <h3>手順2：状態ごとに値がある列を決める</h3>
          <p>次の表は業務の担当者と決めた「状態ごとの列の有無」です。この表が CHECK 制約の元になります。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">status</th>
                  <th scope="col">paid_at</th>
                  <th scope="col">shipped_at・tracking_number</th>
                  <th scope="col">delivered_at</th>
                  <th scope="col">cancelled_at</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>pending（入金待ち）</td>
                  <td>空</td>
                  <td>空</td>
                  <td>空</td>
                  <td>空</td>
                </tr>
                <tr>
                  <td>paid（発送の準備中）</td>
                  <td>ある</td>
                  <td>空</td>
                  <td>空</td>
                  <td>空</td>
                </tr>
                <tr>
                  <td>shipped（発送済み）</td>
                  <td>ある</td>
                  <td>ある</td>
                  <td>空</td>
                  <td>空</td>
                </tr>
                <tr>
                  <td>delivered（配達済み）</td>
                  <td>ある</td>
                  <td>ある</td>
                  <td>ある</td>
                  <td>空</td>
                </tr>
                <tr>
                  <td>cancelled（キャンセル）</td>
                  <td>どちらでもよい</td>
                  <td>空</td>
                  <td>空</td>
                  <td>ある</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            表を列ごとに縦に読むと、制約の文がそのまま決まります。たとえば shipped_at は「shipped と delivered のときに限りある」、cancelled_at は「cancelled のときに限りある」です。paid_at だけはキャンセルの行で「どちらでもよい」ので、条件が1つ増えます。
          </p>
          <h3>手順3：状態と日時の列を一緒に書き換える</h3>
          <p>
            状態を変えるメソッドはどれも <code>transition!</code> という1つの private メソッドを通るようにしました。<code>transition!</code> は元の状態として許すものと、次の状態と、書き換える列を受け取ります。発送の取り消しでは、発送で入れた2つの列も <code>nil</code> に戻します。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直した後）"
            code={`
class Order < ApplicationRecord
  class InvalidTransition < StandardError; end

  enum :status, { pending: "pending", paid: "paid", shipped: "shipped",
                  delivered: "delivered", cancelled: "cancelled" }, validate: true

  def pay!
    transition!(from: :pending, to: :paid, paid_at: Time.current)
  end

  def ship!(tracking_number:)
    transition!(from: :paid, to: :shipped, shipped_at: Time.current, tracking_number:)
  end

  # 発送を取り消すときは、発送で入れた列も空に戻す
  def cancel_shipment!
    transition!(from: :shipped, to: :paid, shipped_at: nil, tracking_number: nil)
  end

  def deliver!(at:)
    transition!(from: :shipped, to: :delivered, delivered_at: at)
  end

  # キャンセルできるのは発送の前だけ
  def cancel!
    transition!(from: [:pending, :paid], to: :cancelled, cancelled_at: Time.current)
  end

  private

  # 行をロックして読み直し、今の状態を確かめてから、状態と日時の列を1回の UPDATE で書く
  def transition!(from:, to:, **columns)
    with_lock do
      unless Array(from).map(&:to_s).include?(status)
        raise InvalidTransition, "#{number} は #{status} なので #{to} にはできません"
      end
      update!(status: to, **columns)
    end
  end
end
`}
          />
          <p>
            <code>with_lock</code> はトランザクションを始め、<code>SELECT … FOR UPDATE</code> で行をロックしながら読み直してから、ブロックを実行します<Ref n={11} />。場面の A-002 のように、画面を開いたときに読み込んだ古いオブジェクトから <code>cancel!</code> を呼んでも、読み直した後の状態（shipped）で判断します。ロックの働きは<ChapterLink n={15} section="pessimistic" />で扱っています。
          </p>
          <p>
            「発送の後はキャンセルできない」は、元の状態によって決まる規則なので、次の手順の CHECK 制約では検査できません。この章では <code>from:</code> の引数で書きましたが、状態とイベントの遷移表を作り、条件付きの UPDATE で同時の遷移を防ぐ方法は<ChapterLink n={47} section="rails-impl" />で詳しく扱っています。
          </p>
          <p>取り込みの処理も追跡番号ごとに <code>deliver!</code> を呼び、CSV の配達日時を渡すように直しました。</p>
          <Code
            lang="ruby"
            title="app/services/delivery_import.rb（直した後）"
            code={`
class DeliveryImport
  def self.call(rows)
    rows.each do |row|
      Order.shipped.find_by(tracking_number: row[:tracking_number])&.deliver!(at: row[:delivered_at])
    end
  end
end
`}
          />
          <p>
            1件ずつ UPDATE するので、<code>update_all</code> の1回より SQL の回数は増えます。この取り込みは1晩に数千件なので、この形にしました。件数が多くて時間が問題になるときは、<code>update_all</code> に <code>delivered_at</code> も渡す形にできます。その場合も、次の手順の CHECK 制約が配達日時を書き忘れた UPDATE を拒否します。
          </p>
          <h3>手順4：NOT NULL と CHECK 制約を加える</h3>
          <p>
            手順2の表をマイグレーションに書きます。Rails の <code>add_check_constraint</code> は、条件の文字列を受け取って <code>ALTER TABLE … ADD CONSTRAINT … CHECK (…)</code> を実行します<Ref n={8} />。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000002_add_state_checks_to_orders.rb"
            code={`
class AddStateChecksToOrders < ActiveRecord::Migration[8.1]
  def change
    change_column_null :orders, :status, false
    add_check_constraint :orders, "status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')",
                         name: "orders_status"
    # 入金待ちなら入金日時が空、入金の後なら入金日時がある（キャンセルはどちらでもよい）
    add_check_constraint :orders, "status = 'cancelled' OR (status <> 'pending') = (paid_at IS NOT NULL)",
                         name: "orders_paid_at"
    # 発送済み・配達済みのときに限り、発送日時と追跡番号がある
    add_check_constraint :orders, "(status IN ('shipped', 'delivered')) = (shipped_at IS NOT NULL)",
                         name: "orders_shipped_at"
    add_check_constraint :orders, "(status IN ('shipped', 'delivered')) = (tracking_number IS NOT NULL)",
                         name: "orders_tracking_number"
    # 配達済みのときに限り配達日時が、キャンセルのときに限りキャンセルの日時がある
    add_check_constraint :orders, "(status = 'delivered') = (delivered_at IS NOT NULL)",
                         name: "orders_delivered_at"
    add_check_constraint :orders, "(status = 'cancelled') = (cancelled_at IS NOT NULL)",
                         name: "orders_cancelled_at"
  end
end
`}
          />
          <p>
            <code>(条件A) = (条件B)</code> は「A のときに限り B」を表す書き方です。MySQL では比較や <code>IS NOT NULL</code> の結果が 1（真）か 0（偽）の数になるので、両辺が同じ値のときだけ条件が真になります。「発送済みなのに発送日時がない」行も、「発送の準備中なのに発送日時がある」行も、1つの式で拒否できます。
          </p>
          <p>
            最初に <code>status</code> を NOT NULL にしているのは、CHECK 制約が条件の結果が NULL になる行を通すからです。MySQL の CHECK 制約は、条件が TRUE か UNKNOWN（NULL）なら通し、FALSE のときだけ拒否します<Ref n={5} />。status が NULL だと <code>status IN (…)</code> の結果も NULL になり、5つの制約をすべて通ってしまいます（NULL と CHECK 制約の関係は<ChapterLink n={47} section="rails-impl" />でも確かめています）。日時の列は <code>IS NOT NULL</code> で調べているので、結果が NULL にはなりません。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails db:migrate の後の db/schema.rb。check_constraint の行）"
            code={`
    t.string "status", default: "pending", null: false
    # …（省略）
    t.check_constraint "(\`status\` = _utf8mb4'cancelled') = (\`cancelled_at\` is not null)", name: "orders_cancelled_at"
    t.check_constraint "(\`status\` = _utf8mb4'cancelled') or ((\`status\` <> _utf8mb4'pending') = (\`paid_at\` is not null))", name: "orders_paid_at"
    t.check_constraint "(\`status\` = _utf8mb4'delivered') = (\`delivered_at\` is not null)", name: "orders_delivered_at"
    t.check_constraint "(\`status\` in (_utf8mb4'shipped',_utf8mb4'delivered')) = (\`shipped_at\` is not null)", name: "orders_shipped_at"
    t.check_constraint "(\`status\` in (_utf8mb4'shipped',_utf8mb4'delivered')) = (\`tracking_number\` is not null)", name: "orders_tracking_number"
    t.check_constraint "\`status\` in (_utf8mb4'pending',_utf8mb4'paid',_utf8mb4'shipped',_utf8mb4'delivered',_utf8mb4'cancelled')", name: "orders_status"
`}
          />
          <p>
            schema.rb には、MySQL が正規化した形（文字列に <code>_utf8mb4</code> が付き、制約の名前の順に並ぶ）で出力されます。マイグレーションに書いた文字列とは見た目が変わりますが、意味は同じです。
          </p>
          <Callout kind="warn" title="手順1を飛ばしてマイグレーションを流すと">
            <p>ずれた行が残ったまま流すと、その行に反する制約を加えるところで止まります。MySQL は、既存の行が条件を満たさない CHECK 制約を加えようとするとエラーにします<Ref n={6} />。</p>
            <Code
              lang="text"
              title="実行結果（手順1の前に bin/rails db:migrate。一部を省略）"
              code={`
== 20261121000002 AddStateChecksToOrders: migrating ===========================
-- change_column_null(:orders, :status, false)
   -> 0.1321s
-- add_check_constraint(:orders, "status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')", {name: "orders_status"})
   -> 0.1570s
-- add_check_constraint(:orders, "status = 'cancelled' OR (status <> 'pending') = (paid_at IS NOT NULL)", {name: "orders_paid_at"})
   -> 0.1474s
-- add_check_constraint(:orders, "(status IN ('shipped', 'delivered')) = (shipped_at IS NOT NULL)", {name: "orders_shipped_at"})
bin/rails aborted!
ActiveRecord::CheckViolation: Mysql2::Error: Check constraint 'orders_shipped_at' is violated. (ActiveRecord::CheckViolation)
`}
            />
            <p>
              MySQL の ALTER TABLE はトランザクションで取り消せないので、止まる前に加えた NOT NULL と2つの制約は残ります。マイグレーションは完了の記録をしないので、行を直してからもう一度流すと、今度は <code>Duplicate check constraint name 'orders_status'</code> で止まりました。行を直してから流すか、残った制約を手で消してから流し直します。
            </p>
          </Callout>
          <h3>手順5：場面と同じ操作と、モデルを通らない書き換えを試す</h3>
          <p>直した後のコードで、場面の節と同じ3つの操作を行います。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/after.rb）"
            code={`
A-002 のキャンセル：Order::InvalidTransition: A-002 は shipped なので cancelled にはできません

倉庫の発送待ちの一覧（Order.paid）：A-001, A-004
11月の発送件数（shipped_at で数える）：2
11月の発送件数（status で数える）：2

会員の注文の詳細の画面：
  A-001 発送の準備中
  A-002 発送済み 発送日 11/19 追跡番号 4411-0002
  A-003 配達済み 発送日 11/19 追跡番号 4411-0003 配達日 11/20
  A-004 発送の準備中
  A-005 入金待ち
`}
          />
          <p>
            A-001 の発送の記録は取り消しで消え、A-002 のキャンセルは拒否され、A-003 には配達日が入りました。発送件数はどちらの列で数えても2件です。次に、モデルの検証も遷移の処理も通らない書き換えで、ずれた組み合わせを作ろうとします。
          </p>
          <Code
            lang="ruby"
            title="script/bypass.rb"
            code={`
shipped = Order.find_by!(number: "A-002")
attempts = {
  "update_columns(status: \\"paid\\")" => -> { shipped.update_columns(status: "paid") },
  "update_all(status: \\"delivered\\")" => -> { Order.where(id: shipped.id).update_all(status: "delivered") },
  "update_column(:status, nil)" => -> { shipped.update_column(:status, nil) },
}
attempts.each do |label, attempt|
  attempt.call
  puts "#{label} → 書き換えた"
rescue ActiveRecord::StatementInvalid => e
  puts "#{label} → #{e.class}: #{e.message.sub(/\\AMysql2::Error: /, '')}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/bypass.rb）"
            code={`
update_columns(status: "paid") → ActiveRecord::CheckViolation: Check constraint 'orders_shipped_at' is violated.
update_all(status: "delivered") → ActiveRecord::CheckViolation: Check constraint 'orders_delivered_at' is violated.
update_column(:status, nil) → ActiveRecord::NotNullViolation: Column 'status' cannot be null
`}
          />
          <p>
            3つとも DB が拒否しました。Rails 8.1 の MySQL のアダプターは、MySQL のエラー番号 3819（CHECK 制約の違反）を <code>ActiveRecord::CheckViolation</code> に、NOT NULL の違反を <code>ActiveRecord::NotNullViolation</code> に変換します<Ref n={9} />。どちらも <code>ActiveRecord::StatementInvalid</code> のサブクラスです。
          </p>
          <p>最後に、5つの状態と4つの日時の列の80通りを INSERT して、テーブルが受け付ける組み合わせを数えました。</p>
          <Code
            lang="ruby"
            title="script/all_combinations.rb"
            code={`
now = Time.current
columns = %i[paid_at shipped_at delivered_at cancelled_at]
accepted = []
rejected = Hash.new(0)
Order.statuses.each_value do |status|
  [nil, now].repeated_permutation(columns.size).each do |values|
    row = columns.zip(values).to_h.merge(status:, number: "X-#{SecureRandom.hex(4)}", total: 1000)
    row[:tracking_number] = "T-1" if row[:shipped_at] # 追跡番号は発送日時と一緒に入れる
    Order.insert!(row)
    accepted << "#{status.ljust(9)} " + columns.map { |c| row[c] ? "○" : "-" }.join(" ")
  rescue ActiveRecord::CheckViolation => e
    rejected[e.message[/'(.+?)'/, 1]] += 1
  end
end
# …（省略）accepted と rejected を表示する
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/all_combinations.rb）"
            code={`
通った組み合わせ 6 通り（paid_at shipped_at delivered_at cancelled_at）
  pending   - - - -
  paid      ○ - - -
  shipped   ○ ○ - -
  delivered ○ ○ ○ -
  cancelled - - - ○
  cancelled ○ - - ○
拒否された組み合わせ 74 通り（最初に違反した制約ごとの件数）
  orders_cancelled_at: 40
  orders_delivered_at: 20
  orders_paid_at: 8
  orders_shipped_at: 6
`}
          />
          <p>
            正しい6通りだけが通り、残りの74通りは拒否されました。図 62-2 の「正」のマスと同じです。図 62-5 は直す前と直した後で、書き込む経路ごとにどこで組み合わせを確かめているかを比べたものです。
          </p>
          <Figure n="62-5" title="直す前と後：書き込む経路と、組み合わせを確かめる場所" caption="紫の箱はモデルの遷移の処理、黄色の箱は MySQL の制約。">
            <PathsFigure />
          </Figure>
          <p>
            図 62-5 の下の段で、<code>transition!</code> を通るのは、モデルのメソッドと古い画面からの操作だけです。<code>transition!</code> は元の状態を確かめ、ロックで同時の操作を順番にします。MySQL の NOT NULL と CHECK 制約は、4つの経路のすべてで、書き込む行の組み合わせを確かめます。2か所は役割が違い、<code>transition!</code> は「どの状態からどの状態に移れるか」を、DB の制約は「その状態の行がどの列を持つか」を確かめます。
          </p>
          <h3>テストでテーブルが受け付ける組み合わせを固定する</h3>
          <p>
            制約は後から列や状態を足すときに書き換えることになります。書き換えで条件を緩めすぎていないかを確かめるため、80通りのうち通るのが6通りだけであることを RSpec で固定しました。
          </p>
          <Code
            lang="ruby"
            title="spec/models/order_spec.rb（抜粋）"
            code={`
it "モデルの検証を通らない書き換えでも、状態と日時がずれる行は DB が拒否する" do
  order = paid_order
  order.ship!(tracking_number: "4411-0002")
  expect { order.update_columns(status: "paid") }.to raise_error(ActiveRecord::CheckViolation, /orders_shipped_at/)
  expect { Order.where(id: order.id).update_all(status: "delivered") }
    .to raise_error(ActiveRecord::CheckViolation, /orders_delivered_at/)
  expect { order.update_column(:status, nil) }.to raise_error(ActiveRecord::NotNullViolation)
end

it "80通りの組み合わせのうち、保存できるのは正しい6通りだけ" do
  # …（省略）script/all_combinations.rb と同じように80通りを INSERT する
  expect(accepted).to contain_exactly(
    ["pending", 0, 0, 0, 0], ["paid", 1, 0, 0, 0], ["shipped", 1, 1, 0, 0],
    ["delivered", 1, 1, 1, 0], ["cancelled", 0, 0, 0, 1], ["cancelled", 1, 0, 0, 1]
  )
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec）"
            code={`
......

Finished in 0.1989 seconds (files took 1.29 seconds to load)
6 examples, 0 failures
`}
          />
          <p>
            6件の内訳は Order の4件（発送の取り消し、古い画面からのキャンセル、モデルを通らない書き換え、80通り）、DeliveryImport の1件、MySQL のバージョンを確かめる1件です。
          </p>
          <h3>発送の記録を別のテーブルに分ける設計</h3>
          <p>
            図 62-4 の右の設計も別の DB で動かして確かめました。発送したときにだけ shipments の行を作り、追跡番号と発送日時をその行の必須の列にします。orders には状態の列を置かず、状態は日時の列と発送の行から決めます。
          </p>
          <Code
            lang="ruby"
            title="script/separate_table.rb（抜粋。bundle exec ruby script/separate_table.rb で実行）"
            code={`
ActiveRecord::Schema.define do
  create_table :orders do |t|
    t.string :number, null: false
    t.datetime :paid_at
    t.datetime :cancelled_at
  end
  # 発送したときにだけ行を作る。発送の行の列はすべて必須
  create_table :shipments do |t|
    t.references :order, null: false, foreign_key: true, index: { unique: true }
    t.string :tracking_number, null: false
    t.datetime :shipped_at, null: false
    t.datetime :delivered_at
  end
end

class Order < ActiveRecord::Base
  has_one :shipment

  # 状態の列は持たず、日時の列と発送の行から決める
  def status
    return "cancelled" if cancelled_at
    return "delivered" if shipment&.delivered_at
    return "shipped" if shipment
    paid_at ? "paid" : "pending"
  end
end

class Shipment < ActiveRecord::Base
  belongs_to :order
end

# …（省略）A-001 と A-002 を入金済みで作る
begin
  Shipment.create!(order: a1, shipped_at: now) # 追跡番号を入れ忘れた
rescue ActiveRecord::NotNullViolation => e
  puts "追跡番号のない発送：#{e.class}"
end

a1.create_shipment!(tracking_number: "4411-0002", shipped_at: now)
a1.shipment.destroy! # 発送の取り消し。発送日時と追跡番号は行ごと消える
puts "A-001 を発送して取り消した後：#{a1.reload.status}、発送の行 #{Shipment.where(order: a1).count} 件"

a2.update!(cancelled_at: now)
a2.create_shipment!(tracking_number: "4411-0003", shipped_at: now) # キャンセルした注文に発送の行を足す
puts "A-002 のキャンセルの後に発送の行を足す：通った（status は #{a2.reload.status}、発送の行 #{Shipment.where(order: a2).count} 件）"

waiting = Order.where.not(paid_at: nil).where(cancelled_at: nil).where.missing(:shipment)
puts "発送待ち：#{waiting.pluck(:number).inspect}"
puts waiting.to_sql
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
追跡番号のない発送：ActiveRecord::NotNullViolation
A-001 を発送して取り消した後：paid、発送の行 0 件
A-002 のキャンセルの後に発送の行を足す：通った（status は cancelled、発送の行 1 件）
発送待ち：["A-001"]
SELECT \`orders\`.* FROM \`orders\` LEFT OUTER JOIN \`shipments\` ON \`shipments\`.\`order_id\` = \`orders\`.\`id\` WHERE \`orders\`.\`paid_at\` IS NOT NULL AND \`orders\`.\`cancelled_at\` IS NULL AND \`shipments\`.\`id\` IS NULL
`}
          />
          <p>
            この設計では、場面の A-001 のずれ（発送の準備中なのに発送日時がある）は、書く列がないので作れません。発送の取り消しは行を消すことになり、発送日時と追跡番号を消し忘れることもありません。追跡番号のない発送の行は、NOT NULL で拒否されました。
          </p>
          <p>
            一方で、キャンセルした注文に発送の行を足す操作は拒否されませんでした。「キャンセル済みの注文には発送の行がない」は orders と shipments の2つのテーブルにまたがる規則で、MySQL の CHECK 制約はほかのテーブルの列も副問い合わせも使えないからです<Ref n={5} />。この規則は1つのテーブルの設計では CHECK 制約で拒否できていました（orders_shipped_at が cancelled の行の発送日時を拒否する）。テーブルを分けると、1つのテーブルの中の組み合わせは減りますが、テーブルの間の組み合わせが新しくできます。その規則は遷移の処理で orders の行をロックしてから確かめることになります。
          </p>
          <p>
            一覧の絞り込みも変わります。発送待ちの注文は <code>where.missing(:shipment)</code> で LEFT OUTER JOIN して発送の行がない注文を探します<Ref n={12} />。状態の列の索引で絞り込むより SQL が長くなり、状態ごとの件数を数えるのも手間が増えます。
          </p>
          <p>
            この章の orders で1つのテーブルを選んだのは、状態ごとに違う列が4つしかなく、すべての規則を1つの行の CHECK 制約で書けたからです。その状態でしか使わない列が多いとき（発送なら配送業者・送り状の番号・荷物の数・重さなど）や、1件の注文を複数の荷物に分けて送るように1対多になるときは、別のテーブルに分けるほうが読みやすくなります。
          </p>
          <Callout kind="v72">
            <p>
              <code>ActiveRecord::CheckViolation</code> は Rails 8.1 で加わった例外のクラスです<Ref n={10} />。Rails 7.2 までは、CHECK 制約の違反は <code>ActiveRecord::StatementInvalid</code>（メッセージは <code>Mysql2::Error: Check constraint '…' is violated.</code>）になります。7.x で違反を区別したいときは、<code>ActiveRecord::StatementInvalid</code> を rescue し、制約の名前をメッセージで確かめます。<code>add_check_constraint</code> と <code>t.check_constraint</code>、NOT NULL の違反の <code>ActiveRecord::NotNullViolation</code>、enum の <code>validate: true</code> は、7.1 と 7.2 でも使えます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '変わりやすい規則まで制約にしたとき',
      body: (
        <>
          <p>
            不正な組み合わせを DB で拒否できるようになると、ほかの業務の規則も制約にしたくなります。ただし、CHECK 制約にした規則は変えるたびにマイグレーションが要り、テーブルのすべての行に当てはまります。変わりやすい規則や、時期によって当てはめたい行が違う規則では、それが手間や障害の原因になります。
          </p>
          <h3>注文の上限金額を CHECK 制約にした例</h3>
          <p>
            不正利用の対策として「1回の注文は 50,000 円まで」という規則を CHECK 制約にしたとします。後で不正利用が増え、これからの注文の上限を 30,000 円に下げることになりました。上限が 50,000 円だった時期に受けた 42,000 円の注文は、そのまま残しておく必要があります。
          </p>
          <Code
            lang="ruby"
            title="script/overuse.rb"
            code={`
# 「1回の注文は 50,000 円まで」という変わりやすい業務の規則を CHECK 制約にした場合
c = ActiveRecord::Base.connection
Order.create!(number: "B-001", total: 42_000) # 上限が 50,000 円だった時期に受けた注文
c.add_check_constraint :orders, "total <= 50000", name: "orders_total_limit"

# 不正利用が増えたので、これからの注文の上限を 30,000 円に下げたい
c.remove_check_constraint :orders, name: "orders_total_limit"
begin
  c.add_check_constraint :orders, "total <= 30000", name: "orders_total_limit"
rescue ActiveRecord::CheckViolation => e
  puts "上限を下げる：#{e.class}: #{e.message.sub(/\\AMysql2::Error: /, '')}"
end
# 上限を上げるときも、制約を作り直す。表を写さない方法では作れない
begin
  c.execute("ALTER TABLE orders ADD CONSTRAINT orders_total_limit CHECK (total <= 60000), ALGORITHM=INPLACE")
rescue ActiveRecord::StatementInvalid => e
  puts "上限を上げる：#{e.message.sub(/\\AMysql2::Error: /, '')}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/overuse.rb）"
            code={`
上限を下げる：ActiveRecord::CheckViolation: Check constraint 'orders_total_limit' is violated.
上限を上げる：ALGORITHM=INPLACE is not supported for this operation. Try ALGORITHM=COPY.
`}
          />
          <p>この結果から、次の3つの問題が分かります。</p>
          <ul>
            <li>CHECK 制約は過去の行にも当てはまります。42,000 円の注文があるので、30,000 円の制約は加えられませんでした。「これからの注文だけ」という規則は、行の値だけでは書けません。</li>
            <li>
              古い制約を消してから新しい制約を加える書き方では、加えるのに失敗すると、上限の制約がまったくない状態が残ります。手順4の Callout と同じく、MySQL の ALTER TABLE はトランザクションで取り消せないからです。
            </li>
            <li>
              上限を上げるときも、制約を作り直します。MySQL 8.4 では、CHECK 制約を加える ALTER TABLE は <code>ALGORITHM=INPLACE</code> を受け付けず、<code>ALGORITHM=COPY</code> で実行されました。MySQL のマニュアルによると、COPY はテーブルの写しを作って1行ずつ写す方法で、その間はほかの INSERT・UPDATE・DELETE を受け付けません<Ref n={6} />。注文の多いテーブルでは、上限を変えるたびに書き込みが止まります。
            </li>
          </ul>
          <p>
            この規則はモデルの検証（<code>on: :create</code> で新しい注文だけを確かめる）に置き、上限の金額は設定の値にするほうが向いています。変えるときにマイグレーションも表の写しも要らず、過去の注文にも当てはまりません。モデルを通らない書き込みは止められませんが、上限の金額は不正利用の対策の1つで、手順4の制約のように、破られるとデータの意味が通らなくなる規則ではありません。
          </p>
          <h3>状態ごとにテーブルを分けすぎた例</h3>
          <p>
            Minsky の例のように状態ごとに型を分ける考え方を、そのままテーブルに当てはめると、pending_orders・paid_orders・shipped_orders のように状態ごとのテーブルを作る設計になります。各テーブルにはその状態で必要な列だけを NOT NULL で持たせられるので、1つのテーブルの中の不正な組み合わせはなくなります。
          </p>
          <p>
            一方で、状態が変わるたびに行を別のテーブルへ移す（INSERT と DELETE を1つのトランザクションで行う）ことになります。注文の明細（order_items）の外部キーは1つのテーブルしか指せないので、どの状態の注文の明細かを外部キーで保証できなくなります。注文の一覧や件数は、5つのテーブルを UNION でまとめて読むことになります。「1つの注文がどれか1つのテーブルにだけある」という規則も、テーブルをまたぐので CHECK 制約では書けません。不正な組み合わせを減らすつもりで、新しい種類の不正な組み合わせを作っています。
          </p>
          <p>
            OCaml では、状態ごとの型を作る費用は型の宣言の数行で、使う側の書き漏らしはコンパイラーが見つけます。Rails のテーブルでは、分けるたびにマイグレーション、関連、結合する SQL が増えます。同じ考え方でも、言語や DB によって費用が違うことを踏まえて選びます。
          </p>
          <h3>判断の目安</h3>
          <p>図 62-6 は規則の種類ごとに、置く場所の目安をまとめたものです。</p>
          <Figure n="62-6" title="規則の種類と、置く場所の目安" caption="上の4行はデータの形（テーブル）で防ぐ規則。下の3行はアプリの処理に置く規則。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">規則の種類</th>
                    <th scope="col">この章の例</th>
                    <th scope="col">置く場所</th>
                    <th scope="col">理由</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>どの状態でも必要な値</td>
                    <td>注文番号・合計・状態</td>
                    <td>NOT NULL</td>
                    <td>どの経路の書き込みでも拒否でき、規則が変わることもほとんどない</td>
                  </tr>
                  <tr>
                    <td>1つの行の中の列の組み合わせ</td>
                    <td>発送済みなら発送日時と追跡番号がある</td>
                    <td>CHECK 制約</td>
                    <td>状態の定義そのもので、変わるのは状態や列を足すときだけ</td>
                  </tr>
                  <tr>
                    <td>その状態でしか使わない列の組（列が多い、1対多になる）</td>
                    <td>配送業者・送り状の番号・荷物の数</td>
                    <td>別テーブル + NOT NULL</td>
                    <td>CHECK 制約の条件が長くなるより読みやすい。テーブルの間の規則は別に守る</td>
                  </tr>
                  <tr>
                    <td>同じ事実を2か所に持っている</td>
                    <td>status と shipped_at の「発送したか」</td>
                    <td>片方をなくす、または CHECK 制約で一致させる</td>
                    <td>2か所の食い違いそのものが不正な状態になる</td>
                  </tr>
                  <tr>
                    <td>元の状態によって決まる規則</td>
                    <td>発送の後はキャンセルできない</td>
                    <td>遷移の処理</td>
                    <td>CHECK 制約は変更の後の行しか見ない</td>
                  </tr>
                  <tr>
                    <td>テーブルをまたぐ規則</td>
                    <td>キャンセル済みの注文に発送の行を作らない</td>
                    <td>遷移の処理（行をロックしてから確かめる）</td>
                    <td>MySQL の CHECK 制約はほかのテーブルの列を使えない</td>
                  </tr>
                  <tr>
                    <td>変わりやすい規則、時期で対象が変わる規則</td>
                    <td>1回の注文の上限金額</td>
                    <td>モデルの検証と設定の値</td>
                    <td>CHECK 制約は過去の行にも当てはまり、作り直すと表の写しが要る</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>迷ったときは、次の順に確かめます。</p>
          <ol>
            <li>その規則が破られた行ができたら、業務の担当者は何をすることになるか（会員への連絡、返金、集計のやり直しなど、手作業の大きさ）</li>
            <li>その規則は状態や列の意味から決まるものか、業務の方針で変わるものか</li>
            <li>その規則は1つの行の今の値だけで判断できるか</li>
            <li>そのテーブルに書き込む経路は、モデルのメソッドのほかにいくつあるか（一括の更新、バッチ、別のアプリ、手作業の SQL）</li>
          </ol>
          <p>
            1で手作業が大きく、2が状態や列の意味で決まり、3が1つの行で判断できる規則は、CHECK 制約の候補です。4の経路が多いほど、DB に置く効果も大きくなります。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の制約の機能・モデルの検証と、この原則',
      body: (
        <>
          <h3>この章で使った Rails の機能</h3>
          <ul>
            <li>
              <code>null: false</code> と <code>change_column_null</code>：列に NOT NULL を付けます。schema.rb には <code>null: false</code> と出力されます。
            </li>
            <li>
              <code>add_check_constraint</code> と <code>t.check_constraint</code>：CHECK 制約を加えます。<code>name:</code> を省くと <code>chk_rails_</code> で始まる名前が付くので、違反のメッセージで分かるように名前を付けます<Ref n={8} />。schema.rb にも出力されるので、テストの DB にも同じ制約が入ります。
            </li>
            <li>
              <code>ActiveRecord::CheckViolation</code> と <code>ActiveRecord::NotNullViolation</code>：DB の制約の違反を表す例外です。MySQL のエラー番号から変換されます<Ref n={9} />。
            </li>
            <li>
              enum の <code>validate: true</code>：一覧にない値と nil を、保存の前の検証のエラーにします（<code>validate: {'{'} allow_nil: true {'}'}</code> で nil を許す）<Ref n={14} />。画面の入力から状態を受け取るときに、利用者に分かるエラーを返せます。
            </li>
            <li>
              <code>with_lock</code>：行をロックして読み直してからブロックを実行します<Ref n={11} />。元の状態による規則を確かめる遷移の処理で使いました。
            </li>
            <li>
              <code>has_one</code> と一意の索引、<code>where.missing</code>：別テーブルの設計で、1件の注文に発送の行を1つに限り、発送の行がない注文を LEFT OUTER JOIN で探します<Ref n={12} />。
            </li>
          </ul>
          <h3>モデルの検証と DB の制約の分担</h3>
          <p>
            Rails のガイドはモデルの検証を、正しいデータだけを保存する最もよい方法としています。DB を問わず使え、利用者が回避できず、テストと保守がしやすいからです。DB の制約については、DB に依存し、テストと保守を難しくすることがあるとしたうえで、ほかのアプリも同じ DB を使う場合や、一意性のように検証だけでは守りにくいものには DB の制約を使うとよいとしています<Ref n={7} />。
          </p>
          <p>
            この章の orders には一括の更新（<code>update_all</code>）、データを直すスクリプト（<code>update_columns</code>）、古い画面からの操作という、モデルの検証では止められない経路がありました。状態と日時の列の組み合わせは、破られると会員への連絡や返金が必要になる規則です。そこで、組み合わせは DB の CHECK 制約で守り、利用者に伝える必要のあるエラー（一覧にない状態など）はモデルの検証で返す、という分担にしました。CHECK 制約の違反は利用者向けの文にならないので、画面の入力の検証の代わりにはなりません。
          </p>
          <h3>Rails Doctrine の「Provide sharp knives」</h3>
          <p>
            Rails Doctrine の「Provide sharp knives」は、Ruby と Rails が強力で危険にもなる機能を意図して持っていることを説明し、正しい使い方は禁止ではなく、規約・後押し・教育で身につけるという考え方を述べています<Ref n={13} />。<code>update_columns</code> や <code>update_all</code> は、検証とコールバックを飛ばす鋭い道具です。この章の直し方はそうした道具を禁止せずに、どの道具で書いても DB が組み合わせを確かめる形にしたものです。Doctrine 自体は DB の制約について述べていないので、これはこの章の解釈です。
          </p>
          <h3>状態の遷移との分担</h3>
          <p>
            CHECK 制約で守れるのは「その状態の行がどの列を持つか」までで、「どの状態からどの状態に移れるか」は守れません。図 62-7 はこの章の注文の状態の遷移と、Explicit State Machine の章の経費申請を並べたものです。
          </p>
          <Figure n="62-7" title="注文の状態の遷移と、経費申請との対応" caption="箱の3行目（経費申請は2行目）は、その状態で値がある列。矢印は遷移で、ラベルは遷移を起こすメソッド。">
            <TransitionsFigure />
          </Figure>
          <p>
            図 62-7 の2つの例は同じ分担をしています。状態ごとに必要な列は CHECK 制約で決め、矢印の規則（発送の後はキャンセルできない、精算済みから承認済みには戻れない）は遷移の処理で守ります。経費申請の章では、状態とイベントの遷移表、条件付きの UPDATE による同時の遷移の防止、AASM を使う場合の注意を扱っています。状態が増えて矢印が複雑になったら、この章の <code>from:</code> の引数を遷移表に置き換えます（<ChapterLink n={47} section="rails-impl" />、<ChapterLink n={47} section="aasm">同じ章の「AASM を使う場合」の節</ChapterLink>）。
          </p>
          <h3>本書のほかの章</h3>
          <ul>
            <li>
              <ChapterLink n={47} />（Explicit State Machine）：経費申請の状態を1つの列にし、状態ごとの列を CHECK 制約で守る実装です。CHECK 制約が NULL の結果を通すことも確かめています。
            </li>
            <li>
              <ChapterLink n={46} />（Value Object）：金額や期間のように1つの値の正しさを、作るときに確かめる型で守る方法です。この章が列の組み合わせを扱うのに対し、1つの値の中身を扱います。
            </li>
            <li>
              <ChapterLink n={27} section="schema-and-data-repair" />：本番のテーブルで、ずれた行を数えて小分けに直す手順です。<ChapterLink n={27} section="live-change">同じ章の別の節</ChapterLink>では、動いているアプリのテーブルに制約を加えるときのロックを扱います。
            </li>
            <li>
              <ChapterLink n={14} section="skip" />：検証とコールバックを通らないメソッドの一覧です。
            </li>
            <li>
              <ChapterLink n={30} section="data-model" />：テーブルに何を保証させるかを、モデルの設計の側から扱います。
            </li>
            <li>
              <ChapterLink n={88} />（Single Source of Truth）：status と shipped_at のように同じ事実を2か所に持たないための原則です。
            </li>
            <li>
              <ChapterLink n={79} />（Fail Fast）と <ChapterLink n={82} />（Defensive Programming）：不正な値を見つけて止める側の原則です。外から来るデータを境界で確かめる方法は Defensive Programming の章で扱います。
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
          <li>Make Illegal States Unrepresentable は、型やデータ構造の形によって、無効な組み合わせを作れないようにする原則です。Yaron Minsky が 2010年の講義「Effective ML」で示し、2011年の記事「Effective ML Revisited」に見出しとして載せました。</li>
          <li>状態の列と4つの日時の列を持つ orders は 80通りの組み合わせを受け付け、正しいのは6通りだけでした。発送の取り消し・古い画面からのキャンセル・update_all の取り込みが、それぞれ別のずれを作り、読む処理の結果が食い違いました。</li>
          <li>Rails のアプリでは主にテーブルの設計でこの原則を実現します。どの状態でも必要な列は NOT NULL、1つの行の中の組み合わせは CHECK 制約、その状態でしか使わない列の組は別のテーブルに分けます。</li>
          <li>直すときは、既存の行を数えて業務の担当者と直し、状態を変える処理を直してから、制約を加えます。行が残ったまま制約を加えると失敗し、MySQL では途中までの変更が残ります。</li>
          <li>NOT NULL と CHECK 制約は update_columns・update_all・別のアプリからの書き込みも拒否します。CHECK 制約は条件が NULL になる行を通すので、状態の列には NOT NULL も付けます。</li>
          <li>元の状態による規則とテーブルをまたぐ規則は CHECK 制約では書けないので、遷移の処理で守ります。変わりやすい規則や時期で対象が変わる規則は、モデルの検証と設定の値に置きます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Effective ML Revisited', publisher: 'Yaron Minsky／Jane Street Tech Blog', url: 'https://blog.janestreet.com/effective-ml-revisited/', accessed: '2026-11-21', version: '2011年3月9日', note: 'Harvard の授業での2回目の講義のコードを載せた記事で、前年の講義の録画を見るように書いていること。見出し「Make illegal states unrepresentable」と、connection_info の直す前（option の項目を並べたレコード）と直した後（状態ごとの型）のコード。' },
    { title: 'Effective ML video', publisher: 'Yaron Minsky／Jane Street Tech Blog', url: 'https://blog.janestreet.com/effective-ml-video/', accessed: '2026-11-21', version: '2010年8月21日', note: 'Harvard と Northeastern の授業で講義を行い、Harvard の講義の録画を公開したこと。' },
    { title: 'Designing with types: Making illegal states unrepresentable', publisher: 'Scott Wlaschin／F# for fun and profit', url: 'https://fsharpforfunandprofit.com/posts/designing-with-types-making-illegal-states-unrepresentable/', accessed: '2026-11-21', version: '2013年1月14日', note: '言葉を Yaron Minsky から借りたこと。メールアドレスか住所の少なくとも一方がある連絡先を、3つの場合を持つ型で表し、どちらもない場合を作れなくした例。' },
    { title: "Parse, don't validate", publisher: 'Alexis King', url: 'https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/', accessed: '2026-11-21', version: '2019年11月5日', note: '「Use a data structure that makes illegal states unrepresentable」を要点に挙げたこと。非正規化した表現は、複数の場所の食い違いという不正な状態を表現できてしまうこと。記事の原則は理想であって厳密な要件ではないこと。' },
    { title: 'CHECK Constraints', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html', accessed: '2026-11-21', version: 'MySQL 8.4', note: '条件が TRUE か UNKNOWN なら通り FALSE なら失敗すること。条件にほかのテーブルの列・副問い合わせ・NOW() のような非決定的な関数を使えないこと。' },
    { title: 'ALTER TABLE Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/alter-table.html', accessed: '2026-11-21', version: 'MySQL 8.4', note: '既存の行が条件に反する CHECK 制約を加えようとするとエラーになること。ALGORITHM=COPY はテーブルの写しに1行ずつ写し、その間は並行する DML を受け付けないこと。' },
    { title: 'Active Record Validations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_validations.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'モデルの検証が正しいデータを保存する最もよい方法とされる理由、DB の制約の利点と欠点（ほかのアプリが同じ DB を使う場合）、検証を飛ばすメソッドの一覧（update_all・update_columns・insert_all など）。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/schema_statements.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/schema_statements.rb#L1310-L1335`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'add_check_constraint が ALTER TABLE … ADD CONSTRAINT … CHECK を実行すること、name を省くと chk_rails_ で始まる名前になること、if_not_exists のオプション。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L869-L905`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'MySQL のエラー番号 3819（ER_CHECK_CONSTRAINT_VIOLATED）を CheckViolation に、NOT NULL の違反を NotNullViolation に変換すること。' },
    { title: 'activerecord/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/CHANGELOG.md#L913`, accessed: '2026-11-21', version: 'Rails 8.1.0（2025年10月22日）の項', note: '「Add ActiveRecord::CheckViolation error class for check constraint violations.」' },
    { title: 'activerecord/lib/active_record/locking/pessimistic.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/locking/pessimistic.rb#L64-L105`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'lock! が reload(lock: true) で行をロックして読み直すこと、with_lock がトランザクションの中で lock! を呼んでからブロックを実行すること。' },
    { title: 'activerecord/lib/active_record/relation/query_methods.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/query_methods.rb#L106-L135`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'where.missing が LEFT OUTER JOIN と関連先の主キーが NULL の条件で、関連先がない行を探すこと。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: '「Provide sharp knives」。危険にもなる機能を意図して持ち、良い使い方を禁止ではなく規約・後押し・教育で身につけるという考え方。' },
    { title: 'activerecord/lib/active_record/enum.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/enum.rb#L128-L156`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'validate: true で一覧にない値と nil が検証のエラーになること、validate: { allow_nil: true } で nil を許すこと。' },
    { title: 'Active Record CHANGELOG（Rails 7.1.0）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.1.0/activerecord/CHANGELOG.md', accessed: '2026-11-13', version: '7.1.0.beta1（2023年9月13日）', note: '「Add validation option for enum」（Explicit State Machine の章の出典を流用）。' },
  ],
}

export default chapter
