export interface Listing {
  id: number | string;
  category: string;
  crop_name: string;
  crop_type: string;
  quantity_kg: number;
  price_per_kg: number;
  farmer_id: string;
  image_url?: string;
}

export interface CartItem {
  listing: Listing;
  qty: number;
}

const CART_STORAGE_KEY = 'agro_buyer_cart_items_v2';

export const INITIAL_DEMO_CART: CartItem[] = [
  {
    listing: {
      id: 6,
      category: 'VEGETABLES',
      crop_name: 'Tomato / ಟೊಮೆಟೊ',
      crop_type: 'Arka Rakshak (Grade A)',
      quantity_kg: 850,
      price_per_kg: 28,
      farmer_id: 'ganinikhil92@gmail.com',
      image_url: '/produce/vegetables/tomato.jpg'
    },
    qty: 50
  },
  {
    listing: {
      id: 1,
      category: 'FRUITS',
      crop_name: 'Watermelon / ಕಲ್ಲಂಗಡಿ',
      crop_type: 'Sugar Baby',
      quantity_kg: 300,
      price_per_kg: 25,
      farmer_id: 'farmer@agro.com',
      image_url: '/produce/fruits/watermelon.jpg'
    },
    qty: 100
  },
  {
    listing: {
      id: 10,
      category: 'FRUITS',
      crop_name: 'Pomegranate / ದಾಳಿಂಬೆ',
      crop_type: 'Bhagwa Ruby Red',
      quantity_kg: 1200,
      price_per_kg: 145,
      farmer_id: 'ganinikhil92@gmail.com',
      image_url: '/produce/fruits/pomegranate.jpg'
    },
    qty: 30
  },
  {
    listing: {
      id: 7,
      category: 'VEGETABLES',
      crop_name: 'Carrot / ಕ್ಯಾರೆಟ್',
      crop_type: 'Ooty Red (Grade Premium)',
      quantity_kg: 600,
      price_per_kg: 36,
      farmer_id: 'farmer@agro.com',
      image_url: '/produce/vegetables/carrot.jpg'
    },
    qty: 40
  },
  {
    listing: {
      id: 2,
      category: 'CEREALS_MILLETS',
      crop_name: 'Finger Millet / Ragi',
      crop_type: 'GPU-67 Organic',
      quantity_kg: 1000,
      price_per_kg: 43,
      farmer_id: 'farmer@agro.com',
      image_url: '/produce/ragi.jpg'
    },
    qty: 150
  }
];

function loadCartFromStorage(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading cart from storage:', e);
  }
  // Default to 5 demo items if empty
  return [...INITIAL_DEMO_CART];
}

const cartStore: CartItem[] = loadCartFromStorage();

export function getCart(): CartItem[] {
  return cartStore;
}

export function saveCart(items: CartItem[]): void {
  cartStore.length = 0;
  cartStore.push(...items);
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartStore));
  } catch (e) {
    console.warn('Error saving cart to storage:', e);
  }
}

export function clearCart(): void {
  cartStore.length = 0;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (e) {}
}
