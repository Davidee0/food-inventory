import { TestBed } from '@angular/core/testing';
import { formatDate } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { FoodItemCard } from './food-item-card';

// Lecture 9: unit tests for the expiry warning (US11).
describe('FoodItemCard', () => {
  let card: FoodItemCard;

  // The local date, some days from today, as "YYYY-MM-DD".
  function day(daysFromToday: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    return formatDate(date, 'yyyy-MM-dd', 'en');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FoodItemCard], providers: [provideHttpClient()] });
    card = TestBed.createComponent(FoodItemCard).componentInstance;
    card.foodItem = {
      id: 1,
      name: 'Milk',
      quantity: 1,
      purchaseDate: day(-5),
      bestBeforeDate: null,
      categoryId: null,
      storageLocationId: 1,
    };
  });

  it('should not warn when there is no best before date', () => {
    expect(card.warning()).toBe('');
  });

  it('should warn "Expired" when the best before date was yesterday', () => {
    card.foodItem.bestBeforeDate = day(-1);
    expect(card.warning()).toBe('Expired');
  });

  it('should warn "Eat soon" from today up to 3 days ahead', () => {
    card.foodItem.bestBeforeDate = day(0);
    expect(card.warning()).toBe('Eat soon');
    card.foodItem.bestBeforeDate = day(3);
    expect(card.warning()).toBe('Eat soon');
  });

  it('should not warn when the best before date is 4 days ahead', () => {
    card.foodItem.bestBeforeDate = day(4);
    expect(card.warning()).toBe('');
  });
});
