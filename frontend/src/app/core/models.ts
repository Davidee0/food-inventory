// The JSON shapes of the API (snake_case, like the database columns).

export interface Location {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  item_count: number;
}

export interface Item {
  id: number;
  name: string;
  purchase_date: string; // "YYYY-MM-DD"
  best_before: string | null;
  location_id: number;
  location_name: string;
  category_id: number | null;
  category_name: string | null;
}

/** What the form edits and sends. An empty best_before means "no date". */
export interface ItemInput {
  name: string;
  location_id: number | null;
  category_id: number | null;
  purchase_date: string;
  best_before: string;
}

/** One message per field, e.g. { name: 'Enter a name.' }. */
export type Errors = Record<string, string>;
