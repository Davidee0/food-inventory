import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FoodItem } from '../model/food-item';
import { FoodItemService } from '../services/food-item-service';

@Component({
  imports: [],
  selector: 'app-food-item-card',
  styleUrl: './food-item-card.css',
  templateUrl: './food-item-card.html',
})
export class FoodItemCard {
  constructor(
    private foodItemService: FoodItemService,
    private router: Router,
  ) {}

  @Input() foodItem!: FoodItem; // from the parent: <app-food-item-card [foodItem]="foodItem">
  @Output() changed = new EventEmitter(); // tells the parent that the food list must be loaded again

  editFoodItem(id: number) {
    this.router.navigate(['edit-food-item', id]);
  }

  deleteFoodItem(): void {
    if (confirm(`Delete ${this.foodItem.name}?`)) {
      this.foodItemService.deleteFoodItem(this.foodItem.id).subscribe(() => this.changed.emit());
    }
  }

  // "Ate one": the quantity goes down by 1. Eating the last one deletes the food item.
  ateOne(): void {
    if (this.foodItem.quantity > 1) {
      this.foodItem.quantity = this.foodItem.quantity - 1;
      this.foodItemService.updateFoodItem(this.foodItem).subscribe(() => this.changed.emit());
    } else {
      this.deleteFoodItem();
    }
  }

  // Days until the best before date: 0 = today, below 0 = expired.
  daysLeft(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // midnight today
    const bestBefore = new Date(this.foodItem.bestBeforeDate + 'T00:00'); // midnight that day
    const oneDay = 24 * 60 * 60 * 1000; // in milliseconds
    return Math.round((bestBefore.getTime() - today.getTime()) / oneDay);
  }
}
