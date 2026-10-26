import { Component, input, output } from '@angular/core';
import { Item } from '../core/models';

/** The items, soonest best before date first (the API sorts them), each with Edit and Delete. */
@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
})
export class ItemListComponent {
  items = input.required<Item[]>();
  edit = output<Item>();
  remove = output<Item>();

  /** "3 Oct 2026" in the user's language. T00:00 makes it local midnight, not UTC. */
  niceDate = (date: string) => new Date(`${date}T00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
