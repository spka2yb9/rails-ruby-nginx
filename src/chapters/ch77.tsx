import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 75-1 契約の状態を調べる3か所と、問題が起きる箇所 ---------- */
const sceneCallers = [
  { y: 20, lines: ['VideosController#show（視聴）', 'active? && ends_on >= 今日 なら再生'], issue: '解約予約（canceled）を見落とし、期間中でも 403' },
  { y: 124, lines: ['ExpireSubscriptionsJob（毎日 0時10分）', 'canceled で ends_on <= 今日 なら expired'], issue: '最終日の 0時10分に終了にする（<= で最終日を含める）' },
  { y: 228, lines: ['Admin::ExtensionsController（延長）', 'status を active、ends_on を +7日'], issue: '解約予約が active に戻り、翌月も請求される' },
]

function SceneFigure() {
  return (
    <Svg
      id="75-1"
      w={780}
      h={384}
      label="契約の状態を調べて判断する場所が3か所ある。VideosController#show は active? で ends_on が今日以降なら再生し、解約予約（canceled）を見落として期間中でも 403 を返す。ExpireSubscriptionsJob は毎日0時10分に、canceled で ends_on が今日以前の契約を expired にし、最終日の0時10分に終了にしてしまう。Admin::ExtensionsController は status を active にして ends_on を7日延ばし、解約予約が active に戻って翌月も請求される。3か所とも Subscription モデルの status と ends_on を読んで自分で判断し、書き込む。Subscription は subscriptions テーブルの行を読み書きするだけで、規則を持たない"
    >
      {sceneCallers.map((c) => (
        <g key={c.lines[0]}>
          <Box x={20} y={c.y} w={320} h={52} lines={c.lines} fs={12} bold subTone="muted" />
          <T x={24} y={c.y + 70} fs={11} tone="danger">
            {c.issue}
          </T>
          <Arrow x1={340} y1={c.y + 26} x2={468} y2={150} accent />
        </g>
      ))}
      <Box x={470} y={108} w={290} h={84} lines={['Subscription', 'enum :status（active・canceled・expired）', 'ends_on（請求期間の最終日）']} fs={12} bold subTone="muted" />
      <line x1={615} y1={192} x2={615} y2={252} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <Box x={530} y={254} w={170} h={34} lines="subscriptions" fs={12} fill="box4" mono />
      <T x={624} y={222} fs={11} tone="muted">
        読み書きされるだけ
      </T>
      <T x={470} y={318} fs={12} tone="danger">
        3か所がそれぞれ自分の規則で判断する
      </T>
      <T x={20} y={364} fs={11} tone="muted">
        青い矢印は、status と ends_on を読み、呼び出し側で判断して書き込む処理。赤い文字は次の項で確かめる問題
      </T>
    </Svg>
  )
}

/* ---------- 図 75-3 聞いてから判断する流れと、頼む流れ ---------- */
function AskTellFigure() {
  const ask = { c: 100, s: 300 }
  const tell = { c: 490, s: 690 }
  return (
    <Svg
      id="75-3"
      w={780}
      h={368}
      label="管理画面の延長を例にした、聞いてから判断する流れと頼む流れ。左の直す前では、Admin::ExtensionsController が Subscription に status を聞いて canceled を受け取り、ends_on を聞いて 2026-12-10 を受け取り、自分で「active にして7日延ばす」と決めて update! を送る。判断は呼び出し側にある。右の直した後では、コントローラーは extend_period!(7) を送るだけで、Subscription が終了した契約なら断り、そうでなければ ends_on を7日延ばして update! し、結果を返す。判断はデータの持ち主にある"
    >
      <T x={10} y={14} bold>
        聞いてから判断する（直す前）
      </T>
      <T x={400} y={14} bold>
        頼む（直した後）
      </T>
      <line x1={390} y1={6} x2={390} y2={330} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {[ask, tell].map((p) => (
        <g key={p.c}>
          <Box x={p.c - 90} y={30} w={180} h={34} lines="Admin::ExtensionsController" fs={10} bold mono />
          <Box x={p.s - 70} y={30} w={140} h={34} lines="Subscription" fs={12} bold />
          <line x1={p.c} y1={64} x2={p.c} y2={300} stroke="var(--fig-line)" strokeDasharray="3 4" />
          <line x1={p.s} y1={64} x2={p.s} y2={300} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <Arrow x1={ask.c} y1={98} x2={ask.s - 2} y2={98} />
      <T x={200} y={88} anchor="middle" fs={11} mono>
        status
      </T>
      <Arrow x1={ask.s} y1={122} x2={ask.c + 2} y2={122} dashed />
      <T x={200} y={112} anchor="middle" fs={11} tone="muted" mono>
        "canceled"
      </T>
      <Arrow x1={ask.c} y1={152} x2={ask.s - 2} y2={152} />
      <T x={200} y={142} anchor="middle" fs={11} mono>
        ends_on
      </T>
      <Arrow x1={ask.s} y1={176} x2={ask.c + 2} y2={176} dashed />
      <T x={200} y={166} anchor="middle" fs={11} tone="muted" mono>
        2026-12-10
      </T>
      <Box x={22} y={192} w={156} h={46} lines={['active にして', '7日延ばすと決める']} fs={11} fill="bg" />
      <Arrow x1={ask.c} y1={268} x2={ask.s - 2} y2={268} />
      <T x={200} y={258} anchor="middle" fs={11} mono>
        update!(status: "active", …)
      </T>
      <T x={10} y={322} fs={12} tone="danger">
        判断は呼び出し側にある
      </T>
      <Arrow x1={tell.c} y1={98} x2={tell.s - 2} y2={98} accent />
      <T x={590} y={88} anchor="middle" fs={11} mono>
        extend_period!(7)
      </T>
      <Box x={604} y={118} w={170} h={70} lines={['終了した契約なら断る', 'ends_on を7日延ばす', 'update!（status は変えない）']} fs={11} fill="box5" />
      <Arrow x1={tell.s} y1={214} x2={tell.c + 2} y2={214} dashed />
      <T x={590} y={204} anchor="middle" fs={11} tone="muted" mono>
        true
      </T>
      <T x={400} y={322} fs={12} tone="acc">
        判断はデータの持ち主にある
      </T>
      <T x={10} y={352} fs={11} tone="muted">
        実線の矢印はメッセージ、破線の矢印は戻り値。縦の破線は時間の流れ（上から下）
      </T>
    </Svg>
  )
}

/* ---------- 図 75-4 デメテルの法則との関係 ---------- */
const lodCells = [
  { col: 0, row: 0, title: '隣に送るが、外で判断する', code: ['subscription.active? &&', '  subscription.ends_on >= Date.current'], note: 'この章の直す前。delegate で値を運ぶだけでも同じ', tone: 'danger' as const },
  { col: 1, row: 0, title: '隣に送り、判断も頼む', code: ['subscription.usable_on?(Date.current)', 'order.customer_prefecture_remote?'], note: 'この章とデメテルの法則の章の、直した後', tone: 'acc' as const },
  { col: 0, row: 1, title: '関連をたどり、外で判断する', code: ['%w[北海道 沖縄県].include?(', '  order.customer.address.prefecture.name)'], note: 'デメテルの法則の章の直す前。両方に反する', tone: 'danger' as const },
  { col: 1, row: 1, title: '判断は持ち主にあるが、関連をたどる', code: ['order.customer.address', '  .prefecture.remote?'], note: '途中の nil と、構造への依存が残る', tone: 'muted' as const },
]

function DemeterFigure() {
  const cx = (c: number) => 170 + c * 305
  const cy = (r: number) => 60 + r * 150
  return (
    <Svg
      id="75-4"
      w={780}
      h={384}
      label="横の軸は Tell, Don't Ask（値を取り出して外で判断しているか）、縦の軸はデメテルの法則（隣の相手にだけ送っているか）。隣に送るが外で判断する例は、この章の直す前の subscription.active? && subscription.ends_on >= Date.current で、delegate で値を運んで判断する場合も同じ。隣に送り判断も頼む例は subscription.usable_on?(Date.current) と order.customer_prefecture_remote? で、両方に沿う。関連をたどり外で判断する例は、デメテルの法則の章の直す前の、都道府県の名前を取り出して遠方を判断する式で、両方に反する。判断は持ち主にあるが関連をたどる例は order.customer.address.prefecture.remote? で、途中の nil と構造への依存が残る"
    >
      <T x={322} y={20} anchor="middle" bold>
        外で判断する
      </T>
      <T x={627} y={20} anchor="middle" bold>
        持ち主に頼む
      </T>
      <T x={475} y={42} anchor="middle" fs={11} tone="muted">
        Tell, Don't Ask：値を取り出して、呼び出し側で判断しているか
      </T>
      <T x={20} y={124} bold>
        隣にだけ送る
      </T>
      <T x={20} y={274} bold>
        関連をたどる
      </T>
      <T x={20} y={144} fs={11} tone="muted">
        デメテルの法則
      </T>
      <T x={20} y={160} fs={11} tone="muted">
        誰に送っているか
      </T>
      {lodCells.map((c) => (
        <g key={c.title}>
          <Box x={cx(c.col)} y={cy(c.row)} w={295} h={140} fill={c.col === 1 && c.row === 0 ? 'box5' : 'bg'} accent={c.col === 1 && c.row === 0} />
          <T x={cx(c.col) + 12} y={cy(c.row) + 20} fs={12} bold>
            {c.title}
          </T>
          {c.code.map((line, i) => (
            <T key={line} x={cx(c.col) + 12} y={cy(c.row) + 50 + i * 20} fs={11} mono>
              {line}
            </T>
          ))}
          <T x={cx(c.col) + 12} y={cy(c.row) + 118} fs={11} tone={c.tone}>
            {c.note}
          </T>
        </g>
      ))}
      <T x={20} y={372} fs={11} tone="muted">
        2つの原則は確かめる点が違う。左上は隣にだけ送っていても、Tell, Don't Ask には反している
      </T>
    </Svg>
  )
}

/* ---------- 図 75-5 直す前と後：規則がある場所と、規則を変えるときに直す場所 ---------- */
const beforeCallers = [
  ['VideosController', 'active? && ends_on >= 今日'],
  ['ExpireSubscriptionsJob', 'canceled で ends_on <= 今日'],
  ['Admin::ExtensionsController', 'active にして +7日'],
]
const afterCallers = [
  ['VideosController', 'usable_on?(今日)'],
  ['ExpireSubscriptionsJob', 'expire!(今日)'],
  ['Admin::ExtensionsController', 'extend_period!(7)'],
]

function CompareFigure() {
  const cy = (i: number) => 36 + i * 58
  return (
    <Svg
      id="75-5"
      w={780}
      h={412}
      label="直す前は、VideosController が active? と ends_on >= 今日、ExpireSubscriptionsJob が canceled と ends_on <= 今日、Admin::ExtensionsController が active にして7日延ばす、という規則をそれぞれ持ち、Subscription は status と ends_on を持つだけ。直した後は、3か所はそれぞれ usable_on?(今日)、expire!(今日)、extend_period!(7) を呼ぶだけで、規則は Subscription の usable_on?・expire!・extend_period! にある。規則を「最終日の翌日まで見られる」に変えるとき、直す前は videos_controller.rb の >= と expire_subscriptions_job.rb の <= の2か所をそろえて直す必要があり、忘れるとまた食い違う。直した後は subscription.rb の usable_on? の1行を直せば、expire! が usable_on? を使うのでジョブもそろう"
    >
      <T x={10} y={14} bold>
        直す前
      </T>
      <T x={400} y={14} bold>
        直した後
      </T>
      <line x1={390} y1={6} x2={390} y2={372} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {beforeCallers.map((c, i) => (
        <g key={c[0]}>
          <Box x={14} y={cy(i)} w={226} h={46} lines={c} fs={11} bold subTone="muted" />
          <Arrow x1={240} y1={cy(i) + 23} x2={276} y2={115} accent />
        </g>
      ))}
      <Box x={278} y={80} w={104} h={70} lines={['Subscription', 'status', 'ends_on']} fs={12} bold subTone="muted" />
      <T x={14} y={222} fs={12} tone="danger">
        規則が3か所に分かれている
      </T>
      {afterCallers.map((c, i) => (
        <g key={c[0]}>
          <Box x={402} y={cy(i)} w={190} h={46} lines={c} fs={11} bold subTone="muted" />
          <Arrow x1={592} y1={cy(i) + 23} x2={620} y2={115} accent />
        </g>
      ))}
      <Box x={622} y={44} w={150} h={142} lines={['Subscription', 'status・ends_on', 'usable_on?(date)', 'expire!(date)', 'extend_period!(days)']} fs={11} fill="box5" bold accent />
      <T x={402} y={222} fs={12} tone="acc">
        規則は Subscription の1か所
      </T>
      <line x1={10} y1={246} x2={770} y2={246} stroke="var(--fig-line)" />
      <T x={10} y={266} bold>
        規則を「最終日の翌日まで見られる」に変えるとき
      </T>
      <Box x={14} y={284} w={366} h={78} fill="bg" />
      <T x={26} y={304} fs={12} mono>
        videos_controller.rb の &gt;= を直す
      </T>
      <T x={26} y={324} fs={12} mono>
        expire_subscriptions_job.rb の &lt;= を直す
      </T>
      <T x={26} y={346} fs={12} tone="danger">
        2か所をそろえ忘れると、また食い違う
      </T>
      <Box x={402} y={284} w={370} h={78} fill="bg" />
      <T x={414} y={304} fs={12} mono>
        subscription.rb の usable_on? の1行を直す
      </T>
      <T x={414} y={330} fs={12} tone="acc">
        expire! は usable_on? を使うので、
      </T>
      <T x={414} y={348} fs={12} tone="acc">
        ジョブの判断も同じ規則にそろう
      </T>
      <T x={10} y={396} fs={11} tone="muted">
        上段の青い矢印は呼び出し。直す前は状態を読んで判断し、直した後は判断と更新を Subscription に頼む
      </T>
    </Svg>
  )
}

/* ---------- 図 75-6 データと振る舞いの位置 ---------- */
const dbCallers = [
  { y: 112, name: 'VideosController', to: 142 },
  { y: 160, name: 'SubscriptionsHelper（管理画面）', to: 166 },
  { y: 214, name: 'ExpireSubscriptionsJob', to: 222 },
  { y: 262, name: 'Admin::ExtensionsController', to: 244 },
]

function DataBehaviorFigure() {
  return (
    <Svg
      id="75-6"
      w={780}
      h={386}
      label="Subscription のクラスに、データ（status と ends_on）、問い合わせ（usable_on?(date) と、enum が作る active?・canceled?・expired?）、命令（expire!(date) と extend_period!(days)）をまとめた。VideosController と管理画面の SubscriptionsHelper は問い合わせを呼び、ExpireSubscriptionsJob と Admin::ExtensionsController は命令を呼ぶ。命令は update! で subscriptions テーブルに書き込む。問い合わせは状態を変えずに値を返し、呼び出し側はその値で画面の応答や表示を決める。命令は状態を変え、規則に合わないときは何もしないか例外で断る"
    >
      <Box x={290} y={20} w={280} h={34} lines="Subscription" fs={13} bold rx={0} accent />
      <Box x={290} y={54} w={280} h={56} lines={['データ', 'status（enum）・ends_on']} fs={12} bold rx={0} fill="box4" />
      <Box x={290} y={110} w={280} h={76} lines={['問い合わせ（状態を変えない）', 'usable_on?(date)', 'active?・canceled?・expired?（enum）']} fs={12} bold rx={0} />
      <Box x={290} y={186} w={280} h={76} lines={['命令（状態を変える）', 'expire!(date)', 'extend_period!(days)']} fs={12} bold rx={0} fill="box5" />
      {dbCallers.map((c) => (
        <g key={c.name}>
          <Box x={20} y={c.y} w={232} h={36} lines={c.name} fs={11} bold />
          <Arrow x1={252} y1={c.y + 18} x2={288} y2={c.to} accent />
        </g>
      ))}
      <Arrow x1={570} y1={224} x2={638} y2={224} />
      <T x={604} y={212} anchor="middle" fs={11} mono>
        update!
      </T>
      <Box x={640} y={207} w={130} h={34} lines="subscriptions" fs={12} fill="box4" mono />
      <T x={20} y={308} fs={12}>
        問い合わせは状態を変えずに値を返す。呼び出し側はその値で自分の仕事（画面の応答・表示）を決める
      </T>
      <T x={20} y={332} fs={12}>
        命令は状態を変える。規則に合わないときは、何もしないか例外で断る
      </T>
      <T x={20} y={368} fs={11} tone="muted">
        上の2つの呼び出し側は問い合わせを、下の2つは命令を呼ぶ。規則（いつまで見られるか）はクラスの中の1か所にある
      </T>
    </Svg>
  )
}

/* ---------- 図 75-7 どこに判断を置くか ---------- */
function JudgeFigure() {
  return (
    <Svg
      id="75-7"
      w={780}
      h={452}
      label="呼び出し側が契約の状態を使って何かを決めたいときの判断。まず、契約のほかに会員・権限・キャンペーンなど別のオブジェクトの情報も使う判断なら、Policy やサービスに置く（例は Pundit の Policy や Use Case）。次に、契約のデータだけで決まる業務の規則（視聴できるか・終了させるか・延ばせるか）なら、Subscription のメソッドにする（例は usable_on?・expire!・extend_period!）。次に、画面・メール・CSV ごとの見せ方（文言・色・書式）なら、ヘルパー・ビュー・メーラーに置き、判断は Subscription の問い合わせを使う。どれでもなく値を表示・出力するだけなら、属性をそのまま読んでよい（ends_on など）"
    >
      <Box x={20} y={14} w={340} h={44} lines="呼び出し側が契約の状態を使って何かを決めたい" fs={12} bold />
      <Box x={20} y={88} w={340} h={54} lines={['契約のほかに、会員・権限・キャンペーンなど', '別のオブジェクトの情報も使う判断か']} fs={12} />
      <Box x={20} y={178} w={340} h={54} lines={['契約のデータだけで決まる業務の規則か', '（視聴できるか・終了させるか・延ばせるか）']} fs={12} />
      <Box x={20} y={268} w={340} h={54} lines={['画面・メール・CSV ごとの', '見せ方（文言・色・書式）か']} fs={12} />
      <Box x={420} y={88} w={350} h={54} lines={['Policy やサービスに置く', '例：Pundit の Policy、Use Case']} fs={12} fill="box2" bold subTone="muted" />
      <Box x={420} y={178} w={350} h={54} lines={['Subscription のメソッドにする', '例：usable_on?・expire!・extend_period!']} fs={12} fill="box5" bold accent subTone="muted" />
      <Box x={420} y={268} w={350} h={54} lines={['ヘルパー・ビュー・メーラーに置く', '判断は Subscription の問い合わせを使う']} fs={12} fill="box2" bold subTone="muted" />
      <Box x={20} y={358} w={340} h={54} lines={['値を表示・出力するだけなら', '属性をそのまま読んでよい（ends_on など）']} fs={12} fill="box2" bold subTone="muted" />
      <Arrow x1={190} y1={58} x2={190} y2={86} />
      <Arrow x1={360} y1={115} x2={418} y2={115} />
      <Arrow x1={190} y1={142} x2={190} y2={176} />
      <Arrow x1={360} y1={205} x2={418} y2={205} />
      <Arrow x1={190} y1={232} x2={190} y2={266} />
      <Arrow x1={360} y1={295} x2={418} y2={295} />
      <Arrow x1={190} y1={322} x2={190} y2={356} />
      {[106, 196, 286].map((y) => (
        <T key={y} x={389} y={y} anchor="middle" fs={11} tone="muted">
          はい
        </T>
      ))}
      {[160, 250, 340].map((y) => (
        <T key={y} x={198} y={y} fs={11} tone="muted">
          いいえ
        </T>
      ))}
      <T x={420} y={366} fs={12} tone="danger">
        画面ごとの見せ方を Subscription に置くと、
      </T>
      <T x={420} y={384} fs={12} tone="danger">
        画面の変更のたびにモデルを直すことになる
      </T>
      <T x={20} y={440} fs={11} tone="muted">
        上から順に確かめる。色の付いた箱は判断の置き場所。強調の枠は、この章で Subscription に移したもの
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 77,
  part: 8,
  title: "Tell, Don't Ask：サブスクリプションの状態を聞いて外で判断しない",
  summary:
    '動画の配信サービスの有料会員の契約で、動画の画面・毎日のジョブ・管理画面の延長が、それぞれ status と ends_on を読んで判断したために、解約予約の会員が期間中に見られず、最終日に終了になり、延長で解約が消える場面から始めます。Hunt と Thomas の2003年のコラムと Fowler の説明で原則の意味を確かめ、判断を Subscription の問い合わせ（usable_on?）と命令（expire!・extend_period!）に移します。最後に、表示まで Subscription に頼みすぎたときの問題と、enum が作るメソッドとの関係を扱います。',
  goals: [
    '状態を聞いて呼び出し側で判断し、その結果で相手の状態を変えるコードが、判断の食い違いを生む理由を説明できる',
    'Hunt と Thomas のコラムと Fowler の記事にある Tell, Don\'t Ask の定義と、デメテルの法則との違いを説明できる',
    'モデルのメソッドを問い合わせ（状態を変えない）と命令（状態を変える）に分け、規則を1か所に移せる',
    '画面ごとの見せ方や、複数のオブジェクトにまたがる判断を、モデルではなくヘルパーや Policy に置く判断ができる',
    'enum が作る「!」のメソッドや update_all が、モデルの規則を通らずに状態を変えることを説明し、対策を選べる',
  ],
  prerequisites: [14, 74],
  sections: [
    {
      id: 'scene',
      title: '視聴・ジョブ・管理画面がそれぞれ契約の状態を調べて判断する',
      body: (
        <>
          <p>
            この章では、有料会員の契約の状態を呼び出し側が調べて判断している例を使って、<Term>Tell, Don't Ask</Term>を扱います。Tell, Don't Ask はオブジェクトの状態を問い合わせて外で判断するのではなく、オブジェクト自身に振る舞いを実行させる原則です。まず、判断が3か所に分かれたコードを動かして、食い違いを確かめます。
          </p>
          <h3>そもそも何をする業務か</h3>
          <p>
            動画の配信サービスで、会員が月額の有料会員になると動画を見られるとします。このような月ごとの契約を<Term en="subscription">サブスクリプション</Term>と呼びます。料金は請求期間ごとの前払いで、契約は今の請求期間の最終日（ends_on）を持ちます。継続中の契約は最終日を過ぎると決済の処理で次の期間に更新されます（更新の処理はこの章では扱いません）。
          </p>
          <p>
            会員は解約を申し込めます。今の期間の料金はすでに払っているので、解約を申し込んだ契約も最終日までは動画を見られ、最終日の翌日に終わります。この「解約を申し込んだが、まだ期間が残っている」状態を、この章では解約予約と呼びます。契約の状態は次の3つです。
          </p>
          <ul>
            <li>active（継続中）：最終日まで見られ、最終日を過ぎると更新される</li>
            <li>canceled（解約予約）：最終日まで見られ、最終日の翌日に終わる</li>
            <li>expired（終了）：見られない</li>
          </ul>
          <p>
            状態を使う処理は3か所にあります。動画の画面は、会員が動画を見られるかを判断します。毎日0時10分に動くジョブは、最終日を過ぎた解約予約を終了にします。管理画面では、配信の障害があったときに、担当者がお詫びとして契約の期間を7日延ばします。延長しても、解約予約の契約は解約予約のままで、延ばした最終日の翌日に終わるのが正しい動きです。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_subscriptions.rb"
            code={`
class CreateSubscriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :members do |t|
      t.string :name, null: false
    end
    create_table :subscriptions do |t|
      t.references :member, null: false, foreign_key: true, index: { unique: true }
      t.string :status, null: false, default: "active" # active・canceled・expired
      t.date :ends_on, null: false # 今の請求期間の最終日（この日まで視聴できる）
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/member.rb・subscription.rb（直す前）"
            code={`
class Member < ApplicationRecord
  has_one :subscription
end

class Subscription < ApplicationRecord
  belongs_to :member
  # active：継続中、canceled：解約予約（最終日まで視聴できる）、expired：終了
  enum :status, { active: "active", canceled: "canceled", expired: "expired" }
end
`}
          />
          <p>
            <code>enum</code> は列の値に名前を付ける Active Record の機能です。<code>enum :status, {'{ … }'}</code> と書くと、状態を確かめる <code>active?</code>、状態を変える <code>active!</code>、その状態の行を探す scope の <code>Subscription.active</code> などが作られます<Ref n={6} />。この章では DB に文字列で保存する形にしています。
          </p>
          <h3>状態を調べて判断する3か所のコード</h3>
          <Code
            lang="ruby"
            title="app/controllers/videos_controller.rb（直す前）"
            code={`
# 動画の再生の画面。有料会員だけが見られる
class VideosController < ApplicationController
  def show
    subscription = Subscription.find_by!(member_id: params[:member_id]) # 実際はログイン中の会員から探す
    if subscription.active? && subscription.ends_on >= Date.current
      render plain: "再生します"
    else
      render plain: "有料会員の登録が必要です", status: :forbidden
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/jobs/expire_subscriptions_job.rb（直す前）"
            code={`
# 毎日 0時10分に動き、期間の終わった解約予約を終了にする
class ExpireSubscriptionsJob < ApplicationJob
  def perform
    Subscription.where(status: "canceled").where("ends_on <= ?", Date.current).update_all(status: "expired")
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/admin/extensions_controller.rb（直す前）"
            code={`
# 管理画面：障害のお詫びとして、契約の期間を7日延ばす
class Admin::ExtensionsController < ApplicationController
  def create
    subscription = Subscription.find(params[:subscription_id])
    subscription.update!(status: "active", ends_on: subscription.ends_on + 7)
    redirect_to "/admin/subscriptions", notice: "7日延長しました"
  end
end
`}
          />
          <Figure n="75-1" title="契約の状態を調べる3か所と、問題が起きる箇所" caption="赤い文字は、次の項で確かめる問題。">
            <SceneFigure />
          </Figure>
          <p>
            図 75-1 のとおり、3か所はどれも Subscription から status と ends_on を読み、それぞれの書き方で判断して書き込んでいます。Subscription は列を持つだけで、「いつまで見られるか」という規則を持っていません。
          </p>
          <p>
            このようなコードは機能を足していく途中でよくできあがります。最初は継続中と終了の2つの状態しかなく、動画の画面は <code>active?</code> だけを確かめていました。後から解約予約を足したとき、ジョブと管理画面は書きましたが、動画の画面は直し忘れました。ジョブを書いた人は「最終日に終える」と考えて <code>&lt;=</code> と書き、管理画面を書いた人は「延長したら使えるようにする」と考えて status を active にしました。
          </p>
          <h3>動かして確かめる</h3>
          <p>
            3つの契約を作り、2026年11月30日の0時10分にジョブを、10時に動画の画面と管理画面の延長を動かすスクリプトを書きました。時刻は travel_to で固定し、画面は Rack::MockRequest でアプリに直接リクエストを送って呼んでいます。
          </p>
          <Code
            lang="ruby"
            title="script/scene.rb（seed_subscriptions は script/data.rb にある、3つの契約を作り直すメソッド）"
            code={`
# 3つの契約について、視聴の画面・0時10分のジョブ・管理画面の延長がそれぞれ何をするかを並べる
require "active_support/testing/time_helpers"
require_relative "data"
include ActiveSupport::Testing::TimeHelpers
ActionController::Base.allow_forgery_protection = false # スクリプトから POST するため

app = Rack::MockRequest.new(Rails.application)
at = ->(time, &block) { travel_to(Time.zone.parse("2026-11-30 #{time}"), &block) }
results = Hash.new { |h, k| h[k] = {} }

seed_subscriptions.each do |key, (label, sub)|
  results[key][:before] = "#{label}（#{sub.status}、最終日 #{sub.ends_on}）"
  res = at.("10:00") { app.get("/videos/1?member_id=#{sub.member_id}", "HTTP_HOST" => "localhost") }
  results[key][:video] = "#{res.status} #{res.body}"
end

subs = seed_subscriptions
at.("00:10") { ExpireSubscriptionsJob.perform_now }
subs.each { |key, (_, sub)| results[key][:job] = sub.reload.status }

seed_subscriptions.each do |key, (_, sub)|
  at.("10:00") { app.post("/admin/subscriptions/#{sub.id}/extension", "HTTP_HOST" => "localhost") }
  sub.reload
  results[key][:extend] = "#{sub.status}、最終日 #{sub.ends_on}"
end

results.each do |key, r|
  puts "#{key}：#{r[:before]}"
  puts "  10時に動画を開く        → #{r[:video]}"
  puts "  0時10分のジョブの後     → #{r[:job]}"
  puts "  管理画面で7日延長した後 → #{r[:extend]}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb）"
            code={`
A：継続中（active、最終日 2026-12-15）
  10時に動画を開く        → 200 再生します
  0時10分のジョブの後     → active
  管理画面で7日延長した後 → active、最終日 2026-12-22
B：解約予約（canceled、最終日 2026-12-10）
  10時に動画を開く        → 403 有料会員の登録が必要です
  0時10分のジョブの後     → canceled
  管理画面で7日延長した後 → active、最終日 2026-12-17
C：解約予約・今日が最終日（canceled、最終日 2026-11-30）
  10時に動画を開く        → 403 有料会員の登録が必要です
  0時10分のジョブの後     → expired
  管理画面で7日延長した後 → active、最終日 2026-12-07
`}
          />
          <Figure n="75-2" title="2026年11月30日の判断と、正しい結果" caption="× は誤った結果。括弧の中は業務の規則どおりの結果。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">契約</th>
                    <th scope="col">10時に動画を開く</th>
                    <th scope="col">0時10分のジョブの後</th>
                    <th scope="col">管理画面で7日延長した後</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">A 継続中（最終日 12月15日）</th>
                    <td>200 再生する</td>
                    <td>active のまま</td>
                    <td>active、最終日 12月22日</td>
                  </tr>
                  <tr>
                    <th scope="row">B 解約予約（最終日 12月10日）</th>
                    <td>× 403（正しくは 200）</td>
                    <td>canceled のまま</td>
                    <td>× active に変わる（正しくは canceled のまま、最終日 12月17日）</td>
                  </tr>
                  <tr>
                    <th scope="row">C 解約予約（最終日 11月30日）</th>
                    <td>× 403（正しくは 200）</td>
                    <td>× expired になる（正しくは canceled のまま。12月1日に終了）</td>
                    <td>× active に変わる（正しくは canceled のまま、最終日 12月7日）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>図 75-2 は実行結果を、業務の規則どおりの結果と並べたものです。</p>
          <ul>
            <li>解約予約の B と C は料金を払った期間の中なのに、動画の画面で 403 になりました。動画の画面が <code>active?</code> だけを確かめているからです。</li>
            <li>
              C は最終日の11月30日なのに、0時10分のジョブで終了になりました。ジョブは <code>ends_on &lt;= 今日</code> で最終日を含めて終了にし、動画の画面は <code>ends_on &gt;= 今日</code> で最終日を含めて見せます。同じ「最終日」を、2か所が逆に扱っています。
            </li>
            <li>B と C は管理画面で延長すると active になりました。解約の申し込みが消え、会員は次の請求日に料金を請求されます。</li>
          </ul>
          <p>業務の規則どおりの動きを request spec に書き、直す前のコードで実行しました。</p>
          <Code
            lang="ruby"
            title="spec/requests/subscription_flows_spec.rb"
            code={`
require "rails_helper"

# 視聴の画面・0時10分のジョブ・管理画面の延長が、同じ規則で判断することを確かめる
RSpec.describe "契約の判断", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let(:sub) { Member.create!(name: "会員").create_subscription!(status: "canceled", ends_on: Date.new(2026, 11, 30)) }

  it "解約予約でも最終日までは見られ、ジョブは翌日に終了にする" do
    travel_to(Time.zone.parse("2026-11-30 00:10")) { ExpireSubscriptionsJob.perform_now }
    travel_to(Time.zone.parse("2026-11-30 23:59")) { get video_path(1, member_id: sub.member_id) }
    expect(response).to have_http_status(:ok)

    travel_to(Time.zone.parse("2026-12-01 00:10")) { ExpireSubscriptionsJob.perform_now }
    expect(sub.reload).to be_expired
    travel_to(Time.zone.parse("2026-12-01 10:00")) { get video_path(1, member_id: sub.member_id) }
    expect(response).to have_http_status(:forbidden)
  end

  it "管理画面で延長しても解約予約のまま" do
    post admin_subscription_extension_path(sub)
    expect(sub.reload).to have_attributes(status: "canceled", ends_on: Date.new(2026, 12, 7))
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（直す前のコードで bundle exec rspec spec/requests/subscription_flows_spec.rb）"
            code={`
FF

Failures:

  1) 契約の判断 解約予約でも最終日までは見られ、ジョブは翌日に終了にする
     Failure/Error: expect(response).to have_http_status(:ok)
       expected the response to have status code :ok (200) but it was :forbidden (403)
     # ./spec/requests/subscription_flows_spec.rb:12:in 'block (2 levels) in <top (required)>'

  2) 契約の判断 管理画面で延長しても解約予約のまま
     Failure/Error: expect(sub.reload).to have_attributes(status: "canceled", ends_on: Date.new(2026, 12, 7))

       expected #<Subscription id: 2, member_id: 2, status: "active", ends_on: "2026-12-07"> to have attributes {ends_on: Mon, 07 Dec 2026, status: "canceled"} but had attributes {ends_on: Mon, 07 Dec 2026, status: "active"}
       …（省略）

2 examples, 2 failures
`}
          />
          <h3>このコードの問題</h3>
          <ul>
            <li>「解約予約は最終日まで見られ、最終日の翌日に終わる」という1つの規則を、3か所がそれぞれの書き方で持っています。1か所を直し忘れたり、境界の日を逆に扱ったりすると、画面とジョブの判断が食い違います。</li>
            <li>呼び出し側が状態を読んで判断し、その結果で Subscription の状態を書き換えています。Subscription は、書き込まれた状態が規則に合っているかを確かめられず、解約予約を active に戻す更新も止められません。</li>
            <li>規則を変えるときは、status と ends_on を読んでいる箇所を探して、すべてを同じように直す必要があります。直す前のコードで探した結果です。</li>
          </ul>
          <Code
            lang="text"
            title={`実行結果（grep -rnE "ends_on|active\\?|canceled|expired|status: \\"" app/controllers app/jobs）`}
            code={`
app/controllers/videos_controller.rb:5:    if subscription.active? && subscription.ends_on >= Date.current
app/controllers/admin/extensions_controller.rb:5:    subscription.update!(status: "active", ends_on: subscription.ends_on + 7)
app/jobs/expire_subscriptions_job.rb:4:    Subscription.where(status: "canceled").where("ends_on <= ?", Date.current).update_all(status: "expired")
`}
          />
          <p>
            3つの行はどれも Subscription にだけメッセージを送っています。関連をたどってはいないので、<ChapterLink n={74} />（Law of Demeter）には反していません。問題は、相手の値を取り出して呼び出し側で判断していることです。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: "Tell, Don't Ask の意味と由来",
      body: (
        <>
          <h3>Tell, Don't Ask の定義</h3>
          <p>
            Tell, Don't Ask はオブジェクトの状態を問い合わせて呼び出し側で判断するより、オブジェクト自身に振る舞いを実行させる原則です。そのために、データとそれを使う振る舞いを同じオブジェクトにまとめます。前の節のコードに当てはめると、「この契約は今日見られるか」「この契約を終了にしてよいか」「この契約をどう延ばすか」は、status と ends_on を持つ Subscription が決めることになります。
          </p>
          <h3>Hunt と Thomas の2003年のコラム</h3>
          <p>
            Andy Hunt と Dave Thomas は、IEEE Software の 2003年1・2月号のコラム「The Art of Enbugging」で、この原則を「Tell, don't ask」という見出しで説明しています。コラムは、手続き型のコードは情報を取り出してからその情報に基づいて判断し、オブジェクト指向のコードはオブジェクトに何かをするように命じる、という違いを、Alec Sharp の『Smalltalk by Example』（McGraw-Hill、1997）を挙げて述べています<Ref n={1} />。そのうえで、次のように書いています。
          </p>
          <blockquote>
            オブジェクトに状態を問い合わせ、判断し、それからそのオブジェクトに何をするかを命じる、という書き方ははっきり避けたい。呼び出し側は、呼んだオブジェクトの状態に基づいて判断し、そのオブジェクトの状態を変えるべきではない。実装しようとしているロジックは、たぶん呼び出し側ではなく、呼ばれたオブジェクトの責任である。オブジェクトの外で判断することはカプセル化を破り、バグが入り込みやすくなる。（コラムの「Tell, don't ask」の節から訳した）
          </blockquote>
          <p>
            前の節の管理画面の延長は、この形そのものです。コントローラーが status と ends_on を問い合わせ、「active にして7日延ばす」と判断し、<code>update!</code> で Subscription の状態を変えています。ジョブも status と ends_on の条件を自分で書いて、<code>update_all</code> で状態を変えています。
          </p>
          <h3>命令と問い合わせに分ける</h3>
          <p>
            同じコラムはこの原則を守りやすくする方法として、メソッドを<Term en="command">命令</Term>と<Term en="query">問い合わせ</Term>のどちらかに分け、ソースコードにもそう書いておくことを勧めています。命令はオブジェクトの状態を変えるメソッドで、便利のために値を返してもかまいません。問い合わせはオブジェクトの状態についての情報を返すだけで、外から見える状態を変えません<Ref n={1} />。コラムはこの分け方を command-query separation（命令と問い合わせの分離）と呼び、問い合わせには副作用がないので、テストやデバッガーから自由に呼べると書いています<Ref n={1} />。
          </p>
          <p>
            つまり Tell, Don't Ask は問い合わせのメソッドを禁止する原則ではありません。避けるのは、相手の状態を取り出して呼び出し側で判断し、その結果で相手の状態を変えることです。動画の画面が「見られるか」を問い合わせて、自分の仕事である HTTP の応答を決めるのは、この原則に反しません。ただし、「見られるか」を決める規則そのものは、問い合わせのメソッドの中、つまりデータの持ち主の側に置きます。
          </p>
          <Figure n="75-3" title="聞いてから判断する流れと、頼む流れ" caption="管理画面の延長を例にした。左は前の節のコード、右は次の節で直した後のコード。">
            <AskTellFigure />
          </Figure>
          <p>
            図 75-3 の左では、コントローラーが2回問い合わせてから判断し、その結果で Subscription の状態を書き換えています。右では、コントローラーは「7日延ばしてほしい」と頼むだけで、終了した契約かどうかの確認と、status を変えないという規則は Subscription の中にあります。
          </p>
          <h3>Fowler の説明と注意</h3>
          <p>
            Martin Fowler は 2013年9月の bliki の記事「TellDontAsk」で、Tell, Don't Ask は、オブジェクト指向がデータとそれを扱う関数をまとめるものだと思い出させる原則だと説明しています。オブジェクトにデータを求めてそのデータで処理する代わりに、何をするかをオブジェクトに伝え、振る舞いをデータと同じオブジェクトに移すように促す、という説明です<Ref n={2} />。データとそれを操作する振る舞いは、一方を変えると他方も変わることが多く、一方を理解すると他方も理解しやすいので、同じ場所に置くとよいという理由も挙げています<Ref n={2} />。
          </p>
          <p>
            一方で Fowler は自分ではこの原則を使わないとも書いています。データと振る舞いを同じ場所に置くことは心がけているものの、この原則が、問い合わせのメソッドをすべてなくそうとする人（記事では GetterEradicator と呼んでいます）を生むのを見てきたからです。オブジェクトが情報を提供して協力するほうがうまくいく場面もあり、適切な問い合わせのメソッドがあれば単純になるところを、命じることだけで書いて入り組んだコードも見たと述べています<Ref n={2} />。記事の注ではデータと振る舞いを同じ場所に置くことも、層に分けるといった別の関心のために手放すことがあると書いています<Ref n={2} />。この注意は「当てはめすぎたとき」の節で扱います。
          </p>
          <p>
            Fowler の記事はこの原則を Hunt と Thomas の名前と結びつけ、IEEE Software のコラムを挙げています<Ref n={2} />。この原則を誰が最初に言い出したかを示す資料は、ここでは確かめられませんでした。本書では確かめられた最も早い資料として 2003年のコラムを挙げます。
          </p>
          <h3>デメテルの法則との関係</h3>
          <p>
            <ChapterLink n={74} />（Law of Demeter）は、オブジェクトの内部をたどらず、隣の相手にだけメッセージを送る原則でした。Hunt と Thomas のコラムも Tell, Don't Ask の次の節でデメテルの法則を扱っています<Ref n={1} />。2つの原則は重なりますが、確かめる点が違います。デメテルの法則は「誰にメッセージを送っているか」を、Tell, Don't Ask は「値を取り出して呼び出し側で判断していないか」を確かめます。
          </p>
          <Figure n="75-4" title="Tell, Don't Ask とデメテルの法則の関係" caption="横の軸が Tell, Don't Ask、縦の軸がデメテルの法則。右上が両方に沿う形。">
            <DemeterFigure />
          </Figure>
          <p>
            図 75-4 の左上がこの章の直す前のコードです。Subscription にだけ送っているのでデメテルの法則には沿っていますが、値を取り出して外で判断しているので Tell, Don't Ask には反しています。デメテルの法則の章では関連の先の値を delegate で取り出せるようにしました。値を運ぶだけなら判断は呼び出し側に残り、左上と同じ形になります。遠方の判断を Prefecture#remote? に移したところが Tell, Don't Ask に沿って直した部分でした。右下は、判断は持ち主の Prefecture にあるものの、関連をたどっているので、途中の nil と構造への依存が残ります。
          </p>
          <h3>似た原則との違い</h3>
          <ul>
            <li>
              <ChapterLink n={71} />（Encapsulation）は、内部状態を隠し、必要な操作だけを公開する原則です。Tell, Don't Ask は公開する操作を「状態を返すもの」から「振る舞いを実行するもの」に寄せる方向を示します。Hunt と Thomas は、外で判断することはカプセル化を破ると書いています<Ref n={1} />。
            </li>
            <li>
              <ChapterLink n={69} />（High Cohesion）は、関連の強いデータと処理を同じモジュールにまとめる原則です。Fowler が言う「データと振る舞いを同じ場所に置く」と同じ方向です。
            </li>
            <li>
              <ChapterLink n={73} />（Information Hiding）は、変わりうる設計の判断を1つのモジュールに隠す原則です。「解約予約は最終日まで見られる」は変わりうる業務の規則で、Subscription の中に置くと、変えるときに直す場所が1か所になります。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: '判断と更新を Subscription に移し、呼び出し側は頼むだけにする',
      body: (
        <>
          <h3>問い合わせ：視聴できるかを Subscription が答える</h3>
          <p>
            まず、動画の画面とジョブが別々に書いていた「見られるか」の判断を、Subscription の問い合わせのメソッド <code>usable_on?(date)</code> にします。終了していなければ、最終日までは見られる、という規則です。継続中でも解約予約でも同じ規則なので、status で分ける必要はありません。
          </p>
          <p>
            今日の日付は引数で受け取ります。メソッドの中で <code>Date.current</code> を呼ぶと、結果が実行した時刻で変わり、テストで時刻を固定する必要が出るからです。日付を呼び出し側で決めて渡す理由は、<ChapterLink n={78} />（Functional Core, Imperative Shell）でも扱います。
          </p>
          <h3>命令：状態の変更を Subscription に頼む</h3>
          <p>
            次に、状態を変える処理を命令のメソッドにします。<code>expire!(date)</code> は見られなくなった解約予約を終了にします。<code>extend_period!(days)</code> は status を変えずに最終日を延ばし、終了した契約の延長は例外 NotExtendable で断ります。
          </p>
          <Code
            lang="ruby"
            title="app/models/subscription.rb（直した後）"
            code={`
class Subscription < ApplicationRecord
  class NotExtendable < StandardError; end

  belongs_to :member
  # active：継続中、canceled：解約予約（最終日まで視聴できる）、expired：終了
  enum :status, { active: "active", canceled: "canceled", expired: "expired" }

  # --- 問い合わせ（状態を変えない）

  # date に視聴できるか。解約予約でも、最終日までは見られる
  def usable_on?(date) = !expired? && date <= ends_on

  # --- 命令（状態を変える）

  # 視聴できなくなった解約予約を終了にする。対象でなければ何もせず false を返す
  def expire!(date)
    return false if !canceled? || usable_on?(date)

    update!(status: :expired)
  end

  # お詫びとして期間を延ばす。解約予約は解約予約のまま延ばす
  def extend_period!(days)
    raise NotExtendable, "終了した契約は延長できません" if expired?

    update!(ends_on: ends_on + days)
  end
end
`}
          />
          <p>
            <code>expire!</code> は、終了にする条件を <code>ends_on &lt; date</code> のように別に書かず、「解約予約で、もう見られない」と <code>usable_on?</code> を使って書きました。終了にする日と見られなくなる日を同じメソッドで決めるので、前の節のように最終日の扱いが2か所で逆になることがありません。条件を別に書くと、規則を変えるたびに2つの条件をそろえる必要が残ります。
          </p>
          <p>
            メソッドの並びにも命令と問い合わせの区別をコメントで書きました。Hunt と Thomas のコラムが勧めていた、命令と問い合わせをそれぞれまとめて書く形です<Ref n={1} />。
          </p>
          <h3>呼び出し側：頼むだけにする</h3>
          <Code
            lang="ruby"
            title="app/controllers/videos_controller.rb（直した後）"
            code={`
# 動画の再生の画面。有料会員だけが見られる
class VideosController < ApplicationController
  def show
    subscription = Subscription.find_by!(member_id: params[:member_id]) # 実際はログイン中の会員から探す
    if subscription.usable_on?(Date.current)
      render plain: "再生します"
    else
      render plain: "有料会員の登録が必要です", status: :forbidden
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/jobs/expire_subscriptions_job.rb（直した後）"
            code={`
# 毎日 0時10分に動き、期間の終わった解約予約を終了にする
class ExpireSubscriptionsJob < ApplicationJob
  def perform
    today = Date.current
    Subscription.canceled.find_each { |subscription| subscription.expire!(today) }
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/admin/extensions_controller.rb（直した後）"
            code={`
# 管理画面：障害のお詫びとして、契約の期間を7日延ばす
class Admin::ExtensionsController < ApplicationController
  def create
    subscription = Subscription.find(params[:subscription_id])
    subscription.extend_period!(7)
    redirect_to "/admin/subscriptions", notice: "7日延長しました"
  rescue Subscription::NotExtendable => e
    redirect_to "/admin/subscriptions", alert: e.message
  end
end
`}
          />
          <ul>
            <li>動画の画面は <code>usable_on?</code> を問い合わせ、その結果で HTTP の応答を選びます。応答を選ぶのはコントローラーの仕事なので、ここに if が残るのは自然です。</li>
            <li>
              ジョブは解約予約の契約を1件ずつ読み、<code>expire!</code> を頼みます。終了にするかどうかは Subscription が決めます。解約予約の契約は最終日の翌日に終了になるので、読む件数は「今、解約予約中の契約」の数に限られます。この件数が多く、1件ずつ読むのに時間がかかるようになったら、同じ規則を SQL で書いた scope を Subscription の中、<code>expire!</code> の隣に置きます。そのときは、scope とメソッドが同じ契約を選ぶことをテストで確かめます。
            </li>
            <li>
              直す前のジョブは <code>update_all</code> で1回の UPDATE にまとめていましたが、直した後は1件ごとに <code>update!</code> を実行します。SQL の回数は増えますが、モデルのバリデーションとコールバックを通るようになります。<code>update_all</code> がそれらを通らないことは、後の「Rails の機能・規約との関係」の節で確かめます。
            </li>
            <li>管理画面は <code>extend_period!</code> を頼むだけで、status には触れません。終了した契約を延ばそうとしたときの扱い（例外を受けて文言を表示する）は、画面の仕事なのでコントローラーに残します。</li>
          </ul>
          <h3>動かして確かめる</h3>
          <p>前の節と同じスクリプトを、直した後のコードで実行しました。</p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb）"
            code={`
A：継続中（active、最終日 2026-12-15）
  10時に動画を開く        → 200 再生します
  0時10分のジョブの後     → active
  管理画面で7日延長した後 → active、最終日 2026-12-22
B：解約予約（canceled、最終日 2026-12-10）
  10時に動画を開く        → 200 再生します
  0時10分のジョブの後     → canceled
  管理画面で7日延長した後 → canceled、最終日 2026-12-17
C：解約予約・今日が最終日（canceled、最終日 2026-11-30）
  10時に動画を開く        → 200 再生します
  0時10分のジョブの後     → canceled
  管理画面で7日延長した後 → canceled、最終日 2026-12-07
`}
          />
          <p>
            図 75-2 の × がすべてなくなりました。規則を Subscription のメソッドに移したので、規則のテストは Subscription に対して書けます。状態と最終日の組み合わせを表にして、<code>usable_on?</code> の結果を並べました。
          </p>
          <Code
            lang="ruby"
            title="spec/models/subscription_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Subscription do
  today = Date.new(2026, 11, 30)
  def subscription(status, ends_on)
    Member.create!(name: "会員").create_subscription!(status:, ends_on: Date.parse(ends_on))
  end

  describe "#usable_on?" do
    [
      ["継続中・期間中", "active", "2026-12-15", true],
      ["解約予約・期間中", "canceled", "2026-12-10", true],
      ["解約予約・今日が最終日", "canceled", "2026-11-30", true],
      ["解約予約・最終日の翌日", "canceled", "2026-11-29", false],
      ["終了", "expired", "2026-12-10", false],
    ].each do |label, status, ends_on, expected|
      it("#{label}なら #{expected}") { expect(subscription(status, ends_on).usable_on?(today)).to eq expected }
    end
  end

  describe "#expire!" do
    it "最終日を過ぎた解約予約だけを終了にする" do
      last_day = subscription("canceled", "2026-11-30")
      ended = subscription("canceled", "2026-11-29")
      active = subscription("active", "2026-11-29")

      expect([last_day, ended, active].map { |s| s.expire!(today) }).to eq [false, true, false]
      expect([last_day, ended, active].map { |s| s.reload.status }).to eq %w[canceled expired active]
    end
  end

  describe "#extend_period!" do
    it "解約予約は解約予約のまま延ばす" do
      s = subscription("canceled", "2026-12-10")
      s.extend_period!(7)
      expect(s.reload).to have_attributes(status: "canceled", ends_on: Date.new(2026, 12, 17))
    end

    it "終了した契約は延ばさない" do
      s = subscription("expired", "2026-11-20")
      expect { s.extend_period!(7) }.to raise_error(Subscription::NotExtendable)
      expect(s.reload.ends_on).to eq Date.new(2026, 11, 20)
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/subscription_spec.rb spec/requests --format documentation）"
            code={`
Subscription
  #usable_on?
    継続中・期間中なら true
    解約予約・期間中なら true
    解約予約・今日が最終日なら true
    解約予約・最終日の翌日なら false
    終了なら false
  #expire!
    最終日を過ぎた解約予約だけを終了にする
  #extend_period!
    解約予約は解約予約のまま延ばす
    終了した契約は延ばさない

契約の判断
  解約予約でも最終日までは見られ、ジョブは翌日に終了にする
  管理画面で延長しても解約予約のまま

Finished in 0.17275 seconds (files took 0.86591 seconds to load)
10 examples, 0 failures
`}
          />
          <p>
            前の節で失敗した request spec も通りました。規則の組み合わせはモデルのテストで確かめ、request spec は3か所が同じ規則を使っていることを確かめる2件だけにしています。
          </p>
          <h3>直す前と後の比較</h3>
          <Figure n="75-5" title="直す前と後：規則がある場所と、規則を変えるときに直す場所" caption="上段は呼び出しの形、下段は規則を1つ変えるときに直す場所。">
            <CompareFigure />
          </Figure>
          <p>
            図 75-5 の上段のとおり、直す前は規則が3つのファイルに分かれていて、直した後は Subscription の1か所にあります。下段は、たとえば「解約予約は最終日の翌日まで見られる」に規則を変えるときに直す場所です。直す前は、動画の画面の <code>&gt;=</code> とジョブの <code>&lt;=</code> を同じように直す必要があります。直した後は <code>usable_on?</code> を直せば、<code>expire!</code> がそれを使うので、ジョブの判断も同じ規則にそろいます。直した後のコードで、前の節と同じ grep を実行しました。
          </p>
          <Code
            lang="text"
            title={`実行結果（grep -rnE "ends_on|active\\?|canceled|expired|status: \\"" app/controllers app/jobs）`}
            code={`
app/jobs/expire_subscriptions_job.rb:5:    Subscription.canceled.find_each { |subscription| subscription.expire!(today) }
`}
          />
          <p>
            残ったのは、ジョブが enum の scope の <code>canceled</code> で読む対象を絞っている1行です。これは「解約予約の契約だけを読む」という読み込みの範囲で、終了にするかどうかの判断は <code>expire!</code> の中にあります。
          </p>
          <h3>データと振る舞いの位置</h3>
          <Figure n="75-6" title="データと振る舞いの位置" caption="Subscription の中を、データ・問い合わせ・命令に分けて示した。">
            <DataBehaviorFigure />
          </Figure>
          <p>
            図 75-6 は直した後の Subscription の中身と、呼び出し側との関係です。データ（status と ends_on）と、それを使う問い合わせと命令が、同じクラスにあります。動画の画面と管理画面の表示（次の節で作るヘルパー）は問い合わせを呼び、その値で自分の応答や表示を決めます。ジョブと管理画面の延長は命令を呼び、状態をどう変えるかは Subscription が決めます。
          </p>
          <h3>直す順序</h3>
          <ol>
            <li>status や期限の列を読んでいる行を grep で探し、どの判断をしているかを書き出す（見られるか・終了にするか・延ばし方）</li>
            <li>正しい規則を、まず request spec に書く。直す前のコードで失敗することを確かめる</li>
            <li>読むだけの判断を、モデルの問い合わせのメソッドにする（<code>usable_on?</code>）。今日の日付のように実行のたびに変わる値は引数で受け取る</li>
            <li>状態を書き換えている処理を、モデルの命令のメソッドにする（<code>expire!</code>・<code>extend_period!</code>）。規則に合わない依頼は何もしないか例外で断る</li>
            <li>呼び出し側を、問い合わせか命令を1つ呼ぶ形に置き換え、規則の組み合わせのテストをモデルに移す</li>
          </ol>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '何でも Subscription に頼もうとしたとき',
      body: (
        <>
          <h3>画面・メール・CSV の見せ方まで Subscription に頼む</h3>
          <p>
            直した後で、管理画面の一覧に状態のバッジを、解約を受け付けたメールに件名を、経理に渡す CSV に1行を出すことになりました。「状態を聞かずに頼む」をそのまま当てはめると、どれも Subscription に頼むメソッドとして書くことになります。
          </p>
          <Code
            lang="ruby"
            title="script/overuse/subscription_presenting.rb（当てはめすぎた例。Subscription に足した部分）"
            code={`
# 当てはめすぎた例：画面・メール・CSV ごとの表示まで Subscription に頼む
class Subscription < ApplicationRecord
  include ActionView::Helpers::TagHelper # HTML を作るためにビューの部品を読み込む

  # 管理画面の一覧のバッジ
  def status_badge_html(date)
    if canceled? && usable_on?(date)
      content_tag(:span, "解約予約（#{ends_on.month}月#{ends_on.day}日まで）", class: "badge badge-warning")
    elsif usable_on?(date)
      content_tag(:span, "利用中", class: "badge badge-success")
    else
      content_tag(:span, "終了", class: "badge badge-muted")
    end
  end

  # 解約を受け付けたメールの件名
  def cancellation_mail_subject = "解約を受け付けました（#{ends_on.month}月#{ends_on.day}日まで視聴できます）"

  # 経理に渡す CSV の1行
  def accounting_csv_row = [member_id, status, ends_on.strftime("%Y/%m/%d")]
end
`}
          />
          <Code
            lang="ruby"
            title="script/overuse.rb"
            code={`
# 表示まで Subscription に頼んだときの、Subscription のメソッドと依存
own = -> { Subscription.public_instance_methods(false).grep_v(/\\A_|autosave/).sort.join(" ") }
before_own = own.()
require_relative "overuse/subscription_presenting"
require_relative "data"
sub = seed_subscriptions["B"].last
today = Date.new(2026, 11, 30)

puts "直した後の Subscription のメソッド：#{before_own}"
puts "表示を足した後：#{own.()}"
puts "TagHelper から加わった公開メソッド：#{ActionView::Helpers::TagHelper.public_instance_methods.sort.join(" ")}"
puts sub.status_badge_html(today)
puts sub.cancellation_mail_subject
p sub.accounting_csv_row
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/overuse.rb）"
            code={`
直した後の Subscription のメソッド：expire! extend_period! usable_on?
表示を足した後：accounting_csv_row cancellation_mail_subject expire! extend_period! status_badge_html usable_on?
TagHelper から加わった公開メソッド：capture cdata_section class_names content_for content_for? content_tag escape_once provide raw safe_join tag to_sentence token_list with_output_buffer
<span class="badge badge-warning">解約予約（12月10日まで）</span>
解約を受け付けました（12月10日まで視聴できます）
[2, "canceled", "2026/12/10"]
`}
          />
          <p>
            出力は正しく、呼び出し側は <code>sub.status_badge_html(today)</code> と頼むだけです。それでも、このコードには次の問題があります。
          </p>
          <ul>
            <li>Subscription が定義した公開メソッドは3つから6つになりました。増えた3つは業務の規則ではなく見せ方です。</li>
            <li>HTML を作るために TagHelper を読み込んだので、<code>content_tag</code>・<code>raw</code>・<code>safe_join</code> など、契約と関係のない14個のメソッドも Subscription の公開メソッドになりました。</li>
            <li>
              バッジの色は管理画面のデザインで、メールの件名は問い合わせの窓口の要望で、CSV の日付の書式は経理の都合で変わります。どれを変えるときも subscription.rb を直し、モデルのテストで HTML の文字列を確かめることになります。<ChapterLink n={63} />（SRP）の言葉で言えば、Subscription を変える理由が業務の規則のほかに3つ増えました。
            </li>
          </ul>
          <h3>見せ方はヘルパーに置き、判断は問い合わせで受け取る</h3>
          <p>
            バッジはヘルパーに置きます。ヘルパーは Subscription に「解約予約か」「見られるか」「最終日はいつか」を問い合わせ、文言と色だけを決めます。
          </p>
          <Code
            lang="ruby"
            title="app/helpers/subscriptions_helper.rb"
            code={`
# 管理画面の表示。視聴できるかは Subscription に聞き、文言と色だけをここで決める
module SubscriptionsHelper
  def subscription_badge(subscription, date)
    if subscription.canceled? && subscription.usable_on?(date)
      tag.span("解約予約（#{subscription.ends_on.month}月#{subscription.ends_on.day}日まで）", class: "badge badge-warning")
    elsif subscription.usable_on?(date)
      tag.span("利用中", class: "badge badge-success")
    else
      tag.span("終了", class: "badge badge-muted")
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/helpers/subscriptions_helper_spec.rb"
            code={`
require "rails_helper"

RSpec.describe SubscriptionsHelper, type: :helper do
  it "解約予約は最終日を添えて表示する" do
    sub = Subscription.new(status: "canceled", ends_on: Date.new(2026, 12, 10))
    expect(helper.subscription_badge(sub, Date.new(2026, 11, 30)))
      .to eq '<span class="badge badge-warning">解約予約（12月10日まで）</span>'
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/helpers --format documentation）"
            code={`
SubscriptionsHelper
  解約予約は最終日を添えて表示する

Finished in 0.05222 seconds (files took 0.82171 seconds to load)
1 example, 0 failures
`}
          />
          <p>
            ヘルパーは状態を問い合わせていますが、問い合わせた値で Subscription の状態を変えてはいません。決めているのは文言と色だけで、「見られるか」の規則は <code>usable_on?</code> にあるので、バッジと動画の画面の判断は食い違いません。テストもレコードを保存せずに書けました。メールの件名はメーラーに、CSV の1行は CSV を作るクラスに、同じように置きます。
          </p>
          <h3>問い合わせのメソッドをなくそうとする</h3>
          <p>
            「問い合わせずに頼む」を徹底しようとして、問い合わせのメソッドを使わせない書き方にすることもあります。結果ごとの処理をブロックで受け取り、Subscription の中で呼ぶ形です。
          </p>
          <Code
            lang="ruby"
            title="script/overuse/subscription_without_queries.rb（当てはめすぎた例）"
            code={`
# 当てはめすぎた例：問い合わせのメソッドを使わせず、結果ごとの処理をブロックで受け取る
class Subscription < ApplicationRecord
  def on_usability(date, usable:, unusable:)
    usable_on?(date) ? usable.call : unusable.call
  end

  # 最終日を表示したいだけでも、書き出し先を渡して書いてもらう
  def write_ends_on(to:) = to << ends_on.strftime("%Y/%m/%d")
end
`}
          />
          <Code
            lang="ruby"
            title="script/without_queries.rb"
            code={`
# 問い合わせを使わない書き方で、動画の画面と同じ判断をする
require_relative "overuse/subscription_without_queries"
require_relative "data"
sub = seed_subscriptions["B"].last

sub.on_usability(Date.new(2026, 11, 30),
                 usable: -> { puts "200 再生します" },
                 unusable: -> { puts "403 有料会員の登録が必要です" })
row = []
sub.write_ends_on(to: row)
p row
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/without_queries.rb）"
            code={`
200 再生します
["2026/12/10"]
`}
          />
          <p>
            結果は if で書いた場合と同じですが、読む人は処理の流れを追うために、Subscription の中と呼び出し側を行き来することになります。最終日を CSV に書くだけのために書き出し先を渡す <code>write_ends_on</code> は、日付の書式（<code>%Y/%m/%d</code>）を Subscription に決めさせているので、前の項と同じ問題も持っています。Fowler が、問い合わせのメソッドをすべてなくそうとして入り組んだコードを見たと書いていたのは、この形です<Ref n={2} />。値を返すだけの問い合わせはこの原則に反しません。
          </p>
          <h3>契約の外の情報も使う判断</h3>
          <p>
            年齢制限のある動画を追加し、「契約が有効で、会員が18歳以上なら見られる」という規則ができたとします。この判断には契約・会員の生年月日・動画の区分の3つが要ります。Subscription に <code>usable_for?(video, member, date)</code> を足すと、Subscription が動画と会員の構造を知ることになり、規則の置き場所として不自然です。
          </p>
          <p>
            このような、複数のオブジェクトにまたがる判断は、判断のためのクラスに置きます。Pundit を使っているなら、動画を見られるかの Policy に書き、その中で <code>subscription.usable_on?(date)</code> を問い合わせます（Pundit の Policy は<ChapterLink n={41} section="pundit" />で扱います）。契約の規則は Subscription に、組み合わせの規則は Policy に、と分けておけば、どちらの規則を変えるときも直す場所は1か所です。
          </p>
          <h3>判断の目安</h3>
          <Figure n="75-7" title="どこに判断を置くか" caption="模式図。上から順に確かめる。">
            <JudgeFigure />
          </Figure>
          <p>
            図 75-7 は、呼び出し側が契約の状態を使って何かを決めたいときの、判断の置き場所の目安です。ほかのオブジェクトの情報も使う判断は Policy やサービスに、契約のデータだけで決まる業務の規則は Subscription に、画面ごとの見せ方はヘルパーやビューに置きます。値を表示するだけなら、<code>subscription.ends_on</code> を読んでかまいません。この原則で確かめるのは、読んだ値で業務の規則を判断し、その結果で相手の状態を変えていないかです。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: "Active Record・enum と Tell, Don't Ask",
      body: (
        <>
          <h3>Active Record はデータと振る舞いを1つのオブジェクトに持つ</h3>
          <p>
            Rails のモデルが使う Active Record は、Martin Fowler が『Patterns of Enterprise Application Architecture』で説明したパターンの名前でもあります。Fowler はこのパターンを、DB のテーブルの1行を表し、DB へのアクセスを隠し、そのデータにドメインのロジックを加えるオブジェクトとし、オブジェクトがデータと振る舞いの両方を持つと説明しています<Ref n={3} />。Rails Guides の Active Record Basics も同じ定義を引き、Active Record のオブジェクトはデータと振る舞いの両方を持つと書いています<Ref n={4} />。
          </p>
          <p>
            つまり Rails のモデルは、はじめからデータと振る舞いを同じクラスに置く形をしています。前の節で <code>usable_on?</code>・<code>expire!</code>・<code>extend_period!</code> を Subscription に置いたのは、この形に沿った直し方です。直す前のコードのように、モデルを列の値を読み書きするためだけに使い、規則をコントローラーやジョブに書くと、Active Record の形を使っていないことになります。
          </p>
          <h3>Rails Doctrine：モデルはオブジェクト指向、ヘルパーは関数</h3>
          <p>
            Rails Doctrine の「No one paradigm」は、Rails が1つの考え方だけで作られていないことを説明しています。その中で、ビューのヘルパーは1つの名前空間に関数を集めたもので、互いにやり取りの少ない関数を並べるにはそれがよい選択だと書き、一方で MVC のモデルはオブジェクト指向の良さを生かす中心の場所として扱うと書いています<Ref n={5} />。
          </p>
          <p>
            この章の分け方はこの説明と同じ向きです。業務の規則はモデル（Subscription）にまとめてオブジェクトに頼み、画面ごとの見せ方はヘルパーの関数に置いて、モデルの問い合わせを使います。「当てはめすぎたとき」の節で、バッジをモデルではなくヘルパーに置いたのはこのためです。
          </p>
          <h3>enum が作るメソッドと、規則を通らない変更</h3>
          <p>
            enum は状態ごとに「?」で終わる問い合わせと「!」で終わるメソッドを作ります。Rails 8.1.4.1 のソースでは、「!」のメソッドは <code>update!(status: 値)</code> を呼ぶだけのメソッドとして定義されています<Ref n={7} />。つまり Subscription の外から、命令のメソッドを通らずに状態を変えられます。直した後のコードで確かめました。
          </p>
          <Code
            lang="ruby"
            title="script/enum_methods.rb"
            code={`
# enum が作るメソッドと、規則を通らずに状態を変える書き方
require_relative "data"
subs = seed_subscriptions.transform_values(&:last)
today = Date.new(2026, 11, 30)

puts "enum が作ったメソッド：#{Subscription.public_instance_methods.grep(/\\A(active|canceled|expired)[?!]\\z/).sort.join(" ")}"
puts "enum が作った scope：#{Subscription.statuses.keys.flat_map { |s| [s, "not_#{s}"] }.select { |n| Subscription.respond_to?(n) }.join(" ")}"

b = subs["B"]
b.expired! # 管理画面の「すぐ止める」ボタンのつもりで呼んだ
puts "B に expired! を呼んだ後：#{b.status}、#{today} に視聴できるか → #{b.usable_on?(today)}"
Subscription.where(id: subs["C"].id).update_all(status: "active")
puts "C に update_all をした後：#{subs["C"].reload.status}"

# 命令のメソッド以外から状態を変えにくくする：enum の「!」のメソッドを private にする
Subscription.class_eval { private :active!, :canceled!, :expired! }
begin
  subs["A"].expired!
rescue NoMethodError => e
  puts "private にした後の expired!：#{e.message}"
end
puts "「?」のメソッドはそのまま：#{subs["A"].active?}"
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/enum_methods.rb）"
            code={`
enum が作ったメソッド：active! active? canceled! canceled? expired! expired?
enum が作った scope：active not_active canceled not_canceled expired not_expired
B に expired! を呼んだ後：expired、2026-11-30 に視聴できるか → false
C に update_all をした後：active
private にした後の expired!：private method 'expired!' called for an instance of Subscription
「?」のメソッドはそのまま：true
`}
          />
          <p>
            B は最終日が12月10日の解約予約ですが、<code>expired!</code> で11月30日に終了になり、見られなくなりました。<code>expire!(date)</code> の「見られなくなった解約予約だけを終了にする」という規則を通っていないからです。<code>update_all</code> は解約予約ですらない C を、どの規則も通さずに active にしました。図 75-8 は状態を変える書き方ごとに、どこを通るかをまとめたものです。
          </p>
          <Figure n="75-8" title="状態を変える書き方と、通る確認" caption="バリデーションとコールバックを通るかは Rails Guides による。モデルの規則はこの章の expire! と extend_period! の中の確認。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">書き方</th>
                    <th scope="col">モデルの規則</th>
                    <th scope="col">バリデーション</th>
                    <th scope="col">コールバック</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>subscription.expire!(today)</code>・<code>extend_period!(7)</code></td>
                    <td>通る</td>
                    <td>通る</td>
                    <td>通る</td>
                  </tr>
                  <tr>
                    <td><code>subscription.expired!</code>（enum が作る）</td>
                    <td>通らない</td>
                    <td>通る</td>
                    <td>通る</td>
                  </tr>
                  <tr>
                    <td><code>subscription.update!(status: :expired)</code></td>
                    <td>通らない</td>
                    <td>通る</td>
                    <td>通る</td>
                  </tr>
                  <tr>
                    <td><code>subscription.update_column(:status, "expired")</code></td>
                    <td>通らない</td>
                    <td>通らない</td>
                    <td>通らない</td>
                  </tr>
                  <tr>
                    <td><code>Subscription.where(…).update_all(status: "expired")</code></td>
                    <td>通らない</td>
                    <td>通らない</td>
                    <td>通らない</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            Rails Guides は、<code>update_all</code> と <code>update_column</code> がバリデーションを通らずに保存し、コールバックも呼ばないと説明しています<Ref n={8} /><Ref n={9} />。直す前のジョブの <code>update_all</code> は、この表の最後の行に当たります。
          </p>
          <p>状態を変える方法を命令のメソッドだけに限りたいときは、次の方法があります。</p>
          <ul>
            <li>
              「!」のメソッドを private にする：実行結果の最後の2行のように、<code>private :active!, :canceled!, :expired!</code> と書くと、外からの <code>expired!</code> は NoMethodError になり、「?」の問い合わせはそのまま使えます。
            </li>
            <li>
              enum に <code>instance_methods: false</code> を付ける：enum が作るインスタンスメソッドを作らなくなります<Ref n={6} />。「?」の問い合わせもなくなるので、必要なものは自分で定義します。
            </li>
          </ul>
          <p>
            どちらの方法でも、<code>update!(status: …)</code> や <code>update_all</code> は使えるままです。Rails Doctrine の「Provide sharp knives」は、Ruby と Rails がこうした強力な機能をあえて用意し、使い方は禁止ではなく規約と教育で揃えるという考え方を説明しています<Ref n={5} />。状態の列を直接書き換える行がモデルの外にないかを、レビューや grep で確かめる運用を合わせて使います。
          </p>
          <Callout kind="v72">
            <p>
              この章の <code>enum :status, {'{ … }'}</code> の書き方と、<code>instance_methods</code>・<code>validate</code> のオプションは、Rails 7.2 の API ドキュメントにも同じ形で載っています<Ref n={10} />。古い書き方の <code>enum status: {'{ … }'}</code>（キーワード引数で定義する形）は、Rails 8.0 でサポートが削除されました<Ref n={11} />。7.2 のコードにこの書き方が残っていれば、8.0 に上げる前に <code>enum :status, …</code> の形に直します。
            </p>
          </Callout>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={74} />（Law of Demeter）：デメテルの法則は誰に送るかを、Tell, Don't Ask は外で判断していないかを確かめます。delegate で値を運ぶだけでは、判断は呼び出し側に残ります。
            </li>
            <li>
              <ChapterLink n={47} section="aasm" />：状態の遷移が多いときは、遷移とその条件（guard）を宣言する状態機械として書けます。どの状態からどの状態に移れるかの規則が、モデルの1か所に集まります。
            </li>
            <li>
              <ChapterLink n={41} section="pundit" />：会員・契約・動画のように、複数のオブジェクトにまたがる操作の可否を Policy に置く方法を扱います。
            </li>
            <li>
              <ChapterLink n={30} section="callback-design" />：状態が変わったときにメールを送るといった処理を、コールバックに置くか命令のメソッドに書くかの判断を扱いました。
            </li>
            <li>
              <ChapterLink n={78} />（Functional Core, Imperative Shell）：<code>usable_on?(date)</code> が今日の日付を引数で受け取ったように、実行のたびに変わる値を呼び出し側で決めて渡す形を、計算の処理全体に広げます。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          契約のデータだけで決まる業務の規則は、呼び出し側で状態を読んで判断せず、Subscription の問い合わせ（usable_on?）と命令（expire!・extend_period!）に移します。画面ごとの見せ方はヘルパーに置いて問い合わせを使い、会員や動画の情報も使う判断は Policy に置きます。値を表示するだけなら、ends_on を読んでかまいません。
        </>
      ),
      benefit: {
        text: <>直す前は、動画の画面・ジョブ・管理画面がそれぞれ status と ends_on を読んだため、解約予約の会員が期間中に見られず、最終日に終了になり、延長で解約が消えた。直した後は規則が Subscription の1か所にあり、expire! が usable_on? を使うので、見られなくなる日と終了にする日が必ずそろう。</>,
        basis: <><ChapterLink n={77} section="scene" />、<ChapterLink n={77} section="apply" /></>,
      },
      cost: {
        text: <>見せ方まで Subscription に頼むと、公開メソッドが3つから6つになり、TagHelper を読み込んだことで契約と関係のない14個のメソッドも公開された。バッジの色・メールの件名・CSV の書式のどれを変えるときも subscription.rb を直すことになる。</>,
        basis: <ChapterLink n={77} section="overuse" />,
      },
      alternative: {
        text: <>バッジはヘルパーに置き、Subscription に「解約予約か」「見られるか」「最終日はいつか」を問い合わせて、文言と色だけを決める。年齢制限のように契約・会員の生年月日・動画の区分の3つが要る判断は、Subscription に引数を足さず Policy に置く。</>,
        basis: <ChapterLink n={77} section="overuse" />,
      },
      criterion: {
        text: <>その判断に要るデータを、どのオブジェクトが持っているか。問い合わせた値で、相手の状態を書き換えているか。画面ごとに変わる見せ方か、どの呼び出し元でも同じであるべき業務の規則か。</>,
        basis: <ChapterLink n={77} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Tell, Don't Ask はオブジェクトの状態を問い合わせて呼び出し側で判断するより、オブジェクト自身に振る舞いを実行させる原則です。データとそれを使う振る舞いを同じオブジェクトにまとめます。</li>
          <li>動画の画面・ジョブ・管理画面がそれぞれ status と ends_on を読んで判断したため、解約予約の会員が期間中に見られず、最終日に終了になり、延長で解約が消えました。</li>
          <li>Hunt と Thomas の2003年のコラムは、状態を問い合わせて判断し、その結果で相手の状態を変える書き方を避けるように書き、メソッドを命令と問い合わせに分けることを勧めています。</li>
          <li>判断を Subscription の問い合わせ（<code>usable_on?</code>）と命令（<code>expire!</code>・<code>extend_period!</code>）に移すと、規則は1か所になり、<code>expire!</code> が <code>usable_on?</code> を使うことで、見られなくなる日と終了にする日が必ずそろいます。</li>
          <li>問い合わせのメソッドは禁止されていません。画面ごとの見せ方はヘルパーに置いて問い合わせを使い、複数のオブジェクトにまたがる判断は Policy に置きます。表示までモデルに頼むと、モデルを変える理由が増えます。</li>
          <li>デメテルの法則に沿っていても、値を取り出して外で判断していれば、この原則には反します。delegate で値を運ぶ前に、判断を値の持ち主に移せないかを確かめます。</li>
          <li>enum の「!」のメソッドや <code>update_all</code> は、モデルの規則を通らずに状態を変えます。private にする・<code>instance_methods: false</code> にするといった方法と、レビューを組み合わせます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'The Art of Enbugging', publisher: 'Andy Hunt, Dave Thomas / IEEE Software（The Pragmatic Programmers のサイトに置かれた複製）', url: 'https://media.pragprog.com/articles/jan_03_enbug.pdf', accessed: '2026-11-21', version: '2003年1・2月号', note: '「Tell, don\'t ask」の節で、手続き型のコードは情報を取り出して判断し、オブジェクト指向のコードはオブジェクトに命じると Alec Sharp の『Smalltalk by Example』（1997）を挙げて述べたこと。状態を問い合わせて判断し、その結果で相手の状態を変える書き方を避けること、外で判断することはカプセル化を破ること。メソッドを命令と問い合わせに分け、問い合わせは副作用を持たないこと（command-query separation）。続く節でデメテルの法則を扱うこと。' },
    { title: 'TellDontAsk', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/TellDontAsk.html', accessed: '2026-11-21', version: '2013年9月5日', note: 'データとそれを扱う関数をまとめることを思い出させる原則であること、データと振る舞いを同じ場所に置く理由。Fowler 自身はこの原則を使わず、問い合わせのメソッドをすべてなくそうとする GetterEradicator を生むことを懸念していること。層に分けるなどの理由で同じ場所に置くことを手放す場合があること。Hunt と Thomas の IEEE Software のコラムと結びつけていること。' },
    { title: 'Active Record（Patterns of Enterprise Application Architecture のカタログ）', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/eaaCatalog/activeRecord.html', accessed: '2026-11-21', note: 'DB のテーブルの1行を表し、DB へのアクセスを隠し、データにドメインのロジックを加えるオブジェクトという定義と、オブジェクトがデータと振る舞いの両方を持つこと。' },
    { title: 'Active Record Basics（The Active Record Pattern）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_basics.html#the-active-record-pattern', accessed: '2026-11-21', version: 'Rails 8.1', note: 'Rails の Active Record が Fowler の Active Record パターンの実装であり、Active Record のオブジェクトがデータと振る舞いの両方を持つこと。' },
    { title: 'The Rails Doctrine', publisher: 'Ruby on Rails / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: '「No one paradigm」で、ビューのヘルパーを関数の集まりとし、モデルをオブジェクト指向の中心の場所として扱うと述べていること。「Provide sharp knives」で、強力な機能を禁止せず、規約と教育で使い方をそろえる考え方。' },
    { title: 'ActiveRecord::Enum', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Enum.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'enum が状態ごとの「?」「!」のメソッドと scope（not_ 付きを含む）を作ること、instance_methods: false で自動で作るメソッドを止められること、validate オプション。' },
    { title: 'activerecord/lib/active_record/enum.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/enum.rb#L303-L323`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: '「!」のメソッドが update!(name => value) を呼ぶだけの定義であること、scope と not_ の scope の定義。' },
    { title: 'Active Record Validations（Skipping Validations）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_validations.html#skipping-validations', accessed: '2026-11-21', version: 'Rails 8.1', note: 'update_all・update_column などがバリデーションを通らずに保存すること。' },
    { title: 'Active Record Callbacks（Skipping Callbacks）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_callbacks.html#skipping-callbacks', accessed: '2026-11-21', version: 'Rails 8.1', note: 'update_all・update_column などがコールバックを呼ばないこと。' },
    { title: 'ActiveRecord::Enum（Rails 7.2）', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v7.2/classes/ActiveRecord/Enum.html', accessed: '2026-11-21', version: 'Rails 7.2', note: 'Rails 7.2 でも enum :status, … の書き方と instance_methods・validate のオプションが同じであること。' },
    { title: 'Ruby on Rails 8.0 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/8_0_release_notes.html', accessed: '2026-11-21', version: 'Rails 8.0', note: 'キーワード引数で enum を定義する書き方のサポートが削除されたこと。' },
  ],
}

export default chapter
