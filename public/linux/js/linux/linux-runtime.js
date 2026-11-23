/* LearningLinuxRuntime — 教材とLinux環境の境界
   ------------------------------------------------------------------
   UI（xterm.js / 教材UI）はこのクラスしか知らない。
   Lifoという名前はこの下（LifoAdapter）にしか出てこない。

     execute(line)
       ├ 危険コマンド判定        → 'danger' イベント
       ├ adapter.run(line)       → Lifoのshellがparse/pipe/redirectを処理
       │                           教材固有コマンドもLifoのregistryに載っている
       └ Investigation判定        → 'investigation' イベント                */
(function () {
'use strict';

var DIM = '\x1b[2m', R = '\x1b[0m', YEL = '\x1b[33m';

/* ---------------- 調査イベントの既定ルール ----------------
   「このコマンドを打たないと不正解」にしないため、
   どのコマンドで到達しても同じフラグが立つように“観測対象”で判定する。 */
var PROBES = [
  { key: 'inspectedRailsLog', label: 'Railsのログを読んだ',
    test: function (c, res) { return /production\.log|\blog\/|log\/production/.test(c) && res.stdout.length > 0; } },
  { key: 'inspectedServices', label: 'systemdのservice状態を確認した',
    test: function (c) { return /^\s*systemctl\b|\|\s*systemctl\b/.test(c); } },
  { key: 'inspectedJournal',  label: 'journalctlでサービスのログを読んだ',
    test: function (c) { return /\bjournalctl\b/.test(c); } },
  { key: 'inspectedProcesses', label: 'プロセス一覧を確認した',
    test: function (c) { return /\bps\b|\bpgrep\b|\btop\b/.test(c); } },
  { key: 'inspectedDisk',     label: 'ディスク使用量を確認した',
    test: function (c) { return /\bdf\b|\bdu\b/.test(c); } },
  { key: 'inspectedMemory',   label: 'メモリ / 負荷を確認した',
    test: function (c) { return /\bfree\b|\buptime\b|\btop\b/.test(c); } },
  { key: 'inspectedPorts',    label: 'listenしているポートを確認した',
    test: function (c) { return /\bss\b|\bnetstat\b|\blsof\b/.test(c); } },
  { key: 'inspectedEnv',      label: '環境変数を確認した',
    test: function (c) { return /\benv\b|\bprintenv\b|echo\s+\$/.test(c); } },
  { key: 'inspectedHttp',     label: 'HTTPで実際にリクエストしてみた',
    test: function (c) { return /\bcurl\b|\bwget\b/.test(c); } },
  { key: 'exploredFs',        label: 'ファイルシステムを歩いて確認した',
    test: function (c) { return /^\s*(ls|cd|pwd|find|tree|readlink|stat)\b/.test(c); } },
  { key: 'usedPipe',          label: 'パイプでコマンドをつないだ',
    test: function (c) { return c.indexOf('|') >= 0; } },
  { key: 'usedGrep',          label: 'grepで必要な行だけ絞り込んだ',
    test: function (c) { return /\bgrep\b/.test(c); } }
];

/* サービス名は「そのサービスを調べたか」として個別に記録する */
function serviceProbeKey(name) { return 'inspected:' + name; }

/* ---------------- 読めないファイル ----------------
   Lifo VFSはpermissionを強制しないので、CASEが fsMeta で denyRead を宣言した
   パスだけ、実行前に EACCES を返す。
   ponytail: コマンド行を素朴にトークン分割しているだけなので、
             $(...) や変数経由のパスは捕まえられない。教材の用途には十分。 */
var READERS = ['cat', 'head', 'tail', 'less', 'more', 'grep', 'egrep', 'wc', 'sed', 'awk',
               'sort', 'cut', 'diff', 'tac', 'nl', 'strings', 'base64', 'cp', 'md5sum', 'sha256sum'];

/* 行頭・パイプ/;/&& の直後の sudo（-u deploy のようなオプション付きも）を剥がす */
var SUDO_RE = /(^|[|;&]\s*)sudo\s+((?:-[A-Za-z]+\s+|-u\s+\S+\s+)*)/g;

/* ---------------- 危険なコマンド ---------------- */
var DANGERS = [
  { id: 'sigkill', test: /\bkill\s+(-9|-KILL|-s\s*(9|KILL))\b|\bpkill\s+-9\b/,
    title: 'SIGKILL（kill -9）を使おうとしています',
    body: 'SIGKILLはプロセスに終了処理を行わせず、即座に強制終了させます。\n' +
          '処理中のリクエストやジョブは中断され、pidfileやsocketが残ることもあります。\n\n' +
          'まず状態とログを確認し、可能であれば systemctl stop / restart や\n' +
          'SIGTERM（kill -15）による正常終了を検討しましょう。' },
  { id: 'chmod777', test: /\bchmod\s+(-R\s+)?777\b/,
    title: 'chmod 777 を使おうとしています',
    body: '動作する可能性はありますが、必要以上に権限を広げています。\n' +
          '誰でも書き換えられるファイルは、本番環境では事故と侵入の入り口になります。\n\n' +
          'まず ls -l で所有者・group・permissionを確認してください。\n' +
          '多くの「Permission denied」は、所有者が deploy になっていないことが原因で、\n' +
          'chown deploy:deploy や chmod 644 / 755 で十分に解決します。' },
  { id: 'rmrf', test: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\b/,
    title: 'rm -rf を使おうとしています',
    body: '本番環境で最も復旧が難しい操作です。パスを1文字打ち間違えただけで戻せません。\n\n' +
          '消す前に、まず ls -la と du -sh で「何がどれだけあるか」を確認してください。\n' +
          'ログを空けたいだけなら、削除ではなく logrotate や truncate -s 0 が安全です。' },
  { id: 'truncate-log', test: />\s*[^\s|]*production\.log/,
    title: 'production.log を上書きしようとしています',
    body: 'リダイレクト > はファイルを空にしてから書き込みます。\n' +
          '障害調査中のログを消すと、原因を追う手がかりがなくなります。\n\n' +
          '追記したいときは >> を、容量を空けたいときは logrotate を使ってください。' },
  { id: 'rails-destructive',
    test: /\.(destroy_all|delete_all)\b|\.update_all\s*\(|\bDELETE\s+FROM\b|\bTRUNCATE\s+TABLE\b/i,
    title: '本番データを一括で書き換える操作です',
    body: 'destroy_all / delete_all / update_all / DELETE は、\n' +
          '一度実行すると本番のデータが戻りません（バックアップからの復旧作業になります）。\n\n' +
          '打つ前に、必ずこの順番で確認してください。\n' +
          '  1. 対象件数を数える      … .count で「何件に効くのか」を先に見る\n' +
          '  2. 中身を見る            … .pluck(:id, ...) で実際のレコードを目で確認する\n' +
          '  3. sandboxで試す         … rails console --sandbox なら終了時にrollbackされる\n' +
          '  4. 本当に実行するときは  … 手順をレビューしてもらい、実行ログを残す\n\n' +
          'consoleでの1行が、数万件のデータを消すことがあります。' },

  { id: 'secret-echo',
    /* 値を数えたりハッシュ化して確認するのは安全な使い方なので警告しない */
    test: function (c) {
      var shows = /\b(echo|cat|printenv)\b[^|]*(SECRET_KEY_BASE|DATABASE_PASSWORD|AWS_SECRET_ACCESS_KEY)/.test(c) ||
                  /^\s*(env|printenv)\s*$/.test(c);
      var safe = /\|\s*(wc|md5sum|sha256sum|cksum|cut|grep\s+-\w*c)\b/.test(c);
      return shows && !safe;
    },
    title: '秘密情報をターミナルへ表示しようとしています',
    body: 'SECRET_KEY_BASE / DATABASE_PASSWORD / AWS_SECRET_ACCESS_KEY のような値は、\n' +
          '画面共有・スクロールバック・録画・シェル履歴に残ります。\n' +
          '引数なしの env も、すべての秘密情報をそのまま画面に出します。\n\n' +
          '「設定されているか」を確かめたいだけなら、値ではなく有無や長さを見ます。\n' +
          '  printenv SECRET_KEY_BASE | wc -c\n' +
          '  env | grep -c SECRET_KEY_BASE\n' +
          '  env | cut -d= -f1 | sort' }
];

/* ---------------- 1行で書き切れていないコマンド ----------------
   閉じていない引用符。bash なら続きの行を待つが、この端末は1行ずつなので知らせて止める。
   ヒアドキュメント（<<EOF）も続きの行が要るので案内する（aws-learning の shell.ts と同じ。
   ただし <<< "文字列"（ヒアストリング）は1行で完結するので対象から外した） */
function syntaxError(line) {
  var quoteCh = '';
  for (var i = 0; i < line.length; i++) {
    var c = line[i];
    if (quoteCh) {
      if (c === quoteCh) quoteCh = '';
      else if (c === '\\' && quoteCh === '"') i++;
    } else if (c === '\\') i++;
    else if (c === '"' || c === "'") quoteCh = c;
    else if (c === '#' && (i === 0 || /\s/.test(line[i - 1]))) break;
  }
  if (quoteCh) return 'bash: unexpected EOF while looking for matching `' + quoteCh + "'\n" + DIM + '(この端末では、コマンドを1行で書きます。引用符を閉じ忘れていないか確かめてください)' + R;
  if (/(?<!<)<<(?!<)-?\s*['"]?\w+['"]?\s*$/.test(line)) return DIM + '(この端末はヒアドキュメント (<<EOF) に対応していません。ファイルは echo \'...\' > file や printf で作ってください)' + R;
  return null;
}

/* ================================================================ */
function LearningLinuxRuntime(adapter) {
  this.adapter = adapter;
  this.state = null;
  this.investigation = null;
  this._listeners = {};
  this._stopFollowing = null;
  this._cancelled = false;
  var self = this;
  adapter.onReady(function (api) { return window.LFR.scenarioCommands.register(self, api); });
}

/* ---- イベント ---- */
LearningLinuxRuntime.prototype.on = function (name, fn) {
  (this._listeners[name] = this._listeners[name] || []).push(fn);
  return this;
};
LearningLinuxRuntime.prototype.emit = function (name, payload) {
  (this._listeners[name] || []).forEach(function (fn) { fn(payload); });
};

/* ---- CASEのロード ---- */
LearningLinuxRuntime.prototype.boot = function (scenario) {
  return this.resetScenario(scenario);
};

LearningLinuxRuntime.prototype.resetScenario = function (scenario) {
  this.state = scenario;
  this.investigation = {
    caseId: scenario.id,
    commandCount: 0,
    commands: [],
    facts: {},
    hintsUsed: 0,
    dangerousCommands: [],
    failedCommands: 0,
    startedAt: Date.now()
  };
  this.recomputeDisk();
  /* AWS のCASEは、開くたび（やり直すたび）にシミュレーターの環境を作り直す */
  if (scenario.awsEnv && window.AwsSim) window.AwsSim.load(scenario.awsEnv(window.AwsSim));
  /* 中身を関数で書いたファイルは、CASE を開いた時刻で作る（ログの時刻を、シミュレーターの時刻にそろえる） */
  Object.keys(scenario.files || {}).forEach(function (p) {
    if (typeof scenario.files[p] === 'function') scenario.files[p] = scenario.files[p]();
  });
  /* /proc は書き込めない仮想FSなので、読み出し時に procRead/procList で合成する */
  return this.adapter.reset(scenario);
};

/* ---- コマンド実行 ---- */
LearningLinuxRuntime.prototype.execute = function (line, opts) {
  var self = this;
  opts = opts || {};
  var cmd = String(line).trim();
  if (!cmd) return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 });

  var danger = this._checkDanger(cmd);
  this._cancelled = false;
  /* REPL中はLifoへ渡さず、対応表で評価する */
  if (this.state.repl) {
    var rres = this._evalRepl(cmd);
    this._record(cmd, rres);
    if (danger) this.emit('danger', danger);
    return Promise.resolve(rres);
  }

  /* sudo は「権限が要る操作だ」と記録するだけで、実行自体は素通しする。
     教材の目的は権限管理の演習ではなく、復旧手順を体で覚えることなので。 */
  var sudoed = SUDO_RE.test(cmd);
  SUDO_RE.lastIndex = 0;
  if (sudoed) {
    this.investigation.usedSudo = true;
    cmd = cmd.replace(SUDO_RE, '$1');
  }

  var syntax = syntaxError(cmd);
  if (syntax) {
    var sres = { stdout: '', stderr: syntax + '\n', exitCode: 2 };
    this._record(cmd, sres);
    return Promise.resolve(sres);
  }

  var denied = this._checkDenied(cmd);
  if (denied) {
    var res = { stdout: '', stderr: denied + '\n', exitCode: 1 };
    this._record(cmd, res);
    if (danger) this.emit('danger', danger);
    return Promise.resolve(res);
  }

  var raw = String(line).trim();
  return this.adapter.run(cmd, { onStdout: opts.onStdout, onStderr: opts.onStderr })
    .then(function (res) {
      self._record(raw, res);
      if (danger) self.emit('danger', danger);
      return res;
    })
    .catch(function (e) {
      var res = { stdout: '', stderr: String(e && e.message || e) + '\n', exitCode: 1 };
      self._record(raw, res);
      return res;
    });
};

LearningLinuxRuntime.prototype._checkDanger = function (cmd) {
  for (var i = 0; i < DANGERS.length; i++) {
    var d = DANGERS[i];
    var hit = typeof d.test === 'function' ? d.test(cmd) : d.test.test(cmd);
    if (hit) {
      if (this.investigation.dangerousCommands.indexOf(DANGERS[i].id) < 0) {
        this.investigation.dangerousCommands.push(DANGERS[i].id);
      }
      return DANGERS[i];
    }
  }
  return null;
};

LearningLinuxRuntime.prototype._checkDenied = function (cmd) {
  var meta = this.state.fsMeta || {}, self = this, st = this.state;
  /* denyRead は関数でもよい（今のユーザーによって読めたり読めなかったりする） */
  var denied = Object.keys(meta).filter(function (p) {
    var d = meta[p].denyRead;
    return typeof d === 'function' ? d(st) : !!d;
  });
  if (!denied.length) return null;
  var cwd = this.adapter.cwd;
  var msg = null;

  cmd.split(/[|;]|&&/).forEach(function (seg) {
    if (msg) return;
    var tokens = seg.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return;
    var name = tokens[0];
    if (READERS.indexOf(name) < 0) return;
    tokens.slice(1).forEach(function (t) {
      if (msg || t.charAt(0) === '-') return;
      var abs = self.canonical(self.resolvePath(t.replace(/^["']|["']$/g, ''), cwd));
      if (denied.indexOf(abs) >= 0 || denied.indexOf(self.canonical(abs)) >= 0) {
        msg = name + ': ' + t + ': Permission denied';
      }
    });
  });
  return msg;
};

LearningLinuxRuntime.prototype._record = function (cmd, res) {
  var inv = this.investigation, self = this;
  inv.commandCount++;
  inv.commands.push(cmd);
  if (res.exitCode !== 0) inv.failedCommands++;

  var fresh = [];
  function mark(key, label) {
    if (inv.facts[key]) return;
    inv.facts[key] = { label: label, at: inv.commandCount, via: cmd };
    fresh.push({ key: key, label: label });
  }

  PROBES.forEach(function (p) {
    try { if (p.test(cmd, res, self)) mark(p.key, p.label); } catch (e) {}
  });

  /* サービス名を含んでいれば「そのサービスを調べた」 */
  Object.keys(this.state.services || {}).forEach(function (name) {
    if (new RegExp('\\b' + name + '\\b', 'i').test(cmd) && res.stdout.length + res.stderr.length > 0) {
      mark(serviceProbeKey(name), name + ' の状態を確認した');
    }
  });

  /* CASE固有の追加ルール */
  (this.state.probes || []).forEach(function (p) {
    try { if (p.test(cmd, res, self)) mark(p.key, p.label); } catch (e) {}
  });

  if (fresh.length) this.emit('investigation', { fresh: fresh, investigation: inv });
  this.emit('command', { command: cmd, result: res, investigation: inv });
};

LearningLinuxRuntime.prototype.useHint = function () {
  this.investigation.hintsUsed++;
  this.emit('investigation', { fresh: [], investigation: this.investigation });
};

/* ---- Ctrl+C ---- */
/* 追尾のタイマーと全画面コマンドの入力待ちも、演習を離れた時点で終了する。 */
LearningLinuxRuntime.prototype.cancel = function () {
  this._cancelled = true;
  if (this._stopFollowing) this._stopFollowing();
  this.closeInput();
  if (this.adapter.cancel) this.adapter.cancel();
};
LearningLinuxRuntime.prototype.isFollowing = function () { return !!this._stopFollowing; };

/* tail -f / journalctl -f の追尾。
   Lifoは RunOptions.signal をコマンドへ伝えないので、中断はruntimeが持つ。 */
LearningLinuxRuntime.prototype.follow = function (ctx, lines, label) {
  var self = this;
  if (this._cancelled) return Promise.resolve(130);
  var live = this.state.liveLog || {};
  var interval = live.intervalMs || 1400;
  var i = 0;
  return new Promise(function (resolve) {
    var timer = setInterval(function () {
      if (i < lines.length) {
        ctx.stdout.write(lines[i] + '\n');
        i++;
      }
    }, interval);
    self._stopFollowing = function () {
      clearInterval(timer);
      self._stopFollowing = null;
      ctx.stdout.write('^C\n');
      resolve(130);
    };
  });
};

/* ---- ログインユーザーを切り替える（ssm-user → deploy など） ---- */
LearningLinuxRuntime.prototype.becomeUser = function (name, opts) {
  opts = opts || {};
  var st = this.state;
  st.user = name;
  st.home = opts.home || (name === 'root' ? '/root' : '/home/' + name);
  /* SSM直後の sh-5.2$ のような固定プロンプトは、ユーザーを切り替えたら通常表示へ戻す */
  if (st.prompt && !opts.keepPrompt) st.prompt = null;
  this.adapter.setEnv('USER', name);
  this.adapter.setEnv('LOGNAME', name);
  this.adapter.setEnv('HOME', st.home);
  this.emit('operation', { command: 'become', user: name });
  return this.adapter.setCwd(opts.cwd || st.home);
};

/* ---- 全画面コマンド（vi など）への入力 ----
   viはキーを1つずつ await stdin.read() で待つ。
   TerminalControllerが押されたキーをここへ流し込む。 */
LearningLinuxRuntime.prototype.openInput = function () {
  var queue = [], waiters = [], closed = this._cancelled;
  this._raw = true;
  this._input = {
    push: function (s) {
      if (closed) return;
      if (waiters.length) waiters.shift()(s);
      else queue.push(s);
    },
    close: function () {
      closed = true;
      while (waiters.length) waiters.shift()(null);
    }
  };
  return {
    read: function () {
      if (queue.length) return Promise.resolve(queue.shift());
      if (closed) return Promise.resolve(null);
      return new Promise(function (resolve) { waiters.push(resolve); });
    },
    readAll: function () { return Promise.resolve(queue.splice(0).join('')); }
  };
};

LearningLinuxRuntime.prototype.closeInput = function () {
  if (this._input) this._input.close();
  this._input = null;
  this._raw = false;
};

LearningLinuxRuntime.prototype.acceptsInput = function () { return !!this._raw; };
LearningLinuxRuntime.prototype.pushInput = function (data) {
  if (this._input) this._input.push(data);
};

/* Terminalの実サイズ。viが画面を組み立てるのに要る */
LearningLinuxRuntime.prototype.setViewport = function (cols, rows) {
  this._viewport = { cols: cols, rows: rows };
};
LearningLinuxRuntime.prototype.viewport = function () {
  return this._viewport || { cols: 80, rows: 24 };
};

/* ---- REPL（rails console など） ----
   本物のRubyは動かせないので、CASEが宣言した式と応答の対応表で再現する。
   目的は「本番でconsoleを開いたとき、何をどの順で打つか」を体で覚えること。 */
LearningLinuxRuntime.prototype.enterRepl = function (spec) {
  this.state.repl = spec;
  this.state.replLine = 1;
  this.state.replPrevPrompt = this.state.prompt || null;
  this.state.prompt = this.replPrompt();
  this.emit('operation', { command: 'repl:enter', sandbox: !!spec.sandbox });
};

LearningLinuxRuntime.prototype.replPrompt = function () {
  var n = String(this.state.replLine || 1).padStart(3, '0');
  /* Rails 7.2 からの console は「アプリ名(環境):001>」の形 */
  if (this.state.repl.style === 'rails8') return this.state.repl.name + ':' + n + '> ';
  return (this.state.repl.name || 'irb(main)') + ':' + n + ':0> ';
};

LearningLinuxRuntime.prototype.leaveRepl = function () {
  var spec = this.state.repl;
  this.state.repl = null;
  this.state.prompt = this.state.replPrevPrompt || null;
  this.emit('operation', { command: 'repl:exit', sandbox: !!(spec && spec.sandbox) });
  return spec;
};

/* REPL内の1行を評価する。Lifoへは渡さない */
LearningLinuxRuntime.prototype._evalRepl = function (line) {
  var spec = this.state.repl;
  var out = '';

  if (/^(exit|quit|\x04)\s*$/.test(line)) {
    this.leaveRepl();
    if (spec.sandbox) {
      out = '\x1b[33mTransaction rolled back（--sandbox で開いたため、この中の変更はすべて取り消されました）\x1b[0m\n';
    }
    /* ECS Exec のセッションの中で開いた console は、閉じるとセッションも終わる */
    if (spec.session) out += '\n\nExiting session with sessionId: ' + spec.session + '.\n';
    return { stdout: out, stderr: '', exitCode: 0 };
  }

  var hit = null;
  (spec.table || []).forEach(function (e) {
    if (hit) return;
    var re = e.re instanceof RegExp ? e.re : new RegExp(e.re);
    if (re.test(line)) hit = e;
  });

  this.state.replLine = (this.state.replLine || 1) + 1;
  this.state.prompt = this.replPrompt();

  if (!hit) {
    return { stdout: '', exitCode: 1,
      stderr: '\x1b[2m[学習環境] この式は評価できません。' +
              'このCASEで用意している式は右の「今回使うLinux知識」に載っています。\x1b[0m\n' };
  }
  if (hit.blocked) {
    return { stdout: '', stderr: hit.out + '\n', exitCode: 1 };
  }
  if (hit.apply) hit.apply(this.state);
  return { stdout: (typeof hit.out === 'function' ? hit.out(this.state) : hit.out) + '\n', stderr: '', exitCode: 0 };
};

/* ---- 手元のPC → 本番サーバー（SSM Session Manager） ---- */
LearningLinuxRuntime.prototype.connectServer = function () {
  var st = this.state, sv = st.server;
  if (!sv) return Promise.resolve();
  st.hostname = sv.hostname;
  st.prompt = sv.prompt || null;
  st.connected = true;
  this.emit('operation', { command: 'ssm start-session', host: sv.hostname });
  return this.becomeUser(sv.user, { home: sv.home, cwd: sv.cwd || sv.home, keepPrompt: true });
};

/* ---- サービスの起動・停止 ----
   CASEが services[x].recovery を宣言したときだけ実際に状態が変わる。
   宣言していないCASE（調査専用）では、これまで通り権限エラーで失敗させる。 */
LearningLinuxRuntime.prototype.serviceAction = function (action, name) {
  var st = this.state;
  var svc = (st.services || {})[name];
  if (!svc) {
    return { code: 5, err: 'Failed to ' + action + ' ' + name + '.service: Unit ' + name + '.service not found.\n' };
  }
  var rec = svc.recovery;
  if (!rec) {
    return { code: 1, err:
      'Failed to ' + action + ' ' + name + '.service: Interactive authentication required.\n' +
      'See system logs and \'systemctl status ' + name + '.service\' for details.\n' };
  }

  var self = this;
  var log = function (line) {
    st.journal = st.journal || {};
    st.journal[name] = (st.journal[name] || []).concat([self.stamp() + ' production ' + line]);
  };

  function down(reason) {
    if (svc.status === 'active') {
      log('systemd[1]: Stopping ' + (svc.description || name) + '...');
      log('systemd[1]: Stopped ' + (svc.description || name) + '.');
    }
    svc.status = reason ? 'failed' : 'inactive';
    svc.sub = null;
    if (rec.onDown) rec.onDown(st);
  }

  if (action === 'stop') {
    down(null);
    this.releaseOrphanedFiles();
    this.emit('operation', { command: 'systemctl stop', unit: name, ok: true });
    return { code: 0, out: '' };
  }

  if (action === 'reload') {
    if (svc.status !== 'active') {
      return { code: 1, err: 'Failed to reload ' + name + '.service: Unit ' + name + '.service is not active.\n' };
    }
    log('systemd[1]: Reloading ' + (svc.description || name) + '...');
    log('systemd[1]: Reloaded ' + (svc.description || name) + '.');
    this.emit('operation', { command: 'systemctl reload', unit: name, ok: true });
    return { code: 0, out: '' };
  }

  /* start / restart */
  if (action === 'restart') { down(null); this.releaseOrphanedFiles(); }

  log('systemd[1]: Starting ' + (svc.description || name) + '...');
  var blocked = rec.blockedBy ? rec.blockedBy(st) : null;
  if (blocked) {
    log(name + '[' + (svc.mainPid || 9000) + ']: ' + blocked);
    log('systemd[1]: ' + name + '.service: Main process exited, code=exited, status=1/FAILURE');
    log('systemd[1]: ' + name + '.service: Failed with result \'exit-code\'.');
    log('systemd[1]: Failed to start ' + (svc.description || name) + '.');
    svc.status = 'failed';
    svc.result = 'exit-code';
    svc.exitCode = 1;
    svc.since = this.sinceText();
    svc.ago = '0s ago';
    if (rec.onDown) rec.onDown(st);
    this.emit('operation', { command: 'systemctl ' + action, unit: name, ok: false, reason: blocked });
    return { code: 1, err:
      'Job for ' + name + '.service failed because the control process exited with error code.\n' +
      'See "systemctl status ' + name + '.service" and "journalctl -xeu ' + name + '.service" for details.\n' };
  }

  log('systemd[1]: Started ' + (svc.description || name) + '.');
  /* EnvironmentFile は、起動するときに読む。起動し直さない限り、プロセスの環境変数は前に読んだ値のまま */
  if (svc.environmentFile && this.adapter.readFileSync) {
    var envText = null;
    try { envText = this.adapter.readFileSync(svc.environmentFile); } catch (e) { envText = null; }
    if (envText != null) {
      var parsed = {};
      String(envText).split('\n').forEach(function (line) {
        var m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (m) parsed[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
      });
      (st.serviceEnv = st.serviceEnv || {})[name] = parsed;
    }
  }
  /* daemon-reload で読み直した unit の値を、起動したプロセスへ反映する */
  if (svc.limitNofile) {
    st.limits = st.limits || {};
    st.limits.nofile = svc.limitNofile;
    st.limits.nofileHard = svc.limitNofile;
  }
  svc.status = 'active';
  svc.sub = 'running';
  svc.result = null;
  svc.exitCode = null;
  svc.since = this.sinceText();
  svc.ago = '0s ago';
  if (rec.onUp) rec.onUp(st);
  this.emit('operation', { command: 'systemctl ' + action, unit: name, ok: true });
  return { code: 0, out: '' };
};

/* 仮想時計。操作のたびに少し進める */
LearningLinuxRuntime.prototype.tick = function (sec) {
  var p = (this.state.now || '00:00:00').split(':').map(Number);
  var t = p[0] * 3600 + p[1] * 60 + p[2] + (sec || 2);
  var pad = function (n) { return String(n).padStart(2, '0'); };
  this.state.now = pad(Math.floor(t / 3600) % 24) + ':' + pad(Math.floor(t / 60) % 60) + ':' + pad(t % 60);
  return this.state.now;
};
LearningLinuxRuntime.prototype.stamp = function () {
  return (this.state.date || 'Sep 14') + ' ' + this.tick();
};
LearningLinuxRuntime.prototype.sinceText = function () {
  var d = (this.state.date || 'Sep 14').split(' ');
  var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(d[0]) + 1;
  return (this.state.weekday || 'Mon') + ' 2026-' + String(month).padStart(2, '0') + '-' +
         String(d[1]).padStart(2, '0') + ' ' + this.state.now + ' JST';
};

/* ---- ディスクを空ける ----
   disk.sizes を減らし、親ディレクトリと df の使用量へ伝播させる。
   truncate や logrotate から呼ばれる。 */
LearningLinuxRuntime.prototype.freeDisk = function (abs, newKB) {
  var d = this.state.disk;
  if (!d || !d.sizes) return 0;
  var old = d.sizes[abs];
  if (old == null) return 0;
  newKB = newKB || 0;
  var freed = Math.max(0, old - newKB);
  d.sizes[abs] = newKB;

  /* 親ディレクトリの合計から差し引く */
  Object.keys(d.sizes).forEach(function (p) {
    if (p !== abs && abs.indexOf(p + '/') === 0) d.sizes[p] = Math.max(0, d.sizes[p] - freed);
  });

  (d.filesystems || []).forEach(function (f) {
    if (f.usedKB == null) return;
    f.usedKB = Math.max(0, f.usedKB - freed);
  });
  this.recomputeDisk();
  return freed;
};

/* ---- /proc/<PID>/ を組み立てる ----
   「そのプロセスが実際に持っている環境変数・上限・親」を見る唯一の場所。
   state.processes から毎回作り直す。 */
LearningLinuxRuntime.prototype.procFiles = function (st) {
  var files = {};
  var lim = st.limits || { nofile: 1024, nproc: 30827 };
  var envMap = st.envVars || {};
  (st.processes || []).forEach(function (p) {
    var d = '/proc/' + p.pid;
    files[d + '/cmdline'] = p.command.replace(/\s+/g, '\u0000') + '\u0000';
    files[d + '/comm'] = p.command.split(/[\s:]/)[0] + '\n';

    /* アプリのプロセスだけがアプリの環境変数を持っている、を再現する */
    var env = { PATH: '/usr/bin:/bin', HOME: '/home/' + p.user, USER: p.user, LANG: 'ja_JP.UTF-8' };
    if (p.user === (st.user || 'deploy') || /puma|sidekiq|ruby|rails/.test(p.command)) {
      Object.keys(envMap).forEach(function (k) { env[k] = envMap[k]; });
      /* systemd が起動したときに EnvironmentFile から読んだ値（サービスごと） */
      var svcEnv = (st.serviceEnv || {})[/sidekiq/.test(p.command) ? 'sidekiq' : /puma/.test(p.command) ? 'puma' : ''];
      if (svcEnv) Object.keys(svcEnv).forEach(function (k) { env[k] = svcEnv[k]; });
    }
    files[d + '/environ'] = Object.keys(env).map(function (k) { return k + '=' + env[k]; }).join('\u0000') + '\u0000';

    files[d + '/limits'] =
      'Limit                     Soft Limit           Hard Limit           Units\n' +
      'Max open files            ' + pad(lim.nofile, 21) + pad(lim.nofileHard || lim.nofile, 21) + 'files\n' +
      'Max processes             ' + pad(lim.nproc, 21) + pad(lim.nproc, 21) + 'processes\n' +
      'Max core file size        ' + pad(lim.core || 0, 21) + pad('unlimited', 21) + 'bytes\n';

    files[d + '/status'] =
      'Name:\t' + p.command.split(/[\s:]/)[0] + '\n' +
      'State:\t' + (p.stat || 'S').charAt(0) + ' (' + ((p.stat || 'S').charAt(0) === 'R' ? 'running' : 'sleeping') + ')\n' +
      'Pid:\t' + p.pid + '\n' +
      'PPid:\t' + (p.ppid || parentOf(st, p)) + '\n' +
      'Threads:\t' + (p.threads || 6) + '\n' +
      'VmSize:\t' + (p.vsz || 0) + ' kB\n' +
      'VmRSS:\t' + (p.rss || 0) + ' kB\n';
  });
  return files;
};

/* Lifoの /proc は読み取り専用の仮想FSで書き込めない。
   そこで読み出しだけ、こちらで合成して返す。 */
LearningLinuxRuntime.prototype.procRead = function (abs) {
  if (!/^\/proc\/\d+\//.test(abs)) return null;
  var files = this.procFiles(this.state);
  return files[abs] != null ? files[abs] : null;
};

LearningLinuxRuntime.prototype.procList = function (abs) {
  var m = /^\/proc\/(\d+)\/?$/.exec(abs);
  if (!m) return null;
  var prefix = '/proc/' + m[1] + '/';
  var files = this.procFiles(this.state);
  var names = Object.keys(files)
    .filter(function (k) { return k.indexOf(prefix) === 0; })
    .map(function (k) { return k.slice(prefix.length); });
  return names.length ? names.sort() : null;
};

/* puma: cluster worker 0: 1421 のような表記から親PIDを拾う */
function parentOf(st, p) {
  var m = /cluster worker \d+: (\d+)/.exec(p.command || '');
  return m ? Number(m[1]) : 1;
}
function pad(v, n) { v = String(v); while (v.length < n) v += ' '; return v; }

/* ---- 削除済みだが開かれたままのファイル ----
   Linuxでは、あるプロセスが開いているファイルを rm しても、
   ディレクトリから名前が消えるだけで実体は残り続け、容量は戻らない。
   解放されるのは、開いていたプロセスが終了したとき。
   教材でもこの挙動をそのまま再現する。 */
LearningLinuxRuntime.prototype.markDeleted = function (abs) {
  var st = this.state;
  var holders = (st.openFiles || []).filter(function (f) {
    return !f.deleted && f.path === abs;
  });
  if (!holders.length) return false;          /* 誰も掴んでいなければ普通に消える */
  holders.forEach(function (f) { f.deleted = true; f.name = f.path; });
  this.emit('operation', { command: 'rm:held', path: abs, holders: holders.map(function (f) { return f.pid; }) });
  return true;                                 /* 容量は戻さない */
};

/* 掴んでいたプロセスが居なくなった削除済みファイルを解放する */
LearningLinuxRuntime.prototype.releaseOrphanedFiles = function () {
  var st = this.state, self = this;
  var alive = {};
  (st.processes || []).forEach(function (p) { alive[p.pid] = true; });
  var freed = 0;
  (st.openFiles || []).forEach(function (f) {
    if (!f.deleted || alive[f.pid]) return;
    freed += self.freeDisk(f.path, 0);
    f.released = true;
  });
  st.openFiles = (st.openFiles || []).filter(function (f) { return !f.released; });
  return freed;
};

/* totalKB / usedKB を宣言しているファイルシステムは、df の表示を計算で出す */
LearningLinuxRuntime.prototype.recomputeDisk = function () {
  var d = this.state.disk;
  if (!d || !d.filesystems) return;
  var h = window.LFR.humanBytes;
  d.filesystems.forEach(function (f) {
    if (f.totalKB == null || f.usedKB == null) return;
    var avail = Math.max(0, f.totalKB - f.usedKB);
    f.size  = h(f.totalKB * 1024);
    f.used  = h(f.usedKB * 1024);
    f.avail = avail === 0 ? '0' : h(avail * 1024);
    f.usePct = Math.min(100, Math.round((f.usedKB / f.totalKB) * 100));
  });
};

/* ---- パス ---- */
LearningLinuxRuntime.prototype.resolvePath = function (p, cwd) {
  if (!p) return cwd;
  if (p.charAt(0) === '~') p = (this.state.home || '/root') + p.slice(1);
  var abs = p.charAt(0) === '/' ? p : (cwd || '/') + '/' + p;
  var outp = [];
  abs.split('/').forEach(function (s) {
    if (!s || s === '.') return;
    if (s === '..') { outp.pop(); return; }
    outp.push(s);
  });
  return '/' + outp.join('/');
};

/* symlink mapを辿って実体のパスに直す。
   /var/www/myapp/current/log -> /var/www/myapp/releases/…/log -> /var/www/myapp/shared/log */
LearningLinuxRuntime.prototype.canonical = function (abs) {
  var links = this.state.symlinks || {}, keys = Object.keys(links);
  for (var n = 0; n < 8; n++) {
    var moved = false;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (abs === k) { abs = links[k]; moved = true; break; }
      if (abs.indexOf(k + '/') === 0) { abs = links[k] + abs.slice(k.length); moved = true; break; }
    }
    if (!moved) break;
  }
  return abs;
};

LearningLinuxRuntime.prototype.displayPath = function (abs, cwd) {
  if (abs === cwd) return '.';
  if (abs.indexOf(cwd + '/') === 0) return './' + abs.slice(cwd.length + 1);
  return abs;
};

/* /var/www/myapp/current -> /var/www/myapp/releases/x を releases/x に戻す */
LearningLinuxRuntime.prototype.relativeLink = function (linkAbs, targetAbs) {
  var dir = linkAbs.slice(0, linkAbs.lastIndexOf('/'));
  if (targetAbs.indexOf(dir + '/') === 0) return targetAbs.slice(dir.length + 1);
  return targetAbs;
};

LearningLinuxRuntime.prototype.duSize = function (abs, sizes) {
  if (sizes[abs] != null) return sizes[abs];
  var total = 0;
  Object.keys(sizes).forEach(function (p) {
    if (p.indexOf(abs + '/') === 0 && p.slice(abs.length + 1).indexOf('/') < 0) total += sizes[p];
  });
  return total;
};

/* ---- ls の装飾 ----
   Lifoのls出力をそのまま活かし、symlinkと所有者/permissionだけ差し替える。
   lsを作り直しているのではなく、CASEが宣言したメタ情報を被せているだけ。 */
var LS_LINE = /^([-dlbcps][rwxsStT-]{9})(\s+\d+\s+)(\S+)(\s+)(\S+)(\s+)(\d+)(\s+)(\S+\s+\d+\s+[\d:]+)(\s+)(.*)$/;

LearningLinuxRuntime.prototype.decorateLs = function (text, ctx) {
  var self = this;
  var links = this.state.symlinks || {}, meta = this.state.fsMeta || {};
  var user = this.state.user || 'deploy';
  if (!text) return text;

  /* 表示対象ディレクトリの候補（引数なしならcwd） */
  var human = (ctx.args || []).some(function (a) { return /^-[a-zA-Z]*h/.test(a); });
  /* 所有者列の幅。Lifoは常に "user" を出すので、差し替える名前の最大長に揃える */
  var ownerW = user.length;
  Object.keys(meta).forEach(function (k) {
    ownerW = Math.max(ownerW, (meta[k].owner || '').length, (meta[k].group || '').length);
  });
  var dirs = [];
  function addDir(d) {
    if (dirs.indexOf(d) < 0) dirs.push(d);
    var c = self.canonical(d);
    if (dirs.indexOf(c) < 0) dirs.push(c);
  }
  addDir(ctx.cwd);
  (ctx.args || []).forEach(function (a) {
    if (a.charAt(0) === '-') return;
    addDir(self.resolvePath(a, ctx.cwd));
  });

  return text.split('\n').map(function (line) {
    var m = LS_LINE.exec(line);
    if (!m) return line;
    var name = m[11].replace(/\x1b\[[0-9;]*m/g, '');
    var hit = null;
    for (var i = 0; i < dirs.length; i++) {
      var abs = dirs[i] === '/' ? '/' + name : dirs[i] + '/' + name;
      if (links[abs]) { hit = { abs: abs, target: links[abs] }; break; }
      if (meta[abs])  { hit = { abs: abs, meta: meta[abs] }; break; }
    }
    /* 列がずれないよう、所有者名の最大長に合わせて詰める */
    function fit(v) { v = String(v); while (v.length < ownerW) v += ' '; return v; }
    var mode = m[1], owner = fit(user), group = fit(user), tail = m[11];
    if (hit && hit.target) {
      var rel = self.relativeLink(hit.abs, hit.target);
      mode = 'lrwxrwxrwx';
      tail = '\x1b[36m' + name + '\x1b[0m -> \x1b[1m\x1b[34m' + rel + '\x1b[0m';
      var size = String(rel.length);
      while (size.length < m[7].length) size = ' ' + size;
      return mode + m[2] + owner + m[4] + group + m[6] + size + m[8] + m[9] + m[10] + tail;
    }
    var sz = m[7];
    if (hit && hit.meta) {
      if (hit.meta.mode)  mode  = hit.meta.mode;
      if (hit.meta.owner) owner = fit(hit.meta.owner);
      if (hit.meta.group) group = fit(hit.meta.group);
      /* CASEがサイズを宣言していれば、実ファイルのサイズより優先する
         （28GBのログをVFSに本当に置くわけにはいかないため） */
      if (hit.meta.size != null) {
        sz = human ? window.LFR.humanBytes(hit.meta.size) : String(hit.meta.size);
        while (sz.length < m[7].length) sz = ' ' + sz;
      }
    }
    return mode + m[2] + owner + m[4] + group + m[6] + sz + m[8] + m[9] + m[10] + tail;
  }).join('\n');
};

/* ---- Tab補完 ----
   先頭の語ならコマンド名、それ以降ならパスを補完する。
   コマンド名の一覧はLifoのregistryから、パスはVFSから取る（どちらもadapter経由）。
   ponytail: クォートの中は見ていない。実サーバーのbashほど賢くはない。 */
LearningLinuxRuntime.prototype.complete = function (line, cursor) {
  var self = this;
  var head = line.slice(0, cursor);

  /* 補完対象の語（カーソル直前の連続した非空白） */
  var m = /(\S*)$/.exec(head);
  var word = m[1];
  var start = cursor - word.length;

  /* この語がコマンド位置か（行頭、または | ; && || の直後か） */
  var before = head.slice(0, start).replace(/\s+$/, '');
  var isCommandPos = before === '' || /(\||;|&&|\|\|)$/.test(before);

  /* items は行に差し込む文字列、labels は候補一覧に表示する短い形 */
  var done = function (list, labels) {
    list = list.filter(function (v, i) { return list.indexOf(v) === i; }).sort();
    return { start: start, end: cursor, items: list, labels: labels || list,
             common: commonPrefix(list) };
  };

  /* aws の後ろは、サービス・サブコマンド・オプションをシミュレーターに聞く */
  var words = before.split(/\||;|&&|\|\||\$\(/).pop().trim().split(/\s+/).filter(Boolean);
  if (words[0] === 'aws' && this.state.awsEnv && window.AwsSim) {
    return Promise.resolve(done(window.AwsSim.complete(words.slice(1), word)));
  }

  if (isCommandPos && word.indexOf('/') < 0) {
    var names = self.adapter.commandNames().filter(function (n) { return n.indexOf(word) === 0; });
    return Promise.resolve(done(names));
  }

  /* パス補完 */
  var slash = word.lastIndexOf('/');
  var dirPart = slash < 0 ? '' : word.slice(0, slash + 1);
  var prefix  = slash < 0 ? word : word.slice(slash + 1);
  var absDir  = this.canonical(this.resolvePath(dirPart || '.', this.adapter.cwd));

  return this.adapter.readdir(absDir).then(function (entries) {
    var hits = entries.filter(function (e) { return e.name.indexOf(prefix) === 0; });
    var suffix = function (e) { return e.name + (e.type === 'directory' ? '/' : ''); };
    return done(
      hits.map(function (e) { return dirPart + suffix(e); }),
      hits.map(suffix).sort()
    );
  });
};

function commonPrefix(list) {
  if (!list.length) return '';
  var p = list[0];
  for (var i = 1; i < list.length; i++) {
    while (p && list[i].indexOf(p) !== 0) p = p.slice(0, -1);
  }
  return p;
}

/* ---- プロンプト ---- */
LearningLinuxRuntime.prototype.cwd = function () { return this.adapter.cwd; };

LearningLinuxRuntime.prototype.promptText = function () {
  if (this.state.prompt) return this.state.prompt;
  var cwd = this.adapter.cwd;
  var home = this.state.home || '/root';
  if (cwd === home) cwd = '~';
  else if (cwd.indexOf(home + '/') === 0) cwd = '~' + cwd.slice(home.length);
  return this.state.user + '@' + this.state.hostname + ':' + cwd + '$ ';
};

LearningLinuxRuntime.prototype.promptAnsi = function () {
  if (this.state.prompt) return '\x1b[1;37m' + this.state.prompt + '\x1b[0m';
  var cwd = this.adapter.cwd;
  var home = this.state.home || '/root';
  if (cwd === home) cwd = '~';
  else if (cwd.indexOf(home + '/') === 0) cwd = '~' + cwd.slice(home.length);
  return '\x1b[1;32m' + this.state.user + '@' + this.state.hostname + '\x1b[0m:' +
         '\x1b[1;34m' + cwd + '\x1b[0m$ ';
};

/* ls -lh / du -h が出す単位表記 */
function humanBytes(n) {
  var u = ['', 'K', 'M', 'G', 'T'], i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  if (!i) return String(Math.round(n));
  return (n >= 10 ? Math.round(n) : n.toFixed(1)) + u[i];
}

window.LFR = window.LFR || {};
window.LFR.humanBytes = humanBytes;
window.LFR.LearningLinuxRuntime = LearningLinuxRuntime;
window.LFR.PROBES = PROBES;
})();
