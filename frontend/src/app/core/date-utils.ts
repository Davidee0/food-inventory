/** Plain-date helpers. Dates are 'YYYY-MM-DD' strings, never timestamps (no toISOString). */

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

export function formatDate(y: number, m: number, d: number): string {
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

/** Today in the user's LOCAL time zone, built from local year/month/day. */
export function todayLocal(now: Date = new Date()): string {
  return formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** True only for a real calendar date written exactly as YYYY-MM-DD. */
export function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (y < 1) return false;
  const date = new Date(y, m - 1, d);
  date.setFullYear(y); // years 0-99 would otherwise map to 1900+
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function addDays(value: string, days: number): string {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return formatDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** Human-readable form of a stored plain date, e.g. "3 Oct 2026". */
export function displayDate(value: string): string {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
