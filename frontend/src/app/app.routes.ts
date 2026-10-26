import { Routes } from '@angular/router';
import { Categories } from './categories/categories';
import { Items } from './items/items';

export const routes: Routes = [
  { path: '', component: Items },
  { path: 'categories', component: Categories },
  { path: '**', redirectTo: '' },
];
