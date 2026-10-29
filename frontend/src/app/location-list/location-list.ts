import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, errorMessage } from '../api';
import { Inventory } from '../inventory';
import { Location } from '../models';
import { TopBar } from '../top-bar/top-bar';

type Row = Location & { draft: string }; // a location and the name typed in its field

/** Storage locations, opened from Settings: add, rename and delete. The API checks the names and answers in plain language. */
@Component({
  selector: 'app-location-list',
  imports: [FormsModule, TopBar],
  templateUrl: './location-list.html',
  styleUrl: './location-list.css',
})
export class LocationList implements OnInit {
  private readonly api = inject(Api);
  private readonly inventory = inject(Inventory);

  protected readonly rows = signal<Row[]>([]);
  protected readonly newName = signal('');
  protected readonly message = signal('');

  /** "Holds 1 item", "Holds 2 items". */
  protected count = (n: number) => `Holds ${n} ${n === 1 ? 'item' : 'items'}`;

  ngOnInit() {
    this.run();
  }

  protected async add() {
    const name = this.newName().trim();
    if (await this.run(() => this.api.addLocation(name), `${name} added`)) this.newName.set('');
  }

  protected rename(row: Row) {
    this.run(() => this.api.renameLocation(row.id, row.draft), `${row.draft.trim()} saved`);
  }

  protected remove(row: Row) {
    if (!confirm(`Delete the location ${row.name}?`)) return;
    this.run(() => this.api.deleteLocation(row.id), `${row.name} deleted`);
  }

  /** Runs a change, then loads everything again. A refused change (e.g. a location in use) shows the API's message. */
  private async run(change?: () => Promise<unknown>, done = ''): Promise<boolean> {
    try {
      await change?.();
      this.message.set('');
      if (done) this.inventory.say(done);
    } catch (error) {
      this.message.set(errorMessage(error));
      return false;
    }
    await this.inventory.load(); // the item list and the form show location names, so it needs the change too
    if (this.inventory.loadError()) this.message.set(this.inventory.loadError());
    this.rows.set(this.inventory.locations().map((c) => ({ ...c, draft: c.name })));
    return true;
  }
}
