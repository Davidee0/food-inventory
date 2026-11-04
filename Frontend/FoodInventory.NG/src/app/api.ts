import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Category } from './model/category';
import { Item, ItemInput } from './model/item';
import { Location } from './model/location';
import { Errors } from './rules';

const API = 'http://localhost:5000/api';

/** Talks to the ASP.NET Core API. Every call returns a promise. */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  locations = () => firstValueFrom(this.http.get<Location[]>(`${API}/Location`));
  items = () => firstValueFrom(this.http.get<Item[]>(`${API}/Item`));
  /** Adds the item, or replaces item `id` (PUT sends every field). */
  saveItem = (item: ItemInput, id?: number) =>
    firstValueFrom(
      id
        ? this.http.put<Item>(`${API}/Item/${id}`, item)
        : this.http.post<Item>(`${API}/Item`, item),
    );
  deleteItem = (id: number) => firstValueFrom(this.http.delete(`${API}/Item/${id}`));

  categories = () => firstValueFrom(this.http.get<Category[]>(`${API}/Category`));
  addCategory = (name: string) => firstValueFrom(this.http.post(`${API}/Category`, { name }));
  renameCategory = (id: number, name: string) =>
    firstValueFrom(this.http.put(`${API}/Category/${id}`, { name }));
  deleteCategory = (id: number) => firstValueFrom(this.http.delete(`${API}/Category/${id}`));
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
