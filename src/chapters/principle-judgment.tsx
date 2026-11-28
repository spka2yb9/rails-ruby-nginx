import type { ReactNode } from 'react'
import type { Section } from '../content/types'

/** 表の1行：この章の例での内容と、根拠になる節へのリンク（ChapterLink） */
type Row = { text: ReactNode; basis: ReactNode }
/** 原則の章の「効果・代償と代替手段」。lead は表の前に置く判断の要点（2〜3文） */
export type PrincipleJudgment = { lead: ReactNode; benefit: Row; cost: Row; alternative: Row; criterion: Row }

export function principleSection(arg: PrincipleJudgment): Section {
  const rows = [['効果', arg.benefit], ['代償', arg.cost], ['代替手段', arg.alternative], ['判断基準', arg.criterion]] as const
  return {
    id: 'tradeoffs',
    title: '効果・代償と代替手段',
    body: (
      <>
        <p>{arg.lead}</p>
        <div className="table-wrap"><table>
          <thead><tr><th scope="col">観点</th><th scope="col">この章の例</th><th scope="col">根拠の節</th></tr></thead>
          <tbody>
            {rows.map(([label, { text, basis }]) => (
              <tr key={label}><th scope="row">{label}</th><td>{text}</td><td>{basis}</td></tr>
            ))}
          </tbody>
        </table></div>
      </>
    ),
  }
}

export const principleConflicts: Section = {
  id: 'conflict-matrix',
  title: '原則がぶつかったときの判断材料',
  body: (
    <>
      <p>先に、失敗した場合の損失と、変更したあとに元へ戻せる範囲を確かめます。注文を重複して確定する失敗と、表示の一部を短時間止める失敗では、同じ待ち時間でも判断が変わります。</p>
      <div className="table-wrap"><table>
        <thead><tr><th scope="col">一緒に考える原則</th><th scope="col">判断の例</th><th scope="col">元に戻せる範囲と失敗時の損失</th></tr></thead>
        <tbody>
          <tr><th scope="row">Defensive Programming と Fail Fast</th><td>外部の不正入力は境界で拒否し、内部で成立すべき条件が崩れたら処理を止める。</td><td>まだ書き込んでいなければやり直せる。不正な請求を確定すると取り消しに費用がかかる。</td></tr>
          <tr><th scope="row">Single Source of Truth と読み取り性能</th><td>注文データを基準とし、一覧には期限のある集計済みの値を使う。</td><td>集計は元データから作り直せる。請求額に古い値を使う影響は一覧表示より大きい。</td></tr>
          <tr><th scope="row">DRY と AHA</th><td>同じ税規則を使う箇所は一つにまとめ、計算が似ている別の制度は別に保つ。</td><td>誤った共通化は分け直せるが、税率を誤って記録した請求書は訂正が必要になる。</td></tr>
          <tr><th scope="row">YAGNI と DIP</th><td>差し替え先を増やす必要が確定するまで待ち、業務側に漏れている外部の型だけ先に整理する。</td><td>呼び出し箇所が少ない間は抽象化を後から足せる。公開 API に外部の型が広がると戻す費用が増える。</td></tr>
        </tbody>
      </table></div>
    </>
  ),
}
