export interface FoodItem {
  id: number;
  name: string;
  quantity: number | null; // null while the form field is empty
  purchaseDate: string; // "YYYY-MM-DD"
  bestBeforeDate: string | null;
  categoryId: number | null;
  storageLocationId: number | null;
  categoryName?: string | null;
  storageLocationName?: string;
}
