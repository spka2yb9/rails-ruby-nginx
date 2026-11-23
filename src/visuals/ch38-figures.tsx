import { Arrow, Box, Svg, T } from '../components/diagram'

/* 第14章（ID 38）トランザクションと同時実行の図 */

/* ---------- 図 14-1 送金とトランザクション ---------- */
export function TransferFigure() {
  type Step = { t: string; fill: 'box' | 'box4' | 'bg' | 'box5'; danger?: boolean }
  const col = (x: number, title: string, steps: Step[], result: string[], tone: 'danger' | 'acc') => (
    <g>
      <T x={x} y={22} bold fs={12.5}>
        {title}
      </T>
      {steps.map((s, i) => (
        <g key={i}>
          <Box x={x} y={36 + i * 50} w={220} h={36} lines={s.t} mono fs={11.5} fill={s.fill} dashed={s.danger} />
          {i < steps.length - 1 && <Arrow x1={x + 110} y1={72 + i * 50} x2={x + 110} y2={84 + i * 50} />}
        </g>
      ))}
      <Box x={x} y={250} w={220} h={50} lines={result} fs={12} fill="bg" subTone={tone} />
    </g>
  )
  return (
    <Svg
      id="14-1"
      w={760}
      h={340}
      label="口座1から口座2へ1000を送る2つのUPDATE。トランザクションなしでは1つ目のUPDATEがその場で確定し、2つ目の前に失敗すると口座1が9000、口座2が10000になり、1000がどこにも無くなる。BEGINの後で失敗してROLLBACKすると1つ目も取り消され、両方10000に戻る。2つのUPDATEが成功してCOMMITすると、口座1が9000、口座2が11000で確定する。COMMITまでの変更はほかの接続からは見えない"
    >
      {col(
        20,
        'トランザクションなし（autocommit）',
        [
          { t: 'UPDATE 口座1 −1000', fill: 'box4' },
          { t: '（その場で確定）', fill: 'bg' },
          { t: '2つ目の UPDATE の前に失敗', fill: 'bg', danger: true },
        ],
        ['口座1 9000・口座2 10000', '1000 がどこにも無い'],
        'danger',
      )}
      {col(
        270,
        'BEGIN … ROLLBACK',
        [
          { t: 'BEGIN', fill: 'box' },
          { t: 'UPDATE 口座1 −1000', fill: 'box4' },
          { t: '2つ目の UPDATE が失敗', fill: 'bg', danger: true },
          { t: 'ROLLBACK', fill: 'box5' },
        ],
        ['口座1 10000・口座2 10000', '1つ目も取り消された'],
        'acc',
      )}
      {col(
        520,
        'BEGIN … COMMIT',
        [
          { t: 'BEGIN', fill: 'box' },
          { t: 'UPDATE 口座1 −1000', fill: 'box4' },
          { t: 'UPDATE 口座2 +1000', fill: 'box4' },
          { t: 'COMMIT', fill: 'box5' },
        ],
        ['口座1 9000・口座2 11000', '2つとも確定した'],
        'acc',
      )}
      <T x={20} y={326} fs={11.5} tone="muted">
        COMMIT するまでの変更は、ほかの接続からは見えない（ほかの接続には口座1の 10000 が見える）
      </T>
    </Svg>
  )
}

/* ---------- 図 14-2 同時の送金で更新が消える ---------- */
export function LostUpdateFigure() {
  const ev = (x: number, y: number, t: string, sub: string, fill: 'box' | 'box4' = 'box') => (
    <Box x={x} y={y} w={210} h={40} lines={[t, sub]} fs={11.5} fill={fill} subTone="muted" />
  )
  return (
    <Svg
      id="14-2"
      w={760}
      h={300}
      label="A が 0.03 秒に口座1の残高 10000 を読み、B も 0.10 秒に同じ 10000 を読む。A は 0.34 秒に 10000−1000 の 9000 を書いて COMMIT し、B は 0.41 秒に同じく 9000 を書いて COMMIT する。口座1の残高は 10000、9000、9000 と変わり、2回の送金で 8000 になるはずが 9000 になった"
    >
      <T x={150} y={20} anchor="middle" bold>
        A（1000 を送金）
      </T>
      <T x={400} y={20} anchor="middle" bold>
        B（1000 を送金）
      </T>
      <T x={645} y={20} anchor="middle" bold>
        口座1の残高（DB）
      </T>
      <line x1={150} y1={30} x2={150} y2={240} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={400} y1={30} x2={400} y2={240} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {ev(45, 40, '0.03s 残高を読む → 10000', 'SELECT')}
      {ev(295, 84, '0.10s 残高を読む → 10000', 'SELECT')}
      {ev(45, 130, '0.34s 9000 を書く・COMMIT', 'SET balance = 9000', 'box4')}
      {ev(295, 176, '0.41s 9000 を書く・COMMIT', 'SET balance = 9000', 'box4')}
      <Box x={575} y={45} w={140} h={30} lines="10000" mono fs={12} fill="bg" />
      <Box x={575} y={135} w={140} h={30} lines="9000" mono fs={12} fill="bg" />
      <Box x={575} y={181} w={140} h={30} lines="9000" mono fs={12} fill="box5" accent />
      <Arrow x1={645} y1={77} x2={645} y2={133} />
      <Arrow x1={645} y1={167} x2={645} y2={179} />
      <T x={20} y={266} fs={12} tone="danger">
        2回の送金がどちらも成功したのに、口座1は 8000 ではなく 9000 になった
      </T>
      <T x={20} y={288} fs={11} tone="muted">
        どちらも相手が書く前の 10000 を読み、Ruby で計算した値をそのまま書いたため、B の書き込みが A の書き込みを上書きした
      </T>
    </Svg>
  )
}

/* ---------- 図 14-3 S ロックと X ロックの両立 ---------- */
export function LockMatrixFigure() {
  const cell = (x: number, y: number, t: string, ok: boolean) => (
    <Box x={x} y={y} w={150} h={46} lines={t} fs={12} fill={ok ? 'box4' : 'box5'} rx={0} />
  )
  return (
    <Svg
      id="14-3"
      w={760}
      h={300}
      label="同じ行について、A が S ロックを持っているとき、B の S ロックの要求はすぐに通り、X ロックの要求は待つ。A が X ロックを持っているときは、B の S ロックの要求も X ロックの要求も待つ。SELECT … FOR SHARE は S ロック、SELECT … FOR UPDATE・UPDATE・DELETE は X ロックを取る。通常の SELECT はロックを取らずに確定済みのバージョンを読む。ロックは COMMIT か ROLLBACK まで持ち続ける"
    >
      <T x={200} y={22} bold fs={12.5}>
        B が同じ行に要求するロック
      </T>
      <Box x={180} y={36} w={150} h={32} lines="S ロック" fs={12} fill="box" rx={0} />
      <Box x={330} y={36} w={150} h={32} lines="X ロック" fs={12} fill="box" rx={0} />
      <T x={20} y={52} bold fs={12.5}>
        A が持つロック
      </T>
      <Box x={30} y={68} w={150} h={46} lines="S ロック" fs={12} fill="box" rx={0} />
      <Box x={30} y={114} w={150} h={46} lines="X ロック" fs={12} fill="box" rx={0} />
      {cell(180, 68, 'すぐに得られる', true)}
      {cell(330, 68, '待つ（WAITING）', false)}
      {cell(180, 114, '待つ（WAITING）', false)}
      {cell(330, 114, '待つ（WAITING）', false)}

      <Box x={510} y={36} w={230} h={124} fill="bg" lines={[]} />
      <T x={522} y={56} bold fs={12.5}>
        ロックを取る SQL
      </T>
      <T x={522} y={82} mono fs={11.5}>
        SELECT … FOR SHARE → S
      </T>
      <T x={522} y={104} mono fs={11.5}>
        SELECT … FOR UPDATE → X
      </T>
      <T x={522} y={126} mono fs={11.5}>
        UPDATE・DELETE → X
      </T>
      <T x={522} y={148} fs={11.5} tone="muted">
        通常の SELECT → ロックなし
      </T>

      <Box x={30} y={186} w={710} h={96} fill="bg" lines={[]} />
      <Box x={44} y={198} w={22} h={16} fill="box4" rx={2} lines={[]} />
      <T x={74} y={206} fs={11.5}>
        両立する（両方のトランザクションが同時に持てる）
      </T>
      <Box x={404} y={198} w={22} h={16} fill="box5" rx={2} lines={[]} />
      <T x={434} y={206} fs={11.5}>
        両立しない（後から要求した側が待つ）
      </T>
      <T x={44} y={236} fs={11.5}>
        ロックは COMMIT か ROLLBACK まで持ち続け、終わると待っていた要求が順に進む
      </T>
      <T x={44} y={260} fs={11.5} tone="muted">
        通常の SELECT は X ロックのある行でも待たずに確定済みのバージョンを読む（SERIALIZABLE を除く）
      </T>
    </Svg>
  )
}

/* ---------- 図 14-4 分離レベルによる読み直しの違い ---------- */
export function IsolationFigure() {
  const rows: [string, string, string][] = [
    ['READ UNCOMMITTED', '5000', 'B の COMMIT 前でも未確定の値を読むことがある'],
    ['READ COMMITTED', '5000', '文ごとに、その時点で確定している値'],
    ['REPEATABLE READ', '10000', '最初の読み取りのスナップショット（MySQL の既定）'],
    ['SERIALIZABLE', '10000', 'A の SELECT が S ロックを取り、B の UPDATE が待つ'],
  ]
  return (
    <Svg
      id="14-4"
      w={760}
      h={326}
      label="A が BEGIN して口座1を読み 10000 を得る。B が口座1を 5000 に UPDATE して COMMIT する。A がもう一度読んだ値は、READ UNCOMMITTED と READ COMMITTED では 5000、REPEATABLE READ では 10000。SERIALIZABLE では A の最初の SELECT が S ロックを取るので、B の UPDATE は A が終わるまで待ち、A の2回目の読み取りは 10000 になる"
    >
      <T x={80} y={20} anchor="middle" bold>
        A
      </T>
      <T x={250} y={20} anchor="middle" bold>
        B
      </T>
      <line x1={80} y1={30} x2={80} y2={200} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={250} y1={30} x2={250} y2={200} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <Box x={10} y={40} w={140} h={34} lines={['BEGIN', 'SELECT → 10000']} fs={11.5} />
      <Box x={180} y={88} w={140} h={34} lines={['UPDATE → 5000', 'COMMIT']} fs={11.5} fill="box4" />
      <Box x={10} y={140} w={140} h={34} lines="もう一度 SELECT → ?" fs={11.5} fill="box5" accent />
      <Arrow x1={152} y1={157} x2={350} y2={157} dashed />

      <T x={360} y={26} bold fs={12.5}>
        A の分離レベル
      </T>
      <T x={530} y={26} bold fs={12.5}>
        2回目の値
      </T>
      {rows.map(([level, v, note], i) => (
        <g key={level}>
          <Box x={355} y={40 + i * 64} w={160} h={30} lines={level} mono fs={11.5} fill={level === 'REPEATABLE READ' ? 'box5' : 'box'} rx={0} />
          <Box x={515} y={40 + i * 64} w={70} h={30} lines={v} mono fs={12} fill="bg" rx={0} />
          <T x={360} y={84 + i * 64} fs={11} tone="muted">
            {note}
          </T>
        </g>
      ))}
      <T x={10} y={230} fs={11.5}>
        シミュレーターの「Isolation / MVCC · 読み直し比較」と、
      </T>
      <T x={10} y={250} fs={11.5}>
        MySQL 8.4 で Rails から実測した結果が一致した
      </T>
      <T x={10} y={310} fs={11} tone="muted">
        SERIALIZABLE で B の UPDATE が進むのは A が COMMIT した後。A がその後に新しいトランザクションで読むと 5000 になる
      </T>
    </Svg>
  )
}

/* ---------- 図 14-5 行のバージョンとスナップショット ---------- */
export function MvccFigure() {
  return (
    <Svg
      id="14-5"
      w={760}
      h={340}
      label="口座1の行には、初期値 10000 の Version 0 と、B が COMMIT した 5000 の Version 1 がある。A は REPEATABLE READ で、最初の通常の SELECT のときに作ったスナップショットで読むので、B の COMMIT の後でも通常の SELECT は 10000 の Version 0 を読む。FOR SHARE と UPDATE は最新の確定済みの Version 1（5000）を対象にする。A の UPDATE で 5000 から 1000 を引いた未確定の 4000 ができ、その後の A の通常の SELECT は自分の変更である 4000 を読む"
    >
      <T x={20} y={22} bold fs={12.5}>
        口座1（accounts.id = 1）のバージョン
      </T>
      <Box x={20} y={40} w={250} h={50} lines={['未確定：balance = 4000', 'A の UPDATE（COMMIT 前）']} fs={12} fill="box5" dashed subTone="muted" />
      <Arrow x1={145} y1={128} x2={145} y2={92} />
      <Box x={20} y={130} w={250} h={50} lines={['Version 1：balance = 5000', 'B が COMMIT']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={145} y1={218} x2={145} y2={182} />
      <Box x={20} y={220} w={250} h={50} lines={['Version 0：balance = 10000', '初期値']} fs={12} fill="box4" subTone="muted" />
      <T x={20} y={296} fs={11} tone="muted">
        下が古いバージョン。InnoDB は古いバージョンを作るための情報を undo ログに残す
      </T>

      <Box x={380} y={40} w={360} h={50} lines={['A の通常の SELECT（UPDATE の後）', '自分の未確定の変更が見える → 4000']} fs={11.5} subTone="acc" />
      <Arrow x1={378} y1={65} x2={272} y2={65} accent />
      <Box x={380} y={130} w={360} h={50} lines={['A の SELECT … FOR SHARE と UPDATE', '最新の確定済みのバージョンを対象にする → 5000']} fs={11.5} subTone="acc" />
      <Arrow x1={378} y1={155} x2={272} y2={155} accent />
      <Box x={380} y={220} w={360} h={50} lines={['A の通常の SELECT（REPEATABLE READ）', '最初の読み取りのスナップショット → 10000']} fs={11.5} subTone="acc" />
      <Arrow x1={378} y1={245} x2={272} y2={245} accent />
      <T x={20} y={318} fs={11} tone="muted">
        FOR SHARE で 5000 を読んだ直後でも、通常の SELECT は 10000 を返した（実測）
      </T>
    </Svg>
  )
}

/* ---------- 図 14-6 待ちの循環とロックの順序 ---------- */
export function DeadlockFigure() {
  return (
    <Svg
      id="14-6"
      w={760}
      h={300}
      label="左：A は口座1をロックして口座2を待ち、B は口座2をロックして口座1を待つ。待ちの矢印が A から B、B から A へ循環するのでデッドロックになり、InnoDB が一方をロールバックする。右：A も B も口座1、口座2の順にロックすると、B は口座1で A を待つだけで循環はできず、A の COMMIT の後に B が進む"
    >
      <T x={20} y={22} bold fs={12.5}>
        逆の順でロックする（送金 1→2 と 2→1）
      </T>
      <Box x={30} y={50} w={120} h={50} lines={['A', '口座1を持つ']} fs={12} subTone="muted" />
      <Box x={250} y={50} w={120} h={50} lines={['B', '口座2を持つ']} fs={12} subTone="muted" />
      <Arrow d="M 150 64 C 190 40, 210 40, 248 64" accent />
      <T x={200} y={36} anchor="middle" fs={11} tone="danger">
        口座2を待つ
      </T>
      <Arrow d="M 250 88 C 210 112, 190 112, 152 88" accent />
      <T x={200} y={122} anchor="middle" fs={11} tone="danger">
        口座1を待つ
      </T>
      <Box x={30} y={146} w={340} h={36} lines="待ちが循環 → InnoDB が一方をロールバック" fs={12} fill="box5" />
      <T x={30} y={206} fs={11.5}>
        犠牲になった側は ActiveRecord::Deadlocked
      </T>
      <T x={30} y={226} fs={11.5}>
        もう一方はロックを得て処理を続ける
      </T>

      <T x={410} y={22} bold fs={12.5}>
        同じ順でロックする（口座1 → 口座2）
      </T>
      <Box x={420} y={50} w={120} h={50} lines={['A', '口座1・2を持つ']} fs={12} subTone="muted" />
      <Box x={620} y={50} w={120} h={50} lines={['B', 'まだ何も持たない']} fs={12} subTone="muted" />
      <Arrow d="M 620 88 C 590 112, 570 112, 542 88" />
      <T x={580} y={122} anchor="middle" fs={11} tone="muted">
        口座1を待つ
      </T>
      <Box x={420} y={146} w={320} h={36} lines="待ちは一方向だけ → 循環しない" fs={12} fill="box4" />
      <T x={420} y={206} fs={11.5}>
        A の COMMIT の後に B が口座1・2を順にロックする
      </T>
      <T x={420} y={226} fs={11.5}>
        B は待つだけで、例外にはならない
      </T>
      <T x={20} y={276} fs={11} tone="muted">
        矢印は「待っている側 → ロックを持っている側」。シミュレーターの Wait-for Graph と同じ向き
      </T>
    </Svg>
  )
}

/* ---------- transaction のブロックの終わり方（番号なし） ---------- */
export function TransactionEndFigure() {
  return (
    <Svg
      id="ch38-tx-end"
      w={760}
      h={420}
      label="transaction のブロックの中で例外が起きなければ、Rails は COMMIT を送り、ブロックの中の変更をすべて確定する。例外が起きて、ブロックの中で rescue した場合は、ブロックが続いて終わりで COMMIT が送られ、エラーより前の変更が確定する。rescue しなかった場合は、例外がブロックの外へ出るときに Rails が ROLLBACK を送る。その例外が ActiveRecord::Rollback なら呼び出し元へは伝わらず、transaction は nil を返す。それ以外の例外は呼び出し元へ伝わる。MySQL はエラーになった文だけを取り消してトランザクションを続けるので、rescue した後の COMMIT でそれより前の変更が確定する"
    >
      <Box x={20} y={14} w={260} h={44} lines={['transaction のブロックの中で', '例外が起きたか']} fs={12} />
      <Arrow x1={280} y1={36} x2={398} y2={36} />
      <T x={300} y={26} fs={11.5}>
        いいえ
      </T>
      <Box x={400} y={14} w={340} h={44} lines={['COMMIT を送る', 'ブロックの中の変更をすべて確定する']} fs={12.5} fill="bg" subTone="muted" />
      <Arrow x1={150} y1={58} x2={150} y2={88} />
      <T x={158} y={74} fs={11.5}>
        はい
      </T>

      <Box x={20} y={90} w={260} h={44} lines={['その例外をブロックの中で', 'rescue したか']} fs={12} />
      <Arrow x1={280} y1={112} x2={398} y2={112} />
      <T x={300} y={102} fs={11.5}>
        はい
      </T>
      <Box x={400} y={90} w={340} h={44} lines={['ブロックは続き、終わりで COMMIT が送られる','エラーより前の変更が確定する（口座2だけが増える）']} fs={12.5} fill="bg" subTone="danger" />
      <Arrow x1={150} y1={134} x2={150} y2={164} />
      <T x={158} y={150} fs={11.5}>
        いいえ
      </T>

      <Box x={20} y={166} w={260} h={44} lines={['例外がブロックの外へ出る', 'Rails が ROLLBACK を送る']} fs={12} fill="box5" />
      <Arrow x1={150} y1={210} x2={150} y2={240} />

      <Box x={20} y={242} w={260} h={44} lines="例外は ActiveRecord::Rollback か" fs={12} />
      <Arrow x1={280} y1={264} x2={398} y2={264} />
      <T x={300} y={254} fs={11.5}>
        はい
      </T>
      <Box x={400} y={242} w={340} h={44} lines={['例外は呼び出し元へ伝わらない', 'transaction は nil を返す']} fs={12.5} fill="bg" subTone="muted" />
      <Arrow d="M 150 286 L 150 340 L 398 340" />
      <T x={158} y={310} fs={11.5}>
        いいえ
      </T>
      <Box x={400} y={318} w={340} h={44} lines={['例外が呼び出し元へ伝わる', 'RuntimeError・CheckViolation など']} fs={12.5} fill="bg" subTone="muted" />

      <T x={20} y={386} fs={11.5} tone="muted">
        MySQL はエラーになった文だけを取り消し、トランザクションを続ける
      </T>
      <T x={20} y={406} fs={11.5} tone="muted">
        そのため、rescue した後の COMMIT でエラーより前の変更が確定する
      </T>
    </Svg>
  )
}

/* ---------- next-key ロックと隙間（番号なし） ---------- */
export function NextKeyFigure() {
  const gap = (x: number) => <Box x={x} y={68} w={50} h={46} lines="隙間" fs={11.5} fill="bg" dashed rx={0} />
  const rec = (x: number, id: number, balance: string) => (
    <Box x={x} y={68} w={90} h={46} lines={[`id=${id}`, balance]} mono fs={12.5} fill="box4" subTone="muted" rx={0} />
  )
  const lock = (x: number, w: number, t: string) => <Box x={x + 2} y={18} w={w - 4} h={32} lines={t} fs={12} fill="box5" />
  return (
    <Svg
      id="ch38-next-key"
      w={760}
      h={292}
      label="accounts の PRIMARY 索引には、id=1（残高 10000）、id=2（10000）、id=3（8000）のレコードが主キーの順に並び、各レコードの前と最後のレコードの後ろに隙間がある。最後のレコードより後ろの隙間は supremum という仮の行で表す。A が FOR SHARE で数えると、REC_NOT_GAP の付かない S ロック（next-key ロック）が id=1、id=2、id=3、supremum に付き、それぞれが行とその前の隙間をまとめてロックする。B の INSERT は新しい行を最後の行の後ろの隙間に入れようとして X,INSERT_INTENTION を要求し、A がその隙間をロックしているので WAITING になる。balance に索引が無いので、A は条件に合わない id=3 も含め、全行と隙間をロックした。B の INSERT は A の COMMIT まで約 0.3 秒待った"
    >
      <T x={20} y={34} bold fs={12}>
        A のロック
      </T>
      <T x={20} y={91} bold fs={12}>
        PRIMARY 索引
      </T>
      <T x={20} y={185} bold fs={12}>
        B の要求
      </T>

      {lock(140, 140, 'S（1）')}
      {lock(280, 140, 'S（2）')}
      {lock(420, 140, 'S（3）')}
      {lock(560, 170, 'S（supremum）')}

      {gap(140)}
      {rec(190, 1, '10000')}
      {gap(280)}
      {rec(330, 2, '10000')}
      {gap(420)}
      {rec(470, 3, '8000')}
      {gap(560)}
      <Box x={610} y={68} w={120} h={46} lines={['supremum', '仮の行']} fs={12.5} fill="bg" dashed subTone="muted" rx={0} />

      <Arrow x1={585} y1={160} x2={585} y2={118} />
      <T x={575} y={138} anchor="end" fs={11.5} tone="muted">
        新しい行を最後の行の後ろの隙間に入れようとする
      </T>
      <Box x={470} y={162} w={270} h={46} lines={['B の INSERT（残高 9500 の口座）', 'X,INSERT_INTENTION · WAITING']} fs={12.5} subTone="danger" />

      <T x={20} y={236} fs={11.5}>
        REC_NOT_GAP の付かない S は next-key ロックで、行とその前の隙間をまとめてロックする
      </T>
      <T x={20} y={258} fs={11.5} tone="muted">
        balance に索引が無いので、A は条件（balance &gt;= 9000）に合わない id=3 も含め、全行と隙間をロックした
      </T>
      <T x={20} y={280} fs={11.5} tone="muted">
        B の INSERT は A の COMMIT まで約 0.3 秒待った
      </T>
    </Svg>
  )
}

/* ---------- 内側で再試行したときの Rails と MySQL の状態（番号なし） ---------- */
export function NestedRetryFigure() {
  const rows = [
    { y: 60, h: 40, sql: ['0.11s BEGIN'], rails: ['外側の transaction を始める'], mysql: ['トランザクションを始める'] },
    { y: 108, h: 40, sql: ['0.11s UPDATE 口座4 +100', '0.11s UPDATE 口座2 −500'], rails: ['内側の transaction は', '外側に参加する'], mysql: ['2行の変更は未確定'] },
    { y: 156, h: 48, sql: ['0.42s UPDATE 口座1 +500', 'デッドロック（エラー 1213）'], rails: ['with_deadlock_retry が', 'Deadlocked を捕まえる'], mysql: ['トランザクション全体を取り消す', '口座4の +100 も消える'] },
    { y: 250, h: 40, sql: ['0.52s UPDATE 口座2 −500', '0.84s UPDATE 口座1 +500'], rails: ['BEGIN を送らない', '（外側のブロックは続いている）'], mysql: ['自動コミットで', '1文ずつ確定する'] },
    { y: 298, h: 40, sql: ['0.84s COMMIT'], rails: ['外側のブロックの終わりで', 'COMMIT を送る'], mysql: ['開いているトランザクションは無い'] },
  ]
  return (
    <Svg
      id="ch38-nested-retry"
      w={780}
      h={420}
      label="nested_retry.rb の B が送った SQL と、そのときの Rails と MySQL の状態。0.11 秒に BEGIN を送り、Rails は外側の transaction を、MySQL はトランザクションを始める。0.11 秒に口座4に 100 を足し、口座2から 500 を引く UPDATE を送る。内側の transaction は外側に参加し、MySQL では2行の変更が未確定になる。0.42 秒の口座1の UPDATE でデッドロックになり、MySQL はトランザクション全体を取り消し、口座4の 100 も消える。Rails では with_deadlock_retry が Deadlocked を捕まえる。0.52 秒と 0.84 秒にやり直しの2つの UPDATE を送るが、外側のブロックが続いているので Rails は BEGIN を送らず、MySQL ではトランザクションが無いので自動コミットで1文ずつ確定する。0.84 秒に外側のブロックの終わりで COMMIT を送るが、MySQL には開いているトランザクションは無い。Rails は COMMIT まで外側のブロックの中として扱い、MySQL のトランザクションはデッドロックで終わっている。最後の残高は口座4が 0、口座1が 9500、口座2が 10500。再試行を外側の transaction のブロックの外に置くと、やり直しのたびに口座4の UPDATE から実行される"
    >
      <T x={20} y={18} bold fs={12.5}>
        B が送った SQL（ログの時刻）
      </T>
      <T x={270} y={18} bold fs={12.5}>
        Rails（B のスレッド）
      </T>
      <T x={520} y={18} bold fs={12.5}>
        MySQL（B の接続）
      </T>

      <Box x={270} y={32} w={230} h={314} fill="none" lines={[]} />
      <T x={280} y={46} fs={11.5} tone="muted">
        外側の transaction のブロックの中
      </T>
      <Box x={520} y={32} w={250} h={180} fill="none" lines={[]} />
      <T x={530} y={46} fs={11.5} tone="muted">
        トランザクションの中
      </T>
      <Box x={520} y={222} w={250} h={124} fill="none" dashed lines={[]} />
      <T x={530} y={236} fs={11.5} tone="danger">
        トランザクションなし（自動コミット）
      </T>

      {rows.map((r, i) => {
        /* 3行目（デッドロック）だけ2行目を危険の色にする。2行目は fs-1 になるので 12.5 にする */
        const deadlock = i === 2
        return (
          <g key={r.y}>
            <Box x={20} y={r.y} w={230} h={r.h} lines={r.sql} mono fs={deadlock ? 12.5 : 12} fill="bg" subTone={deadlock ? 'danger' : undefined} />
            <Box x={280} y={r.y} w={210} h={r.h} lines={r.rails} fs={12} />
            <Box
              x={530}
              y={r.y}
              w={230}
              h={r.h}
              lines={r.mysql}
              fs={deadlock ? 12.5 : 12}
              fill={i === 3 ? 'box5' : 'box4'}
              subTone={deadlock ? 'danger' : undefined}
            />
          </g>
        )
      })}

      <T x={20} y={374} fs={12} tone="danger">
        最後の残高：口座4 は 0（100 が消えた）、口座1 は 9500、口座2 は 10500
      </T>
      <T x={20} y={398} fs={11.5} tone="muted">
        再試行を外側の transaction のブロックの外に置くと、やり直しのたびに口座4の UPDATE から実行される
      </T>
    </Svg>
  )
}
