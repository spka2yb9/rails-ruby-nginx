(function (L) {
  'use strict';
  L.seed = function (db) {
    db.run(`INSERT INTO departments VALUES (1, 'Engineering'), (2, 'Sales'), (3, 'Design');
      INSERT INTO users (id, name, email, age, department_id) VALUES
      (1, 'Alice', 'alice@example.com', 20, 1), (2, 'Bob', 'bob@example.com', 24, 1),
      (3, 'Carol', 'carol@example.com', 19, 2), (4, 'Dave', 'dave@example.com', 32, 2),
      (5, 'Eve', 'eve@example.com', 28, 2), (6, 'Frank', 'frank@example.com', 20, 1),
      (7, 'Grace', 'grace@example.com', 35, 3), (8, 'Hana', 'hana@example.com', 17, NULL);
      INSERT INTO orders (id, user_id, amount, status) VALUES
      (1, 1, 15000, 'paid'), (2, 1, 3000, 'pending'), (3, 2, 8000, 'paid'),
      (4, 3, 20000, 'paid'), (5, 5, 12000, 'pending'), (6, 5, 4000, 'paid');
      INSERT INTO accounts VALUES (1, 1, 10000), (2, 2, 10000), (3, 3, 8000);`);
  };
})(window.SQLLab);
