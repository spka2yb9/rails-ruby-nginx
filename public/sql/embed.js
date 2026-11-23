/*
 * rails-ruby-nginx の章の中に、SQL 教材（jinzai-draft-histery/portal/sql）の1レッスン分の実行欄を置く。
 * 元の sql-learning.js の mount から、見出し・レッスン一覧・モード切り替え・クイズを外したもの。
 * SQL 用 DB は同じページの実行欄で共有し（元の教材でもレッスン間で共有）、シミュレーターは実行欄ごとに独立させる。
 */
(function (L) {
  'use strict';
  const e = L.escape;
  const INDEX_SQL = "SELECT * FROM users WHERE email = 'alice@example.com'";
  let enginePromise;
  let uid = 0;

  function engine() {
    if (!enginePromise) enginePromise = new L.SqlEngine().init().catch(error => { enginePromise = null; throw error; });
    return enginePromise;
  }

  function lessonOf(key) {
    const index = L.lessons.findIndex(lesson => lesson.title === key);
    if (index < 0) throw new Error('レッスン「' + key + '」がありません。');
    return L.lessons[index];
  }

  /** 実行計画の欄で最初に監視する SELECT。レッスンのサンプルにある最初の SELECT（EXPLAIN QUERY PLAN は外す）を使う */
  function initialWatch(samples) {
    for (const sample of samples) {
      const sql = sample.sql.trim().replace(/;\s*$/, '');
      if (sql.includes(';')) continue;
      if (/^EXPLAIN\s+QUERY\s+PLAN\s+/i.test(sql)) return sql.replace(/^EXPLAIN\s+QUERY\s+PLAN\s+/i, '');
      if (/^(SELECT|WITH)\b/i.test(sql)) return sql;
    }
    return INDEX_SQL;
  }

  function sandboxSamples() {
    return [{ label: 'SELECT', sql: 'SELECT * FROM users;' }, ...[5, 7, 8, 9, 10, 11].flatMap(index => L.lessons[index].samples)];
  }

  function mountSimulatorEmbed(root, lesson) {
    root.innerHTML = '<div class="sql-sim-host"></div>';
    const view = L.mountSimulator(root.querySelector('.sql-sim-host'), new L.TransactionSimulator());
    if (lesson && lesson.scenario) {
      const select = root.querySelector('[data-sql-scenario] select');
      if (select && select.value !== lesson.scenario) {
        select.value = lesson.scenario;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    view.render();
  }

  async function mountEditorEmbed(root, lesson, options) {
    const db = await engine();
    if (!root.isConnected) return;
    const u = ++uid;
    const samples = lesson ? lesson.samples : sandboxSamples();
    const indexLesson = !!options.openIndex;
    const firstWatch = lesson ? initialWatch(samples) : INDEX_SQL;
    let watchSQL = firstWatch;
    let plan = null;
    root.innerHTML = '<section class="card sql-editor-card"><div class="sql-editor-heading"><label for="sql-editor-' + u + '"><b>SQL Editor</b></label><span class="badge b-plain">SQLite · in memory</span></div>' +
      '<div class="sql-actions sql-samples"><label for="sql-sample-' + u + '">Example</label><select id="sql-sample-' + u + '">' + samples.map((sample, i) => '<option value="' + i + '">' + e(sample.label) + '</option>').join('') + '</select><button type="button" data-action="sample">サンプルSQL挿入</button></div>' +
      '<textarea id="sql-editor-' + u + '" spellcheck="false" aria-describedby="sql-editor-help-' + u + '"></textarea>' +
      '<div class="sql-actions"><button type="button" data-action="run" class="sql-primary">実行 · Ctrl + Enter</button><button type="button" data-action="clear">SQLリセット</button><button type="button" data-action="reset">サンプルDB初期化</button></div>' +
      '<p id="sql-editor-help-' + u + '" class="small muted">⌘ + Enterにも対応。複数文は順に実行し、エラー前の文は取り消しません。結果は先頭200行まで。サンプルDBはこのページの実行欄で共有しています。</p>' +
      '<p class="sql-status" role="status"></p><div class="sql-error" role="alert"></div><div class="sql-result"></div></section>' +
      '<section class="sql-visual"></section>' +
      '<details class="sql-db-details"' + (indexLesson ? ' open' : '') + '><summary>Index と実行計画・Table / Schema の一覧</summary><section class="sql-index"></section><section class="sql-schema"></section></details>';
    const get = selector => root.querySelector(selector);
    const editor = get('textarea');
    editor.value = samples[0].sql;
    get('.sql-status').textContent = 'サンプルを入力しました。「実行」で結果と内部処理を表示します。';

    function safeRender(target, render) {
      try { return render(); }
      catch (error) { target.innerHTML = '<p class="sql-notice">補助表示を生成できません: ' + e(error.message) + '。SQLの実行結果は上に表示しています。</p>'; return null; }
    }
    function refreshDatabase(before) {
      plan = L.renderIndex(get('.sql-index'), db, watchSQL, before);
      safeRender(get('.sql-schema'), () => L.renderSchema(get('.sql-schema'), db));
    }
    function run() {
      get('.sql-error').textContent = '';
      get('.sql-status').textContent = '';
      const sql = editor.value;
      let result;
      try { result = db.execute(sql); }
      catch (error) {
        get('.sql-error').textContent = 'SQLite実行エラー: ' + error.message;
        get('.sql-status').textContent = error.partialResults?.length ? 'エラー前の文は実行済みです。Table一覧に現在の状態を表示しています。' : 'SQLは完了しませんでした。';
        get('.sql-result').innerHTML = L.resultHTML(error.partialResults || []);
        get('.sql-visual').innerHTML = '';
        refreshDatabase(plan);
        return;
      }
      get('.sql-result').innerHTML = L.resultHTML(result.results);
      get('.sql-status').textContent = '実行完了 · ' + result.elapsed.toFixed(1) + ' ms（描画・解析を除くブラウザ内参考値）';
      const asts = safeRender(get('.sql-visual'), () => L.renderQuery(get('.sql-visual'), db, sql)) || [];
      const selectIndex = asts.findLastIndex(ast => ast.type === 'select');
      const select = asts[selectIndex];
      let nextSQL = watchSQL;
      if (select) nextSQL = result.results[selectIndex]?.sql || L.parser.sqlify(select);
      else if (/^\s*EXPLAIN\s+QUERY\s+PLAN\s+/i.test(sql)) nextSQL = sql.replace(/^\s*EXPLAIN\s+QUERY\s+PLAN\s+/i, '').trim().replace(/;\s*$/, '');
      else if (/^\s*(SELECT|WITH)\b/i.test(sql) && !asts.length) nextSQL = sql.trim().replace(/;\s*$/, '');
      const before = nextSQL === watchSQL ? plan : null;
      watchSQL = nextSQL;
      refreshDatabase(before);
    }
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || button.disabled || !root.contains(button)) return;
      const action = button.dataset.action;
      if (action === 'run') run();
      if (action === 'sample') { editor.value = samples[+get('select').value].sql; editor.focus(); get('.sql-status').textContent = 'サンプルを入力しました。実行すると反映されます。'; }
      if (action === 'clear') { editor.value = ''; editor.focus(); }
      if (action === 'reset') {
        db.reset(); plan = null; watchSQL = firstWatch;
        get('.sql-result').innerHTML = ''; get('.sql-visual').innerHTML = ''; get('.sql-error').textContent = '';
        get('.sql-status').textContent = 'SQL用サンプルDBを初期化しました。このページのほかの実行欄にも反映されます。入力SQLは保持しています。';
        refreshDatabase(null);
      }
      if (button.dataset.generate) {
        get('.sql-error').textContent = '';
        try { db.generate(+button.dataset.generate); refreshDatabase(plan); get('.sql-status').textContent = button.dataset.generate + '行を追加しました。現在のSELECTを再実行すると結果・段階表示も更新されます。'; }
        catch (error) { get('.sql-error').textContent = error.message; }
      }
    });
    editor.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); run(); } });
    refreshDatabase(null);
  }

  /** options: { lesson: 'SELECT' などのレッスン名 | 'sandbox' | 'simulator', openIndex: boolean } */
  L.mountEmbed = async function (root, options) {
    const key = options.lesson;
    if (key === 'simulator') return mountSimulatorEmbed(root, null);
    const lesson = key === 'sandbox' ? null : lessonOf(key);
    if (lesson && lesson.simulator) return mountSimulatorEmbed(root, lesson);
    return mountEditorEmbed(root, lesson, options);
  };
})(window.SQLLab);
