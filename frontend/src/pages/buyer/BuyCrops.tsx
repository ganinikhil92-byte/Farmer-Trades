import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Listing, getCart } from './cartStore';
import { resolveProduceImage, handleImageError } from '../../utils/producePhoto';
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
  Salad,
  Apple,
  Layers,
  AlertCircle,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import './BuyCrops.css';

const CACHE_LISTINGS_KEY = 'agro_cached_produce_listings';
const CACHE_FARMERS_KEY = 'agro_cached_farmers_map';

export type { Listing };

export interface ProduceListing extends Listing {
  district?: string;
}

type ProduceCategory = 'all' | 'crop' | 'vegetable' | 'fruit';

interface FarmerMeta {
  name: string;
  district?: string;
  taluk?: string;
  village?: string;
}

const CATEGORIES: { id: ProduceCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Produce', icon: <Layers size={16} /> },
  { id: 'crop', label: 'Crops', icon: <Wheat size={16} /> },
  { id: 'vegetable', label: 'Vegetables', icon: <Salad size={16} /> },
  { id: 'fruit', label: 'Fruits', icon: <Apple size={16} /> },
];

export default function BuyCrops() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [farmersMap, setFarmersMap] = useState<Record<string, FarmerMeta>>({});
  const [selectedCategory, setSelectedCategory] = useState<ProduceCategory>('all');
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
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

  // Fetch produce listings and farmer metadata with cache fallback and auto-retry
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
            fMap[f.email] = {
              name: f.name || f.email,
              district: f.district || undefined,
              taluk: f.taluk || undefined,
              village: f.village || undefined,
            };
          }
        });
      }
      setFarmersMap(fMap);

      // Deduplicate listings by stable id
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
      } catch (storageErr) {
        // Ignore localStorage quota or disabled errors
      }
    } catch (err: any) {
      console.warn(`Marketplace fetch attempt ${attempt} failed:`, err);
      // Auto-retry once after 1.5s if initial attempt failed
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
          const cachedListings: ProduceListing[] = JSON.parse(cachedListingsStr);
          if (Array.isArray(cachedListings) && cachedListings.length > 0) {
            const initialQty: Record<string | number, number> = {};
            cachedListings.forEach((l) => {
              if (l && l.id != null) {
                const maxAvail = Number(l.quantity_kg) || 0;
                initialQty[l.id] = maxAvail > 0 ? Math.min(5, Math.max(1, maxAvail)) : 1;
              }
            });
            setListings(cachedListings);
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
      } catch (cacheErr) {
        console.error('Failed reading marketplace cache:', cacheErr);
      }

      setError(
        'Unable to load produce listings. Please ensure the backend server is running on port 8000 and check your connection.'
      );
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync cart count with external changes
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
      const d = l.district || farmersMap[l.farmer_id]?.district;
      if (d && typeof d === 'string' && d.trim()) {
        districts.add(d.trim());
      }
    });
    return Array.from(districts).sort();
  }, [listings, farmersMap]);

  // Filtered listings
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (!l) return false;
      // Must be in stock
      if (Number(l.quantity_kg) <= 0) return false;

      // Category filter
      if (selectedCategory !== 'all' && l.category !== selectedCategory) {
        return false;
      }

      // Search query filter (crop_name, crop_type, or farmer name)
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const nameMatch = (l.crop_name || '').toLowerCase().includes(query);
        const typeMatch = (l.crop_type || '').toLowerCase().includes(query);
        const farmerName = (farmersMap[l.farmer_id]?.name || l.farmer_id || '').toLowerCase();
        const farmerMatch = farmerName.includes(query);
        if (!nameMatch && !typeMatch && !farmerMatch) return false;
      }

      // District filter
      if (selectedDistrict !== 'all') {
        const d = (l.district || farmersMap[l.farmer_id]?.district || '').trim().toLowerCase();
        if (d !== selectedDistrict.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [listings, selectedCategory, search, selectedDistrict, farmersMap]);

  const hasActiveFilters = selectedCategory !== 'all' || search.trim() !== '' || selectedDistrict !== 'all';

  function handleClearFilters() {
    setSelectedCategory('all');
    setSearch('');
    setSelectedDistrict('all');
  }

  function changeQty(id: string | number, delta: number, maxKg: number) {
    setQuantities((prev) => {
      const current = prev[id] || (maxKg > 0 ? Math.min(5, maxKg) : 1);
      const step = 5;
      let next: number;
      if (delta > 0) {
        // Increment by step (5) or up to maxKg
        next = Math.min(maxKg, current + (current % step === 0 ? step : step - (current % step)));
        if (next === current && current < maxKg) next = maxKg;
      } else {
        // Decrement by step (5) down to 1
        next = Math.max(1, current - (current % step === 0 ? step : current % step));
      }
      return { ...prev, [id]: next };
    });
  }

  function addToCart(listing: Listing) {
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
            <span>Direct Marketplace</span>
          </div>
        </Link>

        {/* Prominent Search bar */}
        <div className="agro-market-search" role="search">
          <Search size={18} className="agro-market-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="agro-market-search-input"
            placeholder="Search crops, vegetables and fruits"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search crops, vegetables and fruits"
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

      {/* ── 2. Category Navigation Tabs ── */}
      <nav className="agro-market-categories" aria-label="Produce Categories">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`agro-market-cat-tab ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={isActive}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Offline / Cached produce listings notice banner */}
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
          Showing <strong>{filteredListings.length}</strong> of <strong>{listings.length}</strong> produce items
        </div>

        <div className="agro-market-filter-controls">
          {/* District Filter Dropdown */}
          <div className="agro-market-district-wrap">
            <MapPin size={15} className="agro-market-district-icon" aria-hidden="true" />
            <select
              className="agro-market-district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              aria-label="Filter by district"
            >
              <option value="all">All Districts {availableDistricts.length > 0 ? `(${availableDistricts.length})` : ''}</option>
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

      {/* ── 4. Main Content Area: Loading, Error, Empty, or Product Grid ── */}
      {loading ? (
        /* Loading Skeletons */
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
        /* Error Notice with Retry */
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
        /* Empty State with Clear Filters */
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
        /* ── Product Grid ── */
        <main className="agro-market-grid" aria-label="Produce Listings">
          {filteredListings.map((listing) => {
            const qty = quantities[listing.id] || (listing.quantity_kg > 0 ? Math.min(5, listing.quantity_kg) : 1);
            const subtotal = qty * listing.price_per_kg;
            const farmer = farmersMap[listing.farmer_id];
            const farmerName = farmer?.name || listing.farmer_id;
            const district = listing.district || farmer?.district;
            const village = farmer?.village;

            const imgRes = resolveProduceImage({
              name: listing.crop_name,
              category: listing.category,
              imageUrl: listing.image_url,
            });

            const isAdded = addedId === listing.id;

            return (
              <article key={listing.id} className="agro-product-card">
                {/* Produce Photo */}
                <div className="agro-card-image-wrap">
                  <img
                    src={imgRes.url}
                    alt={listing.crop_name}
                    loading="lazy"
                    onError={handleImageError}
                    className="agro-card-img"
                  />

                  {/* Category badge */}
                  <span className="agro-badge-category">
                    {listing.category}
                  </span>

                  {/* Stock badge */}
                  <span className={`agro-badge-stock ${listing.quantity_kg > 50 ? 'in-stock' : 'low-stock'}`}>
                    {listing.quantity_kg} kg available
                  </span>

                  {/* Strict seller-photo verification badge */}
                  {imgRes.isSellerProvided ? (
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
                    <h2 className="agro-card-title" title={listing.crop_name}>
                      {listing.crop_name}
                    </h2>
                    <div className="agro-card-meta">
                      {listing.crop_type && (
                        <span className="agro-card-variety">
                          {listing.crop_type}
                        </span>
                      )}
                    </div>
                  </header>

                  {/* Seller name */}
                  <div className="agro-card-seller" title={farmerName}>
                    <span>by</span>
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
                    aria-label={isAdded ? 'Added to cart' : `Add ${qty} kg of ${listing.crop_name} to cart`}
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
