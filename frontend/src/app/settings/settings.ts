import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { Inventory } from '../inventory';
import { TopBar } from '../top-bar/top-bar';

/** Settings, opened from the gear: links to Categories and Storage locations. */
@Component({
  selector: 'app-settings',
  imports: [RouterLink, Icon, TopBar],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  protected readonly inventory = inject(Inventory);

  ngOnInit() {
    if (!this.inventory.loaded()) this.inventory.load();
  }
}
