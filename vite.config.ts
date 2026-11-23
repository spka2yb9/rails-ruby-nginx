import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages のプロジェクトサイト（https://<user>.github.io/<repo>/）で公開する場合は
// 環境変数 BASE_PATH=/<repo>/ を付けてビルドする。ルート配信なら不要。
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? '/',
  // 全文検索の索引（約5.3MB、gzip で約1.5MB。第8部の原則と第9部の MSDP の追加で増えた）は検索を初めて開いたときだけ読み込む別ファイルなので、警告の基準を上げる
  build: { chunkSizeWarningLimit: 5600 },
})
