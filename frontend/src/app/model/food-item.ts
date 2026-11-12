export interface FoodItem {
  id: number;
  name: string;
  quantity: number;
  purchaseDate: string; // "YYYY-MM-DD"
  bestBeforeDate: string | null;
  categoryId: number | null;
  storageLocationId: number;
  categoryName?: string; // filled in by the API
  storageLocationName?: string;
}

// Today (plus some days) as "YYYY-MM-DD", in local time.
export function today(days = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-CA');
}

// "Expired", "Expires soon" (within 3 days) or "".
export function expiryText(item: FoodItem): string {
  if (!item.bestBeforeDate) return '';
  if (item.bestBeforeDate < today()) return 'Expired';
  return item.bestBeforeDate <= today(3) ? 'Expires soon' : '';
}
