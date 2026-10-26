import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../api';
import { Category } from '../models';

type Row = Category & { draft: string }; // a category and the name typed in its field

/** The Categories page: add, rename and delete. The API checks the names and answers in plain language. */
@Component({
  selector: 'app-categories',
  imports: [FormsModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  private readonly api = inject(Api);

  protected readonly rows = signal<Row[]>([]);
  protected readonly newName = signal('');
  protected readonly message = signal('');

  /** "1 item", "2 items". */
  protected count = (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`;

  ngOnInit() {
    this.run();
  }

  protected async add() {
    if (await this.run(() => this.api.addCategory(this.newName()))) this.newName.set('');
  }

  protected rename(row: Row) {
    this.run(() => this.api.renameCategory(row.id, row.draft));
  }

  protected remove(row: Row) {
    this.run(() => this.api.deleteCategory(row.id));
  }

  /** Runs a change, then reloads the list. A refused change (e.g. a category in use) shows the API's message. */
  private async run(change?: () => Promise<unknown>): Promise<boolean> {
    try {
      await change?.();
      this.rows.set((await this.api.categories()).map((c) => ({ ...c, draft: c.name })));
      this.message.set('');
      return true;
    } catch (error) {
      this.message.set(errorMessage(error));
      return false;
    }
  }
}
