import { useEffect, useId, useRef } from 'react'
import { chapterByNumber, chapterLabel, chapterNumber } from '../content/chapters'
import { courseGroups, courseHref, courses, type Course, type CourseStep } from '../content/courses'
import { exerciseCount, linuxGroups, linuxHref } from '../content/linux'
import { hrefFor } from '../utils/route'
import { CourseList } from './CourseView'

/**
 * 左のメニュー。選んだコースの章（サーバ運用コースでは第6部の演習）を、コースのグループごとに並べる。
 * exercise は第6部を表示しているときの演習の ID（入口は空文字）。それ以外は null。
 */
export function CourseMenu({ course, chapter, section, exercise }: {
  course?: Course
  chapter?: number
  section: string | null
  exercise: string | null
}) {
  const pickerId = useId()
  const list = useRef<HTMLDivElement>(null)
  const courseId = course?.id

  useEffect(() => {
    const menu = list.current
    if (!menu) return
    if (chapter == null && !exercise) {
      menu.scrollTop = 0
      return
    }
    const current = menu.querySelector<HTMLElement>('a[aria-current="page"]')
    const group = (menu.querySelector<HTMLElement>('a[aria-current="location"]') ?? current)?.closest('details')
    if (group) group.open = true
    const active = menu.querySelector<HTMLElement>('a[aria-current="location"]') ?? current
    if (!active) return
    const { top, bottom } = active.getBoundingClientRect()
    const bounds = menu.getBoundingClientRect()
    if (top < bounds.top || bottom > bounds.bottom) {
      menu.scrollTop += top - bounds.top - menu.clientHeight / 3
    }
  }, [courseId, chapter, section, exercise])

  return (
    <>
      <div className="course-menu-head">
        {course ? (
          <>
            <label htmlFor={pickerId}>学習コース</label>
            <select id={pickerId} value={course.id} onChange={(event) => { location.hash = courseHref(event.target.value) }}>
              {courses.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
            <div className="course-menu-meta">
              <a className="course-menu-overview" href={courseHref(course.id)} aria-current={chapter == null && exercise == null ? 'page' : undefined}>コース概要</a>
              <span className="course-menu-position">{course.exercises ? exercisePosition(exercise) : chapterPosition(course, chapter)}</span>
            </div>
          </>
        ) : <h2>学習コース</h2>}
      </div>

      <div className="course-menu-list" ref={list}>
        {!course ? <CourseList compact /> : course.exercises ? <ExerciseGroups exercise={exercise} /> : <ChapterGroups course={course} chapter={chapter} section={section} />}
      </div>
    </>
  )
}

function chapterPosition(course: Course, chapter?: number): string {
  const index = chapter == null ? -1 : course.steps.findIndex((step) => step.chapter === chapter)
  return index >= 0 ? `${course.steps.length}章中 ${index + 1}番目` : `全${course.steps.length}章`
}

const exerciseIds = linuxGroups.flatMap((group) => group.cases.map((item) => item.id))

function exercisePosition(exercise: string | null): string {
  const index = exercise ? exerciseIds.indexOf(exercise) : -1
  return index >= 0 ? `${exerciseCount}件中 ${index + 1}件目` : `全${exerciseCount}件`
}

function ChapterGroups({ course, chapter, section }: { course: Course; chapter?: number; section: string | null }) {
  const groups = courseGroups(course)
  const inCourse = chapter != null && course.steps.some((step) => step.chapter === chapter)
  // 表示中の章がこのコースに無いときは、その章を含むコースへ案内する
  const otherCourses = chapter != null && !inCourse
    ? courses.flatMap((item) => {
      const index = item.steps.findIndex((step) => step.chapter === chapter)
      return index < 0 ? [] : [{ course: item, index }]
    })
    : []
  const currentGroup = groups.find((group) => group.steps.some((step) => step.chapter === chapter))?.chapter ?? groups[0]?.chapter
  return (
    <>
      {chapter != null && !inCourse && (
        <div className="course-menu-notice">
          <p>表示中の{chapterLabel({ number: chapter })}はこのコースの学習順序に含まれていません。</p>
          {otherCourses.length > 0 && (
            <>
              <p>この章を含むコース</p>
              <ul>
                {otherCourses.map(({ course: item, index }) => (
                  <li key={item.id}>
                    <a href={hrefFor(chapter, section ?? undefined, item.id)}>
                      <span>{item.title}</span>
                      <span className="course-menu-count">{index + 1} / {item.steps.length}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      {groups.map((group) => (
        <details key={`${course.id}:${group.chapter}`} className="course-menu-group" open={group.chapter === currentGroup}>
          <summary>
            <span>{group.title}</span>
            <span className="course-menu-count">{group.steps.length}章</span>
          </summary>
          <ol className="nav-chapters">
            {group.steps.map((step) => {
              const target = chapterByNumber.get(step.chapter)
              if (!target) return null
              const current = chapter === target.number
              return (
                <li key={step.chapter}>
                  <a href={hrefFor(step.chapter, undefined, course.id)} aria-current={current ? 'page' : undefined}>
                    <span className="nav-num">{chapterNumber(step.chapter)}</span>
                    <span>{target.title}{step.optional && <small className="course-menu-optional">選択</small>}</span>
                  </a>
                  {current && <ChapterSections step={step} course={course.id} currentSection={section} />}
                </li>
              )
            })}
          </ol>
        </details>
      ))}
      {course.practice && <a className="course-menu-practice" href={courseHref('server-ops')}>サーバ運用コースの演習へ</a>}
    </>
  )
}

/** サーバ運用コース：第6部の演習を、入門コースとテーマごとのグループで並べる（並びは public/linux の実習ページと同じ）。 */
function ExerciseGroups({ exercise }: { exercise: string | null }) {
  const currentGroup = linuxGroups.find((group) => group.cases.some((item) => item.id === exercise))?.name ?? linuxGroups[0]?.name
  return (
    <>
      <ol className="nav-chapters course-menu-start">
        <li>
          <a href={linuxHref()} aria-current={exercise === '' ? 'page' : undefined}>
            <span>続きの演習を開く</span>
          </a>
        </li>
      </ol>
      {linuxGroups.map((group) => (
        <details key={group.name} className="course-menu-group" name="exercise-groups" open={group.name === currentGroup}>
          <summary>
            <span>{group.name}</span>
            <span className="course-menu-count">{group.cases.length}件</span>
          </summary>
          <ol className="nav-chapters">
            {group.cases.map((item) => (
              <li key={item.id}>
                <a href={linuxHref(item.id)} aria-current={exercise === item.id ? 'location' : undefined}>
                  <span>{item.intro ?? item.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </details>
      ))}
    </>
  )
}

/** 表示中の章の全節。コースで読む節を指定している場合は、その節を強調する。 */
function ChapterSections({ step, course, currentSection }: { step: CourseStep; course: string; currentSection: string | null }) {
  const sections = chapterByNumber.get(step.chapter)?.sections ?? []
  const reading = new Set(step.sections)
  return (
    <>
      {reading.size > 0 && <p className="course-menu-legend">太字はこのコースで読む節</p>}
      <ul className="reading-sections">
        {sections.map((item) => (
          <li key={item.id} className={reading.has(item.id) ? 'is-reading' : undefined}>
            <a href={hrefFor(step.chapter, item.id, course)} aria-current={currentSection === item.id ? 'location' : undefined}>{item.title}</a>
          </li>
        ))}
      </ul>
    </>
  )
}
