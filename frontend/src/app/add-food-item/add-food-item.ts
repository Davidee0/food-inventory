import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category } from '../model/category';
import { StorageLocation } from '../model/storage-location';
import { CategoryService } from '../services/category-service';
import { FoodItemService } from '../services/food-item-service';
import { StorageLocationService } from '../services/storage-location-service';

@Component({
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  selector: 'app-add-food-item',
  styleUrl: './add-food-item.css',
  templateUrl: './add-food-item.html',
})
export class AddFoodItem implements OnInit {
  constructor(
    private foodItemService: FoodItemService,
    private categoryService: CategoryService,
    private storageLocationService: StorageLocationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  categories: Category[] = [];
  storageLocations: StorageLocation[] = [];

  today: string = formatDate(new Date(), 'yyyy-MM-dd', 'en-US'); // today as "YYYY-MM-DD"

  name: FormControl = new FormControl('', [Validators.required]);
  quantity: FormControl = new FormControl(1, [
    Validators.required,
    Validators.min(1),
    Validators.pattern('\\d+'), // Only whole numbers
  ]);
  categoryId: FormControl = new FormControl(null); // optional
  storageLocationId: FormControl = new FormControl(null, [Validators.required]);
  purchaseDate: FormControl = new FormControl(this.today, [Validators.required]);
  bestBeforeDate: FormControl = new FormControl(''); // optional
  foodItemFormGroup: FormGroup = new FormGroup({
    name: this.name,
    quantity: this.quantity,
    categoryId: this.categoryId,
    storageLocationId: this.storageLocationId,
    purchaseDate: this.purchaseDate,
    bestBeforeDate: this.bestBeforeDate,
  });

  ngOnInit(): void {
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
    if (!this.bestBeforeDate.value) {
      return false; // no best before date: nothing to check
    }
    return this.bestBeforeDate.value < this.purchaseDate.value; // "YYYY-MM-DD" texts compare like dates
  }

  addFoodItem() {
    if (!this.foodItemFormGroup.valid || this.bestBeforeIsTooEarly()) {
      console.log('Data not valid');
      return;
    }
    this.foodItemService
      .addFoodItem({
        id: 0,
        name: this.name.value,
        quantity: this.quantity.value,
        categoryId: this.categoryId.value,
        storageLocationId: this.storageLocationId.value,
        purchaseDate: this.purchaseDate.value,
        bestBeforeDate: this.bestBeforeDate.value || null, // an empty date field gives '', the API wants null
      })
      .subscribe({
        next: () => {
          console.log('Done');
          this.router.navigate(['/food-items']);
        },
        error: (err) => console.error('Something went wrong: ' + err),
      });
  }
}
