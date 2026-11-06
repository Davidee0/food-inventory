export interface FoodItem {
  id: number;
  name: string;
  quantity: number;
  purchaseDate: string; // a date as text: "YYYY-MM-DD"
  bestBeforeDate: string | null; // optional
  categoryId: number | null; // optional
  storageLocationId: number;
  categoryName?: string; // filled in by the API
  storageLocationName?: string; // filled in by the API
}
