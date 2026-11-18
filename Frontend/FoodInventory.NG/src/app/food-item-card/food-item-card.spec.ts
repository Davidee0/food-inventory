import { ComponentFixture, TestBed } from '@angular/core/testing';
import { formatDate } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { FoodItemCard } from './food-item-card';
import { FoodItem } from '../model/food-item';

// Lecture 9: the generated test, fixed with the providers and a mock food item for @Input() (slide 46),
// plus our own tests for the expiry warning (US11).
describe('FoodItemCard', () => {
  let component: FoodItemCard;
  let fixture: ComponentFixture<FoodItemCard>;

  // The local date, some days from today, as "YYYY-MM-DD".
  function day(daysFromToday: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    return formatDate(date, 'yyyy-MM-dd', 'en');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodItemCard],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodItemCard);
    component = fixture.componentInstance;
    component.foodItem = {
      id: 1,
      name: 'Milk',
      quantity: 1,
      purchaseDate: day(-5),
      bestBeforeDate: null,
      storageLocationId: 1,
    } as FoodItem;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not warn when there is no best before date', () => {
    expect(component.warning()).toBe('');
  });

  it('should warn "Expired" when the best before date was yesterday', () => {
    component.foodItem.bestBeforeDate = day(-1);
    expect(component.warning()).toBe('Expired');
  });

  it('should warn "Eat soon" from today up to 3 days ahead', () => {
    component.foodItem.bestBeforeDate = day(0);
    expect(component.warning()).toBe('Eat soon');
    component.foodItem.bestBeforeDate = day(3);
    expect(component.warning()).toBe('Eat soon');
  });

  it('should not warn when the best before date is 4 days ahead', () => {
    component.foodItem.bestBeforeDate = day(4);
    expect(component.warning()).toBe('');
  });
});
