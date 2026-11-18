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
});
