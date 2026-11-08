import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Inventory } from './inventory';
import { FoodItem } from './model/food-item';

const API = 'http://localhost:5050/api';
const pasta: FoodItem = {
  id: 5,
  name: 'Pasta',
  quantity: 3,
  purchaseDate: '2026-11-01',
  bestBeforeDate: null,
  categoryId: 6,
  storageLocationId: 3,
};

// "Ate it" and Undo (inventory.ts), with HttpTestingController in place of the API.
describe('Inventory', () => {
  let inventory: Inventory;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    inventory = TestBed.inject(Inventory);
    http = TestBed.inject(HttpTestingController);
  });

  /** Answers the three GETs of load(). */
  const answerLoad = (items: FoodItem[]) => {
    http.expectOne(`${API}/storagelocation`).flush([{ id: 3, name: 'Pantry' }]);
    http.expectOne(`${API}/category`).flush([{ id: 6, name: 'Other' }]);
    http.expectOne(`${API}/fooditem`).flush(items);
  };
  const tick = () => new Promise((resolve) => setTimeout(resolve));

  it('load() keeps the data for all pages', async () => {
    const loading = inventory.load();
    answerLoad([pasta]);
    expect(await loading).toBe(true);
    expect(inventory.items().map((i) => i.name)).toEqual(['Pasta']);
    expect(inventory.locations().length).toBe(1);
  });

  it('load() shows a message in plain language when the API cannot be reached', async () => {
    const loading = inventory.load();
    http.expectOne(`${API}/storagelocation`).error(new ProgressEvent('error'));
    http.match(() => true).forEach((req) => req.flush([]));
    expect(await loading).toBe(false);
    expect(inventory.loadError()).toBe(
      'Could not reach the server. Check your connection and try again.',
    );
  });

  it('Ate it: one less (3 become 2)', async () => {
    const eating = inventory.eatOne(pasta);
    const put = http.expectOne({ method: 'PUT', url: `${API}/fooditem` });
    expect(put.request.body.quantity).toBe(2);
    put.flush(null);
    await tick();
    answerLoad([{ ...pasta, quantity: 2 }]);
    await eating;
    expect(inventory.items()[0].quantity).toBe(2);
  });

  it('Ate it on the last one deletes the item', async () => {
    const eating = inventory.eatOne({ ...pasta, quantity: 1 });
    http.expectOne({ method: 'DELETE', url: `${API}/fooditem/5` }).flush(null);
    await tick();
    answerLoad([]);
    await eating;
    expect(inventory.items()).toEqual([]);
  });
});
