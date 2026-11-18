import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { StorageLocation } from '../model/storage-location';
import { StorageLocationService } from '../services/storage-location-service';

// Storage locations (US13): the same as the categories.
@Component({
  selector: 'app-storage-location-list',
  imports: [FormsModule, MatButtonModule],
  templateUrl: './storage-location-list.html',
})
export class StorageLocationList implements OnInit {
  constructor(private storageLocationService: StorageLocationService) {}

  storageLocations = signal<StorageLocation[]>([]);
  message = signal('');
  newName: string = ''; // two-way bound to the "New storage location" field

  ngOnInit(): void {
    this.loadStorageLocations();
  }

  loadStorageLocations(): void {
    this.storageLocationService
      .getStorageLocations()
      .subscribe((storageLocations) => this.storageLocations.set(storageLocations));
  }

  addStorageLocation(): void {
    this.storageLocationService.addStorageLocation({ id: 0, name: this.newName }).subscribe(() => {
      this.message.set(`${this.newName} added`);
      this.newName = '';
      this.loadStorageLocations();
    });
  }

  updateStorageLocation(storageLocation: StorageLocation): void {
    this.storageLocationService
      .updateStorageLocation(storageLocation)
      .subscribe(() => this.message.set(`${storageLocation.name} saved`));
  }

  // The API refuses to delete a storage location that still has food in it (409) and says why;
  // the page shows that message.
  deleteStorageLocation(storageLocation: StorageLocation): void {
    if (confirm(`Delete ${storageLocation.name}?`)) {
      this.storageLocationService.deleteStorageLocation(storageLocation.id).subscribe({
        next: () => {
          this.message.set(`${storageLocation.name} deleted`);
          this.loadStorageLocations();
        },
        error: (error) => this.message.set(error.error),
      });
    }
  }
}
