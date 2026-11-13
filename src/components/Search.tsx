import { useEffect, useId, useRef, useState } from 'react'
import { search, type Hit, type IndexEntry } from '../utils/search'
import { hrefFor } from '../utils/route'
import { labelFor } from '../content/label'

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const [index, setIndex] = useState<IndexEntry[] | null>(null)

  // 検索索引は大きいので、初めて開いたときに読み込む
  useEffect(() => {
    if (open && !index) import('../content/search-index.json').then((m) => setIndex(m.default as IndexEntry[]))
  }, [open, index])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [open])

  useEffect(() => {
    const t = setTimeout(() => {
      setHits(index ? search(index, q) : [])
      setActive(0)
    }, 80)
    return () => clearTimeout(t)
  }, [q, index])

  if (!open) return null

  const go = (h: Hit) => {
    location.hash = hrefFor(h.entry.chapter, h.entry.sectionId)
    onClose()
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(hits.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter' && hits[active]) {
      go(hits[active])
    }
  }

  return (
    <div className="search-backdrop" onClick={onClose}>
      <div className="search-dialog" role="dialog" aria-modal="true" aria-labelledby={`${id}-label`} onClick={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <label id={`${id}-label`} htmlFor={`${id}-input`} className="search-label">
          全文検索（本文も対象。空白区切りで AND 検索）
        </label>
        <input
          id={`${id}-input`}
          ref={inputRef}
          type="search"
          className="search-input"
          placeholder="例：特異クラス / prepend super / Concern included"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
        />
        <ul className="search-results" role="listbox" aria-label="検索結果">
          {q && !index && <li className="search-empty">索引を読み込んでいます</li>}
          {q && index && hits.length === 0 && <li className="search-empty">見つかりませんでした</li>}
          {hits.map((h, i) => (
            <li key={`${h.entry.chapter}-${h.entry.sectionId}`} role="option" aria-selected={i === active} className={i === active ? 'active' : ''}>
              <a href={hrefFor(h.entry.chapter, h.entry.sectionId)} onClick={(e) => { e.preventDefault(); go(h) }} onMouseEnter={() => setActive(i)}>
                <span className="search-where">
                  {labelFor(h.entry.chapter)} {h.entry.chapterTitle} › {h.entry.sectionTitle}
                </span>
                <span className="search-excerpt">{h.excerpt}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="search-help">↑↓ で選択、Enter で移動、Esc で閉じる</div>
      </div>
    </div>
  )
}
