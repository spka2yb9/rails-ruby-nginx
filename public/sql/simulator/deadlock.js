(function (L) {
  'use strict';
  L.detectCycle = function (edges) {
    const adjacency = new Map();
    edges.forEach(({ from, to }) => adjacency.set(from, [...(adjacency.get(from) || []), to]));
    function visit(node, path) {
      if (path.includes(node)) return [...path.slice(path.indexOf(node)), node];
      for (const next of adjacency.get(node) || []) { const cycle = visit(next, [...path, node]); if (cycle) return cycle; }
      return null;
    }
    for (const node of adjacency.keys()) { const cycle = visit(node, []); if (cycle) return cycle; }
    return null;
  };
})(window.SQLLab);
