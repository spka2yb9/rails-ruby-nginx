(function (L) {
  'use strict';
  L.escape = value => String(value == null ? 'NULL' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  L.table = function (result, limit = 200) {
    if (!result || !result.columns.length) return '<p class="muted">結果セットなし</p>';
    return '<div class="sql-table"><table><thead><tr>' + result.columns.map(c => '<th>' + L.escape(c) + '</th>').join('') +
      '</tr></thead><tbody>' + result.values.slice(0, limit).map(row => '<tr>' + row.map(v => '<td>' + (v === null ? '<span class="muted">NULL</span>' : L.escape(v)) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table></div><p class="small muted">' + (result.truncated || result.values.length > limit ? '先頭' + Math.min(limit, result.values.length) + '行を表示（続きはLIMIT / OFFSETで確認）' : result.values.length + '行') + '</p>';
  };
  L.resultHTML = results => results.map((r, i) => '<div><h3>結果 ' + (i + 1) + '</h3>' + (r.columns.length ? L.table(r) : /^\s*(INSERT|UPDATE|DELETE|REPLACE)\b/i.test(r.sql || '') ? '<p>実行完了 · 変更行数 ' + r.changes + '</p>' : '<p>実行完了（DDL等は結果行を返しません）。</p>') + '</div>').join('');
})(window.SQLLab);
