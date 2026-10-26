import { Component, OnInit, inject } from '@angular/core';
import { CategoriesComponent } from './categories/categories.component';
import { ApiService, NETWORK_ERROR, errorMessage } from './core/api.service';
import { Category, Item, Location } from './core/models';
import { ItemFormComponent } from './item-form/item-form.component';
import { ItemListComponent } from './item-list/item-list.component';

/** The page: header, messages, the item list, the Add button and the two dialogs. */
@Component({
  selector: 'app-root',
  imports: [ItemListComponent, ItemFormComponent, CategoriesComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private api = inject(ApiService);

  items: Item[] = [];
  locations: Location[] = [];
  categories: Category[] = [];
  loaded = false;
  loadError = '';
  /** The item in the form: null to add a new one, undefined while the form is closed. */
  editing: Item | null | undefined;
  categoriesOpen = false;

  ngOnInit() {
    this.load();
  }

  async load() {
    try {
      [this.locations, this.categories, this.items] = await Promise.all([this.api.locations(), this.api.categories(), this.api.items()]);
      this.loadError = '';
    } catch (error) {
      this.items = [];
      this.loadError = errorMessage(error) === NETWORK_ERROR ? NETWORK_ERROR : 'Could not load your items.';
    }
    this.loaded = true;
  }

  /** Opens the form. It needs the storage locations, so if loading failed, try again first. */
  async open(item: Item | null) {
    if (!this.locations.length) await this.load();
    if (this.locations.length) this.editing = item;
  }

  async remove(item: Item) {
    if (!confirm(`Delete ${item.name}?`)) return;
    try {
      await this.api.deleteItem(item.id);
      this.items = this.items.filter((i) => i !== item);
    } catch (error) {
      alert(errorMessage(error));
    }
  }
}
