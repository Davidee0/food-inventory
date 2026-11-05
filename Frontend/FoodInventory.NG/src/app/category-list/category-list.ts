import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, errorMessage } from '../api';
import { CategoryCard } from '../category-card/category-card';
import { Category } from '../model/category';

/** The category list: add, and a card per category to rename or delete it. The API checks the names and answers in plain language. */
@Component({
  selector: 'app-category-list',
  imports: [FormsModule, CategoryCard],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  private readonly api = inject(Api);

  protected readonly categories = signal<Category[]>([]);
  protected readonly newName = signal('');
  protected readonly message = signal('');
  protected readonly loaded = signal(false);

  ngOnInit() {
    this.run();
  }

  protected async add() {
    if (await this.run(() => this.api.addCategory(this.newName()))) this.newName.set('');
  }

  protected rename(category: Category, name: string) {
    this.run(() => this.api.renameCategory(category.id, name));
  }

  protected remove(category: Category) {
    this.run(() => this.api.deleteCategory(category.id));
  }

  /** Runs a change, then reloads the list. A refused change (e.g. a category in use) shows the API's message. */
  private async run(change?: () => Promise<unknown>): Promise<boolean> {
    try {
      await change?.();
      this.categories.set(await this.api.categories());
      this.message.set('');
      return true;
    } catch (error) {
      this.message.set(errorMessage(error));
      return false;
    } finally {
      this.loaded.set(true);
    }
  }
}
