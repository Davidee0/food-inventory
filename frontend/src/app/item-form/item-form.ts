import { Component, ElementRef, OnInit, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Icon } from '../icon/icon';
import { Inventory, errorMessage } from '../inventory';
import { FoodItem } from '../model/food-item';
import { FoodItemService } from '../services/food-item-service';
import { itemForm, messageOf, todayLocal } from '../rules';
import { TopBar } from '../top-bar/top-bar';

/**
 * The Add item page (/add) and the Edit item page (/edit/:id): a reactive form with Angular Material fields (lecture 8).
 * The rules and messages are in rules.ts.
 */
@Component({
  selector: 'app-item-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterLink,
    Icon,
    TopBar,
  ],
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

  protected readonly form = itemForm();
  protected readonly messageOf = (field: keyof typeof this.form.controls) =>
    messageOf(this.form, field);
  protected readonly editing = signal<FoodItem | null>(null);
  /** The form shows once the storage locations are there (the form cannot be filled in without them). */
  protected readonly ready = signal(false);
  protected readonly notFound = signal(false);
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
      this.form.patchValue(item);
    }
    this.ready.set(true);
    this.focus('#f-name');
  }

  protected async retry() {
    await this.ngOnInit();
  }

  /** Nothing is sent while the form is invalid. If saving fails, what was typed stays in the form. */
  protected async save(addAnother = false) {
    if (this.saving()) return;
    this.message.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // shows every field's message
      this.focus('[aria-invalid="true"]');
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const item: FoodItem = {
      id: this.editing()?.id ?? 0,
      ...value,
      name: value.name.trim(),
      // A cleared date field gives '', which the API cannot read as a date.
      bestBeforeDate: value.bestBeforeDate || null,
    };
    try {
      const adding = !this.editing();
      await firstValueFrom(
        adding ? this.foodItemService.addFoodItem(item) : this.foodItemService.updateFoodItem(item),
      );
      await this.inventory.load();
      if (adding && addAnother) {
        this.form.reset(itemForm(item.storageLocationId).getRawValue()); // the next item, same storage location
        this.focus('#f-name');
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

  private focus(selector: string) {
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus());
  }
}
