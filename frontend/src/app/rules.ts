// Validation rules and date helpers for the form. The API checks the same rules with the same
// messages (backend/Models/Rules.cs). Dates are plain "YYYY-MM-DD" strings, never timestamps.
import { Errors, ItemInput } from './models';

const pad = (n: number) => String(n).padStart(2, '0');

/** Today from the LOCAL year, month and day. toISOString() would give the UTC day, which is wrong around midnight. */
export const todayLocal = (now = new Date()) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** A real calendar date written as YYYY-MM-DD (2026-02-30 is not). */
export function isValidDate(text: string): boolean {
  const [y, m, d] = text.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(text) &&
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

/** One message per field; empty when the item can be saved. Text is trimmed first. */
export function validateItem(item: ItemInput): Errors {
  const errors: Errors = {};
  const name = item.name.trim();
  if (!name) errors['name'] = 'Enter a name.';
  else if (name.length > 50) errors['name'] = 'Name can be at most 50 characters.';

  if (item.location_id == null) errors['location_id'] = 'Choose a storage location.';

  const purchase = item.purchase_date.trim();
  if (!purchase) errors['purchase_date'] = 'Enter a purchase date.';
  else if (!isValidDate(purchase)) errors['purchase_date'] = 'Enter a valid date.';

  const bestBefore = item.best_before.trim();
  if (bestBefore && !isValidDate(bestBefore)) errors['best_before'] = 'Enter a valid date.';
  else if (bestBefore && isValidDate(purchase) && bestBefore < purchase)
    errors['best_before'] = 'Best before date cannot be before the purchase date.';
  return errors;
}

/** The date `n` days after `date` (n may be negative), as YYYY-MM-DD. */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return todayLocal(new Date(y, m - 1, d + n));
}

/** 'past' = before today, 'soon' = today up to 3 days ahead, null = later or no date. */
export type Status = 'past' | 'soon' | null;
export function statusOf(bestBefore: string | null, today = todayLocal()): Status {
  if (!bestBefore) return null;
  if (bestBefore < today) return 'past';
  return bestBefore <= addDays(today, 3) ? 'soon' : null;
}

/** "Expired", "Today", "1 day left", "5 days left" or "No expiry date". */
export function leftText(bestBefore: string | null, today = todayLocal()): string {
  if (!bestBefore) return 'No expiry date';
  const [y, m, d] = bestBefore.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  const n = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
  if (n < 0) return 'Expired';
  if (n === 0) return 'Today';
  return n === 1 ? '1 day left' : `${n} days left`;
}
