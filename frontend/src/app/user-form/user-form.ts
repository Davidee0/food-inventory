import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Icon } from '../icon/icon';
import { Inventory } from '../inventory';
import { Errors } from '../models';
import { TopBar } from '../top-bar/top-bar';

/** The user, opened from Settings. Kept in this browser until the API has a users route. */
@Component({
  selector: 'app-user-form',
  imports: [FormsModule, Icon, TopBar],
  templateUrl: './user-form.html',
})
export class UserForm {
  private readonly inventory = inject(Inventory);
  private readonly router = inject(Router);

  protected form = { ...this.inventory.user() };
  protected readonly errors = signal<Errors>({});

  protected save() {
    const username = this.form.username.trim();
    const email = this.form.email.trim();
    const errors: Errors = {};
    if (username.length < 1 || username.length > 30)
      errors['username'] = 'Username must be 1 to 30 characters.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors['email'] = 'Enter an email like name@example.com.';
    this.errors.set(errors);
    if (Object.keys(errors).length) return;
    if (!this.inventory.saveUser({ username, email }))
      return this.inventory.say('Could not save the user on this device.');
    this.router.navigateByUrl('/settings');
    this.inventory.say('User saved');
  }
}
