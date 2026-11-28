import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T, TextBg } from '../components/diagram'

/* ---------- 図 106-1 DB の更新とジョブの投入の、片方だけが成功する ---------- */
type Step =
  | { kind: 'msg'; from: number; to: number; text: string; lost?: string }
  | { kind: 'note'; at: number; lines: string[]; tone?: 'danger' | 'acc' }

function PanelTimeline({ x0, title, lanes, steps, result }: { x0: number; title: string; lanes: string[]; steps: Step[]; result: string[] }) {
  const lx = (i: number) => x0 + 60 + i * 125
  let y = 92
  const placed: { s: Step; at: number }[] = []
  for (const s of steps) {
    placed.push({ s, at: y })
    y += s.kind === 'msg' ? (s.lost ? 52 : 38) : s.lines.length * 16 + 18
  }
  const bottom = y + 4
  return (
    <g>
      <T x={x0 + 185} y={18} anchor="middle" fs={13} bold>
        {title}
      </T>
      {lanes.map((name, i) => (
        <g key={name}>
          <Box x={lx(i) - 52} y={34} w={104} h={30} lines={name} fs={12} fill={i === 0 ? 'box5' : 'box4'} />
          <line x1={lx(i)} y1={64} x2={lx(i)} y2={bottom} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {placed.map(({ s, at }, i) => {
        if (s.kind === 'note') {
          const w = 160
          const nx = Math.min(Math.max(lx(s.at) - w / 2, x0 + 4), x0 + 382 - w)
          return <Box key={i} x={nx} y={at + 4} w={w} h={s.lines.length * 16 + 10} lines={s.lines} fs={11} fill={s.tone === 'danger' ? 'bg' : 'box'} subTone={s.tone} />
        }
        const x1 = lx(s.from)
        const x2 = lx(s.to)
        const cy = at + 26
        if (s.lost) {
          const end = x1 + (x2 - x1) * 0.6
          return (
            <g key={i}>
              <TextBg x={(x1 + x2) / 2} y={cy - 12} text={s.text} fs={11} anchor="middle" />
              <TextBg x={(x1 + x2) / 2} y={cy + 16} text={s.lost} fs={11} anchor="middle" />
              <line x1={x1} y1={cy} x2={end - Math.sign(x2 - x1) * 10} y2={cy} stroke="var(--fig-danger)" strokeWidth={1.5} strokeDasharray="5 4" />
              <T x={end} y={cy} anchor="middle" fs={18} tone="danger" bold>
                ×
              </T>
              <T x={(x1 + x2) / 2} y={cy - 12} anchor="middle" fs={11}>
                {s.text}
              </T>
              <T x={(x1 + x2) / 2} y={cy + 16} anchor="middle" fs={11} tone="danger">
                {s.lost}
              </T>
            </g>
          )
        }
        return (
          <g key={i}>
            <TextBg x={(x1 + x2) / 2} y={cy - 10} text={s.text} fs={11} anchor="middle" />
            <Arrow x1={x1} y1={cy} x2={x2 - 2} y2={cy} />
            <T x={(x1 + x2) / 2} y={cy - 10} anchor="middle" fs={11} mono>
              {s.text}
            </T>
          </g>
        )
      })}
      <Box x={x0 + 20} y={bottom + 12} w={330} h={44} lines={result} fs={12} fill="bg" accent subTone="danger" />
    </g>
  )
}

function PartialFailureFigure() {
  const lanes = ['Rails', 'MySQL', 'Redis']
  return (
    <Svg
      id="106-1"
      w={780}
      h={350}
      label="左の A は after_save でジョブを積む場合。Rails は BEGIN の後に members を UPDATE し、その時点で CrmSyncJob を Redis に積む。続く profile の検証で失敗して ROLLBACK するので、DB のメールアドレスは古いままだが、Redis には新しいメールアドレスのジョブが残る。右の B は after_save_commit で積む場合。Rails は members を UPDATE して COMMIT した後にジョブを積もうとするが、Redis に接続できないかプロセスが止まると、ジョブは積まれない。DB は新しいメールアドレスに変わったのに、CRM に知らせるジョブがない"
    >
      <PanelTimeline
        x0={0}
        title="A：トランザクションの中で積む"
        lanes={lanes}
        steps={[
          { kind: 'msg', from: 0, to: 1, text: 'BEGIN・UPDATE members' },
          { kind: 'msg', from: 0, to: 2, text: 'CrmSyncJob を積む（after_save）' },
          { kind: 'note', at: 0, lines: ['profile の検証で失敗'], tone: 'danger' },
          { kind: 'msg', from: 0, to: 1, text: 'ROLLBACK' },
          { kind: 'note', at: 2, lines: ['ジョブは残る'], tone: 'danger' },
        ]}
        result={['DB：old@example.com のまま', 'Redis：new@example.com のジョブがある']}
      />
      <line x1={390} y1={10} x2={390} y2={340} stroke="var(--fig-line)" strokeWidth={0.5} />
      <PanelTimeline
        x0={400}
        title="B：COMMIT の後に積む"
        lanes={lanes}
        steps={[
          { kind: 'msg', from: 0, to: 1, text: 'BEGIN・UPDATE members' },
          { kind: 'msg', from: 0, to: 1, text: 'COMMIT' },
          { kind: 'msg', from: 0, to: 2, text: 'CrmSyncJob を積む', lost: 'Redis に接続できない・プロセスが止まる' },
          { kind: 'note', at: 0, lines: ['送るべきだった記録は', 'どこにも残らない'], tone: 'danger' },
        ]}
        result={['DB：new@example.com に変わった', 'Redis：CRM に知らせるジョブがない']}
      />
    </Svg>
  )
}

/* ---------- 図 106-2 Transactional Outbox の構成 ---------- */
function OutboxFigure() {
  return (
    <Svg
      id="106-2"
      w={780}
      h={300}
      label="MembersController と ChangeMemberEmail は、1つのトランザクションで members を UPDATE し、outbox_messages に送るメッセージを INSERT する。中継のジョブ RelayOutboxJob は定期実行され、outbox_messages から未送信の行を FOR UPDATE SKIP LOCKED で書いた順に取り出し、CRM に送り、送れたら sent_at を記録する。CRM は event_id で重複を捨てる"
    >
      <Box x={10} y={104} w={170} h={64} lines={['MembersController', 'ChangeMemberEmail', '会員の更新']} fs={12} subTone="muted" />
      <rect x={206} y={60} width={222} height={160} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <T x={216} y={76} fs={11} tone="acc">
        1つのトランザクション
      </T>
      <Box x={220} y={88} w={196} h={50} lines={['members', 'UPDATE email']} fs={12} fill="box4" subTone="muted" />
      <Box x={220} y={150} w={196} h={56} lines={['outbox_messages', 'INSERT（送るメッセージ）']} fs={12} fill="box4" bold subTone="muted" />
      <Arrow x1={180} y1={128} x2={218} y2={113} />
      <Arrow x1={180} y1={144} x2={218} y2={174} />

      <Box x={470} y={128} w={170} h={92} lines={['RelayOutboxJob', '定期実行の中継のジョブ', '① 未送信を書いた順に', '　 SKIP LOCKED で取り出す', '③ sent_at を記録']} fs={11} fill="box5" bold subTone="muted" align="start" />
      <Arrow x1={468} y1={164} x2={418} y2={164} />
      <T x={449} y={150} anchor="middle" fs={11}>
        ①・③
      </T>
      <Box x={690} y={136} w={84} h={76} lines={['CRM', 'event_id で', '重複を捨てる']} fs={12} fill="box4" bold subTone="muted" />
      <Arrow x1={640} y1={174} x2={688} y2={174} />
      <T x={664} y={160} anchor="middle" fs={11}>
        ② 送る
      </T>
      <T x={390} y={256} anchor="middle" fs={12} tone="muted">
        業務の処理は送らない。送るのは中継のジョブだけで、送れなかった行は残って次の回に送り直される
      </T>
      <T x={390} y={278} anchor="middle" fs={12} tone="muted">
        ② の後、③ の前に止まると同じメッセージがもう一度送られる（少なくとも1回の配信）
      </T>
    </Svg>
  )
}

/* ---------- 図 106-3 重複した配信と、受け取る側での重複排除 ---------- */
const DUP_ROWS: ({ kind: 'msg'; from: 0 | 1; text: string; lost?: boolean; acc?: boolean } | { kind: 'note'; at: 0 | 1; lines: string[]; acc?: boolean })[] = [
  { kind: 'msg', from: 0, text: 'ev-1 を送る' },
  { kind: 'note', at: 1, lines: ['ev-1 を処理し、', '処理済みの ID に記録する'] },
  { kind: 'msg', from: 1, text: '応答が届かない（タイムアウト）', lost: true },
  { kind: 'note', at: 0, lines: ['一時エラーとして次の実行を待つ', 'sent_at は記録しない'] },
  { kind: 'msg', from: 0, text: '次の回に ev-1 をもう一度送る', acc: true },
  { kind: 'note', at: 1, lines: ['処理済みの ID なので、', '何もせずに成功を返す'], acc: true },
  { kind: 'msg', from: 1, text: '200' },
  { kind: 'note', at: 0, lines: ['sent_at を記録する'] },
]

function DuplicateFigure() {
  const X = [200, 580]
  let y = 58
  const placed: { r: (typeof DUP_ROWS)[number]; at: number }[] = []
  for (const r of DUP_ROWS) {
    placed.push({ r, at: y })
    y += r.kind === 'msg' ? 40 : r.lines.length * 16 + 18
  }
  const h = y + 10
  return (
    <Svg
      id="106-3"
      w={780}
      h={h}
      label="中継のジョブがイベント ev-1 を CRM に送る。CRM は ev-1 を処理して処理済みの ID に記録するが、応答が中継に届かずタイムアウトする。中継は失敗とみなして sent_at を記録しない。次の回に ev-1 をもう一度送ると、CRM は処理済みの ID だと分かるので何もせずに成功を返す。中継は sent_at を記録する"
    >
      {['RelayOutboxJob（中継）', 'CRM（受け取る側）'].map((name, i) => (
        <g key={name}>
          <Box x={X[i] - 100} y={10} w={200} h={32} lines={name} fill={i === 0 ? 'box5' : 'box4'} fs={12} />
          <line x1={X[i]} y1={42} x2={X[i]} y2={h - 6} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {placed.map(({ r, at }, i) => {
        if (r.kind === 'note') {
          return <Box key={i} x={X[r.at] - 130} y={at + 4} w={260} h={r.lines.length * 16 + 10} lines={r.lines} fs={12} accent={r.acc} subTone={r.acc ? 'acc' : 'muted'} />
        }
        const x1 = X[r.from]
        const x2 = X[1 - r.from]
        const dir = x2 > x1 ? 1 : -1
        const cy = at + 28
        if (r.lost) {
          const end = x1 + (x2 - x1) * 0.6
          return (
            <g key={i}>
              <line x1={x1} y1={cy} x2={end - dir * 10} y2={cy} stroke="var(--fig-danger)" strokeWidth={1.5} strokeDasharray="5 4" />
              <T x={end} y={cy} anchor="middle" fs={18} tone="danger" bold>
                ×
              </T>
              <T x={(x1 + x2) / 2} y={cy - 12} anchor="middle" fs={12} tone="danger">
                {r.text}
              </T>
            </g>
          )
        }
        return (
          <g key={i}>
            <Arrow x1={x1} y1={cy} x2={x2 - dir * 2} y2={cy} dashed={r.from === 1} accent={r.acc} />
            <T x={(x1 + x2) / 2} y={cy - 11} anchor="middle" fs={12} tone={r.acc ? 'acc' : undefined}>
              {r.text}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 106-4 中継の方式の比較 ---------- */
function RelayMethodsFigure() {
  const rows: { y: number; title: string; boxes: { lines: string[]; fill: 'box' | 'box4' | 'box5'; w: number }[]; pros: string; cons: string }[] = [
    {
      y: 10,
      title: 'ポーリング（この章のコード）',
      boxes: [
        { lines: ['outbox_messages'], fill: 'box4', w: 150 },
        { lines: ['RelayOutboxJob', '数秒ごとに SELECT'], fill: 'box5', w: 170 },
        { lines: ['CRM'], fill: 'box4', w: 100 },
      ],
      pros: '長所：SQL と Active Job だけで作れる。MySQL の権限や設定を変えずに済む',
      cons: '短所：問い合わせの間隔だけ遅れる。DB に問い合わせが増える。複数の中継では順序が崩れうる',
    },
    {
      y: 140,
      title: 'トランザクションログを読む（CDC）',
      boxes: [
        { lines: ['outbox_messages'], fill: 'box4', w: 130 },
        { lines: ['binlog'], fill: 'box4', w: 80 },
        { lines: ['Debezium'], fill: 'box5', w: 100 },
        { lines: ['Kafka'], fill: 'box4', w: 80 },
        { lines: ['受け取る側'], fill: 'box', w: 100 },
      ],
      pros: '長所：遅れが小さい。outbox の表を問い合わせない。binlog は COMMIT した順に並ぶ',
      cons: '短所：Debezium・Kafka などの運用と binlog の設定が要る。重複して送ることは防げない',
    },
    {
      y: 270,
      title: '同じ DB のジョブキュー（Solid Queue）',
      boxes: [
        { lines: ['ジョブの表', '（業務と同じ DB）'], fill: 'box4', w: 150 },
        { lines: ['Solid Queue', 'のワーカー'], fill: 'box5', w: 140 },
        { lines: ['CRM'], fill: 'box4', w: 100 },
      ],
      pros: '長所：ジョブを積むことが業務の更新と同じトランザクションに入る。再試行・監視の仕組みを使える',
      cons: '短所：同じ DB に置く場合だけ成り立つ。Rails 8 の既定は別の DB で、移すと気づかずに成り立たなくなる',
    },
  ]
  return (
    <Svg
      id="106-4"
      w={780}
      h={400}
      label="中継の3つの方式。ポーリングは、RelayOutboxJob が outbox_messages を数秒ごとに SELECT して CRM に送る。SQL と Active Job だけで作れるが、間隔だけ遅れ、問い合わせが増え、複数の中継では順序が崩れうる。トランザクションログを読む方式（CDC）は、Debezium が MySQL の binlog から outbox_messages への INSERT を読み、Kafka を経て受け取る側に届ける。遅れが小さく表を問い合わせないが、Debezium と Kafka の運用が要り、重複は防げない。同じ DB のジョブキューは、業務と同じ DB にある Solid Queue のジョブの表にジョブを積み、ワーカーが CRM に送る。ジョブを積むことが同じトランザクションに入るが、同じ DB に置く場合だけ成り立つ"
    >
      {rows.map((r) => {
        let x = 20
        return (
          <g key={r.y}>
            <T x={20} y={r.y + 12} fs={13} bold>
              {r.title}
            </T>
            {r.boxes.map((b, i) => {
              const bx = x
              x += b.w + 28
              return (
                <g key={i}>
                  <Box x={bx} y={r.y + 26} w={b.w} h={42} lines={b.lines} fs={12} fill={b.fill} subTone="muted" />
                  {i < r.boxes.length - 1 && <Arrow x1={bx + b.w} y1={r.y + 47} x2={bx + b.w + 26} y2={r.y + 47} />}
                </g>
              )
            })}
            <T x={20} y={r.y + 88} fs={12} tone="acc">
              {r.pros}
            </T>
            <T x={20} y={r.y + 106} fs={12} tone="danger">
              {r.cons}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 53,
  part: 9,
  title: 'Transactional Outbox：会員情報の変更を CRM へ確実に通知する',
  summary:
    '会員のメールアドレスを保存した後に CRM へ知らせるジョブを Sidekiq に積むと、ロールバックしたのにジョブが残ったり、コミットしたのにジョブが積まれなかったりします。送るメッセージを業務のデータと同じトランザクションで outbox_messages の表に書き、定期実行の中継のジョブが MySQL の SELECT … FOR UPDATE SKIP LOCKED で取り出して送る実装を Rails で作り、重複・順序・失敗し続ける行の扱いを RSpec で確かめます。',
  goals: [
    'DB の更新と、ジョブの投入や外部への送信の片方だけが成功する場合を、積む時点ごとに説明できる',
    '送るメッセージを outbox_messages の表に業務のデータと同じトランザクションで書き、中継のジョブで送るコードを Rails で書ける',
    'MySQL 8 の SELECT … FOR UPDATE SKIP LOCKED で、複数の中継が同じ行を同時に送らないようにできる',
    '少なくとも1回の配信で重複が起きる理由と、受け取る側がメッセージの ID で重複を捨てる必要を説明できる',
    '送る順序、送り終えた行の掃除と監視、失敗し続ける行の扱い、2相コミットを使わない理由を説明できる',
    'after_commit でジョブを積む方法、Solid Queue を同じ DB に置く方法、CDC（Debezium）との使い分けを判断できる',
  ],
  prerequisites: [18, 51, 52],
  sections: [
    {
      id: 'scene',
      title: '会員のメールアドレスの変更を CRM に知らせる場面と、片方だけが成功するコード',
      body: (
        <>
          <h3>そもそも何をするのか</h3>
          <p>
            会員制のサービスで、会員の情報を自社の DB と外部の CRM（顧客管理のサービス。会員へのお知らせのメールを CRM から送る）の両方に持っている場面を考えます。会員がマイページでメールアドレスを変えたら、DB の members テーブルを更新し、CRM にも新しいメールアドレスを知らせます。CRM が古いメールアドレスのままだと、お知らせのメールが届きません。CRM の API は HTTP で呼び、ときどき止まったり、応答が遅れたりします。
          </p>
          <p>
            DB の更新と CRM への通知は別々のシステムへの書き込みです。DB のトランザクションは CRM への送信を取り消せず、CRM への送信は DB のトランザクションに参加できません。1つの操作で DB と別のシステムの両方に書き込むことを、AWS の説明は<Term en="dual write">二重書き込み</Term>と呼び、このパターンが解決する問題としています<Ref n={4} />。
          </p>
          <h3>対策をしていないコード</h3>
          <p>
            CRM の API はリクエストの中では呼ばず、Sidekiq のジョブに任せていました。会員のモデルは、メールアドレスが変わったら <code>after_save</code> で CrmSyncJob を積みます。マイページの更新では、メールアドレスとニックネーム（profiles テーブル）を1つのトランザクションで変えます。
          </p>
          <Code
            lang="ruby"
            title="app/models/member.rb（対策をする前）"
            code={`
class Member < ApplicationRecord
  has_one :profile
  validates :email, presence: true

  # メールアドレスが変わったら、CRM に知らせるジョブを積む
  after_save -> { CrmSyncJob.perform_later(id, email) }, if: :saved_change_to_email?
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/members_controller.rb（対策をする前）"
            code={`
class MembersController < ActionController::API
  # PATCH /members/:id  会員のメールアドレスとニックネームを変える
  def update
    member = Member.find(params[:id])
    Member.transaction do
      member.update!(params.expect(member: [:email]))
      member.profile.update!(params.expect(profile: [:nickname]))
    end
    head :no_content
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/jobs/crm_sync_job.rb（対策をする前）"
            code={`
class CrmSyncJob < ApplicationJob
  queue_as :crm_sync

  def perform(member_id, email)
    CrmClient.new.deliver(event_id: SecureRandom.uuid, event_type: "member.email_changed",
                          payload: { member_id:, email: })
  end
end
`}
          />
          <p>
            CrmClient は CRM の API を呼ぶ Adapter で、後の rails-impl の節で示します。Profile にはニックネームを20文字までとする検証があります。
          </p>
          <h3>A：ロールバックしたのに、ジョブが残る</h3>
          <p>
            Active Job のアダプターを Sidekiq にし、メールアドレスと21文字のニックネームを一緒に送りました。ジョブは Redis の crm_sync キューに入ります。
          </p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4・Sidekiq 8.1.7。時刻とジョブの ID は省略）"
            code={`
== メールアドレスとニックネーム（21文字）を一緒に変える
  Member Load  SELECT \`members\`.* FROM \`members\` WHERE \`members\`.\`id\` = 1 LIMIT 1
  TRANSACTION  BEGIN
  Member Update  UPDATE \`members\` SET \`members\`.\`email\` = 'new@example.com', … WHERE \`members\`.\`id\` = 1
  Enqueued CrmSyncJob (Job ID: …) to Sidekiq(crm_sync) with arguments: 1, "new@example.com"
  Profile Load  SELECT \`profiles\`.* FROM \`profiles\` WHERE \`profiles\`.\`member_id\` = 1 LIMIT 1
  TRANSACTION  ROLLBACK
応答: 422 {"errors":["Nickname is too long (maximum is 20 characters)"]}
DB の email=old@example.com
Redis の crm_sync キュー: 1件 CrmSyncJob[1, "new@example.com"]
`}
          />
          <p>
            <code>after_save</code> はトランザクションの中で動くので、UPDATE の直後、COMMIT の前にジョブが Redis に入りました。続くニックネームの検証で失敗して ROLLBACK し、DB のメールアドレスは old@example.com に戻りましたが、Redis には new@example.com を知らせるジョブが残っています。Sidekiq がこのジョブを実行すると、CRM だけが保存されなかったメールアドレスになります。Redis は MySQL のトランザクションとは関係がないので、ROLLBACK してもジョブは消えません。トランザクションの中で <code>perform_later</code> を呼ぶとすぐに Redis に入ることは、<ChapterLink n={18} section="transaction" />でも確かめました。
          </p>
          <h3>B：コミットしたのに、ジョブが積まれない</h3>
          <p>
            A を直すために、コールバックを COMMIT の後に動く <code>after_save_commit</code> に変えました（<ChapterLink n={14} section="after-commit" />）。今度は、ジョブを積む時点で Redis に接続できない状態を作り、メールアドレスだけを変えました。
          </p>
          <Code
            lang="ruby"
            title="app/models/member.rb（COMMIT の後に積むように変えた）"
            code={`
class Member < ApplicationRecord
  has_one :profile
  validates :email, presence: true

  # COMMIT の後に、CRM に知らせるジョブを積む
  after_save_commit -> { CrmSyncJob.perform_later(id, email) }, if: :saved_change_to_email?
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Redis に接続できない状態。時刻とジョブの ID は省略）"
            code={`
== メールアドレスだけを変える（Redis に接続できない）
  TRANSACTION  BEGIN
  Member Update  UPDATE \`members\` SET \`members\`.\`email\` = 'new@example.com', … WHERE \`members\`.\`id\` = 1
  Profile Load  SELECT \`profiles\`.* FROM \`profiles\` WHERE \`profiles\`.\`member_id\` = 1 LIMIT 1
  TRANSACTION  COMMIT
  Failed enqueuing CrmSyncJob to Sidekiq(crm_sync): RedisClient::CannotConnectError (Connection refused …)
例外: RedisClient::CannotConnectError: Connection refused …
DB の email=new@example.com
Redis の crm_sync キュー: 0件
`}
          />
          <p>
            COMMIT の後に積もうとしたジョブは、Redis に接続できずに失敗しました。リクエストには 500 が返りますが、DB のメールアドレスはすでに new@example.com に変わっています。CRM に知らせるジョブはどこにもなく、知らせるべきだったという記録も残っていません。COMMIT の直後にプロセスが止まった場合（配備での再起動、メモリー不足で強制終了されるなど）も、同じ状態になります。
          </p>
          <Figure n="106-1" title="DB の更新とジョブの投入の、片方だけが成功する" caption="上の2つの実行結果を、関係者ごとの列に並べた図。上から下へ時間が進む。× は失敗した投入。">
            <PartialFailureFigure />
          </Figure>
          <p>
            図 106-1 の左（A）はトランザクションの中でジョブを積む場合で、DB の変更は取り消されたのにジョブが残ります。右（B）は COMMIT の後に積む場合で、DB の変更は確定したのにジョブがありません。ジョブを積む時点をどちらにしても、DB と Redis の片方だけが変わる場合が残ります。Sidekiq のジョブの代わりにリクエストの中で CRM の API を直接呼んでも同じで、トランザクションの中で呼べば A と同じく CRM だけが変わることがあり、COMMIT の後に呼べば B と同じく CRM に届かないことがあります。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>トランザクションの中で積むと、ROLLBACK してもジョブが残り、CRM だけが保存されなかった値になる（A）。</li>
            <li>COMMIT の後に積むと、積む前に Redis が止まるかプロセスが止まったときに、CRM に届かない。送るべきだった記録も残らないので、後から送り直せない（B）。</li>
            <li>CRM への送信に失敗したとき、どの会員の変更が届いていないのかを DB から調べられない。</li>
          </ul>
          <p>運用中のアプリでは、次のような兆候からこの問題に気づきます。</p>
          <ul>
            <li>DB の更新の後に、外部の API やメッセージブローカー（Kafka のように、メッセージを受け取って受け取る側に届けるサーバー）への送信やジョブの投入を、そのまま呼んでいる。</li>
            <li>外部のサービスと DB の内容が、ときどき食い違う。原因がログから分からない。</li>
            <li>外部のサービスや Redis が止まっていた間の変更を、手作業で送り直したことがある。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'idea',
      title: '送るメッセージを、業務のデータと同じトランザクションで記録する考え方',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term>Transactional Outbox</Term> は、DB の更新と、それを外部に知らせるメッセージの送信の、片方だけが起きることがないようにするパターンです。送るメッセージを、業務のデータを更新するのと同じトランザクションで、DB の <Term>outbox</Term>（送信を待つメッセージを入れる表）に INSERT します。実際にメッセージを送るのは、outbox の表を読んで送る別の処理で、この章ではこの処理を<Term en="message relay">中継</Term>と呼びます。
          </p>
          <p>
            Chris Richardson の microservices.io は、このパターンを次の状況への解決として説明しています。DB の更新とメッセージの送信は、両方起きるか、どちらも起きないかにする必要があります。しかし、DB とメッセージの送り先にまたがる2相コミット（後で説明します）は使えません<Ref n={1} />。図 106-1 の A と B は、どちらもこの条件を満たしていませんでした。
          </p>
          <p>
            <ChapterLink n={34} section="external-boundaries" />では、注文の受付で課金の依頼を OutboxEvent として保存し、配送役のジョブがリースを取ってから課金のジョブを積む実装を示しました。この章では、その仕組みを1つのパターンとして取り出し、表の設計、中継の作り方、重複・順序・失敗し続ける行・掃除と監視までを扱います。
          </p>
          <h3>使う場面</h3>
          <ul>
            <li>DB の更新を、外部のサービス（CRM、検索のサービス、分析の基盤など）やメッセージブローカーに必ず伝える必要があり、伝わらないと業務に影響が出る。</li>
            <li>送り先が止まっていても、業務の処理（メールアドレスの変更）は受け付けたい。</li>
            <li>ジョブキューが Redis のように業務の DB とは別の場所にあり、ジョブを積むことが DB のトランザクションに入らない。</li>
          </ul>
          <h3>設計上の制約</h3>
          <ul>
            <li>DB の更新と外部への送信は、両方起きるか、どちらも起きないかにしたい。一方で、DB と外部のサービスにまたがるトランザクションは使えない。</li>
            <li>外部のサービスが止まっていても、業務の処理は受け付けたい。</li>
            <li>送信に失敗したら送り直したい。一方で、送り直すと、同じメッセージが2回届くことがある。</li>
            <li>同じ会員の変更は、起きた順に届けたい。一方で、送る処理を複数動かすと、順序が崩れやすい。</li>
          </ul>
          <h3>解決方法：outbox の表に同じトランザクションで書き、中継が送る</h3>
          <p>
            メールアドレスを変える処理は、CRM に送らず、ジョブも積みません。代わりに、送るメッセージを outbox_messages の表に INSERT します。members の UPDATE と outbox_messages の INSERT は同じ MySQL のトランザクションなので、両方が確定するか、両方が取り消されます。図 106-1 の A のように取り消されたのにメッセージが残ることはなく、B のように確定したのに記録がないこともありません。送れなかった場合も、送る必要があるという記録が業務のデータと一緒に outbox に残っているので、後で送り直せます。
          </p>
          <Figure n="106-2" title="Transactional Outbox の構成" caption="この章の Rails のクラスとテーブルの関係。破線の枠は1つの DB トランザクション。①〜③は中継のジョブが行う順番。">
            <OutboxFigure />
          </Figure>
          <p>
            図 106-2 の左の枠が業務の処理のトランザクションで、members の更新と outbox_messages への INSERT を一緒に確定します。右の中継のジョブ（RelayOutboxJob）は定期的に動き、未送信の行を書いた順に取り出して CRM に送り（①②）、送れたら送信した日時（<code>sent_at</code>）を記録します（③）。送信に失敗したら記録せずに残し、次の回に送り直します。
          </p>
          <p>
            中継を作る方法として、microservices.io は、outbox の表を定期的に問い合わせる方法（Polling publisher）と、DB のトランザクションログを読む方法（Transaction log tailing）の2つを挙げています<Ref n={1} />。この章のコードは前者で、後者は alternatives の節で比べます。
          </p>
          <h3>少なくとも1回の配信と、受け取る側の重複排除</h3>
          <p>
            中継は送った後、<code>sent_at</code> を記録する前に止まることがあります。CRM が受け取って処理したのに、応答が届かずタイムアウトすることもあります。どちらの場合も行は未送信のまま残るので、次の回に同じメッセージがもう一度送られます。
          </p>
          <Figure n="106-3" title="重複した配信と、受け取る側での重複排除" caption="上から下へ時間が進む。破線の矢印は応答、× は届かなかった応答。青い枠と矢印は、2回目の配信を受け取る側が捨てる流れ。">
            <DuplicateFigure />
          </Figure>
          <p>
            図 106-3 では、ev-1 が CRM に2回届いています。outbox のメッセージは失われませんが、2回以上届くことがあります。この性質を少なくとも1回の配信と呼び、配信の保証の3種類は<ChapterLink n={52} section="delivery-guarantees" />で扱いました。microservices.io も、中継が送った後、送ったことを記録する前に止まると、再起動後に同じメッセージをもう一度送ると書いており、受け取る側は処理済みのメッセージの ID を記録するなどして、同じメッセージを2回処理しても結果が変わらないようにする必要があるとしています<Ref n={1} />。AWS の説明も同じ注意をしています<Ref n={4} />。この章のメッセージは、受け取る側が重複を見分けられるように、メッセージの ID（<code>event_id</code>）を持ちます。受け取る側の作り方は、<ChapterLink n={52} section="webhook" />の Webhook の受け手と同じです。
          </p>
          <h3>構造</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">この章のクラス・テーブル</th>
                  <th scope="col">受け持つこと</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">outbox の表</th>
                  <td>outbox_messages・<code>OutboxMessage</code></td>
                  <td>送るメッセージ、メッセージの ID、書いた順の番号（id）、送った日時、送信を試した回数、最後のエラー、送信を諦めた日時を持つ</td>
                </tr>
                <tr>
                  <th scope="row">業務の処理</th>
                  <td><code>ChangeMemberEmail</code>（MembersController から呼ぶ）</td>
                  <td>業務のデータの更新と outbox への INSERT を、同じトランザクションで行う。送らない</td>
                </tr>
                <tr>
                  <th scope="row">中継</th>
                  <td><code>RelayOutboxJob</code></td>
                  <td>未送信の行を書いた順に取り出して送り、送れたら <code>sent_at</code> を記録する。失敗したら回数とエラーを記録して残す</td>
                </tr>
                <tr>
                  <th scope="row">送り先の Adapter</th>
                  <td><code>CrmClient</code></td>
                  <td>CRM の API を呼び、失敗を <code>CrmClient::Error</code> にまとめる。メッセージの ID を Idempotency-Key ヘッダーにも入れる</td>
                </tr>
                <tr>
                  <th scope="row">受け取る側</th>
                  <td>CRM（テストでは <code>FakeCrm</code>）</td>
                  <td>メッセージの ID で重複を捨てる</td>
                </tr>
                <tr>
                  <th scope="row">掃除と監視</th>
                  <td><code>OutboxMessage.purge_sent</code>・<code>.stats</code></td>
                  <td>送り終えて時間がたった行を消す。未送信の件数と古さ、送信を諦めた件数を調べる</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装：outbox_messages と中継のジョブ',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  controllers/members_controller.rb   # ChangeMemberEmail を呼ぶ
  models/member.rb                    # コールバックでジョブを積むのをやめる
  models/outbox_message.rb            # 未送信の行、送信の記録、掃除と監視
  services/change_member_email.rb     # 会員の更新と outbox への INSERT
  jobs/relay_outbox_job.rb            # 中継のジョブ（定期実行）
  clients/crm_client.rb               # CRM の API を呼ぶ Adapter
db/migrate/20261121000002_create_outbox_messages.rb
spec/support/fake_crm.rb              # 重複を捨てる CRM の代役
`}
          />
          <p>対策をする前の CrmSyncJob は削除し、Member の <code>after_save_commit</code> も外します。</p>
          <h3>マイグレーション</h3>
          <Code
            lang="ruby"
            title="db/migrate/20261121000002_create_outbox_messages.rb"
            code={`
class CreateOutboxMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :outbox_messages do |t|
      t.string :event_id, null: false, index: { unique: true } # 受け取る側が重複を見分けるための ID
      t.string :event_type, null: false
      t.string :aggregate_id, null: false # メッセージの対象（ここでは会員の ID）
      t.json :payload, null: false # 外部に公開する形のメッセージ
      t.datetime :sent_at # 送った日時。NULL なら未送信
      t.datetime :failed_at # 送信を諦めた日時。人が調べる
      t.integer :attempts, null: false, default: 0
      t.text :last_error
      t.datetime :created_at, null: false
      t.index [:sent_at, :failed_at] # 未送信の行を id の順に探す
    end
  end
end
`}
          />
          <p>
            <code>id</code>（AUTO_INCREMENT）は書いた順の番号で、送る順に使います。<code>event_id</code> は受け取る側が重複を見分けるための ID で、一意索引を付けます。<code>aggregate_id</code> は対象の会員を識別します。ID が同じでも、中継だけでは配信順を保証できません。どの範囲の変更を一緒に扱うかの考え方は<ChapterLink n={48} section="aggregate" />で扱いました。
          </p>
          <p>
            MSDP の元の例は PostgreSQL の部分インデックス（<code>WHERE sent_at IS NULL</code> の行だけの索引）で未送信の行を探していました。MySQL には部分インデックスがないので、<code>(sent_at, failed_at)</code> の索引を付けました。InnoDB の索引の各項目には主キーも入っているので、<code>sent_at IS NULL AND failed_at IS NULL</code> の項目は id の順に並びます。後の EXPLAIN のとおり、MySQL は並べ替え（filesort）をせずにこの索引で未送信の行を id の順に読みます。送信済みの行は掃除で消すので、索引も大きくなり続けません。
          </p>
          <h3>メッセージの記録：OutboxMessage と ChangeMemberEmail</h3>
          <Code
            lang="ruby"
            title="app/models/outbox_message.rb"
            code={`
class OutboxMessage < ApplicationRecord
  MAX_ATTEMPTS = 10 # これだけ失敗したら送信を諦め、人が調べる

  attribute :event_id, :string, default: -> { SecureRandom.uuid }

  scope :pending, -> { where(sent_at: nil, failed_at: nil).order(:id) }

  def self.purge_sent(before: 7.days.ago) = where(sent_at: ...before).delete_all

  # 監視用。未送信の件数、いちばん古い未送信の行の作成日時、送信を諦めた件数
  def self.stats
    { pending: pending.count, oldest_pending_at: pending.minimum(:created_at), failed: where.not(failed_at: nil).count }
  end

  def mark_sent! = update!(sent_at: Time.current, attempts: attempts + 1)

  def mark_deferred!(error) = update!(last_error: error.message)

  def mark_failed!(error)
    update!(attempts: attempts + 1, last_error: error.message,
            failed_at: (Time.current if attempts + 1 >= MAX_ATTEMPTS))
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/services/change_member_email.rb"
            code={`
class ChangeMemberEmail
  # 会員の更新と、CRM に送るメッセージの記録を、同じトランザクションで行う。ここでは送らない
  def call(member:, email:)
    Member.transaction do
      member.update!(email:)
      next unless member.saved_change_to_email?

      OutboxMessage.create!(event_type: "member.email_changed", aggregate_id: member.id.to_s,
                            payload: { member_id: member.id, email: })
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/members_controller.rb"
            code={`
class MembersController < ActionController::API
  # PATCH /members/:id  会員のメールアドレスとニックネームを変える
  def update
    member = Member.find(params[:id])
    Member.transaction do
      ChangeMemberEmail.new.call(member:, email: params.expect(member: [:email])[:email])
      member.profile.update!(params.expect(profile: [:nickname]))
    end
    head :no_content
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end
end
`}
          />
          <p>
            <code>attribute :event_id, default:</code> は、新しいオブジェクトを作るたびにブロックを呼んで UUID を入れます（Attributes API は<ChapterLink n={11} section="attribute-api" />）。ChangeMemberEmail の <code>Member.transaction</code> は、コントローラーのトランザクションの中で呼ばれると外側のトランザクションに加わるので（<ChapterLink n={15} section="nested" />）、ニックネームの更新が失敗すれば outbox_messages の行も一緒に取り消されます。メールアドレスが変わっていなければ、メッセージは記録しません。
          </p>
          <p>
            outbox に入れる <code>payload</code> は、CRM に公開する形にします。会員のモデルの属性や、アプリの中で使うドメインイベント（<ChapterLink n={51} section="idea" />）の項目をそのまま入れると、内部の名前を変えただけで受け取る側が壊れます（anti-patterns の節）。
          </p>
          <p>
            メッセージを記録する処理は、<code>after_save</code> のコールバックに書くこともできます。<code>after_save</code> はトランザクションの中で動くので、outbox への INSERT は業務の更新と一緒に確定・取り消しされます。ただし、どの経路の保存でもメッセージが記録されるので、管理画面の一括修正やデータの移行でも CRM に通知が送られます。業務の操作として通知するかどうかを決めたいので、この章ではサービスのクラスに書きました（<ChapterLink n={30} section="callback-design" />）。
          </p>
          <h3>中継のジョブ：RelayOutboxJob</h3>
          <Code
            lang="ruby"
            title="app/jobs/relay_outbox_job.rb"
            code={`
# 中継のジョブ。ロックを取得できた未送信行を id 順に送る。数秒〜数十秒ごとに定期実行する
class RelayOutboxJob < ApplicationJob
  # 送った件数を返す
  def perform(batch_size: 10, crm: CrmClient.new)
    sent = 0
    OutboxMessage.transaction do
      # ほかの中継がロックしている行は、待たずに飛ばす。
      # CRM に送っている間も、取り出した行のロックとトランザクションを持ち続ける
      OutboxMessage.pending.lock("FOR UPDATE SKIP LOCKED").limit(batch_size).each do |message|
        crm.deliver(event_id: message.event_id, event_type: message.event_type, payload: message.payload)
        message.mark_sent!
        sent += 1
      rescue CrmClient::TransientError => e
        message.mark_deferred!(e)
        break # 送り先が一時的に使えない間は、この回の処理を止める
      rescue CrmClient::Error => e
        message.mark_failed!(e)
        break
      end
    end
    sent
  end
end
`}
          />
          <p>
            中継のジョブは未送信の行を <code>FOR UPDATE SKIP LOCKED</code> で id の順に最大10件取り出し、1件ずつ CRM に送ります。送れたら <code>mark_sent!</code> で <code>sent_at</code> を記録し、一時的な障害では <code>mark_deferred!</code> で最後のエラーを記録し、失敗の上限を消費せずに次回を待ちます。その他の送信エラーは <code>mark_failed!</code> で回数とエラーを記録します。どちらもその回の残りの送信は止めます。<code>do … end</code> のブロックの中に直接 <code>rescue</code> を書くと、その回の繰り返しで起きた例外だけを rescue します。
          </p>
          <p>
            <code>lock("FOR UPDATE SKIP LOCKED")</code> は、SELECT の末尾に <code>FOR UPDATE SKIP LOCKED</code> を付けます。<code>FOR UPDATE</code> は読んだ行に排他ロックを取り（<ChapterLink n={15} section="pessimistic" />）、<code>SKIP LOCKED</code> はほかのトランザクションがロックしている行を待たずに結果から除きます。MySQL では 8.0 から使えます。MySQL のマニュアルは、ロックされた行を飛ばすとデータの一貫しない見え方になるので一般のトランザクションの処理には向かないが、キューのように使う表を複数のセッションが読むときにロックの競合を避けるために使えると説明しています<Ref n={5} />。中継を2つ以上動かしても、片方がロックした行はもう片方が飛ばすので、同じ行を同時に送ることはありません。
          </p>
          <Code
            lang="text"
            title="実行結果（script/skip_locked.rb。未送信の行が6件あるとき。時刻は省略）"
            code={`
== EXPLAIN
  key=index_outbox_messages_on_sent_at_and_failed_at rows=6 Extra=Using index condition
== A と B が同時に3件ずつ取り出す
A: [1, 2, 3] をロックした
  TRANSACTION  BEGIN
  OutboxMessage Ids  SELECT \`outbox_messages\`.\`id\` FROM \`outbox_messages\`
                     WHERE \`outbox_messages\`.\`sent_at\` IS NULL AND \`outbox_messages\`.\`failed_at\` IS NULL
                     ORDER BY \`outbox_messages\`.\`id\` ASC LIMIT 3 FOR UPDATE SKIP LOCKED
B: [4, 5, 6] をロックした（A がロックしている行は待たずに飛ばした）
== 中継のジョブ
  TRANSACTION  BEGIN
  OutboxMessage Load  SELECT \`outbox_messages\`.* FROM \`outbox_messages\` WHERE … LIMIT 2 FOR UPDATE SKIP LOCKED
  OutboxMessage Update  UPDATE \`outbox_messages\` SET \`sent_at\` = '…', \`attempts\` = 1 WHERE \`outbox_messages\`.\`id\` = 1
  OutboxMessage Update  UPDATE \`outbox_messages\` SET \`sent_at\` = '…', \`attempts\` = 1 WHERE \`outbox_messages\`.\`id\` = 2
  TRANSACTION  COMMIT
送った件数=2 stats={pending: 4, oldest_pending_at: 2026-11-21 02:46:12 +0900, failed: 0}
`}
          />
          <p>
            EXPLAIN の Extra に Using filesort がないので、索引の順に読んでいます。A が 1〜3 の行をロックしたまま待っている間に、B は同じ SELECT で 4〜6 を受け取りました。中継のジョブは取り出した行を1件ずつ送り、<code>sent_at</code> の UPDATE と一緒に COMMIT しています。
          </p>
          <p>
            このジョブは CRM に送っている間も行のロックとトランザクションを持ち続けます。CrmClient のタイムアウト（接続 2 秒、応答 5 秒）を短くしているのはこのためで、送り先が遅いとロックを持つ時間とトランザクションが長くなります。送り先が遅い場合は、<ChapterLink n={34} section="external-boundaries" />の OutboxDispatchJob のように、条件付きの UPDATE で期限付きの担当（リース）を取ってトランザクションを終えてから送る方式にします。
          </p>
          <h3>送り先の Adapter：CrmClient</h3>
          <Code
            lang="ruby"
            title="app/clients/crm_client.rb"
            code={`
# CRM の API を呼ぶ Adapter。送り先の URL は環境変数で決める
class CrmClient
  class Error < StandardError; end
  class TransientError < Error; end

  def initialize(url: ENV.fetch("CRM_URL", "https://crm.example.com"))
    @http = Faraday.new(url:) do |f|
      f.options.open_timeout = 2
      f.options.timeout = 5
    end
  end

  # 受け取る側が重複を見分けられるように、event_id を Idempotency-Key ヘッダーにも入れる
  def deliver(event_id:, event_type:, payload:)
    res = @http.post("/events", { event_id:, type: event_type, data: payload }.to_json,
                     "Content-Type" => "application/json", "Idempotency-Key" => event_id)
    return if res.success?

    error = res.status == 429 || (500..599).cover?(res.status) ? TransientError : Error
    raise error, "CRM が #{res.status} を返した"
  rescue Faraday::ConnectionFailed, Faraday::TimeoutError => e
    raise TransientError, e.class.name
  rescue Faraday::Error => e
    raise Error, e.class.name
  end
end
`}
          />
          <p>
            この例では接続失敗・タイムアウト・429・5xx を一時エラーとして扱います。実際には API の契約で再試行できる応答を確認し、429 に Retry-After があれば次回の時刻に反映します。Faraday のエラー名を記録し、応答の本文は保存しません。中継が捕まえるのは <code>CrmClient::Error</code> 系の例外です。ほかの例外はジョブの失敗になります。CRM が Idempotency-Key ヘッダーを受け付けるなら、同じ <code>event_id</code> の2回目のリクエストを CRM の側で捨てられます（<ChapterLink n={52} section="idea" />）。外部の API を Adapter に分ける理由は<ChapterLink n={33} section="adapters" />で扱いました。
          </p>
          <h3>実行して確かめる</h3>
          <p>scene の節の A と同じリクエストを、パターンを適用した後のコードに送りました。続けて、ニックネームを直して送りました。</p>
          <Code
            lang="text"
            title="実行結果（script/after.rb。時刻と event_id は省略）"
            code={`
== メールアドレスを変える（ニックネーム（21文字）の検証で失敗する）
  TRANSACTION  BEGIN
  Member Update  UPDATE \`members\` SET \`members\`.\`email\` = 'new@example.com', … WHERE \`members\`.\`id\` = 1
  OutboxMessage Create  INSERT INTO \`outbox_messages\` (\`event_id\`, \`event_type\`, \`aggregate_id\`, \`payload\`, …)
                        VALUES ('…', 'member.email_changed', '1', '{\\"member_id\\":1,\\"email\\":\\"new@example.com\\"}', …)
  Profile Load  SELECT \`profiles\`.* FROM \`profiles\` WHERE \`profiles\`.\`member_id\` = 1 LIMIT 1
  TRANSACTION  ROLLBACK
応答: 422  DB の email=old@example.com  outbox_messages=[]
== メールアドレスを変える（成功する）
  TRANSACTION  BEGIN
  Member Update  UPDATE \`members\` SET \`members\`.\`email\` = 'new@example.com', … WHERE \`members\`.\`id\` = 1
  OutboxMessage Create  INSERT INTO \`outbox_messages\` (…) VALUES ('…', 'member.email_changed', '1', '{…}', …)
  Profile Load  SELECT \`profiles\`.* FROM \`profiles\` WHERE \`profiles\`.\`member_id\` = 1 LIMIT 1
  TRANSACTION  COMMIT
応答: 204  DB の email=new@example.com  outbox_messages=[[2, "member.email_changed", nil]]
`}
          />
          <p>
            1回目は、outbox_messages への INSERT が members の UPDATE と同じトランザクションに入り、ROLLBACK で両方が取り消されました。2回目は両方が一緒に COMMIT され、未送信（<code>sent_at</code> が nil）の行が1件残りました。この行は、次に中継のジョブが動いたときに送られます。Redis が止まっていても、メールアドレスの変更は受け付けられます。
          </p>
          <h3>中継のジョブを動かす</h3>
          <p>
            中継のジョブは、数秒〜数十秒ごとに定期実行します。Solid Queue なら config/recurring.yml に書けます。定期実行の設定と、止まったことに気づくための監視は<ChapterLink n={18} section="recurring-jobs" />で扱いました。間隔を待たずに送りたい場合は、COMMIT の後に <code>RelayOutboxJob.perform_later</code> を積むこともできます。その投入が失われても、行が残っているので定期実行で送られます（<ChapterLink n={34} section="external-boundaries" />の受付のトランザクション）。
          </p>
          <h3>送る順序</h3>
          <p>
            同じ会員のメールアドレスを2回変えたとき、CRM に古い方の変更が後から届くと、CRM には古いメールアドレスが残ります。microservices.io は、メッセージはサービスが作った順にメッセージブローカーへ送る必要があるとしています<Ref n={1} />。この章の中継は、id の順に送り、送信に失敗したらその後の行は次の回に回します。
          </p>
          <p>ただし、id の順と COMMIT の順は一致しないことがあります。1件目のトランザクションを確定させずに止め、その間に別の会員の変更を確定させて、中継から見える行を調べました。</p>
          <Code
            lang="text"
            title="実行結果（script/commit_order.rb）"
            code={`
未確定の行の id=2  中継に見えた行=[1, 3]
確定した後に中継に見える行=[1, 2, 3]
`}
          />
          <p>
            id は INSERT の時点で決まるので、id 2 の行が COMMIT される前に、中継は id 3 の行を送ることがあります。同じ会員の変更なら、2つ目のトランザクションの members の UPDATE が1つ目の行ロックを待つので、outbox の行は COMMIT の順に id が付きます（ChangeMemberEmail は UPDATE の後に INSERT します）。別の会員どうしの順序は入れ替わりますが、メールアドレスの変更では問題になりません。
          </p>
          <p>
            中継を複数動かした場合も、片方が失敗した行を残している間に、もう片方が同じ会員の後の行を送ることがあります。1つの中継であっても、失敗行を除外して後続行を送ったあとに失敗行を戻すと順序は逆転します。すべての変更を順に届ける要件なら、会員ごとに採番し、先行行が成功するまで同じ会員の後続行を送らない設計が必要です。最新の値だけ必要なら、会員の更新ごとに増える番号をメッセージに含め、受信側は適用済みの番号より大きい場合だけ反映します。
          </p>
          <h3>失敗し続ける行の扱い</h3>
          <p>
            中継は失敗した行でその回の処理を止めます。CRM が受け付けない内容の行が先頭に残ると、後の行も待ち続けます。<code>mark_failed!</code> は、上限の対象となる失敗が <code>MAX_ATTEMPTS</code>（10回）に達した行に <code>failed_at</code> を記録します。ネットワークの一時障害だけで行を除外すると、障害が直ったあとも通知が欠落するため、その失敗は上限に数えません。<code>pending</code> のスコープは <code>failed_at</code> のある行を含まないので、次の回からは後の行が送られます。<code>failed_at</code> の付いた行は、<code>last_error</code> を見て人が原因を調べ、直したら <code>failed_at</code> と失敗回数を戻して送り直します。受信側で適用済みの更新番号を確認し、古い内容が新しい内容を上書きしないようにします。再試行の間隔を空ける方法は<ChapterLink n={54} section="idea" />の Retry with Backoff で扱います。
          </p>
          <h3>送り終えた行の掃除と監視</h3>
          <ul>
            <li>掃除：送り終えた行を残しておくと、表と索引が大きくなり続けます。<code>OutboxMessage.purge_sent</code> は、送ってから7日を過ぎた行を消します。調査に使うために、すぐには消さずに期間を置きます。定期実行のジョブから呼びます。</li>
            <li>監視：<code>OutboxMessage.stats</code> で、未送信の件数、いちばん古い未送信の行の作成日時、送信を諦めた件数を調べ、監視の仕組みに送ります。古い未送信の行が残り続けていれば、中継のジョブが止まっているか、CRM が止まっています。送信を諦めた行が増えたら、人が調べます。</li>
          </ul>
          <h3>2相コミットを使わない理由</h3>
          <p>
            DB とメッセージの送り先の両方を参加させ、全体を1つのトランザクションとして確定する仕組みを、<Term en="two-phase commit">2相コミット</Term>（2PC）と呼びます。トランザクションマネージャーが、参加するすべての側に確定の準備をさせる段階と、全員で確定する段階の、2つの段階で進めます。MySQL の InnoDB も XA トランザクションとして2相コミットに対応しています<Ref n={6} />。しかし microservices.io は、DB やメッセージの送り先が2相コミットに対応していないことがあり、サービスを両方に結びつけるのも望ましくないとしています<Ref n={1} />。CRM のような HTTP の API と Redis は、そもそも MySQL の XA トランザクションに参加できません。
          </p>
          <h3>Solid Queue を同じ DB に置く場合</h3>
          <p>
            Solid Queue はジョブを DB の表に保存します（<ChapterLink n={18} section="solid-queue" />）。Rails のガイドは、Solid Queue がアプリケーションと同じ DB を使う場合、ジョブを積むことが周りの Active Record の操作と同じトランザクションに入り、トランザクションがロールバックされればジョブは積まれず、ジョブを積めなければトランザクションも COMMIT されないと説明しています<Ref n={9} />。この場合、CrmSyncJob を ChangeMemberEmail のトランザクションの中で積めば、ジョブの行が outbox の行と同じ働きをします。
          </p>
          <p>
            ただし、同じガイドは、Rails 8 が Solid Queue を既定で別の DB に置くのはこの性質に暗黙に頼らないためで、この性質に頼った作りは、後で Solid Queue を別の DB に移したり別のバックエンドに替えたりしたときに、気づかないうちに成り立たなくなると注意しています<Ref n={9} />。この性質に頼るなら、その前提を設計の文書とテストに書いておきます。この本の環境は Sidekiq（Redis）なので、outbox の表を使います。
          </p>
          <h3>パターンを使っていないコードから直していく順序</h3>
          <ol>
            <li>outbox の表を作る：送るメッセージ、書いた順の番号、メッセージの ID、送った日時、送信を試した回数、最後のエラーを持たせる。</li>
            <li>送信とジョブの投入を INSERT に置き換える：業務の処理の中の CRM の呼び出しや <code>perform_later</code> を、同じトランザクションでの outbox への INSERT に置き換える。コールバックで積んでいたなら、サービスのクラスに移す。</li>
            <li>中継のジョブを作る：未送信の行を書いた順に SKIP LOCKED で取り出して送り、送れたら <code>sent_at</code> を記録する。定期的に動かす。</li>
            <li>受け取る側で重複を捨てる：メッセージの ID を記録し、処理済みなら何もしない（<ChapterLink n={52} section="webhook" />）。送り先を変えられないなら、Idempotency-Key などの重複を扱う機能があるかを確かめる。</li>
            <li>掃除と監視を入れる：古い送信済みの行を消し、未送信の行の数と古さ、送信を諦めた行の数を監視する。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストで片方だけの成功・重複・順序を確かめる',
      body: (
        <>
          <p>この章のテストで確かめることは次のとおりです。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">確かめること</th>
                  <th scope="col">spec</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>会員の更新と outbox の行が同じトランザクションで書かれ、後の更新が失敗すれば両方が残らない</td>
                  <td>spec/requests/members_spec.rb</td>
                </tr>
                <tr>
                  <td>中継が送って <code>sent_at</code> を記録する。CRM が止まっていたら残し、次の回に順に送る。応答が失われると2回届き、CRM が重複を捨てる。失敗し続ける行を諦めて後の行を送る。古い行を消す</td>
                  <td>spec/jobs/relay_outbox_job_spec.rb</td>
                </tr>
                <tr>
                  <td>2つの中継を同時に動かしても、同じ行を二重に送らない</td>
                  <td>spec/jobs/relay_outbox_concurrency_spec.rb（別々の DB 接続）</td>
                </tr>
                <tr>
                  <td>CrmClient が event_id を Idempotency-Key に入れ、2xx 以外とタイムアウトを CrmClient::Error にする</td>
                  <td>spec/clients/crm_client_spec.rb（WebMock）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>重複を捨てる CRM の代役</h3>
          <Code
            lang="ruby"
            title="spec/support/fake_crm.rb"
            code={`
# テスト用の CRM。受け取る側として、event_id で重複を捨てる
class FakeCrm
  attr_reader :received, :emails
  attr_accessor :down_times, :timeout_times, :reject_times

  def initialize
    @received = [] # 届いたメッセージ（重複を含む）
    @emails = {} # CRM 側の会員のメールアドレス
    @processed = Set.new
    @down_times = 0 # 次の n 回は、受け取らずに失敗する（止まっている）
    @timeout_times = 0 # 次の n 回は、受け取って処理したのに、応答が届かずに失敗する
    @reject_times = 0 # 次の n 回は、内容が受け付けられない
    @lock = Mutex.new # 2つの中継から同時に呼ばれる
  end

  def deliver(event_id:, event_type:, payload:)
    @lock.synchronize do
      if down_times.positive?
        self.down_times -= 1
        raise CrmClient::TransientError, "CRM に接続できない"
      end
      if reject_times.positive?
        self.reject_times -= 1
        raise CrmClient::Error, "CRM が内容を受け付けなかった"
      end
      received << event_id
      emails[payload["member_id"]] = payload["email"] if @processed.add?(event_id) # 処理済みの ID なら何もしない
      if timeout_times.positive?
        self.timeout_times -= 1
        raise CrmClient::TransientError, "応答がタイムアウトした"
      end
    end
  end
end
`}
          />
          <p>
            代役は CrmClient と同じ <code>deliver</code> を持ち、中継のジョブには <code>perform_now(crm:)</code> で渡します。<code>Set#add?</code> は、要素を加えたら self を、すでにあれば nil を返すので、初めての <code>event_id</code> のときだけ会員のメールアドレスを反映します。<code>timeout_times</code> を設定すると、受け取って処理した後で例外を投げ、図 106-3 の状態を作れます。
          </p>
          <h3>同じトランザクションで書かれることのテスト</h3>
          <Code
            lang="ruby"
            title="spec/requests/members_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "PATCH /members/:id", type: :request do
  let(:member) { Member.create!(name: "佐藤", email: "old@example.com").tap { it.create_profile!(nickname: "さとう") } }

  def update(email:, nickname:)
    patch "/members/#{member.id}", params: { member: { email: }, profile: { nickname: } }, as: :json
  end

  it "会員の更新と outbox の行を同じトランザクションで書く。送るのは中継のジョブ" do
    update(email: "new@example.com", nickname: "さとう")

    expect(response).to have_http_status(:no_content)
    expect(OutboxMessage.sole).to have_attributes(
      event_type: "member.email_changed", sent_at: nil,
      payload: { "member_id" => member.id, "email" => "new@example.com" },
    )
  end

  it "同じトランザクションの後の更新が失敗したら、会員の変更も outbox の行も残らない" do
    update(email: "new@example.com", nickname: "あ" * 21)

    expect(response).to have_http_status(:unprocessable_content)
    expect(member.reload.email).to eq("old@example.com")
    expect(OutboxMessage.count).to eq(0)
  end
end
`}
          />
          <p>
            業務の処理のテストは outbox に正しい行が書かれたかを確かめるだけで済み、CRM の代役はいりません。テストのトランザクションの中では、コントローラーのトランザクションは SAVEPOINT になり、ROLLBACK TO SAVEPOINT で取り消されます（<ChapterLink n={20} section="transaction" />）。
          </p>
          <h3>中継のジョブのテスト</h3>
          <Code
            lang="ruby"
            title="spec/jobs/relay_outbox_job_spec.rb"
            code={`
require "rails_helper"

RSpec.describe RelayOutboxJob do
  let(:crm) { FakeCrm.new }
  let(:member) { Member.create!(name: "佐藤", email: "old@example.com") }

  def change(email) = ChangeMemberEmail.new.call(member:, email:)
  def relay = described_class.perform_now(crm:)

  it "未送信の行を送り、sent_at を記録する" do
    change("new@example.com")

    expect(relay).to eq(1)
    expect(crm.emails[member.id]).to eq("new@example.com")
    expect(OutboxMessage.sole.sent_at).to be_present
    expect(OutboxMessage.stats).to eq(pending: 0, oldest_pending_at: nil, failed: 0)
  end

  it "CRM が止まっていたら未送信のまま残し、後の行も送らない。次の回に書いた順に送る" do
    change("first@example.com")
    change("second@example.com")
    crm.down_times = 1

    expect(relay).to eq(0)
    expect(OutboxMessage.pending.pluck(:attempts, :last_error)).to eq([[0, "CRM に接続できない"], [0, nil]])
    expect(relay).to eq(2)
    expect(crm.emails[member.id]).to eq("second@example.com")
  end

  it "CRM が受け取った後に応答が失われると、同じメッセージがもう一度届く。CRM は event_id で重複を捨てる" do
    change("new@example.com")
    crm.timeout_times = 1

    relay # CRM は処理したが、中継は失敗とみなす
    relay # もう一度送る

    event_id = OutboxMessage.sole.event_id
    expect(crm.received).to eq([event_id, event_id]) # 少なくとも1回の配信：2回届いた
    expect(crm.emails[member.id]).to eq("new@example.com")
  end

  it "MAX_ATTEMPTS 回失敗した行は送信を諦め、後の行を送る" do
    change("broken@example.com")
    change("next@example.com")
    crm.reject_times = OutboxMessage::MAX_ATTEMPTS

    OutboxMessage::MAX_ATTEMPTS.times { relay }

    expect(OutboxMessage.where.not(failed_at: nil).pluck(:attempts)).to eq([OutboxMessage::MAX_ATTEMPTS])
    expect(relay).to eq(1)
    expect(crm.emails[member.id]).to eq("next@example.com")
    expect(OutboxMessage.stats).to include(pending: 0, failed: 1)
  end

  it "送り終えてから7日を過ぎた行を消す" do
    change("new@example.com")
    relay
    OutboxMessage.update_all(sent_at: 8.days.ago)

    expect(OutboxMessage.purge_sent).to eq(1)
  end
end
`}
          />
          <p>
            <code>perform_now</code> はジョブをキューに入れずにその場で実行し、<code>perform</code> の戻り値（送った件数）を返します。3つ目の例は、図 106-3 の流れをそのまま再現しています。CRM には同じ <code>event_id</code> が2回届き、メールアドレスは1回だけ反映されました。
          </p>
          <h3>2つの中継を同時に動かすテスト</h3>
          <Code
            lang="ruby"
            title="spec/jobs/relay_outbox_concurrency_spec.rb"
            code={`
require "rails_helper"

RSpec.describe RelayOutboxJob do
  self.use_transactional_tests = false # 別々の DB 接続で同時に実行するため
  after { [OutboxMessage, Member].each(&:delete_all) }

  it "2つの中継を同時に動かしても、SKIP LOCKED で同じ行を二重に送らない" do
    crm = FakeCrm.new
    member = Member.create!(name: "佐藤", email: "old@example.com")
    20.times { ChangeMemberEmail.new.call(member:, email: "e#{it}@example.com") }

    drain = lambda do
      ActiveRecord::Base.connection_pool.with_connection do
        total = 0
        while (n = described_class.perform_now(batch_size: 3, crm:)).positive?
          total += n
        end
        total
      end
    end
    totals = 2.times.map { Thread.new(&drain) }.map(&:value)

    expect(totals.sum).to eq(20)
    expect(crm.received.size).to eq(20)
    expect(crm.received.uniq.size).to eq(20)
  end
end
`}
          />
          <p>
            20件のメッセージを、2つのスレッドの中継が3件ずつ取り出して送り、どちらも送る行がなくなるまで繰り返します。各スレッドは <code>with_connection</code> で別の接続を使い（<ChapterLink n={15} section="pool" />）、テストのトランザクションは使いません（<code>use_transactional_tests = false</code>）。2つの中継が送った件数の合計が20件で、CRM に届いた <code>event_id</code> にも重複がないので、どの行も1回ずつ送られました。<code>SKIP LOCKED</code> を外すと、後から SELECT した中継は、先の中継がロックした行の COMMIT を待つので、同時には1つの中継しか送れません<Ref n={5} />。
          </p>
          <h3>Adapter のテスト</h3>
          <Code
            lang="ruby"
            title="spec/clients/crm_client_spec.rb"
            code={`
require "rails_helper"
require "webmock/rspec"

RSpec.describe CrmClient do
  let(:client) { described_class.new(url: "https://crm.example.com") }
  let(:args) { { event_id: "ev-1", event_type: "member.email_changed", payload: { member_id: 1, email: "new@example.com" } } }

  it "event_id を本文と Idempotency-Key ヘッダーに入れて送る" do
    stub = stub_request(:post, "https://crm.example.com/events")
      .with(headers: { "Idempotency-Key" => "ev-1" }, body: hash_including("event_id" => "ev-1"))

    client.deliver(**args)
    expect(stub).to have_been_requested
  end

  it "2xx 以外の応答とタイムアウトを CrmClient::Error に変える" do
    stub_request(:post, "https://crm.example.com/events").to_return(status: 503).then.to_timeout

    expect { client.deliver(**args) }.to raise_error(CrmClient::Error, "CRM が 503 を返した")
    expect { client.deliver(**args) }.to raise_error(CrmClient::Error, /ConnectionFailed|TimeoutError/)
  end
end
`}
          />
          <p>WebMock の <code>stub_request</code> は HTTP のリクエストを置き換え、決めた応答を返すか、タイムアウトを起こします。すべてを実行した結果です。</p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
CrmClient
  event_id を本文と Idempotency-Key ヘッダーに入れて送る
  2xx 以外の応答とタイムアウトを CrmClient::Error に変える

RelayOutboxJob
  2つの中継を同時に動かしても、SKIP LOCKED で同じ行を二重に送らない

RelayOutboxJob
  未送信の行を送り、sent_at を記録する
  CRM が止まっていたら未送信のまま残し、後の行も送らない。次の回に書いた順に送る
  CRM が受け取った後に応答が失われると、同じメッセージがもう一度届く。CRM は event_id で重複を捨てる
  MAX_ATTEMPTS 回失敗した行は送信を諦め、後の行を送る
  送り終えてから7日を過ぎた行を消す

環境
  MySQL 8.4 につながる

PATCH /members/:id
  会員の更新と outbox の行を同じトランザクションで書く。送るのは中継のジョブ
  同じトランザクションの後の更新が失敗したら、会員の変更も outbox の行も残らない

Finished in 0.51772 seconds (files took 2.59 seconds to load)
11 examples, 0 failures
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
            <li>DB の更新と、送るメッセージの記録が、必ず一緒に確定するか、一緒に取り消される。</li>
            <li>送り先や Redis が止まっていても、業務の処理は成功する。メッセージは送り先が戻った後に送られる。</li>
            <li>送ったもの、送っていないもの、失敗し続けているものが、outbox_messages を見れば分かる。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>中継のジョブを定期的に動かし続け、止まっていないかを監視する必要がある。</li>
            <li>メッセージは2回以上届くことがあるので、受け取る側が重複を捨てる必要がある。受け取る側を自分たちで変えられない場合は、送り先の API が重複を扱えるか（Idempotency-Key など）を確かめる。</li>
            <li>送るまでに遅れが出る。ポーリングなら、問い合わせの間隔だけ遅れる。</li>
            <li>順序を守るには、中継の数や受け持ちの分け方を考える必要がある。</li>
            <li>業務のトランザクションに INSERT が1つ増え、中継の SELECT と UPDATE、掃除の DELETE が DB に加わる。</li>
          </ul>
          <h3>保守性とテストのしやすさ</h3>
          <p>
            業務の処理のテストは outbox に正しい行が書かれたかを確かめるだけで済み、送り先の代役はいりません。中継のジョブは、送り先の代役を引数で渡して、失敗・重複・順序をテストできます。送り先を増やすときは、<code>event_type</code> ごとに送り先を選ぶ処理を中継のジョブに足すか、送り先ごとに中継のジョブを分けます。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>outbox に書いた後、同じリクエストの中で送ることだけに頼る</h3>
          <Code
            lang="ruby"
            title="誤り：中継のジョブを動かさず、COMMIT の後にその場で送るだけ"
            code={`
message = ChangeMemberEmail.new.call(member:, email:)
CrmClient.new.deliver(event_id: message.event_id, event_type: message.event_type, payload: message.payload)
message.update!(sent_at: Time.current)
`}
          />
          <p>
            COMMIT の後に同じリクエストの中ですぐに送り、送れたら <code>sent_at</code> を記録する作りは、送るまでの遅れを短くするために使われます。中継のジョブも別に動いているなら問題ありません。しかし、同じリクエストの中で送ることだけに頼ると、送る前にプロセスが止まったときや送信に失敗したときに、未送信の行が残ったまま誰も送りません。中継のジョブは必ず定期的に動かします。
          </p>
          <h3>受け取る側が重複を考えない</h3>
          <Code
            lang="ruby"
            title="誤り：受け取る側が、届いたメッセージを毎回処理する"
            code={`
def receive(message)
  member = CrmMember.find(message["data"]["member_id"])
  member.increment!(:email_change_count) # 同じメッセージが2回届くと2回数える
  member.update!(email: message["data"]["email"])
end
`}
          />
          <p>
            中継は、同じメッセージを2回送ることがあります。受け取る側が重複を捨てないと、回数の加算やポイントの二重付与などが起きます。受け取る側は <code>event_id</code> を一意索引のある表に記録し、記録と処理を同じトランザクションで行います（<ChapterLink n={52} section="webhook" />）。
          </p>
          <h3>送信済みの行を消さない・監視しない</h3>
          <p>
            送信済みの行が増え続けると、表と索引が大きくなり、未送信の行を探す問い合わせやバックアップに時間がかかるようになります。中継のジョブが止まっても、未送信の行の数や古さを監視していなければ気づきません。定期実行のジョブそのものが止まった場合も、未送信の行の古さで気づけます。
          </p>
          <h3>失敗し続ける行で、すべてが止まる</h3>
          <Code
            lang="ruby"
            title="誤り：失敗した行の後を送らず、諦める回数もない"
            code={`
rescue CrmClient::Error => e
  message.update!(attempts: message.attempts + 1, last_error: e.message)
  break # CRM が受け付けない行が先頭にあると、後の行が永久に送られない
`}
          />
          <p>
            CRM が受け付けないメッセージ（内容の誤りなど）が1件あると、後の行がすべて止まります。送信を試した回数が一定を超えた行は、この章の <code>failed_at</code> のように送る対象から外すか別の表に移し、人が調べられるようにします。
          </p>
          <h3>内部のイベントをそのまま outbox に入れる</h3>
          <Code
            lang="ruby"
            title="誤り：モデルの属性をそのまま payload にする"
            code={`
OutboxMessage.create!(event_type: "member.updated", aggregate_id: member.id.to_s,
                      payload: member.attributes) # 列の名前を変えると、受け取る側が壊れる
`}
          />
          <p>
            outbox のメッセージは、外部に公開する形です。モデルの属性や、アプリの中で使うドメインイベントの項目をそのまま入れると、列やイベントの項目の名前を変えただけで受け取る側が壊れ、外部に出す必要のない情報（パスワードのダイジェストなど）まで送ってしまいます。受け取る側と決めた項目だけを、決めた名前で入れます。ドメインイベントから外部向けのメッセージを作る考え方は<ChapterLink n={51} section="idea" />で扱います。
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
            <li>COMMIT の後に送る、またはジョブを積む：食い違いがまれで、食い違っても困らない（後で手作業で直せる、次の変更で上書きされる）なら、図 106-1 の B の書き方で足ります。</li>
            <li>送り先から取りに来てもらう：送るのではなく、外部のサービスが変更の一覧を API で定期的に取りに来る形にできれば、送信の失敗を考えずに済みます。</li>
          </ul>
          <h3>after_commit で直接ジョブを積む方法と、その限界</h3>
          <p>
            Rails では、COMMIT の後にジョブを積む方法がいくつかあります。<code>after_commit</code> のコールバック（<ChapterLink n={14} section="after-commit" />）、<code>ActiveRecord.after_all_transactions_commit</code>、ジョブのクラスに書く <code>self.enqueue_after_transaction_commit = true</code>（<ChapterLink n={18} section="transaction" />）です。Sidekiq にも、ジョブを積む処理を COMMIT の後に回す <code>Sidekiq.transactional_push!</code> があり、Sidekiq 8.1.7 のソースでは Active Record 7.2 以降なら <code>ActiveRecord.after_all_transactions_commit</code> で積んでいます<Ref n={12} />。
          </p>
          <p>
            どれも図 106-1 の A（ROLLBACK したのにジョブが残る）は防げますが、B（COMMIT した後に積めない）は防げません。送るべきだという記録が業務のデータと同じトランザクションで DB に残るかどうかが、outbox との違いです。Rails のガイドは Solid Queue を別の DB に置く場合の方法として <code>enqueue_after_transaction_commit</code> を勧めていますが<Ref n={9} />、COMMIT の直後にプロセスが止まった場合の投入の欠落は、outbox か同じ DB のジョブキューでなければ防げません。
          </p>
          <h3>トランザクションログを読む中継（CDC）</h3>
          <p>
            DB の変更を、DB が書くトランザクションログから取り出して外部に送る方法を <Term en="change data capture">CDC</Term> と呼びます。MySQL の binlog（バイナリログ）は、DB に COMMIT された順にすべての操作を記録し、レプリケーションと復旧に使われます。Debezium（DB の変更を取り出して Kafka などに送るオープンソースのソフトウェア）の MySQL コネクターは、この binlog を読んで行の変更をイベントにします<Ref n={7} />。Debezium には outbox の表への INSERT を取り出して送る仕組み（Outbox Event Router）もあります<Ref n={8} />。microservices.io は、この方法の短所として、DB ごとの仕組みが必要になることと、重複して送るのを避けにくいことを挙げています<Ref n={3} />。
          </p>
          <Figure n="106-4" title="中継の方式の比較" caption="上から、この章のポーリング、トランザクションログを読む方式（CDC）、業務と同じ DB のジョブキュー。青い文字は長所、赤い文字は短所。">
            <RelayMethodsFigure />
          </Figure>
          <p>
            図 106-4 の1行目がこの章の方式で、SQL と Active Job だけで作れます。microservices.io は、ポーリングはどの SQL データベースでも動くが、順序を守って送るのが難しいとしています<Ref n={2} />。2行目の CDC は遅れが小さく、binlog は COMMIT の順に並ぶので、送り先が Kafka なら採用を考えます。そのときも受け取る側の重複排除は必要です。3行目は、Solid Queue を業務と同じ DB に置く場合で、rails-impl の節で説明した前提が必要です。
          </p>
          <h3>Rails の標準機能・gem との使い分け</h3>
          <ul>
            <li>中継のジョブの定期実行：Solid Queue の recurring tasks（config/recurring.yml）か、cron などから定期的に積みます<Ref n={10} />。Sidekiq の定期実行（periodic jobs）は Sidekiq Enterprise の機能なので<Ref n={11} />、OSS 版なら cron などから積みます（<ChapterLink n={18} section="recurring-jobs" />）。</li>
            <li>行の取り出し：<code>lock("FOR UPDATE SKIP LOCKED")</code> で書けます。Solid Queue もワーカーがジョブを取り出すときに同じ SQL を使います<Ref n={10} />。</li>
            <li>送り先が Kafka や SNS などのメッセージブローカーでも、作りは同じです。中継の送り先が CRM の API からメッセージブローカーに変わるだけです。</li>
          </ul>
          <h3>関連するパターン</h3>
          <ul>
            <li>Domain Events（<ChapterLink n={51} section="idea" />）：outbox に書くのは、ドメインイベントから作った外部向けのメッセージです。microservices.io も、Domain event パターンがこのパターンを必要にするとしています<Ref n={1} />。同じプロセスの中で購読者に届けるだけなら、outbox はいりません。</li>
            <li>Idempotency Key / Deduplication（<ChapterLink n={52} section="idea" />）：outbox の配信は少なくとも1回なので、受け取る側はメッセージの ID を記録して重複を捨てます。送る側は、メッセージの ID を送り先の冪等性キーとして渡します。</li>
            <li>Retry with Backoff（<ChapterLink n={54} section="idea" />）：中継が送信に失敗したときに、送り直す間隔を決めます。この例は次の定期実行まで待ちます。一時エラーが続く間に間隔を延ばす場合は、送信を打ち切るための回数と分けて、次に試す時刻を保存します。</li>
            <li>Event Sourcing：イベントの記録そのものを正しいデータとして保存する考え方で、outbox を別に持つ必要がなくなります。microservices.io は代わりの解決として挙げています<Ref n={1} />。MSDP のカタログと本書では扱いません。</li>
          </ul>
          <h3>採用する条件</h3>
          <ul>
            <li>DB の更新を外部のサービスやメッセージブローカーに必ず伝える必要があり、伝わらないと業務に影響が出る。</li>
            <li>送り先や Redis が止まっていても、業務の処理は受け付けたい。</li>
            <li>送り先が、同じメッセージを2回受け取っても正しく扱える（または、そうできる）。</li>
          </ul>
          <h3>採用しない方がよい条件</h3>
          <ul>
            <li>送るメッセージが失われても困らない（COMMIT の後に積めば足りる）。</li>
            <li>Solid Queue を業務と同じ DB に置いていて、その前提を保てる。ジョブを同じトランザクションで積めば足りる。</li>
            <li>送り先が重複を扱えず、自分たちでも変えられない（先に送り先の対応を考える）。</li>
          </ul>
          <h3>判断のチェックポイント</h3>
          <ol>
            <li>業務のデータと outbox の行を、同じトランザクションで書いているか。</li>
            <li>メッセージに、受け取る側が重複を見分けられる ID があるか。</li>
            <li>順序が必要か。必要なら、中継の数と受け持ちを決めたか。</li>
            <li>中継のジョブが止まったことに、監視で気づけるか。</li>
            <li>送り終えた行を消す仕組みがあるか。</li>
            <li>失敗し続ける行を、人が調べられるか。</li>
          </ol>
          <Callout kind="note" title="この章の例での判断">
            <p>
              CRM のメールアドレスが古いままだとお知らせのメールが届かないので、変更は必ず伝える必要があります。CRM は止まることがあり、そのときもメールアドレスの変更は受け付けたいので、Transactional Outbox を使いました。ジョブキューは Redis にあり、ジョブを積むことを DB のトランザクションに入れられません。CRM の側で <code>event_id</code> による重複排除ができることが前提です。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'delivery-criteria',
      title: '通知が欠けた場合の影響から方式を選ぶ',
      body: (
        <>
          <p>再生成できる表示用キャッシュの更新まで Outbox に入れると、テーブルが増え、未送信行の監視や掃除が必要になります。たとえば、期限が過ぎた値を再取得できる場合は、期限とキャッシュキーの更新で対処できます。</p>
          <p>契約先へ必ず知らせる必要があり、通知を取り出し直せることが条件なら、更新と同じ DB に送信予定を残します。このとき、古い通知を適用してもよいか、順番が必要か、失敗行を誰が調べるかを、重複検出とあわせて決めます。</p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>DB の更新の後に Sidekiq のジョブを積む書き方では、トランザクションの中で積めば ROLLBACK してもジョブが残り、COMMIT の後に積めば積む前に止まったときにジョブがなくなります。Redis は MySQL のトランザクションに入りません。</li>
          <li>Transactional Outbox は、送るメッセージを業務のデータと同じトランザクションで outbox の表に書き、別の中継が送るパターンです。両方が確定するか、両方が取り消されます。</li>
          <li>中継のジョブは、未送信の行を <code>lock("FOR UPDATE SKIP LOCKED")</code> で id の順に取り出し、送れたら <code>sent_at</code> を記録します。失敗したら回数とエラーを記録して残し、次の回に送り直します。</li>
          <li>MySQL には部分インデックスがないので、<code>(sent_at, failed_at)</code> の索引で未送信の行を id の順に読みます。SKIP LOCKED は MySQL 8.0 から使えます。</li>
          <li>メッセージは少なくとも1回送られ、2回送られることもあります。受け取る側はメッセージの ID で重複を捨てます。</li>
          <li>id の順と COMMIT の順は一致しないことがあり、中継を複数動かすと順序が崩れます。順序が必要なら、中継の数と受け持ちを決めます。</li>
          <li>失敗し続ける行は送る対象から外して人が調べ、送り終えた行は期間を置いて消し、未送信の件数と古さを監視します。2相コミットは使いません。</li>
          <li>after_commit や <code>enqueue_after_transaction_commit</code> は ROLLBACK 後のジョブを防ぎますが、COMMIT 後の欠落は防げません。Solid Queue を同じ DB に置けばジョブの行が outbox の代わりになりますが、その前提を保つ必要があります。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Pattern: Transactional outbox', publisher: 'Chris Richardson／microservices.io', url: 'https://microservices.io/patterns/data/transactional-outbox.html', accessed: '2026-11-13', note: '2相コミットを使えないという問題、outbox の表と中継、送る順序、重複して送ることと受け取る側の冪等性、中継の2つの方式、Domain event との関係、Event sourcing。' },
    { title: 'Pattern: Polling publisher', publisher: 'Chris Richardson／microservices.io', url: 'https://microservices.io/patterns/data/polling-publisher.html', accessed: '2026-11-13', note: 'outbox の表を問い合わせて送る方式は、どの SQL データベースでも動くが、順序を守るのが難しいこと。' },
    { title: 'Pattern: Transaction log tailing', publisher: 'Chris Richardson／microservices.io', url: 'https://microservices.io/patterns/data/transaction-log-tailing.html', accessed: '2026-11-13', note: 'トランザクションログを読んで送る方式は、DB ごとの仕組みが必要で、重複を避けにくいこと。' },
    { title: 'Transactional outbox pattern', publisher: 'AWS Prescriptive Guidance', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html', accessed: '2026-11-13', note: '二重書き込み（dual write）の問題、重複したメッセージと受け取る側の冪等性。' },
    { title: 'Locking Reads（Locking Read Concurrency with NOWAIT and SKIP LOCKED）', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'SKIP LOCKED はロックされた行を結果から除くこと、一貫しない見え方になるので一般の処理には向かないが、キューのように使う表を複数のセッションが読むときに使えること。' },
    { title: 'XA Transactions', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/xa.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'InnoDB が XA トランザクションに対応し、トランザクションマネージャーが2相コミットで全体を確定すること。' },
    { title: 'Debezium connector for MySQL', publisher: 'Debezium Documentation', url: 'https://debezium.io/documentation/reference/stable/connectors/mysql.html', accessed: '2026-11-20', version: 'stable 版のドキュメント', note: 'MySQL の binlog が COMMIT された順に操作を記録し、Debezium の MySQL コネクターが binlog を読んで変更のイベントを作ること。' },
    { title: 'Outbox Event Router', publisher: 'Debezium Documentation', url: 'https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html', accessed: '2026-11-13', version: 'stable 版のドキュメント', note: 'outbox の表の変更を取り出して送る仕組み。' },
    { title: 'Active Job Basics（Transactional Integrity on Jobs）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_job_basics.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'Solid Queue が同じ DB ならジョブの投入も同じトランザクションに入ること、Rails 8 は既定で別の DB に置き、その性質に頼ると移したときに気づかずに失われること、enqueue_after_transaction_commit を勧めること。' },
    { title: 'rails/solid_queue', publisher: 'GitHub', url: 'https://github.com/rails/solid_queue', accessed: '2026-11-13', note: '定期実行（recurring tasks）、ジョブの取り出しに FOR UPDATE SKIP LOCKED を使うこと。' },
    { title: 'Ent Periodic Jobs', publisher: 'sidekiq/sidekiq Wiki（GitHub）', url: 'https://github.com/sidekiq/sidekiq/wiki/Ent-Periodic-Jobs', accessed: '2026-11-20', note: '定期実行（periodic jobs）が Sidekiq Enterprise の機能であること。' },
    { title: 'lib/sidekiq/transaction_aware_client.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: 'https://github.com/sidekiq/sidekiq/blob/v8.1.7/lib/sidekiq/transaction_aware_client.rb#L7-L58', accessed: '2026-11-20', version: 'Sidekiq 8.1.7', note: 'Sidekiq.transactional_push! が、Active Record 7.2 以降では ActiveRecord.after_all_transactions_commit でジョブの投入を COMMIT の後に回すこと。' },
  ],
}

export default chapter
