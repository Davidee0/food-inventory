import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FoodLog } from '../model/food-log';
import { FoodLogService } from '../services/food-log-service';

// The history (US14): what was eaten and what was thrown away, and the share that was wasted.
@Component({
  imports: [],
  selector: 'app-food-log-list',
  styleUrl: './food-log-list.css',
  templateUrl: './food-log-list.html',
})
export class FoodLogList implements OnInit {
  constructor(
    private foodLogService: FoodLogService,
    private cdr: ChangeDetectorRef,
  ) {}

  foodLogs: FoodLog[] = [];

  ngOnInit(): void {
    this.loadFoodLogs();
  }

  loadFoodLogs(): void {
    this.foodLogService.getFoodLogs().subscribe((foodLogs) => {
      this.foodLogs = foodLogs; // sorted by the API: the newest first
      this.cdr.markForCheck();
    });
  }

  // How many were thrown away (wasted true) or eaten (wasted false).
  total(wasted: boolean): number {
    let total = 0;
    for (const foodLog of this.foodLogs) {
      if (foodLog.wasted === wasted) {
        total += foodLog.quantity;
      }
    }
    return total;
  }

  // The share of the food that was thrown away, in percent: the number the household wants to bring down.
  wastedPercent(): number {
    const all = this.total(true) + this.total(false);
    if (all === 0) {
      return 0;
    }
    return Math.round((this.total(true) / all) * 100);
  }

  deleteFoodLog(foodLog: FoodLog): void {
    if (confirm(`Delete ${foodLog.name} from the history?`)) {
      this.foodLogService.deleteFoodLog(foodLog.id).subscribe(() => this.loadFoodLogs());
    }
  }
}
