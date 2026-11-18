import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../model/category';
import { CategoryService } from '../services/category-service';
import { NotificationService } from '../services/notification-service';

// Categories (US9): rename with two-way data binding, add and delete.
@Component({
  selector: 'app-category-list',
  imports: [FormsModule, MatButtonModule],
  templateUrl: './category-list.html',
})
export class CategoryList implements OnInit {
  constructor(
    private categoryService: CategoryService,
    private notification: NotificationService,
  ) {}

  categories = signal<Category[]>([]);
  newName: string = ''; // two-way bound to the "New category" field

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((categories) => this.categories.set(categories));
  }

  addCategory(): void {
    this.categoryService.addCategory({ id: 0, name: this.newName.trim() }).subscribe({
      next: () => {
        this.notification.showSuccess(`${this.newName.trim()} added`);
        this.newName = '';
        this.loadCategories();
      },
      error: () => this.notification.showError('Failed to add the category'),
    });
  }

  updateCategory(category: Category): void {
    category.name = category.name.trim();
    this.categoryService.updateCategory(category).subscribe({
      next: () => this.notification.showSuccess(`${category.name} saved`),
      error: () => this.notification.showError('Failed to save the category'),
    });
  }

  // The API refuses to delete a category that still has food in it (409) and says why;
  // the snackbar shows that message. Other errors (e.g. the API is not running) get a general one.
  deleteCategory(category: Category): void {
    if (confirm(`Delete ${category.name}?`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.notification.showSuccess(`${category.name} deleted`);
          this.loadCategories();
        },
        error: (error) => {
          if (error.status === 409) {
            this.notification.showError(error.error);
          } else {
            this.notification.showError('Failed to delete the category');
          }
        },
      });
    }
  }
}
