import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from '../model/category';
import { FoodItem } from '../model/food-item';
import { StorageLocation } from '../model/storage-location';
import { CategoryService } from '../services/category-service';
import { FoodItemService } from '../services/food-item-service';
import { StorageLocationService } from '../services/storage-location-service';

@Component({
  imports: [FormsModule],
  selector: 'app-edit-food-item',
  styleUrl: './edit-food-item.css',
  templateUrl: './edit-food-item.html',
})
export class EditFoodItem implements OnInit {
  @Input() id!: number; // from the route edit-food-item/:id
  foodItem!: FoodItem;
  categories: Category[] = [];
  storageLocations: StorageLocation[] = [];

  constructor(
    private foodItemService: FoodItemService,
    private categoryService: CategoryService,
    private storageLocationService: StorageLocationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.foodItemService.getFoodItem(this.id).subscribe((foodItem) => {
      this.foodItem = foodItem;
      this.cdr.markForCheck();
    });
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.cdr.markForCheck();
    });
    this.storageLocationService.getStorageLocations().subscribe((storageLocations) => {
      this.storageLocations = storageLocations;
      this.cdr.markForCheck();
    });
  }

  // Validation across two fields (Lecture 7): the best before date cannot be before the purchase date.
  bestBeforeIsTooEarly(): boolean {
    if (!this.foodItem.bestBeforeDate) {
      return false; // no best before date: nothing to check
    }
    return this.foodItem.bestBeforeDate < this.foodItem.purchaseDate; // "YYYY-MM-DD" texts compare like dates
  }

  updateFoodItem() {
    if (this.foodItem.bestBeforeDate === '') {
      this.foodItem.bestBeforeDate = null; // an emptied date field gives '', the API wants null
    }
    this.foodItemService.updateFoodItem(this.foodItem).subscribe(() => {
      this.router.navigate(['food-items']);
    });
  }
}
