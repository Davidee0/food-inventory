import { Routes } from '@angular/router';
import { ItemList } from './item-list/item-list';
import { ItemForm } from './item-form/item-form';
import { EatList } from './eat-list/eat-list';
import { Settings } from './settings/settings';

export const routes: Routes = [
  { path: 'items', component: ItemList },
  { path: 'add', component: ItemForm },
  { path: 'edit/:id', component: ItemForm },
  { path: 'eat', component: EatList },
  { path: 'settings', component: Settings },
  { path: '', redirectTo: '/items', pathMatch: 'full' },
];
