import { Component, OnInit, inject, signal } from '@angular/core';
import { Api, NETWORK_ERROR, errorMessage } from '../api';
import { ItemForm } from '../item-form/item-form';
import { Category, Item, Location } from '../models';

/** The start page: the items (the API sorts them, soonest best before date first), Add, Edit and Delete. */
@Component({
  selector: 'app-items',
  imports: [ItemForm],
  templateUrl: './items.html',
  styleUrl: './items.css',
})
export class Items implements OnInit {
  private readonly api = inject(Api);

  protected readonly items = signal<Item[]>([]);
  protected readonly locations = signal<Location[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loaded = signal(false);
  protected readonly loadError = signal('');
  /** The item in the form: null to add a new one, undefined while the form is closed. */
  protected readonly editing = signal<Item | null | undefined>(undefined);

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

  /** "Fridge, Dairy", or only "Fridge" when the item has no category. */
  protected place = (item: Item) =>
    [item.location_name, item.category_name].filter(Boolean).join(', ');

  /** "3 Oct 2026" in the user's language. T00:00 makes it local midnight, not UTC. */
  protected niceDate = (date: string) =>
    new Date(`${date}T00:00`).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
}
