import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { Inventory, shapeOf } from '../inventory';
import { Item } from '../models';
import { leftText, statusOf } from '../rules';
import { TopBar } from '../top-bar/top-bar';

const NO_CATEGORY = 'No category';

/** The inventory (the start page): search, then all items grouped by category, expiring ones first. Tap an item to edit it. */
@Component({
  selector: 'app-item-list',
  imports: [FormsModule, RouterLink, Icon, TopBar],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList implements OnInit {
  protected readonly inventory = inject(Inventory);
  protected readonly search = signal('');

  protected readonly shapeOf = shapeOf;
  protected readonly leftText = (item: Item) => leftText(item.best_before);
  protected readonly expiring = (item: Item) => statusOf(item.best_before) !== null;

  /** "6 items · 2 expiring" */
  protected readonly countText = computed(() => {
    const items = this.inventory.items();
    const warnings = items.filter(this.expiring).length;
    return `${items.length} ${items.length === 1 ? 'item' : 'items'}${warnings ? ` · ${warnings} expiring` : ''}`;
  });

  /** The search looks in the item name, the category name and the storage location. */
  private readonly shown = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.inventory
      .items()
      .filter(
        (i) =>
          !q ||
          [i.name, i.category_name, i.location_name].some((t) =>
            (t ?? '').toLowerCase().includes(q),
          ),
      );
  });

  /** One group per category in the categories' order, then "No category". Expiring items go on top. */
  protected readonly groups = computed(() =>
    [...this.inventory.categories().map((c) => c.name), NO_CATEGORY]
      .map((name) => ({
        name,
        items: this.shown()
          .filter((i) => (i.category_name ?? NO_CATEGORY) === name)
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

  protected meta = (item: Item) =>
    [item.location_name, this.leftText(item)].filter(Boolean).join(' · ');
}
