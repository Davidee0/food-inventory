import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, errorMessage, fieldErrors } from '../api';
import { Category, Errors, Item, ItemInput, Location } from '../models';
import { todayLocal, validateItem } from '../rules';

/** The Add item / Edit item dialog. The fields are two-way bound to `form`. */
@Component({
  selector: 'app-item-form',
  imports: [FormsModule],
  templateUrl: './item-form.html',
  styleUrl: './item-form.css',
})
export class ItemForm implements OnInit, AfterViewInit {
  private readonly api = inject(Api);

  /** The item to edit, or null to add a new one. */
  readonly item = input<Item | null>(null);
  readonly locations = input.required<Location[]>();
  readonly categories = input.required<Category[]>();
  readonly saved = output();
  readonly closed = output();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected form: ItemInput = {
    name: '',
    location_id: null,
    category_id: null,
    purchase_date: todayLocal(),
    best_before: '',
  };
  protected readonly errors = signal<Errors>({});
  protected readonly message = signal('');
  protected readonly saving = signal(false);

  ngOnInit() {
    const item = this.item();
    if (item) {
      const { name, location_id, category_id, purchase_date, best_before } = item;
      this.form = { name, location_id, category_id, purchase_date, best_before: best_before ?? '' };
    }
  }

  ngAfterViewInit() {
    this.dialog().nativeElement.showModal();
  }

  /** Typing in a field removes its message. */
  protected clear(field: string) {
    this.errors.update((errors) => ({ ...errors, [field]: '' }));
  }

  /** Nothing is sent while the form is invalid. If saving fails, what was typed stays in the form. */
  protected async save() {
    if (this.saving()) return;
    this.message.set('');
    if (this.fail(validateItem(this.form))) return;

    this.saving.set(true);
    try {
      await this.api.saveItem(this.form, this.item()?.id);
      this.saved.emit();
      this.dialog().nativeElement.close();
    } catch (error) {
      if (!this.fail(fieldErrors(error) ?? {})) this.message.set(errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }

  /** Shows the messages and moves the focus to the first field with one. False when there are none. */
  private fail(errors: Errors): boolean {
    this.errors.set(errors);
    if (!Object.keys(errors).length) return false;
    setTimeout(() =>
      this.dialog().nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
    );
    return true;
  }
}
