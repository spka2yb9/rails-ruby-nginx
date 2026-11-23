import { useEffect, useState } from 'react'
import { chapterLabel, chapters } from '../content/chapters'
import { BOOK_TITLE, type Source } from '../content/types'
import { hrefFor } from '../utils/route'

/** 全章の参考資料を章ごとにまとめた一覧。 */
export function SourcesPage() {
  const [sources, setSources] = useState<Map<number, Source[]> | null>(null)
  useEffect(() => {
    document.title = `参考資料の一覧 | ${BOOK_TITLE}`
    scrollTo(0, 0)
    // 出典の一覧は大きいので、このページを開いたときに読み込む
    import('../content/sources-index.json').then((m) =>
      setSources(new Map((m.default as { number: number; sources: Source[] }[]).map((e) => [e.number, e.sources]))),
    )
  }, [])
  return (
    <article className="chapter">
      <header className="chapter-head">
        <h1>参考資料の一覧</h1>
        <p className="chapter-summary">各章で参照した資料を、章ごとにまとめています。参照日は筆者がその資料を確認した日で、資料側の更新日ではありません。</p>
      </header>
      {sources &&
        chapters.map((c) => (
          <section key={c.number} className="sources" aria-labelledby={`srcs-${c.number}`}>
            <h2 id={`srcs-${c.number}`}>
              <a href={hrefFor(c.number)}>
                {chapterLabel(c)} {c.title}
              </a>
            </h2>
            <ol>
              {(sources.get(c.number) ?? []).map((s, i) => (
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
