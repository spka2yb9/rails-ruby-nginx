import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 107-1 待ち時間のグラフ（固定・指数バックオフ・Full Jitter） ---------- */
const CAP = 32
const NS = [1, 2, 3, 4, 5, 6, 7, 8]
const expo = (n: number) => Math.min(CAP, 2 ** (n - 1)) // base 1秒
// Full Jitter の乱数の例（3つの利用元）。描くたびに変わらないよう固定する
const SAMPLES = [
  [0.62, 0.18, 0.91, 0.35, 0.77, 0.08, 0.54, 0.83],
  [0.27, 0.85, 0.41, 0.69, 0.12, 0.58, 0.95, 0.31],
  [0.93, 0.47, 0.06, 0.88, 0.49, 0.73, 0.22, 0.64],
]

function BackoffGraphFigure() {
  const L = 70
  const R = 740
  const TOP = 40
  const BOTTOM = 320
  const x = (n: number) => L + 40 + (n - 1) * 86
  const y = (s: number) => BOTTOM - (s / 36) * (BOTTOM - TOP)
  const legend = [
    { key: 'fixed', text: '固定の間隔（毎回1秒）' },
    { key: 'expo', text: '指数バックオフ（1秒 × 2^(n−1)、上限32秒）' },
    { key: 'range', text: 'Full Jitter で待つ時間の範囲（0 から指数バックオフの値まで）' },
    { key: 'dot', text: 'Full Jitter で実際に待った時間の例（3つの利用元）' },
  ]
  return (
    <Svg
      id="107-1"
      w={760}
      h={370}
      label="横軸は何回目の再試行か（1から8）、縦軸は待ち時間（秒）。固定の間隔は毎回1秒。指数バックオフは1、2、4、8、16秒と倍になり、6回目からは上限の32秒で止まる。Full Jitter は0秒から指数バックオフの値までの範囲の乱数で待つので、3つの利用元の待ち時間は範囲の中でばらばらになる"
    >
      <line x1={L} y1={TOP - 10} x2={L} y2={BOTTOM} stroke="var(--fig-line)" />
      <line x1={L} y1={BOTTOM} x2={R} y2={BOTTOM} stroke="var(--fig-line)" />
      {[0, 8, 16, 24, 32].map((s) => (
        <g key={s}>
          <line x1={L} y1={y(s)} x2={R} y2={y(s)} stroke="var(--fig-line)" strokeOpacity={0.15} />
          <T x={L - 8} y={y(s)} anchor="end" fs={12}>
            {s}
          </T>
        </g>
      ))}
      <T x={L - 40} y={16} fs={12}>
        待ち時間（秒）
      </T>
      {NS.map((n) => (
        <T key={n} x={x(n)} y={BOTTOM + 16} anchor="middle" fs={12}>
          {n}
        </T>
      ))}
      <T x={(L + R) / 2} y={BOTTOM + 40} anchor="middle" fs={12}>
        何回目の再試行か（n）
      </T>
      {NS.map((n) => (
        <rect key={n} x={x(n) - 15} y={y(expo(n))} width={30} height={y(0) - y(expo(n))} fill="var(--fig-box3)" stroke="var(--fig-accent)" strokeOpacity={0.35} />
      ))}
      <line x1={L} y1={y(CAP)} x2={R} y2={y(CAP)} stroke="var(--fig-danger)" strokeDasharray="5 4" />
      <T x={R} y={y(CAP) - 12} anchor="end" fs={12} tone="danger">
        上限（cap）32秒
      </T>
      <polyline points={NS.map((n) => `${x(n)},${y(expo(n))}`).join(' ')} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      {NS.map((n) => (
        <circle key={n} cx={x(n)} cy={y(expo(n))} r={4.5} fill="var(--fig-accent)" />
      ))}
      <polyline points={NS.map((n) => `${x(n)},${y(1)}`).join(' ')} fill="none" stroke="var(--fig-muted)" strokeWidth={2} />
      {NS.map((n) => (
        <rect key={n} x={x(n) - 4} y={y(1) - 4} width={8} height={8} fill="var(--fig-muted)" />
      ))}
      {SAMPLES.map((rs, i) => NS.map((n) => <circle key={`${i}-${n}`} cx={x(n) + (i - 1) * 8} cy={y(rs[n - 1] * expo(n))} r={3} fill="var(--fig-text)" />))}
      {legend.map((item, i) => {
        const ly = TOP + 52 + i * 24
        return (
          <g key={item.key}>
            {item.key === 'fixed' && <rect x={92} y={ly - 4} width={8} height={8} fill="var(--fig-muted)" />}
            {item.key === 'expo' && <circle cx={96} cy={ly} r={4.5} fill="var(--fig-accent)" />}
            {item.key === 'range' && <rect x={88} y={ly - 7} width={16} height={14} fill="var(--fig-box3)" stroke="var(--fig-accent)" strokeOpacity={0.35} />}
            {item.key === 'dot' && <circle cx={96} cy={ly} r={3} fill="var(--fig-text)" />}
            <T x={112} y={ly} fs={12}>
              {item.text}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 107-2 多数の利用元の再試行が同じ時刻に集中する様子 ---------- */
// 決まった種から乱数を作る（描くたびに同じ結果にする）
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CLIENTS = 100
const RETRIES = 4
const BIN = 0.5
const SPAN = 16

/** 100の利用元が時刻0に失敗し、それぞれ4回再試行したときの、0.5秒ごとの再試行の数 */
function retryHistogram(jitter: boolean): number[] {
  const random = seeded(15)
  const bins = Array.from({ length: SPAN / BIN }, () => 0)
  for (let c = 0; c < CLIENTS; c++) {
    let t = 0
    for (let n = 1; n <= RETRIES; n++) {
      const backoff = 2 ** (n - 1)
      t += jitter ? random() * backoff : backoff
      const i = Math.floor(t / BIN)
      if (i < bins.length) bins[i]++
    }
  }
  return bins
}

function ThunderingHerdFigure() {
  const L = 70
  const R = 740
  const H = 110
  const bw = (R - L) / (SPAN / BIN)
  const panels = [
    { title: 'ジッターなし（指数バックオフだけ）', top: 50, bins: retryHistogram(false), danger: true },
    { title: 'Full Jitter', top: 236, bins: retryHistogram(true), danger: false },
  ]
  const peak = Math.max(...panels[1].bins)
  return (
    <Svg
      id="107-2"
      w={760}
      h={410}
      label={`100の利用元が時刻0に同時に失敗し、それぞれ1、2、4、8秒の指数バックオフで4回再試行する。ジッターがないと、再試行は1、3、7、15秒の時点に100件ずつ同時に届く。Full Jitter では再試行の時刻がばらけ、0.5秒あたりの数は最も多いところでも${peak}件になる`}
    >
      {panels.map((p) => {
        const base = p.top + H
        const yv = (v: number) => base - (v / CLIENTS) * H
        return (
          <g key={p.title}>
            <T x={L} y={p.top - 34} bold fs={13}>
              {p.title}
            </T>
            <line x1={L} y1={p.top} x2={L} y2={base} stroke="var(--fig-line)" />
            <line x1={L} y1={base} x2={R} y2={base} stroke="var(--fig-line)" />
            {[0, 50, 100].map((v) => (
              <g key={v}>
                <line x1={L} y1={yv(v)} x2={R} y2={yv(v)} stroke="var(--fig-line)" strokeOpacity={0.15} />
                <T x={L - 8} y={yv(v)} anchor="end" fs={12}>
                  {v}
                </T>
              </g>
            ))}
            {p.bins.map((c, i) =>
              c === 0 ? null : (
                <rect key={i} x={L + i * bw + 1} y={yv(c)} width={bw - 2} height={base - yv(c)} fill={p.danger ? 'var(--fig-danger)' : 'var(--fig-accent)'} fillOpacity={0.75} />
              ),
            )}
            {p.danger &&
              p.bins.map((c, i) =>
                c >= CLIENTS ? (
                  <T key={i} x={L + i * bw + bw / 2} y={yv(c) - 10} anchor="middle" fs={12} tone="danger">
                    {c}件
                  </T>
                ) : null,
              )}
            {!p.danger && (
              <T x={R} y={p.top + 6} anchor="end" fs={12} tone="acc">
                最も多い0.5秒でも{peak}件
              </T>
            )}
          </g>
        )
      })}
      {[0, 2, 4, 6, 8, 10, 12, 14, 16].map((s) => (
        <T key={s} x={L + (s / BIN) * bw} y={362} anchor="middle" fs={12}>
          {s}
        </T>
      ))}
      <T x={(L + R) / 2} y={388} anchor="middle" fs={12}>
        最初の失敗からの時間（秒）
      </T>
    </Svg>
  )
}

/* ---------- 図 107-3 1回ごとのタイムアウトと全体の期限 ---------- */
function DeadlineFigure() {
  const L = 120
  const PX = 190
  const x = (s: number) => L + s * PX
  const rowY = (i: number) => 44 + i * 56
  const rows = [
    { label: '1回目', start: 0, end: 1, lines: ['1秒でタイムアウト'] },
    { label: '2回目', wait: 0.2, start: 1.2, end: 2.2, lines: ['1秒でタイムアウト'] },
    { label: '3回目', wait: 0.4, start: 2.6, end: 3, lines: ['残り0.4秒', 'で打ち切る'], danger: true },
  ]
  const axisY = rowY(rows.length) + 4
  const ticks = [0, 0.5, 1, 1.5, 2, 2.5, 3]
  return (
    <Svg
      id="107-3"
      w={760}
      h={axisY + 52}
      label="Shipments::FetchStatus の方針で、毎回タイムアウトした場合。1回ごとのタイムアウトは1秒、全体の期限は3秒。1回目は1秒でタイムアウトし、0.2秒待って2回目を送る。2回目も1秒でタイムアウトし、0.4秒待って3回目を送る。3回目を始めた2.6秒の時点で期限まで0.4秒しかないので、3回目は0.4秒で打ち切る"
    >
      {rows.map((r, i) => {
        const y = rowY(i)
        const cy = y + 18
        return (
          <g key={r.label}>
            <T x={20} y={cy} fs={13} bold>
              {r.label}
            </T>
            {r.wait !== undefined && (
              <>
                <Arrow x1={x(r.start - r.wait)} y1={cy} x2={x(r.start)} y2={cy} dashed plain />
                <T x={x(r.start - r.wait) - 6} y={cy} anchor="end" fs={12} tone="muted">
                  {r.wait}秒待つ
                </T>
              </>
            )}
            <Box x={x(r.start)} y={y} w={(r.end - r.start) * PX} h={36} lines={r.lines} fs={r.lines.length > 1 ? 11 : 12} fill={r.danger ? 'box5' : 'box'} accent={r.danger} />
          </g>
        )
      })}
      <line x1={x(3)} y1={22} x2={x(3)} y2={axisY} stroke="var(--fig-danger)" strokeWidth={2} strokeDasharray="5 4" />
      <T x={x(3)} y={12} anchor="end" fs={12} tone="danger">
        全体の期限（3秒）
      </T>
      <line x1={L} y1={axisY} x2={x(3) + 10} y2={axisY} stroke="var(--fig-line)" />
      {ticks.map((s) => (
        <g key={s}>
          <line x1={x(s)} y1={axisY} x2={x(s)} y2={axisY + 4} stroke="var(--fig-line)" />
          <T x={x(s)} y={axisY + 16} anchor="middle" fs={12}>
            {s}
          </T>
        </g>
      ))}
      <T x={(L + x(3)) / 2} y={axisY + 40} anchor="middle" fs={12}>
        最初の試行を始めてからの時間（秒）
      </T>
    </Svg>
  )
}

/* ---------- 図 107-4 多層の再試行で要求の数が掛け算で増える ---------- */
function AmplificationFigure() {
  const xs = [10, 200, 390, 580]
  const W = 150
  const names = ['ブラウザー', 'Rails のアクション', 'CarrierClient', '配送業者 API']
  type Tone = 'danger' | 'acc' | 'muted' | undefined
  const row = (top: number, notes: [string, Tone][], counts: [string, Tone][]) => (
    <g>
      {names.map((name, i) => (
        <Box key={name} x={xs[i]} y={top} w={W} h={46} lines={name} fill={i === 3 ? 'box4' : 'box'} />
      ))}
      {notes.map(([note, tone], i) => (
        <T key={i} x={xs[i] + W / 2} y={top + 64} anchor="middle" fs={12} tone={tone}>
          {note}
        </T>
      ))}
      {counts.map(([count, tone], i) => (
        <g key={i}>
          <Arrow x1={xs[i] + W} y1={top + 23} x2={xs[i + 1] - 2} y2={top + 23} accent={tone === 'acc'} />
          <T x={xs[i] + W + 20} y={top - 10} anchor="middle" fs={12} bold={!!tone} tone={tone}>
            {count}
          </T>
        </g>
      ))}
    </g>
  )
  return (
    <Svg
      id="107-4"
      w={740}
      h={290}
      label="上段：ブラウザーの JavaScript、Rails のアクション（Shipments::FetchStatus）、CarrierClient（faraday-retry）の3つの層が、それぞれ3回まで試す。利用者の1回の操作で、Rails には最大3回、CarrierClient の呼び出しは最大9回、配送業者 API には最大27回の要求が届く。下段：Rails のアクションだけが3回まで試し、ブラウザーはすぐに失敗を表示し、CarrierClient は1回だけ送る。配送業者 API に届く要求は最大3回になる"
    >
      <T x={10} y={16} bold>
        各層が3回まで試す場合
      </T>
      {row(
        46,
        [
          ['JavaScript が3回', 'danger'],
          ['FetchStatus が3回', 'danger'],
          ['faraday-retry が3回', 'danger'],
        ],
        [
          ['最大3回', undefined],
          ['最大9回', undefined],
          ['最大27回', 'danger'],
        ],
      )}
      <T x={730} y={130} anchor="end" fs={12} tone="danger">
        3 × 3 × 3 = 27回
      </T>
      <T x={10} y={168} bold>
        1か所（FetchStatus）だけで再試行する場合
      </T>
      {row(
        198,
        [
          ['すぐに失敗を表示', 'muted'],
          ['FetchStatus が3回', 'acc'],
          ['retries: 0（1回だけ）', 'muted'],
        ],
        [
          ['1回', undefined],
          ['最大3回', 'acc'],
          ['最大3回', 'acc'],
        ],
      )}
    </Svg>
  )
}

/* ---------- 図 107-5 Retry with Backoff の構造 ---------- */
function StructureFigure() {
  return (
    <Svg
      id="107-5"
      w={780}
      h={420}
      label="Shipments::FetchStatus が方針 POLICY を決め、RetryWithBackoff::Retrier を呼ぶ。Retrier は1回の試行として CarrierClient#status を呼び、CarrierClient が配送業者 API に1回だけ問い合わせる。失敗したら Retrier は CarrierClient.classify で失敗を分類し、純粋な関数 RetryWithBackoff.decide に試行の回数・経過時間・乱数を渡して、待つ時間かあきらめる理由を受け取る。待つ処理・乱数・時計はキーワード引数で受け取り、本番では Kernel#sleep・Random・単調な時計を、テストでは FakeTime を渡す。ジョブの経路では、同じ役割を retry_on と faraday-retry が受け持つ"
    >
      <Box x={270} y={14} w={240} h={46} lines={['Shipments::FetchStatus', '方針 POLICY を決めてつなぐ']} fill="box5" fs={12} subTone="muted" />
      <Box x={280} y={100} w={220} h={56} lines={['RetryWithBackoff::Retrier', '試行を繰り返し、待つ']} fs={12} subTone="muted" />
      <Box x={20} y={100} w={200} h={56} lines={['CarrierClient.classify', '失敗を分類する']} fs={12} subTone="muted" />
      <Box x={560} y={100} w={200} h={56} lines={['sleeper・random・clock', 'キーワード引数']} fill="box3" dashed fs={12} subTone="muted" />
      <Box x={110} y={214} w={250} h={56} lines={['RetryWithBackoff.decide', '純粋な関数。待つ時間か、あきらめる理由']} accent fs={12} subTone="muted" />
      <Box x={390} y={214} w={160} h={56} lines={['CarrierClient#status', '1回だけ問い合わせる']} fs={12} subTone="muted" />
      <Box x={570} y={214} w={90} h={44} lines={['Kernel#sleep', 'Random など']} fs={11} mono />
      <Box x={670} y={214} w={90} h={44} lines="FakeTime" fill="box2" fs={12} mono />
      <Box x={390} y={310} w={160} h={44} lines="配送業者 API" fill="box4" />
      <Arrow x1={390} y1={60} x2={390} y2={98} />
      <Arrow x1={280} y1={128} x2={222} y2={128} />
      <Arrow x1={500} y1={128} x2={558} y2={128} />
      <Arrow x1={340} y1={156} x2={260} y2={212} />
      <Arrow x1={440} y1={156} x2={470} y2={212} />
      <T x={462} y={180} fs={12} tone="muted">
        1回の試行（ブロック）
      </T>
      <Arrow x1={615} y1={214} x2={615} y2={158} dashed />
      <Arrow x1={715} y1={214} x2={715} y2={158} dashed />
      <T x={615} y={276} anchor="middle" fs={11} tone="muted">
        本番
      </T>
      <T x={715} y={276} anchor="middle" fs={11} tone="muted">
        テスト
      </T>
      <Arrow x1={470} y1={270} x2={470} y2={308} />
      <Box
        x={20}
        y={370}
        w={740}
        h={40}
        lines="ジョブの経路（FetchShipmentStatusJob）では、Retrier の役割を Active Job の retry_on と faraday-retry が受け持つ"
        fill="bg"
        fs={12}
      />
    </Svg>
  )
}

const chapter: Chapter = {
  number: 54,
  part: 9,
  title: 'Retry with Backoff：配送業者 API の一時的な失敗を再試行する',
  summary:
    '配送業者の API から配送状況を取得する処理を例に、一時的な失敗だけを、待ち時間を延ばしながら決めた回数と期限の範囲でやり直す方法を学びます。待たずに再試行するコードが短時間に多くの要求を送ることを確かめてから、失敗の分類・指数バックオフとジッター・タイムアウトと全体の期限を Rails で実装し、Active Job の retry_on、Sidekiq の再試行、faraday-retry との分担を RSpec で確かめます。',
  goals: [
    '再試行してよい失敗（通信の失敗・タイムアウト・408・429・5xx）と、再試行してはいけない失敗（400・404・プログラムの誤り）を区別できる',
    '冪等でない操作をそのまま再試行すると何が起きるかを説明し、冪等性キーと組み合わせて再試行できる',
    '指数バックオフ・上限・ジッター・Retry-After の待ち時間を計算し、ジッターが必要な理由を説明できる',
    'Net::HTTP と Faraday に1回ごとのタイムアウトを設定し、再試行を含めた全体の期限を設けられる',
    'retry_on・discard_on・Sidekiq の sidekiq_options retry・faraday-retry の役割を分け、層ごとの回数を掛けた要求の数を見積もれる',
    '待つ処理・乱数・時計を差し替えて、実際には待たずに再試行のテストを書ける',
  ],
  prerequisites: [18, 25, 52],
  sections: [
    {
      id: 'scene',
      title: '配送状況の取得が失敗したときに、すぐにやり直すコード',
      body: (
        <>
          <h3>配送状況を配送業者の API から取得する</h3>
          <p>
            通販サイトで商品を発送すると、配送業者から<Term en="tracking number">追跡番号</Term>（荷物ごとに配送業者が付ける番号）を受け取ります。注文の画面には「輸送中」「配達済み」といった配送状況を表示したいので、配送業者が公開している API に追跡番号を付けて問い合わせます。この章の配送業者 API は <code>GET /v1/shipments/追跡番号</code> に <code>{'{"status": "in_transit"}'}</code> のような JSON を返します。
          </p>
          <p>
            画面を開くたびに API を呼ぶと、画面の表示が配送業者 API の速さと調子に左右されます。そこで、まだ配達されていない配送の状況を 10 分ごとにまとめて取得して DB に保存し、画面には保存した値を表示します。まとめて取得する処理は利用者のリクエストとは別に裏で動くジョブで行います（ジョブの書き方は<ChapterLink n={18} section="job-basics" />）。
          </p>
          <p>
            配送業者 API は、混雑すると 503（Service Unavailable）や 429（Too Many Requests）を返し、ときどき応答が数秒遅れます。少し時間を置くと成功することが多いので、失敗したらやり直すコードを書きました。
          </p>
          <h3>最初に書いたコード</h3>
          <Code lang="ruby" title="db/migrate/20261120000001_create_shipments.rb" code={`
class CreateShipments < ActiveRecord::Migration[8.1]
  def change
    create_table :shipments do |t|
      t.string :tracking_number, null: false, index: { unique: true }
      t.string :status                # 配送業者の API が返す配送状況（"in_transit" など）
      t.datetime :status_checked_at   # 最後に取得できた日時
      t.timestamps
    end
  end
end
`} />
          <Code lang="ruby" title="app/models/shipment.rb（パターンを使う前）" code={`
class Shipment < ApplicationRecord
  CARRIER_URL = "https://carrier.example/v1/shipments"

  scope :undelivered, -> { where(status: nil).or(where.not(status: "delivered")) }

  # 配送業者の API から配送状況を取得して保存する。失敗したら、すぐにやり直す（5回まで）
  def refresh_status!
    attempts = 0
    begin
      attempts += 1
      res = Net::HTTP.get_response(URI("#{CARRIER_URL}/#{tracking_number}"))
      raise "HTTP #{res.code}" unless res.is_a?(Net::HTTPSuccess)

      update!(status: JSON.parse(res.body).fetch("status"), status_checked_at: Time.current)
    rescue StandardError
      retry if attempts < 5 # begin の先頭からやり直す
      raise
    end
  end
end
`} />
          <Code lang="ruby" title="app/jobs/refresh_shipment_statuses_job.rb（パターンを使う前）" code={`
# 10分ごとに実行する（定期実行の登録は省略）
class RefreshShipmentStatusesJob < ApplicationJob
  def perform
    Shipment.undelivered.find_each do |shipment|
      shipment.refresh_status!
    rescue StandardError => e
      Rails.logger.warn("配送状況を取得できません #{shipment.tracking_number}: #{e.message}")
    end
  end
end
`} />
          <p>
            <code>rescue</code> の中の <code>retry</code> は <code>begin</code> の先頭から実行し直す Ruby の構文です。Ruby のドキュメントは、<code>retry</code> を書けるのは <code>rescue</code> の中だけで、実行が <code>begin</code> の先頭から再開されるので無限ループを作らないよう注意することと説明しています<Ref n={27} />。このコードは <code>attempts</code> を <code>begin</code> の外で作って中で数え、5 回で止めています。
          </p>
          <h3>動かして確かめる</h3>
          <p>
            HTTP の要求を横取りして決めた応答を返す gem の WebMock を使い、配送業者 API が 503 を返し続ける状態を作りました。未配達の配送を 100 件用意し、ジョブを1回実行して、API に届いた要求の回数を数えています。続けて、配送業者に登録されていない追跡番号（404）と、Net::HTTP の既定のタイムアウトも確かめました。
          </p>
          <Code lang="ruby" title="script/scene.rb（抜粋）" code={`
# bin/rails runner script/scene.rb
require "webmock"
include WebMock::API
WebMock.enable!

Shipment.delete_all
100.times { |i| Shipment.create!(tracking_number: format("TRK%03d", i + 1)) }
clock = -> { Process.clock_gettime(Process::CLOCK_MONOTONIC) }

puts "== 1: 配送業者の API が 503 を返し続ける（未配達の配送は100件）"
sent = []
stub_request(:get, %r{\\Ahttps://carrier\\.example/v1/shipments/}).to_return do
  sent << clock.call
  { status: 503 }
end
started = clock.call
RefreshShipmentStatusesJob.perform_now
elapsed = clock.call - started
puts format("ジョブの実行時間 %.2f 秒、配送業者の API への要求 %d 回（1件あたり %d 回）",
            elapsed, sent.size, sent.size / 100)
puts format("1秒あたりの要求 %d 回", sent.size / elapsed)
# …（省略。2 は 404 を返す。3 は Net::HTTP.new の既定値を表示する）

puts "== 4: 接続は受け付けるが応答しないサーバーに GET を送る（read_timeout だけ 1 秒にした）"
WebMock.allow_net_connect!
server = TCPServer.new("127.0.0.1", 0)
accepted = 0
Thread.new { loop { server.accept.tap { accepted += 1 } } } # 受け付けるだけで、何も返さない
started = clock.call
begin
  Net::HTTP.start("127.0.0.1", server.addr[1], read_timeout: 1) { |h| h.get("/v1/shipments/TRK001") }
rescue => e
  puts format("%s  %.2f 秒、受け付けた接続 %d 回", e.class, clock.call - started, accepted)
end
`} />
          <Code lang="text" title="実行結果（bin/rails runner script/scene.rb。Rails 8.1.4.1・Ruby 4.0.9）" code={`
== 1: 配送業者の API が 503 を返し続ける（未配達の配送は100件）
ジョブの実行時間 0.35 秒、配送業者の API への要求 500 回（1件あたり 5 回）
1秒あたりの要求 1420 回
== 2: 追跡番号が配送業者に登録されていない（404）
RuntimeError: HTTP 404  要求 5 回
== 3: Net::HTTP の既定値
open_timeout=60 read_timeout=60 write_timeout=60 max_retries=1
== 4: 接続は受け付けるが応答しないサーバーに GET を送る（read_timeout だけ 1 秒にした）
Net::ReadTimeout  2.00 秒、受け付けた接続 2 回
`} />
          <p>
            1 では、0.35 秒のジョブの実行で配送業者 API に 500 回の要求が届きました。1秒あたりに直すと 1,420 回です。503 は「今は混んでいて処理できない」という応答なのに、このコードは相手に休む時間を与えず、混雑をさらに悪くしています。同じジョブが 10 分ごとに動き、ほかの通販サイトも同じように再試行していれば、配送業者 API は回復しにくくなります。
          </p>
          <p>
            2 では、何度送っても結果が変わらない 404 にも5回送っています。3 と 4 はタイムアウトの問題です。<code>Net::HTTP.get_response</code> にはタイムアウトを指定する引数がなく、接続・読み込み・書き込みの待ち時間はそれぞれ 60 秒です。さらに <code>max_retries</code> が 1 なので、GET が読み込みのタイムアウトで失敗すると、Net::HTTP 自身がもう一度送ります<Ref n={20} /><Ref n={21} />。4 では読み込みのタイムアウトを1秒にしたのに、接続が2回あり、例外が届くまで 2.00 秒かかりました。既定値のままなら、応答しない配送業者 API に対して1回の <code>get_response</code> が最大 120 秒、5 回の再試行で 600 秒かかります。
          </p>
          <p>このコードには、次の問題があります。</p>
          <ul>
            <li>404 のような再試行しても結果が変わらない失敗と、503 のような一時的な失敗と、プログラムの誤りによる例外を区別せずに再試行している。</li>
            <li>失敗したらすぐに再試行している。429 や 503 に付く Retry-After（次の要求まで待つ時間）も読まない。</li>
            <li>タイムアウトを設定していない。Net::HTTP の中の再試行にも気付いていない。</li>
            <li>再試行の回数と送った要求の回数をだれも把握していない。</li>
            <li>テストで Net::HTTP を差し替えないと試せず、待つ処理を入れるとテストが遅くなる。</li>
          </ul>
          <p>次の節で、これらを直す考え方を整理します。</p>
        </>
      ),
    },
    {
      id: 'idea',
      title: '一時的な失敗だけを、待ち時間を延ばしながら決めた範囲でやり直す',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term en="Retry with Backoff">Retry with Backoff</Term>（待ち時間を延ばしながらの再試行）は、外部のサービスの呼び出しが一時的な理由で失敗したときに、少し待ってから同じ呼び出しをやり直すパターンです。やり直すたびに待ち時間を延ばし、回数と時間に上限を設けます。
          </p>
          <p>
            Microsoft の Azure Architecture Center の Retry パターンは、<Term en="transient fault">一時的な障害</Term>の例として、ネットワークの接続が一瞬失われること、サービスが一時的に使えないこと、サービスが混雑しているときのタイムアウトを挙げ、これらは多くの場合ひとりでに解消し、適切な時間を置いて同じ操作を繰り返せば成功する見込みが高いと説明しています<Ref n={5} />。一方で、再試行は相手のサーバーの負荷を増やします。AWS の Marc Brooker は、再試行はクライアントがサーバーの時間をより多く使って成功の見込みを高める「利己的（selfish）」な行為で、失敗の原因が過負荷なら負荷をさらに増やし、元の問題が解消した後も回復を遅らせることがあると述べています<Ref n={1} />。このパターンの目的は一時的な失敗を利用者に見せずに済ませることと、再試行で相手をさらに悪い状態にしないことの両方です。
          </p>
          <h3>使う場面と、設計上の制約</h3>
          <p>前の節のようなコードを使っているシステムには、次の兆候が現れます。</p>
          <ul>
            <li>「失敗したら決まった秒数だけ待ってやり直す」ループが、外部の API を呼ぶ箇所ごとに書かれている。</li>
            <li>404 のように、何度送っても結果が変わらないエラーも再試行している。</li>
            <li>外部の API に障害が起きると、復旧した直後にアクセスが集中して、また失敗する。</li>
            <li>HTTP クライアントにタイムアウトを設定しておらず、外部の API が応答しないと処理がいつまでも終わらない。</li>
            <li>HTTP クライアントとジョブの両方が再試行していて、障害のときに外部の API へ何回送っているかを誰も把握していない。</li>
            <li>再試行のテストが実際に何秒も待つので、テストを書いていない。</li>
          </ul>
          <p>再試行を設計するときは、次の制約がぶつかります。</p>
          <ul>
            <li>一時的な失敗は利用者に見せたくない。一方で、再試行すると相手の負荷が増え、相手の回復を遅らせることがある。</li>
            <li>早く再試行すれば早く成功する可能性があるが、多くのクライアントが同時に再試行すると、それ自体が負荷の集中になる。</li>
            <li>何度も再試行すれば成功の見込みは上がるが、その分だけ呼び出し元を待たせ、サーバーの資源を使う。呼び出し元には、待てる時間の限度がある。</li>
            <li>失敗の原因はクライアントからは完全にはわからない。タイムアウトした要求を、相手の側では処理し終えていることもある。</li>
            <li>再試行の処理は時間と乱数に依存するので、そのままではテストが遅くなり、結果も毎回変わる。</li>
          </ul>
          <p>これらを踏まえて、「何を再試行するか」「どれだけ待つか」「いつあきらめるか」「どこで再試行するか」の4つを決めます。</p>
          <h3>再試行してよい失敗と、してはいけない失敗</h3>
          <p>
            時間がたてば成功する見込みのある失敗だけを再試行し、何度送っても結果が変わらない失敗はすぐに呼び出し元に返します。次の表の「する」は、何回実行しても1回実行したときと結果が変わらない操作（後で説明する冪等な操作）を前提にしています。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">失敗</th>
                  <th scope="col">再試行</th>
                  <th scope="col">理由</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">応答を受け取れなかった（接続できない、接続が切れた、タイムアウト）</th>
                  <td>する</td>
                  <td>相手が一時的に応答できないだけのことが多い。ただし、相手が処理を終えている可能性がある</td>
                </tr>
                <tr>
                  <th scope="row">408 Request Timeout</th>
                  <td>する</td>
                  <td>サーバーが、待てる時間内に要求を受け取りきれなかった</td>
                </tr>
                <tr>
                  <th scope="row">429 Too Many Requests</th>
                  <td>する（Retry-After に従う）</td>
                  <td>一定の時間内の要求が多すぎる。時間を置けば受け付けられる</td>
                </tr>
                <tr>
                  <th scope="row">500・502・503・504</th>
                  <td>する</td>
                  <td>サーバーの側の一時的な過負荷や保守によるものが多い。ただし、冪等性キーごとに最初の応答を保存して返すサービス（Stripe など）は 500 も保存するので、同じキーで再試行しても同じ 500 が返る</td>
                </tr>
                <tr>
                  <th scope="row">409 Conflict</th>
                  <td>意味による</td>
                  <td>「同じキーの要求を処理中」を表すなら、待ってから同じキーで送り直す。データの変更がぶつかったことを表すなら、自動では再試行しない</td>
                </tr>
                <tr>
                  <th scope="row">400・401・403・404・422</th>
                  <td>しない</td>
                  <td>要求の内容や権限の問題。同じ要求を何度送っても結果は変わらない</td>
                </tr>
                <tr>
                  <th scope="row">プログラムの誤り（応答の形の想定違い、nil の参照など）</th>
                  <td>しない</td>
                  <td>何度実行しても同じところで失敗する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            HTTP の仕様（RFC 9110）は 503 を「一時的な過負荷か保守のために、今は要求を処理できない。時間を置けば解消する見込みが高い」状態と定義し、408 についてはクライアントが要求を繰り返してよい（MAY）としています<Ref n={3} />。429 は RFC 6585 で定義された、一定の時間内に送られた要求が多すぎることを表すステータスです<Ref n={4} />。Google Cloud Storage の再試行の説明も、再試行が役に立つ一時的な問題として 408・429・5xx の応答と、ソケットのタイムアウト・TCP の切断を挙げています<Ref n={7} />。逆に Google の SRE 本は、恒久的なエラーや形式の誤った要求は何度送っても成功しないので再試行してはいけないとし<Ref n={8} />、Azure の Retry Storm の説明も、400 を受け取ったら同じ要求を再試行しても役に立たないと書いています<Ref n={6} />。
          </p>
          <p>
            ただし、この区別は絶対ではありません。Brooker は、書き込みの結果がほかの場所に伝わるまで時間がかかるシステムでは、あるときクライアントのエラーだったものが少し後に成功に変わることがあると指摘しています<Ref n={1} />。出荷を登録した直後は配送業者の側に追跡番号がまだなく、404 が返ることがあります。この章のジョブは配送状況を定期的に取得するので、404 は再試行せずに捨て、次の定期的な取得に任せます。
          </p>
          <p>
            外部のエラーをアプリの言葉に変える処理は、<ChapterLink n={42} />の Adapter で扱いました。失敗の分類も同じクラス（この章では CarrierClient）に置くと、再試行する側は外部の API の細かいエラーコードを知らずに済みます。
          </p>
          <h3>冪等でない操作を再試行する危険</h3>
          <p>
            同じ要求を何回実行しても、1回実行したときと同じ結果になる性質を<Term en="idempotent">冪等</Term>（べきとう）と呼びます。RFC 9110 では GET・HEAD・OPTIONS・TRACE と PUT・DELETE が冪等なメソッドです。冪等なメソッドを区別する理由は、応答を読む前に通信が失敗した場合に、クライアントがその要求を自動で繰り返してよいからだと説明されています。そして、冪等でないメソッドの要求は、実際には冪等だとわかる手段か、元の要求が処理されなかったことを確かめる手段がない限り、自動で再試行すべきではない（SHOULD NOT）としています<Ref n={3} />。
          </p>
          <p>
            たとえば、配送業者に集荷を依頼する <code>POST /v1/pickups</code> がタイムアウトしたとします。配送業者は依頼を受け付けた後で、応答だけが届かなかったのかもしれません。ここで再試行すると、集荷が2回依頼されます。Azure の説明も、サービスが要求の処理に成功したのに応答を送れず、再試行の処理が「最初の要求は届かなかった」と考えて送り直してしまう例を挙げています<Ref n={5} />。冪等でない操作を安全に再試行するには、要求に一意のキーを付け、相手が同じキーの2回目の要求を実行しないようにします。この方法は<ChapterLink n={52} />で扱いました。配送状況の取得は GET なので、何回送っても配送業者の側の状態は変わらず、再試行してかまいません。
          </p>
          <h3>指数バックオフと上限</h3>
          <p>
            失敗したらすぐに、または毎回同じ短い間隔で再試行すると、混雑している相手に負荷を下げる時間を与えません。そこで、再試行のたびに待ち時間を延ばします。<Term en="exponential backoff">指数バックオフ</Term>は、n 回目の再試行の前に「base × 2<sup>n−1</sup>」秒だけ待つ方法です。base が1秒なら、1秒、2秒、4秒、8秒と倍になります。待ち時間が際限なく延びないよう、上限（cap）を設けます。Brooker の記事は上限付きの指数バックオフを <code>sleep = min(cap, base * 2^attempt)</code>（累乗を ^ で書いた）と書いています<Ref n={2} />。この章のコードは n を1から数え、1回目の再試行の前の待ち時間が base になるよう 2<sup>n−1</sup> にしています。
          </p>
          <Figure n="107-1" title="待ち時間のグラフ（固定、指数バックオフ、指数バックオフとジッター）" caption="base を1秒、上限を32秒とした場合。Full Jitter の点は乱数の値を固定して描いた例。">
            <BackoffGraphFigure />
          </Figure>
          <p>
            図 107-1 の青い線が指数バックオフで、6回目で上限の32秒に達し、それ以降は32秒のままです。上限を設けても回数に上限がなければ、すべてのクライアントが32秒ごとに再試行を続けます。Brooker も、上限付きの指数バックオフだけでは全員が上限の間隔で再試行し続けるので、再試行の回数も制限していると述べています<Ref n={1} />。灰色の線は前の節のような固定の間隔で、何回目でも待ち時間が延びません。
          </p>
          <h3>ジッター：再試行の時刻をずらす</h3>
          <p>
            指数バックオフだけでは問題が残ります。配送業者 API が数秒止まり、多くのクライアントが同じ時刻に失敗したとします。全員が同じ計算で待ち時間を決めると、全員が1秒後、3秒後、7秒後と同じ時刻に再試行します（図 107-2 の上段）。Brooker は、バックオフを入れても要求の固まりは残り、どのクライアントも送らない時間ができるだけだと書いています<Ref n={2} />。Google の SRE 本も、待ち時間をランダムに散らさないと、小さなきっかけで再試行が同じ時刻にそろい、それが増幅しうると指摘しています<Ref n={8} />。Azure は、復旧中のサービスに接続の試行が殺到して元の問題を悪化させる状態を「thundering herd」と呼ぶことがあると紹介しています<Ref n={6} />。
          </p>
          <Figure n="107-2" title="多数の利用元の再試行が同じ時刻に集中する様子" caption="100の利用元が時刻0に同時に失敗し、それぞれ base 1秒の指数バックオフで4回再試行した場合（再試行もすべて失敗したとする）。縦軸は0.5秒ごとに届く再試行の数。Full Jitter の乱数は固定の種から作った。">
            <ThunderingHerdFigure />
          </Figure>
          <p>
            これを防ぐのが<Term en="jitter">ジッター</Term>です。待ち時間に乱数を使い、クライアントごとに再試行の時刻をずらします。Brooker の記事はジッターの付け方を3つ比べています<Ref n={2} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">名前</th>
                  <th scope="col">待ち時間（記事の式。累乗は ^ で書いた）</th>
                  <th scope="col">特徴</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Full Jitter</th>
                  <td><code>random_between(0, min(cap, base * 2^attempt))</code></td>
                  <td>0 から指数バックオフの値までの乱数。最も広くばらける</td>
                </tr>
                <tr>
                  <th scope="row">Equal Jitter</th>
                  <td><code>temp = min(cap, base * 2^attempt)</code><br /><code>temp / 2 + random_between(0, temp / 2)</code></td>
                  <td>指数バックオフの値の半分は必ず待ち、残りの半分を乱数にする。ごく短い待ち時間を避けられる</td>
                </tr>
                <tr>
                  <th scope="row">Decorrelated Jitter</th>
                  <td><code>min(cap, random_between(base, sleep * 3))</code></td>
                  <td>回数を使わず、前回の待ち時間（sleep）の3倍までの乱数で決める</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            記事のシミュレーションでは、ジッターのない指数バックオフは、ジッターを付けた方式より仕事量も完了までの時間も多い結果でした。ジッターを付けた方式の中では、Equal Jitter が Full Jitter より少し多くの仕事をし、時間もずっと長くかかりました。Full Jitter と Decorrelated Jitter の差ははっきりしませんでした<Ref n={2} />。この章のコードは計算が単純な Full Jitter を使います。図 107-2 の下段が Full Jitter の場合で、0.5 秒あたりの再試行の数は、最も多いところで 100 件から 67 件に下がります。回数が進むほど待ち時間の範囲が広がるので、再試行はばらけていきます。
          </p>
          <p>
            Brooker は、タイマーや定期的な処理にもジッターを加えることを検討するよう勧め、1分ごとの要求が毎分の最初の数秒に、毎日の処理が0時を過ぎた最初の数秒にそろってしまう例を挙げています<Ref n={1} />。10 分ごとに全件の取得を一斉に始めるこの章のジョブにも、同じ問題があります。
          </p>
          <h3>Retry-After：相手が指定した時間だけ待つ</h3>
          <p>
            サーバーは応答に <code>Retry-After</code> ヘッダーを付けて、次の要求までどれだけ待つべきかを伝えられます。値は日時（<code>Retry-After: Fri, 20 Nov 2026 01:00:30 GMT</code>）か、待つ秒数（<code>Retry-After: 120</code>）のどちらかです<Ref n={3} />。429 の応答にも Retry-After を含めてよいとされています<Ref n={4} />。Azure の Retry Storm の説明は、Retry-After が返ったらその時間が過ぎるまで再試行しないよう勧めています<Ref n={6} />。この章のコードは、Retry-After があれば計算した待ち時間の代わりにその時間だけ待ち、ジッターはかけません。ただし、その時間を待つと全体の期限を過ぎる場合は、待たずにあきらめます。呼び出し元がそれまで待てないなら、待つ意味がないからです。
          </p>
          <h3>1回ごとのタイムアウトと、全体の期限</h3>
          <p>
            <Term en="timeout">タイムアウト</Term>は応答を待つ時間の上限です。Brooker は、リモートの呼び出しにはすべてタイムアウトを設定し、接続のタイムアウトと要求のタイムアウトの両方を設けることを勧めています。値は相手の応答時間の分布から決め、たとえば誤ってタイムアウトとしてよい割合を 0.1% と決めて、相手の応答時間の 99.9 パーセンタイルを使います。短くしすぎると再試行が増えて相手の負荷が上がり、相手が少し遅くなっただけで全部の要求が再試行され始める危険があるとも書いています<Ref n={1} />。ロードバランサー・Nginx・Puma のタイムアウトの関係は<ChapterLink n={25} section="timeouts" />で扱いました。
          </p>
          <p>
            再試行するときは、時間の上限を2つ決めます。1つは<Term>1回ごとのタイムアウト</Term>、もう1つは再試行と待ち時間を含めた<Term en="deadline">全体の期限</Term>です。1回ごとのタイムアウトだけを決めると、合計の時間は全試行のタイムアウトと待ち時間を足したものになり、呼び出し元が待てる時間を超えることがあります。Azure も、要求が有効なのはたいてい限られた時間だけなので、いつまでも再試行しても効果がないとしています<Ref n={6} />。
          </p>
          <Figure n="107-3" title="1回ごとのタイムアウトと、全体の期限" caption="この章の Shipments::FetchStatus の方針（1回ごとのタイムアウト1秒、全体の期限3秒、base 0.25秒の Full Jitter）で、毎回タイムアウトした場合。乱数は0.8とした。">
            <DeadlineFigure />
          </Figure>
          <p>
            図 107-3 では3回目を始めた 2.6 秒の時点で期限まで 0.4 秒しか残っていないので、3回目は1秒ではなく 0.4 秒で打ち切ります。この章のコードは各試行に期限までの残り時間を渡し、1回ごとのタイムアウトと残り時間の短い方を使います。経過時間は時刻の設定の変更に影響されない時計（単調な時計、<code>Process::CLOCK_MONOTONIC</code>）で測ります。
          </p>
          <h3>どこで再試行するか：多層の再試行で要求の数が増える</h3>
          <p>1つの操作が何層もの呼び出しを経由するとき、各層が独立に再試行すると、末端に届く要求の数は各層の回数の掛け算になります。</p>
          <Figure n="107-4" title="多層の再試行で、末端への要求の数が掛け算で増える" caption="模式図。各層の「3回」は、最初の1回を含めた試行の回数。">
            <AmplificationFigure />
          </Figure>
          <p>
            図 107-4 の上段は管理画面の「今すぐ確認」ボタンの JavaScript、Rails のアクション、HTTP クライアントの3つの層がそれぞれ3回まで試す場合です。利用者の1回の操作で、配送業者 API には最大 27 回の要求が届きます。下段は Rails のアクションの1か所だけで再試行する場合で、最大3回に収まります。Brooker は、5段の呼び出しの各層が独立に再試行するとデータベースへの負荷が 243 倍になる例を挙げ、再試行はスタックの1か所で行うよう勧めています<Ref n={1} />。Google の SRE 本も、3つの層がそれぞれ4回試すと1回の操作が 64 回の試行を生みうるとし<Ref n={8} />、要求を拒否した層のすぐ上の層だけで再試行すること、1つの要求あたりの試行を3回まで、1つのクライアントの再試行の割合を 10% 未満に抑える方法（retry budget）を紹介しています<Ref n={9} />。
          </p>
          <p>
            Rails のアプリでは、再試行する層が見えにくい所にもあります。前の節で見た Net::HTTP の <code>max_retries</code>、Faraday の retry ミドルウェア、Active Job の <code>retry_on</code>、Sidekiq 自身の再試行です。Google Cloud Storage の説明も、アプリケーションが3回再試行し、その下のクライアントライブラリも各回で3回再試行すると9回になりうるとして、どちらかの層の再試行を止めるか大きく制限するよう勧めています<Ref n={7} />。AWS の SDK はトークンバケットで再試行の総量を制限しています。再試行の権利（トークン）が残っている間はどの呼び出しも再試行でき、使い切ったら決まった頻度でしか再試行しない仕組みです<Ref n={1} />。
          </p>
          <h3>Circuit Breaker との関係</h3>
          <p>
            再試行は短い失敗を乗り切るための方法です。相手が長く止まっているときに再試行を続けると、負荷をかけるだけになります。このときは、失敗が続いたら呼び出し自体を止める <Term en="Circuit Breaker">Circuit Breaker</Term> を組み合わせます（使い分けは<ChapterLink n={54} section="alternatives" />で扱います）。
          </p>
          <h3>構造</h3>
          <p>この章のコードは次の6つの要素で構成します。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">この章のクラス</th>
                  <th scope="col">責務</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">1回の呼び出し</th>
                  <td><code>CarrierClient#status</code></td>
                  <td>1回ごとのタイムアウトを付けて、外部の API を1回呼ぶ。失敗を例外にする</td>
                </tr>
                <tr>
                  <th scope="row">失敗の分類</th>
                  <td><code>CarrierClient.classify</code></td>
                  <td>例外を「再試行してよいか」と「相手が指定した待ち時間」に分ける</td>
                </tr>
                <tr>
                  <th scope="row">判断（純粋な関数）</th>
                  <td><code>RetryWithBackoff.decide</code>・<code>full_jitter</code></td>
                  <td>試行の回数、経過時間、分類、乱数を受け取り、待つ時間か、あきらめる理由を返す</td>
                </tr>
                <tr>
                  <th scope="row">繰り返す処理</th>
                  <td><code>RetryWithBackoff::Retrier</code></td>
                  <td>呼び出しを実行し、失敗したら判断に従って待ってやり直す。あきらめるときは最後の例外を投げる</td>
                </tr>
                <tr>
                  <th scope="row">待つ処理・乱数・時計</th>
                  <td><code>sleeper</code>・<code>random</code>・<code>clock</code></td>
                  <td>本番では本物を使い、テストでは実際には待たない代役に替える</td>
                </tr>
                <tr>
                  <th scope="row">組み立て</th>
                  <td><code>Shipments::FetchStatus</code></td>
                  <td>回数・待ち時間・期限の方針を決め、上の要素をつなぐ</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Figure n="107-5" title="Retry with Backoff の構造" caption="画面から呼ぶ経路の構成。実線の矢印は呼び出し、破線の矢印はキーワード引数として渡すものを表す。">
            <StructureFigure />
          </Figure>
          <p>
            図 107-5 のように、「次をどうするか」の判断（decide）を、待つ処理から分けた純粋な関数にしています（<ChapterLink n={45} />の分け方）。decide は乱数も引数として受け取るので、同じ入力には必ず同じ結果を返し、表の形のテストで確かめられます。待つ処理・乱数・時計は外から受け取ります（<ChapterLink n={40} />）。テストでは実際には待たずに時計の値を進める代役を渡すので、3秒分の再試行のテストもすぐに終わります。
          </p>
          <p>
            CarrierClient が自分では再試行しない形で使えることにも注目してください。1回の呼び出しと再試行を分けておくと、同じ CarrierClient を、全体の期限が必要な画面からの取得にも、数分かけて再試行してよいジョブにも使えます。どの層で再試行するかを、呼び出す側で決められます。図の下に書いたとおり、ジョブの経路では Retrier の役割を Active Job の <code>retry_on</code> と faraday-retry が受け持ちます。
          </p>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <p>
            配送状況を取得する経路は2つあります。10 分ごとのジョブ（RefreshShipmentStatusesJob → FetchShipmentStatusJob）と、管理画面の「今すぐ確認」から呼ぶ取得（Shipments::FetchStatus）です。ジョブは数分かけて再試行してよいので Active Job の再試行に任せ、画面からの取得は利用者を待たせるので3秒の期限を設けます。
          </p>
          <Code lang="text" code={`
app/
  clients/carrier_client.rb              # 1回の呼び出し・タイムアウト・失敗の分類・faraday-retry
  services/shipments/fetch_status.rb     # 画面から呼ぶ取得。Retrier で全体の期限を守る
  jobs/fetch_shipment_status_job.rb      # 1件の取得。retry_on・discard_on・429
  jobs/refresh_shipment_statuses_job.rb  # 10分ごとの実行。開始の時刻をずらしてジョブを入れる
  jobs/request_pickup_job.rb             # 集荷の依頼（冪等でない POST）
  models/shipment.rb
  models/pickup_request.rb
lib/
  retry_with_backoff.rb                  # Policy・decide・Retrier（Rails に依存しない）
db/migrate/
  20261120000001_create_shipments.rb
  20261120000002_create_pickup_requests.rb
`} />
          <p>
            <code>app/clients</code> のような app の下の新しいディレクトリは、起動時に存在すればオートロードの対象になります。<code>lib/retry_with_backoff.rb</code> は Rails の機能を使わない部品なので lib に置きました。Rails 7.1 から生成されるアプリには <code>config.autoload_lib(ignore: %w[assets tasks])</code> が書かれており、lib の下もオートロードされます。この行がない既存のアプリでは、行を加えるか、ファイルを app の下に置きます。
          </p>
          <h3>1回の呼び出しとタイムアウト：CarrierClient</h3>
          <Code lang="ruby" title="app/clients/carrier_client.rb" code={`
# 配送業者 API のクライアント。retries: 0 なら1回だけ送る
class CarrierClient
  RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504].freeze

  def initialize(base_url: ENV.fetch("CARRIER_API_URL", "https://carrier.example"),
                 timeout: 5, retries: 2, retry_interval: 0.5)
    @timeout = timeout
    @conn = Faraday.new(url: base_url, request: { open_timeout: 2, timeout: }) do |f|
      f.response :raise_error # 外側：再試行を終えた後の 4xx・5xx を例外にする
      if retries.positive?
        f.request :retry,
                  max: retries, # 再試行の回数（最初の1回を含めない）
                  interval: retry_interval, backoff_factor: 2, interval_randomness: 0.5,
                  max_interval: 5, # Retry-After がこれより長ければ、この層では再試行しない
                  retry_statuses: RETRYABLE_STATUSES,
                  exceptions: [*Faraday::Retry::Middleware::DEFAULT_EXCEPTIONS, Faraday::ConnectionFailed]
      end
      f.request :json
      f.response :json
    end
  end

  # 配送状況（"in_transit" など）を返す。remaining は全体の期限までの残り秒数
  def status(tracking_number, remaining: Float::INFINITY)
    timeout = [@timeout, remaining].min
    res = @conn.get("v1/shipments/#{ERB::Util.url_encode(tracking_number)}") do |req|
      req.options.open_timeout = [2, timeout].min
      req.options.timeout = timeout
    end
    res.body.fetch("status")
  end

  # 集荷を依頼する。POST は冪等でないので、冪等性キーを付けて送る
  def request_pickup(pickup_request)
    @conn.post("v1/pickups", { tracking_number: pickup_request.shipment.tracking_number },
               "Idempotency-Key" => pickup_request.idempotency_key)
  end

  # 例外を、再試行してよいかどうかに分ける（RetryWithBackoff::Retrier に渡す）
  def self.classify(error)
    case error
    when Faraday::ConnectionFailed, Faraday::TimeoutError # 応答を受け取れなかった
      RetryWithBackoff::Failure.new(retryable: true)
    when Faraday::Error
      RetryWithBackoff::Failure.new(retryable: RETRYABLE_STATUSES.include?(error.response_status),
                                    retry_after: retry_after(error.response_headers))
    else # プログラムの誤りなどは再試行しない
      RetryWithBackoff::Failure.new(retryable: false)
    end
  end

  # Retry-After の値（秒数か HTTP の日時）を、待つ秒数に直す
  def self.retry_after(headers)
    value = headers&.[]("Retry-After") or return
    return value.to_i if value.match?(/\\A\\d+\\z/)

    [Time.httpdate(value) - Time.now, 0].max
  rescue ArgumentError
    nil
  end
end
`} />
          <p>
            Faraday は Ruby の HTTP クライアントの gem で、送信の前後の処理をミドルウェアの並びで組み立てます（ミドルウェアの並びの考え方は<ChapterLink n={43} />）。<code>request: {'{ open_timeout: 2, timeout: }'}</code> がタイムアウトの設定で、接続に2秒、要求の完了に <code>timeout</code> 秒（既定 5 秒）まで待ちます。Faraday のドキュメントでは、どちらも設定しなければアダプター（実際に通信する部分。既定は Net::HTTP）の既定値が使われます<Ref n={23} />。Net::HTTP のアダプターは <code>timeout</code> を Net::HTTP の <code>read_timeout</code> と <code>write_timeout</code> に、<code>open_timeout</code> を <code>open_timeout</code> に設定し、さらに Net::HTTP の <code>max_retries</code> を 0 にします<Ref n={22} />。
          </p>
          <p>
            <code>status</code> は全体の期限までの残り秒数 <code>remaining</code> を受け取り、1回ごとのタイムアウトと残り時間の短い方をその要求のタイムアウトにします。<code>req.options</code> への設定はその1回の要求だけに適用されます<Ref n={23} />。<code>retries:</code> が 0 なら retry ミドルウェアを入れず、1回だけ送ります。faraday-retry の設定は後で説明します。
          </p>
          <p>Faraday を使わずに Net::HTTP で書く場合は、<code>Net::HTTP.start</code> にタイムアウトと <code>max_retries</code> を渡します。前の節と同じ、応答しないサーバーで確かめました。</p>
          <Code lang="ruby" title="script/net_http_timeout.rb" code={`
# bin/rails runner script/net_http_timeout.rb
# 接続は受け付けるが応答しないサーバーに、Net::HTTP で GET を送る
server = TCPServer.new("127.0.0.1", 0)
accepted = 0
Thread.new { loop { server.accept.tap { accepted += 1 } } }
clock = -> { Process.clock_gettime(Process::CLOCK_MONOTONIC) }

[{ read_timeout: 1 }, { read_timeout: 1, max_retries: 0 }].each do |options|
  accepted = 0
  started = clock.call
  begin
    Net::HTTP.start("127.0.0.1", server.addr[1], open_timeout: 2, **options) { |http| http.get("/v1/shipments/TRK1") }
  rescue Net::ReadTimeout => e
    puts format("%-36s %s  %.2f 秒、接続 %d 回", options.inspect, e.class, clock.call - started, accepted)
  end
end
`} />
          <Code lang="text" title="実行結果（bin/rails runner script/net_http_timeout.rb）" code={`
{read_timeout: 1}                    Net::ReadTimeout  2.01 秒、接続 2 回
{read_timeout: 1, max_retries: 0}    Net::ReadTimeout  1.00 秒、接続 1 回
`} />
          <p>
            <code>max_retries: 0</code> を渡すと、接続は1回で、1秒で例外になりました。Net::HTTP の再試行は、GET・HEAD・PUT・DELETE・OPTIONS・TRACE などの冪等なメソッドが読み込みのタイムアウトや接続の切断で失敗したときに行われます<Ref n={21} />。再試行する層を自分で決めるなら、この再試行は止めておきます。
          </p>
          <p>
            なお、<code>read_timeout</code> は1回の読み込みを待つ時間の上限で、応答全体を受け取るまでの時間の上限ではありません<Ref n={23} />。少しずつデータを返し続ける相手には、全体の期限を別に設けます。
          </p>
          <h3>失敗を分類する</h3>
          <p>
            <code>f.response :raise_error</code> は4xx と 5xx の応答を Faraday の例外にするミドルウェアです。404 は <code>Faraday::ResourceNotFound</code>、429 は <code>Faraday::TooManyRequestsError</code>、5xx は <code>Faraday::ServerError</code> になります。応答を受け取れなかった場合は、接続の失敗が <code>Faraday::ConnectionFailed</code>、タイムアウトが <code>Faraday::TimeoutError</code> になります<Ref n={22} />。<code>Faraday::TimeoutError</code> は <code>Faraday::ServerError</code> の子クラスです。
          </p>
          <p>
            <code>CarrierClient.classify</code> は、これらの例外を Retrier が使う <code>Failure</code> に変えます。応答を受け取れなかった失敗と、408・429・500・502・503・504 を再試行してよい失敗にし、Faraday 以外の例外（プログラムの誤り）は再試行しません。<code>retry_after</code> は Retry-After の値を待つ秒数に直します。秒数の形式はそのまま整数に、日時の形式は現在時刻との差に直します。
          </p>
          <h3>待ち時間と判断を純粋なメソッドにする</h3>
          <Code lang="ruby" title="lib/retry_with_backoff.rb" code={`
# 再試行の方針・判断・繰り返す処理。Rails に依存しないので lib に置く
module RetryWithBackoff
  # max_attempts は最初の1回を含めた回数。base・cap・deadline は秒
  Policy = Data.define(:max_attempts, :base, :cap, :deadline)
  # 失敗の分類。retry_after は相手が Retry-After で指定した秒数
  Failure = Data.define(:retryable, :retry_after) do
    def initialize(retryable:, retry_after: nil) = super
  end
  Wait = Data.define(:delay)    # delay 秒待ってから再試行する
  GiveUp = Data.define(:reason) # あきらめる（:not_retryable・:attempts・:deadline）

  module_function

  # 指数バックオフ：n 回目の再試行（1から数える）の前の待ち時間。base × 2^(n-1) を cap で抑える
  def exponential(n, base:, cap:) = [cap, base * (2**(n - 1))].min

  # Full Jitter：0 から指数バックオフの値までの乱数。r は 0 以上 1 未満
  def full_jitter(n, base:, cap:, r:) = r * exponential(n, base:, cap:)

  # attempt 回目の試行が失敗したときに、次をどうするかを決める。副作用のない関数
  def decide(policy, failure, attempt:, elapsed:, r:)
    return GiveUp.new(:not_retryable) unless failure.retryable
    return GiveUp.new(:attempts) if attempt >= policy.max_attempts

    delay = failure.retry_after || full_jitter(attempt, base: policy.base, cap: policy.cap, r:)
    return GiveUp.new(:deadline) if elapsed + delay >= policy.deadline

    Wait.new(delay)
  end

  class Retrier
    # 経過時間は、時刻の設定の変更に影響されない単調な時計で測る
    MONOTONIC = -> { Process.clock_gettime(Process::CLOCK_MONOTONIC) }

    # classify は例外を Failure に変える。sleeper・random・clock はテストで代役に替える
    def initialize(policy:, classify:, sleeper: Kernel.method(:sleep), random: Random.new, clock: MONOTONIC)
      @policy = policy
      @classify = classify
      @sleeper = sleeper
      @random = random
      @clock = clock
    end

    # ブロックを方針に従って再試行する。ブロックには全体の期限までの残り秒数を渡す
    def call
      started = @clock.call
      attempt = 0
      begin
        attempt += 1
        yield @policy.deadline - (@clock.call - started)
      rescue StandardError => e
        elapsed = @clock.call - started
        case RetryWithBackoff.decide(@policy, @classify.call(e), attempt:, elapsed:, r: @random.rand)
        in Wait(delay:)
          @sleeper.call(delay)
          retry
        in GiveUp
          raise # 最後の例外をそのまま投げる
        end
      end
    end
  end
end
`} />
          <p>
            <code>Data.define</code> は属性を持つ不変の値のクラスを作る Ruby の機能です（<ChapterLink n={46} />）。<code>Policy</code> は方針、<code>Failure</code> は失敗の分類、<code>Wait</code> と <code>GiveUp</code> は判断の結果を表します。<code>decide</code> は再試行してはいけない失敗なら <code>:not_retryable</code>、回数を使い切ったら <code>:attempts</code>、待つと期限を過ぎるなら <code>:deadline</code> であきらめ、それ以外は待つ秒数を返します。Retry-After があればその秒数を使い、ジッターはかけません。
          </p>
          <p>
            Retrier は前の節のコードと同じ <code>begin</code>・<code>rescue</code>・<code>retry</code> を使います。やり直すかどうかは decide の結果で決めます。<code>case ... in Wait(delay:)</code> は、結果が Wait なら、その <code>delay</code> を取り出して変数に入れるパターンマッチです。<code>rescue</code> の中で引数なしの <code>raise</code> を書くと、受け取った例外をそのまま投げ直します。ブロックには期限までの残り秒数を渡すので、呼び出す側は1回ごとのタイムアウトを短くできます。
          </p>
          <h3>画面から呼ぶ取得：Shipments::FetchStatus</h3>
          <Code lang="ruby" title="app/services/shipments/fetch_status.rb" code={`
module Shipments
  # 管理画面の「今すぐ確認」から呼ぶ。利用者を待たせるので、全体で3秒までにする
  class FetchStatus
    POLICY = RetryWithBackoff::Policy.new(max_attempts: 3, base: 0.25, cap: 1, deadline: 3)

    # client は1回だけ送るもの（retries: 0）を使う。deps は Retrier の sleeper・random・clock
    def initialize(client: CarrierClient.new(timeout: 1, retries: 0), **deps)
      @client = client
      @deps = deps
    end

    def call(shipment)
      retrier = RetryWithBackoff::Retrier.new(policy: POLICY, classify: CarrierClient.method(:classify), **@deps)
      status = retrier.call { |remaining| @client.status(shipment.tracking_number, remaining:) }
      shipment.update!(status:, status_checked_at: Time.current)
    end
  end
end
`} />
          <p>
            最初の1回を含めて3回まで、待ち時間は 0.25 秒から倍にして1秒で抑え、全体で3秒までとします。CarrierClient は <code>timeout: 1, retries: 0</code> で作るので、faraday-retry は入りません。ここで <code>CarrierClient.new</code>（既定の <code>retries: 2</code>）を使うと、1回の試行の中で Faraday がさらに3回送り、図 107-4 の上段のように要求の数が掛け算で増えます。コンストラクターの <code>client:</code> と、残りのキーワード引数を受け取る <code>deps</code> は、テストで代役を渡すための引数です。
          </p>
          <p>
            このサービスを呼ぶアクションでは、Faraday の例外を rescue して「配送業者から応答がありません。時間をおいて確かめてください」と表示します。ブラウザーの側では再試行しません。
          </p>
          <h3>ジョブの再試行：retry_on と discard_on</h3>
          <Code lang="ruby" title="app/jobs/fetch_shipment_status_job.rb" code={`
# 1件の配送状況を取得して保存する。数秒で済む再試行は CarrierClient（faraday-retry）に任せる
class FetchShipmentStatusJob < ApplicationJob
  queue_as :default
  # Sidekiq 自身の再試行は使わない。retry_on の回数を使い切ったら、すぐに Dead に入れる
  sidekiq_options retry: 0

  # 通信の失敗・タイムアウト・408・5xx：待ち時間を延ばしながら、最初の実行を含めて5回まで
  # （Faraday::ServerError は 5xx と Faraday::TimeoutError を含む）
  retry_on Faraday::ConnectionFailed, Faraday::RequestTimeoutError, Faraday::ServerError,
           wait: :polynomially_longer, attempts: 5
  # 400・404：何度送っても結果は変わらないので、再試行せずに捨てる
  discard_on Faraday::BadRequestError, Faraday::ResourceNotFound
  # 429：Retry-After の秒数だけ待つ。retry_on の wait には例外が渡らないので rescue_from で書く
  rescue_from Faraday::TooManyRequestsError do |error|
    raise error if executions >= 5

    retry_job wait: (CarrierClient.retry_after(error.response_headers) || 60).seconds, error:
  end

  def perform(shipment)
    status = CarrierClient.new.status(shipment.tracking_number)
    shipment.update!(status:, status_checked_at: Time.current)
  end
end
`} />
          <p>
            <code>retry_on</code> は、指定した例外が起きたら、待ち時間を置いてジョブをもう一度キューに入れる Active Job の機能です。<code>wait</code> の既定は3秒、<code>attempts</code> の既定は5回で、回数には最初の実行を含みます。回数を使い切っても例外が続くと、例外をキューの仕組み（ここでは Sidekiq）に渡します。ブロックを渡すと、例外を渡す代わりにそのブロックを呼びます。<code>discard_on</code> は、指定した例外が起きたら再試行せずにジョブを捨てます。<code>retry_on</code> と <code>discard_on</code> は、下に書いたものから順に探されます<Ref n={11} />。
          </p>
          <p>
            <code>wait: :polynomially_longer</code> は、activejob 8.1.4.1 のソースでは実行の回数（executions）の4乗にジッターを足し、さらに2秒を足した秒数です<Ref n={15} />。1回目の失敗の後は約3秒、2回目の後は約18秒、3回目の後は約83秒、4回目の後は約258秒待ちます。5回目で失敗するまでの待ち時間の合計は、ジッターなしで 362 秒、ジッターが最大なら約 415 秒です。回数の4乗なので、名前のとおり指数ではなく多項式で延びます。ソースのコメントにも、以前は誤って exponential と呼んでいたと書かれています<Ref n={15} />。
          </p>
          <p>
            ジッターの割合は <code>jitter:</code> で指定でき、指定しなければ <code>config.active_job.retry_jitter</code> の値を使います。activejob のクラス属性 <code>retry_jitter</code> の既定は 0.0 で、railties の <code>load_defaults</code> が 6.1 以降なら 0.15 に設定します<Ref n={15} /><Ref n={16} /><Ref n={12} />。<code>config.load_defaults 8.1</code> のこのアプリでは、<code>ActiveJob::Base.retry_jitter</code> は 0.15 でした（後のテストで確かめます）。待ち時間に加わるのは「乱数 × executions<sup>4</sup> × 0.15」なので、Full Jitter と違い、待ち時間の最大 15% だけがばらつきます。
          </p>
          <p>
            429 は <code>retry_on</code> ではなく <code>rescue_from</code> で書いています。<code>wait</code> に渡す Proc はそれまでの実行回数だけを受け取り、例外は受け取らないので、Retry-After の値を待ち時間に使えません<Ref n={11} />。ソースを読むと、Proc の結果にはジッターもかかりません<Ref n={15} />。そこで、例外を受け取れる <code>rescue_from</code> の中で、Retry-After の秒数を <code>retry_job</code> の <code>wait</code> に渡しています。<code>executions</code> はこのジョブを実行した回数で、5 回に達したら例外を投げてあきらめます。
          </p>
          <Callout kind="warn" title="Rails Guides の例の :exponentially_longer">
            <p>
              Rails Guides の Active Job Basics（v8.1）の Solid Queue の節には、<code>wait: :exponentially_longer</code> と書いた例があります<Ref n={13} />。activejob 8.1.4.1 のソースで記号として扱うのは <code>:polynomially_longer</code> だけで、それ以外の記号は <code>Couldn't determine a delay based on :exponentially_longer</code> という RuntimeError になります<Ref n={15} />。待ち時間を計算するのは再試行するときなので、クラスを読み込んだ時点では誤りに気付きません。手元で <code>retry_on RuntimeError, wait: :exponentially_longer</code> のジョブを <code>perform_now</code> すると、クラスの読み込みは成功し、最初の失敗の後でこの RuntimeError になりました。
            </p>
          </Callout>
          <Callout kind="v72">
            <p>
              Rails 7.1 で <code>:exponentially_longer</code> が非推奨になり、同じ式の <code>:polynomially_longer</code> が加わりました。Rails 7.2.0 で <code>:exponentially_longer</code> は削除されたので<Ref n={26} />、Rails 7.2 でも 8.1 と同じく、再試行するときに例外になります。7.0 以前から使っているジョブに <code>:exponentially_longer</code> が残っていないか確かめます。
            </p>
          </Callout>
          <h3>faraday-retry に数秒の再試行を任せる</h3>
          <p>
            CarrierClient の <code>f.request :retry</code> は、faraday-retry という gem のミドルウェアです。README と faraday-retry 2.4.0 のソースで、次のことを確かめました<Ref n={14} /><Ref n={28} />。
          </p>
          <ul>
            <li>既定では2回再試行し、扱う例外はタイムアウトだけ（<code>Errno::ETIMEDOUT</code>・<code>Timeout::Error</code>・<code>Faraday::TimeoutError</code>・<code>Faraday::RetriableResponse</code>）。接続の失敗も再試行するなら <code>exceptions</code> に加える。</li>
            <li>再試行するメソッドは既定で冪等なもの（DELETE・GET・HEAD・OPTIONS・PUT）だけ。POST は再試行しない。</li>
            <li>待ち時間の既定（<code>interval</code>）は 0 秒で、設定しないと待たずに再試行する。</li>
            <li><code>retry_statuses</code> に入れたステータスの応答も再試行する。使い切ると例外を投げずに最後の応答を返す。</li>
            <li>応答に Retry-After があれば、計算した待ち時間より長いときはその秒数だけ待つ。Retry-After が <code>max_interval</code> より長いときは、その層では再試行しない。</li>
            <li><code>interval_randomness</code> は「乱数 × interval_randomness × interval」を足す方式で、ジッターの幅は回数とともに広がらない。</li>
          </ul>
          <p>
            このため、ミドルウェアの順序に意味があります。<code>raise_error</code> を retry の外側に置くと、再試行を終えた後の最後の応答が例外になります。retry より内側に置くと、5xx の応答は例外として retry に届き、<code>retry_statuses</code> ではなく <code>exceptions</code> の設定で判断されます。この CarrierClient は0.5〜0.75 秒、1.0〜1.25 秒待って最大3回送り、Retry-After が5秒以下ならその秒数だけ待ちます。
          </p>
          <p>
            ジョブの経路では、2つの層が再試行します。Faraday は1回のジョブの実行の中で数秒以内の再試行を最大2回行い、ジョブは数秒から数分の間隔で最大5回実行します。配送業者 API が止まっている間、1件の追跡番号について送る要求は最大で 3 × 5 = 15 回です。Faraday の層の待ち時間は短く抑え（<code>max_interval</code> は5秒）、それより長く待つ必要があるときはジョブキューに任せます。<code>sleep</code> で待つ間、ジョブを実行するスレッドは止まり、ほかのジョブを実行できないからです。
          </p>
          <h3>Sidekiq 自身の再試行と二重にしない</h3>
          <p>
            Sidekiq は、ジョブが例外を投げると既定で 25 回、約 20 日かけて再試行し、使い切ったジョブを Dead（手動で再実行するまで置いておく場所）に移します<Ref n={17} />。<code>retry_on</code> の回数を使い切った後も例外は Sidekiq に渡るので、何もしなければ Sidekiq の再試行が続きます（<ChapterLink n={18} section="retry" />）。Sidekiq は Active Job のクラスでも <code>sidekiq_options</code> を書けるようにしています<Ref n={19} />。<code>retry: 0</code> なら再試行せずに Dead へ、<code>retry: false</code> なら Dead にも入れずに捨てます<Ref n={17} /><Ref n={18} />。
          </p>
          <p>実際に Sidekiq（Redis につないだ組み込みモード）で、<code>retry_on</code> の回数を2回にしたジョブを、<code>sidekiq_options</code> を変えて実行しました。</p>
          <Code lang="ruby" title="script/sidekiq_retry.rb（抜粋）" code={`
# RAILS_ENV=development bin/rails runner script/sidekiq_retry.rb
# retry_on の回数を使い切った後に、Sidekiq がジョブをどう扱うかを、sidekiq_options の retry ごとに確かめる
require "sidekiq/api"

EXECUTIONS = Hash.new { |h, k| h[k] = [] }

class DemoJob < ApplicationJob
  retry_on Faraday::ServerError, wait: 1.second, attempts: 2

  def perform
    EXECUTIONS[self.class.name] << executions
    raise Faraday::ServerError, "503"
  end
end

class DefaultRetryJob < DemoJob; end # sidekiq_options を書かない（Sidekiq の既定は25回）

class ZeroRetryJob < DemoJob
  sidekiq_options retry: 0
end

class NoRetryJob < DemoJob
  sidekiq_options retry: false
end

class TwoRetriesJob < DemoJob
  sidekiq_options retry: 2
  sidekiq_retry_in { 1 } # 確かめるために、Sidekiq の再試行の待ち時間を短くする
end

Sidekiq.redis(&:flushdb)
Sidekiq.default_configuration.logger.level = Logger::FATAL
Rails.logger.level = Logger::FATAL
jobs = [DefaultRetryJob, ZeroRetryJob, NoRetryJob, TwoRetriesJob]
jobs.each(&:perform_later)
# …（省略。Sidekiq を60秒動かし、RetrySet と DeadSet を調べて表示する）
`} />
          <Code lang="text" title="実行結果（RAILS_ENV=development bin/rails runner script/sidekiq_retry.rb。Sidekiq 8.1.7・Redis）" code={`
DefaultRetryJob  実行 3 回 executions=[1, 2, 2]      → RetrySet（retry_count=1）
ZeroRetryJob     実行 2 回 executions=[1, 2]         → DeadSet
NoRetryJob       実行 2 回 executions=[1, 2]         → どちらにもない
TwoRetriesJob    実行 4 回 executions=[1, 2, 2, 2]   → DeadSet
`} />
          <p>
            どのジョブも <code>retry_on</code> で2回実行されました。<code>sidekiq_options</code> を書かない DefaultRetryJob は、その後 Sidekiq の再試行に入り、60 秒の間にもう1回実行されて RetrySet に残っています。<code>retry: 0</code> の ZeroRetryJob はすぐに DeadSet に入り、<code>retry: false</code> の NoRetryJob はどちらにも残りませんでした。
          </p>
          <p>
            TwoRetriesJob は <code>retry_on</code> の2回の後、Sidekiq の再試行で2回実行され、合計4回でした。Sidekiq は失敗したときのジョブの内容をそのまま再実行するので、2回目以降の <code>executions</code> は毎回 2 で、<code>retry_on</code> は毎回すぐにあきらめます。回数は掛け算ではなく足し算で増えます。FetchShipmentStatusJob に <code>sidekiq_options</code> を書かなければ、配送業者 API への要求は (5 + 25) × 3 = 90 回、期間は約 20 日になります。この章では <code>retry: 0</code> にして、使い切ったジョブを Dead に残し、Sidekiq の画面で確かめられるようにしました。
          </p>
          <h3>定期実行の開始をずらす</h3>
          <Code lang="ruby" title="app/jobs/refresh_shipment_statuses_job.rb" code={`
# 10分ごとに実行する（定期実行の登録は省略）
class RefreshShipmentStatusesJob < ApplicationJob
  def perform
    Shipment.undelivered.find_each do |shipment|
      # すべての取得が同じ時刻に始まらないよう、開始を 0〜5分の範囲でずらす
      FetchShipmentStatusJob.set(wait: rand(0.0...300.0).seconds).perform_later(shipment)
    end
  end
end
`} />
          <p>
            10 分ごとのジョブは取得そのものを行わず、配送ごとに FetchShipmentStatusJob を入れます。<code>set(wait:)</code> に 0〜300 秒の乱数を渡し、全件の取得が同じ時刻に始まらないようにしています。1件の失敗はその件のジョブの中で再試行されるので、ほかの件の取得を止めません。
          </p>
          <h3>リファクタリングの順序</h3>
          <ol>
            <li>1回の呼び出しを分ける：<code>Shipment#refresh_status!</code> の通信を CarrierClient に移し、タイムアウトを付ける。Net::HTTP の再試行を止める。</li>
            <li>失敗に情報を持たせる：<code>raise "HTTP 404"</code> の代わりに、<code>raise_error</code> で状態ごとの例外にする。Retry-After を読めるようにする。</li>
            <li>分類を書く：<code>CarrierClient.classify</code> と、ジョブの <code>retry_on</code>・<code>discard_on</code> で、再試行してよい失敗を決める。この段階で 404 を再試行しなくなる。</li>
            <li>待ち時間を決める：ジョブは <code>wait: :polynomially_longer</code>、HTTP の層は faraday-retry の <code>interval</code> と <code>backoff_factor</code>、画面からの取得は decide の Full Jitter にする。</li>
            <li>判断を純粋なメソッドにする：回数・待ち時間・期限の判断を <code>decide</code> に移し、表の形のテストを書く。待つ処理・乱数・時計をキーワード引数で受け取る。</li>
            <li>呼び出しの経路を確かめる：Net::HTTP・faraday-retry・<code>retry_on</code>・Sidekiq のどれが再試行しているかを洗い出し、層ごとの回数を掛けた数をテストで数える。<code>sidekiq_options retry: 0</code> を書く。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストと動作の確認',
      body: (
        <>
          <h3>テストの準備</h3>
          <p>
            rails_helper.rb で WebMock を読み込み、外部への接続を禁止します。テストの中で立てるサーバー（127.0.0.1）への接続だけは許します。<code>freeze_time</code> を使うために <code>ActiveSupport::Testing::TimeHelpers</code> を読み込みます。
          </p>
          <Code lang="ruby" title="spec/rails_helper.rb（追加した行）" code={`
require 'webmock/rspec'
WebMock.disable_net_connect!(allow_localhost: true) # 外部への接続を禁止する（テストで立てるサーバーだけ許す）
Rails.root.glob('spec/support/**/*.rb').sort.each { |f| require f }
# …（省略）
  config.include ActiveSupport::Testing::TimeHelpers # freeze_time
`} />
          <p>待つ処理と時計の代役 FakeTime と、決めた値を返す乱数の代役 FixedRandom を用意します。FakeTime の <code>sleeper</code> は、待つ代わりに時計の値を進めて、待つはずだった秒数を記録します。</p>
          <Code lang="ruby" title="spec/support/fake_time.rb" code={`
# 待つ処理と時計の代役。待つと時計の値が進むだけで、実際には待たない
class FakeTime
  attr_reader :now, :sleeps

  def initialize
    @now = 0.0
    @sleeps = []
  end

  def sleeper = ->(seconds) { @sleeps << seconds; @now += seconds }
  def clock = -> { @now }
  def advance(seconds) = @now += seconds
end

# 決めた値を返す乱数の代役
FixedRandom = Data.define(:value) do
  def rand = value
end
`} />
          <h3>判断を表の形で確かめる</h3>
          <Code lang="ruby" title="spec/lib/retry_with_backoff_spec.rb" code={`
require "rails_helper"

RSpec.describe RetryWithBackoff do
  it "指数バックオフは base × 2^(n-1) を cap で抑え、Full Jitter はその r 倍" do
    expect((1..6).map { |n| described_class.exponential(n, base: 0.5, cap: 5) }).to eq([0.5, 1.0, 2.0, 4.0, 5, 5])
    expect(described_class.full_jitter(3, base: 0.5, cap: 5, r: 0.8)).to eq(1.6)
  end

  describe ".decide" do
    policy = RetryWithBackoff::Policy.new(max_attempts: 4, base: 0.5, cap: 5, deadline: 10)
    retryable = RetryWithBackoff::Failure.new(retryable: true)
    [
      # [説明, 失敗の分類, 何回目の失敗か, 経過秒数, 期待する結果]
      ["再試行してはいけない失敗", RetryWithBackoff::Failure.new(retryable: false), 1, 0.0, RetryWithBackoff::GiveUp.new(:not_retryable)],
      ["1回目の失敗", retryable, 1, 2.0, RetryWithBackoff::Wait.new(0.4)],
      ["3回目の失敗", retryable, 3, 7.2, RetryWithBackoff::Wait.new(1.6)],
      ["4回目の失敗（回数の上限）", retryable, 4, 8.8, RetryWithBackoff::GiveUp.new(:attempts)],
      ["待つと期限を過ぎる", retryable, 2, 9.5, RetryWithBackoff::GiveUp.new(:deadline)],
      ["Retry-After の3秒（ジッターをかけない）", RetryWithBackoff::Failure.new(retryable: true, retry_after: 3), 1, 1.0, RetryWithBackoff::Wait.new(3)],
      ["Retry-After の30秒は期限を過ぎる", RetryWithBackoff::Failure.new(retryable: true, retry_after: 30), 1, 1.0, RetryWithBackoff::GiveUp.new(:deadline)],
    ].each do |name, failure, attempt, elapsed, expected|
      it name do
        expect(described_class.decide(policy, failure, attempt:, elapsed:, r: 0.8)).to eq(expected)
      end
    end
  end

  describe RetryWithBackoff::Retrier do
    let(:time) { FakeTime.new }
    let(:policy) { RetryWithBackoff::Policy.new(max_attempts: 4, base: 0.5, cap: 5, deadline: 10) }
    let(:classify) { ->(e) { RetryWithBackoff::Failure.new(retryable: e.is_a?(Timeout::Error)) } }
    let(:retrier) do
      described_class.new(policy:, classify:, sleeper: time.sleeper, random: FixedRandom.new(0.8), clock: time.clock)
    end

    it "2回失敗した後に成功すると、その値を返す。待った時間は記録されるだけ" do
      results = [Timeout::Error, Timeout::Error, "in_transit"]
      value = retrier.call do
        result = results.shift
        result.is_a?(Class) ? raise(result) : result
      end
      expect(value).to eq("in_transit")
      expect(time.sleeps).to eq([0.4, 0.8])
    end

    it "再試行してはいけない例外は、1回で投げる" do
      calls = 0
      expect { retrier.call { calls += 1; raise ArgumentError } }.to raise_error(ArgumentError)
      expect(calls).to eq(1)
      expect(time.sleeps).to be_empty
    end
  end
end
`} />
          <p>
            decide のテストは入力と期待する結果を表に並べるだけで書けます。3秒の Retry-After は乱数（0.8）を掛けずにそのまま待ち、30秒の Retry-After は期限の10秒を過ぎるので待たずにあきらめます。Retrier のテストでは、FakeTime に記録された待ち時間で、待ったはずの秒数を確かめています。
          </p>
          <h3>全体の期限を確かめる</h3>
          <Code lang="ruby" title="spec/services/shipments/fetch_status_spec.rb（抜粋）" code={`
require "rails_helper"

RSpec.describe Shipments::FetchStatus do
  let(:shipment) { Shipment.create!(tracking_number: "TRK1") }
  let(:time) { FakeTime.new }
  let(:deps) { { sleeper: time.sleeper, random: FixedRandom.new(0.8), clock: time.clock } }
  let(:url) { "https://carrier.example/v1/shipments/TRK1" }
  let(:ok) { { status: 200, body: { status: "in_transit" }.to_json, headers: { "Content-Type" => "application/json" } } }

  # …（省略。503 の後に成功する場合と、404 の場合）

  # CarrierClient の代役。1回ごとのタイムアウト（1秒）と残り時間の短い方だけ時計を進め、タイムアウトの例外を投げる
  class SlowCarrier
    attr_reader :timeouts

    def initialize(time)
      @time = time
      @timeouts = []
    end

    def status(_tracking_number, remaining:)
      timeout = [1, remaining].min
      @timeouts << timeout.round(2)
      @time.advance(timeout)
      raise Faraday::TimeoutError
    end
  end

  it "毎回タイムアウトすると、3回目は期限までの残り0.4秒で打ち切り、3秒であきらめる" do
    carrier = SlowCarrier.new(time)

    expect { described_class.new(client: carrier, **deps).call(shipment) }.to raise_error(Faraday::TimeoutError)
    expect(carrier.timeouts).to eq([1, 1, 0.4])
    expect(time.sleeps).to eq([0.2, 0.4])
    expect(time.now.round(2)).to eq(3.0)
  end
end
`} />
          <p>
            SlowCarrier は CarrierClient の代役で、渡されたタイムアウトの秒数だけ FakeTime の時計を進めてから、タイムアウトの例外を投げます。1回ごとのタイムアウトは 1、1、0.4 秒になり、待った時間は 0.2 秒と 0.4 秒、時計は3秒で止まりました。図 107-3 と同じ動きを、実際には待たずに確かめています。
          </p>
          <h3>タイムアウトと faraday-retry を確かめる</h3>
          <Code lang="ruby" title="spec/clients/carrier_client_spec.rb（抜粋）" code={`
require "rails_helper"

RSpec.describe CarrierClient do
  let(:url) { "https://carrier.example/v1/shipments/TRK1" }
  let(:waits) { [] }

  before do
    # faraday-retry が待つ秒数を記録するだけにして、実際には待たない
    allow_any_instance_of(Faraday::Retry::Middleware).to receive(:sleep) { |_middleware, seconds| waits << seconds }
  end

  describe "タイムアウト" do
    # 接続を受け付けるが、何も返さないサーバー
    let!(:server) { TCPServer.new("127.0.0.1", 0) }
    let(:accepted) { [] }
    let!(:acceptor) { Thread.new { loop { accepted << server.accept } } }
    let(:base_url) { "http://127.0.0.1:#{server.addr[1]}" }
    after { acceptor.kill; server.close }

    # ブロックが投げた例外のクラスと、それまでにかかった秒数を返す
    def error_and_seconds
      started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      yield
    rescue Faraday::Error => e
      [e.class, (Process.clock_gettime(Process::CLOCK_MONOTONIC) - started).round(1)]
    end

    it "応答がなければ timeout の秒数で打ち切る。Net::HTTP の再試行もしない" do
      client = described_class.new(base_url:, timeout: 0.5, retries: 0)

      expect(error_and_seconds { client.status("TRK1") }).to eq([Faraday::TimeoutError, 0.5])
      expect(accepted.size).to eq(1)
    end

    it "全体の期限までの残りが短ければ、その秒数で打ち切る" do
      client = described_class.new(base_url:, timeout: 5, retries: 0)

      expect(error_and_seconds { client.status("TRK1", remaining: 0.3) }).to eq([Faraday::TimeoutError, 0.3])
    end
  end

  describe "faraday-retry" do
    let(:client) { described_class.new }

    it "503 が続くと3回送り、0.5〜0.75秒、1.0〜1.25秒待つ。最後の 503 を例外にする" do
      stub_request(:get, url).to_return(status: 503)

      expect { client.status("TRK1") }.to raise_error(Faraday::ServerError)
      expect(a_request(:get, url)).to have_been_made.times(3)
      expect(waits[0]).to be_between(0.5, 0.75)
      expect(waits[1]).to be_between(1.0, 1.25)
    end

    it "429 に Retry-After: 2 があれば、2秒待って送り直す" do
      stub_request(:get, url).to_return(
        { status: 429, headers: { "Retry-After" => "2" } },
        { status: 200, body: { status: "delivered" }.to_json, headers: { "Content-Type" => "application/json" } }
      )

      expect(client.status("TRK1")).to eq("delivered")
      expect(waits).to eq([2.0])
    end

    # …（省略。429 の Retry-After が30秒の場合、POST を再試行しないこと、classify と retry_after）
`} />
          <p>
            タイムアウトのテストでは接続を受け付けるが何も返さないサーバーを TCPServer で立てています。WebMock の <code>to_timeout</code> は例外を投げるだけで時間が経たないので、タイムアウトの秒数が使われるかはこの方法で確かめます。faraday-retry のテストでは、ミドルウェアの <code>sleep</code> を <code>allow_any_instance_of</code> で差し替え、待つはずだった秒数を記録しています。faraday-retry は待つ処理を外から受け取らないので、この方法を使います。
          </p>
          <h3>ジョブの再試行を、待たずに確かめる</h3>
          <Code lang="ruby" title="spec/jobs/fetch_shipment_status_job_spec.rb（抜粋）" code={`
require "rails_helper"

RSpec.describe FetchShipmentStatusJob, type: :job do
  include ActiveJob::TestHelper

  let(:shipment) { Shipment.create!(tracking_number: "TRK1") }
  let(:url) { "https://carrier.example/v1/shipments/TRK1" }

  before do
    # faraday-retry の待ち時間は実際には待たない
    allow_any_instance_of(Faraday::Retry::Middleware).to receive(:sleep)
  end
  # …（省略。成功・503・429・404 の場合）

  it "5回実行しても失敗すると例外を投げる。配送業者への送信は 3 × 5 = 15 回" do
    stub_request(:get, url).to_return(status: 503)

    freeze_time do
      # ブロックの中では、再試行で入ったジョブも待たずにすぐ実行する
      perform_enqueued_jobs do
        expect { described_class.perform_later(shipment) }.to raise_error(Faraday::ServerError)
      end

      # 再試行のジョブに付いた実行の予定時刻から、待ち時間を求める
      waits = performed_jobs.drop(1).map { |job| job[:at] - Time.current.to_f }
      [1, 2, 3, 4].each_with_index do |n, i|
        expect(waits[i]).to be_between(n**4 + 2, n**4 * 1.15 + 2) # ジッターは retry_jitter（0.15）
      end
    end
    expect(a_request(:get, url)).to have_been_made.times(15)
  end

  it "retry_jitter の既定値は 0.15、Sidekiq 自身の再試行は 0 回" do
    expect(ActiveJob::Base.retry_jitter).to eq(0.15)
    expect(described_class.get_sidekiq_options["retry"]).to eq(0)
  end
end
`} />
          <p>
            テストの環境では Active Job のアダプターが <code>:test</code> なので、<code>perform_later</code> で入れたジョブは、ふつうは記録されるだけで実行されません。<code>perform_enqueued_jobs</code> のブロックの中では、入れたジョブも、再試行で予定の時刻付きで入ったジョブも、待たずにすぐ実行されます<Ref n={25} />。実行したジョブは <code>performed_jobs</code> に記録され、再試行のジョブには予定の時刻（<code>:at</code>）が付いています。<code>freeze_time</code> で時刻を止めておけば、予定の時刻から現在の時刻を引いた値が待ち時間です。4回の待ち時間が n<sup>4</sup> + 2 秒から n<sup>4</sup> × 1.15 + 2 秒の範囲にあることを確かめています。
          </p>
          <p>
            例外を確かめる <code>expect</code> は <code>perform_enqueued_jobs</code> のブロックの内側に書きます。<code>perform_enqueued_jobs</code> はブロックを <code>assert_nothing_raised</code> の中で実行するので<Ref n={25} />、ブロックから出た例外は補助メソッドが別の例外で包みます。このため外側の期待値からは、元の <code>Faraday::ServerError</code> をそのまま検査できません。
          </p>
          <h3>実行結果</h3>
          <Code lang="text" title="実行結果（bundle exec rspec --format documentation。MySQL 8.4）" code={`
CarrierClient
  タイムアウト
    応答がなければ timeout の秒数で打ち切る。Net::HTTP の再試行もしない
    全体の期限までの残りが短ければ、その秒数で打ち切る
  faraday-retry
    503 が続くと3回送り、0.5〜0.75秒、1.0〜1.25秒待つ。最後の 503 を例外にする
    429 に Retry-After: 2 があれば、2秒待って送り直す
    Retry-After が max_interval（5秒）より長ければ、この層では再試行しない
    POST は冪等でないので、503 でも再試行しない
  .classify
    応答を受け取れなかった失敗と、408・429・5xx を再試行してよい失敗にする
    Retry-After の日時の形式を、待つ秒数に直す

FetchShipmentStatusJob
  成功したら、配送状況を保存する
  503 が続くと、Faraday が3回送った後、ジョブを3〜3.15秒後に再試行する
  429 は、Retry-After の秒数だけ待ってからジョブを再試行する
  404 は再試行せずに捨てる
  5回実行しても失敗すると例外を投げる。配送業者への送信は 3 × 5 = 15 回
  retry_jitter の既定値は 0.15、Sidekiq 自身の再試行は 0 回

RefreshShipmentStatusesJob
  未配達の配送ごとに取得のジョブを入れ、開始の時刻を0〜5分の範囲でずらす

RequestPickupJob
  受け付けた後で応答が届かなくても、同じ冪等性キーで送り直すので、集荷は1件だけできる

RetryWithBackoff
  指数バックオフは base × 2^(n-1) を cap で抑え、Full Jitter はその r 倍
  .decide
    再試行してはいけない失敗
    1回目の失敗
    3回目の失敗
    4回目の失敗（回数の上限）
    待つと期限を過ぎる
    Retry-After の3秒（ジッターをかけない）
    Retry-After の30秒は期限を過ぎる
  RetryWithBackoff::Retrier
    2回失敗した後に成功すると、その値を返す。待った時間は記録されるだけ
    再試行してはいけない例外は、1回で投げる

Shipments::FetchStatus
  503 の後に成功すれば、配送状況を保存する
  404 は再試行しない
  毎回タイムアウトすると、3回目は期限までの残り0.4秒で打ち切り、3秒であきらめる

Finished in 1.3 seconds (files took 0.94119 seconds to load)
29 examples, 0 failures
`} />
          <p>
            29 件のテストは 1.3 秒で終わりました。この中にはFaraday の層で2回ずつ待つ実行を5回含むテスト（本来なら 7.5〜10 秒待つ）や、3秒の期限のテストが入っています。実際に待っているのは、応答しないサーバーで 0.5 秒と 0.3 秒のタイムアウトを確かめる2件だけです。
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
            <li>一時的な失敗を、呼び出し元や利用者に見せずに済ませられる。</li>
            <li>回数・待ち時間・期限の上限で、相手にかける負荷と、呼び出し元を待たせる時間が決めた範囲に収まる。最初のコードの1秒あたり 1,420 回の要求は、1件あたり最大 15 回を約7分に分けて送る形になる。</li>
            <li>ジッターで、多くのクライアントの再試行と定期実行が同じ時刻に集中しなくなる。</li>
            <li>再試行してはいけない失敗（404 など）は、すぐに呼び出し元に返るか、ジョブが捨てられる。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>外部の API ごとに、どの失敗を再試行してよいかを決める必要がある。API の説明に書かれていないことも多い。</li>
            <li>失敗が続いた場合は、成功するかあきらめるまでの時間が延びる。期限までの時間が、呼び出し元から見た最悪の応答時間になる。ジョブの経路では、取得の結果が反映されるまでに数分かかることがある。</li>
            <li>再試行した失敗の記録の仕方を決める必要がある。Azure は、途中の失敗は情報として記録し、最後の再試行の失敗だけをエラーとして記録するのがよいとしています<Ref n={5} />。<code>retry_on</code> には、再試行の前に Rails のエラー報告に送る <code>report: true</code> もあります<Ref n={11} />。</li>
            <li>Net::HTTP・faraday-retry・<code>retry_on</code>・Sidekiq のどこで再試行しているかを把握しておかないと、要求の数が増える。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            判断を純粋な関数にしたので、「何回目の失敗で、何秒たっていて、乱数がいくつなら、何秒待つか」を表の形のテストで確かめられます。待つ処理と時計を注入したので、3秒分の再試行のテストも実際には待たずに終わります。最初のコードは Net::HTTP を書き換えないとテストできませんでした。一方で、faraday-retry と <code>retry_on</code> は待つ処理を外から受け取らないので、テストでは <code>sleep</code> の差し替えと、予定の時刻からの逆算を使います。gem の設定を変えたときは、送った回数と待ち時間のテストで確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>すべての失敗を再試行する</h3>
          <Code lang="ruby" title="誤り" code={`
class FetchShipmentStatusJob < ApplicationJob
  retry_on StandardError, wait: :polynomially_longer, attempts: 5 # 404 も NoMethodError も再試行する
end
`} />
          <p>
            404 や 400、プログラムの誤りによる例外まで再試行すると、結果が変わらないのに相手に要求を送り、呼び出し元を待たせます。最初のコードは 404 に5回送りました。Google Cloud Storage の説明も、再試行できないエラーの再試行をアンチパターンに挙げ、恒久的なエラーは記録して原因に対処するよう勧めています<Ref n={7} />。再試行する例外を具体的に並べ、再試行しない失敗は <code>discard_on</code> で捨てるか、そのまま例外にします。
          </p>
          <h3>待たずに、または短い固定の間隔で再試行する</h3>
          <Code lang="ruby" title="誤り" code={`
f.request :retry, max: 5, retry_statuses: [503] # interval の既定は 0 秒。待たずに送り直す
retry_on Faraday::ServerError, wait: 1.second, attempts: 10
`} />
          <p>
            Azure は、待ち時間が短く回数の多い再試行は、限界の近くで動いている混雑したサービスをさらに悪くしうるとしています<Ref n={5} />。最初のコードは1秒あたり 1,420 回の要求を送りました。faraday-retry は <code>interval</code> を書かないと待たないので、設定を省略しただけでこの状態になります。HTTP の再試行には <code>backoff_factor</code> で指数的に延びる待ち時間を設定できます。Active Job の <code>:polynomially_longer</code> は4乗に比例して延びます。どちらを使う場合も再試行が集中しないようにジッターを入れます。
          </p>
          <h3>回数や期限の上限を設けない</h3>
          <Code lang="ruby" title="誤り" code={`
retry_on Faraday::ServerError, wait: 5.minutes, attempts: :unlimited
`} />
          <p>
            成功するまで再試行し続けると、相手が長く止まっている間、負荷をかけ続けます。呼び出し元が待てる時間も過ぎてしまいます。回数と全体の期限の両方に上限を設けます。画面から呼ぶ処理は Retrier の <code>deadline</code> で、ジョブは <code>attempts</code> と待ち時間の合計（この章では最大約7分）で上限を決めます。Sidekiq の再試行を使う場合は、回数の代わりに期間で上限を決める <code>retry_for</code> もあります<Ref n={18} />。
          </p>
          <h3>各層で再試行する</h3>
          <Code lang="ruby" title="誤り" code={`
class FetchShipmentStatusJob < ApplicationJob
  # sidekiq_options を書いていない（Sidekiq が既定で25回再試行する）
  retry_on Faraday::ServerError, wait: :polynomially_longer, attempts: 5

  def perform(shipment)
    Shipments::FetchStatus.new(client: CarrierClient.new).call(shipment) # Retrier の3回 × faraday-retry の3回
  end
end
`} />
          <p>
            このジョブでは、Retrier と faraday-retry の掛け算で1回の実行あたり最大9回、<code>retry_on</code> の5回でその5倍、さらに Sidekiq の 25 回が足されます。HTTP クライアント、それを使うサービス、ジョブ、キューの仕組みのそれぞれが再試行すると、末端への要求の数は増え続けます（図 107-4）。再試行する層を決め、ほかの層は <code>retries: 0</code> や <code>sidekiq_options retry: 0</code> ですぐに失敗を返すようにします。複数の層で再試行する場合は、この章のテストのように掛けた回数を数えて確かめます。
          </p>
          <h3>冪等でない操作をそのまま再試行する</h3>
          <Code lang="ruby" title="誤り" code={`
def request_pickup(shipment)
  @conn.post("v1/pickups", { tracking_number: shipment.tracking_number }) # 冪等性キーがない
end
# RequestPickupJob が retry_on Faraday::ServerError（TimeoutError を含む）で再試行する
`} />
          <p>
            タイムアウトした POST を再試行すると、相手の側で処理が2回行われることがあります。Azure は、顧客のクレジットカードへの請求が2回行われる危険を挙げています<Ref n={5} />。この章の CarrierClient は、DB に保存した冪等性キーを <code>Idempotency-Key</code> ヘッダーで送ります。
          </p>
          <Code lang="ruby" title="app/models/pickup_request.rb・app/jobs/request_pickup_job.rb" code={`
class PickupRequest < ApplicationRecord
  belongs_to :shipment
  attribute :idempotency_key, :string, default: -> { SecureRandom.uuid }
end

class RequestPickupJob < ApplicationJob
  sidekiq_options retry: 0
  retry_on Faraday::ConnectionFailed, Faraday::ServerError, wait: :polynomially_longer, attempts: 5

  def perform(pickup_request)
    return if pickup_request.requested_at # 受け付け済み

    CarrierClient.new.request_pickup(pickup_request) # 同じ冪等性キーで送り直す
    pickup_request.update!(requested_at: Time.current)
  end
end
`} />
          <Code lang="ruby" title="spec/jobs/request_pickup_job_spec.rb" code={`
require "rails_helper"

RSpec.describe RequestPickupJob, type: :job do
  include ActiveJob::TestHelper

  it "受け付けた後で応答が届かなくても、同じ冪等性キーで送り直すので、集荷は1件だけできる" do
    pickup_request = Shipment.create!(tracking_number: "TRK1").pickup_requests.create!
    received = []  # 配送業者が受け取った冪等性キー
    pickups = {}   # 配送業者の側の集荷。キーごとに1件だけ作る
    stub_request(:post, "https://carrier.example/v1/pickups").to_return do |request|
      key = request.headers["Idempotency-Key"]
      received << key
      pickups[key] ||= "PU#{pickups.size + 1}"
      raise Net::ReadTimeout if received.size == 1 # 1回目は、受け付けた後で応答が届かない
      { status: 201, body: { id: pickups[key] }.to_json, headers: { "Content-Type" => "application/json" } }
    end

    perform_enqueued_jobs { described_class.perform_later(pickup_request) }

    expect(received).to eq([pickup_request.idempotency_key] * 2) # ジョブの再試行で2回送った
    expect(pickups.size).to eq(1)
    expect(pickup_request.reload.requested_at).to be_present
  end
end
`} />
          <p>
            偽の配送業者は1回目の POST を受け付けて集荷を作った後で、応答の代わりに <code>Net::ReadTimeout</code> を起こします。Faraday はこれを <code>Faraday::TimeoutError</code> にし、<code>retry_on</code> がジョブを再試行しました。配送業者は POST を2回受け取りましたが、2回とも同じキーだったので、集荷は1件だけでした。キーを付けずに送れば、2回の POST がそれぞれ集荷になります。キーは PickupRequest を作るときに1回だけ決めて保存し、再試行のたびに作り直しません。これは配送業者 API が冪等性キーに対応している場合の方法で、対応していなければ、再試行する前に依頼の一覧を問い合わせて、受け付け済みかを確かめます（<ChapterLink n={52} section="delivery-guarantees" />）。
          </p>
          <h3>タイムアウトを設定しない</h3>
          <Code lang="ruby" title="誤り" code={`
Faraday.new(url: "https://carrier.example") # request: { open_timeout:, timeout: } がない
Net::HTTP.get_response(uri)                 # タイムアウトを指定する引数がない
`} />
          <p>
            タイムアウトがないと、相手が応答しない間、再試行の判断に進めません。Faraday は設定しなければアダプターの既定値を使い<Ref n={23} />、Net::HTTP の既定は接続・読み込み・書き込みがそれぞれ 60 秒で、GET はさらに1回送り直します<Ref n={20} /><Ref n={21} />。最初のコードでは1件あたり最大 600 秒かかる計算でした。相手の応答時間に合わせて、接続と読み込みのタイムアウトを設定します。
          </p>
          <h3>テストで実際に待つ</h3>
          <Code lang="ruby" title="誤り" code={`
it "5回実行しても失敗すると例外を投げる" do
  # faraday-retry の sleep を差し替えていない
  perform_enqueued_jobs { expect { described_class.perform_later(shipment) }.to raise_error(Faraday::ServerError) }
end
`} />
          <p>
            再試行のテストが実際に何秒も待つと、テストが遅くなり、やがて実行されなくなります。この章の 15 回のテストから <code>sleep</code> の差し替えを外して実行すると、1件で 8.66 秒かかりました（差し替えると 0.35 秒）。待つ処理・乱数・時計を注入するか、gem の <code>sleep</code> を差し替え、ジョブの待ち時間は予定の時刻から数値で確かめます。
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
              再試行しない：失敗をそのまま返し、画面に「もう一度読み込む」ボタンを出します。利用者が自分で再試行するので、多層の再試行も起きません。Azure も、重要でない操作では、何度も再試行して処理の量を落とすより、すぐに失敗させる方がよいとしています<Ref n={5} />。
            </li>
            <li>前回の値を使う：配送状況のように少し古くても困らない値なら、取得に失敗したときは保存済みの値を表示し、次の定期的な取得に任せます。この章のジョブも、5回で取得できなければ Dead に入れ、10 分後の定期実行で改めて取得します。</li>
          </ul>
          <h3>ほかのパターンとの違いと組み合わせ</h3>
          <ul>
            <li>
              Circuit Breaker：Fowler の説明では、保護したい呼び出しを Circuit Breaker のオブジェクトで包み、失敗が一定の数に達したら、それ以降の呼び出しは実行せずにすぐエラーを返します<Ref n={10} />。Ruby では stoplight という gem があり、README によると、既定では3回の失敗で緑（通常）から赤（呼び出しを止める）に変わり、赤の間は <code>Stoplight::Error::RedLight</code> を投げ、60 秒後に黄（試しに1回通す）になります。状態は既定でメモリーに持ち、複数のプロセスで共有するなら Redis に置きます<Ref n={24} />。Azure は Retry と Circuit Breaker の組み合わせを勧めています<Ref n={5} />。一方で Brooker は、Circuit Breaker はシステムに動作のモードを持ち込み、テストが難しく、回復までの時間を延ばすことがあると指摘し、トークンバケットで再試行を制限する方法を紹介しています<Ref n={1} />。この章のジョブで組み合わせるなら、赤の間の <code>RedLight</code> は <code>retry_on</code> で長めに待つか、<code>discard_on</code> で捨てて次の定期実行に任せます。stoplight は本書の検証環境に入れていないので、ここでは README で確かめた内容だけを書いています。
            </li>
            <li>
              Idempotency Key（<ChapterLink n={52} />）：冪等でない操作を安全に再試行するために、2回目の要求を相手の側で実行しないようにします。この章の集荷の依頼のように、再試行する側はキーを1回だけ作って保存し、毎回同じキーを送ります。
            </li>
            <li>
              Transactional Outbox（<ChapterLink n={53} />）：DB の更新と外部への送信を取りこぼさないためのパターンです。送信に失敗したものを送り直す間隔に、この章の方法を使います。
            </li>
            <li>
              Optimistic Locking（<ChapterLink n={49} />）：楽観的ロックの競合のように、データの変更がぶつかったことを表す失敗は、利用者が画面で判断した内容を確かめずに自動でやり直してはいけません。デッドロック（<code>ActiveRecord::Deadlocked</code>）のように DB がやり直しを求める失敗は、トランザクションを最初からやり直す形で再試行できます（<ChapterLink n={38} section="deadlock" />）。Rails API の <code>retry_on</code> の例にも <code>retry_on ActiveRecord::Deadlocked, wait: 5.seconds, attempts: 3</code> があります<Ref n={11} />。
            </li>
            <li>
              Middleware Chain（<ChapterLink n={43} />）と Adapter（<ChapterLink n={42} />）：HTTP クライアントの再試行は、Faraday のようにミドルウェアとして組み込まれることが多くあります。失敗の分類は外部のエラーをアプリの言葉に変える Adapter に置きます。
            </li>
          </ul>
          <h3>Rails の標準機能と gem の使い分け</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">仕組み</th>
                  <th scope="col">向いている再試行</th>
                  <th scope="col">注意すること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Active Job の <code>retry_on</code>・<code>discard_on</code></th>
                  <td>数秒から数分の間隔の再試行。ジョブごとに、再試行する例外と捨てる例外を宣言する</td>
                  <td>wait の Proc は例外を受け取らない。回数を使い切った例外はキューの仕組みに渡る</td>
                </tr>
                <tr>
                  <th scope="row">Sidekiq の再試行（<code>sidekiq_options retry</code>）</th>
                  <td>想定していない例外（プログラムの誤り）を、修正をデプロイするまで残しておく。Sidekiq の画面から再実行できる</td>
                  <td>既定は 25 回・約 20 日。<code>retry_on</code> と両方使うと回数と期間が足される</td>
                </tr>
                <tr>
                  <th scope="row">faraday-retry</th>
                  <td>1回の処理の中の、数秒以内の再試行。Retry-After を読む</td>
                  <td>interval の既定は 0 秒。全体の期限はない。POST は既定で再試行しない</td>
                </tr>
                <tr>
                  <th scope="row">Net::HTTP の <code>max_retries</code></th>
                  <td>接続が切れたときの1回の送り直し（既定 1）</td>
                  <td>読み込みのタイムアウトでも送り直すので、待ち時間が2倍になる。Faraday のアダプターは 0 にする</td>
                </tr>
                <tr>
                  <th scope="row">自分で書く Retrier（この章の <code>RetryWithBackoff</code>）</th>
                  <td>全体の期限が必要な、画面からの呼び出し。HTTP 以外の操作</td>
                  <td>自分で保守するコードが増える。gem で足りるなら gem を使う</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Rails Guides は、失敗したジョブは設定しない限り再試行されないこと、Rails の既定のジョブキューである Solid Queue では再試行を <code>retry_on</code> で明示的に設定する必要があることを説明しています<Ref n={13} />。Sidekiq を使うアプリでは、Sidekiq が既定で再試行するので、どちらで回数を管理するかを決めておきます（<ChapterLink n={18} section="retry" />）。Sidekiq の再試行だけに任せる場合、待ち時間は既定で (再試行の回数の4乗 + 15) 秒に揺らぎを足したものです。<code>sidekiq_retry_in</code> のブロックは回数と例外を受け取り、待つ秒数か、<code>:discard</code>（捨てる）・<code>:kill</code>（Dead に移す）を返せるので、例外ごとの扱いはそこで決めます<Ref n={18} />。
          </p>
          <h3>採用する条件</h3>
          <ul>
            <li>呼び出す相手がネットワーク越しにあり、タイムアウト・503・429 のような一時的な失敗が起こりうる。</li>
            <li>操作が冪等である、または冪等性キーなどで2回の実行を防げる。</li>
            <li>少し待てば成功する見込みがあり、呼び出し元がその時間を待てる。</li>
          </ul>
          <h3>採用しない方がよい条件</h3>
          <ul>
            <li>失敗の原因が要求の内容や権限にある（400・403・404）。</li>
            <li>冪等でない操作で、重複を防ぐ手段がない。</li>
            <li>相手が長く止まっている。再試行より、すぐに失敗を返すか Circuit Breaker を使う。</li>
            <li>呼び出し元や下の層がすでに再試行している。</li>
          </ul>
          <h3>判断のチェックポイント</h3>
          <ol>
            <li>どの失敗を再試行し、どの失敗を再試行しないかを決めたか。</li>
            <li>操作は冪等か。冪等でないなら、重複を防ぐ手段があるか。</li>
            <li>1回ごとのタイムアウトと、全体の期限を決めたか。Net::HTTP の既定値のままになっていないか。</li>
            <li>待ち時間は指数バックオフで、上限とジッターがあるか。Retry-After に従うか。</li>
            <li>Net::HTTP・faraday-retry・<code>retry_on</code>・Sidekiq のどこで再試行しているか。各層の回数を掛けた（または足した）数は許容できるか。</li>
            <li>待つ処理・乱数・時計を差し替えて、実際に待たずにテストできるか。</li>
          </ol>
          <Callout kind="note" title="この章の2つの経路の選び方">
            <p>
              画面から呼ぶ取得は、利用者を待たせるので全体の期限を3秒にし、自分で書いた Retrier の1か所だけで再試行しました。ジョブの経路は数秒以内の再試行を faraday-retry に、数分にわたる再試行を <code>retry_on</code> に分け、Sidekiq の再試行は止めました。2つの層の回数を掛けた 15 回はテストで数えています。
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
          <li>再試行するのは、通信の失敗・タイムアウト・408・429・5xx のような一時的な失敗だけにします。400・404 やプログラムの誤りは、再試行せずにすぐ返すか、<code>discard_on</code> で捨てます。</li>
          <li>冪等でない操作は冪等性キーなどで重複を防げる場合に限って再試行します。キーは1回だけ作って保存し、毎回同じ値を送ります。</li>
          <li>待ち時間は指数バックオフで延ばして上限を設け、ジッターで再試行の時刻をずらします。Retry-After があればそれに従います。定期実行の開始もずらします。</li>
          <li>1回ごとのタイムアウトと、再試行を含めた全体の期限の両方を決めます。Net::HTTP の既定は 60 秒で、GET はさらに1回送り直します。</li>
          <li><code>retry_on</code> の <code>:polynomially_longer</code> は約3・18・83・258秒と延び、<code>config.active_job.retry_jitter</code>（load_defaults 6.1 以降で 0.15）のジッターが加わります。429 の Retry-After は <code>rescue_from</code> と <code>retry_job</code> で読みます。</li>
          <li>再試行は経路の1か所にまとめます。faraday-retry と <code>retry_on</code> の回数は掛け算で、<code>retry_on</code> と Sidekiq の再試行は足し算で増えるので、<code>sidekiq_options retry: 0</code> などで層を減らし、送った回数をテストで数えます。</li>
          <li>判断を純粋な関数に分け、待つ処理・乱数・時計を注入すると、再試行を実際に待たずにテストできます。ジョブの待ち時間は <code>perform_enqueued_jobs</code> と予定の時刻から数値で確かめます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Timeouts, retries, and backoff with jitter', publisher: 'Marc Brooker／Amazon Builders’ Library（AWS Builder Center）', url: 'https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter', accessed: '2026-11-13', version: '2019年12月5日', note: '再試行は利己的であること、タイムアウトの決め方（p99.9）、多層の再試行で243倍、1か所で再試行すること、トークンバケット、定期的な処理のジッター、Circuit Breaker の難しさ。' },
    { title: 'Exponential Backoff And Jitter', publisher: 'Marc Brooker／AWS Architecture Blog', url: 'https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/', accessed: '2026-11-13', version: '2015年3月4日（2023年5月に追記）', note: '上限付きの指数バックオフの式、Full Jitter・Equal Jitter・Decorrelated Jitter の式とシミュレーションの結果。' },
    { title: 'RFC 9110 HTTP Semantics（9.2.2 Idempotent Methods、10.2.3 Retry-After、15.5.9 408、15.6.4 503）', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110.html', accessed: '2026-11-13', version: '2022年6月', note: '冪等なメソッドと、冪等でないメソッドを自動で再試行すべきでないこと、Retry-After の2つの形式、408 と 503 の意味。' },
    { title: 'RFC 6585 Additional HTTP Status Codes（4. 429 Too Many Requests）', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc6585.html', accessed: '2026-11-13', version: '2012年4月', note: '429 の意味と、Retry-After を含めてよいこと。' },
    { title: 'Retry pattern', publisher: 'Microsoft／Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/retry', accessed: '2026-11-13', version: '2024年7月18日', note: '一時的な障害の例、冪等性と二重の処理、記録の仕方、すぐに失敗させる場合、Circuit Breaker との組み合わせ。' },
    { title: 'Retry Storm antipattern', publisher: 'Microsoft／Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/antipatterns/retry-storm/', accessed: '2026-11-13', version: '2025年7月16日', note: 'thundering herd、いつまでも再試行することの無意味さ、Retry-After に従うこと、400 は再試行しても役に立たないこと。' },
    { title: 'Retry strategy', publisher: 'Google Cloud Storage Documentation', url: 'https://docs.cloud.google.com/storage/docs/retry-strategy', accessed: '2026-11-13', version: '2026年11月10日更新', note: '再試行すると役に立つ応答（408・429・5xx、タイムアウト、切断）、再試行のアンチパターン（バックオフなし、再試行できないエラー、層の重なりで9回）。' },
    { title: 'Addressing Cascading Failures（Site Reliability Engineering 第22章）', publisher: 'Google／sre.google', url: 'https://sre.google/sre-book/addressing-cascading-failures/', accessed: '2026-11-13', note: 'ランダム化した指数バックオフ、3つの層がそれぞれ4回試すと64回、恒久的なエラーを再試行しないこと。' },
    { title: 'Handling Overload（Site Reliability Engineering 第21章）', publisher: 'Google／sre.google', url: 'https://sre.google/sre-book/handling-overload/', accessed: '2026-11-13', note: '1つの要求あたり3回までの試行、再試行の割合を10%未満にする予算、拒否した層のすぐ上だけで再試行すること。' },
    { title: 'CircuitBreaker', publisher: 'Martin Fowler／martinfowler.com', url: 'https://martinfowler.com/bliki/CircuitBreaker.html', accessed: '2026-11-13', version: '2014年3月6日', note: 'Circuit Breaker の仕組み。' },
    { title: 'ActiveJob::Exceptions::ClassMethods（retry_on、discard_on）', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveJob/Exceptions/ClassMethods.html', accessed: '2026-11-13', version: 'Rails 8.1', note: 'wait・attempts・jitter・report の既定値、:polynomially_longer の式、回数を使い切ったときの扱い、ハンドラーを探す順序、Deadlocked の例。' },
    { title: 'Configuring Rails Applications（config.active_job.retry_jitter）', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html', accessed: '2026-11-13', version: 'Rails 8.1', note: 'retry_jitter の既定値は load_defaults 6.1 以降で 0.15。' },
    { title: 'Active Job Basics', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_job_basics.html', accessed: '2026-11-13', version: 'Rails 8.1', note: '失敗したジョブは設定しない限り再試行されないこと、Solid Queue では retry_on で設定すること、Solid Queue の節の :exponentially_longer の例。' },
    { title: 'faraday-retry（README）', publisher: 'lostisland／GitHub', url: 'https://github.com/lostisland/faraday-retry', accessed: '2026-11-13', version: '2.4.0', note: '既定の再試行の回数・例外・メソッド、retry_statuses、Retry-After と RateLimit-Reset。' },
    { title: 'activejob/lib/active_job/exceptions.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/exceptions.rb#L171-L195`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: ':polynomially_longer の計算（executions**4 にジッターと2秒を足す）、Proc の結果にジッターがかからないこと、ほかの記号が例外になること、retry_jitter のクラス属性の既定 0.0（11行目）、以前は exponential と誤って呼んでいたというコメント。' },
    { title: 'railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/configuration.rb#L181-L190`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'load_defaults "6.1" で active_job.retry_jitter を 0.15 にすること。' },
    { title: 'Error Handling', publisher: 'Sidekiq Wiki', url: 'https://github.com/sidekiq/sidekiq/wiki/Error-Handling', accessed: '2026-11-20', note: '既定で25回・約20日の再試行、Dead set、retry: 0 で直接 Dead に入ること、retry: false で捨てること。' },
    { title: 'lib/sidekiq/job_retry.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: 'https://github.com/sidekiq/sidekiq/blob/v8.1.7/lib/sidekiq/job_retry.rb#L117-L134', accessed: '2026-11-20', version: 'Sidekiq 8.1.7', note: 'retry が false なら再試行しないこと（133行目）、既定の回数25（73行目）、retry_for と retry の関係（181〜187行目）、sidekiq_retry_in の戻り値と既定の待ち時間 (count**4)+15・揺らぎ（218〜240行目）。' },
    { title: 'lib/active_job/queue_adapters/sidekiq_adapter.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: 'https://github.com/sidekiq/sidekiq/blob/v8.1.7/lib/active_job/queue_adapters/sidekiq_adapter.rb#L20-L33', accessed: '2026-11-20', version: 'Sidekiq 8.1.7', note: 'Active Job のクラスに Sidekiq::Job::Options を読み込み、sidekiq_options を使えるようにすること。' },
    { title: 'lib/net/http.rb（Net::HTTP#initialize の既定値）', publisher: 'ruby/net-http（GitHub）', url: 'https://github.com/ruby/net-http/blob/v0.10.0/lib/net/http.rb#L1152-L1162', accessed: '2026-11-20', version: 'net-http 0.10.0', note: 'open_timeout・read_timeout・write_timeout の既定が60秒、max_retries の既定が1であること。' },
    { title: 'lib/net/http.rb（transport_request）', publisher: 'ruby/net-http（GitHub）', url: 'https://github.com/ruby/net-http/blob/v0.10.0/lib/net/http.rb#L2486-L2535', accessed: '2026-11-20', version: 'net-http 0.10.0', note: '冪等なメソッドを、読み込みのタイムアウトや切断のときに max_retries の回数まで送り直すこと。' },
    { title: 'lib/faraday/adapter/net_http.rb', publisher: 'lostisland/faraday-net_http（GitHub）', url: 'https://github.com/lostisland/faraday-net_http/blob/v3.5.0/lib/faraday/adapter/net_http.rb#L77-L89', accessed: '2026-11-20', version: 'faraday-net_http 3.5.0', note: '接続の失敗を ConnectionFailed、タイムアウトを TimeoutError にすること。timeout・open_timeout を Net::HTTP に設定し、max_retries を 0 にすること（180〜195行目）。' },
    { title: 'Request Options', publisher: 'Faraday Documentation', url: 'https://github.com/lostisland/faraday/blob/main/docs/customization/request-options.md', accessed: '2026-11-20', note: 'timeout・open_timeout・read_timeout・write_timeout の意味、既定はアダプターの値であること、要求ごとに req.options で上書きできること。' },
    { title: 'Stoplight（README）', publisher: 'bolshakov／GitHub', url: 'https://github.com/bolshakov/stoplight', accessed: '2026-11-20', version: '6.0.1', note: '緑・赤・黄の状態、既定の閾値3と cool off time 60秒、RedLight の例外、メモリーと Redis のデータストア。' },
    { title: 'activejob/lib/active_job/test_helper.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/test_helper.rb#L620-L650`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'perform_enqueued_jobs のブロックの中では予定の時刻付きのジョブもすぐ実行すること、ブロックを _assert_nothing_raised_or_warn の中で実行すること。' },
    { title: 'activejob/CHANGELOG.md（Rails 7.2.0）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.0/activejob/CHANGELOG.md', accessed: '2026-11-20', version: 'Rails 7.2.0', note: '非推奨だった :exponentially_longer が 7.2.0 で削除されたこと（7.1 で :polynomially_longer を勧める変更）。' },
    { title: 'Exception Handling（retry）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/exceptions_rdoc.html', accessed: '2026-11-13', note: 'retry は begin の先頭から再開すること、rescue の中でしか書けないこと。' },
    { title: 'lib/faraday/retry/middleware.rb', publisher: 'lostisland/faraday-retry（GitHub）', url: 'https://github.com/lostisland/faraday-retry/blob/v2.4.0/lib/faraday/retry/middleware.rb#L149-L160', accessed: '2026-11-20', version: 'faraday-retry 2.4.0', note: 'Retry-After が max_interval より長ければ再試行しないこと、interval の既定 0（51〜53行目）、interval_randomness の計算（232〜241行目）、IDEMPOTENT_METHODS（26行目）。' },
  ],
}

export default chapter
