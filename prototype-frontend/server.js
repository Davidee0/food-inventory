// The web server: it serves the page in public/ and the data API the page talks to.
const express = require('express');
const { db } = require('./db');
const { today, isDate, statusOf } = require('./dates');

const app = express();
app.use(express.json()); // turns a JSON request body into req.body
app.use(express.static(__dirname + '/public'));

const LOCATIONS = ['Fridge', 'Freezer', 'Pantry'];
const blank = (v) => v === undefined || v === null || v === ''; // "not given"
const nameOf = (body) => (body && typeof body.name === 'string' ? body.name.trim() : ''); // trim first: only spaces counts as empty

// ---------- Categories: look-ups and the name rule ----------
const CATEGORIES = 'SELECT c.id, c.name, COUNT(i.id) AS item_count FROM categories c LEFT JOIN items i ON i.category_id = c.id';
const oneCategory = (id) => db.prepare(CATEGORIES + ' WHERE c.id = ? GROUP BY c.id').get(id);

// Returns [status, body] when the name is not allowed, otherwise nothing. ownId is the category being renamed.
function badCategory(name, ownId) {
  if (name.length < 1 || name.length > 30) return [400, { errors: { name: 'Name must be 1 to 30 characters.' } }];
  // Compare in lower case in code: SQLite's NOCASE only knows A to Z, so it treats Æ and æ as different.
  const clash = db.prepare('SELECT id, name FROM categories').all().find((c) => c.id !== ownId && c.name.toLowerCase() === name.toLowerCase());
  if (clash) return [409, { error: `A category called "${clash.name}" already exists.` }];
}

// ---------- Items: the rules ----------
const ITEMS = 'SELECT i.*, c.name AS category_name FROM items i LEFT JOIN categories c ON c.id = i.category_id';
const withStatus = (row) => ({ ...row, status: statusOf(row.best_before) });
const oneItem = (id) => { const row = db.prepare(ITEMS + ' WHERE i.id = ?').get(id); return row && withStatus(row); };

// Returns { errors } (one message per field) or { item }, ready to save.
function checkItem(b = {}) {
  const errors = {};
  const name = nameOf(b), now = today();
  const bought = blank(b.purchase_date) ? now : b.purchase_date;
  const best = blank(b.best_before) ? null : b.best_before;
  const category = blank(b.category_id) ? null : b.category_id;
  const quantity = b.quantity === undefined ? 1 : b.quantity;
  if (name.length < 1 || name.length > 50) errors.name = 'Name must be 1 to 50 characters.';
  if (!LOCATIONS.includes(b.location)) errors.location = 'Choose Fridge, Freezer or Pantry.';
  if (!isDate(bought)) errors.purchase_date = 'Enter a real date, like 2026-10-15.';
  else if (bought > now) errors.purchase_date = 'Purchase date cannot be in the future.';
  if (best !== null && !isDate(best)) errors.best_before = 'Enter a real date, like 2026-10-15.';
  else if (best !== null && !errors.purchase_date && best < bought) errors.best_before = 'Best before cannot be earlier than the purchase date.';
  if (category !== null && !(Number.isInteger(category) && oneCategory(category))) errors.category_id = 'Choose a category from the list.';
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) errors.quantity = 'Quantity must be a whole number from 1 to 999.';
  if (Object.keys(errors).length) return { errors };
  return { item: { name, location: b.location, purchase_date: bought, best_before: best, category_id: category, quantity } };
}

// ---------- Items: create (POST), read (GET), update (PUT), delete (DELETE) ----------
app.get('/locations', (req, res) => res.json(LOCATIONS));

app.get('/items', (req, res) => { // no date goes last: "best_before IS NULL" is 1 for those rows
  res.json(db.prepare(ITEMS + ' ORDER BY i.best_before IS NULL, i.best_before, i.name COLLATE NOCASE').all().map(withStatus));
});

app.post('/items', (req, res) => {
  const { errors, item } = checkItem(req.body);
  if (errors) return res.status(400).json({ errors });
  const { lastInsertRowid } = db.prepare(`INSERT INTO items (name, location, purchase_date, best_before, category_id, quantity)
    VALUES (@name, @location, @purchase_date, @best_before, @category_id, @quantity)`).run(item);
  res.status(201).json(oneItem(lastInsertRowid));
});

app.put('/items/:id', (req, res) => {
  if (!oneItem(req.params.id)) return res.status(404).json({ error: 'Item not found.' });
  const { errors, item } = checkItem(req.body);
  if (errors) return res.status(400).json({ errors });
  db.prepare(`UPDATE items SET name = @name, location = @location, purchase_date = @purchase_date, best_before = @best_before,
    category_id = @category_id, quantity = @quantity WHERE id = @id`).run({ ...item, id: req.params.id });
  res.json(oneItem(req.params.id));
});

app.delete('/items/:id', (req, res) => {
  if (!oneItem(req.params.id)) return res.status(404).json({ error: 'Item not found.' });
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// ---------- Categories: the same four operations ----------
app.get('/categories', (req, res) => {
  res.json(db.prepare(CATEGORIES + ' GROUP BY c.id').all().sort((a, b) => a.name.localeCompare(b.name, 'da')));
});

app.post('/categories', (req, res) => {
  const name = nameOf(req.body), bad = badCategory(name, 0);
  if (bad) return res.status(bad[0]).json(bad[1]);
  res.status(201).json(oneCategory(db.prepare('INSERT INTO categories (name) VALUES (?)').run(name).lastInsertRowid));
});

app.put('/categories/:id', (req, res) => {
  const id = Number(req.params.id), name = nameOf(req.body);
  if (!oneCategory(id)) return res.status(404).json({ error: 'Category not found.' });
  const bad = badCategory(name, id); // a rename may change only the case, so it must not clash with itself
  if (bad) return res.status(bad[0]).json(bad[1]);
  db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
  res.json(oneCategory(id));
});

app.delete('/categories/:id', (req, res) => {
  const c = oneCategory(Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'Category not found.' });
  // Count first, so the message can say how many items use it. The foreign key is the safety net behind this check.
  if (c.item_count > 0) return res.status(409).json({ error: `"${c.name}" is used by ${c.item_count} item${c.item_count === 1 ? '' : 's'} and cannot be deleted.`, item_count: c.item_count });
  db.prepare('DELETE FROM categories WHERE id = ?').run(c.id);
  res.status(204).end();
});

app.use((err, req, res, next) => {
  if (!err.status) console.error(err); // not the caller's fault, so show it in the terminal
  res.status(err.status || 500).json({ error: err.status ? 'Invalid request.' : 'Server error.' });
});

const PORT = process.env.PORT || 3000; // hosts tell the app which port to use through PORT
app.listen(PORT, () => console.log('Food inventory: http://localhost:' + PORT));
