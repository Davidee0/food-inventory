import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Category } from './model/category';
import { FoodItem } from './model/food-item';
import { StorageLocation } from './model/storage-location';
import { CategoryService } from './services/category-service';
import { FoodItemService } from './services/food-item-service';
import { StorageLocationService } from './services/storage-location-service';

/**
 * What all pages share: the data from the API and the message bar at the bottom.
 * After every change the pages call load(), so every page shows the same, fresh data.
 */
@Injectable({ providedIn: 'root' })
export class Inventory {
  private readonly foodItemService = inject(FoodItemService);
  private readonly categoryService = inject(CategoryService);
  private readonly storageLocationService = inject(StorageLocationService);

  readonly items = signal<FoodItem[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly locations = signal<StorageLocation[]>([]);
  readonly loaded = signal(false);
  readonly loadError = signal('');

  /** The message bar. */
  readonly toast = signal('');
  private toastTimer?: ReturnType<typeof setTimeout>;

  /** Where the back arrow of the Settings page goes: the last main tab that was open. */
  lastMain = '/items';

  /** Gets the storage locations, categories and food items again. False when it failed. */
  async load(): Promise<boolean> {
    try {
      const [locations, categories, items] = await Promise.all([
        firstValueFrom(this.storageLocationService.getStorageLocations()),
        firstValueFrom(this.categoryService.getCategories()),
        firstValueFrom(this.foodItemService.getFoodItems()),
      ]);
      this.locations.set(locations);
      this.categories.set(categories);
      this.items.set(items);
      this.loadError.set('');
      return true;
    } catch (error) {
      this.loadError.set(errorMessage(error));
      return false;
    } finally {
      this.loaded.set(true);
    }
  }

  say(text: string) {
    clearTimeout(this.toastTimer);
    this.toast.set(text);
    if (text) this.toastTimer = setTimeout(() => this.toast.set(''), 3000);
  }

  /**
   * Deletes the item ("Ate it" or Delete) after a confirmation. Loads again also when it fails,
   * e.g. because the item was already deleted on another phone.
   */
  async remove(item: FoodItem, done: string): Promise<boolean> {
    if (!confirm(`Delete ${item.name}?`)) return false;
    try {
      await firstValueFrom(this.foodItemService.deleteFoodItem(item.id));
      this.say(`${item.name} ${done}`);
      return true;
    } catch (error) {
      this.say(errorMessage(error));
      return false;
    } finally {
      await this.load();
    }
  }
}

/** A failed request in plain language: the API's message, or what went wrong. */
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return 'Could not reach the server. Check your connection and try again.';
    if (typeof error.error === 'string' && error.error) return error.error; // e.g. "Dairy still has food in it, ..."
    const errors = error.error?.errors; // the data annotations' messages, e.g. { Name: ["Enter a name."] }
    if (errors) return Object.values<string[]>(errors)[0][0];
  }
  return 'Something went wrong. Try again.';
}

/** The outline drawn next to an item, picked by its id. */
const SHAPES = ['carton', 'bowl', 'loaf', 'block', 'circle', 'arch', 'box', 'cup'];
export const shapeOf = (item: FoodItem) => SHAPES[item.id % SHAPES.length];
