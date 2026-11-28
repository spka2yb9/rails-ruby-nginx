import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

type Tone = 'muted' | 'acc' | 'danger'

/** メッセージの文字。線に重なるので、後ろに背景色の帯を敷く。幅は英数字0.6字・それ以外1字で見積もる */
function Msg({ x, y, children, tone, mono }: { x: number; y: number; children: string; tone?: Tone; mono?: boolean }) {
  const w = [...children].reduce((n, c) => n + (c.charCodeAt(0) < 128 ? 0.6 : 1), 0) * 11 + 8
  return (
    <g>
      <rect x={x - w / 2} y={y - 8} width={w} height={16} fill="var(--fig-bg)" />
      <T x={x} y={y} anchor="middle" fs={11} tone={tone} mono={mono}>
        {children}
      </T>
    </g>
  )
}

/* ---------- 図 97-1 処理の置き場所 ---------- */
function PlacementFigure() {
  const cols = ['画面', 'API', 'CSV 取り込み']
  const rows: [string, [string, Tone?][]][] = [
    ['締め切り', [['確かめる'], ['確かめる'], ['なし', 'danger']]],
    ['申し込み済み', [['確かめる'], ['確かめる'], ['飛ばす']]],
    ['定員', [['確かめる'], ['なし', 'danger'], ['確かめる']]],
    ['保存', [['create!'], ['create!'], ['全体で1つの tx']]],
    ['確認メール', [['保存の後'], ['保存の後'], ['tx の中', 'danger']]],
  ]
  const colX = [124, 218, 312]
  return (
    <Svg
      id="97-1"
      w={780}
      h={290}
      label="適用前と適用後の処理の置き場所。適用前は画面・API・CSV 取り込みの3つのコントローラーが、締め切り・申し込み済み・定員の確認、保存、確認メールをそれぞれ書いている。API には定員の確認がなく、CSV には締め切りの確認がなく、CSV はトランザクションの中でメールを投入する。適用後は3つの呼び出し元が RegisterForEvent を呼び、RegisterForEvent がトランザクション・lock!・結果の形を受け持ち、規則は Event、重複の防止は Registration の一意索引、メールはコミットの後に RegistrationMailer で投入する"
    >
      <T x={20} y={18} bold>
        適用前：呼び出し元ごとに手順を書く
      </T>
      {cols.map((c, i) => (
        <T key={c} x={colX[i] + 45} y={46} anchor="middle" fs={12} bold>
          {c}
        </T>
      ))}
      {rows.map(([label, cells], r) => {
        const y = 62 + r * 32
        return (
          <g key={label}>
            <T x={20} y={y + 14} fs={12}>
              {label}
            </T>
            {cells.map(([text, tone], i) => (
              <g key={i}>
                <Box x={colX[i]} y={y} w={90} h={28} fill={tone === 'danger' ? 'box5' : 'bg'} />
                <T x={colX[i] + 45} y={y + 14} anchor="middle" fs={11} tone={tone} bold={tone === 'danger'}>
                  {text}
                </T>
              </g>
            ))}
          </g>
        )
      })}
      <T x={20} y={240} fs={12} tone="danger">
        API は定員を超え、CSV はロールバックの後もメールが届く
      </T>
      <T x={20} y={260} fs={12} tone="muted">
        規則を変えるときは3つのコントローラーを直す
      </T>

      <line x1={414} y1={10} x2={414} y2={280} stroke="var(--fig-line)" />

      <T x={430} y={18} bold>
        適用後：手順を RegisterForEvent にまとめる
      </T>
      {cols.map((c, i) => (
        <Box key={c} x={430 + i * 120} y={34} w={100} h={30} lines={c} fs={12} />
      ))}
      <Arrow x1={480} y1={64} x2={540} y2={94} />
      <Arrow x1={600} y1={64} x2={600} y2={94} />
      <Arrow x1={720} y1={64} x2={660} y2={94} />
      <Box x={470} y={96} w={260} h={52} lines={['RegisterForEvent#call', 'トランザクション・lock!・結果の形']} fs={12} fill="box5" bold subTone="muted" />
      <Arrow x1={520} y1={148} x2={480} y2={188} />
      <Arrow x1={600} y1={148} x2={588} y2={188} />
      <Arrow x1={680} y1={148} x2={708} y2={188} />
      <Box x={430} y={190} w={100} h={58} lines={['Event', '締め切り・重複', '定員の規則']} fs={11} bold subTone="muted" />
      <Box x={538} y={190} w={100} h={58} lines={['Registration', '一意索引で', '重複を防ぐ']} fs={11} bold subTone="muted" />
      <Box x={646} y={190} w={124} h={58} lines={['RegistrationMailer', 'コミットの後に', '投入する']} fs={11} bold subTone="muted" />
      <T x={600} y={272} anchor="middle" fs={12} tone="muted">
        コントローラーは入力と応答の変換だけを受け持つ
      </T>
    </Svg>
  )
}

/* ---------- 図 97-2 ユースケースの構造 ---------- */
function StructureFigure() {
  return (
    <Svg
      id="97-2"
      w={780}
      h={372}
      label="ユースケースの構造。3つのコントローラーが RegisterForEvent の call を呼び、Result を受け取る。RegisterForEvent は、ApplicationRecord.transaction と lock! で MySQL の events の行をロックし、Event の register! に規則の確認と保存を任せる。Event は Registration を保存し、断るときは RegistrationRejected を投げる。RegisterForEvent は ActiveRecord.after_all_transactions_commit に RegistrationMailer の deliver_later を登録し、コミットの後に Sidekiq のキューにジョブが入る。RegisterForEvent は HTTP のステータスコードやフラッシュを扱わない"
    >
      <Box
        x={20}
        y={20}
        w={256}
        h={60}
        lines={['RegistrationsController', 'Api::RegistrationsController', 'Admin::RegistrationImportsController']}
        fs={11}
        mono
      />
      <Arrow x1={110} y1={80} x2={110} y2={128} />
      <T x={100} y={104} anchor="end" fs={11} mono>
        call
      </T>
      <Arrow x1={190} y1={128} x2={190} y2={82} dashed />
      <T x={198} y={104} fs={11} tone="muted">
        Result を返す
      </T>
      <Box x={20} y={130} w={256} h={66} lines={['RegisterForEvent', 'call(event:, member:)', '手順・トランザクション・結果の形']} fs={12} fill="box5" bold accent subTone="muted" />
      <Arrow x1={148} y1={196} x2={148} y2={232} dashed />
      <Box x={20} y={234} w={256} h={60} lines={['Result（Data.define）', 'registration・code', 'success? は code == :ok']} fs={11} fill="bg" bold subTone="muted" />

      <Arrow d="M276,146 L306,146 L306,46 L336,46" />
      <Arrow x1={276} y1={163} x2={336} y2={163} />
      <Arrow d="M276,180 L306,180 L306,262 L336,262" />

      <Box x={338} y={22} w={220} h={48} lines={['ApplicationRecord.transaction', 'event.lock!（FOR UPDATE）']} fs={11} mono />
      <Arrow x1={558} y1={46} x2={598} y2={46} />
      <Box x={600} y={22} w={160} h={48} lines={['MySQL 8.4', 'events の行ロック']} fs={12} fill="box4" bold subTone="muted" />

      <Box x={338} y={128} w={220} h={70} lines={['Event（規則）', 'rejection_reason_for', 'register!', '断るとき RegistrationRejected']} fs={11} bold subTone="muted" />
      <Arrow x1={558} y1={163} x2={598} y2={163} />
      <Box x={600} y={136} w={160} h={54} lines={['Registration', 'event_id・member_id', 'の一意索引']} fs={11} bold subTone="muted" />

      <Box x={338} y={238} w={220} h={48} lines={['ActiveRecord.', 'after_all_transactions_commit']} fs={11} mono />
      <Arrow x1={558} y1={262} x2={584} y2={262} />
      <Box x={586} y={238} w={184} h={48} lines={['RegistrationMailer', '.confirmed.deliver_later']} fs={11} mono />
      <Arrow x1={678} y1={286} x2={678} y2={310} />
      <Box x={598} y={312} w={160} h={34} lines="Sidekiq（Redis）" fs={12} fill="box4" />
      <T x={448} y={302} anchor="middle" fs={11} tone="muted">
        コミットの後に投入する
      </T>
      <T x={20} y={356} fs={12} tone="muted">
        RegisterForEvent は HTTP のステータスコード・フラッシュ・CSV の行番号を扱わない
      </T>
    </Svg>
  )
}

/* ---------- 図 97-3 申し込みのシーケンス ---------- */
function SequenceFigure() {
  const xs = [70, 220, 380, 540, 690]
  const names = ['コントローラー', 'RegisterForEvent', 'MySQL（接続）', 'Event', 'Sidekiq（Redis）']
  const fills: ('box' | 'box4' | 'box5')[] = ['box', 'box5', 'box4', 'box', 'box4']
  return (
    <Svg
      id="97-3"
      w={780}
      h={440}
      label="申し込みのシーケンス。コントローラーが RegisterForEvent の call を呼ぶ。RegisterForEvent は BEGIN を送り、lock! で events の行を SELECT FOR UPDATE で読み直してロックする。Event の register! が、申し込み済みかを確かめる SELECT、定員を確かめる COUNT、registrations への INSERT を送り、registration を返す。RegisterForEvent が COMMIT を送るとロックが外れる。コミットの後で deliver_later によりメールのジョブを Sidekiq に投入し、Result.ok をコントローラーに返す。断るときは RegistrationRejected で ROLLBACK し、Result.failure を返す"
    >
      {names.map((n, i) => (
        <g key={n}>
          <Box x={xs[i] - 66} y={10} w={132} h={32} lines={n} fs={11} fill={fills[i]} />
          <line x1={xs[i]} y1={42} x2={xs[i]} y2={394} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <rect x={300} y={90} width={300} height={226} rx={4} fill="var(--fig-box5)" opacity={0.45} stroke="var(--fig-line)" strokeDasharray="2 3" />
      <T x={532} y={306} anchor="end" fs={11} tone="muted">
        トランザクションの中
      </T>
      <Arrow x1={xs[0]} y1={70} x2={xs[1] - 2} y2={70} />
      <Msg x={(xs[0] + xs[1]) / 2} y={60} mono>
        call(event:, member:)
      </Msg>
      <Arrow x1={xs[1]} y1={106} x2={xs[2] - 2} y2={106} />
      <Msg x={(xs[1] + xs[2]) / 2} y={98} mono>
        BEGIN
      </Msg>
      <Arrow x1={xs[1]} y1={138} x2={xs[2] - 2} y2={138} />
      <Msg x={(xs[1] + xs[2]) / 2} y={128}>
        ① lock!（FOR UPDATE）
      </Msg>
      <Arrow x1={xs[1]} y1={170} x2={xs[3] - 2} y2={170} />
      <Msg x={(xs[1] + xs[3]) / 2 + 40} y={160}>
        ② register!(member, now:)
      </Msg>
      <Arrow x1={xs[3]} y1={200} x2={xs[2] + 2} y2={200} />
      <Msg x={(xs[2] + xs[3]) / 2} y={192}>
        申し込み済みか（SELECT 1）
      </Msg>
      <Arrow x1={xs[3]} y1={228} x2={xs[2] + 2} y2={228} />
      <Msg x={(xs[2] + xs[3]) / 2} y={220}>
        定員（SELECT COUNT）
      </Msg>
      <Arrow x1={xs[3]} y1={256} x2={xs[2] + 2} y2={256} />
      <Msg x={(xs[2] + xs[3]) / 2} y={248} mono>
        INSERT registrations
      </Msg>
      <Arrow x1={xs[3]} y1={280} x2={xs[1] + 2} y2={280} dashed />
      <Msg x={(xs[1] + xs[3]) / 2 + 40} y={271} mono>
        registration
      </Msg>
      <Arrow x1={xs[1]} y1={306} x2={xs[2] - 2} y2={306} />
      <Msg x={(xs[1] + xs[2]) / 2} y={296}>
        ③ COMMIT
      </Msg>
      <Arrow x1={xs[1]} y1={346} x2={xs[4] - 2} y2={346} accent />
      <Msg x={(xs[1] + xs[4]) / 2} y={336} tone="acc">
        ④ コミットの後：deliver_later でジョブを投入
      </Msg>
      <Arrow x1={xs[1]} y1={380} x2={xs[0] + 2} y2={380} dashed />
      <Msg x={(xs[0] + xs[1]) / 2} y={370} mono>
        Result.ok(registration)
      </Msg>
      <T x={20} y={416} fs={11} tone="muted">
        断るときは ② で RegistrationRejected が起き、ROLLBACK の後に Result.failure(:full など) を返す。④ は行わない
      </T>
    </Svg>
  )
}

/* ---------- 図 97-4 メールを送るタイミング ---------- */
function MailTimingFigure() {
  return (
    <Svg
      id="97-4"
      w={780}
      h={300}
      label="左は、トランザクションの中で deliver_later を呼ぶ場合。Rails 8.1 の既定ではジョブがすぐにキューに入り、その後の例外でロールバックしても、ワーカーがメールを送る。右は、after_all_transactions_commit にブロックを登録する場合。コミットされたらジョブを投入し、ロールバックされたらブロックを捨てる"
    >
      <T x={20} y={20} bold>
        トランザクションの中で deliver_later
      </T>
      <Box x={20} y={40} w={210} h={34} lines="BEGIN・INSERT" fs={12} />
      <Arrow x1={125} y1={74} x2={125} y2={92} />
      <Box x={20} y={94} w={210} h={34} lines="deliver_later → すぐに投入" fs={12} fill="box4" />
      <Arrow x1={125} y1={128} x2={125} y2={146} />
      <Box x={20} y={148} w={210} h={34} lines="次の行で例外 → ROLLBACK" fs={12} />
      <Arrow x1={230} y1={111} x2={258} y2={111} />
      <Box x={260} y={94} w={110} h={34} lines="ワーカーが送信" fs={12} fill="box4" />
      <T x={20} y={214} fs={12} tone="danger">
        申し込みは残らないのに、
      </T>
      <T x={20} y={234} fs={12} tone="danger">
        「受け付けました」のメールが届く
      </T>

      <line x1={392} y1={10} x2={392} y2={290} stroke="var(--fig-line)" />

      <T x={410} y={20} bold>
        コミットの後に投入する（本章のコード）
      </T>
      <Box x={410} y={40} w={240} h={34} lines="BEGIN・INSERT" fs={12} />
      <Arrow x1={530} y1={74} x2={530} y2={92} />
      <Box x={410} y={94} w={240} h={34} lines="after_all_transactions_commit に登録" fs={11} />
      <Arrow x1={470} y1={128} x2={470} y2={146} />
      <Arrow x1={590} y1={128} x2={590} y2={146} />
      <Box x={410} y={148} w={116} h={34} lines="COMMIT" fs={12} accent />
      <Box x={534} y={148} w={116} h={34} lines="ROLLBACK" fs={12} />
      <Arrow x1={468} y1={182} x2={468} y2={200} accent />
      <Box x={410} y={202} w={116} h={34} lines="ジョブを投入" fs={12} fill="box4" />
      <T x={592} y={219} anchor="middle" fs={12} tone="muted">
        ブロックを捨てる
      </T>
      <T x={410} y={262} fs={12} tone="muted">
        コミットの直後にプロセスが止まると投入されない。
      </T>
      <T x={410} y={280} fs={12} tone="muted">
        この取りこぼしは Transactional Outbox で防ぐ
      </T>
    </Svg>
  )
}

/* ---------- 図 97-5（段階送り）同時の申し込みと lock! の位置 ---------- */
function RaceFigure({ step }: { step: number }) {
  const now = 40 + step * 30
  type Cell = [number, 0 | 1, string, Tone?]
  const left: Cell[] = [
    [70, 0, 'BEGIN・SELECT events'],
    [100, 1, 'BEGIN・SELECT events'],
    [130, 0, 'FOR UPDATE（ロック取得）'],
    [160, 1, 'FOR UPDATE（待つ）', 'muted'],
    [190, 0, 'COUNT=0 → INSERT'],
    [220, 0, 'COMMIT'],
    [250, 1, 'ロック取得・COUNT=0', 'danger'],
    [280, 1, 'INSERT → COMMIT', 'danger'],
  ]
  const right: Cell[] = [
    [70, 0, 'BEGIN・FOR UPDATE'],
    [100, 1, 'BEGIN・FOR UPDATE（待つ）', 'muted'],
    [130, 0, 'COUNT=0 → INSERT'],
    [160, 0, 'COMMIT'],
    [190, 1, 'ロック取得・COUNT=1'],
    [220, 1, ':full → ROLLBACK', 'acc'],
  ]
  const panel = (x0: number, title: string, cells: Cell[]) => {
    const cx = [x0 + 92, x0 + 282]
    return (
      <g>
        <T x={x0 + 10} y={18} bold>
          {title}
        </T>
        {['接続 A', '接続 B'].map((n, i) => (
          <g key={n}>
            <Box x={cx[i] - 60} y={32} w={120} h={24} lines={n} fs={12} />
            <line x1={cx[i]} y1={56} x2={cx[i]} y2={296} stroke="var(--fig-line)" strokeDasharray="3 4" />
          </g>
        ))}
        {cells.map(([y, c, text, tone]) => (
          <g key={`${y}-${c}`} opacity={y > now ? 0.2 : undefined}>
            <Box x={cx[c] - 86} y={y - 12} w={172} h={24} fill={tone === 'danger' ? 'box5' : 'bg'} dashed={tone === 'muted'} accent={y === now} />
            <T x={cx[c]} y={y} anchor="middle" fs={11} tone={tone} bold={tone === 'danger' || tone === 'acc'}>
              {text}
            </T>
          </g>
        ))}
      </g>
    )
  }
  return (
    <Svg
      id={`97-5-${step}`}
      w={780}
      h={346}
      label={`時刻 ${step}（全 8）までの処理を表示した状態。` + "残り1席のイベントに、接続 A と接続 B が同時に申し込むタイムライン。左は、トランザクションの中で先に SELECT してから lock! する順序。B は A のコミットの前に最初の SELECT をしているので、ロックを取った後の COUNT も古いスナップショットを読んで 0 になり、2件目を INSERT して定員を超える。右は、最初に lock! する本章の順序。B はロックを待ち、A のコミットの後に初めて普通の SELECT をするので COUNT が 1 になり、満席として ROLLBACK する"}
    >
      {panel(0, '先に読んでから lock!（REPEATABLE READ）', left)}
      <line x1={386} y1={10} x2={386} y2={336} stroke="var(--fig-line)" />
      {panel(392, '最初に lock!（本章のコード）', right)}
      <g opacity={step < 8 ? 0.2 : undefined}>
        <T x={10} y={312} fs={11} tone="muted">
          B の COUNT は、B の最初の SELECT の時点のスナップショットを読む
        </T>
        <T x={10} y={332} fs={12} tone="danger" bold>
          申し込み 2件（定員 1）
        </T>
      </g>
      <g opacity={step < 6 ? 0.2 : undefined}>
        <T x={402} y={312} fs={11} tone="muted">
          B の最初の普通の SELECT は A のコミットの後
        </T>
        <T x={402} y={332} fs={12} tone="acc" bold>
          申し込み 1件（定員 1）
        </T>
      </g>
    </Svg>
  )
}

const RACE_STEPS: [string, string, string][] = [
  ['時刻 1', 'A が BEGIN し、トランザクションで最初の普通の SELECT（Event.find）を実行します。', 'A が BEGIN し、最初の読み取りとして lock!（SELECT … FOR UPDATE）でイベントの行をロックします。'],
  ['時刻 2', 'B も BEGIN して普通の SELECT を実行します。REPEATABLE READ なので、B が以後の普通の SELECT で読むスナップショットはこの時点で決まります。', 'B の最初の読み取りも FOR UPDATE なので、A のロックが外れるまで待ちます。B のスナップショットはまだ決まっていません。'],
  ['時刻 3', 'A が lock! でイベントの行のロックを取ります。', 'A が COUNT で申し込みが 0 件であることを確かめ、INSERT します。'],
  ['時刻 4', 'B の lock! は、A のロックが外れるまで待ちます。', 'A が COMMIT し、ロックが外れます。'],
  ['時刻 5', 'A が COUNT で 0 件を確かめ、INSERT します。', 'B がロックを取ります。続く COUNT が B の最初の普通の SELECT になるので、A の申し込みが見えて 1 件です。'],
  ['時刻 6', 'A が COMMIT し、ロックが外れます。', 'B は満席（:full）と判断して ROLLBACK します。申し込みは 1 件です。'],
  ['時刻 7', 'B がロックを取ります。ロックを取る読み取りは最新の行を読みますが、続く COUNT は普通の SELECT なので、時刻 2 のスナップショットから数えて 0 件です。', '（処理は終わっています）'],
  ['時刻 8', 'B も INSERT して COMMIT し、定員 1 のイベントに申し込みが 2 件残ります。', '（処理は終わっています）'],
]

const raceSteps = RACE_STEPS.map(([label, left, right], i) => ({
  label,
  detail: (
    <>
      <RaceFigure step={i + 1} />
      <p>左（先に読んでから lock!）：{left}</p>
      <p>右（最初に lock!）：{right}</p>
    </>
  ),
}))

const chapter: Chapter = {
  number: 44,
  part: 9,
  title: 'Use Case / Application Service：イベントの参加申し込みの手順を1か所にまとめる',
  summary:
    'イベントの参加申し込みを、画面・API・管理画面の CSV 取り込みの3か所で受け付けるアプリを例に、手順をユースケースのクラス RegisterForEvent にまとめます。戻り値の形、トランザクションと行ロックによる定員の保護、コミットの後のメールの投入を MySQL 8.4 で確かめ、Repository を Rails で分けるかどうかも判断します。',
  goals: [
    '同じ業務操作の手順が複数の呼び出し元に書かれると、どのような食い違いが起きるかを実行結果から説明できる',
    'ユースケース・モデル・コントローラーの受け持ちを分け、規則をモデルに、手順とトランザクションをユースケースに置ける',
    '成功・断る理由・例外を区別した戻り値の形を決め、HTTP のステータスコードや画面の文言への変換を呼び出し元に任せられる',
    'lock! で定員の競合を防ぎ、MySQL の REPEATABLE READ では lock! をトランザクションの最初の読み取りにする理由を説明できる',
    'Rails 8.1 の enqueue_after_transaction_commit の既定を確かめ、ActiveRecord.after_all_transactions_commit でコミットの後にメールを投入できる',
    'Repository パターンの目的と、Rails ではスコープとクラスメソッドで足りる理由、それでも分ける場合を説明できる',
    'モデルのメソッド・Form Object・ActiveInteraction などの gem と比べて、ユースケースのクラスを作るかを判断できる',
  ],
  prerequisites: [15, 18, 33, 34],
  sections: [
    {
      id: 'scene',
      title: 'イベントの申し込みを3か所で受け付ける',
      body: (
        <>
          <p>
            この章では勉強会などのイベントへの参加の申し込みを例にします。会員はイベントのページの「申し込む」ボタンか、スマートフォンのアプリから申し込みます。アプリは JSON を返す API を呼びます。運営者は会場や電話で受け付けた参加者のメールアドレスを CSV ファイルにまとめ、管理画面から取り込みます。どの経路でも、次の手順で申し込みを受け付けます。
          </p>
          <ol>
            <li>締め切り（<code>registration_deadline</code>）を過ぎていないかを確かめる。</li>
            <li>同じ会員がすでに申し込んでいないかを確かめる。</li>
            <li>申し込みの数が定員（<code>capacity</code>）に達していないかを確かめる。</li>
            <li>申し込み（<code>registrations</code> の行）を保存し、確認のメールを送る。</li>
          </ol>
          <p>テーブルは3つです。同じ会員の二重の申し込みは registrations の一意索引でも防ぎます。</p>
          <Code
            lang="ruby"
            title="db/migrate/20261120000001_create_events_and_registrations.rb"
            code={`
class CreateEventsAndRegistrations < ActiveRecord::Migration[8.1]
  def change
    create_table :members do |t|
      t.string :name, null: false
      t.string :email, null: false, index: { unique: true }
      t.timestamps
    end

    create_table :events do |t|
      t.string :title, null: false
      t.integer :capacity, null: false
      t.datetime :registration_deadline, null: false
      t.timestamps
    end

    create_table :registrations do |t|
      t.references :event, null: false, foreign_key: true
      t.references :member, null: false, foreign_key: true
      t.timestamps
      t.index [:event_id, :member_id], unique: true # 同じ会員の二重の申し込みを DB でも防ぐ
    end
  end
end
`}
          />
          <h3>3つのコントローラーに書かれた手順</h3>
          <p>
            最初のコードでは手順をそれぞれのコントローラーに書いています。まず画面からの申し込みです。<code>current_member</code> はログイン中の会員を返すメソッドで、この章の検証用のアプリでは認証を省き、リクエストのヘッダーから会員の ID を読んでいます。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/registrations_controller.rb（パターンを使う前）"
            code={`
# 画面からの申し込み（パターンを使う前）
class RegistrationsController < ApplicationController
  def create
    event = Event.find(params[:event_id])

    if Time.current > event.registration_deadline
      return redirect_to(event, alert: "締め切りを過ぎています")
    end
    if event.registrations.exists?(member: current_member)
      return redirect_to(event, alert: "申し込み済みです")
    end
    if event.registrations.count >= event.capacity
      return redirect_to(event, alert: "満席です")
    end

    event.registrations.create!(member: current_member)
    RegistrationMailer.confirmed(current_member, event).deliver_later
    redirect_to event, notice: "申し込みを受け付けました"
  end
end
`}
          />
          <p>
            API は画面のコードを写して作られました。その後、定員の確認が画面のコードにだけ追加されたので、API には定員の確認がありません。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/api/registrations_controller.rb（パターンを使う前）"
            code={`
# スマートフォンのアプリ向けの API（パターンを使う前）
module Api
  class RegistrationsController < ApplicationController
    def create
      event = Event.find(params[:event_id])

      if Time.current > event.registration_deadline
        return render(json: { error: "closed" }, status: :conflict)
      end
      if event.registrations.exists?(member: current_member)
        return render(json: { error: "already_registered" }, status: :conflict)
      end
      # 定員の確認は、画面のコードにだけ後から追加された

      registration = event.registrations.create!(member: current_member)
      RegistrationMailer.confirmed(current_member, event).deliver_later
      render json: { id: registration.id }, status: :created
    end
  end
end
`}
          />
          <p>
            管理画面の取り込みは、1行目が見出しで、2行目から1行に1件のメールアドレスを書いた CSV を受け取ります。列が1つだけなので、ファイルを行に分けて読んでいます。運営者からの「途中で失敗したら全部やり直したい」という要望に合わせて、すべての行を1つのトランザクションの中で処理しています。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/admin/registration_imports_controller.rb（パターンを使う前）"
            code={`
# 管理画面の CSV 取り込み（パターンを使う前）。1列目がメールアドレスの CSV を受け取る
module Admin
  class RegistrationImportsController < ApplicationController
    class Full < StandardError; end

    def create
      event = Event.find(params[:event_id])
      emails = params.expect(:file).read.each_line(chomp: true).drop(1) # 見出しの行を除く

      ApplicationRecord.transaction do # 1行でも失敗したら全体を取り消す
        emails.each do |email|
          member = Member.find_by!(email:)
          next if event.registrations.exists?(member:)
          raise Full, "満席です（#{email}）" if event.registrations.count >= event.capacity

          event.registrations.create!(member:)
          RegistrationMailer.confirmed(member, event).deliver_later
        end
      end
      render plain: "#{emails.size}行を取り込みました"
    rescue ActiveRecord::RecordNotFound, Full => e
      render plain: "取り込めませんでした: #{e.message}", status: :unprocessable_content
    end
  end
end
`}
          />
          <p>メーラーは会員とイベントを受け取り、確認のメールを作ります。</p>
          <Code
            lang="ruby"
            title="app/mailers/registration_mailer.rb"
            code={`
class RegistrationMailer < ApplicationMailer
  def confirmed(member, event)
    mail(to: member.email, subject: "「#{event.title}」への申し込みを受け付けました") do |format|
      format.text { render plain: "#{member.name} 様、お申し込みありがとうございます。" }
    end
  end
end
`}
          />
          <h3>動かして確かめる</h3>
          <p>
            3つのコントローラーを、<code>ActionDispatch::Integration::Session</code>（テストでリクエストを送るのと同じ仕組み）で呼びました。A では定員2のイベントに画面から3人、続けて3人目の会員が API から申し込みます。B では定員5の別のイベントに CSV を取り込みます。CSV の4行目のアドレスは会員として登録されていません。Active Job はテスト用の <code>:test</code> アダプターにして、投入されたジョブを記録し、最後にワーカーの代わりに実行しています。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene.rb。Rails 8.1.4.1・MySQL 8.4）"
            code={`
== A: 定員 2 のイベントに、画面と API から申し込む
画面から 佐藤 → 302 申し込みを受け付けました
画面から 鈴木 → 302 申し込みを受け付けました
画面から 高橋 → 302 満席です
APIから 高橋 → 201 {"id":32}
申し込み=3件（定員 2）

== B: 管理画面の CSV 取り込み（定員 5 のイベント。4行目のアドレスは未登録）
応答: 422 取り込めませんでした: Couldn't find Member with [WHERE \`members\`.\`email\` = ?]
申し込み=0件 投入されたメールのジョブ=2件
ジョブを実行した後に送られたメール:
  ito@example.com 「MySQL 入門」への申し込みを受け付けました
  kato@example.com 「MySQL 入門」への申し込みを受け付けました
`}
          />
          <p>
            A では、画面から申し込んだ高橋さんは満席で断られましたが、同じ高橋さんが API から申し込むと 201 が返り、定員2のイベントに3件の申し込みが残りました。
          </p>
          <p>
            B では、4行目で <code>RecordNotFound</code> が起き、トランザクションはロールバックされて申し込みは0件になりました。ところが、2行目と3行目で投入したメールのジョブはキューに残っていて、実行すると伊藤さんと加藤さんに「申し込みを受け付けました」のメールが届きました。Rails 8.1 の既定の設定では、トランザクションの中で <code>deliver_later</code> を呼ぶと、コミットを待たずにジョブがキューに入ります。この既定値は「Rails での実装」の節で確かめます。
          </p>
          <p>
            画面のコードにも問題が残っています。<code>count</code> で定員を確かめてから <code>create!</code> するまでの間に、別のリクエストが同じイベントに申し込むと、両方が「まだ空きがある」と判断します。残り1席に2人が同時に申し込むと、2人とも受け付けられます。これも rails-impl の節で再現します。
          </p>
          <h3>3か所の食い違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">呼び出し元</th>
                  <th scope="col">締め切り</th>
                  <th scope="col">申し込み済み</th>
                  <th scope="col">定員</th>
                  <th scope="col">メールを投入する時点</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">画面</th>
                  <td>確かめる</td>
                  <td>確かめる</td>
                  <td>確かめる（同時の申し込みは防げない）</td>
                  <td>保存の後（トランザクションの外）</td>
                </tr>
                <tr>
                  <th scope="row">API</th>
                  <td>確かめる</td>
                  <td>確かめる</td>
                  <td>確かめない</td>
                  <td>保存の後（トランザクションの外）</td>
                </tr>
                <tr>
                  <th scope="row">CSV の取り込み</th>
                  <td>確かめない</td>
                  <td>その行を飛ばす</td>
                  <td>確かめる</td>
                  <td>トランザクションの中</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>このコードには、次の問題があります。</p>
          <ul>
            <li>同じ手順が3か所にあり、規則を変えるたびに3つのコントローラーを直す必要があります。直し忘れた API では、定員を超えて申し込みを受け付けました。</li>
            <li>CSV の取り込みには締め切りの確認がありません。管理者には締め切りの後の追加を許すという仕様なのか、書き忘れなのかを、コードから判断できません。</li>
            <li>メールを投入する時点が経路ごとに違い、CSV ではロールバックした申し込みにもメールが届きます。</li>
            <li>定員の確認と保存の間に、ほかのリクエストが割り込めます。</li>
            <li>申し込みの手順をテストするには、HTTP のリクエストか CSV のファイルを組み立てる必要があります。</li>
          </ul>
          <p>次の節で、こうした手順を1か所にまとめる Use Case / Application Service の考え方を説明します。</p>
        </>
      ),
    },
    {
      id: 'idea',
      title: '1つの業務操作の手順を1つのクラスにまとめる',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term en="Use Case">ユースケース</Term>
            は、利用者がシステムを使って達成したい1つの目的（イベントに申し込む、商品を購入する、など）と、その達成までのやり取りを表す言葉です。もとは Ivar Jacobson が要求を記述する方法として 1987 年の学会 OOPSLA で発表し、1992 年の書籍の出版後に広く使われるようになりました
            <Ref n={1} />。
          </p>
          <p>
            MSDP のカタログ（<ChapterLink n={39} section="catalog" />）の Use Case / Application Service は、この「1つの業務操作」を1つのクラスとしてコードに表し、その操作の手順をまとめるパターンです。Eric Evans は『Domain-Driven Design』で、アプリケーション層を「ソフトウェアが行う仕事を定義し、業務のオブジェクトに問題を解かせる」層とし、薄く保って業務の規則を持たせず、作業の調整と業務のオブジェクトへの委譲だけを行わせると書いています（Martin Fowler による引用<Ref n={2} />）。Fowler の『Patterns of Enterprise Application Architecture』（以下 PoEAA）の Service Layer も、アプリケーションが提供する操作の一覧を定め、各操作での応答を調整する層です<Ref n={3} />。<Term>Application Service</Term> と Domain Service の違いは<ChapterLink n={33} section="domain-application-service" />で扱いました。この章のユースケースのクラスは Application Service に当たります。
          </p>
          <p>このパターンの目的は次の2つです。</p>
          <ul>
            <li>1つの業務操作の手順（何を読み、何を確かめ、何を保存し、何を通知するか）を、1か所で読めるようにする。</li>
            <li>HTTP の処理（コントローラー）と業務の規則（モデル）に、手順の調整が混ざらないようにする。</li>
          </ul>
          <h3>使う場面</h3>
          <p>
            Rails では、業務操作の処理を最初にコントローラーのアクションに書くことがよくあります。操作が単純なうちはこれで足ります。規則が増え、メールや外部のサービスとの連携が加わると、アクションが長くなります。その処理をモデルのメソッドやコールバックに移すと、今度はモデルが長くなり、保存のたびにどこで何が起きるかを追いにくくなります。
          </p>
          <p>
            前の節のように、同じ業務操作を複数の呼び出し元（画面・API・管理画面・バッチ処理）から実行する場合は、手順の重複が問題になります。次のような兆候があれば、ユースケースのクラスが必要になっている可能性があります。
          </p>
          <ul>
            <li>コントローラーのアクションが数十行あり、HTTP の処理と業務の判断と保存が混ざっている。</li>
            <li>同じ業務操作の手順が、API・管理画面・バッチ処理などに重複している。</li>
            <li>モデルのコールバックで、保存のたびにメールの送信や外部の API の呼び出しが行われ、どこで何が起きるかを追えない。</li>
            <li>業務操作のテストを書くのに、HTTP のリクエストを組み立てる必要がある。</li>
          </ul>
          <h3>設計上の制約</h3>
          <ul>
            <li>コントローラーとモデルを短く保ちたい。一方で、業務操作ごとにクラスを作ると、クラスの数が増える。</li>
            <li>手順をユースケースにまとめたい。一方で、業務の規則までユースケースに書くと、モデルがデータを持つだけになり、同じ規則がユースケースごとに重複する。</li>
            <li>1つの業務操作の保存は、すべて成功するか、すべて取り消したい（トランザクション）。一方で、メールの送信や外部の API の呼び出しはトランザクションで取り消せない。</li>
            <li>満席のような想定される失敗を、呼び出し元で分かりやすく扱いたい。一方で、失敗の種類を細かく分けるほど、戻り値の形が複雑になる。</li>
          </ul>
          <h3>解決方法</h3>
          <p>ユースケースは次の要素と組み合わせて使います。</p>
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
                  <th scope="row">呼び出し元</th>
                  <td>RegistrationsController・Api::RegistrationsController・Admin::RegistrationImportsController</td>
                  <td>リクエストや CSV の行を読んでユースケースの入力にし、結果を画面の文言・HTTP のステータスコード・取り込みの報告に変える</td>
                </tr>
                <tr>
                  <th scope="row">ユースケース</th>
                  <td>RegisterForEvent（app/services）</td>
                  <td>1つの業務操作の手順を順に呼ぶ。トランザクションの範囲とロックを決め、結果の形をそろえる。規則は持たない</td>
                </tr>
                <tr>
                  <th scope="row">モデル</th>
                  <td>Event・Registration</td>
                  <td>業務の規則（締め切り・重複・定員）を持って判断し、自分のテーブルに保存する</td>
                </tr>
                <tr>
                  <th scope="row">DB の制約</th>
                  <td>registrations の一意索引</td>
                  <td>ユースケースを通らない保存（コンソールなど）でも重複を防ぐ</td>
                </tr>
                <tr>
                  <th scope="row">メーラーとジョブ</th>
                  <td>RegistrationMailer・Sidekiq</td>
                  <td>確認のメールを作り、コミットの後に別のプロセスで送る</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            MSDP のカタログの例では、ユースケースが使う保存先を <Term en="Repository">リポジトリ</Term>
            （EventRepository など）として分け、メール・トランザクション・時計も差し替えられる取り決めにしています。Rails では Active Record のモデルが読み込みと保存を受け持つので、この章ではリポジトリを作りません。その理由と、それでも分ける場合は次の節で扱います。
          </p>
          <Figure n="97-1" title="処理の置き場所" caption="左は前の節のコードで、呼び出し元ごとに確かめていることを並べた。右はユースケースにまとめた後の分担。">
            <PlacementFigure />
          </Figure>
          <p>
            図 97-1 の左は、前の節の3つのコントローラーがそれぞれ何を確かめているかを並べたものです。赤い欄が食い違いです。右では、3つの呼び出し元が同じ RegisterForEvent を呼び、規則は Event、重複の最終的な防止は一意索引、メールはコミットの後の投入に分かれています。
          </p>
          <p>ユースケースを書くときは、次の規則に従います。</p>
          <ul>
            <li>1つのクラスは1つの業務操作だけを扱い、「イベントに申し込む」のように動詞で名前を付ける。</li>
            <li>
              業務の規則はモデルに置く。Fowler は、業務のオブジェクトがデータを持つだけで振る舞いを持たない状態を<Term en="Anemic Domain Model">ドメインモデル貧血症</Term>
              と呼び、データと処理を組み合わせるというオブジェクト指向の考え方に反するとしています<Ref n={2} />。
            </li>
            <li>トランザクションの範囲はユースケースが決める。1回の業務操作の保存を1つのトランザクションにまとめる。</li>
            <li>メールの送信や外部の API の呼び出しのように取り消せない処理は、トランザクションがコミットされた後に行う。</li>
            <li>満席のように業務上想定される失敗は、結果の値で返す。DB に接続できないなどの想定外の失敗は、例外のまま呼び出し元に伝える。</li>
            <li>HTTP のステータスコード、リクエストのオブジェクト、画面に表示する文言は、ユースケースで扱わない。</li>
          </ul>
          <Callout title="Transaction Script と Domain Model">
            <p>
              PoEAA は、業務の処理の組み立て方として、1つのリクエストを1つの手続きで処理する Transaction Script<Ref n={4} /> と、振る舞いとデータを持つオブジェクトのモデルで処理する Domain Model<Ref n={5} /> を挙げています。規則の少ない業務操作なら、ユースケースの中に規則を書く Transaction Script の形で足ります。規則が多く、複数の業務操作で共有される場合は、規則をモデルに置き、ユースケースを手順の調整だけにします。この章のコードは後者の形です。
            </p>
          </Callout>
          <h3>構造</h3>
          <Figure n="97-2" title="ユースケースの構造" caption="実線の矢印は呼び出し、破線の矢印は戻り値。Sidekiq と MySQL はアプリの外のサービス。">
            <StructureFigure />
          </Figure>
          <p>
            図 97-2 は適用後のクラスの関係です。3つのコントローラーは RegisterForEvent の <code>call</code> だけを呼び、Result を受け取ります。RegisterForEvent は、トランザクションとロック、Event の <code>register!</code>、コミットの後のメールの投入の3つを順に使います。RegisterForEvent が知らないものも図の下に書きました。HTTP のステータスコード、フラッシュ、CSV の行番号は呼び出し元が扱います。
          </p>
          <Figure n="97-3" title="申し込みのシーケンス" caption="薄い色の範囲がトランザクションの中。①〜③はトランザクションの中、④はコミットの後。">
            <SequenceFigure />
          </Figure>
          <p>
            図 97-3 は1件の申し込みで送られる SQL とジョブの投入の順序です。① で events の行をロックしてから、② の規則の確認と保存を行い、③ のコミットでロックを外します。④ のメールの投入はコミットの後です。断る場合は ② で例外が起きてロールバックし、④ は行いません。
          </p>
          <Figure n="97-4" title="メールを送るタイミング" caption="左は前の節の CSV の取り込み、右はこの章の RegisterForEvent。">
            <MailTimingFigure />
          </Figure>
          <p>
            図 97-4 はメールのジョブをトランザクションの中で投入する場合と、コミットの後で投入する場合の違いです。左では、ジョブがすぐにキューに入るので、その後でロールバックしても、ワーカーはメールを送ります。右では、コミットされたときだけ投入し、ロールバックされたら投入しません。ただし、コミットの直後にプロセスが止まると、申し込みは残ってもジョブは投入されません。この取りこぼしを防ぐ方法は<ChapterLink n={53} section="idea" />の Transactional Outbox で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'repository',
      title: 'Repository：読み込みと保存を別のクラスに分けるか',
      body: (
        <>
          <h3>Repository パターンとは</h3>
          <p>
            Repository は業務のオブジェクトの読み込みと保存を、オブジェクトの集まりを扱うような操作（ID で探す、条件で探す、加える、保存する）で提供する部品です。PoEAA は Repository を「コレクションのようなインターフェースで業務のオブジェクトにアクセスし、業務の層とデータの対応付けの層の間を取り持つ」と定義しています<Ref n={6} />。
          </p>
          <p>
            MSDP のカタログの例では、ユースケースは <code>events.find(id)</code> と <code>events.save(event)</code> の2つのメソッドだけを使い、SQL や ORM（DB の行とオブジェクトを対応付けるライブラリ）を直接使いません。テストでは、同じ2つのメソッドを持つメモリー上の実装を渡し、DB なしでユースケースの手順を確かめます（テストで本物の代わりに渡すオブジェクトの種類は<ChapterLink n={40} section="test-doubles" />）。ORM を使わない言語やフレームワークでは、この分け方で SQL を1か所に集められます。
          </p>
          <h3>Active Record がすでに受け持っていること</h3>
          <p>
            Rails のモデルは <Term>Active Record</Term> パターンで作られています。Fowler はこのパターンを「DB のテーブルやビューの1行を包むオブジェクトで、DB へのアクセスを隠し、そのデータに業務のロジックを加える」と定義しています<Ref n={7} />。1つのクラスが、行の読み込み（クラスメソッド）、保存（インスタンスメソッド）、業務の規則の3つを持つので、Repository の操作はほぼ既存のメソッドで書けます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Repository の操作</th>
                  <th scope="col">Rails での書き方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">ID で探す</th>
                  <td>
                    <code>Event.find(id)</code>・<code>Event.find_by(id:)</code>
                  </td>
                </tr>
                <tr>
                  <th scope="row">条件に名前を付けて探す</th>
                  <td>スコープ（<code>Event.accepting</code>）とクラスメソッド</td>
                </tr>
                <tr>
                  <th scope="row">集まりに加える・数える</th>
                  <td>
                    has_many の関連（<code>event.registrations.create!</code>・<code>.count</code>）
                  </td>
                </tr>
                <tr>
                  <th scope="row">保存する</th>
                  <td>
                    <code>save!</code>・<code>create!</code>
                  </td>
                </tr>
                <tr>
                  <th scope="row">まとめて確定する</th>
                  <td>
                    <code>ApplicationRecord.transaction</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            検索の条件に名前を付けたいときは、モデルにスコープを書きます。次の <code>accepting</code> は、締め切りが現在時刻以降のイベント、つまり申し込みを受け付けているイベントを返します。
          </p>
          <Code
            lang="ruby"
            title="app/models/event.rb（スコープの部分）"
            code={`
class Event < ApplicationRecord
  has_many :registrations

  # 申し込みを受け付けているイベント（締め切りが now 以降）
  scope :accepting, ->(now = Time.current) { where(registration_deadline: now..) }
  # …（省略）
end
`}
          />
          <Code
            lang="text"
            title="実行結果（to_sql で SQL を表示。time_zone は Tokyo）"
            code={`
> Event.accepting(Time.zone.parse("2026-11-20 10:00")).order(:registration_deadline).to_sql
SELECT \`events\`.* FROM \`events\` WHERE \`events\`.\`registration_deadline\` >= '2026-11-20 01:00:00' ORDER BY \`events\`.\`registration_deadline\` ASC
> member.registrations.joins(:event).merge(Event.accepting(now)).to_sql
SELECT \`registrations\`.* FROM \`registrations\` INNER JOIN \`events\` ON \`events\`.\`id\` = \`registrations\`.\`event_id\` WHERE \`registrations\`.\`member_id\` = 40 AND \`events\`.\`registration_deadline\` >= '2026-11-20 01:00:00'
`}
          />
          <p>
            日本時間の 10:00 は、UTC の 01:00 として SQL に入りました。Rails は datetime の列を UTC で保存するためです。スコープは Relation（まだ実行していない検索の条件）を返すので、<code>order</code> を足したり、<code>merge</code> で別のモデルの検索に組み込んだりできます。Repository のメソッドが配列を返す作りにすると、こうした組み合わせが使えなくなります。
          </p>
          <h3>Rails で Repository を作ると起きること</h3>
          <p>Active Record のモデルの前に Repository のクラスを置くと、次のことが起きます。</p>
          <ul>
            <li>
              Repository が返すのは Active Record のオブジェクトなので、呼び出し元は <code>event.registrations</code> や <code>event.save!</code> をそのまま呼べます。DB へのアクセスを1か所に集めるという目的が守られず、Repository とモデルの2つの API を保守することになります。
            </li>
            <li>
              メモリー上の実装でテストすると、DB が守る性質を再現できません。この章で使う行ロック（<code>lock!</code>）、一意索引、MySQL のスナップショットの読み取りは、メモリー上の実装では起きません。rails-impl の節で再現する定員の超過は、本物の DB でしか見つかりません。
            </li>
            <li>
              Rails のテストは、例ごとにトランザクションを開始して最後にロールバックするので、DB を使っても速く実行できます（<ChapterLink n={20} section="transaction" />）。メモリー上の実装を作る理由が、ほかの言語ほど強くありません。
            </li>
          </ul>
          <p>
            そのため、この章の RegisterForEvent は Event と Registration を直接使います。検索の条件はスコープとクラスメソッドで名前を付け、読み込みの組み合わせが増えて1つのモデルに収まらなくなったら Query Object（<ChapterLink n={33} section="query-objects" />）に分けます。
          </p>
          <h3>それでも分ける場合</h3>
          <ul>
            <li>
              データの保存先がこの DB ではない場合です。たとえばイベントの情報を外部のイベント管理サービスの API から読むなら、その API の呼び出しを <code>find</code>・<code>save</code> のような操作を持つクラスにまとめます。外部の API の形をアプリの形に変える部分は、<ChapterLink n={42} section="idea" />の Adapter です。
            </li>
            <li>
              複数のテーブルにまたがるオブジェクトのまとまり（たとえば注文と明細）を、必ず1つの単位で読み書きしたい場合です。ルートのオブジェクトを通してだけ保存するという規則を、まとまりごとの保存のクラスで守らせます。このまとまりを集約と呼び、<ChapterLink n={48} section="aggregate" />で扱います。
            </li>
            <li>
              規則の計算を DB なしでテストしたい場合は、Repository を作るより、計算に必要な値だけを引数で渡すクラスに分けるほうが小さく済みます。この分け方は<ChapterLink n={45} section="idea" />の Functional Core, Imperative Shell で扱います。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  controllers/registrations_controller.rb               # 画面。結果をフラッシュの文言に変える
  controllers/api/registrations_controller.rb           # API。結果をステータスコードと JSON に変える
  controllers/admin/registration_imports_controller.rb  # CSV の行ごとに呼び、報告を返す
  services/register_for_event.rb                        # ユースケース（手順・トランザクション・結果の形）
  models/event.rb                                       # 申し込みの規則
  models/registration.rb
  models/member.rb
  mailers/registration_mailer.rb
db/migrate/20261120000001_create_events_and_registrations.rb
`}
          />
          <p>
            Rails は app/services のようなディレクトリを作りませんが、自分で作れば、起動時に存在する app の下のディレクトリとして自動で読み込みの対象になります<Ref n={8} />。ユースケースのクラスを置く「サービスオブジェクト」は Rails の公式の仕組みではなく、利用者の間で広まった慣習です。マイグレーションは前の節で示したものをそのまま使います。
          </p>
          <h3>規則を Event に移す</h3>
          <p>
            まず、3つのコントローラーに書かれていた締め切り・重複・定員の確認を Event に移します。<code>rejection_reason_for</code> は断る理由のシンボルか nil を返し、<code>register!</code> は規則を確かめてから申し込みを保存します。断るときは、理由を持つ例外 <code>RegistrationRejected</code> を投げます。
          </p>
          <Code
            lang="ruby"
            title="app/models/event.rb"
            code={`
class Event < ApplicationRecord
  # 申し込みを断る理由（:closed・:already_registered・:full）を持つ例外
  class RegistrationRejected < StandardError
    attr_reader :reason

    def initialize(reason)
      @reason = reason
      super("registration rejected: #{reason}")
    end
  end

  has_many :registrations

  # 申し込みを受け付けているイベント（締め切りが now 以降）
  scope :accepting, ->(now = Time.current) { where(registration_deadline: now..) }

  # 申し込みの規則。断る理由のシンボルか nil を返す
  def rejection_reason_for(member, now:)
    return :closed if now > registration_deadline
    return :already_registered if registrations.exists?(member:)
    return :full if registrations.count >= capacity

    nil
  end

  # 規則を確かめて申し込みを保存する。定員を守るには、呼び出し元がこの行をロックしておく
  def register!(member, now: Time.current)
    reason = rejection_reason_for(member, now:)
    raise RegistrationRejected, reason if reason

    registrations.create!(member:)
  end
end
`}
          />
          <p>
            現在時刻は <code>now:</code> で受け取ります。テストでは任意の時刻を渡して、締め切りちょうどの境界を確かめられます。<code>register!</code> のコメントにあるとおり、このメソッドは「呼び出し元がイベントの行をロックしている」ことを前提にしています。ロックを取るのは、トランザクションの範囲を決めるユースケースの役目です。
          </p>
          <h3>ユースケースのクラス</h3>
          <Code
            lang="ruby"
            title="app/services/register_for_event.rb"
            code={`
# ユースケース「イベントに参加を申し込む」。手順・トランザクション・結果の形を受け持ち、規則は Event に任せる
class RegisterForEvent
  Result = Data.define(:registration, :code) do
    def self.ok(registration) = new(registration:, code: :ok)
    def self.failure(code) = new(registration: nil, code:)

    def success? = code == :ok
  end

  def call(event:, member:)
    registration = ApplicationRecord.transaction do
      event.lock!                                      # SELECT … FOR UPDATE。同じイベントの申し込みを1件ずつ処理する
      event.register!(member, now: Time.current)       # 規則の確認と保存（断るときは RegistrationRejected）
    end
    ActiveRecord.after_all_transactions_commit do      # すべてのトランザクションがコミットされた後に投入する
      RegistrationMailer.confirmed(member, event).deliver_later
    end
    Result.ok(registration)
  rescue Event::RegistrationRejected => e              # トランザクションの外で結果に変える
    Result.failure(e.reason)
  end
end
`}
          />
          <p>
            <code>call</code> はトランザクションの中でイベントの行をロックし、Event に規則の確認と保存を任せます。トランザクションを抜けた後で、メールのジョブの投入を予約し、成功の結果を返します。<code>RegistrationRejected</code> はメソッドの <code>rescue</code> で捕まえるので、結果に変える時点でロールバックは終わっています。
          </p>
          <h3>戻り値の形をほかの章とそろえる</h3>
          <p>
            戻り値の形は<ChapterLink n={33} section="service-contract" />と<ChapterLink n={34} section="workflow-contracts" />で決めた契約にそろえています。<code>Data.define</code> で作った読み取り専用の Result を返し、<code>code</code> が <code>:ok</code> のときに <code>success?</code> が true になります。<code>ok</code> と <code>failure</code> からだけ作るので、成功なのに registration が nil の結果は作れません。業務の失敗は例外でロールバックさせ、トランザクションの外で結果に変えます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">起きたこと</th>
                  <th scope="col">表し方</th>
                  <th scope="col">画面</th>
                  <th scope="col">API</th>
                  <th scope="col">CSV の取り込み</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">受け付けた</th>
                  <td>
                    <code>Result.ok</code>
                  </td>
                  <td>notice の文言</td>
                  <td>201 と申し込みの ID</td>
                  <td>その行に ok</td>
                </tr>
                <tr>
                  <th scope="row">締め切り後・申し込み済み・満席</th>
                  <td>
                    <code>Result.failure(:closed)</code> など
                  </td>
                  <td>alert の文言</td>
                  <td>409 と理由のコード</td>
                  <td>その行に理由のコード</td>
                </tr>
                <tr>
                  <th scope="row">イベントがない</th>
                  <td>
                    <code>RecordNotFound</code>（呼び出し元の <code>Event.find</code>）
                  </td>
                  <td colSpan={2}>Rails が 404 を返す</td>
                  <td>404（ファイル全体を断る）</td>
                </tr>
                <tr>
                  <th scope="row">CSV のアドレスが会員にない</th>
                  <td>呼び出し元が判断する</td>
                  <td>対象外</td>
                  <td>対象外</td>
                  <td>
                    その行に <code>member_not_found</code>
                  </td>
                </tr>
                <tr>
                  <th scope="row">DB の障害など</th>
                  <td>例外のまま</td>
                  <td colSpan={3}>500。監視と再試行に回す</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>ほかの章や MSDP のカタログの例と違う点が3つあり、それぞれ理由があります。</p>
          <ul>
            <li>
              Result は理由のコードだけを持ち、画面の文言を持ちません。<ChapterLink n={34} section="workflow-contracts" />の OrderResult は <code>errors</code> に文言を入れていましたが、この章では呼び出し元が3つあり、それぞれ出力の形（フラッシュ・JSON・取り込みの報告）が違います。文言を選ぶのは呼び出し元にしました。
            </li>
            <li>
              MSDP のカタログの例はイベントが見つからないことも <code>:event_not_found</code> という結果で返しますが、この章では<ChapterLink n={34} section="workflow-contracts" />と同じく <code>RecordNotFound</code> の例外のままにします。ユースケースはイベントと会員のオブジェクトを受け取り、探すのは呼び出し元です。Rails は <code>RecordNotFound</code> を 404 の応答に変えるので、コントローラーに対応表を書かずに済みます。
            </li>
            <li>
              MSDP のカタログの例は、断る理由をトランザクションのブロックから <code>next</code> で返します。ブロックを例外以外で抜けるとコミットされます（<ChapterLink n={33} section="service-contract" />の「トランザクションの中で失敗の結果を返さない」）。今のコードは確認の前に何も書き込まないので結果は同じですが、後で確認の前に書き込みを加えたときにその書き込みがコミットされないよう、例外でロールバックさせます。
            </li>
          </ul>
          <h3>トランザクションと行ロックで定員を守る</h3>
          <p>
            <code>event.lock!</code> は、イベントの行を <code>SELECT … FOR UPDATE</code> で読み直してロックします（<code>reload(lock: true)</code> を呼ぶ<Ref n={9} />）。このロックはトランザクションが終わるまで続くので、同じイベントへのほかの申し込みは、先にロックを取った申し込みがコミットかロールバックするまで <code>lock!</code> の行で待ちます。行ロックの仕組みは<ChapterLink n={15} section="pessimistic" />で扱いました。1回の申し込みで送られる SQL は次のとおりです。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/sql_log.rb。時刻とジョブの ID を一部省略）"
            code={`
== 成功する場合
  BEGIN
  SELECT \`events\`.* FROM \`events\` WHERE \`events\`.\`id\` = 16 LIMIT 1 FOR UPDATE
  SELECT 1 AS one FROM \`registrations\` WHERE \`registrations\`.\`event_id\` = 16 AND \`registrations\`.\`member_id\` = 35 LIMIT 1
  SELECT COUNT(*) FROM \`registrations\` WHERE \`registrations\`.\`event_id\` = 16
  INSERT INTO \`registrations\` (\`event_id\`, \`member_id\`, \`created_at\`, \`updated_at\`) VALUES (16, 35, …, …)
  COMMIT
  Enqueued ActionMailer::MailDeliveryJob (Job ID: …) to Test(default) with arguments: "RegistrationMailer", "confirmed", "deliver_now", …
=> ok
== 申し込み済みの場合
  BEGIN
  SELECT \`events\`.* FROM \`events\` WHERE \`events\`.\`id\` = 16 LIMIT 1 FOR UPDATE
  SELECT 1 AS one FROM \`registrations\` WHERE \`registrations\`.\`event_id\` = 16 AND \`registrations\`.\`member_id\` = 35 LIMIT 1
  ROLLBACK
=> already_registered
`}
          />
          <p>
            ジョブの投入（Enqueued）は COMMIT の後に記録されています。断る場合は ROLLBACK で終わり、ジョブは投入されていません。
          </p>
          <p>
            ロックが本当に必要かを確かめるため、定員1のイベントに2つのスレッドから同時に申し込みました。スレッドごとに別の DB 接続を使い、規則の確認と保存の間に 0.3 秒の待ちを入れて、競合を毎回起こしています。比べたのは、lock! を使わない書き方、MSDP のカタログの例と同じくトランザクションの中で先に Event を読んでから lock! する書き方、その書き方を READ COMMITTED で実行したもの、この章の RegisterForEvent の4つです。
          </p>
          <Code
            lang="ruby"
            title="script/race.rb（比較用のクラスの部分）"
            code={`
# 規則の確認と保存の間を広げて、競合を毎回起こす
Event.prepend(Module.new { def rejection_reason_for(...) = super.tap { sleep 0.3 } })

# 比較用1：lock! を使わない
class RegisterWithoutLock
  def call(event:, member:)
    ApplicationRecord.transaction { event.register!(member) }
    :ok
  rescue Event::RegistrationRejected => e
    e.reason
  end
end

# 比較用2：トランザクションの中で先に読み込んでから lock! する（MSDP のカタログの例と同じ順序）
class RegisterReadingFirst
  def call(event_id:, member_id:, isolation: nil)
    ApplicationRecord.transaction(isolation:) do
      event = Event.find(event_id)   # トランザクションで最初の普通の SELECT
      member = Member.find(member_id)
      event.lock!
      event.register!(member)
    end
    :ok
  rescue Event::RegistrationRejected => e
    e.reason
  end
end
# …（省略。2つのスレッドを with_connection で別々の接続にして呼ぶ）
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/race.rb。MySQL 8.4 の既定の分離レベル REPEATABLE READ）"
            code={`
lock! なし: [:ok, :ok] 申し込み=2件（定員 1）
先に Event.find してから lock!（MSDP の順序）: [:ok, :ok] 申し込み=2件（定員 1）
同じ順序で READ COMMITTED: [:ok, :full] 申し込み=1件（定員 1）
RegisterForEvent（最初に lock!）: [:ok, :full] 申し込み=1件（定員 1）
`}
          />
          <p>
            lock! なしでは、2つの申し込みがどちらも COUNT で 0 件と判断し、定員1のイベントに2件が残りました。トランザクションは、ほかの接続が同じ行を読むことを止めないためです（<ChapterLink n={38} section="concurrent-updates" />）。
          </p>
          <p>
            2行目は lock! を使っているのに定員を超えました。原因は MySQL の分離レベルです。MySQL 8.4 の InnoDB の既定の分離レベル REPEATABLE READ では、トランザクションの中の普通の SELECT（ロックを取らない読み取り）は、そのトランザクションで最初に行った普通の SELECT の時点のスナップショットを読みます<Ref n={10} />。<code>SELECT … FOR UPDATE</code> はロックを取る読み取りなので、最新の値を読みます。2行目の書き方では、接続 B は最初の <code>Event.find</code> で読む時点が決まり、その後でロックを待ちます。接続 A がコミットした後にロックを取っても、COUNT は A の申し込みを含まない古いスナップショットから数えるので、0 件になります。
          </p>
          <Figure n="97-5" title="同時の申し込みと lock! の位置（段階送り）" caption="上の実行の2行目（左）と4行目（右）を、2つの接続の時間の流れで並べた概念モデルです。縦が時間で、時刻を進めると、その時刻までの処理を濃く表示し、その時刻の処理を枠で囲みます。左右は別々の実行で、同じ高さが同じ時刻を表すわけではありません。実際の実行では規則の確認と保存の間に 0.3 秒の待ちを入れて、この順序を毎回起こしています。">
            <Stepper steps={raceSteps} />
          </Figure>
          <p>
            図 97-5 の左では、B の COUNT が B の最初の SELECT（A がロックを取る前）の時点のスナップショットを読んでいます。右では、B の最初の読み取りが <code>FOR UPDATE</code> なのでスナップショットはまだ決まらず、ロックを取った後の COUNT が初めての普通の SELECT になり、A の申し込みが見えます。READ COMMITTED では普通の SELECT ごとに新しいスナップショットを読むので、3行目も定員を守りました。MSDP のカタログの Rails の例は PostgreSQL で動かしており、PostgreSQL の既定の分離レベルは READ COMMITTED です<Ref n={11} />。同じ順序のコードでも、MySQL では結果が変わります。スナップショットの仕組みは<ChapterLink n={38} section="mvcc" />で扱いました。
          </p>
          <p>
            この章のコードでは <code>lock!</code> をトランザクションの最初の読み取りにしています。イベントと会員は呼び出し元がトランザクションの外で読み、ユースケースのトランザクションは <code>lock!</code> から始まります。ロックの前にトランザクションの中で読む必要があるなら、<code>Event.lock.find(id)</code> のように最初の読み取りでロックを取ります。
          </p>
          <Callout kind="note" title="ロックの代わりに条件付きの UPDATE を使う方法">
            <p>
              events に申し込みの数の列を持たせ、<code>UPDATE events SET registrations_count = registrations_count + 1 WHERE id = ? AND registrations_count &lt; capacity</code> のように条件付きで1を足す方法もあります。更新した行が0なら満席です。<ChapterLink n={34} section="transaction-design" />の在庫の確保と同じ考え方で、行ロックを待つ時間が短くなります。代わりに、申し込みの取り消しで数を戻す処理と、数と実際の行数がずれないようにする処理が増えます。
            </p>
          </Callout>
          <h3>コミットの後にメールを投入する</h3>
          <p>
            scene の節の CSV の取り込みでは、ロールバックした申し込みにもメールが届きました。Rails 8.1.4.1 でジョブを投入する時点の設定を確かめます。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/mail_timing.rb。それぞれ最後に ActiveRecord::Rollback でロールバックする）"
            code={`
ActiveJob::Base.enqueue_after_transaction_commit         = false
ActionMailer::MailDeliveryJob.enqueue_after_transaction_commit = false
ActionMailer::MailDeliveryJob.superclass                  = ActiveJob::Base
1. トランザクションの中で deliver_later: ロールバックの後に残ったジョブ=1件 申し込み=0件
2. after_all_transactions_commit の中で deliver_later: ロールバックの後に残ったジョブ=0件 申し込み=0件
3. 外側のトランザクションの中で RegisterForEvent: ロールバックの後に残ったジョブ=0件 申し込み=0件
`}
          />
          <p>
            <code>enqueue_after_transaction_commit</code> は、トランザクションの中で投入したジョブをコミットの後まで遅らせるかを決める、ジョブのクラスごとの設定です。Rails 8.1.4.1 では <code>ActiveJob::Base</code> の既定値が false です<Ref n={12} />。8.1.0 で、アプリケーション全体の設定 <code>config.active_job.enqueue_after_transaction_commit</code> は削除されました<Ref n={13} />。<code>deliver_later</code> が使う <code>ActionMailer::MailDeliveryJob</code> は ApplicationJob ではなく <code>ActiveJob::Base</code> を継承しているので、ApplicationJob に <code>self.enqueue_after_transaction_commit = true</code> を書いても、メールのジョブには反映されません。1 の結果のとおり、何も設定しなければ、ロールバックしてもジョブは残ります。
          </p>
          <p>
            RegisterForEvent では、<code>ActiveRecord.after_all_transactions_commit</code> に渡したブロックの中で <code>deliver_later</code> を呼んでいます。このメソッドは、開いているトランザクションがなければブロックをすぐに実行し、開いていればすべてのトランザクションのコミットを待って実行します。どれかがロールバックされた場合は実行しません<Ref n={14} />。3 の結果のように、RegisterForEvent を外側のトランザクションの中で呼んでロールバックした場合も、ジョブは投入されません。ジョブのクラスの設定に頼らず、ユースケースのコードを読めばメールを投入する時点が分かります。
          </p>
          <p>
            コミットの後でメールのジョブの実行が失敗しても、申し込みは保存済みで、利用者には成功の応答が返っています。ジョブは Sidekiq の再試行で送り直します（<ChapterLink n={18} section="retry" />）。投入そのものが失われる場合の対策は、図 97-4 で触れた Transactional Outbox です。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 で <code>load_defaults 7.2</code> にしていると、<code>config.active_job.enqueue_after_transaction_commit</code> が <code>:default</code> になり、Sidekiq のアダプターではトランザクションの中の <code>deliver_later</code> もコミットの後に投入されていました<Ref n={15} />
              <Ref n={16} />。8.1 に上げると、何も書いていないジョブとメールは、トランザクションの中ですぐに投入されるようになります。詳しくは<ChapterLink n={18} section="transaction" />で扱いました。<code>after_all_transactions_commit</code> は 7.2 にもあるので、この章のユースケースは 7.2 でも同じように動きます。
            </p>
          </Callout>
          <h3>呼び出し元を書き換える</h3>
          <p>3つのコントローラーはユースケースを呼び、結果をそれぞれの出力の形に変えるだけになります。</p>
          <Code
            lang="ruby"
            title="app/controllers/registrations_controller.rb"
            code={`
class RegistrationsController < ApplicationController
  MESSAGES = { closed: "締め切りを過ぎています", full: "満席です",
               already_registered: "申し込み済みです" }.freeze

  def create
    event = Event.find(params[:event_id])
    result = RegisterForEvent.new.call(event:, member: current_member)

    if result.success?
      redirect_to event, notice: "申し込みを受け付けました"
    else
      redirect_to event, alert: MESSAGES.fetch(result.code)
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/api/registrations_controller.rb"
            code={`
module Api
  class RegistrationsController < ApplicationController
    def create
      event = Event.find(params[:event_id])
      result = RegisterForEvent.new.call(event:, member: current_member)

      if result.success?
        render json: { id: result.registration.id }, status: :created
      else
        render json: { error: result.code }, status: :conflict
      end
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/admin/registration_imports_controller.rb"
            code={`
module Admin
  class RegistrationImportsController < ApplicationController
    def create
      event = Event.find(params[:event_id])
      emails = params.expect(:file).read.each_line(chomp: true).drop(1) # 見出しの行を除く

      report = emails.map.with_index(2) do |email, line|
        member = Member.find_by(email:)
        code = member ? RegisterForEvent.new.call(event:, member:).code : :member_not_found
        "#{line}行目 #{email}: #{code}"
      end
      render plain: report.join("\\n")
    end
  end
end
`}
          />
          <p>
            画面のコントローラーは理由のコードを文言に変える表を持ちます。<code>fetch</code> を使っているので、ユースケースに新しい理由を足して表に書き忘れると、その理由が初めて返ったときに KeyError になって気づけます。文言を I18n の翻訳ファイルに移す場合も、変えるのはこの表だけです。
          </p>
          <p>
            CSV の取り込みは、行ごとにユースケースを呼び、行ごとの結果を報告するように仕様を変えました。前のコードはファイル全体を1つのトランザクションにしていましたが、1行の誤りで全体をやり直すより、取り込めなかった行だけを直して再度取り込むほうが運営者の手間が少ないためです。この変更は運営者と合意してから行います。全体を1つの単位にする仕様が必要な場合の注意は、anti-patterns の節の「ユースケースからユースケースを呼ぶ」で扱います。scene の節と同じ操作を、書き換えた後のコードで行いました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/after.rb。CSV は定員2のイベントに5行）"
            code={`
== A: 定員 2 のイベントに、画面と API から申し込む
画面から 佐藤 → 302 申し込みを受け付けました
画面から 鈴木 → 302 申し込みを受け付けました
画面から 高橋 → 302 満席です
APIから 高橋 → 409 {"error":"full"}
APIから 佐藤 → 409 {"error":"already_registered"}
申し込み=2件（定員 2） 投入されたメールのジョブ=2件

== B: 管理画面の CSV 取り込み（定員 2 のイベント。4行目のアドレスは未登録）
応答: 200
2行目 ito@example.com: ok
3行目 kato@example.com: ok
4行目 yamada@example.com: member_not_found
5行目 sato@example.com: full
6行目 ito@example.com: already_registered
申し込み=2件 投入されたメールのジョブ=2件
`}
          />
          <p>
            API も満席を 409 で断るようになり、CSV では受け付けた2行だけにメールのジョブが投入されました。CSV にも締め切りの確認が入ったので、管理者に締め切りの後の追加を許す必要があるなら、それを Event の規則として明示します（たとえば <code>register!</code> に、締め切りの確認を省く理由を表す引数を加える）。
          </p>
          <Callout kind="v72">
            <p>
              <code>params.expect</code> は Rails 8.0 で追加されたメソッドです<Ref n={17} />。Rails 7.2 では <code>params.require(:file)</code> と書きます。
            </p>
          </Callout>
          <h3>直していく順序</h3>
          <ol className="steps">
            <li>現在の動作をリクエストのテストで固定する：3つの呼び出し元ごとに、成功・締め切り後・申し込み済み・満席の応答と、メールのジョブの数を確かめる。API の定員の抜けのように直すべき動作は、テストに「直す予定」と書いておく。</li>
            <li>規則を移す：締め切り・重複・定員の判断を Event の <code>rejection_reason_for</code> と <code>register!</code> に移し、モデルのテストを書く。コントローラーからは、まだ <code>register!</code> を直接呼んでよい。</li>
            <li>手順を移す：RegisterForEvent を作り、画面のコントローラーから呼ぶ。続いて API と CSV の取り込みを切り替える。API の満席と CSV の取り込みの単位は動作が変わるので、利用者や運営者に知らせる。</li>
            <li>ロックを加える：<code>lock!</code> をトランザクションの最初に置き、別々の接続で同時に申し込むテストを書く。</li>
            <li>メールの投入をコミットの後に移す：<code>after_all_transactions_commit</code> の中で <code>deliver_later</code> を呼び、外側のトランザクションがロールバックしたときにジョブが残らないことをテストで確かめる。</li>
            <li>古いコードを消す：コントローラーに残った規則や、モデルのコールバックで送っていたメールがあれば削除する。新旧のコードが混ざると、同じ申し込みに確認のメールが2通届く。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストと動作の確認',
      body: (
        <>
          <p>テストは規則・手順・同時実行・呼び出し元の4つに分けて書きます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">テスト</th>
                  <th scope="col">確かめること</th>
                  <th scope="col">DB の使い方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">spec/models/event_spec.rb</th>
                  <td>締め切り・重複・定員の規則と、その境界</td>
                  <td>例ごとのトランザクション（最後にロールバック）</td>
                </tr>
                <tr>
                  <th scope="row">spec/services/register_for_event_spec.rb</th>
                  <td>結果の形、メールのジョブの有無、外側のロールバックでジョブが残らないこと</td>
                  <td>例ごとのトランザクション</td>
                </tr>
                <tr>
                  <th scope="row">spec/services/register_for_event_concurrency_spec.rb</th>
                  <td>同時の申し込みで定員を超えないこと</td>
                  <td>トランザクションを使わず、2つの接続で実行する</td>
                </tr>
                <tr>
                  <th scope="row">spec/requests/registrations_spec.rb</th>
                  <td>3つの呼び出し元が結果を文言・ステータスコード・報告に変えること</td>
                  <td>例ごとのトランザクション</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>規則のテスト</h3>
          <p>規則は Event のメソッドを直接呼んで確かめます。時刻は引数で渡すので、締め切りちょうどの境界も書けます。</p>
          <Code
            lang="ruby"
            title="spec/models/event_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Event do
  let(:now) { Time.zone.parse("2026-11-20 10:00") }
  let(:event) { Event.create!(title: "設計勉強会", capacity: 1, registration_deadline: now + 1.day) }
  let(:sato) { Member.create!(name: "佐藤", email: "sato@example.com") }
  let(:suzuki) { Member.create!(name: "鈴木", email: "suzuki@example.com") }

  describe "#rejection_reason_for" do
    it "締め切りの後は :closed" do
      expect(event.rejection_reason_for(sato, now: now + 2.days)).to eq :closed
    end

    it "締め切りちょうどまでは受け付ける" do
      expect(event.rejection_reason_for(sato, now: event.registration_deadline)).to be_nil
    end

    it "申し込み済みなら :already_registered、満席なら :full" do
      event.registrations.create!(member: sato)
      expect(event.rejection_reason_for(sato, now:)).to eq :already_registered
      expect(event.rejection_reason_for(suzuki, now:)).to eq :full
    end
  end

  describe "#register!" do
    it "断るときは理由を持つ例外を投げ、保存しない" do
      expect { event.register!(sato, now: now + 2.days) }
        .to raise_error(Event::RegistrationRejected) { |e| expect(e.reason).to eq :closed }
      expect(event.registrations.count).to eq 0
    end
  end
end
`}
          />
          <h3>ユースケースのテスト</h3>
          <p>
            ユースケースのテストでは、戻り値と、メールのジョブが投入されたかを確かめます。<code>have_enqueued_mail</code> は、ブロックの中で指定したメーラーのジョブが投入されたかを確かめる RSpec のマッチャーです（<ChapterLink n={20} section="jobs-mail" />）。
          </p>
          <Code
            lang="ruby"
            title="spec/services/register_for_event_spec.rb"
            code={`
require "rails_helper"

RSpec.describe RegisterForEvent do
  include ActiveSupport::Testing::TimeHelpers

  let(:event) { Event.create!(title: "設計勉強会", capacity: 1, registration_deadline: 1.day.from_now) }
  let(:sato) { Member.create!(name: "佐藤", email: "sato@example.com") }
  let(:suzuki) { Member.create!(name: "鈴木", email: "suzuki@example.com") }

  it "申し込みを保存し、確認メールのジョブを投入する" do
    result = nil
    expect { result = described_class.new.call(event:, member: sato) }
      .to have_enqueued_mail(RegistrationMailer, :confirmed).with(sato, event)

    expect(result).to be_success
    expect(result.registration).to be_persisted
  end

  it "満席なら :full を返し、保存もメールもしない" do
    described_class.new.call(event:, member: sato)

    result = nil
    expect { result = described_class.new.call(event:, member: suzuki) }.not_to have_enqueued_mail
    expect(result).to have_attributes(code: :full, registration: nil)
    expect(event.registrations.count).to eq 1
  end

  it "締め切りの後は :closed を返す" do
    travel_to(event.registration_deadline + 1.minute) do
      expect(described_class.new.call(event:, member: sato).code).to eq :closed
    end
  end

  it "外側のトランザクションがロールバックしたら、メールのジョブは投入されない" do
    expect do
      ApplicationRecord.transaction do
        described_class.new.call(event:, member: sato)
        raise ActiveRecord::Rollback
      end
    end.not_to have_enqueued_mail
    expect(Registration.count).to eq 0
  end
end
`}
          />
          <p>
            最後の例は、ユースケースが外側のトランザクションに加わった場合を確かめています。RSpec の例を包むテスト用のトランザクションは、<code>after_all_transactions_commit</code> が待つ対象に入りません。このメソッドは、ほかのトランザクションが加われる（joinable な）トランザクションだけを数え、テスト用のトランザクションは加われない設定で開始されるためです<Ref n={14} />。そのため、1つ目の例のようにトランザクションの外で呼んだ場合は、すぐにジョブが投入されます。
          </p>
          <p>
            ロールバックの後の確かめ方にも注意が要ります。<code>expect(event.registrations).to be_empty</code> と書くと、このテストは失敗しました。<code>registrations.create!</code> で作ったオブジェクトが、ロールバックの後も関連のメモリー上の配列に残り（ID は nil に戻る）、<code>empty?</code> が false を返したためです。DB に残った行は <code>Registration.count</code> のように新しく問い合わせて確かめます。
          </p>
          <h3>同時実行のテスト</h3>
          <p>
            同時の申し込みは別々の DB 接続で実行しないと再現できません。例ごとのトランザクションを使うと、すべてのスレッドが1本の接続を共有するためです（<ChapterLink n={20} section="transaction" />）。この spec ではテスト用のトランザクションを使わず、作ったデータを after で消します。
          </p>
          <Code
            lang="ruby"
            title="spec/services/register_for_event_concurrency_spec.rb"
            code={`
require "rails_helper"

RSpec.describe RegisterForEvent do
  self.use_transactional_tests = false # 2つのスレッドが別々の DB 接続を使うため

  after { [Registration, Event, Member].each(&:delete_all) }

  # 規則の確認と保存の間を広げた Event。インスタンスごとに上書きするので、ほかの例には影響しない
  def slow_event(id)
    Event.find(id).tap do |event|
      def event.rejection_reason_for(...) = super.tap { sleep 0.3 }
    end
  end

  it "残り1席に2人が同時に申し込んでも、成功は1件だけ" do
    event = Event.create!(title: "残り1席", capacity: 1, registration_deadline: 1.day.from_now)
    members = 2.times.map { |i| Member.create!(name: "会員#{i}", email: "m#{i}@example.com") }

    codes = members.map { |member|
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          described_class.new.call(event: slow_event(event.id), member:).code
        end
      end
    }.map(&:value)

    expect(codes).to contain_exactly(:ok, :full)
    expect(event.registrations.count).to eq 1
  end
end
`}
          />
          <p>
            <code>slow_event</code> は、そのインスタンスだけの <code>rejection_reason_for</code> を定義し、本来のメソッドを呼んだ後で 0.3 秒待ちます。ユースケースはイベントのオブジェクトを引数で受け取るので、テストの側で待ちを入れたオブジェクトを渡せます。<code>lock!</code> は同じオブジェクトを読み直すだけなので、上書きしたメソッドは残ったままです。RegisterForEvent から <code>event.lock!</code> の行を消して実行すると、このテストは次のように失敗しました。
          </p>
          <Code
            lang="text"
            title="実行結果（lock! の行を消した場合）"
            code={`
  1) RegisterForEvent 残り1席に2人が同時に申し込んでも、成功は1件だけ
     Failure/Error: expect(codes).to contain_exactly(:ok, :full)

       expected collection contained:  [:full, :ok]
       actual collection contained:    [:ok, :ok]
       the missing elements were:      [:full]
       the extra elements were:        [:ok]
`}
          />
          <h3>呼び出し元のテスト</h3>
          <p>
            リクエストのテストは呼び出し元ごとの変換だけを確かめます。規則の組み合わせはモデルとユースケースのテストで確かめたので、ここでは成功と1種類の失敗、存在しないイベントで足ります。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/registrations_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "申し込みの3つの呼び出し元", type: :request do
  let(:event) { Event.create!(title: "設計勉強会", capacity: 1, registration_deadline: 1.day.from_now) }
  let(:sato) { Member.create!(name: "佐藤", email: "sato@example.com") }
  let(:suzuki) { Member.create!(name: "鈴木", email: "suzuki@example.com") }

  def as(member) = { "X-Member-Id" => member.id.to_s }

  it "画面：結果をフラッシュの文言に変える" do
    post "/events/#{event.id}/registrations", headers: as(sato)
    expect(response).to redirect_to(event_path(event))
    expect(flash[:notice]).to eq "申し込みを受け付けました"

    post "/events/#{event.id}/registrations", headers: as(suzuki)
    expect(flash[:alert]).to eq "満席です"
  end

  it "API：成功は 201、断られたら 409 と理由のコード" do
    post "/api/events/#{event.id}/registrations", headers: as(sato)
    expect(response).to have_http_status(:created)

    post "/api/events/#{event.id}/registrations", headers: as(suzuki)
    expect(response).to have_http_status(:conflict)
    expect(response.parsed_body).to eq("error" => "full")
  end

  it "存在しないイベントは 404" do
    post "/api/events/0/registrations", headers: as(sato)
    expect(response).to have_http_status(:not_found)
  end

  it "CSV の取り込み：行ごとに結果を返す" do
    csv = "email\\nsato@example.com\\nnobody@example.com\\nsuzuki@example.com\\n"
    sato; suzuki
    file = Rack::Test::UploadedFile.new(StringIO.new(csv), "text/csv", original_filename: "members.csv")

    expect { post "/admin/events/#{event.id}/registration_imports", params: { file: } }
      .to have_enqueued_mail(RegistrationMailer, :confirmed).once
    expect(response.body.lines(chomp: true)).to eq [
      "2行目 sato@example.com: ok",
      "3行目 nobody@example.com: member_not_found",
      "4行目 suzuki@example.com: full",
    ]
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
Event
  #rejection_reason_for
    締め切りの後は :closed
    締め切りちょうどまでは受け付ける
    申し込み済みなら :already_registered、満席なら :full
  #register!
    断るときは理由を持つ例外を投げ、保存しない

申し込みの3つの呼び出し元
  画面：結果をフラッシュの文言に変える
  API：成功は 201、断られたら 409 と理由のコード
  存在しないイベントは 404
  CSV の取り込み：行ごとに結果を返す

RegisterForEvent
  残り1席に2人が同時に申し込んでも、成功は1件だけ

RegisterForEvent
  申し込みを保存し、確認メールのジョブを投入する
  満席なら :full を返し、保存もメールもしない
  締め切りの後は :closed を返す
  外側のトランザクションがロールバックしたら、メールのジョブは投入されない

Finished in 1.17 seconds (files took 0.91527 seconds to load)
13 examples, 0 failures
`}
          />
          <p>
            MSDP のカタログの例では、ユースケースのテストにメモリー上のリポジトリと、送ったメールを記録するオブジェクトを渡し、DB なしで手順を確かめていました。この章では本物の MySQL を使っています。定員の超過とロールバック後のメールは、どちらも DB のトランザクションとロックの振る舞いから起きる問題なので、DB を使うテストでなければ見つかりません。
          </p>
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
            <li>申し込みの手順を、RegisterForEvent の1つのファイルを読めば把握できます。トランザクションの範囲、ロックを取る位置、メールを投入する時点がコードに書かれています。</li>
            <li>画面・API・CSV の取り込みが同じ手順を使うので、規則を変えるときは Event を、手順を変えるときは RegisterForEvent を直せば、すべての呼び出し元に反映されます。</li>
            <li>呼び出し元はユースケースを呼んで結果を変換するだけになり、新しい呼び出し元（たとえば外部のチケット販売サービスからの Webhook）を加える作業が小さくなります。</li>
            <li>規則はモデルのテストで、手順はユースケースのテストで、出力の形はリクエストのテストで確かめられます。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>業務操作ごとにクラスが増えます。画面の値を1つのモデルに保存するだけの操作にまでユースケースを作ると、モデルを呼ぶだけのクラスが並びます。</li>
            <li>
              モデルの <code>register!</code> は「呼び出し元がロックしている」という前提を持ちます。コンソールや別のクラスから <code>register!</code> を直接呼ぶと、定員の保護が外れます。重複は一意索引で防げますが、定員は DB の制約では守れていません。
            </li>
            <li>規則をモデルに置くか、ユースケースに置くかを、そのつど判断する必要があります。</li>
            <li>Result の <code>code</code> の値は呼び出し元との取り決めなので、値を足したら、文言の表・ステータスコード・報告のすべてを確かめます。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            業務操作が多く、同じ操作を複数の呼び出し元から実行するアプリでは、手順はユースケースに、規則はモデルにまとまるので、変更の理由ごとに直すファイルが決まります。一方、ユースケースが規則まで持つと、ユースケースどうしで規則が重複し、規則を1つ変えるたびに複数のユースケースを直すことになります。テストは、規則・手順・出力の3つの層に分けられ、HTTP を通すテストは呼び出し元ごとの少数で済みます。同時実行とロールバックの振る舞いは、DB を使うテストで確かめる必要があります。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>規則をすべてユースケースに書く</h3>
          <Code
            lang="ruby"
            title="誤用の例：規則がユースケースにある"
            code={`
class RegisterForEvent
  def call(event:, member:)
    ApplicationRecord.transaction do
      event.lock!
      raise Rejected, :closed if Time.current > event.registration_deadline
      raise Rejected, :full if event.registrations.count >= event.capacity
      # …（省略）
    end
  end
end

class AddAttendeeByAdmin # 管理者が参加者を追加するユースケース。同じ規則を写している
  def call(event:, member:)
    ApplicationRecord.transaction do
      event.lock!
      raise Rejected, :full if event.registrations.count >= event.capacity
      # …（省略）
`}
          />
          <p>
            モデルがデータを持つだけになり、規則がユースケースに書かれると、「申し込み」と「管理者による追加」のように同じ規則を使うユースケースごとに規則が重複します。scene の節で3つのコントローラーに起きたことが、ユースケースの間で起きます。Fowler はこの状態をドメインモデル貧血症と呼んでいます<Ref n={2} />。規則は Event の <code>rejection_reason_for</code> のようにモデルのメソッドにし、ユースケースはそれを呼びます。
          </p>
          <h3>何でも入るサービスのクラス</h3>
          <Code
            lang="ruby"
            title="誤用の例：対象の名前だけを付けたクラス"
            code={`
class EventService
  def register(event, member) = # …
  def cancel(registration) = # …
  def import_csv(event, file) = # …
  def export_attendees(event) = # …
  def remind_all(event) = # …
end
`}
          />
          <p>
            EventService のように対象の名前だけを付けたクラスに、申し込み・取り消し・取り込み・出力・通知のメソッドを足していくと、クラスが長くなり、それぞれの操作が使う依存先（メーラー・CSV・外部のサービス）がすべて1つのクラスに集まります。1つの操作を変えるときに、ほかの操作のテストまで確かめることになります。1つのクラスには1つの業務操作だけを置き、RegisterForEvent・CancelRegistration のように操作の名前を付けます。
          </p>
          <h3>ユースケースが HTTP を知っている</h3>
          <Code
            lang="ruby"
            title="誤用の例：params を受け取り、ステータスコードを返す"
            code={`
class RegisterForEvent
  def call(params:, session:)
    event = Event.find(params[:event_id])
    member = Member.find(session[:member_id])
    # …（省略）
    [:conflict, { error: "満席です" }]
  end
end
`}
          />
          <p>
            ユースケースが <code>params</code>・<code>session</code>・ステータスコード・画面の文言を扱うと、CSV の取り込みやコンソール、ジョブからは呼べなくなります。CSV の取り込みからこのクラスを使うには、行ごとに params の形のハッシュを作ることになります。入力はイベントや会員のオブジェクト（または ID）で受け取り、HTTP への変換はコントローラーで行います。
          </p>
          <h3>トランザクションの中で外部と通信する</h3>
          <Code
            lang="ruby"
            title="誤用の例：ロックを持ったまま外部のサービスを呼ぶ"
            code={`
ApplicationRecord.transaction do
  event.lock!
  registration = event.register!(member)
  CalendarClient.new.add_attendee(event.external_id, member.email) # 外部の API（数秒かかることがある）
  RegistrationMailer.confirmed(member, event).deliver_now          # SMTP サーバーに接続して送る
end
`}
          />
          <p>
            このコードは外部のカレンダーのサービスとメールのサーバーの応答を待つ間も、イベントの行のロックと DB の接続を持ち続けます。人気のイベントで申し込みが集中すると、ほかの申し込みはすべて <code>lock!</code> で待ち、接続プールが足りなくなります。外部の処理は取り消せないので、その後でロールバックすると、カレンダーには参加者がいて DB には申し込みがない状態や、届いたメールに対応する申し込みがない状態が残ります。外部との通信はコミットの後に、ジョブとして行います。保存の前に外部を呼ぶ必要がある決済のような処理の順序は、<ChapterLink n={34} section="external-boundaries" />と<ChapterLink n={55} section="overview" />で扱います。
          </p>
          <h3>ユースケースからユースケースを呼ぶ</h3>
          <Code
            lang="ruby"
            title="誤用の例：一括の取り込みのユースケースが RegisterForEvent を呼ぶ"
            code={`
class ImportRegistrations
  def call(event:, members:)
    ApplicationRecord.transaction do # 全体を1つの単位にしたい
      members.map { |member| RegisterForEvent.new.call(event:, member:) }
    end
  end
end
`}
          />
          <p>
            RegisterForEvent のトランザクションは外側のトランザクションに加わるので、RegisterForEvent が自分で決めていたトランザクションの範囲は使われません。満席で断られた行は RegisterForEvent の中で結果に変わるので、外側のトランザクションはロールバックせず、「全体を1つの単位にする」という意図は守られません。イベントの行のロックは、すべての行を処理し終えるまで続きます。メールの投入は外側のコミットまで待つので結果は正しくなりますが、それはこのユースケースが <code>after_all_transactions_commit</code> を使っているからで、呼ぶ側のコードを読んでも分かりません。全体を1つの単位にする取り込みが必要なら、ImportRegistrations が自分のトランザクションの中で <code>event.lock!</code> と Event の <code>register!</code> を呼び、断られたら例外でロールバックします。共有するのはモデルのメソッドで、ユースケースどうしは呼び合いません。
          </p>
        </>
      ),
    },
    {
      id: 'alternatives',
      title: 'ほかの方法との使い分け',
      body: (
        <>
          <h3>より単純な方法</h3>
          <ul>
            <li>
              コントローラーに書く：画面の値を検証して1つのモデルに保存するだけの操作は、コントローラーとモデルで足ります。scaffold（ひな形の生成）で作られる形がこれに当たります。手順が増えた時点で、ユースケースに移します。
            </li>
            <li>
              モデルのメソッドにする：呼び出し元が1つで、1つのモデルの中で完結する操作は、モデルのメソッドで足ります。この章の <code>Event#register!</code> に、<code>with_lock</code>（トランザクションを開始して自分の行をロックするメソッド<Ref n={9} />）とメールの投入を加えれば、ユースケースのクラスなしでも同じ動作になります。37signals のように、モデルのメソッドを業務の操作の置き場所にする書き方もあります（<ChapterLink n={33} section="domain-application-service" />）。複数の呼び出し元、複数のモデル、外部とのやり取りが関わり、手順そのものが変わるようになったら、ユースケースを検討します。
            </li>
            <li>
              Form Object を作る：問題が入力の検証の多さだけなら、入力の項目と検証をまとめた Form Object を作ります。Rails では ActiveModel を使って作れます<Ref n={18} />（<ChapterLink n={33} section="model-form-objects" />）。Form Object とユースケースは、入力を Form Object で検証してから、その値でユースケースを呼ぶ形で組み合わせられます。
            </li>
            <li>
              モデルのコールバックでメールを送る：<code>after_create_commit</code> でメールを投入すると、コミットの後に送れます（<ChapterLink n={14} section="after-commit" />）。どの経路で保存してもメールを送るなら、この方法が最も短く書けます。CSV の取り込みでは送らない、のように経路ごとに変えたくなったら、コールバックではなくユースケースで投入します（<ChapterLink n={30} section="callback-design" />）。
            </li>
          </ul>
          <h3>ほかのパターンとの違い</h3>
          <ul>
            <li>Transaction Script（PoEAA）：1つのリクエストを1つの手続きで処理します<Ref n={4} />。規則もユースケースに書くなら、ユースケースは Transaction Script になります。規則の少ない操作ではこれで足ります。</li>
            <li>Service Layer（PoEAA）：アプリケーションが提供する操作の一覧を層として定義します<Ref n={3} />。この章のユースケースのクラスを集めたものが Service Layer に当たります。</li>
            <li>Command（GoF）：操作の要求をオブジェクトにします。ユースケースの入力（イベントと会員）をオブジェクトにすれば、キューに入れたり記録したりできます。</li>
            <li>Facade（GoF）：複数の部品をまとめた単純なインターフェースを作ります。ユースケースは、コントローラーから見て Facade の役割も持ちます。</li>
            <li>
              コマンドとクエリの分離：Bertrand Meyer が提唱した考え方で、状態を変える操作（コマンド）と値を返す操作（クエリ）を分けます<Ref n={19} />。Meyer の定義ではコマンドは値を返しませんが、RegisterForEvent は呼び出し元が応答を選べるように結果を返します。イベントの一覧の表示のような読み取りは、RegisterForEvent に混ぜず、スコープや Query Object にします。
            </li>
            <li>
              Clean Architecture（Robert C. Martin）：ユースケースの層を、アプリケーション固有の業務の規則を持ち、エンティティとの間のデータの流れを調整する層としています<Ref n={20} />。締め切りや定員の規則を Event に置き、ユースケースが手順を調整するこの章の分け方は、この関係に対応します。
            </li>
            <li>
              Functional Core, Imperative Shell：計算と判断を副作用のないクラスに分け、DB や時刻を扱う側から呼びます。ユースケースは手順の調整、Functional Core は計算の分離が目的で、組み合わせて使えます（<ChapterLink n={45} section="alternatives" />）。
            </li>
            <li>
              Domain Events：申し込みの後に行う処理（メール、ポイントの付与、集計の更新）が増えたら、ユースケースが1つずつ呼ぶ代わりに「申し込まれた」というイベントを記録し、それぞれの処理が受け取る形にできます（<ChapterLink n={51} section="idea" />）。
            </li>
          </ul>
          <h3>gem を使う場合</h3>
          <p>ユースケースのクラスの書き方をそろえる gem もあります。</p>
          <ul>
            <li>
              ActiveInteraction：README は自身を「Rails になじむように設計されたサービスオブジェクトの実装」と説明しています。クラスに入力の型（filter）を宣言すると、<code>run</code> が入力を検査し、<code>valid?</code>・<code>result</code>・<code>errors</code> を持つ outcome を返します。<code>compose</code> で別の interaction を呼べ、フォームの部品にも渡せます<Ref n={21} />。入力の型の検査と結果の形を全員でそろえたいときに向いています。トランザクションの範囲やメールを投入する時点は、この章と同じく自分で書きます。
            </li>
            <li>
              Interactor：1つの目的を持つ interactor と、複数の interactor を順に実行する organizer を提供します。interactor の間では context というオブジェクトで値を受け渡し、<code>context.fail!</code> で失敗を表します。organizer の途中で失敗すると、実行済みの interactor の <code>rollback</code> メソッドが逆順に呼ばれます<Ref n={22} />。この rollback は DB のロールバックではなく、自分で書く取り消しの処理です。DB の更新をまとめて取り消したいなら、organizer 全体をトランザクションの中で実行するなど、別に設計します。
            </li>
          </ul>
          <p>
            どちらも、この章の RegisterForEvent が行っていること（ロックの位置、コミットの後のメール、例外と結果の分け方）を自動で決めるわけではありません。チームでクラスの形をそろえる効果と、gem の書き方を覚えて追従する手間を比べて選びます。<code>Data.define</code> の Result と普通のクラスで足りるなら、gem は要りません。
          </p>
          <h3>採用の判断</h3>
          <p>次の条件に当てはまるときは、ユースケースのクラスを作ります。</p>
          <ul>
            <li>1つの業務操作が、複数のモデルの読み書き、トランザクション、外部とのやり取り（メール・外部の API）を含む。</li>
            <li>同じ業務操作を、複数の呼び出し元（画面・API・管理画面・バッチ処理）から実行する。</li>
            <li>コントローラーやモデルのコールバックに手順が散らばり、どこで何が起きるかを追えない。</li>
          </ul>
          <p>次の条件に当てはまるときは、作らないほうが小さく書けます。</p>
          <ul>
            <li>画面の値を検証して1つのモデルに保存するだけの操作。</li>
            <li>1つのモデルの中で完結し、呼び出し元も1つの操作（モデルのメソッドで足りる）。</li>
            <li>読み取りだけの処理（一覧や詳細の表示）。</li>
          </ul>
          <p>作った後は、次の点を確かめます。</p>
          <ol>
            <li>そのクラスは、1つの業務操作だけを扱っているか。</li>
            <li>業務の規則はモデルにあり、ユースケースは手順を呼ぶだけになっているか。</li>
            <li>トランザクションの範囲、ロックを取る位置、取り消せない処理を行う時点が、コードから読めるか。</li>
            <li>ユースケースが HTTP のステータスコード・リクエスト・画面の文言を知らないか。</li>
            <li>想定される失敗は結果で、想定外の失敗は例外で伝わるか。</li>
            <li>同時実行とロールバックの振る舞いを、DB を使うテストで確かめているか。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>同じ業務操作の手順を複数の呼び出し元に書くと、規則の変更が一部にしか反映されず、API が定員を超えるような食い違いが起きます。</li>
          <li>Use Case / Application Service は、1つの業務操作の手順を1つのクラスにまとめます。規則はモデル、手順とトランザクションはユースケース、HTTP や CSV への変換は呼び出し元が受け持ちます。</li>
          <li>戻り値は <code>Data.define</code> の Result で、成功と断る理由のコードを返します。画面の文言は呼び出し元が選び、対象が見つからない・DB の障害などは例外のまま伝えます。</li>
          <li>定員は <code>lock!</code> でイベントの行をロックして守ります。MySQL の REPEATABLE READ では、ロックの前に普通の SELECT をすると古いスナップショットで数えるので、<code>lock!</code> をトランザクションの最初の読み取りにします。</li>
          <li>Rails 8.1 では <code>enqueue_after_transaction_commit</code> の既定が false で、トランザクションの中の <code>deliver_later</code> はロールバックしても残ります。<code>ActiveRecord.after_all_transactions_commit</code> の中で投入します。</li>
          <li>Rails では Active Record のモデルが Repository の役割を持つので、検索の条件はスコープとクラスメソッドで表します。保存先が DB でない場合や集約の単位で保存したい場合に、別のクラスに分けます。</li>
          <li>ユースケースから別のユースケースを呼ばず、共有する処理はモデルのメソッドにします。外部との通信はコミットの後に行います。</li>
          <li>操作が1つのモデルで完結するならモデルのメソッドで、入力の検証だけが問題なら Form Object で足ります。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Use-Case 2.0: The Hub of Software Development', publisher: 'Ivar Jacobson, Ian Spence, Brian Kerr／ACM Queue（Ivar Jacobson International が公開した PDF）', url: 'https://www.ivarjacobson.com/files/use-case_2.0_the_hub.pdf', accessed: '2026-11-13', version: '2016年1-2月号', note: 'ユースケースが OOPSLA 87 で発表され、1992年の書籍の出版後に広く使われるようになったこと。' },
    { title: 'AnemicDomainModel', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/AnemicDomainModel.html', accessed: '2026-11-13', version: '2003年11月25日', note: 'ドメインモデル貧血症の定義と、Evans のアプリケーション層の説明（薄く保ち、規則を持たず、調整と委譲だけを行う）の引用。' },
    { title: 'Service Layer', publisher: 'martinfowler.com（Patterns of Enterprise Application Architecture）', url: 'https://martinfowler.com/eaaCatalog/serviceLayer.html', accessed: '2026-11-13', note: 'アプリケーションの操作の一覧を定め、各操作の応答を調整する層。' },
    { title: 'Transaction Script', publisher: 'martinfowler.com（Patterns of Enterprise Application Architecture）', url: 'https://martinfowler.com/eaaCatalog/transactionScript.html', accessed: '2026-11-13', note: '1つのリクエストを1つの手続きで処理する組み立て方。' },
    { title: 'Domain Model', publisher: 'martinfowler.com（Patterns of Enterprise Application Architecture）', url: 'https://martinfowler.com/eaaCatalog/domainModel.html', accessed: '2026-11-13', note: '振る舞いとデータを持つ業務のオブジェクトのモデル。' },
    { title: 'Repository', publisher: 'martinfowler.com（Patterns of Enterprise Application Architecture）', url: 'https://martinfowler.com/eaaCatalog/repository.html', accessed: '2026-11-13', note: 'コレクションのようなインターフェースで業務のオブジェクトにアクセスし、業務の層とデータの対応付けの層の間を取り持つこと。' },
    { title: 'Active Record', publisher: 'martinfowler.com（Patterns of Enterprise Application Architecture）', url: 'https://martinfowler.com/eaaCatalog/activeRecord.html', accessed: '2026-11-20', note: 'テーブルやビューの1行を包み、DB へのアクセスを隠し、そのデータに業務のロジックを加えるオブジェクトという定義。' },
    { title: 'Autoloading and Reloading Constants（Custom Namespaces）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html#custom-namespaces', accessed: '2026-11-13', version: 'Rails 8.1', note: 'app/services は既定では作られないが、作れば自動で読み込みの対象になること。' },
    { title: 'activerecord/lib/active_record/locking/pessimistic.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/locking/pessimistic.rb#L69-L104`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'lock! が reload(lock: true) で行を読み直してロックすること、with_lock がトランザクションを開始して lock! を呼ぶこと。' },
    { title: 'Consistent Nonlocking Reads', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'REPEATABLE READ では、同じトランザクションの普通の SELECT が最初の普通の SELECT で決まったスナップショットを読むこと、READ COMMITTED では読み取りごとに新しいスナップショットを読むこと、ロックを取る読み取りは最新の値を読むこと。' },
    { title: 'Transaction Isolation', publisher: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs/current/transaction-iso.html', accessed: '2026-11-20', note: 'PostgreSQL の既定の分離レベルが Read Committed で、SELECT ごとにその開始時点のスナップショットを読むこと。' },
    { title: 'activejob/lib/active_job/enqueuing.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/enqueuing.rb#L15-L23`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'enqueue_after_transaction_commit がジョブのクラスごとの設定で、既定値が false であること。' },
    { title: 'activejob/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/CHANGELOG.md`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'Rails 8.1.0 で :never・:always・:default の指定と、config.active_job.enqueue_after_transaction_commit が削除されたこと。' },
    { title: 'activerecord/lib/active_record.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record.rb#L560-L605`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'after_all_transactions_commit が、開いているトランザクションがなければすぐに、あればすべてのコミット後に実行し、ロールバックされたら実行しないこと。対象は開いていて joinable なトランザクションだけであること。' },
    { title: 'railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/railties/lib/rails/application/configuration.rb#L324-L328', accessed: '2026-11-20', version: 'Rails 7.2.4', note: 'load_defaults 7.2 で active_job.enqueue_after_transaction_commit を :default にすること。' },
    { title: 'activejob/lib/active_job/enqueue_after_transaction_commit.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/activejob/lib/active_job/enqueue_after_transaction_commit.rb', accessed: '2026-11-20', version: 'Rails 7.2.4', note: ':default のときアダプターの enqueue_after_transaction_commit? に従い、true なら after_all_transactions_commit で投入すること。' },
    { title: 'Ruby on Rails 8.0 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/8_0_release_notes.html', accessed: '2026-11-20', version: 'Rails 8.0', note: 'params#expect が追加され、params.expect(table: [:attr]) が params.require(:table).permit(:attr) に代わること。' },
    { title: 'Active Model Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_model_basics.html', accessed: '2026-11-13', version: 'Rails 8.1', note: 'ActiveModel::Model と ActiveModel::Attributes による入力のクラス。' },
    { title: 'CommandQuerySeparation', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/CommandQuerySeparation.html', accessed: '2026-11-13', version: '2005年12月5日', note: 'Bertrand Meyer によるコマンドとクエリの分離。' },
    { title: 'The Clean Architecture', publisher: 'The Clean Code Blog / Robert C. Martin', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html', accessed: '2026-11-13', version: '2012年8月13日', note: 'ユースケースの層の説明。' },
    { title: 'ActiveInteraction README', publisher: 'AaronLasseigne/active_interaction（GitHub）', url: 'https://github.com/AaronLasseigne/active_interaction', accessed: '2026-11-20', note: 'Rails になじむサービスオブジェクトの実装であること、filter による入力の検査、run が返す outcome（valid?・result・errors）、compose、フォームでの利用。' },
    { title: 'Interactor README', publisher: 'collectiveidea/interactor（GitHub）', url: 'https://github.com/collectiveidea/interactor', accessed: '2026-11-20', note: '1つの目的を持つ interactor、context と context.fail!、organizer、失敗時に実行済みの interactor の rollback を逆順に呼ぶこと。' },
  ],
}

export default chapter
