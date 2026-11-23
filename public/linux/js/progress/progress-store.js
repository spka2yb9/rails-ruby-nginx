/* 進捗の保存（localStorageのみ。サーバーもDBも使わない） */
(function () {
'use strict';

var KEY = 'lfr.progress.v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch (e) { return {}; }
}
function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
}

var ProgressStore = {
  all: load,

  get: function (caseId) { return load()[caseId] || null; },

  /* CASE終了時。最高scoreだけは上書きしない */
  record: function (caseId, result) {
    var data = load();
    var prev = data[caseId] || {};
    data[caseId] = {
      completed: true,
      correct: result.correct,
      score: result.score,
      bestScore: Math.max(result.score, prev.bestScore || 0),
      grade: result.grade,
      hintsUsed: result.hintsUsed,
      commandCount: result.commandCount,
      attempts: (prev.attempts || 0) + 1,
      updatedAt: new Date().toISOString()
    };
    save(data);
    return data[caseId];
  },

  summary: function (total) {
    var data = load(), done = 0, correct = 0, sum = 0;
    Object.keys(data).forEach(function (k) {
      if (!data[k].completed) return;
      done++;
      if (data[k].correct) correct++;
      sum += data[k].bestScore || 0;
    });
    return {
      done: done, total: total, correct: correct,
      avgScore: done ? Math.round(sum / done) : 0
    };
  },

  reset: function () { save({}); }
};

window.LFR = window.LFR || {};
window.LFR.ProgressStore = ProgressStore;
})();
