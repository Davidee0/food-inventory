import { Routes } from '@angular/router';
import { CategoryList } from './category-list/category-list';
import { ItemList } from './item-list/item-list';

export const routes: Routes = [
  { path: 'items', component: ItemList },
  { path: 'categories', component: CategoryList },
  { path: '**', redirectTo: 'items' }, // the start page and unknown paths show the item list
];
