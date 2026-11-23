import curriculum from './linux-meta.json'

/** 第6部は章を持たず、public/linux の実習ページを本文の場所に埋め込んで表示する（components/LinuxView.tsx）。 */
export const LINUX_PART = 6

// linux-meta.json は npm run build:index が public/linux/js/lessons/lessons.js から生成する。
type Exercise = { id: string; title: string; learn: string; levelName: string; intro?: string }
export const linuxGroups: { name: string; cases: Exercise[] }[] = curriculum.groups
export const linuxIntro = linuxGroups.flatMap((group) => group.cases).filter((c) => c.intro)

export function linuxHref(caseId?: string): string {
  return caseId ? `#/linux/${caseId}` : '#/linux'
}
