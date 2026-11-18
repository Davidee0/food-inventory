import { Component, OnInit, signal } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../model/category';
import { StorageLocation } from '../model/storage-location';
import { FoodItemService } from '../services/food-item-service';
import { CategoryService } from '../services/category-service';
import { StorageLocationService } from '../services/storage-location-service';
import { NotificationService } from '../services/notification-service';

// Lecture 8: a reactive form with Angular Material, like add-student (with the snackbars of Lecture 10).
@Component({
  selector: 'app-add-food-item',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './add-food-item.html',
})
export class AddFoodItem implements OnInit {
  constructor(
    private foodItemService: FoodItemService,
    private categoryService: CategoryService,
    private storageLocationService: StorageLocationService,
    private router: Router,
    private notification: NotificationService,
  ) {}

  categories = signal<Category[]>([]);
  storageLocations = signal<StorageLocation[]>([]);

  // Lecture 7: client-side validation. The API checks the same with [Required] and [Range],
  // the database with not null and check.
  // The pattern needs one character that is not a space, so "   " is not a name.
  name: FormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('.*\\S.*'),
    Validators.maxLength(50),
  ]);
  quantity: FormControl = new FormControl(1, [
    Validators.required,
    Validators.pattern('[1-9][0-9]*'),
  ]);
  storageLocationId: FormControl = new FormControl(null, [Validators.required]);
  categoryId: FormControl = new FormControl(null);
  // Today as the local date. (toISOString() would give the UTC date,
  // which is yesterday or tomorrow in some time zones.)
  purchaseDate: FormControl = new FormControl(formatDate(new Date(), 'yyyy-MM-dd', 'en'), [
    Validators.required,
  ]);
  bestBeforeDate: FormControl = new FormControl('');

  foodItemFormGroup: FormGroup = new FormGroup({
    name: this.name,
    quantity: this.quantity,
    storageLocationId: this.storageLocationId,
    categoryId: this.categoryId,
    purchaseDate: this.purchaseDate,
    bestBeforeDate: this.bestBeforeDate,
  });

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((categories) => this.categories.set(categories));
    this.storageLocationService
      .getStorageLocations()
      .subscribe((storageLocations) => this.storageLocations.set(storageLocations));
  }

  // A rule that compares two fields. Both dates are "YYYY-MM-DD" texts, so < compares them correctly.
  bestBeforeTooEarly(): boolean {
    return this.bestBeforeDate.value !== '' && this.bestBeforeDate.value < this.purchaseDate.value;
  }

  addFoodItem(): void {
    if (!this.foodItemFormGroup.valid || this.bestBeforeTooEarly()) {
      this.notification.showError('Please fill in all required fields');
      console.log('Data not valid');
      return;
    }
    this.foodItemService
      .addFoodItem({
        id: 0, // the database gives the real id
        name: this.name.value.trim(), // " Milk " is saved as "Milk"
        quantity: this.quantity.value,
        storageLocationId: this.storageLocationId.value,
        categoryId: this.categoryId.value,
        purchaseDate: this.purchaseDate.value,
        bestBeforeDate: this.bestBeforeDate.value || null, // an empty date field is '', the API wants null
      })
      .subscribe({
        next: () => {
          this.notification.showSuccess(`${this.name.value.trim()} added`);
          this.router.navigate(['/food-items']);
        },
        error: (error) => {
          this.notification.showError(
            'Failed to add the food item. Check that the API is running.',
          );
          console.error('Something went wrong: ', error);
        },
      });
  }
}
