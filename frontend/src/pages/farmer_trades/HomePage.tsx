import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Truck,
  Heart,
  Eye,
  CheckCircle,
  Users,
  Building2,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  ShoppingBag,
  PlusCircle,
  BookOpen,
  BarChart3
} from 'lucide-react';
import {
  CROPS_ENCYCLOPEDIA,
  FARMERS_DIRECTORY,
  ProduceListingItem
} from '../../data/farmerTradesData';
import {
  getAllProduceListings,
  isFavorite,
  toggleFavorite
} from '../../utils/farmerTradesStore';
import { ProduceDetailModal } from '../../components/farmer_trades/ProduceDetailModal';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduce, setSelectedProduce] = useState<ProduceListingItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [favRefresh, setFavRefresh] = useState(0);

  const listings = getAllProduceListings();

  // Search autocomplete / suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matchesCrops = CROPS_ENCYCLOPEDIA.filter(
      (c) => c.name.toLowerCase().includes(q) || c.scientificName.toLowerCase().includes(q)
    ).map((c) => ({ type: 'crop', title: c.name, sub: c.category, id: c.id, link: `/crops?highlight=${c.id}` }));

    const matchesListings = listings
      .filter((l) => l.title.toLowerCase().includes(q) || l.district.toLowerCase().includes(q))
      .slice(0, 4)
      .map((l) => ({ type: 'listing', title: l.title, sub: `₹${l.pricePerQuintal}/qtl • ${l.district}`, id: l.id, link: `/buy?search=${encodeURIComponent(l.title)}` }));

    return [...matchesCrops, ...matchesListings].slice(0, 6);
  }, [searchQuery, listings]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buy?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleOpenDetail = (item: ProduceListingItem) => {
    setSelectedProduce(item);
    setIsDetailOpen(true);
  };

  const handleFavToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFavorite('listings', id);
    setFavRefresh((prev) => prev + 1);
  };

  return (
    <div className="ft-homepage">
      {/* ── HERO SECTION ── */}
      <section className="ft-hero-section">
        <div className="ft-hero-backdrop"></div>
        <div className="ft-hero-container">
          <div className="ft-hero-badge">
            <Sparkles size={16} className="text-amber-400" />
            <span>DIRECT FARMER-TO-BUYER COMMERCE • APMC INTEGRATED</span>
          </div>

          <h1 className="ft-hero-title">
            India’s Crops. Prices. Knowledge.<br />
            <span className="ft-hero-title-gradient">All in One Place.</span>
          </h1>

          <p className="ft-hero-subtitle">
            Trade farm-fresh grains, pulses, oilseeds, and vegetables directly at fair market prices.
            Access real-time APMC Mandi price intelligence, scientific crop agronomy, and guaranteed delivery.
          </p>

          {/* Search bar with live suggestions */}
          <div className="ft-hero-search-wrapper">
            <form onSubmit={handleSearchSubmit} className="ft-hero-search-form">
              <Search className="ft-search-icon" size={22} />
              <input
                type="text"
                className="ft-hero-search-input"
                placeholder="Search crops, varieties, or mandis (e.g. Organic Ragi, Sharbati Wheat, Mandya...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="ft-hero-search-btn">
                Search Market
              </button>
            </form>

            {/* Suggestions dropdown */}
            {searchSuggestions.length > 0 && (
              <div className="ft-search-suggestions-box">
                {searchSuggestions.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.link}
                    className="ft-suggestion-item"
                    onClick={() => setSearchQuery('')}
                  >
                    <span className="ft-suggestion-type">{item.type.toUpperCase()}</span>
                    <span className="ft-suggestion-title">{item.title}</span>
                    <span className="ft-suggestion-sub">{item.sub}</span>
                    <ArrowRight size={14} className="ft-suggestion-arrow" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 4 Primary Action Buttons */}
          <div className="ft-hero-actions-grid">
            <Link to="/buy" className="ft-action-card ft-action-card-buy">
              <div className="ft-action-icon-wrap ft-icon-buy">
                <ShoppingBag size={24} />
              </div>
              <div className="ft-action-text">
                <h3>Buy Produce</h3>
                <p>Browse verified farm lots with live ₹/quintal pricing</p>
              </div>
              <ChevronRight size={18} className="ft-action-chevron" />
            </Link>

            <Link to="/sell" className="ft-action-card ft-action-card-sell">
              <div className="ft-action-icon-wrap ft-icon-sell">
                <PlusCircle size={24} />
              </div>
              <div className="ft-action-text">
                <h3>Sell Your Crop</h3>
                <p>Post your harvest in 2 mins & receive direct quotes</p>
              </div>
              <ChevronRight size={18} className="ft-action-chevron" />
            </Link>

            <Link to="/crops" className="ft-action-card ft-action-card-crops">
              <div className="ft-action-icon-wrap ft-icon-crops">
                <BookOpen size={24} />
              </div>
              <div className="ft-action-text">
                <h3>Explore Crops</h3>
                <p>Encyclopedia with agronomy, MSP & seasonal advisory</p>
              </div>
              <ChevronRight size={18} className="ft-action-chevron" />
            </Link>

            <Link to="/market-prices" className="ft-action-card ft-action-card-prices">
              <div className="ft-action-icon-wrap ft-icon-prices">
                <BarChart3 size={24} />
              </div>
              <div className="ft-action-text">
                <h3>View Market Prices</h3>
                <p>Interactive multi-crop line charts & mandi analytics</p>
              </div>
              <ChevronRight size={18} className="ft-action-chevron" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── MARKET PRICE TICKER ── */}
      <section className="ft-ticker-section">
        <div className="ft-ticker-container">
          <div className="ft-ticker-label">
            <TrendingUp size={16} />
            <span>MANDI LIVE BENCHMARKS (₹/QTL)</span>
          </div>
          <div className="ft-ticker-items">
            <div className="ft-ticker-item">
              <span className="ft-ticker-crop">Ragi (Finger Millet)</span>
              <span className="ft-ticker-price">₹4,350</span>
              <span className="ft-ticker-change positive">+3.8%</span>
            </div>
            <div className="ft-ticker-item">
              <span className="ft-ticker-crop">Sharbati Wheat</span>
              <span className="ft-ticker-price">₹3,400</span>
              <span className="ft-ticker-change positive">+1.5%</span>
            </div>
            <div className="ft-ticker-item">
              <span className="ft-ticker-crop">Sona Masoori Paddy</span>
              <span className="ft-ticker-price">₹2,820</span>
              <span className="ft-ticker-change positive">+2.1%</span>
            </div>
            <div className="ft-ticker-item">
              <span className="ft-ticker-crop">Long Staple Cotton</span>
              <span className="ft-ticker-price">₹7,450</span>
              <span className="ft-ticker-change negative">-0.6%</span>
            </div>
            <div className="ft-ticker-item">
              <span className="ft-ticker-crop">Guntur Red Chilli</span>
              <span className="ft-ticker-price">₹19,200</span>
              <span className="ft-ticker-change positive">+4.2%</span>
            </div>
          </div>
          <Link to="/market-prices" className="ft-ticker-link">
            Full Chart Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── POPULAR CROP CATEGORIES ── */}
      <section className="ft-categories-section">
        <div className="ft-section-container">
          <div className="ft-section-header">
            <div>
              <span className="ft-subhead">EXPLORE BY COMMODITY</span>
              <h2 className="ft-section-heading">Browse India’s Agricultural Produce</h2>
            </div>
            <Link to="/crops" className="ft-view-all-link">
              View All 10+ Crops <ArrowRight size={16} />
            </Link>
          </div>

          <div className="ft-category-grid">
            {CROPS_ENCYCLOPEDIA.slice(0, 6).map((crop) => (
              <Link to={`/buy?category=${encodeURIComponent(crop.category)}`} key={crop.id} className="ft-cat-card">
                <div className="ft-cat-img-wrap">
                  <img src={crop.imageUrl} alt={crop.name} />
                  <span className="ft-cat-tag">{crop.season}</span>
                </div>
                <div className="ft-cat-content">
                  <h4>{crop.name}</h4>
                  <p className="ft-cat-sciname">{crop.scientificName}</p>
                  <div className="ft-cat-meta">
                    <span>MSP: ₹{crop.benchmarkPricePerQuintal}/qtl</span>
                    <span className="ft-cat-arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCE LISTINGS ── */}
      <section className="ft-featured-produce-section">
        <div className="ft-section-container">
          <div className="ft-section-header">
            <div>
              <span className="ft-subhead">VERIFIED FARM LOTS</span>
              <h2 className="ft-section-heading">Featured Produce Ready for Immediate Dispatch</h2>
            </div>
            <Link to="/buy" className="ft-view-all-link">
              Browse All Listings ({listings.length}) <ArrowRight size={16} />
            </Link>
          </div>

          <div className="ft-produce-grid">
            {listings.slice(0, 4).map((item) => {
              const fav = isFavorite('listings', item.id);
              return (
                <div key={item.id} className="ft-product-card" onClick={() => handleOpenDetail(item)}>
                  <div className="ft-product-img-container">
                    <img src={item.imageUrl} alt={item.title} />
                    <button
                      className={`ft-card-fav-btn ${fav ? 'active' : ''}`}
                      onClick={(e) => handleFavToggle(e, item.id)}
                      title={fav ? 'Favorited' : 'Save'}
                    >
                      <Heart size={16} fill={fav ? '#DC2626' : 'none'} color={fav ? '#DC2626' : '#FFFFFF'} />
                    </button>
                    <div className="ft-product-badges">
                      <span className="ft-badge-grade">Grade {item.grade}</span>
                      {item.organic && <span className="ft-badge-org">100% Organic</span>}
                    </div>
                  </div>

                  <div className="ft-product-info">
                    <div className="ft-card-location">
                      <MapPin size={13} />
                      <span>{item.mandiName}, {item.state}</span>
                    </div>

                    <h3 className="ft-card-title">{item.title}</h3>
                    <p className="ft-card-variety">Variety: {item.variety}</p>

                    <div className="ft-card-pricing-row">
                      <div className="ft-card-price">
                        ₹{item.pricePerQuintal.toLocaleString('en-IN')}
                        <span className="ft-card-unit"> / qtl</span>
                      </div>
                      <div className="ft-card-stock">
                        Stock: <strong>{item.quantityAvailableQuintals} Qtl</strong>
                      </div>
                    </div>

                    <div className="ft-card-farmer-row">
                      <div className="ft-farmer-mini">
                        <div className="ft-farmer-mini-avatar">{item.farmerName[0]}</div>
                        <span className="ft-farmer-mini-name">{item.farmerName}</span>
                        {item.verifiedFarmer && <ShieldCheck size={14} className="text-emerald-600" />}
                      </div>
                      <span className="ft-harvest-date">📅 {item.harvestDate}</span>
                    </div>

                    <div className="ft-card-actions">
                      <button
                        className="ft-btn-view"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(item);
                        }}
                      >
                        <Eye size={15} /> Details
                      </button>
                      <button
                        className="ft-btn-offer"
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
        </div>
      </section>

      {/* ── FEATURED FARMERS DIRECTORY ── */}
      <section className="ft-farmers-spotlight-section">
        <div className="ft-section-container">
          <div className="ft-section-header">
            <div>
              <span className="ft-subhead">TRUSTED PRODUCERS</span>
              <h2 className="ft-section-heading">Verified Farmers Specializing in Quality Harvests</h2>
            </div>
            <Link to="/farmers" className="ft-view-all-link">
              View Farmer Directory ({FARMERS_DIRECTORY.length}) <ArrowRight size={16} />
            </Link>
          </div>

          <div className="ft-farmers-grid">
            {FARMERS_DIRECTORY.slice(0, 3).map((f) => (
              <div key={f.id} className="ft-farmer-card">
                <div className="ft-farmer-header">
                  <img src={f.avatarUrl} alt={f.name} className="ft-farmer-pic" />
                  <div>
                    <h3 className="ft-farmer-fullname">
                      {f.name}
                      {f.verified && <ShieldCheck size={16} className="text-emerald-600 inline ml-1" />}
                    </h3>
                    <p className="ft-farmer-loc">
                      <MapPin size={13} className="inline mr-1 text-emerald-700" />
                      {f.village}, {f.district}, {f.state}
                    </p>
                    <div className="ft-farmer-exp">
                      <span>Land: <strong>{f.landAcreage} Acres</strong></span>
                      <span>•</span>
                      <span>⭐ {f.rating} ({f.totalDealsCompleted} Deals)</span>
                    </div>
                  </div>
                </div>

                <p className="ft-farmer-bio">{f.bio}</p>

                <div className="ft-farmer-crops-chips">
                  {f.specialties.map((spec, i) => (
                    <span key={i} className="ft-crop-chip">{spec}</span>
                  ))}
                </div>

                <div className="ft-farmer-card-footer">
                  <span className="ft-active-lots-count">🌱 {f.activeListingsCount} Active Farm Lots</span>
                  <Link to={`/buy?district=${encodeURIComponent(f.district)}`} className="ft-farmer-view-lots">
                    View Produce <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW FARMER TRADES WORKS ── */}
      <section className="ft-workflow-section">
        <div className="ft-section-container">
          <div className="ft-workflow-header">
            <span className="ft-subhead">SEAMLESS AGRICULTURAL COMMERCE</span>
            <h2 className="ft-section-heading">How Farmer Trades Empowers Producers & Buyers</h2>
          </div>

          <div className="ft-workflow-steps">
            <div className="ft-step-card">
              <div className="ft-step-number">01</div>
              <div className="ft-step-icon">
                <Layers size={28} />
              </div>
              <h3>List or Discover Produce</h3>
              <p>
                Farmers post harvest lots with crop grade, moisture %, photo proofs, and asking ₹/quintal.
                Buyers search lots with precise filters.
              </p>
            </div>

            <div className="ft-step-card">
              <div className="ft-step-number">02</div>
              <div className="ft-step-icon">
                <TrendingUp size={28} />
              </div>
              <h3>Direct Price Negotiation</h3>
              <p>
                Buyers place binding purchase proposals without broker commissions.
                Farmers accept, reject, or counter directly via phone & digital portal.
              </p>
            </div>

            <div className="ft-step-card">
              <div className="ft-step-number">03</div>
              <div className="ft-step-icon">
                <Truck size={28} />
              </div>
              <h3>Mandi Weighment & Escrow</h3>
              <p>
                Produce is weighed at the designated APMC weighbridge. Payments are released safely
                directly to the farmer’s bank account upon receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST & METRICS BANNER ── */}
      <section className="ft-metrics-banner">
        <div className="ft-section-container ft-metrics-inner">
          <div className="ft-metric-box">
            <div className="ft-metric-num">12,500+</div>
            <div className="ft-metric-text">Verified Indian Farmers</div>
          </div>
          <div className="ft-metric-divider"></div>
          <div className="ft-metric-box">
            <div className="ft-metric-num">160+</div>
            <div className="ft-metric-text">APMC Mandis Covered</div>
          </div>
          <div className="ft-metric-divider"></div>
          <div className="ft-metric-box">
            <div className="ft-metric-num">₹68 Cr+</div>
            <div className="ft-metric-text">Gross Agricultural Volume</div>
          </div>
          <div className="ft-metric-divider"></div>
          <div className="ft-metric-box">
            <div className="ft-metric-num">100%</div>
            <div className="ft-metric-text">Transparent Direct Pricing</div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ── */}
      <section className="ft-cta-section">
        <div className="ft-section-container ft-cta-box">
          <div className="ft-cta-content">
            <h2>Ready to Trade Directly from Farmgate?</h2>
            <p>
              Join thousands of agricultural producers and food buyers saving up to 15% on middlemen commissions.
            </p>
            <div className="ft-cta-buttons">
              <Link to="/sell" className="ft-btn-cta-sell">
                Post Produce Lot for Free
              </Link>
              <Link to="/buy" className="ft-btn-cta-buy">
                Explore All Produce
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Produce Detail Modal */}
      <ProduceDetailModal
        produce={selectedProduce}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};
