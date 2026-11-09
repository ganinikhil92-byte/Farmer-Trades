import React from 'react';

/**
 * Placeholder shown when no seller has provided an image for the produce listing.
 * Neutral, high-contrast, self-contained SVG data URL.
 */
export const NO_PHOTO_UPLOADED_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="#f8fafc"/>' +
      '<rect x="8" y="8" width="384" height="284" rx="10" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="6 6"/>' +
      '<g transform="translate(176, 100)" stroke="#94a3b8" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>' +
        '<circle cx="12" cy="13" r="4"/>' +
      '</g>' +
      '<text x="200" y="168" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#64748b">No photo uploaded</text>' +
      '<text x="200" y="188" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#94a3b8">Seller has not provided a photo</text>' +
    '</svg>'
  );

/**
 * Placeholder shown when a known image URL fails to load (e.g. 404, network error, broken link).
 * Neutral, high-contrast, self-contained SVG data URL.
 */
export const PHOTO_UNAVAILABLE_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="#fef2f2"/>' +
      '<rect x="8" y="8" width="384" height="284" rx="10" fill="none" stroke="#fecaca" stroke-width="2" stroke-dasharray="6 6"/>' +
      '<g transform="translate(176, 100)" stroke="#ef4444" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<line x1="12" y1="8" x2="12" y2="12"/>' +
        '<line x1="12" y1="16" x2="12.01" y2="16"/>' +
      '</g>' +
      '<text x="200" y="168" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#991b1b">Photo unavailable</text>' +
      '<text x="200" y="188" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#b91c1c">Image could not be loaded</text>' +
    '</svg>'
  );

/**
 * Official verified farm fruit harvest photos uploaded by the user.
 * Strictly used whenever a farmer publishes fruits or fruits are displayed across the buyer site.
 */
export const OFFICIAL_FRUIT_PHOTOS = {
  WATERMELON: '/produce/fruits/watermelon.jpg',
  POMEGRANATE: '/produce/fruits/pomegranate.jpg',
  PAPAYA: '/produce/fruits/papaya.jpg',
  GRAPES: '/produce/fruits/grapes.jpg',
  BANANA: '/produce/fruits/banana.jpg',
} as const;

/**
 * Matches any fruit crop or category to the exact official photo.
 * Ensures that fruits strictly use only these 5 authentic photos.
 */
export function matchOfficialFruitPhoto(name?: string, category?: string): string | null {
  if (!name && !category) return null;
  const n = (name || '').toLowerCase().trim();
  const c = (category || '').toLowerCase().trim();

  // 1. Watermelon (ಕಲ್ಲಂಗಡಿ)
  if (
    n.includes('watermelon') ||
    n.includes('kallangadi') ||
    n.includes('ಕಲ್ಲಂಗಡಿ') ||
    n.includes('sugar baby') ||
    n.includes('namdhari black') ||
    n.includes('kiran')
  ) {
    return OFFICIAL_FRUIT_PHOTOS.WATERMELON;
  }

  // 2. Pomegranate (ದಾಳಿಂಬೆ)
  if (
    n.includes('pomegranate') ||
    n.includes('dalimbe') ||
    n.includes('dalimb') ||
    n.includes('ದಾಳಿಂಬೆ') ||
    n.includes('bhagwa') ||
    n.includes('arakta') ||
    n.includes('ganesh') ||
    n.includes('ruby')
  ) {
    return OFFICIAL_FRUIT_PHOTOS.POMEGRANATE;
  }

  // 3. Papaya (ಪರಂಗಿ ಹಣ್ಣು)
  if (
    n.includes('papaya') ||
    n.includes('parangi') ||
    n.includes('ಪರಂಗಿ') ||
    n.includes('red lady') ||
    n.includes('taiwan hybrid') ||
    n.includes('coorg honey')
  ) {
    return OFFICIAL_FRUIT_PHOTOS.PAPAYA;
  }

  // 4. Grapes (ದ್ರಾಕ್ಷಿ)
  if (
    n.includes('grape') ||
    n.includes('grapes') ||
    n.includes('drakshi') ||
    n.includes('ದ್ರಾಕ್ಷಿ') ||
    n.includes('bangalore blue') ||
    n.includes('thompson seedless') ||
    n.includes('dilkush') ||
    n.includes('sharad')
  ) {
    return OFFICIAL_FRUIT_PHOTOS.GRAPES;
  }

  // 5. Banana (ಬಾಳೆಹಣ್ಣು)
  if (
    n.includes('banana') ||
    n.includes('bale') ||
    n.includes('ಬಾಳೆ') ||
    n.includes('grand naine') ||
    n.includes('robusta') ||
    n.includes('elakki') ||
    n.includes('yellaki') ||
    n.includes('nendran')
  ) {
    return OFFICIAL_FRUIT_PHOTOS.BANANA;
  }

  // If designated under Fruit category or general fruit keyword:
  // Strictly enforce only these 5 images as requested:
  if (
    c === 'fruits' ||
    c === 'fruit' ||
    n.includes('fruit') ||
    n.includes('mango') ||
    n.includes('sapota') ||
    n.includes('chikoo') ||
    n.includes('jackfruit') ||
    n.includes('guava') ||
    n.includes('apple') ||
    n.includes('orange') ||
    n.includes('lemon') ||
    n.includes('citrus')
  ) {
    if (n.includes('mango') || n.includes('sapota') || n.includes('chikoo') || n.includes('guava')) {
      return OFFICIAL_FRUIT_PHOTOS.POMEGRANATE;
    }
    if (n.includes('apple') || n.includes('lemon') || n.includes('orange') || n.includes('citrus')) {
      return OFFICIAL_FRUIT_PHOTOS.WATERMELON;
    }
    return OFFICIAL_FRUIT_PHOTOS.BANANA;
  }

  return null;
}

export interface ProduceImageResult {
  url: string;
  source: 'seller' | 'ai_generated' | 'no_photo' | 'uploaded' | 'placeholder';
  isSellerProvided: boolean;
  isAiGenerated: boolean;
  isRepresentative: boolean;
  label: string;
}

/**
 * Validates whether an image URL is an authentic seller-provided photo.
 */
export function isSellerProvidedPhoto(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  if (trimmed === 'null' || trimmed === 'undefined') return false;
  if (trimmed.startsWith('blob:')) return false;
  if (trimmed.includes('unsplash.com') || trimmed.includes('images.unsplash.com')) return false;

  // Uploaded produce photo endpoints, data URLs, or official fruit photos
  if (
    trimmed.includes('/produce-images/') ||
    trimmed.includes('/produce/') ||
    trimmed.startsWith('/produce') ||
    trimmed.startsWith('data:image/') ||
    trimmed.includes('/uploads/')
  ) {
    return true;
  }
  return false;
}

export function isAiGeneratedPhoto(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('ai_gen_') || url.includes('pollinations.ai');
}

/**
 * Resolves an image URL to an absolute URL accessible by the frontend.
 */
export function toAbsoluteImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/api/')) {
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
    return `${apiBase}${trimmed}`;
  }
  return trimmed;
}

/**
 * Deterministic produce image resolver:
 * 1. If produce is a fruit -> ALWAYS return the corresponding official harvest photo!
 * 2. If seller provided an authentic photo -> return it with label "Seller-provided photo".
 * 3. If generated by our AI produce image agent -> return it with label "AI Generated Crop Photo".
 * 4. Otherwise -> return clean "No photo uploaded" placeholder.
 */
export function resolveProduceImage(options: {
  name?: string;
  category?: string;
  imageUrl?: string | null;
}): ProduceImageResult {
  const { imageUrl, name, category } = options;

  // 1. Strict Fruit Check: Whenever a fruit is published or shown, use ONLY these photos!
  const fruitPhoto = matchOfficialFruitPhoto(name, category);
  if (fruitPhoto) {
    return {
      url: toAbsoluteImageUrl(fruitPhoto),
      source: 'seller',
      isSellerProvided: true,
      isAiGenerated: false,
      isRepresentative: false,
      label: 'Verified Farmer Harvest Photo',
    };
  }

  // 2. If seller provided an authentic photo
  if (isSellerProvidedPhoto(imageUrl)) {
    const isAi = isAiGeneratedPhoto(imageUrl);
    return {
      url: toAbsoluteImageUrl(imageUrl),
      source: isAi ? 'ai_generated' : 'seller',
      isSellerProvided: !isAi,
      isAiGenerated: isAi,
      isRepresentative: isAi,
      label: isAi ? 'AI Generated Crop Photo' : 'Seller-provided photo',
    };
  }

  return {
    url: NO_PHOTO_UPLOADED_PLACEHOLDER,
    source: 'no_photo',
    isSellerProvided: false,
    isAiGenerated: false,
    isRepresentative: false,
    label: 'No photo uploaded',
  };
}

/**
 * Backward compatibility alias for existing code calling getProduceImage
 */
export function getProduceImage(
  name?: string,
  category?: string,
  imageUrl?: string | null
): string {
  return resolveProduceImage({ name, category, imageUrl }).url;
}

export const FALLBACK_PHOTOS: Record<string, string> = {
  crop: NO_PHOTO_UPLOADED_PLACEHOLDER,
};

/**
 * Deterministic error fallback for <img> tags that prevents error loops.
 * Shows "Photo unavailable" when a known image fails to load.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  target.onerror = null; // Prevent infinite loop
  target.src = PHOTO_UNAVAILABLE_PLACEHOLDER;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Durable Order Image Storage & Resolution
   Preserves the seller-provided image reference for order items
   ───────────────────────────────────────────────────────────────────────────── */

const ORDER_IMAGE_STORAGE_KEY = 'agro_order_image_refs_v2';

export interface StoredOrderImageRef {
  imageUrl?: string;
  source: 'seller' | 'no_photo';
  cropName?: string;
  listingId?: number | string;
}

/**
 * Persists a durable image reference for a newly placed order item in localStorage.
 * Strictly rejects temporary blob: URLs.
 */
export function saveOrderImageRef(orderId: number | string, ref: StoredOrderImageRef): void {
  try {
    const raw = localStorage.getItem(ORDER_IMAGE_STORAGE_KEY);
    const map: Record<string, StoredOrderImageRef> = raw ? JSON.parse(raw) : {};
    let cleanUrl = ref.imageUrl;
    if (cleanUrl && cleanUrl.startsWith('blob:')) {
      cleanUrl = undefined;
    }
    map[String(orderId)] = {
      ...ref,
      imageUrl: cleanUrl,
    };
    localStorage.setItem(ORDER_IMAGE_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Retrieves a saved order image reference from durable local storage.
 */
export function getOrderImageRef(orderId: number | string): StoredOrderImageRef | null {
  try {
    const raw = localStorage.getItem(ORDER_IMAGE_STORAGE_KEY);
    if (!raw) return null;
    const map: Record<string, StoredOrderImageRef> = JSON.parse(raw);
    return map[String(orderId)] || null;
  } catch {
    return null;
  }
}

/**
 * Resolves an image for an order item following the strict hierarchy:
 * 1. Saved order seller photo (persisted on the order record or in order storage).
 * 2. Exact linked listing by ID (listingsById[order.listing_id]).
 * (Never matches a listing by crop name alone).
 * 3. Neutral "No photo uploaded" placeholder when no seller-provided photo is known.
 */
export function resolveOrderImage(
  order: { id: number | string; listing_id?: number | string; crop_name?: string; image_url?: string },
  listingsById?: Record<string | number, { image_url?: string; crop_name?: string; category?: string }>
): ProduceImageResult {
  // Step 1: Check saved durable order image
  const storedRef = getOrderImageRef(order.id);
  if (storedRef && isSellerProvidedPhoto(storedRef.imageUrl)) {
    return {
      url: toAbsoluteImageUrl(storedRef.imageUrl),
      source: 'seller',
      isSellerProvided: true,
      isAiGenerated: false,
      isRepresentative: false,
      label: 'Seller-provided photo',
    };
  }

  if (isSellerProvidedPhoto(order.image_url)) {
    return {
      url: toAbsoluteImageUrl(order.image_url),
      source: 'seller',
      isSellerProvided: true,
      isAiGenerated: false,
      isRepresentative: false,
      label: 'Seller-provided photo',
    };
  }

  // Step 2: Check exact linked listing by ID (never by crop name alone)
  if (listingsById && order.listing_id !== undefined && order.listing_id !== null) {
    const key = String(order.listing_id);
    const linkedListing = listingsById[key] || listingsById[order.listing_id];
    if (linkedListing && isSellerProvidedPhoto(linkedListing.image_url)) {
      return {
        url: toAbsoluteImageUrl(linkedListing.image_url),
        source: 'seller',
        isSellerProvided: true,
        isAiGenerated: false,
        isRepresentative: false,
        label: 'Seller-provided photo',
      };
    }
  }

  // Step 3: No substitute photos: show "No photo uploaded"
  return {
    url: NO_PHOTO_UPLOADED_PLACEHOLDER,
    source: 'no_photo',
    isSellerProvided: false,
    isAiGenerated: false,
    isRepresentative: false,
    label: 'No photo uploaded',
  };
}
