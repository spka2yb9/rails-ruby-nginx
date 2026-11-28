// 章を移動・追加したとき、旧目次と現在の CHAPTER_ORDER をもとに図番号を付け替える。
// npm run build:index の前に実行する。引数には並び替え前の chapter-meta.json を指定する。
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chapterNumber } from '../src/content/label.ts'

const previous = process.argv[2]
if (!previous) throw new Error('並び替え前の chapter-meta.json のパスを指定してください')
const chapters = JSON.parse(readFileSync(previous, 'utf8')) as { number: number }[]
const numbers = new Map(chapters.map(({ number }, index) => [index + 1, chapterNumber(number)]))
const numberFor = (oldNumber: string) => numbers.get(Number(oldNumber)) || Number(oldNumber)

// 他の書籍を引用した章の番号は、教科書内の参照と区別する。
const internalReferences = new Set([1, 2, 3, 4, 5, 6, 11, 16, 18, 19, 20, 22, 26, 28])
const src = new URL('../src/', import.meta.url)

const files = ['chapters', 'visuals', 'explanations'].flatMap((directory) =>
  readdirSync(new URL(directory + '/', src))
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => new URL(directory + '/' + file, src)),
)
files.push(new URL('content/versions.ts', src))

let changed = 0
for (const file of files) {
  const original = readFileSync(file, 'utf8')
  const ownChapter = /\/ch(\d+)\.tsx$/.exec(file.pathname)
  const publishedChapter = ownChapter && chapters.some(({ number }) => number === Number(ownChapter[1]))
  if (ownChapter && !publishedChapter) continue
  let updated = original
    .replace(/(\b(?:n|id)="|#fig-)(\d+)(-\d+)/g, (_, prefix, chapter, figure) => prefix + numberFor(chapter) + figure)
    .replace(/([図表][ 　]*)((?:\d+[-－]\d+[・〜～])*\d+[-－]\d+)/g, (_, prefix, list: string) =>
      prefix + list.replace(/\d+(?=[-－])/g, (number) => String(numberFor(number))),
    )
  if ((ownChapter && internalReferences.has(Number(ownChapter[1]))) || /(?:versions\.ts|request\.tsx|ch\d+-figures\.tsx)$/.test(file.pathname)) {
    updated = updated.replace(/第([0-9・]+)章/g, (_, chapters: string) => `第${chapters.split('・').map(numberFor).join('・')}章`)
  }
  if (updated !== original) {
    changed++
    if (!process.argv.includes('--dry-run')) writeFileSync(file, updated)
  }
}
console.log(`${resolve(previous)} の順序をもとに、${changed}ファイルが図・章番号の更新対象です。`)
