import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation18 } from '../explanations/features'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { JobRetryFigure } from '../visuals/rails-figures'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const SQ = 'https://github.com/sidekiq/sidekiq/blob/v8.1.7'

/* ---------- 図 28-3 投入から実行まで ---------- */
function PipelineFigure() {
  return (
    <Svg
      id="28-3"
      w={780}
      h={340}
      label="Rails のプロセスで perform_later を呼ぶと、ActiveJob がジョブを JSON の Hash に変換し、Sidekiq のアダプターが Sidekiq::ActiveJob::Wrapper のジョブとして Redis のリスト queue:default に LPUSH する。待ち時間を指定したジョブは ZSET の schedule に入る。Sidekiq のプロセスでは、5つのスレッドがそれぞれ BRPOP でリストからジョブを取り出し、Wrapper の perform が ActiveJob::Base.execute を呼び、Rails の Executor の中でジョブの perform が実行される。スケジュールのポーラーは schedule と retry の ZSET から時刻の来たジョブをリストに戻す。失敗したジョブは retry に入り、再試行を使い切ると dead に入る"
    >
      <rect x={14} y={14} width={220} height={250} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={26} y={32} bold fs={12.5}>
        Rails（Puma・runner）
      </T>
      <Box x={28} y={46} w={192} h={40} lines="perform_later" mono fs={12} fill="box" />
      <Arrow x1={124} y1={86} x2={124} y2={104} />
      <Box x={28} y={106} w={192} h={44} lines={['job.serialize', '（GlobalID・JSON 化）']} fs={11} fill="box2" subTone="muted" />
      <Arrow x1={124} y1={150} x2={124} y2={168} />
      <Box x={28} y={170} w={192} h={44} lines={['Sidekiq のアダプター', 'Wrapper.perform_async']} fs={11} fill="box" subTone="muted" />
      <rect x={290} y={14} width={200} height={300} rx={8} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={302} y={32} bold fs={12.5}>
        Redis
      </T>
      <Box x={304} y={46} w={172} h={44} lines={['queue:default', '（LIST）']} mono fs={11.5} fill="bg" subTone="muted" />
      <Box x={304} y={112} w={172} h={44} lines={['schedule', '（ZSET、実行時刻順）']} mono fs={11.5} fill="bg" subTone="muted" />
      <Box x={304} y={178} w={172} h={44} lines={['retry', '（ZSET、次の再試行の時刻順）']} mono fs={11.5} fill="bg" subTone="muted" />
      <Box x={304} y={244} w={172} h={44} lines={['dead', '（ZSET、最大 10,000 件・6か月）']} mono fs={11.5} fill="bg" subTone="muted" />
      <Arrow d="M220,192 L256,192 L256,68 L302,68" />
      <T x={258} y={60} fs={10} tone="muted" mono>
        LPUSH
      </T>
      <Arrow d="M220,200 L270,200 L270,134 L302,134" />
      <T x={250} y={214} fs={10} tone="muted">
        wait あり
      </T>
      <rect x={540} y={14} width={226} height={300} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={552} y={32} bold fs={12.5}>
        Sidekiq のプロセス
      </T>
      <Box x={554} y={46} w={198} h={44} lines={['Processor × 5（スレッド）', 'BRPOP で取り出す']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={476} y1={68} x2={552} y2={68} />
      <Arrow x1={653} y1={90} x2={653} y2={108} />
      <Box x={554} y={110} w={198} h={44} lines={['Sidekiq::ActiveJob::Wrapper', 'ActiveJob::Base.execute']} fs={10.5} mono fill="box" />
      <Arrow x1={653} y1={154} x2={653} y2={172} />
      <Box x={554} y={174} w={198} h={44} lines={['Executor の中で', 'ArticleNoteJob#perform']} fs={11} fill="box5" subTone="muted" />
      <Box x={554} y={244} w={198} h={56} lines={['スケジュールのポーラー（平均5秒）', 'schedule・retry の時刻が来た', 'ジョブを queue に戻す']} fs={10.5} fill="box" subTone="muted" />
      <Arrow d="M476,128 C492,128 492,80 478,78" dashed />
      <Arrow d="M476,194 C500,194 500,84 478,82" dashed />
      <Arrow x1={552} y1={200} x2={478} y2={200} accent />
      <T x={515} y={212} anchor="middle" fs={10.5} tone="acc">
        失敗
      </T>
      <Arrow x1={390} y1={222} x2={390} y2={242} accent />
      <T x={398} y={233} fs={10} tone="acc">
        回数切れ
      </T>
      <T x={20} y={330} fs={11} tone="muted">
        破線：時刻が来たジョブをポーラーがキューに戻す
      </T>
    </Svg>
  )
}

/* ---------- 図 28-4 再試行の状態遷移 ---------- */
function RetryFigure() {
  return (
    <Svg
      id="28-4"
      w={780}
      h={300}
      label="ジョブはキューから取り出されて実行される。成功すれば終わる。retry_on を指定した例外なら、ActiveJob がジョブを schedule に入れ直し、executions が attempts に達するまで繰り返す。retry_on の回数を使い切った例外や、retry_on の無い例外は Sidekiq に伝わり、Sidekiq が retry に入れる。retry からは (回数の4乗 + 15 秒 + 揺らぎ) の後にキューに戻る。Sidekiq の再試行の回数（既定 25 回、約3週間）を使い切ると dead に入り、6か月後に消える。discard_on を指定した例外は、その場でジョブを捨てる"
    >
      <Box x={20} y={120} w={120} h={44} lines="キュー" fill="box4" />
      <Arrow x1={140} y1={142} x2={196} y2={142} />
      <Box x={198} y={120} w={120} h={44} lines="実行" fill="box" bold />
      <Arrow x1={318} y1={130} x2={396} y2={60} />
      <Box x={398} y={36} w={110} h={40} lines="成功" fill="box" />
      <Arrow x1={318} y1={142} x2={396} y2={142} />
      <Box x={398} y={120} w={150} h={44} lines={['retry_on の例外', '（回数が残っている）']} fs={11.5} fill="box2" subTone="muted" />
      <Arrow d="M473,120 L473,100 L80,100 L80,118" dashed />
      <T x={160} y={72} anchor="middle" fs={11} tone="muted">
        ActiveJob が schedule に
      </T>
      <T x={160} y={88} anchor="middle" fs={11} tone="muted">
        入れ直す（wait の後）
      </T>
      <Arrow x1={318} y1={156} x2={396} y2={222} />
      <Box x={398} y={200} w={150} h={44} lines={['それ以外の例外', '（retry_on を使い切った）']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={548} y1={222} x2={590} y2={222} />
      <Box x={592} y={200} w={80} h={44} lines="retry" mono fill="box4" />
      <Arrow d="M632,244 L632,276 L60,276 L60,166" dashed />
      <T x={340} y={268} anchor="middle" fs={11} tone="muted">
        Sidekiq がキューに戻す（回数⁴ + 15 秒 + 揺らぎの後）
      </T>
      <Arrow x1={672} y1={222} x2={694} y2={222} accent />
      <Box x={696} y={200} w={70} h={44} lines="dead" mono fill="box5" />
      <T x={730} y={186} anchor="middle" fs={10.5} tone="acc">
        回数切れ
      </T>
      <Box x={20} y={20} w={190} h={36} lines="discard_on の例外 → 捨てる" fs={11.5} fill="bg" />
      <Arrow d="M240,120 L240,38 L212,38" />
    </Svg>
  )
}

/* ---------- 図 28-1 perform_now と perform_later ---------- */
function SyncAsyncFigure() {
  const x0 = 150
  const sx = 220 // 1 秒あたりの幅
  const bar = (y: number, s: number, e: number, label: string, fill: string) => (
    <g>
      <rect x={x0 + s * sx} y={y} width={Math.max((e - s) * sx, 4)} height={24} rx={3} fill={fill} stroke="var(--fig-line)" />
      <T x={x0 + s * sx + 8} y={y + 12} fs={11}>
        {label}
      </T>
    </g>
  )
  return (
    <Svg
      id="28-1"
      w={780}
      h={300}
      label="perform_now では、Rails のプロセスがその場で perform を実行し、2秒待ってから戻る。要求の処理の中で呼べば、応答もその分遅れる。perform_later では、Rails のプロセスはジョブを Redis のキューに入れて約0.01〜0.05秒で戻り、別のプロセスの Sidekiq がキューから取り出して perform を約2秒かけて実行する"
    >
      <T x={20} y={20} bold fs={12.5}>
        perform_now：その場で実行する
      </T>
      <T x={20} y={56} fs={11.5}>
        Rails のプロセス
      </T>
      {bar(44, 0, 2.13, 'perform（2秒待つ）', 'var(--fig-box5)')}
      <Arrow x1={x0 + 2.13 * sx} y1={56} x2={x0 + 2.13 * sx + 40} y2={56} />
      <T x={x0 + 2.13 * sx + 46} y={56} fs={11} tone="acc">
        2.13 秒後に戻る
      </T>

      <T x={20} y={110} bold fs={12.5}>
        perform_later：キューに入れて戻る
      </T>
      <T x={20} y={146} fs={11.5}>
        Rails のプロセス
      </T>
      <rect x={x0} y={134} width={6} height={24} rx={2} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <Arrow x1={x0 + 6} y1={146} x2={x0 + 46} y2={146} />
      <T x={x0 + 52} y={146} fs={11} tone="acc">
        0.014〜0.048 秒で戻る（キューに入れるだけ）
      </T>
      <T x={20} y={186} fs={11.5}>
        Redis
      </T>
      <Box x={x0 - 4} y={174} w={150} h={24} lines="queue:default に1件" fs={10.5} fill="box4" />
      <T x={20} y={226} fs={11.5}>
        Sidekiq のプロセス
      </T>
      {bar(214, 0.02, 2.05, 'perform（2秒待つ）', 'var(--fig-box5)')}
      <Arrow x1={x0 + 3} y1={158} x2={x0 + 3} y2={172} dashed />
      <Arrow x1={x0 + 6} y1={198} x2={x0 + 6} y2={212} dashed />

      <line x1={x0} y1={258} x2={x0 + 2.25 * sx} y2={258} stroke="var(--fig-line)" />
      {[0, 0.5, 1, 1.5, 2].map((t) => (
        <g key={t}>
          <line x1={x0 + t * sx} y1={254} x2={x0 + t * sx} y2={262} stroke="var(--fig-line)" />
          <T x={x0 + t * sx} y={276} anchor="middle" fs={10.5} tone="muted">
            {`${t} 秒`}
          </T>
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図 28-2 キューとワーカー ---------- */
function QueueWorkerFigure() {
  return (
    <Svg
      id="28-2"
      w={780}
      h={330}
      label="左は1つのプロセスの中のキュー（Thread::Queue）。受付のメインスレッドが仕事を入れ、ワーカーのスレッドが取り出して実行する。プロセスが終わるとキューの中身も消え、ほかのプロセスからは仕事を入れられない。右はプロセスの外の Redis に置いたキュー。Puma のワーカーや bin/rails runner の別々のプロセスが LPUSH でリスト queue:default に入れ、Sidekiq のプロセスのスレッドが BRPOP で取り出して実行する"
    >
      <T x={20} y={20} bold fs={12.5}>
        1つのプロセスの中のキュー
      </T>
      <rect x={20} y={34} width={330} height={234} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={52} fs={11.5} tone="muted">
        プロセス（ruby queue_worker.rb）
      </T>
      <Box x={60} y={66} w={250} h={44} lines={['受付（メインスレッド）', 'queue << "メール0"']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={185} y1={110} x2={185} y2={134} />
      <Box x={60} y={136} w={250} h={44} lines={['Thread::Queue', 'メモリーの中']} fs={11.5} fill="box4" subTone="muted" />
      <Arrow x1={185} y1={180} x2={185} y2={204} />
      <Box x={60} y={206} w={250} h={44} lines={['ワーカーのスレッド', 'queue.pop で取り出して実行']} fs={11.5} fill="box5" subTone="muted" />
      <T x={20} y={290} fs={11} tone="muted">
        プロセスが終わると中身も消える。
      </T>
      <T x={20} y={308} fs={11} tone="muted">
        ほかのプロセスからは入れられない
      </T>

      <T x={390} y={20} bold fs={12.5}>
        プロセスの外のキュー（Redis）
      </T>
      {['Puma のワーカー 0', 'Puma のワーカー 1', 'bin/rails runner'].map((t, i) => (
        <g key={t}>
          <Box x={390 + i * 128} y={40} w={118} h={40} lines={t} fs={11} fill="box" />
          <Arrow x1={449 + i * 128} y1={80} x2={575 + (i - 1) * 40} y2={128} />
        </g>
      ))}
      <T x={680} y={106} fs={10.5} tone="muted" mono>
        LPUSH
      </T>
      <Box x={470} y={130} w={210} h={50} lines={['Redis（別のプロセス）', 'リスト queue:default']} fs={11.5} fill="box4" subTone="muted" />
      <Arrow x1={575} y1={180} x2={575} y2={214} />
      <T x={585} y={198} fs={10.5} tone="muted" mono>
        BRPOP
      </T>
      <Box x={470} y={216} w={210} h={50} lines={['Sidekiq のプロセス', 'スレッドが取り出して perform']} fs={11.5} fill="box5" subTone="muted" />
      <T x={390} y={290} fs={11} tone="muted">
        入れたプロセスが終わってもジョブは残り、
      </T>
      <T x={390} y={308} fs={11} tone="muted">
        どのプロセスが入れたジョブも同じリストに並ぶ
      </T>
    </Svg>
  )
}

/* ---------- COMMIT の前と後に実行されたジョブ（transaction の節） ---------- */
function CommitTimingFigure() {
  const x = (t: number) => 170 + (t - 55.5) * 230 // 横軸は 10:09:55.5 からの時刻
  const commit = x(57.696)
  return (
    <Svg
      id="ch18-commit-timing"
      w={780}
      h={280}
      label="Rails のプロセスは1つのトランザクションで記事 10004 と 10005 を作り、perform_later を2回呼んでから2秒待って COMMIT した。ArticleNoteJob はその場で投入され、Sidekiq のプロセスが 55.666 に実行を始めたが、COMMIT の前なので Sidekiq の接続からは記事 10004 が見つからず、55.727 に DeserializationError で失敗した。AfterCommitNoteJob の投入は COMMIT まで保留され、COMMIT の後に投入されて 57.695 に実行を始め、57.704 に記事 10005 を読んで実行した"
    >
      <rect x={170} y={28} width={commit - 170} height={162} rx={6} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={180} y={44} fs={11.5} tone="muted">
        COMMIT 前：記事 10004・10005 は Sidekiq の接続から見つからない
      </T>
      <Arrow x1={commit} y1={28} x2={commit} y2={190} plain />
      <T x={698} y={44} fs={11.5} tone="acc">
        COMMIT 後
      </T>
      <T x={698} y={62} fs={11.5} tone="muted">
        見つかる
      </T>

      <T x={20} y={92} fs={11.5}>
        Rails のプロセス
      </T>
      <T x={200} y={66} fs={11.5} tone="muted">
        perform_later を2回
      </T>
      <rect x={x(55.668)} y={80} width={commit - x(55.668)} height={24} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={x(55.668) + 8} y={92} fs={11.5}>
        2秒待つ。AfterCommitNoteJob の投入は COMMIT まで保留
      </T>

      <Arrow x1={x(55.666)} y1={104} x2={x(55.666)} y2={156} />
      <T x={x(55.666) + 8} y={130} fs={11.5} tone="muted">
        その場で投入
      </T>
      <Arrow d={`M${commit + 1},96 L690,96 L690,156`} />
      <T x={698} y={120} fs={11.5} tone="muted">
        COMMIT 後に
      </T>
      <T x={698} y={138} fs={11.5} tone="muted">
        投入
      </T>

      <T x={20} y={170} fs={11.5}>
        Sidekiq のプロセス
      </T>
      <rect x={x(55.666)} y={158} width={x(55.727) - x(55.666)} height={24} rx={2} fill="var(--fig-box5)" stroke="var(--fig-danger)" />
      <T x={x(55.727) + 8} y={170} fs={11.5} tone="danger">
        ArticleNoteJob：記事 10004 が見つからず DeserializationError
      </T>
      <T x={x(55.727) + 8} y={206} fs={11.5} tone="muted">
        55.666 開始、55.727 に失敗
      </T>
      <rect x={688} y={158} width={4} height={24} rx={1} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={770} y={206} anchor="end" fs={11.5}>
        AfterCommitNoteJob：記事 10005 を読めた
      </T>
      <T x={770} y={224} anchor="end" fs={11.5} tone="muted">
        57.695 開始、57.704 に実行
      </T>

      <T x={20} y={250} fs={11.5} tone="muted">
        時刻
      </T>
      <line x1={170} y1={250} x2={x(58)} y2={250} stroke="var(--fig-line)" />
      {[56, 57, 58].map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={246} x2={x(t)} y2={254} stroke="var(--fig-line)" />
          <T x={x(t)} y={266} anchor="middle" fs={11.5} tone="muted" mono>
            {`10:09:${t}`}
          </T>
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 停止の仕方と実行中のジョブ（idempotency の節） ---------- */
function ShutdownFigure() {
  return (
    <Svg
      id="ch18-shutdown"
      w={780}
      h={232}
      label="Sidekiq が実行中のジョブは、BRPOP で取り出した時点で queue:default から削除されている。TERM を受けると、Sidekiq はジョブの終了を待つ。ジョブが終わらないまま先に Sidekiq のタイムアウトが来ると、ジョブを打ち切って queue:default に戻し、再起動の後に最初から実行する。デモでは 09.981 に Redis へ戻し、16.444 に最初から実行した。先にコンテナやサービス管理側の停止猶予が切れると、SIGKILL などで強制終了され、戻す処理が動かないので、ジョブは失われる"
    >
      <Box x={20} y={104} w={170} h={48} lines={['実行中のジョブ', 'queue:default には無い']} fs={11.5} />
      <Arrow x1={190} y1={128} x2={208} y2={128} />
      <Box x={210} y={104} w={160} h={48} lines={['TERM を受ける', 'ジョブの終了を待つ']} fs={11.5} />
      <Arrow d="M370,128 L395,128 L395,60 L418,60" />
      <Arrow d="M370,128 L395,128 L395,196 L418,196" />

      <T x={420} y={22} fs={11.5} tone="muted">
        先に Sidekiq のタイムアウトが来た
      </T>
      <Box x={420} y={36} w={170} h={48} lines={['打ち切って', 'queue:default に戻す']} fs={11.5} />
      <Arrow x1={590} y1={60} x2={608} y2={60} />
      <Box x={610} y={36} w={160} h={48} lines={['再起動の後に', '最初から実行']} fs={11.5} />
      <T x={420} y={102} fs={11.5} tone="muted">
        デモ：09.981 に Redis へ戻し、16.444 に最初から実行
      </T>

      <T x={420} y={158} fs={11.5} tone="muted">
        先に停止猶予が切れた
      </T>
      <Box x={420} y={172} w={170} h={48} lines={['SIGKILL などで', '強制終了']} fs={11.5} />
      <Arrow x1={590} y1={196} x2={608} y2={196} />
      <Box x={610} y={172} w={160} h={48} lines={['戻す処理が動かない', 'ジョブは失われる']} fs={12.5} fill="box5" subTone="danger" />
    </Svg>
  )
}

const ch18: Chapter = {
  number: 18,
  part: 4,
  title: '非同期処理（ActiveJob・Sidekiq）',
  summary:
    'メールの送信が終わるまで利用者を待たせずに、先に画面を返したいことがあります。仕事を登録する Rails のコードと、後でそれを取り出して実行するプログラムを別々に追います。',
  goals: [
    'perform_later を呼ぶ側と、キューから取り出して perform を実行する側を区別できる',
    '保存したレコードをジョブに渡すとき、DB への変更が確定する時点を考えられる',
    '途中で失敗して同じ仕事が再実行されても、二重に更新しない方法を説明できる',
    'Sidekiq と Solid Queue の仕事の保存先を区別し、遅れや再試行の状況を調べられる',
  ],
  prerequisites: [8, 14, 15],
  sections: [
    {
      id: 'why-async',
      title: '時間のかかる処理を応答の後に回す',
      body: (
        <>
          <p>
            Web アプリケーションには、要求の処理の中で行うと時間のかかる仕事があります。メールの送信ではメールのサーバーに接続して内容を渡し終えるまで待ちます。決済や地図のような外部のサービスの
            API（ほかのプログラムがそのサービスの機能を使うための呼び出し方）を呼ぶと、相手の応答を待ちます。これらを要求の処理の中で行うと、その時間だけ利用者への応答が遅れます。Puma のスレッドもその間ふさがるので、同時に処理できるほかの要求も減ります（
            <ChapterLink n={23} section="app-server" />
            ）。
          </p>
          <p>
            デモのアプリケーションに、メールの送信の代わりに2秒待つ<Term en="job">ジョブ</Term>を書きました。ジョブは後で実行する仕事を1つのクラスにまとめたものです（書き方は「ActiveJob のジョブの書き方」の節）。
          </p>
          <Code
            lang="ruby"
            title="app/jobs/notice18_job.rb（デモ）"
            code={`
class Notice18Job < ApplicationJob
  queue_as :default

  def perform(article_id)
    article = Article.find(article_id)
    sleep 2 # メールの送信や外部の API の呼び出しにかかる時間の代わり
    Rails.logger.info "通知を送信しました article=#{article.id} title=#{article.title}"
  end
end
`}
          />
          <p>
            このジョブを、その場で実行する <code>perform_now</code> と、キュー（実行を待つ仕事を順に並べておく置き場所。次の節）に入れるだけの <code>perform_later</code> で呼び、それぞれの呼び出しから戻るまでの時間を測りました。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行したコードと出力（Rails 8.1.4.1・Sidekiq 8.1.7）"
            code={`
t = Time.now
Notice18Job.perform_now(1)
puts format("perform_now:   %.2f 秒", Time.now - t)

2.times do
  t = Time.now
  job = Notice18Job.perform_later(1)
  puts format("perform_later: %.3f 秒  job_id=%s", Time.now - t, job.job_id)
end

# 出力
perform_now:   2.13 秒
perform_later: 0.048 秒  job_id=ae99c88d-6fe2-443d-a175-c2775fae282b
perform_later: 0.014 秒  job_id=08dd7d1e-ef5b-4bb6-8386-c9da7b29ca66
`}
          />
          <p>
            perform_now はジョブの perform をその場で実行するので、2秒待ってから戻りました。コントローラーのアクションの中で呼べば、応答もその分だけ遅れます。perform_later はジョブをキューに入れて 0.05
            秒以内に戻りました。perform は、Sidekiq という別のプロセスが後で実行します（図 28-1）。呼び出した処理が終わるのを待ってから次へ進む方式を同期、終わるのを待たずに先へ進む方式を
            <Term en="asynchronous">非同期</Term>と呼びます。Rails のガイドは時間のかかる仕事を要求と応答のやり取りの外に出し、要求への応答を速く保つことを、バックグラウンドのジョブの目的としています
            <Ref n={2} />。
          </p>
          <p>
            非同期にすると、応答を返した時点では、メールはまだ送られていません。送信に失敗しても、利用者への応答はすでに成功として返っています。失敗したジョブをやり直す仕組みは「再試行と Dead」の節で扱います。
          </p>
          <Figure n="28-1" title="perform_now と perform_later" caption="デモでの実測（bin/rails runner と Sidekiq のログの時刻）をもとにした模式図。">
            <SyncAsyncFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'queue-worker',
      title: 'キューとワーカー、Redis',
      body: (
        <>
          <p>
            非同期の処理は仕事を受け付ける側と実行する側を分け、その間に<Term en="queue">キュー</Term>を置いて作ります。キューは先に入れたものから順に取り出す置き場所です。キューから仕事を取り出して実行する側を
            <Term en="worker">ワーカー</Term>と呼びます。Ruby の Thread::Queue で、1つのプロセスの中にキューとワーカーを作りました。Thread::Queue の <code>pop</code>{' '}
            は、キューが空なら、次の値が入るまでスレッドを待たせます
            <Ref n={11} />。
          </p>
          <Code
            lang="ruby"
            title="queue_worker.rb"
            code={`
start = Time.now
log = ->(msg) { puts format("%.1f 秒  %s", Time.now - start, msg) }

queue = Thread::Queue.new

worker = Thread.new do
  while (job = queue.pop) # キューが空なら、次の仕事が入るまで待つ
    sleep 1 # メールの送信に1秒かかる代わり
    log.("ワーカー: #{job} を送信した")
  end
end

3.times do |i|
  queue << "メール#{i}"
  log.("受付: メール#{i} をキューに入れた")
end
log.("受付: 応答を返した")

queue.close # これ以上入れないことを知らせる。空になると pop が nil を返す
worker.join
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
0.0 秒  受付: メール0 をキューに入れた
0.0 秒  受付: メール1 をキューに入れた
0.0 秒  受付: メール2 をキューに入れた
0.0 秒  受付: 応答を返した
1.0 秒  ワーカー: メール0 を送信した
2.0 秒  ワーカー: メール1 を送信した
3.0 秒  ワーカー: メール2 を送信した
`}
          />
          <p>
            受付の側（メインスレッド）は3通のメールをキューに入れて、すぐに「応答を返した」まで進みました。ワーカーのスレッドはキューから入れた順に1通ずつ取り出し、1秒ずつかけて送りました。ただし、このキューはプロセスのメモリーの中にあります（
            <ChapterLink n={23} section="process" />
            ）。プロセスが終われば、キューに残っていた仕事も消えます。Puma のワーカーのような別のプロセスからは、このキューに仕事を入れられません。そこで Rails のアプリケーションでは、キューをプロセスの外の Redis などに置きます。
          </p>
          <p>
            <Term>Redis</Term> はデータをメモリーに置き、ネットワークを通じてほかのプログラムに読み書きさせるサーバーのプログラムです
            <Ref n={12} />。データベースと同じように独立したプロセスとして動き、複数のプロセスから同じデータを読み書きできます。Redis のリストは値を順に並べて持つデータで、LPUSH で先頭に入れて RPOP
            で末尾から取り出すと、入れた順に取り出すキューになります
            <Ref n={13} />。redis-cli（Redis にコマンドを送るプログラム）で試しました。1行ずつ別のプロセスとして実行しています。
          </p>
          <Code
            lang="text"
            title="redis-cli で Redis のリストを操作する（Redis 8.10.3）"
            code={`
$ redis-cli LPUSH demo18 mail0 mail1
(integer) 2
$ redis-cli LRANGE demo18 0 -1      # リストの中身を先頭から表示する
1) "mail1"
2) "mail0"
$ redis-cli RPOP demo18
"mail0"
$ redis-cli RPOP demo18
"mail1"
$ redis-cli RPOP demo18
(nil)
`}
          />
          <p>
            LPUSH を実行した redis-cli のプロセスはすぐに終わりましたが、入れた値は Redis に残り、別のプロセスの LRANGE や RPOP から読めました。RPOP は、リストが空なら nil を返します。BRPOP は RPOP
            と同じく末尾から取り出しますが、リストが空なら、値が入るまで待ちます
            <Ref n={14} />。
          </p>
          <Code
            lang="text"
            title="BRPOP で待つ（2つの端末で実行）"
            code={`
（端末1）$ redis-cli BRPOP demo18 0        # 0 は、いつまでも待つという指定
          （端末2で LPUSH するまで、何も表示されずに待つ）
1) "demo18"
2) "mail2"

（端末1の3秒後に、端末2）$ redis-cli LPUSH demo18 mail2
(integer) 1
`}
          />
          <p>
            BRPOP は、別のプロセスが LPUSH するまで戻らず、値が入るとすぐに受け取りました。Sidekiq のワーカーはこの BRPOP で Redis のリストからジョブを取り出します。Puma のどのワーカーが入れたジョブも同じ
            Redis のリストに並び、Sidekiq のプロセスが取り出して実行します（図 28-2）。
          </p>
          <Figure n="28-2" title="キューとワーカー" caption="queue_worker.rb の実行結果と、redis-cli での実測をもとにした模式図。">
            <QueueWorkerFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'job-basics',
      title: 'ActiveJob のジョブの書き方',
      body: (
        <>
          <p>
            ActiveJob はジョブの書き方と投入の仕方を共通にする Rails の機能です。ジョブは app/jobs に置き、ApplicationJob を継承したクラスに <code>perform</code> メソッドを書きます
            <Ref n={2} />。「時間のかかる処理を応答の後に回す」の節の Notice18Job では、次のように書きました（名前の 18 は、デモのアプリケーションでほかの章の例と区別するために付けたものです）。
          </p>
          <ul>
            <li>
              <code>queue_as :default</code> はジョブを入れるキューの名前です。
            </li>
            <li>
              <code>perform</code> に実行する処理を書きます。perform の引数が投入するときに渡す値です。ここでは記事の id を渡し、perform の中で <code>Article.find</code>{' '}
              で読み直しています（記事のオブジェクトそのものを渡す書き方は「引数のシリアライズと GlobalID」の節）。
            </li>
            <li>
              投入するときは、クラスの <code>perform_later</code> に perform の引数を渡します。戻り値はジョブのオブジェクトで、<code>job_id</code> でジョブの ID を読めます。
            </li>
          </ul>
          <p>前の節の2回の perform_later で、投入した側（runner）と実行した側（Sidekiq）のログには次の行が出ました。</p>
          <Code
            lang="text"
            title="投入した側と実行した側のログ（runner はログを画面にも出す設定を加えて実行。Sidekiq のログは時刻と ID の一部を省略）"
            code={`
（投入した側：bin/rails runner）
Enqueued Notice18Job (Job ID: ae99c88d-6fe2-443d-a175-c2775fae282b) to Sidekiq(default) with arguments: 1
Enqueued Notice18Job (Job ID: 08dd7d1e-ef5b-4bb6-8386-c9da7b29ca66) to Sidekiq(default) with arguments: 1

（実行した側：docker logs rbdemo-sidekiq）
07:07:53.461 tid=5ht Performing Notice18Job (Job ID: ae99c88d-…) from Sidekiq(default) enqueued at 2026-11-16T07:07:53.437226107Z with arguments: 1
07:07:53.499 tid=5gp Performing Notice18Job (Job ID: 08dd7d1e-…) from Sidekiq(default) enqueued at 2026-11-16T07:07:53.478362618Z with arguments: 1
07:07:55.496 tid=5ht 通知を送信しました article=1 title=変更後のタイトル
07:07:55.497 tid=5ht Performed Notice18Job (Job ID: ae99c88d-…) from Sidekiq(default) in 2035.15ms
07:07:55.521 tid=5gp 通知を送信しました article=1 title=変更後のタイトル
07:07:55.521 tid=5gp Performed Notice18Job (Job ID: 08dd7d1e-…) from Sidekiq(default) in 2022.36ms
`}
          />
          <p>
            Enqueued の行は、ジョブがキュー default に入ったことを示しています。Job ID は ActiveJob がジョブごとに付ける ID で、実行した側の Performing・Performed の行の Job ID と同じです。投入から約 0.02
            秒後に実行が始まり、Sidekiq は2つのジョブを2つのスレッド（tid=5ht と tid=5gp）で同時に実行して、どちらも約2秒で終わりました。
          </p>
          <p>
            実行する側が動いていないときは、ジョブはキューに残ります。デモの Sidekiq は default のキューだけを読むように起動しています。そこで、ジョブを basics18 という別のキューに入れてから、しばらくして basics18 を読む
            Sidekiq を起動しました。<code>set(queue: "basics18")</code> は、この1回の投入だけキューの名前を変える書き方です。
          </p>
          <Code
            lang="text"
            title="Sidekiq が読まないキューに入れてから、そのキューを読む Sidekiq を起動する（一部を省略）"
            code={`
（07:08:57 に bin/rails runner で投入）
Notice18Job.set(queue: "basics18").perform_later(1)
Enqueued Notice18Job (Job ID: 4ffaf27d-…) to Sidekiq(basics18) with arguments: 1

（Sidekiq を起動する直前。LLEN はリストの要素の数）
$ redis-cli LLEN queue:basics18
(integer) 1

（07:09:12 に bundle exec sidekiq -q basics18 で起動）
07:09:12.358 Performing Notice18Job (Job ID: 4ffaf27d-…) from Sidekiq(basics18) enqueued at 2026-11-16T07:08:57.211213257Z with arguments: 1
07:09:14.447 通知を送信しました article=1 title=変更後のタイトル
07:09:14.447 Performed Notice18Job (Job ID: 4ffaf27d-…) from Sidekiq(basics18) in 2092.46ms

$ redis-cli LLEN queue:basics18
(integer) 0
`}
          />
          <p>
            投入から15秒後に起動した Sidekiq が、キューに残っていたジョブを取り出して実行しました。Rails のプロセスはジョブを Redis に入れた時点で仕事を終えていて、ジョブが実行されるかどうかは、Sidekiq
            のプロセスが動いているかで決まります。本番環境では Puma とは別に Sidekiq のプロセスを起動しておきます。
          </p>
          <p>
            次の節からは、perform_later を呼んでから Sidekiq が perform を実行するまでの間を詳しく追います。ActiveJob がジョブを何に変換して Redis に入れるのか、Sidekiq がそれをどう取り出して実行するのかを、Redis
            の中身とログで確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'overview',
      title: 'ジョブが投入されて実行されるまで',
      body: (
        <>
          <p>
            ジョブを保存して実行する仕組みを、キューのバックエンドと呼びます。アダプターはActiveJob の共通API（<code>perform</code>・<code>perform_later</code>・<code>retry_on</code> など）から、バックエンドに合わせた呼び出しへ変換します。デモでは開発環境の設定に{' '}
            <code>config.active_job.queue_adapter = :sidekiq</code> を書き、Redis 8.10 と Sidekiq 8.1.7 を Docker で動かしました。
          </p>
          <Code
            lang="ruby"
            title="app/jobs/article_note_job.rb（デモ）"
            code={`
class ArticleNoteJob < ApplicationJob
  queue_as :default

  def perform(article, note:, tags: [])
    Rails.logger.info "ArticleNoteJob 実行 article=#{article.id} note=#{note} tags=#{tags.inspect} executions=#{executions}"
  end
end
`}
          />
          <p>
            このジョブは Notice18Job と違い、記事の id ではなく記事のオブジェクトを受け取ります。<code>note:</code> と <code>tags:</code> はキーワード引数です。<code>executions</code> は ActiveJob
            がジョブごとに数えている実行の回数で、「再試行と Dead」の節で使います。
          </p>
          <p>
            <code>ArticleNoteJob.perform_later(article, note: "メモ", tags: [:urgent])</code> を呼ぶと、Rails のプロセスでは引数を JSON に変換して Redis に入れるところまでを行い、すぐに戻ります。実行は別のプロセス（Sidekiq）が受け持ちます（図 28-3）。
          </p>
          <p>
            図 28-3 は左から右へ読みます。左の枠が投入する側の Rails のプロセス、中央が Redis、右の枠が実行する側の Sidekiq のプロセスです。左の枠の job.serialize は次の「引数のシリアライズと GlobalID」の節で扱います。アダプターと
            Wrapper、中央の queue:default と schedule、右の枠の Processor とポーラーは「Sidekiq の構成と Redis の中身」の節で、retry と dead は「再試行と Dead」の節で扱います。
          </p>
          <Figure n="28-3" title="投入から実行まで" caption="Sidekiq 8.1.7 の fetch.rb・processor.rb・scheduled.rb・job_retry.rb と、デモでの Redis の中身をもとにした模式図。">
            <PipelineFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'serialize',
      title: '引数のシリアライズと GlobalID',
      body: (
        <>
          <p>ジョブのクラス名や引数などを、保存・転送できるデータに変換することをシリアライズと呼びます。ActiveJob は次の Hash に変換して保存先の処理に渡します。</p>
          <Code
            lang="ruby"
            title="activejob/lib/active_job/core.rb（117〜132行目）"
            href={`${GH}/activejob/lib/active_job/core.rb#L117-L132`}
            code={`
    def serialize
      {
        "job_class"  => self.class.name,
        "job_id"     => job_id,
        "provider_job_id" => provider_job_id,
        "queue_name" => queue_name,
        "priority"   => priority,
        "arguments"  => serialize_arguments_if_needed(arguments),
        "executions" => executions,
        "exception_executions" => exception_executions,
        "locale"     => locale || I18n.locale.to_s,
        "timezone"   => timezone,
        "enqueued_at" => Time.now.utc.iso8601(9),
        "scheduled_at" => scheduled_at ? scheduled_at.utc.iso8601(9) : nil,
      }
    end
`}
          />
          <p>Hash のキーのうち、ログや調査で目にするものは次のとおりです。</p>
          <ul>
            <li>
              <code>job_class</code>：ジョブのクラス名の文字列（<code>"ArticleNoteJob"</code>）です。実行する側は、この名前からクラスを探してジョブのオブジェクトを作り直します。キューにジョブが残っているうちにクラス名を変えると、実行する側は古い名前のクラスを見つけられず、<code>ActiveJob::UnknownJobClassError</code>{' '}
              になります。
            </li>
            <li>
              <code>job_id</code> と <code>queue_name</code>：ログの Job ID と、<code>queue_as</code> で指定したキューの名前です。
            </li>
            <li>
              <code>arguments</code>：perform_later に渡した引数です。<code>serialize_arguments_if_needed</code> が、JSON で表せる形に変換します。変換の結果はこの後で見ます。
            </li>
            <li>
              <code>executions</code>：これまでに実行した回数です。投入した時点では 0 で、実行のたびに1増えます。
            </li>
            <li>
              <code>locale</code> と <code>timezone</code>：投入した時点のロケール（表示に使う言語の設定）とタイムゾーンです。実行する側は、この2つに切り替えてから perform を呼びます。
            </li>
            <li>
              <code>enqueued_at</code>：投入した時刻です。<code>iso8601(9)</code> は小数点以下9桁までの文字列にするので、「ActiveJob のジョブの書き方」の節のログの <code>enqueued at 2026-11-16T07:07:53.437226107Z</code>{' '}
              の形になります。
            </li>
          </ul>
          <p>
            前の節の <code>ArticleNoteJob.perform_later(article, note: "メモ", tags: [:urgent])</code> では、<code>arguments</code> は次のようになりました。配列の1つ目が article、2つ目がキーワード引数の Hash です。
          </p>
          <Code
            lang="json"
            code={`
  "arguments": [
    { "_aj_globalid": "gid://demo/Article/1" },
    {
      "note": "メモ",
      "tags": [
        { "_aj_serialized": "ActiveJob::Serializers::SymbolSerializer", "value": "urgent" }
      ],
      "_aj_ruby2_keywords": ["note", "tags"]
    }
  ],
`}
          />
          <p>
            ActiveRecord のオブジェクトは、属性ではなく <Term>GlobalID</Term>（<code>gid://アプリケーション名/クラス名/id</code>）だけが保存されます。実行するときに{' '}
            <code>Article.find(1)</code> で読み直すので、ジョブが実行される時点の最新のデータが使われます。Symbol・Date・Time・Duration などの JSON に無い型は{' '}
            <code>_aj_serialized</code> でクラス名を付けて保存し、キーワード引数は <code>_aj_ruby2_keywords</code> でキーワードだったことを記録します
            <Ref n={1} />。
          </p>
          <p>
            記事のオブジェクトを渡しても、投入した時点のタイトルや本文はジョブに保存されません。投入の後で記事が更新されると、ジョブは更新後の値を読みます。投入した時点の値を使いたいときは、<code>perform_later(article, old_title: article.title)</code>{' '}
            のように、その値を引数として渡します。
          </p>
          <p>
            投入してから実行するまでの間にレコードが削除されると、読み直しに失敗します。デモで、記事を作って投入した直後に削除したところ、Sidekiq のログに次の例外が出ました。
          </p>
          <Code
            lang="text"
            code={`
ActiveJob::DeserializationError (Error while trying to deserialize arguments: Couldn't find Article with 'id'="10003")
`}
          />
          <p>
            <code>Couldn't find Article with 'id'="10003"</code> の部分は、実行する側が GlobalID から <code>Article.find</code> で読み直したときに、id が 10003 の行が無かったことを示しています。Notice18Job のように id
            を渡して perform の中で find するジョブでは、同じ場面で <code>ActiveRecord::RecordNotFound</code> になります。
          </p>
          <p>
            この例外が起きたジョブは何度再試行しても成功しません。削除が起こりうるジョブでは、<code>discard_on ActiveJob::DeserializationError</code> でジョブを捨てるようにします
            <Ref n={2} />。<code>discard_on</code> はジョブのクラスの中に書きます。<code>rails new</code> で作られる app/jobs/application_job.rb には、この行がコメントの形で入っています。
          </p>
          <Code
            lang="ruby"
            title="レコードが削除されていたらジョブを捨てる"
            code={`
class ArticleNoteJob < ApplicationJob
  queue_as :default
  discard_on ActiveJob::DeserializationError

  def perform(article, note:, tags: [])
    # ...
  end
end
`}
          />
          <p>
            同じ例外は、レコードが削除されたときのほかに、レコードを作った側がまだ COMMIT していないときにも起きます。その場合の原因と直し方は「トランザクションと投入の時刻」の節で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'sidekiq',
      title: 'Sidekiq の構成と Redis の中身',
      body: (
        <>
          <p>
            この節では、perform_later が Redis のどのキーに何を入れ、Sidekiq のプロセスがそれをどう取り出して perform を呼ぶかを確かめます。ジョブが実行されないときや遅れて実行されるときに、Redis のどのキーを調べるかがここからわかります。
          </p>
          <p>Sidekiq のアダプターは、ActiveJob のジョブを Sidekiq 自身のジョブ（Sidekiq::ActiveJob::Wrapper）に包んで投入します。このアダプターは Sidekiq の gem にあります。Rails 本体にも sidekiq のアダプターがありますが、8.1.4.1 では「Rails 8.2 で削除するので、Sidekiq 7.3.3 以上の gem のアダプターを使う」という非推奨の警告を出します。Sidekiq の gem を読み込むと、gem 側のアダプターが Rails のものを置き換えます。</p>
          <p>次の引用で、Wrapper が実行のときに何を呼ぶかと、アダプターが投入のときに何を呼ぶかを確かめます。</p>
          <Code
            lang="ruby"
            title="sidekiq: lib/active_job/queue_adapters/sidekiq_adapter.rb（7〜18行目、63〜71行目から抜粋）"
            href={`${SQ}/lib/active_job/queue_adapters/sidekiq_adapter.rb#L7-L71`}
            code={`
  module Sidekiq
    module ActiveJob
      # @api private
      class Wrapper
        include Sidekiq::Job

        def perform(job_data)
          ::ActiveJob::Base.execute(job_data.merge("provider_job_id" => jid))
        end
      end
    end
  end

        def enqueue(job)
          # NB: Active Job only serializes keys it recognizes. We
          # cannot set arbitrary key/values here.
          options = {wrapped: job.class, queue: job.queue_name}
          options[:profile] = job.profile if job.respond_to?(:profile) && !job.profile.nil?

          wrapper = Sidekiq::ActiveJob::Wrapper.set(options)
          job.provider_job_id = wrapper.perform_async(job.serialize)
        end
`}
          />
          <ul>
            <li>
              <code>include Sidekiq::Job</code>：このモジュールを include したクラスは Sidekiq のジョブになります（「ActiveJob 経由と Sidekiq の直接利用」の節）。Sidekiq から見ると、ActiveJob のジョブはどれも Wrapper という1つのクラスのジョブです。
            </li>
            <li>
              <code>perform(job_data)</code>：Sidekiq がジョブを実行するときに呼ぶメソッドです。<code>job_data</code> は前の節の serialize の Hash で、<code>jid</code> は Sidekiq がジョブに付けた ID です。<code>::ActiveJob::Base</code>{' '}
              の先頭の <code>::</code> は、Sidekiq::ActiveJob ではなく Rails の ActiveJob を指すための書き方です。<code>execute</code> は、Hash からジョブのオブジェクトを作り直して perform を呼びます。
            </li>
            <li>
              <code>enqueue(job)</code>：perform_later が最後に呼ぶメソッドです。<code>job</code> は ActiveJob のジョブのオブジェクトです。<code>Wrapper.set(options)</code> で元のクラス（wrapped）とキューの名前（queue）を指定し、<code>perform_async</code>{' '}
              に serialize の Hash を渡します。perform_async は Sidekiq の投入のメソッドで、引数を JSON にして Redis に入れ、jid を返します。<code>options[:profile]</code> の行は、この流れには関係しません。
            </li>
          </ul>
          <p>投入した直後に Redis を見ると、キーは2つで、リストの queue:default に次の JSON が入っていました。</p>
          <Code
            lang="json"
            code={`
KEYS: ["queue:default", "queues"]
{
  "retry": true,
  "queue": "default",
  "wrapped": "ArticleNoteJob",
  "args": [ { "job_class": "ArticleNoteJob", "job_id": "9e557e74-…", "arguments": [ … ], … } ],
  "class": "Sidekiq::ActiveJob::Wrapper",
  "jid": "32f97183fc18fe5947f7b243",
  "created_at": 1794391677710,
  "enqueued_at": 1794391677710
}
`}
          />
          <p>
            <code>queues</code> は、Sidekiq がキューの名前を集めて入れておくキーです。JSON の <code>class</code> は Wrapper で、元のジョブのクラス名は <code>wrapped</code> に入っています。<code>retry</code> が true なのは、Sidekiq
            の再試行（次の節）が有効であることを示します。<code>created_at</code> と <code>enqueued_at</code> はミリ秒単位の UNIX 時刻で、1794391677710 は 2026年11月11日 10時7分57秒（UTC）です。
          </p>
          <p>
            ActiveJob の Hash は <code>args</code> の1つ目の要素にそのまま入っています。<code>jid</code> は Sidekiq のジョブの ID で、ActiveJob 側では <code>provider_job_id</code>{' '}
            になります。<code>set(wait: 1.hour)</code> で投入すると、リストではなく ZSET の <code>schedule</code> に、実行時刻（UNIX 時刻）をスコアとして入りました。
          </p>
          <p>
            Sidekiq のプロセスは、既定で5つのスレッド（Processor）を持ち、それぞれが Redis の BRPOP でキューから1件ずつ取り出します
            <Ref n={3} />。BRPOP は、リストが空なら要素が入るまで待つ命令なので、ジョブが入るとすぐに取り出されます。取り出したジョブの実行は、例外のバックトレース（例外が起きるまでに呼ばれたメソッドとファイル名・行番号の一覧）で確かめられます（下から上へ呼ばれる順。一部を抜粋）。
          </p>
          <Code
            lang="text"
            code={`
app/jobs/flaky_job.rb:5:in 'FlakyJob#perform'
  from activejob-8.1.4.1/lib/active_job/execution.rb:51:in 'ActiveJob::Execution#perform_now'
  from activesupport-8.1.4.1/lib/active_support/reloader.rb:77:in 'block in ActiveSupport::Reloader.wrap'
  from activesupport-8.1.4.1/lib/active_support/execution_wrapper.rb:87:in 'ActiveSupport::ExecutionWrapper.wrap'
  from activejob-8.1.4.1/lib/active_job/railtie.rb:85:in 'block (3 levels) in <class:Railtie>'
  from activejob-8.1.4.1/lib/active_job/execution.rb:27:in 'ActiveJob::Execution::ClassMethods#execute'
  from sidekiq-8.1.7/lib/active_job/queue_adapters/sidekiq_adapter.rb:14:in 'Sidekiq::ActiveJob::Wrapper#perform'
  from sidekiq-8.1.7/lib/sidekiq/processor.rb:228:in 'Sidekiq::Processor#execute_job'
`}
          />
          <p>
            FlakyJob は次の節で使う、例外を投げるデモのジョブです。下の行から順に読みます。一番下の processor.rb の行は、Sidekiq のスレッド（Processor）が取り出したジョブを実行している所です。その上の sidekiq_adapter.rb の14行目は、先ほど引用した Wrapper の perform の中の{' '}
            <code>::ActiveJob::Base.execute</code> の行です。execution.rb の27行目から reloader.rb までの4行は、execute がジョブを Executor の中で実行している部分です。上の2行で ActiveJob の perform_now が FlakyJob の perform
            を呼び、flaky_job.rb の5行目で例外が起きました。業務でジョブの例外のバックトレースを読むときも、sidekiq と activejob の行より上にある app/jobs の行が、アプリケーションのコードで例外が起きた場所です。
          </p>
          <p>
            <code>ActiveJob::Base.execute</code> は、ジョブを Reloader（Executor）の中で実行します。<ChapterLink n={8} section="executor" />
            で見たとおり、Executor はリクエストと同じように、クエリキャッシュ（同じ SQL の結果をその間だけ覚えておく機能）の有効化や接続の返却をジョブの前後で行います。Sidekiq の5つのスレッドは同時に ActiveRecord を使うので、Sidekiq
            のプロセスの database.yml の max_connections は、スレッドの数以上にします（<ChapterLink n={15} section="pool" />
            ）。
          </p>
          <p>
            待ち時間を指定したジョブは、スケジュールのポーラーが schedule の ZSET から時刻の来たものを探してキューに戻します。ポーラーの間隔は、既定では平均5秒（プロセスの数に応じて調整）です
            <Ref n={4} />。デモでは、2秒後に実行するはずのジョブが、実際には約8秒後に実行されました。数秒の単位で正確な時刻に実行したい処理には向きません。
          </p>
        </>
      ),
    },
    {
      id: 'retry',
      title: '再試行と Dead',
      body: (
        <>
          <p>
            ジョブが例外を投げると、Sidekiq はジョブを ZSET の <code>retry</code> に入れ、時刻が来たらキューに戻します。待ち時間は (再試行の回数の4乗 + 15) 秒に揺らぎを足したもので、既定の25回を使い切るまでに約3週間かかります。使い切ったジョブは{' '}
            <code>dead</code> に入り、6か月後か件数が10,000件を超えたときに消えます
            <Ref n={5} />。
          </p>
          <Code
            lang="ruby"
            title="sidekiq: lib/sidekiq/job_retry.rb（202〜207行目、238行目）"
            href={`${SQ}/lib/sidekiq/job_retry.rb#L202-L238`}
            code={`
      jitter = rand(10 * (count + 1))
      retry_at = Time.now.to_f + delay + jitter
      payload = Sidekiq.dump_json(msg)
      redis do |conn|
        conn.zadd("retry", retry_at.to_s, payload)
      end

      delay = (count**4) + 15
`}
          />
          <p>
            ActiveJob にも <code>retry_on</code> があり、既定では3秒ずつ待って、最初の実行を含めて5回まで実行します（attempts は最初の実行を含む回数）。retry_on の再試行は、ActiveJob がジョブを新しく投入し直す（Sidekiq から見れば別のジョブになる）方式です。回数を使い切ると例外を投げ直すので、その後は
            Sidekiq の再試行が始まります。デモで、<code>retry_on RuntimeError, wait: 2.seconds, attempts: 3</code> のジョブと、<code>sidekiq_options retry: 1</code>{' '}
            のジョブを実行しました（ログを抜粋）。
          </p>
          <Code
            lang="text"
            code={`
10:08:11.485 RetryOnJob: RetryOnJob 実行 executions=1
10:08:11.488 RetryOnJob: Enqueued RetryOnJob (Job ID: b83f225c-…) to Sidekiq(default) at 2026-11-11 10:08:13 UTC
10:08:11.489 RetryOnJob: Retrying RetryOnJob (Job ID: b83f225c-…) after 1 attempts in 2 seconds, due to a RuntimeError (RetryOnJob の失敗).
10:08:21.863 RetryOnJob: RetryOnJob 実行 executions=2
10:08:28.531 RetryOnJob: RetryOnJob 実行 executions=3
10:08:28.531 RetryOnJob: Stopped retrying RetryOnJob (Job ID: b83f225c-…) due to a RuntimeError (RetryOnJob の失敗), which reoccurred on 3 attempts.
10:08:28.534 RetryOnJob elapsed=0.007: fail

10:08:11.482 FlakyJob: Error performing FlakyJob … RuntimeError (FlakyJob の失敗 n=1)
10:08:33.285 FlakyJob: Adding dead Sidekiq::ActiveJob::Wrapper job 577300360c7a2eb46caaf45e

== RetrySet
RetryOnJob retry_count=0 error=RuntimeError: RetryOnJob の失敗 次の実行まで -1秒
== DeadSet
FlakyJob retry=1 retry_count=1 error=RuntimeError: FlakyJob の失敗 n=1 入った時刻=10:08:33
`}
          />
          <p>
            RetryOnJob は ActiveJob の再試行で3回実行された後、Sidekiq の retry に入りました。ActiveJob の再試行は Hash の <code>executions</code> に回数を持ち、Sidekiq の再試行は{' '}
            <code>retry_count</code> に回数を持ちます。retry_on の回数を使い切った後も Sidekiq の再試行（既定 25 回、約3週間）が続くので、両方を使うと、実行の回数と期間がその分だけ増えます。どちらで回数を管理するかを決めておきます（図 28-4）。FlakyJob は、最初の失敗から約22秒後に再試行され、もう一度失敗して dead に入りました。
          </p>
          <Figure n="28-4" title="再試行の状態遷移" caption="activejob 8.1.4.1 の exceptions.rb と sidekiq 8.1.7 の job_retry.rb を読み、デモのログで確かめてまとめた模式図。">
            <RetryFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'direct',
      title: 'ActiveJob 経由と Sidekiq の直接利用',
      body: (
        <>
          <p>
            <code>include Sidekiq::Job</code> を書いたクラスは、ActiveJob を通らずに Sidekiq のジョブになります。Redis に入る JSON は ActiveJob の Hash を含まない分だけ小さくなりますが、引数は JSON
            の型に限られます。Sidekiq 8 の既定では、それ以外の型を渡すと投入の時点で例外になります
            <Ref n={6} />。
          </p>
          <Code
            lang="text"
            code={`
PlainJob.perform_async(1, { "mode" => "full" })   # 成功
PlainJob.perform_async(1, { mode: :full })        # ArgumentError: Job arguments to PlainJob must be native JSON types, but :mode is a Symbol.
PlainJob.perform_async(article, {})               # ArgumentError: Job arguments to PlainJob must be native JSON types, but #<Article …> is a Article.

{ "retry": true, "queue": "default", "args": [1, { "mode": "full" }], "class": "PlainJob", "jid": "adf4b1b87e1e654ec2088eb1", … }
`}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>ActiveJob 経由</th>
                  <th>Sidekiq::Job を直接</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>引数</td>
                  <td>ActiveRecord（GlobalID）、Symbol、Time などを変換して保存</td>
                  <td>JSON の型だけ（id を渡して perform の中で find する）</td>
                </tr>
                <tr>
                  <td>再試行</td>
                  <td>retry_on・discard_on と、Sidekiq の retry の二重</td>
                  <td>sidekiq_options の retry・sidekiq_retry_in</td>
                </tr>
                <tr>
                  <td>投入の時刻</td>
                  <td>enqueue_after_transaction_commit を使える</td>
                  <td>そのまま即座に投入（自分で after_commit に書く）</td>
                </tr>
                <tr>
                  <td>テスト</td>
                  <td>have_enqueued_job などの Active Job のマッチャー（<ChapterLink n={20} section="jobs-mail" />）</td>
                  <td>Sidekiq::Testing（fake・inline）</td>
                </tr>
                <tr>
                  <td>バックエンドの変更</td>
                  <td>アダプターの設定だけで Solid Queue などに移せる</td>
                  <td>ジョブのクラスを書き直す</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Sidekiq の gem の説明によると、ActiveJob のクラスにも <code>sidekiq_options retry: 3</code> のように Sidekiq の設定を書けます。デモの FlakyJob はこの書き方で retry を1にしました。
          </p>
        </>
      ),
    },
    {
      id: 'transaction',
      title: 'トランザクションと投入の時刻',
      body: (
        <>
          <p>
            デモでは1つのトランザクションで記事を2件作り、それぞれの記事を読むジョブを <code>perform_later</code> で登録しました。片方だけに「COMMIT の後で投入する」設定を付けています。
            Rails 側で2秒待ってから記事を確定すると、Sidekiq 側では次の結果になりました。
          </p>
          <Code
            lang="text"
            code={`
（Rails 側）
10:09:55.668 投入済み。2秒待ってから COMMIT
10:09:57.696 COMMIT ids={a: 10004, b: 10005}

（Sidekiq 側）
10:09:55.666 ArticleNoteJob: start
10:09:55.727 ArticleNoteJob: Error performing ArticleNoteJob … ActiveJob::DeserializationError
             (Error while trying to deserialize arguments: Couldn't find Article with 'id'="10004")
10:09:57.695 AfterCommitNoteJob: start
10:09:57.704 AfterCommitNoteJob: AfterCommitNoteJob 実行 article=10005
`}
          />
          <p>
            <code>ArticleNoteJob</code> は記事 10004 を見つけられず、引数を復元する段階で失敗しました。その時点では記事を作った側だけが変更を読めます（<ChapterLink n={38} section="isolation" />）。
            <code>AfterCommitNoteJob</code> は記事 10005 を読めています。2つの違いは、確定を待つ <code>self.enqueue_after_transaction_commit = true</code> を後者に指定したことです。
          </p>
          <p>
            次の図は、上のログの時刻を横軸に並べたものです。上の段が Rails のプロセス、下の段が Sidekiq のプロセスで、破線の枠が COMMIT までの期間です。ArticleNoteJob は枠の中で実行され、AfterCommitNoteJob は COMMIT の後に実行されています。
          </p>
          <Figure title="COMMIT の前と後に実行されたジョブ" caption="上のログの時刻をもとにした図。縦の矢印は、Redis への投入から Sidekiq が取り出すまでをまとめて描いている。BEGIN の時刻はログに無いので、枠の左端は時刻を表さない。">
            <CommitTimingFigure />
          </Figure>
          <Code
            lang="ruby"
            title="activejob/lib/active_job/enqueue_after_transaction_commit.rb（25〜47行目から抜粋）"
            href={`${GH}/activejob/lib/active_job/enqueue_after_transaction_commit.rb#L25-L47`}
            code={`
      def raw_enqueue
        if self.class.enqueue_after_transaction_commit
          self.successfully_enqueued = true
          deferred_scheduled_at = scheduled_at
          deferred_queue_name = queue_name
          deferred_priority = priority
          ActiveRecord.after_all_transactions_commit do
            ...
            super
          end
          self
        else
          super
        end
      end
`}
          />
          <p>
            コードの2つの <code>super</code> は、どちらもキューへの投入処理を呼びます。Rails 8.1 の既定値 <code>false</code> では、末尾の <code>else</code> からその場で呼びます。
            <code>true</code> では <code>super</code> が <code>after_all_transactions_commit</code> のブロックの中にあります。トランザクションが開いていれば確定後に実行され、取り消されれば実行されません。開いているトランザクションがなければ、その場で実行されます。<Ref n={7} />
          </p>
          <p>
            設定はジョブのクラスごとに決められます。記事を新規作成したときだけ実行したい処理なら、記事の <code>after_create_commit</code> からジョブを登録する方法もあります（<ChapterLink n={14} section="after-commit" />）。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 では、<code>enqueue_after_transaction_commit</code> は <code>:never</code>・<code>:always</code>・<code>:default</code> の3値で、<code>load_defaults 7.2</code>{' '}
              にすると <code>:default</code> になります。<code>:default</code> はアダプターの <code>enqueue_after_transaction_commit?</code> に従い、Sidekiq のアダプターは true
              を返すので、7.2 では COMMIT の後に投入されていました
              <Ref n={8} />。8.1 ではアプリケーション全体の設定と3値が削除され、アダプターの値も見なくなりました（activejob の 8.1.0 の CHANGELOG）。7.2 から 8.1 に上げると、明示していないジョブはトランザクションの中で即座に投入されるようになるので、ApplicationJob
              に <code>self.enqueue_after_transaction_commit = true</code> を書くかどうかを決めます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'idempotency',
      title: '再試行や停止に備える冪等性',
      body: (
        <>
          <p>
            Sidekiq はワーカーが停止すると、途中まで処理したジョブを再実行することがあります。操作を繰り返しても1回実行したときと同じ結果になる設計は <ChapterLink n={52} /> で扱います。デモでは20秒かかるジョブの実行中に Sidekiq を停止（TERM、タイムアウト5秒）し、再び起動しました。
          </p>
          <Code
            lang="text"
            code={`
10:09:05.026 jid=bb65ac649e53e9e9b6441026 class=LongJob: LongJob 開始 n=1 executions=1
10:09:05.477 Shutting down
10:09:05.978 Pausing to allow jobs to finish...
10:09:09.980 Terminating 1 busy threads
10:09:09.981 Pushed 1 jobs back to Redis
10:09:10.484 Bye!
（再起動）
10:09:16.444 jid=bb65ac649e53e9e9b6441026 class=LongJob: LongJob 開始 n=1 executions=1
`}
          />
          <p>
            タイムアウトまでに終わらなかったジョブは、途中で打ち切られて Redis のキューに戻され（fetch.rb の <code>bulk_requeue</code>）、再起動後に最初から実行されました。デプロイのたびに起きうることです。一方、BRPOP は取り出した要素をリストから削除し、戻す処理は正常な停止のときにしか実行されません。そのため、プロセスが
            SIGKILL などで強制終了されると、実行中のジョブは Redis に戻らず失われます。
          </p>
          <p>
            次の図は、実行中のジョブが停止の仕方でどうなるかを、左から右へ並べたものです。上の段はデモのログと同じ流れで、下の段は Sidekiq のタイムアウトより先に、コンテナやサービス管理側の停止猶予が切れた場合です。
          </p>
          <Figure title="停止の仕方と実行中のジョブ" caption="この節のデモのログと fetch.rb の bulk_requeue をもとにした模式図。タイムアウトまでにジョブが終わった場合は省略している。停止猶予は、コンテナやサービス管理側が強制終了するまでに待つ時間（「Sidekiq の停止・監視とキューの移行」の節）。">
            <ShutdownFigure />
          </Figure>
          <p>このため、ジョブは次のように書きます。</p>
          <ul>
            <li>2回実行されても結果が同じになるようにする（冪等にする）。例：状態を確かめてから処理する、送信済みであることを同じトランザクションで記録する、一意の索引（同じ値の行を2つ入れられないようにする索引）で二重登録を防ぐ</li>
            <li>外部の API への送信など、取り消せない処理は、ジョブを小さく分けて、送信の前後で状態を保存する</li>
            <li>処理時間の長いジョブは、Sidekiq の停止のタイムアウト（既定 25 秒）と、デプロイの手順の待ち時間を合わせる</li>
          </ul>
          <JobRetryFigure />
          <p>同じ処理が2回実行されても結果を変えない書き方は、<ChapterLink n={83} /> で原則として詳しく扱います。</p>
        </>
      ),
    },
    {
      id: 'solid-queue',
      title: 'Solid Queue との違い',
      body: (
        <>
          <p>
            Rails 8.0 から、新規のアプリケーションの本番環境の ActiveJob のアダプターは Solid Queue になりました
            <Ref n={9} />。Solid Queue はジョブをデータベースのテーブルに保存します。README によると、主に次の3種類のプロセスで動きます（定期実行のジョブを扱う scheduler もあります）
            <Ref n={10} />。
          </p>
          <ul>
            <li>ワーカー：solid_queue_ready_executions テーブルから実行可能なジョブを取り出して実行する</li>
            <li>ディスパッチャー：solid_queue_scheduled_executions から時刻の来たジョブを ready_executions に移す</li>
            <li>スーパーバイザー：ワーカーとディスパッチャーを起動し、各プロセスが動作中であることを定期的に記録するハートビートを監視する</li>
          </ul>
          <p>
            複数のワーカーが同じ行を取り合わないよう、取り出しには <code>FOR UPDATE SKIP LOCKED</code> を使います（<ChapterLink n={15} section="pessimistic" />
            ）。このため、MySQL 8 以上、PostgreSQL 9.5 以上で最も性能が出るとされています。ワーカーはテーブルを一定の間隔（既定 0.1 秒）で読みにいきます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>Sidekiq（OSS 版）</th>
                  <th>Solid Queue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>保存先</td>
                  <td>Redis</td>
                  <td>データベース（Rails 8 の既定では別のデータベース）</td>
                </tr>
                <tr>
                  <td>取り出し</td>
                  <td>BRPOP（ジョブが入ると即座）</td>
                  <td>SELECT … FOR UPDATE SKIP LOCKED を一定間隔で</td>
                </tr>
                <tr>
                  <td>自動の再試行</td>
                  <td>あり（25回、retry・dead）</td>
                  <td>無い。retry_on で指定し、失敗したジョブは solid_queue_failed_executions に残る</td>
                </tr>
                <tr>
                  <td>実行中にプロセスが落ちたジョブ</td>
                  <td>正常な停止なら Redis に戻す。強制終了では失われる（<ChapterLink n={18} section="idempotency">停止時の実測</ChapterLink>）</td>
                  <td>ハートビートが途絶えたプロセスのジョブを失敗として記録する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Solid Queue をアプリケーションと同じデータベースに置くと、ジョブの投入がアプリケーションのトランザクションに含まれます。ただし、ガイドは、後でデータベースを分けたときにこの性質が消えることを理由に、enqueue_after_transaction_commit
            を使うよう勧めています
            <Ref n={2} />。
          </p>
        </>
      ),
    },
    {
      id: 'queue-planning',
      title: "キューの分割・優先度・同時実行",
      body: (
        <>
          <p>
            購入確認メールと夜間集計を同じキューで処理すると、長い集計ジョブが順番を占める場合があります。<code>queue_as :mailers</code> のように用途で分け、配備時にどのワーカーがどのキューを処理するかを設定します。<code>MyJob.set(wait: 10.minutes).perform_later(...)</code> や <code>wait_until:</code> は最初に実行可能になる時刻を指定します。混雑時の実行開始は、その時刻より後になります。優先度を設定する API と、実際の順序を決めるバックエンドの設定を合わせて確認します。<Ref n={15} />
          </p>
          <p>
            Sidekiq のキューを選ぶには、利用する環境の <code>config.active_job.queue_adapter = :sidekiq</code> と、投入側の Web・コンソールと実行側の Sidekiq が同じキュー用 Redis を使うことを確かめます。<code>Sidekiq.configure_client</code> と <code>Sidekiq.configure_server</code> に対応する接続設定を渡します。キャッシュ用 Redis と共用するなら、これらのデータの寿命と破棄方針が違うことも確認します（<ChapterLink n={22} section="rails-cache">Redis の容量と削除方針</ChapterLink>）。<Ref n={16} /><Ref n={17} />
          </p>
          <p>
            Sidekiq の <code>config/sidekiq.yml</code> では、並行に動くスレッド数（<code>:concurrency</code>）と処理するキューを設定できます。起動は <code>bundle exec sidekiq -C config/sidekiq.yml</code> です。キューの並び順を指定するモードでは先頭に仕事があり続けると後続を待たせ、重みを指定するモードでは選ばれる傾向を変えます。急ぐキューに別プロセスを割り当てれば、他のキューの負荷から分けられます。設定したスレッドが同時に DB や接続先を使うことを考え、Puma 用と合わせて接続数を見積もります（<ChapterLink n={23} section="sizing">プロセスごとの接続数</ChapterLink>）。<Ref n={18} />
          </p>
          <p>
            Solid Queue は <code>bin/jobs</code> で起動できます。<code>config/queue.yml</code> のワーカーが取得するキューとプロセス・スレッド数、ディスパッチャーが予定時刻に達した仕事を配送する構成を見ます。<code>queue_with_priority</code> やジョブの <code>limits_concurrency</code> を使う場合は、ワーカーが処理するキューの順序と、同時実行を制限する単位も確かめます。DB バックエンドへ負荷が集まる構成では、アプリ用とキュー用の接続や DB の負荷を観測します。<Ref n={19} /><Ref n={15} />
          </p>
        </>
      ),
    },
    {
      id: 'recurring-jobs',
      title: "定期実行と、実行予定の監視",
      body: (
        <>
          <p>
            一回だけ未来に実行する予約と、毎日などの周期で新しい仕事を作る定期実行があります。Solid Queue では <code>config/recurring.yml</code> に環境、ジョブ、スケジュールを書けます。たとえば次は毎日午前2時に集計を投入する設定です。スケジューラーが動くプロセス、実行時刻のタイムゾーン、休日の扱いを配備先で確認します。<Ref n={19} />
          </p>
          <Code
            lang="yaml"
            title={"config/recurring.yml"}
            code={`
production:
  refresh_article_counts:
    class: RefreshArticleCountsJob
    schedule: every day at 2am
`}
          />
          <p>
            バックエンドを切り替えるときは、同じ時刻に旧・新の両方から出さないよう定期投入の責任を移します。 Solid Queue は同じタスクと時刻の組の投入を DB の一意索引で制御します。投入と、実行される処理の冪等性は別の保証です。<code>command:</code> で定期作業を指定することもできますが、テストや再実行が必要なら独立したジョブクラスにできます。Rails の Mission Control – Jobs のような管理画面を使う場合も、投入予定時刻と実際の開始・終了を区別して、止まった場合を見つけられるようにします。集計などの手順は、同じ日付でやり直せる形にしておけます。<Ref n={15} /><Ref n={19} /><Ref n={26} />
          </p>
        </>
      ),
    },
    {
      id: 'job-operations',
      title: "Sidekiq の停止・監視とキューの移行",
      body: (
        <>
          <p>
            ジョブワーカーを更新するときは、まず Sidekiq のプロセスに <code>TSTP</code> を送り、新しい仕事の取り出しを止めます。後で <code>TERM</code> で停止を要求し、処理中のジョブに終了の猶予を与えます。終了期限までに終わらない仕事は再実行されることがあるので、ジョブの更新を冪等にします。コンテナやサービス管理側の停止猶予を、Sidekiq の終了設定より先に使い切らないように揃えます。Web の Puma と、ジョブのワーカーの停止は別々に管理します（<ChapterLink n={23} section="ruby-upgrade">Ruby とプロセスの更新</ChapterLink>）。<Ref n={20} />
          </p>
          <p>
            Sidekiq Web は処理件数、キューの長さ、予定・再試行・失敗の集合を確認できる管理画面です。管理者用に認証・認可を付けます。件数と併せて、最も古いジョブがどれだけ待っているか、再試行が増えた時刻、特定の依存先のエラーがないかを見ます。失敗が解消してから再投入し、必要なら <code>sidekiq_retries_exhausted</code> や死んだジョブを扱うフックで通知できます。 <code>death_handlers</code> は全ジョブに共通の通知などに使えます。通知経路の故障も想定し、実行しなくなったジョブを監視します。<Ref n={21} /><Ref n={22} />
          </p>
          <p>
            Sidekiq の再試行設定では、<code>retry: false</code> は失敗後に再試行せず、失敗を Dead にも積みません。<code>retry: 0</code> なら再試行なしで Dead に移し、<code>dead: false</code> は再試行し尽くした仕事を Dead に保管しない指定です。失敗を後から直す必要がある処理では、どの設定で調査できる情報が残るかを確認します。強制終了やメモリー不足で停止すると、通常の取得方式では取り出した仕事がキューへ戻らない場合があります。クラス変数など複数スレッドで共有する状態に、ジョブごとの入力を置かないようにします。<Ref n={22} /><Ref n={23} />
          </p>
          <p>
            古いコードでは <code>Sidekiq::Worker</code> という名称にも出会います。採用時は gem・契約ごとの機能を確認します。たとえば定期投入に sidekiq-cron、重複投入の抑止に sidekiq-unique-jobs があり、Sidekiq Pro の信頼性機能・Batches や Enterprise の一意ジョブ・頻度制限も選択肢です。キューで重複を制限する機能があっても、外部決済やメールなど実行先に重複が起きた場合の業務上の扱いを決めます。<Ref n={23} /><Ref n={24} /><Ref n={25} />
          </p>
          <p>
            Sidekiq と Solid Queue の間で Active Job のアダプターを替えても、保存済みのキューや予定済みのジョブは元のストアにあります。新版で新しいアダプターのワーカーと DB を用意し、新規投入先を切り替えて、旧ワーカーで残りを処理する順を検討します。予定・再試行・失敗ジョブをどう扱うかも決めます。直接 <code>perform_async</code> する箇所や Sidekiq 固有のオプション、定期投入を走らせる場所は別途見直します。切り戻すときも両方のキューに残る仕事を確認します。<Ref n={17} /><Ref n={19} />
          </p>
          <p>Sidekiq の管理画面では、実行待ちの長さに加えて最古のジョブの待ち時間、Scheduled、Retry、Dead の増減を見ます。Ruby からも <code>require "sidekiq/api"</code> の後に <code>Sidekiq::RetrySet.new.size</code> などで調べられます。基本の取り出し方式と、有償版の super_fetch が用いる回復機構では、ワーカー異常終了後にジョブを回収できる条件が異なります。使っている版と設定に合わせて停止時の試験を行います。</p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>perform_now はその場で実行し、perform_later はキューに入れてすぐに戻ります。時間のかかる処理を perform_later にすると、応答を待たせずに済みます。</li>
          <li>キューは入れた順に取り出す置き場所で、ワーカーが取り出して実行します。キューを Redis に置くと、どのプロセスからも入れられ、入れたプロセスが終わっても残ります。</li>
          <li>ジョブは ApplicationJob を継承したクラスに perform を書きます。実行する Sidekiq のプロセスが動いていなければ、ジョブはキューに残ります。</li>
          <li>ActiveJob は引数を JSON に変換し、ActiveRecord のオブジェクトは GlobalID で保存します。実行時にレコードを読み直すので、削除されていれば DeserializationError になります。</li>
          <li>Sidekiq のアダプターは ActiveJob の Hash を Wrapper のジョブに包み、Redis のリストに入れます。Sidekiq のスレッドが BRPOP で取り出し、Executor の中で perform を呼びます。</li>
          <li>待ち時間付きのジョブと再試行は ZSET に入り、ポーラーが平均5秒ごとにキューへ戻します。</li>
          <li>Sidekiq の再試行は25回（約3週間）で、使い切ると dead に入ります。retry_on と併用すると、retry_on の回数を使い切った後に Sidekiq の再試行が続きます。</li>
          <li>トランザクションの中で投入したジョブは COMMIT 前に実行されることがあります。8.1 では enqueue_after_transaction_commit をジョブのクラスで指定します。</li>
          <li>停止や再試行で同じジョブが再実行されるので、ジョブは冪等に書きます。</li>
          <li>Solid Queue はデータベースと SKIP LOCKED を使い、自動の再試行はありません。</li>
          <li>各ワーカーが読むキューとその順序を設定し、定期実行は投入予定と実際の開始・終了を確かめます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'activejob/lib/active_job/core.rb・arguments.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/arguments.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'serialize の Hash、_aj_globalid・_aj_serialized・_aj_ruby2_keywords による引数の変換。' },
    { title: 'Active Job Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_job_basics.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'retry_on・discard_on、削除されたレコードの DeserializationError、Solid Queue とトランザクション、enqueue_after_transaction_commit の推奨。' },
    { title: 'sidekiq: lib/sidekiq/fetch.rb・processor.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: `${SQ}/lib/sidekiq/fetch.rb`, accessed: '2026-11-11', version: 'Sidekiq 8.1.7', note: 'BRPOP による取り出し、停止時の bulk_requeue、既定のスレッド数 5（config.rb）。' },
    { title: 'sidekiq: lib/sidekiq/scheduled.rb・config.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: `${SQ}/lib/sidekiq/scheduled.rb`, accessed: '2026-11-11', version: 'Sidekiq 8.1.7', note: 'schedule・retry の ZSET を読むポーラーと、平均の間隔 average_scheduled_poll_interval（既定 5 秒）。' },
    { title: 'sidekiq: lib/sidekiq/job_retry.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: `${SQ}/lib/sidekiq/job_retry.rb`, accessed: '2026-11-11', version: 'Sidekiq 8.1.7', note: '既定 25 回（約3週間）、待ち時間 (count**4)+15 と揺らぎ、Dead Job Queue と 6 か月の保持（dead_max_jobs 10,000）。' },
    { title: 'sidekiq: lib/sidekiq/job_util.rb・config.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: `${SQ}/lib/sidekiq/job_util.rb`, accessed: '2026-11-11', version: 'Sidekiq 8.1.7', note: 'on_complex_arguments の既定が :raise で、JSON の型以外の引数を投入時に拒否すること。' },
    { title: 'activejob/lib/active_job/enqueue_after_transaction_commit.rb・enqueuing.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/enqueue_after_transaction_commit.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'after_all_transactions_commit への投入の先送りと、クラス属性の既定値 false。' },
    { title: 'activejob/lib/active_job/enqueue_after_transaction_commit.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/activejob/lib/active_job/enqueue_after_transaction_commit.rb', accessed: '2026-11-11', version: 'Rails 7.2.4', note: ':always・:never・:default の分岐と、:default でアダプターの enqueue_after_transaction_commit? に従うこと。' },
    { title: 'railties CHANGELOG（8.0.0）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v8.0.0/railties/CHANGELOG.md', accessed: '2026-11-11', version: 'Rails 8.0.0', note: '本番環境の Active Job のバックエンドの既定を Solid Queue にしたこと。' },
    { title: 'Solid Queue README', publisher: 'rails/solid_queue（GitHub）', url: 'https://github.com/rails/solid_queue/blob/v1.7.2/README.md', accessed: '2026-11-11', version: 'Solid Queue 1.7.2', note: 'ワーカー・ディスパッチャー・スーパーバイザー、FOR UPDATE SKIP LOCKED、自動の再試行が無いこと、ハートビートの途絶えたプロセスのジョブの扱い。' },
    { title: 'class Thread::Queue', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Thread/Queue.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: '先に入れたものから取り出すキューであること、空のときの pop が待つこと、close。実行例は Ruby 4.0.9 で実測。' },
    { title: 'Data structure store（Redis の概要）', publisher: 'Redis', url: 'https://redis.io/docs/latest/develop/get-started/', accessed: '2026-11-16', version: 'Redis 8', note: 'Redis がメモリーにデータを置くデータ構造のサーバーであること。' },
    { title: 'Redis lists', publisher: 'Redis', url: 'https://redis.io/docs/latest/develop/data-types/lists/', accessed: '2026-11-16', version: 'Redis 8', note: 'LPUSH と RPOP でリストを先入れ先出しのキューとして使うこと、バックグラウンドのワーカーのキューに使うこと。redis-cli の実行例は Redis 8.10.3 で実測。' },
    { title: 'BRPOP', publisher: 'Redis', url: 'https://redis.io/docs/latest/commands/brpop/', accessed: '2026-11-16', version: 'Redis 8', note: 'RPOP の待つ版で、リストが空なら要素が入るまで接続を待たせること。' },
    { title: "Active Job Basics", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_job_basics.html", accessed: "2026-11-20", version: "Rails 8.1", note: "ジョブの設定、キュー、再試行、定期実行。" },
    { title: "Sidekiq Using Redis", publisher: "sidekiq/sidekiq", url: "https://github.com/sidekiq/sidekiq/wiki/Using-Redis", accessed: "2026-11-20", note: "クライアントとサーバーの接続、キャッシュとキューの分離。" },
    { title: "Sidekiq Active Job", publisher: "sidekiq/sidekiq", url: "https://github.com/sidekiq/sidekiq/wiki/Active-Job", accessed: "2026-11-20", note: "Sidekiq と Active Job の連携と違い。" },
    { title: "Sidekiq Advanced Options", publisher: "sidekiq/sidekiq", url: "https://github.com/sidekiq/sidekiq/wiki/Advanced-Options", accessed: "2026-11-20", note: "設定ファイル、同時実行、キュー順序と重み。" },
    { title: "Solid Queue", publisher: "rails/solid_queue", url: "https://github.com/rails/solid_queue", accessed: "2026-11-20", note: "ワーカー、ディスパッチャー、スケジューラー、優先度・同時実行と定期実行。" },
    { title: "Sidekiq Deployment", publisher: "sidekiq/sidekiq", url: "https://github.com/sidekiq/sidekiq/wiki/Deployment", accessed: "2026-11-20", note: "TSTP、TERM と立ち上げ・停止の順。" },
    { title: "Sidekiq Monitoring", publisher: "sidekiq/sidekiq", url: "https://github.com/sidekiq/sidekiq/wiki/Monitoring", accessed: "2026-11-20", note: "管理画面と処理・待ち時間の計測。" },
    { title: "Sidekiq Error Handling", publisher: "sidekiq/sidekiq", url: "https://github.com/sidekiq/sidekiq/wiki/Error-Handling", accessed: "2026-11-20", note: "再試行と使い切った場合のフック。" },
    { title: "Sidekiq Reliability", publisher: "sidekiq/sidekiq", url: "https://github.com/sidekiq/sidekiq/wiki/Reliability", accessed: "2026-11-20", note: "通常のフェッチと、Pro の障害耐性オプション。" },
    { title: "Sidekiq Enterprise Unique Jobs", publisher: "sidekiq/sidekiq", url: "https://github.com/sidekiq/sidekiq/wiki/Ent-Unique-Jobs", accessed: "2026-11-20", note: "一意のジョブの単位、有効期限と挙動。" },
    { title: "Sidekiq-Cron", publisher: "sidekiq-cron/sidekiq-cron", url: "https://github.com/sidekiq-cron/sidekiq-cron", accessed: "2026-11-20", note: "定期実行に使う Sidekiq 向けの拡張。" },
    { title: "Mission Control – Jobs", publisher: "rails/mission_control-jobs", url: "https://github.com/rails/mission_control-jobs", accessed: "2026-11-20", note: "対応アダプターとジョブの管理画面。" },
  ],
}

export default withExplanations(ch18, explanation18)
