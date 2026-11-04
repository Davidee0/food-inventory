import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../model/category';

/** One category of the list: its name in a field, the item count, and Save / Delete, which the list handles. */
@Component({
  selector: 'app-category-card',
  imports: [FormsModule],
  templateUrl: './category-card.html',
  styleUrl: './category-card.css',
})
export class CategoryCard implements OnChanges {
  @Input() category!: Category;
  @Output() rename = new EventEmitter<string>();
  @Output() remove = new EventEmitter<void>();

  /** The name typed in the field. Save sends it. */
  protected draft = '';

  /** Each time the category comes from the API, the field shows its saved name. */
  ngOnChanges() {
    this.draft = this.category.name;
  }

  /** "1 item", "2 items". */
  protected count = (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`;
}
