import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Category, Errors, Item, ItemInput, Location } from './models';

const API = 'http://localhost:5000';

/** Talks to the ASP.NET Core API. Every call returns a promise. */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  locations = () => firstValueFrom(this.http.get<Location[]>(`${API}/locations`));
  items = () => firstValueFrom(this.http.get<Item[]>(`${API}/items`));
  /** Adds the item, or replaces item `id` (PUT sends every field). */
  saveItem = (item: ItemInput, id?: number) =>
    firstValueFrom(
      id
        ? this.http.put<Item>(`${API}/items/${id}`, item)
        : this.http.post<Item>(`${API}/items`, item),
    );
  deleteItem = (id: number) => firstValueFrom(this.http.delete(`${API}/items/${id}`));

  categories = () => firstValueFrom(this.http.get<Category[]>(`${API}/categories`));
  addCategory = (name: string) => firstValueFrom(this.http.post(`${API}/categories`, { name }));
  renameCategory = (id: number, name: string) =>
    firstValueFrom(this.http.put(`${API}/categories/${id}`, { name }));
  deleteCategory = (id: number) => firstValueFrom(this.http.delete(`${API}/categories/${id}`));
}

export const NETWORK_ERROR = 'Could not reach the server. Check your connection and try again.';

/** The messages per field of a 400 answer, if it has them. */
export const fieldErrors = (error: unknown): Errors | undefined =>
  error instanceof HttpErrorResponse ? error.error?.errors : undefined;

/** A failed request in plain language: the server's message, or what went wrong. */
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 0) return NETWORK_ERROR;
  const errors = fieldErrors(error);
  if (errors) return Object.values(errors)[0];
  return (
    (error instanceof HttpErrorResponse && error.error?.message) ||
    'Something went wrong. Try again.'
  );
}
