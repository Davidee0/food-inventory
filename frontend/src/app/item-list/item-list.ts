import { Component, input, output } from '@angular/core';
import { Item } from '../core/models';

/** The items, soonest best before date first (the API sorts them), each with Edit and Delete. */
@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.html',
})
export class ItemList {
  readonly items = input.required<Item[]>();
  readonly edit = output<Item>();
  readonly remove = output<Item>();

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
