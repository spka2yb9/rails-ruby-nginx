// URL の章 ID は公開後も変えない。表示する章番号は CHAPTER_ORDER の並び（読む順）から決める。
export const APPENDIX_ID = 29

export const CHAPTER_ORDER = [
  94, 1, 95, 2, 3, 4, 96, 5, 97, 98,
  6, 99, 7, 8, 9, 10,
  35, 36, 37, 38, // 第3部の先頭：SQL と Active Record（後から追加した）
  11, 12, 13, 14, 15, 100,
  16, 18, 19, 101, 20, 102, 21, 22, 28,
  103, 104, 105, 23, 24, 25, 106, 107, 26, 32, 27,
  30, 33, 34, 108, 109, 110, 31, // 第7部：設計（第6部は章を持たない Linux の実習）
  56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74,
  75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93,
  39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,
  111, 112, 113,
  114, 115, 116,
]

/** 目次・前後移動での並び順。付録は最後。 */
export function orderOf(id: number): number {
  return id === APPENDIX_ID ? CHAPTER_ORDER.length : CHAPTER_ORDER.indexOf(id)
}

export function chapterNumber(id: number): number {
  return CHAPTER_ORDER.indexOf(id) + 1
}

export function labelFor(id: number): string {
  return id === APPENDIX_ID ? '付録A' : `第${chapterNumber(id)}章`
}

export function figureNumber(id: number, position: number): string {
  return `${id === APPENDIX_ID ? 'A' : chapterNumber(id)}-${position}`
}
