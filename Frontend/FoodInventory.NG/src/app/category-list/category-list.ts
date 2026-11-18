import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../model/category';
import { CategoryService } from '../services/category-service';

@Component({
  selector: 'app-category-list',
  imports: [FormsModule, MatButtonModule],
  templateUrl: './category-list.html',
})
export class CategoryList implements OnInit {
  constructor(private categoryService: CategoryService) {}

  categories = signal<Category[]>([]);
  message = signal('');
  newName: string = ''; // two-way bound to the "New category" field

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((categories) => this.categories.set(categories));
  }

  addCategory(): void {
    this.categoryService.addCategory({ id: 0, name: this.newName }).subscribe(() => {
      this.message.set(`${this.newName} added`);
      this.newName = '';
      this.loadCategories();
    });
  }

  updateCategory(category: Category): void {
    this.categoryService.updateCategory(category).subscribe(() => this.message.set(`${category.name} saved`));
  }

  // The API refuses to delete a category that still has food in it (409) and says why; the page shows that message.
  deleteCategory(category: Category): void {
    if (confirm(`Delete ${category.name}?`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.message.set(`${category.name} deleted`);
          this.loadCategories();
        },
        error: (error) => this.message.set(error.error),
      });
    }
  }
}
