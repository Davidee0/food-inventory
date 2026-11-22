import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StorageLocationList } from './storage-location-list';

describe('StorageLocationList', () => {
  let component: StorageLocationList;
  let fixture: ComponentFixture<StorageLocationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageLocationList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StorageLocationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
