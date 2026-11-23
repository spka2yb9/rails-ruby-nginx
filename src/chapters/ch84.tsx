import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- タイムラインの図で使う、出来事の箱 ---------- */
function Ev({ cx, y, text, danger, acc, muted, w = 132 }: { cx: number; y: number; text: string; danger?: boolean; acc?: boolean; muted?: boolean; w?: number }) {
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

/* ---------- 図 65-1 ポイントの譲渡の構成と、問題が起きる箇所 ---------- */
const sceneSteps = [
  { y: 130, step: '① sender.update!（減らす）', table: 'members：佐藤', note: 'BEGIN → UPDATE → COMMIT', danger: false },
  { y: 196, step: '② receiver.update!（足す）', table: 'members：鈴木', note: '上限 100,000 を超えて RecordInvalid', danger: true },
  { y: 262, step: '③ PointTransfer.create!', table: 'point_transfers', note: '実行されない', danger: false },
]

function SceneFigure() {
  return (
    <Svg
      id="65-1"
      w={780}
      h={380}
      label="譲渡の画面から TransferPoints.call を呼ぶ。TransferPoints は、① 送る側の佐藤さんの members の行を update! で減らし、② 受け取る側の鈴木さんの行を update! で足し、③ point_transfers に譲渡の記録を作る。update! はそれぞれ別のトランザクションで COMMIT する。② で鈴木さんの残高が上限の 100,000 を超えて RecordInvalid になると、① は COMMIT 済みのまま残り、③ は実行されない"
    >
      <Box x={20} y={20} w={200} h={50} lines={['譲渡の画面', 'POST /point_transfers']} fs={12} bold subTone="muted" />
      <Box x={270} y={20} w={250} h={50} lines={['TransferPoints.call', 'sender・receiver・amount: 300']} fs={12} bold mono subTone="muted" />
      <Arrow x1={220} y1={45} x2={268} y2={45} />
      <rect x={250} y={100} width={290} height={210} rx={6} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <Arrow x1={395} y1={70} x2={395} y2={98} />
      {sceneSteps.map((s) => (
        <g key={s.step}>
          <Box x={266} y={s.y} w={258} h={40} lines={s.step} fs={12} mono />
          <Arrow x1={524} y1={s.y + 20} x2={588} y2={s.y + 20} />
          <Box x={590} y={s.y} w={170} h={40} lines={s.table} fs={12} fill="box4" />
          <T x={266} y={s.y + 54} fs={11} tone={s.danger ? 'danger' : 'muted'}>
            {s.note}
          </T>
        </g>
      ))}
      <T x={20} y={150} fs={12} tone="danger">
        ① は COMMIT 済み
      </T>
      <T x={20} y={216} fs={12} tone="danger">
        ② で例外
      </T>
      <T x={20} y={282} fs={12} tone="muted">
        ③ は呼ばれない
      </T>
      <T x={20} y={340} fs={12} tone="danger">
        佐藤さんの300ポイントだけが減り、鈴木さんには届かず、記録も残らない
      </T>
      <T x={20} y={364} fs={11} tone="muted">
        緑の箱は MySQL のテーブルの行。update! と create! は、それぞれが自分のトランザクションで COMMIT する
      </T>
    </Svg>
  )
}

/* ---------- 図 65-2 途中で失敗したときのデータ ---------- */
const dataCols = [
  { x: 300, name: '佐藤の points' },
  { x: 440, name: '鈴木の points' },
  { x: 580, name: 'point_transfers' },
  { x: 710, name: '合計' },
]
const dataRows = [
  { y: 70, label: '譲る前', vals: ['1,000', '99,900', '0件', '100,900'], danger: [false, false, false, false] },
  { y: 120, label: '① UPDATE・COMMIT', vals: ['700', '99,900', '0件', '100,600'], danger: [true, false, false, true] },
  { y: 170, label: '② RecordInvalid', vals: ['700', '99,900', '0件', '100,600'], danger: [true, false, false, true] },
  { y: 220, label: '例外の後の DB', vals: ['700', '99,900', '0件', '100,600'], danger: [true, false, false, true] },
]

function FailDataFigure() {
  return (
    <Svg
      id="65-2"
      w={780}
      h={330}
      label="上から時間の順に、佐藤さんの points、鈴木さんの points、point_transfers の件数、ポイントの合計を並べた。譲る前は 1,000、99,900、0件、合計 100,900。① の UPDATE が COMMIT された後は 700、99,900、0件、合計 100,600。② で RecordInvalid になった後も、例外の後の DB も同じ値のままで、合計から300ポイントが消えている。メモリーの上の sender.points は 700、receiver.points は 100,200 のまま"
    >
      {dataCols.map((c) => (
        <g key={c.name}>
          <Box x={c.x - 62} y={20} w={124} h={32} lines={c.name} fs={12} bold fill="box4" mono={c.name !== '合計'} />
          <line x1={c.x} y1={52} x2={c.x} y2={256} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {dataRows.map((r) => (
        <g key={r.label}>
          <T x={20} y={r.y + 14} fs={12}>
            {r.label}
          </T>
          {r.vals.map((v, i) => (
            <Ev key={i} cx={dataCols[i].x} y={r.y} text={v} danger={r.danger[i]} w={112} />
          ))}
        </g>
      ))}
      <T x={20} y={282} fs={12} tone="danger">
        ① は COMMIT 済みなので、② の例外では取り消されない。合計から300ポイントが消えた
      </T>
      <T x={20} y={306} fs={11} tone="muted">
        script/scene.rb transfer_points の実行結果から作成。メモリーの上の値は sender.points = 700、receiver.points = 100,200
      </T>
    </Svg>
  )
}

/* ---------- 図 65-4 直す前と直した後のトランザクションの範囲 ---------- */
function CompareFigure() {
  const steps = ['① 佐藤を減らす', '② 鈴木に足す', '③ 記録を作る']
  return (
    <Svg
      id="65-4"
      w={780}
      h={340}
      label="左は直す前。①②③ がそれぞれ別のトランザクションで、① の COMMIT の後に ② が失敗すると、① だけが残る。右は直した後。ActiveRecord::Base.transaction の BEGIN と COMMIT の間に、2人の行の SELECT … FOR UPDATE と ①②③ を入れる。② が失敗すると ROLLBACK で ① も取り消され、DB は譲る前の状態に戻る"
    >
      <T x={10} y={14} bold>
        直す前：書き込みごとのトランザクション
      </T>
      <T x={400} y={14} bold>
        直した後：1つのトランザクション
      </T>
      <line x1={385} y1={6} x2={385} y2={286} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {steps.map((s, i) => (
        <g key={s}>
          <rect x={20} y={36 + i * 76} width={340} height={60} rx={6} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
          <T x={30} y={52 + i * 76} fs={10} tone="muted">
            BEGIN
          </T>
          <Box x={80} y={50 + i * 76} w={190} h={32} lines={s} fs={12} fill={i === 1 ? 'bg' : 'box'} />
          <T x={280} y={70 + i * 76} fs={10} tone={i < 2 ? 'danger' : 'muted'}>
            {i === 0 ? 'COMMIT 済み' : i === 1 ? 'RecordInvalid' : '実行されない'}
          </T>
        </g>
      ))}
      <rect x={410} y={36} width={350} height={226} rx={6} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={422} y={54} fs={11} tone="acc" mono>
        BEGIN（ActiveRecord::Base.transaction）
      </T>
      <Box x={430} y={66} w={310} h={32} lines="2人の行を id の順に SELECT … FOR UPDATE" fs={11} fill="box5" />
      {steps.map((s, i) => (
        <Box key={s} x={480} y={110 + i * 44} w={210} h={32} lines={s} fs={12} />
      ))}
      <T x={422} y={250} fs={11} tone="acc" mono>
        COMMIT ／ 例外なら ROLLBACK
      </T>
      <T x={20} y={308} fs={12} tone="danger">
        ① だけが残り、300ポイントが消える
      </T>
      <T x={400} y={308} fs={12} tone="acc">
        ② で例外なら ① も取り消され、譲る前に戻る
      </T>
      <T x={400} y={328} fs={11} tone="muted">
        太い枠の中の SQL は、例外が出るとすべて取り消される
      </T>
    </Svg>
  )
}

/* ---------- 図 65-5 外部 API を含む処理で、原子性を保てない範囲 ---------- */
const exCols = [
  { x: 150, name: '交換の処理' },
  { x: 330, name: 'MySQL' },
  { x: 510, name: '提携先の API' },
  { x: 680, name: '譲渡の処理' },
]

function ExternalFigure() {
  const rows: { t: string; y: number; col: number; text: string; danger?: boolean; acc?: boolean; muted?: boolean; w?: number }[] = [
    { t: '0.00秒', y: 76, col: 1, text: 'BEGIN・行をロック' },
    { t: '0.01秒', y: 112, col: 1, text: '佐藤 10,000 → 8,000' },
    { t: '0.01秒', y: 148, col: 2, text: 'マイル +1,000', danger: true },
    { t: '0.21秒', y: 184, col: 3, text: 'ロックを待つ', muted: true },
    { t: '1.03秒', y: 220, col: 0, text: 'タイムアウト', danger: true },
    { t: '1.03秒', y: 256, col: 1, text: 'ROLLBACK：10,000 に戻る', w: 150 },
    { t: '1.03秒', y: 292, col: 3, text: '待ちが終わり、譲渡' },
  ]
  return (
    <Svg
      id="65-5"
      w={780}
      h={430}
      label="縦に時間、列に交換の処理・MySQL・提携先の API・譲渡の処理を並べたタイムライン。交換の処理は BEGIN で佐藤さんの行をロックし、ポイントを 10,000 から 8,000 に減らしてから、提携先の API にマイルの加算を頼む。提携先はマイルを 1,000 足したが、応答が遅れ、1秒でタイムアウトした。0.21秒に始まった譲渡の処理は、佐藤さんの行のロックを待つ。タイムアウトの例外で ROLLBACK し、佐藤さんのポイントは 10,000 に戻ったが、提携先のマイルは足されたまま残る。トランザクションが取り消せるのは MySQL の列の中だけで、提携先の API は範囲の外にある"
    >
      <rect x={248} y={60} width={164} height={274} rx={6} fill="var(--fig-box5)" opacity={0.35} stroke="var(--fig-accent)" strokeDasharray="5 4" />
      {exCols.map((c) => (
        <g key={c.name}>
          <Box x={c.x - 70} y={16} w={140} h={32} lines={c.name} fs={12} bold fill={c.x === 330 || c.x === 510 ? 'box4' : 'box'} />
          <line x1={c.x} y1={48} x2={c.x} y2={334} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <Arrow x1={150} y1={90} x2={262} y2={90} />
      <Arrow x1={150} y1={126} x2={262} y2={126} />
      <Arrow x1={150} y1={162} x2={442} y2={162} />
      <Arrow x1={150} y1={270} x2={262} y2={270} />
      {rows.map((r, i) => (
        <g key={i}>
          <T x={12} y={r.y + 14} fs={11} tone="muted">
            {r.t}
          </T>
          <Ev cx={exCols[r.col].x} y={r.y} text={r.text} danger={r.danger} acc={r.acc} muted={r.muted} w={r.w} />
        </g>
      ))}
      <Arrow x1={680} y1={212} x2={680} y2={290} dashed />
      <T x={330} y={352} anchor="middle" fs={11} tone="acc">
        ROLLBACK で取り消せる範囲
      </T>
      <T x={530} y={352} anchor="middle" fs={11} tone="danger">
        範囲の外：取り消されない
      </T>
      <T x={12} y={384} fs={12} tone="danger">
        DB のポイントは戻ったのに、提携先のマイルは足されたまま。譲渡の処理は、API を待つ間ずっとロックを待った
      </T>
      <T x={12} y={410} fs={11} tone="muted">
        script/exchange.rb before の実行結果から作成。提携先は要求を受けてマイルを足し、2秒後に応答した（交換の処理は1秒でタイムアウト）
      </T>
    </Svg>
  )
}

/* ---------- 図 65-6 交換を受付と依頼に分けたときの状態の流れ ---------- */
function FixFlowFigure() {
  return (
    <Svg
      id="65-6"
      w={780}
      h={380}
      label="直した後の交換の流れ。1つ目のトランザクションで、佐藤さんのポイントを減らし、point_exchanges に pending の行を作って COMMIT する。COMMIT の後に ExchangeMilesJob を投入する。ジョブは、交換の id から作った Idempotency-Key を付けて提携先に POST する。200 なら completed にする。タイムアウトなら Sidekiq が再試行し、同じキーで送り直すので、提携先は1回分だけ足す。4xx で断られたら、補償のトランザクションでポイントを戻し、canceled にする"
    >
      <rect x={20} y={20} width={230} height={120} rx={6} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={32} y={38} fs={11} tone="acc" mono>
        トランザクション1
      </T>
      <Box x={34} y={50} w={202} h={34} lines="ポイントを 2,000 減らす" fs={12} />
      <Box x={34} y={94} w={202} h={34} lines="交換の行を pending で作る" fs={12} fill="box5" />
      <Arrow x1={250} y1={80} x2={318} y2={80} />
      <T x={256} y={68} fs={10} tone="muted">
        COMMIT の後
      </T>
      <Box x={320} y={56} w={200} h={48} lines={['ExchangeMilesJob', 'pending のときだけ依頼する']} fs={12} bold mono subTone="muted" />
      <Arrow x1={520} y1={80} x2={588} y2={80} />
      <Box x={590} y={56} w={170} h={48} lines={['提携先の API', 'Idempotency-Key 付き']} fs={12} fill="box4" subTone="muted" />
      <Arrow d="M675 104 V150 H420 V106" dashed accent />
      <T x={430} y={168} fs={11} tone="acc">
        タイムアウト：同じキーで再試行
      </T>
      <T x={430} y={184} fs={11} tone="acc">
        （提携先は1回分だけ足す）
      </T>
      <Arrow x1={675} y1={104} x2={675} y2={222} />
      <T x={684} y={200} fs={11}>
        200
      </T>
      <Box x={600} y={224} w={150} h={40} lines="completed" fs={12} fill="box5" mono />
      <Arrow d="M760 92 H772 V314 H335 V298" />
      <T x={480} y={308} fs={11} tone="danger">
        4xx（断られた）
      </T>
      <rect x={210} y={206} width={250} height={90} rx={6} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={222} y={224} fs={11} tone="acc" mono>
        補償のトランザクション（cancel!）
      </T>
      <Box x={224} y={236} w={222} h={24} lines="ポイントを 2,000 戻す" fs={11} rx={3} />
      <Box x={224} y={264} w={222} h={24} lines="交換の行を canceled にする" fs={11} rx={3} fill="box5" />
      <T x={20} y={340} fs={12} tone="acc">
        DB の変更はトランザクションで原子的にし、外部への依頼は状態・冪等性キー・取り消しの処理で、最後に DB と提携先をそろえる
      </T>
      <T x={20} y={364} fs={11} tone="muted">
        色の付いた箱は point_exchanges の status に関わる書き込み。pending の間は、減らしたポイントが「交換の手続き中」として残る
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 84,
  part: 8,
  title: 'Atomicity（原子性）：ポイントの譲渡を全部成功か全部失敗にする',
  summary:
    '会員から会員へポイントを譲る処理で、送る側から減らした後に受け取る側の更新が失敗し、300ポイントが消える場面から始めます。Haerder と Reuter の ACID の定義と MySQL の説明を確かめ、3つの書き込みを1つのトランザクションにまとめ、同時の譲渡に備えて行をロックします。続けて、提携先の API を呼ぶポイントの交換では、トランザクションで原子性を保てない範囲を実行結果で示し、受付・依頼・取り消しに分けて直します。最後に、全会員のボーナスを1つのトランザクションにしたときの問題を扱います。',
  goals: [
    '書き込みごとに COMMIT される処理が途中で失敗すると、データが中途半端な状態で残る理由を説明できる',
    'ACID の原子性の定義（全部か無か、利用者がどちらの状態かを知れる）と、一貫性・分離性・持続性との違いを説明できる',
    'ActiveRecord::Base.transaction で一連の書き込みをまとめ、ROLLBACK の後もメモリーの上のオブジェクトは戻らないことに注意して書ける',
    '外部の API を含む処理では DB のトランザクションが API の効果を取り消せないことを示し、受付の状態・冪等性キー・補償の処理に分けて設計できる',
    '大きすぎるトランザクションでロックの待ちと全体のやり直しが起きることを確かめ、業務の単位でトランザクションを区切れる',
  ],
  prerequisites: [15, 38, 83],
  sections: [
    {
      id: 'scene',
      title: 'ポイントの譲渡で、送った側だけが減る',
      body: (
        <>
          <p>
            この章では、会員どうしのポイントの譲渡を例に、<Term en="Atomicity">原子性</Term>を扱います。原子性は、一連の処理を「すべて成功するか、すべて失敗するか」の単位として扱い、途中までしか済んでいない状態を残さないようにするという原則です。まず、原子性のない譲渡を動かし、途中で失敗したときに残るデータを確かめます。
          </p>
          <h3>そもそも何をする処理か</h3>
          <p>
            通販サイトでは、家族の会員にポイントを譲ることができます。佐藤さんが鈴木さんに300ポイントを譲ると、佐藤さんの残高から300を引き、鈴木さんの残高に300を足し、いつ誰から誰へ何ポイントを譲ったかを記録に残します。1人が持てるポイントには上限（100,000ポイント）があり、上限を超える譲渡はできません。
          </p>
          <p>
            譲渡の前後で、2人のポイントの合計は変わらないはずです。引くことと足すことは、片方だけが起きてはいけない組み合わせです。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000001_create_members_and_point_transfers.rb"
            code={`
class CreateMembersAndPointTransfers < ActiveRecord::Migration[8.1]
  def change
    create_table :members do |t|
      t.string :name, null: false
      t.integer :points, null: false, default: 0
    end
    create_table :point_transfers do |t|
      t.references :sender, null: false, foreign_key: { to_table: :members }
      t.references :receiver, null: false, foreign_key: { to_table: :members }
      t.integer :amount, null: false
      t.timestamps
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/member.rb"
            code={`
class Member < ApplicationRecord
  MAX_POINTS = 100_000 # 1人が持てるポイントの上限

  validates :points, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: MAX_POINTS }
end
`}
          />
          <h3>3つの書き込みを順に行うコード</h3>
          <p>直す前の TransferPoints は、送る側を減らす・受け取る側に足す・記録を残す、の3つを順に <code>update!</code> と <code>create!</code> で行います。</p>
          <Code
            lang="ruby"
            title="app/services/transfer_points.rb（直す前）"
            code={`
# 会員から会員へポイントを譲る（直す前）
class TransferPoints
  def self.call(sender:, receiver:, amount:)
    sender.update!(points: sender.points - amount)     # ① 送る側から減らす
    receiver.update!(points: receiver.points + amount) # ② 受け取る側に足す
    PointTransfer.create!(sender:, receiver:, amount:) # ③ 譲渡の記録を残す
  end
end
`}
          />
          <p>
            ここで使う<Term en="transaction">トランザクション</Term>は、複数の SQL の書き込みを1つにまとめる DB の仕組みです。BEGIN で始め、COMMIT で書き込みを確定し、ROLLBACK で BEGIN の後の書き込みをすべて取り消します。COMMIT するまでの書き込みは、ほかの接続からは見えません。
          </p>
          <p>
            Active Record の <code>save</code> と <code>destroy</code> は、それぞれが自動でトランザクションに包まれます<Ref n={4} />。そのため、① の <code>update!</code> は ① だけのトランザクションで COMMIT され、② の <code>update!</code> はまた別のトランザクションになります。この処理の構成と問題が起きる箇所を図 65-1 に示します。
          </p>
          <Figure n="65-1" title="ポイントの譲渡の構成と、問題が起きる箇所" caption="赤い文字は、次の項で確かめる問題。">
            <SceneFigure />
          </Figure>
          <h3>受け取る側が上限を超えるときの実行結果</h3>
          <p>佐藤さん（1,000ポイント）から、上限に近い鈴木さん（99,900ポイント）へ300ポイントを譲りました。発行された SQL のうち、BEGIN・COMMIT・ROLLBACK・UPDATE・INSERT を表示しています。</p>
          <Code
            lang="ruby"
            title="script/scene.rb（抜粋）"
            code={`
sato = Member.create!(name: "佐藤", points: 1_000)
suzuki = Member.create!(name: "鈴木", points: 99_900)
total = Member.sum(:points)
# …（省略：SQL を表示する）
begin
  TransferPoints.call(sender: sato, receiver: suzuki, amount: 300)
rescue => e
  puts "例外: #{e.class}: #{e.message}"
end
puts "例外の後のメモリーの値: sato.points = #{sato.points}、suzuki.points = #{suzuki.points}"
# …（省略）
puts "DB の値: 佐藤 #{sato.reload.points}、鈴木 #{suzuki.reload.points}、譲渡の記録 #{PointTransfer.count}件"
puts "ポイントの合計: 譲る前 #{total} → 後 #{Member.sum(:points)}"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene.rb transfer_points）"
            code={`
  BEGIN
  UPDATE members SET members.points = 700 WHERE members.id = 1
  COMMIT
例外: ActiveRecord::RecordInvalid: Validation failed: Points must be less than or equal to 100000
例外の後のメモリーの値: sato.points = 700、suzuki.points = 100200
---
DB の値: 佐藤 700、鈴木 99900、譲渡の記録 0件
ポイントの合計: 譲る前 100900 → 後 100600
`}
          />
          <p>
            ① の UPDATE は COMMIT されました。② では鈴木さんの残高が100,200になって上限を超えたので、バリデーションが失敗し、SQL を発行する前に RecordInvalid になりました。③ は実行されていません。DB には、佐藤さんだけが300ポイント減った状態が残り、2人の合計から300ポイントが消えています。譲渡の記録もないので、後から調べても、なぜ佐藤さんの残高が減ったのかが分かりません。DB の値を時間の順に並べたのが図 65-2 です。
          </p>
          <Figure n="65-2" title="途中で失敗したときのデータ" caption="上から時間の順。赤い枠が、譲渡として正しくない値。">
            <FailDataFigure />
          </Figure>
          <h3>例外のほかにも、処理は途中で止まる</h3>
          <p>途中で止まる原因はバリデーションの失敗だけではありません。</p>
          <ul>
            <li>② の UPDATE がデッドロックやロックの待ちのタイムアウトで失敗する。</li>
            <li>① と ② の間で、デプロイのために Puma や Sidekiq のプロセスが止められる。</li>
            <li>DB との接続が切れる、サーバーのメモリーが足りずにプロセスが強制終了される。</li>
          </ul>
          <p>どの場合も、書き込みごとに COMMIT していると、止まった所までの書き込みが残ります。例外を捕まえて ① を元に戻すコードを書いても、プロセスが止まった場合にはそのコードは実行されません。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '一連の処理を、全部成功か全部失敗かの単位にする',
      body: (
        <>
          <h3>原則の定義</h3>
          <p>
            原子性は、一連の処理をすべて成功するかすべて失敗するかの単位として扱い、中途半端な状態が残らないようにするという原則です。「原子」は、それ以上分けられないものという意味で使われています。外から見ると、譲渡は「佐藤さんが減り、鈴木さんが増え、記録が残った」か「何も起きなかった」かのどちらかで、その間の状態は見えないようにします。
          </p>
          <h3>ACID の A としての由来</h3>
          <p>
            原子性は、データベースのトランザクションが持つべき4つの性質 ACID の1つとして知られています。Theo Haerder と Andreas Reuter の論文「Principles of Transaction-Oriented Database Recovery」（ACM Computing Surveys、1983年）は、トランザクションを分けられないものにするには atomicity・consistency・isolation・durability の4つの性質が必要だとし、頭文字を取って ACID と書いています。論文は原子性を次のように定めています<Ref n={1} />。
          </p>
          <ul>
            <li>トランザクションは、全部か無か（all-or-nothing）のどちらかでなければならない。</li>
            <li>何が起きても、利用者は自分がどちらの状態にいるかを知れなければならない。</li>
          </ul>
          <p>
            2つ目の条件も、場面の譲渡では満たせていませんでした。例外が起きた後、利用者にも運用の担当者にも、佐藤さんの300ポイントがどうなったのかが分からなかったからです。記録が残っていないので、譲渡が済んだのか、済んでいないのかを判断する材料がありません。
          </p>
          <p>
            同じ論文は、COMMIT した結果はその後の障害でも失われてはならず（持続性）、誤ったトランザクションの効果を取り除くには、それを打ち消す別のトランザクションを実行するしかないとも書いています<Ref n={1} />。この「打ち消すトランザクション」は、後の節で外部の API を扱うときに使います。
          </p>
          <h3>ACID の4つの性質と、MySQL と Rails の仕組み</h3>
          <p>
            MySQL のマニュアルは、ACID の原子性に関わる InnoDB の仕組みとして、トランザクションと、autocommit の設定・COMMIT 文・ROLLBACK 文を挙げています<Ref n={2} />。autocommit は、明示的に BEGIN を書かなければ、SQL の文を1つ実行するたびに COMMIT する設定で、MySQL の接続では既定で有効です<Ref n={3} />。
          </p>
          <Figure n="65-3" title="ACID の4つの性質と、MySQL・Rails の仕組み・本書の章" caption="性質の説明は Haerder・Reuter（1983）、仕組みは MySQL 8.4 のマニュアルによる。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>性質</th>
                    <th>何を保証するか</th>
                    <th>MySQL と Rails の仕組み</th>
                    <th>本書の章</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>原子性（Atomicity）</td>
                    <td>全部か無か。利用者はどちらの状態かを知れる</td>
                    <td>BEGIN・COMMIT・ROLLBACK、ActiveRecord::Base.transaction</td>
                    <td>この章、<ChapterLink n={15} section="transaction" /></td>
                  </tr>
                  <tr>
                    <td>一貫性（Consistency）</td>
                    <td>正常に終わったトランザクションは、正しい結果だけを COMMIT する</td>
                    <td>アプリの規則は NOT NULL・外部キー・一意索引などの制約とバリデーションで守る。MySQL のマニュアルは、障害からデータを守る doublewrite buffer とクラッシュからの回復を挙げている</td>
                    <td>
                      <ChapterLink n={81} />
                    </td>
                  </tr>
                  <tr>
                    <td>分離性（Isolation）</td>
                    <td>実行中のトランザクションの途中の状態を、ほかのトランザクションから隠す</td>
                    <td>分離レベル、行のロック（FOR UPDATE）、MVCC</td>
                    <td>
                      <ChapterLink n={38} section="isolation" />
                    </td>
                  </tr>
                  <tr>
                    <td>持続性（Durability）</td>
                    <td>COMMIT した結果は、その後の障害でも失われない</td>
                    <td>innodb_flush_log_at_trx_commit・sync_binlog などの設定と、ストレージ・電源・バックアップ</td>
                    <td>（本書では扱わない）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 65-3 の性質のうち、どれがどの問題を防ぐかは区別しておきます。原子性は、1つの処理が途中で止まったときの問題を防ぎます。2つの処理が同時に動いたときに、一方の書き込みが他方に上書きされる問題は分離性の範囲で、トランザクションに入れただけでは防げません。この違いは、次の節の実行結果で確かめます。
          </p>
          <h3>似た原則との違い</h3>
          <ul>
            <li>
              冪等性（<ChapterLink n={83} />）：原子性は1回の実行が途中で止まったときの話、冪等性は同じ実行が2回目に来たときの話です。原子性が保たれていれば、止まった処理は「何も起きなかった」状態に戻るので、もう一度実行してよいと判断しやすくなります。
            </li>
            <li>
              Unit of Work（<ChapterLink n={48} />）：1つの業務の操作で変更したオブジェクトをまとめて保存する設計パターンです。まとめて保存するときに、1つのトランザクションを使って原子性を得ます。
            </li>
            <li>
              Fail Fast（<ChapterLink n={79} />）：不正な入力を早く見つけて止める原則です。早く止めても、止まる前に書き込んだ分は残るので、書き込みを伴う処理では原子性と組み合わせます。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: '3つの書き込みを1つのトランザクションにまとめる',
      body: (
        <>
          <h3>直す順序</h3>
          <ol>
            <li>一緒に成功・失敗しなければならない書き込みを書き出す（ここでは、送る側を減らす・受け取る側に足す・記録を残すの3つ）</li>
            <li>3つの書き込みを1つのトランザクションに入れ、途中の例外で全体が ROLLBACK されることを確かめる</li>
            <li>同時に2件の譲渡が来た場合を動かし、トランザクションだけでは防げない問題を、行のロックで直す</li>
            <li>RSpec で、途中の失敗と同時の譲渡を確かめる</li>
          </ol>
          <h3>手順2：3つの書き込みを1つのトランザクションに入れる</h3>
          <p>
            <code>ActiveRecord::Base.transaction</code> のブロックの中で実行した SQL は、ブロックが正常に終われば COMMIT され、例外が出れば ROLLBACK されます。例外はブロックの外へそのまま伝わります<Ref n={4} />。Rails のソースのコメントも、トランザクションの典型的な例として、2つの口座の間の振替を挙げています<Ref n={4} />。<code>Member.transaction</code> と書いても、同じ DB の接続を使うモデルなら同じトランザクションになります。この章では、特定のモデルの処理ではないことを示すために <code>ActiveRecord::Base.transaction</code> と書いています。
          </p>
          <Code
            lang="ruby"
            title="app/services/transfer_points.rb（手順2）"
            code={`
# 手順2：3つの書き込みを1つのトランザクションに入れる
class TransferPoints
  def self.call(sender:, receiver:, amount:)
    ActiveRecord::Base.transaction do
      sender.update!(points: sender.points - amount)     # ① 送る側から減らす
      receiver.update!(points: receiver.points + amount) # ② 受け取る側に足す
      PointTransfer.create!(sender:, receiver:, amount:) # ③ 譲渡の記録を残す
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene.rb transfer_points_step1）"
            code={`
  BEGIN
  UPDATE members SET members.points = 700 WHERE members.id = 1
  ROLLBACK
例外: ActiveRecord::RecordInvalid: Validation failed: Points must be less than or equal to 100000
例外の後のメモリーの値: sato.points = 700、suzuki.points = 100200
---
DB の値: 佐藤 1000、鈴木 99900、譲渡の記録 0件
ポイントの合計: 譲る前 100900 → 後 100900
`}
          />
          <p>
            ① の UPDATE は実行されましたが、② の例外でトランザクション全体が ROLLBACK され、DB の佐藤さんの残高は1,000に戻りました。合計も変わっていません。例外は呼び出し側に伝わるので、画面には「譲渡できませんでした」と表示でき、利用者は譲渡が行われなかったことを知れます。
          </p>
          <Callout kind="warn" title="ROLLBACK してもメモリーの上のオブジェクトは戻らない">
            <p>
              実行結果の「例外の後のメモリーの値」は、sato.points = 700 のままです。ROLLBACK で戻るのは DB の行だけで、Ruby のオブジェクトの属性は戻りません。Rails のソースのコメントも、オブジェクトのインスタンスのデータはトランザクションの前の状態に戻らないと注意しています<Ref n={4} />。例外の後に同じオブジェクトを使って画面を表示したり、もう一度譲渡したりすると、DB にない値を使うことになります。例外の後は <code>reload</code> で読み直すか、次の手順のように、トランザクションの中で読み直したオブジェクトだけを書き換えます。
            </p>
          </Callout>
          <h3>手順3：同時の譲渡に備えて、行をロックしてから計算する</h3>
          <p>
            手順2のコードは、メソッドに渡された <code>sender</code> が持つ値（画面を開いたときに読んだ値）から引き算しています。佐藤さん（1,000ポイント）が、鈴木さんと田中さん（500ポイントずつ）へ600ポイントずつを、2つの画面から同時に譲ったとします。2つのスレッドで、どちらも佐藤さんを読み込んでから譲渡を始め、要求A の1つ目の UPDATE の後に1秒待つようにして動かしました。
          </p>
          <Code
            lang="text"
            title="実行結果（手順2のコード、bin/rails runner script/race.rb transfer_points_step1）"
            code={`
0.02秒 要求A: BEGIN
0.02秒 要求A: UPDATE members SET members.points = 400 WHERE members.id =…
0.12秒 要求B: BEGIN
1.02秒 要求A: UPDATE members SET members.points = 1100 WHERE members.id …
1.05秒 要求A: COMMIT
1.05秒 要求B: UPDATE members SET members.points = 400 WHERE members.id =…
要求A: 譲渡に成功
1.05秒 要求B: UPDATE members SET members.points = 1100 WHERE members.id …
1.06秒 要求B: COMMIT
要求B: 譲渡に成功
---
佐藤 400、鈴木 1100、田中 1100、合計 2600（譲る前は 2000）
`}
          />
          <p>
            要求B の UPDATE は、要求A が佐藤さんの行に持っていたロックが外れるまで待ちました（表示の時刻は SQL が終わった時刻）。それでも、要求B は自分が先に読んだ1,000から600を引いた400を書いたので、要求A の書き込みを上書きしています。佐藤さんは1,200ポイントを譲ったのに400ポイント残り、合計は600増えました。どちらのトランザクションも原子的に COMMIT されていますが、同時に動いた2つの処理の間の問題は、原子性では防げません。これは ACID の分離性の範囲で、<ChapterLink n={38} section="lost-update-fix" />で扱った「更新の消失」です。
          </p>
          <p>そこで、トランザクションの中で2人の行を <code>SELECT … FOR UPDATE</code> でロックし、ロックした後に読んだ値で計算するように直しました。Active Record の <code>lock</code> は、選んだ行に排他ロックを取る FOR UPDATE を付けた SELECT を発行します<Ref n={8} />。ロックされた行をほかのトランザクションが FOR UPDATE で読もうとすると、COMMIT か ROLLBACK まで待ちます<Ref n={7} />。ロックは id の順に取ります。こうしておけば、2つの譲渡が逆向き（佐藤→鈴木と鈴木→佐藤）に同時に来ても、互いを待ち続ける形になりません。</p>
          <Code
            lang="ruby"
            title="app/services/transfer_points.rb（直した後）"
            code={`
# 会員から会員へポイントを譲る（直した後）
class TransferPoints
  def self.call(sender:, receiver:, amount:)
    ActiveRecord::Base.transaction do
      # 2人の行を id の順にロックし、ロックした後の値で計算する（順序をそろえてデッドロックを避ける）
      locked = Member.lock.where(id: [sender.id, receiver.id]).order(:id).index_by(&:id)
      from, to = locked.values_at(sender.id, receiver.id)
      from.update!(points: from.points - amount)                 # ① 送る側から減らす
      to.update!(points: to.points + amount)                     # ② 受け取る側に足す
      PointTransfer.create!(sender: from, receiver: to, amount:) # ③ 譲渡の記録を残す
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（直した後のコード、bin/rails runner script/race.rb）"
            code={`
0.02秒 要求A: BEGIN
0.02秒 要求A: SELECT members.* FROM members WHERE members.id IN (1, 2) ORDER BY members.id ASC FOR UPDATE
0.02秒 要求A: UPDATE members SET members.points = 400 WHERE members.id =…
0.12秒 要求B: BEGIN
1.02秒 要求A: UPDATE members SET members.points = 1100 WHERE members.id …
1.04秒 要求A: COMMIT
要求A: 譲渡に成功
1.04秒 要求B: SELECT members.* FROM members WHERE members.id IN (1, 3) ORDER BY members.id ASC FOR UPDATE
1.04秒 要求B: ROLLBACK
要求B: ActiveRecord::RecordInvalid: Validation failed: Points must be greater than or equal to 0
---
佐藤 400、鈴木 1100、田中 500、合計 2000（譲る前は 2000）
`}
          />
          <p>
            要求B の <code>SELECT … FOR UPDATE</code> は、要求A の COMMIT まで待ち、COMMIT された後の佐藤さんの残高（400）を読みました。400から600は引けないのでバリデーションが失敗し、要求B は ROLLBACK されました。合計は2,000のままです。また、メソッドに渡された <code>sender</code> や <code>receiver</code> を書き換えないので、手順2の注意で見た「メモリーの上の値が DB と違う」状態も呼び出し側に残りません。直す前と直した後のトランザクションの範囲を図 65-4 で比べます。
          </p>
          <Figure n="65-4" title="直す前と直した後のトランザクションの範囲" caption="左は書き込みごとに COMMIT する。右は2人の行のロックと3つの書き込みを1つのトランザクションに入れた。">
            <CompareFigure />
          </Figure>
          <h3>手順4：RSpec で確かめる</h3>
          <p>途中の失敗は、上限を超える譲渡で例外が出た後に、2人の残高と記録の件数が元のままであることで確かめます。同時の譲渡は、2つのスレッドを待ち合わせてから呼び、1件だけが成功することを確かめます。</p>
          <Code
            lang="ruby"
            title="spec/services/transfer_points_spec.rb（抜粋）"
            code={`
  it "受け取る側が上限を超えるときは、送る側も元のままで、記録も残らない" do
    expect { TransferPoints.call(sender: sato, receiver: suzuki, amount: 300) }.to raise_error(ActiveRecord::RecordInvalid)

    expect([sato.reload.points, suzuki.reload.points]).to eq [1_000, 99_900]
    expect(PointTransfer.count).to eq 0
  end

  context "同じ会員から2件の譲渡が同時に来たとき" do
    self.use_transactional_tests = false
    after { [BonusGrant, PointExchange, PointTransfer, Member].each(&:delete_all) }

    it "ロックした後の残高で計算するので、2件目は残高が足りずに取り消される" do
      receivers = 2.times.map { |i| Member.create!(name: "会員#{i}", points: 500) }
      barrier = Concurrent::CyclicBarrier.new(2)
      results = receivers.map do |receiver|
        Thread.new do
          ActiveRecord::Base.connection_pool.with_connection do
            from = Member.find(sato.id)
            barrier.wait(3)
            TransferPoints.call(sender: from, receiver:, amount: 600)
            :ok
          rescue ActiveRecord::RecordInvalid
            :invalid
          end
        end
      end.map(&:value)

      expect(results.sort).to eq %i[invalid ok]
      expect(sato.reload.points).to eq 400
      expect(Member.sum(:points)).to eq 2_000
    end
  end
`}
          />
        </>
      ),
    },
    {
      id: 'external-api',
      title: '外部の API を含む処理は、トランザクションで原子的にできない',
      body: (
        <>
          <h3>ポイントをマイルに交換する処理</h3>
          <p>
            このサイトでは、ポイントを提携先の航空会社のマイルに交換することもできます。2ポイントで1マイルです。交換では、会員のポイントを減らし、提携先の API にマイルの加算を頼み、交換の記録を残します。譲渡と同じように「全部か無か」にしたいので、最初は3つをまとめて1つのトランザクションに入れました。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000002_create_point_exchanges.rb"
            code={`
class CreatePointExchanges < ActiveRecord::Migration[8.1]
  def change
    create_table :point_exchanges do |t|
      t.references :member, null: false, foreign_key: true
      t.integer :points, null: false # 減らしたポイント
      t.integer :miles, null: false  # 提携先に足してもらうマイル
      t.string :status, null: false, default: "pending" # pending → completed / canceled
      t.string :receipt_id # 提携先の受付番号
      t.timestamps
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/services/exchange_points.rb（直す前）"
            code={`
# ポイントをマイルに交換する（直す前：トランザクションの中で提携先の API を呼ぶ）
class ExchangePoints
  def self.call(member:, points:)
    ActiveRecord::Base.transaction do
      member.lock!
      member.update!(points: member.points - points)                     # ① ポイントを減らす
      receipt = PartnerAirline.add_miles(member, miles: points / 2)      # ② 提携先にマイルの加算を頼む
      PointExchange.create!(member:, points:, miles: points / 2,         # ③ 交換の記録を残す
                            status: "completed", receipt_id: receipt["receipt_id"])
    end
  end
end
`}
          />
          <h3>提携先の応答が遅れたときの実行結果</h3>
          <p>
            提携先の代わりに、要求を受けるとマイルを足し、2秒後に応答する小さなサーバー（FakePartner）を立てました。交換の処理の側は1秒でタイムアウトします。佐藤さん（10,000ポイント）が2,000ポイントを交換している途中（0.2秒後）に、鈴木さんが佐藤さんへ100ポイントを譲りました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/exchange.rb before）"
            code={`
0.00秒 交換: BEGIN
0.01秒 交換: SELECT members.* FROM members WHERE members.id = 1 LIMIT 1 FO…
0.01秒 交換: UPDATE members SET members.points = 8000 WHERE members.id = 1
0.21秒 譲渡: BEGIN
1.02秒 譲渡: SELECT members.* FROM members WHERE members.id IN (2, 1) O…
1.02秒 譲渡: UPDATE members SET members.points = 400 WHERE members.id = 2
1.02秒 譲渡: UPDATE members SET members.points = 10100 WHERE members.id = 1
1.03秒 交換: ROLLBACK
1.03秒 交換: 例外 Faraday::TimeoutError: Net::ReadTimeout with #<TCPSocket:(closed)>
1.03秒 譲渡: INSERT INTO point_transfers (sender_id, receiver_id, amount, cre…
1.04秒 譲渡: COMMIT
1.04秒 譲渡: 譲渡が終わった
---
DB: 佐藤 10100ポイント、交換の記録 []
提携先が受けた要求: ["POST /members/1/miles miles=1000 → 200"]
提携先の佐藤さんのマイル: 1000
`}
          />
          <p>結果から、2つの問題が読み取れます。</p>
          <ul>
            <li>
              取り消せない効果が残った：タイムアウトの例外でトランザクションは ROLLBACK され、佐藤さんのポイントは10,000に戻りました（その後、鈴木さんからの100を足して10,100）。一方、提携先は要求を受け取ってマイルを1,000足していました。DB の ROLLBACK は、提携先のサーバーの中で起きたことを取り消せません。佐藤さんはポイントを1つも減らさずに1,000マイルを得ています。
            </li>
            <li>
              ロックを持ったまま外部を待った：交換の処理は佐藤さんの行をロックしたまま提携先の応答を待ったので、0.21秒に始まった譲渡は、交換が ROLLBACK するまで約0.8秒待たされました。提携先の応答が遅いほど、同じ会員のほかの操作も遅くなります。
            </li>
          </ul>
          <p>
            Rails のソースのコメントは、トランザクションは1つの DB 接続の上で働くもので、複数の接続をまたぐ分散したトランザクションは Active Record の範囲外だと説明しています<Ref n={4} />。HTTP の API は、そもそも DB の接続ではありません。図 65-5 のとおり、トランザクションが取り消せるのは MySQL の中の変更だけで、提携先の API・メールの送信・Redis へのジョブの投入は、その範囲の外にあります。
          </p>
          <Figure n="65-5" title="外部の API を含む処理で、原子性を保てない範囲" caption="上から時間の順。色の付いた範囲が、ROLLBACK で取り消せる変更。">
            <ExternalFigure />
          </Figure>
          <h3>呼ぶ順序を変えても解決しない</h3>
          <p>API を呼ぶ位置を変えても、問題の形が変わるだけです。</p>
          <ul>
            <li>API を先に呼び、成功したらトランザクションで DB を変える：API の後に DB の更新が失敗する（残高が足りない、デッドロック、プロセスの停止）と、マイルだけが足されます。</li>
            <li>トランザクションの最後（COMMIT の直前）に API を呼ぶ：API は成功したのに COMMIT が失敗する、または API の応答を待つ間にタイムアウトすると、直す前と同じになります。ロックを持ったまま待つ問題も残ります。</li>
            <li>COMMIT の後に API を呼ぶ：DB の変更は確定してから依頼するので、ロックは待たせません。ただし、API が失敗したときに DB をどう戻すかを決めておく必要があります。</li>
          </ul>
          <p>3つ目の形に、失敗したときの扱いを足したものが、次の直し方です。</p>
          <h3>受付・依頼・取り消しに分けて直す</h3>
          <p>
            DB と提携先の両方を1回で原子的に変える方法は、この構成にはありません。そこで、原子性を保てる範囲（DB）をトランザクションにし、範囲の外（提携先）とは、次の3つの仕組みで、最後に両方の状態をそろえます。
          </p>
          <ul>
            <li>受付の状態：トランザクションの中では、ポイントを減らし、交換の行を pending（手続き中）で作るだけにします。どこまで進んだかが DB に残るので、利用者も運用の担当者も、交換の状態を知れます。</li>
            <li>
              冪等性キー：提携先への依頼は COMMIT の後にジョブで行い、交換の id から作ったキーを <code>Idempotency-Key</code> ヘッダーに付けます。タイムアウトの後に再試行しても、提携先は同じキーの2回目にはマイルを足しません。ここでは、提携先がこのヘッダーに対応していることを前提にしています。このヘッダーの仕様は IETF で検討中の文書です<Ref n={9} />。受け手の側の実装は<ChapterLink n={52} />で扱いました。
            </li>
            <li>
              取り消しの処理：提携先が交換を断った（4xx）ときは、減らしたポイントを戻す別のトランザクションを実行し、交換の行を canceled にします。COMMIT した結果は、打ち消す別のトランザクションでしか取り除けないという Haerder と Reuter の説明のとおり、この処理は「交換を取り消す」という新しいトランザクションです<Ref n={1} />。この章では、これを<Term en="countertransaction">補償の処理</Term>と呼びます。<ChapterLink n={34} section="external-boundaries" />でも、外部の決済を含む注文の処理で補償の操作を扱いました。
            </li>
          </ul>
          <Code
            lang="ruby"
            title="app/services/exchange_points.rb（直した後）"
            code={`
# ポイントをマイルに交換する（直した後：DB の変更だけをトランザクションに入れる）
class ExchangePoints
  def self.call(member:, points:)
    exchange = ActiveRecord::Base.transaction do
      member.lock!
      member.update!(points: member.points - points)                    # ① ポイントを減らす
      PointExchange.create!(member:, points:, miles: points / 2)        # ② 交換の受付を pending で残す
    end
    ExchangeMilesJob.perform_later(exchange)                            # ③ COMMIT の後に、提携先への依頼をジョブに任せる
    exchange
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/jobs/exchange_miles_job.rb"
            code={`
class ExchangeMilesJob < ApplicationJob
  def perform(exchange)
    return unless exchange.pending?

    # 交換の id を冪等性キーにする。タイムアウトの後に再試行しても、提携先は1回分しか足さない
    receipt = PartnerAirline.add_miles(exchange.member, miles: exchange.miles, idempotency_key: "point-exchange-#{exchange.id}")
    exchange.update!(status: "completed", receipt_id: receipt["receipt_id"])
  rescue Faraday::ClientError => e # 4xx：提携先が断った。送り直しても結果は変わらないので、ポイントを戻す
    Rails.logger.info("提携先が交換を断った: #{e.response_status}")
    exchange.cancel!
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/point_exchange.rb"
            code={`
# ポイントを提携先の航空会社のマイルに交換する（2ポイントで1マイル）
class PointExchange < ApplicationRecord
  belongs_to :member
  enum :status, { pending: "pending", completed: "completed", canceled: "canceled" }, default: "pending"

  # 提携先が交換を断ったときに、減らしたポイントを戻す（補償の処理）
  def cancel!
    with_lock do # 交換の行をロックし、読み直してから確かめる
      if pending?
        member.lock!
        member.update!(points: member.points + points)
        update!(status: "canceled")
      end
    end
  end
end
`}
          />
          <p>
            <code>cancel!</code> も冪等にしています。<code>with_lock</code> は交換の行をロックして読み直すので、2回呼ばれても、2回目は pending ではなくなっていて、ポイントを戻しません。直す前と同じ条件（提携先の応答が2秒遅れる）で動かした結果と、提携先が 422 で断る場合の結果が次のとおりです。ジョブは本物の Sidekiq で実行し、再試行までの待ち時間を1秒にしています。
          </p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/exchange.rb after）"
            code={`
0.23秒 交換: BEGIN
0.23秒 交換: SELECT members.* FROM members WHERE members.id = 1 LIMIT 1 FO…
0.23秒 交換: UPDATE members SET members.points = 8000 WHERE members.id = 1
0.24秒 交換: INSERT INTO point_exchanges (member_id, points, miles, status, r…
0.25秒 交換: COMMIT
0.26秒 ジョブ: ExchangeMilesJob の実行を開始
0.43秒 譲渡: BEGIN
0.43秒 譲渡: SELECT members.* FROM members WHERE members.id IN (2, 1) O…
0.43秒 譲渡: UPDATE members SET members.points = 400 WHERE members.id = 2
0.43秒 譲渡: UPDATE members SET members.points = 8100 WHERE members.id = 1
0.43秒 譲渡: INSERT INTO point_transfers (sender_id, receiver_id, amount, cre…
0.45秒 譲渡: COMMIT
0.45秒 譲渡: 譲渡が終わった
1.26秒 ジョブ: 失敗: Faraday::TimeoutError（Sidekiq が再試行に回す）
11.19秒 ジョブ: ExchangeMilesJob の実行を開始
11.19秒 ジョブ: BEGIN
11.19秒 ジョブ: UPDATE point_exchanges SET point_exchanges.status = 'completed',…
11.20秒 ジョブ: COMMIT
---
DB: 佐藤 8100ポイント、交換の記録 [[1000, "completed", "R-1"]]
提携先が受けた要求: ["POST /members/1/miles miles=1000 key=point-exchange-1 → 200", "POST /members/1/miles miles=1000 key=point-exchange-1 → 200"]
提携先の佐藤さんのマイル: 1000
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/exchange.rb after_422、ジョブの部分）"
            code={`
0.26秒 ジョブ: SELECT point_exchanges.* FROM point_exchanges WHERE point_exchan…
0.26秒 ジョブ: SELECT members.* FROM members WHERE members.id = 1 LIMIT 1 FO…
0.26秒 ジョブ: UPDATE members SET members.points = 10000 WHERE members.id = 1
0.27秒 ジョブ: UPDATE point_exchanges SET point_exchanges.status = 'canceled', …
0.27秒 ジョブ: COMMIT
# …（省略：譲渡は 0.43秒に始まり、待たずに終わった）
---
DB: 佐藤 10100ポイント、交換の記録 [[1000, "canceled", nil]]
提携先が受けた要求: ["POST /members/1/miles miles=1000 key=point-exchange-1 → 422"]
提携先の佐藤さんのマイル: 0
`}
          />
          <p>
            1つ目の結果では、交換のトランザクションが 0.25秒に COMMIT されたので、0.43秒に始まった譲渡は待たずに終わりました。提携先への1回目の依頼はタイムアウトしましたが、Sidekiq の再試行で同じキーの2回目が送られ、提携先は1回分の1,000マイルだけを足しています。DB の8,100ポイント（10,000 − 2,000 + 100）と提携先の1,000マイルがそろいました。2つ目の結果では、提携先が 422 で断ったので、<code>cancel!</code> のトランザクションでポイントが10,000に戻り、交換の行は canceled になりました。この流れを状態の変化としてまとめたのが図 65-6 です。
          </p>
          <Figure n="65-6" title="交換を受付と依頼に分けたときの状態の流れ" caption="四角の太い枠がトランザクション。1つ目と補償のトランザクションは、それぞれが原子的に COMMIT する。">
            <FixFlowFigure />
          </Figure>
          <h3>この形でも残る隙間</h3>
          <ul>
            <li>
              COMMIT の後、<code>perform_later</code> の前にプロセスが止まると、交換の行は pending のまま、ジョブは投入されません。依頼の予定を同じトランザクションで DB に書いておき、別のプロセスが送る Transactional Outbox（<ChapterLink n={53} />）か、古い pending の行を定期的に探して依頼し直すジョブで補います。
            </li>
            <li>
              pending の間、佐藤さんのポイントは減っていて、マイルはまだ足されていません。この間の状態は利用者の画面に「交換の手続き中」と表示し、DB と提携先が一時的にずれていることを隠さないようにします。
            </li>
            <li>提携先が 5xx を返し続ける場合、Sidekiq の再試行を使い切ったジョブは Dead に入ります。Dead に入った交換を運用の担当者が見つけ、再実行するか取り消すかを決める手順も用意しておきます。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '全会員のボーナスを1つのトランザクションにしたとき',
      body: (
        <>
          <h3>「全部か無か」を広く取りすぎる</h3>
          <p>
            譲渡の不具合の後で、「ポイントを変える処理はすべて1つのトランザクションに入れる」と決めたとします。毎月、全会員に100ポイントのボーナスを付与するバッチも、全会員の更新を1つのトランザクションに入れました。
          </p>
          <Code
            lang="ruby"
            title="overuse/monthly_bonus_in_one_transaction.rb（当てはめすぎの例）"
            code={`
# 当てはめすぎの例：全会員への月のボーナスを1つのトランザクションで付与する
class MonthlyBonus
  def self.call(amount:)
    ActiveRecord::Base.transaction do
      Member.find_each do |member|
        sleep 0.002 # 会員ごとの計算の代わり
        member.update!(points: member.points + amount)
      end
    end
  end
end
`}
          />
          <p>
            1,000人の会員で動かしました。700人目の会員は上限に近い99,950ポイントを持っています。バッチを始めた0.3秒後に、1人目の会員が2人目の会員へ50ポイントを譲りました。譲渡の側はロックを1秒まで待つように <code>innodb_lock_wait_timeout</code> を1にしています（既定は50秒）<Ref n={10} />。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/overuse.rb monthly_bonus_in_one_transaction）"
            code={`
0.00秒 ボーナスの付与を開始
0.30秒 譲渡を開始
1.31秒 譲渡が失敗: ActiveRecord::LockWaitTimeout
2.98秒 ボーナスの付与が失敗: ActiveRecord::RecordInvalid: Validation failed: Points must be less than or equal to 100000
---
ポイントの合計の増え方: 0（100ポイント × 0人）
1人目 1000、2人目 1000、700人目 99950
`}
          />
          <ul>
            <li>
              ほかの処理を止めた：バッチは1人目の行を更新した後、COMMIT するまでロックを持ち続けます。1人目の会員の譲渡は1秒待ってタイムアウトしました。既定の50秒なら、50秒待った後に失敗します。会員の数が増えれば、ロックを持つ時間も延びます。
            </li>
            <li>
              1人の失敗で全員が取り消された：700人目が上限を超えたので、それまでに付与した699人の分も ROLLBACK され、誰もボーナスを受け取れませんでした。直してからもう一度実行すると、1,000人分を最初からやり直すことになります。
            </li>
          </ul>
          <p>
            ボーナスの付与で「全部か無か」にしなければならないのは、会員1人の残高の更新と、その会員への付与の記録の組み合わせです。会員Aへの付与と会員Bへの付与は、片方だけが済んでいても、データとして矛盾しません。
          </p>
          <h3>業務の単位でトランザクションを区切る</h3>
          <p>
            会員1人ごとに1つのトランザクションにし、失敗した会員を記録して続けるように直しました。途中で止まったバッチをもう一度実行したときに、付与済みの会員に二重に付与しないように、付与の記録に（会員, 月）の一意索引を付け、<ChapterLink n={83} />の <code>PointGrant.grant!</code> と同じ形で2回目を見分けます。
          </p>
          <Code
            lang="ruby"
            title="app/models/bonus_grant.rb"
            code={`
class BonusGrant < ApplicationRecord
  belongs_to :member

  # 会員1人の付与を1つのトランザクションにする。付与済みの月なら何もしない（冪等性の章の PointGrant.grant! と同じ形）
  def self.grant!(member, month:, amount:)
    transaction(requires_new: true) do # 外側にトランザクションがあれば SAVEPOINT を作る
      member.lock!
      member.update!(points: member.points + amount)
      create!(member:, month:, amount:)
    end
  rescue ActiveRecord::RecordNotUnique
    nil
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/services/monthly_bonus.rb"
            code={`
# 全会員に月のボーナスを付与する。会員ごとに1つのトランザクションにし、失敗した会員を記録して続ける
class MonthlyBonus
  def self.call(amount:, month: Time.current.strftime("%Y-%m"))
    failures = []
    Member.find_each do |member|
      sleep 0.002 # 会員ごとの計算の代わり
      BonusGrant.grant!(member, month:, amount:)
    rescue ActiveRecord::RecordInvalid => e
      failures << [member.id, e.message]
    end
    failures
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/overuse.rb）"
            code={`
0.00秒 ボーナスの付与を開始
0.30秒 譲渡を開始
0.34秒 譲渡が終わった
18.48秒 ボーナスの付与が終わった 失敗した会員: [[700, "Validation failed: Points must be less than or equal to 100000"]]
---
ポイントの合計の増え方: 99900（100ポイント × 999人）
1人目 1050、2人目 1150、700人目 99950
もう一度実行した後のポイントの合計の増え方: 0
`}
          />
          <p>
            譲渡は待たずに0.04秒で終わり、999人にボーナスが付与され、上限を超える700人目だけが失敗として返りました。もう一度実行しても、一意索引が2回目を拒むので、合計は増えません。代わりに、会員ごとに SELECT … FOR UPDATE・INSERT・COMMIT が加わるので、1,000人の付与に約18秒かかりました。夜間のバッチでこの時間が問題になるなら、100人ずつのように、矛盾が起きない範囲でまとめる単位を大きくします。
          </p>
          <h3>判断の目安</h3>
          <Figure n="65-7" title="何を1つのトランザクションに入れるかの判断" caption="上から順に確かめる。1つのトランザクションに入れるのは、片方だけが残るとデータが矛盾する DB の変更だけ。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>処理の組み合わせ</th>
                    <th>片方だけが残ったとき</th>
                    <th>扱い</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>譲渡の「減らす」と「足す」と「記録」</td>
                    <td>ポイントが消える・増える</td>
                    <td>1つのトランザクションに入れる</td>
                  </tr>
                  <tr>
                    <td>会員1人の残高の更新と、その付与の記録</td>
                    <td>記録のない残高の変化が残る</td>
                    <td>1つのトランザクションに入れる</td>
                  </tr>
                  <tr>
                    <td>会員Aへの付与と、会員Bへの付与</td>
                    <td>矛盾しない（Bに後で付与すればよい）</td>
                    <td>別々のトランザクションにし、やり直しを冪等にする</td>
                  </tr>
                  <tr>
                    <td>DB の変更と、外部の API・メール・ジョブの投入</td>
                    <td>DB の ROLLBACK では外部を取り消せない</td>
                    <td>トランザクションの外に出し、状態・冪等性キー・補償の処理で、最後にそろえる</td>
                  </tr>
                  <tr>
                    <td>DB の変更と、時間のかかる計算・ファイルの読み込み</td>
                    <td>（計算は何も残さない）</td>
                    <td>計算はトランザクションの前に済ませ、ロックを持つ時間を短くする</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <ul>
            <li>トランザクションの範囲は「片方だけが残るとデータが矛盾する DB の変更」から決めます。同じ画面の操作で起きるからという理由で、関係のない変更まで入れないようにします。</li>
            <li>トランザクションの中では、ネットワークの向こうを待たないようにします。待つ間、ほかの処理がロックを待ち、DB の接続も1つ占有し続けます。</li>
            <li>範囲を小さく区切ったら、途中で止まった後のやり直しを冪等にしておきます。原子性と冪等性は、組み合わせて使う原則です。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Active Record のトランザクションと、本書のほかの章',
      body: (
        <>
          <h3>Active Record のトランザクションの基本</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>書き方・動き</th>
                  <th>内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>save</code>・<code>destroy</code>
                  </td>
                  <td>それぞれが自動でトランザクションに包まれる。バリデーションやコールバックの中の例外でも ROLLBACK される<Ref n={4} /></td>
                </tr>
                <tr>
                  <td>
                    <code>ActiveRecord::Base.transaction</code>
                  </td>
                  <td>ブロックが正常に終われば COMMIT、例外なら ROLLBACK して例外を投げ直す<Ref n={4} /></td>
                </tr>
                <tr>
                  <td>
                    <code>raise ActiveRecord::Rollback</code>
                  </td>
                  <td>ROLLBACK するが、例外はブロックの外へ伝わらない。呼び出し側は失敗に気づけないので、戻り値などで知らせる<Ref n={4} /></td>
                </tr>
                <tr>
                  <td>ROLLBACK の後のオブジェクト</td>
                  <td>属性は戻らない。reload するか、トランザクションの中で読み直したものだけを使う<Ref n={4} /></td>
                </tr>
                <tr>
                  <td>複数の DB</td>
                  <td>トランザクションは1つの接続の上で働く。接続をまたぐ分散トランザクションは Active Record の範囲外<Ref n={4} /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>入れ子のトランザクションと SAVEPOINT</h3>
          <p>
            <code>transaction</code> の中でもう一度 <code>transaction</code> を呼ぶと、既定では内側は外側に合流し、新しいトランザクションも SAVEPOINT も作りません。内側だけを取り消せるようにするには <code>requires_new: true</code> を付けます（<ChapterLink n={15} section="nested" />）<Ref n={4} />。この違いが問題になるのは、例外を捕まえて続ける <code>grant!</code> のようなメソッドです。BonusGrant の <code>requires_new: true</code> を外し、外側のトランザクションの中から同じ月で2回呼ぶと、次のようになりました。
          </p>
          <Code
            lang="text"
            title="実行結果（requires_new なし、bin/rails runner script/nested.rb）"
            code={`
  BEGIN
  UPDATE members SET members.points = 1100 WHERE members.id = 1
  INSERT INTO bonus_grants (member_id, month, amount, created_at, update…
  UPDATE members SET members.points = 1200 WHERE members.id = 1
  INSERT INTO bonus_grants (member_id, month, amount, created_at, update… → ActiveRecord::RecordNotUnique
  COMMIT
points: 1200  bonus_grants: 1件
`}
          />
          <Code
            lang="text"
            title="実行結果（requires_new: true、bin/rails runner script/nested.rb）"
            code={`
  BEGIN
  UPDATE members SET members.points = 1100 WHERE members.id = 1
  INSERT INTO bonus_grants (member_id, month, amount, created_at, update…
  SAVEPOINT active_record_1
  UPDATE members SET members.points = 1200 WHERE members.id = 1
  INSERT INTO bonus_grants (member_id, month, amount, created_at, update… → ActiveRecord::RecordNotUnique
  ROLLBACK TO SAVEPOINT active_record_1
  COMMIT
points: 1100  bonus_grants: 1件
`}
          />
          <p>
            <code>requires_new</code> がないと、2回目の INSERT が一意索引に拒まれても、内側のブロックは外側に合流しているので、直前の UPDATE（1,200）は取り消されず、外側と一緒に COMMIT されました。<code>requires_new: true</code> を付けると、2回目は SAVEPOINT の中で実行され、ROLLBACK TO SAVEPOINT で UPDATE も取り消されて1,100のままです。1回目に SAVEPOINT が出ていないのは、外側のトランザクションがまだ何も書いていない時点では、Rails が SAVEPOINT を作らず、取り消すときは外側をやり直す形（RestartParentTransaction）にするからです<Ref n={6} />。<ChapterLink n={83} />の <code>PointGrant.grant!</code> はジョブからトランザクションの外で呼んでいますが、ほかのトランザクションの中から呼ぶ可能性があるなら、同じように <code>requires_new: true</code> を付けます。
          </p>
          <p>
            入れ子のトランザクションの中で <code>raise ActiveRecord::Rollback</code> を使う場合も同じ注意が要ります。<code>requires_new</code> のない内側のブロックで ActiveRecord::Rollback を投げると、例外は内側のブロックで止まり、外側は何も取り消さずに COMMIT します。Rails のソースのコメントも、この例を挙げています<Ref n={4} />。取り消したいのに取り消されない状態が、例外も出ずに起きるので、テストで ROLLBACK の結果を確かめておきます。
          </p>
          <h3>COMMIT の後に行う処理</h3>
          <p>
            外部への依頼やジョブの投入を COMMIT の後に回す方法は、Rails にいくつかあります。モデルの <code>after_commit</code>（<ChapterLink n={14} section="after-commit" />）、ジョブの <code>enqueue_after_transaction_commit</code>（<ChapterLink n={18} section="transaction" />）、トランザクションのオブジェクトに登録する <code>after_commit</code> です。この章の ExchangePoints は、トランザクションのブロックの外で <code>perform_later</code> を呼ぶことで、COMMIT の後に投入しています。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 で、<code>ActiveRecord::Base.transaction</code> がブロックに <code>ActiveRecord::Transaction</code> のオブジェクトを渡すようになり、<code>transaction.after_commit {'{ … }'}</code> のように、レコードのコールバックを使わずに COMMIT の後の処理を登録できるようになりました。トランザクションの中でも外でも呼ばれうるコードのための <code>ActiveRecord.after_all_transactions_commit</code> も 7.2 で追加されています<Ref n={5} />。Rails 7.1 以前では使えないので、モデルの <code>after_commit</code> を使うか、この章のようにブロックの外に書きます。
            </p>
          </Callout>
          <h3>関係する章</h3>
          <ul>
            <li>
              SQL のトランザクション・分離レベル・ロック・デッドロックは<ChapterLink n={38} />で、Active Record のトランザクションとロックの実装は<ChapterLink n={15} />で扱いました。
            </li>
            <li>1つの業務の操作で変えた複数のオブジェクトを、1つのトランザクションでまとめて保存する設計は<ChapterLink n={48} />で扱いました。</li>
            <li>
              DB の変更と外部への通知を確実に両方行う Transactional Outbox は<ChapterLink n={53} />で、外部の決済を含む注文の処理を段階的に設計する例は<ChapterLink n={34} section="transaction-design" />で扱いました。
            </li>
            <li>止まった後のやり直しを安全にする冪等性は<ChapterLink n={83} />で扱いました。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>原子性は、一連の処理を全部成功か全部失敗かの単位として扱い、中途半端な状態を残さない原則です。Haerder と Reuter（1983）は、全部か無かであることに加えて、利用者がどちらの状態にいるかを知れることを求めています。</li>
          <li>Active Record の save は書き込みごとに COMMIT するので、送る側を減らした後に受け取る側の更新が失敗すると、300ポイントが消えました。3つの書き込みを ActiveRecord::Base.transaction に入れると、例外で全体が ROLLBACK されます。ROLLBACK してもメモリーの上のオブジェクトは戻りません。</li>
          <li>原子性は、同時に動いた2つの処理の間の更新の消失を防ぎません。行を id の順に FOR UPDATE でロックし、ロックした後の値で計算すると、2件目の譲渡は残高が足りずに取り消されました。</li>
          <li>DB のトランザクションは、提携先の API の効果を取り消せません。API の呼び出しをトランザクションに入れると、ROLLBACK の後もマイルが残り、待つ間はロックを持ち続けました。</li>
          <li>外部を含む処理は、DB の変更だけをトランザクションにし、pending の状態・冪等性キー・補償の処理（打ち消すトランザクション）で、最後に DB と外部をそろえます。</li>
          <li>全会員のボーナスを1つのトランザクションにすると、ほかの操作がロックを待ってタイムアウトし、1人の失敗で全員の付与が取り消されました。片方だけが残ると矛盾する変更だけを1つにまとめ、区切った後のやり直しを冪等にします。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Principles of Transaction-Oriented Database Recovery', publisher: 'Theo Haerder, Andreas Reuter / ACM Computing Surveys, Vol. 15, No. 4（Boston University の読書会のページに置かれた複製）', url: 'https://cs-people.bu.edu/mathan/reading-groups/papers-classics/recovery.pdf', accessed: '2026-11-22', version: '1983年12月', note: 'トランザクションを分けられないものにする4つの性質と ACID の略語、原子性（全部か無かで、利用者がどちらの状態かを知れる）、一貫性・分離性・持続性の定義、COMMIT した誤ったトランザクションの効果は打ち消すトランザクションでしか取り除けないこと。' },
    { title: 'MySQL 8.4 Reference Manual: 17.2 InnoDB and the ACID Model', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/mysql-acid.html', accessed: '2026-11-22', version: 'MySQL 8.4', note: '原子性に関わる仕組み（InnoDB のトランザクション、autocommit、COMMIT、ROLLBACK）、一貫性（doublewrite buffer、クラッシュからの回復）、分離性（分離レベル、ロック）、持続性（innodb_flush_log_at_trx_commit、sync_binlog など）。' },
    { title: 'MySQL 8.4 Reference Manual: 17.7.2.2 autocommit, Commit, and Rollback', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html', accessed: '2026-11-22', version: 'MySQL 8.4', note: 'InnoDB ではすべての操作がトランザクションの中で行われ、autocommit が有効なら SQL の文ごとに COMMIT すること、新しい接続では既定で有効なこと。' },
    { title: 'activerecord/lib/active_record/transactions.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/transactions.rb#L18-L230`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '2つの口座の振替の例、例外で ROLLBACK されること、オブジェクトのインスタンスのデータは戻らないこと、トランザクションは1つの DB 接続で働き分散トランザクションは範囲外であること、save と destroy が自動でトランザクションに包まれること、ActiveRecord::Rollback が投げ直されないこと、入れ子と requires_new。' },
    { title: 'Ruby on Rails 7.2 Release Notes（Per transaction commit and rollback callbacks）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/7_2_release_notes.html', accessed: '2026-11-22', version: 'Rails 7.2', note: 'transaction がブロックに ActiveRecord::Transaction を渡し after_commit を登録できるようになったこと、current_transaction と ActiveRecord.after_all_transactions_commit の追加。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/transaction.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/transaction.rb#L527-L557`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '入れ子のトランザクションを始めるとき、外側がやり直せる状態なら RestartParentTransaction を、そうでなければ SavepointTransaction を作ること。SQL の順序は実行結果で確かめた。' },
    { title: 'MySQL 8.4 Reference Manual: 17.7.3 Locks Set by Different SQL Statements in InnoDB', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html', accessed: '2026-11-21', version: 'MySQL 8.4', note: 'SELECT … FOR UPDATE が検索で見つけた索引の行をロックし、ほかのセッションの FOR SHARE などを止めること。' },
    { title: 'Active Record Query Interface（Pessimistic Locking）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html#pessimistic-locking', accessed: '2026-11-22', version: 'Rails 8.1', note: 'lock が選んだ行に排他ロックを取り、MySQL では SELECT … FOR UPDATE になること、トランザクションの中で使うこと、with_lock が読み直してロックを取りトランザクションを始めること。' },
    { title: 'The Idempotency-Key HTTP Header Field（draft-ietf-httpapi-idempotency-key-header-08）', publisher: 'IETF HTTPAPI Working Group', url: 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/', accessed: '2026-11-13', version: '第8版、2026年10月22日（Internet-Draft。RFC ではない）', note: 'Idempotency-Key ヘッダーの仕様が IETF で検討中の文書であること（第9部の Idempotency Key の章の出典を流用）。' },
    { title: 'MySQL 8.4 Reference Manual: 17.14 InnoDB Startup Options and System Variables（innodb_lock_wait_timeout）', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html', accessed: '2026-11-22', version: 'MySQL 8.4', note: 'innodb_lock_wait_timeout が行のロックを待つ秒数で既定は50秒、セッションごとに変えられること、タイムアウトでは文だけが ROLLBACK されること。' },
  ],
}

export default chapter
