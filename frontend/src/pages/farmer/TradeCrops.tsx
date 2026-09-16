import React, { useState, useEffect, useRef, FormEvent } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Upload, CheckCircle, Wheat, Salad, Apple } from 'lucide-react';

type Category = 'crop' | 'vegetable' | 'fruit';

const DRAFT_KEY = 'agro_trade_draft';

interface TradeDraft {
  category: Category | null;
  name: string;
  type: string;
  quantity: string;
  price: string;
  photoPreview: string | null;
}

function getStoredDraft(): TradeDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        category: parsed.category || null,
        name: parsed.name || '',
        type: parsed.type || '',
        quantity: parsed.quantity || '',
        price: parsed.price || '',
        photoPreview: parsed.photoPreview || null,
      };
    }
  } catch (e) {
    console.error('Failed to load trade draft', e);
  }
  return {
    category: null,
    name: '',
    type: '',
    quantity: '',
    price: '',
    photoPreview: null,
  };
}

const CATEGORY_META: Record<
  Category,
  { label: string; icon: React.ReactNode; color: string; bg: string; accent: string; placeholder: string; typePlaceholder: string }
> = {
  crop: {
    label: 'Crop',
    icon: <Wheat size={36} />,
    color: '#ca8a04',
    bg: 'linear-gradient(135deg, #fefce8, #fef9c3)',
    accent: '#fef08a',
    placeholder: 'e.g. Wheat, Rice, Maize',
    typePlaceholder: 'e.g. Kharif, Rabi, Zaid',
  },
  vegetable: {
    label: 'Vegetable',
    icon: <Salad size={36} />,
    color: '#16a34a',
    bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    accent: '#bbf7d0',
    placeholder: 'e.g. Tomato, Onion, Potato',
    typePlaceholder: 'e.g. Root, Leafy, Cruciferous',
  },
  fruit: {
    label: 'Fruit',
    icon: <Apple size={36} />,
    color: '#dc2626',
    bg: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
    accent: '#fecdd3',
    placeholder: 'e.g. Mango, Banana, Grapes',
    typePlaceholder: 'e.g. Tropical, Citrus, Drupe',
  },
};

export default function TradeCrops() {
  const { user } = useAuth();
  const [draft] = useState<TradeDraft>(getStoredDraft);

  const [category, setCategory] = useState<Category | null>(draft.category);

  // Form fields
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(draft.photoPreview);
  const [name, setName] = useState(draft.name);
  const [type, setType] = useState(draft.type);
  const [quantity, setQuantity] = useState(draft.quantity);
  const [price, setPrice] = useState(draft.price);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-persist draft across page refreshes
  useEffect(() => {
    if (category || name || type || quantity || price || photoPreview) {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            category,
            name,
            type,
            quantity,
            price,
            photoPreview,
          })
        );
      } catch {
        try {
          localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({
              category,
              name,
              type,
              quantity,
              price,
              photoPreview: null,
            })
          );
        } catch {}
      }
    }
  }, [category, name, type, quantity, price, photoPreview]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }

  function resetForm() {
    setPhoto(null);
    setPhotoPreview(null);
    setName('');
    setType('');
    setQuantity('');
    setPrice('');
    clearDraft();
  }

  function handleBack() {
    setCategory(null);
    resetForm();
    setSuccess(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!category) return;
    setLoading(true);
    setSuccess(false);
    try {
      await api.post('/listings', {
        category,
        crop_name: name,
        crop_type: type,
        quantity_kg: parseFloat(quantity),
        price_per_kg: parseFloat(price),
        farmer_id: user?.email || 'unknown',
        image_url: photoPreview || undefined,
      });
      setSuccess(true);
      resetForm();
    } catch {
      alert('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Category selection screen ── */
  if (!category) {
    return (
      <div>
        <div className="page-header">
          <h1>Trade Crops</h1>
          <p>Select a category to create your listing</p>
        </div>

        <div
          className="stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            maxWidth: 760,
          }}
        >
          {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][]).map(
            ([key, meta]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
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
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 32px rgb(0 0 0 / 0.12)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgb(0 0 0 / 0.06)';
                }}
              >
                <span style={{ color: meta.color }}>{meta.icon}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: meta.color }}>
                  {meta.label}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                  Click to list your {meta.label.toLowerCase()}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  /* ── Listing form screen ── */
  const meta = CATEGORY_META[category];

  return (
    <div className="animate-fadeIn">
      {/* Back button + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={handleBack}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 0 }}>
            <span style={{ color: meta.color }}>{meta.label}</span> Listing
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 2 }}>
            Fill in the details and upload a photo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 600 }}>
        {/* Success banner */}
        {success && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              color: '#166534',
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              fontWeight: 600,
              animation: 'scaleIn 0.3s ease-out',
            }}
          >
            <CheckCircle size={20} /> Listing created successfully!
          </div>
        )}

        {/* ── Photo upload ── */}
        <div className="form-group">
          <label className="form-label">
            Photo <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${photo ? meta.color : '#cbd5e1'}`,
              borderRadius: '0.875rem',
              background: photo ? meta.bg : '#f8fafc',
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'all 200ms ease',
              position: 'relative',
            }}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: '0.75rem' }}
              />
            ) : (
              <>
                <Upload size={32} style={{ color: '#94a3b8', marginBottom: 8 }} />
                <span style={{ color: '#64748b', fontWeight: 600 }}>Click to upload photo</span>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 4 }}>
                  JPG, PNG, WEBP (max 5 MB)
                </span>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          {photo && (
            <button
              type="button"
              onClick={() => { setPhoto(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
              style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ✕ Remove photo
            </button>
          )}
        </div>

        {/* ── Name ── */}
        <div className="form-group">
          <label className="form-label">{meta.label} Name</label>
          <input
            className="input"
            type="text"
            placeholder={meta.placeholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* ── Type ── */}
        <div className="form-group">
          <label className="form-label">{meta.label} Type</label>
          <input
            className="input"
            type="text"
            placeholder={meta.typePlaceholder}
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </div>

        {/* ── Quantity & Price side by side ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Quantity (kg)</label>
            <input
              className="input"
              type="number"
              min="1"
              placeholder="e.g. 200"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Price per kg (₹)</label>
            <input
              className="input"
              type="number"
              min="1"
              placeholder="e.g. 40"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '1.5rem', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Creating…' : `Create ${meta.label} Listing`}
        </button>
      </form>
    </div>
  );
}
