import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  Heart,
  Eye,
  MapPin,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Package,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ProduceListingItem,
  CROP_CATEGORIES,
  KARNATAKA_DISTRICTS
} from '../../data/farmerTradesData';
import {
  getAllProduceListings,
  isFavorite,
  toggleFavorite
} from '../../utils/farmerTradesStore';
import { ProduceDetailModal } from '../../components/farmer_trades/ProduceDetailModal';
import './BuyProducePage.css';

export const BuyProducePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialDistrict = searchParams.get('district') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [maxPrice, setMaxPrice] = useState(25000);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest' | 'quantity'>('newest');

  const [selectedProduce, setSelectedProduce] = useState<ProduceListingItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);

  const listings = getAllProduceListings();

  // Filtered and sorted listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesText =
          item.title.toLowerCase().includes(q) ||
          item.variety.toLowerCase().includes(q) ||
          item.mandiName.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          item.farmerName.toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      // Category
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // District
      if (selectedDistrict !== 'All' && item.district !== selectedDistrict) {
        return false;
      }

      // Organic
      if (organicOnly && !item.organic) {
        return false;
      }

      // Grade
      if (selectedGrade !== 'All' && item.grade !== selectedGrade) {
        return false;
      }

      // Max price
      if (item.pricePerQuintal > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerQuintal - b.pricePerQuintal;
      if (sortBy === 'price_desc') return b.pricePerQuintal - a.pricePerQuintal;
      if (sortBy === 'quantity') return b.quantityAvailableQuintals - a.quantityAvailableQuintals;
      // newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [listings, searchTerm, selectedCategory, selectedDistrict, organicOnly, selectedGrade, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedDistrict('All');
    setOrganicOnly(false);
    setSelectedGrade('All');
    setMaxPrice(25000);
    setSortBy('newest');
    setSearchParams({});
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFavorite('listings', id);
    setFavCount((c) => c + 1);
  };

  const handleOpenDetail = (item: ProduceListingItem) => {
    setSelectedProduce(item);
    setIsDetailOpen(true);
  };

  return (
    <div className="ft-buy-page">
      {/* Page Banner */}
      <div className="ft-buy-banner">
        <div className="ft-buy-banner-inner">
          <div className="ft-buy-badge">
            <Sparkles size={14} /> APMC & FARMGATE DIRECT LOTS
          </div>
          <h1>Verified Produce Marketplace</h1>
          <p>
            Connect directly with verified Indian farmers. Source clean, lab-inspected lots with transparent ₹/quintal pricing and APMC delivery options.
          </p>
        </div>
      </div>

      <div className="ft-buy-container">
        {/* Top Search & Filter Bar */}
        <div className="ft-search-toolbar">
          <div className="ft-search-box">
            <Search size={18} className="ft-search-ico" />
            <input
              type="text"
              placeholder="Search by crop, variety, farmer, or mandi (e.g. Mandya, Ragi, Sharbati)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="ft-clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>

          <div className="ft-toolbar-actions">
            <div className="ft-sort-wrap">
              <ArrowUpDown size={15} />
              <select value={sortBy} onChange={(e: any) => setSortBy(e.target.value)}>
                <option value="newest">Sort: Harvest Date (Newest)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="quantity">Quantity: Highest Available</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="ft-cat-pills-bar">
          <button
            className={`ft-cat-pill ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All Crops ({listings.length})
          </button>
          {CROP_CATEGORIES.map((cat) => {
            const count = listings.filter((l) => l.category === cat).length;
            return (
              <button
                key={cat}
                className={`ft-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Main Content Layout: Filters Sidebar + Grid */}
        <div className="ft-buy-main-layout">
          {/* Sidebar Filters */}
          <aside className="ft-filter-sidebar">
            <div className="ft-filter-sidebar-header">
              <div className="ft-filter-title">
                <SlidersHorizontal size={16} /> Filters
              </div>
              <button className="ft-reset-filters-btn" onClick={handleResetFilters}>
                Reset
              </button>
            </div>

            {/* District Filter */}
            <div className="ft-filter-group">
              <label>Mandi / District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="ft-filter-select"
              >
                <option value="All">All Districts</option>
                {KARNATAKA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Quality Grade Filter */}
            <div className="ft-filter-group">
              <label>Quality Grade</label>
              <div className="ft-grade-buttons">
                {['All', 'A', 'Premium', 'B'].map((g) => (
                  <button
                    key={g}
                    className={`ft-grade-btn ${selectedGrade === g ? 'active' : ''}`}
                    onClick={() => setSelectedGrade(g)}
                  >
                    {g === 'All' ? 'Any' : `Grade ${g}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div className="ft-filter-group">
              <div className="ft-slider-label-row">
                <label>Max Price / Quintal</label>
                <span className="ft-slider-val">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="ft-price-range-slider"
              />
              <div className="ft-slider-ticks">
                <span>₹1,000</span>
                <span>₹25,000</span>
              </div>
            </div>

            {/* Organic Toggle */}
            <div className="ft-filter-group ft-organic-toggle-row">
              <label className="ft-checkbox-label">
                <input
                  type="checkbox"
                  checked={organicOnly}
                  onChange={(e) => setOrganicOnly(e.target.checked)}
                />
                <span>🌿 100% Certified Organic Lots Only</span>
              </label>
            </div>

            {/* Quick Summary */}
            <div className="ft-sidebar-summary">
              <span>Showing <strong>{filteredListings.length}</strong> matching lots</span>
            </div>
          </aside>

          {/* Produce Lots Grid */}
          <main className="ft-produce-content">
            {filteredListings.length === 0 ? (
              <div className="ft-no-results">
                <Package size={48} className="text-gray-400 mb-3" />
                <h3>No produce lots found matching your criteria</h3>
                <p>Try clearing your price, district, or category filters to see more verified farm listings.</p>
                <button className="ft-reset-filters-btn ft-btn-large" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="ft-lots-grid">
                {filteredListings.map((item) => {
                  const fav = isFavorite('listings', item.id);
                  return (
                    <div
                      key={item.id}
                      className="ft-lot-card"
                      onClick={() => handleOpenDetail(item)}
                    >
                      <div className="ft-lot-img-wrap">
                        <img src={item.imageUrl} alt={item.title} />
                        <button
                          className={`ft-lot-fav-btn ${fav ? 'active' : ''}`}
                          onClick={(e) => handleToggleFavorite(e, item.id)}
                          title={fav ? 'Favorited' : 'Save'}
                        >
                          <Heart size={16} fill={fav ? '#DC2626' : 'none'} color={fav ? '#DC2626' : '#FFFFFF'} />
                        </button>
                        <div className="ft-lot-badge-row">
                          <span className="ft-badge-grade">Grade {item.grade}</span>
                          {item.organic && <span className="ft-badge-org">🌿 Organic</span>}
                        </div>
                      </div>

                      <div className="ft-lot-content">
                        <div className="ft-lot-location">
                          <MapPin size={12} />
                          <span>{item.mandiName}, {item.district}</span>
                        </div>

                        <h3 className="ft-lot-title">{item.title}</h3>
                        <p className="ft-lot-variety">Variety: {item.variety}</p>

                        <div className="ft-lot-price-box">
                          <div className="ft-lot-price">
                            ₹{item.pricePerQuintal.toLocaleString('en-IN')}
                            <span className="ft-lot-unit">/ qtl</span>
                          </div>
                          <div className="ft-lot-perkg">
                            ~₹{(item.pricePerQuintal / 100).toFixed(1)}/kg
                          </div>
                        </div>

                        <div className="ft-lot-metrics-grid">
                          <div>
                            <span className="ft-metric-lbl">Available Stock</span>
                            <span className="ft-metric-val">{item.quantityAvailableQuintals} Qtl</span>
                          </div>
                          <div>
                            <span className="ft-metric-lbl">Min. Order</span>
                            <span className="ft-metric-val">{item.minOrderQuintals} Qtl</span>
                          </div>
                        </div>

                        <div className="ft-lot-farmer-bar">
                          <div className="ft-farmer-micro">
                            <div className="ft-farmer-avatar-sm">{item.farmerName[0]}</div>
                            <span className="ft-farmer-name-sm">{item.farmerName}</span>
                            {item.verifiedFarmer && <ShieldCheck size={13} className="text-emerald-600" />}
                          </div>
                          <span className="ft-lot-date">📅 {item.harvestDate}</span>
                        </div>

                        <div className="ft-lot-actions">
                          <button
                            className="ft-btn-lot-details"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(item);
                            }}
                          >
                            <Eye size={14} /> Lot Specs
                          </button>
                          <button
                            className="ft-btn-lot-buy"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(item);
                            }}
                          >
                            Make Offer
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Produce Detail & Offer Modal */}
      <ProduceDetailModal
        produce={selectedProduce}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};
