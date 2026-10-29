import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Item } from '../model/item';
import { ItemService } from '../services/item-service';

@Component({
  selector: 'app-item-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './item-list.html',
})
export class ItemList implements OnInit {
  items: Item[] = [];

  constructor(
    private itemService: ItemService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.getItems();
  }

  getItems(): void {
    this.itemService.getItems().subscribe((items) => {
      this.items = items;
      this.cdr.markForCheck();
    });
  }

  // Reloads also when the delete fails, e.g. the item was already deleted on another phone.
  deleteItem(item: Item): void {
    if (confirm(`Delete ${item.name}?`)) {
      this.itemService
        .deleteItem(item.id)
        .pipe(finalize(() => this.getItems()))
        .subscribe();
    }
  }
}
