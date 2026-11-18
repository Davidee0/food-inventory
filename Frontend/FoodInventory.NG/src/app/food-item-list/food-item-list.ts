import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FoodItem } from '../model/food-item';
import { Category } from '../model/category';
import { StorageLocation } from '../model/storage-location';
import { FoodItemService } from '../services/food-item-service';
import { CategoryService } from '../services/category-service';
import { StorageLocationService } from '../services/storage-location-service';
import { FoodItemCard } from '../food-item-card/food-item-card';

// The start page (US2, US10): the food from the API, two filters and one card per food item (Lecture 5: list and card).
@Component({
  selector: 'app-food-item-list',
  imports: [FormsModule, RouterLink, MatButtonModule, FoodItemCard],
  templateUrl: './food-item-list.html',
  styleUrl: './food-item-list.css',
})
export class FoodItemList implements OnInit {
  constructor(
    private foodItemService: FoodItemService,
    private categoryService: CategoryService,
    private storageLocationService: StorageLocationService,
  ) {}

  // Signals: what arrives later from the API. The template reads them with () and
  // Angular draws the page again when .set(...) gives them a new value.
  foodItems = signal<FoodItem[]>([]); // sorted by the API: soonest best before date first
  categories = signal<Category[]>([]);
  storageLocations = signal<StorageLocation[]>([]);
  message = signal('');
  loading = signal(true);

  // The two filters, two-way bound with [(ngModel)]. 0 means "all".
  categoryId: number = 0;
  storageLocationId: number = 0;

  ngOnInit(): void {
    this.loadFoodItems();
    this.categoryService.getCategories().subscribe((categories) => this.categories.set(categories));
    this.storageLocationService
      .getStorageLocations()
      .subscribe((storageLocations) => this.storageLocations.set(storageLocations));
  }

  loadFoodItems(): void {
    this.foodItemService.getFoodItems().subscribe({
      next: (foodItems) => {
        this.foodItems.set(foodItems);
        this.message.set('');
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.message.set('Could not load your food. Check that the API is running.');
        console.error('API error fetching food items', error);
      },
    });
  }

  // US10: both filters can be combined.
  filteredFoodItems(): FoodItem[] {
    return this.foodItems().filter(
      (foodItem) =>
        (this.categoryId === 0 || foodItem.categoryId === this.categoryId) &&
        (this.storageLocationId === 0 || foodItem.storageLocationId === this.storageLocationId),
    );
  }

  clearFilters(): void {
    this.categoryId = 0;
    this.storageLocationId = 0;
  }
}
