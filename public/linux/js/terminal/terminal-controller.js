/* TerminalController — xterm.js と LearningLinuxRuntime の間
   ------------------------------------------------------------------
   ここにLinuxの処理は1行も書かない。やるのは4つだけ。

     キー入力 → 行バッファを組み立てる
     Enter    → runtime.execute(line)
     stdout / stderr を xterm へ書く
     プロンプトを出し直す                                              */
(function () {
'use strict';

var CSI = '\x1b[';
/* ここから3つは aws-learning の src/cli/terminal/TerminalController.ts から取り込んだもの。
   コマンドの出力の C1 制御文字（U+0080〜U+009F）は、読めない文字にしておく。Shift_JIS を cat すると、たまたま UTF-8 の U+0090（DCS）になる並びがあり、
   端末がそのあとの出力を飲み込んでしまう（本物の端末でも起きるが、演習の画面を壊さないように） */
function safe(d) { return String(d).replace(/[\u0080-\u009f]/g, '\ufffd'); }
/* 画面上の幅（マス数）。全角の文字は2マス使う（xterm の既定の Unicode 6 と同じ範囲）。
   文字数で数えると、日本語を打ってから Backspace や ← を押したときにカーソルがずれる */
var WIDE = /[\u1100-\u115f\u2329\u232a\u2e80-\u303e\u3040-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe10-\ufe19\ufe30-\ufe6f\uff00-\uff60\uffe0-\uffe6\u{20000}-\u{3fffd}]/u;
function cells(s) { var n = 0; for (var c of s) n += WIDE.test(c) ? 2 : 1; return n; }

function TerminalController(el, runtime) {
  this.runtime = runtime;
  this.line = '';
  this.cursor = 0;
  this.history = [];
  this.histIndex = 0;
  this.draft = '';
  this.busy = false;
  this.pasteQueue = [];
  this.row = 0;
  /* reset() のたびに進む。リセット前に打ったコマンドの結果を、リセット後（別のCASE）の画面に書かないため */
  this.epoch = 0;
  this.execution = Promise.resolve();

  var term = new window.Terminal({
    fontFamily: '"SFMono-Regular", "JetBrains Mono", "Menlo", "Consolas", "Noto Sans Mono CJK JP", monospace',
    fontSize: 13,
    lineHeight: 1.25,
    cursorBlink: true,
    screenReaderMode: true,
    convertEol: true,
    scrollback: 5000,
    theme: {
      background: '#0b0f14', foreground: '#c9d5e1', cursor: '#58a6ff',
      selectionBackground: '#264f78',
      black: '#1b232c',  red: '#f85149',     green: '#3fb950', yellow: '#d29922',
      blue: '#58a6ff',   magenta: '#bc8cff', cyan: '#39c5cf',  white: '#b1bac4',
      brightBlack: '#6e7681', brightRed: '#ff7b72', brightGreen: '#56d364',
      brightYellow: '#e3b341', brightBlue: '#79c0ff', brightMagenta: '#d2a8ff',
      brightCyan: '#56d4dd', brightWhite: '#f0f6fc'
    }
  });
  var fit = new window.FitAddon.FitAddon();
  term.loadAddon(fit);
  term.open(el);
  fit.fit();

  this.term = term;
  this.fit = fit;
  this.el = el;
  runtime.setViewport(term.cols, term.rows);

  var self = this;
  term.onData(function (d) { self._onData(d); });

  /* キー入力の横取り。false を返すと xterm は何もせず preventDefault もしない
     （xterm.js: customKeyEventHandler が false なら keydown 処理ごと抜ける）。 */
  term.attachCustomKeyEventHandler(function (e) {
    if (e.type !== 'keydown') return true;
    // 端末内の Tab は補完用。Escape で端末の直後の操作に戻る。
    if (e.key === 'Escape' && !self.busy) {
      document.getElementById('term-enter').focus();
      return false;
    }

    /* Shift+Insert もブラウザ本来の貼り付けに任せる */
    if (e.shiftKey && e.key === 'Insert') return false;

    var mod = e.ctrlKey || e.metaKey;
    if (!mod || e.altKey) return true;
    var k = (e.key || '').toLowerCase();

    /* コピー：選択があるときだけ横取りする。無ければSIGINTのまま */
    if (k === 'c' && term.hasSelection()) {
      self._copy(term.getSelection());
      return false;                     /* \x03 を送らない＝コマンドを止めない */
    }

    /* 貼り付け：xtermに触らせない。
       xtermはCtrl+Vを制御文字 \x16 に変換したうえで preventDefault するため、
       ブラウザ本来の paste イベントが発生しなくなる。
       ここで false を返せば textarea へ通常どおり paste が届き、
       その中身が onData に複数文字でまとめて流れてくる（_paste が処理する）。 */
    if (k === 'v' || k === 'insert') return false;

    return true;
  });

  /* Terminal resize: 表示領域が変わったら列数を合わせ直す */
  function refit() {
    try { fit.fit(); } catch (e) {}
    runtime.setViewport(term.cols, term.rows);
  }
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(refit);
    ro.observe(el);
  }
  window.addEventListener('resize', refit);
}

TerminalController.prototype.focus = function () { this.term.focus(); };
TerminalController.prototype.press = function (key) { this._onData(key); };
TerminalController.prototype.stop = function () {
  this.epoch++;
  this.pasteQueue = [];
  if (this.busy) this.runtime.cancel();
  return this.execution;
};
TerminalController.prototype.write = function (s) { this.term.write(s); };

TerminalController.prototype.reset = function (banner) {
  this.epoch++;
  this.term.reset();
  this.term.write('\x1b[3J\x1b[2J\x1b[H');   /* scrollbackごと消す */
  this.line = ''; this.cursor = 0; this.busy = false; this.row = 0;
  this.history = []; this.histIndex = 0; this.pasteQueue = [];
  if (banner) this.term.write(banner);
  this.prompt();
};

TerminalController.prototype.prompt = function () {
  this.row = 0;
  this.term.write(this.runtime.promptAnsi());
};

TerminalController.prototype._promptWidth = function () {
  return cells(this.runtime.promptText());
};

/* 行を描き直す。折り返しても崩れないよう、プロンプト＋入力が何行を占めるかを
   数えてから、先頭行へ戻して画面末尾まで消し、書き直す。
   this.row は「入力行の先頭から見て、カーソルが今どの行にいるか」。 */
TerminalController.prototype._redraw = function () {
  var cols = this.term.cols || 80;
  var pw = this._promptWidth();
  var out = '';

  if (this.row) out += CSI + this.row + 'A';       /* 先頭行へ戻る */
  out += '\r' + CSI + 'J';                         /* そこから画面末尾まで消す */
  out += this.runtime.promptAnsi() + this.line;

  var end = pw + cells(this.line);
  var endRow = Math.floor(end / cols);
  var endCol = end % cols;
  /* ちょうど行端で終わると、端末はまだ同じ行に居る。改行して位置を確定させる */
  if (endCol === 0 && this.line.length) { out += '\r\n'; endRow += 1; }

  var at = pw + cells(this.line.slice(0, this.cursor));
  var curRow = Math.floor(at / cols);
  var curCol = at % cols;
  if (endRow > curRow) out += CSI + (endRow - curRow) + 'A';
  out += '\r';
  if (curCol > 0) out += CSI + curCol + 'C';

  this.row = curRow;
  this.term.write(out);
};

/* 入力行の外へ出たあと（改行した直後など）に呼ぶ */
TerminalController.prototype._atLineStart = function () { this.row = 0; };

TerminalController.prototype._onData = function (data) {
  var self = this;

  /* 実行中の扱い。
     viのような全画面コマンドが入力を待っているときは、キーをそのまま渡す。
     そうでなければ Ctrl+C だけ受け付ける（tail -f を止めるため）。 */
  if (this.busy) {
    if (this.runtime.acceptsInput()) { this.runtime.pushInput(data); return; }
    if (data === '\x03') this.runtime.cancel();
    return;
  }

  /* まとめて届いたら貼り付け（またはIMEの確定）。エスケープ列は除く */
  if (data.length > 1 && data.charAt(0) !== '\x1b') { this._paste(data); return; }

  for (var i = 0; i < data.length; i++) {
    var ch = data[i];

    /* --- エスケープシーケンス（矢印 / Home / End / Delete） --- */
    if (ch === '\x1b') {
      var seq = data.slice(i);
      if (seq.indexOf(CSI + 'A') === 0) { this._historyUp();   i += 2; continue; }
      if (seq.indexOf(CSI + 'B') === 0) { this._historyDown(); i += 2; continue; }
      if (seq.indexOf(CSI + 'C') === 0) {
        if (this.cursor < this.line.length) { this.term.write(CSI + cells(this.line[this.cursor]) + 'C'); this.cursor++; }
        i += 2; continue;
      }
      if (seq.indexOf(CSI + 'D') === 0) {
        if (this.cursor > 0) { this.cursor--; this.term.write(CSI + cells(this.line[this.cursor]) + 'D'); }
        i += 2; continue;
      }
      if (seq.indexOf(CSI + 'H') === 0 || seq.indexOf(CSI + '1~') === 0) { this.cursor = 0; this._redraw(); i += 2; continue; }
      if (seq.indexOf(CSI + 'F') === 0 || seq.indexOf(CSI + '4~') === 0) { this.cursor = this.line.length; this._redraw(); i += 2; continue; }
      if (seq.indexOf(CSI + '3~') === 0) {   /* Delete */
        if (this.cursor < this.line.length) {
          this.line = this.line.slice(0, this.cursor) + this.line.slice(this.cursor + 1);
          this._redraw();
        }
        i += 3; continue;
      }
      i = data.length; continue;   /* 未対応シーケンスは捨てる */
    }

    if (ch === '\r') { this._submit(); return; }

    if (ch === '\t') { this._complete(); return; }      /* Tab補完 */

    if (ch === '\x7f' || ch === '\b') {          /* Backspace */
      if (this.cursor > 0) {
        this.line = this.line.slice(0, this.cursor - 1) + this.line.slice(this.cursor);
        this.cursor--;
        this._redraw();
      }
      continue;
    }

    if (ch === '\x03') {                          /* Ctrl+C */
      this.term.write('^C\r\n');
      this.line = ''; this.cursor = 0; this.histIndex = this.history.length;
      this._atLineStart();
      this.term.write(this.runtime.promptAnsi());
      continue;
    }

    if (ch === '\x0c') {                          /* Ctrl+L */
      this.term.write(CSI + '2J' + CSI + 'H');
      this._atLineStart();
      this._redraw();
      continue;
    }

    if (ch === '\x15') {                          /* Ctrl+U */
      this.line = this.line.slice(this.cursor); this.cursor = 0; this._redraw(); continue;
    }
    if (ch === '\x0b') {                          /* Ctrl+K */
      this.line = this.line.slice(0, this.cursor); this._redraw(); continue;
    }
    if (ch === '\x01') { this.cursor = 0; this._redraw(); continue; }              /* Ctrl+A */
    if (ch === '\x05') { this.cursor = this.line.length; this._redraw(); continue; } /* Ctrl+E */
    if (ch === '\x17') {                          /* Ctrl+W */
      var left = this.line.slice(0, this.cursor).replace(/\S+\s*$/, '');
      this.line = left + this.line.slice(this.cursor);
      this.cursor = left.length;
      this._redraw(); continue;
    }

    if (ch < ' ') continue;                       /* その他の制御文字は無視 */

    this.line = this.line.slice(0, this.cursor) + ch + this.line.slice(this.cursor);
    this.cursor++;
    if (this.cursor === this.line.length) {
      this.term.write(ch);
      this.row = Math.floor((this._promptWidth() + cells(this.line)) / (this.term.cols || 80));
    } else {
      this._redraw();
    }
  }
};

TerminalController.prototype._historyUp = function () {
  if (!this.history.length) return;
  if (this.histIndex === this.history.length) this.draft = this.line;
  if (this.histIndex > 0) this.histIndex--;
  this.line = this.history[this.histIndex];
  this.cursor = this.line.length;
  this._redraw();
};

TerminalController.prototype._historyDown = function () {
  if (!this.history.length) return;
  if (this.histIndex < this.history.length) this.histIndex++;
  this.line = this.histIndex === this.history.length ? this.draft : this.history[this.histIndex];
  this.cursor = this.line.length;
  this._redraw();
};

TerminalController.prototype._submit = function () {
  var self = this;
  var cmd = this.line;
  this.term.write('\r\n');
  this.line = ''; this.cursor = 0;
  this._atLineStart();

  if (cmd.trim()) {
    if (this.history[this.history.length - 1] !== cmd) this.history.push(cmd);
  }
  this.histIndex = this.history.length;

  if (!cmd.trim()) { this.term.write(this.runtime.promptAnsi()); this._drainPaste(); return; }


  if (cmd.trim() === 'clear') {
    this._atLineStart();
    this.term.write(CSI + '2J' + CSI + 'H' + this.runtime.promptAnsi());
    this._drainPaste();
    return;
  }
  /* rails console などの REPL の中の exit は、REPL を閉じる操作なのでランタイムへ渡す */
  var inRepl = !!(this.runtime.state && this.runtime.state.repl);
  if (!inRepl && (cmd.trim() === 'exit' || cmd.trim() === 'logout')) {
    this.term.write('\x1b[2mこの学習環境ではログアウトできません。CASEを切り替えてください。\x1b[0m\r\n');
    this._atLineStart();
    this.term.write(this.runtime.promptAnsi());
    return;
  }

  this.busy = true;
  var epoch = this.epoch;
  var streamed = false;
  function live(fn) { if (epoch === self.epoch) { streamed = true; fn(); } }
  this.execution = this.runtime.execute(cmd, {
    onStdout: function (d) { live(function () { self.term.write(safe(d)); }); },
    onStderr: function (d) { live(function () { self.term.write('\x1b[31m' + safe(d) + '\x1b[0m'); }); }
  }).then(function (res) {
    if (epoch !== self.epoch) return;
    if (!streamed) {
      if (res.stdout) self.term.write(safe(res.stdout));
      if (res.stderr) self.term.write('\x1b[31m' + safe(res.stderr) + '\x1b[0m');
    }
    var all = (res.stdout || '') + (res.stderr || '');
    if (all && all.charAt(all.length - 1) !== '\n') self.term.write('\r\n');
    self.busy = false;
    self._atLineStart();
    self.term.write(self.runtime.promptAnsi());
    self.term.scrollToBottom();
    self._drainPaste();
  });
};

/* ---------------- 貼り付け ----------------
   1行目はカーソル位置へ挿入。改行を含む場合は、1行ずつ実行して残りを待たせる。 */
TerminalController.prototype._paste = function (text) {
  var lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  var first = lines[0];
  this.line = this.line.slice(0, this.cursor) + first + this.line.slice(this.cursor);
  this.cursor += first.length;
  this._redraw();
  if (lines.length > 1) {
    this.pasteQueue = lines.slice(1);
    this._submit();
  }
};

TerminalController.prototype._drainPaste = function () {
  if (!this.pasteQueue.length) return;
  var next = this.pasteQueue.shift();
  this.line = next;
  this.cursor = next.length;
  this._redraw();
  if (this.pasteQueue.length) this._submit();   /* 最後の1行は実行せず編集させる */
};

/* ---------------- コピー ---------------- */
TerminalController.prototype._copy = function (text) {
  if (!text) return;
  var self = this;
  function done() { self.term.clearSelection(); self._notify('クリップボードにコピーしました'); }
  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); }
    catch (e) { self._notify('コピーできませんでした'); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, fallback);
  } else {
    fallback();
  }
};

/* Terminalヘッダの右側に一時的なメッセージを出す */
TerminalController.prototype._notify = function (msg) {
  var note = this.el.parentNode && this.el.parentNode.querySelector('.term-note');
  if (!note) return;
  if (this._noteOrig == null) this._noteOrig = note.textContent;
  var self = this;
  note.textContent = msg;
  note.classList.add('on');
  clearTimeout(this._noteTimer);
  this._noteTimer = setTimeout(function () {
    note.textContent = self._noteOrig;
    note.classList.remove('on');
  }, 1600);
};

/* ---------------- Tab補完 ----------------
   候補の計算はruntime側。ここでやるのは差し替えと候補の描画だけ。 */
TerminalController.prototype._complete = function () {
  var self = this;
  if (this.busy) return;
  this.busy = true;                      /* 計算中の入力を取りこぼさないよう止める */
  var epoch = this.epoch;

  this.runtime.complete(this.line, this.cursor).then(function (r) {
    if (epoch !== self.epoch) return;
    self.busy = false;
    if (!r.items.length) return;
    var word = self.line.slice(r.start, r.end);

    if (r.items.length === 1) {
      var v = r.items[0];
      self._replace(r.start, r.end, v + (v.charAt(v.length - 1) === '/' ? '' : ' '));
      return;
    }
    if (r.common.length > word.length) {
      self._replace(r.start, r.end, r.common);
      return;
    }
    self._printCandidates(r.labels || r.items);
  }, function () { if (epoch === self.epoch) self.busy = false; });
};

TerminalController.prototype._replace = function (start, end, text) {
  this.line = this.line.slice(0, start) + text + this.line.slice(end);
  this.cursor = start + text.length;
  this._redraw();
};

TerminalController.prototype._printCandidates = function (items) {
  var MAX = 60;
  var more = items.length > MAX ? items.length - MAX : 0;
  var list = items.slice(0, MAX);
  var w = 0;
  list.forEach(function (s) { w = Math.max(w, cells(s)); });
  w += 2;
  var cols = this.term.cols || 80;
  var per = Math.max(1, Math.floor(cols / w));

  /* 入力行が折り返している場合に備えて、まず最終行の下へ出る */
  var endRow = Math.floor((this._promptWidth() + cells(this.line)) / cols);
  var down = endRow - this.row;
  var out = (down > 0 ? CSI + down + 'B' : '') + '\r\n';
  list.forEach(function (s, i) {
    out += s + new Array(Math.max(1, w - cells(s) + 1)).join(' ');
    if ((i + 1) % per === 0) out += '\r\n';
  });
  if (list.length % per !== 0) out += '\r\n';
  if (more) out += '\x1b[2m…他 ' + more + ' 件\x1b[0m\r\n';

  this.term.write(out);
  this._atLineStart();
  this._redraw();
};

/* 教材UIから「このコマンドを流し込む」ためのAPI（チートシートのクリック等） */
TerminalController.prototype.insert = function (cmd) {
  if (this.busy) { this._notify('実行中です。終了または中断してから入力してください'); return; }
  this.line = cmd;
  this.cursor = cmd.length;
  this._redraw();
  this.focus();
  this.el.closest('.term-wrap').scrollIntoView({ block: 'nearest' });
};

window.LFR = window.LFR || {};
window.LFR.TerminalController = TerminalController;
})();
