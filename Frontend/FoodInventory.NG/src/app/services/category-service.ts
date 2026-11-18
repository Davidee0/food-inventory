import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl, headers } from '../http-common';
import { Category } from '../model/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${baseUrl}/category`);
  }

  addCategory(category: Category): Observable<any> {
    return this.http.post(`${baseUrl}/category`, category, { headers });
  }

  updateCategory(category: Category): Observable<any> {
    return this.http.put(`${baseUrl}/category`, category, { headers });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/category/${id}`);
  }
}
