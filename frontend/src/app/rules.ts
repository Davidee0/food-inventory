// The form's rules and the dates. The API checks the same rules with the same messages
// (data annotations in backend/FoodInventory.Model/Entities/FoodItem.cs). Dates are plain "YYYY-MM-DD" strings.
import { FoodItem } from './model/food-item';

/** One message per field, e.g. { name: 'Enter a name.' }. */
export type Errors = Record<string, string>;

const pad = (n: number) => String(n).padStart(2, '0');

/** Today from the LOCAL year, month and day. toISOString() would give the UTC day, which is wrong around midnight. */
export const todayLocal = (now = new Date()) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** One message per field; empty when the item can be saved. The name is trimmed first. */
export function validateItem(item: FoodItem): Errors {
  const errors: Errors = {};
  const name = item.name.trim();
  if (!name) errors['name'] = 'Enter a name.';
  else if (name.length > 50) errors['name'] = 'Name can be at most 50 characters.';

  const quantity = item.quantity ?? 0;
  if (!Number.isInteger(quantity) || quantity < 1)
    errors['quantity'] = 'Quantity must be at least 1.';

  if (item.storageLocationId == null) errors['storageLocationId'] = 'Choose a storage location.';

  if (!item.purchaseDate) errors['purchaseDate'] = 'Enter a purchase date.';
  else if (item.bestBeforeDate && item.bestBeforeDate < item.purchaseDate)
    errors['bestBeforeDate'] = 'Best before date cannot be before the purchase date.';
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

/** "Expired", "Today", "1 day left", "5 days left" or "No best before date". */
export function leftText(bestBefore: string | null, today = todayLocal()): string {
  if (!bestBefore) return 'No best before date';
  const [y, m, d] = bestBefore.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  const n = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
  if (n < 0) return 'Expired';
  if (n === 0) return 'Today';
  return n === 1 ? '1 day left' : `${n} days left`;
}
