import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { API_URL } from './core/api.service';
import { todayLocal } from './core/date-utils';
import { Category, Item, Location } from './core/models';

const LOCATIONS: Location[] = [{ id: 1, name: 'Fridge' }, { id: 2, name: 'Freezer' }, { id: 3, name: 'Pantry' }];
const CATEGORIES: Category[] = [{ id: 1, name: 'Dairy', item_count: 1 }, { id: 2, name: 'Other', item_count: 0 }];
const MILK: Item = {
  id: 1, name: 'Milk', purchase_date: '2026-05-01', best_before: '2026-05-04',
  location_id: 1, location_name: 'Fridge', category_id: 1, category_name: 'Dairy',
};
const PASTA: Item = {
  id: 2, name: 'Pasta', purchase_date: '2026-04-10', best_before: null,
  location_id: 3, location_name: 'Pantry', category_id: null, category_name: null,
};

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let http: HttpTestingController;
  const root = () => fixture.nativeElement as HTMLElement;
  const text = () => root().textContent ?? '';
  const settle = async () => { await fixture.whenStable(); fixture.detectChanges(); };

  /** Answers the three requests the page makes when it loads. */
  async function load(items: Item[] = [MILK, PASTA]) {
    http.expectOne(`${API_URL}/items`).flush(items);
    http.expectOne(`${API_URL}/locations`).flush(LOCATIONS);
    http.expectOne(`${API_URL}/categories`).flush(CATEGORIES);
    await settle();
  }

  /** Finds a button by its text or aria-label, preferring the open dialog (the page behind it has a Delete button too). */
  const button = (label: string) => {
    const scope = root().querySelector('dialog[open]') ?? root();
    return Array.from(scope.querySelectorAll('button')).find((b) => b.textContent?.trim() === label || b.getAttribute('aria-label') === label) as HTMLButtonElement;
  };
  /** A dialog's close event arrives a moment after close(), so wait for it. */
  const waitFor = async (condition: () => boolean) => {
    for (let i = 0; i < 50 && !condition(); i++) {
      await new Promise((resolve) => setTimeout(resolve, 5));
      await settle();
    }
  };
  const click = async (label: string) => {
    const b = button(label);
    expect(b).withContext(`button "${label}"`).toBeTruthy();
    b.click();
    await settle();
  };
  const type = async (selector: string, value: string) => {
    const el = root().querySelector(selector) as HTMLInputElement;
    el.value = value;
    el.dispatchEvent(new Event('input'));
    await settle();
  };
  const choose = async (selector: string, label: string) => {
    const el = root().querySelector(selector) as HTMLSelectElement;
    el.selectedIndex = Array.from(el.options).findIndex((o) => o.textContent?.trim() === label);
    el.dispatchEvent(new Event('change'));
    await settle();
  };
  const errorsInDialog = () => Array.from(root().querySelectorAll('dialog .error')).map((e) => e.textContent?.trim());
  const request = (method: string, url: string): TestRequest => http.expectOne((r) => r.method === method && r.url === `${API_URL}${url}`);

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AppComponent);
    fixture.autoDetectChanges();
  });

  afterEach(() => {
    root().querySelectorAll('dialog').forEach((d) => (d as HTMLDialogElement).close());
    http.verify();
  });

  describe('list', () => {
    it('shows the header with a Categories button and the sticky Add item button', async () => {
      await load();
      expect(root().querySelector('h1')?.textContent).toBe('Food inventory');
      expect(button('Categories')).toBeTruthy();
      expect(button('Add item')).toBeTruthy();
    });

    it('shows name, "location, category", Bought and Best before, and leaves out what is missing', async () => {
      await load();
      const [milk, pasta] = Array.from(root().querySelectorAll('.item')).map((e) => e.textContent ?? '');
      expect(milk).toContain('Milk');
      expect(milk).toContain('Fridge, Dairy');
      expect(milk).toContain('Bought');
      expect(milk).toContain('Best before');
      expect(pasta).toContain('Pasta');
      expect(pasta).toContain('Pantry');
      expect(pasta).not.toContain('Pantry,');
      expect(pasta).toContain('Bought');
      expect(pasta).not.toContain('Best before');
    });

    it('has Edit and Delete buttons with aria-labels on every item', async () => {
      await load();
      for (const name of ['Milk', 'Pasta']) {
        expect(button(`Edit ${name}`)).toBeTruthy();
        expect(button(`Delete ${name}`)).toBeTruthy();
      }
    });

    it('shows the empty state with an Add your first item button', async () => {
      await load([]);
      expect(text()).toContain('Nothing here yet.');
      await click('Add your first item');
      expect(root().querySelector('dialog')?.open).toBeTrue();
    });
  });

  describe('load failures', () => {
    it('says it could not load the items and offers Try again', async () => {
      http.expectOne(`${API_URL}/items`).flush('x', { status: 500, statusText: 'Server Error' });
      http.expectOne(`${API_URL}/locations`).flush(LOCATIONS);
      http.expectOne(`${API_URL}/categories`).flush(CATEGORIES);
      await settle();
      expect(text()).toContain('Could not load your items.');
      await click('Try again');
      await load([MILK]);
      expect(text()).not.toContain('Could not load your items.');
      expect(text()).toContain('Milk');
    });

    it('says the server could not be reached on a network error', async () => {
      http.expectOne(`${API_URL}/items`).error(new ProgressEvent('error'));
      http.expectOne(`${API_URL}/locations`).flush(LOCATIONS);
      http.expectOne(`${API_URL}/categories`).flush(CATEGORIES);
      await settle();
      expect(text()).toContain('Could not reach the server. Check your connection and try again.');
      expect(button('Try again')).toBeTruthy();
    });

    it('Add item loads the locations again instead of opening a form that cannot be filled in', async () => {
      http.expectOne(`${API_URL}/items`).error(new ProgressEvent('error'));
      http.expectOne(`${API_URL}/locations`).error(new ProgressEvent('error'));
      http.expectOne(`${API_URL}/categories`).error(new ProgressEvent('error'));
      await settle();

      await click('Add item');
      expect(root().querySelector('dialog')).toBeNull();
      await load();
      await waitFor(() => !!root().querySelector('dialog'));
      expect(root().querySelector('dialog')?.open).toBeTrue();
      const options = Array.from(root().querySelectorAll('#f-location option')).map((o) => o.textContent?.trim());
      expect(options).toEqual(['Choose a location', 'Fridge', 'Freezer', 'Pantry']);
    });
  });

  describe('add and edit form', () => {
    beforeEach(async () => {
      await load();
      await click('Add item');
    });

    it('has the five fields, today as the purchase date and a No category choice', () => {
      for (const label of ['Name', 'Storage location', 'Category (optional)', 'Purchase date', 'Best before date (optional)'])
        expect(Array.from(root().querySelectorAll('dialog label')).map((l) => l.textContent?.trim())).toContain(label);
      expect((root().querySelector('#f-purchase') as HTMLInputElement).value).toBe(todayLocal());
      expect((root().querySelector('#f-best') as HTMLInputElement).value).toBe('');
      const categories = Array.from(root().querySelectorAll('#f-category option')).map((o) => o.textContent?.trim());
      expect(categories).toEqual(['No category', 'Dairy', 'Other']);
    });

    it('cannot be submitted while invalid: shows the messages and sends nothing', async () => {
      await type('#f-purchase', '');
      await click('Save');
      expect(errorsInDialog()).toEqual(['Enter a name.', 'Choose a storage location.', 'Enter a purchase date.']);
      http.expectNone((r) => r.method === 'POST');
    });

    it('validates the dates like the API', async () => {
      await type('#f-name', 'Cheese');
      await choose('#f-location', 'Fridge');
      await type('#f-purchase', '2026-05-10');
      await type('#f-best', '2026-05-09');
      await click('Save');
      expect(errorsInDialog()).toEqual(['Best before date cannot be before the purchase date.']);
      http.expectNone((r) => r.method === 'POST');
    });

    it('sends a trimmed, complete item and refreshes the list', async () => {
      await type('#f-name', '  Cheese  ');
      await choose('#f-location', 'Fridge');
      await choose('#f-category', 'Dairy');
      await type('#f-purchase', '2026-05-10');
      await type('#f-best', '2026-05-20');
      await click('Save');

      const post = request('POST', '/items');
      expect(post.request.body).toEqual({
        name: 'Cheese', location_id: 1, category_id: 1, purchase_date: '2026-05-10', best_before: '2026-05-20',
      });
      post.flush({ ...MILK, id: 3, name: 'Cheese' }, { status: 201, statusText: 'Created' });
      await settle();
      expect(root().querySelector('dialog')?.open).toBeTrue(); // stays open until the list has refreshed
      http.expectOne(`${API_URL}/items`).flush([MILK, PASTA, { ...MILK, id: 3, name: 'Cheese' }]);
      http.expectOne(`${API_URL}/categories`).flush(CATEGORIES);
      await waitFor(() => !root().querySelector('dialog'));
      expect(root().querySelector('dialog')).toBeNull();
      expect(text()).toContain('Cheese');
    });

    it('sends null for an empty best before date and for No category', async () => {
      await type('#f-name', 'Rice');
      await choose('#f-location', 'Pantry');
      await click('Save');
      expect(request('POST', '/items').request.body).toEqual({
        name: 'Rice', location_id: 3, category_id: null, purchase_date: todayLocal(), best_before: null,
      });
    });

    it('shows a server error on its field and keeps what was typed', async () => {
      await type('#f-name', 'Cheese');
      await choose('#f-location', 'Fridge');
      await click('Save');
      request('POST', '/items').flush({ errors: { name: 'Name can be at most 50 characters.' } }, { status: 400, statusText: 'Bad Request' });
      await settle();
      expect(errorsInDialog()).toEqual(['Name can be at most 50 characters.']);
      expect(root().querySelector('#e-name')?.textContent).toContain('Name can be at most 50 characters.');
      expect((root().querySelector('#f-name') as HTMLInputElement).value).toBe('Cheese');
      // editing the field clears the server message
      await type('#f-name', 'Cheddar');
      expect(errorsInDialog()).toEqual([]);
    });

    it('shows other save failures in plain language and keeps what was typed', async () => {
      await type('#f-name', 'Cheese');
      await choose('#f-location', 'Fridge');
      await click('Save');
      request('POST', '/items').flush({ message: 'Something went wrong on the server.' }, { status: 500, statusText: 'Server Error' });
      await settle();
      expect(errorsInDialog()).toEqual(['Could not save the item. Try again.']);
      expect((root().querySelector('#f-name') as HTMLInputElement).value).toBe('Cheese');
      expect(root().querySelector('dialog')?.open).toBeTrue();

      await click('Save');
      request('POST', '/items').error(new ProgressEvent('error'));
      await settle();
      expect(errorsInDialog()).toEqual(['Could not reach the server. Check your connection and try again.']);
    });
  });

  describe('edit', () => {
    it('opens with the current values and replaces the item', async () => {
      await load();
      await click('Edit Milk');
      expect((root().querySelector('#f-name') as HTMLInputElement).value).toBe('Milk');
      expect((root().querySelector('#f-purchase') as HTMLInputElement).value).toBe('2026-05-01');
      expect((root().querySelector('#f-best') as HTMLInputElement).value).toBe('2026-05-04');
      expect((root().querySelector('#f-location') as HTMLSelectElement).selectedOptions[0].textContent?.trim()).toBe('Fridge');
      expect((root().querySelector('#f-category') as HTMLSelectElement).selectedOptions[0].textContent?.trim()).toBe('Dairy');

      await type('#f-name', 'Oat milk');
      await choose('#f-category', 'No category');
      await type('#f-best', '');
      await click('Save');
      expect(request('PUT', '/items/1').request.body).toEqual({
        name: 'Oat milk', location_id: 1, category_id: null, purchase_date: '2026-05-01', best_before: null,
      });
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await load();
      await click('Delete Milk');
    });

    it('asks for confirmation naming the item, and cancelling deletes nothing', async () => {
      expect(root().querySelector('dialog h2')?.textContent?.trim()).toBe('Delete Milk?');
      await click('Cancel');
      await waitFor(() => !root().querySelector('dialog'));
      http.expectNone((r) => r.method === 'DELETE');
      expect(root().querySelector('dialog')).toBeNull();
    });

    it('deletes after confirming and refreshes the list', async () => {
      await click('Delete');
      request('DELETE', '/items/1').flush(null, { status: 204, statusText: 'No Content' });
      await settle();
      // the dialog stays open until the refreshed list arrives, so the deleted item is never shown again
      expect(root().querySelector('dialog')?.open).toBeTrue();
      expect(text()).toContain('Milk');
      http.expectOne(`${API_URL}/items`).flush([PASTA]);
      http.expectOne(`${API_URL}/categories`).flush(CATEGORIES);
      await waitFor(() => !root().querySelector('dialog'));
      expect(root().querySelector('dialog')).toBeNull();
      expect(text()).not.toContain('Milk');
    });

    it('explains a failed delete in plain language and keeps the dialog open', async () => {
      await click('Delete');
      request('DELETE', '/items/1').flush({ message: 'Something went wrong on the server.' }, { status: 500, statusText: 'Server Error' });
      await settle();
      expect(errorsInDialog()).toEqual(['Could not delete Milk. Try again.']);
      expect(root().querySelector('dialog')?.open).toBeTrue();
    });
  });

  describe('categories dialog', () => {
    beforeEach(async () => {
      await load();
      await click('Categories');
      request('GET', '/categories').flush([
        { id: 1, name: 'Dairy', item_count: 1 }, { id: 2, name: 'Other', item_count: 0 }, { id: 3, name: 'Meat', item_count: 2 },
      ]);
      await settle();
    });

    it('lists each category with an editable name, its item count, Save and Delete', () => {
      const rows = Array.from(root().querySelectorAll('.category-list li'));
      expect(rows.length).toBe(3);
      expect(rows[0].textContent).toContain('1 item');
      expect(rows[0].textContent).not.toContain('1 items');
      expect(rows[2].textContent).toContain('2 items');
      expect((rows[0].querySelector('input') as HTMLInputElement).value).toBe('Dairy');
      expect(button('Save Dairy')).toBeTruthy();
      expect(button('Delete category Dairy')).toBeTruthy();
    });

    it('checks a new name before sending it, and shows a duplicate on the field', async () => {
      await click('Add');
      expect(errorsInDialog()).toEqual(['Enter a name.']);
      await type('#new-category', 'x'.repeat(31));
      await click('Add');
      expect(errorsInDialog()).toEqual(['Name can be at most 30 characters.']);
      http.expectNone((r) => r.method === 'POST');

      await type('#new-category', 'dairy');
      await click('Add');
      request('POST', '/categories').flush({ message: 'dairy already exists.' }, { status: 409, statusText: 'Conflict' });
      await settle();
      expect(errorsInDialog()).toEqual(['dairy already exists.']);
    });

    it('shows why a category in use cannot be deleted', async () => {
      await click('Delete category Meat');
      request('DELETE', '/categories/3').flush(
        { message: 'Meat is used by 2 items and cannot be deleted.', itemCount: 2 }, { status: 409, statusText: 'Conflict' });
      await settle();
      expect(errorsInDialog()).toEqual(['Meat is used by 2 items and cannot be deleted.']);
      expect(root().querySelectorAll('.category-list li').length).toBe(3);
    });

    it('renames with Save and shows a clash with another name', async () => {
      await type('.category-list li:first-child input', 'Milk products');
      await click('Save Dairy');
      expect(request('PUT', '/categories/1').request.body).toEqual({ name: 'Milk products' });
    });

    it('shows a clash on a rename on that row', async () => {
      await type('.category-list li:first-child input', 'other');
      await click('Save Dairy');
      request('PUT', '/categories/1').flush({ message: 'other already exists.' }, { status: 409, statusText: 'Conflict' });
      await settle();
      expect(errorsInDialog()).toEqual(['other already exists.']);
    });

    it('adding a category keeps names typed but not yet saved in other rows, and says what was added', async () => {
      await type('.category-list li:nth-child(2) input', 'Leftovers'); // unsaved edit of "Other"
      await type('#new-category', 'Snacks');
      await click('Add');
      request('POST', '/categories').flush({ id: 4, name: 'Snacks', item_count: 0 }, { status: 201, statusText: 'Created' });
      await settle();
      const updated: Category[] = [
        { id: 1, name: 'Dairy', item_count: 1 }, { id: 2, name: 'Other', item_count: 0 },
        { id: 3, name: 'Meat', item_count: 2 }, { id: 4, name: 'Snacks', item_count: 0 },
      ];
      http.expectOne(`${API_URL}/items`).flush([MILK, PASTA]);
      http.match((r) => r.method === 'GET' && r.url === `${API_URL}/categories`).forEach((r) => r.flush(updated));
      await settle();

      const inputs = Array.from(root().querySelectorAll('.category-list li input')).map((i) => (i as HTMLInputElement).value);
      expect(inputs).toEqual(['Dairy', 'Leftovers', 'Meat', 'Snacks']);
      expect(root().querySelector('dialog [role=status]')?.textContent).toBe('Added Snacks.');
      expect((root().querySelector('#new-category') as HTMLInputElement).value).toBe('');
    });
  });
});
