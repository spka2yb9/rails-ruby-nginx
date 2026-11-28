import { createContext, useContext, type ReactNode } from 'react'

/*
 * SVG 図解の部品。図の凡例（第1章 図1-4）と対応させる。
 *   box  … クラス・プロセス・構成要素
 *   box2 … モジュール
 *   box3 … 特異クラス
 *   box4 … データ・外部のサービス
 *   box5 … 注目してほしい要素
 */
export type Fill = 'bg' | 'box' | 'box2' | 'box3' | 'box4' | 'box5' | 'none'
const fillVar = (f: Fill) => (f === 'none' ? 'none' : f === 'bg' ? 'var(--fig-bg)' : `var(--fig-${f})`)

const MarkerCtx = createContext('ar')

interface SvgProps {
  /** 図番号（例 "2-1"）。矢印マーカーの id に使う */
  id: string
  w: number
  h: number
  /** スクリーンリーダー向けの図の説明 */
  label: string
  children: ReactNode
}

/** 図の外枠。幅が足りない画面では縮小しすぎず、横スクロールで読む。 */
export function Svg({ id, w, h, label, children }: SvgProps) {
  const m = `ar-${id}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} style={{ minWidth: Math.round(w * 0.85), maxWidth: w, margin: '0 auto' }}>
      <defs>
        <marker id={m} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--fig-line)" />
        </marker>
        <marker id={`${m}-acc`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--fig-accent)" />
        </marker>
      </defs>
      <MarkerCtx.Provider value={m}>{children}</MarkerCtx.Provider>
    </svg>
  )
}

type Tone = 'muted' | 'acc' | 'danger'

interface BoxProps {
  x: number
  y: number
  w: number
  h: number
  /** 1行または複数行のラベル */
  lines?: string | string[]
  fill?: Fill
  fs?: number
  /** 1行目を太字にする */
  bold?: boolean
  dashed?: boolean
  mono?: boolean
  rx?: number
  /** 枠線を強調色にする */
  accent?: boolean
  /** 2行目以降の文字色 */
  subTone?: Tone
  /** 文字の揃え。コードを複数行で載せるときは start にする */
  align?: 'middle' | 'start'
}

/** 角丸の箱と、中央揃えのラベル。 */
export function Box({ x, y, w, h, lines, fill = 'box', fs = 13, bold, dashed, mono, rx = 6, accent, subTone, align = 'middle' }: BoxProps) {
  const arr = lines == null ? [] : Array.isArray(lines) ? lines : [lines]
  const lh = fs * 1.4
  const top = y + h / 2 - ((arr.length - 1) * lh) / 2
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={fillVar(fill)}
        stroke={accent ? 'var(--fig-accent)' : 'var(--fig-line)'}
        strokeWidth={accent ? 2 : 1}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      {arr.map((t, i) => (
        <text
          key={i}
          x={align === 'start' ? x + 12 : x + w / 2}
          y={top + i * lh}
          fontSize={i > 0 && subTone ? fs - 1 : fs}
          textAnchor={align}
          dominantBaseline="central"
          fontWeight={bold && i === 0 ? 600 : undefined}
          className={[mono ? 'mono' : '', i > 0 && subTone ? subTone : ''].join(' ').trim() || undefined}
          style={{ whiteSpace: 'pre' }}
        >
          {t}
        </text>
      ))}
    </g>
  )
}

interface ArrowProps {
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  /** 折れ線・曲線にしたいときは path の d を渡す */
  d?: string
  dashed?: boolean
  accent?: boolean
  /** 両端に矢印を付ける */
  both?: boolean
  /** 矢印なしの線 */
  plain?: boolean
}

/** 矢印。実線は処理・呼び出しの流れ、破線は参照・所属を表す。 */
export function Arrow({ x1, y1, x2, y2, d, dashed, accent, both, plain }: ArrowProps) {
  const m = useContext(MarkerCtx)
  const id = accent ? `${m}-acc` : m
  const props = {
    fill: 'none',
    stroke: accent ? 'var(--fig-accent)' : 'var(--fig-line)',
    strokeWidth: accent ? 2 : 1.5,
    strokeDasharray: dashed ? '5 4' : undefined,
    markerEnd: plain ? undefined : `url(#${id})`,
    markerStart: both && !plain ? `url(#${id})` : undefined,
  }
  return d ? <path d={d} {...props} /> : <line x1={x1} y1={y1} x2={x2} y2={y2} {...props} />
}

interface TProps {
  x: number
  y: number
  children: ReactNode
  fs?: number
  anchor?: 'start' | 'middle' | 'end'
  tone?: Tone
  bold?: boolean
  mono?: boolean
}

/**
 * 文字の下に敷く、図の背景色の帯。文字にかかる縦の破線や目盛りの線を隠す。
 * 幅は文字数からの見積もり（ASCII は 0.62 字、ほかは 1 字）で、多めに取る。T より前に置く。
 */
export function TextBg({ x, y, text, fs = 13, anchor = 'start' }: { x: number; y: number; text: string; fs?: number; anchor?: 'start' | 'middle' | 'end' }) {
  const w = [...text].reduce((sum, c) => sum + (c.charCodeAt(0) < 0x2000 ? 0.62 : 1) * fs, 0) + 6
  const left = anchor === 'start' ? x - 3 : anchor === 'middle' ? x - w / 2 : x - w + 3
  return <rect x={left} y={y - fs * 0.75} width={w} height={fs * 1.5} fill="var(--fig-bg)" />
}

/** 図中の文字。 */
export function T({ x, y, children, fs = 13, anchor = 'start', tone, bold, mono }: TProps) {
  return (
    <text
      x={x}
      y={y}
      fontSize={fs}
      textAnchor={anchor}
      dominantBaseline="central"
      fontWeight={bold ? 600 : undefined}
      className={[tone ?? '', mono ? 'mono' : ''].join(' ').trim() || undefined}
    >
      {children}
    </text>
  )
}
