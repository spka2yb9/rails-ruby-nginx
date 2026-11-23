import { useEffect, useRef, useState } from 'react'
import { BOOK_TITLE } from '../content/types'
import { parseHash } from '../utils/route'

const PAGE = `${import.meta.env.BASE_URL}linux/index.html`

function syncFrame(win: Window | null, caseId: string) {
  if (!win || !win.location.pathname.endsWith('/linux/index.html')) return
  const hash = `#/${caseId}`
  if (win.location.hash !== hash) win.location.replace(win.location.href.split('#')[0] + hash)
}

/**
 * 第6部（Linux の実習）。public/linux の実習ページを本文の場所に枠なしで埋め込む。
 * 実習ページは素の JavaScript で書かれ、ターミナルや仮想 Linux を自分で持つため、教科書の React に組み込まず iframe で分けている。
 * URL は教科書側の #/linux/<CASE> と実習ページ側の #/<CASE> を互いに写して、目次の現在位置と戻る操作をそろえる。
 */
export function LinuxView({ caseId }: { caseId: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  // src は最初の1回だけ決める。後から変えると iframe が読み込み直しになるため、移動は下の effect で伝える
  const [src] = useState(() => `${PAGE}?embed#/${caseId}`)

  useEffect(() => {
    document.title = `Railsエンジニアのためのサーバ運用 | ${BOOK_TITLE}`
  }, [])

  // 実習内で「次の演習へ」を選ぶと、教科書の目次と URL もその演習に合わせる。履歴は実習側に残す。
  useEffect(() => {
    const frame = ref.current!
    let win: Window | null = null
    const onFrameHash = () => {
      const id = win!.location.hash.replace(/^#\/?/, '')
      const hash = id ? `#/linux/${id}` : '#/linux'
      if (location.hash === hash) return
      history.replaceState(null, '', hash)
      dispatchEvent(new HashChangeEvent('hashchange'))
    }
    const onLoad = () => {
      win = frame.contentWindow
      win?.addEventListener('hashchange', onFrameHash)
      const requested = parseHash(location.hash).linux
      if (requested === null || !win) return
      // 通常は実習ページが選んだ演習を目次に反映する。読み込み中に目次を選んだ場合はその選択を優先する。
      if (new URL(frame.src).hash === `#/${requested}`) onFrameHash()
      else syncFrame(win, requested)
    }
    frame.addEventListener('load', onLoad)
    return () => {
      frame.removeEventListener('load', onLoad)
      win?.removeEventListener('hashchange', onFrameHash)
    }
  }, [])

  // 教科書側の移動（目次のクリック、戻る）を実習ページへ伝える。履歴は教科書側に残すので、実習ページ側は置き換える
  useEffect(() => {
    syncFrame(ref.current?.contentWindow ?? null, caseId)
  }, [caseId])

  return <iframe ref={ref} className="linux-frame" title="Railsエンジニアのためのサーバ運用" src={src} />
}
