/* 4択問題・解説・推奨調査ルート
   Terminalを1回も触っていないうちは回答できない。               */
(function () {
'use strict';

function Quiz(el, scenario, runtime, onFinish) {
  this.el = el; this.scenario = scenario; this.runtime = runtime;
  this.onFinish = onFinish;
  this.selected = null;
  this.answered = false;
  this.render();
}

Quiz.prototype._evidenceRatio = function () {
  var ev = this.scenario.evidence || [];
  if (!ev.length) return 0;
  var inv = this.runtime.investigation;
  var total = 0, hit = 0;
  ev.forEach(function (e) { total += e.weight; if (inv.facts[e.key]) hit += e.weight; });
  return hit / total;
};

Quiz.prototype.render = function () {
  if (this.answered) return;
  var esc = window.LFR.esc;
  var q = this.scenario.question;
  var self = this;

  var html =
    '<div class="quiz-head"><h2 id="case-question">' + esc(q.text) + '</h2>' +
      '<div class="meter" title="回答に使える証拠の集まり具合">' +
        '<div class="meter-bar"><i></i></div><span></span>' +
      '</div>' +
    '</div>';

  html += '<ul class="choices" role="radiogroup" aria-labelledby="case-question">';
  q.choices.forEach(function (c, i) {
    html += '<li><label><input type="radio" name="q" value="' + i + '">' +
            '<span class="key">' + 'ABCD'[i] + '</span>' +
            '<span class="txt">' + esc(c) + '</span></label></li>';
  });
  html += '</ul>';

  html += '<div class="quiz-foot">' +
    '<button class="btn primary" id="q-submit" disabled>回答する</button>' +
    '<span class="gate"></span></div><div class="answer-feedback"></div>';

  this.el.innerHTML = html;
  this.refresh();

  this.el.querySelectorAll('input[name=q]').forEach(function (r) {
    r.addEventListener('change', function () {
      self.selected = Number(r.value);
      self.el.querySelectorAll('.choices label').forEach(function (label) {
        label.classList.toggle('sel', label.querySelector('input').checked);
      });
      self.el.querySelector('#q-submit').disabled = false;
    });
  });
  var btn = this.el.querySelector('#q-submit');
  if (btn) btn.addEventListener('click', function () { self.submit(); });
};

/* 調査中は選択肢をそのままにして、入力の可否と証拠の割合だけを更新する。 */
Quiz.prototype.refresh = function () {
  if (this.answered) return;
  var ready = this.runtime.investigation.commandCount > 0;
  var percent = Math.round(this._evidenceRatio() * 100) + '%';
  this.el.querySelectorAll('input[name=q]').forEach(function (r) { r.disabled = !ready; });
  this.el.querySelector('#q-submit').disabled = !ready || this.selected === null;
  this.el.querySelector('.meter-bar i').style.width = percent;
  this.el.querySelector('.meter span').textContent = '証拠 ' + percent;
  this.el.querySelector('.gate').textContent = ready
    ? '端末の出力を根拠に選んでください。'
    : '端末でコマンドを1つ実行すると回答を選べます。';
};

Quiz.prototype.submit = function () {
  if (this.answered || this.selected === null || !this.runtime.investigation.commandCount) return;
  this.answered = true;
  var esc = window.LFR.esc, t2h = window.LFR.text2html;
  var q = this.scenario.question;
  var correct = this.selected === q.answer;
  var self = this;

  var result = window.LFR.Score.compute(this.scenario, this.runtime.investigation, { correct: correct });

  var html = '<div class="result ' + (correct ? 'ok' : 'ng') + '">' +
    '<h2 class="verdict" tabindex="-1">' + (correct ? '正解です' : '答えと根拠を確認しましょう') + '</h2>' +
    '<p class="chosen">あなたの回答: <b>' + 'ABCD'[this.selected] + '. ' + esc(q.choices[this.selected]) + '</b></p>' +
    (correct ? '' : '<p class="chosen">正解: <b>' + 'ABCD'[q.answer] + '. ' + esc(q.choices[q.answer]) + '</b></p>') +
    '</div>';

  if (!correct && q.explain && q.wrong && q.wrong[this.selected]) {
    html += '<section class="panel"><h3>なぜその選択肢ではないのか</h3><div class="prose">' +
            t2h(q.wrong[this.selected]) + '</div></section>';
  }

  html += '<section class="answer-explanation"><h3>出力から分かること</h3><div class="prose">' + t2h(q.explain) + '</div></section>';

  if (this.scenario.route) {
    var r = this.scenario.route;
    html += '<details class="reference"><summary>調査の進め方を振り返る</summary><div class="reference-body">' +
            '<ol class="route">' + r.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
            '<h4>対応するコマンド</h4>' +
            '<div class="cmds">' + r.commands.map(function (c) {
              return '<button class="cmd" data-cmd="' + esc(c) + '">' + esc(c) + '</button>';
            }).join('') + '</div>' +
            (r.note ? '<div class="prose note">' + t2h(r.note) + '</div>' : '') +
            '</div></details>';
  }

  html += '<details class="reference"><summary>調査記録と採点の内訳</summary><div class="reference-body" id="score-box"></div></details>';
  var ids = window.LFR.Lessons.readyIds();
  var nextId = ids[ids.indexOf(this.scenario.id) + 1];
  var next = nextId && window.LFR.scenarios.def(nextId);
  html += '<div class="quiz-foot result-actions">' +
          (next ? '<a class="btn primary" id="q-next" href="#/' + esc(next.id) + '">次の演習へ　' + esc(next.title) + ' →</a>' : '') +
          '<button class="btn ghost" id="q-retry">この演習をやり直す</button></div>';

  this.el.querySelectorAll('input[name=q]').forEach(function (r) { r.disabled = true; });
  this.el.querySelector('.quiz-foot').hidden = true;
  this.el.querySelector('.answer-feedback').innerHTML = html;
  window.LFR.Score.render(this.el.querySelector('#score-box'), result);

  this.el.querySelector('#q-retry').addEventListener('click', function () { self.onFinish({ type: 'retry' }); });

  this.onFinish({ type: 'answered', correct: correct, result: result });
};

window.LFR = window.LFR || {};
window.LFR.Quiz = Quiz;
})();
