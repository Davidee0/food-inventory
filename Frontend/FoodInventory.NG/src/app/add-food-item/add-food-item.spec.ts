import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AddFoodItem } from './add-food-item';

describe('AddFoodItem', () => {
  let component: AddFoodItem;
  let fixture: ComponentFixture<AddFoodItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFoodItem],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AddFoodItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Our own tests (US5): the rules of the form.
  it('should refuse a name of only spaces', () => {
    component.name.setValue('   ');
    expect(component.name.valid).toBeFalse();
    component.name.setValue('Milk');
    expect(component.name.valid).toBeTrue();
  });

  it('should refuse a best before date before the purchase date', () => {
    component.purchaseDate.setValue('2026-11-10');
    component.bestBeforeDate.setValue('2026-11-01');
    expect(component.bestBeforeTooEarly()).toBeTrue();
    component.bestBeforeDate.setValue('2026-11-10');
    expect(component.bestBeforeTooEarly()).toBeFalse();
    component.bestBeforeDate.setValue('');
    expect(component.bestBeforeTooEarly()).toBeFalse();
  });
});
