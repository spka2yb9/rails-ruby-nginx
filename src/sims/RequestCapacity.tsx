import { useId, useState } from 'react'
import { StudyFigure, FigureFacts } from '../visuals/study-figure'
import { simulateCapacity, type Capacity } from './capacity'

const controls = {
  workers: { label: 'Puma ワーカー数', min: 1, max: 6, step: 1 },
  threads: { label: 'ワーカーあたりのスレッド数', min: 1, max: 12, step: 1 },
  arrivals: { label: '到着するリクエスト数', min: 4, max: 100, step: 1 },
  io: { label: '1件の処理に占める I/O の割合（%）', min: 0, max: 90, step: 10 },
  pool: { label: 'ワーカーあたりの接続プールの上限', min: 1, max: 12, step: 1 },
  dbLimit: { label: 'このアプリに割り当てる DB 接続の上限', min: 1, max: 48, step: 1 },
} satisfies Record<keyof Capacity, { label: string; min: number; max: number; step: number }>

const initial = { workers: 2, threads: 6, arrivals: 32, io: 80, pool: 2, dbLimit: 24 }

export function RequestCapacity({ poolOnly = false }: { poolOnly?: boolean }) {
  const [settings, setSettings] = useState<Capacity>(initial)
  const id = useId()
  const result = simulateCapacity(settings)
  return (
    <StudyFigure title={poolOnly ? '接続プールの上限を変える' : 'リクエストの待ち時間を比べる'} caption="学習用のモデルです。各要求は CPU 処理と DB 待ちを1回ずつ行い、応答時間は待ち時間を含みます。各ワーカーでは一度に1本のスレッドだけが CPU 処理を進め（GVL）、待っている要求は処理中の件数が最も少ないワーカーに渡します。そのため I/O の割合が 0% なら、スレッドを増やしても p95 は変わりません。接続の上限に達するとモデルではプールで待たせますが、実際には MySQL が新規接続を拒否することがあります。GC・ソケット・他のプロセス・DB 自体の実行待ちも省いています。">
      <div className="sim-controls">
        {(Object.keys(controls) as (keyof Capacity)[]).filter((key) => !poolOnly || key === 'pool' || key === 'dbLimit').map((key) => {
          const { label, ...range } = controls[key]
          return <label key={key} htmlFor={id + key}>
            <span>{label} <output>{settings[key]}</output></span>
            <input id={id + key} type="range" {...range} value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.valueAsNumber })} />
          </label>
        })}
      </div>
      {poolOnly && <p>ワーカー2個、各6スレッド。32件が8件ずつ到着し、処理時間の80%を DB の応答待ちに使う想定です。</p>}
      <FigureFacts facts={[
        { label: '実行枠を待った最大件数', value: result.maxQueue },
        { label: '接続を待った最大件数', value: result.maxCheckout },
        { label: '応答時間の p95（成功分）', value: result.p95 === undefined ? '成功なし' : `${result.p95} ms` },
        { label: '接続待ちの期限を超えた件数', value: result.timeouts },
      ]} />
      <p>この図では接続待ちが120 msに達すると、Active Record の <code>ConnectionTimeoutError</code> に相当する失敗として数えます。</p>
      <details>
        <summary>待ち件数の推移</summary>
        <div className="table-wrap">
          <table>
            <thead><tr><th>経過時間</th><th>実行枠の待ち</th><th>接続の待ち</th><th>接続を使用中</th></tr></thead>
            <tbody>{result.timeline.map(({ time, queued, checkout, using }) => (
              <tr key={time}><th scope="row">{time} ms</th><td>{queued}</td><td>{checkout}</td><td>{using}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </details>
    </StudyFigure>
  )
}
