import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  Wheat,
  Sprout,
  Sun,
  Factory,
  Coffee,
  Flame,
  Salad,
  Apple,
  Camera,
  AlertCircle,
  Sparkles,
  Loader2,
  PackageCheck,
  ChevronDown,
  Crown,
  ShieldCheck,
  Lock,
  CheckCircle2
} from 'lucide-react';
import SubscriptionModal from '../../components/SubscriptionModal';
import {
  PRODUCE_CATEGORIES,
  ProduceCategoryId,
  ProduceCategory,
  Produce,
  getCategoryById,
  getProducesByCategory,
  getVarietiesByProduce,
  getProduceById
} from '../../data/produceMaster';

const DRAFT_KEY = 'agro_trade_draft_v2';

interface TradeDraft {
  categoryId: ProduceCategoryId | null;
  produceId: string;
  produceName: string;
  produceNameKn: string;
  variety: string;
  customVariety: string;
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
        categoryId: parsed.categoryId || null,
        produceId: parsed.produceId || '',
        produceName: parsed.produceName || '',
        produceNameKn: parsed.produceNameKn || '',
        variety: parsed.variety || '',
        customVariety: parsed.customVariety || '',
        quantity: parsed.quantity || '',
        price: parsed.price || '',
        photoPreview: parsed.photoPreview || null,
      };
    }
  } catch (e) {
    console.error('Failed to load trade draft', e);
  }
  return {
    categoryId: null,
    produceId: '',
    produceName: '',
    produceNameKn: '',
    variety: '',
    customVariety: '',
    quantity: '',
    price: '',
    photoPreview: null,
  };
}

const CATEGORY_ICONS: Record<ProduceCategoryId, React.ReactNode> = {
  CEREALS_MILLETS: <Wheat size={32} />,
  PULSES: <Sprout size={32} />,
  OILSEEDS: <Sun size={32} />,
  COMMERCIAL_CROPS: <Factory size={32} />,
  PLANTATION_CROPS: <Coffee size={32} />,
  SPICES: <Flame size={32} />,
  VEGETABLES: <Salad size={32} />,
  FRUITS: <Apple size={32} />,
};

export default function TradeCrops() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const draft = getStoredDraft();

  const urlCategory = searchParams.get('category')?.toUpperCase() as ProduceCategoryId | null;
  const initialCategory =
    urlCategory && PRODUCE_CATEGORIES.some((c) => c.id === urlCategory)
      ? urlCategory
      : draft.categoryId;

  const [category, setCategory] = useState<ProduceCategoryId | null>(initialCategory);

  // Cascading Form fields
  const [selectedProduceId, setSelectedProduceId] = useState<string>(draft.produceId);
  const [produceName, setProduceName] = useState<string>(draft.produceName);
  const [produceNameKn, setProduceNameKn] = useState<string>(draft.produceNameKn);
  const [variety, setVariety] = useState<string>(draft.variety);
  const [customVariety, setCustomVariety] = useState<string>(draft.customVariety);
  const [quantity, setQuantity] = useState<string>(draft.quantity);
  const [price, setPrice] = useState<string>(draft.price);

  // Photos
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(draft.photoPreview);
  const [aiGeneratedUrl, setAiGeneratedUrl] = useState<string | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Feedback & State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Subscription status & gating
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [checkingSub, setCheckingSub] = useState<boolean>(true);
  const [showSubModal, setShowSubModal] = useState<boolean>(false);
  const [subSuccessMsg, setSubSuccessMsg] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Check subscription status
  useEffect(() => {
    let isMounted = true;
    async function checkSubscription() {
      if (!user?.email) {
        setCheckingSub(false);
        return;
      }
      if (user.email === 'admin@agro.com' || user.email === 'nikhilgani987@gmail.com') {
        if (isMounted) {
          setHasSubscription(true);
          setCheckingSub(false);
        }
        return;
      }
      try {
        const res = await api.get('/farmer/subscription/status', {
          params: { farmer_id: user.email }
        });
        if (isMounted && res.data) {
          setHasSubscription(Boolean(res.data.has_active_subscription));
          setSubscription(res.data.subscription || null);
        }
      } catch (e) {
        console.warn('Subscription status check notice:', e);
      } finally {
        if (isMounted) setCheckingSub(false);
      }
    }
    checkSubscription();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Sync category from URL param if changed externally
  useEffect(() => {
    if (urlCategory && PRODUCE_CATEGORIES.some((c) => c.id === urlCategory)) {
      setCategory(urlCategory);
    }
  }, [urlCategory]);

  // Persist draft to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          categoryId: category,
          produceId: selectedProduceId,
          produceName,
          produceNameKn,
          variety,
          customVariety,
          quantity,
          price,
          photoPreview,
        })
      );
    } catch {}
  }, [category, selectedProduceId, produceName, produceNameKn, variety, customVariety, quantity, price, photoPreview]);

  // Available produces for the selected category
  const availableProduces: Produce[] = category ? getProducesByCategory(category) : [];

  // Available varieties for the selected produce
  const availableVarieties: string[] = selectedProduceId
    ? getVarietiesByProduce(selectedProduceId)
    : [];

  // 1. Cascading Handler: When Category Changes -> Reset Produce and Variety
  const handleCategorySelect = (catId: ProduceCategoryId) => {
    setCategory(catId);
    setSearchParams({ category: catId });
    setSelectedProduceId('');
    setProduceName('');
    setProduceNameKn('');
    setVariety('');
    setCustomVariety('');
    setSuccess(false);
    setUploadError(null);
  };

  // 2. Cascading Handler: When Produce Changes -> Reset Variety
  const handleProduceChange = (pId: string) => {
    setSelectedProduceId(pId);
    setVariety('');
    setCustomVariety('');
    setUploadError(null);

    const found = getProduceById(pId);
    if (found) {
      setProduceName(found.name);
      setProduceNameKn(found.nameKn);
    } else {
      setProduceName('');
      setProduceNameKn('');
    }
  };

  // 3. Cascading Handler: When Variety Changes
  const handleVarietyChange = (v: string) => {
    setVariety(v);
    if (v !== 'Other / Local Variety') {
      setCustomVariety('');
    }
  };

  const handleBackToCategories = () => {
    setCategory(null);
    setSearchParams({});
    setSelectedProduceId('');
    setProduceName('');
    setProduceNameKn('');
    setVariety('');
    setCustomVariety('');
    setSuccess(false);
    setUploadError(null);
  };

  function handleFileSelected(file: File | null) {
    setUploadError(null);
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`File size ${(file.size / (1024 * 1024)).toFixed(1)} MB exceeds the 5 MB limit.`);
      return;
    }

    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
    if (!hasValidExt) {
      setUploadError('Unsupported format. Please select a genuine JPG, PNG, or WEBP image.');
      return;
    }

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

  async function handleGenerateAiPhoto() {
    if (!produceName) {
      setUploadError('Please select a produce item first so AI can generate the exact produce image.');
      return;
    }
    setGeneratingAi(true);
    setUploadError(null);
    try {
      const activeVar = variety === 'Other / Local Variety' && customVariety ? customVariety : variety;
      const res = await api.post('/ai/generate-produce-photo', {
        crop_name: produceName,
        crop_type: activeVar,
      });
      if (res.data?.image_url) {
        setAiGeneratedUrl(res.data.image_url);
        const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
        setPhotoPreview(`${apiBase}${res.data.image_url}`);
        setPhoto(null);
      } else {
        throw new Error('No image returned by AI generator');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'AI image generation encountered an issue. Please try again.';
      setUploadError(msg);
    } finally {
      setGeneratingAi(false);
    }
  }

  function resetForm() {
    setSelectedProduceId('');
    setProduceName('');
    setProduceNameKn('');
    setVariety('');
    setCustomVariety('');
    setQuantity('');
    setPrice('');
    setPhoto(null);
    setPhotoPreview(null);
    setAiGeneratedUrl(null);
    setUploadError(null);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    if (fileRef.current) fileRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasSubscription) {
      setUploadError('Active Produce Trading Subscription required to publish listings. Please choose a trading pass below.');
      setShowSubModal(true);
      return;
    }

    if (!category || !produceName) {
      setUploadError('Please choose a category and select the produce item.');
      return;
    }
    if (!variety) {
      setUploadError('Please select a variety for your produce.');
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      setUploadError('Please specify a valid quantity in kg.');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setUploadError('Please specify a valid price per kg in ₹.');
      return;
    }

    setLoading(true);
    setSuccess(false);
    setUploadError(null);

    const finalVariety =
      variety === 'Other / Local Variety' && customVariety.trim()
        ? `Other (${customVariety.trim()})`
        : variety;

    try {
      let durableImageUrl: string | undefined = undefined;

      if (photo) {
        const formData = new FormData();
        formData.append('file', photo);
        try {
          const uploadRes = await api.post('/upload/produce-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (uploadRes.data?.image_url) {
            durableImageUrl = uploadRes.data.image_url;
          }
        } catch (uploadErr: any) {
          const detail = uploadErr.response?.data?.detail || 'Photo upload failed. Please verify the image.';
          setUploadError(detail);
          setLoading(false);
          return;
        }
      }

      if (!durableImageUrl && aiGeneratedUrl) {
        durableImageUrl = aiGeneratedUrl;
      }

      await api.post('/listings', {
        category,
        category_id: category,
        produce_id: selectedProduceId,
        produce_name: produceName,
        produce_name_kn: produceNameKn,
        variety: finalVariety,
        crop_name: produceName,
        crop_type: finalVariety,
        quantity_kg: parseFloat(quantity),
        price_per_kg: parseFloat(price),
        farmer_id: user?.email || 'farmer@agro.com',
        image_url: durableImageUrl,
      });

      setSuccess(true);
      resetForm();
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to publish produce listing. Please try again.';
      setUploadError(detail);
      if (err.response?.status === 403 && typeof detail === 'string' && detail.toLowerCase().includes('subscription')) {
        setShowSubModal(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const categoryMeta: ProduceCategory | undefined = category ? getCategoryById(category) : undefined;
  const parsedQty = parseFloat(quantity) || 0;
  const parsedPrice = parseFloat(price) || 0;
  const totalValue = parsedQty * parsedPrice;

  const renderSubscriptionBanner = () => {
    if (checkingSub) return null;

    if (!hasSubscription) {
      return (
        <div
          style={{
            background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            border: '1.5px solid #fcd34d',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            flexWrap: 'wrap',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#fef3c7',
                border: '1.5px solid #f59e0b',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Crown size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#d97706',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Subscription Required
                </span>
                <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#92400e' }}>
                  Produce Trading Membership
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#b45309', lineHeight: 1.4 }}>
                A valid subscription is required to publish produce listings and connect directly with bulk buyers across Karnataka.
                Plans: <strong>1 Year: ₹500</strong> • <strong>3 Years: ₹1,300</strong> • <strong>5 Years: ₹2,000</strong>.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSubModal(true)}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              border: 'none',
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              borderRadius: '0.65rem'
            }}
          >
            <Crown size={16} /> Get Trading Pass (from ₹500/yr)
          </button>
        </div>
      );
    }

    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '1.5px solid #86efac',
          borderRadius: '1rem',
          padding: '0.95rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#bbf7d0',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#14532d', fontWeight: 700, fontSize: '0.92rem' }}>
                Active Trading Pass: {subscription?.plan_tier ? subscription.plan_tier.replace('_', ' ') : 'Annual'}
              </span>
              <span
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  letterSpacing: '0.04em'
                }}
              >
                ACTIVE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#166534' }}>
              Valid through {subscription?.end_date || 'Active Season'} • Unlimited Karnataka APMC wholesale listings enabled
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSubModal(true)}
          className="btn btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
            background: '#dcfce7',
            color: '#15803d',
            border: '1px solid #86efac',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Crown size={14} style={{ color: '#16a34a' }} /> Extend / Upgrade Pass
        </button>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     VIEW 1: Category Selection Grid (All 8 Categories)
     ───────────────────────────────────────────────────────────── */
  if (!category || !categoryMeta) {
    return (
      <div className="animate-fadeIn" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '1.875rem' }}>
            <Wheat size={30} style={{ color: '#16a34a' }} /> Trade Produce
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.25rem' }}>
            Select a Karnataka agricultural produce category to create your direct-to-buyer listing
          </p>
        </div>

        {/* Subscription Notice or Active Pass */}
        {subSuccessMsg && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '0.75rem',
              padding: '0.85rem 1.25rem',
              color: '#15803d',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 600
            }}
          >
            <span>{subSuccessMsg}</span>
            <button
              onClick={() => setSubSuccessMsg(null)}
              style={{ background: 'transparent', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: 800 }}
            >
              ✕
            </button>
          </div>
        )}

        {renderSubscriptionBanner()}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {PRODUCE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              style={{
                background: '#ffffff',
                border: `2px solid ${cat.border}`,
                borderRadius: '1rem',
                padding: '1.75rem 1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.875rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 12px 28px rgba(0, 0, 0, 0.08)`;
                e.currentTarget.style.borderColor = cat.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = cat.border;
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '14px',
                  background: cat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: cat.color,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                {CATEGORY_ICONS[cat.id]}
              </div>

              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', color: '#1e293b', fontWeight: 700 }}>
                  {cat.label}
                </h3>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.9rem',
                    color: cat.color,
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                  }}
                >
                  {cat.labelKn}
                </span>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                  {cat.description}
                </p>
              </div>

              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: cat.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>{cat.items.length} produces</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>

        <SubscriptionModal
          isOpen={showSubModal}
          onClose={() => setShowSubModal(false)}
          onSuccess={(newSub) => {
            setHasSubscription(true);
            setSubscription(newSub);
            setSubSuccessMsg(`🎉 Trading pass activated successfully! Valid until ${newSub.end_date}. You can now publish produce listings.`);
            setUploadError(null);
          }}
        />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     VIEW 2: Listing Form (Cascading Selection Flow)
     ───────────────────────────────────────────────────────────── */
  return (
    <div className="animate-fadeIn" style={{ maxWidth: '780px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header with Back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={handleBackToCategories}
          className="btn btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            background: '#e2e8f0',
            color: '#334155',
            border: '1px solid #cbd5e1',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> All Categories
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: categoryMeta.bg,
                color: categoryMeta.color,
                border: `1px solid ${categoryMeta.border}`,
                padding: '0.2rem 0.6rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {CATEGORY_ICONS[categoryMeta.id]}
              {categoryMeta.label} • {categoryMeta.labelKn}
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', margin: '0.35rem 0 0', color: '#0f172a' }}>
            List {categoryMeta.label}
          </h1>
        </div>
      </div>

      {/* Subscription Notice or Active Pass */}
      {subSuccessMsg && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '0.75rem',
            padding: '0.85rem 1.25rem',
            color: '#15803d',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 600
          }}
        >
          <span>{subSuccessMsg}</span>
          <button
            onClick={() => setSubSuccessMsg(null)}
            style={{ background: 'transparent', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {renderSubscriptionBanner()}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        {/* Success Banner */}
        {success && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              color: '#166534',
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              fontWeight: 600,
              animation: 'scaleIn 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={22} style={{ color: '#16a34a' }} />
              <div>
                <div>Produce listing created successfully!</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 400, color: '#15803d', marginTop: 2 }}>
                  Your produce is now live on the marketplace for verified buyers.
                </div>
              </div>
            </div>
            <Link
              to={`/farmer/stocks?category=${category}`}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
            >
              <PackageCheck size={16} /> View in Stocks
            </Link>
          </div>
        )}

        {/* Error Alert */}
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

        {/* ── 1. Category Indicator (Read-only with Switch button) ── */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>1. Produce Category / ವರ್ಗ</label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: categoryMeta.bg,
              border: `1.5px solid ${categoryMeta.border}`,
              borderRadius: '0.625rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ color: categoryMeta.color }}>{CATEGORY_ICONS[categoryMeta.id]}</span>
              <div>
                <strong style={{ color: '#1e293b' }}>{categoryMeta.label}</strong>
                <span style={{ color: categoryMeta.color, marginLeft: '0.5rem', fontWeight: 600 }}>
                  ({categoryMeta.labelKn})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleBackToCategories}
              className="btn btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.6rem',
                background: '#e2e8f0',
                color: '#334155',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Change Category
            </button>
          </div>
        </div>

        {/* ── 2. Cascading Produce Selection ── */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>
            2. Produce Item / ಬೆಳೆ <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="input"
              value={selectedProduceId}
              onChange={(e) => handleProduceChange(e.target.value)}
              required
              style={{ paddingRight: '2.5rem', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="">-- Select {categoryMeta.label} Produce --</option>
              {availableProduces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} / {p.nameKn}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none',
              }}
            />
          </div>
          {selectedProduceId && (
            <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
              ✓ Selected: {produceName} ({produceNameKn})
            </div>
          )}
        </div>

        {/* ── 3. Cascading Variety Selection ── */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>
            3. Produce Variety / ತಳಿ <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="input"
              value={variety}
              onChange={(e) => handleVarietyChange(e.target.value)}
              disabled={!selectedProduceId}
              required
              style={{
                paddingRight: '2.5rem',
                cursor: selectedProduceId ? 'pointer' : 'not-allowed',
                background: 'rgba(3, 20, 14, 0.8)',
                color: selectedProduceId ? '#ffffff' : '#94a3b8',
                appearance: 'none',
              }}
            >
              <option value="">
                {selectedProduceId ? `-- Select Variety for ${produceName} --` : '← Please select produce first'}
              </option>
              {availableVarieties.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Custom variety text input if "Other / Local Variety" is selected */}
          {variety === 'Other / Local Variety' && (
            <div style={{ marginTop: '0.6rem' }}>
              <input
                className="input"
                type="text"
                placeholder="Specify your local / indigenous variety name (e.g. Nati, Desi, Hybrid)"
                value={customVariety}
                onChange={(e) => setCustomVariety(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        {/* ── 4 & 5. Quantity & Price ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              4. Quantity (kg) / ಪ್ರಮಾಣ (ಕೆ.ಜಿ) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type="number"
                min="1"
                step="any"
                placeholder="e.g. 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <span
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                kg
              </span>
            </div>
            {parsedQty > 0 && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                ≈ {(parsedQty / 100).toFixed(2)} Quintals
              </span>
            )}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              5. Price per kg (₹) / ಬೆಲೆ <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                ₹
              </span>
              <input
                className="input"
                type="number"
                min="0.5"
                step="any"
                placeholder="e.g. 38"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                style={{ paddingLeft: '2rem' }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  fontSize: '0.8rem',
                }}
              >
                / kg
              </span>
            </div>
            {parsedPrice > 0 && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                ≈ ₹{(parsedPrice * 100).toLocaleString('en-IN')} / Quintal
              </span>
            )}
          </div>
        </div>

        {/* Real-time Total Estimate Card */}
        {totalValue > 0 && (
          <div
            style={{
              background: 'rgba(3, 20, 14, 0.75)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              borderRadius: '0.75rem',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Estimated Lot Total</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8' }}>
              <div>{quantity} kg @ ₹{price}/kg</div>
              <div style={{ color: '#34d399', fontWeight: 600 }}>Ready to Trade</div>
            </div>
          </div>
        )}

        {/* ── 6. Photo upload & AI Agent ── */}
        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>
              6. Seller Produce Photo <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>JPG, PNG, WEBP (max 5 MB)</span>
          </label>

          {photoPreview ? (
            <div
              style={{
                border: `2px solid ${categoryMeta.color}`,
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
                  style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
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
                  }}
                >
                  {aiGeneratedUrl ? 'AI Generated Crop Photo' : 'Authentic Seller Photo'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                    setAiGeneratedUrl(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'rgba(0, 0, 0, 0.65)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                  }}
                  title="Remove photo"
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                border: '2px dashed rgba(52, 211, 153, 0.35)',
                borderRadius: '0.875rem',
                background: 'rgba(3, 20, 14, 0.7)',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div>
                <p style={{ margin: '0 0 0.2rem', fontWeight: 700, color: '#ffffff' }}>
                  Add a real photo of your harvest
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Upload from device, take with camera, or generate with AI assistant
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={14} /> Upload Photo
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => cameraRef.current?.click()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={14} /> Take Photo
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={generatingAi || !produceName}
                  onClick={handleGenerateAiPhoto}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    border: 'none',
                    color: '#ffffff',
                    cursor: generatingAi || !produceName ? 'not-allowed' : 'pointer',
                    opacity: generatingAi || !produceName ? 0.6 : 1,
                  }}
                  title={!produceName ? 'Select produce first' : 'Generate realistic crop photo with AI'}
                >
                  {generatingAi ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Generating…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* ── Submit button / Subscription gate ── */}
        {!hasSubscription ? (
          <button
            type="button"
            onClick={() => setShowSubModal(true)}
            className="btn"
            style={{
              width: '100%',
              padding: '0.95rem',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <Lock size={18} />
            <span>Subscribe to Publish Produce (From ₹500/yr)</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || !selectedProduceId || !variety}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              border: 'none',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Publishing Listing…</span>
              </>
            ) : (
              <span>Publish {produceName || categoryMeta.label} Listing</span>
            )}
          </button>
        )}
      </form>

      {/* Subscription Modal for View 2 */}
      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSuccess={(newSub) => {
          setHasSubscription(true);
          setSubscription(newSub);
          setSubSuccessMsg(`🎉 Trading pass activated successfully! Valid until ${newSub.end_date}. You can now publish produce listings.`);
          setUploadError(null);
        }}
      />
    </div>
  );
}
