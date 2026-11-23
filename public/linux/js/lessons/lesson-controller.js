/* CASE画面の組み立てと、Runtime→UIの配線 */
(function () {
'use strict';

function LessonController(refs, runtime, terminal) {
  this.refs = refs;
  this.runtime = runtime;
  this.terminal = terminal;
  this.scenario = null;
  this.quiz = null;
  this.loading = Promise.resolve();
  this.dangers = [];
  this.answered = false;

  var self = this;
  runtime.on('command', function () { self.afterCommand(); });
  runtime.on('investigation', function () { self.renderInvestigation(); });
  runtime.on('danger', function (d) { self.showDanger(d); });
}

LessonController.prototype.open = function (scenario, onNav) {
  var self = this;
  this.scenario = scenario;
  this.onNav = onNav;
  this.dangers = [];
  this.answered = false;

  this.quiz = null;
  this.refs.work.inert = true;
  this.refs.work.setAttribute('aria-busy', 'true');
  this.refs.quiz.innerHTML = '<p role="status">練習環境を準備しています…</p>';
  this.refs.head.innerHTML = this.headHtml(scenario);
  this.renderLeft();

  /* 同じ端末を使うので、連続して別の演習を開いても初期化を重ねない。 */
  this.loading = Promise.all([this.loading, this.terminal.stop()]).then(function () {
    if (self.scenario === scenario) return self.runtime.resetScenario(scenario);
  }).then(function () {
    if (self.scenario !== scenario) return;
    self.terminal.reset();
    self.quiz = new window.LFR.Quiz(self.refs.quiz, scenario, self.runtime, function (ev) { self.onQuiz(ev); });
    self.renderInvestigation();
    self.refs.work.inert = false;
    self.refs.work.removeAttribute('aria-busy');
  }).catch(function () {
    if (self.scenario !== scenario) return;
    self.refs.work.inert = false;
    self.refs.work.removeAttribute('aria-busy');
    self.refs.left.innerHTML = '<p role="alert">練習環境を準備できませんでした。</p><button class="btn" id="retry-load">読み込み直す</button>';
    self.refs.left.querySelector('#retry-load').onclick = function () { onNav({ type: 'retry' }); };
    self.refs.quiz.textContent = '';
  });
  return this.loading;
};

LessonController.prototype.headHtml = function (s) {
  var esc = window.LFR.esc;
  var lessons = window.LFR.Lessons;
  var index = lessons.intro.findIndex(function (c) { return c.id === s.id; });
  var label = index >= 0 ? '入門コース　' + (index + 1) + ' / ' + lessons.intro.length
    : lessons.curriculum.find(function (lv) { return lv.level === s.level; }).name;
  return '<header class="case-title"><p class="case-location">第6部　サーバ運用　/　' + esc(label) + '</p><h1 tabindex="-1">' + esc(s.title) + '</h1>' +
    (s.subtitle ? '<p class="sub">' + esc(s.subtitle) + '</p>' : '') + '</header>';
};

/* 監視ツールから飛んでくる通知。サーバーに入る前に読む一次情報。 */
LessonController.prototype.alertHtml = function (a) {
  var esc = window.LFR.esc;
  function row(label, value, cls) {
    if (!value) return '';
    return '<div class="' + (cls || '') + '"><dt>' + esc(label) + '</dt><dd>' + esc(value) + '</dd></div>';
  }
  return '<section class="panel alert-card">' +
    '<div class="alert-head">' +
      '<span class="src">' + esc(a.source || 'Alert') + '</span>' +
      '<span class="prj">' + esc(a.project || '') + '</span>' +
      (a.count ? '<span class="count">' + esc(a.count) + ' occurrences</span>' : '') +
    '</div>' +
    '<h3 class="alert-title">' + esc(a.title || '') + '</h3>' +
    (a.message ? '<p class="alert-msg">' + esc(a.message) + '</p>' : '') +
    '<dl class="alert-meta">' +
      row('発生', a.occurredAt) +
      row('箇所', a.component) +
      row('影響', a.users) +
      row('request_id', a.requestId, 'mono') +
      row('直近のデプロイ', a.deploy) +
      row('環境', a.env) +
    '</dl>' +
    (a.note ? '<p class="alert-note">' + esc(a.note) + '</p>' : '') +
    '</section>';
};

/* ボタンは入力欄にコマンドを置く。実行するタイミングは読者が決める。 */
function commandButton(cmd) {
  var safe = window.LFR.esc(cmd);
  return '<button class="cmd" data-cmd="' + safe + '" aria-label="端末に入力　' + safe + '">' + safe + '</button>';
}

LessonController.prototype.renderLeft = function () {
  var s = this.scenario;
  var esc = window.LFR.esc, t2h = window.LFR.text2html;
  var prompt = '<p class="input-help">コマンドを選ぶと端末に入力されます。Enter キーか「実行」で試しましょう。</p>';
  var paragraphs = s.description.trim().split(/\n\s*\n/);
  var lead = !s.guide.length && paragraphs.length > 1 ? paragraphs.shift() : '';
  var task = '<details class="reference task"><summary>' + (s.alert ? '依頼内容と監視通知' : '依頼内容') +
    '</summary><div class="reference-body"><div class="prose">' + t2h(paragraphs.join('\n\n')) +
    '</div>' + (s.alert ? this.alertHtml(s.alert) : '') + '</div></details>';

  var guide;
  if (s.guide.length) {
    guide = '<section class="guide"><h2 tabindex="-1">調査の手順</h2>' + prompt +
      s.guide.map(function (step, i) {
        return '<details class="guide-step" name="guide-step"' + (i === 0 ? ' open' : '') + '>' +
          '<summary><span class="step-number">' + (i + 1) + '</span>' + esc(step.title) + '</summary>' +
          '<div class="step-body"><p>' + esc(step.why) + '</p><div class="guide-commands">' +
          step.commands.map(commandButton).join('') + '</div><div class="read-output"><strong>出力の読み方</strong><p>' +
          esc(step.read) + '</p></div></div></details>';
      }).join('') + '</section>';
  } else {
    var first = s.firstLook || s.learn[0];
    guide = '<section class="guide"><h2>今回の調査</h2>' +
      (lead ? '<div class="prose task-lead">' + t2h(lead) + '</div>' : '') + task;
    if (first) guide += '<h3>' + esc(s.firstLook ? first.name : '最初に試す操作') + '</h3>' + prompt + commandButton(first.cmd) +
      '<div class="read-output"><strong>この操作で分かること</strong><div class="prose small">' + t2h(first.desc) + '</div></div>';
    guide += '</section>';
  }
  this.refs.left.innerHTML = guide;

  var ref = window.LFR.CommandRef;
  var commands = (s.learn || []).map(function (l) {
    var deep = ref.find(l);
    return '<article class="learn-item"><h4>' + esc(l.name) + '</h4>' + commandButton(l.cmd) +
      '<div class="prose small">' + t2h(l.desc) + '</div>' + (deep ? ref.render(deep) : '') + '</article>';
  }).join('');
  var resources = (s.guide.length ? task : '') +
    '<details class="reference"><summary>この演習で使うコマンド</summary><div class="reference-body">' + commands + '</div></details>';
  var terms = window.LFR.Concepts.detect(s);
  if (terms.length) {
    resources += '<details class="reference"><summary>この演習の用語</summary><div class="term-chips reference-body">' +
      terms.map(function (c) {
        return '<button class="term-chip" data-concept="' + esc(c.id) + '">' + esc(c.title) + '</button>';
      }).join('') + '</div></details>';
  }
  resources += '<details class="reference"><summary>今回の調査記録</summary><div class="reference-body" id="inv-panel"></div></details>' +
    '<details class="reference"><summary>端末のキー操作</summary><div class="reference-body small">手入力するときは $ の後の文字を入力します。Tab でファイル名を補完し、↑ と ↓ で以前のコマンドを呼び出せます。Ctrl+C で実行中のログ追跡を中断できます。入力待ちで Esc を押すと端末の下の「実行」ボタンに移ります。</div></details>';
  if (s.manual) resources += '<p class="manual">コマンド仕様（2026年11月23日参照）　<a target="_blank" rel="noreferrer" href="' + esc(s.manual.url) + '">' + esc(s.manual.title) + '</a></p>';
  this.refs.resources.innerHTML = '<div id="danger-zone" role="status"></div>' +
    '<details class="reference"><summary>行き詰まったときのヒント</summary><div class="reference-body" id="hint-panel"></div></details>' +
    '<details class="reference"><summary>演習の資料と調査記録</summary><div class="reference-body">' + resources + '</div></details>';
  new window.LFR.Hint(this.refs.resources.querySelector('#hint-panel'), s, this.runtime);
};

LessonController.prototype.afterCommand = function () {
  if (this.quiz && !this.answered) this.quiz.refresh();
  this.renderInvestigation();
};

LessonController.prototype.renderInvestigation = function () {
  var el = this.refs.resources.querySelector('#inv-panel');
  if (!el || !this.scenario || this.runtime.state !== this.scenario) return;
  var esc = window.LFR.esc, inv = this.runtime.investigation;
  var evidence = (this.scenario.evidence || []).filter(function (e) { return inv.facts[e.key]; });
  var html = '<p>実行したコマンド ' + inv.commandCount + ' 回</p>';
  if (evidence.length) {
    html += '<ul class="inv-list">' + evidence.map(function (e) {
      return '<li class="got"><span aria-hidden="true">✓</span> ' + esc(e.label) + '</li>';
    }).join('') + '</ul>';
  } else {
    html += '<p class="muted small">調査の手がかりが見つかると、ここに記録されます。</p>';
  }
  el.innerHTML = html;
};

LessonController.prototype.showDanger = function (d) {
  if (this.dangers.indexOf(d.id) >= 0) return;
  this.dangers.push(d.id);
  var t2h = window.LFR.text2html, esc = window.LFR.esc;
  var zone = this.refs.resources.querySelector('#danger-zone');
  if (!zone) return;
  var card = document.createElement('section');
  card.className = 'panel danger';
  card.innerHTML = '<h3>⚠ ' + esc(d.title) + '</h3><div class="prose">' + t2h(d.body) + '</div>';
  zone.appendChild(card);
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

LessonController.prototype.onQuiz = function (ev) {
  if (ev.type === 'retry')  { this.onNav({ type: 'retry' }); return; }
  if (ev.type === 'answered') {
    this.answered = true;
    window.LFR.ProgressStore.record(this.scenario.id, {
      correct: ev.correct,
      score: ev.result.score,
      grade: ev.result.grade,
      hintsUsed: ev.result.hintsUsed,
      commandCount: ev.result.commandCount
    });
    this.renderInvestigation();
    this.onNav({ type: 'progress' });
    var verdict = this.refs.quiz.querySelector('.verdict');
    verdict.focus({ preventScroll: true });
    verdict.scrollIntoView({ block: 'nearest' });
  }
};

window.LFR = window.LFR || {};
window.LFR.LessonController = LessonController;
})();
