import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 50-1 予約の期間を扱うクラスと、それぞれの境界の扱い ---------- */
const sceneCols: { screen: string; cls: string; method: string; rule: [string, string]; bad?: boolean }[] = [
  { screen: 'キャンペーンの告知', cls: 'Campaign', method: '#days', rule: ['差 + 1', '（両端の日を含む）'] },
  { screen: '予約の一覧・メール', cls: 'ReservationsHelper', method: '#stay_label', rule: ['差 + 1', '（3泊と表示）'], bad: true },
  { screen: '空室カレンダー', cls: 'ReservationsHelper', method: '#booked_on?', rule: ['<= と <=', '（両端の日を含む）'], bad: true },
  { screen: '空室検索', cls: 'AvailabilitySearch', method: '#rooms', rule: ['< と >', '（出る日を含まない）'] },
  { screen: '予約の保存', cls: 'Reservation', method: '#not_overlapping', rule: ['<= と >=', '（両端の日を含む）'], bad: true },
  { screen: '請求書', cls: 'InvoiceBuilder', method: '#nights', rule: ['差', '（出る日を含まない）'] },
]

function SceneFigure() {
  return (
    <Svg
      id="50-1"
      w={780}
      h={318}
      label="宿の予約システムで、宿泊の期間を扱う処理が6か所にある。キャンペーンの告知の Campaign#days は日付の差に1を足して両端の日を含める。予約の一覧と確認メールの ReservationsHelper#stay_label も DateUtils.days_between で差に1を足すため、2泊を3泊と表示する。空室カレンダーの ReservationsHelper#booked_on? は両端の日を含めて比べる。空室検索の AvailabilitySearch は出る日を含めずに比べる。予約の保存の Reservation の検証は両端の日を含めて比べる。請求書の InvoiceBuilder は日付の差を泊数にする。Campaign と stay_label は DateUtils.days_between を呼び、残りの4つは reservations テーブルの check_in と check_out を読む。期間の規則は6行・4ファイルに、3通りの解釈で書かれている"
    >
      {sceneCols.map((c, i) => {
        const x = 10 + i * 128
        return (
          <g key={c.method}>
            <Box x={x} y={10} w={120} h={34} lines={c.screen} fs={11} fill="bg" dashed />
            <Arrow x1={x + 60} y1={44} x2={x + 60} y2={66} />
            <Box x={x} y={68} w={120} h={50} lines={[c.cls, c.method]} fs={10} mono subTone="muted" accent={c.bad} />
            <T x={x + 60} y={134} fs={11} anchor="middle" tone={c.bad ? 'danger' : 'muted'} mono>
              {c.rule[0]}
            </T>
            <T x={x + 60} y={151} fs={11} anchor="middle" tone={c.bad ? 'danger' : 'muted'}>
              {c.rule[1]}
            </T>
          </g>
        )
      })}
      <Box x={10} y={190} w={248} h={44} lines={['DateUtils.days_between', '日数（両端の日を含む）']} fs={11} fill="box2" subTone="muted" />
      <Arrow x1={70} y1={160} x2={70} y2={188} />
      <Arrow x1={198} y1={160} x2={198} y2={188} />
      <Box x={266} y={190} w={504} h={44} lines={['reservations テーブル', 'check_in（泊まり始める日）・check_out（部屋を出る日）']} fs={11} fill="box4" subTone="muted" />
      {[2, 3, 4, 5].map((i) => (
        <Arrow key={i} x1={10 + i * 128 + 60} y1={160} x2={10 + i * 128 + 60} y2={188} dashed />
      ))}
      <T x={10} y={262} fs={12} tone="danger">
        期間の規則が6行・4ファイルに、3通りの解釈で書かれている
      </T>
      <T x={10} y={284} fs={11} tone="muted">
        赤い枠：宿泊の期間として誤った解釈。点線の枠は画面・帳票。実線の矢印は呼び出し、破線の矢印は列の読み取り
      </T>
      <T x={10} y={304} fs={11} tone="muted">
        ReservationsHelper の2つのメソッドは、同じファイルにあっても別々の規則で書かれている
      </T>
    </Svg>
  )
}

/* ---------- 図 50-2 同じ予約を、5つの処理がどう数えるか ---------- */
const days = [19, 20, 21, 22, 23, 24, 25]
const readings: { code: string; result: string; nights: number[]; bad?: boolean }[] = [
  { code: 'Reservation の検証（<= と >=）', result: '11/22 で鈴木と重なる → 保存できない', nights: [20, 21, 22], bad: true },
  { code: 'booked_on?（<= と <=）', result: '11/22 の夜もふさがっていると表示', nights: [20, 21, 22], bad: true },
  { code: 'stay_label（差 + 1）', result: '3日を数えて「3泊」と表示', nights: [20, 21, 22], bad: true },
  { code: 'AvailabilitySearch（< と >）', result: '重ならない → 11/22 から空室', nights: [20, 21] },
  { code: 'InvoiceBuilder（差）', result: '2泊として請求', nights: [20, 21] },
]

function BoundaryFigure() {
  const x0 = 290
  const cw = 68
  return (
    <Svg
      id="50-2"
      w={780}
      h={400}
      label="11月19日から25日までの夜を横に並べた図。佐藤の予約は11/20にチェックインし11/22にチェックアウトするので、泊まる夜は11/20と11/21の2つ。鈴木の新しい予約は11/22と11/23の夜。5つの処理が佐藤の予約をどの夜まで使うと数えるかを比べると、Reservation の検証、booked_on?、stay_label は11/22の夜まで含めて数え、保存できない、11/22がふさがる、3泊と表示するという誤りになる。AvailabilitySearch と InvoiceBuilder は11/20と11/21の夜だけを数え、11/22から空室、2泊の請求という正しい結果になる"
    >
      {days.map((d, i) => (
        <T key={d} x={x0 + i * cw + cw / 2} y={18} anchor="middle" fs={12} mono>
          {`11/${d}`}
        </T>
      ))}
      <T x={10} y={18} fs={12} bold>
        夜（その日の夜に泊まる）
      </T>
      <T x={10} y={52} fs={12}>
        佐藤：11/20 入 → 11/22 出
      </T>
      <T x={10} y={92} fs={12}>
        鈴木：11/22 入 → 11/24 出
      </T>
      {days.map((d, i) => (
        <g key={d}>
          <Box x={x0 + i * cw + 3} y={36} w={cw - 6} h={32} fill={d === 20 || d === 21 ? 'box5' : 'bg'} dashed={d === 22} lines={d === 22 ? '出る日' : undefined} fs={11} />
          <Box x={x0 + i * cw + 3} y={76} w={cw - 6} h={32} fill={d === 22 || d === 23 ? 'box' : 'bg'} dashed={d === 24} lines={d === 24 ? '出る日' : undefined} fs={11} />
        </g>
      ))}
      <line x1={10} y1={124} x2={770} y2={124} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={10} y={142} fs={12} bold>
        各処理が「佐藤の予約で使う夜」と数える範囲
      </T>
      {readings.map((r, k) => {
        const y = 160 + k * 46
        return (
          <g key={r.code}>
            <T x={10} y={y + 10} fs={11} mono>
              {r.code}
            </T>
            <T x={10} y={y + 28} fs={11} tone={r.bad ? 'danger' : 'muted'}>
              {r.result}
            </T>
            {days.map((d, i) =>
              r.nights.includes(d) ? <Box key={d} x={x0 + i * cw + 3} y={y + 2} w={cw - 6} h={32} fill={d === 22 ? 'none' : 'box5'} accent={d === 22} lines={d === 22 ? '含めた' : undefined} fs={11} /> : null,
            )}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 50-3 凝集の段階 ---------- */
const levels: { name: string; en: string; rel: string[]; ex: string[]; strong?: boolean; weak?: boolean; added?: boolean }[] = [
  { name: '機能的', en: 'functional', rel: ['すべての要素が', '1つの機能のために働く'], ex: ['StayPeriod#overlaps?', '2つの期間が重なるかを答える'], strong: true },
  { name: '逐次的', en: 'sequential', rel: ['ある要素の出力が', '次の要素の入力になる'], ex: ['予約の CSV の行を読み、検証し、', '予約を作る取り込みの処理'] },
  { name: '通信的', en: 'communicational', rel: ['同じ入力・出力の', 'データを使う'], ex: ['1件の予約から、確認メールの本文と', '請求書の PDF を作るクラス'] },
  { name: '手順的', en: 'procedural', rel: ['実行の順番でつながるが、', '扱うデータは別々'], ex: ['夜間のジョブ：集計してから、', '古いログを消し、通知を送る'], added: true },
  { name: '時間的', en: 'temporal', rel: ['同じ時点に', '実行するというだけ'], ex: ['after_create にまとめた', 'ポイント付与・メール・Slack 通知'] },
  { name: '論理的', en: 'logical', rel: ['同じ種類の処理', 'というだけ'], ex: ['DateUtils：日付を扱うメソッドを', '集めたモジュール'], weak: true },
  { name: '偶然的', en: 'coincidental', rel: ['要素の間に意味の', 'ある関係がない'], ex: ['Utils：置き場所に困った', 'メソッドを集めたモジュール'], weak: true },
]

function LevelsFigure() {
  const rowH = 50
  const top = 40
  return (
    <Svg
      id="50-3"
      w={780}
      h={top + levels.length * rowH + 50}
      label={`凝集の段階を強い順に並べた表。${levels.map((l) => `${l.name}（${l.en}）：${l.rel.join('')}。Rails の例は${l.ex.join('')}`).join('。')}。手順的は1974年の論文には無く、1978年の Yourdon と Constantine の本で加わった段階。1974年の論文は、機能的がほかよりずっと強く、偶然的と論理的がほかよりずっと弱いと述べている`}
    >
      <Box x={44} y={10} w={150} h={30} lines="段階" fs={12} fill="box5" bold rx={0} />
      <Box x={194} y={10} w={230} h={30} lines="要素を結び付けている関係" fs={12} fill="box5" bold rx={0} />
      <Box x={424} y={10} w={346} h={30} lines="Rails のコードの例" fs={12} fill="box5" bold rx={0} />
      {levels.map((l, i) => {
        const y = top + i * rowH
        return (
          <g key={l.en}>
            <Box x={44} y={y} w={150} h={rowH} lines={[l.name, l.en]} fs={12} rx={0} bold subTone={l.weak ? 'danger' : 'muted'} accent={l.strong} dashed={l.added} />
            <Box x={194} y={y} w={230} h={rowH} lines={l.rel} fs={11} fill="bg" rx={0} align="start" />
            <Box x={424} y={y} w={346} h={rowH} lines={l.ex} fs={11} fill="bg" rx={0} align="start" />
          </g>
        )
      })}
      <Arrow x1={22} y1={top + levels.length * rowH - 6} x2={22} y2={top + 6} accent />
      <T x={22} y={top + levels.length * rowH + 14} anchor="middle" fs={11} tone="muted">
        弱い
      </T>
      <T x={10} y={top + levels.length * rowH + 38} fs={11} tone="muted">
        破線の枠（手順的）は1974年の論文には無く、1978年の Yourdon・Constantine の本で加わった段階。段階の間隔は等しくない
      </T>
      <T x={22} y={top - 10} anchor="middle" fs={11} tone="muted">
        強い
      </T>
    </Svg>
  )
}

/* ---------- 図 50-4 utils モジュールと、期間のクラスのまとまり方 ---------- */
function UtilsFigure() {
  const utilMethods: [string, string, string][] = [
    ['days_between', 'Campaign', 'キャンペーンの数え方'],
    ['format_md', 'ReservationsHelper', '画面の表記'],
    ['weekend?', '料金の計算', '週末の割増の規則'],
    ['fiscal_year', '月次の集計', '会計の年度'],
  ]
  const stayMethods = ['nights', 'overlaps?(other)', 'stays_on?(date)', 'initialize（検証）']
  return (
    <Svg
      id="50-4"
      w={780}
      h={330}
      label="左は DateUtils。days_between は Campaign がキャンペーンの数え方のために使い、ReservationsHelper も泊数の計算に流用している。format_md は ReservationsHelper が画面の表記のために、weekend? は料金の計算が週末の割増の規則のために、fiscal_year は月次の集計が会計の年度のために使う。4つのメソッドは同じデータを使わず、呼び出し側も変える理由も別々。右は StayPeriod。nights、overlaps?、stays_on?、initialize の検証の4つが、どれも nights_range（check_in 以上 check_out 未満）という同じ規則を使う。宿泊の期間の規則が変わるときは、このクラスだけを直す"
    >
      <T x={10} y={18} bold>
        DateUtils（日付を扱うという種類で集めた）
      </T>
      <Box x={10} y={34} w={170} h={250} fill="box2" lines={undefined} />
      <T x={22} y={52} fs={11} tone="muted">
        module DateUtils
      </T>
      {utilMethods.map(([m, caller, reason], i) => {
        const y = 66 + i * 54
        return (
          <g key={m}>
            <Box x={22} y={y} w={146} h={38} lines={m} fs={11} mono />
            <Arrow x1={278} y1={y + 19} x2={170} y2={y + 19} />
            <Box x={280} y={y} w={128} h={38} lines={[caller, reason]} fs={10} subTone="muted" />
          </g>
        )
      })}
      <Arrow x1={278} y1={128} x2={172} y2={96} dashed />
      <T x={188} y={156} fs={10} tone="danger">
        破線：泊数に流用
      </T>
      <T x={10} y={304} fs={11} tone="danger">
        共通のデータが無く、呼び出し側も変える理由も別々
      </T>

      <line x1={424} y1={10} x2={424} y2={320} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={440} y={18} bold>
        StayPeriod（宿泊の期間という1つの概念）
      </T>
      <Box x={440} y={34} w={330} h={250} fill="box2" accent />
      {stayMethods.map((m, i) => {
        const y = 52 + i * 46
        return (
          <g key={m}>
            <Box x={454} y={y} w={150} h={34} lines={m} fs={11} mono />
            <Arrow x1={604} y1={y + 17} x2={636} y2={150} />
          </g>
        )
      })}
      <Box x={638} y={110} w={120} h={80} lines={['nights_range', 'check_in 以上', 'check_out 未満']} fs={11} fill="box5" mono subTone="muted" />
      <T x={454} y={262} fs={11} tone="muted">
        どのメソッドも同じ規則を使う
      </T>
      <T x={440} y={304} fs={11} tone="acc">
        宿泊の期間の規則が変わるときは、このクラスだけを直す
      </T>
    </Svg>
  )
}

/* ---------- 図 50-5 直す前と後：期間の規則を書いている場所 ---------- */
function BeforeAfterFigure() {
  const before: [string, string, boolean][] = [
    ['models/reservation.rb', '2行（<= と >=、出る日 <= 入る日）', true],
    ['services/availability_search.rb', '1行（< と >）', false],
    ['helpers/reservations_helper.rb', '2行（差 + 1、<= と <=）', true],
    ['services/invoice_builder.rb', '1行（差）', false],
  ]
  return (
    <Svg
      id="50-5"
      w={780}
      h={360}
      label="直す前は、期間の規則を書いた行が4つのファイルに6行あった。reservation.rb に2行（両端を含む重なりと、出る日が入る日以前かの検証）、availability_search.rb に1行（出る日を含まない重なり）、reservations_helper.rb に2行（差に1を足す泊数と、両端を含むカレンダーの判定）、invoice_builder.rb に1行（差）。解釈は3通り。直した後は、StayPeriod に5行、Reservation.overlapping の SQL に1行で、解釈は1通り。AvailabilitySearch は Reservation.overlapping を、ReservationsHelper と InvoiceBuilder と Reservation の検証は StayPeriod を使う。overlaps? と overlapping は、同じ6件の境界の例を流すテストで一致を確かめる"
    >
      <T x={10} y={18} bold>
        直す前：6行・4ファイル・3通りの解釈
      </T>
      {before.map(([f, n, bad], i) => (
        <Box key={f} x={10} y={34 + i * 62} w={330} h={50} lines={[f, n]} fs={11} mono subTone={bad ? 'danger' : 'muted'} accent={bad} />
      ))}
      <T x={10} y={290} fs={11} tone="muted">
        数えた方法：grep で、check_in・check_out を比べる行、
      </T>
      <T x={10} y={308} fs={11} tone="muted">
        引き算する行、days_between に渡す行を抜き出した
      </T>

      <line x1={360} y1={10} x2={360} y2={350} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={380} y={18} bold>
        直した後：6行・2ファイル・1通りの解釈
      </T>
      <Box x={380} y={34} w={124} h={40} lines="AvailabilitySearch" fs={10} mono />
      <Box x={512} y={34} w={130} h={40} lines="ReservationsHelper" fs={10} mono />
      <Box x={650} y={34} w={120} h={40} lines="InvoiceBuilder" fs={10} mono />
      <Box x={380} y={150} w={180} h={64} lines={['Reservation', '.overlapping（SQL）1行', '検証は StayPeriod で']} fs={11} mono subTone="muted" />
      <Box x={580} y={150} w={190} h={64} lines={['StayPeriod', '規則 5行', 'nights_range を共有']} fs={11} mono accent fill="box5" subTone="muted" />
      <Arrow x1={442} y1={74} x2={460} y2={148} />
      <Arrow x1={577} y1={74} x2={640} y2={148} />
      <Arrow x1={710} y1={74} x2={710} y2={148} />
      <Arrow x1={560} y1={182} x2={578} y2={182} />
      <Box x={380} y={244} w={390} h={50} lines={['spec/support/overlap_cases.rb', '境界の例6件を overlaps? と overlapping の両方に流す']} fs={11} fill="bg" dashed subTone="muted" />
      <Arrow x1={470} y1={244} x2={470} y2={216} dashed />
      <Arrow x1={675} y1={244} x2={675} y2={216} dashed />
      <T x={380} y={320} fs={11} tone="muted">
        数えた方法は左と同じ。overlap? と cover? の行も数えた
      </T>
    </Svg>
  )
}

/* ---------- 図 50-6 集める・分けるの判断 ---------- */
function DecisionFigure() {
  const qx = [150, 460]
  const qy = [40, 196]
  const qw = 300
  const qh = 146
  const cells: { c: number; r: number; title: string; body: string[]; tone?: 'acc' | 'danger' }[] = [
    { c: 1, r: 0, title: '1つのクラスに集める', body: ['StayPeriod の nights・overlaps?・', 'stays_on?'], tone: 'acc' },
    { c: 1, r: 1, title: '規則だけを集め、処理は使う側に置く', body: ['請求額・キャンセル料・カレンダーの', '表示は period を受け取って使う'] },
    { c: 0, r: 0, title: '近くに置く（同じ名前空間）', body: ['予約の確定で一緒に変わる保存・', '確認メール・在庫の更新'] },
    { c: 0, r: 1, title: '分ける', body: ['DateUtils の days_between（キャンペーン）', 'と format_md（画面の表記）'] },
  ]
  return (
    <Svg
      id="50-6"
      w={780}
      h={420}
      label="横の軸は、同じ規則（知識）を使うか。縦の軸は、変える理由が同じか。同じ規則を使い、変える理由も同じものは1つのクラスに集める（StayPeriod の nights・overlaps?・stays_on?）。同じ規則を使うが変える理由が違うものは、規則だけを集めて処理は使う側に置く（請求額、キャンセル料、カレンダーの表示は period を受け取って使う）。規則は違うが一緒に変わるものは同じ名前空間など近くに置く。規則も変える理由も違うものは分ける（DateUtils の days_between と format_md）。右上を1メソッドずつのクラスに分けるのが分けすぎ、右下を StayPeriod に入れるのが集めすぎ"
    >
      <T x={300} y={20} anchor="middle" fs={12} tone="muted">
        使わない
      </T>
      <T x={610} y={20} anchor="middle" fs={12} tone="muted">
        使う
      </T>
      <T x={455} y={372} anchor="middle" fs={12} bold>
        → 同じ規則（知識）を使うか
      </T>
      <T x={10} y={113} fs={12} tone="muted">
        同じ
      </T>
      <T x={10} y={269} fs={12} tone="muted">
        違う
      </T>
      <T x={10} y={196} fs={12} bold>
        変える理由
      </T>
      <T x={10} y={214} fs={12} bold>
        が同じか ↑
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
      <T x={474} y={qy[0] + 118} fs={11} tone="danger">
        分けすぎ：1メソッドずつのクラスにする
      </T>
      <T x={474} y={qy[1] + 118} fs={11} tone="danger">
        集めすぎ：これを StayPeriod に入れる
      </T>
      <T x={10} y={400} fs={11} tone="muted">
        「同じ規則を使う」は、同じ列を読むことではなく、同じ判断（たとえば「出る日の夜は含まない」）に頼ること
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 69,
  part: 8,
  title: 'High Cohesion（高凝集）：予約の期間の計算を1つのクラスに集める',
  summary:
    '宿の予約で、泊数や期間の重なりの計算がモデル・ヘルパー・サービス・utils モジュールに散らばり、境界の日の扱いが食い違う例から始めます。Stevens・Myers・Constantine の凝集の分類を一次資料で確かめ、計算を StayPeriod に集めて直し、分けすぎ・集めすぎの判断と Rails の置き場所を示します。',
  goals: [
    '処理が散らばったコードで、境界の扱いが食い違う理由と、1か所の修正が別の機能を壊す理由を説明できる',
    '1974年の論文「Structured Design」の凝集（binding）の6つの段階と、後に加わった手順的凝集を、Rails のコードの例で説明できる',
    '1文で説明する検査を使って、クラスやモジュールの凝集の段階を見積もれる',
    '散らばった期間の計算を値オブジェクトに集め、SQL と Ruby の2つの書き方を同じ境界の例で確かめられる',
    '1メソッドずつのクラスに分けすぎた状態と、同じ列を使う処理を集めすぎた状態を見分けられる',
    'モデル・値オブジェクト・concern・ヘルパー・utils のそれぞれに、何を置くと凝集が下がるかを説明できる',
  ],
  prerequisites: [30, 33, 63, 68],
  sections: [
    {
      id: 'scene',
      title: '予約の期間の計算が4つのファイルに散らばった予約システム',
      body: (
        <>
          <p>
            この章では宿の予約システムを例に High Cohesion（高凝集）を扱います。凝集は、1つのモジュールの中にある処理やデータが、どれだけ互いに関係しているかを表す言葉です。最初に、関係の深い処理が別々の場所に書かれていると何が起きるかを、動くコードで確かめます。
          </p>
          <h3>そもそも宿の予約で何を計算するのか</h3>
          <p>
            小さな宿が部屋ごとに予約を受け付けています。予約には、泊まり始める日（チェックイン）と、部屋を出る日（チェックアウト）があります。11/20 にチェックインして 11/22 にチェックアウトする客は、11/20 と 11/21 の夜に泊まるので2泊です。11/22 の朝に部屋を出るので、11/22 の夜は次の客が泊まれます。
          </p>
          <p>このシステムは宿泊の期間について次の4つを計算します。</p>
          <ul>
            <li>泊数：予約の一覧、確認メール、請求書に出します。11/20〜11/22 なら2泊です。</li>
            <li>期間の重なり：同じ部屋に重なる予約を保存しないように検証します。空室検索でも、指定した期間と重なる予約がある部屋を除きます。</li>
            <li>ある日の夜に泊まっているか：空室カレンダーで、日ごとに部屋がふさがっているかを表示します。</li>
            <li>期間として正しいか：チェックアウトがチェックインより後の日でなければ、予約を保存しません。</li>
          </ul>
          <p>
            4つの計算はどれも、「チェックアウトの日の夜は泊まらない」という同じ規則に頼っています。この章では、この規則を境界の扱いと呼びます。
          </p>
          <h3>テーブル</h3>
          <p>
            部屋（rooms）と予約（reservations）に加えて、宿のキャンペーン（campaigns）のテーブルを作ります。キャンペーンの期間は「11/1〜11/30 の30日間」のように、最終日も含めて数えます。宿泊の期間とは数え方が違うことに注意してください。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_rooms_and_reservations.rb"
            code={`
class CreateRoomsAndReservations < ActiveRecord::Migration[8.1]
  def change
    create_table :rooms do |t|
      t.string :name, null: false
      t.integer :nightly_rate, null: false # 1泊の料金（円）
      t.timestamps
    end

    create_table :reservations do |t|
      t.references :room, null: false, foreign_key: true
      t.string :guest_name, null: false
      t.date :check_in, null: false  # 泊まり始める日
      t.date :check_out, null: false # 部屋を出る日（この日の夜は泊まらない）
      t.timestamps
    end

    create_table :campaigns do |t|
      t.string :name, null: false
      t.date :starts_on, null: false # 初日
      t.date :ends_on, null: false   # 最終日（この日も含む）
      t.timestamps
    end
  end
end
`}
          />
          <h3>期間を扱うコード</h3>
          <p>
            このシステムは数年かけて、担当者が機能ごとに書き足してきました。期間を扱うコードは次の場所にあります。まず予約のモデルです。重なりの検証で、既存の予約と新しい予約を <code>{'<='}</code> と <code>{'>='}</code> で比べています。
          </p>
          <Code
            lang="ruby"
            title="app/models/reservation.rb（直す前）"
            code={`
class Reservation < ApplicationRecord
  belongs_to :room

  validates :guest_name, :check_in, :check_out, presence: true
  validate :check_out_after_check_in
  validate :not_overlapping

  private

  def check_out_after_check_in
    return if check_in.blank? || check_out.blank?

    errors.add(:check_out, "はチェックインより後の日にしてください") if check_out <= check_in
  end

  # 同じ部屋のほかの予約と期間が重なっていないか
  def not_overlapping
    return if check_in.blank? || check_out.blank?

    overlapped = Reservation.where(room_id: room_id).where.not(id: id)
                            .where("check_in <= ? AND check_out >= ?", check_out, check_in)
    errors.add(:base, "期間がほかの予約と重なっています") if overlapped.exists?
  end
end
`}
          />
          <p>空室検索のサービスは同じ重なりを <code>{'<'}</code> と <code>{'>'}</code> で判定しています。こちらはチェックアウトの日を含めない比べ方です。</p>
          <Code
            lang="ruby"
            title="app/services/availability_search.rb（直す前）"
            code={`
# 指定した期間に空いている部屋を探す
class AvailabilitySearch
  def initialize(check_in:, check_out:)
    @check_in = check_in
    @check_out = check_out
  end

  def rooms
    busy_room_ids = Reservation.where("check_in < ? AND check_out > ?", @check_out, @check_in).select(:room_id)
    Room.where.not(id: busy_room_ids).order(:id)
  end
end
`}
          />
          <p>
            予約の一覧と確認メールに使うヘルパーは、泊数を <code>DateUtils.days_between</code> で数えています。空室カレンダーの判定も同じファイルにあり、こちらは両端の日を含めて比べています。
          </p>
          <Code
            lang="ruby"
            title="app/helpers/reservations_helper.rb（直す前）"
            code={`
module ReservationsHelper
  # 予約の一覧と確認メールに出す「11/20〜11/22（2泊）」の表示
  def stay_label(reservation)
    nights = DateUtils.days_between(reservation.check_in, reservation.check_out)
    "#{DateUtils.format_md(reservation.check_in)}〜#{DateUtils.format_md(reservation.check_out)}（#{nights}泊）"
  end

  # 空室カレンダーで、その日に部屋がふさがっているか
  def booked_on?(room, date)
    room.reservations.any? { |r| r.check_in <= date && date <= r.check_out }
  end
end
`}
          />
          <p>
            <code>DateUtils</code> は日付に関する便利なメソッドを集めたモジュールです。<code>days_between</code> はもともとキャンペーンの日数（最終日も含む）を数えるために書かれました。ヘルパーを書いた担当者は、名前から「2つの日付の間の日数」を返すと考えて、泊数にも使いました。
          </p>
          <Code
            lang="ruby"
            title="app/lib/date_utils.rb と app/models/campaign.rb（直す前）"
            code={`
# 日付に関する便利メソッドを集めたモジュール
module DateUtils
  module_function

  # from から to までの日数（両端の日を含む）
  def days_between(from, to)
    (to - from).to_i + 1
  end

  # 11/20 の形式にする
  def format_md(date)
    date.strftime("%-m/%-d")
  end

  # 土曜か日曜か
  def weekend?(date)
    date.saturday? || date.sunday?
  end

  # 4月始まりの年度
  def fiscal_year(date)
    date.month >= 4 ? date.year : date.year - 1
  end
end

class Campaign < ApplicationRecord
  # 「11/1〜11/30 の30日間」の表示に使う
  def days
    DateUtils.days_between(starts_on, ends_on)
  end
end
`}
          />
          <p>請求書のサービスは日付の差をそのまま泊数にしています。</p>
          <Code
            lang="ruby"
            title="app/services/invoice_builder.rb（直す前）"
            code={`
# 予約の請求額を計算する
class InvoiceBuilder
  def initialize(reservation)
    @reservation = reservation
  end

  def nights
    (@reservation.check_out - @reservation.check_in).to_i
  end

  def total
    nights * @reservation.room.nightly_rate
  end
end
`}
          />
          <p>
            図 50-1 は期間を扱う処理と、それぞれの境界の扱いです。同じ「宿泊の期間」について、6つの処理が3通りの解釈で書かれています。赤い枠の3つが、チェックアウトの日の夜まで含めてしまう誤った解釈です。
          </p>
          <Figure n="50-1" title="予約の期間を扱うクラスと、それぞれの境界の扱い" caption="模式図。ReservationsHelper の2つのメソッドは別々の列に分けて描いた。">
            <SceneFigure />
          </Figure>
          <h3>スクリプトで動かした結果</h3>
          <p>
            11/20〜11/22 の予約がある部屋に対して、各機能を順に呼ぶスクリプトを書きました。<code>ApplicationController.helpers</code> は、ビューと同じヘルパーを読み込んだオブジェクトを返すので、ヘルパーのメソッドをスクリプトから呼べます。
          </p>
          <Code
            lang="ruby"
            title="script/scene.rb（直す前）"
            code={`
room = Room.create!(name: "離れ 桜", nightly_rate: 18_000)
first = room.reservations.create!(guest_name: "佐藤", check_in: Date.new(2026, 11, 20), check_out: Date.new(2026, 11, 22))
h = ApplicationController.helpers # ビューと同じく、すべてのヘルパーを読み込んだオブジェクト
invoice = InvoiceBuilder.new(first)

puts "① 予約の一覧の表示: #{h.stay_label(first)}"
puts "② 請求書: #{invoice.nights}泊 × #{room.nightly_rate.to_fs(:delimited)}円 = #{invoice.total.to_fs(:delimited)}円"

check_in, check_out = Date.new(2026, 11, 22), Date.new(2026, 11, 24)
puts "③ 空室検索（11/22〜11/24）: #{AvailabilitySearch.new(check_in:, check_out:).rooms.pluck(:name)}"
puts "④ 空室カレンダーで 11/22 の夜はふさがっているか: #{h.booked_on?(room, Date.new(2026, 11, 22))}"
second = room.reservations.build(guest_name: "鈴木", check_in:, check_out:)
puts "⑤ 11/22〜11/24 の予約の保存: #{second.save} #{second.errors.full_messages}"
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb）"
            code={`
① 予約の一覧の表示: 11/20〜11/22（3泊）
② 請求書: 2泊 × 18,000円 = 36,000円
③ 空室検索（11/22〜11/24）: ["離れ 桜"]
④ 空室カレンダーで 11/22 の夜はふさがっているか: true
⑤ 11/22〜11/24 の予約の保存: false ["期間がほかの予約と重なっています"]
`}
          />
          <p>
            一覧とメールには「3泊」と出ますが、請求書は2泊分です。空室検索は 11/22〜11/24 で「離れ 桜」を空室として返しますが、カレンダーは 11/22 をふさがっていると表示し、予約の保存は重なりのエラーで失敗します。客から見ると、検索で選んだ部屋が予約できず、確認メールと請求書で泊数が違います。図 50-2 は、5つの処理が佐藤の予約をどの夜まで使うと数えているかを並べたものです。
          </p>
          <Figure n="50-2" title="同じ予約を、5つの処理がどう数えるか" caption="上の2行が実際の予約。下の5行の「含めた」は、11/22 の夜まで予約で使うと数えたことを表す。">
            <BoundaryFigure />
          </Figure>
          <h3>1か所を直すと、別の機能が壊れる</h3>
          <p>
            「一覧に3泊と出る」という問い合わせを受けた担当者が、<code>DateUtils.days_between</code> の <code>+ 1</code> を消しました。ヘルパーのテストは通るようになりましたが、キャンペーンのテストが落ちました。
          </p>
          <Code
            lang="ruby"
            title="app/lib/date_utils.rb（担当者が直したもの）"
            code={`
  # from から to までの日数（両端の日を含む）
  def days_between(from, to)
    (to - from).to_i # 「3泊」と出る不具合を直すために + 1 を消した
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/campaign_spec.rb spec/helpers/reservations_helper_spec.rb）"
            code={`
F.

Failures:

  1) Campaign 初日と最終日を含めた日数を返す
     Failure/Error: expect(campaign.days).to eq 30

       expected: 30
            got: 29

       (compared using ==)
     # ./spec/models/campaign_spec.rb:6:in 'block (2 levels) in <top (required)>'

Finished in 0.06034 seconds (files took 1.01 seconds to load)
2 examples, 1 failure
`}
          />
          <p>
            <code>days_between</code> はキャンペーンの数え方としては正しかったのです。誤っていたのは、宿泊の泊数という別の計算にこのメソッドを使ったことでした。DateUtils は「日付を扱う」という種類だけでメソッドを集めているので、呼び出し側がどの意味で使っているかがファイルを見てもわかりません。
          </p>
          <h3>期間の規則が書かれている行を数える</h3>
          <p>境界の扱いを変えるときに直す場所を知るために、check_in・check_out を比べる行、引き算する行、days_between に渡す行を grep で抜き出しました。</p>
          <Code
            lang="text"
            title={'実行結果（grep -rnE "check_(in|out) *(<|>|-)|check_(in|out) [<>]=? \\?|days_between\\(r" app）'}
            code={`
app/services/availability_search.rb:9:    busy_room_ids = Reservation.where("check_in < ? AND check_out > ?", @check_out, @check_in).select(:room_id)
app/models/reservation.rb:13:    errors.add(:check_out, "はチェックインより後の日にしてください") if check_out <= check_in
app/models/reservation.rb:21:                            .where("check_in <= ? AND check_out >= ?", check_out, check_in)
app/services/invoice_builder.rb:8:    (@reservation.check_out - @reservation.check_in).to_i
app/helpers/reservations_helper.rb:4:    nights = DateUtils.days_between(reservation.check_in, reservation.check_out)
app/helpers/reservations_helper.rb:10:    room.reservations.any? { |r| r.check_in <= date && date <= r.check_out }
`}
          />
          <p>
            期間の規則は4つのファイルの6行に書かれています。この6行の解釈は両端の日を含める、チェックアウトの日を含めない、差に1を足す、の3通りです。grep で見つかるのは列名を書いた行だけなので、<code>days_between</code> のように別の名前を経由する使い方は、呼び出し側を1つずつ読まないと見つかりません。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>「チェックアウトの日の夜は泊まらない」という1つの規則が、6行に別々に書かれています。新しい処理を書く担当者は、既存のどの行に合わせればよいかを判断できません。</li>
            <li>規則が食い違っても、それぞれのテストは通ります。食い違いは、検索で選んだ部屋が保存できない、メールと請求書で泊数が違う、という形で利用者が見つけます。</li>
            <li>DateUtils の1つのメソッドを、意味の違う2つの計算（キャンペーンの日数と泊数）が使っています。片方のために直すと、もう片方が壊れます。</li>
            <li>規則を変える場合（たとえば日帰りの利用を受け付けて0泊を許す場合）に、直す場所を grep と読み込みで探す必要があります。</li>
          </ul>
          <p>どの問題も、宿泊の期間という1つの概念に属する処理が、関係のない処理と同じ場所に置かれ、互いに離れていることから起きています。次の節で、この状態を表す凝集という考え方を説明します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '凝集とは何か：Stevens・Myers・Constantine の分類',
      body: (
        <>
          <h3>High Cohesion の意味</h3>
          <p>
            <Term en="High Cohesion">高凝集</Term>は、関連性の高い処理やデータを同じモジュールにまとめ、モジュールの責務を明確にするという原則です。ここでのモジュールは、Ruby ではクラスやモジュール、Rails のアプリではモデル・サービス・ヘルパー・concern などを指します。<Term en="cohesion">凝集</Term>は、1つのモジュールの中の要素（メソッド、文、データ）が、どれだけ同じ目的のために結び付いているかの度合いで、凝集度とも呼びます。
          </p>
          <p>
            この章の例に当てはめると、泊数・重なり・ある日の夜に泊まっているかの判定は、どれも「チェックアウトの日の夜は含まない」という規則に頼る、関連性の高い処理です。直す前のコードでは、これらがモデル・サービス・ヘルパーに分かれ、ヘルパーの中では画面の表記と同じファイルに、DateUtils の中ではキャンペーンの日数と同じメソッドに入っていました。関連性の高い処理が別々の場所にあり、同じ場所には関連性の低い処理がある状態です。
          </p>
          <h3>由来：1974年の論文「Structured Design」</h3>
          <p>
            凝集と、モジュールの間のつながりを表す結合（coupling）は、W. P. Stevens、G. J. Myers、L. L. Constantine が1974年に IBM Systems Journal に発表した論文「Structured Design」で説明されています<Ref n={1} />。論文の冒頭には、主な考え方は Constantine の10年近い研究の成果であると書かれています<Ref n={1} />。Yourdon と Constantine の本の注によると、設計者がなぜその要素を1つのモジュールにまとめたのかを調べる最初の研究は、Constantine が1964〜1965年に行いました<Ref n={2} />。この章では1974年の論文の内容を、1999年に同じ雑誌に再録された本文で確かめました。
          </p>
          <p>
            論文は凝集を binding（結び付き）という語で扱い、「binding はモジュールの凝集性の尺度である」と定義しています<Ref n={1} />。論文はまず、モジュールの間の関係を少なくする方法として、モジュールの間のつながりを減らすことと、同じモジュールの中の要素の関係を強めることの2つを挙げ、そのうえで凝集を高めるのは結合を下げるためだと位置づけています<Ref n={1} />。高凝集と疎結合は別々の原則に見えますが、同じ目的（モジュールの間の関係を減らす）の両面です。結合は<ChapterLink n={70} />で扱います。
          </p>
          <h3>凝集の段階</h3>
          <p>論文は凝集を、弱いものから順に6つの段階に分けています<Ref n={1} />。</p>
          <ol>
            <li>偶然的（coincidental）：要素の間に意味のある関係がない。論文は既存のプログラムを分割したときや、重複したコードを1か所にまとめたときに生じるとしています。</li>
            <li>論理的（logical）：同じ種類の処理というだけで集めている。例は「すべての入出力を行うモジュール」「すべてのデータを検査するモジュール」です。</li>
            <li>時間的（temporal）：論理的な関係に加えて、同じ時点に実行する。例は初期化や後始末のモジュールです。</li>
            <li>通信的（communicational）：同じ入力や出力のデータを参照する。</li>
            <li>逐次的（sequential）：ある要素の出力が次の要素の入力になる。</li>
            <li>機能的（functional）：すべての要素が1つの機能の実行のために働く。</li>
          </ol>
          <p>
            論文は、この尺度は等間隔ではなく、機能的はほかのすべてよりずっと強く、最初の2つ（偶然的と論理的）はほかのすべてよりずっと弱い、と述べています<Ref n={1} />。また、モジュールの凝集は、その中で機能的でない要素の組が1つあるごとに下がるとしています<Ref n={1} />。
          </p>
          <p>
            1978年に Yourdon と Constantine が出版した本『Structured Design』は、時間的と通信的の間に手順的（procedural）を加えて7つの段階にしました<Ref n={2} />。手順的は、要素が実行の順番でつながっているが、扱うデータは別々の状態です。この本は、最初の3つ（偶然的・論理的・時間的）は一般に受け入れにくく、最後の3つ（通信的・逐次的・機能的）は一般に受け入れられる水準だと述べています<Ref n={2} />。図 50-3 は7つの段階と、Rails のコードでの例です。
          </p>
          <Figure n="50-3" title="凝集の段階" caption="段階の名前と並びは1974年の論文と1978年の本による。Rails の例はこの章で考えたもの。">
            <LevelsFigure />
          </Figure>
          <p>
            論理的凝集の説明で、論文は「すべてのデータを検査する」モジュールの例を挙げています。このモジュールは検査するデータの種類を表す引数を受け取り、最初に4方向に分岐します。1種類の検査を変えると、絡み合ったほかの3つの検査に影響が出やすく、不要な引数も渡すことになる、というのが論文の指摘です<Ref n={1} />。DateUtils は分岐こそ持ちませんが、「日付を扱う」という種類だけで集めた点で同じ段階にあります。
          </p>
          <h3>1文で説明する検査</h3>
          <p>
            論文は、モジュールが機能的かを見分ける方法として、そのモジュールの目的を1つの文で書き、その文を調べることを勧めています<Ref n={1} />。
          </p>
          <ul>
            <li>文が複文になる、読点を含む、動詞が2つ以上ある：複数の機能を持っていて、逐次的か通信的の可能性が高い</li>
            <li>「最初に」「次に」「その後」「〜のとき」など時間を表す語を含む：逐次的か時間的の可能性が高い</li>
            <li>動詞の後に、特定の1つの目的語がない：論理的の可能性が高い（「すべてのデータを検査する」は論理的、「ソースの文を検査する」は機能的でありうる）</li>
            <li>「初期化する」「後始末する」などの語：時間的</li>
          </ul>
          <p>この章のクラスに当てはめると、次のようになります。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">クラス・モジュール</th>
                  <th scope="col">目的を1文で書く</th>
                  <th scope="col">検査の結果</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">DateUtils</th>
                  <td>日付に関するさまざまな計算をする</td>
                  <td>特定の目的語がない。論理的</td>
                </tr>
                <tr>
                  <th scope="row">ReservationsHelper（直す前）</th>
                  <td>予約の期間を表示し、ある日に部屋がふさがっているかを判定する</td>
                  <td>動詞が2つ。表示と判定が同じ予約を使うので通信的</td>
                </tr>
                <tr>
                  <th scope="row">夜間のジョブ（図 50-3 の手順的の例）</th>
                  <td>最初に集計し、次に古いログを消し、最後に通知を送る</td>
                  <td>時間を表す語がある。逐次的か時間的（データが別々なら手順的）</td>
                </tr>
                <tr>
                  <th scope="row">StayPeriod#overlaps?</th>
                  <td>2つの宿泊の期間が重なるかを答える</td>
                  <td>動詞1つ・目的語1つ。機能的</td>
                </tr>
                <tr>
                  <th scope="row">InvoiceBuilder</th>
                  <td>予約の請求額を計算する</td>
                  <td>動詞1つ・目的語1つ。機能的</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            論文自身も、この検査は目安だと書いています。機能的なモジュールでも、中の要素を説明すれば複文になります<Ref n={1} />。この章では、検査の結果で段階を決めるより、「この文に『と』や『次に』が入るのはなぜか」を考える手がかりとして使います。
          </p>
          <h3>クラスに当てはめるとき：Myers の情報的強度</h3>
          <p>
            1974年の分類は手続き（サブルーチン）を単位にして作られました。クラスには複数のメソッドがあるので、そのまま当てはめると迷う場面があります。たとえば後で作る StayPeriod には泊数・重なり・ある日の夜に泊まっているかの3つのメソッドがあり、どれも同じデータを使うので、1974年の分類では通信的に見えます。
          </p>
          <p>
            Myers は1975年の本『Reliable Software Through Composite Design』で、凝集を module strength（モジュールの強度）と呼び、機能的と通信的の間に informational strength（情報的強度）を置きました<Ref n={3} />。情報的強度のモジュールは1つのデータ構造を扱う複数の機能を持ち、機能ごとに別々のエントリーポイント（外から呼び出せる開始位置）を持ちます。Myers は例として、記号表への登録と記号表の検索を1つのモジュールにまとめる場合を挙げ、記号表の形式を変えるときに1つのモジュールだけを直せばよいと説明しています。Myers によると、この強度は情報隠蔽（データ構造についての知識を1つのモジュールだけが持つようにすること）に基づくものです<Ref n={3} />。
          </p>
          <p>
            Ruby のクラスで、1つのデータ（ここでは check_in と check_out）を扱うメソッドを集め、各メソッドが1つの機能を持つ形は、Myers の情報的強度にあたります。同時に Myers は、複数の機能を1つのモジュールに入れると、機能同士が絡み合う機会が生まれ、論理的強度と同じ欠点を持ちやすいとも注意しています<Ref n={3} />。StayPeriod の各メソッドが短く、互いを呼ばずに nights_range を使うだけにしているのは、このためです。
          </p>
          <h3>utils モジュールの凝集が低くなる理由</h3>
          <p>
            論文は偶然的凝集が生じる場面の1つとして、ほかのモジュールに重複していたコードを1か所にまとめたときを挙げています。まとめたモジュールを、元の呼び出し側の1つの都合で直すと、ほかの呼び出し側で使えなくなる、という例も示しています<Ref n={1} />。場面の節で days_between の <code>+ 1</code> を消したときに起きたことは、この例と同じです。
          </p>
          <p>
            図 50-4 は DateUtils と、この後で作る StayPeriod のまとまり方を比べたものです。DateUtils の4つのメソッドは同じデータを使わず、呼び出し側も変える理由も別々です。StayPeriod の4つの処理は、どれも同じ規則（nights_range）を使います。
          </p>
          <Figure n="50-4" title="utils モジュールと、期間のクラスのまとまり方" caption="左の呼び出し側のうち、料金の計算と月次の集計はこの章のアプリには無い。DateUtils の使われ方の例として描いた。">
            <UtilsFigure />
          </Figure>
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
                    <ChapterLink n={63}>SRP</ChapterLink>
                  </th>
                  <td>このモジュールを変える理由は1つか</td>
                  <td>SRP は分ける方向の問い。凝集は、同じ理由で変わるものが1か所に集まっているかという、集める方向の問いも含む</td>
                </tr>
                <tr>
                  <th scope="row">
                    <ChapterLink n={68}>SoC</ChapterLink>
                  </th>
                  <td>異なる関心事が混ざっていないか</td>
                  <td>SoC は表示・検証・保存のような関心事の種類で分ける。凝集は、分けた後の各モジュールの中身が互いに関係しているかを見る</td>
                </tr>
                <tr>
                  <th scope="row">
                    <ChapterLink n={59}>DRY</ChapterLink>
                  </th>
                  <td>同じ知識が複数の場所にないか</td>
                  <td>見た目が同じコードをまとめると、偶然的凝集のモジュールができることがある（days_between）。知識ごとにまとめれば、DRY と高凝集は同じ方向を向く</td>
                </tr>
                <tr>
                  <th scope="row">
                    <ChapterLink n={73}>Information Hiding</ChapterLink>
                  </th>
                  <td>変わりやすい判断を隠しているか</td>
                  <td>Myers は情報的強度を情報隠蔽に基づくものとした。境界の扱いを StayPeriod の中に隠すと、凝集も上がる</td>
                </tr>
                <tr>
                  <th scope="row">
                    <ChapterLink n={70}>Low Coupling</ChapterLink>
                  </th>
                  <td>モジュールの間のつながりは少なく弱いか</td>
                  <td>1974年の論文では、凝集を高めるのは結合を下げるための方法の1つ。期間の規則が集まると、ほかのクラスは StayPeriod の公開メソッドだけを知ればよくなる</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: '期間の計算を StayPeriod に集める',
      body: (
        <>
          <h3>直す順序</h3>
          <p>一度に全部を書き換えると、どの変更で結果が変わったかを追えなくなります。次の順に、小さな手順に分けて直します。</p>
          <ol>
            <li>規則を1文で書く。「泊まる夜は、チェックインの日以上、チェックアウトの日未満の日付」。この文が StayPeriod の先頭のコメントになります。</li>
            <li>境界の例を表にする。前に接する、後ろに接する、一部が重なる、全体を含む、内側、同じ期間、の6件です。</li>
            <li>StayPeriod を作り、表の6件をテストで確かめる。この時点では、ほかのコードは変えません。</li>
            <li>呼び出し側を1か所ずつ StayPeriod に置き換え、置き換えるたびにテストを実行する。請求書、ヘルパー、モデルの検証、空室検索の順にします。</li>
            <li>SQL で書く重なりの条件（スコープ）を作り、同じ6件の表で Ruby の判定と一致することを確かめる。</li>
            <li>泊数に使われなくなった <code>DateUtils.days_between</code> を、唯一の呼び出し側の Campaign に移す。</li>
          </ol>
          <h3>宿泊の期間を表すクラス</h3>
          <p>
            StayPeriod はチェックインとチェックアウトの2つの日付を持つ値オブジェクト（同じ値なら同じものとして扱い、作った後に変更しないオブジェクト）です。Ruby 3.2 で加わった <code>Data.define</code> で作ります<Ref n={9} /><Ref n={11} />。Data で作ったクラスは属性を書き換えるメソッドを持たないので、作った後で期間が変わることはありません。
          </p>
          <Code
            lang="ruby"
            title="app/models/stay_period.rb"
            code={`
# 宿泊の期間。check_in の日から泊まり、check_out の日の朝に部屋を出る。
# 泊まる夜は「check_in 以上、check_out 未満」の日付で表す（check_out の日の夜は含まない）。
StayPeriod = Data.define(:check_in, :check_out) do
  def initialize(check_in:, check_out:)
    unless check_in.is_a?(Date) && check_out.is_a?(Date) && check_in < check_out
      raise ArgumentError, "チェックアウトはチェックインより後の日にしてください"
    end

    super
  end

  # 泊まる夜の日付の範囲。... は終わりの値を含まない範囲
  def nights_range = check_in...check_out

  # 泊数
  def nights = (check_out - check_in).to_i

  # ほかの期間と、同じ夜を1つでも含むか
  def overlaps?(other) = nights_range.overlap?(other.nights_range)

  # その日の夜に泊まっているか
  def stays_on?(date) = nights_range.cover?(date)
end
`}
          />
          <p>
            境界の扱いは <code>nights_range</code> の1行に書きました。Ruby の範囲は、<code>..</code> なら終わりの値を含み、<code>...</code> なら含みません。<code>overlaps?</code> は Ruby 3.3 で加わった <code>Range#overlap?</code> を使い<Ref n={10} />、<code>stays_on?</code> は <code>Range#cover?</code> を使います。どちらも終わりの値を含まない範囲を正しく扱うので、比べる演算子（<code>{'<'}</code> か <code>{'<='}</code> か）を自分で選ぶ必要がありません。
          </p>
          <p>
            <code>initialize</code> では、チェックアウトがチェックインより後の日でなければ例外を投げます。正しくない期間の StayPeriod が存在しないので、ほかのメソッドは期間が正しいことを前提にできます。
          </p>
          <h3>モデル</h3>
          <p>
            Reservation は <code>period</code> で StayPeriod を返します。期間の正しさの検証は StayPeriod を作れるかで判定し、重なりの検証はスコープ <code>overlapping</code> を使います。
          </p>
          <Code
            lang="ruby"
            title="app/models/reservation.rb（直した後）"
            code={`
class Reservation < ApplicationRecord
  belongs_to :room

  validates :guest_name, :check_in, :check_out, presence: true
  validate :period_must_be_valid
  validate :must_not_overlap

  # 期間が重なる予約。StayPeriod#overlaps? と同じ規則を SQL で書いたもの
  # （相手のチェックインがこちらのチェックアウトより前で、相手のチェックアウトがこちらのチェックインより後）
  scope :overlapping, ->(period) { where("check_in < ? AND check_out > ?", period.check_out, period.check_in) }

  def period
    StayPeriod.new(check_in:, check_out:)
  end

  private

  def period_must_be_valid
    return if check_in.blank? || check_out.blank?

    period
  rescue ArgumentError => e
    errors.add(:base, e.message)
  end

  def must_not_overlap
    return if errors.any?

    errors.add(:base, "期間がほかの予約と重なっています") if Reservation.where(room_id:).where.not(id:).overlapping(period).exists?
  end
end
`}
          />
          <p>
            重なりの規則だけは Ruby の判定（<code>overlaps?</code>）と SQL の条件（<code>overlapping</code>）の2つの形で必要です。空室検索や保存の検証では、DB にある多くの予約から重なるものを探すので、すべての予約を読み込んで Ruby で比べるより、SQL で絞り込むほうが速いからです。2つの形が同じ規則を表していることは、後で同じ境界の例を両方に流すテストで確かめます。
          </p>
          <h3>呼び出し側</h3>
          <p>空室検索、ヘルパー、請求書は、期間の計算を自分で書かずに StayPeriod と overlapping を使います。</p>
          <Code
            lang="ruby"
            title="app/services/availability_search.rb・app/helpers/reservations_helper.rb・app/services/invoice_builder.rb（直した後）"
            code={`
# 指定した期間に空いている部屋を探す
class AvailabilitySearch
  def initialize(period)
    @period = period
  end

  def rooms
    Room.where.not(id: Reservation.overlapping(@period).select(:room_id)).order(:id)
  end
end

module ReservationsHelper
  # 予約の一覧と確認メールに出す「11/20〜11/22（2泊）」の表示
  def stay_label(period)
    "#{DateUtils.format_md(period.check_in)}〜#{DateUtils.format_md(period.check_out)}（#{period.nights}泊）"
  end

  # 空室カレンダーで、その日の夜に部屋がふさがっているか
  def booked_on?(room, date)
    room.reservations.any? { |r| r.period.stays_on?(date) }
  end
end

# 予約の請求額を計算する
class InvoiceBuilder
  def initialize(reservation)
    @reservation = reservation
  end

  def nights
    @reservation.period.nights
  end

  def total
    nights * @reservation.room.nightly_rate
  end
end
`}
          />
          <p>
            ヘルパーに残したのは、日付を「11/20」の形にする画面の表記だけです。泊数をどう数えるかはヘルパーの関心ではなくなりました。<code>stay_label</code> の引数は Reservation から StayPeriod に変えたので、予約以外の期間（たとえば検索の条件）も同じ表記で表示できます。
          </p>
          <h3>Campaign と DateUtils</h3>
          <p>
            <code>days_between</code> を使うのは Campaign だけになったので、数え方を Campaign の中に書き、DateUtils からは消しました。キャンペーンの数え方は最終日を含むので、<code>..</code> の範囲を使います。
          </p>
          <Code
            lang="ruby"
            title="app/models/campaign.rb（直した後）"
            code={`
class Campaign < ApplicationRecord
  # 「11/1〜11/30 の30日間」の表示に使う。.. は終わりの値を含む範囲
  def days
    (starts_on..ends_on).count
  end
end
`}
          />
          <p>
            宿泊は <code>...</code>、キャンペーンは <code>..</code> と、数え方の違いがそれぞれのクラスの1行に現れました。DateUtils に残った <code>format_md</code>・<code>weekend?</code>・<code>fiscal_year</code> も、使う側が1つに決まった時点で使う側に移せます。この章では期間に関係するものだけを移し、残りは扱いません。
          </p>
          <h3>境界の例を Ruby と SQL の両方に流すテスト</h3>
          <p>
            境界の例の表を spec/support に置き、StayPeriod の spec と Reservation の spec の両方から読み込みます。表を1か所に置くことで、規則の例も1か所にまとまります。
          </p>
          <Code
            lang="ruby"
            title="spec/support/overlap_cases.rb"
            code={`
# 既存の予約 11/20〜11/22 に対して、別の期間（11/from〜11/to）が重なるか。境界の例を集めた表。
# StayPeriod#overlaps? と Reservation.overlapping の両方の spec で使う
OVERLAP_CASES = [
  [18, 20, false], # 前に接する（相手が 11/20 の朝に出る）
  [22, 24, false], # 後ろに接する（相手が 11/22 に入る）
  [21, 23, true],  # 後ろ半分が重なる
  [19, 23, true],  # 全体を含む
  [20, 21, true],  # 内側
  [20, 22, true],  # 同じ期間
].freeze
`}
          />
          <Code
            lang="ruby"
            title="spec/models/stay_period_spec.rb と spec/models/reservation_spec.rb（抜粋）"
            code={`
# spec/models/stay_period_spec.rb
OVERLAP_CASES.each do |from, to, expected|
  it "11/20〜11/22 と 11/#{from}〜11/#{to} の overlaps? は #{expected}" do
    expect(period(20, 22).overlaps?(period(from, to))).to eq expected
  end
end

# spec/models/reservation_spec.rb（before で 11/20〜11/22 の予約を保存しておく）
OVERLAP_CASES.each do |from, to, expected|
  it "11/#{from}〜11/#{to} の overlapping は overlaps? と同じ #{expected}" do
    expect(Reservation.overlapping(period(from, to)).exists?).to eq expected
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/stay_period_spec.rb spec/models/reservation_spec.rb --format documentation）"
            code={`
Reservation
  11/18〜11/20 の overlapping は overlaps? と同じ false
  11/22〜11/24 の overlapping は overlaps? と同じ false
  11/21〜11/23 の overlapping は overlaps? と同じ true
  11/19〜11/23 の overlapping は overlaps? と同じ true
  11/20〜11/21 の overlapping は overlaps? と同じ true
  11/20〜11/22 の overlapping は overlaps? と同じ true
  チェックアウトの日から始まる予約は保存できる
  重なる予約は保存できない
  チェックアウトがチェックイン以前なら保存できない

StayPeriod
  泊数は check_out の日を数えない
  11/20〜11/22 と 11/18〜11/20 の overlaps? は false
  11/20〜11/22 と 11/22〜11/24 の overlaps? は false
  11/20〜11/22 と 11/21〜11/23 の overlaps? は true
  11/20〜11/22 と 11/19〜11/23 の overlaps? は true
  11/20〜11/22 と 11/20〜11/21 の overlaps? は true
  11/20〜11/22 と 11/20〜11/22 の overlaps? は true
  check_in の日の夜は泊まり、check_out の日の夜は泊まらない
  チェックアウトがチェックイン以前の期間は作れない

Finished in 0.13742 seconds (files took 1.09 seconds to load)
18 examples, 0 failures
`}
          />
          <h3>同じ場面を動かす</h3>
          <p>場面の節と同じスクリプトを、StayPeriod を使うように書き換えて実行しました。最後に、重なる予約が保存できないことも確かめています。</p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb、直した後）"
            code={`
① 予約の一覧の表示: 11/20〜11/22（2泊）
② 請求書: 2泊 × 18,000円 = 36,000円
③ 空室検索（11/22〜11/24）: ["離れ 桜"]
④ 空室カレンダーで 11/22 の夜はふさがっているか: false
⑤ 11/22〜11/24 の予約の保存: true []
⑥ 11/23〜11/25 の予約の保存: false ["期間がほかの予約と重なっています"]
`}
          />
          <p>一覧と請求書の泊数がそろい、検索で空室と出た部屋を予約でき、カレンダーも 11/22 を空きと表示しました。キャンペーンの spec を含め、アプリのすべてのテスト（23件）が通っています。</p>
          <h3>規則が書かれている行を数え直す</h3>
          <p>場面の節と同じ grep に、<code>overlap?</code> と <code>cover?</code> の行と範囲を作る行を加えて実行しました。</p>
          <Code
            lang="text"
            title={'実行結果（grep -rnE "check_(in|out) *(<|>|-)|check_(in|out) [<>]=? \\?|days_between\\(r|\\.\\.\\.check_out|overlap\\?|cover\\?" app）'}
            code={`
app/models/reservation.rb:10:  scope :overlapping, ->(period) { where("check_in < ? AND check_out > ?", period.check_out, period.check_in) }
app/models/stay_period.rb:5:    unless check_in.is_a?(Date) && check_out.is_a?(Date) && check_in < check_out
app/models/stay_period.rb:13:  def nights_range = check_in...check_out
app/models/stay_period.rb:16:  def nights = (check_out - check_in).to_i
app/models/stay_period.rb:19:  def overlaps?(other) = nights_range.overlap?(other.nights_range)
app/models/stay_period.rb:22:  def stays_on?(date) = nights_range.cover?(date)
`}
          />
          <p>
            行の数は6行のままですが、ファイルは4つから2つになり、解釈は1通りになりました。図 50-5 は直す前と後で規則を書いている場所を比べたものです。日帰りの利用を受け付けるなど境界の扱いを変えるときに読むのは、StayPeriod と overlapping のスコープ、それと境界の例の表です。
          </p>
          <Figure n="50-5" title="直す前と後：期間の規則を書いている場所" caption="行数は grep の結果から数えた。実線の矢印は呼び出し、破線の矢印は境界の例の表を使うテスト。">
            <BeforeAfterFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '分けすぎと集めすぎ',
      body: (
        <>
          <p>
            高凝集を目指して手を加えすぎると、2つの方向に失敗します。1つは、機能的凝集を「1クラスに1メソッド」と解釈して細かく分けすぎることです。もう1つは、同じデータを使う処理を何でも1つのクラスに集めることです。
          </p>
          <h3>計算ごとにクラスを分ける</h3>
          <p>
            「1つのクラスは1つの機能だけを持つべきだ」と考えて、泊数・重なり・検証を別々のクラスにした例です。後から別の担当者がある日に泊まっているかを判定するクラスを足しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/overdone/*.rb（分けすぎた例）"
            code={`
module Overdone
  # 泊数を求める
  class StayNightsCalculator
    def call(check_in, check_out) = (check_out - check_in).to_i
  end

  # 2つの期間が重なるか
  class OverlapChecker
    def call(a_in, a_out, b_in, b_out) = a_in < b_out && b_in < a_out
  end

  # チェックアウトがチェックインより後か
  class StayPeriodValidator
    def call(check_in, check_out) = check_in < check_out
  end

  # その日に泊まっているか（後から別の担当者が足したクラス）
  class OccupancyChecker
    def call(check_in, check_out, date) = (check_in..check_out).cover?(date)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/overdone.rb）"
            code={`
泊数: 2
11/22〜11/24 と重なるか: false
11/22 の夜に泊まっているか: true
StayPeriod#stays_on?(11/22): false
`}
          />
          <p>
            どのクラスも1つの機能しか持たず、1文で説明できます。それでも、後から足した OccupancyChecker は <code>..</code>（終わりを含む範囲）を使ったので、11/22 の夜を泊まっていると判定しました。場面の節の <code>booked_on?</code> と同じ誤りです。
          </p>
          <p>
            原因は、「チェックアウトの日の夜は含まない」という規則を書く場所が、どのクラスにも無いことです。4つのクラスがそれぞれ自分の比べ方で規則を書き直しています。クラスを細かく分けた結果、規則は再び4つのファイルに散らばりました。関連性の高い処理を同じモジュールにまとめるという原則から見ると、これは凝集が上がったのではなく、下がっています。
          </p>
          <p>
            1974年の論文も機能的な部分機能をどこまで分けるかは未解決の問題だとしたうえで、目安として、モジュールの中に単独で役に立つ要素の組が無いこと、モジュールの全体を一度に理解できる大きさ（ソースで1〜2ページ程度）であることを挙げています<Ref n={1} />。StayPeriod の nights_range は単独では使い道が少なく、ほかのメソッドと一緒にあって初めて役に立つ要素なので、分けない理由になります。
          </p>
          <h3>同じ列を使う処理を何でも集める</h3>
          <p>
            反対に、「期間に関係するものは StayPeriod に」と考えて、check_in・check_out を使う処理をすべて入れた場合です。
          </p>
          <Code
            lang="ruby"
            title="集めすぎた StayPeriod（説明用。この章のアプリには入れていない）"
            code={`
StayPeriod = Data.define(:check_in, :check_out) do
  def nights_range = check_in...check_out
  def nights = (check_out - check_in).to_i
  def overlaps?(other) = nights_range.overlap?(other.nights_range)

  # 料金：部屋・週末の割増・キャンペーンを知る必要がある
  def price_for(room, campaigns: Campaign.active)
    nights_range.sum { |d| room.nightly_rate * (DateUtils.weekend?(d) ? 1.2 : 1.0) } - campaigns.sum(&:discount)
  end

  # キャンセル料：キャンセルの規定と現在時刻を知る必要がある
  def cancel_fee(total, today: Date.current) = (check_in - today).to_i <= 1 ? total : 0

  # 確認メールの本文：画面の文言と I18n を知る必要がある
  def mail_text(guest_name) = I18n.t("reservations.mail", name: guest_name, nights:)
end
`}
          />
          <p>
            どのメソッドも check_in と check_out を使うので、1974年の分類では通信的凝集にあたります。しかし、変える理由はばらばらです。料金は料金表と割増の規定が変わるとき、キャンセル料はキャンセルの規定が変わるとき、メールの本文は文言が変わるときに直します。StayPeriod のテストには部屋・キャンペーン・I18n の準備が必要になり、期間の規則とは関係のない変更で StayPeriod を開くことになります。
          </p>
          <p>
            料金やキャンセル料の置き場所は、StayPeriod を受け取って使う側（料金の計算のクラス、キャンセルの規定のクラス）です。期間の規則（何泊か、どの夜か）は StayPeriod に聞き、料金の規則は料金のクラスが持つ、という分け方です。
          </p>
          <h3>判断の目安</h3>
          <p>
            Yourdon と Constantine は、高凝集が「良い」、偶然的凝集が「悪い」という白黒の規則を引き出すべきではないと書いています。凝集を下げる代わりに、実行の速さやメモリー、作業の分けやすさを得られる場合があり、設計者はその損得を比べる必要がある、という立場です<Ref n={2} />。この章では次の2つの問いで判断します。
          </p>
          <ul>
            <li>同じ規則（知識）に頼っているか。同じ列を読むかではなく、「チェックアウトの日の夜は含まない」のような同じ判断を使うかを見ます。</li>
            <li>変える理由が同じか。誰の、どんな要求で変わるかを考えます。</li>
          </ul>
          <p>図 50-6 は2つの問いの答えの組み合わせと、それぞれの置き方です。</p>
          <Figure n="50-6" title="集める・分けるの判断" caption="2つの軸はこの章で定めた目安。右上を分けると分けすぎ、右下を集めると集めすぎになる。">
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
                  <td>同じ比較や計算が、複数のクラスに少しずつ違う形で書かれている</td>
                  <td>関連する処理が散らばっている（凝集が低い）</td>
                  <td>規則を1文で書き、その規則を持つクラスに集める</td>
                </tr>
                <tr>
                  <td>1メソッドだけのクラスが並び、どれも同じ引数の組（check_in, check_out）を受け取る</td>
                  <td>分けすぎ。引数の組がまだ名前の無い概念を表している</td>
                  <td>引数の組を値オブジェクトにし、メソッドをそこに移す</td>
                </tr>
                <tr>
                  <td>クラスのテストに、そのクラスの規則と関係のない準備（DB・I18n・現在時刻）が要る</td>
                  <td>集めすぎ。変える理由の違う処理が入っている</td>
                  <td>その処理を、値オブジェクトを受け取る側のクラスに移す</td>
                </tr>
                <tr>
                  <td>utils・helpers・common のような名前のモジュールが大きくなる</td>
                  <td>論理的凝集か偶然的凝集</td>
                  <td>メソッドごとに呼び出し側を調べ、使う側が1つなら使う側に移す</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能・規約と凝集',
      body: (
        <>
          <h3>Active Record のモデルは、データとその振る舞いを1か所に置く</h3>
          <p>
            Rails のモデルが使う Active Record パターンは、Martin Fowler の定義では「DB のテーブルかビューの1行を表し、DB へのアクセスをカプセル化し、そのデータにドメインのロジックを加えるオブジェクト」です<Ref n={4} />。行のデータと、そのデータに関する振る舞いを同じクラスに置くので、テーブルの1行に関する規則（予約の検証、関連、スコープ）を集める場所が最初から決まっています。
          </p>
          <p>
            Rails Doctrine の「No one paradigm」の項は、concern（モデルの振る舞いを分けて書くためのモジュール）でモデルの公開範囲が広くなることを認めたうえで、concern のメソッドが扱うデータと保存先に直接触れられる点が Active Record パターンに合っていると述べています<Ref n={5} />。データの近くに振る舞いを置くという点で、Rails の既定の書き方は凝集を高める方向にあります。
          </p>
          <p>
            一方で、テーブルの列を使う処理をすべてモデルに入れると、overuse の節の「集めすぎた StayPeriod」と同じことがモデルで起きます。Reservation に料金表示・メール本文・CSV の列を入れていくと、変える理由の違う処理が1つのクラスに集まります。この章では、テーブルの列ではなく「宿泊の期間」という概念で StayPeriod を切り出しました。
          </p>
          <h3>ヘルパーは既定ですべてのビューに読み込まれる</h3>
          <p>
            Rails の既定では、コントローラーは app/helpers にあるすべてのヘルパーを読み込みます。ActionController::Helpers のドキュメントには「既定で、各コントローラーはすべてのヘルパーを含む」と書かれていて<Ref n={6} />、railtie の初期化の処理が <code>include_all_helpers</code> が true のときに <code>helper :all</code> を呼びます<Ref n={7} />。
          </p>
          <p>
            このため、reservations_helper.rb に書いたメソッドは、予約の画面だけでなくすべての画面から呼べます。ファイル名は「予約のヘルパー」でも、Ruby から見ると app/helpers 全体が1つの大きなモジュールです。ヘルパーに業務の計算（泊数）を書くと、ほかの画面の担当者がその計算を見つけて別の意味で使う、という場面の節と同じことが起きやすくなります。ヘルパーには表示の整形を置き、業務の規則はモデルや値オブジェクトに置くのが、Rails の既定の動きに合った分け方です。<code>config.action_controller.include_all_helpers = false</code> にすると、コントローラーと同じ名前のヘルパーだけを読み込む以前の動きに戻せます<Ref n={6} />。
          </p>
          <h3>concern で分けるときの基準</h3>
          <p>
            Rails Doctrine の「Provide sharp knives」の項は、concern を「1つのクラスに、関連しているが独立して理解できる複数の関心事を入れるためのもの」と説明しています。同時に、concern が関係の薄いメソッドを詰め込む場所として使われうることも認めています<Ref n={5} />。
          </p>
          <p>
            concern を「Validations」「Callbacks」「Scopes」のように Rails の機能の種類で分けると、それぞれの concern は論理的凝集になります。1つの規則（たとえば予約の期間）を変えるには、すべての concern を開くことになります。concern は「論理削除できる」「公開の予約ができる」のように、1つの概念を単位にして分けると、中の検証・コールバック・スコープが同じ理由で変わるものになります。concern の書き方は<ChapterLink n={31} section="concern" />を参照してください。
          </p>
          <h3>値オブジェクトの置き場所</h3>
          <p>
            StayPeriod は DB のテーブルを持たない Ruby のクラスですが、app/models に置きました。Rails の既定では、app の下のディレクトリ（assets・javascript・views を除く）がオートロードの対象なので、app/models に置いたクラスは require を書かずに使えます<Ref n={13} />。DateUtils を置いた app/lib も同じです。Active Record には、列の組を値オブジェクトとして読み書きする <code>composed_of</code> もあります。ソースのコメントは、値オブジェクトを変更不可として扱い、値を変えるときは新しいオブジェクトを作るように求めています<Ref n={8} />。この章では、期間を作れない値（チェックアウトがチェックイン以前）を検証のエラーにしたかったので、<code>period</code> メソッドで StayPeriod を作る書き方にしました。
          </p>
          <Callout kind="v72">
            <p>
              <code>Data.define</code> は Ruby 3.2 で加わったクラスです<Ref n={11} />。Rails 7.2 は Ruby 3.1 以上で動くので（7.2.2.1 の gem の required_ruby_version で確認）、Ruby 3.1 のアプリでは Data を使えません。その場合は、属性の読み取りだけを公開し、initialize の最後で <code>freeze</code> を呼ぶ普通のクラスで同じものを書けます。
            </p>
            <p>
              <code>Range#overlap?</code> は Ruby 3.3 で加わりました<Ref n={10} />。Active Support は、Ruby に <code>overlap?</code> が無いときに同じメソッドを定義します<Ref n={12} />。Rails 7.2.2.1 の Active Support にも同じ定義があることを、gem のソースで確かめました。Rails 7.2 なら Ruby 3.2 以前でも、この章の <code>overlaps?</code> はそのまま動きます。
            </p>
          </Callout>
          <h3>Rails のコードを置く場所と凝集</h3>
          <p>図 50-7 は、Rails で処理を置く主な場所と、それぞれで凝集が下がりやすい使い方をまとめたものです。</p>
          <Figure n="50-7" title="Rails でコードを置く場所と凝集" caption="「まとまりの単位」は、その場所に置くものを決める基準。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">置き場所</th>
                    <th scope="col">まとまりの単位</th>
                    <th scope="col">この章の例</th>
                    <th scope="col">凝集が下がる使い方</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">モデル（Active Record）</th>
                    <td>1つのテーブルの行と、その行に関する規則</td>
                    <td>Reservation の検証・overlapping</td>
                    <td>画面の文言や外部 API の呼び出しまで入れる</td>
                  </tr>
                  <tr>
                    <th scope="row">値オブジェクト（app/models の Data・PORO）</th>
                    <td>1つの値と、その値の規則</td>
                    <td>StayPeriod</td>
                    <td>同じ列を使う処理を何でも入れる</td>
                  </tr>
                  <tr>
                    <th scope="row">サービス（app/services）</th>
                    <td>1つの業務の操作</td>
                    <td>AvailabilitySearch・InvoiceBuilder</td>
                    <td>値の規則（泊数・重なり）をサービスごとに書き直す</td>
                  </tr>
                  <tr>
                    <th scope="row">concern</th>
                    <td>モデルの、独立して理解できる一部の振る舞い</td>
                    <td>（この章では使っていない）</td>
                    <td>Validations・Callbacks のように機能の種類で分ける</td>
                  </tr>
                  <tr>
                    <th scope="row">ヘルパー</th>
                    <td>ビューでの表示の整形</td>
                    <td>stay_label の表記</td>
                    <td>業務の計算を置く（既定ですべてのビューから呼べる）</td>
                  </tr>
                  <tr>
                    <th scope="row">utils（app/lib・lib）</th>
                    <td>特定の業務に依存しない処理</td>
                    <td>DateUtils.format_md</td>
                    <td>業務の規則を置く。使う側が1つの処理を置く</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <h3>本書のほかの章</h3>
          <ul>
            <li>
              値オブジェクトの作り方と使いどころは、<ChapterLink n={33} section="value-objects" />と、MSDP の<ChapterLink n={46} />で詳しく扱っています。
            </li>
            <li>
              モデルにどこまで書くかの判断は<ChapterLink n={30} section="fat-model" />、モデルの境界は<ChapterLink n={30} section="model-boundaries" />を参照してください。
            </li>
            <li>
              変える理由で分ける見方は<ChapterLink n={63} />（SRP）、関心事の種類で分ける見方は<ChapterLink n={68} />（SoC）で扱います。
            </li>
            <li>
              凝集を高めることで下がるモジュールの間のつながりは、次の<ChapterLink n={70} />（Low Coupling）で、コードから数えた依存のグラフを使って扱います。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <>
          <ul>
            <li>High Cohesion は、関連性の高い処理やデータを同じモジュールにまとめ、モジュールの責務を明確にする原則です。凝集は、モジュールの中の要素がどれだけ同じ目的に結び付いているかの度合いです。</li>
            <li>凝集は1974年の論文「Structured Design」で binding として定義され、偶然的・論理的・時間的・通信的・逐次的・機能的の6段階に分けられました。1978年の本で手順的が加わり7段階になりました。</li>
            <li>論文は、凝集を高めるのは結合を下げるためだと位置づけています。高凝集と疎結合は、モジュールの間の関係を減らすという同じ目的の両面です。</li>
            <li>モジュールの目的を1文で書き、読点・複数の動詞・時間を表す語・特定の目的語の欠如を調べると、凝集の段階を見積もれます。</li>
            <li>宿の予約の例では、境界の扱いを StayPeriod の nights_range の1行に集め、SQL の条件は同じ境界の例の表で一致を確かめました。規則のある場所は4ファイルから2ファイルに、解釈は3通りから1通りになりました。</li>
            <li>1メソッドずつのクラスに分けると規則が再び散らばり、同じ列を使う処理を集めると変える理由の違う処理が混ざります。「同じ規則に頼るか」と「変える理由が同じか」の2つで判断します。</li>
            <li>Rails のヘルパーは既定ですべてのビューに読み込まれるので、業務の計算を置くと別の意味で使われやすくなります。業務の規則はモデルや値オブジェクトに置き、ヘルパーには表示の整形を置きます。</li>
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
      note: 'binding を凝集性の尺度とする定義、凝集を高めるのは結合を下げるためという位置づけ、6つの段階とその説明、尺度が等間隔でないこと、偶然的凝集が重複コードの集約で生じる例、論理的凝集の「すべてのデータを検査する」例、1文で説明する検査、分割をどこまで進めるかの目安、Constantine の約10年の研究の成果であること。',
    },
    {
      title: 'Structured Design: Fundamentals of a Discipline of Computer Program and Systems Design',
      publisher: 'Edward Yourdon, Larry L. Constantine / Yourdon Press（Internet Archive の書誌）',
      url: 'https://archive.org/details/structureddesign00edwa',
      accessed: '2026-11-21',
      version: '1978年（ISBN 0-917072-11-1）。第7章 Cohesion',
      note: '凝集の7つの段階（手順的を加えたもの）、最初の研究が1964〜1965年に Constantine によって行われたという注、最初の3つは受け入れにくく最後の3つは受け入れられる水準とする評価、高凝集を白黒の規則にしないという第7章のまとめ。',
    },
    {
      title: 'Reliable Software Through Composite Design',
      publisher: 'Glenford J. Myers / Petrocelli/Charter（Internet Archive の書誌）',
      url: 'https://archive.org/details/reliablesoftware00myer',
      accessed: '2026-11-21',
      version: '1975年。第3章 Module Strength',
      note: 'module strength の7つの段階（機能的・情報的・通信的・手順的・古典的・論理的・偶然的）、情報的強度の定義と記号表の例、情報隠蔽に基づくこと、複数の機能が絡み合う危険。',
    },
    {
      title: 'Active Record（Patterns of Enterprise Application Architecture のカタログ）',
      publisher: 'martinfowler.com / Martin Fowler',
      url: 'https://martinfowler.com/eaaCatalog/activeRecord.html',
      accessed: '2026-11-21',
      note: 'Active Record パターンの定義（テーブルかビューの1行を表し、DB へのアクセスをカプセル化し、そのデータにドメインのロジックを加える）。',
    },
    {
      title: 'The Rails Doctrine',
      publisher: 'rubyonrails.org / David Heinemeier Hansson',
      url: 'https://rubyonrails.org/doctrine',
      accessed: '2026-11-21',
      note: '「No one paradigm」での concern と Active Record パターンの関係、「Provide sharp knives」での concern の説明と詰め込みの危険。',
    },
    {
      title: 'actionpack/lib/action_controller/metal/helpers.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/actionpack/lib/action_controller/metal/helpers.rb#L8-L25`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.4.1',
      note: '既定で各コントローラーがすべてのヘルパーを含むこと、include_all_helpers = false で以前の動きに戻せること。include_all_helpers の既定値 true は同じファイルの71行目。',
    },
    {
      title: 'actionpack/lib/action_controller/railties/helpers.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/actionpack/lib/action_controller/railties/helpers.rb#L20-L22`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.4.1',
      note: 'ActionController::Base を直接継承するコントローラーで、include_all_helpers が true なら helper :all を呼ぶこと。',
    },
    {
      title: 'activerecord/lib/active_record/aggregations.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/aggregations.rb#L112-L125`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.4.1',
      note: 'composed_of で使う値オブジェクトは変更不可として扱い、値を変えるときは新しいオブジェクトを作ること。',
    },
    {
      title: 'class Data',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/Data.html',
      accessed: '2026-11-21',
      note: 'Data.define で値のようなオブジェクトのクラスを作れること、属性を書き換えるメソッドを持たないこと。initialize をキーワード引数で上書きできることは Ruby 4.0.9 で実行して確認した。',
    },
    {
      title: 'class Range（overlap?・cover?）',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/Range.html',
      accessed: '2026-11-21',
      note: 'overlap? と cover? の動作。Ruby 3.3 で overlap? が加わったことは Ruby 3.3 の NEWS（https://docs.ruby-lang.org/en/3.3/NEWS_md.html）で確認した。',
    },
    {
      title: 'NEWS for Ruby 3.2.0',
      publisher: 'Ruby 3.2 Documentation',
      url: 'https://docs.ruby-lang.org/en/3.2/NEWS_md.html',
      accessed: '2026-11-21',
      note: 'Data が Ruby 3.2 で新しいコアのクラスとして加わったこと。',
    },
    {
      title: 'activesupport/lib/active_support/core_ext/range/overlap.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activesupport/lib/active_support/core_ext/range/overlap.rb#L3-L40`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.4.1（7.2.2.1 の gem でも同じ定義があることを確認）',
      note: 'Ruby に overlap? が無いときに Active Support が overlap? を定義し、overlaps? を別名にすること。',
    },
    {
      title: 'Autoloading and Reloading Constants',
      publisher: 'Rails Guides',
      url: 'https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html',
      accessed: '2026-11-21',
      version: 'Rails 8.1',
      note: '既定のオートロードの対象が、起動時にある app の下のディレクトリ（assets・javascript・views を除く）であること。',
    },
  ],
}

export default chapter
