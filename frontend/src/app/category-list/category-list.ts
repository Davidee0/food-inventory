import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../model/category';
import { CategoryService } from '../services/category-service';

@Component({
  imports: [FormsModule],
  selector: 'app-category-list',
  styleUrl: './category-list.css',
  templateUrl: './category-list.html',
})
export class CategoryList implements OnInit {
  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
  ) {}

  categories: Category[] = [];
  newName: string = ''; // [(ngModel)] binds it to the "New category" field

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.cdr.markForCheck();
    });
  }

  addCategory(): void {
    this.categoryService.addCategory({ id: 0, name: this.newName }).subscribe(() => {
      this.newName = '';
      this.loadCategories();
    });
  }

  updateCategory(category: Category): void {
    this.categoryService.updateCategory(category).subscribe(() => this.loadCategories());
  }

  deleteCategory(category: Category): void {
    if (confirm(`Delete ${category.name}?`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => alert(err.error), // e.g. "Dairy still has food in it, so it cannot be deleted."
      });
    }
  }
}
