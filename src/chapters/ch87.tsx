import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 68-1 再設定のメールとクーポンの照合で数える処理と、問題が起きる箇所 ---------- */
const throttleRows = [
  { code: 'ip = request.remote_ip', policy: true, mech: false },
  { code: 'return if ip.start_with?("10.0.")', policy: true, mech: false },
  { code: 'key = "reset-ip:#{ip}"', policy: false, mech: true },
  { code: 'count = Rails.cache.read(key).to_i + 1', policy: false, mech: true },
  { code: 'Rails.cache.write(key, count, expires_in: 3.minutes)', policy: true, mech: true },
  { code: 'head :too_many_requests if count > 10', policy: true, mech: true },
]

function SceneFigure() {
  const rowY = (i: number) => 84 + i * 28
  return (
    <Svg
      id="68-1"
      w={780}
      h={430}
      label="直す前の PasswordResetsController の throttle メソッドの6行を、方針の行と仕組みの行に印を付けて並べた。数える対象の IP を取る行と社内のネットワークを除く行は方針、キーを作る行と Rails.cache から読む行は仕組み、3分の期限を付けて書く行と10回を超えたら 429 を返す行は、方針と仕組みが1行に混ざっている。CouponChecksController はこの数える処理を書き写し、キーと10分・5回を書き換えている。どちらも Rails.cache に読み書きする。上限の数を変えるにも数える処理の行を開いて直すこと、write のたびに期限を付け直すこと、数え方の誤りが2つのコントローラーの両方にあることが問題になる"
    >
      <Box x={20} y={12} w={740} h={30} lines="PasswordResetsController#throttle（直す前）" fs={12} bold mono />
      <T x={40} y={62} fs={11} tone="muted">
        メソッドの中の行
      </T>
      <T x={560} y={62} fs={11} anchor="middle" tone="acc" bold>
        方針
      </T>
      <T x={620} y={62} fs={11} anchor="middle" bold>
        仕組み
      </T>
      <rect x={20} y={48} width={740} height={194} rx={6} fill="none" stroke="var(--fig-line)" />
      {throttleRows.map((r, i) => (
        <g key={r.code}>
          {i > 0 && <line x1={30} y1={rowY(i) - 14} x2={750} y2={rowY(i) - 14} stroke="var(--fig-line)" strokeOpacity={0.25} />}
          <T x={40} y={rowY(i)} fs={12} mono>
            {r.code}
          </T>
          {r.policy && (
            <T x={560} y={rowY(i)} anchor="middle" tone="acc">
              ●
            </T>
          )}
          {r.mech && (
            <T x={620} y={rowY(i)} anchor="middle">
              ●
            </T>
          )}
          {r.policy && r.mech && (
            <T x={652} y={rowY(i)} fs={11} tone="danger">
              1行に両方
            </T>
          )}
        </g>
      ))}
      <Box x={40} y={290} w={330} h={50} lines={['CouponChecksController#throttle', '同じ行を写し、キー・10分・5回を書き換え']} fs={12} bold subTone="muted" />
      <Arrow x1={205} y1={242} x2={205} y2={288} dashed />
      <T x={213} y={265} fs={11} tone="muted">
        書き写し
      </T>
      <Box x={470} y={290} w={290} h={50} lines={['Rails.cache', 'テストは MemoryStore、本番は Solid Cache など']} fs={12} bold fill="box4" subTone="muted" />
      <Arrow x1={615} y1={242} x2={615} y2={288} />
      <T x={623} y={265} fs={11} tone="muted">
        read・write
      </T>
      <Arrow x1={370} y1={315} x2={468} y2={315} />
      <T x={20} y={362} fs={12} tone="danger">
        ・上限の数（10回・5回）を変えるにも、read と write の行の間を読んで直す
      </T>
      <T x={20} y={384} fs={12} tone="danger">
        ・write のたびに expires_in を付け直すので、要求が続くと数が減らない（図 68-2）
      </T>
      <T x={20} y={406} fs={12} tone="danger">
        ・数え方の誤りは書き写した2つのコントローラーの両方にある
      </T>
    </Svg>
  )
}

/* ---------- 図 68-2 40分おきの要求で、数と期限がどう変わるか ---------- */
const timelineRows = [
  { t: '0分', before: ['1', '60分まで', '202'], after: ['1', '60分まで', '202'] },
  { t: '40分', before: ['2', '100分まで', '202'], after: ['2', '60分まで', '202'] },
  { t: '80分', before: ['3', '140分まで', '202'], after: ['1', '140分まで', '202'] },
  { t: '120分', before: ['4', '180分まで', '429'], after: ['2', '140分まで', '202'] },
  { t: '160分', before: ['5', '220分まで', '429'], after: ['1', '220分まで', '202'] },
]

function TimelineFigure() {
  const rowY = (i: number) => 106 + i * 50
  const beforeX = [150, 220, 340]
  const afterX = [460, 530, 650]
  const widths = [60, 110, 80]
  return (
    <Svg
      id="68-2"
      w={780}
      h={402}
      label="同じメールアドレスで40分おきに5回、パスワードの再設定を求めたときの、数と期限と応答。上限は1時間に3回。直す前のコードは write のたびに期限を60分後に付け直すので、数は1、2、3、4、5と増え続け、120分と160分の要求は 429 になった。rate_limit は最初の1回で期限を決め、期限が切れたら1から数え直すので、数は1、2、1、2、1となり、すべて 202 になった"
    >
      <Box x={140} y={10} w={300} h={30} lines="直す前（write のたびに期限を延ばす）" fs={12} bold />
      <Box x={450} y={10} w={290} h={30} lines="rate_limit（最初の1回から1時間）" fs={12} bold fill="box5" />
      {['数', '期限', '応答'].map((h, c) => (
        <g key={h}>
          <T x={beforeX[c] + widths[c] / 2} y={60} anchor="middle" fs={11} tone="muted">
            {h}
          </T>
          <T x={afterX[c] + widths[c] / 2} y={60} anchor="middle" fs={11} tone="muted">
            {h}
          </T>
        </g>
      ))}
      <T x={40} y={60} fs={11} tone="muted" anchor="middle">
        時刻
      </T>
      <Arrow x1={40} y1={76} x2={40} y2={330} />
      {timelineRows.map((r, i) => (
        <g key={r.t}>
          <line x1={34} y1={rowY(i)} x2={46} y2={rowY(i)} stroke="var(--fig-line)" />
          <T x={56} y={rowY(i)} fs={12}>
            {r.t}
          </T>
          <T x={100} y={rowY(i)} fs={11} tone="muted">
            要求
          </T>
          {r.before.map((v, c) => (
            <g key={`b-${c}`}>
              <Box x={beforeX[c]} y={rowY(i) - 15} w={widths[c]} h={30} fill={c === 2 && v === '429' ? 'box5' : 'bg'} rx={4} />
              <T x={beforeX[c] + widths[c] / 2} y={rowY(i)} anchor="middle" fs={12} tone={c === 2 && v === '429' ? 'danger' : undefined} bold={c === 2 && v === '429'}>
                {v}
              </T>
            </g>
          ))}
          {r.after.map((v, c) => (
            <g key={`a-${c}`}>
              <Box x={afterX[c]} y={rowY(i) - 15} w={widths[c]} h={30} fill="bg" rx={4} />
              <T x={afterX[c] + widths[c] / 2} y={rowY(i)} anchor="middle" fs={12} tone={c === 0 && v === '1' && i > 0 ? 'acc' : undefined}>
                {v}
              </T>
            </g>
          ))}
        </g>
      ))}
      <T x={735} y={rowY(2)} fs={10} tone="acc">
        期限切れ
      </T>
      <T x={20} y={358} fs={12} tone="danger">
        上限は1時間に3回。どの1時間をとっても要求は2回なのに、直す前のコードは4回目から断った
      </T>
      <T x={20} y={384} fs={11} tone="muted">
        時刻は最初の要求からの経過。spec の「40分おきに送る会員」の結果。青い 1 は、期限が切れて1から数え直したところ
      </T>
    </Svg>
  )
}

/* ---------- 図 68-3 Hydra の方針モジュールと KMPS、この章のコード ---------- */
const policyModules = [
  { x: 20, lines: ['方針モジュール A', 'タイムシェアリング'] },
  { x: 175, lines: ['方針モジュール B', 'バッチの処理'] },
  { x: 330, lines: ['方針モジュール C', 'デバッグ中'] },
]

function HydraFigure() {
  return (
    <Svg
      id="68-3"
      w={780}
      h={410}
      label="左は Hydra の構成。利用者のレベルに方針モジュールが3つあり、それぞれがタイムシェアリング、バッチの処理、デバッグ中の方針を持つ。方針モジュールは、優先度、使えるプロセッサー、時間の割り当て、ページの数の上限をパラメーターとして KMPS に設定し、プロセスを開始する。カーネルの KMPS はパラメーターに従ってプロセスを切り替え、方針どうしを公平に調停し、プロセスが止まると方針モジュールに知らせる。KMPS は C.mmp のプロセッサーを使う。右はこの章のコードの対応。コントローラーの rate_limit の宣言が方針で、to・within・by を渡す。ActionController::RateLimiting が仕組みで、キーを作って数え、超えたら with を呼ぶ。数はキャッシュのストアに保存する"
    >
      <T x={20} y={16} fs={12} bold>
        Hydra（Levin ほか 1975）
      </T>
      <T x={510} y={16} fs={12} bold>
        この章のコード
      </T>
      <T x={20} y={40} fs={11} tone="muted">
        利用者のレベル（方針）
      </T>
      {policyModules.map((m) => (
        <g key={m.x}>
          <Box x={m.x} y={52} w={140} h={46} lines={m.lines} fs={12} bold subTone="muted" />
          <Arrow x1={m.x + 55} y1={98} x2={m.x + 55} y2={196} />
          <Arrow x1={m.x + 95} y1={196} x2={m.x + 95} y2={98} dashed />
        </g>
      ))}
      <Box x={20} y={110} w={450} h={60} dashed fill="bg" lines={['パラメーター（SETPCB）：優先度・使えるプロセッサー・', '時間の割り当て・ページの数の上限。START・STOP']} fs={11} />
      <T x={20} y={184} fs={11} tone="muted">
        カーネル（仕組み）
      </T>
      <Box x={20} y={198} w={450} h={60} fill="box5" lines={['KMPS（Kernel Multiprocessing System）', 'パラメーターに従ってプロセスを切り替え、方針どうしを公平に調停する']} fs={12} bold subTone="muted" />
      <T x={480} y={150} fs={10} tone="muted">
        破線：停止の知らせ
      </T>
      <Arrow x1={245} y1={258} x2={245} y2={292} />
      <Box x={20} y={294} w={450} h={40} fill="box4" lines="C.mmp のプロセッサー（16台まで）" fs={12} />
      <line x1={495} y1={30} x2={495} y2={340} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <Box x={510} y={52} w={250} h={58} lines={['コントローラーの宣言（方針）', 'rate_limit to: 3, within: 1.hour,', 'by: :requested_email']} fs={11} bold subTone="acc" />
      <Arrow x1={635} y1={110} x2={635} y2={196} />
      <T x={643} y={152} fs={11} tone="muted">
        パラメーター
      </T>
      <Box x={510} y={198} w={250} h={60} fill="box5" lines={['ActionController::RateLimiting', 'キーを作って数え、', '超えたら with を呼ぶ']} fs={12} bold subTone="muted" />
      <Arrow x1={635} y1={258} x2={635} y2={292} />
      <Box x={510} y={294} w={250} h={40} fill="box4" lines="キャッシュのストア" fs={12} />
      <T x={20} y={364} fs={12}>
        どちらも、方針は外側のコードがパラメーターとして渡し、仕組みはそのパラメーターに従って動く。
      </T>
      <T x={20} y={388} fs={11} tone="muted">
        プロセッサーの台数は Wulf ほか（1974）による。KMPS のパラメーターと停止の知らせは Levin ほか（1975）の2節による
      </T>
    </Svg>
  )
}

/* ---------- 図 68-5 直す前と後：方針を変えるときに開く場所 ---------- */
function CompareFigure() {
  return (
    <Svg
      id="68-5"
      w={780}
      h={420}
      label="左は直す前。PasswordResetsController と CouponChecksController の throttle メソッドが、方針と数える仕組みを両方持ち、どちらも Rails.cache を読み書きする。上限の変更では throttle の中を直し、メールアドレスの制限を足すときは数える処理を写して11行足し5行消した。右は直した後。2つのコントローラーには rate_limit の宣言（方針）だけがあり、ActionController::RateLimiting がキーを作って increment で数え、超えたら with を呼ぶ。数はキャッシュのストアに保存し、ストアは環境ごとの設定で選ぶ。上限の変更は宣言の1行、数える場所の変更は環境の設定で済む"
    >
      <T x={20} y={16} fs={13} bold>
        直す前
      </T>
      <T x={410} y={16} fs={13} bold>
        直した後
      </T>
      <Box x={20} y={34} w={360} h={58} lines={['PasswordResetsController', 'throttle：方針と仕組みが混ざった15行']} fs={12} bold subTone="danger" />
      <Box x={20} y={108} w={360} h={58} lines={['CouponChecksController', 'throttle：方針と仕組みが混ざった6行']} fs={12} bold subTone="danger" />
      <Arrow x1={110} y1={166} x2={110} y2={254} />
      <Arrow x1={290} y1={92} d="M 380 63 C 400 63 400 270 300 270" />
      <Box x={20} y={256} w={280} h={44} fill="box4" lines="Rails.cache（read と write）" fs={12} />
      <Box x={410} y={34} w={350} h={58} lines={['PasswordResetsController', 'rate_limit の宣言2行（方針だけ）']} fs={12} bold subTone="acc" />
      <Box x={410} y={108} w={350} h={58} lines={['CouponChecksController', 'rate_limit の宣言1行（方針だけ）']} fs={12} bold subTone="acc" />
      <Box x={410} y={184} w={350} h={58} fill="box5" lines={['ActionController::RateLimiting（Rails）', 'キーを作り increment で数え、超えたら with']} fs={12} bold subTone="muted" />
      <Arrow x1={740} y1={92} d="M 760 63 C 776 63 776 213 762 213" />
      <Arrow x1={585} y1={166} x2={585} y2={182} />
      <Arrow x1={585} y1={242} x2={585} y2={254} />
      <Box x={410} y={256} w={350} h={44} fill="box4" lines={['キャッシュのストア', 'config/environments/*.rb の cache_store で選ぶ']} fs={12} subTone="muted" />
      <line x1={395} y1={10} x2={395} y2={310} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={20} y={330} fs={12} bold>
        変更の依頼と、直す場所
      </T>
      <T x={20} y={354} fs={12} tone="danger">
        上限を変える：throttle の中の数字
      </T>
      <T x={410} y={354} fs={12} tone="acc">
        上限を変える：宣言の1行
      </T>
      <T x={20} y={378} fs={12} tone="danger">
        対象を足す：数える処理を写す（11行追加・5行削除）
      </T>
      <T x={410} y={378} fs={12} tone="acc">
        対象を足す：宣言を1行足す
      </T>
      <T x={20} y={402} fs={12} tone="danger">
        数え方を直す：書き写した2か所を直す
      </T>
      <T x={410} y={402} fs={12} tone="acc">
        数える場所を変える：環境の設定
      </T>
    </Svg>
  )
}

/* ---------- 図 68-7 方針をどこまで切り離すかの目安 ---------- */
const judgeCells = [
  { x: 120, y: 40, fill: 'box5' as const, lines: ['仕組みを1か所にまとめ、', '方針は宣言の行に書く', '（この章の rate_limit）'], tone: 'acc' as const },
  { x: 450, y: 40, fill: 'box4' as const, lines: ['方針をデータとして持つ', '（管理画面・DB の表）', '単位の検証とテストを足す'], tone: undefined },
  { x: 120, y: 190, fill: 'box' as const, lines: ['その場に書いてよい', '2つ目の方針が来てから', '仕組みを取り出す'], tone: undefined },
  { x: 450, y: 190, fill: 'box' as const, lines: ['値だけを外に出す', '（環境変数・credentials・', 'config_for）'], tone: undefined },
]

function JudgeFigure() {
  return (
    <Svg
      id="68-7"
      w={780}
      h={400}
      label="横軸は、方針を変える人と時期。左は開発者がコードと一緒に変える、右は開発者以外がデプロイせずに変える。縦軸は、同じ仕組みを使う方針の数。下は1つ、上は複数。左上は、仕組みを1か所にまとめ方針は宣言の行に書く（この章の rate_limit）。右上は、方針をデータとして持ち、単位の検証とテストを足す。左下は、その場に書いてよく、2つ目の方針が来てから仕組みを取り出す。右下は、値だけを環境変数・credentials・config_for に出す。この節の YAML は、開発者だけが変えデプロイも要る左上の場所に、右上の作りを持ち込んだもの"
    >
      <Arrow x1={100} y1={340} x2={770} y2={340} />
      <Arrow x1={100} y1={340} x2={100} y2={24} />
      <T x={440} y={362} anchor="middle" fs={12}>
        方針を変える人と時期
      </T>
      <T x={120} y={384} fs={11} tone="muted">
        開発者がコードと一緒に変える
      </T>
      <T x={770} y={384} fs={11} tone="muted" anchor="end">
        開発者以外がデプロイせずに変える
      </T>
      <T x={14} y={110} fs={12}>
        同じ仕組み
      </T>
      <T x={14} y={128} fs={12}>
        を使う方針
      </T>
      <T x={14} y={60} fs={11} tone="muted">
        複数
      </T>
      <T x={14} y={300} fs={11} tone="muted">
        1つ
      </T>
      {judgeCells.map((c) => (
        <Box key={`${c.x}-${c.y}`} x={c.x} y={c.y} w={310} h={120} fill={c.fill} lines={c.lines} fs={13} bold subTone={c.tone ?? 'muted'} />
      ))}
      <circle cx={400} cy={150} r={7} fill="var(--fig-danger)" />
      <Arrow x1={398} y1={146} x2={448} y2={110} dashed />
      <T x={300} y={174} fs={11} tone="danger">
        この節の YAML：左上の場所に
      </T>
      <T x={300} y={174 + 16} fs={11} tone="danger">
        右上の作りを持ち込んだ
      </T>
    </Svg>
  )
}

/* ---------- 図 68-8 rate_limit・Pundit・retry_on の方針と仕組み ---------- */
const railsRows = [
  {
    name: 'rate_limit',
    policy: ['rate_limit to: 3, within: 1.hour,', '  by: :requested_email'],
    mech: ['キーを作って increment で数え、', '上限を超えたら with を呼ぶ'],
  },
  {
    name: 'Pundit',
    policy: ['class OrderPolicy < ApplicationPolicy', '  def update? = record.member == user'],
    mech: ['authorize がポリシーのクラスを探して呼び、', 'false なら NotAuthorizedError'],
  },
  {
    name: 'retry_on',
    policy: ['retry_on Timeout::Error,', '  wait: :polynomially_longer, attempts: 10'],
    mech: ['rescue_from で受けて実行の回数を数え、', '待ち時間を計算してジョブを入れ直す'],
  },
]

function RailsFigure() {
  const rowY = (i: number) => 52 + i * 92
  return (
    <Svg
      id="68-8"
      w={780}
      h={346}
      label="Rails と gem の3つの機能を、アプリが書く方針と、Rails や gem が持つ仕組みに分けた。rate_limit は、アプリが to・within・by を宣言し、Rails がキーを作って increment で数え、上限を超えたら with を呼ぶ。Pundit は、アプリがポリシーのクラスに update? などの判断を書き、authorize がポリシーのクラスを探して呼び、false なら NotAuthorizedError を発生させる。retry_on は、アプリが例外の種類・待ち方・回数を宣言し、Active Job が rescue_from で受けて実行の回数を数え、待ち時間を計算してジョブを入れ直す"
    >
      <T x={110} y={22} fs={12} bold tone="acc">
        方針（アプリが書く）
      </T>
      <T x={478} y={22} fs={12} bold>
        仕組み（Rails・gem が持つ）
      </T>
      {railsRows.map((r, i) => (
        <g key={r.name}>
          <T x={14} y={rowY(i) + 32} fs={12} bold>
            {r.name}
          </T>
          <Box x={100} y={rowY(i)} w={340} h={64} lines={r.policy} fs={11} mono align="start" />
          <Arrow x1={440} y1={rowY(i) + 32} x2={466} y2={rowY(i) + 32} />
          <Box x={468} y={rowY(i)} w={300} h={64} fill="box5" lines={r.mech} fs={12} />
        </g>
      ))}
      <T x={14} y={334} fs={11} tone="muted">
        Pundit の例は、Pundit 2.5.2 の README の書き方に合わせた模式。retry_on の例は Active Job のソースのコメントにある例を短くしたもの
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 87,
  part: 8,
  title: 'Separation of Policy and Mechanism：レート制限の回数と、数える仕組みを分ける',
  summary:
    'パスワードの再設定とクーポンの照合に、回数の上限を数える処理を手で書いたために、上限を変えるたびに数える処理の中を直し、足した制限で数え方の誤りが表に出る場面から始めます。Hydra の1975年の論文で方針と仕組みの分離の定義を確かめ、Rails 8.1 の rate_limit に数える仕組みを任せて、方針を宣言の行に集めます。最後に、方針を YAML に出して汎用の仕組みを自作したときの問題と、Pundit・retry_on に見る方針と仕組みの分け方を扱います。',
  goals: [
    'レート制限のコードの各行を、方針（何を・何回まで・超えたらどうするか）と仕組み（どう数えるか）に分けられる',
    'Levin らの1975年の論文が述べた方針と仕組みの分離と、パラメーターを持つ方針（parameterized policy）の考え方を説明できる',
    'rate_limit の to・within・by・with・name・store の役割と、キャッシュのストアごとの数え方の違い（null_store では数えない）を説明できる',
    '方針を変えるテストを request spec で書き、数える仕組みを入れ替えても方針が保たれることを確かめられる',
    '方針を設定ファイルやデータに出すかどうかを、変える人・時期と、同じ仕組みを使う方針の数で判断できる',
  ],
  prerequisites: [10, 21, 68],
  sections: [
    {
      id: 'scene',
      title: 'パスワードの再設定とクーポンの照合に手で書いた回数の数え方',
      body: (
        <>
          <p>
            この章では同じ相手から短い時間に来る要求の数を制限する処理を例に、<Term en="Separation of Policy and Mechanism">方針と仕組みの分離</Term>を扱います。方針と仕組みの分離は、何を実現するかという判断（方針）と、どう実現するかという実装（仕組み）を分ける原則です。まず、回数の上限と数える処理を同じメソッドに書いたコードを動かし、上限を変えるときの手間と、数え方の誤りを確かめます。
          </p>
          <h3>そもそもレート制限は何をするのか</h3>
          <p>
            EC サイトのパスワードの再設定の画面では、メールアドレスを入力すると、再設定の URL を書いたメールが届きます。この画面をプログラムで何百回も呼ばれると、指定されたメールアドレスに再設定のメールが大量に届き、メールの送信の費用もかかります。クーポンのコードを照合する API も、コードを1つずつ変えて呼ばれると、有効なコードを総当たりで見つけられてしまいます。
          </p>
          <p>
            こうした使い方を防ぐために、<Term en="rate limiting">レート制限</Term>を入れます。レート制限は決まった長さの時間の中で受け付ける要求の数に上限を設け、上限を超えた要求を断る処理です。たとえば「同じ IP アドレスからは3分間に10回まで」と決め、11回目からは処理をせずに断ります。断るときの HTTP のステータスには 429 Too Many Requests があり、RFC 6585 は、利用者が決まった時間の中で多すぎる要求を送ったことを表すと定めています<Ref n={9} />。
          </p>
          <p>レート制限を作るときには、次の2種類のことを決めます。</p>
          <ul>
            <li>何を制限するか：何ごとに数えるか（IP アドレス、メールアドレス）、何回まで、どの長さの時間で、誰を数えないか、超えたときにどう応答するか。セキュリティの担当者や運営の担当者が、攻撃の状況や利用者の不便を見て決めます。</li>
            <li>どう数えるか：数をどこに保存するか、数を1つ増やす操作、時間が過ぎたら数をどう戻すか、キーの名前の付け方。開発者が決め、一度動けばあまり変わりません。</li>
          </ul>
          <h3>直す前のコード</h3>
          <p>
            パスワードの再設定は同じ IP アドレスからは3分間に10回までとし、社内のネットワーク（10.0. で始まる IP アドレス）からの要求は数えません。開発者は before_action のメソッドで、Rails.cache に回数を保存して数えました。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/password_resets_controller.rb（直す前）"
            code={`
# パスワードの再設定のメールを送る
class PasswordResetsController < ApplicationController
  before_action :throttle, only: :create

  def create
    member = Member.find_by(email: params[:email].to_s.strip.downcase)
    PasswordResetMailer.with(member:).reset.deliver_later if member
    head :accepted # 登録の有無がわからないように、同じ応答を返す
  end

  private

  def throttle
    ip = request.remote_ip
    return if ip.start_with?("10.0.") # 社内のネットワークからは数えない

    key = "reset-ip:#{ip}"
    count = Rails.cache.read(key).to_i + 1
    Rails.cache.write(key, count, expires_in: 3.minutes)
    head :too_many_requests if count > 10
  end
end
`}
          />
          <p>クーポンの照合は同じ IP アドレスからは10分間に5回までです。数える処理は再設定のコントローラーから写しました。</p>
          <Code
            lang="ruby"
            title="app/controllers/coupon_checks_controller.rb（直す前。throttle の部分）"
            code={`
class CouponChecksController < ApplicationController
  before_action :throttle, only: :create
  # …（省略。create はコードでクーポンを探し、見つからなければ 404）

  private

  def throttle
    key = "coupon:#{request.remote_ip}"
    count = Rails.cache.read(key).to_i + 1
    Rails.cache.write(key, count, expires_in: 10.minutes)
    head :too_many_requests if count > 5
  end
end
`}
          />
          <p>
            テストの環境のキャッシュは雛形では :null_store（何も保存しないストア）になっています。このままでは回数が保存されないので、config/environments/test.rb を <code>config.cache_store = :memory_store</code> に変え、各例の前に <code>Rails.cache.clear</code> を呼んでから request spec を実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests --format documentation）"
            code={`
クーポンの照合
  同じ IP からは10分間に5回まで受け付け、6回目は 429

パスワードの再設定
  同じ IP からは3分間に10回まで受け付け、11回目は 429
  社内のネットワークからは数えない

3 examples, 0 failures
`}
          />
          <Figure n="68-1" title="パスワードの再設定で回数を数えるメソッドと、問題が起きる箇所" caption="青い丸は方針（何を・何回まで・超えたらどうするか）、黒い丸は仕組み（どう数えるか）を書いた行。">
            <SceneFigure />
          </Figure>
          <p>
            図 68-1 は throttle の6行に、方針を書いた行と仕組みを書いた行の印を付けたものです。IP アドレスを取る行と社内のネットワークを除く行は方針、キーを作る行とキャッシュから読む行は仕組みです。残りの2行は、3分・10回・429 という方針と、write・比較という仕組みが1行に混ざっています。テストは通っていますが、方針だけを変えたいときにもこの6行を読んで直すことになります。
          </p>
          <h3>セキュリティの担当者からの変更の依頼</h3>
          <p>運用を始めて1か月後、セキュリティの担当者から2つの依頼が来ました。</p>
          <ul>
            <li>クーポンの照合を、10分間に3回までに減らす。</li>
            <li>パスワードの再設定に、同じメールアドレスへは1時間に3回までという制限を足す。IP アドレスを変えながら同じ人にメールを送り続ける使い方を防ぐためで、社内のネットワークからの要求も数える。</li>
          </ul>
          <p>どちらも何を制限するかという方針の変更です。開発者は2つのコントローラーの throttle を次のように直しました。</p>
          <Code
            lang="text"
            title="実行結果（直す前のコードに依頼を反映した差分。diff -u）"
            code={`
--- ch87s0/app/controllers/password_resets_controller.rb
+++ ch87s1/app/controllers/password_resets_controller.rb
@@ -12,11 +12,17 @@

   def throttle
     ip = request.remote_ip
-    return if ip.start_with?("10.0.") # 社内のネットワークからは数えない
+    unless ip.start_with?("10.0.") # 社内のネットワークからは数えない
+      key = "reset-ip:#{ip}"
+      count = Rails.cache.read(key).to_i + 1
+      Rails.cache.write(key, count, expires_in: 3.minutes)
+      return head :too_many_requests if count > 10
+    end

-    key = "reset-ip:#{ip}"
-    count = Rails.cache.read(key).to_i + 1
-    Rails.cache.write(key, count, expires_in: 3.minutes)
-    head :too_many_requests if count > 10
+    # 同じメールアドレスへは1時間に3回まで（社内からも数える）
+    email_key = "reset-email:#{params[:email].to_s.strip.downcase}"
+    email_count = Rails.cache.read(email_key).to_i + 1
+    Rails.cache.write(email_key, email_count, expires_in: 1.hour)
+    head :too_many_requests if email_count > 3
   end
 end
--- ch87s0/app/controllers/coupon_checks_controller.rb
+++ ch87s1/app/controllers/coupon_checks_controller.rb
@@ -17,6 +17,6 @@
     key = "coupon:#{request.remote_ip}"
     count = Rails.cache.read(key).to_i + 1
     Rails.cache.write(key, count, expires_in: 10.minutes)
-    head :too_many_requests if count > 5
+    head :too_many_requests if count > 3
   end
 end
`}
          />
          <p>
            クーポンの変更は数字を1つ変えるだけですが、その数字は数える処理の最後の行の中にあります。再設定のほうは、メールアドレスで数えるために、キーを作る・読む・書く・比べるの4行をもう一度写しました。社内のネットワークを除く条件は IP アドレスの制限にだけ掛けたいので、メソッドの途中で抜ける <code>return</code> を <code>unless</code> のブロックに書き換え、元の4行もその中に移しています。方針を1つ足すために、11行を足して5行を消しました。
          </p>
          <h3>足した制限のテストで見つかった数え方の誤り</h3>
          <p>
            新しい方針を確かめるために、テストを足しました。「3回送った10分後の4回目も断る」と、「40分おきに送る会員は、どの1時間をとっても2回までなので断らない」の2つです。時刻は ActiveSupport::Testing::TimeHelpers の <code>travel</code> で進めます。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/password_resets_spec.rb（足した例）"
            code={`
  it "3回送った10分後の4回目も 429" do
    3.times { request_reset("a@example.com") }
    travel 10.minutes
    expect(request_reset("a@example.com")).to eq(429)
  end

  it "40分おきに送る会員は、どの1時間でも2回までなので止めない" do
    statuses = 5.times.map do
      status = request_reset("a@example.com")
      travel 40.minutes
      status
    end
    expect(statuses).to eq([202] * 5)
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests --format documentation。依頼を反映したコード）"
            code={`
クーポンの照合
  同じ IP からは10分間に3回まで受け付け、4回目は 429

パスワードの再設定
  同じ IP からは3分間に10回まで受け付け、11回目は 429
  社内のネットワークからは IP では数えない
  同じメールアドレスへは1時間に3回まで受け付け、4回目は 429
  3回送った10分後の4回目も 429
  40分おきに送る会員は、どの1時間でも2回までなので止めない (FAILED - 1)

Failures:

  1) パスワードの再設定 40分おきに送る会員は、どの1時間でも2回までなので止めない
     Failure/Error: expect(statuses).to eq([202] * 5)

       expected: [202, 202, 202, 202, 202]
            got: [202, 202, 202, 429, 429]

6 examples, 1 failure
`}
          />
          <p>
            40分おきに送る会員の4回目と5回目が断られました。原因は <code>Rails.cache.write(key, count, expires_in: 1.hour)</code> にあります。write は呼ぶたびに有効期限を「今から1時間後」に付け直すので、前の要求から1時間がたたないうちに次の要求が来ると、数が0に戻りません。この行が実際に作っていた規則は「最後の要求から1時間、数を残す」で、担当者が決めた「1時間に3回まで」とは違います。
          </p>
          <Figure n="68-2" title="40分おきの要求で、数と期限がどう変わるか" caption="同じメールアドレスで40分おきに5回、再設定を求めた。右の列は後の節で rate_limit に置き換えた後の結果。">
            <TimelineFigure />
          </Figure>
          <p>
            図 68-2 の左の列が直す前のコードです。期限が60分後、100分後、140分後と延び続け、数は 1 から 5 まで増えました。右の列は後の節で直した後の結果で、最初の要求で決めた期限が切れると1から数え直すので、5回とも受け付けます。
          </p>
          <p>
            この誤りは IP アドレスの制限にも、写したクーポンの照合にもあります。3分や10分の短い期限では、要求の間隔がたまたま期限より長かったので、これまでのテストでは見つかりませんでした。さらに、read と write を別々に呼んでいるので、同じキーに2つの要求が同時に来ると、両方が同じ数を読んで同じ数を書き、1回分を数えないことがあります。
          </p>
          <p>
            どちらも、方針（1時間に3回まで）は正しく書けていて、数え方（期限の付け方と、数を増やす操作）が誤っています。方針と数え方が同じ行に書かれているので、方針を変える人が数え方の行も読んで直すことになり、数え方の誤りも方針を変えるたびに写されて広がりました。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '方針と仕組みの分離の意味と、Hydra の論文',
      body: (
        <>
          <h3>方針と仕組みの分離の定義</h3>
          <p>
            方針と仕組みの分離（Separation of Policy and Mechanism）は、何を実現するかという判断と、どう実現するかという実装を分ける原則です。この章のレート制限に当てはめると、次のように分かれます。
          </p>
          <ul>
            <li><Term en="policy">方針</Term>：何ごとに数えるか、何回まで、どの長さの時間で、誰を数えないか、超えたらどう応答するか。「同じメールアドレスへは1時間に3回まで」のような、利用者に対する決まりです。</li>
            <li><Term en="mechanism">仕組み</Term>：数をどこに保存し、どう1つ増やし、期限が来たらどう戻すか。どんな方針でも、数えるときに必要になる処理です。</li>
          </ul>
          <p>
            2つを分けると、方針を変える人は数え方の行を読まずに済み、数え方を直す人は方針の数字に触れずに済みます。前の節の誤りは、この2つが同じ行にあったために、方針の変更のたびに数え方の行まで書き写したことから広がりました。
          </p>
          <h3>Hydra の1974年の論文：設計の原則の1つとして</h3>
          <p>
            この原則は1970年代にカーネギーメロン大学で作られた Hydra というオペレーティングシステムのカーネルの設計で、はっきりした形で述べられました。Hydra は最大16台のプロセッサーが主記憶を共有する C.mmp という計算機のためのカーネルです<Ref n={2} />。
          </p>
          <p>
            William Wulf らは1974年の Communications of the ACM の論文「HYDRA: The Kernel of a Multiprocessor Operating System」で、設計の考え方の2つ目に「仕組みと方針の分離」を挙げました。既存のオペレーティングシステムで試行や手直しが難しい大きな原因の1つは、仕組みと方針を正しく分けていないことだと書き、分けると、複雑な判断をそれを決めるべき人（上の層のシステムの設計者）に任せられるので、システムが柔軟になると説明しています。この分離については Brinch Hansen がすでに説得力のある議論をしていた、とも書いています<Ref n={2} />。同じ論文は、保護（protection）は仕組みで、セキュリティ（security）は方針だとも述べ、パスワードなどは方針の問題だとしています<Ref n={2} />。
          </p>
          <h3>Levin らの1975年の論文：Policy/Mechanism Separation in HYDRA</h3>
          <p>
            Roy Levin・Ellis Cohen・William Corwin・Fred Pollack・William Wulf は、1975年の第5回 ACM オペレーティングシステム原理シンポジウム（SOSP）の論文「Policy/Mechanism Separation in HYDRA」で、この原則を Hydra でどう実装したかを詳しく述べました<Ref n={1} />。要旨では、資源を割り当てる方針をどこまで利用者のレベルのソフトウェアに任せるかで、オペレーティングシステムの柔軟さのかなりの部分が決まるとし、Hydra では仕組みと方針の分離を基本の設計原則とし、カーネルを（ほぼ）仕組みだけで作ったと書いています<Ref n={1} />。論文はスケジューリング・ページング・保護の3つの仕組みを取り上げ、カーネルに残った方針の判断は、物理的な資源の取り合いを調停するためだけにあり、それも公平さを保証する範囲に限られると結論しています<Ref n={1} />。
          </p>
          <p>論文の序論は方針をカーネルの外に出す理由を次のように説明しています<Ref n={1} />。</p>
          <ul>
            <li>既存のオペレーティングシステムの方針は「平均的には」うまく動くとされているが、自分たちにとって重要な特別な場合にはうまく動かないことが多い。</li>
            <li>方針を特権のない利用者のプログラムで定められるようにすれば、カーネルの奥に埋め込むよりも用途に合わせて手直しや調整をしやすい。</li>
            <li>用途ごとに調整できるよう、同じ資源を扱う複数の方針を同時に動かせるようにしたい。</li>
          </ul>
          <p>
            そのうえで論文は実用上の制約を3つ挙げます。利用者のプログラムには誤りがあり、悪意があるかもしれないので、ほかの利用者を害さないよう保護された環境で動かす必要があること。1つのプログラムが資源を独占しないよう、方針どうしの公平さを保つ必要があること。スケジューリングのような判断は速くなければならず、判断のたびに保護の境界を越えて利用者のプログラムを呼ぶのは費用が大きすぎること。論文はこの妥協に「方針と仕組みの分離の原則」という名前を付け、方針は定義上カーネルの外の利用者のレベルのソフトウェアに書かれ、仕組みはその方針を実装するためにカーネルが提供する、と定めました<Ref n={1} />。
          </p>
          <h3>パラメーターを持つ方針：KMPS と方針モジュール</h3>
          <p>
            論文の最初の例はプロセスのスケジューリングです。KMPS（Kernel Multiprocessing System）はカーネルの中のスケジューリングの仕組みで、利用者のレベルのスケジューラーを<Term en="Policy Module">方針モジュール</Term>と呼びます。方針モジュールは、自分が受け持つプロセスについて、優先度・使えるプロセッサー・時間の割り当て・ページの数の上限をパラメーターとして設定し、プロセスを開始します。KMPS はそのパラメーターに従って短い間隔でプロセスを切り替え、プロセスが止まると方針モジュールに知らせます<Ref n={1} />。
          </p>
          <Figure n="68-3" title="Hydra の方針モジュールと KMPS、この章のコードとの対応" caption="左は Levin ほか（1975）の2節をもとにした模式図。右はこの章で後に直したコード。">
            <HydraFigure />
          </Figure>
          <p>
            図 68-3 の左のように、タイムシェアリング・バッチの処理・デバッグ中の3つの方針モジュールを同時に動かしても、KMPS は1つです。論文は、ある方針モジュールの誤りがほかの方針モジュールに悪い影響を与えないことを KMPS が保証すると書いています<Ref n={1} />。
          </p>
          <p>
            論文は KMPS を「実はパラメーターを持つ方針（parameterized policy）」だとも書いています。判断を速くするために、短い間隔の判断はカーネルが行い、その判断の基準だけを方針モジュールがパラメーターで決めるからです。その代わり、パラメーターで表せない方針は作れません。論文は、実装できる方針の範囲はカーネルの仕組みが提供するパラメーターの種類と数で決まり、その範囲の広さは設計者の見通しに左右されると述べています<Ref n={1} />。
          </p>
          <h3>方針と仕組みは相対的に決まる</h3>
          <p>
            論文はもう1つ、ソフトウェアのある部分を方針と呼ぶか仕組みと呼ぶかは相対的だと書いています。仮想の資源を実装する人はその資源の使い方の方針を決め、その方針をさらに下のソフトウェアが提供する仕組みで実装します。「〜を使って実装される」という関係で階層ができ、上の層から見ると下の層の機能は仕組みになり、一番下にカーネルの仕組みがあります<Ref n={1} />。
          </p>
          <p>この章のコードに当てはめると、次の3つの層になります。</p>
          <ul>
            <li>コントローラーの <code>rate_limit to: 3, within: 1.hour, by: :requested_email</code> は方針で、Rails の RateLimiting はその仕組みです。</li>
            <li>RateLimiting はキーの名前の付け方と「最初の1回から決めた長さの時間で数を戻す」という数え方を決めています。キャッシュのストアから見ると、これは RateLimiting の方針で、ストアの <code>increment</code> が仕組みです。</li>
            <li>RateLimiting の数え方は、KMPS と同じくパラメーターを持つ方針です。to・within・by で表せる方針は書けますが、「直近の60分に3回まで」のように時間の区切りをずらしながら数える方式は、パラメーターでは選べません。</li>
          </ul>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則</th>
                  <th scope="col">何を分けるか</th>
                  <th scope="col">この章との関係</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">SoC（<ChapterLink n={68} />）</th>
                  <td>異なる関心事（画面・業務の規則・保存など）</td>
                  <td>方針と仕組みの分離は関心事の分け方の1つで、「判断」と「実装」の軸で分ける</td>
                </tr>
                <tr>
                  <th scope="row">SRP（<ChapterLink n={63} />）</th>
                  <td>変更の理由が違うもの</td>
                  <td>方針はセキュリティの担当者の判断で、仕組みは開発者の判断で変わる。変わる理由が違うので分ける</td>
                </tr>
                <tr>
                  <th scope="row">DIP（<ChapterLink n={67} />）</th>
                  <td>上位の方針と下位の詳細の依存の向き</td>
                  <td>DIP は依存の向きを決める。方針と仕組みの分離は判断をどちらに置くかを決める</td>
                </tr>
                <tr>
                  <th scope="row">OCP（<ChapterLink n={64} />）</th>
                  <td>拡張する部分と変更しない部分</td>
                  <td>仕組みを変えずに方針を足せるようにすると、OCP の形になる</td>
                </tr>
                <tr>
                  <th scope="row">Strategy / Policy（<ChapterLink n={41} />）</th>
                  <td>入れ替えるアルゴリズムや判断のルール</td>
                  <td>方針をオブジェクトにして入れ替える設計パターン。GoF は Strategy の別名を Policy としている<Ref n={17} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: '数える仕組みを rate_limit に任せ、方針を宣言の行に集める',
      body: (
        <>
          <p>直す順序は4つの手順に分けます。方針と仕組みを書き分け、方針をテストに書いてから、仕組みを置き換えます。</p>
          <h3>手順1：直す前のコードを方針と仕組みに分ける</h3>
          <p>最初に、throttle に書かれていることを1つずつ取り出し、方針と仕組みのどちらかに分けます。図 68-4 は依頼を反映した後のコードについて分けたものです。</p>
          <Figure n="68-4" title="直す前のコードを方針と仕組みに分ける" caption="右の列は手順3で置き換えた後に書く場所。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">分類</th>
                    <th scope="col">直す前のコード</th>
                    <th scope="col">内容</th>
                    <th scope="col">直した後に書く場所</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">方針</th>
                    <td><code>request.remote_ip</code>、<code>params[:email]</code></td>
                    <td>何ごとに数えるか</td>
                    <td>rate_limit の by:（既定は IP アドレス）</td>
                  </tr>
                  <tr>
                    <th scope="row">方針</th>
                    <td><code>count &gt; 10</code>、<code>expires_in: 1.hour</code> の数字</td>
                    <td>何回まで、どの長さの時間で</td>
                    <td>rate_limit の to: と within:</td>
                  </tr>
                  <tr>
                    <th scope="row">方針</th>
                    <td><code>ip.start_with?("10.0.")</code></td>
                    <td>誰を数えないか</td>
                    <td>rate_limit の unless:（before_action の条件）</td>
                  </tr>
                  <tr>
                    <th scope="row">方針</th>
                    <td><code>head :too_many_requests</code></td>
                    <td>超えたらどう応答するか</td>
                    <td>rate_limit の with:（既定は 429）</td>
                  </tr>
                  <tr>
                    <th scope="row">仕組み</th>
                    <td><code>"reset-ip:#{'{'}ip{'}'}"</code></td>
                    <td>キーの名前の付け方</td>
                    <td>Rails（controller_path と name: から作る）</td>
                  </tr>
                  <tr>
                    <th scope="row">仕組み</th>
                    <td><code>Rails.cache.read</code> と <code>write</code></td>
                    <td>数を1つ増やし、期限を付ける</td>
                    <td>Rails（ストアの increment）</td>
                  </tr>
                  <tr>
                    <th scope="row">仕組み</th>
                    <td><code>Rails.cache</code></td>
                    <td>数を保存する場所</td>
                    <td>環境ごとの cache_store（または rate_limit の store:）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 68-4 の上の4行はセキュリティの担当者の判断で変わるものです。下の3行はどの制限でも同じで、変わるのは数える場所を変えるときだけです。Rails 8.1 の <code>rate_limit</code> は、下の3行を Rails の中に持ち、上の4行を引数で受け取ります<Ref n={3} />。
          </p>
          <h3>手順2：方針をテストに書く</h3>
          <p>
            仕組みを置き換える前に、方針をテストに書きます。テストが確かめるのは「何回目から断るか」「誰を数えないか」という方針で、キャッシュのキーの名前のような仕組みの詳細には触れません。そうすると、手順3で仕組みを置き換えても、同じテストで方針が保たれたことを確かめられます。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/password_resets_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "パスワードの再設定", type: :request do
  include ActiveSupport::Testing::TimeHelpers
  before { Rails.cache.clear }

  def request_reset(email, ip: "127.0.0.1")
    post password_resets_path, params: { email: }, env: { "REMOTE_ADDR" => ip }
    response.status
  end

  it "同じ IP からは3分間に10回まで受け付け、11回目は 429" do
    statuses = 11.times.map { |i| request_reset("user#{i}@example.com") }
    expect(statuses).to eq([202] * 10 + [429])
  end

  it "社内のネットワークからは IP では数えない" do
    statuses = 11.times.map { |i| request_reset("user#{i}@example.com", ip: "10.0.3.4") }
    expect(statuses.uniq).to eq([202])
  end

  it "同じメールアドレスへは1時間に3回まで受け付け、4回目は 429" do
    statuses = 4.times.map { request_reset("a@example.com") }
    expect(statuses).to eq([202, 202, 202, 429])
  end

  # …（省略。前の節で足した「10分後の4回目」と「40分おき」の2つの例）
end
`}
          />
          <p>
            このテストは、テストの環境のキャッシュのストアに依存します。雛形のまま :null_store にしておくと、手順3の後のコードでは次のようになりました。
          </p>
          <Code
            lang="text"
            title="実行結果（手順3の後のコードを、config.cache_store = :null_store で実行）"
            code={`
  1) クーポンの照合 同じ IP からは10分間に3回まで受け付け、4回目は 429
       expected: [404, 404, 404, 429]
            got: [404, 404, 404, 404]
  2) パスワードの再設定 同じ IP からは3分間に10回まで受け付け、11回目は 429
       expected: [202, 202, 202, 202, 202, 202, 202, 202, 202, 202, 429]
            got: [202, 202, 202, 202, 202, 202, 202, 202, 202, 202, 202]
  3) パスワードの再設定 同じメールアドレスへは1時間に3回まで受け付け、4回目は 429
       expected: [202, 202, 202, 429]
            got: [202, 202, 202, 202]
5 examples, 3 failures
`}
          />
          <p>
            例外も警告も出ずに、すべての要求を受け付けました。NullStore の <code>increment</code> は何も保存せず nil を返します<Ref n={7} />。rate_limit は <code>count &amp;&amp; count &gt; to</code> のときだけ断るので<Ref n={3} />、nil なら一度も断りません。仕組み（ストア）を取り替えると、方針を書いた行はそのままでも、制限が働かなくなります。この章のアプリでは test.rb を次のように変えています。
          </p>
          <Code
            lang="ruby"
            title="config/environments/test.rb（変えた行）"
            code={`
  config.cache_store = :memory_store # 回数を数える処理を確かめるため（雛形は :null_store）
`}
          />
          <p>
            MemoryStore は1つのプロセスの中にだけ値を持つので、テストの例をまたいで数が残らないよう、各例の前に <code>Rails.cache.clear</code> を呼びます。ほかのテストがキャッシュに値が残らないことを前提にしている場合は、rate_limit の <code>store:</code> にテスト用のストアを渡す方法もあります。
          </p>
          <h3>手順3：数える処理を rate_limit に置き換える</h3>
          <p>2つのコントローラーの throttle を消し、方針を rate_limit の宣言に書きます。</p>
          <Code
            lang="ruby"
            title="app/controllers/password_resets_controller.rb（直した後）"
            code={`
# パスワードの再設定のメールを送る
class PasswordResetsController < ApplicationController
  # 方針：同じ IP からは3分間に10回まで（社内のネットワークからは数えない）
  rate_limit to: 10, within: 3.minutes, only: :create, name: "ip", unless: :office_network?
  # 方針：同じメールアドレスへは1時間に3回まで
  rate_limit to: 3, within: 1.hour, only: :create, name: "email", by: :requested_email

  def create
    member = Member.find_by(email: requested_email)
    PasswordResetMailer.with(member:).reset.deliver_later if member
    head :accepted # 登録の有無がわからないように、同じ応答を返す
  end

  private

  def requested_email = params[:email].to_s.strip.downcase
  def office_network? = request.remote_ip.start_with?("10.0.")
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/coupon_checks_controller.rb（直した後。宣言の部分）"
            code={`
class CouponChecksController < ApplicationController
  # 方針：同じ IP からは10分間に3回まで
  rate_limit to: 3, within: 10.minutes, only: :create
  # …（省略。create は直す前と同じ）
end
`}
          />
          <ul>
            <li>to: と within: は、上限の回数と時間の長さです。within: には <code>1.hour</code> のように単位の付いた値を渡します。</li>
            <li>by: は何ごとに数えるかで、省くと <code>request.remote_ip</code> になります。Rails 8.1 からはメソッド名の Symbol も渡せます<Ref n={10} />。メールアドレスは前後の空白を取り、小文字にそろえてから数えます。</li>
            <li>name: は、1つのコントローラーに2つの制限を置くときに、数を別々にするための名前です。キャッシュのキーに入ります<Ref n={3} />。</li>
            <li>only: と unless: は before_action にそのまま渡されます。rate_limit は before_action として登録されるからです<Ref n={3} />。社内のネットワークを除く条件は、IP アドレスの制限にだけ付けました。</li>
            <li>with: を省くと ActionController::TooManyRequests が発生し、Action Dispatch がそれを 429 の応答にします<Ref n={3} /><Ref n={12} />。</li>
          </ul>
          <h3>手順4：テストを実行し、数えている値を確かめる</h3>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
環境
  MySQL 8.4 につながる

クーポンの照合
  同じ IP からは10分間に3回まで受け付け、4回目は 429

パスワードの再設定
  同じ IP からは3分間に10回まで受け付け、11回目は 429
  社内のネットワークからは IP では数えない
  同じメールアドレスへは1時間に3回まで受け付け、4回目は 429
  3回送った10分後の4回目も 429
  40分おきに送る会員は、どの1時間でも2回までなので止めない

7 examples, 0 failures
`}
          />
          <p>
            手順2のテストを変えずに、40分おきの例も通りました。MemoryStore の <code>increment</code> は、数を増やすときに最初に決めた期限を引き継ぎ、期限が切れていれば新しい値として書きます。この処理はロックの中で行うので、同時に来た2つの要求が同じ数を書くこともありません<Ref n={5} />。Redis のストアも INCRBY で数を増やし、期限は EXPIRE の NX（期限がないときだけ付ける）で付けます<Ref n={6} />。
          </p>
          <p>
            方針を書く人がキーの名前を知る必要はありませんが、障害の調査では何が数えられているかを確かめたくなります。次のスクリプトは、上限を超えたときに Rails が送る通知（rate_limit.action_controller）を受け取り、キャッシュに入った数を読みます。
          </p>
          <Code
            lang="ruby"
            title="script/rate_limit_keys.rb"
            code={`
# rate_limit が数えるときのキャッシュのキーと、上限を超えたときの通知を確かめる
ActiveSupport::Notifications.subscribe("rate_limit.action_controller") do |event|
  puts "通知: #{event.payload.slice(:name, :by, :count, :to, :within, :cache_key)}"
end

Rails.cache.clear
browser = ActionDispatch::Integration::Session.new(Rails.application)
statuses = 4.times.map do
  browser.post "/password_resets", params: { email: " A@example.com" }
  browser.response.status
end
puts "応答: #{statuses}"

%w[rate-limit:password_resets:ip:127.0.0.1 rate-limit:password_resets:email:a@example.com].each do |key|
  puts "#{key} => #{Rails.cache.read(key)}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=test bin/rails runner script/rate_limit_keys.rb）"
            code={`
通知: {name: "email", by: "a@example.com", count: 4, to: 3, within: 1 hour, cache_key: "rate-limit:password_resets:email:a@example.com"}
応答: [202, 202, 202, 429]
rate-limit:password_resets:ip:127.0.0.1 => 4
rate-limit:password_resets:email:a@example.com => 4
`}
          />
          <p>
            キーは「rate-limit:コントローラーのパス:name:by の値」の形で、2つの制限が別々に数えられています。4回目は断られましたが、数は 4 になっています。rate_limit は先に数を増やしてから上限と比べるからです<Ref n={3} />。
          </p>
          <h3>方針を変えるときの差分</h3>
          <p>直した後で、セキュリティの担当者から「IP アドレスの制限を5分間に20回までに緩めたい」という依頼が来た場合の差分です。</p>
          <Code
            lang="text"
            title="実行結果（IP アドレスの制限を変えた差分。diff -u）"
            code={`
@@ -1,7 +1,7 @@
 # パスワードの再設定のメールを送る
 class PasswordResetsController < ApplicationController
-  # 方針：同じ IP からは3分間に10回まで（社内のネットワークからは数えない）
-  rate_limit to: 10, within: 3.minutes, only: :create, name: "ip", unless: :office_network?
+  # 方針：同じ IP からは5分間に20回まで（社内のネットワークからは数えない）
+  rate_limit to: 20, within: 5.minutes, only: :create, name: "ip", unless: :office_network?
   # 方針：同じメールアドレスへは1時間に3回まで
   rate_limit to: 3, within: 1.hour, only: :create, name: "email", by: :requested_email
`}
          />
          <Figure n="68-5" title="直す前と後：方針を変えるときに開く場所" caption="左は依頼を反映した直す前のコード。行数は throttle メソッドの def から end まで。">
            <CompareFigure />
          </Figure>
          <p>
            図 68-5 の左では方針の変更のたびに throttle の中を開き、メールアドレスの制限を足すときは数える処理を写しました。右では、方針の変更は宣言の行だけで、数える処理の誤りを直すことも、数える場所を変えることも、コントローラーに触れずにできます。
          </p>
          <h3>変わるものと置き場所</h3>
          <p>直した後のコードについて、何がどのくらい変わり、どこに書いてあるかをまとめます。</p>
          <Figure n="68-6" title="変更の頻度と置き場所" caption="頻度はこの章の EC サイトでの想定。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">変わるもの</th>
                    <th scope="col">決める人</th>
                    <th scope="col">変わる頻度</th>
                    <th scope="col">置き場所</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>上限の回数と時間の長さ</td>
                    <td>セキュリティの担当者</td>
                    <td>攻撃や問い合わせのたび（月に数回）</td>
                    <td>コントローラーの rate_limit の宣言</td>
                  </tr>
                  <tr>
                    <td>何ごとに数えるか、誰を除くか</td>
                    <td>セキュリティの担当者と開発者</td>
                    <td>新しい攻撃の方法が出たとき（年に数回）</td>
                    <td>宣言の by: と unless:、それが呼ぶ private メソッド</td>
                  </tr>
                  <tr>
                    <td>超えたときの応答</td>
                    <td>運営の担当者</td>
                    <td>画面を作り直すとき</td>
                    <td>宣言の with:（省くと 429）</td>
                  </tr>
                  <tr>
                    <td>数を保存する場所</td>
                    <td>開発者・インフラの担当者</td>
                    <td>サーバーの構成を変えるとき</td>
                    <td>config/environments/*.rb の cache_store</td>
                  </tr>
                  <tr>
                    <td>キーの付け方、数え方、期限の扱い</td>
                    <td>Rails の開発者</td>
                    <td>Rails を上げるとき</td>
                    <td>actionpack と activesupport の gem</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 68-6 の上の行ほど頻繁に、アプリの外の人の判断で変わります。頻繁に変わるものをコントローラーの先頭の短い宣言に置き、変わらないものを Rails に任せたので、変更の依頼が来たときに開く場所が1か所に決まりました。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '方針を YAML に出し、汎用の仕組みを自作したとき',
      body: (
        <>
          <p>
            方針と仕組みを分けると、方針を「コードの外」に出したくなります。数字を変えるたびに開発者がコードを直すのは手間だと考え、すべての制限を YAML に書き、どのコントローラーでも同じ concern から rate_limit を宣言する作りにした場合を動かします。
          </p>
          <h3>制限を YAML から読み込むコード</h3>
          <Code
            lang="yaml"
            title="config/rate_limits.yml"
            code={`
# 制限の方針。within の単位は秒
password_resets:
  - name: ip
    to: 10
    within: 180
    by: remote_ip
    skip_networks: ["10.0."]
  - name: email
    to: 3
    within: 60
    by: email
coupon_checks:
  - name: ip
    to: 3
    within: 600
    by: remote_ip
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/concerns/configurable_rate_limit.rb"
            code={`
# 制限の方針を config/rate_limits.yml から読み込んで、rate_limit を宣言する
module ConfigurableRateLimit
  extend ActiveSupport::Concern

  RULES = YAML.load_file(Rails.root.join("config/rate_limits.yml"))
  KEY_FUNCTIONS = {
    "remote_ip" => -> { request.remote_ip },
    "email" => -> { params[:email].to_s.strip.downcase },
  }.freeze

  class_methods do
    def configure_rate_limits(section)
      RULES.fetch(section).each do |rule|
        skip_networks = rule.fetch("skip_networks", [])
        rate_limit to: rule.fetch("to"), within: rule.fetch("within").seconds,
          name: rule.fetch("name"), by: KEY_FUNCTIONS.fetch(rule.fetch("by")), only: :create,
          unless: -> { skip_networks.any? { |net| request.remote_ip.start_with?(net) } }
      end
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/password_resets_controller.rb（YAML を使う版。宣言の部分）"
            code={`
class PasswordResetsController < ApplicationController
  include ConfigurableRateLimit
  configure_rate_limits "password_resets"
  # …（省略。create は直した後と同じ）
end
`}
          />
          <p>
            メールアドレスの制限は「1時間に3回まで」のつもりで、<code>within: 60</code> と書かれています。ファイルの先頭には単位は秒だと書いてありますが、書いた人は分のつもりでした。前の節と同じテストを実行した結果です。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests --format documentation。YAML を使う版）"
            code={`
パスワードの再設定
  同じ IP からは3分間に10回まで受け付け、11回目は 429
  社内のネットワークからは IP では数えない
  同じメールアドレスへは1時間に3回まで受け付け、4回目は 429
  3回送った10分後の4回目も 429 (FAILED - 1)
  40分おきに送る会員は、どの1時間でも2回までなので止めない

Failures:

  1) パスワードの再設定 3回送った10分後の4回目も 429
     Failure/Error: expect(request_reset("a@example.com")).to eq(429)

       expected: 429
            got: 202

6 examples, 1 failure
`}
          />
          <p>
            メールアドレスの制限は60秒で数が戻り、10分後の4回目を受け付けました。続けて送る例は通ったので、「1時間」を確かめるテストがなければ気づけません。直した後のコードでは <code>within: 1.hour</code> と単位を付けて書いていたので、この誤りは起きませんでした。
          </p>
          <h3>この作りで増えたもの</h3>
          <ul>
            <li>
              パスワードの再設定の制限を知るために読む場所が、コントローラー・concern・YAML の3つになりました。コントローラーには <code>configure_rate_limits "password_resets"</code> とだけ書かれていて、何回までかはわかりません。
            </li>
            <li>
              YAML で選べる数え方（by:）は、KEY_FUNCTIONS に書いた2つだけです。ログインした会員の ID で数える制限を足すには、YAML ではなく concern を直します。超えたときの応答（with:）は YAML に書けないので、クーポンの照合だけ応答を変えたくなったら、YAML の項目と concern の両方を足すことになります。
            </li>
            <li>
              YAML はリポジトリの中にあるので、数字を変えるときも、コードと同じくレビューを受けてデプロイします。コントローラーの宣言を1行直すのと、手間は変わりません。
            </li>
          </ul>
          <p>
            Levin らの論文が KMPS について書いたことは、この YAML にも当てはまります。実装できる方針の範囲は、仕組みが用意したパラメーターの種類と数で決まります<Ref n={1} />。rate_limit はすでに方針を受け取るパラメーターを持っていて、その上に YAML の層を足しても、方針の範囲は広がらず、狭くなりました。Ruby の宣言なら書けた <code>1.hour</code> や、メソッドを呼ぶ by: と with: が、YAML では書けないからです。
          </p>
          <h3>判断の目安</h3>
          <Figure n="68-7" title="方針をどこまで切り離すかの目安" caption="模式図。横軸は方針を変える人と時期、縦軸は同じ仕組みを使う方針の数。">
            <JudgeFigure />
          </Figure>
          <p>図 68-7 の4つの場所は次のように使い分けます。</p>
          <ul>
            <li>
              左下（方針が1つで、開発者がコードと一緒に変える）：方針と仕組みを同じメソッドに書いても、困ることは少ない場所です。数える処理を書くのが1か所だけなら、2つ目の制限が必要になったときに仕組みを取り出せば足ります。ただし、レート制限のように Rails に仕組みがあるなら、1つ目から使います。
            </li>
            <li>
              左上（複数の方針が同じ仕組みを使い、開発者が変える）：この章の直した後の形です。仕組みを1か所（ここでは Rails）にまとめ、方針はそれを使う場所の近くに、短い宣言で書きます。
            </li>
            <li>
              右下（方針は1つだが、デプロイせずに値を変えたい）：環境ごとに上限を変えたいときは、値だけを環境変数・credentials・<code>config_for</code> で読む設定に出します。数える対象や応答まで設定にする必要はありません。
            </li>
            <li>
              右上（多くの方針を、開発者以外がデプロイせずに変える）：方針をデータとして持ち、管理画面から変える作りが合う場所です。その場合は、単位を含めた値の検証、変更の履歴、方針ごとのテストを仕組みの側に足します。
            </li>
          </ul>
          <p>
            この節の YAML は、開発者だけが変えてデプロイもする左上の場所に、右上の作りを持ち込んだものです。方針を切り離すかどうかは、誰がいつ方針を変えるかと、同じ仕組みを使う方針がいくつあるかで決めます。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の rate_limit・Pundit・retry_on と、方針・仕組み',
      body: (
        <>
          <h3>rate_limit の引数を方針と仕組みに分ける</h3>
          <p>Rails 8.1.4.1 の rate_limit の引数を、方針と仕組みに分けて並べます<Ref n={3} /><Ref n={4} />。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">引数</th>
                  <th scope="col">省いたとき</th>
                  <th scope="col">分類</th>
                  <th scope="col">決めること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>to:、within:</td>
                  <td>省けない</td>
                  <td>方針</td>
                  <td>何回まで、どの長さの時間で</td>
                </tr>
                <tr>
                  <td>by:</td>
                  <td><code>request.remote_ip</code></td>
                  <td>方針</td>
                  <td>何ごとに数えるか</td>
                </tr>
                <tr>
                  <td>with:</td>
                  <td>TooManyRequests を発生させ、429 を返す</td>
                  <td>方針</td>
                  <td>超えたらどう応答するか</td>
                </tr>
                <tr>
                  <td>name:</td>
                  <td>なし</td>
                  <td>方針</td>
                  <td>1つのコントローラーの中で、どの制限の数か</td>
                </tr>
                <tr>
                  <td>scope:</td>
                  <td>controller_path</td>
                  <td>方針</td>
                  <td>どのコントローラーの間で数を共有するか（8.1 から）</td>
                </tr>
                <tr>
                  <td>only:、except:、if:、unless:</td>
                  <td>すべてのアクション</td>
                  <td>方針</td>
                  <td>どのアクションで、誰を数えるか（before_action の引数）</td>
                </tr>
                <tr>
                  <td>store:</td>
                  <td>コントローラーの cache_store</td>
                  <td>仕組み</td>
                  <td>数をどこに保存するか</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            キーの形、数の増やし方、期限の扱い、上限との比べ方は引数になく、Rails の中で決まっています<Ref n={3} />。Rails 8.1 の認証のジェネレーターが作る SessionsController と PasswordsController にも、<code>rate_limit to: 10, within: 3.minutes, only: :create</code> の宣言が入っています<Ref n={13} />。ログインとパスワードの再設定に制限を掛けるという方針を、Rails が最初から書いておく形です。
          </p>
          <h3>キャッシュのストアと、数える範囲</h3>
          <p>
            store: を省くと、rate_limit はコントローラーの cache_store を使い、それは既定で <code>config.cache_store</code>（Rails.cache）です<Ref n={4} />。どのストアを選ぶかで、数える範囲が変わります。
          </p>
          <ul>
            <li>MemoryStore は値を1つの Ruby のプロセスの中に持ちます。Rails Guides は、Puma をクラスターモードで動かすなど複数のプロセスがある場合は、プロセスの間でキャッシュを共有できないと書いています<Ref n={8} />。プロセスが4つあれば、同じ利用者でもプロセスごとに数えるので、制限は宣言より緩くなります。</li>
            <li>Solid Cache はデータベースに値を保存するストアで、新しい Rails アプリの既定のストアです<Ref n={8} />。複数のサーバーで同じ数を共有できます。</li>
            <li>NullStore は値を保存しません。開発とテストの環境のためのストアで<Ref n={8} />、手順2で確かめたとおり、rate_limit は一度も断りません。</li>
          </ul>
          <p>
            一般のキャッシュとは別のストアで数えたいときは、store: に専用のストアを渡します<Ref n={3} />。どれを選んでも、コントローラーの宣言は変わりません。
          </p>
          <Callout kind="warn" title="by: の既定の IP アドレスと、プロキシ">
            <p>
              by: を省くと <code>request.remote_ip</code> で数えます。ロードバランサーやプロキシの後ろで動かすときに、remote_ip が利用者の IP アドレスではなくロードバランサーの IP アドレスを返す設定になっていると、すべての利用者が1つの数を共有し、少ない要求で全員が断られます。信頼するプロキシの設定と remote_ip の決まり方は、<ChapterLink n={25} section="client-ip" />で扱いました。
            </p>
          </Callout>
          <Callout kind="v72">
            <p>
              rate_limit は Rails 7.2 で入りました。7.2.2.1 のソースでは、引数は to:・within:・by:・with:・store: だけで、name: と scope: はありません。キャッシュのキーは <code>rate-limit:コントローラーのパス:by の値</code> だけから作られます。by: と with: は instance_exec で呼ぶので、Symbol ではなく <code>{'-> { requested_email }'}</code> のような lambda で渡します。with: を省いたときは、例外を発生させずに <code>head :too_many_requests</code> で 429 を返します。上限を超えたときの通知の payload は request だけです<Ref n={11} />。8.1 では、メソッド名の Symbol を渡せるようになり、scope: が足され、既定の動きが TooManyRequests を発生させる形に変わり、通知の payload に count・to・within・by・name・cache_key が足されました<Ref n={10} />。
            </p>
          </Callout>
          <h3>Rails のほかの機能に見る方針と仕組み</h3>
          <p>Rails とよく使う gem には、rate_limit と同じく、アプリが方針を書き、ライブラリが仕組みを持つ機能がほかにもあります。</p>
          <Figure n="68-8" title="rate_limit・Pundit・retry_on の方針と仕組み" caption="左がアプリに書くコード、右が Rails や gem の中で動く処理。">
            <RailsFigure />
          </Figure>
          <ul>
            <li>
              Pundit では、誰が何をしてよいかという認可の方針を、モデルごとのポリシーのクラスに普通の Ruby のメソッドとして書きます。コントローラーの <code>authorize</code> は、レコードに対応するポリシーのクラスを探し、アクション名に ? を付けたメソッドを呼び、false なら Pundit::NotAuthorizedError を発生させます<Ref n={15} />。Pundit を使った認可は<ChapterLink n={41} section="pundit" />で扱いました。
            </li>
            <li>
              Active Job の <code>retry_on</code> では、どの例外で、何回まで、どう待って再試行するかをジョブのクラスに宣言します。Active Job は rescue_from で例外を受け、実行の回数を数え、待ち時間を計算してジョブを入れ直し、回数を超えたら例外を投げ直します<Ref n={16} />。再試行の待ち方は<ChapterLink n={54} />で扱いました。
            </li>
          </ul>
          <h3>Rails Doctrine との関係</h3>
          <p>
            Rails Doctrine の「Convention over Configuration」は、Web アプリを作る開発者が毎回向き合う判断の多くは一度決めれば済むもので、誰かが代わりに決めてくれるならそのほうがよい、と述べています<Ref n={14} />。rate_limit では、キーの形・数え方・期限の扱い・既定のストアと既定の数える対象を Rails が決めているので、アプリには「何回まで」という方針だけが残ります。
          </p>
          <p>
            「The menu is omakase」は、Rails は決めた組み合わせを使うことを勧めつつ、一部を別のものに取り替えることもでき、取り替えを強制はしないと述べています<Ref n={14} />。数を保存するストアは、store: や cache_store で取り替えられる部分です。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={21} section="authentication" />：ログインとパスワードの再設定に、アカウントと接続元の両方で頻度の制限を掛けることを扱いました。この章の2つの制限はその方針を rate_limit で書いたものです。
            </li>
            <li>
              <ChapterLink n={43} section="alternatives" />：Rack のミドルウェアで制限する Rack::Attack と、コントローラーで制限する rate_limit の使い分けを扱いました。
            </li>
            <li>
              <ChapterLink n={68} />（SoC）と<ChapterLink n={63} />（SRP）：この章の分け方は、変わる理由が違うものを分けるという点で、2つの原則と同じ考え方です。
            </li>
            <li>
              <ChapterLink n={89} />（Observability）：rate_limit.action_controller の通知を受け取り、どの制限で何回断ったかを記録して確かめる方法につながります。
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
          <li>方針と仕組みの分離は、何を実現するかという判断（方針）と、どう実現するかという実装（仕組み）を分ける原則です。レート制限では、何ごとに・何回まで・どの時間で・誰を除き・超えたらどう応答するかが方針で、数の保存・増やし方・期限の扱いが仕組みです。</li>
          <li>方針と数える処理を同じメソッドに書くと、上限を変えるたびに数える処理の行を開き、制限を足すたびに数える処理を写すことになります。この章では、write のたびに期限を付け直す誤りが、写した3か所に広がっていました。</li>
          <li>Levin らは1975年の論文で、Hydra のカーネルをほぼ仕組みだけで作り、方針をカーネルの外のプログラムに置いたと述べました。KMPS のように、方針をパラメーターで受け取る仕組みは、パラメーターで表せる範囲の方針しか作れません。</li>
          <li>Rails 8.1 の rate_limit は、to・within・by・with・name で方針を受け取り、キーの作り方・increment・期限の扱いを Rails の中に持ちます。方針はテストで確かめ、仕組みを取り替えても同じテストが通ることを確かめます。</li>
          <li>テストの環境の :null_store では rate_limit は一度も断りません。MemoryStore はプロセスごとに数えるので、本番では複数のプロセスで共有できるストアを選びます。</li>
          <li>方針を YAML やデータに出すのは、開発者以外がデプロイせずに方針を変えるときです。開発者がコードと一緒に変える方針を YAML に出すと、読む場所が増え、単位の誤りが起き、書ける方針の範囲が狭くなりました。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Policy/Mechanism Separation in HYDRA', publisher: 'R. Levin, E. Cohen, W. Corwin, F. Pollack, W. Wulf / Proceedings of the Fifth ACM Symposium on Operating Systems Principles（SOSP \'75）。ACM Digital Library の PDF を Internet Archive に保存したもの', url: 'https://web.archive.org/web/20240219081616/https://dl.acm.org/doi/pdf/10.1145/1067629.806531', accessed: '2026-11-21', version: '1975年11月、132〜140ページ（DOI 10.1145/800213.806531。保存されていたのは ACM SIGOPS Operating Systems Review 9巻5号の版）', note: '要旨（カーネルをほぼ仕組みだけで作ったこと、残った方針の判断は物理的な資源の取り合いの調停と公平さのためだけにあること）、序論（方針を利用者のレベルに置く理由、保護・公平さ・速さの3つの制約、方針と仕組みの分離の定義）、方針と仕組みの区別は相対的で階層になること、2節の KMPS と方針モジュール（パラメーターの種類、停止の知らせ、パラメーターを持つ方針、実装できる方針の範囲がパラメーターで決まること）。' },
    { title: 'HYDRA: The Kernel of a Multiprocessor Operating System', publisher: 'W. Wulf ほか / Communications of the ACM（University of Wisconsin–Madison の講義のページに置かれた複製）', url: 'https://swift.sites.cs.wisc.edu/classes/cs736-fa06/papers/hydra.pdf', accessed: '2026-11-21', version: '17巻6号（1974年6月）', note: '設計の考え方の2つ目に仕組みと方針の分離を挙げ、Brinch Hansen の議論に触れていること。保護は仕組みでセキュリティは方針だという説明。C.mmp に16台のプロセッサーを接続できること。' },
    { title: 'actionpack/lib/action_controller/metal/rate_limiting.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/rate_limiting.rb#L10-L90`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'rate_limit の引数と既定値、before_action として登録し only: などをそのまま渡すこと、キーを rate-limit・scope・name・by から作ること、store.increment で数えて count && count > to のときだけ with を呼ぶこと、rate_limit.action_controller の通知と payload。' },
    { title: 'ActionController::RateLimiting::ClassMethods', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActionController/RateLimiting/ClassMethods.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'to: と within: の意味、by: の既定が IP アドレスであること、超えたときに TooManyRequests を発生させ Action Dispatch が 429 にすること、ストアの既定が config.action_controller.cache_store（既定は config.cache_store）で store: で変えられること、name: と scope: の使い方。' },
    { title: 'activesupport/lib/active_support/cache/memory_store.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/cache/memory_store.rb#L243-L261`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'increment（modify_value）が synchronize の中で読み書きし、既存の値の expires_at を引き継ぐこと、期限切れや値がないときは新しく書くこと。同じファイルの7〜27行目に、値を同じプロセスの中に持ちスレッドセーフであるという説明。' },
    { title: 'activesupport/lib/active_support/cache/redis_cache_store.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/cache/redis_cache_store.rb#L456-L478`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'increment が INCRBY で数を増やし、EXPIRE の NX が使えるときはそれで、使えないときは TTL を確かめて期限がないときだけ期限を付けること。' },
    { title: 'activesupport/lib/active_support/cache/null_store.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/cache/null_store.rb#L28-L29`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'NullStore の increment が何もせず nil を返すこと。' },
    { title: 'Caching with Rails: An Overview（Cache Stores）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/caching_with_rails.html#activesupport-cache-memorystore', accessed: '2026-11-21', version: 'Rails 8.1', note: 'MemoryStore は同じプロセスの中に値を持ち、Puma のクラスターモードなどではプロセスの間で共有できないこと。Solid Cache がデータベースを使うストアで新しいアプリの既定であること。NullStore は値を保存せず、開発とテストの環境のためのものであること。' },
    { title: 'RFC 6585: Additional HTTP Status Codes', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc6585#section-4', accessed: '2026-11-21', version: '2012年4月', note: '429 Too Many Requests は、利用者が決まった時間の中で多すぎる要求を送ったこと（レート制限）を表すこと。' },
    { title: 'actionpack/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/CHANGELOG.md#L344-L503`, accessed: '2026-11-21', version: 'Rails 8.1.0〜8.1.4.1', note: '8.1 で by: と with: にメソッド名を渡せるようになったこと、TooManyRequests を発生させる形に変わったこと、scope: が足されたこと、rate_limit.action_controller の payload に count・to・within・by・name・cache_key が足されたこと。' },
    { title: 'actionpack/lib/action_controller/metal/rate_limiting.rb（Rails 7.2.2.1）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.2.1/actionpack/lib/action_controller/metal/rate_limiting.rb#L47-L60', accessed: '2026-11-21', version: 'Rails 7.2.2.1（rubygems.org の gem で確認）', note: '7.2 の rate_limit の引数（name: と scope: がない）、with: の既定が head :too_many_requests であること、キーが controller_path と by の値から作られること、by と with を instance_exec で呼ぶこと、通知の payload が request だけであること。' },
    { title: 'actionpack/lib/action_dispatch/middleware/exception_wrapper.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/exception_wrapper.rb#L26`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'ActionController::TooManyRequests を :too_many_requests（429）の応答にすること。' },
    { title: 'railties/lib/rails/generators/rails/authentication/templates/app/controllers/sessions_controller.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/authentication/templates/app/controllers/sessions_controller.rb.tt#L3`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: '認証のジェネレーターの SessionsController に rate_limit to: 10, within: 3.minutes, only: :create があること。同じディレクトリの passwords_controller.rb.tt の5行目にも同じ宣言があること。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: 'Convention over Configuration（一度決めれば済む判断を誰かが代わりに決めるほうがよいこと）と、The menu is omakase（取り替えはできるが強制しないこと）。' },
    { title: 'lib/pundit/context.rb と README', publisher: 'varvet/pundit（GitHub）', url: 'https://github.com/varvet/pundit/blob/v2.5.2/lib/pundit/context.rb#L62-L73', accessed: '2026-11-21', version: 'Pundit 2.5.2（手元の gem で確認）', note: 'authorize がポリシーのクラスを探してクエリのメソッドを呼び、false なら NotAuthorizedError を発生させること。README で、ポリシーのクラスが普通の Ruby のクラスであり、認可の判断をそこに書くこと。' },
    { title: 'activejob/lib/active_job/exceptions.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/exceptions.rb#L64-L83`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'retry_on が rescue_from で例外を受け、実行の回数が attempts より少なければ待ち時間を計算して retry_job し、超えたら例外を投げ直すこと。47行目のコメントに wait: :polynomially_longer, attempts: 10 の例があること。' },
    { title: 'Design Patterns: Elements of Reusable Object-Oriented Software', publisher: 'Erich Gamma ほか / Addison-Wesley（InformIT の書籍ページ）', url: 'https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610', accessed: '2026-11-13', version: '1994年刊', note: 'Strategy の別名が Policy であること（第9部の Strategy / Policy の章の出典を流用）。' },
  ],
}

export default chapter
