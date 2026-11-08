import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { Inventory } from '../inventory';

/**
 * The header of every page, a Material toolbar (lecture 8): U8 (or a back arrow) on the left, the title in the middle,
 * the gear on the right, which opens a menu with Categories and Storage locations.
 */
@Component({
  selector: 'app-top-bar',
  imports: [MatToolbarModule, MatButtonModule, MatMenuModule, RouterLink, Icon],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {
  protected readonly inventory = inject(Inventory);
  protected readonly router = inject(Router);

  readonly eyebrow = input('');
  readonly title = input.required<string>();
  /** Where the back arrow goes. Without it, the header shows U8 and the gear. */
  readonly back = input<string>();
}
