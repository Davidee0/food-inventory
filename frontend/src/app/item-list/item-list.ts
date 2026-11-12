import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FoodItem, expiryText } from '../model/food-item';
import { FoodItemService } from '../services/food-item-service';
import { NotificationService } from '../services/notification-service';

@Component({
  selector: 'app-item-list',
  imports: [DatePipe, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './item-list.html',
})
export class ItemList implements OnInit {
  constructor(
    private foodItemService: FoodItemService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: FoodItem[] = []; // sorted by the API: soonest best before date first
  filteredItems: FoodItem[] = [];
  searchTerm: string = '';
  expiryText = expiryText;

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.foodItemService.getFoodItems().subscribe({
      next: (items) => {
        this.items = items;
        this.filterItems();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.notification.showError('Could not load the food items');
        console.error('API error fetching food items', error);
      },
    });
  }

  filterItems(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredItems = this.items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        (item.categoryName ?? '').toLowerCase().includes(term) ||
        (item.storageLocationName ?? '').toLowerCase().includes(term),
    );
  }

  deleteItem(item: FoodItem): void {
    if (confirm(`Delete ${item.name}?`)) {
      this.foodItemService.deleteFoodItem(item.id).subscribe(() => {
        this.notification.showSuccess(`${item.name} deleted`);
        this.loadItems();
      });
    }
  }
}
