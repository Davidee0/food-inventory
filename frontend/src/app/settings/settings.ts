import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '../model/category';
import { StorageLocation } from '../model/storage-location';
import { CategoryService } from '../services/category-service';
import { StorageLocationService } from '../services/storage-location-service';
import { NotificationService } from '../services/notification-service';

// Settings (the gear): add, rename and delete categories and storage locations.
@Component({
  selector: 'app-settings',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  constructor(
    private categoryService: CategoryService,
    private storageLocationService: StorageLocationService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  categories: Category[] = [];
  locations: StorageLocation[] = [];
  newCategory: string = '';
  newLocation: string = '';

  ngOnInit(): void {
    this.loadCategories();
    this.loadLocations();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.cdr.markForCheck();
    });
  }

  loadLocations(): void {
    this.storageLocationService.getStorageLocations().subscribe((locations) => {
      this.locations = locations;
      this.cdr.markForCheck();
    });
  }

  addCategory(): void {
    this.categoryService.addCategory({ id: 0, name: this.newCategory.trim() }).subscribe(() => {
      this.newCategory = '';
      this.loadCategories();
    });
  }

  updateCategory(category: Category): void {
    this.categoryService.updateCategory(category).subscribe(() => this.notification.showSuccess(`${category.name} saved`));
  }

  // The API refuses a category that still has food in it and says why.
  deleteCategory(category: Category): void {
    if (confirm(`Delete ${category.name}?`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => this.notification.showError(err.error),
      });
    }
  }

  addLocation(): void {
    this.storageLocationService.addStorageLocation({ id: 0, name: this.newLocation.trim() }).subscribe(() => {
      this.newLocation = '';
      this.loadLocations();
    });
  }

  updateLocation(location: StorageLocation): void {
    this.storageLocationService.updateStorageLocation(location).subscribe(() => this.notification.showSuccess(`${location.name} saved`));
  }

  deleteLocation(location: StorageLocation): void {
    if (confirm(`Delete ${location.name}?`)) {
      this.storageLocationService.deleteStorageLocation(location.id).subscribe({
        next: () => this.loadLocations(),
        error: (err) => this.notification.showError(err.error),
      });
    }
  }
}
