(function (L) {
  'use strict';
  const parser = new window.NodeSQLParser.Parser();
  const dialect = { database: 'MySQL' };
  const copy = value => JSON.parse(JSON.stringify(value));
  const star = [{ expr: { type: 'column_ref', table: null, column: '*' }, as: null }];
  function parse(sql) { const ast = parser.astify(sql, dialect); return Array.isArray(ast) ? ast : [ast]; }
  function sqlify(ast) { return parser.sqlify(ast, dialect); }
  function expr(node) { return parser.exprToSQL(node, dialect); }
  function preview(engine, ast) {
    const sql = sqlify(ast);
    const result = engine.query('SELECT * FROM (' + sql + ') AS learning_preview LIMIT 201');
    result.truncated = result.values.length > 200;
    result.values = result.values.slice(0, 200);
    return { sql, result };
  }
  const explanation = {
    FROM: '表を読み込み、JOIN条件に従って行を組み合わせます。LEFT JOINの不一致側はNULLです。',
    WHERE: 'グループ化する前の行を条件で絞ります。NULLとの通常の比較はTRUEになりません。',
    'GROUP BY': '同じキーを持つ行をグループにまとめます。下表は理解のため、この時点の集約値も表示しています。',
    HAVING: 'COUNTなどの集約値を使い、グループを絞ります。WHEREと異なり、集約後に判定します。',
    SELECT: '返す列と式を決めます。集約SQLではグループごとの値を返します。',
    DISTINCT: 'SELECTした列の値が同じ行を重複排除します。',
    'ORDER BY': '返す行の順序を決めます。ORDER BYがなければ表示順は保証されません。',
    LIMIT: '最終的に返す件数を制限します。安定したページングには一意に並ぶORDER BYを指定します。'
  };
  function steps(engine, ast) {
    if (ast.type !== 'select') return [];
    if (ast._next || ast.with || ast.window || /"over":\{/.test(JSON.stringify(ast))) {
      return [{ name: 'SELECT', explanation: 'CTE・UNION・Window関数の段階分解は対象外です。実際の結果とEXPLAINを確認してください。', ...preview(engine, ast) }];
    }
    const base = copy(ast);
    Object.assign(base, { columns: star, where: null, groupby: null, having: null, orderby: null, limit: null, distinct: null });
    const out = [];
    const push = name => {
      try { out.push({ name, explanation: explanation[name], ...preview(engine, base) }); }
      catch (error) { out.push({ name, explanation: explanation[name], error: 'この段階のプレビューは生成できません: ' + error.message }); }
    };
    if (base.from) push('FROM');
    if (ast.where) { base.where = ast.where; push('WHERE'); }
    if (ast.groupby) { base.groupby = ast.groupby; base.columns = ast.columns; push('GROUP BY'); }
    if (ast.having) { base.having = ast.having; base.columns = ast.columns; push('HAVING'); }
    base.columns = ast.columns;
    push('SELECT');
    if (ast.distinct) { base.distinct = ast.distinct; push('DISTINCT'); }
    if (ast.orderby) { base.orderby = ast.orderby; push('ORDER BY'); }
    if (ast.limit?.value?.length) { base.limit = ast.limit; push('LIMIT'); }
    return out;
  }
  function structure(ast) {
    const items = [];
    const add = (label, value) => { if (value) items.push({ label, value }); };
    if (ast.type !== 'select') return [{ label: ast.type.toUpperCase(), value: sqlify(ast) }];
    add('SELECT', Array.isArray(ast.columns) ? ast.columns.map(c => expr(c.expr) + (c.as ? ' AS ' + c.as : '')).join(', ') : '*');
    add('FROM', ast.from?.map(t => (t.join ? t.join + ' ' : '') + (t.table || '(Subquery)') + (t.as ? ' AS ' + t.as : '') + (t.on ? ' ON ' + expr(t.on) : '')).join('\n'));
    add('WHERE', ast.where && expr(ast.where));
    add('GROUP BY', ast.groupby?.columns?.map(expr).join(', '));
    add('HAVING', ast.having && expr(ast.having));
    add('ORDER BY', ast.orderby?.map(o => expr(o.expr) + ' ' + o.type).join(', '));
    add('LIMIT', ast.limit?.value?.map(expr).join(', '));
    return items;
  }
  function subqueries(engine, ast) {
    const found = [];
    function visit(value) {
      if (!value || typeof value !== 'object') return;
      if (value.ast?.type === 'select') {
        try { found.push({ ...preview(engine, value.ast) }); }
        catch (_) { found.push({ sql: sqlify(value.ast), error: '相関Subquery: 外側の行を参照するため単独では実行できません。EXISTSは外側の行に対して一致する行が存在するかを判定します。' }); }
      }
      Object.values(value).forEach(visit);
    }
    visit(ast);
    return found;
  }
  L.parser = { parse, sqlify, expr, copy, steps, structure, subqueries, preview };
})(window.SQLLab);
