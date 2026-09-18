import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Upload, CheckCircle, Wheat, Salad, Apple, Camera, AlertCircle } from 'lucide-react';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('category') as Category | null;
  const [draft] = useState<TradeDraft>(getStoredDraft);

  const [category, setCategory] = useState<Category | null>(
    catParam && ['crop', 'vegetable', 'fruit'].includes(catParam) ? catParam : draft.category
  );

  useEffect(() => {
    if (catParam && ['crop', 'vegetable', 'fruit'].includes(catParam)) {
      setCategory(catParam);
    }
  }, [catParam]);

  // Form fields
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(draft.photoPreview);
  const [name, setName] = useState(draft.name);
  const [type, setType] = useState(draft.type);
  const [quantity, setQuantity] = useState(draft.quantity);
  const [price, setPrice] = useState(draft.price);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

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

  function handleFileSelected(file: File | null) {
    setUploadError(null);
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }

    // 1. File size check (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`File size ${(file.size / (1024 * 1024)).toFixed(1)} MB exceeds the 5 MB limit. Please select a smaller photo.`);
      return;
    }

    // 2. Format check (JPG, PNG, WEBP)
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const hasValidMime = validMimes.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      setUploadError('Unsupported format. Please select a genuine JPG, PNG, or WEBP image.');
      return;
    }

    // 3. Client-side actual image decoding validation
    const objectUrl = URL.createObjectURL(file);
    const testImg = new Image();
    testImg.onload = () => {
      URL.revokeObjectURL(objectUrl);
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    };
    testImg.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setUploadError('Invalid image content. File could not be decoded as a valid photo.');
      setPhoto(null);
      setPhotoPreview(null);
    };
    testImg.src = objectUrl;
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }

  function resetForm() {
    setPhoto(null);
    setPhotoPreview(null);
    setUploadError(null);
    setName('');
    setType('');
    setQuantity('');
    setPrice('');
    clearDraft();
    if (fileRef.current) fileRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  }

  function handleBack() {
    setCategory(null);
    setSearchParams({});
    resetForm();
    setSuccess(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!category) return;
    setLoading(true);
    setSuccess(false);
    setUploadError(null);

    try {
      let durableImageUrl: string | undefined = undefined;

      // If a photo was selected, upload it durably to the backend first
      if (photo) {
        const formData = new FormData();
        formData.append('file', photo);
        try {
          const uploadRes = await api.post('/upload/produce-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (uploadRes.data?.image_url) {
            durableImageUrl = uploadRes.data.image_url;
          } else {
            throw new Error('Upload did not return a valid image URL');
          }
        } catch (uploadErr: any) {
          const detail = uploadErr.response?.data?.detail || 'Photo upload failed. Please verify the image and try again.';
          setUploadError(detail);
          setLoading(false);
          // Retain form values; do not reset
          return;
        }
      }

      await api.post('/listings', {
        category,
        crop_name: name,
        crop_type: type,
        quantity_kg: parseFloat(quantity),
        price_per_kg: parseFloat(price),
        farmer_id: user?.email || 'unknown',
        image_url: durableImageUrl,
      });

      setSuccess(true);
      resetForm();
    } catch (createErr: any) {
      const detail = createErr.response?.data?.detail || 'Failed to create listing. Please try again.';
      setUploadError(detail);
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

        {uploadError && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.75rem',
              padding: '0.85rem 1rem',
              color: '#b91c1c',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* ── Photo upload ── */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              Seller Produce Photo <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>JPG, PNG, WEBP (max 5 MB)</span>
          </label>

          {photoPreview ? (
            <div
              style={{
                border: `2px solid ${meta.color}`,
                borderRadius: '0.875rem',
                background: '#fff',
                padding: '0.75rem',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative', borderRadius: '0.625rem', overflow: 'hidden' }}>
                <img
                  src={photoPreview}
                  alt="Produce Preview"
                  style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    left: '0.5rem',
                    background: 'rgba(22, 101, 52, 0.9)',
                    color: '#fff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '0.35rem',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                  }}
                >
                  Seller-provided photo preview
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Upload size={14} /> Upload Photo
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => cameraRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Camera size={14} /> Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                    if (fileRef.current) fileRef.current.value = '';
                    if (cameraRef.current) cameraRef.current.value = '';
                  }}
                  style={{
                    fontSize: '0.8rem',
                    color: '#ef4444',
                    background: 'none',
                    border: '1px solid #fecaca',
                    borderRadius: '0.375rem',
                    padding: '0.3rem 0.65rem',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '0.875rem',
                background: '#f8fafc',
                padding: '1.75rem 1.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div>
                <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: '#334155' }}>
                  Add a photo of your harvest
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Upload a photo from your device or take one with your camera
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Upload size={15} /> Upload Photo
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => cameraRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Camera size={15} /> Take Photo
                </button>
              </div>
            </div>
          )}

          {/* Standard file picker */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />

          {/* Mobile camera input with file picker fallback */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />
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
