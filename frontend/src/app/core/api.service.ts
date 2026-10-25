import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Category, FieldErrors, Item, ItemInput, Location } from './models';

export const API_URL = 'http://localhost:5000';

/** What the UI needs to know about a failed request. */
export interface ApiFailure {
  status: number;
  network: boolean;
  message?: string;
  errors?: FieldErrors;
}

export function toFailure(e: unknown): ApiFailure {
  if (e instanceof HttpErrorResponse) {
    const body = e.error as { message?: string; errors?: FieldErrors } | null;
    return { status: e.status, network: e.status === 0, message: body?.message, errors: body?.errors };
  }
  return { status: 0, network: false };
}

export const NETWORK_MESSAGE = 'Could not reach the server. Check your connection and try again.';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  locations = () => firstValueFrom(this.http.get<Location[]>(`${API_URL}/locations`));
  items = () => firstValueFrom(this.http.get<Item[]>(`${API_URL}/items`));
  createItem = (i: ItemInput) => firstValueFrom(this.http.post<Item>(`${API_URL}/items`, i));
  updateItem = (id: number, i: ItemInput) => firstValueFrom(this.http.put<Item>(`${API_URL}/items/${id}`, i));
  deleteItem = (id: number) => firstValueFrom(this.http.delete<void>(`${API_URL}/items/${id}`));

  categories = () => firstValueFrom(this.http.get<Category[]>(`${API_URL}/categories`));
  createCategory = (name: string) => firstValueFrom(this.http.post<Category>(`${API_URL}/categories`, { name }));
  renameCategory = (id: number, name: string) =>
    firstValueFrom(this.http.put<{ id: number; name: string }>(`${API_URL}/categories/${id}`, { name }));
  deleteCategory = (id: number) => firstValueFrom(this.http.delete<void>(`${API_URL}/categories/${id}`));
}
