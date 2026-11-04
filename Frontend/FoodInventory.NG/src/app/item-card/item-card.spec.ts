import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Item } from '../model/item';
import { ItemCard } from './item-card';

describe('ItemCard', () => {
  let component: ItemCard;
  let fixture: ComponentFixture<ItemCard>;
  const milk: Item = {
    id: 1,
    name: 'Milk',
    locationId: 1,
    categoryId: 1,
    purchaseDate: '2026-10-01',
    bestBefore: null,
    locationName: 'Fridge',
    categoryName: 'Dairy',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('item', milk);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows "location, category" and no Best before line without a date', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Fridge, Dairy');
    expect(text).not.toContain('Best before');
  });
});
