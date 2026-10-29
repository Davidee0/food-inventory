// U8 food inventory: the page's code. It keeps the server's data in variables and redraws from them.
const $ = (id) => document.getElementById(id);
let items = [], categories = [], locations = [], editingId = null; // editingId is null while adding
const filters = { search: '' };
const FIELDS = ['name', 'location', 'purchase_date', 'best_before', 'category_id', 'quantity'];
const SHAPES = ['carton', 'bowl', 'loaf', 'block', 'circle', 'arch', 'box', 'cup']; // outlines for the items, picked by item id
const NO_CATEGORY = 'No category';

// Icons are fixed drawings written here, never user text, so they may go in with innerHTML.
const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  list: '<path d="M8 6.5h12M8 12h12M8 17.5h12"/><circle cx="4" cy="6.5" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="17.5" r="1"/>',
  gear: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2 2M16.7 16.7l2 2M18.7 5.3l-2 2M7.3 16.7l-2 2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
  pencil: '<path d="M4 20l1.2-4.2L16.6 4.4a2 2 0 0 1 2.8 2.8L8 18.6z"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  tick: '<circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/>',
  warn: '<path d="M12 3.2L2.4 20h19.2z"/><path d="M12 9.6v4.6M12 17.1v.1"/>',
};
const svg = (name, size = 24) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${ICONS[name]}</svg>`;
function h(tag, className, text) { // make an element; textContent shows typed text as text, never as HTML
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

// Send a request. Returns { ok, status, data }. Status 0 means the server could not be reached.
async function api(method, path, body) {
  try {
    const res = await fetch(path, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
    return { ok: res.ok, status: res.status, data: res.status === 204 ? null : await res.json() };
  } catch (e) {
    return { ok: false, status: 0, data: null };
  }
}
const todayText = () => new Date().toLocaleDateString('sv-SE'); // this device's date as YYYY-MM-DD
const errorText = (r) => (r.data ? (r.data.errors || {}).name || r.data.error : 'Could not reach the server.');

// The bar at the bottom of the screen. With an undo function it shows an Undo button.
let toastTimer;
function say(text, undo) {
  clearTimeout(toastTimer);
  $('toast').hidden = !text;
  $('toast-text').textContent = text;
  $('toast-undo').hidden = !undo;
  $('toast-undo').onclick = undo ? () => { say(''); undo(); } : null;
  if (text) toastTimer = setTimeout(() => say(''), undo ? 6000 : 3000);
}

// Only one screen shows at a time. Settings and the screens behind it have no active tab.
const VIEWS = ['items', 'form', 'eat', 'settings', 'user', 'categories'];
const TAB_OF = { items: 'items', form: 'form', eat: 'eat' };
let lastMain = 'items'; // where the back arrow in Settings goes
function show(view) {
  if (view === 'items' || view === 'eat') lastMain = view;
  VIEWS.forEach((v) => { $('view-' + v).hidden = v !== view; });
  document.querySelectorAll('.tab').forEach((b) => {
    const on = b.dataset.view === TAB_OF[view];
    b.classList.toggle('active', on);
    b.setAttribute('aria-current', on ? 'page' : 'false');
  });
  say('');
  $('view-' + view).scrollTop = 0;
}

// Fill a <select> from [value, label] pairs. new Option(label, value) sets the text safely.
function fill(select, first, options) {
  select.replaceChildren(new Option(first, ''), ...options.map(([value, label]) => new Option(label, value)));
}

// After every change: ask the server for everything again and redraw. Simple, and never out of date.
async function load() {
  const [l, c, i] = await Promise.all(['/locations', '/categories', '/items'].map((path) => api('GET', path)));
  if (!(l.ok && c.ok && i.ok)) return state('The items could not be loaded. Check your connection.', 'Try again', load);
  [locations, categories, items] = [l.data, c.data, i.data];
  drawInventory(); drawEat(); drawCategories();
}

// ---------- Days left ----------
function daysLeft(bestBefore) { // whole days from today to the best before date, or null without a date
  if (!bestBefore) return null;
  const [y, m, d] = bestBefore.split('-').map(Number), [ty, tm, td] = todayText().split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
}
function leftText(item) {
  const n = daysLeft(item.best_before);
  if (n === null) return 'No expiry date';
  if (n < 0) return 'Expired';
  if (n === 0) return 'Today';
  return n + (n === 1 ? ' day left' : ' days left');
}
const shapeOf = (item) => SHAPES[item.id % SHAPES.length];
const slot = (item, className = '') => { // a fixed-width box, so the names line up whatever the shape
  const s = h('span', 'slot');
  s.append(h('span', 'shape ' + shapeOf(item) + className));
  return s;
};

// ---------- Inventory ----------
function state(text, label, onClick) { // the line under the list: empty, no match, or error
  $('state-text').textContent = text;
  $('state-btn').hidden = !label;
  $('state-btn').textContent = label || '';
  $('state-btn').onclick = onClick;
  $('list-state').hidden = !text;
}

// The search looks in the item name, the category name and the storage location.
function matches(item) {
  const q = filters.search.trim().toLowerCase();
  return !q || [item.name, item.category_name, item.location].some((t) => (t || '').toLowerCase().includes(q));
}

function drawInventory() {
  const warnings = items.filter((i) => i.status).length;
  $('item-count').textContent = items.length + (items.length === 1 ? ' item' : ' items') + (warnings ? ' · ' + warnings + ' expiring' : '');
  const shown = items.filter(matches);
  if (!items.length) state('No items yet. Tap "Add" and start with what you have at home.', 'Add item', () => openForm(null));
  else if (!shown.length) state('No items match', 'Clear search', () => { $('search').value = ''; filters.search = ''; drawInventory(); });
  else state('');
  const groups = [];
  for (const name of [...categories.map((c) => c.name), NO_CATEGORY]) {
    const rows = shown.filter((i) => (i.category_name || NO_CATEGORY) === name);
    if (!rows.length) continue;
    rows.sort((a, b) => Number(Boolean(b.status)) - Number(Boolean(a.status))); // expiring items first; the rest stay in the server's date order
    const head = h('div', 'cat-head');
    head.append(h('span', '', name), h('span', '', String(rows.length)));
    groups.push(head, ...rows.map(drawItem));
  }
  $('groups').replaceChildren(...groups);
}

function drawItem(item) {
  const b = h('button', 'irow' + (item.status ? ' warn' : '')), text = h('span', 'itext');
  b.type = 'button';
  b.setAttribute('aria-label', 'Edit ' + item.name + (item.status ? ', ' + leftText(item) : ''));
  text.append(h('strong', 'name', item.name), h('span', 'meta', [item.location, '×' + item.quantity, leftText(item)].join(' · ')));
  b.append(slot(item), text);
  if (item.status) { // the yellow warning sign: expiring within 3 days, or already expired
    const sign = h('span', 'warn-sign');
    sign.innerHTML = svg('warn', 28);
    b.append(sign);
  }
  const pencil = h('span', 'pencil');
  pencil.innerHTML = svg('pencil', 20);
  b.append(pencil);
  b.onclick = () => openForm(item);
  return b;
}

// ---------- The add / edit form ----------
function showErrors(errors) {
  FIELDS.forEach((f) => {
    $('e-' + f).textContent = errors[f] || '';
    $('f-' + f).setAttribute('aria-invalid', Boolean(errors[f]));
  });
}

function openForm(item) {
  editingId = item ? item.id : null;
  $('form-title').textContent = item ? 'Edit item' : 'Add new item';
  $('cta-label').textContent = item ? 'Save changes' : 'Add item';
  $('cta-icon').hidden = Boolean(item);
  fill($('f-location'), 'Choose a location', locations.map((l) => [l, l]));
  fill($('f-category_id'), 'No category', categories.map((c) => [c.id, c.name]));
  const start = { purchase_date: todayText(), quantity: 1, ...item }; // defaults for a new item, the item's own values when editing
  FIELDS.forEach((f) => { $('f-' + f).value = start[f] ?? ''; });
  $('f-purchase_date').max = todayText();
  $('btn-save-another').hidden = Boolean(item);
  $('btn-cancel').hidden = !item;
  showErrors({}); show('form'); $('f-name').focus();
}

function readForm() {
  const v = (f) => $('f-' + f).value;
  return { name: v('name').trim(), location: v('location'), purchase_date: v('purchase_date'), best_before: v('best_before') || null,
           category_id: v('category_id') ? Number(v('category_id')) : null, quantity: Number(v('quantity')) };
}

// The same rules as the server, so the person gets an answer at once. The server still checks everything,
// because anyone can send requests to it without using this page.
function check(b) {
  const e = {};
  if (b.name.length < 1 || b.name.length > 50) e.name = 'Name must be 1 to 50 characters.';
  if (!b.location) e.location = 'Choose Fridge, Freezer or Pantry.';
  if (!b.purchase_date) e.purchase_date = 'Enter the purchase date.';
  else if (b.purchase_date > todayText()) e.purchase_date = 'Purchase date cannot be in the future.';
  if (b.best_before && b.best_before < b.purchase_date) e.best_before = 'Expiry date cannot be earlier than the purchase date.';
  if (!Number.isInteger(b.quantity) || b.quantity < 1 || b.quantity > 999) e.quantity = 'Quantity must be a whole number from 1 to 999.';
  return e;
}

let saving = false; // true while a save is on its way, so a second tap does nothing
async function saveItem(addAnother) {
  const body = readForm(), errors = check(body);
  showErrors(errors);
  if (Object.keys(errors).length || saving) return;
  saving = true;
  try {
    const adding = editingId === null;
    const r = await api(adding ? 'POST' : 'PUT', adding ? '/items' : '/items/' + editingId, body);
    if (r.status === 400) return showErrors(r.data.errors); // the server has the last word
    if (!r.ok) return say('Could not save. Check your connection and try again.');
    await load();
    if (adding && addAnother) { openForm(null); $('f-location').value = body.location; } // next item, same location
    else show('items');
    say(r.data.name + (adding ? ' added' : ' saved'));
  } finally {
    saving = false; // allow the next save, however this one ended
  }
}

// ---------- Ate it ----------
function drawEat() {
  $('eat-empty').hidden = items.length > 0;
  $('eat-list').replaceChildren(...items.map(drawEatRow));
}

function drawEatRow(item) {
  const li = h('li', 'eat-row'), card = h('div', 'eat-card'), text = h('div', 'eat-text');
  const remove = h('button', 'remove-panel'), eaten = h('button', 'ate', 'Ate it');
  remove.type = eaten.type = 'button';
  const many = item.quantity > 1; // with several of them, "Ate it" takes one and the swipe panel takes all
  remove.innerHTML = svg('minus', 20) + '<span>' + (many ? 'Ate all' : 'Remove') + '</span>';
  remove.setAttribute('aria-label', (many ? 'Ate all ' + item.quantity + ' of ' : 'Remove ') + item.name);
  eaten.setAttribute('aria-label', many ? 'Ate one ' + item.name : 'Ate ' + item.name);
  eaten.onclick = () => ate(item.id, false);
  remove.onclick = () => ate(item.id, true);
  text.append(h('strong', 'name', item.name), h('p', 'meta', [item.category_name, many ? '×' + item.quantity : '', leftText(item)].filter(Boolean).join(' · ')));
  card.append(slot(item), text, eaten);
  li.append(remove, card);
  enableSwipe(card);
  return li;
}

// Taps are handled one after the other, each on the latest data, so five quick taps on "Ate it" take five items off.
let eatQueue = Promise.resolve();
const ate = (id, all) => { eatQueue = eatQueue.then(() => eatNow(id, all)); return eatQueue; };

const fieldsOf = ({ name, location, purchase_date, best_before, category_id, quantity }) => ({ name, location, purchase_date, best_before, category_id, quantity });

async function eatNow(id, all) {
  const item = items.find((i) => i.id === id);
  if (!item) return; // already gone
  const one = !all && item.quantity > 1; // one of several: lower the quantity. Otherwise the whole item goes.
  const r = one ? await api('PUT', '/items/' + id, { ...fieldsOf(item), quantity: item.quantity - 1 }) : await api('DELETE', '/items/' + id);
  if (!r.ok) return say('Could not update ' + item.name + '. Try again.');
  await load();
  say(one ? item.name + ': 1 eaten, ' + (item.quantity - 1) + ' left'
          : (item.quantity > 1 ? item.name + ': all ' + item.quantity + ' eaten' : item.name + ' eaten'), () => undoAte(item, one));
}

async function undoAte(item, one) { // gives back what the last tap took: the one item, or the whole item (which gets a new id)
  const r = one ? await api('PUT', '/items/' + item.id, fieldsOf(item)) : await api('POST', '/items', fieldsOf(item));
  if (!r.ok) return say('Could not undo. Add ' + item.name + ' again.');
  await load();
  say(item.name + ' is back');
}

// Swipe a card left to show the Remove panel behind it. Moves under 8 px still count as a tap.
function enableSwipe(card) {
  const WIDTH = 84;
  let startX = null, dragging = false, open = false, x = 0;
  const place = () => { card.style.transform = x ? `translateX(${x}px)` : ''; };
  card.addEventListener('pointerdown', (e) => { startX = e.clientX; dragging = false; });
  card.addEventListener('pointermove', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (!dragging && Math.abs(dx) > 8) { dragging = true; card.setPointerCapture(e.pointerId); card.style.transition = 'none'; }
    if (dragging) { x = Math.min(0, Math.max(-WIDTH, dx + (open ? -WIDTH : 0))); place(); }
  });
  const end = () => {
    if (startX === null) return;
    startX = null;
    if (!dragging) return;
    open = x < -WIDTH / 2; x = open ? -WIDTH : 0;
    card.style.transition = ''; place();
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
  card.addEventListener('click', (e) => { // a swipe must not also press the Ate it button; a tap on an open card closes it
    if (dragging) { dragging = false; e.stopPropagation(); e.preventDefault(); }
    else if (open) { open = false; x = 0; place(); e.stopPropagation(); e.preventDefault(); }
  }, true);
}

// ---------- User (opened from Settings) ----------
// The database has a users table (username, email). Until the API has a users route, the user is kept in this browser.
const USER_KEY = 'u8-user';
function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) || {}; } catch (e) { return {}; }
}
function saveUser(user) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)); return true; } catch (e) { return false; }
}
function drawUser() {
  $('user-name').textContent = getUser().username || 'Not set';
}
function openUser() {
  const user = getUser();
  $('u-username').value = user.username || '';
  $('u-email').value = user.email || '';
  $('e-username').textContent = $('e-email').textContent = '';
  $('u-username').setAttribute('aria-invalid', 'false'); $('u-email').setAttribute('aria-invalid', 'false');
  show('user'); $('u-username').focus();
}
function submitUser() {
  const username = $('u-username').value.trim(), email = $('u-email').value.trim(), errors = {};
  if (username.length < 1 || username.length > 30) errors.username = 'Username must be 1 to 30 characters.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter an email like name@example.com.';
  ['username', 'email'].forEach((f) => {
    $('e-' + f).textContent = errors[f] || '';
    $('u-' + f).setAttribute('aria-invalid', Boolean(errors[f]));
  });
  if (Object.keys(errors).length) return;
  if (!saveUser({ username, email })) return say('Could not save the user on this device.');
  drawUser(); show('settings'); say('User saved');
}

// ---------- Categories (opened from Settings) ----------
function drawCategories() {
  $('cat-count').textContent = categories.length;
  $('category-list').replaceChildren(...categories.map((c) => {
    const li = h('li', 'cat'), input = h('input'), error = h('p', 'error'), row = h('div', 'rowbtns');
    const save = h('button', 'small', 'Save name'), del = h('button', 'small danger', 'Delete');
    input.value = c.name;
    input.setAttribute('aria-label', 'Category name');
    error.setAttribute('aria-live', 'polite');
    save.type = del.type = 'button';
    save.onclick = () => saveCategory('PUT', '/categories/' + c.id, input.value, error);
    del.onclick = () => removeCategory(c, error);
    row.append(save, del);
    li.append(input, h('p', 'meta', 'Used by ' + c.item_count + (c.item_count === 1 ? ' item' : ' items')), error, row);
    return li;
  }));
}

async function saveCategory(method, path, name, errorBox) { // returns true when it worked
  errorBox.textContent = '';
  name = name.trim();
  if (name.length < 1 || name.length > 30) { errorBox.textContent = 'Name must be 1 to 30 characters.'; return false; }
  const r = await api(method, path, { name });
  if (!r.ok) { errorBox.textContent = errorText(r); return false; }
  await load();
  say(r.data.name + (method === 'POST' ? ' added' : ' saved'));
  return true;
}

async function removeCategory(c, errorBox) {
  errorBox.textContent = '';
  if (!confirm('Delete the category ' + c.name + '?')) return;
  const r = await api('DELETE', '/categories/' + c.id);
  if (!r.ok) { errorBox.textContent = errorText(r); return; } // a used category answers 409, and the message says how many items use it
  await load();
  say(c.name + ' deleted');
}

// ---------- Connect the buttons, then start ----------
document.querySelectorAll('[data-icon]').forEach((e) => { e.innerHTML = svg(e.dataset.icon, Number(e.dataset.size) || 24); });
document.querySelectorAll('.tab').forEach((b) => { b.onclick = () => (b.dataset.view === 'form' ? openForm(null) : show(b.dataset.view)); });
document.querySelectorAll('[data-goto]').forEach((b) => { b.onclick = () => show(b.dataset.goto); });
$('back-main').onclick = () => show(lastMain);
$('back-settings').onclick = () => show('settings');
$('back-settings-user').onclick = () => show('settings');
$('go-user').onclick = openUser;
$('go-categories').onclick = () => show('categories');
$('search').oninput = (e) => { filters.search = e.target.value; drawInventory(); };
$('toggle').onclick = (e) => { e.currentTarget.setAttribute('aria-checked', e.currentTarget.getAttribute('aria-checked') !== 'true'); };
$('item-form').onsubmit = (e) => { e.preventDefault(); saveItem(false); };
$('btn-save-another').onclick = () => saveItem(true);
$('btn-cancel').onclick = () => show('items');
$('user-form').onsubmit = (e) => { e.preventDefault(); submitUser(); };
$('category-form').onsubmit = async (e) => {
  e.preventDefault();
  if (await saveCategory('POST', '/categories', $('new-category').value, $('e-new-category'))) $('new-category').value = '';
};
drawUser();
show('items');
load();
