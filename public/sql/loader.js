/*
 * SQL 教材のスクリプトを順に読み込み、章の中の実行欄を作る。
 * 元の portal/sql/loader.js をもとに、読み込み元のパスを引数で受け取り、sql-learning.js の代わりに embed.js を使う。
 */
(function () {
  'use strict';
  let loading;
  const loaded = new Set();
  window.SQLLab = window.SQLLab || {};
  const files = ['vendor/sql-asm.js', 'database/schema.js', 'database/seed.js',
    'database/sql-engine.js', 'vendor/mysql.umd.js', 'parser/sql-parser.js',
    'simulator/lock-manager.js', 'simulator/mvcc.js', 'simulator/isolation.js', 'simulator/deadlock.js', 'simulator/transaction.js', 'simulator/scenarios.js', 'lessons/lessons.js',
    'visualization/common.js', 'visualization/query-visualizer.js', 'visualization/index-visualizer.js', 'visualization/transaction-visualizer.js', 'embed.js'];
  function load(base) {
    if (!loading) {
      if (!document.querySelector('link[data-sql-learning]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = base + 'sql-learning.css';
        link.dataset.sqlLearning = '';
        document.head.appendChild(link);
      }
      loading = files.reduce((promise, file) => promise.then(() => {
        if (loaded.has(file)) return;
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = base + file;
          script.onload = () => { loaded.add(file); resolve(); };
          script.onerror = () => { script.remove(); reject(new Error(file + ' を読み込めませんでした。ページを再読み込みしてください。')); };
          document.head.appendChild(script);
        });
      }), Promise.resolve()).catch(error => { loading = null; throw error; });
    }
    return loading;
  }
  window.SQLLearning = {
    /** base は sql/ ディレクトリの URL（末尾に / を付ける）。options は embed.js の mountEmbed に渡す。 */
    async embed(root, base, options) {
      try {
        await load(base);
        if (root.isConnected) await window.SQLLab.mountEmbed(root, options);
      } catch (error) {
        if (root.isConnected) root.textContent = '初期化エラー: ' + error.message;
      }
    }
  };
})();
