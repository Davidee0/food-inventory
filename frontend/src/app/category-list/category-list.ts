import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../model/category';
import { CategoryService } from '../services/category-service';

@Component({
  selector: 'app-category-list',
  imports: [FormsModule],
  templateUrl: './category-list.html',
})
export class CategoryList implements OnInit {
  categories: Category[] = [];
  newName = '';

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.cdr.markForCheck();
    });
  }

  addCategory(): void {
    this.categoryService.addCategory({ id: 0, name: this.newName }).subscribe(() => {
      this.newName = '';
      this.getCategories();
    });
  }

  updateCategory(category: Category): void {
    this.categoryService.updateCategory(category).subscribe(() => this.getCategories());
  }

  // Its items stay, without a category (on delete set null in the database).
  deleteCategory(category: Category): void {
    if (confirm(`Delete ${category.name}?`)) {
      this.categoryService.deleteCategory(category.id).subscribe(() => this.getCategories());
    }
  }
}
