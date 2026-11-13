import { useEffect, useState } from 'react'
import { ChapterView } from './components/ChapterView'
import { Home } from './components/Home'
import { SourcesPage } from './components/SourcesPage'
import { SearchDialog } from './components/Search'
import { APPENDIX_START, chapterByNumber, chapterLabel, chapters } from './content/chapters'
import { PARTS } from './content/types'
import { loadPosition, savePosition, type Position } from './utils/readingPosition'
import { hrefFor, useRoute } from './utils/route'

export default function App() {
  const route = useRoute()
  // スマホの目次は、開いたときの表示位置にいる間だけ開いておく（移動すると閉じる）
  const routeKey = `${route.chapter}|${route.section}|${route.sources}`
  const [navOpenAt, setNavOpenAt] = useState<string | null>(null)
  const navOpen = navOpenAt === routeKey
  const [searchOpen, setSearchOpen] = useState(false)

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
  }, [route.chapter, route.section, route.sources])

  // キーボード: / または Ctrl/Cmd+K で検索
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT'
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
    <div className={`app ${navOpen ? 'nav-open' : ''}`}>
      <a className="skip" href="#main">
        本文へ移動
      </a>
      <header className="topbar">
        <button className="icon-btn nav-toggle" aria-label="目次を開閉" aria-expanded={navOpen} onClick={() => setNavOpenAt((o) => (o === routeKey ? null : routeKey))}>
          ☰
        </button>
        <a className="brand" href="#/">
          Rails・Ruby・Nginx 教科書
        </a>
        <button className="search-btn" onClick={() => setSearchOpen(true)} aria-keyshortcuts="Control+K /">
          <span>検索</span>
          <kbd>/</kbd>
        </button>
      </header>

      <nav className="sidebar" aria-label="目次">
        <ol className="nav-parts">
          {PARTS.map((p) => (
            <li key={p.number}>
              <div className="nav-part">{p.number === 6 ? p.title : `第${p.number}部 ${p.title}`}</div>
              <ol className="nav-chapters">
                {chapters
                  .filter((c) => c.part === p.number)
                  .map((c) => (
                    <li key={c.number}>
                      <a href={hrefFor(c.number)} aria-current={c === chapter ? 'page' : undefined}>
                        <span className="nav-num">{c.number >= APPENDIX_START ? '付' : c.number}</span>
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

      <main id="main" className="main">
        {route.sources ? (
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
