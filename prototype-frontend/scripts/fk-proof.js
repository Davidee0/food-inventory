// Proof that the database itself refuses to delete a category that items still use.
// Run it with: node scripts/fk-proof.js   (nothing is changed: the second part is rolled back)
const { db } = require('../db');

const used = db.prepare(
  'SELECT c.id, c.name FROM categories c WHERE EXISTS (SELECT 1 FROM items i WHERE i.category_id = c.id) LIMIT 1'
).get();
console.log('Trying to delete the category "' + used.name + '", which items still use.');

// 1. Foreign keys ON (what server.js and db.js do): the database says no.
try {
  db.prepare('DELETE FROM categories WHERE id = ?').run(used.id);
  console.log('FAIL: the database allowed it');
  process.exit(1);
} catch (e) {
  console.log('PASS  foreign_keys ON: refused with "' + e.message + '"');
}

// 2. For comparison: foreign keys OFF. The same delete goes through, and the items point at a category that is gone.
db.exec('PRAGMA foreign_keys = OFF'); // must be set outside a transaction
db.exec('BEGIN');
const changes = db.prepare('DELETE FROM categories WHERE id = ?').run(used.id).changes;
db.exec('ROLLBACK'); // undo it, so the data stays as it was
db.exec('PRAGMA foreign_keys = ON');
console.log((changes === 1 ? 'PASS' : 'FAIL') + '  foreign_keys OFF: the same delete succeeds (rolled back now), which is why the app switches it on');
