import { useEffect } from 'react'
import { chapterLabel, chapters } from '../content/chapters'
import { hrefFor } from '../utils/route'

/** 全章の参考資料を章ごとにまとめた一覧。 */
export function SourcesPage() {
  useEffect(() => {
    document.title = '参考資料の一覧 | Rails・Ruby・Nginx 教科書'
    scrollTo(0, 0)
  }, [])
  return (
    <article className="chapter">
      <header className="chapter-head">
        <h1>参考資料の一覧</h1>
        <p className="chapter-summary">各章の末尾に載せた参考資料を、章ごとにまとめています。参照日は筆者がその資料を確認した日で、資料側の更新日ではありません。</p>
      </header>
      {chapters.map((c) => (
        <section key={c.number} className="sources" aria-labelledby={`srcs-${c.number}`}>
          <h2 id={`srcs-${c.number}`}>
            <a href={hrefFor(c.number)}>
              {chapterLabel(c)} {c.title}
            </a>
          </h2>
          <ol>
            {c.sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
                、{s.publisher}
                {s.version && `、${s.version}`}。参照日 {s.accessed}。
              </li>
            ))}
          </ol>
        </section>
      ))}
    </article>
  )
}
