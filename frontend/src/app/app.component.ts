import { Component, OnInit } from '@angular/core';
import { ApiService, NETWORK_MESSAGE, toFailure } from './core/api.service';
import { displayDate } from './core/date-utils';
import { Category, Item, Location } from './core/models';
import { CategoriesDialogComponent } from './categories/categories-dialog.component';
import { ConfirmDeleteComponent } from './confirm/confirm-delete.component';
import { ItemFormComponent } from './item-form/item-form.component';

@Component({
  selector: 'app-root',
  imports: [ItemFormComponent, ConfirmDeleteComponent, CategoriesDialogComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  items: Item[] = [];
  locations: Location[] = [];
  categories: Category[] = [];
  loading = true;
  loadError = '';

  formOpen = false;
  editing: Item | null = null;
  deleting: Item | null = null;
  categoriesOpen = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading = true;
    this.loadError = '';
    try {
      [this.items, this.locations, this.categories] = await Promise.all([
        this.api.items(),
        this.api.locations(),
        this.api.categories(),
      ]);
    } catch (e) {
      this.loadError = toFailure(e).network ? NETWORK_MESSAGE : 'Could not load your items.';
    } finally {
      this.loading = false;
    }
  }

  /** Refresh without flashing the loading state (after a save/delete). */
  async refresh() {
    try {
      [this.items, this.categories] = await Promise.all([this.api.items(), this.api.categories()]);
      this.loadError = '';
    } catch (e) {
      this.loadError = toFailure(e).network ? NETWORK_MESSAGE : 'Could not load your items.';
    }
  }

  openAdd() { this.editing = null; this.formOpen = true; }
  openEdit(item: Item) { this.editing = item; this.formOpen = true; }

  place(item: Item) {
    return item.category_name ? `${item.location_name}, ${item.category_name}` : item.location_name;
  }

  date = displayDate;
}
