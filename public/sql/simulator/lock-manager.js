(function (L) {
  'use strict';
  class LockManager {
    constructor() { this.holders = new Map(); this.waiters = new Map(); }
    blockers(owner, resource, type) {
      const blockers = new Set();
      for (const lock of this.holders.get(resource) || []) {
        if (lock.owner !== owner && (type === 'X' || lock.type === 'X')) blockers.add(lock.owner);
      }
      // Do not overtake an earlier conflicting waiter; upgrades keep their S lock.
      for (const wait of this.waiters.values()) {
        if (wait.owner === owner) break;
        if (wait.resource === resource && (type === 'X' || wait.type === 'X')) blockers.add(wait.owner);
      }
      return [...blockers];
    }
    acquire(owner, resource, type) {
      const locks = this.holders.get(resource) || [];
      const held = locks.find(lock => lock.owner === owner);
      if (held && (held.type === 'X' || type === 'S')) return true;
      if (this.blockers(owner, resource, type).length) {
        this.waiters.set(owner, { owner, resource, type });
        return false;
      }
      if (held) held.type = type;
      else locks.push({ owner, resource, type });
      this.holders.set(resource, locks);
      this.waiters.delete(owner);
      return true;
    }
    release(owner) {
      this.waiters.delete(owner);
      for (const [resource, locks] of this.holders) {
        const remaining = locks.filter(lock => lock.owner !== owner);
        if (remaining.length) this.holders.set(resource, remaining);
        else this.holders.delete(resource);
      }
    }
    rows() { return [...this.holders.values()].flat(); }
    edges() { return [...this.waiters.values()].flatMap(wait => this.blockers(wait.owner, wait.resource, wait.type).map(to => ({ from: wait.owner, to, resource: wait.resource }))); }
  }
  L.LockManager = LockManager;
})(window.SQLLab);
