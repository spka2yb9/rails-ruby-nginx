import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 41-1 場面の構成：2つのフォームと共通の検証 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="41-1"
      w={780}
      h={440}
      label="会員登録の User とお問い合わせの Inquiry が、共通の concern の ContactFields を include し、validates_contact_fields にフラグの引数を渡す。User は phone_required・mobile_only・unique_email・allow_international をすべて true にし、Inquiry は name_max: 100 と allow_international: true を渡す。ContactFields は名前の長さ、メールアドレスの形式と一意、電話番号の必須と形式を検証し、電話番号の形式は phone_format が上から順に判定する。1番目の allow_international が真なら国内の番号と国際形式を許し、2番目の mobile_only なら携帯だけ、それ以外は国内の番号。User は1番目の分岐に入るので mobile_only が使われず、固定電話の番号が通る。User は users テーブル、Inquiry は inquiries テーブルに保存する"
    >
      <Box x={20} y={30} w={210} h={56} lines={['User（会員登録）', 'SMS で本人確認する']} fs={12} bold subTone="muted" />
      <Box x={550} y={30} w={210} h={56} lines={['Inquiry（お問い合わせ）', '担当者が電話で折り返す']} fs={12} bold subTone="muted" />
      <Box x={20} y={104} w={210} h={92} lines={['phone_required: true', 'mobile_only: true', 'unique_email: true', 'allow_international: true']} fs={11} fill="bg" dashed mono align="start" />
      <Box x={550} y={104} w={210} h={92} lines={['name_max: 100', 'allow_international: true']} fs={11} fill="bg" dashed mono align="start" />
      <T x={20} y={212} fs={11} tone="muted">
        渡しているフラグ
      </T>
      <T x={550} y={212} fs={11} tone="muted">
        渡しているフラグ
      </T>
      <Box
        x={260}
        y={30}
        w={260}
        h={166}
        lines={['ContactFields（concern）', 'validates_contact_fields', '', '名前の必須と長さ', 'メールアドレスの形式・一意', '電話番号の必須・形式']}
        fs={12}
        fill="box2"
        bold
        subTone="muted"
      />
      <Arrow x1={230} y1={58} x2={258} y2={58} />
      <Arrow x1={550} y1={58} x2={522} y2={58} />
      <Arrow x1={390} y1={196} x2={390} y2={236} />
      <Box
        x={240}
        y={238}
        w={300}
        h={110}
        lines={['phone_format（上から順に判定）', '1. allow_international → 国内 + 国際形式', '2. mobile_only → 携帯だけ', '3. それ以外 → 国内の番号']}
        fs={12}
        fill="box5"
        accent
        align="start"
      />
      <Box x={20} y={270} w={190} h={52} lines={['users', 'name・email・phone']} fs={12} fill="box4" mono />
      <Box x={570} y={270} w={190} h={52} lines={['inquiries', 'name・email・phone・body']} fs={12} fill="box4" mono />
      <Arrow x1={115} y1={226} x2={115} y2={268} dashed />
      <Arrow x1={665} y1={226} x2={665} y2={268} dashed />
      <T x={240} y={372} fs={12} tone="danger">
        User は両方のフラグが true なので 1 に入り、mobile_only が使われない
      </T>
      <T x={240} y={392} fs={12} tone="danger">
        → 会員登録で固定電話の番号が通り、SMS を送れない
      </T>
      <T x={20} y={426} fs={11} tone="muted">
        破線の矢印は保存先のテーブル
      </T>
    </Svg>
  )
}

/* ---------- 図 41-2 フラグの引数が増える過程 ---------- */
const flagRows: { side: 'both' | 'user' | 'inquiry'; req: string[]; left?: string[]; change: string[]; danger?: boolean }[] = [
  { side: 'both', left: ['会員登録の検証が', 'すでにある'], req: ['お問い合わせのフォームを作る', '会員登録と同じ検証だった'], change: ['共通化する', '引数 0 個'] },
  { side: 'user', req: ['SMS で本人確認する', '電話番号を必須・携帯だけに'], change: ['+ phone_required:', '+ mobile_only:（2 個）'] },
  { side: 'inquiry', req: ['会社名と部署名を書く人がいる', '名前を100文字まで'], change: ['+ name_max:', '（3 個）'] },
  { side: 'user', req: ['メールアドレスを一意にする', '大文字と小文字を区別しない'], change: ['+ unique_email:', '（4 個）'] },
  { side: 'inquiry', req: ['海外の顧客から問い合わせがある', '+ から始まる番号を許す'], change: ['+ allow_international:', '（5 個、分岐 3 つ）'] },
  { side: 'user', req: ['海外在住の会員を受け付ける', 'allow_international: true を渡す'], change: ['フラグの組み合わせで', '固定電話が通る'], danger: true },
]

function FlagsFigure() {
  const rowH = 62
  const top = 50
  return (
    <Svg
      id="41-2"
      w={780}
      h={top + flagRows.length * rowH + 20}
      label={`共通の検証にフラグの引数が増えていった順序。${flagRows
        .map((r, i) => `${i + 1}. ${r.side === 'user' ? '会員登録' : r.side === 'inquiry' ? 'お問い合わせ' : '両方'}：${r.req.join('、')}。共通の処理は ${r.change.join('')}`)
        .join('。')}`}
    >
      <T x={130} y={20} anchor="middle" bold>
        会員登録（User）の要望
      </T>
      <T x={390} y={20} anchor="middle" bold>
        共通の処理（ContactFields）
      </T>
      <T x={650} y={20} anchor="middle" bold>
        お問い合わせ（Inquiry）の要望
      </T>
      <line x1={390} y1={34} x2={390} y2={top + flagRows.length * rowH} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {flagRows.map((r, i) => {
        const y = top + i * rowH
        const leftOn = r.side !== 'inquiry'
        const rightOn = r.side !== 'user'
        return (
          <g key={r.req[0]}>
            <T x={6} y={y + 24} fs={12} bold>
              {i + 1}
            </T>
            {leftOn && <Box x={24} y={y} w={216} h={48} lines={r.left ?? r.req} fs={11} subTone="muted" />}
            {rightOn && <Box x={540} y={y} w={216} h={48} lines={r.req} fs={11} subTone="muted" />}
            {leftOn && <Arrow x1={240} y1={y + 24} x2={298} y2={y + 24} />}
            {rightOn && <Arrow x1={540} y1={y + 24} x2={482} y2={y + 24} />}
            <Box x={300} y={y + 4} w={180} h={40} lines={r.change} fs={11} fill={r.danger ? 'bg' : 'box2'} mono={!r.danger && i > 0} subTone={r.danger ? 'danger' : 'muted'} accent={r.danger} />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 41-3 共通化する時期（Rule of Three） ---------- */
function RuleOfThreeFigure() {
  const cols = [
    { x: 20, head: '1回目', act: ['そのまま書く'], boxes: ['User の検証'] },
    { x: 275, head: '2回目', act: ['重複に気づくが写して書く', '違いをコメントに残す'], boxes: ['User の検証', 'Inquiry の検証'] },
    { x: 530, head: '3回目', act: ['3つを並べて比べ、', '同じ所だけをまとめる'], boxes: ['User', 'Inquiry', 'DocumentRequest'] },
  ]
  return (
    <Svg
      id="41-3"
      w={780}
      h={380}
      label="共通化する時期。1回目は会員登録の検証をそのまま書く。2回目はお問い合わせで重複に気づくが、写して書き、違いをコメントに残す。3回目の資料請求で3つを並べて比べ、同じ所だけを EmailAddress にまとめる。この章の場面は、2回目で共通化したため、フラグの引数が増えていった"
    >
      {cols.map((c, i) => (
        <g key={c.head}>
          <Box x={c.x} y={14} w={230} h={34} lines={c.head} fs={13} fill={i === 2 ? 'box5' : 'box'} bold />
          <T x={c.x + 115} y={68} anchor="middle" fs={12}>
            {c.act[0]}
          </T>
          {c.act[1] && (
            <T x={c.x + 115} y={86} anchor="middle" fs={12}>
              {c.act[1]}
            </T>
          )}
          {i < 2 && <Arrow x1={c.x + 232} y1={31} x2={c.x + 253} y2={31} />}
        </g>
      ))}
      <Box x={55} y={110} w={160} h={40} lines="User の検証" fs={12} />
      <Box x={310} y={110} w={160} h={40} lines="User の検証" fs={12} />
      <Box x={310} y={170} w={160} h={40} lines="Inquiry の検証" fs={12} />
      <Arrow x1={390} y1={150} x2={390} y2={168} dashed plain />
      <T x={400} y={160} fs={11} tone="muted">
        似ている
      </T>
      <Box x={530} y={110} w={72} h={40} lines="User" fs={11} />
      <Box x={609} y={110} w={72} h={40} lines="Inquiry" fs={11} />
      <Box x={688} y={110} w={84} h={40} lines={['Document', 'Request']} fs={10} />
      <Arrow x1={566} y1={150} x2={630} y2={188} />
      <Arrow x1={645} y1={150} x2={645} y2={188} />
      <Arrow x1={730} y1={150} x2={665} y2={188} />
      <Box x={570} y={190} w={160} h={40} lines="EmailAddress" fs={12} fill="box5" accent mono />
      <T x={650} y={250} anchor="middle" fs={11} tone="muted">
        名前と電話番号はそれぞれに残す
      </T>
      <line x1={10} y1={276} x2={770} y2={276} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={20} y={298} fs={12} bold>
        この章の場面（早すぎる共通化）
      </T>
      <Box x={275} y={312} w={230} h={44} lines={['2回目で ContactFields に共通化']} fs={12} fill="bg" accent />
      <Arrow x1={505} y1={334} x2={528} y2={334} />
      <Box x={530} y={312} w={240} h={44} lines={['フラグの引数が5個に増え、', '片方の変更がもう片方に及ぶ']} fs={12} fill="bg" subTone="danger" />
    </Svg>
  )
}

/* ---------- 図 41-5 直す前と後 ---------- */
function BeforeAfterFigure() {
  return (
    <Svg
      id="41-5"
      w={780}
      h={360}
      label="直す前は、User と Inquiry が ContactFields の validates_contact_fields にフラグの引数を渡し、5つのフラグと4つの分岐を持つ共通の処理がすべての検証をする。直した後は、User は名前の長さ50と、携帯または国際形式の電話番号を、Inquiry は名前の長さ100と、書かれたとおりの電話番号を、DocumentRequest は会社名と名前を、それぞれのモデルで検証する。メールアドレスの空白の除去と形式、受け付けないドメインの検証だけを、引数のない EmailAddress にまとめ、3つのモデルが include する"
    >
      <T x={10} y={18} bold>
        直す前
      </T>
      <Box x={20} y={40} w={150} h={40} lines="User" fs={12} />
      <Box x={20} y={100} w={150} h={40} lines="Inquiry" fs={12} />
      <Arrow x1={170} y1={60} x2={218} y2={98} />
      <Arrow x1={170} y1={120} x2={218} y2={120} />
      <T x={196} y={72} fs={10} tone="muted">
        4 個
      </T>
      <T x={186} y={136} fs={10} tone="muted">
        2 個
      </T>
      <Box x={220} y={80} w={140} h={140} lines={['ContactFields', 'フラグ 5 個', '分岐 4 つ', '（2 つは未使用）', 'すべての検証']} fs={12} fill="box2" bold subTone="danger" />
      <T x={20} y={250} fs={12} tone="danger">
        片方の要望で変えた所が、
      </T>
      <T x={20} y={270} fs={12} tone="danger">
        もう片方の検証も変える
      </T>

      <line x1={378} y1={10} x2={378} y2={350} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={392} y={18} bold>
        直した後（3つ目のフォームの後）
      </T>
      <Box x={392} y={40} w={124} h={92} lines={['User', '名前 50 文字', '携帯か国際形式', 'メールの一意']} fs={11} bold subTone="muted" />
      <Box x={522} y={40} w={124} h={92} lines={['Inquiry', '名前 100 文字', '電話は書かれた', 'とおりに保存']} fs={11} bold subTone="muted" />
      <Box x={652} y={40} w={124} h={92} lines={['Document', 'Request', '会社名・名前']} fs={11} bold subTone="muted" />
      <Arrow x1={454} y1={132} x2={520} y2={186} />
      <Arrow x1={584} y1={132} x2={584} y2={186} />
      <Arrow x1={714} y1={132} x2={648} y2={186} />
      <Box x={470} y={188} w={228} h={84} lines={['EmailAddress（引数なし）', '空白の除去・形式', '受け付けないドメイン']} fs={12} fill="box5" bold accent subTone="muted" />
      <T x={392} y={300} fs={12} tone="acc">
        3つで同じ知識だけをまとめた
      </T>
      <T x={392} y={320} fs={11} tone="muted">
        名前と電話番号の検証は、モデルごとに残した
      </T>
      <T x={392} y={340} fs={11} tone="muted">
        矢印は include
      </T>
    </Svg>
  )
}

/* ---------- 図 41-6 重複を残すか、まとめるか ---------- */
function JudgeFigure() {
  const quads: { x: number; y: number; lines: string[]; fill: 'box5' | 'box' | 'bg'; accent?: boolean }[] = [
    { x: 110, y: 30, lines: ['2か所・同じ知識と確かめられた', '待たずにまとめる', '例：受け付けないドメインの一覧', '税率（DRY の章）'], fill: 'box5', accent: true },
    { x: 450, y: 30, lines: ['3か所以上・同じ知識と確かめられた', 'まとめる（遅れている）', '例：3つのフォームの', 'メールアドレスの扱い'], fill: 'box5' },
    { x: 110, y: 210, lines: ['2か所・同じ知識かまだ分からない', '写して書き、違いを残して待つ（WET）', '例：会員登録とお問い合わせの検証'], fill: 'box' },
    { x: 450, y: 210, lines: ['3か所以上・同じ知識かまだ分からない', '並べて比べ、同じ所だけまとめる', '例：名前と電話番号は', 'フォームごとに残した'], fill: 'box' },
  ]
  return (
    <Svg
      id="41-6"
      w={780}
      h={420}
      label="横軸は重複している場所の数（2か所と3か所以上）、縦軸は同じ知識だと確かめられたかどうか。2か所で同じ知識と確かめられたものは、受け付けないドメインの一覧や税率のように、待たずにまとめる。3か所以上で同じ知識と確かめられたもの、たとえば3つのフォームのメールアドレスの扱いはまとめる。2か所で同じ知識かまだ分からないものは、会員登録とお問い合わせの検証のように、写して書き、違いを残して待つ。3か所以上でまだ分からないものは、並べて比べて同じ所だけをまとめ、名前と電話番号はフォームごとに残した"
    >
      {quads.map((q) => (
        <Box key={q.lines[0]} x={q.x} y={q.y} w={320} h={160} lines={q.lines} fs={12} fill={q.fill} bold accent={q.accent} subTone="muted" />
      ))}
      <T x={55} y={100} anchor="middle" fs={12} bold>
        同じ知識と
      </T>
      <T x={55} y={118} anchor="middle" fs={12} bold>
        確かめられた
      </T>
      <T x={55} y={280} anchor="middle" fs={12} bold>
        まだ
      </T>
      <T x={55} y={298} anchor="middle" fs={12} bold>
        分からない
      </T>
      <Arrow x1={110} y1={392} x2={770} y2={392} />
      <T x={270} y={408} anchor="middle" fs={12} bold>
        重複が2か所
      </T>
      <T x={610} y={408} anchor="middle" fs={12} bold>
        重複が3か所以上
      </T>
    </Svg>
  )
}

/* ---------- 図 41-7 Rails で重複を残す所・まとめる所 ---------- */
const railsRows: [string, string, string][] = [
  ['scaffold の生成するコントローラー', '7つのアクションをコントローラーごとに書き出す', 'リソースごとに変えるので残す'],
  ['validates の宣言', '1つの属性の検証を1行で宣言する', '2か所までは各モデルに書く'],
  ['normalizes（Rails 7.1 から）', '代入と検証のときに値を整える', 'User の電話番号のハイフン'],
  ['concern', '宣言とメソッドを1つのモジュールにまとめる', 'EmailAddress（引数なし）'],
  ['ActiveModel::EachValidator', '1つの属性の検証を1つのクラスにする', '列名が違うとき（contact_email）'],
  ['RSpec の shared_examples', '同じ振る舞いの例を複数の spec で使う', '「メールアドレスを持つ」'],
  ['テストの準備のコード', '読みやすさを優先して重複を残す（DAMP）', 'build_user・build_inquiry'],
]

function RailsFigure() {
  const cols = [
    { x: 10, w: 230, head: 'Rails・RSpec の仕組み' },
    { x: 240, w: 290, head: '何をするか' },
    { x: 530, w: 240, head: 'この章での使い方' },
  ]
  const rowH = 38
  return (
    <Svg
      id="41-7"
      w={780}
      h={50 + railsRows.length * rowH + 10}
      label={`Rails と RSpec で重複を残す所とまとめる所。${railsRows.map((r) => `${r[0]}は${r[1]}。この章では${r[2]}`).join('。')}`}
    >
      {cols.map((c) => (
        <Box key={c.head} x={c.x} y={10} w={c.w} h={34} lines={c.head} fs={12} fill="box5" bold rx={0} />
      ))}
      {railsRows.map((r, i) => {
        const y = 44 + i * rowH
        return (
          <g key={r[0]}>
            <Box x={cols[0].x} y={y} w={cols[0].w} h={rowH} lines={r[0]} fs={12} fill="box" rx={0} align="start" />
            <Box x={cols[1].x} y={y} w={cols[1].w} h={rowH} lines={r[1]} fs={12} fill="bg" rx={0} align="start" />
            <Box x={cols[2].x} y={y} w={cols[2].w} h={rowH} lines={r[2]} fs={12} fill="bg" rx={0} align="start" />
          </g>
        )
      })}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 60,
  part: 8,
  title: 'WET：似ている2つの処理を、3つ目が来るまで共通化しない',
  summary:
    '会員登録とお問い合わせの入力の検証を、2つ目のフォームを作った時点で1つの concern にまとめ、フラグの引数が5個に増えて片方の変更がもう片方の検証を変えてしまったコードを例に、WET を扱います。共通の処理を呼び出し側に戻し、3つ目のフォームが来てから3つを並べて、同じ知識であるメールアドレスの扱いだけをまとめます。同じ知識と分かっている一覧まで写し続けたときの失敗も確かめます。',
  goals: [
    '2つの例だけで共通化すると、フラグの引数と分岐が増え、片方の変更がもう片方に及ぶ理由を説明できる',
    'WET と Rule of Three の意味と出典、DRY・AHA との関係を説明できる',
    '誤った共通の処理を呼び出し側に戻し、3つの例を並べて同じ所だけをまとめる手順を実行できる',
    '同じ知識だと分かっているものは2か所でもまとめる、という WET の当てはめすぎの見分け方を説明できる',
    'Rails の validates・normalizes・concern・EachValidator と RSpec の shared_examples を、重複を残す所とまとめる所に使い分けられる',
  ],
  prerequisites: [56, 59, 14],
  sections: [
    {
      id: 'scene',
      title: '会員登録とお問い合わせの検証を早く共通化したコード',
      body: (
        <>
          <p>
            この章では似ている2つの処理をいつ共通化するかを WET という考え方で扱います。<ChapterLink n={59} />の DRY は「同じ知識を1か所に書く」原則でした。WET は同じ知識かどうかを判断できるまで共通化を待つ考え方です。最初に、2つ目の処理ができた時点で共通化したために困ったコードを動かします。
          </p>
          <h3>そもそも何を検証するのか</h3>
          <p>
            会員制の EC サイトを考えます。このサイトには入力のフォームが2つあります。1つは会員登録で、名前・メールアドレス・電話番号を入力します。電話番号にはログインのときに本人確認のコードを SMS（携帯電話のショートメッセージ）で送ります。もう1つはお問い合わせで、名前・メールアドレス・電話番号（任意）・本文を入力します。電話番号は、担当者が折り返しの電話をかけるときに使います。
          </p>
          <p>
            Rails では、保存する前に入力が正しいかをモデルの<Term en="validation">バリデーション</Term>で確かめます。<code>validates :name, presence: true</code> と書くと、名前が空のレコードは <code>valid?</code> が false になり、保存されません（<ChapterLink n={14} section="validations" />）。2つのフォームはどちらも名前・メールアドレス・電話番号を検証します。
          </p>
          <p>
            Rails で複数のモデルに同じ検証を使わせるには、いくつかの方法があります。共通の親クラスを作って継承する、モジュール（Rails では多くの場合 concern）にして include する、検証だけを独立したクラス（バリデーター）にする、などです。この章の場面では concern を使いました。どの方法でも、まとめた処理は複数の呼び出し側から使われるので、変えるときは呼び出し側すべてへの影響を確かめることになります。
          </p>
          <h3>テーブル</h3>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_users_and_inquiries.rb"
            code={`
class CreateUsersAndInquiries < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t| # 会員
      t.string :name, null: false
      t.string :email, null: false, index: { unique: true }
      t.string :phone, null: false # SMS で本人確認のコードを送る
      t.timestamps
    end

    create_table :inquiries do |t| # お問い合わせ
      t.string :name, null: false
      t.string :email, null: false
      t.string :phone # 任意。折り返しの電話に使う
      t.text :body, null: false
      t.timestamps
    end
  end
end
`}
          />
          <h3>共通化した検証</h3>
          <p>
            お問い合わせのフォームを作ったとき、開発者は会員登録と同じ検証を書いていることに気づき、検証を1つの concern にまとめました。concern は複数のモデルに共通のメソッドや宣言を1つのモジュールに書く Rails の仕組みです（<ChapterLink n={31} section="concern" />）。その後、2つのフォームに別々の要望が来るたびに、要望ごとの違いを<Term en="flag argument">フラグの引数</Term>（true か false で処理を切り替える引数）で渡すようにしました。今のコードは次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="app/models/concerns/contact_fields.rb（直す前）"
            code={`
# 会員登録とお問い合わせに共通の入力チェック
# （お問い合わせのフォームを作ったとき、会員登録と同じ検証だったので共通化した）
module ContactFields
  extend ActiveSupport::Concern

  class_methods do
    def validates_contact_fields(name_max: 50, phone_required: false, mobile_only: false,
                                 unique_email: false, allow_international: false)
      before_validation :normalize_contact_fields
      validates :name, presence: true, length: { maximum: name_max }
      validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
      validates :email, uniqueness: { case_sensitive: false } if unique_email
      validates :phone, presence: true if phone_required
      validates :phone, format: { with: ContactFields.phone_format(mobile_only:, allow_international:) }, allow_blank: true
    end
  end

  def self.phone_format(mobile_only:, allow_international:)
    if allow_international
      /\\A(?:0\\d{9,10}|\\+[1-9]\\d{7,14})\\z/ # 国内の番号と、+ から始まる国際形式
    elsif mobile_only
      /\\A0[789]0\\d{8}\\z/ # 携帯の番号だけ（SMS を送るため）
    else
      /\\A0\\d{9,10}\\z/ # 国内の番号
    end
  end

  private

  def normalize_contact_fields
    self.email = email.to_s.strip
    self.phone = phone.to_s.delete("- ")
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/user.rb・app/models/inquiry.rb（直す前）"
            code={`
class User < ApplicationRecord
  include ContactFields

  # 海外在住の会員も登録できるように allow_international を足した
  validates_contact_fields phone_required: true, mobile_only: true, unique_email: true,
                           allow_international: true
end

class Inquiry < ApplicationRecord
  include ContactFields

  validates_contact_fields name_max: 100, allow_international: true
  validates :body, presence: true
end
`}
          />
          <p>
            <code>class_methods</code> の中に書いたメソッドは、concern を include したクラスのクラスメソッドになります。<code>URI::MailTo::EMAIL_REGEXP</code> は Ruby の標準ライブラリにあるメールアドレスの正規表現です。電話番号の正規表現の <code>0[789]0\d{'{8}'}</code> は、070・080・090 から始まる11桁を携帯の番号として扱うという、このサイトの決まりです。図 41-1 は2つのモデルと共通の処理の関係です。
          </p>
          <Figure n="41-1" title="場面の構成：2つのフォームと共通の検証" caption="実線の矢印は呼び出し（フラグの引数を渡す）、破線の矢印は保存先のテーブル。">
            <SceneFigure />
          </Figure>
          <h3>フラグの引数が増えた経緯</h3>
          <p>
            引数は最初からあったわけではありません。共通化した時点の <code>validates_contact_fields</code> には引数がなく、2つのフォームは同じ検証を使っていました。
          </p>
          <Code
            lang="ruby"
            title="app/models/concerns/contact_fields.rb（共通化した時点。抜粋）"
            code={`
  class_methods do
    def validates_contact_fields
      before_validation :normalize_contact_fields
      validates :name, presence: true, length: { maximum: 50 }
      validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
      validates :phone, format: { with: /\\A0\\d{9,10}\\z/ }, allow_blank: true
    end
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（共通化した時点のコードで、同じ値を2つのモデルに入れた）"
            code={`
User:    valid?=true phone=0312345678
Inquiry: valid?=true phone=0312345678
`}
          />
          <p>
            この時点では会員登録もお問い合わせも同じ動きで、固定電話の番号を受け付けてハイフンを取り除いていました。重複をなくした共通化として、自然な判断に見えます。その後の要望と、引数が増えた順序が図 41-2 です。
          </p>
          <Figure n="41-2" title="フラグの引数が増える過程" caption="上から下へ時間が進む。中央の列はそれぞれの要望で共通の処理に足した引数と、その時点の引数の数。">
            <FlagsFigure />
          </Figure>
          <p>
            要望はどれも片方のフォームだけのものでした。それでも検証が共通の処理にあるので、開発者は毎回 ContactFields を開き、もう片方のフォームが同じ引数を使っていないかを確かめる必要がありました。5番目の <code>allow_international</code> はお問い合わせのために足した引数です。6番目で会員登録も海外の番号を受け付けることになり、開発者はこの引数を会員登録でも渡しました。
          </p>
          <h3>テストを実行すると</h3>
          <p>2つのモデルのテストを実行しました。</p>
          <Code
            lang="ruby"
            title="spec/models/user_spec.rb（抜粋）"
            code={`
RSpec.describe User do
  def build_user(phone) = User.new(name: "山田太郎", email: "taro@example.com", phone:)

  it "国内の携帯の番号で登録できる（ハイフンは取り除く）" do
    user = build_user("090-1234-5678")
    expect(user).to be_valid
    expect(user.phone).to eq "09012345678"
  end

  it "海外の番号（国際形式）で登録できる" do
    expect(build_user("+1 415 555 0100")).to be_valid
  end

  it "国内の固定電話の番号では登録できない（SMS を送れない）" do
    expect(build_user("03-1234-5678")).not_to be_valid
  end
  # …（電話番号は必須、メールアドレスの一意は省略）
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec。失敗の行を抜き出した）"
            code={`
.....F..

Failures:

  1) User 国内の固定電話の番号では登録できない（SMS を送れない）
     Failure/Error: expect(build_user("03-1234-5678")).not_to be_valid
       expected #<User id: nil, name: "山田太郎", email: [FILTERED], phone: "0312345678", created_at: nil, updated_at: nil> not to be valid

8 examples, 1 failure
`}
          />
          <p>
            会員登録で、固定電話の番号 03-1234-5678 が通るようになりました。この番号には SMS を送れないので、この会員はログインのときに本人確認のコードを受け取れません。原因は <code>phone_format</code> の分岐の順序です。会員登録は <code>mobile_only</code> と <code>allow_international</code> の両方を true にしていますが、先に判定される <code>allow_international</code> の分岐に入るので、<code>mobile_only</code> が使われません。<code>allow_international</code> の分岐は、お問い合わせのために「国内の番号ならどれでもよい」として書かれたものでした。
          </p>
          <h3>共通の処理の中で直そうとすると</h3>
          <p>共通の処理を残したまま直すには、2つのフラグがどちらも true の場合の分岐を足すことになります。</p>
          <Code
            lang="ruby"
            title="app/models/concerns/contact_fields.rb（phone_format に分岐を足した）"
            code={`
  def self.phone_format(mobile_only:, allow_international:)
    if allow_international && mobile_only
      /\\A(?:0[789]0\\d{8}|\\+[1-9]\\d{7,14})\\z/ # 国内は携帯だけ、海外は国際形式（会員登録）
    elsif allow_international
      /\\A(?:0\\d{9,10}|\\+[1-9]\\d{7,14})\\z/ # 国内の番号と、+ から始まる国際形式
    elsif mobile_only
      /\\A0[789]0\\d{8}\\z/ # 携帯の番号だけ（SMS を送るため）
    else
      /\\A0\\d{9,10}\\z/ # 国内の番号
    end
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec）"
            code={`
8 examples, 0 failures
`}
          />
          <p>
            テストは通りました。ただし、分岐は4つになり、そのうち <code>elsif mobile_only</code> と <code>else</code> の2つは、今はどちらのフォームも通りません。真偽値のフラグは4個あるので組み合わせは16通りありますが、使っているのは会員登録とお問い合わせの2通りだけです。次に片方のフォームの要望が来たときも、残りの組み合わせで何が起きるかを考えてから変えることになります。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>片方のフォームの要望で足した分岐やフラグが、もう片方のフォームの検証を変えます。今回は、お問い合わせのための分岐が会員登録の「携帯だけ」という決まりを無効にしました。</li>
            <li>どちらのフォームを変えるときも共通の処理を開き、両方のテストと、使われていないフラグの組み合わせまで考える必要があります。</li>
            <li><code>validates_contact_fields phone_required: true, mobile_only: true, …</code> という呼び出しを読んでも、会員登録の電話番号がどの形式を受け付けるのかは、分岐の順序まで読まないと分かりません。</li>
            <li>2つのフォームが同じだったのは最初の時点だけでした。電話番号の使い道（SMS と、人による折り返し）は最初から違っていましたが、共通化した時点ではその違いがコードに表れていませんでした。</li>
          </ul>
          <p>
            2つ目のフォームを作った時点で共通化したくなる理由は、いくつもあります。コードレビューで「DRY に反する」と指摘される、重複を見つける静的解析のツールが警告を出す、同じコードを2回書くこと自体に抵抗がある、などです。どれも、コードの見た目が同じことを根拠にしています。2つのフォームの電話番号が同じ知識かどうかは、見た目からは判断できませんでした。
          </p>
          <p>次の節では、2つ目の時点で共通化を急がないための WET という考え方を説明します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'WET の意味と由来：3つ目の例を見てから共通化する',
      body: (
        <>
          <h3>決まった出典のない呼び名</h3>
          <p>
            <Term en="Write Everything Twice">WET</Term> は、DRY（Don't Repeat Yourself）の反対の語として使われる呼び名で、提唱者や最初の文献が決まっていません。2018年に Conlin Durbin は「Stop trying to be so DRY, instead Write Everything Twice (WET)」という記事で、WET を「『これは前に書かなかったか』と自問するのは2回まではよいが、3回目はない」と説明しました<Ref n={1} />。2回目までは書き写してよく、3回目で共通化するという意味です。
          </p>
          <p>
            Kent C. Dodds は2020年の「AHA Programming」で、WET を「Write Everything Twice」の略として紹介したうえで、DRY と同じように教条的で規定しすぎていると書き、AHA（Avoid Hasty Abstractions）を勧めています<Ref n={2} />。WET には、このように「3回目で共通化する」という決まりとして受け取られる面があります。本書では回数を決まりとしてではなく、判断の目安として扱います。
          </p>
          <p>本書での WET の定義は次のとおりです。</p>
          <ul>
            <li>重複を一時的に許し、早すぎる共通化を避ける。</li>
            <li>複数の実例を見てから、適切な抽象化を判断する。</li>
          </ul>
          <h3>Rule of Three</h3>
          <p>
            WET と同じ目安は <Term en="Rule of Three">Rule of Three</Term>（3回の規則）の名で、Martin Fowler の書籍『Refactoring』（初版1999年、第2版2018年）が紹介したものとして知られています<Ref n={3} /><Ref n={4} />。似たコードが3つ現れるまで重複を取り除くのを待つ、という目安です。J. B. Rainsberger は2025年の記事で、この目安には名前が付いてから四半世紀以上たっても、重複をすぐ取り除くか、抽象化を待つかで意見が分かれていると書いています<Ref n={4} />。
          </p>
          <p>
            テストのコードについても同じ目安が使われます。martinfowler.com に載った Ham Vocke の「The Practical Test Pyramid」は、読みやすさのためならテストの重複はかまわないとし、迷ったときは Rule of Three でリファクタリングの時期を決めるよう勧めています。同じ箇所には「Use before reuse」（再利用する前に、まず使う）という言葉もあります<Ref n={5} />。
          </p>
          <h3>なぜ3つ目まで待つのか</h3>
          <p>
            例が2つしかないと、2つの共通点が「同じ知識」なのか「たまたま同じ」なのかを見分ける材料が足りません。前の節の場面では、会員登録とお問い合わせの電話番号の検証は、作った時点では同じでした。しかし会員登録の電話番号は SMS を送るため、お問い合わせの電話番号は担当者が電話をかけるためのもので、変わる理由が最初から違っていました。2つの例だけでは、この違いはコードに現れません。3つ目の例があると、3つに共通する所と、例ごとに変わる所を比べられます。
          </p>
          <p>
            Sandi Metz は2016年の記事「The Wrong Abstraction」で、「重複は、誤った抽象化よりはるかに安い」と書き、誤った抽象化よりも重複を選ぶよう勧めています。共通の処理に引数を渡し、その値で処理を分ける条件が増えていくなら、その抽象化は誤っているとも書いています<Ref n={6} />。前の節の ContactFields はこの状態でした。
          </p>
          <p>
            DRY を名付けた Dave Thomas も、2003年のインタビューで、コードを生成するツールを作るときはたいていまず手で成果物を作り、もう一度同じことが必要になったときに自動化すると話しています。二度と必要にならなければツールを書かずに済み、必要になったときには手で作った成果物でツールの出力を確かめられるからです<Ref n={7} />。DRY と WET はどちらかを選ぶ原則ではありません。同じ知識だと確かめてから1か所にする、という順序で組み合わせます。
          </p>
          <p>図 41-3 は1回目・2回目・3回目にすることと、この章の場面がどこで道を外れたかを示しています。</p>
          <Figure n="41-3" title="共通化する時期（1回目・2回目・3回目）" caption="上の段が WET の進め方。下の段がこの章の場面で、2回目で共通化した。">
            <RuleOfThreeFigure />
          </Figure>
          <p>
            2回目に写して書くときは、似ているコードがどこにあるかと、どこが違うかをコメントに残します。3回目が来たときに、比べる相手をすぐ見つけられるようにするためです。あわせて、それぞれの場所にテストを書いておきます。3回目でまとめるときや、まとめたものを戻すときに、振る舞いが変わっていないかをテストで確かめられます。
          </p>
          <h3>回数の数え方</h3>
          <p>
            「3回」は、似たコードの行が3か所にあることではなく、同じ処理を必要とする使い道が3つあることとして数えます。たとえば同じフォームの中で、メールアドレスの検証を新規登録と更新の2か所に書いていても、使い道は「会員登録のフォーム」の1つです。反対に、見た目の違うコード（会員登録の携帯の番号と、お問い合わせの折り返しの番号）でも、どちらも「電話番号の検証」という使い道として数え、並べて比べる対象にします。
          </p>
          <p>
            3という数は厳密な基準ではなく、目安です。2つの例では「2つの共通点」しか見えませんが、3つあれば「3つすべてに共通する所」と「1つだけ違う所」を区別できる、というのがこの目安の考え方です。4つ目や5つ目の例が来てから共通点が見えることもあり、そのときは見えた時点でまとめます。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則</th>
                  <th scope="col">何を判断するか</th>
                  <th scope="col">WET との関係</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">DRY（<ChapterLink n={59} />）</th>
                  <td>同じ知識が複数の場所にあるか</td>
                  <td>WET で待った後、同じ知識と確かめた所を DRY で1か所にする</td>
                </tr>
                <tr>
                  <th scope="row">AHA（<ChapterLink n={76} />）</th>
                  <td>抽象化を急いでいないか、誤った抽象化をどう戻すか</td>
                  <td>WET は回数の目安、AHA は回数を決めずに「抽象化が正しいと感じられるまで待つ」</td>
                </tr>
                <tr>
                  <th scope="row">YAGNI（<ChapterLink n={58} />）</th>
                  <td>今必要のない機能を作っていないか</td>
                  <td>YAGNI は機能、WET は共通化（抽象化）を、必要が分かるまで作らない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            AHA の章では、誤った抽象化が育つ過程と、それを戻す手順を詳しく扱います（<ChapterLink n={76} section="meaning" />）。DRY と AHA のどちらを優先するかの比較は<ChapterLink n={93} section="dry-aha">終章の DRY と AHA の節</ChapterLink>で行います。
          </p>
        </>
      ),
    },
    {
      id: 'apply',
      title: '共通の処理を戻し、3つ目のフォームで同じ所だけをまとめる',
      body: (
        <>
          <h3>直す順序</h3>
          <ol>
            <li>共通の処理（ContactFields）を、それぞれのモデルに戻す。各モデルには、そのモデルが実際に使っていた検証だけを書く</li>
            <li>テストを実行し、会員登録の不具合が直ったことと、お問い合わせの検証が変わっていないことを確かめる</li>
            <li>重複を残したまま、似ている所と違う所をコメントに書く</li>
            <li>3つ目のフォームが来たら、3つの検証を並べて比べる</li>
            <li>3つで同じ知識だと確かめられた所だけを、引数のない concern にまとめる</li>
          </ol>
          <h3>手順1：共通の処理をモデルに戻す</h3>
          <p>
            共通の処理を呼び出し側に書き戻すことを<Term en="inline">インライン化</Term>と呼びます。Sandi Metz は誤った抽象化から抜け出す方法として、抽象化したコードを呼び出し側すべてにインライン化し、それぞれの呼び出し側が渡していた引数から、その呼び出し側が実際に通るコードだけを残す手順を挙げています<Ref n={6} />。会員登録が実際に通っていたのは <code>allow_international</code> の分岐ですが、これは前の節の不具合なので、インライン化と一緒に、会員登録の要望どおりの「国内の携帯か、国際形式」に直しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/user.rb（共通の処理を戻した後）"
            code={`
class User < ApplicationRecord
  # SMS で本人確認のコードを送るので、SMS の送信サービスが受け付ける形だけを許す
  DOMESTIC_MOBILE = /\\A0[789]0\\d{8}\\z/  # 国内の携帯の番号
  INTERNATIONAL = /\\A\\+[1-9]\\d{7,14}\\z/ # 海外在住の会員の番号（+ と国番号から始まる数字だけ）

  normalizes :email, with: ->(email) { email.strip }
  normalizes :phone, with: ->(phone) { phone.delete("- ") }

  validates :name, presence: true, length: { maximum: 50 }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }, uniqueness: { case_sensitive: false }
  validates :phone, presence: true, format: { with: Regexp.union(DOMESTIC_MOBILE, INTERNATIONAL) }
end
`}
          />
          <p>
            <code>normalizes</code> は属性に値を代入したときと検証のときに、渡した処理で値を整える Rails の宣言です<Ref n={8} /><Ref n={9} />。共通の処理の <code>before_validation</code> を、モデルごとの <code>normalizes</code> に置き換えました。<code>Regexp.union</code> は渡した正規表現のどれかに一致する正規表現を作ります。会員登録の電話番号が受け付ける形が、2つの定数の名前から読み取れるようになりました。
          </p>
          <p>
            お問い合わせはインライン化するときに担当者に使い道を確かめ、電話番号を整えずに書かれたとおり保存することにしました。担当者は「+44 (0)20 7946 0000」のような書き方のまま電話をかけるからです。
          </p>
          <Code
            lang="ruby"
            title="app/models/inquiry.rb（共通の処理を戻した後）"
            code={`
class Inquiry < ApplicationRecord
  # 担当者が電話で折り返すときに読む番号なので、書かれたとおりに保存する
  PHONE = /\\A\\+?[\\d\\- ()]{10,20}\\z/

  normalizes :email, with: ->(email) { email.strip }

  validates :name, presence: true, length: { maximum: 100 } # 会社名と部署名を書く人がいる
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, format: { with: PHONE }, allow_blank: true
  validates :body, presence: true
end
`}
          />
          <p>
            お問い合わせのテストに「電話番号は書かれたとおりに保存する」という例を足し、ContactFields のファイルを削除してからテストを実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec）"
            code={`
.........

Finished in 0.05218 seconds (files took 0.85328 seconds to load)
9 examples, 0 failures
`}
          />
          <p>
            会員登録の「固定電話の番号では登録できない」も通りました。会員登録の電話番号の検証を変えるときに読むのは User のファイルだけになり、お問い合わせのテストを気にする必要はなくなりました。
          </p>
          <p>
            インライン化そのものは振る舞いを変えない変更で、会員登録の電話番号の修正は振る舞いを変える変更です。この節では2つを続けて示しましたが、実際の作業ではコミットを分けると、レビューする人がどちらの変更で何が変わったかを追えます。インライン化の前後でテストを実行し、修正の前は失敗していた1件だけが修正の後に通ることを確かめます。
          </p>
          <h3>手順2：重複を残し、違いを書き留める</h3>
          <p>
            インライン化した後も、2つのモデルには似た行が残っています。名前の必須と長さ、メールアドレスの空白の除去と形式です。この時点ではまとめません。例が2つしかないので、どれが同じ知識かを判断する材料が足りないからです。代わりに、相手のファイルを見ればよいことをコメントに書いておきます（たとえば「メールアドレスの検証は Inquiry にもある。3つ目のフォームを作るときに比べる」）。
          </p>
          <h3>手順3：3つ目のフォームが来たら並べて比べる</h3>
          <p>
            しばらくして、法人向けの資料請求のフォームを作ることになりました。会社名・担当者の名前・メールアドレスを入力すると、資料の PDF をメールで送ります。電話番号は入力しません。3つのフォームの検証を並べました。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">項目</th>
                  <th scope="col">会員登録（User）</th>
                  <th scope="col">お問い合わせ（Inquiry）</th>
                  <th scope="col">資料請求（DocumentRequest）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">名前</th>
                  <td>必須・50文字まで</td>
                  <td>必須・100文字まで</td>
                  <td>必須・50文字まで（別に会社名が必須）</td>
                </tr>
                <tr>
                  <th scope="row">メールアドレス</th>
                  <td>前後の空白を除く・形式・一意</td>
                  <td>前後の空白を除く・形式</td>
                  <td>前後の空白を除く・形式</td>
                </tr>
                <tr>
                  <th scope="row">電話番号</th>
                  <td>必須・携帯か国際形式・ハイフンと空白を除く</td>
                  <td>任意・書かれたとおり</td>
                  <td>入力しない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            3つで同じなのは、メールアドレスの「前後の空白を除く」と「形式」です。これはどのフォームで受け取ったかに関係なく、このサイトがメールアドレスをどう扱うかという1つの決まりで、変えるときは3つとも同じに変えます。名前の長さはフォームごとに違い、電話番号は使い道が違います。一意かどうかは会員登録だけの決まりです。図 41-4 は項目ごとに共通化してよいかを判断した表です。
          </p>
          <Figure n="41-4" title="共通化してよいかの判断の表" caption="「受け付けないドメイン」は当てはめすぎの節で扱う項目。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">項目</th>
                    <th scope="col">3つで同じか</th>
                    <th scope="col">変える理由（決める人）</th>
                    <th scope="col">引数なしで書けるか</th>
                    <th scope="col">判断</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">メールアドレスの空白の除去と形式</th>
                    <td>同じ</td>
                    <td>サイト全体のメールアドレスの扱い（開発チーム）</td>
                    <td>書ける</td>
                    <td>まとめる（EmailAddress）</td>
                  </tr>
                  <tr>
                    <th scope="row">受け付けないドメインの一覧</th>
                    <td>同じ</td>
                    <td>不正な登録への対策（セキュリティの担当者）</td>
                    <td>書ける</td>
                    <td>まとめる（2か所の時点でまとめるべきだった）</td>
                  </tr>
                  <tr>
                    <th scope="row">名前の必須と長さ</th>
                    <td>長さが違う（50・100・50）</td>
                    <td>フォームごとに入力する内容</td>
                    <td>長さを渡す引数が要る</td>
                    <td>まとめない（1行の宣言なので残す）</td>
                  </tr>
                  <tr>
                    <th scope="row">電話番号の形式と整え方</th>
                    <td>違う</td>
                    <td>SMS の送信サービス、担当者の折り返し</td>
                    <td>フラグが要る</td>
                    <td>まとめない</td>
                  </tr>
                  <tr>
                    <th scope="row">メールアドレスの一意</th>
                    <td>会員登録だけ</td>
                    <td>会員を見分ける決まり</td>
                    <td>−</td>
                    <td>User に書く</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <h3>手順4：同じ所だけを引数のない concern にまとめる</h3>
          <p>メールアドレスの扱いを EmailAddress という concern にまとめ、3つのモデルで include します。</p>
          <Code
            lang="ruby"
            title="app/models/concerns/email_address.rb"
            code={`
# メールアドレスの扱い。会員登録・お問い合わせ・資料請求のどれでも同じ
module EmailAddress
  extend ActiveSupport::Concern

  included do
    normalizes :email, with: ->(email) { email.strip }
    validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  end
end
`}
          />
          <p>
            <code>included do … end</code> の中に書いた宣言は、concern を include したクラスの中で実行されます<Ref n={10} />。ContactFields と違い、EmailAddress は引数を受け取りません。呼び出し側ごとに変える所がないことが、3つで同じ知識だと判断した根拠です。
          </p>
          <Code
            lang="ruby"
            title="app/models/document_request.rb・app/models/user.rb・app/models/inquiry.rb（まとめた後）"
            code={`
class DocumentRequest < ApplicationRecord
  include EmailAddress

  validates :company_name, presence: true, length: { maximum: 100 }
  validates :name, presence: true, length: { maximum: 50 }
end

class User < ApplicationRecord
  include EmailAddress
  # …（DOMESTIC_MOBILE・INTERNATIONAL は同じなので省略）

  normalizes :phone, with: ->(phone) { phone.delete("- ") }

  validates :name, presence: true, length: { maximum: 50 }
  validates :email, uniqueness: { case_sensitive: false }
  validates :phone, presence: true, format: { with: Regexp.union(DOMESTIC_MOBILE, INTERNATIONAL) }
end

class Inquiry < ApplicationRecord
  include EmailAddress
  # …（PHONE は同じなので省略）

  validates :name, presence: true, length: { maximum: 100 } # 会社名と部署名を書く人がいる
  validates :phone, format: { with: PHONE }, allow_blank: true
  validates :body, presence: true
end
`}
          />
          <p>
            テストも同じように分けます。メールアドレスの振る舞いは RSpec の <code>shared_examples</code>（複数の spec で同じ例を使う仕組み<Ref n={11} />）に1回だけ書き、3つのモデルの spec から <code>it_behaves_like</code> で使います。
          </p>
          <Code
            lang="ruby"
            title="spec/support/email_address_examples.rb・spec/models/document_request_spec.rb"
            code={`
# EmailAddress を含むモデルに共通の例。record にはメールアドレス以外が正しいレコードを渡す
RSpec.shared_examples "メールアドレスを持つ" do
  it "前後の空白を取り除く" do
    record.email = "  taro@example.com\\n"
    expect(record.email).to eq "taro@example.com"
  end

  it "形式が正しくないメールアドレスを受け付けない" do
    record.email = "taro@"
    expect(record).not_to be_valid
    expect(record.errors[:email]).to be_present
  end
end

RSpec.describe DocumentRequest do
  it_behaves_like "メールアドレスを持つ" do
    let(:record) { DocumentRequest.new(company_name: "株式会社サンプル", name: "鈴木", email: "suzuki@example.co.jp") }
  end

  it "会社名は必須" do
    expect(DocumentRequest.new(name: "鈴木", email: "suzuki@example.co.jp")).not_to be_valid
  end
end
`}
          />
          <p>
            spec/support のファイルは、rails_helper.rb でコメントになっている <code>Rails.root.glob('spec/support/**/*.rb')</code> の行を有効にして読み込みました。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
DocumentRequest
  会社名は必須
  behaves like メールアドレスを持つ
    前後の空白を取り除く
    形式が正しくないメールアドレスを受け付けない

Inquiry
  電話番号は空でもよい
  国内の固定電話と海外の番号を受け付ける
  電話番号は書かれたとおりに保存する
  名前は100文字まで（会社名と部署名を書く人がいる）
  behaves like メールアドレスを持つ
    前後の空白を取り除く
    形式が正しくないメールアドレスを受け付けない

User
  国内の携帯の番号で登録できる（ハイフンは取り除く）
  海外の番号（国際形式）で登録できる
  国内の固定電話の番号では登録できない（SMS を送れない）
  電話番号は必須
  メールアドレスは大文字と小文字を区別せずに一意
  behaves like メールアドレスを持つ
    前後の空白を取り除く
    形式が正しくないメールアドレスを受け付けない

Finished in 0.07178 seconds (files took 0.83008 seconds to load)
16 examples, 0 failures
`}
          />
          <p>図 41-5 は直す前と、3つ目のフォームでまとめた後の構造を比べたものです。</p>
          <Figure n="41-5" title="直す前と後：フラグのある共通の処理と、引数のない concern" caption="直した後の矢印は include。名前と電話番号の検証は、それぞれのモデルに書いている。">
            <BeforeAfterFigure />
          </Figure>
          <p>
            メールアドレスの一意（<code>uniqueness</code>）は、会員を見分けるための会員登録だけの決まりなので、EmailAddress には入れず User に残しました。users テーブルの email 列には一意のインデックスもあります。インデックスは同時に登録されたときにも重複を防ぎ、バリデーションは利用者にエラーメッセージを出すので、2つは役割の違う表現として両方に書いています（<ChapterLink n={59} section="rails" />）。
          </p>
          <p>
            直す前は、すべての検証が ContactFields にあり、フラグで呼び出し側の違いを表していました。直した後は、3つで同じメールアドレスの扱いだけが EmailAddress にあり、名前と電話番号の検証はそれぞれのモデルにあります。<code>validates :name, presence: true, length: …</code> の行は3つのモデルに残っていますが、長さはフォームごとに決める値で、1行の宣言なので、まとめても読む量は減りません。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '重複を残しすぎたとき',
      body: (
        <>
          <p>
            WET の「2回目までは写してよい」を、どんな重複にも当てはめると、<ChapterLink n={59} section="scene" />の消費税の計算と同じ問題が起きます。この節では同じ知識だと分かっているものまで写したときの失敗を動かして確かめます。
          </p>
          <h3>2か所に写した「受け付けないドメイン」の一覧</h3>
          <p>
            このサイトでは使い捨てのメールアドレスを使った不正な登録や問い合わせを防ぐため、セキュリティの担当者が受け付けないメールのドメインの一覧を管理しています。資料請求のフォームを作る前、開発者は「まだ2か所だから」と考えて、会員登録とお問い合わせの両方のモデルに一覧を写していました。11月20日、セキュリティの担当者が trashmail.example を一覧に加え、開発者は会員登録の一覧だけを更新しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/user.rb・app/models/inquiry.rb（一覧を写していたときの抜粋）"
            code={`
class User < ApplicationRecord
  # …（省略）
  # 受け付けないメールのドメイン（セキュリティの担当者が管理する一覧。お問い合わせにも同じ一覧がある）
  BLOCKED_DOMAINS = %w[mailinator.example throwaway.example trashmail.example].freeze
  validate :email_domain_must_be_allowed

  private

  def email_domain_must_be_allowed
    errors.add(:email, "は受け付けていないドメインです") if BLOCKED_DOMAINS.include?(email.to_s.split("@").last)
  end
end

class Inquiry < ApplicationRecord
  # …（省略）
  # 受け付けないメールのドメイン（セキュリティの担当者が管理する一覧。会員登録にも同じ一覧がある）
  BLOCKED_DOMAINS = %w[mailinator.example throwaway.example].freeze
  # …（email_domain_must_be_allowed は User と同じ）
end
`}
          />
          <p>3つのフォームが trashmail.example のアドレスを拒否するかを確かめるテストを書きました。</p>
          <Code
            lang="ruby"
            title="spec/models/blocked_domains_spec.rb"
            code={`
require "rails_helper"

# セキュリティの担当者が 2026-11-20 に trashmail.example を受け付けないドメインに加えた
RSpec.describe "受け付けないメールのドメイン" do
  let(:email) { "spam@trashmail.example" }

  it "会員登録で拒否する" do
    expect(User.new(name: "山田", email:, phone: "09012345678")).not_to be_valid
  end

  it "お問い合わせで拒否する" do
    expect(Inquiry.new(name: "鈴木", email:, body: "質問です")).not_to be_valid
  end

  it "資料請求で拒否する" do
    expect(DocumentRequest.new(company_name: "株式会社サンプル", name: "鈴木", email:)).not_to be_valid
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/blocked_domains_spec.rb。失敗の行を抜き出した）"
            code={`
.FF

  1) 受け付けないメールのドメイン お問い合わせで拒否する
       expected #<Inquiry id: nil, name: "鈴木", email: [FILTERED], phone: nil, body: "質問です", created_at: nil, updated_at: nil> not to be valid

  2) 受け付けないメールのドメイン 資料請求で拒否する
       expected #<DocumentRequest id: nil, company_name: "株式会社サンプル", name: "鈴木", email: [FILTERED], created_at: nil, updated_at: nil> not to be valid

3 examples, 2 failures
`}
          />
          <p>
            お問い合わせは更新し忘れた一覧で検証しているので、新しいドメインを受け付けます。資料請求は後から作ったときに一覧を写すこと自体を忘れていて、どのドメインも拒否しません。一覧を写した場所の数だけ、更新の漏れが起きる場所が増えました。
          </p>
          <h3>WET の対象にならない重複</h3>
          <p>
            受け付けないドメインの一覧は、作った時点から「セキュリティの担当者が決めた1つの一覧」です。会員登録とお問い合わせで別々の一覧を持つ理由はなく、片方だけを変えることもありません。<ChapterLink n={59} section="overuse" />の判断の問いに当てはめると、「片方を変えるとき、もう片方も必ず同じに変えるか」は「はい」で、「受け付けないドメインの一覧」という名前も付きます。WET が待つのは、同じ知識かどうかを判断できないときです。判断できる重複は2か所の時点でまとめます。
          </p>
          <p>一覧と検証を EmailAddress に移しました。</p>
          <Code
            lang="ruby"
            title="app/models/concerns/email_address.rb（一覧を移した後）"
            code={`
# メールアドレスの扱い。会員登録・お問い合わせ・資料請求のどれでも同じ
module EmailAddress
  extend ActiveSupport::Concern

  # 受け付けないメールのドメイン（セキュリティの担当者が管理する一覧）
  BLOCKED_DOMAINS = %w[mailinator.example throwaway.example trashmail.example].freeze

  included do
    normalizes :email, with: ->(email) { email.strip }
    validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
    validate :email_domain_must_be_allowed
  end

  private

  def email_domain_must_be_allowed
    errors.add(:email, "は受け付けていないドメインです") if BLOCKED_DOMAINS.include?(email.to_s.split("@").last)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec）"
            code={`
...................

Finished in 0.07653 seconds (files took 0.80052 seconds to load)
19 examples, 0 failures
`}
          />
          <h3>重複を残すか、まとめるかの目安</h3>
          <p>図 41-6 は重複している場所の数と、同じ知識だと確かめられたかどうかの2つの軸で、とる行動を分けたものです。</p>
          <Figure n="41-6" title="重複を残すか、まとめるか" caption="横軸の「3か所」は目安。縦軸を先に判断し、同じ知識と確かめられたものは数を待たない。">
            <JudgeFigure />
          </Figure>
          <p>
            縦軸を先に見ます。同じ知識だと確かめられたもの（左上と右上）は、場所の数にかかわらずまとめます。WET の回数が意味を持つのは下の段で、同じ知識か分からないものを、例が増えるまで写して待ちます。右上は「3か所以上あり、同じ知識だと分かっているのに、まだまとめていない」状態で、当てはめすぎにあたります。
          </p>
          <p>
            同じ知識かどうかがはっきりしなくても、2か所の時点でまとめたほうがよい場合もあります。写した2か所が別のチームの持つコードにあり、片方を直したことがもう片方の担当者に伝わらない場合や、更新の漏れが金額やセキュリティの不具合になる場合です。このときは、まとめるか、少なくとも2か所の値が一致することを確かめるテストを書きます。<ChapterLink n={59} section="scene" />の consistency_spec.rb は、まとめる前に一致を確かめるテストの例です。
          </p>
          <p>次のような兆候があれば、重複を残しすぎていないかを見直します。</p>
          <ul>
            <li>同じ一覧や定数を、更新するたびに複数のファイルで直している。</li>
            <li>コメントに「〜にも同じものがある」と書かれた箇所が3つ以上ある。</li>
            <li>写した先の1か所だけが古い、という不具合が一度でも起きた。</li>
            <li>決める人が1人（1つのチーム）なのに、コードの中に複数の表現がある。</li>
            <li>同じ値の定数が、別の名前で複数のファイルに定義されている（BLOCKED_DOMAINS と DISPOSABLE_DOMAINS など）。</li>
          </ul>
          <p>
            反対に、重複をすぐ取り除く進め方もあります。Rainsberger は重複を取り除いてみて、後悔したらインライン化して戻せばよく、取り除くこと自体が設計の判断力を育てるとして、Rule of Three に厳密に従わない立場をとっています<Ref n={4} />。どちらの進め方でも、戻すときにテストで振る舞いを確かめられることが前提です。この章の場面でインライン化が安全にできたのも、2つのモデルのテストがあったからです。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能・規約と WET',
      body: (
        <>
          <h3>scaffold が書き出す重複</h3>
          <p>
            Rails の scaffold のジェネレーターは、リソースごとのコントローラーに index・show・new・edit・create・update・destroy の7つのアクションと、<code>set_〜</code>・<code>〜_params</code> のメソッドを書き出します。生成されるコントローラーは ApplicationController を直接継承し、7つのアクションを共通の親クラスにまとめません<Ref n={12} />。リソースが2つあれば、同じ形のコードが2つのコントローラーにできます。生成した後で、リソースごとに違う変更を加えていく前提のコードです。
          </p>
          <p>
            一方で、同じ scaffold が作るビューでは、new.html.erb と edit.html.erb がどちらも <code>render "form"</code> で同じ _form.html.erb を描画します<Ref n={17} />。新規作成と編集の画面に並ぶ入力欄は、どちらも「このリソースに入力する項目」という1つの知識なので、1つのパーシャルにしています。scaffold は、リソースの間の似たコード（コントローラー）は残し、1つのリソースの中の同じ知識（入力欄）はまとめる、という分け方で生成しています。
          </p>
          <h3>validates の宣言と、まとめる道具</h3>
          <p>
            Rails の検証は <code>validates :email, presence: true</code> のような1行の宣言です。宣言が2つのモデルに重なっても、読む量はほとんど変わらず、片方だけを変えるのも簡単です。そのため、2か所までの検証は各モデルに書いておき、3つ目で同じ知識と分かったときに、次の道具でまとめます。
          </p>
          <ul>
            <li>concern：宣言とメソッドをまとめて include する。この章の EmailAddress のように、引数なしで書けることを目安にする<Ref n={10} />。</li>
            <li>
              ActiveModel::EachValidator：1つの属性の検証を1つのクラスにする。<code>EmailValidator</code> というクラスを作ると、<code>validates :email, email: true</code> と書けるようになる<Ref n={13} />。属性の名前がモデルごとに違うとき（<code>email</code> と <code>contact_email</code> など）に向いている。
            </li>
            <li>
              <code>with_options</code>：同じオプション（<code>if:</code> など）を付ける宣言をまとめる<Ref n={13} />。1つのモデルの中の重複に使う。
            </li>
          </ul>
          <p>
            concern と EachValidator の違いを確かめるため、資料請求のメールアドレスの列名が <code>contact_email</code> だった場合を、この章のアプリを写した別のアプリで試しました。EmailAddress は <code>email</code> という属性の名前を前提にしているので、そのままでは使えません。EachValidator なら、属性の名前を宣言の側で渡せます。
          </p>
          <Code
            lang="ruby"
            title="app/validators/email_validator.rb・app/models/document_request.rb（列名が contact_email の場合）"
            code={`
# validates :email, email: true で使う。メールアドレスの形式と、受け付けないドメインを確かめる
class EmailValidator < ActiveModel::EachValidator
  BLOCKED_DOMAINS = %w[mailinator.example throwaway.example trashmail.example].freeze

  def validate_each(record, attribute, value)
    unless value.to_s.match?(URI::MailTo::EMAIL_REGEXP)
      record.errors.add(attribute, :invalid)
      return
    end
    record.errors.add(attribute, "は受け付けていないドメインです") if BLOCKED_DOMAINS.include?(value.split("@").last)
  end
end

class DocumentRequest < ApplicationRecord
  normalizes :contact_email, with: ->(email) { email.strip }

  validates :company_name, presence: true, length: { maximum: 100 }
  validates :name, presence: true, length: { maximum: 50 }
  validates :contact_email, presence: true, email: true
end
`}
          />
          <Code
            lang="ruby"
            title="script/each_validator.rb"
            code={`
r = DocumentRequest.new(company_name: "株式会社サンプル", name: "鈴木", contact_email: " spam@trashmail.example ")
p r.valid?
p r.contact_email
p r.errors.full_messages
r.contact_email = "suzuki@"
r.valid?
p r.errors.full_messages
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/each_validator.rb）"
            code={`
false
"spam@trashmail.example"
["Contact email は受け付けていないドメインです"]
["Contact email is invalid"]
`}
          />
          <p>
            <code>validates :contact_email, email: true</code> と書くと、Rails は <code>email:</code> というキーから EmailValidator というクラスを探し、属性ごとに <code>validate_each</code> を呼びます<Ref n={13} /><Ref n={15} />。app/validators に置いたクラスは自動で読み込まれます。属性名のエラーメッセージが英語なのは、このアプリのロケールが英語のままだからです。EachValidator は検証だけを受け持つので、値を整える <code>normalizes</code> はモデルの側に書いています。
          </p>
          <p>図 41-7 は Rails と RSpec で重複を残す所とまとめる所を、この章の使い方とあわせて並べたものです。</p>
          <Figure n="41-7" title="Rails と RSpec で重複を残す所・まとめる所" caption="EachValidator は、資料請求の列名が contact_email の場合として、別のアプリで試した。">
            <RailsFigure />
          </Figure>
          <Callout kind="note" title="Rails 7.0 での normalizes">
            <code>normalizes</code> は Rails 7.1 で Active Record に加わりました<Ref n={8} />。Rails 8.1 では Active Model の <code>ActiveModel::Attributes::Normalization</code> にあり、Active Record がそれを include しています<Ref n={9} />。Rails 7.0 では直す前のコードのように <code>before_validation</code> で値を整えます。
          </Callout>
          <h3>テストの重複（DAMP）</h3>
          <p>
            テストのコードは、本番のコードより重複を残すことが多い場所です。Google Testing Blog の記事は、単体テストでは DRY より <Term en="Descriptive And Meaningful Phrases">DAMP</Term> を優先するよう勧めています。DAMP は重複のなさよりも読みやすさを重視する考え方です。似たコードを繰り返すことになっても、テストが正しいことを読んで確かめやすくなる、と記事は説明しています<Ref n={14} />。
          </p>
          <p>
            この章の spec では <code>build_user</code>・<code>build_inquiry</code> のような準備のメソッドを各 spec の中に書き、共通のファイルにまとめていません。spec を開けば、どんなレコードで確かめているかがその場で読めます。一方で、EmailAddress の振る舞いは3つのモデルで同じ知識なので、<code>shared_examples</code> に1回だけ書きました。テストでも、まとめるかどうかを決める問いは本番のコードと同じです。テストの書き方の全体は<ChapterLink n={20} section="test-strategy" />で扱いました。
          </p>
          <h3>コードレビューでの問い</h3>
          <p>
            WET と DRY の判断は、コードレビューで意見が分かれやすい所です。「重複しているので共通化してほしい」と書く前と、書かれたときに、次の問いを確かめると、見た目の重複か知識の重複かを話し合えます。
          </p>
          <ul>
            <li>共通化する対象を使う場所は、いくつあるか。2つなら、3つ目の候補が見えているか。</li>
            <li>2つの場所は同じ人や同じ決まりの都合で変わるか。片方だけを変える要望が来たことはあるか。</li>
            <li>共通化した処理は引数なしで書けるか。呼び出し側ごとのフラグが要るなら、その違いは何の違いか。</li>
            <li>重複を残すなら、似ているコードの場所がコメントに書かれ、両方にテストがあるか。</li>
          </ul>
          <p>
            どの問いも、答えを出すには業務の知識が要ります。この章の場面では、会員登録の電話番号が SMS のためのものだと知っていれば、2つ目のフォームの時点で共通化を見送れました。コードだけを見て判断できないときは、仕様を決める人に「この2つは、いつも一緒に変わりますか」と確かめます。
          </p>
          <h3>Rails Doctrine との関係</h3>
          <p>
            Rails Doctrine の「Exalt beautiful code」は、美しいコードについて、できるだけ短く強力にすることよりも、宣言の流れのリズムを整えることだと書いています<Ref n={16} />。重複を残した <code>validates</code> の宣言は、モデルを開いた人がそのモデルの検証を上から順に読めます。共通化してコードを短くすることは目的ではなく、読む人と変える人の手間が減るときに選ぶ手段です。
          </p>
          <p>
            ほかの章との関係は次のとおりです。DRY で知識を1か所にする方法は<ChapterLink n={59} section="apply" />、誤った抽象化を戻す手順は<ChapterLink n={76} section="apply" />、AHA を当てはめすぎたときは<ChapterLink n={76} section="overuse" />、DHH の concern の使い方は<ChapterLink n={31} section="concern" />、バリデーションの仕組みは<ChapterLink n={14} section="validations" />で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>2つの例だけで共通化すると、片方の要望ごとにフラグの引数と分岐が増え、片方の変更がもう片方の検証を変えます。この章では、お問い合わせのための分岐が会員登録の「携帯だけ」という決まりを無効にしました。</li>
          <li>WET は決まった出典のない呼び名で、重複を一時的に許し、複数の実例を見てから抽象化を判断する考え方です。Fowler の『Refactoring』が紹介した Rule of Three と同じく、3つ目の例を共通化の目安にします。</li>
          <li>2つ目までは写して書き、似ている場所と違う所をコメントに残します。3つ目が来たら並べて比べ、引数なしで書ける同じ所だけをまとめます。</li>
          <li>誤った共通の処理は、呼び出し側にインライン化し、それぞれが実際に通るコードだけを残してから考え直します。テストがあれば安全に戻せます。</li>
          <li>同じ知識だと分かっている重複（セキュリティの担当者が決めた一覧など）は、WET の回数を待たずに2か所の時点でまとめます。</li>
          <li>Rails の validates は1行の宣言なので2か所までの重複は軽く、3つ目では concern・EachValidator・shared_examples でまとめます。テストの準備のコードは読みやすさのために重複を残します（DAMP）。</li>
          <li>コードレビューでは、使う場所の数、変わる理由、引数なしで書けるか、コメントとテストがあるかを問い、見た目の重複か知識の重複かを話し合います。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Stop trying to be so DRY, instead Write Everything Twice (WET)', publisher: 'DEV Community / Conlin Durbin', url: 'https://dev.to/wuz/stop-trying-to-be-so-dry-instead-write-everything-twice-wet-5g33', accessed: '2026-11-21', version: '2018年12月18日', note: 'WET（Write Everything Twice）の説明。「これは前に書かなかったか」と自問するのは2回まで、3回目はない。' },
    { title: 'AHA Programming', publisher: 'kentcdodds.com / Kent C. Dodds', url: 'https://kentcdodds.com/blog/aha-programming', accessed: '2026-11-21', version: '2020年6月22日', note: 'WET を Write Everything Twice とし、DRY と同様に教条的で規定しすぎていると評したこと。AHA（Avoid Hasty Abstractions）。' },
    { title: 'Refactoring: Improving the Design of Existing Code, 2nd Edition', publisher: 'Martin Fowler / Addison-Wesley（InformIT の書籍ページ）', url: 'https://www.informit.com/store/refactoring-improving-the-design-of-existing-code-9780134757599', accessed: '2026-11-21', version: '2018年11月19日刊（初版は1999年。https://martinfowler.com/books/refactoring.html ）', note: 'Rule of Three を紹介した書籍の版と出版年。書籍の該当箇所は直接確かめられず、下の Rainsberger の記事で Fowler が同書で Rule of Three を説明していることを確かめた。' },
    { title: 'Clarifying the Rule of Three in Refactoring', publisher: 'The jbrains Blog / J. B. Rainsberger', url: 'https://blog.jbrains.ca/permalink/clarifying-the-rule-of-three-in-refactoring', accessed: '2026-11-21', version: '2025年11月7日', note: 'Fowler が『Refactoring』で Rule of Three を説明したこと、3つの複製を見るまで重複の除去を待つという目安、意見が分かれていること、重複を積極的に取り除き後悔したらインライン化する立場。' },
    { title: 'The Practical Test Pyramid', publisher: 'martinfowler.com / Ham Vocke', url: 'https://martinfowler.com/articles/practical-test-pyramid.html', accessed: '2026-11-21', version: '2018年2月26日', note: 'テストでは読みやすさのための重複を認め、DRY と DAMP の釣り合いをとること。迷ったら Rule of Three でリファクタリングの時期を決めること。Use before reuse。' },
    { title: 'The Wrong Abstraction', publisher: 'sandimetz.com / Sandi Metz', url: 'https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction', accessed: '2026-11-21', version: '2016年1月20日', note: '重複は誤った抽象化よりはるかに安いこと。引数と条件の分岐が増えた抽象化は誤っていること。呼び出し側すべてにインライン化し、各呼び出し側が通るコードだけを残す手順。' },
    { title: 'Orthogonality and the DRY Principle（A Conversation with Andy Hunt and Dave Thomas, Part II）', publisher: 'Artima / Bill Venners', url: 'https://www.artima.com/articles/orthogonality-and-the-dry-principle', accessed: '2026-11-21', version: '2003年3月10日', note: 'Dave Thomas が、コードを生成するツールを作る前にまず手で成果物を作り、再び必要になったときに自動化すると話したこと。' },
    { title: 'Ruby on Rails 7.1 Release Notes（Add ActiveRecord::Base.normalizes）', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/7_1_release_notes.html', accessed: '2026-11-21', version: 'Rails 7.1', note: 'normalizes が Rails 7.1 で加わったこと。' },
    { title: 'activemodel/lib/active_model/attributes/normalization.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/attributes/normalization.rb#L75-L117`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'normalizes は代入と検証のときに値を整えること、何度適用しても同じ結果になるように書くこと、nil には既定で適用しないこと。Active Record は activerecord/lib/active_record/attributes.rb でこのモジュールを include する。' },
    { title: 'ActiveSupport::Concern', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveSupport/Concern.html', accessed: '2026-11-21', version: 'v8.1', note: 'included ブロックが include したクラスの中で評価されること、class_methods でクラスメソッドを定義すること。' },
    { title: 'Shared examples', publisher: 'RSpec Core', url: 'https://rspec.info/features/3-13/rspec-core/example-groups/shared-examples/', accessed: '2026-11-21', version: 'rspec-core 3.13', note: 'shared_examples で定義した例を it_behaves_like で使うこと。' },
    { title: 'railties/lib/rails/generators/rails/scaffold_controller/templates/controller.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/scaffold_controller/templates/controller.rb.tt#L1-L60`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'scaffold のコントローラーが ApplicationController を継承し、7つのアクションと set_〜・〜_params を書き出すこと。' },
    { title: 'Active Record Validations（Custom Validators・Grouping Conditional Validations）', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_validations.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'ActiveModel::EachValidator で属性ごとの独自の検証を作ること、with_options で条件付きの検証をまとめること。' },
    { title: 'Testing on the Toilet: Tests Too DRY? Make Them DAMP!', publisher: 'Google Testing Blog', url: 'https://testing.googleblog.com/2019/12/testing-on-toilet-tests-too-dry-make.html', accessed: '2026-11-21', version: '2019年12月3日', note: 'DAMP（Descriptive and Meaningful Phrases）。単体テストでは重複を増やしても読みやすさを優先し、DRY より DAMP に寄せること。' },
    { title: 'activemodel/lib/active_model/validations/validates.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/validations/validates.rb#L120-L132`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'validates のキー（email: など）を camelize して「〜Validator」のクラスを探し、validates_with に渡すこと。' },
    { title: 'The Rails Doctrine（Exalt beautiful code）', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: '美しいコードは、できるだけ短く強力にすることより、宣言の流れのリズムに関わること。' },
    { title: 'railties/lib/rails/generators/erb/scaffold/templates/new.html.erb.tt・edit.html.erb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/erb/scaffold/templates/new.html.erb.tt#L5`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'scaffold の new と edit のビューが、どちらも render "form" で同じ _form パーシャルを描画すること（edit.html.erb.tt も5行目）。' },
  ],
}

export default chapter
