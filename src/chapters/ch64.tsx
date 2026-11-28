import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 62-1 場面の構成 ---------- */
function SceneFigure() {
  const cols: { title: string; file: string; whens: string[]; missing?: boolean }[] = [
    { title: 'payment_fee', file: 'app/models/order.rb', whens: ['when "card"', 'when "konbini"', 'when "pay_later"', 'when "bank_transfer"'] },
    { title: 'payment_due_at', file: 'app/models/order.rb', whens: ['when "card"', 'when "konbini"', 'when "pay_later"', 'when "bank_transfer"'] },
    { title: 'payment_label', file: 'checkouts_helper.rb', whens: ['when "card"', 'when "konbini"', 'when "pay_later"', 'when "bank_transfer"'] },
    { title: 'confirmation.text.erb', file: 'app/views/order_mailer', whens: ['when "konbini"', 'when "pay_later"', 'else（カードの文面）'], missing: true },
  ]
  const xs: number[] = []
  for (let i = 0; i < cols.length; i++) xs.push(12 + i * 192)
  return (
    <Svg
      id="62-1"
      w={780}
      h={400}
      label="支払い方法による違いが、4つの case 文に書かれている。app/models/order.rb の payment_fee と payment_due_at、checkouts_helper.rb の payment_label、app/views/order_mailer の confirmation.text.erb。銀行振込を足すとき、開発者は最初の3つに when bank_transfer を足したが、注文確認メールのテンプレートには足さなかった。テンプレートの case は konbini と pay_later だけを書き、それ以外を else でカードの文面にしているので、銀行振込の注文に「クレジットカードでのお支払いが完了しています」と書いたメールが届く"
    >
      <Box x={250} y={10} w={280} h={40} lines="支払い方法に銀行振込を足す" fs={13} fill="box5" bold />
      {cols.map((c, i) => {
        const x = xs[i]
        const cx = x + 90
        return (
          <g key={c.title}>
            <Arrow x1={390} y1={50} x2={cx} y2={86} dashed={c.missing} accent={!c.missing} />
            <Box x={x} y={88} w={180} h={200} fill="box" accent={c.missing} />
            <T x={x + 10} y={108} fs={12} bold mono>
              {c.title}
            </T>
            <T x={x + 10} y={128} fs={11} tone="muted">
              {c.file}
            </T>
            {c.whens.map((w, k) => (
              <T key={w} x={x + 14} y={160 + k * 28} fs={11} mono tone={w.includes('bank_transfer') ? 'acc' : w.startsWith('else') ? 'danger' : undefined}>
                {w}
              </T>
            ))}
          </g>
        )
      })}
      <T x={745} y={72} fs={11} anchor="middle" tone="danger">
        直し忘れ
      </T>
      <T x={xs[3] + 14} y={308} fs={12} tone="danger">
        銀行振込の注文に
      </T>
      <T x={xs[3] + 14} y={326} fs={12} tone="danger">
        「クレジットカードでの
      </T>
      <T x={xs[3] + 14} y={344} fs={12} tone="danger">
        お支払いが完了しています」
      </T>
      <T x={12} y={318} fs={12} tone="acc">
        強調色の when は、銀行振込のために足した行
      </T>
      <T x={12} y={380} fs={12} tone="muted">
        支払い方法の違いが4つの case 文に分かれていて、足すたびに4か所を探して直す
      </T>
    </Svg>
  )
}

/* ---------- 図 62-2 支払い方法と書く場所の表 ---------- */
function MatrixFigure() {
  const heads = [
    ['一覧の定数', 'order.rb'],
    ['手数料', 'order.rb'],
    ['期限', 'order.rb'],
    ['表示名', 'helper'],
    ['メールの案内', 'text.erb'],
  ]
  const rows: { name: string; cells: string[] }[] = [
    { name: 'card', cells: ['あり', 'あり', 'あり', 'あり', 'else で書く'] },
    { name: 'konbini', cells: ['あり', 'あり', 'あり', 'あり', 'あり'] },
    { name: 'pay_later', cells: ['あり', 'あり', 'あり', 'あり', 'あり'] },
    { name: 'bank_transfer', cells: ['足した', '足した', '足した', '足した', 'なし'] },
  ]
  const cx: number[] = []
  for (let i = 0; i < heads.length; i++) cx.push(170 + i * 122)
  return (
    <Svg
      id="62-2"
      w={780}
      h={340}
      label="行が支払い方法（card、konbini、pay_later、bank_transfer）、列がコードを書く場所（一覧の定数、手数料、期限、表示名、メールの案内）の表。直す前のコードは列ごとに1つの case 文になっていて、支払い方法を1行足すには5つの列のすべてに書く必要がある。card のメールの案内は else で書かれている。bank_transfer は一覧の定数・手数料・期限・表示名には足したが、メールの案内には足しておらず、else のカードの文面になる"
    >
      <T x={20} y={36} fs={12} bold>
        支払い方法
      </T>
      {heads.map((h, i) => (
        <g key={h[0]}>
          <rect x={cx[i] - 4} y={10} width={118} height={300} rx={6} fill="none" stroke="var(--fig-line)" strokeDasharray="3 4" />
          <T x={cx[i] + 55} y={30} fs={12} anchor="middle" bold>
            {h[0]}
          </T>
          <T x={cx[i] + 55} y={48} fs={11} anchor="middle" tone="muted" mono>
            {h[1]}
          </T>
        </g>
      ))}
      {rows.map((r, j) => {
        const y = 70 + j * 56
        return (
          <g key={r.name}>
            <T x={20} y={y + 20} fs={12} mono>
              {r.name}
            </T>
            {r.cells.map((c, i) => {
              const bad = c === 'なし'
              return (
                <Box
                  key={`${r.name}-${heads[i][0]}`}
                  x={cx[i] + 4}
                  y={y}
                  w={102}
                  h={40}
                  lines={c}
                  fs={12}
                  fill={bad ? 'box5' : c === '足した' ? 'box2' : 'box'}
                  accent={bad}
                  dashed={c === 'else で書く'}
                />
              )
            })}
          </g>
        )
      })}
      <T x={cx[4] + 55} y={324} fs={11} anchor="middle" tone="danger">
        else に入りカードの文面
      </T>
      <T x={20} y={324} fs={11} tone="muted">
        破線の枠1つが case 文1つ
      </T>
    </Svg>
  )
}

/* ---------- 図 62-4 直す前と直した後の構造 ---------- */
function StructureFigure() {
  return (
    <Svg
      id="62-4"
      w={780}
      h={420}
      label="直す前は、Order の payment_fee と payment_due_at、CheckoutsHelper の payment_label、confirmation.text.erb の案内がそれぞれ case 文で支払い方法をすべて知っていて、Order::PAYMENT_METHODS が一覧を持つ。支払い方法を足すたびに4つを開く。直した後は、Order・CheckoutsHelper・confirmation.text.erb が PaymentMethod::ALL から id で支払い方法を選ぶ。どの支払い方法も id・label・fee(order)・due_at(order) という取り決めを満たし、Card・Konbini・PayLater のクラスがそれを実装する。メールの案内は id と同じ名前の部分テンプレート（_card・_konbini・_pay_later）に書く"
    >
      <T x={20} y={20} bold>
        直す前
      </T>
      <Box x={20} y={36} w={250} h={64} lines={['Order', 'payment_fee：case', 'payment_due_at：case']} fs={12} bold subTone="muted" />
      <Box x={20} y={116} w={250} h={50} lines={['CheckoutsHelper', 'payment_label：case']} fs={12} bold subTone="muted" />
      <Box x={20} y={182} w={250} h={50} lines={['confirmation.text.erb', '案内：case（else はカード）']} fs={12} bold subTone="muted" />
      <Box x={20} y={248} w={250} h={50} lines={['Order::PAYMENT_METHODS', '支払い方法の一覧']} fs={12} bold fill="box4" subTone="muted" />
      <T x={20} y={326} fs={12} tone="danger">
        4つの場所が、それぞれ支払い方法を
      </T>
      <T x={20} y={344} fs={12} tone="danger">
        すべて知っている。足すたびに4つを開く
      </T>

      <line x1={290} y1={10} x2={290} y2={410} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={310} y={20} bold>
        直した後
      </T>
      <Box x={310} y={36} w={140} h={44} lines="Order" fs={12} />
      <Box x={465} y={36} w={140} h={44} lines="CheckoutsHelper" fs={12} />
      <Box x={620} y={36} w={150} h={44} lines="confirmation.text.erb" fs={12} />
      <Arrow x1={380} y1={80} x2={480} y2={116} />
      <Arrow x1={535} y1={80} x2={535} y2={116} />
      <Arrow x1={695} y1={80} x2={590} y2={116} />
      <Box x={420} y={118} w={230} h={50} lines={['PaymentMethod::ALL', 'id から支払い方法を選ぶ']} fs={12} bold accent subTone="muted" />
      <Arrow x1={535} y1={168} x2={535} y2={196} dashed />
      <Box x={360} y={198} w={350} h={44} lines="取り決め：id・label・fee(order)・due_at(order)" fs={12} fill="box2" dashed />
      <Box x={320} y={286} w={130} h={40} lines="Card" fs={12} mono />
      <Box x={470} y={286} w={130} h={40} lines="Konbini" fs={12} mono />
      <Box x={620} y={286} w={140} h={40} lines="PayLater" fs={12} mono />
      <Arrow x1={385} y1={286} x2={430} y2={244} dashed />
      <Arrow x1={535} y1={286} x2={535} y2={244} dashed />
      <Arrow x1={690} y1={286} x2={640} y2={244} dashed />
      <T x={545} y={268} fs={11} tone="muted">
        満たす
      </T>
      <Box x={320} y={346} w={440} h={40} lines="_card・_konbini・_pay_later.text.erb（メールの案内）" fs={12} fill="box4" />
      <T x={320} y={404} fs={12} tone="acc">
        使う側は、どの支払い方法かを case で調べない
      </T>
    </Svg>
  )
}

/* ---------- 図 62-5 拡張する部分と閉じる部分 ---------- */
function OpenClosedFigure() {
  const closed = [
    ['Order', 'payment_fee など'],
    ['CheckoutsHelper', 'payment_options'],
    ['confirmation.text.erb', 'render で案内を出す'],
    ['PaymentMethod.fetch', 'id で選ぶ'],
    ['Card・Konbini・PayLater', '既存の支払い方法'],
    ['_card など3つ', '既存の案内'],
  ]
  const pos: { x: number; y: number }[] = []
  for (let i = 0; i < closed.length; i++) pos.push({ x: 26 + (i % 2) * 215, y: 52 + Math.floor(i / 2) * 62 })
  return (
    <Svg
      id="62-5"
      w={780}
      h={370}
      label="銀行振込を足すとき、閉じる部分として Order、CheckoutsHelper、confirmation.text.erb、PaymentMethod.fetch、既存の Card・Konbini・PayLater、既存の案内の部分テンプレートは変えない。拡張する部分として、新しいクラス BankTransfer と新しい部分テンプレート _bank_transfer.text.erb を足す。変える既存のコードは、PaymentMethod::ALL に BankTransfer.new を足す1行だけ。payment_method_spec は ALL のすべての支払い方法に同じテストを実行する"
    >
      <rect x={10} y={10} width={460} height={250} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={26} y={32} bold>
        閉じる部分（銀行振込を足しても変えない）
      </T>
      {closed.map((c, i) => (
        <Box key={c[0]} x={pos[i].x} y={pos[i].y} w={200} h={48} lines={c} fs={12} subTone="muted" />
      ))}
      <rect x={490} y={10} width={280} height={250} rx={8} fill="none" stroke="var(--fig-accent)" strokeWidth={1.5} />
      <T x={506} y={32} bold>
        拡張する部分（足す）
      </T>
      <Box x={510} y={60} w={240} h={52} lines={['BankTransfer', '新しいクラス']} fs={12} bold accent subTone="muted" />
      <Box x={510} y={136} w={240} h={52} lines={['_bank_transfer.text.erb', '新しい部分テンプレート']} fs={12} bold accent subTone="muted" />
      <Box x={170} y={286} w={440} h={44} lines="PaymentMethod::ALL に BankTransfer.new を足す（変える1行）" fs={12} fill="box5" bold />
      <Arrow d="M750,86 L762,86 L762,308 L612,308" />
      <T x={20} y={354} fs={12} tone="muted">
        payment_method_spec は ALL のすべての支払い方法に同じテストを実行し、部分テンプレートの作り忘れも見つける
      </T>
    </Svg>
  )
}

/* ---------- 図 62-6 自動で登録する仕組みと読み込みの時期 ---------- */
function LoadingFigure() {
  const lanes = [
    {
      y: 60,
      head: ['development と', 'CI なしのテスト', 'eager_load = false'],
      steps: [
        { lines: ['起動', 'registry は {}'] },
        { lines: ['選択肢を作る', '[]（何も出ない）'], bad: true },
        { lines: ['Konbini を参照した後', '["konbini"] だけ'], bad: true },
      ],
    },
    {
      y: 190,
      head: ['production と', 'CI=1 のテスト', 'eager_load = true'],
      steps: [
        { lines: ['起動', 'app のファイルを全部読む'] },
        { lines: ['registry に3つ', 'card・konbini・pay_later'] },
        { lines: ['選択肢を作る', '3つ（並びは読み込み順）'] },
      ],
    },
  ]
  return (
    <Svg
      id="62-6"
      w={780}
      h={320}
      label="eager_load が false の development と CI なしのテストでは、起動した時点で registry は空で、選択肢を作ると何も出ない。PaymentMethod::Konbini を一度参照すると、その時点で Konbini だけが registry に加わる。eager_load が true の production と CI=1 のテストでは、起動時に app のファイルをすべて読み込むので registry に card・konbini・pay_later の3つが入り、選択肢も3つになる。並び順はファイルを読み込む順で決まる"
    >
      <T x={200} y={24} fs={12} tone="muted">
        時間の流れ →
      </T>
      {lanes.map((l) => (
        <g key={l.y}>
          <Box x={10} y={l.y} w={170} h={70} lines={l.head} fs={12} bold fill="box4" subTone="muted" />
          {l.steps.map((s, i) => {
            const x = 210 + i * 190
            return (
              <g key={s.lines[0]}>
                <Box x={x} y={l.y + 5} w={170} h={60} lines={s.lines} fs={12} accent={s.bad} subTone={s.bad ? 'danger' : 'muted'} />
                {i > 0 && <Arrow x1={x - 20} y1={l.y + 35} x2={x - 2} y2={l.y + 35} />}
              </g>
            )
          })}
        </g>
      ))}
      <line x1={10} y1={160} x2={770} y2={160} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={10} y={296} fs={12} tone="danger">
        同じコードでも、環境とテストの実行のしかたで支払い方法の一覧が変わる
      </T>
    </Svg>
  )
}

/* ---------- 図 62-7 一覧から選ぶ構造にするかの判断 ---------- */
function JudgeFigure() {
  const cells = [
    { x: 130, y: 50, head: 'case のまま、else で例外を投げる', lines: ['足すことはまれだが、書く場所が多い', '直し忘れを実行時に見つける'] },
    { x: 450, y: 50, head: '一覧から選ぶ構造にする', lines: ['この章の支払い方法', '契約のテストで全部を確かめる'] },
    { x: 130, y: 220, head: 'case か if のまま', lines: ['足す見込みも書く場所も少ない', '例：送料無料の判定（KISS）'] },
    { x: 450, y: 220, head: 'Hash の一覧1つで足りる', lines: ['違いが1か所だけ', '例：支払い方法ごとの手数料だけ'] },
  ]
  return (
    <Svg
      id="62-7"
      w={780}
      h={450}
      label="横軸は種類が増える見込み（低い・高い）、縦軸は種類による違いが出る場所の数（1か所・複数）。増える見込みが高く違いが複数の場所に出るなら、一覧から選ぶ構造にする。この章の支払い方法がこれに当たる。増える見込みは低いが場所が多いなら、case のまま else で例外を投げて直し忘れを見つける。増える見込みが高く違いが1か所なら、Hash の一覧1つで足りる。どちらも低いなら case か if のままにする。どの位置でも、自動で登録する仕組みや使わない拡張点は足さない"
    >
      <T x={60} y={20} anchor="middle" bold>
        違いが出る場所
      </T>
      <T x={60} y={125} anchor="middle" fs={12}>
        複数
      </T>
      <T x={60} y={295} anchor="middle" fs={12}>
        1か所
      </T>
      <Arrow x1={120} y1={390} x2={120} y2={36} />
      <Arrow x1={120} y1={390} x2={770} y2={390} />
      <T x={285} y={410} anchor="middle" fs={12}>
        低い
      </T>
      <T x={605} y={410} anchor="middle" fs={12}>
        高い
      </T>
      <T x={445} y={436} anchor="middle" bold>
        種類が増える見込み
      </T>
      {cells.map((c) => (
        <Box key={c.head} x={c.x} y={c.y} w={310} h={150} fill="none" dashed />
      ))}
      {cells.map((c) => (
        <g key={`${c.head}-t`}>
          <T x={c.x + 155} y={c.y + 26} anchor="middle" bold>
            {c.head}
          </T>
          <T x={c.x + 155} y={c.y + 52} anchor="middle" fs={12}>
            {c.lines[0]}
          </T>
          <T x={c.x + 155} y={c.y + 72} anchor="middle" fs={12} tone="muted">
            {c.lines[1]}
          </T>
        </g>
      ))}
      <Box x={470} y={140} w={270} h={40} lines="自動の登録・使わない拡張点" fs={12} fill="box5" />
      <T x={605} y={190} anchor="middle" fs={11} tone="danger">
        この位置でも足さない（当てはめすぎ）
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 64,
  part: 8,
  title: 'OCP：支払い方法を足すときに既存のコードを書き換えない',
  summary:
    'カード・コンビニ払い・後払いの違いが4つの case 文に書かれ、銀行振込を足したときに注文確認メールの案内だけ直し忘れる例で、開放閉鎖の原則（OCP）を扱います。支払い方法ごとのクラスと一覧から選ぶ構造に直し、閉じる対象を選ぶ判断と、自動で登録する仕組みのような当てはめすぎを示します。',
  goals: [
    '開放閉鎖の原則（OCP）の「拡張に対して開いている」「変更に対して閉じている」の意味を、Meyer と Martin の資料に沿って説明できる',
    '同じ種類の違いが複数の case 文に書かれていると、種類を足すときに直し忘れが起き、else で気づけない理由を説明できる',
    '支払い方法ごとのクラスと一覧（Hash）から選ぶ構造に直し、新しい支払い方法を既存のクラスを変えずに足せる',
    '一覧のすべての種類に同じテストを実行する契約のテストで、足した種類の作り忘れを見つけられる',
    '閉じる対象は変わりやすい方向に絞るという判断（戦略的な閉鎖）を説明し、自動の登録や使わない拡張点のような当てはめすぎを見分けられる',
    'Active Job のアダプター・部分テンプレートなど、Rails の拡張点と OCP の関係を説明できる',
  ],
  prerequisites: [56, 63],
  sections: [
    {
      id: 'scene',
      title: '銀行振込を足したら、注文確認メールの案内だけ直し忘れる',
      body: (
        <>
          <p>
            この章では EC サイトの支払い方法を例に、開放閉鎖の原則（OCP）を扱います。支払い方法ごとの処理を、種類ごとのクラスに分けて一覧から選ぶ実装の詳細は<ChapterLink n={41} section="rails-impl" />（Strategy / Policy）で送料を例に説明します。この章では、種類を足すときに既存のコードのどこを書き換えるかに注目し、直す前と直した後で書き換える範囲がどう変わるかを、動かして確かめます。
          </p>
          <h3>そもそも支払い方法ごとに何が違うのか</h3>
          <p>雑貨を売る EC サイトでは、注文の画面でお客様が支払い方法を選びます。今は次の3つを扱っています。</p>
          <ul>
            <li>クレジットカード（card）：注文を確定した時点で支払いが終わります。手数料は0円です。</li>
            <li>コンビニ払い（konbini）：注文の3日後の終わりまでに、コンビニのレジで支払います。手数料は220円です。</li>
            <li>後払い（pay_later）：商品と一緒に届く請求書で、注文の14日後の終わりまでに支払います。手数料は330円です。</li>
          </ul>
          <p>
            支払い方法によって、手数料、支払いの期限、画面に出す名前、注文を受け付けたときに送る注文確認メールの案内の4つが変わります。例として、山田さんが商品の合計 3,000円の注文を、11月2日の10時にした場合を使います。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_orders.rb"
            code={`
class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :number, null: false, index: { unique: true } # 注文番号（B-2001 など）
      t.string :customer_name, null: false
      t.string :email, null: false
      t.string :payment_method, null: false # card・konbini・pay_later
      t.integer :subtotal, null: false      # 商品の合計（円・税込み）
      t.datetime :ordered_at, null: false
      t.timestamps
    end
  end
end
`}
          />
          <h3>case 文で書いたコード</h3>
          <p>最初のコードは支払い方法による違いを、使う場所ごとの case 文で書いています。</p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直す前）"
            code={`
class Order < ApplicationRecord
  PAYMENT_METHODS = %w[card konbini pay_later].freeze

  validates :payment_method, inclusion: { in: PAYMENT_METHODS }

  # 支払いの手数料（円）
  def payment_fee
    case payment_method
    when "card" then 0
    when "konbini" then 220
    when "pay_later" then 330
    end
  end

  # 支払いの期限。カードは注文の時点で支払いが終わるので nil
  def payment_due_at
    case payment_method
    when "card" then nil
    when "konbini" then (ordered_at + 3.days).end_of_day
    when "pay_later" then (ordered_at + 14.days).end_of_day
    end
  end

  def total = subtotal + payment_fee
end
`}
          />
          <Code
            lang="ruby"
            title="app/helpers/checkouts_helper.rb・app/mailers/order_mailer.rb（直す前）"
            code={`
module CheckoutsHelper
  # 画面と注文確認メールに出す支払い方法の名前
  def payment_label(method)
    case method
    when "card" then "クレジットカード"
    when "konbini" then "コンビニ払い"
    when "pay_later" then "後払い"
    end
  end

  # 注文の画面の選択肢
  def payment_options = Order::PAYMENT_METHODS.map { |m| [payment_label(m), m] }
end

class OrderMailer < ApplicationMailer
  helper CheckoutsHelper

  def confirmation
    @order = params[:order]
    mail(to: @order.email, subject: "ご注文 #{@order.number} を承りました")
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/order_mailer/confirmation.text.erb（直す前）"
            code={`
<%= @order.customer_name %> 様

ご注文 <%= @order.number %> を承りました。
お支払い金額：<%= @order.total.to_fs(:delimited) %>円（<%= payment_label(@order.payment_method) %>）

<% case @order.payment_method -%>
<% when "konbini" -%>
<%= @order.payment_due_at.strftime("%-m月%-d日") %>までに、コンビニのレジでお支払いください。
<% when "pay_later" -%>
商品と一緒に届く請求書で、<%= @order.payment_due_at.strftime("%-m月%-d日") %>までにお支払いください。
<% else -%>
クレジットカードでのお支払いが完了しています。
<% end -%>
`}
          />
          <p>
            Order は手数料と期限を、CheckoutsHelper は画面の名前を、メールのテンプレートは支払いの案内を、それぞれ case 文で決めています。<code>helper CheckoutsHelper</code> は、メーラーのテンプレートからヘルパーのメソッドを呼べるようにする指定です。テンプレートの <code>-%&gt;</code> は、その行の後の改行を出力しない ERB の書き方です。メールの案内の case は最初の支払い方法だったカードの文面を else に書いています。
          </p>
          <p>3つの支払い方法で、注文確認メールの本文を表示しました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/demo.rb）"
            code={`
== card
山田花子 様

ご注文 B-2001 を承りました。
お支払い金額：3,000円（クレジットカード）

クレジットカードでのお支払いが完了しています。

== konbini
山田花子 様

ご注文 B-2001 を承りました。
お支払い金額：3,220円（コンビニ払い）

11月5日までに、コンビニのレジでお支払いください。

== pay_later
山田花子 様

ご注文 B-2001 を承りました。
お支払い金額：3,330円（後払い）

商品と一緒に届く請求書で、11月16日までにお支払いください。
`}
          />
          <p>
            図 62-1 はこのコードの構成です。支払い方法による違いが、2つのファイルとテンプレートにある4つの case 文に分かれています。図の強調色の行と「直し忘れ」は、次に足す銀行振込の結果です。
          </p>
          <Figure n="62-1" title="場面の構成" caption="4つの箱がそれぞれ1つの case 文。強調色の when は銀行振込のために足した行。">
            <SceneFigure />
          </Figure>
          <h3>銀行振込を足す</h3>
          <p>
            「銀行振込でも払えるようにしてほしい。手数料は0円、期限は注文の7日後の終わり」という依頼が届きました。担当の開発者は Order と CheckoutsHelper を開き、一覧の定数と3つの case 文に bank_transfer を足し、テストにも銀行振込の行を足しました。次は変えたファイルの一覧です。
          </p>
          <Code
            lang="text"
            title="実行結果（git diff --no-index --stat で、依頼の前と後のファイルを比べた）"
            code={`
 {before => before_change}/app/helpers/checkouts_helper.rb       | 1 +
 {before => before_change}/app/models/order.rb                   | 4 +++-
 {before => before_change}/spec/helpers/checkouts_helper_spec.rb | 2 +-
 {before => before_change}/spec/models/order_spec.rb             | 1 +
 4 files changed, 6 insertions(+), 2 deletions(-)
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec）"
            code={`
........

Finished in 0.06815 seconds (files took 0.83751 seconds to load)
8 examples, 0 failures
`}
          />
          <p>テストはすべて成功しました。ところが銀行振込の注文の注文確認メールを表示すると、次のようになりました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/demo.rb の銀行振込の部分）"
            code={`
== bank_transfer
山田花子 様

ご注文 B-2001 を承りました。
お支払い金額：3,000円（銀行振込）

クレジットカードでのお支払いが完了しています。
`}
          />
          <p>
            メールのテンプレートの case 文に bank_transfer を足し忘れたので、else に入り、カードの文面が出ました。銀行振込を選んだお客様は、支払いが終わったと読んで振り込まず、期限を過ぎてしまいます。足し忘れても例外は起きず、メールのテストはカードとコンビニ払いの2つしか確かめていないので、テストも成功しました。
          </p>
          <p>支払い方法による違いがどこに書かれているかは、文字列で検索して探すしかありません。直す前のアプリで後払いの when を検索すると、4か所が見つかります。</p>
          <Code
            lang="text"
            title={`実行結果（grep -rn 'when "pay_later"' app）`}
            code={`
app/views/order_mailer/confirmation.text.erb:9:<% when "pay_later" -%>
app/helpers/checkouts_helper.rb:7:    when "pay_later" then "後払い"
app/models/order.rb:11:    when "pay_later" then 330
app/models/order.rb:20:    when "pay_later" then (ordered_at + 14.days).end_of_day
`}
          />
          <p>
            図 62-2 は支払い方法を行に、コードを書く場所を列にした表です。依頼は「行を1つ足す」ことですが、直す前のコードは列ごとに1つの case 文になっているので、行を足すには5つの列すべてに書く必要があります。銀行振込の行は4つの列に足し、メールの案内の列だけが抜けています。
          </p>
          <Figure n="62-2" title="支払い方法と、コードを書く場所" caption="破線の枠1つが case 文（または一覧の定数）1つ。card のメールの案内は else で書かれている。">
            <MatrixFigure />
          </Figure>
          <h3>このコードの問題</h3>
          <ul>
            <li>支払い方法を1つ足すたびに、Order・CheckoutsHelper・メールのテンプレートという、すでに動いている3つのファイルを書き換えます。書き換えるたびに、既存の支払い方法の処理を壊していないかを確かめる必要があります。</li>
            <li>どこを直せばよいかがコードのどこにも書かれていないので、文字列の検索で探します。しかも、どの支払い方法の名前で検索するかによって見つかる場所が変わります。"card" で検索するとメールのテンプレートは見つかりません。カードの文面は else に書かれていて、"card" という文字列がないからです。</li>
            <li>else が「それ以外」をまとめて受けるので、足し忘れても例外が起きず、間違った文面が送られます。</li>
            <li>テストも case 文ごとに分かれていて、新しい支払い方法がすべての場所で扱われているかを確かめるテストがありません。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '既存のコードを変えずに振る舞いを足す：開放閉鎖の原則の意味と由来',
      body: (
        <>
          <h3>定義</h3>
          <p>
            <Term en="Open-Closed Principle、OCP">開放閉鎖の原則</Term>は、既存のコードへの変更を抑えながら、振る舞いを拡張できるようにするという原則です。「拡張に対して開いている（open for extension）」は、新しい要求に合わせて振る舞いを足せることを、「変更に対して閉じている（closed for modification）」は、そのために既存のコードを書き換えなくてよいことを指します。この章の例では、支払い方法を足すこと（拡張）を、Order・ヘルパー・メールのテンプレートを書き換えずに（変更せずに）行えるようにします。
          </p>
          <h3>Meyer の定義（1988年）</h3>
          <p>
            この原則を最初に示したのは Bertrand Meyer で、1988年の著書『Object-Oriented Software Construction』に書かれています。Robert C. Martin は2014年のブログ記事でその一節を引用しています<Ref n={2} />。引用によると、Meyer はモジュールが開いていて、同時に閉じていることを求めました。
          </p>
          <ul>
            <li>開いている：拡張のために使えること。たとえば、モジュールが持つデータ構造に項目を足したり、モジュールが行う機能を足したりできること。</li>
            <li>閉じている：ほかのモジュールから使えること。そのために、モジュールには明確で安定した説明（情報隠蔽の意味でのインターフェース）が与えられていること。プログラムのモジュールなら、コンパイルしてライブラリに入れ、ほかの人が使える状態にすること。</li>
          </ul>
          <p>
            Martin はこの定義を、コンパイルや管理者による承認を前提にしていて古いと述べたうえで、要点を「システムを書き換えずに、システムの振る舞いを拡張できるべきだ」とまとめています<Ref n={2} />。
          </p>
          <h3>Martin の1996年の記事</h3>
          <p>
            Martin は1996年、雑誌 The C++ Report の連載の第1回でこの原則を取り上げ、Meyer の言葉を言い換えて「ソフトウェアの要素（クラス、モジュール、関数など）は、拡張に対して開いていて、変更に対して閉じているべきだ」と書きました<Ref n={1} />。1つの変更が、それに依存するモジュールへ次々と変更を広げるなら、そのプログラムは壊れやすく、変えにくい。OCP は、要求が変わったときに、すでに動いているコードを変えずに新しいコードを足して振る舞いを広げる、という形でこれに対処する、と説明しています<Ref n={1} />。
          </p>
          <p>
            記事の例は円と正方形を描く C のプログラムです<Ref n={1} />。図形の一覧をたどって描く関数 DrawAllShapes は、switch 文で図形の種類を調べ、円なら円を、正方形なら正方形を描きます。三角形を足すには、この関数を書き換える必要があります。Martin は、実際のアプリではこの switch 文がアプリのあちこちに繰り返し現れ、新しい図形を足すにはそれらをすべて探し出して直すことになると書いています。この章の4つの case 文は、この状態に当たります。
          </p>
          <p>
            解決として Martin は抽象を使うことを挙げています<Ref n={1} />。C++ では、描く操作だけを持つ抽象クラス Shape を作り、円と正方形をその派生クラスにします。DrawAllShapes は Shape の描く操作を呼ぶだけになり、三角形を足すときは派生クラスを1つ足せばよく、DrawAllShapes は変わりません。
          </p>
          <h3>閉じる対象を選ぶ：戦略的な閉鎖</h3>
          <p>
            Martin は同じ記事で、意味のあるプログラムを100%閉じることはできないと書いています<Ref n={1} />。たとえば「円をすべて正方形より先に描く」という変更に対しては、図形を足すことに対して閉じた DrawAllShapes も閉じていません。そのため閉じ方は戦略的でなければならず、設計者はどの種類の変更に対して閉じるかを選ぶ必要がある、と述べています。経験のある設計者は利用者と業界を知っていて、起こりやすい変更を見積もり、その変更に対して OCP を当てはめる、という説明です<Ref n={1} />。
          </p>
          <p>
            記事は描く順序に対して閉じる方法として、種類の順序を表（テーブル）に書く方法も示しています<Ref n={1} />。順序を変えるときに書き換えるのはその表だけで、表は独立したモジュールに置けるので、ほかのモジュールに変更が及ばない、という説明です。この章で作る支払い方法の一覧（PaymentMethod::ALL）も、新しい支払い方法を足すときに書き換える唯一の既存のコードです。
          </p>
          <p>
            Martin は2002年の著書『Agile Software Development, Principles, Patterns, and Practices』の第9章を「OCP: The Open-Closed Principle」にあてています<Ref n={3} />。2017年の『Clean Architecture』の第8章では、「A Thought Experiment」「Directional Control（依存の向きの管理）」「Information Hiding」の節を立てています<Ref n={4} />。2014年の記事では、多くの場所を書き換えて機能を足すことを、Martin Fowler が『Refactoring』で Shotgun Surgery と名付けたこと、エディターのようにプラグインで機能を足せるシステムが OCP の到達点であることを書いています<Ref n={2} />。
          </p>
          <Figure n="62-3" title="OCP の定義の移り変わり" caption="Meyer の定義は Martin の2014年の記事の引用による。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">資料</th>
                    <th scope="col">開いている</th>
                    <th scope="col">閉じている</th>
                    <th scope="col">どう実現するか</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Meyer（1988年）</th>
                    <td>データ構造に項目を、機能を足せる</td>
                    <td>安定したインターフェースを持ち、ほかのモジュールから使える</td>
                    <td>（Martin の引用の範囲では示されていない）</td>
                  </tr>
                  <tr>
                    <th scope="row">Martin（1996年）</th>
                    <td>要求に合わせて振る舞いを足せる</td>
                    <td>そのためにソースコードを書き換えない</td>
                    <td>抽象クラスと派生クラス。閉じる対象は起こりやすい変更から選ぶ。種類の順序などは表に書く</td>
                  </tr>
                  <tr>
                    <th scope="row">Martin（2014年）</th>
                    <td>システムの振る舞いを拡張できる</td>
                    <td>システムを書き換えない</td>
                    <td>プラグインの仕組み。上位の方針を下位の詳細から分け、依存の向きを管理する</td>
                  </tr>
                  <tr>
                    <th scope="row">この章</th>
                    <td>支払い方法を足せる</td>
                    <td>Order・ヘルパー・メールのテンプレートを書き換えない</td>
                    <td>支払い方法ごとのクラスと、id で選ぶ一覧。案内は id の名前の部分テンプレート</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <h3>Ruby での「抽象」</h3>
          <p>
            Ruby には、抽象クラスやインターフェースを宣言する構文がありません。この章では、どの支払い方法も <code>id</code>・<code>label</code>・<code>fee(order)</code>・<code>due_at(order)</code> に応答する、という取り決めをコメントに書き、それを満たすオブジェクトを同じように扱います。同じ名前のメソッドを持つことで取り決めを満たす書き方はダックタイピングと呼ばれ、<ChapterLink n={41} section="rails-impl" />で説明します。取り決めが守られているかは、宣言ではなく、一覧のすべての支払い方法に同じテストを実行して確かめます。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則・パターン</th>
                  <th scope="col">OCP との関係</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    SRP（<ChapterLink n={63} />）
                  </th>
                  <td>SRP は変更を求める人ごとにコードを分けます。OCP は、分けた中で「種類が増える」という1つの方向の変更に対して、既存のコードを閉じます。この章でもメールの文面はテンプレートに置き、支払い方法のクラスには文面を書きません。</td>
                </tr>
                <tr>
                  <th scope="row">
                    LSP（<ChapterLink n={65} />）
                  </th>
                  <td>一覧のどの支払い方法に置き換えても使う側が正しく動くことを求めます。OCP の一覧は、この前提がないと成り立ちません。</td>
                </tr>
                <tr>
                  <th scope="row">
                    DIP（<ChapterLink n={67} />）
                  </th>
                  <td>上位の方針が下位の詳細ではなく取り決めに依存するようにします。Clean Architecture の OCP の章にある「依存の向きの管理」がこれに当たります。</td>
                </tr>
                <tr>
                  <th scope="row">
                    Strategy / Policy（<ChapterLink n={41} />）
                  </th>
                  <td>種類ごとの処理をクラスに分けて選ぶ実装のパターンです。OCP はそれを使う理由（既存のコードを閉じる）を説明する原則です。</td>
                </tr>
                <tr>
                  <th scope="row">
                    KISS（<ChapterLink n={57} />）・YAGNI（<ChapterLink n={58} />）
                  </th>
                  <td>増える見込みのない種類のために仕組みを作ると、KISS と YAGNI に反します。この対立は<ChapterLink n={93} section="kiss-ocp" />で比べます。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: '支払い方法の一覧から選ぶ構造に直す',
      body: (
        <>
          <p>直す前のコードを、次の6つの手順で直します。どの手順の後でもテストを実行し、3つの支払い方法の手数料・期限・画面の名前・メールの本文が変わっていないことを確かめます。</p>
          <ol>
            <li>今の振る舞いをテストで固定する：支払い方法ごとの手数料・期限・画面の名前を確かめるテストを書きます。メールの本文は、テストに加えて script/demo.rb の出力を直す前と比べます。</li>
            <li>支払い方法の取り決めを決める：使う側が支払い方法に求めるメソッド（id・label・fee・due_at）を決め、コメントに書きます。</li>
            <li>支払い方法ごとのクラスを作り、case の中身を移す：カード、コンビニ払い、後払いの順に1つずつクラスを作り、when の中身を移します。元の when からはそのクラスを呼びます。Fowler のリファクタリングのカタログにある「条件分岐をポリモーフィズムに置き換える」の手順です<Ref n={14} />。</li>
            <li>一覧を作り、case を「一覧から選ぶ」に置き換える：when がすべてクラスの呼び出しになったら、case を一覧から id で探す処理に置き換え、PAYMENT_METHODS の定数をなくします。</li>
            <li>メールの案内を部分テンプレートに分ける：テンプレートの case を、id と同じ名前の部分テンプレートを描く処理に置き換えます。</li>
            <li>一覧のすべての支払い方法に同じテストを実行する：取り決めを守っているか、メールを作れるかを、一覧から作ったテストで確かめます。</li>
          </ol>
          <h3>すぐに直せないときの最小の手当て</h3>
          <p>
            構造を直す時間が取れないときでも、else に特定の支払い方法の処理を書くのはやめ、すべての支払い方法を when で書いたうえで、else では例外を投げるようにします。メールのテンプレートなら、カードの文面を <code>when "card"</code> に移し、else に <code>raise ArgumentError, "案内のない支払い方法: …"</code> を書きます。足し忘れは、そのメールを作った時点で例外になり、誤った文面は送られません。ただし、気づけるのはその場所を実行したときなので、どの case 文に足すかを探す手間は残ります。
          </p>
          <p>手順2〜4は支払い方法ごとのクラスと一覧から選ぶ処理を作る作業で、<ChapterLink n={41} section="rails-impl" />の送料の例と同じ進め方です。この節では、できあがったコードと、銀行振込を足すときに書き換える範囲を中心に見ます。</p>
          <h3>支払い方法ごとのクラスと一覧</h3>
          <Code
            lang="ruby"
            title="app/models/payment_method.rb"
            code={`
# 支払い方法の一覧。どの支払い方法も id・label・fee(order)・due_at(order) に応答する。
# 支払い方法を足すときは、app/models/payment_method/ にクラスを、
# app/views/order_mailer/payment_guidance/ に案内の部分テンプレートを作り、ALL に1つ足す
module PaymentMethod
  ALL = [Card.new, Konbini.new, PayLater.new].index_by(&:id).freeze

  def self.fetch(id) = ALL.fetch(id)
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/payment_method/card.rb・konbini.rb・pay_later.rb"
            code={`
class PaymentMethod::Card
  def id = "card"
  def label = "クレジットカード"
  def fee(_order) = 0
  def due_at(_order) = nil # 注文の時点で支払いが終わる
end

class PaymentMethod::Konbini
  def id = "konbini"
  def label = "コンビニ払い"
  def fee(_order) = 220
  def due_at(order) = (order.ordered_at + 3.days).end_of_day
end

class PaymentMethod::PayLater
  def id = "pay_later"
  def label = "後払い"
  def fee(_order) = 330
  def due_at(order) = (order.ordered_at + 14.days).end_of_day
end
`}
          />
          <p>
            <code>index_by(&amp;:id)</code> は Active Support のメソッドで、配列を id をキーにした Hash に変えます。ALL は <code>{'{ "card" => Card のインスタンス, "konbini" => …, "pay_later" => … }'}</code> になります。一覧にない id を <code>fetch</code> に渡すと KeyError になります。支払い方法の違いは、この3つのクラスの中にだけ書かれています。手数料と期限が同じクラスにあるので、ある支払い方法の手数料は書いたが期限を書き忘れた、という状態は、クラスを読めばわかります。
          </p>
          <h3>使う側：Order・ヘルパー・メール</h3>
          <Code
            lang="ruby"
            title="app/models/order.rb・app/helpers/checkouts_helper.rb（直した後）"
            code={`
class Order < ApplicationRecord
  validates :payment_method, inclusion: { in: PaymentMethod::ALL.keys }

  def payment = PaymentMethod.fetch(payment_method)
  def payment_fee = payment.fee(self)
  def payment_due_at = payment.due_at(self)
  def total = subtotal + payment_fee
end

module CheckoutsHelper
  # 注文の画面の選択肢
  def payment_options = PaymentMethod::ALL.values.map { |m| [m.label, m.id] }
end
`}
          />
          <Code
            lang="erb"
            title="app/views/order_mailer/confirmation.text.erb と payment_guidance/ の3つの部分テンプレート"
            code={`
<%# app/views/order_mailer/confirmation.text.erb %>
<%= @order.customer_name %> 様

ご注文 <%= @order.number %> を承りました。
お支払い金額：<%= @order.total.to_fs(:delimited) %>円（<%= @order.payment.label %>）

<%= render "order_mailer/payment_guidance/#{@order.payment.id}", order: @order %>

<%# app/views/order_mailer/payment_guidance/_card.text.erb %>
クレジットカードでのお支払いが完了しています。

<%# app/views/order_mailer/payment_guidance/_konbini.text.erb %>
<%= order.payment_due_at.strftime("%-m月%-d日") %>までに、コンビニのレジでお支払いください。

<%# app/views/order_mailer/payment_guidance/_pay_later.text.erb %>
商品と一緒に届く請求書で、<%= order.payment_due_at.strftime("%-m月%-d日") %>までにお支払いください。
`}
          />
          <p>
            Order・CheckoutsHelper・メールのテンプレートには、支払い方法の名前が1つも出てきません。どれも <code>payment</code> で選んだオブジェクトのメソッドを呼ぶか、一覧をたどるだけです。
          </p>
          <p>
            メールの案内は支払い方法のクラスに書かずに、部分テンプレートに置きました。<code>render "menu"</code> と書くと _menu という名前の部分テンプレートが描かれる、という Rails の規約<Ref n={7} />を使い、支払い方法の id と同じ名前の部分テンプレートを描きます。文面は CS が決めるものなので、<ChapterLink n={63} />（SRP）で扱ったとおり、手数料や期限の計算とは別の場所に置いています。部分テンプレートの名前に使う id は、Order のバリデーションで一覧にある値だけに限っています。画面から送られた文字列をそのまま部分テンプレートの名前やクラスの名前に使うと、意図しないファイルやクラスを使わせることができるので、必ず一覧と照らし合わせます。
          </p>
          <p>
            メーラーから <code>helper CheckoutsHelper</code> の指定も消えました。画面の名前を支払い方法のクラスから読むので、メールのテンプレートがヘルパーに頼る必要がなくなったからです。
          </p>
          <h3>一覧のすべての支払い方法に同じテストを実行する</h3>
          <Code
            lang="ruby"
            title="spec/models/payment_method_spec.rb"
            code={`
require "rails_helper"
require_relative "../support/orders"

# 一覧にあるすべての支払い方法が、共通の取り決めを守っているかを確かめる
RSpec.describe PaymentMethod do
  PaymentMethod::ALL.each_value do |method|
    context "#{method.label}（#{method.id}）" do
      let(:order) { build_order(method.id) }

      it "手数料は0以上の整数" do
        expect(method.fee(order)).to be_a(Integer).and be >= 0
      end

      it "支払いの期限は注文より後か、支払い済みなら nil" do
        due = method.due_at(order)
        expect(due.nil? || due > order.ordered_at).to be true
      end

      it "注文確認メールに支払い方法の名前と案内を書ける" do
        body = OrderMailer.with(order:).confirmation.body.to_s
        expect(body).to include("（#{method.label}）")
      end
    end
  end
end
`}
          />
          <p>
            このテストは ALL をたどって支払い方法ごとに同じ3つの例を作ります。このように、取り決めを満たすすべての実装に同じテストを実行するテストを、この章では契約のテストと呼びます。支払い方法を一覧に足すと、テストのコードを書き換えなくても、その支払い方法の例が3つ増えます。<code>build_order</code> は spec/support/orders.rb に置いた、支払い方法を指定して注文を作るメソッドです。コンビニ払いの期限のような個別の計算は、spec/models/payment_method/konbini_spec.rb のように支払い方法ごとのテストで確かめます。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
CheckoutsHelper
  選択肢に、一覧のすべての支払い方法を出す

OrderMailer
  コンビニ払いなら、期限とお支払いの場所を書く
  カードなら、支払いが終わったことを書く

Order
  一覧にない支払い方法は保存しない
  合計は商品の合計に支払い方法の手数料を足す

PaymentMethod::Konbini
  期限は注文の3日後の終わり

PaymentMethod
  クレジットカード（card）
    手数料は0以上の整数
    支払いの期限は注文より後か、支払い済みなら nil
    注文確認メールに支払い方法の名前と案内を書ける
  コンビニ払い（konbini）
    手数料は0以上の整数
    支払いの期限は注文より後か、支払い済みなら nil
    注文確認メールに支払い方法の名前と案内を書ける
  後払い（pay_later）
    手数料は0以上の整数
    支払いの期限は注文より後か、支払い済みなら nil
    注文確認メールに支払い方法の名前と案内を書ける

Finished in 0.0772 seconds (files took 0.80777 seconds to load)
15 examples, 0 failures
`}
          />
          <p>
            直す前から使っているメーラーのテスト（コンビニ払いとカード）もそのまま成功し、script/demo.rb で表示した3つのメールの本文も、直す前と同じでした。図 62-4 は直す前と直した後の構造の比較です。直す前は4つの場所がそれぞれ支払い方法をすべて知っていましたが、直した後は、使う側は一覧から選んで取り決めのメソッドを呼ぶだけになります。
          </p>
          <Figure n="62-4" title="直す前と直した後の構造" caption="破線の箱は Ruby では宣言しない取り決め。破線の矢印は、クラスが取り決めを満たすことと、一覧から取り決めを満たすオブジェクトを選ぶことを表す。">
            <StructureFigure />
          </Figure>
          <h3>銀行振込をもう一度足す</h3>
          <p>
            直した後のコードに、同じ依頼（手数料0円、期限は注文の7日後の終わり）を当てはめます。まず、新しいクラスを作り、一覧に1つ足しました。注文の画面の選択肢を確かめるヘルパーのテストは、期待する選択肢に銀行振込を足しました。メールの案内の部分テンプレートは作らないまま、テストを実行します。
          </p>
          <Code
            lang="ruby"
            title="app/models/payment_method/bank_transfer.rb（新しいファイル）と app/models/payment_method.rb の変えた1行"
            code={`
class PaymentMethod::BankTransfer
  def id = "bank_transfer"
  def label = "銀行振込"
  def fee(_order) = 0
  def due_at(order) = (order.ordered_at + 7.days).end_of_day
end

# app/models/payment_method.rb
  ALL = [Card.new, Konbini.new, PayLater.new, BankTransfer.new].index_by(&:id).freeze
`}
          />
          <Code
            lang="text"
            title="実行結果（部分テンプレートを作る前の bundle exec rspec）"
            code={`
Failures:

  1) PaymentMethod 銀行振込（bank_transfer） 注文確認メールに支払い方法の名前と案内を書ける
     Failure/Error: <%= render "order_mailer/payment_guidance/#{@order.payment.id}", order: @order %>

     ActionView::Template::Error:
       Missing partial order_mailer/payment_guidance/_bank_transfer with {locale: [:en], formats: [:text], variants: [], handlers: [:raw, :erb, :html, :builder, :ruby]}.
 …（省略）
18 examples, 1 failure
`}
          />
          <p>
            一覧に足しただけで、契約のテストに銀行振込の例が3つ加わり、そのうちメールの例が、部分テンプレートがないことを ActionView::Template::Error で知らせました。直す前は else に入ってカードの文面が送られましたが、直した後は、案内を書き忘れるとメールを作る時点で例外になります。部分テンプレートを作ります。
          </p>
          <Code
            lang="erb"
            title="app/views/order_mailer/payment_guidance/_bank_transfer.text.erb（新しいファイル）"
            code={`
<%= order.payment_due_at.strftime("%-m月%-d日") %>までに、下記の口座にお振り込みください。
振込先：みどり銀行 本店営業部 普通 1234567
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec、script/demo.rb の銀行振込の部分、変えたファイルの一覧）"
            code={`
..................

Finished in 0.07707 seconds (files took 0.79167 seconds to load)
18 examples, 0 failures

== bank_transfer
山田花子 様

ご注文 B-2001 を承りました。
お支払い金額：3,000円（銀行振込）

11月9日までに、下記の口座にお振り込みください。
振込先：みどり銀行 本店営業部 普通 1234567

$ git diff --no-index --stat after after_change
 /dev/null => after_change/app/models/payment_method/bank_transfer.rb                      | 6 ++++++
 {after => after_change}/app/models/payment_method.rb                                      | 2 +-
 /dev/null => after_change/app/views/order_mailer/payment_guidance/_bank_transfer.text.erb | 2 ++
 {after => after_change}/spec/helpers/checkouts_helper_spec.rb                             | 2 +-
 4 files changed, 10 insertions(+), 2 deletions(-)
`}
          />
          <p>
            変えたファイルは4つで、そのうち2つは新しいファイルです。既存のアプリのコードで書き換えたのは、一覧の1行だけでした。Order・CheckoutsHelper・メールのテンプレート・既存の3つの支払い方法のクラスは開いていません。ヘルパーのテストを書き換えたのは、画面の選択肢が増えるという、依頼どおりの変化を確かめるためです。
          </p>
          <p>
            図 62-5 は銀行振込を足したときの、閉じる部分と拡張する部分です。新しい支払い方法を足すたびに書き換える既存のコードは、Martin の記事の表と同じく一覧だけで、ほかの部分は変更に対して閉じています。
          </p>
          <Figure n="62-5" title="拡張する部分と閉じる部分" caption="枠が強調色の領域は、銀行振込のために足したファイル。">
            <OpenClosedFigure />
          </Figure>
          <p>
            この構造は、支払い方法を足すことに対しては閉じていますが、すべての変更に対して閉じているわけではありません。たとえば「すべての支払い方法に分割払いの回数を持たせる」という依頼なら、取り決めにメソッドが加わり、すべてのクラスと使う側を書き換えます。閉じているのは、この章で選んだ「支払い方法が増える」という方向だけです。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '当てはめすぎたとき：一覧の1行も書かずに済ませようとする',
      body: (
        <>
          <h3>サブクラスを作るだけで一覧に加わる仕組み</h3>
          <p>
            直した後のコードでも、支払い方法を足すときは一覧の1行を書き換えます。これもなくして、クラスを作るだけで一覧に加わるようにしたい、と考えたのが次のコードです。Ruby の <code>inherited</code> は、あるクラスを継承したサブクラスが作られたときに呼ばれるクラスメソッドです<Ref n={15} />。基底クラスの inherited でサブクラスを一覧に登録します。将来の支払い方法のために、支払いの前後に呼ぶメソッドや、返金できるかを返すメソッドも用意しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/payment_method/base.rb・card.rb・konbini.rb と app/models/payment_method.rb（当てはめすぎた例）"
            code={`
# app/models/payment_method/base.rb
# 支払い方法の基底クラス。サブクラスを作るだけで一覧に加わる
class PaymentMethod::Base
  @registry = {}

  class << self
    attr_reader :registry

    def inherited(subclass)
      super
      PaymentMethod::Base.registry[subclass.name.demodulize.underscore] = subclass.new
    end
  end

  def id = self.class.name.demodulize.underscore
  def fee(_order) = 0
  def due_at(_order) = nil

  # 将来の支払い方法のための拡張点（今はどの支払い方法も使っていない）
  def before_charge(_order) = nil
  def after_charge(_order) = nil
  def refundable? = true
end

# app/models/payment_method/konbini.rb（card.rb・pay_later.rb も同じ形）
class PaymentMethod::Konbini < PaymentMethod::Base
  def label = "コンビニ払い"
  def fee(_order) = 220
  def due_at(order) = (order.ordered_at + 3.days).end_of_day
end

# app/models/payment_method.rb
module PaymentMethod
  def self.all = Base.registry
  def self.fetch(id) = all.fetch(id)
end

# Order は inclusion: { in: ->(_order) { PaymentMethod.all.keys } }、
# CheckoutsHelper は PaymentMethod.all.values から選択肢を作るように変えた
`}
          />
          <h3>開発環境で実行すると</h3>
          <p>開発環境で、起動した直後の一覧、コンビニ払いのクラスを一度参照した後の一覧、アプリのファイルをすべて読み込んだ後の一覧を表示しました。</p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner を3回）"
            code={`
$ bin/rails runner 'p PaymentMethod.all.keys'
[]
$ bin/rails runner 'PaymentMethod::Konbini; p PaymentMethod.all.keys'
["konbini"]
$ bin/rails runner 'Rails.application.eager_load!; p PaymentMethod.all.keys'
["card", "konbini", "pay_later"]
`}
          />
          <p>
            起動した直後の一覧は空でした。Rails は開発環境とテストでは、クラスを初めて参照した時点でそのファイルを読み込みます（Zeitwerk による自動読み込み）。読み込まれていないサブクラスは inherited が呼ばれていないので、一覧に入りません。アプリのファイルを起動時にすべて読み込むかどうかは <code>config.eager_load</code> で決まり、Rails ガイドによると production 以外では無効が既定です<Ref n={6} />。生成されたアプリの config/environments/test.rb は <code>config.eager_load = ENV["CI"].present?</code> で、環境変数 CI があるときだけ有効にします。テストを2通りで実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec と CI=1 bundle exec rspec）"
            code={`
$ bundle exec rspec spec/helpers
 …（省略）
  1) CheckoutsHelper 選択肢に、一覧のすべての支払い方法を出す
     Failure/Error: expect(helper.payment_options).to eq [["クレジットカード", "card"], ["コンビニ払い", "konbini"], ["後払い", "pay_later"]]

       expected: [["クレジットカード", "card"], ["コンビニ払い", "konbini"], ["後払い", "pay_later"]]
            got: []
 …（省略）
$ bundle exec rspec
 …（省略。KeyError: key not found: "konbini" などで失敗）
5 examples, 4 failures

$ CI=1 bundle exec rspec
5 examples, 0 failures
`}
          />
          <p>
            同じコードで、手元では失敗し、CI では成功します。開発環境の注文の画面には支払い方法が1つも出ず、どれかの支払い方法のクラスを参照した後は、その分だけが出ます。Rails ガイドは、単一テーブル継承（STI）のサブクラスについて同じ問題を挙げ、遅延読み込みではクラスが必要になったときに初めて読み込まれるため、サブクラスを前もって読み込む必要があると説明しています<Ref n={6} />。全部を読み込んだ場合も、一覧の並び（画面の選択肢の順）はファイルを読み込む順で決まり、ガイドは eager loading でファイルを読み込む順は決まっていないと書いています<Ref n={6} />。図 62-6 は、環境ごとに一覧が変わる流れです。
          </p>
          <Figure n="62-6" title="自動で登録する仕組みと、クラスを読み込む時期" caption="上の段は eager_load が無効の環境、下の段は有効の環境。強調した箱が期待と違う結果。">
            <LoadingFigure />
          </Figure>
          <p>
            一覧の1行を書く手間をなくした代わりに、どの支払い方法が使えるかがコードのどこにも書かれていない状態になりました。直した後の PaymentMethod::ALL は、1行で使える支払い方法とその並び順を示し、読み込みの時期にも左右されません。
          </p>
          <h3>使わない拡張点</h3>
          <p>
            基底クラスの <code>before_charge</code>・<code>after_charge</code>・<code>refundable?</code> は、今はどの支払い方法も使っていません。それでも、支払い方法を読む人は、これらがどこから呼ばれるのか、上書きする必要があるのかを確かめることになります。実際に「支払いの前に与信を取る」支払い方法が来たときに、その要求がこの形に合う保証もありません。必要になった時点で、使う側と一緒に足せば足ります。将来のための仕組みの費用は<ChapterLink n={58} />（YAGNI）で扱います。
          </p>
          <h3>閉じる対象を選ぶ</h3>
          <p>
            Martin の言う戦略的な閉鎖に沿うと、OCP を当てはめるのは、起こりやすい変更の方向に限ります<Ref n={1} />。この EC サイトでは、カード、コンビニ払い、後払いと支払い方法が順に増えてきたので、「支払い方法が増える」は起こりやすい変更です。一方、「合計は商品の合計に手数料を足す」という式や、「送料無料にするのは合計が5,000円以上」という判定を、将来の別の計算方法のために差し替えられる構造にしても、閉じる対象は起きていない変更です。そうした構造は読む量を増やすだけで、KISS（<ChapterLink n={57} />）に反します。
          </p>
          <p>図 62-7 は一覧から選ぶ構造にするかどうかの目安です。横軸は種類が増える見込み、縦軸は種類による違いが出る場所の数です。</p>
          <Figure n="62-7" title="一覧から選ぶ構造にするかの判断" caption="模式図。強調した箱は、どの位置でも足さないもの。">
            <JudgeFigure />
          </Figure>
          <ul>
            <li>右上（増える見込みが高い・違いが複数の場所に出る）：この章のように、種類ごとのクラスと一覧にします。契約のテストで、一覧のすべての種類を確かめます。</li>
            <li>右下（増える見込みが高い・違いが1か所）：種類ごとの違いが手数料だけのような場合は、Hash の一覧1つで足ります。<ChapterLink n={41} section="idea" />の PaymentFee がこの形です。</li>
            <li>左上（増える見込みが低い・違いが複数の場所に出る）：case のままにし、else で例外を投げます。足し忘れは、その場所を実行した時点で例外になります。</li>
            <li>左下（どちらも低い）：case 文や if のままにします。</li>
          </ul>
          <p>迷ったときは、次の3つを確かめます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">確かめること</th>
                  <th scope="col">一覧から選ぶ構造にする方向の答え</th>
                  <th scope="col">今のままにする方向の答え</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>この種類は、これまでに足されたことがあるか。足す依頼が予定されているか</td>
                  <td>何度も足されてきた。次の依頼も来ている</td>
                  <td>一度も足されていない</td>
                </tr>
                <tr>
                  <td>種類による違いは、いくつの場所に書かれているか</td>
                  <td>複数のファイルやテンプレートに分かれている</td>
                  <td>1つのメソッドの中だけ</td>
                </tr>
                <tr>
                  <td>種類を足し忘れたとき、どこで気づけるか</td>
                  <td>else に入って誤った結果のまま進む</td>
                  <td>例外やテストですぐに気づける</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能・規約との関係',
      body: (
        <>
          <h3>Rails 自身が拡張に対して開いている場所</h3>
          <p>
            Rails にも、Rails のコードを書き換えずに種類を足せる場所が多くあります。たとえば Active Job は、ジョブをどのキューのシステム（Sidekiq、Solid Queue など）に入れるかを、<code>config.active_job.queue_adapter = :sidekiq</code> のように名前で指定します。Active Job は指定された名前を <code>camelize</code> して末尾に Adapter を付け、<code>ActiveJob::QueueAdapters::SidekiqAdapter</code> という定数を探します<Ref n={9} />。Active Job の README は、新しいアダプターのプルリクエストは受け付けず、アダプターは各ライブラリが自分の gem の中で提供するよう勧めると書いています<Ref n={8} />。本書の検証環境の Sidekiq 8.1.7 も、このアダプターを Sidekiq の gem の中に持っています<Ref n={10} />。キューのシステムを足すときに Active Job のコードは変わらない、という OCP の形です。
          </p>
          <p>図 62-8 は、Rails のおもな拡張点を、足し方と、足しても変わらない部分に分けて並べたものです。</p>
          <Figure n="62-8" title="Rails のおもな拡張点" caption="どれも Rails のコードを書き換えずに種類を足す方法。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">拡張点</th>
                    <th scope="col">足し方</th>
                    <th scope="col">足しても変わらない部分</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Active Job のキューのアダプター</td>
                    <td>
                      gem が <code>ActiveJob::QueueAdapters::〈名前〉Adapter</code> を定義し、アプリは queue_adapter に名前を書く<Ref n={9} />
                    </td>
                    <td>perform_later などのジョブの書き方</td>
                  </tr>
                  <tr>
                    <td>Action Mailer の送信方法</td>
                    <td>
                      <code>add_delivery_method</code> で記号と送信を受け持つクラスを登録する<Ref n={11} />
                    </td>
                    <td>メーラーの mail と deliver_later</td>
                  </tr>
                  <tr>
                    <td>Active Record の属性の型</td>
                    <td>
                      <code>ActiveRecord::Type.register</code> で型を登録し、<code>attribute</code> で使う<Ref n={12} />
                    </td>
                    <td>属性の型変換と変更の追跡</td>
                  </tr>
                  <tr>
                    <td>Rack のミドルウェア</td>
                    <td>
                      <code>config.middleware.use</code> や <code>insert_before</code> でアプリの前に処理を足す
                    </td>
                    <td>ルーティングとコントローラー</td>
                  </tr>
                  <tr>
                    <td>フレームワークのクラスへの追加</td>
                    <td>
                      <code>ActiveSupport.on_load(:active_record) {'{ … }'}</code> で、クラスが読み込まれたときに処理を足す<Ref n={13} />
                    </td>
                    <td>Active Record などのクラスの定義</td>
                  </tr>
                  <tr>
                    <td>部分テンプレート</td>
                    <td>名前で決まるファイルを足す（この章の支払いの案内）<Ref n={7} /></td>
                    <td>render を呼ぶテンプレート</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            Rack のミドルウェアの足し方は<ChapterLink n={6} section="customize" />で、属性の型の登録は<ChapterLink n={11} section="attribute-api" />で扱いました。業務のコードで支払い方法のような種類の一覧を作るときも、これらと同じく「足す場所」と「足しても変わらない場所」を分けると、何を書けば種類が増えるのかがわかりやすくなります。
          </p>
          <h3>名前で探す規約</h3>
          <p>
            Active Job のアダプターも部分テンプレートも、名前の規約で探す相手を決めます。Rails Doctrine の Convention over Configuration が、Person クラスと people テーブルのように、規約から関連や外部キーを導く例を挙げているのと同じ考え方です<Ref n={5} />。この章の部分テンプレートも、支払い方法の id と同じ名前にするという規約で、使う側の case をなくしました。
          </p>
          <p>
            ただし、名前で探す相手を、利用者が送ってきた値から決めてはいけません。この章では、id を Order のバリデーションで一覧と照らし合わせてから使っています。画面から送られた文字列を <code>constantize</code> でクラスに変える危険は<ChapterLink n={41} section="idea" />で説明します。
          </p>
          <h3>既存のクラスを書き換える道具</h3>
          <p>
            Ruby では、既存のクラスをあとから開き直してメソッドを足したり置き換えたりできます。Rails Doctrine の「Provide sharp knives（よく切れる道具を渡す）」の節は、その代表がモンキーパッチ（既存のクラスやメソッドを変える力）だと書き、<code>2.days.ago</code> のような書き方もこの力から生まれたと説明しています<Ref n={5} />。
          </p>
          <p>
            OCP の言葉で言えば、gem のクラスを開き直して振る舞いを変えるのは、拡張ではなく既存のコードの変更です。gem を更新したときに、開き直した部分が新しいコードと合わなくなることがあります。gem の振る舞いを変えたいときは、まずその gem が用意している拡張点（設定、アダプター、on_load のフック、コールバック）を探し、それで足りないときに限って開き直します。
          </p>
          <h3>継承と STI で種類を表すとき</h3>
          <p>
            支払い方法を DB の行として持ち、種類ごとに保存する列や振る舞いが違うなら、単一テーブル継承（STI）のサブクラスで表すこともできます。その場合も、当てはめすぎの節で見た読み込みの時期の問題に注意します。Rails ガイドは、STI のサブクラスを前もって読み込む方法として、eager loading を有効にする方法などを挙げています<Ref n={6} />。サブクラスが親の約束を守っているか（置き換えても使う側が正しく動くか）は<ChapterLink n={65} />（LSP）で、継承より組み合わせを選ぶ判断は<ChapterLink n={72} />（Composition over Inheritance）で扱います。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={41} />（Strategy / Policy）：種類ごとのクラスを一覧から選ぶ実装、時刻で一覧を替える方法、lambda の一覧、認可の Policy を詳しく扱っています。
            </li>
            <li>
              <ChapterLink n={63} />（SRP）：この章でメールの案内を支払い方法のクラスに書かずテンプレートに置いた理由です。
            </li>
            <li>
              <ChapterLink n={67} />（DIP）：使う側が取り決めに依存し、詳細が取り決めを満たすという依存の向きを扱います。
            </li>
            <li>
              <ChapterLink n={93} section="kiss-ocp" />：KISS と OCP のどちらを選ぶかを、Rails のコードで比べます。
            </li>
            <li>
              <ChapterLink n={18} section="sidekiq" />：Active Job と Sidekiq の関係を扱っています。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          OCP を当てはめるのは、起こりやすい変更の方向だけです。この EC サイトでは支払い方法が順に増えてきたので、支払い方法ごとのクラスと一覧に直しました。増える見込みのない種類や、違いが1か所だけの種類は、case や Hash の一覧のままにします。
        </>
      ),
      benefit: {
        text: <>直す前は、銀行振込を足すときに Order・CheckoutsHelper・メールのテンプレートを書き換え、メールの case 文を直し忘れてカードの文面が送られた。直した後は、既存のアプリのコードで書き換えたのは一覧の1行だけで、部分テンプレートの作り忘れは契約のテストが ActionView::Template::Error で知らせた。</>,
        basis: <><ChapterLink n={64} section="scene" />、<ChapterLink n={64} section="apply" /></>,
      },
      cost: {
        text: <>支払い方法ごとのクラスと部分テンプレート、一覧のすべてに同じテストを実行する契約のテストが要る。閉じているのは「支払い方法が増える」変更だけで、すべての支払い方法に分割払いの回数を持たせるような依頼では、すべてのクラスと使う側を書き換える。</>,
        basis: <ChapterLink n={64} section="apply" />,
      },
      alternative: {
        text: <>違いが手数料だけなら Hash の一覧1つで足りる。増える見込みが低い種類は case のままにし、else で例外を投げて足し忘れに気づけるようにする。一覧の1行も書かずにサブクラスを自動で登録する仕組みは、開発環境では起動した直後の一覧が空になったので使わない。</>,
        basis: <ChapterLink n={64} section="overuse" />,
      },
      criterion: {
        text: <>その種類はこれまでに足されてきたか、足す依頼が予定されているか。種類による違いがいくつの場所に書かれているか。足し忘れたとき、else に入って誤った結果のまま進むか、例外やテストですぐに気づけるか。</>,
        basis: <ChapterLink n={64} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>開放閉鎖の原則（OCP）は、既存のコードへの変更を抑えながら振る舞いを拡張できるようにする原則です。Meyer が1988年に示し、Martin が1996年に「拡張に対して開いていて、変更に対して閉じているべきだ」と言い換えました。</li>
          <li>支払い方法の違いを4つの case 文に書くと、種類を足すたびに既存のファイルを探して直し、1か所を直し忘れても else に入って誤ったメールが送られました。</li>
          <li>支払い方法ごとのクラスと、id で選ぶ一覧に直すと、銀行振込を足すときに書き換える既存のコードは一覧の1行だけになりました。メールの案内は id と同じ名前の部分テンプレートに置きます。</li>
          <li>一覧のすべての種類に同じテストを実行する契約のテストを書くと、足した種類の作り忘れ（この章では部分テンプレート）をテストで見つけられます。</li>
          <li>どのプログラムも100%は閉じられないので、閉じる対象は起こりやすい変更の方向に絞ります。増える見込みのない種類や、違いが1か所だけの種類には、case や Hash の一覧で足ります。</li>
          <li>サブクラスを作るだけで一覧に加わる仕組みは、Rails の自動読み込みでは環境ごとに一覧が変わります。使わない拡張点も足しません。</li>
          <li>Active Job のアダプターや部分テンプレートのように、Rails 自身も名前の規約で種類を足せるようになっています。gem の振る舞いを変えたいときは、開き直す前に用意された拡張点を探します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'The Open-Closed Principle', publisher: 'Robert C. Martin / The C++ Report（テキサス大学の教員のサイトに置かれた複製）', url: 'https://cs.utexas.edu/~downing/papers/OCP-1996.pdf', accessed: '2026-11-21', version: '1996年（連載 Engineering Notebook の第1回）', note: 'Meyer の言葉の言い換え（拡張に対して開き、変更に対して閉じる）、1つの変更が依存するモジュールに広がる問題、抽象が要であること、DrawAllShapes の switch 文がアプリのあちこちに繰り返される例と抽象クラス Shape による解決、100%閉じることはできず閉じる対象を選ぶ戦略的な閉鎖、表を使って順序に対して閉じる方法。' },
    { title: 'The Open Closed Principle', publisher: 'The Clean Code Blog / Robert C. Martin', url: 'https://blog.cleancoder.com/uncle-bob/2014/05/12/TheOpenClosedPrinciple.html', accessed: '2026-11-21', version: '2014年5月12日', note: 'Meyer の『Object Oriented Software Construction』（1988年）の開いている・閉じているの定義の引用、その要点を「システムを書き換えずに振る舞いを拡張できるべきだ」とまとめたこと、Fowler の Shotgun Surgery、プラグインの仕組みが OCP の到達点であること。' },
    { title: 'Agile Software Development, Principles, Patterns, and Practices', publisher: 'Robert C. Martin / Pearson（InformIT の書籍ページの目次）', url: 'https://www.informit.com/store/agile-software-development-principles-patterns-and-practices-9780135974445', accessed: '2026-11-21', version: '2002年10月刊', note: '第9章「OCP: The Open-Closed Principle」。' },
    { title: "Clean Architecture: A Craftsman's Guide to Software Structure and Design", publisher: 'Robert C. Martin / Pearson（InformIT の書籍ページの目次）', url: 'https://www.informit.com/store/clean-architecture-a-craftsmans-guide-to-software-structure-9780134494166', accessed: '2026-11-21', version: '2017年9月刊', note: '第8章「OCP: The Open-Closed Principle」の節「A Thought Experiment」「Directional Control」「Information Hiding」。' },
    { title: 'The Rails Doctrine', publisher: 'Ruby on Rails / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: '「Convention over Configuration」：Person クラスと people テーブルのように規約から導く例。「Provide sharp knives」：モンキーパッチは既存のクラスやメソッドを変える力であり、2.days.ago もその力から生まれたこと。' },
    { title: 'Autoloading and Reloading Constants', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'config.eager_load が production 以外では既定で無効であること、eager loading でファイルを読み込む順は決まっていないこと、STI は遅延読み込みと合わず、サブクラスを前もって読み込む方法（eager loading の有効化など）があること。' },
    { title: 'Layouts and Rendering in Rails', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/layouts_and_rendering.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'render "menu" で _menu という名前の部分テンプレートが描かれること。' },
    { title: 'activejob/README.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/README.md#L88-L94`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: '新しいアダプターのプルリクエストは受け付けず、アダプターは各ライブラリの gem の中で提供するよう勧めていること。' },
    { title: 'activejob/lib/active_job/queue_adapters.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/queue_adapters.rb#L134-L136`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'queue_adapter に指定した名前を camelize して Adapter を付けた定数を探すこと。' },
    { title: 'lib/active_job/queue_adapters/sidekiq_adapter.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: 'https://github.com/sidekiq/sidekiq/blob/v8.1.7/lib/active_job/queue_adapters/sidekiq_adapter.rb#L35-L47', accessed: '2026-11-21', version: 'sidekiq 8.1.7', note: 'Sidekiq の gem が ActiveJob::QueueAdapters::SidekiqAdapter を定義していること。' },
    { title: 'actionmailer/lib/action_mailer/delivery_methods.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionmailer/lib/action_mailer/delivery_methods.rb#L45-L55`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'add_delivery_method で記号とクラスを送信方法の一覧に加えること。' },
    { title: 'activerecord/lib/active_record/type.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/type.rb#L37-L39`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'ActiveRecord::Type.register で型を登録すること。' },
    { title: 'activesupport/lib/active_support/lazy_load_hooks.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/lazy_load_hooks.rb#L60-L80`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'on_load で登録した処理が、run_load_hooks でクラスが読み込まれたときに実行されること。' },
    { title: 'Replace Conditional with Polymorphism', publisher: 'refactoring.com / Martin Fowler', url: 'https://refactoring.com/catalog/replaceConditionalWithPolymorphism.html', accessed: '2026-11-13', version: '『Refactoring』第2版（2018年刊）のカタログ', note: '条件分岐をポリモーフィズムに置き換えるリファクタリング。' },
    { title: 'class Class（inherited）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Class.html', accessed: '2026-11-21', note: 'inherited はサブクラスが作られるたびに呼ばれるコールバックであること。' },
  ],
}

export default chapter
