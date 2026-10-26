import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, errorMessage, fieldErrors } from '../core/api.service';
import { Category, Errors, Item, ItemInput, Location } from '../core/models';
import { todayLocal, validateItem } from '../core/rules';

/** The Add item / Edit item dialog. The fields are two-way bound to `form`. */
@Component({
  selector: 'app-item-form',
  imports: [FormsModule],
  templateUrl: './item-form.component.html',
})
export class ItemFormComponent implements OnInit, AfterViewInit {
  private api = inject(ApiService);

  /** The item to edit, or null to add a new one. */
  item = input<Item | null>(null);
  locations = input.required<Location[]>();
  categories = input.required<Category[]>();
  saved = output();
  closed = output();

  @ViewChild('dialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>;

  form: ItemInput = { name: '', location_id: null, category_id: null, purchase_date: todayLocal(), best_before: '' };
  errors: Errors = {};
  message = '';
  saving = false;

  ngOnInit() {
    const item = this.item();
    if (item) {
      const { name, location_id, category_id, purchase_date, best_before } = item;
      this.form = { name, location_id, category_id, purchase_date, best_before: best_before ?? '' };
    }
  }

  ngAfterViewInit() {
    this.dialog.nativeElement.showModal();
  }

  /** Nothing is sent while the form is invalid. If saving fails, what was typed stays in the form. */
  async save() {
    if (this.saving) return;
    this.message = '';
    this.errors = validateItem(this.form);
    if (Object.keys(this.errors).length) return this.focusFirstError();

    this.saving = true;
    try {
      await this.api.saveItem(this.form, this.item()?.id);
      this.saved.emit();
      this.dialog.nativeElement.close();
    } catch (error) {
      this.errors = fieldErrors(error) ?? {};
      if (Object.keys(this.errors).length) this.focusFirstError();
      else this.message = errorMessage(error);
    } finally {
      this.saving = false;
    }
  }

  private focusFirstError() {
    setTimeout(() => this.dialog.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }
}
