export interface Item {
  id: number;
  name: string;
  locationId: number | null;
  categoryId: number | null;
  purchaseDate: string; // "YYYY-MM-DD"
  bestBefore: string | null;
  locationName?: string;
  categoryName?: string;
}
