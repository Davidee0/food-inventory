export interface Item {
  id: number;
  name: string;
  locationId: number;
  categoryId: number | null;
  purchaseDate: string; // "YYYY-MM-DD"
  bestBefore: string | null;
  locationName: string;
  categoryName: string | null;
}

/** What the form edits and sends. An empty bestBefore means "no date". */
export interface ItemInput {
  name: string;
  locationId: number | null;
  categoryId: number | null;
  purchaseDate: string;
  bestBefore: string;
}
