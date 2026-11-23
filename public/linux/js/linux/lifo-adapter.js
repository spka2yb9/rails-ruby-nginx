/* LifoAdapter — Lifo固有APIに触れてよい唯一の場所
   ------------------------------------------------------------------
   アプリの他の層は LearningLinuxRuntime しか見ない。
   Lifoを別のブラウザLinux実装へ差し替えるときは、このファイルだけを書き換える。

   提供するもの（差し替え時に満たすべき契約）:
     boot()                      起動
     reset(state)                CASEの仮想環境をロードし直す
     run(line, opts)             → {stdout, stderr, exitCode}
     cancel()                    実行中のコマンドを止める（Ctrl+C）
     cwd / setCwd(path)
     define(name, fn)            コマンドを追加・上書き
     wrap(name, fn)              既存コマンドをラップ
     original(name)              既存コマンドの実装を取得
     readFile / writeFile / exists                                    */
(function () {
'use strict';

/* Lifo の同梱コマンドのうち、実際のネットワークに出るもの・教材に関係ないもの。名前ごと消す（aws-learning の lifo.ts と同じ）。
   curl / dig / systemctl / top は、このあと scenario-commands.js が教材用の実装を入れ直す */
var REMOVE = ['curl', 'wget', 'dig', 'host', 'ping', 'ifconfig', 'ip', 'netstat', 'route', 'tunnel', 'forward', 'ports', 'lifo',
              'browser-metro', 'node', 'npm', 'npx', 'newtab', 'pkg', 'systemctl', 'top', 'watch', 'sl', 'help', 'logout'];

/* Lifo のエラーの書き方（cat: x: ENOENT: 'x': no such …）を bash にそろえる（aws-learning の shell.ts と同じ） */
function tidy(s) {
  return String(s)
    .replace(/^(ENOENT|EISDIR|ENOTDIR|EEXIST|EACCES): '([^'\n]*)': ([a-z])/gm, function (_, __, p, c) { return 'bash: ' + p + ': ' + c.toUpperCase(); })
    .replace(/^([\w.-]+): (?:ENOENT|EISDIR|ENOTDIR|EEXIST|EACCES): '([^'\n]*)': ([a-z])/gm, function (_, cmd, p, c) { return cmd + ': ' + p + ': ' + c.toUpperCase(); })
    .replace(/\b(?:ENOENT|EISDIR|ENOTDIR|EEXIST|EACCES): '[^'\n]*': ([a-z])/g, function (_, c) { return c.toUpperCase(); });
}

function LifoAdapter() {
  this.sandbox = null;
  this._decorators = [];   /* reset後に再適用するコマンド定義 */
}

LifoAdapter.prototype.boot = function (state) {
  return this.reset(state);
};

/* CASEごとに仮想環境を作り直す。
   VFSを部分的に巻き戻すより、sandboxごと作り直すほうが取りこぼしがない。 */
LifoAdapter.prototype.reset = function (state) {
  var self = this;
  if (this.sandbox) { try { this.sandbox.destroy(); } catch (e) {} this.sandbox = null; }

  var env = { USER: state.user, LOGNAME: state.user, HOME: state.home,
              HOSTNAME: state.hostname, SHELL: '/bin/bash', TERM: 'xterm-256color',
              PATH: '/usr/local/bin:/usr/bin:/bin:/home/deploy/.rbenv/shims' };
  Object.keys(state.envVars || {}).forEach(function (k) { env[k] = state.envVars[k]; });

  return window.Lifo.Sandbox.create({
    cwd: '/',                       /* startDirectoryはsymlink展開後に設定する */
    env: env,
    persist: false,
    files: state.files || {}
  }).then(function (sb) {
    self.sandbox = sb;
    self._defined = {};
    self._originals = {};
    patchInterpreter(sb.shell.interpreter);
    REMOVE.forEach(function (n) { sb.shell.getRegistry().unregister(n); });
    /* Lifo が最初に作る /home/user は、CASEのサーバーには無いもの。CASEが使っていなければ消す */
    var usesUserHome = state.home === '/home/user' || Object.keys(state.files || {}).some(function (k) { return k.indexOf('/home/user/') === 0; });
    return (usesUserHome ? Promise.resolve() : sb.fs.rm('/home/user', { recursive: true }).catch(function () {}));
  }).then(function () {
    return self._applySymlinks(state.symlinks || {});
  }).then(function () {
    return self._reapply();
  }).then(function () {
    return self.setCwd(state.startDirectory || state.home);
  });
};

/* Lifo VFSはsymbolic linkを持たない。
   ponytail: Capistranoのcurrent/log/tmpは「実体をコピーして、見た目だけlnに見せる」で代用。
   書き込みはリンク先へ伝播しない（教材は調査が目的なので実害なし）。
   Lifo側がsymlinkに対応したらこのメソッドごと捨てる。 */
LifoAdapter.prototype._applySymlinks = function (links) {
  var self = this, keys = Object.keys(links);
  /* 2周する。releases/…/log を張ってから current を張る、という順序依存を
     CASE側に意識させないため（2周目は同じ内容の上書きなので副作用は無い）。 */
  var paths = keys.concat(keys);
  return paths.reduce(function (chain, link) {
    return chain.then(function () { return self._copyTree(links[link], link); });
  }, Promise.resolve());
};

LifoAdapter.prototype._copyTree = function (src, dest) {
  var fs = this.sandbox.fs, self = this;
  return fs.exists(src).then(function (ok) {
    if (!ok) return;
    return fs.stat(src).then(function (st) {
      if (st.type === 'file') return fs.readFile(src).then(function (c) { return fs.writeFile(dest, c); });
      return fs.mkdir(dest, { recursive: true }).then(function () {
        return fs.readdir(src);
      }).then(function (entries) {
        return entries.reduce(function (chain, e) {
          return chain.then(function () { return self._copyTree(src + '/' + e.name, dest + '/' + e.name); });
        }, Promise.resolve());
      });
    });
  });
};

/* Lifo は RunOptions.signal をコマンドへ渡さない。コマンドが見ている shell.abortController を毎回差し替え、
   Ctrl+C（cancel）はそれを abort する（aws-learning の lifo.ts と同じ）。sleep や for ループも止まる */
LifoAdapter.prototype.run = function (line, opts) {
  var self = this, ac = new AbortController();
  opts = opts || {};
  this._abort = ac;
  this.sandbox.shell.abortController = ac;
  var o = { onStdout: opts.onStdout, onStderr: opts.onStderr && function (d) { opts.onStderr(tidy(d)); } };
  return this.sandbox.commands.run(line, o).then(function (res) {
    if (self._abort === ac) self._abort = null;
    return { stdout: res.stdout, stderr: tidy(res.stderr), exitCode: res.exitCode };
  }, function (e) {
    if (self._abort === ac) self._abort = null;
    throw e;
  });
};

LifoAdapter.prototype.cancel = function () {
  if (this._abort) this._abort.abort();
};

Object.defineProperty(LifoAdapter.prototype, 'cwd', {
  get: function () { return this.sandbox ? this.sandbox.cwd : '/'; }
});

LifoAdapter.prototype.setCwd = function (path) {
  var self = this;
  return this.sandbox.fs.exists(path).then(function (ok) {
    self.sandbox.cwd = ok ? path : '/';
  });
};

LifoAdapter.prototype.env = function () {
  return this.sandbox ? this.sandbox.shell.getEnv() : {};
};

LifoAdapter.prototype.setEnv = function (key, value) {
  if (!this.sandbox) return;
  if (value == null) delete this.sandbox.shell.getEnv()[key];
  else this.sandbox.shell.getEnv()[key] = value;
};

/* ---- コマンド登録。reset()後も同じ定義を張り直せるよう記録しておく ---- */
LifoAdapter.prototype.define = function (name, fn) {
  this._defined[name] = fn;
  this.sandbox.commands.register(name, fn);
};

LifoAdapter.prototype.original = function (name) {
  var self = this;
  if (this._originals[name]) return Promise.resolve(this._originals[name]);
  return this.sandbox.shell.getRegistry().resolve(name).then(function (orig) {
    self._originals[name] = orig;
    return orig;
  });
};

LifoAdapter.prototype.wrap = function (name, fn) {
  var self = this;
  return this.original(name).then(function (orig) {
    self.define(name, function (ctx) { return fn(ctx, orig); });
  });
};

/* reset()のたびに呼ばれる。scenario-commands.jsのregisterを再実行する */
LifoAdapter.prototype.onReady = function (fn) { this._ready = fn; return this; };
LifoAdapter.prototype._reapply = function () {
  return this._ready ? this._ready(this) : Promise.resolve();
};

/* Lifoのパッケージとして配布されているコマンド（vi など）。
   バンドルに同梱してあるものを名前で取り出す。 */
var VENDOR = { vi: 'viCommand', less: 'lessCommand' };

LifoAdapter.prototype.vendorCommand = function (name) {
  var key = VENDOR[name];
  return key && window.Lifo[key] ? window.Lifo[key] : null;
};

/* ---- 補完に使う情報。Lifoのregistry/VFSを覗くのもこの層の仕事 ---- */
var BUILTINS = ['cd', 'pwd', 'echo', 'export', 'alias', 'unalias', 'history',
                'source', 'jobs', 'fg', 'bg', 'clear', 'exit', 'test'];

/* Lifo固有でLinuxには存在しないものは補完候補から外す */
var NOT_LINUX = { 'browser-metro': 1, lifo: 1, tunnel: 1 };

LifoAdapter.prototype.commandNames = function () {
  if (!this.sandbox) return [];
  var names = this.sandbox.shell.getRegistry().list().concat(BUILTINS);
  return names
    .filter(function (n, i) { return names.indexOf(n) === i && !NOT_LINUX[n]; })
    .sort();
};

/* 補完用。存在しないディレクトリなら空配列（例外にしない） */
LifoAdapter.prototype.readdir = function (path) {
  return this.sandbox.fs.readdir(path).catch(function () { return []; });
};

/* symlinkの張り替え（ロールバック）。実体をコピーし直す */
LifoAdapter.prototype.relink = function (linkAbs, targetAbs) {
  var self = this;
  return this.sandbox.fs.rm(linkAbs, { recursive: true })
    .catch(function () {})
    .then(function () { return self._copyTree(targetAbs, linkAbs); });
};

LifoAdapter.prototype.writeFiles = function (map) {
  return this.sandbox.fs.writeFiles(Object.keys(map).map(function (k) {
    return { path: k, content: map[k] };
  }));
};

LifoAdapter.prototype.readFile  = function (p) { return this.sandbox.fs.readFile(p); };
/* 同期の読み書き。AWS CLI のシミュレーター（vendor/aws-sim.min.js）が ~/.aws/config や file:// を読むのに使う */
LifoAdapter.prototype.readFileSync = function (p) {
  try { return this.sandbox.shell.getVfs().readFileString(p); } catch (e) { return null; }
};
LifoAdapter.prototype.writeFileSync = function (p, c) {
  var vfs = this.sandbox.shell.getVfs();
  vfs.mkdir(p.slice(0, p.lastIndexOf('/')) || '/', { recursive: true });
  vfs.writeFile(p, c);
};
LifoAdapter.prototype.writeFile = function (p, c) { return this.sandbox.fs.writeFile(p, c); };
LifoAdapter.prototype.exists    = function (p) { return this.sandbox.fs.exists(p); };

/* ---- Lifo 0.10.18 の不具合の修正（aws-learning の src/cli/shell/lifo.ts の patchInterpreter を移したもの） ----
   for / while / if / { } の中のコマンドは、出力先を受け取っているのに捨てていて、何も出てこない
   （Interpreter.executeCompoundList が executeList に streams を渡していない）。executeLine が受け取った streams を覚えておき、中へ渡し直す。
   あわせて、ループの途中で Ctrl+C が効くよう各コマンドの前に abort を確かめる。
   単語の分割と "$@" は vendor/lifo.min.js に当てたパッチ（scripts/patch-lifo.mjs）が受け持つ */
function listsOf(n) {
  var out = [];
  (n.clauses || []).forEach(function (c) { out.push(c.condition, c.body); });
  (n.items || []).forEach(function (i) { out.push(i.body); });
  [n.condition, n.body, n.elseBody].forEach(function (l) { if (l) out.push(l); });
  return out;
}
function joinPath(cwd, p) {
  var out = [];
  (p.charAt(0) === '/' ? p : cwd + '/' + p).split('/').forEach(function (s) {
    if (s === '..') out.pop();
    else if (s && s !== '.') out.push(s);
  });
  return '/' + out.join('/');
}
/* ?? と同じ（null と undefined だけを飛ばす） */
function firstDefined() {
  for (var i = 0; i < arguments.length; i++) if (arguments[i] != null) return arguments[i];
  return undefined;
}
function aborted(self) {
  var sig = self.config.getAbortSignal && self.config.getAbortSignal();
  return !!(sig && sig.aborted);
}

var patched = new WeakSet();
var ticks = 0;
function breathe() { return new Promise(function (r) { setTimeout(r, 0); }); }
/* Ctrl+C で止めたときに投げる。Error ではないので、executeLine は何も書かずに受け止める */
var INTERRUPT = { interrupted: true };

function patchInterpreter(interpreter) {
  var proto = Object.getPrototypeOf(interpreter);
  if (patched.has(proto) || typeof proto.executeCompoundList !== 'function') return;
  patched.add(proto);

  var executeLine = proto.executeLine;
  proto.executeLine = async function () {
    var args = Array.prototype.slice.call(arguments);
    var prev = this._streams;
    this._streams = args[2];
    try {
      var code = await executeLine.apply(this, args);
      return code === 2 && aborted(this) ? 130 : code;
    } finally {
      this._streams = prev;
    }
  };

  proto.executeCompoundList = async function (list, stdout) {
    var io = this.__io && this.__io.get(list);
    var streams = stdout ? Object.assign({}, this._streams, { stdout: stdout }) : this._streams;
    if (io && io.stderr) streams = Object.assign({}, streams, { stderr: io.stderr });
    var code = 0;
    if (++ticks % 256 === 0) await breathe();
    for (var k = 0; k < list.length; k++) {
      if (aborted(this)) throw INTERRUPT;
      code = await this.executeList(list[k], io ? io.stdin : undefined, streams);
    }
    return code;
  };

  /* if / for / while / { } に付いたリダイレクト（done > out.txt）と、パイプから来た入力を中へ渡す */
  var executeCommand = proto.executeCommand;
  proto.executeCommand = async function (node, stdin, stdout, term, stderr, streams) {
    if (node.type === 'simple_command' || node.type === 'function_def') return executeCommand.call(this, node, stdin, stdout, term, stderr, streams);
    var input = firstDefined(stdin, term);
    var out = firstDefined(stdout, streams && streams.stdout, this._streams && this._streams.stdout);
    var err = firstDefined(stderr, streams && streams.stderr, this._streams && this._streams.stderr);
    var redirs = node.redirections || [];
    for (var i = 0; i < redirs.length; i++) {
      var op = redirs[i].operator;
      if (op === '2>&1') { err = out; continue; }
      if (op === '>&2') { out = err; continue; }
      if (op === '>&1') continue;
      var path = joinPath(this.config.getCwd(), await this.__expandWord(redirs[i].target));
      var vfs = this.config.vfs;
      if (op === '<') input = this.createFileReader(path);
      else if (op === '>>' || op === '2>>') {
        if (!vfs.exists(path)) vfs.writeFile(path, '');
        var a = this.createFileAppender(path);
        if (op === '>>') out = a;
        else err = a;
      } else {
        vfs.writeFile(path, '');
        var w = this.createFileWriter(path);
        if (op !== '2>') out = w;
        if (op !== '>') err = w;
      }
    }
    if (!this.__io) this.__io = new WeakMap();
    var self = this;
    listsOf(node).forEach(function (l) { self.__io.set(l, { stdin: input, stderr: err }); });
    return executeCommand.call(this, node, undefined, out, undefined, undefined, streams);
  };

  /* for x; do（in を書かない）は "$@" と同じ */
  var executeFor = proto.executeFor;
  proto.executeFor = function (node, stdout) {
    return executeFor.call(this, node.words === null ? Object.assign({}, node, { words: [[{ text: '$@', quoted: 'double' }]] }) : node, stdout);
  };

  /* 関数の引数を配列のまま積む（patch-lifo.mjs の単語の分割が "$@" に使う） */
  var executeFunction = proto.executeFunction;
  proto.executeFunction = async function (body, args) {
    (this.__argv || (this.__argv = [])).push(args.slice());
    try {
      return await executeFunction.call(this, body, args);
    } finally {
      this.__argv.pop();
    }
  };

  var createExpandContext = proto.createExpandContext;
  proto.createExpandContext = function () {
    var argv = this.__argv && this.__argv.length ? this.__argv[this.__argv.length - 1] : undefined;
    return Object.assign({}, createExpandContext.call(this), { argv: argv });
  };
}

window.LFR = window.LFR || {};
window.LFR.LifoAdapter = LifoAdapter;
})();
