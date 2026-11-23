import { useEffect, useState } from 'react'

/**
 * ハッシュルーティング。静的ホスティングでリロードしても壊れない。
 *   #/          目次（ホーム）
 *   #/33        第33章の先頭
 *   #/33/ipc    第33章の節 id="ipc"
 *   #/sources   参考資料の一覧
 *   #/linux         第6部の入口。実習ページで最初の未回答の演習を選ぶ
 *   #/linux/case04  第6部の CASE
 */
export interface Route {
  chapter: number | null
  section: string | null
  sources: boolean
  /** 第6部の表示中だけ CASE の ID（入口は空文字）。それ以外は null */
  linux: string | null
}

// 別の章へ移した節。値は移動先の章 ID か、[章 ID, 移動先の節 id]（節 id も変わった場合）。
const MOVED_SECTIONS: Record<string, number | [number, string]> = {
  '25/capistrano-deploy': 32,
  '25/capistrano-config': 32,
  '25/capistrano-rollback': 32,
  '25/container-deploy': 32,
  '26/publication-case': 31,
  '26/architecture-boundaries': 30,
  '26/model-form-objects': 33,
  '26/workflow-contracts': 34,
  '26/external-boundaries': 34,
  '30/model-form-objects': 33,
  '30/service-contract': 33,
  '30/workflow-contracts': 34,
  '30/external-boundaries': 34,
  '30/design-decisions': 34,
  // SQL と Active Record の基本を ID 35〜38 にまとめたときに削った節
  '11/sql': [35, 'sql'],
  '15/transaction-basics': [38, 'transaction'],
  '15/lost-update': [38, 'concurrent-updates'],
  '15/lock-basics': [38, 'lock'],
  '15/timeout-deadlock': [38, 'deadlock'],
}

export function parseHash(hash: string): Route {
  const lm = /^#\/linux(?:\/([\w-]+))?$/.exec(hash)
  if (lm) return { chapter: null, section: null, sources: false, linux: lm[1] ?? '' }
  const m = /^#\/(\d+)(?:\/([\w-]+))?/.exec(hash)
  if (!m) return { chapter: null, section: null, sources: hash === '#/sources', linux: null }
  let chapter = Number(m[1])
  let section = m[2] ?? null
  // 節を別の章へ移す前のブックマークも、移した先の本文へ案内する。
  const moved = MOVED_SECTIONS[`${chapter}/${section}`]
  if (Array.isArray(moved)) [chapter, section] = moved
  else if (moved) chapter = moved
  return { chapter, section, sources: false, linux: null }
}

export function hrefFor(chapter: number, section?: string): string {
  return section ? `#/${chapter}/${section}` : `#/${chapter}`
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseHash(location.hash))
    addEventListener('hashchange', onChange)
    return () => removeEventListener('hashchange', onChange)
  }, [])
  return route
}
