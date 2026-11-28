import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages のプロジェクトサイト（https://<user>.github.io/<repo>/）で公開する場合は
// 環境変数 BASE_PATH=/<repo>/ を付けてビルドする。ルート配信なら不要。
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? '/',
  // 全文検索の索引（約7.3MB、gzip で約2.0MB。第8部の原則、第9部の MSDP、第10・11部と新章の追加で増えた）は検索を初めて開いたときだけ読み込む別ファイルなので、警告の基準を上げる
  build: { chunkSizeWarningLimit: 7600 },
})
