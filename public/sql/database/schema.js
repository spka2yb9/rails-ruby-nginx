(function (L) {
  'use strict';
  L.schema = `
    PRAGMA foreign_keys = ON;
    CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE users (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
      age INTEGER NOT NULL, department_id INTEGER REFERENCES departments(id),
      created_at TEXT NOT NULL DEFAULT '2026-01-01'
    );
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
      amount INTEGER NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT '2026-01-01'
    );
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
      balance INTEGER NOT NULL CHECK (balance >= 0)
    );`;
})(window.SQLLab);
