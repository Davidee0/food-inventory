import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../model/category';
import { CategoryService } from '../services/category-service';
import { NotificationService } from '../services/notification-service';

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
  newName: string = '';

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

  // 409: the category still has food, and the API's message says so.
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
