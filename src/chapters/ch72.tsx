import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 53-1 組み合わせごとのサブクラス ---------- */
function SceneFigure() {
  return (
    <Svg
      id="53-1"
      w={780}
      h={420}
      label="通知の親クラス Notifier の下に、EmailNotifier と SlackNotifier がある。EmailNotifier の下に EmailAndSlackNotifier と UrgentEmailNotifier、SlackNotifier の下に UrgentSlackNotifier があり、EmailAndSlackNotifier の下に UrgentEmailAndSlackNotifier がある。EmailAndSlackNotifier は Slack に送る処理を SlackNotifier から写している。UrgentEmailAndSlackNotifier は【緊急】と当番への送信を UrgentEmailNotifier から写したが、Slack を #ops-urgent に送る上書きは UrgentSlackNotifier にあり、継承の経路にないので引き継げない。そのため Slack は #ops に届く。右側では、notification_settings テーブルの設定を NotificationSetting が読み、送り方の名前からクラス名を組み立てて constantize で探す。送り方を slack、email の順に選ぶと NameError になる。6つのクラスは OpsMailer でメールを、Slack の Webhook で Slack を送る"
    >
      <Box x={190} y={16} w={170} h={44} lines={['Notifier', 'deliver は子が決める']} fs={12} bold subTone="muted" />

      <Box x={40} y={100} w={190} h={44} lines={['EmailNotifier', 'メールで送る']} fs={12} bold subTone="muted" />
      <Box x={330} y={100} w={190} h={44} lines={['SlackNotifier', 'Slack の #ops に送る']} fs={12} bold subTone="muted" />
      <Arrow x1={135} y1={100} x2={240} y2={62} />
      <Arrow x1={425} y1={100} x2={310} y2={62} />

      <Box x={10} y={190} w={200} h={44} lines={['EmailAndSlackNotifier', 'Slack の処理を写す']} fs={12} bold subTone="muted" />
      <Box x={225} y={190} w={180} h={44} lines={['UrgentEmailNotifier', '【緊急】・当番に送る']} fs={12} bold subTone="muted" />
      <Box x={420} y={190} w={180} h={44} lines={['UrgentSlackNotifier', '【緊急】・#ops-urgent']} fs={12} bold subTone="muted" />
      <Arrow x1={110} y1={190} x2={118} y2={146} />
      <Arrow x1={315} y1={190} x2={190} y2={146} />
      <Arrow x1={510} y1={190} x2={445} y2={146} />

      <Box x={10} y={290} w={240} h={50} lines={['UrgentEmailAndSlackNotifier', '【緊急】・当番に送る（写した）']} fs={12} bold subTone="muted" fill="box5" />
      <Arrow x1={130} y1={290} x2={112} y2={236} />
      <Arrow x1={500} y1={236} x2={252} y2={305} dashed plain />
      <T x={270} y={322} fs={11} tone="danger">
        #ops-urgent の上書きは、継承の経路にないので引き継げない
      </T>
      <T x={10} y={364} fs={12} tone="danger">
        UrgentEmailAndSlackNotifier の Slack は #ops に届き、緊急用のチャンネルに出ない
      </T>
      <T x={10} y={396} fs={12} tone="muted">
        組み合わせごとにクラスがあり、Slack の処理は2か所、【緊急】の上書きは3か所に書かれている
      </T>

      <Box x={620} y={16} w={150} h={50} lines={['notification_settings', 'channels・urgent']} fs={11} fill="box4" subTone="muted" />
      <Arrow x1={695} y1={66} x2={695} y2={98} />
      <Box x={620} y={100} w={150} h={50} lines={['NotificationSetting', 'notifier_class']} fs={12} bold subTone="muted" />
      <Arrow x1={620} y1={125} x2={524} y2={125} />
      <T x={572} y={114} anchor="middle" fs={10} tone="muted" mono>
        constantize
      </T>
      <T x={620} y={172} fs={11} tone="danger" mono>
        {'["slack", "email"]'}
      </T>
      <T x={620} y={190} fs={11} tone="danger">
        → NameError
      </T>
      <Box x={620} y={230} w={150} h={44} lines={['OpsMailer', 'メール']} fs={12} fill="box4" subTone="muted" />
      <Box x={620} y={286} w={150} h={58} lines={['Slack（Webhook）', '#ops', '#ops-urgent']} fs={12} fill="box4" subTone="muted" />
    </Svg>
  )
}

/* ---------- 図 53-2 クラスの数の増え方 ---------- */
const growth = [
  { n: 1, label: '1つ（メール）', inh: 2, comp: 1 },
  { n: 2, label: '2つ（今）', inh: 6, comp: 2 },
  { n: 3, label: '3つ（SMS を足す）', inh: 14, comp: 3 },
  { n: 4, label: '4つ', inh: 30, comp: 4 },
]

function GrowthFigure() {
  const base = 300
  const unit = 7.5
  return (
    <Svg
      id="53-2"
      w={780}
      h={360}
      label="送り方の数とクラスの数の関係を示す棒グラフ。継承で組み合わせごとにサブクラスを作ると、緊急かどうかの2通りを掛けて 2×(2のn乗−1) 個になり、送り方が1つなら2個、2つなら6個、3つなら14個、4つなら30個になる。送り方を部品にして組み合わせると、送り方のクラスは送り方の数と同じ1、2、3、4個で、このほかに Notifier と OpsAlert の2つがあるだけである"
    >
      <rect x={90} y={14} width={14} height={14} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={112} y={21} fs={12}>
        継承：組み合わせのサブクラス 2×(2ⁿ−1) 個
      </T>
      <rect x={90} y={38} width={14} height={14} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <T x={112} y={45} fs={12}>
        組み合わせ：送り方のクラス n 個（ほかに Notifier と OpsAlert の2つ）
      </T>
      <line x1={80} y1={base} x2={760} y2={base} stroke="var(--fig-line)" />
      <T x={70} y={base} anchor="end" fs={11} tone="muted">
        0
      </T>
      <line x1={80} y1={base - 30 * unit} x2={760} y2={base - 30 * unit} stroke="var(--fig-line)" strokeDasharray="2 4" />
      <T x={70} y={base - 30 * unit} anchor="end" fs={11} tone="muted">
        30
      </T>
      <line x1={80} y1={base - 15 * unit} x2={760} y2={base - 15 * unit} stroke="var(--fig-line)" strokeDasharray="2 4" />
      <T x={70} y={base - 15 * unit} anchor="end" fs={11} tone="muted">
        15
      </T>
      {growth.map((g, i) => {
        const cx = 170 + i * 165
        return (
          <g key={g.n}>
            <rect x={cx - 52} y={base - g.inh * unit} width={46} height={g.inh * unit} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={cx - 29} y={base - g.inh * unit - 10} anchor="middle" fs={12} bold>
              {g.inh}
            </T>
            <rect x={cx + 6} y={base - g.comp * unit} width={46} height={g.comp * unit} fill="var(--fig-box2)" stroke="var(--fig-line)" />
            <T x={cx + 29} y={base - g.comp * unit - 10} anchor="middle" fs={12} bold>
              {g.comp}
            </T>
            <T x={cx} y={base + 20} anchor="middle" fs={12}>
              {g.label}
            </T>
          </g>
        )
      })}
      <T x={420} y={base + 46} anchor="middle" fs={12} tone="muted">
        送り方の数（緊急かどうかの2通りは、継承ではクラスの数を2倍にし、組み合わせでは値の1つになる）
      </T>
    </Svg>
  )
}

/* ---------- 図 53-3 継承・モジュールの include・コンポジション ---------- */
const compareCols = [
  {
    title: '継承',
    lines: ['決まる時点：クラスを書くとき', '親のクラスは1つだけ', '組み合わせごとにクラスを作る', '子は親の呼び出し方に依存する'],
  },
  {
    title: 'モジュールの include',
    lines: ['決まる時点：クラスを書くとき', 'モジュールは複数 include できる', '同じ名前のメソッドは1つだけ', '組み合わせごとのクラスは残る'],
  },
  {
    title: 'コンポジション',
    lines: ['決まる時点：実行時（設定から）', '部品を持ち、仕事を任せる', '部品は deliver(alert) に応える', 'テストで部品を差し替えられる'],
  },
]

function CompareFigure() {
  return (
    <Svg
      id="53-3"
      w={780}
      h={360}
      label="Ruby で振る舞いを足す3つの方法の比較。継承では、EmailAndSlackNotifier が EmailNotifier を、EmailNotifier が Notifier を継承する。親のクラスは1つだけで、組み合わせはクラスを書くときに決まり、組み合わせごとにクラスを作る。子のクラスは親がメソッドを呼ぶ順序や状態に依存する。モジュールの include では、1つのクラスが EmailDelivery と SlackDelivery を include する。ancestors の順で先にある SlackDelivery の deliver だけが呼ばれ、EmailDelivery の deliver は呼ばれない。組み合わせごとのクラスは残る。コンポジションでは、Notifier が EmailChannel と SlackChannel を配列で持ち、それぞれの deliver(alert) を呼ぶ。組み合わせは実行時に設定から決まり、部品は deliver(alert) に応えればよく、テストでは部品を差し替えられる"
    >
      {compareCols.map((c, k) => {
        const x0 = 10 + k * 260
        return (
          <g key={c.title}>
            <Box x={x0} y={8} w={240} h={344} fill="none" accent={k === 2} />
            <T x={x0 + 120} y={28} anchor="middle" bold>
              {c.title}
            </T>
            {c.lines.map((l, i) => (
              <T key={l} x={x0 + 14} y={242 + i * 26} fs={12} tone={i === 0 ? 'acc' : undefined}>
                {l}
              </T>
            ))}
          </g>
        )
      })}

      <Box x={30} y={48} w={200} h={34} lines="Notifier" fs={12} />
      <Box x={30} y={112} w={200} h={34} lines="EmailNotifier" fs={12} />
      <Box x={30} y={176} w={200} h={34} lines="EmailAndSlackNotifier" fs={12} fill="box5" />
      <Arrow x1={130} y1={112} x2={130} y2={84} />
      <Arrow x1={130} y1={176} x2={130} y2={148} />

      <Box x={280} y={48} w={220} h={34} lines="MixinEmailAndSlackNotifier" fs={11} />
      <Box x={288} y={100} w={160} h={28} lines="SlackDelivery#deliver" fs={11} fill="box2" />
      <Box x={288} y={140} w={160} h={28} lines="EmailDelivery#deliver" fs={11} fill="box2" dashed />
      <Box x={288} y={180} w={160} h={28} lines="Notifier" fs={11} />
      <Arrow x1={368} y1={82} x2={368} y2={98} />
      <T x={454} y={154} fs={10} tone="danger">
        呼ばれない
      </T>
      <T x={288} y={224} fs={10} tone="muted">
        上から ancestors の順
      </T>

      <Box x={540} y={48} w={220} h={168} fill="none" />
      <T x={552} y={66} fs={12} bold>
        Notifier
      </T>
      <T x={620} y={66} fs={11} tone="muted" mono>
        @channels
      </T>
      <Box x={600} y={92} w={146} h={40} lines="EmailChannel" fs={12} />
      <Box x={600} y={152} w={146} h={40} lines="SlackChannel" fs={12} />
      <Arrow x1={562} y1={80} x2={562} y2={172} plain />
      <Arrow x1={562} y1={112} x2={598} y2={112} />
      <Arrow x1={562} y1={172} x2={598} y2={172} />
    </Svg>
  )
}

/* ---------- 図 53-4 組み合わせる構造 ---------- */
function StructureFigure() {
  return (
    <Svg
      id="53-4"
      w={780}
      h={370}
      label="直した後の構造。notification_settings テーブルの行を NotificationSetting が読み、notifier メソッドが Notifier.build に送り方の名前の一覧を渡す。Notifier は EmailChannel と SlackChannel を配列で持つ。OpsNotification.notify は OpsAlert（title・body・urgent を持つ値）を作り、Notifier の deliver に渡す。Notifier はそれぞれの送り方の deliver(alert) を順に呼ぶ。EmailChannel は緊急なら当番を宛先に足して OpsMailer でメールを送り、SlackChannel は緊急なら #ops-urgent を選んで SlackClient で Slack の Webhook に投稿する"
    >
      <Box x={10} y={20} w={180} h={50} lines={['notification_settings', '["email", "slack"]・urgent']} fs={11} fill="box4" subTone="muted" />
      <Arrow x1={100} y1={70} x2={100} y2={98} />
      <Box x={10} y={100} w={180} h={50} lines={['NotificationSetting', '#notifier']} fs={12} bold subTone="muted" />
      <Box x={10} y={196} w={180} h={50} lines={['OpsNotification', '.notify(event, …)']} fs={12} bold subTone="muted" />
      <Arrow x1={100} y1={196} x2={100} y2={152} />
      <Arrow x1={100} y1={246} x2={100} y2={284} />
      <T x={108} y={265} fs={10} tone="muted">
        作る
      </T>
      <Box x={10} y={286} w={180} h={56} lines={['OpsAlert（値）', 'title・body・urgent']} fs={12} fill="box4" bold subTone="muted" />

      <Arrow x1={190} y1={125} x2={248} y2={125} />
      <T x={219} y={113} anchor="middle" fs={10} tone="muted" mono>
        build
      </T>
      <Arrow x1={190} y1={221} x2={248} y2={221} />
      <T x={219} y={209} anchor="middle" fs={10} tone="muted" mono>
        deliver
      </T>

      <Box x={250} y={20} w={230} h={250} fill="none" accent />
      <T x={264} y={40} bold>
        Notifier
      </T>
      <T x={334} y={40} fs={11} tone="muted" mono>
        @channels
      </T>
      <Box x={270} y={70} w={190} h={54} lines={['EmailChannel', '緊急なら当番を宛先に足す']} fs={12} bold subTone="muted" />
      <Box x={270} y={150} w={190} h={54} lines={['SlackChannel', '緊急なら #ops-urgent']} fs={12} bold subTone="muted" />
      <T x={365} y={232} anchor="middle" fs={11} tone="muted">
        each で順に deliver(alert)
      </T>

      <Box x={520} y={74} w={110} h={46} lines={['OpsMailer', 'mail']} fs={12} subTone="muted" />
      <Box x={520} y={154} w={110} h={46} lines={['SlackClient', 'POST']} fs={12} subTone="muted" />
      <Box x={660} y={74} w={110} h={46} lines={['メール', 'ops@・oncall@']} fs={12} fill="box4" subTone="muted" />
      <Box x={660} y={154} w={110} h={46} lines={['Slack', '#ops・#ops-urgent']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={460} y1={97} x2={518} y2={97} />
      <Arrow x1={460} y1={177} x2={518} y2={177} />
      <Arrow x1={630} y1={97} x2={658} y2={97} />
      <Arrow x1={630} y1={177} x2={658} y2={177} />

      <T x={250} y={300} fs={12} tone="acc">
        送り方を足すときは、deliver(alert) を持つクラスを作り、Notifier::CHANNELS に1行足す
      </T>
      <T x={250} y={324} fs={12} tone="muted">
        緊急のときに宛先やチャンネルをどう変えるかは、送り方のクラスがそれぞれ決める
      </T>
      <T x={250} y={348} fs={12} tone="muted">
        緊急かどうかは OpsAlert の値で、クラスの種類を増やさない
      </T>
    </Svg>
  )
}

/* ---------- 図 53-5 SMS を足すときに変えるもの（直す前と後） ---------- */
const newClasses = [
  'SmsNotifier',
  'UrgentSmsNotifier',
  'EmailAndSmsNotifier',
  'UrgentEmailAndSmsNotifier',
  'SlackAndSmsNotifier',
  'UrgentSlackAndSmsNotifier',
  'EmailAndSlackAndSmsNotifier',
  'UrgentEmailAndSlackAndSmsNotifier',
]

function ChangeFigure() {
  return (
    <Svg
      id="53-5"
      w={780}
      h={400}
      label="送り方に SMS を足すときに変えるものの比較。直す前は、SmsNotifier、UrgentSmsNotifier、EmailAndSmsNotifier、UrgentEmailAndSmsNotifier、SlackAndSmsNotifier、UrgentSlackAndSmsNotifier、EmailAndSlackAndSmsNotifier、UrgentEmailAndSlackAndSmsNotifier の8つのクラスを新しく作り、クラスは合わせて14になる。Slack・緊急・SMS の処理をそれぞれのクラスに写し、設定に保存する送り方の順番もクラス名の規則に合わせる必要がある。直した後は、SmsChannel と SmsClient の2つのクラスを作り、Notifier::CHANNELS に1行足すだけで、EmailChannel・SlackChannel・OpsAlert・NotificationSetting・OpsNotification は変えない"
    >
      <T x={10} y={18} bold>
        直す前：SMS を足すと
      </T>
      {newClasses.map((name, i) => (
        <Box key={name} x={10} y={34 + i * 30} w={360} h={24} lines={name} fs={11} mono fill="box5" />
      ))}
      <T x={10} y={292} fs={12} tone="danger">
        新しく作るクラスが8つ（合わせて14）
      </T>
      <T x={10} y={316} fs={12} tone="danger">
        Slack・緊急・SMS の処理をそれぞれのクラスに写す
      </T>
      <T x={10} y={340} fs={12} tone="danger">
        設定の送り方の順番を、クラス名の規則に合わせる
      </T>

      <line x1={390} y1={8} x2={390} y2={390} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={410} y={18} bold>
        直した後：SMS を足すと
      </T>
      <Box x={410} y={34} w={170} h={50} lines={['SmsChannel', '新しく作る']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={600} y={34} w={170} h={50} lines={['SmsClient', '新しく作る']} fs={12} fill="box5" bold subTone="muted" />
      <Arrow x1={580} y1={59} x2={598} y2={59} />
      <Box x={410} y={104} w={360} h={50} lines={['Notifier::CHANNELS', '"sms" => SmsChannel を1行足す']} fs={12} bold subTone="muted" accent />
      <Box
        x={410}
        y={176}
        w={360}
        h={96}
        lines={['変えないもの', 'EmailChannel・SlackChannel', 'OpsAlert・NotificationSetting', 'OpsNotification']}
        fs={12}
        bold
        subTone="muted"
        dashed
        fill="bg"
      />
      <T x={410} y={292} fs={12} tone="acc">
        新しく作るクラスが2つ、書き換える行が1つ
      </T>
      <T x={410} y={316} fs={12} tone="acc">
        どの組み合わせも、設定の配列を変えるだけで送れる
      </T>
      <T x={410} y={340} fs={12} tone="muted">
        設定の送り方の順番は、送る順番になるだけ
      </T>
    </Svg>
  )
}

/* ---------- 図 53-6 入れ子の順番で結果が変わる ---------- */
const wrapPanels = [
  {
    x0: 10,
    title: 'DeliveryLog.new(UrgentMark.new(EmailChannel.new))',
    layers: ['DeliveryLog（記録する）', 'UrgentMark（緊急にする）', 'EmailChannel（送る）'],
    log: '記録：決済に失敗しました',
    logTone: 'danger' as const,
    note: '記録した時点では、まだ緊急になっていない',
  },
  {
    x0: 400,
    title: 'UrgentMark.new(DeliveryLog.new(EmailChannel.new))',
    layers: ['UrgentMark（緊急にする）', 'DeliveryLog（記録する）', 'EmailChannel（送る）'],
    log: '記録：【緊急】決済に失敗しました',
    logTone: 'acc' as const,
    note: '緊急にしてから記録する',
  },
]

function OrderFigure() {
  return (
    <Svg
      id="53-6"
      w={780}
      h={330}
      label="同じ3つの部品を、入れ子にする順番だけ変えて組み立てた2つの例。左は DeliveryLog が UrgentMark を持ち、UrgentMark が EmailChannel を持つ。外側から順に deliver を呼ぶので、記録した時点ではまだ緊急になっておらず、記録は「決済に失敗しました」になる。メールは【緊急】の件名で送られる。右は UrgentMark が DeliveryLog を持ち、DeliveryLog が EmailChannel を持つ。緊急にしてから記録するので、記録は「【緊急】決済に失敗しました」になる。入れ子にする順番の決まりはどのクラスにも書かれていない"
    >
      {wrapPanels.map((p) => (
        <g key={p.title}>
          <T x={p.x0} y={16} fs={11} mono>
            {p.title}
          </T>
          {p.layers.map((layer, i) => (
            <g key={layer}>
              <Box x={p.x0 + i * 22} y={32 + i * 44} w={370 - i * 44} h={170 - i * 66} fill={i === 2 ? 'box' : 'none'} dashed={i < 2} />
              <T x={p.x0 + i * 22 + 10} y={50 + i * 44} fs={12} bold={i === 2}>
                {layer}
              </T>
            </g>
          ))}
          <T x={p.x0} y={228} fs={12} tone={p.logTone}>
            {p.log}
          </T>
          <T x={p.x0} y={252} fs={12}>
            メール：【緊急】決済に失敗しました
          </T>
          <T x={p.x0} y={276} fs={12} tone="muted">
            {p.note}
          </T>
        </g>
      ))}
      <line x1={390} y1={8} x2={390} y2={290} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={10} y={314} fs={12} tone="muted">
        外側から順に deliver(alert) を呼ぶ。同じ部品でも入れ子にする順番で結果が変わり、その決まりはどのクラスにも書かれていない
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 72,
  part: 8,
  title: 'Composition over Inheritance：通知の種類を継承の階層で増やさない',
  summary:
    '運用担当への通知を、メール・Slack・緊急の組み合わせごとにサブクラスで作った結果、緊急の Slack が通常のチャンネルに届き、送り方を1つ足すとクラスが14に増える場面から始めます。送り方を deliver(alert) に応える部品にし、設定に合わせて組み合わせる形に直し、モジュールの include や Rails の基底クラスとの使い分けを確かめます。',
  goals: [
    '組み合わせごとにサブクラスを作ると、クラスの数が増え、兄弟のクラスにある上書きを引き継げないことを、実行結果で説明できる',
    'Composition over Inheritance の定義（継承よりコンポジションを優先し、機能を組み合わせて振る舞いを作る）と、GoF の『Design Patterns』（1994）からの由来を説明できる',
    '継承・モジュールの include・コンポジションの違いを、組み合わせが決まる時点と、同じ名前のメソッドの扱いから説明できる',
    '送り方を小さなクラスにし、設定の配列から組み立てる形に直し、送り方を足すときに変える範囲を小さくできる',
    '部品に分けすぎたときの問題と、Rails の基底クラスや concern のように継承やモジュールが向いている場面を見分けられる',
  ],
  prerequisites: [19, 41, 65],
  sections: [
    {
      id: 'scene',
      title: 'メール・Slack・緊急の組み合わせごとにサブクラスを作るコード',
      body: (
        <>
          <p>
            この章では運用担当への通知を例に、Composition over Inheritance（継承よりコンポジション）を扱います。送り方や緊急の扱いのように、組み合わせて使う違いを継承の階層で表すと、組み合わせの数だけサブクラスが必要になります。この章ではその状態を実行して確かめ、送り方を部品にして組み合わせる形に直します。
          </p>
          <h3>そもそも何を通知するのか</h3>
          <p>
            EC サイトでは、カードの決済に失敗した、商品の在庫が少なくなった、といった出来事が起きたときに、運用担当に知らせます。知らせる方法（送り方）はメールと Slack の2つです。Slack には Incoming Webhook という仕組みがあり、Slack が発行した URL に、本文を入れた JSON を POST すると、メッセージがチャンネルに投稿されます。Webhook の URL は投稿先のチャンネルごとに別のものになります<Ref n={3} />。
          </p>
          <p>このサービスでは通知について次のことを決めています。</p>
          <ul>
            <li>出来事ごとに、メールで送るか、Slack に投稿するか、その両方かを運用担当が管理画面で選ぶ</li>
            <li>決済の失敗のように急いで対応する出来事は「緊急」にする。緊急のときは件名の先頭に【緊急】を付け、メールは当番の担当者（oncall@example.com）にも送り、Slack は通常の #ops ではなく緊急用の #ops-urgent に投稿する</li>
          </ul>
          <p>出来事ごとの設定は notification_settings テーブルに保存します。送り方の一覧は JSON の列に配列で入れます。</p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000001_create_notification_settings.rb"
            code={`
class CreateNotificationSettings < ActiveRecord::Migration[8.1]
  def change
    create_table :notification_settings do |t|
      t.string :event, null: false, index: { unique: true } # payment_failed など、通知のきっかけ
      t.json :channels, null: false                         # ["email", "slack"] のような送り方の一覧
      t.boolean :urgent, null: false, default: false        # 緊急として送るか
      t.timestamps
    end
  end
end
`}
          />
          <h3>送り方ごとにサブクラスを作ったコード</h3>
          <p>
            最初のコードでは通知の親クラス Notifier を作り、送り方ごとにサブクラスを作りました。親クラスは件名と本文を持ち、どこへ送るか（<code>deliver</code>）はサブクラスが決めます。
          </p>
          <Code
            lang="ruby"
            title="app/notifiers/notifier.rb・email_notifier.rb・slack_notifier.rb（直す前）"
            code={`
# 運用担当への通知の親クラス。どこへ送るかはサブクラスが決める
class Notifier
  def initialize(title:, body:)
    @title = title
    @body = body
  end

  def deliver
    raise NotImplementedError, "#{self.class.name} で deliver を定義してください"
  end

  private

  def subject
    @title
  end

  def text
    "#{subject}\\n#{@body}"
  end
end

class EmailNotifier < Notifier
  def deliver
    OpsMailer.alert(to: recipients, subject: subject, body: @body).deliver_now
  end

  private

  def recipients
    ["ops@example.com"]
  end
end

class SlackNotifier < Notifier
  def deliver
    SlackClient.post(channel: slack_channel, text: text)
  end

  private

  def slack_channel
    "#ops"
  end
end
`}
          />
          <p>
            OpsMailer は件名と本文をそのまま送るメーラー、SlackClient はチャンネル名に対応する Webhook の URL に <code>{'{ text: … }'}</code> を POST するクラスです（どちらもこの章のアプリで定義しています）。
          </p>
          <p>
            「メールと Slack の両方」が必要になったとき、Ruby のクラスは親を1つしか持てない<Ref n={4} />ので、EmailNotifier を継承し、Slack に送る処理は SlackNotifier から写しました。緊急の通知はそれぞれのクラスを継承して件名と宛先を上書きしました。
          </p>
          <Code
            lang="ruby"
            title="app/notifiers/email_and_slack_notifier.rb と urgent_*.rb（直す前）"
            code={`
# クラスの親は1つだけなので EmailNotifier を継承し、Slack に送る処理は SlackNotifier から写した
class EmailAndSlackNotifier < EmailNotifier
  def deliver
    super
    SlackClient.post(channel: slack_channel, text: text)
  end

  private

  def slack_channel
    "#ops"
  end
end

class UrgentEmailNotifier < EmailNotifier
  private

  def subject
    "【緊急】#{super}"
  end

  def recipients
    super + ["oncall@example.com"]
  end
end

class UrgentSlackNotifier < SlackNotifier
  private

  def subject
    "【緊急】#{super}"
  end

  def slack_channel
    "#ops-urgent"
  end
end

# 緊急の上書きは UrgentEmailNotifier から写した
class UrgentEmailAndSlackNotifier < EmailAndSlackNotifier
  private

  def subject
    "【緊急】#{super}"
  end

  def recipients
    super + ["oncall@example.com"]
  end
end
`}
          />
          <p>
            どのクラスを使うかは設定から決めます。NotificationSetting は送り方の名前を並べてクラス名を組み立て、<code>constantize</code>（文字列と同じ名前の定数を探して返す Active Support のメソッド）でクラスを探します。
          </p>
          <Code
            lang="ruby"
            title="app/models/notification_setting.rb と app/notifiers/ops_notification.rb（直す前）"
            code={`
class NotificationSetting < ApplicationRecord
  # channels は ["email", "slack"] のような配列。運用担当が管理画面で選ぶ
  def notifier_class
    prefix = urgent? ? "Urgent" : ""
    "#{prefix}#{channels.map(&:camelize).join("And")}Notifier".constantize
  end
end

module OpsNotification
  def self.notify(event, title:, body:)
    setting = NotificationSetting.find_by!(event: event)
    setting.notifier_class.new(title: title, body: body).deliver
  end
end
`}
          />
          <p>
            図 53-1 は6つのクラスの継承の関係です。送り方が2つ、緊急かどうかが2通りなので、組み合わせは6つあり、そのすべてにクラスがあります。網かけの UrgentEmailAndSlackNotifier が、この後の実行で問題が起きるクラスです。
          </p>
          <Figure n="53-1" title="組み合わせごとのサブクラス" caption="実線の矢印は子のクラスから親のクラスへの継承。破線は上書きを引き継げない関係。">
            <SceneFigure />
          </Figure>
          <h3>6つのクラスで同じ通知を送ると</h3>
          <p>
            決済の失敗を、6つのクラスで1回ずつ送るスクリプトを、Docker の Rails 8.1.4.1・Ruby 4.0.9・MySQL 8.4 で <code>bin/rails runner</code> を使って実行しました。Slack への HTTP のリクエストは WebMock で受け取り、どのチャンネルの URL に投稿したかを表示しています。メールはテスト用の配信方法（<code>delivery_method = :test</code>）で送り、宛先と件名を表示しています。
          </p>
          <Code
            lang="ruby"
            title="script/scene.rb"
            code={`
require_relative "support" # WebMock で Slack を受け取り、送った内容を記録する（省略）

title = "決済に失敗しました"
body = "注文 #1001（3,980円）のカード決済がエラーになりました"

[EmailNotifier, SlackNotifier, EmailAndSlackNotifier,
 UrgentEmailNotifier, UrgentSlackNotifier, UrgentEmailAndSlackNotifier].each do |klass|
  klass.new(title: title, body: body).deliver
  puts klass.name
  sent_lines.each { |line| puts "  #{line}" }
end

chain = UrgentEmailAndSlackNotifier.ancestors.then { |list| list.take(list.index(Notifier) + 1) }
puts "UrgentEmailAndSlackNotifier.ancestors: #{chain.join(" → ")}"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene.rb）"
            code={`
EmailNotifier
  メール ops@example.com「決済に失敗しました」
SlackNotifier
  Slack #ops「決済に失敗しました」
EmailAndSlackNotifier
  メール ops@example.com「決済に失敗しました」
  Slack #ops「決済に失敗しました」
UrgentEmailNotifier
  メール ops@example.com, oncall@example.com「【緊急】決済に失敗しました」
UrgentSlackNotifier
  Slack #ops-urgent「【緊急】決済に失敗しました」
UrgentEmailAndSlackNotifier
  メール ops@example.com, oncall@example.com「【緊急】決済に失敗しました」
  Slack #ops「【緊急】決済に失敗しました」
UrgentEmailAndSlackNotifier.ancestors: UrgentEmailAndSlackNotifier → EmailAndSlackNotifier → EmailNotifier → Notifier
`}
          />
          <p>
            最後のクラスで、Slack の投稿が #ops-urgent ではなく #ops に届きました。メールの件名と宛先は緊急の扱いになっているので、コードを読む人もメールを受け取る人も、Slack だけが違うことに気づきにくくなります。
          </p>
          <p>
            原因は、Slack を #ops-urgent にする上書きが UrgentSlackNotifier にあることです。<code>ancestors</code>（メソッドを探すときにたどるクラスとモジュールの並び<Ref n={5} />）を見ると、UrgentEmailAndSlackNotifier がたどるのは EmailAndSlackNotifier・EmailNotifier・Notifier だけで、UrgentSlackNotifier は含まれていません。UrgentEmailAndSlackNotifier を書いた人は、親に EmailAndSlackNotifier を選び、緊急の上書きを UrgentEmailNotifier から写しました。UrgentSlackNotifier は兄弟のクラスなので、そこにある上書きは継承では引き継げません。
          </p>
          <h3>送り方を選ぶ順番を変えると</h3>
          <p>
            次に、設定からクラスを選ぶ処理を動かしました。在庫の通知は最初 Slack だけでしたが、運用担当が管理画面でメールを足しました。画面では Slack を先に選んでいたので、配列は <code>["slack", "email"]</code> の順で保存されています。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/settings.rb）"
            code={`
payment_failed（["email", "slack"]、緊急）→ UrgentEmailAndSlackNotifier
stock_low（["slack"]）→ SlackNotifier
stock_low（["slack", "email"]）→ NameError: uninitialized constant SlackAndEmailNotifier
`}
          />
          <p>
            クラス名は送り方の名前を並べた順に作られるので、<code>SlackAndEmailNotifier</code> というクラスを探して NameError になりました。設定の保存は成功しているので、例外が出るのは在庫が少なくなって通知を送ろうとしたときです。そのとき運用担当にはメールも Slack も届きません。
          </p>
          <h3>送り方を1つ足すときの手間</h3>
          <p>
            当番の携帯電話に SMS も送りたい、という要望が来たとします。今のクラスの作り方を続けると、どのクラスが必要になるかを数えました。
          </p>
          <Code
            lang="ruby"
            title="script/count.rb"
            code={`
# 送り方に SMS を足したときに必要になる、組み合わせのクラスを数える
Rails.application.eager_load!
existing = Notifier.descendants.map(&:name)

channels = %w[email slack sms]
needed = (1..channels.size).flat_map { |n| channels.combination(n).to_a }.flat_map do |combo|
  name = "#{combo.map(&:camelize).join("And")}Notifier"
  [name, "Urgent#{name}"]
end

puts "今あるクラス: #{existing.size}"
puts "SMS を足した後に必要なクラス: #{needed.size}"
puts "新しく作るクラス: #{(needed - existing).size}"
(needed - existing).each { |name| puts "  #{name}" }
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/count.rb）"
            code={`
今あるクラス: 6
SMS を足した後に必要なクラス: 14
新しく作るクラス: 8
  SmsNotifier
  UrgentSmsNotifier
  EmailAndSmsNotifier
  UrgentEmailAndSmsNotifier
  SlackAndSmsNotifier
  UrgentSlackAndSmsNotifier
  EmailAndSlackAndSmsNotifier
  UrgentEmailAndSlackAndSmsNotifier
`}
          />
          <p>
            8つのクラスを新しく作り、そのたびに親を1つ選び、ほかの送り方の処理と緊急の上書きを写すことになります。今の6つのクラスの中でも、同じ処理がすでに複数の場所に書かれています。
          </p>
          <Code
            lang="text"
            title={'実行結果（grep -rn "SlackClient.post\\|【緊急】\\|oncall@" app/notifiers | sort。直す前）'}
            code={`
app/notifiers/email_and_slack_notifier.rb:5:    SlackClient.post(channel: slack_channel, text: text)
app/notifiers/slack_notifier.rb:3:    SlackClient.post(channel: slack_channel, text: text)
app/notifiers/urgent_email_and_slack_notifier.rb:10:    super + ["oncall@example.com"]
app/notifiers/urgent_email_and_slack_notifier.rb:6:    "【緊急】#{super}"
app/notifiers/urgent_email_notifier.rb:5:    "【緊急】#{super}"
app/notifiers/urgent_email_notifier.rb:9:    super + ["oncall@example.com"]
app/notifiers/urgent_slack_notifier.rb:5:    "【緊急】#{super}"
`}
          />
          <p>
            送り方が n 個あると、送り方の組み合わせは 2<sup>n</sup> − 1 通りで、緊急かどうかを掛けると 2 × (2<sup>n</sup> − 1) 個のサブクラスが必要です。図 53-2 は送り方の数とクラスの数の関係です。継承で組み合わせを表すと、送り方を1つ足すたびにクラスの数がおよそ2倍になります。直した後のコードでは、送り方を1つ足しても送り方のクラスが1つ増えるだけです。
          </p>
          <Figure n="53-2" title="送り方の数とクラスの数" caption="継承の数は script/count.rb と同じ式で計算した。組み合わせの数はこの章で直した後のコードのクラスの数。">
            <GrowthFigure />
          </Figure>
          <h3>このコードの問題</h3>
          <ul>
            <li>送り方と緊急かどうかという2つの違いを、1本の継承の階層で表しています。そのため組み合わせごとにクラスが必要になり、送り方を1つ足すとクラスがおよそ2倍になります。</li>
            <li>Ruby のクラスは親を1つしか持てないので、2つ目の送り方の処理は写すしかありません。Slack の処理は2か所、【緊急】の上書きは3か所にあります。</li>
            <li>兄弟のクラスにある上書きは継承では引き継げず、写し忘れると UrgentEmailAndSlackNotifier のように一部だけが緊急の扱いになります。</li>
            <li>組み合わせがクラスを書いた時点で決まるので、設定から選ぶには、クラス名の規則に合う文字列を作る必要があります。並び順が違うだけで NameError になり、それがわかるのは通知を送るときです。</li>
          </ul>
          <p>次の節で、違いを継承の階層で表さず、部品を組み合わせて表す考え方を説明します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '部品を組み合わせて振る舞いを作る：Composition over Inheritance の意味と由来',
      body: (
        <>
          <h3>Composition over Inheritance とは</h3>
          <p>
            Composition over Inheritance は、継承よりコンポジションを優先し、機能を組み合わせることで柔軟に振る舞いを作るという原則です。言葉を2つ説明します。
          </p>
          <ul>
            <li>
              <Term en="inheritance">継承</Term>は、あるクラス（サブクラス）が別のクラス（親クラス）のメソッドとデータを引き継ぎ、必要なメソッドだけを上書きする仕組みです。前の節の UrgentSlackNotifier は SlackNotifier を継承し、<code>subject</code> と <code>slack_channel</code> を上書きしていました。
            </li>
            <li>
              <Term en="composition">コンポジション</Term>は、オブジェクトがほかのオブジェクトを持ち、仕事の一部をそのオブジェクトに任せる作り方です。任せることを<Term en="delegation">委譲</Term>と呼びます。この章で直した後の Notifier は、EmailChannel や SlackChannel のオブジェクトを配列で持ち、送る仕事をそれぞれの <code>deliver</code> に任せます。
            </li>
          </ul>
          <p>
            継承では、組み合わせはクラスを書いた時点で決まります。コンポジションではどの部品を持たせるかを実行時に決められます。前の節で問題になった「メールと Slack の両方」や「緊急の Slack」は、継承では新しいクラスが必要でしたが、コンポジションでは部品の組み合わせを変えるだけで作れます。
          </p>
          <h3>由来：GoF の『Design Patterns』</h3>
          <p>
            この原則は、Erich Gamma・Richard Helm・Ralph Johnson・John Vlissides の4人（GoF）が1994年に出版した『Design Patterns: Elements of Reusable Object-Oriented Software』<Ref n={1} />の第1章にある、オブジェクト指向設計の原則の1つです。原文は「Favor object composition over class inheritance.」（クラスの継承よりオブジェクトのコンポジションを優先する）で、同じ章のもう1つの原則「Program to an interface, not an implementation.」（実装ではなくインターフェースに対してプログラムする）と並べて挙げられています<Ref n={2} />。
          </p>
          <p>
            Gamma は2005年に公開されたインタビューで、10年たってもこの原則は正しいと考えていると述べ、理由を次のように説明しています<Ref n={2} />。
          </p>
          <ul>
            <li>継承は振る舞いを変える便利な方法だが、壊れやすい。サブクラスは、自分が上書きしたメソッドがどんな状況で呼ばれるかを前提にしやすく、親クラスとサブクラスが強く結びつく。</li>
            <li>API として見ると、「このメソッドは上書きしてよい」と決めることは、「このメソッドは呼んでよい」と決めることより強い約束になる。</li>
            <li>コンポジションでは大きなオブジェクトに小さなオブジェクトを渡して持たせ、大きなオブジェクトは小さなオブジェクトを呼ぶだけになる。Gamma はこれをブラックボックスの再利用と呼び、設定によって振る舞いを変えられると説明している。</li>
            <li>継承では部品を組み合わせて使うことができず、特に実行時には組み合わせを変えられない。この柔軟さの典型的な例として Strategy パターン（<ChapterLink n={41} />）を挙げている。</li>
          </ul>
          <p>
            同じインタビューで Gamma は、コンポジションは継承をまったく使わないという理解は誤りだとも述べています。コンポジションでも継承は使いますが、大きなクラスを継承するのではなく、小さなインターフェースを実装するのがふつうだという説明です<Ref n={2} />。Ruby では、決まった名前のメソッドに応えるオブジェクトであれば、クラスの継承の関係がなくても同じように扱えます。この章の送り方のクラスはどれも <code>deliver(alert)</code> というメソッドを1つ持つだけで、共通の親クラスはありません。
          </p>
          <h3>Ruby で振る舞いを足す3つの方法</h3>
          <p>
            Ruby には、クラスに振る舞いを足す方法が3つあります。Ruby のクラスは <code>class 名前 &lt; 親クラス</code> の形で親を1つだけ指定して継承します。親を指定しなければ Object を継承します<Ref n={4} />。モジュールはクラスに <code>include</code> してメソッドを足す仕組みで、1つのクラスに複数のモジュールを include できます。include したモジュールは <code>ancestors</code> の並びに入り、メソッドはその並びの順に探されます<Ref n={4} />
            <Ref n={5} />。3つ目がコンポジションで、ほかのオブジェクトを持って呼び出します。
          </p>
          <p>
            図 53-3 は前の節の通知を3つの方法で書いたときの構造です。モジュールの include は複数の機能を足せる点で継承と違いますが、組み合わせが決まるのはクラスを書いたときで、組み合わせごとのクラスは残ります。また、同じ名前のメソッドを持つモジュールを2つ include すると、<code>ancestors</code> で先にあるモジュールのメソッドだけが呼ばれます。この動きは「Rails の機能・規約との関係」の節で実行して確かめます。
          </p>
          <Figure n="53-3" title="継承・モジュールの include・コンポジション" caption="左と中央は、組み合わせ1つ分（メールと Slack の両方）を書いたときの構造。右はどの組み合わせでも同じ構造になる。">
            <CompareFigure />
          </Figure>
          <h3>似た原則との違い</h3>
          <ul>
            <li>
              LSP（リスコフの置換原則、<ChapterLink n={65} />）は、継承を使うときに、サブクラスが親クラスの約束を守るようにする原則です。Composition over Inheritance は、そもそも継承を使うかどうかを選ぶときの原則です。親の約束を守れない継承は、コンポジションに替える候補になります。
            </li>
            <li>
              OCP（開放閉鎖の原則、<ChapterLink n={64} />）は、既存のコードを変えずに振る舞いを足せるようにする原則です。この章で直した後のコードでは、SMS を足しても既存の送り方のクラスを変えません。部品を組み合わせる形は OCP を満たす方法の1つです。
            </li>
            <li>
              DRY（<ChapterLink n={59} />）の観点では、前の節のコードは Slack の処理と緊急の上書きを写していました。写すしかなかった理由は、Ruby のクラスが親を1つしか持てないことと、組み合わせごとにクラスを作ったことです。
            </li>
            <li>
              Strategy パターン（<ChapterLink n={41} />）と Dependency Injection（<ChapterLink n={40} />）は、この原則を具体的な形にした設計パターンです。差し替える部品を外から渡すと、テストで偽物の部品を使えます。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: '送り方を部品にして、設定に合わせて組み合わせる',
      body: (
        <>
          <h3>直す順序</h3>
          <p>
            前の節のコードには送り方（メール・Slack）と緊急かどうかという2つの違いがありました。送り方は「どこへどう送るか」という処理なので、部品のクラスにします。緊急かどうかは「その通知が緊急か」という値なので、通知の内容に持たせます。次の順に、テストを通しながら進めます。
          </p>
          <ol>
            <li>通知の内容（件名・本文・緊急かどうか）を、OpsAlert という値のクラスにする</li>
            <li>送り方ごとに EmailChannel・SlackChannel を作り、送る処理と、緊急のときの宛先やチャンネルの切り替えを移す。この時点では古いサブクラスを変えないので、今の動作は変わらない</li>
            <li>Notifier を「送り方の一覧を持ち、順に渡すクラス」に書き換え、NotificationSetting と OpsNotification を新しい形に切り替え、6つのサブクラスを消す。古いサブクラスは Notifier を継承しているので、この3つは1回の変更で行う</li>
            <li>設定を保存する前に、送り方の名前が正しいかを検証する</li>
            <li>SMS を足して、変える範囲が小さいことを確かめる</li>
          </ol>
          <h3>1. 通知の内容を値にする</h3>
          <p>
            OpsAlert は Ruby の <code>Data</code> で作ります。<code>Data</code> は変更できない値のオブジェクトを表すクラスを作るための Ruby の標準のクラスです<Ref n={6} />。件名に【緊急】を付ける規則は、送り方によらず同じなので、ここに1か所だけ書きます。
          </p>
          <Code
            lang="ruby"
            title="app/notifiers/ops_alert.rb"
            code={`
# 運用担当に知らせる内容。緊急かどうかも、送り方ではなく内容の一部として持つ
OpsAlert = Data.define(:title, :body, :urgent) do
  def initialize(title:, body:, urgent: false)
    super
  end

  def subject
    urgent ? "【緊急】#{title}" : title
  end

  def text
    "#{subject}\\n#{body}"
  end
end
`}
          />
          <Callout kind="note">
            <p>
              <code>Data</code> は Ruby 3.2 で加わったクラスです<Ref n={6} />。Ruby 3.1 以前で動かしている場合は、<code>Struct.new(:title, :body, :urgent, keyword_init: true)</code> や、読み取りのメソッドだけを持つ普通のクラスで同じことを書けます。
            </p>
          </Callout>
          <h3>2. 送り方ごとのクラスを作る</h3>
          <p>
            送り方のクラスはどれも <code>deliver(alert)</code> というメソッドを1つだけ持ちます。緊急のときに何を変えるか（メールは当番を宛先に足す、Slack は投稿するチャンネルを変える）は、送り方によって違うので、それぞれのクラスの中で <code>alert.urgent</code> を見て決めます。宛先やチャンネルはコンストラクターの引数にし、既定の値を入れておきます。
          </p>
          <Code
            lang="ruby"
            title="app/notifiers/email_channel.rb と slack_channel.rb"
            code={`
# メールで送る。緊急のときは当番にも送る
class EmailChannel
  def initialize(to: ["ops@example.com"], urgent_to: ["oncall@example.com"])
    @to = to
    @urgent_to = urgent_to
  end

  def deliver(alert)
    recipients = alert.urgent ? @to + @urgent_to : @to
    OpsMailer.alert(to: recipients, subject: alert.subject, body: alert.body).deliver_now
  end
end

# Slack に投稿する。緊急のときは緊急用のチャンネルに投稿する
class SlackChannel
  def initialize(channel: "#ops", urgent_channel: "#ops-urgent")
    @channel = channel
    @urgent_channel = urgent_channel
  end

  def deliver(alert)
    SlackClient.post(channel: alert.urgent ? @urgent_channel : @channel, text: alert.text)
  end
end
`}
          />
          <h3>3. Notifier を、送り方の一覧を持つクラスにする</h3>
          <p>
            Notifier は送り方のオブジェクトを配列で持ち、受け取った通知をそれぞれの <code>deliver</code> に渡すだけのクラスにします。名前と送り方のクラスの対応は <code>CHANNELS</code> に1か所だけ書き、<code>Notifier.build</code> が名前の一覧から送り方のオブジェクトを作ります。<code>"sms"</code> の行は手順5で足したものです。
          </p>
          <Code
            lang="ruby"
            title="app/notifiers/notifier.rb（直した後）"
            code={`
# 送り方（チャンネル）の一覧を持ち、同じ内容をそれぞれに渡す
class Notifier
  CHANNELS = {
    "email" => EmailChannel,
    "slack" => SlackChannel,
    "sms" => SmsChannel,
  }.freeze

  def self.build(names)
    new(names.map { |name| CHANNELS.fetch(name).new })
  end

  def initialize(channels)
    @channels = channels
  end

  def deliver(alert)
    @channels.each { |channel| channel.deliver(alert) }
  end
end
`}
          />
          <p>呼び出し側は設定から Notifier を組み立て、OpsAlert を渡します。緊急かどうかはクラスの名前ではなく OpsAlert の値で伝わります。NotificationSetting の検証（<code>channels_must_be_known</code>）は手順4で足したものです。</p>
          <Code
            lang="ruby"
            title="app/models/notification_setting.rb と app/notifiers/ops_notification.rb（直した後）"
            code={`
class NotificationSetting < ApplicationRecord
  # channels は ["email", "slack"] のような配列。運用担当が管理画面で選ぶ
  validates :event, presence: true, uniqueness: true
  validate :channels_must_be_known

  def notifier
    Notifier.build(channels)
  end

  private

  def channels_must_be_known
    names = Array(channels)
    errors.add(:channels, "を1つ以上選んでください") if names.empty?
    unknown = names - Notifier::CHANNELS.keys
    errors.add(:channels, "に知らない送り方があります: #{unknown.join(", ")}") if unknown.any?
  end
end

module OpsNotification
  def self.notify(event, title:, body:)
    setting = NotificationSetting.find_by!(event: event)
    alert = OpsAlert.new(title: title, body: body, urgent: setting.urgent)
    setting.notifier.deliver(alert)
  end
end
`}
          />
          <p>6つのサブクラスを消した後の app/notifiers は、次のファイルだけになります。</p>
          <Code
            lang="text"
            title="実行結果（ls app/notifiers。直した後）"
            code={`
email_channel.rb
notifier.rb
ops_alert.rb
ops_notification.rb
slack_channel.rb
sms_channel.rb
`}
          />
          <p>
            図 53-4 は直した後の構造です。設定の行から送り方の名前の一覧を読み、Notifier がその名前に対応する部品を持ちます。通知の内容は OpsAlert として、すべての部品に同じものが渡ります。
          </p>
          <Figure n="53-4" title="送り方を組み合わせる構造" caption="太枠の Notifier が持つ部品は、設定の channels から実行時に決まる。">
            <StructureFigure />
          </Figure>
          <h3>同じ6通りを送ると</h3>
          <p>前の節と同じ6通りの組み合わせで、決済の失敗を送りました。クラスを選ぶ代わりに、送り方の名前の配列と緊急かどうかを変えています。</p>
          <Code
            lang="ruby"
            title="script/scene_after.rb"
            code={`
# …（省略：require_relative "support" と、title・body の値は script/scene.rb と同じ）

[[%w[email], false], [%w[slack], false], [%w[email slack], false],
 [%w[email], true], [%w[slack], true], [%w[email slack], true]].each do |names, urgent|
  Notifier.build(names).deliver(OpsAlert.new(title: title, body: body, urgent: urgent))
  puts "#{names.inspect}#{"、緊急" if urgent}"
  sent_lines.each { |line| puts "  #{line}" }
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene_after.rb）"
            code={`
["email"]
  メール ops@example.com「決済に失敗しました」
["slack"]
  Slack #ops「決済に失敗しました」
["email", "slack"]
  メール ops@example.com「決済に失敗しました」
  Slack #ops「決済に失敗しました」
["email"]、緊急
  メール ops@example.com, oncall@example.com「【緊急】決済に失敗しました」
["slack"]、緊急
  Slack #ops-urgent「【緊急】決済に失敗しました」
["email", "slack"]、緊急
  メール ops@example.com, oncall@example.com「【緊急】決済に失敗しました」
  Slack #ops-urgent「【緊急】決済に失敗しました」
`}
          />
          <p>
            最後の組み合わせで、Slack の投稿が #ops-urgent に届くようになりました。緊急の Slack を #ops-urgent にする処理は SlackChannel の中の1か所だけで、どの組み合わせでも同じ SlackChannel を使うので、組み合わせによって扱いが変わることはありません。
          </p>
          <h3>4. 設定を保存する前に送り方の名前を確かめる</h3>
          <p>
            NotificationSetting に、送り方の名前が <code>Notifier::CHANNELS</code> にあるかを確かめる検証を足しました。前の節で NameError になった <code>["slack", "email"]</code> の設定と、存在しない送り方 fax を含む設定を試しました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/settings_after.rb の一部）"
            code={`
stock_low（["slack", "email"]）
  Slack #ops「在庫が少なくなりました」
  メール ops@example.com「在庫が少なくなりました」
order_canceled（["email", "fax"]）→ 保存できるか: false（Channels に知らない送り方があります: fax）
`}
          />
          <p>
            配列の順番は送る順番になるだけです。知らない送り方は通知を送るときではなく管理画面で設定を保存するときに検証のエラーになります。運用担当はその場で誤りに気づけます。
          </p>
          <h3>5. SMS を足す</h3>
          <p>
            当番の携帯電話に SMS を送る要望に、直した後のコードで応えます。SMS の送信サービスに送る SmsClient（この章では架空の URL に POST し、WebMock で受け取ります）と、送り方のクラス SmsChannel を作ります。
          </p>
          <Code
            lang="ruby"
            title="app/notifiers/sms_channel.rb"
            code={`
# 当番の携帯電話に SMS を送る。SMS は短いので件名だけを送る
class SmsChannel
  def initialize(to: "+819000000000")
    @to = to
  end

  def deliver(alert)
    SmsClient.send_message(to: @to, text: alert.subject)
  end
end
`}
          />
          <p>既存のファイルで変えるのは、Notifier の <code>CHANNELS</code> の1行だけです。</p>
          <Code
            lang="text"
            title="app/notifiers/notifier.rb の差分"
            code={`
   CHANNELS = {
     "email" => EmailChannel,
     "slack" => SlackChannel,
+    "sms" => SmsChannel,
   }.freeze
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/settings_after.rb の一部）"
            code={`
payment_failed（["sms", "email", "slack"]、緊急）
  SMS +819000000000「【緊急】決済に失敗しました」
  メール ops@example.com, oncall@example.com「【緊急】決済に失敗しました」
  Slack #ops-urgent「【緊急】決済に失敗しました」
`}
          />
          <p>
            直す前は、SMS を足すと8つのクラスを作り、そのたびにほかの送り方の処理と緊急の上書きを写す必要がありました。直した後は、2つのクラスを作り、1行を足すだけです。図 53-5 は SMS を足すときに変えるものを、直す前と後で比べたものです。
          </p>
          <Figure n="53-5" title="SMS を足すときに変えるもの（直す前と後）" caption="網かけの箱は、新しく作るもの。直す前の8つのクラス名は script/count.rb の実行結果。">
            <ChangeFigure />
          </Figure>
          <h3>部品を差し替えてテストする</h3>
          <p>
            コンポジションにすると、テストで部品を偽物に差し替えられます。Notifier のテストでは RSpec の <code>instance_spy</code>（指定したクラスにあるメソッドだけを受け付け、呼ばれた記録を残す偽物のオブジェクト）を2つ渡し、同じ通知がそれぞれに渡ることを確かめます。メールも Slack も実際には送りません。送り方のクラスのテストはそれぞれ1つのクラスだけを対象に書けます。
          </p>
          <Code
            lang="ruby"
            title="spec/notifiers/notifier_spec.rb と channels_spec.rb（抜粋）"
            code={`
RSpec.describe Notifier do
  let(:alert) { OpsAlert.new(title: "決済に失敗しました", body: "注文 #1001") }

  it "持っているすべての送り方に、同じ内容を渡す" do
    email = instance_spy(EmailChannel)
    slack = instance_spy(SlackChannel)

    Notifier.new([email, slack]).deliver(alert)

    expect(email).to have_received(:deliver).with(alert)
    expect(slack).to have_received(:deliver).with(alert)
  end
end

RSpec.describe "送り方（チャンネル）" do
  # …（省略：normal と urgent の OpsAlert を let で用意する。EmailChannel と SmsChannel のテスト）

  describe SlackChannel do
    before { stub_request(:post, %r{\\Ahttps://hooks\\.slack\\.com/}) }

    it "緊急のときは #ops-urgent に投稿する" do
      SlackChannel.new.deliver(urgent)
      expect(a_request(:post, SlackClient::WEBHOOK_URLS.fetch("#ops-urgent"))
        .with(body: { text: "【緊急】在庫が少なくなりました\\n商品 A-100 の在庫が残り3個です" })).to have_been_made.once
      expect(a_request(:post, SlackClient::WEBHOOK_URLS.fetch("#ops"))).not_to have_been_made
    end
  end
end
`}
          />
          <p>
            このほかに、メールの宛先と件名、SMS の本文、設定の検証、OpsNotification を通した緊急のメールと Slack の組み合わせ（前の節で #ops に届いたもの）のテストを書きました。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec）"
            code={`
...........

Finished in 0.15126 seconds (files took 1 second to load)
11 examples, 0 failures
`}
          />
        </>
      ),
    },
    {
      id: 'overuse',
      title: '当てはめすぎたとき：部品に分けすぎると組み立てが読めなくなる',
      body: (
        <>
          <h3>緊急にする処理と記録も部品にする</h3>
          <p>
            送り方を部品にしてうまくいったので、ほかの処理も部品にしようと考えるかもしれません。次のスクリプトは、緊急にする処理（UrgentMark）と、送った件名を記録する処理（DeliveryLog）を、どちらも「ほかの送り方のオブジェクトを持ち、その <code>deliver</code> を呼ぶ前に処理を足す部品」にしたものです。どちらも <code>deliver(alert)</code> を持つので、送り方と同じように、部品の中に部品を何段でも入れられます。
          </p>
          <Code
            lang="ruby"
            title="script/overuse.rb"
            code={`
require_relative "support"

# 当てはめすぎの例：緊急にする処理と送信の記録も、送り方を持って呼び出す部品にした
class UrgentMark
  def initialize(channel)
    @channel = channel
  end

  def deliver(alert)
    @channel.deliver(alert.with(urgent: true))
  end
end

class DeliveryLog
  def initialize(channel)
    @channel = channel
  end

  def deliver(alert)
    puts "  記録: #{alert.subject}"
    @channel.deliver(alert)
  end
end

alert = OpsAlert.new(title: "決済に失敗しました", body: "注文 #1001")
{
  "DeliveryLog.new(UrgentMark.new(EmailChannel.new))" => DeliveryLog.new(UrgentMark.new(EmailChannel.new)),
  "UrgentMark.new(DeliveryLog.new(EmailChannel.new))" => UrgentMark.new(DeliveryLog.new(EmailChannel.new)),
}.each do |label, channel|
  puts label
  channel.deliver(alert)
  sent_lines.each { |line| puts "  #{line}" }
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/overuse.rb）"
            code={`
DeliveryLog.new(UrgentMark.new(EmailChannel.new))
  記録: 決済に失敗しました
  メール ops@example.com, oncall@example.com「【緊急】決済に失敗しました」
UrgentMark.new(DeliveryLog.new(EmailChannel.new))
  記録: 【緊急】決済に失敗しました
  メール ops@example.com, oncall@example.com「【緊急】決済に失敗しました」
`}
          />
          <p>
            同じ3つの部品で、入れ子にする順番だけを変えました。1つ目は記録した時点ではまだ緊急になっていないので、緊急のメールを送ったのに記録には【緊急】がありません。図 53-6 は2つの組み立て方の違いです。
          </p>
          <Figure n="53-6" title="入れ子の順番で結果が変わる" caption="外側の部品から順に deliver(alert) を呼ぶ。破線の枠は、内側の部品を持ち、その deliver(alert) を呼ぶ部品。">
            <OrderFigure />
          </Figure>
          <p>
            「記録は緊急にした後で行う」という決まりは、UrgentMark にも DeliveryLog にも書かれていません。組み立てるコードを書く人が知っていなければならず、組み立てる場所が増えるたびに同じ決まりを守る必要があります。前の節のコードでは、緊急かどうかは OpsAlert の値として最初から決まっているので、順番の決まりがありません。
          </p>
          <p>
            部品に分けると、1つのクラスは小さく読みやすくなりますが、全体の動きは組み立てるコードを読まなければわかりません。「緊急の通知はどう送られるか」を知るのに、5つのクラスと組み立ての順番を読むことになるなら、分けすぎています。部品にするのは、入れ替えたり組み合わせたりする必要がある処理だけにし、どの組み合わせでも同じ処理（件名に【緊急】を付ける規則など）は、値や1つのクラスの中に書きます。
          </p>
          <h3>継承をすべて避ける</h3>
          <p>
            反対の方向の当てはめすぎもあります。この章のアプリでも、OpsMailer は ApplicationMailer を継承し、ApplicationMailer は ActionMailer::Base を継承しています。Rails のメーラー・コントローラー・ジョブ・モデルは、Rails が用意した基底クラスを継承し、決められたメソッド（メーラーのアクション、ジョブの <code>perform</code> など）を書くと、Rails がそれを呼ぶように作られています。ここで継承を避けて独自の仕組みを作ると、既定の送信元・レイアウト・<code>deliver_later</code> のような、基底クラスが用意している機能を自分で作り直すことになります。
          </p>
          <p>
            違いが1つの軸だけで、組み合わせることがなく、サブクラスが親の約束を守れる場合も、継承で足ります。たとえば会員への通知を「メール」と「SMS」の2種類だけで表し、両方を同時に送ることがない場合は、STI（単一テーブル継承）のサブクラスで表す方法が使えます（<ChapterLink n={65} />）。送り方が1つしかなく、増やす予定もないなら、Notifier と送り方のクラスに分けず、メーラーを直接呼べば済みます（<ChapterLink n={58} />）。Gamma も、コンポジションは継承を使わないことではなく、大きなクラスの継承を避けて小さなインターフェースを実装することだと述べています<Ref n={2} />。
          </p>
          <h3>判断の目安</h3>
          <p>
            どの方法を選ぶかは「違いの軸はいくつあり、組み合わせるか」「組み合わせはいつ決まるか」「フレームワークが継承を前提にしているか」の3つで判断します。図 53-7 は、3つの方法が向いている場面をまとめたものです。
          </p>
          <Figure n="53-7" title="継承・モジュールの include・コンポジションを選ぶ目安" caption="どの方法も、条件によって効果があったり逆効果になったりする。迷ったときは、違いの軸の数と、組み合わせが決まる時点を確かめる。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">方法</th>
                    <th scope="col">向いている場面</th>
                    <th scope="col">避けたい場面</th>
                    <th scope="col">例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">継承</th>
                    <td>フレームワークの基底クラスを使う。違いが1つの軸だけで組み合わせず、サブクラスが親の約束を守れる</td>
                    <td>2つ以上の違いを組み合わせる。兄弟のクラスの処理を使いたい。実行時に選び直す</td>
                    <td>OpsMailer &lt; ApplicationMailer、STI の会員への通知（<ChapterLink n={65} />）</td>
                  </tr>
                  <tr>
                    <th scope="row">モジュールの include（concern）</th>
                    <td>状態を持たない小さな処理や宣言を、複数のクラスに同じように足す。足したクラスはその処理を常に使う</td>
                    <td>同じ名前のメソッドを持つ候補から1つを選ぶ。組み合わせを実行時に変える</td>
                    <td>delegated_type のドキュメントの Entryable（関連の宣言を共有する）</td>
                  </tr>
                  <tr>
                    <th scope="row">コンポジション</th>
                    <td>2つ以上の違いを組み合わせる。設定やデータから実行時に選ぶ。テストで部品を差し替える</td>
                    <td>部品が1つで差し替える予定がない。部品の組み立てに順番の決まりがある（図 53-6）</td>
                    <td>この章の Notifier と送り方、Action Mailer の配信方法</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            前の節の通知は送り方と緊急かどうかという2つの違いを組み合わせ、組み合わせを運用担当が管理画面で選ぶので、コンポジションが合っていました。違いが1つだけなら継承や条件分岐で足り、違いが増えて組み合わせが生まれた時点で、部品に分けることを考えます。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能・規約との関係',
      body: (
        <>
          <h3>Rails の基底クラスは継承で使う</h3>
          <p>
            Rails のアプリでは ApplicationRecord・ApplicationController・ApplicationJob・ApplicationMailer を継承してクラスを書きます。これらは、Rails が呼ぶメソッドの名前と順番を決めていて、サブクラスはその決まりに沿ってメソッドを書きます。親は1つで、組み合わせることもないので、継承が合っています。この章で避けたのは、アプリの中の違い（送り方と緊急かどうか）を、自分で作った継承の階層で組み合わせることです。
          </p>
          <h3>Rails の中で部品を差し替える仕組み</h3>
          <p>
            Rails 自身も、環境によって変わる部分は、継承ではなく部品の差し替えで扱っています。Action Mailer は配信方法の名前（<code>:smtp</code>・<code>:sendmail</code>・<code>:file</code>・<code>:test</code>）と、実際に送るクラス（Mail::SMTP・Mail::TestMailer など）の対応を登録しています。メールを送るときは、設定された <code>delivery_method</code> の名前から送るクラスを選び、メールのオブジェクトに渡します<Ref n={8} />。この章のテストでは <code>delivery_method = :test</code> にしているので、OpsMailer を変えずに、送ったメールが <code>ActionMailer::Base.deliveries</code> にたまります。
          </p>
          <p>
            Active Job も同じです。<code>config.active_job.queue_adapter = :sidekiq</code> と書くと、名前からアダプターのクラスを探してオブジェクトを作り、保持します。ジョブを登録するときは、そのアダプターの <code>enqueue</code> を呼びます<Ref n={9} />。この章のアプリは、開発環境では Sidekiq、テスト環境では <code>:test</code> のアダプターを使っていて、ジョブのクラスはどちらでも同じです。どちらの仕組みもこの章の <code>Notifier::CHANNELS</code> と同じく、名前と部品のクラスの対応を1か所に持ち、設定で選んでいます。
          </p>
          <h3>concern（モジュールの include）で組み合わせる場合</h3>
          <p>
            Rails の concern は Ruby のモジュールに、include したときに実行する処理やクラスメソッドを書きやすくする仕組みです。Rails Doctrine は concern を、Ruby のモジュールの上の薄い構文で、1つのクラスに、関係はあるが別々に理解できる複数の関心事をまとめるためのものと説明しています<Ref n={7} />。では、送り方をモジュールにして include すれば、継承の問題は解決するでしょうか。メールと Slack を送るモジュールを作り、1つのクラスに両方を include しました。
          </p>
          <Code
            lang="ruby"
            title="script/mixin.rb（直す前のアプリで実行）"
            code={`
# 送り方をモジュールにして、組み合わせのクラスで include する
module EmailDelivery
  def deliver
    OpsMailer.alert(to: ["ops@example.com"], subject: subject, body: @body).deliver_now
  end
end

module SlackDelivery
  def deliver
    SlackClient.post(channel: "#ops", text: text)
  end
end

class MixinEmailAndSlackNotifier < Notifier
  include EmailDelivery
  include SlackDelivery
end

chain = MixinEmailAndSlackNotifier.ancestors.then { |list| list.take(list.index(Notifier) + 1) }
puts "ancestors: #{chain.join(" → ")}"
puts "deliver の持ち主: #{MixinEmailAndSlackNotifier.instance_method(:deliver).owner}"
MixinEmailAndSlackNotifier.new(title: "決済に失敗しました", body: "注文 #1001").deliver
# …（省略：送った内容を表示する）
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/mixin.rb）"
            code={`
ancestors: MixinEmailAndSlackNotifier → SlackDelivery → EmailDelivery → Notifier
deliver の持ち主: SlackDelivery
送った内容:
  Slack #ops「決済に失敗しました」
`}
          />
          <p>
            後から include した SlackDelivery が <code>ancestors</code> の先に入り、<code>deliver</code> を呼ぶと SlackDelivery のものだけが動きました。EmailDelivery の <code>deliver</code> は呼ばれず、例外も出ないので、メールが送られていないことは実行結果を見るまでわかりません。両方を動かすには、各モジュールの <code>deliver</code> で <code>super</code> を呼び、親の Notifier の <code>deliver</code> を例外を投げない形に変える必要があり、送る順番は include の順番で決まります。それでも、組み合わせごとのクラス（MixinEmailAndSlackNotifier など）は残り、緊急の扱いも別に必要です。
          </p>
          <p>
            モジュールの include が向いているのは、include するクラスがその処理を常に使う場合です。たとえば delegated_type のドキュメントの例では、Entryable という concern が <code>has_one :entry</code> の宣言を Message と Comment に共有しています<Ref n={11} />。同じ名前のメソッドを持つ候補から1つを選ぶ、組み合わせを実行時に決める、といった場面では、この章のようにオブジェクトを組み合わせます。concern の使い方は<ChapterLink n={31} section="concern" />で扱っています。
          </p>
          <h3>delegate と delegated_type</h3>
          <p>
            Active Support の <code>delegate</code> は、メソッドの呼び出しを、持っている別のオブジェクトに渡すメソッドを作ります。<code>delegate :first_name, to: :profile</code> と書くと、<code>first_name</code> を呼んだときに <code>profile.first_name</code> が呼ばれます。作ったメソッドは既定で public で、<code>private: true</code> を付けると private になります<Ref n={10} />。コンポジションで持った部品のメソッドを外に見せるときに、委譲のメソッドを1つずつ手で書かずに済みます。
          </p>
          <p>
            Active Record の <code>delegated_type</code> は、モデルの種類の違いを、継承ではなく委譲で表す機能です。ドキュメントはクラスの階層をテーブルに対応させる方法として、属性を持たない抽象クラスと STI を挙げ、STI はサブクラスとその属性の違いが小さいときに最も向いていると説明しています。そのうえで delegated_type を、共通の属性を親のテーブルに、種類ごとの属性をそれぞれのテーブルに置き、実際の継承ではなく委譲で階層を作る3つ目の方法として紹介しています<Ref n={11} />。STI で表した通知と、delegated_type に替える目安は<ChapterLink n={65} section="rails" />で扱っています。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>部品を差し替えて振る舞いを変える Strategy パターンは<ChapterLink n={41} />、部品を外から渡す Dependency Injection は<ChapterLink n={40} />で扱っています。</li>
            <li>SlackClient と SmsClient は、外部のサービスの API を、アプリの中で使う形に合わせるクラスです。この形は Adapter（<ChapterLink n={42} />）で扱っています。</li>
            <li>名前と部品の対応を1か所に置き、既存のコードを変えずに種類を足す方法は、OCP（<ChapterLink n={64} />）でも扱っています。</li>
            <li>継承を使うときにサブクラスが親の約束を守ることは LSP（<ChapterLink n={65} />）、メーラーの送信は<ChapterLink n={19} />で扱っています。</li>
            <li>
              直した後の Notifier は、送り方のどれかが例外を投げると、残りの送り方に渡しません。1つの送り方が失敗したときに残りを送るかどうかは、Graceful Degradation（<ChapterLink n={91} />）で扱う判断です。
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
          <li>送り方と緊急かどうかのように組み合わせる違いを継承の階層で表すと、組み合わせごとにサブクラスが必要になり、送り方が n 個なら 2 × (2<sup>n</sup> − 1) 個に増えます。</li>
          <li>Ruby のクラスは親を1つしか持てず、兄弟のクラスにある上書きは引き継げません。写し忘れた UrgentEmailAndSlackNotifier では、緊急の Slack が通常のチャンネルに届きました。</li>
          <li>Composition over Inheritance は、継承よりコンポジションを優先し、機能を組み合わせて振る舞いを作る原則です。GoF の『Design Patterns』（1994）の第1章にある原則で、Gamma は継承では部品を組み合わせられず、特に実行時に変えられないことを理由に挙げています。</li>
          <li>直すときは、入れ替える処理（送り方）を <code>deliver(alert)</code> に応える部品のクラスにし、どの組み合わせでも同じ値（緊急かどうか）は通知の内容に持たせます。SMS を足す変更は2つのクラスと1行で済みました。</li>
          <li>部品に分けすぎると、組み立ての順番に決まりが生まれ、全体の動きを組み立てのコードから読み取る必要が出ます。どの組み合わせでも同じ処理は部品にせず、値や1つのクラスに書きます。</li>
          <li>Rails の基底クラスのように、フレームワークが継承を前提にしている場所と、違いが1つの軸だけの場所では、継承が合っています。モジュールの include は常に使う処理を足すときに向き、候補から1つを選ぶ場面には向きません。</li>
        </ul>
      ),
    },
  ],
  sources: [
    {
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      publisher: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides／Addison-Wesley（InformIT の書籍ページ）',
      url: 'https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610',
      accessed: '2026-11-22',
      version: '1994年10月31日刊（著作権表記1995年）',
      note: '書籍の書誌情報（著者・出版年）。第1章の原則の文言は、書籍の本文ではなく出典2のインタビューで確かめた。',
    },
    {
      title: 'Design Principles from Design Patterns: A Conversation with Erich Gamma, Part III',
      publisher: 'Bill Venners／Artima',
      url: 'https://www.artima.com/articles/design-principles-from-design-patterns',
      accessed: '2026-11-22',
      version: '2005年6月6日（インタビューは2004年10月27日）',
      note: 'GoF の第1章（Introduction）にある2つの原則「Program to an interface, not an implementation」「Favor object composition over class inheritance」。継承は壊れやすく親子が強く結びつくこと、上書きを許すことは呼び出しを許すことより強い約束であること、ブラックボックスの再利用、Strategy が典型の例であること、継承では実行時に組み合わせられないこと、コンポジションも小さなインターフェースの継承を使うこと。',
    },
    {
      title: 'Sending messages using incoming webhooks',
      publisher: 'Slack Developer Docs',
      url: 'https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks',
      accessed: '2026-11-22',
      note: 'Incoming Webhook は発行された URL に text を含む JSON を POST してメッセージを投稿すること。URL は1つのチャンネルに対応すること。',
    },
    {
      title: 'Modules and Classes',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/syntax/modules_and_classes_rdoc.html',
      accessed: '2026-11-22',
      note: 'クラスは < の後に1つのクラス名を書いて継承し、指定しなければ Object を継承すること。モジュールを include すると ancestors に入ること。',
    },
    {
      title: 'Module#ancestors',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/Module.html#method-i-ancestors',
      accessed: '2026-11-22',
      note: 'ancestors が、モジュール自身と、include・prepend したモジュールの一覧を返すこと（メソッドを探す順番は Ruby 4.0.9 で実行して確かめた）。',
    },
    {
      title: 'NEWS for Ruby 3.2.0（Data）',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/NEWS/NEWS-3_2_0_md.html',
      accessed: '2026-11-22',
      version: 'Ruby 3.2.0',
      note: 'Data が、変更できない簡単な値のオブジェクトを表す新しいコアのクラスとして Ruby 3.2 で加わったこと。',
    },
    {
      title: 'The Rails Doctrine',
      publisher: 'rubyonrails.org / David Heinemeier Hansson',
      url: 'https://rubyonrails.org/doctrine',
      accessed: '2026-11-22',
      note: 'concern は Ruby のモジュールの上の薄い構文で、1つのクラスに関係はあるが別々に理解できる複数の関心事をまとめるためのものであること（Provide sharp knives）。concern がモデルの公開する範囲を広げ、Active Record パターンに合うこと（No one paradigm）。',
    },
    {
      title: 'actionmailer/lib/action_mailer/delivery_methods.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/actionmailer/lib/action_mailer/delivery_methods.rb#L19-L72`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: '配信方法の名前（:smtp・:file・:sendmail・:test）と送るクラスの対応を add_delivery_method で登録し、wrap_delivery_behavior が設定の名前からクラスを選んでメールのオブジェクトに渡すこと。',
    },
    {
      title: 'activejob/lib/active_job/queue_adapter.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activejob/lib/active_job/queue_adapter.rb#L46-L70`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: 'queue_adapter= が名前からアダプターのクラスを探してオブジェクトを作り、保持すること。登録のときにアダプターの enqueue を呼ぶことは enqueuing.rb の 103〜108 行目で確かめた。',
    },
    {
      title: 'activesupport/lib/active_support/core_ext/module/delegation.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activesupport/lib/active_support/core_ext/module/delegation.rb#L106-L112`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: 'delegate で作ったメソッドは既定で public で、private: true で private になること。',
    },
    {
      title: 'activerecord/lib/active_record/delegated_type.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/delegated_type.rb#L6-L62`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: '抽象クラスと STI の欠点、STI はサブクラスと属性の違いが小さいときに向くこと、delegated_type は実際の継承ではなく委譲で階層を作ること。Entryable の concern が has_one :entry を共有する例。',
    },
  ],
}

export default chapter
