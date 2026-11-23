(function (L) {
  'use strict';
  const e = L.escape;
  function describe(detail) {
    if (/SEARCH .*USING COVERING INDEX/i.test(detail)) return ['Covering Index Search', '索引で検索範囲を絞り、必要な列を索引だけから取得しています。'];
    if (/SEARCH /i.test(detail)) return ['Index Search', '索引またはINTEGER PRIMARY KEYを使って検索対象を絞っています。'];
    if (/SCAN .*USING (?:COVERING )?INDEX/i.test(detail)) return ['Index Scan', '索引を順に走査しています。索引を使っていても検索範囲を絞るSEARCHとは異なります。'];
    if (/SCAN /i.test(detail)) return ['Scan', '表／中間結果を順に走査します。実表のSCANはFull Table Scanに相当します。'];
    if (/USE TEMP B-TREE/i.test(detail)) return ['一時B-tree', 'ORDER BY・GROUP BY・DISTINCTなどのための一時的なデータ構造です。'];
    if (/SUBQUERY/i.test(detail)) return ['Subquery', '内側の問い合わせを計画しています。相関Subqueryは外側の行を参照します。'];
    return ['Query Plan', 'SQLiteが選択した実行計画の一部です。'];
  }
  function planHTML(plan) {
    if (!plan) return '<p class="muted">比較前の計画はありません。</p>';
    return plan.values.map(row => {
      const [name, description] = describe(String(row[3]));
      return '<div class="sql-plan"><span class="badge b-genre">' + e(name) + '</span><code>' + e(row[3]) + '</code><p class="small">' + e(description) + '</p></div>';
    }).join('');
  }
  function searchModel(engine, ast, plan) {
    if (ast.type !== 'select' || ast.from?.length !== 1 || !ast.from[0].table) return '';
    const table = ast.from[0].table;
    const where = ast.where;
    const equality = where?.type === 'binary_expr' && where.operator === '=' && where.left?.type === 'column_ref' && ['number','single_quote_string','string'].includes(where.right?.type);
    if (!equality) return '<p class="small muted">単一表の「WHERE 列 = 定数」を実行すると、行の走査と索引探索の比較図を表示します。</p>';
    const column = where.left.column;
    const source = L.quoteIdentifier(table);
    const field = L.quoteIdentifier(column);
    const total = engine.query('SELECT COUNT(*), COUNT(DISTINCT ' + field + ') FROM ' + source).values[0];
    const matches = engine.query('SELECT COUNT(*) FROM ' + source + ' WHERE ' + field + ' = ?', [where.right.value]).values[0][0];
    const indexed = plan.values.some(row => /^SEARCH /i.test(row[3]));
    // This is a deliberately separate ordered-array model, not SQLite instrumentation.
    const values = engine.query('SELECT ' + field + ' FROM ' + source + ' ORDER BY ' + field + ' LIMIT 20000').values.map(row => row[0]);
    const target = where.right.value;
    const path = [];
    let lo = 0, hi = values.length - 1;
    const comparable = values.every(value => value !== null && typeof value === typeof target && (typeof value === 'number' || /^[\x20-\x7E]*$/.test(value)));
    if (comparable) {
      while (lo <= hi) { const mid = (lo + hi) >> 1; const value = values[mid]; path.push(value); if (value === target) break; if (value < target) lo = mid + 1; else hi = mid - 1; }
    }
    return '<h3>探索をイメージする</h3><div class="sql-metrics"><div><b>' + total[0].toLocaleString() + '</b><span>総行数</span></div><div><b>' + total[1].toLocaleString() + '</b><span>' + e(column) + ' のCardinality（異なる値）</span></div><div><b>' + matches + ' / ' + total[0] + '</b><span>Selectivity（該当率） ' + (total[0] ? (matches / total[0] * 100).toFixed(2) : 0) + '%</span></div></div>' +
      '<p class="small">該当率が低い条件ほど、索引で候補を絞る効果が期待できます。Optimizerは件数・統計・取得列などから計画を選びます。</p>' +
      '<div class="sql-comparison"><div><h4>Indexなし · 全行確認モデル</h4><div class="sql-flow">' + values.slice(0, 5).map((_, i) => '<span class="badge b-plain">Row ' + (i + 1) + ' → check</span>').join('') + (values.length > 5 ? '<span>…</span>' : '') + '</div><p>確認対象: ' + total[0] + '行</p></div><div><h4>Indexあり · 順序付きキーの探索モデル</h4>' +
      (comparable ? '<div class="sql-flow">' + path.map(value => '<span class="badge b-genre">' + e(value) + '</span>').join(' → ') + '</div><p>比較 ' + path.length + '回 → ' + matches + '件の候補</p>' : '<p>この型・照合順序の探索図は対象外です。</p>') + '</div></div>' +
      '<p class="sql-notice">現在の実行計画: ' + (indexed ? 'SEARCH' : 'SCAN等（上の計画を参照）') + '。図はソート済み配列の二分探索による簡略モデルです。B+Treeの実装・SQLiteの実測探索行数・所要時間を示すものではありません。重複キーの全件取得や表本体へのアクセスも別途必要になります。</p>';
  }
  L.renderIndex = function (container, engine, sql, before) {
    try {
      const plan = engine.explain(sql);
      let model = '';
      try { model = searchModel(engine, L.parser.parse(sql)[0], plan); } catch (_) { /* SQLite-only syntax can still have a plan. */ }
      const changed = before && JSON.stringify(before.values) !== JSON.stringify(plan.values);
      container.innerHTML = '<h2>EXPLAIN · 実際のSQLite実行計画</h2><p class="small">監視中のSQL。CREATE / DROP INDEXやデータ生成後も、このSELECTの計画を再取得します。</p><pre>' + e(sql) + '</pre>' +
        (before ? '<div class="sql-comparison"><div><h3>Before</h3>' + planHTML(before) + '</div><div><h3>After ' + (changed ? '<span class="badge b-open">計画が変化</span>' : '<span class="badge b-plain">計画は同じ</span>') + '</h3>' + planHTML(plan) + '</div></div>' : planHTML(plan)) +
        '<details><summary>EXPLAIN QUERY PLANの生データ</summary>' + L.table(plan) + '</details>' + model +
        '<details><summary>Composite Index · 列順とCovering Index</summary><p><code>(age, name)</code> は最初にage、その同じageの中でnameの順に並びます。</p><div class="sql-flow"><span class="badge b-genre">age = 20</span> → <span class="badge b-plain">Alice / Frank / …</span></div><p><code>WHERE age = 20</code> は先頭列の範囲を探せます。<code>age = 20 AND name = \'Alice\'</code> は両方でさらに絞れます。<code>name = \'Alice\'</code> だけではageごとに分散し、先頭から連続する範囲を通常は特定できません（Leftmost Prefix）。最適化による例外もあるので実行計画で確認します。</p><p>先頭列に範囲条件を使うと、後続列を連続した検索範囲の限定に使える範囲が制約されます。必要な列が索引に揃っていればCovering Indexになります。索引は容量を使い、INSERT / UPDATE / DELETE時に保守コストも発生します。</p><p>SQLiteとMySQLではOptimizer・統計・索引の物理構造が異なるため、同じSQLでも計画は一致するとは限りません。</p></details>';
      return plan;
    } catch (error) {
      container.innerHTML = '<h2>EXPLAIN</h2><p class="muted">実行計画を取得できません: ' + e(error.message) + '</p>';
      return null;
    }
  };
  L.renderSchema = function (container, engine) {
    const tables = engine.getTables();
    container.innerHTML = '<h2>Table / Schema / Index</h2><div class="sql-actions"><span class="small">usersへダミー行を追加</span>' + [100, 1000, 10000].map(n => '<button data-generate="' + n + '">Generate ' + n.toLocaleString() + ' rows</button>').join('') + '</div><p class="small muted">最大20,000行。生成行のdepartment_idはNULL。既存データと索引を保持します。</p>' +
      tables.values.map(([name, type]) => '<details><summary>' + e(name) + ' · ' + e(type) + '</summary><h3>Schema</h3>' + L.table(engine.getSchema(name)) + '<h3>Data · 先頭30行</h3>' + L.table(engine.query('SELECT * FROM ' + L.quoteIdentifier(name) + ' LIMIT 31'), 30) + '</details>').join('') +
      '<h3>Index一覧</h3>' + L.table(engine.getIndexes()) + '<p class="small muted">INTEGER PRIMARY KEYの暗黙の探索構造はこの一覧に独立した索引として現れません。</p>';
  };
})(window.SQLLab);
