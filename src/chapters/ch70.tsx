import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 68-1 会員の情報を使う3つのモジュール ---------- */
const sceneMods: { x: number; w: number; title: string; cls: string; reads: string[] }[] = [
  { x: 10, w: 250, title: '請求（請求チーム）', cls: 'Billing::MonthlyInvoicer', reads: ['where(status: 0)', 'where.not(plan_code: nil)', 'member.plan_code', 'member.send(:contact_email)'] },
  { x: 270, w: 240, title: 'メール（請求チーム）', cls: 'BillingMailer', reads: ['member.plan_code', 'member.billing_email', 'member.email', 'member.name'] },
  { x: 520, w: 250, title: '集計（分析チーム）', cls: 'Reports::PlanSummary', reads: ['SELECT plan_code … FROM members', 'WHERE status = 0', 'GROUP BY plan_code'] },
]

function SceneFigure() {
  return (
    <Svg
      id="68-1"
      w={780}
      h={420}
      label="会員のサービスのコードは、会員・請求・メール・集計のモジュールに分かれている。請求の Billing::MonthlyInvoicer は、Member に where(status: 0) と where.not(plan_code: nil) で問い合わせ、member.plan_code を読み、member.send(:contact_email) で会員の private メソッドを呼ぶ。メールの BillingMailer は、member の plan_code・billing_email・email・name を読む。集計の Reports::PlanSummary は、members テーブルを SQL で直接読み、plan_code と status を使う。メールと集計は config/initializers/plans.rb の共有の定数 PLAN_NAMES も使う。会員のモジュールには Member クラスと members テーブルがある"
    >
      {sceneMods.map((m) => (
        <g key={m.cls}>
          <Box x={m.x} y={10} w={m.w} h={160} fill="box2" />
          <T x={m.x + 12} y={28} fs={12} bold>
            {m.title}
          </T>
          <Box x={m.x + 10} y={42} w={m.w - 20} h={30} lines={m.cls} fs={11} mono />
          {m.reads.map((r, i) => (
            <T key={r} x={m.x + 14} y={90 + i * 19} fs={11} tone="danger" mono>
              {r}
            </T>
          ))}
        </g>
      ))}
      <Box x={430} y={196} w={230} h={42} lines={['PLAN_NAMES（共有の定数）', 'config/initializers/plans.rb']} fs={11} fill="bg" dashed subTone="muted" />
      <Arrow x1={470} y1={170} x2={500} y2={194} dashed />
      <Arrow x1={600} y1={170} x2={600} y2={194} dashed />

      <Box x={60} y={262} w={660} h={110} fill="box2" />
      <T x={72} y={280} fs={12} bold>
        会員（会員チーム）
      </T>
      <Box x={76} y={294} w={300} h={60} lines={['Member', 'enum・validates・private contact_email']} fs={11} mono subTone="muted" />
      <Box x={396} y={294} w={310} h={60} lines={['members テーブル', 'name・email・billing_email・plan_code・status']} fs={11} fill="box4" subTone="muted" />
      <Arrow x1={135} y1={170} x2={226} y2={292} />
      <Arrow x1={330} y1={170} x2={290} y2={292} dashed />
      <Arrow x1={745} y1={170} x2={680} y2={292} dashed accent />
      <T x={10} y={394} fs={11} tone="danger">
        赤い字：会員の内部（列の名前・private メソッド・テーブル）を、会員以外のモジュールが直接使っている箇所
      </T>
      <T x={10} y={412} fs={11} tone="muted">
        実線の矢印は呼び出し、破線の矢印は値や列の読み取り。太い破線は Member を通らずにテーブルを読む SQL
      </T>
    </Svg>
  )
}

/* ---------- 図 68-2 列の名前を変えたときに壊れる範囲 ---------- */
function RippleFigure() {
  const broken: [string, string, string][] = [
    ['請求', 'Billing::MonthlyInvoicer', "StatementInvalid: Unknown column 'members.plan_code'"],
    ['メール', 'BillingMailer', "NoMethodError: undefined method 'plan_code'"],
    ['集計', 'Reports::PlanSummary', "StatementInvalid: Unknown column 'plan_code'"],
  ]
  return (
    <Svg
      id="68-2"
      w={780}
      h={330}
      label="会員チームが members の plan_code 列を plan に名前を変え、member.rb の検証、動作確認用の会員を作るスクリプト、member_spec を直した。会員チームのテストは通る。しかし、請求の Billing::MonthlyInvoicer は Unknown column 'members.plan_code' の StatementInvalid、メールの BillingMailer は undefined method 'plan_code' の NoMethodError、集計の Reports::PlanSummary は Unknown column 'plan_code' の StatementInvalid で止まった。plan_code が残った行は app と spec の6ファイルに13行あり、RSpec は5件中3件が失敗した"
    >
      <Box x={10} y={20} w={270} h={200} fill="box5" />
      <T x={22} y={40} fs={12} bold>
        会員チームの変更
      </T>
      {['rename_column :members,', '  :plan_code, :plan', 'member.rb の validates を直す', '会員を作るスクリプトを直す', 'member_spec を直す'].map((t, i) => (
        <T key={t} x={22} y={66 + i * 22} fs={11} mono={i < 2}>
          {t}
        </T>
      ))}
      <T x={22} y={196} fs={11} tone="acc">
        会員チームのテストは通る
      </T>
      {broken.map(([mod, cls, err], i) => {
        const y = 20 + i * 70
        return (
          <g key={mod}>
            <Arrow x1={282} y1={120} x2={318} y2={y + 28} />
            <Box x={320} y={y} w={450} h={56} lines={[`${mod}：${cls}`, err]} fs={11} mono subTone="danger" accent />
          </g>
        )
      })}
      <T x={10} y={252} fs={12} tone="danger">
        plan_code が残った行：app に3ファイル6行、spec に3ファイル7行（どれも請求チームと分析チームのファイル）
      </T>
      <T x={10} y={276} fs={12} tone="danger">
        RSpec：5件中3件が失敗（ほかのチームの spec が plan_code: で会員を作っていた）
      </T>
      <T x={10} y={306} fs={11} tone="muted">
        エラーはどれも、月次の処理を実行して初めて出た。会員チームの変更とテストの範囲では見つからない
      </T>
    </Svg>
  )
}

/* ---------- 図 68-4 結合の段階（Myers 1975） ---------- */
const couplings: { name: string; en: string; def: string[]; ex: string[]; here: string; worst?: boolean; best?: boolean }[] = [
  { name: '内容結合', en: 'content', def: ['相手のモジュールの内部の要素を', '直接参照する・書き換える'], ex: ['member.send(:contact_email)', 'instance_variable_get・クラスを開いて上書き'], here: '請求', worst: true },
  { name: '共通結合', en: 'common', def: ['大域の共有のデータ構造を', '複数のモジュールが参照する'], ex: ['members テーブルを SQL で直接読む', 'グローバル変数・Current の属性'], here: '集計' },
  { name: '外部結合', en: 'external', def: ['外部で宣言された同じ1つの', '記号を参照する'], ex: ['config/initializers の PLAN_NAMES', 'ENV["TAX_RATE"] をあちこちで読む'], here: 'メール・集計' },
  { name: '制御結合', en: 'control', def: ['相手の動きを切り替える要素', '（フラグ・機能の番号）を渡す'], ex: ['format(member, for_invoice: true)', 'run(month, mode: :dry_run)'], here: '（無し）' },
  { name: 'スタンプ結合', en: 'stamp', def: ['大域でないデータ構造を', '引数で渡して参照する'], ex: ['Member のレコードを渡し、メールが', '4つの列を読む'], here: 'メール' },
  { name: 'データ結合', en: 'data', def: ['必要なデータ項目だけを', '引数で受け渡す'], ex: ['with(invoice:, addressee:, plan_name:)', '（直した後のメール）'], here: '直した後', best: true },
]

function CouplingLevelsFigure() {
  const top = 40
  const rowH = 52
  return (
    <Svg
      id="68-4"
      w={780}
      h={top + couplings.length * rowH + 50}
      label={`Myers が1975年の本で示した結合の6つの段階を、結合が強い順に並べた表。${couplings.map((c) => `${c.name}（${c.en}）：${c.def.join('')}。Rails の例は${c.ex.join('、')}。この章の場面では${c.here}`).join('。')}`}
    >
      <Box x={40} y={10} w={140} h={30} lines="段階" fs={12} fill="box5" bold rx={0} />
      <Box x={180} y={10} w={230} h={30} lines="定義（Myers 1975 の要約）" fs={12} fill="box5" bold rx={0} />
      <Box x={410} y={10} w={270} h={30} lines="Rails のコードの例" fs={12} fill="box5" bold rx={0} />
      <Box x={680} y={10} w={90} h={30} lines="場面" fs={12} fill="box5" bold rx={0} />
      {couplings.map((c, i) => {
        const y = top + i * rowH
        return (
          <g key={c.en}>
            <Box x={40} y={y} w={140} h={rowH} lines={[c.name, c.en]} fs={12} rx={0} bold subTone={c.worst ? 'danger' : 'muted'} accent={c.best} />
            <Box x={180} y={y} w={230} h={rowH} lines={c.def} fs={11} fill="bg" rx={0} align="start" />
            <Box x={410} y={y} w={270} h={rowH} lines={c.ex} fs={11} fill="bg" rx={0} align="start" />
            <Box x={680} y={y} w={90} h={rowH} lines={c.here} fs={11} fill="bg" rx={0} />
          </g>
        )
      })}
      <Arrow x1={20} y1={top + 6} x2={20} y2={top + couplings.length * rowH - 6} accent />
      <T x={20} y={top - 10} anchor="middle" fs={11} tone="muted">
        強い
      </T>
      <T x={20} y={top + couplings.length * rowH + 14} anchor="middle" fs={11} tone="muted">
        弱い
      </T>
      <T x={40} y={top + couplings.length * rowH + 38} fs={11} tone="muted">
        6つの名前は Myers の1975年の本による。1974年の論文は名前を付けず、接続の種類・やり取りする情報の種類・インターフェースの複雑さで比べた
      </T>
    </Svg>
  )
}

/* ---------- 図 68-3 共通の環境から生まれる経路の数 ---------- */
function CommonEnvFigure() {
  const mods: [string, number, number][] = [
    ['会員', 30, 60],
    ['請求', 270, 60],
    ['メール', 30, 190],
    ['集計', 270, 190],
  ]
  return (
    <Svg
      id="68-3"
      w={780}
      h={320}
      label="直す前は、会員・請求・メール・集計の4つのモジュールが、members の5つの列を列の名前で直接使っている。1974年の論文の式 N × M × (M − 1) に、共有する要素の数 N = 5、モジュールの数 M = 4 を当てはめると、変更や誤りが伝わる経路は 5 × 4 × 3 = 60。直した後は、列を名前で使うのは会員だけで、請求と集計は会員が公開した名前を使い、メールは会員を使わない。M = 1 なので経路は 0"
    >
      <T x={10} y={20} bold>
        直す前：4つのモジュールが列を直接使う
      </T>
      {mods.map(([name, x, y]) => (
        <line key={name} x1={x + 45} y1={y + 17} x2={210} y2={145} stroke="var(--fig-accent)" strokeWidth={1.5} />
      ))}
      {mods.map(([name, x, y]) => (
        <Box key={name} x={x} y={y} w={90} h={34} lines={name} fs={12} />
      ))}
      <Box x={150} y={120} w={120} h={50} lines={['members の列', 'N = 5']} fs={12} fill="box4" accent subTone="muted" />
      <T x={10} y={262} fs={12}>
        M = 4、N × M × (M − 1) = 5 × 4 × 3 = 60
      </T>
      <T x={10} y={284} fs={11} tone="muted">
        共有する列のどれか1つの変更が、どのモジュールの組にも伝わりうる
      </T>

      <line x1={400} y1={10} x2={400} y2={310} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={420} y={20} bold>
        直した後：列を使うのは会員だけ
      </T>
      <Box x={420} y={190} w={110} h={34} lines="会員" fs={12} accent />
      <Box x={560} y={190} w={120} h={34} lines="members の列" fs={12} fill="box4" />
      <line x1={530} y1={207} x2={560} y2={207} stroke="var(--fig-line)" strokeWidth={1.5} />
      <Box x={420} y={60} w={90} h={34} lines="請求" fs={12} />
      <Box x={540} y={60} w={90} h={34} lines="集計" fs={12} />
      <Box x={660} y={60} w={90} h={34} lines="メール" fs={12} />
      <Arrow x1={465} y1={94} x2={465} y2={188} />
      <Arrow x1={585} y1={94} x2={500} y2={188} />
      <T x={600} y={140} fs={11} tone="muted">
        公開した名前を呼ぶ
      </T>
      <T x={660} y={112} fs={11} tone="muted">
        会員を使わない
      </T>
      <T x={420} y={262} fs={12}>
        M = 1、5 × 1 × 0 = 0
      </T>
      <T x={420} y={284} fs={11} tone="muted">
        列を変えるときに直すのは会員のモジュールだけ
      </T>
    </Svg>
  )
}

/* ---------- 図 68-6 直す前と後：数えた依存のグラフ ---------- */
function GraphFigure() {
  return (
    <Svg
      id="68-6"
      w={780}
      h={360}
      label="Prism で数えた依存のグラフ。直す前：請求からメールへ定数1、請求から会員へ定数1・列3・private 1、メールから会員へ列4、メールから共有の定数へ定数1、集計から共有の定数へ定数1、集計から会員へ文字列6。会員の内部への参照は合計14。直した後：請求からメールへ定数1、請求から会員へ定数1・公開6、集計から会員へ定数1・公開1。メールから会員への依存は無くなり、会員の内部への参照は0"
    >
      <T x={10} y={20} bold>
        直す前
      </T>
      <Box x={20} y={40} w={100} h={34} lines="請求" fs={12} />
      <Box x={250} y={40} w={100} h={34} lines="メール" fs={12} />
      <Box x={240} y={150} w={120} h={34} lines="共有の定数" fs={12} dashed fill="bg" />
      <Box x={250} y={260} w={100} h={34} lines="集計" fs={12} />
      <Box x={20} y={260} w={100} h={34} lines="会員" fs={12} accent />
      <Arrow x1={120} y1={57} x2={248} y2={57} />
      <T x={184} y={48} anchor="middle" fs={11}>
        定数 1
      </T>
      <Arrow x1={70} y1={74} x2={70} y2={258} accent />
      <T x={78} y={140} fs={11} tone="danger">
        定数 1
      </T>
      <T x={78} y={158} fs={11} tone="danger">
        列 3
      </T>
      <T x={78} y={176} fs={11} tone="danger">
        private 1
      </T>
      <Arrow x1={260} y1={74} x2={118} y2={258} accent />
      <T x={224} y={124} fs={11} tone="danger">
        列 4
      </T>
      <Arrow x1={300} y1={74} x2={300} y2={148} dashed />
      <T x={308} y={112} fs={11}>
        定数 1
      </T>
      <Arrow x1={300} y1={258} x2={300} y2={186} dashed />
      <T x={308} y={224} fs={11}>
        定数 1
      </T>
      <Arrow x1={248} y1={277} x2={122} y2={277} accent />
      <T x={184} y={268} anchor="middle" fs={11} tone="danger">
        文字列 6
      </T>
      <T x={10} y={326} fs={12} tone="danger">
        会員の内部への参照 14（列 7・文字列 6・private 1）
      </T>

      <line x1={390} y1={10} x2={390} y2={350} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={410} y={20} bold>
        直した後
      </T>
      <Box x={420} y={40} w={100} h={34} lines="請求" fs={12} />
      <Box x={650} y={40} w={100} h={34} lines="メール" fs={12} />
      <Box x={650} y={260} w={100} h={34} lines="集計" fs={12} />
      <Box x={420} y={260} w={100} h={34} lines="会員" fs={12} accent />
      <Arrow x1={520} y1={57} x2={648} y2={57} />
      <T x={584} y={48} anchor="middle" fs={11}>
        定数 1
      </T>
      <Arrow x1={470} y1={74} x2={470} y2={258} />
      <T x={478} y={150} fs={11}>
        定数 1
      </T>
      <T x={478} y={168} fs={11} tone="acc">
        公開 6
      </T>
      <Arrow x1={648} y1={277} x2={522} y2={277} />
      <T x={584} y={268} anchor="middle" fs={11}>
        定数 1・公開 1
      </T>
      <T x={660} y={160} fs={11} tone="muted">
        メール → 会員
      </T>
      <T x={660} y={178} fs={11} tone="muted">
        の依存は無い
      </T>
      <T x={410} y={326} fs={12} tone="acc">
        会員の内部への参照 0・公開した名前の参照 7
      </T>
    </Svg>
  )
}

/* ---------- 図 68-5 会員が公開する名前と、隠す内部 ---------- */
function InterfaceFigure() {
  const pub = ['scope billable', 'self.billing_profiles', 'self.count_by_plan_name', '#billing_profile', 'BillingProfile（Data）', '  member_id・addressee・invoice_email', '  plan・plan_name']
  const hidden = ['members の列', '  name・email・billing_email', '  plan_code・status', 'status の数値（0・1・2）', 'private contact_email', 'PLAN_NAMES のキー（"basic" など）']
  return (
    <Svg
      id="68-5"
      w={780}
      h={360}
      label="会員のモジュールが公開する名前は、スコープ billable、クラスメソッド billing_profiles と count_by_plan_name、インスタンスメソッド billing_profile、Data で作った BillingProfile とその項目 member_id・addressee・invoice_email・plan・plan_name。隠す内部は、members の列 name・email・billing_email・plan_code・status、status の数値、private の contact_email、PLAN_NAMES のキー。請求は billing_profiles と BillingProfile の項目を、集計は count_by_plan_name を使う。列の名前を変えるときに直すのは、会員の枠の中だけ"
    >
      <Box x={10} y={10} w={150} h={36} lines="請求" fs={12} />
      <Box x={10} y={180} w={150} h={36} lines="集計" fs={12} />
      <Box x={10} y={100} w={150} h={36} lines="メール" fs={12} />
      <T x={20} y={156} fs={11} tone="muted">
        請求から値だけを受け取る
      </T>
      <Box x={200} y={10} w={570} h={300} fill="box2" accent />
      <Arrow x1={160} y1={28} x2={212} y2={60} />
      <Arrow x1={160} y1={198} x2={212} y2={110} />
      <T x={214} y={30} fs={12} bold>
        会員（member.rb）
      </T>
      <Box x={214} y={44} w={260} h={250} fill="box5" />
      <T x={226} y={62} fs={12} bold>
        公開する名前
      </T>
      {pub.map((p, i) => (
        <T key={p} x={226} y={88 + i * 28} fs={11} mono>
          {p}
        </T>
      ))}
      <Box x={490} y={44} w={266} h={250} fill="bg" dashed />
      <T x={502} y={62} fs={12} bold>
        隠す内部（ほかのモジュールは使わない）
      </T>
      {hidden.map((h, i) => (
        <T key={h} x={502} y={88 + i * 28} fs={11} mono={!h.startsWith('status') && !h.startsWith('members')}>
          {h}
        </T>
      ))}
      <T x={10} y={334} fs={11} tone="muted">
        列の名前を変えるときに直すのは、この枠の中（member.rb）と、会員チームのテスト用のヘルパーだけ
      </T>
    </Svg>
  )
}

/* ---------- 図 68-7 結合を下げる手間をかけるかの判断 ---------- */
function DecisionFigure() {
  const qx = [160, 465]
  const qy = [40, 196]
  const qw = 295
  const qh = 146
  const cells: { c: number; r: number; title: string; body: string[]; tone?: 'acc' }[] = [
    { c: 1, r: 0, title: '公開する名前を決め、内部を隠す', body: ['この章の Member。呼び出し側が多く、', '列や規則がよく変わる'], tone: 'acc' },
    { c: 0, r: 0, title: '同じモジュールにまとめる', body: ['使う側が1つなら、使う側に移す', '（高凝集の章）'] },
    { c: 1, r: 1, title: 'そのまま参照してよい', body: ['Rails・標準ライブラリ・安定した', '値オブジェクト（安定依存の原則）'] },
    { c: 0, r: 1, title: '直接使ってよい。仕組みを足さない', body: ['同じチームの小さなクラスの間', 'Active Record の属性をそのまま読む'] },
  ]
  return (
    <Svg
      id="68-7"
      w={780}
      h={420}
      label="横の軸は依存する側の数、縦の軸は相手の内部が変わる頻度。依存する側が多く、内部がよく変わるものは、公開する名前を決めて内部を隠す（この章の Member）。依存する側が少なく、内部がよく変わるものは、同じモジュールにまとめる。依存する側が多く、内部があまり変わらないもの（Rails、標準ライブラリ、安定した値オブジェクト）は、そのまま参照してよい。依存する側が少なく、内部があまり変わらないものは、仕組みを足さずに直接使ってよい。下の2つの区画に通知や中間の層を足すのはやりすぎ。どの区画でも、呼び出しをハッシュの通知に替えて依存を見えなくするのは避ける"
    >
      <T x={307} y={20} anchor="middle" fs={12} tone="muted">
        少ない
      </T>
      <T x={612} y={20} anchor="middle" fs={12} tone="muted">
        多い
      </T>
      <T x={460} y={364} anchor="middle" fs={12} bold>
        → 依存する側の数
      </T>
      <T x={10} y={113} fs={12} tone="muted">
        高い
      </T>
      <T x={10} y={269} fs={12} tone="muted">
        低い
      </T>
      <T x={10} y={180} fs={12} bold>
        相手の内部が
      </T>
      <T x={10} y={198} fs={12} bold>
        変わる頻度 ↑
      </T>
      {cells.map((cell) => (
        <g key={cell.title}>
          <Box x={qx[cell.c]} y={qy[cell.r]} w={qw} h={qh} fill={cell.tone === 'acc' ? 'box5' : 'bg'} accent={cell.tone === 'acc'} />
          <T x={qx[cell.c] + 14} y={qy[cell.r] + 26} fs={13} bold>
            {cell.title}
          </T>
          {cell.body.map((b, k) => (
            <T key={b} x={qx[cell.c] + 14} y={qy[cell.r] + 56 + k * 20} fs={11} tone="muted">
              {b}
            </T>
          ))}
        </g>
      ))}
      <T x={174} y={qy[1] + 120} fs={11} tone="danger">
        やりすぎ：通知や中間の層を足す
      </T>
      <T x={479} y={qy[1] + 120} fs={11} tone="danger">
        やりすぎ：Rails の機能を包み直す
      </T>
      <T x={10} y={392} fs={11} tone="danger">
        どの区画でも：呼び出しをハッシュの通知に替えると、依存は残ったまま数えられなくなる
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 70,
  part: 8,
  title: 'Low Coupling（疎結合）：請求のモジュールが会員の内部の列を直接読まない',
  summary:
    '請求・メール・集計のモジュールが会員の列と private メソッドとテーブルを直接使っていて、会員チームが列の名前を1つ変えると3つのモジュールが止まる例から始めます。Stevens・Myers・Constantine の結合の分類を一次資料で確かめ、モジュールの間の参照を Prism で数えて依存のグラフにし、会員が公開する名前だけを使うように直します。',
  goals: [
    'モジュールが相手の内部（列・private メソッド・テーブル）を直接使うと、相手の変更がどこまで伝わるかを、実行結果で説明できる',
    '1974年の論文が挙げた結合の要因と、Myers の6つの段階（内容・共通・外部・制御・スタンプ・データ）を、Rails のコードの例で説明できる',
    '共通の環境から生まれる経路の数を、論文の式 N × M × (M − 1) で見積もれる',
    'モジュールの間の参照を Prism で数え、直す前と後の依存のグラフを比べられる',
    '公開する名前を決め、呼び出し側を1つずつ置き換え、列の名前の変更を会員のモジュールの中だけで済ませられる',
    '依存を通知やハッシュに置き換えて見えなくする、使う側が1つの所に仕組みを足す、といった当てはめすぎを見分けられる',
  ],
  prerequisites: [30, 33, 69],
  sections: [
    {
      id: 'scene',
      title: '会員の列の名前を変えたら、請求・メール・集計が止まった',
      body: (
        <>
          <p>
            この章では会員制のサービスを例に Low Coupling（疎結合）を扱います。結合は、あるモジュールが別のモジュールにどれだけ強く依存しているかを表す言葉です。最初に、ほかのチームのモジュールの内部を直接使っているコードで、相手の小さな変更がどこまで伝わるかを、動くコードで確かめます。
          </p>
          <h3>そもそもモジュールの間で何をやり取りするのか</h3>
          <p>
            月額制の会員サービスを考えます。会員は「ベーシック」（月980円）か「プレミアム」（月1,980円）のプランを契約し、毎月1回、請求書のメールを受け取ります。Rails のアプリは1つですが、コードは担当するチームごとに次のまとまりに分かれていて、この章ではこのまとまりをモジュールと呼びます。
          </p>
          <ul>
            <li>会員（会員チーム）：会員の登録・プランの変更・退会を扱う。Member モデルと members テーブル</li>
            <li>請求（請求チーム）：毎月、有効な会員に請求書を作る。Billing::MonthlyInvoicer と Billing::Invoice</li>
            <li>メール（請求チーム）：請求書のメールを送る。BillingMailer</li>
            <li>集計（分析チーム）：管理画面に、プラン別の有効な会員の人数を出す。Reports::PlanSummary</li>
          </ul>
          <p>
            請求・メール・集計はどれも会員の情報（どのプランか、有効な会員か、請求書の送り先はどこか）を必要とします。モジュールの間の依存が無いことはありえません。問題になるのは、依存の数と、何に依存しているかです。
          </p>
          <h3>テーブルと会員のモデル</h3>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_members_and_invoices.rb"
            code={`
class CreateMembersAndInvoices < ActiveRecord::Migration[8.1]
  def change
    create_table :members do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :billing_email               # 請求書の送り先（空なら email に送る）
      t.string :plan_code                   # "basic" か "premium"。未契約なら NULL
      t.integer :status, null: false, default: 0 # 0: 有効、1: 休止、2: 退会
      t.timestamps
    end

    create_table :billing_invoices do |t|
      t.references :member, null: false
      t.string :month, null: false   # "2026-11"
      t.integer :amount, null: false # 請求額（円）
      t.string :send_to, null: false # 送り先のメールアドレス
      t.timestamps
    end
  end
end
`}
          />
          <p>
            会員チームの Member は状態を enum（整数の列に名前を付ける Rails の機能）で扱い、請求書の送り先を決める <code>contact_email</code> を private メソッドとして持っています。
          </p>
          <Code
            lang="ruby"
            title="app/models/member.rb（直す前）"
            code={`
# 会員（会員チームが管理する）
class Member < ApplicationRecord
  enum :status, { active: 0, suspended: 1, withdrawn: 2 }

  validates :name, :email, presence: true
  validates :plan_code, inclusion: { in: %w[basic premium] }, allow_nil: true

  private

  # 請求書の送り先（請求用のアドレスがなければ会員のアドレス）
  def contact_email
    billing_email.presence || email
  end
end
`}
          />
          <h3>請求・メール・集計のコード</h3>
          <p>
            請求チームの MonthlyInvoicer は、有効な会員を <code>status: 0</code> で探し、プランのコードで月額を決め、送り先は Member の private メソッドを <code>send</code> で呼んで取り出しています。<code>send</code> は private のメソッドも名前で呼べる Ruby のメソッドです。
          </p>
          <Code
            lang="ruby"
            title="app/services/billing/monthly_invoicer.rb（直す前）"
            code={`
module Billing
  PLAN_PRICES = { "basic" => 980, "premium" => 1980 }.freeze # プランごとの月額（円）

  # 月ごとに、有効な会員へ請求書を作ってメールを送る（請求チームが管理する）
  class MonthlyInvoicer
    def run(month)
      Member.where(status: 0).where.not(plan_code: nil).order(:id).map do |member|
        invoice = Invoice.create!(
          member_id: member.id,
          month:,
          amount: PLAN_PRICES.fetch(member.plan_code),
          send_to: member.send(:contact_email) # 会員の private メソッドを呼んでいる
        )
        BillingMailer.with(member:, invoice:).invoice_issued.deliver_now
        invoice
      end
    end
  end
end
`}
          />
          <p>メールは Member のレコードをまるごと受け取り、プランのコード・送り先・名前を自分で読み出しています。送り先の決め方も、Member の contact_email と同じ内容をメールの中にもう一度書いています。</p>
          <Code
            lang="ruby"
            title="app/mailers/billing_mailer.rb（直す前）"
            code={`
# 請求のメール（請求チームが管理する）
class BillingMailer < ApplicationMailer
  def invoice_issued
    member = params[:member]
    invoice = params[:invoice]
    plan_name = PLAN_NAMES.fetch(member.plan_code)
    mail(
      to: member.billing_email.presence || member.email,
      subject: "#{invoice.month} 分のご請求（#{plan_name}）",
      body: "#{member.name} 様\\n#{plan_name}プランの #{invoice.month} 分、#{invoice.amount.to_fs(:delimited)}円をご請求します。"
    )
  end
end
`}
          />
          <p>
            分析チームの集計は Member を通らずに members テーブルを SQL で直接読み、有効な会員を表す <code>status = 0</code> も SQL の中に数値で書いています。プランの表示名は、メールと集計のどちらも config/initializers に置いた共有の定数から読みます。
          </p>
          <Code
            lang="ruby"
            title="app/queries/reports/plan_summary.rb と config/initializers/plans.rb（直す前）"
            code={`
module Reports
  # 有効な会員のプラン別の人数（管理画面の集計。分析チームが管理する）
  class PlanSummary
    def call
      rows = ActiveRecord::Base.connection.select_rows(<<~SQL)
        SELECT plan_code, COUNT(*) FROM members
        WHERE status = 0 AND plan_code IS NOT NULL
        GROUP BY plan_code ORDER BY plan_code
      SQL
      rows.to_h { |code, count| [PLAN_NAMES.fetch(code), count] }
    end
  end
end

# config/initializers/plans.rb
# プランのコードと表示名（メールと集計で使う）
PLAN_NAMES = { "basic" => "ベーシック", "premium" => "プレミアム" }.freeze
`}
          />
          <p>
            図 68-1 はこの4つのモジュールと、会員の何を使っているかです。赤い字の箇所は、会員以外のモジュールが会員の内部（列の名前、private メソッド、テーブル）を直接使っている所です。
          </p>
          <Figure n="68-1" title="会員の情報を使う3つのモジュール" caption="模式図。各モジュールの中の赤い字は、そのモジュールのコードに実際に書かれている参照。">
            <SceneFigure />
          </Figure>
          <h3>月次の処理を動かす</h3>
          <p>動作確認用の会員を3人（プレミアムの佐藤、ベーシックで請求用のアドレスを持つ鈴木、退会した高橋）作り、請求・メール・集計を順に動かすスクリプトを実行しました。</p>
          <Code
            lang="ruby"
            title="script/monthly.rb（直す前）"
            code={`
ActionMailer::Base.delivery_method = :test

def show(label)
  puts "#{label}: #{yield}"
rescue => e
  puts "#{label}: #{e.class}: #{e.message.lines.first.strip}"
end

show("請求") { Billing::MonthlyInvoicer.new.run("2026-11").map { "#{it.send_to} #{it.amount}円" } }
show("メール") { ActionMailer::Base.deliveries.map(&:subject) }
show("メール（単独）") do
  member = Member.find_by!(name: "鈴木")
  BillingMailer.with(member:, invoice: Billing::Invoice.new(month: "2026-11", amount: 980)).invoice_issued.subject
end
show("集計") { Reports::PlanSummary.new.call }
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/monthly.rb）"
            code={`
請求: ["sato@example.com 1980円", "keiri@example.com 980円"]
メール: ["2026-11 分のご請求（プレミアム）", "2026-11 分のご請求（ベーシック）"]
メール（単独）: 2026-11 分のご請求（ベーシック）
集計: {"ベーシック" => 1, "プレミアム" => 1}
`}
          />
          <p>この時点ではどの処理も正しく動き、RSpec の5件もすべて通ります。</p>
          <h3>会員チームが列の名前を変える</h3>
          <p>
            会員チームはプランを Rails の enum で扱う準備として、members の <code>plan_code</code> 列の名前を <code>plan</code> に変えることにしました。会員チームは自分たちが管理するファイル（マイグレーション、member.rb の検証、動作確認用の会員を作るスクリプト、member_spec）を直し、自分たちのテストが通ることを確かめました。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000002_rename_plan_code_to_plan_on_members.rb と app/models/member.rb の差分"
            code={`
class RenamePlanCodeToPlanOnMembers < ActiveRecord::Migration[8.1]
  def change
    rename_column :members, :plan_code, :plan
  end
end

# app/models/member.rb
-  validates :plan_code, inclusion: { in: %w[basic premium] }, allow_nil: true
+  validates :plan, inclusion: { in: %w[basic premium] }, allow_nil: true
`}
          />
          <p>同じスクリプトで月次の処理を動かすと、3つとも止まりました。</p>
          <Code
            lang="text"
            title="実行結果（列の名前を変えた後。RAILS_ENV=development bin/rails runner script/monthly.rb）"
            code={`
請求: ActiveRecord::StatementInvalid: Mysql2::Error: Unknown column 'members.plan_code' in 'where clause'
メール: []
メール（単独）: NoMethodError: undefined method 'plan_code' for an instance of Member
集計: ActiveRecord::StatementInvalid: Mysql2::Error: Unknown column 'plan_code' in 'field list'
`}
          />
          <Code
            lang="text"
            title="実行結果（列の名前を変えた後。bundle exec rspec の抜粋）"
            code={`
  1) BillingMailer プラン名と金額を書いたメールを、請求用のアドレスに送る
     Failure/Error: member = Member.create!(name: "鈴木", email: "suzuki@example.com", billing_email: "keiri@example.com", plan_code: "basic")
     ActiveModel::UnknownAttributeError:
  2) Reports::PlanSummary 有効な会員をプラン別に数える
     Failure/Error: Member.create!(name: "佐藤", email: "sato@example.com", plan_code: "premium")
     ActiveModel::UnknownAttributeError:
  3) Billing::MonthlyInvoicer 有効な会員にプランの月額で請求書を作り、メールを送る
     Failure/Error: Member.create!(name: "佐藤", email: "sato@example.com", plan_code: "premium")
     ActiveModel::UnknownAttributeError:
5 examples, 3 failures
`}
          />
          <p>
            RSpec では3つの spec が、本体のコードに届く前の準備（会員を <code>plan_code:</code> で作る所）で失敗しています。ほかのチームのテストも会員の列の名前に依存していました。<code>grep -rn plan_code app spec</code> で数えると、plan_code が残っている行は app に3ファイル6行、spec に3ファイル7行で、どれも会員チーム以外のファイルです。図 68-2 は、列の名前の変更がどこまで伝わったかを表しています。
          </p>
          <Figure n="68-2" title="列の名前を変えたときに壊れる範囲" caption="エラーの文は実行結果から抜き出した。">
            <RippleFigure />
          </Figure>
          <h3>モジュールの間の参照を数える</h3>
          <p>
            どのモジュールが会員の何に依存しているかを数で知るために、Ruby のソースを構文木（ソースを文法の単位に分けて木の形にしたもの）に変える Prism を使ったスクリプトを書きました。Prism は Ruby 3.3 から標準の gem として入っている構文解析器です<Ref n={10} />。スクリプトはファイルの場所でモジュールを決め、次の5種類を数えます。
          </p>
          <ul>
            <li>定数：ほかのモジュールで定義された定数（Member、BillingMailer、PLAN_NAMES など）を参照した回数</li>
            <li>列：members の列の名前（name、email、billing_email、plan_code、status）を、メソッドの呼び出しかシンボルで使った回数</li>
            <li>文字列：members の列の名前とテーブル名が、文字列（SQL など）の中に出てきた回数</li>
            <li>private：<code>send</code> で Member の private メソッドを呼んだ回数</li>
            <li>公開：Member が公開したメソッド・スコープ・Data の項目を呼んだ回数（直した後で使う）</li>
          </ul>
          <Code
            lang="ruby"
            title="script/deps.rb（抜粋）"
            code={`
# ファイルの場所で、どのモジュールに属するかを決める
MODULES = {
  "会員" => %w[app/models/member.rb],
  "請求" => %w[app/models/billing app/services/billing],
  "メール" => %w[app/mailers/billing_mailer.rb],
  "集計" => %w[app/queries/reports],
  "共有の定数" => %w[config/initializers/plans.rb],
}.freeze
COLUMNS = Member.column_names - %w[id created_at updated_at] # members の列

class RefCounter < Prism::Visitor
  # …（省略：OWNERS は、各モジュールのファイルで class・module・定数を定義している所から作る）
  def visit_constant_read_node(node) = add(OWNERS[node.name.to_s], :定数)

  def visit_constant_path_node(node) = add(OWNERS[node.full_name.split("::").first], :定数)

  def visit_call_node(node)
    name = node.name.to_s
    add("会員", :列) if node.receiver && COLUMNS.include?(name)
    add("会員", :公開) if node.receiver && PUBLIC.include?(name)
    arg = node.arguments&.arguments&.first
    add("会員", :private) if name == "send" && arg.is_a?(Prism::SymbolNode) && PRIVATE.include?(arg.unescaped)
    super
  end

  def visit_symbol_node(node) = COLUMNS.include?(node.unescaped) ? add("会員", :列) : nil

  def visit_string_node(node)
    node.unescaped.scan(/\\w+/) { |w| add("会員", :文字列) if COLUMNS.include?(w) || w == "members" }
  end
  # …（省略）
end
`}
          />
          <Code
            lang="text"
            title="実行結果（直す前。bin/rails runner script/deps.rb）"
            code={`
members の列: name, email, billing_email, plan_code, status
メール → 会員: 列 4
メール → 共有の定数: 定数 1
請求 → メール: 定数 1
請求 → 会員: 定数 1 / 列 3 / private 1
集計 → 会員: 文字列 6
集計 → 共有の定数: 定数 1
`}
          />
          <p>
            会員の内部（列・文字列の中の列とテーブル・private メソッド）への参照は、合わせて14か所です。定数の参照だけを数えると、会員に依存しているのは請求の1か所（<code>Member</code>）だけに見えます。メールは Member という定数を一度も書いていませんが、列を4か所で読んでいます。集計は SQL の文字列の中だけで会員に依存しています。grep で <code>Member</code> を探す方法では、この2つの依存は見つかりません。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>会員チームが内部の列の名前を変えるだけで、ほかの3つのモジュールが止まります。会員チームのテストは通るので、変更した側では気づけません。</li>
            <li>請求は Member の private メソッドを <code>send</code> で呼んでいます。会員チームが private のメソッドを消したり名前を変えたりしても、ほかのモジュールに影響が無いと考えるのは自然ですが、このコードではその前提が成り立ちません。</li>
            <li>「有効な会員」の条件（<code>status = 0</code>）と送り先の決め方が、会員・請求・メール・集計に別々に書かれています。条件を変えるとき（たとえば休止中の会員にも請求する場合）、直す場所を探す必要があります。</li>
            <li>ほかのチームの spec も会員の列の名前で会員を作っているので、列の変更でテストも壊れます。</li>
          </ul>
          <p>次の節で、モジュールの間のつながりの強さを表す結合という考え方を説明します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '結合とは何か：Stevens・Myers・Constantine の分類',
      body: (
        <>
          <h3>Low Coupling の意味</h3>
          <p>
            <Term en="Low Coupling">疎結合</Term>は、モジュール間の依存を必要最小限にし、変更による影響範囲を小さくするという原則です。<Term en="coupling">結合</Term>（結合度）は、モジュールの間のつながりの強さです。1974年の論文「Structured Design」は結合を「あるモジュールから別のモジュールへの接続によって生じる、結び付きの強さの尺度」と定義し、結合が強いと、あるモジュールをそれだけで理解し、変え、直すことが難しくなると述べています<Ref n={1} />。
          </p>
          <p>
            Yourdon と Constantine の本は、結合をもっと実際の作業に近い形で言い換えています。あるモジュールを書く・直す・変えるときに、プログラマーが別のモジュールについて何かを考えに入れなければならない確率です<Ref n={2} />。場面の節で、会員チームが列の名前を変えたときに請求・メール・集計のコードを直す必要が出たのは、この確率が高かったということです。
          </p>
          <h3>1974年の論文が挙げた結合の要因</h3>
          <p>
            論文は、結合の強さは1つの数で表しにくいとしたうえで、3つの要因を挙げています<Ref n={1} />。論文の表 1 の内容を、この章の例と並べます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要因</th>
                  <th scope="col">結合が低い</th>
                  <th scope="col">結合が高い</th>
                  <th scope="col">この章の例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">インターフェースの複雑さ</th>
                  <td>単純で、見てわかる</td>
                  <td>複雑で、わかりにくい</td>
                  <td>集計の SQL は、会員の列と status の数値の意味を知らないと書けない</td>
                </tr>
                <tr>
                  <th scope="row">接続の種類</th>
                  <td>モジュールに、名前で接続する</td>
                  <td>モジュールの内部の要素に接続する</td>
                  <td>請求の <code>member.send(:contact_email)</code> は、Member の内部の要素への接続</td>
                </tr>
                <tr>
                  <th scope="row">やり取りする情報の種類</th>
                  <td>データ</td>
                  <td>制御、さらに混成（あるモジュールが別のモジュールのコードを書き換える）</td>
                  <td>この章の場面はデータのやり取りだけ。制御の例は図 68-4</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            論文は、名前でモジュール全体に接続する（中身を知らなくてよい）場合のほうが、ほかのモジュールの内部の要素を直接参照する場合より結合が低いと説明しています。内部を直接参照すると、誤りを直したり変更したりするときに、相手のモジュールの中身全体を考えに入れる必要が出るからです<Ref n={1} />。また、制御の要素（スイッチ、フラグ、合図）を渡すことは、相手の内部の処理に関わることであり、それを取り除いた構造が必ず存在する、とも述べています<Ref n={1} />。Yourdon と Constantine の本は、4つ目の要因として、接続が決まる時期（コードを書く時点か、実行する時点か）を加えています<Ref n={2} />。
          </p>
          <h3>共通の環境</h3>
          <p>
            論文は、2つ以上のモジュールが同じ記憶領域・データ領域・装置を使うとき、それらは共通の環境を共有しているとし、FORTRAN の COMMON 文で定義したデータやグローバル変数を例に挙げています<Ref n={1} />。共通の環境の最も重要な性質は、共有するすべてのモジュールを、機能上の関係があるかどうかに関係なく、互いに結び付けてしまうことです<Ref n={1} />。
          </p>
          <p>
            論文はこの影響を数にしています。M 個のモジュールが N 個の要素を持つ共通の環境を共有すると、変更や誤りが伝わる経路は N × M × (M − 1) 本になります。論文の例では、3つのモジュールが25個の変数を共有するだけで150本です<Ref n={1} />。Yourdon と Constantine の本は、共通の環境にデータベースの領域も含めています<Ref n={2} />。
          </p>
          <p>
            この式を場面に当てはめます。members の5つの列（name、email、billing_email、plan_code、status）を列の名前で直接使っているモジュールは、会員・請求・メール・集計の4つでした。N = 5、M = 4 とすると、経路は 5 × 4 × 3 = 60 本です。図 68-3 は直す前と直した後の経路を比べたものです。
          </p>
          <Figure n="68-3" title="共通の環境から生まれる経路の数" caption="式は1974年の論文による。N と M は、この章の Prism のスクリプトで数えた値から決めた。">
            <CommonEnvFigure />
          </Figure>
          <p>
            Yourdon と Constantine は、共通の環境による結合は悪いものだから必ず避けよ、という意味ではないとも書いています。それが最もよい方法になる場面もあり、少数の要素を少数のモジュールで共有するだけでも構造が大きく複雑になることを知ったうえで選ぶべきだ、という立場です<Ref n={2} />。
          </p>
          <h3>Myers の6つの段階</h3>
          <p>
            1974年の論文は要因を挙げましたが、結合の段階に名前は付けていません。いま広く使われている6つの名前は、Myers が1975年の本『Reliable Software Through Composite Design』で示したものです。Myers は結合を、弱い（よい）ものから順に、データ結合、スタンプ結合、制御結合、外部結合、共通結合、内容結合と並べています<Ref n={3} />。図 68-4 は6つの段階を強い順に並べ、Rails のコードの例と、この章の場面のどこに当たるかを加えたものです。
          </p>
          <Figure n="68-4" title="結合の段階" caption="定義は Myers 1975 の第4章を要約した。Rails の例はこの章で考えたもの。">
            <CouplingLevelsFigure />
          </Figure>
          <ul>
            <li>
              内容結合：Myers は、あるモジュールが別のモジュールの中身を直接参照するとき、と定義し、相手のコードの書き換え、外部に宣言していないデータの参照、相手の途中への分岐などを挙げています<Ref n={3} />。Ruby では <code>send</code> で private メソッドを呼ぶ、<code>instance_variable_get</code> で相手のインスタンス変数を読む、相手のクラスを開いてメソッドを上書きする、がこれに近い使い方です。
            </li>
            <li>共通結合：共有の大域のデータ構造（共通の環境）を参照する場合です<Ref n={3} />。集計が members テーブルを SQL で読むのは、テーブルを共通の環境として使っている例です。</li>
            <li>外部結合：外部に宣言された同じ1つの記号を参照する場合です。Myers は、共通結合が共通の環境の全体に依存するのに対して、外部結合は個々の要素に依存する点が違うと説明しています<Ref n={3} />。config/initializers の PLAN_NAMES を、メールと集計が参照しているのがこれです。</li>
            <li>制御結合：機能の番号・フラグ・スイッチのような制御の要素を引数で渡す場合です。呼ぶ側が呼ばれる側の内部の処理を知っていることになるので、呼ばれる側はもう中身を知らずに使える部品ではない、と Myers は書いています<Ref n={3} />。</li>
            <li>スタンプ結合：大域でないデータ構造を、引数で受け渡して参照する場合です<Ref n={3} />。メールが Member のレコードを受け取り、その中の4つの列を読んでいるのがこれです。</li>
            <li>データ結合：すべての入出力を引数で受け渡し、引数がどれも制御の要素でもデータ構造でもない、データの項目である場合です<Ref n={3} />。</li>
          </ul>
          <p>
            Yourdon と Constantine の本は、スタンプ結合の危険を示す例として、顧客のレコード全体を電話番号の検査のモジュールに渡したら、担当者がそのレコードの州の欄まで使い始め、後で州の欄の形式を変えるときに電話番号の検査まで調べる必要が出た、という話を載せています<Ref n={2} />。場面のメールが Member のレコードを受け取り、送り先の決め方まで自分で書いていたのは、この話と同じ形です。
          </p>
          <h3>凝集との関係</h3>
          <p>
            1974年の論文は、モジュールの間の関係を少なくする方法として、モジュールの間のつながりを減らすことと、同じモジュールの中の要素の関係を強めることの2つを挙げています<Ref n={1} />。<ChapterLink n={69} />で扱った凝集は後者で、この章の結合は前者です。場面のコードでは、「有効な会員の条件」と「送り先の決め方」という会員の知識が、会員以外のモジュールに散らばっていました。これは会員のモジュールの凝集が低いことでもあり、散らばった知識の数だけほかのモジュールとの結合が生まれています。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則</th>
                  <th scope="col">問いかけ</th>
                  <th scope="col">この章の例での違い</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <ChapterLink n={71}>Encapsulation</ChapterLink>
                  </th>
                  <td>内部の状態を外から直接書き換えさせていないか</td>
                  <td>カプセル化は1つのクラスの守り方。疎結合は、モジュールの間の依存の数と強さを見る</td>
                </tr>
                <tr>
                  <th scope="row">
                    <ChapterLink n={73}>Information Hiding</ChapterLink>
                  </th>
                  <td>変わりやすい判断を隠しているか</td>
                  <td>plan_code という列の名前と status の数値は、変わりうる設計判断。隠すと結合が下がる</td>
                </tr>
                <tr>
                  <th scope="row">
                    <ChapterLink n={74}>Law of Demeter</ChapterLink>
                  </th>
                  <td>相手の内部をたどっていないか</td>
                  <td>デメテルの法則は呼び出しの連鎖を数える。疎結合は、連鎖が無くても列を直接読むことを問題にする</td>
                </tr>
                <tr>
                  <th scope="row">
                    <ChapterLink n={67}>DIP</ChapterLink>
                  </th>
                  <td>上位の方針が下位の詳細に依存していないか</td>
                  <td>DIP は依存の向きを変える。疎結合は依存の数と種類を減らす。この章では向きは変えていない</td>
                </tr>
                <tr>
                  <th scope="row">
                    <ChapterLink n={75}>Stable Dependencies Principle</ChapterLink>
                  </th>
                  <td>変わりにくいものに依存しているか</td>
                  <td>依存を0にできないとき、どれに依存するかを選ぶ基準。会員が公開する名前は、列より変わりにくくする</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: '会員が公開する名前だけを使うように直す',
      body: (
        <>
          <h3>直す順序</h3>
          <p>3つのチームのコードにまたがる変更なので、どの時点でもアプリが動き、テストが通るように、次の順に進めます。</p>
          <ol>
            <li>ほかのモジュールが会員の何を使っているかを、Prism のスクリプトで数えて一覧にする（場面の節の実行結果）。</li>
            <li>一覧から、会員チームが公開する名前を決める。請求の対象の会員（billable）、請求に渡す会員の情報（BillingProfile と billing_profiles）、プラン別の人数（count_by_plan_name）の3つにまとめました。</li>
            <li>Member に公開する名前を足す。この時点では、ほかのモジュールは古い書き方のまま動きます。</li>
            <li>呼び出し側を、請求、メール、集計の順に1つずつ置き換え、置き換えるたびに RSpec を実行する。</li>
            <li>ほかのチームの spec が会員を作る方法を、会員チームのテスト用のヘルパーにまとめる。</li>
            <li>共有の定数 PLAN_NAMES を会員のモジュールに移し、config/initializers から消す。</li>
            <li>スクリプトで数え直し、会員の内部への参照が0になったことを確かめる。</li>
            <li>そのうえで、列の名前を変える。</li>
          </ol>
          <h3>会員が公開する名前</h3>
          <Code
            lang="ruby"
            title="app/models/member.rb（直した後。列の名前を変える前）"
            code={`
# 会員（会員チームが管理する）
class Member < ApplicationRecord
  # 請求に渡す会員の情報。ほかのチームに公開する形
  BillingProfile = Data.define(:member_id, :addressee, :invoice_email, :plan, :plan_name)
  PLAN_NAMES = { "basic" => "ベーシック", "premium" => "プレミアム" }.freeze

  enum :status, { active: 0, suspended: 1, withdrawn: 2 }

  validates :name, :email, presence: true
  validates :plan_code, inclusion: { in: PLAN_NAMES.keys }, allow_nil: true

  # 請求の対象の会員（有効で、プランを契約している）
  scope :billable, -> { active.where.not(plan_code: nil) }

  # 請求の対象の会員を、請求に渡す形で返す
  def self.billing_profiles = billable.order(:id).map(&:billing_profile)

  # 請求の対象の会員のプラン別の人数。キーはプランの表示名
  def self.count_by_plan_name = billable.group(:plan_code).order(:plan_code).count.transform_keys { PLAN_NAMES.fetch(it) }

  def billing_profile
    BillingProfile.new(member_id: id, addressee: name, invoice_email: contact_email, plan: plan_code.to_sym, plan_name: PLAN_NAMES.fetch(plan_code))
  end

  private

  # 請求書の送り先（請求用のアドレスがなければ会員のアドレス）
  def contact_email
    billing_email.presence || email
  end
end
`}
          />
          <p>
            BillingProfile は請求に必要な5つの項目だけを持つ値のクラスで、Ruby 3.2 で加わった <code>Data.define</code> で作りました<Ref n={11} />。列の名前（name、plan_code）とは別の名前（addressee、plan）を付け、plan は文字列のコードではなくシンボルにしています。列の名前や値の形が変わっても、BillingProfile の項目の名前と値の形は変えない、というのが会員チームの約束になります。「有効な会員」の条件は <code>billable</code> の1か所に、送り先の決め方は private の <code>contact_email</code> の1か所になりました。
          </p>
          <p>公開する名前を決めるときは、次の点を確かめました。</p>
          <ul>
            <li>使う側の目的の言葉で名前を付ける。「status が 0 で plan_code が NULL でない会員」ではなく、請求チームが使う言葉で <code>billable</code>（請求の対象）と呼びます。</li>
            <li>列の名前とは別の名前にする。列の名前をそのまま公開すると、列の名前を変えるときに公開した名前も変わります。</li>
            <li>値の形を決める。plan は <code>:basic</code> か <code>:premium</code> のシンボル、invoice_email は空でない文字列、と決めて、DB の NULL や空文字の扱いを会員の中で済ませます。</li>
            <li>項目を、使う側が今必要とするものに絞る。請求に必要な5つだけを持たせ、「いつか使うかもしれない」列は入れません。</li>
            <li>公開した名前を変えるときは、ほかのチームと手順を決める。公開した名前はほかのチームとの約束になるので、変えるときは古い名前をしばらく残す方法（<ChapterLink n={92} />）を使います。</li>
          </ul>
          <p>図 68-5 は、会員のモジュールが公開する名前と、隠す内部を分けたものです。</p>
          <Figure n="68-5" title="会員が公開する名前と、隠す内部" caption="公開する名前は、Prism のスクリプトが member.rb から集めた一覧と同じ。">
            <InterfaceFigure />
          </Figure>
          <h3>請求とメール</h3>
          <p>
            請求は請求の対象の会員を <code>profiles:</code> で受け取ります。既定値は <code>Member.billing_profiles</code> なので、呼び出し側は今までどおり <code>run(month)</code> と書け、テストでは BillingProfile を直接渡して、DB に会員を作らずに済ませられます。
          </p>
          <Code
            lang="ruby"
            title="app/services/billing/monthly_invoicer.rb（直した後）"
            code={`
module Billing
  PLAN_PRICES = { basic: 980, premium: 1980 }.freeze # プランごとの月額（円）

  # 月ごとに、請求の対象の会員へ請求書を作ってメールを送る（請求チームが管理する）
  class MonthlyInvoicer
    def run(month, profiles: Member.billing_profiles)
      profiles.map do |profile|
        invoice = Invoice.create!(member_id: profile.member_id, month:, amount: PLAN_PRICES.fetch(profile.plan), send_to: profile.invoice_email)
        BillingMailer.with(invoice:, addressee: profile.addressee, plan_name: profile.plan_name).invoice_issued.deliver_now
        invoice
      end
    end
  end
end
`}
          />
          <p>
            メールは Member のレコードを受け取るのをやめ、請求書と、宛名・プラン名の文字列だけを受け取るようにしました。Myers の段階でいうと、スタンプ結合からデータ結合への変更です。メールのモジュールは会員のモジュールを一度も参照しなくなりました。
          </p>
          <Code
            lang="ruby"
            title="app/mailers/billing_mailer.rb（直した後）"
            code={`
# 請求のメール（請求チームが管理する）
class BillingMailer < ApplicationMailer
  def invoice_issued
    invoice = params[:invoice]
    plan_name = params[:plan_name]
    mail(
      to: invoice.send_to,
      subject: "#{invoice.month} 分のご請求（#{plan_name}）",
      body: "#{params[:addressee]} 様\\n#{plan_name}プランの #{invoice.month} 分、#{invoice.amount.to_fs(:delimited)}円をご請求します。"
    )
  end
end
`}
          />
          <h3>集計</h3>
          <p>集計は SQL をやめ、会員が公開した <code>count_by_plan_name</code> を使います。SQL は Member の中で Active Record が組み立てるので、列の名前を知っているのは会員のモジュールだけになります。</p>
          <Code
            lang="ruby"
            title="app/queries/reports/plan_summary.rb（直した後）"
            code={`
module Reports
  # 有効な会員のプラン別の人数（管理画面の集計。分析チームが管理する）
  class PlanSummary
    def call = Member.count_by_plan_name
  end
end
`}
          />
          <p>
            集計の処理がほとんど会員のモジュールに移ったので、集計のクラスは呼び出しを1つ持つだけになりました。分析チームが人数以外の集計（プラン別の売上など）を足すときに、会員の列を直接読まずに済むよう、会員チームに公開する名前を相談する、という進め方になります。
          </p>
          <h3>テストで会員を作る方法</h3>
          <p>
            ほかのチームの spec が列の名前で会員を作っていたことも、結合の1つでした。会員を作るテスト用のメソッドを会員チームが用意し、ほかのチームの spec はそれを使います。請求の spec は会員を DB に作らず、BillingProfile を渡します。
          </p>
          <Code
            lang="ruby"
            title="spec/support/member_helpers.rb（列の名前を変える前）と spec/services/billing/monthly_invoicer_spec.rb（抜粋）"
            code={`
# 会員を作るテスト用のメソッド（会員チームが管理する。ほかのチームの spec はこれで会員を作る）
module MemberHelpers
  def create_member(name:, email:, plan: :basic, billing_email: nil, status: :active)
    Member.create!(name:, email:, billing_email:, plan_code: plan&.to_s, status:)
  end
end

RSpec.configure { it.include MemberHelpers }

# spec/services/billing/monthly_invoicer_spec.rb
let(:profiles) do
  [
    Member::BillingProfile.new(member_id: 1, addressee: "佐藤", invoice_email: "sato@example.com", plan: :premium, plan_name: "プレミアム"),
    Member::BillingProfile.new(member_id: 2, addressee: "鈴木", invoice_email: "keiri@example.com", plan: :basic, plan_name: "ベーシック"),
  ]
end

it "渡された会員に、プランの月額で請求書を作り、メールを送る" do
  invoices = described_class.new.run("2026-11", profiles:)
  expect(invoices.map { [it.amount, it.send_to] }).to eq [[1980, "sato@example.com"], [980, "keiri@example.com"]]
  expect(ActionMailer::Base.deliveries.map(&:to)).to eq [["sato@example.com"], ["keiri@example.com"]]
end
`}
          />
          <p>
            会員チームの member_spec には、公開した名前の動きを確かめる例を足しました。有効な会員・退会した会員・プランを契約していない会員を作り、<code>billing_profiles</code> が有効でプランのある会員だけを、決めた項目と値の形（plan はシンボル）で返すことを確かめます。列の名前を変えるときに会員チームがこの spec を実行すれば、公開した名前の約束を守れているかを、ほかのチームの spec の結果を待たずに確かめられます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/member_spec.rb（抜粋）"
            code={`
it "請求の対象の会員を、請求に渡す形で返す" do
  create_member(name: "佐藤", email: "sato@example.com", plan: :premium)
  create_member(name: "鈴木", email: "suzuki@example.com", billing_email: "keiri@example.com")
  create_member(name: "高橋", email: "takahashi@example.com", status: :withdrawn)
  create_member(name: "田中", email: "tanaka@example.com", plan: nil)
  expect(Member.billing_profiles.map { [it.addressee, it.invoice_email, it.plan, it.plan_name] }).to eq [
    ["佐藤", "sato@example.com", :premium, "プレミアム"],
    ["鈴木", "keiri@example.com", :basic, "ベーシック"],
  ]
end
`}
          />
          <h3>数え直す</h3>
          <p>直した後のコードで、場面の節と同じスクリプトを実行しました。月次の処理の結果は直す前と同じで、RSpec の6件もすべて通りました。</p>
          <Code
            lang="text"
            title="実行結果（直した後。bin/rails runner script/deps.rb）"
            code={`
members の列: name, email, billing_email, plan_code, status
会員が公開した名前: member_id, addressee, invoice_email, plan, plan_name, billable, billing_profiles, count_by_plan_name, billing_profile
請求 → メール: 定数 1
請求 → 会員: 定数 1 / 公開 6
集計 → 会員: 定数 1 / 公開 1
`}
          />
          <p>
            会員の内部への参照は14か所から0か所になりました。依存が無くなったわけではなく、請求は会員が公開した名前を6か所、集計は1か所で使っています。依存の数を0にするのではなく、依存する先を、会員チームが変えないと約束した名前に移したということです。共有の定数は会員のモジュールに移ったので、「共有の定数」のモジュールは無くなりました。図 68-6 は直す前と後の依存のグラフを比べたものです。
          </p>
          <Figure n="68-6" title="直す前と後：数えた依存のグラフ" caption="辺の数字は script/deps.rb の実行結果。太い辺は会員の内部への参照を含む。">
            <GraphFigure />
          </Figure>
          <h3>もう一度、列の名前を変える</h3>
          <p>直した後のコードで、場面の節と同じマイグレーションを実行し、会員チームのファイルだけを直しました。</p>
          <Code
            lang="text"
            title="app/models/member.rb の差分（このほかに spec/support/member_helpers.rb の1行と、会員を作るスクリプトを直した）"
            code={`
-  validates :plan_code, inclusion: { in: PLAN_NAMES.keys }, allow_nil: true
+  validates :plan, inclusion: { in: PLAN_NAMES.keys }, allow_nil: true

-  scope :billable, -> { active.where.not(plan_code: nil) }
+  scope :billable, -> { active.where.not(plan: nil) }

-  def self.count_by_plan_name = billable.group(:plan_code).order(:plan_code).count.transform_keys { PLAN_NAMES.fetch(it) }
+  def self.count_by_plan_name = billable.group(:plan).order(:plan).count.transform_keys { PLAN_NAMES.fetch(it) }

-    BillingProfile.new(member_id: id, addressee: name, invoice_email: contact_email, plan: plan_code.to_sym, plan_name: PLAN_NAMES.fetch(plan_code))
+    BillingProfile.new(member_id: id, addressee: name, invoice_email: contact_email, plan: plan.to_sym, plan_name: PLAN_NAMES.fetch(plan))
`}
          />
          <Code
            lang="text"
            title="実行結果（列の名前を変えた後。bin/rails db:migrate、bundle exec rspec、script/monthly.rb）"
            code={`
-- rename_column(:members, :plan_code, :plan)
== 20261121000002 RenamePlanCodeToPlanOnMembers: migrated (0.0442s) ===========
6 examples, 0 failures

請求: ["sato@example.com 1980円", "keiri@example.com 980円"]
メール: ["2026-11 分のご請求（プレミアム）", "2026-11 分のご請求（ベーシック）"]
集計: {"ベーシック" => 1, "プレミアム" => 1}
`}
          />
          <p>
            請求・メール・集計のファイルは1行も変えていません。<code>grep -rln plan_code app spec script config</code> は何も表示せず、plan_code という名前はアプリから消えました。
          </p>
          <Callout kind="note" title="名前で数える方法の限界">
            <p>
              列の名前を変えた後で script/deps.rb を実行すると、「請求 → 会員」に「列 1」が加わります。BillingProfile の項目 <code>plan</code> が、新しい列の名前 <code>plan</code> と同じ名前になったので、<code>profile.plan</code> を列の読み取りとして数えたからです。このスクリプトは呼び出しの相手の型を調べず、名前だけで判断します。本文の数（直した後の「公開 6」など）は、列の名前を変える前に数えたものです。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '依存を見えなくする・仕組みを足しすぎる',
      body: (
        <>
          <p>
            疎結合を目指して手を加えすぎると、依存は残ったまま見えなくなるか、依存を減らすための仕組みのほうが大きくなります。
          </p>
          <h3>呼び出しを、属性のハッシュの通知に置き換える</h3>
          <p>
            「請求が Member を直接呼ぶのは結合が強い」と考えて、会員の側はプランが変わったら属性をハッシュにして通知を流し、請求の側はその通知を受け取ってプランを自分の表に写す、という形にした例です。通知には Active Support の <code>ActiveSupport::Notifications</code>（名前を付けた通知を流し、登録した受け手に payload のハッシュを渡す仕組み）を使いました<Ref n={9} />。
          </p>
          <Code
            lang="ruby"
            title="app/overdone/billing_plan_listener.rb と script/overdone_events.rb（当てはめすぎた例）"
            code={`
# 当てはめすぎた例（請求の側）：Member を呼ばずに、通知で届いた属性のハッシュからプランを読む
class BillingPlanListener
  attr_reader :plans

  def initialize = @plans = {}

  def call(event)
    @plans[event.payload["id"]] = event.payload["plan_code"]
  end
end

# script/overdone_events.rb
listener = BillingPlanListener.new
ActiveSupport::Notifications.subscribe("member.plan_changed", listener)

# 会員の側：プランが変わったら、属性をそのまま流す
member = Member.find_by!(name: "佐藤")
ActiveSupport::Notifications.instrument("member.plan_changed", member.attributes)

puts "流した属性のキー: #{member.attributes.keys.join(", ")}"
puts "請求の側が受け取ったプラン: #{listener.plans.fetch(member.id).inspect}"
`}
          />
          <p>列の名前を変える前と後で、このスクリプトと、受け手のファイルだけを対象にした数え方のスクリプトを実行しました。</p>
          <Code
            lang="text"
            title="実行結果（列の名前を変える前）"
            code={`
流した属性のキー: id, name, email, billing_email, plan_code, status, created_at, updated_at
請求の側が受け取ったプラン: "premium"
members の列: name, email, billing_email, plan_code, status
指定したファイル → 会員: 文字列 1
`}
          />
          <Code
            lang="text"
            title="実行結果（列の名前を plan に変えた後）"
            code={`
流した属性のキー: id, name, email, billing_email, plan, status, created_at, updated_at
請求の側が受け取ったプラン: nil
members の列: name, email, billing_email, plan, status
依存は見つかりませんでした
`}
          />
          <p>
            列の名前を変えた後、請求の側が受け取ったプランは <code>nil</code> になりました。例外は出ていないので、月次の処理を実行するまで、どこもおかしいと知らせません。数え方のスクリプトは「依存は見つかりませんでした」と表示しますが、受け手は今も <code>"plan_code"</code> というキー、つまり古い列の名前に依存しています。
          </p>
          <p>
            1974年の論文は、見てわかる関係のほうが、わかりにくい関係や推測で成り立つ関係より結合が低いと書いています<Ref n={1} />。この例はメソッドの呼び出しという見てわかる接続を、ハッシュのキーという見えにくい接続に置き換えました。数えられる依存は減りましたが、結合は下がっていません。しかも、属性のハッシュは members のすべての列を含むので、受け手はテーブル全体に依存できる状態になっています。
          </p>
          <h3>すべての列を写すだけの中間の層を作る</h3>
          <p>
            Member の列を1対1で写した MemberDTO と、Member から MemberDTO を作る MemberMapper を用意し、ほかのモジュールには MemberDTO だけを渡す、という形もよく見かけます。MemberDTO が members と同じ列を同じ意味で持つなら、列の名前を変えるときは MemberDTO と MemberMapper とそれを使う側を直すことになり、直すファイルが増えるだけです。結合を下げるのは、中間の層があることではなく、渡す項目を使う側に必要なものに絞り、列とは別の、変えないと約束した名前を付けることです。この章の BillingProfile が5つの項目しか持たないのはそのためです。
          </p>
          <h3>チームごとにアプリを分ける</h3>
          <p>
            結合を下げる方法として、会員・請求・集計を別々のアプリ（サービス）に分け、HTTP の API でつなぐ方法もあります。ただし、API の項目名を変えるときには、この章の列の名前と同じ問題が起き、ネットワークの障害や API のバージョンの管理も加わります。Rails Doctrine の「Value integrated systems」の項は、どうしても必要になるまでシステムを分散させないことを勧めています<Ref n={7} />。この章のように、1つのアプリの中で公開する名前を決めれば、分けなくても会員の変更が請求に伝わらない構造にできます。
          </p>
          <h3>判断の目安</h3>
          <p>
            疎結合のための手間（公開する名前を決める、値のクラスを作る、呼び出し側を置き換える）は、どの依存にもかける必要はありません。この章では依存する側の数と、相手の内部が変わる頻度の2つで判断します。図 68-7 は2つの組み合わせと、それぞれの扱い方です。
          </p>
          <Figure n="68-7" title="結合を下げる手間をかけるかの判断" caption="2つの軸はこの章で定めた目安。">
            <DecisionFigure />
          </Figure>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">兆候</th>
                  <th scope="col">起きていること</th>
                  <th scope="col">直し方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ほかのチームのコードに、こちらの列の名前・status の数値・テーブル名が出てくる</td>
                  <td>内部への依存（共通結合・スタンプ結合）</td>
                  <td>使われ方を数え、公開する名前を決めて置き換える</td>
                </tr>
                <tr>
                  <td><code>send(:private_method)</code> や <code>instance_variable_get</code> がほかのモジュールにある</td>
                  <td>内容結合</td>
                  <td>必要なら公開のメソッドにし、そうでなければ呼び出しをやめる</td>
                </tr>
                <tr>
                  <td>依存を減らしたはずなのに、名前の変更がエラーにならずに値が nil になる</td>
                  <td>依存がハッシュのキーや文字列に隠れた</td>
                  <td>メソッドの呼び出しか、項目の決まった値のクラス（Data）に戻す</td>
                </tr>
                <tr>
                  <td>相手の列を1対1で写しただけのクラスと、その変換のクラスがある</td>
                  <td>仕組みが増えただけで、依存の中身は同じ</td>
                  <td>使う側が必要な項目だけに絞る。絞れないなら中間の層を外す</td>
                </tr>
                <tr>
                  <td>同じチームの小さなクラスの間にまで、通知やインターフェースのクラスがある</td>
                  <td>依存する側が少なく、変更も一緒に行う所に仕組みを足した</td>
                  <td>直接呼ぶ形に戻す</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能・規約と結合',
      body: (
        <>
          <h3>Active Record は、すべての列を公開する</h3>
          <p>
            Rails Guides は、モデルのテーブルの各列がモデルのクラスの属性に対応づけられると説明しています<Ref n={4} />。列を足すと、その列を読み書きするメソッドが public で使えるようになります。何もしなければ、テーブルのすべての列がほかのモジュールに公開されている状態です。場面のメールが Member の4つの列を自由に読めたのは、このためです。
          </p>
          <p>
            Rails のこの既定の動きは、1つのチームが小さなアプリを作るときには手間を省きます。モジュールを複数のチームで分けて持つようになったら、ほかのチームに使ってほしい名前をスコープ・クラスメソッド・値のクラスで用意し、列はそのモジュールの中だけで使う、という取り決めを足します。Ruby は public メソッドの呼び出しを制限しないので、この取り決めを守れているかは、この章のような数え方のスクリプトやコードレビューで確かめることになります。
          </p>
          <h3>列の名前を変えるときの道具</h3>
          <p>
            この章ではほかのモジュールの依存を先に無くしてから列の名前を変えました。呼び出し側をすぐに直せない場合には、Rails の次の機能で移行の期間を作れます。
          </p>
          <ul>
            <li>
              <code>alias_attribute</code>：属性に別名を付けます。別名は条件の指定（<code>where</code>）にも使えます<Ref n={5} />。列の名前を変えた後も <code>alias_attribute :plan_code, :plan</code> と書いておけば、古い名前の呼び出しを動かしたまま、呼び出し側を順に直せます。
            </li>
            <li>
              <code>ignored_columns</code>：指定した列の属性のメソッドを作らず、SQL でも参照しないようにします。ソースのコメントは、列を削除するマイグレーションの前に、まず列を無視する設定をデプロイし、参照が残っていないことを確かめる手順を勧めています<Ref n={6} />。
            </li>
          </ul>
          <p>
            デプロイの途中で古いコードと新しいコードが同時に動く間の列の変更は、<ChapterLink n={27} section="live-change" />と<ChapterLink n={92} />（Backward Compatibility）で扱います。
          </p>
          <h3>名前空間と、境界を確かめる道具</h3>
          <p>
            Rails のオートロードは app の下のディレクトリを名前空間に対応させます。app/services/billing/monthly_invoicer.rb は Billing::MonthlyInvoicer を定義する、という規約です。名前空間を見ればモジュールの境界はわかりますが、ほかの名前空間の定数を参照することは禁じられていません。
          </p>
          <p>
            Shopify が公開している gem の Packwerk は、Ruby の定数の集まりの間に境界を設け、境界をまたぐ参照と依存を減らすためのツールです<Ref n={8} />。考え方はこの章のスクリプトの「定数」の数え方と同じで、定数の参照を手がかりにします。場面のメールのように、定数を書かずに列を読む依存や、集計のように SQL の文字列の中にある依存は、定数の参照からは見つかりません。どの道具を使うときも、何を数えていて、何を数えていないかを知っておく必要があります。
          </p>
          <h3>通知とジョブを使う場面</h3>
          <p>
            ActiveSupport::Notifications や Active Job で処理をつなぐと、呼ぶ側は受け手を知らずに済みます。受け手が多く、増えたり減ったりする場合（ログ、計測、外部への連携）や、受け手の失敗を呼ぶ側に伝えたくない場合には向いています。一方、overuse の節で見たように、payload をハッシュにすると、キーの名前への依存が見えなくなります。通知やジョブで渡すものも、項目の決まった値のクラスにし、受け手は公開された項目だけを読むようにします。非同期の処理の作り方は<ChapterLink n={18} section="job-basics" />を参照してください。
          </p>
          <Callout kind="v72">
            <p>
              この章のコードは、ブロックの引数を表す <code>it</code>（Ruby 3.4 で追加）<Ref n={12} />と、<code>Data.define</code>（Ruby 3.2 で追加）<Ref n={11} />を使っています。Rails 7.2 を Ruby 3.3 以前で動かしている場合は、<code>it</code> を <code>{'{ |x| ... }'}</code> のような名前付きの引数に書き換えてください。<code>alias_attribute</code>・<code>ignored_columns</code>・<code>enum</code> のキーワード引数の書き方は Rails 7.2 でも同じように使えます。
            </p>
          </Callout>
          <h3>本書のほかの章</h3>
          <ul>
            <li>モデルの境界をどこに引くかは<ChapterLink n={30} section="model-boundaries" />、Query Object の使いどころは<ChapterLink n={33} section="query-objects" />で扱っています。</li>
            <li>1つのクラスの状態を守る方法は<ChapterLink n={71} />（Encapsulation）、変わりやすい判断を隠す方法は<ChapterLink n={73} />（Information Hiding）で扱います。</li>
            <li>関連をたどる長い呼び出しの問題は<ChapterLink n={74} />（Law of Demeter）、依存の向きと安定度は<ChapterLink n={67} />（DIP）と<ChapterLink n={75} />（Stable Dependencies Principle）で扱います。</li>
            <li>関連する処理を1か所にまとめる考え方は、前の<ChapterLink n={69} />（High Cohesion）で扱いました。</li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          疎結合は依存をなくすことではなく、依存する先を、相手のチームが変えないと約束した名前に移すことです。この章では、請求・メール・集計が会員の列や private メソッドを直接読むのをやめ、会員が公開する名前だけを使うようにしました。依存する側が少ない所や、相手の内部が安定している所には、そのための仕組みを足しません。
        </>
      ),
      benefit: {
        text: <>直す前は、会員の列の名前を1つ変えただけで請求・メール・集計が止まり、ほかのチームの spec が3件失敗した。会員の内部への参照は14か所から0か所になり、同じ列の名前の変更は会員のファイルだけで済んで、請求・メール・集計のファイルは1行も変えなかった。</>,
        basis: <><ChapterLink n={70} section="scene" />、<ChapterLink n={70} section="apply" /></>,
      },
      cost: {
        text: <>会員チームが公開する名前（billable、BillingProfile、count_by_plan_name）を決め、使う側が必要とする値に変換して返す必要がある。公開した名前は会員チームが変えないと約束するので、変えるときはほかのチームと時期を合わせる。</>,
        basis: <ChapterLink n={70} section="apply" />,
      },
      alternative: {
        text: <>同じアプリの中なら、会員のモデルの公開メソッドで必要な値を返す形で足りる。呼び出しを属性のハッシュの通知に置き換えた例では、数えられる依存は0になったが、列の名前を変えると請求の側のプランが例外を出さずに nil になった。列を1対1で写すだけの中間の層も、依存の中身は変わらない。</>,
        basis: <ChapterLink n={70} section="overuse" />,
      },
      criterion: {
        text: <>依存する側の数と、相手の内部が変わる頻度を比べる。ほかのチームのコードに列の名前・status の数値・send(:private_method) が出てくるなら直す。同じチームの小さなクラスの間なら、直接呼ぶ形のままにする。</>,
        basis: <ChapterLink n={70} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <>
          <ul>
            <li>Low Coupling は、モジュール間の依存を必要最小限にし、変更による影響範囲を小さくする原則です。結合は、モジュールの間のつながりの強さです。</li>
            <li>1974年の論文は、結合の要因として、インターフェースの複雑さ、接続の種類（名前か内部か）、やり取りする情報の種類（データ・制御・混成）を挙げました。共通の環境は、N 個の要素を M 個のモジュールで共有すると N × M × (M − 1) 本の経路を生みます。</li>
            <li>Myers は1975年の本で、結合をデータ・スタンプ・制御・外部・共通・内容の6段階に名前を付けて並べました。Ruby の send による private メソッドの呼び出しは内容結合、テーブルを SQL で直接読むのは共通結合に近い使い方です。</li>
            <li>場面では会員の列の名前を1つ変えただけで、請求・メール・集計の3つが止まり、ほかのチームの spec も3件失敗しました。会員チームのテストは通っていました。</li>
            <li>Prism でモジュールの間の参照を数えると、会員の内部への参照は14か所ありました。会員が公開する名前（billable、BillingProfile、count_by_plan_name）に置き換えると0か所になり、列の名前の変更は会員のファイルだけで済みました。</li>
            <li>依存をハッシュの通知に置き換えると、数えられる依存は0になっても、名前の変更が nil として知らせずに伝わります。疎結合は依存を見えなくすることではなく、依存する先を変わりにくい名前に移すことです。</li>
            <li>依存する側が多く、相手の内部がよく変わる所に手間をかけ、依存する側が少ない所や相手が安定している所には仕組みを足しません。</li>
          </ul>
        </>
      ),
    },
  ],
  sources: [
    {
      title: 'Structured design',
      publisher: 'W. P. Stevens, G. J. Myers, L. L. Constantine / IBM Systems Journal（IEEE Xplore）',
      url: 'https://doi.org/10.1147/sj.132.0115',
      accessed: '2026-11-21',
      version: 'Vol. 13, No. 2, 1974, pp. 115–139（本文は 1999年の再録 Vol. 38, Nos. 2&3, pp. 231–256 で確認）',
      note: '結合の定義、結合の3つの要因（表 1）、内部の要素への接続のほうが結合が高い理由、制御の要素を渡すことの扱い、共通の環境の定義と N × M × (M − 1) の式と150本の例、見てわかる関係のほうが結合が低いこと、結合を下げる2つの方法。',
    },
    {
      title: 'Structured Design: Fundamentals of a Discipline of Computer Program and Systems Design',
      publisher: 'Edward Yourdon, Larry L. Constantine / Yourdon Press（Internet Archive の書誌）',
      url: 'https://archive.org/details/structureddesign00edwa',
      accessed: '2026-11-21',
      version: '1978年（ISBN 0-917072-11-1）。第6章 Coupling',
      note: '結合を「別のモジュールについて考えに入れなければならない確率」とする言い換え、4つ目の要因（接続が決まる時期）、共通の環境にデータベースの領域を含めること、共通の環境による結合を必ず避けるべきとはしない立場、顧客のレコード全体を渡した電話番号の検査の例。',
    },
    {
      title: 'Reliable Software Through Composite Design',
      publisher: 'Glenford J. Myers / Petrocelli/Charter（Internet Archive の書誌）',
      url: 'https://archive.org/details/reliablesoftware00myer',
      accessed: '2026-11-21',
      version: '1975年。第4章 Module Coupling',
      note: '結合の6つの段階の名前と並び（データ・スタンプ・制御・外部・共通・内容）と、それぞれの定義。外部結合と共通結合の違い、制御結合で呼ばれる側が中身を知らずに使える部品でなくなること。',
    },
    {
      title: 'Active Record Basics',
      publisher: 'Rails Guides',
      url: 'https://guides.rubyonrails.org/v8.1/active_record_basics.html',
      accessed: '2026-11-21',
      version: 'Rails 8.1',
      note: 'テーブルの各列がモデルのクラスの属性に対応づけられること。',
    },
    {
      title: 'activerecord/lib/active_record/attribute_methods.rb（alias_attribute）',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/attribute_methods.rb#L52-L66`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.4.1',
      note: 'alias_attribute で属性に別名を付け、別名を where の条件にも使えること。',
    },
    {
      title: 'activerecord/lib/active_record/model_schema.rb（ignored_columns）',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/model_schema.rb#L344-L379`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.4.1',
      note: 'ignored_columns に指定した列は属性のメソッドを作らず SQL でも参照しないこと、列を削除する前に無視する設定をデプロイする手順。',
    },
    {
      title: 'The Rails Doctrine',
      publisher: 'rubyonrails.org / David Heinemeier Hansson',
      url: 'https://rubyonrails.org/doctrine',
      accessed: '2026-11-21',
      note: '「Value integrated systems」の項で、どうしても必要になるまでシステムを分散させないことを勧めていること。',
    },
    {
      title: 'packwerk',
      publisher: 'RubyGems.org',
      url: 'https://rubygems.org/gems/packwerk',
      accessed: '2026-11-21',
      version: '3.3.1',
      note: 'Ruby の定数の集まりの間に境界を設け、境界をまたぐ参照と依存を減らすための gem であるという説明。',
    },
    {
      title: 'Active Support Instrumentation',
      publisher: 'Rails Guides',
      url: 'https://guides.rubyonrails.org/v8.1/active_support_instrumentation.html',
      accessed: '2026-11-21',
      version: 'Rails 8.1',
      note: 'ActiveSupport::Notifications の instrument と subscribe、受け手に payload が渡ること。受け手に call(event) を持つオブジェクトを渡せることは Rails 8.1.4.1 で実行して確認した。',
    },
    {
      title: 'module Prism',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/Prism.html',
      accessed: '2026-11-21',
      note: 'Prism が Ruby の構文解析器であり、parse_file でファイルを構文木にできること。Ruby 3.3 で標準の gem になったことは Ruby 3.3 の NEWS（https://docs.ruby-lang.org/en/3.3/NEWS_md.html）で確認した。この章のスクリプトは prism 2.1.0 で実行した。',
    },
    {
      title: 'class Data',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/Data.html',
      accessed: '2026-11-21',
      note: 'Data.define で値のようなオブジェクトのクラスを作れること。Ruby 3.2 で加わったことは Ruby 3.2 の NEWS で確認した。',
    },
    {
      title: 'NEWS for Ruby 3.4.0',
      publisher: 'Ruby 3.4 Documentation',
      url: 'https://docs.ruby-lang.org/en/3.4/NEWS_md.html',
      accessed: '2026-11-21',
      note: 'ブロックの引数を参照する it が Ruby 3.4 で加わったこと。',
    },
  ],
}

export default chapter
