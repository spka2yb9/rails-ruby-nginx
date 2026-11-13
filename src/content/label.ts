// 章番号の表示。章ファイルから import しても循環しないよう、他のモジュールに依存させない。

/** この番号以降は付録として扱う。 */
export const APPENDIX_START = 29

export function labelFor(n: number): string {
  return n >= APPENDIX_START ? `付録${String.fromCharCode(65 + n - APPENDIX_START)}` : `第${n}章`
}
