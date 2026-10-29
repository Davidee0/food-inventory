import { Component, OnInit, inject, signal } from '@angular/core';
import { Inventory, shapeOf } from '../inventory';
import { FoodItem } from '../model/food-item';
import { leftText } from '../rules';
import { TopBar } from '../top-bar/top-bar';

/** "Ate it": one tap = one eaten (5 oranges become 4), with Undo in the message bar. */
@Component({
  selector: 'app-eat-list',
  imports: [TopBar],
  templateUrl: './eat-list.html',
  styleUrl: './eat-list.css',
})
export class EatList implements OnInit {
  protected readonly inventory = inject(Inventory);
  /** Items on their way out, so a second tap does nothing. */
  protected readonly busy = signal<number[]>([]);

  protected readonly shapeOf = shapeOf;

  ngOnInit() {
    this.inventory.lastMain = '/eat';
    this.inventory.load();
  }

  protected meta = (item: FoodItem) =>
    [item.categoryName, `Qty ${item.quantity}`, leftText(item.bestBeforeDate)]
      .filter(Boolean)
      .join(' · ');

  protected async ate(item: FoodItem) {
    if (this.busy().includes(item.id)) return;
    this.busy.update((ids) => [...ids, item.id]);
    await this.inventory.eatOne(item);
    this.busy.update((ids) => ids.filter((id) => id !== item.id));
  }
}
