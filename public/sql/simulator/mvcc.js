(function (L) {
  'use strict';
  class VersionStore {
    constructor() {
      this.clock = 0;
      this.versions = new Map([1, 2].map(id => [id, [{ version: 0, balance: 10000, creator: 'seed' }]]));
    }
    read(id, snapshot = this.clock) {
      return [...(this.versions.get(id) || [])].reverse().find(v => v.version <= snapshot);
    }
    commit(transaction) {
      if (!transaction.writes.size) return;
      this.clock++;
      for (const [id, balance] of transaction.writes) this.versions.get(id).push({ version: this.clock, balance, creator: transaction.id });
    }
  }
  L.VersionStore = VersionStore;
})(window.SQLLab);
