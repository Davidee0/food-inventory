import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../model/item';

@Injectable({ providedIn: 'root' })
export class ItemService {
  baseUrl: string = 'http://localhost:5050/api';

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/item`);
  }

  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/item/${id}`);
  }

  addItem(item: Item): Observable<any> {
    return this.http.post(`${this.baseUrl}/item`, item);
  }

  updateItem(item: Item): Observable<any> {
    return this.http.put(`${this.baseUrl}/item`, item);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/item/${id}`);
  }
}
