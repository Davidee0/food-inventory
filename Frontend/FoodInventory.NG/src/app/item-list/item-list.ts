import { Component, OnInit, inject, signal } from '@angular/core';
import { Api, NETWORK_ERROR, errorMessage } from '../api';
import { ItemCard } from '../item-card/item-card';
import { ItemForm } from '../item-form/item-form';
import { Category } from '../model/category';
import { Item } from '../model/item';
import { Location } from '../model/location';

/** The item list (the start page): a card per item (the API sorts them, soonest best before date first), Add, Edit and Delete. */
@Component({
  selector: 'app-item-list',
  imports: [ItemCard, ItemForm],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList implements OnInit {
  private readonly api = inject(Api);

  protected readonly items = signal<Item[]>([]);
  protected readonly locations = signal<Location[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loaded = signal(false);
  protected readonly loadError = signal('');
  /** The item in the form: null to add a new one, undefined while the form is closed. */
  protected readonly editing = signal<Item | null | undefined>(undefined);
  /** A short message after a change, e.g. "Saved Milk." (lecture 2: success notifications). */
  protected readonly notice = signal('');

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
    this.notice.set('');
    if (!this.locations().length) await this.load();
    if (this.locations().length) this.editing.set(item);
  }

  protected saved(item: Item) {
    this.notice.set(`Saved ${item.name}.`);
    this.load();
  }

  protected async remove(item: Item) {
    if (!confirm(`Delete ${item.name}?`)) return;
    try {
      await this.api.deleteItem(item.id);
      this.items.update((items) => items.filter((i) => i !== item));
      this.notice.set(`Deleted ${item.name}.`);
    } catch (error) {
      alert(errorMessage(error));
    }
  }
}
