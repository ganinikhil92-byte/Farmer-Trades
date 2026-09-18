import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Wheat, Salad, Apple, Camera, ArrowLeft, PlusCircle, Package, Search } from 'lucide-react';
import { resolveProduceImage, handleImageError } from '../../utils/producePhoto';
import { useAuth } from '../../context/AuthContext';
import ListingPhotoModal from '../../components/ListingPhotoModal';

type StockCategory = 'crop' | 'vegetable' | 'fruit';

interface Listing {
  id: number | string;
  category: string;
  crop_name: string;
  crop_type: string;
  quantity_kg: number;
  price_per_kg: number;
  farmer_id: string;
  image_url?: string;
}

const CATEGORY_CONFIG: Record<
  StockCategory,
  {
    label: string;
    singular: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    accent: string;
    border: string;
    description: string;
  }
> = {
  crop: {
    label: 'Crop Stock',
    singular: 'Crop',
    icon: <Wheat size={36} />,
    color: '#ca8a04',
    bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
    accent: '#fef08a',
    border: '#fde047',
    description: 'Grain, cereal, paddy, wheat, and cash crop inventories',
  },
  vegetable: {
    label: 'Vegetable Stock',
    singular: 'Vegetable',
    icon: <Salad size={36} />,
    color: '#16a34a',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    accent: '#bbf7d0',
    border: '#86efac',
    description: 'Fresh vegetables, tomatoes, greens, onions, and root crops',
  },
  fruit: {
    label: 'Fruit Stock',
    singular: 'Fruit',
    icon: <Apple size={36} />,
    color: '#dc2626',
    bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
    accent: '#fecdd3',
    border: '#fca5a5',
    description: 'Orchard harvests, mangoes, bananas, citrus, and seasonal fruits',
  },
};

export default function FarmerStocks() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read category from query if provided: ?category=crop | vegetable | fruit | all
  const urlCategory = searchParams.get('category') as StockCategory | 'all' | null;
  const [selectedCategory, setSelectedCategory] = useState<StockCategory | 'all' | null>(urlCategory);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoModalListing, setPhotoModalListing] = useState<Listing | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync state if URL query changes
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory]);

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
      .catch(() => setLoading(false));
  }, []);

  const handleSelectCategory = (cat: StockCategory | 'all' | null) => {
    setSelectedCategory(cat);
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
  };

  // Filter listings by selected category & search
  const filteredListings = listings.filter((item) => {
    if (selectedCategory && selectedCategory !== 'all') {
      if (item.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = item.crop_name?.toLowerCase().includes(q);
      const matchType = item.crop_type?.toLowerCase().includes(q);
      return matchName || matchType;
    }
    return true;
  });

  // Category counts
  const cropCount = listings.filter((l) => l.category?.toLowerCase() === 'crop').length;
  const vegCount = listings.filter((l) => l.category?.toLowerCase() === 'vegetable').length;
  const fruitCount = listings.filter((l) => l.category?.toLowerCase() === 'fruit').length;

  const getCategoryCount = (key: StockCategory) => {
    if (key === 'crop') return cropCount;
    if (key === 'vegetable') return vegCount;
    return fruitCount;
  };

  const getCategoryTotalKg = (key: StockCategory) => {
    return listings
      .filter((l) => l.category?.toLowerCase() === key.toLowerCase())
      .reduce((sum, item) => sum + (Number(item.quantity_kg) || 0), 0);
  };

  /* ─────────────────────────────────────────────────────────────
     VIEW 1: 3-OPTION CARDS (Mirroring Trade Selection Screen)
     ───────────────────────────────────────────────────────────── */
  if (selectedCategory === null) {
    return (
      <div className="animate-fadeIn" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '1.875rem' }}>
            <Package size={30} style={{ color: '#059669' }} /> Produce Stocks
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.25rem' }}>
            Select an inventory category to view active listings, manage produce quantities, and update real photos
          </p>
        </div>

        {/* 3 Option Cards (Crop Stock, Vegetable Stock, Fruit Stock) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {(Object.entries(CATEGORY_CONFIG) as [StockCategory, typeof CATEGORY_CONFIG[StockCategory]][]).map(
            ([key, config]) => {
              const count = getCategoryCount(key);
              const totalKg = getCategoryTotalKg(key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectCategory(key)}
                  style={{
                    background: config.bg,
                    border: `2px solid ${config.border}`,
                    borderRadius: '1.25rem',
                    padding: '2.5rem 1.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '1rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 14px 28px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <span style={{ color: config.color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}>
                    {config.icon}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: config.color, margin: 0 }}>
                      {config.label}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.35rem', marginBottom: 0 }}>
                      {config.description}
                    </p>
                  </div>

                  {/* Stock Pill */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.85)',
                      padding: '0.375rem 0.875rem',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: config.color,
                      border: `1px solid ${config.accent}`,
                      marginTop: '0.5rem',
                    }}
                  >
                    <span>{count} {count === 1 ? 'Listing' : 'Listings'}</span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span>{totalKg.toLocaleString()} kg</span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: config.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    Open {config.singular} Stock →
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* View All Stocks Link Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '1rem',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#1e293b' }}>
              Want to see your full combined inventory?
            </h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
              View all {listings.length} crops, vegetables, and fruits in a single unified table.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSelectCategory('all')}
            className="btn btn-secondary"
            style={{ fontWeight: 600 }}
          >
            View All Combined Stocks ({listings.length})
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     VIEW 2: STOCK INVENTORY TABLE (With Option Switcher Pills)
     ───────────────────────────────────────────────────────────── */
  const activeConfig = selectedCategory !== 'all' ? CATEGORY_CONFIG[selectedCategory] : null;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header Row with Back Button, Category Tabs, and Add Stock button */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => handleSelectCategory(null)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Back to Stocks
          </button>

          <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {activeConfig ? (
              <>
                <span style={{ color: activeConfig.color }}>{activeConfig.icon}</span>
                <span>{activeConfig.label}</span>
              </>
            ) : (
              <>
                <Package size={26} style={{ color: '#059669' }} />
                <span>All Produce Stocks</span>
              </>
            )}
          </h1>
        </div>

        {/* Quick action: Add new listing via Trade */}
        <Link
          to={`/farmer/trade${selectedCategory && selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
        >
          <PlusCircle size={16} />
          <span>Add New {activeConfig ? activeConfig.singular : 'Produce'} (Trade)</span>
        </Link>
      </div>

      {/* Category Filter Pills (Crop Stock, Vegetable Stock, Fruit Stock, All) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}
      >
        <button
          type="button"
          onClick={() => handleSelectCategory('all')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: selectedCategory === 'all' ? '2px solid #059669' : '1px solid #e2e8f0',
            background: selectedCategory === 'all' ? '#064e3b' : '#ffffff',
            color: selectedCategory === 'all' ? '#ffffff' : '#475569',
            transition: 'all 150ms ease',
          }}
        >
          All Produce ({listings.length})
        </button>

        {(Object.entries(CATEGORY_CONFIG) as [StockCategory, typeof CATEGORY_CONFIG[StockCategory]][]).map(
          ([key, conf]) => {
            const isActive = selectedCategory === key;
            const count = getCategoryCount(key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectCategory(key)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? `2px solid ${conf.color}` : '1px solid #e2e8f0',
                  background: isActive ? conf.bg : '#ffffff',
                  color: isActive ? conf.color : '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 150ms ease',
                }}
              >
                <span>{conf.label}</span>
                <span
                  style={{
                    background: isActive ? '#ffffff' : '#f1f5f9',
                    padding: '0.125rem 0.45rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          }
        )}

        {/* Live Search */}
        <div style={{ marginLeft: 'auto', position: 'relative', minWidth: '220px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search produce name or type…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.25rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <div className="animate-pulse" style={{ fontSize: '1rem', color: '#64748b' }}>
            Loading stock inventory…
          </div>
        </div>
      ) : (
        <div className="table-container" style={{ background: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '45px' }}>#</th>
                <th style={{ width: '75px' }}>Photo</th>
                <th>Produce Name</th>
                <th>Category</th>
                <th>Type / Variety</th>
                <th>Quantity (kg)</th>
                <th>Price / kg</th>
                <th>Total Value</th>
                <th>Status</th>
                <th style={{ width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                    <Package size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      No {activeConfig ? activeConfig.singular.toLowerCase() : 'produce'} listings found in this category.
                    </p>
                    <Link
                      to={`/farmer/trade${selectedCategory && selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <PlusCircle size={15} /> Add First Listing
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredListings.map((l, i) => {
                  const imgRes = resolveProduceImage({
                    name: l.crop_name,
                    category: l.category,
                    imageUrl: l.image_url,
                  });
                  const isOwner =
                    user?.email &&
                    l.farmer_id &&
                    (l.farmer_id.toLowerCase() === user.email.toLowerCase() || user.role === 'admin');

                  const itemCat = (l.category || 'crop').toLowerCase() as StockCategory;
                  const itemConfig = CATEGORY_CONFIG[itemCat] || CATEGORY_CONFIG.crop;

                  return (
                    <tr key={l.id}>
                      <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{i + 1}</td>
                      <td style={{ padding: '0.4rem 0.6rem' }}>
                        <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                          <img
                            src={imgRes.url}
                            alt={l.crop_name}
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
                          {imgRes.isSellerProvided ? (
                            <span
                              title="Seller-provided photo"
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(22, 101, 52, 0.92)',
                                color: '#ffffff',
                                fontSize: '0.55rem',
                                padding: '1px 2px',
                                textAlign: 'center',
                                borderBottomLeftRadius: 8,
                                borderBottomRightRadius: 8,
                                lineHeight: 1.1,
                                fontWeight: 600,
                              }}
                            >
                              Photo
                            </span>
                          ) : (
                            <span
                              title="Default produce image"
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(100, 116, 139, 0.85)',
                                color: '#ffffff',
                                fontSize: '0.5rem',
                                padding: '1px 2px',
                                textAlign: 'center',
                                borderBottomLeftRadius: 8,
                                borderBottomRightRadius: 8,
                                lineHeight: 1.1,
                              }}
                            >
                              Default
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{l.crop_name}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: itemConfig.bg,
                            color: itemConfig.color,
                            border: `1px solid ${itemConfig.accent}`,
                            textTransform: 'capitalize',
                          }}
                        >
                          {itemConfig.singular}
                        </span>
                      </td>
                      <td style={{ color: '#475569' }}>{l.crop_type || '—'}</td>
                      <td style={{ fontWeight: 500 }}>{Number(l.quantity_kg).toLocaleString()} kg</td>
                      <td>₹{Number(l.price_per_kg).toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: '#166534' }}>
                        ₹{(Number(l.quantity_kg) * Number(l.price_per_kg)).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${Number(l.quantity_kg) > 0 ? 'badge-green' : 'badge-red'}`}>
                          {Number(l.quantity_kg) > 0 ? 'In Stock' : 'Sold Out'}
                        </span>
                      </td>
                      <td>
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() => setPhotoModalListing(l)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.75rem',
                              padding: '0.3rem 0.6rem',
                            }}
                            title="Update or add photo for this listing"
                          >
                            <Camera size={13} /> {l.image_url ? 'Change Photo' : 'Add Photo'}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>
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
