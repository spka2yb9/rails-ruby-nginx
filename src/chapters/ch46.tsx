import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 82-2 エンティティと値オブジェクトの比較 ---------- */
function EntityValueFigure() {
  return (
    <Svg
      id="82-2"
      w={760}
      h={420}
      label="左はエンティティ。予約 id 1001 は、期間や合計を変えても id が同じなので同じ予約である。期間が同じでも id が 1001 と 1002 で違えば別の予約である。右は値オブジェクト。別々に作った Money 13200 JPY どうしは値が同じなので等しい。12000 JPY に 1200 JPY を足すと、元の値は変えずに新しい 13200 JPY が返る。下は、Reservation（エンティティ）が id のほかに、stay（DateRange）と total（Money）という値オブジェクトを属性に持ち、guest で Guest（エンティティ）を参照する関係。期間を変えるときは stay に新しい DateRange を代入する"
    >
      <T x={20} y={20} bold>
        エンティティ：主キー（id）で区別する
      </T>
      <Box x={20} y={40} w={150} h={74} lines={['Reservation id: 1001', '期間 12/1〜12/4', '合計 JPY 39600']} fs={12} bold />
      <Arrow x1={170} y1={77} x2={218} y2={77} />
      <T x={194} y={64} anchor="middle" fs={11} tone="muted">
        変更
      </T>
      <Box x={220} y={40} w={150} h={74} lines={['Reservation id: 1001', '期間 12/1〜12/5', '合計 JPY 52800']} fs={12} bold />
      <T x={20} y={134} fs={12}>
        属性が変わっても、id が同じなら同じ予約
      </T>
      <Box x={20} y={156} w={150} h={54} lines={['Reservation id: 1001', '期間 12/1〜12/4']} fs={12} bold />
      <T x={195} y={183} anchor="middle" fs={18}>
        ≠
      </T>
      <Box x={220} y={156} w={150} h={54} lines={['Reservation id: 1002', '期間 12/1〜12/4']} fs={12} bold />
      <T x={20} y={230} fs={12}>
        属性が同じでも、id が違えば別の予約
      </T>

      <line x1={392} y1={10} x2={392} y2={244} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={410} y={20} bold>
        値オブジェクト：値で区別する
      </T>
      <Box x={410} y={40} w={130} h={54} lines={['Money', '13200 JPY']} fs={12} bold mono />
      <T x={575} y={67} anchor="middle" fs={18}>
        ＝
      </T>
      <Box x={610} y={40} w={130} h={54} lines={['Money', '13200 JPY']} fs={12} bold mono />
      <T x={410} y={114} fs={12}>
        別々に作っても、値が同じなら等しい
      </T>
      <Box x={410} y={156} w={130} h={54} lines={['Money', '12000 JPY']} fs={12} bold mono />
      <Arrow x1={540} y1={183} x2={608} y2={183} dashed />
      <T x={575} y={146} anchor="middle" fs={11} mono>
        + 1200 JPY
      </T>
      <Box x={610} y={156} w={130} h={54} lines={['Money', '13200 JPY']} fs={12} bold mono fill="box5" />
      <T x={410} y={230} fs={12}>
        元の 12000 JPY は変えず、新しい値を返す
      </T>

      <line x1={10} y1={256} x2={750} y2={256} stroke="var(--fig-line)" />

      <T x={20} y={276} bold>
        エンティティ（Active Record のモデル）は、値オブジェクトを属性に持つ
      </T>
      <Box
        x={20}
        y={292}
        w={360}
        h={110}
        lines={['Reservation（エンティティ）', 'id: 1001', 'stay: DateRange（check_in_on・check_out_on）', 'total: Money（total_amount・total_currency）', 'guest: Guest（エンティティ）']}
        fs={12}
        bold
        align="start"
      />
      <T x={400} y={312} fs={12}>
        id が予約を区別する（== は id で比べる）。
      </T>
      <T x={400} y={336} fs={12}>
        stay と total は値オブジェクト。
      </T>
      <T x={400} y={360} fs={12}>
        期間を変えるときは stay の中身を書き換えず、
      </T>
      <T x={400} y={384} fs={12}>
        新しい DateRange を代入する。
      </T>
    </Svg>
  )
}

/* ---------- 図 82-3 端数と丸めの例 ---------- */
function RoundingFigure() {
  type Line = { code: string; result: string[]; note: string; tone: 'danger' | 'muted' | 'acc'; good?: boolean }
  const rows: { title: string; lines: [Line, Line] }[] = [
    {
      title: '12,000円の税込み（1円未満を切り上げ）',
      lines: [
        { code: '(12000 * 1.1).ceil', result: ['13200.000000000002', '→ 切り上げて 13201'], note: '1円多い', tone: 'danger' },
        { code: 'percent_of(Rational(10, 100), rounding: :ceil)', result: ['税 1200', '合計 13200'], note: '整数と分数で計算する', tone: 'muted', good: true },
      ],
    },
    {
      title: '4.35ドルをセントに直す',
      lines: [
        { code: '(4.35 * 100).floor', result: ['434.99999999999994', '→ 切り捨てて 434'], note: '1セント足りない', tone: 'danger' },
        { code: 'Money.parse("4.35", :USD)', result: ['435'], note: '文字列から整数で作る', tone: 'muted', good: true },
      ],
    },
    {
      title: '1000円を3人で分ける',
      lines: [
        { code: '1000 / 3 の結果を3回使う', result: ['333 + 333 + 333'], note: '合計 999円（1円消える）', tone: 'danger' },
        { code: 'Money.new(1000, :JPY).allocate([1, 1, 1])', result: ['334 + 333 + 333'], note: '合計 1000円', tone: 'muted', good: true },
      ],
    },
    {
      title: '105円の明細3行の消費税（10%、切り捨て）',
      lines: [
        { code: '明細ごとに丸めてから足す', result: ['10 + 10 + 10 = 30'], note: '丸める回数で結果が変わる', tone: 'muted' },
        { code: '合計 315円に1回だけ掛けて丸める', result: ['31'], note: '適格請求書の規則', tone: 'muted' },
      ],
    },
  ]
  const rowH = 128
  return (
    <Svg
      id="82-3"
      w={760}
      h={rows.length * rowH + 10}
      label="1段目：12000円に 1.1 を Float で掛けると 13200.000000000002 になり、切り上げると 13201 円で1円多い。Money の percent_of で税率を Rational(10, 100) として切り上げると、税 1200 円、合計 13200 円になる。2段目：4.35 に 100 を掛けると 434.99999999999994 になり、切り捨てると 434 セントで1セント足りない。Money.parse で文字列の 4.35 から作ると 435 セントになる。3段目：1000円を3人で分けるとき、1000 割る 3 の結果を3回使うと合計 999 円になり、1円消える。allocate で分けると 334、333、333 円で合計 1000 円になる。4段目：105円の明細3行の消費税を明細ごとに切り捨てると 10 円が3つで 30 円、合計 315 円に1回だけ掛けて切り捨てると 31 円になる。適格請求書では税率ごとに1回だけ丸める"
    >
      {rows.map((r, i) => {
        const y = i * rowH
        return (
          <g key={r.title}>
            {i > 0 && <line x1={10} y1={y} x2={750} y2={y} stroke="var(--fig-line)" strokeDasharray="3 4" />}
            <T x={20} y={y + 20} bold fs={13}>
              {r.title}
            </T>
            {r.lines.map((l, j) => {
              const by = y + 36 + j * 46
              return (
                <g key={l.code}>
                  <Box x={20} y={by} w={360} h={38} lines={l.code} mono={l.code.match(/^[A-Za-z(0-9]/) !== null} fs={11.5} />
                  <Arrow x1={380} y1={by + 19} x2={418} y2={by + 19} accent={l.good} />
                  <Box x={420} y={by} w={170} h={38} lines={l.result} mono fs={11.5} accent={l.good} />
                  <T x={604} y={by + 19} fs={12} tone={l.tone}>
                    {l.note}
                  </T>
                </g>
              )
            })}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 82-1 検証を生成時の1か所に集める ---------- */
function ValidateOnceFigure() {
  const before: [string, string, boolean][] = [
    ['予約の作成', 'そのまま探す', true],
    ['CSV の取り込み', 'strip だけ', false],
    ['会員登録', '正規表現と downcase', false],
  ]
  const after = ['予約の作成', 'CSV の取り込み', '会員登録']
  return (
    <Svg
      id="82-1"
      w={760}
      h={330}
      label="適用前は、入力の文字列が予約の作成、CSV の取り込み、会員登録の3つの処理にそのまま渡る。予約の作成は入力のまま探し、CSV の取り込みは前後の空白を除くだけ、会員登録は正規表現で検証して小文字にする。規則が少しずつ違い、検証を忘れる場所も出る。適用後は、入力の文字列を EmailAddress.new で1回だけ正規化・検証する。Guest の email に代入したときは EmailAddressType の cast から呼ばれる。正しくなければここで例外か nil になる。3つの処理は EmailAddress を受け取り、検証しない"
    >
      <T x={20} y={20} bold>
        適用前：使う場所ごとに検証する
      </T>
      <Box x={90} y={40} w={200} h={36} lines="入力の文字列" fs={12} fill="bg" />
      {before.map(([name, rule, bad], i) => {
        const x = 10 + i * 122
        return (
          <g key={name}>
            <Arrow x1={190} y1={76} x2={x + 57} y2={198} dashed={bad} />
            <Box x={x} y={200} w={114} h={52} lines={[name, rule]} fs={11} bold subTone={bad ? 'danger' : 'muted'} />
          </g>
        )
      })}
      <T x={20} y={282} fs={12} tone="danger">
        規則が少しずつ違い、
      </T>
      <T x={20} y={302} fs={12} tone="danger">
        検証を忘れる場所も出る
      </T>

      <line x1={382} y1={10} x2={382} y2={318} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={398} y={20} bold>
        適用後：作るときに1回だけ検証する
      </T>
      <Box x={410} y={40} w={200} h={36} lines="入力の文字列" fs={12} fill="bg" />
      <Arrow x1={510} y1={76} x2={510} y2={100} accent />
      <Box x={400} y={102} w={220} h={48} lines={['EmailAddress.new', '正規化と検証はここだけ']} fs={12} bold fill="box5" accent subTone="muted" />
      <Arrow x1={620} y1={126} x2={646} y2={126} />
      <Box x={648} y={104} w={104} h={44} lines={['正しくない', 'ときは例外']} fs={11} />
      {after.map((name, i) => {
        const x = 392 + i * 122
        return (
          <g key={name}>
            <Arrow d={`M 510 150 L 510 174 L ${x + 57} 174 L ${x + 57} 198`} accent />
            <Box x={x} y={200} w={114} h={52} lines={[name, '検証しない']} fs={11} bold subTone="muted" />
          </g>
        )
      })}
      <T x={398} y={282} fs={12}>
        受け取る側は、EmailAddress なら
      </T>
      <T x={398} y={302} fs={12}>
        検証済みの値として扱える
      </T>
    </Svg>
  )
}

/* ---------- 図 82-4 テーブルの列と値オブジェクトの対応 ---------- */
function ColumnsFigure() {
  return (
    <Svg
      id="82-4"
      w={760}
      h={372}
      label="rooms テーブルの nightly_price_amount（bigint）と nightly_price_currency（varchar(3)）は、composed_of で Room#nightly_price（Money）になる。reservations テーブルの check_in_on と check_out_on（date）は composed_of で Reservation#stay（DateRange）に、total_amount と total_currency は Reservation#total（Money）になる。reservations には check_in_on が check_out_on より前であることの CHECK 制約がある。guests テーブルの email（正規化した文字列）は、attribute と EmailAddressType で Guest#email（EmailAddress）になる。members テーブルの email は normalizes で正規化した文字列のまま Member#email になる"
    >
      <T x={20} y={18} fs={12} tone="muted">
        テーブルの列（MySQL）
      </T>
      <T x={300} y={18} fs={12} tone="muted">
        つなぐ機能
      </T>
      <T x={510} y={18} fs={12} tone="muted">
        モデルの属性
      </T>

      <Box x={20} y={30} w={260} h={64} lines={['rooms', 'nightly_price_amount（bigint）', 'nightly_price_currency（varchar(3)）']} fs={12} bold fill="box4" subTone="muted" />
      <Arrow x1={280} y1={62} x2={508} y2={62} />
      <T x={394} y={52} anchor="middle" fs={12} mono>
        composed_of
      </T>
      <Box x={510} y={40} w={240} h={44} lines={['Room#nightly_price', 'Money']} fs={12} bold subTone="muted" />

      <Box x={20} y={112} w={260} h={92} lines={['reservations', 'check_in_on・check_out_on（date）', 'total_amount・total_currency', 'CHECK check_in_on < check_out_on']} fs={12} bold fill="box4" subTone="muted" />
      <Arrow x1={280} y1={136} x2={508} y2={128} />
      <Arrow x1={280} y1={170} x2={508} y2={178} />
      <T x={394} y={118} anchor="middle" fs={12} mono>
        composed_of
      </T>
      <T x={394} y={190} anchor="middle" fs={12} mono>
        composed_of
      </T>
      <Box x={510} y={106} w={240} h={44} lines={['Reservation#stay', 'DateRange']} fs={12} bold subTone="muted" />
      <Box x={510} y={156} w={240} h={44} lines={['Reservation#total', 'Money']} fs={12} bold subTone="muted" />

      <Box x={20} y={222} w={260} h={50} lines={['guests', 'email（正規化した文字列・一意索引）']} fs={12} bold fill="box4" subTone="muted" />
      <Arrow x1={280} y1={247} x2={508} y2={247} />
      <T x={394} y={236} anchor="middle" fs={12} mono>
        attribute
      </T>
      <T x={394} y={260} anchor="middle" fs={11} tone="muted">
        EmailAddressType
      </T>
      <Box x={510} y={225} w={240} h={44} lines={['Guest#email', 'EmailAddress']} fs={12} bold fill="box5" subTone="muted" />

      <Box x={20} y={290} w={260} h={50} lines={['members', 'email（正規化した文字列・一意索引）']} fs={12} bold fill="box4" subTone="muted" />
      <Arrow x1={280} y1={315} x2={508} y2={315} />
      <T x={394} y={304} anchor="middle" fs={12} mono>
        normalizes
      </T>
      <Box x={510} y={293} w={240} h={44} lines={['Member#email', 'String（正規化済み）']} fs={12} bold subTone="muted" />
      <T x={380} y={362} anchor="middle" fs={11} tone="muted">
        DB には基本型の値で保存し、モデルの属性を読み書きするときに値オブジェクトと変換する
      </T>
    </Svg>
  )
}

/* ---------- 図 82-5 Attributes API の型による変換 ---------- */
function AttributeTypeFigure() {
  const col1 = 90
  const col2 = 340
  const col3 = 556
  const lane = (i: number) => 36 + i * 66
  const labels = ['代入', '保存', '読み込み', '検索']
  return (
    <Svg
      id="82-5"
      w={760}
      h={330}
      label="代入：文字列の '  Sato@Example.COM ' は cast で EmailAddress（sato@example.com）になる。保存：EmailAddress は serialize で文字列の 'sato@example.com' になって DB に入る。読み込み：DB の文字列は deserialize（既定で cast を呼ぶ）で EmailAddress になる。検索：Guest.where に渡した ' SATO@example.com' は cast を通らずに serialize に渡る。EmailAddressType の serialize は cast を呼んで正規化するので、検索の条件も 'sato@example.com' になる"
    >
      <T x={col1} y={18} fs={12} tone="muted">
        渡される値
      </T>
      <T x={col2} y={18} fs={12} tone="muted">
        EmailAddressType のメソッド
      </T>
      <T x={col3} y={18} fs={12} tone="muted">
        結果
      </T>
      {labels.map((l, i) => (
        <T key={l} x={20} y={lane(i) + 23} fs={12} bold>
          {l}
        </T>
      ))}

      <Box x={col1} y={lane(0)} w={210} h={46} lines={'"  Sato@Example.COM "'} mono fs={12} fill="bg" />
      <Arrow x1={col1 + 210} y1={lane(0) + 23} x2={col2 - 2} y2={lane(0) + 23} />
      <Box x={col2} y={lane(0)} w={180} h={46} lines="cast" mono fs={12} />
      <Arrow x1={col2 + 180} y1={lane(0) + 23} x2={col3 - 2} y2={lane(0) + 23} dashed />
      <Box x={col3} y={lane(0)} w={190} h={46} lines={['EmailAddress', 'sato@example.com']} mono fs={11.5} bold />

      <Box x={col1} y={lane(1)} w={210} h={46} lines={['EmailAddress', 'sato@example.com']} mono fs={11.5} bold />
      <Arrow x1={col1 + 210} y1={lane(1) + 23} x2={col2 - 2} y2={lane(1) + 23} />
      <Box x={col2} y={lane(1)} w={180} h={46} lines="serialize" mono fs={12} />
      <Arrow x1={col2 + 180} y1={lane(1) + 23} x2={col3 - 2} y2={lane(1) + 23} dashed />
      <Box x={col3} y={lane(1)} w={190} h={46} lines={['guests.email', '"sato@example.com"']} mono fs={11.5} fill="box4" />

      <Box x={col1} y={lane(2)} w={210} h={46} lines={['guests.email', '"sato@example.com"']} mono fs={11.5} fill="box4" />
      <Arrow x1={col1 + 210} y1={lane(2) + 23} x2={col2 - 2} y2={lane(2) + 23} />
      <Box x={col2} y={lane(2)} w={180} h={46} lines={['deserialize', '既定で cast を呼ぶ']} fs={11.5} subTone="muted" />
      <Arrow x1={col2 + 180} y1={lane(2) + 23} x2={col3 - 2} y2={lane(2) + 23} dashed />
      <Box x={col3} y={lane(2)} w={190} h={46} lines={['EmailAddress', 'sato@example.com']} mono fs={11.5} bold />

      <Box x={col1} y={lane(3)} w={210} h={46} lines={['Guest.where(', '  email: " SATO@example.com")']} mono fs={11} fill="bg" align="start" />
      <Arrow x1={col1 + 210} y1={lane(3) + 23} x2={col2 - 2} y2={lane(3) + 23} accent />
      <Box x={col2} y={lane(3)} w={180} h={46} lines={['serialize', 'cast は通らない']} fs={11.5} subTone="muted" accent />
      <Arrow x1={col2 + 180} y1={lane(3) + 23} x2={col3 - 2} y2={lane(3) + 23} dashed accent />
      <Box x={col3} y={lane(3)} w={190} h={46} lines={['WHERE email =', "'sato@example.com'"]} mono fs={11.5} />

      <T x={20} y={318} fs={12}>
        serialize の中で cast を呼ぶので、検索の値も保存のときと同じ規則でそろう
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 46,
  part: 9,
  title: 'Value Object：金額・期間・メールアドレスに型を持たせる',
  summary:
    '宿泊予約の金額・宿泊期間・宿泊者のメールアドレスを、数値と文字列のままではなく、検証と計算を持つ不変の値オブジェクト（Money・DateRange・EmailAddress）にします。Data.define で値を定義し、composed_of・Attributes API の独自の型・normalizes で MySQL の列とつなぎ、端数の処理と DB の制約まで RSpec で確かめます。',
  goals: [
    '金額を Float で計算する、通貨の違う金額を足す、期間の開始と終了が逆になる、メールアドレスの表記の違いで重複する、という問題を Rails のコードで再現して説明できる',
    'エンティティ（id で区別する Active Record のモデル）と値オブジェクト（値で区別する）を区別し、どちらで設計するかを判断できる',
    '金額を通貨の最小単位の整数で持つ理由と、Float・DECIMAL・BigDecimal の違い、丸めの方法と丸める段階の決め方を説明できる',
    'Data.define で検証と正規化を initialize に集め、with と Comparable を使った不変の値オブジェクトを書ける',
    'composed_of・Attributes API の独自の型（cast・serialize・deserialize）・normalizes を使い分け、where で serialize だけが呼ばれることを踏まえて実装できる',
    '金額と通貨の2列、期間の2列と Range、CHECK 制約と一意索引で、DB の側でも値の規則を守れる',
    '値オブジェクトのよくある誤用と、money-rails や normalizes などほかの方法との使い分けを判断できる',
  ],
  prerequisites: [11, 33],
  sections: [
    {
      id: 'scene',
      title: '宿泊予約で金額・期間・メールアドレスを基本型のまま扱うと',
      body: (
        <>
          <p>
            この章の題材はホテルの宿泊予約のサイトです。利用者は部屋を選び、チェックインの日とチェックアウトの日、連絡先のメールアドレスを入力して予約します。サイトは1泊の料金に泊数を掛けて小計を出し、10% の消費税を足した合計（1円未満は切り上げ）を予約に保存します。国内向けの部屋は円で、海外向けのプランは米ドルで料金を決めています。宿泊者はメールアドレスで見分け、同じアドレスで2回予約した人は同じ宿泊者として扱います。
          </p>
          <p>
            この業務で扱う金額・期間・メールアドレスは、どれも数値か文字列で表せます。最初のコードは、それらを Float・Date・String のまま受け取り、コントローラーの中で計算しています。テーブルは次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261120000001_create_rooms_guests_reservations.rb（出発点）"
            code={`
create_table :rooms do |t|
  t.string :name, null: false
  t.float :nightly_price, null: false # 1泊の料金。ドルなら 9.95 のように小数で持つ
  t.string :currency, null: false     # "JPY"・"USD"
  t.timestamps
end

create_table :guests do |t|
  t.string :email, null: false
  t.timestamps
  t.index :email, unique: true
end

create_table :reservations do |t|
  t.references :room, null: false, foreign_key: true
  t.references :guest, null: false, foreign_key: true
  t.date :check_in_on, null: false
  t.date :check_out_on, null: false
  t.float :total, null: false
  t.string :currency, null: false
  t.timestamps
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/reservations_controller.rb（出発点）"
            code={`
class ReservationsController < ApplicationController
  TAX_RATE = 0.1

  def create
    room = Room.find(params[:room_id])
    check_in = Date.parse(params[:check_in_on])
    check_out = Date.parse(params[:check_out_on])
    nights = (check_out - check_in).to_i

    # 税込みの合計。1円未満（米ドルなら1セント未満）は切り上げる
    digits = room.currency == "USD" ? 2 : 0
    total = (room.nightly_price * nights * (1 + TAX_RATE)).ceil(digits)

    guest = Guest.find_or_create_by!(email: params[:email])
    reservation = room.reservations.create!(
      guest:, check_in_on: check_in, check_out_on: check_out,
      total:, currency: room.currency
    )
    render json: reservation.slice(:id, :guest_id, :total, :currency), status: :created
  end
end
`}
          />
          <p>
            create は部屋を探し、日付の文字列を Date にして泊数を求め、1泊の料金 × 泊数 × 1.1 を切り上げて合計にします。メールアドレスで宿泊者を探し、いなければ作り、予約を保存します。この API に4種類の予約を送りました。部屋はツイン（1泊 12,000円）、スイート（1泊 112,233円）、米ドルのツイン（1泊 9.95ドル）の3つです。
          </p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4。POST /reservations の応答と、その後の DB の値）"
            code={`
== A: 金額を Float で計算し、FLOAT の列に保存する
ツイン 1泊          => {"id" => 1, "guest_id" => 1, "total" => 13201.0, "currency" => "JPY"}
                       計算の途中: 12000 * 1 * (1 + 0.1) = 13200.000000000002
スイート 10泊       => 計算した合計 1234563  保存して読み直すと 1234560.0

== B: 通貨の違う金額を足す
米ドルのツイン 3泊  => {"id" => 3, "guest_id" => 1, "total" => 32.84, "currency" => "USD"}
sato の予約の合計   => 13233.840000152588  通貨=["JPY", "USD"]

== C: 開始と終了が逆の期間
12/4 〜 12/1        => {"id" => 4, "guest_id" => 3, "total" => -39600.0, "currency" => "JPY"}

== D: メールアドレスの表記の違い（guests.email は既定の照合順序 utf8mb4_0900_ai_ci）
"Sato@Example.COM"   => guest_id=1（既存の sato@example.com が見つかる）
"sato@example.com "  => guest_id=4（末尾に空白。新しい宿泊者になる）
guests: [[1, "sato@example.com"], [2, "suzuki@example.com"], [3, "tanaka@example.com"], [4, "sato@example.com "]]
Guest.find(1).email == "Sato@Example.COM" => false
email 列を utf8mb4_0900_bin にした場合:
"Sato@Example.COM"   => guest_id=5（新しい宿泊者になる）
`}
          />
          <h3>A：Float の計算と FLOAT の列で金額がずれる</h3>
          <p>
            12,000円の部屋に1泊すると、正しい合計は 13,200円です。ところが Ruby の Float で 12000 × 1.1 を計算すると 13200.000000000002 になり、切り上げると 13,201円になりました。Float は数を2進数で表すので、1.1 のような10進の小数を正確に表せず、わずかな誤差が残ります<Ref n={9} />。切り上げや切り捨ては、その誤差を1円の違いに変えます。
          </p>
          <p>
            スイートの10泊は、計算した合計が 1,234,563円なのに、保存して読み直すと 1,234,560円でした。Rails のマイグレーションの <code>t.float</code> は、MySQL では <code>float</code> の列を作ります（MySQL アダプターの型の対応表で <code>float: {'{'} name: "float", limit: 24 {'}'}</code>）<Ref n={11} />。MySQL の FLOAT は4バイトの単精度の浮動小数点数で、近似値を保存する型です<Ref n={10} />。有効数字が7桁ほどしかないので、7桁の金額で下の桁が失われました。
          </p>
          <h3>B：通貨の違う金額を足せてしまう</h3>
          <p>
            宿泊者 sato は円の予約と米ドルの予約を持っています。<code>sum(:total)</code> は 13,201 と 32.84 を足して 13233.840000152588 を返しました。円とドルを足した数に意味はありませんが、通貨は別の列の文字列なので、足し算を止めるものがありません。末尾の 0.000152588 は FLOAT の列に保存した 32.84 を倍精度で足したときの誤差です。
          </p>
          <h3>C：開始と終了が逆の期間が保存される</h3>
          <p>
            チェックインを 12/4、チェックアウトを 12/1 にすると、泊数が −3 になり、合計が −39,600円の予約が保存されました。期間の前後を確かめるコードがどこにもないからです。確かめるコードをこのアクションに足しても、管理画面での予約の変更や CSV の取り込みなど、期間を受け取るほかの処理にも同じ確認を書く必要があります。
          </p>
          <h3>D：メールアドレスの表記の違いで宿泊者が重複する</h3>
          <p>
            MySQL の文字列の比較は、列の<Term en="collation">照合順序</Term>で決まります。照合順序は文字列を比べたり並べたりするときの規則で、MySQL 8.4 の utf8mb4 の既定は <code>utf8mb4_0900_ai_ci</code> です<Ref n={14} />。名前の <code>_ai</code> はアクセントを区別しない、<code>_ci</code> は大文字と小文字を区別しないという意味です<Ref n={12} />。そのため <code>"Sato@Example.COM"</code> で探すと、既存の <code>sato@example.com</code> の行が見つかりました。
          </p>
          <p>
            一方、末尾に空白の付いた <code>"sato@example.com "</code> は別の宿泊者として登録されました。<code>utf8mb4_0900_ai_ci</code> は NO PAD の照合順序で、末尾の空白をほかの文字と同じように比べるからです<Ref n={13} />。一意索引も同じ照合順序で比べるので、重複を防げません。コピーして貼り付けたアドレスの末尾に空白が付くことはよくあります。
          </p>
          <p>
            大文字と小文字の違いも、DB の外では区別されます。Ruby の <code>==</code> は <code>"sato@example.com"</code> と <code>"Sato@Example.COM"</code> を別の文字列として比べるので、「予約したメールアドレスと入力が一致するか」のような判定が失敗します。また、email 列の照合順序を大文字と小文字を区別する <code>utf8mb4_0900_bin</code> にすると、<code>"Sato@Example.COM"</code> は新しい宿泊者になりました。MSDP の Rails の例が使う PostgreSQL でも、文字列の比較は既定で大文字と小文字を区別するので、同じように重複します。重複を防げるかどうかが DB の照合順序で変わる状態です。
          </p>
          <h3>問題点の整理</h3>
          <ul>
            <li>金額を Float で計算し、FLOAT の列に保存しているので、切り上げで1円多くなり、7桁の金額では下の桁が失われます。</li>
            <li>金額と通貨が別々の値なので、違う通貨の金額を足せます。</li>
            <li>期間の前後の確認がなく、確認を書くとしても期間を受け取る処理ごとに書くことになります。</li>
            <li>メールアドレスの空白や大文字・小文字の扱いが決まっておらず、重複するかどうかが DB の照合順序と Ruby の比較で食い違います。</li>
            <li>アクションの引数は文字列と数値の並びなので、チェックインとチェックアウトを取り違えても、どこでもエラーになりません。</li>
          </ul>
          <p>
            Martin Fowler と Kent Beck は『Refactoring』第2版で、業務の値を基本型（Integer・Float・String など、言語に組み込まれた型）のまま扱うことを<Term en="Primitive Obsession">基本型への執着</Term>と呼び、コードの問題の兆候に挙げています。金額・座標・範囲のような業務に役立つ型を作らずに済ませてしまう傾向のことで、改善の手順は基本型の値をオブジェクトに置き換える Replace Primitive with Object です<Ref n={2} />
            <Ref n={3} />。次の節から、この置き換えを Rails のコードで行います。
          </p>
        </>
      ),
    },
    {
      id: 'idea',
      title: '値の意味と制約を、小さな不変のオブジェクトにまとめる',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term en="Value Object">値オブジェクト</Term>は、金額・期間・メールアドレスのような値を、その意味と制約を持つ小さなオブジェクトとして表すパターンです。Martin Fowler は『Patterns of Enterprise Application Architecture』のカタログで、Value Object を「金額や日付の期間のような、小さく単純なオブジェクトで、等しいかどうかが同一性に基づかないもの」と説明しています<Ref n={1} />。同一性とは、2つの変数が同じ1つのオブジェクトを指しているかどうかのことです。値オブジェクトには次の3つの性質を持たせます。
          </p>
          <ul>
            <li>値による等価性：別々に作ったオブジェクトでも、持っている値がすべて同じなら等しい。</li>
            <li>不変性：作った後に値を変更できない。値を変えたいときは新しいオブジェクトを作る。</li>
            <li>生成時の検証：正しくない値ではオブジェクトを作れない。</li>
          </ul>
          <p>
            <ChapterLink n={33} section="value-objects" />では、Data.define で Money と DateRange を作る方法と、composed_of の基本を扱いました。この章ではその続きとして、前の節の4つの問題を値オブジェクトで直し、端数の処理、Attributes API の独自の型、normalizes、DB の制約まで含めて実装します。MSDP のカタログ（<ChapterLink n={39} section="catalog" />）では、Value Object は業務の処理を整理するパターンの1つです。
          </p>
          <h3>使う場面</h3>
          <p>
            値オブジェクトが必要になるのは、業務で意味を持つ値を基本型のまま扱っている場合です。対象になりやすいのは金額（数値と通貨の組）、期間（始まりと終わり）、形式の決まった文字列（メールアドレス、郵便番号）、単位を持つ数量（重量、距離）です。次のような兆候があれば、値オブジェクトにする候補です。
          </p>
          <ul>
            <li>同じ値の検証（メールアドレスの形式、期間の前後関係）が、複数のコントローラーやモデルに少しずつ違う形で書かれている</li>
            <li>メソッドの引数に数値や文字列が並び（<code>quote(check_in, check_out, price, currency, email)</code> など）、順序を取り違えても気付けない</li>
            <li>金額と通貨を別々の変数や列で持ち回り、違う通貨どうしを足すコードを書けてしまう</li>
            <li>金額の計算結果に 13200.000000000002 のような値が現れ、表示の直前に丸めて隠している</li>
          </ul>
          <h3>設計上の制約</h3>
          <ul>
            <li>値の意味と制約をコードで表したい。一方で、小さな値ごとにクラスを作ると、クラスとファイルが増える。</li>
            <li>一度検証した値は、検証し直さずに使いたい。一方で、外部（フォーム、JSON、DB）から来る値は、必ずどこかで検証する必要がある。</li>
            <li>金額は1円・1セントの誤差もなく計算したい。一方で、税や按分では割り切れない端数が出るので、その処理を業務の規則として決める必要がある。</li>
            <li>DB の列や JSON には、Ruby のオブジェクトをそのまま保存できない。プログラムの中では値オブジェクトとして扱いたいので、境界で変換するコードが要る。</li>
          </ul>
          <h3>解決方法</h3>
          <p>値オブジェクトは次の要素で構成します。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">この章の例</th>
                  <th scope="col">受け持つこと</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">値オブジェクトのクラス</th>
                  <td><code>Money</code>・<code>DateRange</code>・<code>EmailAddress</code>（app/models）</td>
                  <td>値と、その値に関する計算（足し算、泊数、重なりの判定、税の計算）を持つ</td>
                </tr>
                <tr>
                  <th scope="row">生成用のメソッド</th>
                  <td><code>new</code>（initialize で検証）・<code>Money.parse</code>・<code>DateRange.parse</code></td>
                  <td>文字列や数値を受け取り、表記の揺れをそろえてから検証し、値オブジェクトを作る</td>
                </tr>
                <tr>
                  <th scope="row">使う側</th>
                  <td><code>Room#quote</code>・<code>ReservationsController</code></td>
                  <td>値オブジェクトを受け取り、計算の手順だけを書く</td>
                </tr>
                <tr>
                  <th scope="row">境界での変換</th>
                  <td><code>composed_of</code>・<code>EmailAddressType</code>・JSON への変換</td>
                  <td>DB の列や JSON の基本型の値と、値オブジェクトを相互に変換する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            値による等価性：Ruby の <code>Data.define</code> で作ったクラスの <code>==</code> は、同じクラスですべての値が等しいときに true を返します。Hash のキーの照合に使う <code>eql?</code> と <code>hash</code> も値に基づくので、値オブジェクトを Hash のキーや <code>uniq</code> にそのまま使えます<Ref n={5} />。
          </p>
          <p>
            不変性：予約Aと予約Bが同じ期間のオブジェクトを参照しているときに、予約Aのためにその終わりの日を書き換えると、予約Bの期間も変わります。Fowler は、同じオブジェクトを複数の場所から参照していることで起きるこの誤りを<Term en="aliasing bug">エイリアシングのバグ</Term>と呼び、値オブジェクトを不変にすることで避けるとしています<Ref n={4} />。Eric Evans の DDD Reference も、値オブジェクトを不変として扱い、操作を副作用のない関数にするよう書いています<Ref n={6} />。この章の Money の足し算は自分を変えずに新しい Money を返します。
          </p>
          <p>
            生成時の検証：値オブジェクトは作るときに値を検証し、正しくなければ例外を投げます。正しくない値のオブジェクトは存在しないので、受け取った側は中身が正しい前提で使えます。同時に<Term en="normalization">正規化</Term>も行います。正規化は前後の空白や大文字・小文字のような表記の揺れを1つの形にそろえることです。メールアドレスの形式の検証には、WHATWG の HTML 仕様が <code>&lt;input type="email"&gt;</code> の「有効なメールアドレス」として定めた正規表現を使います。HTML 仕様はこの規則を、メールの書式の規格 RFC 5322 への「意図的な違反」と明記しています。RFC 5322 の書式は、そのままでは実用に向かないほど複雑だからです<Ref n={7} />。
          </p>
          <p>
            期間の終わりを含めるか：Fowler は、範囲を始まりと終わりの組として1つのオブジェクトで表すパターンを Range と呼び、端を含むかどうかを決める方法を挙げています<Ref n={8} />。この章の DateRange は、始まり（チェックイン）の日を含み、終わり（チェックアウト）の日を含まない<Term en="half-open interval">半開区間</Term>にします。泊数が日付の差そのものになり（12/1〜12/4 は3泊）、チェックアウトの日に次の予約が始まっても重なりません。<ChapterLink n={33} section="value-objects" />の DateRange は両端を含む閉区間でした。どちらにするかは業務で決め、値オブジェクトの中に1つだけ書きます。
          </p>
          <h3>構造</h3>
          <Figure n="82-1" title="検証を生成時の1か所に集める" caption="模式図。矢印はメールアドレスの値が渡る向き。破線の矢印は検証されずに渡る経路。CSV の取り込みと会員登録は説明のための処理。">
            <ValidateOnceFigure />
          </Figure>
          <p>
            図 82-1 はメールアドレスを検証する場所を比べたものです。左の適用前は、入力の文字列が3つの処理にそのまま渡り、それぞれが違う規則で検証し、検証しない処理もあります。右の適用後は、<code>EmailAddress.new</code> で1回だけ正規化と検証を行い、3つの処理は EmailAddress を受け取ります。Rails のモデルでは、属性に代入したときに型の cast からこの <code>new</code> が呼ばれるようにします（rails-impl の節で実装します）。
          </p>
          <p>
            Ruby には実行前の型の検査がありませんが、取り違えた引数は期待されたメソッド（泊数の <code>nights</code> など）を持たないので、実行時に NoMethodError になります。3つの値オブジェクトは互いを知らず、DB にも依存しないので、単独でテストできます。DB や JSON との変換は、値オブジェクトの外（composed_of と型のクラス）に置きます。
          </p>
        </>
      ),
    },
    {
      id: 'entity',
      title: 'エンティティと値オブジェクトの違い',
      body: (
        <>
          <p>
            値オブジェクトと対になるのが<Term en="Entity">エンティティ</Term>です。エンティティは属性（持っている値）ではなく識別子で区別されるオブジェクトです。Evans は、多くのオブジェクトは属性が変わっても同じものとして存在し続け、作られてから不要になるまでの期間（ライフサイクル）を経ると書いています<Ref n={6} />。宿泊予約は予約番号で区別され、期間や合計が変わっても同じ予約です。
          </p>
          <p>
            Rails の Active Record のモデルは、エンティティです。composed_of の API ドキュメントは、値オブジェクトは <code>==</code> で値を比べるのに対し、エンティティの同一性はオブジェクトか主キーのような識別子で決まり、通常の ActiveRecord::Base のクラスはエンティティだと説明しています<Ref n={16} />。実際に <code>==</code> は主キーで比べます。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/core.rb（632〜638行目）"
            href={`${GH}/activerecord/lib/active_record/core.rb#L632-L638`}
            code={`
    def ==(comparison_object)
      super ||
        comparison_object.instance_of?(self.class) &&
        primary_key_values_present? &&
        comparison_object.id == id
    end
    alias :eql? :==
`}
          />
          <p>
            同じオブジェクトであるか、同じクラスで主キーがあり、id が等しいときに true です<Ref n={17} />。値オブジェクトの Money と並べて確かめました。
          </p>
          <Code
            lang="text"
            title="実行結果（rails runner）"
            code={`
x = Guest.find(4); y = Guest.find(4)
x == y                    # => true（別々に読み込んだが id が同じ）
x.equal?(y)               # => false（別のオブジェクト）
[x, y].uniq.size          # => 1
Guest.new(email: "a@example.com") == Guest.new(email: "a@example.com")  # => false（id がない）

room  = Room.create!(name: "ツイン", nightly_price: Money.new(12_000, :JPY))
twin2 = Room.create!(name: "ツイン", nightly_price: Money.new(12_000, :JPY))
room == twin2                              # => false（属性が同じでも id が違う）
room.nightly_price == twin2.nightly_price  # => true（値が同じ）
`}
          />
          <Figure n="82-2" title="エンティティと値オブジェクトの比較" caption="模式図。実線の矢印は同じ予約の属性の変更、破線の矢印は + が返す新しい値を表す。">
            <EntityValueFigure />
          </Figure>
          <p>
            図 82-2 の上段の左は、id 1001 の予約が期間と合計を変えても同じ予約であること、期間が同じでも id が違えば別の予約であることを示しています。上段の右は、別々に作った Money でも値が同じなら等しく、足し算は元の値を変えずに新しい値を返すことを示しています。下段は、エンティティの Reservation が値オブジェクトの stay（DateRange）と total（Money）を属性に持ち、宿泊者の Guest（これもエンティティ）を参照する関係です。予約の期間を変えるときは、stay の中身を書き換えるのではなく、新しい DateRange を代入します。
          </p>
          <h3>どちらにするかの判断</h3>
          <p>
            ある値をエンティティと値オブジェクトのどちらで表すかは、「値が同じなら、別々に作ったものを入れ替えても困らないか」で判断します。13,200円の Money はどの予約の 13,200円と入れ替えても困りません。予約は、期間と部屋が同じでも、佐藤さんの予約と鈴木さんの予約を入れ替えると困ります。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">この章のクラス</th>
                  <th scope="col">種類</th>
                  <th scope="col">理由</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>Reservation</code>・<code>Room</code>・<code>Guest</code></th>
                  <td>エンティティ（Active Record）</td>
                  <td>id で区別し、属性を変えながら存在し続ける。予約は期間を変えても同じ予約</td>
                </tr>
                <tr>
                  <th scope="row"><code>Money</code></th>
                  <td>値オブジェクト</td>
                  <td>金額と通貨が同じなら入れ替えられる</td>
                </tr>
                <tr>
                  <th scope="row"><code>DateRange</code></th>
                  <td>値オブジェクト</td>
                  <td>始まりと終わりが同じ期間は入れ替えられる</td>
                </tr>
                <tr>
                  <th scope="row"><code>EmailAddress</code></th>
                  <td>値オブジェクト</td>
                  <td>宿泊者（Guest）がメールアドレスを変えても同じ宿泊者。アドレスそのものは値</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            同じ「メールアドレス」でも、宿泊者を表す Guest はエンティティで、Guest が持つアドレスは値オブジェクトです。Guest を EmailAddress で置き換えると、アドレスを変えた宿泊者が別人になり、過去の予約とのつながりが切れます。なお、Fowler は値オブジェクトの反対を参照オブジェクト（reference object）と呼び、エンティティは業務のモデルの中での呼び名だとしています<Ref n={4} />。
          </p>
        </>
      ),
    },
    {
      id: 'money',
      title: '金額を最小単位の整数で持ち、端数の処理を決める',
      body: (
        <>
          <h3>Float で金額を計算しない理由</h3>
          <p>
            Ruby の Float は<Term en="floating-point number">浮動小数点数</Term>で、数を2進数の有効数字と指数で表します。2進数では 0.1 や 1.1 のような10進の小数の多くを正確に表せないので、計算の結果に小さな誤差が残ります<Ref n={9} />。Ruby 4.0.9 で確かめました。
          </p>
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
0.1 + 0.2                 # => 0.30000000000000004
12000 * 1.1               # => 13200.000000000002
(12000 * 1.1).ceil        # => 13201
4.35 * 100                # => 434.99999999999994
(4.35 * 100).floor        # => 434
9.95 * 3                  # => 29.849999999999998
`}
          />
          <p>
            誤差は小さくても、切り上げ・切り捨てをすると1円や1セントの違いになります。表示の直前に <code>round(2)</code> で丸めて隠しても、途中で丸めた値を足し合わせると誤差が積み重なります。
          </p>
          <p>
            MySQL の列の型にも同じ注意が要ります。MySQL の FLOAT と DOUBLE は近似値を保存する型で、FLOAT は4バイトの単精度、DOUBLE は8バイトの倍精度です<Ref n={10} />。前の節で見たとおり、Rails の <code>t.float</code> は MySQL では FLOAT を作るので、7桁の金額でも下の桁が失われます。MySQL で直接確かめた結果です。
          </p>
          <Code
            lang="text"
            title="実行結果（MySQL 8.4）"
            code={`
SELECT CAST(123456.78 AS FLOAT), CAST(9.95 AS FLOAT) * 3, CAST(123456.78 AS DOUBLE);
=> 123457.0, 29.84999942779541, 123456.78
`}
          />
          <h3>金額を表す3つの方法</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">方法</th>
                  <th scope="col">MySQL の列と Ruby の型</th>
                  <th scope="col">向いている場合・注意</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">浮動小数点数</th>
                  <td>FLOAT・DOUBLE と Float</td>
                  <td>金額には使わない。誤差が切り上げ・切り捨てで1単位の違いになる</td>
                </tr>
                <tr>
                  <th scope="row">10進の小数</th>
                  <td>DECIMAL(p, s) と BigDecimal</td>
                  <td>小数点以下の桁数が決まった金額や、レートのような小数の値。割り算では桁数と丸めを指定する</td>
                </tr>
                <tr>
                  <th scope="row">最小単位の整数と通貨</th>
                  <td>BIGINT と通貨の列、Integer と Symbol</td>
                  <td>この章の方法。足し算と整数倍は誤差が出ない。率を掛けるときだけ丸める</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            この章の Money は、金額を通貨の<Term en="minor unit">最小単位</Term>の整数で持ちます。最小単位は円なら1円、米ドルなら1セントです。小数点以下の桁数は通貨コードの国際規格 ISO 4217 で通貨ごとに決まっていて、円は0桁、米ドルは2桁、バーレーン・ディナールは3桁です<Ref n={19} />。9.95ドルは 995 セントとして持ち、表示するときだけ 9.95 に戻します。
          </p>
          <p>
            DECIMAL の列は Rails では BigDecimal になります。BigDecimal は10進の小数を任意の精度で扱うクラスで、<code>BigDecimal("0.1") + BigDecimal("0.2") == BigDecimal("0.3")</code> は true です<Ref n={21} />。ただし、割り算の結果は有限の桁で打ち切られ、<code>BigDecimal("1") / 3 * 3</code> は 0.99999999999999999999999999999999 になりました。また、<code>BigDecimal("0.1") + 0.2</code> のように Float と混ぜてもエラーにならず、Float の値が入り込みます。BigDecimal は Ruby 3.4 から bundled gem になりましたが<Ref n={22} />、Rails の activesupport が依存しているので、Rails のアプリでは Gemfile.lock に入っています。
          </p>
          <h3>端数と丸め</h3>
          <p>
            整数で持っても、率を掛けると端数が出ます。端数をどの方向に丸めるかは業務の規則です。Ruby の <code>round</code> は既定で 0.5 を0から遠い方に丸め、<code>half: :even</code> を指定すると末尾が偶数になる方に丸めます<Ref n={18} />。後者は<Term en="banker's rounding">銀行家の丸め</Term>とも呼ばれ、四捨五入で 0.5 を常に切り上げることによる偏りを減らします。この章の Money は、率を Rational（分数で数を正確に表すクラス<Ref n={20} />）で受け取り、丸め方を引数で指定させます。
          </p>
          <Code
            lang="text"
            title="実行結果（Money#percent_of。税率 Rational(10, 100)）"
            code={`
29.85ドル（2985 セント）の税 298.5 セント
  floor: 298   ceil: 299   half_up: 299   half_even: 298
25円の税 2.5円
  floor: 2     ceil: 3     half_up: 3     half_even: 2
35円の税 3.5円
  half_up: 4   half_even: 4
`}
          />
          <p>
            0.5 ちょうどのとき、half_up は常に大きい方へ、half_even は偶数の方へ丸めます（2.5 は 2、3.5 は 4）。どの方法を使うかを値オブジェクトの外で暗黙に決めると、画面ごとに違う方法で丸める原因になるので、percent_of の引数で毎回明示させます。
          </p>
          <h3>丸める段階を決める</h3>
          <p>
            丸め方と同じくらい結果を変えるのが、どの段階で丸めるかです。105円の明細が3行ある請求の消費税（10%、切り捨て）を、明細ごとに丸めてから足すと 10 + 10 + 10 = 30円、合計の 315円に1回だけ掛けると 31円になります。
          </p>
          <Code
            lang="text"
            title="実行結果"
            code={`
lines = [Money.new(105, :JPY)] * 3
明細ごと   lines.map { it.percent_of(Rational(10, 100), rounding: :floor) }.sum(Money.new(0, :JPY))  # => 30
合計に1回  lines.sum(Money.new(0, :JPY)).percent_of(Rational(10, 100), rounding: :floor)          # => 31
`}
          />
          <p>
            日本の適格請求書（インボイス）では、消費税額の1円未満の端数処理は「一の適格請求書につき、税率ごとに1回」とされています<Ref n={23} />。この章の <code>Room#quote</code> も、税は小計に1回だけ掛けます。丸める段階は会計や税の担当者と確認し、コードではメソッドの名前と順序で表します。
          </p>
          <h3>按分</h3>
          <p>
            1,000円を3人で分けるとき、<code>1000 / 3</code> の結果の 333 を3回使うと合計が 999円になり、1円消えます。金額を比率で分けることを<Term en="allocation">按分</Term>と呼びます。Money の <code>allocate</code> は割り切れずに残った端数を先頭から1単位ずつ配り、合計を元の金額に一致させます。
          </p>
          <Figure n="82-3" title="端数と丸めの例" caption="矢印は、左の式を計算した結果を指す。青い矢印は Money で行う計算。4段目はどちらも誤りではなく、丸める回数による違い。">
            <RoundingFigure />
          </Figure>
          <p>
            図 82-3 の1〜3段目は、上の行が Float や整数の割り算で端数を失う計算、下の行が Money で同じ計算をした結果です。4段目は丸める段階の違いで、どちらを採るかは業務の規則で決めます。
          </p>
          <p>
            表示のために小数に戻すのは最後だけにします。Money の <code>to_s</code> は <code>"USD 32.84"</code> のような表示用の文字列を返しますが、計算には使いません。JSON で返すときも <code>{'{'} "amount": 3284, "currency": "USD" {'}'}</code> のように最小単位の整数と通貨を返します。画面の書式（3桁ごとのカンマや通貨記号）は、ビューのヘルパー（<ChapterLink n={16} section="helpers" />）で整えます。
          </p>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装：Data.define・composed_of・Attributes API・normalizes',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <p>
            値オブジェクトは <code>ActiveRecord::Base</code> を継承しない普通の Ruby のクラスなので、どこに置いてもオートロードされます。この章では、モデルと一緒に使う値なので app/models に置き、型のクラスは app/types に置きます。app の下のディレクトリは、起動時に存在すればオートロードの対象になります。
          </p>
          <Code
            lang="text"
            code={`
app/
  controllers/reservations_controller.rb
  models/money.rb            # 値オブジェクト
  models/date_range.rb       # 値オブジェクト
  models/email_address.rb    # 値オブジェクト
  models/room.rb             # composed_of :nightly_price
  models/reservation.rb      # composed_of :stay・:total
  models/guest.rb            # attribute :email, EmailAddressType.new
  models/member.rb           # normalizes :email
  types/email_address_type.rb
db/migrate/20261120000001_create_rooms_guests_reservations.rb
spec/models/  spec/requests/
`}
          />
          <h3>マイグレーション</h3>
          <Code
            lang="ruby"
            title="db/migrate/20261120000001_create_rooms_guests_reservations.rb"
            code={`
class CreateRoomsGuestsReservations < ActiveRecord::Migration[8.1]
  def change
    create_table :rooms do |t|
      t.string :name, null: false
      t.bigint :nightly_price_amount, null: false              # 最小単位の整数（円・セント）
      t.string :nightly_price_currency, limit: 3, null: false  # ISO 4217 の通貨コード
      t.timestamps
    end
    add_check_constraint :rooms, "nightly_price_amount >= 0", name: "rooms_nightly_price_non_negative"

    create_table :guests do |t|
      t.string :email, null: false # 正規化した値（前後の空白なし・小文字）
      t.timestamps
      t.index :email, unique: true
    end

    create_table :reservations do |t|
      t.references :room, null: false, foreign_key: true
      t.references :guest, null: false, foreign_key: true
      t.date :check_in_on, null: false
      t.date :check_out_on, null: false
      t.bigint :total_amount, null: false
      t.string :total_currency, limit: 3, null: false
      t.timestamps
    end
    add_check_constraint :reservations, "check_in_on < check_out_on", name: "reservations_stay_order"
    add_check_constraint :reservations, "total_amount >= 0", name: "reservations_total_non_negative"

    create_table :members do |t|
      t.string :email, null: false
      t.timestamps
      t.index :email, unique: true
    end
  end
end
`}
          />
          <p>
            金額は <code>_amount</code>（BIGINT）と <code>_currency</code>（3文字）の2列にします。<code>t.integer</code> は MySQL の INT（4バイト）を作り、上限は 2,147,483,647 です。セント単位では約2,147万ドルで上限に達するので、BIGINT にしています<Ref n={11} />。期間は <code>check_in_on</code> と <code>check_out_on</code> の2つの DATE の列で持ち、CHECK 制約で順序を守ります。MySQL は 8.0.16 から CHECK 制約を検査し、INSERT や UPDATE の結果が条件を満たさないとエラーにします<Ref n={33} />。既存のテーブルに制約を加える手順は<ChapterLink n={27} section="indexes-constraints" />で扱います。
          </p>
          <Figure n="82-4" title="テーブルの列と値オブジェクトの対応" caption="この節のマイグレーションとモデルの対応をまとめた模式図。">
            <ColumnsFigure />
          </Figure>
          <p>
            図 82-4 の左がテーブルの列、右がモデルの属性です。DB には基本型の値（整数・文字列・日付）で保存し、モデルの属性を読み書きするときに値オブジェクトと変換します。複数の列を1つの値にするときは composed_of、1つの列を1つの値にするときは Attributes API の型、文字列のまま表記だけをそろえるときは normalizes を使います。以下、値オブジェクト、モデル、コントローラーの順に実装します。
          </p>
          <h3>Money</h3>
          <Code
            lang="ruby"
            title="app/models/money.rb"
            code={`
# 金額。amount は通貨の最小単位の整数（円なら1円、米ドルなら1セント）
Money = Data.define(:amount, :currency) do
  include Comparable

  def initialize(amount:, currency:)
    currency = currency.to_s.upcase.to_sym # DB の "JPY" も :jpy も :JPY にそろえる
    raise ArgumentError, "対応していない通貨です: #{currency}" unless Money::MINOR_UNITS.key?(currency)
    raise ArgumentError, "金額は最小単位の整数で指定してください: #{amount.inspect}" unless amount.is_a?(Integer)

    super(amount:, currency:)
  end

  # "19.99" のような10進の文字列から作る。Rational を使い、Float を経由しない
  def self.parse(text, currency)
    minor = Rational(text) * 10**Money::MINOR_UNITS.fetch(currency.to_s.upcase.to_sym)
    raise ArgumentError, "#{currency} の金額として読めません: #{text}" unless minor.denominator == 1

    new(minor.to_i, currency)
  end

  def +(other) = with(amount: amount + same_currency!(other).amount)
  def -(other) = with(amount: amount - same_currency!(other).amount)

  def *(quantity)
    raise ArgumentError, "数量は整数で指定してください: #{quantity.inspect}" unless quantity.is_a?(Integer)

    with(amount: amount * quantity)
  end

  # 同じ通貨の Money どうしだけを比べる。それ以外は nil を返すので、== は false、< などは例外になる
  def <=>(other) = (amount <=> other.amount if other.is_a?(Money) && other.currency == currency)

  # 率を掛け、最小単位未満を rounding の方法で丸める。税率10%なら Rational(10, 100)
  def percent_of(rate, rounding:)
    unless rate.is_a?(Rational) || rate.is_a?(Integer)
      raise ArgumentError, "率は Rational か Integer で指定してください: #{rate.inspect}"
    end

    exact = amount * rate
    rounded = case rounding
              when :floor then exact.floor
              when :ceil then exact.ceil
              when :half_up then exact.round(half: :up)
              when :half_even then exact.round(half: :even)
              else raise ArgumentError, "丸めの方法が不明です: #{rounding.inspect}"
              end
    with(amount: rounded)
  end

  # 比率で分ける。割り切れない端数は先頭から1単位ずつ配り、合計を元の金額に一致させる
  def allocate(ratios)
    total = ratios.sum
    shares = ratios.map { amount * it / total }
    remainder = amount - shares.sum
    shares.each_with_index.map { |share, i| with(amount: share + (i < remainder ? 1 : 0)) }
  end

  # 表示用の文字列。小数に戻すのはここだけで、計算には使わない
  def to_s
    digits = Money::MINOR_UNITS.fetch(currency)
    format("%s %.#{digits}f", currency, Rational(amount, 10**digits))
  end

  private

  def same_currency!(other)
    raise TypeError, "Money ではありません: #{other.inspect}" unless other.is_a?(Money)
    raise Money::CurrencyMismatch, "#{currency} と #{other.currency} は計算できません" unless other.currency == currency

    other
  end
end

# Data.define のブロックの中で定数を書くとトップレベルの定数になるので、ブロックの外で Money の中に定義する
Money::MINOR_UNITS = { JPY: 0, USD: 2 }.freeze # ISO 4217 の小数点以下の桁数
Money::CurrencyMismatch = Class.new(StandardError)
`}
          />
          <ul>
            <li>
              検証と正規化は initialize にまとめています。Data の <code>new</code> は位置引数をキーワード引数に変えてから initialize を呼ぶので、<code>Money.new(1500, "jpy")</code> でも <code>Money.new(amount: 1500, currency: :JPY)</code> でも同じ検証を通ります<Ref n={5} />。DB から読んだ <code>"JPY"</code>、コードに書いた <code>:jpy</code> を、どちらも <code>:JPY</code> にそろえます。
            </li>
            <li>
              <code>with</code> は一部の値を替えた新しいインスタンスを返す Data のメソッドで、Ruby 4.0.9 では with も initialize を通ります。そのため <code>+</code> や <code>percent_of</code> の結果も同じ検証を通り、<code>money.with(amount: 1.5)</code> は ArgumentError になります。
            </li>
            <li>
              <code>parse</code> は Rational で <code>"19.99"</code> を 1999/100 として読み、10 の桁数乗を掛けます。分母が1にならない <code>"19.999"</code> は拒否します。Float の <code>4.35</code> を渡すと、Rational(4.35) は2進数の近似値をそのまま分数にするので分母が1にならず、拒否されます。
            </li>
            <li>
              Comparable を include し <code>&lt;=&gt;</code> を定義すると、<code>&lt;</code> や並べ替えが使えます<Ref n={24} />。include したモジュールは Data より先にメソッドを探されるので（<code>Money.ancestors</code> は <code>[Money, Comparable, Data, …]</code>）、<code>==</code> は Comparable のものが使われ、<code>&lt;=&gt;</code> が 0 のときに true になります。<code>&lt;=&gt;</code> が金額だけを比べると 100円と100ドルが <code>==</code> で等しくなるので、相手が同じ通貨の Money でなければ nil を返します。nil のとき Comparable の <code>==</code> は false を返し、<code>&lt;</code> は ArgumentError を投げます。<code>eql?</code> と <code>hash</code> は Data のものが使われます。
            </li>
          </ul>
          <p>
            ファイルの末尾で定数を Money の外から定義しているのは、Data.define のブロックの中で書いた定数が、Money ではなくトップレベルの定数になるからです。ブロックは定数を探す範囲（レキシカルスコープ）を変えないので、ブロックの中のメソッドから <code>MINOR_UNITS</code> と書いても Money の定数は見つかりません。そのため、メソッドの中では <code>Money::MINOR_UNITS</code> と書いています。
          </p>
          <Code
            lang="text"
            title="実行結果（rails runner）"
            code={`
Probe = Data.define(:x) do
  LIMIT = 10
end
Object.const_defined?(:LIMIT)              # => true（トップレベルの定数になった）
Probe.const_defined?(:LIMIT, false)        # => false
Money.const_defined?(:MINOR_UNITS, false)  # => true

Money.new(1500, "jpy")                     # => #<data Money amount=1500, currency=:JPY>
Money.new(100, :JPY) == Money.new(100, :USD)  # => false
Money.new(100, :JPY) < Money.new(100, :USD)   # => ArgumentError: comparison of Money with Money failed
Money.parse("4.35", :USD).amount           # => 435
Money.parse(4.35, :USD)                    # => ArgumentError: USD の金額として読めません: 4.35
Money.new(100, :EUR)                       # => ArgumentError: 対応していない通貨です: EUR
Money.new(1500, :JPY) * 1.5                # => ArgumentError: 数量は整数で指定してください: 1.5
`}
          />
          <h3>DateRange</h3>
          <Code
            lang="ruby"
            title="app/models/date_range.rb"
            code={`
# 日付の期間。start_on を含み、end_on を含まない（宿泊なら start_on がチェックイン、end_on がチェックアウト）
DateRange = Data.define(:start_on, :end_on) do
  def initialize(start_on:, end_on:)
    raise ArgumentError, "Date で指定してください" unless start_on.is_a?(Date) && end_on.is_a?(Date)
    raise ArgumentError, "終わりの日は始まりの日より後にしてください: #{start_on}〜#{end_on}" unless start_on < end_on

    super
  end

  # "2026-12-01" の形式だけを受け付ける。Date::Error は ArgumentError のサブクラス
  def self.parse(start_on, end_on) = new(Date.iso8601(start_on.to_s), Date.iso8601(end_on.to_s))

  def to_range = start_on...end_on # ... は終わりを含まない範囲
  def nights = (end_on - start_on).to_i
  def include?(date) = to_range.cover?(date)
  def overlap?(other) = to_range.overlap?(other.to_range)
end
`}
          />
          <p>
            <code>start_on...end_on</code> は終わりを含まない Range です。<code>include?</code> は Range の <code>cover?</code>、<code>overlap?</code> は Range の <code>overlap?</code> を使います<Ref n={25} />。Range#overlap? は Ruby 3.3 で追加されました<Ref n={26} />。parse には <code>Date.parse</code> ではなく <code>Date.iso8601</code> を使い、<code>"12/1"</code> のようなあいまいな形式を拒否します。出発点のコードの <code>Date.parse</code> は多くの形式を推測して読むので、入力の形式を API の約束として固定できません。
          </p>
          <h3>EmailAddress</h3>
          <Code
            lang="ruby"
            title="app/models/email_address.rb"
            code={`
# メールアドレス。前後の空白を除き、全体を小文字にそろえてから検証する
EmailAddress = Data.define(:value) do
  def initialize(value:)
    normalized = value.to_s.strip.downcase
    raise ArgumentError, "メールアドレスとして正しくありません: #{value.inspect}" unless EmailAddress::FORMAT.match?(normalized)

    super(value: normalized.freeze) # 文字列も freeze して、中身を書き換えられないようにする
  end

  def domain = value.split("@").last
  def to_s = value
end

# WHATWG の HTML 仕様が input type="email" の「有効なメールアドレス」として示している正規表現
EmailAddress::FORMAT = %r{\\A[a-zA-Z0-9.!\\#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\\z}
`}
          />
          <p>
            正規化した文字列は <code>freeze</code> してから <code>super</code> に渡します。Data はインスタンスを freeze しますが、値に持たせた文字列までは freeze しないからです（<ChapterLink n={33} section="value-objects" />の「凍結されるのはインスタンス自身だけ」）<Ref n={5} />。
          </p>
          <Callout kind="note" title="@ より前を小文字にするかどうか">
            <p>
              SMTP の規格 RFC 5321 は、メールボックスの @ より前（ローカル部）を大文字と小文字を区別するものとして扱い、送るときに大文字と小文字を変えないよう求めています。同時に、大文字と小文字の区別に頼ることは相互運用を妨げるので勧めないとし、ドメインは DNS の規則に従って区別しないとしています<Ref n={27} />。MSDP の EmailAddress は、この規格に合わせてドメインだけを小文字にしていました。この章では、宿泊者の重複を防ぐことを優先し、Rails のドキュメントの normalizes の例と同じく全体を小文字にしています<Ref n={31} />。ローカル部の大文字と小文字で別の人に届くメールサーバーを相手にする場合は、入力のまま送る列と、比較に使う正規化した列を分けます。
            </p>
          </Callout>
          <h3>composed_of で複数の列を値オブジェクトにする</h3>
          <Code
            lang="ruby"
            title="app/models/room.rb・app/models/reservation.rb"
            code={`
class Room < ApplicationRecord
  TAX_RATE = Rational(10, 100)
  Quote = Data.define(:subtotal, :tax, :total)

  has_many :reservations

  # 2つの列（金額と通貨）を、1つの Money として読み書きする
  composed_of :nightly_price, class_name: "Money",
              mapping: { nightly_price_amount: :amount, nightly_price_currency: :currency }

  # 宿泊の見積もり。税は小計に1回だけ掛け、1円未満（米ドルなら1セント未満）を切り上げる
  def quote(stay)
    subtotal = nightly_price * stay.nights
    tax = subtotal.percent_of(TAX_RATE, rounding: :ceil)
    Quote.new(subtotal:, tax:, total: subtotal + tax)
  end
end

class Reservation < ApplicationRecord
  belongs_to :room
  belongs_to :guest

  composed_of :stay, class_name: "DateRange", allow_nil: true,
              mapping: { check_in_on: :start_on, check_out_on: :end_on }
  composed_of :total, class_name: "Money", allow_nil: true,
              mapping: { total_amount: :amount, total_currency: :currency }

  validates :stay, :total, presence: true
  validate :room_must_be_free, if: :stay

  # 終わりを含まない期間どうしの重なり：check_in_on < 相手の終わり かつ check_out_on > 相手の始まり
  scope :overlapping, ->(stay) {
    where(check_in_on: ...stay.end_on).where("check_out_on > ?", stay.start_on)
  }

  private

  def room_must_be_free
    if Reservation.where(room_id:).where.not(id:).overlapping(stay).exists?
      errors.add(:stay, "はほかの予約と重なっています")
    end
  end
end
`}
          />
          <p>
            composed_of は mapping に書いた列の値を順に値のクラスの <code>new</code> へ位置引数で渡して読み取り、代入された値オブジェクトの各メソッドの結果を列に書き込みます。読み取った値と代入した値は freeze してレコードの中に保持されます<Ref n={15} />。Data の <code>new</code> は位置引数を受け付けるので、Money と DateRange はそのまま使えます。保持した値と列の値がずれる注意点は<ChapterLink n={33} section="value-objects" />で扱いました。
          </p>
          <p>
            <code>allow_nil: true</code> は、対応する列がすべて nil のときに値オブジェクトを作らず nil を返す指定です<Ref n={15} />。指定しないと、<code>Reservation.new</code> の直後に <code>stay</code> を読んだだけで <code>DateRange.new(nil, nil)</code> が呼ばれ、ArgumentError になります。nil のときは presence の検証で保存を拒否します。where に値オブジェクトを渡すと、mapping のすべての列の等号の条件になります。期間を範囲の条件にしたいときは、Range を where に渡します。
          </p>
          <Code
            lang="text"
            title="実行結果（SQL）"
            code={`
Room.where(nightly_price: Money.new(12_000, :JPY)).count
  SELECT COUNT(*) FROM \`rooms\` WHERE \`rooms\`.\`nightly_price_amount\` = 12000 AND \`rooms\`.\`nightly_price_currency\` = 'JPY'

Reservation.where(check_in_on: DateRange.parse("2026-12-01", "2026-12-08").to_range)
  SELECT \`reservations\`.* FROM \`reservations\` WHERE \`reservations\`.\`check_in_on\` >= '2026-12-01' AND \`reservations\`.\`check_in_on\` < '2026-12-08'

Reservation.overlapping(DateRange.parse("2026-12-01", "2026-12-04"))
  SELECT \`reservations\`.* FROM \`reservations\` WHERE \`reservations\`.\`check_in_on\` < '2026-12-04' AND (check_out_on > '2026-12-01')
`}
          />
          <p>
            終わりを含まない Range（<code>a...b</code>）は <code>&gt;= a AND &lt; b</code> の条件になります。<code>overlapping</code> は半開区間どうしの重なりの条件で、DateRange#overlap? と同じ規則を SQL で書いたものです。<code>room_must_be_free</code> はこのスコープで同じ部屋の予約との重なりを確かめますが、2つの予約が同時に確かめると、どちらも重なりなしと判断できます。同時の予約を防ぐには、部屋の行のロックなどが必要です（<ChapterLink n={38} section="lock" />）。
          </p>
          <h3>Attributes API の独自の型で1つの列を値オブジェクトにする</h3>
          <p>
            Attributes API はモデルの属性の型を指定し、代入された値や DB の値の変換を型のオブジェクトに任せる仕組みです<Ref n={28} />。属性の値には、DB から来た値か代入された値そのもの、Ruby で扱う値、保存するときの値の3つの形があり、型の deserialize・cast・serialize がその間を変換します（<ChapterLink n={11} section="types" />）。<code>attribute</code> で列の型を上書きする仕組みは<ChapterLink n={11} section="attribute-api" />で扱いました。ここでは独自の型を作ります。
          </p>
          <Code
            lang="ruby"
            title="app/types/email_address_type.rb・app/models/guest.rb"
            code={`
# Attributes API の型。DB の文字列と EmailAddress を相互に変換する
class EmailAddressType < ActiveRecord::Type::Value
  # 代入された値（フォームの文字列など）を EmailAddress にする。
  # 正しくなければ nil にして、モデルの検証で保存を拒否させる
  def cast(value)
    return value if value.nil? || value.is_a?(EmailAddress)

    EmailAddress.new(value)
  rescue ArgumentError
    nil
  end

  # DB に渡すときは文字列にする。where の値は cast を通らずにここへ来るので、ここでも cast する
  def serialize(value) = cast(value)&.to_s

  # deserialize は定義しない。既定の動作で cast が呼ばれ、DB の文字列が EmailAddress になる
end

class Guest < ApplicationRecord
  attribute :email, EmailAddressType.new

  has_many :reservations
  validates :email, presence: { message: "の形式が正しくありません" }
end
`}
          />
          <p>
            <code>ActiveRecord::Type::Value</code> は <code>ActiveModel::Type::Value</code> の別名で（activerecord の type.rb の 67 行目）、Rails API のドキュメントも独自の型はこのクラスか既存の型を継承するよう勧めています<Ref n={28} />。3つのメソッドの役割は次のとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">メソッド</th>
                  <th scope="col">呼ばれるとき</th>
                  <th scope="col">既定の動作と、この型での実装</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>cast</code></th>
                  <td>属性に代入したとき（<code>guest.email = "…"</code>、<code>Guest.new(email: …)</code>）</td>
                  <td>既定は nil 以外を <code>cast_value</code> に渡す。この型は EmailAddress を作り、作れなければ nil を返す</td>
                </tr>
                <tr>
                  <th scope="row"><code>deserialize</code></th>
                  <td>DB から読んだ値を Ruby の値にするとき</td>
                  <td>既定は cast を呼ぶ<Ref n={29} />。この型は定義せず、既定の動作を使う</td>
                </tr>
                <tr>
                  <th scope="row"><code>serialize</code></th>
                  <td>INSERT・UPDATE の値と、where の条件の値を作るとき</td>
                  <td>既定は値をそのまま返す<Ref n={29} />。この型は cast してから文字列にする</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            cast で例外を投げずに nil を返すのは、代入の時点で例外にすると、ほかの項目の検証エラーと一緒にフォームへ表示できないからです。nil になった値は presence の検証で拒否します。入力された文字列は <code>email_before_type_cast</code> に残るので、フォームに入力をそのまま再表示できます。
          </p>
          <Figure n="82-5" title="Attributes API の型による変換" caption="実線の矢印は値を渡してメソッドを呼ぶこと、破線の矢印はメソッドの戻り値を表す。青い矢印は検索の経路。">
            <AttributeTypeFigure />
          </Figure>
          <p>
            図 82-5 は代入・保存・読み込み・検索のそれぞれで、EmailAddressType のどのメソッドが呼ばれるかを示しています。注意が必要なのは一番下の検索です。where に渡した値は型の serialize に渡されますが、cast は通りません。where の値を表す <code>ActiveRecord::Relation::QueryAttribute</code> は、cast の代わりに値をそのまま返す <code>type_cast</code> を持ち、SQL に使う値は <code>type.serialize(value)</code> で作ります<Ref n={30} />。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation/query_attribute.rb（24〜31行目）"
            href={`${GH}/activerecord/lib/active_record/relation/query_attribute.rb#L24-L31`}
            code={`
      def type_cast(value)
        value
      end

      def value_for_database
        @value_for_database = _value_for_database unless defined?(@value_for_database)
        @value_for_database
      end
`}
          />
          <p>
            serialize が値をそのまま返す型にすると、正規化されていない文字列のまま検索されます。serialize で cast を呼ばない型（NaiveGuest）と、この章の型（Guest）で、同じ条件の検索を比べました。
          </p>
          <Code
            lang="text"
            title="実行結果（guests には sato@example.com の1行）"
            code={`
Guest.create!(email: "  Sato@Example.COM ")
  INSERT INTO \`guests\` (\`email\`, \`created_at\`, \`updated_at\`) VALUES ('sato@example.com', …)
guest.email                       # => #<data EmailAddress value="sato@example.com">

NaiveGuest.where(email: " SATO@example.com").count   # serialize が value&.to_s だけの型
  SELECT COUNT(*) FROM \`guests\` WHERE \`guests\`.\`email\` = ' SATO@example.com'
=> 0
Guest.where(email: " SATO@example.com").count
  SELECT COUNT(*) FROM \`guests\` WHERE \`guests\`.\`email\` = 'sato@example.com'
=> 1

guest.email = "SATO@example.com"
guest.changed?                    # => false（cast した EmailAddress が元の値と等しい）
bad = Guest.new(email: "sato@")
bad.email                         # => nil
bad.email_before_type_cast        # => "sato@"
bad.errors.full_messages          # => ["Email の形式が正しくありません"]（valid? の後）
`}
          />
          <p>
            NaiveGuest の検索は、先頭の空白が残ったまま比べられて 0 件でした（大文字と小文字は MySQL の照合順序が区別しませんが、空白は区別します）。Guest の検索は serialize の中で cast を通るので、保存のときと同じ <code>sato@example.com</code> で検索されました。<code>find_by</code>・<code>find_or_create_by</code>・一意性の検証も where で探すので、同じように正規化されます。変更の追跡（<ChapterLink n={11} section="dirty" />）は、型の <code>changed?</code> で元の値と新しい値を <code>==</code> で比べるので、表記だけが違うアドレスを代入しても変更とみなされず、UPDATE も送られません。
          </p>
          <Callout kind="warn" title="既存のデータを読むときも cast が呼ばれる">
            <p>
              deserialize は既定で cast を呼ぶので、型を入れる前に保存された正しくないアドレス（<code>"sato@example.com "</code> や <code>"sato@"</code>）は、読み込むと nil か正規化された値になります。読み込んだだけのレコードを保存すると、表示されていた値と違う値が書き込まれることがあります。型を入れる前に、次の「直していく順序」のように既存のデータを正規化し、重複を解消しておきます。
            </p>
          </Callout>
          <h3>normalizes：文字列のまま表記をそろえる</h3>
          <p>
            メールアドレスに検証や計算を持たせず、表記をそろえるだけでよい場合は、Rails 7.1 で加わった <code>normalizes</code> で足ります<Ref n={32} />。会員（Member）のメールアドレスを、文字列のまま正規化しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/member.rb"
            code={`
class Member < ApplicationRecord
  # 文字列のまま正規化だけを行う（Rails 7.1 から）
  normalizes :email, with: ->(email) { email.strip.downcase }
end
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
Member.create!(email: "  Sato@Example.COM ").email   # => "sato@example.com"
Member.where(email: " SATO@example.com").count
  SELECT COUNT(*) FROM \`members\` WHERE \`members\`.\`email\` = 'sato@example.com'
=> 1
Member.exists?(["email = ?", " SATO@example.com"])
  SELECT 1 AS one FROM \`members\` WHERE (email = ' SATO@example.com') LIMIT 1
=> false
Member.normalize_value_for(:email, " A@B.COM ")      # => "a@b.com"
`}
          />
          <p>
            normalizes は元の型を包む型（NormalizedValueType）を属性に設定します。その serialize は、EmailAddressType と同じく cast を呼んでから DB の値にするので、where のハッシュの条件も正規化されます。
          </p>
          <Code
            lang="ruby"
            title="activemodel/lib/active_model/attributes/normalization.rb（164〜170行目）"
            href={`${GH}/activemodel/lib/active_model/attributes/normalization.rb#L164-L170`}
            code={`
          def cast(value)
            normalize(super(value))
          end

          def serialize(value)
            serialize_cast_value(cast(value))
          end
`}
          />
          <p>
            一方、<code>["email = ?", …]</code> のような SQL の断片は型を通らないので、正規化されません<Ref n={31} />。また、normalizes は DB から読んだ値には適用されないので、宣言する前に保存された行は、値を代入し直すか <code>normalize_attribute</code> を呼ぶまで正規化されません<Ref n={31} />。normalizes の結果は String のままなので、ドメインを取り出すような振る舞いを持たせたい場合や、複数のモデルで同じ値の型を使う場合は、EmailAddressType のような独自の型にします。
          </p>
          <Callout kind="v72">
            <p>
              normalizes は Rails 7.1 から Active Record のモデルで使えるので、Rails 7.2 でもこの節のコードはそのまま動きます。Rails 8.1.0 で ActiveModel::Attributes::Normalization に移され、Active Record を使わない ActiveModel::Attributes のクラスでも使えるようになりました<Ref n={34} />。また、CHECK 制約の違反を表す <code>ActiveRecord::CheckViolation</code> は Rails 8.1.0 で加わった例外のクラスで<Ref n={35} />、Rails 7.2 では <code>ActiveRecord::StatementInvalid</code> として投げられます。Data.define は Ruby 3.2、Range#overlap? は Ruby 3.3、ブロックの引数の <code>it</code> は Ruby 3.4 からです。
            </p>
          </Callout>
          <h3>コントローラー</h3>
          <Code
            lang="ruby"
            title="app/controllers/reservations_controller.rb"
            code={`
class ReservationsController < ApplicationController
  def create
    room = Room.find(params[:room_id])
    stay = stay_param or return render json: { error: "期間が正しくありません" }, status: :unprocessable_content

    guest = Guest.find_or_create_by!(email: params[:email]) # EmailAddressType が正規化してから探す
    reservation = room.reservations.create!(guest:, stay:, total: room.quote(stay).total)
    render json: { id: reservation.id, guest_id: guest.id, total: reservation.total.to_h }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages }, status: :unprocessable_content
  end

  private

  # 入力の境界で値オブジェクトにする。作れなければ nil
  def stay_param
    DateRange.parse(params[:check_in_on], params[:check_out_on])
  rescue ArgumentError # Date::Error も ArgumentError のサブクラス
    nil
  end
end
`}
          />
          <p>
            コントローラーは入力の文字列を受け取った場所で DateRange を作り、作れなければ 422 を返します。泊数・税・切り上げの計算は <code>Room#quote</code> に、メールアドレスの正規化と検証は EmailAddressType に任せたので、アクションから計算と検証のコードがなくなりました。出発点と同じ4種類の予約を送った結果です。
          </p>
          <Code
            lang="text"
            title="実行結果（POST /reservations。[ステータス, 応答]）"
            code={`
== A
ツイン 1泊         => [201, {"id" => 1, "guest_id" => 1, "total" => {"amount" => 13200, "currency" => "JPY"}}]
スイート 10泊      => [201, {"id" => 2, "guest_id" => 2, "total" => {"amount" => 1234563, "currency" => "JPY"}}]
== B
米ドルのツイン 3泊（email: "Sato@Example.COM "）
                   => [201, {"id" => 3, "guest_id" => 1, "total" => {"amount" => 3284, "currency" => "USD"}}]
guest.reservations.map(&:total).sum(Money.new(0, :JPY))
                   => Money::CurrencyMismatch: JPY と USD は計算できません
通貨ごとに合計     => {JPY: "JPY 13200", USD: "USD 32.84"}
== C
12/4 〜 12/1       => [422, {"error" => "期間が正しくありません"}]
12/1 〜 12/3       => [422, {"error" => ["Stay はほかの予約と重なっています"]}]
12/2 〜 12/3       => [201, {"id" => 4, "guest_id" => 3, …}]（12/2 にチェックアウトする予約と重ならない）
UPDATE reservations SET check_out_on = '2026-11-30' WHERE id = 1
                   => ActiveRecord::CheckViolation: Mysql2::Error: Check constraint 'reservations_stay_order' is violated.
== D
"  SATO@example.com" => [201, {"id" => 5, "guest_id" => 1, …}]
guests: [[1, sato@example.com], [2, suzuki@example.com], [3, tanaka@example.com]]
"sato@"            => [422, {"error" => ["Email の形式が正しくありません"]}]
`}
          />
          <p>
            A では合計が 13,200円になり、7桁の金額も BIGINT にそのまま保存されました。B では、円とドルを足そうとすると CurrencyMismatch になり、通貨ごとに分けて合計するしかなくなります。C では、逆の期間を DateRange が拒否し、モデルを通らない SQL の UPDATE も CHECK 制約が拒否しました。D では、空白と大文字の違うアドレスが既存の宿泊者 1 になり、照合順序に頼らずに重複を防げています。
          </p>
          <h3>直していく順序</h3>
          <ol>
            <li>現在の動作をテストで固定します。見積もりの結果と、受け付ける入力・拒否する入力を request spec に書きます。</li>
            <li>
              最も多くの場所で検証されている値（この章ではメールアドレス）から値オブジェクトを作り、正規化と検証を initialize に移します。文字列のままでよければ、この段階で normalizes にして終えることもできます。
            </li>
            <li>
              既存のデータを正規化します。先に、正規化すると重複する行を探し、どちらの宿泊者にまとめるかを決めて予約を付け替えます。出発点のデータでは3行が同じ値になりました（id 5 は照合順序を utf8mb4_0900_bin に変えて試したときの行です）。
              <Code
                lang="text"
                title="実行結果（出発点の DB）"
                code={`
SELECT LOWER(TRIM(email)) AS normalized, COUNT(*) AS n, GROUP_CONCAT(id ORDER BY id) AS ids
FROM guests GROUP BY normalized HAVING n > 1;
=> [["sato@example.com", 3, "1,4,5"]]
`}
              />
              MySQL の TRIM は既定で空白だけを除き、Ruby の strip はタブや改行も除くので、最後は Ruby の EmailAddress で1行ずつ正規化して確かめます。
            </li>
            <li>入力の境界（コントローラー、CSV の取り込み、JSON の読み込み）で値オブジェクトを作り、モデルの属性を composed_of や型で値オブジェクトにします。</li>
            <li>値オブジェクトを受け取るようになったメソッドから、重複した検証を消します。Ruby には実行前の型の検査がないので、文字列を渡したままの呼び出し元はテストとコードの検索で探します。</li>
            <li>
              金額を最小単位の整数の列に移します。<code>_amount</code> と <code>_currency</code> の列を加え、FLOAT の値から <code>ROUND(nightly_price * 100)</code>（ドルの場合）で埋めます。出発点のデータでは 9.95 ドルが 995 セントになりました。ただし、FLOAT に保存した時点で失われた桁は戻らないので、予約の合計（1,234,560 と保存されたスイート10泊など）は、泊数と料金から計算し直します。
            </li>
            <li>期間を DateRange にし、終わりの日を含むかどうかを決め、重なりの判定と泊数の計算を DateRange と <code>overlapping</code> に移します。最後に CHECK 制約を加え、古い列を消します。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストと動作の確認',
      body: (
        <>
          <p>
            値オブジェクトは DB にも外部のサービスにも依存しないので、入力と期待する結果を並べるだけでテストを書けます。DB とつなぐ部分（composed_of、型、normalizes、CHECK 制約）は、MySQL に対してモデルのテストで確かめ、コントローラーは request spec で確かめます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/money_spec.rb（抜粋）"
            code={`
RSpec.describe Money do
  it "10進の文字列から、Float を経由せずに作る" do
    expect(Money.parse("19.99", :USD)).to eq Money.new(1999, :USD)
    expect { Money.parse("19.999", :USD) }.to raise_error(ArgumentError)
    expect { Money.parse(4.35, :USD) }.to raise_error(ArgumentError) # Float は受け付けない
    expect { Money.new(12.5, :JPY) }.to raise_error(ArgumentError)
  end

  it "通貨が違えば計算できず、== は false になる" do
    expect { Money.new(100, :JPY) + Money.new(100, :USD) }.to raise_error(Money::CurrencyMismatch)
    expect(Money.new(100, :JPY) == Money.new(100, :USD)).to be false
    expect { Money.new(100, :JPY) < Money.new(100, :USD) }.to raise_error(ArgumentError)
  end

  it "率を掛けたときの丸めの方法を選べる" do
    subtotal = Money.new(2985, :USD) # 29.85 ドル
    rate = Rational(10, 100)
    expect(%i[floor ceil half_up half_even].map { subtotal.percent_of(rate, rounding: it).amount })
      .to eq [298, 299, 299, 298]
    expect { subtotal.percent_of(0.1, rounding: :floor) }.to raise_error(ArgumentError)
  end

  it "変更できず、計算の結果も検証を通る" do
    money = Money.new(1000, :JPY)
    expect(money).to be_frozen
    expect(money).not_to respond_to(:amount=)
    expect { money * 1.5 }.to raise_error(ArgumentError)
    expect { money.with(amount: 1.5) }.to raise_error(ArgumentError)
  end
  # …（省略：Hash のキー、allocate）
end
`}
          />
          <Code
            lang="ruby"
            title="spec/models/value_objects_spec.rb（抜粋）"
            code={`
RSpec.describe "値オブジェクトと Active Record" do
  let(:room) { Room.create!(name: "ツイン", nightly_price: Money.new(12_000, :JPY)) }

  it "Attributes API の型で、代入した文字列を正規化した EmailAddress にする" do
    guest = Guest.create!(email: "  Sato@Example.COM ")

    expect(guest.reload.email).to eq EmailAddress.new("sato@example.com")
    expect(Guest.where(email: " SATO@example.com")).to contain_exactly(guest) # 検索の値も serialize で正規化される
    guest.email = "SATO@example.com"
    expect(guest).not_to be_changed # 同じ値なので変更とみなさない
  end

  it "期間は2つの列と Range で扱い、DB の CHECK 制約でも順序を守る" do
    guest = Guest.create!(email: "sato@example.com")
    first = room.reservations.create!(guest:, stay: DateRange.parse("2026-12-01", "2026-12-04"),
                                      total: Money.new(39_600, :JPY))
    expect(Reservation.overlapping(DateRange.parse("2026-12-04", "2026-12-06"))).to be_empty
    expect(Reservation.overlapping(DateRange.parse("2026-12-03", "2026-12-05"))).to contain_exactly(first)

    second = room.reservations.build(guest:, stay: DateRange.parse("2026-12-03", "2026-12-05"),
                                     total: Money.new(26_400, :JPY))
    expect(second).not_to be_valid

    expect { first.update_columns(check_out_on: Date.new(2026, 11, 30)) }
      .to raise_error(ActiveRecord::CheckViolation)
  end
  # …（省略：composed_of、見積もり、形式の正しくないアドレス、normalizes）
end
`}
          />
          <Code
            lang="ruby"
            title="spec/requests/reservations_spec.rb（抜粋）"
            code={`
RSpec.describe "POST /reservations", type: :request do
  let(:twin) { Room.create!(name: "ツイン", nightly_price: Money.new(12_000, :JPY)) }

  def book(check_in, check_out, email, room: twin)
    post "/reservations", params: { room_id: room.id, check_in_on: check_in, check_out_on: check_out, email: }
  end

  it "表記の違うメールアドレスは同じ宿泊者になる" do
    book("2026-12-01", "2026-12-02", "sato@example.com")
    book("2026-12-10", "2026-12-11", "  SATO@Example.com ")
    expect(Guest.count).to eq 1
  end

  it "開始と終了が逆の期間は 422 にし、何も保存しない" do
    book("2026-12-04", "2026-12-01", "sato@example.com")
    expect(response).to have_http_status(:unprocessable_content)
    expect(Reservation.count).to eq 0
  end
  # …（省略：合計を JSON で整数と通貨として返す）
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation。MySQL 8.4）"
            code={`
Money
  10進の文字列から、Float を経由せずに作る
  値が同じなら等しく、Hash のキーにも使える
  通貨が違えば計算できず、== は false になる
  率を掛けたときの丸めの方法を選べる
  3等分しても合計が元の金額に一致する
  変更できず、計算の結果も検証を通る

DateRange
  終わりの日を含まない
  終わりが始まりより前の期間や、形式の違う日付からは作れない

EmailAddress
  前後の空白を除き、小文字にそろえる
  形式が正しくなければ作れない
  持っている文字列も変更できない

値オブジェクトと Active Record
  composed_of で2つの列を Money として読み書きする
  見積もりは税を小計に1回掛け、1円未満を切り上げる
  Attributes API の型で、代入した文字列を正規化した EmailAddress にする
  形式が正しくないメールアドレスは保存できない
  normalizes は文字列のまま、代入と検索の値を正規化する
  期間は2つの列と Range で扱い、DB の CHECK 制約でも順序を守る

POST /reservations
  合計を最小単位の整数と通貨で保存し、JSON でも小数にしない
  表記の違うメールアドレスは同じ宿泊者になる
  開始と終了が逆の期間は 422 にし、何も保存しない

Finished in 0.19505 seconds (files took 0.89128 seconds to load)
20 examples, 0 failures
`}
          />
          <p>テストで確かめていることを、層ごとに整理します。</p>
          <ul>
            <li>値オブジェクトのテストは正しくない値で作れないこと、値で比べること、変更できないこと、丸めと按分の結果を確かめます。DB を使わないので速く、正しくない入力の組み合わせをここに集められます。</li>
            <li>
              モデルのテストは値オブジェクトと列の変換を確かめます。特に「where の値も正規化される」「表記だけが違う代入は変更にならない」「CHECK 制約がモデルを通らない更新を拒否する」は、値オブジェクトだけのテストでは見つからない、Rails と MySQL の境界の振る舞いです。
            </li>
            <li>request spec は、入力の文字列が境界で値オブジェクトになり、正しくなければ 422 になることを確かめます。正しくない入力の細かい組み合わせは値オブジェクトのテストに任せ、ここでは代表の例だけにします（テストを置く層の考え方は<ChapterLink n={20} section="test-strategy" />）。</li>
          </ul>
          <p>
            値オブジェクトを受け取るメソッド（<code>Room#quote</code> など）のテストでは、検証済みの値を作って渡すだけで済み、「チェックアウトがチェックインより前の場合」のような入力の組み合わせを、使う側ごとにテストする必要がなくなります。
          </p>
        </>
      ),
    },
    {
      id: 'consequences',
      title: '効果と代償',
      body: (
        <>
          <h3>得られるもの</h3>
          <ul>
            <li>正規化と検証の規則が値オブジェクトの1か所にまとまり、コントローラーやモデルから検証のコードが消えます。</li>
            <li>違う通貨どうしの計算、逆の期間、形式の正しくないアドレスに、作った時点か計算した時点で気付けます。</li>
            <li>不変なので、同じ値オブジェクトを複数の予約に渡しても、どこかで書き換えられることがありません。</li>
            <li>端数の処理と丸める段階がメソッドの名前と引数に表れ、業務の規則としてテストできます。</li>
            <li>型の serialize で正規化するので、保存・検索・一意性の検証が同じ規則になり、DB の照合順序に頼らずに重複を防げます。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>値ごとにクラスと生成用のメソッドが増え、DB・JSON・フォームとの境界に変換のコード（composed_of、型のクラス）が要ります。</li>
            <li>composed_of はレコードの中に値を保持するので、列へ直接代入したときに値がずれます。型は deserialize で cast を呼ぶので、既存の正しくないデータが nil として読まれます。どちらも Rails の仕組みを知らないと気付きにくい動作です。</li>
            <li>値を変えるたびに新しいオブジェクトを作るので、大量の値を繰り返し計算する集計では、オブジェクトを作る分の時間とメモリーが増えます。数万行の合計は SQL の SUM で求め、結果を1つの Money にします。</li>
            <li>金額を整数の列で持つと、DB を直接見たときに 3284 が 32.84 ドルだとすぐには読めません。列名の <code>_amount</code> と通貨の列で単位を示します。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            受け付ける通貨や形式を変えるときに直す場所が値オブジェクトだけになり、変更の範囲が小さくなります。値オブジェクトのテストは外部に依存しないので速く、使う側のテストでは検証済みの値を作って渡すだけで済みます。一方で、DB とつなぐ部分の動作（where で cast が呼ばれないこと、composed_of の保持）は値オブジェクトのテストでは確かめられないので、MySQL を使うモデルのテストを残します。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>検証しない値オブジェクト</h3>
          <p>値をまとめるだけで生成時に検証しないクラスでは、受け取った側が中身を検証し直すことになり、値オブジェクトにした効果の大部分がなくなります。</p>
          <Code
            lang="text"
            title="実行結果"
            code={`
LooseMoney = Data.define(:amount, :currency)
LooseMoney.new(12.5, "円")   # => #<data LooseMoney amount=12.5, currency="円">
`}
          />
          <p>Data.define だけでは、Float の金額も知らない通貨も受け付けます。initialize を上書きして検証し、検証に通った値だけが存在するようにします。</p>
          <h3>変更できる値オブジェクト</h3>
          <p>
            setter（値を変更するメソッド）を持つと、エイリアシングのバグが起きます。Struct は既定で setter を持つので、2つの予約が同じ期間のオブジェクトを参照していると、片方のための変更がもう片方にも及びます。
          </p>
          <Code
            lang="text"
            title="実行結果"
            code={`
MutableRange = Struct.new(:start_on, :end_on)
plan = MutableRange.new(Date.new(2026, 12, 1), Date.new(2026, 12, 4))
a = { name: "予約A", stay: plan }
b = { name: "予約B", stay: plan }
a[:stay].end_on = Date.new(2026, 12, 5) # 予約A だけ1泊延ばしたつもり
b[:stay].end_on                          # => Sat, 05 Dec 2026（予約B も延びた）
`}
          />
          <p>
            Data を使えば setter は定義されません。composed_of も代入された値オブジェクトを freeze します<Ref n={15} />。期間を変えるときは、<code>reservation.stay = DateRange.new(…)</code> のように新しい値オブジェクトを代入します。
          </p>
          <h3>何でも値オブジェクトにする</h3>
          <p>
            宿泊者の名前や予約の備考のように、検証の規則も計算もない文字列まで値オブジェクトにすると、クラスと変換のコードが増えるだけです。値オブジェクトにする対象は、検証の規則・正規化・計算・単位のどれかを持つ値です。表記をそろえるだけなら normalizes、形式の検証だけなら <code>validates :email, format:</code> で足ります。
          </p>
          <h3>表示用に小数に戻した値で計算する</h3>
          <p>表示のために小数に戻した値を計算に使うと、整数で持っている意味がなくなります。</p>
          <Code
            lang="text"
            title="実行結果"
            code={`
price = Money.new(435, :USD)
shown = price.amount / 100.0   # 画面に出すために 4.35 にした値
shown                          # => 4.35
(shown * 100).to_i             # => 434（画面から送り返された 4.35 をセントに戻す）
`}
          />
          <p>
            小数に戻すのは表示の直前だけにし、計算は Money のメソッドで行います。フォームの隠し項目や JSON で金額をやり取りするときは、最小単位の整数（435）を使うか、10進の文字列を <code>Money.parse</code> で読みます。
          </p>
          <h3>値オブジェクトの中で外部とやり取りする</h3>
          <Code
            lang="ruby"
            title="避ける書き方（実行していない）"
            code={`
Money = Data.define(:amount, :currency) do
  # 値オブジェクトの中で DB と外部の API を呼んでいる
  def to_jpy
    rate = ExchangeRate.find_by(currency:)&.rate || RatesApi.fetch(currency)
    with(amount: (amount * rate).floor, currency: :JPY)
  end
end
`}
          />
          <p>
            為替レートを DB や API から取得して換算するメソッドを Money に持たせると、Money のテストに DB や外部の API が必要になり、同じ値の計算結果が外部の状態で変わります。換算は使う側（Service やモデル）に置き、Money にはレートを引数で渡す形（<code>money.convert(to: :JPY, rate: Rational(15_000, 100))</code> など）にします。外部とのやり取りを外から渡す方法は<ChapterLink n={40} section="idea" />で扱います。
          </p>
          <h3>エンティティを値で比べる</h3>
          <p>
            予約のようなエンティティを、属性がすべて同じなら等しいとみなすと、内容が同じ別々の予約を1件として扱ってしまいます。Data.define はすべての値で比べる <code>==</code> と <code>eql?</code> を定義するので、id で区別したいものには向きません。
          </p>
          <Code
            lang="text"
            title="実行結果"
            code={`
ReservationRow = Data.define(:room_id, :check_in_on, :check_out_on)
r1 = ReservationRow.new(1, Date.new(2026, 12, 1), Date.new(2026, 12, 2)) # 佐藤さんの予約
r2 = ReservationRow.new(1, Date.new(2026, 12, 1), Date.new(2026, 12, 2)) # 鈴木さんの予約
[r1, r2].uniq.size   # => 1（2件の予約が1件になる）
`}
          />
          <p>
            Active Record のモデルで <code>==</code> を上書きして属性で比べるのも同じ誤りです。Active Record の <code>==</code> は id で比べるので、そのまま使います。予約の内容が同じかを確かめたいときは、<code>same_stay?(other)</code> のように意味を表す別のメソッドを作ります。
          </p>
        </>
      ),
    },
    {
      id: 'alternatives',
      title: 'ほかの方法との使い分けと採用の判断',
      body: (
        <>
          <h3>より単純な方法</h3>
          <ul>
            <li>
              単位を列名と変数名に入れる：<code>price_cents</code>・<code>nightly_price_amount</code> のように単位を名前に入れるだけでも取り違えは減ります。通貨が1つで、計算が足し算と整数の掛け算だけなら、これで足りる場合があります。
            </li>
            <li>
              Rails の検証と normalizes：メールアドレスの表記をそろえるだけなら normalizes、形式の検証だけなら <code>validates :email, format: …</code> で足ります。どちらもモデルの外では効かないので、同じ値を複数のモデルや CSV の取り込みで扱うようになったら値オブジェクトを検討します。
            </li>
            <li>Ruby の Range：期間が「始まり ≦ 終わり」の確認と <code>cover?</code> だけで足りるなら、<code>check_in_on...check_out_on</code> の Range をそのまま使い、順序は CHECK 制約で守ります。</li>
            <li>検証の関数を共通にする：使う場所が少なければ、検証の関数を1つ作って各所から呼ぶだけでも規則の重複はなくなります。ただし、検証済みかどうかがクラスに表れないので、呼び忘れは防げません。</li>
          </ul>
          <h3>ほかのパターンとの違い</h3>
          <ul>
            <li>エンティティ：id で区別され、属性を変えながら存在し続けるオブジェクトです。Rails では Active Record のモデルがこれに当たり、値オブジェクトはその属性として使います（entity の節）。</li>
            <li>
              Explicit State Machine（<ChapterLink n={47} section="idea" />）：業務データの状態（予約なら仮予約・確定・キャンセルなど）と、状態の移り変わりの規則を明示するパターンです。状態はエンティティが持ち、操作によって変わります。
            </li>
            <li>
              Functional Core, Imperative Shell（<ChapterLink n={45} section="idea" />）：計算を副作用のない関数に集め、DB や外部とのやり取りを外側の処理に分けるパターンです。値オブジェクトのメソッドは副作用のない計算なので、その引数や戻り値の型として使えます。
            </li>
          </ul>
          <h3>Rails の機能と gem</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">方法</th>
                  <th scope="col">向いている場合</th>
                  <th scope="col">注意</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Data.define</th>
                  <td>値オブジェクトのクラスそのもの。値による等価性と不変性が付く</td>
                  <td>検証は initialize に書く。ブロックの中の定数はトップレベルになる</td>
                </tr>
                <tr>
                  <th scope="row">Struct</th>
                  <td>可変でよい一時的な値の組</td>
                  <td>setter があるので値オブジェクトには向かない</td>
                </tr>
                <tr>
                  <th scope="row">composed_of</th>
                  <td>複数の列（金額と通貨、開始と終了）を1つの値にする</td>
                  <td>値をレコードの中に保持する。列に直接代入しない</td>
                </tr>
                <tr>
                  <th scope="row">Attributes API の独自の型</th>
                  <td>1つの列を1つの値にする。複数のモデルで同じ型を使う</td>
                  <td>where の値は serialize だけを通る。既存のデータは deserialize で cast される</td>
                </tr>
                <tr>
                  <th scope="row">normalizes</th>
                  <td>文字列のまま表記をそろえる（Rails 7.1 から）</td>
                  <td>SQL の断片と、宣言前に保存された行には適用されない</td>
                </tr>
                <tr>
                  <th scope="row">money・money-rails</th>
                  <td>通貨の種類が多い、換算や書式化も必要</td>
                  <td>gem の Money の規則（丸めの既定など）をチームで確認する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            money gem は金額と通貨、換算を扱うライブラリで、money-rails はそれを Rails と組み合わせます<Ref n={36} />
            <Ref n={37} />。money-rails の README では、整数の列 <code>price_cents</code> に <code>monetize :price_cents</code> と書くと、<code>_cents</code> を除いた名前の <code>price</code> 属性が Money になります。マイグレーションの <code>add_monetize</code> は金額の列と通貨の列を作り、丸めの方法は初期設定の <code>rounding_mode</code> で指定でき、既定は BigDecimal::ROUND_HALF_EVEN です<Ref n={37} />。大きな金額を扱う場合は列を bigint にするよう README も書いています。扱う通貨が多い、為替の換算や通貨ごとの書式化も必要、という場合は、Money を自分で書く前に money-rails を検討します。この章の Money は、通貨が2つで、丸め方を呼び出しごとに明示したい場合の最小の実装です。
          </p>
          <h3>採用する条件</h3>
          <ul>
            <li>同じ値の検証や正規化が、2か所以上に書かれている</li>
            <li>値に業務の規則がある（通貨をそろえる、終わりは始まりより後、端数の処理）</li>
            <li>複数の値を組で扱う（金額と通貨、始まりと終わり）</li>
            <li>単位や種類を取り違えると、金額や日付の誤りになる</li>
          </ul>
          <h3>採用しない方がよい条件</h3>
          <ul>
            <li>検証の規則も計算もない文字列や数値（名前、備考など）</li>
            <li>id で区別し、属性が変わっていくもの（エンティティとして Active Record のモデルにする）</li>
            <li>1か所でしか使わず、外部から受け取ることもない一時的な値</li>
            <li>表記をそろえるだけで足りる文字列（normalizes を使う）</li>
          </ul>
          <h3>判断のチェックポイント</h3>
          <ol>
            <li>値が同じなら、別々に作ったものを入れ替えても困らないか（困るならエンティティ）</li>
            <li>正しくない値でオブジェクトを作れないようになっているか（initialize で検証しているか）</li>
            <li>作った後に値を変更する方法がないか（setter、可変の配列や文字列を持っていないか）</li>
            <li>端数の処理と丸めの方向・段階が、メソッドとして明示されているか</li>
            <li>DB・JSON・フォームとの境界で値オブジェクトを作り、where の値も同じ規則で正規化されるか</li>
            <li>DB の側でも、CHECK 制約と一意索引で同じ規則を守っているか</li>
          </ol>
          <Callout kind="note" title="判断の例">
            <p>
              この章のアプリでは、部屋の名前は表示に使うだけで検証の規則もないので、文字列のままにしています。メールアドレスは、予約と会員登録の両方で正規化と検証が必要で、同じ宿泊者かどうかの判定にも使うので、宿泊者（Guest）では値オブジェクトにしました。会員（Member）のように表記をそろえるだけで足りるモデルでは normalizes を使い、2つの方法を同じアプリの中で使い分けています。
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
          <li>金額・期間・メールアドレスを Float・Date・String のまま扱うと、切り上げで1円ずれる、FLOAT の列で桁が失われる、通貨の違う金額を足せる、逆の期間が保存される、表記の違いで宿泊者が重複する、という問題が起きます。</li>
          <li>値オブジェクトは、値による等価性・不変性・生成時の検証を持つ小さなオブジェクトです。Ruby では Data.define で作り、検証と正規化を initialize に集めます。with の結果も initialize を通ります。</li>
          <li>Active Record のモデルは id で区別するエンティティで、値オブジェクトを属性に持ちます。「値が同じなら入れ替えても困らないか」で、どちらにするかを決めます。</li>
          <li>金額は通貨の最小単位の整数（BIGINT）と通貨の列で持ちます。率を掛けるときは Rational で計算し、丸めの方向（floor・ceil・half_up・half_even）と丸める段階を明示します。</li>
          <li>複数の列は composed_of、1つの列は Attributes API の独自の型、表記だけなら normalizes で値とつなぎます。where の値は cast を通らず serialize に渡るので、serialize でも正規化します。</li>
          <li>期間は開始と終了の2列で持ち、Range で検索の条件を作ります。CHECK 制約と一意索引で、モデルを通らない更新からも値の規則を守ります。</li>
          <li>検証しない、変更できる、何でも値オブジェクトにする、表示用の小数で計算する、外部とやり取りする、エンティティを値で比べる、の6つの誤用を避けます。通貨が多ければ money-rails を検討します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Value Object（Catalog of Patterns of Enterprise Application Architecture）', publisher: 'Martin Fowler／martinfowler.com', url: 'https://martinfowler.com/eaaCatalog/valueObject.html', accessed: '2026-11-13', version: 'カタログは2003年3月5日（書籍は2002年刊）', note: 'Value Object の定義（金額や日付の期間のような、等しさが同一性に基づかない小さなオブジェクト）。' },
    { title: 'Refactoring, 2nd ed.: Bad Smells in Code（Primitive Obsession）', publisher: 'Martin Fowler, Kent Beck／InformIT（Pearson）', url: 'https://www.informit.com/articles/article.aspx?p=2952392&seqNum=11', accessed: '2026-11-13', version: '2018年11月19日', note: '基本型への執着（Primitive Obsession）と、Replace Primitive with Object による改善。' },
    { title: 'Replace Primitive with Object', publisher: 'Martin Fowler／refactoring.com', url: 'https://refactoring.com/catalog/replacePrimitiveWithObject.html', accessed: '2026-11-13', version: '『Refactoring』第2版のカタログ', note: '基本型の値をオブジェクトに置き換えるリファクタリング。' },
    { title: 'Value Object', publisher: 'Martin Fowler／martinfowler.com（bliki）', url: 'https://martinfowler.com/bliki/ValueObject.html', accessed: '2026-11-13', version: '2016年11月14日', note: 'エイリアシングのバグと不変性、値オブジェクトの反対を参照オブジェクトと呼ぶこと。' },
    { title: 'class Data', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Data.html', accessed: '2026-11-13', note: 'Data.define、位置引数をキーワード引数にして initialize を呼ぶこと、with、== と eql?、値に入れた可変のオブジェクトは保護しないこと。' },
    { title: 'Domain-Driven Design Reference: Definitions and Pattern Summaries', publisher: 'Eric Evans／Domain Language', url: 'https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf', accessed: '2026-11-13', version: '2015年', note: 'Entities と Value Objects の定義。値オブジェクトを不変として扱い、操作を副作用のない関数にすること。' },
    { title: 'HTML Living Standard: 4.10.5.1.5 Email state（valid email address）', publisher: 'WHATWG', url: 'https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address', accessed: '2026-11-13', version: '2026年11月12日更新', note: '有効なメールアドレスの正規表現と、RFC 5322 への意図的な違反である理由。' },
    { title: 'Range', publisher: 'Martin Fowler／martinfowler.com', url: 'https://martinfowler.com/eaaDev/Range.html', accessed: '2026-11-13', version: '2004年3月7日（草稿）', note: '範囲を1つのオブジェクトで表し、端を含むかどうかを決めること。' },
    { title: 'class Float', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Float.html', accessed: '2026-11-13', note: 'Float の誤差（0.1 + 0.2）。' },
    { title: 'Floating-Point Types (Approximate Value) - FLOAT, DOUBLE', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/floating-point-types.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'FLOAT と DOUBLE は近似値の型で、単精度は4バイト、倍精度は8バイトであること。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L46-L62`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'MySQL アダプターで float が float（limit 24）、integer が int（4バイト）、bigint が bigint になること。' },
    { title: 'Collation Naming Conventions', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/charset-collation-names.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: '照合順序の名前の _ai（アクセントを区別しない）、_ci（大文字と小文字を区別しない）、_bin の意味。' },
    { title: 'The binary Collation Compared to _bin Collations', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/charset-binary-collations.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'PAD SPACE と NO PAD の照合順序で、末尾の空白の比べ方が違うこと（utf8mb4_bin は PAD SPACE、utf8mb4_0900_bin は NO PAD）。' },
    { title: 'Character Sets and Collations in MySQL', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/charset-mysql.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'utf8mb4 の既定の照合順序が utf8mb4_0900_ai_ci で、NO PAD であること。' },
    { title: 'activerecord/lib/active_record/aggregations.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/aggregations.rb#L248-L284`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'composed_of が mapping の順に new へ値を渡し、読み取った値と代入した値を freeze して保持すること、allow_nil の動作。' },
    { title: 'ActiveRecord::Aggregations::ClassMethods（composed_of）', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Aggregations/ClassMethods.html', accessed: '2026-11-13', version: 'v8.1.4.1（内容はタグ v8.1.4.1 のソースのドキュメントで確認）', note: '値オブジェクトとエンティティの違い（エンティティは主キーなどで区別し、通常の ActiveRecord::Base のクラスはエンティティ）、値オブジェクトを不変に扱うこと。' },
    { title: 'activerecord/lib/active_record/core.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/core.rb#L632-L638`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'Active Record の == が、同じクラスで主キーがあり id が等しいときに true を返すこと。' },
    { title: 'class Float（round の half: オプション）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Float.html#method-i-round', accessed: '2026-11-13', note: 'round が既定で 0 から遠い方に丸め、half: :even などを選べること。' },
    { title: 'ISO 4217 List One（Current currency & funds code list）', publisher: 'SIX Group（ISO 4217 の維持管理機関）', url: 'https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml', accessed: '2026-11-13', version: '2026年9月17日公表', note: '通貨ごとの小数点以下の桁数（JPY 0、USD 2、BHD 3）。' },
    { title: 'class Rational', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Rational.html', accessed: '2026-11-13', note: '分数で数を正確に表すクラス。floor・ceil・round（half:）。' },
    { title: 'ruby/bigdecimal', publisher: 'GitHub', url: 'https://github.com/ruby/bigdecimal', accessed: '2026-11-13', version: 'Ruby 4.0 に同梱の版は 4.0.1（検証環境の Gemfile.lock は 4.1.3）', note: '10進の小数を任意の精度で扱うクラス。' },
    { title: 'NEWS for Ruby 3.4.0', publisher: 'Ruby 3.4 Documentation', url: 'https://docs.ruby-lang.org/en/3.4/NEWS_md.html', accessed: '2026-11-13', note: 'bigdecimal が default gem から bundled gem になったこと。' },
    { title: 'インボイス制度に関するＱ＆Ａ目次一覧', publisher: '国税庁', url: 'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/qa_invoice_mokuji.htm', accessed: '2026-11-20', note: '適格請求書の消費税額等の端数処理は「一の適格請求書につき、税率ごとに１回」とされていること。' },
    { title: 'module Comparable', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Comparable.html', accessed: '2026-11-13', note: '<=> を定義したクラスに ==・< などの比較を加えること。' },
    { title: 'class Range', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Range.html', accessed: '2026-11-13', note: '... で終わりを含まない範囲、cover?、overlap?。' },
    { title: 'NEWS for Ruby 3.3.0', publisher: 'Ruby 3.3 Documentation', url: 'https://docs.ruby-lang.org/en/3.3/NEWS_md.html', accessed: '2026-11-13', note: 'Range#overlap? の追加。' },
    { title: 'RFC 5321: Simple Mail Transfer Protocol（2.4 General Syntax Principles and Transaction Model）', publisher: 'IETF／RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc5321#section-2.4', accessed: '2026-11-20', version: '2008年10月', note: 'メールボックスのローカル部は大文字と小文字を区別するものとして扱い、区別に頼ることは勧めないこと。ドメインは区別しないこと。' },
    { title: 'ActiveRecord::Attributes::ClassMethods（attribute）', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Attributes/ClassMethods.html', accessed: '2026-11-13', version: 'v8.1.4.1（内容はタグ v8.1.4.1 のソースのドキュメントで確認）', note: '属性の型の指定、独自の型は ActiveRecord::Type::Value などを継承すること、where で serialize が呼ばれること。' },
    { title: 'activemodel/lib/active_model/type/value.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/type/value.rb#L36-L67`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'deserialize が既定で cast を呼び、cast が nil 以外を cast_value に渡し、serialize が既定で値をそのまま返すこと。' },
    { title: 'activerecord/lib/active_record/relation/query_attribute.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/query_attribute.rb#L24-L31`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'where の値は type_cast で変換されず、SQL の値は serialize で作られること（ActiveModel::Attribute#_value_for_database が type.serialize を呼ぶ）。' },
    { title: 'activemodel/lib/active_model/attributes/normalization.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/attributes/normalization.rb#L17-L73`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'normalizes の例（email.strip.downcase）、DB から読んだ値と SQL の断片には適用されないこと、normalize_attribute、NormalizedValueType の serialize が cast を呼ぶこと（164〜170行目）。' },
    { title: 'Ruby on Rails 7.1 Release Notes（Add ActiveRecord::Base.normalizes）', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/7_1_release_notes.html', accessed: '2026-11-20', version: 'Rails 7.1', note: 'normalizes が Rails 7.1 で Active Record に加わったこと。' },
    { title: 'CHECK Constraints', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'INSERT・UPDATE の結果が CHECK の条件を満たさないとエラーになること。' },
    { title: 'activemodel/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/CHANGELOG.md`, accessed: '2026-11-20', version: 'Rails 8.1.0', note: 'ActiveRecord::Normalization が ActiveModel::Attributes::Normalization に移されたこと。' },
    { title: 'activerecord/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/CHANGELOG.md`, accessed: '2026-11-20', version: 'Rails 8.1.0', note: 'ActiveRecord::CheckViolation が追加されたこと。' },
    { title: 'RubyMoney/money', publisher: 'GitHub', url: 'https://github.com/RubyMoney/money', accessed: '2026-11-13', version: '7.1.1（2026年7月31日）', note: '金額と通貨、換算を扱う Ruby のライブラリ。' },
    { title: 'RubyMoney/money-rails（README）', publisher: 'GitHub', url: 'https://github.com/RubyMoney/money-rails', accessed: '2026-11-20', version: '3.0.0（2026年1月14日）', note: 'monetize :price_cents で Money の属性を作ること、add_monetize、rounding_mode の既定が ROUND_HALF_EVEN、大きな金額では bigint にすること。' },
  ],
}

export default chapter
