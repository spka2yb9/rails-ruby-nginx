import { useEffect } from 'react'
import { chapterLabel, chapters } from '../content/chapters'
import { PARTS } from '../content/types'
import { hrefFor } from '../utils/route'
import { VERSIONS } from '../content/versions'

export function Home() {
  useEffect(() => {
    document.title = 'Rails・Ruby・Nginx 教科書'
    scrollTo(0, 0)
  }, [])
  return (
    <article className="chapter home">
      <header className="chapter-head">
        <h1>Rails・Ruby・Nginx 教科書</h1>
        <p className="chapter-summary">
          業務で Rails を使っている開発者が、普段使っている機能の内部で何が起きているかを説明できるようになるための教科書です。Ruby のオブジェクトモデル、Rails の起動とリクエストの処理経路、ActiveRecord
          の内部を実際のソースコードとともに読み、前段の Puma と Nginx の設定の根拠までを扱います。
        </p>
      </header>

      <section className="section" id="how-to-read">
        <h2>本書の読み方</h2>
        <p>
          第1部から第3部は順番に読む前提です。第1部で説明する Ruby の仕組み（モジュール、特異クラス、ブロック、Concern、Callbacks）を、第2部と第3部で Rails
          のソースを読むときに使います。第4部の各章は、第2部と第3部を読んだ後であればどの順でも読めます。第5部は第15章（接続プール）と第17章（WebSocket）を参照します。第26章で1つのリクエストが各構成要素を通る過程を追い、第27章で安全なDBマイグレーション、第28章でデバッグと調査用gemを扱います。付録Aに Rails 7.2 から 8.x への主な違いとサポート状況をまとめています。各章の冒頭に前提となる章を示しています。
        </p>
        <p>
          使い方の説明から始めたい場合は、次の節を先に読むと、内部の説明に入る前に、何を書けばどう動くかを確かめられます。第2章の
          <a href={hrefFor(2, 'rails-syntax')}>「Rails でよく見る Ruby の書き方」</a>、第11章の<a href={hrefFor(11, 'crud')}>「基本操作と使い分け」</a>、第13章の
          <a href={hrefFor(13, 'basics')}>「関連の基本的な使い方」</a>、第16章の<a href={hrefFor(16, 'form')}>「フォームから保存まで」</a>、第20章の
          <a href={hrefFor(20, 'first-spec')}>「RSpec で最初のテストを書く」</a>です。
        </p>
        <p>
          本書に演習や確認問題はありません。各章は「この章で学ぶこと → 基本概念 → 内部の仕組み → 図解と具体例 → 例外・比較・Rails 7.2 との違い → まとめ →
          参考資料」の流れで書いています。検索は画面上部の「検索」ボタン、または <kbd>/</kbd> キーで開けます。
        </p>
      </section>

      <section className="section" id="versions">
        <h2>対象バージョン</h2>
        <p>本書の記述は次のバージョンを基準にしています（確認日 {VERSIONS.checked}）。</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ソフトウェア</th>
                <th>バージョン</th>
                <th>備考</th>
              </tr>
            </thead>
            <tbody>
              {VERSIONS.items.map((v) => (
                <tr key={v.name}>
                  <td>{v.name}</td>
                  <td>{v.version}</td>
                  <td>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" id="toc">
        <h2>目次</h2>
        {PARTS.map((p) => {
          const list = chapters.filter((c) => c.part === p.number)
          return (
            <div key={p.number} className="toc-part">
              <h3>{p.number === 6 ? p.title : `第${p.number}部 ${p.title}`}</h3>
              <p className="toc-part-desc">{p.description}</p>
              <ol className="toc-list">
                {list.map((c) => (
                  <li key={c.number}>
                    <a href={hrefFor(c.number)}>
                      <span className="toc-num">{chapterLabel(c)}</span> {c.title}
                    </a>
                    <p className="toc-summary">{c.summary}</p>
                  </li>
                ))}
              </ol>
            </div>
          )
        })}
        <p>
          <a href="#/sources">参考資料の一覧</a>
        </p>
      </section>
    </article>
  )
}
