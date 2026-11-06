import { Routes } from '@angular/router';
import { FoodItemList } from './food-item-list/food-item-list';
import { AddFoodItem } from './add-food-item/add-food-item';
import { EditFoodItem } from './edit-food-item/edit-food-item';
import { CategoryList } from './category-list/category-list';
import { StorageLocationList } from './storage-location-list/storage-location-list';

export const routes: Routes = [
  { path: '', redirectTo: 'food-items', pathMatch: 'full' }, // the start page is the food list
  { path: 'food-items', component: FoodItemList },
  { path: 'add-food-item', component: AddFoodItem },
  { path: 'edit-food-item/:id', component: EditFoodItem },
  { path: 'categories', component: CategoryList },
  { path: 'storage-locations', component: StorageLocationList },
];
