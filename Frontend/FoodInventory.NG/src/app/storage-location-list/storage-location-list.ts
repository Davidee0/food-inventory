import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { StorageLocation } from '../model/storage-location';
import { StorageLocationService } from '../services/storage-location-service';
import { NotificationService } from '../services/notification-service';

// Storage locations (US13): the same as the categories.
@Component({
  selector: 'app-storage-location-list',
  imports: [FormsModule, MatButtonModule],
  templateUrl: './storage-location-list.html',
})
export class StorageLocationList implements OnInit {
  constructor(
    private storageLocationService: StorageLocationService,
    private notification: NotificationService,
  ) {}

  storageLocations = signal<StorageLocation[]>([]);
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
    this.storageLocationService.addStorageLocation({ id: 0, name: this.newName }).subscribe({
      next: () => {
        this.notification.showSuccess(`${this.newName} added`);
        this.newName = '';
        this.loadStorageLocations();
      },
      error: () => this.notification.showError('Failed to add the storage location'),
    });
  }

  updateStorageLocation(storageLocation: StorageLocation): void {
    this.storageLocationService.updateStorageLocation(storageLocation).subscribe({
      next: () => this.notification.showSuccess(`${storageLocation.name} saved`),
      error: () => this.notification.showError('Failed to save the storage location'),
    });
  }

  // The API refuses to delete a storage location that still has food in it (409) and says why;
  // the snackbar shows that message. Other errors (e.g. the API is not running) get a general one.
  deleteStorageLocation(storageLocation: StorageLocation): void {
    if (confirm(`Delete ${storageLocation.name}?`)) {
      this.storageLocationService.deleteStorageLocation(storageLocation.id).subscribe({
        next: () => {
          this.notification.showSuccess(`${storageLocation.name} deleted`);
          this.loadStorageLocations();
        },
        error: (error) => {
          if (error.status === 409) {
            this.notification.showError(error.error);
          } else {
            this.notification.showError('Failed to delete the storage location');
          }
        },
      });
    }
  }
}
