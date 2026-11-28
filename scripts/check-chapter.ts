// 章ファイルを描画して基本的な整合性を検査する。
// 実行: node --experimental-strip-types scripts/check-chapter.ts 19 20 ...   （番号なしなら全章）
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { figureNumber, labelFor, orderOf, APPENDIX_ID, CHAPTER_ORDER } from '../src/content/label.ts'
import type { Chapter } from '../src/content/types'
import { courseGroups, courses } from '../src/content/courses.ts'
import { stops, systemFlows } from '../src/content/system-map.ts'
import { parseHash } from '../src/utils/hash-route.ts'

const want = process.argv.slice(2).map(Number)
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let failed = false
// 本文の「図 X-Y」の参照先を、全章を描画した後でまとめて確かめる
const allFigures = new Set<string>()
const figureReferences: { from: string; id: string }[] = []

try {
  // 章ごとに読み込む。並行して編集中の別の章が壊れていても、指定した章は検査できる。
  const mod: { chapters: Chapter[] } = { chapters: [] }
  for (const id of [...CHAPTER_ORDER, APPENDIX_ID]) {
    try {
      const m = (await server.ssrLoadModule(`/src/chapters/ch${String(id).padStart(2, '0')}.tsx`)) as { default: Chapter }
      mod.chapters.push(m.default)
    } catch (e) {
      if (!want.length || want.includes(id)) throw e
      console.log(`      · ${labelFor(id)}（ID ${id}）を読み込めないため、この章へのリンクは検査していません: ${(e as Error).message.split('\n')[0]}`)
    }
  }
  const known = new Set(mod.chapters.map((c) => c.number))
  const approved = new Set([...CHAPTER_ORDER, APPENDIX_ID])
  const byId = new Map(mod.chapters.map((chapter) => [chapter.number, chapter]))
  if (!want.length) {
    const errors: string[] = []
    const target = (from: string, chapter: number, section?: string) => {
      if (!byId.has(chapter) || (section && !byId.get(chapter)?.sections.some((item) => item.id === section))) {
        errors.push(`${from} → ${chapter}${section ? '/' + section : ''}`)
      }
    }
    if (byId.size !== approved.size) errors.push('章の ID が重複しています')
    for (const course of courses) {
      course.related.forEach((id) => {
        if (!courses.some((related) => related.id === id)) errors.push(`${course.id} → ${id}`)
      })
      // 演習のコース（第6部）は章を持たない
      if (course.exercises) continue
      const order = new Map(course.steps.map((step, index) => [step.chapter, index]))
      if (order.size !== course.steps.length) errors.push(`${course.title}に同じ章が複数あります`)
      const groups = courseGroups(course)
      if (groups[0]?.start !== 0 || groups.some((group, index) =>
        group.start < 0 || !group.steps.length || (index > 0 && group.start <= groups[index - 1].start)
      )) errors.push(`${course.title}の章グループが学習順序と一致しません`)
      for (const example of course.examples) {
        if (!order.has(example.chapter)) errors.push(`${course.title}の確認例がコース外の章を参照しています: ${example.chapter}`)
        target(course.title, example.chapter, example.section)
      }
      course.steps.forEach((step, index) => {
        target(course.title, step.chapter)
        step.sections?.forEach((section) => target(course.title, step.chapter, section))
        for (const prerequisite of byId.get(step.chapter)?.prerequisites ?? []) {
          if ((order.get(prerequisite) ?? -1) >= index) errors.push(`${course.title}の順序: ID ${step.chapter} の前提 ID ${prerequisite} が後にあります`)
        }
      })
    }
    for (const stop of stops) target(stop.label, stop.chapter, 'section' in stop ? stop.section : undefined)
    for (const flow of systemFlows) {
      if (!flow.steps.length) errors.push(`${flow.title}に段階がありません`)
      for (const [id, , more] of flow.steps) {
        if (!stops.some((stop) => stop.id === id)) errors.push(`${flow.title} → ${id}`)
        if (more) target(flow.title, more[0], more[1])
      }
    }
    console.log(`[${errors.length ? 'NG' : 'OK'}] コース ${courses.length} 件、全体図 ${systemFlows.length} 経路の参照と学習順序`)
    errors.forEach((error) => console.log(`      - ${error}`))
    if (errors.length) failed = true
  }
  for (const ch of mod.chapters) {
    if (want.length && !want.includes(ch.number)) continue
    const problems: string[] = []
    // 出典番号は画面に出さない（Ref は何も描かない）ので、章ファイルの <Ref n={…} /> を数えて sources と照合する
    const refSource = readFileSync(new URL(`../src/chapters/ch${String(ch.number).padStart(2, '0')}.tsx`, import.meta.url), 'utf8')
    for (const n of new Set([...refSource.matchAll(/<Ref n=\{(\d+)\}/g)].map((m) => Number(m[1])))) {
      if (!ch.sources[n - 1]) problems.push(`出典 ${n} がありません`)
    }
    const notes = new Set<string>()
    for (const prerequisite of ch.prerequisites) {
      if (!approved.has(prerequisite)) problems.push(`前提の章 ID ${prerequisite} がありません`)
      else if (orderOf(prerequisite) >= orderOf(ch.number)) problems.push(`前提の章 ID ${prerequisite} が後にあります`)
    }
    const ids = new Set<string>()
    const figureIds = new Set<string>()
    const figureOrder: number[] = []
    let chars = 0
    let figs = 0
    let codes = 0
    for (const sec of ch.sections) {
      if (!/^[a-z0-9-]+$/.test(sec.id)) problems.push(`節 id が不正: ${sec.id}`)
      if (ids.has(sec.id)) problems.push(`節 id が重複: ${sec.id}`)
      ids.add(sec.id)
      let html: string
      try {
        html = renderToStaticMarkup(createElement('div', null, sec.body))
      } catch (e) {
        problems.push(`節 ${sec.id} の描画に失敗: ${(e as Error).message}`)
        continue
      }
      figs += (html.match(/<figure/g) ?? []).length
      for (const [, id, position] of html.matchAll(/<figure[^>]* id="fig-((?:\d+|A)-(\d+))"/g)) {
        if (id !== figureNumber(ch.number, Number(position))) problems.push(`図番号が章の表示と一致しません: ${id}`)
        if (figureIds.has(id)) problems.push(`図番号が重複: ${id}`)
        figureIds.add(id)
        allFigures.add(id)
        figureOrder.push(Number(position))
      }
      codes += (html.match(/class="code"/g) ?? []).length
      for (const m of html.matchAll(/href="(#\/\d+(?:\/[^"?]+)?)"/g)) {
        const { chapter: n, section } = parseHash(m[1])
        if (n == null) continue
        if (!approved.has(n)) problems.push(`存在しない章へのリンク: 第${n}章`)
        else if (!known.has(n)) notes.add(`未執筆の章へのリンク: 第${n}章`)
        else if (section && !byId.get(n)?.sections.some((s) => s.id === section)) {
          problems.push(`存在しない節へのリンク: ID ${n} / ${section}`)
        }
      }
      for (const m of html.matchAll(/<svg(?![^>]*role="img")/g)) problems.push(`role="img" の無い svg（節 ${sec.id}）: ${m[0].slice(0, 40)}`)
      const noPre = html.replace(/<pre[\s\S]*?<\/pre>/g, '')
      if (/\*\*[^*]+\*\*/.test(noPre)) problems.push(`Markdown の太字記法が残っている（節 ${sec.id}）`)
      const text = noPre.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '')
      if (/依頼文|元の教材|Hotwire|Minitest/.test(text)) problems.push(`対象外の記述が残っている（節 ${sec.id}）`)
      const withoutChapterLinks = noPre.replace(/<a href="#\/\d+[^"]*">[\s\S]*?<\/a>/g, '').replace(/<[^>]+>/g, '')
      const numberReferences = [...new Set(withoutChapterLinks.match(/第\d+(?:・\d+)*章/g))]
      if (numberReferences.length) notes.add(`章番号を直接記載（節 ${sec.id}）: ${numberReferences.join('、')}`)
      chars += text.length
      const own = figureNumber(ch.number, 1).split('-')[0]
      for (const [, id, prefix] of noPre.replace(/<[^>]+>/g, '').matchAll(/図\s*((\d+|A)-\d+)/g)) {
        figureReferences.push({ from: `${labelFor(ch.number)}（節 ${sec.id}）`, id })
        if (prefix !== own) notes.add(`ほかの章の図を参照（節 ${sec.id}）: 図 ${id}`)
      }
    }
    if (ch.sources.length === 0) problems.push('出典が 0 件')
    for (const s of ch.sources) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s.accessed)) problems.push(`参照日の形式が不正: ${s.accessed}`)
      if (!/^https?:\/\//.test(s.url)) problems.push(`URL が不正: ${s.url}`)
    }
    if (chars < 4000) {
      const message = `本文 ${chars} 文字（目安は4,000字。コード・図を除く）`
      // 新章は一つの概念や判断を短く扱うため、分量は目視確認用に示す。
      if (ch.number >= 94) notes.add(message)
      else problems.push(message)
    }
    // 図番号は本文に出てくる順に 1 から連番にする
    if (figureOrder.some((position, index) => position !== index + 1)) problems.push(`図番号が出てくる順の連番になっていません: ${figureOrder.join(', ')}`)
    if (figs < 2 && ch.number !== APPENDIX_ID) problems.push(`図が ${figs} 点（2点以上が目安）`)
    const status = problems.length ? 'NG' : 'OK'
    if (problems.length) failed = true
    console.log(`[${status}] ${labelFor(ch.number)} ${ch.title} — 節 ${ch.sections.length} / 本文 ${chars} 文字 / 図 ${figs} / コード ${codes} / 出典 ${ch.sources.length}`)
    for (const p of problems) console.log(`      - ${p}`)
    for (const p of notes) console.log(`      · ${p}`)
  }
  if (!want.length) {
    const missing = figureReferences.filter(({ id }) => !allFigures.has(id))
    console.log(`[${missing.length ? 'NG' : 'OK'}] 本文の図番号の参照 ${figureReferences.length} 件`)
    missing.forEach(({ from, id }) => console.log(`      - ${from}: 図 ${id} がありません`))
    if (missing.length) failed = true
  }
} finally {
  await server.close()
}
process.exit(failed ? 1 : 0)
