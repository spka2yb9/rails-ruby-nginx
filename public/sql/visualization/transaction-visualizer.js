(function (L) {
  'use strict';
  const e = L.escape;
  function sessionHTML(tx, state) {
    const wait = state.waits.find(w => w.owner === tx.name);
    const held = state.locks.filter(lock => lock.owner === tx.name);
    return '<div class="sql-tx-state ' + (tx.status === 'WAITING' ? 'sql-waiting' : '') + '"><span class="badge ' + (tx.status === 'WAITING' ? 'b-open' : 'b-genre') + '">' + e(tx.status) + '</span>' +
      '<dl><dt>Transaction</dt><dd>' + e(tx.id) + '</dd><dt>startedAt</dt><dd>' + e(tx.startedAt || '未開始') + '</dd><dt>Snapshot</dt><dd>' + (tx.snapshot === null ? '未作成 / 固定Snapshotなし' : 'Version ≤ ' + tx.snapshot) + '</dd><dt>保持Lock</dt><dd>' + (held.map(lock => e(lock.resource) + ' ' + lock.type).join(', ') || 'なし') + '</dd></dl>' +
      (wait ? '<p class="sql-notice">waiting for: ' + e(wait.resource) + '<br>held / queued by: ' + state.edges.filter(edge => edge.from === tx.name).map(edge => 'Tx ' + e(edge.to)).join(', ') + '</p>' : '') +
      '<p class="sql-last">' + e(tx.last) + '</p>' + (tx.writes.size ? '<p class="small">未コミット: ' + [...tx.writes].map(([id, balance]) => 'accounts:' + id + ' → ' + balance).join(' / ') + '</p>' : '') + '</div>';
  }
  function graphHTML(state, u) {
    const ab = state.edges.some(edge => edge.from === 'A' && edge.to === 'B');
    const ba = state.edges.some(edge => edge.from === 'B' && edge.to === 'A');
    return '<h3>Wait-for Graph</h3><svg class="sql-wait-graph" viewBox="0 0 580 160" role="img" aria-label="' + e(state.edges.map(edge => 'Tx ' + edge.from + ' waits for Tx ' + edge.to).join('。') || '待機なし') + '"><defs><marker id="sql-arrow-' + u + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs><rect x="20" y="50" width="120" height="60" rx="12"/><rect x="440" y="50" width="120" height="60" rx="12"/><text x="80" y="86">Tx A</text><text x="500" y="86">Tx B</text>' +
      (ab ? '<path class="sql-wait-edge" d="M 140 65 C 220 5, 360 5, 440 65" marker-end="url(#sql-arrow-' + u + ')"/><text x="290" y="28">A waits for B</text>' : '') +
      (ba ? '<path class="sql-wait-edge" d="M 440 95 C 360 155, 220 155, 140 95" marker-end="url(#sql-arrow-' + u + ')"/><text x="290" y="148">B waits for A</text>' : '') + '</svg>' +
      (state.cycle ? '<p class="sql-deadlock" role="alert">DEADLOCK DETECTED · ' + e(state.cycle.join(' → ')) + '</p><p>互いの持つLockを待ち、待機関係が循環しています。片方をROLLBACKすると未確定更新とLockが解放され、もう片方が再開します。この教材では犠牲Txを手動で選びます。実際のInnoDBは検出時に通常一方をロールバックします。同じ順序で行を更新すること、Txを短くすること、アプリ側で再試行することが対策です。</p>' : '<p class="small muted">' + (state.edges.length ? 'Lock Waitが発生しています。循環がなければ、この状態だけではDeadlockではありません。' : '現在、待機関係はありません。') + '</p>');
  }
  function versionsHTML(state) {
    return '<h3>MVCC · 確定Versionと読み取り結果</h3><p class="small">VersionはCOMMITごとに増える学習用番号です。Snapshotは参照できる確定Versionの上限。実際のInnoDBのRead View・Undo構造は簡略化しています。</p><div class="sql-comparison">' +
      [...state.versions].map(([id, versions]) => '<div class="sql-group"><h4>accounts.id = ' + id + '</h4>' +
        Object.values(state.sessions).filter(tx => tx.writes.has(id)).map(tx => '<div class="sql-version sql-pending">未確定 · ' + e(tx.id) + '<br>balance = ' + tx.writes.get(id) + Object.values(state.sessions).filter(reader => { const last = reader.visible.get(id); return last?.version === 'pending' && last.creator === tx.id && last.balance === tx.writes.get(id); }).map(reader => '<span class="badge b-open">← Tx ' + reader.name + ' の直近SELECT（未確定）</span>').join('') + '</div>').join('') +
        [...versions].reverse().map(v => '<div class="sql-version"><b>Version ' + v.version + ' · balance = ' + v.balance + '</b><span>created by ' + e(v.creator) + '</span>' + Object.values(state.sessions).filter(tx => tx.visible.get(id)?.version === v.version).map(tx => '<span class="badge b-genre">← Tx ' + tx.name + ' の直近SELECT</span>').join('') + '</div>').join('<div class="sql-version-arrow">↑</div>') + '</div>').join('') + '</div>' +
      '<p class="small muted">矢印は各Txが最後に読んだ結果を示します。COMMIT後やIsolationの設定変更後も、次にSELECTするまではその履歴を表示します。</p>';
  }
  L.mountSimulator = function (root, sim) {
    // 1ページに複数のシミュレーターを置けるよう、id に埋め込みごとの番号を付ける（rails-ruby-nginx で追加）
    const u = L.uid = (L.uid || 0) + 1;
    root.innerHTML = '<h2>Transaction / Lock / MVCC</h2><p class="sql-notice"><b>Learning Simulator</b><br>MySQL / InnoDBを参考にした簡略モデルです。実際のSQL実行用DBとは独立しています。accountsの2行・行単位のS / X Lockを扱います。gap / next-key lock、範囲検索、Phantom、Undoの回収、タイムアウトは再現しません。</p>' +
      '<div data-sql-scenario></div><div class="sql-comparison">' + ['A', 'B'].map(name => '<section class="card sql-session" data-session="' + name + '"><h3>Transaction ' + name + '</h3><label for="sql-isolation-' + u + '-' + name + '">Isolation Level</label><select id="sql-isolation-' + u + '-' + name + '">' + L.isolationLevels.map(level => '<option' + (level === sim.sessions[name].level ? ' selected' : '') + '>' + level + '</option>').join('') + '</select><div class="sql-actions"><button data-tx-action="begin">BEGIN</button><button data-tx-action="commit">COMMIT</button><button data-tx-action="rollback">ROLLBACK</button></div><label for="sql-tx-editor-' + u + '-' + name + '">セッションSQL（1文）</label><textarea id="sql-tx-editor-' + u + '-' + name + '" spellcheck="false">' + (name === 'A' ? 'SELECT balance FROM accounts WHERE id = 1;' : 'UPDATE accounts SET balance = 5000 WHERE id = 1;') + '</textarea><div class="sql-actions"><button data-tx-action="execute" class="sql-primary">SQL実行</button><button data-tx-sample="read">SELECT</button><button data-tx-sample="shared">S LOCK</button><button data-tx-sample="exclusive">X LOCK</button></div><div class="sql-session-state"></div></section>').join('') + '</div><p data-sql-sim-error role="alert"></p><div class="sql-actions"><button data-sim-reset>Simulator初期化（2行とも10,000へ）</button></div><details><summary>Isolationの違い・対応SQL</summary><p>READ UNCOMMITTED: 他Txの未コミット値を読む場合があります（Dirty Read）。READ COMMITTED: 文ごとに最新の確定版。REPEATABLE READ: 最初の一貫性読み取り時のSnapshotを維持します。BEGIN時に固定するモデルではありません。SERIALIZABLE: この教材の明示的Tx内のSELECTはS Lockを取り、更新と競合します。</p><p>SELECT … FOR UPDATEはX Lock、FOR SHAREはS Lockを取るLocking Readで、最新の確定値を読みます。自分の更新は常に見えます。UPDATEも古いSnapshotではなく現在の行を更新します。全Isolationで書き込みにはX Lockが必要です。</p><pre>BEGIN;\nSELECT balance FROM accounts WHERE id = 1;\nSELECT * FROM accounts WHERE id = 2 FOR SHARE;\nSELECT balance FROM accounts WHERE id = 1 FOR UPDATE;\nUPDATE accounts SET balance = balance - 1000 WHERE id = 1;\nCOMMIT;\nROLLBACK;</pre><p>上記は1文ずつ実行してください。idは1または2、SELECT列はbalance / id / *、UPDATEは数値の代入またはbalanceの加減算に対応します。</p></details><div data-sql-sim-state aria-live="polite"></div>';
    function render() {
      const state = sim.state();
      for (const name of ['A','B']) {
        const panel = root.querySelector('[data-session="' + name + '"]');
        const tx = state.sessions[name], active = ['ACTIVE','WAITING'].includes(tx.status);
        panel.querySelector('.sql-session-state').innerHTML = sessionHTML(tx, state);
        panel.querySelector('select').value = tx.level;
        panel.querySelector('select').disabled = active;
        panel.querySelector('[data-tx-action="begin"]').disabled = active;
        panel.querySelector('[data-tx-action="commit"]').disabled = tx.status !== 'ACTIVE';
        panel.querySelector('[data-tx-action="rollback"]').disabled = !active;
        panel.querySelector('[data-tx-action="execute"]').disabled = tx.status !== 'ACTIVE';
      }
      root.querySelector('[data-sql-sim-state]').innerHTML = '<h3>Lock Table</h3>' + L.table({ columns: ['Resource','Type','Owner','State'], values: [...state.locks.map(lock => [lock.resource, lock.type + ' LOCK', 'Tx ' + lock.owner, 'HELD']), ...state.waits.map(wait => [wait.resource, wait.type + ' LOCK', 'Tx ' + wait.owner, 'WAITING'])] }) + graphHTML(state, u) + versionsHTML(state) +
        '<h3>操作ログ</h3><ol class="sql-log">' + state.log.slice(-60).map(entry => '<li value="' + entry.n + '"><b>Tx ' + entry.name + '</b> · ' + e(entry.message) + '</li>').join('') + '</ol>';
    }
    function attempt(action) {
      root.querySelector('[data-sql-sim-error]').textContent = '';
      try { action(); } catch (error) { root.querySelector('[data-sql-sim-error]').textContent = error.message; }
      render();
    }
    root.addEventListener('click', event => {
      const panel = event.target.closest('[data-session]');
      const action = event.target.closest('[data-tx-action]')?.dataset.txAction;
      const sample = event.target.closest('[data-tx-sample]')?.dataset.txSample;
      if (panel && sample) panel.querySelector('textarea').value = 'SELECT balance FROM accounts WHERE id = 1' + (sample === 'shared' ? ' FOR SHARE' : sample === 'exclusive' ? ' FOR UPDATE' : '') + ';';
      if (panel && action) attempt(() => {
        const name = panel.dataset.session;
        if (action === 'begin') sim.begin(name);
        if (action === 'commit' || action === 'rollback') sim.finish(name, action === 'commit');
        if (action === 'execute') sim.execute(name, panel.querySelector('textarea').value);
      });
      if (event.target.closest('[data-sim-reset]')) attempt(() => { sim.reset(); if (L.mountScenarios) L.mountScenarios(root.querySelector('[data-sql-scenario]'), sim, render); });
    });
    root.addEventListener('change', event => {
      if (event.target.matches('select[id^="sql-isolation-"]')) attempt(() => sim.setLevel(event.target.closest('[data-session]').dataset.session, event.target.value));
    });
    root.addEventListener('keydown', event => {
      if (event.target.matches('textarea') && (event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault(); attempt(() => sim.execute(event.target.closest('[data-session]').dataset.session, event.target.value));
      }
    });
    if (L.mountScenarios) L.mountScenarios(root.querySelector('[data-sql-scenario]'), sim, render);
    render();
    return { render };
  };
})(window.SQLLab);
