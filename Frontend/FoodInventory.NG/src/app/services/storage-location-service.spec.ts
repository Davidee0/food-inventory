import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StorageLocationService } from './storage-location-service';

describe('StorageLocationService', () => {
  let service: StorageLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StorageLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
