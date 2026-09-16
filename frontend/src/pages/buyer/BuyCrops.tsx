import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { ShoppingCart, Search, ArrowLeft, Wheat, Salad, Apple, Package, Plus, Minus } from 'lucide-react';
import { Listing, getCart } from './cartStore';
export type { Listing };

type Category = 'crop' | 'vegetable' | 'fruit';

const CATEGORY_META: Record<Category, { label: string; plural: string; icon: React.ReactNode; color: string; bg: string; accent: string }> = {
  crop: {
    label: 'Crop',
    plural: 'Crops',
    icon: <Wheat size={40} />,
    color: '#ca8a04',
    bg: 'linear-gradient(135deg, #fefce8, #fef9c3)',
    accent: '#fef08a',
  },
  vegetable: {
    label: 'Vegetable',
    plural: 'Vegetables',
    icon: <Salad size={40} />,
    color: '#16a34a',
    bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    accent: '#bbf7d0',
  },
  fruit: {
    label: 'Fruit',
    plural: 'Fruits',
    icon: <Apple size={40} />,
    color: '#dc2626',
    bg: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
    accent: '#fecdd3',
  },
};

/* Realistic photo URLs from Unsplash for each produce item */
const PHOTO_MAP: Record<string, string> = {
  // Crops
  'ragi (finger millet)': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
  'paddy (rice)': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
  'jowar (sorghum)': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
  'maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop',
  'sugarcane': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop',
  'wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
  'rice': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
  // Vegetables
  'tomato': 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=300&fit=crop',
  'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82ber6f7?w=400&h=300&fit=crop',
  'onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop',
  'brinjal': 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&h=300&fit=crop',
  'green chilli': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&h=300&fit=crop',
  'ladies finder': 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=400&h=300&fit=crop',
  'carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
  'cabbage': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&h=300&fit=crop',
  // Fruits
  'mango (alphonso)': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
  'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
  'sapota (chikoo)': 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400&h=300&fit=crop',
  'pomegranate': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop',
  'jackfruit': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop',
  'mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
  'grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=300&fit=crop',
  'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop',
};

/* Fallback photos by category */
const FALLBACK_PHOTOS: Record<string, string> = {
  crop: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
  vegetable: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop',
};

function getPhoto(name: string, category: string): string {
  const lower = name.toLowerCase();
  // Exact match first
  if (PHOTO_MAP[lower]) return PHOTO_MAP[lower];
  // Partial match
  for (const [key, url] of Object.entries(PHOTO_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return url;
  }
  return FALLBACK_PHOTOS[category] || FALLBACK_PHOTOS.crop;
}

export default function BuyCrops() {
  const [category, setCategory] = useState<Category | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState<string | number | null>(null);
  const [quantities, setQuantities] = useState<Record<string | number, number>>({});

  useEffect(() => {
    if (!category) return;
    let ignore = false;
    api.get(`/listings?category=${category}`)
      .then((res) => {
        if (ignore) return;
        // Deduplicate by crop_name
        const seen = new Set<string>();
        const unique = (res.data as Listing[]).filter((l) => {
          if (seen.has(l.crop_name)) return false;
          seen.add(l.crop_name);
          return true;
        });
        setListings(unique);
        // Initialize quantities to 5 kg each
        const initQty: Record<string | number, number> = {};
        unique.forEach((l) => { initQty[l.id] = 5; });
        setQuantities(initQty);
      })
      .catch(() => {
        if (!ignore) setListings([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [category]);

  const filtered = listings.filter(
    (l) => l.crop_name.toLowerCase().includes(search.toLowerCase()) && l.quantity_kg > 0
  );

  function changeQty(id: string | number, delta: number, maxKg: number) {
    setQuantities((prev) => {
      const current = prev[id] || 5;
      const next = Math.max(1, Math.min(maxKg, current + delta));
      return { ...prev, [id]: next };
    });
  }

  function addToCart(listing: Listing) {
    const qty = quantities[listing.id] || 5;
    const cart = getCart();
    const existing = cart.find((c) => c.listing.id === listing.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ listing, qty });
    }
    setAddedId(listing.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  function handleBack() {
    setCategory(null);
    setSearch('');
    setListings([]);
    setQuantities({});
  }

  /* ── Category Selection Screen ── */
  if (!category) {
    return (
      <div>
        <div className="page-header">
          <h1>Buy</h1>
          <p>Select a category to browse available crops, vegetables, and fruits</p>
        </div>

        <div
          className="stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            maxWidth: 820,
          }}
        >
          {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][]).map(
            ([key, meta]) => (
              <button
                key={key}
                onClick={() => {
                  setLoading(true);
                  setCategory(key);
                }}
                style={{
                  background: meta.bg,
                  border: `2px solid ${meta.accent}`,
                  borderRadius: '1rem',
                  padding: '2.5rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 4px 20px rgb(0 0 0 / 0.06)',
                  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'fadeIn 0.5s ease-out both',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-6px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgb(0 0 0 / 0.12)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgb(0 0 0 / 0.06)';
                }}
              >
                <span style={{ color: meta.color }}>{meta.icon}</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 700, color: meta.color }}>
                  {meta.plural}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                  Browse available {meta.plural.toLowerCase()}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  /* ── Listings Grid Screen ── */
  const meta = CATEGORY_META[category];

  return (
    <div className="animate-fadeIn">
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={handleBack} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 0 }}>
            <span style={{ color: meta.color }}>{meta.plural}</span> Available
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 2 }}>
            Browse and buy {meta.plural.toLowerCase()} listed by farmers
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Search size={20} style={{ color: 'var(--color-text-muted)' }} />
        <input
          className="input"
          placeholder={`Search ${meta.plural.toLowerCase()}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', padding: '0.5rem 0', boxShadow: 'none' }}
        />
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="animate-pulse">Loading…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          <Package size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.05rem' }}>No {meta.plural.toLowerCase()} available right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((l) => {
            const qty = quantities[l.id] || 5;
            const subtotal = qty * l.price_per_kg;

            return (
              <div
                key={l.id}
                className="card"
                style={{
                  overflow: 'hidden',
                  padding: 0,
                  transition: 'all 250ms ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgb(0 0 0 / 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                }}
              >
                {/* Realistic Photo */}
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={getPhoto(l.crop_name, l.category)}
                    alt={l.crop_name}
                    style={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_PHOTOS[l.category] || FALLBACK_PHOTOS.crop;
                    }}
                  />
                  {/* Stock badge overlay */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: 'rgba(255,255,255,0.92)',
                      backdropFilter: 'blur(8px)',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '2rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: l.quantity_kg > 50 ? '#16a34a' : '#ea580c',
                      boxShadow: '0 2px 8px rgb(0 0 0 / 0.08)',
                    }}
                  >
                    {l.quantity_kg} kg available
                  </span>
                  {/* Category badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      background: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(8px)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '2rem',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {l.crop_type || meta.label}
                  </span>
                </div>

                {/* Details */}
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ marginBottom: '0.25rem', fontSize: '1.125rem' }}>{l.crop_name}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                    by {l.farmer_id}
                  </p>

                  {/* Price + Stock info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-primary-700)' }}>
                        ₹{l.price_per_kg}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: '2px' }}>/kg</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Stock</span>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{l.quantity_kg} kg</div>
                    </div>
                  </div>

                  {/* Quantity selector (+/-) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <button
                      onClick={() => changeQty(l.id, -5, l.quantity_kg)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        border: '1.5px solid #cbd5e1',
                        background: qty <= 1 ? '#f1f5f9' : '#fff',
                        cursor: qty <= 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: qty <= 1 ? '#cbd5e1' : '#334155',
                        transition: 'all 150ms ease',
                      }}
                      disabled={qty <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{qty}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '4px' }}>kg</span>
                    </div>
                    <button
                      onClick={() => changeQty(l.id, 5, l.quantity_kg)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        border: '1.5px solid #cbd5e1',
                        background: qty >= l.quantity_kg ? '#f1f5f9' : '#fff',
                        cursor: qty >= l.quantity_kg ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: qty >= l.quantity_kg ? '#cbd5e1' : '#334155',
                        transition: 'all 150ms ease',
                      }}
                      disabled={qty >= l.quantity_kg}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div style={{ textAlign: 'center', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
                    Subtotal: <strong style={{ color: '#0f172a' }}>₹{subtotal.toLocaleString()}</strong>
                  </div>

                  {/* Buy button */}
                  <button
                    className={`btn ${addedId === l.id ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => addToCart(l)}
                    style={{
                      width: '100%',
                      gap: '0.5rem',
                      padding: '0.625rem',
                      fontWeight: 600,
                      transition: 'all 200ms ease',
                    }}
                  >
                    <ShoppingCart size={16} />
                    {addedId === l.id ? '✓ Added to Cart!' : `Add ${qty} kg to Cart`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
