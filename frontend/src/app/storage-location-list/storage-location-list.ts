import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageLocation } from '../model/storage-location';
import { StorageLocationService } from '../services/storage-location-service';

@Component({
  imports: [FormsModule],
  selector: 'app-storage-location-list',
  styleUrl: './storage-location-list.css',
  templateUrl: './storage-location-list.html',
})
export class StorageLocationList implements OnInit {
  constructor(
    private storageLocationService: StorageLocationService,
    private cdr: ChangeDetectorRef,
  ) {}

  storageLocations: StorageLocation[] = [];
  newName: string = ''; // [(ngModel)] binds it to the "New storage location" field

  ngOnInit(): void {
    this.loadStorageLocations();
  }

  loadStorageLocations(): void {
    this.storageLocationService.getStorageLocations().subscribe((storageLocations) => {
      this.storageLocations = storageLocations;
      this.cdr.markForCheck();
    });
  }

  addStorageLocation(): void {
    this.storageLocationService.addStorageLocation({ id: 0, name: this.newName }).subscribe(() => {
      this.newName = '';
      this.loadStorageLocations();
    });
  }

  updateStorageLocation(storageLocation: StorageLocation): void {
    this.storageLocationService
      .updateStorageLocation(storageLocation)
      .subscribe(() => this.loadStorageLocations());
  }

  deleteStorageLocation(storageLocation: StorageLocation): void {
    if (confirm(`Delete ${storageLocation.name}?`)) {
      this.storageLocationService.deleteStorageLocation(storageLocation.id).subscribe({
        next: () => this.loadStorageLocations(),
        error: (err) => alert(err.error), // e.g. "Fridge still has food in it, so it cannot be deleted."
      });
    }
  }
}
