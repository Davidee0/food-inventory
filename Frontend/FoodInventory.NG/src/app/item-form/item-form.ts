import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, errorMessage, fieldErrors } from '../api';
import { Category } from '../model/category';
import { Item, ItemInput } from '../model/item';
import { Location } from '../model/location';
import { Errors, todayLocal, validateItem } from '../rules';

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
  @Input() item: Item | null = null;
  @Input() locations: Location[] = [];
  @Input() categories: Category[] = [];
  @Output() saved = new EventEmitter<Item>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('dialog') private dialog!: ElementRef<HTMLDialogElement>;

  protected form: ItemInput = {
    name: '',
    locationId: null,
    categoryId: null,
    purchaseDate: todayLocal(),
    bestBefore: '',
  };
  protected readonly errors = signal<Errors>({});
  protected readonly message = signal('');
  protected readonly saving = signal(false);

  ngOnInit() {
    if (this.item) {
      const { name, locationId, categoryId, purchaseDate, bestBefore } = this.item;
      this.form = { name, locationId, categoryId, purchaseDate, bestBefore: bestBefore ?? '' };
    }
  }

  ngAfterViewInit() {
    this.dialog.nativeElement.showModal();
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
      this.saved.emit(await this.api.saveItem(this.form, this.item?.id));
      this.dialog.nativeElement.close();
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
      this.dialog.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
    );
    return true;
  }
}
