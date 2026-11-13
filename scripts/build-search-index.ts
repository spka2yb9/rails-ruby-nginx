// 各章を静的HTMLに描画し、節ごとの本文テキストを検索索引 JSON に書き出す。章の情報（chapter-meta.json）も書き出す。
// 実行: npm run build:index
import { writeFileSync } from 'node:fs'
import { createServer } from 'vite'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import type { Chapter } from '../src/content/types'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const mod = (await server.ssrLoadModule('/src/content/all-chapters.ts')) as { chapters: Chapter[] }
  const entries = []
  for (const ch of mod.chapters) {
    for (const sec of ch.sections) {
      const html = renderToStaticMarkup(createElement('div', null, sec.body))
      const text = html
        .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
        .replace(/<\/?span[^>]*>/g, '') // コード強調の span は語を分断しない
        .replace(/<[^>]+>/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
      entries.push({
        chapter: ch.number,
        chapterTitle: ch.title,
        sectionId: sec.id,
        sectionTitle: sec.title,
        text,
      })
    }
  }
  writeFileSync(new URL('../src/content/search-index.json', import.meta.url), JSON.stringify(entries))
  // 目次などに使う章の情報（節の本文を除く）。アプリは本文を章ごとに遅れて読み込む。
  const meta = mod.chapters.map(({ sections, ...rest }) => ({ ...rest, sections: sections.map(({ id, title }) => ({ id, title })) }))
  writeFileSync(new URL('../src/content/chapter-meta.json', import.meta.url), JSON.stringify(meta))
  console.log(`search index: ${entries.length} sections from ${mod.chapters.length} chapters`)
} finally {
  await server.close()
}
