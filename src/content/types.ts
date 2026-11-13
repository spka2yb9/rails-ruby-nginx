import type { ReactNode } from 'react'

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
  /** 章番号。付録は APPENDIX_START 以降 */
  number: number
  /** 部番号 1〜6（6 は付録） */
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
  { number: 1, title: '全体像と Ruby', description: '本書の範囲とソースの調べ方、Rails の DSL を読むための Ruby のオブジェクトモデル' },
  { number: 2, title: '起動とリクエスト経路', description: 'Rack、初期化、オートロード、ルーティング、コントローラーの内部' },
  { number: 3, title: 'ActiveRecord', description: '属性、Relation と Arel、関連、保存処理、トランザクションと接続プール' },
  { number: 4, title: '周辺機能', description: 'ビュー、Hotwire、非同期処理、メールとファイル、テスト、セキュリティ、性能' },
  { number: 5, title: '本番構成と運用・調査', description: 'Puma、Nginx、ロードバランサーの構成、DBを安全に変更する手順、デバッグと調査用gem' },
  { number: 6, title: '付録', description: 'バージョン間の違いと参考資料' },
]
