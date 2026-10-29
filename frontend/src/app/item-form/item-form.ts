import { Component, ElementRef, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Icon } from '../icon/icon';
import { Inventory, errorMessage } from '../inventory';
import { FoodItem } from '../model/food-item';
import { FoodItemService } from '../services/food-item-service';
import { Errors, todayLocal, validateItem } from '../rules';
import { TopBar } from '../top-bar/top-bar';

const empty = (storageLocationId: number | null = null): FoodItem => ({
  id: 0,
  name: '',
  quantity: 1,
  purchaseDate: todayLocal(), // date purchased is today unless the user changes it
  bestBeforeDate: null,
  categoryId: null,
  storageLocationId,
});

/** The Add item page (/add) and the Edit item page (/edit/:id). The fields are two-way bound to `form`. */
@Component({
  selector: 'app-item-form',
  imports: [FormsModule, RouterLink, Icon, TopBar],
  templateUrl: './item-form.html',
  styleUrl: './item-form.css',
})
export class ItemForm implements OnInit {
  private readonly foodItemService = inject(FoodItemService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly inventory = inject(Inventory);

  /** From the route /edit/:id. Without it, the page adds a new item. */
  readonly id = input<string>();

  protected form: FoodItem = empty();
  protected readonly editing = signal<FoodItem | null>(null);
  /** The form shows once the storage locations are there (the form cannot be filled in without them). */
  protected readonly ready = signal(false);
  protected readonly notFound = signal(false);
  protected readonly errors = signal<Errors>({});
  protected readonly message = signal('');
  protected readonly saving = signal(false);
  protected readonly today = todayLocal();

  async ngOnInit() {
    if (!this.inventory.locations().length || this.id()) await this.inventory.load();
    if (!this.inventory.locations().length) return; // the page shows the load error and Try again
    if (this.id()) {
      const item = this.inventory.items().find((i) => i.id === Number(this.id()));
      if (!item) return this.notFound.set(true);
      this.editing.set(item);
      this.form = { ...item };
    }
    this.ready.set(true);
    this.focus('#f-name');
  }

  protected async retry() {
    await this.ngOnInit();
  }

  /** Typing in a field removes its message. */
  protected clear(field: string) {
    if (this.errors()[field]) this.errors.update((errors) => ({ ...errors, [field]: '' }));
  }

  /** Nothing is sent while the form is invalid. If saving fails, what was typed stays in the form. */
  protected async save(addAnother = false) {
    if (this.saving()) return;
    this.message.set('');
    if (this.fail(validateItem(this.form))) return;

    this.saving.set(true);
    // A cleared date field gives '', which the API cannot read as a date.
    const item = {
      ...this.form,
      name: this.form.name.trim(),
      bestBeforeDate: this.form.bestBeforeDate || null,
    };
    try {
      const adding = !this.editing();
      await firstValueFrom(
        adding ? this.foodItemService.addFoodItem(item) : this.foodItemService.updateFoodItem(item),
      );
      await this.inventory.load();
      if (adding && addAnother) {
        this.form = empty(this.form.storageLocationId); // the next item, same storage location
        this.ready.set(false);
        setTimeout(() => {
          this.ready.set(true);
          this.focus('#f-name');
        });
      } else {
        this.router.navigateByUrl('/items');
      }
      this.inventory.say(`${item.name} ${adding ? 'added' : 'saved'}`);
    } catch (error) {
      this.message.set(errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }

  protected async remove() {
    const item = this.editing();
    if (item && (await this.inventory.remove(item, 'deleted'))) this.router.navigateByUrl('/items');
  }

  /** Shows the messages and moves the focus to the first field with one. False when there are none. */
  private fail(errors: Errors): boolean {
    this.errors.set(errors);
    if (!Object.values(errors).some(Boolean)) return false;
    this.focus('[aria-invalid="true"]');
    return true;
  }

  private focus(selector: string) {
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus());
  }
}
