import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { Inventory } from '../inventory';
import { TopBar } from '../top-bar/top-bar';

/** Settings. Categories and Storage locations open real pages; the other rows are only for show for now. */
@Component({
  selector: 'app-settings',
  imports: [RouterLink, Icon, TopBar],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  protected readonly inventory = inject(Inventory);
  protected readonly reminders = signal(true);

  ngOnInit() {
    if (!this.inventory.loaded()) this.inventory.load();
  }
}
