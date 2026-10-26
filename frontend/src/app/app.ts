import { Component, OnInit, inject, signal } from '@angular/core';
import { Categories } from './categories/categories';
import { Api, NETWORK_ERROR, errorMessage } from './core/api';
import { Category, Item, Location } from './core/models';
import { ItemForm } from './item-form/item-form';
import { ItemList } from './item-list/item-list';

/** The page: header, messages, the item list, the Add button and the two dialogs. */
@Component({
  selector: 'app-root',
  imports: [ItemList, ItemForm, Categories],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly api = inject(Api);

  protected readonly items = signal<Item[]>([]);
  protected readonly locations = signal<Location[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loaded = signal(false);
  protected readonly loadError = signal('');
  /** The item in the form: null to add a new one, undefined while the form is closed. */
  protected readonly editing = signal<Item | null | undefined>(undefined);
  protected readonly categoriesOpen = signal(false);

  ngOnInit() {
    this.load();
  }

  protected async load() {
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
    } catch (error) {
      this.items.set([]);
      this.loadError.set(
        errorMessage(error) === NETWORK_ERROR ? NETWORK_ERROR : 'Could not load your items.',
      );
    }
    this.loaded.set(true);
  }

  /** Opens the form. It needs the storage locations, so if loading failed, try again first. */
  protected async open(item: Item | null) {
    if (!this.locations().length) await this.load();
    if (this.locations().length) this.editing.set(item);
  }

  protected async remove(item: Item) {
    if (!confirm(`Delete ${item.name}?`)) return;
    try {
      await this.api.deleteItem(item.id);
      this.items.update((items) => items.filter((i) => i !== item));
    } catch (error) {
      alert(errorMessage(error));
    }
  }
}
