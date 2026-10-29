import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FoodItem } from '../model/food-item';

@Injectable({ providedIn: 'root' })
export class FoodItemService {
  baseUrl: string = 'http://localhost:5050/api';

  constructor(private http: HttpClient) {}

  getFoodItems(): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.baseUrl}/fooditem`);
  }

  addFoodItem(foodItem: FoodItem): Observable<any> {
    return this.http.post(`${this.baseUrl}/fooditem`, foodItem);
  }

  updateFoodItem(foodItem: FoodItem): Observable<any> {
    return this.http.put(`${this.baseUrl}/fooditem`, foodItem);
  }

  deleteFoodItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/fooditem/${id}`);
  }
}
