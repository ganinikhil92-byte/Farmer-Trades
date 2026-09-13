import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
  Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase';

export interface FirestoreListing {
  id?: string;
  crop_name: string;
  category: 'crop' | 'fruit' | 'vegetable';
  quantity_kg: number;
  price_per_kg: number;
  farmer_id: string;
  crop_type?: string;
  created_at?: string;
}

/**
 * Real-time listener for listings by category (e.g. crop, fruit, vegetable).
 * Calls callback whenever any user creates or updates a listing.
 */
export function subscribeToListings(
  category: string,
  onUpdate: (listings: FirestoreListing[]) => void
): Unsubscribe | null {
  if (!isFirebaseReady || !db) return null;

  try {
    const q = category
      ? query(collection(db, 'listings'), where('category', '==', category))
      : collection(db, 'listings');

    return onSnapshot(q, (snapshot) => {
      const items: FirestoreListing[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onUpdate(items);
    }, (error) => {
      console.warn('[Firestore] Error subscribing to listings:', error);
    });
  } catch (err) {
    console.warn('[Firestore] Realtime subscription failed:', err);
    return null;
  }
}

/**
 * Save or update a listing directly to Firestore
 */
export async function saveListingToFirestore(listing: FirestoreListing): Promise<string | null> {
  if (!isFirebaseReady || !db) return null;

  const docRef = listing.id ? doc(db, 'listings', listing.id) : doc(collection(db, 'listings'));
  await setDoc(docRef, {
    ...listing,
    id: docRef.id,
    created_at: listing.created_at || new Date().toISOString(),
  }, { merge: true });
  return docRef.id;
}

/**
 * Delete a listing from Firestore
 */
export async function deleteListingFromFirestore(id: string): Promise<boolean> {
  if (!isFirebaseReady || !db) return false;
  await deleteDoc(doc(db, 'listings', id));
  return true;
}
