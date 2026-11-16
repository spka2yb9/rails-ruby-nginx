import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation15 } from '../explanations/database'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 15-1 アプリケーションと MySQL の接続 ---------- */
function ConnectionFigure() {
  const pairs = [
    { left: 'スレッド0', id: '260', y: 64 },
    { left: 'スレッド1', id: '259', y: 114 },
    { left: 'メインのスレッド', id: '262', y: 164 },
  ]
  return (
    <Svg
      id="15-1"
      w={760}
      h={320}
      label="rails runner のプロセスの3つのスレッドが、それぞれ別の接続（260・259・262）で MySQL のサーバーにつながっている。開発サーバーの Puma も接続 11 でつながっている。MySQL のサーバーは接続ごとに専用のスレッドで SQL を処理する。接続を作って閉じる処理は1回あたり約 4.19 ms、作った接続で SELECT 1 を送る処理は約 0.27 ms だった"
    >
      <rect x={20} y={20} width={240} height={190} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={40} bold fs={12.5}>
        rails runner のプロセス
      </T>
      <rect x={500} y={20} width={240} height={260} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={512} y={40} bold fs={12.5}>
        MySQL のサーバー
      </T>
      {pairs.map((p) => (
        <g key={p.id}>
          <Box x={40} y={p.y} w={200} h={36} lines={p.left} fs={12} fill="box5" />
          <Arrow x1={242} y1={p.y + 18} x2={518} y2={p.y + 18} both />
          <T x={380} y={p.y + 8} anchor="middle" fs={11} tone="muted">
            {`接続 ${p.id}`}
          </T>
          <Box x={520} y={p.y} w={200} h={36} lines={`接続 ${p.id} を処理するスレッド`} fs={11.5} fill="box4" />
        </g>
      ))}
      <Box x={20} y={226} w={240} h={40} lines="Puma（開発サーバー）" fs={12} />
      <Arrow x1={262} y1={246} x2={518} y2={246} both />
      <T x={380} y={236} anchor="middle" fs={11} tone="muted">
        接続 11
      </T>
      <Box x={520} y={228} w={200} h={36} lines="接続 11 を処理するスレッド" fs={11.5} fill="box4" />
      <T x={20} y={300} fs={11.5} tone="muted">
        接続を作って SELECT 1 を送り閉じる：1回あたり 4.19 ms　作った接続で SELECT 1：1回あたり 0.27 ms
      </T>
    </Svg>
  )
}

/* ---------- 図 15-2 振替とトランザクション ---------- */
function TransferFigure() {
  const col = (x: number, title: string, steps: { t: string; fill: 'box' | 'box4' | 'bg' | 'box5'; danger?: boolean }[], result: string[], resultTone: 'danger' | 'acc') => (
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
      <Box x={x} y={250} w={220} h={50} lines={result} fs={12} fill="bg" subTone={resultTone} />
    </g>
  )
  return (
    <Svg
      id="15-2"
      w={760}
      h={340}
      label="トランザクションなしでは、alice の残高を 300 減らす UPDATE がすぐに確定し、2つ目の UPDATE が失敗すると、alice 700・bob 0 になって 300 が消えた。BEGIN の後で2つ目が失敗して ROLLBACK すると、1つ目も取り消され alice 1000・bob 0 に戻った。2つの UPDATE が成功して COMMIT すると、alice 700・bob 300 になった。COMMIT までの変更は、ほかの接続からは見えない"
    >
      {col(
        20,
        'トランザクションなし',
        [
          { t: 'UPDATE alice −300', fill: 'box4' },
          { t: '（すぐに確定）', fill: 'bg' },
          { t: '2つ目の UPDATE が失敗', fill: 'bg', danger: true },
        ],
        ['alice 700・bob 0', '300 が消えた'],
        'danger',
      )}
      {col(
        270,
        'BEGIN … ROLLBACK',
        [
          { t: 'BEGIN', fill: 'box' },
          { t: 'UPDATE alice −300', fill: 'box4' },
          { t: '2つ目の UPDATE が失敗', fill: 'bg', danger: true },
          { t: 'ROLLBACK', fill: 'box5' },
        ],
        ['alice 1000・bob 0', '1つ目も取り消された'],
        'acc',
      )}
      {col(
        520,
        'BEGIN … COMMIT',
        [
          { t: 'BEGIN', fill: 'box' },
          { t: 'UPDATE alice −300', fill: 'box4' },
          { t: 'UPDATE bob +300', fill: 'box4' },
          { t: 'COMMIT', fill: 'box5' },
        ],
        ['alice 700・bob 300', '2つとも確定した'],
        'acc',
      )}
      <T x={20} y={326} fs={11.5} tone="muted">
        COMMIT するまでの変更は、ほかの接続からは見えない（ほかの接続には alice 1000 が見える）
      </T>
    </Svg>
  )
}

/* ---------- 図 15-3 後の更新が前の更新を上書きする ---------- */
function LostUpdateFigure() {
  const ev = (x: number, y: number, t: string, sub: string, fill: 'box' | 'box4' | 'box5' = 'box') => (
    <Box x={x} y={y} w={200} h={40} lines={[t, sub]} fs={11.5} fill={fill} subTone="muted" />
  )
  return (
    <Svg
      id="15-3"
      w={760}
      h={300}
      label="T1 が 0.00 秒に残高 1000 を読み、T2 が 0.10 秒に同じ 1000 を読む。T1 は 0.32 秒に 1000+100 の 1100 を書き、T2 は 0.42 秒に 1000+200 の 1200 を書く。DB の残高は 1000、1100、1200 と変わり、最後は 1200 になった。両方の入金が入れば 1300 になるはずだが、T1 の 100 が消えた"
    >
      <T x={150} y={20} anchor="middle" bold>
        T1（100 を入金）
      </T>
      <T x={390} y={20} anchor="middle" bold>
        T2（200 を入金）
      </T>
      <T x={640} y={20} anchor="middle" bold>
        DB の残高
      </T>
      <line x1={150} y1={30} x2={150} y2={240} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={390} y1={30} x2={390} y2={240} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {ev(50, 40, '0.00s 残高を読む → 1000', 'SELECT')}
      {ev(290, 84, '0.10s 残高を読む → 1000', 'SELECT')}
      {ev(50, 130, '0.32s 1100 を書く', 'SET balance = 1100', 'box4')}
      {ev(290, 176, '0.42s 1200 を書く', 'SET balance = 1200', 'box4')}
      <Box x={570} y={45} w={140} h={30} lines="1000" mono fs={12} fill="bg" />
      <Box x={570} y={128} w={140} h={30} lines="1100" mono fs={12} fill="bg" />
      <Box x={570} y={186} w={140} h={30} lines="1200" mono fs={12} fill="box5" accent />
      <Arrow x1={640} y1={77} x2={640} y2={126} />
      <Arrow x1={640} y1={160} x2={640} y2={184} />
      <T x={20} y={266} fs={12} tone="danger">
        最後の残高は 1200。両方の入金が入れば 1300 のはずが、T1 の 100 が消えた
      </T>
      <T x={20} y={288} fs={11} tone="muted">
        どちらも相手が書く前の 1000 を読み、Ruby で計算した値をそのまま書いたため、後の書き込みが前の書き込みを上書きした
      </T>
    </Svg>
  )
}

/* ---------- 図 15-4 行のロックと待ち ---------- */
function RowLockFigure() {
  const x = (t: number) => 130 + t * 540
  return (
    <Svg
      id="15-4"
      w={760}
      h={270}
      label="接続 A は 0.00 秒に BEGIN して alice の行（id=1）を UPDATE し、1.03 秒に COMMIT するまでその行のロックを持つ。接続 B は 0.21 秒に同じ行を UPDATE しようとしてロックを待ち、A の COMMIT の直後の 1.04 秒に終わる。接続 C は 0.51 秒に bob の行（id=2）を UPDATE し、待たずに 0.52 秒に終わる。最後の残高は alice 1300、bob 50"
    >
      <T x={20} y={52} bold>
        接続 A
      </T>
      <T x={20} y={112} bold>
        接続 B
      </T>
      <T x={20} y={172} bold>
        接続 C
      </T>
      <rect x={x(0)} y={38} width={x(1.03) - x(0)} height={28} rx={4} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <T x={x(0) + 10} y={52} fs={11.5}>
        BEGIN・UPDATE id=1（行ロックを持つ）
      </T>
      <T x={x(1.03) + 6} y={52} fs={11.5} mono>
        COMMIT
      </T>
      <rect x={x(0.21)} y={98} width={x(1.04) - x(0.21)} height={28} rx={4} fill="none" stroke="var(--fig-line)" strokeDasharray="4 3" />
      <T x={x(0.21) + 10} y={112} fs={11.5}>
        UPDATE id=1 を送る → ロックを待つ（WAITING）
      </T>
      <T x={x(1.04) + 6} y={112} fs={11.5}>
        終わる
      </T>
      <rect x={x(0.51)} y={158} width={10} height={28} rx={2} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={x(0.51) + 16} y={172} fs={11.5}>
        UPDATE id=2（別の行なので待たない）
      </T>
      <line x1={x(0)} y1={206} x2={x(1.1)} y2={206} stroke="var(--fig-line)" />
      {[0, 0.21, 0.51, 1.03].map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={202} x2={x(t)} y2={210} stroke="var(--fig-line)" />
          <T x={x(t)} y={222} anchor="middle" fs={10.5} tone="muted" mono>
            {`${t.toFixed(2)}s`}
          </T>
        </g>
      ))}
      <T x={20} y={254} fs={11.5}>
        最後の残高：alice 1300（1000 + 100 + 200）、bob 50。B は A の COMMIT の後の値に 200 を足した
      </T>
    </Svg>
  )
}

/* ---------- 図 15-5 トランザクションのスタック ---------- */
function StackFigure() {
  return (
    <Svg
      id="15-5"
      w={760}
      h={290}
      label="接続ごとに TransactionManager があり、開いているトランザクションをスタックで管理する。一番下の RealTransaction は BEGIN と COMMIT に対応する。requires_new: true の内側のトランザクションは SavepointTransaction になり、SAVEPOINT と ROLLBACK TO SAVEPOINT に対応する。requires_new を指定しない内側の transaction は、新しいトランザクションを作らず、今のトランザクションにそのまま参加する。どちらのトランザクションも、最初の SQL を送るときまで BEGIN や SAVEPOINT を送らない"
    >
      <Box x={20} y={20} w={300} h={250} fill="bg" lines={[]} />
      <T x={32} y={40} bold fs={12.5}>
        接続の TransactionManager
      </T>
      <T x={32} y={60} fs={11.5} tone="muted">
        @stack（上が現在のトランザクション）
      </T>
      <Box x={50} y={80} w={240} h={56} lines={['SavepointTransaction', 'SAVEPOINT active_record_1']} mono fs={11.5} fill="box2" subTone="muted" />
      <Box x={50} y={146} w={240} h={56} lines={['RealTransaction', 'BEGIN … COMMIT']} mono fs={11.5} fill="box" subTone="muted" />
      <T x={50} y={232} fs={11.5}>
        SQL を送るまで BEGIN を遅らせる
      </T>
      <T x={50} y={252} fs={11.5} tone="muted">
        （空の transaction は何も送らない）
      </T>

      <Box x={380} y={20} w={360} h={110} fill="bg" lines={[]} />
      <T x={392} y={40} mono fs={11.5} bold>
        transaction do（外側）
      </T>
      <T x={406} y={64} mono fs={11.5}>
        transaction(requires_new: true) do
      </T>
      <T x={420} y={86} fs={11.5} tone="muted">
        → SavepointTransaction を積む
      </T>
      <T x={406} y={110} mono fs={11.5}>
        end
      </T>
      <Arrow x1={378} y1={86} x2={292} y2={108} dashed />

      <Box x={380} y={150} w={360} h={120} fill="bg" lines={[]} />
      <T x={392} y={170} mono fs={11.5} bold>
        transaction do（外側）
      </T>
      <T x={406} y={194} mono fs={11.5}>
        transaction do  # requires_new なし
      </T>
      <T x={420} y={216} fs={11.5} tone="muted">
        → 新しく積まずに外側に参加
      </T>
      <T x={420} y={238} fs={11.5} tone="danger">
        中で raise Rollback しても外側は COMMIT
      </T>
      <Arrow x1={378} y1={194} x2={292} y2={174} dashed />
    </Svg>
  )
}

/* ---------- 図 15-6 一貫性のある読み取り ---------- */
function SnapshotFigure() {
  return (
    <Svg
      id="15-6"
      w={760}
      h={270}
      label="REPEATABLE READ では、T1 がトランザクションの中で最初に views_count を読んだ時点のスナップショットが、そのトランザクションの終わりまで使われる。途中で T2 が views_count を 50 に更新して確定しても、T1 の2回目の読み取りは 0 のまま。T1 が COMMIT した後に読むと 50 になる。READ COMMITTED では、T1 の2回目の読み取りで T2 が確定した値 60 が見える"
    >
      <T x={110} y={20} anchor="middle" bold>
        T1
      </T>
      <T x={330} y={20} anchor="middle" bold>
        T2
      </T>
      <line x1={110} y1={30} x2={110} y2={250} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={330} y1={30} x2={330} y2={250} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <Box x={20} y={40} w={180} h={30} lines="BEGIN・読む → 0" fs={11.5} />
      <Box x={240} y={100} w={180} h={34} lines="UPDATE → 50・確定" fs={11.5} fill="box4" />
      <Box x={20} y={150} w={180} h={34} lines="もう一度読む → 0" fs={11.5} fill="box5" />
      <Box x={20} y={200} w={180} h={34} lines="COMMIT 後に読む → 50" fs={11.5} />
      <T x={20} y={262} fs={11} tone="muted">
        0.00s・0.33s・0.60s・0.61s（実測）
      </T>

      <Box x={470} y={40} w={270} h={200} fill="bg" lines={[]} />
      <T x={482} y={60} bold fs={12.5}>
        分離レベルによる違い
      </T>
      <T x={482} y={88} mono fs={11.5}>
        REPEATABLE READ（MySQL の既定）
      </T>
      <T x={496} y={110} fs={11.5}>
        2回目も最初の読み取りの時点の値
      </T>
      <T x={496} y={130} fs={11.5} tone="acc">
        → 0
      </T>
      <T x={482} y={162} mono fs={11.5}>
        READ COMMITTED
      </T>
      <T x={496} y={184} fs={11.5}>
        読むたびに確定済みの最新の値
      </T>
      <T x={496} y={204} fs={11.5} tone="acc">
        → 60（別の実行で 60 に更新）
      </T>
    </Svg>
  )
}

/* ---------- 図 15-7 ロックの範囲と索引 ---------- */
function LockRangeFigure() {
  const row = (x: number, y: number, label: string, locked: boolean, hit = false) => (
    <Box x={x} y={y} w={140} h={26} lines={label} mono fs={11} rx={0} fill={hit ? 'box5' : locked ? 'box2' : 'bg'} />
  )
  return (
    <Svg
      id="15-7"
      w={760}
      h={290}
      label="T1 が FOR UPDATE で行をロックしている間に、T2 が別の行を UPDATE した結果。title には索引が無いので、WHERE title = 記事100 の FOR UPDATE は表全体を走査し、走査したすべての行をロックする。そのため T2 の id=9000 の UPDATE は、T1 が COMMIT するまで約0.8秒待たされた。author_id には索引があるので、WHERE author_id = 13 の FOR UPDATE は索引で読んだ行だけをロックし、別の著者の行を更新する T2 は待たずに終わった"
    >
      <T x={20} y={20} bold fs={12.5}>
        WHERE title = '記事100'（索引なし）
      </T>
      {row(20, 34, 'id=1', true)}
      {row(20, 60, 'id=2', true)}
      {row(20, 86, '…（全行）', true)}
      {row(20, 112, 'id=100 ← 一致', true, true)}
      {row(20, 138, 'id=9000', true)}
      <T x={176} y={60} fs={11.5}>
        走査した行をすべてロック
      </T>
      <T x={176} y={150} fs={11.5} tone="danger">
        T2 の id=9000 の UPDATE は
      </T>
      <T x={176} y={170} fs={11.5} tone="danger">
        T1 の COMMIT まで待った（0.20s → 1.02s）
      </T>

      <T x={420} y={20} bold fs={12.5}>
        WHERE author_id = 13（索引あり）
      </T>
      {row(420, 34, 'author_id=13 の行', true, true)}
      {row(420, 60, 'author_id=13 の行', true, true)}
      {row(420, 86, '…（475件）', true, true)}
      {row(420, 112, '他の著者の行', false)}
      {row(420, 138, 'id=1（他の著者）', false)}
      <T x={576} y={60} fs={11.5}>
        索引で読んだ範囲だけロック
      </T>
      <T x={576} y={150} fs={11.5} tone="acc">
        T2 の UPDATE は待たずに終了
      </T>
      <T x={576} y={170} fs={11.5} tone="acc">
        （0.20s → 0.22s）
      </T>
      <Box x={20} y={200} w={720} h={74} fill="bg" lines={[]} />
      <Box x={32} y={210} w={22} h={16} fill="box2" rx={2} lines={[]} />
      <T x={60} y={218} fs={11.5}>
        ロックされた行
      </T>
      <Box x={176} y={210} w={22} h={16} fill="box5" rx={2} lines={[]} />
      <T x={204} y={218} fs={11.5}>
        条件に一致し、ロックされた行
      </T>
      <Box x={410} y={210} w={22} h={16} fill="bg" rx={2} lines={[]} />
      <T x={438} y={218} fs={11.5}>
        ロックされていない行（模式図）
      </T>
      <T x={32} y={244} fs={11.5} tone="muted">
        MySQL のマニュアルによると、ロックは走査した索引のレコードに付き、適した索引が無く表全体を走査すると
      </T>
      <T x={32} y={262} fs={11.5} tone="muted">
        表のすべての行がロックされる
      </T>
    </Svg>
  )
}

/* ---------- 図 15-8 スレッドと接続プール ---------- */
function PoolFigure() {
  return (
    <Svg
      id="15-8"
      w={760}
      h={250}
      label="max_connections が 2 の接続プールに対して、3つのスレッドが同時に接続を求めた結果。T1 と T2 は接続を借りて SELECT SLEEP(2) を実行した。T3 は空いた接続を checkout_timeout の1秒待ったが得られず、ConnectionTimeoutError になった。プールの状態は size 2、busy 2、waiting 1 だった。T1 と T2 は2秒後に接続を返した"
    >
      <Box x={20} y={30} w={140} h={36} lines="T1" mono fs={12} />
      <Box x={20} y={86} w={140} h={36} lines="T2" mono fs={12} />
      <Box x={20} y={142} w={140} h={36} lines="T3" mono fs={12} fill="bg" />
      <Box x={300} y={20} w={200} h={170} fill="bg" lines={[]} />
      <T x={312} y={40} bold fs={12} mono>
        ConnectionPool
      </T>
      <T x={312} y={58} fs={11} tone="muted" mono>
        max_connections: 2
      </T>
      <Box x={320} y={70} w={160} h={34} lines="接続 1（busy）" fs={11.5} fill="box4" />
      <Box x={320} y={114} w={160} h={34} lines="接続 2（busy）" fs={11.5} fill="box4" />
      <T x={312} y={172} fs={11} tone="muted" mono>
        waiting: 1
      </T>
      <Arrow x1={160} y1={48} x2={318} y2={86} />
      <Arrow x1={160} y1={104} x2={318} y2={130} />
      <Arrow x1={160} y1={160} x2={298} y2={168} dashed />
      <T x={170} y={186} fs={11} tone="danger">
        1秒待って
      </T>
      <Box x={540} y={70} w={200} h={78} lines={['MySQL', '（接続ごとに1つの', 'サーバー側スレッド）']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={482} y1={87} x2={538} y2={100} />
      <Arrow x1={482} y1={131} x2={538} y2={118} />
      <Box x={20} y={204} w={720} h={36} lines="T3: ActiveRecord::ConnectionTimeoutError: could not obtain a connection from the pool within 1.000 seconds" mono fs={11} fill="bg" subTone="danger" />
    </Svg>
  )
}

const ch15: Chapter = {
  number: 15,
  part: 3,
  title: 'トランザクション・ロック・接続プール',
  summary:
    'アプリケーションと MySQL の接続、BEGIN・COMMIT・ROLLBACK によるトランザクション、同時の更新で起きる更新の消失、行のロックによる待ちを、MySQL と Rails で確かめます。続いて、ActiveRecord のトランザクションの入れ子と SAVEPOINT、MySQL の分離レベル、楽観的ロックと悲観的ロック、ロックの範囲と索引、ロック待ちとデッドロック、接続プールの貸し出しを、2つのスレッドを使った実測とともに説明します。',
  goals: [
    'アプリケーションが MySQL に接続してから SQL を送ることと、接続を使い回す理由を説明できる',
    'トランザクションが複数の変更をまとめて確定・取り消しすることと、COMMIT 前の変更がほかの接続から見えないことを説明できる',
    '同時の更新で先の更新が失われる理由と、行のロックがほかの更新を COMMIT まで待たせることを説明できる',
    'TransactionManager がトランザクションを積む仕組みと、BEGIN を遅らせる理由を説明できる',
    '入れ子の transaction で内側だけを取り消すには requires_new が必要なことを説明できる',
    'InnoDB の REPEATABLE READ と READ COMMITTED の読み取りの違いを説明できる',
    '楽観的ロック（lock_version）と悲観的ロック（FOR UPDATE）の動作と使い分けを説明できる',
    'ロックの範囲が索引によって変わることと、ロック待ちのタイムアウト・デッドロックの扱いを説明できる',
    '接続プールの max_connections と checkout_timeout の意味と、接続が足りないときの挙動を説明できる',
  ],
  prerequisites: [8, 14],
  sections: [
    {
      id: 'db-connection',
      title: 'データベースとの接続',
      body: (
        <>
          <p>
            Rails のアプリケーションと MySQL は別々のプログラムです。デモでは、MySQL は Rails とは別のコンテナ（rbdemo-mysql）で動いています。SQL を送るには、まずアプリケーションが MySQL
            のサーバーにネットワークでつなぎ、ユーザー名とパスワードで認証を受けます。その後は、このつながりを通して SQL を送り、結果を受け取ります。このつながりを<Term en="connection">接続</Term>
            と呼びます。デモの Rails は mysql2 という gem（MySQL と通信するライブラリ）で接続を作ります。
          </p>
          <p>
            MySQL は接続ごとに番号を付け、接続ごとに専用のスレッドで認証と SQL の処理を行います
            <Ref n={12} />。デモで、2つのスレッドがそれぞれ接続を借りて待っている間に、メインのスレッドから MySQL の PROCESSLIST（MySQL が受け付けている接続の一覧）を読みました。
            <code>CONNECTION_ID()</code> は今使っている接続の番号を返す MySQL の関数です。
          </p>
          <Code
            lang="ruby"
            title="conn.rb（bin/rails runner で実行。PROCESSLIST を表示する部分は省略）"
            code={`
threads = 2.times.map do |i|
  Thread.new do
    ActiveRecord::Base.with_connection do |c|
      puts "スレッド#{i}: CONNECTION_ID() = #{c.select_value("SELECT CONNECTION_ID()")}"
      sleep 1.5
    end
  end
end
sleep 0.5
ActiveRecord::Base.with_connection do |c|
  puts "メインのスレッド: CONNECTION_ID() = #{c.select_value("SELECT CONNECTION_ID()")}"
  # information_schema.PROCESSLIST から、このコンテナ（172.29.0.4）からの接続を表示する
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4.13。最後の行の SQL は一部を省略）"
            code={`
スレッド1: CONNECTION_ID() = 259
スレッド0: CONNECTION_ID() = 260
メインのスレッド: CONNECTION_ID() = 262
MySQL の PROCESSLIST（このコンテナからの接続）:
  11 | 172.29.0.4:47660 | demo_development | Sleep | 
  259 | 172.29.0.4:56514 | demo_development | Sleep | 
  260 | 172.29.0.4:56516 | demo_development | Sleep | 
  262 | 172.29.0.4:56524 | demo_development | Query | SELECT ID, HOST, DB, COMMAND, INFO FROM information_schema.PROCESSLIST ...
`}
          />
          <p>
            PROCESSLIST の各行は左から接続の番号、接続元のアドレスとポート、データベース、状態、実行中の SQL です。2つのスレッドとメインのスレッドは、それぞれ別の接続（259・260・262）を使っていました。11 は同じコンテナで動いている開発サーバー（Puma）の接続です。COMMAND が Sleep
            の接続は、つながったまま次の SQL を待っています（図 15-1）。<code>with_connection</code> はブロックの間だけ接続を借りるメソッドで、「接続プール」の節で詳しく扱います。
          </p>
          <p>
            接続を作るには時間がかかります。mysql2 で、接続を作って <code>SELECT 1</code> を送ってから閉じる処理と、作っておいた接続で <code>SELECT 1</code> を送る処理を、200
            回ずつ実行して比べました。
          </p>
          <Code
            lang="text"
            title="conntime.rb の実行結果（デモの Rails のコンテナから MySQL のコンテナへ接続）"
            code={`
接続を作って SELECT 1 を送り、閉じる: 1回あたり 4.19 ms
作った接続で SELECT 1 を送る:         1回あたり 0.27 ms
`}
          />
          <p>
            接続を作る処理は、SQL を1つ送る処理の約15倍の時間がかかりました。そのため Rails は作った接続を閉じずに残しておき、後の SQL でも使います。この仕組みが接続プールです。
          </p>
          <p>
            接続には、その接続だけの状態があります。次の節で見るトランザクションも接続ごとにあり、ある接続で始めたトランザクションに、別の接続から送った SQL は入りません。上の例のように、Rails
            では同時に動くスレッドがそれぞれ別の接続を使うので、あるスレッドのトランザクションに、別のスレッドの SQL が入ることはありません。
          </p>
          <Figure n="15-1" title="アプリケーションと MySQL の接続" caption="上の2つの実行結果をもとにした図。">
            <ConnectionFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'transaction-basics',
      title: 'トランザクションで変更をまとめる',
      body: (
        <>
          <p>
            銀行の口座から別の口座へお金を移す振替は、送金元の残高を減らす UPDATE と、送金先の残高を増やす UPDATE の2つの変更でできています。1つ目の後で2つ目が失敗すると、減らしたお金がどこにも無くなります。デモの
            MySQL に別のデータベース ch15_demo を作り、口座を表す accounts テーブル（id・name・balance）に alice（残高 1000）と bob（残高 0）を入れて試しました。2つ目の UPDATE
            はテーブルの名前をわざと書き間違えて失敗させています。
          </p>
          <Code
            lang="text"
            title="トランザクションなし（MySQL 8.4.13）"
            code={`
UPDATE accounts SET balance = balance - 300 WHERE id = 1;
Query OK, 1 row affected
UPDATE acounts SET balance = balance + 300 WHERE id = 2;
ERROR 1146 (42S02) at line 5: Table 'ch15_demo.acounts' doesn't exist
SELECT id, name, balance FROM accounts;
+----+-------+---------+
| id | name  | balance |
+----+-------+---------+
|  1 | alice |     700 |
|  2 | bob   |       0 |
+----+-------+---------+
`}
          />
          <p>
            alice の残高は 700 に減ったのに、bob は 0 のままで、300 が消えました。MySQL は何も指定しなければ、SQL の文を1つ実行するたびにその変更をすぐに確定します（autocommit）
            <Ref n={13} />。1つ目の UPDATE は、2つ目が失敗する前に確定していました。
          </p>
          <p>
            複数の変更を1つのまとまりとして扱うのが<Term en="transaction">トランザクション</Term>です。BEGIN でトランザクションを始めると、その後の変更は COMMIT を送るまで確定しません。COMMIT
            はまとまりの中の変更をすべて確定し、ROLLBACK はすべて取り消します
            <Ref n={13} />。残高を 1000 と 0 に戻してから、同じ失敗を BEGIN と ROLLBACK で囲み、続けて成功する振替を COMMIT しました。
          </p>
          <Code
            lang="text"
            title="BEGIN・ROLLBACK と BEGIN・COMMIT（MySQL 8.4.13。表の枠線は一部を省略）"
            code={`
BEGIN;
UPDATE accounts SET balance = balance - 300 WHERE id = 1;
Query OK, 1 row affected
SELECT id, name, balance FROM accounts;
|  1 | alice |     700 |
|  2 | bob   |       0 |
UPDATE acounts SET balance = balance + 300 WHERE id = 2;
ERROR 1146 (42S02) at line 6: Table 'ch15_demo.acounts' doesn't exist
ROLLBACK;
SELECT id, name, balance FROM accounts;
|  1 | alice |    1000 |
|  2 | bob   |       0 |

BEGIN;
UPDATE accounts SET balance = balance - 300 WHERE id = 1;
UPDATE accounts SET balance = balance + 300 WHERE id = 2;
COMMIT;
SELECT id, name, balance FROM accounts;
|  1 | alice |     700 |
|  2 | bob   |     300 |
`}
          />
          <p>
            トランザクションの中の SELECT では、自分の UPDATE の結果（700）が見えています。2つ目の UPDATE が失敗した後に ROLLBACK を送ると、1つ目の UPDATE も取り消され、残高は 1000 と 0
            に戻りました。2つの UPDATE が両方成功してから COMMIT すると、両方の変更が確定しました（図 15-2）。
          </p>
          <p>COMMIT するまでの変更はほかの接続からは見えません。mysql2 で2つの接続 A・B を作り、A のトランザクションの途中で B から読みました。</p>
          <Code
            lang="text"
            title="visible.rb の実行結果（alice の残高を 1000 に戻してから実行。時刻は省略）"
            code={`
接続A  BEGIN
接続A  UPDATE accounts SET balance = balance - 300 WHERE id = 1
接続A  SELECT balance FROM accounts WHERE id = 1 → 700
接続B  SELECT balance FROM accounts WHERE id = 1 → 1000
接続A  COMMIT
接続B  SELECT balance FROM accounts WHERE id = 1 → 700
`}
          />
          <p>
            A が UPDATE した後でも B には変更前の 1000 が見え、A が COMMIT した後には 700 が見えました
            <Ref n={14} />。alice だけが減って bob が増えていない途中の状態を、ほかの接続が読むことはありません。
          </p>
          <Figure n="15-2" title="振替とトランザクション" caption="上の MySQL での実行結果をまとめた図。">
            <TransferFigure />
          </Figure>
          <p>
            Rails では <code>transaction</code> のブロックでトランザクションの範囲を決めます。ch15_demo の accounts テーブルを使う Account モデルを用意し、ブロックの中で2つの口座を{' '}
            <code>update!</code> しました。
          </p>
          <Code
            lang="ruby"
            title="デモでの実行結果（alice は 1000、bob は 0 から始めた。ログは一部を省略）"
            code={`
Account.transaction do
  alice.update!(balance: alice.balance - 300)
  bob.update!(balance: bob.balance + 300)
end
#   BEGIN
#   UPDATE \`accounts\` SET \`accounts\`.\`balance\` = 700 WHERE \`accounts\`.\`id\` = 1
#   UPDATE \`accounts\` SET \`accounts\`.\`balance\` = 300 WHERE \`accounts\`.\`id\` = 2
#   COMMIT

Account.transaction do
  alice.update!(balance: alice.balance - 300)
  raise "送金先の処理で失敗"
  bob.update!(balance: bob.balance + 300)
end
#   BEGIN
#   UPDATE \`accounts\` SET \`accounts\`.\`balance\` = 400 WHERE \`accounts\`.\`id\` = 1
#   ROLLBACK
# => RuntimeError: 送金先の処理で失敗

Account.order(:id).pluck(:name, :balance)   # => [["alice", 700], ["bob", 300]]
alice.balance                                # => 400（Ruby のオブジェクトの値）
`}
          />
          <p>
            ブロックが最後まで進むと COMMIT が送られ、ブロックの中で例外が起きると ROLLBACK が送られました。例外はブロックの外へそのまま伝わります
            <Ref n={17} />。取り消されるのはデータベースの変更だけで、Ruby のオブジェクトの <code>alice.balance</code> は、UPDATE のときに代入した 400 のままでした。
          </p>
        </>
      ),
    },
    {
      id: 'lost-update',
      title: '同時に更新すると起きること',
      body: (
        <>
          <p>
            Web アプリケーションは複数の要求を同時に処理します。Puma は1つのプロセスの中の複数のスレッドで要求を処理し、プロセスを複数動かすこともあります（<ChapterLink n={23} section="app-server" />
            ）。同じ口座への2つの入金がほぼ同時に届いた場合を、2つのスレッドで再現しました。deposit は口座を読み、残高に入金額を足して保存するメソッドです。<code>sleep 0.3</code>{' '}
            はその間にほかの処理をしている時間の代わりです。
          </p>
          <Code
            lang="ruby"
            title="lost.rb（bin/rails runner で実行。時刻と SQL を出す部分は省略）"
            code={`
def deposit(name, amount)
  account = Account.find(1)
  sleep 0.3 # 画面の表示や別の処理をしている間
  account.update!(balance: account.balance + amount)
end

t1 = Thread.new { deposit("T1", 100) }
t2 = Thread.new { sleep 0.1; deposit("T2", 200) }
[t1, t2].each(&:join)
`}
          />
          <Code
            lang="text"
            title="実行結果（alice の残高を 1000 にしてから実行）"
            code={`
 0.00s T1   SQL: SELECT \`accounts\`.* FROM \`accounts\` WHERE \`accounts\`.\`id\` = 1 LIMIT 1
 0.01s T1 残高を読む → 1000
 0.10s T2   SQL: SELECT \`accounts\`.* FROM \`accounts\` WHERE \`accounts\`.\`id\` = 1 LIMIT 1
 0.11s T2 残高を読む → 1000
 0.32s T1   SQL: UPDATE \`accounts\` SET \`accounts\`.\`balance\` = 1100 WHERE \`accounts\`.\`id\` = 1
 0.34s T1 1000 + 100 = 1100 を保存
 0.42s T2   SQL: UPDATE \`accounts\` SET \`accounts\`.\`balance\` = 1200 WHERE \`accounts\`.\`id\` = 1
 0.44s T2 1000 + 200 = 1200 を保存
 0.45s 最後の残高: 1200
`}
          />
          <p>
            T1 も T2 も、相手が保存する前に残高 1000 を読みました。Rails の UPDATE は Ruby で計算した値（1100、1200）をそのまま書き込みます。そのため、後から書いた T2 の 1200 が先に書いた T1
            の 1100 を上書きし、T1 の入金の 100 が消えました（図 15-3）。同じ行を読んで書き戻す処理が重なり、先の更新が失われるこの現象を、更新の消失（lost update）と呼びます。
          </p>
          <p>
            deposit の中身を <code>Account.transaction</code> で囲んで同じ実験をしても、最後の残高は 1200 でした。トランザクションは自分の変更をまとめるもので、ほかの接続が同じ行を読むことは止めません。MySQL
            の通常の SELECT は読んだ行にロック（次の節で扱います）を掛けないので、ほかの接続も同じ行を同時に読んだり更新したりできます
            <Ref n={14} />。
          </p>
          <Figure n="15-3" title="後の更新が前の更新を上書きする" caption="上の実行結果を図にしたもの。">
            <LostUpdateFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'lock-basics',
      title: 'ロックで更新の順番を待たせる',
      body: (
        <>
          <p>
            同じものを同時に変更すると困るときに使うのが<Term en="lock">ロック</Term>です。ロックを持っている処理だけがその対象を変更でき、ほかの処理はロックが手放されるまで待ちます。MySQL
            の標準のストレージエンジン（テーブルのデータを保存して読み書きする部分）である InnoDB は、行の単位でロックを掛けます。UPDATE は変更する行に排他ロック（ほかのトランザクションが同じ行のロックを取れないロック）を掛け、トランザクションが持つロックは
            COMMIT か ROLLBACK のときに手放されます
            <Ref n={15} />
            <Ref n={7} />。
          </p>
          <p>
            mysql2 で4つの接続を作りました。接続 A は BEGIN の後に alice の行（id=1）を UPDATE し、COMMIT せずに約1秒待ちます。その間に、接続 B が同じ行を、接続 C が bob
            の行（id=2）を UPDATE しました。途中で、MySQL がロックの状態を見せる performance_schema.data_locks を、4つ目の接続から2回読んでいます
            <Ref n={16} />。
          </p>
          <Code
            lang="text"
            title="lock.rb の実行結果（alice は 1000、bob は 0 から始めた。data_locks は行のロックだけを表示）"
            code={`
 0.00s 接続A  BEGIN を送る
 0.00s 接続A  終わり
 0.00s 接続A  UPDATE accounts SET balance = balance + 100 WHERE id = 1 を送る
 0.00s 接続A  終わり
      （data_locks）
        接続A | accounts | PRIMARY | 1 | X,REC_NOT_GAP | GRANTED
 0.21s 接続B  UPDATE accounts SET balance = balance + 200 WHERE id = 1 を送る
      （data_locks）
        接続A | accounts | PRIMARY | 1 | X,REC_NOT_GAP | GRANTED
        接続B | accounts | PRIMARY | 1 | X,REC_NOT_GAP | WAITING
 0.51s 接続C  UPDATE accounts SET balance = balance + 50 WHERE id = 2 を送る
 0.52s 接続C  終わり
 1.02s 接続A  COMMIT を送る
 1.03s 接続A  終わり
 1.04s 接続B  終わり
 1.04s 残高: alice 1300, bob 50
`}
          />
          <p>
            data_locks の各行は左からロックを持つ（または待つ）接続、テーブル、索引、行の主キーの値、ロックの種類、状態です。1回目には、A が主キー（PRIMARY）の値が 1 の行に排他ロック（X）を持っている（GRANTED）ことが出ています。2回目には、B
            が同じ行のロックを待っている（WAITING）ことが出ています。B の UPDATE は 0.21 秒に送られ、A が COMMIT した直後の 1.04 秒に終わりました。別の行を更新した C は待ちませんでした（図 15-4）。
          </p>
          <p>
            B の UPDATE は <code>balance = balance + 200</code> なので、A が COMMIT した後の値（1100）に 200 を足しました。最後の残高は 1300 で、前の節のような更新の消失は起きていません。Rails でも{' '}
            <code>Account.where(id: 1).update_all("balance = balance + 200")</code> と書けば、<code>UPDATE `accounts` SET balance = balance + 200 WHERE `accounts`.`id` = 1</code>{' '}
            が送られます（検証とコールバックは通りません。<ChapterLink n={14} section="skip" />
            ）。
          </p>
          <Figure n="15-4" title="行のロックと待ち" caption="上の実行結果を図にしたもの。横軸は経過時間。">
            <RowLockFigure />
          </Figure>
          <p>
            前の節の deposit のように、読んでから Ruby で計算して書き戻す処理には、Rails の2つの方法を使います。楽観的ロックは保存するときに、読んだ後でほかの更新が無かったかを確かめ、あれば例外にする方法です。悲観的ロックは読む時点で{' '}
            <code>SELECT ... FOR UPDATE</code> を使って行にロックを掛け、ほかのトランザクションを待たせる方法です。どちらもこの章の後の節で扱います。ロックを持つ時間が長いほど、ほかの処理の待ち時間も延びます。2つのトランザクションが互いに相手のロックを待つと、どちらも進めなくなります。これをデッドロックと呼び、「ロック待ちのタイムアウトとデッドロック」の節で扱います。
          </p>
          <p>
            ロックは COMMIT か ROLLBACK まで持ち続けるので、トランザクションをどこで始めてどこで終えるかが、ほかの処理の待ち時間に関わります。Rails でこの範囲を決めるのが{' '}
            <code>ActiveRecord::Base.transaction</code> です。次の節では、このメソッドが接続に BEGIN を送る仕組みから見ていきます。
          </p>
        </>
      ),
    },
    {
      id: 'transaction',
      title: 'トランザクションの開始と終了',
      body: (
        <>
          <p>
            <code>ActiveRecord::Base.transaction</code> は、接続の <code>transaction</code> を呼びます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb（372〜382行目）"
            href={`${GH}/activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb#L355-L382`}
            code={`
        if !requires_new && current_transaction.joinable?
          if isolation && current_transaction.isolation != isolation
            raise ActiveRecord::TransactionIsolationError, "cannot set isolation when joining a transaction"
          end
          yield current_transaction.user_transaction
        else
          within_new_transaction(isolation: isolation, joinable: joinable, &block)
        end
      rescue ActiveRecord::Rollback
        # rollbacks are silently swallowed
      end
`}
          />
          <p>
            すでにトランザクションが開いていて、<code>requires_new</code> を指定していなければ、新しいトランザクションを作らずに今のトランザクションに参加します。そうでなければ{' '}
            <code>within_new_transaction</code> で新しいトランザクションを始めます。ブロックの中で <code>ActiveRecord::Rollback</code> が投げられると、ここで捕捉され、呼び出し元には伝わりません
            <Ref n={1} />。
          </p>
          <p>
            トランザクションは、接続ごとの <code>TransactionManager</code> がスタックで管理しています。スタックが空なら <code>RealTransaction</code>（BEGIN と COMMIT）、すでに積まれていれば{' '}
            <code>SavepointTransaction</code>（SAVEPOINT）を積みます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/connection_adapters/abstract/transaction.rb（527〜566行目、一部省略）"
            href={`${GH}/activerecord/lib/active_record/connection_adapters/abstract/transaction.rb#L527-L566`}
            code={`
      def begin_transaction(isolation: nil, joinable: true, _lazy: true)
        @connection.lock.synchronize do
          run_commit_callbacks = !current_transaction.joinable?
          transaction =
            if @stack.empty?
              RealTransaction.new(
                @connection,
                isolation: isolation,
                joinable: joinable,
                run_commit_callbacks: run_commit_callbacks
              )
            # （RestartParentTransaction の分岐は省略）
            else
              SavepointTransaction.new(
                @connection,
                "active_record_#{@stack.size}",
                current_transaction,
                isolation: isolation,
                joinable: joinable,
                run_commit_callbacks: run_commit_callbacks
              )
            end

          unless transaction.materialized?
            if @connection.supports_lazy_transactions? && lazy_transactions_enabled? && _lazy
              @has_unmaterialized_transactions = true
            else
              transaction.materialize!
            end
          end
          @stack.push(transaction)
          transaction
        end
      end
`}
          />
          <p>
            トランザクションのオブジェクトを作っても、すぐには BEGIN を送りません（<code>materialize!</code> を遅らせる）。最初の SQL を送るときに、まだ送っていない BEGIN や SAVEPOINT
            を先に送ります
            <Ref n={2} />。デモで中身の無い <code>ActiveRecord::Base.transaction {'{ }'}</code> を実行すると、SQL は1つも送られませんでした。<ChapterLink n={14} />で、BEGIN が INSERT
            の直前に送られていたのはこのためです。
          </p>
          <Figure n="15-5" title="トランザクションのスタック" caption="Rails 8.1.4.1 の transaction.rb・database_statements.rb を読んでまとめた模式図。">
            <StackFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'nested',
      title: '入れ子のトランザクション',
      body: (
        <>
          <p>内側の transaction で <code>ActiveRecord::Rollback</code> を投げたとき、<code>requires_new</code> の有無で結果が変わります。</p>
          <Code
            lang="text"
            code={`
--- requires_new なし
ActiveRecord::Base.transaction do
  Article.find(1).update!(views_count: 111)
  ActiveRecord::Base.transaction { Article.find(2).update!(views_count: 222); raise ActiveRecord::Rollback }
end
  BEGIN
  SELECT ... WHERE id = 1 LIMIT 1
  UPDATE ... views_count = 111 ...
  SELECT ... WHERE id = 2 LIMIT 1
  UPDATE ... views_count = 222 ...
  COMMIT
結果: [[1, 111], [2, 222]]   # 内側も確定した

--- requires_new: true
  BEGIN
  SELECT ... WHERE id = 1 LIMIT 1
  UPDATE ... views_count = 333 ...
  SAVEPOINT active_record_1
  SELECT ... WHERE id = 2 LIMIT 1
  UPDATE ... views_count = 444 ...
  ROLLBACK TO SAVEPOINT active_record_1
  COMMIT
結果: [[1, 333], [2, 222]]   # 内側だけ取り消された
`}
          />
          <p>
            <code>requires_new</code> を付けない内側の transaction は外側に参加しているだけなので、内側の <code>ActiveRecord::Rollback</code>{' '}
            は内側で捕捉され、何も取り消されずに外側が COMMIT しました。内側だけを取り消したい場合は <code>requires_new: true</code> を付け、SAVEPOINT を使います。
            <code>ActiveRecord::Rollback</code> 以外の例外はブロックの外まで伝わり、外側のトランザクション全体がロールバックされます
            <Ref n={1} />。
          </p>
        </>
      ),
    },
    {
      id: 'isolation',
      title: '分離レベルと一貫性のある読み取り',
      body: (
        <>
          <p>
            InnoDB の既定の分離レベルは REPEATABLE READ で、同じトランザクションの中の通常の SELECT（ロックしない読み取り）は、最初の読み取りで作られたスナップショットを読みます
            <Ref n={3} />。デモの MySQL でも <code>@@transaction_isolation</code> は <code>REPEATABLE-READ</code> でした。2つのスレッドで確かめました。
          </p>
          <Code
            lang="text"
            code={`
 0.00s T1  BEGIN
 0.00s T1  SELECT ... WHERE id = 3 LIMIT 1        → views_count=0
 0.30s T2  SELECT ... WHERE id = 3 LIMIT 1
 0.33s T2  UPDATE ... SET views_count = 50 ...    （T2 は確定）
 0.60s T1  SELECT ... WHERE id = 3 LIMIT 1        → views_count=0
 0.61s T1  COMMIT
 0.61s T1  SELECT ... WHERE id = 3 LIMIT 1        → views_count=50
`}
          />
          <p>
            T1 のトランザクションの中の2回目の読み取りは、T2 が確定した後でも 0 のままでした（同じ SELECT がクエリキャッシュ（同じ SELECT の結果を Rails が覚えておき、SQL を送らずに返す仕組み。<ChapterLink n={12} section="query-cache" />）から返らないよう、<code>uncached</code>{' '}
            で囲んでいます）。トランザクションの分離レベルは <code>transaction(isolation: :read_committed)</code> のように指定できます。
          </p>
          <Code
            lang="text"
            code={`
 0.00s T1  SET TRANSACTION ISOLATION LEVEL READ COMMITTED
 0.00s T1  BEGIN
 0.01s T1  SELECT ... WHERE id = 3 LIMIT 1        → views_count=0
 0.32s T2  UPDATE ... SET views_count = 60 ...    （T2 は確定）
 0.61s T1  SELECT ... WHERE id = 3 LIMIT 1        → views_count=60
 0.61s T1  COMMIT
`}
          />
          <p>
            Rails は BEGIN の前に <code>SET TRANSACTION ISOLATION LEVEL</code> を送り（RealTransaction の <code>materialize!</code> が <code>begin_isolated_db_transaction</code>{' '}
            を呼ぶ）、READ COMMITTED では2回目の読み取りで確定済みの値が見えました。分離レベルは入れ子のトランザクション（SAVEPOINT）や、すでに開いているトランザクションに参加するときには指定できません
            <Ref n={2} />。
          </p>
          <Figure n="15-6" title="一貫性のある読み取り" caption="上の実行結果を図にしたもの（MySQL 8.4.13）。">
            <SnapshotFigure />
          </Figure>
          <Callout kind="warn">
            <p>
              REPEATABLE READ のスナップショットが使われるのは、ロックしない読み取りだけです。「残高を読んで、計算して、UPDATE する」処理をトランザクションで囲んでも、読んだ値が他のトランザクションに書き換えられることは防げません。その場合は、次に説明するロックを使います。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'optimistic',
      title: '楽観的ロック',
      body: (
        <>
          <p>
            <Term en="optimistic locking">楽観的ロック</Term>は、更新が衝突することはまれだと考え、衝突したときだけ検出する方法です。テーブルに <code>lock_version</code>{' '}
            という整数の列があると、ActiveRecord は自動で有効にします。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/locking/optimistic.rb（92〜122行目、一部省略）"
            href={`${GH}/activerecord/lib/active_record/locking/optimistic.rb#L92-L122`}
            code={`
        def _update_row(attribute_names, attempted_action = "update")
          return super unless locking_enabled?

          begin
            locking_column = self.class.locking_column
            lock_attribute_was = @attributes[locking_column]

            update_constraints = _query_constraints_hash

            attribute_names = attribute_names.dup if attribute_names.frozen?
            attribute_names << locking_column

            # （lock_version が nil の場合のエラーは省略）

            self[locking_column] += 1

            affected_rows = self.class._update_record(
              attributes_with_values(attribute_names),
              update_constraints
            )

            if affected_rows != 1
              raise ActiveRecord::StaleObjectError.new(self, attempted_action)
            end

            affected_rows
`}
          />
          <p>
            UPDATE の WHERE に読み込んだときの <code>lock_version</code> を入れ、値を1増やします。他の誰かが先に更新していれば WHERE に一致する行が無く、変更された行数が 0
            になるので <code>StaleObjectError</code> を投げます
            <Ref n={4} />。同じ記事を2つのオブジェクトに読み込んで、順に更新しました。
          </p>
          <Code
            lang="text"
            code={`
a1 = Article.find(4); a2 = Article.find(4)       # どちらも lock_version = 2
a1.update!(title: "A さんの変更")
  BEGIN
  UPDATE ... SET title = 'A さんの変更', ..., lock_version = 3 WHERE id = 4 AND lock_version = 2
  COMMIT
a2.update!(title: "B さんの変更")
  BEGIN
  UPDATE ... SET title = 'B さんの変更', ..., lock_version = 3 WHERE id = 4 AND lock_version = 2
  ROLLBACK
  => ActiveRecord::StaleObjectError: Attempted to update a stale object: Article.
`}
          />
          <p>
            フォームを開いてから保存するまでの間に他の人が更新した場合を検出できます。フォームに <code>lock_version</code> を隠し項目（画面には表示せずに、フォームと一緒に送る値）として入れて送り返すと、画面を開いた時点の値で比べられます。
            <code>StaleObjectError</code> を rescue して、最新の内容を読み直すよう利用者に伝えるのが一般的です。
          </p>
        </>
      ),
    },
    {
      id: 'pessimistic',
      title: '悲観的ロック',
      body: (
        <>
          <p>
            <Term en="pessimistic locking">悲観的ロック</Term>は、読む時点で行をロックし、他のトランザクションの更新を待たせる方法です。<code>Article.lock.find(5)</code> は{' '}
            <code>SELECT ... FOR UPDATE</code> を実行します。MySQL のマニュアルによると、FOR UPDATE はその行に UPDATE と同じロックを掛け、ロックはトランザクションの COMMIT
            かロールバックで解放されます
            <Ref n={5} />。
          </p>
          <Code
            lang="text"
            code={`
 0.00s T1  BEGIN
 0.00s T1  SELECT ... WHERE id = 5 LIMIT 1 FOR UPDATE   （ロックを取得）
 0.20s T2  BEGIN、同じ行の SELECT ... FOR UPDATE を送る  （待つ）
 1.01s T1  UPDATE ... ／ COMMIT
 1.01s T2  SELECT ... FOR UPDATE が終わる                （ロックを取得）
`}
          />
          <p>
            T2 は 0.20 秒に要求し、T1 が COMMIT した 1.01 秒まで待ちました。レコードを読み込んだ後でロックするには <code>with_lock</code> を使います。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/locking/pessimistic.rb（97〜104行目）"
            href={`${GH}/activerecord/lib/active_record/locking/pessimistic.rb#L97-L104`}
            code={`
      def with_lock(*args)
        transaction_opts = args.extract_options!
        lock = args.present? ? args.first : true
        transaction(**transaction_opts) do
          lock!(lock)
          yield
        end
      end
`}
          />
          <p>
            <code>with_lock</code> はトランザクションを開始し、<code>lock!</code> で <code>reload(lock: true)</code>、つまり FOR UPDATE 付きで読み直してからブロックを実行します（同じファイルの
            69〜88 行目）。読み直すので、ブロックの中では最新の値を使えます。保存していない変更があるレコードで <code>lock!</code> を呼ぶと例外になります
            <Ref n={6} />。
          </p>
          <p>
            <code>lock</code> には SQL の文字列も渡せます。MySQL 8.4 の <code>FOR UPDATE NOWAIT</code> はロックを待たずにすぐ失敗し、<code>FOR UPDATE SKIP LOCKED</code>{' '}
            はロックされている行を結果から除きます
            <Ref n={5} />。T1 が id=6 をロックしている間に、T2 で試した結果は次のとおりです。
          </p>
          <Code
            lang="text"
            code={`
Article.lock("FOR UPDATE NOWAIT").find(6)
  => ActiveRecord::StatementInvalid: Mysql2::Error: Statement aborted because lock(s) could not be
     acquired immediately and NOWAIT is set
Article.where(id: 6..8).lock("FOR UPDATE SKIP LOCKED").pluck(:id)
  => [7, 8]
`}
          />
          <p>
            SKIP LOCKED は、複数のワーカー（処理待ちの仕事を取り出して実行するプロセスやスレッド）が処理待ちの行を重ならないように取り出す処理に使えます。
          </p>
        </>
      ),
    },
    {
      id: 'lock-index',
      title: 'ロックの範囲と索引',
      body: (
        <>
          <p>
            InnoDB の FOR UPDATE や UPDATE は、条件に一致した行だけでなく、検索の途中で走査した索引のレコードにロックを掛けます。適した索引が無く表全体を走査すると、表のすべての行がロックされます
            <Ref n={7} />。T1 が FOR UPDATE を実行している間に、T2 が別の行を UPDATE して確かめました。
          </p>
          <Code
            lang="text"
            code={`
--- 索引の無い列（title）で FOR UPDATE
 0.01s T1  Article.where(title: "記事100").lock.to_a   （1件）
 0.20s T2  別の行 id=9000 を UPDATE
 1.01s T1  COMMIT
 1.02s T2  UPDATE 完了                                  （T1 の COMMIT まで待った）
--- 索引のある列（author_id）で FOR UPDATE
 0.01s T1  Article.where(author_id: 13).lock.to_a      （475件）
 0.20s T2  別の著者の行 id=1 を UPDATE
 0.22s T2  UPDATE 完了                                  （待たなかった）
 1.01s T1  COMMIT
`}
          />
          <Figure n="15-7" title="ロックの範囲と索引" caption="上の実行結果を図にしたもの。ロックの種類（レコードロック、ギャップロック、ネクストキーロック）の区別は省略している。">
            <LockRangeFigure />
          </Figure>
          <p>
            一致したのは1件なのに、索引が無いために全行がロックされ、無関係な行の UPDATE が待たされました。悲観的ロックや、条件付きの <code>update_all</code>・<code>delete_all</code>{' '}
            を使う問い合わせは、<ChapterLink n={12} />の EXPLAIN で索引が使われることを確かめておきます。
          </p>
        </>
      ),
    },
    {
      id: 'timeout-deadlock',
      title: 'ロック待ちのタイムアウトとデッドロック',
      body: (
        <>
          <p>
            ロックを待つ時間の上限は <code>innodb_lock_wait_timeout</code> で、既定は 50 秒です。超えると、待っていた文がロールバックされてエラーになります
            <Ref n={8} />。デモでは T2 の接続で <code>SET SESSION innodb_lock_wait_timeout = 1</code>（SET SESSION は、その接続の中だけで設定を変える）を実行してから、T1 がロックしている行を要求しました。
          </p>
          <Code
            lang="text"
            code={`
 0.00s T1  id=6 をロック
 0.21s T2  id=6 のロックを要求
 1.21s T2  ActiveRecord::LockWaitTimeout: Mysql2::Error::TimeoutError: Lock wait timeout exceeded;
           try restarting transaction
 3.01s T1  COMMIT
`}
          />
          <p>
            2つのトランザクションが互いに相手のロックを待つ状態を<Term en="deadlock">デッドロック</Term>と呼びます。InnoDB はこれを検出し、一方のトランザクションをロールバックします
            <Ref n={9} />。T1 が id=7、T2 が id=8 をロックした後、それぞれ相手の行を要求しました。
          </p>
          <Code
            lang="text"
            code={`
 0.00s T1  id=7 をロック
 0.00s T2  id=8 をロック
 0.50s T1  id=8 を要求
 0.51s T2  id=7 を要求
 0.51s T2  ActiveRecord::Deadlocked: Mysql2::Error: Deadlock found when trying to get lock;
           try restarting transaction
 0.51s T1  id=8 を取得
`}
          />
          <p>
            T2 がロールバックされ、T1 は id=8 を取得して処理を続けました。Rails は MySQL のエラーを <code>ActiveRecord::LockWaitTimeout</code> と{' '}
            <code>ActiveRecord::Deadlocked</code> に変換するので、例外のクラスで扱いを分けられます。MySQL のマニュアルは、デッドロックで失敗したトランザクションをやり直せるように作っておくことを勧めています
            <Ref n={9} />。この例のデッドロックは、2つのトランザクションが逆の順で行をロックしたために起きました。複数の行をロックする処理では、<code>order(:id)</code> を付けるなどして毎回同じ順にロックすると、この形のデッドロックは起きません。
          </p>
        </>
      ),
    },
    {
      id: 'pool',
      title: '接続プール',
      body: (
        <>
          <p>
            ActiveRecord の<Term en="connection pool">接続プール</Term>が貸し出せる接続数は、database.yml（データベースへの接続の設定を書く config/database.yml）で設定します。Rails 8.1 の新規アプリケーションには次の行があります。
          </p>
          <Code
            lang="yaml"
            title="config/database.yml（rails new -d mysql で生成）"
            code={`
default: &default
  adapter: mysql2
  encoding: utf8mb4
  max_connections: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
`}
          />
          <p>
            <code>max_connections</code> は、1つのプール（つまり1つのプロセスの中）で開く接続の上限です。接続を借りるときに空きが無ければ <code>checkout_timeout</code>（既定 5 秒）まで待ち、それでも得られなければ{' '}
            <code>ActiveRecord::ConnectionTimeoutError</code> になります。使われていない接続は <code>idle_timeout</code>（既定 300 秒）を過ぎると閉じられます
            <Ref n={10} />。デモでは <code>max_connections=2&amp;checkout_timeout=1</code> を DATABASE_URL に付け、3つのスレッドから同時に接続を借りて 2 秒の SELECT を実行しました。
          </p>
          <Code
            lang="text"
            code={`
 0.00s T1  接続を取得
 0.05s T2  接続を取得
pool.stat => {size: 2, connections: 2, busy: 2, dead: 0, idle: 0, waiting: 1, checkout_timeout: 1.0}
 1.10s T3  ActiveRecord::ConnectionTimeoutError: could not obtain a connection from the pool within
           1.000 seconds (waited 1.000 seconds); all pooled connections were in use
 2.02s T1  接続を返す
 2.06s T2  接続を返す
`}
          />
          <Figure n="15-8" title="スレッドと接続プール" caption="上の実行結果を図にしたもの。">
            <PoolFigure />
          </Figure>
          <p>接続の借り方には2つあります。</p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb（357〜362行目、452〜471行目）"
            href={`${GH}/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb#L452-L471`}
            code={`
      def lease_connection
        lease = connection_lease
        lease.connection ||= checkout
        lease.sticky = true
        lease.connection
      end

      def with_connection(prevent_permanent_checkout: false)
        lease = connection_lease
        sticky_was = lease.sticky
        lease.sticky = false if prevent_permanent_checkout

        if lease.connection
          begin
            yield lease.connection
          ensure
            lease.sticky = sticky_was if prevent_permanent_checkout
          end
        else
          begin
            yield lease.connection = checkout
          ensure
            lease.sticky = sticky_was if prevent_permanent_checkout
            release_connection(lease) unless lease.sticky
          end
        end
      end
`}
          />
          <p>
            貸し出しは、スレッド（またはファイバー。ファイバーは、1つのスレッドの中で切り替えながら実行できる、さらに小さな処理の単位）ごとの <code>connection_lease</code> に記録されます。<code>with_connection</code> はブロックを抜けると接続を返し、
            <code>lease_connection</code> は借りたままにします。借りたままの接続は、<ChapterLink n={8} />で見た Executor の complete で、トランザクションの途中でなければ返されます
            <Ref n={10} />。<code>ActiveRecord::Base.connection</code> は、7.2 以降「ソフトな非推奨」となり、<code>with_connection</code> か <code>lease_connection</code>{' '}
            を使うよう求められています（<code>connection_handling.rb</code> のコメント）。
          </p>
          <p>
            Puma の各スレッドは1リクエストの間に1つの接続を使うので、<code>max_connections</code> は Puma のスレッド数以上にします。生成される database.yml が{' '}
            <code>RAILS_MAX_THREADS</code> を使っているのはこのためです。また、MySQL への接続の総数は「プロセス数 × max_connections」まで増えます。デモの MySQL の{' '}
            <code>max_connections</code>（サーバー側の上限）は 151 でした。Puma のワーカー数やサーバーの台数、Sidekiq の並行数と合わせた見積もりは<ChapterLink n={23} />で扱います。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2.4 が生成する database.yml では、同じ設定を <code>pool:</code> と書きます。8.1 では <code>pool</code> が <code>max_connections</code> に改名され、
              <code>min_connections</code>・<code>keepalive</code>・<code>max_age</code> が追加されました
              <Ref n={11} />。8.1 でも <code>pool:</code> は読まれます（<code>hash_config.rb</code> の <code>max_connections</code> が <code>:pool</code> を代わりに読む）。
              <code>with_connection</code> と <code>lease_connection</code> は 7.2 にもあります。
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
          <li>アプリケーションは MySQL に接続してから SQL を送ります。MySQL は接続ごとに専用のスレッドで処理し、接続を作るには SQL を1つ送るより長い時間がかかるので、Rails は接続を使い回します。</li>
          <li>トランザクションは BEGIN から COMMIT までの変更をまとめて確定し、ROLLBACK でまとめて取り消します。COMMIT 前の変更は、ほかの接続からは見えません。</li>
          <li>同じ行を読んで Ruby で計算し書き戻す処理が重なると、後の書き込みが先の書き込みを上書きします。UPDATE は変更する行にロックを掛け、同じ行を変更するほかのトランザクションを COMMIT まで待たせます。</li>
          <li>DBの列や索引を変更するときのロックとデプロイの順序は、<ChapterLink n={27} />で扱います。</li>
          <li>トランザクションは接続ごとの TransactionManager がスタックで管理し、BEGIN や SAVEPOINT は最初の SQL を送るときまで遅らせます。</li>
          <li>requires_new なしの内側の transaction は外側に参加するだけで、内側の ActiveRecord::Rollback では何も取り消されません。</li>
          <li>InnoDB の既定の REPEATABLE READ では、トランザクションの中の通常の読み取りは最初の読み取りの時点の値を返します。</li>
          <li>楽観的ロックは lock_version を WHERE に入れて衝突を StaleObjectError で検出し、悲観的ロックは FOR UPDATE で他のトランザクションを待たせます。</li>
          <li>ロックは走査した索引のレコードに掛かるので、索引が無いと無関係な行の更新まで待たされます。ロック待ちのタイムアウトとデッドロックは専用の例外になります。</li>
          <li>接続プールは max_connections まで接続を貸し出し、空きが無ければ checkout_timeout まで待ちます。Puma のスレッド数以上の値にします。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'transaction の requires_new と参加、ActiveRecord::Rollback を捕捉して呼び出し元に伝えない処理、分離レベルの指定の条件。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/transaction.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/transaction.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'TransactionManager の begin_transaction、RealTransaction と SavepointTransaction の materialize!、遅延した BEGIN。' },
    { title: 'Transaction Isolation Levels', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: 'InnoDB の既定の分離レベルが REPEATABLE READ で、同じトランザクションの一貫性のある読み取りは最初の読み取りのスナップショットを読むこと。' },
    { title: 'activerecord/lib/active_record/locking/optimistic.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/locking/optimistic.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'lock_version を WHERE に入れて1増やし、変更行数が1でなければ StaleObjectError にする _update_row。' },
    { title: 'Locking Reads', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: 'FOR UPDATE・FOR SHARE の動作、NOWAIT と SKIP LOCKED、ロックが COMMIT かロールバックで解放されること。' },
    { title: 'activerecord/lib/active_record/locking/pessimistic.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/locking/pessimistic.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'lock! と with_lock の実装。' },
    { title: 'Locks Set by Different SQL Statements in InnoDB', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: 'ロックが走査した索引のレコードに掛かり、適した索引が無いと表のすべての行がロックされること。' },
    { title: 'InnoDB Startup Options and System Variables（innodb_lock_wait_timeout）', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: 'innodb_lock_wait_timeout の既定値が 50 秒で、超えると待っていた文がロールバックされること。' },
    { title: 'Deadlocks in InnoDB', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: 'デッドロックの検出と、一方のトランザクションのロールバック、やり直しに備えること（同じ節の How to Minimize and Handle Deadlocks）。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'max_connections・checkout_timeout・idle_timeout などの設定、lease_connection と with_connection、checkout。既定値は database_configurations/hash_config.rb。' },
    { title: 'activerecord/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/CHANGELOG.md`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '8.1 で keepalive・max_age・min_connections が追加され、pool が max_connections に改名されたこと。' },
    { title: 'Connection Interfaces（Client Connection Thread Management）', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/connection-interfaces.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: '接続ごとに専用のスレッドを割り当て、そのスレッドが認証と要求の処理を行うこと。実行例は MySQL 8.4.13 で実測。' },
    { title: 'autocommit, Commit, and Rollback', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: '新しい接続は autocommit が有効で、文ごとに確定すること。BEGIN で始めて COMMIT か ROLLBACK で終えると、複数の文を1つのトランザクションにできること。' },
    { title: 'Consistent Nonlocking Reads', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: '一貫性のある読み取りは、確定済みの変更だけを見て、まだ確定していない変更を見ないこと。読み取りがロックを掛けないので、ほかのセッションが同時に変更できること。' },
    { title: 'InnoDB Locking', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: 'InnoDB が行の単位のロック（共有ロック S と排他ロック X）を使うこと。排他ロックを持つトランザクションがあると、ほかのトランザクションの同じ行のロックはすぐには得られないこと。' },
    { title: 'The data_locks Table', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/performance-schema-data-locks-table.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: 'performance_schema.data_locks が、持っているロックと要求中のロックを表示すること（LOCK_MODE・LOCK_STATUS・LOCK_DATA）。' },
    { title: 'ActiveRecord::Transactions::ClassMethods', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Transactions/ClassMethods.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'ブロックの中の例外は ROLLBACK の後に呼び出し元へ伝わること。オブジェクトの値はトランザクションの前の状態に戻らないこと。実行例は Rails 8.1.4.1 で実測。' },
  ],
}

export default withExplanations(ch15, explanation15)
