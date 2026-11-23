(function (L) {
  'use strict';
  const read = 'SELECT balance FROM accounts WHERE id = 1;';
  const update = 'UPDATE accounts SET balance = 5000 WHERE id = 1;';
  L.scenarios = {
    transfer: { title: '送金 · まとめて確定', steps: [['A','BEGIN'], ['A','UPDATE accounts SET balance = balance - 1000 WHERE id = 1;'], ['A','UPDATE accounts SET balance = balance + 1000 WHERE id = 2;'], ['A','COMMIT']] },
    lock: { title: 'Lock Wait · 解放で再開', steps: [['A','BEGIN'], ['A',update], ['B','BEGIN'], ['B','UPDATE accounts SET balance = balance - 1000 WHERE id = 1;'], ['A','COMMIT'], ['B','COMMIT']] },
    shared: { title: 'Shared Lock · 共存と競合', steps: [['A','BEGIN'], ['B','BEGIN'], ['A',read.replace(';',' FOR SHARE;')], ['B',read.replace(';',' FOR SHARE;')], ['A',update], ['B','COMMIT'], ['A','COMMIT']] },
    isolation: { title: 'Isolation / MVCC · 読み直し比較', steps: [['A','BEGIN'], ['A',read], ['B','BEGIN'], ['B',update], ['B','COMMIT'], ['A',read]], serial: [['A','BEGIN'], ['A',read], ['B','BEGIN'], ['B',update], ['A',read], ['A','COMMIT'], ['B','COMMIT'], ['A','BEGIN'], ['A',read]] },
    dirty: { title: 'Dirty Read · 未確定値とROLLBACK', steps: [['A','BEGIN'], ['B','BEGIN'], ['B',update], ['A',read], ['B','ROLLBACK'], ['A',read]] },
    deadlock: { title: 'Deadlock · 待機の循環', steps: [['A','BEGIN'], ['B','BEGIN'], ['A','UPDATE accounts SET balance = 9000 WHERE id = 1;'], ['B','UPDATE accounts SET balance = 8000 WHERE id = 2;'], ['A','UPDATE accounts SET balance = 9000 WHERE id = 2;'], ['B','UPDATE accounts SET balance = 8000 WHERE id = 1;']] }
  };
  L.mountScenarios = function (root, sim, render) {
    const u = L.uid = (L.uid || 0) + 1;
    let steps = [], index = 0;
    root.innerHTML = '<section class="sql-scenario card"><h3>再現シナリオ · 1ステップずつ観察</h3><p class="small">A / BのIsolation Levelを選んでから開始します。開始時はSimulatorだけを初期化し、選択した分離レベルを引き継ぎます。Dirty ReadはAをREAD UNCOMMITTEDに設定してください。</p><div class="sql-actions"><label for="sql-scenario-select-' + u + '">シナリオ</label><select id="sql-scenario-select-' + u + '">' + Object.entries(L.scenarios).map(([key, scenario]) => '<option value="' + key + '">' + scenario.title + '</option>').join('') + '</select><button data-scenario-start>初期化して開始</button><button data-scenario-next disabled class="sql-primary">次のステップ</button></div><p class="sql-scenario-status" role="status">シナリオを選んで開始してください。</p><p class="sql-scenario-error" role="alert"></p></section>';
    const status = root.querySelector('.sql-scenario-status');
    const errorBox = root.querySelector('.sql-scenario-error');
    const next = root.querySelector('[data-scenario-next]');
    root.querySelector('select').onchange = () => {
      steps = []; index = 0; next.disabled = true; errorBox.textContent = '';
      status.textContent = 'シナリオを切り替えました。「初期化して開始」で選択した手順を開始します。';
    };
    function update() { next.disabled = index >= steps.length; status.textContent = index >= steps.length ? '手順完了。Lock・Versionを確認し、必要に応じて各TxをCOMMIT / ROLLBACKしてください。' : index + ' / ' + steps.length + ' 完了 · 次: Tx ' + steps[index][0] + ' — ' + steps[index][1]; }
    root.onclick = event => {
      errorBox.textContent = '';
      if (event.target.closest('[data-scenario-start]')) {
        const levels = [sim.sessions.A.level, sim.sessions.B.level];
        sim.reset(); sim.setLevel('A', levels[0]); sim.setLevel('B', levels[1]);
        const scenario = L.scenarios[root.querySelector('select').value];
        steps = levels[0] === 'SERIALIZABLE' && scenario.serial ? scenario.serial : scenario.steps;
        index = 0; update(); render();
      }
      if (event.target.closest('[data-scenario-next]') && index < steps.length) {
        try { const [name, sql] = steps[index]; sim.execute(name, sql); index++; }
        catch (error) { errorBox.textContent = error.message + ' 手動操作で前提が変わった場合は、シナリオを再開始してください。'; }
        update(); render();
      }
    };
  };
})(window.SQLLab);
