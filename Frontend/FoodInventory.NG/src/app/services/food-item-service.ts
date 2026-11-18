import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl, headers } from '../http-common';
import { FoodItem } from '../model/food-item';

@Injectable({
  providedIn: 'root',
})
export class FoodItemService {
  constructor(private http: HttpClient) {}

  getFoodItems(): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${baseUrl}/fooditem`);
  }

  getFoodItem(id: number): Observable<FoodItem> {
    return this.http.get<FoodItem>(`${baseUrl}/fooditem/${id}`);
  }

  addFoodItem(foodItem: FoodItem): Observable<any> {
    return this.http.post(`${baseUrl}/fooditem`, foodItem, { headers });
  }

  updateFoodItem(foodItem: FoodItem): Observable<any> {
    return this.http.put(`${baseUrl}/fooditem`, foodItem, { headers });
  }

  deleteFoodItem(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/fooditem/${id}`);
  }
}
