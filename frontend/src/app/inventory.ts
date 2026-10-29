import { Injectable, inject, signal } from '@angular/core';
import { Api, NETWORK_ERROR, errorMessage } from './api';
import { Category, Item, ItemInput, Location } from './models';

export interface User {
  username: string;
  email: string;
}
const USER_KEY = 'u8-user';

/**
 * What all pages share: the data from the API, the message bar at the bottom, and the user.
 * After every change the pages call load(), so every page shows the same, fresh data.
 */
@Injectable({ providedIn: 'root' })
export class Inventory {
  private readonly api = inject(Api);

  readonly items = signal<Item[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly locations = signal<Location[]>([]);
  readonly loaded = signal(false);
  readonly loadError = signal('');

  /** The message bar. With an undo function it shows an Undo button. */
  readonly toast = signal<{ text: string; undo?: () => void } | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  /** Where the back arrow in Settings goes: the last main tab that was open. */
  lastMain = '/items';

  readonly user = signal<User>(readUser());

  /** Gets locations, categories and items again. False when it failed. */
  async load(): Promise<boolean> {
    try {
      const [locations, categories, items] = await Promise.all([
        this.api.locations(),
        this.api.categories(),
        this.api.items(),
      ]);
      this.locations.set(locations);
      this.categories.set(categories);
      this.items.set(items);
      this.loadError.set('');
      return true;
    } catch (error) {
      this.loadError.set(
        errorMessage(error) === NETWORK_ERROR ? NETWORK_ERROR : 'Could not load your items.',
      );
      return false;
    } finally {
      this.loaded.set(true);
    }
  }

  say(text: string, undo?: () => void) {
    clearTimeout(this.toastTimer);
    this.toast.set(text ? { text, undo } : null);
    if (text) this.toastTimer = setTimeout(() => this.toast.set(null), undo ? 6000 : 3000);
  }

  /** Deletes the item ("Ate it" or Delete) and offers Undo, which adds it again. */
  async remove(item: Item, done: string): Promise<boolean> {
    try {
      await this.api.deleteItem(item.id);
    } catch (error) {
      this.say(errorMessage(error));
      return false;
    }
    await this.load();
    this.say(`${item.name} ${done}`, () => this.restore(item));
    return true;
  }

  private async restore(item: Item) {
    this.say('');
    try {
      await this.api.saveItem(inputOf(item));
      await this.load();
      this.say(`${item.name} is back`);
    } catch {
      this.say(`Could not undo. Add ${item.name} again.`);
    }
  }

  /** The database has a users table, but the API has no users route yet, so the user is kept in this browser. */
  saveUser(user: User): boolean {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      this.user.set(user);
      return true;
    } catch {
      return false;
    }
  }
}

function readUser(): User {
  try {
    return { username: '', email: '', ...JSON.parse(localStorage.getItem(USER_KEY) ?? '{}') };
  } catch {
    return { username: '', email: '' };
  }
}

/** The fields the form edits and the API needs, taken from an item. */
export const inputOf = (item: Item): ItemInput => ({
  name: item.name,
  location_id: item.location_id,
  category_id: item.category_id,
  purchase_date: item.purchase_date,
  best_before: item.best_before ?? '',
});

/** The outline drawn next to an item, picked by its id. */
const SHAPES = ['carton', 'bowl', 'loaf', 'block', 'circle', 'arch', 'box', 'cup'];
export const shapeOf = (item: Item) => SHAPES[item.id % SHAPES.length];
