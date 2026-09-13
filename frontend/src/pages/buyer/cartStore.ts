export interface Listing {
  id: number;
  category: string;
  crop_name: string;
  crop_type: string;
  quantity_kg: number;
  price_per_kg: number;
  farmer_id: string;
}

export interface CartItem {
  listing: Listing;
  qty: number;
}

// Cart is stored in-memory for MVP
const cartStore: CartItem[] = [];
export function getCart() { return cartStore; }
export function clearCart() { cartStore.length = 0; }
