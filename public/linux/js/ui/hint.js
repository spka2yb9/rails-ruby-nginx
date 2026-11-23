/* ヒント — 3段階。最初から答えは出さない */
(function () {
'use strict';

function Hint(el, scenario, runtime) {
  this.el = el; this.scenario = scenario; this.runtime = runtime;
  this.shown = 0;
  this.render();
}

Hint.prototype.render = function () {
  var esc = window.LFR.text2html;
  var hints = this.scenario.hints || [];
  var self = this;
  var html = '';
  if (!hints.length) { this.el.innerHTML = '<p class="muted">この演習のヒントは以上です。</p>'; return; }

  html += '<p class="muted small">必要な分だけヒントを開き、次に確認する場所を決めましょう。</p>';
  html += '<ol class="hints">';
  hints.forEach(function (h, i) {
    if (i < self.shown) {
      html += '<li class="open" tabindex="-1"><span class="badge">ヒント' + (i + 1) + '</span><div class="body">' + esc(h) + '</div></li>';
    } else if (i === self.shown) {
      html += '<li><button class="btn ghost" data-hint="' + i + '">ヒント' + (i + 1) + ' を見る</button></li>';
    }
  });
  html += '</ol>';
  this.el.innerHTML = html;

  var btn = this.el.querySelector('[data-hint]');
  if (btn) btn.addEventListener('click', function () {
    self.shown++;
    self.runtime.useHint();
    self.render();
    self.el.querySelectorAll('.open')[self.shown - 1].focus();
  });
};

window.LFR = window.LFR || {};
window.LFR.Hint = Hint;
})();
