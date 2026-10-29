import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { Inventory, shapeOf } from '../inventory';
import { FoodItem } from '../model/food-item';
import { leftText, statusOf } from '../rules';
import { TopBar } from '../top-bar/top-bar';

const NO_CATEGORY = 'No category';

/** The inventory (the start page): filters, then all items grouped by category, expiring ones first. Tap an item to edit it. */
@Component({
  selector: 'app-item-list',
  imports: [DatePipe, FormsModule, RouterLink, Icon, TopBar],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList implements OnInit {
  protected readonly inventory = inject(Inventory);
  /** The filters: a category id and a storage location id; null shows all. */
  protected readonly categoryId = signal<number | null>(null);
  protected readonly storageLocationId = signal<number | null>(null);

  protected readonly shapeOf = shapeOf;
  protected readonly leftText = (item: FoodItem) => leftText(item.bestBeforeDate);
  protected readonly expiring = (item: FoodItem) => statusOf(item.bestBeforeDate) !== null;

  /** "6 items · 2 expiring" */
  protected readonly countText = computed(() => {
    const items = this.inventory.items();
    const warnings = items.filter(this.expiring).length;
    return `${items.length} ${items.length === 1 ? 'item' : 'items'}${warnings ? ` · ${warnings} expiring` : ''}`;
  });

  protected readonly filtered = computed(
    () => this.categoryId() !== null || this.storageLocationId() !== null,
  );

  private readonly shown = computed(() =>
    this.inventory
      .items()
      .filter(
        (i) =>
          (this.categoryId() === null || i.categoryId === this.categoryId()) &&
          (this.storageLocationId() === null || i.storageLocationId === this.storageLocationId()),
      ),
  );

  /** One group per category in the categories' order, then "No category". Expiring items go on top. */
  protected readonly groups = computed(() =>
    [...this.inventory.categories().map((c) => c.name), NO_CATEGORY]
      .map((name) => ({
        name,
        items: this.shown()
          .filter((i) => (i.categoryName ?? NO_CATEGORY) === name)
          // the rest keep the API's order: soonest best before date first
          .sort((a, b) => Number(this.expiring(b)) - Number(this.expiring(a))),
      }))
      .filter((group) => group.items.length),
  );

  protected readonly noMatch = computed(
    () => this.inventory.items().length > 0 && this.shown().length === 0,
  );

  ngOnInit() {
    this.inventory.lastMain = '/items';
    this.inventory.load();
  }

  protected clearFilters() {
    this.categoryId.set(null);
    this.storageLocationId.set(null);
  }

  /** "Fridge · Qty 2 · 3 days left" */
  protected meta = (item: FoodItem) =>
    [item.storageLocationName, `Qty ${item.quantity}`, this.leftText(item)].join(' · ');
}
