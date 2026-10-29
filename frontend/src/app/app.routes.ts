import { Routes } from '@angular/router';
import { CategoryList } from './category-list/category-list';
import { EditItem } from './edit-item/edit-item';
import { ItemList } from './item-list/item-list';

export const routes: Routes = [
  { path: 'items', component: ItemList },
  { path: 'add-item', component: EditItem },
  { path: 'edit-item/:id', component: EditItem },
  { path: 'categories', component: CategoryList },
  { path: '**', redirectTo: 'items' },
];
