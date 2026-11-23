(function (L) {
  'use strict';
  function session(name, level = 'REPEATABLE READ') {
    return { name, id: name, level, status: 'IDLE', startedAt: null, snapshot: null, writes: new Map(), visible: new Map(), pending: null, last: 'BEGINで開始してください。' };
  }
  // This deliberately small, anchored grammar rejects unsupported SQL without effects.
  function command(sql) {
    const text = sql.trim().replace(/;\s*$/, '').trim();
    let match;
    if (/^(BEGIN|COMMIT|ROLLBACK)$/i.test(text)) return { kind: text.toLowerCase() };
    if ((match = text.match(/^SELECT\s+(balance|id|\*)\s+FROM\s+accounts\s+WHERE\s+id\s*=\s*(\d+)\s*(FOR\s+UPDATE|FOR\s+SHARE|LOCK\s+IN\s+SHARE\s+MODE)?$/i))) {
      const locking = (match[3] || '').replace(/\s+/g, ' ').toUpperCase();
      return { kind: 'read', id: +match[2], column: match[1].toLowerCase(), lock: locking === 'FOR UPDATE' ? 'X' : locking ? 'S' : null };
    }
    if ((match = text.match(/^UPDATE\s+accounts\s+SET\s+balance\s*=\s*(?:(balance)\s*([+-])\s*)?(\d+)\s+WHERE\s+id\s*=\s*(\d+)$/i))) {
      return { kind: 'write', id: +match[4], amount: +match[3], relative: match[1] ? match[2] : null, lock: 'X' };
    }
    throw new Error('Simulatorは1文ずつ実行します。対応: BEGIN / COMMIT / ROLLBACK、accountsのid等価条件によるSELECT（任意でFOR UPDATE / FOR SHARE）、balanceの数値代入・加減算。その他のSQLはSQL Sandboxで実行してください。');
  }
  class TransactionSimulator {
    constructor() { this.reset(); }
    reset() {
      this.store = new L.VersionStore();
      this.locks = new L.LockManager();
      this.sessions = { A: session('A'), B: session('B') };
      this.sequence = 0;
      this.log = [];
    }
    record(name, message) { this.log.push({ n: this.log.length + 1, name, message }); }
    setLevel(name, level) {
      if (!L.isolationLevels.includes(level)) throw new Error('不明なIsolation Levelです。');
      const tx = this.sessions[name];
      if (['ACTIVE','WAITING'].includes(tx.status)) throw new Error('Isolation LevelはBEGIN前に選択してください。');
      tx.level = level;
    }
    begin(name) {
      const previous = this.sessions[name];
      if (['ACTIVE','WAITING'].includes(previous.status)) throw new Error('既に開始済みです。');
      const tx = session(name, previous.level);
      Object.assign(tx, { id: name + '#' + (++this.sequence), status: 'ACTIVE', startedAt: new Date().toISOString(), last: 'BEGIN · Snapshotは最初の一貫性読み取り時に作成' });
      this.sessions[name] = tx;
      this.record(name, tx.last);
    }
    finish(name, commit) {
      const tx = this.sessions[name];
      if (!['ACTIVE','WAITING'].includes(tx.status)) throw new Error('まずBEGINしてください。');
      if (commit && tx.status === 'WAITING') throw new Error('待機中はCOMMITできません。相手の終了を待つかROLLBACKしてください。');
      if (commit) this.store.commit(tx);
      tx.status = commit ? 'COMMITTED' : 'ROLLED BACK';
      tx.last = commit ? 'COMMIT · 全更新を一括で確定し、Lockを解放' : 'ROLLBACK · 全未確定更新を破棄し、Lockを解放';
      tx.writes.clear(); tx.pending = null;
      this.locks.release(name);
      this.record(name, tx.last);
      this.wake();
    }
    execute(name, sql) {
      const op = command(sql);
      if (op.kind === 'begin') return this.begin(name);
      if (op.kind === 'commit' || op.kind === 'rollback') return this.finish(name, op.kind === 'commit');
      const tx = this.sessions[name];
      if (tx.status !== 'ACTIVE') throw new Error(tx.status === 'WAITING' ? '待機中です。保持者のCOMMIT / ROLLBACKで自動再開します。' : 'まずBEGINしてください。');
      if (![1, 2].includes(op.id)) throw new Error('Simulatorの行はaccounts.id = 1 / 2です。存在しない行のgap lockは対象外です。');
      if (op.kind === 'write' && !Number.isSafeInteger(op.amount)) throw new Error('金額は安全な整数の範囲で入力してください。');
      op.sql = sql;
      this.apply(tx, op);
    }
    apply(tx, op) {
      const lock = op.lock || (tx.level === 'SERIALIZABLE' ? 'S' : null);
      if (lock && !this.locks.acquire(tx.name, 'accounts:' + op.id, lock)) {
        tx.status = 'WAITING'; tx.pending = op;
        tx.last = 'WAITING · accounts:' + op.id + ' の ' + lock + ' LOCKを待機';
        this.record(tx.name, tx.last);
        return;
      }
      tx.status = 'ACTIVE'; tx.pending = null;
      if (op.kind === 'write') {
        const current = tx.writes.has(op.id) ? tx.writes.get(op.id) : this.store.read(op.id).balance;
        const balance = op.relative ? current + (op.relative === '+' ? op.amount : -op.amount) : op.amount;
        if (!Number.isSafeInteger(balance) || balance < 0) {
          tx.last = 'UPDATE失敗: balanceは0以上の安全な整数です。取得済みLockはTx終了まで保持します。';
          this.record(tx.name, tx.last);
          throw new Error(tx.last);
        }
        tx.writes.set(op.id, balance);
        tx.last = 'UPDATE accounts:' + op.id + ' · ' + current + ' → ' + balance + '（未コミット / X LOCK）';
      } else {
        const visible = L.readVisible(this, tx, op.id, !!lock);
        tx.visible.set(op.id, visible);
        tx.last = 'SELECT accounts:' + op.id + ' → ' + (op.column === 'id' ? op.id : op.column === '*' ? 'id=' + op.id + ', balance=' + visible.balance : visible.balance) + ' · Version ' + visible.version + ' / ' + visible.reason;
      }
      this.record(tx.name, tx.last);
    }
    wake() {
      for (const name of [...this.locks.waiters.keys()]) {
        const tx = this.sessions[name], op = tx.pending;
        if (!op) continue;
        const lock = op.lock || 'S';
        if (!this.locks.blockers(name, 'accounts:' + op.id, lock).length) {
          this.record(name, 'Lock解放を検知 → 待機していたSQLを自動再開');
          try { this.apply(tx, op); } catch (_) { /* The failed statement is logged; the transaction remains active. */ }
        }
      }
    }
    state() { const edges = this.locks.edges(); return { sessions: this.sessions, locks: this.locks.rows(), waits: [...this.locks.waiters.values()], edges, cycle: L.detectCycle(edges), versions: this.store.versions, clock: this.store.clock, log: this.log }; }
  }
  L.TransactionSimulator = TransactionSimulator;
})(window.SQLLab);
