import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 69-1 残高を書き換える5か所 ---------- */
const sceneRows: { name: string; sub: string; check: string; history: string; checkBad?: boolean; historyBad?: boolean }[] = [
  { name: '① Charge', sub: 'チャージ', check: '不要（増やす）', history: '残す' },
  { name: '② Checkout', sub: '支払い', check: '確かめる', history: '残す' },
  { name: '③ RefundJob', sub: '返金', check: '不要（増やす）', history: '残す' },
  { name: '④ ChargeCancellationJob', sub: 'チャージの取り消し', check: '確かめない', history: '残す', checkBad: true },
  { name: '⑤ Admin::WalletsController', sub: '管理画面', check: '確かめない', history: '残さない', checkBad: true, historyBad: true },
]

function SceneFigure() {
  return (
    <Svg
      id="69-1"
      w={780}
      h={390}
      label="ウォレットの残高を書き換える場所が5か所ある。① Charge（チャージ）と③ RefundJob（返金）は残高を増やし、履歴を残す。② Checkout（支払い）は残高が足りるかを確かめてから減らし、履歴を残す。④ ChargeCancellationJob（チャージの取り消し）は残高が足りるかを確かめずに減らすので、残高がマイナスになる。⑤ Admin::WalletsController（管理画面）は残高を直接書き換え、履歴を残さないので、履歴の合計と残高が食い違う。5か所はどれも Wallet の update!(balance: …) を呼び、Wallet は wallets テーブルの balance 列に書き込む。履歴は wallet_entries テーブルに入る"
    >
      <T x={20} y={20} bold>
        書き換える場所
      </T>
      <T x={330} y={20} anchor="middle" bold fs={12}>
        足りるかの確認
      </T>
      <T x={432} y={20} anchor="middle" bold fs={12}>
        履歴
      </T>
      {sceneRows.map((r, i) => {
        const y = 40 + i * 56
        return (
          <g key={r.name}>
            <Box x={20} y={y} w={250} h={44} lines={[r.name, r.sub]} fs={12} mono={false} subTone="muted" fill={r.checkBad ? 'box5' : 'box'} />
            <T x={330} y={y + 22} anchor="middle" fs={12} tone={r.checkBad ? 'danger' : undefined}>
              {r.check}
            </T>
            <T x={432} y={y + 22} anchor="middle" fs={12} tone={r.historyBad ? 'danger' : undefined}>
              {r.history}
            </T>
            <Arrow x1={470} y1={y + 22} x2={528} y2={170} />
          </g>
        )
      })}
      <T x={574} y={120} fs={11} tone="muted" mono anchor="middle">
        update!(balance: …)
      </T>
      <Box x={530} y={140} w={100} h={60} lines={['Wallet', '操作を持たない']} fs={12} bold subTone="muted" />
      <Box x={660} y={60} w={110} h={50} lines={['wallets', 'balance 列']} fs={12} fill="box4" subTone="muted" />
      <Box x={660} y={230} w={110} h={50} lines={['wallet_entries', '履歴']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={630} y1={160} x2={658} y2={98} />
      <Arrow x1={630} y1={182} x2={658} y2={244} />
      <T x={20} y={330} fs={12} tone="danger">
        ④ 足りるかを確かめずに引くので、残高が -3,000円になる
      </T>
      <T x={20} y={352} fs={12} tone="danger">
        ⑤ 残高を直接書き換えて履歴を残さないので、履歴の合計（-3,000円）と残高（0円）が食い違う
      </T>
      <T x={20} y={374} fs={12} tone="muted">
        規則（0円未満にしない・履歴を残す）は呼び出し側がそれぞれ書いていて、書き忘れた場所で破れる
      </T>
    </Svg>
  )
}

/* ---------- 図 69-2 Active Record の属性は既定で公開される ---------- */
function ExposureFigure() {
  return (
    <Svg
      id="69-2"
      w={780}
      h={360}
      label="wallets テーブルの balance 列から、Active Record は Wallet に属性のメソッドを21個作り、すべて public になる。balance、balance=、balance_was、balance_changed?、restore_balance! などである。このほかに、列を問わず使える書き込みのメソッドがある。update・update!・save・assign_attributes・[]=・write_attribute は検証を通る。update_column・update_columns・increment!・decrement!・toggle!・update_all・update_counters・insert_all・upsert_all は検証もコールバックも通らない。どのメソッドも、アプリのどのクラスからでも呼べる"
    >
      <Box x={230} y={10} w={530} h={36} lines="呼び出し側（コントローラー・ジョブ・サービス・コンソール。どのクラスからでも）" fs={12} />
      <Arrow x1={355} y1={46} x2={355} y2={84} />
      <Arrow x1={640} y1={46} x2={640} y2={84} />

      <Box x={20} y={120} w={170} h={56} lines={['wallets テーブル', 'balance INT NOT NULL']} fs={12} fill="box4" subTone="muted" mono={false} />
      <Arrow x1={190} y1={148} x2={228} y2={148} />
      <T x={209} y={136} anchor="middle" fs={10} tone="muted">
        作る
      </T>

      <Box
        x={230}
        y={86}
        w={250}
        h={200}
        lines={['属性のメソッド（21個、すべて public）', 'balance', 'balance=', 'balance? / balance_was', 'balance_changed? / balance_change', 'balance_in_database', 'restore_balance! / clear_balance_change', 'balance_will_change!', '…（ほか12個）']}
        fs={12}
        bold
        subTone="muted"
        align="start"
        accent
      />

      <Box
        x={510}
        y={86}
        w={250}
        h={84}
        lines={['検証を通る書き込み', 'update / update! / save', 'assign_attributes / attributes=', '[]= / write_attribute（+ save）']}
        fs={12}
        bold
        subTone="muted"
        align="start"
      />
      <Box
        x={510}
        y={182}
        w={250}
        h={104}
        lines={['検証もコールバックも通らない', 'update_column / update_columns', 'increment! / decrement! / toggle!', 'update_all / update_counters', 'insert_all / upsert_all']}
        fs={12}
        bold
        subTone="danger"
        align="start"
      />
      <T x={20} y={312} fs={12}>
        Active Record は列ごとに読み書きのメソッドを作り、既定ではすべて public にする。
      </T>
      <T x={20} y={334} fs={12} tone="muted">
        モデルに何も書かなければ、どのクラスからでも残高を任意の値にできる
      </T>
    </Svg>
  )
}

/* ---------- 図 69-3 公開する操作と隠す状態 ---------- */
const publicOps = ['charge!(amount)', 'pay!(amount)', 'refund!(amount)', 'cancel_charge!(amount)', 'adjust!(amount, note:)', 'balance（読むだけ）']

function BoundaryFigure() {
  return (
    <Svg
      id="69-3"
      w={780}
      h={330}
      label="Wallet の外に公開するのは charge!、pay!、refund!、cancel_charge!、adjust! の5つの操作と、残高を読む balance だけにする。残高を書き込む balance= と、残高を変える処理 change_balance! は private にし、change_balance! がロック・下限と上限の確認・履歴の追加をまとめて行う。不変条件は、残高が0円以上10万円以下であることと、履歴の合計が残高と等しいこと。呼び出し側の Charge・Checkout・RefundJob・ChargeCancellationJob・管理画面は、公開した操作だけを呼ぶ。change_balance! が wallets と wallet_entries に書き込む"
    >
      <Box x={10} y={110} w={150} h={120} lines={['呼び出し側', 'Charge', 'Checkout', 'RefundJob', 'ChargeCancellationJob', '管理画面']} fs={12} bold subTone="muted" />
      <Arrow x1={160} y1={170} x2={203} y2={170} />

      <Box x={190} y={10} w={420} h={310} fill="none" accent />
      <T x={205} y={30} bold>
        Wallet
      </T>
      <T x={212} y={52} fs={12} tone="acc">
        公開する操作
      </T>
      {publicOps.map((op, i) => (
        <Box key={op} x={205} y={64 + i * 40} w={170} h={32} lines={op} fs={11} mono={i < 5} fill="box" />
      ))}
      <T x={398} y={52} fs={12} tone="muted">
        隠す状態と処理（private）
      </T>
      <Box x={395} y={64} w={200} h={32} lines="balance=" fs={12} mono fill="box2" dashed />
      <Box x={395} y={110} w={200} h={70} lines={['change_balance!', 'ロック（with_lock）', '下限と上限の確認・履歴の追加']} fs={12} mono={false} fill="box2" subTone="muted" />
      <Arrow x1={375} y1={145} x2={393} y2={145} />
      <Box x={395} y={200} w={200} h={70} lines={['不変条件', '0 ≤ balance ≤ 100,000', '履歴の合計 = balance']} fs={12} fill="box5" bold subTone="muted" dashed />

      <Box x={650} y={80} w={120} h={44} lines={['wallets', 'balance']} fs={12} fill="box4" subTone="muted" />
      <Box x={650} y={170} w={120} h={44} lines={['wallet_entries', '追加だけ']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={595} y1={135} x2={648} y2={104} />
      <Arrow x1={595} y1={155} x2={648} y2={190} />
    </Svg>
  )
}

/* ---------- 図 69-4 直す前と後の書き換えの経路 ---------- */
const callerNames = ['① Charge', '② Checkout', '③ RefundJob', '④ ChargeCancellationJob', '⑤ 管理画面']
const afterMethods = ['charge!', 'pay!', 'refund!', 'cancel_charge!', 'adjust!']

function BeforeAfterFigure() {
  return (
    <Svg
      id="69-4"
      w={780}
      h={360}
      label="直す前は、5か所の呼び出し側がそれぞれ update!(balance: …) で wallets.balance に直接書き込み、残高の確認や履歴の追加も呼び出し側ごとに書いている。確認があるのは② Checkout だけである。直した後は、5か所がそれぞれ Wallet の charge!、pay!、refund!、cancel_charge!、adjust! を呼ぶ。Wallet の中の change_balance! がロック・確認・履歴の追加を1か所で行い、wallets と wallet_entries に書き込む。管理画面は残高を直接受け付けず、金額と理由を adjust! に渡す"
    >
      <T x={20} y={20} bold>
        直す前
      </T>
      {callerNames.map((n, i) => (
        <g key={n}>
          <Box x={20} y={40 + i * 46} w={190} h={34} lines={n} fs={12} fill={i >= 3 ? 'box5' : 'box'} />
          <Arrow x1={210} y1={57 + i * 46} x2={268} y2={150} />
        </g>
      ))}
      <Box x={270} y={124} w={100} h={52} lines={['wallets', 'balance']} fs={12} fill="box4" subTone="muted" />
      <T x={20} y={284} fs={12} tone="danger">
        5か所が update!(balance: …) で直接書く
      </T>
      <T x={20} y={304} fs={12} tone="danger">
        確認は②だけ、履歴は⑤で抜ける
      </T>
      <T x={20} y={324} fs={12} tone="danger">
        規則を1つ足すと、増やす側の3か所を直す
      </T>

      <line x1={392} y1={10} x2={392} y2={350} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={410} y={20} bold>
        直した後
      </T>
      {callerNames.map((n, i) => (
        <g key={n}>
          <Box x={410} y={40 + i * 46} w={180} h={34} lines={n} fs={12} />
          <Arrow x1={590} y1={57 + i * 46} x2={618} y2={57 + i * 46} />
          <T x={604} y={47 + i * 46} anchor="middle" fs={9} tone="muted" mono>
            {afterMethods[i]}
          </T>
        </g>
      ))}
      <Box x={620} y={40} w={150} h={218} fill="none" accent />
      <T x={695} y={60} anchor="middle" bold fs={12}>
        Wallet
      </T>
      <Box x={630} y={150} w={130} h={64} lines={['change_balance!', 'ロック・確認', '履歴の追加']} fs={11} fill="box2" subTone="muted" />
      <T x={695} y={110} anchor="middle" fs={11} tone="muted">
        公開した5つの操作
      </T>
      <Arrow x1={695} y1={120} x2={695} y2={148} />
      <Box x={620} y={286} w={150} h={44} lines={['wallets', 'wallet_entries']} fs={12} fill="box4" />
      <Arrow x1={695} y1={258} x2={695} y2={284} />
      <T x={410} y={284} fs={12} tone="acc">
        規則・ロック・履歴は
      </T>
      <T x={410} y={304} fs={12} tone="acc">
        Wallet の1か所にある
      </T>
      <T x={410} y={324} fs={12} tone="muted">
        呼び出し側は操作を選ぶだけ
      </T>
    </Svg>
  )
}

/* ---------- 図 69-5 同時の支払いのタイムライン ---------- */
type Step = { y: number; lane: 0 | 1 | 2; text: string[]; tone?: 'danger' | 'acc'; fill?: 'box' | 'box5' | 'box2' }

const raceBefore: Step[] = [
  { y: 70, lane: 2, text: ['Wallet.find → 残高 5,000'] },
  { y: 120, lane: 2, text: ['5,000 ≥ 3,000 なので払える'] },
  { y: 170, lane: 0, text: ['UPDATE balance = 2000'] },
  { y: 220, lane: 1, text: ['UPDATE balance = 2000'], tone: 'danger', fill: 'box5' },
]
const raceAfter: Step[] = [
  { y: 70, lane: 0, text: ['SELECT … FOR UPDATE', '→ 5,000'] },
  { y: 70, lane: 1, text: ['SELECT … FOR UPDATE', '（ロックを待つ）'] },
  { y: 130, lane: 0, text: ['UPDATE 2000・履歴', 'COMMIT（ロックを外す）'] },
  { y: 190, lane: 1, text: ['→ 2,000 を読む'] },
  { y: 240, lane: 1, text: ['InsufficientBalance', 'ROLLBACK'], tone: 'acc', fill: 'box2' },
]

function RaceFigure() {
  const panels = [
    { x0: 0, title: '直す前（Checkout が確かめて update!）', steps: raceBefore, result: '残高 2,000円・支払いの合計 6,000円', resultTone: 'danger' as const },
    { x0: 395, title: '直した後（Wallet#pay! の with_lock）', steps: raceAfter, result: '残高 2,000円・支払いの合計 3,000円', resultTone: 'acc' as const },
  ]
  return (
    <Svg
      id="69-5"
      w={780}
      h={360}
      label="5,000円の残高から、2つのスレッドが同時に3,000円を支払う。直す前は、2つのスレッドが同じ時点で残高5,000円を読み、どちらも5,000円は3,000円以上なので払えると判断し、それぞれ balance を 2000 に更新する。結果は残高2,000円で、支払いの合計は6,000円になる。直した後は、Wallet#pay! の中の with_lock が SELECT … FOR UPDATE で行をロックする。スレッド1が5,000円を読んで2,000円に更新し、履歴を追加してコミットするまで、スレッド2はロックを待つ。スレッド2は2,000円を読み、InsufficientBalance を投げてロールバックする。結果は残高2,000円で、支払いの合計は3,000円になる"
    >
      {panels.map((p, k) => (
        <g key={p.title}>
          <T x={p.x0 + 10} y={18} bold fs={12}>
            {p.title}
          </T>
          <T x={p.x0 + 105} y={42} anchor="middle" fs={12}>
            スレッド1
          </T>
          <T x={p.x0 + 285} y={42} anchor="middle" fs={12}>
            スレッド2
          </T>
          <line x1={p.x0 + 105} y1={52} x2={p.x0 + 105} y2={300} stroke="var(--fig-line)" strokeDasharray="3 4" />
          <line x1={p.x0 + 285} y1={52} x2={p.x0 + 285} y2={300} stroke="var(--fig-line)" strokeDasharray="3 4" />
          {p.steps.map((s) => {
            const h = s.text.length > 1 ? 42 : 30
            if (s.lane === 2) {
              return <Box key={`${s.y}-${s.lane}`} x={p.x0 + 20} y={s.y} w={350} h={h} lines={[`${s.text[0]}（両方）`]} fs={11} fill="bg" />
            }
            const cx = s.lane === 0 ? p.x0 + 105 : p.x0 + 285
            return (
              <Box
                key={`${s.y}-${s.lane}`}
                x={cx - 85}
                y={s.y}
                w={170}
                h={h}
                lines={s.text}
                fs={11}
                fill={s.fill ?? 'box'}
                subTone={s.tone === 'danger' ? 'danger' : 'muted'}
              />
            )
          })}
          {k === 1 && <Arrow x1={p.x0 + 190} y1={160} x2={p.x0 + 200} y2={190} dashed />}
          <T x={p.x0 + 10} y={322} fs={12} tone={p.resultTone}>
            {p.result}
          </T>
        </g>
      ))}
      <line x1={388} y1={8} x2={388} y2={340} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={10} y={348} fs={11} tone="muted">
        時間は上から下へ進む。直す前は2つのスレッドが同じ残高を読んだ時点で、結果が決まっている
      </T>
    </Svg>
  )
}

/* ---------- 図 69-7 当てはめすぎの判断 ---------- */
function JudgeFigure() {
  const qx = [150, 460]
  const qy = [40, 190]
  const quads = [
    { x: qx[0], y: qy[0], lines: ['属性のまま公開する', 'ストロングパラメーターで', '受け付ける列を選ぶ'], ex: '例：名前・メモ・表示の設定', fill: 'box' as const },
    { x: qx[1], y: qy[0], lines: ['操作のメソッドだけを公開する', '書き込みは private にし、', 'DB の制約を足す'], ex: '例：残高・在庫数・ポイント', fill: 'box5' as const },
    { x: qx[0], y: qy[1], lines: ['属性のまま公開する', '形式は validates で確かめる'], ex: '例：作るときだけ入れる列', fill: 'box' as const },
    { x: qx[1], y: qy[1], lines: ['validates や1つのメソッドで', '足りることが多い', '書き込む場所が増えたら右上へ'], ex: '例：管理画面だけで変える上限額', fill: 'box' as const },
  ]
  return (
    <Svg
      id="69-7"
      w={780}
      h={400}
      label="横軸は、値に守る規則（不変条件）があるかどうか。左は規則がない、右は規則がある（ほかの列や履歴と関係する）。縦軸は、書き換える場所の数で、下が少なく、上が多い。左上（規則がなく、書き換える場所が多い）は属性のまま公開し、ストロングパラメーターで受け付ける列を選ぶ。例は名前・メモ・表示の設定。右上（規則があり、書き換える場所が多い）は操作のメソッドだけを公開し、書き込みを private にして DB の制約を足す。例は残高・在庫数・ポイント。左下（規則がなく、書き換える場所が少ない）は属性のまま公開し、形式を validates で確かめる。右下（規則があり、書き換える場所が少ない）は validates や1つのメソッドで足りることが多く、書き込む場所が増えたら右上の扱いにする"
    >
      <line x1={135} y1={30} x2={135} y2={340} stroke="var(--fig-line)" />
      <line x1={135} y1={340} x2={770} y2={340} stroke="var(--fig-line)" />
      <Arrow x1={135} y1={340} x2={135} y2={26} />
      <Arrow x1={135} y1={340} x2={774} y2={340} />
      <T x={125} y={60} anchor="end" fs={12}>
        書き換える
      </T>
      <T x={125} y={78} anchor="end" fs={12}>
        場所が多い
      </T>
      <T x={125} y={300} anchor="end" fs={12}>
        少ない
      </T>
      <T x={300} y={362} anchor="middle" fs={12}>
        守る規則がない
      </T>
      <T x={610} y={362} anchor="middle" fs={12}>
        守る規則（不変条件）がある
      </T>
      <T x={455} y={388} anchor="middle" fs={11} tone="muted">
        規則があるかは「この値だけを変えると、ほかの値や履歴と矛盾するか」で判断する
      </T>
      {quads.map((q) => (
        <g key={q.ex}>
          <Box x={q.x} y={q.y} w={295} h={110} lines={q.lines} fs={12} fill={q.fill} bold subTone="muted" />
          <T x={q.x + 8} y={q.y + 128} fs={11} tone="muted">
            {q.ex}
          </T>
        </g>
      ))}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 71,
  part: 8,
  title: 'Encapsulation（カプセル化）：残高を外から直接書き換えさせない',
  summary:
    'プリペイドのウォレットの残高を5か所が update(balance: …) で書き換え、残高がマイナスになり、履歴と食い違う場面から始めます。残高を変える操作を Wallet のメソッドにまとめ、書き込みを private にし、ストロングパラメーターと DB の CHECK 制約を組み合わせて、Active Record で公開する操作を絞る方法を確かめます。',
  goals: [
    'Active Record の属性が既定で public の読み書きのメソッドになり、どのクラスからでも書き換えられることを、実行結果で説明できる',
    'カプセル化の定義（内部状態や実装の詳細を隠し、必要な操作だけを公開する）と、データ抽象からの由来、情報隠蔽との違いを説明できる',
    '残高のように不変条件を持つ列を、操作のメソッド・private の書き込み・ロック・履歴で守るように直せる',
    'update_column や update_all のような検証を通らない書き込みを、DB の CHECK 制約で止められることと、止められない書き込みがあることを説明できる',
    'すべての属性を隠す、テストのためだけに send で内部を書き換える、といった当てはめすぎを見分け、公開された振る舞いでテストを書ける',
  ],
  prerequisites: [11, 14, 15],
  sections: [
    {
      id: 'scene',
      title: 'ウォレットの残高を5か所で書き換えるコード',
      body: (
        <>
          <p>
            この章ではプリペイドのウォレットの残高を例に、Encapsulation（カプセル化）を扱います。Active Record のモデルでは、テーブルの列がそのまま public のメソッドになります。そのため、残高のように守るべき規則がある列でも、何もしなければアプリのどこからでも任意の値を書き込めます。この章ではその状態を実行して確かめ、Rails で公開する操作を絞る方法を順に試します。
          </p>
          <h3>そもそも何を管理するのか</h3>
          <p>
            EC サイトに、前もってお金を入れておき、買い物の支払いに使える「ウォレット」の機能があるとします。利用者はクレジットカードで5,000円を払って、ウォレットに5,000円を入れます（これをチャージと呼びます）。その後、3,000円の買い物をウォレットで支払うと、残高は2,000円になります。注文を取り消したときは、代金を残高に戻します（返金）。
          </p>
          <p>このサービスでは残高について次の2つの規則を決めています。</p>
          <ul>
            <li>残高は0円未満にしない。足りない支払いは受け付けない</li>
            <li>残高が変わるたびに、履歴（いつ・何の理由で・いくら増減したか）を1行残す。履歴の金額を合計すると、いつでも今の残高と一致する</li>
          </ul>
          <p>
            2つ目の規則があるので、問い合わせを受けたときに「なぜこの残高なのか」を履歴から説明できます。テーブルは、残高を持つ wallets と、履歴を持つ wallet_entries の2つです。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_wallets.rb"
            code={`
class CreateWallets < ActiveRecord::Migration[8.1]
  def change
    create_table :wallets do |t|
      t.string :owner_name, null: false
      t.integer :balance, null: false, default: 0 # 残高（円）
      t.timestamps
    end

    create_table :wallet_entries do |t|
      t.references :wallet, null: false, foreign_key: true
      t.string :reason, null: false          # charge / payment / refund など
      t.integer :amount, null: false         # 増えたら正、減ったら負
      t.integer :balance_after, null: false  # この記録の後の残高
      t.string :note
      t.timestamps
    end
  end
end
`}
          />
          <h3>5か所で残高を書き換えるコード</h3>
          <p>最初のコードでは、Wallet モデルは関連を宣言しているだけで、残高を変える操作を持っていません。</p>
          <Code
            lang="ruby"
            title="app/models/wallet.rb（直す前）"
            code={`
class Wallet < ApplicationRecord
  has_many :entries, -> { order(:id) }, class_name: "WalletEntry", inverse_of: :wallet
end
`}
          />
          <p>残高を変える処理は、機能ごとに別の人が書いたので、5つのファイルに分かれています。どれも <code>update!(balance: …)</code> で残高の列を直接書き換えています。</p>
          <Code
            lang="ruby"
            title="app/services/charge.rb と app/services/checkout.rb（直す前）"
            code={`
# ① チャージ：利用者がカードで支払い、残高を増やす
class Charge
  def self.call(wallet, amount)
    wallet.update!(balance: wallet.balance + amount)
    wallet.entries.create!(reason: "charge", amount: amount, balance_after: wallet.balance)
  end
end

# ② 支払い：買い物の代金を残高から引く
class Checkout
  class InsufficientBalance < StandardError; end

  def self.call(wallet, total)
    raise InsufficientBalance, "残高が足りません" if wallet.balance < total

    wallet.update!(balance: wallet.balance - total)
    wallet.entries.create!(reason: "payment", amount: -total, balance_after: wallet.balance)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/jobs/refund_job.rb と app/jobs/charge_cancellation_job.rb（直す前）"
            code={`
# ③ 返金：注文の取り消しで代金を残高に戻す
class RefundJob < ApplicationJob
  def perform(wallet_id, amount)
    wallet = Wallet.find(wallet_id)
    wallet.update!(balance: wallet.balance + amount)
    wallet.entries.create!(reason: "refund", amount: amount, balance_after: wallet.balance)
  end
end

# ④ チャージの取り消し：カード会社が決済を取り消したら、チャージした分を残高から引く
class ChargeCancellationJob < ApplicationJob
  def perform(wallet_id, amount)
    wallet = Wallet.find(wallet_id)
    wallet.update!(balance: wallet.balance - amount)
    wallet.entries.create!(reason: "charge_cancellation", amount: -amount, balance_after: wallet.balance)
  end
end
`}
          />
          <p>
            ④ は、カード会社がチャージの決済を取り消したとき（不正利用の申し立てなど）に動くジョブです。⑤ は、問い合わせに対応する担当者が使う管理画面です。名前と残高を、フォームから送られた値でそのまま更新します。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/admin/wallets_controller.rb（直す前）"
            code={`
# ⑤ 管理画面：問い合わせの対応で、担当者が名前や残高を直す
class Admin::WalletsController < ApplicationController
  def update
    wallet = Wallet.find(params[:id])
    if wallet.update(wallet_params)
      render json: { id: wallet.id, owner_name: wallet.owner_name, balance: wallet.balance }
    else
      render json: { errors: wallet.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def wallet_params
    params.require(:wallet).permit(:owner_name, :balance)
  end
end
`}
          />
          <p>
            図 69-1 は5か所と2つの規則の関係です。残高が足りるかを確かめているのは ② の Checkout だけで、履歴を残していないのは ⑤ の管理画面です。規則がどこにも1か所にまとまっておらず、書き換える側がそれぞれ覚えていなければなりません。
          </p>
          <Figure n="69-1" title="残高を書き換える5か所" caption="網かけの箱が、規則を守っていない呼び出し側。どの呼び出し側も Wallet の update!(balance: …) を直接呼ぶ。">
            <SceneFigure />
          </Figure>
          <h3>順に実行すると</h3>
          <p>
            5か所を順に呼ぶスクリプトを、Docker の Rails 8.1.4.1・Ruby 4.0.9・MySQL 8.4 で <code>bin/rails runner</code> を使って実行しました。管理画面は <code>ActionDispatch::Integration::Session</code>（request spec と同じ仕組みで、アプリに HTTP のリクエストを送るクラス）で PATCH を送っています。
          </p>
          <Code
            lang="ruby"
            title="script/scene.rb"
            code={`
wallet = Wallet.create!(owner_name: "佐藤")
show = ->(label) { puts "#{label} → 残高 #{wallet.reload.balance}円" }

Charge.call(wallet, 5_000)
show.("① チャージ 5,000円")
Checkout.call(wallet, 4_000)
show.("② 支払い 4,000円")
RefundJob.perform_now(wallet.id, 1_000)
show.("③ 返金 1,000円")
ChargeCancellationJob.perform_now(wallet.id, 5_000)
show.("④ チャージの取り消し 5,000円")

admin = ActionDispatch::Integration::Session.new(Rails.application)
admin.patch "/admin/wallets/#{wallet.id}", params: { wallet: { balance: 0 } }
show.("⑤ 管理画面で残高を 0円に")
# …（省略：履歴を表示する）
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene.rb）"
            code={`
① チャージ 5,000円 → 残高 5000円
② 支払い 4,000円 → 残高 1000円
③ 返金 1,000円 → 残高 2000円
④ チャージの取り消し 5,000円 → 残高 -3000円
⑤ 管理画面で残高を 0円に → 残高 0円
履歴（wallet_entries）:
  charge 5000円（記録の後の残高 5000円）
  payment -4000円（記録の後の残高 1000円）
  refund 1000円（記録の後の残高 2000円）
  charge_cancellation -5000円（記録の後の残高 -3000円）
履歴の合計 -3000円 / wallets.balance 0円
`}
          />
          <p>
            ④ で残高が -3,000円になりました。利用者はチャージした5,000円のうち4,000円をすでに使っていたのに、取り消しのジョブが残高を確かめずに5,000円を引いたからです。マイナスの残高を見つけた担当者は、⑤ の管理画面で残高を0円に直しました。その結果、残高は0円なのに履歴の合計は -3,000円のままで、2つ目の規則も破れています。後から履歴を読んでも、3,000円がどこへ行ったのかを説明できません。
          </p>
          <h3>同時に2回支払うと</h3>
          <p>
            ② の Checkout は残高を確かめていますが、確かめるのは自分が読み込んだ時点の値です。5,000円の残高から3,000円の支払いを2つ、別々のスレッドで同時に実行しました。2つのスレッドはどちらも先に <code>Wallet.find</code> で残高を読み、そろってから <code>Checkout.call</code> を呼びます。2人の利用者が同じウォレットを共有していて、ほぼ同時に購入ボタンを押した場合に相当します。
          </p>
          <Code
            lang="ruby"
            title="script/race.rb（抜粋）"
            code={`
threads = 2.times.map do |i|
  Thread.new do
    ActiveRecord::Base.connection_pool.with_connection do
      wallet = Wallet.find(id) # 2つのリクエストが同じ時点の残高を読む
      ready << true
      go.pop
      Checkout.call(wallet, 3_000)
      puts "スレッド#{i + 1}: 3,000円の支払いが成功"
    rescue => e
      puts "スレッド#{i + 1}: #{e.class}: #{e.message}"
    end
  end
end
# …（省略：2つのスレッドがそろってから go に値を入れ、終わるのを待つ）
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/race.rb）"
            code={`
スレッド1: 3,000円の支払いが成功
スレッド2: 3,000円の支払いが成功
残高 2000円 / 支払いの合計 6000円
`}
          />
          <p>
            2つの支払いがどちらも成功し、5,000円の残高から6,000円を支払えてしまいました。2つのスレッドはどちらも残高を5,000円と読み、どちらも <code>balance = 2000</code> を書き込んだので、片方の更新が失われています。防ぐには行のロック（<ChapterLink n={15} section="pessimistic" />）が必要ですが、ロックを取るコードも5か所のそれぞれに書かなければなりません。
          </p>
          <h3>規則を1つ足すときの手間</h3>
          <p>
            このサービスに「残高の上限は10万円」という規則が加わったとします。残高が増えるすべての場所で上限を確かめる必要があります。残高を書き換えている場所を grep で探しました。
          </p>
          <Code
            lang="text"
            title={'実行結果（grep -rn "balance" app/ | grep -v "^app/models"。直す前）'}
            code={`
app/services/charge.rb:4:    wallet.update!(balance: wallet.balance + amount)
app/services/charge.rb:5:    wallet.entries.create!(reason: "charge", amount: amount, balance_after: wallet.balance)
app/jobs/refund_job.rb:5:    wallet.update!(balance: wallet.balance + amount)
app/jobs/refund_job.rb:6:    wallet.entries.create!(reason: "refund", amount: amount, balance_after: wallet.balance)
app/services/checkout.rb:6:    raise InsufficientBalance, "残高が足りません" if wallet.balance < total
app/services/checkout.rb:8:    wallet.update!(balance: wallet.balance - total)
app/services/checkout.rb:9:    wallet.entries.create!(reason: "payment", amount: -total, balance_after: wallet.balance)
app/jobs/charge_cancellation_job.rb:5:    wallet.update!(balance: wallet.balance - amount)
app/jobs/charge_cancellation_job.rb:6:    wallet.entries.create!(reason: "charge_cancellation", amount: -amount, balance_after: wallet.balance)
app/controllers/admin/wallets_controller.rb:6:      render json: { id: wallet.id, owner_name: wallet.owner_name, balance: wallet.balance }
app/controllers/admin/wallets_controller.rb:15:    params.require(:wallet).permit(:owner_name, :balance)
`}
          />
          <p>
            残高を増やしているのは charge.rb・refund_job.rb・admin/wallets_controller.rb の3か所で、それぞれに上限の確認を足すことになります。管理画面は <code>permit(:owner_name, :balance)</code> で残高を受け付けているので、grep で <code>update!(balance:</code> を探しても見つかりません。<code>update_column</code> や <code>update_all</code> で書き換えている場所があれば、それも探す必要があります。次に残高を書き換える機能を足す人も、この規則を知っていなければなりません。
          </p>
          <h3>Active Record の属性は既定で公開されている</h3>
          <p>
            こうなる理由は、Active Record がテーブルの列から読み書きのメソッドを自動で作り、すべて public にするからです（<ChapterLink n={11} section="accessors" />）。<code>balance</code> という名前を含む public のメソッドを数えました。
          </p>
          <Code
            lang="ruby"
            title="script/methods.rb"
            code={`
Wallet.define_attribute_methods
names = Wallet.public_instance_methods.grep(/balance/).sort
puts "balance を含む公開メソッド #{names.size} 個"
puts names.join(" ")
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/methods.rb）"
            code={`
balance を含む公開メソッド 21 個
balance balance= balance? balance_before_last_save balance_before_type_cast balance_came_from_user? balance_change balance_change_to_be_saved balance_changed? balance_for_database balance_in_database balance_previous_change balance_previously_changed? balance_previously_was balance_was balance_will_change! clear_balance_change restore_balance! saved_change_to_balance saved_change_to_balance? will_save_change_to_balance?
`}
          />
          <p>
            1つの列から21個のメソッドができ、そのうち <code>balance=</code> は値を書き込むメソッドです。このほかに、列の名前を引数で受け取って書き込むメソッドが、インスタンスとクラスの両方にあります。Rails ガイドは <code>update_column</code>・<code>update_columns</code>・<code>update_all</code>・<code>increment!</code>・<code>update_counters</code>・<code>insert_all</code> などを、検証を通らずにデータベースに保存するメソッドとして挙げています<Ref n={7} />（<ChapterLink n={14} section="skip" />）。図 69-2 はこれらをまとめたものです。
          </p>
          <Figure n="69-2" title="Active Record の属性は既定で公開される" caption="属性のメソッドの数は、Wallet で public_instance_methods を数えた結果。検証を通らないメソッドの一覧は Rails ガイドによる。">
            <ExposureFigure />
          </Figure>
          <h3>このコードの問題</h3>
          <ul>
            <li>「0円未満にしない」「履歴を残す」という規則が、書き換える側のコードに分かれて書かれています。書き忘れた ④ と ⑤ で規則が破れました。</li>
            <li>残高が足りるかを確かめても、確かめてから書き込むまでの間に別の処理が書き込めます。ロックを取るコードも、書き換える場所ごとに必要です。</li>
            <li>規則を1つ足すと、残高を書き換える場所をすべて探して直します。<code>permit(:balance)</code> のように、grep で探しにくい書き換えもあります。</li>
            <li>Active Record は列の書き込みを既定で public にするので、新しく書くコードも同じように <code>update!(balance: …)</code> と書けてしまいます。</li>
          </ul>
          <p>どの問題も残高という状態を Wallet の外から直接書き換えられることから起きています。次の節で、状態を外から直接書き換えさせず、決めた操作だけを公開する考え方を説明します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '状態を隠して操作だけを公開する：カプセル化の意味と由来',
      body: (
        <>
          <h3>カプセル化とは</h3>
          <p>
            <Term en="Encapsulation">カプセル化</Term>は、オブジェクトの内部状態や実装の詳細を外から見えないようにし、外部には必要な操作だけを公開する原則です。この章の例では、内部状態は残高（balance 列）と履歴です。外部に公開する操作は「チャージする」「支払う」「返金する」「チャージを取り消す」「理由を付けて調整する」の5つと、残高を読むことだけです。残高を任意の値にする操作は公開しません。
          </p>
          <p>
            状態を隠す目的は、状態についての規則をオブジェクトが自分で守れるようにすることです。常に成り立っていなければならない規則を<Term en="invariant">不変条件</Term>と呼びます。ウォレットの不変条件は「残高は0円以上10万円以下」「履歴の合計は残高と等しい」の2つです。状態を変える方法が公開した操作だけなら、その操作の中で不変条件を確かめれば、ほかのどこからも不変条件を破れなくなります。反対に、状態を外から直接書き換えられると、不変条件を守る責任が、書き換えるすべてのコードに広がります。前の節で起きたのはこの状態です。
          </p>
          <h3>由来：データ抽象と CLU</h3>
          <p>
            カプセル化には、1人の提唱者と1つの最初の資料があるわけではありません。考え方の由来の1つは、1970年代前半に Barbara Liskov らが研究した<Term en="data abstraction">データ抽象</Term>（抽象データ型）です。Liskov は1992年の「A History of CLU」で、データ抽象を「オブジェクトと操作の集まり」と説明しています。オブジェクトを使うプログラムは操作を呼ぶことでしか状態を見たり変えたりできず、状態を保存する表現は使う側から見えない（カプセル化されている）と書いています<Ref n={1} />。同じ箇所で、カプセル化の重要な利点として、使う側のプログラムを変えずに実装の判断を変えられることを挙げています<Ref n={1} />。
          </p>
          <p>
            Liskov と Steve Zilles はこの考え方を1974年の論文「Programming with Abstract Data Types」にまとめ、Liskov らはそれを言語の機能として持つ CLU を作りました<Ref n={1} />。Liskov は、Simula 67 のクラスは手続きと変数をまとめていたが、カプセル化を強制しなかったと述べています<Ref n={1} />。カプセル化は規則を書いておくだけでなく、言語やフレームワークの仕組みで「操作を通らない書き換え」をできなくすることを含む考え方だと言えます。
          </p>
          <h3>情報隠蔽との違い</h3>
          <p>
            よく似た原則に Information Hiding（情報隠蔽、<ChapterLink n={73} />）があります。情報隠蔽は David Parnas が1972年に示した、変わりうる設計判断をモジュールの中に隠すという考え方です。Liskov は同じ資料で、モジュールを独立させるにはカプセル化と仕様の2つが必要だと書き、Parnas がほかのモジュールのプログラマーからコードそのものを隠すことを主張したのに対して、それは行き過ぎだという立場を示しています<Ref n={1} />。
          </p>
          <p>
            Martin Fowler も、カプセル化の要点はデータを隠すことではなく、設計の判断、特に変わるかもしれない判断を隠すことだと述べています<Ref n={2} />。この本では2つを次のように区別します。
          </p>
          <ul>
            <li>カプセル化：状態を操作の内側に置き、不変条件を守る操作だけを公開する。この章の Wallet が残高の書き込みを隠すのはこちらです。</li>
            <li>情報隠蔽：将来変わるかもしれない判断（配送業者の選び方、データの保存形式など）を隠し、変わったときに直す範囲を1つのモジュールに収める。<ChapterLink n={73} />で扱います。</li>
          </ul>
          <p>
            2つは重なることが多く、Wallet が「残高を wallets.balance に持ち、履歴を wallet_entries に持つ」という保存の形を隠していれば、それは情報隠蔽にもなります。ほかに関係の深い原則として、状態を聞いて外で判断せずにオブジェクトに頼む Tell, Don't Ask（<ChapterLink n={77} />）と、不変条件を明示する Design by Contract（<ChapterLink n={80} />）があります。
          </p>
          <h3>公開する操作と隠す状態</h3>
          <p>
            図 69-3 は直した後の Wallet の境界です。呼び出し側が使えるのは左の列の操作だけで、残高の書き込み <code>balance=</code> と、ロック・確認・履歴の追加を行う <code>change_balance!</code> は private にします。不変条件は Wallet の中の1か所で確かめます。
          </p>
          <Figure n="69-3" title="公開する操作と隠す状態" caption="破線の箱は private のメソッドと、コードの中で守る取り決め（不変条件）。">
            <BoundaryFigure />
          </Figure>
          <h3>Ruby と Active Record でのカプセル化</h3>
          <p>
            Ruby のオブジェクトのインスタンス変数（<code>@balance</code> など）は、メソッドを通さなければ外から読み書きできません。メソッドには public・protected・private の3つの公開範囲があり、private のメソッドはレシーバーを付けずに呼ぶか、レシーバーに <code>self</code> を書いた場合だけ呼べます。それ以外のレシーバーで呼ぶと NoMethodError になります<Ref n={5} />。
          </p>
          <p>
            ただし、Ruby の private で外からの呼び出しをすべて止められるわけではありません。<code>send</code> は private のメソッドも呼べます。<code>public_send</code> は public のメソッドだけを呼びます<Ref n={6} />。Rails Doctrine の「Provide sharp knives」は、Ruby が既存のクラスやメソッドを変えられる強力な機能を意図して持っていて、その使い方を禁止ではなく規約と教育で導くと述べています<Ref n={4} />。Ruby でのカプセル化は、誤って規則を破るコードを書けなくすることが目的で、意図して迂回するコードまでは止められません。迂回するコードがあっても守りたい不変条件は、データベースの制約でも守ります。この点は次の節で実行して確かめます。
          </p>
          <p>
            Active Record のモデルでは、列から作られた書き込みのメソッドが既定で public です（図 69-2）。Fowler は Active Record パターンを、テーブルの1行を表し、データベースへのアクセスを内部で行い、そのデータに業務のロジックを加えるオブジェクトと定義しています<Ref n={3} />。行の列を属性として外に見せるのはこのパターンの設計で、Rails はそれを既定にしています。したがって Rails では、すべての列を隠すのではなく、不変条件を持つ列を選んで書き込みを絞るのが現実的です。どの列を選ぶかは「当てはめすぎたとき」の節で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'apply',
      title: '残高を変える操作を Wallet にまとめ、書き込みを絞る',
      body: (
        <>
          <h3>直す順序</h3>
          <p>一度に全部を書き換えると、どの変更で何が動かなくなったのかがわからなくなります。次の順に、1つずつテストを通しながら進めます。</p>
          <ol>
            <li>Wallet に残高を変える操作（<code>charge!</code>・<code>pay!</code>・<code>refund!</code>・<code>cancel_charge!</code>・<code>adjust!</code>）を足し、規則・ロック・履歴の追加をその中に書く。この時点では呼び出し側を変えないので、今の動作は変わらない</li>
            <li>呼び出し側を1か所ずつ、足した操作を呼ぶように書き換える。1か所ごとにテストを通す</li>
            <li><code>balance=</code> を private にする。書き換え忘れた場所はテストで NoMethodError か UnknownAttributeError になるので、見つけて直す</li>
            <li>管理画面のストロングパラメーターから <code>balance</code> を外し、金額と理由を受け取る調整の操作を別に用意する</li>
            <li>マイナスになっている既存のデータを直してから、DB に CHECK 制約を足す</li>
            <li>履歴を作った後は変更できないようにする</li>
          </ol>
          <h3>1. Wallet に操作を足す</h3>
          <p>
            残高を変える処理は private の <code>change_balance!</code> の1か所に集めます。公開する5つの操作は金額の符号と理由を決めて <code>change_balance!</code> を呼ぶだけです。<code>with_lock</code> はトランザクションを始め、<code>SELECT … FOR UPDATE</code> で行を読み直してロックしてから、ブロックを実行します<Ref n={14} />。
          </p>
          <Code
            lang="ruby"
            title="app/models/wallet.rb（直した後）"
            code={`
class Wallet < ApplicationRecord
  class InsufficientBalance < StandardError; end
  class LimitExceeded < StandardError; end

  MAX_BALANCE = 100_000 # 残高の上限（円）

  has_many :entries, -> { order(:id) }, class_name: "WalletEntry", inverse_of: :wallet

  validates :balance, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: MAX_BALANCE }

  # ---- 外に公開する操作 ----
  def charge!(amount)
    change_balance!(positive(amount), reason: "charge")
  end

  def pay!(amount)
    change_balance!(-positive(amount), reason: "payment")
  end

  def refund!(amount)
    change_balance!(positive(amount), reason: "refund")
  end

  def cancel_charge!(amount)
    change_balance!(-positive(amount), reason: "charge_cancellation")
  end

  # 管理画面からの調整。増やすときは正、減らすときは負の金額と、理由を受け取る
  def adjust!(amount, note:)
    raise ArgumentError, "調整の理由を入力してください" if note.blank?
    raise ArgumentError, "0円の調整はできません" if amount.zero?

    change_balance!(amount, reason: "adjustment", note: note)
  end

  private

  # 残高の書き込みは、このクラスの中からだけ行う
  def balance=(value)
    super
  end

  def positive(amount)
    raise ArgumentError, "金額は1円以上の整数にしてください: #{amount.inspect}" unless amount.is_a?(Integer) && amount.positive?

    amount
  end

  def change_balance!(delta, reason:, note: nil)
    with_lock do # SELECT ... FOR UPDATE で読み直してから計算する
      new_balance = balance + delta
      raise InsufficientBalance, "残高が足りません（残高 #{balance}円、#{-delta}円を引こうとした）" if new_balance.negative?
      raise LimitExceeded, "残高の上限 #{MAX_BALANCE}円を超えます" if new_balance > MAX_BALANCE

      self.balance = new_balance
      save!
      entries.create!(reason: reason, amount: delta, balance_after: new_balance, note: note)
    end
    self
  end
end
`}
          />
          <p>このコードで決めていることは次のとおりです。</p>
          <ul>
            <li>公開する操作の引数は「1円以上の整数」に限ります。<code>pay!(-3000)</code> のような負の金額で、支払いのつもりが残高を増やす事故を防ぐためです。増やすか減らすかはメソッドの名前で決まります。</li>
            <li>上限（10万円）の確認は <code>change_balance!</code> の1か所だけにあります。前の節で3か所に足す必要があった規則が、1行で済みます。</li>
            <li>残高の更新と履歴の追加は同じトランザクションの中で行います。どちらかが失敗すれば両方とも取り消されるので、履歴の合計と残高がずれません。</li>
            <li><code>validates</code> は残っていますが、これは <code>change_balance!</code> を通らない書き込み（後で試す <code>[]=</code> など）に対する確認です。</li>
          </ul>
          <h3>2. 呼び出し側を書き換える</h3>
          <p>呼び出し側はどれも Wallet の操作を1つ呼ぶだけになります。</p>
          <Code
            lang="ruby"
            title="app/services/charge.rb・app/services/checkout.rb・app/jobs/*.rb（直した後）"
            code={`
class Charge
  def self.call(wallet, amount)
    wallet.charge!(amount)
  end
end

class Checkout
  def self.call(wallet, total)
    wallet.pay!(total)
  end
end

class RefundJob < ApplicationJob
  def perform(wallet_id, amount)
    Wallet.find(wallet_id).refund!(amount)
  end
end

class ChargeCancellationJob < ApplicationJob
  def perform(wallet_id, amount)
    Wallet.find(wallet_id).cancel_charge!(amount)
  end
end
`}
          />
          <p>
            中の処理がここまで少なくなると、Charge と Checkout のクラスを残す理由はほとんどありません。呼び出し側が <code>wallet.charge!(amount)</code> を直接呼んでもかまいません。この章では呼び出し側の差分を小さくするためにクラスを残しています。
          </p>
          <h3>3. 書き込みを private にする</h3>
          <p>
            Wallet の <code>balance=</code> を private で定義し直し、中で <code>super</code> を呼んでいます。Active Record は属性のメソッドを、モデルのクラスではなく、クラスが include する別のモジュールに作ります。そのため、クラスに同じ名前のメソッドを書くとそちらが先に呼ばれ、<code>super</code> で Active Record のメソッドを呼べます。
          </p>
          <p>
            クラスの本体に <code>private :balance=</code> とだけ書く方法は使えません。属性のメソッドは最初に使われるときに作られるので、クラスを読み込む時点ではまだ存在しないからです。
          </p>
          <Code
            lang="text"
            title="実行結果（クラスの本体に private :balance= と書いたクラスを読み込む）"
            code={`
/work/ch71/script/private_symbol.rb:3:in 'Module#private': undefined method 'balance=' for class 'PrivateSymbolWallet' (NameError)
`}
          />
          <p>
            <code>balance=</code> を private にすると、<code>update(balance: …)</code> も使えなくなります。Active Model の一括代入は、属性ごとに <code>public_send("balance=", 値)</code> を呼び、NoMethodError になったときに、そのメソッドに応答しなければ UnknownAttributeError を投げるからです<Ref n={9} />。書き換え忘れた呼び出し側は、テストを実行すると例外で見つかります。
          </p>
          <h3>4. 管理画面で残高を受け付けない</h3>
          <p>
            <Term en="Strong Parameters">ストロングパラメーター</Term>は、リクエストのパラメーターのうち、コントローラーで <code>permit</code> した項目だけを一括代入に使えるようにする Action Controller の仕組みです。Rails ガイドは、利用者が重要な属性を誤って更新するのを防ぐためのものと説明しています<Ref n={8} />（<ChapterLink n={10} section="params" />）。管理画面の更新では名前だけを permit し、残高の調整は金額と理由を受け取る別のアクションにします。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/admin/wallets_controller.rb と adjustments_controller.rb（直した後）"
            code={`
# ⑤ 管理画面：名前の変更だけを受け付ける。残高は adjustments で調整する
class Admin::WalletsController < ApplicationController
  def update
    wallet = Wallet.find(params[:id])
    if wallet.update(params.require(:wallet).permit(:owner_name))
      render json: { id: wallet.id, owner_name: wallet.owner_name, balance: wallet.balance }
    else
      render json: { errors: wallet.errors.full_messages }, status: :unprocessable_content
    end
  end
end

# ⑤ 管理画面：残高の調整は、金額と理由を受け取って Wallet#adjust! に頼む
class Admin::AdjustmentsController < ApplicationController
  def create
    wallet = Wallet.find(params[:wallet_id])
    wallet.adjust!(Integer(params.require(:amount)), note: params.require(:note))
    render json: { id: wallet.id, balance: wallet.balance }, status: :created
  rescue Wallet::InsufficientBalance, Wallet::LimitExceeded, ArgumentError => e
    render json: { error: e.message }, status: :unprocessable_content
  end
end
`}
          />
          <Code
            lang="ruby"
            title="config/routes.rb"
            code={`
Rails.application.routes.draw do
  namespace :admin do
    resources :wallets, only: :update do
      resources :adjustments, only: :create
    end
  end
end
`}
          />
          <p>
            permit していないパラメーターが送られたときの扱いは、<code>config.action_controller.action_on_unpermitted_parameters</code> で決まります。設定しなければ、開発環境とテスト環境ではログに出し（<code>:log</code>）、本番では何もしません（<code>false</code>）<Ref n={10} />。どちらの場合も、その項目は無視されます。
          </p>
          <h3>5. DB に CHECK 制約を足す</h3>
          <p>
            <Term en="CHECK constraint">CHECK 制約</Term>は、行が満たすべき条件をテーブルに登録し、条件が偽になる INSERT や UPDATE をデータベースが拒否する仕組みです。MySQL 8.4 では、CHECK 制約は INSERT・UPDATE・REPLACE・LOAD DATA などで評価され、偽になればエラーになります<Ref n={13} />。Rails のマイグレーションでは <code>add_check_constraint</code> で足します。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000002_add_balance_check_to_wallets.rb"
            code={`
class AddBalanceCheckToWallets < ActiveRecord::Migration[8.1]
  def change
    add_check_constraint :wallets, "balance >= 0", name: "wallets_balance_non_negative"
  end
end
`}
          />
          <p>
            本番のテーブルにすでにマイナスの行があると、このマイグレーションは失敗します。先にマイナスの行を調べ、履歴に調整の行を足して直してから、制約を足します。既存のデータを直す手順は<ChapterLink n={27} section="schema-and-data-repair" />で扱っています。
          </p>
          <h3>6. 履歴を変更できないようにする</h3>
          <p>
            Active Record は、<code>readonly?</code> が真を返すレコードの保存と削除を ActiveRecord::ReadOnlyRecord で止めます。保存した後の履歴で真を返すようにして、追加はできても変更と削除はできないようにします。
          </p>
          <Code
            lang="ruby"
            title="app/models/wallet_entry.rb（直した後）"
            code={`
class WalletEntry < ApplicationRecord
  belongs_to :wallet

  # 履歴は追加するだけで、作った後は変更も削除もさせない
  def readonly?
    persisted? || super
  end
end
`}
          />
          <h3>直す前と後の比較</h3>
          <p>
            図 69-4 は書き換えの経路の比較です。直す前は5か所が wallets.balance に直接書き込み、規則は呼び出し側に散らばっていました。直した後は、5か所が Wallet の操作を呼び、規則・ロック・履歴の追加は <code>change_balance!</code> の1か所にあります。
          </p>
          <Figure n="69-4" title="直す前と後の書き換えの経路" caption="直した後の矢印に添えた名前は、呼び出し側が使う Wallet の操作。">
            <BeforeAfterFigure />
          </Figure>
          <h3>同じ順に実行すると</h3>
          <p>前の節と同じ順に呼ぶスクリプトを、直した後のコードで実行しました。管理画面には残高を0にするパラメーターを含めて PATCH を送り、その後で理由を付けた調整を POST しています。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene_after.rb）"
            code={`
① チャージ 5,000円 → 残高 5000円
② 支払い 4,000円 → 残高 1000円
③ 返金 1,000円 → 残高 2000円
④ チャージの取り消し 5,000円 → Wallet::InsufficientBalance: 残高が足りません（残高 2000円、5000円を引こうとした）
⑤ PATCH /admin/wallets（balance: 0 を含む） → 200 {"id":7,"owner_name":"佐藤 花子","balance":2000}
⑤ POST /admin/wallets/:id/adjustments → 201 {"id":7,"balance":0}
履歴（wallet_entries）:
  charge 5000円（記録の後の残高 5000円）
  payment -4000円（記録の後の残高 1000円）
  refund 1000円（記録の後の残高 2000円）
  adjustment -2000円（記録の後の残高 0円）取り消し分の回収（問い合わせ #1234）
履歴の合計 0円 / wallets.balance 0円
`}
          />
          <p>
            ④ のチャージの取り消しは、残高が足りないので例外になり、残高は変わりませんでした。ジョブは失敗として記録されるので、担当者が気づけます。取り消された5,000円のうち残高から回収できない分をどう扱うか（利用者に請求するか、損失として処理するか）は業務で決めることで、Wallet が決めることではありません。Wallet が守るのは「0円未満にしない」という規則だけです。
          </p>
          <p>
            ⑤ の PATCH では名前だけが変わり、送られた <code>balance: 0</code> は無視されました。テストのログには <code>Unpermitted parameter: :balance</code> が出ています。担当者は調整の画面から、理由を付けて2,000円を減らしました。履歴の合計（0円）と残高（0円）は一致していて、なぜ0円になったかを履歴から説明できます。
          </p>
          <h3>同時の支払いを確かめる</h3>
          <p>前の節と同じ同時の支払いを、直した後のコードで実行しました。Checkout は <code>wallet.pay!</code> を呼ぶだけになっています。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/race.rb。直した後）"
            code={`
スレッド1: 3,000円の支払いが成功
スレッド2: Wallet::InsufficientBalance: 残高が足りません（残高 2000円、3000円を引こうとした）
残高 2000円 / 支払いの合計 3000円
`}
          />
          <p>
            図 69-5 は直す前と後のタイムラインです。直した後は、スレッド2の <code>SELECT … FOR UPDATE</code> がスレッド1のコミットまで待ち、2,000円を読んでから判断します。ロックを取るコードは <code>change_balance!</code> の1か所にしかありませんが、5か所のどの呼び出し側の操作もこのコードを通ります。状態を変える経路を1つにしたので、ロックも1か所に書けば済みます。行のロックの詳細は<ChapterLink n={15} section="pessimistic" />と<ChapterLink n={38} section="lost-update-fix" />で扱っています。
          </p>
          <Figure n="69-5" title="同時の支払いのタイムライン" caption="5,000円の残高から、2つのスレッドが3,000円ずつ支払う。破線の矢印は、ロックが外れるのを待ってから読み直すことを表す。">
            <RaceFigure />
          </Figure>
          <h3>操作を通らない書き込みを試す</h3>
          <p>
            Ruby の private と Active Record の検証で、どこまでの書き込みを止められるかを確かめます。残高2,000円のウォレットに対して、残高を -1,000円にしようとする書き方を1つずつ試し、そのたびにロールバックしました。比べるために、直す前のコード（private も検証も CHECK 制約もない）でも同じスクリプトを実行しています。
          </p>
          <Code
            lang="ruby"
            title="script/bypass.rb（抜粋）"
            code={`
attempts = {
  "update(balance: -1000)"                  => ->(w) { w.update(balance: -1000) },
  "balance = -1000; save"                   => ->(w) { w.balance = -1000; w.save },
  "send(:balance=, -1000); save"            => ->(w) { w.send(:balance=, -1000); w.save },
  "[:balance] = -1000; save"                => ->(w) { w[:balance] = -1000; w.save },
  "update_column(:balance, -1000)"          => ->(w) { w.update_column(:balance, -1000) },
  "update_columns(balance: -1000)"          => ->(w) { w.update_columns(balance: -1000) },
  "decrement!(:balance, 3000)"              => ->(w) { w.decrement!(:balance, 3000) },
  "Wallet.where(id:).update_all(...)"       => ->(w) { Wallet.where(id: w.id).update_all(balance: -1000) },
  "Wallet.update_counters(id, balance: -3000)" => ->(w) { Wallet.update_counters(w.id, balance: -3000) },
  "update_column(:balance, 9999)"           => ->(w) { w.update_column(:balance, 9999) },
}
# …（省略：1つずつトランザクションの中で実行し、結果を表示してロールバックする）
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/bypass.rb。直した後）"
            code={`
update(balance: -1000)                       → ActiveModel::UnknownAttributeError: unknown attribute 'balance' for Wallet.
balance = -1000; save                        → NoMethodError: private method 'balance=' called for an instance of Wallet
send(:balance=, -1000); save                 → 戻り値 false、DB の残高 2000円
[:balance] = -1000; save                     → 戻り値 false、DB の残高 2000円
update_column(:balance, -1000)               → ActiveRecord::CheckViolation: Mysql2::Error: Check constraint 'wallets_balance_non_negative' is v...
update_columns(balance: -1000)               → ActiveRecord::CheckViolation: Mysql2::Error: Check constraint 'wallets_balance_non_negative' is v...
decrement!(:balance, 3000)                   → ActiveRecord::CheckViolation: Mysql2::Error: Check constraint 'wallets_balance_non_negative' is v...
Wallet.where(id:).update_all(...)            → ActiveRecord::CheckViolation: Mysql2::Error: Check constraint 'wallets_balance_non_negative' is v...
Wallet.update_counters(id, balance: -3000)   → ActiveRecord::CheckViolation: Mysql2::Error: Check constraint 'wallets_balance_non_negative' is v...
update_column(:balance, 9999)                → 戻り値 true、DB の残高 9999円
`}
          />
          <p>
            直す前のコードでは、10通りすべてで DB の残高が -1,000円（最後の行は 9,999円）になりました。直した後の結果を、止めた仕組みごとにまとめたのが図 69-6 です。
          </p>
          <Figure n="69-6" title="書き込みの方法ごとの結果と、止めた仕組み" caption="残高2,000円のウォレットで、-1,000円にしようとした結果（最後の行だけ 9,999円）。直す前はどれも書き込めた。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">書き方</th>
                    <th scope="col">直した後の結果</th>
                    <th scope="col">止めた仕組み</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row"><code>update(balance: …)</code>・<code>new(balance: …)</code></th>
                    <td>UnknownAttributeError</td>
                    <td>private の <code>balance=</code>（一括代入は public のメソッドだけを呼ぶ）</td>
                  </tr>
                  <tr>
                    <th scope="row"><code>wallet.balance = …</code></th>
                    <td>NoMethodError</td>
                    <td>private の <code>balance=</code></td>
                  </tr>
                  <tr>
                    <th scope="row"><code>send(:balance=, …)</code> と save</th>
                    <td>save が false（書き込まれない）</td>
                    <td>validates（private は send で迂回された）</td>
                  </tr>
                  <tr>
                    <th scope="row"><code>wallet[:balance] = …</code> と save</th>
                    <td>save が false（書き込まれない）</td>
                    <td>validates（<code>[]=</code> は public のまま）</td>
                  </tr>
                  <tr>
                    <th scope="row"><code>update_column</code>・<code>update_columns</code>・<code>decrement!</code></th>
                    <td>CheckViolation</td>
                    <td>DB の CHECK 制約（検証を通らない）</td>
                  </tr>
                  <tr>
                    <th scope="row"><code>update_all</code>・<code>update_counters</code></th>
                    <td>CheckViolation</td>
                    <td>DB の CHECK 制約（SQL の UPDATE を直接送る）</td>
                  </tr>
                  <tr>
                    <th scope="row"><code>update_column(:balance, 9999)</code></th>
                    <td>書き込まれる</td>
                    <td>止められない（条件を満たす値で、履歴を残さない書き込み）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>この結果から、3つの仕組みがそれぞれ別の範囲を受け持っていることがわかります。</p>
          <ul>
            <li>private の <code>balance=</code> は、普通に書いたコード（<code>update(balance: …)</code> や代入）を止めます。新しく書くコードが誤って規則を迂回するのを防ぐのはこの層です。</li>
            <li><code>validates</code> は、<code>send</code> や <code>[]=</code> で値を入れても、<code>save</code> を通るなら止めます。</li>
            <li>CHECK 制約は、検証を通らないメソッドや SQL も含めて、「0円以上」という条件だけを止めます。<code>increment!</code>・<code>decrement!</code> は中で <code>update_counters</code> を呼んで SQL の UPDATE を送るので、検証を通りません<Ref n={11} />。</li>
          </ul>
          <p>
            最後の行のように、条件を満たす値を <code>update_column</code> で書き込むことは、どの層でも止められません。履歴の合計と残高が等しいという不変条件は、CHECK 制約では表せないからです。ここから先は、検証を通らないメソッドを使っている場所を、レビューや静的な検査で見つけることになります。方法は「Rails の機能・規約との関係」の節で扱います。
          </p>
          <Callout kind="v72">
            <p>
              <code>ActiveRecord::CheckViolation</code> は Rails 8.1.0 で加わった例外のクラスで、MySQL のエラー番号 3819 を変換します<Ref n={12} />。Rails 7.2 までは、CHECK 制約の違反は <code>ActiveRecord::StatementInvalid</code>（原因は Mysql2::Error）として届くので、rescue やテストでは StatementInvalid を指定します。
            </p>
            <p>
              また、コントローラーの <code>status: :unprocessable_content</code> は Rack 3.1 で加わった名前です。Rack 3.0 以前を使っている場合は <code>:unprocessable_entity</code> と書きます。
            </p>
          </Callout>
          <h3>公開した振る舞いでテストする</h3>
          <p>
            テストは公開した操作を呼んで結果を確かめます。テストのデータの残高も <code>balance</code> を直接書かずに <code>charge!</code> で用意します。こうすると、テストのデータにも履歴が残り、本番と同じ規則を通ったデータでテストできます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/wallet_spec.rb（抜粋）"
            code={`
RSpec.describe Wallet do
  # 残高は公開している操作（charge!）で用意する。balance を直接書かない
  let(:wallet) { Wallet.create!(owner_name: "佐藤").charge!(5_000) }

  it "残高を超える支払いは例外になり、残高も履歴も変わらない" do
    expect { wallet.pay!(6_000) }.to raise_error(Wallet::InsufficientBalance)
    expect(wallet.reload.balance).to eq 5_000
    expect(wallet.entries.pluck(:reason)).to eq ["charge"]
  end

  it "履歴の合計と残高がいつも一致する" do
    wallet.pay!(4_000)
    wallet.refund!(1_000)
    wallet.adjust!(-500, note: "誤ったチャージの回収")
    expect(wallet.entries.sum(:amount)).to eq wallet.reload.balance
  end

  it "残高は属性の代入では変えられない" do
    expect { wallet.update(balance: 0) }.to raise_error(ActiveModel::UnknownAttributeError)
  end

  it "DB の制約が、検証を通らない書き込みでもマイナスを防ぐ" do
    expect { Wallet.where(id: wallet.id).update_all(balance: -1) }.to raise_error(ActiveRecord::CheckViolation)
  end
  # …（省略：支払い・上限・金額の確認・履歴の変更）
end
`}
          />
          <p>
            このほかに、同時の支払いで1つだけが成功すること（2つのスレッドと2つの DB 接続を使うので、このファイルだけ <code>use_transactional_tests = false</code> にしています）と、管理画面の request spec を書きました。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec）"
            code={`
.............

Finished in 0.32835 seconds (files took 2.38 seconds to load)
13 examples, 0 failures
`}
          />
        </>
      ),
    },
    {
      id: 'overuse',
      title: '当てはめすぎたとき：すべてを隠すと使えなくなる',
      body: (
        <>
          <h3>規則のない属性まで private にする</h3>
          <p>
            残高の書き込みを private にしてうまくいったので、すべての属性で同じことをしようと考えるかもしれません。次のクラスは名前（owner_name）の書き込みも private にし、名前を変える専用のメソッドを用意したものです。比べるために、同じ wallets テーブルを使う別のクラスとして書きました。
          </p>
          <Code
            lang="ruby"
            title="app/models/strict_wallet.rb（当てはめすぎの例）"
            code={`
# 当てはめすぎの例：守る規則のない名前まで、書き込みを private にした
class StrictWallet < ApplicationRecord
  self.table_name = "wallets"

  def self.open!(owner_name)
    wallet = new
    wallet.rename!(owner_name)
    wallet
  end

  def rename!(new_name)
    self.owner_name = new_name
    save!
  end

  private

  def owner_name=(value)
    super
  end

  def balance=(value)
    super
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/overuse.rb）"
            code={`
StrictWallet.create!(owner_name: "佐藤") → ActiveModel::UnknownAttributeError: unknown attribute 'owner_name' for StrictWallet.
StrictWallet.open!("佐藤") → 佐藤
wallet.update(params.require(:wallet).permit(:owner_name)) → ActiveModel::UnknownAttributeError: unknown attribute 'owner_name' for StrictWallet.
send(:balance=, 5000) で用意したテストのデータ → 残高 5000円、履歴 0件
`}
          />
          <p>
            名前には「残高と矛盾しない」のような規則がありません。それでも書き込みを private にしたので、<code>create!(owner_name: …)</code> も、ストロングパラメーターを使ったフォームの更新も UnknownAttributeError になりました。<code>form_with model:</code> とストロングパラメーターで画面を作る Rails の書き方が使えなくなり、名前を変える画面のために専用のメソッドとコントローラーの処理を書くことになります。守る規則がない属性を隠しても、防げる不具合はなく、書くコードだけが増えます。
          </p>
          <h3>テストのためだけに内部を開ける</h3>
          <p>
            実行結果の最後の行はテストのデータを用意するために <code>send(:balance=, 5000)</code> を使った場合です。残高は5,000円になりましたが、履歴は0件です。このデータは「履歴の合計と残高が等しい」という不変条件を破っていて、本番では起きない状態でテストしていることになります。また、テストが private のメソッドの名前に依存するので、残高の持ち方を変えると、振る舞いが同じでもテストが失敗するようになります。
          </p>
          <p>
            カプセル化によって、テストで使える操作も限られます。テストのためだけに内部の実装を公開せず、公開された振る舞いを通じてテストします。この章のテストでは残高を <code>charge!</code> で用意しました。公開した操作でテストのデータを作るのが難しいなら、それは公開した操作が足りないか、操作が多くのことをしすぎている兆候です。このトレードオフは<ChapterLink n={93} section="encapsulation-testing" />でも扱います。
          </p>
          <h3>読み取りまで隠す</h3>
          <p>
            「getter（値を読むメソッド）はカプセル化を破る」として、読み取りのメソッドまで消す方針もあります。Fowler は、getter を書くのは本当に必要になってからにすべきだと認めたうえで、getter をなくすことだけを目標にするのは粗い方法だと述べています。オブジェクト同士がデータを受け渡す必要がある場面は多いからです<Ref n={2} />。Wallet の残高は画面の表示や API の応答に必要なので、読み取りは公開しています。隠すべきなのは、残高を読んで外で判断し、外から書き込む流れです。
          </p>
          <h3>判断の目安</h3>
          <p>
            どの属性の書き込みを絞るかは、2つの問いで判断します。1つ目は「この値だけを変えると、ほかの値や履歴と矛盾するか」（守る規則があるか）、2つ目は「書き換える場所がいくつあるか」です。図 69-7 はこの2つを軸にした目安です。
          </p>
          <Figure n="69-7" title="書き込みを絞るかの判断の目安" caption="模式図。状態の遷移そのものが規則の列（注文の状態など）は、状態機械で遷移を絞る方法もある。">
            <JudgeFigure />
          </Figure>
          <p>次のような場合は、操作のメソッドに絞る効果が大きくなります。</p>
          <ul>
            <li>残高・在庫数・ポイントのように、値がほかの値（履歴・上限・注文）と矛盾してはいけない</li>
            <li>書き換える場所が複数あり、今後も増える（ジョブ・管理画面・API）</li>
            <li>同時に書き換えられる可能性があり、ロックが必要</li>
          </ul>
          <p>反対に、次のような場合は属性のままで足ります。</p>
          <ul>
            <li>名前・メモ・表示の設定のように、単独で正しさを判断でき、validates で形式を確かめれば十分</li>
            <li>フォームから受け取って保存するだけの属性で、ストロングパラメーターで受け付ける項目を選べば足りる</li>
            <li>作るときに一度だけ入れ、その後は変えない列。この場合は次の節の <code>attr_readonly</code> が使える</li>
          </ul>
          <p>
            状態の遷移に規則がある列（注文の「未払い → 支払い済み → 発送済み」など）は、遷移を操作のメソッドに絞るという点で同じ考え方です。Rails の enum や AASM で遷移を定義する方法は、<ChapterLink n={47} />で扱っています。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能・規約との関係',
      body: (
        <>
          <h3>Active Record は属性を公開する設計</h3>
          <p>
            前の節までで見たとおり、Active Record はテーブルの列を public の属性にします。これは Active Record パターンの設計で、行のデータとそのデータに対する業務のロジックを1つのオブジェクトに置きます<Ref n={3} />。Rails Doctrine の「No one paradigm」は、Rails の concern（Ruby のモジュールを使ってモデルに機能を足す仕組み）が個々のモデルの公開する範囲を大きく広げることが多く、それはメソッドがデータと保存に直接触れられる点で Active Record パターンに合っている、と書いています<Ref n={4} />。
          </p>
          <p>
            Rails のモデルは、外に見せる範囲が広いことを前提に作られています。そのうえでカプセル化を当てはめるなら、すべてを隠すのではなく、不変条件を持つ少数の列について書き込みを絞るのが Rails の書き方に合います。
          </p>
          <h3>公開する操作を絞る Rails の機能</h3>
          <p>この章で使った機能と、関係する機能をまとめます。どれも1つで全部を守るものではなく、守る範囲が違います。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">機能</th>
                  <th scope="col">止めるもの</th>
                  <th scope="col">止めないもの</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">書き込みのメソッドを private にする</th>
                  <td>代入と一括代入（update・new・assign_attributes）</td>
                  <td>send、<code>[]=</code>・write_attribute、検証を通らないメソッド</td>
                </tr>
                <tr>
                  <th scope="row">ストロングパラメーター（permit）</th>
                  <td>リクエストのパラメーターからの一括代入</td>
                  <td>コントローラー以外（ジョブ・コンソール・サービス）からの書き込み</td>
                </tr>
                <tr>
                  <th scope="row"><code>attr_readonly</code></th>
                  <td>作った後の代入（ReadonlyAttributeError）と update_columns</td>
                  <td>update_all などの SQL を直接送るメソッド</td>
                </tr>
                <tr>
                  <th scope="row"><code>readonly?</code>・<code>readonly!</code></th>
                  <td>レコード単位の保存と削除（ReadOnlyRecord）</td>
                  <td>update_all・delete_all などのクラスのメソッド</td>
                </tr>
                <tr>
                  <th scope="row">validates</th>
                  <td>save を通る不正な値</td>
                  <td>update_column・update_all など検証を通らないメソッド</td>
                </tr>
                <tr>
                  <th scope="row">DB の制約（CHECK・NOT NULL・一意索引・外部キー）</th>
                  <td>条件に反するすべての書き込み（SQL を含む）</td>
                  <td>条件を満たすが規則に反する書き込み（履歴を残さない変更など）</td>
                </tr>
                <tr>
                  <th scope="row">DB ユーザーの権限（GRANT）</th>
                  <td>権限のない表や列への書き込み</td>
                  <td>権限のある接続からの書き込み</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>attr_readonly</code> は、作るときに入れた後は変えない列（契約番号や作成者など）に向いています。Rails 7.1 以降の既定の設定（<code>config.load_defaults 7.1</code> 以上）では、保存済みのレコードの読み取り専用の属性に代入すると ActiveRecord::ReadonlyAttributeError になります<Ref n={16} />。この本の環境で owner_name に <code>attr_readonly</code> を付けて試すと、代入は ReadonlyAttributeError、<code>update_columns</code> は「owner_name is marked as readonly」の ActiveRecordError になり、<code>update_all</code> は書き込めました。残高のように後から変える列には使えません。
          </p>
          <p>
            DB ユーザーの権限で、アプリの接続から書ける表や列を絞る方法は、Least Privilege（<ChapterLink n={85} />）で扱います。
          </p>
          <h3>検証を通らないメソッドを見つける</h3>
          <p>
            Ruby と Rails は <code>send</code> や <code>update_all</code> のような規則を迂回できる機能を、禁止せずに提供しています。Rails Doctrine はこうした機能を取り上げるのではなく、規約と教育で使い方を導くという立場です<Ref n={4} />。そのため、迂回するコードはレビューと静的な検査で見つけます。
          </p>
          <p>
            RuboCop Rails の <code>Rails/SkipsModelValidations</code> は、Rails ガイドの「検証を通らないメソッド」に載っているメソッド（<code>update_column</code>・<code>update_columns</code>・<code>update_all</code>・<code>increment!</code>・<code>update_counters</code>・<code>insert_all</code> など）の呼び出しを指摘する検査です<Ref n={15} />。ウォレットのように規則が重要なモデルでは、この検査の指摘を、例外として認めた場所を除いてすべて確かめると、操作を迂回する書き込みを見つけやすくなります。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>属性のメソッドが作られる仕組みは<ChapterLink n={11} section="accessors" />、検証を通らないメソッドは<ChapterLink n={14} section="skip" />で扱っています。</li>
            <li>ストロングパラメーターの書き方は<ChapterLink n={10} section="params" />で扱っています。</li>
            <li>with_lock と行のロックは<ChapterLink n={15} section="pessimistic" />、更新が失われる問題は<ChapterLink n={38} section="lost-update-fix" />で扱っています。</li>
            <li>残高と履歴のように、一緒に整合させるデータのまとまりを1つのオブジェクトに変更させる考え方は、集約（<ChapterLink n={48} section="aggregate" />）と同じです。Wallet は残高と履歴をまとめる集約のルートにあたります。</li>
            <li>残高の更新と履歴の追加を、全部成功か全部失敗にする考え方は Atomicity（<ChapterLink n={84} />）で扱います。</li>
            <li>変わりうる設計判断を隠す Information Hiding は<ChapterLink n={73} />、状態を聞かずに頼む Tell, Don't Ask は<ChapterLink n={77} />で扱います。</li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          書き込みを操作のメソッドに絞るのは、ほかの値や履歴と矛盾してはいけない値で、書き換える場所が複数ある列です。この章では残高を変える経路を Wallet の操作に限り、書き込みを private にして、DB に CHECK 制約を足しました。名前のように規則のない属性は属性のまま公開しておきます。
        </>
      ),
      benefit: {
        text: <>直す前は、取り消しのジョブが残高を確かめずに5,000円を引いて残高がマイナスの 3,000円になり、同時の支払い2つで 5,000円の残高から 6,000円を支払えた。直した後は、規則・ロック・履歴の追加が change_balance! の1か所になり、同時の支払いは1つだけが成功した。</>,
        basis: <><ChapterLink n={71} section="scene" />、<ChapterLink n={71} section="apply" /></>,
      },
      cost: {
        text: <>private は send で、validates は increment! や update_column のような検証を通らないメソッドで迂回できる。条件を満たす値を update_column で書き込むことはどの層でも止められないので、検証を通らないメソッドを RuboCop とレビューで見つける作業が残る。</>,
        basis: <ChapterLink n={71} section="apply" />,
      },
      alternative: {
        text: <>名前・メモ・表示の設定は validates とストロングパラメーターで足りる。名前の書き込みまで private にした例では、create! もフォームの更新も UnknownAttributeError になった。作るときに一度だけ入れる列は attr_readonly で守る。</>,
        basis: <ChapterLink n={71} section="overuse" />,
      },
      criterion: {
        text: <>その値だけを変えると、ほかの値や履歴と矛盾するか。書き換える場所がいくつあり、今後も増えるか。同時に書き換えられ、ロックが必要か。テストのデータも公開した操作（charge!）で作れるか。</>,
        basis: <ChapterLink n={71} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Active Record は列ごとに読み書きのメソッドを作り、既定ではすべて public にします。何もしなければ、残高のように規則がある列もどこからでも任意の値にでき、規則を書き忘れた場所で不変条件が破れます。</li>
          <li>カプセル化は内部状態や実装の詳細を隠し、外部には必要な操作だけを公開する原則です。状態を変える経路を公開した操作に限れば、不変条件を確かめる場所と、ロックを取る場所が1か所になります。</li>
          <li>考え方の由来の1つは1970年代のデータ抽象で、Liskov は使う側のプログラムを変えずに実装を変えられることをカプセル化の利点として挙げています。変わりうる設計判断を隠す情報隠蔽とは重なりますが、目的が違います。</li>
          <li>Rails では操作のメソッドを足して呼び出し側を移し、書き込みのメソッドを private にし、ストロングパラメーターから外し、DB の CHECK 制約を足す、という順に絞れます。</li>
          <li>private は send で、validates は検証を通らないメソッドで迂回できます。CHECK 制約は条件に反する書き込みをすべて止めますが、条件を満たす不正な書き込みは止められないので、RuboCop とレビューで見つけます。</li>
          <li>守る規則のない属性まで隠すと、フォームや一括代入が使えなくなり、コードが増えるだけです。書き込みを絞るのは、不変条件があり、書き換える場所が多い列に限ります。</li>
          <li>テストのためだけに内部を開けず、公開した操作でテストのデータを作り、振る舞いを確かめます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'A History of CLU（MIT/LCS/TR-561）', publisher: 'Barbara Liskov / MIT Laboratory for Computer Science', url: 'https://publications.csail.mit.edu/lcs/pubs/pdf/MIT-LCS-TR-561.pdf', accessed: '2026-11-21', version: '1992年4月', note: 'データ抽象の定義（オブジェクトは操作を通してだけ扱え、表現はカプセル化される）、カプセル化の利点（使う側を変えずに実装を変えられる）、Simula 67 のクラスはカプセル化を強制しなかったこと、Liskov・Zilles の1974年の論文、Parnas の主張との違い。' },
    { title: 'GetterEradicator', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/GetterEradicator.html', accessed: '2026-11-21', version: '2006年2月22日', note: 'カプセル化の要点はデータではなく変わりうる設計判断を隠すことだという説明。getter をなくすことだけを目標にするのは粗い方法だという指摘。' },
    { title: 'Active Record', publisher: 'martinfowler.com / Martin Fowler（Patterns of Enterprise Application Architecture のカタログ）', url: 'https://martinfowler.com/eaaCatalog/activeRecord.html', accessed: '2026-11-21', note: 'Active Record パターンの定義（テーブルの行を表し、DB へのアクセスを内部で行い、業務のロジックを加えるオブジェクト）。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: '「Provide sharp knives」（強力な機能を禁止せず規約と教育で導く）と「No one paradigm」（concern がモデルの公開範囲を広げ、Active Record パターンに合うこと）。' },
    { title: 'Modules and Classes（Visibility）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/modules_and_classes_rdoc.html#label-Visibility', accessed: '2026-11-21', note: 'public・protected・private の3つの公開範囲。private はレシーバーなしか self でだけ呼べること。' },
    { title: 'Object#send・Object#public_send', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Object.html#method-i-public_send', accessed: '2026-11-21', note: 'public_send は public のメソッドだけを呼ぶこと（send は private も呼べることは Ruby 4.0.9 で実行して確かめた）。' },
    { title: 'Active Record Validations（Skipping Validations）', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_validations.html#skipping-validations', accessed: '2026-11-21', version: 'Rails 8.1', note: '検証を通らずに保存するメソッドの一覧（decrement!・increment!・insert_all・update_all・update_column・update_columns・update_counters・upsert_all など）。' },
    { title: 'Action Controller Overview（Strong Parameters）', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/action_controller_overview.html#strong-parameters', accessed: '2026-11-21', version: 'Rails 8.1', note: 'permit したパラメーターだけを一括代入に使えること。重要な属性を誤って更新するのを防ぐためのものであること。' },
    { title: 'activemodel/lib/active_model/attribute_assignment.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/attribute_assignment.rb#L67-L76`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: '一括代入が属性ごとに public_send で書き込みのメソッドを呼び、応答しなければ attribute_writer_missing（UnknownAttributeError）になること。' },
    { title: 'actionpack/lib/action_controller/railtie.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/railtie.rb#L52-L58`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'action_on_unpermitted_parameters を設定しなければ、開発・テスト環境では :log、それ以外では false になること。' },
    { title: 'activerecord/lib/active_record/persistence.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L673-L681`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'increment! が update_counters で SQL の UPDATE を送ること（decrement! は increment! を負の値で呼ぶ）。' },
    { title: 'activerecord/CHANGELOG.md（Rails 8.1.0）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/CHANGELOG.md#L913-L915`, accessed: '2026-11-21', version: 'Rails 8.1.0', note: 'ActiveRecord::CheckViolation が Rails 8.1.0 で加わったこと。MySQL のエラー 3819 からの変換は abstract_mysql_adapter.rb の 869 行目と 903〜904 行目で確かめた。' },
    { title: 'MySQL 8.4 Reference Manual: CHECK Constraints', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html', accessed: '2026-11-21', version: 'MySQL 8.4', note: 'CHECK 制約の条件が偽なら違反になること。INSERT・UPDATE・REPLACE・LOAD DATA などで評価されること。' },
    { title: 'activerecord/lib/active_record/locking/pessimistic.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/locking/pessimistic.rb#L97-L104`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'with_lock がトランザクションを始めて lock! を呼び、その中でブロックを実行すること。' },
    { title: 'Rails/SkipsModelValidations', publisher: 'RuboCop Rails Docs', url: 'https://docs.rubocop.org/rubocop-rails/latest/cops_rails.html#railsskipsmodelvalidations', accessed: '2026-11-21', note: 'Rails ガイドの検証を通らないメソッドの呼び出しを指摘すること。ForbiddenMethods の既定値の一覧。' },
    { title: 'activerecord/lib/active_record/readonly_attributes.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/readonly_attributes.rb#L14-L36`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'attr_readonly の属性に保存済みのレコードで代入すると ReadonlyAttributeError になり、raise_on_assign_to_attr_readonly で切り替えられること（load_defaults 7.1 で true になることは railties の configuration.rb の 284 行目で確かめた）。' },
  ],
}

export default chapter
