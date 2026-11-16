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
          Rails で開発を始めたエンジニアが、普段使っている機能の内部で何が起きているかを説明できるようになるための教科書です。各章では、Rails の機能が何をするか、プロセスやデータベースなどの仕組みがどう動くかを実例で確かめてから、Ruby
          のオブジェクトモデル、Rails の起動とリクエストの処理経路、ActiveRecord の内部を実際のソースコードとともに読み、前段の Puma と Nginx の設定の根拠までを扱います。
        </p>
      </header>

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
