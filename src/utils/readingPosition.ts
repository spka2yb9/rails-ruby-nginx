const KEY = 'rails-nginx-textbook:position'
const VERSION = 2

export interface Position {
  hash: string
  scrollY: number
}

export function savePosition(pos: Position): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...pos, version: VERSION }))
  } catch {
    // ストレージが使えない環境では保存しない（閲覧は継続できる）
  }
}

export function loadPosition(): Position | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<Position> & { version?: number }
    if (typeof p.hash !== 'string' || typeof p.scrollY !== 'number') return null
    // 第27・28章の追加前に保存した付録Aの読書位置を引き継ぐ。
    const hash = p.version === undefined ? p.hash.replace(/^#\/27(?=\/|$)/, '#/29') : p.hash
    return { hash, scrollY: p.scrollY }
  } catch {
    return null
  }
}

