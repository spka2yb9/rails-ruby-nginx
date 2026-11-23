(function (L) {
  'use strict';
  const quote = name => '"' + String(name).replace(/"/g, '""') + '"';
  class SqlEngine {
    async init() {
      this.SQL = await window.initSqlJs();
      this.reset();
      return this;
    }
    reset() {
      if (this.db) this.db.close();
      this.db = new this.SQL.Database();
      this.db.run(L.schema);
      L.seed(this.db);
    }
    execute(sql) {
      if (!sql.trim()) throw new Error('SQLを入力してください。');
      const results = [];
      const started = performance.now();
      try {
        for (const statement of this.db.iterateStatements(sql)) {
          try {
            const columns = statement.getColumnNames();
            const values = [];
            let truncated = false;
            while (statement.step()) {
              if (values.length === 200) { truncated = true; break; }
              values.push(statement.get());
            }
            results.push({ sql: statement.getSQL(), columns, values, truncated, changes: this.db.getRowsModified() });
          } finally { statement.free(); }
        }
      } catch (error) {
        error.partialResults = results;
        throw error;
      }
      return { results, elapsed: performance.now() - started };
    }
    query(sql, params) {
      const statement = this.db.prepare(sql);
      try {
        if (params) statement.bind(params);
        const result = { columns: statement.getColumnNames(), values: [] };
        while (statement.step()) result.values.push(statement.get());
        return result;
      } finally { statement.free(); }
    }
    explain(sql) { return this.query('EXPLAIN QUERY PLAN ' + sql); }
    getTables() { return this.query("SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name"); }
    getSchema(name) { return this.query('PRAGMA table_info(' + quote(name) + ')'); }
    getIndexes() { return this.query("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'index' ORDER BY name"); }
    generate(count) {
      if (![100, 1000, 10000].includes(count)) throw new Error('生成件数は100 / 1,000 / 10,000件です。');
      const existing = this.query('SELECT COUNT(*) FROM users').values[0][0];
      if (existing + count > 20000) throw new Error('教材の上限は20,000行です。サンプルDBを初期化してください。');
      this.db.run('SAVEPOINT generate_users');
      let statement;
      try {
        statement = this.db.prepare('INSERT INTO users (name, email, age, department_id) VALUES (?, ?, ?, NULL)');
        for (let i = 0; i < count; i++) statement.run(['User ' + (existing + i + 1), 'user' + (existing + i + 1) + '@example.com', 18 + i % 50]);
        this.db.run('RELEASE generate_users');
      } catch (error) {
        this.db.run('ROLLBACK TO generate_users; RELEASE generate_users');
        throw error;
      } finally { if (statement) statement.free(); }
    }
  }
  L.SqlEngine = SqlEngine;
  L.quoteIdentifier = quote;
})(window.SQLLab);
