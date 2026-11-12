import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../model/category';
import { StorageLocation } from '../model/storage-location';
import { today } from '../model/food-item';
import { CategoryService } from '../services/category-service';
import { FoodItemService } from '../services/food-item-service';
import { StorageLocationService } from '../services/storage-location-service';
import { NotificationService } from '../services/notification-service';

// Add item (/add) and Edit item (/edit/:id).
@Component({
  selector: 'app-item-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './item-form.html',
})
export class ItemForm implements OnInit {
  constructor(
    private foodItemService: FoodItemService,
    private categoryService: CategoryService,
    private storageLocationService: StorageLocationService,
    private notification: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  @Input() id!: number; // from the route /edit/:id; empty when adding
  categories: Category[] = [];
  locations: StorageLocation[] = [];

  name: FormControl = new FormControl('', [Validators.required, Validators.maxLength(50)]);
  quantity: FormControl = new FormControl(1, [Validators.required, Validators.min(1)]);
  storageLocationId: FormControl = new FormControl(null, [Validators.required]);
  categoryId: FormControl = new FormControl(null);
  purchaseDate: FormControl = new FormControl(today(), [Validators.required]);
  bestBeforeDate: FormControl = new FormControl('');
  itemFormGroup: FormGroup = new FormGroup({
    name: this.name,
    quantity: this.quantity,
    storageLocationId: this.storageLocationId,
    categoryId: this.categoryId,
    purchaseDate: this.purchaseDate,
    bestBeforeDate: this.bestBeforeDate,
  });

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.cdr.markForCheck();
    });
    this.storageLocationService.getStorageLocations().subscribe((locations) => {
      this.locations = locations;
      this.cdr.markForCheck();
    });
    if (this.id) {
      this.foodItemService.getFoodItem(this.id).subscribe((item) => {
        this.itemFormGroup.patchValue(item);
        this.cdr.markForCheck();
      });
    }
  }

  saveItem(): void {
    if (!this.itemFormGroup.valid) {
      this.notification.showError('Please fill in all required fields');
      return;
    }
    if (this.bestBeforeDate.value && this.bestBeforeDate.value < this.purchaseDate.value) {
      this.notification.showError('Best before date cannot be before the purchase date');
      return;
    }
    const item = {
      id: Number(this.id ?? 0),
      name: this.name.value.trim(),
      quantity: this.quantity.value,
      storageLocationId: this.storageLocationId.value,
      categoryId: this.categoryId.value,
      purchaseDate: this.purchaseDate.value,
      bestBeforeDate: this.bestBeforeDate.value || null,
    };
    const request = this.id
      ? this.foodItemService.updateFoodItem(item)
      : this.foodItemService.addFoodItem(item);
    request.subscribe({
      next: () => {
        this.notification.showSuccess(`${item.name} saved`);
        this.router.navigate(['/items']);
      },
      error: (err) => {
        this.notification.showError('Could not save the item');
        console.error('Something went wrong: ', err);
      },
    });
  }
}
