/* Investigation Score
   ------------------------------------------------------------------
   「コマンド数が少ないほど高得点」にはしない。
   推測で答えたか、証拠を見てから答えたか、を測る。                    */
(function () {
'use strict';

var GRADES = [
  { min: 90, g: 'S', word: '証拠に基づいて詰め切れています' },
  { min: 75, g: 'A', word: '実務で通用する調査です' },
  { min: 60, g: 'B', word: '筋は通っています。裏取りを増やせます' },
  { min: 40, g: 'C', word: '当たりは付きました。証拠が足りません' },
  { min: 0,  g: 'D', word: 'まだ推測の域を出ていません' }
];

function compute(scenario, investigation, answer) {
  var inv = investigation;
  var evidence = scenario.evidence || [];
  var totalWeight = evidence.reduce(function (a, e) { return a + e.weight; }, 0) || 1;

  var hit = [], missed = [];
  evidence.forEach(function (e) {
    (inv.facts[e.key] ? hit : missed).push(e);
  });
  var hitWeight = hit.reduce(function (a, e) { return a + e.weight; }, 0);
  var ratio = hitWeight / totalWeight;

  var parts = [];
  var correctPts = answer.correct ? 40 : 0;
  parts.push({ label: '回答が調査結果と合っている', pts: correctPts, max: 40 });

  var evidencePts = Math.round(45 * ratio);
  parts.push({ label: '証拠を自分で確認した', pts: evidencePts, max: 45 });

  var bonus = ratio >= 0.7 ? 15 : ratio >= 0.45 ? 8 : 0;
  parts.push({ label: '推測ではなく証拠で判断した', pts: bonus, max: 15 });

  var dangerPenalty = -Math.min(10, inv.dangerousCommands.length * 5);
  if (dangerPenalty) parts.push({ label: '危険な操作を試みた', pts: dangerPenalty, max: 0 });

  /* 無関係な操作を大量にした場合のみ減点。多く打つこと自体は罰しない */
  var noisePenalty = (inv.commandCount > 30 && ratio < 0.5) ? -5 : 0;
  if (noisePenalty) parts.push({ label: '手当たり次第に打っていた', pts: noisePenalty, max: 0 });

  var score = Math.max(0, Math.min(100,
    correctPts + evidencePts + bonus + dangerPenalty + noisePenalty));

  var grade = GRADES.filter(function (g) { return score >= g.min; })[0];

  return {
    score: score, grade: grade.g, gradeWord: grade.word,
    parts: parts, hit: hit, missed: missed, ratio: ratio,
    correct: answer.correct, hintsUsed: inv.hintsUsed,
    commandCount: inv.commandCount,
    dangerous: inv.dangerousCommands.slice()
  };
}

function render(el, result) {
  var rows = result.parts.map(function (p) {
    var cls = p.pts < 0 ? 'neg' : p.pts === p.max && p.max > 0 ? 'full' : '';
    return '<li class="' + cls + '"><span>' + p.label + '</span><b>' +
           (p.pts > 0 ? '+' : '') + p.pts + '</b></li>';
  }).join('');

  var hitHtml = result.hit.length
    ? '<ul class="ev ok">' + result.hit.map(function (e) { return '<li>✓ ' + e.label + '</li>'; }).join('') + '</ul>'
    : '';
  var missHtml = result.missed.length
    ? '<ul class="ev ng">' + result.missed.map(function (e) { return '<li>— ' + e.label + '</li>'; }).join('') + '</ul>'
    : '';

  el.innerHTML =
    '<div class="score-head">' +
      '<div class="grade grade-' + result.grade + '">' + result.grade + '</div>' +
      '<div class="score-num"><b>' + result.score + '</b><span>/ 100</span>' +
        '<p>' + result.gradeWord + '</p></div>' +
    '</div>' +
    '<ul class="score-parts">' + rows + '</ul>' +
    '<div class="score-ev">' +
      '<h4>集めた証拠</h4>' + (hitHtml || '<p class="muted">証拠として記録されたものはありません。</p>') +
      (missHtml ? '<h4>確認できたはずのもの</h4>' + missHtml : '') +
    '</div>' +
    '<p class="score-foot">次に試すときは、未確認だった項目を一つ選んで出力を比べてみましょう。</p>';
}

window.LFR = window.LFR || {};
window.LFR.Score = { compute: compute, render: render };
})();
