export interface Location { id: number; name: string; }

export interface Category { id: number; name: string; item_count: number; }

export interface Item {
  id: number;
  name: string;
  purchase_date: string;
  best_before: string | null;
  location_id: number;
  location_name: string;
  category_id: number | null;
  category_name: string | null;
}

export interface ItemInput {
  name: string;
  location_id: number | null;
  category_id: number | null;
  purchase_date: string;
  best_before: string | null;
}

export type FieldErrors = Record<string, string>;
