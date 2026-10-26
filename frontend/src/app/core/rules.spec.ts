import { ItemInput } from './models';
import { isValidDate, todayLocal, validateItem } from './rules';

describe('rules', () => {
  it('today comes from the local year, month and day, not from UTC', () => {
    // 00:30 on 1 January local time: toISOString() would say 31 December in any zone ahead of UTC.
    expect(todayLocal(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01');
    // 23:30 on 31 December local time: toISOString() would say 1 January in any zone behind UTC.
    expect(todayLocal(new Date(2026, 11, 31, 23, 30))).toBe('2026-12-31');
  });

  it('isValidDate accepts real YYYY-MM-DD dates only', () => {
    for (const good of ['2028-02-29', '2026-12-31']) expect(isValidDate(good)).withContext(good).toBeTrue();
    for (const bad of ['2026-02-29', '2026-02-30', '2026-13-01', '2026-1-1', '13-10-2026', '2026-10-13T10:00', ''])
      expect(isValidDate(bad)).withContext(bad).toBeFalse();
  });

  it('validateItem gives the same messages as the API', () => {
    const valid: ItemInput = { name: ' Milk ', location_id: 1, category_id: null, purchase_date: '2026-05-01', best_before: '' };
    const check = (change: Partial<ItemInput>) => validateItem({ ...valid, ...change });

    expect(check({})).toEqual({});
    expect(validateItem({ name: '', location_id: null, category_id: null, purchase_date: '', best_before: '' })).toEqual({
      name: 'Enter a name.', location_id: 'Choose a storage location.', purchase_date: 'Enter a purchase date.',
    });
    expect(check({ name: 'x'.repeat(51) })).toEqual({ name: 'Name can be at most 50 characters.' });
    expect(check({ name: `  ${'x'.repeat(50)}  ` })).toEqual({});
    expect(check({ purchase_date: '2026-02-30' })).toEqual({ purchase_date: 'Enter a valid date.' });
    expect(check({ best_before: '2026-02-30' })).toEqual({ best_before: 'Enter a valid date.' });
    expect(check({ best_before: '2026-04-30' })).toEqual({ best_before: 'Best before date cannot be before the purchase date.' });
    expect(check({ best_before: '2026-05-01' })).toEqual({});
  });
});
