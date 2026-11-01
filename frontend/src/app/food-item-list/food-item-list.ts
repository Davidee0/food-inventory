import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FoodItemCard } from '../food-item-card/food-item-card';
import { Category } from '../model/category';
import { FoodItem } from '../model/food-item';
import { StorageLocation } from '../model/storage-location';
import { CategoryService } from '../services/category-service';
import { FoodItemService } from '../services/food-item-service';
import { StorageLocationService } from '../services/storage-location-service';

@Component({
  imports: [FoodItemCard, FormsModule],
  selector: 'app-food-item-list',
  styleUrl: './food-item-list.css',
  templateUrl: './food-item-list.html',
})
export class FoodItemList implements OnInit {
  constructor(
    private foodItemService: FoodItemService,
    private categoryService: CategoryService,
    private storageLocationService: StorageLocationService,
    private cdr: ChangeDetectorRef,
  ) {}

  foodItems: FoodItem[] = []; // Initialized with an empty array
  categories: Category[] = [];
  storageLocations: StorageLocation[] = [];

  // The filters, bound to the two selects with [(ngModel)]. 0 = show all.
  categoryId: number = 0;
  storageLocationId: number = 0;

  ngOnInit(): void {
    this.loadFoodItems();
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.cdr.markForCheck();
    });
    this.storageLocationService.getStorageLocations().subscribe((storageLocations) => {
      this.storageLocations = storageLocations;
      this.cdr.markForCheck();
    });
  }

  loadFoodItems(): void {
    this.foodItemService.getFoodItems().subscribe({
      next: (foodItems) => {
        console.log('API response:', foodItems);
        this.foodItems = foodItems; // sorted by the API: the food that expires first comes first
        this.cdr.markForCheck(); // the data came later: tell Angular to show it (Lecture 6)
      },
      error: (error) => {
        console.error('API error fetching food items:', error);
      },
    });
  }

  // The food items that match the two filters.
  filteredFoodItems(): FoodItem[] {
    return this.foodItems.filter(
      (foodItem) =>
        (this.categoryId === 0 || foodItem.categoryId === this.categoryId) &&
        (this.storageLocationId === 0 || foodItem.storageLocationId === this.storageLocationId),
    );
  }
}
