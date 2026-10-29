import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Inventory, errorMessage } from '../inventory';
import { StorageLocation } from '../model/storage-location';
import { StorageLocationService } from '../services/storage-location-service';
import { TopBar } from '../top-bar/top-bar';

type Row = StorageLocation & { draft: string }; // a location and the name typed in its field

/** Storage locations, opened from Settings: add, rename and delete. The API checks the names and answers in plain language. */
@Component({
  selector: 'app-location-list',
  imports: [FormsModule, TopBar],
  templateUrl: './location-list.html',
  styleUrl: '../category-list/category-list.css',
})
export class LocationList implements OnInit {
  private readonly storageLocationService = inject(StorageLocationService);
  protected readonly inventory = inject(Inventory);

  protected readonly rows = signal<Row[]>([]);
  protected readonly newName = signal('');
  protected readonly message = signal('');

  /** "Holds 1 item", "Holds 2 items". */
  protected count = (row: Row) => {
    const n = this.inventory.items().filter((i) => i.storageLocationId === row.id).length;
    return `Holds ${n} ${n === 1 ? 'item' : 'items'}`;
  };

  ngOnInit() {
    this.run();
  }

  protected async add() {
    const name = this.newName().trim();
    const added = await this.run(
      () => firstValueFrom(this.storageLocationService.addStorageLocation({ id: 0, name })),
      `${name} added`,
    );
    if (added) this.newName.set('');
  }

  protected rename(row: Row) {
    const name = row.draft.trim();
    this.run(
      () => firstValueFrom(this.storageLocationService.updateStorageLocation({ id: row.id, name })),
      `${name} saved`,
    );
  }

  /** A location that still has food in it is refused by the API, which says why. */
  protected remove(row: Row) {
    if (!confirm(`Delete the storage location ${row.name}?`)) return;
    this.run(
      () => firstValueFrom(this.storageLocationService.deleteStorageLocation(row.id)),
      `${row.name} deleted`,
    );
  }

  /** Runs a change, then loads everything again. A refused change shows the API's message. */
  private async run(change?: () => Promise<unknown>, done = ''): Promise<boolean> {
    try {
      await change?.();
      this.message.set('');
      if (done) this.inventory.say(done);
    } catch (error) {
      this.message.set(errorMessage(error));
      return false;
    }
    await this.inventory.load(); // the item list and the form show location names, so they need the change too
    if (this.inventory.loadError()) this.message.set(this.inventory.loadError());
    this.rows.set(this.inventory.locations().map((l) => ({ ...l, draft: l.name })));
    return true;
  }
}
