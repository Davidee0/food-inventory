import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FoodItem } from '../model/food-item';
import { FoodItemService } from '../services/food-item-service';

@Component({
  selector: 'app-food-item-card',
  imports: [DatePipe, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './food-item-card.html',
  styleUrl: './food-item-card.css',
})
export class FoodItemCard {
  constructor(
    private foodItemService: FoodItemService,
    private router: Router,
  ) {}

  @Input() foodItem!: FoodItem; // parent to child: the list gives the card its food item
  @Output() changed = new EventEmitter<void>(); // child to parent: the list loads the food again

  // US11: "Expired" or "Eat soon" (best before date within 3 days); food without a date is never flagged.
  // formatDate gives the local date as "YYYY-MM-DD", the same format as the API, so the texts can be compared.
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

  editFoodItem(): void {
    this.router.navigate(['edit-food-item', this.foodItem.id]);
  }

  // US7: one less. PUT sends the whole food item (a copy with the new quantity); the last one is deleted instead.
  ateOne(): void {
    if (this.foodItem.quantity > 1) {
      this.foodItemService
        .updateFoodItem({ ...this.foodItem, quantity: this.foodItem.quantity - 1 })
        .subscribe(() => this.changed.emit());
    } else {
      this.deleteFoodItem();
    }
  }

  // US4: the browser asks first.
  deleteFoodItem(): void {
    if (confirm(`Remove ${this.foodItem.name} from your food?`)) {
      this.foodItemService.deleteFoodItem(this.foodItem.id).subscribe(() => this.changed.emit());
    }
  }
}
