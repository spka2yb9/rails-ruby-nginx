import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 64-1 場面の構成 ---------- */
const sceneClients = [
  { name: 'CheckoutService', job: '注文の確定', uses: 'charge' },
  { name: 'PreorderService', job: '予約商品', uses: 'authorize・capture・void' },
  { name: 'RefundService', job: '管理画面の返金', uses: 'refund' },
  { name: 'SubscriptionService', job: '定期便', uses: 'create_・cancel_subscription' },
]

const sceneAdapters: { lines: string[]; company: string; fill: 'box' | 'box5'; tone: 'muted' | 'danger' }[] = [
  { lines: ['CardPayAdapter', '7つすべてを実装'], company: 'カード決済の会社', fill: 'box', tone: 'muted' },
  { lines: ['KonbiniAdapter', 'charge だけを実装', 'ほかの6つは NotImplementedError'], company: 'コンビニ払いの会社', fill: 'box5', tone: 'danger' },
  { lines: ['PayLaterAdapter', 'charge・refund を実装', 'ほかの5つは NotImplementedError'], company: '後払いの会社', fill: 'box', tone: 'danger' },
]

function SceneFigure() {
  return (
    <Svg
      id="64-1"
      w={780}
      h={420}
      label="上の段は決済を使う4つのクラス。CheckoutService は注文の確定で charge を、PreorderService は予約商品で authorize・capture・void を、RefundService は管理画面の返金で refund を、SubscriptionService は定期便で create_subscription と cancel_subscription を呼ぶ。4つとも、7つのメソッドを持つ1つの Payments の取り決めを通して決済会社の Adapter を使う。下の段の3つの Adapter は、取り決めの7つのメソッドをすべて定義している。CardPayAdapter は7つすべてを実装し、KonbiniAdapter は charge だけを実装してほかの6つは NotImplementedError を発生させ、PayLaterAdapter は charge と refund を実装してほかの5つは NotImplementedError を発生させる。各 Adapter の下に、カード決済・コンビニ払い・後払いの会社がある。RefundService がコンビニ払いの注文で refund を呼ぶと NotImplementedError で止まり、respond_to?(:refund) は3社とも true を返す"
    >
      {sceneClients.map((c, i) => (
        <g key={c.name}>
          <Box x={10 + i * 192} y={16} w={182} h={66} lines={[c.name, c.job, c.uses]} fs={12} bold subTone="muted" />
          <Arrow x1={101 + i * 192} y1={82} x2={101 + i * 192} y2={118} />
        </g>
      ))}
      <Box
        x={10}
        y={120}
        w={758}
        h={50}
        lines={['Payments の取り決め（Adapter は7つのメソッドをすべて定義する）', 'charge・refund・authorize・capture・void・create_subscription・cancel_subscription']}
        fs={12}
        fill="box2"
        dashed
        bold
        subTone="muted"
      />
      {sceneAdapters.map((a, i) => (
        <g key={a.lines[0]}>
          <Arrow x1={130 + i * 259} y1={222} x2={130 + i * 259} y2={172} dashed />
          <Box x={10 + i * 259} y={222} w={240} h={66} lines={a.lines} fs={12} fill={a.fill} bold subTone={a.tone} />
          <Arrow x1={130 + i * 259} y1={288} x2={130 + i * 259} y2={320} />
          <Box x={10 + i * 259} y={322} w={240} h={34} lines={a.company} fs={12} fill="box4" />
        </g>
      ))}
      <T x={140} y={198} fs={11} tone="muted">
        取り決めを満たす
      </T>
      <T x={10} y={386} fs={12} tone="danger">
        RefundService がコンビニ払いの注文で refund を呼ぶと、NotImplementedError で止まる
      </T>
      <T x={10} y={408} fs={12} tone="danger">
        respond_to?(:refund) は3社とも true を返すので、呼ぶ前に見分けられない
      </T>
    </Svg>
  )
}

/* ---------- 図 64-2 返金ボタンから 500 までの流れ ---------- */
function TimelineFigure() {
  const xs = [80, 235, 390, 545, 700]
  const names = ['管理者（ブラウザー）', 'RefundsController', 'RefundService', 'KonbiniAdapter', 'orders テーブル']
  const msgs: { y: number; from: number; to: number; text: string; ret?: boolean }[] = [
    { y: 84, from: 0, to: 1, text: 'POST …/2/refund' },
    { y: 124, from: 1, to: 2, text: 'call(order)' },
    { y: 164, from: 2, to: 3, text: 'refund(…)' },
    { y: 204, from: 3, to: 2, text: 'NotImplementedError', ret: true },
    { y: 274, from: 2, to: 1, text: 'NotImplementedError', ret: true },
    { y: 314, from: 1, to: 0, text: '500 エラー画面', ret: true },
  ]
  return (
    <Svg
      id="64-2"
      w={780}
      h={396}
      label="注文一覧では、コンビニ払いの注文でも refundable?（respond_to?(:refund)）が true なので、返金ボタンが出ている。管理者がボタンを押すと、ブラウザーは POST /admin/orders/2/refund を RefundsController に送る。RefundsController は RefundService の call を呼び、RefundService は KonbiniAdapter の refund を呼ぶ。KonbiniAdapter は NotImplementedError を発生させる。RefundService の rescue => e は StandardError だけを捕まえるので、NotImplementedError はそのまま RefundsController に戻り、Rails はブラウザーに 500 Internal Server Error を返す。orders テーブルの注文は status が paid のままで、refund_error にも何も入らない"
    >
      {names.map((n, i) => (
        <g key={n}>
          <Box x={xs[i] - 75} y={10} w={150} h={36} lines={n} fs={11} fill={i === 4 ? 'box4' : i === 3 ? 'box5' : 'box'} mono={i >= 1 && i <= 3} />
          <line x1={xs[i]} y1={46} x2={xs[i]} y2={336} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <T x={8} y={362} fs={11} tone="muted">
        押す前：注文一覧で refundable?（respond_to?(:refund)）が true のため、
      </T>
      <T x={8} y={380} fs={11} tone="muted">
        コンビニ払いの注文にも返金ボタンが出ている
      </T>
      {msgs.map((m) => {
        const dir = m.to > m.from ? 1 : -1
        return (
          <g key={m.y}>
            <Arrow x1={xs[m.from]} y1={m.y} x2={xs[m.to] - 2 * dir} y2={m.y} dashed={m.ret} />
            <T x={(xs[m.from] + xs[m.to]) / 2} y={m.y - 10} anchor="middle" fs={11} tone={m.ret ? 'danger' : undefined} mono>
              {m.text}
            </T>
          </g>
        )
      })}
      <T x={398} y={238} fs={11} tone="danger">
        rescue =&gt; e で捕まらない
      </T>
      <T x={700} y={362} fs={11} anchor="middle" tone="danger">
        status は paid のまま
      </T>
      <T x={700} y={380} fs={11} anchor="middle" tone="danger">
        refund_error も入らない
      </T>
    </Svg>
  )
}

/* ---------- 図 64-3 例外クラスの継承関係と rescue => e の範囲 ---------- */
function ExceptionFigure() {
  return (
    <Svg
      id="64-3"
      w={780}
      h={310}
      label="Exception の下に ScriptError と StandardError がある。ScriptError の下に NotImplementedError と LoadError がある。StandardError の下に NameError、ArgumentError、RuntimeError があり、NameError の下に NoMethodError がある。クラスを書かない rescue（rescue => e）が捕まえるのは StandardError とその下のクラスだけで、Payments::KonbiniAdapter#refund が発生させた NotImplementedError はその範囲の外にある"
    >
      <rect x={350} y={74} width={425} height={196} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <Box x={300} y={14} w={180} h={34} lines="Exception" fs={12} mono />
      <Box x={90} y={86} w={180} h={34} lines="ScriptError" fs={12} mono />
      <Box x={470} y={86} w={200} h={34} lines="StandardError" fs={12} mono />
      <Arrow x1={180} y1={86} x2={360} y2={50} />
      <Arrow x1={570} y1={86} x2={420} y2={50} />

      <Box x={20} y={160} w={180} h={34} lines="NotImplementedError" fs={12} fill="box5" mono />
      <Box x={215} y={160} w={110} h={34} lines="LoadError" fs={12} mono />
      <Arrow x1={110} y1={160} x2={160} y2={122} />
      <Arrow x1={270} y1={160} x2={220} y2={122} />

      <Box x={362} y={160} w={120} h={34} lines="NameError" fs={12} mono />
      <Box x={496} y={160} w={130} h={34} lines="ArgumentError" fs={12} mono />
      <Box x={640} y={160} w={125} h={34} lines="RuntimeError" fs={12} mono />
      <Arrow x1={422} y1={160} x2={530} y2={122} />
      <Arrow x1={561} y1={160} x2={570} y2={122} />
      <Arrow x1={702} y1={160} x2={610} y2={122} />
      <Box x={362} y={226} w={120} h={34} lines="NoMethodError" fs={12} mono />
      <Arrow x1={422} y1={226} x2={422} y2={196} />

      <T x={20} y={216} fs={11} tone="danger">
        KonbiniAdapter#refund が
      </T>
      <T x={20} y={234} fs={11} tone="danger">
        発生させた例外
      </T>
      <T x={360} y={292} fs={12} tone="acc">
        破線の枠：rescue =&gt; e（クラスを書かない rescue）が捕まえる範囲
      </T>
    </Svg>
  )
}

/* ---------- 図 64-4 大きな取り決めと、使う側ごとの取り決め ---------- */
const splitClients = ['注文の確定', '予約商品', '管理画面の返金', '定期便']
const splitRoles = [
  ['請求', 'charge'],
  ['与信', 'authorize・capture・void'],
  ['返金', 'refund'],
  ['定期課金', 'create_・cancel_subscription'],
]
const splitAdapters: { name: string; empty: string; roles: string[] }[] = [
  { name: 'CardPay', empty: '空のメソッド 0', roles: ['請求・与信・', '返金・定期課金'] },
  { name: 'Konbini', empty: '空のメソッド 6', roles: ['請求'] },
  { name: 'PayLater', empty: '空のメソッド 5', roles: ['請求・返金'] },
]

function SplitFigure() {
  const rowY = [44, 116, 188, 260]
  const adY = [64, 154, 244]
  return (
    <Svg
      id="64-4"
      w={780}
      h={362}
      label="左は直す前。注文の確定・予約商品・管理画面の返金・定期便の4つの使う側が、7つのメソッドを並べた1つの Payments の取り決めを使う。CardPay・Konbini・PayLater の3つの Adapter は、どれもこの取り決めの7つのメソッドをすべて定義し、対応しない機能は空のメソッド（NotImplementedError）にする。空のメソッドは CardPay が0、Konbini が6、PayLater が5。右は直した後。使う側ごとに取り決めを分け、注文の確定は請求（charge）、予約商品は与信（authorize・capture・void）、管理画面の返金は返金（refund）、定期便は定期課金（create_subscription・cancel_subscription）の取り決めを使う。右の CardPay・Konbini・PayLater の箱の中には、満たす取り決めを書いた。CardPay は請求・与信・返金・定期課金の4つを満たし、Konbini は請求だけ、PayLater は請求と返金を満たす。各社は満たす取り決めのメソッドだけを定義する"
    >
      <T x={10} y={24} bold>
        直す前：1つの大きな取り決め
      </T>
      <T x={405} y={24} bold>
        直した後：使う側ごとの取り決め
      </T>
      <line x1={392} y1={10} x2={392} y2={352} stroke="var(--fig-line)" strokeDasharray="3 4" />

      {splitClients.map((c, i) => (
        <g key={c}>
          <Box x={10} y={rowY[i]} w={88} h={60} lines={c} fs={11} />
          <Arrow x1={98} y1={rowY[i] + 30} x2={116} y2={rowY[i] + 30} />
          <Box x={405} y={rowY[i]} w={88} h={60} lines={c} fs={11} />
          <Arrow x1={493} y1={rowY[i] + 30} x2={509} y2={rowY[i] + 30} />
          <Box x={511} y={rowY[i]} w={156} h={60} lines={splitRoles[i]} fs={11} fill="box2" dashed bold subTone="muted" />
        </g>
      ))}
      <Box
        x={118}
        y={44}
        w={150}
        h={276}
        lines={['Payments の取り決め', '', 'charge', 'refund', 'authorize', 'capture', 'void', 'create_subscription', 'cancel_subscription']}
        fs={11}
        fill="box2"
        dashed
        bold
        subTone="muted"
      />
      {splitAdapters.map((a, i) => (
        <g key={a.name}>
          <Box x={290} y={adY[i]} w={92} h={56} lines={[a.name, a.empty]} fs={11} fill={i === 0 ? 'box' : 'box5'} subTone={i === 0 ? 'muted' : 'danger'} />
          <Arrow x1={290} y1={adY[i] + 28} x2={270} y2={adY[i] + 28} dashed />
          <Box x={684} y={adY[i] - 4} w={90} h={64} lines={[a.name, ...a.roles]} fs={11} subTone="muted" />
        </g>
      ))}
      <T x={10} y={346} fs={11} tone="danger">
        Konbini・PayLater も7つすべてを定義する
      </T>
      <T x={684} y={330} fs={11} tone="muted">
        箱の中は満たす
      </T>
      <T x={684} y={346} fs={11} tone="muted">
        取り決め
      </T>
      <T x={405} y={346} fs={11} tone="acc">
        各社は、満たす取り決めのメソッドだけを定義する
      </T>
    </Svg>
  )
}

/* ---------- 図 64-6 役割ごとの shared_examples ---------- */
const contractBoxes = [
  ['請求の取り決めを満たす', 'charge'],
  ['返金の取り決めを満たす', 'refund'],
  ['与信の取り決めを満たす', 'authorize・capture・void'],
  ['定期課金の取り決めを満たす', 'create_・cancel_subscription'],
]
const specBoxes: { lines: string[]; uses: number[] }[] = [
  { lines: ['card_pay_adapter_spec.rb', '4つの取り決めを組み込む'], uses: [0, 1, 2, 3] },
  { lines: ['pay_later_adapter_spec.rb', '請求と返金を組み込む'], uses: [0, 1] },
  { lines: ['konbini_adapter_spec.rb', '請求を組み込む', 'refund を持たないことも確かめる'], uses: [0] },
]

function ContractsFigure() {
  const topX = (i: number) => 10 + i * 190
  const botX = (j: number) => 10 + j * 260
  // 矢印の始まりと終わりを、箱の幅の中で等間隔に置く
  const outCount = [0, 0, 0, 0]
  for (const s of specBoxes) for (const u of s.uses) outCount[u] += 1
  const outSeen = [0, 0, 0, 0]
  const links: { key: string; x1: number; x2: number }[] = []
  for (let j = 0; j < specBoxes.length; j++) {
    const uses = specBoxes[j].uses
    for (let k = 0; k < uses.length; k++) {
      const u = uses[k]
      outSeen[u] += 1
      links.push({
        key: `${u}-${j}`,
        x1: topX(u) + (178 * outSeen[u]) / (outCount[u] + 1),
        x2: botX(j) + (240 * (k + 1)) / (uses.length + 1),
      })
    }
  }
  return (
    <Svg
      id="64-6"
      w={780}
      h={292}
      label="上の段は spec/support/payment_contracts.rb に書いた4つの shared_examples。請求の取り決め（charge）、返金の取り決め（refund）、与信の取り決め（authorize・capture・void）、定期課金の取り決め（create_subscription・cancel_subscription）。下の段は3つの Adapter の spec。card_pay_adapter_spec.rb は4つの取り決めをすべて組み込む。pay_later_adapter_spec.rb は請求と返金を組み込む。konbini_adapter_spec.rb は請求だけを組み込み、refund を持たないことも確かめる"
    >
      <T x={10} y={18} fs={12} bold>
        spec/support/payment_contracts.rb の shared_examples
      </T>
      {contractBoxes.map((c, i) => (
        <Box key={c[0]} x={topX(i)} y={30} w={178} h={56} lines={c} fs={12} fill="box2" dashed bold subTone="muted" />
      ))}
      {links.map((l) => (
        <Arrow key={l.key} x1={l.x1} y1={86} x2={l.x2} y2={198} dashed />
      ))}
      <T x={480} y={150} fs={11} tone="muted">
        it_behaves_like で組み込む
      </T>
      {specBoxes.map((s, j) => (
        <Box key={s.lines[0]} x={botX(j)} y={200} w={240} h={70} lines={s.lines} fs={11} bold subTone="muted" />
      ))}
    </Svg>
  )
}

/* ---------- 図 64-7 定期課金の一時停止を足したときに変えたファイル ---------- */
const changeBefore: { file: string; diff: string; unrelated?: boolean }[] = [
  { file: 'app/adapters/payments.rb', diff: '+3 −1' },
  { file: 'app/adapters/payments/card_pay_adapter.rb', diff: '+1' },
  { file: 'app/adapters/payments/konbini_adapter.rb', diff: '+4', unrelated: true },
  { file: 'app/adapters/payments/pay_later_adapter.rb', diff: '+4', unrelated: true },
  { file: 'spec/adapters/payments/card_pay_adapter_spec.rb', diff: '+1' },
  { file: 'spec/adapters/payments/konbini_adapter_spec.rb', diff: '+1', unrelated: true },
  { file: 'spec/adapters/payments/pay_later_adapter_spec.rb', diff: '+1', unrelated: true },
]
const changeAfter: { file: string; diff: string }[] = [
  { file: 'app/adapters/payments.rb', diff: '+2 −1' },
  { file: 'app/adapters/payments/card_pay_adapter.rb', diff: '+1' },
  { file: 'spec/support/payment_contracts.rb', diff: '+5' },
]

function ChangeFigure() {
  return (
    <Svg
      id="64-7"
      w={780}
      h={358}
      label={`定期課金を一時停止する pause_subscription を足したときに変えたファイル。直す前は7ファイルで15行を足し1行を消した。${changeBefore.map((c) => `${c.file}（${c.diff}${c.unrelated ? '、定期課金に対応しない会社のため' : ''}）`).join('、')}。直した後は3ファイルで8行を足し1行を消した。${changeAfter.map((c) => `${c.file}（${c.diff}）`).join('、')}。コンビニ払いと後払いの Adapter と spec は変えていない`}
    >
      <T x={10} y={20} bold>
        直す前：7ファイル（15行を追加、1行を削除）
      </T>
      {changeBefore.map((c, i) => (
        <g key={c.file}>
          <Box x={10} y={34 + i * 38} w={372} h={30} lines={c.file} fs={10} fill={c.unrelated ? 'box5' : 'box'} mono align="start" />
          <T x={376} y={51 + i * 38} fs={11} anchor="end" mono tone={c.unrelated ? 'danger' : undefined}>
            {c.diff}
          </T>
        </g>
      ))}
      <line x1={394} y1={10} x2={394} y2={300} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={405} y={20} bold>
        直した後：3ファイル（8行を追加、1行を削除）
      </T>
      {changeAfter.map((c, i) => (
        <g key={c.file}>
          <Box x={405} y={34 + i * 38} w={365} h={30} lines={c.file} fs={10} mono align="start" />
          <T x={764} y={51 + i * 38} fs={11} anchor="end" mono>
            {c.diff}
          </T>
        </g>
      ))}
      <T x={405} y={170} fs={12} tone="acc">
        konbini・pay_later の Adapter と spec は
      </T>
      <T x={405} y={190} fs={12} tone="acc">
        変えていない
      </T>
      <Box x={10} y={318} w={30} h={22} fill="box5" />
      <T x={50} y={334} fs={12}>
        定期課金に対応しない2社のために変えたファイル（直す前は4つ、直した後は0）
      </T>
    </Svg>
  )
}

/* ---------- 図 64-8 取り決めの大きさの判断 ---------- */
const judgeCols: { lines: string[]; accent?: boolean }[] = [
  { lines: ['1つの大きな取り決め', '対応しない機能の空のメソッド', 'respond_to? が対応を表さない', 'ほかの使う側のための変更が及ぶ'] },
  {
    lines: ['使う側が一緒に呼ぶメソッドの組', '使う側ごとに1つの取り決め', '組のメソッドはそろえて実装する', '手順（authorize → capture）を', 'まとめて確かめられる'],
    accent: true,
  },
  { lines: ['1つのメソッドごとの取り決め', '組の一部だけを実装できる', '手順を確かめるテストを置けない', '取り決めの名前と spec が増える'] },
]

function JudgeFigure() {
  return (
    <Svg
      id="64-8"
      w={780}
      h={392}
      label="横軸は取り決めの大きさで、左ほど大きく（1つにまとめる）、右ほど小さい（1つのメソッドずつ）。左の1つの大きな取り決めでは、対応しない機能の空のメソッドができ、respond_to? が対応を表さず、ほかの使う側のための変更が及ぶ。中央の、使う側が一緒に呼ぶメソッドの組を1つの取り決めにする形がこの章の勧める大きさで、組のメソッドはそろえて実装し、authorize から capture までの手順をまとめて確かめられる。右の1つのメソッドごとの取り決めでは、組の一部だけを実装でき、手順を確かめるテストを置けず、取り決めの名前と spec が増える。分ける前に確かめること：取り決めを満たす実装が2つ以上あるか、使う側ごとに呼ぶメソッドの組が違うか、取り決めの一部に対応しない実装があるか、これから足すか"
    >
      <T x={390} y={22} anchor="middle" bold>
        取り決めの大きさ
      </T>
      <Arrow x1={30} y1={50} x2={750} y2={50} both />
      <T x={30} y={72} fs={11} tone="muted">
        大きい（1つにまとめる）
      </T>
      <T x={750} y={72} fs={11} anchor="end" tone="muted">
        小さい（1つのメソッドずつ）
      </T>
      {judgeCols.map((c, i) => (
        <Box
          key={c.lines[0]}
          x={10 + i * 258}
          y={86}
          w={246}
          h={160}
          lines={c.lines}
          fs={12}
          fill={c.accent ? 'box5' : 'box'}
          accent={c.accent}
          bold
          subTone={c.accent ? 'muted' : 'danger'}
        />
      ))}
      <T x={10} y={282} bold>
        分ける前に確かめること
      </T>
      <T x={10} y={308} fs={12}>
        1. 取り決めを満たす実装が2つ以上あるか（1つだけなら、分けて得られるものが少ない）
      </T>
      <T x={10} y={332} fs={12}>
        2. 使う側ごとに、呼ぶメソッドの組が違うか（同じ組なら、1つの取り決めのままでよい）
      </T>
      <T x={10} y={356} fs={12}>
        3. 取り決めの一部に対応しない実装があるか、これから足す予定があるか
      </T>
      <T x={10} y={380} fs={12}>
        4. 分けた取り決めの中に、いつも一緒に呼ぶメソッドが分かれていないか
      </T>
    </Svg>
  )
}

/* ---------- 図 64-9 Ruby のダックタイピングと取り決め ---------- */
const duckRows: { client: string[]; role: string; objects: string[] }[] = [
  { client: ['IO.copy_stream', '書き込み先に'], role: 'write(data)', objects: ['File・StringIO', 'LineCounter（この章で作った）'] },
  { client: ['render(obj)', '部分テンプレートを選ぶ'], role: 'to_partial_path', objects: ['Order などのモデル', 'RefundNotice（この章で作った）'] },
  { client: ['RefundService', '管理画面の返金'], role: 'refund(charge_id:, amount:)', objects: ['CardPayAdapter', 'PayLaterAdapter'] },
]
const duckWays = [
  ['コメント', '取り決めのメソッドと約束を書く', '実行はされない'],
  ['shared_examples', '取り決めを満たすかを', 'RSpec で実行して確かめる'],
  ['RBS の interface', 'メソッドの引数と戻り値の型を書く', 'rbs コマンドで構文を確かめる'],
]

function DuckFigure() {
  return (
    <Svg
      id="64-9"
      w={780}
      h={366}
      label="Ruby では、使う側が送るメソッドが取り決めになり、そのメソッドに応えるオブジェクトならクラスを問わずに使える。IO.copy_stream は書き込み先に write(data) を送り、File・StringIO・この章で作った LineCounter が応える。Action View の render(obj) は部分テンプレートを選ぶために to_partial_path を送り、Order などのモデルや、この章で作った RefundNotice が応える。RefundService は refund(charge_id:, amount:) を送り、CardPayAdapter と PayLaterAdapter が応える。Ruby で取り決めを書き表す方法は3つ。コメントは取り決めのメソッドと約束を書くが実行はされない。shared_examples は取り決めを満たすかを RSpec で実行して確かめる。RBS の interface はメソッドの引数と戻り値の型を書き、rbs コマンドで構文を確かめる"
    >
      <T x={10} y={20} fs={12} bold>
        使う側
      </T>
      <T x={250} y={20} fs={12} bold>
        使う側が送るメソッド（取り決め）
      </T>
      <T x={500} y={20} fs={12} bold>
        応えるオブジェクト（クラスは問わない）
      </T>
      {duckRows.map((r, i) => {
        const y = 34 + i * 70
        return (
          <g key={r.role}>
            <Box x={10} y={y} w={210} h={56} lines={r.client} fs={12} bold subTone="muted" />
            <Arrow x1={220} y1={y + 28} x2={248} y2={y + 28} />
            <Box x={250} y={y} w={220} h={56} lines={r.role} fs={12} fill="box2" dashed mono />
            <Arrow x1={500} y1={y + 28} x2={472} y2={y + 28} dashed />
            <Box x={500} y={y} w={270} h={56} lines={r.objects} fs={12} />
          </g>
        )
      })}
      <T x={10} y={262} fs={12} bold>
        Ruby で取り決めを書き表す方法
      </T>
      {duckWays.map((w, i) => (
        <Box key={w[0]} x={10 + i * 258} y={276} w={246} h={70} lines={w} fs={12} fill={i === 1 ? 'box5' : 'box'} bold subTone="muted" />
      ))}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 66,
  part: 8,
  title: 'ISP（インターフェース分離の原則）：使わない機能の実装を強制しない',
  summary:
    '3つの決済会社を同じ取り決めで扱う通販サイトを例に、返金・与信・定期課金まで1つの取り決めに入れたために、対応しない会社の Adapter が NotImplementedError を発生させるだけのメソッドだらけになる問題を扱います。取り決めを使う側ごとに分けて役割ごとの shared_examples で確かめる形に直し、分けすぎたときに起きることも実行して確かめます。',
  goals: [
    '1つの大きな取り決めに対応しない機能まで入れると、respond_to? の結果・例外・変更の範囲に何が起きるかを、実行結果から説明できる',
    'Martin の ISP の定義と、使う側がインターフェースに変更を求めるという考え方、Fowler の役割インターフェースとヘッダーインターフェースの違いを説明できる',
    '使う側が一緒に呼ぶメソッドの組を調べて取り決めを分け、Adapter には満たす取り決めのメソッドだけを書ける',
    '役割ごとの取り決めを RSpec の shared_examples に書き、各 Adapter の spec で満たす取り決めだけを実行できる',
    '1つのメソッドごとに分けるなどの分けすぎを見分け、使う側が一緒に呼ぶメソッドの組を単位に取り決めの大きさを決められる',
    'Ruby のダックタイピング、RBS の interface、Action Pack やキャッシュのストアの取り決めを、ISP の考え方で読める',
  ],
  prerequisites: [20, 65],
  sections: [
    {
      id: 'scene',
      title: '決済の取り決めに全部の機能を入れ、Adapter が NotImplementedError だらけになる',
      body: (
        <>
          <h3>そもそも決済の取り決めとは何か</h3>
          <p>
            通販サイトは、お客さんが選んだ支払い方法に応じて、決済会社（カード会社やコンビニ払いの代行会社など、代金の受け取りを店の代わりに行う会社）に処理を頼みます。この章のアプリはカード決済の会社・コンビニ払いの会社・後払いの会社の3社と契約しています。3社はこの章のための架空の会社です。決済会社に頼む処理には、次の種類があります。
          </p>
          <ul>
            <li>請求（charge）：代金を受け取る手続きを始めます。カードなら利用額の請求、コンビニ払いなら払込票（お客さんが店のレジで代金を払うための番号）の発行です。</li>
            <li>返金（refund）：受け取った代金をお客さんに返します。</li>
            <li>
              <Term en="authorization">与信</Term>（authorize）：カードの利用枠から金額を確保するだけで、まだ請求はしません。発売日まで代金を受け取らない予約商品で使います。確保した金額は売上確定（capture）で請求に変えるか、取り消し（void）で確保をやめます。この3つは組で使います。
            </li>
            <li>定期課金（subscription）：決まった日に同じ金額を繰り返し請求します。この章では毎月コーヒー豆を届ける定期便で使います。</li>
          </ul>
          <p>
            3社が引き受ける処理は同じではありません。カード決済の会社はすべてに対応します。コンビニ払いの会社は請求だけに対応し、返金の API を持ちません（コンビニ払いの返金は、店がお客さんの口座に振り込んで行います）。後払いの会社は請求と返金に対応します。
          </p>
          <p>
            会社ごとに API の形が違うので、アプリは会社ごとに Adapter（外部のサービスの API を、アプリが決めたメソッドの形に変換するクラス。<ChapterLink n={42} section="idea" />）を作り、どの会社でも同じ名前のメソッドで呼べるようにしています。どの Adapter も持つメソッドと、その引数・戻り値の約束をまとめたものを、本書では取り決めと呼んでいます。オブジェクト指向の用語では<Term en="interface">インターフェース</Term>と言い、オブジェクトを使う側から見た、呼べるメソッドの一覧とその約束のことです。Java や TypeScript には interface を宣言する構文がありますが、Ruby にはありません。Ruby では取り決めをコメントに書き、テストで確かめます。
          </p>
          <h3>7つのメソッドを並べた取り決め</h3>
          <p>
            このアプリは最初にカード決済の会社と契約しました。そのとき、カード決済の会社が提供する機能をそのまま並べて取り決めにしました。後からコンビニ払いと後払いの会社を足したときは、対応しない機能のメソッドも定義して、<code>NotImplementedError</code> を発生させることにしました。
          </p>
          <Code
            lang="ruby"
            title="app/adapters/payments.rb（直す前）"
            code={`
# 決済の取り決め。決済会社の Adapter は、次の7つのメソッドをすべて定義する。
# 対応していない機能のメソッドは NotImplementedError を発生させる
#   charge(order_id:, amount:)               請求する。決済 ID を返す
#   refund(charge_id:, amount:)              返金する。返金 ID を返す
#   authorize(order_id:, amount:)            与信を取る。与信 ID を返す
#   capture(authorization_id:)               与信した金額を請求する。決済 ID を返す
#   void(authorization_id:)                  与信を取り消す。true を返す
#   create_subscription(customer_id:, plan:) 定期課金を始める。定期課金 ID を返す
#   cancel_subscription(subscription_id:)    定期課金をやめる。true を返す
module Payments
  GATEWAY_METHODS = %i[charge refund authorize capture void create_subscription cancel_subscription].freeze

  def self.gateway_for(provider)
    { "cardpay" => CardPayAdapter, "konbini" => KonbiniAdapter, "paylater" => PayLaterAdapter }.fetch(provider).new
  end
end
`}
          />
          <p>
            <code>Payments.gateway_for</code> は、注文の <code>payment_provider</code> 列の値（<code>"cardpay"</code>・<code>"konbini"</code>・<code>"paylater"</code>）から、その会社の Adapter を作って返します。
          </p>
          <Code
            lang="ruby"
            title="app/adapters/payments/card_pay_adapter.rb（直す前）"
            code={`
module Payments
  # カード決済の会社。7つの機能すべてに対応する
  # （この章では通信の代わりに、決済会社が返す ID の形の文字列を返す）
  class CardPayAdapter
    def charge(order_id:, amount:) = "card_ch_#{order_id}"
    def refund(charge_id:, amount:) = "card_re_#{charge_id.delete_prefix('card_ch_')}"
    def authorize(order_id:, amount:) = "card_au_#{order_id}"
    def capture(authorization_id:) = "card_ch_#{authorization_id.delete_prefix('card_au_')}"
    def void(authorization_id:) = true
    def create_subscription(customer_id:, plan:) = "card_sub_#{customer_id}"
    def cancel_subscription(subscription_id:) = true
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/adapters/payments/konbini_adapter.rb（直す前）"
            code={`
module Payments
  # コンビニ払いの会社。請求（払込票の発行）だけに対応する
  class KonbiniAdapter
    def charge(order_id:, amount:) = "kb_#{order_id}"

    def refund(charge_id:, amount:)
      raise NotImplementedError, "#{self.class.name} は refund に対応していません"
    end

    def authorize(order_id:, amount:)
      raise NotImplementedError, "#{self.class.name} は authorize に対応していません"
    end

    def capture(authorization_id:)
      raise NotImplementedError, "#{self.class.name} は capture に対応していません"
    end

    def void(authorization_id:)
      raise NotImplementedError, "#{self.class.name} は void に対応していません"
    end

    def create_subscription(customer_id:, plan:)
      raise NotImplementedError, "#{self.class.name} は create_subscription に対応していません"
    end

    def cancel_subscription(subscription_id:)
      raise NotImplementedError, "#{self.class.name} は cancel_subscription に対応していません"
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/adapters/payments/pay_later_adapter.rb（直す前）"
            code={`
module Payments
  # 後払いの会社。請求と返金に対応する
  class PayLaterAdapter
    def charge(order_id:, amount:) = "pl_#{order_id}"
    def refund(charge_id:, amount:) = "pl_re_#{charge_id.delete_prefix('pl_')}"

    def authorize(order_id:, amount:)
      raise NotImplementedError, "#{self.class.name} は authorize に対応していません"
    end
    # …（省略。capture・void・create_subscription・cancel_subscription も同じ形）
  end
end
`}
          />
          <p>
            KonbiniAdapter は、7つのメソッドのうち6つが <code>NotImplementedError</code> を発生させるだけのメソッドです。この章の Adapter は外部と通信せず、決済会社が返す ID の形の文字列を返します。本物の会社と通信する Adapter の書き方は <ChapterLink n={42} section="rails-impl" /> で扱います。
          </p>
          <p>
            取り決めのテストは RSpec の <Term en="shared examples">shared_examples</Term>（複数の spec で使う例のまとまりに名前を付けて登録し、<code>it_behaves_like</code> で組み込んで実行する機能<Ref n={8} />）に書いています。7つのメソッドすべてに応答することを、すべての Adapter で確かめます。
          </p>
          <Code
            lang="ruby"
            title="spec/support/payment_gateway_contract.rb と spec/adapters/payments/konbini_adapter_spec.rb（直す前）"
            code={`
# 決済の取り決めを満たすことを確かめる共通のテスト。組み込む側で gateway を定義する
RSpec.shared_examples "決済の取り決めを満たす" do
  Payments::GATEWAY_METHODS.each do |name|
    it "#{name} を定義している" do
      expect(gateway).to respond_to(name)
    end
  end
end

RSpec.describe Payments::KonbiniAdapter do
  subject(:gateway) { described_class.new }

  it_behaves_like "決済の取り決めを満たす"

  it "charge は払込票の番号を返す" do
    expect(gateway.charge(order_id: 1, amount: 3000)).to eq "kb_1"
  end

  it "請求のほかは NotImplementedError を発生させる" do
    expect { gateway.refund(charge_id: "kb_1", amount: 3000) }.to raise_error(NotImplementedError)
    expect { gateway.authorize(order_id: 1, amount: 3000) }.to raise_error(NotImplementedError)
    # …（省略。capture・void・create_subscription・cancel_subscription も同じ形）
  end
end
`}
          />
          <p>
            <code>respond_to</code> のマッチャーは、Ruby の <code>respond_to?</code>（オブジェクトが、指定した名前の public メソッドに応答するかを true か false で返すメソッド<Ref n={5} />）で確かめます。
          </p>
          <h3>取り決めを使う4つのクラス</h3>
          <p>決済を使うクラスは4つあります。どれも <code>order.gateway</code> か <code>Payments.gateway_for</code> で Adapter を受け取り、自分が使うメソッドだけを呼びます。</p>
          <Code
            lang="ruby"
            title="app/services の3つのクラス（直す前）"
            code={`
# 注文を確定し、代金を請求する
class CheckoutService
  def call(order)
    charge_id = order.gateway.charge(order_id: order.id, amount: order.amount)
    order.update!(status: "paid", charge_id:)
  end
end

# 予約商品。注文の時に与信を取り、発売日に請求し、キャンセルされたら与信を取り消す
class PreorderService
  def reserve(order)
    order.update!(authorization_id: order.gateway.authorize(order_id: order.id, amount: order.amount))
  end

  def release(order)
    order.update!(status: "paid", charge_id: order.gateway.capture(authorization_id: order.authorization_id))
  end

  def cancel(order)
    order.gateway.void(authorization_id: order.authorization_id)
    order.update!(status: "canceled")
  end
end

# 定期便（毎月届くコーヒー豆など）の申し込みと解約
class SubscriptionService
  def start(provider:, customer_id:, plan:)
    Payments.gateway_for(provider).create_subscription(customer_id:, plan:)
  end

  def cancel(provider:, subscription_id:)
    Payments.gateway_for(provider).cancel_subscription(subscription_id:)
  end
end
`}
          />
          <p>4つ目は管理画面の返金です。注文の一覧で「返金する」ボタンを出すかを、Adapter が <code>refund</code> に応答するかで決めています。</p>
          <Code
            lang="ruby"
            title="app/models/order.rb・app/services/refund_service.rb・app/controllers/admin/refunds_controller.rb（直す前）"
            code={`
class Order < ApplicationRecord
  def gateway = Payments.gateway_for(payment_provider)

  # 管理画面の注文一覧で「返金する」ボタンを出すか
  def refundable? = status == "paid" && gateway.respond_to?(:refund)
end

# 管理画面の「返金する」ボタンから呼ぶ
class RefundService
  def call(order)
    refund_id = order.gateway.refund(charge_id: order.charge_id, amount: order.amount)
    order.update!(status: "refunded", refund_id:)
    true
  rescue => e # 決済会社が断ったときは、理由を残して画面に出す
    order.update!(refund_error: "#{e.class}: #{e.message}")
    false
  end
end

# 管理画面の「返金する」ボタンの送信先
class Admin::RefundsController < ApplicationController
  skip_forgery_protection # この章では画面を作らずにリクエストを送るため

  def create
    order = Order.find(params[:order_id])
    if RefundService.new.call(order)
      render plain: "返金しました（#{order.refund_id}）"
    else
      render plain: "返金できませんでした：#{order.refund_error}", status: 422
    end
  end
end
`}
          />
          <Figure n="64-1" title="場面の構成" caption="実線の矢印は呼び出し、破線の矢印は「取り決めを満たす」関係を表す。色を付けた箱が、この節で問題が起きるクラス。">
            <SceneFigure />
          </Figure>
          <p>
            図 64-1 はこの場面のクラスの関係です。4つの使う側はそれぞれ7つのうち1〜3個のメソッドしか呼びません。それでも3社の Adapter は7つのメソッドをすべて定義しています。問題が起きるのは、色を付けた KonbiniAdapter です。
          </p>
          <h3>どの会社が、どの機能に対応しているか</h3>
          <p>3社の Adapter の7つのメソッドを実際に呼び、<code>NotImplementedError</code> になるものを数えました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/inventory.rb）"
            code={`
                     CardPayAdapter   KonbiniAdapter   PayLaterAdapter
charge               対応             対応             対応
refund               対応             未対応           対応
authorize            対応             未対応           未対応
capture              対応             未対応           未対応
void                 対応             未対応           未対応
create_subscription  対応             未対応           未対応
cancel_subscription  対応             未対応           未対応
未対応（NotImplementedError を発生させる）: 11個（21個のメソッドのうち）
`}
          />
          <p>
            21個のメソッドのうち11個は、呼ぶと <code>NotImplementedError</code> を発生させるだけのメソッドでした。どの会社がどの機能に対応しているかは、メソッドを呼んでみるまでわかりません。
          </p>
          <h3>コンビニ払いの注文を返金しようとすると</h3>
          <p>3社で1件ずつ注文を確定し、管理画面の注文一覧に返金ボタンが出るかを確かめてから、コンビニ払いの注文で RefundService を呼びました。</p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb）"
            code={`
== 管理画面の注文一覧
  注文 1 cardpay  paid  返金ボタン: 出す
  注文 2 konbini  paid  返金ボタン: 出す
  注文 3 paylater paid  返金ボタン: 出す
== 注文 2（konbini）で RefundService を呼ぶ
  RefundService の外へ出た例外: NotImplementedError: Payments::KonbiniAdapter は refund に対応していません
  注文 2: status=paid refund_error=nil
  NotImplementedError の祖先: NotImplementedError < ScriptError < Exception
`}
          />
          <p>
            コンビニ払いの注文にも返金ボタンが出ました。KonbiniAdapter は <code>refund</code> を定義しているので、<code>respond_to?(:refund)</code> が true を返すからです。Ruby のドキュメントは <code>NotImplementedError</code> を「今のプラットフォームで実装されていない機能」のときに発生する例外と説明し、そのような組み込みのメソッド（Windows の <code>fork</code> など）では <code>respond_to?</code> が false を返すと書いています<Ref n={4} /><Ref n={5} />。Ruby で定義したメソッドの中で <code>NotImplementedError</code> を発生させても、<code>respond_to?</code> は false になりません。
          </p>
          <p>
            RefundService の外まで例外が出てきたのは、<code>{'rescue => e'}</code> のように例外のクラスを書かない rescue は、StandardError とそのサブクラスだけを捕まえるからです<Ref n={6} />。<code>NotImplementedError</code> は StandardError ではなく ScriptError のサブクラスです<Ref n={7} />。そのため、決済会社の失敗を記録するはずの rescue では捕まらずに RefundService の外へ出て、<code>refund_error</code> にも何も残りません。
          </p>
          <p>管理画面と同じリクエストを送る request spec で、ブラウザーに何が返るかを確かめました。例外はエラー画面に変えて返す、本番と同じ設定にしています。</p>
          <Code
            lang="ruby"
            title="spec/requests/admin_refunds_spec.rb（直す前。konbini の例）"
            code={`
  it "konbini の注文にも返金ボタンが出て、押すと 500 になり、失敗の理由も残らない" do
    order = paid_order("konbini")
    expect(order.refundable?).to be true

    post admin_order_refund_path(order)

    expect(response).to have_http_status(:internal_server_error)
    expect(order.reload).to have_attributes(status: "paid", refund_error: nil)
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests --format documentation と、log/test.log の一部）"
            code={`
管理画面の返金（直す前）
  cardpay の注文は、返金ボタンを押すと返金される
  konbini の注文にも返金ボタンが出て、押すと 500 になり、失敗の理由も残らない
…（省略）
2 examples, 0 failures

Started POST "/admin/orders/5/refund" for 127.0.0.1 at 2026-11-22 08:59:04 +0000
Processing by Admin::RefundsController#create as HTML
…（省略。パラメーターと SQL のログ）
Completed 500 Internal Server Error in 2ms (ActiveRecord: 0.7ms (1 query, 0 cached) | GC: 0.0ms)

NotImplementedError (Payments::KonbiniAdapter は refund に対応していません):

app/adapters/payments/konbini_adapter.rb:7:in 'Payments::KonbiniAdapter#refund'
app/services/refund_service.rb:4:in 'RefundService#call'
app/controllers/admin/refunds_controller.rb:7:in 'Admin::RefundsController#create'
`}
          />
          <Figure n="64-2" title="返金ボタンから 500 までの流れ" caption="縦に時間、列に関係するオブジェクトを並べた。破線の矢印は例外や応答が戻る向き。">
            <TimelineFigure />
          </Figure>
          <p>
            図 64-2 はこの流れを時間の順に並べたものです。管理者は、押せるはずのボタンを押して 500 のエラー画面を見ます。注文は paid のままで、返金できなかった理由も記録されません。
          </p>
          <Figure n="64-3" title="例外クラスの継承関係と rescue => e の範囲" caption="Ruby の組み込みの例外クラスのうち、この章に関係するものだけを描いた。矢印はサブクラスから親のクラスへ向く。">
            <ExceptionFigure />
          </Figure>
          <p>
            図 64-3 は例外クラスの継承関係です。<code>{'rescue => e'}</code> が捕まえるのは破線の枠の中だけで、<code>NotImplementedError</code> は枠の外にあります。Sidekiq のジョブで同じ rescue を書いていた場合も、同じように捕まりません。
          </p>
          <h3>定期便に一時停止を足すと</h3>
          <p>
            定期便の画面に「一時停止」のボタンを足すことになりました。定期課金に対応しているのはカード決済の会社だけです。開発者は取り決めの一覧 <code>GATEWAY_METHODS</code> に <code>pause_subscription</code> を足し、CardPayAdapter と、その spec に1行ずつ足しました。ここで spec を実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec。一部を省略）"
            code={`
..................F.........F...

Failures:

  1) Payments::KonbiniAdapter behaves like 決済の取り決めを満たす pause_subscription を定義している
     Failure/Error: expect(gateway).to respond_to(name)
       expected #<Payments::KonbiniAdapter:0x00007f8f8efc1460> to respond to :pause_subscription
     Shared Example Group: "決済の取り決めを満たす" called from ./spec/adapters/payments/konbini_adapter_spec.rb:6

  2) Payments::PayLaterAdapter behaves like 決済の取り決めを満たす pause_subscription を定義している
     Failure/Error: expect(gateway).to respond_to(name)
       expected #<Payments::PayLaterAdapter:0x00007f8f8ef9f8d8> to respond to :pause_subscription
     Shared Example Group: "決済の取り決めを満たす" called from ./spec/adapters/payments/pay_later_adapter_spec.rb:6

32 examples, 2 failures
`}
          />
          <p>
            定期課金に対応しないコンビニ払いと後払いの spec が失敗しました。開発者は2社の Adapter に <code>pause_subscription</code> を <code>NotImplementedError</code> で定義し、2社の spec にも「NotImplementedError を発生させる」の確認を足して、spec を通しました。変更の前と後のディレクトリを比べた結果は次のとおりです。
          </p>
          <Code
            lang="text"
            title="実行結果（git diff --no-index --stat before after。before と after は変更の前と後の app・spec を写したディレクトリ）"
            code={`
 {before => after}/app/adapters/payments/card_pay_adapter.rb        | 1 +
 {before => after}/app/adapters/payments/konbini_adapter.rb         | 4 ++++
 {before => after}/app/adapters/payments/pay_later_adapter.rb       | 4 ++++
 {before => after}/app/adapters/payments.rb                         | 4 +++-
 {before => after}/spec/adapters/payments/card_pay_adapter_spec.rb  | 1 +
 {before => after}/spec/adapters/payments/konbini_adapter_spec.rb   | 1 +
 {before => after}/spec/adapters/payments/pay_later_adapter_spec.rb | 1 +
 7 files changed, 15 insertions(+), 1 deletion(-)
`}
          />
          <p>
            定期便の一時停止のために、7つのファイルを変えました。そのうち4つ（コンビニ払いと後払いの Adapter と spec）は、定期課金を扱わない会社のファイルです。会社が増えるほど、また取り決めにメソッドが増えるほど、この「関係のないファイルの変更」は増えます。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>取り決めが、使う側が必要とするメソッドではなく、1社が提供する機能の一覧で決まっています。どの使う側も7つのうち1〜3個しか呼びません。</li>
            <li>対応しない会社の Adapter に、<code>NotImplementedError</code> を発生させるだけのメソッドが並びます。21個のうち11個がこのメソッドでした。</li>
            <li><code>respond_to?</code> が、その会社が機能に対応しているかを表さなくなります。管理画面は押すと 500 になる返金ボタンを出しました。</li>
            <li><code>NotImplementedError</code> は StandardError ではないので、決済会社の失敗に備えた <code>{'rescue => e'}</code> では捕まらず、失敗の理由も残りません。</li>
            <li>定期便のための変更が定期課金を扱わない会社の Adapter と spec にも及びます。</li>
          </ul>
          <p>これらは、使う側が使わないメソッドまで1つの取り決めに入れ、すべての実装にそれを求めたことから起きています。次の節で、この状態を避けるための原則を説明します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '使わない機能への依存を強制しない：ISP の意味と由来',
      body: (
        <>
          <h3>原則の意味</h3>
          <p>
            <Term en="Interface Segregation Principle">ISP（インターフェース分離の原則）</Term>は、利用しない機能への依存を強制しない、という原則です。インターフェースを使う側（クライアント）を、自分が呼ばないメソッドまで含むインターフェースに依存させないようにします。そのために、インターフェースを使う側ごとに、その側が必要とするメソッドだけの小さなものに分けます。
          </p>
          <p>
            この章の例では、使う側は CheckoutService・PreorderService・RefundService・SubscriptionService の4つで、どれも7つのメソッドのうち1〜3個しか呼びません。ところが取り決めは7つのメソッドを1つにまとめていて、どの Adapter にも7つすべての定義を求めていました。その結果、KonbiniAdapter にも <code>refund</code> が定義され、RefundService が頼る「<code>refund</code> に応答するなら返金できる」という前提が、コンビニ払いの注文では成り立たなくなりました。定期便のための変更は定期課金を扱わない会社のファイルにも及びました。
          </p>
          <h3>由来：Martin の1996年の記事</h3>
          <p>
            この原則は、Robert C. Martin が1996年に The C++ Report に書いた記事「The Interface Segregation Principle」で示したものです。C++ と設計についての連載 Engineering Notebook の4回目で、前回（1996年5月号）は依存性逆転の原則でした<Ref n={1} />。
          </p>
          <p>
            記事は<Term en="fat interface">太ったインターフェース</Term>の欠点を扱っています。Martin の説明では、太ったインターフェースとは、メソッドがいくつかの組に分かれ、組ごとに別の使う側が使うインターフェースのことで、まとまり（凝集）のないインターフェースです。Martin は、そうしたインターフェースを持つオブジェクトが必要になることは認めたうえで、使う側にはそれを1つのクラスとして見せず、それぞれがまとまった小さな抽象クラスとして見せるべきだと述べています<Ref n={1} />。
          </p>
          <p>
            記事の最初の例は防犯システムの扉です。扉（Door）は施錠・解錠と、開いているかどうかを返すメソッドを持ちます。開いたままの時間が長いと警報を鳴らす TimedDoor は、タイマー（Timer）から時間切れの知らせを受けるために、TimerClient というインターフェースを持つ必要があります。よくある解き方は Door に TimerClient を継承させることです。すると、時間を測らない扉も、時間切れのメソッドを何もしない実装で用意しなければなりません。Martin はこれをインターフェースの汚染と呼び、派生クラスの負担を減らすために基底クラスに何もしない実装を置くやり方は、LSP に反すると書いています<Ref n={1} />。
          </p>
          <p>
            次に Martin は、使う側がインターフェースに変更を求めることがある、と指摘します。タイマーの使い方によっては、時間切れの知らせを区別する ID が必要になり、TimerClient を変更します。Door が TimerClient を継承していると、この変更は時間を測らない扉と、その扉を使うすべてのコードにも及びます（C++ では少なくとも再コンパイルが要ります）。そのうえで、原則を次のように示しました<Ref n={1} />。
          </p>
          <p>「クライアントに、使わないインターフェースへの依存を強制してはならない」</p>
          <p>
            Martin は続けて、使わないインターフェースに依存させられた使う側は、そのインターフェースへの変更の影響を受け、その結果としてすべての使う側の間に意図しない結合が生じる、と説明しています。分け方としては Adapter で別のオブジェクトに委譲する方法と、多重継承で1つのクラスに複数の小さなインターフェースを持たせる方法を挙げています。2つ目の例の ATM では、入金・出金・振替の取引がそれぞれ画面のインターフェースの一部しか使わないので、画面のインターフェースを入金用・出金用・振替用に分けています<Ref n={1} />。
          </p>
          <h3>Ruby で「依存する」とはどういうことか</h3>
          <p>
            Martin の記事の依存は C++ のヘッダーファイルの読み込みと再コンパイルとして現れます。Ruby にはコンパイルの手順も、インターフェースを宣言する構文もありません。RefundService は <code>refund</code> しか呼ばないので、実行のときにほかの6つのメソッドに依存することはありません。それでも、場面の節では次の3か所に依存が現れました。
          </p>
          <ul>
            <li>取り決めの一覧（<code>GATEWAY_METHODS</code>）と、すべての実装に7つの定義を求める共通のテスト。対応しない会社にも使われないメソッドの定義を強制しました。</li>
            <li>メソッドがあるかどうかで機能を判断する <code>respond_to?</code>。何もしないメソッドがあると、使う側の判断が誤ります。</li>
            <li>取り決めへの変更が及ぶ範囲。定期便のための変更で、定期課金を扱わない会社の Adapter と spec を直しました。</li>
          </ul>
          <p>
            Ruby で ISP を当てはめるときは、取り決めに何を入れるか、すべての実装に何を求めるか、共通のテストで何を確かめるかを、使う側ごとに決めることになります。
          </p>
          <h3>役割インターフェースとヘッダーインターフェース</h3>
          <p>
            Martin Fowler は2006年12月の2つの記事で、インターフェースの作り方を2つに分けて説明しています。<Term en="header interface">ヘッダーインターフェース</Term>は、あるクラスの public メソッドをすべて並べて宣言したインターフェースです<Ref n={3} />。<Term en="role interface">役割インターフェース</Term>は、提供する側と使う側の間の特定のやり取りを見て決めるインターフェースで、提供する側のクラスは、やり取りの種類ごとに複数の役割インターフェースを実装します<Ref n={2} />。
          </p>
          <p>
            Fowler は役割インターフェースの長所を、オブジェクトどうしの実際のやり取りがはっきりわかることと、必要なメソッドだけを実装すればよいことに置いています。ヘッダーインターフェースでは使わないメソッドもすべて実装しなければなりません。短所としては、やり取りを1つずつ調べるので作る手間がかかることと、提供する側が使う側の事情に合わせている感覚があることを挙げています。そのうえで、役割インターフェースは ISP に沿い、ヘッダーインターフェースは沿わない、と書いています<Ref n={2} />。
          </p>
          <p>
            場面の節の7つのメソッドの取り決めは、カード決済の会社の Adapter の public メソッドを並べたもので、ヘッダーインターフェースにあたります。使う側ごとのやり取りを見ると、請求・与信・返金・定期課金の4つの役割が見えてきます。
          </p>
          <Figure n="64-4" title="大きな取り決めと、使う側ごとの取り決め" caption="実線の矢印は呼び出し、左の破線の矢印は「取り決めを満たす」関係を表す。右の Adapter の箱には満たす取り決めを書いた。空のメソッドは NotImplementedError を発生させるだけのメソッド。">
            <SplitFigure />
          </Figure>
          <p>
            図 64-4 は2つの形を並べたものです。左では、どの使う側も7つのメソッドの取り決めを使い、どの Adapter も7つすべてを定義します。右では、使う側ごとに取り決めがあり、Adapter は満たす取り決めのメソッドだけを定義します。CardPayAdapter は1つのクラスのまま、4つの取り決めを満たします。分けるのは使う側から見える取り決めで、実装のクラスを細かく分けるわけではありません。
          </p>
          <h3>似た原則との違い</h3>
          <ul>
            <li>
              SRP（<ChapterLink n={63} />）：モジュールが変更される理由を1つにすることを求めます。ISP は使う側から見えるインターフェースの形についての原則です。CardPayAdapter は4つの取り決めを満たしますが、変更の理由は「カード決済の会社の API が変わったとき」の1つです。
            </li>
            <li>
              LSP（<ChapterLink n={65} />）：Martin は何もしない実装を基底クラスに置くやり方を LSP の違反と結び付けています<Ref n={1} />。<code>refund</code> に応答する Adapter なら返金できると考えて書いた使う側に KonbiniAdapter を渡すと、返金できずに <code>NotImplementedError</code> が発生します。
            </li>
            <li>
              DIP（<ChapterLink n={67} />）：取り決めを、実装の側ではなく使う側の必要から決めることを求めます。ISP は、使う側が複数あるときに、取り決めを使う側ごとに分けることを求めます。
            </li>
            <li>High Cohesion（<ChapterLink n={69} />）：Martin は太ったインターフェースを、まとまりのないインターフェースと説明しています。ISP は、インターフェースを使う側ごとのまとまりに分けます。</li>
            <li>
              Adapter パターン（<ChapterLink n={42} section="anti-patterns" />）：外部のサービスの機能をすべて取り決めに入れると、対応しない会社の Adapter に <code>NotImplementedError</code> が並ぶ、という誤りを扱います。この章の場面はその誤りを実際に動かして確かめたものです。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: '使う側ごとに取り決めを分け、Adapter には満たす取り決めのメソッドだけを書く',
      body: (
        <>
          <h3>直す順序</h3>
          <ol className="steps">
            <li>使う側ごとに、呼んでいるメソッドを調べる：取り決めのメソッドを呼んでいる箇所を検索し、使う側ごとのメソッドの組を表にします。</li>
            <li>一緒に呼ぶメソッドの組を、1つの取り決めにする：組ごとに、取り決めのコメントと shared_examples を書きます。</li>
            <li>Adapter の spec を、役割ごとの共通のテストに切り替える：この時点では、Adapter の空のメソッドはまだ消しません。</li>
            <li>Adapter から空のメソッドを消す：手順3のテストが、消したことで壊れた使う側がないかを確かめます。</li>
            <li>使う側の判断を確かめる：<code>respond_to?</code> で機能を判断している箇所（管理画面の返金ボタン）が、正しく動くかを確かめます。</li>
          </ol>
          <h3>手順1：使う側ごとに、呼んでいるメソッドを調べる</h3>
          <p>取り決めの7つのメソッドを呼んでいる箇所を、grep で探しました。</p>
          <Code
            lang="text"
            title={'実行結果（grep -rnoE "(\\.|:)(charge|refund|authorize|capture|void|create_subscription|cancel_subscription)\\b" app/models app/services app/controllers）'}
            code={`
app/models/order.rb:5::refund
app/services/checkout_service.rb:4:.charge
app/services/preorder_service.rb:4:.authorize
app/services/preorder_service.rb:8:.capture
app/services/preorder_service.rb:12:.void
app/services/refund_service.rb:4:.refund
app/services/subscription_service.rb:4:.create_subscription
app/services/subscription_service.rb:8:.cancel_subscription
`}
          />
          <p>
            <code>order.rb</code> の <code>:refund</code> は <code>respond_to?(:refund)</code> の引数です。検索の結果を、使う側ごとにまとめたのが図 64-5 です。
          </p>
          <Figure n="64-5" title="使う側と、呼ぶメソッドの組" caption="手順1の検索の結果をまとめた。右の列はその組の取り決めを満たす会社。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">使う側</th>
                    <th scope="col">呼ぶメソッド</th>
                    <th scope="col">取り決め（役割）</th>
                    <th scope="col">満たす会社</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">CheckoutService（注文の確定）</th>
                    <td>
                      <code>charge</code>
                    </td>
                    <td>請求</td>
                    <td>3社すべて</td>
                  </tr>
                  <tr>
                    <th scope="row">PreorderService（予約商品）</th>
                    <td>
                      <code>authorize</code>・<code>capture</code>・<code>void</code>
                    </td>
                    <td>与信</td>
                    <td>カード決済</td>
                  </tr>
                  <tr>
                    <th scope="row">RefundService と Order#refundable?（管理画面の返金）</th>
                    <td>
                      <code>refund</code>
                    </td>
                    <td>返金</td>
                    <td>カード決済・後払い</td>
                  </tr>
                  <tr>
                    <th scope="row">SubscriptionService（定期便）</th>
                    <td>
                      <code>create_subscription</code>・<code>cancel_subscription</code>
                    </td>
                    <td>定期課金</td>
                    <td>カード決済</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 64-5 から、7つのメソッドは使う側ごとに4つの組に分かれ、組をまたいで呼ぶ使う側がないことがわかります。PreorderService の3つのメソッドは、1つの予約で順に呼ぶので、1つの組にします。どれか1つでも欠けると、予約を最後まで扱えないからです。
          </p>
          <h3>手順2：一緒に呼ぶメソッドの組を、1つの取り決めにする</h3>
          <Code
            lang="ruby"
            title="app/adapters/payments.rb（直した後）"
            code={`
# 決済の取り決め。使う側ごとに4つに分ける。
# 決済会社の Adapter は、対応する取り決めのメソッドだけを定義する（対応しない機能のメソッドは書かない）
#
# 請求の取り決め（使う側：CheckoutService）
#   charge(order_id:, amount:)               請求する。決済 ID を返す
# 返金の取り決め（使う側：RefundService・管理画面の返金ボタン）
#   refund(charge_id:, amount:)              返金する。返金 ID を返す
# 与信の取り決め（使う側：PreorderService）。3つのメソッドをそろえて定義する
#   authorize(order_id:, amount:)            与信を取る。与信 ID を返す
#   capture(authorization_id:)               与信した金額を請求する。決済 ID を返す
#   void(authorization_id:)                  与信を取り消す。true を返す
# 定期課金の取り決め（使う側：SubscriptionService）。2つのメソッドをそろえて定義する
#   create_subscription(customer_id:, plan:) 定期課金を始める。定期課金 ID を返す
#   cancel_subscription(subscription_id:)    定期課金をやめる。true を返す
module Payments
  def self.gateway_for(provider)
    { "cardpay" => CardPayAdapter, "konbini" => KonbiniAdapter, "paylater" => PayLaterAdapter }.fetch(provider).new
  end
end
`}
          />
          <p>
            <code>GATEWAY_METHODS</code> の一覧はなくなりました。取り決めのコメントには取り決めごとに使う側の名前を書きます。後で取り決めを変えるときに、影響を受ける使う側をすぐに確かめられます。
          </p>
          <Code
            lang="ruby"
            title="spec/support/payment_contracts.rb"
            code={`
# 決済の取り決めを、使う側ごとに分けた共通のテスト。組み込む側の spec で gateway を定義する
RSpec.shared_examples "請求の取り決めを満たす" do
  it "charge は決済 ID を返す" do
    expect(gateway.charge(order_id: 1, amount: 3000)).to be_a(String).and be_present
  end
end

RSpec.shared_examples "返金の取り決めを満たす" do
  it "refund は返金 ID を返す" do
    charge_id = gateway.charge(order_id: 1, amount: 3000)
    expect(gateway.refund(charge_id:, amount: 3000)).to be_a(String).and be_present
  end
end

RSpec.shared_examples "与信の取り決めを満たす" do
  it "authorize した与信を capture すると決済 ID が返る" do
    authorization_id = gateway.authorize(order_id: 1, amount: 3000)
    expect(gateway.capture(authorization_id:)).to be_a(String).and be_present
  end

  it "authorize した与信を void で取り消せる" do
    authorization_id = gateway.authorize(order_id: 1, amount: 3000)
    expect(gateway.void(authorization_id:)).to be true
  end
end

RSpec.shared_examples "定期課金の取り決めを満たす" do
  it "create_subscription で始めた定期課金を cancel_subscription でやめられる" do
    subscription_id = gateway.create_subscription(customer_id: 7, plan: "coffee")
    expect(gateway.cancel_subscription(subscription_id:)).to be true
  end
end
`}
          />
          <p>
            与信の取り決めのテストは、<code>authorize</code> が返した与信 ID を <code>capture</code> と <code>void</code> に渡します。3つのメソッドを、使う側（PreorderService）が呼ぶ順にまとめて確かめます。返金の取り決めのテストも、<code>charge</code> が返した決済 ID を使います。返金の取り決めを満たす会社は、請求の取り決めも満たしているからです。
          </p>
          <h3>手順3：Adapter の spec を、役割ごとの共通のテストに切り替える</h3>
          <Code
            lang="ruby"
            title="spec/adapters/payments の3つの spec（直した後）"
            code={`
RSpec.describe Payments::CardPayAdapter do
  subject(:gateway) { described_class.new }

  it_behaves_like "請求の取り決めを満たす"
  it_behaves_like "返金の取り決めを満たす"
  it_behaves_like "与信の取り決めを満たす"
  it_behaves_like "定期課金の取り決めを満たす"
end

RSpec.describe Payments::KonbiniAdapter do
  subject(:gateway) { described_class.new }

  it_behaves_like "請求の取り決めを満たす"

  it "refund を持たない（管理画面に返金ボタンを出さない）" do
    expect(gateway).not_to respond_to(:refund)
  end
end

RSpec.describe Payments::PayLaterAdapter do
  subject(:gateway) { described_class.new }

  it_behaves_like "請求の取り決めを満たす"
  it_behaves_like "返金の取り決めを満たす"
end
`}
          />
          <p>
            各 Adapter の spec は、その会社が満たす取り決めだけを組み込みます。KonbiniAdapter には <code>refund</code> を持たないことを確かめる例を1つ足しました。管理画面は <code>respond_to?(:refund)</code> で返金ボタンを出すかを決めるので、この例は管理画面の前提を守るためのものです。対応しないすべてのメソッドを並べて確かめる必要はありません。
          </p>
          <p>Adapter の空のメソッドを消す前に、新しい spec を実行しました。</p>
          <Code
            lang="text"
            title="実行結果（手順3の時点。bundle exec rspec spec/adapters。一部を省略）"
            code={`
.....F...

Failures:

  1) Payments::KonbiniAdapter refund を持たない（管理画面に返金ボタンを出さない）
     Failure/Error: expect(gateway).not_to respond_to(:refund)
       expected #<Payments::KonbiniAdapter:0x00007f7b20886308> not to respond to :refund
     # ./spec/adapters/payments/konbini_adapter_spec.rb:9:in 'block (2 levels) in <top (required)>'

9 examples, 1 failure
`}
          />
          <p>
            取り決めのテストはすべて通り、KonbiniAdapter の <code>refund</code> の例だけが失敗しました。場面の節で返金ボタンを出していた原因が、テストの失敗として見えています。
          </p>
          <Figure n="64-6" title="役割ごとの shared_examples と、組み込む spec" caption="上の段の破線の箱は共通のテスト。破線の矢印は it_behaves_like で組み込むことを表す。">
            <ContractsFigure />
          </Figure>
          <p>
            図 64-6 は4つの共通のテストと、それを組み込む spec の関係です。どの Adapter も満たす取り決めのテストだけを実行します。直す前は、どの Adapter も7つすべてに応答することを確かめていました。
          </p>
          <h3>手順4：Adapter から空のメソッドを消す</h3>
          <Code
            lang="ruby"
            title="app/adapters/payments/konbini_adapter.rb と pay_later_adapter.rb（直した後）"
            code={`
module Payments
  # コンビニ払いの会社。請求の取り決めだけを満たす（払込票の番号を返す）
  class KonbiniAdapter
    def charge(order_id:, amount:) = "kb_#{order_id}"
  end
end

module Payments
  # 後払いの会社。請求と返金の取り決めを満たす
  class PayLaterAdapter
    def charge(order_id:, amount:) = "pl_#{order_id}"
    def refund(charge_id:, amount:) = "pl_re_#{charge_id.delete_prefix('pl_')}"
  end
end
`}
          />
          <p>
            KonbiniAdapter は <code>charge</code> だけ、PayLaterAdapter は <code>charge</code> と <code>refund</code> だけになりました。CardPayAdapter は変えていません（コメントだけ「4つの取り決めを満たす」に直しました）。
          </p>
          <h3>手順5：使う側の判断を確かめる</h3>
          <p>
            管理画面の <code>Order#refundable?</code> は、直す前と同じ <code>respond_to?(:refund)</code> のままです。ボタンが出なくなった後も、古い画面から送信されることはあるので、コントローラーでも <code>refundable?</code> を確かめ、返金できない注文には 422 で理由を返すようにしました。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/admin/refunds_controller.rb（直した後）"
            code={`
class Admin::RefundsController < ApplicationController
  skip_forgery_protection # この章では画面を作らずにリクエストを送るため

  def create
    order = Order.find(params[:order_id])
    unless order.refundable?
      return render plain: "この注文は返金できません（決済方法: #{order.payment_provider}）", status: 422
    end

    if RefundService.new.call(order)
      render plain: "返金しました（#{order.refund_id}）"
    else
      render plain: "返金できませんでした：#{order.refund_error}", status: 422
    end
  end
end
`}
          />
          <p>3社の Adapter が7つのメソッドに応答するかを、直す前と後で比べました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/respond_to.rb。上が直す前、下が直した後）"
            code={`
                     CardPayAdapter   KonbiniAdapter   PayLaterAdapter
charge               true             true             true
refund               true             true             true
authorize            true             true             true
capture              true             true             true
void                 true             true             true
create_subscription  true             true             true
cancel_subscription  true             true             true

                     CardPayAdapter   KonbiniAdapter   PayLaterAdapter
charge               true             true             true
refund               true             false            true
authorize            true             false            false
capture              true             false            false
void                 true             false            false
create_subscription  true             false            false
cancel_subscription  true             false            false
`}
          />
          <p>
            直した後の表は図 64-5 の「満たす会社」の列と一致します。<code>respond_to?</code> が、その会社が機能に対応しているかを表すようになりました。管理画面の注文一覧と、spec 全体の結果は次のとおりです。
          </p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb の前半と、bundle exec rspec --format documentation）"
            code={`
== 管理画面の注文一覧
  注文 1 cardpay  paid  返金ボタン: 出す
  注文 2 konbini  paid  返金ボタン: 出さない
  注文 3 paylater paid  返金ボタン: 出す

Payments::CardPayAdapter
  behaves like 請求の取り決めを満たす
    charge は決済 ID を返す
  behaves like 返金の取り決めを満たす
    refund は返金 ID を返す
  behaves like 与信の取り決めを満たす
    authorize した与信を capture すると決済 ID が返る
    authorize した与信を void で取り消せる
  behaves like 定期課金の取り決めを満たす
    create_subscription で始めた定期課金を cancel_subscription でやめられる

Payments::KonbiniAdapter
  refund を持たない（管理画面に返金ボタンを出さない）
  behaves like 請求の取り決めを満たす
    charge は決済 ID を返す

Payments::PayLaterAdapter
  behaves like 請求の取り決めを満たす
    charge は決済 ID を返す
  behaves like 返金の取り決めを満たす
    refund は返金 ID を返す

環境
  MySQL 8.4 につながる

管理画面の返金（直した後）
  cardpay の注文は、返金ボタンを押すと返金される
  konbini の注文には返金ボタンが出ず、送信されても 422 で理由を返す

Finished in 0.12029 seconds (files took 1.81 seconds to load)
12 examples, 0 failures
`}
          />
          <p>
            「環境」の例は、この章のアプリが MySQL 8.4 につながっていることを確かめる、本書の検証用のアプリに共通の spec です。コンビニ払いの注文には返金ボタンが出なくなり、送信されても 500 ではなく 422 と理由が返ります。
          </p>
          <h3>もう一度、定期便に一時停止を足す</h3>
          <p>
            直した後のコードに、場面の節と同じ <code>pause_subscription</code> を足しました。定期課金の取り決めのコメントと共通のテストにメソッドを足し、CardPayAdapter に1行足します。spec は 13 examples, 0 failures で通りました。
          </p>
          <Code
            lang="ruby"
            title="spec/support/payment_contracts.rb（定期課金の取り決めに足した例）"
            code={`
  it "pause_subscription で定期課金を一時停止できる" do
    subscription_id = gateway.create_subscription(customer_id: 7, plan: "coffee")
    expect(gateway.pause_subscription(subscription_id:)).to be true
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（git diff --no-index --stat before after）"
            code={`
 {before => after}/app/adapters/payments/card_pay_adapter.rb | 1 +
 {before => after}/app/adapters/payments.rb                  | 3 ++-
 {before => after}/spec/support/payment_contracts.rb         | 5 +++++
 3 files changed, 8 insertions(+), 1 deletion(-)
`}
          />
          <Figure n="64-7" title="直す前と後の比較：定期課金の一時停止を足したときに変えたファイル" caption="どちらも git diff --no-index --stat の結果から描いた。色を付けた箱は定期課金に対応しない会社のために変えたファイル。">
            <ChangeFigure />
          </Figure>
          <p>
            図 64-7 は同じ機能を足したときに変えたファイルを、直す前と後で並べたものです。直す前は7ファイルで、そのうち4つが定期課金に対応しない2社のファイルでした。直した後は3ファイルで、2社のファイルは変えていません。定期便のための変更は定期課金の取り決めと、それを満たす会社にだけ及びます。
          </p>
          <h3>コンビニ払いの返金を、どこで扱うか</h3>
          <p>
            取り決めを分けた後も、コンビニ払いの注文の返金という業務は残ります。この章の設定では、店がお客さんの口座に振り込んで返します。返金の取り決めを満たさない会社の注文では、管理画面にボタンの代わりに振込の手続きの案内を出し、手続きは別の画面か業務の手順で扱います。直す前のコードでは、この違いは返金ボタンを押して <code>NotImplementedError</code> が発生するまでわかりませんでした。直した後は、<code>respond_to?(:refund)</code> が false になることで、別の手続きが要る注文を画面の側で見分けられます。案内を表示する例は Rails の節で示します。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '当てはめすぎたとき：1つのメソッドごとに分ける・分ける理由がないのに分ける',
      body: (
        <>
          <h3>1つのメソッドごとに取り決めを分ける</h3>
          <p>
            「取り決めは小さいほどよい」と考えると、7つのメソッドを7つの取り決めに分ける形を思い付きます。その形で、後払いの会社が予約商品にも対応することになったとします。開発者は PayLaterAdapter に <code>authorize</code> と <code>capture</code> を足し、<code>void</code> は後で足すことにしました。
          </p>
          <Code
            lang="ruby"
            title="spec/support/payment_contracts.rb（当てはめすぎた版）"
            code={`
# 当てはめすぎた例：取り決めを1つのメソッドごとに分ける。組み込む側の spec で gateway を定義する
RSpec.shared_examples "charge の取り決めを満たす" do
  it("charge は決済 ID を返す") { expect(gateway.charge(order_id: 1, amount: 3000)).to be_a(String).and be_present }
end

RSpec.shared_examples "refund の取り決めを満たす" do
  it("refund は返金 ID を返す") { expect(gateway.refund(charge_id: "x_1", amount: 3000)).to be_a(String).and be_present }
end

RSpec.shared_examples "authorize の取り決めを満たす" do
  it("authorize は与信 ID を返す") { expect(gateway.authorize(order_id: 1, amount: 3000)).to be_a(String).and be_present }
end

RSpec.shared_examples "capture の取り決めを満たす" do
  it("capture は決済 ID を返す") { expect(gateway.capture(authorization_id: "x_au_1")).to be_a(String).and be_present }
end

RSpec.shared_examples "void の取り決めを満たす" do
  it("void は true を返す") { expect(gateway.void(authorization_id: "x_au_1")).to be true }
end
# create_subscription・cancel_subscription も同じ形で1つずつ（省略）
`}
          />
          <Code
            lang="ruby"
            title="app/adapters/payments/pay_later_adapter.rb と spec・app/models/order.rb（当てはめすぎた版）"
            code={`
module Payments
  # 後払いの会社。予約商品にも使えるように authorize と capture を足した（void は後で足す予定）
  class PayLaterAdapter
    def charge(order_id:, amount:) = "pl_#{order_id}"
    def refund(charge_id:, amount:) = "pl_re_#{charge_id.delete_prefix('pl_')}"
    def authorize(order_id:, amount:) = "pl_au_#{order_id}"
    def capture(authorization_id:) = "pl_#{authorization_id.delete_prefix('pl_au_')}"
  end
end

RSpec.describe Payments::PayLaterAdapter do
  subject(:gateway) { described_class.new }

  it_behaves_like "charge の取り決めを満たす"
  it_behaves_like "refund の取り決めを満たす"
  it_behaves_like "authorize の取り決めを満たす"
  it_behaves_like "capture の取り決めを満たす"
end

class Order < ApplicationRecord
  # …（省略。gateway・refundable? は直した後と同じ）

  # 予約商品をこの決済方法で受け付けるか
  def preorderable? = gateway.respond_to?(:authorize)
end
`}
          />
          <p>Adapter の spec を実行してから、後払いで予約を受け、お客さんがキャンセルした場合を動かしました。</p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/adapters と、RAILS_ENV=development bin/rails runner script/overuse.rb）"
            code={`
Finished in 0.0359 seconds (files took 0.76206 seconds to load)
10 examples, 0 failures

注文 1 paylater  予約を受け付けるか: true
reserve: authorization_id=pl_au_1
cancel: NoMethodError: undefined method 'void' for an instance of Payments::PayLaterAdapter
注文 1: status=pending authorization_id=pl_au_1
`}
          />
          <p>
            spec はすべて通りました。PayLaterAdapter は組み込んだ4つの取り決めをどれも満たしているからです。ところが予約のキャンセルで <code>void</code> がなく、<code>NoMethodError</code> になりました。注文は pending のまま、与信も取り消されずに残っています。1つのメソッドごとに分けた取り決めでは、「<code>authorize</code> を持つなら <code>void</code> も持つ」という組の約束を書く場所がありません。<code>capture</code> の取り決めのテストも、<code>authorize</code> が返した ID を受け取れないので、決まった文字列を渡して確かめるしかありません。
          </p>
          <p>同じ PayLaterAdapter を、直した後の与信の取り決め（3つのメソッドの組）で確かめました。</p>
          <Code
            lang="text"
            title="実行結果（it_behaves_like &quot;与信の取り決めを満たす&quot; を組み込んだ spec。一部を省略）"
            code={`
.F

Failures:

  1) Payments::PayLaterAdapter behaves like 与信の取り決めを満たす authorize した与信を void で取り消せる
     Failure/Error: expect(gateway.void(authorization_id:)).to be true

     NoMethodError:
       undefined method 'void' for an instance of Payments::PayLaterAdapter
     Shared Example Group: "与信の取り決めを満たす" called from ./spec/role_check/pay_later_role_spec.rb:7

2 examples, 1 failure
`}
          />
          <p>
            組の取り決めでは、<code>void</code> がないことがテストの失敗として見つかりました。ISP で分ける単位は1つのメソッドではなく、1つの使う側が一緒に呼ぶメソッドの組です。Martin の記事も太ったインターフェースを使う側ごとのまとまりのあるインターフェースに分けるとしています<Ref n={1} />。
          </p>
          <h3>実装や使う側が1つしかないのに分ける</h3>
          <p>
            このアプリがカード決済の会社だけと契約していて、決済を使うのが注文の確定だけなら、取り決めを4つに分けても、満たす実装も使う側も1つずつです。取り決めの名前と shared_examples が増えるだけで、場面の節のような問題は起きていません。Fowler は、役割インターフェースはやり取りを1つずつ調べるので作る手間がかかると書き、インターフェースは本当に置き換えが必要なときにだけ使うべきだという考えも述べています<Ref n={2} />。2社目の決済会社を足すときや、一部の機能に対応しない会社が出てきたときに分けても遅くはありません。まだ必要のない構造を先に作らない考え方は YAGNI（<ChapterLink n={58} />）で扱いました。
          </p>
          <h3>Active Record のモデルを、使う側ごとのインターフェースに分ける</h3>
          <p>
            Order のモデルも管理画面・決済・発送・メールと、使う側ごとに使うメソッドが違います。そこで、Order のオブジェクトを受け取り、使う側ごとに一部のメソッドだけを呼べるようにするクラス（返金の画面には <code>refundable?</code> と <code>refund_id</code> だけを見せるクラスなど）を作りたくなるかもしれません。しかし Rails の設計思想は、モデルが多くのメソッドを持つことを認めています。Rails Doctrine の「No one paradigm」の項は、Rails の concern がモデルに広い面（多くのメソッド）を持たせるのによく使われ、それがデータと保存の仕組みに直接触れられる Active Record のパターンに合っていると述べています<Ref n={26} />。そのクラスのオブジェクトを <code>form_with</code> や <code>render</code> に渡すには、Active Model の取り決め（<code>to_model</code> や <code>to_partial_path</code> など）を改めて用意する必要もあります<Ref n={15} />。
          </p>
          <p>
            ISP がよく効果を出すのは、実装を差し替える境目です。この章の決済会社の Adapter や、後で見るキャッシュのストアのように、同じ取り決めを複数の実装が満たし、実装ごとに対応する機能が違う場所です。モデルのメソッドが多いこと自体は、ISP の違反として扱わなくてかまいません。モデルが大きくなりすぎたときの分け方は、SRP（<ChapterLink n={63} />）と High Cohesion（<ChapterLink n={69} />）で扱います。
          </p>
          <h3>判断の目安</h3>
          <Figure n="64-8" title="取り決めの大きさの判断" caption="模式図。中央の大きさを目安にし、両端の症状が出ていないかで確かめる。">
            <JudgeFigure />
          </Figure>
          <p>
            図 64-8 は取り決めの大きさと、両端で起きることを並べたものです。左端（1つの大きな取り決め）では場面の節の問題が起き、右端（1つのメソッドごと）ではこの節の問題が起きます。中央の「使う側が一緒に呼ぶメソッドの組」を1つの取り決めにする形を目安にします。図の下の4つの問いのうち、1と2のどちらにも当てはまらないなら、分けずに1つの取り決めのままにしておきます。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Ruby のダックタイピング、Action Pack とキャッシュのストアの取り決め',
      body: (
        <>
          <h3>Ruby の取り決めは、使う側が送るメソッドで決まる</h3>
          <p>
            Ruby はメソッドを呼ぶときに相手のクラスを確かめません。呼んだメソッドに応答するオブジェクトなら、どのクラスでも受け付けます。この書き方を<Term en="duck typing">ダックタイピング</Term>と言います。Ruby の標準ライブラリには、使う側が必要とするメソッドだけを求める取り決めが多くあります。
          </p>
          <ul>
            <li>Enumerable：組み込むクラスは <code>each</code> を1つ実装すれば、<code>map</code> や <code>select</code> などのメソッドを使えます<Ref n={9} />。</li>
            <li>Comparable：組み込むクラスは <code>{'<=>'}</code> を定義すれば、<code>{'<'}</code> や <code>between?</code> を使えます<Ref n={10} />。</li>
            <li>
              <code>IO.copy_stream</code>：読み出し元には <code>readpartial</code> か <code>read</code> に応答するオブジェクトを、書き込み先には <code>write</code> に応答するオブジェクトを渡せます<Ref n={11} />。
            </li>
            <li>
              Rack：Rack のアプリケーションは <code>call</code> に応答するオブジェクトで、環境を表す引数を1つ受け取り、ステータス・ヘッダー・本文の3つの要素の配列を返します<Ref n={14} />（Rails との関係は <ChapterLink n={6} section="middleware" />）。
            </li>
          </ul>
          <p><code>write</code> だけを定義したクラスを作り、<code>IO.copy_stream</code> の書き込み先に渡しました。</p>
          <Code
            lang="ruby"
            title="script/copy_stream.rb"
            code={`
# write だけを定義したクラス。IO.copy_stream の書き込み先に渡す
class LineCounter
  attr_reader :lines

  def initialize
    @lines = 0
  end

  def write(data)
    @lines += data.count("\\n")
    data.bytesize # 書き込んだバイト数を返す
  end
end

counter = LineCounter.new
p IO.copy_stream(StringIO.new("注文 1\\n注文 2\\n注文 3\\n"), counter)
p counter.lines
p %i[read close flush puts].select { |m| counter.respond_to?(m) }
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/copy_stream.rb）"
            code={`
27
3
[]
`}
          />
          <p>
            LineCounter は IO を継承しておらず、<code>read</code>・<code>close</code>・<code>flush</code>・<code>puts</code> も持ちません。それでも <code>IO.copy_stream</code> は27バイトを書き込み、LineCounter は3行を数えました。<code>IO.copy_stream</code> の書き込み先の取り決めは「<code>write</code> に応答する」だけで、IO のすべてのメソッドを求めていません。役割インターフェースの考え方は Ruby の標準ライブラリの作り方にも現れています。
          </p>
          <h3>RBS の interface で取り決めを書く</h3>
          <p>
            Ruby の型を書く言語の <Term en="RBS">RBS</Term> には、interface の宣言があります。名前は下線で始め、メソッドの引数と戻り値の型を書きます<Ref n={12} />。Ruby の組み込みのクラスの型の定義にも、<code>read</code> だけを持つ <code>_Reader</code>、<code>write</code> だけを持つ <code>_Writer</code> などの小さな interface があり、<code>IO.copy_stream</code> の引数の型は <code>String | _Reader | _ReaderPartial</code> と <code>String | _Writer</code> になっています<Ref n={13} />。この章の取り決めのうち2つを RBS で書きました。
          </p>
          <Code
            lang="ruby"
            title="sig/payments.rbs"
            code={`
module Payments
  # 返金の取り決め（使う側：RefundService）
  interface _Refunding
    def refund: (charge_id: String, amount: Integer) -> String
  end

  # 与信の取り決め（使う側：PreorderService）
  interface _Authorizing
    def authorize: (order_id: Integer, amount: Integer) -> String
    def capture: (authorization_id: String) -> String
    def void: (authorization_id: String) -> true
  end
end
`}
          />
          <p>
            rbs 4.2.0 の <code>rbs parse sig/payments.rbs</code> と <code>rbs -I sig validate</code> は、どちらもエラーを出さずに終わりました。RBS のファイルは Ruby のコードとは別のファイルで、この章のアプリを動かすときには読み込んでいません。Adapter が interface のとおりに書かれているかは、型を検査する道具を別に使って確かめます。RBS を使わないチームでも、使う側ごとに interface を1つ書けるかを考えると、取り決めの大きさを決める目安になります。
          </p>
          <Figure n="64-9" title="Ruby のダックタイピングと取り決め" caption="実線の矢印はメソッドの呼び出し、破線の矢印は「取り決めを満たす」関係。下の段の色を付けた箱が、この章で取り決めを確かめるのに主に使った方法。">
            <DuckFigure />
          </Figure>
          <p>
            図 64-9 は使う側・取り決め・応えるオブジェクトの関係を、この章の3つの例で並べたものです。どの例でも、取り決めは使う側が送るメソッドで決まり、応えるオブジェクトのクラスは問われません。Ruby には interface の宣言を確かめる仕組みがないので、この章では shared_examples を使い、取り決めを満たすかを実行して確かめました。
          </p>
          <h3>Action Pack が求めるのは、機能ごとの小さな取り決め</h3>
          <p>
            Active Model の <code>ActiveModel::Lint::Tests</code> は、オブジェクトが Active Model の API（<code>to_key</code>・<code>to_param</code>・<code>to_partial_path</code>・<code>persisted?</code>・<code>model_name</code>・<code>errors</code> など）を満たすかを確かめるテストです。そのソースのコメントには「Action Pack で使うために、オブジェクトがすべての API を実装する必要はない」と書かれています<Ref n={15} />。たとえばビューの <code>render</code> にオブジェクトを渡すと、Action View は部分テンプレートのパスを <code>to_partial_path</code> で決めます<Ref n={16} />。<code>dom_id</code> は <code>to_key</code> を呼びます<Ref n={17} />。
          </p>
          <p>
            適用の節の最後で触れた、コンビニ払いの注文の返金の案内を、<code>to_partial_path</code> だけを定義したクラスで表示しました。
          </p>
          <Code
            lang="ruby"
            title="script/render.rb と app/views/refund_notices/_refund_notice.html.erb"
            code={`
# 返金ボタンの代わりに出す案内。Active Record のモデルではなく、to_partial_path だけを定義したクラス
class RefundNotice
  attr_reader :order_id, :provider

  def initialize(order_id:, provider:)
    @order_id = order_id
    @provider = provider
  end

  def to_partial_path = "refund_notices/refund_notice"
end

notice = RefundNotice.new(order_id: 2, provider: "konbini")
puts ApplicationController.render(notice)
p %i[to_model to_key to_param model_name persisted? errors].select { |m| notice.respond_to?(m) }
begin
  ApplicationController.helpers.dom_id(notice)
rescue NoMethodError => e
  puts "dom_id: #{e.class}: #{e.message}"
end

# app/views/refund_notices/_refund_notice.html.erb
# <p>注文 <%= refund_notice.order_id %>（<%= refund_notice.provider %>）は、口座への振込で返金します。</p>
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/render.rb）"
            code={`
<p>注文 2（konbini）は、口座への振込で返金します。</p>
[:to_param]
dom_id: NoMethodError: undefined method 'to_key' for an instance of RefundNotice
`}
          />
          <p>
            RefundNotice は <code>to_partial_path</code> だけで部分テンプレートを表示できました。<code>to_param</code> に応答するのは、Active Support がすべてのオブジェクトに <code>to_s</code> の別名として足しているからです<Ref n={18} />。<code>dom_id</code> は <code>to_key</code> がないので失敗しました。Action Pack はビューのメソッドごとに必要な小さな取り決めだけを求めています。モデルに Active Model の API を全部そろえなくても、使うメソッドの取り決めを満たせば足ります。
          </p>
          <h3>キャッシュのストア：主なメソッドと、対応しないことがあるメソッド</h3>
          <p>
            Rails 自身にも、場面の節と同じ形があります。<code>Rails.cache</code> のストアの親クラス ActiveSupport::Cache::Store のコメントは「実装によっては、基本のメソッド（<code>fetch</code>・<code>write</code>・<code>read</code>・<code>exist?</code>・<code>delete</code>）以外のすべてのメソッドに対応しないことがある」と書いています<Ref n={19} />。Rails Guides も主な API をこの5つとし、独自のストアは Store を継承して必要なメソッドを実装すれば作れると説明しています<Ref n={25} />。Store の <code>delete_matched</code>・<code>increment</code>・<code>decrement</code>・<code>cleanup</code>・<code>clear</code> は、どれも「対応しない実装がある」と書かれ、Store 自身の定義は <code>NotImplementedError</code> を発生させます<Ref n={20} />。
          </p>
          <Code
            lang="ruby"
            title="script/cache_store.rb"
            code={`
# Store を継承し、Rails Guides の主な API（read・write・delete・exist?・fetch）に要る3つだけを実装したストア
class TinyStore < ActiveSupport::Cache::Store
  def initialize(options = nil)
    super
    @data = {}
  end

  private

  def read_entry(key, **) = @data[key]
  def write_entry(key, entry, **) = (@data[key] = entry) && true
  def delete_entry(key, **) = !@data.delete(key).nil?
end

store = TinyStore.new
p store.write("products/1", "コーヒー豆")
p store.fetch("products/1") { "（DB から読む）" }
p store.exist?("products/1")
p store.delete("products/1")
p store.respond_to?(:delete_matched)
begin
  store.delete_matched("products/*")
rescue NotImplementedError => e
  puts "#{e.class}: #{e.message}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/cache_store.rb）"
            code={`
true
"コーヒー豆"
true
true
true
NotImplementedError: TinyStore does not support delete_matched
`}
          />
          <p>
            3つのメソッドを実装しただけで、主な5つのメソッドは動きました。一方で <code>respond_to?(:delete_matched)</code> は true を返し、呼ぶと <code>NotImplementedError</code> になります。場面の節の KonbiniAdapter と同じ状態です。Rails に入っているストアと Solid Cache が、この5つのメソッドを持つかをソースで確かめたのが図 64-10 です。
          </p>
          <Figure n="64-10" title="キャッシュのストアと、対応しないことがあるメソッド" caption="Rails 8.1.4.1 と solid_cache 1.0.10 のソースで確かめた。×は呼ぶと NotImplementedError になるもの。MemoryStore・FileStore・NullStore はこの章のアプリでも確かめた。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">ストア</th>
                    <th scope="col">delete_matched</th>
                    <th scope="col">increment・decrement</th>
                    <th scope="col">cleanup</th>
                    <th scope="col">clear</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">MemoryStore・FileStore・NullStore</th>
                    <td>○</td>
                    <td>○</td>
                    <td>○</td>
                    <td>○</td>
                  </tr>
                  <tr>
                    <th scope="row">RedisCacheStore</th>
                    <td>○</td>
                    <td>○</td>
                    <td>×（Redis が期限切れを消すため。親の定義を呼ぶ）<Ref n={22} /></td>
                    <td>○</td>
                  </tr>
                  <tr>
                    <th scope="row">MemCacheStore</th>
                    <td>×（定義していない）<Ref n={21} /></td>
                    <td>○</td>
                    <td>×（定義していない）</td>
                    <td>○</td>
                  </tr>
                  <tr>
                    <th scope="row">SolidCache::Store</th>
                    <td>×（定義していない。gem のテストが NotImplementedError を確かめている）<Ref n={24} /></td>
                    <td>○</td>
                    <td>×（NotImplementedError を発生させる）<Ref n={23} /></td>
                    <td>○</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 64-10 のとおり、<code>delete_matched</code> は MemoryStore と FileStore では動きますが、MemCacheStore と Solid Cache では <code>NotImplementedError</code> になります。Rails 8.1 の Guides は Solid Cache を新しいアプリの既定のキャッシュストアと説明しています<Ref n={25} />。開発環境のストアで <code>Rails.cache.delete_matched("products/*")</code> が動いても、本番のストアでは動かないことがあります。しかも場面の節で見たとおり、<code>NotImplementedError</code> は <code>{'rescue => e'}</code> では捕まりません。
          </p>
          <p>
            アプリのコードで主な5つのメソッドだけを使うようにすると、ストアを替えても動き続けます。キーの一部が同じエントリーをまとめて消したいときは、キーにバージョンや更新日時を含め、古いキーを読まなくなる形にします（キャッシュのキーの作り方は <ChapterLink n={22} section="rails-cache" />）。使う側が必要とするメソッドの組に合わせて自分のコードを書くことも、ISP の当てはめ方の1つです。
          </p>
          <Callout kind="v72">
            <p>
              Solid Cache は、Rails 8.0 のリリースノートで新しい主な機能として紹介されました<Ref n={27} />。Rails 7.2 までに作ったアプリでは、<code>config/environments/production.rb</code> の <code>config.cache_store</code> で、本番がどのストアを使っているかを確かめてください。Rails 8 に上げるときにストアを Solid Cache に替える場合は、<code>delete_matched</code> と <code>cleanup</code> を呼んでいる箇所がないかを先に検索します。
            </p>
          </Callout>
          <h3>Rails Doctrine と ISP</h3>
          <p>
            当てはめすぎの節で見たとおり、Rails Doctrine の「No one paradigm」は、モデルが concern によって多くのメソッドを持つことを認めています<Ref n={26} />。Rails はモデルを使う側ごとのインターフェースに分けることを求めません。一方で、Action Pack が Active Model の API の一部だけを求めることや、Rack が <code>call</code> だけを求めることのように、部品と部品の境目では、使う側が必要とする小さな取り決めを置いています。アプリでも同じように、モデルの中ではなく、決済会社やキャッシュのストアのように実装を差し替える境目で、取り決めを使う側ごとに分けるかを判断します。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={42} section="test" />：決済の Adapter の取り決めを shared_examples に書く方法を扱います。この章ではそれを使う側ごとの取り決めに分けました。
            </li>
            <li>
              <ChapterLink n={65} />：<code>NotImplementedError</code> を発生させるだけのメソッドは、親の約束を守れない実装でもあります。
            </li>
            <li>
              <ChapterLink n={67} />：取り決めを使う側の必要から決め、実装の詳細に依存させない方法を扱います。
            </li>
            <li>
              <ChapterLink n={72} />：場面の節の Adapter のように、共通の親や取り決めに「全部の機能」を集めると、対応しない組み合わせが増えます。継承の階層ではなく、オブジェクトの組み合わせで機能を足す方法を扱います。
            </li>
            <li>
              <ChapterLink n={40} section="test-doubles" />：テストダブルにも、使う側が呼ぶメソッドだけを持たせます。役割ごとの取り決めがあると、テストダブルに用意するメソッドもその分だけで済みます。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          取り決めに入れるのは、1つの使う側が一緒に呼ぶメソッドの組です。この章では7つのメソッドを並べた決済の取り決めを使う側ごとに分け、Adapter には満たす取り決めのメソッドだけを書きました。取り決めを満たす実装や使う側が1つしかないなら、分けずにおきます。
        </>
      ),
      benefit: {
        text: <>直す前は Adapter の21個のメソッドのうち11個が NotImplementedError を出すだけで、コンビニ払いの注文に押すと 500 になる返金ボタンが出た。直した後は、定期便の一時停止を足すときに変えたファイルが7つから3つになり、定期課金に対応しない2社のファイルは変えずに済んだ。</>,
        basis: <><ChapterLink n={66} section="scene" />、<ChapterLink n={66} section="apply" /></>,
      },
      cost: {
        text: <>取り決めごとに名前と共通のテスト（shared_examples）が増え、1つの会社がどの取り決めを満たすかを Adapter と spec で確かめる箇所が増える。返金の取り決めを満たさない会社の注文には、振込の手続きの案内のような別の業務の流れを用意する必要がある。</>,
        basis: <ChapterLink n={66} section="apply" />,
      },
      alternative: {
        text: <>1つのメソッドごとに取り決めを分けると、後払いの Adapter が void を持たないまま spec を通り、予約のキャンセルで NoMethodError になった。与信のように一緒に呼ぶ3つのメソッドは1つの取り決めにし、組のテストで抜けを見つける。Active Record のモデルは使う側ごとのインターフェースに分けない。</>,
        basis: <ChapterLink n={66} section="overuse" />,
      },
      criterion: {
        text: <>取り決めを満たす実装が2つ以上あるか。使う側ごとに呼ぶメソッドの組が違うか。取り決めの一部に対応しない実装が今あるか、これから足すか。どれにも当てはまらないなら、1つの取り決めのままにする。</>,
        basis: <ChapterLink n={66} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>決済の取り決めに7つの機能を並べ、すべての Adapter に定義を求めたため、21個のメソッドのうち11個が NotImplementedError を発生させるだけのメソッドになりました。</li>
          <li>空のメソッドがあると respond_to? が対応を表さず、コンビニ払いの注文に返金ボタンが出ました。NotImplementedError は StandardError ではないので rescue =&gt; e で捕まらず、管理画面は 500 になりました。</li>
          <li>ISP は利用しない機能への依存を強制しないという原則です。Martin が1996年の記事で示し、太ったインターフェースが使う側どうしの意図しない結合を生むと説明しました。Fowler の役割インターフェースは ISP に沿った作り方です。</li>
          <li>直すときは、使う側ごとに呼ぶメソッドを調べ、一緒に呼ぶメソッドの組を1つの取り決めにし、shared_examples を役割ごとに書きます。Adapter には満たす取り決めのメソッドだけを書きます。</li>
          <li>直した後は、定期便の一時停止を足しても、定期課金に対応しない会社のファイルを変えずに済みました（7ファイルから3ファイルへ）。</li>
          <li>1つのメソッドごとに分けると、組の一部だけを実装できてしまいます。実装や使う側が1つしかないときや、Active Record のモデルを使う側ごとに分けたくなったときは、分けずにおく判断もあります。</li>
          <li>Ruby の標準ライブラリ、Action Pack、キャッシュのストアも、使う側が必要とする小さな取り決めで作られています。アプリのコードは主な取り決めのメソッドだけを使うようにします。</li>
        </ul>
      ),
    },
  ],
  sources: [
    {
      title: 'The Interface Segregation Principle',
      publisher: 'Robert C. Martin / The C++ Report（テキサス大学の教員のサイトに置かれた複製）',
      url: 'https://cs.utexas.edu/~downing/papers/ISP-1996.pdf',
      accessed: '2026-11-22',
      version: '1996年（連載 Engineering Notebook の4回目。前回の DIP の記事は1996年5月号）',
      note: '太ったインターフェースの定義（メソッドが組に分かれ、組ごとに別のクライアントが使う、凝集のないインターフェース）、Door と TimerClient の例とインターフェースの汚染、何もしない実装を基底クラスに置くことと LSP、クライアントがインターフェースに変更を求める力、原則の文（CLIENTS SHOULD NOT BE FORCED TO DEPEND UPON INTERFACES THAT THEY DO NOT USE）、クライアントどうしの意図しない結合、Adapter と多重継承による分け方、ATM の画面のインターフェースの例。',
    },
    {
      title: 'Role Interface',
      publisher: 'martinfowler.com / Martin Fowler',
      url: 'https://martinfowler.com/bliki/RoleInterface.html',
      accessed: '2026-11-22',
      version: '2006年12月22日',
      note: '役割インターフェースは提供する側と使う側の特定のやり取りから決めること、長所（やり取りがわかる、必要なメソッドだけを実装する）と短所（作る手間、使う側への依存の感覚）、インターフェースは置き換えが必要なときに使うという考え、役割インターフェースは ISP に沿いヘッダーインターフェースは沿わないこと。',
    },
    {
      title: 'Header Interface',
      publisher: 'martinfowler.com / Martin Fowler',
      url: 'https://martinfowler.com/bliki/HeaderInterface.html',
      accessed: '2026-11-22',
      version: '2006年12月21日',
      note: 'ヘッダーインターフェースは、クラスの public メソッドをすべて並べて宣言したインターフェースであること。',
    },
    {
      title: 'class NotImplementedError',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/NotImplementedError.html',
      accessed: '2026-11-22',
      note: '今のプラットフォームで実装されていない機能のときに発生すること、fork が NotImplementedError を発生させる環境では respond_to?(:fork) が false を返すこと。',
    },
    {
      title: 'Object#respond_to?',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/Object.html#method-i-respond_to-3F',
      accessed: '2026-11-22',
      note: 'オブジェクトが指定したメソッドに応答するかを返すこと、実装されていないメソッド（Windows の Process.fork など）では false を返すこと。',
    },
    {
      title: 'Exception Handling（syntax/exceptions.rdoc）',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/syntax/exceptions_rdoc.html',
      accessed: '2026-11-22',
      note: 'クラスを書かない rescue は StandardError とそのサブクラスを捕まえること。',
    },
    {
      title: 'class Exception（Built-In Exception Class Hierarchy）',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/Exception.html#class-Exception-label-Built-In+Exception+Class+Hierarchy',
      accessed: '2026-11-22',
      note: 'NotImplementedError が ScriptError の下にあり、StandardError の下にはないこと。Ruby 4.0.9 で NotImplementedError.ancestors を実行しても確かめた。',
    },
    {
      title: 'Using shared examples',
      publisher: 'RSpec Core',
      url: 'https://rspec.info/features/3-13/rspec-core/example-groups/shared-examples/',
      accessed: '2026-11-20',
      version: 'RSpec 3.13',
      note: '共有したグループは組み込む側の文脈で実行されること、it_behaves_like が入れ子の文脈に組み込むこと。',
    },
    {
      title: 'module Enumerable（Usage）',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/Enumerable.html#module-Enumerable-label-Usage',
      accessed: '2026-11-22',
      note: 'Enumerable を組み込むクラスは each を実装し、ほとんどの Enumerable のメソッドがそれを呼ぶこと。',
    },
    {
      title: 'module Comparable',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/Comparable.html',
      accessed: '2026-11-22',
      note: 'Comparable を使うクラスは <=> を定義し、<・between? などがそれを使うこと。',
    },
    {
      title: 'IO.copy_stream',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/IO.html#method-c-copy_stream',
      accessed: '2026-11-22',
      note: '読み出し元は readpartial か read に応答する IO のようなオブジェクト、書き込み先は write に応答する IO のようなオブジェクトでよいこと。',
    },
    {
      title: 'docs/syntax.md（Interface declaration・Interface type）',
      publisher: 'ruby/rbs（GitHub）',
      url: 'https://github.com/ruby/rbs/blob/v4.2.0/docs/syntax.md#L712-L733',
      accessed: '2026-11-22',
      version: 'rbs 4.2.0（手元の gem のファイルで確認）',
      note: 'RBS の interface の宣言の書き方（名前を下線で始め、メソッドの型を並べる）と制限。',
    },
    {
      title: 'core/builtin.rbs・core/io.rbs（_Reader・_Writer と IO.copy_stream）',
      publisher: 'ruby/rbs（GitHub）',
      url: 'https://github.com/ruby/rbs/blob/v4.2.0/core/builtin.rbs#L181-L193',
      accessed: '2026-11-22',
      version: 'rbs 4.2.0（手元の gem のファイルで確認）',
      note: '_Reader（read）・_ReaderPartial（readpartial）・_Writer（write）の interface。core/io.rbs の2417行目で IO.copy_stream の引数の型が String | _Reader | _ReaderPartial と String | _Writer であること。',
    },
    {
      title: 'SPEC.rdoc',
      publisher: 'rack/rack（GitHub）',
      url: 'https://github.com/rack/rack/blob/v3.2.8/SPEC.rdoc#L7',
      accessed: '2026-11-22',
      version: 'rack 3.2.8（手元の gem のファイルで確認）',
      note: 'Rack のアプリケーションは call に応答するオブジェクトで、環境を1つ受け取り、ステータス・ヘッダー・本文の3要素の配列を返すこと。',
    },
    {
      title: 'activemodel/lib/active_model/lint.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activemodel/lib/active_model/lint.rb#L4-L23`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: 'Lint のテストが Active Model の API に従うかを確かめること、Action Pack で使うためにすべての API を実装する必要はないこと。',
    },
    {
      title: 'actionview/lib/action_view/renderer/abstract_renderer.rb（partial_path）',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/actionview/lib/action_view/renderer/abstract_renderer.rb#L69-L90`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: 'オブジェクトを render するとき、to_model に応答すれば変換し、to_partial_path で部分テンプレートのパスを決めること。応答しなければ ArgumentError になること。',
    },
    {
      title: 'actionview/lib/action_view/record_identifier.rb（dom_id）',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/actionview/lib/action_view/record_identifier.rb#L93-L137`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: 'dom_id が convert_to_model したオブジェクトの to_key を呼ぶこと。',
    },
    {
      title: 'activesupport/lib/active_support/core_ext/object/to_query.rb（Object#to_param）',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activesupport/lib/active_support/core_ext/object/to_query.rb#L6-L10`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: 'Active Support がすべてのオブジェクトに to_s の別名として to_param を定義すること。',
    },
    {
      title: 'activesupport/lib/active_support/cache.rb（Store のコメント）',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activesupport/lib/active_support/cache.rb#L150-L157`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: '実装によっては、fetch・write・read・exist?・delete 以外のメソッドに対応しないことがあること。',
    },
    {
      title: 'activesupport/lib/active_support/cache.rb（delete_matched・increment・decrement・cleanup・clear）',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activesupport/lib/active_support/cache.rb#L727-L797`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: '5つのメソッドに「対応しない実装がある」と書かれ、Store の定義は NotImplementedError を発生させること。TinyStore で実行して確かめた。',
    },
    {
      title: 'activesupport/lib/active_support/cache/mem_cache_store.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activesupport/lib/active_support/cache/mem_cache_store.rb#L32-L183`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: 'MemCacheStore が increment・decrement・clear を定義し、delete_matched と cleanup を定義していないこと（手元の gem のソースで確認。dalli が無いため実行はしていない）。',
    },
    {
      title: 'activesupport/lib/active_support/cache/redis_cache_store.rb（cleanup）',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activesupport/lib/active_support/cache/redis_cache_store.rb#L297-L303`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: 'RedisCacheStore の cleanup は、期限切れを Redis が消すので手動の cleanup に対応せず、親の定義（NotImplementedError）を呼ぶこと（手元の gem のソースで確認。redis gem が無いため実行はしていない）。',
    },
    {
      title: 'lib/solid_cache/store/api.rb（cleanup）',
      publisher: 'rails/solid_cache（GitHub）',
      url: 'https://github.com/rails/solid_cache/blob/v1.0.10/lib/solid_cache/store/api.rb#L35-L37',
      accessed: '2026-11-22',
      version: 'solid_cache 1.0.10',
      note: 'SolidCache::Store の cleanup が NotImplementedError を発生させること、increment・decrement・clear を定義していること。',
    },
    {
      title: 'test/unit/delete_matched_test.rb',
      publisher: 'rails/solid_cache（GitHub）',
      url: 'https://github.com/rails/solid_cache/blob/v1.0.10/test/unit/delete_matched_test.rb#L17-L20',
      accessed: '2026-11-22',
      version: 'solid_cache 1.0.10',
      note: 'SolidCache::Store の delete_matched が NotImplementedError を発生させることを、gem のテストが確かめていること。',
    },
    {
      title: 'Caching with Rails: An Overview（Default Store: Solid Cache・ActiveSupport::Cache::Store・Custom Cache Stores）',
      publisher: 'Ruby on Rails Guides',
      url: 'https://guides.rubyonrails.org/v8.1/caching_with_rails.html#activesupport-cache-store',
      accessed: '2026-11-22',
      version: 'Rails 8.1',
      note: 'Store の主な API が read・write・delete・exist?・fetch であること、独自のストアは Store を継承して必要なメソッドを実装すれば作れること、Solid Cache が新しいアプリの既定のキャッシュストアであること。',
    },
    {
      title: 'The Rails Doctrine（No one paradigm）',
      publisher: 'rubyonrails.org / David Heinemeier Hansson',
      url: 'https://rubyonrails.org/doctrine',
      accessed: '2026-11-22',
      note: 'concern がモデルに広い面（多くのメソッド）を持たせるのによく使われ、Active Record のパターンに合っていること。',
    },
    {
      title: 'Ruby on Rails 8.0 Release Notes（Solid Cache）',
      publisher: 'Ruby on Rails Guides',
      url: 'https://guides.rubyonrails.org/v8.1/8_0_release_notes.html#solid-cache',
      accessed: '2026-11-22',
      version: 'Rails 8.0',
      note: 'Solid Cache が Rails 8.0 の主な機能として紹介されていること。',
    },
  ],
}

export default chapter
