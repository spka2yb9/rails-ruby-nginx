import './prism-langs'
import { Highlight, themes } from 'prism-react-renderer'
import { useEffect, useState, type ReactNode } from 'react'
import { hrefFor } from '../utils/route'
import { labelFor } from '../content/label'

/* ---------- 図 ---------- */

interface FigureProps {
  /** 本文から図番号で参照する場合の番号。例 "33-1" */
  n?: string
  title: string
  /** 図の読み方や補足。模式図ならその旨を含める */
  caption?: ReactNode
  children: ReactNode
}

/** 図解の共通枠。幅が足りないときは横スクロールで全体を見られる。 */
export function Figure({ n, title, caption, children }: FigureProps) {
  return (
    <figure className="fig" id={n ? `fig-${n}` : undefined}>
      <div className="fig-body">{children}</div>
      <figcaption>
        {n ? <><span className="fig-label">図 {n}</span>{' '}{title}</> : <strong className="fig-label">{title}</strong>}
        {caption && <span className="fig-caption">{caption}</span>}
      </figcaption>
    </figure>
  )
}

/* ---------- コード ---------- */

type Lang = 'ruby' | 'erb' | 'nginx' | 'sql' | 'bash' | 'yaml' | 'json' | 'js' | 'html' | 'text'

interface CodeProps {
  lang: Lang
  /** ファイル名などのラベル */
  title?: string
  /** 引用元（バージョン固定の GitHub リンクなど）。指定すると title がリンクになる */
  href?: string
  code: string
}

function usePrefersDark(): boolean {
  // 検索索引の生成（Node 上での描画）では matchMedia が無いので false にする
  const [dark, setDark] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const on = () => setDark(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return dark
}

const langMap: Record<Lang, string> = {
  ruby: 'ruby', erb: 'erb', nginx: 'nginx', sql: 'sql', bash: 'bash', yaml: 'yaml', json: 'json', js: 'javascript', html: 'markup', text: 'plain',
}

/** コードブロック。等幅・横スクロール。 */
export function Code({ lang, title, href, code }: CodeProps) {
  const dark = usePrefersDark()
  const src = code.replace(/^\n/, '').replace(/\n\s*$/, '')
  return (
    <div className="code">
      {title && (
        <div className="code-title">
          {href ? (
            <a href={href} target="_blank" rel="noreferrer">
              {title}
            </a>
          ) : (
            title
          )}
        </div>
      )}
      <Highlight code={src} language={langMap[lang]} theme={dark ? themes.nightOwl : themes.github}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className={`code-pre lang-${lang}`} tabIndex={0}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, j) => (
                  <span key={j} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}

/* ---------- 補足枠 ---------- */

interface CalloutProps {
  kind?: 'note' | 'warn' | 'v72' | 'unverified'
  title?: string
  children: ReactNode
}

const calloutTitle = { note: '補足', warn: '注意', v72: 'Rails 7.2 との違い', unverified: '未検証' }

export function Callout({ kind = 'note', title, children }: CalloutProps) {
  return (
    <aside className={`callout callout-${kind}`}>
      <div className="callout-title">{title ?? calloutTitle[kind]}</div>
      <div className="callout-body">{children}</div>
    </aside>
  )
}

/* ---------- 用語・章リンク ---------- */

/** 初出の用語。dfn 要素として強調する。 */
export function Term({ children, en }: { children: ReactNode; en?: string }) {
  return (
    <dfn className="term">
      {children}
      {en && <span className="term-en">（{en}）</span>}
    </dfn>
  )
}

export function ChapterLink({ n, section, children }: { n: number; section?: string; children?: ReactNode }) {
  return <a href={hrefFor(n, section)}>{children ?? labelFor(n)}</a>
}

/* ---------- 出典 ---------- */

/** 本文中の出典参照。章のページには参考資料を載せないので何も表示しない（出典は各章の sources と参考資料の一覧に残す）。 */
export const Ref: (props: { n: number }) => null = () => null
