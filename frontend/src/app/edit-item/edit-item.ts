import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Category } from '../model/category';
import { Item } from '../model/item';
import { Location } from '../model/location';
import { CategoryService } from '../services/category-service';
import { ItemService } from '../services/item-service';
import { LocationService } from '../services/location-service';

// Add item (route add-item) and Edit item (route edit-item/:id).
@Component({
  selector: 'app-edit-item',
  imports: [FormsModule],
  templateUrl: './edit-item.html',
})
export class EditItem implements OnInit {
  @Input() id?: number;
  item: Item = {
    id: 0,
    name: '',
    locationId: null,
    categoryId: null,
    purchaseDate: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'), // today, local time
    bestBefore: null,
  };
  locations: Location[] = [];
  categories: Category[] = [];

  constructor(
    private itemService: ItemService,
    private locationService: LocationService,
    private categoryService: CategoryService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.id) {
      this.itemService.getItem(this.id).subscribe((item) => {
        this.item = item;
        this.cdr.markForCheck();
      });
    }
    this.locationService.getLocations().subscribe((locations) => {
      this.locations = locations;
      this.cdr.markForCheck();
    });
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;
      this.cdr.markForCheck();
    });
  }

  saveItem(): void {
    this.item.bestBefore ||= null; // a cleared date field gives ''
    const save = this.id
      ? this.itemService.updateItem(this.item)
      : this.itemService.addItem(this.item);
    save.subscribe(() => this.router.navigate(['/items']));
  }
}
