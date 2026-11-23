import type { Chapter, Section } from './types'
import { labelFor } from './label'
import meta from './chapter-meta.json'

export { APPENDIX_ID, chapterNumber, labelFor } from './label'

/** 目次・前後の章に使う章の情報。節の本文と出典は含まない（出典は sources-index.json）。 */
export type ChapterMeta = Omit<Chapter, 'sections' | 'sources'> & { sections: Pick<Section, 'id' | 'title'>[] }

// chapter-meta.json は npm run build:index が章ファイルから生成する。
export const chapters = meta as ChapterMeta[]

export const chapterByNumber = new Map(chapters.map((c) => [c.number, c]))

export function chapterLabel(c: { number: number }): string {
  return labelFor(c.number)
}

// 章の本文は章ごとに別ファイルにして、開いたときに読み込む。
const loaders = import.meta.glob<{ default: Chapter }>('../chapters/ch*.tsx')
const cache = new Map<number, Promise<Chapter>>()

export function loadChapter(n: number): Promise<Chapter> {
  let p = cache.get(n)
  if (!p) {
    const load = loaders[`../chapters/ch${String(n).padStart(2, '0')}.tsx`]
    p = load ? load().then((m) => m.default) : Promise.reject(new Error(`chapter ${n} not found`))
    p.catch(() => cache.delete(n)) // 失敗したら次に開いたときに再試行する
    cache.set(n, p)
  }
  return p
}
