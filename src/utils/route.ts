import { useEffect, useState } from 'react'

/**
 * ハッシュルーティング。静的ホスティングでリロードしても壊れない。
 *   #/          目次（ホーム）
 *   #/33        第33章の先頭
 *   #/33/ipc    第33章の節 id="ipc"
 *   #/sources   参考資料の一覧
 */
export interface Route {
  chapter: number | null
  section: string | null
  sources: boolean
}

export function parseHash(hash: string): Route {
  const m = /^#\/(\d+)(?:\/([\w-]+))?/.exec(hash)
  if (!m) return { chapter: null, section: null, sources: hash === '#/sources' }
  return { chapter: Number(m[1]), section: m[2] ?? null, sources: false }
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
