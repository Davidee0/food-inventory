import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { FoodItemList } from './food-item-list';
import { FoodItem } from '../model/food-item';

describe('FoodItemList', () => {
  let component: FoodItemList;
  let fixture: ComponentFixture<FoodItemList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodItemList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodItemList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should combine the category and the storage location filter', () => {
    const food = (id: number, categoryId: number, storageLocationId: number) =>
      ({ id, name: 'Food ' + id, categoryId, storageLocationId }) as FoodItem;
    component.foodItems.set([food(1, 1, 1), food(2, 1, 2), food(3, 2, 2)]);
    component.categoryId = 1;
    expect(component.filteredFoodItems().length).toBe(2);
    component.storageLocationId = 2;
    expect(component.filteredFoodItems().map((foodItem) => foodItem.id)).toEqual([2]);
    component.clearFilters();
    expect(component.filteredFoodItems().length).toBe(3);
  });

  it('should find food by name, whatever the capital letters', () => {
    component.foodItems.set([
      { id: 1, name: 'Milk' },
      { id: 2, name: 'Oat milk' },
      { id: 3, name: 'Cheese' },
    ] as FoodItem[]);
    component.searchTerm = 'MILK';
    expect(component.filteredFoodItems().map((foodItem) => foodItem.name)).toEqual([
      'Milk',
      'Oat milk',
    ]);
  });
  it('should sort by name both ways, and keep food without a date last', () => {
    component.foodItems.set([
      { id: 1, name: 'Milk', bestBeforeDate: '2026-11-20' },
      { id: 2, name: 'apples', bestBeforeDate: null },
      { id: 3, name: 'Cheese', bestBeforeDate: '2026-11-25' },
    ] as FoodItem[]);
    expect(component.filteredFoodItems().map((foodItem) => foodItem.id)).toEqual([1, 3, 2]);
    component.toggleSortDirection();
    expect(component.filteredFoodItems().map((foodItem) => foodItem.id)).toEqual([3, 1, 2]);
    component.sortBy = 'name';
    component.toggleSortDirection();
    expect(component.filteredFoodItems().map((foodItem) => foodItem.name)).toEqual([
      'apples',
      'Cheese',
      'Milk',
    ]);
  });
});
