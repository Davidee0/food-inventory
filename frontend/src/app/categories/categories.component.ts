import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, errorMessage } from '../core/api.service';
import { Category } from '../core/models';

/** The Categories dialog: add, rename and delete. The API checks the names and answers in plain language. */
@Component({
  selector: 'app-categories',
  imports: [FormsModule],
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit, AfterViewInit {
  private api = inject(ApiService);
  closed = output();

  @ViewChild('dialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>;

  /** Each category with the name typed in its field. */
  rows: (Category & { draft: string })[] = [];
  newName = '';
  message = '';

  ngOnInit() {
    this.run();
  }

  ngAfterViewInit() {
    this.dialog.nativeElement.showModal();
  }

  async add() {
    if (await this.run(() => this.api.addCategory(this.newName))) this.newName = '';
  }

  rename(row: Category & { draft: string }) {
    this.run(() => this.api.renameCategory(row.id, row.draft));
  }

  remove(row: Category) {
    this.run(() => this.api.deleteCategory(row.id));
  }

  /** Runs a change, then reloads the list. A refused change (e.g. a category in use) shows the API's message. */
  private async run(change?: () => Promise<unknown>): Promise<boolean> {
    try {
      await change?.();
      this.rows = (await this.api.categories()).map((c) => ({ ...c, draft: c.name }));
      this.message = '';
      return true;
    } catch (error) {
      this.message = errorMessage(error);
      return false;
    }
  }
}
