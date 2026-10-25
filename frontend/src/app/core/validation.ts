import { isValidDate } from './date-utils';
import { FieldErrors } from './models';

export const ITEM_NAME_MAX = 50;
export const CATEGORY_NAME_MAX = 30;

/** Same rules and messages as the API. Returns one message per field. */
export function validateName(raw: string, max: number): string | null {
  const name = raw.trim();
  if (!name) return 'Enter a name.';
  if (name.length > max) return `Name can be at most ${max} characters.`;
  return null;
}

export interface ItemForm {
  name: string;
  location_id: number | null;
  category_id: number | null;
  purchase_date: string;
  best_before: string;
}

export function validateItem(f: ItemForm, locationIds: number[], categoryIds: number[]): FieldErrors {
  const errors: FieldErrors = {};
  const nameError = validateName(f.name, ITEM_NAME_MAX);
  if (nameError) errors['name'] = nameError;

  if (f.location_id == null || !locationIds.includes(f.location_id)) errors['location_id'] = 'Choose a storage location.';

  const purchase = f.purchase_date.trim();
  const purchaseOk = isValidDate(purchase);
  if (!purchase) errors['purchase_date'] = 'Enter a purchase date.';
  else if (!purchaseOk) errors['purchase_date'] = 'Enter a valid date.';

  const best = f.best_before.trim();
  if (best) {
    if (!isValidDate(best)) errors['best_before'] = 'Enter a valid date.';
    else if (purchaseOk && best < purchase) errors['best_before'] = 'Best before date cannot be before the purchase date.';
  }

  if (f.category_id != null && !categoryIds.includes(f.category_id)) errors['category_id'] = 'Choose a category from the list.';
  return errors;
}
