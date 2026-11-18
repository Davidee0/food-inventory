import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FoodItemService } from './food-item-service';
import { baseUrl } from '../http-common';

describe('FoodItemService', () => {
  let service: FoodItemService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FoodItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Our own test: deleting sends DELETE to /api/fooditem/{id}.
  it('should send DELETE with the id', () => {
    service.deleteFoodItem(7).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/fooditem/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
