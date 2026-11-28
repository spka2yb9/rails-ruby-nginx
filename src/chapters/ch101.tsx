import { useState } from 'react'
import { figureNumber } from '../content/label'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

/* ---------- 実験の構成 ---------- */
function LabFigure() {
  const routes = [
    'GET /shipments?id=42 → 200 と JSON',
    'GET /slow?sec=5 → 5 秒後に 200',
    'GET /trickle → 0.5 秒ごとに1文字ずつ送る',
    'GET /flaky → 503 を2回返し、3回目に 200',
    'GET /limited → 429（Retry-After: 2）を2回',
    'GET /error → 常に 500',
    'POST /shipments?delay=2 → 登録後 2 秒待って 201',
    'ポート 9393 → 接続を受け付けるが読まない',
  ]
  return (
    <Svg
      id="101-2"
      w={780}
      h={250}
      label="クライアントのコンテナから、Docker のネットワーク rbdemo を通って、偽の配送 API のコンテナのポート 9292 に要求を送る。偽の API は、正常な応答のほか、5秒の遅延、少しずつ送る応答、503 を2回、429 を2回、常に 500、登録後に応答を遅らせる POST、接続を受けても読まないポートを用意している"
    >
      <Box x={20} y={70} w={220} h={90} lines={['クライアント', 'ruby:4.0 のコンテナ', 'ShippingClient・Faraday']} fs={12} bold fill="box" subTone="muted" />
      <Arrow x1={240} y1={115} x2={318} y2={115} />
      <T x={279} y={100} fs={10.5} tone="muted" anchor="middle">
        rbdemo
      </T>
      <rect x={320} y={20} width={440} height={210} rx={8} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={334} y={40} bold fs={12.5}>
        偽の配送 API（ag-101-fake:9292、Rack と Puma 8.0.2）
      </T>
      {routes.map((r, i) => (
        <T key={r} x={334} y={66 + i * 21} fs={12}>
          {r}
        </T>
      ))}
    </Svg>
  )
}

/* ---------- 要求の段階とタイムアウト ---------- */
function PhaseFigure() {
  const phases = [
    { x: 20, name: '名前解決', opt: '（専用の設定なし）', err: 'Socket::ResolutionError', t: '0.03 秒で失敗' },
    { x: 210, name: 'TCP の接続', opt: 'open_timeout', err: 'Net::OpenTimeout', t: '2 を指定 → 2.00 秒' },
    { x: 400, name: '要求を書き込む', opt: 'write_timeout', err: 'Net::WriteTimeout', t: '1 を指定 → 1.09 秒' },
    { x: 590, name: '応答を待つ・読む', opt: 'read_timeout', err: 'Net::ReadTimeout', t: '1 を指定 → 1.00 秒' },
  ]
  return (
    <Svg
      id="101-3"
      w={780}
      h={320}
      label="HTTP の要求は、名前解決、TCP の接続、要求の書き込み、応答の待ちと読み込みの順に進む。接続には open_timeout、書き込みには write_timeout、読み込みには read_timeout が対応する。実測では、名前解決できないホストは 0.03 秒で Socket::ResolutionError、応答しない IP への接続は open_timeout 2 で 2.00 秒、読まない相手への 20MB の送信は write_timeout 1 で 1.09 秒、5 秒眠る相手からの読み込みは read_timeout 1 で 1.00 秒で例外になった。0.5 秒ごとに1文字ずつ届く応答は、1回の待ちが 1 秒を超えないので、read_timeout 1 でも 5.01 秒かかって成功した"
    >
      {phases.map((p, i) => (
        <g key={p.name}>
          <Box x={p.x} y={20} w={170} h={44} lines={p.name} fs={13} bold fill={i === 3 ? 'box5' : 'box'} />
          {i < 3 && <Arrow x1={p.x + 170} y1={42} x2={p.x + 188} y2={42} />}
          <Box x={p.x} y={80} w={170} h={78} lines={[p.opt, p.err, p.t]} fs={11.5} fill="bg" dashed subTone="muted" />
        </g>
      ))}
      <T x={20} y={186} bold fs={12.5}>
        read_timeout は「1回の読み込みを待つ時間」で、応答全体の上限ではない
      </T>
      <line x1={20} y1={226} x2={760} y2={226} stroke="var(--fig-line)" />
      {Array.from({ length: 10 }, (_, k) => (
        <g key={k}>
          <rect x={20 + (k + 1) * 66 - 8} y={214} width={8} height={24} fill="var(--fig-box5)" stroke="var(--fig-line)" />
        </g>
      ))}
      <T x={20} y={256} fs={11.5}>
        0.5 秒ごとに1文字ずつ届く応答（10 文字）。どの待ちも 1 秒未満なので read_timeout 1 では止まらない
      </T>
      <T x={20} y={278} fs={11.5}>
        結果：例外にならず、全体で 5.01 秒かかって 200 を受け取った
      </T>
      <T x={20} y={304} fs={11} tone="muted">
        Ruby 4.0.9（net-http 0.9.1）、Docker のネットワーク内での実測
      </T>
    </Svg>
  )
}

/* ---------- Net::HTTP の自動の送り直し ---------- */
function AutoRetryFigure() {
  const x0 = 170
  const s = 280 // 1 秒あたりの幅
  return (
    <Svg
      id="101-4"
      w={780}
      h={250}
      label="read_timeout を 1 秒にし、max_retries を既定の 1 のまま、5 秒眠る GET を送った。1 回目は 1 秒で読み込みのタイムアウトになり、Net::HTTP が自動でもう一度同じ GET を送った。2 回目も 1 秒でタイムアウトになり、2.00 秒後に例外が上がった。偽のサーバーは同じ要求を2回受け取り、両方を最後まで処理した"
    >
      {[0, 1, 2].map((sec) => (
        <g key={sec}>
          <line x1={x0 + sec * s} y1={30} x2={x0 + sec * s} y2={196} stroke="var(--fig-line)" strokeDasharray="2 4" />
          <T x={x0 + sec * s} y={20} fs={11} anchor="middle" tone="muted">
            {`${sec} 秒`}
          </T>
        </g>
      ))}
      <T x={20} y={62} bold fs={12}>
        クライアント
      </T>
      <Box x={x0} y={46} w={s} h={32} lines="1回目の GET" fs={12} fill="box" />
      <Box x={x0 + s} y={46} w={s} h={32} lines="自動で送り直した GET" fs={12} fill="box5" accent />
      <T x={x0 + 2 * s - 6} y={92} fs={11.5} anchor="end">
        2.00 秒で Net::ReadTimeout
      </T>
      <T x={20} y={122} bold fs={12}>
        偽のサーバー
      </T>
      <Box x={x0} y={106} w={590} h={30} lines="要求 n=1：5 秒眠ってから 200 を返す（誰も受け取らない）" fs={12} fill="box4" />
      <Box x={x0 + s} y={146} w={310} h={30} lines="要求 n=2：同じく 5 秒処理する" fs={12} fill="box4" />
      <T x={20} y={216} fs={11.5}>
        max_retries = 0 にすると、1.00 秒で例外になり、サーバーが受け取る要求も1回だった
      </T>
      <T x={20} y={236} fs={11} tone="muted">
        送り直すのは GET・HEAD・PUT・DELETE・OPTIONS・TRACE で、POST は送り直さない（net-http 0.9.1）
      </T>
    </Svg>
  )
}

/* ---------- 再試行の時系列 ---------- */
function RetryTimelineFigure() {
  const x0 = 170
  const s = 140
  const rows = [
    { name: '/flaky（503 が2回）', y: 50, marks: [{ t: 0, l: '503' }, { t: 0.4, l: '503' }, { t: 1.2, l: '200' }], waits: ['0.38 秒', '0.79 秒'] },
    { name: '/limited（429 が2回）', y: 125, marks: [{ t: 0, l: '429' }, { t: 2.01, l: '429' }, { t: 4.01, l: '200' }], waits: ['Retry-After 2 秒', 'Retry-After 2 秒'] },
    { name: '/error（500 が続く）', y: 200, marks: [{ t: 0, l: '500' }, { t: 0.26, l: '500' }, { t: 0.85, l: '500' }], waits: ['', ''] },
  ]
  return (
    <Svg
      id="101-6"
      w={780}
      h={270}
      label="with_retries で3回まで送った時系列。/flaky は 503 の後に 0.38 秒と 0.79 秒待ち、1.20 秒で 200 を受け取った。/limited は 429 の Retry-After に従って 2 秒ずつ待ち、4.01 秒で 200 を受け取った。/error は 500 が続き、0.85 秒の3回目で再試行をやめて例外を上げた"
    >
      {[0, 1, 2, 3, 4].map((sec) => (
        <T key={sec} x={x0 + sec * s} y={20} fs={11} anchor="middle" tone="muted">
          {`${sec} 秒`}
        </T>
      ))}
      {rows.map((r) => {
        const end = r.marks[r.marks.length - 1].t
        return (
          <g key={r.name}>
            <T x={20} y={r.y + 4} fs={12} bold>
              {r.name}
            </T>
            <line x1={x0} y1={r.y + 4} x2={x0 + end * s} y2={r.y + 4} stroke="var(--fig-line)" strokeWidth={2} />
            {r.marks.map((m, i) => (
              <g key={i}>
                <circle cx={x0 + m.t * s} cy={r.y + 4} r={6} fill={m.l === '200' ? 'var(--fig-box5)' : 'var(--fig-box4)'} stroke="var(--fig-line)" />
                <T x={x0 + m.t * s + (i === 1 && r.marks[1].t - r.marks[0].t < 0.5 ? 6 : 0)} y={r.y - 14} fs={11} anchor={i === 1 && r.marks[1].t - r.marks[0].t < 0.5 ? 'start' : 'middle'} mono>
                  {m.l}
                </T>
              </g>
            ))}
            {r.waits.map(
              (w, i) =>
                w && (
                  <T key={i} x={x0 + ((r.marks[i].t + r.marks[i + 1].t) / 2) * s} y={r.y + 26} fs={10.5} anchor="middle" tone="muted">
                    {w}
                  </T>
                ),
            )}
            {r.name.startsWith('/error') && (
              <T x={x0 + end * s + 14} y={r.y + 4} fs={11.5} tone="danger">
                3回目で例外を上げる
              </T>
            )}
          </g>
        )
      })}
      <T x={20} y={252} fs={11} tone="muted">
        待ち時間は「0.5 秒 × 2の(回数 − 1)乗」に 0.5〜1.0 倍のばらつきを掛けた値。429 では Retry-After の秒数を使う
      </T>
    </Svg>
  )
}

/* ---------- 冪等性キーの有無 ---------- */
function IdempotencyFigure() {
  return (
    <Svg
      id="101-7"
      w={780}
      h={300}
      label="登録後の応答が 2 秒遅れる POST を、read_timeout 1 秒で3回まで送った。冪等性キーがないと、3回ともクライアントはタイムアウトしたが、サーバーは3件の配送を登録した。同じ冪等性キーを付けると、1回目はタイムアウトしたが、2回目は保存済みの結果が 201 と Idempotent-Replayed: true で返り、登録は1件だった"
    >
      <T x={20} y={22} bold>
        冪等性キーなし
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Box x={20 + i * 200} y={36} w={180} h={44} lines={[`${i + 1}回目の POST`, '1 秒で ReadTimeout']} fs={12} fill="box" subTone="muted" />
          <Arrow x1={110 + i * 200} y1={80} x2={110 + i * 200} y2={100} />
          <Box x={20 + i * 200} y={102} w={180} h={32} lines={`配送 #${10 + i} を登録`} fs={12} fill="box4" />
        </g>
      ))}
      <Box x={620} y={70} w={140} h={44} lines={['登録 3 件', '利用者には失敗']} fs={12} fill="box5" accent subTone="muted" />
      <T x={20} y={170} bold>
        同じ冪等性キーを付ける
      </T>
      <Box x={20} y={184} w={180} h={44} lines={['1回目の POST', '1 秒で ReadTimeout']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={110} y1={228} x2={110} y2={248} />
      <Box x={20} y={250} w={180} h={32} lines="配送 #13 を登録・キーを保存" fs={12} fill="box4" />
      <Box x={220} y={184} w={380} h={44} lines={['2回目の POST（1.42 秒後）', '保存した結果を返す：201、Idempotent-Replayed: true']} fs={12} fill="box" subTone="muted" />
      <Box x={620} y={184} w={140} h={44} lines={['登録 1 件', '利用者には成功']} fs={12} fill="box5" subTone="muted" />
    </Svg>
  )
}

/* ---------- 図 8 タイムアウトと再試行の回数を変える（操作できる図） ---------- */
// faraday-retry 2.4.0 の calculate_retry_interval と同じ式。backoff_factor 2、max_interval 5 秒、
// interval_randomness 0.5 のばらつきは最大（interval の半分）で計算する
const AXIS_STEPS = [5, 10, 20, 30, 60, 90, 120, 180, 240]
const sec = (v: number) => `${v.toFixed(2)} 秒`

function WorstTimeModel() {
  const [open, setOpen] = useState(2)
  const [read, setRead] = useState(3)
  const [max, setMax] = useState(3)
  const [base, setBase] = useState(0.5)
  const [retryConn, setRetryConn] = useState(false)
  const rows = [
    { label: ['応答が来ない', '（GET /slow）'], name: '応答が来ない', timeout: read, tries: max + 1, received: max + 1, fill: 'var(--fig-box5)' },
    { label: ['接続できない', '（応答しない IP）'], name: '接続できない', timeout: open, tries: retryConn ? max + 1 : 1, received: 0, fill: 'var(--fig-box)' },
  ].map((r) => {
    const waits = Array.from({ length: r.tries - 1 }, (_, i) => Math.min(base * 2 ** i, 5) + 0.5 * base)
    const waited = waits.reduce((a, b) => a + b, 0)
    return { ...r, waits, waited, total: r.tries * r.timeout + waited }
  })
  const axisMax = AXIS_STEPS.find((v) => v >= Math.max(...rows.map((r) => r.total))) ?? 240
  const px = (t: number) => 170 + (t / axisMax) * 520
  return (
    <Figure n={figureNumber(101, 8)} title="タイムアウトと再試行の回数から、待つ時間と要求の回数を見積もる" caption="この章の Faraday の設定（backoff_factor 2、max_interval 5 秒、interval_randomness 0.5）で、faraday-retry 2.4.0 の calculate_retry_interval と同じ式を使った概念モデルです。待ち時間のばらつきは最大の場合で計算しています。初期値で1件ずつ測り直した実測は、応答が来ない場合 16.16 秒（偽の API の記録は4回）、接続できない場合 2.00 秒、接続の失敗も再試行した場合 11.98 秒でした。実際には名前解決の時間や、少しずつ届く応答（read_timeout は1回の読み込みの上限）、Retry-After による待ちで、この値より長くなることがあります。">
      <div className="sim-controls">
        <label>
          <span>接続のタイムアウト（open_timeout） <output>{open}</output> 秒</span>
          <input type="range" min={1} max={10} step={1} value={open} onChange={(e) => setOpen(e.target.valueAsNumber)} />
        </label>
        <label>
          <span>読み込みのタイムアウト（read_timeout） <output>{read}</output> 秒</span>
          <input type="range" min={1} max={30} step={1} value={read} onChange={(e) => setRead(e.target.valueAsNumber)} />
        </label>
        <label>
          <span>再試行の回数（max） <output>{max}</output> 回</span>
          <input type="range" min={0} max={5} step={1} value={max} onChange={(e) => setMax(e.target.valueAsNumber)} />
        </label>
        <label>
          <span>最初の待ち時間（interval） <output>{base}</output> 秒</span>
          <input type="range" min={0} max={2} step={0.25} value={base} onChange={(e) => setBase(e.target.valueAsNumber)} />
        </label>
      </div>
      <p>
        <label>
          <input type="checkbox" checked={retryConn} onChange={(e) => setRetryConn(e.target.checked)} /> 接続の失敗（Faraday::ConnectionFailed）も再試行する
        </label>
      </p>
      <Svg id={figureNumber(101, 8)} w={780} h={214}
        label={rows.map((r) => `${r.name}場合は ${r.tries} 回試して最悪 ${sec(r.total)}、相手が受け取る要求は ${r.received} 回`).join('。')}>
        {rows.map((r, k) => {
          const y = 34 + k * 70
          let t = 0
          return (
            <g key={r.name}>
              <T x={10} y={y + 2} fs={12} bold>{r.label[0]}</T>
              <T x={10} y={y + 20} fs={11} tone="muted">{r.label[1]}</T>
              {Array.from({ length: r.tries }, (_, i) => {
                const start = t
                t += r.timeout
                const waitStart = t
                t += r.waits[i] ?? 0
                return (
                  <g key={i}>
                    <rect x={px(start)} y={y - 4} width={px(waitStart) - px(start)} height={24} fill={r.fill} stroke="var(--fig-line)" />
                    {r.received > 0 && <path d={`M${px(start)},${y - 6} l-4,-7 h8 z`} fill="var(--fig-accent)" />}
                    {i < r.waits.length && <rect x={px(waitStart)} y={y + 4} width={px(t) - px(waitStart)} height={8} fill="none" stroke="var(--fig-line)" strokeDasharray="3 2" />}
                  </g>
                )
              })}
              <T x={px(r.total) + 6} y={y + 8} fs={12} bold>{sec(r.total)}</T>
            </g>
          )
        })}
        <line x1={170} y1={162} x2={690} y2={162} stroke="var(--fig-line)" />
        {[0, axisMax / 2, axisMax].map((v) => <T key={v} x={px(v)} y={176} fs={10} anchor="middle" tone="muted">{`${v} 秒`}</T>)}
        <rect x={10} y={196} width={14} height={10} fill="var(--fig-box5)" stroke="var(--fig-line)" />
        <T x={30} y={201} fs={11}>応答を待つ（read_timeout）</T>
        <rect x={205} y={196} width={14} height={10} fill="var(--fig-box)" stroke="var(--fig-line)" />
        <T x={225} y={201} fs={11}>接続を待つ（open_timeout）</T>
        <rect x={400} y={198} width={14} height={6} fill="none" stroke="var(--fig-line)" strokeDasharray="3 2" />
        <T x={420} y={201} fs={11}>次の試行までの待ち時間</T>
        <path d="M601,197 l-4,-7 h8 z" transform="translate(0 10)" fill="var(--fig-accent)" />
        <T x={612} y={201} fs={11}>相手に届いた要求</T>
      </Svg>
      <div className="table-wrap" aria-live="polite"><table>
        <thead><tr><th scope="col">相手の状態</th><th scope="col">試行の回数</th><th scope="col">利用者が待つ最悪の時間</th><th scope="col">相手のサーバーが受け取る回数</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td><td>{r.tries} 回</td>
              <td>{`${sec(r.total)}（${r.timeout} 秒 × ${r.tries} 回${r.waits.length ? ` ＋ 待ち ${sec(r.waited)}` : ''}）`}</td>
              <td>{r.received} 回</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </Figure>
  )
}

const chapter: Chapter = {
  number: 101,
  part: 4,
  title: '外部 API との連携',
  summary:
    '配送状況を取得する例で、HTTP 通信を受け持つクラスを分け、タイムアウト、失敗の分類、再試行、冪等性キー、ジョブ、テストを設計します。遅延や 500・429 を返す偽の API を Docker で動かし、実際に起きることを確かめます。',
  goals: [
    'open_timeout・read_timeout・write_timeout がそれぞれ何を待つ時間かを、実測をもとに説明できる',
    '接続の失敗と相手が返した失敗を区別し、再試行してよい失敗かを判断できる',
    '再試行の回数・待ち時間・期限を決め、POST には冪等性キーを使える',
    'API キーの置き場所とログに残す項目を決め、外部サービスへ接続せずにテストできる',
  ],
  prerequisites: [94, 96, 99, 10],
  sections: [
    {
      id: 'boundary',
      title: '外部 API の都合を Rails の画面から分ける',
      body: (
        <>
          <p>
            Rails アプリはほかの会社のサービスを HTTP で呼ぶことがよくあります。配送業者に配送状況を問い合わせる、決済サービスに支払いを依頼する、地図サービスで住所を緯度と経度に変換する、といった処理です。このように別のサービスが公開している HTTP の窓口を<Term en="external API">外部 API</Term>と呼びます。外部 API は自社のデータベースと違い、ネットワークの向こうにあり、相手の都合で遅くなったり止まったりします。
          </p>
          <p>
            この章では注文画面に配送状況を表示する例を使います。注文の持ち主かどうかを確認する処理は Rails 側にあり、配送業者の URL、認証ヘッダー、JSON の項目名は外部 API 側で決まります。両方をコントローラーに書くと、画面の変更と配送業者の仕様変更が同じファイルに集まります。まず通信の契約だけを扱うクラスに分けます。接続先は仮の配送 API とし、<code>GET /shipments?id=42</code> に <code>{'{"status":"in_transit"}'}</code> が返るものとします。
          </p>
          <p>
            <Term>API クライアント</Term>は要求を作り、応答のステータスと本文を解釈するクラスです。注文の閲覧を許す条件はコントローラーなどが決め、配送状況を得られなかったときに「一時的に表示できません」と出すか、最後に取得した値を出すかは画面の要件で決めます。配送業者を切り替える必要が出た場合は、同じ処理を呼び出せるように複数の API を変換する <ChapterLink n={42}>Adapter</ChapterLink>を検討できます。
          </p>
          <Figure n={figureNumber(101, 1)} title="注文画面と配送 API の責務" caption="通信結果を画面の動作に変換する場所を決めると、同じクライアントをジョブからも使えます。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>処理する場所</th>
                    <th>知っている情報</th>
                    <th>次へ渡す値</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>コントローラー・ジョブ</td>
                    <td>現在の利用者と対象の注文、再試行の方針</td>
                    <td>参照を許された配送番号</td>
                  </tr>
                  <tr>
                    <td>API クライアント</td>
                    <td>接続先、認証情報、タイムアウト、応答の形式</td>
                    <td>配送状況、または失敗の分類（例外のクラス）</td>
                  </tr>
                  <tr>
                    <td>画面</td>
                    <td>配送状況を表示する規則</td>
                    <td>表示用の文言、最終取得時刻</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            クラスの置き場所はプロジェクトでそろえます。通信だけを担当するクラスには <code>app/clients/</code> が一案です。業務手順をまとめるサービスには通信の設定を持たせず、クライアントを引数で受け取ると、成功と失敗のそれぞれをテストで再現できます。
          </p>
          <p>
            依存する契約には URL と JSON の項目名のほかに、認証方式、失敗したときの応答、送ってよい要求の頻度が含まれます。相手から配送状況に新しい値が加わる場合、表示上の意味が分からなくても注文そのものを表示できるかを考えます。API のバージョンを変更するときは、アプリが利用している項目と実際に返る応答を先に照合します。
          </p>
        </>
      ),
    },
    {
      id: 'fake-server',
      title: '遅延や失敗を返す偽の API を用意する',
      body: (
        <>
          <p>
            本物の配送 API はこちらの都合で遅くしたり 500 を返させたりできません。そこでこの章では、遅延や失敗を返す小さな偽の API を Docker のコンテナで動かし、クライアントを別のコンテナから呼びました。偽の API は Rack のアプリケーションで、Puma で起動します。Rack は Ruby の Web サーバーとアプリケーションの間の決まりで、<code>call(env)</code> が「ステータス・ヘッダー・本文」の配列を返せば応答になります
            <Ref n={14} />。
          </p>
          <Code
            lang="ruby"
            title="fake_api.ru（抜粋）"
            code={`
COUNTS = Hash.new(0)
app = lambda do |env|
  req = Rack::Request.new(env)
  n = LOCK.synchronize { COUNTS["#{req.path}:#{req.params['key']}"] += 1 } # 同じ要求の何回目か
  case [req.request_method, req.path]
  in ["GET", "/slow"]
    sleep req.params["sec"].to_f
    json(200, { status: "in_transit" })
  in ["GET", "/flaky"]
    n <= 2 ? json(503, { error: "unavailable" }) : json(200, { status: "in_transit" })
  in ["GET", "/limited"]
    n <= 2 ? json(429, { error: "rate_limited" }, "retry-after" => "2") : json(200, { status: "in_transit" })
  in ["GET", "/error"]
    json(500, { error: "internal" })
  # /shipments、/trickle、POST /shipments は省略
  end
end
run app
`}
          />
          <Code
            lang="bash"
            title="偽の API とクライアントを起動する"
            code={`
docker run -d --rm --name ag-101-fake --network rbdemo -v "$GEMS":/usr/local/bundle:ro \\
  -v "$PWD":/work -w /work ruby:4.0 puma -b tcp://0.0.0.0:9292 -t 8:8 fake_api.ru

docker run --rm --network rbdemo -v "$GEMS":/usr/local/bundle:ro -v "$PWD":/work -w /work \\
  ruby:4.0 ruby exp_timeouts.rb
`}
          />
          <Figure n={figureNumber(101, 2)} title="この章の実験の構成" caption="偽の API は受け取った要求ごとに、時刻・パス・何回目か・返したステータスを標準出力に記録します。サーバー側で何回受け取ったかは、この記録で確かめます。">
            <LabFigure />
          </Figure>
          <p>
            偽の API は受け取った要求を <code>12:14:25.231 GET /slow?sec=5&amp;key=r1 key=- n=1 -&gt; 200</code> のように1行ずつ記録します。クライアントの側で見えた結果と、サーバーが実際に受け取った回数を並べると、送り直しが起きたかどうかが分かります。実験の Ruby は 4.0.9、標準ライブラリの net-http は 0.9.1、Faraday は 2.15.1 です。
          </p>
        </>
      ),
    },
    {
      id: 'client',
      title: '接続の条件と応答の形をコードにする',
      body: (
        <>
          <p>
            Ruby の標準ライブラリの <code>Net::HTTP</code> は、HTTP の要求を送り応答を受け取るクラスです。<code>Net::HTTP.new(ホスト, ポート)</code> で接続の設定を作り、<code>Net::HTTP::Get</code> や <code>Net::HTTP::Post</code> の要求を <code>request</code> に渡すと、応答のステータスに対応したクラス（200 なら <code>Net::HTTPOK</code>、429 なら <code>Net::HTTPTooManyRequests</code>）のインスタンスが返ります
            <Ref n={1} />。
          </p>
          <p>
            何も設定しないと、<code>Net::HTTP</code> は接続・読み込み・書き込みをそれぞれ 60 秒まで待ち、失敗した GET などを1回だけ自動で送り直します。実際に <code>Net::HTTP.new("example.test")</code> の設定を表示すると <code>{'{open_timeout: 60, read_timeout: 60, write_timeout: 60, max_retries: 1}'}</code> でした（net-http 0.9.1 の <code>http.rb</code> の 1150〜1161 行目）
            <Ref n={3} />。画面の要求の中で外部 API を呼ぶと、相手が止まっている間、利用者は最大で数分待たされることになります。
          </p>
          <p>
            次のクラスは配送状況の取得と配送の登録を受け持つクライアントです。接続先は Rails の設定から固定し、リクエストで受け取った値は配送番号としてクエリ文字列に符号化します。接続先のホストやスキームを利用者の入力から組み立てないようにすると、アプリケーションが意図しないネットワークへ要求する経路を減らせます。
          </p>
          <Code
            lang="ruby"
            title="app/clients/shipping_client.rb"
            code={`
require "json"
require "net/http"
require "time"
require "uri"

class ShippingClient
  class Error < StandardError; end
  # 時間をおいて送り直せば成功する見込みがある失敗
  class Retryable < Error; end
  class Unavailable < Retryable; end
  class RateLimited < Retryable
    attr_reader :retry_after
    def initialize(message, retry_after:)
      super(message)
      @retry_after = retry_after
    end
  end
  # 送り直しても結果が変わらない失敗
  class Permanent < Error; end
  class AuthenticationFailed < Permanent; end
  class NotFound < Permanent; end
  class UnexpectedResponse < Permanent; end

  def initialize(endpoint:, token:, open_timeout: 2, read_timeout: 3, write_timeout: 3, allow_http: false)
    @endpoint = URI.parse(endpoint)
    unless (@endpoint.scheme == "https" || allow_http) && @endpoint.host && @endpoint.userinfo.nil?
      raise ArgumentError, "HTTPS endpoint required"
    end
    @token = token
    @timeouts = { open_timeout:, read_timeout:, write_timeout: }
  end

  def status(shipment_id)
    uri = @endpoint.dup
    uri.path = "/shipments"
    uri.query = URI.encode_www_form(id: shipment_id)
    payload = parse_json(request(Net::HTTP::Get.new(uri)))
    value = payload["status"] if payload.is_a?(Hash)
    raise UnexpectedResponse, "missing status" unless value.is_a?(String) && !value.empty?
    value
  end

  def create_shipment(order_id:, idempotency_key:)
    uri = @endpoint.dup
    uri.path = "/shipments"
    req = Net::HTTP::Post.new(uri)
    req["Content-Type"] = "application/json"
    req["Idempotency-Key"] = idempotency_key
    req.body = JSON.generate(order_id: order_id)
    parse_json(request(req))
  end

  private

  def request(req)
    req["Accept"] = "application/json"
    req["Authorization"] = "Bearer #{@token}"
    payload = { method: req.method, host: @endpoint.host, path: req.uri.path }
    ActiveSupport::Notifications.instrument("request.shipping_client", payload) do
      response = http.request(req)
      payload[:status] = response.code.to_i
      payload[:upstream_request_id] = response["x-request-id"]
      classify(response)
    end
  rescue Net::OpenTimeout, Errno::ECONNREFUSED, SocketError => e
    raise Unavailable, "connection failed (#{e.class})" # 要求は相手に届いていない
  rescue Net::ReadTimeout, Net::WriteTimeout, Errno::ECONNRESET, EOFError => e
    raise Unavailable, "no response (#{e.class})"        # 相手が処理したかは分からない
  end

  def http
    h = Net::HTTP.new(@endpoint.host, @endpoint.port)
    h.use_ssl = @endpoint.scheme == "https"
    @timeouts.each { |k, v| h.public_send("#{k}=", v) }
    h.max_retries = 0 # 送り直す判断は呼び出し側で行う
    h
  end

  def classify(response)
    case response
    when Net::HTTPSuccess then response
    when Net::HTTPTooManyRequests
      raise RateLimited.new("HTTP 429", retry_after: parse_retry_after(response["Retry-After"]))
    when Net::HTTPUnauthorized, Net::HTTPForbidden then raise AuthenticationFailed, "HTTP #{response.code}"
    when Net::HTTPNotFound then raise NotFound, "HTTP 404"
    when Net::HTTPServerError then raise Unavailable, "HTTP #{response.code}"
    else raise UnexpectedResponse, "HTTP #{response.code}"
    end
  end

  def parse_json(response)
    raise UnexpectedResponse, "content-type #{response.content_type}" unless response.content_type == "application/json"
    JSON.parse(response.body)
  rescue JSON::ParserError
    raise UnexpectedResponse, "invalid JSON"
  end

  # Retry-After は秒数か HTTP の日付（RFC 9110）。読めない値は nil
  def parse_retry_after(value)
    return nil if value.nil?
    return Integer(value, 10) if value.match?(/\\A\\d+\\z/)
    [Time.httpdate(value) - Time.now, 0].max
  rescue ArgumentError
    nil
  end
end
`}
          />
          <p>
            このクラスの要点は3つです。1つ目は、タイムアウトを既定の 60 秒から短くし、<code>max_retries = 0</code> で自動の送り直しを止めていることです。理由は次の節で実際に確かめます。2つ目は、失敗を <code>Retryable</code>（時間をおけば成功する見込みがある）と <code>Permanent</code>（送り直しても同じ結果になる）の2系統の例外に分けていることです。呼び出し側は <code>rescue ShippingClient::Retryable</code> だけで再試行の対象を選べます。3つ目は、要求ごとに <code>ActiveSupport::Notifications</code> で通知を出し、ログや計測をクライアントの外で受け取れるようにしていることです。
          </p>
          <p>
            <code>allow_http</code> はこの章の偽の API（HTTP）に接続するためだけの引数です。本番の設定で渡さなければ、<code>http://</code> の URL は <code>ArgumentError: HTTPS endpoint required</code> になりました。HTTPS の証明書の検証は <code>Net::HTTP</code> の既定で有効です。クライアントはリダイレクトに従わず、2xx 以外は失敗に分類します。
          </p>
          <p>
            要求ごとに <code>Net::HTTP</code> の接続を作ると、通信のたびに TCP と TLS の接続を確立する費用がかかります。繰り返し同じ接続先を呼ぶ場合は接続を再利用するクライアントも候補です。その場合は、タイムアウト後の接続の扱いと、複数のスレッドが同時に使えるかを確認します。
          </p>
        </>
      ),
    },
    {
      id: 'timeouts',
      title: '3つのタイムアウトを実際に起こす',
      body: (
        <>
          <p>
            HTTP の要求は、相手のホスト名を IP アドレスに変える名前解決、TCP の接続、要求の書き込み、応答の待ちと読み込みの順に進みます。<code>Net::HTTP</code> の <code>open_timeout</code> は接続を開くまで、<code>write_timeout</code> は1回の書き込み、<code>read_timeout</code> は1回の読み込みを待つ時間です
            <Ref n={1} />。偽の API と、存在しない IP アドレス、閉じたポート、名前解決できないホストを相手に、それぞれを起こしました。
          </p>
          <Code
            lang="ruby"
            title="exp_timeouts.rb（抜粋）"
            code={`
def http(host: "ag-101-fake", port: 9292, **opts)
  h = Net::HTTP.new(host, port)
  opts.each { |k, v| h.public_send("#{k}=", v) }
  h
end

http(read_timeout: 1, max_retries: 0).get("/slow?sec=5&key=r0")
http(read_timeout: 1).get("/slow?sec=5&key=r1")                 # max_retries は既定の 1
http(read_timeout: 1).get("/trickle?n=10&gap=0.5")
http(host: "10.255.255.1", port: 80, open_timeout: 2).get("/")
http(port: 9999).get("/")
http(host: "no-such-host.invalid", port: 80).get("/")
http(port: 9393, write_timeout: 1, read_timeout: 1, max_retries: 0).post("/", "x" * 20_000_000)
`}
          />
          <Code
            lang="text"
            title="実行結果（かかった時間と、上がった例外）"
            code={`
200 OK                                     0.02 秒  200 {"status":"in_transit"}
read_timeout 1、max_retries 0              1.00 秒  Net::ReadTimeout
read_timeout 1、max_retries は既定（1）    2.00 秒  Net::ReadTimeout
0.5 秒ごとに1文字×10、read_timeout 1      5.01 秒  200 本文 10 文字
open_timeout 2、応答しない IP              2.00 秒  Net::OpenTimeout: Failed to open TCP connection to 10.255.255.1:80
接続を拒否するポート                       0.00 秒  Errno::ECONNREFUSED: Failed to open TCP connection to ag-101-fake:9999
名前解決できないホスト                     0.03 秒  Socket::ResolutionError: Failed to open TCP connection to no-such-host.invalid:80
write_timeout 1、読まない相手に 20MB       1.09 秒  Net::WriteTimeout
`}
          />
          <Figure n={figureNumber(101, 3)} title="要求の段階と、対応するタイムアウト" caption="上段は要求の段階と、各段階で失敗したときの例外と実測の時間です。下段は read_timeout が応答全体の上限にならない例です。">
            <PhaseFigure />
          </Figure>
          <p>
            接続の失敗は2種類に分かれました。閉じたポートには相手のサーバーが「接続しない」と即座に答えるので、<code>Errno::ECONNREFUSED</code> が 0.00 秒で上がります。存在しない IP アドレスには誰も答えないので、<code>open_timeout</code> の 2 秒を待ってから <code>Net::OpenTimeout</code> になりました。<code>open_timeout</code> を設定しなければ 60 秒待ちます。書き込みのタイムアウトを起こすために、偽の API のポート 9393（接続を受け付けるが読まない）に 20MB を送りました。送信用のバッファーが埋まったところで書き込みが進まなくなり、約 1 秒後に <code>Net::WriteTimeout</code> になりました。
          </p>
          <h3>read_timeout は応答全体の上限ではない</h3>
          <p>
            0.5 秒ごとに1文字ずつ返す <code>/trickle</code> では、<code>read_timeout</code> を 1 秒にしても例外にならず、5.01 秒かけて 10 文字を受け取りました。<code>read_timeout</code> は1回の読み込みでデータが届くまで待つ時間で、0.5 秒ごとに何かが届いている限り時間切れになりません。要求全体に上限を設けたい場合は、タイムアウトの値と、次に扱う送り直しの回数を掛け合わせた最悪の時間を見積もります。
          </p>
          <h3>Net::HTTP は GET を自動で送り直す</h3>
          <p>
            <code>max_retries</code> を既定の 1 のままにすると、5 秒眠る <code>/slow</code> への GET は 1.00 秒ではなく 2.00 秒で例外になりました。偽の API の記録には、同じ要求が2回残っています。
          </p>
          <Code
            lang="text"
            title="偽の API の記録（max_retries 0 の r0 と、既定の r1）"
            code={`
12:14:24.229 GET /slow?sec=5&key=r0 key=- n=1 -> 200
12:14:25.231 GET /slow?sec=5&key=r1 key=- n=1 -> 200
12:14:26.233 GET /slow?sec=5&key=r1 key=- n=2 -> 200
`}
          />
          <Figure n={figureNumber(101, 4)} title="Net::HTTP が読み込みのタイムアウトの後に GET を送り直す" caption="記録の時刻は、偽の API が 5 秒眠り終えて応答を返した時刻です。クライアントはすでに接続を閉じているので、その応答は誰も受け取りません。">
            <AutoRetryFigure />
          </Figure>
          <p>
            net-http 0.9.1 の <code>transport_request</code> は、<code>Net::ReadTimeout</code>・<code>EOFError</code>・<code>Errno::ECONNRESET</code> などが起きたとき、送った回数が <code>max_retries</code> より少なく、メソッドが GET・HEAD・PUT・DELETE・OPTIONS・TRACE のどれかなら、接続を閉じて同じ要求を送り直します（<code>http.rb</code> の 2433〜2475 行目）
            <Ref n={3} />。RFC 9110 で冪等（同じ要求を何度送っても結果が1回と同じ）とされるメソッドだけを選んでいます
            <Ref n={2} />。POST は送り直しません。
          </p>
          <p>
            この動作に気付かずに呼び出し側でも3回再試行すると、相手には最大6回の要求が届き、利用者は <code>read_timeout</code> の6倍待ちます。この章のクライアントで <code>max_retries = 0</code> にしたのは、送り直しの回数と待ち時間を1か所で決めるためです。後で扱う Faraday の Net::HTTP アダプターも、<code>Net::HTTP</code> の <code>max_retries</code> を 0 に設定しています
            <Ref n={7} />。
          </p>
        </>
      ),
    },
    {
      id: 'failures',
      title: '失敗後に呼び出し側が取る動作を決める',
      body: (
        <>
          <p>
            外部 API の失敗には、HTTP のステータスがある失敗と、ない失敗があります。接続できなかった場合や応答が届かなかった場合はステータスがありません。応答が届いた場合は、コードやヘッダーで失敗の意味を調べられます。前の節のクライアントで、偽の API が返す各種の応答を分類しました。
          </p>
          <Code
            lang="text"
            title="exp_classify.rb の実行結果"
            code={`
200                       => "in_transit"
404                       => ShippingClient::NotFound（再試行しない）: HTTP 404
200 だが HTML             => ShippingClient::UnexpectedResponse（再試行しない）: content-type text/html
401（トークンが違う）     => ShippingClient::AuthenticationFailed（再試行しない）: HTTP 401
500                       => ShippingClient::Unavailable（再試行してよい）: HTTP 500
429 と Retry-After: 2     => ShippingClient::RateLimited（再試行してよい）: HTTP 429 retry_after=2
読み込みのタイムアウト    => ShippingClient::Unavailable（再試行してよい）: no response (Net::ReadTimeout)
接続を拒否                => ShippingClient::Unavailable（再試行してよい）: connection failed (Errno::ECONNREFUSED)
`}
          />
          <Figure n={figureNumber(101, 5)} title="外部 API の失敗と呼び出し側での扱い" caption="一時的な失敗か、入力・接続先・認証情報の修正が必要かで次の動作を選びます。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>観測した結果</th>
                    <th>考えられる理由</th>
                    <th>この章の分類</th>
                    <th>扱いの例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>接続の拒否、接続のタイムアウト、名前解決の失敗</td><td>相手の停止、ネットワーク、設定の誤り</td><td>Unavailable</td><td>要求は届いていないので、POST でも送り直せる。続くなら設定も疑う</td></tr>
                  <tr><td>読み込み・書き込みのタイムアウト、接続の切断</td><td>相手の処理待ち、途中の切断</td><td>Unavailable</td><td>GET は送り直せる。POST は相手が処理した可能性があり、冪等性キーが必要</td></tr>
                  <tr><td>500・502・503・504</td><td>相手側の障害や過負荷</td><td>Unavailable</td><td>待ち時間を延ばしながら回数を限って送り直す</td></tr>
                  <tr><td>429</td><td>相手が要求数の上限を適用した</td><td>RateLimited</td><td><code>Retry-After</code> の秒数まで待つ。自社の期限を超えるなら諦める</td></tr>
                  <tr><td>401・403</td><td>API キーの失効や権限の不足</td><td>AuthenticationFailed</td><td>送り直さず運用に知らせる。画面の利用者に再ログインを求めても直らない</td></tr>
                  <tr><td>404</td><td>番号の誤り、相手側で削除</td><td>NotFound</td><td>送り直さない。画面には「見つからない」と出す</td></tr>
                  <tr><td>200 だが JSON でない・項目がない</td><td>仕様の変更、接続先の誤り、保守中の画面</td><td>UnexpectedResponse</td><td>応答の種別を記録し、契約を調べる</td></tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            ステータスがない失敗のうち、接続できなかった場合（<code>Net::OpenTimeout</code>・<code>Errno::ECONNREFUSED</code>）は、要求が相手に届いていません。読み込みのタイムアウトは、要求は届いたのに応答を受け取れなかった状態で、相手が処理を終えたかどうかは分かりません。GET ならどちらも送り直せますが、POST では区別が要ります。クライアントの例外のメッセージに元の例外のクラス名を残したのは、ログからこの違いを読めるようにするためです。
          </p>
          <h3>429 と Retry-After</h3>
          <p>
            429 Too Many Requests は、クライアントが一定時間に送った要求が多すぎることを表すステータスで、相手は <code>Retry-After</code> ヘッダーで次に送ってよいまでの時間を示せます
            <Ref n={4} />。<code>Retry-After</code> の値は秒数（<code>120</code>）か HTTP の日付（<code>Fri, 27 Nov 2026 12:00:30 GMT</code>）のどちらかです
            <Ref n={2} />。クライアントの <code>parse_retry_after</code> は両方を秒数に直し、読めない値は nil にしています。値が大きすぎる場合に従うかどうかは呼び出し側が決めます。画面の要求の中で 120 秒待つことはできないので、その場合は待たずに失敗として扱い、ジョブなら指定の時間の後に再実行を予約します。
          </p>
          <p>
            自社の画面への利用者の認証と、配送業者 API へのアプリの認証は分かれています。外部 API が <code>401</code> を返したからといって、画面の利用者にログインし直してもらっても API キーの失効は直りません。また、偽の API が保守中の HTML を 200 で返した例のように、ステータスが成功でも中身が期待と違うことがあります。<code>Content-Type</code> を確かめずに <code>JSON.parse</code> すると、<code>JSON::ParserError</code> が呼び出し側まで届き、通信の失敗と区別できなくなります。
          </p>
          <p>
            証明書の検証に失敗したときは、接続先や証明書の状態を調べます。その例外を一時的な失敗と見なして送り直しても、証明書の期限や信頼設定の問題は解決しません。回復方法が異なる失敗を同じエラー名にまとめると、ジョブが繰り返し送ったり、対処を要する失敗に気付きにくくなったりします。分類を増やす場合は、利用者への表示、再試行、運用への連絡のどれを変えるかを基準にします。
          </p>
        </>
      ),
    },
    {
      id: 'retries',
      title: '再試行できる条件と回数を決める',
      body: (
        <>
          <p>
            一時的な失敗は時間をおいて送り直すと成功することがあります。ただし、待たずにすぐ送り直すと、障害で弱っている相手にさらに負荷をかけます。多くのクライアントが同時に失敗すれば、同時に送り直して要求が集中します。そこで待ち時間を回ごとに延ばし（指数的な待ち時間、exponential backoff）、少しばらつかせます（ジッター）。回数と、全体で待ってよい時間の上限も決めます。
          </p>
          <Code
            lang="ruby"
            title="retrying.rb"
            code={`
def with_retries(attempts: 3, base: 0.5, max_wait: 5.0, deadline: 10.0, log: ->(*) {})
  started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  attempt = 0
  begin
    attempt += 1
    yield attempt
  rescue ShippingClient::Retryable => e
    raise if attempt >= attempts
    wait = if e.respond_to?(:retry_after) && e.retry_after
             e.retry_after                                   # 相手が指定した待ち時間
           else
             base * (2**(attempt - 1)) * (0.5 + rand * 0.5)  # 指数的に延ばし、ばらつかせる
           end
    elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started
    raise if wait > max_wait || elapsed + wait > deadline    # 待てない場合はあきらめる
    log.call(attempt, e, wait)
    sleep wait
    retry
  end
end
`}
          />
          <p>
            <code>rescue</code> するのは <code>ShippingClient::Retryable</code> だけなので、404 や 401 は1回で呼び出し元へ上がります。偽の API の <code>/flaky</code>（503 を2回）、<code>/limited</code>（429 を2回）、<code>/error</code>（常に 500）に対して実行しました。
          </p>
          <Code
            lang="text"
            title="exp_retry.rb の実行結果"
            code={`
== 503 が2回続く /flaky
 0.02 秒  1 回目: Unavailable HTTP 503 → 0.38 秒待つ
 0.40 秒  2 回目: Unavailable HTTP 503 → 0.79 秒待つ
 1.20 秒  結果 200
== 429（Retry-After: 2）が2回続く /limited
 1.20 秒  1 回目: RateLimited HTTP 429 → 2 秒待つ
 3.21 秒  2 回目: RateLimited HTTP 429 → 2 秒待つ
 5.21 秒  結果 200
== 500 が続く /error（3回であきらめる）
 5.21 秒  1 回目: Unavailable HTTP 500 → 0.26 秒待つ
 5.47 秒  2 回目: Unavailable HTTP 500 → 0.59 秒待つ
 6.06 秒  ShippingClient::Unavailable: HTTP 500
== Retry-After が上限を超える場合（max_wait: 1）
 6.06 秒  ShippingClient::RateLimited: HTTP 429（待たずに失敗）
`}
          />
          <Figure n={figureNumber(101, 6)} title="3つの相手に対する再試行の時系列" caption="上の実行結果を、それぞれの開始時刻を 0 秒にそろえて描きました。">
            <RetryTimelineFigure />
          </Figure>
          <p>
            /flaky では待ち時間が 0.38 秒、0.79 秒と延び、3回目に成功しました。/limited では計算した待ち時間を使わず、<code>Retry-After</code> の 2 秒ずつ待っています。/error では3回目も 500 だったので、それ以上は待たずに例外を上げました。<code>max_wait: 1</code> の場合、<code>Retry-After: 2</code> は上限を超えるので1回目で諦めています。画面の要求の中で再試行するなら、利用者を待たせてよい時間から <code>deadline</code> を決めます。
          </p>
          <h3>POST を送り直すと二重に登録される</h3>
          <p>
            配送の登録（POST）では、応答が返る前に読み込みのタイムアウトになっても、相手は登録を終えているかもしれません。偽の API の <code>POST /shipments?delay=2</code> は配送を登録してから 2 秒待って応答します。<code>read_timeout</code> を 1 秒にしたクライアントで、<code>with_retries</code> を使って登録しました。
          </p>
          <Code
            lang="text"
            title="exp_idem.rb の実行結果（ログの行を一部省略）"
            code={`
== 冪等性キーなしで再試行
12:17:01.327 shipping_api method=POST path=/shipments status=- duration_ms=1003.5 error=Net::ReadTimeout
12:17:01.327 retry attempt=1 error=ShippingClient::Unavailable wait=2.12
12:17:04.445 shipping_api method=POST path=/shipments status=- duration_ms=1002.4 error=Net::ReadTimeout
12:17:04.445 retry attempt=2 error=ShippingClient::Unavailable wait=4.21
12:17:09.661 shipping_api method=POST path=/shipments status=- duration_ms=1002.2 error=Net::ReadTimeout
結果: ShippingClient::Unavailable: no response (Net::ReadTimeout) / 登録された配送: 3 件
== 同じ冪等性キーで再試行
12:17:13.168 shipping_api method=POST path=/shipments status=- duration_ms=1002.1 error=Net::ReadTimeout
12:17:13.168 retry attempt=1 error=ShippingClient::Unavailable wait=1.42
12:17:14.591 shipping_api method=POST path=/shipments status=201 duration_ms=1.8 upstream_request_id=c85f27fd
結果: ["201", "true", {"id" => 8, "order_id" => 8}] / 登録された配送: 1 件
`}
          />
          <Figure n={figureNumber(101, 7)} title="冪等性キーの有無と、相手に登録された件数" caption="偽の API は Idempotency-Key ヘッダーの値ごとに最初の結果を保存し、同じキーの要求には保存した結果を返します。配送の番号は偽の API が付けた通し番号です。">
            <IdempotencyFigure />
          </Figure>
          <p>
            冪等性キーがない場合、クライアントから見れば3回とも失敗でしたが、相手には配送が3件登録されました。同じキーを付けた場合は、2回目の要求に対して相手が保存済みの結果を返し、登録は1件でした。<Term en="idempotency key">冪等性キー</Term>は、同じ操作を送り直していることを相手に伝えるための、クライアントが決める一意な値です。注文の番号と操作の種類から作る（<code>order-7-shipment</code>）か、最初の試行の前に UUID を作って保存し、送り直すときも同じ値を使います。HTTP のヘッダー名は IETF で標準化の作業中で、名前と動作は API ごとの仕様を確認します
            <Ref n={13} />。
          </p>
          <p>
            API が冪等性キーに対応していない場合は、相手側で操作の結果を検索できるかを確認します。たとえば注文番号で配送を検索できるなら、送り直す前に登録済みかを調べられます。どちらもできない場合は、POST を自動では送り直さず、結果が分からない状態として記録し、運用で照合します。冪等性キーを受け取る側（自社の API）の設計は <ChapterLink n={52} />、待ち時間を延ばしながら再試行する仕組みは <ChapterLink n={54} />で詳しく扱います。
          </p>
        </>
      ),
    },
    {
      id: 'faraday',
      title: 'Faraday で同じ設定を書く',
      body: (
        <>
          <p>
            Faraday は HTTP クライアントのライブラリで、実際の通信は <code>Net::HTTP</code> などのアダプターに任せ、その前後に<Term en="middleware">ミドルウェア</Term>（要求と応答に共通の処理を挟む部品）を重ねる作りです
            <Ref n={5} />。再試行は faraday-retry、JSON の変換や例外への変換は Faraday 本体のミドルウェアで書けます。Gemfile に <code>faraday</code> と <code>faraday-retry</code> を加えて使います。
          </p>
          <Code
            lang="ruby"
            title="Faraday の接続の設定（faraday 2.15.1、faraday-retry 2.4.0）"
            code={`
conn = Faraday.new(url: "http://ag-101-fake:9292",
                   request: { open_timeout: 2, read_timeout: 3, write_timeout: 3 }) do |f|
  f.response :raise_error # 再試行を終えた後の応答を例外にする（retry より先に書く）
  f.request :retry, max: 3, interval: 0.5, backoff_factor: 2, interval_randomness: 0.5,
                    max_interval: 5, retry_statuses: [429, 503],
                    retry_block: ->(env:, options:, retry_count:, exception:, will_retry_in:) {
                      Rails.logger.info("retry #{env.url.request_uri} #{env.status || exception.class} in #{will_retry_in}")
                    }
end
conn.get("/limited", key: "faraday2")
`}
          />
          <Code
            lang="text"
            title="実行結果（左の秒数は、最初の要求を送ってからの経過時間）"
            code={`
 0.01 秒  GET /limited?key=faraday2 が 429 → 2.0 秒後に再試行（1 回目）
 2.01 秒  GET /limited?key=faraday2 が 429 → 2.0 秒後に再試行（2 回目）
 4.01 秒  結果 200
 4.02 秒  GET /flaky?key=faraday2 が 503 → 0.51 秒後に再試行（1 回目）
 4.53 秒  GET /flaky?key=faraday2 が 503 → 1.04 秒後に再試行（2 回目）
 5.57 秒  結果 200
 8.59 秒  GET /slow?key=faraday2&sec=5 が Faraday::TimeoutError → 0.67 秒後に再試行（1 回目）
12.26 秒  GET /slow?key=faraday2&sec=5 が Faraday::TimeoutError → 1.21 秒後に再試行（2 回目）
16.47 秒  GET /slow?key=faraday2&sec=5 が Faraday::TimeoutError → 2.08 秒後に再試行（3 回目）
21.56 秒  Faraday::TimeoutError
24.56 秒  POST: Faraday::TimeoutError（POST は再試行しない）
24.56 秒  Faraday::ServerError: 500
`}
          />
          <p>
            faraday-retry は 429 の <code>Retry-After</code> を読み、計算した待ち時間（0.5 秒、1 秒…）より長ければそちらを使いました。<code>retry_statuses</code> に入れていない 500 は送り直さず、<code>raise_error</code> が <code>Faraday::ServerError</code> にしています。既定で送り直すメソッドは GET・HEAD・PUT・DELETE・OPTIONS で、POST は送り直しませんでした
            <Ref n={6} />。
          </p>
          <p>
            注目したいのは <code>/slow</code> の行です。左の秒数は最初の要求からの経過時間で、<code>/slow</code> への要求は 5.57 秒の時点で始まりました。<code>read_timeout</code> は 3 秒ですが、最初の試行と3回の再試行で4回待ち、間の待ち時間も加わって、例外になるまで約 16 秒（21.56 − 5.57）かかりました。画面の要求の中でこの設定を使うと、利用者は 15 秒以上待ちます。タイムアウトと再試行の回数は、掛け合わせた最悪の時間で決めます。
          </p>
          <p>
            相手に接続できない場合は結果が変わります。同じ設定の Faraday で、応答しない IP アドレスに GET を送ると、2.00 秒で <code>Faraday::ConnectionFailed</code> が上がり、再試行しませんでした。faraday-net_http は <code>Net::OpenTimeout</code> を <code>Faraday::ConnectionFailed</code> に変えます（<code>net_http.rb</code> の 44 行目と 81〜84 行目）
            <Ref n={7} />。faraday-retry が既定で再試行する例外（<code>middleware.rb</code> の 22 行目の <code>DEFAULT_EXCEPTIONS</code>）には、このクラスが入っていません
            <Ref n={16} />。<code>exceptions:</code> に <code>Faraday::ConnectionFailed</code> を足すと、4回試して 11.98 秒かかりました。
          </p>
          <Code
            lang="text"
            title="1件の要求ごとに、例外になるまでの時間を測り直した結果（Faraday の設定は上と同じ）"
            code={`
GET /slow（read_timeout 3、max 3）           16.16 秒  Faraday::TimeoutError（偽の API の記録は4回）
応答しない IP（open_timeout 2、max 3）         2.00 秒  Faraday::ConnectionFailed（再試行なし）
応答しない IP（ConnectionFailed を足す）      11.98 秒  Faraday::ConnectionFailed（4回試した）
`}
          />
          <p>
            図 {figureNumber(101, 8)} で、タイムアウトと再試行の回数、最初の待ち時間を変えると、利用者が待つ最悪の時間と、相手のサーバーが受け取る要求の回数が変わります。応答が来ない場合は、再試行のたびに相手に要求が届きます。接続できない場合は、要求は相手に届きません。
          </p>
          <WorstTimeModel />
          <Callout kind="warn" title="ミドルウェアを書く順序">
            <p>
              最初に <code>f.request :retry</code> を書き、その後に <code>f.response :raise_error</code> を書いたところ、429 は再試行されず、1回目で <code>Faraday::TooManyRequestsError</code> が上がりました。Faraday では先に書いたミドルウェアほど外側になります。内側の <code>raise_error</code> が先に 429 を例外にしたので、外側の retry は応答のステータスを見られず、その例外は既定で再試行する例外（<code>Faraday::TimeoutError</code> や <code>Faraday::RetriableResponse</code> など）にも含まれていなかったからです
              <Ref n={6} />。
            </p>
          </Callout>
          <p>
            <code>Net::HTTP</code> と Faraday のどちらを使うかは、必要な機能と依存の量で決めます。呼ぶ API が1つで、この章のクライアントのように分類と再試行を自分で書けるなら、標準ライブラリだけで足ります。複数の API を呼び、JSON の変換、再試行、ログ、計測を共通にしたい場合は、Faraday のミドルウェアで設定をそろえられます。どちらでも、タイムアウトを短くし、再試行を1か所に決める点は同じです。
          </p>
        </>
      ),
    },
    {
      id: 'jobs',
      title: '画面の要求ではなくジョブから呼ぶ',
      body: (
        <>
          <p>
            画面の要求の中で外部 API を呼ぶと、相手の応答を待つ間、その要求を処理している Puma のスレッドが待ち続けます。スレッドの数には上限があるので、相手が遅くなると、外部 API と関係のない画面の要求までスレッドの空きを待つようになります（Puma のスレッドの仕組みは <ChapterLink n={23} section="thread" />）。配送状況のように少し古くてもよい値は、ジョブで定期的に取得して自社のデータベースに保存し、画面はその値と最終取得時刻を表示する方法があります。
          </p>
          <Code
            lang="ruby"
            title="app/jobs/sync_shipment_status_job.rb"
            code={`
class SyncShipmentStatusJob < ApplicationJob
  retry_on ShippingClient::Unavailable, wait: :polynomially_longer, attempts: 5
  rescue_from ShippingClient::RateLimited do |error|
    raise error if executions >= 5
    retry_job wait: (error.retry_after || 60).seconds   # 相手が指定した待ち時間を使う
  end
  discard_on ShippingClient::NotFound

  def perform(shipment_id)
    status = ShippingClient.default.status(shipment_id)
    Shipment.find(shipment_id).update!(status:, status_fetched_at: Time.current)
  end
end
`}
          />
          <p>
            <code>retry_on</code> は指定した例外が起きたとき、待ち時間を決めてジョブを登録し直します。<code>:polynomially_longer</code> の待ち時間は「実行回数の4乗 + 2 秒」に、設定したばらつき（jitter）を加えた値です（Active Job 8.1.4.1 の <code>exceptions.rb</code> の 171〜190 行目）
            <Ref n={9} />。<code>discard_on</code> は指定した例外のときにジョブを捨てます
            <Ref n={8} />。Active Job のテスト用のアダプターで、偽の API に対して実行しました。
          </p>
          <Code
            lang="text"
            title="exp_job.rb の実行結果"
            code={`
== 503 が続く（retry_on Unavailable, polynomially_longer, attempts: 5）
  1 回目: 失敗 → 3.0 秒後に再実行を予約
  2 回目: 失敗 → 18.0 秒後に再実行を予約
  3 回目: 失敗 → 83.0 秒後に再実行を予約
  4 回目: 失敗 → 258.0 秒後に再実行を予約
  5 回目: ShippingClient::Unavailable が上がって終了（キューのアダプターの再試行に任せる）
== 429 と Retry-After: 30
  1 回目: 429 → 30.0 秒後に再実行を予約
== 404（discard_on）
  再登録された件数: 0
`}
          />
          <p>
            3 秒、18 秒、83 秒、258 秒と待ち時間が延び、5 回目の失敗で例外がジョブの外へ上がりました。この実験は Rails アプリの外で Active Job だけを読み込んだので、ばらつきは 0 でした。Rails の新しいアプリの既定の設定では <code>config.active_job.retry_jitter</code> が 0.15 になり、待ち時間に最大 15% のばらつきが加わります。
          </p>
          <p>
            ジョブの外へ上がった例外をどう扱うかは、キューのバックエンドで決まります。Sidekiq は、ジョブから上がった例外を自分の仕組みでも再試行します（<ChapterLink n={18} section="retry" />）。<code>retry_on</code> の5回と Sidekiq の再試行が重なると、相手への要求の回数と期間は想定より大きくなります。どちらで再試行するかを1つに決め、もう一方は止めるか回数を絞ります。401 や想定外の応答は再試行しても直らないので、<code>retry_on</code> に含めず、エラーの通知で運用に知らせます。
          </p>
          <p>
            ジョブで配送の登録（POST）をする場合は、ジョブ自体も2回以上実行されることがあります（<ChapterLink n={18} section="idempotency" />）。冪等性キーはジョブの再実行でも変わらない値（注文の番号など）から作るか、最初の実行の前にデータベースに保存しておきます。ジョブの中で毎回 <code>SecureRandom.uuid</code> を作ると、再実行のたびに別のキーになり、二重の登録を防げません。
          </p>
        </>
      ),
    },
    {
      id: 'secrets-logs',
      title: 'API キーの置き場所とログに残す項目',
      body: (
        <>
          <p>
            配送業者が発行した API キーは、コードやリポジトリに書かず、Rails の credentials に置きます。credentials は暗号化したファイル（<code>config/credentials.yml.enc</code>）と、それを復号する鍵（<code>config/master.key</code> や環境変数 <code>RAILS_MASTER_KEY</code>）の組で、<code>bin/rails credentials:edit</code> で編集します
            <Ref n={12} />。仕組みと環境ごとの分け方は <ChapterLink n={99} section="credentials" />で扱いました。
          </p>
          <Code
            lang="yaml"
            title="bin/rails credentials:edit で追加する内容"
            code={`
shipping:
  endpoint: https://api.delivery.example.com
  api_token: （配送業者が発行した値）
`}
          />
          <Code
            lang="ruby"
            title="ShippingClient.default（クライアントを作る場所を1つにする）"
            code={`
class ShippingClient
  def self.default
    creds = Rails.application.credentials.shipping or raise "credentials に shipping がありません"
    new(endpoint: creds.fetch(:endpoint), token: creds.fetch(:api_token))
  end
end
`}
          />
          <p>
            クライアントを作る場所を1つにすると、キーを読む場所も1つになり、キーを交換するときに探す範囲が限られます。キーがない環境では起動時や最初の呼び出しで例外になるので、設定漏れに気付けます。
          </p>
          <h3>ログに残す項目と残さない項目</h3>
          <p>
            外部 API の調査では、いつ、どの操作で、どれだけ時間がかかり、何が返ったかが必要です。この章のクライアントは要求ごとに <code>request.shipping_client</code> の通知を出すので、購読する側で1行のログにしました。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/shipping_client_log.rb の例"
            code={`
ActiveSupport::Notifications.subscribe("request.shipping_client") do |event|
  p = event.payload
  Rails.logger.info("shipping_api method=#{p[:method]} host=#{p[:host]} path=#{p[:path]} " \\
                    "status=#{p[:status] || '-'} duration_ms=#{event.duration.round(1)} " \\
                    "upstream_request_id=#{p[:upstream_request_id] || '-'} error=#{p[:exception]&.first || '-'}")
end
`}
          />
          <Code
            lang="text"
            title="記録されたログ（冪等性キーの実験から）"
            code={`
12:17:13.168 shipping_api method=POST host=ag-101-fake path=/shipments status=- duration_ms=1002.1 upstream_request_id=- error=Net::ReadTimeout
12:17:14.591 shipping_api method=POST host=ag-101-fake path=/shipments status=201 duration_ms=1.8 upstream_request_id=c85f27fd error=-
`}
          />
          <p>
            例外が起きると、<code>ActiveSupport::Notifications</code> は payload の <code>:exception</code> に例外のクラス名とメッセージを入れます
            <Ref n={10} />。ステータスがない失敗（status=-）と、相手が返した失敗を同じ行の形で区別できます。<code>upstream_request_id</code> は相手が応答に付けた識別子で、配送業者に問い合わせるときに使えます。
          </p>
          <p>
            残さないものは、<code>Authorization</code> ヘッダー、API キー、要求と応答の本文全体です。本文には利用者の住所や氏名が入ることがあります。Rails の <code>config.filter_parameters</code> は、Rails がログに出すリクエストのパラメーターなどを伏せる設定で、アプリが自分で組み立てたログの文字列には適用されません。クエリ文字列にキーを入れる API では、URL 全体ではなくパスだけを記録します。
          </p>
        </>
      ),
    },
    {
      id: 'tests',
      title: 'テストで相手の応答を制御する',
      body: (
        <>
          <p>
            テストのたびに実際の配送業者 API を呼ぶと、結果が相手の状態やネットワークに左右されます。テストでは相手の応答を固定し、成功・失敗・タイムアウトのそれぞれでアプリが正しく振る舞うかを確かめます。差し替える位置は2つあります。HTTP の層で差し替えると、クライアントの URL の組み立て、ヘッダー、応答の分類まで検証できます。クライアントのメソッドを差し替えると、それを使うジョブや画面の分岐を検証できます。
          </p>
          <h3>WebMock で HTTP の応答を固定する</h3>
          <p>
            WebMock は <code>Net::HTTP</code> などの通信を横取りし、<code>stub_request</code> で登録した応答を返すライブラリです。登録していない通信は例外にします
            <Ref n={11} />。
          </p>
          <p>
            次のテストは RSpec で書いています。<code>RSpec.describe ShippingClient do … end</code> がテストのまとまりで、その中の <code>it "…" do … end</code> が1つの例（確かめる内容）です。<code>let(:client) &#123; … &#125;</code> は、例の中で <code>client</code> を最初に参照したときにブロックを実行し、同じ例の中では同じ値を返すメソッドを定義します。例が変わると作り直します
            <Ref n={18} />。<code>described_class</code> は <code>describe</code> に渡したクラス（ここでは ShippingClient）を返します
            <Ref n={17} />。<code>expect(値).to eq(期待値)</code> は値が等しいことを、<code>expect &#123; 処理 &#125;.to raise_error(クラス)</code> は処理がその例外を起こすことを確かめます。後のジョブのテストにある <code>before &#123; … &#125;</code> は、各例の前に実行する準備です。RSpec の書き方と実行の方法は <ChapterLink n={20} section="first-spec" /> で詳しく扱います。
          </p>
          <Code
            lang="ruby"
            title="spec/clients/shipping_client_spec.rb"
            code={`
require "webmock/rspec"

RSpec.describe ShippingClient do
  let(:client) { described_class.new(endpoint: "https://delivery.example.test", token: "test-token") }
  let(:json) { { "Content-Type" => "application/json" } }

  it "200 の応答から配送状況を返す" do
    stub = stub_request(:get, "https://delivery.example.test/shipments?id=42")
      .with(headers: { "Authorization" => "Bearer test-token", "Accept" => "application/json" })
      .to_return(status: 200, body: '{"status":"in_transit"}', headers: json)

    expect(client.status(42)).to eq("in_transit")
    expect(stub).to have_been_requested.once
  end

  it "429 を RateLimited にして Retry-After の秒数を渡す" do
    stub_request(:get, %r{/shipments}).to_return(status: 429, headers: { "Retry-After" => "120" })

    expect { client.status(42) }.to raise_error(ShippingClient::RateLimited) { |e| expect(e.retry_after).to eq(120) }
  end

  it "読み込みのタイムアウトを Unavailable にする" do
    stub_request(:get, %r{/shipments}).to_raise(Net::ReadTimeout)

    expect { client.status(42) }.to raise_error(ShippingClient::Unavailable, /ReadTimeout/)
  end

  it "500 は Unavailable にして、クライアント自身は送り直さない" do
    stub = stub_request(:get, %r{/shipments}).to_return(status: 500)

    expect { client.status(42) }.to raise_error(ShippingClient::Unavailable)
    expect(stub).to have_been_requested.once
  end

  it "登録の要求に冪等性キーを付ける" do
    stub_request(:post, "https://delivery.example.test/shipments")
      .with(headers: { "Idempotency-Key" => "order-7-shipment" }, body: { order_id: 7 }.to_json)
      .to_return(status: 201, body: '{"id":1}', headers: json)

    expect(client.create_shipment(order_id: 7, idempotency_key: "order-7-shipment")).to eq("id" => 1)
  end

  it "スタブしていない通信は WebMock が止める" do
    expect { client.status(1) }.to raise_error(WebMock::NetConnectNotAllowedError)
  end
end
`}
          />
          <p>
            「500 は1回だけ」の例は、クライアントが <code>max_retries = 0</code> で自動の送り直しを止めていることを確かめています。この設定を消すと、GET の読み込みのタイムアウトで要求が2回になる動作が戻るので、<code>to_raise(Net::ReadTimeout)</code> の例でも回数を確かめると変更に気付けます。
          </p>
          <h3>instance_double でジョブからクライアントを差し替える</h3>
          <p>
            ジョブのテストでは、HTTP の内容はクライアントのテストに任せ、クライアントが返す結果や例外ごとにジョブがどう動くかを確かめます。RSpec の <code>instance_double(ShippingClient)</code> は、実際のクラスにないメソッドをスタブしようとすると失敗する<Term en="verifying double">検証付きのテストダブル</Term>です
            <Ref n={15} />。ここではジョブがクライアントを <code>class_attribute :client</code> から受け取るようにして差し替えました。
          </p>
          <Code
            lang="ruby"
            title="spec/jobs/sync_shipment_status_job_spec.rb（抜粋）"
            code={`
RSpec.describe SyncShipmentStatusJob do
  let(:client) { instance_double(ShippingClient) }
  let(:enqueued) { ActiveJob::Base.queue_adapter.enqueued_jobs }
  before do
    enqueued.clear
    described_class.client = client
  end

  it "相手が一時的に使えないときは再実行を予約する" do
    allow(client).to receive(:status).and_raise(ShippingClient::Unavailable, "HTTP 503")

    described_class.perform_now("42")
    expect(enqueued.size).to eq(1)
  end

  it "配送が存在しないときは再実行しない" do
    allow(client).to receive(:status).and_raise(ShippingClient::NotFound, "HTTP 404")

    described_class.perform_now("42")
    expect(enqueued).to be_empty
  end

  it "存在しないメソッドをスタブすると instance_double が知らせる" do
    allow(client).to receive(:fetch_status)
  end
end
`}
          />
          <Code
            lang="text"
            title="rspec spec --format documentation の結果"
            code={`
ShippingClient
  200 の応答から配送状況を返す
  429 を RateLimited にして Retry-After の秒数を渡す
  読み込みのタイムアウトを Unavailable にする
  500 は Unavailable にして、クライアント自身は送り直さない
  登録の要求に冪等性キーを付ける
  スタブしていない通信は WebMock が止める

SyncShipmentStatusJob
  相手が一時的に使えないときは再実行を予約する
  配送が存在しないときは再実行しない
  存在しないメソッドをスタブすると instance_double が知らせる (FAILED - 1)

  1) SyncShipmentStatusJob 存在しないメソッドをスタブすると instance_double が知らせる
     Failure/Error: allow(client).to receive(:fetch_status)
       the ShippingClient class does not implement the instance method: fetch_status

9 examples, 1 failure
`}
          />
          <p>
            最後の例はわざと失敗させたものです。クライアントのメソッド名を <code>status</code> から変えたのにジョブのテストのスタブを直し忘れると、<code>double</code> では気付けませんが、<code>instance_double</code> ならこの形で失敗します。Rails アプリでは rspec-rails の <code>have_enqueued_job</code> マッチャーも使えます（<ChapterLink n={20} section="test-doubles" />）。
          </p>
          <p>
            これらのテストで分かるのは、アプリの解釈と要求の組み立てが想定どおりかです。認証設定や実環境の TLS、相手が応答形式を守っているかは、提供元のテスト環境（サンドボックス）に対して少数の連携テストを実行して確認します。テスト環境では配送依頼のような副作用を実データへ起こさない設定を使います。
          </p>
        </>
      ),
    },
    {
      id: 'tradeoffs',
      title: '判断基準とトレードオフ',
      body: (
        <>
          <p>
            この章で決めた値はどれも短すぎても長すぎても問題が出ます。タイムアウトを短くすると、相手が少し遅いだけで失敗が増えます。長くすると、相手が止まったときに利用者とスレッドが長く待ちます。次の表は設計で決める項目と判断の材料をまとめたものです。
          </p>
          <Figure n={figureNumber(101, 9)} title="外部 API の呼び出しで決める項目" caption="値は例です。相手の API の仕様、通常時に相手が応答するまでの時間の分布、画面やジョブの要件から決めます。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>判断の材料</th>
                    <th>この章で確かめたこと</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>open_timeout</td><td>相手までのネットワーク。接続は通常すぐ終わる</td><td>既定は 60 秒。応答しない IP では指定した 2 秒で止まった</td></tr>
                  <tr><td>read_timeout</td><td>通常時に相手が応答するまでの時間の上位（たとえば 99 パーセンタイル）に余裕を足す</td><td>1回の読み込みの上限で、少しずつ届く応答は 5 秒かかっても止まらなかった</td></tr>
                  <tr><td>再試行の回数と待ち時間</td><td>画面なら利用者が待てる時間、ジョブなら許容できる遅れ</td><td>read_timeout 3 秒 × 4 回と待ち時間で約 16 秒かかった</td></tr>
                  <tr><td>再試行する場所</td><td>クライアント、呼び出し側、ジョブ、キューのどこか1か所</td><td>Net::HTTP の既定の送り直しで要求が2回になった</td></tr>
                  <tr><td>POST の送り直し</td><td>相手が冪等性キーに対応しているか、結果を検索できるか</td><td>キーなしで3件、キーありで1件登録された</td></tr>
                  <tr><td>画面で呼ぶかジョブで呼ぶか</td><td>値の新しさの要件、相手の遅さが画面に与える影響</td><td>ジョブの retry_on は 3・18・83・258 秒と待ち時間を延ばした</td></tr>
                  <tr><td>Net::HTTP か Faraday か</td><td>呼ぶ API の数、共通にしたい処理、依存を増やしてよいか</td><td>Faraday はミドルウェアの順序で再試行の動作が変わった</td></tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            判断の順序の一例です。まず、その値が画面の表示に今すぐ必要かを決めます。少し古くてよければジョブで取得し、画面は保存した値を出します。画面で呼ぶ必要があれば、利用者を待たせてよい時間から、タイムアウトと再試行の回数を逆算します。次に、失敗を再試行してよいものとそうでないものに分け、POST には冪等性キーを付けます。最後に、ログで失敗の種類と時間を追えるようにし、テストで各分類を再現します。
          </p>
          <p>
            この章の時間の値は同じマシンの Docker のネットワーク内で測ったものです。実際の外部 API では、TLS の接続、インターネットの経路、相手の負荷が加わり、通常時の応答時間もばらつきます。本番の値はログに残した duration_ms の分布を見てから決め直します。
          </p>
          <p>
            関連する章：ジョブの仕組みと再試行は <ChapterLink n={18} />、冪等性キーの受け取り側の設計は <ChapterLink n={52} />、待ち時間を延ばす再試行の設計は <ChapterLink n={54} />、複数の外部サービスの違いを吸収する設計は <ChapterLink n={42} />、Puma のスレッドと待ちの関係は <ChapterLink n={23} />、テストダブルの使い分けは <ChapterLink n={20} section="test-doubles" />で扱います。
          </p>
        </>
      ),
    },
  ],
  sources: [
    { title: 'Net::HTTP', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Net/HTTP.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: '接続・読み書きの待ち時間、HTTPS、max_retries' },
    { title: 'HTTP Semantics', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110', accessed: '2026-11-27', version: 'RFC 9110', note: 'メソッドの冪等性（9.2.2）、Retry-After（10.2.3）' },
    { title: 'lib/net/http.rb', publisher: 'ruby/net-http（GitHub）', url: 'https://github.com/ruby/net-http/blob/v0.9.1/lib/net/http.rb', accessed: '2026-11-27', version: 'net-http 0.9.1（Ruby 4.0.9 の既定の gem）', note: '既定のタイムアウトと max_retries（1150〜1161 行目）、transport_request の送り直し（2433〜2475 行目）' },
    { title: 'Additional HTTP Status Codes', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc6585', accessed: '2026-11-27', version: 'RFC 6585', note: '429 Too Many Requests と Retry-After' },
    { title: 'Faraday', publisher: 'lostisland', url: 'https://lostisland.github.io/faraday/', accessed: '2026-11-27', version: 'Faraday 2.15', note: '接続の設定、ミドルウェア、アダプター' },
    { title: 'faraday-retry README', publisher: 'lostisland（GitHub）', url: 'https://github.com/lostisland/faraday-retry/blob/v2.4.0/README.md', accessed: '2026-11-27', version: '2.4.0', note: '再試行するメソッドと例外、retry_statuses、Retry-After、raise_error との組み合わせ' },
    { title: 'lib/faraday/adapter/net_http.rb', publisher: 'lostisland/faraday-net_http（GitHub）', url: 'https://github.com/lostisland/faraday-net_http/blob/v3.5.0/lib/faraday/adapter/net_http.rb', accessed: '2026-11-27', version: '3.5.0', note: 'Net::HTTP の max_retries を 0 にすること（195 行目）' },
    { title: 'Active Job Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_job_basics.html', accessed: '2026-11-27', version: 'Rails 8.1', note: 'retry_on と discard_on' },
    { title: 'activejob/lib/active_job/exceptions.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v8.1.4.1/activejob/lib/active_job/exceptions.rb', accessed: '2026-11-27', version: '8.1.4.1', note: 'retry_on（64〜80 行目）と polynomially_longer の待ち時間（171〜190 行目）' },
    { title: 'Active Support Instrumentation', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_support_instrumentation.html', accessed: '2026-11-27', version: 'Rails 8.1', note: '独自の通知と、例外が起きたときの payload の :exception' },
    { title: 'WebMock README', publisher: 'bblimke/webmock（GitHub）', url: 'https://github.com/bblimke/webmock/blob/v3.42.0/README.md', accessed: '2026-11-27', version: '3.42.0', note: 'stub_request、to_raise、have_been_requested、実際の通信の禁止' },
    { title: 'Securing Rails Applications: Custom Credentials', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/security.html#custom-credentials', accessed: '2026-11-27', version: 'Rails 8.1', note: 'credentials の編集と読み出し' },
    { title: 'The Idempotency-Key HTTP Header Field', publisher: 'IETF HTTPAPI Working Group', url: 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/', accessed: '2026-11-27', version: 'Internet-Draft', note: '冪等性キーのヘッダー（標準化の作業中）' },
    { title: 'Rack SPEC', publisher: 'rack/rack（GitHub）', url: 'https://github.com/rack/rack/blob/v3.2.8/SPEC.rdoc', accessed: '2026-11-27', version: 'Rack 3.2.8', note: 'call(env) が返すステータス・ヘッダー・本文' },
    { title: 'Verifying Doubles: Using an instance double', publisher: 'RSpec', url: 'https://rspec.info/features/3-13/rspec-mocks/verifying-doubles/instance-doubles/', accessed: '2026-11-27', version: 'rspec-mocks 3.13', note: '実在しないメソッドのスタブを失敗にする' },
    { title: 'lib/faraday/retry/middleware.rb', publisher: 'lostisland/faraday-retry（GitHub）', url: 'https://github.com/lostisland/faraday-retry/blob/v2.4.0/lib/faraday/retry/middleware.rb', accessed: '2026-11-27', version: '2.4.0', note: '既定で再試行する例外 DEFAULT_EXCEPTIONS（22 行目）、待ち時間の式 calculate_retry_interval（232〜241 行目）' },
    { title: 'lib/rspec/core/example_group.rb', publisher: 'rspec/rspec（GitHub）', url: 'https://github.com/rspec/rspec/blob/rspec-core-v3.13.7/rspec-core/lib/rspec/core/example_group.rb', accessed: '2026-11-27', version: 'rspec-core 3.13.7', note: 'described_class が describe に渡したクラスを返すこと（90〜101 行目）' },
    { title: 'lib/rspec/core/memoized_helpers.rb', publisher: 'rspec/rspec（GitHub）', url: 'https://github.com/rspec/rspec/blob/rspec-core-v3.13.7/rspec-core/lib/rspec/core/memoized_helpers.rb', accessed: '2026-11-27', version: 'rspec-core 3.13.7', note: 'let の値を最初の呼び出しの後に保存し、例ごとに作り直すこと（275〜306 行目）' },
  ],
}

export default chapter
