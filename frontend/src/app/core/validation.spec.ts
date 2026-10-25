import { CATEGORY_NAME_MAX, ITEM_NAME_MAX, ItemForm, validateItem, validateName } from './validation';

describe('validation', () => {
  const locations = [1, 2, 3];
  const categories = [1, 2];
  const valid: ItemForm = { name: 'Milk', location_id: 1, category_id: null, purchase_date: '2026-05-01', best_before: '' };
  const check = (change: Partial<ItemForm>) => validateItem({ ...valid, ...change }, locations, categories);

  it('accepts a complete item and an item without optional fields', () => {
    expect(check({})).toEqual({});
    expect(check({ category_id: 2, best_before: '2026-05-01' })).toEqual({});
  });

  it('an empty form reports name, location and purchase date', () => {
    const errors = validateItem({ name: '', location_id: null, category_id: null, purchase_date: '', best_before: '' }, locations, categories);
    expect(errors).toEqual({
      name: 'Enter a name.',
      location_id: 'Choose a storage location.',
      purchase_date: 'Enter a purchase date.',
    });
  });

  it('trims the name before checking it', () => {
    expect(check({ name: '   ' })['name']).toBe('Enter a name.');
    expect(check({ name: ' '.repeat(5) + 'x'.repeat(ITEM_NAME_MAX) + ' '.repeat(5) })).toEqual({});
    expect(check({ name: 'x'.repeat(ITEM_NAME_MAX + 1) })['name']).toBe('Name can be at most 50 characters.');
  });

  it('category names allow 30 characters', () => {
    expect(validateName('x'.repeat(CATEGORY_NAME_MAX), CATEGORY_NAME_MAX)).toBeNull();
    expect(validateName('x'.repeat(CATEGORY_NAME_MAX + 1), CATEGORY_NAME_MAX)).toBe('Name can be at most 30 characters.');
    expect(validateName('  ', CATEGORY_NAME_MAX)).toBe('Enter a name.');
  });

  it('the location must be one of the known locations', () => {
    expect(check({ location_id: 99 })['location_id']).toBe('Choose a storage location.');
  });

  it('the category is optional but must be one of the known categories', () => {
    expect(check({ category_id: null })['category_id']).toBeUndefined();
    expect(check({ category_id: 99 })['category_id']).toBe('Choose a category from the list.');
  });

  it('the purchase date must be a real date', () => {
    expect(check({ purchase_date: '' })['purchase_date']).toBe('Enter a purchase date.');
    expect(check({ purchase_date: '2026-02-30' })['purchase_date']).toBe('Enter a valid date.');
    expect(check({ purchase_date: '01/02/2026' })['purchase_date']).toBe('Enter a valid date.');
  });

  it('best before is optional, must be a real date and not before the purchase date', () => {
    expect(check({ best_before: '' })['best_before']).toBeUndefined();
    expect(check({ best_before: '2026-02-30' })['best_before']).toBe('Enter a valid date.');
    expect(check({ best_before: '2026-04-30' })['best_before']).toBe('Best before date cannot be before the purchase date.');
    expect(check({ best_before: '2026-05-01' })['best_before']).toBeUndefined();
  });

  it('does not compare best before with an invalid purchase date', () => {
    const errors = check({ purchase_date: '2026-02-30', best_before: '2020-01-01' });
    expect(errors['purchase_date']).toBe('Enter a valid date.');
    expect(errors['best_before']).toBeUndefined();
  });
});
