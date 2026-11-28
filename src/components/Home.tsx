import { useEffect } from 'react'
import { APPENDIX_ID } from '../content/chapters'
import { BOOK_TITLE } from '../content/types'
import { hrefFor } from '../utils/route'
import { VERSIONS } from '../content/versions'
import { CourseList } from './CourseView'

export function Home() {
  useEffect(() => {
    document.title = BOOK_TITLE
    scrollTo(0, 0)
  }, [])
  return (
    <article className="chapter home">
      <header className="chapter-head">
        <h1>{BOOK_TITLE}</h1>
        <p className="chapter-summary">
          Rails で開発を始めたエンジニアが、普段使っている機能の内部で何が起きているかを説明できるようになるための教科書です。各章では、Rails の機能が何をするか、プロセスやデータベースなどの仕組みがどう動くかを実例で確かめてから、Ruby
          のオブジェクトモデル、Rails の起動とリクエストの処理経路、ActiveRecord の内部を実際のソースコードとともに読み、前段の Puma と Nginx の設定の根拠までを扱います。第8部ではプログラミングの原則（KISS・DRY・SOLID・Fail Fast など36の原則）を、第9部では設計パターンのカタログ MSDP の15のパターンを、具体的な場面で起きる問題から始めて Rails のコードで扱います。
        </p>
      </header>

      <section className="section">
        <h2>目的別コース</h2>
        <CourseList />
        <ul className="inline-links">
          <li><a href="#/map">システム全体図</a></li>
          <li><a href={hrefFor(APPENDIX_ID)}>付録A（Rails のバージョン間の違い）</a></li>
          <li><a href="#/sources">参考資料の一覧</a></li>
        </ul>
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
    </article>
  )
}
