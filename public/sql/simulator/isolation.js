(function (L) {
  'use strict';
  L.isolationLevels = ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'];
  L.readVisible = function (sim, tx, id, locking) {
    if (tx.writes.has(id)) return { balance: tx.writes.get(id), version: 'pending', creator: tx.id, reason: '自分の未コミット更新' };
    if (!locking && tx.level === 'READ UNCOMMITTED') {
      const dirty = Object.values(sim.sessions).find(other => other !== tx && other.writes.has(id));
      if (dirty) return { balance: dirty.writes.get(id), version: 'pending', creator: dirty.id, reason: 'Dirty Read · 他Txの未コミット更新' };
    }
    let snapshot = sim.store.clock;
    if (!locking && tx.level === 'REPEATABLE READ') {
      if (tx.snapshot === null) tx.snapshot = sim.store.clock;
      snapshot = tx.snapshot;
    }
    const version = sim.store.read(id, snapshot);
    return { ...version, reason: locking ? 'Locking Read · 最新の確定版' : tx.level === 'REPEATABLE READ' ? '最初の一貫性読み取り時のSnapshot' : '文ごとの最新の確定版' };
  };
})(window.SQLLab);
