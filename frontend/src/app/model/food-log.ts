export interface FoodLog {
  id: number;
  name: string;
  quantity: number;
  logDate: string; // a date as text: "YYYY-MM-DD"
  wasted: boolean; // true: thrown away, false: eaten
  categoryId: number | null; // optional
  categoryName?: string; // filled in by the API
}
