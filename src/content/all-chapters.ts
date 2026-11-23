import type { Chapter } from './types'
import { orderOf } from './label'

// 全章の本文を一度に読み込む。検索索引と章の検査を作るスクリプト専用で、アプリからは読み込まない。
const modules = import.meta.glob<{ default: Chapter }>('../chapters/ch*.tsx', { eager: true })

export const chapters: Chapter[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => orderOf(a.number) - orderOf(b.number))
