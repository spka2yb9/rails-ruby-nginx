import { useEffect } from 'react'
import { chapterByNumber, chapterLabel } from '../content/chapters'
import { courseById, courseGroups, courseHref, courses, type CourseStep } from '../content/courses'
import { exerciseCount, linuxGroups, linuxHref } from '../content/linux'
import { BOOK_TITLE } from '../content/types'
import { hrefFor } from '../utils/route'

export function CourseList({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={compact ? 'course-nav-list nav-chapters' : 'course-list'}>
      {courses.map((course) => (
        <li key={course.id}>
          <a href={courseHref(course.id)}>
            <span>{course.title}</span>
            {compact && <span className="course-menu-count">{course.exercises ? `${exerciseCount}件` : `${course.steps.length}章`}</span>}
          </a>
          {!compact && <p>{course.purpose}</p>}
        </li>
      ))}
    </ul>
  )
}

export function ReadingSections({ step, course, currentSection }: { step: CourseStep; course: string; currentSection?: string | null }) {
  const chapter = chapterByNumber.get(step.chapter)
  return step.sections?.length ? (
    <ul className="reading-sections">
      {step.sections.map((id) => (
        <li key={id}><a href={hrefFor(step.chapter, id, course)} aria-current={currentSection === id ? 'location' : undefined}>{chapter?.sections.find((section) => section.id === id)?.title ?? id}</a></li>
      ))}
    </ul>
  ) : null
}

export function CourseView({ id }: { id: string }) {
  const course = courseById.get(id)
  useEffect(() => {
    document.title = `${course?.title ?? '学習コース'} | ${BOOK_TITLE}`
    scrollTo(0, 0)
  }, [course])
  if (!course) return <article className="chapter"><h1>コースが見つかりません</h1><CourseList /></article>

  return (
    <article className="chapter">
      <header className="chapter-head">
        <h1>{course.title}</h1>
        <p className="chapter-summary">{course.purpose}</p>
      </header>
      <dl className="course-facts">
        <dt>対象者</dt><dd>{course.audience}</dd>
        <dt>前提知識</dt><dd>{course.prerequisites}</dd>
        <dt>到達目標</dt><dd>{course.outcome}</dd>
        <dt>関連コース</dt>
        <dd><ul className="inline-links">{course.related.map((related) => <li key={related}><a href={courseHref(related)}>{courseById.get(related)?.title}</a></li>)}</ul></dd>
      </dl>
      {course.exercises ? (
        <section className="section">
          <h2>演習の順序</h2>
          <p><a href={linuxHref()}>続きの演習を開く</a>（まだ回答していない最初の演習が開きます）</p>
          {linuxGroups.map((group) => (
            <div key={group.name}>
              <h3>{group.name}</h3>
              <ol className="course-steps">
                {group.cases.map((item) => (
                  <li key={item.id}>
                    <a href={linuxHref(item.id)}>{item.intro ?? item.title}</a>
                    <p>{item.learn}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      ) : (
        <>
        <section className="section course-examples">
          <h2>動かして確かめる例</h2>
          <ul>
            {course.examples.map((example) => (
              <li key={example.chapter}><a href={hrefFor(example.chapter, example.section, id)}>{example.title}</a></li>
            ))}
          </ul>
        </section>
        <section className="section">
          <h2>推奨する学習順序</h2>
          {courseGroups(course).map((group) => (
            <div key={group.chapter}>
              <h3>{group.title}</h3>
              <ol className="course-steps" start={group.start + 1}>
                {group.steps.map((step) => {
                  const chapter = chapterByNumber.get(step.chapter)
                  if (!chapter) return null
                  return (
                    <li key={step.chapter}>
                      <a href={hrefFor(step.chapter, undefined, id)}>{chapterLabel(chapter)} {chapter.title}</a>
                      {step.optional && <small> 選択</small>}
                      <p>{step.reason}</p>
                      <ReadingSections step={step} course={id} />
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
          {course.practice && <p><a href={courseHref('server-ops')}>サーバ運用コースの演習へ</a></p>}
        </section>
        </>
      )}
    </article>
  )
}
