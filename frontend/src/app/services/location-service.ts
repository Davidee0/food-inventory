import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Location } from '../model/location';

@Injectable({ providedIn: 'root' })
export class LocationService {
  baseUrl: string = 'http://localhost:5050/api';

  constructor(private http: HttpClient) {}

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.baseUrl}/location`);
  }
}
