/**
 * Farmer Trades — Global State & Persistence Store
 * Manages favorites, custom farmer listings, purchase inquiries, and notifications.
 */

import {
  INITIAL_PRODUCE_LISTINGS,
  CROPS_ENCYCLOPEDIA,
  FARMERS_DIRECTORY,
  ProduceListingItem,
  CropInfo,
  FarmerProfileItem
} from '../data/farmerTradesData';

const FAVORITES_KEY = 'farmer_trades_favorites';
const LISTINGS_KEY = 'farmer_trades_listings';
const OFFERS_KEY = 'farmer_trades_offers';
const NOTIFICATIONS_KEY = 'farmer_trades_notifications';

export interface FavoritesState {
  listings: string[]; // listing IDs
  crops: string[];    // crop IDs
  farmers: string[];  // farmer IDs
}

export interface PurchaseOffer {
  id: string;
  listingId: string;
  cropName: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  deliveryLocation: string;
  offeredPricePerQuintal: number;
  requestedQuantityQuintals: number;
  totalOfferAmount: number;
  status: 'Pending' | 'Accepted' | 'Countered' | 'Rejected';
  notes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'offer' | 'price_alert' | 'order' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'New Buy Inquiry for Organic Ragi',
    message: 'Mysuru Wholesale Traders submitted an offer of ₹4,300/qtl for 25 quintals.',
    type: 'offer',
    timestamp: '10 mins ago',
    read: false,
    link: '/buyer/orders'
  },
  {
    id: 'notif-2',
    title: 'Mandya APMC Price Surge Alert',
    message: 'Ragi modal prices increased +4.8% to ₹4,380/qtl across Mandya and Hassan yards.',
    type: 'price_alert',
    timestamp: '1 hour ago',
    read: false,
    link: '/market-prices'
  },
  {
    id: 'notif-3',
    title: 'Soil Sample Verification Completed',
    message: 'Your Mandya parcel soil health card is ready with UAS Bangalore nutrient recommendations.',
    type: 'system',
    timestamp: 'Yesterday',
    read: true,
    link: '/farmer/soil-test'
  }
];

// ── Favorites Management ──
export function getFavorites(): FavoritesState {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { listings: ['prod-001', 'prod-003'], crops: ['ragi', 'paddy'], farmers: ['farmer_ramesh@agro.com'] };
}

export function saveFavorites(favs: FavoritesState) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  } catch (e) {}
}

export function isFavorite(category: 'listings' | 'crops' | 'farmers', id: string): boolean {
  const favs = getFavorites();
  return favs[category].includes(id);
}

export function toggleFavorite(category: 'listings' | 'crops' | 'farmers', id: string): boolean {
  const favs = getFavorites();
  const list = favs[category];
  const idx = list.indexOf(id);
  let nowFav = false;
  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.push(id);
    nowFav = true;
  }
  saveFavorites(favs);
  return nowFav;
}

// ── Produce Listings Management ──
export function getAllProduceListings(): ProduceListingItem[] {
  try {
    const raw = localStorage.getItem(LISTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_PRODUCE_LISTINGS;
}

export function addProduceListing(item: Omit<ProduceListingItem, 'id' | 'createdAt'>): ProduceListingItem {
  const listings = getAllProduceListings();
  const newItem: ProduceListingItem = {
    ...item,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  listings.unshift(newItem);
  try {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
  } catch (e) {}
  return newItem;
}

// ── Purchase Inquiries & Offers ──
export function getPurchaseOffers(): PurchaseOffer[] {
  try {
    const raw = localStorage.getItem(OFFERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function submitPurchaseOffer(offer: Omit<PurchaseOffer, 'id' | 'status' | 'createdAt'>): PurchaseOffer {
  const offers = getPurchaseOffers();
  const newOffer: PurchaseOffer = {
    ...offer,
    id: `off-${Date.now()}`,
    status: 'Pending',
    createdAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  };
  offers.unshift(newOffer);
  try {
    localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
  } catch (e) {}

  // Automatically trigger a notification
  addNotification({
    title: `New Buy Offer: ${offer.cropName}`,
    message: `${offer.buyerName} proposed ₹${offer.offeredPricePerQuintal}/qtl for ${offer.requestedQuantityQuintals} quintals.`,
    type: 'offer',
    link: '/buyer/orders'
  });

  return newOffer;
}

// ── Notifications Management ──
export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_NOTIFICATIONS;
}

export function addNotification(n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
  const notifs = getNotifications();
  const newNotif: AppNotification = {
    ...n,
    id: `notif-${Date.now()}`,
    timestamp: 'Just now',
    read: false
  };
  notifs.unshift(newNotif);
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  } catch (e) {}
}

export function markNotificationAsRead(id: string) {
  const notifs = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  } catch (e) {}
}

export function markAllNotificationsAsRead() {
  const notifs = getNotifications().map((n) => ({ ...n, read: true }));
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  } catch (e) {}
}

export function getUnreadNotificationsCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}
