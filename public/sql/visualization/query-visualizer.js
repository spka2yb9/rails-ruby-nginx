(function (L) {
  'use strict';
  const e = L.escape;
  function joinHTML(engine, ast) {
    if (!ast.from || ast.from.length < 2 || ast.from.some(t => !t.table)) return '';
    const data = L.parser.copy(ast);
    Object.assign(data, { columns: [], where: null, groupby: null, having: null, orderby: null, limit: null, distinct: null });
    ast.from.forEach((table, index) => {
      const schema = engine.getSchema(table.table).values;
      const key = schema.find(row => row[5]) || schema[0];
      if (!key) throw new Error('JOIN元のSchemaを取得できません。');
      const label = schema.find(row => row[1] === 'name');
      [key, label].filter(Boolean).forEach(column => data.columns.push({ expr: { type: 'column_ref', table: table.as || table.table, column: column[1] }, as: (table.as || table.table) + '_' + column[1] }));
    });
    const result = L.parser.preview(engine, data).result;
    return '<h3>JOIN: 行の対応</h3><p class="small">入力されたON条件を実行した対応表です。WHERE適用前。INNERは一致行、LEFTは不一致行も保持、CROSSは全組み合わせです。RIGHT JOINの対応はSQLiteのバージョンに依存します。</p>' +
      '<div class="sql-relations">' + result.values.slice(0, 30).map(row => '<div class="sql-relation">' + row.map((v, i) => '<span><small class="muted">' + e(result.columns[i]) + '</small> ' + (v === null ? 'NULL · no match' : e(v)) + '</span>').join('<b aria-hidden="true">↔</b>') + '</div>').join('') + '</div><p class="small muted">対応は先頭30行まで。元の表も確認できます。</p>' +
      ast.from.map(t => '<details><summary>' + e(t.table) + '</summary>' + L.table(engine.query('SELECT * FROM ' + L.quoteIdentifier(t.table) + ' LIMIT 31'), 30) + '</details>').join('');
  }
  function groupsHTML(engine, ast) {
    if (!ast.groupby?.columns?.length) return '';
    const keys = ast.groupby.columns;
    const data = L.parser.copy(ast);
    Object.assign(data, { groupby: null, having: null, orderby: null, limit: null, distinct: null,
      columns: [...keys.map((expr, i) => ({ expr, as: '__group_' + i })), { expr: { type: 'column_ref', table: null, column: '*' }, as: null }] });
    const result = L.parser.preview(engine, data).result;
    const groups = new Map();
    result.values.forEach(row => { const key = JSON.stringify(row.slice(0, keys.length)); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(row.slice(keys.length)); });
    return '<h3>GROUP BY: 行をグループへ</h3><p class="small">WHEREを通過した行をキー別に配置しています。' + (result.truncated ? '先頭200行の抜粋であり、集約値の全件数とは異なります。' : '') + '</p><div class="sql-group-grid">' +
      [...groups.entries()].slice(0, 20).map(([key, rows]) => '<div class="sql-group"><b>' + e(keys.map(L.parser.expr).join(', ')) + ' = ' + e(JSON.parse(key).map(v => v === null ? 'NULL' : v).join(', ')) + '</b><ul>' + rows.slice(0, 6).map(row => '<li>' + e(row.join(' · ')) + '</li>').join('') + '</ul><span class="badge b-genre">表示対象内 COUNT = ' + rows.length + '</span></div>').join('') + '</div><p class="small muted">グループは先頭20組、メンバーは各6行まで。正確な集約値は処理段階のGROUP BYで確認できます。</p>';
  }
  L.renderQuery = function (container, engine, sql) {
    let asts;
    try { asts = L.parser.parse(sql); }
    catch (error) {
      container.innerHTML = '<p class="sql-notice">MySQL AST解析対象外: ' + e(error.message.slice(0, 240)) + '<br>SQLiteでのSQL実行とは独立した結果です。EXPLAIN QUERY PLANなどSQLite固有構文は解析できない場合があります。</p>';
      return [];
    }
    const ast = asts.filter(a => a.type === 'select').at(-1) || asts.at(-1);
    if (!ast) { container.innerHTML = ''; return []; }
    const steps = L.parser.steps(engine, ast);
    let extras = '';
    if (ast.type === 'select') {
      for (const renderer of [joinHTML, groupsHTML]) {
        try { extras += renderer(engine, ast); }
        catch (error) { extras += '<p class="small muted">対応図の生成対象外: ' + e(error.message) + '</p>'; }
      }
      const subs = L.parser.subqueries(engine, ast);
      if (subs.length) extras += '<h3>Subquery: 内側の結果 → 外側の条件／表</h3><p class="small">理解のための分解です。実際の物理的な実行順や回数はOptimizerが決めます。</p>' + subs.map(s => '<pre>' + e(s.sql) + '</pre>' + (s.error ? '<p>' + e(s.error) + '</p>' : L.table(s.result, 30))).join('') + '<p>↓ 内側の結果を使って外側のSQLを評価（結果は上の実行結果）</p>';
    }
    container.innerHTML = '<h2>SQLの構造と内部処理</h2><h3>記述順 · MySQL ASTから生成</h3><div class="sql-structure">' +
      L.parser.structure(ast).map(item => '<div><b>' + e(item.label) + '</b><pre>' + e(item.value) + '</pre></div>').join('') + '</div>' +
      (steps.length ? '<h3>論理的な処理順 · ステップをクリック</h3><p class="small muted">学習用にSELECTを分解して再実行したプレビューです。物理的な実行計画とは異なります。複数SQLでは最後のSELECTを実行後のDB状態で可視化します。</p><div class="sql-flow">' + steps.map((s, i) => '<button data-step="' + i + '" aria-pressed="' + (i === 0) + '">' + e(s.name) + '</button>').join('<span aria-hidden="true">→</span>') + '</div><div class="sql-step-view"></div>' : '<p>書き込みSQLの結果はTable一覧から確認できます。SELECTを実行すると各段階の行を表示します。</p>') + extras +
      '<details><summary>SQL AST（全ステートメント）</summary><pre>' + e(JSON.stringify(asts, null, 2)) + '</pre></details>';
    function selectStep(index) {
      const step = steps[index];
      container.querySelectorAll('[data-step]').forEach(button => button.setAttribute('aria-pressed', String(+button.dataset.step === index)));
      container.querySelector('.sql-step-view').innerHTML = '<p>' + e(step.explanation) + '</p>' + (step.error ? '<p class="muted">' + e(step.error) + '</p>' : L.table(step.result, 40) + '<details><summary>この段階のプレビューSQL</summary><pre>' + e(step.sql) + '</pre></details>');
    }
    container.onclick = event => { const button = event.target.closest('[data-step]'); if (button) selectStep(+button.dataset.step); };
    if (steps.length) selectStep(0);
    return asts;
  };
})(window.SQLLab);
