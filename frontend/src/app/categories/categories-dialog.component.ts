import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, NETWORK_MESSAGE, toFailure } from '../core/api.service';
import { Category } from '../core/models';
import { CATEGORY_NAME_MAX, validateName } from '../core/validation';

interface Row { id: number; name: string; draft: string; item_count: number; error: string; busy: boolean; }

@Component({
  selector: 'app-categories-dialog',
  imports: [FormsModule],
  templateUrl: './categories-dialog.component.html',
})
export class CategoriesDialogComponent implements OnInit, AfterViewInit {
  /** Fires whenever categories changed so the page can refresh. */
  changed = output<void>();
  closed = output<void>();
  @ViewChild('dlg', { static: true }) dlg!: ElementRef<HTMLDialogElement>;

  rows: Row[] = [];
  loadError = '';
  loading = true;
  newName = '';
  newError = '';
  adding = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  ngAfterViewInit() {
    this.dlg.nativeElement.showModal();
  }

  async load() {
    this.loading = true;
    this.loadError = '';
    try {
      const cats: Category[] = await this.api.categories();
      this.rows = cats.map((c) => ({ id: c.id, name: c.name, draft: c.name, item_count: c.item_count, error: '', busy: false }));
    } catch (e) {
      this.loadError = toFailure(e).network ? NETWORK_MESSAGE : 'Could not load your categories.';
    } finally {
      this.loading = false;
    }
  }

  countLabel(n: number) {
    return n === 1 ? '1 item' : `${n} items`;
  }

  failure(e: unknown, fallback: string): string {
    const f = toFailure(e);
    if (f.network) return NETWORK_MESSAGE;
    if (f.errors?.['name']) return f.errors['name'];
    return f.message ?? fallback;
  }

  async add() {
    const invalid = validateName(this.newName, CATEGORY_NAME_MAX);
    if (invalid) { this.newError = invalid; return; }
    this.adding = true;
    this.newError = '';
    try {
      await this.api.createCategory(this.newName.trim());
      this.newName = '';
      this.changed.emit();
      await this.load();
    } catch (e) {
      this.newError = this.failure(e, 'Could not add the category. Try again.');
    } finally {
      this.adding = false;
    }
  }

  async save(row: Row) {
    const invalid = validateName(row.draft, CATEGORY_NAME_MAX);
    if (invalid) { row.error = invalid; return; }
    row.busy = true;
    row.error = '';
    try {
      const saved = await this.api.renameCategory(row.id, row.draft.trim());
      row.name = saved.name;
      row.draft = saved.name;
      this.changed.emit();
    } catch (e) {
      row.error = this.failure(e, 'Could not save the category. Try again.');
    } finally {
      row.busy = false;
    }
  }

  async remove(row: Row) {
    row.busy = true;
    row.error = '';
    try {
      await this.api.deleteCategory(row.id);
      this.rows = this.rows.filter((r) => r !== row);
      this.changed.emit();
    } catch (e) {
      row.error = this.failure(e, 'Could not delete the category. Try again.');
    } finally {
      row.busy = false;
    }
  }
}
