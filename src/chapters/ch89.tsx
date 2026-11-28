import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 87-1 決済の処理の構成と、時間が見えない箇所 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="87-1"
      w={780}
      h={410}
      label="ブラウザーが POST /orders/6/checkout を送ると、CheckoutsController#create が注文を読み、PaymentGateway で決済代行の API を呼び、注文を更新する。PaymentGateway は Faraday の json・retry・net_http を順に通り、タイムアウトの1.0秒を超えると retry が1回やり直す。決済代行の API は6回に1回、応答に1.5秒かかる。コントローラーは log/production.log に自由な文の2行を書く。問題は4つ。Completed の行には ActiveRecord と Views の時間しか出ず残りの約1秒の内訳がない、やり直しがログに出ない、自由な文に金額・時間・回数がない、何件が遅いかは行を数えないとわからない"
    >
      <Box x={20} y={55} w={170} h={56} lines={['ブラウザー', 'POST /orders/6/checkout']} fs={12} subTone="muted" />
      <Arrow x1={190} y1={83} x2={238} y2={83} />
      <Box x={240} y={41} w={220} h={86} lines={['CheckoutsController#create', '1. Order.find', '2. PaymentGateway#charge', '3. order.update!']} fs={12} bold />
      <Arrow x1={460} y1={83} x2={508} y2={83} />
      <rect x={510} y={30} width={250} height={160} rx={6} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={635} y={48} anchor="middle" fs={12} bold>
        PaymentGateway（Faraday）
      </T>
      <Box x={525} y={64} w={220} h={30} lines="request :json" fs={11} mono fill="bg" />
      <Box x={525} y={102} w={220} h={30} lines="request :retry（max: 1）" fs={11} mono fill="box5" accent />
      <Box x={525} y={140} w={220} h={30} lines="net_http（timeout 1.0秒）" fs={11} mono fill="bg" />
      <Arrow x1={700} y1={190} x2={700} y2={238} />
      <T x={520} y={214} fs={11} tone="danger">
        ② やり直しはログに出ない
      </T>
      <Box x={510} y={240} w={250} h={56} lines={['決済代行の API', '6回に1回、応答に1.5秒かかる']} fs={12} bold fill="box4" subTone="muted" />
      <Arrow x1={350} y1={127} x2={350} y2={168} />
      <Box x={240} y={170} w={220} h={50} lines={['MySQL（orders）', 'find と update!']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={262} y1={127} x2={170} y2={168} dashed />
      <Box x={20} y={170} w={190} h={66} lines={['log/production.log', '決済を開始します 注文=A0006', '決済が完了しました']} fs={11} bold fill="box4" />
      <T x={20} y={254} fs={11} tone="danger">
        ①③④ 時間の内訳・金額・回数がない
      </T>
      <T x={20} y={322} fs={12} tone="danger">
        ① Completed の行には ActiveRecord と Views の時間だけが出て、残りの約1秒の内訳がない
      </T>
      <T x={20} y={344} fs={12} tone="danger">
        ② Faraday の retry がやり直しても、ログには1行も出ない
      </T>
      <T x={20} y={366} fs={12} tone="danger">
        ③ 自由な文の行には、金額・かかった時間・やり直しの回数がない
      </T>
      <T x={20} y={388} fs={12} tone="danger">
        ④ 30件のうち何件が遅いかは、Completed の行を全部読んで数えるしかない
      </T>
    </Svg>
  )
}

/* ---------- 図 87-2 request_id でつながるログ ---------- */
const reqFill = { a: 'box', b: 'box2', c: 'box3', d: 'box4', e: 'box5' } as const
const reqId = { a: '971f8d99', b: 'd8bffe7b', c: '09e22bef', d: '932f4580', e: 'f4de6736' } as const
type ReqKey = keyof typeof reqId
const logRows: { k: ReqKey; text: string }[] = [
  { k: 'a', text: 'Started POST "/orders/1/checkout"' },
  { k: 'b', text: 'Started POST "/orders/2/checkout"' },
  { k: 'c', text: 'Started POST "/orders/4/checkout"' },
  { k: 'd', text: 'Started POST "/orders/5/checkout"' },
  { k: 'e', text: 'Started POST "/orders/3/checkout"' },
  { k: 'a', text: '決済を開始します 注文=A0001' },
  { k: 'b', text: '決済を開始します 注文=A0002' },
  { k: 'd', text: '決済を開始します 注文=A0005' },
  { k: 'c', text: '決済を開始します 注文=A0004' },
  { k: 'e', text: '決済を開始します 注文=A0003' },
  { k: 'b', text: '決済が完了しました' },
  { k: 'b', text: 'Completed 200 OK in 263ms' },
  { k: 'a', text: '決済が完了しました' },
  { k: 'a', text: 'Completed 200 OK in 287ms' },
]
const groups: { k: ReqKey; title: string; y: number }[] = [
  { k: 'a', title: '注文 A0001 の要求', y: 44 },
  { k: 'b', title: '注文 A0002 の要求', y: 178 },
]

function RequestIdFigure() {
  const rowY = (i: number) => 52 + i * 24
  return (
    <Svg
      id="87-2"
      w={780}
      h={436}
      label="左は本番の設定で書かれたログの14行を、書かれた順に並べたもの。5件の決済の要求が同時に進むので、Started の行、決済を開始しますの行、決済が完了しましたの行が入り混じる。行の先頭には要求ごとの request_id が付いていて、色で区別している。右は request_id ごとに並べ直したもので、注文 A0001 の要求は Started、開始、完了、Completed 287ms の4行、注文 A0002 の要求は同じ4行で Completed 263ms になる。11行目の決済が完了しましたは、request_id がなければ A0001 から A0005 のどれの行か決められない"
    >
      <T x={20} y={22} fs={12} bold>
        ログの行（書かれた順。5件の要求が同時に進む）
      </T>
      {logRows.map((r, i) => (
        <g key={i}>
          <Box x={20} y={rowY(i) - 9} w={74} h={18} lines={reqId[r.k]} fs={10} mono fill={reqFill[r.k]} rx={3} />
          <T x={104} y={rowY(i)} fs={11} tone={i === 10 ? 'danger' : undefined}>
            {r.text}
          </T>
        </g>
      ))}
      <T x={14} y={rowY(10)} fs={10} anchor="end" tone="danger">
        11
      </T>
      <Arrow x1={350} y1={200} x2={428} y2={200} accent />
      <T x={389} y={170} fs={11} anchor="middle" tone="acc">
        request_id
      </T>
      <T x={389} y={186} fs={11} anchor="middle" tone="acc">
        で分ける
      </T>
      <T x={440} y={22} fs={12} bold>
        request_id ごとに並べ直した行
      </T>
      {groups.map((g) => {
        const rows = logRows.filter((r) => r.k === g.k)
        return (
          <g key={g.k}>
            <rect x={440} y={g.y} width={320} height={122} rx={6} fill="none" stroke="var(--fig-line)" />
            <Box x={452} y={g.y + 10} w={80} h={20} lines={reqId[g.k]} fs={10} mono fill={reqFill[g.k]} rx={3} />
            <T x={544} y={g.y + 20} fs={12} bold>
              {g.title}
            </T>
            {rows.map((r, i) => (
              <T key={i} x={456} y={g.y + 46 + i * 22} fs={11}>
                {r.text}
              </T>
            ))}
          </g>
        )
      })}
      <T x={440} y={322} fs={11} tone="muted">
        残りの3件（A0003〜A0005）も同じように分けられる
      </T>
      <T x={20} y={402} fs={11} tone="danger">
        11行目の「決済が完了しました」が A0001〜A0005 のどれの行かは、
      </T>
      <T x={20} y={420} fs={11} tone="danger">
        request_id がなければ決められない
      </T>
    </Svg>
  )
}

/* ---------- 図 87-4 Rails の計測の仕組み ---------- */
function InstrumentFigure() {
  const cols = [
    { x: 20, w: 170 },
    { x: 210, w: 200 },
    { x: 430, w: 160 },
    { x: 610, w: 150 },
  ]
  const cx = (i: number) => cols[i].x + cols[i].w / 2
  return (
    <Svg
      id="87-4"
      w={780}
      h={500}
      label="Rails の部品、Faraday の instrumentation、アプリのコードが ActiveSupport::Notifications の instrument でイベントを発行する。購読するのは4つ。LogSubscriber は人が読む文のログを log/production.log に書く。StructuredEventSubscriber は Rails 8.1 で入った仕組みで、イベントを Rails.event の出来事に変える。Rails.event には、アプリのコードが notify で直接送る出来事と、EventContext ミドルウェアが set_context で入れる request_id も入る。Rails.event の購読者 JsonEventLog は、出来事を1行の JSON にして log/events.log に書く。Tracer は start と finish で入れ子を記録して log/traces.log に書く。メトリクスの購読は Metrics に数を足し、GET /metrics で Prometheus の形式で返す"
    >
      <Box x={20} y={16} w={230} h={56} lines={['Rails の部品', 'process_action・sql など']} fs={12} bold subTone="muted" />
      <Box x={275} y={16} w={230} h={56} lines={['Faraday（:instrumentation）', 'request.faraday']} fs={12} bold subTone="muted" />
      <Box x={530} y={16} w={230} h={56} lines={['アプリのコード', 'charge.checkout']} fs={12} bold subTone="muted" />
      {[135, 390, 645].map((x) => (
        <Arrow key={x} x1={x} y1={72} x2={x} y2={108} />
      ))}
      <T x={653} y={90} fs={11} tone="muted">
        instrument
      </T>
      <Box x={20} y={110} w={740} h={40} lines="ActiveSupport::Notifications（instrument と subscribe）" fs={13} bold fill="box2" />
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={i} x1={cx(i)} y1={150} x2={cx(i)} y2={188} />
      ))}
      <Box x={cols[0].x} y={190} w={cols[0].w} h={50} lines={['LogSubscriber', '文のログを書く']} fs={12} bold subTone="muted" />
      <Box x={cols[1].x} y={190} w={cols[1].w} h={50} lines={['StructuredEventSubscriber', '出来事に変える（8.1）']} fs={12} bold subTone="muted" accent />
      <Box x={cols[2].x} y={190} w={cols[2].w} h={50} lines={['Tracer', 'start と finish で入れ子']} fs={12} bold subTone="muted" />
      <Box x={cols[3].x} y={190} w={cols[3].w} h={50} lines={['メトリクスの購読', 'Metrics に数を足す']} fs={12} bold subTone="muted" />
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={i} x1={cx(i)} y1={240} x2={cx(i)} y2={278} />
      ))}
      <Box x={cols[0].x} y={280} w={cols[0].w} h={50} lines={['log/production.log', '人が読む文']} fs={12} fill="box4" subTone="muted" />
      <Box x={cols[1].x} y={280} w={cols[1].w} h={50} lines={['Rails.event', 'context に request_id']} fs={12} bold fill="box2" subTone="muted" accent />
      <Box x={cols[2].x} y={280} w={cols[2].w} h={50} lines={['log/traces.log', '要求ごとのスパン']} fs={12} fill="box4" subTone="muted" />
      <Box x={cols[3].x} y={280} w={cols[3].w} h={50} lines={['Metrics', 'プロセスの中の数']} fs={12} subTone="muted" />
      <Arrow x1={cx(1)} y1={330} x2={cx(1)} y2={368} />
      <Arrow x1={cx(3)} y1={330} x2={cx(3)} y2={368} />
      <Box x={cols[1].x} y={370} w={cols[1].w} h={50} lines={['JsonEventLog', 'emit で JSON の1行']} fs={12} bold subTone="muted" />
      <Box x={cols[3].x} y={370} w={cols[3].w} h={50} lines={['GET /metrics', 'Prometheus の形式']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={cx(1)} y1={420} x2={cx(1)} y2={446} />
      <Box x={cols[1].x} y={448} w={cols[1].w} h={40} lines="log/events.log" fs={12} fill="box4" />
      <Box x={20} y={368} w={170} h={46} lines={['アプリのコード', 'Rails.event.notify']} fs={11} bold subTone="muted" />
      <Arrow x1={190} y1={380} x2={208} y2={312} />
      <Box x={20} y={430} w={170} h={46} lines={['EventContext', 'set_context（request_id）']} fs={11} bold subTone="muted" />
      <Arrow x1={190} y1={440} x2={210} y2={324} />
    </Svg>
  )
}

/* ---------- 図 87-5 遅かった要求のトレース ---------- */
const spans: { name: string; depth: number; start: number; dur: number; note: string; danger?: boolean; fill?: 'box' | 'box4' | 'box5' }[] = [
  { name: 'process_action.action_controller', depth: 0, start: 0, dur: 1081.0, note: '1081.0ms' },
  { name: 'sql.active_record', depth: 1, start: 2.0, dur: 2.8, note: 'SELECT 2.8ms', fill: 'box4' },
  { name: 'charge.checkout', depth: 1, start: 6.7, dur: 1064.3, note: '1064.3ms', fill: 'box5' },
  { name: 'request.faraday', depth: 2, start: 10.9, dur: 1007.2, note: 'Faraday::TimeoutError 1007.2ms', danger: true },
  { name: 'request.faraday', depth: 2, start: 1068.5, dur: 2.4, note: '200 2.4ms' },
  { name: 'sql.active_record', depth: 1, start: 1071.3, dur: 0.9, note: 'UPDATE 0.9ms', fill: 'box4' },
  { name: 'sql.active_record', depth: 2, start: 1071.4, dur: 0.4, note: 'BEGIN 0.4ms', fill: 'box4' },
  { name: 'sql.active_record', depth: 1, start: 1072.3, dur: 8.3, note: 'COMMIT 8.3ms', fill: 'box4' },
]

function TraceFigure() {
  const x0 = 300
  const k = 0.4 // 1ms あたりの幅
  const rowY = (i: number) => 74 + i * 30
  return (
    <Svg
      id="87-5"
      w={780}
      h={350}
      label="注文 A0008 の決済の要求（1081ms）のスパンを、開始の時刻の順に横棒で並べた。process_action が全体で1081.0ms、その下に SELECT が2.8ms、charge.checkout が1064.3ms。charge.checkout の下に決済代行への要求が2つあり、1つ目は Faraday::TimeoutError で1007.2ms、約50ms 待ってから送った2つ目は200で2.4ms。そのあと UPDATE が0.9ms、その中の BEGIN が0.4ms、COMMIT が8.3ms。時間のほとんどは、1つ目の要求がタイムアウトするまで待った時間だった"
    >
      <T x={20} y={20} fs={12} bold>
        trace_id=8ef612dc-…（注文 A0008 の決済。1081ms）
      </T>
      {[0, 250, 500, 750, 1000].map((ms) => (
        <g key={ms}>
          <line x1={x0 + ms * k} y1={50} x2={x0 + ms * k} y2={rowY(7) + 14} stroke="var(--fig-line)" strokeOpacity={0.2} />
          <T x={x0 + ms * k} y={44} fs={10} anchor="middle" tone="muted">
            {ms === 1000 ? '1000ms' : String(ms)}
          </T>
        </g>
      ))}
      {spans.map((s, i) => {
        const bx = x0 + s.start * k
        const bw = Math.max(2, s.dur * k)
        const wide = bw > 200
        return (
          <g key={i}>
            <T x={20 + s.depth * 16} y={rowY(i)} fs={11} mono>
              {s.name}
            </T>
            <rect x={bx} y={rowY(i) - 9} width={bw} height={18} rx={2} fill={`var(--fig-${s.fill ?? 'box'})`} stroke={s.danger ? 'var(--fig-danger)' : 'var(--fig-line)'} strokeWidth={s.danger ? 2 : 1} />
            {/* 棒の左に置く文字は、1000ms の目盛りの線より左で終える */}
            <T x={wide ? bx + bw - 6 : i === 1 ? bx + bw + 6 : Math.min(bx - 6, x0 + 1000 * k - 5)} y={rowY(i)} fs={10} anchor={wide || i !== 1 ? 'end' : 'start'} tone={s.danger ? 'danger' : undefined}>
              {s.note}
            </T>
          </g>
        )
      })}
      <T x={20} y={rowY(7) + 38} fs={11} tone="danger">
        1回目の要求が timeout（1.0秒）まで待ち、interval の0.05秒のあとに2回目の要求を送った。2回目は2.4ms で 200 を返した
      </T>
    </Svg>
  )
}

/* ---------- 図 87-6 直す前と後で、同じように遅い要求について見えるもの ---------- */
const compareRows = [
  ['30件のうち何件が1秒を超えたか', 'Completed の行を全部読んで数える', '/metrics：le="1.0" が26、+Inf が30 → 4件'],
  ['遅い要求の中で何が起きたか', '「決済が完了しました」の1行だけ', 'events.log：決済代行への要求が2件'],
  ['どこで時間がかかったか', 'ActiveRecord と Views 以外の約1秒', 'traces.log：1回目の要求の1007ms'],
]

function BeforeAfterFigure() {
  const x0 = 20
  const k = 740 / 1100
  const bar = (ms: number) => ms * k
  return (
    <Svg
      id="87-6"
      w={780}
      h={350}
      label="上の横棒は、直す前のログで見える注文 A0006 の要求の1095ms の内訳。ActiveRecord が27.9ms、Views が0.1ms で、残りの約1067ms には内訳がない。下の横棒は、直したあとのトレースで見える注文 A0008 の要求の1081ms の内訳。SELECT のあと、決済代行への1回目の要求がタイムアウトするまでの1007ms、待つ50ms、2回目の要求の2.4ms、UPDATE と COMMIT が続く。下の表は3つの問いについて、直す前と直したあとで何を見れば答えられるかを比べたもの。何件が1秒を超えたかは、直す前は Completed の行を全部数え、直したあとは /metrics のヒストグラムで4件とわかる。遅い要求の中で何が起きたかは、直す前は決済が完了しましたの1行だけ、直したあとは events.log の決済代行への要求2件。どこで時間がかかったかは、直す前は ActiveRecord と Views 以外の約1秒、直したあとは traces.log の1回目の要求の1007ms"
    >
      <T x={20} y={18} fs={12} bold>
        直す前：Completed の行（注文 A0006、1095ms）
      </T>
      <rect x={x0} y={30} width={bar(27.9)} height={26} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <rect x={x0 + bar(28)} y={30} width={bar(1067)} height={26} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={x0 + bar(28) + bar(1067) / 2} y={43} fs={11} anchor="middle" tone="muted">
        内訳なし（約1067ms）
      </T>
      <T x={20} y={70} fs={10} tone="muted">
        ActiveRecord 27.9ms・Views 0.1ms
      </T>
      <T x={20} y={102} fs={12} bold>
        直したあと：トレース（注文 A0008、1081ms）
      </T>
      <rect x={x0} y={114} width={bar(6.7)} height={26} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <rect x={x0 + bar(10.9)} y={114} width={bar(1007.2)} height={26} fill="var(--fig-box)" stroke="var(--fig-danger)" strokeWidth={2} />
      <T x={x0 + bar(10.9) + bar(1007.2) / 2} y={127} fs={11} anchor="middle" tone="danger">
        1回目の要求：タイムアウトまで1007ms
      </T>
      <rect x={x0 + bar(1018.1)} y={114} width={bar(50.4)} height={26} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />
      <rect x={x0 + bar(1068.5)} y={114} width={Math.max(2, bar(2.4))} height={26} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <rect x={x0 + bar(1071.3)} y={114} width={bar(9.7)} height={26} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={20} y={154} fs={10} tone="muted">
        SELECT 2.8ms
      </T>
      <T x={760} y={154} fs={10} anchor="end" tone="muted">
        待つ50ms → 2回目の要求 2.4ms → UPDATE・COMMIT
      </T>
      <T x={20} y={196} fs={12} bold>
        知りたいこと
      </T>
      <T x={250} y={196} fs={12} bold>
        直す前
      </T>
      <T x={510} y={196} fs={12} bold tone="acc">
        直したあと
      </T>
      {compareRows.map((r, i) => (
        <g key={r[0]}>
          <line x1={20} y1={212 + i * 42} x2={760} y2={212 + i * 42} stroke="var(--fig-line)" strokeOpacity={0.4} />
          <T x={20} y={233 + i * 42} fs={11}>
            {r[0]}
          </T>
          <T x={250} y={233 + i * 42} fs={11} tone="danger">
            {r[1]}
          </T>
          <T x={510} y={233 + i * 42} fs={11}>
            {r[2]}
          </T>
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図 87-7 何を、どのシグナルに記録するか ---------- */
function OveruseFigure() {
  return (
    <Svg
      id="87-7"
      w={780}
      h={430}
      label="横軸は値の種類の数（左が少ない、右が多いか上限がない）、縦軸は調べるときの単位（下が全体の数で足りる、上が1件ごとに見たい）。左下は、メトリクスのラベルにする値で、action や result のように種類が少なく、系列の数が増えない。右上は、ログやトレースの項目にする値で、request_id・order_id・payment_id のように1件ずつ検索する。右下は、メトリクスのラベルにしない値で、order_id をラベルにすると30件の決済で /metrics が18行から258行に増えた。左上は、ログの項目にもメトリクスのラベルにもする値で、エラーのクラス名のように、件数はメトリクスで、1件の様子はログで見る。図の下には、カードのトークンやパスワードはどこにも書かないこと、filter_parameters に入れ、JSON の文字列にしてから渡さないこと（文字列にした例では34回残った）を書いている"
    >
      <T x={20} y={24} fs={11} tone="muted">
        調べるときの単位
      </T>
      <T x={20} y={64} fs={11} tone="muted">
        1件ごと
      </T>
      <T x={20} y={306} fs={11} tone="muted">
        全体の数
      </T>
      <Arrow x1={92} y1={330} x2={92} y2={40} />
      <Arrow x1={92} y1={330} x2={758} y2={330} />
      <line x1={420} y1={44} x2={420} y2={326} stroke="var(--fig-line)" strokeOpacity={0.3} strokeDasharray="4 4" />
      <line x1={96} y1={186} x2={756} y2={186} stroke="var(--fig-line)" strokeOpacity={0.3} strokeDasharray="4 4" />
      <Box x={110} y={56} w={290} h={100} lines={['ログの項目にもメトリクスのラベルにも', 'error（Faraday::TimeoutError）', '件数はメトリクス、1件はログで見る']} fs={12} bold subTone="muted" />
      <Box x={440} y={56} w={300} h={100} lines={['ログ・トレースの項目', 'request_id・order_id・payment_id', '1件ずつ検索する']} fs={12} bold fill="box5" subTone="muted" />
      <Box x={110} y={206} w={290} h={100} lines={['メトリクスのラベル', 'action・result（200 / Timeout）', '系列の数が増えない']} fs={12} bold fill="box5" subTone="muted" />
      <Box x={440} y={206} w={300} h={100} lines={['メトリクスのラベルにしない', 'order_id をラベルにすると', '30件で /metrics が18行 → 258行']} fs={12} bold dashed subTone="danger" />
      <T x={110} y={348} fs={11} tone="muted">
        少ない（action、result など）
      </T>
      <T x={420} y={348} fs={11} anchor="middle">
        値の種類の数
      </T>
      <T x={740} y={348} fs={11} anchor="end" tone="muted">
        多い・上限がない（order_id など）
      </T>
      <Box x={20} y={372} w={740} h={48} lines={['どこにも書かない：カードのトークン・パスワード', 'filter_parameters に入れ、JSON の文字列にしてから渡さない（文字列にした例では34回残った）']} fs={12} bold dashed subTone="danger" />
    </Svg>
  )
}

const chapter: Chapter = {
  number: 89,
  part: 8,
  title: 'Observability（可観測性）：決済が時々遅い原因を、ログとメトリクスとトレースで見つける',
  summary:
    '決済の API が時々1秒を超えるのに、自由な文のログからは原因まで辿れない場面から始めます。OpenTelemetry のドキュメントでログ・メトリクス・トレースの違いを確かめ、ActiveSupport::Notifications と Rails 8.1 の Rails.event を使って、要求の ID の付いた構造化ログ、処理時間のヒストグラム、要求の中のスパンを記録し、隠れていた再試行を見つけます。最後に、何でも記録したときに起きるログの増加・秘密の値の漏れ・メトリクスの系列の増加を実測します。',
  goals: [
    'ログ・メトリクス・トレースが、それぞれどの問い（何が起きたか・何件か・どこで時間がかかったか）に答えるかを説明できる',
    'Rails.event の notify・set_context・購読者（emit）と、Rails の StructuredEventSubscriber が ActiveSupport::Notifications のイベントを出来事に変える流れを説明できる',
    'ActiveSupport::Notifications の start と finish を購読して、1つの要求の中の処理の入れ子（スパン）を記録できる',
    '処理時間をヒストグラムで数え、平均では見えない一部の遅い要求の数を確かめられる',
    'メトリクスのラベルにする値とログの項目にする値を、値の種類の数と調べる単位で分けられ、秘密の値をどこにも書かない設定を確かめられる',
  ],
  prerequisites: [22, 25, 79],
  sections: [
    {
      id: 'scene',
      title: '決済が時々1秒を超えるのに、ログから原因がわからない',
      body: (
        <>
          <p>
            この章では決済の API が時々遅いという報告を例に、<Term en="Observability">可観測性</Term>を扱います。可観測性はシステムの内部の状態を外から理解できるようにする原則です。まず、自由な文のログだけを書いたコードを動かし、遅い要求を見つけても、その原因まで辿れないことを確かめます。
          </p>
          <h3>そもそも「時々遅い」をどう調べるのか</h3>
          <p>
            EC サイトで、利用者が注文の確認画面の「注文を確定する」を押すと、ブラウザーは <code>POST /orders/:order_id/checkout</code> を送ります。サーバーは注文を読み、決済代行（カード会社との間の決済を代わりに行う会社）の API にカードのトークンと金額を送り、成功したら注文の状態を paid に変えて応答を返します。カードのトークンはカード番号の代わりに決済代行が発行する文字列です。
          </p>
          <p>
            ある日、問い合わせの窓口から「注文を確定するボタンを押してから、画面が変わるまでに時間がかかることがある」という報告が届きました。開発者が手元で何回か試しても、遅くなりません。こうした「時々遅い」の原因を調べるには、次の3つの問いに答える必要があります。
          </p>
          <ul>
            <li>何件のうち何件が遅いのか（全体の数）</li>
            <li>遅かったのはどの要求で、その要求の中で何が起きたのか（1件の出来事）</li>
            <li>その要求の中で、どの処理に時間がかかったのか（処理の内訳）</li>
          </ul>
          <p>
            本番のサーバーで動いているコードを止めて調べることはできないので、答えはコードが外に出したデータから探します。この章ではそのデータとしてログ・メトリクス・トレースの3つを使います。
          </p>
          <h3>直す前のコード</h3>
          <p>決済代行の API を呼ぶクラスは Faraday で HTTP の要求を送ります。</p>
          <Code
            lang="ruby"
            title="app/clients/payment_gateway.rb（直す前）"
            code={`
# 決済代行の API を呼ぶ
class PaymentGateway
  def initialize(url: ENV.fetch("PAYMENT_API_URL", "http://localhost:4000"))
    @conn = Faraday.new(url:, request: { timeout: 1.0, open_timeout: 0.5 }) do |f|
      f.request :json
      # 決済代行は Idempotency-Key ごとに1回だけ処理するので、POST もやり直せる
      f.request :retry, max: 1, interval: 0.05, methods: %i[post], exceptions: [Faraday::TimeoutError]
      f.response :json
      f.response :raise_error
    end
  end

  def charge(amount:, token:, idempotency_key:)
    @conn.post("/v1/charges", { amount:, token: }, { "Idempotency-Key" => idempotency_key }).body
  end
end
`}
          />
          <p>
            <code>f.request :retry</code> は faraday-retry の gem のミドルウェアで、指定した例外が起きたときに同じ要求をもう一度送ります。faraday-retry は既定では DELETE・GET・HEAD・OPTIONS・PUT の冪等なメソッドだけをやり直し、POST はやり直しません<Ref n={14} />。このコードは <code>methods: %i[post]</code> で POST もやり直します。決済代行は Idempotency-Key ヘッダーの値ごとに決済を1回だけ行うので、同じ要求を2回送っても二重には決済されません（冪等性キーは <ChapterLink n={83} /> で扱います）。<code>timeout: 1.0</code> は応答を1.0秒まで待つ設定です。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/checkouts_controller.rb（直す前）"
            code={`
class CheckoutsController < ApplicationController
  skip_forgery_protection

  def create
    order = Order.find(params[:order_id])
    Rails.logger.info "決済を開始します 注文=#{order.number}"
    result = PaymentGateway.new.charge(amount: order.total, token: order.card_token,
                                       idempotency_key: "order-#{order.id}")
    order.update!(status: "paid", payment_id: result["id"], paid_at: Time.current)
    Rails.logger.info "決済が完了しました"
    render json: { number: order.number, status: order.status }
  end
end
`}
          />
          <p>
            決済代行の代わりに、デモ用の小さな Rack アプリケーションを 4000 番のポートで動かしました。6回に1回、応答に1.5秒かかります。同じ Idempotency-Key の2回目からは、記録した結果をすぐに返します。
          </p>
          <Code
            lang="ruby"
            title="fake_gateway/config.ru"
            code={`
# デモ用の決済代行。6回に1回、応答に1.5秒かかる。
# 同じ Idempotency-Key の2回目からは、記録した結果をすぐに返す
require "json"
lock = Mutex.new
count = 0
charges = {}
run lambda { |env|
  key = env["HTTP_IDEMPOTENCY_KEY"]
  n, charge, repeated = lock.synchronize do
    count += 1
    repeated = charges.key?(key)
    charges[key] ||= { "id" => "ch_#{count.to_s.rjust(4, "0")}", "status" => "succeeded" }
    [count, charges[key], repeated]
  end
  sleep(n % 6 == 0 ? 1.5 : 0.08 + rand * 0.07) unless repeated
  [200, { "content-type" => "application/json" }, [JSON.generate(charge)]]
}
`}
          />
          <Figure n="87-1" title="決済の処理の構成と、時間が見えない箇所" caption="実線は呼び出し、破線はログへの書き込み。赤い文字はログから答えられない問いに関係する箇所。">
            <SceneFigure />
          </Figure>
          <p>
            図 87-1 は1件の決済で通る部品と、ログに残るものを並べたものです。決済代行への要求は Faraday のミドルウェアを順に通り、retry のミドルウェアがタイムアウトのときに要求をやり直します。コントローラーがログに書くのは、自由な文の2行だけです。
          </p>
          <h3>30件の決済を送って、ログを読む</h3>
          <p>
            決済代行とアプリケーション（本番の設定。Puma のスレッドは5）を起動し、30件の注文の決済を5件ずつ同時に送りました。curl の <code>-w</code> で、注文の番号・ステータス・応答までの秒数を書き出しています。
          </p>
          <Code
            lang="bash"
            title="script/load.sh（一部）"
            code={`
bundle exec puma -q -p 4000 -t 16:16 fake_gateway/config.ru > /dev/null 2>&1 &
GW=$!
RAILS_MAX_THREADS=5 bin/rails server -p 3000 > log/app.log 2>&1 &
APP=$!
for i in $(seq 1 60); do curl -s -o /dev/null http://localhost:3000/up && break; sleep 0.5; done
seq 1 30 | xargs -P 5 -I{} curl -s -o /dev/null -w "{} %{http_code} %{time_total}\\n" -X POST http://localhost:3000/orders/{}/checkout > log/curl.txt
# …（省略）
kill $APP $GW; wait 2>/dev/null || true
`}
          />
          <Code
            lang="text"
            title="実行結果（log/curl.txt を注文の番号の順に並べたもの。一部）"
            code={`
1 200 0.295161
2 200 0.285975
3 200 0.315736
4 200 0.316407
5 200 0.308543
6 200 1.106071
7 200 0.249592
8 200 0.204701
# …（省略）
13 200 1.086611
18 200 1.093158
24 200 1.100632
29 200 1.116947
30 200 0.149082
`}
          />
          <p>
            30件のうち、注文 6・13・18・24・29 の5件が約1.1秒かかり、残りの25件は0.10〜0.32秒でした。次は Rails のログの先頭の部分です。本番の設定では標準出力にログを書くので、log/app.log に書き出しました。
          </p>
          <Code
            lang="text"
            title="実行結果（log/app.log の一部）"
            code={`
[971f8d99-9a8e-4639-b3b1-86d5e7bbb56a] Started POST "/orders/1/checkout" for 127.0.0.1 at 2026-11-22 08:39:37 +0000
[971f8d99-9a8e-4639-b3b1-86d5e7bbb56a] Processing by CheckoutsController#create as */*
[971f8d99-9a8e-4639-b3b1-86d5e7bbb56a]   Parameters: {"order_id" => "1"}
[d8bffe7b-c1c5-4a8c-8d18-1d4ff575eaaf] Started POST "/orders/2/checkout" for 127.0.0.1 at 2026-11-22 08:39:37 +0000
# …（省略。注文 4・5・3 の Started と Processing の行）
[971f8d99-9a8e-4639-b3b1-86d5e7bbb56a] 決済を開始します 注文=A0001
[d8bffe7b-c1c5-4a8c-8d18-1d4ff575eaaf] 決済を開始します 注文=A0002
[932f4580-22af-4b1a-abbe-44f0addeec92] 決済を開始します 注文=A0005
[09e22bef-e811-404a-b79d-2827780c4100] 決済を開始します 注文=A0004
[f4de6736-6196-4b0c-ab40-f422a4ce7da3] 決済を開始します 注文=A0003
[d8bffe7b-c1c5-4a8c-8d18-1d4ff575eaaf] 決済が完了しました
[d8bffe7b-c1c5-4a8c-8d18-1d4ff575eaaf] Completed 200 OK in 263ms (Views: 0.2ms | ActiveRecord: 110.6ms (2 queries, 0 cached) | GC: 4.0ms)
[971f8d99-9a8e-4639-b3b1-86d5e7bbb56a] 決済が完了しました
[971f8d99-9a8e-4639-b3b1-86d5e7bbb56a] Completed 200 OK in 287ms (Views: 0.1ms | ActiveRecord: 99.5ms (2 queries, 0 cached) | GC: 4.0ms)
`}
          />
          <p>
            5件の要求が同時に進むので、行は入り混じります。各行の先頭の <code>[971f8d99-…]</code> は、Rails が要求ごとに付ける要求の ID（request_id）です。本番の設定ファイルの <code>config.log_tags = [ :request_id ]</code> により、すべての行の先頭に付きます（<ChapterLink n={25} section="request-id" />）<Ref n={7} />。
          </p>
          <Figure n="87-2" title="request_id でつながるログ" caption="上のログの14行を、request_id ごとに色を分けて並べた。右は request_id で行を分けたもの。">
            <RequestIdFigure />
          </Figure>
          <p>
            図 87-2 の左の11行目の「決済が完了しました」には、注文の番号がありません。request_id がなければ、A0001〜A0005 のどの要求の行かは決められません。request_id で分けると、右のように1件の要求の行だけを読めます。遅かった注文 6 の要求の行を、request_id で取り出しました。
          </p>
          <Code
            lang="text"
            title="実行結果（grep dfb704c9-b108-40f1-b786-a977a6032e8b log/app.log）"
            code={`
[dfb704c9-b108-40f1-b786-a977a6032e8b] Started POST "/orders/6/checkout" for 127.0.0.1 at 2026-11-22 08:39:37 +0000
[dfb704c9-b108-40f1-b786-a977a6032e8b] Processing by CheckoutsController#create as */*
[dfb704c9-b108-40f1-b786-a977a6032e8b]   Parameters: {"order_id" => "6"}
[dfb704c9-b108-40f1-b786-a977a6032e8b] 決済を開始します 注文=A0006
[dfb704c9-b108-40f1-b786-a977a6032e8b] 決済が完了しました
[dfb704c9-b108-40f1-b786-a977a6032e8b] Completed 200 OK in 1095ms (Views: 0.1ms | ActiveRecord: 27.9ms (2 queries, 0 cached) | GC: 1.6ms)
`}
          />
          <p>
            Completed の行はこの要求の処理に 1095ms かかり、そのうち ActiveRecord（SQL）が 27.9ms、Views（描画）が 0.1ms だったことを示します。残りの約 1067ms が何に使われたかは、この行からはわかりません（Completed の行の読み方は <ChapterLink n={22} section="slow-parts" />）。このログで3つの問いに答えようとすると、次のようになります。
          </p>
          <ul>
            <li>何件が遅いか：Completed の行を全部読み、ms の値を取り出して数えます。30件なら読めますが、1日に数十万件の要求があると、この方法では追いつきません。</li>
            <li>遅い要求の中で何が起きたか：自由な文の2行しかありません。Faraday の retry は決済代行への要求をやり直していますが、ログには何も残りません。</li>
            <li>どこで時間がかかったか：ActiveRecord と Views 以外の約1秒、ということしかわかりません。決済代行の応答を待っていたのか、Ruby の処理だったのかを区別できません。</li>
          </ul>
          <p>
            原因を調べるにはログの行を足してデプロイし、また遅くなるのを待つことになります。この「調べるたびにコードを足す」状態が、可観測性の低い状態です。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '可観測性の意味と、ログ・メトリクス・トレースの違い',
      body: (
        <>
          <h3>可観測性の定義</h3>
          <p>
            可観測性はシステムの内部の状態を外から理解できるようにする原則です。そのために、ログ・メトリクス・トレースを使います。
          </p>
          <p>
            OpenTelemetry はトレース・メトリクス・ログのデータを作り、送り出し、集めるためのフレームワークとツールのオープンソースのプロジェクトで、特定のベンダーや保存先に依存しません。Cloud Native Computing Foundation（CNCF）のプロジェクトで、OpenTracing と OpenCensus という2つのプロジェクトが合わさってできました<Ref n={4} />。OpenTelemetry のドキュメントは、可観測性を次のように説明しています<Ref n={1} />。
          </p>
          <ul>
            <li>可観測性があると、システムの内部の仕組みを知らなくても、システムについて問いを立てて、外から理解できる。予想していなかった問題（unknown unknowns）を調べたり、「なぜこれが起きているのか」に答えたりしやすくなる。</li>
            <li>問いを立てるには、アプリケーションが適切に<Term en="instrumentation">計装</Term>されている必要がある。計装はトレース・メトリクス・ログなどのシグナルを出すコードをアプリケーションに入れることを言う。</li>
            <li>問題を調べるために計装を足す必要がなく、必要な情報がすでにそろっているとき、アプリケーションは適切に計装されている。</li>
          </ul>
          <p>
            前の節のコードは遅い要求を見つけたあとの「その要求で決済代行に何回要求を送ったか」という問いに答えられませんでした。答えるには計装を足す必要があるので、OpenTelemetry の説明では、適切に計装されていない状態です。
          </p>
          <p>
            可観測性は1人の提唱者が1つの論文で定めた原則ではありません。この章では OpenTelemetry のドキュメントの説明を定義として使い、次の項で関係する資料を挙げます。
          </p>
          <h3>監視との違い</h3>
          <p>
            Google の SRE の書籍『Site Reliability Engineering』の「Monitoring Distributed Systems」の章は、<Term en="monitoring">監視</Term>を、問い合わせの数と種類、エラーの数と種類、処理時間など、システムについての数値のデータを集め、処理し、集計し、表示することと定義しています。利用者に向けたシステムで4つだけ測るなら、遅延（latency）・トラフィック（traffic）・エラー（errors）・飽和（saturation）の4つ（four golden signals）を測るように勧めています<Ref n={5} />。
          </p>
          <p>
            監視はあらかじめ決めた値を集めて表示し、値が決めた範囲を外れたら人に知らせます。可観測性は知らせを受けたあとの「なぜ遅いのか」を、すでに出力されているデータから調べられる性質です。この章の場面では処理時間の監視で「1秒を超える決済がある」ことに気づき、ログとトレースで原因を調べます。
          </p>
          <h3>ログ・メトリクス・トレース</h3>
          <p>
            OpenTelemetry は、システムが出すデータを<Term en="signal">シグナル</Term>と呼び、トレース・メトリクス・ログ・バゲッジ（シグナルの間で受け渡す文脈の情報）を扱っています<Ref n={2} />。この章で扱うのは、トレース・メトリクス・ログの3つです。
          </p>
          <ul>
            <li>
              ログは時刻の付いた出来事の記録です。OpenTelemetry は項目の名前・型・意味が決まった<Term en="structured log">構造化ログ</Term>を本番で使うように勧めています。JSON で書いただけでは構造化ログとは言えず、項目の名前・型・意味が安定していることが条件だと書いています<Ref n={3} />。
            </li>
            <li>メトリクスは数値のデータを一定の期間で集計したものです。例として、エラーの割合、CPU の使用率、サービスへの要求の数が挙がっています<Ref n={1} />。</li>
            <li>
              トレースは1つの要求が通った経路の記録です。トレースは1つ以上の<Term en="span">スパン</Term>からなり、スパンは1つの処理の名前・時刻・属性を持ちます。最初のスパン（ルートスパン）が要求の始まりから終わりまでを表し、その下のスパンが要求の中の各段階を表します<Ref n={1} />。
            </li>
          </ul>
          <Figure n="87-3" title="ログ・メトリクス・トレースの違い" caption="この章のデモで書く場所と、データの量が増える条件。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>シグナル</th>
                    <th>1件が表すもの</th>
                    <th>答えやすい問い</th>
                    <th>この章で書く場所</th>
                    <th>量が増える条件</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ログ</td>
                    <td>1つの出来事（決済代行への1回の要求、決済の完了）</td>
                    <td>その要求で何が起きたか</td>
                    <td>log/events.log（1行1件の JSON）</td>
                    <td>要求の数 × 1件の要求で書く出来事の数</td>
                  </tr>
                  <tr>
                    <td>メトリクス</td>
                    <td>一定の期間の数の集計（処理時間の分布、要求の数）</td>
                    <td>何件のうち何件か、増えているか</td>
                    <td>GET /metrics（Prometheus の形式）</td>
                    <td>ラベルの値の組み合わせの数。要求の数では増えない</td>
                  </tr>
                  <tr>
                    <td>トレース</td>
                    <td>1つの要求の中の処理の入れ子と時間</td>
                    <td>どの処理に時間がかかったか</td>
                    <td>log/traces.log（要求ごとのスパン）</td>
                    <td>要求の数 × スパンの数。一部の要求だけを残すことが多い</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 87-3 のように、3つのシグナルは答えやすい問いが違います。前の節の3つの問いのうち、「何件が遅いか」はメトリクスで、「その要求で何が起きたか」はログで、「どこで時間がかかったか」はトレースで答えます。
          </p>
          <p>
            メトリクスで処理時間を数えるときは、平均だけを見ないようにします。SRE の書籍は、平均の遅延が 100ms のサービスでも1%の要求が5秒かかることがあると述べ、処理時間を範囲ごとに数える（ヒストグラムにする）ことを勧めています<Ref n={5} />。この章の場面でも、30件の Completed の行の処理時間の平均は約 330ms ですが、5件は1秒を超えていました。
          </p>
          <h3>分散トレーシングと標準化</h3>
          <p>
            Google は2010年の技術報告「Dapper, a Large-Scale Distributed Systems Tracing Infrastructure」（Benjamin H. Sigelman ほか）で、本番で使っている分散トレーシング（複数のサービスにまたがる要求を追う仕組み）を報告しました。要旨では、負荷が低いこと、アプリケーションから意識せずに使えること、大規模に行き渡らせることを設計の目標とし、標本の抽出（sampling）と、計装を少数の共通のライブラリに限ったことが成功の理由だったと述べています<Ref n={6} />。
          </p>
          <p>
            W3C は2021年に Trace Context を勧告にしました。<code>traceparent</code> ヘッダーで、トレースの ID（16バイト）と、呼び出し元のスパンの ID（8バイト）をサービスの間で受け渡します<Ref n={8} />。この章のデモは1つの Rails のプロセスの中だけでスパンを記録するので、traceparent は使いません。決済代行のような別のサービスまでトレースをつなぐときに使います。
          </p>
          <h3>似た原則との違い</h3>
          <ul>
            <li>
              Fail Fast（<ChapterLink n={79} />）は不正な状態を早く検出して処理を止める原則です。止まったことを人が知るには、エラーがログやメトリクスに出ている必要があります。Fail Fast はエラーを早く起こす原則で、可観測性は起きたエラーや遅さを外から調べられるようにする原則です。
            </li>
            <li>
              Explicit over Implicit（<ChapterLink n={62} />）は隠れた依存や副作用を減らす原則です。この章の retry は設定の1行で、ログに出ない再試行をしていました。可観測性は隠れた動作をコードから取り除くのではなく、動作したことを記録に残します。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: '要求の ID の付いた出来事・処理時間のヒストグラム・スパンを記録する',
      body: (
        <>
          <h3>直す順序</h3>
          <p>決済の処理そのもの（注文を読む、決済代行に送る、注文を更新する）は変えずに、外に出すデータを足します。次の順に、1つずつ動かして確かめました。</p>
          <ol>
            <li>要求の ID を、Rails.event に送る出来事すべてに付ける</li>
            <li>自由な文のログを、名前と項目を持つ出来事に変える</li>
            <li>決済代行への1回ごとの要求を、出来事として記録する</li>
            <li>処理時間と、決済代行への要求の数をメトリクスで数える</li>
            <li>1つの要求の中の処理の入れ子を、トレースとして記録する</li>
            <li>同じ30件を送り、メトリクス → ログ → トレースの順に調べる</li>
          </ol>
          <p>
            1〜3 はログ、4 はメトリクス、5 はトレースです。どれも、Rails の <code>ActiveSupport::Notifications</code>（処理を名前付きのイベントとして発行し、購読したコードに渡す仕組み。<ChapterLink n={22} section="notifications" />）と、Rails 8.1 の <code>Rails.event</code> を使います。新しい gem は入れていません。
          </p>
          <h3>手順1：要求の ID を出来事に付ける</h3>
          <p>
            <Term en="Event Reporter">Rails.event</Term>は Rails 8.1 で入った、構造化された出来事を送る仕組みです<Ref n={10} />。<code>Rails.event.notify("checkout.paid", order_id: 8)</code> のように名前と項目を渡すと、登録した購読者の <code>emit</code> に、name・payload・tags・context・timestamp・source_location を持つハッシュが渡ります。<code>set_context</code> で入れた値はその後に送るすべての出来事の context に入ります<Ref n={9} />。Rails は、要求やジョブの処理が終わると、Executor の to_complete で context を消します<Ref n={11} />。
          </p>
          <Code
            lang="ruby"
            title="lib/observability/event_context.rb"
            code={`
# 要求の ID を、この要求の中で Rails.event に送る出来事すべてに付ける
# （Rails は要求が終わると、Executor の to_complete で context を消す）
class EventContext
  def initialize(app)
    @app = app
  end

  def call(env)
    Rails.event.set_context(request_id: env["action_dispatch.request_id"])
    @app.call(env)
  end
end
`}
          />
          <p>
            最初は ApplicationController の <code>before_action</code> で <code>set_context</code> を呼びました。手順6のテストを動かすと、1件の要求の出来事のうち、1件だけ request_id が nil でした。
          </p>
          <Code
            lang="text"
            title="実行結果（before_action で set_context を呼んだときのテスト。一部）"
            code={`
  1) 決済の可観測性 ログ：タイムアウトの後のやり直しを2件の出来事に残し、どれにも要求の ID を付ける
     Failure/Error: expect(request_ids).to eq [response.headers["X-Request-Id"]]

       expected: ["73f23af6-3575-4b97-bc5c-0989f316a29b"]
            got: [nil, "73f23af6-3575-4b97-bc5c-0989f316a29b"]
`}
          />
          <p>
            nil だったのは、Rails が送る <code>action_controller.request_started</code> の出来事です。Rails は、コントローラーがアクションの処理を始めるとき（start_processing のイベント）にこの出来事を送るので<Ref n={12} />、before_action より先に送られます。そこで、Rails の ActionDispatch::RequestId（要求の ID を決めるミドルウェア）の直後に EventContext を置きました。設定は手順4の初期化ファイルにまとめています。
          </p>
          <h3>手順2：自由な文を名前と項目を持つ出来事にする</h3>
          <Code
            lang="ruby"
            title="app/controllers/checkouts_controller.rb（直したあと）"
            code={`
class CheckoutsController < ApplicationController
  skip_forgery_protection

  def create
    order = Order.find(params[:order_id])
    result = ActiveSupport::Notifications.instrument("charge.checkout", order_id: order.id) do
      PaymentGateway.new.charge(amount: order.total, token: order.card_token,
                                idempotency_key: "order-#{order.id}")
    end
    order.update!(status: "paid", payment_id: result["id"], paid_at: Time.current)
    Rails.event.notify("checkout.paid", order_id: order.id, amount: order.total, payment_id: order.payment_id)
    render json: { number: order.number, status: order.status }
  end
end
`}
          />
          <p>
            「決済を開始します」と「決済が完了しました」の2行をやめ、決済が終わったときに <code>checkout.paid</code> の出来事を1件送ります。注文の ID・金額・決済代行の決済の ID を、文の中ではなく項目として渡します。決済代行を呼ぶ部分は <code>ActiveSupport::Notifications.instrument</code> で囲み、<code>charge.checkout</code> という名前のイベントにしました。Rails のガイドは自分で作るイベントの名前を「イベント.ライブラリ」の形にするように書いています<Ref n={20} />。
          </p>
          <p>出来事を受け取る購読者は、1件を1行の JSON にしてファイルに書きます。</p>
          <Code
            lang="ruby"
            title="lib/observability/json_event_log.rb"
            code={`
# Rails.event の出来事を、1件を1行の JSON にしてファイルに書く
class JsonEventLog
  def initialize(path)
    @logger = ActiveSupport::Logger.new(path, skip_header: true)
    @logger.formatter = ->(_severity, _time, _progname, line) { "#{line}\\n" }
  end

  def emit(event)
    time = Time.at(0, event[:timestamp], :nanosecond).utc.iso8601(3)
    @logger.info(JSON.generate({ time:, name: event[:name], **event[:context], payload: event[:payload] }))
  end
end
`}
          />
          <p>
            Rails.event は、payload が Hash のとき、<code>Rails.application.config.filter_parameters</code> に書いた名前（新しいアプリケーションでは token・secret・passw など<Ref n={28} />）に当たる項目の値を <code>[FILTERED]</code> に置き換えてから購読者に渡します<Ref n={9} />。この性質は後の「当てはめすぎたとき」の節で確かめます。
          </p>
          <h3>手順3：決済代行への要求を1回ずつ出来事にする</h3>
          <p>PaymentGateway の Faraday の設定に1行を足します。</p>
          <Code
            lang="ruby"
            title="app/clients/payment_gateway.rb（直したあと。Faraday の設定の部分）"
            code={`
    @conn = Faraday.new(url:, request: { timeout: 1.0, open_timeout: 0.5 }) do |f|
      f.request :json
      # 決済代行は Idempotency-Key ごとに1回だけ処理するので、POST もやり直せる
      f.request :retry, max: 1, interval: 0.05, methods: %i[post], exceptions: [Faraday::TimeoutError]
      f.request :instrumentation # 1回の要求ごとに request.faraday を発行する（retry より後に置く）
      f.response :json
      f.response :raise_error
    end
`}
          />
          <p>
            Faraday の <code>:instrumentation</code> ミドルウェアは、HTTP の要求を <code>ActiveSupport::Notifications.instrument("request.faraday", env)</code> で囲みます<Ref n={13} />。要求は Faraday のミドルウェアを書いた順に通るので、instrumentation を retry より後に置くと、retry がやり直すたびに要求が instrumentation を通り、1回の要求ごとに request.faraday のイベントが出ます。retry より前に置くと、やり直しを含めた全体で1件のイベントになります。
          </p>
          <p>
            request.faraday のイベントを Rails.event の出来事に変えるのは、Rails 8.1 の <code>ActiveSupport::StructuredEventSubscriber</code> です。<code>attach_to :faraday</code> と書くと、名前が「メソッド名.faraday」のイベントを、同じ名前のメソッドに渡します。<code>emit_event</code> は Rails.event.notify を呼びます<Ref n={27} />。Rails も同じ仕組みで、<code>process_action.action_controller</code> のイベントを <code>action_controller.request_completed</code> の出来事に変えています<Ref n={12} />。
          </p>
          <Code
            lang="ruby"
            title="lib/observability/payment_gateway_event_subscriber.rb"
            code={`
# Faraday の request.faraday（1回の HTTP の要求）を、Rails.event の出来事に変える
class PaymentGatewayEventSubscriber < ActiveSupport::StructuredEventSubscriber
  def request(event)
    env = event.payload
    emit_event("payment_gateway.request",
      method: env.method.upcase, path: env.url.path, status: env.status,
      error: self.class.error_of(env), duration_ms: event.duration.round(1))
  end

  # 再試行では同じ env を使うので、前の回の :exception が残る。400 未満の応答があれば、この回は成功
  def self.error_of(env)
    env[:exception]&.first if env.status.nil? || env.status >= 400
  end
end
`}
          />
          <p>
            <code>error_of</code> は最初の実行のあとに足しました。はじめは <code>error: env[:exception]&amp;.first</code> と書いていたので、やり直して成功した2回目の要求にも、1回目のエラーが記録されていました。
          </p>
          <Code
            lang="text"
            title="実行結果（error_of を足す前の log/events.log。同じ要求の2行）"
            code={`
{"time":"2026-11-22T08:42:17.735Z","name":"payment_gateway.request","request_id":"28435673-d1e9-432a-80c0-222421ca3df4","payload":{"method":"POST","path":"/v1/charges","status":null,"error":"Faraday::TimeoutError","duration_ms":1007.0}}
{"time":"2026-11-22T08:42:17.788Z","name":"payment_gateway.request","request_id":"28435673-d1e9-432a-80c0-222421ca3df4","payload":{"method":"POST","path":"/v1/charges","status":200,"error":"Faraday::TimeoutError","duration_ms":1.9}}
`}
          />
          <p>
            ActiveSupport::Notifications は、instrument の中で例外が起きると、payload に <code>:exception</code>（例外のクラス名とメッセージ）を入れます<Ref n={15} />。Faraday の payload は env（要求と応答を持つオブジェクト）そのもので、決まった項目以外の値は env の中の別のハッシュに保存されます<Ref n={16} />。faraday-retry はやり直しでも同じ env を使うので、1回目に入った :exception が2回目のイベントの payload にも残っていました。記録のコードも本番と同じ条件で動かして確かめる必要があります。
          </p>
          <h3>手順4：処理時間と要求の数をメトリクスで数える</h3>
          <p>
            メトリクスは Prometheus（メトリクスを集めて保存する監視のソフトウェア）のテキストの形式で返します。数を保存する Metrics クラスを書きました。
          </p>
          <Code
            lang="ruby"
            title="lib/observability/metrics.rb"
            code={`
# プロセスの中で数を数え、Prometheus のテキスト形式で返す
# 数は Puma のワーカー（プロセス）ごとに別になる。複数のプロセスで動かすときは prometheus-client などを使う
class Metrics
  BUCKETS = [0.1, 0.25, 0.5, 1.0, 2.5].freeze
  @lock = Mutex.new
  @counters = Hash.new(0)

  class << self
    def increment(name, labels = {}, by = 1)
      @lock.synchronize { @counters[[name, labels]] += by }
    end

    # ヒストグラム：上限（le）ごとに、その値以下だった回数を数える
    def observe(name, seconds, labels = {})
      BUCKETS.each { |le| increment("#{name}_bucket", labels.merge(le: le.to_s), seconds <= le ? 1 : 0) }
      increment("#{name}_bucket", labels.merge(le: "+Inf"))
      increment("#{name}_sum", labels, seconds)
      increment("#{name}_count", labels)
    end

    def to_prometheus
      # …（省略。名前の順に「名前{ラベル} 値」の行を返す）
    end
    # …（省略。テストで使う reset!）
  end
end
`}
          />
          <p>
            <Term en="histogram">ヒストグラム</Term>は、値を範囲（バケット）に分けて数えたものです。Prometheus の形式では上限を le（less than or equal）のラベルに書き、その値以下だった回数を <code>_bucket</code> の行に書きます。le が <code>+Inf</code> の行は全体の数で、<code>_count</code> と同じ値になります。合計は <code>_sum</code> の行です<Ref n={17} />。
          </p>
          <p>Rails.event の購読者、Faraday の出来事の購読者、トレース、メトリクスの購読を、1つの初期化ファイルで登録します。</p>
          <Code
            lang="ruby"
            title="config/initializers/observability.rb"
            code={`
require_relative "../../lib/observability/event_context"
# …（省略。lib/observability の残りのファイルを require_relative で読む）

# ログ：Rails.event の出来事を log/events.log に1行1件の JSON で書く
Rails.application.config.middleware.insert_after ActionDispatch::RequestId, EventContext
Rails.event.subscribe(JsonEventLog.new(Rails.root.join("log/events.log")))
PaymentGatewayEventSubscriber.attach_to :faraday

# トレース：1つの要求の中のスパンを log/traces.log に書く
ActiveSupport::Notifications.subscribe(Tracer::EVENTS, Tracer.new(Rails.root.join("log/traces.log")))

# メトリクス：決済の処理時間と、決済代行への要求の数を数える
ActiveSupport::Notifications.subscribe("process_action.action_controller") do |event|
  p = event.payload
  Metrics.observe("http_server_duration_seconds", event.duration / 1000.0, action: "#{p[:controller]}##{p[:action]}")
end
ActiveSupport::Notifications.subscribe("request.faraday") do |event|
  error = PaymentGatewayEventSubscriber.error_of(event.payload)
  Metrics.increment("payment_gateway_requests_total", result: error || event.payload.status.to_s)
end
`}
          />
          <p>
            lib/observability のファイルは、config/application.rb の <code>config.autoload_lib(ignore: %w[assets tasks observability])</code> で自動読み込みの対象から外し、初期化ファイルから require_relative で読みます。初期化の途中で、再読み込みの対象のクラスを購読者として登録しないためです。<code>GET /metrics</code> は、<code>Metrics.to_prometheus</code> を <code>render plain:</code> で返す MetricsController に割り当てました。
          </p>
          <h3>手順5：要求の中のスパンをトレースに記録する</h3>
          <p>
            ActiveSupport::Notifications の subscribe に、<code>start</code> と <code>finish</code> の2つのメソッドを持つオブジェクトを渡すと、イベントの開始と終了のそれぞれで呼ばれます<Ref n={18} />。処理が入れ子になっていれば、start と finish も入れ子の順に呼ばれます。Tracer はスレッドごとのスタックに開始したスパンを積み、終了したら取り出して、親のスパンの ID を記録します。
          </p>
          <Code
            lang="ruby"
            title="lib/observability/tracer.rb"
            code={`
# ActiveSupport::Notifications の開始と終了から、1つの要求の中の処理の入れ子（スパン）を記録する
class Tracer
  EVENTS = /\\A(process_action\\.action_controller|sql\\.active_record|request\\.faraday|\\w+\\.checkout)\\z/

  def initialize(path)
    @logger = ActiveSupport::Logger.new(path, skip_header: true)
    @logger.formatter = ->(_severity, _time, _progname, line) { "#{line}\\n" }
  end

  def start(name, _id, _payload)
    stack = (Thread.current[:trace_stack] ||= [])
    spans = (Thread.current[:trace_spans] ||= [])
    span = { span_id: SecureRandom.hex(8), parent_id: stack.last&.fetch(:span_id), name:,
             started: Process.clock_gettime(Process::CLOCK_MONOTONIC, :float_millisecond) }
    stack.push(span)
    spans.push(span)
  end

  def finish(name, _id, payload)
    stack = Thread.current[:trace_stack]
    span = stack.pop
    span[:duration_ms] = (Process.clock_gettime(Process::CLOCK_MONOTONIC, :float_millisecond) - span[:started]).round(1)
    span[:detail] = detail(name, payload)
    write(payload[:request]&.request_id) if stack.empty?
  end

  private

  # …（省略。detail は SQL の先頭60文字、HTTP のメソッド・パス・結果などを返す）

  def write(trace_id)
    spans = Thread.current[:trace_spans]
    origin = spans.first[:started]
    spans.each { |s| s[:start_ms] = (s.delete(:started) - origin).round(1) }
    @logger.info(JSON.generate({ trace_id:, spans: }))
  ensure
    Thread.current[:trace_spans] = nil
  end
end
`}
          />
          <p>
            スタックが空になったとき（ルートスパンの process_action が終わったとき）に、要求の ID をトレースの ID として、スパンをまとめて1行に書きます。スパンの ID は W3C Trace Context の parent-id と同じ8バイトの乱数にしました。
          </p>
          <Figure n="87-4" title="Rails の計測の仕組み（ActiveSupport::Notifications と Rails.event）" caption="この章で足したのは、EventContext・PaymentGatewayEventSubscriber・JsonEventLog・Tracer・メトリクスの購読と Metrics。ほかは Rails と Faraday にある部品。">
            <InstrumentFigure />
          </Figure>
          <p>
            図 87-4 はここまでの部品の関係です。Rails の部品・Faraday・アプリのコードが発行したイベントを、4種類の購読者が受け取ります。Rails が昔から持っている LogSubscriber は人が読む文のログを書き、Rails 8.1 の StructuredEventSubscriber はイベントを Rails.event の出来事に変えます。同じイベントから、ログ・トレース・メトリクスの3つを作っています。
          </p>
          <h3>手順6：同じ30件を送り、メトリクス → ログ → トレースの順に調べる</h3>
          <p>同じ script/load.sh で30件を送り、最後に GET /metrics の応答を log/metrics.txt に保存しました。まずメトリクスで、遅い要求が何件あるかを確かめます。</p>
          <Code
            lang="text"
            title="実行結果（log/metrics.txt。/up の行は省略）"
            code={`
http_server_duration_seconds_bucket{action="CheckoutsController#create",le="0.1"} 0
http_server_duration_seconds_bucket{action="CheckoutsController#create",le="0.25"} 21
http_server_duration_seconds_bucket{action="CheckoutsController#create",le="0.5"} 26
http_server_duration_seconds_bucket{action="CheckoutsController#create",le="1.0"} 26
http_server_duration_seconds_bucket{action="CheckoutsController#create",le="2.5"} 30
http_server_duration_seconds_bucket{action="CheckoutsController#create",le="+Inf"} 30
http_server_duration_seconds_count{action="CheckoutsController#create"} 30
http_server_duration_seconds_sum{action="CheckoutsController#create"} 9.338
payment_gateway_requests_total{result="200"} 30
payment_gateway_requests_total{result="Faraday::TimeoutError"} 4
`}
          />
          <p>
            1.0秒以下が26件、全体が30件なので、1.0秒を超えた決済は4件です。0.5秒以下も26件なので、遅い4件と残りの26件の間には、はっきりした差があります。決済代行への要求は、200 が30回、タイムアウトが4回で、合わせて34回でした。決済は30件なので、4回はやり直しです。メトリクスの段階で、遅い件数とやり直しの回数が同じ4だとわかります。
          </p>
          <p>次に、ログで遅い要求の1件を見ます。log/events.log から、処理に 1000ms を超えた要求を探し、その request_id の出来事を並べる短いスクリプトを書きました。</p>
          <Code
            lang="text"
            title="実行結果（ruby script/slow_events.rb）"
            code={`
1000ms を超えた要求：4件（1件目の request_id=8ef612dc-b001-4c0f-8453-df5ee8cc0144）
2026-11-22T08:45:51.675Z action_controller.request_started {"controller":"CheckoutsController","action":"create","format":"*/*"}
2026-11-22T08:45:52.694Z payment_gateway.request {"method":"POST","path":"/v1/charges","status":null,"error":"Faraday::TimeoutError","duration_ms":1006.8}
2026-11-22T08:45:52.746Z payment_gateway.request {"method":"POST","path":"/v1/charges","status":200,"error":null,"duration_ms":2.4}
2026-11-22T08:45:52.756Z checkout.paid {"order_id":8,"amount":3600,"payment_id":"ch_0006"}
2026-11-22T08:45:52.757Z action_controller.request_completed {"controller":"CheckoutsController","action":"create","status":200,"view_runtime":0.08332700002938509,"db_runtime":12.046419999933278,"queries_count":2,"cached_queries_count":0,"duration_ms":1080.81,"gc_time_ms":0.0}
`}
          />
          <p>
            注文 8 の決済の要求で、決済代行への1回目の要求が 1006.8ms でタイムアウトし、2回目の要求が 2.4ms で 200 を返していました。request_started と request_completed は Rails が送った出来事で、ここにも同じ request_id が付いています。最後に、同じ要求のトレースを、開始の時刻の順に並べます。
          </p>
          <Code
            lang="text"
            title="実行結果（ruby script/slow_traces.rb。1件目）"
            code={`
trace_id=8ef612dc-b001-4c0f-8453-df5ee8cc0144
  +    0.0ms  1081.0ms  process_action.action_controller     CheckoutsController#create 200
  +    2.0ms     2.8ms    sql.active_record                  SELECT \`orders\`.* FROM \`orders\` WHERE \`orders\`.\`id\` = 8 LIMI
  +    6.7ms  1064.3ms    charge.checkout                    {order_id: 8}
  +   10.9ms  1007.2ms      request.faraday                  POST /v1/charges Faraday::TimeoutError
  + 1068.5ms     2.4ms      request.faraday                  POST /v1/charges 200
  + 1071.3ms     0.9ms    sql.active_record                  UPDATE \`orders\` SET \`orders\`.\`status\` = 'paid', \`orders\`.\`pa
  + 1071.4ms     0.4ms      sql.active_record                BEGIN
  + 1072.3ms     8.3ms    sql.active_record                  COMMIT
`}
          />
          <Figure n="87-5" title="遅かった要求のトレース" caption="上のトレースのスパンを、開始の時刻と長さで横棒にした。赤い枠はタイムアウトした要求。">
            <TraceFigure />
          </Figure>
          <p>
            図 87-5 のとおり、1081ms のうち 1007ms は、決済代行への1回目の要求がタイムアウトするまで待った時間でした。その後、retry の interval の 0.05 秒（+1018ms から +1068ms）を待って2回目を送っています。BEGIN が UPDATE のスパンの中にあるのは、Active Record がトランザクションの BEGIN を最初の SQL を送る直前まで遅らせ、UPDATE の sql.active_record のイベントの中で送るからです<Ref n={19} />。
          </p>
          <Figure n="87-6" title="直す前と後で、同じように遅い要求について見えるもの" caption="上の2本の横棒は、直す前の注文 A0006 の要求と、直したあとの注文 A0008 の要求。どちらも決済代行の応答が遅かった要求。">
            <BeforeAfterFigure />
          </Figure>
          <p>
            図 87-6 は直す前と後で、同じように遅い要求について見えるものを比べたものです。直す前は 1095ms のうち約 1067ms に内訳がありませんでしたが、直したあとは、その時間がタイムアウトまでの待ち時間とやり直しだとわかります。
          </p>
          <p>
            原因がわかったので、次の判断ができます。
          </p>
          <ul>
            <li>決済代行の担当者に、遅かった要求の時刻と Idempotency-Key を伝えて調べてもらう</li>
            <li>タイムアウトの1.0秒が決済代行の通常の応答時間に対して短すぎないかを、payment_gateway.request の duration_ms の分布で確かめる</li>
            <li>やり直しの回数と間隔を見直す（<ChapterLink n={54} />）</li>
            <li>決済代行が止まったときの画面の扱いを決める（<ChapterLink n={91} />）</li>
          </ul>
          <p>どれも、記録したデータを根拠に決められます。</p>
          <h3>記録をテストで確かめる</h3>
          <p>
            ログ・メトリクス・トレースもアプリケーションの出力なので、request spec で確かめます。テストでは決済代行を WebMock で置き換え、1回目に Net::ReadTimeout を発生させ、2回目に 200 を返します。Rails.event には受け取った出来事を配列に入れるだけの購読者を登録します。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/checkouts_spec.rb（一部）"
            code={`
RSpec.describe "決済の可観測性", type: :request do
  let!(:order) { Order.create!(number: "A0001", total: 3000, card_token: "tok_test") }
  let(:collector) { Struct.new(:events) { def emit(event) = events << event }.new([]) }
  # …（省略。charges と ok は決済代行の URL と 200 の応答）

  before do
    Rails.event.subscribe(collector)
    Metrics.reset!
  end
  after { Rails.event.unsubscribe(collector) }

  def events(name) = collector.events.select { |e| e[:name] == name }

  it "ログ：タイムアウトの後のやり直しを2件の出来事に残し、どれにも要求の ID を付ける" do
    stub_request(:post, charges).to_raise(Net::ReadTimeout).then.to_return(ok)

    post "/orders/#{order.id}/checkout"

    expect(response).to have_http_status(:ok)
    attempts = events("payment_gateway.request").map { |e| e[:payload].values_at(:status, :error) }
    expect(attempts).to eq [[nil, "Faraday::TimeoutError"], [200, nil]]
    expect(events("checkout.paid").sole[:payload]).to eq(order_id: order.id, amount: 3000, payment_id: "ch_1")
    request_ids = collector.events.map { |e| e[:context][:request_id] }.uniq
    expect(request_ids).to eq [response.headers["X-Request-Id"]]
  end
  # …（省略。メトリクス・トレース・フィルターの例）
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
環境
  MySQL 8.4 につながる

決済の可観測性
  ログ：タイムアウトの後のやり直しを2件の出来事に残し、どれにも要求の ID を付ける
  メトリクス：処理時間のヒストグラムと、決済代行への要求の結果ごとの数を出す
  トレース：決済代行への2回の要求を、charge.checkout のスパンの下に記録する
  Hash で渡したカードのトークンは [FILTERED] になり、文字列で渡すと残る

Finished in 0.27366 seconds (files took 0.87317 seconds to load)
5 examples, 0 failures
`}
          />
          <p>
            WebMock の <code>to_timeout</code> は Net::HTTP では Net::OpenTimeout を発生させ、Faraday はそれを Faraday::ConnectionFailed に変えます<Ref n={31} /><Ref n={32} />。retry の対象の Faraday::TimeoutError にならないので、このテストでは <code>to_raise(Net::ReadTimeout)</code> を使いました。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '何でも記録したとき：ログの量・カードのトークン・メトリクスの系列',
      body: (
        <>
          <h3>何でも記録した版</h3>
          <p>
            原因が見つかったあと、「次に何か起きても調べられるように、全部記録しておこう」と考えて、次の3つを足した版を作りました。環境変数 OBS_VERBOSE が設定されているときだけ有効にしています。
          </p>
          <ul>
            <li>決済代行への要求の URL・ヘッダー・本文と、応答の本文を出来事に入れる</li>
            <li>本番でも debug の出来事（Active Record の SQL など）を出す</li>
            <li>決済代行の処理時間のヒストグラムに、注文の ID をラベルとして付ける</li>
          </ul>
          <Code
            lang="ruby"
            title="lib/observability/verbose_payment_gateway_event_subscriber.rb"
            code={`
# 当てはめすぎの例：要求と応答の本文まで、すべて出来事に入れる
class VerbosePaymentGatewayEventSubscriber < ActiveSupport::StructuredEventSubscriber
  def request(event)
    env = event.payload
    emit_event("payment_gateway.request_verbose",
      url: env.url.to_s, request_headers: env.request_headers.to_h,
      request: JSON.parse(env.request_body), # Hash で渡す
      request_body: env.request_body,        # 文字列で渡す
      response_body: env.response_body, duration_ms: event.duration.round(1))
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/application_controller.rb と config/initializers/observability.rb（当てはめすぎの例の部分）"
            code={`
class ApplicationController < ActionController::Base
  allow_browser versions: :modern
  # 当てはめすぎの例：本番でも debug の出来事（SQL など）を出す
  around_action(if: -> { ENV["OBS_VERBOSE"] }) { |_c, action| Rails.event.with_debug(&action) }
end

# config/initializers/observability.rb の最後
if ENV["OBS_VERBOSE"]
  require_relative "../../lib/observability/verbose_payment_gateway_event_subscriber"
  VerbosePaymentGatewayEventSubscriber.attach_to :faraday
  ActiveSupport::Notifications.subscribe("charge.checkout") do |event|
    Metrics.observe("checkout_charge_seconds", event.duration / 1000.0, order_id: event.payload[:order_id])
  end
end
`}
          />
          <p>
            <code>Rails.event.with_debug</code> は、ブロックの間だけ debug の出来事も送るメソッドです<Ref n={9} />。Active Record の StructuredEventSubscriber は、SQL ごとの <code>active_record.sql</code> を debug の出来事として送ります<Ref n={23} />。debug の出来事は既定では development の環境でだけ送られます<Ref n={24} />。
          </p>
          <h3>同じ30件を送って比べる</h3>
          <p>直したあとの版（normal）と、何でも記録した版（verbose）で、同じ30件を送ったときのファイルを比べました。</p>
          <Code
            lang="text"
            title="実行結果（wc と grep）"
            code={`
$ wc -c normal/events.log verbose/events.log
 31632 normal/events.log
 84568 verbose/events.log
$ wc -l normal/events.log verbose/events.log normal/metrics.txt verbose/metrics.txt
   128 normal/events.log
   282 verbose/events.log
    18 normal/metrics.txt
   258 verbose/metrics.txt
$ grep -o 'tok_[0-9a-f]*' normal/events.log | wc -l
0
$ grep -o 'tok_[0-9a-f]*' verbose/events.log | wc -l
34
`}
          />
          <p>出来事の1件は次のようになっていました。</p>
          <Code
            lang="json"
            title="実行結果（verbose/events.log の payment_gateway.request_verbose の1行を整形）"
            code={`
{
  "time": "2026-11-22T08:46:21.900Z",
  "name": "payment_gateway.request_verbose",
  "request_id": "8c68436e-e273-4c1b-a2eb-ebb38e146f7a",
  "payload": {
    "url": "http://localhost:4000/v1/charges",
    "request_headers": { "User-Agent": "Faraday v2.15.1", "Idempotency-Key": "order-1", "Content-Type": "application/json" },
    "request": { "amount": 1500, "token": "[FILTERED]" },
    "request_body": "{\\"amount\\":1500,\\"token\\":\\"tok_5e6df3baf41c\\"}",
    "response_body": { "id": "ch_0001", "status": "succeeded" },
    "duration_ms": 130.7
  }
}
`}
          />
          <p>結果から、次の3つのことがわかります。</p>
          <ul>
            <li>
              出来事のファイルは 128 行から 282 行に、31,632 バイトから 84,568 バイト（約2.7倍）に増えました。決済1件あたり約1.1KB から約2.8KB です。増えた行のうち120行は SQL の出来事で、1件の決済で4つの SQL（SELECT・BEGIN・UPDATE・COMMIT）が記録されます。1日に10万件の決済があれば、出来事のファイルは1日に約110MB から約280MB になります。
            </li>
            <li>
              Hash で渡した <code>request</code> のトークンは [FILTERED] になりましたが、JSON の文字列で渡した <code>request_body</code> には、カードのトークンがそのまま残りました。決済代行への34回の要求のすべてで残っています。Rails.event のフィルターは Hash の項目の名前を見て値を置き換えるので、文字列の中までは見ません<Ref n={9} />。SQL の出来事も同じで、<code>"binds": null</code> のとき、値は SQL の文字列の中に入っていて、フィルターは掛かりません<Ref n={23} />。
            </li>
            <li>
              メトリクスは 18 行から 258 行に増えました。注文の ID ごとに、バケットの6行と count・sum の2行ができるからです。Prometheus のドキュメントは、ラベルの値の組み合わせの1つ1つが別の時系列になり、保存するデータの量が大きく増えるので、利用者の ID やメールアドレスのように値の種類が多いものや上限のないものをラベルにしないように書いています<Ref n={21} />。多くのメトリクスはラベルの種類の数を10未満に保ち、100を超えそうなら別の方法を考えるように勧めています<Ref n={22} />。
            </li>
          </ul>
          <h3>判断の目安</h3>
          <Figure n="87-7" title="何をどのシグナルに記録するか" caption="横軸は値の種類の数、縦軸は調べるときの単位。下の枠はどのシグナルにも書かない値。">
            <OveruseFigure />
          </Figure>
          <p>
            図 87-7 は記録する値を、値の種類の数と、調べるときの単位で分けたものです。注文の ID は、ログやトレースの項目にすれば1件ずつ検索できますが、メトリクスのラベルにすると、注文の数だけ系列が増えます。同じ値でも、置く場所で役に立つかどうかが変わります。
          </p>
          <ul>
            <li>何を記録するかは答えたい問いから決めます。この章の3つの問いには、request_started・payment_gateway.request・checkout.paid・request_completed の4種類の出来事と、2つのメトリクスと、トレースで答えられました。</li>
            <li>SQL の全文や、要求と応答の本文は、常に出すのではなく、調べている間だけ、一部の要求だけで出します。Dapper の論文もすべての要求ではなく標本を記録したことを成功の理由に挙げています<Ref n={6} />。</li>
            <li>秘密の値は filter_parameters に名前を入れ、Hash の項目として渡します。JSON の文字列や SQL の文字列に入れた値は、フィルターで置き換えられません。</li>
            <li>記録のコードにも誤りが入ることがあります。手順3の error_of のように、記録した値が実際と合っているかを、本番に近い条件のテストで確かめます。</li>
          </ul>
          <p>
            逆に、記録が少なすぎる状態（この章の直す前のコード）では、遅い要求が起きるたびに記録を足してデプロイすることになります。記録を足すかどうかは、「次に同じ問いが出たとき、今のデータで答えられるか」で決めます。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の計測の仕組みと、OpenTelemetry',
      body: (
        <>
          <h3>ActiveSupport::Notifications と、Rails のログ</h3>
          <p>
            Rails は、コントローラーの処理（process_action.action_controller）、SQL（sql.active_record）、テンプレートの描画（render_template.action_view）、ジョブの実行（perform.active_job）などを、ActiveSupport::Notifications のイベントとして発行します。発行されるイベントと payload の一覧は Rails のガイドにあります<Ref n={20} />。ログの Completed の行や Server-Timing のヘッダーも、同じイベントの購読から作られています（<ChapterLink n={22} section="breakdown" />）。この章の Tracer とメトリクスは、Rails がすでに発行しているイベントに購読者を足しただけで、Rails の中のコードは変えていません。
          </p>
          <h3>Rails.event と StructuredEventSubscriber（Rails 8.1）</h3>
          <p>
            Rails 8.1 のリリースノートは、Rails の既定のロガーは人が読むには向いているが、後から機械で処理するには向いていないと述べ、Structured Event Reporting（Rails.event）を主な変更の1つに挙げています<Ref n={29} />。この章で使った機能は次のとおりです。
          </p>
          <ul>
            <li><code>Rails.event.notify(名前, 項目)</code>：出来事を送る。Hash の項目は filter_parameters で値を置き換える<Ref n={9} />。</li>
            <li><code>Rails.event.set_context</code>：要求やジョブの間、すべての出来事の context に入る値を設定する。Rails は Executor の to_complete で消す<Ref n={11} />。</li>
            <li><code>Rails.event.subscribe(購読者)</code>：emit を持つオブジェクトを登録する。ブロックを渡すと、受け取る出来事を絞れる<Ref n={9} />。</li>
            <li><code>Rails.event.with_debug</code>：ブロックの間だけ debug の出来事も送る。debug の出来事は既定では development の環境でだけ送られる<Ref n={24} />。</li>
            <li>
              <code>ActiveSupport::StructuredEventSubscriber</code>：Notifications のイベントを Rails.event の出来事に変える。Rails.event に購読者が1つもないときは何もしない<Ref n={27} />。8.1.4.1 の gem では、Action Controller・Action Dispatch・Action View・Action Mailer・Active Job・Active Record・Active Storage にこのクラスがあります。
            </li>
          </ul>
          <p>
            Rails 8.1 は Rails.event の購読者を既定では登録しません（雛形のアプリケーションで <code>Rails.event.subscribers.size</code> が 0 であることを確かめました）。出来事をどこに、どの形式で書くかは、アプリケーションが購読者で決めます。この章の JsonEventLog はファイルに書きましたが、標準出力に書いてログの収集の仕組みに渡すこともできます。
          </p>
          <h3>request_id</h3>
          <p>
            新しいアプリケーションの本番の設定ファイルには <code>config.log_tags = [ :request_id ]</code> が入っていて、文のログの各行に要求の ID が付きます<Ref n={7} />。ID は ActionDispatch::RequestId が決め、応答の X-Request-Id ヘッダーにも同じ値を返します。Nginx やロードバランサーのログと突き合わせる方法は <ChapterLink n={25} section="request-id" /> で、本番で監視して異常時に復旧する流れは <ChapterLink n={25} section="production-observability">同じ章の別の節</ChapterLink>で扱いました。この章では同じ ID を Rails.event の context とトレースの ID にも使い、文のログ・出来事・トレースを同じ値で検索できるようにしました。
          </p>
          <h3>OpenTelemetry を使うとき</h3>
          <p>
            OpenTelemetry の Ruby のドキュメントは、opentelemetry-sdk・opentelemetry-exporter-otlp・opentelemetry-instrumentation-all の3つの gem を入れ、初期化ファイルで計装を有効にする例を載せています。opentelemetry-instrumentation-rails を有効にすると、コントローラーへの要求のテレメトリーが自動で作られると書いています<Ref n={25} />。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/opentelemetry.rb（OpenTelemetry のドキュメントの例。本書では動かしていない）"
            code={`
require 'opentelemetry/sdk'
require 'opentelemetry/exporter/otlp'
require 'opentelemetry/instrumentation/all'
OpenTelemetry::SDK.configure do |c|
  c.service_name = '<YOUR_SERVICE_NAME>'
  c.use_all() # enables all instrumentation!
end
`}
          />
          <Callout kind="note">
            <p>
              本書の検証の環境は gem を全員で共有しているため、OpenTelemetry の gem は入れていません。この項の内容は OpenTelemetry のドキュメントで確かめた範囲の説明で、動かした結果ではありません。
            </p>
          </Callout>
          <p>
            この章の Tracer と Metrics は、仕組みを理解するための小さな実装です。本番では、別のサービスとトレースをつなぐ traceparent の受け渡し<Ref n={8} />、記録する要求の抽出、保存先への送信が必要になるので、OpenTelemetry や APM（アプリケーションの性能を監視するサービス）のエージェントを使います。自分で書いた計装を広げていくのも、当てはめすぎの1つです。
          </p>
          <h3>Rails Doctrine との関係</h3>
          <p>
            Rails Doctrine の「Value integrated systems」は、Rails は統合されたシステム（1つのアプリケーションで問題全体を扱うシステム）を第一に考えると述べています。オブジェクトのメソッドの呼び出しはマイクロサービスの間の遠隔の呼び出しよりはるかに単純で、分散すると失敗の状態や遅延の問題が増えるとも書いています<Ref n={26} />。
          </p>
          <p>
            統合されたシステムでは、1つの要求の処理の多くが1つのプロセスの中で起きるので、この章のように request_id と ActiveSupport::Notifications で多くを追えます。それでも、決済代行のような外部のサービスへの呼び出しは残ります。この章の遅さもその呼び出しの中にあり、外部の呼び出しを1回ずつ記録したことで原因がわかりました。
          </p>
          <p>
            記録したデータは性能を直すときの根拠にもなります。推測ではなく測ってから直す考え方は、次の <ChapterLink n={90} /> で扱います。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 には Rails.event と StructuredEventSubscriber がありません（activesupport 7.2.2.1 の gem に event_reporter.rb がないことを確かめました）<Ref n={30} />。ActiveSupport::Notifications、本番の設定の log_tags、Faraday の :instrumentation は 7.2 でも使えます。7.2 で構造化ログを書くときは、この章の Tracer と同じように Notifications のイベントを直接購読し、JSON にして書きます。process_action.action_controller の payload の <code>:request</code> は 7.2 にもあるので、そこから request_id を取れます。
            </p>
          </Callout>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          何を記録するかは答えたい問いから決めます。この章では「何件が遅いか」をメトリクスのヒストグラムで、「その要求で何が起きたか」を request_id の付いた出来事で、「どこで時間がかかったか」をトレースで答えられるようにしました。SQL の全文や要求の本文は常には出さず、調べている間だけ一部の要求で出します。
        </>
      ),
      benefit: {
        text: <>直す前は、遅かった注文 6 の要求の 1095ms のうち約 1067ms の内訳がログから分からなかった。直した後は、メトリクスで30件のうち4件が1秒を超えてタイムアウトも4回あったと分かり、ログとトレースで、1回目の決済代行への要求がタイムアウトするまでの 1007ms とやり直しが原因だと分かった。</>,
        basis: <><ChapterLink n={89} section="scene" />、<ChapterLink n={89} section="apply" /></>,
      },
      cost: {
        text: <>何でも記録した版では、出来事のファイルが約2.7倍になり、文字列で渡したカードのトークンが34回残り、注文の ID をラベルにしたメトリクスは 18 行から 258 行に増えた。記録のコードにも誤りが入るので（手順3の error_of）、記録した値が実際と合うかをテストで確かめる必要がある。</>,
        basis: <><ChapterLink n={89} section="overuse" />、<ChapterLink n={89} section="apply" /></>,
      },
      alternative: {
        text: <>注文の ID はメトリクスのラベルにせず、ログやトレースの項目にして1件ずつ検索する。秘密の値は filter_parameters に名前を入れ、JSON や SQL の文字列ではなく Hash の項目として渡す。トレースはすべての要求ではなく標本を記録する。</>,
        basis: <ChapterLink n={89} section="overuse" />,
      },
      criterion: {
        text: <>次に同じ問いが出たとき、今のデータで答えられるか。その値の種類の数と、調べるときの単位（1件ずつか、件数の分布か）に合った置き場所か。ログに残すと困る値（カードのトークン）が混ざらないか。</>,
        basis: <ChapterLink n={89} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>可観測性はシステムの内部の状態を外から理解できるようにする原則です。OpenTelemetry は、問題を調べるたびに計装を足さなくても、必要な情報がそろっている状態を「適切に計装されている」と説明しています。</li>
          <li>ログ・メトリクス・トレースは答えやすい問いが違います。何件が遅いかはメトリクス（平均ではなくヒストグラム）で、その要求で何が起きたかは request_id の付いたログで、どこで時間がかかったかはトレースで答えます。</li>
          <li>Rails の各部品は ActiveSupport::Notifications のイベントを発行していて、ログ・トレース・メトリクスはその購読で作れます。Rails 8.1 の Rails.event は項目を持つ出来事を送る仕組みで、StructuredEventSubscriber がイベントを出来事に変えます。request_id は、request_started より前に動くミドルウェアで context に入れます。</li>
          <li>Faraday の :instrumentation を retry より後に置くと、やり直しを含めて1回の要求ごとに記録できます。やり直しでは同じ env が使われ、前の回の :exception が残るので、記録のコードもテストで確かめます。</li>
          <li>デモでは、メトリクスで30件のうち4件が1秒を超え、タイムアウトも4回あったことがわかり、ログとトレースで、1回目の要求がタイムアウトするまでの 1007ms とやり直しが原因だとわかりました。</li>
          <li>何でも記録すると、出来事のファイルは約2.7倍になり、文字列で渡したカードのトークンは34回残り、注文の ID をラベルにしたメトリクスは 18 行から 258 行に増えました。何を記録するかは答えたい問いから決め、秘密の値は filter_parameters に入れて Hash の項目として渡します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Observability primer', publisher: 'OpenTelemetry', url: 'https://opentelemetry.io/docs/concepts/observability-primer/', accessed: '2026-11-22', note: '可観測性の説明（内部の仕組みを知らなくても外から問いを立てて理解できる、unknown unknowns、適切な計装の条件）、メトリクスは数値のデータを期間で集計したものであること、ログ・スパン・トレース（ルートスパンと下のスパン）の説明。' },
    { title: 'Signals', publisher: 'OpenTelemetry', url: 'https://opentelemetry.io/docs/concepts/signals/', accessed: '2026-11-22', note: 'シグナルの定義と、トレース・メトリクス・ログ・バゲッジを扱うこと。' },
    { title: 'Logs', publisher: 'OpenTelemetry', url: 'https://opentelemetry.io/docs/concepts/signals/logs/', accessed: '2026-11-22', note: '構造化ログは安定した項目の名前・型・意味を持つログで、JSON で書いただけでは構造化ログにならないこと。本番では構造化ログが勧められること。' },
    { title: 'What is OpenTelemetry?', publisher: 'OpenTelemetry', url: 'https://opentelemetry.io/docs/what-is-opentelemetry/', accessed: '2026-11-22', note: 'トレース・メトリクス・ログを作り、送り出し、集めるためのフレームワークとツールであること、オープンソースでベンダーやツールに依存しないこと、CNCF のプロジェクトで OpenTracing と OpenCensus が合わさってできたこと。' },
    { title: 'Site Reliability Engineering, Chapter 6: Monitoring Distributed Systems', publisher: 'Rob Ewaschuk（Betsy Beyer 編）/ Google（sre.google）', url: 'https://sre.google/sre-book/monitoring-distributed-systems/', accessed: '2026-11-22', note: '監視の定義（数値のデータを集め、処理し、集計し、表示すること）、four golden signals（latency・traffic・errors・saturation）、Worrying About Your Tail（平均の遅延が 100ms でも1%の要求が5秒かかることがあり、処理時間を範囲ごとに数えるのがよいこと）。' },
    { title: 'Dapper, a Large-Scale Distributed Systems Tracing Infrastructure', publisher: 'Benjamin H. Sigelman ほか / Google, Inc.（Technical Report）', url: 'https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/', accessed: '2026-11-22', version: '2010年', note: '要旨：本番の分散トレーシングの仕組みの報告で、負荷の低さ・アプリケーションからの透過性・大規模な展開を設計の目標とし、標本の抽出と、計装を少数の共通のライブラリに限ったことが成功の鍵だったこと。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/config/environments/production.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/environments/production.rb.tt#L48-L50`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '新しいアプリケーションの本番の設定で config.log_tags = [ :request_id ] とし、ログを標準出力に書くこと。' },
    { title: 'Trace Context', publisher: 'W3C', url: 'https://www.w3.org/TR/trace-context-1/', accessed: '2026-11-22', version: 'W3C Recommendation 23 November 2021', note: 'traceparent ヘッダーの4つの項目、trace-id が16バイトで parent-id が8バイトであること、分散トレーシングのための文脈をサービスの間で受け渡す標準であること。' },
    { title: 'activesupport/lib/active_support/event_reporter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/event_reporter.rb#L266-L404`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'Hash の payload を filter_parameters で置き換えること（266〜268行目、562〜580行目）、subscribe が emit を持つオブジェクトとフィルターのブロックを受け取ること、notify が name・payload・tags・context・timestamp・source_location を購読者に渡すこと、with_debug（410行目）と set_context（520行目）。' },
    { title: 'activesupport/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/CHANGELOG.md#L482-L520`, accessed: '2026-11-22', version: 'Rails 8.1.0', note: 'Rails.event（Structured Event Reporter）が 8.1.0 で足されたこと、tagged と set_context、購読者が emit を持つこと。' },
    { title: 'activesupport/lib/active_support/railtie.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/railtie.rb#L49-L65`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'Executor の to_complete と、再読み込みの前に event_reporter.clear_context を呼ぶこと。' },
    { title: 'actionpack/lib/action_controller/structured_event_subscriber.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/structured_event_subscriber.rb#L7-L41`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'start_processing から action_controller.request_started を、process_action から action_controller.request_completed（status・view_runtime・db_runtime・queries_count・duration_ms など）を送ること。' },
    { title: 'lib/faraday/request/instrumentation.rb', publisher: 'lostisland/faraday（GitHub）', url: 'https://github.com/lostisland/faraday/blob/v2.15.1/lib/faraday/request/instrumentation.rb#L8-L53', accessed: '2026-11-22', version: 'Faraday 2.15.1（手元の gem で確認）', note: 'イベントの名前の既定が request.faraday、計装の既定が ActiveSupport::Notifications で、env を payload として instrument で要求を囲むこと。' },
    { title: 'lib/faraday/retry/middleware.rb', publisher: 'lostisland/faraday-retry（GitHub）', url: 'https://github.com/lostisland/faraday-retry/blob/v2.4.0/lib/faraday/retry/middleware.rb#L22-L73', accessed: '2026-11-22', version: 'faraday-retry 2.4.0（手元の gem で確認）', note: '既定でやり直す例外（Faraday::TimeoutError など）、IDEMPOTENT_METHODS が delete・get・head・options・put で、methods の既定がそれであること、max の既定が2であること。' },
    { title: 'activesupport/lib/active_support/notifications/instrumenter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/notifications/instrumenter.rb#L54-L64`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'instrument のブロックで例外が起きると、payload の :exception にクラス名とメッセージを、:exception_object に例外を入れること。' },
    { title: 'lib/faraday/options/env.rb', publisher: 'lostisland/faraday（GitHub）', url: 'https://github.com/lostisland/faraday/blob/v2.15.1/lib/faraday/options/env.rb#L101-L111', accessed: '2026-11-22', version: 'Faraday 2.15.1（手元の gem で確認）', note: 'Env の []= が、決まった項目以外の値を custom_members のハッシュに保存すること。' },
    { title: 'Exposition formats', publisher: 'Prometheus', url: 'https://prometheus.io/docs/instrumenting/exposition_formats/', accessed: '2026-11-22', note: 'テキストの形式のヒストグラムで、x_bucket の行に le ラベルで上限を書くこと、le="+Inf" のバケットが必要でその値が x_count と同じであること、x_sum と x_count の行。' },
    { title: 'activesupport/lib/active_support/notifications/fanout.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/notifications/fanout.rb#L341-L347`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'subscribe に渡したオブジェクトが start と finish を持つとき、Evented の購読者として開始と終了のそれぞれで呼ぶこと。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb#L567-L570`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'raw_execute が log（sql.active_record のイベント）の中で with_raw_connection を呼ぶこと。abstract_adapter.rb の1059〜1063行目で、with_raw_connection が materialize_transactions（遅らせていた BEGIN を送る）を呼ぶこと。' },
    { title: 'Active Support Instrumentation', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_support_instrumentation.html', accessed: '2026-11-22', version: 'Rails 8.1', note: 'subscribe の書き方、Rails の各部品が発行するイベントと payload の一覧、自分で作るイベントの名前を event.library の形にすること。' },
    { title: 'Metric and label naming', publisher: 'Prometheus', url: 'https://prometheus.io/docs/practices/naming/', accessed: '2026-11-22', note: 'ラベルの値の組み合わせの1つ1つが新しい時系列になり、利用者の ID やメールアドレスのように値の種類が多いものや上限のないものをラベルにしないこと。時間の基本の単位が秒であること。' },
    { title: 'Instrumentation', publisher: 'Prometheus', url: 'https://prometheus.io/docs/practices/instrumentation/', accessed: '2026-11-22', note: 'Do not overuse labels：ラベルの組み合わせごとに RAM・CPU・ディスク・ネットワークの費用がかかり、多くのメトリクスはラベルの種類の数を10未満に保ち、100を超えそうなら別の方法を考えること。' },
    { title: 'activerecord/lib/active_record/structured_event_subscriber.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/structured_event_subscriber.rb#L21-L57`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'sql のイベントを active_record.sql の debug の出来事として送り、binds は属性の名前でフィルターするが、sql の文字列はそのまま渡すこと（debug_only :sql）。' },
    { title: 'railties/lib/rails/application/bootstrap.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/bootstrap.rb#L74-L77`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'Rails.event.debug_mode を Rails.env.development? にし、raise_on_error を consider_all_requests_local にすること。' },
    { title: 'Using instrumentation libraries（Ruby）', publisher: 'OpenTelemetry', url: 'https://opentelemetry.io/docs/languages/ruby/libraries/', accessed: '2026-11-22', note: 'opentelemetry-instrumentation-rails を有効にするとコントローラーへの要求のテレメトリーが自動で作られること、opentelemetry-sdk・opentelemetry-exporter-otlp・opentelemetry-instrumentation-all と、初期化ファイルで use_all を呼ぶ例。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: 'Value integrated systems：統合されたシステムを第一に考えること、メソッドの呼び出しはマイクロサービスの間の遠隔の呼び出しより単純で、分散すると失敗の状態や遅延の問題が増えること。' },
    { title: 'activesupport/lib/active_support/structured_event_subscriber.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/structured_event_subscriber.rb#L5-L77`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'Notifications のイベントを Rails.event の出来事に変えるクラスであること、attach_to、Rails.event に購読者がいないときは silenced になること、emit_event が Rails.event.notify を呼ぶこと。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/config/initializers/filter_parameter_logging.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/initializers/filter_parameter_logging.rb.tt#L6-L8`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '新しいアプリケーションの filter_parameters に :passw・:email・:secret・:token・:_key などが入ること。' },
    { title: 'Ruby on Rails 8.1 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/8_1_release_notes.html#structured-event-reporting', accessed: '2026-11-22', version: 'Rails 8.1', note: 'Structured Event Reporting が主な変更の1つであること、既定のロガーは人が読むには向くが後から処理するには向かないこと、notify・tagged・set_context と、購読者が emit を持つこと。' },
    { title: 'activesupport/lib/active_support（Rails 7.2.2.1）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/tree/v7.2.2.1/activesupport/lib/active_support', accessed: '2026-11-22', version: 'Rails 7.2.2.1（rubygems.org の gem で確認）', note: 'event_reporter.rb と structured_event_subscriber.rb がないこと。actionpack 7.2.2.1 の action_controller/metal/instrumentation.rb の66行目で、process_action の payload に request が入ること。' },
    { title: 'lib/webmock/http_lib_adapters/net_http.rb', publisher: 'bblimke/webmock（GitHub）', url: 'https://github.com/bblimke/webmock/blob/v3.36.0/lib/webmock/http_lib_adapters/net_http.rb#L203-L205', accessed: '2026-11-22', version: 'WebMock 3.36.0（手元の gem で確認）', note: 'to_timeout の応答で Net::OpenTimeout を発生させること。' },
    { title: 'lib/faraday/adapter/net_http.rb', publisher: 'lostisland/faraday-net_http（GitHub）', url: 'https://github.com/lostisland/faraday-net_http/blob/v3.5.0/lib/faraday/adapter/net_http.rb#L44-L89', accessed: '2026-11-22', version: 'faraday-net_http 3.5.0（手元の gem で確認）', note: 'Net::OpenTimeout を NET_HTTP_EXCEPTIONS に入れて Faraday::ConnectionFailed に変え、ほかの Timeout::Error を Faraday::TimeoutError に変えること。' },
  ],
}

export default chapter
