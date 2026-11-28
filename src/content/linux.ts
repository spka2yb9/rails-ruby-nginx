import curriculum from './linux-meta.json'

/** 第6部は章を持たず、public/linux の実習ページを本文の場所に埋め込んで表示する（components/LinuxView.tsx）。左のメニューではサーバ運用コースとして並べる。 */

// linux-meta.json は npm run build:index が public/linux/js/lessons/lessons.js から生成する。
type Exercise = { id: string; title: string; learn: string; levelName: string; intro?: string }
export const linuxGroups: { name: string; cases: Exercise[] }[] = curriculum.groups
/** サーバ運用コースの演習の件数（第6部の CASE の数） */
export const exerciseCount = linuxGroups.reduce((count, group) => count + group.cases.length, 0)

export function linuxHref(caseId?: string): string {
  return caseId ? `#/linux/${caseId}` : '#/linux'
}
