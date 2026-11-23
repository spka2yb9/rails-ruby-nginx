import { useEffect, useRef } from 'react'
import './sql-lab.css'

/*
 * jinzai-draft-histery の SQL 教材（public/sql/ に同梱）の実行欄を章の中に置く。
 * 画面に近づいたときに初めてスクリプト（sql.js など約1.7MB）を読み込む。
 */

declare global {
  interface Window {
    SQLLearning?: { embed(root: HTMLElement, base: string, options: SqlLabOptions): Promise<void> }
  }
}

interface SqlLabOptions {
  lesson: string
  openIndex?: boolean
}

const BASE = `${import.meta.env.BASE_URL}sql/`
let loader: Promise<void> | null = null

function loadLoader(): Promise<void> {
  if (window.SQLLearning) return Promise.resolve()
  loader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${BASE}loader.js`
    script.onload = () => resolve()
    script.onerror = () => {
      loader = null
      script.remove()
      reject(new Error('loader.js を読み込めませんでした。ページを再読み込みしてください。'))
    }
    document.head.appendChild(script)
  })
  return loader
}

interface SqlLabProps {
  /** SQL 教材のレッスン名（'SELECT'、'JOIN'、'Deadlock' など）。'sandbox' は自由入力、'simulator' はシミュレーターだけ */
  lesson: string
  /** 実行欄の見出し */
  title: string
  /** Index と実行計画の一覧を最初から開く */
  openIndex?: boolean
}

export function SqlLab({ lesson, title, openIndex = false }: SqlLabProps) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = host.current
    if (!el) return
    const start = () => {
      el.textContent = 'SQL の実行環境を読み込んでいます…'
      loadLoader()
        .then(() => window.SQLLearning!.embed(el, BASE, { lesson, openIndex }))
        .catch((e: Error) => {
          el.textContent = `初期化エラー: ${e.message}`
        })
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect()
          start()
        }
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [lesson, openIndex])
  return (
    <section className="sql-lab sql-learning" aria-label={title}>
      <div className="sql-lab-title">{title}</div>
      <div ref={host} className="sql-lab-host" />
    </section>
  )
}
