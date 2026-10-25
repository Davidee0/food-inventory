import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, NETWORK_MESSAGE, toFailure } from '../core/api.service';
import { todayLocal } from '../core/date-utils';
import { Category, FieldErrors, Item, Location } from '../core/models';
import { ItemForm, validateItem } from '../core/validation';

@Component({
  selector: 'app-item-form',
  imports: [FormsModule],
  templateUrl: './item-form.component.html',
})
export class ItemFormComponent implements OnInit, AfterViewInit {
  /** Item being edited; null/undefined when adding. */
  item = input<Item | null>(null);
  locations = input.required<Location[]>();
  categories = input.required<Category[]>();
  /** Called after a successful save; the dialog stays open until it finishes (the list refresh). */
  onSaved = input.required<() => Promise<void>>();
  closed = output<void>();

  @ViewChild('dlg', { static: true }) dlg!: ElementRef<HTMLDialogElement>;

  form: ItemForm = { name: '', location_id: null, category_id: null, purchase_date: todayLocal(), best_before: '' };
  touched: Record<string, boolean> = {};
  submitted = false;
  serverErrors: FieldErrors = {};
  saveError = '';
  saving = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    const i = this.item();
    if (i) {
      this.form = {
        name: i.name,
        location_id: i.location_id,
        category_id: i.category_id,
        purchase_date: i.purchase_date,
        best_before: i.best_before ?? '',
      };
    }
  }

  ngAfterViewInit() {
    this.dlg.nativeElement.showModal();
  }

  get errors(): FieldErrors {
    return validateItem(this.form, this.locations().map((l) => l.id), this.categories().map((c) => c.id));
  }

  /** Client-side message, or the server's message for that field. */
  error(field: string): string | null {
    const shown = this.submitted || this.touched[field];
    return (shown && this.errors[field]) || this.serverErrors[field] || null;
  }

  edited(field: string) {
    this.touched[field] = true;
    delete this.serverErrors[field];
    this.saveError = '';
  }

  /** The best-before rule depends on the purchase date, so an old server message for it no longer applies. */
  purchaseEdited() {
    this.edited('purchase_date');
    delete this.serverErrors['best_before'];
  }

  async save() {
    this.submitted = true;
    if (this.saving || Object.keys(this.errors).length > 0) return;
    this.saving = true;
    this.saveError = '';
    const input = {
      name: this.form.name.trim(),
      location_id: this.form.location_id,
      category_id: this.form.category_id,
      purchase_date: this.form.purchase_date,
      best_before: this.form.best_before || null,
    };
    try {
      const existing = this.item();
      if (existing) await this.api.updateItem(existing.id, input);
      else await this.api.createItem(input);
      await this.onSaved()();
      this.dlg.nativeElement.close();
    } catch (e) {
      const f = toFailure(e);
      if (f.status === 400 && f.errors) {
        this.serverErrors = f.errors;
        const known = ['name', 'location_id', 'category_id', 'purchase_date', 'best_before'];
        if (!Object.keys(f.errors).some((k) => known.includes(k))) this.saveError = 'Could not save the item. Check the details and try again.';
      } else if (f.network) this.saveError = NETWORK_MESSAGE;
      else if (f.status === 404) this.saveError = 'This item no longer exists. Close this window and refresh the list.';
      else this.saveError = 'Could not save the item. Try again.';
    } finally {
      this.saving = false;
    }
  }

  onCancel(event: Event) {
    event.preventDefault();
    this.dlg.nativeElement.close();
  }
}
