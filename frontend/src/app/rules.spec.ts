import { addDays, itemForm, leftText, messageOf, statusOf, todayLocal } from './rules';

describe('rules', () => {
  it('today comes from the local year, month and day, not from UTC', () => {
    // 00:30 on 1 January local time: toISOString() would say 31 December in any zone ahead of UTC.
    expect(todayLocal(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01');
    // 23:30 on 31 December local time: toISOString() would say 1 January in any zone behind UTC.
    expect(todayLocal(new Date(2026, 11, 31, 23, 30))).toBe('2026-12-31');
  });

  it('the item form gives the same messages as the API', () => {
    const form = itemForm(1);
    const messages = () =>
      Object.fromEntries(
        (Object.keys(form.controls) as (keyof typeof form.controls)[])
          .map((field) => [field, messageOf(form, field)])
          .filter(([, message]) => message),
      );
    const check = (change: Record<string, unknown>) => {
      form.reset(itemForm(1).getRawValue());
      form.patchValue({ name: ' Milk ', purchaseDate: '2026-05-01', ...change });
      return messages();
    };

    expect(check({})).toEqual({});
    expect(form.valid).toBe(true);
    expect(check({ name: '', quantity: null, storageLocationId: null, purchaseDate: '' })).toEqual({
      name: 'Enter a name.',
      quantity: 'Quantity must be at least 1.',
      storageLocationId: 'Choose a storage location.',
      purchaseDate: 'Enter a purchase date.',
    });
    expect(form.valid).toBe(false);
    expect(check({ name: '   ' })).toEqual({ name: 'Enter a name.' });
    expect(check({ name: 'x'.repeat(51) })).toEqual({ name: 'Name can be at most 50 characters.' });
    expect(check({ name: `  ${'x'.repeat(50)}  ` })).toEqual({});
    for (const quantity of [0, -1, 1.5])
      expect(check({ quantity })).toEqual({ quantity: 'Quantity must be at least 1.' });
    expect(check({ bestBeforeDate: '2026-04-30' })).toEqual({
      bestBeforeDate: 'Best before date cannot be before the purchase date.',
    });
    expect(check({ bestBeforeDate: '2026-05-01' })).toEqual({});
  });

  it('a new purchase date checks the best before date again', () => {
    const form = itemForm(1);
    form.patchValue({ name: 'Milk', purchaseDate: '2026-05-01', bestBeforeDate: '2026-05-03' });
    expect(messageOf(form, 'bestBeforeDate')).toBe('');
    form.controls.purchaseDate.setValue('2026-05-10');
    expect(messageOf(form, 'bestBeforeDate')).toBe(
      'Best before date cannot be before the purchase date.',
    );
  });

  it('a new item: quantity 1, bought today, in the given storage location', () => {
    expect(itemForm(2).getRawValue()).toEqual({
      name: '',
      quantity: 1,
      storageLocationId: 2,
      categoryId: null,
      purchaseDate: todayLocal(),
      bestBeforeDate: null,
    });
  });

  it('addDays crosses months and years', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('statusOf: past before today, soon up to 3 days ahead', () => {
    const today = '2026-10-29';
    expect(statusOf(null, today)).toBe(null);
    expect(statusOf('2026-10-28', today)).toBe('past');
    expect(statusOf('2026-10-29', today)).toBe('soon');
    expect(statusOf('2026-11-01', today)).toBe('soon');
    expect(statusOf('2026-11-02', today)).toBe(null);
  });

  it('leftText says how many days are left', () => {
    const today = '2026-10-29';
    expect(leftText(null, today)).toBe('No best before date');
    expect(leftText('2026-10-28', today)).toBe('Expired');
    expect(leftText('2026-10-29', today)).toBe('Today');
    expect(leftText('2026-10-30', today)).toBe('1 day left');
    expect(leftText('2026-11-05', today)).toBe('7 days left');
  });
});
