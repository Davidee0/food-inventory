// Dates are text like "2026-10-15". In this format, text order is date order, so < and > work.
const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' }); // a UTC server is still "yesterday" just after midnight in Denmark
const addDays = (date, n) => { const [y, m, d] = date.split('-'); return new Date(Date.UTC(y, m - 1, +d + n)).toISOString().slice(0, 10); }; // UTC has no daylight saving
const isDate = (s) => /^\d{4}-\d\d-\d\d$/.test(s) && addDays(s, 0) === s; // "2026-02-30" rolls over to March, so it no longer matches

// 'past' = before today, 'soon' = today up to 3 days ahead, null = later or no date.
function statusOf(bestBefore) {
  if (!bestBefore) return null;
  const t = today();
  if (bestBefore < t) return 'past';
  return bestBefore <= addDays(t, 3) ? 'soon' : null;
}

module.exports = { today, addDays, isDate, statusOf };
