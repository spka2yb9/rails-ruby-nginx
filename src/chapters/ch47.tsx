import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const AASM_GH = 'https://github.com/aasm/aasm/blob/v6.0.0'

/* ---------- 図 100-1 4つのフラグの組み合わせと、意味のある5つの状態 ---------- */
function FlagsFigure() {
  // [submitted, approved, rejected, paid, 表している状態, 種類]
  type Kind = 'ok' | 'bad' | 'seen'
  const rows: [boolean, boolean, boolean, boolean, string, Kind][] = [
    [false, false, false, false, 'draft（下書き）', 'ok'],
    [false, false, false, true, '不正：申請も承認もされずに精算済み', 'bad'],
    [false, false, true, false, '不正：申請されずに差し戻し', 'bad'],
    [false, false, true, true, '不正：申請されずに差し戻しかつ精算済み', 'bad'],
    [false, true, false, false, '不正：申請されずに承認済み', 'bad'],
    [false, true, false, true, '不正：申請されずに承認済みかつ精算済み', 'bad'],
    [false, true, true, false, '不正：申請されずに承認済みかつ差し戻し', 'bad'],
    [false, true, true, true, '不正：申請されずに承認・差し戻し・精算がすべて済み', 'bad'],
    [true, false, false, false, 'submitted（申請中）', 'ok'],
    [true, false, false, true, '不正：承認されずに精算済み', 'bad'],
    [true, false, true, false, 'rejected（差し戻し）※出発点では再申請してもこのまま', 'ok'],
    [true, false, true, true, '不正：差し戻されたのに精算済み', 'bad'],
    [true, true, false, false, 'approved（承認済み）', 'ok'],
    [true, true, false, true, 'paid（精算済み）', 'ok'],
    [true, true, true, false, '不正：承認済みかつ差し戻し（出発点で作れた）', 'seen'],
    [true, true, true, true, '不正：承認・差し戻し・精算がすべて済み（出発点で作れた）', 'seen'],
  ]
  const cols = ['submitted', 'approved', 'rejected', 'paid']
  const top = 34
  const rh = 21
  return (
    <Svg
      id="100-1"
      w={760}
      h={top + rows.length * rh + 16}
      label={`4つの真偽値の列 submitted・approved・rejected・paid の組み合わせ16通りと、それが表す状態。${rows
        .map((r) => `${r.slice(0, 4).map((b) => (b ? '真' : '偽')).join('・')}は${r[4]}`)
        .join('。')}。意味のある状態は5つだけで、残りの11通りは業務上ありえない`}
    >
      {cols.map((c, i) => (
        <T key={c} x={60 + i * 90} y={18} anchor="middle" fs={12} mono bold>
          {c}
        </T>
      ))}
      <T x={390} y={18} fs={12} bold>
        表している状態
      </T>
      <line x1={10} y1={top - 4} x2={750} y2={top - 4} stroke="var(--fig-line)" />
      {rows.map((r, i) => {
        const y = top + i * rh
        return (
          <g key={i}>
            {r[5] !== 'bad' && <rect x={10} y={y} width={740} height={rh - 2} rx={3} fill={r[5] === 'ok' ? 'var(--fig-box5)' : 'var(--fig-box)'} />}
            {r.slice(0, 4).map((b, j) => (
              <T key={j} x={60 + j * 90} y={y + rh / 2 - 1} anchor="middle" fs={12}>
                {b ? '○' : '−'}
              </T>
            ))}
            <T x={390} y={y + rh / 2 - 1} fs={12} tone={r[5] === 'ok' ? undefined : 'danger'} bold={r[5] === 'ok'}>
              {r[4]}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 100-2 経費申請の状態遷移図 ---------- */
function StateDiagramFigure() {
  const h = 44
  return (
    <Svg
      id="100-2"
      w={760}
      h={340}
      label="経費申請の状態遷移図。最初の状態は draft。draft で submit を受けると、金額が0円より大きければ submitted に移り、承認者に通知する。submitted で withdraw を受けると draft に戻る。submitted で approve を受けると、承認者が申請者と違えば approved に移り、申請者に通知する。submitted で reject を受けると、差し戻しの理由が空でなければ rejected に移り、申請者に通知する。rejected で revise を受けると draft に戻る。approved で pay を受けると paid に移る。paid は最終の状態で、どのイベントも受け付けない"
    >
      <circle cx={18} cy={110} r={7} fill="var(--fig-line)" />
      <Arrow x1={25} y1={110} x2={44} y2={110} />

      <Box x={46} y={88} w={110} h={h} lines="draft" mono bold />
      <Box x={316} y={88} w={130} h={h} lines="submitted" mono bold />
      <Box x={610} y={88} w={120} h={h} lines="approved" mono bold />
      <Box x={316} y={258} w={130} h={h} lines="rejected" mono bold />
      <Box x={610} y={258} w={120} h={h} mono />
      <Box x={614} y={262} w={112} h={h - 8} lines="paid" mono bold rx={4} />

      <Arrow x1={156} y1={102} x2={314} y2={102} accent />
      <T x={236} y={44} anchor="middle" fs={12} mono>
        submit
      </T>
      <T x={236} y={62} anchor="middle" fs={12}>
        [金額 &gt; 0]
      </T>
      <T x={236} y={80} anchor="middle" fs={12} tone="muted">
        / 承認者に通知
      </T>

      <Arrow x1={316} y1={120} x2={158} y2={120} />
      <T x={236} y={136} anchor="middle" fs={12} mono>
        withdraw
      </T>

      <Arrow x1={446} y1={110} x2={608} y2={110} accent />
      <T x={528} y={52} anchor="middle" fs={12} mono>
        approve
      </T>
      <T x={528} y={70} anchor="middle" fs={12}>
        [承認者 ≠ 申請者]
      </T>
      <T x={528} y={88} anchor="middle" fs={12} tone="muted">
        / 申請者に通知
      </T>

      <Arrow x1={381} y1={132} x2={381} y2={256} />
      <T x={393} y={168} fs={12} mono>
        reject
      </T>
      <T x={393} y={186} fs={12}>
        [理由が空でない]
      </T>
      <T x={393} y={204} fs={12} tone="muted">
        / 申請者に通知
      </T>

      <Arrow d="M 316 290 L 101 290 L 101 134" />
      <T x={208} y={278} anchor="middle" fs={12} mono>
        revise
      </T>

      <Arrow x1={670} y1={132} x2={670} y2={256} accent />
      <T x={682} y={194} fs={12} mono>
        pay
      </T>

      <T x={20} y={326} fs={12} tone="muted">
        青い矢印は、申請が精算まで進む流れ
      </T>
    </Svg>
  )
}

/* ---------- 図 100-3 状態 × イベントの遷移表 ---------- */
function TransitionTableFigure() {
  const events = ['submit', 'withdraw', 'approve', 'reject', 'revise', 'pay']
  const rows: [string, ([string, string] | null)[]][] = [
    ['draft', [['submitted', '金額 > 0'], null, null, null, null, null]],
    ['submitted', [null, ['draft', ''], ['approved', '申請者以外'], ['rejected', '理由あり'], null, null]],
    ['approved', [null, null, null, null, null, ['paid', '']]],
    ['rejected', [null, null, null, null, ['draft', ''], null]],
    ['paid', [null, null, null, null, null, null]],
  ]
  const x0 = 110
  const cw = 108
  const rh = 46
  const top = 30
  return (
    <Svg
      id="100-3"
      w={760}
      h={top + rows.length * rh + 30}
      label="行は状態、列はイベントの遷移表。draft は submit で submitted へ（金額が0円より大きいとき）。submitted は withdraw で draft へ、approve で approved へ（承認者が申請者以外のとき）、reject で rejected へ（理由があるとき）。approved は pay で paid へ。rejected は revise で draft へ。それ以外の組み合わせと paid の行はすべて受け付けない。30マスのうち遷移するのは6マス"
    >
      {events.map((e, i) => (
        <T key={e} x={x0 + i * cw + cw / 2} y={16} anchor="middle" fs={12} mono bold>
          {e}
        </T>
      ))}
      {rows.map(([state, cells], r) => {
        const y = top + r * rh
        return (
          <g key={state}>
            <Box x={10} y={y} w={x0 - 16} h={rh - 6} lines={state} mono bold fs={12} fill="bg" />
            {cells.map((c, i) => (
              <Box
                key={i}
                x={x0 + i * cw}
                y={y}
                w={cw - 6}
                h={rh - 6}
                lines={c ? (c[1] ? [`→ ${c[0]}`, `［${c[1]}］`] : `→ ${c[0]}`) : '×'}
                fs={11.5}
                fill={c ? 'box5' : 'bg'}
                mono={c !== null}
                subTone="muted"
              />
            ))}
          </g>
        )
      })}
      <T x={10} y={top + rows.length * rh + 12} fs={11.5} tone="muted">
        → は遷移先、［ ］はガード条件、× は受け付けない組み合わせ
      </T>
    </Svg>
  )
}

/* ---------- 図 100-4 遷移の処理と、呼び出す側の役割 ---------- */
function StructureFigure() {
  return (
    <Svg
      id="100-4"
      w={760}
      h={400}
      label="ExpenseReportsController#fire（呼び出す側）が申請を読み込み、ExpenseReport#fire! にイベントを渡す。fire! は ExpenseWorkflow.transition を呼び、次の状態・書き換える列・effects を受け取る。transition は遷移表 TRANSITIONS を参照する純粋な処理で、DB にも通知にも触れない。fire! は WHERE status = 元の状態 の条件付き UPDATE で保存し、MySQL の CHECK 制約が状態ごとの列を検査する。fire! は effects をコントローラーに返し、コントローラーが ExpenseNotifier でメールのジョブを投入する。画面のボタンは available_events で遷移表から作る"
    >
      <rect x={516} y={8} width={236} height={236} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray="2 4" />
      <T x={528} y={26} fs={11.5} tone="muted">
        状態機械（DB にも通知にも触れない）
      </T>

      <Box
        x={14}
        y={40}
        w={232}
        h={92}
        lines={['ExpenseReportsController#fire', '1. ExpenseReport.find', '2. report.fire!(event)', '3. ExpenseNotifier.deliver']}
        fs={12}
        bold
        align="start"
        subTone="muted"
      />
      <T x={20} y={150} fs={11} tone="muted">
        呼び出す側
      </T>

      <Box x={292} y={40} w={200} h={72} lines={['ExpenseReport#fire!', '遷移を求めて保存する', 'WHERE status = 元の状態']} fs={12} bold subTone="muted" />
      <Arrow x1={246} y1={70} x2={290} y2={70} />
      <Arrow x1={292} y1={104} x2={248} y2={118} dashed />
      <T x={262} y={132} fs={11} tone="muted">
        effects
      </T>

      <Box x={532} y={40} w={206} h={72} lines={['ExpenseWorkflow.transition', '(report, event)', '→ to・changes・effects']} fs={12} bold fill="box5" subTone="muted" />
      <Arrow x1={492} y1={62} x2={530} y2={62} />
      <Arrow x1={530} y1={94} x2={494} y2={94} dashed />
      <T x={511} y={128} anchor="middle" fs={11} tone="muted">
        戻り値
      </T>
      <Box x={532} y={160} w={206} h={60} lines={['TRANSITIONS（遷移表）', '状態 → イベント → 次の状態']} fs={12} bold subTone="muted" />
      <Arrow x1={635} y1={112} x2={635} y2={158} dashed />

      <Box x={292} y={300} w={200} h={60} lines={['MySQL expense_reports', 'CHECK 制約で状態ごとの列を検査']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={392} y1={112} x2={392} y2={298} />
      <T x={400} y={240} fs={11} tone="muted">
        条件付きの UPDATE
      </T>

      <Box x={14} y={300} w={232} h={60} lines={['ExpenseMailer', 'deliver_later（ジョブを投入）']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={130} y1={132} x2={130} y2={298} />
      <T x={138} y={240} fs={11} tone="muted">
        保存できた後に通知
      </T>

      <Box x={560} y={304} w={150} h={44} lines="画面のボタン" fs={12} />
      <Arrow x1={635} y1={220} x2={635} y2={302} dashed />
      <T x={643} y={270} fs={11} tone="muted" mono>
        available_events
      </T>
      <T x={14} y={388} fs={12}>
        保存と通知（DB の外への影響）は、状態機械の外側だけが行う
      </T>
    </Svg>
  )
}

/* ---------- 図 100-5 GoF の State と、遷移表・遷移の処理の比較 ---------- */
function StateVsTableFigure() {
  return (
    <Svg
      id="100-5"
      w={780}
      h={340}
      label="左は GoF の State。ExpenseReport が現在の状態のオブジェクトを持ち、approve などの操作を状態のオブジェクトに任せる。状態のインターフェース ReportState を DraftState、SubmittedState、ApprovedState などのクラスが実装し、各クラスがその状態で受け付ける操作と次の状態を決める。遷移の規則は状態の数だけのクラスに分かれる。右はこの章の方法。ExpenseReport は status の列を持つデータで、イベントも Data で表す。遷移の規則は ExpenseWorkflow の1つの遷移表と1つの transition にまとまり、transition は次の状態と書き換える列を返す"
    >
      <T x={20} y={20} bold>
        GoF の State
      </T>
      <Box x={20} y={36} w={150} h={64} lines={['ExpenseReport', 'state', 'approve()']} fs={12} bold subTone="muted" />
      <Box x={200} y={36} w={170} h={84} lines={['«interface» ReportState', 'submit()', 'approve()', 'pay() …']} fs={12} bold subTone="muted" />
      <Arrow x1={170} y1={68} x2={198} y2={68} />
      {[
        ['DraftState', 20],
        ['SubmittedState', 140],
        ['ApprovedState', 260],
      ].map(([name, x]) => (
        <g key={name as string}>
          <Box x={x as number} y={200} w={114} h={40} lines={name as string} mono fs={11} />
          <Arrow d={`M ${(x as number) + 57} 200 L ${(x as number) + 57} 170 L 285 170 L 285 122`} dashed />
        </g>
      ))}
      <T x={20} y={264} fs={12}>
        状態ごとのクラスが、その状態で受け付ける
      </T>
      <T x={20} y={282} fs={12}>
        操作と次の状態を決める
      </T>
      <T x={20} y={308} fs={12} tone="muted">
        遷移の規則は状態の数だけのクラスに分かれる
      </T>

      <line x1={400} y1={10} x2={400} y2={330} stroke="var(--fig-line)" />

      <T x={420} y={20} bold>
        この章：遷移表と遷移の処理
      </T>
      <Box x={420} y={36} w={160} h={64} lines={['ExpenseReport', 'status 列（データ）', '状態ごとの列']} fs={12} bold subTone="muted" />
      <Box x={600} y={36} w={160} h={64} lines={['イベント（Data）', 'Submit・Approve …', 'イベントごとの値']} fs={12} bold subTone="muted" />
      <Box x={470} y={190} w={250} h={52} lines={['ExpenseWorkflow.transition', '＋ TRANSITIONS']} mono fs={12} fill="box5" />
      <Arrow x1={540} y1={190} x2={510} y2={102} dashed />
      <Arrow x1={650} y1={190} x2={680} y2={102} dashed />
      <T x={420} y={264} fs={12}>
        状態はデータで、規則は1つの表と1つの処理に
      </T>
      <T x={420} y={282} fs={12}>
        まとまる。次の状態と書き換える列を返す
      </T>
      <T x={420} y={308} fs={12} tone="muted">
        遷移の規則の全体を1か所で読める
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 47,
  part: 9,
  title: 'Explicit State Machine：経費申請の承認フローを遷移表で表す',
  summary:
    '経費申請の状態（下書き・申請中・承認済み・差し戻し・精算済み）を真偽値のフラグではなく1つの状態の列で持ち、状態とイベントの遷移表、保存も通知もしない遷移の処理、条件付きの UPDATE、状態ごとの列を守る CHECK 制約で承認フローを実装します。AASM を使う場合の注意と、GoF の State との違いも MySQL と RSpec で確かめます。',
  goals: [
    '状態を真偽値のフラグの組み合わせで表すと、どのような不正な状態が作れてしまうかを、Rails のコードで再現して説明できる',
    '状態 × イベントの遷移表を作り、遷移表で決めることとガード条件で決めることを区別できる',
    'enum と遷移表（Hash）で状態の一覧と規則を定義し、状態を変えるメソッドだけを公開する ExpenseReport を実装できる',
    '遷移の処理は次の状態と effects を返すだけにし、保存と通知を呼び出す側で行う理由を説明できる',
    'where(status: 元の状態).update_all の条件付きの UPDATE で同時の遷移を防ぎ、CHECK 制約で状態ごとに必要な列を守れる（結果が NULL の行は CHECK を通ることも含めて）',
    'AASM 6.0 の event の before がガードより先に動くことを踏まえて、AASM で同じ規則を書ける',
    'GoF の State、state_machines gem、enum の validate オプションとの使い分けを判断できる',
  ],
  prerequisites: [14, 30],
  sections: [
    {
      id: 'scene',
      title: '経費申請の承認フローを真偽値のフラグで表すと',
      body: (
        <>
          <p>
            この章の題材は社内の経費申請です。社員（申請者）は立て替えた交通費などの金額を入力して下書きを作り、申請します。上長（承認者）は申請を承認するか、理由を付けて差し戻します。承認された申請は、経理の担当者が精算（立て替えた金額の支払い）をします。申請者は申請中の申請を取り下げて下書きに戻せ、差し戻された申請は直すために下書きに戻します。申請すると承認者に、承認や差し戻しをすると申請者にメールで知らせます。業務の規則として、申請した本人は承認できず、0円の申請はできず、差し戻すときは理由が必要です。
          </p>
          <p>
            このように、業務のデータには「下書き」「申請中」「承認済み」のような段階があり、利用者の操作で段階が移っていきます。最初のコードは、段階を「申請したか」「承認されたか」「差し戻されたか」「精算したか」の4つの真偽値の列（フラグ）で表しています。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_members_and_expense_reports.rb（出発点。expense_reports の部分）"
            code={`
create_table :expense_reports do |t|
  t.references :applicant, null: false, foreign_key: { to_table: :members }
  t.integer :amount, null: false
  t.boolean :submitted, null: false, default: false # 申請したか
  t.boolean :approved, null: false, default: false  # 承認されたか
  t.boolean :rejected, null: false, default: false  # 差し戻されたか
  t.boolean :paid, null: false, default: false      # 精算したか
  t.datetime :submitted_at
  t.references :approved_by, foreign_key: { to_table: :members }
  t.datetime :approved_at
  t.references :rejected_by, foreign_key: { to_table: :members }
  t.string :reject_reason
  t.datetime :paid_at
  t.timestamps
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/expense_reports_controller.rb（出発点）"
            code={`
class ExpenseReportsController < ApplicationController
  def submit
    report = ExpenseReport.find(params[:id])
    report.update!(submitted: true, submitted_at: Time.current)
    ExpenseMailer.submitted(report.id).deliver_later
    render json: { flags: report.flags }
  end

  def approve
    report = ExpenseReport.find(params[:id])
    return head :unprocessable_content unless report.submitted?

    report.update!(approved: true, approved_by_id: params[:actor_id], approved_at: Time.current)
    ExpenseMailer.decided(report.id, "承認されました").deliver_later
    render json: { flags: report.flags }
  end

  def reject
    report = ExpenseReport.find(params[:id])
    return head :unprocessable_content unless report.submitted?

    report.update!(rejected: true, rejected_by_id: params[:actor_id], reject_reason: params[:reason])
    ExpenseMailer.decided(report.id, "差し戻されました").deliver_later
    render json: { flags: report.flags }
  end

  def pay
    report = ExpenseReport.find(params[:id])
    return head :unprocessable_content unless report.approved?

    report.update!(paid: true, paid_at: Time.current)
    render json: { flags: report.flags }
  end
end
`}
          />
          <p>
            アクションごとに、確かめるフラグを決めてから書き換えています。<code>report.flags</code> は4つのフラグを ○ と − で並べて返すだけのメソッドです。申請者の佐藤さん（id 1）と承認者の部長（id 2）で、4つの操作の順序を試しました。
          </p>
          <Code
            lang="text"
            title="実行結果（POST /expense_reports/:id/…。フラグは submitted approved rejected paid の順）"
            code={`
== 1: 申請者本人が承認する
submit                                  => 200 ○ − − −
approve actor_id=1                      => 200 ○ ○ − −

== 2: 承認済みの申請を差し戻し、その後に精算する
reject actor_id=2 reason=領収書がありません => 200 ○ ○ ○ −
pay                                     => 200 ○ ○ ○ ○
{"submitted" => true, "approved" => true, "rejected" => true, "paid" => true,
 "approved_by_id" => 1, "reject_reason" => "領収書がありません", "paid_at" => "（日時）"}

== 3: 差し戻された申請をもう一度申請する
submit                                  => 200 ○ − − −
reject actor_id=2 reason=日付が違います    => 200 ○ − ○ −
submit                                  => 200 ○ − ○ −

== 4: 0円の申請
submit                                  => 200 ○ − − −

== 画面ごとの「承認待ち」の条件
承認者の一覧（submitted: true, approved: false）               => [2, 3]
申請者の一覧（submitted: true, approved: false, rejected: false） => [3]
投入された通知: ["ExpenseMailer#submitted", "ExpenseMailer#decided", "ExpenseMailer#decided", …]
`}
          />
          <p>
            1では申請者本人が自分の申請を承認できました。2では承認済みの申請を差し戻せてしまい、承認と差し戻しのフラグが両方 true になり、そのまま精算もできました。DB の行には、承認者が申請者本人で、差し戻しの理由が入っていて、精算日時もある、という業務上ありえないデータが残りました。申請者には「承認されました」と「差し戻されました」の両方のメールが送られています。
          </p>
          <p>
            3では、差し戻された申請をもう一度申請しても rejected が true のまま残りました。この行が「差し戻されたまま」なのか「再申請された」のかは、フラグからは区別できません。承認者の一覧は <code>approved: false</code> だけを条件にしているので再申請を表示しますが、申請者の一覧は <code>rejected: false</code> も条件にしているので表示しません。4では0円の申請も通りました。
          </p>
          <Figure n="100-1" title="4つのフラグの組み合わせと、意味のある5つの状態" caption="○は true、−は false。色の付いた5行が業務として意味のある状態。灰色の行は出発点のコードで実際に作れた不正な組み合わせ。">
            <FlagsFigure />
          </Figure>
          <p>
            図 100-1 は4つのフラグの組み合わせをすべて並べたものです。組み合わせは2の4乗で16通りありますが、業務として意味のある状態は5つだけです。残りの11通りは「申請されずに承認済み」のような業務上ありえない状態ですが、フラグで表している限り、コードはこれらを作れてしまいます。
          </p>
          <h3>問題点の整理</h3>
          <ul>
            <li>4つのフラグの組み合わせは16通りあり、意味のある状態は5つだけです。承認者や差し戻しの理由の列も、どの状態でも入れられます。</li>
            <li>
              アクションごとに確かめるフラグが違います。approve と reject は submitted だけを確かめ、承認済みかどうかを見ていません。どの状態でどの操作ができるかを知るには、すべてのアクションを読む必要があります。
            </li>
            <li>本人による承認の禁止、0円の禁止、差し戻しの理由が必要、という業務の規則が抜けています。</li>
            <li>「承認待ち」のような状態の条件が、画面ごとに別々の where で書かれ、食い違っています。</li>
            <li>状態の確認と書き換えの間にほかの人が同じ申請を操作することを考えていません（rails-impl の節で確かめます）。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'idea',
      title: '状態の一覧と遷移の規則を1か所に明示する',
      body: (
        <>
          <h3>目的</h3>
          <p>
            とりうる状態の一覧と、「どの状態で、どの出来事を受けたら、どの状態に移るか」という規則によって振る舞いを定義したものを<Term en="state machine">状態機械</Term>と呼びます。状態を移すきっかけになる出来事を<Term en="event">イベント</Term>、状態が移ることを<Term en="transition">遷移</Term>と呼びます。経費申請では、draft・submitted・approved・rejected・paid の5つが状態で、submit（申請する）・withdraw（取り下げる）・approve（承認する）・reject（差し戻す）・revise（直すために下書きに戻す）・pay（精算する）の6つがイベントです。
          </p>
          <p>
            ここでのイベントは状態機械の用語で、遷移を起こす操作の名前なので、submit や approve のような動詞で書きます。Domain Events（<ChapterLink n={51} section="idea" />）のイベントは既に起きた事実を表し、ExpenseApproved（承認された）のように過去形で名前を付けます。同じ「イベント」という言葉でも、指すものが違います。
          </p>
          <p>
            <Term en="Explicit State Machine">Explicit State Machine</Term>は、MSDP のカタログ（<ChapterLink n={39} section="catalog" />）で、状態の一覧と遷移の規則を、コードのあちこちにある条件分岐ではなく1か所の定義として明示するパターンです。目的は次の3つです。
          </p>
          <ul>
            <li>状態の一覧を1つの列（1つの型）で表し、意味のない状態の組み合わせを作れないようにする。</li>
            <li>状態とイベントのすべての組み合わせについて、受け付けるかどうかと、どの状態に移るかを1つの表で決める。</li>
            <li>遷移の規則を1つの処理にまとめ、その処理は次の状態と行うべき処理をデータとして返すだけにする。</li>
          </ul>
          <p>
            Jane Street の Yaron Minsky は、講演 Effective ML を振り返った2011年の記事で、要点の1つに「Make illegal states unrepresentable（不正な状態を表現できないようにする）」を挙げています<Ref n={1} />。この章では、この考え方を、状態を1つの列にすることと、DB の CHECK 制約で状態ごとに必要な列を検査することで実現します。
          </p>
          <h3>使う場面</h3>
          <p>データの状態によって受け付ける操作が変わる場合に使います。</p>
          <ul>
            <li>申請と承認のワークフロー：経費申請、稟議、休暇の申請</li>
            <li>注文の進み具合：受付、支払い済み、発送済み、キャンセル</li>
            <li>契約や会員の状態：試用中、有効、停止中、解約済み</li>
          </ul>
          <p>次のような兆候があれば、状態の規則を明示する必要が出てきています。</p>
          <ul>
            <li><code>approved</code> や <code>paid</code> のような真偽値の列が、操作を追加するたびに増えている</li>
            <li>「承認済みの申請は差し戻せるか」に答えるために、複数のアクションやモデルを読む必要がある</li>
            <li>画面のボタンを出す条件と、サーバーで操作を受け付ける条件が、別々の場所に書かれている</li>
            <li>「承認済みなのに差し戻しの理由が入っている」のような、ありえないはずのデータが DB に見つかる</li>
          </ul>
          <p>
            MSDP の Explicit State Machine の章は、2人の承認者が同時に操作する場面を Optimistic Locking の章に回していました。この章では、状態を変える UPDATE に元の状態を条件として加える方法で、同時の遷移も扱います。lock_version で検出する方法は<ChapterLink n={49} section="idea" />で扱います。
          </p>
          <h3>設計上の制約</h3>
          <ul>
            <li>状態の規則の全体を1か所で見渡したい。一方で、遷移に伴う処理（通知など）は遷移ごとに違い、すべてを1か所に書くと定義が大きくなる。</li>
            <li>不正な状態を DB で作れないようにしたい。一方で、状態ごとに必要な列の条件を増やすほど、状態や列を変えるときに直す制約も増える。</li>
            <li>遷移の規則を、外部に触れない処理にしてテストしやすくしたい。一方で、実際の業務では、遷移と同時に DB への保存や通知が必要になる。</li>
            <li>gem（AASM など）で短く書きたい。一方で、コールバックの順序や、版の更新による既定の動作の変更に従う必要がある。</li>
            <li>状態やイベントを増やす変更に対応したい。一方で、決めるべき組み合わせは「状態の数 × イベントの数」で増える。</li>
          </ul>
          <h3>解決方法</h3>
          <p>この章の Rails の実装では、次の要素で構成します。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">この章の例</th>
                  <th scope="col">受け持つこと</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">状態</th>
                  <td><code>status</code> 列と <code>enum :status</code>（draft・submitted・approved・rejected・paid）</td>
                  <td>とりうる状態を列挙する。状態ごとに必要な列は CHECK 制約で決める</td>
                </tr>
                <tr>
                  <th scope="row">イベント</th>
                  <td><code>ExpenseWorkflow::Submit</code>・<code>Approve</code> などの Data</td>
                  <td>状態を移すきっかけと、それに付く値（承認者、理由、日時）を表す</td>
                </tr>
                <tr>
                  <th scope="row">遷移表</th>
                  <td><code>ExpenseWorkflow::TRANSITIONS</code>（Hash）</td>
                  <td>状態ごとに、受け付けるイベントと次の状態を決める</td>
                </tr>
                <tr>
                  <th scope="row">ガード条件</th>
                  <td>金額が0円より大きい、承認者が申請者と違う、差し戻しの理由が空でない</td>
                  <td>遷移表で受け付けるイベントでも、この条件を満たさなければ遷移しない</td>
                </tr>
                <tr>
                  <th scope="row">遷移に伴う処理（effects）</th>
                  <td><code>NotifyApprovers</code>・<code>NotifyApplicant</code> の Data</td>
                  <td>遷移したときに行うべき処理を、データとして表す</td>
                </tr>
                <tr>
                  <th scope="row">遷移の処理</th>
                  <td><code>ExpenseWorkflow.transition</code></td>
                  <td>今の状態とイベントから、次の状態・書き換える列・effects を返す。保存も通知もしない</td>
                </tr>
                <tr>
                  <th scope="row">呼び出す側</th>
                  <td><code>ExpenseReport#fire!</code>・<code>ExpenseReportsController</code></td>
                  <td>条件付きの UPDATE で保存し、保存できたら effects を実行する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            これらの用語は UML（ソフトウェアの構造や動きを図で表すための標準の記法）の状態機械の定義に対応しています。UML 2.5.1 は、状態を「状態機械の実行中の、ある不変の条件が成り立っている状況」と定義しています。遷移は1つの状態から1つの状態へ向かう矢印で、指定したイベントが起きたときに実行され、実行のときに行う振る舞い（effect）を持てます。遷移に付けた<Term en="guard">ガード条件</Term>が偽なら、その遷移は実行されません<Ref n={2} />。状態機械を図で表す方法としては、David Harel が1987年に発表した statecharts も知られています<Ref n={3} />。
          </p>
          <h3>状態遷移図</h3>
          <Figure
            n="100-2"
            title="経費申請の状態遷移図"
            caption="角の丸い箱は状態、矢印は遷移を表す（凡例の「呼び出し」の矢印とは意味が違う）。矢印のラベルは UML の書き方にならい「イベント [ガード条件] / 遷移に伴う処理」の順に書いた。黒丸からの矢印は最初の状態を、二重の枠は最終の状態を表す。"
          >
            <StateDiagramFigure />
          </Figure>
          <p>
            図 100-2 で、draft から申請（submit）、承認（approve）、精算（pay）と進むのが通常の流れです。申請中の申請は、申請者が取り下げる（withdraw）と下書きに戻り、承認者が差し戻す（reject）と差し戻しの状態になります。差し戻された申請は直すために下書きに戻します（revise）。paid は最終の状態で、どのイベントも受け付けません。
          </p>
          <h3>遷移表</h3>
          <p>
            状態遷移図には、受け付けない組み合わせが描かれません。「承認済みの申請を差し戻せるか」は、矢印がないことから読み取るしかありません。そこで、状態を行、イベントを列にした<Term en="transition table">遷移表</Term>を作り、5つの状態と6つのイベントの30通りの組み合わせのすべてについて、受け付けるかどうかと遷移先を決めます。
          </p>
          <Figure n="100-3" title="状態 × イベントの遷移表" caption="30マスのうち、遷移するのは色の付いた6マスだけである。">
            <TransitionTableFigure />
          </Figure>
          <p>
            図 100-3 の × のマスは、「受け付けない」と決めたマスです。出発点のコードでは、承認済みの申請を差し戻せるかを誰も決めないまま「差し戻せる」になっていました。遷移表を作ると、受け付けないことも明示的に決めたことになり、業務の担当者と1マスずつ確かめられます。
          </p>
          <h3>遷移表とガード条件の違い</h3>
          <p>
            遷移表は「その状態で、そのイベントを受け付けるか」を決めます。ガード条件は受け付けるイベントのうち、そのときのデータ（誰が承認しようとしているかなど）によって遷移を許可するかを決めます。申請中の申請は承認を受け付けますが、承認しようとしているのが申請者本人なら遷移しません。遷移表だけを見て画面のボタンを出すと、本人の画面にも承認のボタンが出ます。出したくない場合は、ガード条件まで評価して判断します（AASM なら <code>may_approve?</code>）。
          </p>
          <h3>状態ごとに持つデータを決める</h3>
          <p>
            申請日時は下書き以外の状態に、承認者と承認日時は承認済みと精算済みの状態に、差し戻した人と差し戻しの理由は差し戻しの状態にだけ意味があります。MSDP の Ruby の例は、状態ごとに別の Data のクラスを作り、承認者を持てるのは Approved と Paid だけにしていました。Active Record では1つの行を1つのクラスで表すので、この章では状態ごとに必要な列と持ってはいけない列を DB の<Term en="CHECK constraint">CHECK 制約</Term>で決め、遷移の処理が書き換える列を状態ごとに決めます。CHECK 制約は、表の各行が満たすべき条件を DB に登録し、条件を満たさない行の追加や更新を DB が拒否する仕組みです。
          </p>
          <p>
            ただし、CHECK 制約が検査できるのは1つの行の今の値だけです。精算済みの行の status を approved に書き換えても、承認者と承認日時は入ったままなので、CHECK 制約は通ります。「精算済みから承認済みには戻れない」という遷移の規則は、変更前の状態を知らないと判断できないので、遷移の処理で守ります。状態ごとのデータの組み合わせは DB でも検査し、遷移の規則はアプリの遷移の処理で守る、という分担になります。
          </p>
          <h3>遷移に伴う処理をどこで実行するか</h3>
          <p>
            申請すると承認者に、承認や差し戻しをすると申請者に通知します。この通知を遷移の処理の中で送ると、遷移の規則のテストに通知の代役が必要になり、保存に失敗したのに通知だけが送られることも起きます。Functional Core, Imperative Shell（<ChapterLink n={45} section="idea" />）では、判断を行う部分を外部に触れない処理にして結果をデータで返し、外部とのやり取りは外側で行いました。この章でも同じ分け方をします。遷移の処理は次の状態と effects を返すだけで、呼び出す側が保存した後に effects を実行します。保存と通知を確実に両方行う方法は Transactional Outbox（<ChapterLink n={53} section="idea" />）で扱います。
          </p>
          <h3>構造</h3>
          <Figure n="100-4" title="遷移の処理と、呼び出す側の役割" caption="点線の枠の中が状態機械で、DB にも通知にも触れない。実線の矢印は呼び出し、破線の矢印は戻り値と参照を表す。">
            <StructureFigure />
          </Figure>
          <p>図 100-4 の呼び出す側の処理の順序は次のとおりです。</p>
          <ol>
            <li>コントローラーが DB から申請を読み込み、イベントを作って <code>fire!</code> に渡す。</li>
            <li><code>fire!</code> は <code>ExpenseWorkflow.transition</code> を呼び、遷移表とガード条件で判断した結果（次の状態・書き換える列・effects）を受け取る。遷移できなければ例外になり、何も保存せず、何も通知しない。</li>
            <li><code>fire!</code> は、読み込んだときの状態を条件にした UPDATE で保存する。ほかの操作が先に状態を変えていれば、1行も更新されないので失敗にする。</li>
            <li>保存できたら、コントローラーが effects を実行する（通知のジョブを投入する）。</li>
          </ol>
          <p>
            遷移表（TRANSITIONS）は、画面のボタンとテストが読むデータです。遷移の処理（transition）は、ガード条件と書き換える列まで含む実装です。同じ規則を2つの形で持つので、2つが一致していることを遷移表の30マスのすべてを確かめるテストで保証します。
          </p>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装：enum・遷移表・条件付きの UPDATE・CHECK 制約',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  controllers/expense_reports_controller.rb   # 呼び出す側（イベントを作り、effects を実行する）
  models/expense_report.rb                    # 状態の一覧と、状態を変える唯一のメソッド fire!
  models/expense_workflow.rb                  # 遷移表・イベント・effects・遷移の処理（DB に触れない）
  models/expense_notifier.rb                  # effects をメールのジョブにする
  mailers/expense_mailer.rb
db/migrate/20261121000001_create_members_and_expense_reports.rb
spec/models/  spec/requests/
`}
          />
          <h3>マイグレーション</h3>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_members_and_expense_reports.rb（expense_reports の部分）"
            code={`
create_table :expense_reports do |t|
  t.references :applicant, null: false, foreign_key: { to_table: :members }
  t.integer :amount, null: false
  t.string :status, null: false, default: "draft"
  t.datetime :submitted_at
  t.references :approved_by, foreign_key: { to_table: :members }
  t.datetime :approved_at
  t.references :rejected_by, foreign_key: { to_table: :members }
  t.string :reject_reason
  t.datetime :paid_at
  t.timestamps

  # 状態の値と、状態ごとに必要な列・持ってはいけない列を DB でも検査する（「A なら B」は「A でない、または B」と書く）
  t.check_constraint "status IN ('draft', 'submitted', 'approved', 'rejected', 'paid')",
                     name: "expense_reports_status_known"
  t.check_constraint "status = 'draft' OR submitted_at IS NOT NULL",
                     name: "expense_reports_submitted_at"
  t.check_constraint "status NOT IN ('approved', 'paid') OR (approved_by_id IS NOT NULL AND approved_at IS NOT NULL)",
                     name: "expense_reports_approval"
  t.check_constraint "status <> 'paid' OR paid_at IS NOT NULL",
                     name: "expense_reports_paid_at"
  t.check_constraint "status <> 'rejected' OR (rejected_by_id IS NOT NULL AND reject_reason IS NOT NULL AND reject_reason <> '')",
                     name: "expense_reports_rejection"
  t.check_constraint "status = 'rejected' OR (rejected_by_id IS NULL AND reject_reason IS NULL)",
                     name: "expense_reports_rejection_only_when_rejected"
end
`}
          />
          <p>
            4つのフラグの列を、文字列の <code>status</code> 列1つにしました。文字列にしたのは、DB を直接読んでも意味が分かるようにするためです（整数と文字列の選び方は<ChapterLink n={27} section="model-data-design" />）。6つの CHECK 制約は次の意味です。
          </p>
          <ul>
            <li>status_known：status が5つの状態のどれかである。</li>
            <li>submitted_at：下書き以外なら申請日時がある。</li>
            <li>approval：承認済みか精算済みなら、承認者と承認日時がある。</li>
            <li>paid_at：精算済みなら精算日時がある。</li>
            <li>rejection：差し戻しなら、差し戻した人と、空でない理由がある。</li>
            <li>rejection_only_when_rejected：差し戻し以外の状態には、差し戻した人と理由がない。出発点で見た「承認済みなのに理由が入っている」行を DB が拒否します。</li>
          </ul>
          <p>
            「A なら B」は、CHECK 制約では「A でない、または B」と書きます。MySQL は 8.0.16 から CHECK 制約を検査します。MySQL の CHECK 制約は、外部キーで ON DELETE CASCADE などの参照動作を指定した列には使えない、という制限もあります<Ref n={9} />。この表の外部キーは参照動作を指定していないので、承認者の列も CHECK 制約で使えます。schema.rb には、MySQL が正規化した <code>(`status` &lt;&gt; _utf8mb4'paid') or …</code> の形で出力されます。
          </p>
          <h3>CHECK 制約は結果が NULL の行を通す</h3>
          <p>
            rejection の条件に <code>reject_reason IS NOT NULL</code> と <code>reject_reason &lt;&gt; ''</code> の両方を書いているのは、SQL では NULL との比較の結果が NULL（不明）になり、CHECK 制約は結果が NULL の行を受け付けるからです。MySQL のマニュアルも、条件が TRUE か UNKNOWN（NULL の値のとき）なら通り、FALSE のときだけ失敗すると書いています<Ref n={9} />。一時的な表で確かめました。
          </p>
          <Code
            lang="text"
            title="実行結果（MySQL 8.4）"
            code={`
SELECT NULL <> ''                          => NULL
CREATE TEMPORARY TABLE check_demo (reason varchar(10), CONSTRAINT reason_not_empty CHECK (reason <> ''))
INSERT INTO check_demo VALUES (NULL)       => 成功
INSERT INTO check_demo VALUES ('')         => ActiveRecord::CheckViolation: Check constraint 'reason_not_empty' is violated.
SELECT COALESCE(reason, 'NULL') FROM check_demo  => ["NULL"]

（expense_reports で、差し戻しの理由だけを変えて rejected にする）
reject_reason = NULL => ActiveRecord::CheckViolation: Check constraint 'expense_reports_rejection' is violated.
reject_reason = ''   => ActiveRecord::CheckViolation: Check constraint 'expense_reports_rejection' is violated.
`}
          />
          <p>
            <code>reason &lt;&gt; ''</code> だけの制約は、空文字を拒否しても NULL を通しました。expense_reports の制約は <code>IS NOT NULL</code> も書いているので、どちらも拒否しました。NULL になりうる列を CHECK 制約で検査するときは、<code>IS NOT NULL</code> を明示します。
          </p>
          <h3>遷移表と遷移の処理</h3>
          <Code
            lang="ruby"
            title="app/models/expense_workflow.rb"
            code={`
# 経費申請の状態機械。遷移の規則だけを持ち、DB にも通知にも触れない
module ExpenseWorkflow
  class InvalidTransition < StandardError; end

  # イベント（遷移を起こす操作）
  Submit = Data.define(:at)
  Withdraw = Data.define
  Approve = Data.define(:approver_id, :at)
  Reject = Data.define(:approver_id, :reason)
  Revise = Data.define
  Pay = Data.define(:at)

  # 遷移に伴って行うこと。実行は呼び出す側が行う
  NotifyApprovers = Data.define(:report_id)
  NotifyApplicant = Data.define(:report_id, :message)

  # 遷移の結果：元の状態・次の状態・書き換える列・行うこと
  Transition = Data.define(:from, :to, :changes, :effects)

  # 遷移表：状態ごとに、受け付けるイベントと次の状態
  TRANSITIONS = {
    "draft" => { Submit => "submitted" },
    "submitted" => { Withdraw => "draft", Approve => "approved", Reject => "rejected" },
    "approved" => { Pay => "paid" },
    "rejected" => { Revise => "draft" },
    "paid" => {}
  }.freeze

  def self.available_events(status) = TRANSITIONS.fetch(status).keys

  # report の属性を読むだけで、保存も通知もしない
  def self.transition(report, event)
    to = TRANSITIONS.fetch(report.status)[event.class]
    raise InvalidTransition, "#{report.status} の申請は #{event.class.name.demodulize} できません" unless to

    changes, effects =
      case event
      in Submit
        guard!(report.amount.positive?, "金額が0円の申請はできません")
        [{ submitted_at: event.at }, [NotifyApprovers.new(report.id)]]
      in Withdraw
        [{ submitted_at: nil }, []]
      in Approve
        guard!(event.approver_id != report.applicant_id, "申請者本人は承認できません")
        [{ approved_by_id: event.approver_id, approved_at: event.at }, [NotifyApplicant.new(report.id, "承認されました")]]
      in Reject
        guard!(event.reason.to_s.strip.present?, "差し戻しの理由を入力してください")
        [{ rejected_by_id: event.approver_id, reject_reason: event.reason },
         [NotifyApplicant.new(report.id, "差し戻されました：#{event.reason}")]]
      in Revise
        [{ submitted_at: nil, rejected_by_id: nil, reject_reason: nil }, []]
      in Pay
        [{ paid_at: event.at }, []]
      end
    Transition.new(from: report.status, to:, changes:, effects:)
  end

  def self.guard!(ok, message)
    raise InvalidTransition, message unless ok
  end
  private_class_method :guard!
end
`}
          />
          <ul>
            <li>
              遷移表は状態の文字列をキーに、「イベントのクラス =&gt; 次の状態」の Hash を値にした Hash です。<code>TRANSITIONS.fetch(report.status)</code> は、遷移表に状態を書き忘れると KeyError になるので、書き忘れはテストで見つかります。<code>available_events</code> は画面のボタンの出し分けに使います。
            </li>
            <li>
              transition はまず遷移表で受け付けるかを確かめ、次に <code>case event in Submit</code> のパターンマッチでイベントごとのガード条件を確かめます。ガード条件を満たさないときは、理由のメッセージを付けて InvalidTransition を投げます。
            </li>
            <li>
              戻り値の Transition は元の状態、次の状態、書き換える列（changes）、行うこと（effects）を持つ Data です。下書きに戻る withdraw と revise は、申請日時や差し戻しの情報を nil に戻す列を返します。CHECK 制約の rejection_only_when_rejected があるので、revise で差し戻しの情報を消し忘れると、保存の時点で DB が拒否します。
            </li>
            <li>
              transition は <code>report</code> の status・amount・applicant_id・id を読むだけで、保存も通知もしません。テストでは Active Record のレコードの代わりに、同じ属性を持つ Data を渡せます。
            </li>
          </ul>
          <h3>状態を変えるメソッドだけを公開するモデル</h3>
          <Code
            lang="ruby"
            title="app/models/expense_report.rb"
            code={`
class ExpenseReport < ApplicationRecord
  class StaleState < StandardError; end

  belongs_to :applicant, class_name: "Member"
  belongs_to :approved_by, class_name: "Member", optional: true
  belongs_to :rejected_by, class_name: "Member", optional: true

  # 状態の一覧。approved! のような、条件を確かめずに更新するメソッドは作らない
  enum :status, { draft: "draft", submitted: "submitted", approved: "approved", rejected: "rejected", paid: "paid" },
       instance_methods: false, validate: true
  # 作った後は代入・save・update_column で status を変えられない（ActiveRecord::ReadonlyAttributeError など）
  attr_readonly :status

  # 状態を変える唯一の公開メソッド。遷移の判断は ExpenseWorkflow に任せ、ここでは保存だけを行う。
  # 通知は effects として返し、呼び出す側が保存の後に実行する
  def fire!(event)
    transition = ExpenseWorkflow.transition(self, event)
    changed = self.class.where(id:, status: transition.from)
                  .update_all(transition.changes.merge(status: transition.to, updated_at: Time.current))
    raise StaleState, "ほかの操作で状態が変わりました。読み込み直してください" unless changed == 1

    reload
    transition.effects
  end

  def available_events = ExpenseWorkflow.available_events(status)
end
`}
          />
          <p>
            enum は状態の名前と保存する値の対応を決め、<code>ExpenseReport.submitted</code> のようなスコープを作りますが、遷移の規則は持ちません。enum が状態ごとに作る <code>approved!</code> のようなメソッドは、条件を確かめずに <code>update!</code> するので、<code>instance_methods: false</code> で作らないようにしています。<code>validate: true</code> は、定義にない値を代入したときに例外ではなく検証のエラーにします。これらは<ChapterLink n={30} section="state-management" />の「enum が自動で作る更新メソッド」で確かめました。
          </p>
          <p>
            <code>attr_readonly :status</code> は作った後の status を書き換えられなくします。Rails 7.1 以降の既定の設定（<code>load_defaults 7.1</code> で有効になる <code>raise_on_assign_to_attr_readonly</code>）では、保存済みのレコードの読み取り専用の属性に代入すると ActiveRecord::ReadonlyAttributeError になります<Ref n={5} />
            <Ref n={6} />。<code>update_column</code> と <code>update_columns</code> も、読み取り専用の属性を含むと ActiveRecordError を投げます<Ref n={7} />。こうすると、status を変える経路は <code>fire!</code> の中の <code>update_all</code> だけになります。
          </p>
          <Code
            lang="text"
            title="実行結果（下書きの申請 d の status を直接書き換える）"
            code={`
d.status = "paid"                    => ActiveRecord::ReadonlyAttributeError: status
d.update!(status: "paid")            => ActiveRecord::ReadonlyAttributeError: status
d.update_column(:status, "paid")     => ActiveRecord::ActiveRecordError: status is marked as readonly
ExpenseReport.where(id: d.id).update_all(status: "paid")
                                     => ActiveRecord::CheckViolation: Check constraint 'expense_reports_approval' is violated.
ExpenseReport.where(id: b.id).update_all(reject_reason: "古い理由")   # b は申請中
                                     => ActiveRecord::CheckViolation: Check constraint 'expense_reports_rejection_only_when_rejected' is violated.
`}
          />
          <p>
            <code>update_all</code> は SQL の UPDATE を1文作って送るだけで、モデルのインスタンスを作らず、コールバックも検証も動かさず、更新した行の数を返します<Ref n={8} />。読み取り専用の属性も確かめないので、モデルを通らない経路として残ります。最後の2つのように、その経路で作られた不正な組み合わせは CHECK 制約が拒否します。ただし、承認者と承認日時を入れたうえで status を approved にするような、形の正しい書き換えは CHECK 制約を通るので、<code>update_all</code> で status を書くのは <code>fire!</code> だけにすることを、コードレビューで確かめます。
          </p>
          <h3>同時の遷移を条件付きの UPDATE で防ぐ</h3>
          <p>
            <code>fire!</code> の UPDATE は、<code>WHERE id = … AND status = 元の状態</code> を条件にしています。2人の承認者（部長と課長）が同じ申請をほぼ同時に承認した場合を、別々の DB 接続を持つ2つのスレッドで試しました。2人とも申請中の状態を読み込み、0.2 秒後に書き込みます。a は条件を付けずに、読み込んだ状態で判断した結果を <code>update!</code> で保存する場合（attr_readonly のない別のクラスで試しました）、b は <code>fire!</code> の場合です。
          </p>
          <Code
            lang="text"
            title="実行結果（部長は id 2、課長は id 3）"
            code={`
== a: 読み込んだ状態で判断し、そのまま update! する
結果=[:ok, :ok]  投入された通知=2件
{"status" => "approved", "approved_by_id" => 3}

== b: fire!（WHERE status = 'submitted' の条件付き UPDATE）
  UPDATE \`expense_reports\` SET \`expense_reports\`.\`approved_by_id\` = 2, \`expense_reports\`.\`approved_at\` = '…',
    \`expense_reports\`.\`status\` = 'approved', \`expense_reports\`.\`updated_at\` = '…'
    WHERE \`expense_reports\`.\`id\` = 2 AND \`expense_reports\`.\`status\` = 'submitted'
  UPDATE \`expense_reports\` SET \`expense_reports\`.\`approved_by_id\` = 3, … WHERE \`expense_reports\`.\`id\` = 2 AND \`expense_reports\`.\`status\` = 'submitted'
結果=[:ok, "ExpenseReport::StaleState"]  投入された通知=1件
{"status" => "approved", "approved_by_id" => 2}
`}
          />
          <p>
            a では2人とも成功し、申請者に「承認されました」が2通届き、承認者は後から保存した課長で上書きされました。どちらの承認も、読み込んだ時点では正しい遷移だったからです。b では、先に UPDATE した部長の遷移だけが成功しました。課長の UPDATE は、部長の UPDATE がコミットされた後の行に対して <code>status = 'submitted'</code> を評価し、一致する行がないので 0 行を更新しました。MySQL の既定の分離レベル REPEATABLE READ でも、UPDATE はほかのトランザクションが確定した最新の行に対して働きます<Ref n={10} />。0 行のとき <code>fire!</code> は StaleState を投げるので、通知は投入されません。
          </p>
          <p>
            この方法は状態そのものを楽観的ロックのバージョンのように使うものです。行のロック（<code>with_lock</code>）を取って読み直してから判断する方法は<ChapterLink n={30} section="state-management" />の Order#ship! で、lock_version で同時の編集全般を検出する方法は<ChapterLink n={49} section="idea" />で扱います。条件付きの UPDATE は、状態以外の列（金額など）の同時の編集までは検出しません。
          </p>
          <h3>呼び出す側：保存してから通知する</h3>
          <Code
            lang="ruby"
            title="app/controllers/expense_reports_controller.rb・app/models/expense_notifier.rb"
            code={`
class ExpenseReportsController < ApplicationController
  # POST /expense_reports/:id/events/:event
  def fire
    report = ExpenseReport.find(params[:id])
    effects = report.fire!(build_event)  # 規則の確認と保存
    ExpenseNotifier.deliver(effects)     # 保存できた後に通知する
    render json: { status: report.status, available_events: report.available_events.map { it.name.demodulize.underscore } }
  rescue ExpenseWorkflow::InvalidTransition, ExpenseReport::StaleState => e
    render json: { error: e.message }, status: :conflict
  end

  private

  # 認証は省略し、操作した人を actor_id で受け取る
  def build_event
    actor_id = params[:actor_id]&.to_i
    case params[:event]
    when "submit" then ExpenseWorkflow::Submit.new(at: Time.current)
    when "withdraw" then ExpenseWorkflow::Withdraw.new
    when "approve" then ExpenseWorkflow::Approve.new(approver_id: actor_id, at: Time.current)
    when "reject" then ExpenseWorkflow::Reject.new(approver_id: actor_id, reason: params[:reason])
    when "revise" then ExpenseWorkflow::Revise.new
    when "pay" then ExpenseWorkflow::Pay.new(at: Time.current)
    else raise ExpenseWorkflow::InvalidTransition, "不明な操作です: #{params[:event]}"
    end
  end
end

# 遷移の effects を実際の通知にする（呼び出す側の処理）
module ExpenseNotifier
  def self.deliver(effects)
    effects.each do |effect|
      case effect
      in ExpenseWorkflow::NotifyApprovers(report_id:)
        ExpenseMailer.submitted(report_id).deliver_later
      in ExpenseWorkflow::NotifyApplicant(report_id:, message:)
        ExpenseMailer.decided(report_id, message).deliver_later
      end
    end
  end
end
`}
          />
          <p>
            出発点の4つのアクションは、イベントの名前で分ける1つのアクションになりました。コントローラーが受け持つのは、入力からイベントを作ること、<code>fire!</code> を呼ぶこと、返された effects を通知にすること、失敗を 409 にすることだけです。遷移できない操作は、古い画面からボタンを押したときなどに普通に起きるので、理由のメッセージを返します。
          </p>
          <p>
            <code>fire!</code> の UPDATE はトランザクションの外で1文ずつ確定するので、<code>deliver_later</code> を呼ぶ時点で状態の変更はコミット済みです。<code>fire!</code> をほかの更新と一緒に <code>transaction</code> の中で呼ぶ場合は、ジョブがコミット前に投入されないよう、通知を <code>ActiveRecord.after_all_transactions_commit</code> のブロックの中で投入します<Ref n={11} />（<ChapterLink n={18} section="transaction" />）。出発点と同じ操作を送った結果です。
          </p>
          <Code
            lang="text"
            title="実行結果（POST /expense_reports/:id/events/:event）"
            code={`
== 1
submit                                   => 200 {"status":"submitted","available_events":["withdraw","approve","reject"]}
approve actor_id=1                       => 409 {"error":"申請者本人は承認できません"}
approve actor_id=2                       => 200 {"status":"approved","available_events":["pay"]}
== 2
reject actor_id=2 reason=領収書がありません => 409 {"error":"approved の申請は Reject できません"}
pay                                      => 200 {"status":"paid","available_events":[]}
{"status" => "paid", "approved_by_id" => 2, "reject_reason" => nil, "paid_at" => "（日時）"}
== 3
submit                                   => 200 {"status":"submitted", …}
reject actor_id=2 reason=                => 409 {"error":"差し戻しの理由を入力してください"}
reject actor_id=2 reason=日付が違います    => 200 {"status":"rejected","available_events":["revise"]}
submit                                   => 409 {"error":"rejected の申請は Submit できません"}
revise                                   => 200 {"status":"draft","available_events":["submit"]}
submit                                   => 200 {"status":"submitted", …}
== 4
submit（0円）                             => 409 {"error":"金額が0円の申請はできません"}
投入された通知: ["ExpenseMailer#submitted", "ExpenseMailer#decided", "ExpenseMailer#submitted",
                 "ExpenseMailer#decided", "ExpenseMailer#submitted"]
`}
          />
          <p>
            本人の承認、承認済みの申請の差し戻し、理由のない差し戻し、差し戻しのままの再申請、0円の申請が、どれも理由付きの 409 になりました。差し戻された申請は revise で下書きに戻してから申請し直すので、状態が1つに決まります。通知は遷移が保存されたときだけ投入されています。画面は <code>available_events</code> を読んでボタンを出し分けられます。
          </p>
          <h3>直していく順序</h3>
          <ol>
            <li>状態を洗い出します。フラグの組み合わせのうち意味のあるものに名前を付けます（図 100-1）。</li>
            <li>遷移表を作り、すべてのマスの遷移先とガード条件を業務の担当者と確かめます。</li>
            <li>遷移表をテストにします。30マスのテストを先に書きます。</li>
            <li>
              <code>status</code> 列を加え、既存の行をフラグから変換します。図 100-1 の不正な組み合わせの行は機械的に変換できないので、先に件数を数え、業務の担当者と1件ずつ扱いを決めます。変換したら CHECK 制約を加えます（既存のテーブルに制約を加える手順は<ChapterLink n={27} section="indexes-constraints" />）。
            </li>
            <li>遷移の処理を作り、各アクションの中身を transition の各 in に移し、通知は effects で返します。</li>
            <li>呼び出す側を <code>fire!</code> に書き換えます。画面ごとの「承認待ち」の where は <code>ExpenseReport.submitted</code> のスコープにそろえます。</li>
            <li>フラグを読むコードがなくなったことを確かめてから、フラグの列を消します。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'aasm',
      title: 'AASM を使う場合',
      body: (
        <>
          <p>
            遷移の規則を Active Record のモデルに宣言で書く gem に、AASM があります<Ref n={12} />。状態・イベント・遷移・ガード条件・コールバックを1つのブロックに書き、<code>approve!</code> のように <code>!</code> を付けたイベントのメソッドを呼ぶと、遷移して保存します。同じ expense_reports のテーブルを AASM 6.0.0 で扱うクラスを書きました。
          </p>
          <Code
            lang="ruby"
            title="app/models/aasm_expense_report.rb（同じテーブルを AASM で扱う、比べるためのクラス）"
            code={`
class AasmExpenseReport < ApplicationRecord
  self.table_name = "expense_reports"
  include AASM

  belongs_to :applicant, class_name: "Member"
  belongs_to :approved_by, class_name: "Member", optional: true
  belongs_to :rejected_by, class_name: "Member", optional: true

  # requires_lock: ! のイベントは、行を SELECT ... FOR UPDATE で読み直してから遷移する
  # no_direct_assignment: status への直接の代入を AASM::NoDirectAssignmentError にする
  aasm column: :status, requires_lock: true, no_direct_assignment: true do
    state :draft, initial: true
    state :submitted, :approved, :rejected, :paid

    event :submit do
      transitions from: :draft, to: :submitted, guard: -> { amount.positive? },
                  after: -> { self.submitted_at = Time.current }
    end

    event :withdraw do
      transitions from: :submitted, to: :draft, after: -> { self.submitted_at = nil }
    end

    # 値の設定は、ガードを通った後に動く transitions の after: に書く
    event :approve do
      transitions from: :submitted, to: :approved, guard: ->(approver) { approver != applicant },
                  after: ->(approver) { self.approved_by = approver; self.approved_at = Time.current }
    end

    event :reject do
      transitions from: :submitted, to: :rejected, guard: ->(_approver, reason) { reason.to_s.strip.present? },
                  after: ->(approver, reason) { self.rejected_by = approver; self.reject_reason = reason }
    end

    event :revise do
      transitions from: :rejected, to: :draft,
                  after: -> { self.submitted_at = nil; self.rejected_by = nil; self.reject_reason = nil }
    end

    event :pay do
      transitions from: :approved, to: :paid, after: -> { self.paid_at = Time.current }
    end
  end
end
`}
          />
          <p>
            <code>aasm column: :status</code> で状態を保存する列を指定し、<code>state</code> で状態を、<code>event</code> でイベントを宣言します。<code>transitions</code> が遷移表の1マスに当たり、<code>guard:</code> が偽になると遷移は拒否されます。イベントを呼ぶときの引数（<code>approve!(boss)</code> の boss）は、<code>guard:</code> と <code>after:</code> のラムダに渡されます。受け付けない遷移とガードで拒否された遷移は、既定では AASM::InvalidTransition になります<Ref n={12} />。
          </p>
          <Code
            lang="text"
            title="実行結果（AASM 6.0.0）"
            code={`
r.submit!; r.approve!(boss); r.pay!
r.reload.slice(:status, :approved_by_id)  => {"status" => "paid", "approved_by_id" => 2}

d.approve!(boss)                 => AASM::InvalidTransition: Event 'approve' cannot transition from 'draft'.
d.submit!
d.may_approve?(boss)             => true
d.may_approve?(sato)             => false（本人。ガード条件まで評価する）
d.may_pay?                       => false
d.approve!(sato)                 => AASM::InvalidTransition: Event 'approve' cannot transition from 'submitted'.
                                    Failed callback(s): ["/work/ch47/app/models/aasm_expense_report.rb#27"].
d.approved_by_id                 => nil
d.status = "paid"                => AASM::NoDirectAssignmentError: direct assignment of AASM column has been disabled …
d.update_column(:status, "paid") => ActiveRecord::CheckViolation: Check constraint 'expense_reports_approval' is violated.
`}
          />
          <p>
            <code>may_approve?</code> は、ガード条件まで評価して今その操作ができるかを返すので、画面のボタンの出し分けに使えます。<code>no_direct_assignment: true</code> は status への代入を禁止しますが、<code>update_column</code> のようにモデルの代入を通らない書き換えは止めないので、CHECK 制約が拒否しています。
          </p>
          <h3>event の before はガードより先に動く</h3>
          <p>
            AASM の README は、コールバックが呼ばれる順序を「event の before_all_events → event の before → event の guards → transition の guards → … → transition の after → …」と示しています<Ref n={13} />。ソースでも、イベントを実行するメソッドは before のコールバックを呼んでから <code>may_fire?</code> でガード条件を評価しています<Ref n={14} />。そのため、承認者の設定をイベントの <code>before</code> に書くと、ガードで拒否された場合にも値がモデルに残ります。
          </p>
          <Code
            lang="ruby"
            title="承認者の設定を event の before に書いた場合（script/aasm_probe.rb の BeforeReport）"
            code={`
event :approve, before: ->(approver) { self.approved_by = approver; self.approved_at = Time.current } do
  transitions from: :submitted, to: :approved, guard: ->(approver) { approver != applicant }
end
`}
          />
          <Code
            lang="text"
            title="実行結果（AASM 6.0.0）"
            code={`
x.submit!
x.approve!(sato)       => AASM::InvalidTransition: Event 'approve' cannot transition from 'submitted'. …
x.status               => "submitted"
x.approved_by_id       => 1（ガードで拒否されたのに、申請者本人が承認者として残った）
x.update!(amount: 7_500)   # 金額だけを直したつもり
BeforeReport.find(x.id).slice(:status, :amount, :approved_by_id)
                       => {"status" => "submitted", "amount" => 7500, "approved_by_id" => 1}
`}
          />
          <p>
            遷移は拒否されましたが、承認者の列には申請者本人の id が残り、その後の <code>update!</code> で DB に保存されました。この表の CHECK 制約は「申請中の行に承認者がない」ことまでは検査しないので、DB も拒否しません。遷移に伴う値の設定は、ガードを通って遷移が決まった後に動く <code>transitions</code> の <code>after:</code> に書きます。上の AasmExpenseReport はそのように書いているので、<code>approve!(sato)</code> の後も <code>approved_by_id</code> は nil のままでした。
          </p>
          <h3>同時の遷移と保存の失敗</h3>
          <p>
            <code>requires_lock: true</code> を指定すると、<code>!</code> のイベントはトランザクションの中で行を <code>SELECT … FOR UPDATE</code> でロックして読み直してから遷移します<Ref n={13} />。2人が同時に <code>approve!</code> した結果です。
          </p>
          <Code
            lang="text"
            title="実行結果（AASM 6.0.0・MySQL 8.4）"
            code={`
  SELECT \`expense_reports\`.* FROM \`expense_reports\` WHERE \`expense_reports\`.\`id\` = 4 LIMIT 1 FOR UPDATE
  UPDATE \`expense_reports\` SET \`expense_reports\`.\`status\` = 'approved', \`expense_reports\`.\`approved_by_id\` = 2, … WHERE \`expense_reports\`.\`id\` = 4
  SELECT \`expense_reports\`.* FROM \`expense_reports\` WHERE \`expense_reports\`.\`id\` = 4 LIMIT 1 FOR UPDATE
結果=[:ok, "AASM::InvalidTransition"]  {"status" => "approved", "approved_by_id" => 2}
`}
          />
          <p>
            後の <code>approve!</code> は先のトランザクションのコミットを待ってから行を読み直し、approved の状態では approve を受け付けないので InvalidTransition になりました。AASM の既定は <code>requires_lock: false</code> なので、指定しなければ rails-impl の節の a と同じことが起きます。
          </p>
          <p>
            2026年7月5日の AASM 6.0.0 では <code>whiny_persistence</code> の既定が true になり、<code>!</code> のイベントで保存に失敗すると、false を返すのではなく例外が発生するようになりました。Ruby 2 と Rails 6 のサポートも終わりました<Ref n={15} />。5系から更新するときは、<code>!</code> のイベントの戻り値で失敗を判断しているコードがないかを確かめます。
          </p>
          <h3>AASM と、この章の遷移の処理との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">観点</th>
                  <th scope="col">AASM</th>
                  <th scope="col">遷移表と遷移の処理（この章）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">規則の書き方</th>
                  <td>モデルの中の宣言（state・event・transitions）</td>
                  <td>Hash の遷移表と、Ruby のメソッド</td>
                </tr>
                <tr>
                  <th scope="row">ボタンの出し分け</th>
                  <td><code>may_approve?</code>（ガード条件まで評価）</td>
                  <td><code>available_events</code>（遷移表だけ）。ガードまで見るなら transition を試す</td>
                </tr>
                <tr>
                  <th scope="row">保存</th>
                  <td><code>!</code> のイベントが save する。検証も動く</td>
                  <td><code>fire!</code> の update_all。検証とコールバックは動かない</td>
                </tr>
                <tr>
                  <th scope="row">同時の遷移</th>
                  <td><code>requires_lock</code> で行をロック</td>
                  <td>WHERE status = 元の状態 の条件付き UPDATE</td>
                </tr>
                <tr>
                  <th scope="row">通知</th>
                  <td>イベントの <code>after_commit</code>（after_commit_everywhere の gem が要る）か、呼び出す側</td>
                  <td>effects を返し、呼び出す側が実行する</td>
                </tr>
                <tr>
                  <th scope="row">テスト</th>
                  <td>DB を使うモデルのテストが中心</td>
                  <td>遷移の処理は DB なしでテストできる</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            AASM のイベントには <code>after_commit</code> のコールバックも書け、Active Record では after_commit_everywhere の gem を加えると、DB の更新がコミットされた後に動きます<Ref n={13} />。ただし、この章の考え方に合わせるなら、AASM には遷移の規則と列の値の設定だけを書き、通知は呼び出す側が <code>approve!</code> の成功の後に行います。
          </p>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストと動作の確認',
      body: (
        <>
          <p>
            遷移の処理は DB に触れないので、遷移表の30マスのすべてを速いテストで確かめられます。保存・同時の遷移・CHECK 制約・通知は、MySQL を使うモデルのテストと request spec で確かめます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/expense_workflow_spec.rb"
            code={`
require "rails_helper"

# 遷移の関数は属性を読むだけなので、DB のレコードの代わりに Data を渡せる
WorkflowReport = Data.define(:id, :status, :amount, :applicant_id)

RSpec.describe ExpenseWorkflow do
  W = ExpenseWorkflow # 例を短く書くための別名

  let(:now) { Time.zone.local(2026, 12, 1, 10, 0) }
  # ガード条件をすべて満たすイベント
  let(:events) do
    [W::Submit.new(at: now), W::Withdraw.new, W::Approve.new(approver_id: 2, at: now),
     W::Reject.new(approver_id: 2, reason: "領収書がありません"), W::Revise.new, W::Pay.new(at: now)]
  end

  describe "遷移表のすべてのマス（5つの状態 × 6つのイベント）" do
    W::TRANSITIONS.each do |status, row|
      %w[Submit Withdraw Approve Reject Revise Pay].each do |event_name|
        expected = row[W.const_get(event_name)]
        it "#{status} で #{event_name} → #{expected || '受け付けない'}" do
          report = WorkflowReport.new(id: 1, status:, amount: 5000, applicant_id: 1)
          event = events.find { it.class.name.demodulize == event_name }
          if expected
            expect(W.transition(report, event).to).to eq expected
          else
            expect { W.transition(report, event) }.to raise_error(W::InvalidTransition)
          end
        end
      end
    end
  end

  describe "ガード条件と effects" do
    let(:submitted) { WorkflowReport.new(id: 1, status: "submitted", amount: 5000, applicant_id: 1) }

    it "申請者本人は承認できない" do
      expect { W.transition(submitted, W::Approve.new(approver_id: 1, at: now)) }
        .to raise_error(W::InvalidTransition, "申請者本人は承認できません")
    end

    it "承認すると、書き換える列と申請者への通知を返す（保存も通知もしない）" do
      t = W.transition(submitted, W::Approve.new(approver_id: 2, at: now))
      expect(t).to eq W::Transition.new(
        from: "submitted", to: "approved",
        changes: { approved_by_id: 2, approved_at: now },
        effects: [W::NotifyApplicant.new(1, "承認されました")]
      )
    end
    # …（省略：0円の申請と、理由のない差し戻し）
  end
end
`}
          />
          <p>
            2重のループで、状態とイベントの組み合わせごとに1つのテストを作ります。期待値は遷移表から求めるので、このテストが遷移表と遷移の処理の一致を保証します。30マスのテストのイベントはガード条件をすべて満たす値にし、ガード条件で拒否される場合は別のテストで確かめます。Data は値が同じなら等しいので、通知の内容は代役を用意せずに、期待する Transition を Data で書いて <code>eq</code> で比べられます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/expense_report_spec.rb（抜粋）・spec/models/expense_report_concurrency_spec.rb（抜粋）"
            code={`
it "読み込んだ後にほかの操作で状態が変わっていたら StaleState" do
  report.fire!(ExpenseWorkflow::Submit.new(at: now))
  stale = ExpenseReport.find(report.id)
  report.fire!(ExpenseWorkflow::Withdraw.new) # 申請者が先に取り下げた
  expect { stale.fire!(ExpenseWorkflow::Approve.new(approver_id: boss.id, at: now)) }
    .to raise_error(ExpenseReport::StaleState)
  expect(report.reload.status).to eq "draft"
end

[nil, ""].each do |reason|
  it "差し戻しの理由が #{reason.inspect} の rejected は保存できない" do
    expect {
      ExpenseReport.where(id: report.id).update_all(status: "rejected", rejected_by_id: boss.id, reject_reason: reason)
    }.to raise_error(ActiveRecord::CheckViolation, /expense_reports_rejection/)
  end
end

RSpec.describe ExpenseReport, "同時の遷移" do
  self.use_transactional_tests = false # 別々の接続で同時に実行するため
  after { [ExpenseReport, Member].each(&:delete_all) }

  it "2人が同時に承認しても、遷移するのは1人だけ" do
    # …（省略：申請者・部長・課長を作り、申請する）
    results = [boss, chief].map { |approver|
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          loaded = ExpenseReport.find(report.id)
          sleep 0.2 # 2人とも submitted の状態を読み込んでから書き込む
          loaded.fire!(ExpenseWorkflow::Approve.new(approver_id: approver.id, at: Time.current))
          :ok
        rescue ExpenseReport::StaleState
          :stale
        end
      end
    }.map(&:value)

    expect(results).to contain_exactly(:ok, :stale)
    expect(report.reload.status).to eq "approved"
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/requests/expense_reports_spec.rb（抜粋）"
            code={`
it "保存できたときだけ通知を投入する" do
  fire(:submit)
  expect { fire(:approve, actor_id: sato.id) }.not_to have_enqueued_mail
  expect(response).to have_http_status(:conflict)
  expect(response.parsed_body["error"]).to eq "申請者本人は承認できません"

  expect { fire(:approve, actor_id: boss.id) }.to have_enqueued_mail(ExpenseMailer, :decided)
  expect(response.parsed_body).to eq("status" => "approved", "available_events" => ["pay"])
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation。MySQL 8.4。30マスの行は一部を省略）"
            code={`
AasmExpenseReport
  申請 → 承認 → 精算。! の付くイベントは遷移して保存する
  受け付けない遷移とガードで拒否された遷移は AASM::InvalidTransition。値は残らない
  status への直接の代入はできない（no_direct_assignment）
ExpenseReport 同時の遷移
  2人が同時に承認しても、遷移するのは1人だけ
ExpenseReport
  fire! は条件付きの UPDATE で保存し、effects を返す
  読み込んだ後にほかの操作で状態が変わっていたら StaleState
  status は代入・update!・update_column で書き換えられない
  差し戻して下書きに戻すと、申請日時と差し戻しの情報が消える
  DB の CHECK 制約（モデルを通らない update_all でも検査される）
    差し戻しの理由が nil の rejected は保存できない
    差し戻しの理由が "" の rejected は保存できない
    承認者のいない approved と、理由の入った submitted は保存できない
ExpenseWorkflow
  遷移表のすべてのマス（5つの状態 × 6つのイベント）
    draft で Submit → submitted
    draft で Withdraw → 受け付けない
    …
    submitted で Withdraw → draft
    submitted で Approve → approved
    submitted で Reject → rejected
    …
    approved で Reject → 受け付けない
    approved で Pay → paid
    …
    rejected で Revise → draft
    …
    paid で Pay → 受け付けない
  ガード条件と effects
    申請者本人は承認できない
    0円の申請と、理由のない差し戻しはできない
    承認すると、書き換える列と申請者への通知を返す（保存も通知もしない）
環境
  MySQL 8.4 につながる
POST /expense_reports/:id/events/:event
  保存できたときだけ通知を投入する
  承認済みの申請は差し戻せない
Finished in 0.53436 seconds (files took 0.87274 seconds to load)
47 examples, 0 failures
`}
          />
          <p>テストで確かめていることを、層ごとに整理します。</p>
          <ul>
            <li>遷移の処理のテスト（ExpenseWorkflow）は、30マスの受け付けるかどうかと遷移先、ガード条件の理由、effects の内容を確かめます。DB を使わないので速く、規則を変えたときに最初に直すテストです。</li>
            <li>モデルのテスト（ExpenseReport）は、条件付きの UPDATE、読み取り専用の status、CHECK 制約を確かめます。CHECK 制約のテストは <code>update_all</code> でモデルを通らずに書き込み、DB が拒否することを確かめます。</li>
            <li>同時の遷移のテストは、テストのトランザクションを使わず、別々の DB 接続で行います。各例を1つのトランザクションで包むと、すべてのスレッドが1本の接続を共有するので、同時の更新を再現できません（<ChapterLink n={20} section="transaction" />）。</li>
            <li>request spec は、遷移が保存されたときだけ通知のジョブが投入されることと、失敗が 409 と理由になることを確かめます。</li>
          </ul>
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
            <li>意味のない状態の組み合わせを、1つの status 列と CHECK 制約で作れなくなります。</li>
            <li>どの状態でどの操作ができるかを遷移表の1か所で読め、業務の担当者と規則を確かめる資料にもなります。</li>
            <li>遷移表のマスとテストを1対1で対応させられるので、確かめていない組み合わせが見つけやすくなります。</li>
            <li>画面のボタンの出し分けと、サーバーで操作を受け付ける判断が、同じ遷移表から作られます。「承認待ち」の条件も1つのスコープにそろいます。</li>
            <li>遷移の処理が外部に触れないので、DB や通知の代役なしでテストでき、通知は保存できたときだけ送られます。</li>
            <li>条件付きの UPDATE で、同じ申請への同時の遷移が1つだけ成功します。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>遷移表、イベントの Data、effects の Data、遷移の処理、呼び出す側と、定義が増えます。</li>
            <li>状態やイベントを1つ増やすと遷移表に行か列が1つ増え、増えたマスをすべて決める必要があります。</li>
            <li>状態の種類や状態ごとの列を変えるときは、遷移の処理と DB の CHECK 制約の両方を直す必要があります。</li>
            <li><code>update_all</code> で保存するので、モデルの検証とコールバックは動きません。遷移と一緒に検証したい値（金額の上限など）は、ガード条件か DB の制約に書きます。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            規則の変更（「承認済みでも精算前なら差し戻せるようにする」など）で直す場所は、遷移表と遷移の処理に限られます。30マスのテストは期待値を遷移表から求めるので、変えたマスもそのまま確かめられます。呼び出す側のテストでは、保存と通知の順序と、失敗したときに通知しないことだけを確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>状態の列を、どこからでも書き換える</h3>
          <p>
            状態の列を作っても、コントローラーや管理画面やバッチが <code>update(status: "paid")</code> や enum の <code>paid!</code> で直接書き換えていると、遷移の規則は守られません。
          </p>
          <Code
            lang="ruby"
            title="避ける書き方（実行していない）"
            code={`
# 管理画面で「精算済みにする」ボタン
def mark_paid
  report = ExpenseReport.find(params[:id])
  report.update!(status: "paid", paid_at: Time.current) # 遷移表もガード条件も通らない
end
`}
          />
          <p>
            この章の ExpenseReport では、<code>instance_methods: false</code> で enum の <code>paid!</code> を作らず、<code>attr_readonly</code> で代入と <code>update_column</code> を止めたので、このコードは ReadonlyAttributeError になります。状態を変える処理は、管理画面からでも <code>fire!(ExpenseWorkflow::Pay.new(…))</code> を通します。それでも <code>update_all</code> と SQL は残るので、CHECK 制約で状態ごとの列を守り、データの修正で status を書き換えるときは、手順をレビューしてから実行します。
          </p>
          <h3>状態の列とフラグを併用する</h3>
          <p>
            status の列を作った後も <code>paid</code> のようなフラグの列を残すと、2つの列が食い違ったデータが生まれます。「status は approved なのに paid は true」の行ができると、どちらを信じるかがコードごとに変わります。移行の途中で両方を持つ期間は、フラグを読むコードを数えて減らしていき、なくなったらフラグの列を消します。
          </p>
          <h3>遷移の処理の中で保存や通知を行う</h3>
          <Code
            lang="ruby"
            title="避ける書き方（実行していない）"
            code={`
in Approve
  guard!(event.approver_id != report.applicant_id, "申請者本人は承認できません")
  ExpenseMailer.decided(report.id, "承認されました").deliver_now # 遷移の処理の中で送る
  [{ approved_by_id: event.approver_id, approved_at: event.at }, []]
`}
          />
          <p>
            遷移の処理の中でメールを送ると、その後の条件付きの UPDATE が StaleState で失敗したり、外側のトランザクションがロールバックされたりしても、送った通知は取り消せません。rails-impl の節の a で見た「2通の承認の通知」も、保存より先に通知を決めたことが原因です。遷移の処理は effects を返すだけにし、呼び出す側が保存できた後に実行します。テストでも、メールの代役を用意する必要がなくなります。
          </p>
          <h3>状態を細かく分けすぎる</h3>
          <p>
            「通知済みの申請中」と「通知前の申請中」や、「部長が承認した承認済み」と「課長が承認した承認済み」のように、受け付ける操作が変わらない違いまで状態にすると、遷移表の行が増えるだけです。状態として分けるのは、受け付けるイベントや遷移先が変わるものだけにし、それ以外は状態ごとの列（通知日時、承認者など）として持ちます。状態の組み合わせが増えてきたら、<ChapterLink n={30} section="state-management" />の「状態の組み合わせが増えたら分ける」のように、別のモデルにそれぞれの状態を持たせることも検討します。
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
            <li>真偽値1つ：状態が「有効」「無効」の2つで、どちらからどちらへも自由に切り替えられるなら、真偽値の列1つで足ります。</li>
            <li>
              enum と validate オプション：遷移の規則がほとんどない（どの状態からどの状態にも移れる）なら、enum で状態の一覧を決めるだけで足ります。Rails 7.1 で加わった <code>validate: true</code> を指定すると、定義にない値を代入したときに ArgumentError ではなく検証のエラーになり、フォームから状態を選ぶ画面でも扱いやすくなります<Ref n={4} />
              <Ref n={16} />。ただし、validate が確かめるのは値が一覧にあることだけで、どの状態から移れるかは確かめません。
            </li>
            <li>モデルのメソッド：遷移が2〜3個なら、<ChapterLink n={30} section="state-management" />の Order#ship! のように、遷移ごとのメソッドで条件の確認と更新をまとめるだけで足ります。遷移表を作るのは、状態とイベントが増えて、全体を1か所で見渡す必要が出てからです。</li>
          </ul>
          <h3>GoF の State との違い</h3>
          <p>
            GoF の『Design Patterns』（1994年刊<Ref n={17} />）は、状態による振る舞いの違いを扱うパターンとして State を挙げ、目的を「オブジェクトの内部の状態が変わったときに、オブジェクトが振る舞いを変えられるようにする。オブジェクトはクラスが変わったかのように見える」と書いています（この文は、GoF から引用している資料で確認しました<Ref n={18} />）。
          </p>
          <Figure n="100-5" title="GoF の State と、遷移表・遷移の処理の構造" caption="模式図。左の ReportState と状態ごとのクラスの名前は説明のために付けたもので、この章のコードにはない。破線の矢印は、インターフェースの実装と、データの参照を表す。">
            <StateVsTableFigure />
          </Figure>
          <p>
            図 100-5 の左の GoF の State では、状態ごとのクラスが共通のインターフェース（ReportState）を実装し、「この状態で approve を呼ばれたら何をするか」をそれぞれのクラスに書きます。ExpenseReport は今の状態のオブジェクトを持ち、操作を状態のオブジェクトに任せます。右のこの章の方法では、状態は status 列のデータで、規則は1つの遷移表と1つの遷移の処理にまとまります。
          </p>
          <ul>
            <li>GoF の State：遷移の規則は状態ごとのクラスに分かれます。「approve はどの状態で受け付けるか」を知るにはすべてのクラスを読む必要があり、イベントを1つ増やすとすべてのクラスにメソッドを足します。状態によって計算の中身そのものが大きく変わる場合（料金の計算方法が状態で違うなど）に向いています。</li>
            <li>遷移表と遷移の処理：遷移の規則が1つの表と1つの処理に集まり、全体を1か所で読めます。処理は次の状態と書き換える列を返し、状態のオブジェクトを書き換えません。振る舞いの違いが主に「どの操作を受け付け、どこに移るか」である業務のワークフローに向いています。</li>
          </ul>
          <h3>ほかのパターンとの違い</h3>
          <ul>
            <li>Strategy / Policy（<ChapterLink n={41} section="idea" />）：使う側が外から計算の方法を選びます。状態機械では、データの今の状態によって振る舞いが決まり、状態はイベントによって移ります。</li>
            <li>Optimistic Locking（<ChapterLink n={49} section="idea" />）：同じデータを2人が同時に編集したときの競合を検出します。この章の条件付きの UPDATE は状態の遷移だけを守るので、金額などの編集も守るなら組み合わせます。</li>
            <li>Domain Events（<ChapterLink n={51} section="idea" />）：「申請が承認された」のような業務上の出来事を、後続の処理（通知、会計への連携など）と切り離して扱います。この章の effects を、イベントの発行に置き換えることもできます。</li>
            <li>Value Object（<ChapterLink n={46} section="idea" />）：状態を持たない値です。状態はエンティティ（ExpenseReport）が持ち、操作によって変わります。</li>
          </ul>
          <h3>Rails の機能と gem</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">方法</th>
                  <th scope="col">向いている場合</th>
                  <th scope="col">注意</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">enum（instance_methods・validate）</th>
                  <td>状態の一覧と、問い合わせのスコープ</td>
                  <td>遷移の規則は持たない。! のメソッドは条件を確かめずに更新する</td>
                </tr>
                <tr>
                  <th scope="row">遷移表と遷移の処理（この章）</th>
                  <td>規則を DB なしでテストし、保存と通知を呼び出す側で制御したい</td>
                  <td>遷移表・処理・CHECK 制約を一緒に直す</td>
                </tr>
                <tr>
                  <th scope="row">AASM</th>
                  <td>モデルに宣言で書き、may_ やスコープも使いたい</td>
                  <td>event の before はガードより先に動く。requires_lock の既定は false</td>
                </tr>
                <tr>
                  <th scope="row">state_machines</th>
                  <td>Ruby のクラスの属性に状態機械を加えたい</td>
                  <td>DB への保存には state_machines-activerecord などの連携の gem を加える</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            state_machines は Ruby のクラスの属性に状態機械を加える gem で、DB への保存には state_machines-activerecord のような連携の gem を加えます<Ref n={19} />。どの gem を使う場合も、遷移表を作ってすべてのマスを決め、30マスのテストを書く手順は同じです。
          </p>
          <h3>採用する条件</h3>
          <ul>
            <li>状態が3つ以上あり、状態によって受け付ける操作が変わる</li>
            <li>状態の確認が、複数のアクションやモデル、画面とサーバーに分かれて書かれている</li>
            <li>ありえない組み合わせのデータが見つかったことがある、または真偽値のフラグが増え続けている</li>
            <li>承認フローや契約のように、状態の移り変わりの規則を業務の担当者と確かめる必要がある</li>
          </ul>
          <h3>採用しない方がよい条件</h3>
          <ul>
            <li>状態が2つで、状態によって受け付ける操作が変わらない</li>
            <li>状態が表示のための分類だけで、どの状態からどの状態にも移れる</li>
            <li>遷移が2〜3個で、モデルのメソッドで条件の確認と更新をまとめれば足りる</li>
          </ul>
          <h3>判断のチェックポイント</h3>
          <ol>
            <li>状態の一覧と、状態ごとに必要な列・持ってはいけない列を列挙したか</li>
            <li>遷移表のすべてのマス（受け付けないマスを含む）を決めたか</li>
            <li>遷移表で決めることと、ガード条件で決めることを区別しているか</li>
            <li>遷移の処理は保存や通知を行わず、次の状態と effects を返すだけか</li>
            <li>status を変える経路が1つに限られているか（enum の ! のメソッド、代入、update_column を止めたか）</li>
            <li>同じデータを2人が同時に操作したときに、遷移が1つだけ成功するか（条件付きの UPDATE かロック）</li>
            <li>DB の CHECK 制約で状態ごとの列を検査し、NULL になりうる列に IS NOT NULL を書いたか</li>
          </ol>
          <Callout kind="note" title="gem を使うか、自分で書くか">
            <p>
              状態とイベントが少なければ、この章の遷移表と遷移の処理は 60 行ほどで書けます。モデルの中に宣言で書き、<code>may_approve?</code> やスコープもまとめて使いたいなら AASM が使えます。どちらの場合も、遷移表を作ってすべてのマスを決めること、値の設定をガードの後に行うこと、同時の遷移と CHECK 制約を確かめることは同じです。
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
          <li>状態を真偽値のフラグの組み合わせで表すと、4つのフラグで16通りの組み合わせができ、本人による承認や承認済みの差し戻しのような、意味のある5つ以外の状態が作れてしまいます。</li>
          <li>状態の一覧と状態 × イベントの遷移表を作り、受け付けないマスも含めて30通りすべてを決めます。ガード条件は受け付けるイベントのうち、そのときのデータで遷移を許可するかを決めます。</li>
          <li>enum（instance_methods: false）と attr_readonly で、status を変える経路を <code>fire!</code> だけにします。遷移の処理は次の状態・書き換える列・effects を返すだけで、保存と通知は呼び出す側が行います。</li>
          <li><code>where(status: 元の状態).update_all</code> の条件付きの UPDATE で、同時の遷移は1つだけ成功し、通知も1回になります。</li>
          <li>CHECK 制約で状態ごとに必要な列と持ってはいけない列を検査します。CHECK は結果が NULL の行を通すので、NULL になりうる列には IS NOT NULL を書きます。遷移の規則そのものは CHECK では守れません。</li>
          <li>AASM 6.0 では event の before がガードより先に動くので、値の設定は transitions の after: に書きます。同時の遷移には requires_lock を指定します。</li>
          <li>GoF の State は規則を状態ごとのクラスに分け、遷移表と遷移の処理は規則を1か所に集めます。遷移が少なければモデルのメソッドや enum の validate で足ります。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Effective ML Revisited', publisher: 'Yaron Minsky／Jane Street Tech Blog', url: 'https://blog.janestreet.com/effective-ml-revisited/', accessed: '2026-11-13', version: '2011年3月9日', note: '見出し「Make illegal states unrepresentable」。' },
    { title: 'OMG Unified Modeling Language (OMG UML) Version 2.5.1', publisher: 'Object Management Group', url: 'https://www.omg.org/spec/UML/2.5.1/PDF', accessed: '2026-11-13', version: 'formal/2017-12-05（2017年12月）', note: '状態（14.2.3.4）、遷移・トリガー・ガード・effect（14.2.3.8）の定義。' },
    { title: 'Statecharts: a visual formalism for complex systems', publisher: 'David Harel／Science of Computer Programming, vol. 8, no. 3, pp. 231–274', url: 'https://doi.org/10.1016/0167-6423(87)90035-9', accessed: '2026-11-13', version: '1987年6月', note: '書誌情報（Crossref）で確認。論文の本文は参照していない。' },
    { title: 'ActiveRecord::Enum', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Enum.html', accessed: '2026-11-13', version: 'v8.1（内容は 8-1-stable のソースの説明で確認）', note: '生成されるメソッドとスコープ、文字列の列への保存、無効な値の ArgumentError、validate オプション。' },
    { title: 'activerecord/lib/active_record/readonly_attributes.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/readonly_attributes.rb#L30-L64`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'attr_readonly と、raise_on_assign_to_attr_readonly が有効なとき、保存済みのレコードの読み取り専用の属性への書き込みが ReadonlyAttributeError になること。' },
    { title: 'railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/configuration.rb#L269-L284`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'load_defaults 7.1 で active_record.raise_on_assign_to_attr_readonly が true になること。' },
    { title: 'activerecord/lib/active_record/persistence.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L598-L620`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'update_columns は検証とコールバックを飛ばし、読み取り専用の属性を含むと ActiveRecordError を投げること。' },
    { title: 'activerecord/lib/active_record/relation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb#L574-L602`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'update_all は UPDATE を1文作って送り、コールバックと検証を動かさず、更新した行の数を返すこと。' },
    { title: 'CHECK Constraints', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: '条件が TRUE か UNKNOWN（NULL の値）なら通り FALSE なら失敗すること、外部キーの参照動作を指定した列には使えないこと。' },
    { title: 'Consistent Nonlocking Reads', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'スナップショットは SELECT に適用され、UPDATE・DELETE はほかのトランザクションが確定した行に働くこと。' },
    { title: 'activerecord/lib/active_record.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record.rb#L560-L591`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'after_all_transactions_commit が、開いているトランザクションがすべてコミットされた後にだけブロックを呼ぶこと。' },
    { title: 'aasm/aasm', publisher: 'GitHub', url: 'https://github.com/aasm/aasm', accessed: '2026-11-13', version: '6.0.0（2026年7月5日）', note: 'イベントと遷移の定義、ガード、AASM::InvalidTransition、may_、! のイベントでの保存。' },
    { title: 'aasm/aasm README.md（v6.0.0）', publisher: 'GitHub', url: `${AASM_GH}/README.md`, accessed: '2026-11-20', version: '6.0.0', note: 'コールバックの順序（event の before → event の guards → transition の guards → … → transition の after）、requires_lock、no_direct_assignment、after_commit と after_commit_everywhere。' },
    { title: 'aasm/lib/aasm/aasm.rb（v6.0.0）', publisher: 'aasm/aasm（GitHub）', url: `${AASM_GH}/lib/aasm/aasm.rb#L97-L137`, accessed: '2026-11-20', version: '6.0.0', note: 'aasm_fire_event が before のコールバックを呼んでから may_fire? でガード条件を評価すること。' },
    { title: 'aasm/aasm CHANGELOG.md（v6.0.0）', publisher: 'GitHub', url: `${AASM_GH}/CHANGELOG.md`, accessed: '2026-11-20', version: '6.0.0（2026年7月5日）', note: 'whiny_persistence の既定が true になったこと、Ruby 2 と Rails 6 のサポート終了。' },
    { title: 'Active Record CHANGELOG（Rails 7.1.0）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.1.0/activerecord/CHANGELOG.md', accessed: '2026-11-13', version: '7.1.0.beta1（2023年9月13日）', note: '「Add validation option for enum」。' },
    { title: 'Design Patterns: Elements of Reusable Object-Oriented Software', publisher: 'Erich Gamma ほか／Addison-Wesley（InformIT の書籍ページ）', url: 'https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610', accessed: '2026-11-13', version: '1994年刊（著作権表記1995年）', note: 'GoF の書誌情報。' },
    { title: 'A brief Pattern Catalog', publisher: 'Orbital library documentation／Karlsruhe Institute of Technology', url: 'https://logic.kastel.kit.edu/ap/orbital/Orbital-doc/api/Patterns/Design/index.html', accessed: '2026-11-13', note: 'GoF の State の目的の文の引用（二次資料。書籍の本文では確認していない）。' },
    { title: 'state-machines/state_machines', publisher: 'GitHub', url: 'https://github.com/state-machines/state_machines', accessed: '2026-11-13', version: '0.202.0（2026年7月18日）。state_machines-activerecord は 0.200.0', note: 'Ruby のクラスの属性に状態機械を加える。DB への保存には連携の gem が要る。' },
  ],
}

export default chapter
