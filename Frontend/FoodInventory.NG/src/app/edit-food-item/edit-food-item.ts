import { Component, Input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FoodItem } from '../model/food-item';
import { Category } from '../model/category';
import { StorageLocation } from '../model/storage-location';
import { FoodItemService } from '../services/food-item-service';
import { CategoryService } from '../services/category-service';
import { StorageLocationService } from '../services/storage-location-service';

// Lecture 7: a template-driven form with two-way data binding, like edit-student.
@Component({
  selector: 'app-edit-food-item',
  imports: [FormsModule, MatButtonModule],
  templateUrl: './edit-food-item.html',
})
export class EditFoodItem implements OnInit {
  constructor(
    private foodItemService: FoodItemService,
    private categoryService: CategoryService,
    private storageLocationService: StorageLocationService,
    private router: Router,
  ) {}

  @Input() id!: number; // from the route edit-food-item/:id

  // Empty until the API answers; the template waits for it with @if.
  foodItem = signal<FoodItem | undefined>(undefined);
  categories = signal<Category[]>([]);
  storageLocations = signal<StorageLocation[]>([]);
  message = signal('');

  ngOnInit(): void {
    this.foodItemService.getFoodItem(this.id).subscribe({
      next: (foodItem) => this.foodItem.set(foodItem),
      error: (error) => {
        this.message.set('This food item could not be loaded.');
        console.error('API error fetching food item', error);
      },
    });
    this.categoryService.getCategories().subscribe((categories) => this.categories.set(categories));
    this.storageLocationService
      .getStorageLocations()
      .subscribe((storageLocations) => this.storageLocations.set(storageLocations));
  }

  // A rule that compares two fields. Both dates are "YYYY-MM-DD" texts, so < compares them correctly.
  bestBeforeTooEarly(foodItem: FoodItem): boolean {
    return !!foodItem.bestBeforeDate && foodItem.bestBeforeDate < foodItem.purchaseDate;
  }

  // PUT sends the whole food item, id included.
  updateFoodItem(foodItem: FoodItem): void {
    if (!foodItem.bestBeforeDate) {
      foodItem.bestBeforeDate = null; // an emptied date field is '', the API wants null
    }
    this.foodItemService.updateFoodItem(foodItem).subscribe({
      next: () => this.router.navigate(['food-items']),
      error: (error) => {
        this.message.set('The food item could not be saved. Check the fields and that the API is running.');
        console.error('Something went wrong: ', error);
      },
    });
  }
}
