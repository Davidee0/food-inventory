import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl, headers } from '../http-common';
import { StorageLocation } from '../model/storage-location';

@Injectable({
  providedIn: 'root',
})
export class StorageLocationService {
  constructor(private http: HttpClient) {}

  getStorageLocations(): Observable<StorageLocation[]> {
    return this.http.get<StorageLocation[]>(`${baseUrl}/storagelocation`);
  }

  addStorageLocation(storageLocation: StorageLocation): Observable<any> {
    return this.http.post(`${baseUrl}/storagelocation`, storageLocation, { headers });
  }

  updateStorageLocation(storageLocation: StorageLocation): Observable<any> {
    return this.http.put(`${baseUrl}/storagelocation`, storageLocation, { headers });
  }

  deleteStorageLocation(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/storagelocation/${id}`);
  }
}
