// The fields of FoodItem.cs; the API sends them in camelCase.
export interface FoodItem {
  id: number;
  name: string;
  quantity: number;
  purchaseDate: string; // "YYYY-MM-DD"
  bestBeforeDate: string | null;
  categoryId: number | null;
  storageLocationId: number;
  categoryName?: string; // filled in by the API
  storageLocationName?: string; // filled in by the API
}
