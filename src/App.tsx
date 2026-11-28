import { useEffect, useState } from 'react'
import { ChapterView } from './components/ChapterView'
import { Home } from './components/Home'
import { LinuxView } from './components/LinuxView'
import { SourcesPage } from './components/SourcesPage'
import { SearchDialog } from './components/Search'
import { CourseView } from './components/CourseView'
import { CourseMenu } from './components/CourseMenu'
import { SystemMap } from './components/SystemMap'
import { chapterByNumber, chapterLabel, chapters } from './content/chapters'
import { courseById, courseHref, courses } from './content/courses'
import { mapHref, stops, systemFlows } from './content/system-map'
import { APPENDIX_PART, BOOK_TITLE, PARTS } from './content/types'
import { loadCourseId, loadPosition, saveCourseId, savePosition, type Position } from './utils/readingPosition'
import { hrefFor, useRoute } from './utils/route'

export default function App() {
  const route = useRoute()
  // スマホの目次は、開いたときの表示位置にいる間だけ開いておく（移動すると閉じる）
  const routeKey = `${route.chapter}|${route.section}|${route.sources}|${route.linux}|${route.course}|${route.map}`
  const [navOpenAt, setNavOpenAt] = useState<string | null>(null)
  const navOpen = navOpenAt === routeKey
  const [searchOpen, setSearchOpen] = useState(false)
  const chapter = route.chapter != null ? chapterByNumber.get(route.chapter) : undefined
  const course = route.course ? courseById.get(route.course) : undefined
  // 左メニューは、URL にコースが無いときも最後に選んだコースを表示する。第6部ではサーバ運用コースを表示する
  const menuCourse = route.linux != null ? courseById.get('server-ops') : course ?? courseById.get(loadCourseId() ?? '')
  const courseStep = course && chapter ? course.steps.find((step) => step.chapter === chapter.number) : undefined
  const part = chapter && PARTS.find((part) => part.number === chapter.part)
  const currentSection = chapter?.sections.find((section) => section.id === route.section)
  const systemStops = stops.filter((stop) => stop.chapter === chapter?.number)
  const relatedFlows = systemFlows.filter((flow) => flow.steps.some(([id, , more]) => more?.[0] === chapter?.number || systemStops.some((stop) => stop.id === id)))

  // 初回アクセス時、ハッシュが無ければ前回の読書位置へ戻す
  const [restoreTarget] = useState<Position | null>(() => {
    const pos = loadPosition()
    return !location.hash && pos?.hash ? pos : null
  })
  useEffect(() => {
    if (restoreTarget) location.hash = restoreTarget.hash
  }, [restoreTarget])
  // 復帰先の章を表示している間だけ、保存したスクロール位置を渡す
  const restoreY = restoreTarget && location.hash === restoreTarget.hash ? restoreTarget.scrollY : null

  // 読書位置の保存（スクロール停止後）
  useEffect(() => {
    let t: number | undefined
    const onScroll = () => {
      clearTimeout(t)
      t = setTimeout(() => savePosition({ hash: location.hash, scrollY: scrollY }), 300)
    }
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      removeEventListener('scroll', onScroll)
      clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (menuCourse && (course || route.linux != null)) saveCourseId(menuCourse.id)
  }, [menuCourse, course, route.linux])

  // ハッシュ遷移時にも保存する
  useEffect(() => {
    savePosition({ hash: location.hash, scrollY: 0 })
  }, [routeKey])

  // キーボード: / または Ctrl/Cmd+K で検索
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target
      // SQL の実行欄（textarea）などで / を入力しても検索を開かない
      const typing =
        (t instanceof HTMLInputElement && t.type !== 'radio') ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement ||
        (t instanceof HTMLElement && t.isContentEditable)
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={`app ${navOpen ? 'nav-open' : ''} ${route.linux != null ? 'linux-mode' : ''}`}>
      <a className="skip" href="#main" onClick={(event) => {
        event.preventDefault()
        document.getElementById('main')?.focus()
      }}>
        本文へ移動
      </a>
      <header className="topbar">
        <button className="icon-btn nav-toggle" aria-label="コースを開閉" aria-expanded={navOpen} onClick={() => setNavOpenAt((o) => (o === routeKey ? null : routeKey))}>
          ☰
        </button>
        <a className="brand" href="#/">
          {BOOK_TITLE}
        </a>
        {chapter && part && (
          <nav className="breadcrumbs" aria-label="現在の位置">
            <span className="breadcrumb-part">{part.number === APPENDIX_PART ? part.title : `第${part.number}部 ${part.title}`}</span>
            <span aria-hidden="true">›</span>
            <a href={hrefFor(chapter.number, undefined, courseStep ? course?.id : undefined)}>{chapterLabel(chapter)} {chapter.title}</a>
            {currentSection && <><span aria-hidden="true">›</span><span aria-current="location">{currentSection.title}</span></>}
          </nav>
        )}
        <button className="search-btn" aria-label="教科書を検索" onClick={() => setSearchOpen(true)} aria-keyshortcuts="Control+K /">
          <span>検索</span>
          <kbd>/</kbd>
        </button>
      </header>

      <nav className="sidebar course-sidebar" aria-label="コース">
        <CourseMenu course={menuCourse} chapter={chapter?.number} section={route.section} exercise={route.linux} />
      </nav>
      <div className="sidebar-backdrop" onClick={() => setNavOpenAt(null)} />

      <main id="main" className="main" tabIndex={-1}>
        {route.linux != null ? (
          <LinuxView caseId={route.linux} />
        ) : route.sources ? (
          <SourcesPage />
        ) : route.map != null ? (
          <SystemMap flowId={route.map} />
        ) : route.course != null && route.chapter == null ? (
          <CourseView id={route.course} />
        ) : route.chapter == null ? (
          <Home />
        ) : chapter ? (
          <ChapterView chapter={chapter} section={route.section} restoreY={restoreY} courseId={courseStep ? course?.id : undefined} />
        ) : (
          <article className="chapter">
            <h1>章が見つかりません</h1>
            <p>
              <a href="#/">コース一覧へ戻る</a>
            </p>
          </article>
        )}
      </main>

      {chapter && (
        <aside className="outline" aria-label="ページ内見出し">
          <div className="outline-title">
            {chapterLabel(chapter)}の見出し
          </div>
          <ol>
            {chapter.sections.map((s) => (
              <li key={s.id}>
                <a href={hrefFor(chapter.number, s.id, courseStep ? course?.id : undefined)} aria-current={route.section === s.id ? 'location' : undefined}>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
          <div className="outline-title outline-group">関連する知識</div>
          {chapter.prerequisites.length > 0 && <><p>前提の章</p><ol>{chapter.prerequisites.map((id) => (
            <li key={id}><a href={hrefFor(id)}>{chapterLabel({ number: id })} {chapterByNumber.get(id)?.title}</a></li>
          ))}</ol></>}
          {chapters.some((item) => item.prerequisites.includes(chapter.number)) && <details className="outline-group">
            <summary>この章を前提にする章</summary>
            <ol>{chapters.filter((item) => item.prerequisites.includes(chapter.number)).map((item) => (
              <li key={item.number}><a href={hrefFor(item.number)}>{chapterLabel(item)} {item.title}</a></li>
            ))}</ol>
          </details>}
          {courses.filter((item) => item.steps.some((step) => step.chapter === chapter.number)).map((item) => (
            <details key={item.id} className="outline-group">
              <summary>{item.title}</summary>
              <p>{item.steps.find((step) => step.chapter === chapter.number)?.reason}</p>
              <a href={courseHref(item.id)}>学習順序を見る</a>
            </details>
          ))}
          {relatedFlows.length > 0 && <details className="outline-group">
            <summary>システム全体図</summary>
            <ol>{relatedFlows.map((flow) => <li key={flow.id}><a href={mapHref(flow.id)}>{flow.title}</a></li>)}</ol>
          </details>}
        </aside>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

