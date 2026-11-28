# Railsアプリの仕組みと設計・運用

Rails で開発を始めたエンジニアが、Rails の機能やプロセス・データベースなどの仕組みを実例で確かめながら、Ruby のオブジェクトモデル、Rails の起動とリクエストの処理経路、ActiveRecord の内部、前段の Puma と Nginx の設定の根拠までを、実際のソースコードとともに学ぶための日本語の Web 教科書です（Vite + React + TypeScript の静的サイト）。

## 必要なもの

- Node.js 24 以上（npm 同梱）

## 起動

```bash
npm install
npm run dev
```

ブラウザで表示された URL（既定では http://localhost:5173/ ）を開きます。`npm run dev` は起動の前に `npm run build:index` を実行し、目次と検索に使うデータを章のファイルから作り直します。

## ビルド

```bash
npm run build
```

`dist/` に静的ファイルが出力されます。ホームから6つの学習コースとシステム全体図を開けます。ビルドは次の順で動きます。

1. `npm run build:index` — 各章を描画して、全文検索の索引 `src/content/search-index.json` と、目次・前後の章・参考資料一覧に使う章の情報 `src/content/chapter-meta.json` を生成。第6部の入門・テーマ別の演習一覧 `src/content/linux-meta.json` も `public/linux/js/lessons/lessons.js` から生成
2. `tsc -b` — 型チェック
3. `vite build` — `dist/` へ出力

ビルド結果の確認は `npm run preview` です。章の本文と検索の索引は、開いたときに読み込む別のファイル（`dist/assets/chNN-*.js`、`search-index-*.js`）に分かれています。

## 第6部（Linux の実習）

第6部「Railsエンジニアのためのサーバ運用」は `#/linux` を開くと最初の未回答の演習から始まります。左のメニューにはサーバ運用コースとして演習の一覧を表示したまま、本文で手順と端末を見比べて回答できます。解説は選択肢の下に表示され、そこから次の演習に進めます。`public/linux/` にある実習ページを iframe で表示します（`src/components/LinuxView.tsx`）。各演習の URL は `#/linux/case04` の形です。教科書の検索で演習名・テーマ・主なコマンドを探せます。演習の追加方法は `public/linux/README.md` にあります。

AWS の CASE（LEVEL 12〜）の `aws` コマンドには、aws-learning の AWS CLI のシミュレーターを組み込んだ `public/linux/vendor/aws-sim.min.js` が応答します。作り直す手順は `public/linux/README.md` の「AWS CLI のシミュレーター」にあります（ソースは `tools/aws-sim/`）。

## 教材のファイルの構成

| 置き場所 | 内容 |
|---|---|
| `src/chapters/chNN.tsx` | 章の本文・図・コード・出典（NN は URL の章 ID）。1つの章は1か所だけに書き、コースからは参照する |
| `src/content/courses.ts` | 6つの学習コース（目的・対象者・前提・到達目標・章の順序と読む節・グループ）。サーバ運用コースは第6部の演習を順序として使う |
| `src/content/system-map.ts` | システム全体図の構成要素と、10の処理の流れの段階 |
| `src/content/label.ts`・`types.ts` | 章の読む順（表示番号）と部の一覧 |
| `src/sims/` | 操作できる図。`chapter-figures.tsx` で章と節に割り当てる |
| `src/components/CourseMenu.tsx` | 左のメニュー（コースの切り替え、表示中の章の節、サーバ運用コースの演習） |

章のページには参考資料を表示しません。出典は各章の `sources` に書き、「参考資料の一覧」（`#/sources`）にまとめて表示します。

## 章の検査

```bash
node --experimental-strip-types scripts/check-chapter.ts      # 全章
node --experimental-strip-types scripts/check-chapter.ts 3 4  # 指定した章
```

節 ID の重複、章・節リンク、出典、図のアクセシブル名、図番号（本文に出てくる順の連番か）、本文の分量を検査します。全章の検査では、コースの前提順序とシステム全体図の参照先も確認します。

引数の番号は URL に使う章 ID（`#/32` の 32）です。後から追加した章があるため、表示上の章番号とは一致しない場合があります。表示する章番号は `src/content/label.ts` の `CHAPTER_ORDER`（読む順）から決まります。

章を追加・移動するときは、既存の章 ID を維持します。`CHAPTER_ORDER` を変更して索引を作り直す前に、旧順序の `chapter-meta.json` を引数にして図番号を更新します。

```bash
node --experimental-strip-types scripts/renumber-chapters.ts src/content/chapter-meta.json
npm run build:index
```

## 静的ホスティングでの公開手順

ハッシュルーティング（`#/3/hooks` の形式）を使っているため、サーバー側のリライト設定は不要です。`dist/` をそのまま配置すれば動きます。

### GitHub Pages（プロジェクトサイト `https://<user>.github.io/<repo>/`）

```bash
BASE_PATH=/<repo>/ npm run build
```

`dist/` の中身を Pages の公開元（`gh-pages` ブランチや Actions の成果物など）に配置します。ユーザーサイト（`https://<user>.github.io/`）やカスタムドメインでルート配信する場合は `BASE_PATH` を付けずにビルドします。

### Cloudflare Pages

- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`
- リライト設定: 不要
