import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 63-1 場面の構成 ---------- */
const sceneRows: [string, string, string, string][] = [
  ['1', 'EmailNotification', '17字', 'sent'],
  ['2', 'SmsNotification', '13字', 'sent'],
  ['3', 'SmsNotification', '82字', 'pending'],
  ['4', 'EmailNotification', '82字', 'pending'],
  ['5', 'SmsNotification', '13字', 'pending'],
]

function SceneFigure() {
  const cols = [
    { x: 440, w: 36, head: 'id' },
    { x: 476, w: 150, head: 'type' },
    { x: 626, w: 64, head: '本文' },
    { x: 690, w: 74, head: 'status' },
  ]
  return (
    <Svg
      id="63-1"
      w={780}
      h={410}
      label="BulkDeliveryJob は毎晩3時に、Notification.pending で未送信の通知を id の順に読み、1件ずつ deliver! を呼ぶ。Notification は親のクラスで、EmailNotification と SmsNotification が継承している（STI）。EmailNotification は MailGateway に、SmsNotification は SmsGateway に送る。SmsNotification だけは本文が70文字を超えると BodyTooLong を発生させる。notifications テーブルの type 列でクラスが決まる。1晩目の後、id=1 と id=2 は sent、82字の SMS の id=3 と、その後ろの id=4・id=5 は pending のまま残る"
    >
      <Box x={20} y={16} w={250} h={50} lines={['BulkDeliveryJob', '毎晩3時に pending を id の順に送る']} fs={12} bold subTone="muted" />
      <Arrow x1={145} y1={66} x2={145} y2={104} />
      <T x={155} y={86} fs={11} tone="muted">
        1件ずつ deliver! を呼ぶ
      </T>
      <Box x={20} y={106} w={250} h={50} lines={['Notification（親）', 'deliver! で送り、sent にする']} fs={12} bold subTone="muted" />
      <Arrow x1={95} y1={216} x2={95} y2={158} />
      <Arrow d="M275,216 L275,186 L230,186 L230,158" />
      <T x={103} y={192} fs={11} tone="muted">
        継承（STI）
      </T>
      <Box x={20} y={216} w={150} h={50} lines={['EmailNotification', '長さの制限なし']} fs={12} subTone="muted" />
      <Box x={190} y={216} w={170} h={50} lines={['SmsNotification', '70文字を超えると例外']} fs={12} fill="box5" subTone="danger" />
      <Arrow x1={95} y1={266} x2={95} y2={320} />
      <Arrow x1={275} y1={266} x2={275} y2={320} />
      <Box x={20} y={322} w={150} h={40} lines="MailGateway" fs={12} fill="box4" mono />
      <Box x={190} y={322} w={170} h={40} lines="SmsGateway" fs={12} fill="box4" mono />
      <T x={20} y={388} fs={12} tone="danger">
        親が受け付ける本文のうち71文字以上で、SmsNotification だけが BodyTooLong を出す
      </T>

      <Arrow x1={272} y1={131} x2={436} y2={112} dashed />
      <T x={286} y={150} fs={11} tone="muted">
        type 列でクラスを選んで読む
      </T>
      <T x={440} y={16} fs={12} bold>
        notifications テーブル（1晩目の後）
      </T>
      {cols.map((c) => (
        <Box key={c.head} x={c.x} y={30} w={c.w} h={26} lines={c.head} fs={11} fill="box5" bold rx={0} mono={c.head !== '本文'} />
      ))}
      {sceneRows.map((r, i) => (
        <g key={r[0]}>
          {cols.map((c, k) => (
            <Box key={c.head} x={c.x} y={56 + i * 26} w={c.w} h={26} lines={r[k]} fs={11} fill={i === 2 ? 'box5' : 'bg'} rx={0} mono={k !== 2} />
          ))}
        </g>
      ))}
      <T x={440} y={204} fs={12} tone="danger">
        id=3 で例外になり、ジョブが終わる
      </T>
      <T x={440} y={224} fs={12} tone="danger">
        id=4・5 は送られずに残る
      </T>
      <T x={440} y={244} fs={12} tone="muted">
        翌晩も id=3 で止まる
      </T>
    </Svg>
  )
}

/* ---------- 図 63-2 一括送信が止まるタイムライン ---------- */
function TimelineFigure() {
  const xs = [95, 300, 505, 680]
  const names = ['BulkDeliveryJob', '通知（id=1〜5）', 'MailGateway', 'SmsGateway']
  const msgs: { y: number; from: number; to: number; text: string; ret?: boolean; danger?: boolean }[] = [
    { y: 100, from: 0, to: 1, text: 'id=1 の deliver!' },
    { y: 126, from: 1, to: 2, text: '送る' },
    { y: 166, from: 0, to: 1, text: 'id=2 の deliver!' },
    { y: 192, from: 1, to: 3, text: '送る' },
    { y: 232, from: 0, to: 1, text: 'id=3 の deliver!' },
    { y: 258, from: 1, to: 0, text: 'BodyTooLong（82文字）', ret: true, danger: true },
    { y: 368, from: 0, to: 1, text: 'id=3 の deliver!' },
    { y: 394, from: 1, to: 0, text: 'BodyTooLong（82文字）', ret: true, danger: true },
  ]
  return (
    <Svg
      id="63-2"
      w={780}
      h={450}
      label="11/22 3:00、BulkDeliveryJob は id=1 の deliver! を呼び、通知は MailGateway に送って sent になる。次に id=2 の deliver! を呼び、SmsGateway に送って sent になる。id=3 の deliver! は本文が82文字なので BodyTooLong を発生させ、ジョブは例外で終わる。id=4 と id=5 の deliver! は呼ばれない。11/23 3:00、id=1 と id=2 は sent なので読まれず、ジョブは id=3 の deliver! から始めて、同じ BodyTooLong で終わる"
    >
      {names.map((n, i) => (
        <g key={n}>
          <Box x={xs[i] - 78} y={10} w={156} h={36} lines={n} fs={12} fill={i >= 2 ? 'box4' : 'box'} accent={i === 0} mono={i !== 1} />
          <line x1={xs[i]} y1={46} x2={xs[i]} y2={430} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <T x={8} y={68} fs={12} bold>
        11/22 3:00
      </T>
      {msgs.map((m) => {
        const dir = m.to > m.from ? 1 : -1
        return (
          <g key={m.y}>
            <Arrow x1={xs[m.from]} y1={m.y} x2={xs[m.to] - 2 * dir} y2={m.y} dashed={m.ret} />
            <T x={(xs[m.from] + xs[m.to]) / 2} y={m.y - 11} anchor="middle" fs={12} tone={m.danger ? 'danger' : undefined} mono={!m.danger && m.text.includes('deliver')}>
              {m.text}
            </T>
          </g>
        )
      })}
      <T x={308} y={144} fs={11} tone="acc">
        id=1 を sent に更新
      </T>
      <T x={308} y={210} fs={11} tone="acc">
        id=2 を sent に更新
      </T>
      <Box x={20} y={272} w={160} h={30} lines="ジョブが例外で終わる" fs={12} fill="box5" />
      <T x={308} y={292} fs={12} tone="danger">
        id=4・id=5 の deliver! は呼ばれない
      </T>
      <line x1={8} y1={318} x2={770} y2={318} stroke="var(--fig-line)" />
      <T x={8} y={338} fs={12} bold>
        11/23 3:00
      </T>
      <T x={308} y={348} fs={11} tone="muted">
        id=1・2 は sent なので読まれない
      </T>
      <Box x={20} y={408} w={160} h={30} lines="同じ位置で終わる" fs={12} fill="box5" />
    </Svg>
  )
}

/* ---------- 図 63-3 サブクラスに許される変更と許されない変更 ---------- */
const ruleRows: { head: string; parent: string[]; ok: string[]; ng: string[] }[] = [
  {
    head: '事前条件',
    parent: ['保存できた pending の', '通知なら呼んでよい'],
    ok: ['同じか、より弱くする', '（受け付ける範囲を広げる）', '例：長い本文を分けて送る'],
    ng: ['より強くする（範囲を狭める）', '例：SMS が71文字以上を拒む'],
  },
  {
    head: '事後条件',
    parent: ['送信サービスに1回送り、', 'status が sent、sent_at が入る'],
    ok: ['同じか、より強くする', '（約束を足す）', '例：送信の ID も記録する'],
    ng: ['より弱くする（約束を減らす）', '例：送らずに戻る、', 'pending のまま残す'],
  },
  {
    head: '例外',
    parent: ['取り決めに書いた例外だけ', '（この章の通知では無し）'],
    ok: ['親が決めた例外か、その一部'],
    ng: ['親に無い例外を足す', '例：BodyTooLong'],
  },
  {
    head: '不変条件',
    parent: ['status が sent なら', 'sent_at が入っている'],
    ok: ['守ったうえで、条件を足す'],
    ng: ['破る', '例：sent_at を入れずに', 'sent にする'],
  },
]

function RulesFigure() {
  const cols = [
    { x: 10, w: 100, head: '条件' },
    { x: 110, w: 210, head: '親の取り決め（通知）' },
    { x: 320, w: 220, head: 'サブクラスに許される' },
    { x: 540, w: 230, head: '許されない（この章の例）' },
  ]
  const rowH = 66
  return (
    <Svg
      id="63-3"
      w={780}
      h={314}
      label={`サブクラスがメソッドを定義し直すときの規則。${ruleRows.map((r) => `${r.head}：親の取り決めは${r.parent.join('')}。サブクラスに許されるのは${r.ok.join('')}。許されないのは${r.ng.join('')}`).join('。')}`}
    >
      {cols.map((c) => (
        <Box key={c.head} x={c.x} y={10} w={c.w} h={30} lines={c.head} fs={12} fill="box5" bold rx={0} />
      ))}
      {ruleRows.map((r, i) => {
        const y = 40 + i * rowH
        return (
          <g key={r.head}>
            <Box x={cols[0].x} y={y} w={cols[0].w} h={rowH} lines={r.head} fs={12} fill="box" bold rx={0} />
            <Box x={cols[1].x} y={y} w={cols[1].w} h={rowH} lines={r.parent} fs={11} fill="bg" rx={0} align="start" />
            <Box x={cols[2].x} y={y} w={cols[2].w} h={rowH} lines={r.ok} fs={11} fill="bg" rx={0} align="start" subTone="muted" />
            <Box x={cols[3].x} y={y} w={cols[3].w} h={rowH} lines={r.ng} fs={11} fill="bg" rx={0} align="start" subTone="danger" />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 63-5 直す前と後 ---------- */
function BeforeAfterFigure() {
  return (
    <Svg
      id="63-5"
      w={780}
      h={430}
      label="直す前は、BulkDeliveryJob が SMS の長い本文を is_a? で調べて飛ばし、Notification の deliver! の中身はサブクラスがそれぞれ上書きしている。SmsNotification は送るときに長さを調べて例外を出し、update! で sent にする処理は種類ごとに書かれている。共通のテストは無く、作る処理では71文字以上の SMS も保存できる。直した後は、ジョブはどの種類にも deliver! を呼ぶだけになる。Notification の deliver! が transmit を呼んだ後に sent にし、事後条件を1か所で守る。EmailNotification と SmsNotification は transmit で送り方だけを決め、SmsNotification は本文を70文字までとする検証を持つ。共通のテスト（shared_examples）が両方のサブクラスで実行され、作る処理では71文字以上の SMS は保存できず errors に理由が入る"
    >
      <T x={20} y={18} bold>
        直す前
      </T>
      <Box x={20} y={36} w={350} h={50} lines={['BulkDeliveryJob', 'SMS の長い本文を is_a? で調べて飛ばす']} fs={12} subTone="danger" />
      <Arrow x1={195} y1={86} x2={195} y2={104} />
      <Box x={20} y={106} w={350} h={50} lines={['Notification#deliver!', '中身はサブクラスがそれぞれ上書きする']} fs={12} subTone="muted" />
      <Arrow x1={102} y1={156} x2={102} y2={194} />
      <Arrow x1={287} y1={156} x2={287} y2={194} />
      <Box x={20} y={196} w={165} h={66} lines={['EmailNotification', 'deliver! で送り、', 'update! で sent にする']} fs={12} subTone="muted" />
      <Box x={205} y={196} w={165} h={66} lines={['SmsNotification', '送るときに長さを調べ、', '70文字を超えると例外']} fs={12} subTone="danger" />
      <T x={20} y={290} fs={12} tone="muted">
        sent にする処理を種類ごとに書く
      </T>
      <T x={20} y={312} fs={12} tone="danger">
        共通のテストは無い
      </T>
      <Box x={20} y={346} w={350} h={50} lines={['作る処理（SmsNotification.create）', '71文字以上でも保存できる']} fs={12} subTone="danger" />

      <line x1={390} y1={10} x2={390} y2={420} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={410} y={18} bold>
        直した後
      </T>
      <Box x={410} y={36} w={350} h={50} lines={['BulkDeliveryJob', 'どの種類にも deliver! を呼ぶだけ']} fs={12} subTone="muted" />
      <Arrow x1={585} y1={86} x2={585} y2={104} />
      <Box x={410} y={106} w={350} h={50} lines={['Notification#deliver!', 'transmit の後に sent にする（事後条件）']} fs={12} accent subTone="muted" />
      <Arrow x1={492} y1={156} x2={492} y2={194} />
      <Arrow x1={677} y1={156} x2={677} y2={194} />
      <Box x={410} y={196} w={165} h={66} lines={['EmailNotification', 'transmit：メールで送る']} fs={12} subTone="muted" />
      <Box x={595} y={196} w={165} h={66} lines={['SmsNotification', 'transmit：SMS で送る', '検証：本文は70文字まで']} fs={12} subTone="muted" />
      <Box x={410} y={284} w={350} h={46} lines={['shared_examples「通知の取り決めを満たす」', '両方のサブクラスの spec で実行する']} fs={12} fill="box2" dashed subTone="muted" />
      <Arrow x1={492} y1={284} x2={492} y2={264} dashed />
      <Arrow x1={677} y1={284} x2={677} y2={264} dashed />
      <Box x={410} y={346} w={350} h={50} lines={['作る処理（SmsNotification.create）', '71文字以上は保存できず、errors に理由が入る']} fs={12} fill="box5" subTone="muted" />
    </Svg>
  )
}

/* ---------- 図 63-6 当てはめすぎの判断 ---------- */
function JudgeFigure() {
  const quads: { x: number; y: number; lines: string[]; fill: 'box' | 'box5' }[] = [
    { x: 92, y: 48, lines: ['継承をやめて別のモデルにする', '（delegated_type・', 'オブジェクトの組み合わせ）'], fill: 'box' },
    { x: 418, y: 48, lines: ['違いを親の取り決めに含める', '（保存前の検証・できることの', '問い合わせ）か、使う側ごとの', '小さな取り決めに分ける'], fill: 'box' },
    { x: 92, y: 208, lines: ['継承のままでよい', '取り決めのテストは', '共通の検証だけで足りる'], fill: 'box' },
    { x: 418, y: 208, lines: ['継承（STI）＋共通の取り決め', 'shared_examples を', 'すべてのサブクラスに当てる', '（この章の通知）'], fill: 'box5' },
  ]
  return (
    <Svg
      id="63-6"
      w={760}
      h={420}
      label="横軸は親の型としてまとめて扱う呼び出し側の多さ、縦軸は種類ごとの制約や振る舞いの違いの大きさ。まとめて扱う呼び出し側が多く違いが小さいなら、継承（STI）と共通の取り決めを shared_examples ですべてのサブクラスに当てる。この章の通知はここに入る。まとめて扱う側が多く違いが大きいなら、違いを親の取り決めに含める（保存前の検証、できることの問い合わせ）か、使う側ごとの小さな取り決めに分ける。まとめて扱う側が少なく違いが小さいなら、継承のままでよく、取り決めのテストは共通の検証だけで足りる。まとめて扱う側が少なく違いが大きいなら、継承をやめて別のモデルにする（delegated_type、オブジェクトの組み合わせ）"
    >
      <T x={20} y={20} fs={12} bold>
        種類ごとの制約・振る舞いの違い
      </T>
      <Arrow x1={82} y1={370} x2={82} y2={38} />
      <Arrow x1={82} y1={370} x2={748} y2={370} />
      <T x={74} y={56} fs={11} anchor="end" tone="muted">
        大きい
      </T>
      <T x={74} y={356} fs={11} anchor="end" tone="muted">
        小さい
      </T>
      <T x={92} y={388} fs={11} tone="muted">
        少ない
      </T>
      <T x={744} y={388} fs={11} anchor="end" tone="muted">
        多い
      </T>
      <T x={415} y={408} fs={12} anchor="middle" bold>
        親の型としてまとめて扱う呼び出し側（一括の処理・一覧・共通のメソッド）
      </T>
      {quads.map((q) => (
        <Box key={q.lines[0]} x={q.x} y={q.y} w={318} h={148} lines={q.lines} fs={12} fill={q.fill} bold subTone="muted" />
      ))}
    </Svg>
  )
}

/* ---------- 図 63-7 STI と継承の関係 ---------- */
const stiRows: [string, string, string][] = [
  ['1', 'EmailNotification', 'sent'],
  ['2', 'SmsNotification', 'sent'],
  ['3', 'SmsNotification', 'pending'],
  ['4', 'EmailNotification', 'pending'],
  ['5', 'SmsNotification', 'pending'],
]

function StiFigure() {
  const cols = [
    { x: 20, w: 40, head: 'id' },
    { x: 60, w: 160, head: 'type' },
    { x: 220, w: 90, head: 'status' },
  ]
  return (
    <Svg
      id="63-7"
      w={780}
      h={390}
      label="notifications テーブルの5行には、type 列に EmailNotification か SmsNotification が入っている。Notification.order(:id) で読むと、type 列の値に応じて、行ごとに EmailNotification か SmsNotification のオブジェクトが返る。Notification.pending の SQL には type の条件が付かず、すべての種類を読む。SmsNotification.pending の SQL には type = 'SmsNotification' の条件が付く。サブクラスの条件は、読み込まれているサブクラス（descendants）から作られる"
    >
      <T x={20} y={18} fs={12} bold>
        notifications テーブル
      </T>
      {cols.map((c) => (
        <Box key={c.head} x={c.x} y={30} w={c.w} h={26} lines={c.head} fs={11} fill="box5" bold rx={0} mono />
      ))}
      {stiRows.map((r, i) => (
        <g key={r[0]}>
          {cols.map((c, k) => (
            <Box key={c.head} x={c.x} y={56 + i * 26} w={c.w} h={26} lines={r[k]} fs={11} fill="bg" rx={0} mono />
          ))}
          <Arrow x1={312} y1={69 + i * 26} x2={448} y2={69 + i * 26} />
          <Box x={450} y={58 + i * 26} w={250} h={22} lines={`#<${r[1]} id: ${r[0]}>`} fs={11} fill={r[1].startsWith('Sms') ? 'box2' : 'box'} mono rx={3} />
        </g>
      ))}
      <T x={450} y={18} fs={12} bold>
        Notification.order(:id) の結果
      </T>
      <T x={380} y={44} fs={11} anchor="middle" tone="muted">
        type でクラスを選ぶ
      </T>
      <Box
        x={20}
        y={210}
        w={740}
        h={56}
        lines={['Notification.pending', "SELECT … WHERE status = 'pending'（type の条件なし。すべての種類を読む）"]}
        fs={12}
        fill="box"
        align="start"
        mono
        subTone="muted"
      />
      <Box
        x={20}
        y={280}
        w={740}
        h={56}
        lines={['SmsNotification.pending', "SELECT … WHERE type = 'SmsNotification' AND status = 'pending'"]}
        fs={12}
        fill="box2"
        align="start"
        mono
        subTone="muted"
      />
      <T x={20} y={364} fs={12} tone="muted">
        サブクラスの条件は、そのクラスと、読み込まれているサブクラス（descendants）の名前から作る
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 65,
  part: 8,
  title: 'LSP（リスコフの置換原則）：STI のサブクラスが親の約束を破らない',
  summary:
    '会員への通知を STI で作り、毎晩まとめて送る処理を例に、SMS のサブクラスだけが長い本文で例外を出して一括送信が止まる問題を扱います。親の取り決めを事前条件・事後条件として書いて RSpec の shared_examples ですべてのサブクラスに当て、SMS の制約を送るときの例外から保存する前の検証に移します。',
  goals: [
    'サブクラスを親の型として扱う処理で、サブクラスが親に無い条件や例外を足すと何が起きるかを、実行結果から説明できる',
    'Liskov の置換の性質、Liskov と Wing の振る舞いによる部分型、Martin の LSP の言い方の関係を説明できる',
    '事前条件は弱めてよく強めてはならない、事後条件は強めてよく弱めてはならない、という規則を Rails のモデルのメソッドに当てはめられる',
    '親の取り決めを RSpec の shared_examples に書き、すべてのサブクラスの spec で実行できる',
    'サブクラスごとの制約を保存する前の検証で表し、既存のデータを確かめてから切り替える手順を説明できる',
    'いちばん厳しい制約を親に上げる、取り決めを弱めるといった当てはめすぎを見分け、継承をやめる判断ができる',
  ],
  prerequisites: [14, 20],
  sections: [
    {
      id: 'scene',
      title: '通知の一括送信が、SMS の長い本文で毎晩止まる',
      body: (
        <>
          <h3>そもそも何を送るのか</h3>
          <p>
            通販サイトでは注文の発送やポイントの有効期限などを会員に知らせます。会員は通知をメールで受け取るか、SMS（携帯電話の番号あてに送る短いメッセージ）で受け取るかを選べます。この章のアプリは通知をいったん notifications テーブルに保存し、毎晩3時に動くジョブが、まだ送っていない通知をまとめて送ります。
          </p>
          <p>
            メールの通知と SMS の通知は、宛先・本文・状態という同じ項目を持ち、送り方だけが違います。そこでこのアプリは2種類の通知を <Term en="Single Table Inheritance">STI</Term>（単一テーブル継承）で表しています。STI は親のモデルと、それを継承したサブクラスのモデルを、1つのテーブルに保存する Active Record の仕組みです。テーブルの <code>type</code> 列にクラス名を保存し、読み出すときにその値でクラスを選びます。<code>type</code> が <code>"SmsNotification"</code> の行は、SmsNotification のオブジェクトとして読み出されます。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_notifications.rb"
            code={`
class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.string :type, null: false                        # STI のクラス名（EmailNotification・SmsNotification）
      t.string :recipient, null: false                   # メールアドレスか電話番号
      t.text :body, null: false
      t.string :status, null: false, default: "pending"  # pending・sent
      t.datetime :sent_at
      t.timestamps
    end
    add_index :notifications, [:status, :id]
  end
end
`}
          />
          <p>
            <code>status</code> は、送る前が <code>pending</code>、送った後が <code>sent</code> です。<code>sent_at</code> には送った時刻を入れます。
          </p>
          <h3>通知のモデルとジョブ</h3>
          <Code
            lang="ruby"
            title="app/models/notification.rb（直す前）"
            code={`
# 会員への通知。type 列でサブクラス（EmailNotification・SmsNotification）を選ぶ
class Notification < ApplicationRecord
  validates :recipient, :body, presence: true

  scope :pending, -> { where(status: "pending") }

  # 通知を1件送り、送信済みにする。送り方はサブクラスが決める
  def deliver!
    raise NotImplementedError
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/email_notification.rb（直す前）"
            code={`
class EmailNotification < Notification
  def deliver!
    MailGateway.deliver(to: recipient, body:)
    update!(status: "sent", sent_at: Time.current)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/sms_notification.rb（直す前）"
            code={`
class SmsNotification < Notification
  MAX_BODY_LENGTH = 70
  class BodyTooLong < StandardError; end

  def deliver!
    # SMS は1通70文字まで。長い本文は送らずに例外にする
    if body.length > MAX_BODY_LENGTH
      raise BodyTooLong, "SMS の本文は#{MAX_BODY_LENGTH}文字までです（#{body.length}文字）"
    end

    SmsGateway.deliver(to: recipient, body:)
    update!(status: "sent", sent_at: Time.current)
  end
end
`}
          />
          <p>
            親の Notification は <code>deliver!</code> の中身を持たず、2つのサブクラスがそれぞれ上書きしています。EmailNotification はメールの送信サービスに本文を渡し、status を sent にします。SmsNotification は本文が70文字を超えていれば <code>BodyTooLong</code> を発生させ、超えていなければ SMS の送信サービスに渡します。この章の SMS の送信サービスは1通の本文を70文字までと決めているからです。
          </p>
          <Code
            lang="ruby"
            title="app/gateways/sms_gateway.rb（MailGateway も同じ形）"
            code={`
# SMS の送信サービスの代わり。送った内容を deliveries に残す
class SmsGateway
  def self.deliveries = @deliveries ||= []

  def self.deliver(to:, body:)
    deliveries << { to:, body: }
  end
end
`}
          />
          <p>
            MailGateway と SmsGateway は、外部の送信サービスの代わりです。送った内容を <code>deliveries</code> に残すだけで、外部とは通信しません。本物のサービスを使う場合も、この位置に送信サービスと通信するクラスを置きます（外部のサービスとの間で形式を合わせる書き方は <ChapterLink n={42} section="idea" />）。
          </p>
          <Code
            lang="ruby"
            title="app/jobs/bulk_delivery_job.rb"
            code={`
# 未送信の通知をまとめて送る（毎晩1回実行する）
class BulkDeliveryJob < ApplicationJob
  def perform
    Notification.pending.find_each do |notification|
      notification.deliver!
    end
  end
end
`}
          />
          <p>
            BulkDeliveryJob は親のクラスの <code>Notification.pending</code> で未送信の通知を読み、<code>find_each</code> で1件ずつ <code>deliver!</code> を呼びます。<code>find_each</code> はレコードを主キーの順に1000件ずつ読み込み、1件ずつブロックに渡すメソッドです<Ref n={13} />。ジョブは読み出した通知がメールか SMS かを区別しません。どの通知も Notification として扱い、<code>deliver!</code> を呼べば送られて sent になる、と考えて書かれています。
          </p>
          <Figure n="63-1" title="場面の構成" caption="右の表は、次に示す実行で1晩目が終わった時点の notifications テーブル。本文の列は文字数。">
            <SceneFigure />
          </Figure>
          <p>
            図 63-1 はこの場面のクラスとテーブルの関係です。ジョブが使うのは親の Notification だけで、実際に呼ばれる <code>deliver!</code> は、テーブルの <code>type</code> 列で選ばれたサブクラスのものです。問題が起きるのは、色を付けた SmsNotification です。
          </p>
          <h3>2晩続けて実行すると</h3>
          <p>
            5件の通知を作り、BulkDeliveryJob を 11/22 と 11/23 の3時に実行しました。3件目は年末年始の配送を知らせる82文字の本文を SMS で送る通知です。4件目は同じ本文をメールで送る通知です。実行の時刻は <code>travel_to</code>（指定した時刻に現在時刻を置き換える Rails のテスト用のメソッド）で決めています。
          </p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb）"
            code={`
長い本文: 82文字
== 11/22 03:00 の BulkDeliveryJob
  SmsNotification::BodyTooLong: SMS の本文は70文字までです（82文字）
  id=1 EmailNotification sent    11/22 03:00
  id=2 SmsNotification   sent    11/22 03:00
  id=3 SmsNotification   pending
  id=4 EmailNotification pending
  id=5 SmsNotification   pending
== 11/23 03:00 の BulkDeliveryJob
  SmsNotification::BodyTooLong: SMS の本文は70文字までです（82文字）
  id=1 EmailNotification sent    11/22 03:00
  id=2 SmsNotification   sent    11/22 03:00
  id=3 SmsNotification   pending
  id=4 EmailNotification pending
  id=5 SmsNotification   pending
メールの送信: 1件、SMS の送信: 1件
`}
          />
          <p>
            1晩目は id=1 と id=2 を送った後、id=3 で <code>BodyTooLong</code> が発生してジョブが終わりました。id=4 のメールには長さの制限が無いのに送られず、id=5 の SMS は短い本文なのに送られていません。2晩目は、id=1 と id=2 が sent になっているので pending に含まれず、ジョブは id=3 から始めて同じ例外で終わりました。id=3 が pending のまま残るかぎり、その後ろの通知は毎晩送られません。
          </p>
          <p>
            ジョブを Sidekiq で動かしている場合、例外で終わったジョブは再試行の対象になります（再試行の仕組みは <ChapterLink n={18} section="retry" />）。しかし再試行しても、id=3 で同じ例外になります。原因はデータの中身にあり、時間をおいても変わらないからです。
          </p>
          <Figure n="63-2" title="一括送信が止まるタイムライン" caption="縦に時間、列に関係するオブジェクトを並べた。破線の矢印は例外が戻る方向。">
            <TimelineFigure />
          </Figure>
          <p>
            図 63-2 はこの実行を時間の順に並べたものです。1晩目も2晩目も、ジョブは id=3 の <code>deliver!</code> から戻ってきた例外で終わり、その後ろの通知には <code>deliver!</code> が呼ばれていません。
          </p>
          <h3>呼び出し側で SMS を飛ばす応急処置</h3>
          <p>翌朝、ジョブが止まっていることに気づいた開発者が、長い本文の SMS をジョブの中で飛ばすように直したとします。</p>
          <Code
            lang="ruby"
            title="app/jobs/bulk_delivery_job.rb（応急処置）"
            code={`
class BulkDeliveryJob < ApplicationJob
  def perform
    Notification.pending.find_each do |notification|
      # SMS の長い本文は送れないので飛ばす
      next if notification.is_a?(SmsNotification) && notification.body.length > SmsNotification::MAX_BODY_LENGTH

      notification.deliver!
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（応急処置のジョブで、同じ5件を2晩続けて送る）"
            code={`
長い本文: 82文字
== 11/22 03:00 の BulkDeliveryJob
  id=1 EmailNotification sent    11/22 03:00
  id=2 SmsNotification   sent    11/22 03:00
  id=3 SmsNotification   pending
  id=4 EmailNotification sent    11/22 03:00
  id=5 SmsNotification   sent    11/22 03:00
== 11/23 03:00 の BulkDeliveryJob
  id=1 EmailNotification sent    11/22 03:00
  id=2 SmsNotification   sent    11/22 03:00
  id=3 SmsNotification   pending
  id=4 EmailNotification sent    11/22 03:00
  id=5 SmsNotification   sent    11/22 03:00
メールの送信: 2件、SMS の送信: 2件
`}
          />
          <p>
            id=4 と id=5 は送られるようになりました。一方で id=3 は pending のまま、ログも残さずに毎晩飛ばされます。この会員に年末年始の案内は届かず、届いていないことに気づく手段もありません。また、ジョブのコードに SmsNotification というクラスの名前と、70文字という SMS の制限が入りました。長さの制限を持つ別の種類（たとえばプッシュ通知）を足すと、ジョブにもう1つ条件を書き足すことになります。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>ジョブは Notification に <code>deliver!</code> を呼べば送られると考えて書かれています。SmsNotification は親に無い条件（本文が70文字まで）と、親に無い例外（<code>BodyTooLong</code>）を足しています。</li>
            <li>1件の例外で一括送信が止まり、関係のないメールの通知まで送られません。止まる位置は毎晩同じで、再試行でも直りません。</li>
            <li>長すぎる本文は通知を作った時点ではなく送る時点で見つかります。本文を書いた担当者はその場で直せず、問題に気づくのは送られなかった後です。</li>
            <li>応急処置によって、呼び出し側が <code>is_a?</code> でサブクラスを調べるようになりました。サブクラスを足すたびに呼び出し側を直す必要があり、書き漏らすと同じ止まり方をします。</li>
          </ul>
          <p>これらは親の型として使われるときに期待される振る舞いを、サブクラスが守っていないことから起きています。次の節で、この期待を言葉にした原則を説明します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '派生型を基底型の代わりに使える：LSP の意味と由来',
      body: (
        <>
          <h3>原則の意味</h3>
          <p>
            <Term en="Liskov Substitution Principle">LSP（リスコフの置換原則）</Term>は、派生型を基底型の代わりに使っても、期待される振る舞いが維持されるようにするという原則です。Ruby のクラスで言えば、派生型はサブクラス、基底型は親のクラスです。基底型を使うコードは基底型について約束されていることだけを前提に書かれています。派生型のオブジェクトを渡したときにその前提が成り立たなくなるなら、その派生型は基底型の代わりになっていません。
          </p>
          <p>
            この章の例では、基底型が Notification、派生型が EmailNotification と SmsNotification、基底型を使うコードが BulkDeliveryJob です。ジョブは「pending の通知に <code>deliver!</code> を呼べば、送られて sent になる」という前提で書かれています。EmailNotification を渡すとこの前提は保たれ、SmsNotification を渡すと、本文が70文字を超えるときに成り立たなくなります。
          </p>
          <h3>由来：Liskov の講演と Liskov・Wing の論文</h3>
          <p>
            この原則は、Barbara Liskov が1987年10月の OOPSLA '87（オブジェクト指向の国際会議）で行った基調講演「Data Abstraction and Hierarchy」に由来します。講演の記録は会議の Addendum（予稿集の追補）の17〜34ページに収められ<Ref n={14} />、1988年5月の SIGPLAN Notices（23巻5号）にも掲載されました<Ref n={1} />。Robert C. Martin の記事が引用している Liskov の文は次のとおりです<Ref n={1} />。
          </p>
          <p>
            「ここで求められているのは、次のような置換の性質である。型 S の各オブジェクト o1 に対して型 T のオブジェクト o2 があり、T を使って定義されたすべてのプログラム P について、o2 の代わりに o1 を使っても P の振る舞いが変わらないなら、S は T の部分型である」
          </p>
          <p>
            Liskov と Jeannette Wing は1994年の論文「A Behavioral Notion of Subtyping」（ACM TOPLAS 16巻6号）で、この考えを部分型の要件として整理しました。要件は「型 T のオブジェクト x について証明できる性質 φ(x) は、T の部分型 S のオブジェクト y についても成り立つべきである」というものです<Ref n={2} />。論文は部分型かどうかを型の名前やメソッドの形ではなくオブジェクトの振る舞いで決めます。メソッドの事前条件と事後条件に加えて、オブジェクトが常に満たす<Term en="invariant">不変条件</Term>と、状態の移り変わりについての性質（論文の例では「バッグの上限の値は変わらない」）も、部分型が守る対象に含めています。部分型のメソッドが発生させる例外は、基底型のメソッドが発生させる例外に含まれていなければならない、という規則もあります<Ref n={2} />。
          </p>
          <p>
            Robert C. Martin は1996年の C++ Report の連載記事で、この考えを「基底クラスへのポインターや参照を使う関数は、派生クラスのオブジェクトを、それと知らずに使えなければならない」と言い換え、Liskov Substitution Principle と呼びました<Ref n={1} />。この章の題の LSP はこの記事の呼び方です。
          </p>
          <p>
            Martin の記事は正方形のクラスを長方形のクラスの派生クラスにする例を挙げています。正方形は幅を設定すると高さも同じ値になるように、幅を設定するメソッドを上書きします。正方形のオブジェクトだけを見れば、常に正しい正方形です。ところが「幅を5、高さを4にすれば面積は20になる」と考えて長方形を使う関数に正方形を渡すと、面積は16になり、関数が置いた前提は成り立ちません。Martin はここから、設計が正しいかどうかはクラスだけを見ても決められず、そのクラスを使う側が置く妥当な前提に照らして決まる、と述べています<Ref n={1} />。
          </p>
          <p>
            同じ記事にはこの章の場面に近い例もあります。Martin は集合（Set）の抽象クラスの派生クラスとして、ファイルに保存できる集合（PersistentSet）を作りました。PersistentSet の要素を追加するメソッドは、決まった型のオブジェクトでなければ例外を投げます。Set の既存の利用者は、要素の追加で例外が起きるとは考えていないので、これは LSP の違反だと説明しています<Ref n={1} />。SmsNotification の <code>deliver!</code> が <code>BodyTooLong</code> を投げるのは、これと同じ形です。
          </p>
          <h3>事前条件・事後条件・例外の規則</h3>
          <p>
            メソッドの約束は<Term en="precondition">事前条件</Term>（呼ぶ側がメソッドを呼ぶ前に満たしておく条件）と、<Term en="postcondition">事後条件</Term>（メソッドが戻ったときに成り立っていると約束する条件）で書けます。契約による設計（Design by Contract）を提唱した Bertrand Meyer は、サブクラスでメソッドを定義し直すときの規則を「事前条件はより弱いものにだけ、事後条件はより強いものにだけ置き換えてよい」としています。Martin の記事はこの規則を Meyer の『Object-Oriented Software Construction』（1988年）から引用し、LSP と結び付けています<Ref n={1} />。
          </p>
          <p>
            事前条件を弱めるとは受け付ける範囲を広げることです。親が受け付ける呼び出しは、サブクラスもすべて受け付けなければなりません。事後条件を強めるとは約束を足すことです。親が約束したことは、サブクラスもすべて守らなければなりません。Meyer が作った言語の Eiffel は、この規則を構文で守らせます。定義し直したメソッドでは事前条件の <code>require</code> と事後条件の <code>ensure</code> を書けず、元の事前条件に or でつなぐ <code>require else</code> と、元の事後条件に and でつなぐ <code>ensure then</code> だけを書けます。or でつなげば条件は弱くなるだけで、and でつなげば強くなるだけだからです<Ref n={3} />。
          </p>
          <p>
            Ruby にはこのような構文がありません。メソッドを上書きすれば、事前条件を強めることも、事後条件を弱めることも、親に無い例外を足すこともできます。そのため Ruby では親の約束をコメントに書き、すべてのサブクラスで同じテストを実行して確かめます。テストの書き方は次の節で示します。
          </p>
          <Figure n="63-3" title="サブクラスに許される変更と許されない変更" caption="この章の通知の取り決めに当てはめた。例の列は直す前の SmsNotification と、ありがちな誤りの例。">
            <RulesFigure />
          </Figure>
          <p>
            図 63-3 は4種類の条件ごとに、サブクラスに許される変更と許されない変更を並べたものです。直す前の SmsNotification は、事前条件の行と例外の行の両方で、右の列に当てはまります。親は本文の長さを条件にしていないのに、SmsNotification は71文字以上を受け付けず、親に無い <code>BodyTooLong</code> を発生させます。事後条件の行の「送らずに戻る」は、たとえば宛先が無いときに何もせずに戻るサブクラスです。例外は出ませんが、使う側は送られたと考えて次へ進み、通知は pending のまま残ります。
          </p>
          <h3>似た原則との違い</h3>
          <ul>
            <li>
              OCP（<ChapterLink n={64} />）：Martin は、LSP に反するサブクラスがあると、基底型を使う関数がすべての派生型を知る必要が生じ、派生型を足すたびにその関数を直すことになるので、OCP にも反すると述べています<Ref n={1} />。応急処置のジョブの <code>is_a?</code> がこの状態です。
            </li>
            <li>Design by Contract（<ChapterLink n={80} />）：事前条件・事後条件・不変条件を書いて確かめる方法そのものを扱います。LSP はその契約を継承の関係でどう引き継ぐかについての原則です。</li>
            <li>
              ISP（<ChapterLink n={66} />）：サブクラスが親のメソッドを <code>NotImplementedError</code> で上書きしているなら、そのサブクラスは親の約束を守れていません。親の取り決めがそのサブクラスには大きすぎることが多く、取り決めを使う側ごとに分ける ISP の対象になります。
            </li>
            <li>Composition over Inheritance（<ChapterLink n={72} />）：継承の代わりに、オブジェクトを組み合わせて振る舞いを作る考え方です。親の約束を守れない継承は、組み合わせに替える候補になります。</li>
          </ul>
          <p>
            LSP は継承だけの原則ではありません。Liskov と Wing の定義は型の振る舞いについてのもので、クラスの継承を前提にしていません<Ref n={2} />。Ruby の<Term en="duck typing">ダックタイピング</Term>（クラスを問わず、必要なメソッドに応答するオブジェクトなら受け付ける書き方）でも、同じメソッドに応答するオブジェクトどうしは、同じ約束を守る必要があります。たとえば <ChapterLink n={42} section="test" />の2つの決済の Adapter は継承の関係にありませんが、どちらも同じ取り決めを満たすことを、共通のテストで確かめています。
          </p>
          <Figure n="63-4" title="LSP に反するサブクラスがあるときの兆候" caption="コードレビューで見つけやすい形を並べた。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">兆候</th>
                    <th scope="col">この章の例</th>
                    <th scope="col">見直すこと</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">呼び出し側が <code>is_a?</code> や <code>case</code> でサブクラスを調べて分ける</th>
                    <td>応急処置のジョブの <code>is_a?(SmsNotification)</code></td>
                    <td>サブクラスの違いを、親の取り決めの中で表せないか</td>
                  </tr>
                  <tr>
                    <th scope="row">サブクラスが親に無い例外を発生させる</th>
                    <td>
                      <code>BodyTooLong</code>
                    </td>
                    <td>その条件を、呼ぶ前に確かめられる場所（保存する前の検証など）に移せないか</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      サブクラスが親のメソッドを <code>NotImplementedError</code> や空のメソッドで上書きする
                    </th>
                    <td>（この章には無い。決済の例は <ChapterLink n={66} section="scene" />）</td>
                    <td>親の取り決めが大きすぎないか。使う側ごとに分けられないか</td>
                  </tr>
                  <tr>
                    <th scope="row">サブクラスのメソッドが、親が約束した更新をせずに戻ることがある</th>
                    <td>
                      <code>update!(status: "sent")</code> を種類ごとに書いていて、書き忘れる余地がある
                    </td>
                    <td>事後条件を守る処理を親のメソッドにまとめ、サブクラスには違う部分だけを書かせる</td>
                  </tr>
                  <tr>
                    <th scope="row">親を使う側の前提を確かめるテストが、一部のサブクラスでしか動いていない</th>
                    <td>SMS のテストが短い本文でしか送っていない</td>
                    <td>親の取り決めを共通のテストにして、すべてのサブクラスで実行する</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 63-4 は LSP に反するサブクラスがあるときにコードに現れやすい兆候です。どれも、親の型を使う側がどのサブクラスを渡されたかを気にしなければならない状態を示しています。
          </p>
        </>
      ),
    },
    {
      id: 'apply',
      title: '取り決めを共通のテストにし、SMS の制約を保存する前の検証に移す',
      body: (
        <>
          <h3>直す順序</h3>
          <ol className="steps">
            <li>親の取り決めを書き、共通のテストにする：Notification のコメントに事前条件と事後条件を書き、RSpec の shared_examples にして、すべてのサブクラスの spec で実行します。SMS の違反がテストの失敗として現れます。</li>
            <li>直す前に作られたデータを確かめる：SMS の制約を検証に移すと、すでに保存されている長い本文の SMS が検証に通らなくなります。切り替える前に探して直します。</li>
            <li>SMS の制約を保存する前の検証に移し、送り方だけをサブクラスに残す：事後条件を守る処理を親の <code>deliver!</code> にまとめ、サブクラスは送り方だけを書きます。</li>
            <li>呼び出し側の <code>is_a?</code> を消す：ジョブを、種類を区別しない元の形に戻します。</li>
          </ol>
          <h3>手順1：親の取り決めを共通のテストにする</h3>
          <Code
            lang="ruby"
            title="spec/support/notification_contract.rb"
            code={`
# Notification の取り決めを確かめる共通のテスト。組み込む側の spec で次の2つを定義する
#   build_notification(body:) … 保存する前の通知を返す
#   gateway                    … その種類が使う送信サービス（deliveries に送った内容が残る）
RSpec.shared_examples "通知の取り決めを満たす" do
  # 親の Notification が受け付ける本文（空でなければ、長さを問わない）
  ["ご注文の商品を発送しました", "あ" * 70, "あ" * 71, "あ" * 1000].each do |body|
    it "#{body.length}文字の本文：保存できないか、保存できたら deliver! で送信済みになる" do
      notification = build_notification(body:)

      if notification.save
        expect { notification.deliver! }.to change { gateway.deliveries.size }.by(1)
        expect(notification.reload).to have_attributes(status: "sent", sent_at: be_present)
      else
        expect(notification.errors[:body]).to be_present # 保存できない理由は errors で伝える
      end
    end
  end

  it "送信した通知は pending に含まれない（次の晩に二重に送らない）" do
    notification = build_notification(body: "ご注文の商品を発送しました")
    notification.save!
    notification.deliver!
    expect(Notification.pending).not_to include(notification)
  end
end
`}
          />
          <p>
            <Term en="shared examples">shared_examples</Term> は、複数の describe で使う例（<code>it</code>）のまとまりに名前を付けて登録する RSpec の機能です。登録しただけでは実行されず、<code>it_behaves_like "名前"</code> を書いた describe の中に組み込まれて実行されます<Ref n={10} />。この共通のテストには、ジョブが Notification に期待していることを書きます。
          </p>
          <ul>
            <li>
              事前条件：保存できた通知なら <code>deliver!</code> を呼んでよい。本文は、親が受け付ける範囲（空でなければ長さを問わない）から、境目の70文字と71文字、短い本文、1000文字を選びました。保存できない場合は、<code>errors</code> に理由が入っていることだけを確かめます。
            </li>
            <li>事後条件：<code>deliver!</code> が戻ったら、送信サービスに1回送られ、status が sent、sent_at が入っている。</li>
            <li>送った通知は pending に含まれない。ジョブが同じ通知を次の晩に送り直さないための約束です。</li>
          </ul>
          <p>
            「保存できないか、保存できたら送れる」と書いたのは、種類ごとの制約を保存する前の検証で表すことを、取り決めとして認めるためです。保存できない場合を認めても、テストが何も確かめなくなるわけではありません。最後の例は短い本文を <code>save!</code> で保存するので、どの本文も保存できないサブクラスはここで失敗します。
          </p>
          <Code
            lang="ruby"
            title="spec/models/email_notification_spec.rb と spec/models/sms_notification_spec.rb"
            code={`
require "rails_helper"

RSpec.describe EmailNotification do
  def build_notification(body:) = described_class.new(recipient: "sato@example.com", body:)
  def gateway = MailGateway

  it_behaves_like "通知の取り決めを満たす"
end

RSpec.describe SmsNotification do
  def build_notification(body:) = described_class.new(recipient: "090-0000-0001", body:)
  def gateway = SmsGateway

  it_behaves_like "通知の取り決めを満たす"
end
`}
          />
          <p>まず、直す前のモデルに対して、共通のテストだけを実行しました。</p>
          <Code
            lang="text"
            title="実行結果（直す前のモデル。bundle exec rspec spec/models -e '通知の取り決めを満たす'。一部を省略）"
            code={`
.......FF.

Failures:

  1) SmsNotification behaves like 通知の取り決めを満たす 71文字の本文：保存できないか、保存できたら deliver! で送信済みになる
     Failure/Error: raise BodyTooLong, "SMS の本文は#{MAX_BODY_LENGTH}文字までです（#{body.length}文字）"

     SmsNotification::BodyTooLong:
       SMS の本文は70文字までです（71文字）
     Shared Example Group: "通知の取り決めを満たす" called from ./spec/models/sms_notification_spec.rb:7
     # ./app/models/sms_notification.rb:8:in 'SmsNotification#deliver!'

  2) SmsNotification behaves like 通知の取り決めを満たす 1000文字の本文：保存できないか、保存できたら deliver! で送信済みになる
     …（省略。1) と同じで、71文字が1000文字になっている）

10 examples, 2 failures
`}
          />
          <p>
            EmailNotification の5つの例はすべて通り、SmsNotification では71文字と1000文字の例が失敗しました。どちらも、保存はできたのに <code>deliver!</code> が <code>BodyTooLong</code> を発生させています。場面の節で毎晩のジョブを止めた違反が、テストの失敗として見えるようになりました。<code>Shared Example Group: ... called from</code> の行は、どの spec から組み込んだ共通のテストが失敗したかを示します。
          </p>
          <h3>手順2：直す前に作られたデータを確かめる</h3>
          <p>
            次の手順3では SMS の長さの確認を、送るときの例外から保存する前の検証に移します。検証に移すと、すでに保存されている長い本文の SMS は、検証に通らないデータになります。データを確かめずに切り替えるとどうなるかを見るため、手順3のコードを、直す前のコードで作ったデータ（場面の節の実行で id=3〜5 が pending のまま）に対して実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（手順3のコードで、直す前に作られたデータを送る）"
            code={`
pending: id=3, id=4, id=5
id=3 の valid?: false
ActiveRecord::RecordInvalid: Validation failed: Body is too long (maximum is 70 characters)
SMS の送信: 090-0000-0002（82文字）
pending: id=3, id=4, id=5
`}
          />
          <p>
            id=3 は新しい検証に通りません。ジョブは id=3 の SMS を送信サービスに渡した後、sent にする <code>update!</code> の検証で <code>ActiveRecord::RecordInvalid</code> になりました。送信サービスの代わりには82文字の本文が渡り、通知は pending のまま残っています。このまま毎晩ジョブを動かすと、同じ SMS を毎晩送り直しながら、id=4 と id=5 はやはり送られません。直す前より悪い状態です。
          </p>
          <p>そこで、切り替える前に、70文字を超える pending の SMS を探して本文を直します。</p>
          <Code
            lang="ruby"
            title="script/repair.rb"
            code={`
# 直す前に作られた、70文字を超える pending の SMS を探して本文を直す
long_sms = SmsNotification.pending.where("CHAR_LENGTH(body) > ?", SmsNotification::MAX_BODY_LENGTH)
pp long_sms.pluck(:id, Arel.sql("CHAR_LENGTH(body)"), Arel.sql("LENGTH(body)"))

short = "年末年始は12/29〜1/3の配送を休みます。休み中のご注文は1/4から順に発送します"
puts "直した本文: #{short.length}文字"
long_sms.find_each { |n| n.update!(body: short) }

BulkDeliveryJob.perform_now
puts "pending: #{Notification.pending.count}件"
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/repair.rb）"
            code={`
[[3, 82, 230]]
直した本文: 43文字
pending: 0件
`}
          />
          <p>
            MySQL の <code>CHAR_LENGTH</code> は文字の数を、<code>LENGTH</code> はバイトの数を返します<Ref n={12} />。id=3 の本文は82文字で、そのうち74文字が1文字3バイトの日本語、8文字が1バイトの数字なので、230バイトでした。Rails の長さの検証も文字の数で数えるので、検索には <code>CHAR_LENGTH</code> を使います。本文を直した後、ジョブは残りの3件をすべて送り、pending は0件になりました。
          </p>
          <p>
            本文をどう直すかは、通知の内容を決める担当者が決めることです。この例では短い本文に書き換えましたが、メールで送り直す、会員に別の方法で知らせてから削除する、といった対応もあります。どの対応でも、切り替えの時点で pending の SMS が新しい検証に通る状態にしておきます。
          </p>
          <Callout kind="warn">
            <p>
              データを直してから新しいコードをデプロイするまでの間にも、長い本文の SMS が作られることがあります。デプロイした後、ジョブが動く前に同じ検索をもう一度実行して、0件であることを確かめます。検索を rake タスクにしてデプロイの手順に入れておけば、確かめるのを忘れません。データの変更とコードの変更を分けて進める手順は <ChapterLink n={27} section="live-change" /> で扱いました。
            </p>
          </Callout>
          <h3>手順3：SMS の制約を検証に移し、送り方だけをサブクラスに残す</h3>
          <Code
            lang="ruby"
            title="app/models/notification.rb（直した後）"
            code={`
# 会員への通知。type 列でサブクラス（EmailNotification・SmsNotification）を選ぶ。
#
# 通知の取り決め（すべてのサブクラスが守る）
#   事前条件：保存できた pending の通知なら、deliver! を呼んでよい。
#             種類ごとの制約（本文の長さなど）は、保存する前の検証で確かめる
#   事後条件：deliver! が戻ったとき、送信サービスに1回送り、status は "sent"、sent_at は送った時刻になっている
class Notification < ApplicationRecord
  validates :recipient, :body, presence: true

  scope :pending, -> { where(status: "pending") }

  def deliver!
    transmit
    update!(status: "sent", sent_at: Time.current)
  end

  private

  # 送信サービスに送る。サブクラスが送り方を決める
  def transmit
    raise NotImplementedError, "#{self.class} は transmit を定義していません"
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/email_notification.rb と app/models/sms_notification.rb（直した後）"
            code={`
class EmailNotification < Notification
  private

  def transmit = MailGateway.deliver(to: recipient, body:)
end

class SmsNotification < Notification
  MAX_BODY_LENGTH = 70

  # SMS は1通70文字まで。送るときではなく、保存する前に確かめる
  validates :body, length: { maximum: MAX_BODY_LENGTH }

  private

  def transmit = SmsGateway.deliver(to: recipient, body:)
end
`}
          />
          <p>変更は次の3つです。</p>
          <ul>
            <li>
              取り決めを Notification のコメントに書きました。Ruby には取り決めを宣言する構文が無いので、コメントと手順1の共通のテストが取り決めを表します。
            </li>
            <li>
              <code>deliver!</code> を親だけに置き、送った後に sent にする処理（事後条件）を1か所にまとめました。サブクラスは private の <code>transmit</code> で送り方だけを決めます。処理の順序を親のメソッドが決め、違う部分だけをサブクラスに書かせるこの形は、Template Method と呼ばれる書き方です。サブクラスが sent にする処理を書き忘れたり、条件を付けて飛ばしたりする余地がなくなります。
            </li>
            <li>
              SMS の70文字の制限を、<code>validates :body, length: {'{ maximum: MAX_BODY_LENGTH }'}</code> の検証に移しました。長い本文の SMS は作る時点で保存できなくなります。<code>BodyTooLong</code> の例外は無くなりました。
            </li>
          </ul>
          <p>
            検証を足すことは、親の約束を破らないのか、という疑問が出るかもしれません。サブクラスに検証を足すと、親では保存できた本文が、サブクラスでは保存できなくなります。これは <code>save</code> の事前条件を強めたように見えます。しかし Active Record の <code>save</code> の約束は、もともと「検証に通れば保存して true を返し、通らなければ false を返して <code>errors</code> に理由を入れる」というものです。どの検証を持つかはモデルごとに違い、<code>save</code> を呼ぶ側は false が返る場合を初めから扱います。サブクラスの検証はこの約束の範囲の中にあります。一方、直す前の <code>deliver!</code> の例外は Notification のどこにも書かれていない失敗の仕方でした。
          </p>
          <p>
            ただし、親の約束の範囲の中にあることと、すべての呼び出し側が正しく扱えていることは別です。「どの通知も必ず保存できる」と考えて <code>create!</code> を繰り返す処理があれば、検証を足した時点で例外になります。検証を足すときは、そのクラスを作っている箇所を検索して、保存の失敗を扱っているかを確かめます。
          </p>
          <p>SmsNotification の spec に、検証の例を1つ足しました。</p>
          <Code
            lang="ruby"
            title="spec/models/sms_notification_spec.rb（足した例）"
            code={`
  it "71文字以上の本文は保存できず、理由が errors に入る" do
    notification = build_notification(body: "あ" * 71)
    expect(notification.save).to be false
    expect(notification.errors.details[:body]).to eq [{ error: :too_long, count: 70 }]
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（直した後。bundle exec rspec --format documentation）"
            code={`
BulkDeliveryJob
  メールと SMS が混ざっていても、未送信の通知をすべて送る

EmailNotification
  behaves like 通知の取り決めを満たす
    13文字の本文：保存できないか、保存できたら deliver! で送信済みになる
    70文字の本文：保存できないか、保存できたら deliver! で送信済みになる
    71文字の本文：保存できないか、保存できたら deliver! で送信済みになる
    1000文字の本文：保存できないか、保存できたら deliver! で送信済みになる
    送信した通知は pending に含まれない（次の晩に二重に送らない）

SmsNotification
  71文字以上の本文は保存できず、理由が errors に入る
  behaves like 通知の取り決めを満たす
    13文字の本文：保存できないか、保存できたら deliver! で送信済みになる
    70文字の本文：保存できないか、保存できたら deliver! で送信済みになる
    71文字の本文：保存できないか、保存できたら deliver! で送信済みになる
    1000文字の本文：保存できないか、保存できたら deliver! で送信済みになる
    送信した通知は pending に含まれない（次の晩に二重に送らない）

Finished in 0.32797 seconds (files took 3.13 seconds to load)
12 examples, 0 failures
`}
          />
          <p>
            SmsNotification の71文字と1000文字の例は、保存できない場合として通りました。EmailNotification の同じ例は、保存して送る場合として通っています。共通のテストは、サブクラスによって保存できない場合と保存して送る場合に分かれても、ジョブが頼る約束が守られていることを確かめています。先頭の BulkDeliveryJob の例は、手順4で足したものです。
          </p>
          <h3>手順4：呼び出し側から is_a? を消す</h3>
          <p>
            ジョブは応急処置の <code>is_a?</code> を消して、場面の節の最初の形に戻します。どの通知にも <code>deliver!</code> を呼ぶだけです。ジョブの spec ではメールと SMS を混ぜて作り、すべてが sent になることを確かめます。
          </p>
          <Code
            lang="ruby"
            title="spec/jobs/bulk_delivery_job_spec.rb"
            code={`
require "rails_helper"

RSpec.describe BulkDeliveryJob do
  it "メールと SMS が混ざっていても、未送信の通知をすべて送る" do
    notifications = [
      EmailNotification.create!(recipient: "sato@example.com", body: "あ" * 82),
      SmsNotification.create!(recipient: "090-0000-0001", body: "ご注文の商品を発送しました"),
      EmailNotification.create!(recipient: "suzuki@example.com", body: "ポイントの有効期限が近づいています")
    ]

    described_class.perform_now

    expect(notifications.map { |n| n.reload.status }).to all(eq "sent")
  end
end
`}
          />
          <p>長すぎる本文は作る時点で見つかるようになりました。直した後のコードで、82文字の本文を SMS とメールで作りました。</p>
          <Code
            lang="text"
            title="実行結果（直した後。SmsNotification.create と EmailNotification.create に82文字の本文を渡す）"
            code={`
false
["Body is too long (maximum is 70 characters)"]
true
`}
          />
          <p>
            SMS は保存されず（<code>persisted?</code> が false）、<code>errors</code> に理由が入りました。管理画面で通知を作る処理なら、このメッセージをその場で表示し、担当者に本文を短くしてもらえます。メールは長さの制限が無いので、同じ本文で保存できています。
          </p>
          <Figure n="63-5" title="直す前と後の比較" caption="破線の箱は共通のテスト。破線の矢印は、共通のテストがそのサブクラスで実行されることを表す。">
            <BeforeAfterFigure />
          </Figure>
          <p>
            図 63-5 は直す前と後の構成を並べたものです。直す前は、SMS の制約が送るときの例外として現れ、それをジョブの <code>is_a?</code> が補っていました。直した後は、制約は作るときの検証に、事後条件は親の <code>deliver!</code> に置かれ、ジョブのコードにはどのサブクラスの名前も出てきません。共通のテストが、2つのサブクラスが同じ約束を守ることを確かめています。
          </p>
          <h3>ほかの直し方：長い本文を分けて送る</h3>
          <p>
            事前条件を弱める方向で直すこともできます。SMS の送り方を、長い本文を70文字ずつに分けて複数通で送るように変えれば、SmsNotification は親と同じく、長さを問わずに本文を受け付けます。検証を足す必要はなく、手順2のデータの修正も要りません。ただし、送る通数が増えると費用が増える、文の途中で分かれて読みにくくなる、といった点を業務の側で決める必要があります。どちらの直し方を選んでも、親の取り決めを満たすかどうかは同じ共通のテストで確かめられます。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '当てはめすぎたとき：いちばん厳しい制約を親に上げる・取り決めを弱める',
      body: (
        <>
          <h3>いちばん厳しい制約を、すべての種類に当てる</h3>
          <p>
            「どのサブクラスを渡しても同じように動く」ことだけを目標にすると、「SMS が70文字までなら、どの通知も70文字までにすればよい」という直し方を思い付きます。親の Notification に長さの検証を置き、SMS の検証を消した版を作りました。
          </p>
          <Code
            lang="ruby"
            title="app/models/notification.rb（当てはめすぎた版。変えた部分だけ）"
            code={`
class Notification < ApplicationRecord
  validates :recipient, :body, presence: true
  # どの種類でも置き換えられるように、いちばん厳しい SMS の制限を全部の種類に当てる
  validates :body, length: { maximum: 70 }
  # …（省略）
end
`}
          />
          <Code
            lang="text"
            title="実行結果（82文字の本文で EmailNotification を作る。続けて共通のテストを実行する）"
            code={`
false
["Body is too long (maximum is 70 characters)"]

10 examples, 0 failures
`}
          />
          <p>
            共通のテストはすべて通りました。どのサブクラスも同じ制約を持つので、置き換えて困ることはありません。その代わり、メールで長い本文を送れなくなりました。年末年始の案内のように、メールなら詳しく書ける通知も、SMS に合わせて短くすることになります。LSP が求めているのは、親の型を使う側の期待がサブクラスでも保たれることで、すべてのサブクラスを同じにすることではありません。サブクラスごとの違いは親の約束（この章では「保存できたなら送れる」）の範囲の中で持たせます。
          </p>
          <h3>取り決めを弱めて、何が起きてもよいことにする</h3>
          <p>反対の方向に当てはめすぎることもあります。どのサブクラスも違反しないように、親の約束を弱めてしまう直し方です。</p>
          <Code
            lang="ruby"
            title="取り決めを弱めすぎた例（ジョブの部分）"
            code={`
# 通知の取り決め（弱めすぎた例）
#   deliver! は、送れたら true、送れなかったら false を返す。どんな例外を発生させてもよい
class BulkDeliveryJob < ApplicationJob
  def perform
    Notification.pending.find_each do |notification|
      sent = notification.deliver!
      Rails.logger.warn("通知 #{notification.id} を送れませんでした") unless sent
    rescue StandardError => e
      Rails.logger.error("通知 #{notification.id}: #{e.class}")
    end
  end
end
`}
          />
          <p>
            この取り決めなら、SMS が長い本文で false を返しても、例外を出しても、違反にはなりません。しかし取り決めがほとんど何も約束しないので、使う側は起こりうるすべての場合を自分で扱うことになります。<code>rescue StandardError</code> は、送り方のバグ（<code>NoMethodError</code> など）まで「送れなかった通知」として扱い、ログに1行を書くだけで次の通知へ進みます。LSP の目的は、使う側が親の約束だけを頼りにコードを書けるようにすることです。何も約束しない取り決めにすれば形の上では違反が無くなりますが、その目的は果たせません。
          </p>
          <h3>親の型として使わない継承にまで、取り決めのテストを求める</h3>
          <p>
            継承していても、親の型としてまとめて扱われないクラスもあります。たとえば管理者と一般の会員を STI で分けていても、管理者のクラスを管理画面でしか使わず、会員の一覧や共通の処理に混ざらないなら、管理者が会員の約束をすべて守っているかを細かく確かめても得られるものは少なくなります。この場合は、共通の検証のテストだけで足ります。親の型として扱う箇所が無く、種類ごとの違いも大きいなら、そもそも継承をやめて別のモデルにする方が単純になることもあります。
          </p>
          <h3>判断の目安</h3>
          <Figure n="63-6" title="継承と取り決めのテストをどこまで使うか" caption="模式図。境目の位置は呼び出し側の数と違いの大きさを見て決める。">
            <JudgeFigure />
          </Figure>
          <p>
            図 63-6 は親の型としてまとめて扱う呼び出し側の多さと、種類ごとの違いの大きさの2つの軸で、継承と取り決めのテストをどこまで使うかを並べたものです。この章の通知は、毎晩の一括送信という呼び出し側があり、違いは本文の長さと送り方だけなので、右下に入ります。いちばん厳しい制約を全部の種類に当てる直し方は、右上にあるものを、機能を削って右下へ動かそうとしている状態です。迷ったときは、次の点を確かめます。
          </p>
          <ol>
            <li>親の型としてまとめて扱う呼び出し側（一括の処理・一覧・共通のメソッド）があるか。無いなら、細かい取り決めのテストは後回しにしてよい。</li>
            <li>サブクラスの違いを、親の約束の範囲の中で表せるか（保存する前の検証、何ができるかを問い合わせるメソッド）。</li>
            <li>親の約束をすべてのサブクラスで守るために、どれかのサブクラスの機能を削っていないか。</li>
            <li>親の取り決めが使う側にとって何かを約束しているか。「何が起きてもよい」になっていないか。</li>
            <li>サブクラスが親のメソッドの一部を使えないなら、継承をやめるか、取り決めを分けられないか（<ChapterLink n={66} />・<ChapterLink n={72} />）。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の STI・検証・キャッシュの取り決めと LSP',
      body: (
        <>
          <h3>STI：親のクラスで読むと行ごとにサブクラスのオブジェクトが返る</h3>
          <p>
            Active Record の STI では、クラスの名前をテーブルの <code>type</code> 列に保存し、親のクラスで読み出すと、行ごとに <code>type</code> の値のクラスのオブジェクトを返します<Ref n={4} />。この章のアプリで、SQL と読み出したオブジェクトのクラスを確かめました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/sti.rb。>> の行は実行した式）"
            code={`
>> Notification.pending.to_sql
SELECT \`notifications\`.* FROM \`notifications\` WHERE \`notifications\`.\`status\` = 'pending'
>> SmsNotification.pending.to_sql
SELECT \`notifications\`.* FROM \`notifications\` WHERE \`notifications\`.\`type\` = 'SmsNotification' AND \`notifications\`.\`status\` = 'pending'
>> Notification.order(:id).map { |n| n.class.name }
["EmailNotification", "SmsNotification", "SmsNotification", "EmailNotification", "SmsNotification"]
>> Notification.new(type: "SmsNotification").class.name
SmsNotification
>> SmsNotification.validators.map { |v| [v.class.name.demodulize, v.attributes, v.options] }
[["PresenceValidator", [:recipient, :body], {}], ["LengthValidator", [:body], {maximum: 70}]]
`}
          />
          <Figure n="63-7" title="STI の行とクラスの対応" caption="この章のアプリの notifications テーブルで描いた。SQL は列の一覧を省略した。">
            <StiFigure />
          </Figure>
          <p>
            図 63-7 はテーブルの行と読み出したオブジェクトの対応です。<code>Notification.pending</code> の SQL には <code>type</code> の条件が付かず、すべての種類の行を読みます。読み出されたオブジェクトは、<code>type</code> 列の値に応じて EmailNotification か SmsNotification になります。<code>Notification.new(type: "SmsNotification")</code> のように親のクラスに <code>type</code> を渡して作っても、SmsNotification のオブジェクトが返ります。STI では、親のクラスの名前だけを書いたコードが、実際にはサブクラスのオブジェクトを扱っていることが普通に起きます。LSP がそのまま問題になる仕組みです。
          </p>
          <p>
            サブクラスで読むときの <code>type</code> の条件は、そのクラスと、読み込まれているサブクラス（<code>descendants</code>）の名前から作られます<Ref n={5} />。開発環境のように、クラスを使うときに初めて読み込む設定では、まだ読み込まれていない孫のクラスが条件から漏れることがあります。Rails Guides は、STI と遅延読み込みは相性が悪いので、STI の階層を前もって読み込むよう勧め、その方法を説明しています<Ref n={6} />。
          </p>
          <p>
            Rails Guides は、STI はサブクラスとその属性の違いが小さいときに最も向いていて、違いが大きいと、使わない列がテーブルに増えると説明しています。その場合の方法として、共通の属性を親のテーブルに、種類ごとの属性を別のテーブルに置く <code>delegated_type</code> を挙げています<Ref n={7} />。種類ごとの属性が増えてきたときは、継承の約束を守れているかと合わせて、この方法も比べます。STI と別テーブルの設計の比べ方は <ChapterLink n={27} section="model-data-design" /> で扱いました。
          </p>
          <h3>サブクラスの検証は親の save の取り決めの中に収まる</h3>
          <p>
            上の実行結果の最後の行のとおり、SmsNotification の検証には、親の Notification で書いた presence の検証と、サブクラスで足した length の検証の両方が入っています。サブクラスは親の検証を引き継ぎ、そのうえで検証を足せます。手順3で説明したとおり、<code>save</code> は検証に通らなければ false を返すことを約束しているので、サブクラスで検証を足しても、<code>save</code> の約束の範囲を出ません。
          </p>
          <p>
            反対に、サブクラスのコールバックで、親の保存では起きない副作用（メールの送信や外部への通信）を足すと、親の型で保存しているつもりの呼び出し側には予想できない動作になります。コールバックに副作用を置くときの注意は <ChapterLink n={14} section="callback-boundaries" /> で扱いました。
          </p>
          <h3>Rails のキャッシュの取り決めと NullStore</h3>
          <p>
            Rails 自身にも、同じ取り決めを複数の実装が満たす仕組みがあります。<code>Rails.cache</code> で使うキャッシュのストア（MemoryStore・FileStore・RedisCacheStore など）は、どれも ActiveSupport::Cache::Store を継承しています。2つのストアで、書いた値を読めるかを確かめました。
          </p>
          <Code
            lang="ruby"
            title="script/null_store.rb"
            code={`
# キャッシュの取り決め：書いた値が次に読めるとは限らない
[ActiveSupport::Cache::MemoryStore.new, ActiveSupport::Cache::NullStore.new].each do |store|
  puts "== #{store.class.name.demodulize}"
  p store.write("jpy_per_usd", 150)
  p store.read("jpy_per_usd")
  p store.fetch("jpy_per_usd") { 151 }
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/null_store.rb）"
            code={`
== MemoryStore
true
150
150
== NullStore
true
nil
151
`}
          />
          <p>
            NullStore は <code>write</code> に true を返しますが、直後の <code>read</code> は nil を返し、<code>fetch</code> は毎回ブロックを実行します。Rails のソースのコメントは NullStore を「実際には何も保存しないキャッシュのストアで、キャッシュを有効にしたくないが、キャッシュのインターフェースを通す必要がある開発環境やテスト環境で使う」と説明しています<Ref n={9} />。
          </p>
          <p>
            NullStore は LSP に反しているでしょうか。Store の <code>read</code> の説明は「そのキーのデータがあれば返し、なければ nil を返す」で、書いた値が必ず読めるとは約束していません<Ref n={8} />。キャッシュは期限切れや容量の都合でいつ消えてもよいものなので、使う側は <code>fetch</code> のブロックで、値が無い場合を常に扱います。NullStore はこの約束の範囲の中で、書いた値が最も消えやすい実装です。反対に「<code>write</code> した直後なら <code>read</code> で読める」と考えて書いたコードは、MemoryStore では動いても NullStore では動きません。この場合に誤っているのは、約束されていない前提を置いた使う側のコードです。Martin が書いたとおり、置き換えられるかどうかは、親について約束されていることと、使う側の前提の両方を見て決まります<Ref n={1} />。
          </p>
          <h3>Rails Doctrine と LSP</h3>
          <p>
            Rails Doctrine の「Provide sharp knives（鋭いナイフを提供する）」の項は、Ruby には既存のクラスやメソッドを書き換える力のような強力な機能があり、それを禁止するのではなく、規約と、望ましい方向へ促す工夫と、教育で正しく使わせる、と述べています<Ref n={11} />。継承とメソッドの上書きも同じで、Ruby も Rails も、サブクラスが親の約束を破ることを止めません。STI は <code>type</code> 列を足すだけで使えるので導入しやすく、そのぶん約束を守る仕組みはアプリの側で用意します。この章では、取り決めをコメントに書くこと、共通のテストをすべてのサブクラスで実行すること、事後条件を親のメソッドにまとめることで、その仕組みを作りました。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={42} section="test" />：決済の2つの Adapter に、shared_examples で同じ取り決めのテストを当てています。継承の関係が無いオブジェクトどうしでも、同じ方法で置き換えられることを確かめられます。
            </li>
            <li>
              <ChapterLink n={66} />：取り決めの一部しか満たせないサブクラスや Adapter があるとき、取り決めを使う側ごとに分けます。
            </li>
            <li>
              <ChapterLink n={72} />：通知の種類と送り方の組み合わせが増えるとき、継承ではなく組み合わせで作ります。
            </li>
            <li>
              <ChapterLink n={80} />：事前条件・事後条件・不変条件を、例外・検証・DB の制約で書く方法を扱います。
            </li>
            <li>
              <ChapterLink n={83} />：手順2で見た「毎晩同じ SMS を送り直す」問題は、ジョブを何度実行しても結果が変わらないようにする冪等性の問題でもあります。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          サブクラスは親の型として使われるときの約束（事前条件・事後条件・投げる例外）を守ります。この章では SMS の長さの制約を送るときの例外から保存する前の検証に移し、親の取り決めを共通のテストにしました。親の型としてまとめて扱う呼び出し側が無い継承には、そこまでの取り決めのテストは求めません。
        </>
      ),
      benefit: {
        text: <>直す前は、82文字の SMS が BodyTooLong を出して一括送信が id=3 で止まり、長さの制限が無いメール（id=4）まで毎晩送られなかった。直した後は、長すぎる SMS は作る時点で保存されずに errors に理由が入り、ジョブから is_a? の分岐が消えた。</>,
        basis: <><ChapterLink n={65} section="scene" />、<ChapterLink n={65} section="apply" /></>,
      },
      cost: {
        text: <>検証を足す前に作られた長い本文の SMS が残っていないかを確かめ、直す作業が要る。サブクラスを足すたびに、親の取り決めを書いた共通のテスト（shared_examples）を it_behaves_like で通す必要がある。</>,
        basis: <ChapterLink n={65} section="apply" />,
      },
      alternative: {
        text: <>長い本文を70文字ずつに分けて複数通で送れば、SMS も親と同じく長さを問わずに本文を受け付け、データの修正も要らない。ただし通数が増えると費用が増え、文の途中で分かれるので、業務の側で決める必要がある。いちばん厳しい70文字の制約を親に上げると、メールで長い本文を送れなくなった。</>,
        basis: <><ChapterLink n={65} section="apply" />、<ChapterLink n={65} section="overuse" /></>,
      },
      criterion: {
        text: <>親の型としてまとめて扱う呼び出し側（一括の処理・一覧・共通のメソッド）があるか。サブクラスの違いを、保存する前の検証のように親の約束の範囲で表せるか。そのために、どれかのサブクラスの機能を削ったり、何も約束しない取り決めにしたりしていないか。</>,
        basis: <ChapterLink n={65} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>一括送信のジョブは Notification に deliver! を呼べば送れると考えて書かれていました。SMS のサブクラスだけが長い本文で例外を出し、ジョブは毎晩同じ位置で止まって、後ろの通知が送られませんでした。</li>
          <li>LSP は派生型を基底型の代わりに使っても期待される振る舞いが維持されることを求めます。Liskov の1987年の講演の置換の性質と、Liskov・Wing の1994年の振る舞いによる部分型に由来し、Martin が LSP と呼びました。</li>
          <li>サブクラスは事前条件を弱めてよいが強めてはならず、事後条件を強めてよいが弱めてはならず、親に無い例外を足してはなりません。Ruby には Eiffel の require else・ensure then のような構文が無いので、コメントと共通のテストで守ります。</li>
          <li>親の取り決めを shared_examples に書き、すべてのサブクラスの spec で it_behaves_like します。SMS の違反はこのテストの失敗として見つかりました。</li>
          <li>種類ごとの制約は送るときの例外ではなく保存する前の検証で表し、事後条件は親の deliver! にまとめます。切り替える前に、既存のデータが新しい検証に通るかを確かめて直します。</li>
          <li>呼び出し側の is_a? による分岐は LSP の違反を呼び出し側で補っている兆候です。</li>
          <li>いちばん厳しい制約を全部の種類に当てる直し方や、何も約束しない取り決めは当てはめすぎです。親の型としてまとめて扱う呼び出し側が無いなら、継承をやめる選択もあります。</li>
        </ul>
      ),
    },
  ],
  sources: [
    {
      title: 'The Liskov Substitution Principle',
      publisher: 'Robert C. Martin / The C++ Report（テキサス大学の教員のサイトに置かれた複製）',
      url: 'https://cs.utexas.edu/~downing/papers/LSP-1996.pdf',
      accessed: '2026-11-21',
      version: '1996年',
      note: 'LSP の言い換え（基底クラスを使う関数は派生クラスのオブジェクトをそれと知らずに使えなければならない）、Liskov の置換の性質の原文（出典は Liskov「Data Abstraction and Hierarchy」SIGPLAN Notices 23巻5号、1988年5月）、型を調べて分ける関数が OCP に反すること、正方形と長方形の例、設計の妥当性は使う側の前提で決まること、Meyer の事前条件・事後条件の規則の引用、PersistentSet の Add が例外を投げる例。',
    },
    {
      title: 'A Behavioral Notion of Subtyping',
      publisher: 'Barbara H. Liskov, Jeannette M. Wing / ACM Transactions on Programming Languages and Systems（カーネギーメロン大学の Wing のページの PDF）',
      url: 'https://www.cs.cmu.edu/~wing/publications/LiskovWing94.pdf',
      accessed: '2026-11-21',
      version: '16巻6号、1994年11月',
      note: '部分型の要件（型 T のオブジェクトについて証明できる性質は、部分型のオブジェクトでも成り立つべき）、不変条件と状態の移り変わりについての性質、事前条件・事後条件の規則、例外の規則。',
    },
    {
      title: 'ET: Inheritance',
      publisher: 'Eiffel Documentation（eiffel.org）',
      url: 'https://www.eiffel.org/doc/eiffel/ET-_Inheritance',
      accessed: '2026-11-21',
      note: '定義し直すときは事前条件を同じかより弱く、事後条件を同じかより強くする規則と、require else・ensure then による Assertion Redeclaration の規則。',
    },
    {
      title: 'activerecord/lib/active_record/inheritance.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/inheritance.rb#L7-L38`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.4.1',
      note: 'STI はクラス名を type 列に保存し、親のクラスで読むとサブクラスのオブジェクトを返すこと。',
    },
    {
      title: 'activerecord/lib/active_record/inheritance.rb（type_condition）',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/inheritance.rb#L327-L332`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.4.1',
      note: 'サブクラスで読むときの type の条件を、そのクラスと descendants の名前から作ること。',
    },
    {
      title: 'Autoloading and Reloading Constants（Single Table Inheritance）',
      publisher: 'Ruby on Rails Guides',
      url: 'https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html#single-table-inheritance',
      accessed: '2026-11-21',
      version: 'Rails 8.1',
      note: 'STI は遅延読み込みと相性が悪く、STI の階層を前もって読み込む必要があること。',
    },
    {
      title: 'Active Record Associations（Single Table Inheritance・Delegated Types）',
      publisher: 'Ruby on Rails Guides',
      url: 'https://guides.rubyonrails.org/v8.1/association_basics.html#single-table-inheritance-sti',
      accessed: '2026-11-21',
      version: 'Rails 8.1',
      note: 'STI はサブクラスと属性の違いが小さいときに向き、違いが大きいとテーブルの列が増えること。delegated_type で種類ごとの属性を別のテーブルに置けること。',
    },
    {
      title: 'activesupport/lib/active_support/cache.rb（Store#read）',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activesupport/lib/active_support/cache.rb#L490-L506`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.4.1',
      note: 'read はキーのデータがあれば返し、なければ nil を返すこと。',
    },
    {
      title: 'activesupport/lib/active_support/cache/null_store.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activesupport/lib/active_support/cache/null_store.rb#L5-L14`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.4.1',
      note: 'NullStore は何も保存せず、キャッシュのインターフェースを通す必要がある開発・テスト環境で使うこと。write・read・fetch の結果は Rails 8.1.4.1 で実行して確認した。',
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
      title: 'Rails Doctrine（Provide sharp knives）',
      publisher: 'rubyonrails.org',
      url: 'https://rubyonrails.org/doctrine',
      accessed: '2026-11-21',
      note: 'Ruby の強力な機能を禁止せず、規約・促し・教育で正しく使わせるという考え方。',
    },
    {
      title: 'String Functions and Operators（CHAR_LENGTH・LENGTH）',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/string-functions.html',
      accessed: '2026-11-21',
      version: 'MySQL 8.4',
      note: 'CHAR_LENGTH は文字（コードポイント）の数を、LENGTH はバイトの数を返すこと。',
    },
    {
      title: 'activerecord/lib/active_record/relation/batches.rb（find_each）',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/relation/batches.rb#L11-L37`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.4.1',
      note: 'find_each が1000件ずつ（batch_size の既定値）読み込み、主キーの昇順で処理すること。',
    },
    {
      title: 'Keynote address - data abstraction and hierarchy（書誌情報）',
      publisher: 'Crossref（DOI 10.1145/62138.62141 のメタデータ）',
      url: 'https://api.crossref.org/works/10.1145/62138.62141',
      accessed: '2026-11-21',
      version: "OOPSLA '87 Addendum、1987年",
      note: "Liskov の基調講演が OOPSLA '87（1987年10月4〜8日）の Addendum の17〜34ページに収められていること。ACM Digital Library の本文のページは取得できなかったため、講演の文の引用は Martin の記事による。",
    },
  ],
}

export default chapter
