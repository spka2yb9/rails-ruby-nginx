/* 演習を切り替えてもページと端末は共通。ハッシュには開いている演習を残す。 */
(function () {
'use strict';

var LFR = window.LFR;
var refs = {};
var runtime, terminal, lesson;

function $(id) { return document.getElementById(id); }

function renderCourse(id) {
  var records = LFR.ProgressStore.all();
  var total = 0, answered = 0;
  var options = document.createDocumentFragment();
  LFR.Lessons.groups.forEach(function (group) {
    var optgroup = document.createElement('optgroup');
    optgroup.label = group.name;
    group.cases.forEach(function (c) {
      var record = records[c.id];
      var ready = !!LFR.scenarios.def(c.id);
      var label = c.intro || c.title;
      if (!ready) label += '（準備中）';
      else {
        total++;
        if (record && record.completed) {
          answered++;
          label += record.correct ? '（回答済み）' : '（要復習）';
        }
      }
      var option = new Option(label, c.id);
      option.disabled = !ready;
      optgroup.appendChild(option);
    });
    options.appendChild(optgroup);
  });
  refs.picker.replaceChildren(options);
  refs.picker.value = id;
  $('course-progress').textContent = 'このブラウザで回答した演習　' + answered + ' / ' + total;
  $('reset-progress').hidden = !answered;
}

function openCase(id) {
  var scenario = LFR.scenarios.get(id);
  var switching = !!lesson.scenario;
  renderCourse(id);
  lesson.open(scenario, function (ev) {
    if (ev.type === 'retry') openCase(id);
    if (ev.type === 'progress') renderCourse(id);
  });
  if (switching && document.hasFocus() && document.activeElement !== refs.picker) {
    refs.head.querySelector('h1').focus({ preventScroll: true });
  }
  window.scrollTo(0, 0);
}

function openReference(kind, focusId) {
  var insert = refs.work.inert || !lesson.quiz ? null : function (cmd) {
    refs.overlay.close();
    terminal.insert(cmd);
  };
  if (kind === 'terms') LFR.Concepts.mount(refs.overlayBody, insert, focusId);
  else LFR.Cheatsheet.mount(refs.overlayBody, insert);
  refs.overlay.showModal();
  refs.overlay.scrollTop = 0;
  if (!focusId) refs.overlayBody.querySelector('input').focus();
}

function route() {
  if (refs.overlay.open) refs.overlay.close();
  var id = location.hash.replace(/^#\/?/, '');
  if (!LFR.scenarios.def(id)) {
    var ids = LFR.Lessons.readyIds();
    var records = LFR.ProgressStore.all();
    id = ids.find(function (key) { return !records[key] || !records[key].completed; }) || ids[0];
    // 入口の履歴を選んだ演習で置き換え、ブラウザの「戻る」を1回で済ませる。
    history.replaceState(null, '', '#/' + id);
  }
  if (!lesson.scenario || lesson.scenario.id !== id) openCase(id);
}

function boot() {
  refs = {
    picker: $('exercise-select'), work: $('case-work'),
    head: $('case-head'), left: $('case-left'), resources: $('case-resources'), quiz: $('case-quiz'),
    term: $('term'), overlay: $('overlay'), overlayBody: $('overlay-body')
  };

  if (!window.Lifo || !window.Terminal || !LFR.Lessons.readyIds().length) {
    refs.head.innerHTML = '<section class="panel danger"><h1>練習環境を読み込めませんでした</h1><p>ページを再読み込みしてください。</p></section>';
    refs.work.hidden = true;
    refs.picker.disabled = true;
    return;
  }
  runtime = new LFR.LearningLinuxRuntime(new LFR.LifoAdapter());
  terminal = new LFR.TerminalController(refs.term, runtime);
  lesson = new LFR.LessonController(refs, runtime, terminal);

  refs.picker.onchange = function () { location.hash = '#/' + refs.picker.value; };
  $('reset-progress').onclick = function () {
    if (confirm('このブラウザに保存した第6部の学習記録をすべて削除しますか？')) {
      LFR.ProgressStore.reset();
      renderCourse(lesson.scenario.id);
    }
  };
  refs.work.addEventListener('click', function (e) {
    var button = e.target.closest('[data-cmd]');
    if (button) terminal.insert(button.dataset.cmd);
  });
  $('term-enter').onclick = function () { terminal.press('\r'); };
  $('term-cancel').onclick = function () { terminal.press('\x03'); };
  $('btn-sheet').onclick = function () { openReference('sheet'); };
  $('btn-concepts').onclick = function () { openReference('terms'); };
  document.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-concept]');
    if (chip) { e.preventDefault(); openReference('terms', chip.dataset.concept); }
  });
  $('overlay-close').onclick = function () { refs.overlay.close(); };
  refs.overlay.addEventListener('click', function (e) { if (e.target === refs.overlay) refs.overlay.close(); });

  window.LFR.app = { runtime: runtime, terminal: terminal, lesson: lesson };
  window.addEventListener('hashchange', route);
  route();
}
document.addEventListener('DOMContentLoaded', boot);
})();
