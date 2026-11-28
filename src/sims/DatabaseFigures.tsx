import { useState } from 'react'
import { StudyFigure, FigureFacts, FigureChoices, FigureFlow } from '../visuals/study-figure'

export function IndexPages() {
  const [strategy, setStrategy] = useState(0)
  const [matches, setMatches] = useState(8)
  const lookup = Math.ceil(matches / 40)
  const reads = [
    [{ label: 'クラスタ化インデックスの葉', detail: '対象の範囲を先に特定できないので、全行を読み取る。' }],
    [{ label: '二次索引', detail: `木を下り、該当する主キーを探す。葉は${lookup}ページ。` },
      { label: 'クラスタ化インデックス', detail: '主キーから行の残りの列を取得する。' }],
    [{ label: 'カバリング索引', detail: `二次索引に必要な列があるので、${lookup}ページの葉から結果を組み立てる。` }],
  ][strategy]
  return (
    <StudyFigure title="索引の種類と読み取るページ" caption="10,000行、1ページ40件、木は3層と仮定します。根と中間ページを2ページとして数え、主キーの再検索は1行につき3ページとします。同じページの再利用、境界をまたぐ読み取り、MVCC やオプティマイザーの選択を省いた概算です。">
      <FigureChoices label="読み取り方" options={['全行を読む', '二次索引から行を引く', '二次索引だけで返す']} selected={strategy} onSelect={setStrategy} />
      <label className="sim-range">条件に合う行数 <output>{matches}</output><input type="range" min={1} max={200} value={matches} onChange={(event) => setMatches(event.target.valueAsNumber)} /></label>
      <FigureFlow steps={reads} />
      <FigureFacts facts={[{ label: 'モデルで数えたページ参照', value: [250, 2 + lookup + 3 * matches, 2 + lookup][strategy] }]} />
    </StudyFigure>
  )
}

export function LoadingQueries() {
  const [count, setCount] = useState(3)
  const [style, setStyle] = useState(0)
  const ids = Array.from({ length: count }, (_, index) => index + 1)
  const selection = `posts.id IN (${ids.join(', ')})`
  const posts = `SELECT posts.* FROM posts WHERE ${selection} ORDER BY posts.id`
  const queries = [
    [posts, ...ids.map((id) => `SELECT comments.* FROM comments WHERE post_id = ${id}`)],
    [posts, `SELECT comments.* FROM comments WHERE post_id IN (${ids.join(', ')})`],
    [`SELECT posts.*, comments.* FROM posts LEFT OUTER JOIN comments ON comments.post_id = posts.id WHERE ${selection} ORDER BY posts.id`],
  ][style]
  return (
    <StudyFigure title="関連の読み込み方を変える" caption="ID で指定した記事を並べ、各記事のコメントを1回ずつ表示する想定です。図の SQL は列の別名などを省いています。LIMIT や関連の定義によって、Rails が発行する SQL の本数は変わります。">
      <label className="sim-range">表示する記事数 <output>{count}</output><input type="range" min={1} max={8} value={count} onChange={(event) => setCount(event.target.valueAsNumber)} /></label>
      <FigureChoices label="関連の読み込み方" options={['遅延読み込み', 'preload', 'eager_load']} selected={style} onSelect={setStyle} />
      <p aria-live="polite">SQL の発行回数（この例） <strong>{queries.length}</strong></p>
      <ol className="sim-queries">{queries.map((query) => <li key={query}><code>{query}</code></li>)}</ol>
      {style === 2 && <p>結合後、記事の列はコメントの件数分だけ繰り返されます。SQL の回数と転送する行数の両方を確認します。</p>}
    </StudyFigure>
  )
}
