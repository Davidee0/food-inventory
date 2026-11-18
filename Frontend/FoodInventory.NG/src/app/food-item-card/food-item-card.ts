import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FoodItem } from '../model/food-item';
import { FoodItemService } from '../services/food-item-service';
import { NotificationService } from '../services/notification-service';

@Component({
  selector: 'app-food-item-card',
  imports: [DatePipe, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './food-item-card.html',
  styleUrl: './food-item-card.css',
})
export class FoodItemCard {
  constructor(
    private foodItemService: FoodItemService,
    private notification: NotificationService,
    private router: Router,
  ) {}

  @Input() foodItem!: FoodItem;
  @Output() changed = new EventEmitter<number>(); // the list then loads the food again

  // Compared as "YYYY-MM-DD" texts; formatDate gives the local date, not the UTC one.
  warning(): string {
    if (!this.foodItem.bestBeforeDate) {
      return '';
    }
    const today = new Date();
    const inThreeDays = new Date();
    inThreeDays.setDate(today.getDate() + 3);
    if (this.foodItem.bestBeforeDate < formatDate(today, 'yyyy-MM-dd', 'en')) {
      return 'Expired';
    }
    if (this.foodItem.bestBeforeDate <= formatDate(inThreeDays, 'yyyy-MM-dd', 'en')) {
      return 'Eat soon';
    }
    return '';
  }

  editFoodItem(id: number): void {
    this.router.navigate(['edit-food-item', id]);
  }

  // The last one is deleted, because the quantity must be at least 1.
  ateOne(): void {
    if (this.foodItem.quantity > 1) {
      this.foodItemService
        .updateFoodItem({ ...this.foodItem, quantity: this.foodItem.quantity - 1 })
        .subscribe({
          next: () => {
            this.notification.showSuccess(`Ate one ${this.foodItem.name}`);
            this.changed.emit(this.foodItem.id);
          },
          error: () =>
            this.notification.showError('Could not save. Check that the API is running.'),
        });
    } else {
      this.deleteFoodItem();
    }
  }

  deleteFoodItem(): void {
    if (confirm(`Delete ${this.foodItem.name}?`)) {
      this.foodItemService.deleteFoodItem(this.foodItem.id).subscribe({
        next: () => {
          this.notification.showSuccess(`${this.foodItem.name} deleted`);
          this.changed.emit(this.foodItem.id);
        },
        error: () =>
          this.notification.showError('Could not delete. Check that the API is running.'),
      });
    }
  }
}
