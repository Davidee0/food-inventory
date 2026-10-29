// The database: tables, example data, and the reset.
const { DatabaseSync } = require('node:sqlite'); // built into Node 22.13 or newer
const { today, addDays } = require('./dates');

const db = new DatabaseSync(process.env.DB_FILE || __dirname + '/food.db');
db.exec('PRAGMA foreign_keys = ON'); // SQLite only enforces foreign keys when this is on, for each connection

function reset() {
  const t = today();
  db.exec(`
    DROP TABLE IF EXISTS items; DROP TABLE IF EXISTS categories;
    CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);
    CREATE TABLE items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, location TEXT NOT NULL,
      purchase_date TEXT NOT NULL, best_before TEXT,
      category_id INTEGER REFERENCES categories(id), -- the foreign key: the database refuses to delete a used category
      quantity INTEGER NOT NULL DEFAULT 1
    );
    INSERT INTO categories (name) VALUES ('Dairy'), ('Vegetables'), ('Fruit'), ('Meat and fish'), ('Drinks'), ('Other');
  `);
  // Dates relative to today: one past, one within 3 days, three later, one with none. Category ids: 1 Dairy, 2 Vegetables, 4 Meat and fish, 6 Other.
  const add = db.prepare('INSERT INTO items (name, location, purchase_date, best_before, category_id, quantity) VALUES (?, ?, ?, ?, ?, ?)');
  add.run('Milk', 'Fridge', addDays(t, -3), addDays(t, -1), 1, 1);
  add.run('Yogurt', 'Fridge', addDays(t, -2), addDays(t, 2), 1, 4);
  add.run('Frozen peas', 'Freezer', addDays(t, -30), addDays(t, 120), 2, 2);
  add.run('Chicken breast', 'Freezer', addDays(t, -10), addDays(t, 60), 4, 1);
  add.run('Pasta', 'Pantry', addDays(t, -20), addDays(t, 200), 6, 3);
  add.run('Rice', 'Pantry', addDays(t, -40), null, null, 1);
}

// A brand-new database file has no tables yet, so it gets them and the example data on first start.
if (!db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'items'").get()) reset();

module.exports = { db, reset };
