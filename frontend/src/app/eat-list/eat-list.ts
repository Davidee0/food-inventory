import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FoodItem, expiryText } from '../model/food-item';
import { FoodItemService } from '../services/food-item-service';
import { NotificationService } from '../services/notification-service';

// "Ate it": each tap eats one (5 oranges become 4), the last one deletes the item. Undo in the snackbar.
@Component({
  selector: 'app-eat-list',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './eat-list.html',
})
export class EatList implements OnInit {
  constructor(
    private foodItemService: FoodItemService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  items: FoodItem[] = [];
  expiryText = expiryText;

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.foodItemService.getFoodItems().subscribe((items) => {
      this.items = items;
      this.cdr.markForCheck();
    });
  }

  ateOne(item: FoodItem): void {
    const request =
      item.quantity > 1
        ? this.foodItemService.updateFoodItem({ ...item, quantity: item.quantity - 1 })
        : this.foodItemService.deleteFoodItem(item.id);
    request.subscribe(() => {
      this.loadItems();
      this.notification
        .showSuccess(`1 ${item.name} eaten`, 'Undo')
        .onAction()
        .subscribe(() => this.undo(item));
    });
  }

  // Puts the item back as it was: the old quantity, or the whole item if the last one was eaten.
  undo(item: FoodItem): void {
    const request =
      item.quantity > 1
        ? this.foodItemService.updateFoodItem(item)
        : this.foodItemService.addFoodItem(item);
    request.subscribe(() => this.loadItems());
  }
}
