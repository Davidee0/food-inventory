// The form's rules and the dates. The API checks the same rules with the same messages
// (data annotations in backend/FoodInventory.Model/Entities/FoodItem.cs). Dates are plain "YYYY-MM-DD" strings.
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';

const pad = (n: number) => String(n).padStart(2, '0');

/** Today from the LOCAL year, month and day. toISOString() would give the UTC day, which is wrong around midnight. */
export const todayLocal = (now = new Date()) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** The name is required and at most 50 characters, both after trimming (" Milk " is "Milk"). */
function nameRule(control: AbstractControl): ValidationErrors | null {
  const name = String(control.value ?? '').trim();
  if (!name) return { required: true };
  return name.length > 50 ? { maxlength: true } : null;
}

/** The best before date cannot be before the purchase date. */
function notBeforePurchase(control: AbstractControl): ValidationErrors | null {
  const purchaseDate = control.parent?.get('purchaseDate')?.value;
  return control.value && purchaseDate && control.value < purchaseDate
    ? { beforePurchase: true }
    : null;
}

/**
 * The Add/Edit form as a reactive form (lecture 8): one FormControl per field, with its Validators.
 * A new item: quantity 1, bought today, in the given storage location.
 */
export function itemForm(storageLocationId: number | null = null) {
  const form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: nameRule }),
    // a whole number of at least 1 (pattern refuses 1.5)
    quantity: new FormControl<number | null>(1, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^\d+$/),
    ]),
    storageLocationId: new FormControl<number | null>(storageLocationId, Validators.required),
    categoryId: new FormControl<number | null>(null),
    purchaseDate: new FormControl(todayLocal(), {
      nonNullable: true,
      validators: Validators.required,
    }),
    bestBeforeDate: new FormControl<string | null>(null, notBeforePurchase),
  });
  // A new purchase date can make the best before date right or wrong.
  form.controls.purchaseDate.valueChanges.subscribe(() =>
    form.controls.bestBeforeDate.updateValueAndValidity(),
  );
  return form;
}
export type ItemForm = ReturnType<typeof itemForm>;

/** The message for each field and rule, the same as the API's. */
const MESSAGES: Record<string, Record<string, string>> = {
  name: { required: 'Enter a name.', maxlength: 'Name can be at most 50 characters.' },
  quantity: {
    required: 'Quantity must be at least 1.',
    min: 'Quantity must be at least 1.',
    pattern: 'Quantity must be at least 1.',
  },
  storageLocationId: { required: 'Choose a storage location.' },
  purchaseDate: { required: 'Enter a purchase date.' },
  bestBeforeDate: { beforePurchase: 'Best before date cannot be before the purchase date.' },
};

/** The message under a field, e.g. 'Enter a name.'; empty when the field is fine. */
export function messageOf(form: ItemForm, field: keyof ItemForm['controls']): string {
  const errors = form.controls[field].errors;
  const rule = errors && Object.keys(errors)[0];
  return rule ? (MESSAGES[field]?.[rule] ?? '') : '';
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
