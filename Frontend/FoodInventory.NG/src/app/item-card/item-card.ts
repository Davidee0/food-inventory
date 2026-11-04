import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Item } from '../model/item';

/** One item of the list: name, place, dates, and Edit / Delete, which the list handles. */
@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.html',
  styleUrl: './item-card.css',
})
export class ItemCard {
  @Input() item!: Item;
  @Output() edit = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  /** "Fridge, Dairy", or only "Fridge" when the item has no category. */
  protected place = () =>
    [this.item.locationName, this.item.categoryName].filter(Boolean).join(', ');

  /** "3 Oct 2026" in the user's language. T00:00 makes it local midnight, not UTC. */
  protected niceDate = (date: string) =>
    new Date(`${date}T00:00`).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
}
