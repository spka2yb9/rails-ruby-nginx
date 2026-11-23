import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 54-1 処理の手順ごとに分けたコードと、業者を知っている場所 ---------- */
const sceneSteps = [
  { x: 10, name: '購入手続き', cls: 'Cart', know: ['選ぶ規則', '送料の表'], result: ['送料 800円を表示', '（注文は 1,300円）'], bad: true },
  { x: 165, name: '注文の作成', cls: 'Order', know: ['選ぶ規則', '送料の表', '業者のコード'], result: ['ここだけ直した', '（正しく選ぶ）'], bad: false },
  { x: 320, name: '出荷指示', cls: 'ShipmentCsv', know: ['業者のコード', '倉庫のコード'], result: ['KeyError で', 'CSV を作れない'], bad: true },
  { x: 475, name: '発送のお知らせ', cls: 'OrdersHelper・メール', know: ['業者のコード', '業者名', '追跡 URL の形式', 'ゆうパケットの注意'], result: ['業者名と追跡 URL が', '空のまま届く'], bad: true },
  { x: 630, name: 'お届け予定日', cls: 'DeliveryEstimate', know: ['業者のコード', '業者ごとの日数'], result: ['2日後と表示', '（実際は3日）'], bad: true },
]

function SceneFigure() {
  return (
    <Svg
      id="54-1"
      w={780}
      h={392}
      label={`注文の処理を、購入手続き（Cart）、注文の作成（Order）、出荷指示（ShipmentCsv）、発送のお知らせ（OrdersHelper とメール）、お届け予定日（DeliveryEstimate）の5つの手順に分けている。${sceneSteps.map((s) => `${s.name}は${s.know.join('・')}を知っている`).join('。')}。Order が orders テーブルの carrier 列に業者のコードを保存し、出荷指示・お知らせ・予定日はその値を読んで分岐する。沖縄県あてをゆうパックにするために Order だけを直すと、購入手続きは 800円を表示し、出荷指示は KeyError になり、お知らせの業者名と追跡 URL は空になり、予定日は3日ではなく2日後になる`}
    >
      <T x={10} y={18} bold>
        処理の手順
      </T>
      {sceneSteps.map((s, i) => (
        <g key={s.cls}>
          <Box x={s.x} y={30} w={140} h={50} lines={[s.name, s.cls]} fs={12} bold subTone="muted" />
          {i < sceneSteps.length - 1 && <Arrow x1={s.x + 140} y1={55} x2={s.x + 155} y2={55} />}
          <Box x={s.x} y={112} w={140} h={88} lines={s.know} fs={11} fill="bg" dashed />
          <T x={s.x + 70} y={236} anchor="middle" fs={12} tone={s.bad ? 'danger' : 'acc'}>
            {s.result[0]}
          </T>
          <T x={s.x + 70} y={254} anchor="middle" fs={12} tone={s.bad ? 'danger' : 'acc'}>
            {s.result[1]}
          </T>
        </g>
      ))}
      <T x={10} y={100} fs={11} tone="muted">
        各手順が知っている業者の判断
      </T>
      <T x={10} y={216} fs={11} tone="muted">
        order.rb だけを直して、沖縄県あてに注文した結果
      </T>
      <Box x={160} y={314} w={600} h={44} lines={['orders テーブルの carrier 列', '"yamato"・"sagawa"・"yu_packet"・"yu_pack"']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={235} y1={272} x2={235} y2={312} />
      <T x={241} y={292} fs={11} tone="muted">
        保存する
      </T>
      <Arrow x1={390} y1={312} x2={390} y2={272} dashed />
      <Arrow x1={545} y1={312} x2={545} y2={272} dashed />
      <Arrow x1={700} y1={312} x2={700} y2={272} dashed />
      <T x={396} y={292} fs={11} tone="muted">
        読んでコードで分岐する
      </T>
      <T x={10} y={380} fs={11} tone="muted">
        点線の箱は、コードに書かれている業者の知識。業者のコードと選び方の規則が、5つの手順に分かれて書かれている
      </T>
    </Svg>
  )
}

/* ---------- 図 54-2 KWIC インデックスの2つの分割 ---------- */
const kwicNames = ['入力', '循環シフト', '整列', '出力']
const kwicSecrets = ['入力の形式', 'シフトの持ち方', '並べる時期と方法', '出力の書式']

function KwicFigure() {
  const leftX = [12, 106, 200, 294]
  const rightX = [404, 494, 584, 674]
  return (
    <Svg
      id="54-2"
      w={780}
      h={352}
      label="Parnas の論文の KWIC インデックスの2つの分割。分割1は処理の手順ごとに、入力・循環シフト・整列・出力に分け、主制御が順に呼ぶ。4つのモジュールは、1語に4文字を詰めた行・行の索引・シフトの索引というメモリー上の表を読み書きして受け渡すので、表の形式を変えると4つすべてを直す。分割2は、行の格納・入力・循環シフト・整列・出力に分ける。行の格納はメモリー上の格納の形式を隠し、CHAR・SETCHAR・WORDS という関数だけを見せる。入力は入力の形式を、循環シフトはシフトの持ち方を、整列は並べる時期と方法を、出力は出力の書式を隠す。格納の形式を変えても、直すのは行の格納だけになる"
    >
      <T x={12} y={16} bold>
        分割1：処理の手順ごとに分ける
      </T>
      <Box x={12} y={30} w={360} h={30} lines="主制御（各モジュールを順に呼ぶ）" fs={12} />
      {kwicNames.map((n, i) => (
        <g key={`l-${n}`}>
          <Box x={leftX[i]} y={88} w={78} h={52} lines={n} fs={12} />
          {i < 3 && <Arrow x1={leftX[i] + 78} y1={114} x2={leftX[i + 1] - 2} y2={114} />}
          <Arrow x1={leftX[i] + 39} y1={142} x2={leftX[i] + 39} y2={198} dashed both />
        </g>
      ))}
      <Box x={12} y={200} w={360} h={56} lines={['メモリー上の表（モジュールの間の取り決め）', '1語に4文字を詰めた行・行の索引・シフトの索引']} fs={12} fill="box4" subTone="muted" />
      <T x={12} y={282} fs={12} tone="danger">
        表の形式を変えると、4つのモジュールをすべて直す
      </T>
      <T x={12} y={300} fs={11} tone="muted">
        （論文が挙げた変更の2番目と3番目）
      </T>

      <line x1={388} y1={8} x2={388} y2={310} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={404} y={16} bold>
        分割2：変わりやすい判断を隠す
      </T>
      <Box x={404} y={30} w={356} h={30} lines="主制御" fs={12} />
      {kwicNames.map((n, i) => (
        <g key={`r-${n}`}>
          <Box x={rightX[i]} y={88} w={86} h={52} lines={[n, kwicSecrets[i]]} fs={11} subTone="muted" />
          <Arrow x1={rightX[i] + 43} y1={142} x2={rightX[i] + 43} y2={198} />
        </g>
      ))}
      <T x={453} y={172} fs={11} tone="muted">
        関数を呼ぶ
      </T>
      <Box x={404} y={200} w={356} h={56} lines={['行の格納（CHAR・SETCHAR・WORDS）', 'メモリー上の格納の形式（1語に4文字など）']} fs={12} fill="box5" accent subTone="muted" />
      <T x={404} y={282} fs={12} tone="acc">
        格納の形式を変えても、直すのは行の格納だけ
      </T>
      <T x={404} y={300} fs={11} tone="muted">
        （論文が挙げた変更の2番目と3番目）
      </T>
      <T x={12} y={334} fs={11} tone="muted">
        分割2の箱の2行目は、そのモジュールが隠す判断。実線の矢印は処理の順番と関数の呼び出し、破線の矢印は表の読み書き
      </T>
    </Svg>
  )
}

/* ---------- 図 54-4 Shipping が隠す判断と公開する操作 ---------- */
const callers = [
  { y: 44, lines: ['Cart', '購入手続きの送料'] },
  { y: 104, lines: ['Order', '業者の保存と合計'] },
  { y: 164, lines: ['OrdersHelper・メール', '業者名・追跡 URL'] },
  { y: 224, lines: ['ShipmentCsv', '倉庫に渡すコード'] },
]

function ModuleFigure() {
  return (
    <Svg
      id="54-4"
      w={780}
      h={362}
      label="呼び出し側の Cart、Order、OrdersHelper とメール、ShipmentCsv は、module Shipping の公開する操作 Shipping.quote(parcel) と Shipping.carrier(code) だけを呼ぶ。2つの操作は Carrier を返し、Carrier は name、fee、note、tracking_url(number)、arrival_on(shipped_on)、warehouse_code、保存するためだけの code に答える。Shipping の中に隠す判断は、契約している業者の一覧（CARRIERS、private_constant）、業者を選ぶ規則（条件と順番）、業者ごとの送料と日数、追跡 URL の形式、倉庫に渡すコード、届き方の注意。呼び出し側は code で分岐しない"
    >
      <T x={10} y={20} bold>
        呼び出し側
      </T>
      {callers.map((c) => (
        <Box key={c.lines[0]} x={10} y={c.y} w={170} h={44} lines={c.lines} fs={12} subTone="muted" />
      ))}
      <Arrow x1={180} y1={66} x2={234} y2={80} />
      <Arrow x1={180} y1={126} x2={234} y2={94} />
      <Arrow x1={180} y1={186} x2={234} y2={108} />
      <Arrow x1={180} y1={246} x2={234} y2={122} />

      <Box x={210} y={30} w={560} h={292} fill="none" dashed />
      <T x={222} y={46} fs={12} bold mono>
        module Shipping（app/models/shipping.rb）
      </T>
      <Box x={236} y={62} w={226} h={74} lines={['公開する操作', 'Shipping.quote(parcel)', 'Shipping.carrier(code)']} fs={12} fill="box2" bold mono />
      <Arrow x1={349} y1={136} x2={349} y2={158} dashed />
      <T x={356} y={148} fs={11} tone="muted">
        返す
      </T>
      <Box
        x={236}
        y={160}
        w={226}
        h={148}
        lines={['Carrier が答える項目', 'name・fee・note', 'tracking_url(number)', 'arrival_on(shipped_on)', 'warehouse_code', 'code（保存するためだけ）']}
        fs={12}
        fill="box2"
        bold
      />
      <Box
        x={486}
        y={62}
        w={270}
        h={246}
        lines={['隠す判断', '契約している業者の一覧', '（CARRIERS、private_constant）', '業者を選ぶ規則（条件と順番）', '業者ごとの送料・日数', '追跡 URL の形式', '倉庫に渡すコード', '届き方の注意']}
        fs={12}
        fill="box5"
        accent
        bold
        align="start"
      />
      <Arrow x1={486} y1={99} x2={464} y2={99} dashed />
      <T x={10} y={346} fs={12} tone="muted">
        呼び出し側は Carrier の項目だけを使い、code で分岐しない。隠した判断が変わっても、直すのは shipping.rb だけになる
      </T>
    </Svg>
  )
}

/* ---------- 図 54-5 変わりうる判断ごとに直すファイル（直す前と後） ---------- */
const matrixCols = ['Cart', 'Order', 'Helper', 'メール', 'CSV', '予定日']
const matrixRows: { label: string; before: number[]; count: string }[] = [
  { label: '業者を足す・やめる', before: [1, 1, 1, 0, 1, 1], count: '5 → 1' },
  { label: '業者を選ぶ規則', before: [1, 1, 0, 0, 0, 0], count: '2 → 1' },
  { label: '送料', before: [1, 1, 0, 0, 0, 0], count: '2 → 1' },
  { label: '追跡 URL の形式', before: [0, 0, 1, 0, 0, 0], count: '1 → 1' },
  { label: '倉庫に渡すコード', before: [0, 0, 0, 0, 1, 0], count: '1 → 1' },
  { label: '届くまでの日数', before: [0, 0, 0, 0, 0, 1], count: '1 → 1' },
  { label: '届き方の注意', before: [0, 0, 0, 1, 0, 0], count: '1 → 1' },
]

function MatrixFigure() {
  const colX = (i: number) => 190 + i * 58
  const rowY = (i: number) => 64 + i * 36
  return (
    <Svg
      id="54-5"
      w={780}
      h={360}
      label={`変わりうる判断ごとに、直すファイルを直す前と直した後で比べた表。${matrixRows.map((r) => `${r.label}：直す前は ${r.before.map((v, i) => (v ? matrixCols[i] : '')).filter(Boolean).join('・')}、直した後は shipping.rb（${r.count}）`).join('。')}`}
    >
      <Box x={10} y={10} w={172} h={52} lines="変わりうる判断" fs={12} fill="box5" bold rx={0} />
      <Box x={190} y={10} w={348} h={26} lines="直す前（処理の手順ごと）" fs={12} fill="box5" bold rx={0} />
      <Box x={556} y={10} w={110} h={26} lines="直した後" fs={12} fill="box5" bold rx={0} />
      <Box x={676} y={10} w={94} h={52} lines={['直すファイル数', '前 → 後']} fs={12} fill="box5" bold rx={0} />
      {matrixCols.map((c, i) => (
        <Box key={c} x={colX(i)} y={36} w={58} h={26} lines={c} fs={11} fill="box" rx={0} />
      ))}
      <Box x={556} y={36} w={110} h={26} lines="shipping.rb" fs={11} fill="box" rx={0} mono />
      {matrixRows.map((r, ri) => (
        <g key={r.label}>
          <Box x={10} y={rowY(ri)} w={172} h={36} lines={r.label} fs={12} fill="box" rx={0} align="start" />
          {r.before.map((v, ci) => (
            <g key={ci}>
              <rect x={colX(ci)} y={rowY(ri)} width={58} height={36} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={0.5} />
              {v === 1 && <circle cx={colX(ci) + 29} cy={rowY(ri) + 18} r={7} fill="var(--fig-danger)" />}
            </g>
          ))}
          <rect x={556} y={rowY(ri)} width={110} height={36} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeWidth={0.5} />
          <circle cx={611} cy={rowY(ri) + 18} r={7} fill="var(--fig-accent)" />
          <Box x={676} y={rowY(ri)} w={94} h={36} lines={r.count} fs={12} fill="bg" rx={0} />
        </g>
      ))}
      <circle cx={16} cy={340} r={6} fill="var(--fig-danger)" />
      <T x={28} y={340} fs={11} tone="muted">
        直す前に直すファイル
      </T>
      <circle cx={186} cy={340} r={6} fill="var(--fig-accent)" />
      <T x={198} y={340} fs={11} tone="muted">
        直した後に直すファイル（Helper・メール・CSV は Carrier の項目を読むだけになった）
      </T>
    </Svg>
  )
}

/* ---------- 図 54-6 分けすぎた ShippingGateway ---------- */
const gatewayParts = [
  { x: 270, y: 148, lines: ['Rules', '選ぶ規則（4つの lambda）'] },
  { x: 440, y: 148, lines: ['FeeTable', '送料の表'] },
  { x: 610, y: 148, lines: ['DeliveryDays', '日数の表'] },
  { x: 270, y: 232, lines: ['CarrierNames', '業者名の表'] },
  { x: 440, y: 232, lines: ['TrackingUrlBuilder', '追跡 URL の表'] },
  { x: 610, y: 232, lines: ['WarehouseCodeMapper', '倉庫のコードの表'] },
]

function OverSplitFigure() {
  return (
    <Svg
      id="54-6"
      w={780}
      h={336}
      label="左は、この章で作った Shipping。shipping.rb の1ファイル37行に、業者の一覧・選ぶ規則・業者ごとの値をまとめて持ち、ゆうパックを足すときに直すのは1ファイル。右は、分けすぎた ShippingGateway。shipping_gateway.rb が quote と、業者を private にした Quote を持ち、shipping_gateway ディレクトリの Rules（選ぶ規則）、FeeTable（送料の表）、DeliveryDays（日数の表）、CarrierNames（業者名の表）、TrackingUrlBuilder（追跡 URL の表）、WarehouseCodeMapper（倉庫のコードの表）の6ファイルに分かれている。ゆうパックを足すと6ファイルすべてを直す"
    >
      <T x={10} y={20} bold>
        この章の Shipping
      </T>
      <Box x={10} y={40} w={220} h={74} lines={['shipping.rb（37行）', '業者の一覧・選ぶ規則・', '業者ごとの値をまとめて持つ']} fs={12} fill="box2" bold subTone="muted" />
      <T x={10} y={140} fs={12} tone="acc">
        ゆうパックを足す：1ファイル
      </T>

      <line x1={250} y1={8} x2={250} y2={300} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={270} y={20} bold>
        分けすぎた ShippingGateway
      </T>
      <Box x={420} y={36} w={240} h={54} lines={['shipping_gateway.rb', 'quote と Quote（業者は private）']} fs={12} fill="box2" bold subTone="muted" />
      <Box x={262} y={120} w={506} h={174} fill="none" dashed />
      <T x={270} y={110} fs={11} tone="muted">
        shipping_gateway/（6ファイル。どの表も業者のコードをキーに持つ）
      </T>
      <Arrow x1={650} y1={90} x2={650} y2={118} />
      {gatewayParts.map((p) => (
        <g key={p.lines[0]}>
          <Box x={p.x} y={p.y} w={150} h={50} lines={p.lines} fs={12} subTone="muted" />
          <circle cx={p.x + 142} cy={p.y + 8} r={5} fill="var(--fig-danger)" />
        </g>
      ))}
      <T x={270} y={318} fs={12} tone="danger">
        ● ゆうパックを足す：6ファイル（直す前の5ファイルと同じ程度）
      </T>
    </Svg>
  )
}

/* ---------- 図 54-7 隠すかどうかの判断 ---------- */
function JudgeFigure() {
  return (
    <Svg
      id="54-7"
      w={760}
      h={412}
      label="横軸はその判断が変わる見込み、縦軸はその判断を知っている場所の数。変わる見込みが高く知っている場所が多いもの（配送業者の選び方と業者ごとの違い、決済代行や外部 API の応答の形式、倉庫や取引先と交わすファイルの形式）は1つのモジュールに隠す。変わる見込みが高く知っている場所が1か所のもの（1つの画面だけで使う表示の書式）は、今の場所に置いて名前を付けておき、知っている場所が増えたら隠す。変わる見込みが低く多くの場所が使うもの（Rails の規約と Active Record の属性、Date・Time・I18n などの安定した API）は隠さずに直接使う。変わる見込みが低く1か所でしか使わないものは何もしない"
    >
      <T x={10} y={14} fs={12} tone="muted">
        その判断を知っている場所の数（上ほど多い）
      </T>
      <Arrow x1={90} y1={350} x2={90} y2={28} />
      <Arrow x1={90} y1={350} x2={740} y2={350} />
      <line x1={410} y1={34} x2={410} y2={346} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={94} y1={190} x2={734} y2={190} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <Box
        x={100}
        y={40}
        w={300}
        h={140}
        lines={['隠さずに直接使う', '例：Rails の規約と Active Record の属性', 'Date・Time・I18n などの安定した API']}
        fs={12}
        bold
        subTone="muted"
      />
      <Box
        x={420}
        y={40}
        w={310}
        h={140}
        lines={['1つのモジュールに隠す', '例：配送業者の選び方と業者ごとの違い', '決済代行・外部 API の応答の形式', '倉庫や取引先と交わすファイルの形式']}
        fs={12}
        fill="box5"
        accent
        bold
        subTone="muted"
      />
      <Box x={100} y={200} w={300} h={140} lines={['何もしない', '例：1つのメソッドの中だけで使う値']} fs={12} fill="bg" bold subTone="muted" />
      <Box
        x={420}
        y={200}
        w={310}
        h={140}
        lines={['今の場所に置き、名前を付けておく', '例：1つの画面だけで使う表示の書式', '知っている場所が増えたら、右上と同じく隠す']}
        fs={12}
        bold
        subTone="muted"
      />
      <T x={415} y={384} anchor="middle" fs={12} tone="muted">
        その判断が変わる見込み（右ほど高い）
      </T>
      <T x={20} y={404} fs={11} tone="muted">
        利用者に見せる仕様（業者名・送料の金額）は、変わる見込みにかかわらず公開する操作で返す
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 73,
  part: 8,
  title: 'Information Hiding：配送業者の選び方をモジュールの中に隠す',
  summary:
    '配送業者のコードと選び方の規則を、購入手続き・注文・出荷指示・発送のお知らせ・お届け予定日のそれぞれが知っているために、業者を1社足すだけで5つのファイルを直すことになる場面から始めます。Parnas が1972年の論文で示した「変わりやすい設計の判断を1つのモジュールに隠す」という分割の基準で Shipping モジュールを作り、カプセル化との違い、隠しすぎたときと分けすぎたときの問題、Rails の標準機能が隠している判断を確かめます。',
  goals: [
    '処理の手順ごとにモジュールを分けると、1つの設計の判断が複数のファイルに広がる理由を説明できる',
    'Parnas の論文が示した分割の基準（変わりやすい設計の判断を、1つのモジュールに1つずつ隠す）を、KWIC インデックスの例とともに説明できる',
    'カプセル化（状態の書き換えを制限する）と情報隠蔽（変わりやすい判断を知っている場所を1つにする）の違いを、コードで見分けられる',
    '変わりうる判断を書き出し、隠す判断と公開する操作を決めて、Rails のモジュールに移せる',
    '仕様まで隠す、一緒に変わる判断を細かく分けすぎる、といった当てはめすぎを見分けられる',
    'Active Record や Active Job が隠している判断と、private_constant や send など Ruby の道具の限界を説明できる',
  ],
  prerequisites: [56, 71],
  sections: [
    {
      id: 'scene',
      title: '配送業者の判断が5つのファイルに広がった注文の処理',
      body: (
        <>
          <p>
            この章では注文ごとに配送業者を選ぶ処理を例に、<Term en="Information Hiding">情報隠蔽</Term>を扱います。情報隠蔽は、変更される可能性のある設計の判断を1つのモジュールの中に隠し、判断が変わったときの影響をそのモジュールの中にとどめるという原則です。まず、業者に関する判断がアプリのあちこちに書かれたコードを動かし、業者を1社足したときに何が起きるかを確かめます。
          </p>
          <h3>そもそも配送業者について何を決めているのか</h3>
          <p>
            例にするのは、食品と雑貨を売る EC サイトです。このサイトは3つの配送業者と契約していて、注文ごとにどれで送るかを荷物の条件で決めています。要冷蔵の荷物はヤマト運輸のクール便（送料 1,100円）、重さが 1kg 以下で厚さが 3cm 以下の荷物は日本郵便のゆうパケット（250円）、それ以外は佐川急便（800円）で送ります。ゆうパケットは郵便受けに届くので、受け取りのサインは要りません。
          </p>
          <p>業者が決まると、注文に関わるいくつもの処理がその結果を使います。</p>
          <ul>
            <li>購入手続きの画面は注文を確定する前に送料の目安を表示します。</li>
            <li>注文は業者を記録し、商品の合計に送料を足して請求の金額を出します。</li>
            <li>倉庫に毎日送る出荷指示の CSV には、倉庫のシステムが業者ごとに決めたコード（ヤマト運輸のクール便なら YMT-COOL）を書きます。</li>
            <li>発送のお知らせのメールには業者名と追跡 URL を載せます。追跡 URL は荷物の状況を確かめるページの URL で、形式は業者ごとに違います。</li>
            <li>お届け予定日は業者ごとの日数（ゆうパケットは3日、ほかは2日）から出します。</li>
          </ul>
          <p>
            どの業者と契約するか、どの条件でどの業者を選ぶかは、運賃の改定や新しい契約のたびに変わります。この章では、このように開発者が決めた内容で、後から変わりうるものを<Term en="design decision">設計の判断</Term>と呼びます。
          </p>
          <h3>処理の手順ごとに書いたコード</h3>
          <p>注文は orders テーブルに保存します。業者は carrier 列に、"yamato" のようなコードで記録します。</p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_orders.rb"
            code={`
class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :number, null: false             # 注文番号
      t.string :prefecture, null: false         # 届け先の都道府県
      t.integer :weight_g, null: false          # 荷物の重さ（g）
      t.integer :thickness_mm, null: false      # 荷物の厚さ（mm）
      t.boolean :cool, null: false, default: false # 要冷蔵か
      t.integer :subtotal, null: false          # 商品の合計（円）
      t.string :carrier, null: false            # 配送業者のコード
      t.string :tracking_number                 # 送り状の番号（発送後に入る）
      t.timestamps
    end
  end
end
`}
          />
          <p>
            最初のコードは処理の手順ごとにクラスを分けて書いています。購入手続きの画面で使う Cart は DB に保存しない Active Model のクラスで、送料の目安を自分で計算します。
          </p>
          <Code
            lang="ruby"
            title="app/models/cart.rb（直す前）"
            code={`
# 購入手続きの画面で使うカート（DB には保存しない）
class Cart
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :prefecture, :string
  attribute :weight_g, :integer
  attribute :thickness_mm, :integer
  attribute :cool, :boolean, default: false

  # 画面に表示する送料の目安
  def estimated_shipping_fee
    return 1100 if cool
    return 250 if weight_g <= 1000 && thickness_mm <= 30
    800
  end
end
`}
          />
          <p>
            Order は作るときに業者を選んで carrier 列に入れ、送料を業者のコードから決めます。<code>attr_readonly :carrier</code> は、保存した後に carrier を書き換えようとすると例外を投げる Active Record の宣言です。業者は送り状を作った後に変えられないので、この宣言で守っています。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直す前）"
            code={`
class Order < ApplicationRecord
  attr_readonly :carrier # 作った後は業者を書き換えられない
  before_validation :assign_carrier, on: :create

  def shipping_fee
    case carrier
    when "yamato" then 1100
    when "sagawa" then 800
    when "yu_packet" then 250
    end
  end

  def total = subtotal + shipping_fee

  private

  # 荷物の条件から配送業者を選ぶ
  def assign_carrier
    self.carrier =
      if cool
        "yamato"      # 要冷蔵はヤマト運輸のクール便
      elsif weight_g <= 1000 && thickness_mm <= 30
        "yu_packet"   # 小さく軽い荷物はゆうパケット
      else
        "sagawa"      # それ以外は佐川急便
      end
  end
end
`}
          />
          <p>画面とメールで使うヘルパーは、業者のコードから業者名と追跡 URL を作ります。発送のお知らせのメールは、ヘルパーを使い、ゆうパケットのときだけ注意書きを加えます。</p>
          <Code
            lang="ruby"
            title="app/helpers/orders_helper.rb（直す前）"
            code={`
module OrdersHelper
  CARRIER_LABELS = {
    "yamato" => "ヤマト運輸（クール便）",
    "sagawa" => "佐川急便",
    "yu_packet" => "日本郵便（ゆうパケット）"
  }.freeze

  def carrier_label(order)
    CARRIER_LABELS[order.carrier]
  end

  def tracking_url(order)
    case order.carrier
    when "yamato" then "https://tracking.yamato.example/?no=#{order.tracking_number}"
    when "sagawa" then "https://tracking.sagawa.example/#{order.tracking_number}"
    when "yu_packet" then "https://tracking.post.example/?req=#{order.tracking_number}"
    end
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/shipping_mailer/shipped.text.erb（直す前）"
            code={`
ご注文 <%= @order.number %> を発送しました。
配送業者：<%= carrier_label(@order) %>
お荷物の確認：<%= tracking_url(@order) %>
<% if @order.carrier == "yu_packet" %>
郵便受けに届きます。受け取りのサインは不要です。
<% end %>
`}
          />
          <p>
            ShippingMailer は <code>helper OrdersHelper</code> でヘルパーを読み込み、<code>@order</code> を渡してこのテンプレートを描くだけのクラスなので、ここでは省きます。出荷指示の CSV とお届け予定日は、それぞれ別のクラスにあります。
          </p>
          <Code
            lang="ruby"
            title="app/models/shipment_csv.rb（直す前）"
            code={`
# 倉庫に送る出荷指示の CSV（値にカンマを含まない前提で、行を組み立てる）
class ShipmentCsv
  SERVICE_CODES = { "yamato" => "YMT-COOL", "sagawa" => "SGW-STD", "yu_packet" => "JP-YPKT" }.freeze

  def self.generate(orders)
    rows = orders.map { |o| [o.number, o.prefecture, SERVICE_CODES.fetch(o.carrier)] }
    [%w[注文番号 届け先 業者コード], *rows].map { |row| row.join(",") + "\\n" }.join
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/delivery_estimate.rb（直す前）"
            code={`
# お届け予定日
class DeliveryEstimate
  def self.arrival_on(order, shipped_on:)
    days = order.carrier == "yu_packet" ? 3 : 2
    shipped_on + days
  end
end
`}
          />
          <p>
            RSpec のテストは、3社それぞれの業者の選択と送料、購入手続きの送料の目安、CSV の業者コード、メールの業者名と追跡 URL を確かめています。この時点で <code>bundle exec rspec</code> の結果は 7 examples, 0 failures です。図 54-1 は5つの手順と、それぞれが知っている業者の判断を並べたものです。
          </p>
          <Figure n="54-1" title="処理の手順ごとに分けたコードと、業者を知っている場所" caption="下段は、次の項で order.rb だけを直して沖縄県あてに注文したときの結果。赤は不具合、青は正しく動いた箇所。">
            <SceneFigure />
          </Figure>
          <p>
            図 54-1 の上段は、購入手続きから予定日までの処理の順番です。中段の点線の箱は、各手順のコードに書かれている業者の知識です。業者のコードは5つのうち4つの手順が知っていて、選ぶ規則と送料の表は Cart と Order の2か所にあります。
          </p>
          <h3>沖縄県あての荷物をゆうパックに替える</h3>
          <p>
            運賃を見直した結果、沖縄県あての通常の荷物（要冷蔵でなく、ゆうパケットに入らないもの）は、佐川急便ではなく日本郵便のゆうパックで送る契約になりました。送料は 1,300円、発送から届くまで3日、倉庫のコードは JP-YPCK、追跡 URL はゆうパケットと同じ形式です。
          </p>
          <p>担当者は、業者を選ぶ処理がある Order を開き、条件と送料を足しました。</p>
          <Code
            lang="text"
            title="app/models/order.rb の変更（diff -u）"
            code={`
@@ -7,6 +7,7 @@
     when "yamato" then 1100
     when "sagawa" then 800
     when "yu_packet" then 250
+    when "yu_pack" then 1300
     end
   end

@@ -21,6 +22,8 @@
         "yamato"      # 要冷蔵はヤマト運輸のクール便
       elsif weight_g <= 1000 && thickness_mm <= 30
         "yu_packet"   # 小さく軽い荷物はゆうパケット
+      elsif prefecture == "沖縄県"
+        "yu_pack"     # 追加：沖縄県あてはゆうパック
       else
         "sagawa"      # それ以外は佐川急便
       end
`}
          />
          <p>この変更の後も、RSpec の結果は 7 examples, 0 failures のままでした。次に、沖縄県あての注文を作り、注文に関わる処理を順に実行するスクリプトを動かしました。</p>
          <Code
            lang="ruby"
            title="script/okinawa.rb"
            code={`
# 沖縄県あての注文を作り、注文に関わる処理を順に実行する
Order.delete_all
include OrdersHelper

cart = Cart.new(prefecture: "沖縄県", weight_g: 2000, thickness_mm: 100)
puts "購入手続きの画面の送料：#{cart.estimated_shipping_fee}円"

order = Order.create!(number: "B-7", prefecture: "沖縄県", weight_g: 2000, thickness_mm: 100, subtotal: 3000, tracking_number: "5678")
puts "注文の業者：#{order.carrier} / 送料：#{order.shipping_fee}円 / 合計：#{order.total}円"
puts "画面の業者名：#{carrier_label(order).inspect}"
puts "お届け予定日：#{DeliveryEstimate.arrival_on(order, shipped_on: Date.new(2026, 11, 21))}"
puts "--- 発送のお知らせ"
puts ShippingMailer.shipped(order).body.to_s
puts "--- 出荷指示の CSV"
begin
  puts ShipmentCsv.generate([order])
rescue => e
  puts "#{e.class}: #{e.message}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/okinawa.rb）"
            code={`
購入手続きの画面の送料：800円
注文の業者：yu_pack / 送料：1300円 / 合計：4300円
画面の業者名：nil
お届け予定日：2026-11-23
--- 発送のお知らせ
ご注文 B-7 を発送しました。
配送業者：
お荷物の確認：

--- 出荷指示の CSV
KeyError: key not found: "yu_pack"
`}
          />
          <h3>実行結果から読み取れること</h3>
          <ul>
            <li>注文は正しくゆうパックを選び、送料 1,300円で合計 4,300円を請求します。一方、購入手続きの画面には佐川急便の 800円が表示されます。利用者が確認した送料と、請求する送料が違います。</li>
            <li>画面の業者名は nil です。ヘルパーの表に yu_pack がないので、ハッシュから nil が返ります。</li>
            <li>発送のお知らせのメールは、業者名と追跡 URL が空のまま送られます。case 文がどの when にも当たらず nil を返し、ERB は nil を空の文字列として出力するので、例外になりません。</li>
            <li>出荷指示の CSV は KeyError で作れません。倉庫に出荷指示が届かず、荷物が出ません。</li>
            <li>お届け予定日は 11/23（2日後）と表示されます。ゆうパックで沖縄県へは3日かかるので、正しくは 11/24 です。</li>
          </ul>
          <p>
            どこを直せばよいかを調べるために、業者のコードを含むファイルを探しました。
          </p>
          <Code
            lang="text"
            title={`実行結果（grep -rlE '"(yamato|sagawa|yu_packet)"' app）`}
            code={`
app/helpers/orders_helper.rb
app/models/delivery_estimate.rb
app/models/order.rb
app/models/shipment_csv.rb
app/views/shipping_mailer/shipped.text.erb
`}
          />
          <p>
            この一覧には Cart が出てきません。Cart は業者のコードを使わず、送料の金額と条件だけを持っているからです。業者のコードで探しても、送料の目安を直す必要があることはわかりません。実際に5つの手順をすべて正しく直したところ、直したファイルは Cart・Order・OrdersHelper・ShipmentCsv・DeliveryEstimate の5つになりました（後の「Shipping モジュールに業者の判断を集める」の節で比べます）。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>「どの業者と契約し、どの条件で選ぶか」という1つの設計の判断に関わる知識が、処理の手順ごとに分けた5つのファイルに分かれて書かれています。</li>
            <li>業者を1社足すと、5つのファイルを直します。どこを直すかは grep で探すしかなく、Cart のように業者のコードを含まないファイルは grep では見つかりません。</li>
            <li>直し漏れたときの症状が、nil、空の文字列、KeyError、誤った日付とばらばらです。例外にならない症状は、利用者や倉庫からの問い合わせで初めて見つかります。</li>
            <li>既存のテストは3社の場合だけを確かめているので、直し漏れがあってもすべて通ります。</li>
            <li>
              Order は <code>attr_readonly</code> で業者の書き換えを防いでいます。状態は守られているのに、上の問題は防げていません。この理由は次の節で説明します。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '情報隠蔽の意味と、Parnas の1972年の論文',
      body: (
        <>
          <h3>情報隠蔽の定義</h3>
          <p>
            Information Hiding（情報隠蔽）は、変更される可能性のある設計の判断を、1つのモジュールの中に隠す原則です。モジュールの外には、その判断が変わっても変わらない操作だけを見せます。判断が変わったときに直すのはそのモジュールだけになり、外への影響を最小限に抑えられます。
          </p>
          <p>
            ここでの「隠す」は、ソースコードを読めなくすることではありません。ほかのモジュールのコードが、その判断を前提にして書かれていない状態を指します。前の節のヘルパーは <code>"yu_packet"</code> という文字列で分岐しているので、「ゆうパケットという業者がある」という判断を前提にしたコードです。業者の一覧が変われば、ヘルパーも直すことになります。
          </p>
          <h3>Parnas の論文「On the Criteria To Be Used in Decomposing Systems into Modules」</h3>
          <p>
            情報隠蔽は、David L. Parnas（当時 Carnegie-Mellon University）が 1972年12月に Communications of the ACM（第15巻第12号）に発表した論文「On the Criteria To Be Used in Decomposing Systems into Modules」で示した、モジュールに分ける基準です<Ref n={1} />。論文はまず、モジュールに分けることで期待される利点として次の3つを挙げます<Ref n={1} />。
          </p>
          <ul>
            <li>開発の管理：別々のグループが、互いにあまり連絡を取らずに各モジュールを作れるので、開発の期間が短くなる</li>
            <li>製品の柔軟性：1つのモジュールを大きく変えても、ほかのモジュールを変えずに済む</li>
            <li>理解のしやすさ：システムを1つのモジュールずつ読んで理解できる</li>
          </ul>
          <p>
            そのうえで Parnas は、それまでのモジュール化の説明が「どういう基準でシステムをモジュールに分けるか」を述べていないと指摘し、例を使って基準を示しました。論文の中の「モジュール」は、サブプログラム（関数）ではなく、仕事の割り当て（responsibility assignment）を指します<Ref n={1} />。1つのモジュールが複数の関数を持つこともあります。Rails のアプリで言えば、1つのクラスでも、複数のクラスを持つ名前空間でもかまいません。
          </p>
          <h3>KWIC インデックスの2つの分割</h3>
          <p>
            論文が例に使ったのは、<Term en="KWIC index">KWIC インデックス</Term>を作るシステムです。KWIC インデックスは書名などの行の集まりを受け取り、各行の先頭の単語を末尾に回す操作を繰り返して作った<Term en="circular shift">循環シフト</Term>をすべて並べ、アルファベット順に出力したものです。「Rails Guides」という行なら、「Rails Guides」と「Guides Rails」の2つができ、どちらの単語からでも引けます。
          </p>
          <p>Parnas はこのシステムを2通りに分けました<Ref n={1} />。</p>
          <ul>
            <li>
              分割1：入力・循環シフト・整列・出力・主制御の5つです。入力モジュールは行を読んで、1語に4文字を詰めた形式でメモリーに置き、行の開始位置の索引を作ります。循環シフトのモジュールは、その表を読んでシフトの索引を作ります。整列と出力も、前のモジュールが作った表を読みます。モジュールの間の取り決めはメモリー上の表の形式です。
            </li>
            <li>
              分割2：行の格納・入力・循環シフト・整列・出力・主制御の6つです。行の格納のモジュールは、<code>CHAR(r,w,c)</code>（r 行目の w 番目の単語の c 文字目を返す）や <code>SETCHAR</code>、<code>WORDS</code> といった関数を持ち、行をどうメモリーに置くかはこのモジュールだけが知っています。循環シフトのモジュールも、すべてのシフトを持っているかのように <code>CSCHAR</code> という関数で文字を返し、シフトを索引で持つか実際に書き出すかを外に見せません。整列のモジュールは <code>ALPH</code> と <code>ITH</code>（i 番目のシフトの番号を返す）だけを見せます。
            </li>
          </ul>
          <Figure n="54-2" title="KWIC インデックスの2つの分割（Parnas, 1972）" caption="論文の説明をもとにした模式図。分割2では、整列と出力は循環シフトの関数も呼ぶが、図では省いた。">
            <KwicFigure />
          </Figure>
          <p>
            図 54-2 の左が分割1、右が分割2です。分割1の4つのモジュールはメモリー上の表（下の緑の箱）を読み書きして処理の結果を受け渡します。分割2のモジュールは関数を呼び合い、メモリー上の形式は行の格納（下の紫の箱）だけが知っています。
          </p>
          <p>
            Parnas は分割1の基準を「処理の大きな手順を1つのモジュールにする」ことだとし、フローチャートを書いて分ける方法だと説明しています。分割2は「information hiding」を基準にしたもので、各モジュールは次のように特徴づけられると述べています<Ref n={1} />。
          </p>
          <blockquote>
            分割2のモジュールはどれも、ある設計の判断を知っていて、それをほかのすべてのモジュールから隠していることで特徴づけられる。そのインターフェース（定義）は、モジュールの内部の働きをできるだけ見せないように選んだ。（論文の 1056 ページの文を訳した）
          </blockquote>
          <p>
            論文はさらに、2つの分割は実行すると同じ動きをすることがあると述べています。違いは、仕事の分け方と、モジュールの間のインターフェースにあります<Ref n={1} />。この章の例でも、3社についての結果は、直す前と直した後のコードで同じです。違いが出るのは、業者を足すなど、判断を変えたときです。
          </p>
          <h3>論文が比べた5つの変更</h3>
          <p>Parnas は、KWIC インデックスで変わりそうな設計の判断として、次の5つを挙げました<Ref n={1} />。</p>
          <ol>
            <li>入力の形式</li>
            <li>すべての行をメモリーに置くという判断（大きな入力では置ききれない）</li>
            <li>1語に4文字を詰めるという判断（データが少なければ詰めないほうが速い）</li>
            <li>循環シフトを書き出さずに索引で持つという判断</li>
            <li>一度にすべてを整列するという判断（必要なときに探す、少しずつ整列するなどの方法もある）</li>
          </ol>
          <p>
            1番目の変更はどちらの分割でも入力のモジュールだけで済みます。2番目と3番目は、分割1ではすべてのモジュールを直すことになり、分割2では行の格納のモジュールだけで済みます。4番目は、分割2では循環シフトのモジュールだけですが、分割1では整列と出力も直します。5番目も、出力が索引の完成を前提にしているので、分割1では難しい変更です<Ref n={1} />。
          </p>
          <p>
            論文の結論は次の提案です。フローチャートからモジュールに分け始めるのは、ほとんどの場合に誤りである。そうではなく、難しい設計の判断や、変わりそうな設計の判断の一覧から始め、それぞれの判断をほかのモジュールから隠すように各モジュールを設計する<Ref n={1} />。
          </p>
          <p>
            前の節のコードは分割1と同じ形をしています。購入手続き・注文の作成・出荷指示・お知らせ・予定日という処理の手順でクラスを分け、業者のコードという取り決めを手順の間で受け渡しています。業者を足す変更は、KWIC インデックスで表の形式を変えるのと同じように、手順のすべてに及びました。
          </p>
          <h3>論文が挙げた、隠すとよいもの</h3>
          <p>論文は、すべてのモジュールが何かの設計の判断を隠すという一般的な基準に加えて、分けるとよい例を挙げています<Ref n={1} />。</p>
          <ul>
            <li>データ構造と、その内部のつながり、それを読む手続きと変える手続きは、1つのモジュールにまとめる（多くのモジュールで共有しない）</li>
            <li>サブルーチンを呼び出す手順の取り決めは、そのサブルーチンを担当する側が持つ</li>
            <li>OS のキューなどで使う制御ブロックの形式は、1つのモジュールに隠す（形式をモジュールの間の取り決めにすると、形式の変更が高くつく）</li>
            <li>文字コードやアルファベット順などの並びは、1つのモジュールに隠す</li>
            <li>処理する順番は、できるだけ1つのモジュールに隠す</li>
          </ul>
          <p>
            Rails のアプリに置き換えると、外部の API の応答の形式、取引先と交わすファイルの形式、配送業者や決済代行の会社ごとの違い、状態の持ち方などが、隠す候補になります。どれも、アプリの外の事情で変わり、変わったときにアプリの多くの場所が影響を受けやすいものです。なお、用語の information hiding について、論文は Parnas 自身の 1971年の技術報告（同年の IFIP の大会で発表したもの）を参照しています<Ref n={1} />。
          </p>
          <h3>Encapsulation（カプセル化）との違い</h3>
          <p>
            <ChapterLink n={71} />（Encapsulation）で扱ったカプセル化は、内部の状態と実装の詳細を隠し、外には必要な操作だけを公開することでした。その章では、ウォレットの残高を外から直接書き換えさせず、残高の条件を守る Wallet の操作を通してだけ変えさせました。
          </p>
          <p>
            前の節の Order も、この意味ではカプセル化しています。carrier は Order の中で選ばれ、作った後に外から書き換えることはできません。直す前のコードで確かめました。
          </p>
          <Code
            lang="ruby"
            title="script/readonly.rb"
            code={`
# Order は業者を外から書き換えさせない（カプセル化）が、業者のコードはそのまま返す
Order.delete_all
order = Order.create!(number: "A-1", prefecture: "東京都", weight_g: 800, thickness_mm: 25, subtotal: 3000)
begin
  order.update!(carrier: "sagawa")
rescue => e
  puts "#{e.class}: #{e.message}"
end
puts "order.carrier # => #{order.carrier.inspect}"
`}
          />
          <Code
            lang="text"
            title="実行結果（直す前のコードで bin/rails runner script/readonly.rb）"
            code={`
ActiveRecord::ReadonlyAttributeError: carrier
order.carrier # => "yu_packet"
`}
          />
          <p>
            書き換えは例外で止まりました。一方、<code>order.carrier</code> は "yu_packet" という内部の表現をそのまま返し、ヘルパー・メール・CSV・予定日はその値を見て分岐しています。カプセル化は「状態を誰がどう変えてよいか」を制限しますが、「どの判断を誰が知っていてよいか」は決めません。読み取り用のメソッドが内部の表現をそのまま返していれば、状態を守っていても判断は外に漏れます。
          </p>
          <p>
            反対に、次の節で作る Shipping モジュールは、書き換えられる状態を持ちません。凍結した業者の表と、業者を選ぶメソッドがあるだけです。守る状態がなくても、「どの業者をどの条件で選ぶか」という判断は隠せます。図 54-3 は、2つの原則を観点ごとに比べたものです。
          </p>
          <Figure n="54-3" title="Encapsulation と Information Hiding の違い" caption="カプセル化の定義は依頼文と Encapsulation の章の内容、情報隠蔽の定義は Parnas の論文による。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">観点</th>
                    <th scope="col">Encapsulation（カプセル化）</th>
                    <th scope="col">Information Hiding（情報隠蔽）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">答える問い</th>
                    <td>このオブジェクトの状態を、誰がどの操作で変えてよいか</td>
                    <td>どの設計の判断が変わりやすく、それをどのモジュールだけが知っているようにするか</td>
                  </tr>
                  <tr>
                    <th scope="row">守るもの</th>
                    <td>状態と、状態が満たすべき条件（残高がマイナスにならない、作った後は業者を変えない）</td>
                    <td>変更の範囲（業者を足しても、直すのは1つのモジュール）</td>
                  </tr>
                  <tr>
                    <th scope="row">隠す対象</th>
                    <td>インスタンス変数、属性への書き込み、内部で使うメソッド</td>
                    <td>データの形式、規則、アルゴリズム、外部の仕様、処理の順番。状態を持たないものも含む</td>
                  </tr>
                  <tr>
                    <th scope="row">単位</th>
                    <td>1つのクラス（オブジェクト）</td>
                    <td>1つの判断を受け持つモジュール。複数のクラスやファイルでもよい</td>
                  </tr>
                  <tr>
                    <th scope="row">守れていないときの症状</th>
                    <td>状態を外から書き換えられ、不正な値が保存される</td>
                    <td>1つの判断を変えるために、多くのファイルを直す。直し漏れが起きる</td>
                  </tr>
                  <tr>
                    <th scope="row">Ruby と Rails の道具</th>
                    <td>private、attr_reader、attr_readonly、バリデーション</td>
                    <td>モジュールと名前空間、private_constant、公開するメソッドを絞ること、Adapter</td>
                  </tr>
                  <tr>
                    <th scope="row">この章の例</th>
                    <td>Order の attr_readonly :carrier</td>
                    <td>Shipping モジュール（業者の一覧と選ぶ規則）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            2つの言葉の使い方は、人によって重なります。Martin Fowler は、カプセル化の要点はデータを隠すことではなく、設計の判断、特に変わるかもしれない判断を隠すことだと述べています<Ref n={12} />。これは、この章で情報隠蔽と呼んでいるものです。本書では Encapsulation の章と同じく、状態の書き換えを制限することをカプセル化、変わりうる判断を知っている場所を1つにすることを情報隠蔽と呼んで区別します。
          </p>
          <p>
            2つの原則は、よく一緒に使います。Parnas が隠すとよいものの1番目に挙げた「データ構造と、それを読む手続き・変える手続きを1つのモジュールにまとめる」は、クラスと private で書けば、そのままカプセル化になります。ただし、カプセル化したクラスでも、読み取りのメソッドが返す値に設計の判断が表れていれば、情報隠蔽はできていません。設計を見直すときは、「このクラスの状態は守られているか」と「この判断を知っているファイルはいくつあるか」を別々に確かめます。
          </p>
          <h3>ほかの原則との違い</h3>
          <ul>
            <li>
              <ChapterLink n={70} />（Low Coupling）：モジュールの間の依存を少なくする原則です。結合の強さは結果として測るもので、情報隠蔽は、何を隠せば結合が弱くなるかを決める基準になります。直す前のコードでは、ヘルパーも CSV も Order の carrier 列の値という内部の表現に依存していました。
            </li>
            <li>
              <ChapterLink n={59} />（DRY）：同じ知識を複数の場所に書かない原則です。Cart と Order に送料の表が2つあるのは DRY の問題です。一方、業者名はヘルパーにだけ、倉庫のコードは CSV にだけ書かれていて、重複はしていません。それでも業者を足すと5つのファイルを直します。情報隠蔽は、重複がなくても、1つの判断に関わる知識が分かれて書かれていることを問題にします。
            </li>
            <li>
              <ChapterLink n={64} />（OCP）：既存のコードを書き換えずに振る舞いを足せるようにする原則です。この章で業者の判断を Shipping に集めた後も、業者を足すときは Shipping を書き換えます。情報隠蔽が目指すのは、書き換える場所を1つのモジュールにとどめることです。
            </li>
            <li>
              <ChapterLink n={42} section="idea" />（Adapter）：外部の API の違いをアプリが使う形にそろえるパターンです。外部のサービスの仕様は変わりやすい判断の代表で、Adapter は、それを隠す実装の形の1つです。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: 'Shipping モジュールに業者の判断を集める',
      body: (
        <>
          <h3>変わりうる判断を書き出す</h3>
          <p>Parnas の提案に従い、まず変わりうる設計の判断を書き出します。配送について、この EC サイトで変わりそうなものは次の6つです。</p>
          <ol>
            <li>契約している業者（足す・やめる）</li>
            <li>荷物の条件から業者を選ぶ規則（条件と、条件を確かめる順番）</li>
            <li>業者ごとの送料</li>
            <li>業者ごとの追跡 URL の形式</li>
            <li>倉庫のシステムに渡す業者のコード</li>
            <li>業者ごとの届くまでの日数と、届き方の注意</li>
          </ol>
          <p>
            6つのうち、1は2〜6のすべてに関わります。業者を足すと、規則にも送料にも URL にもコードにも、その業者の値が要るからです。このように一緒に変わる判断は、1つのモジュールにまとめます。モジュールの名前は Shipping にします。
          </p>
          <p>
            反対に、隠さないものも決めておきます。業者名と送料の金額は、利用者が画面とメールで見る仕様です。仕様は、モジュールが外に返す値として扱います。また、「1つの注文は1つの業者で送る」ことは、orders テーブルの carrier 列という形で注文が持ち続けます。
          </p>
          <h3>隠す判断と公開する操作を決める</h3>
          <p>呼び出し側が業者について知りたいことは、次の2つの問いにまとめられます。</p>
          <ul>
            <li>この荷物の条件なら、どの業者で送るか（購入手続きと注文の作成）</li>
            <li>保存した業者について、業者名・送料・追跡 URL・予定日・倉庫のコード・届き方の注意は何か（お知らせ、CSV、合計）</li>
          </ul>
          <p>
            1つ目を <code>Shipping.quote(parcel)</code>、2つ目を <code>Shipping.carrier(code)</code> とします。どちらも業者を表す Carrier を返し、呼び出し側は Carrier の項目を読むだけにします。Carrier は業者のコード（code）も持ちますが、これは注文に保存するためだけに使い、呼び出し側でコードによる分岐は書きません。
          </p>
          <Figure n="54-4" title="Shipping が隠す判断と、公開する操作" caption="紫の箱が Shipping の中に隠す判断。呼び出し側からの実線の矢印は、公開する操作の呼び出し。">
            <ModuleFigure />
          </Figure>
          <p>
            図 54-4 の右の紫の箱が、Shipping の中に隠す判断です。左の呼び出し側は、真ん中の公開する操作だけを呼びます。業者の一覧と選ぶ規則が変わっても、真ん中の操作の形は変わりません。
          </p>
          <h3>Shipping モジュールを作る</h3>
          <p>まず、今の3社のままで Shipping を作ります。</p>
          <Code
            lang="ruby"
            title="app/models/shipping.rb（3社のとき）"
            code={`
# 配送業者に関する判断を、このモジュールの中に隠す。
#   隠す判断：どの業者と契約しているか／荷物の条件から業者を選ぶ規則／
#             業者ごとの送料・日数・追跡 URL の形式・倉庫に渡すコード・届き方の注意
#   公開する操作：quote（荷物の条件から業者を選ぶ）と carrier（保存したコードから業者を取り出す）
module Shipping
  # 業者が答える項目。呼び出し側はこの項目を使い、code で分岐しない（code は保存するためだけに使う）
  Carrier = Data.define(:code, :name, :fee, :days, :warehouse_code, :tracking_format, :note) do
    def tracking_url(number) = format(tracking_format, number:)
    def arrival_on(shipped_on) = shipped_on + days
  end

  CARRIERS = [
    Carrier.new(code: "yamato", name: "ヤマト運輸（クール便）", fee: 1100, days: 2, warehouse_code: "YMT-COOL",
                tracking_format: "https://tracking.yamato.example/?no=%{number}", note: nil),
    Carrier.new(code: "sagawa", name: "佐川急便", fee: 800, days: 2, warehouse_code: "SGW-STD",
                tracking_format: "https://tracking.sagawa.example/%{number}", note: nil),
    Carrier.new(code: "yu_packet", name: "日本郵便（ゆうパケット）", fee: 250, days: 3, warehouse_code: "JP-YPKT",
                tracking_format: "https://tracking.post.example/?req=%{number}",
                note: "郵便受けに届きます。受け取りのサインは不要です。")
  ].index_by(&:code).freeze
  private_constant :CARRIERS

  # parcel は weight_g・thickness_mm・cool・prefecture に答えるもの（Order と Cart）
  def self.quote(parcel)
    code =
      if parcel.cool then "yamato"
      elsif parcel.weight_g <= 1000 && parcel.thickness_mm <= 30 then "yu_packet"
      else "sagawa"
      end
    CARRIERS.fetch(code)
  end

  def self.carrier(code) = CARRIERS.fetch(code)
end
`}
          />
          <ul>
            <li>
              <code>Data.define</code> は、作った後に値を変えられないクラスを作る Ruby の機能です<Ref n={4} />。Carrier は業者ごとの値を持ち、追跡 URL と予定日を計算するメソッドを持ちます。<code>format</code> の <code>%{'{number}'}</code> は、キーワード引数の値を埋め込む書式です。
            </li>
            <li>
              業者の表 CARRIERS は、コードをキーにしたハッシュです。<code>private_constant</code> は、定数をモジュールの外から <code>Shipping::CARRIERS</code> の形で参照できないようにする Ruby のメソッドです<Ref n={3} />。外から見えるのは quote と carrier の2つになります。
            </li>
            <li>
              quote の引数 parcel は、weight_g・thickness_mm・cool・prefecture の4つのメソッドに答えるオブジェクトなら何でもかまいません。Order も Cart もこの4つを持っているので、そのまま渡せます。今の規則は prefecture を使いませんが、届け先は荷物の条件の1つなので、受け取る値に含めておきます。
            </li>
          </ul>
          <h3>呼び出し側を1つずつ置き換える</h3>
          <p>
            次に、呼び出し側を1つずつ Shipping に置き換えます。1つ置き換えるたびに RSpec を実行すれば、3社についての結果が変わらないことを確かめながら進められます。Order は業者の選択を Shipping.quote に任せ、送料は保存したコードから取り出した Carrier に聞きます。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直した後）"
            code={`
class Order < ApplicationRecord
  attr_readonly :carrier
  before_validation -> { self.carrier = Shipping.quote(self).code }, on: :create

  # 業者に関することは Shipping に聞く
  def shipping = Shipping.carrier(carrier)
  def shipping_fee = shipping.fee
  def total = subtotal + shipping_fee
end
`}
          />
          <p>Cart は、注文を作るときと同じ Shipping.quote で送料の目安を出します。規則と送料の表が1か所になったので、画面と請求の金額が食い違うことはなくなります。</p>
          <Code
            lang="ruby"
            title="app/models/cart.rb（直した後。属性の宣言は直す前と同じなので省略）"
            code={`
class Cart
  # …（省略）

  # 画面に表示する送料の目安。注文を作るときと同じ規則で選ぶ
  def estimated_shipping_fee = Shipping.quote(self).fee
end
`}
          />
          <p>ヘルパー・メール・CSV は、業者のコードの表と分岐を消し、Carrier の項目を読むだけにします。</p>
          <Code
            lang="ruby"
            title="app/helpers/orders_helper.rb（直した後）"
            code={`
module OrdersHelper
  def carrier_label(order) = order.shipping.name
  def tracking_url(order) = order.shipping.tracking_url(order.tracking_number)
end
`}
          />
          <Code
            lang="erb"
            title="app/views/shipping_mailer/shipped.text.erb（直した後）"
            code={`
ご注文 <%= @order.number %> を発送しました。
配送業者：<%= carrier_label(@order) %>
お荷物の確認：<%= tracking_url(@order) %>
<% if @order.shipping.note %>
<%= @order.shipping.note %>
<% end %>
`}
          />
          <Code
            lang="ruby"
            title="app/models/shipment_csv.rb（直した後）"
            code={`
# 倉庫に送る出荷指示の CSV（値にカンマを含まない前提で、行を組み立てる）
class ShipmentCsv
  def self.generate(orders)
    rows = orders.map { |o| [o.number, o.prefecture, o.shipping.warehouse_code] }
    [%w[注文番号 届け先 業者コード], *rows].map { |row| row.join(",") + "\\n" }.join
  end
end
`}
          />
          <p>
            DeliveryEstimate は、業者ごとの日数を Carrier#arrival_on に移したので削除し、呼び出し側は <code>order.shipping.arrival_on(shipped_on)</code> を使います。最後に、業者のコードを含むファイルを探して、Shipping 以外に残っていないことを確かめます。
          </p>
          <Code
            lang="text"
            title={`実行結果（grep -rlE '"(yamato|sagawa|yu_packet)"' app）`}
            code={`
app/models/shipping.rb
`}
          />
          <h3>公開した操作でテストする</h3>
          <p>
            Shipping のテストは、公開した quote と carrier だけを通して書きます。荷物の条件は、4つのメソッドに答えるだけの代役を Data.define で作って渡します。
          </p>
          <Code
            lang="ruby"
            title="spec/models/shipping_spec.rb（3社のとき）"
            code={`
require "rails_helper"

RSpec.describe Shipping do
  # 荷物の条件に答えるだけの代役
  let(:parcel_class) { Data.define(:weight_g, :thickness_mm, :cool, :prefecture) }

  def parcel(weight_g: 2000, thickness_mm: 100, cool: false, prefecture: "東京都")
    parcel_class.new(weight_g:, thickness_mm:, cool:, prefecture:)
  end

  # 公開された操作（quote と carrier）だけを通して確かめる
  {
    "要冷蔵" => [{ cool: true }, "ヤマト運輸（クール便）", 1100],
    "1kg 以下・厚さ 3cm 以下" => [{ weight_g: 800, thickness_mm: 25 }, "日本郵便（ゆうパケット）", 250],
    "それ以外" => [{}, "佐川急便", 800]
  }.each do |label, (attrs, name, fee)|
    it "#{label}なら#{name}（#{fee}円）" do
      expect(Shipping.quote(parcel(**attrs))).to have_attributes(name:, fee:)
    end
  end

  it "保存したコードから同じ業者を取り出せる" do
    quote = Shipping.quote(parcel(cool: true))
    expect(Shipping.carrier(quote.code)).to eq quote
  end

  it "追跡 URL とお届け予定日を返す" do
    carrier = Shipping.quote(parcel(weight_g: 800, thickness_mm: 25))
    expect(carrier.tracking_url("1234")).to eq "https://tracking.post.example/?req=1234"
    expect(carrier.arrival_on(Date.new(2026, 11, 21))).to eq Date.new(2026, 11, 24)
  end
end
`}
          />
          <p>
            Order のテストは、業者を選ぶ規則を繰り返して確かめるのをやめ、Shipping が選んだ業者を保存することと、作った後に業者を書き換えられないことだけを確かめます。規則のテストは Shipping のテストの1か所にまとまります。
          </p>
          <Code
            lang="ruby"
            title="spec/models/order_spec.rb（直した後）"
            code={`
require "rails_helper"

RSpec.describe Order do
  let(:order) { Order.create!(number: "A-1", prefecture: "東京都", weight_g: 2000, thickness_mm: 100, subtotal: 3000) }

  it "Shipping が選んだ業者を保存し、その送料を合計に含める" do
    expect(order.reload.shipping).to eq Shipping.quote(order)
    expect(order.total).to eq 3000 + order.shipping.fee
  end

  it "作った後は業者を書き換えられない" do
    expect { order.update!(carrier: "other") }.to raise_error(ActiveRecord::ReadonlyAttributeError)
  end
end
`}
          />
          <p>ここまで置き換えた時点で、RSpec の結果は 11 examples, 0 failures でした。3社については、直す前と同じ結果を返しています。</p>
          <h3>沖縄県あてのゆうパックを足す</h3>
          <p>業者の判断を Shipping に集めた後で、最初の場面と同じ変更（沖縄県あての通常の荷物をゆうパックにする）を加えます。変更の前と後のディレクトリを比べた結果です。</p>
          <Code
            lang="text"
            title="実行結果（diff -ru で、ゆうパックを足す前と後の app と spec を比べた）"
            code={`
Files stage2/app/models/shipping.rb and stage3/app/models/shipping.rb differ
Files stage2/spec/models/shipping_spec.rb and stage3/spec/models/shipping_spec.rb differ

--- stage2/app/models/shipping.rb
+++ stage3/app/models/shipping.rb
@@ -16,7 +16,9 @@
                 tracking_format: "https://tracking.sagawa.example/%{number}", note: nil),
     Carrier.new(code: "yu_packet", name: "日本郵便（ゆうパケット）", fee: 250, days: 3, warehouse_code: "JP-YPKT",
                 tracking_format: "https://tracking.post.example/?req=%{number}",
-                note: "郵便受けに届きます。受け取りのサインは不要です。")
+                note: "郵便受けに届きます。受け取りのサインは不要です。"),
+    Carrier.new(code: "yu_pack", name: "日本郵便（ゆうパック）", fee: 1300, days: 3, warehouse_code: "JP-YPCK",
+                tracking_format: "https://tracking.post.example/?req=%{number}", note: nil)
   ].index_by(&:code).freeze
   private_constant :CARRIERS

@@ -25,6 +27,7 @@
     code =
       if parcel.cool then "yamato"
       elsif parcel.weight_g <= 1000 && parcel.thickness_mm <= 30 then "yu_packet"
+      elsif parcel.prefecture == "沖縄県" then "yu_pack"
       else "sagawa"
       end
     CARRIERS.fetch(code)

--- stage2/spec/models/shipping_spec.rb
+++ stage3/spec/models/shipping_spec.rb
@@ -12,6 +12,7 @@
   {
     "要冷蔵" => [{ cool: true }, "ヤマト運輸（クール便）", 1100],
     "1kg 以下・厚さ 3cm 以下" => [{ weight_g: 800, thickness_mm: 25 }, "日本郵便（ゆうパケット）", 250],
+    "沖縄県あて" => [{ prefecture: "沖縄県" }, "日本郵便（ゆうパック）", 1300],
     "それ以外" => [{}, "佐川急便", 800]
   }.each do |label, (attrs, name, fee)|
     it "#{label}なら#{name}（#{fee}円）" do
`}
          />
          <p>直したのは shipping.rb と、そのテストだけです。テストと、最初の場面と同じスクリプトを実行しました（スクリプトは予定日の行だけを <code>order.shipping.arrival_on(Date.new(2026, 11, 21))</code> に替えています）。</p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/shipping_spec.rb --format documentation）"
            code={`
Shipping
  要冷蔵ならヤマト運輸（クール便）（1100円）
  1kg 以下・厚さ 3cm 以下なら日本郵便（ゆうパケット）（250円）
  沖縄県あてなら日本郵便（ゆうパック）（1300円）
  それ以外なら佐川急便（800円）
  保存したコードから同じ業者を取り出せる
  追跡 URL とお届け予定日を返す

Finished in 0.03796 seconds (files took 0.90595 seconds to load)
6 examples, 0 failures
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/okinawa.rb）"
            code={`
購入手続きの画面の送料：1300円
注文の業者：yu_pack / 送料：1300円 / 合計：4300円
画面の業者名："日本郵便（ゆうパック）"
お届け予定日：2026-11-24
--- 発送のお知らせ
ご注文 B-7 を発送しました。
配送業者：日本郵便（ゆうパック）
お荷物の確認：https://tracking.post.example/?req=5678

--- 出荷指示の CSV
注文番号,届け先,業者コード
B-7,沖縄県,JP-YPCK
`}
          />
          <p>
            購入手続きの送料・請求の金額・業者名・追跡 URL・予定日・倉庫のコードが、すべてゆうパックの値になりました。比較のために、直す前のコードでも同じ変更を正しく行いました。そのときに直したファイルは次の5つです。
          </p>
          <Code
            lang="text"
            title="実行結果（直す前のコードでゆうパックを正しく足したときの diff -rq）"
            code={`
Files stage1/app/helpers/orders_helper.rb and stage1c/app/helpers/orders_helper.rb differ
Files stage1/app/models/cart.rb and stage1c/app/models/cart.rb differ
Files stage1/app/models/delivery_estimate.rb and stage1c/app/models/delivery_estimate.rb differ
Files stage1/app/models/order.rb and stage1c/app/models/order.rb differ
Files stage1/app/models/shipment_csv.rb and stage1c/app/models/shipment_csv.rb differ
`}
          />
          <p>図 54-5 は、変わりうる判断ごとに、直すファイルを直す前と直した後で比べたものです。Parnas が論文で5つの変更について2つの分割を比べたのと同じ方法です。</p>
          <Figure n="54-5" title="変わりうる判断ごとに直すファイル（直す前と後）" caption="「業者を足す・やめる」の行は、実際に直したファイル（diff -rq の結果）。ほかの行は、コードを読んで数えた。">
            <MatrixFigure />
          </Figure>
          <p>
            図 54-5 の1行目では、業者を足すときに直すファイルが5つから1つになっています。2行目と3行目の規則と送料は、2か所から1か所になり、画面と請求の食い違いが起きなくなりました。4行目より下は、直す前も1ファイルでしたが、どのファイルを直せばよいかを探す必要がなくなりました。業者に関する変更は、どれも shipping.rb を開けば済みます。
          </p>
          <h3>テストも隠した判断に触れない</h3>
          <p>
            隠した判断に、テストが直接触れていることがあります。次のテストは、業者を足す前に書かれたもので、Shipping の中の業者の表を取り出して確かめています。<code>const_get</code> は、private_constant にした定数でも取り出せます。
          </p>
          <Code
            lang="ruby"
            title="spec_demo/shipping_peek_spec.rb"
            code={`
require "rails_helper"

# 隠した業者の一覧に、テストが直接触れている例（業者を足す前に書いたもの）
RSpec.describe Shipping do
  it "契約している業者は3社" do
    expect(Shipping.const_get(:CARRIERS).keys).to eq %w[yamato sagawa yu_packet]
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（ゆうパックを足した後に bundle exec rspec spec_demo/shipping_peek_spec.rb）"
            code={`
  1) Shipping 契約している業者は3社
     Failure/Error: expect(Shipping.const_get(:CARRIERS).keys).to eq %w[yamato sagawa yu_packet]

       expected: ["yamato", "sagawa", "yu_packet"]
            got: ["yamato", "sagawa", "yu_packet", "yu_pack"]

1 example, 1 failure
`}
          />
          <p>
            業者の表という隠した判断が変わったので、このテストは失敗しました。アプリの振る舞いは正しいのに、テストを直す必要があります。テストも呼び出し側の1つとして、公開した操作だけを使います。前の shipping_spec.rb は quote と carrier だけを使っているので、業者を足しても既存の例は直さずに済み、例を1行足すだけでした。テストのためだけに内部を公開しないという考え方は、<ChapterLink n={93} section="encapsulation-testing" />でカプセル化とテストのしやすさのトレードオフとして扱います。
          </p>
          <h3>直す順序</h3>
          <ol>
            <li>変わりうる設計の判断を書き出す。業者のコード、規則、送料など、変更の依頼が来そうなものを並べる</li>
            <li>一緒に変わる判断をまとめて1つのモジュールに割り当て、外に公開する操作を決める。利用者に見せる仕様は、操作が返す値にする</li>
            <li>今の動きのままで新しいモジュールを作り、公開した操作のテストを書く</li>
            <li>呼び出し側を1つずつ置き換え、置き換えるたびにテストを実行する</li>
            <li>古い表と分岐を消し、grep で業者のコードがモジュールの外に残っていないことを確かめる</li>
            <li>そのうえで、業者を足すなどの本来の変更をモジュールの中だけで行う</li>
          </ol>
          <p>
            業者のコードは orders テーブルに保存されているので、契約をやめた業者も CARRIERS から消さないようにします。過去の注文の carrier 列がそのコードを持っているので、表から消すと <code>Shipping.carrier</code> が KeyError になります。新しい注文で選ばれなくするには、quote の規則から外します。この扱いも、Shipping の中だけで決められます。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '隠しすぎたとき・分けすぎたとき',
      body: (
        <>
          <p>
            情報隠蔽を進めすぎると、かえって変更の手間が増えたり、必要な情報を取り出すために隠した中身を無理に取り出すコードが増えたりします。ここでは、Shipping と同じ結果を返すように書いた ShippingGateway を例に、2つの当てはめすぎを動かして確かめます。
          </p>
          <h3>一緒に変わる判断を細かく分ける</h3>
          <p>
            「1つのモジュールは1つの判断を隠す」という基準を細かく当てはめ、送料・日数・業者名・追跡 URL・倉庫のコード・選ぶ規則を、それぞれ別のモジュールに分けた例です。
          </p>
          <Code
            lang="ruby"
            title="app/models/shipping_gateway.rb"
            code={`
# 当てはめすぎた例：業者に関する判断を細かいモジュールに分け、どの業者かも外に出さない
module ShippingGateway
  Quote = Struct.new(:carrier, :fee, :days) do
    private :carrier # どの業者かは内部の事情として隠す
    def arrival_on(shipped_on) = shipped_on + days
  end

  def self.quote(parcel)
    code = Rules.select(parcel)
    Quote.new(code, FeeTable.fee_for(code), DeliveryDays.days_for(code))
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/shipping_gateway/rules.rb と fee_table.rb（ほかの4つも同じ形）"
            code={`
module ShippingGateway
  module Rules
    Cool = ->(p) { "yamato" if p.cool }
    SmallParcel = ->(p) { "yu_packet" if p.weight_g <= 1000 && p.thickness_mm <= 30 }
    Okinawa = ->(p) { "yu_pack" if p.prefecture == "沖縄県" }
    Default = ->(_p) { "sagawa" }
    ORDER = [Cool, SmallParcel, Okinawa, Default].freeze

    def self.select(parcel) = ORDER.lazy.filter_map { |rule| rule.call(parcel) }.first
  end
end

module ShippingGateway
  module FeeTable
    FEES = { "yamato" => 1100, "sagawa" => 800, "yu_packet" => 250, "yu_pack" => 1300 }.freeze
    def self.fee_for(code) = FEES.fetch(code)
  end
end
`}
          />
          <p>
            DeliveryDays・CarrierNames・TrackingUrlBuilder・WarehouseCodeMapper も、業者のコードをキーにしたハッシュを1つずつ持ちます。4つの荷物の条件で Shipping と同じ送料を返すことは、RSpec で確かめました（4 examples, 0 failures）。ゆうパックを足したときに直したファイルと、ファイルごとの行数です。
          </p>
          <Code
            lang="text"
            title={`実行結果（grep -rl '"yu_pack"' app/models/shipping_gateway と wc -l）`}
            code={`
app/models/shipping_gateway/carrier_names.rb
app/models/shipping_gateway/delivery_days.rb
app/models/shipping_gateway/fee_table.rb
app/models/shipping_gateway/rules.rb
app/models/shipping_gateway/tracking_url_builder.rb
app/models/shipping_gateway/warehouse_code_mapper.rb

  12 app/models/shipping_gateway.rb
   7 app/models/shipping_gateway/carrier_names.rb
   6 app/models/shipping_gateway/fee_table.rb
  11 app/models/shipping_gateway/rules.rb
   6 app/models/shipping_gateway/delivery_days.rb
   9 app/models/shipping_gateway/tracking_url_builder.rb
   6 app/models/shipping_gateway/warehouse_code_mapper.rb
  57 total
`}
          />
          <Figure n="54-6" title="分けすぎた ShippingGateway" caption="赤い丸は、ゆうパックを足すときに直したファイル。">
            <OverSplitFigure />
          </Figure>
          <p>
            図 54-6 のとおり、ゆうパックを足すために6つのファイルを直しました。直す前のコードの5ファイルと同じ程度です。表の形は整いましたが、「どの業者と契約しているか」という1つの判断が、6つの表のキーに分かれて書かれています。送料だけを変える変更なら FeeTable だけで済みますが、この EC サイトで多い変更は業者の追加と入れ替えで、そのたびに6つの表を同じように直します。
          </p>
          <p>
            Parnas の「1つの判断」は、データの種類ごとの判断ではなく、変わるときに一緒に変わる判断のまとまりとして読むと、この問題を避けられます。送料の表と日数の表は種類が違いますが、業者を足すときにはどちらも変わるので、同じモジュールに置きます。
          </p>
          <h3>仕様まで隠す</h3>
          <p>
            ShippingGateway は、Quote の carrier を private にして、どの業者で送るかを外に出していません。そこに、問い合わせの画面で送料と業者名を表示したいという依頼が来ました。
          </p>
          <Code
            lang="ruby"
            title="script/gateway.rb"
            code={`
# 問い合わせの画面で、送料と業者名を表示したい
parcel = Cart.new(prefecture: "沖縄県", weight_g: 2000, thickness_mm: 100)
quote = ShippingGateway.quote(parcel)
puts "送料：#{quote.fee}円"
begin
  puts "業者：#{quote.carrier}"
rescue NoMethodError => e
  puts "#{e.class}: #{e.message}"
end
# 隠された値を取り出すために send を使い、別のモジュールの表を引く
puts "業者：#{ShippingGateway::CarrierNames.name_for(quote.send(:carrier))}"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/gateway.rb）"
            code={`
送料：1300円
NoMethodError: private method 'carrier' called for an instance of ShippingGateway::Quote
業者：日本郵便（ゆうパック）
`}
          />
          <p>
            業者名は利用者に伝える仕様で、隠す設計の判断ではありません。隠したために、呼び出し側は <code>send</code> で private のメソッドを呼び、業者のコードを取り出して別のモジュールの表を引いています。業者のコードという隠したかった判断が、かえって呼び出し側に出てきました。仕様として必要な値は、公開する操作が返すようにします。この章の Shipping では、Carrier の name がそれにあたります。
          </p>
          <h3>変わらない判断まで隠す</h3>
          <p>
            変わる見込みの低いものまでモジュールの裏に置くと、読む場所と書く場所が増えます。Rails のアプリでよく見かけるのは、Active Record のモデルを Repository のクラスで覆い、コントローラーやサービスから <code>where</code> や関連を使わせない設計です。DB を替える予定がないアプリでは、Repository に検索のメソッドを足し続けることになり、Active Record のスコープや <code>includes</code> も使いにくくなります。Repository が役に立つ条件は、<ChapterLink n={44} section="repository" />で扱いました。
          </p>
          <p>
            Rails Doctrine の「No one paradigm」は、Active Record が DB とのやり取りと業務のロジックを1つのクラスに混ぜていることを、Web アプリを作る実際的な方法として認めています<Ref n={2} />。Rails のアプリで情報隠蔽を当てはめる対象は、アプリが決めた業務の判断と、外部のサービスの事情です。Rails の機能は直接使います。
          </p>
          <h3>判断の目安</h3>
          <p>隠すかどうかは、その判断が変わる見込みと、その判断を知っている場所の数の2つで決めます。図 54-7 は、2つの軸で4つに分けたものです。</p>
          <Figure n="54-7" title="隠すかどうかの判断" caption="模式図。右上に入るものから優先して隠す。">
            <JudgeFigure />
          </Figure>
          <p>
            図 54-7 の右上は、変わる見込みが高く、多くの場所が知っている判断です。最初の場面の配送業者がこれにあたり、1つのモジュールに隠すと効果が大きくなります。右下は、変わる見込みは高いものの、まだ1か所でしか使っていない判断です。今の場所に置いてメソッドや定数として名前を付けておき、2か所目で使うときにモジュールにまとめます。左上の Rails の規約や Ruby の標準の API は、多くの場所で使いますが、アプリの都合では変わらないので、隠さずに直接使います。
          </p>
          <p>迷ったときは、次の順に確かめます。</p>
          <ol>
            <li>その判断は、アプリの外の事情（契約・取引先・外部のサービス）や業務の方針で変わるか</li>
            <li>その判断を知っているファイルは、いくつあるか（grep で数えられるか）</li>
            <li>その判断と一緒に変わる判断は何か。それらを同じモジュールに置けるか</li>
            <li>隠そうとしているものは、設計の判断か、利用者に見せる仕様か</li>
            <li>隠した後、呼び出し側が send や const_get で中身を取り出す必要がないか</li>
          </ol>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails が隠している判断と、Ruby の道具',
      body: (
        <>
          <h3>Rails の標準機能が隠している判断</h3>
          <p>
            Rails の標準機能にも、変わりやすい判断を設定の1か所に集め、アプリのコードから隠しているものがあります。図 54-8 は、その主なものです。
          </p>
          <Figure n="54-8" title="Rails の標準機能が隠している判断" caption="切り替える場所は Rails 8.1 の設定。呼び出し側のコードは、切り替えても変わらない。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">機能</th>
                    <th scope="col">隠している判断</th>
                    <th scope="col">切り替える場所</th>
                    <th scope="col">呼び出し側のコード</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Active Record の接続アダプター</th>
                    <td>DB の種類と、SQL の方言（識別子の囲み方など）</td>
                    <td>config/database.yml</td>
                    <td><code>Order.where(prefecture: "沖縄県")</code></td>
                  </tr>
                  <tr>
                    <th scope="row">Active Job</th>
                    <td>ジョブを入れるキューの実装（Solid Queue・Sidekiq など）</td>
                    <td><code>config.active_job.queue_adapter</code></td>
                    <td><code>SomeJob.perform_later(order)</code></td>
                  </tr>
                  <tr>
                    <th scope="row">Action Mailer</th>
                    <td>メールの送り方（SMTP・sendmail・テスト用の配列）</td>
                    <td><code>config.action_mailer.delivery_method</code></td>
                    <td><code>ShippingMailer.shipped(order).deliver_later</code></td>
                  </tr>
                  <tr>
                    <th scope="row">Active Storage</th>
                    <td>ファイルの置き場所（ディスク・S3 など）</td>
                    <td>config/storage.yml と <code>config.active_storage.service</code></td>
                    <td><code>has_one_attached :invoice</code></td>
                  </tr>
                  <tr>
                    <th scope="row">キャッシュ</th>
                    <td>キャッシュの保存先（メモリー・Redis・Solid Cache など）</td>
                    <td><code>config.cache_store</code></td>
                    <td><code>Rails.cache.fetch(key) {'{ … }'}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            Rails Guides の Active Job の説明は、キューの実装を Sidekiq などに替えるのに必要なのは、通常はジョブのコードを変えない設定の変更だと述べています<Ref n={7} />。メールの送り方、ファイルの置き場所、キャッシュの保存先も、それぞれ設定で選びます<Ref n={8} /><Ref n={9} /><Ref n={10} />。この章のアプリで、DB の接続とジョブのキューを開発環境とテスト環境で表示しました。
          </p>
          <Code
            lang="ruby"
            title="script/rails_hiding.rb"
            code={`
puts "接続アダプター：#{ActiveRecord::Base.connection.adapter_name}"
puts Order.where(prefecture: "沖縄県").limit(1).to_sql
puts "ジョブのキュー：#{ActiveJob::Base.queue_adapter_name}"
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development と test で bin/rails runner script/rails_hiding.rb）"
            code={`
== development
接続アダプター：Mysql2
SELECT \`orders\`.* FROM \`orders\` WHERE \`orders\`.\`prefecture\` = '沖縄県' LIMIT 1
ジョブのキュー：sidekiq
== test
接続アダプター：Mysql2
SELECT \`orders\`.* FROM \`orders\` WHERE \`orders\`.\`prefecture\` = '沖縄県' LIMIT 1
ジョブのキュー：test
`}
          />
          <p>
            MySQL のアダプターは、テーブル名と列名をバッククォートで囲んだ SQL を作ります。モデルのコードは <code>where</code> を呼ぶだけで、囲み方を知りません。ジョブのキューは、開発環境では Sidekiq、テスト環境では Rails のテスト用のアダプターです。ジョブを入れるコードは、どちらの環境でも同じです。
          </p>
          <p>
            これらは、Parnas の論文の「変わりやすい判断を1つのモジュールに隠す」を、フレームワークの側で行ったものです。アプリの側でも、外部の配送業者・決済代行・倉庫のシステムのように、アプリの外の事情で変わる判断は、Shipping のようなモジュールに同じ形で集められます。外部の API との通信を含む場合は、<ChapterLink n={42} section="rails-impl" />（Adapter）の書き方が使えます。
          </p>
          <h3>Ruby で隠す道具と、その限界</h3>
          <ul>
            <li><code>private</code>：メソッドを、レシーバーを付けて外から呼べないようにします。ShippingGateway の Quote の carrier がこれです。</li>
            <li><code>private_constant</code>：定数を、モジュールの外から <code>Shipping::CARRIERS</code> の形で参照できないようにします<Ref n={3} />。</li>
            <li>モジュールと名前空間：関係するクラスを Shipping の名前空間にまとめられます。この章では Carrier を shipping.rb の中に書きましたが、別のファイルに分けるなら app/models/shipping/carrier.rb に置きます。Zeitwerk は Shipping::Carrier をこのパスから読み込みます。</li>
          </ul>
          <p>ただし、Ruby ではどれも外から越えられます。private_constant にした定数を参照したときと、const_get で取り出したときの結果です。</p>
          <Code
            lang="ruby"
            title="script/private_constant.rb"
            code={`
begin
  Shipping::CARRIERS
rescue NameError => e
  puts "#{e.class}: #{e.message}"
end
puts Shipping.const_get(:CARRIERS).keys.inspect # const_get は private_constant を通り抜ける
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/private_constant.rb）"
            code={`
NameError: private constant Shipping::CARRIERS referenced
["yamato", "sagawa", "yu_packet", "yu_pack"]
`}
          />
          <p>
            <code>Shipping::CARRIERS</code> は NameError になりますが、<code>const_get</code> では取り出せます。private のメソッドも <code>send</code> で呼べることは、前の節で確かめました。Rails Doctrine の「Provide sharp knives」は、Ruby が言語の仕組みで開発者を制限せず、規約と後押しと教育でよい使い方を広げると述べています<Ref n={2} />。Ruby の private と private_constant は、意図を示して誤った使い方を見つけやすくする道具で、隠した判断を守るのは、公開する操作の設計と、コードレビューで send や const_get の使用を確かめることです。
          </p>
          <h3>Rails Doctrine と情報隠蔽</h3>
          <p>
            Rails Doctrine の「Value integrated systems」は、1つのシステムとしてまとめることで、不要な抽象化を省けると述べています<Ref n={2} />。前の節の「No one paradigm」と合わせると、Rails は、DB やビューとのやり取りを隠すための層をアプリに求めていません。この章で隠したのは、配送業者という、アプリの外の事情で変わる業務の判断です。Rails が提供するものは直接使い、アプリが決めた判断のうち変わりやすいものを隠す、という分け方が Rails の設計と合います。
          </p>
          <Callout kind="v72">
            <ul>
              <li>
                <code>attr_readonly</code> の属性を保存の後に書き換えようとして例外になるのは、<code>config.active_record.raise_on_assign_to_attr_readonly</code> が true のときです<Ref n={5} />。この設定は <code>load_defaults 7.1</code> 以上で true になります<Ref n={6} />。Rails 7.2 でも同じですが、load_defaults を 7.0 以下のまま上げてきたアプリでは例外にならず、値はメモリー上で変わり、保存の時に無視されます。
              </li>
              <li>
                <code>Data.define</code> は Ruby 3.2 からの機能です。Rails 7.2 は Ruby 3.1 以上で動くので<Ref n={11} />、Ruby 3.1 のアプリでは Struct に <code>keyword_init: true</code> を付けて freeze するか、attr_reader だけを持つ小さなクラスで書きます。
              </li>
            </ul>
          </Callout>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={71} />（Encapsulation）：状態の書き換えを制限する原則。この章の「意味と由来」の節で違いを比べました。
            </li>
            <li>
              <ChapterLink n={74} />（Law of Demeter）：関連をたどる長い呼び出しは、たどった先のクラスの構造という判断を呼び出し側に漏らします。情報隠蔽を、オブジェクトの呼び出し方の側から見た原則です。
            </li>
            <li>
              <ChapterLink n={77} />（Tell, Don't Ask）：呼び出し側が業者のコードを聞いて分岐する代わりに、Carrier に追跡 URL や予定日を計算させるのは、この原則の形でもあります。
            </li>
            <li>
              <ChapterLink n={33} section="adapters" />：外部のサービスとの境界に Adapter を置く Rails での書き方を扱いました。
            </li>
            <li>
              <ChapterLink n={30} section="model-boundaries" />：モデルの境界をどこに引くかを扱いました。
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
          <li>情報隠蔽は、変更される可能性のある設計の判断を1つのモジュールに隠し、外にはその判断に左右されない操作だけを見せる原則です。判断が変わったときに直すのは、そのモジュールだけになります。</li>
          <li>Parnas は 1972年の論文で KWIC インデックスの2つの分割を比べ、処理の手順（フローチャート）で分けるのではなく、変わりそうな判断の一覧から始めて、各モジュールに1つずつ判断を隠すことを提案しました。</li>
          <li>処理の手順ごとにクラスを分け、業者のコードを手順の間で受け渡したコードでは、業者を1社足すと5つのファイルを直し、直し漏れは nil・空の文字列・KeyError・誤った日付として現れました。</li>
          <li>カプセル化は状態を誰がどう変えてよいかを制限し、情報隠蔽はどの判断を誰が知っていてよいかを決めます。attr_readonly で状態を守った Order でも、業者のコードを返すことで判断は外に漏れていました。</li>
          <li>変わりうる判断を書き出し、一緒に変わるものを Shipping に集め、quote と carrier だけを公開したことで、業者を足す変更は shipping.rb とそのテストの中で済みました。テストも公開した操作だけを使います。</li>
          <li>一緒に変わる判断をデータの種類ごとに細かく分けると、直すファイルの数は元に戻ります。利用者に見せる仕様まで隠すと、呼び出し側が send で中身を取り出すようになります。</li>
          <li>Active Record・Active Job・Action Mailer などは、変わりやすい判断を設定の1か所に集めています。Rails のアプリで隠す対象は、アプリの業務と外部のサービスに関する判断です。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'On the Criteria To Be Used in Decomposing Systems into Modules', publisher: 'David L. Parnas / Communications of the ACM 15(12)（Eindhoven 工科大学の講義資料に置かれた複製）', url: 'https://www.win.tue.nl/~wstomv/edu/2ip30/references/criteria_for_modularization.pdf', accessed: '2026-11-21', version: '1972年12月号 1053〜1058ページ', note: 'モジュール化に期待される3つの利点、モジュールを仕事の割り当てとすること、KWIC インデックスの2つの分割、5つの変更の比較、分割2の各モジュールが設計の判断を隠すこと、変わりそうな判断の一覧から始めるという結論、隠すとよいものの例、information hiding の参照先（1971年の技術報告）。' },
    { title: 'The Rails Doctrine', publisher: 'Ruby on Rails / DHH', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: 'No one paradigm（Active Record が DB とのやり取りと業務のロジックを混ぜること）、Provide sharp knives（規約・後押し・教育でよい使い方を広げること）、Value integrated systems（不要な抽象化を省くこと）。' },
    { title: 'Module#private_constant', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Module.html#method-i-private_constant', accessed: '2026-11-21', note: '既存の定数を private にすること。const_get で取り出せることは Ruby 4.0.9 で実行して確かめた。' },
    { title: 'class Data', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Data.html', accessed: '2026-11-21', note: 'Data.define で作るクラスが書き込み用のメソッドを持たず、変更しない値を入れるためのものであること。' },
    { title: 'activerecord/lib/active_record/readonly_attributes.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/readonly_attributes.rb#L30-L64`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'attr_readonly が、raise_on_assign_to_attr_readonly が true のときに、保存済みのレコードへの代入で ReadonlyAttributeError を投げること。false なら値はメモリー上で変わり保存されないこと。' },
    { title: 'railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/configuration.rb#L269-L284`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'load_defaults 7.1 で active_record.raise_on_assign_to_attr_readonly を true にすること。' },
    { title: 'Active Job Basics（Alternate Queuing Backends）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_job_basics.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'キューの実装を替えるのに必要なのは通常は設定の変更で、ジョブのコードは変えないこと。' },
    { title: 'Action Mailer Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/action_mailer_basics.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'config.action_mailer.delivery_method でメールの送り方（smtp・sendmail など）を選ぶこと。' },
    { title: 'Active Storage Overview', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_storage_overview.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'config.active_storage.service と config/storage.yml でファイルの置き場所を選ぶこと。' },
    { title: 'Caching with Rails: An Overview', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/caching_with_rails.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'config.cache_store でキャッシュの保存先を選ぶこと。' },
    { title: 'Ruby on Rails 7.2 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/7_2_release_notes.html', accessed: '2026-11-21', version: 'Rails 7.2', note: 'Rails 7.2 で Ruby 3.1 が最低のバージョンになったこと。' },
    { title: 'GetterEradicator', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/GetterEradicator.html', accessed: '2026-11-21', version: '2006年2月22日', note: 'カプセル化の要点はデータを隠すことではなく、変わるかもしれない設計の判断を隠すことだという説明（用語の重なりの例）。' },
  ],
}

export default chapter
