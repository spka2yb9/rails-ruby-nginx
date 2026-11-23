/* 教材固有コマンド
   ------------------------------------------------------------------
   Lifoが持っていない / CASEの状態を反映する必要があるコマンドだけをここに書く。
   すべて Lifo の CommandRegistry へ register するので、
   パイプ・リダイレクト・globの解釈は Lifo の shell がやってくれる。

     ps aux | grep puma        ← grep は Lifo、ps は教材側
     journalctl -u puma | tail ← journalctl は教材側、tail は Lifo

   ls / df / du / tail は「Lifoの実装をラップして、CASEの状態で上書き」する。
   ゼロから作り直さない。                                              */
(function () {
'use strict';

var R = '\x1b[0m', B = '\x1b[1m', DIM = '\x1b[2m';
var RED = '\x1b[31m', GRN = '\x1b[32m', YEL = '\x1b[33m', CYN = '\x1b[36m';

function pad(s, n)  { s = String(s); while (s.length < n) s += ' '; return s; }
function lpad(s, n) { s = String(s); while (s.length < n) s = ' ' + s; return s; }

/* 引数を flags / positional に分ける。-lntp のような連結短縮形も展開する */
function parse(args) {
  var flags = {}, rest = [], longs = {};
  for (var i = 0; i < args.length; i++) {
    var a = args[i];
    if (a.indexOf('--') === 0) {
      var kv = a.slice(2).split('=');
      longs[kv[0]] = kv.length > 1 ? kv[1] : true;
    } else if (a.charAt(0) === '-' && a.length > 1) {
      for (var j = 1; j < a.length; j++) flags[a.charAt(j)] = true;
    } else {
      rest.push(a);
    }
  }
  return { flags: flags, longs: longs, rest: rest, raw: args };
}
/* -u puma のように値をとるフラグ */
function optVal(args, short, long) {
  for (var i = 0; i < args.length; i++) {
    if (short && args[i] === short && args[i + 1]) return args[i + 1];
    if (long && args[i].indexOf(long + '=') === 0) return args[i].slice(long.length + 1);
    if (long && args[i] === long && args[i + 1]) return args[i + 1];
  }
  return null;
}

/* 33.5K / 165B / 1.2Gi のような人間可読サイズを数値に戻す（sort -h 用） */
function hnum(s) {
  var m = String(s).match(/(\d+(?:\.\d+)?)\s*([KMGTP])?i?B?/i);
  if (!m) return 0;
  var mul = { '': 1, K: 1024, M: 1048576, G: 1073741824, T: 1099511627776, P: 1125899906842624 };
  return parseFloat(m[1]) * (mul[(m[2] || '').toUpperCase()] || 1);
}

/* 1234567 → 1.2M（inodeの個数表示用） */
function humanCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return String(n);
}

function humanKB(kb) {
  if (kb >= 1048576) return (kb / 1048576).toFixed(kb >= 10485760 ? 0 : 1) + 'G';
  if (kb >= 1024)    return (kb / 1024).toFixed(kb >= 10240 ? 0 : 1) + 'M';
  return kb + 'K';
}

/* ================================================================
   register(runtime, sandbox)
   runtime.state が現在のCASEの状態。commandはクロージャ経由で毎回読む
   （CASE切替時に再registerしなくてよい）。
   ================================================================ */
function register(runtime, api) {
  /* api は LifoAdapter が提供する薄い窓口。ここからLifoの生APIには触らない。
       api.define(name, fn)        コマンドを追加 / 上書き
       api.wrap(name, fn)          Lifo純正の実装を fn(ctx, orig) でラップ
       api.original(name)          Lifo純正の実装を取得 */
  var S = function () { return runtime.state; };
  var wrap = api.wrap.bind(api), def = api.define.bind(api);
  function out(ctx, text) { ctx.stdout.write(text); }
  function err(ctx, text) { ctx.stderr.write(text); }

  /* stdoutを横取りしてLifoの出力を加工するためのctx差し替え */
  function capture(ctx, orig) {
    var buf = '';
    var sub = Object.create(ctx);
    sub.stdout = { write: function (t) { buf += t; } };
    return Promise.resolve(orig(sub)).then(function (code) {
      return { code: code, text: buf };
    });
  }

  /* activeでないときの SUB は status から決める（CASE側で書き忘れても破綻しない） */
  function subOf(s) {
    if (s.status === 'active') return s.sub || 'running';
    if (s.status === 'failed') return 'failed';
    if (s.status === 'activating') return 'auto-restart';
    return 'dead';
  }


  /* ---------------- テキストファイルの読み直し ----------------
     Lifoの head / tail / grep / wc は、拡張子の無いファイル（Gemfile / REVISION）や
     未知の拡張子を binary と判定して読み飛ばす。
     Railsの本番調査では Gemfile も REVISION も普通に grep する対象なので、
     中身がテキストなら stdin 経由で Lifo 本来の実装へ渡し直す。
     マッチングも整形もLifoのまま。ここでやるのは「データの入れ方」だけ。
     ponytail: ファイル指定が1つのときだけ。複数指定はLifoの挙動のまま。 */
  var SKIP_RE = /: binary file, skipping/;

  /* コマンドごとの「値をとる短縮フラグ」。grepの -n は値をとらない点に注意 */
  var VALUE_FLAGS = {
    grep:  { '-A': 1, '-B': 1, '-C': 1, '-e': 1, '-m': 1, '-f': 1 },
    egrep: { '-A': 1, '-B': 1, '-C': 1, '-e': 1, '-m': 1, '-f': 1 },
    head:  { '-n': 1, '-c': 1 },
    tail:  { '-n': 1, '-c': 1 },
    sort:  { '-k': 1, '-t': 1 },
    cut:   { '-d': 1, '-f': 1 },
    wc:    {},
    nl:    {}
  };

  /* フラグの値を除いた「位置引数」を、元のargsでの位置つきで返す */
  function operands(args, valueFlags) {
    var out = [], i = 0;
    while (i < args.length) {
      var a = args[i];
      if (valueFlags[a]) { i += 2; continue; }
      if (a.charAt(0) === '-' && a.length > 1) { i++; continue; }
      out.push({ v: a, i: i }); i++;
    }
    return out;
  }

  /* Lifoの実装で一度実行し、binary扱いで読み飛ばされたらstdin経由で再実行する。
     fileFrom は「位置引数の何番目からがファイルか」（grepは第1引数がパターン） */
  function runTextSafe(name, ctx, orig, fileFrom) {
    /* /proc は仮想FSなのでLifoからは読めない。先に合成した中身をstdinで渡す */
    var ops = operands(ctx.args, VALUE_FLAGS[name] || {}).slice(fileFrom);
    if (ops.length === 1) {
      var vabs = runtime.canonical(runtime.resolvePath(ops[0].v, ctx.cwd));
      var vbody = runtime.procRead(vabs);
      if (vbody != null) return feedStdin(name, ctx, orig, ops[0], vbody);
    }

    var so = '', se = '';
    var sub = Object.create(ctx);
    sub.stdout = { write: function (t) { so += t; } };
    sub.stderr = { write: function (t) { se += t; } };

    function passthrough(code) { ctx.stdout.write(so); ctx.stderr.write(se); return code; }

    return Promise.resolve(orig(sub)).then(function (code) {
      if (!SKIP_RE.test(se)) return passthrough(code);
      var files = operands(ctx.args, VALUE_FLAGS[name] || {}).slice(fileFrom);
      if (files.length !== 1) return passthrough(code);

      var fabs = runtime.canonical(runtime.resolvePath(files[0].v, ctx.cwd));
      var virt = runtime.procRead(fabs);
      return (virt != null ? Promise.resolve(virt) : api.readFile(fabs)).then(function (text) {
        if (typeof text !== 'string' || text.indexOf('\u0000') >= 0) return passthrough(code);
        return feedStdin(name, ctx, orig, files[0], text);
      }, function () { return passthrough(code); });
    });
  }

  /* ファイル指定を外して、中身を stdin から流し込んで実行し直す */
  function feedStdin(name, ctx, orig, fileOp, text) {
    var args2 = ctx.args.slice();
    args2.splice(fileOp.i, 1);
    var sub = Object.create(ctx);
    sub.args = args2;
    sub.stdin = {
      read: function () { return Promise.resolve(null); },
      readAll: function () { return Promise.resolve(text); }
    };
    var buf = '';
    sub.stdout = { write: function (t) { buf += t; } };
    return Promise.resolve(orig(sub)).then(function (code) {
      /* wc は stdin だとファイル名を出さないので付け直す */
      if (name === 'wc' && buf.trim()) buf = buf.replace(/\s*$/, '') + ' ' + fileOp.v + '\n';
      ctx.stdout.write(buf);
      return code;
    });
  }

  /* grep -A / -B / -C（一致した行の前後も出す）。Lifo の grep はこれらを受け付けないので、ここで出す。
     前後の行のまとまりの間には、本物の grep と同じく -- を挟む。それ以外の使い方は Lifo の grep に任せる（null を返す） */
  function grepContext(ctx, extended) {
    var args = ctx.args, after = 0, before = 0, flags = {}, words = [], any = false;
    for (var i = 0; i < args.length; i++) {
      var x = args[i], m;
      if ((m = /^-([ABC])(\d*)$/.exec(x))) {
        var n = Number(m[2] || args[++i]);
        if (m[1] !== 'B') after = n;
        if (m[1] !== 'A') before = n;
        any = true;
      } else if ((m = /^--(after|before)-context=(\d+)$/.exec(x)) || (m = /^--(context)=(\d+)$/.exec(x))) {
        if (m[1] !== 'before') after = Number(m[2]);
        if (m[1] !== 'after') before = Number(m[2]);
        any = true;
      } else if (/^-[a-zA-Z]+$/.test(x)) {
        x.slice(1).split('').forEach(function (f) { flags[f] = true; });
      } else words.push(x);
    }
    if (!any || !words.length || flags.c || flags.l || flags.o || flags.r) return null;
    var pat = words[0];
    var src = flags.F ? pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            : extended || flags.E ? pat
            : pat.replace(/\\([(){}|+?])|([(){}|+?])/g, function (_, esc, lit) { return esc ? esc : '\\' + lit; });
    var re;
    try { re = new RegExp(src, flags.i ? 'i' : ''); } catch (e) { return null; }
    var files = words.slice(1);
    var read = files.length
      ? Promise.all(files.map(function (f) {
          var abs = runtime.canonical(runtime.resolvePath(f, ctx.cwd));
          var virt = runtime.procRead(abs);
          return virt != null ? Promise.resolve(virt) : api.readFile(abs).then(null, function () { return null; });
        }))
      : (ctx.stdin ? ctx.stdin.readAll().then(function (t) { return [t]; }) : Promise.resolve(['']));
    return read.then(function (texts) {
      var found = false, outLines = [], code = 0;
      texts.forEach(function (text, k) {
        var name = files[k];
        if (text == null) { err(ctx, 'grep: ' + name + ': No such file or directory\n'); code = 2; return; }
        var lines = String(text).split('\n');
        if (lines[lines.length - 1] === '') lines.pop();
        var hit = lines.map(function (l) { return re.test(l) !== !!flags.v; });
        var last = -1;
        for (var j = 0; j < lines.length; j++) {
          if (!hit[j]) continue;
          found = true;
          var from = Math.max(j - before, last + 1);
          if (last >= 0 && from > last + 1) outLines.push('--');
          var to = Math.min(lines.length - 1, j + after);
          for (var q = from; q <= to; q++) {
            var tag = files.length > 1 ? name + (hit[q] ? ':' : '-') : '';
            var num = flags.n ? (q + 1) + (hit[q] ? ':' : '-') : '';
            outLines.push(tag + num + lines[q]);
            last = q;
          }
        }
        if (files.length > 1 && last >= 0 && k < texts.length - 1) outLines.push('--');
      });
      if (outLines.length && outLines[outLines.length - 1] === '--') outLines.pop();
      out(ctx, outLines.length ? outLines.join('\n') + '\n' : '');
      return code || (found ? 0 : 1);
    });
  }

  function textFallback(name, fileFrom) {
    return wrap(name, function (ctx, orig) { return runTextSafe(name, ctx, orig, fileFrom); });
  }

  /* ---------------- systemctl ---------------- */
  def('systemctl', function (ctx) {
    var a = parse(ctx.args);
    var sub = a.rest[0] || 'status';
    var name = (a.rest[1] || '').replace(/\.service$/, '');
    var svcs = S().services || {};

    if (sub === 'daemon-reload' || sub === 'daemon-reexec') {
      /* unitファイルを実際に読み直す。viで直した内容がここで反映される */
      var units = Object.keys(S().services || {});
      return units.reduce(function (chain, u) {
        return chain.then(function () {
          return Promise.resolve()
            .then(function () { return api.readFile('/etc/systemd/system/' + u + '.service'); })
            .then(function (body) {
              var m = /^\s*LimitNOFILE\s*=\s*(\d+)/m.exec(body);
              S().services[u].limitNofile = m ? Number(m[1]) : null;
              var r = /^\s*Restart\s*=\s*(\S+)/m.exec(body);
              S().services[u].restartPolicy = r ? r[1] : null;
            }, function () {});
        });
      }, Promise.resolve()).then(function () {
        S().daemonReloaded = true;
        runtime.emit('operation', { command: 'systemctl daemon-reload' });
        return 0;
      });
    }

    if (sub === 'cat') {
      var unitName = (a.rest[1] || '').replace(/\.service$/, '');
      var path = '/etc/systemd/system/' + unitName + '.service';
      return Promise.resolve().then(function () { return api.readFile(path); })
        .then(function (body) {
          out(ctx, '# ' + path + '\n' + body);
          return 0;
        }, function () {
          err(ctx, 'No files found for ' + unitName + '.service.\n');
          return 4;
        });
    }

    if (sub === 'list-timers') {
      var timers = S().timers || [];
      out(ctx, pad('NEXT', 29) + pad('LEFT', 12) + pad('LAST', 29) + pad('PASSED', 14) + 'UNIT\n');
      timers.forEach(function (t) {
        out(ctx, pad(t.next, 29) + pad(t.left, 12) + pad(t.last || '-', 29) +
                 pad(t.passed || '-', 14) + t.unit + '\n');
      });
      out(ctx, '\n' + timers.length + ' timers listed.\n');
      return Promise.resolve(0);
    }

    if (sub === 'list-units' || sub === 'list-unit-files') {
      out(ctx, pad('UNIT', 24) + pad('LOAD', 8) + pad('ACTIVE', 10) + pad('SUB', 10) + 'DESCRIPTION\n');
      Object.keys(svcs).forEach(function (k) {
        var s = svcs[k], color = s.status === 'active' ? GRN : s.status === 'failed' ? RED : DIM;
        out(ctx, pad(k + '.service', 24) + pad('loaded', 8) +
          color + pad(s.status, 10) + R + pad(subOf(s), 10) +
          (s.description || '') + '\n');
      });
      return Promise.resolve(0);
    }

    if (!name) { err(ctx, 'systemctl: unit name required\n'); return Promise.resolve(1); }
    var s = svcs[name];
    if (!s) {
      if (sub === 'is-active') { out(ctx, 'inactive\n'); return Promise.resolve(3); }
      out(ctx, '○ ' + name + '.service\n     Loaded: not-found (Reason: Unit ' + name + '.service not found.)\n     Active: inactive (dead)\n');
      return Promise.resolve(4);
    }

    if (sub === 'is-active')  { out(ctx, s.status + '\n');  return Promise.resolve(s.status === 'active' ? 0 : 3); }
    if (sub === 'is-enabled') { out(ctx, (s.enabled === false ? 'disabled' : 'enabled') + '\n'); return Promise.resolve(0); }

    if (sub === 'start' || sub === 'stop' || sub === 'restart' || sub === 'reload') {
      /* 実際に状態を変えるかどうかは runtime が決める
         （CASEが services[x].recovery を宣言している復旧CASEだけ変わる） */
      var r = runtime.serviceAction(sub, name);
      if (r.out) out(ctx, r.out);
      if (r.err) err(ctx, r.err);
      return Promise.resolve(r.code);
    }

    /* status */
    var glyph = s.status === 'active' ? GRN + '●' + R
              : s.status === 'failed' ? RED + '×' + R
              : DIM + '○' + R;
    var lines = [];
    lines.push(glyph + ' ' + name + '.service - ' + (s.description || name));
    lines.push('     Loaded: loaded (/etc/systemd/system/' + name + '.service; ' +
               (s.enabled === false ? 'disabled' : 'enabled') + '; preset: enabled)');
    if (s.status === 'active') {
      lines.push('     Active: ' + GRN + 'active (' + subOf(s) + ')' + R +
                 ' since ' + (s.since || 'Mon 2026-09-14 12:00:00 JST') + '; ' + (s.ago || '2h 3min ago'));
    } else if (s.status === 'failed') {
      lines.push('     Active: ' + RED + 'failed (Result: ' + (s.result || 'exit-code') + ')' + R +
                 ' since ' + (s.since || 'Mon 2026-09-14 14:02:02 JST') + '; ' + (s.ago || '4min ago'));
    } else if (s.status === 'activating') {
      lines.push('     Active: ' + YEL + 'activating (auto-restart)' + R +
                 ' since ' + (s.since || 'Mon 2026-09-14 14:02:02 JST') + '; ' + (s.ago || '2s ago'));
    } else {
      lines.push('     Active: inactive (dead) since ' + (s.since || 'Mon 2026-09-14 14:02:02 JST'));
    }
    if (s.status !== 'active' && s.exitCode != null) {
      lines.push('    Process: ' + (s.lastPid || s.mainPid || 0) + ' ExecStart=' + (s.exec || '') +
                 ' (code=exited, status=' + s.exitCode + '/' + (s.exitCode === 0 ? 'SUCCESS' : 'FAILURE') + ')');
    }
    if (s.mainPid) {
      lines.push('   Main PID: ' + s.mainPid + (s.status === 'active' ? ' (bundle)' : ' (code=exited, status=' + (s.exitCode == null ? 1 : s.exitCode) + '/FAILURE)'));
    }
    if (s.status === 'active') {
      lines.push('      Tasks: ' + (s.tasks || 12) + ' (limit: 9403)');
      lines.push('     Memory: ' + (s.memory || '128.0M'));
      lines.push('     CGroup: /system.slice/' + name + '.service');
      lines.push('             └─' + s.mainPid + ' ' + (s.exec || name));
    }
    lines.push('');
    var jr = (S().journal || {})[name] || [];
    jr.slice(-10).forEach(function (l) { lines.push(l); });
    out(ctx, lines.join('\n') + '\n');
    return Promise.resolve(s.status === 'active' ? 0 : 3);
  });

  /* ---------------- journalctl ---------------- */
  def('journalctl', function (ctx) {
    var a = parse(ctx.args);
    var unit = optVal(ctx.args, '-u', '--unit');
    var n = optVal(ctx.args, '-n', '--lines');
    var follow = a.flags.f || a.longs.follow;
    var journal = S().journal || {};

    var lines;
    if (unit) {
      unit = unit.replace(/\.service$/, '');
      if (!journal[unit]) {
        out(ctx, '-- No entries --\n');
        return Promise.resolve(0);
      }
      lines = journal[unit].slice();
    } else {
      lines = [];
      Object.keys(journal).forEach(function (k) { lines = lines.concat(journal[k]); });
      lines.sort();
    }
    if (a.flags.r || a.longs.reverse) lines = lines.slice().reverse();
    var count = n ? parseInt(n, 10) : (a.flags.e ? 20 : 0);
    if (count > 0) lines = lines.slice(-count);

    out(ctx, '-- Logs begin at Mon 2026-09-07 10:02:01 JST, end at ' + runtime.sinceText() + '. --\n');
    out(ctx, lines.join('\n') + (lines.length ? '\n' : ''));
    if (follow) return runtime.follow(ctx, [], 'journalctl');
    return Promise.resolve(0);
  });

  /* ---------------- ss ---------------- */
  def('ss', function (ctx) {
    var a = parse(ctx.args);
    /* 本物の ss と同じく、-l は待ち受け（LISTEN）だけ、-a はすべて、どちらも無ければ接続中のソケットだけ。
       DB へのコネクションは CASE の db.connections(S()) が返す（プロセスの入れ替えで変わるため） */
    var db = S().db;
    var ports = (S().ports || []).concat(db && db.connections ? db.connections(S()) : []);
    var rows = ports.filter(function (p) { return a.flags.a || (a.flags.l ? p.state === 'LISTEN' : p.state !== 'LISTEN'); });
    out(ctx, pad('State', 8) + pad('Recv-Q', 8) + pad('Send-Q', 8) +
             pad('Local Address:Port', 26) + pad('Peer Address:Port', 22) +
             (a.flags.p ? 'Process' : '') + '\n');
    rows.forEach(function (p) {
      out(ctx, pad(p.state, 8) + pad(p.recvq || 0, 8) + pad(p.sendq || 0, 8) +
               pad(p.local, 26) + pad(p.peer || '0.0.0.0:*', 22) +
               (a.flags.p ? 'users:(("' + p.process + '",pid=' + p.pid + ',fd=' + (p.fd || 6) + '))' : '') + '\n');
    });
    return Promise.resolve(0);
  });

  /* ---------------- curl ---------------- */
  /* Lifo純正のcurlは本物のfetchを行う。教材では実ネットワークへ出さないので必ず上書きする */
  def('curl', function (ctx) {
    var a = parse(ctx.args);
    var headOnly = a.flags.I || a.longs.head;
    var silent = a.flags.s || a.longs.silent;
    var verbose = a.flags.v || a.longs.verbose;
    var showErr = a.flags.S;
    var url = null;
    for (var i = 0; i < a.rest.length; i++) { if (/^https?:\/\//.test(a.rest[i]) || /^localhost/.test(a.rest[i])) url = a.rest[i]; }
    if (!url) { err(ctx, 'curl: try \'curl --help\' for more information\n'); return Promise.resolve(2); }
    if (!/^https?:\/\//.test(url)) url = 'http://' + url;

    var table = S().http || {};
    var res = table[url] || table[url.replace(/\/$/, '')] || table[url + '/'];

    /* メンテナンスファイルが置かれている間は、nginxが503を返す（設定ファイル参照） */
    var mt = S().maintenance;
    /* 運用側だけが確認できるようにするヘッダ（nginxのallowlist相当） */
    var bypass = mt && mt.bypass && ctx.args.join(' ').indexOf(mt.bypass) >= 0;
    var pre = mt && mt.file && !bypass
      ? api.exists(mt.file).then(function (on) { return on ? (mt.response || {
          status: 503, reason: 'Service Unavailable',
          headers: { 'content-type': 'text/html', 'retry-after': '600', server: 'nginx/1.24.0' },
          body: '<html><body><h1>ただいまメンテナンス中です</h1></body></html>\n'
        }) : null; })
      : Promise.resolve(null);

    return pre.then(function (maint) {
      if (maint) res = maint;
      return emit();
    });

    function emit() {
    if (!res) {
      /* 定義のないURL = 教材の世界の外。到達不能として扱う */
      if (!silent || showErr) err(ctx, 'curl: (7) Failed to connect to ' + url.replace(/^https?:\/\//, '').split('/')[0] + ': Connection refused\n');
      return Promise.resolve(7);
    }
    if (verbose) {
      err(ctx, '*   Trying 127.0.0.1:80...\n* Connected to ' + url.replace(/^https?:\/\//, '').split('/')[0] + '\n');
      err(ctx, '> GET ' + (url.replace(/^https?:\/\/[^/]*/, '') || '/') + ' HTTP/1.1\n>\n');
    }
    var status = res.status + ' ' + (res.reason || '');
    var color = res.status >= 500 ? RED : res.status >= 400 ? YEL : GRN;
    if (headOnly || verbose) {
      var h = 'HTTP/1.1 ' + color + status + R + '\n';
      Object.keys(res.headers || {}).forEach(function (k) { h += k + ': ' + res.headers[k] + '\n'; });
      h += '\n';
      if (headOnly) { out(ctx, h); return Promise.resolve(0); }
      err(ctx, h);
    }
    out(ctx, res.body || '');
    return Promise.resolve(0);
    }
  });

  /* ---------------- ps / pgrep ---------------- */
  function psRows(ctx) {
    var a = parse(ctx.args), procs = (S().processes || []).slice();
    var mine = !a.flags.a && !a.flags.e && !a.flags.A && ctx.args.length === 0;
    if (mine) procs = procs.filter(function (p) { return p.user === (S().user || 'deploy'); });
    return { a: a, procs: procs };
  }
  def('ps', function (ctx) {
    var r = psRows(ctx), a = r.a;
    if (a.flags.e && a.flags.f) {
      out(ctx, pad('UID', 10) + lpad('PID', 5) + lpad('PPID', 6) + '  C STIME TTY          TIME CMD\n');
      r.procs.forEach(function (p) {
        out(ctx, pad(p.user, 10) + lpad(p.pid, 5) + lpad(p.ppid || 1, 6) + '  0 ' +
                 pad(p.start || 'Sep14', 5) + ' ?        ' + pad(p.time || '00:00:00', 8) + ' ' + p.command + '\n');
      });
      return Promise.resolve(0);
    }
    out(ctx, pad('USER', 10) + lpad('PID', 5) + lpad('%CPU', 6) + lpad('%MEM', 6) +
             lpad('VSZ', 9) + lpad('RSS', 8) + ' TTY      STAT ' + pad('START', 6) + lpad('TIME', 6) + ' COMMAND\n');
    r.procs.forEach(function (p) {
      out(ctx, pad(p.user, 10) + lpad(p.pid, 5) + lpad((p.cpu || 0).toFixed(1), 6) + lpad((p.mem || 0).toFixed(1), 6) +
               lpad(p.vsz || 0, 9) + lpad(p.rss || 0, 8) + ' ?        ' + pad(p.stat || 'S', 5) +
               pad(p.start || 'Sep14', 6) + lpad(p.time || '0:00', 6) + ' ' + p.command + '\n');
    });
    return Promise.resolve(0);
  });

  def('pgrep', function (ctx) {
    var a = parse(ctx.args);
    var pattern = a.rest[0];
    if (!pattern) { err(ctx, 'pgrep: no matching criteria specified\n'); return Promise.resolve(2); }
    var re;
    try { re = new RegExp(pattern); } catch (e) { err(ctx, 'pgrep: invalid pattern\n'); return Promise.resolve(2); }
    var hit = (S().processes || []).filter(function (p) { return re.test(p.command); });
    hit.forEach(function (p) { out(ctx, p.pid + (a.flags.a ? ' ' + p.command : '') + (a.flags.l && !a.flags.a ? ' ' + p.command.split(' ')[0] : '') + '\n'); });
    return Promise.resolve(hit.length ? 0 : 1);
  });

  def('pkill', function (ctx) {
    runtime.emit('operation', { command: 'pkill', args: ctx.args });
    err(ctx, 'pkill: killing processes requires care. ' +
             'Check `systemctl status` first.\n');
    return Promise.resolve(1);
  });

  def('kill', function (ctx) {
    var a = parse(ctx.args);
    var pid = parseInt(a.rest[a.rest.length - 1], 10);
    var p = (S().processes || []).filter(function (x) { return x.pid === pid; })[0];
    runtime.emit('operation', { command: 'kill', args: ctx.args, pid: pid });
    if (!p) { err(ctx, 'kill: (' + (a.rest[0] || '') + '): No such process\n'); return Promise.resolve(1); }
    /* 教材上は実際には落とさない。落とすとCASEの証拠が消えて学習にならない */
    err(ctx, DIM + '[学習環境] シグナルは記録しましたが、調査を続けられるようprocessは終了していません。' + R + '\n');
    return Promise.resolve(0);
  });

  /* ---------------- free / uptime / top ---------------- */
  def('free', function (ctx) {
    var a = parse(ctx.args);
    var m = S().system.mem, sw = S().system.swap;
    var unit = a.flags.h ? null : a.flags.g ? 1024 : 1;   /* 既定はMi */
    function v(mb) { return a.flags.h ? (mb >= 1024 ? (mb / 1024).toFixed(1) + 'Gi' : mb + 'Mi') : Math.round(mb / unit); }
    out(ctx, pad('', 15) + lpad('total', 11) + lpad('used', 11) + lpad('free', 11) +
             lpad('shared', 11) + lpad('buff/cache', 12) + lpad('available', 11) + '\n');
    out(ctx, pad('Mem:', 15) + lpad(v(m.total), 11) + lpad(v(m.used), 11) + lpad(v(m.free), 11) +
             lpad(v(m.shared || 0), 11) + lpad(v(m.buffCache || 0), 12) + lpad(v(m.available), 11) + '\n');
    out(ctx, pad('Swap:', 15) + lpad(v(sw.total), 11) + lpad(v(sw.used), 11) + lpad(v(sw.free), 11) + '\n');
    return Promise.resolve(0);
  });

  def('uptime', function (ctx) {
    var u = S().system.uptime;
    var now = S().now || '14:05:12';
    out(ctx, ' ' + now + ' up ' + u.since + ',  ' + u.users + ' user,  load average: ' +
             u.load.map(function (x) { return x.toFixed(2); }).join(', ') + '\n');
    return Promise.resolve(0);
  });

  def('top', function (ctx) {
    var st = S().system, u = st.uptime, m = st.mem, sw = st.swap;
    var procs = (S().processes || []).slice().sort(function (x, y) { return (y.cpu || 0) - (x.cpu || 0); });
    var running = procs.filter(function (p) { return (p.stat || '').charAt(0) === 'R'; }).length;
    out(ctx, 'top - ' + (S().now || '14:05:12') + ' up ' + u.since + ',  ' + u.users +
             ' user,  load average: ' + u.load.map(function (x) { return x.toFixed(2); }).join(', ') + '\n');
    out(ctx, 'Tasks: ' + lpad(procs.length, 4) + ' total,' + lpad(running || 1, 4) + ' running,' +
             lpad(procs.length - (running || 1), 4) + ' sleeping,    0 stopped,    0 zombie\n');
    out(ctx, '%Cpu(s): ' + st.cpu.us.toFixed(1) + ' us, ' + st.cpu.sy.toFixed(1) + ' sy,  0.0 ni, ' +
             st.cpu.id.toFixed(1) + ' id, ' + st.cpu.wa.toFixed(1) + ' wa,  0.0 hi,  0.0 si,  0.0 st\n');
    out(ctx, 'MiB Mem : ' + lpad(m.total.toFixed(1), 9) + ' total, ' + lpad(m.free.toFixed(1), 9) +
             ' free, ' + lpad(m.used.toFixed(1), 9) + ' used, ' + lpad((m.buffCache || 0).toFixed(1), 9) + ' buff/cache\n');
    out(ctx, 'MiB Swap: ' + lpad(sw.total.toFixed(1), 9) + ' total, ' + lpad(sw.free.toFixed(1), 9) +
             ' free, ' + lpad(sw.used.toFixed(1), 9) + ' used.\n\n');
    out(ctx, lpad('PID', 7) + ' ' + pad('USER', 9) + lpad('VIRT', 8) + lpad('RES', 8) + ' S ' +
             lpad('%CPU', 6) + lpad('%MEM', 6) + lpad('TIME+', 10) + ' COMMAND\n');
    procs.slice(0, 15).forEach(function (p) {
      var hot = (p.cpu || 0) >= 50;
      out(ctx, (hot ? YEL : '') + lpad(p.pid, 7) + ' ' + pad(p.user, 9) + lpad(p.vsz || 0, 8) + lpad(p.rss || 0, 8) +
               ' ' + (p.stat || 'S').charAt(0) + ' ' + lpad((p.cpu || 0).toFixed(1), 6) + lpad((p.mem || 0).toFixed(1), 6) +
               lpad(p.time || '0:00', 10) + ' ' + p.command.split(' ')[0] + (hot ? R : '') + '\n');
    });
    out(ctx, '\n' + DIM + '[学習環境] topは対話画面を持ちません。1回分のスナップショットを表示しています。' + R + '\n');
    return Promise.resolve(0);
  });

  /* ---------------- env ----------------
     LifoのenvはPWDを更新しないので、現在地だけ直して渡す */
  wrap('env', function (ctx, orig) {
    ctx.env.PWD = ctx.cwd;
    return orig(ctx);
  });

  /* ---------------- awk ----------------
     Lifoのawkは「列の取り出し」まで。条件式やEND blockは解釈しない。
     黙って空を返すと学習者が混乱するので、その場で断りを出す。 */
  wrap('awk', function (ctx, orig) {
    var prog = ctx.args.filter(function (a) { return a.charAt(0) !== '-'; })[0] || '';
    var advanced = /(^|\s)(BEGIN|END)\s*\{/.test(prog) ||
                   /\$\w+\s*(==|!=|>|<|>=|<=|~)/.test(prog) ||
                   /[+\-*/]=/.test(prog);
    var buf = '';
    var sub = Object.create(ctx);
    sub.stdout = { write: function (t) { buf += t; } };
    return Promise.resolve(orig(sub)).then(function (code) {
      ctx.stdout.write(buf);
      if (advanced && !buf.trim()) {
        ctx.stderr.write(DIM + '[学習環境] このawkは列の取り出し（{print $1} や -F など）までです。\n' +
          '条件式やEND blockは実機のawkでは使えますが、ここでは解釈しません。\n' +
          'grep で絞ってから awk に渡すか、sort -k で並べ替えてください。' + R + '\n');
      }
      return code;
    });
  });

  /* ---------------- tr ----------------
     Lifoのtrはエスケープを解釈しない。\0 や \n を実際の文字へ展開してから渡す。
     /proc/<PID>/environ を読むのに要る。 */
  wrap('tr', function (ctx, orig) {
    function unescape(x) {
      return x.replace(/\\0/g, '\u0000').replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t').replace(/\\r/g, '\r');
    }
    var args = ctx.args.map(function (x) {
      return x.charAt(0) === '-' ? x : unescape(x);
    });
    var sub = Object.create(ctx);
    sub.args = args;
    return orig(sub);
  });

  /* ---------------- zgrep / zcat ----------------
     ローテート済みの .gz を読む。先週の同じ時間帯を見るのに必ず要る。
     ponytail: 本物のgzipではなく、logrotateが書いた中身をそのまま読む。 */
  function gzRead(ctx, path) {
    return api.readFile(runtime.canonical(runtime.resolvePath(path, ctx.cwd)));
  }
  def('zcat', function (ctx) {
    var files = operands(ctx.args, {}).map(function (o) { return o.v; });
    if (!files.length) { err(ctx, 'zcat: ファイルを指定してください\n'); return Promise.resolve(1); }
    return files.reduce(function (chain, f) {
      return chain.then(function () {
        return gzRead(ctx, f).then(function (body) { out(ctx, body); },
          function () { err(ctx, 'zcat: ' + f + ': No such file or directory\n'); });
      });
    }, Promise.resolve()).then(function () { return 0; });
  });
  def('zless', function (ctx) { return api.vendorCommand('less') ? runFullScreen('less', ctx) : Promise.resolve(1); });

  def('zgrep', function (ctx) {
    var a = parse(ctx.args);
    var ops = operands(ctx.args, VALUE_FLAGS.grep);
    if (ops.length < 2) { err(ctx, 'usage: zgrep <pattern> <file.gz>...\n'); return Promise.resolve(1); }
    var pattern = ops[0].v.replace(/^["']|["']$/g, '');
    var files = ops.slice(1).map(function (o) { return o.v; });
    var re;
    try { re = new RegExp(pattern, a.flags.i ? 'i' : ''); }
    catch (e) { err(ctx, 'zgrep: invalid pattern\n'); return Promise.resolve(2); }
    var found = 0;
    return files.reduce(function (chain, f) {
      return chain.then(function () {
        return gzRead(ctx, f).then(function (body) {
          var hits = body.split('\n').filter(function (l) { return l && re.test(l); });
          found += hits.length;
          if (a.flags.c) { out(ctx, (files.length > 1 ? f + ':' : '') + hits.length + '\n'); return; }
          hits.forEach(function (l) { out(ctx, (files.length > 1 ? f + ':' : '') + l + '\n'); });
        }, function () { err(ctx, 'zgrep: ' + f + ': No such file or directory\n'); });
      });
    }, Promise.resolve()).then(function () { return found ? 0 : 1; });
  });

  /* ---------------- ulimit ---------------- */
  def('ulimit', function (ctx) {
    var a = parse(ctx.args);
    var lim = S().limits || { nofile: 1024, nproc: 30827, core: 0 };
    if (a.flags.n) { out(ctx, String(lim.nofile) + '\n'); return Promise.resolve(0); }
    if (a.flags.u) { out(ctx, String(lim.nproc) + '\n'); return Promise.resolve(0); }
    if (a.flags.a || !ctx.args.length) {
      out(ctx, 'core file size          (blocks, -c) ' + (lim.core || 0) + '\n' +
               'open files                      (-n) ' + lim.nofile + '\n' +
               'max user processes              (-u) ' + lim.nproc + '\n' +
               'virtual memory          (kbytes, -v) unlimited\n');
      return Promise.resolve(0);
    }
    err(ctx, 'ulimit: -n / -u / -a に対応しています\n');
    return Promise.resolve(1);
  });

  def('nproc', function (ctx) {
    out(ctx, String((S().system && S().system.cpu && S().system.cpu.cores) || 4) + '\n');
    return Promise.resolve(0);
  });

  /* ---------------- dig ----------------
     Lifo純正のdigは実ネットワークへ出るので、CASEの宣言で置き換える。 */
  def('dig', function (ctx) {
    var a = parse(ctx.args);
    /* +short や A / AAAA のような指定はホスト名ではない */
    var host = a.rest.filter(function (x) {
      return x.charAt(0) !== '+' && !/^[A-Z]+$/.test(x);
    })[0];
    if (!host) { err(ctx, 'usage: dig [+short] <hostname>\n'); return Promise.resolve(1); }
    var table = S().dns || {};
    var lookup = function (h) { return Object.prototype.hasOwnProperty.call(table, h) ? table[h] : undefined; };
    var ip = lookup(host);
    var short = ctx.args.indexOf('+short') >= 0;
    /* { cname: '別名の先' } なら、たどった先の A レコードと一緒に返す（Aurora のエンドポイントなど。TTL は5秒） */
    if (ip && typeof ip === 'object') {
      var chain = [], name = host, v = ip;
      while (v && typeof v === 'object' && chain.length < 5) { chain.push([name, 'CNAME', v.cname + '.']); name = v.cname; v = lookup(name); }
      if (typeof v !== 'string') return Promise.resolve(9);
      chain.push([name, 'A', v]);
      if (short) { out(ctx, chain.map(function (r) { return r[2]; }).join('\n') + '\n'); return Promise.resolve(0); }
      out(ctx, '; <<>> DiG 9.18.28 <<>> ' + host + '\n' +
               ';; global options: +cmd\n' +
               ';; Got answer:\n' +
               ';; ->>HEADER<<- opcode: QUERY, status: ' + GRN + 'NOERROR' + R + ', id: 52118\n\n' +
               ';; QUESTION SECTION:\n;' + host + '.\t\tIN\tA\n\n' +
               ';; ANSWER SECTION:\n' + chain.map(function (r) { return r[0] + '.\t5\tIN\t' + r[1] + '\t' + r[2]; }).join('\n') + '\n\n' +
               ';; Query time: 2 msec\n;; SERVER: 10.0.0.2#53\n');
      return Promise.resolve(0);
    }

    if (ip === undefined || ip === null) {
      if (short) return Promise.resolve(ip === undefined ? 9 : 9);
      out(ctx, '; <<>> DiG 9.18.28 <<>> ' + host + '\n' +
               ';; global options: +cmd\n' +
               ';; Got answer:\n' +
               ';; ->>HEADER<<- opcode: QUERY, status: ' + YEL + 'NXDOMAIN' + R + ', id: 41022\n\n' +
               ';; QUESTION SECTION:\n;' + host + '.\t\tIN\tA\n\n' +
               ';; AUTHORITY SECTION:\nexample.jp.\t300\tIN\tSOA\tns.example.jp. root.example.jp. 2026092401 7200 900 1209600 300\n\n' +
               ';; Query time: 12 msec\n;; SERVER: 10.0.0.2#53\n');
      return Promise.resolve(9);
    }
    if (short) { out(ctx, ip + '\n'); return Promise.resolve(0); }
    out(ctx, '; <<>> DiG 9.18.28 <<>> ' + host + '\n' +
             ';; global options: +cmd\n' +
             ';; Got answer:\n' +
             ';; ->>HEADER<<- opcode: QUERY, status: ' + GRN + 'NOERROR' + R + ', id: 52118\n\n' +
             ';; QUESTION SECTION:\n;' + host + '.\t\tIN\tA\n\n' +
             ';; ANSWER SECTION:\n' + host + '.\t60\tIN\tA\t' + ip + '\n\n' +
             ';; Query time: 8 msec\n;; SERVER: 10.0.0.2#53\n');
    return Promise.resolve(0);
  });

  /* ---------------- openssl ----------------
     証明書の期限切れは毎年必ず来る。s_client で確認する型だけ扱う。 */
  def('openssl', function (ctx) {
    var a = parse(ctx.args);
    if (a.rest[0] !== 's_client') {
      err(ctx, DIM + '[学習環境] openssl s_client -connect <host>:<port> のみ扱います。' + R + '\n');
      return Promise.resolve(1);
    }
    var target = optVal(ctx.args, null, '-connect');
    var tls = (S().tls || {})[target];
    if (!tls) {
      err(ctx, 'connect: Connection refused\nconnect:errno=111\n');
      return Promise.resolve(1);
    }
    out(ctx, 'CONNECTED(00000003)\n' +
             'depth=2 C = US, O = ' + (tls.issuer || 'Example CA') + '\n' +
             '---\n' +
             'Certificate chain\n' +
             ' 0 s:CN = ' + (tls.cn || target.split(':')[0]) + '\n' +
             '   i:C = US, O = ' + (tls.issuer || 'Example CA') + '\n' +
             '---\n' +
             'SSL handshake has read 4021 bytes and written 393 bytes\n' +
             'Verification' + (tls.expired ? RED + ' error: certificate has expired' + R : ': OK') + '\n' +
             '---\n' +
             '    Start Time: 1789380000\n' +
             '    notBefore=' + (tls.notBefore || 'Jun  1 00:00:00 2026 GMT') + '\n' +
             (tls.expired ? YEL : '') + '    notAfter=' + (tls.notAfter || 'Dec  1 00:00:00 2026 GMT') +
             (tls.expired ? '   ← 期限切れ' + R : '') + '\n');
    return Promise.resolve(tls.expired ? 1 : 0);
  });

  /* ---------------- tmux / nohup ----------------
     SSHが切れても処理を生かす形。教材ではセッションの存在と再接続だけ扱う。 */
  def('tmux', function (ctx) {
    var a = parse(ctx.args);
    var st = S();
    st.tmux = st.tmux || [];
    var sub = a.rest[0] || '';

    if (sub === 'ls' || sub === 'list-sessions') {
      if (!st.tmux.length) { err(ctx, 'no server running on /tmp/tmux-1001/default\n'); return Promise.resolve(1); }
      st.tmux.forEach(function (t) {
        out(ctx, t.name + ': 1 windows (created ' + t.created + ')' +
                 (t.attached ? ' (attached)' : '') + '\n');
      });
      return Promise.resolve(0);
    }

    if (sub === 'new' || sub === 'new-session') {
      var name = optVal(ctx.args, '-s', null) || ('session-' + (st.tmux.length));
      var cmd = a.rest.slice(1).filter(function (x) { return x !== name; }).join(' ');
      st.tmux.push({ name: name, created: (S().date || 'Sep 14') + ' ' + (S().now || '00:00:00'),
                     attached: false, log: cmd ? ['$ ' + cmd, '（実行中…）'] : [] });
      runtime.emit('operation', { command: 'tmux new', name: name });
      out(ctx, DIM + '[学習環境] セッション「' + name + '」を作りました。' +
               'このセッションはSSHが切れても残ります（tmux ls で確認 / tmux attach -t ' + name + ' で戻る）。' + R + '\n');
      return Promise.resolve(0);
    }

    if (sub === 'attach' || sub === 'attach-session' || sub === 'a') {
      var t = optVal(ctx.args, '-t', null);
      var hit = st.tmux.filter(function (x) { return !t || x.name === t; })[0];
      if (!hit) { err(ctx, 'can\'t find session' + (t ? ': ' + t : '') + '\n'); return Promise.resolve(1); }
      out(ctx, (hit.log || []).join('\n') + '\n' +
               DIM + '[学習環境] セッション「' + hit.name + '」の内容です。' +
               '実機では Ctrl+b → d で離れられます。' + R + '\n');
      return Promise.resolve(0);
    }

    if (sub === 'kill-session') {
      var kt = optVal(ctx.args, '-t', null);
      st.tmux = st.tmux.filter(function (x) { return x.name !== kt; });
      return Promise.resolve(0);
    }

    err(ctx, 'usage: tmux [ls | new -s <name> | attach -t <name> | kill-session -t <name>]\n');
    return Promise.resolve(1);
  });

  def('nohup', function (ctx) {
    var rest = ctx.args.join(' ');
    if (!rest) { err(ctx, 'usage: nohup <command> &\n'); return Promise.resolve(1); }
    runtime.emit('operation', { command: 'nohup', target: rest });
    err(ctx, "nohup: ignoring input and appending output to 'nohup.out'\n");
    out(ctx, DIM + '[学習環境] 実際には実行しません。' +
             'nohup はHUPシグナルを無視させるので、SSHが切れても処理が続きます。' +
             '出力は必ずファイルへ落としてください（> log 2>&1 &）。' + R + '\n');
    return Promise.resolve(0);
  });

  /* ---------------- rm ----------------
     掴まれているファイルを消しても容量は戻らない、を再現する。 */
  wrap('rm', function (ctx, orig) {
    var targets = operands(ctx.args, {}).map(function (o) {
      return runtime.canonical(runtime.resolvePath(o.v, ctx.cwd));
    });
    return Promise.resolve(orig(ctx)).then(function (code) {
      if (code !== 0) return code;
      targets.forEach(function (abs) {
        /* 誰かが開いたままなら「名前だけ消える」。空くのはその相手が終わったとき */
        if (runtime.markDeleted(abs)) return;
        runtime.freeDisk(abs, 0);
      });
      return code;
    });
  });

  /* ---------------- lsof ----------------
     「誰がそのファイル／ポートを掴んでいるか」を答える道具。
     CASEは openFiles で宣言し、ポートは ports から自動で作る。 */
  def('lsof', function (ctx) {
    var a = parse(ctx.args);
    var st = S();
    var rows = (st.openFiles || []).slice();

    /* listenしているポートは ports から自動生成（-i で使う） */
    (st.ports || []).forEach(function (p) {
      rows.push({
        command: (p.process || '').slice(0, 15), pid: p.pid, user: procUser(st, p.pid),
        fd: '6u', type: 'IPv4', size: '0t0', node: 'TCP',
        name: p.local + ' (LISTEN)', net: true, port: portOf(p.local)
      });
    });

    var want = { net: false, deleted: false, pid: null, path: null, port: null };
    if (a.flags.i) {
      want.net = true;
      var iv = optVal(ctx.args, '-i', null);
      if (iv && /^:?\d+$/.test(iv)) want.port = Number(iv.replace(':', ''));
    }
    if (a.raw.indexOf('+L1') >= 0) want.deleted = true;
    var pv = optVal(ctx.args, '-p', null);
    if (pv) want.pid = Number(pv);
    a.rest.forEach(function (t) {
      if (/^\+L1$/.test(t) || /^:?\d+$/.test(t)) return;
      want.path = runtime.canonical(runtime.resolvePath(t, ctx.cwd));
    });

    var hit = rows.filter(function (r) {
      if (want.net && !r.net) return false;
      if (want.port != null && r.port !== want.port) return false;
      if (want.deleted && !r.deleted) return false;
      if (want.pid != null && r.pid !== want.pid) return false;
      if (want.path && runtime.canonical(r.name.split(' ')[0]) !== want.path) return false;
      return true;
    });

    if (!want.net && !want.deleted && want.pid == null && !want.path) {
      err(ctx, DIM + '[学習環境] lsof は出力が膨大になるため、絞り込んで使ってください。\n' +
               '  lsof -i          listenしているポートと、掴んでいるプロセス\n' +
               '  lsof -i :3000    ポート番号で絞る\n' +
               '  lsof +L1         削除済みなのに開かれたままのファイル\n' +
               '  lsof -p <PID>    そのプロセスが開いているもの\n' +
               '  lsof <ファイル>  そのファイルを掴んでいるプロセス' + R + '\n');
      return Promise.resolve(1);
    }
    if (!hit.length) return Promise.resolve(1);

    out(ctx, pad('COMMAND', 12) + lpad('PID', 7) + '  ' + pad('USER', 9) +
             pad('FD', 6) + pad('TYPE', 7) + lpad('SIZE/OFF', 12) + '  NAME\n');
    hit.forEach(function (r) {
      var mark = r.deleted ? YEL : '';
      out(ctx, mark + pad(r.command, 12) + lpad(r.pid, 7) + '  ' + pad(r.user || 'deploy', 9) +
               pad(r.fd, 6) + pad(r.type, 7) + lpad(r.size || '0t0', 12) + '  ' + r.name +
               (r.deleted ? ' (deleted)' : '') + (mark ? R : '') + '\n');
    });
    return Promise.resolve(0);
  });

  function procUser(st, pid) {
    var p = (st.processes || []).filter(function (x) { return x.pid === pid; })[0];
    return p ? p.user : 'root';
  }
  function portOf(local) {
    var m = /:(\d+)$/.exec(local || '');
    return m ? Number(m[1]) : null;
  }

  /* ---------------- cp ----------------
     Lifoのcpは -p / -a を知らない。VFSは所有者もタイムスタンプも持たないので、
     意味のないオプションとして落としてから本来の実装へ渡す。
     （設定を直す前の cp -p file file.bak は本番で必ず打つ形なので、通るようにする） */
  wrap('cp', function (ctx, orig) {
    var args = [], changed = false;
    ctx.args.forEach(function (a) {
      if (a === '-p' || a === '--preserve' || a === '-v') { changed = true; return; }
      if (a === '-a' || a === '--archive') { args.push('-r'); changed = true; return; }
      if (/^-[a-zA-Z]{2,}$/.test(a)) {
        var keep = a.slice(1).split('').filter(function (f) { return 'pv'.indexOf(f) < 0; });
        changed = true;
        if (keep.length) args.push('-' + keep.map(function (f) { return f === 'a' ? 'r' : f; }).join(''));
        return;
      }
      args.push(a);
    });
    if (!changed) return orig(ctx);
    var sub = Object.create(ctx);
    sub.args = args;
    return orig(sub);
  });

  /* ---------------- vi / vim ----------------
     Lifoのパッケージ（lifo-pkg-vi）をそのまま使う。エディタは自作しない。
     こちらでやるのは「キーを1つずつ渡す」「画面サイズを教える」だけ。 */
  /* viもlessも「キーを1つずつ渡して、画面サイズを教える」だけで動く。
     その共通部分をここにまとめる。 */
  function runFullScreen(name, ctx) {
    var cmd = api.vendorCommand(name);
    if (!cmd) { err(ctx, name + ': このビルドには同梱されていません\n'); return Promise.resolve(127); }

    var vp = runtime.viewport();
    var env = {};
    Object.keys(ctx.env).forEach(function (k) { env[k] = ctx.env[k]; });
    env.LINES = String(vp.rows);
    env.COLUMNS = String(vp.cols);

    var sub = Object.create(ctx);
    sub.env = env;
    sub.stdin = runtime.openInput();
    sub.setRawMode = function (on) { if (!on) runtime.closeInput(); };

    function done(code) {
      runtime.closeInput();
      runtime.emit('operation', { command: name, path: ctx.args[0] });
      return code;
    }
    return Promise.resolve(cmd(sub)).then(done, function (e) {
      runtime.closeInput();
      err(ctx, name + ': ' + (e && e.message || e) + '\n');
      return 1;
    });
  }

  function runEditor(ctx) {
    if (!ctx.args.length) { err(ctx, 'Usage: vi <filename>\n'); return Promise.resolve(1); }
    return runFullScreen('vi', ctx);
  }
  def('vi', runEditor);
  def('vim', runEditor);
  def('view', runEditor);

  /* ---------------- rails ----------------
     本番で最もよく使い、最も危険なコマンド。 */
  def('rails', function (ctx) { return railsCmd(ctx); });
  def('bin/rails', function (ctx) { return railsCmd(ctx); });
  def('rake', function (ctx) { return railsCmd(ctx); });

  function railsCmd(ctx) {
    var a = parse(ctx.args);
    var sub = a.rest[0] || '';
    var cfg = S().rails || {};

    /* rails console / rails c */
    if (sub === 'console' || sub === 'c') {
      var sandbox = a.flags.s || a.longs.sandbox;
      var spec = cfg.console;
      if (!spec) { err(ctx, 'rails: このCASEではconsoleを用意していません\n'); return Promise.resolve(1); }
      out(ctx, 'Loading production environment (Rails ' + (cfg.version || '7.2.1') + ')\n');
      if (sandbox) {
        out(ctx, YEL + 'Loading production environment in sandbox (Rails ' + (cfg.version || '7.2.1') + ')\n' +
                 'Any modifications you make will be rolled back on exit' + R + '\n');
      } else {
        out(ctx, DIM + '（--sandbox なしで開いています。ここでの変更はそのまま本番に反映されます）' + R + '\n');
      }
      runtime.enterRepl({
        name: 'irb(main)', sandbox: !!sandbox,
        table: spec.table || [], fallback: spec.fallback
      });
      return Promise.resolve(0);
    }

    /* rails runner 'expr' */
    if (sub === 'runner' || sub === 'r') {
      var expr = a.rest.slice(1).join(' ').replace(/^["']|["']$/g, '');
      var spec2 = cfg.console || {};
      var hit = null;
      (spec2.table || []).forEach(function (e) {
        if (hit) return;
        var re = e.re instanceof RegExp ? e.re : new RegExp(e.re);
        if (re.test(expr)) hit = e;
      });
      if (!hit) { err(ctx, DIM + '[学習環境] この式は評価できません。' + R + '\n'); return Promise.resolve(1); }
      if (hit.blocked) { err(ctx, hit.out + '\n'); return Promise.resolve(1); }
      if (hit.apply) hit.apply(S());
      /* runner は puts したものだけが出る。式の値は表示されない */
      out(ctx, (/\bputs\b|\bprint\b|\bp\b/.test(expr)
        ? (typeof hit.out === 'function' ? hit.out(S()) : hit.out)
        : '') + '\n');
      return Promise.resolve(0);
    }

    /* db系 */
    if (/^db:/.test(sub)) return railsDb(ctx, sub, a);

    if (sub === 'about') {
      out(ctx, 'About your application\'s environment\n' +
               'Rails version             ' + (cfg.version || '7.2.1') + '\n' +
               'Ruby version              ruby 3.3.4\n' +
               'RAILS_ENV                 production\n' +
               'Database adapter          mysql2\n');
      return Promise.resolve(0);
    }

    err(ctx, 'Usage: rails [console|runner|db:migrate|db:rollback|db:migrate:status|about]\n');
    return Promise.resolve(1);
  }

  function railsDb(ctx, sub, a) {
    var cfg = S().rails || {};
    var migs = cfg.migrations;
    if (!migs) { err(ctx, 'rails: このCASEではmigrationを用意していません\n'); return Promise.resolve(1); }

    if (sub === 'db:migrate:status') {
      out(ctx, 'database: myapp_production\n\n' +
               ' Status   Migration ID    Migration Name\n' +
               '--------------------------------------------------\n');
      migs.forEach(function (m) {
        out(ctx, (m.up ? '   up  ' : '  down ') + '   ' + pad(m.version, 16) + m.name + '\n');
      });
      return Promise.resolve(0);
    }

    if (sub === 'db:migrate') {
      var pending = migs.filter(function (m) { return !m.up; });
      if (!pending.length) { out(ctx, DIM + '（適用すべきmigrationはありません）' + R + '\n'); return Promise.resolve(0); }
      var code = 0;
      pending.forEach(function (m) {
        if (code) return;
        out(ctx, '== ' + m.version + ' ' + m.name + ': migrating ' + '='.repeat(Math.max(0, 40 - m.name.length)) + '\n');
        if (m.blocked) {
          err(ctx, m.blocked + '\n');
          code = 1;
          return;
        }
        if (m.seconds) out(ctx, '   -> ' + m.seconds + 's\n');
        out(ctx, '== ' + m.version + ' ' + m.name + ': migrated (' + (m.seconds || '0.0421') + 's)\n\n');
        m.up = true;
        if (m.apply) m.apply(S());
      });
      runtime.emit('operation', { command: 'db:migrate', ok: code === 0 });
      return Promise.resolve(code);
    }

    if (sub === 'db:rollback') {
      var last = migs.filter(function (m) { return m.up; }).pop();
      if (!last) { err(ctx, 'rails: 戻せるmigrationがありません\n'); return Promise.resolve(1); }
      out(ctx, '== ' + last.version + ' ' + last.name + ': reverting ====\n' +
               '== ' + last.version + ' ' + last.name + ': reverted (0.0318s)\n\n');
      last.up = false;
      if (last.revert) last.revert(S());
      runtime.emit('operation', { command: 'db:rollback', ok: true });
      return Promise.resolve(0);
    }

    err(ctx, 'rails: 未対応のタスクです（db:migrate / db:rollback / db:migrate:status）\n');
    return Promise.resolve(1);
  }

  /* ---------------- mysql / mysqldump ----------------
     Auroraへは踏み台やポートフォワード経由で繋ぐ。ここでは結果だけを再現する。
     CASE の db.queries（{ re, out }）から、SQL に合う最初の行の out を返す。out が関数なら out(S(), つながった先)。
     AWS のCASE（awsEnv を持つもの）では、-h のホスト名から Aurora のどのインスタンスにつながるかをシミュレーターで決める。 */
  function mysqlHost(args) {
    for (var i = 0; i < args.length; i++) {
      if (args[i] === '-h' || args[i] === '--host') return args[i + 1] || '';
      if (args[i].indexOf('--host=') === 0) return args[i].slice(7);
      if (/^-h./.test(args[i])) return args[i].slice(2);
    }
    return S().db.host || '';   /* -h を省くと ~/.my.cnf の host */
  }
  /* 値を取るオプション（-h db など）を除いた、残りの引数（データベース名・テーブル名） */
  function mysqlWords(args) {
    var VALUE = /^(-[hPuwe]|--(host|port|user|where|execute|result-file))$/;
    var words = [];
    for (var i = 0; i < args.length; i++) {
      if (VALUE.test(args[i])) { i++; continue; }
      if (args[i].charAt(0) !== '-') words.push(args[i]);
    }
    return words;
  }
  /* つながった先。つながらなければ { code, message } */
  function mysqlTarget(host) {
    var db = S().db, sim = window.AwsSim;
    if (!(S().awsEnv && sim)) return { host: host };
    sim.tick();
    var now = Date.now();
    var t = sim.resolveHost(sim.env(), host, now);
    if (!t) return { code: 2005, message: "Unknown MySQL server host '" + host + "' (-2)" };
    var at = host + ':3306';
    if (t.status !== 'available') return { code: 2003, message: "Can't connect to MySQL server on '" + at + "' (111)" };
    /* CASE の db.securityGroup（このサーバーからの 3306 を通すグループ）が DB に付いていなければ、応答が無いまま時間切れになる */
    var names = sim.env().securityGroups.filter(function (g) { return t.cluster.securityGroups.indexOf(g.groupId) >= 0; })
                                        .map(function (g) { return g.groupName; });
    if (db.securityGroup && names.indexOf(db.securityGroup) < 0) return { code: 2003, message: "Can't connect to MySQL server on '" + at + "' (110)" };
    var m = t.instance;
    return { host: host, cluster: t.cluster.id, instance: m.id, writer: m.id === t.cluster.writer,
             maxConnections: m.maxConnections, uptime: Math.floor((now - Math.max(m.readyAt, m.rebootUntil || 0)) / 1000),
             restoredFrom: t.cluster.restoredFrom || null };
  }
  function mysqlResult(ctx, r, prefix) {
    if (r && typeof r === 'object') {
      if (r.err) err(ctx, (prefix || '') + r.err + '\n');
      if (r.out) out(ctx, r.out + '\n');
      return r.code || (r.err ? 1 : 0);
    }
    if (r !== '') out(ctx, r + '\n');   /* 結果の無い文（INSERT など）は何も出さない */
    return 0;
  }

  def('mysql', function (ctx) {
    var db = S().db;
    if (!db) { err(ctx, 'mysql: このCASEではDBへ接続できません\n'); return Promise.resolve(1); }
    var host = mysqlHost(ctx.args);
    var t = mysqlTarget(host);
    if (t.code) { err(ctx, 'ERROR ' + t.code + ' (HY000): ' + t.message + '\n'); return Promise.resolve(1); }
    var q = optVal(ctx.args, '-e', '--execute');
    /* mysql < dump.sql（標準入力から SQL を流し込む） */
    if (!q && ctx.stdin && db.import) {
      return ctx.stdin.readAll().then(function (sql) {
        var code = mysqlResult(ctx, db.import(S(), t, sql, mysqlWords(ctx.args)[0]) || '');
        runtime.emit('operation', { command: 'mysql-import', host: host, ok: code === 0 });
        return code;
      });
    }
    if (!q) {
      err(ctx, DIM + '[学習環境] 対話シェルは開けません。mysql -e "<SQL>" の形で実行してください。' + R + '\n');
      return Promise.resolve(1);
    }
    var norm = q.replace(/\s+/g, ' ').trim().replace(/;$/, '');
    var hit = null;
    (db.queries || []).forEach(function (e) {
      if (hit) return;
      var re = e.re instanceof RegExp ? e.re : new RegExp(e.re, 'i');
      if (re.test(norm)) hit = e;
    });
    if (!hit) { err(ctx, DIM + '[学習環境] このクエリは用意されていません。' + R + '\n'); return Promise.resolve(1); }
    return Promise.resolve(mysqlResult(ctx, typeof hit.out === 'function' ? hit.out(S(), t, norm) : hit.out));
  });

  /* mysqldump <データベース> <テーブル> [--where=...] [--no-create-info]。中身は CASE の db.dump(S(), つながった先, 指定) が作る */
  def('mysqldump', function (ctx) {
    var db = S().db;
    if (!db || !db.dump) { err(ctx, 'mysqldump: このCASEではDBへ接続できません\n'); return Promise.resolve(2); }
    var host = mysqlHost(ctx.args);
    var t = mysqlTarget(host);
    if (t.code) { err(ctx, 'mysqldump: Got error: ' + t.code + ': ' + t.message + ' when trying to connect\n'); return Promise.resolve(2); }
    var words = mysqlWords(ctx.args);
    var spec = {
      database: words[0] || '',
      tables: words.slice(1),
      where: optVal(ctx.args, '-w', '--where'),
      noCreateInfo: ctx.args.some(function (a) { return a === '-t' || a === '--no-create-info'; })
    };
    return Promise.resolve(mysqlResult(ctx, db.dump(S(), t, spec), 'mysqldump: '));
  });

  /* ---------------- date ----------------
     Lifo の date は書式を受け付けないので、GNU date のよく使う形だけを再現する。
       date / date -u / date +%Y-%m-%dT%H:%M:%SZ / date -d '2026-11-21 10:42 +0900' / date -d @1790000000 / date -d '1 hour ago'
     タイムゾーンは -u か TZ=UTC なら UTC、それ以外は日本時間（この教材のサーバーと PC の設定） */
  function dateOffset(utc, env) { return utc || /^(UTC|UTC0|GMT|Etc\/UTC)$/.test((env || {}).TZ || '') ? 0 : 9; }
  function dateParse(s, off) {
    var v = String(s).trim(), m;
    if (v === '' || v === 'now') return Date.now();
    if ((m = v.match(/^@(-?\d+)$/))) return Number(m[1]) * 1000;
    if ((m = v.match(/^(\d+)\s+(second|minute|hour|day)s?\s+ago$/i))) return Date.now() - Number(m[1]) * { second: 1e3, minute: 6e4, hour: 36e5, day: 864e5 }[m[2].toLowerCase()];
    m = v.match(/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d?):(\d\d)(?::(\d\d))?(?:\.\d+)?)?\s*(Z|UTC|JST|[+-]\d\d:?\d\d)?$/i);
    if (!m) return NaN;
    var z = (m[7] || '').toUpperCase(), zoff = off;
    if (z === 'Z' || z === 'UTC') zoff = 0;
    else if (z === 'JST') zoff = 9;
    else if (z) zoff = (z.charAt(0) === '-' ? -1 : 1) * (Number(z.slice(1, 3)) + Number(z.slice(-2)) / 60);
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)) - zoff * 3600000;
  }
  function dateFormat(t, off, fmt) {
    var d = new Date(t + off * 3600000);
    var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
    var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var f = {
      Y: d.getUTCFullYear(), m: p2(d.getUTCMonth() + 1), d: p2(d.getUTCDate()), e: (d.getUTCDate() < 10 ? ' ' : '') + d.getUTCDate(),
      H: p2(d.getUTCHours()), M: p2(d.getUTCMinutes()), S: p2(d.getUTCSeconds()), s: Math.floor(t / 1000),
      a: DAYS[d.getUTCDay()], b: MONTHS[d.getUTCMonth()], Z: off ? 'JST' : 'UTC', z: off ? '+0900' : '+0000', '%': '%'
    };
    f.F = f.Y + '-' + f.m + '-' + f.d; f.T = f.H + ':' + f.M + ':' + f.S;
    return fmt.replace(/%([YmdeHMSsabZzFT%])/g, function (_, k) { return f[k]; });
  }
  def('date', function (ctx) {
    var args = ctx.args, utc = false, when = null, fmt = null;
    for (var i = 0; i < args.length; i++) {
      var a = args[i];
      if (a === '-u' || a === '--utc' || a === '--universal') utc = true;
      else if (a === '-d' || a === '--date') when = args[++i] || '';
      else if (a.indexOf('--date=') === 0) when = a.slice(7);
      else if (a.charAt(0) === '+') fmt = a.slice(1);
      else { err(ctx, "date: invalid option -- '" + a.replace(/^-+/, '') + "'\n"); return Promise.resolve(1); }
    }
    var off = dateOffset(utc, ctx.env);
    var t = when === null ? Date.now() : dateParse(when, off);
    if (isNaN(t)) { err(ctx, "date: invalid date '" + when + "'\n"); return Promise.resolve(1); }
    out(ctx, dateFormat(t, off, fmt || '%a %b %e %H:%M:%S %Z %Y') + '\n');
    return Promise.resolve(0);
  });

  /* ---------------- redis-cli ----------------
     CASE の redis（info: INFO の節ごとの値、config: CONFIG の値、dbsize、sizes: キーごとの件数）に答える。
     PING / INFO [節] / CONFIG GET <名前> / CONFIG SET <名前> <値> / DBSIZE / ZCARD・LLEN・SCARD <キー> */
  def('redis-cli', function (ctx) {
    var r = S().redis;
    var args = ctx.args.slice();
    while (args.length && /^-(h|p|n|a)$/.test(args[0])) args.splice(0, 2);
    if (!r) { err(ctx, 'Could not connect to Redis at 127.0.0.1:6379: Connection refused\n'); return Promise.resolve(1); }
    var cmd = (args[0] || '').toUpperCase();
    if (!cmd) {
      err(ctx, DIM + '[学習環境] 対話モードには入れません。redis-cli INFO memory のように、1行で打ってください。' + R + '\n');
      return Promise.resolve(1);
    }
    function intReply(n) { out(ctx, '(integer) ' + n + '\n'); return Promise.resolve(0); }
    if (cmd === 'PING') { out(ctx, 'PONG\n'); return Promise.resolve(0); }
    if (cmd === 'DBSIZE') return intReply(r.dbsize || 0);
    if (/^(ZCARD|LLEN|SCARD|HLEN)$/.test(cmd)) return intReply((r.sizes || {})[args[1]] || 0);
    if (cmd === 'INFO') {
      var sec = (args[1] || '').toLowerCase();
      var names = Object.keys(r.info || {}).filter(function (n) { return !sec || n === sec; });
      out(ctx, names.map(function (n) {
        var body = r.info[n];
        return '# ' + n.charAt(0).toUpperCase() + n.slice(1) + '\n' +
               Object.keys(body).map(function (k) { return k + ':' + body[k]; }).join('\n');
      }).join('\n\n') + '\n');
      return Promise.resolve(0);
    }
    if (cmd === 'CONFIG' && (args[1] || '').toUpperCase() === 'GET') {
      var re = new RegExp('^' + String(args[2] || '').replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      var keys = Object.keys(r.config || {}).filter(function (k) { return re.test(k); });
      var n = 0;
      out(ctx, keys.map(function (k) { return (++n) + ') "' + k + '"\n' + (++n) + ') "' + r.config[k] + '"'; }).join('\n') + (keys.length ? '\n' : '(empty array)\n'));
      return Promise.resolve(0);
    }
    if (cmd === 'CONFIG' && (args[1] || '').toUpperCase() === 'SET') {
      var key = String(args[2] || '').toLowerCase();
      if (!(key in (r.config || {}))) { err(ctx, "(error) ERR Unknown option or number of arguments for CONFIG SET - '" + key + "'\n"); return Promise.resolve(1); }
      r.config[key] = args[3];
      /* INFO の値にも反映する（maxmemory-policy → maxmemory_policy） */
      Object.keys(r.info || {}).forEach(function (n) { var k = key.replace(/-/g, '_'); if (k in r.info[n]) r.info[n][k] = args[3]; });
      runtime.emit('operation', { command: 'redis-cli config set', key: key, value: args[3], ok: true });
      out(ctx, 'OK\n');
      return Promise.resolve(0);
    }
    err(ctx, "(error) ERR unknown command '" + args[0] + "', with args beginning with: " + args.slice(1).map(function (x) { return "'" + x + "' "; }).join('') + '\n');
    return Promise.resolve(1);
  });

  /* ---------------- needrestart ----------------
     ライブラリやカーネルの更新のあと、再起動が要るかを調べる。CASE の needrestart（kcur / kexp / ksta / services）から答える。
     systemctl restart したサービスは、古いライブラリを使わなくなるので一覧から外れる（st.libRefreshed） */
  def('needrestart', function (ctx) {
    var n = S().needrestart;
    if (!n) { err(ctx, 'needrestart: このCASEでは使えません\n'); return Promise.resolve(1); }
    if (ctx.args.indexOf('-b') < 0) {
      err(ctx, DIM + '[学習環境] このCASEで再現しているのは needrestart -b（バッチの書式で一覧を出す。再起動はしない）だけです。' + R + '\n');
      return Promise.resolve(1);
    }
    var done = S().libRefreshed || {};
    var lines = ['NEEDRESTART-VER: ' + (n.ver || '3.5'), 'NEEDRESTART-KCUR: ' + n.kcur, 'NEEDRESTART-KEXP: ' + n.kexp, 'NEEDRESTART-KSTA: ' + n.ksta];
    n.services.forEach(function (s) { if (!done[s.replace(/\.service$/, '')]) lines.push('NEEDRESTART-SVC: ' + s); });
    out(ctx, lines.join('\n') + '\n');
    return Promise.resolve(0);
  });

  /* ---------------- uname ----------------
     Lifo の uname は Lifo 自身の名前を返すので、教材のサーバー（Ubuntu 22.04）の値にする */
  def('uname', function (ctx) {
    var kernel = S().kernel || '5.15.0-125-generic';
    var a = parse(ctx.args);
    if (a.flags.a) { out(ctx, 'Linux ' + (S().hostname || 'production') + ' ' + kernel + ' x86_64 x86_64 x86_64 GNU/Linux\n'); return Promise.resolve(0); }
    var parts = [];
    if (a.flags.s || !ctx.args.length) parts.push('Linux');
    if (a.flags.n) parts.push(S().hostname || 'production');
    if (a.flags.r) parts.push(kernel);
    if (a.flags.m) parts.push('x86_64');
    out(ctx, parts.join(' ') + '\n');
    return Promise.resolve(0);
  });

  /* ---------------- crontab / systemd timer ----------------
     Railsのバッチはこのどちらかで動いている。定期実行の在りかを見つける道具。 */
  def('crontab', function (ctx) {
    var a = parse(ctx.args);
    var user = optVal(ctx.args, '-u', null) || S().user || 'deploy';
    var table = S().crontab || {};
    if (a.flags.e) { err(ctx, DIM + '[学習環境] エディタは開けません。crontab -l で内容だけ確認してください。' + R + '\n'); return Promise.resolve(1); }
    var lines = table[user];
    if (!lines) { err(ctx, 'no crontab for ' + user + '\n'); return Promise.resolve(1); }
    out(ctx, lines.join('\n') + '\n');
    return Promise.resolve(0);
  });

  /* ---------------- truncate ----------------
     巨大ログを消さずに中身だけ空にする。復旧で最初に覚えるべき操作。 */
  def('truncate', function (ctx) {
    var a = parse(ctx.args);
    var size = optVal(ctx.args, '-s', '--size');
    if (size == null) { err(ctx, 'truncate: you must specify either --size or --reference\n'); return Promise.resolve(1); }
    if (String(size) !== '0') {
      err(ctx, DIM + '[学習環境] このCASEでは -s 0（中身を空にする）だけを扱います。' + R + '\n');
      return Promise.resolve(1);
    }
    /* -s の値（0）をファイル名と取り違えないよう、位置引数から除く */
    var targets = operands(ctx.args, { '-s': 1, '--size': 1 }).map(function (o) { return o.v; });
    if (!targets.length) { err(ctx, 'truncate: missing file operand\n'); return Promise.resolve(1); }

    return targets.reduce(function (chain, t) {
      return chain.then(function () {
        var abs = runtime.canonical(runtime.resolvePath(t, ctx.cwd));
        return api.exists(abs).then(function (ok) {
          if (!ok) { err(ctx, 'truncate: cannot open \'' + t + '\' for writing: No such file or directory\n'); return; }
          var freed = runtime.freeDisk(abs, 0);
          var meta = (S().fsMeta || {})[abs];
          if (meta && meta.size != null) meta.size = 0;
          runtime.emit('operation', { command: 'truncate', path: abs, freedKB: freed });
          return api.writeFile(abs, '');
        });
      });
    }, Promise.resolve()).then(function () { return 0; });
  });

  /* ---------------- logrotate ----------------
     設定ファイルを実際に読んで、対象パターンを展開する。
     viで設定を直せば、その場で挙動が変わる。 */
  def('logrotate', function (ctx) {
    var a = parse(ctx.args);
    var conf = operands(ctx.args, {}).map(function (o) { return o.v; }).pop();
    if (!conf) {
      err(ctx, 'logrotate: 設定ファイルを指定してください（例: logrotate -f /etc/logrotate.d/rails）\n');
      return Promise.resolve(1);
    }
    var abs = runtime.canonical(runtime.resolvePath(conf, ctx.cwd));
    var verbose = a.flags.v || a.longs.verbose;
    var dry     = a.flags.d || a.longs.debug;
    var forced  = a.flags.f || a.longs.force;

    return api.readFile(abs).catch(function () { return null; }).then(function (body) {
      if (body == null) {
        err(ctx, 'logrotate: error: cannot stat ' + conf + ': No such file or directory\n');
        return 1;
      }
      var spec = parseLogrotate(body);
      if (!spec.patterns.length) {
        err(ctx, 'logrotate: error: ' + conf + ': 対象のログが1つも書かれていません\n');
        return 1;
      }
      return expandPatterns(spec.patterns, ctx.cwd).then(function (files) {
        if (dry) {
          out(ctx, 'reading config file ' + conf + '\n');
          spec.patterns.forEach(function (p) { out(ctx, 'considering log ' + p + '\n'); });
          if (!files.length) out(ctx, DIM + '  → 一致するファイルがありません' + R + '\n');
          files.forEach(function (f) { out(ctx, '  log ' + f + ' — rotate ' + spec.rotate +
            (spec.compress ? ', compress' : '') + (spec.copytruncate ? ', copytruncate' : '') + '\n'); });
          out(ctx, DIM + '（-d は確認のみ。実際にはローテートしていません）' + R + '\n');
          return 0;
        }
        if (!forced) {
          out(ctx, DIM + '[学習環境] 条件を満たしていないためローテートされませんでした。' +
                   'いますぐ実行するなら -f を付けてください。' + R + '\n');
          return 0;
        }
        return files.reduce(function (chain, f) {
          return chain.then(function () {
            if (verbose) out(ctx, 'rotating log ' + f + ', log->rotateCount ' + spec.rotate + '\n');
            return api.readFile(f).then(function (body2) {
              var dest = f + '.1' + (spec.compress ? '.gz' : '');
              /* ponytail: 本物のgzip圧縮はしない。zgrep/zcatで読めるよう中身をそのまま置く */
              return api.writeFile(dest, body2).then(function () {
                var freed = runtime.freeDisk(f, 0);
                var meta = (S().fsMeta || {})[f];
                if (meta && meta.size != null) meta.size = 0;
                runtime.emit('operation', { command: 'logrotate', path: f, freedKB: freed });
                if (verbose) out(ctx, 'renaming ' + f + ' to ' + dest + '\n');
                return api.writeFile(f, '');
              });
            });
          });
        }, Promise.resolve()).then(function () {
          runtime.emit('operation', { command: 'logrotate:done', conf: abs, count: files.length });
          return 0;
        });
      });
    });
  });

  /* 設定ファイルの最小パーサ。{ の前がパターン、中身がオプション */
  function parseLogrotate(body) {
    /* コメント行はまるごと落としてからパターンを拾う */
    var clean = body.split('\n')
      .filter(function (l) { return !/^\s*#/.test(l); })
      .join('\n');
    var head = clean.split('{')[0] || '';
    var patterns = head.split(/\s+/)
      .map(function (t) { return t.trim(); })
      .filter(function (t) { return !!t; });
    var b = body.slice(body.indexOf('{') + 1);
    var m = /^\s*rotate\s+(\d+)/m.exec(b);
    return {
      patterns: patterns,
      rotate: m ? Number(m[1]) : 7,
      compress: /^\s*compress\s*$/m.test(b),
      copytruncate: /^\s*copytruncate\s*$/m.test(b)
    };
  }

  /* /path/*.log のようなパターンをVFSで展開する */
  function expandPatterns(patterns, cwd) {
    var seen = {};
    return patterns.reduce(function (chain, pat) {
      return chain.then(function (acc) {
        var abs = runtime.resolvePath(pat, cwd);
        if (abs.indexOf('*') < 0) {
          return api.exists(abs).then(function (ok) {
            if (ok && !seen[abs]) { seen[abs] = 1; acc.push(abs); }
            return acc;
          });
        }
        var dir = abs.slice(0, abs.lastIndexOf('/')) || '/';
        var base = abs.slice(abs.lastIndexOf('/') + 1);
        var re = new RegExp('^' + base.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
        return api.readdir(runtime.canonical(dir)).then(function (entries) {
          entries.forEach(function (e) {
            if (e.type !== 'file' || !re.test(e.name)) return;
            var p = dir + '/' + e.name;
            if (!seen[p]) { seen[p] = 1; acc.push(p); }
          });
          return acc;
        });
      });
    }, Promise.resolve([])).then(function (acc) { return acc.sort(); });
  }

  /* ---------------- pumactl ----------------
     無停止でworkerだけ入れ替える。メモリリーク対策の定期運用で使う。 */
  def('pumactl', function (ctx) {
    var a = parse(ctx.args);
    var sub = a.rest[0];
    var svc = (S().services || {}).puma;

    if (sub === 'status') {
      if (!svc || svc.status !== 'active') { err(ctx, 'Puma is not running\n'); return Promise.resolve(1); }
      out(ctx, 'Puma is started\n');
      return Promise.resolve(0);
    }

    if (sub === 'phased-restart') {
      if (!svc || svc.status !== 'active') {
        err(ctx, 'Error: No pid \'' + (svc && svc.mainPid || '') + '\' found. Puma is not running.\n');
        return Promise.resolve(1);
      }
      var procs = S().processes || [];
      var workers = procs.filter(function (p) { return /cluster worker/.test(p.command); });
      if (!workers.length) { err(ctx, 'Error: phased-restart は cluster mode でのみ使えます\n'); return Promise.resolve(1); }

      /* workerを1つずつ新しいPIDへ入れ替える。masterのPIDは変わらない */
      var next = 9500;
      workers.forEach(function (w) {
        w.pid = next++;
        w.mem = Math.round((w.mem || 8) * 0.28 * 10) / 10;
        w.rss = Math.round((w.rss || 320000) * 0.28);
        w.time = '0:01';
        w.start = 'Sep14';
      });
      var mem = S().system && S().system.mem;
      if (mem) {
        var freedMB = Math.round((mem.used || 0) * 0.35);
        mem.used = Math.max(0, mem.used - freedMB);
        mem.free = (mem.free || 0) + freedMB;
        mem.available = (mem.available || 0) + freedMB;
      }
      S().journal = S().journal || {};
      S().journal.puma = (S().journal.puma || []).concat([
        runtime.stamp() + ' production puma[' + svc.mainPid + ']: - Starting phased worker restart, phase: 1',
        runtime.stamp() + ' production puma[' + svc.mainPid + ']: - Stopping 0 for phased upgrade...',
        runtime.stamp() + ' production puma[' + svc.mainPid + ']: - Worker 0 (PID: ' + workers[0].pid + ') booted in 0.02s, phase: 1',
        runtime.stamp() + ' production puma[' + svc.mainPid + ']: - Worker 1 (PID: ' + (workers[1] ? workers[1].pid : 0) + ') booted in 0.02s, phase: 1'
      ]);
      runtime.emit('operation', { command: 'pumactl phased-restart', ok: true });
      out(ctx, 'Command phased-restart sent success\n');
      return Promise.resolve(0);
    }

    if (sub === 'restart' || sub === 'stop' || sub === 'start') {
      var r = runtime.serviceAction(sub, 'puma');
      if (r.err) err(ctx, r.err);
      else out(ctx, 'Command ' + sub + ' sent success\n');
      return Promise.resolve(r.code);
    }

    err(ctx, 'usage: pumactl [status|restart|phased-restart|stop|start]\n');
    return Promise.resolve(2);
  });

  /* ---------------- ln ----------------
     Lifo VFSにsymlinkは無いので、教材のsymlinkマップを張り替えて実体を作り直す。
     Capistranoのロールバック（currentの張り替え）を体験させるために必要。 */
  def('ln', function (ctx) {
    var a = parse(ctx.args);
    if (!a.flags.s) { err(ctx, 'ln: この学習環境では symbolic link（-s）のみ扱います\n'); return Promise.resolve(1); }
    if (a.rest.length < 2) { err(ctx, 'ln: missing destination file operand\n'); return Promise.resolve(1); }
    var link = runtime.resolvePath(a.rest[1], ctx.cwd);
    /* 本物の ln -s と同じで、相対指定のリンク先は「リンクを置く場所」から見た相対。
       Capistranoの ln -sfn releases/xxx /var/www/myapp/current がこれ。 */
    var linkDir = link.slice(0, link.lastIndexOf('/')) || '/';
    var target = a.rest[0].charAt(0) === '/'
      ? runtime.resolvePath(a.rest[0], '/')
      : runtime.resolvePath(a.rest[0], linkDir);
    var links  = S().symlinks || (S().symlinks = {});
    if (links[link] && !(a.flags.f || a.flags.n)) {
      err(ctx, 'ln: failed to create symbolic link \'' + a.rest[1] + '\': File exists\n');
      return Promise.resolve(1);
    }
    return api.exists(target).then(function (ok) {
      if (!ok) { err(ctx, 'ln: failed to access \'' + a.rest[0] + '\': No such file or directory\n'); return 1; }
      links[link] = target;
      return api.relink(link, target).then(function () {
        runtime.emit('operation', { command: 'ln -s', link: link, target: target });
        return 0;
      });
    });
  });

  /* ---------------- aws ----------------
     本番サーバーへの入口。SSHでも踏み台でもなく Session Manager で入る、
     という実際の手順をそのまま演習にする。 */
  /* AWS のCASE（awsEnv を持つもの）は、aws-learning のシミュレーター（vendor/aws-sim.min.js）が AWS CLI として応答する。
     aws-learning は ~/.aws を /home/learner に置く前提なので、手元のPCのホームへ読み替える */
  function runSimAws(ctx) {
    var home = S().home, LEARNER = '/home/learner';
    function local(p) { return p === LEARNER || p.indexOf(LEARNER + '/') === 0 ? home + p.slice(LEARNER.length) : p; }
    var target = null;
    /* 本番サーバー（EC2）の上では、AWS CLI はインスタンスプロファイル（IAM ロール）の一時的な認証情報を使う。
       ~/.aws を置かずに使えるよう、その認証情報とリージョンを、利用者には見えない形で渡す */
    var shellEnv = ctx.env || {};
    if (!S().local || S().connected) {
      shellEnv = Object.assign({ AWS_ACCESS_KEY_ID: 'ASIAIOSFODNN7EXAMPLE', AWS_SECRET_ACCESS_KEY: 'instance-profile-credentials',
                                 AWS_SESSION_TOKEN: 'instance-profile-session-token', AWS_REGION: 'ap-northeast-1' }, shellEnv);
    }
    window.AwsSim.tick();
    return window.AwsSim.run(ctx.args, {
      stdout: function (s) { ctx.stdout.write(s); },
      stderr: function (s) { ctx.stderr.write(s); },
      shellEnv: shellEnv,
      cwd: ctx.cwd,
      readFile: function (p) { return api.readFileSync(local(p)); },
      writeFile: function (p, body) { api.writeFileSync(local(p), body); },
      signal: ctx.signal,
      connect: function (t) { target = t; }
    }).then(function (r) {
      if (target && r.exitCode === 0) execSession(ctx, target);
      return r.exitCode;
    });
  }

  /* aws ecs execute-command でつながったあと。--command が rails console なら、CASE の rails.console の表で REPL に入る */
  function execSession(ctx, target) {
    var p = target.split('|');            /* ecs-exec|タスクARN|コンテナ|コマンド|セッションID */
    var command = p[3] || '', session = p[4] || '';
    var spec = (S().rails || {}).console;
    if (p[0] !== 'ecs-exec' || !/rails\s+(console|c)\b/.test(command) || !spec) {
      out(ctx, DIM + '[学習環境] このCASEで再現しているのは --command "bin/rails console" だけです。' + R + '\n\n' +
               'Exiting session with sessionId: ' + session + '.\n');
      return;
    }
    var sandbox = /--sandbox|\s-s\b/.test(command);
    out(ctx, 'Loading production environment (Rails ' + ((S().rails || {}).version || '8.1.4.1') + ')\n');
    if (sandbox) out(ctx, YEL + 'Any modifications you make will be rolled back on exit' + R + '\n');
    runtime.enterRepl({ name: (S().rails || {}).app || 'jinzai(prod)', style: 'rails8', sandbox: sandbox,
                        session: session, table: spec.table || [], fallback: spec.fallback });
  }

  def('aws', function (ctx) {
    if (S().awsEnv && window.AwsSim) return runSimAws(ctx);
    var a = parse(ctx.args);
    var aws = S().aws || {};
    var svc = a.rest[0], sub = a.rest[1];

    if (svc === 'sts' && sub === 'get-caller-identity') {
      out(ctx, JSON.stringify({
        UserId: aws.userId || 'AIDAEXAMPLEUSERID',
        Account: aws.account || '123456789012',
        Arn: aws.arn || 'arn:aws:iam::123456789012:user/i-wada'
      }, null, 4) + '\n');
      return Promise.resolve(0);
    }

    if (svc === 'ec2' && sub === 'describe-instances') {
      var rows = (aws.instances || []);
      out(ctx, pad('INSTANCE-ID', 22) + pad('NAME', 22) + pad('STATE', 10) +
               pad('TYPE', 12) + 'PRIVATE-IP\n');
      rows.forEach(function (i) {
        out(ctx, pad(i.id, 22) + pad(i.name, 22) +
                 (i.state === 'running' ? GRN : YEL) + pad(i.state, 10) + R +
                 pad(i.type, 12) + (i.ip || '-') + '\n');
      });
      return Promise.resolve(0);
    }

    if (svc === 'ssm' && sub === 'describe-instance-information') {
      var list = (aws.instances || []).filter(function (i) { return i.ssm !== false; });
      out(ctx, pad('INSTANCE-ID', 22) + pad('NAME', 22) + pad('PING', 12) + 'PLATFORM\n');
      list.forEach(function (i) {
        out(ctx, pad(i.id, 22) + pad(i.name, 22) + GRN + pad('Online', 12) + R +
                 (i.platform || 'Amazon Linux 2023') + '\n');
      });
      return Promise.resolve(0);
    }

    if (svc === 'ssm' && sub === 'start-session') {
      var target = optVal(ctx.args, null, '--target');
      if (!target) { err(ctx, 'usage: aws ssm start-session --target <instance-id>\n'); return Promise.resolve(2); }
      var hit = (aws.instances || []).filter(function (i) { return i.id === target; })[0];
      if (!hit || hit.ssm === false) {
        err(ctx, '\nAn error occurred (TargetNotConnected) when calling the StartSession operation: ' +
                 target + ' is not connected.\n');
        return Promise.resolve(254);
      }
      if (!S().server) { err(ctx, 'aws: このCASEには接続先が定義されていません\n'); return Promise.resolve(1); }
      out(ctx, '\nStarting session with SessionId: ' + (S().user || 'user') + '-0a1b2c3d4e5f6g7h8\n');
      return runtime.connectServer().then(function () {
        out(ctx, DIM + '[学習環境] 手元のPCと本番サーバーを1つのTerminalで再現しています。' +
                 '接続後は /var/www 以下を見てください。' + R + '\n');
        return 0;
      });
    }

    if (svc === 'ssm' && sub === 'start-port-forwarding-session') {
      out(ctx, '\nPort 13306 opened for sessionId ' + (S().user || 'user') + '-pf01.\n' +
               'Waiting for connections...\n' +
               DIM + '[学習環境] ポートフォワードは再現していません。DBへはこの演習では接続しません。' + R + '\n');
      return Promise.resolve(0);
    }

    err(ctx, 'usage: aws [sts|ec2|ssm] <subcommand>\n' +
             '  aws sts get-caller-identity\n' +
             '  aws ec2 describe-instances\n' +
             '  aws ssm describe-instance-information\n' +
             '  aws ssm start-session --target <instance-id>\n');
    return Promise.resolve(2);
  });

  /* ---------------- ssh ----------------
     踏み台もport22も無い環境で「昔の手順書どおりに叩いてみる」ための再現。 */
  def('ssh', function (ctx) {
    var a = parse(ctx.args);
    var host = a.rest[0] || '';
    var ssh = S().ssh || {};
    var target = host.indexOf('@') >= 0 ? host.split('@')[1] : host;
    if (!target) { err(ctx, 'usage: ssh [user@]hostname\n'); return Promise.resolve(255); }
    if (ssh.allow && ssh.allow.indexOf(target) >= 0) {
      err(ctx, 'ssh: この学習環境では実際の接続は行いません。\n');
      return Promise.resolve(0);
    }
    err(ctx, 'ssh: connect to host ' + target + ' port 22: ' +
             (ssh.reason || 'Connection timed out') + '\n');
    return Promise.resolve(255);
  });

  /* ---------------- su ----------------
     SSMで入った直後は ssm-user。アプリのファイルを触るには deploy へ切り替える。 */
  def('su', function (ctx) {
    var a = parse(ctx.args);
    var target = a.rest[a.rest.length - 1];
    if (!target || target === '-') target = 'root';
    var homes = S().homes || {};
    var home = homes[target] || (target === 'root' ? '/root' : '/home/' + target);
    return runtime.becomeUser(target, { home: home, cwd: home }).then(function () {
      return 0;
    });
  });

  /* ---------------- whoami / id / hostname ----------------
     Lifo純正の whoami はNodeのprocessを参照していてブラウザでは動かない。
     CASEがユーザー名を持っているので、教材側で返す。 */
  def('whoami', function (ctx) {
    out(ctx, (S().user || 'deploy') + '\n');
    return Promise.resolve(0);
  });

  def('id', function (ctx) {
    var u = S().user || 'deploy';
    if (u === 'root') { out(ctx, 'uid=0(root) gid=0(root) groups=0(root)\n'); return Promise.resolve(0); }
    out(ctx, 'uid=1001(' + u + ') gid=1001(' + u + ') groups=1001(' + u + '),27(sudo)\n');
    return Promise.resolve(0);
  });

  def('hostname', function (ctx) {
    out(ctx, (S().hostname || 'production') + '\n');
    return Promise.resolve(0);
  });

  /* ---------------- printenv ---------------- */
  def('printenv', function (ctx) {
    var a = parse(ctx.args);
    ctx.env.PWD = ctx.cwd;
    if (!a.rest.length) {
      Object.keys(ctx.env).forEach(function (k) { out(ctx, k + '=' + ctx.env[k] + '\n'); });
      return Promise.resolve(0);
    }
    var missing = 0;
    a.rest.forEach(function (k) {
      if (ctx.env[k] == null) { missing = 1; return; }
      out(ctx, ctx.env[k] + '\n');
    });
    return Promise.resolve(missing);
  });

  /* ---------------- readlink ---------------- */
  def('readlink', function (ctx) {
    var a = parse(ctx.args);
    if (!a.rest.length) { err(ctx, 'readlink: missing operand\n'); return Promise.resolve(1); }
    var links = S().symlinks || {};
    var code = 0;
    a.rest.forEach(function (p) {
      var abs = runtime.resolvePath(p, ctx.cwd);
      if (!links[abs]) {
        /* current/log のように、リンクの先にあるリンクも辿れるようにする */
        var alt = runtime.canonical(abs.slice(0, abs.lastIndexOf('/'))) + abs.slice(abs.lastIndexOf('/'));
        if (links[alt]) abs = alt;
      }
      if (links[abs]) { out(ctx, (a.flags.f ? runtime.canonical(abs) : runtime.relativeLink(abs, links[abs])) + '\n'); }
      else if (a.flags.f) { out(ctx, runtime.canonical(abs) + '\n'); }
      else { code = 1; }
    });
    return Promise.resolve(code);
  });

  /* ---------------- less / more ---------------- */
  /* ブラウザ上でページャは再現できない。catと同じ出力＋使い方の注記にする */
  /* /proc/<PID>/... は書き込めない仮想FSなので、読み出しだけ合成して返す */
  wrap('cat', function (ctx, orig) {
    var files = operands(ctx.args, {}).map(function (o) {
      return { raw: o.v, abs: runtime.canonical(runtime.resolvePath(o.v, ctx.cwd)) };
    });
    var procs = files.filter(function (f) { return runtime.procRead(f.abs) != null; });
    if (!procs.length || procs.length !== files.length) return orig(ctx);
    procs.forEach(function (f) { out(ctx, runtime.procRead(f.abs)); });
    return Promise.resolve(0);
  });

  return api.original('cat').then(function (origCat) {
    /* ファイルを指定されたらLifoのページャ（lifo-pkg-less）を使う。
       ponytail: パイプ経由（cat x | less）のときは対話できないのでcat相当にする。 */
    function pager(ctx) {
      var files = ctx.args.filter(function (a) { return a.charAt(0) !== '-'; });
      if (files.length && api.vendorCommand('less')) return runFullScreen('less', ctx);
      return Promise.resolve(origCat(ctx)).then(function (code) {
        ctx.stderr.write(DIM + '[学習環境] パイプ経由のページャは再現できません。' +
          'ファイルを直接指定すると less として動きます（q で終了）。' + R + '\n');
        return code;
      });
    }
    def('less', pager);
    def('more', pager);

    /* ---------------- ls（fsMeta / symlink の装飾） ---------------- */
    return wrap('ls', function (ctx, orig) {
      var targets = operands(ctx.args, {}).map(function (o) {
        return runtime.canonical(runtime.resolvePath(o.v, ctx.cwd));
      });
      if (targets.length === 1) {
        var names = runtime.procList(targets[0]);
        if (names) { out(ctx, names.join('  ') + '\n'); return Promise.resolve(0); }
      }
      return capture(ctx, orig).then(function (r) {
        ctx.stdout.write(runtime.decorateLs(r.text, ctx));
        return r.code;
      });
    });
  }).then(function () {

    /* ---------------- df（CASEのディスク状態で上書き） ---------------- */
    return wrap('df', function (ctx, orig) {
      var d = S().disk;
      if (!d || !d.filesystems) return orig(ctx);
      var a = parse(ctx.args);
      var h = a.flags.h;

      /* -i は「容量」ではなく「ファイルを何個作れるか」を見る。
         容量が空いているのに書けない（inode枯渇）を切り分けるために要る。 */
      if (a.flags.i) {
        out(ctx, pad('Filesystem', 17) + lpad('Inodes', 10) + lpad('IUsed', 10) +
                 lpad('IFree', 10) + lpad('IUse%', 7) + ' Mounted on\n');
        d.filesystems.forEach(function (f) {
          if (f.inodes == null) { out(ctx, pad(f.fs, 17) + lpad('-', 10) + lpad('-', 10) + lpad('-', 10) + lpad('-', 7) + ' ' + f.mount + '\n'); return; }
          var used = f.inodesUsed || 0;
          var pct = Math.min(100, Math.round((used / f.inodes) * 100));
          var full = pct >= 95;
          out(ctx, (full ? RED : '') + pad(f.fs, 17) +
                   lpad(h ? humanCount(f.inodes) : f.inodes, 10) +
                   lpad(h ? humanCount(used) : used, 10) +
                   lpad(h ? humanCount(f.inodes - used) : (f.inodes - used), 10) +
                   lpad(pct + '%', 7) + ' ' + f.mount + (full ? R : '') + '\n');
        });
        return Promise.resolve(0);
      }

      out(ctx, pad('Filesystem', 17) + lpad(h ? 'Size' : '1K-blocks', 10) + lpad('Used', 9) +
               lpad(h ? 'Avail' : 'Available', 10) + lpad('Use%', 6) + ' Mounted on\n');
      d.filesystems.forEach(function (f) {
        var full = f.usePct >= 95;
        out(ctx, (full ? RED : '') + pad(f.fs, 17) + lpad(h ? f.size : f.sizeK || f.size, 10) +
                 lpad(h ? f.used : f.usedK || f.used, 9) + lpad(h ? f.avail : f.availK || f.avail, 10) +
                 lpad(f.usePct + '%', 6) + ' ' + f.mount + (full ? R : '') + '\n');
      });
      return Promise.resolve(0);
    });
  }).then(function () {

    /* ---------------- du（CASEのサイズ定義があればそれを使う） ---------------- */
    return wrap('du', function (ctx, orig) {
      var sizes = (S().disk || {}).sizes || {};
      if (!Object.keys(sizes).length) {
        /* Lifoのduは -sh のような連結短縮形を解釈しない。展開してから渡す */
        var norm = [];
        ctx.args.forEach(function (x) {
          if (/^-[a-zA-Z]{2,}$/.test(x)) x.slice(1).split('').forEach(function (f) { norm.push('-' + f); });
          else norm.push(x);
        });
        var sub = Object.create(ctx);
        sub.args = norm;
        return orig(sub);
      }
      var a = parse(ctx.args);
      var targets = a.rest.length ? a.rest : ['.'];
      var h = a.flags.h, summarize = a.flags.s;
      var rows = [];
      targets.forEach(function (t) {
        var abs = runtime.resolvePath(t, ctx.cwd);
        if (summarize) {
          rows.push([runtime.duSize(abs, sizes), t]);
        } else {
          Object.keys(sizes).forEach(function (p) {
            if (p === abs || p.indexOf(abs + '/') === 0) rows.push([sizes[p], runtime.displayPath(p, ctx.cwd)]);
          });
          if (!rows.length) rows.push([runtime.duSize(abs, sizes), t]);
        }
      });
      rows.forEach(function (r) { out(ctx, (h ? humanKB(r[0]) : r[0]) + '\t' + r[1] + '\n'); });
      return Promise.resolve(0);
    });
  }).then(function () {

    /* ---------------- sort -h ----------------
       Lifoのsortは 33.5K / 165B のような人間可読サイズを数値として比較できない。
       du -sh * | sort -h は本番で頻繁に使う組み合わせなので、-h のときだけ自前で並べる。 */
    return wrap('sort', function (ctx, orig) {
      var a = parse(ctx.args);
      if (!a.flags.h || a.rest.length || !ctx.stdin) return runTextSafe('sort', ctx, orig, 0);
      return ctx.stdin.readAll().then(function (text) {
        var L = (text || '').split('\n').filter(function (x) { return x !== ''; });
        L.sort(function (x, y) { return hnum(x) - hnum(y); });
        if (a.flags.r) L.reverse();
        out(ctx, L.join('\n') + (L.length ? '\n' : ''));
        return 0;
      });
    });
  }).then(function () {

    /* grep はパターンが第1位置引数なので、ファイルは index 1 から */
    return Promise.all([
      wrap('grep', function (ctx, orig) { return grepContext(ctx) || runTextSafe('grep', ctx, orig, 1); }),
      wrap('egrep', function (ctx, orig) { return grepContext(ctx, true) || runTextSafe('egrep', ctx, orig, 1); }),
      textFallback('head', 0), textFallback('wc', 0),
      textFallback('cut', 0), textFallback('nl', 0)
      /* sort と tail はそれぞれ専用のラップの中で runTextSafe を呼んでいる */
    ]);
  }).then(function () {

    /* ---------------- tail（-f だけ横取りしてstreamする） ---------------- */
    return wrap('tail', function (ctx, orig) {
      var a = parse(ctx.args);
      if (!a.flags.f && !a.longs.follow) return runTextSafe('tail', ctx, orig, 0);
      var live = S().liveLog;
      var target = a.rest[0] ? runtime.resolvePath(a.rest[0], ctx.cwd) : null;
      /* まず既存の末尾10行を出してから追尾する（本物のtail -fと同じ） */
      var head = Object.create(ctx);
      head.args = ['-n', '10'].concat(a.rest);
      return Promise.resolve(orig(head)).then(function () {
        var same = live && (!target || runtime.canonical(live.path) === runtime.canonical(target));
        return runtime.follow(ctx, same ? live.lines : [], 'tail -f');
      });
    });
  });
}

window.LFR = window.LFR || {};
window.LFR.scenarioCommands = { register: register };
})();
