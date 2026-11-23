import type { ReactNode } from 'react'

export const BOOK_TITLE = 'Railsアプリの仕組みと設計・運用'

/** 参考文献（出典）1件。 */
export interface Source {
  /** 資料名 */
  title: string
  /** 発行者・サイト名 */
  publisher: string
  url: string
  /** 参照日 YYYY-MM-DD */
  accessed: string
  /** 対象バージョン・版（該当する場合） */
  version?: string
  /** この資料が何の主張を支えるか */
  note?: string
}

/** 章内の節（h2 相当）。 */
export interface Section {
  /** URL ハッシュに使う ID（英数字とハイフン） */
  id: string
  title: string
  body: ReactNode
}

export interface Chapter {
  /** URL に使う章 ID。表示には labelFor を使う */
  number: number
  /** 部番号 1〜10（10 は付録）。第6部（Linux の実習）は章を持たない */
  part: number
  title: string
  /** 目次と検索結果に出す1〜2文の要約 */
  summary: string
  /** この章で学ぶこと（箇条書き） */
  goals: string[]
  /** 前提となる章番号 */
  prerequisites: number[]
  sections: Section[]
  sources: Source[]
}

export interface Part {
  number: number
  title: string
  description: string
}

export const PARTS: Part[] = [
  { number: 1, title: '全体像と Ruby', description: '記事一覧を表示する Rails のコードを開き、そこで呼ばれたメソッドを Ruby がどこから探すかをたどります。' },
  { number: 2, title: '起動とリクエスト経路', description: 'Rails を起動したときの準備と、ブラウザーから要求が来るたびにアクションを呼んで応答を返す処理を追います。' },
  { number: 3, title: 'SQL と ActiveRecord', description: 'ブラウザーで表の検索・集計・更新を試し、同じ操作を Rails で書いたときの SQL を確かめます。記事とコメントの読み込みや、複数人が同時に保存した場合も扱います。' },
  { number: 4, title: '周辺機能', description: '記事の画面を作り、メールや添付画像を扱う仕組みを調べます。テストの書き方、操作を許す条件、表示が遅いときの調べ方も学びます。' },
  { number: 5, title: '本番構成と運用', description: '本番で記事の要求がどのサーバーを通るかをログで確かめます。更新したコードの配備、稼働中の DB の変更、不具合の調査までを扱います。' },
  { number: 6, title: 'Railsエンジニアのためのサーバ運用', description: 'ブラウザの練習用サーバーでRailsアプリの場所、設定、ログを順に調べます。入門のあとは、LinuxやAWSで起きる障害の調査と復旧を練習できます。' },
  { number: 7, title: 'Rails の設計原則と DHH の思想', description: '責務分割とモデルの設計、Service・Form・Query・Value Object、注文処理を段階的に育てる設計、DHH の思想' },
  { number: 8, title: 'プログラミングの原則を Rails で実践する', description: 'KISS・YAGNI・DRY から SOLID、カプセル化、Fail Fast、冪等性、可観測性、後方互換性まで36の原則を、1つの原則を1つの章で扱う。原則に反した Rails のコードを動かして問題を確かめ、直したコードと、当てはめすぎたときの判断を示す。最後に原則同士のトレードオフを比べる' },
  { number: 9, title: 'MSDP の設計パターンを Rails で実装する', description: '設計パターンのカタログ MSDP の15のパターン（依存と差し替え、業務の処理の整理、データの整合性、非同期と障害への備え）を、具体的な場面で起きる問題から始めて Rails のコードで実装し、MySQL と RSpec で動作を確かめる。最後にパターンを組み合わせて注文の確定を組み立てる' },
  { number: 10, title: '付録', description: 'バージョン間の違いと参考資料' },
]

/** 付録の部。目次と章の見出しでは「第N部」を付けずに表示する。 */
export const APPENDIX_PART = 10
