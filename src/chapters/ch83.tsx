import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const SQ = 'https://github.com/sidekiq/sidekiq/blob/v8.1.7'

/* ---------- タイムラインの図で使う、出来事の箱 ---------- */
function Ev({ cx, y, text, danger, acc, muted, w = 124 }: { cx: number; y: number; text: string; danger?: boolean; acc?: boolean; muted?: boolean; w?: number }) {
  const stroke = danger ? 'var(--fig-danger)' : acc ? 'var(--fig-accent)' : 'var(--fig-line)'
  return (
    <g>
      <rect x={cx - w / 2} y={y} width={w} height={28} rx={4} fill="var(--fig-bg)" stroke={stroke} strokeWidth={danger || acc ? 2 : 1} strokeDasharray={muted ? '4 3' : undefined} />
      <T x={cx} y={y + 14} anchor="middle" fs={11} tone={danger ? 'danger' : acc ? 'acc' : muted ? 'muted' : undefined}>
        {text}
      </T>
    </g>
  )
}

/* ---------- 図 81-1 ポイントを付与するジョブの構成と、問題が起きる箇所 ---------- */
const sceneSteps = [
  { y: 150, step: '① members.points を足す', target: 'members（MySQL）' },
  { y: 196, step: '② PointMailer でメールを送る', target: 'SMTP サーバー' },
  { y: 242, step: '③ MemberApp.add_points（POST）', target: '会員アプリの API' },
]

function SceneFigure() {
  return (
    <Svg
      id="81-1"
      w={780}
      h={360}
      label="発送の処理が perform_later で GrantPointsJob を Redis のキューに入れ、Sidekiq のワーカーが取り出して実行する。GrantPointsJob は、① MySQL の members の points を足す、② PointMailer で SMTP サーバーにメールを送る、③ 会員アプリの API にポイントの加算を POST で送る、の3つを順に行う。③ が1秒でタイムアウトすると例外になり、Sidekiq はジョブを retry に入れて、後で ① から実行し直す。① と ② は1回目で済んでいるのに、2回目も実行される"
    >
      <Box x={20} y={20} w={180} h={50} lines={['発送の処理', 'perform_later(order.id)']} fs={12} bold subTone="muted" />
      <Box x={250} y={20} w={150} h={50} lines={['Redis', 'キュー default']} fs={12} bold fill="box4" subTone="muted" />
      <Box x={450} y={20} w={150} h={50} lines={['Sidekiq', 'ワーカーのスレッド']} fs={12} bold subTone="muted" />
      <Arrow x1={200} y1={45} x2={248} y2={45} />
      <Arrow x1={400} y1={45} x2={448} y2={45} />
      <Arrow x1={525} y1={70} x2={525} y2={110} />
      <rect x={300} y={112} width={300} height={176} rx={6} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={316} y={130} fs={12} bold mono>
        GrantPointsJob#perform
      </T>
      {sceneSteps.map((s) => (
        <g key={s.step}>
          <Box x={316} y={s.y} w={268} h={36} lines={s.step} fs={12} />
          <Arrow x1={584} y1={s.y + 18} x2={638} y2={s.y + 18} />
          <Box x={640} y={s.y} w={130} h={36} lines={s.target} fs={12} fill="box4" />
        </g>
      ))}
      <T x={612} y={300} fs={11} tone="danger">
        ③ が1秒でタイムアウト
      </T>
      <Arrow d="M300 260 H270 V72" dashed />
      <T x={20} y={176} fs={12} tone="danger">
        例外で Sidekiq の retry に入り、
      </T>
      <T x={20} y={196} fs={12} tone="danger">
        後で ① から実行し直す
      </T>
      <T x={20} y={324} fs={12} tone="danger">
        ① と ② は1回目で済んでいるのに、再試行でもう一度実行される
      </T>
      <T x={20} y={346} fs={11} tone="muted">
        緑の箱はデータと外部のサービス。破線の矢印は、失敗したジョブがキューに戻る道筋
      </T>
    </Svg>
  )
}

/* ---------- 図 81-2 再試行で二重になるタイムライン ---------- */
const tlCols = [
  { x: 140, name: 'Sidekiq' },
  { x: 280, name: 'GrantPointsJob' },
  { x: 420, name: 'members.points' },
  { x: 560, name: 'メール' },
  { x: 700, name: '会員アプリ' },
]

function RetryTimelineFigure() {
  const rows: { t: string; y: number; col: number; text: string; danger?: boolean; from?: number }[] = [
    { t: '0.22秒', y: 76, col: 0, text: 'キューから取り出す' },
    { t: '', y: 76, col: 1, text: '1回目の実行', from: 0 },
    { t: '0.23秒', y: 116, col: 2, text: '1000 → 1030', from: 1 },
    { t: '0.29秒', y: 156, col: 3, text: '1通目を送信', from: 1 },
    { t: '0.29秒', y: 196, col: 4, text: 'POST +30 → 残高 30', from: 1 },
    { t: '1.29秒', y: 236, col: 1, text: 'タイムアウト', danger: true },
    { t: '', y: 236, col: 0, text: 'retry に入れる' },
    { t: '11.35秒', y: 300, col: 0, text: 'retry から取り出す' },
    { t: '', y: 300, col: 1, text: '2回目の実行', from: 0 },
    { t: '11.35秒', y: 340, col: 2, text: '1030 → 1060', danger: true, from: 1 },
    { t: '11.37秒', y: 380, col: 3, text: '2通目を送信', danger: true, from: 1 },
    { t: '11.37秒', y: 420, col: 4, text: 'POST +30 → 残高 60', danger: true, from: 1 },
  ]
  return (
    <Svg
      id="81-2"
      w={780}
      h={490}
      label="縦に時間、列に Sidekiq・GrantPointsJob・members.points・メール・会員アプリを並べたタイムライン。0.22秒に Sidekiq がジョブを取り出し、1回目の実行で points を 1000 から 1030 にし、1通目のメールを送り、会員アプリに POST で 30 の加算を送る。会員アプリは加算して残高 30 にするが、応答が2秒遅れるため、1.29秒にジョブがタイムアウトし、Sidekiq が retry に入れる。11.35秒に retry から取り出された2回目の実行で、points が 1060 になり、2通目のメールを送り、会員アプリの残高が 60 になる"
    >
      {tlCols.map((c) => (
        <g key={c.name}>
          <Box x={c.x - 62} y={16} w={124} h={32} lines={c.name} fs={12} bold fill={c.x >= 420 ? 'box4' : 'box'} mono={c.x === 280 || c.x === 420} />
          <line x1={c.x} y1={48} x2={c.x} y2={456} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <rect x={70} y={272} width={700} height={18} fill="var(--fig-bg)" />
      <T x={420} y={281} anchor="middle" fs={11} tone="muted">
        …… 待ち時間（1秒と揺らぎ）……
      </T>
      {rows.map((r, i) => (
        <g key={i}>
          {r.t && (
            <T x={12} y={r.y + 14} fs={11} tone="muted">
              {r.t}
            </T>
          )}
          {r.from !== undefined && <Arrow x1={r.from === 0 ? tlCols[0].x + 62 : tlCols[r.from].x} y1={r.y + 14} x2={tlCols[r.col].x - 64} y2={r.y + 14} />}
          <Ev cx={tlCols[r.col].x} y={r.y} text={r.text} danger={r.danger} />
        </g>
      ))}
      <Arrow x1={218} y1={250} x2={204} y2={250} dashed />
      <T x={12} y={474} fs={11} tone="muted">
        script/scene.rb before の実行結果から作成。会員アプリは1件目の要求を処理してから、2秒遅れて応答した
      </T>
    </Svg>
  )
}

/* ---------- 図 81-4 2つのワーカーが同時に付与するとき ---------- */
function RaceFigure() {
  const L = { a: 110, b: 280 }
  const R = { a: 500, b: 670 }
  return (
    <Svg
      id="81-4"
      w={780}
      h={420}
      label="左は手順2（exists? で付与済みかを確かめるだけ）、右は手順3（order_id に一意索引）。左では、ワーカーAとBがどちらも SELECT で記録がないことを確かめた後、Bが UPDATE と INSERT をして COMMIT し、Aも UPDATE と INSERT をして COMMIT するので、記録が2行、残高が 1060 になる。右では、Aが UPDATE で会員の行をロックして INSERT し、Bの UPDATE は Aの COMMIT まで待つ。Aの COMMIT の後、Bの INSERT が一意索引に拒まれて RecordNotUnique になり、ROLLBACK で Bの +30 も取り消されるので、記録が1行、残高が 1030 になる"
    >
      <T x={10} y={14} bold>
        手順2：exists? で確かめるだけ
      </T>
      <T x={400} y={14} bold>
        手順3：order_id に一意索引
      </T>
      <line x1={390} y1={6} x2={390} y2={380} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {[L, R].map((p, i) => (
        <g key={i}>
          <Box x={p.a - 62} y={28} w={124} h={28} lines="ワーカーA" fs={12} bold />
          <Box x={p.b - 62} y={28} w={124} h={28} lines="ワーカーB" fs={12} bold />
          <line x1={p.a} y1={56} x2={p.a} y2={340} stroke="var(--fig-line)" strokeDasharray="3 4" />
          <line x1={p.b} y1={56} x2={p.b} y2={340} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <Ev cx={L.a} y={70} text="SELECT：記録なし" />
      <Ev cx={L.b} y={108} text="SELECT：記録なし" />
      <Ev cx={L.b} y={146} text="UPDATE +30・INSERT" />
      <Ev cx={L.b} y={184} text="COMMIT" />
      <Ev cx={L.a} y={222} text="UPDATE +30・INSERT" danger />
      <Ev cx={L.a} y={260} text="COMMIT" danger />
      <T x={10} y={366} fs={12} tone="danger">
        記録が2行、残高 1060（付与が2回）
      </T>
      <Ev cx={R.a} y={70} text="UPDATE +30（行ロック）" w={150} />
      <Ev cx={R.a} y={108} text="INSERT" />
      <Ev cx={R.b} y={108} text="UPDATE は待つ" muted />
      <Ev cx={R.a} y={184} text="COMMIT" />
      <Ev cx={R.b} y={184} text="UPDATE +30・INSERT" w={150} />
      <Ev cx={R.b} y={222} text="RecordNotUnique" acc w={150} />
      <Ev cx={R.b} y={260} text="ROLLBACK（+30 も戻る）" acc w={150} />
      <Ev cx={R.b} y={298} text="1回目の記録を返す" acc w={150} />
      <Arrow x1={R.b} y1={136} x2={R.b} y2={182} dashed />
      <T x={400} y={366} fs={12} tone="acc">
        記録が1行、残高 1030（付与は1回）
      </T>
      <T x={10} y={398} fs={11} tone="muted">
        script/race.rb の実行結果から作成。上から時間の順。A の COMMIT は、確かめるために1秒遅らせた
      </T>
    </Svg>
  )
}

/* ---------- 図 81-6 直す前と直した後のジョブの分け方 ---------- */
const afterJobs = [
  { x: 400, job: 'PointMailJob', guard: '② mailed_at の印で1回', target: 'SMTP サーバー' },
  { x: 590, job: 'SyncMemberAppJob', guard: '③ 残高を PUT で設定', target: '会員アプリの API' },
]

function CompareFigure() {
  return (
    <Svg
      id="81-6"
      w={780}
      h={400}
      label="左は直す前。1つの GrantPointsJob が ① ポイントを足す、② メールを送る、③ 会員アプリに加算を POST する、を順に行い、③ が失敗すると Sidekiq がジョブ全体を再試行して ① から繰り返す。右は直した後。GrantPointsJob は ① を point_grants の一意索引とトランザクションで1回だけ行い、PointMailJob と SyncMemberAppJob を投入する。PointMailJob は mailed_at の印で1回だけ送り、SyncMemberAppJob は残高を PUT で設定する。どちらかが失敗しても、再試行されるのはそのジョブだけになる"
    >
      <T x={10} y={14} bold>
        直す前：1つのジョブ
      </T>
      <T x={400} y={14} bold>
        直した後：副作用ごとのジョブ
      </T>
      <line x1={380} y1={6} x2={380} y2={366} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <rect x={20} y={30} width={240} height={220} rx={6} fill="none" stroke="var(--fig-line)" />
      <T x={34} y={48} fs={12} bold mono>
        GrantPointsJob
      </T>
      <Box x={36} y={64} w={208} h={40} lines={['① members.points を足す', 'update!(points: 合計)']} fs={11} subTone="muted" />
      <Box x={36} y={128} w={208} h={40} lines={['② メールを送る', 'deliver_now']} fs={11} subTone="muted" />
      <Box x={36} y={192} w={208} h={40} lines={['③ 会員アプリに加算を送る', 'POST +30']} fs={11} subTone="muted" />
      <Arrow x1={140} y1={104} x2={140} y2={126} />
      <Arrow x1={140} y1={168} x2={140} y2={190} />
      <Arrow d="M244 212 H300 V84 H246" dashed />
      <T x={290} y={234} fs={11} tone="danger">
        ③ の失敗で
      </T>
      <T x={290} y={250} fs={11} tone="danger">
        ①②③ を
      </T>
      <T x={290} y={266} fs={11} tone="danger">
        やり直す
      </T>
      <T x={20} y={296} fs={12} tone="danger">
        再試行のたびに、ポイントとメールと
      </T>
      <T x={20} y={314} fs={12} tone="danger">
        会員アプリの残高が1回分ずつ増える
      </T>

      <rect x={400} y={30} width={370} height={84} rx={6} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={414} y={48} fs={12} bold mono>
        GrantPointsJob
      </T>
      <Box x={414} y={60} w={342} h={42} lines={['① PointGrant.grant!：トランザクションの中で', '残高を足し、order_id が一意の記録を作る']} fs={11} fill="box5" />
      {afterJobs.map((j) => (
        <g key={j.job}>
          <Arrow x1={j.x + 85} y1={114} x2={j.x + 85} y2={150} />
          <rect x={j.x} y={152} width={170} height={84} rx={6} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
          <T x={j.x + 12} y={170} fs={12} bold mono>
            {j.job}
          </T>
          <Box x={j.x + 10} y={184} w={150} h={40} lines={j.guard} fs={11} fill="box5" />
          <Arrow x1={j.x + 85} y1={236} x2={j.x + 85} y2={276} />
          <Box x={j.x + 15} y={278} w={140} h={34} lines={j.target} fs={11} fill="box4" />
          <Arrow d={`M${j.x + 170} 210 h12 v-50 h-10`} dashed accent />
        </g>
      ))}
      <T x={400} y={140} fs={11} tone="muted">
        perform_later
      </T>
      <T x={400} y={336} fs={12} tone="acc">
        失敗したジョブだけが再試行され、2回目は印や一意索引で
      </T>
      <T x={400} y={354} fs={12} tone="acc">
        見分けられるか、もともと同じ結果になる
      </T>
      <T x={10} y={384} fs={11} tone="muted">
        青い破線の矢印は Sidekiq の再試行。右の各ジョブの中の色の付いた箱が、2回目を見分ける仕組み
      </T>
    </Svg>
  )
}

/* ---------- 図 81-5 メールの送信と、送信済みの印を付ける順序 ---------- */
function MailFigure() {
  return (
    <Svg
      id="81-5"
      w={780}
      h={330}
      label="上は、先に mailed_at の印を付けてから SMTP に送る順序（この章の PointMailJob）。印を付けた後、送る前にプロセスが強制終了されるとメールは届かないので、最大1回になる。送信が例外になったときは印を戻して再試行する。下は、送った後に印を付ける順序。送った後、印を付ける前に止まると、再試行で2通目を送るので、少なくとも1回になる。どちらの順序でも、SMTP サーバーが受け取った後に応答が失われると、送り手は届いたかどうかを知れない"
    >
      <T x={10} y={16} bold>
        先に印を付ける（この章の PointMailJob）：最大1回
      </T>
      <Box x={20} y={34} w={200} h={44} lines={['mailed_at が空の行だけ', '印を付ける（UPDATE）']} fs={11} fill="box5" />
      <Box x={290} y={34} w={180} h={44} lines={['SMTP サーバーに送る', 'deliver_now']} fs={11} />
      <Box x={540} y={34} w={120} h={44} lines="完了" fs={12} />
      <Arrow x1={220} y1={56} x2={288} y2={56} />
      <Arrow x1={470} y1={56} x2={538} y2={56} />
      <T x={255} y={98} anchor="middle" fs={14} tone="danger">
        ×
      </T>
      <T x={180} y={118} fs={11} tone="danger">
        ここで強制終了：届かない
      </T>
      <T x={290} y={140} fs={11} tone="acc">
        送信が例外：印を戻して raise → 再試行で送る
      </T>

      <T x={10} y={186} bold>
        送った後に印を付ける：少なくとも1回
      </T>
      <Box x={20} y={204} w={200} h={44} lines={['SMTP サーバーに送る', 'deliver_now']} fs={11} />
      <Box x={290} y={204} w={180} h={44} lines={['印を付ける', '（UPDATE）']} fs={11} fill="box5" />
      <Box x={540} y={204} w={120} h={44} lines="完了" fs={12} />
      <Arrow x1={220} y1={226} x2={288} y2={226} />
      <Arrow x1={470} y1={226} x2={538} y2={226} />
      <T x={255} y={268} anchor="middle" fs={14} tone="danger">
        ×
      </T>
      <T x={180} y={288} fs={11} tone="danger">
        ここで強制終了：再試行で2通目
      </T>
      <T x={10} y={318} fs={11} tone="muted">
        どちらの順序でも、SMTP サーバーが受け取った後に応答が失われると、送り手には届いたかどうかが分からない
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 83,
  part: 8,
  title: 'Idempotency（冪等性）：ジョブを2回実行してもメールとポイントを二重にしない',
  summary:
    '発送した注文にポイントを付与する Sidekiq のジョブが、会員アプリへの通知のタイムアウトで再試行され、ポイントとメールが二重になる場面から始めます。RFC 9110 の冪等なメソッドの定義を確かめ、付与の記録を一意索引で1回にし、メールは送信済みの印で、会員アプリへの通知は残高を設定する PUT で、それぞれ2回目を見分ける形に直します。最後に、すべてのジョブを引数で「1回だけ」にしたときに起きる取りこぼしを扱います。',
  goals: [
    'ジョブの再試行・停止・二重の投入で、同じ処理が2回以上実行される理由を説明できる',
    'RFC 9110 の冪等の定義（意図した効果が1回と同じ）と、安全・厳密に1回・原子性との違いを説明できる',
    '付与の記録に一意索引を付け、存在を確かめてから作る書き方では同時の実行を防げないことを実行結果で説明できる',
    'メールや外部の API のように取り消せない副作用を別のジョブに分け、送信済みの印や「設定する」形の要求で2回目を見分けられる',
    '重複を見分ける鍵を業務の単位から決め、引数から機械的に作った鍵で必要な実行を捨てる問題を避けられる',
  ],
  prerequisites: [18, 38],
  sections: [
    {
      id: 'scene',
      title: 'Sidekiq の再試行で、ポイントとメールが二重になる',
      body: (
        <>
          <p>
            この章では、注文にポイントを付与するジョブを例に、<Term en="Idempotency">冪等性</Term>（べきとうせい）を扱います。冪等性は、同じ操作を複数回実行しても1回実行したときと結果が変わらないようにする、という原則です。まず、冪等でないジョブを本物の Sidekiq で動かし、再試行でポイントとメールが二重になる様子を確かめます。
          </p>
          <h3>そもそも何をするジョブか</h3>
          <p>
            通販サイトで、注文の商品を発送すると、購入額の1%をポイントとして会員に付与します。3,000円の注文なら30ポイントです。付与した後は、「30ポイントを付与しました」というメールを会員に送り、会員アプリ（スマートフォンのアプリのサーバー。別のチームが運用している）の API に知らせて、アプリの画面に出る残高を更新します。
          </p>
          <p>
            発送の画面の応答を待たせないように、この3つの処理は Sidekiq のジョブで行います。ジョブが例外を投げると、Sidekiq は同じジョブを少し後にもう一度、perform の最初から実行します。これを<Term en="retry">再試行</Term>と呼び、既定では25回まで繰り返します（<ChapterLink n={18} section="retry" />）<Ref n={8} />。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_members_and_orders.rb"
            code={`
class CreateMembersAndOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :members do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.integer :points, null: false, default: 0
    end
    create_table :orders do |t|
      t.references :member, null: false, foreign_key: true
      t.integer :total, null: false # 購入額（円）
      t.datetime :shipped_at
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/order.rb"
            code={`
class Order < ApplicationRecord
  belongs_to :member

  # 購入額の1%をポイントにする
  def points = total / 100
end
`}
          />
          <h3>付与・メール・通知を1つのジョブで行うコード</h3>
          <p>直す前のジョブは、ポイントを足す・メールを送る・会員アプリに加算を送るという3つの処理を、この順に1つの perform に書いています。</p>
          <Code
            lang="ruby"
            title="app/jobs/grant_points_job.rb（直す前）"
            code={`
# 発送した注文の購入額の1%をポイントとして付与する（直す前）
class GrantPointsJob < ApplicationJob
  def perform(order_id)
    order = Order.find(order_id)
    member = order.member

    member.update!(points: member.points + order.points)                # ① ポイントを足す
    PointMailer.with(member:, points: order.points).granted.deliver_now # ② メールを送る
    MemberApp.add_points(member, order.points)                          # ③ 会員アプリに知らせる
  end
end
`}
          />
          <p>会員アプリの API は付与したポイントを POST で受け取り、アプリの側の残高に足します。ジョブの側のタイムアウトは1秒です。</p>
          <Code
            lang="ruby"
            title="app/services/member_app.rb（直す前に使う部分）"
            code={`
# 会員アプリ（スマホアプリのサーバー）の API。アプリの画面に出すポイントの残高を知らせる
module MemberApp
  def self.connection
    Faraday.new(url: ENV.fetch("MEMBER_APP_URL", "http://127.0.0.1:4567"), request: { timeout: 1 }) do |f|
      f.request :json
      f.response :raise_error
    end
  end

  # 直す前：付与したポイントを加算させる（POST）
  def self.add_points(member, points)
    connection.post("/members/#{member.id}/point_additions", { points: })
  end
  # …（省略）
end
`}
          />
          <Figure n="81-1" title="ポイントを付与するジョブの構成と、問題が起きる箇所" caption="赤い文字は、次の項で確かめる問題。">
            <SceneFigure />
          </Figure>
          <p>
            図 81-1 のとおり、1つのジョブが MySQL・SMTP サーバー・会員アプリの3か所に書き込みます。③ の会員アプリへの送信が失敗すると、ジョブ全体が失敗したことになり、Sidekiq は ① から実行し直します。
          </p>
          <h3>会員アプリの応答が遅れたときの実行結果</h3>
          <p>
            Sidekiq を同じプロセスの中で起動し（<code>Sidekiq.configure_embed</code>）、会員アプリの代わりに、TCP のソケットで HTTP の要求を受ける小さなサーバー（FakeMemberApp）を同じプロセスの中に立てて、ジョブを実行しました。このサーバーは要求を受けるとすぐに残高を更新し、1件目だけは2秒待ってから応答します。本物の API でも、処理を終えた後に応答が遅れたり途中で切れたりすることがあるので、その状況を再現するためです。確かめるために、再試行までの待ち時間を1秒にしています（Sidekiq はこれに0〜9秒の揺らぎを足します）<Ref n={8} />。
          </p>
          <Code
            lang="ruby"
            title="script/scene.rb（抜粋）"
            code={`
load Rails.root.join("before/grant_points_job.rb") if ARGV.first == "before"
ApplicationJob.sidekiq_retry_in { 1 } # 確かめるために、再試行までの待ち時間を1秒にする（揺らぎが足される）

app = FakeMemberApp.new(delays: [2]) # 1件目の要求は、処理してから2秒後に応答する
member = Member.create!(name: "佐藤", email: "sato@example.com", points: 1000)
order = member.orders.create!(total: 3000, shipped_at: Time.current)
# …（省略：ジョブの開始・SQL・メールの送信を ActiveSupport::Notifications で表示する）

sidekiq = Sidekiq.configure_embed do |config|
  config.queues = %w[default]
  config.concurrency = 1
  config[:average_scheduled_poll_interval] = 1
end
sidekiq.run
GrantPointsJob.perform_later(order.id)
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb before）"
            code={`
 0.22秒 GrantPointsJob の実行を開始
 0.23秒   UPDATE members SET members.points = 1030 WHERE members.id = 3
 0.29秒   メールを送信: 30ポイントを付与しました
 1.29秒   失敗: Faraday::TimeoutError（Sidekiq が再試行に回す）
11.35秒 GrantPointsJob の実行を開始
11.35秒   UPDATE members SET members.points = 1060 WHERE members.id = 3
11.37秒   メールを送信: 30ポイントを付与しました
---
members.points: 1060（付与する前は 1000、付与するのは 30）
送ったメール: 2通
会員アプリが受けた要求: ["POST /members/3/point_additions points=30", "POST /members/3/point_additions points=30"]
会員アプリの残高: 60
`}
          />
          <p>
            1回目の実行で、① の UPDATE と ② のメールは済んでいました。③ がタイムアウトしたので Sidekiq はジョブを再試行し、2回目の実行で ① と ② がもう一度行われました。30ポイントの付与が60ポイントになり、同じメールが2通届いています。
          </p>
          <p>
            会員アプリの側にも問題があります。会員アプリは1件目の要求を受け取って処理を済ませ、応答だけが遅れました。ジョブの側から見ると、タイムアウトしたのが「要求が届かなかった」からなのか「処理は済んだが応答が届かなかった」からなのかを区別できません。送り直した2件目も加算されたので、アプリの画面の残高は60ポイント分増えています。この流れを時間の順に並べたのが図 81-2 です。
          </p>
          <Figure n="81-2" title="再試行で二重になるタイムライン" caption="上から時間の順。赤い枠が、2回目の実行で二重になった処理。">
            <RetryTimelineFigure />
          </Figure>
          <h3>再試行のほかにも、同じジョブは2回実行される</h3>
          <p>ジョブが2回実行される原因は、例外による再試行だけではありません。</p>
          <ul>
            <li>
              デプロイで Sidekiq を止めると、停止の待ち時間（既定25秒）までに終わらなかったジョブはキューに戻され、再起動の後に最初から実行されます（<ChapterLink n={18} section="idempotency" />）。
            </li>
            <li>発送の画面でボタンが2回押されると、同じ注文の GrantPointsJob が2件投入され、別々のスレッドが同時に実行することがあります。</li>
            <li>再試行を使い切って Dead に入ったジョブを、運用の担当者が管理画面から手で実行し直すことがあります。</li>
          </ul>
          <p>どの場合も、ジョブの側から見ると「同じ引数で perform がもう一度呼ばれる」という点は同じです。ジョブが1回だけ実行されることを前提にせず、2回目が来ても結果が変わらないように書く必要があります。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '同じ操作を何回実行しても、1回目と同じ結果にする',
      body: (
        <>
          <h3>原則の定義</h3>
          <p>
            冪等性は、同じ操作を複数回実行しても結果が変わらないようにするという原則です。リトライ処理や非同期のジョブのように、同じ操作が2回以上実行されうる場所で特に重要になります。ここでの「結果」は、メソッドの戻り値ではなく、操作の後に残る状態を指します。DB の行、会員の受信箱に届いたメール、外部のサービスに記録された値などです。
          </p>
          <p>
            場面のジョブに当てはめると、「注文1件の30ポイントを付与する」という操作を2回実行した後も、残高は1回分の1030、メールは1通、会員アプリの残高も1030であってほしい、ということになります。直す前のジョブは、2回実行すると3つの状態がすべて2回分になるので、冪等ではありません。
          </p>
          <h3>冪等性が求められる場所</h3>
          <p>同じ操作が2回以上実行されうる場所は、ジョブのほかにもあります。Rails のアプリでよく出会うのは次の場所です。</p>
          <ul>
            <li>HTTP のクライアントの再送：利用者がボタンを2回押す、ブラウザーで再読み込みする、スマートフォンのアプリが通信の切断の後に送り直す。</li>
            <li>Webhook とメッセージキュー：送り手は、届いたことを確かめられなければ同じイベントを送り直す。</li>
            <li>データを直すスクリプトや rake タスク：途中で止まったときに、最初から実行し直すことが多い。</li>
            <li>
              シードのデータ：Rails が生成する <code>db/seeds.rb</code> のコメントは、どの環境でいつ実行してもよいように、コードを冪等にするよう求め、<code>find_or_create_by!</code> の例を載せています<Ref n={15} />。
            </li>
          </ul>
          <p>どの場所でも、「失敗したらもう一度実行する」という操作は安全なやり直しの手段として使われます。操作が冪等であれば、利用者や運用の担当者は、成功したかどうかが分からないときに迷わず実行し直せます。冪等でなければ、実行し直す前に、何が済んでいて何が済んでいないかを調べる必要があります。</p>
          <h3>言葉の由来</h3>
          <p>
            idempotent はもともと数学の言葉です。Benjamin Peirce は 1870年にアメリカ科学アカデミーで読んだ論文「Linear Associative Algebra」で、2乗以上にしても自分自身に戻る式を idempotent と呼びました（定義の式は A<sup>n</sup> = A）。この論文は、生前は石版刷りで少部数を配っただけで、1881年に American Journal of Mathematics に掲載されました<Ref n={3} />。ソフトウェアでは、同じ操作を2回適用しても1回適用したときと同じ状態になる性質を指して使います。
          </p>
          <h3>HTTP の冪等なメソッド</h3>
          <p>
            Web の開発者がこの言葉に出会うのは、多くの場合 HTTP の仕様です。RFC 9110（HTTP Semantics、2022年）の 9.2.2節は、あるメソッドの同じ要求を複数回送ったときに、サーバーに対して意図した効果が1回送ったときと同じになるなら、そのメソッドを冪等と定めています。この仕様が定めるメソッドのうち、PUT・DELETE と、安全なメソッド（GET・HEAD・OPTIONS・TRACE）が冪等です<Ref n={1} />。
          </p>
          <p>RFC 9110 の説明には、この章の場面に関わる点が3つあります。</p>
          <ul>
            <li>冪等性は、利用者が求めた効果だけについての性質です。サーバーが要求ごとにログを書いたり、変更の履歴を残したりしてもかまいません<Ref n={1} />。</li>
            <li>
              冪等なメソッドを区別するのは、応答を読む前に通信が失敗したときに、要求を自動で送り直せるからです。元の要求が成功していたとしても、送り直した要求の効果は同じになります。ただし、応答は違ってよいとしています<Ref n={1} />。たとえば DELETE を2回送ると、2回目は 404 を返すかもしれませんが、リソースがない状態は同じです。
            </li>
            <li>
              冪等でないメソッドの要求は、実際には冪等だと分かる方法か、元の要求が適用されなかったと分かる方法がない限り、クライアントが自動で送り直すべきではない（SHOULD NOT）としています<Ref n={1} />。
            </li>
          </ul>
          <p>
            場面の ③ はちょうどこの状況でした。<code>POST /members/3/point_additions</code> は「30を足す」という要求なので冪等ではありません。タイムアウトは「応答を読む前の通信の失敗」にあたり、ジョブの側には元の要求が適用されたかどうかが分かりません。それでも Sidekiq の再試行は要求を送り直したので、加算が2回になりました。PATCH も RFC 5789 で安全でも冪等でもないメソッドとされています。同じ PATCH を2回送っても同じ状態になるように作ることはできる、とも書かれています<Ref n={2} />。
          </p>
          <Figure n="81-3" title="HTTP メソッドの冪等性と、Rails のアクション・本書の章との対応" caption="安全と冪等の列は RFC 9110 の表7と RFC 5789 による。Rails の列は resources が作るルーティング。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>メソッド</th>
                    <th>安全</th>
                    <th>冪等</th>
                    <th>resources のアクション</th>
                    <th>2回届いたときの扱い</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>GET・HEAD</td>
                    <td>はい</td>
                    <td>はい</td>
                    <td>index・show</td>
                    <td>読み取りだけなので、送り直してよい</td>
                  </tr>
                  <tr>
                    <td>PUT</td>
                    <td>いいえ</td>
                    <td>はい</td>
                    <td>update</td>
                    <td>送られた内容で置き換えるので、2回目も同じ状態になる（この章の会員アプリへの通知）</td>
                  </tr>
                  <tr>
                    <td>DELETE</td>
                    <td>いいえ</td>
                    <td>はい</td>
                    <td>destroy</td>
                    <td>2回目は 404 でもよい。消えた状態は同じ</td>
                  </tr>
                  <tr>
                    <td>PATCH</td>
                    <td>いいえ</td>
                    <td>いいえ</td>
                    <td>update</td>
                    <td>
                      値を設定する更新なら冪等に作れる。古い内容への上書きは If-Match で防ぐ（<ChapterLink n={49} section="etag" />）
                    </td>
                  </tr>
                  <tr>
                    <td>POST</td>
                    <td>いいえ</td>
                    <td>いいえ</td>
                    <td>create</td>
                    <td>
                      2回届けば2回作る。冪等性キーで2回目を見分ける（<ChapterLink n={52} section="rails-impl" />）
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 81-3 のとおり、Rails の resources は POST を create に、PATCH と PUT を update に、DELETE を destroy に割り当てます<Ref n={11} />。update は送られた値を属性に設定するので、同じ内容の PATCH を2回受けても状態は同じです。一方、create は POST を受けるたびに行を作ります。支払いの作成のように2回作られると困る POST の受け手は、クライアントが付けた冪等性キーで2回目を見分けます。その実装は<ChapterLink n={52} />で扱います。
          </p>
          <h3>似た考え方との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>考え方</th>
                  <th>何を保証するか</th>
                  <th>冪等性との関係</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>安全（safe）</td>
                  <td>状態を変えない（読み取りだけ）</td>
                  <td>RFC 9110 が定めるメソッドでは、安全なメソッドはすべて冪等。冪等なメソッドには、書き込む PUT・DELETE も含まれる</td>
                </tr>
                <tr>
                  <td>重複排除（deduplication）</td>
                  <td>同じ要求やイベントの2回目を捨てる</td>
                  <td>冪等にするための方法の1つ。この章の一意索引と送信済みの印もこれにあたる</td>
                </tr>
                <tr>
                  <td>厳密に1回（exactly once）</td>
                  <td>処理がちょうど1回だけ行われる</td>
                  <td>
                    ジョブのキューや Webhook の配信は「少なくとも1回」なので、受け手を冪等にして、結果を1回分にする（<ChapterLink n={52} section="delivery-guarantees" />）
                  </td>
                </tr>
                <tr>
                  <td>
                    原子性（<ChapterLink n={84} />）
                  </td>
                  <td>一連の処理が全部成功するか全部失敗するか</td>
                  <td>原子性は1回の実行の途中で失敗したときの話、冪等性は2回目が来たときの話。この章の付与は両方を使う</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>冪等にする2つの形</h3>
          <p>操作を冪等にする方法は大きく2つに分けられます。</p>
          <ul>
            <li>
              操作を「状態を設定する」形にする：「30を足す」ではなく「残高を1030にする」と書けば、2回実行しても残高は1030です。何も記録しなくても冪等になりますが、使えるのは、設定する値を実行する側が知っている場合に限られます。
            </li>
            <li>
              「何をしたか」の記録を一意な鍵で残し、2回目を見分ける：「注文1のポイントを付与した」という行を注文の ID を鍵にして1つだけ作れるようにすれば、2回目は付与をしないで済みます。加算やメールの送信のように、操作そのものを「設定する」形にできない場合に使います。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: '副作用ごとに、2回目を見分ける仕組みを置く',
      body: (
        <>
          <h3>直す順序</h3>
          <p>ジョブ全体を一度に書き換えず、副作用（ジョブの外に残る変化）を1つずつ冪等にしていきます。</p>
          <ol>
            <li>副作用を書き出し、2回目が来たときの害と、2回目を見分ける方法を決める</li>
            <li>ポイントの付与を「注文ごとの記録の行」にし、付与済みなら何もしないようにする</li>
            <li>記録の order_id に一意索引を付け、同時に実行されても2行目を作れないようにする</li>
            <li>会員アプリへの通知を「残高を設定する PUT」にし、別のジョブに分ける</li>
            <li>メールを別のジョブに分け、送信済みの印で2回目を見分ける</li>
            <li>場面と同じ条件で動かし、RSpec で2回の実行と同時の実行を確かめる</li>
          </ol>
          <p>手順1で書き出した結果が次の表です。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>副作用</th>
                  <th>2回目の害</th>
                  <th>2回目を見分ける方法</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>① members.points に足す</td>
                  <td>残高が増えすぎる（お金と同じ価値を持つ）</td>
                  <td>注文ごとの付与の記録を一意索引で1行にし、残高の更新と同じトランザクションで作る</td>
                </tr>
                <tr>
                  <td>② メールを送る</td>
                  <td>同じメールが2通届く</td>
                  <td>付与の記録に送信済みの印（mailed_at）を付ける</td>
                </tr>
                <tr>
                  <td>③ 会員アプリに知らせる</td>
                  <td>アプリの残高が増えすぎる</td>
                  <td>加算ではなく残高を設定する要求に変え、操作そのものを冪等にする</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>手順2：付与の記録を作り、付与済みなら何もしない</h3>
          <p>注文ごとの付与を記録するテーブル point_grants を作ります。この時点では、order_id の索引は一意ではありません。</p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000002_create_point_grants.rb"
            code={`
class CreatePointGrants < ActiveRecord::Migration[8.1]
  def change
    create_table :point_grants do |t|
      t.references :member, null: false, foreign_key: true
      t.references :order, null: false, foreign_key: true # 一意ではない索引
      t.integer :amount, null: false
      t.datetime :mailed_at
      t.timestamps
    end
  end
end
`}
          />
          <p>
            最初に思いつきやすいのは、記録があるかを先に確かめてから付与する書き方です。残高の更新と記録の作成は、片方だけが残らないように1つのトランザクションに入れます（<ChapterLink n={84} />）。<code>increment!</code> は、読み込んだ値に足すのではなく、SQL の中で足す UPDATE を発行します<Ref n={10} />。
          </p>
          <Code
            lang="ruby"
            title="app/models/point_grant.rb（手順2）"
            code={`
class PointGrant < ApplicationRecord
  belongs_to :member
  belongs_to :order

  def self.grant!(order)
    return find_by(order:) if exists?(order:) # 付与済みなら何もしない

    transaction do
      order.member.increment!(:points, order.points) # 先に会員の行を更新し、行ロックを取る
      create!(member: order.member, order:, amount: order.points)
    end
  end
end
`}
          />
          <p>
            ジョブが再試行で順番に2回実行される場合は、2回目の <code>exists?</code> が記録を見つけるので、これで防げます。では、発送のボタンが2回押され、2つのワーカーが同じ注文のジョブを同時に実行した場合はどうでしょうか。2つのスレッドにそれぞれ DB の接続を持たせて、同じ注文で <code>grant!</code> を呼びました。両方が <code>exists?</code> の SELECT を終えるまで互いに待ち合わせ、ワーカーA の COMMIT は1秒遅らせています。
          </p>
          <Code
            lang="ruby"
            title="script/race.rb（抜粋）"
            code={`
barrier = Concurrent::CyclicBarrier.new(2)
ActiveSupport::Notifications.subscribe("sql.active_record") do |e|
  # …（省略：SQL を時刻とワーカーの名前を付けて表示する）
  barrier.wait(3) if sql.start_with?("SELECT 1 AS one") # 2つとも「付与済みか」を確かめ終えるまで待ち合わせる
  sleep 1 if sql.start_with?("INSERT") && Thread.current[:name] == "ワーカーA" # A の COMMIT を1秒遅らせる
end

%w[ワーカーA ワーカーB].map { |name|
  Thread.new do
    Thread.current[:name] = name
    sleep 0.1 if name == "ワーカーB"
    ActiveRecord::Base.connection_pool.with_connection { PointGrant.grant!(Order.find(order.id)) }
  end
}.each(&:join)
`}
          />
          <Code
            lang="text"
            title="実行結果（手順2のコード、bin/rails runner script/race.rb step1）"
            code={`
0.00秒 ワーカーA: SELECT 1 AS one FROM point_grants WHERE point_grants.order_i…
0.11秒 ワーカーB: SELECT 1 AS one FROM point_grants WHERE point_grants.order_i…
0.11秒 ワーカーB: BEGIN
0.11秒 ワーカーA: BEGIN
0.11秒 ワーカーB: UPDATE members SET members.points = COALESCE(members.points,…
0.12秒 ワーカーB: INSERT INTO point_grants (member_id, order_id, amount, maile…
0.13秒 ワーカーB: COMMIT
0.13秒 ワーカーA: UPDATE members SET members.points = COALESCE(members.points,…
0.13秒 ワーカーA: INSERT INTO point_grants (member_id, order_id, amount, maile…
1.14秒 ワーカーA: COMMIT
point_grants: 2行  members.points: 1060
`}
          />
          <p>
            どちらのワーカーも「記録はない」と判断した後で付与したので、記録が2行でき、残高は1060になりました。確かめてから作るまでの間に、ほかのワーカーが作るのを止める仕組みがないためです。Rails のソースのコメントも、<code>find_or_create_by</code> は SELECT と INSERT を順に実行するだけで原子的ではなく、一意制約がなければ同じ内容の行が2つ以上できうると説明しています<Ref n={6} />。<code>validates :order_id, uniqueness: true</code> も、保存の前に SELECT で確かめる方式なので、同じ理由で同時の保存を防げません<Ref n={7} />。
          </p>
          <h3>手順3：order_id に一意索引を付ける</h3>
          <p>2行目を確実に拒めるのは、データベースの一意索引です。外部キーが order_id の索引を必要とするので、一意索引を先に作ってから元の索引を消します。</p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000003_add_unique_index_to_point_grants.rb"
            code={`
class AddUniqueIndexToPointGrants < ActiveRecord::Migration[8.1]
  def change
    # 外部キーが索引を必要とするので、一意索引を先に作ってから元の索引を消す
    add_index :point_grants, :order_id, unique: true, name: "index_point_grants_on_order_id_unique"
    remove_index :point_grants, :order_id, name: "index_point_grants_on_order_id"
  end
end
`}
          />
          <p>手順2の実行で重複した行が残っている状態でこのマイグレーションを実行すると、索引を作れずに止まりました。</p>
          <Code
            lang="text"
            title="実行結果（重複した行が残っているときの bin/rails db:migrate、抜粋）"
            code={`
== 20261121000003 AddUniqueIndexToPointGrants: migrating ======================
-- add_index(:point_grants, :order_id, {unique: true, name: "index_point_grants_on_order_id_unique"})
bin/rails aborted!
StandardError: An error has occurred, all later migrations canceled: (StandardError)

Mysql2::Error: Duplicate entry '1' for key 'point_grants.index_point_grants_on_order_id_unique'
`}
          />
          <p>
            本番のテーブルに一意索引を足すときは、先に重複を探して直してから索引を作ります。重複した付与を取り消すには、残高も合わせて直す必要があります。データを直す手順と、稼働中のテーブルを変えるときの注意は<ChapterLink n={27} section="schema-and-data-repair" />で扱いました。重複を消してからマイグレーションを実行し、<code>grant!</code> を次のように直しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/point_grant.rb（直した後）"
            code={`
class PointGrant < ApplicationRecord
  belongs_to :member
  belongs_to :order

  # 注文1件につき1回だけポイントを付与する。付与済みなら、1回目の記録を返す
  def self.grant!(order)
    transaction do
      order.member.increment!(:points, order.points) # 先に会員の行を更新し、行ロックを取る
      create!(member: order.member, order:, amount: order.points)
    end
  rescue ActiveRecord::RecordNotUnique # order_id の一意索引が2行目を拒んだ
    find_by!(order:)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（直した後のコード、bin/rails runner script/race.rb）"
            code={`
0.01秒 ワーカーA: BEGIN
0.01秒 ワーカーA: UPDATE members SET members.points = COALESCE(members.points,…
0.02秒 ワーカーA: INSERT INTO point_grants (member_id, order_id, amount, maile…
0.11秒 ワーカーB: BEGIN
1.03秒 ワーカーA: COMMIT
1.03秒 ワーカーB: UPDATE members SET members.points = COALESCE(members.points,…
1.03秒 ワーカーB: INSERT INTO point_grants (member_id, order_id, amount, maile… → ActiveRecord::RecordNotUnique
1.04秒 ワーカーB: ROLLBACK
point_grants: 1行  members.points: 1030
`}
          />
          <p>
            表示している時刻は、それぞれの SQL が終わった時刻です。ワーカーB の UPDATE は 0.11秒ごろに始まりましたが、ワーカーA が会員の行にロックを持っていたので、A の COMMIT（1.03秒）まで待ちました。その後の INSERT は一意索引に拒まれて RecordNotUnique になり、トランザクションが ROLLBACK されたので、B が足した30も取り消されています。<code>grant!</code> は例外を捕まえて1回目の記録を返すので、呼び出し側のジョブは2回目でも正常に終わります。<code>rescue</code> をトランザクションのブロックの外（メソッドの終わり）に書いているのは、ROLLBACK が済んでから1回目の記録を読むためです。ブロックの中で例外を捕まえると、エラーになった INSERT の後もトランザクションが続き、足した30が取り消されないまま COMMIT されてしまいます（script/rescue_inside.rb で試すと、付与済みの注文でも残高が1030から1060に増えました）。MySQL では、一意索引の違反はその SQL だけを取り消し、トランザクション全体は取り消さないからです<Ref n={16} />。手順2と手順3の違いを並べたのが図 81-4 です。
          </p>
          <Figure n="81-4" title="2つのワーカーが同じ注文に同時に付与するとき" caption="script/race.rb の実行結果から作成した模式図。">
            <RaceFigure />
          </Figure>
          <Callout kind="warn" title="INSERT を先に書くとデッドロックになった">
            <p>
              最初は <code>create!</code> を先に、<code>increment!</code> を後に書いていました。この順序で同じ実験をすると、一意索引で拒まれる前にデッドロックが起き、ワーカーB の INSERT は ActiveRecord::Deadlocked になりました。
            </p>
            <Code
              lang="text"
              title="実行結果（INSERT を先に書いたとき）"
              code={`
0.00秒 ワーカーA: BEGIN
0.02秒 ワーカーA: INSERT INTO point_grants (member_id, order_id, amount, mailed_at, crea
0.11秒 ワーカーB: BEGIN
1.02秒 ワーカーA: UPDATE members SET members.points = COALESCE(members.points, 0) + 30 W
1.03秒 ワーカーB: INSERT INTO point_grants (member_id, order_id, amount, mailed_at, crea → ActiveRecord::Deadlocked
1.03秒 ワーカーB: ROLLBACK
1.03秒 ワーカーA: COMMIT
`}
            />
            <p>
              InnoDB は外部キーの条件を確かめる INSERT で、参照先の行（ここでは members の行）に共有ロックを取ります<Ref n={5} />。ワーカーB は、会員の行に共有ロックを持ったまま、A が INSERT した行のロックが外れるのを待ちます。そこで A が同じ会員の行を UPDATE しようとすると、A は B の共有ロックを待つので、互いに相手を待つ形になります。先に会員の行を UPDATE して排他ロックを取ると、2つ目のワーカーはその時点で待つので、この形にはなりません。デッドロックの読み方と避け方は<ChapterLink n={38} section="deadlock" />で扱いました。
            </p>
          </Callout>
          <h3>手順4：会員アプリへの通知を、残高を設定する PUT にする</h3>
          <p>
            会員アプリのチームと相談し、「何ポイント足すか」を送る POST に加えて、「今の残高はいくつか」を送る PUT の API を用意してもらいました。PUT は送られた内容で置き換えるメソッドなので、同じ要求が2回届いても、アプリの残高は同じ値になります（図 81-3）。
          </p>
          <Code
            lang="ruby"
            title="app/services/member_app.rb（足した部分）"
            code={`
  # 直した後：DB の残高をそのまま設定させる（PUT）
  def self.put_balance(member)
    connection.put("/members/#{member.id}/balance", { points: member.points })
  end
`}
          />
          <p>通知は GrantPointsJob から切り離し、別のジョブにします。引数の会員はジョブを実行するときに DB から読み直されるので、送るのは実行した時点の残高です。再試行が遅れて別の付与の後に実行されても、その時点の正しい残高を送ります。</p>
          <p>
            ただし、同じ会員の SyncMemberAppJob が2つ同時に動くと、古い残高を読んだジョブの PUT が、新しい残高の PUT より後に届くことがあります。その場合、会員アプリの残高は古い値で上書きされ、次の通知が届くまで古いままです。この順序の入れ替わりが問題になるなら、送る値に版の番号（たとえば point_grants の最新の id や更新の時刻）を付け、会員アプリの側で、持っている版より古い要求を捨てるようにします。版の番号で古い書き込みを拒む考え方は<ChapterLink n={49} />と同じです。この章の場面では、会員アプリの表示が数秒古くても困らないので、版の番号は付けていません。
          </p>
          <Code
            lang="ruby"
            title="app/jobs/sync_member_app_job.rb"
            code={`
class SyncMemberAppJob < ApplicationJob
  # 実行した時点の DB の残高を、会員アプリに設定させる。何回送っても残高は同じになる
  def perform(member)
    MemberApp.put_balance(member)
  end
end
`}
          />
          <h3>手順5：メールを別のジョブにし、送信済みの印を付ける</h3>
          <p>
            送った後のメールは取り消せません。PointMailJob は、point_grants の mailed_at が空の行だけを「送信済み」に変える UPDATE を先に実行し、1行を更新できたときだけ送ります。<code>update_all</code> は更新した行数を返します<Ref n={12} />。2回目の実行や、同時に動いた別のワーカーでは、mailed_at がすでに埋まっているので0行になり、送りません。
          </p>
          <Code
            lang="ruby"
            title="app/jobs/point_mail_job.rb"
            code={`
class PointMailJob < ApplicationJob
  def perform(grant)
    # mailed_at が空の行を「送信済み」に変えられた実行だけが送る
    claimed = PointGrant.where(id: grant.id, mailed_at: nil).update_all(mailed_at: Time.current)
    return if claimed.zero?

    begin
      PointMailer.with(member: grant.member, points: grant.amount).granted.deliver_now
    rescue StandardError
      grant.update_columns(mailed_at: nil) # 送れなかったので印を戻し、再試行で送り直す
      raise
    end
  end
end
`}
          />
          <p>
            印を付けるのと送るのは別の操作なので、間でプロセスが止まる場合を考えておきます。図 81-5 のとおり、先に印を付ける順序では、印を付けた後に Sidekiq のプロセスが強制終了されると、メールは届きません（最大1回）。送った後に印を付ける順序では、送った後に止まると、再試行で2通目を送ります（少なくとも1回）。どちらの順序でも、SMTP サーバーがメールを受け取った後に応答が失われた場合、送り手には届いたかどうかが分かりません。メールのように相手の状態を問い合わせられない副作用は、厳密に1回にはできないということです。
          </p>
          <Figure n="81-5" title="メールの送信と、送信済みの印を付ける順序" caption="× は、そこでプロセスが強制終了された場合。">
            <MailFigure />
          </Figure>
          <p>
            ポイントの付与の知らせは、2通届くより届かないほうが困る、という判断もありえます。その場合は送った後に印を付ける順序にします。この章では「送信が例外になったら印を戻す」ことで、SMTP の一時的な失敗では届かなくならないようにし、残るのはプロセスが強制終了された場合だけにしました。どちらを選ぶかは、二重に届く害と届かない害を比べて、副作用ごとに決めます。
          </p>
          <h3>手順6：場面と同じ条件で動かす</h3>
          <p>最後に、GrantPointsJob を付与だけのジョブにし、メールと通知のジョブを投入するようにしました。直す前と直した後のジョブの分け方を図 81-6 で比べます。</p>
          <Code
            lang="ruby"
            title="app/jobs/grant_points_job.rb（直した後）"
            code={`
# 発送した注文の購入額の1%をポイントとして付与する（直した後）
class GrantPointsJob < ApplicationJob
  def perform(order_id)
    order = Order.find(order_id)
    grant = PointGrant.grant!(order)             # ① 注文ごとに1回だけ付与する
    PointMailJob.perform_later(grant)            # ② メールは別のジョブで送る
    SyncMemberAppJob.perform_later(order.member) # ③ 会員アプリへの通知も別のジョブにする
  end
end
`}
          />
          <Figure n="81-6" title="直す前と直した後のジョブの分け方" caption="左は1つのジョブが3つの副作用を持つ。右は副作用ごとにジョブを分け、それぞれに2回目を見分ける仕組みを置いた。">
            <CompareFigure />
          </Figure>
          <p>
            直す前は、③ の失敗で ① と ② が繰り返されました。直した後は、失敗したジョブだけが再試行され、再試行されたジョブも、一意索引・送信済みの印・設定する形の要求のどれかで、2回目を見分けられるか、もともと同じ結果になります。場面と同じ条件（会員アプリの1件目の応答が2秒遅れる）で動かし、最後に同じ注文の GrantPointsJob をもう一度投入しました。
          </p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb）"
            code={`
 0.22秒 GrantPointsJob の実行を開始
 0.22秒   UPDATE members SET members.points = COALESCE(members.points, 0) + 30 WHERE members.id = 4
 0.22秒   INSERT INTO point_grants (member_id, order_id, amount, maile…
 0.24秒 PointMailJob の実行を開始
 0.25秒   UPDATE point_grants SET point_grants.mailed_at = '…' WHERE point_grants.id = 5 AND point_grants.mailed_at IS NULL
 0.30秒   メールを送信: 30ポイントを付与しました
 0.30秒 SyncMemberAppJob の実行を開始
 1.30秒   失敗: Faraday::TimeoutError（Sidekiq が再試行に回す）
13.02秒 SyncMemberAppJob の実行を開始
14.53秒 == 同じ注文の GrantPointsJob を、もう一度投入する
14.54秒 GrantPointsJob の実行を開始
14.54秒   UPDATE members SET members.points = COALESCE(members.points, 0) + 30 WHERE members.id = 4
14.54秒   INSERT INTO point_grants (member_id, order_id, amount, maile… → ActiveRecord::RecordNotUnique
14.54秒   ROLLBACK
14.55秒 PointMailJob の実行を開始
14.55秒   UPDATE point_grants SET point_grants.mailed_at = '…' WHERE point_grants.id = 5 AND point_grants.mailed_at IS NULL
14.55秒 SyncMemberAppJob の実行を開始
---
members.points: 1030（付与する前は 1000、付与するのは 30）
送ったメール: 1通
会員アプリが受けた要求: ["PUT /members/4/balance points=1030", "PUT /members/4/balance points=1030", "PUT /members/4/balance points=1030"]
会員アプリの残高: 1030
`}
          />
          <p>
            会員アプリへの通知は1回目がタイムアウトし、SyncMemberAppJob だけが再試行されました。会員アプリは同じ PUT を3回受け取りましたが（1回目、その再試行、2回目の投入）、残高は1030のままです。2回目に投入した GrantPointsJob では、INSERT が一意索引に拒まれて ROLLBACK され、PointMailJob の UPDATE は mailed_at が埋まっていたので何も更新せず、メールを送りませんでした。直す前に1060・2通・60だった結果が、1030・1通・1030になっています。
          </p>
          <h3>RSpec で確かめる</h3>
          <p>同時の実行は、2つのスレッドを待ち合わせてから <code>grant!</code> を呼んで確かめます。スレッドごとに DB の接続を使うので、この例ではテストのトランザクションを使わず、終わった後に行を消します。</p>
          <Code
            lang="ruby"
            title="spec/models/point_grant_spec.rb（抜粋）"
            code={`
  context "2つのワーカーが同時に実行したとき" do
    self.use_transactional_tests = false
    after { [PointGrant, Order, Member].each(&:delete_all) }

    it "一意索引が2行目を拒み、付与は1回分になる" do
      barrier = Concurrent::CyclicBarrier.new(2)
      ids = 2.times.map do
        Thread.new do
          ActiveRecord::Base.connection_pool.with_connection do
            target = Order.find(order.id)
            barrier.wait(3) # 2つのスレッドが同時に grant! を呼ぶ
            PointGrant.grant!(target).id
          end
        end
      end.map(&:value)

      expect(ids.uniq.size).to eq 1
      expect(PointGrant.where(order:).count).to eq 1
      expect(member.reload.points).to eq 1030
    end
  end
`}
          />
          <Code
            lang="ruby"
            title="spec/jobs/grant_points_job_spec.rb（抜粋）"
            code={`
  it "同じ注文のジョブを2回実行しても、ポイントとメールは1回分で、会員アプリの残高も同じ" do
    perform_enqueued_jobs do
      GrantPointsJob.perform_later(order.id)
      GrantPointsJob.perform_later(order.id)
    end

    expect(member.reload.points).to eq 1030
    expect(ActionMailer::Base.deliveries.map(&:subject)).to eq ["30ポイントを付与しました"]
    expect(member_app.requests).to eq ["PUT /members/#{member.id}/balance points=1030"] * 2
    expect(member_app.balances[member.id]).to eq 1030
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/point_grant_spec.rb spec/jobs --format documentation）"
            code={`
PointGrant
  同じ注文で2回呼んでも、付与は1回分で、2回目は1回目の記録を返す
  2つのワーカーが同時に実行したとき
    一意索引が2行目を拒み、付与は1回分になる

GrantPointsJob
  同じ注文のジョブを2回実行しても、ポイントとメールは1回分で、会員アプリの残高も同じ

PointMailJob
  送信済みの印があれば送らない
  送信に失敗したら印を戻すので、再試行で送れる

5 examples, 0 failures
`}
          />
        </>
      ),
    },
    {
      id: 'overuse',
      title: 'すべてのジョブを引数で「1回だけ」にしたとき',
      body: (
        <>
          <h3>ジョブのクラスと引数から鍵を作る仕組み</h3>
          <p>
            ポイントの二重付与の後で、「ジョブはすべて冪等にする」という方針を決め、ApplicationJob に共通の仕組みを入れたとします。ジョブのクラス名と引数からハッシュ値を作り、一意索引のある job_runs テーブルに記録してから実行し、記録が作れなければ実行済みとして飛ばします。
          </p>
          <Code
            lang="ruby"
            title="overuse/run_once.rb（当てはめすぎの例）"
            code={`
# 当てはめすぎの例：すべてのジョブを「クラスと引数が同じなら1回だけ実行する」ようにする
module RunOnce
  extend ActiveSupport::Concern

  included do
    around_perform do |job, block|
      digest = Digest::SHA256.hexdigest([job.class.name, job.serialize["arguments"]].to_json)
      JobRun.create!(digest:) # 同じクラスと引数の2回目は、一意索引が拒む
      block.call
    rescue ActiveRecord::RecordNotUnique
      Rails.logger.info("#{job.class.name} は実行済みなので飛ばす")
    end
  end
end
`}
          />
          <p>ApplicationJob に RunOnce を入れ、同じ会員の2件の注文（3,000円ずつ）を発送しました。会員アプリは1件目の要求に 503 を返して残高を更新しないようにしています。</p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/overuse.rb）"
            code={`
GrantPointsJob の実行を開始
GrantPointsJob の実行を開始
PointMailJob の実行を開始
SyncMemberAppJob の実行を開始
        失敗: Faraday::ServerError
PointMailJob の実行を開始
SyncMemberAppJob の実行を開始
        SyncMemberAppJob は実行済みなので飛ばす
SyncMemberAppJob の実行を開始
        SyncMemberAppJob は実行済みなので飛ばす
---
members.points: 1060  送ったメール: 2通
会員アプリが受けた要求: ["PUT /members/5/balance points=1060 → 503"]
会員アプリの残高: 0
`}
          />
          <p>DB の残高は1060になりましたが、会員アプリには一度も残高が届いていません。原因は2つあります。</p>
          <ul>
            <li>
              失敗した実行も「実行済み」として記録された：記録を作ってから実行するので、1回目が 503 で失敗しても記録は残り、Sidekiq の再試行は飛ばされました。記録を実行の後に作る順序に変えると、今度は実行と記録の間で止まったときに2回実行されるので、場面の問題に戻ります。
            </li>
            <li>
              別の操作を同じ操作と見なした：SyncMemberAppJob の引数は会員だけなので、2件目の注文の後の通知も1件目と同じ鍵になり、飛ばされました。このジョブは「その時点の残高を設定する」もともと冪等な操作で、何回実行しても害がないのに、仕組みを付けたことで必要な実行を捨てています。
            </li>
          </ul>
          <p>
            重複を見分ける鍵は、「何を1回にしたいのか」という業務の単位から決めます。この章では、ポイントの付与は注文1件につき1回、メールは付与の記録1件につき1回でした。ジョブの引数は、その単位と一致するとは限りません。また、すべてのジョブで記録の行を書き込むので、ジョブの数だけ書き込みが増え、job_runs は増え続けます。古い行を消す処理を足すと、消した後に届いた2回目は見分けられなくなるので、行をいつまで残すかも決める必要があります。<ChapterLink n={52} />の冪等性キーにも有効期限があり、期限を過ぎたキーは消す設計でした。
          </p>
          <h3>取り消してやり直したい操作も止まる</h3>
          <p>
            一意索引で「注文1件につき1回」にすると、正しいやり直しも同じ索引に拒まれます。たとえば、購入額を誤って登録した注文のポイントを付与し直したいとき、同じ注文の付与の記録はもう作れません。記録を消して付与し直すと、何が起きたかの履歴が残りません。
          </p>
          <p>
            このような訂正は、元の付与を2回目として扱うのではなく、別の操作として記録します。たとえば「注文1の付与の取り消し」を別の行（マイナスの付与）として作り、その鍵も「取り消しは付与1件につき1回」のように決めます。何を1回にするかを決めるときは、後から訂正する操作があるかどうかも合わせて考えておくと、索引を作り直さずに済みます。
          </p>
          <h3>判断の目安</h3>
          <p>2回目を見分ける仕組みを置くかどうかは、2回実行したときの害と、操作がもともと冪等かどうかで決めます。</p>
          <Figure n="81-7" title="2回目を見分ける仕組みを置くかどうかの判断" caption="上の行ほど、何もしなくてよい。仕組みを置くときは、鍵を業務の単位から決める。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>操作の例</th>
                    <th>2回実行したときの害</th>
                    <th>置くもの</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>集計を作り直して上書きする、残高を PUT で設定する、状態を「発送済み」にする</td>
                    <td>ない（もともと冪等）</td>
                    <td>何も置かない。上書きする値を実行の時点で読み直す</td>
                  </tr>
                  <tr>
                    <td>ログやアクセス数の記録</td>
                    <td>小さい（数が少しずれる）</td>
                    <td>多くの場合は何も置かない</td>
                  </tr>
                  <tr>
                    <td>ポイントの付与、在庫の引き当てなど DB の中の加算</td>
                    <td>大きい（お金や在庫がずれる）</td>
                    <td>業務の単位（注文 ID など）を鍵にした記録と一意索引。更新と同じトランザクションで作る</td>
                  </tr>
                  <tr>
                    <td>メール・プッシュ通知</td>
                    <td>中くらい（同じ知らせが2通届く）</td>
                    <td>送信済みの印。最大1回か少なくとも1回かを決める</td>
                  </tr>
                  <tr>
                    <td>外部の決済・ポイント交換など取り消しに手間がかかる要求</td>
                    <td>大きい（二重の請求）</td>
                    <td>
                      相手の API の冪等性キー（<ChapterLink n={52} />）か、相手の状態を問い合わせる手段
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <ul>
            <li>まず、操作を「設定する」形に書き直せないかを考えます。書き直せれば、記録も一意索引もいりません。</li>
            <li>記録を使うときは、鍵を業務の単位から決め、ジョブの引数やリクエストの内容から機械的に作らないようにします。</li>
            <li>1つのジョブに複数の副作用があるときは、ジョブを分けるほうが、1つのジョブの中で印を増やすより読みやすくなることが多いです。ただし、ジョブを分けすぎると、処理の流れを追うのにファイルをいくつも開くことになるので、副作用の数と再試行の扱いが違う所で分けます。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Active Job・Active Record の機能と、本書のほかの章',
      body: (
        <>
          <h3>再試行は perform を最初から繰り返す</h3>
          <p>
            Sidekiq の再試行は、既定で25回、(再試行の回数の4乗 + 15) 秒に揺らぎを足した間隔で行われます<Ref n={8} />。Active Job の <code>retry_on</code> は、指定がなければ3秒ずつ待って最初の実行を含めて5回まで実行します<Ref n={9} />。どちらも、失敗したジョブの perform を最初からもう一度呼ぶ仕組みで、途中まで済んだ処理を覚えておく仕組みは持っていません。再試行の回数や間隔を増やすほど、冪等でないジョブの副作用が繰り返される回数も増えます。再試行の設定は<ChapterLink n={18} section="retry" />と<ChapterLink n={54} />で、停止のときの再実行は<ChapterLink n={18} section="idempotency" />で扱いました。
          </p>
          <h3>一意索引を使う Active Record の機能</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>機能</th>
                  <th>動き</th>
                  <th>同時の実行</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>validates :x, uniqueness: true</code>
                  </td>
                  <td>保存の前に SELECT で同じ値を探す</td>
                  <td>防げない。Rails のコメントも一意索引を足すよう勧めている<Ref n={7} />（<ChapterLink n={14} section="uniqueness" />）</td>
                </tr>
                <tr>
                  <td>
                    <code>find_or_create_by</code>
                  </td>
                  <td>SELECT で探し、なければ作る</td>
                  <td>原子的ではない。一意索引がなければ2行できうる<Ref n={6} /></td>
                </tr>
                <tr>
                  <td>
                    <code>create_or_find_by</code>
                  </td>
                  <td>先に INSERT し、RecordNotUnique なら find_by! で探す</td>
                  <td>一意索引があれば防げる。この章の grant! と同じ考え方<Ref n={6} /></td>
                </tr>
                <tr>
                  <td>
                    <code>where(...).update_all(...)</code>
                  </td>
                  <td>条件に合う行を1つの UPDATE で更新し、行数を返す</td>
                  <td>条件に合う行を更新できるのは1回だけ（この章の mailed_at）<Ref n={12} /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>create_or_find_by</code> のコメントは、注意点として、対象の列に一意制約が必要なこと、同じ列に uniqueness のバリデーションを書くとバリデーションの失敗で止まって find_by に進まないこと、失敗した INSERT でも自動採番の番号が進むことを挙げています<Ref n={6} />。この章の <code>grant!</code> は、行を作るのと同じトランザクションで残高も足したかったので、<code>create_or_find_by!</code> を使わずに同じ形を書きました。
          </p>
          <h3>HTTP の要求と Webhook の重複</h3>
          <p>
            この章ではジョブの2回目を扱いました。自分たちの API が POST を受ける側で、クライアントの再送を見分けるには、<code>Idempotency-Key</code> ヘッダーで送られたキーと応答を保存して、同じキーの2回目に保存した応答を返します。このヘッダーは IETF で検討中の仕様（Internet-Draft）です<Ref n={4} />。キーの登録・内容の照合・処理中の 409 の実装と、決済代行の Webhook のイベントの重複排除は<ChapterLink n={52} section="rails-impl" />と<ChapterLink n={52} section="webhook" />で扱います。
          </p>
          <p>
            DB の変更と外部への通知の両方を確実に行いたいときは、通知の予定を同じトランザクションで DB に書き、別のプロセスが送る Transactional Outbox を使います（<ChapterLink n={53} />）。Outbox から送る側は少なくとも1回の配信になるので、受け手を冪等にすることと組み合わせて使います。
          </p>
          <Callout kind="v72">
            <p>
              この章の GrantPointsJob は、トランザクションの外で SyncMemberAppJob などを投入しています。トランザクションの中で <code>perform_later</code> を呼ぶ場合、Rails 7.2 では <code>load_defaults 7.2</code> と Sidekiq のアダプターの組み合わせで COMMIT の後に投入されていました<Ref n={13} />。Rails 8.1 では、ジョブのクラスに <code>self.enqueue_after_transaction_commit = true</code> を書かない限り、その場で投入されます<Ref n={14} />。COMMIT の前にジョブが動くと、まだ見えない行を探して失敗し、再試行で同じジョブがもう一度実行されます。詳しくは<ChapterLink n={18} section="transaction" />を見てください。
            </p>
          </Callout>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          2回目を見分ける仕組みは、2回実行したときの害がある副作用にだけ、業務の単位（注文1件につき1回の付与）を鍵にして置きます。まず、操作を「設定する」形に書き直せないかを考え、書き直せれば記録も一意索引も置きません。取り消せない副作用（メール）は最大1回と少なくとも1回のどちらにするかを決めます。
        </>
      ),
      benefit: {
        text: <>直す前は、会員アプリへの通知のタイムアウトで再試行され、ポイントが60、メールが2通、会員アプリの残高が60になった。直した後は、同じ条件でも残高は1030のままで、2回目に投入した付与のジョブは INSERT が一意索引に拒まれて ROLLBACK され、メールも送られなかった。</>,
        basis: <><ChapterLink n={83} section="scene" />、<ChapterLink n={83} section="apply" /></>,
      },
      cost: {
        text: <>付与の記録の表と order_id の一意索引、送信済みの印（mailed_at）を管理し、副作用ごとに分けたジョブを追う必要がある。一意索引で注文1件につき1回にすると、購入額を誤った注文のポイントを付与し直すような正しいやり直しも拒まれる。</>,
        basis: <><ChapterLink n={83} section="apply" />、<ChapterLink n={83} section="overuse" /></>,
      },
      alternative: {
        text: <>会員アプリへの通知は「30を足す」POST から「残高を設定する」PUT に変え、操作そのものを冪等にする。ジョブのクラスと引数から機械的に鍵を作る共通の仕組みを入れた例では、503 で失敗した実行が再試行されず、2件目の注文の通知も同じ鍵で捨てられて、会員アプリに残高が一度も届かなかった。</>,
        basis: <><ChapterLink n={83} section="apply" />、<ChapterLink n={83} section="overuse" /></>,
      },
      criterion: {
        text: <>2回実行したときに、ポイントやメールのような害が残るか。操作がもともと冪等か、設定する形に書き直せるか。何を1回にしたいかという業務の単位は何か。1つのジョブに再試行の扱いが違う副作用が複数あるか。</>,
        basis: <ChapterLink n={83} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>冪等性は、同じ操作を複数回実行しても、1回実行したときと結果（操作の後に残る状態）が変わらないようにする原則です。RFC 9110 は、同じ要求を複数回送ったときの意図した効果が1回と同じになるメソッドを冪等と定め、PUT・DELETE と安全なメソッドを冪等、POST を冪等でないとしています。</li>
          <li>Sidekiq や retry_on の再試行、デプロイの停止、二重の投入で、ジョブの perform は2回以上呼ばれます。付与・メール・通知を1つのジョブにまとめていたため、通知のタイムアウトでポイントが60、メールが2通、会員アプリの残高が60になりました。</li>
          <li>付与済みかを先に確かめるだけの書き方は、2つのワーカーが同時に実行すると2行を作りました。注文の ID に一意索引を付け、残高の更新と同じトランザクションで記録を作ると、2行目は RecordNotUnique で拒まれ、足した分も ROLLBACK で取り消されます。</li>
          <li>会員アプリへの通知は「30を足す」POST から「残高を設定する」PUT に変え、操作そのものを冪等にしました。メールは送信済みの印を先に付けて1回にしましたが、取り消せない副作用は厳密に1回にはできないので、最大1回と少なくとも1回のどちらにするかを決めます。</li>
          <li>副作用ごとにジョブを分けると、失敗したジョブだけが再試行され、2回目の見分け方もジョブごとに決められます。</li>
          <li>ジョブのクラスと引数から機械的に鍵を作って「1回だけ」にすると、失敗した実行が再試行されず、別の操作も捨てられました。鍵は業務の単位から決め、もともと冪等な操作には何も置きません。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'RFC 9110 HTTP Semantics（9.2.1 Safe Methods、9.2.2 Idempotent Methods、18.2 Method Registration）', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110.html', accessed: '2026-11-21', version: '2022年6月', note: '冪等の定義（同じ要求を複数回送ったときの意図した効果が1回と同じ）、PUT・DELETE・安全なメソッドが冪等であること、冪等性は利用者が求めた効果だけに関わり、サーバーがログなどを残してよいこと、応答を読む前に通信が失敗したときに送り直せること、応答は違ってよいこと、冪等でないメソッドを自動で送り直すべきでないこと。表7の安全・冪等の一覧。' },
    { title: 'RFC 5789 PATCH Method for HTTP', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc5789.html', accessed: '2026-11-21', version: '2010年3月', note: 'PATCH が安全でも冪等でもないこと、冪等になるように要求を出せること、If-Match による条件付きの要求。' },
    { title: 'Linear Associative Algebra', publisher: 'Benjamin Peirce / American Journal of Mathematics, Vol. 4（Internet Archive に置かれた JSTOR の Early Journal Content）', url: 'https://archive.org/details/jstor-2369153', accessed: '2026-11-21', version: '1881年（1870年にアメリカ科学アカデミーで読んだ論文）', note: '2乗以上にしても自分自身に戻る式を idempotent と呼ぶ定義（第25節、A^n = A）、生前は石版刷りで少部数を配ったこと。' },
    { title: 'The Idempotency-Key HTTP Header Field（draft-ietf-httpapi-idempotency-key-header-08）', publisher: 'IETF HTTPAPI Working Group', url: 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/', accessed: '2026-11-13', version: '第8版、2026年10月22日（Internet-Draft。RFC ではない）', note: 'Idempotency-Key ヘッダーの仕様が IETF で検討中の文書であること（第9部の Idempotency Key の章の出典を流用）。' },
    { title: 'MySQL 8.4 Reference Manual: 17.7.3 Locks Set by Different SQL Statements in InnoDB', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html', accessed: '2026-11-21', version: 'MySQL 8.4', note: '外部キーの条件を確かめる INSERT・UPDATE・DELETE が参照先の行に共有ロックを取ること、重複キーのエラーで重複した索引の行に共有ロックを取ること。デッドロックの実行結果は MySQL 8.4 で実測。' },
    { title: 'activerecord/lib/active_record/relation.rb（find_or_create_by・create_or_find_by）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb#L186-L310`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'find_or_create_by が SELECT の後に INSERT する原子的でない処理で、一意制約がなければ同じ行が2つ以上できうること。create_or_find_by が先に INSERT して RecordNotUnique なら find_by! で探すこと、一意制約が必要なこと、uniqueness のバリデーションを併用しないこと、自動採番が進むこと。' },
    { title: 'activerecord/lib/active_record/validations/uniqueness.rb（Concurrency and integrity）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/validations/uniqueness.rb#L228-L289`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'uniqueness のバリデーションはアプリケーションの側の確認なので競合に弱く、同時の保存で重複しうること、一意索引を足すのがよいこと。' },
    { title: 'sidekiq: lib/sidekiq/job_retry.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: `${SQ}/lib/sidekiq/job_retry.rb#L73-L247`, accessed: '2026-11-21', version: 'Sidekiq 8.1.7', note: '既定の再試行の回数 25、待ち時間 (count**4)+15、sidekiq_retry_in の値で待ち時間を変えられること、rand(10 * (count + 1)) の揺らぎを足すこと。' },
    { title: 'Active Job Basics（Retrying or Discarding Failed Jobs）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_job_basics.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'retry_on の既定が3秒待ちで5回であること。' },
    { title: 'activerecord/lib/active_record/persistence.rb（increment!）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L663-L682`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'increment! が update_counters を呼び、差分を足す UPDATE を発行すること。SQL（COALESCE(points, 0) + 30）は実行結果で確かめた。' },
    { title: 'Rails Routing from the Outside In（Resource Routing）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/routing.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'resources が GET を index・show に、POST を create に、PATCH/PUT を update に、DELETE を destroy に割り当てること。' },
    { title: 'activerecord/lib/active_record/relation.rb（update_all）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb#L574-L602`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'update_all が1つの UPDATE を発行し、コールバックとバリデーションを呼ばず、更新した行数を返すこと。' },
    { title: 'activejob/lib/active_job/enqueue_after_transaction_commit.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/activejob/lib/active_job/enqueue_after_transaction_commit.rb', accessed: '2026-11-11', version: 'Rails 7.2.4', note: ':always・:never・:default の分岐と、:default でアダプターの enqueue_after_transaction_commit? に従うこと（非同期処理の章の出典を流用）。' },
    { title: 'activejob/lib/active_job/enqueue_after_transaction_commit.rb・enqueuing.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/enqueue_after_transaction_commit.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'after_all_transactions_commit への投入の先送りと、クラス属性の既定値 false（非同期処理の章の出典を流用）。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/db/seeds.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/db/seeds.rb.tt#L1-L9`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'シードのコードを、どの環境でいつ実行してもよいように冪等にすること、find_or_create_by! の例。' },
    { title: 'MySQL 8.4 Reference Manual: 17.20.5 InnoDB Error Handling', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-error-handling.html', accessed: '2026-11-22', version: 'MySQL 8.4', note: '重複キーのエラーはその SQL の文だけを取り消すこと。トランザクションの中で例外を捕まえると、先に足した値が COMMIT されることは実行結果で確かめた。' },
  ],
}

export default chapter
