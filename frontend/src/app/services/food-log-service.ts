import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FoodLog } from '../model/food-log';

@Injectable({
  providedIn: 'root',
})
export class FoodLogService {
  baseUrl: string = 'http://localhost:5050/api';

  constructor(private http: HttpClient) {}

  getFoodLogs(): Observable<FoodLog[]> {
    return this.http.get<FoodLog[]>(`${this.baseUrl}/foodlog`);
  }
  addFoodLog(foodLog: FoodLog): Observable<any> {
    return this.http.post(`${this.baseUrl}/foodlog`, foodLog);
  }
  deleteFoodLog(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/foodlog/${id}`);
  }
}
