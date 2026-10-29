import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../model/category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  baseUrl: string = 'http://localhost:5050/api';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/category`);
  }

  addCategory(category: Category): Observable<any> {
    return this.http.post(`${this.baseUrl}/category`, category);
  }

  updateCategory(category: Category): Observable<any> {
    return this.http.put(`${this.baseUrl}/category`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/category/${id}`);
  }
}
