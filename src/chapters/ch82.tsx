import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 80-1 外部のデータを受け取る2つの処理と、問題が起きる箇所 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="80-1"
      w={780}
      h={420}
      label="左に外部の送り手、中央にアプリの処理、右に MySQL のテーブルを並べた。配送業者は配達状況の通知を JSON で POST /webhooks/carrier に送り、CarrierWebhooksController#create が params の data の delivered_at を Time.zone.parse で時刻にして shipments を更新する。送り主の分からない署名なしの要求も、同じアクションに届く。仕入れ先は Excel で作った在庫数の CSV を毎朝送り、StockImport.call が stock の列を to_i で整数にして products を更新する。問題1は、置き配の通知に delivered_at が無く TypeError で 500 になること。問題2は、送り主を確かめずに配達済みにすること。問題3は、全角の１２０と空欄の在庫数が 0 になること"
    >
      <T x={20} y={18} bold>
        外部の送り手
      </T>
      <T x={290} y={18} bold>
        アプリ
      </T>
      <T x={600} y={18} bold>
        MySQL
      </T>
      <Box x={20} y={40} w={200} h={56} lines={['配送業者', '配達状況の通知（JSON）']} fs={12} fill="box4" bold subTone="muted" />
      <Box x={20} y={130} w={200} h={48} lines={['送り主の分からない要求', '署名なし']} fs={12} fill="none" dashed bold subTone="muted" />
      <Box x={20} y={280} w={200} h={56} lines={['仕入れ先', '在庫数の CSV（Excel で作る）']} fs={12} fill="box4" bold subTone="muted" />
      <T x={226} y={50} fs={10} tone="acc">
        POST /webhooks/carrier
      </T>
      <Arrow x1={220} y1={68} x2={288} y2={90} accent />
      <Arrow x1={220} y1={154} x2={288} y2={132} />
      <T x={232} y={300} fs={10} tone="acc">
        毎朝
      </T>
      <Arrow x1={220} y1={308} x2={288} y2={308} accent />
      <Box
        x={290}
        y={60}
        w={260}
        h={96}
        lines={['CarrierWebhooksController#create', 'params[:data][:delivered_at]', 'Time.zone.parse(…)', 'update!(status: "delivered")']}
        fs={12}
        bold
        subTone="muted"
      />
      <Box x={290} y={270} w={260} h={76} lines={['StockImport.call', 'row["stock"].to_i', 'update!(stock: …)']} fs={12} bold subTone="muted" />
      <Arrow x1={550} y1={108} x2={598} y2={108} />
      <Arrow x1={550} y1={308} x2={598} y2={308} />
      <Box x={600} y={78} w={160} h={60} lines={['shipments', 'status・delivered_at']} fs={12} fill="box4" bold subTone="muted" />
      <Box x={600} y={278} w={160} h={60} lines={['products', 'sku・stock']} fs={12} fill="box4" bold subTone="muted" />
      <T x={290} y={182} fs={12} tone="danger">
        問題1：置き配の通知は delivered_at が無く、TypeError で 500
      </T>
      <T x={290} y={204} fs={12} tone="danger">
        問題2：送り主を確かめずに、配達済みにする
      </T>
      <T x={290} y={372} fs={12} tone="danger">
        問題3：「１２０」と空欄の在庫数が 0 になる
      </T>
      <T x={20} y={406} fs={11} tone="muted">
        緑の箱は外部の会社と MySQL のテーブル。破線の箱は、送り主が分からない要求。青い矢印は取り決めどおりの送り手からの入力
      </T>
    </Svg>
  )
}

/* ---------- 図 80-2 置き配の通知が送り直されるたびに 500 になる ---------- */
const retryRows = [
  { time: '10:30', label: 'evt_1001（配達完了）', status: '200', report: '' },
  { time: '10:40', label: 'evt_1002（置き配）', status: '500', report: '報告 1件目' },
  { time: '10:41', label: '送り直し（1分後）', status: '500', report: '報告 2件目' },
  { time: '10:50', label: '送り直し（10分後）', status: '500', report: '報告 3件目' },
  { time: '11:40', label: '送り直し（1時間後）', status: '500', report: '報告 4件目' },
  { time: '16:40', label: '送り直し（6時間後）', status: '500', report: '報告 5件目' },
  { time: '11/23 10:40', label: '送り直し（24時間後）', status: '500', report: '報告 6件目' },
]

function RetryFigure() {
  const ry = (i: number) => 92 + i * 40
  return (
    <Svg
      id="80-2"
      w={780}
      h={420}
      label="縦に時間、列に配送業者・アプリ・Rails.error を並べたタイムライン。11月22日10時30分の evt_1001（配達完了）は 200。10時40分の evt_1002（置き配）は 500 になり、TypeError が Rails.error に報告される。配送業者は1分後、10分後、1時間後、6時間後、24時間後に同じ通知を送り直し、どれも 500 になって、同じ原因の報告が合わせて6件届く。送り直しが終わっても、追跡番号 7300-0002 の発送は shipped のまま残る"
    >
      <Box x={20} y={20} w={180} h={36} lines="配送業者" fs={12} fill="box4" bold />
      <Box x={300} y={20} w={200} h={36} lines="アプリ（/webhooks/carrier）" fs={12} bold />
      <Box x={570} y={20} w={190} h={36} lines="Rails.error（担当者）" fs={12} bold />
      <line x1={110} y1={56} x2={110} y2={350} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={400} y1={56} x2={400} y2={350} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={665} y1={56} x2={665} y2={350} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {retryRows.map((r, i) => (
        <g key={r.time}>
          <T x={20} y={ry(i) - 14} fs={10} tone="muted">
            {r.time}
          </T>
          <T x={255} y={ry(i) - 10} anchor="middle" fs={10}>
            {r.label}
          </T>
          <Arrow x1={112} y1={ry(i)} x2={398} y2={ry(i)} accent={i === 0} />
          <T x={408} y={ry(i) + 4} fs={11} bold tone={r.status === '200' ? 'acc' : 'danger'}>
            {r.status}
          </T>
          {r.report && (
            <>
              <Arrow x1={440} y1={ry(i)} x2={663} y2={ry(i)} />
              <T x={552} y={ry(i) - 10} anchor="middle" fs={10} tone="danger">
                {`TypeError を${r.report}`}
              </T>
            </>
          )}
        </g>
      ))}
      <T x={20} y={378} fs={12} tone="danger">
        送り直しが終わっても、7300-0002 は shipped のまま。報告は同じ原因で6件届き、通知そのものは残らない
      </T>
      <T x={20} y={402} fs={11} tone="muted">
        送り直しの間隔は、この章で想定した配送業者の仕様。時刻は 11月22日（最後の行だけ 11月23日）
      </T>
    </Svg>
  )
}

/* ---------- 図 80-3 信頼の境界 ---------- */
const outsiders = [
  { lines: '配送業者の Webhook', dashed: false },
  { lines: '仕入れ先の CSV', dashed: false },
  { lines: '利用者のフォーム・API', dashed: false },
  { lines: '送り主の分からない要求', dashed: true },
]
const checks = ['① 送り主（署名）', '② 形（必要な項目）', '③ 型（文字列 → 数値・日時）', '④ 値（形式・範囲）', '⑤ 業務の条件（発送があるか）']

function BoundaryFigure() {
  return (
    <Svg
      id="80-3"
      w={780}
      h={400}
      label="左は境界の外で、配送業者の Webhook、仕入れ先の CSV、利用者のフォームや API、送り主の分からない要求が並ぶ。どれも内容を保証できない。中央の紫の帯が信頼の境界で、送り主（署名）、形（必要な項目）、型（文字列から数値や日時へ）、値（形式と範囲）、業務の条件（発送があるか）の順に確かめ、通らなければ断るか記録する。右は境界の内側で、モデルとサービスは確かめた値だけを扱い、前提が成り立たなければ例外にする。MySQL は NOT NULL、CHECK 制約、一意索引で最後に拒否する。社内の別のシステムや取引先から届くデータも、この境界を越えるなら外のデータとして扱う"
    >
      <T x={20} y={18} bold>
        境界の外：内容を保証できない
      </T>
      {outsiders.map((o, i) => (
        <g key={o.lines}>
          <Box x={20} y={44 + i * 52} w={220} h={36} lines={o.lines} fs={12} fill={o.dashed ? 'none' : 'box4'} dashed={o.dashed} />
          <Arrow x1={240} y1={62 + i * 52} x2={268} y2={62 + i * 52} />
        </g>
      ))}
      <Box x={270} y={30} w={212} h={240} fill="box5" dashed />
      <T x={376} y={52} anchor="middle" bold>
        信頼の境界
      </T>
      {checks.map((c, i) => (
        <T key={c} x={284} y={86 + i * 30} fs={12}>
          {c}
        </T>
      ))}
      <T x={376} y={252} anchor="middle" fs={11} tone="acc">
        通らなければ、断る・記録する
      </T>
      <T x={500} y={18} bold>
        境界の内側：確かめた値だけを扱う
      </T>
      <Arrow x1={482} y1={96} x2={498} y2={96} accent />
      <Box x={500} y={64} w={260} h={64} lines={['モデル・サービス', '前提が成り立たなければ例外（Fail Fast）']} fs={12} bold subTone="muted" />
      <Arrow x1={630} y1={128} x2={630} y2={170} />
      <Box x={500} y={172} w={260} h={64} lines={['MySQL', 'NOT NULL・CHECK 制約・一意索引']} fs={12} fill="box4" bold subTone="muted" />
      <T x={20} y={310} fs={12}>
        外では、誤りが混ざっている前提で確かめ、通らないものを断るか記録する
      </T>
      <T x={20} y={334} fs={12}>
        内側では、確かめた前提で書き、前提が成り立たなければプログラムの誤りとして例外にする
      </T>
      <T x={20} y={378} fs={11} tone="muted">
        社内の別のシステムや取引先から届くデータも、この境界を越えるなら外のデータとして扱う（OWASP の Input Validation Cheat Sheet）
      </T>
    </Svg>
  )
}

/* ---------- 図 80-4 外部の入力を確かめる場所と順序 ---------- */
type Step = { head: string; sub: string; out: string[]; inside?: boolean }
const webhookSteps: Step[] = [
  { head: '① 送り主', sub: '署名を確かめる', out: ['401'] },
  { head: '② 構文', sub: 'JSON として読む', out: ['400'] },
  { head: '③ 形', sub: 'params.expect', out: ['400'] },
  { head: '④ 記録', sub: 'CarrierEvent', out: ['再送なら', '記録済みの行'] },
  { head: '⑤ 値・業務', sub: 'DeliveryNotice', out: ['rejected と', '理由（200）'] },
  { head: '⑥ 処理', sub: 'deliver!', out: ['例外は', '500・報告'], inside: true },
]
const csvSteps: Step[] = [
  { head: '① 文字コード', sub: 'bom|utf-8 で読む', out: ['ファイルごと', '断る'] },
  { head: '② 列名', sub: 'HEADERS と比べる', out: ['ファイルごと', '断る'] },
  { head: '③ 正規化', sub: '全角の数字だけ', out: ['（断らない）'] },
  { head: '④ 値', sub: '在庫数の形式・範囲', out: ['その行を除く'] },
  { head: '⑤ 業務の条件', sub: '商品があるか', out: ['その行を除く'] },
  { head: '⑥ 処理', sub: 'update!', out: ['例外は全体を', '取り消す'], inside: true },
]

function StepRow({ top, title, steps }: { top: number; title: string; steps: Step[] }) {
  const sx = (i: number) => 20 + i * 125
  return (
    <g>
      <T x={20} y={top} bold>
        {title}
      </T>
      {steps.map((s, i) => (
        <g key={s.head}>
          <Box x={sx(i)} y={top + 14} w={115} h={50} lines={[s.head, s.sub]} fs={11} bold subTone="muted" fill={s.inside ? 'box' : 'box5'} />
          {i < steps.length - 1 && <Arrow x1={sx(i) + 115} y1={top + 39} x2={sx(i + 1) - 1} y2={top + 39} />}
          <Arrow x1={sx(i) + 57} y1={top + 64} x2={sx(i) + 57} y2={top + 84} dashed />
          {s.out.map((t, j) => (
            <T key={t} x={sx(i) + 57} y={top + 100 + j * 15} anchor="middle" fs={11} tone={s.inside || t.startsWith('（') ? 'muted' : 'danger'}>
              {t}
            </T>
          ))}
        </g>
      ))}
      <line x1={20} y1={top + 136} x2={630} y2={top + 136} stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={20} y={top + 154} fs={11} tone="acc">
        信頼の境界で確かめる（防御的プログラミング）
      </T>
      <line x1={645} y1={top + 136} x2={760} y2={top + 136} stroke="var(--fig-line)" strokeWidth={2} />
      <T x={645} y={top + 154} fs={11} tone="muted">
        内側（Fail Fast）
      </T>
    </g>
  )
}

function ChecksFigure() {
  return (
    <Svg
      id="80-4"
      w={780}
      h={420}
      label="上の段は Webhook を確かめる順序。① 送り主を署名で確かめ、合わなければ 401。② JSON として読み、読めなければ 400。③ params.expect で id と type の形を確かめ、違えば 400。④ CarrierEvent に記録し、再送なら記録済みの行を使う。⑤ DeliveryNotice で値と業務の条件を確かめ、通らなければ rejected と理由を残して 200。ここまでが信頼の境界。⑥ 境界の内側の deliver! で処理し、例外は 500 にして報告する。下の段は CSV の順序。① bom|utf-8 で文字コードを確かめ、② 列名を HEADERS と比べ、どちらも違えばファイルごと断る。③ 全角の数字だけを半角にする。④ 在庫数の形式と範囲、⑤ 商品があるかを確かめ、通らない行を除く。⑥ 境界の内側で update! し、例外は全体を取り消す"
    >
      <StepRow top={18} title="Webhook（POST /webhooks/carrier）" steps={webhookSteps} />
      <StepRow top={218} title="CSV（StockImport）" steps={csvSteps} />
    </Svg>
  )
}

/* ---------- 図 80-6 直す前と直した後の、外部のデータの流れ ---------- */
const flows: { top: number; title: string; before: string[][]; after: string[][] }[] = [
  {
    top: 40,
    title: 'Webhook',
    before: [['params[:data][:delivered_at] を', '確かめずに読む'], ['置き配は nil のまま', 'Time.zone.parse(nil) で TypeError'], ['500 と報告', '送り直しのたびに繰り返す']],
    after: [['署名と形を確かめる', '通らなければ 401・400'], ['記録してから DeliveryNotice で確かめる', '置き配は placed_at を使う'], ['通らなければ rejected と理由を残して 200', '後から処理し直せる']],
  },
  {
    top: 242,
    title: 'CSV',
    before: [['row["stock"].to_i で', '整数にする'], ['「１２０」も空欄も', '0 になる'], ['在庫 0 で保存する', '誤りに気づかない']],
    after: [['文字コードと列名を確かめる', '違えばファイルごと断る'], ['全角の数字だけを半角にして', 'StockRow で確かめる'], ['確かめた行だけを書き込み', '除いた行と理由を返す']],
  },
]

function BeforeAfterFigure() {
  const by = (top: number, i: number) => top + 14 + i * 58
  return (
    <Svg
      id="80-6"
      w={780}
      h={440}
      label="左は直す前、右は直した後。上の段の Webhook は、直す前は params の data の delivered_at を確かめずに読み、置き配の通知では nil のまま Time.zone.parse に渡して TypeError になり、500 と報告を送り直しのたびに繰り返す。直した後は、署名と形を確かめて通らなければ 401 や 400 を返し、通知を記録してから DeliveryNotice で確かめ、置き配は placed_at を使う。通らなければ rejected と理由を残して 200 を返し、後から処理し直せる。下の段の CSV は、直す前は stock の列を to_i で整数にし、全角の１２０も空欄も 0 になり、在庫 0 のまま保存して誤りに気づかない。直した後は、文字コードと列名を確かめて違えばファイルごと断り、全角の数字だけを半角にして StockRow で確かめ、確かめた行だけを書き込んで、除いた行と理由を返す"
    >
      <T x={20} y={18} bold tone="danger">
        直す前
      </T>
      <T x={410} y={18} bold tone="acc">
        直した後
      </T>
      <line x1={390} y1={8} x2={390} y2={428} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {flows.map((f) => (
        <g key={f.title}>
          <T x={20} y={f.top} fs={12} tone="muted">
            {f.title}
          </T>
          <T x={410} y={f.top} fs={12} tone="muted">
            {f.title}
          </T>
          {f.before.map((lines, i) => (
            <g key={lines[0]}>
              <Box x={20} y={by(f.top, i)} w={350} h={44} lines={lines} fs={12} fill="bg" subTone="danger" />
              {i < f.before.length - 1 && <Arrow x1={195} y1={by(f.top, i) + 44} x2={195} y2={by(f.top, i + 1) - 1} />}
            </g>
          ))}
          {f.after.map((lines, i) => (
            <g key={lines[0]}>
              <Box x={410} y={by(f.top, i)} w={350} h={44} lines={lines} fs={12} fill={i === 2 ? 'box' : 'box5'} subTone="acc" />
              {i < f.after.length - 1 && <Arrow x1={585} y1={by(f.top, i) + 44} x2={585} y2={by(f.top, i + 1) - 1} />}
            </g>
          ))}
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図 80-7 境界と内側で、誤りを見つけたときの扱い ---------- */
const quadrants = [
  { x: 200, y: 60, lines: ['直す前の Webhook', '外部の誤りが 500 になり、', '送り直しのたびに報告が届く'], good: false },
  { x: 485, y: 60, lines: ['直した後の Webhook・CSV', 'rejected と理由を残す', '送り手に直してもらう'], good: true },
  { x: 200, y: 200, lines: ['直した後の deliver!', 'ArgumentError で 500・報告', '直した後の再送で処理される'], good: true },
  { x: 485, y: 200, lines: ['当てはめすぎた deliver!', 'return false で processed', '誰も気づかず、通知も失われる'], good: false },
]

function QuadrantFigure() {
  return (
    <Svg
      id="80-7"
      w={780}
      h={400}
      label="縦に誤りを見つけた場所（境界の外部のデータか、内側の確かめた後の値か）、横に誤りを見つけたときの扱い（例外で止めるか、記録して続けるか）を取った2行2列の図。境界で例外で止めるのは直す前の Webhook で、外部の誤りが 500 になり、送り直しのたびに報告が届く。境界で記録して続けるのは直した後の Webhook と CSV で、rejected と理由を残し、送り手に直してもらう。内側で例外で止めるのは直した後の deliver! で、ArgumentError で 500 にして報告し、直した後の再送で処理される。内側で記録して続けるのは当てはめすぎた deliver! で、return false のまま processed になり、誰も気づかず通知も失われる。向いている組み合わせは、境界では記録して続け、内側では例外で止める形"
    >
      <Box x={200} y={14} w={275} h={36} lines="誤りを見つけたら、例外で止める" fs={12} bold />
      <Box x={485} y={14} w={275} h={36} lines="誤りを見つけたら、記録して続ける" fs={12} bold />
      <Box x={20} y={60} w={170} h={130} lines={['境界', '外部から届いたデータ']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={20} y={200} w={170} h={130} lines={['内側', '境界で確かめた後の値']} fs={12} bold subTone="muted" />
      {quadrants.map((q) => (
        <g key={q.lines[0]}>
          <Box x={q.x} y={q.y} w={275} h={130} lines={q.lines} fs={12} fill="bg" bold accent={q.good} subTone={q.good ? 'acc' : 'danger'} />
          <T x={q.x + 260} y={q.y + 20} anchor="end" fs={14} bold tone={q.good ? 'acc' : 'danger'}>
            {q.good ? '○' : '×'}
          </T>
        </g>
      ))}
      <T x={20} y={360} fs={12} tone="acc">
        向いている組み合わせは、境界では記録して続け（防御的プログラミング）、内側では例外で止める（Fail Fast）形
      </T>
      <T x={20} y={384} fs={11} tone="muted">
        境界でも、ファイル全体が取り決めと違うとき（列名・文字コード）は、そのファイルの取り込みを止める
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 82,
  part: 8,
  title: 'Defensive Programming：Webhook と CSV の外部のデータを信頼しない',
  summary:
    '配送業者の Webhook が置き配の通知で delivered_at を送らなくなり、送り直されるたびに 500 と同じ報告が続く場面と、仕入れ先の CSV の全角の数字と空欄が在庫数 0 として保存される場面から始めます。Code Complete と Meyer の批判、OWASP の入力の検証の資料で防御的プログラミングの意味を確かめ、信頼の境界で送り主・形・型・値を順に確かめて、処理できないデータは理由を記録する形に直します。最後に、境界の内側まで防御を重ねて誤りが見えなくなる当てはめすぎと、Fail Fast との使い分けを扱います。',
  goals: [
    '外部の会社から届く Webhook や CSV を、アプリの内部で作ったデータと分けて扱う理由を、実行結果をもとに説明できる',
    '防御的プログラミングの意味と、Code Complete・Meyer の批判・頑健性原則（Postel）との関係を説明できる',
    '信頼の境界で、送り主（署名）・形（params.expect）・型・値・業務の条件の順に確かめるコードを書ける',
    'Rails の型の変換が「１２０」や「12O」や存在しない日付を誤りにしないことを確かめ、変換の前に文字列を確かめられる',
    '処理できない外部のデータを、例外にするのか、理由を記録してその1件を除くのかを、境界の内側の Fail Fast と使い分けられる',
  ],
  prerequisites: [10, 14, 79],
  sections: [
    {
      id: 'scene',
      title: '項目の欠けた Webhook と全角の数字が入った CSV',
      body: (
        <>
          <p>
            この章では<Term en="Defensive Programming">防御的プログラミング</Term>を扱います。防御的プログラミングは外部から届く入力や、内容を保証できないデータによって、アプリのデータが誤った値になったり処理が止まったりしないようにする考え方です。まず、外部の会社から届くデータを、届いたままの形で使うコードを動かします。
          </p>
          <h3>そもそも外部のデータとは何か</h3>
          <p>
            EC サイトのアプリが扱うデータの多くは、アプリ自身の画面やジョブが作ったものです。一方で、ほかの会社のシステムや担当者が作って送ってくるデータもあります。この章の雑貨の EC サイトは次の2つを受け取っています。
          </p>
          <ul>
            <li>
              配送業者の Webhook：<Term>Webhook</Term> は、あるシステムで出来事が起きたときに、別のシステムの URL へ HTTP の要求を送って知らせる仕組みです。この店では、配送業者が荷物を届けると、配達完了の通知を JSON で POST /webhooks/carrier に送ってきます。
            </li>
            <li>仕入れ先の CSV：仕入れ先の担当者が Excel で在庫数の表を作り、毎朝 CSV のファイルで送ってきます。アプリはそれを取り込んで、商品の在庫数を更新します。</li>
          </ul>
          <p>
            どちらも、中身を作るのはアプリの外の人やシステムです。配送業者は仕様を変えることがあり、仕入れ先の担当者は値を手で入力します。アプリの側では届くデータの中身を保証できません。
          </p>
          <h3>配達状況の Webhook を受け取るコード</h3>
          <p>配送業者の通知は次の形です。id は配送業者が通知ごとに付ける番号、type は出来事の種類で、配達完了は parcel.delivered です。</p>
          <Code
            lang="json"
            title="配達完了の通知の本文"
            code={`{
  "id": "evt_1001",
  "type": "parcel.delivered",
  "data": { "tracking_number": "7300-0001", "delivered_at": "2026-11-22T10:30:00+09:00" }
}`}
          />
          <p>受け取るアクションは、配達完了の通知なら追跡番号で発送（shipments の行）を探し、状態を配達済みにして、配達の日時を保存します。</p>
          <Code
            lang="ruby"
            title="app/controllers/carrier_webhooks_controller.rb（直す前）"
            code={`class CarrierWebhooksController < ActionController::API
  # POST /webhooks/carrier  配送業者から届く配達状況の通知
  def create
    if params[:type] == "parcel.delivered"
      shipment = Shipment.find_by!(tracking_number: params[:data][:tracking_number])
      shipment.update!(status: "delivered", delivered_at: Time.zone.parse(params[:data][:delivered_at]))
    end
    head :ok
  end
end`}
          />
          <p>
            この章では配送業者の仕様を次のように想定します。2xx 以外の応答を受け取ると、配送業者は同じ通知を1分後・10分後・1時間後・6時間後・24時間後に送り直します。実在する例では、決済代行の Stripe が 2xx 以外の応答を受け取ったイベントを、間隔を広げながら最長3日間送り直します<Ref n={6} />。
          </p>
          <Figure n="80-1" title="外部のデータを受け取る2つの処理と、問題が起きる箇所" caption="赤い文字は、この節で実行結果を確かめる3つの問題。">
            <SceneFigure />
          </Figure>
          <p>
            図 80-1 の左の3つは、アプリの外で作られたデータの送り手です。中央の2つの処理はどちらも届いた値をそのまま Ruby のメソッドに渡し、右のテーブルに書き込んでいます。次の項から、赤い文字の3つの問題を順に動かします。
          </p>
          <h3>置き配の通知は送り直されるたびに 500 になる</h3>
          <p>
            配送業者は11月から置き配（宅配ボックスや玄関の前に荷物を置いて配達を終えること）を始めました。置き配の通知では delivered_at の代わりに placed_at（置いた日時）と place（置いた場所）を送ります。アプリの担当者はこの仕様の変更を知りませんでした。spec で配達完了の通知と置き配の通知を送り、置き配の通知を配送業者の仕様どおりに送り直しました。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/carrier_webhooks_spec.rb（直す前。関係する部分）"
            code={`RSpec.describe "POST /webhooks/carrier（直す前）", type: :request do
  # …（省略）本番と同じく例外を 500 の応答にし、Rails.error に届いた例外を reported に記録する

  def deliver(body, headers = {})
    post "/webhooks/carrier", params: body.to_json, headers: { "CONTENT_TYPE" => "application/json" }.merge(headers)
  end

  it "置き配の通知は delivered_at が無く、送り直されるたびに 500 になる" do
    # 配送業者の仕様（この章の想定）：2xx 以外の応答には、1分後・10分後・1時間後・6時間後・24時間後に送り直す
    delivered = { id: "evt_1001", type: "parcel.delivered",
                  data: { tracking_number: "7300-0001", delivered_at: "2026-11-22T10:30:00+09:00" } }
    placed = { id: "evt_1002", type: "parcel.delivered",
               data: { tracking_number: "7300-0002", placed_at: "2026-11-22T10:40:00+09:00", place: "宅配ボックス" } }
    travel_to Time.zone.parse("2026-11-22 10:30:05")
    deliver(delivered)
    puts "  #{Time.current.strftime('%m/%d %H:%M')} evt_1001（配達完了） → #{response.status}"
    start = Time.zone.parse("2026-11-22 10:40:05")
    [0, 1.minute, 10.minutes, 1.hour, 6.hours, 24.hours].each do |wait|
      travel_to start + wait
      deliver(placed)
      puts "  #{Time.current.strftime('%m/%d %H:%M')} evt_1002（置き配）   → #{response.status}"
    end
    # …（省略）報告の件数、例外が起きた行、発送の状態を表示する
  end
end`}
          />
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4。bundle exec rspec spec/requests --format documentation）"
            code={`POST /webhooks/carrier（直す前）
  11/22 10:30 evt_1001（配達完了） → 200
  11/22 10:40 evt_1002（置き配）   → 500
  11/22 10:41 evt_1002（置き配）   → 500
  11/22 10:50 evt_1002（置き配）   → 500
  11/22 11:40 evt_1002（置き配）   → 500
  11/22 16:40 evt_1002（置き配）   → 500
  11/23 10:40 evt_1002（置き配）   → 500
  Rails.error に届いた報告: 6件（TypeError: no implicit conversion of nil into String）
  例外が起きた行: app/controllers/carrier_webhooks_controller.rb:6:in 'CarrierWebhooksController#create'
  発送の状態: 7300-0001=delivered, 7300-0002=shipped, 7300-0003=shipped
  置き配の通知は delivered_at が無く、送り直されるたびに 500 になる`}
          />
          <p>
            置き配の通知では <code>params[:data][:delivered_at]</code> が nil になり、<code>Time.zone.parse(nil)</code> が TypeError を投げました。送り直された通知は1回目と同じ内容なので、6回とも同じ行で同じ例外になり、Rails.error には同じ原因の報告が6件届きました。図 80-2 はこの実行結果を時間の順に並べたものです。
          </p>
          <Figure n="80-2" title="置き配の通知が送り直されるたびに 500 になる" caption="上の実行結果を、送り手・アプリ・報告の3列のタイムラインにした図。">
            <RetryFigure />
          </Figure>
          <p>図 80-2 から、次の3つが読み取れます。</p>
          <ul>
            <li>原因はアプリのコードの誤りではなく、送り手の仕様の変更です。それでも Rails.error には、アプリのバグと同じ扱いの報告が届きました。報告のメッセージは「nil を文字列に変換できない」という意味で、配送業者の仕様が変わったことは読み取れません。</li>
            <li>送り直しても内容は変わらないので、何回送り直されても結果は同じです。送り直しの回数だけ、報告が増えます。</li>
            <li>送り直しが終わった後、通知の中身はアプリのどこにも残っていません。7300-0002 の荷物は届いているのに、会員の画面は「発送済み」のままです。直した後に処理し直そうとしても、元の通知がありません。</li>
          </ul>
          <h3>送り主を確かめずに配達済みにする</h3>
          <p>同じアクションに、配送業者ではない送り手から、7300-0003 を配達済みにする要求を送りました。</p>
          <Code
            lang="text"
            title="実行結果（続き。同じ形の本文を、署名などを付けずに送った）"
            code={`  送り主を確かめない要求 → 200、7300-0003 の状態: delivered
  署名の無い要求でも、配達済みにする`}
          />
          <p>
            要求の URL・ヘッダー・本文は、どれも送る側が自由に作れます（<ChapterLink n={21} section="untrusted-input" />）。このアクションは本文の形だけを見ているので、URL を知っている人なら誰でも、ほかの会員の荷物を配達済みにできます。荷物が届いていないという問い合わせを受けた担当者は、画面の「配達済み」を見て、届いているはずだと判断してしまいます。
          </p>
          <h3>在庫数の CSV を取り込むコード</h3>
          <p>仕入れ先から 11月22日に届いた CSV は、次の4行でした。仕入れ先とは、在庫数を数え直している途中の商品は、在庫数の欄を空けて送ると取り決めています。</p>
          <Code
            lang="text"
            title="spec/fixtures/files/stocks_1122.csv"
            code={`sku,name,stock
MUG-01,マグカップ（白）,120
MUG-02,マグカップ（黒）,１２０
TEE-01,Tシャツ（M）,
BAG-01,トートバッグ,35`}
          />
          <p>取り込みの処理は1行ずつ商品を探し、在庫数の列を to_i で整数にして保存します。</p>
          <Code
            lang="ruby"
            title="app/services/stock_import.rb（直す前）"
            code={`require "csv"

# 仕入れ先から毎朝届く在庫数の CSV を取り込む
class StockImport
  def self.call(path)
    CSV.foreach(path, headers: true) do |row|
      Product.find_by!(sku: row["sku"]).update!(stock: row["stock"].to_i)
    end
  end
end`}
          />
          <p>4つの商品の在庫数を 40 にしておき、この CSV を取り込みました。</p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/stock_import_spec.rb --format documentation）"
            code={`StockImport
  取り込んだ後の在庫数: MUG-01=120, MUG-02=0, TEE-01=0, BAG-01=35
  全角の数字と空欄の在庫数を 0 にして、例外を出さずに終わる`}
          />
          <p>
            MUG-02 は CSV では「１２０」（全角の数字）でしたが、在庫数は 0 になりました。Ruby の String#to_i は半角の数字だけを数字として読み、読めない文字列には例外を投げずに 0 を返すからです。空欄の TEE-01 も取り決めでは「数え直している途中」だったのに、0 として保存されました。取り込みは例外を出さずに終わったので、担当者は誤りに気づきません。2つの商品は商品ページで「在庫切れ」と表示され、売れる商品が売れない状態が、仕入れ先から問い合わせが来るまで続きます。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>問題1：外部のデータの形が変わると、アプリのコードの例外（500）になります。送り直しのたびに同じ報告が届き、通知そのものはどこにも残りません。</li>
            <li>問題2：送り主を確かめません。誰が送った要求でも、本文の形が合っていれば発送の状態を書き換えます。</li>
            <li>問題3：文字列を整数にする変換が、読めない値を 0 にします。誤りは例外にも記録にもならず、正しい値として保存されます。</li>
          </ul>
          <p>
            3つに共通するのは、外部から届いたデータを、アプリの内部で作ったデータと同じように扱っていることです。問題1では欠けた値で例外になり、問題3では読めない値が 0 として通りました。向きは反対ですが、どちらも外部のデータの誤りを、外部のデータの誤りとして扱えていません。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '防御的プログラミングの意味と由来',
      body: (
        <>
          <h3>防御的プログラミングの定義</h3>
          <p>
            防御的プログラミング（Defensive Programming）は、外部からの入力や信頼できないデータによって起きる問題を防ぐ考え方です。この章では次の2つをまとめてこの言葉で呼びます。
          </p>
          <ol>
            <li>外部から届いたデータは誤りを含みうる前提で、使う前に確かめる。</li>
            <li>確かめて通らなかったデータの扱い（断る・理由を記録する・その1件を除く）を、あらかじめ決めておく。</li>
          </ol>
          <p>
            前の節のコードにはどちらもありませんでした。Webhook のアクションは delivered_at があると決めつけて使い（1が無い）、無かったときは例外が起きるに任せていました（2が無い）。CSV の取り込みは to_i が返した値をそのまま使い、読めなかった値を 0 として保存しました。
          </p>
          <h3>Code Complete の第8章</h3>
          <p>
            Steve McConnell の『Code Complete』第2版（Microsoft Press、2004年）は、第8章の題を「Defensive Programming」にして、この考え方を1つの章で扱っています。出版社が公開している見本のページ（目次と索引）で確かめられる章の節は次のとおりです<Ref n={2} />。
          </p>
          <ul>
            <li>8.1 Protecting Your Program from Invalid Inputs（不正な入力からプログラムを守る）</li>
            <li>8.2 Assertions（アサーション）、8.3 Error-Handling Techniques（エラー処理の方法）、8.4 Exceptions（例外）</li>
            <li>8.5 Barricade Your Program to Contain the Damage Caused by Errors（エラーの被害を広げないために、プログラムにバリケードを置く）</li>
            <li>8.6 Debugging Aids（デバッグの補助）、8.7 Determining How Much Defensive Programming to Leave in Production Code（本番のコードにどれだけ残すか）</li>
            <li>8.8 Being Defensive About Defensive Programming（防御的プログラミングそのものにも用心する）</li>
          </ul>
          <p>
            索引の「defensive programming」の項目には、robustness vs. correctness（頑健さと正しさ）、security issues（セキュリティの問題）、problems caused by（防御的プログラミングが起こす問題）が並び、別の項目に offensive programming（攻撃的プログラミング）もあります<Ref n={2} />。節の題と索引から、McConnell が入力を確かめることに加えて、確かめる場所を決めること（8.5）と、やりすぎたときの問題（8.8）までを、防御的プログラミングの範囲として扱っていることが分かります。本書では第8章の本文を確かめられなかったので、これより詳しい内容は引用しません。
          </p>
          <h3>Meyer の批判：同じ確認を2か所に書かない</h3>
          <p>
            Bertrand Meyer は、IEEE Computer の 1992年10月号の論文「Applying &quot;Design by Contract&quot;」に「Defensive programming revisited（防御的プログラミングを見直す）」という節を置いています<Ref n={1} />。Meyer は、信頼性を扱うソフトウェア工学の教科書が防御的プログラミングをよく強調していると書き、その助言を「呼び出し側が確かめていても、重複する確かめをできるだけ多く入れる。役に立たなくても害は無い」とまとめています。そのうえで、「念のため」に足したコードはソフトウェアを複雑にし、その複雑さが品質と信頼性を下げる、と批判しました<Ref n={1} />。
          </p>
          <p>
            Meyer の Design by Contract では、ある条件をメソッドの前提条件（require）にしたら呼び出し側が守り、前提条件にしなければメソッドの中で扱います。両方には書きません。Meyer はこれを、防御的プログラミングとは正反対の原則だと書いています<Ref n={1} />。誰が最初に「防御的プログラミング」という言葉を使ったのかは確かめられませんでしたが、この論文から、1992年の時点で教科書に広く使われていた呼び名だったことは分かります。
          </p>
          <p>
            Meyer が批判したのは、呼び出す側と呼ばれる側の両方が自分たちのコードである場合の、重複した確認です。配送業者や仕入れ先は、アプリの側から前提条件を守らせることができない相手です。外部のデータを確かめるコードは、ほかのどこにも無い確認なので、重複にはなりません。この章では2人の主張を、次のように合わせて使います。外部のデータは、データが入ってくる所で1回確かめます。そこから内側では確かめた前提でコードを書き、同じ確認を繰り返しません。
          </p>
          <h3>信頼の境界で確かめる</h3>
          <p>
            データを作った人やシステムが変わる所を<Term en="trust boundary">信頼の境界</Term>と呼びます。この章では、配送業者の通知がアプリに届く所と、仕入れ先の CSV を読み込む所が信頼の境界です。OWASP（Web アプリのセキュリティの資料を公開している団体）の Input Validation Cheat Sheet は、入力の検証について次のように書いています<Ref n={3} />。
          </p>
          <ul>
            <li>構文（期待する型と形式）と意味（その操作にとって値が妥当か）の両方を確かめる。たとえば予約なら、日付が正しいことに加えて、終わりの日付が始まりの日付より後であることも確かめる。</li>
            <li>文字列を整数に変換しても、型が決まるだけで、受け付けてよい数量かどうかは決まらない。</li>
            <li>不正な要求ははっきりしたエラーで断り、一部だけ確かめたデータで処理を続けない。</li>
            <li>社内の API、取引先から届くデータ、キュー、保存済みのレコードも、信頼の境界を越えるときは確かめる。社内の経路を通ってきたことは、受け取る側の規則を満たす理由にならない。</li>
          </ul>
          <Figure n="80-3" title="信頼の境界" caption="この章の Webhook と CSV に当てはめた模式図。紫の帯が外部のデータを確かめる場所。">
            <BoundaryFigure />
          </Figure>
          <p>
            図 80-3 の左はアプリの側から中身を保証できないデータです。利用者のフォームや API の値も同じ側に入ります（<ChapterLink n={21} section="untrusted-input" />）。中央の境界で、送り主・形・型・値・業務の条件の順に確かめ、通らないデータは断るか記録します。右の内側のコードは境界を通ったデータだけを受け取ります。内側で前提が成り立たなくなったら、それは外部のデータではなく自分たちのコードの誤りなので、<ChapterLink n={79} />（Fail Fast）のとおり例外にします。
          </p>
          <h3>頑健性原則との関係</h3>
          <p>
            外部のデータの扱いでよく引かれる言葉に、TCP の仕様 RFC 761（1980年1月）の<Term en="Robustness Principle">頑健性原則</Term>があります。「自分が行うことは厳密に、他者から受け取るものには寛容に（be conservative in what you do, be liberal in what you accept from others）」という一文です<Ref n={4} />。著者の名前から Postel の法則とも呼ばれます。
          </p>
          <p>
            この一文を「受け取れるものは、できるだけ受け取る」と読むと、前の節の to_i と同じ書き方になります。IAB（インターネットの技術の方針を検討する組織）が 2023年6月に出した RFC 9413「Maintaining Robust Protocols」は、頑健性原則がさまざまに解釈されてきたことを指摘し、想定外の入力を受け入れ続けることの害を挙げています。想定外の入力を受け入れると問題が隠れて後から直しにくくなり、受け手が許した誤りが事実上の仕様として定着して、ほかの実装もその誤りに合わせることになる、という内容です<Ref n={5} />。
          </p>
          <p>
            この章の防御的プログラミングは何でも受け取ることではありません。取り決めた形の値を受け取り、それ以外の値は理由を付けて断ります。どこまでを「取り決めた形」に含めるか（全角の数字は受け取るか）は、「当てはめすぎたとき」の節で扱います。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則・パターン</th>
                  <th scope="col">何をするか</th>
                  <th scope="col">この章との違い</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Fail Fast（<ChapterLink n={79} />）
                  </td>
                  <td>不正な状態や入力をできるだけ早く見つけ、問題を隠したまま続けない</td>
                  <td>早く見つける点は同じ。見つけた後、境界の内側の誤りは例外で止め、境界で見つけた外部のデータの誤りは理由を記録してその1件を除く（図 80-7）</td>
                </tr>
                <tr>
                  <td>
                    Design by Contract（<ChapterLink n={80} />）
                  </td>
                  <td>前提条件・事後条件・不変条件を明確にする</td>
                  <td>契約は、呼び出し側に前提条件を守らせられる相手との取り決め。外部の送り手には守らせる手段が無いので、境界で確かめる</td>
                </tr>
                <tr>
                  <td>
                    Make Illegal States Unrepresentable（<ChapterLink n={81} />）
                  </td>
                  <td>型やデータ構造で、不正な組み合わせを作れなくする</td>
                  <td>内部のデータの形を決める。この章は、外から来た値を内部の形に入れる前に確かめる</td>
                </tr>
                <tr>
                  <td>
                    Graceful Degradation（<ChapterLink n={91} />）
                  </td>
                  <td>一部の機能が止まっても、残りで動き続ける</td>
                  <td>外部のサービスが応答しない場合を扱う。この章は、応答や通知は届くが中身が誤っている場合を扱う</td>
                </tr>
                <tr>
                  <td>
                    Idempotency Key（<ChapterLink n={52} />）
                  </td>
                  <td>同じ要求やイベントを何回受け取っても、1回分だけ処理する</td>
                  <td>この章でも通知の id を一意にして記録するが、重複の扱いは Idempotency Key の章の方法をそのまま使う</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: '外部のデータを信頼の境界で確かめてから使う',
      body: (
        <>
          <p>前の節の3つの問題を、次の順に直します。外側で行う確認ほど処理が軽く、内側に進むほど DB を読んだり書いたりするので、外側から順に確かめます。</p>
          <ol>
            <li>送り主を署名で確かめる（問題2）</li>
            <li>本文の形を確かめ、受け取った通知を記録する</li>
            <li>型を変える前に、値を確かめる（問題1・問題3）</li>
            <li>処理できない通知は理由を記録して 200 を返す（問題1）</li>
            <li>CSV を、ファイル・行の順に確かめる（問題3）</li>
          </ol>
          <p>図 80-4 は直した後に Webhook と CSV を確かめる場所と、それぞれで通らなかったときの結果を並べたものです。</p>
          <Figure n="80-4" title="外部の入力を確かめる場所と順序" caption="紫の箱が信頼の境界で行う確認、灰色の箱が境界の内側の処理。破線の矢印の先は通らなかったときの結果。">
            <ChecksFigure />
          </Figure>
          <p>
            図 80-4 の上の段の ①〜③ と下の段の ①② は、データ全体を断る確認です。送り主が違う、JSON として読めない、列名が違う、といった誤りがあると、中の値を1つも信用できないからです。上の段の ⑤ と下の段の ④⑤ は、その1件だけを除く確認です。⑥ は境界の内側の処理で、ここで起きた例外は外部のデータではなく自分たちのコードの誤りとして扱います。
          </p>
          <h3>手順1：送り主を署名で確かめる</h3>
          <p>
            通知の署名に使う秘密の鍵を、配送業者と取り決めます。配送業者は本文の HMAC-SHA256（鍵と本文から計算する値）を X-Carrier-Signature ヘッダーに付けて送り、アプリは受け取った本文から同じ値を計算して比べます。値が一致すれば、送り手が鍵を知っていて、本文が途中で書き換えられていないことが分かります。Stripe のドキュメントもどの項目を信用するよりも先に署名を確かめること、署名の確認には手を加えていない元の本文が要ることを書いています<Ref n={6} />。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/carrier.rb"
            code={`# 配送業者と取り決めた、Webhook の署名の鍵。開発とテストではテスト用の値を使う
Rails.configuration.x.carrier.webhook_secret =
  Rails.env.local? ? ENV.fetch("CARRIER_WEBHOOK_SECRET", "test-carrier-secret") : ENV.fetch("CARRIER_WEBHOOK_SECRET")`}
          />
          <Code
            lang="ruby"
            title="app/controllers/carrier_webhooks_controller.rb（直した後）"
            code={`class CarrierWebhooksController < ActionController::API
  before_action :verify_signature

  # POST /webhooks/carrier  配送業者から届く配達状況の通知
  def create
    id, type = params.expect(:id, :type) # 無い・形が違うなら 400
    event = CarrierEvent.receive!(event_id: id, event_type: type, payload: request.raw_post)
    event.process! if event.received?
    render json: { status: event.status }
  end

  private

  # 送り主が配送業者かを、本文の HMAC-SHA256 で確かめる。確かめる前の本文は使わない
  def verify_signature
    secret = Rails.configuration.x.carrier.webhook_secret
    expected = "sha256=#{OpenSSL::HMAC.hexdigest("SHA256", secret, request.raw_post)}"
    given = request.headers["X-Carrier-Signature"].to_s
    head :unauthorized unless ActiveSupport::SecurityUtils.secure_compare(given, expected)
  end
end`}
          />
          <ul>
            <li>
              <code>request.raw_post</code> は、Rails が JSON として読む前の本文の文字列です。署名は送り手が送ったバイト列そのものに対して計算するので、params から作り直した JSON では一致しません。
            </li>
            <li>
              <code>ActiveSupport::SecurityUtils.secure_compare</code> は、2つの文字列を、違う文字の位置にかかわらず同じ時間で比べます。<code>==</code> は最初に違う文字で比べるのをやめるので、応答の時間の差から、何文字目まで合っているかを推測される余地があります。ソースのコメントは、文字列の長さは推測されうるとも書いています<Ref n={9} />。ここで比べる値は「sha256=」と 64 文字の16進数で、長さは決まっています。
            </li>
            <li>before_action は params を読む前に動くので、署名の無い要求は、本文を JSON として読めなくても 401 になります。</li>
          </ul>
          <p>spec では配送業者と同じ方法で署名を付けて送るヘルパーを使います。</p>
          <Code
            lang="ruby"
            title="spec/support/carrier_webhook_helper.rb"
            code={`# 配送業者と同じ方法で本文に署名して、Webhook を送る
module CarrierWebhookHelper
  def deliver(body, signature: :valid)
    raw = body.is_a?(String) ? body : body.to_json
    signature = "sha256=#{OpenSSL::HMAC.hexdigest("SHA256", "test-carrier-secret", raw)}" if signature == :valid
    headers = { "CONTENT_TYPE" => "application/json" }
    headers["X-Carrier-Signature"] = signature if signature
    post "/webhooks/carrier", params: raw, headers:
  end
end`}
          />
          <Code
            lang="text"
            title="実行結果（手順4の spec の出力から、署名に関係する行）"
            code={`  署名が無い：401
  署名が合わない：401`}
          />
          <Callout kind="note" title="同じ通知を後から送り直される攻撃">
            <p>
              署名は、本文が書き換えられていないことを示しますが、正しい通知と署名の組を盗み見た人が、後から同じものを送ることは防げません。Stripe はこの攻撃（リプレイ攻撃）を防ぐために、署名のヘッダーに時刻を含めています<Ref n={6} />。送り手が時刻を送る場合は、時刻も署名の対象にして、許す時間の幅を決めて確かめます。この章の配送業者は時刻を送らない想定なので、次の手順の「通知の id を1回だけ記録する」仕組みで、同じ id の通知を2回処理しないようにしています。
            </p>
          </Callout>
          <h3>手順2：本文の形を確かめて受け取った通知を記録する</h3>
          <p>
            署名が合ったら、本文の形を確かめます。JSON として読めない本文は、Rails が読む時点で ActionDispatch::Http::Parameters::ParseError になり、Rails はこれを 400 の応答にします<Ref n={8} />。<code>params.expect(:id, :type)</code> は、id と type が無いときや、文字列ではなくハッシュや配列が届いたときに ActionController::ParameterMissing を投げ、これも 400 になります<Ref n={7} /><Ref n={8} />。どちらも rescue_responses の表にある例外なので、Rails.error には報告されません（<ChapterLink n={79} section="rails" />）。
          </p>
          <Code
            lang="text"
            title="実行結果（手順4の spec の出力から、形に関係する行）"
            code={`  JSON が壊れている：400
  id が無い：400`}
          />
          <p>
            id と type が読めたら、中の値を確かめる前に、通知を carrier_events に記録します。前の節では、処理できなかった通知はどこにも残りませんでした。記録しておけば、何が届いたかを後から確かめられ、コードを直した後に処理し直せます。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000003_create_carrier_events.rb"
            code={`class CreateCarrierEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :carrier_events do |t|
      t.string :event_id, null: false, index: { unique: true } # 配送業者が付けた通知の id
      t.string :event_type, null: false
      t.text :payload, null: false                  # 受け取った本文（署名を確かめたもの）
      t.string :status, null: false, default: "received"
      t.string :error                               # 処理しなかった理由
      t.timestamps
    end
  end
end`}
          />
          <Code
            lang="ruby"
            title="app/models/carrier_event.rb（記録する部分）"
            code={`# 配送業者から届いた通知の記録。署名を確かめた通知だけを保存する
class CarrierEvent < ApplicationRecord
  enum :status, { received: "received", processed: "processed",
                  rejected: "rejected", ignored: "ignored" }, validate: true

  # 同じ id の通知が送り直されたときは、記録済みの行を返す
  def self.receive!(event_id:, event_type:, payload:)
    create_or_find_by!(event_id:) do |event|
      event.event_type = event_type
      event.payload = payload
    end
  end
  # …（省略）process! は手順4
end`}
          />
          <p>
            <code>create_or_find_by!</code> は、まず行を INSERT し、一意索引の違反になったら既存の行を探して返します。同じ通知が同時に2つ届いたときの動きと注意点は <ChapterLink n={52} section="webhook" /> で確かめます。署名を確かめる前の本文は保存しません。誰が送ったか分からないデータを保存すると、表が意図しない内容で埋まるからです。
          </p>
          <p>
            保存する本文には、配送先の住所のような個人の情報が含まれることがあります。OWASP は、断った入力をログにそのまま書かず、失敗の事実と必要な情報だけを残すよう勧めています<Ref n={3} />。この章では、ログには通知の id と理由だけを書き、本文は処理し直すために表に保存します。表を読める人を限り、残す期間を決めて古い行を消します（期間の決め方は <ChapterLink n={52} section="webhook" />）。
          </p>
          <h3>手順3：型を変える前に値を確かめる</h3>
          <p>
            記録した通知の data を、発送を更新できる値に変えます。ここで、Rails の型の変換に文字列をそのまま渡すと、前の節の to_i と同じことが起きます。在庫数と配達の日時の文字列を、Rails の型（ActiveModel::Type）で変換した結果と、この節の境界のクラス（StockRow・DeliveryNotice。後で示す）で確かめた結果を比べました。比べるために、整数の属性に numericality のバリデーションを付けた StockForm も用意しました。
          </p>
          <Code
            lang="ruby"
            title="script/casts.rb"
            code={`# 外から届いた文字列を、Rails の型の変換に渡したときと、境界で確かめたときの結果

# 比べるために、整数の属性に numericality を付けたフォームのクラス
class StockForm
  include ActiveModel::API
  include ActiveModel::Attributes

  attribute :stock, :integer
  validates :stock, numericality: { only_integer: true, in: 0..99_999 }
end

integer = ActiveModel::Type::Integer.new
puts "在庫数：Type::Integer の変換 / StockForm#valid? / StockRow で確かめた結果"
["120", "１２０", "", "12O", "0120", "-3"].each do |text|
  row = StockRow.new(line: 2, sku: "MUG-01", stock_text: text.tr("０-９", "0-9"))
  puts "  #{text.inspect}: #{integer.cast(text).inspect} / #{StockForm.new(stock: text).valid?} / " +
       (row.valid? ? row.stock.to_s : row.errors.full_messages.first)
end

datetime = ActiveModel::Type::DateTime.new
puts "配達の日時：Type::DateTime の変換 / DeliveryNotice#delivered_time"
["2026-11-22T10:30:00+09:00", "2026-11-31T10:00:00+09:00", "2026-11-22", "tomorrow"].each do |text|
  puts "  #{text.inspect}: #{datetime.cast(text).inspect} / #{DeliveryNotice.new(delivered_at: text).delivered_time.inspect}"
end`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/casts.rb）"
            code={`在庫数：Type::Integer の変換 / StockForm#valid? / StockRow で確かめた結果
  "120": 120 / true / 120
  "１２０": 0 / true / 120
  "": nil / false / 在庫数が空です
  "12O": 12 / true / 在庫数が 0〜99999 の整数ではありません（"12O"）
  "0120": 120 / true / 120
  "-3": -3 / false / 在庫数が 0〜99999 の整数ではありません（"-3"）
配達の日時：Type::DateTime の変換 / DeliveryNotice#delivered_time
  "2026-11-22T10:30:00+09:00": 2026-11-22 10:30:00 +0900 / 2026-11-22 10:30:00.000000000 JST +09:00
  "2026-11-31T10:00:00+09:00": 2026-12-01 10:00:00 +0900 / nil
  "2026-11-22": 2026-11-22 00:00:00 +0000 / nil
  "tomorrow": nil / nil`}
          />
          <Figure n="80-5" title="外から届いた文字列と、型の変換・境界で確かめた結果" caption="上の実行結果を表にしたもの。「×」は、送り手が意図した値と違う値になる結果。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">届いた文字列</th>
                    <th scope="col">Rails の型の変換</th>
                    <th scope="col">整数の属性 + numericality</th>
                    <th scope="col">境界のクラスで確かめた結果</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>在庫数「１２０」</td>
                    <td>× 0</td>
                    <td>× 通る（0 として）</td>
                    <td>120（全角の数字を半角にしてから確かめる）</td>
                  </tr>
                  <tr>
                    <td>在庫数「12O」（O は英字）</td>
                    <td>× 12</td>
                    <td>× 通る（12 として）</td>
                    <td>除く（整数ではない）</td>
                  </tr>
                  <tr>
                    <td>在庫数「」（空欄）</td>
                    <td>nil</td>
                    <td>通らない</td>
                    <td>除く（空）</td>
                  </tr>
                  <tr>
                    <td>在庫数「0120」</td>
                    <td>120</td>
                    <td>通る</td>
                    <td>120（10進数として読む）</td>
                  </tr>
                  <tr>
                    <td>配達の日時「2026-11-31T10:00:00+09:00」</td>
                    <td>× 2026-12-01 10:00</td>
                    <td>（比べていない）</td>
                    <td>nil（実在しない日付）</td>
                  </tr>
                  <tr>
                    <td>配達の日時「2026-11-22」</td>
                    <td>× 2026-11-22 00:00（UTC）</td>
                    <td>（比べていない）</td>
                    <td>nil（時刻と時差が無い）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>図 80-5 から、Rails の型の変換について次のことが分かります。</p>
          <ul>
            <li>
              ActiveModel::Type::Integer は文字列を String#to_i で整数にします<Ref n={11} />。「１２０」は 0、「12O」は 12 になり、どちらも例外にも nil にもなりません。
            </li>
            <li>
              整数の属性に numericality のバリデーションを付けても、「１２０」と「12O」は通りました。numericality のバリデーションは、変換する前の値（<code>stock_before_type_cast</code>）を読めるときはそれを確かめ、読めないときは変換した後の値を確かめます<Ref n={10} />。Active Record のモデルは変換する前の値を持っているので「１２０」を「数値ではない」と判定しますが（<ChapterLink n={79} section="apply" />）、ActiveModel::Attributes の属性には変換する前の値を読むメソッドが無く、変換した後の 0 と 12 が確かめられました。
            </li>
            <li>ActiveModel::Type::DateTime は11月31日を 12月1日に読み替え、日付だけの文字列を UTC の0時にしました。どちらも、送り手が意図した日時ではありません。</li>
          </ul>
          <p>
            OWASP の資料のとおり、型の変換で決まるのは型だけです<Ref n={3} />。そこで境界のクラスでは受け取った文字列をそのまま持ち、文字列の形を確かめてから、厳密な方法で型を変えます。配送業者の通知の data を確かめるのが DeliveryNotice です。
          </p>
          <Code
            lang="ruby"
            title="app/models/delivery_notice.rb"
            code={`# 「配達完了」の通知の data。外から届いた値を確かめてから、型を変えて渡す
class DeliveryNotice
  include ActiveModel::API

  FIELDS = %w[tracking_number delivered_at placed_at].freeze
  TRACKING_NUMBER = /\\A\\d{4}-\\d{4}\\z/
  ISO8601 = /\\A\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(Z|[+-]\\d{2}:\\d{2})\\z/

  attr_accessor :tracking_number, :delivered_at, :placed_at # どれも受け取ったままの値

  validate :tracking_number_format
  validate :delivered_time_present
  validate :shipment_exists, if: -> { errors.empty? }

  def self.from_payload(json)
    data = JSON.parse(json)["data"]
    new(data.is_a?(Hash) ? data.slice(*FIELDS) : {})
  end

  # 配達した日時。置き配の通知には delivered_at が無く、placed_at がある
  def delivered_time
    strict_time(delivered_at || placed_at)
  end

  def shipment
    @shipment ||= Shipment.find_by(tracking_number:)
  end

  private

  def tracking_number_format
    return if TRACKING_NUMBER.match?(tracking_number.to_s)

    errors.add(:base, "追跡番号の形が違います（#{tracking_number.inspect}）")
  end

  def delivered_time_present
    return if delivered_time

    errors.add(:base, "配達の日時が無いか、読めません（#{(delivered_at || placed_at).inspect}）")
  end

  def shipment_exists
    errors.add(:base, "追跡番号 #{tracking_number} の発送がありません") unless shipment
  end

  # ISO 8601 の形で、実在する日時だけを Time にする。2026-11-31 を 12月1日に読み替えない
  def strict_time(value)
    return nil unless ISO8601.match?(value.to_s)

    time = Time.iso8601(value)
    time.in_time_zone if time.strftime("%Y-%m-%dT%H:%M:%S") == value[0, 19]
  rescue ArgumentError
    nil
  end
end`}
          />
          <ul>
            <li>
              <code>from_payload</code> は、data がハッシュでないときも例外にせず、空の値で作ります。その場合は、追跡番号と日時のバリデーションで誤りになります。<code>slice(*FIELDS)</code> で、決めた3つの項目だけを受け取ります（place のような知らない項目を渡すと、ActiveModel::API は例外を投げます）。
            </li>
            <li>置き配の通知を読めるように、配送業者の新しい仕様に合わせて placed_at を配達の日時として使います。これは確かめ方ではなく、業務の取り決めの変更です。</li>
            <li>
              <code>strict_time</code> は ISO 8601 の形を正規表現で確かめてから Time.iso8601 で読み、読んだ時刻を元の文字列と比べます。Time.iso8601 も 11月31日を 12月1日に読み替えたので、比べて一致しない値を nil にしています。
            </li>
            <li>発送が存在するかの確認（DB を読む）は、ほかの誤りが無いときだけ行います。DB を読まない確認を先にする順序を、1つのクラスの中でも守っています。</li>
          </ul>
          <h3>手順4：処理できない通知は理由を記録して 200 を返す</h3>
          <p>記録した通知を処理するメソッドと、発送を配達済みにするメソッドです。</p>
          <Code
            lang="ruby"
            title="app/models/carrier_event.rb（処理する部分）"
            code={`  def process!
    return update!(status: :ignored) unless event_type == "parcel.delivered"

    notice = DeliveryNotice.from_payload(payload)
    if notice.invalid?
      reason = notice.errors.full_messages.join("、")
      Rails.logger.warn("[carrier] #{event_id} を処理しませんでした：#{reason}")
      return update!(status: :rejected, error: reason)
    end

    transaction do
      notice.shipment.deliver!(at: notice.delivered_time)
      update!(status: :processed)
    end
  end`}
          />
          <Code
            lang="ruby"
            title="app/models/shipment.rb"
            code={`class Shipment < ApplicationRecord
  enum :status, { shipped: "shipped", delivered: "delivered" }, validate: true

  # 配達が完了したことを記録する。呼ぶ側は、境界で確かめた日時を渡す
  def deliver!(at:)
    raise ArgumentError, "配達の日時が nil です（境界で確かめた日時を渡してください）" if at.nil?

    update!(status: :delivered, delivered_at: at)
  end
end`}
          />
          <p>
            扱わない種類の通知（不在の連絡など）は ignored にします。DeliveryNotice が誤りを見つけた通知は、理由をログと表に残して rejected にします。確認を通った通知だけが、境界の内側の <code>deliver!</code> に進みます。<code>deliver!</code> の1行目は、境界の内側の前提（日時は確かめ済み）が成り立たないときに止めるためのアサーションです。これは「当てはめすぎたとき」の節で動かします。
          </p>
          <p>前の節と同じ通知に、誤りのある通知を加えて送りました。</p>
          <Code
            lang="ruby"
            title="spec/requests/carrier_webhooks_spec.rb（直した後。関係する部分）"
            code={`  it "送り主・形・値を確かめ、処理できない通知は理由を記録して 200 を返す" do
    cases = {
      "配達完了" => event("evt_1001", { tracking_number: "7300-0001", delivered_at: "2026-11-22T10:30:00+09:00" }),
      "置き配" => event("evt_1002", { tracking_number: "7300-0002", placed_at: "2026-11-22T10:40:00+09:00", place: "宅配ボックス" }),
      "日時が無い" => event("evt_1003", { tracking_number: "7300-0003" }),
      "実在しない日付" => event("evt_1004", { tracking_number: "7300-0004", delivered_at: "2026-11-31T10:00:00+09:00" }),
      "知らない追跡番号" => event("evt_1005", { tracking_number: "7300-9999", delivered_at: "2026-11-22T11:00:00+09:00" }),
      "data が文字列" => event("evt_1006", "7300-0003"),
      "扱わない種類" => event("evt_1007", { tracking_number: "7300-0003" }, type: "parcel.absent"),
      "evt_1002 の再送" => event("evt_1002", { tracking_number: "7300-0002", placed_at: "2026-11-22T10:40:00+09:00", place: "宅配ボックス" })
    }
    cases.each do |name, body|
      deliver(body)
      puts "  #{name}：#{response.status} #{response.body}"
    end
    # …（省略）署名の無い・合わない要求、壊れた JSON、id の無い本文を送る。報告の件数と記録を表示する
  end`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests/carrier_webhooks_spec.rb --format documentation）"
            code={`POST /webhooks/carrier（直した後）
  配達完了：200 {"status":"processed"}
  置き配：200 {"status":"processed"}
  日時が無い：200 {"status":"rejected"}
  実在しない日付：200 {"status":"rejected"}
  知らない追跡番号：200 {"status":"rejected"}
  data が文字列：200 {"status":"rejected"}
  扱わない種類：200 {"status":"ignored"}
  evt_1002 の再送：200 {"status":"processed"}
  署名が無い：401
  署名が合わない：401
  JSON が壊れている：400
  id が無い：400
  Rails.error に届いた報告: 0件
  発送の状態: 7300-0001=delivered, 7300-0002=delivered, 7300-0003=shipped, 7300-0004=shipped
  7300-0002 の配達日時: 11/22 10:40
  記録した通知:
    evt_1001 processed
    evt_1002 processed
    evt_1003 rejected  配達の日時が無いか、読めません（nil）
    evt_1004 rejected  配達の日時が無いか、読めません（"2026-11-31T10:00:00+09:00"）
    evt_1005 rejected  追跡番号 7300-9999 の発送がありません
    evt_1006 rejected  追跡番号の形が違います（nil）、配達の日時が無いか、読めません（nil）
    evt_1007 ignored
  送り主・形・値を確かめ、処理できない通知は理由を記録して 200 を返す`}
          />
          <Code
            lang="text"
            title="log/test.log（[carrier] で始まる行）"
            code={`[carrier] evt_1003 を処理しませんでした：配達の日時が無いか、読めません（nil）
[carrier] evt_1004 を処理しませんでした：配達の日時が無いか、読めません（"2026-11-31T10:00:00+09:00"）
[carrier] evt_1005 を処理しませんでした：追跡番号 7300-9999 の発送がありません
[carrier] evt_1006 を処理しませんでした：追跡番号の形が違います（nil）、配達の日時が無いか、読めません（nil）`}
          />
          <p>
            置き配の通知（evt_1002）は processed になり、7300-0002 の配達日時には placed_at の 10時40分が入りました。同じ id の再送は記録済みの行を返して processed のまま応答しています。誤りのある4件は rejected になり、それぞれの理由が表とログに残りました。Rails.error への報告は0件です。
          </p>
          <p>処理できない通知にも 200 を返すのは、次の理由からです。</p>
          <ul>
            <li>同じ通知を送り直されても内容は変わらないので、送り直しで結果は変わりません。4xx や 5xx を返して送り直させると、図 80-2 と同じ繰り返しになります。</li>
            <li>通知は表に記録してあるので、送り直しがなくても失われません。送り手の仕様の変更に合わせてコードを直したら、rejected の通知を処理し直せます。</li>
            <li>誤りを直すのは送り手かアプリの担当者で、どちらも Rails.error の報告ではなく、rejected の件数と理由を見て動きます。件数が増えたら担当者に知らせる監視を、表に対して用意します。</li>
          </ul>
          <p>
            送り手が「4xx は送り直さない」という仕様なら、rejected の通知に 422 を返して、送り手の管理画面にも誤りを見せる方法もあります。どちらを返すかは送り手の仕様で決めます。どちらの場合も、記録してから応答する点は変わりません。
          </p>
          <h3>手順5：CSV をファイル・行の順に確かめる</h3>
          <p>
            CSV では、まずファイル全体が取り決めどおりかを確かめます。Excel で「CSV UTF-8」として保存したファイルは、先頭に BOM（バイト順マーク。EF BB BF の3バイト）が付きます。BOM が残ったまま読むと、1列目の名前が「sku」になりません。読み方ごとの違いを確かめました。
          </p>
          <Code
            lang="ruby"
            title="script/bom.rb"
            code={`# Excel の「CSV UTF-8」で保存したファイルは、先頭に BOM（EF BB BF）が付く
path = Rails.root.join("spec/fixtures/files/stocks_1123.csv")
puts "先頭の3バイト: #{File.binread(path, 3).unpack1('H*')}"
{
  "CSV.read(path)" => CSV.read(path, headers: true),
  "CSV.parse(File.read(path))" => CSV.parse(File.read(path), headers: true),
  "CSV.parse(File.read(path, encoding: \\"bom|utf-8\\"))" => CSV.parse(File.read(path, encoding: "bom|utf-8"), headers: true)
}.each { |how, table| puts "#{how} の1列目の名前: #{table.headers.first.dump}" }
puts "csv #{CSV::VERSION}"`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/bom.rb）"
            code={`先頭の3バイト: efbbbf
CSV.read(path) の1列目の名前: "sku"
CSV.parse(File.read(path)) の1列目の名前: "\\uFEFFsku"
CSV.parse(File.read(path, encoding: "bom|utf-8")) の1列目の名前: "sku"
csv 3.3.5`}
          />
          <p>
            ファイルのパスを渡す CSV.read では BOM が除かれましたが、文字列にしてから CSV.parse に渡すと、1列目の名前の先頭に BOM の文字（U+FEFF）が残りました。csv の 3.3.1（2024年12月）から、CSV.open がファイルを開くときに BOM を除くようになり（Windows を除く）<Ref n={12} />、CSV.parse は BOM を除かないと、csv のソースのコメントに書かれています<Ref n={13} />。アップロードされたファイルを文字列として受け取る場合や、古いバージョンの csv を使う場合に備えて、この章では <code>encoding: &quot;bom|utf-8&quot;</code> を明示します。
          </p>
          <p>次に、1行ずつ確かめる StockRow です。DeliveryNotice と同じく、受け取った文字列を持ち、確かめてから整数にします。</p>
          <Code
            lang="ruby"
            title="app/models/stock_row.rb"
            code={`# 在庫数の CSV の1行。外から届いた文字列を確かめてから、型を変えて渡す
class StockRow
  include ActiveModel::API

  attr_accessor :line, :sku, :stock_text # sku と stock_text は受け取ったままの文字列

  validate :stock_format
  validate :product_exists

  # 全角の数字だけを半角にする（意味が変わらないと決めた変換に限る）
  def self.from(row, line:)
    new(line:, sku: row["sku"].to_s.strip, stock_text: row["stock"].to_s.strip.tr("０-９", "0-9"))
  end

  # "0120" を8進数として読まないように、10進数を指定する
  def stock = Integer(stock_text, 10)

  def product
    @product ||= Product.find_by(sku:)
  end

  private

  def stock_format
    return if stock_text.match?(/\\A\\d{1,5}\\z/)

    errors.add(:base, stock_text.empty? ? "在庫数が空です" : "在庫数が 0〜99999 の整数ではありません（#{stock_text.inspect}）")
  end

  def product_exists
    errors.add(:base, "商品コード #{sku.inspect} の商品がありません") unless product
  end
end`}
          />
          <ul>
            <li>
              全角の数字は仕入れ先と「全角で入力された数字は、同じ数として扱う」と取り決めたうえで、<code>tr(&quot;０-９&quot;, &quot;0-9&quot;)</code> で半角にします。変換するのは全角の数字の10文字だけです。どこまで変換するかは次の節で扱います。
            </li>
            <li>空欄は取り決めでは「数え直している途中」なので、0 にせずに除きます。</li>
            <li>
              Kernel#Integer は、基数を渡さないと先頭の 0 を8進数の印として読みます（<code>Integer(&quot;0100&quot;)</code> は 64）<Ref n={14} />。Excel で数字を文字列として扱う列には「0120」のような値が入ることがあるので、10進数を指定しています。
            </li>
          </ul>
          <p>取り込みの処理はファイルを確かめ、行を確かめ、通った行だけを1つのトランザクションで書き込みます。</p>
          <Code
            lang="ruby"
            title="app/services/stock_import.rb（直した後）"
            code={`require "csv"

# 仕入れ先から毎朝届く在庫数の CSV を取り込む。確かめた行だけを書き込み、除いた行と理由を返す
class StockImport
  HEADERS = %w[sku name stock].freeze
  Result = Data.define(:updated, :rejected)

  # ファイル全体が取り決めと違う（列名・文字コード）。1行も書き込まない
  class InvalidFile < StandardError; end

  def self.call(path)
    table = CSV.read(path, headers: true, encoding: "bom|utf-8") # Excel が先頭に付ける BOM を除く
    raise InvalidFile, "列名が #{HEADERS.join(',')} ではありません（#{table.headers.inspect}）" unless table.headers == HEADERS

    rows = table.each.with_index(2).map { |row, line| StockRow.from(row, line:) } # 1行目は列名
    valid, invalid = rows.partition(&:valid?)
    ApplicationRecord.transaction do
      valid.each { |row| row.product.update!(stock: row.stock) }
    end
    Result.new(updated: valid.map { "#{it.sku}=#{it.stock}" },
               rejected: invalid.map { "#{it.line}行目 #{it.sku}：#{it.errors.full_messages.join('、')}" })
  rescue CSV::MalformedCSVError => e # 文字コードの誤り（CSV::InvalidEncodingError）も含む
    raise InvalidFile, "CSV として読めません（#{e.message}）"
  end
end`}
          />
          <p>翌日（11月23日）に届いた、BOM 付きの7行の CSV を取り込みました。6つの商品の在庫数は 40 にしてあります。</p>
          <Code
            lang="text"
            title="spec/fixtures/files/stocks_1123.csv（先頭に BOM が付いている）"
            code={`sku,name,stock
MUG-01,マグカップ（白）,120
MUG-02,マグカップ（黒）,１２０
TEE-01,Tシャツ（M）,
TEE-02,Tシャツ（L）,0120
BAG-01,トートバッグ,35
BAG-02,トートバッグ（大）,12O
CAP-09,キャップ,8`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/stock_import_spec.rb --format documentation）"
            code={`StockImport
  書き込んだ行: MUG-01=120, MUG-02=120, TEE-02=120, BAG-01=35
  除いた行:
    4行目 TEE-01：在庫数が空です
    7行目 BAG-02：在庫数が 0〜99999 の整数ではありません（"12O"）
    8行目 CAP-09：商品コード "CAP-09" の商品がありません
  在庫数: MUG-01=120, MUG-02=120, TEE-01=40, TEE-02=120, BAG-01=35, BAG-02=40
  確かめた行だけを書き込み、除いた行と理由を返す
  stocks_renamed.csv: StockImport::InvalidFile: 列名が sku,name,stock ではありません（["商品コード", "商品名", "在庫数"]）
  stocks_sjis.csv: StockImport::InvalidFile: CSV として読めません（Invalid byte sequence in UTF-8 in line 2.）
  在庫数: MUG-01=40, MUG-02=40, TEE-01=40, TEE-02=40, BAG-01=40, BAG-02=40
  列名が違うファイルや、Shift_JIS のファイルは、1行も書き込まずに断る`}
          />
          <p>
            確認を通った4行が書き込まれ、空欄・英字の混ざった値・知らない商品コードの3行は、行番号と理由付きで除かれました。除いた行の在庫数は前日の 40 のままで、0 にはなっていません。列名が日本語のファイルと、Shift_JIS で保存したファイルは InvalidFile になり、どの商品の在庫数も変わりませんでした。
          </p>
          <p>
            取り込みのジョブは Result の rejected を担当者と仕入れ先に知らせ、InvalidFile ならファイルを作り直してもらうよう連絡します。どちらも外部のデータの誤りなので、Rails.error には送りません。一方、<code>update!</code> が例外を投げた場合は境界の内側の誤りなので、rescue せずにトランザクションごと取り消し、ジョブの失敗として報告させます。
          </p>
          <Figure n="80-6" title="直す前と直した後の、外部のデータの流れ" caption="紫の箱が信頼の境界で行う確認。右の列の灰色の箱は確かめた後の結果。">
            <BeforeAfterFigure />
          </Figure>
          <p>
            図 80-6 の左は届いたデータを確かめずに使う流れです。Webhook では欠けた値が例外になり、CSV では読めない値が 0 になりました。右は送り主・形・値を確かめてから使う流れです。どちらの段でも、通らなかったデータは理由と一緒に残り、正しいデータだけが内側に進みます。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '境界の内側まで防御を重ねたとき',
      body: (
        <>
          <p>
            外部のデータを確かめて効果が出ると、ほかの場所にも確認を足したくなります。この節では境界の内側のメソッドにまで防御を重ねた例と、受け取れる形に直す範囲を広げすぎた例を動かします。どちらも誤りを防ぐつもりで、誤りを見えなくしています。
          </p>
          <h3>境界の内側のメソッドが誤りを例外にしない</h3>
          <p>
            半年後、別の担当者が CarrierEvent#process! を書き直し、<code>deliver!</code> に渡す値を誤りました。DeliveryNotice には受け取ったままの文字列の delivered_at と、確かめて変換した delivered_time があり、名前の似た delivered_at を渡してしまったのです。配達完了の通知では、文字列のままでも Active Record が時刻に変換するので、誤りに気づきませんでした。置き配の通知では、delivered_at は nil です。
          </p>
          <Code
            lang="ruby"
            title="app/models/carrier_event.rb（誤りが入った形。変わった1行）"
            code={`      notice.shipment.deliver!(at: notice.delivered_at) # 誤り：delivered_time を渡すはずだった`}
          />
          <p>このとき、Shipment#deliver! が「念のため」どんな値を渡されても例外にしない形だったとします。</p>
          <Code
            lang="ruby"
            title="app/models/shipment.rb（当てはめすぎた形）"
            code={`class Shipment < ApplicationRecord
  enum :status, { shipped: "shipped", delivered: "delivered" }, validate: true

  # 念のため、どんな値を渡されても例外にしない（当てはめすぎた形）
  def deliver!(at:)
    return false if at.blank?
    return false unless shipped?

    update(status: :delivered, delivered_at: at)
  end
end`}
          />
          <p>置き配の通知を1件送り、応答・記録・発送の状態・報告を表示しました。</p>
          <Code
            lang="ruby"
            title="spec/requests/carrier_bug_spec.rb（関係する部分）"
            code={`  it "結果を表示する" do
    Shipment.create!(order_number: "A-2002", tracking_number: "7300-0002")
    deliver({ id: "evt_1002", type: "parcel.delivered",
              data: { tracking_number: "7300-0002", placed_at: "2026-11-22T10:40:00+09:00", place: "宅配ボックス" } })
    puts "  応答: #{response.status} #{response.body if response.successful?}"
    puts "  記録した通知: #{CarrierEvent.pluck(:event_id, :status).inspect}"
    puts "  7300-0002 の状態: #{Shipment.find_by!(tracking_number: '7300-0002').status}"
    puts "  Rails.error に届いた報告: #{reported.map { "#{it.class}: #{it.message}" }.inspect}"
  end`}
          />
          <Code
            lang="text"
            title="実行結果（当てはめすぎた deliver! のとき）"
            code={`呼ぶ側の誤りで、置き配の日時を渡さなかったとき
  応答: 200 {"status":"processed"}
  記録した通知: [["evt_1002", "processed"]]
  7300-0002 の状態: shipped
  Rails.error に届いた報告: []
  結果を表示する`}
          />
          <p>
            <code>deliver!</code> は nil を受け取って false を返し、process! は戻り値を見ずに通知を processed にしました。応答は 200 なので、配送業者は送り直しません。荷物は届いているのに発送は shipped のまま、通知は処理済みとして記録され、報告も0件です。誰も気づかないうえに、記録を見ても処理し直す対象になりません。
          </p>
          <p>同じ誤りを、手順4の <code>deliver!</code>（nil なら ArgumentError）で動かしました。</p>
          <Code
            lang="text"
            title="実行結果（手順4の deliver! のとき）"
            code={`呼ぶ側の誤りで、置き配の日時を渡さなかったとき
  応答: 500
  記録した通知: [["evt_1002", "received"]]
  7300-0002 の状態: shipped
  Rails.error に届いた報告: ["ArgumentError: 配達の日時が nil です（境界で確かめた日時を渡してください）"]
  結果を表示する`}
          />
          <p>
            応答は 500 になり、ArgumentError が報告されました。process! のトランザクションも取り消されたので、通知は received のまま残っています。これは外部のデータの誤りではなく、自分たちのコードの誤りなので、例外で止めて報告するのが合っています。配送業者は 500 を受け取って送り直すので、呼ぶ側を直した後に届いた通知は、received の行として処理されます。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/carrier_webhooks_spec.rb（received のまま残った通知の再送）"
            code={`  it "received のまま残った通知は、送り直されたときに処理する" do
    Shipment.create!(order_number: "A-2002", tracking_number: "7300-0002")
    body = { id: "evt_1002", type: "parcel.delivered",
             data: { tracking_number: "7300-0002", placed_at: "2026-11-22T10:40:00+09:00", place: "宅配ボックス" } }
    # 前の要求で記録した後、処理の途中の例外で 500 を返した状態
    CarrierEvent.create!(event_id: "evt_1002", event_type: "parcel.delivered", payload: body.to_json)
    deliver(body)
    puts "  再送の応答: #{response.status} #{response.body}、7300-0002 の状態: #{Shipment.find_by!(tracking_number: '7300-0002').status}"
    expect(CarrierEvent.find_by!(event_id: "evt_1002")).to be_processed
  end`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`POST /webhooks/carrier（前の処理が例外で止まった通知の再送）
  再送の応答: 200 {"status":"processed"}、7300-0002 の状態: delivered
  received のまま残った通知は、送り直されたときに処理する`}
          />
          <p>
            当てはめすぎた <code>deliver!</code> の3行の確認は、Meyer が批判した「念のため」の確認そのものです<Ref n={1} />。日時は DeliveryNotice が確かめ済みで、状態の誤りは呼ぶ側の誤りです。どちらも内側の前提が成り立っていないことを示すので、false を返して処理を続けるのではなく、例外にして、開発者に見える形にします。図 80-7 は誤りを見つけた場所と、そのときの扱いの組み合わせを並べたものです。
          </p>
          <Figure n="80-7" title="境界と内側で、誤りを見つけたときの扱い" caption="この章の4つの実行結果を当てはめた図。○は向いている組み合わせ、×は問題が起きた組み合わせ。">
            <QuadrantFigure />
          </Figure>
          <p>
            図 80-7 の左上と右下が、この章で問題が起きた組み合わせです。左上は外部のデータの誤りを例外で止めたので、送り手が直すまで 500 と報告が続きました。右下は自分たちのコードの誤りを境界と同じ扱い（記録して続ける）にしたので、記録すら正しく残りませんでした。防御的プログラミングと Fail Fast は、どちらか一方を選ぶものではなく、誤りを見つけた場所で使い分けます。
          </p>
          <h3>受け取れる形に直しすぎる</h3>
          <p>
            手順5では全角の数字だけを半角にしました。仕入れ先の入力のゆれをもっと受け取ろうとして、Unicode の NFKC 正規化（全角の英数字や丸数字などを、互換のある普通の文字に変える変換）をかけ、数字以外の文字を消す書き方にした場合と比べました。
          </p>
          <Code
            lang="ruby"
            title="script/normalize.rb"
            code={`# 受け取れる形に直す処理を広げすぎた例：NFKC で正規化して、数字以外の文字を消す
def lenient_stock(text) = text.unicode_normalize(:nfkc).gsub(/\\D/, "")

["１２０", "1,200", "12.5", "-3", "120〜150", "約50", "①２０", "２³"].each do |text|
  strict = StockRow.new(sku: "MUG-01", stock_text: text.tr("０-９", "0-9"))
  puts "#{text.inspect} → 広げすぎた形 #{lenient_stock(text).inspect}、StockRow #{strict.valid? ? strict.stock : "除く"}"
end
puts "Integer(\\"0120\\") = #{Integer("0120")}、Integer(\\"0120\\", 10) = #{Integer("0120", 10)}"`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/normalize.rb）"
            code={`"１２０" → 広げすぎた形 "120"、StockRow 120
"1,200" → 広げすぎた形 "1200"、StockRow 除く
"12.5" → 広げすぎた形 "125"、StockRow 除く
"-3" → 広げすぎた形 "3"、StockRow 除く
"120〜150" → 広げすぎた形 "120150"、StockRow 除く
"約50" → 広げすぎた形 "50"、StockRow 除く
"①２０" → 広げすぎた形 "120"、StockRow 除く
"２³" → 広げすぎた形 "23"、StockRow 除く
Integer("0120") = 80、Integer("0120", 10) = 120`}
          />
          <p>
            広げすぎた形では、どの値も例外にならずに数字の文字列になりました。しかし「12.5」は 125、「-3」は 3、「120〜150」は 120150 になり、元の値とは違う数として保存されます。「1,200」の 1200 と「１２０」の 120 は意図どおりですが、同じ処理が意図と違う値も作るので、結果だけを見ても正しいかどうかを見分けられません。
          </p>
          <p>
            OWASP は、怪しい文字を取り除いて入力を「きれいにする」と値の意味が変わりうると注意し、Unicode の互換の正規化は意味のある違いを消すことがあると書いています<Ref n={3} />。RFC 9413 は、想定外の入力を許すと、問題が隠れて後から直しにくくなると書いています<Ref n={5} />。この例でも、仕入れ先は「120〜150」のような範囲の書き方が受け取られていると考え、送り方を直す理由がなくなります。
          </p>
          <p>
            受け取る形を広げるときは、送り手と取り決めたうえで、1つの変換ずつ足します。「1,200」を受け取ると決めたら、3桁ごとのカンマの形（<code>/\A\d{'{1,3}'}(,\d{'{3}'})+\z/</code>）だけを許してカンマを消すように、変換の対象を形で限ります。それ以外の値は理由を付けて除き、送り手に直してもらいます。
          </p>
          <h3>同じ確認を何か所にも書く</h3>
          <p>
            追跡番号の形（4桁-4桁）を、コントローラー・DeliveryNotice・CarrierEvent・Shipment のバリデーションのそれぞれで確かめると、配送業者が追跡番号を5桁にしたときに4か所を直すことになります。1か所を直し漏らすと、ある場所では通り、別の場所では断られる値ができます。Meyer が書いたとおり、重複した確認はコードを増やし、そのコード自体が誤りの原因になります<Ref n={1} />。
          </p>
          <p>
            この章では、外部のデータの形と値は境界のクラス（DeliveryNotice・StockRow）の1か所で確かめます。テーブルが必ず守る条件（追跡番号の一意性、NOT NULL）は DB の制約に置き（<ChapterLink n={81} />）、内側のメソッドには前提が成り立たないときのアサーションだけを置きます。
          </p>
          <h3>判断の目安</h3>
          <p>図 80-8 は、この章で使った確認と扱いを、置く場所と、効果がある条件・逆効果になる条件で並べたものです。</p>
          <Figure n="80-8" title="確認と扱いを置く場所の目安" caption="上の5行は信頼の境界に置くもの、最後の行は境界の内側に置くもの。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">確認・扱い</th>
                    <th scope="col">置く場所（この章の例）</th>
                    <th scope="col">効果がある条件</th>
                    <th scope="col">逆効果になる条件</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>送り主の確認</td>
                    <td>コントローラーの before_action（署名）</td>
                    <td>送り手と鍵を取り決められる、外部のシステムからの要求</td>
                    <td>鍵を取り決められない利用者の要求には使えない。ログインと認可で守る</td>
                  </tr>
                  <tr>
                    <td>形・型・値・業務の条件の確認</td>
                    <td>境界のクラス（DeliveryNotice・StockRow）</td>
                    <td>送り手が仕様を変える、人が手で入力する</td>
                    <td>内側のメソッドで同じ確認を繰り返すと、規則が何か所にも分かれる</td>
                  </tr>
                  <tr>
                    <td>正規化（受け取れる形に直す）</td>
                    <td>境界で、型を変える前（全角の数字）</td>
                    <td>意味が変わらないと送り手と取り決めた変換</td>
                    <td>文字を消して数字を作ると、意味の違う値を正しい値として保存する</td>
                  </tr>
                  <tr>
                    <td>理由を記録して、その1件を除く</td>
                    <td>carrier_events・除いた行の一覧</td>
                    <td>送り直しても内容が変わらない誤り、行どうしが独立しているデータ</td>
                    <td>記録を誰も見なければ気づかない（件数を監視する）。行どうしが関係するデータでは、一部だけ反映すると合計が合わなくなる</td>
                  </tr>
                  <tr>
                    <td>データ全体を断る</td>
                    <td>署名・JSON の構文・列名・文字コード</td>
                    <td>中の値を1つも信用できない誤り</td>
                    <td>1行の値の誤りでファイル全体を断ると、正しい行も反映されない</td>
                  </tr>
                  <tr>
                    <td>例外で止めて報告する（Fail Fast）</td>
                    <td>境界の内側（deliver! のアサーション、update!）</td>
                    <td>自分たちのコードの誤り、確かめた後の前提が成り立たないこと</td>
                    <td>外部のデータの誤りに使うと、送り手が直すまで 500 と報告が続く</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>確認を足すか迷ったときは、次の順に考えます。</p>
          <ol>
            <li>その値はどこで作られたか。アプリの外で作られ、まだ境界を通っていないなら、境界で確かめます。</li>
            <li>その値はすでに境界のどこかで確かめたか。確かめたなら、内側では同じ確認を書かず、前提が成り立たないときのアサーションだけにします。</li>
            <li>通らなかったとき、直すのは誰か。送り手なら理由を記録して知らせ、自分たちなら例外で止めて報告します。</li>
            <li>通らなかったデータを除いて続けたとき、残りのデータだけで正しい結果になるか。ならないなら、データ全体を断ります。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の境界の機能と Fail Fast との分担',
      body: (
        <>
          <h3>Rails が境界で行う確かめ</h3>
          <p>Rails は次の例外を rescue_responses の表で 400 に変換します。既定では Rails.error に報告しません<Ref n={8} />。</p>
          <ul>
            <li>JSON の本文が読めない：ActionDispatch::Http::Parameters::ParseError（400）</li>
            <li>params.expect で、必要なパラメーターが無いか形が違う：ActionController::ParameterMissing（400）</li>
          </ul>
          <p>許可していないパラメーターをまとめてモデルに渡すと ActiveModel::ForbiddenAttributesError が発生します。Rails 8.1.4.1 の既定の表には登録されていないため、個別に処理しなければ 500 になります。コントローラーで必要なパラメーターを指定してからモデルへ渡します。<ChapterLink n={21} section="untrusted-input" /></p>
          <p>
            params.expect のソースのコメントは、このメソッドの目的を、配列やハッシュをすり替えた値（array tampering）から守ることだと書いています。たとえば <code>user</code> にハッシュの代わりに文字列が届くと、それまでの <code>params.require(:user).permit(…)</code> は NoMethodError（500）になりますが、expect は ParameterMissing（400）にします<Ref n={7} />。外部から届く値の形の誤りを、アプリの誤り（500）ではなく要求の誤り（400）として扱うための仕組みです。
          </p>
          <h3>expect と expect!：外部の誤りか自分たちの誤りか</h3>
          <p>
            Rails には、同じ確認で例外の扱いだけが違う <code>expect!</code> もあります。data に文字列が届いた場合で、2つを比べました。
          </p>
          <Code
            lang="ruby"
            title="script/expect.rb"
            code={`# data が文字列で届いたときの expect と expect! の違い
params = ActionController::Parameters.new(id: "evt_1006", type: "parcel.delivered", data: "7300-0003")
%i[expect expect!].each do |name|
  params.public_send(name, :id, data: [:tracking_number])
rescue ActionController::ParameterMissing => e
  status = ActionDispatch::ExceptionWrapper.status_code_for_exception(e.class.name)
  puts "#{name}: #{e.class}（応答は #{status}）"
end`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/expect.rb）"
            code={`expect: ActionController::ParameterMissing（応答は 400）
expect!: ActionController::ExpectedParameterMissing（応答は 500）`}
          />
          <p>
            ExpectedParameterMissing は ParameterMissing のサブクラスですが、rescue_responses の表は例外のクラス名で引くので、表に無い ExpectedParameterMissing は 500 になり、報告されます。ソースのコメントは expect! の用途を、社内の API で、パラメーターの形の誤りがクライアントのライブラリのバグを意味する場合のデバッグ用だと書いています<Ref n={7} />。
          </p>
          <p>
            この2つのメソッドはこの章の使い分けと同じ形をしています。外部から届く要求の形の誤りは、送り手が直すものなので expect で 400 にします。自分たちが作ったクライアントだけが呼ぶ API で形が違うなら、それは自分たちのコードの誤りなので、expect! で 500 にして報告します（<ChapterLink n={79} />）。
          </p>
          <h3>型の変換とバリデーションの分担</h3>
          <p>
            Rails の型の変換（ActiveModel::Type）は、フォームから届いた文字列を Ruby の値にするためのもので、変換できない値を誤りにはしません（図 80-5）。Active Record のモデルでは、numericality のバリデーションが変換する前の値を確かめるので、利用者のフォームの「abc」は誤りになります。一方、ActiveModel::API と ActiveModel::Attributes で作ったクラスには変換する前の値を読むメソッドが無く、変換した後の値が確かめられます<Ref n={10} />。外部のデータを受け取る境界のクラスでは、この章の DeliveryNotice・StockRow のように受け取った文字列のまま持ち、形を確かめてから自分で変換するほうが、確かめた内容がはっきりします。
          </p>
          <h3>Rails Doctrine の「The menu is omakase」</h3>
          <p>
            Rails Doctrine の「The menu is omakase」は、Rails が部品の組み合わせをあらかじめ選んで提供する理由の1つとして、多くの人が同じ部品を同じ使い方で使えば、部品の組み合わせから来る問題を皆で見つけて直せることを挙げています<Ref n={15} />。この章の境界は Rails に入っている部品（params.expect、ActiveModel::API のバリデーション、ActiveSupport::SecurityUtils.secure_compare、create_or_find_by!）だけで作りました。JSON スキーマの検証のような別の gem を加える方法もありますが、Rails の部品で足りるうちは、同じ部品を使うほかのアプリと同じ動きをするので、誤りの調べ方も共有できます。Doctrine 自体は入力の確かめ方について述べていないので、これはこの章の解釈です。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2.2.1 の Action Pack には、<code>params.expect</code> と <code>expect!</code> がありません<Ref n={16} />。7.2 では <code>id, type = params.require([:id, :type])</code> で受け取ります。値が無いときに ParameterMissing（400）になる点は同じですが、require は値がハッシュや配列でもそのまま返すので、文字列であることを別に確かめます。ParseError と ParameterMissing を 400 にする rescue_responses、<code>ActiveSupport::SecurityUtils.secure_compare</code>、<code>create_or_find_by!</code> は、7.2.2.1 にも同じ形であります。CSV の BOM は Rails のバージョンではなく csv のバージョンで扱いが変わるので、<code>CSV::VERSION</code> で確かめます。
            </p>
          </Callout>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={21} section="untrusted-input" />：利用者から届く値は送る側が自由に作れることと、Strong Parameters を扱いました。<ChapterLink n={21} section="input-boundaries" />は外部コマンド・ファイル・外向きの通信の境界での制限を扱っています。
            </li>
            <li>
              <ChapterLink n={52} section="webhook" />（Idempotency Key）：Webhook のイベントの id を一意索引で記録し、同じイベントを1回だけ処理する方法と、記録を残す期間です。
            </li>
            <li>
              <ChapterLink n={34} section="external-boundaries" />：署名を確かめてイベントを保存し、処理をジョブに任せる Webhook の受け手の構成です。処理に時間がかかる通知は、この構成にします。
            </li>
            <li>
              <ChapterLink n={79} />（Fail Fast）：境界の内側の誤りを例外で止める方法と、rescue_responses の表で 4xx になる例外が報告されないことを扱いました。
            </li>
            <li>
              <ChapterLink n={80} />（Design by Contract）：呼び出し側と呼ばれる側の取り決め（前提条件）を扱います。この章の Meyer の主張の続きです。
            </li>
            <li>
              <ChapterLink n={91} />（Graceful Degradation）：外部のサービスが応答しないときに、残りの機能で動き続ける方法です。2つの原則の比べ方は <ChapterLink n={93} section="failfast-graceful" /> でまとめます。
            </li>
            <li>
              <ChapterLink n={14} section="validations" />：Active Record のバリデーションの書き方です。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          外部から届いたデータは信頼の境界で1回だけ、送り主・形・値の順に確かめます。境界の内側では同じ確認を重ねず、前提が成り立たないときは例外で止めて報告します（Fail Fast）。全角の数字を半角にするような受け取れる形に直す変換は、仕入れ先と取り決めた範囲に限ります。
        </>
      ),
      benefit: {
        text: <>直す前は、置き配の通知に delivered_at が無いだけで TypeError の 500 になり、CSV の「１２０」と空欄は to_i で 0 になった。直した後は、置き配の通知が processed になり、誤りのある4件は理由付きで rejected として残った。CSV は確認を通った4行だけを書き込み、除いた3行の在庫数は前日の 40 のままだった。</>,
        basis: <><ChapterLink n={82} section="scene" />、<ChapterLink n={82} section="apply" /></>,
      },
      cost: {
        text: <>受け取った通知を記録する表と、rejected の件数を見て担当者に知らせる監視が要る。送り手の仕様の変更に合わせて、DeliveryNotice・StockRow の確認と、境界のテストを直し続ける必要がある。</>,
        basis: <ChapterLink n={82} section="apply" />,
      },
      alternative: {
        text: <>内側の Shipment#deliver! は、nil を受け取ったら false を返さず ArgumentError で止める。false を返す形にした例では、荷物は届いたのに発送は shipped のまま、通知は処理済みとして記録され、どこにも報告されなかった。全角の数字だけを半角にし、NFKC 正規化のような広い変換はしない（「12.5」が 125 になった）。</>,
        basis: <ChapterLink n={82} section="overuse" />,
      },
      criterion: {
        text: <>その値はアプリの外で作られ、まだ境界を通っていないか。通らなかったとき、直すのは送り手か自分たちか。通らなかったデータを除いて続けたとき、残りのデータだけで正しい結果になるか（署名・列名・文字コードの誤りはデータ全体を断る）。</>,
        basis: <ChapterLink n={82} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>防御的プログラミングは外部からの入力や信頼できないデータによる問題を防ぐ考え方です。外から届いたデータは誤りを含みうる前提で使う前に確かめ、通らなかったときの扱いを決めておきます。</li>
          <li>直す前のコードでは、置き配の通知に delivered_at が無いだけで TypeError の 500 になり、送り直しのたびに同じ報告が届いて、通知は残りませんでした。CSV の「１２０」と空欄は to_i で 0 になり、誤りとして扱われませんでした。</li>
          <li>Meyer は1992年に、呼び出し側と呼ばれる側の両方に同じ確認を書く防御的プログラミングを批判しました。この章では、外部のデータは信頼の境界で1回確かめ、内側では確かめた前提で書きます。</li>
          <li>境界では送り主（署名）・構文と形（params.expect）・値と業務の条件（DeliveryNotice・StockRow）の順に確かめます。Rails の型の変換は「１２０」「12O」や存在しない日付を誤りにしないので、変換する前に文字列を確かめます。</li>
          <li>処理できない外部のデータは、理由を記録してその1件を除き、後から処理し直せるようにします。中の値を信用できない誤り（署名・列名・文字コード）は、データ全体を断ります。</li>
          <li>境界の内側では、前提が成り立たなければ例外で止めて報告します（Fail Fast）。内側のメソッドで誤りを false に変えると、誤りも記録も見えなくなります。</li>
          <li>受け取れる形に直す変換は、送り手と取り決めた範囲に限ります。文字を消して数字を作るような広い変換は、意味の違う値を正しい値として保存します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Applying "Design by Contract"', publisher: 'Bertrand Meyer / IEEE Computer（ETH Zürich に置かれた複製）', url: 'https://se.inf.ethz.ch/~meyer/publications/computer/contract.pdf', accessed: '2026-11-22', version: 'IEEE Computer 1992年10月号', note: '節「Defensive programming revisited」。信頼性を扱う教科書が防御的プログラミングを強調し、呼び出し側と重複する確認もできるだけ入れるよう勧めていること。念のための冗長なコードが複雑さを増し、品質と信頼性を下げること。条件は前提条件（Require）か本体の If のどちらかに書き、両方には書かないことが、防御的プログラミングと正反対の原則であること。' },
    { title: 'Code Complete, Second Edition（見本のページ：目次と索引）', publisher: 'Steve McConnell / Microsoft Press（Cisco Press のサイトに置かれた見本）', url: 'https://www.ciscopress.com/content/images/9780735619678/samplepages/9780735619678a.pdf', accessed: '2026-11-22', version: '第2版（2004年）', note: '第8章の題が Defensive Programming で、8.1〜8.8 の節（不正な入力から守る、アサーション、エラー処理、例外、バリケード、デバッグの補助、本番に残す量、防御的プログラミングそのものへの用心）があること。索引の defensive programming の項目に robustness vs. correctness、security issues、problems caused by があり、別の項目に offensive programming があること。本文は確かめていない。' },
    { title: 'Input Validation Cheat Sheet', publisher: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html', accessed: '2026-11-22', note: '構文と意味の両方を確かめること。文字列を整数に変換しても受け付けてよい数量かは決まらないこと。不正な要求ははっきりしたエラーで断り、一部だけ確かめたデータで続けないこと。社内の API・取引先のデータ・キュー・保存済みのレコードも信頼の境界を越えるときは確かめること。断った入力をそのままログに書かないこと。入力を「きれいにする」と意味が変わりうること。互換の正規化が意味のある違いを消しうること。' },
    { title: 'RFC 761: DoD Standard Transmission Control Protocol（2.10 Robustness Principle）', publisher: 'IETF / RFC Editor', url: 'https://www.rfc-editor.org/rfc/rfc761.txt', accessed: '2026-11-22', version: '1980年1月', note: '「be conservative in what you do, be liberal in what you accept from others」という頑健性原則の一文。' },
    { title: 'RFC 9413: Maintaining Robust Protocols', publisher: 'IAB / RFC Editor（M. Thomson, D. Schinazi）', url: 'https://www.rfc-editor.org/rfc/rfc9413.txt', accessed: '2026-11-22', version: '2023年6月', note: '頑健性原則がさまざまに解釈されてきたこと。想定外の入力を許すと誤りが事実上の仕様として定着し、ほかの実装もそれに合わせることになること。想定外の入力を許すことは問題を隠し、後から直しにくくすること。' },
    { title: 'Receive Stripe events in your webhook endpoint', publisher: 'Stripe Documentation', url: 'https://docs.stripe.com/webhooks', accessed: '2026-11-22', note: 'どの項目を信用するよりも先に署名を確かめること。署名の確認には手を加えていない元の本文が要ること。リプレイ攻撃を防ぐために署名のヘッダーに時刻を含めること。2xx を素早く返すこと。届かなかったイベントを最長3日間、間隔を広げながら自動で送り直すこと。' },
    { title: 'actionpack/lib/action_controller/metal/strong_parameters.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/strong_parameters.rb#L700-L797`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'expect が配列やハッシュのすり替え（array tampering）から守るためのもので、require.permit が NoMethodError になる値を ParameterMissing にすること。expect! が ExpectedParameterMissing を投げ、400 にならず、社内の API でクライアントのライブラリのバグを見つけるためのものであること。ExpectedParameterMissing の定義は同じファイルの49行目。' },
    { title: 'actionpack/lib/action_dispatch/middleware/exception_wrapper.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/exception_wrapper.rb#L12-L29`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'rescue_responses の表で ParseError と ParameterMissing が 400 に対応し、表に無い例外は 500 になること。181〜183行目で、表を例外のクラス名で引くこと。' },
    { title: 'activesupport/lib/active_support/security_utils.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/security_utils.rb#L24-L35`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'secure_compare が長さの違う文字列も比べられ、比べた内容は時間から推測できないが、長さは推測されうること。' },
    { title: 'activemodel/lib/active_model/validations/numericality.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/validations/numericality.rb#L122-L141`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'numericality が、属性名_before_type_cast を読めるときは変換する前の値を確かめ、読めないときは変換した後の値を確かめること。' },
    { title: 'activemodel/lib/active_model/type/integer.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/type/integer.rb#L112-L120`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '文字列を to_i で整数に変換すること。' },
    { title: 'NEWS.md（3.3.1 - 2024-12-15）', publisher: 'ruby/csv（GitHub）', url: 'https://github.com/ruby/csv/blob/v3.3.5/NEWS.md#L60-L67', accessed: '2026-11-22', version: 'csv 3.3.5 のタグ', note: 'csv 3.3.1 で CSV.open が既定で BOM を検出するようになったこと。Windows では有効にしないこと。' },
    { title: 'lib/csv.rb', publisher: 'ruby/csv（GitHub）', url: 'https://github.com/ruby/csv/blob/v3.3.5/lib/csv.rb#L1811-L1816', accessed: '2026-11-22', version: 'csv 3.3.5', note: 'CSV.parse が BOM を自動では除かないので、File.open に bom|utf-8 を渡して除くこと。1963〜1981行目で、CSV.open が encoding を指定されていないときに bom|utf-8 を使うこと。' },
    { title: 'module Kernel（Integer）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Kernel.html#method-i-Integer', accessed: '2026-11-22', version: 'Ruby 4.0', note: '基数を渡さないとき、先頭の 0 を8進数の印として読むこと（Integer("0100") は 64）。基数を渡すとその基数で読むこと。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-22', note: '「The menu is omakase」で、多くの人が同じ部品を同じ使い方で使うと、部品の組み合わせから来る問題を皆で見つけて直せると述べていること。' },
    { title: 'actionpack/lib/action_controller/metal/strong_parameters.rb（Rails 7.2.2.1）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.2.1/actionpack/lib/action_controller/metal/strong_parameters.rb#L495-L530', accessed: '2026-11-22', version: 'Rails 7.2.2.1', note: 'Rails 7.2.2.1 の Parameters に expect と expect! が無く、require がキーの配列を受け取って値を順に返し、値が present なら形を問わず返すこと。同じバージョンの exception_wrapper.rb でも ParseError と ParameterMissing が 400 に対応すること。' },
  ],
}

export default chapter
