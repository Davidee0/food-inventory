import { Component, OnInit, inject, signal } from '@angular/core';
import { Inventory, shapeOf } from '../inventory';
import { Item } from '../models';
import { leftText } from '../rules';
import { TopBar } from '../top-bar/top-bar';

/** "Ate it": a quick way to take eaten food off the list. The message bar offers Undo. */
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

  protected meta = (item: Item) =>
    [item.category_name, leftText(item.best_before)].filter(Boolean).join(' · ');

  protected async ate(item: Item) {
    if (this.busy().includes(item.id)) return;
    this.busy.update((ids) => [...ids, item.id]);
    await this.inventory.remove(item, 'eaten');
    this.busy.update((ids) => ids.filter((id) => id !== item.id));
  }
}
