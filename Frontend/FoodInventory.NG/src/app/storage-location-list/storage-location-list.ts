import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { StorageLocation } from '../model/storage-location';
import { StorageLocationService } from '../services/storage-location-service';
import { NotificationService } from '../services/notification-service';

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
  newName: string = '';

  ngOnInit(): void {
    this.loadStorageLocations();
  }

  loadStorageLocations(): void {
    this.storageLocationService
      .getStorageLocations()
      .subscribe((storageLocations) => this.storageLocations.set(storageLocations));
  }

  addStorageLocation(): void {
    this.storageLocationService.addStorageLocation({ id: 0, name: this.newName.trim() }).subscribe({
      next: () => {
        this.notification.showSuccess(`${this.newName.trim()} added`);
        this.newName = '';
        this.loadStorageLocations();
      },
      error: () => this.notification.showError('Failed to add the storage location'),
    });
  }

  updateStorageLocation(storageLocation: StorageLocation): void {
    storageLocation.name = storageLocation.name.trim();
    this.storageLocationService.updateStorageLocation(storageLocation).subscribe({
      next: () => this.notification.showSuccess(`${storageLocation.name} saved`),
      error: () => this.notification.showError('Failed to save the storage location'),
    });
  }

  // 409: the storage location still has food, and the API's message says so.
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
