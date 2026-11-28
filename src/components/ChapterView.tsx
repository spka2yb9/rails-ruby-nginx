import { useEffect, useState } from 'react'
import { APPENDIX_ID, chapterByNumber, chapterLabel, chapters, labelFor, loadChapter, type ChapterMeta } from '../content/chapters'
import { APPENDIX_PART, BOOK_TITLE, PARTS, type Chapter } from '../content/types'
import { hrefFor } from '../utils/route'
import { courseById, courseHref } from '../content/courses'
import { ReadingSections } from './CourseView'
import { StudyFigures } from '../sims/chapter-figures'

export function ChapterView({ chapter, section, restoreY, courseId }: { chapter: ChapterMeta; section: string | null; restoreY: number | null; courseId?: string }) {
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

  const course = courseId ? courseById.get(courseId) : undefined
  const courseIndex = course?.steps.findIndex((step) => step.chapter === chapter.number) ?? -1
  const step = course?.steps[courseIndex]
  const position = chapters.indexOf(chapter)
  const prevStep = course?.steps[courseIndex - 1]
  const nextStep = course?.steps[courseIndex + 1]
  const prev = course ? (prevStep && chapterByNumber.get(prevStep.chapter)) : chapters[position - 1]
  const next = course ? (nextStep && chapterByNumber.get(nextStep.chapter)) : chapters[position + 1]
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
    document.title = `${chapterLabel(chapter)} ${chapter.title} | ${BOOK_TITLE}`
  }, [chapter])

  return (
    <article className="chapter">
      <header className="chapter-head">
        <p className="chapter-part">{chapter.part === APPENDIX_PART ? part?.title : `第${chapter.part}部 ${part?.title}`}</p>
        <h1>
          <span className="chapter-num">{chapterLabel(chapter)}</span> {chapter.title}
        </h1>
        <p className="chapter-summary">{chapter.summary}</p>
        {course && step && <section className="course-context">
          <h2><a href={courseHref(course.id)}>{course.title}</a> <span>{courseIndex + 1} / {course.steps.length}</span></h2>
          <p>{step.reason}{step.optional && '（選択）'}</p>
          <ReadingSections step={step} course={course.id} />
        </section>}
        <div className="chapter-goals">
          <h2 id="goals">{chapter.number === APPENDIX_ID ? 'この付録で学ぶこと' : 'この章で学ぶこと'}</h2>
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
            <a className="anchor" href={hrefFor(chapter.number, s.id, courseId)}>
              {s.title}
            </a>
          </h2>
          {s.body}
          <StudyFigures chapter={chapter.number} section={s.id} />
        </section>
      ))}

      <nav className="prev-next" aria-label={course ? 'コース内の前後の章' : '前後の章'}>
        {prev ? (
          <a className="prev" href={hrefFor(prev.number, undefined, courseId)}>
            <span className="pn-label">前の章</span>
            {chapterLabel(prev)} {prev.title}
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a className="next" href={hrefFor(next.number, undefined, courseId)}>
            <span className="pn-label">次の章</span>
            {chapterLabel(next)} {next.title}
          </a>
        ) : course?.practice ? (
          <a className="next" href={courseHref('server-ops')}><span className="pn-label">演習のコース</span>サーバ運用</a>
        ) : <span />}
      </nav>
    </article>
  )
}
