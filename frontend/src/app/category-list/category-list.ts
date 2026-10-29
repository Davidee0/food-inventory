import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Inventory, errorMessage } from '../inventory';
import { Category } from '../model/category';
import { CategoryService } from '../services/category-service';
import { TopBar } from '../top-bar/top-bar';

type Row = Category & { draft: string }; // a category and the name typed in its field

/** Categories, opened from the gear: add, rename and delete. The API checks the names and answers in plain language. */
@Component({
  selector: 'app-category-list',
  imports: [FormsModule, TopBar],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  private readonly categoryService = inject(CategoryService);
  protected readonly inventory = inject(Inventory);

  protected readonly rows = signal<Row[]>([]);
  protected readonly newName = signal('');
  protected readonly message = signal('');

  /** "Used by 1 item", "Used by 2 items". */
  protected count = (row: Row) => {
    const n = this.inventory.items().filter((i) => i.categoryId === row.id).length;
    return `Used by ${n} ${n === 1 ? 'item' : 'items'}`;
  };

  ngOnInit() {
    this.run();
  }

  protected async add() {
    const name = this.newName().trim();
    const added = await this.run(
      () => firstValueFrom(this.categoryService.addCategory({ id: 0, name })),
      `${name} added`,
    );
    if (added) this.newName.set('');
  }

  protected rename(row: Row) {
    const name = row.draft.trim();
    this.run(
      () => firstValueFrom(this.categoryService.updateCategory({ id: row.id, name })),
      `${name} saved`,
    );
  }

  /** A category that still has food in it is refused by the API, which says why. */
  protected remove(row: Row) {
    if (!confirm(`Delete the category ${row.name}?`)) return;
    this.run(
      () => firstValueFrom(this.categoryService.deleteCategory(row.id)),
      `${row.name} deleted`,
    );
  }

  /** Runs a change, then loads everything again. A refused change shows the API's message. */
  private async run(change?: () => Promise<unknown>, done = ''): Promise<boolean> {
    try {
      await change?.();
      this.message.set('');
      if (done) this.inventory.say(done);
    } catch (error) {
      this.message.set(errorMessage(error));
      return false;
    }
    await this.inventory.load(); // the item list shows category names, so it needs the change too
    if (this.inventory.loadError()) this.message.set(this.inventory.loadError());
    this.rows.set(this.inventory.categories().map((c) => ({ ...c, draft: c.name })));
    return true;
  }
}
