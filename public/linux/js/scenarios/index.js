/* CASEレジストリ
   ------------------------------------------------------------------
   新しい演習を足すときにやることは1つだけ。
   js/scenarios/caseNN.js を書いて index.html に <script> を1行足す。
   HTMLもロジックもコピーしない。                                      */
(function () {
'use strict';

var list = [];

/* baseの上にCASEの差分を重ねる。
   object（files/services/journal…）はキー単位マージ、arrayは丸ごと置換。 */
function merge(base, patch) {
  var out = {};
  Object.keys(base).forEach(function (k) { out[k] = base[k]; });
  Object.keys(patch).forEach(function (k) {
    var b = base[k], p = patch[k];
    if (b && p && typeof b === 'object' && typeof p === 'object' &&
        !Array.isArray(b) && !Array.isArray(p)) {
      out[k] = merge(b, p);
    } else {
      out[k] = p;
    }
  });
  return out;
}

function add(def) {
  list.push(def);
}

/* CASE定義は使い回されるので、実行中に書き換わる部分は必ず複製して渡す。
   これをしないと「もう一度やり直す」で前回の状態から始まってしまう。
   関数（recovery.onUp / probes.test など）は状態を持たないので参照のまま。 */
function cloneData(v) {
  if (Array.isArray(v)) return v.map(cloneData);
  if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    var o = {};
    Object.keys(v).forEach(function (k) { o[k] = cloneData(v[k]); });
    return o;
  }
  return v;   /* 関数・RegExp・プリミティブはそのまま */
}

/* CASE定義 → 実行可能なシナリオ状態 */
function build(def) {
  var base = window.LFR.base;
  var s = merge({
    files: base.files, symlinks: base.symlinks, fsMeta: base.fsMeta,
    services: base.services, journal: base.journal, disk: base.disk,
    system: base.system, envVars: base.envVars, http: base.http
  }, {
    files: def.files || {}, symlinks: def.symlinks || {}, fsMeta: def.fsMeta || {},
    services: def.services || {}, journal: def.journal || {}, disk: def.disk || {},
    system: def.system || {}, envVars: def.envVars || {}, http: def.http || {}
  });

  /* このCASEでは「設定されていない」ことにしたい環境変数 */
  (def.envUnset || []).forEach(function (k) { delete s.envVars[k]; });

  s.id = def.id;
  s.level = def.level;
  s.title = def.title;
  s.subtitle = def.subtitle || '';
  s.description = def.description;
  s.learn = def.learn || [];
  s.guide = def.guide || [];
  s.manual = def.manual;
  s.firstLook = def.firstLook;
  s.hints = def.hints || [];
  s.probes = def.probes || [];
  s.evidence = def.evidence || [];
  s.question = def.question;
  s.route = def.route;
  s.liveLog = def.liveLog || null;
  s.ports = def.ports || base.ports;
  s.processes = def.processes || base.processes;
  s.now = def.now || '14:05:12';

  s.aws = def.aws || null;
  s.awsEnv = def.awsEnv || null;   /* function (AwsSim) → シミュレーターの環境。AWS のCASEだけ */
  s.ssh = def.ssh || null;
  s.limits = def.limits || null;
  s.tls = def.tls || null;
  s.dns = def.dns || null;
  s.tmux = (def.tmux || []).slice();
  s.openFiles = (def.openFiles || []).map(function (f) {
    var g = {}; Object.keys(f).forEach(function (k) { g[k] = f[k]; });
    g.name = g.name || g.path;
    return g;
  });
  s.logrotate = def.logrotate || null;
  s.maintenance = def.maintenance || null;
  s.crontab = def.crontab || null;
  s.timers = def.timers || null;
  s.slowlog = def.slowlog || null;
  s.db = def.db || null;
  s.redis = def.redis || null;              /* redis-cli が答える INFO / CONFIG / 件数 */
  s.needrestart = def.needrestart || null;  /* needrestart -b が答える、カーネルと再起動の要るサービス */
  s.kernel = def.kernel || null;            /* uname -r */
  s.rails = def.rails || null;
  s.homes = def.homes || null;
  s.alert = def.alert || null;
  s.date = def.date || 'Sep 14';
  s.weekday = def.weekday || 'Mon';
  /* clock: 'now' のCASEは、ログインの表示と journal の時刻を、開いたときの日本時間にする（ログの時刻を今から作るCASE） */
  s.clock = def.clock || null;
  if (def.clock === 'now') {
    var jst = new Date(Date.now() + 9 * 3600000).toUTCString().split(' ');   /* Sat, 21 Nov 2026 03:10:00 GMT */
    s.weekday = jst[0].slice(0, 3);
    s.date = jst[2] + ' ' + Number(jst[1]);
    s.now = jst[4];
  }

  /* local を宣言したCASEは「手元のPCから始まる」。
     server は aws ssm start-session で切り替わる先。 */
  if (def.local) {
    s.local = def.local;
    s.server = def.server || {
      hostname: def.hostname || base.hostname,
      user: def.user || base.user,
      home: base.home,
      cwd: def.startDirectory || base.startDirectory
    };
    s.hostname = def.local.hostname;
    s.user = def.local.user;
    s.home = def.local.home;
    s.prompt = def.local.prompt || null;
    s.startDirectory = def.local.home;
    s.connected = false;
  } else {
    s.server = null;
    s.prompt = def.prompt || null;
    s.hostname = def.hostname || base.hostname;
    s.user = def.user || base.user;
    s.home = base.home;
  }
  s.appRoot = base.appRoot;
  s.release = base.release;
  s.prevRelease = base.prevRelease;
  if (!def.local) s.startDirectory = def.startDirectory || base.startDirectory;

  /* 実行中に書き換わるものを複製する */
  ['services', 'journal', 'processes', 'ports', 'system', 'disk', 'limits',
   'openFiles', 'envVars', 'http', 'symlinks', 'fsMeta', 'tmux', 'dns', 'tls',
   'crontab', 'timers', 'rails', 'aws', 'maintenance', 'liveLog', 'redis', 'needrestart'].forEach(function (k) {
    if (s[k] != null) s[k] = cloneData(s[k]);
  });
  return s;
}

window.LFR = window.LFR || {};
window.LFR.scenarios = {
  add: add,
  all: function () { return list.slice(); },
  count: function () { return list.length; },
  get: function (id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return build(list[i]);
    return null;
  },
  def: function (id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  },
  build: build
};
})();
