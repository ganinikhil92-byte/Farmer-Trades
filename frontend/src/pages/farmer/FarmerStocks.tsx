import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import {
  Wheat,
  Sprout,
  Sun,
  Factory,
  Coffee,
  Flame,
  Salad,
  Apple,
  Camera,
  ArrowLeft,
  PlusCircle,
  Package,
  Search,
  Filter,
  Layers
} from 'lucide-react';
import { resolveProduceImage, handleImageError } from '../../utils/producePhoto';
import { useAuth } from '../../context/AuthContext';
import ListingPhotoModal from '../../components/ListingPhotoModal';
import {
  PRODUCE_CATEGORIES,
  ProduceCategoryId,
  getCategoryById,
  findProduceByName,
  mapLegacyCategory
} from '../../data/produceMaster';

interface Listing {
  id: number | string;
  category?: string;
  category_id?: string;
  crop_name?: string;
  crop_type?: string;
  produce_id?: string;
  produce_name?: string;
  produce_name_kn?: string;
  variety?: string;
  quantity_kg: number;
  price_per_kg: number;
  farmer_id: string;
  image_url?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all: <Layers size={18} />,
  CEREALS_MILLETS: <Wheat size={18} />,
  PULSES: <Sprout size={18} />,
  OILSEEDS: <Sun size={18} />,
  COMMERCIAL_CROPS: <Factory size={18} />,
  PLANTATION_CROPS: <Coffee size={18} />,
  SPICES: <Flame size={18} />,
  VEGETABLES: <Salad size={18} />,
  FRUITS: <Apple size={18} />,
};

interface FarmerStocksProps {
  defaultCategory?: string;
}

export default function FarmerStocks({ defaultCategory }: FarmerStocksProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query or props
  const queryCat = searchParams.get('category');
  const activeCategoryParam = (defaultCategory || queryCat || '').trim();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    activeCategoryParam ? activeCategoryParam : null
  );

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoModalListing, setPhotoModalListing] = useState<Listing | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeCategoryParam) {
      setSelectedCategory(activeCategoryParam);
    }
  }, [activeCategoryParam]);

  useEffect(() => {
    setLoading(true);
    api
      .get('/listings')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setListings(res.data as Listing[]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch listings', err);
        setLoading(false);
      });
  }, []);

  const handleSelectCategory = (cat: string | null) => {
    setSelectedCategory(cat);
    if (cat && cat !== 'all') {
      setSearchParams({ category: cat });
    } else if (cat === 'all') {
      setSearchParams({ category: 'all' });
    } else {
      setSearchParams({});
    }
  };

  // Helper to get normalized category ID for a listing
  const getListingCategoryId = (item: Listing): string => {
    if (item.category_id && item.category_id.trim()) {
      return item.category_id.trim().toUpperCase();
    }
    return mapLegacyCategory(item.category, item.produce_name || item.crop_name);
  };

  // Helper to get produce display details
  const getListingProduceDetails = (item: Listing) => {
    const rawName = item.produce_name || item.crop_name || 'Produce';
    let knName = item.produce_name_kn || '';
    if (!knName) {
      const match = findProduceByName(rawName);
      if (match) knName = match.nameKn;
    }
    const varName = item.variety || item.crop_type || 'Standard';
    return { name: rawName, nameKn: knName, variety: varName };
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // 1. Category Filter
      if (selectedCategory && selectedCategory.toLowerCase() !== 'all') {
        const itemCat = getListingCategoryId(item);
        const target = selectedCategory.toUpperCase();
        if (itemCat !== target) {
          // Check legacy match
          const legacyCat = (item.category || '').toLowerCase();
          if (target === 'CEREALS_MILLETS' && legacyCat !== 'crop') return false;
          if (target === 'VEGETABLES' && legacyCat !== 'vegetable') return false;
          if (target === 'FRUITS' && legacyCat !== 'fruit') return false;
          if (!['CEREALS_MILLETS', 'VEGETABLES', 'FRUITS'].includes(target)) return false;
        }
      }

      // 2. Search Filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const { name, nameKn, variety } = getListingProduceDetails(item);
        const matchName = name.toLowerCase().includes(q);
        const matchKn = nameKn.toLowerCase().includes(q);
        const matchVar = variety.toLowerCase().includes(q);
        const matchFarmer = (item.farmer_id || '').toLowerCase().includes(q);
        return matchName || matchKn || matchVar || matchFarmer;
      }

      return true;
    });
  }, [listings, selectedCategory, searchTerm]);

  // Inventory stats per category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; totalKg: number }> = {};
    PRODUCE_CATEGORIES.forEach((cat) => {
      stats[cat.id] = { count: 0, totalKg: 0 };
    });

    listings.forEach((l) => {
      const catId = getListingCategoryId(l);
      if (stats[catId]) {
        stats[catId].count += 1;
        stats[catId].totalKg += Number(l.quantity_kg) || 0;
      }
    });

    return stats;
  }, [listings]);

  const activeCategoryMeta = selectedCategory && selectedCategory !== 'all'
    ? getCategoryById(selectedCategory)
    : null;

  /* ─────────────────────────────────────────────────────────────
     VIEW 1: Overview Cards (When no category is filtered)
     ───────────────────────────────────────────────────────────── */
  if (selectedCategory === null) {
    return (
      <div className="animate-fadeIn" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
        <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '1.875rem' }}>
              <Package size={30} style={{ color: '#059669' }} /> Produce Inventory & Stocks
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.25rem' }}>
              Karnataka agricultural produce inventory, active marketplace listings & photo management
            </p>
          </div>
          <button
            onClick={() => handleSelectCategory('all')}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Layers size={16} /> View All Produce ({listings.length})
          </button>
        </div>

        {/* 8 Top-Level Category Overview Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {PRODUCE_CATEGORIES.map((cat) => {
            const stat = categoryStats[cat.id] || { count: 0, totalKg: 0 };
            return (
              <div
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                style={{
                  background: '#ffffff',
                  border: `2px solid ${cat.border}`,
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = cat.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = cat.border;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: cat.bg,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {CATEGORY_ICONS[cat.id]}
                  </div>
                  <span
                    style={{
                      background: stat.count > 0 ? cat.bg : '#f1f5f9',
                      color: stat.count > 0 ? cat.color : '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '1rem',
                    }}
                  >
                    {stat.count} {stat.count === 1 ? 'listing' : 'listings'}
                  </span>
                </div>

                <div>
                  <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>
                    {cat.label}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: cat.color, fontWeight: 600 }}>
                    {cat.labelKn}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: '#64748b',
                  }}
                >
                  <span>Total stock: <strong>{stat.totalKg.toLocaleString()} kg</strong></span>
                  <span style={{ color: cat.color, fontWeight: 600 }}>Explore →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     VIEW 2: Filtered Table View with Category Pill Tabs
     ───────────────────────────────────────────────────────────── */
  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => handleSelectCategory(null)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={15} /> All Categories
          </button>
          <div>
            <h1 style={{ fontSize: '1.65rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {activeCategoryMeta ? (
                <>
                  <span style={{ color: activeCategoryMeta.color }}>{CATEGORY_ICONS[activeCategoryMeta.id]}</span>
                  <span>{activeCategoryMeta.label} Stocks</span>
                  <span style={{ fontSize: '1.1rem', color: activeCategoryMeta.color, fontWeight: 500 }}>
                    ({activeCategoryMeta.labelKn})
                  </span>
                </>
              ) : (
                <>
                  <Layers size={24} style={{ color: '#059669' }} />
                  <span>All Produce Stocks</span>
                </>
              )}
            </h1>
          </div>
        </div>

        <Link
          to={selectedCategory && selectedCategory !== 'all' ? `/farmer/trade?category=${selectedCategory}` : '/farmer/trade'}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
        >
          <PlusCircle size={16} /> List New Produce
        </Link>
      </div>

      {/* Category Pills Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '1.25rem',
        }}
      >
        <button
          onClick={() => handleSelectCategory('all')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '2rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: selectedCategory === 'all' ? '2px solid #059669' : '1px solid #cbd5e1',
            background: selectedCategory === 'all' ? '#ecfdf5' : '#ffffff',
            color: selectedCategory === 'all' ? '#047857' : '#475569',
            whiteSpace: 'nowrap',
          }}
        >
          <Layers size={14} /> All Produce ({listings.length})
        </button>

        {PRODUCE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory?.toUpperCase() === cat.id;
          const stat = categoryStats[cat.id] || { count: 0 };
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '2rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: isSelected ? `2px solid ${cat.color}` : '1px solid #cbd5e1',
                background: isSelected ? cat.bg : '#ffffff',
                color: isSelected ? cat.color : '#475569',
                whiteSpace: 'nowrap',
              }}
            >
              {CATEGORY_ICONS[cat.id]}
              <span>{cat.label}</span>
              <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>({stat.count})</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="input"
          placeholder="Search by produce name (English or Kannada), variety, or farmer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Listings Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <div className="animate-pulse" style={{ color: '#059669', fontWeight: 600 }}>
            Loading produce inventory…
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th style={{ width: '70px' }}>Photo</th>
                <th>Produce Name / ಹೆಸರು</th>
                <th>Variety / ತಳಿ</th>
                <th>Category</th>
                <th>Quantity (kg)</th>
                <th>Price / kg</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Photo Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={36} style={{ color: '#cbd5e1' }} />
                      <div style={{ fontWeight: 600, color: '#334155' }}>No produce listings found</div>
                      <div style={{ fontSize: '0.85rem' }}>
                        {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first produce listing using the button above.'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredListings.map((l, idx) => {
                  const { name, nameKn, variety: varName } = getListingProduceDetails(l);
                  const catId = getListingCategoryId(l);
                  const catMeta = getCategoryById(catId);
                  const imgRes = resolveProduceImage({
                    name,
                    category: catId,
                    imageUrl: l.image_url,
                  });
                  const isOwner =
                    user?.email &&
                    l.farmer_id &&
                    (l.farmer_id.toLowerCase() === user.email.toLowerCase() || user.role === 'admin');

                  const totalRowValue = (Number(l.quantity_kg) || 0) * (Number(l.price_per_kg) || 0);

                  return (
                    <tr key={l.id}>
                      <td>{idx + 1}</td>
                      <td style={{ width: '70px', padding: '0.4rem 0.6rem' }}>
                        <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                          <img
                            src={imgRes.url}
                            alt={name}
                            style={{
                              width: '52px',
                              height: '52px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                              display: 'block',
                            }}
                            onError={handleImageError}
                          />
                          <span
                            title={imgRes.label}
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: imgRes.isSellerProvided
                                ? 'rgba(22, 101, 52, 0.9)'
                                : 'rgba(100, 116, 139, 0.85)',
                              color: '#fff',
                              fontSize: '0.55rem',
                              padding: '1px 2px',
                              textAlign: 'center',
                              borderBottomLeftRadius: 8,
                              borderBottomRightRadius: 8,
                              lineHeight: 1.1,
                            }}
                          >
                            {imgRes.isSellerProvided ? 'Photo' : 'No photo'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{name}</div>
                        {nameKn && (
                          <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 500 }}>
                            {nameKn}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.35rem',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                          }}
                        >
                          {varName}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            background: catMeta?.bg || '#f8fafc',
                            color: catMeta?.color || '#334155',
                            border: `1px solid ${catMeta?.border || '#e2e8f0'}`,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.35rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {CATEGORY_ICONS[catId]}
                          {catMeta?.label || catId}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{l.quantity_kg} kg</td>
                      <td>₹{l.price_per_kg}</td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>
                        ₹{totalRowValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`badge ${l.quantity_kg > 0 ? 'badge-green' : 'badge-red'}`}>
                          {l.quantity_kg > 0 ? 'In Stock' : 'Sold Out'}
                        </span>
                      </td>
                      <td>
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() => setPhotoModalListing(l)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            title="Update or add authentic photo"
                          >
                            <Camera size={13} /> {l.image_url ? 'Change Photo' : 'Add Photo'}
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Photo Update Modal */}
      {photoModalListing && (
        <ListingPhotoModal
          listing={photoModalListing}
          isOpen={Boolean(photoModalListing)}
          onClose={() => setPhotoModalListing(null)}
          onSuccess={(listingId, newImageUrl) => {
            setListings((prev) =>
              prev.map((item) => (String(item.id) === String(listingId) ? { ...item, image_url: newImageUrl } : item))
            );
          }}
        />
      )}
    </div>
  );
}
