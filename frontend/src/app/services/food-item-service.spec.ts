import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FoodItemService } from './food-item-service';

// The service only builds the requests; HttpTestingController catches them instead of the API (lecture 9: mocking).
describe('FoodItemService', () => {
  let service: FoodItemService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FoodItemService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify()); // no request left unanswered

  it('gets the food items from /api/fooditem', () => {
    let names: string[] = [];
    service.getFoodItems().subscribe((items) => (names = items.map((i) => i.name)));

    const req = http.expectOne('http://localhost:5050/api/fooditem');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Milk' }]);
    expect(names).toEqual(['Milk']);
  });

  it('sends POST to add, PUT to save and DELETE with the id', () => {
    const milk = {
      id: 1,
      name: 'Milk',
      quantity: 1,
      purchaseDate: '2026-11-01',
      bestBeforeDate: null,
      categoryId: null,
      storageLocationId: 1,
    };
    service.addFoodItem(milk).subscribe();
    service.updateFoodItem(milk).subscribe();
    service.deleteFoodItem(1).subscribe();

    expect(
      http.expectOne({ method: 'POST', url: 'http://localhost:5050/api/fooditem' }).request.body,
    ).toEqual(milk);
    expect(
      http.expectOne({ method: 'PUT', url: 'http://localhost:5050/api/fooditem' }).request.body,
    ).toEqual(milk);
    http.expectOne({ method: 'DELETE', url: 'http://localhost:5050/api/fooditem/1' }).flush(null);
  });
});
