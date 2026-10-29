import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageLocation } from '../model/storage-location';

@Injectable({ providedIn: 'root' })
export class StorageLocationService {
  baseUrl: string = 'http://localhost:5050/api';

  constructor(private http: HttpClient) {}

  getStorageLocations(): Observable<StorageLocation[]> {
    return this.http.get<StorageLocation[]>(`${this.baseUrl}/storagelocation`);
  }
}
