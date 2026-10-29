import { Routes } from '@angular/router';
import { CategoryList } from './category-list/category-list';
import { EatList } from './eat-list/eat-list';
import { ItemForm } from './item-form/item-form';
import { ItemList } from './item-list/item-list';
import { LocationList } from './location-list/location-list';
import { Settings } from './settings/settings';

export const routes: Routes = [
  { path: 'items', component: ItemList, title: 'U8 · Inventory' },
  { path: 'add', component: ItemForm, title: 'U8 · Add item' },
  { path: 'edit/:id', component: ItemForm, title: 'U8 · Edit item' }, // :id becomes the form's id input
  { path: 'eat', component: EatList, title: 'U8 · Ate it' },
  { path: 'settings', component: Settings, title: 'U8 · Settings' },
  { path: 'settings/categories', component: CategoryList, title: 'U8 · Categories' },
  { path: 'settings/locations', component: LocationList, title: 'U8 · Storage locations' },
  { path: '**', redirectTo: 'items' }, // the start page and unknown paths show the inventory
];
