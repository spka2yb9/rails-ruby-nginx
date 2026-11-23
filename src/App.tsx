import { useEffect, useRef, useState } from 'react'
import { ChapterView } from './components/ChapterView'
import { Home } from './components/Home'
import { LinuxView } from './components/LinuxView'
import { SourcesPage } from './components/SourcesPage'
import { SearchDialog } from './components/Search'
import { APPENDIX_ID, chapterNumber, chapterByNumber, chapterLabel, chapters } from './content/chapters'
import { LINUX_PART, linuxGroups, linuxHref } from './content/linux'
import { APPENDIX_PART, BOOK_TITLE, PARTS } from './content/types'
import { loadPosition, savePosition, type Position } from './utils/readingPosition'
import { hrefFor, useRoute } from './utils/route'

export default function App() {
  const route = useRoute()
  // スマホの目次は、開いたときの表示位置にいる間だけ開いておく（移動すると閉じる）
  const routeKey = `${route.chapter}|${route.section}|${route.sources}|${route.linux}`
  const [navOpenAt, setNavOpenAt] = useState<string | null>(null)
  const navOpen = navOpenAt === routeKey
  const [searchOpen, setSearchOpen] = useState(false)
  const sidebar = useRef<HTMLElement>(null)

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

  // ハッシュ遷移時にも保存する
  useEffect(() => {
    savePosition({ hash: location.hash, scrollY: 0 })
  }, [route.chapter, route.section, route.sources, route.linux])

  // 途中の演習を直接開いた場合も、同じ目次の中で現在の演習が見えるようにする。
  useEffect(() => {
    if (!route.linux) return
    const nav = sidebar.current
    const link = nav?.querySelector<HTMLElement>('a[aria-current="location"]')
    if (!nav || !link) return
    const group = link.closest('details')
    if (group) group.open = true
    const item = link.getBoundingClientRect()
    const bounds = nav.getBoundingClientRect()
    if (item.top < bounds.top || item.bottom > bounds.bottom) {
      nav.scrollTop += item.top - bounds.top - nav.clientHeight / 3
    }
  }, [route.linux])

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

  const chapter = route.chapter != null ? chapterByNumber.get(route.chapter) : undefined

  return (
    <div className={`app ${navOpen ? 'nav-open' : ''} ${route.linux != null ? 'linux-mode' : ''}`}>
      <a className="skip" href="#main" onClick={(event) => {
        event.preventDefault()
        document.getElementById('main')?.focus()
      }}>
        本文へ移動
      </a>
      <header className="topbar">
        <button className="icon-btn nav-toggle" aria-label="目次を開閉" aria-expanded={navOpen} onClick={() => setNavOpenAt((o) => (o === routeKey ? null : routeKey))}>
          ☰
        </button>
        <a className="brand" href="#/">
          {BOOK_TITLE}
        </a>
        <button className="search-btn" aria-label="教科書を検索" onClick={() => setSearchOpen(true)} aria-keyshortcuts="Control+K /">
          <span>検索</span>
          <kbd>/</kbd>
        </button>
      </header>

      <nav ref={sidebar} className="sidebar" aria-label="目次">
        <ol className="nav-parts">
          {PARTS.map((p) => (
            <li key={p.number}>
              <div className="nav-part">{p.number === APPENDIX_PART ? p.title : `第${p.number}部 ${p.title}`}</div>
              <ol className="nav-chapters">
                {p.number === LINUX_PART && (
                  <li>
                    <a href={linuxHref()} aria-current={route.linux === '' ? 'page' : undefined}>
                      <span className="nav-num" />
                      第6部の演習を開く
                    </a>
                  </li>
                )}
                {p.number === LINUX_PART &&
                  linuxGroups.map((group) => (
                    <li key={group.name}>
                      <details className="nav-exercises" name="exercise-groups">
                        <summary>{group.name}</summary>
                        <ol className="nav-sections">
                          {group.cases.map((c) => (
                            <li key={c.id}>
                              <a href={linuxHref(c.id)} aria-current={route.linux === c.id ? 'location' : undefined}>
                                {c.intro ?? c.title}
                              </a>
                            </li>
                          ))}
                        </ol>
                      </details>
                    </li>
                  ))}
                {chapters
                  .filter((c) => c.part === p.number)
                  .map((c) => (
                    <li key={c.number}>
                      <a href={hrefFor(c.number)} aria-current={c === chapter ? 'page' : undefined}>
                        <span className="nav-num">{c.number === APPENDIX_ID ? '付' : chapterNumber(c.number)}</span>
                        {c.title}
                      </a>
                      {c === chapter && (
                        <ol className="nav-sections">
                          {c.sections.map((s) => (
                            <li key={s.id}>
                              <a href={hrefFor(c.number, s.id)} aria-current={route.section === s.id ? 'location' : undefined}>
                                {s.title}
                              </a>
                            </li>
                          ))}
                        </ol>
                      )}
                    </li>
                  ))}
              </ol>
            </li>
          ))}
          <li>
            <ol className="nav-chapters">
              <li>
                <a href="#/sources" aria-current={route.sources ? 'page' : undefined}>
                  <span className="nav-num">文</span>
                  参考資料の一覧
                </a>
              </li>
            </ol>
          </li>
        </ol>
      </nav>
      <div className="sidebar-backdrop" onClick={() => setNavOpenAt(null)} />

      <main id="main" className="main" tabIndex={-1}>
        {route.linux != null ? (
          <LinuxView caseId={route.linux} />
        ) : route.sources ? (
          <SourcesPage />
        ) : route.chapter == null ? (
          <Home />
        ) : chapter ? (
          <ChapterView chapter={chapter} section={route.section} restoreY={restoreY} />
        ) : (
          <article className="chapter">
            <h1>章が見つかりません</h1>
            <p>
              <a href="#/">目次へ戻る</a>
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
                <a href={hrefFor(chapter.number, s.id)} aria-current={route.section === s.id ? 'location' : undefined}>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </aside>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
