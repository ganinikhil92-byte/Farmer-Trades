import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Calendar,
  CloudSun,
  Droplets,
  Layers,
  Sparkles,
  ArrowRight,
  Heart,
  X,
  ExternalLink,
  ShieldAlert,
  Sprout
} from 'lucide-react';
import {
  CROPS_ENCYCLOPEDIA,
  CROP_CATEGORIES,
  CropInfo
} from '../../data/farmerTradesData';
import {
  isFavorite,
  toggleFavorite,
  getAllProduceListings
} from '../../utils/farmerTradesStore';
import './AllCropsPage.css';

const SEASONS = ['All', 'Kharif', 'Rabi', 'Zaid', 'Year-round'];

export const AllCropsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState<CropInfo | null>(() => {
    if (highlightId) {
      return CROPS_ENCYCLOPEDIA.find((c) => c.id === highlightId) || null;
    }
    return null;
  });
  const [favCount, setFavCount] = useState(0);

  const listings = getAllProduceListings();

  const filteredCrops = useMemo(() => {
    return CROPS_ENCYCLOPEDIA.filter((c) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.scientificName.toLowerCase().includes(q) ||
          c.soilType.toLowerCase().includes(q) ||
          c.climate.toLowerCase().includes(q) ||
          c.varieties.some((v) => v.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedCategory !== 'All' && c.category !== selectedCategory) {
        return false;
      }

      if (selectedSeason !== 'All') {
        if (!c.season.toLowerCase().includes(selectedSeason.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [searchTerm, selectedCategory, selectedSeason]);

  const handleToggleCropFav = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFavorite('crops', id);
    setFavCount((c) => c + 1);
  };

  return (
    <div className="ft-crops-page">
      {/* Banner */}
      <div className="ft-crops-banner">
        <div className="ft-crops-banner-inner">
          <div className="ft-crops-badge">
            <BookOpen size={14} /> SCIENTIFIC AGRONOMY & ENCYCLOPEDIA
          </div>
          <h1>India's Crop Encyclopedia</h1>
          <p>
            Authoritative agronomic knowledge, MSP benchmarks, soil suitability, climate requirements, and high-yield varieties verified by ICAR and state agricultural universities.
          </p>
        </div>
      </div>

      <div className="ft-crops-container">
        {/* Search & Filter Toolbar */}
        <div className="ft-crops-toolbar">
          <div className="ft-crops-search">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by crop name, scientific name, or variety (e.g. Finger Millet, Eleusine, Red Soil)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="ft-clear-btn" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>

          <div className="ft-season-filters">
            <span className="ft-filter-tag-label">Season:</span>
            {SEASONS.map((s) => (
              <button
                key={s}
                className={`ft-season-btn ${selectedSeason === s ? 'active' : ''}`}
                onClick={() => setSelectedSeason(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="ft-crops-cat-pills">
          <button
            className={`ft-cat-pill ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All Categories ({CROPS_ENCYCLOPEDIA.length})
          </button>
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`ft-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Crop Encyclopedia Cards Grid */}
        <div className="ft-crops-grid">
          {filteredCrops.map((crop) => {
            const isFav = isFavorite('crops', crop.id);
            const activeLots = listings.filter((l) => l.cropName.toLowerCase().includes(crop.name.toLowerCase()));

            return (
              <div
                key={crop.id}
                className="ft-crop-card"
                onClick={() => setSelectedCrop(crop)}
              >
                <div className="ft-crop-card-img-wrap">
                  <img src={crop.imageUrl} alt={crop.name} />
                  <button
                    className={`ft-crop-fav-btn ${isFav ? 'active' : ''}`}
                    onClick={(e) => handleToggleCropFav(e, crop.id)}
                    title={isFav ? 'Saved' : 'Save Crop'}
                  >
                    <Heart size={16} fill={isFav ? '#DC2626' : 'none'} color={isFav ? '#DC2626' : '#FFFFFF'} />
                  </button>
                  <div className="ft-crop-card-badges">
                    <span className="ft-crop-season-badge">{crop.season}</span>
                    <span className="ft-crop-cat-badge">{crop.category}</span>
                  </div>
                </div>

                <div className="ft-crop-card-body">
                  <h3 className="ft-crop-card-name">{crop.name}</h3>
                  <p className="ft-crop-card-scientific">{crop.scientificName}</p>

                  <div className="ft-crop-msp-row">
                    <span className="ft-msp-lbl">Benchmark MSP</span>
                    <span className="ft-msp-val">₹{crop.benchmarkPricePerQuintal.toLocaleString('en-IN')} / qtl</span>
                  </div>

                  <div className="ft-crop-agronomy-preview">
                    <div className="ft-agro-mini-item">
                      <span className="text-gray-500 text-xs">Soil:</span>
                      <strong className="text-xs truncate">{crop.soilType}</strong>
                    </div>
                    <div className="ft-agro-mini-item">
                      <span className="text-gray-500 text-xs">Yield:</span>
                      <strong className="text-xs">{crop.yieldPerAcre}</strong>
                    </div>
                  </div>

                  <p className="ft-crop-card-desc">{crop.description.slice(0, 110)}...</p>

                  <div className="ft-crop-card-footer">
                    <span className="ft-crop-active-lots">
                      🌱 {activeLots.length} Active Market Lots
                    </span>
                    <button
                      className="ft-btn-read-agronomy"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCrop(crop);
                      }}
                    >
                      Agronomy Guide <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Crop Agronomy Detail Modal */}
      {selectedCrop && (
        <div className="ft-modal-overlay" onClick={() => setSelectedCrop(null)}>
          <div className="ft-modal-container ft-crop-modal-wrap" onClick={(e) => e.stopPropagation()}>
            <div className="ft-modal-header">
              <div className="ft-modal-header-badges">
                <span className="ft-badge-category">{selectedCrop.category}</span>
                <span className="ft-badge-grade">{selectedCrop.season} Season</span>
              </div>
              <button className="ft-close-btn" onClick={() => setSelectedCrop(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="ft-crop-modal-body">
              <div className="ft-crop-modal-hero">
                <img src={selectedCrop.imageUrl} alt={selectedCrop.name} />
                <div className="ft-crop-hero-info">
                  <h2>{selectedCrop.name}</h2>
                  <p className="ft-crop-sciname-lg">Scientific: <em>{selectedCrop.scientificName}</em></p>
                  <div className="ft-crop-hero-msp">
                    <div>
                      <span>Benchmark MSP / Modal APMC:</span>
                      <strong className="text-emerald-700 font-bold ml-2">₹{selectedCrop.benchmarkPricePerQuintal.toLocaleString('en-IN')} / quintal</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ft-crop-agronomy-sections">
                <div className="ft-agro-section">
                  <h3>Agronomic Overview</h3>
                  <p>{selectedCrop.description}</p>
                </div>

                <div className="ft-agro-grid-specs">
                  <div className="ft-agro-spec-card">
                    <Layers size={18} className="text-amber-600 mb-1" />
                    <span className="ft-agro-lbl">Recommended Soil</span>
                    <span className="ft-agro-val">{selectedCrop.soilType}</span>
                  </div>
                  <div className="ft-agro-spec-card">
                    <CloudSun size={18} className="text-orange-500 mb-1" />
                    <span className="ft-agro-lbl">Climate & Temperature</span>
                    <span className="ft-agro-val">{selectedCrop.climate}</span>
                  </div>
                  <div className="ft-agro-spec-card">
                    <Calendar size={18} className="text-emerald-600 mb-1" />
                    <span className="ft-agro-lbl">Sowing Window</span>
                    <span className="ft-agro-val">{selectedCrop.sowingPeriod}</span>
                  </div>
                  <div className="ft-agro-spec-card">
                    <Sprout size={18} className="text-green-600 mb-1" />
                    <span className="ft-agro-lbl">Expected Yield</span>
                    <span className="ft-agro-val">{selectedCrop.yieldPerAcre}</span>
                  </div>
                </div>

                <div className="ft-agro-section">
                  <h3>Popular High-Yielding Varieties</h3>
                  <div className="ft-varieties-tags">
                    {selectedCrop.varieties.map((v, i) => (
                      <span key={i} className="ft-variety-tag">✓ {v}</span>
                    ))}
                  </div>
                </div>

                <div className="ft-crop-modal-cta">
                  <div>
                    <strong>Ready to Trade {selectedCrop.name}?</strong>
                    <p className="text-xs text-gray-500">Discover farmer lots currently listed or post your own harvest.</p>
                  </div>
                  <div className="ft-crop-cta-btns">
                    <Link
                      to={`/buy?search=${encodeURIComponent(selectedCrop.name)}`}
                      className="ft-btn-modal-browse"
                      onClick={() => setSelectedCrop(null)}
                    >
                      Browse {selectedCrop.name} Lots
                    </Link>
                    <Link
                      to="/sell"
                      className="ft-btn-modal-post"
                      onClick={() => setSelectedCrop(null)}
                    >
                      Post Harvest Lot
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
