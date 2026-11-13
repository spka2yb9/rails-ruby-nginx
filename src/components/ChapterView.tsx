import { useEffect, useState } from 'react'
import { APPENDIX_START, chapterByNumber, chapterLabel, chapters, labelFor, loadChapter, type ChapterMeta } from '../content/chapters'
import { PARTS, type Chapter } from '../content/types'
import { hrefFor } from '../utils/route'
import { SourceList } from './content'

export function ChapterView({ chapter, section, restoreY }: { chapter: ChapterMeta; section: string | null; restoreY: number | null }) {
  const [loaded, setLoaded] = useState<{ n: number; full?: Chapter; failed?: boolean } | null>(null)
  useEffect(() => {
    let live = true
    loadChapter(chapter.number).then(
      (full) => live && setLoaded({ n: chapter.number, full }),
      () => live && setLoaded({ n: chapter.number, failed: true }),
    )
    return () => {
      live = false
    }
  }, [chapter.number])
  const state = loaded?.n === chapter.number ? loaded : null
  const full = state?.full

  const idx = chapters.indexOf(chapter)
  const prev = chapters[idx - 1]
  const next = chapters[idx + 1]
  const part = PARTS.find((p) => p.number === chapter.part)

  // 節へのハッシュ遷移では固定ヘッダー分を CSS の scroll-margin で避ける
  useEffect(() => {
    if (restoreY != null) {
      scrollTo(0, restoreY) // 前回の読書位置へ復帰
    } else if (section) {
      document.getElementById(section)?.scrollIntoView()
    } else {
      scrollTo(0, 0)
    }
  }, [chapter.number, section, restoreY, full])

  useEffect(() => {
    document.title = `${chapterLabel(chapter)} ${chapter.title} | Rails・Ruby・Nginx 教科書`
  }, [chapter])

  return (
    <article className="chapter">
      <header className="chapter-head">
        <p className="chapter-part">{chapter.part === 6 ? part?.title : `第${chapter.part}部 ${part?.title}`}</p>
        <h1>
          <span className="chapter-num">{chapterLabel(chapter)}</span> {chapter.title}
        </h1>
        <p className="chapter-summary">{chapter.summary}</p>
        <div className="chapter-goals">
          <h2 id="goals">{chapter.number >= APPENDIX_START ? 'この付録で学ぶこと' : 'この章で学ぶこと'}</h2>
          <ul>
            {chapter.goals.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
          {chapter.prerequisites.length > 0 && (
            <p className="chapter-prereq">
              前提：
              {chapter.prerequisites.map((n, i) => {
                const c = chapterByNumber.get(n)
                return (
                  <span key={n}>
                    {i > 0 && '、'}
                    <a href={hrefFor(n)}>
                      {labelFor(n)}{c ? ` ${c.title}` : ''}
                    </a>
                  </span>
                )
              })}
            </p>
          )}
        </div>
      </header>

      {state?.failed && (
        <p className="chapter-loading">
          本文を読み込めませんでした。<a href={hrefFor(chapter.number)} onClick={() => location.reload()}>ページを再読み込み</a>してください。
        </p>
      )}
      {!state && <p className="chapter-loading">本文を読み込んでいます</p>}
      {full?.sections.map((s) => (
        <section key={s.id} id={s.id} className="section" aria-labelledby={`${s.id}-h`}>
          <h2 id={`${s.id}-h`}>
            <a className="anchor" href={hrefFor(chapter.number, s.id)}>
              {s.title}
            </a>
          </h2>
          {s.body}
        </section>
      ))}

      {full && <SourceList sources={chapter.sources} />}

      <nav className="prev-next" aria-label="前後の章">
        {prev ? (
          <a className="prev" href={hrefFor(prev.number)}>
            <span className="pn-label">前の章</span>
            {chapterLabel(prev)} {prev.title}
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a className="next" href={hrefFor(next.number)}>
            <span className="pn-label">次の章</span>
            {chapterLabel(next)} {next.title}
          </a>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
