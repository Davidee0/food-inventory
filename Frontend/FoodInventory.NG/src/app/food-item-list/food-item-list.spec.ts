import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { FoodItemList } from './food-item-list';

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
});
