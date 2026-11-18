// The same fields as FoodItem.cs in the API. The API sends them as JSON in camelCase.
export interface FoodItem {
  id: number;
  name: string;
  quantity: number;
  purchaseDate: string; // "YYYY-MM-DD"
  bestBeforeDate: string | null; // optional
  categoryId: number | null; // optional
  storageLocationId: number;
  categoryName?: string; // filled in by the API
  storageLocationName?: string; // filled in by the API
}
