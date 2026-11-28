import { useEffect, useState } from 'react'
import { stops, systemFlows, mapHref } from '../content/system-map'
import { BOOK_TITLE } from '../content/types'
import { hrefFor } from '../utils/route'
import { chapterByNumber } from '../content/chapters'
import { labelFor } from '../content/label'
import { Stepper } from '../sims/Stepper'

export function SystemMap({ flowId }: { flowId: string }) {
  const flow = systemFlows.find((item) => item.id === flowId) ?? systemFlows[0]
  useEffect(() => {
    document.title = `システム全体図 | ${BOOK_TITLE}`
    scrollTo(0, 0)
  }, [])
  return <MapContent key={flow.id} flow={flow} />
}

function MapContent({ flow }: { flow: typeof systemFlows[number] }) {
  const [index, setIndex] = useState(0)
  const activeStop = flow.steps[index][0]
  return (
    <article className="chapter map-page">
      <header className="chapter-head">
        <h1>システム全体図</h1>
        <p className="chapter-summary">リクエスト、起動、ジョブ、配備で使う構成要素をまとめています。処理を選ぶと、関わる要素を順にたどれます。</p>
      </header>
      <section className="section">
        <h2>ブラウザーから DB までの構成</h2>
        <div className="map-topology">
          {([['接続先を決める', 'browser', 'dns', 'transport', 'tls'], ['転送と実行環境', 'lb', 'nginx', 'puma', 'linux', 'container'], ['Rails で処理する', 'boot', 'loader', 'rack', 'router', 'controller', 'view', 'ar'], ['データと非同期処理', 'pool', 'mysql', 'cache', 'redis', 'job', 'release']] as const).map(([label, ...ids]) => (
            <section key={label} className="map-layer">
              <h3>{label}</h3>
              <ul>{ids.map((id) => {
                const stop = stops.find((stop) => stop.id === id)!
                return <li key={id} data-active={id === activeStop || undefined}><a href={hrefFor(stop.chapter, 'section' in stop ? stop.section : undefined)}>{stop.label}</a></li>
              })}</ul>
            </section>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>処理の順序</h2>
        <ul className="flow-choices" aria-label="たどる処理">
          {systemFlows.map((item) => <li key={item.id}><a aria-current={flow.id === item.id ? 'page' : undefined} href={mapHref(item.id)}>{item.title}</a></li>)}
        </ul>
        <h3>{flow.title}</h3>
        <Stepper onStepChange={setIndex} steps={flow.steps.map(([id, detail, more]) => {
          const stop = stops.find((item) => item.id === id)!
          const moreTitle = more && chapterByNumber.get(more[0])?.sections.find((item) => item.id === more[1])?.title
          return {
            label: stop.label,
            detail: <>
              <p>{detail}</p>
              {more
                ? <a href={hrefFor(more[0], more[1])}>{labelFor(more[0])}「{moreTitle ?? more[1]}」で詳しく読む</a>
                : <a href={hrefFor(stop.chapter, 'section' in stop ? stop.section : undefined)}>{stop.label} の解説を読む</a>}
            </>,
          }
        })} />
        <p className="map-note">HTTP は TCP 上の HTTPS を例にしています。接続の再利用、DNS キャッシュ、プロキシの台数、応答が戻る途中の処理は、選んだ経路に関係する部分だけ示しています。</p>
      </section>
    </article>
  )
}
