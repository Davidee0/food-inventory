import { Component, EventEmitter, Input, Output } from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { FoodItem } from '../model/food-item';
import { FoodLog } from '../model/food-log';
import { FoodItemService } from '../services/food-item-service';
import { FoodLogService } from '../services/food-log-service';

@Component({
  imports: [],
  selector: 'app-food-item-card',
  styleUrl: './food-item-card.css',
  templateUrl: './food-item-card.html',
})
export class FoodItemCard {
  constructor(
    private foodItemService: FoodItemService,
    private foodLogService: FoodLogService,
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

  ateOne(): void {
    this.oneLess(false);
  }

  threwOneAway(): void {
    this.oneLess(true);
  }

  // "Ate one" and "Threw one away": the quantity goes down by 1; the last one deletes the food item (it asks first).
  // Once the API has saved that, the history gets a row: eaten, or wasted (US14).
  oneLess(wasted: boolean): void {
    const foodLog: FoodLog = {
      id: 0,
      name: this.foodItem.name,
      quantity: 1,
      logDate: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'), // today as "YYYY-MM-DD"
      wasted: wasted,
      categoryId: this.foodItem.categoryId,
    };
    if (this.foodItem.quantity > 1) {
      // a copy with one less: the card only changes after the API has saved it
      const left = { ...this.foodItem, quantity: this.foodItem.quantity - 1 };
      this.foodItemService.updateFoodItem(left).subscribe(() => this.addFoodLog(foodLog));
    } else if (confirm(`Delete ${this.foodItem.name}?`)) {
      this.foodItemService
        .deleteFoodItem(this.foodItem.id)
        .subscribe(() => this.addFoodLog(foodLog));
    }
  }

  addFoodLog(foodLog: FoodLog): void {
    this.foodLogService.addFoodLog(foodLog).subscribe(() => this.changed.emit());
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
