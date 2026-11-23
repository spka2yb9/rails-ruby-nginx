# 同梱ライブラリ

アプリの実行時はこのディレクトリのJavaScriptだけを読み込みます。CDNや外部APIへ接続しません。

| ファイル | 固定バージョン | 配布元 | ライセンス |
|---|---|---|---|
| `sql-asm.js` | sql.js 1.13.0 | https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/sql-asm.js | `sql.js.LICENSE`（MITほか同梱部分の表記） |
| `mysql.umd.js` | node-sql-parser 5.3.8 | https://cdn.jsdelivr.net/npm/node-sql-parser@5.3.8/umd/mysql.umd.js | `node-sql-parser.LICENSE`（Apache-2.0） |

`sql-asm.js`はsql.js公式のJavaScript版SQLiteです。WASMの別ファイルをfetchする必要がなく、既存ポータルの`file://`直接起動を維持できます。ライブラリは配布ファイルのまま配置しています。

SHA-256:

```text
c83beac167ae9c1af075449555b1db68b24b5280d0fc65c1f7ac4d1cd103459d  sql-asm.js
f0fe07c37dcc7f2d25d6e3ab9234d47e4bba4e74e468717dc41bf2d7bccf6d39  mysql.umd.js
```
