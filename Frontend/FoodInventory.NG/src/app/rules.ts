// Validation rules and date helpers for the form. The API checks the same rules with the same
// messages (Backend/FoodInventory.API/Rules.cs). Dates are plain "YYYY-MM-DD" strings, never timestamps.
import { ItemInput } from './model/item';

/** One message per field, e.g. { name: 'Enter a name.' }. */
export type Errors = Record<string, string>;

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

  if (item.locationId == null) errors['locationId'] = 'Choose a storage location.';

  const purchase = item.purchaseDate.trim();
  if (!purchase) errors['purchaseDate'] = 'Enter a purchase date.';
  else if (!isValidDate(purchase)) errors['purchaseDate'] = 'Enter a valid date.';

  const bestBefore = item.bestBefore.trim();
  if (bestBefore && !isValidDate(bestBefore)) errors['bestBefore'] = 'Enter a valid date.';
  else if (bestBefore && isValidDate(purchase) && bestBefore < purchase)
    errors['bestBefore'] = 'Best before date cannot be before the purchase date.';
  return errors;
}
