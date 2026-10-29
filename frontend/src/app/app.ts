import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from './icon/icon';
import { Inventory } from './inventory';

/** The frame of every page: the page of the current route, the message bar, and the tab bar at the bottom. */
@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly inventory = inject(Inventory);

  protected undo(run: () => void) {
    this.inventory.say('');
    run();
  }
}
