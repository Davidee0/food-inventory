import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { EditFoodItem } from './edit-food-item';
import { FoodItem } from '../model/food-item';
import { baseUrl } from '../http-common';

describe('EditFoodItem', () => {
  let component: EditFoodItem;
  let fixture: ComponentFixture<EditFoodItem>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFoodItem],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EditFoodItem);
    component = fixture.componentInstance;
    component.id = 1;
    fixture.detectChanges(); // triggers ngOnInit
    httpMock = TestBed.inject(HttpTestingController);
    const req = httpMock.expectOne(`${baseUrl}/fooditem/1`);
    req.flush({
      id: 1,
      name: 'Milk',
      quantity: 1,
      purchaseDate: '2026-11-10',
      bestBeforeDate: null,
      categoryId: null,
      storageLocationId: 1,
    } as FoodItem);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the food item from the API', () => {
    expect(component.foodItem()?.name).toBe('Milk');
  });
});
