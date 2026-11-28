import { useEffect, useState } from 'react'
import { parseHash, type Route } from './hash-route'

export { hrefFor, parseHash } from './hash-route'

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseHash(location.hash))
    addEventListener('hashchange', onChange)
    return () => removeEventListener('hashchange', onChange)
  }, [])
  return route
}
