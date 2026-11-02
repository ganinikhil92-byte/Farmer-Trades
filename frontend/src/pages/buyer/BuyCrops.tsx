import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Listing, getCart } from './cartStore';
import { resolveProduceImage, handleImageError } from '../../utils/producePhoto';
import {
  PRODUCE_CATEGORIES,
  ProduceCategoryId,
  getCategoryById,
  findProduceByName,
  mapLegacyCategory
} from '../../data/produceMaster';
import {
  Sprout,
  Search,
  ShoppingCart,
  ClipboardList,
  User,
  LogOut,
  ChevronDown,
  X,
  MapPin,
  Package,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Wheat,
  Sun,
  Factory,
  Coffee,
  Flame,
  Salad,
  Apple,
  Layers,
  AlertCircle,
  WifiOff,
  RefreshCw,
  Filter
} from 'lucide-react';
import './BuyCrops.css';

const CACHE_LISTINGS_KEY = 'agro_cached_produce_listings_v2';
const CACHE_FARMERS_KEY = 'agro_cached_farmers_map_v2';

export type { Listing };

export interface ProduceListing extends Listing {
  district?: string;
  category_id?: string;
  produce_id?: string;
  produce_name?: string;
  produce_name_kn?: string;
  variety?: string;
}

interface FarmerMeta {
  name: string;
  district?: string;
  taluk?: string;
  village?: string;
}

const CATEGORY_ITEMS: { id: string; label: string; labelKn: string; icon: React.ReactNode; color: string }[] = [
  { id: 'all', label: 'All Produce', labelKn: 'ಎಲ್ಲಾ', icon: <Layers size={16} />, color: '#059669' },
  { id: 'CEREALS_MILLETS', label: 'Cereals & Millets', labelKn: 'ಧಾನ್ಯಗಳು', icon: <Wheat size={16} />, color: '#ca8a04' },
  { id: 'PULSES', label: 'Pulses', labelKn: 'ಬೇಳೆಕಾಳು', icon: <Sprout size={16} />, color: '#d97706' },
  { id: 'OILSEEDS', label: 'Oilseeds', labelKn: 'ಎಣ್ಣೆಕಾಳು', icon: <Sun size={16} />, color: '#eab308' },
  { id: 'COMMERCIAL_CROPS', label: 'Commercial Crops', labelKn: 'ವಾಣಿಜ್ಯ', icon: <Factory size={16} />, color: '#0284c7' },
  { id: 'PLANTATION_CROPS', label: 'Plantation Crops', labelKn: 'ತೋಟದ', icon: <Coffee size={16} />, color: '#854d0e' },
  { id: 'SPICES', label: 'Spices', labelKn: 'ಮಸಾಲೆ', icon: <Flame size={16} />, color: '#dc2626' },
  { id: 'VEGETABLES', label: 'Vegetables', labelKn: 'ತರಕಾರಿಗಳು', icon: <Salad size={16} />, color: '#16a34a' },
  { id: 'FRUITS', label: 'Fruits', labelKn: 'ಹಣ್ಣುಗಳು', icon: <Apple size={16} />, color: '#ea580c' },
];

export default function BuyCrops() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [farmersMap, setFarmersMap] = useState<Record<string, FarmerMeta>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedProduce, setSelectedProduce] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart & Quantities
  const [quantities, setQuantities] = useState<Record<string | number, number>>({});
  const [addedId, setAddedId] = useState<string | number | null>(null);
  const [cartCount, setCartCount] = useState<number>(() => getCart().length);

  // Account Menu dropdown
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const [isUsingCache, setIsUsingCache] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Fetch produce listings and farmer metadata
  const fetchData = async (isManualRetry = false, attempt = 1) => {
    if (isManualRetry || attempt === 1) {
      setLoading(true);
      setError(null);
    }
    if (isManualRetry) {
      setRetrying(true);
    }
    try {
      const [listingsRes, farmersRes] = await Promise.all([
        api.get('/listings'),
        api.get('/users?role=farmer').catch(() => ({ data: [] })),
      ]);

      // Farmers lookup map by email
      const fMap: Record<string, FarmerMeta> = {};
      if (Array.isArray(farmersRes.data)) {
        farmersRes.data.forEach((f: any) => {
          if (f && f.email) {
            fMap[f.email.toLowerCase()] = {
              name: f.name || f.email,
              district: f.district || undefined,
              taluk: f.taluk || undefined,
              village: f.village || undefined,
            };
          }
        });
      }
      setFarmersMap(fMap);

      // Keep all listings across all 8 produce categories
      const rawListings: ProduceListing[] = Array.isArray(listingsRes.data) ? listingsRes.data : [];
      const seenIds = new Set<string | number>();
      const uniqueListings: ProduceListing[] = [];
      const initialQty: Record<string | number, number> = {};

      rawListings.forEach((l) => {
        if (l && l.id != null && !seenIds.has(l.id)) {
          seenIds.add(l.id);
          uniqueListings.push(l);
          const maxAvail = Number(l.quantity_kg) || 0;
          initialQty[l.id] = maxAvail > 0 ? Math.min(5, Math.max(1, maxAvail)) : 1;
        }
      });

      setListings(uniqueListings);
      setQuantities(initialQty);
      setCartCount(getCart().length);
      setIsUsingCache(false);

      // Cache fresh data for offline/fallback access
      try {
        localStorage.setItem(CACHE_LISTINGS_KEY, JSON.stringify(uniqueListings));
        localStorage.setItem(CACHE_FARMERS_KEY, JSON.stringify(fMap));
      } catch (storageErr) {}
    } catch (err: any) {
      console.warn(`Marketplace fetch attempt ${attempt} failed:`, err);
      if (attempt === 1 && !isManualRetry) {
        setTimeout(() => {
          fetchData(false, 2);
        }, 1500);
        return;
      }

      // Check for cached listings as resilient fallback
      try {
        const cachedListingsStr = localStorage.getItem(CACHE_LISTINGS_KEY);
        const cachedFarmersStr = localStorage.getItem(CACHE_FARMERS_KEY);
        if (cachedListingsStr) {
          const rawCached: ProduceListing[] = JSON.parse(cachedListingsStr);
          if (Array.isArray(rawCached) && rawCached.length > 0) {
            const initialQty: Record<string | number, number> = {};
            rawCached.forEach((l) => {
              if (l && l.id != null) {
                const maxAvail = Number(l.quantity_kg) || 0;
                initialQty[l.id] = maxAvail > 0 ? Math.min(5, Math.max(1, maxAvail)) : 1;
              }
            });
            setListings(rawCached);
            setQuantities(initialQty);
            if (cachedFarmersStr) {
              setFarmersMap(JSON.parse(cachedFarmersStr));
            }
            setIsUsingCache(true);
            setError(null);
            setLoading(false);
            setRetrying(false);
            return;
          }
        }
      } catch (cacheErr) {}

      setError(
        'Unable to load produce listings. Please ensure the backend server is running and check your connection.'
      );
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCartCount(getCart().length);
  }, []);

  // Account menu outside-click & keyboard dismissal
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAccountOpen(false);
      }
    }
    if (accountOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  // Derived available districts from actual listings
  const availableDistricts = useMemo(() => {
    const districts = new Set<string>();
    listings.forEach((l) => {
      const d = l.district || farmersMap[(l.farmer_id || '').toLowerCase()]?.district;
      if (d && typeof d === 'string' && d.trim()) {
        districts.add(d.trim());
      }
    });
    return Array.from(districts).sort();
  }, [listings, farmersMap]);

  // Helper to extract clean produce details
  const getProduceDetails = (l: ProduceListing) => {
    const name = l.produce_name || l.crop_name || 'Produce';
    let nameKn = l.produce_name_kn || '';
    if (!nameKn) {
      const match = findProduceByName(name);
      if (match) nameKn = match.nameKn;
    }
    const variety = l.variety || l.crop_type || '';
    const catId = (l.category_id && l.category_id.trim())
      ? l.category_id.trim().toUpperCase()
      : mapLegacyCategory(l.category, name);
    return { name, nameKn, variety, catId };
  };

  // Filtered listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (!l) return false;
      if (Number(l.quantity_kg) <= 0) return false;

      const { name, nameKn, variety, catId } = getProduceDetails(l);

      // 1. Category filter
      if (selectedCategory !== 'all') {
        const target = selectedCategory.toUpperCase();
        if (catId !== target) {
          const rawCat = (l.category || '').toLowerCase();
          if (target === 'CEREALS_MILLETS' && rawCat !== 'crop') return false;
          if (target === 'VEGETABLES' && rawCat !== 'vegetable') return false;
          if (target === 'FRUITS' && rawCat !== 'fruit') return false;
          if (!['CEREALS_MILLETS', 'VEGETABLES', 'FRUITS'].includes(target)) return false;
        }
      }

      // 2. Specific Produce Name filter
      if (selectedProduce !== 'all') {
        if (name.toLowerCase() !== selectedProduce.toLowerCase()) {
          const pLower = selectedProduce.toLowerCase();
          if (!name.toLowerCase().includes(pLower) && !nameKn.includes(pLower)) {
            return false;
          }
        }
      }

      // 3. Search query filter (matches English name, Kannada name, variety, or farmer name)
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const farmerObj = farmersMap[(l.farmer_id || '').toLowerCase()];
        const farmerName = (farmerObj?.name || l.farmer_id || '').toLowerCase();

        const matchName = name.toLowerCase().includes(query);
        const matchKn = nameKn.toLowerCase().includes(query);
        const matchVar = variety.toLowerCase().includes(query);
        const matchFarmer = farmerName.includes(query);

        if (!matchName && !matchKn && !matchVar && !matchFarmer) {
          return false;
        }
      }

      // 4. District filter
      if (selectedDistrict !== 'all') {
        const d = (l.district || farmersMap[(l.farmer_id || '').toLowerCase()]?.district || '').trim().toLowerCase();
        if (d !== selectedDistrict.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [listings, selectedCategory, search, selectedDistrict, selectedProduce, farmersMap]);

  const hasActiveFilters =
    selectedCategory !== 'all' || search.trim() !== '' || selectedDistrict !== 'all' || selectedProduce !== 'all';

  function handleClearFilters() {
    setSelectedCategory('all');
    setSearch('');
    setSelectedDistrict('all');
    setSelectedProduce('all');
  }

  function changeQty(id: string | number, delta: number, maxKg: number) {
    setQuantities((prev) => {
      const current = prev[id] || (maxKg > 0 ? Math.min(5, maxKg) : 1);
      const step = 5;
      let next: number;
      if (delta > 0) {
        next = Math.min(maxKg, current + (current % step === 0 ? step : step - (current % step)));
        if (next === current && current < maxKg) next = maxKg;
      } else {
        next = Math.max(1, current - (current % step === 0 ? step : current % step));
      }
      return { ...prev, [id]: next };
    });
  }

  function addToCart(listing: ProduceListing) {
    const qty = quantities[listing.id] || (listing.quantity_kg > 0 ? Math.min(5, listing.quantity_kg) : 1);
    const cart = getCart();
    const existing = cart.find((c) => c.listing.id === listing.id);
    if (existing) {
      existing.qty = Math.min(listing.quantity_kg, existing.qty + qty);
    } else {
      cart.push({ listing, qty });
    }
    setCartCount(cart.length);
    setAddedId(listing.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <div className="agro-marketplace">
      {/* ── 1. Compact Marketplace Header ── */}
      <header className="agro-market-header" role="banner">
        {/* Brand identity */}
        <Link to="/buyer/buy" className="agro-market-brand" title="Agro Trades Marketplace">
          <div className="agro-market-brand-icon">
            <Sprout size={20} />
          </div>
          <div className="agro-market-brand-text">
            <h1>Agro Trades</h1>
            <span>Produce Marketplace</span>
          </div>
        </Link>

        {/* Prominent Search bar */}
        <div className="agro-market-search" role="search">
          <Search size={18} className="agro-market-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="agro-market-search-input"
            placeholder="Search produce (e.g. Ragi, ರಾಗಿ, Tomato, Tur Dal)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search produce"
          />
          {search && (
            <button
              type="button"
              className="agro-market-search-clear"
              onClick={() => setSearch('')}
              title="Clear search"
              aria-label="Clear search input"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Shopping Actions: My Orders, Cart, Account */}
        <div className="agro-market-actions">
          <Link to="/buyer/orders" className="agro-market-action-link" title="View my orders">
            <ClipboardList size={18} aria-hidden="true" />
            <span>My Orders</span>
          </Link>

          <Link to="/buyer/cart" className="agro-market-action-link" title="View shopping cart">
            <ShoppingCart size={18} aria-hidden="true" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="agro-market-cart-badge" aria-label={`${cartCount} items in cart`}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account Menu */}
          <div className="agro-market-account-wrap" ref={accountMenuRef}>
            <button
              type="button"
              className="agro-market-account-btn"
              onClick={() => setAccountOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={accountOpen}
              aria-label="Account menu"
            >
              <div className="agro-market-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name ? user.name.split(' ')[0] : 'Account'}
              </span>
              <ChevronDown size={14} style={{ transform: accountOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }} />
            </button>

            {accountOpen && (
              <div className="agro-market-account-menu" role="menu">
                <div className="agro-market-menu-userinfo">
                  <div className="agro-market-menu-name">{user?.name || 'Buyer User'}</div>
                  <div className="agro-market-menu-email">{user?.email || ''}</div>
                </div>

                <Link
                  to="/buyer/profile"
                  className="agro-market-menu-item"
                  role="menuitem"
                  onClick={() => setAccountOpen(false)}
                >
                  <User size={15} />
                  <span>Customer Profile</span>
                </Link>

                <button
                  type="button"
                  className="agro-market-menu-item logout"
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Category Navigation Tabs (All 8 Produce Categories) ── */}
      <nav className="agro-market-categories" aria-label="Produce Categories">
        {CATEGORY_ITEMS.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`agro-market-cat-tab ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedProduce('all');
              }}
              aria-pressed={isActive}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 400 }}>
                {cat.labelKn}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Offline Notice Banner */}
      {isUsingCache && (
        <div className="agro-market-cache-banner" role="status">
          <div className="agro-market-cache-banner-content">
            <WifiOff size={16} />
            <span>Showing cached produce catalog. Live server connection could not be established.</span>
          </div>
          <button
            type="button"
            className="agro-market-cache-reconnect-btn"
            onClick={() => fetchData(true)}
            disabled={retrying}
          >
            <RefreshCw size={12} className={retrying ? 'animate-spin' : ''} />
            <span>{retrying ? 'Reconnecting...' : 'Reconnect'}</span>
          </button>
        </div>
      )}

      {/* ── 3. Filters & Results Bar ── */}
      <div className="agro-market-toolbar">
        <div className="agro-market-result-count">
          Showing <strong>{filteredListings.length}</strong> of <strong>{listings.length}</strong> produce listings
        </div>

        <div className="agro-market-filter-controls">
          {/* Produce Filter Dropdown */}
          <div className="agro-market-district-wrap">
            <Wheat size={15} className="agro-market-district-icon" aria-hidden="true" />
            <select
              className="agro-market-district-select"
              value={selectedProduce}
              onChange={(e) => setSelectedProduce(e.target.value)}
              aria-label="Filter by produce"
              style={{ minWidth: 170 }}
            >
              <option value="all">All Produce Types</option>
              {PRODUCE_CATEGORIES.map((cat) => (
                <optgroup key={cat.id} label={`${cat.label} — ${cat.labelKn}`}>
                  {cat.items.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name} ({item.nameKn})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* District Filter Dropdown */}
          <div className="agro-market-district-wrap">
            <MapPin size={15} className="agro-market-district-icon" aria-hidden="true" />
            <select
              className="agro-market-district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              aria-label="Filter by district"
            >
              <option value="all">All Karnataka Districts {availableDistricts.length > 0 ? `(${availableDistricts.length})` : ''}</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="agro-market-clear-btn"
              onClick={handleClearFilters}
              title="Reset all search, category, and district filters"
            >
              <RotateCcw size={13} />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Main Content Area ── */}
      {loading ? (
        <div className="agro-market-grid" aria-busy="true" aria-label="Loading produce listings">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="agro-skeleton-card">
              <div className="agro-skeleton-img" />
              <div className="agro-skeleton-body">
                <div className="agro-skeleton-line" style={{ width: '70%', height: 16 }} />
                <div className="agro-skeleton-line" style={{ width: '45%', height: 12 }} />
                <div className="agro-skeleton-line" style={{ width: '35%', height: 20, marginTop: '1rem' }} />
                <div className="agro-skeleton-line" style={{ width: '100%', height: 36, marginTop: '0.8rem' }} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="agro-market-notice" role="alert">
          <AlertCircle size={44} className="agro-notice-icon" style={{ color: '#ef4444' }} />
          <h2 className="agro-notice-title">Failed to load marketplace</h2>
          <p className="agro-notice-desc">{error}</p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="agro-btn-retry"
              onClick={() => fetchData(true)}
              disabled={retrying}
            >
              <RotateCcw size={15} className={retrying ? 'animate-spin' : ''} />
              <span>{retrying ? 'Retrying...' : 'Retry Loading'}</span>
            </button>
          </div>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="agro-market-notice">
          <Package size={44} className="agro-notice-icon" />
          <h2 className="agro-notice-title">No produce matches your filters</h2>
          <p className="agro-notice-desc">
            We couldn't find any produce matching your current search, category, or district filter.
          </p>
          {hasActiveFilters && (
            <button type="button" className="agro-btn-retry" onClick={handleClearFilters}>
              <RotateCcw size={15} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      ) : (
        <main className="agro-market-grid" aria-label="Produce Listings">
          {filteredListings.map((listing) => {
            const { name, nameKn, variety, catId } = getProduceDetails(listing);
            const catMeta = getCategoryById(catId);
            const qty = quantities[listing.id] || (listing.quantity_kg > 0 ? Math.min(5, listing.quantity_kg) : 1);
            const subtotal = qty * listing.price_per_kg;

            const farmerEmailKey = (listing.farmer_id || '').toLowerCase();
            const farmer = farmersMap[farmerEmailKey];
            const farmerName = farmer?.name || listing.farmer_id;
            const district = listing.district || farmer?.district;
            const village = farmer?.village;

            const imgRes = resolveProduceImage({
              name,
              category: catId,
              imageUrl: listing.image_url,
            });

            const isAdded = addedId === listing.id;

            return (
              <article key={listing.id} className="agro-product-card">
                {/* Produce Photo */}
                <div className="agro-card-image-wrap">
                  <img
                    src={imgRes.url}
                    alt={name}
                    loading="lazy"
                    onError={handleImageError}
                    className="agro-card-img"
                  />

                  {/* Category badge */}
                  <span
                    className="agro-badge-category"
                    style={{
                      background: catMeta ? catMeta.bg : '#f1f5f9',
                      color: catMeta ? catMeta.color : '#334155',
                      border: `1px solid ${catMeta ? catMeta.border : '#e2e8f0'}`,
                    }}
                  >
                    {catMeta?.label || catId}
                  </span>

                  {/* Stock badge */}
                  <span className={`agro-badge-stock ${listing.quantity_kg > 50 ? 'in-stock' : 'low-stock'}`}>
                    {listing.quantity_kg} kg available
                  </span>

                  {/* Produce photo verification badge */}
                  {imgRes.isAiGenerated ? (
                    <span className="agro-badge-photo-source" style={{ background: 'rgba(79, 70, 229, 0.9)', color: '#ffffff' }}>
                      AI Generated Photo
                    </span>
                  ) : imgRes.isSellerProvided ? (
                    <span className="agro-badge-photo-source seller">
                      Seller photo
                    </span>
                  ) : (
                    <span className="agro-badge-photo-source placeholder">
                      No photo uploaded
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="agro-card-body">
                  <header className="agro-card-header">
                    <h2 className="agro-card-title" title={name}>
                      {name}
                    </h2>
                    {nameKn && (
                      <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                        {nameKn}
                      </div>
                    )}
                    <div className="agro-card-meta">
                      {variety && (
                        <span className="agro-card-variety">
                          {variety}
                        </span>
                      )}
                    </div>
                  </header>

                  {/* Seller name */}
                  <div className="agro-card-seller" title={farmerName}>
                    <span>Farmer:</span>
                    <strong>{farmerName}</strong>
                  </div>

                  {/* Location if provided */}
                  {district ? (
                    <div className="agro-card-location">
                      <MapPin size={12} aria-hidden="true" />
                      <span>{village ? `${village}, ${district}` : district}</span>
                    </div>
                  ) : null}

                  {/* Price Row */}
                  <div className="agro-card-price-row">
                    <div>
                      <span className="agro-card-price">₹{listing.price_per_kg}</span>
                      <span className="agro-card-price-unit">/kg</span>
                    </div>
                    <span className="agro-card-stock-label">
                      Stock: {listing.quantity_kg} kg
                    </span>
                  </div>

                  {/* Quantity selector (+/-) */}
                  <div className="agro-qty-selector">
                    <button
                      type="button"
                      className="agro-qty-btn"
                      onClick={() => changeQty(listing.id, -1, listing.quantity_kg)}
                      disabled={qty <= 1}
                      title="Decrease quantity"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="agro-qty-display">
                      {qty} <span>kg</span>
                    </div>
                    <button
                      type="button"
                      className="agro-qty-btn"
                      onClick={() => changeQty(listing.id, 1, listing.quantity_kg)}
                      disabled={qty >= listing.quantity_kg}
                      title="Increase quantity"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal calculation */}
                  <div className="agro-card-subtotal">
                    Subtotal: <strong>₹{subtotal.toLocaleString()}</strong>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    type="button"
                    className={`agro-btn-add ${isAdded ? 'added' : ''}`}
                    onClick={() => addToCart(listing)}
                    disabled={isAdded}
                    aria-label={isAdded ? 'Added to cart' : `Add ${qty} kg of ${name} to cart`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} />
                        <span>✓ Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </main>
      )}
    </div>
  );
}
