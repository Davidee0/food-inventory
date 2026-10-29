// API contract for the Food Inventory App.
//   node scripts/check.js [gate]    gate 0 to 4, default 4: checks gates 0 up to that one
// Start the server first (npm start). This script runs `npm run reset` itself, so every run
// starts from the 6 example items. The contract is the field names and status codes below.
// Never edit this file to make a check pass.
const { execSync } = require('child_process');

const BASE = process.env.BASE || 'http://localhost:3000';
const GATE = Number(process.argv[2] === undefined ? 4 : process.argv[2]);
let passed = 0;
let failed = 0;

function check(label, ok, detail) {
  if (ok) { passed++; console.log('PASS  ' + label); }
  else { failed++; console.log('FAIL  ' + label + (detail ? '  (' + detail + ')' : '')); }
}

// Send one request. Returns { status, body } where body is the parsed JSON (or null).
async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { /* the body was not JSON */ }
  return { status: res.status, body: json };
}

// Send one request and check its status code.
async function expectStatus(label, status, method, path, body) {
  const r = await call(method, path, body);
  check(label, r.status === status, 'expected ' + status + ', got ' + r.status);
  return r;
}

// The date n days from today in Copenhagen, worked out in a different way than the app does it.
function day(n) {
  const t = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
  const d = new Date(t + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const ITEM_FIELDS = ['id', 'name', 'location', 'purchase_date', 'best_before', 'category_id', 'quantity'];

async function gate0() {
  const loc = await expectStatus('GET /locations', 200, 'GET', '/locations');
  check('the locations are Fridge, Freezer and Pantry', JSON.stringify(loc.body) === '["Fridge","Freezer","Pantry"]');

  const r = await expectStatus('GET /items', 200, 'GET', '/items');
  const items = Array.isArray(r.body) ? r.body : [];
  check('6 example items', items.length === 6, 'got ' + items.length);
  check('two example items per location', ['Fridge', 'Freezer', 'Pantry'].every((l) => items.filter((i) => i.location === l).length === 2));
  check('every item has id, name, location, purchase_date, best_before, category_id and quantity',
    items.length > 0 && items.every((i) => ITEM_FIELDS.every((k) => k in i)));
  const dated = items.filter((i) => i.best_before);
  check('soonest best before first', dated.every((i, k) => k === 0 || dated[k - 1].best_before <= i.best_before));
  check('exactly one example has no best before date, and it is last',
    items.filter((i) => !i.best_before).length === 1 && items.length > 0 && !items[items.length - 1].best_before);
  check('example dates are relative to today: one past, one within 3 days, three later',
    dated.filter((i) => i.best_before < day(0)).length === 1 &&
    dated.filter((i) => i.best_before >= day(0) && i.best_before <= day(3)).length === 1 &&
    dated.filter((i) => i.best_before > day(3)).length === 3);
}

async function gate1() {
  const ok = { name: 'Check milk', location: 'Fridge' };
  const made = []; // ids to delete at the end

  let r = await expectStatus('POST /items with only a name and a location', 201, 'POST', '/items', ok);
  const id = r.body && r.body.id;
  made.push(id);
  check('purchase date defaults to today and quantity to 1', !!r.body && r.body.purchase_date === day(0) && r.body.quantity === 1);

  r = await expectStatus('POST /items trims the name', 201, 'POST', '/items', { ...ok, name: '  Check trim  ' });
  check('the saved name has no spaces around it', !!r.body && r.body.name === 'Check trim');
  made.push(r.body && r.body.id);

  r = await expectStatus('POST /items accepts a best before date in the past', 201, 'POST', '/items', { ...ok, purchase_date: day(-5), best_before: day(-1) });
  made.push(r.body && r.body.id);

  const bad = [
    ['an empty name', { ...ok, name: '' }],
    ['a name of only spaces', { ...ok, name: '   ' }],
    ['a name over 50 characters', { ...ok, name: 'x'.repeat(51) }],
    ['a missing location', { name: 'Check' }],
    ['an unknown location', { ...ok, location: 'Garage' }],
    ['a purchase date in the future', { ...ok, purchase_date: day(1) }],
    ['a purchase date that does not exist', { ...ok, purchase_date: '2026-02-30' }],
    ['a best before date earlier than the purchase date', { ...ok, purchase_date: day(0), best_before: day(-1) }],
    ['quantity 0', { ...ok, quantity: 0 }],
    ['quantity 1000', { ...ok, quantity: 1000 }],
    ['quantity 1.5', { ...ok, quantity: 1.5 }],
    ['a category that does not exist', { ...ok, category_id: 999999 }],
  ];
  for (const [label, body] of bad) {
    r = await call('POST', '/items', body);
    check('POST /items rejects ' + label + ' with 400 and errors', r.status === 400 && !!r.body && !!r.body.errors && Object.keys(r.body.errors).length > 0, 'got ' + r.status);
  }
  r = await call('POST', '/items', { name: '', location: 'Garage' });
  check('400 gives one message per field (errors.name and errors.location)',
    r.status === 400 && !!r.body && !!r.body.errors && 'name' in r.body.errors && 'location' in r.body.errors);

  r = await call('GET', '/items');
  check('GET /items lists the new item', Array.isArray(r.body) && r.body.some((i) => i.id === id));

  r = await expectStatus('PUT /items/:id', 200, 'PUT', '/items/' + id, { ...ok, name: 'Check milk 2', quantity: 3 });
  check('PUT returns the updated item', !!r.body && r.body.name === 'Check milk 2' && r.body.quantity === 3);
  await expectStatus('PUT with invalid data gives 400', 400, 'PUT', '/items/' + id, { ...ok, name: '' });
  await expectStatus('PUT to an unknown id gives 404', 404, 'PUT', '/items/999999', ok);

  await expectStatus('DELETE /items/:id gives 204', 204, 'DELETE', '/items/' + id);
  await expectStatus('DELETE it again gives 404', 404, 'DELETE', '/items/' + id);
  for (const other of made.slice(1)) await call('DELETE', '/items/' + other);
}

async function gate2() {
  let r = await expectStatus('GET /categories', 200, 'GET', '/categories');
  const cats = Array.isArray(r.body) ? r.body : [];
  check('6 seeded categories, each with id, name and item_count', cats.length === 6 && cats.every((c) => 'id' in c && 'name' in c && 'item_count' in c));
  check('the seeded names are Dairy, Vegetables, Fruit, Meat and fish, Drinks and Other',
    JSON.stringify(cats.map((c) => c.name).sort()) === JSON.stringify(['Dairy', 'Drinks', 'Fruit', 'Meat and fish', 'Other', 'Vegetables']));
  const dairy = cats.find((c) => c.name === 'Dairy');
  check('Dairy is used by 2 of the example items', !!dairy && dairy.item_count === 2);

  r = await expectStatus('POST /categories', 201, 'POST', '/categories', { name: 'Snacks' });
  const snacks = r.body && r.body.id;
  await expectStatus('POST a duplicate name, ignoring case, gives 409', 409, 'POST', '/categories', { name: 'snacks' });
  await expectStatus('POST a name of only spaces gives 400', 400, 'POST', '/categories', { name: '   ' });
  await expectStatus('POST a name over 30 characters gives 400', 400, 'POST', '/categories', { name: 'x'.repeat(31) });
  r = await expectStatus('POST "Æble"', 201, 'POST', '/categories', { name: 'Æble' });
  const aeble = r.body && r.body.id;
  await expectStatus('POST "æble" is a duplicate of "Æble" (409)', 409, 'POST', '/categories', { name: 'æble' });

  r = await expectStatus('PUT /categories/:id renames', 200, 'PUT', '/categories/' + snacks, { name: 'Sweets' });
  check('PUT returns the renamed category', !!r.body && r.body.name === 'Sweets');
  await expectStatus('PUT may change only the case (Sweets to SWEETS)', 200, 'PUT', '/categories/' + snacks, { name: 'SWEETS' });
  await expectStatus('PUT to the name of another category gives 409', 409, 'PUT', '/categories/' + snacks, { name: 'dairy' });
  await expectStatus('PUT with an empty name gives 400', 400, 'PUT', '/categories/' + snacks, { name: '' });
  await expectStatus('PUT to an unknown id gives 404', 404, 'PUT', '/categories/999999', { name: 'Nope' });

  r = await expectStatus('POST an item that uses the category', 201, 'POST', '/items', { name: 'Check candy', location: 'Pantry', category_id: snacks });
  const candy = r.body && r.body.id;
  check('the item shows its category_name', !!r.body && r.body.category_name === 'SWEETS');
  r = await expectStatus('DELETE a category that an item uses gives 409', 409, 'DELETE', '/categories/' + snacks);
  check('the 409 body has item_count 1', !!r.body && r.body.item_count === 1);
  await expectStatus('DELETE the seeded Dairy category (used by 2 items) gives 409', 409, 'DELETE', '/categories/' + (dairy ? dairy.id : 0));
  await expectStatus('DELETE the item', 204, 'DELETE', '/items/' + candy);
  await expectStatus('DELETE the now unused category gives 204', 204, 'DELETE', '/categories/' + snacks);
  await expectStatus('DELETE it again gives 404', 404, 'DELETE', '/categories/' + snacks);
  await call('DELETE', '/categories/' + aeble);
}

async function gate3() {
  // Quantity limits are checked in gate 1. The filters and the plus and minus buttons run in the browser.
  console.log('      (no API checks: quantity limits are in gate 1, filters run in the browser)');
}

async function gate4() {
  const made = [];
  const cases = [['yesterday', -1, 'past'], ['today', 0, 'soon'], ['today + 3 days', 3, 'soon'], ['today + 4 days', 4, null]];
  for (const [label, n, expected] of cases) {
    const r = await call('POST', '/items', { name: 'Check ' + label, location: 'Fridge', purchase_date: day(-10), best_before: day(n) });
    check('best before ' + label + ' has status ' + expected, !!r.body && r.body.status === expected, 'got ' + (r.body && r.body.status));
    if (r.body) made.push(r.body.id);
  }
  let r = await call('POST', '/items', { name: 'Check no date', location: 'Fridge' });
  check('no best before date means no status', !!r.body && r.body.status === null);
  if (r.body) made.push(r.body.id);
  for (const id of made) await call('DELETE', '/items/' + id);

  r = await call('GET', '/items');
  const list = Array.isArray(r.body) ? r.body : [];
  check('the example items have one "past" and one "soon"',
    list.filter((i) => i.status === 'past').length === 1 && list.filter((i) => i.status === 'soon').length === 1);
}

async function main() {
  try {
    execSync('npm run reset --silent', { stdio: 'inherit' });
  } catch (e) {
    check('npm run reset works', false, 'add the reset command to package.json');
    return;
  }
  const gates = [gate0, gate1, gate2, gate3, gate4];
  for (let g = 0; g <= GATE && g < gates.length; g++) {
    console.log('--- gate ' + g);
    await gates[g]();
  }
}

main()
  .catch((e) => check('the server answers on ' + BASE, false, e.cause ? e.cause.code : e.message))
  .finally(() => {
    console.log('\n' + passed + ' passed, ' + failed + ' failed');
    process.exit(failed > 0 ? 1 : 0);
  });
