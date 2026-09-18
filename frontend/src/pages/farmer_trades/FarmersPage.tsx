import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  Heart,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  ExternalLink,
  Award
} from 'lucide-react';
import {
  FARMERS_DIRECTORY,
  KARNATAKA_DISTRICTS,
  FarmerProfileItem
} from '../../data/farmerTradesData';
import {
  isFavorite,
  toggleFavorite,
  getAllProduceListings
} from '../../utils/farmerTradesStore';
import './FarmersPage.css';

export const FarmersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [activeModalFarmer, setActiveModalFarmer] = useState<FarmerProfileItem | null>(null);
  const [favCounter, setFavCounter] = useState(0);

  const allListings = getAllProduceListings();

  const filteredFarmers = useMemo(() => {
    return FARMERS_DIRECTORY.filter((f) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          f.name.toLowerCase().includes(q) ||
          f.village.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q) ||
          f.specialties.some((s) => s.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedDistrict !== 'All' && f.district !== selectedDistrict) {
        return false;
      }

      return true;
    });
  }, [searchTerm, selectedDistrict]);

  const handleToggleFarmerFav = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFavorite('farmers', id);
    setFavCounter((c) => c + 1);
  };

  return (
    <div className="ft-farmers-page">
      {/* Header Banner */}
      <div className="ft-farmers-banner">
        <div className="ft-farmers-banner-inner">
          <div className="ft-farmers-badge">
            <Sparkles size={14} /> VERIFIED AGRICULTURAL PRODUCERS
          </div>
          <h1>India’s Farmer Directory</h1>
          <p>
            Connect directly with verified agrarians across Karnataka and southern India. View land holdings, crop specializations, active harvests, and verified APMC trade histories.
          </p>
        </div>
      </div>

      <div className="ft-farmers-container">
        {/* Search & District Bar */}
        <div className="ft-farmers-filter-bar">
          <div className="ft-farmers-search">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search farmer by name, village, crop (e.g. Ramesh, Mandya, Ragi)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="ft-clear-btn" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>

          <div className="ft-farmers-district-select">
            <label>Filter District:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="All">All Districts ({FARMERS_DIRECTORY.length})</option>
              {KARNATAKA_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="ft-farmers-directory-grid">
          {filteredFarmers.map((farmer) => {
            const isFav = isFavorite('farmers', farmer.id);
            const farmerProduce = allListings.filter((l) => l.farmerName === farmer.name);

            return (
              <div
                key={farmer.id}
                className="ft-farmer-dir-card"
                onClick={() => setActiveModalFarmer(farmer)}
              >
                <div className="ft-farmer-dir-header">
                  <div className="ft-farmer-avatar-wrap">
                    <img src={farmer.avatarUrl} alt={farmer.name} />
                    {farmer.verified && (
                      <div className="ft-verified-dot" title="Verified Producer">
                        <ShieldCheck size={14} />
                      </div>
                    )}
                  </div>

                  <div className="ft-farmer-header-info">
                    <div className="ft-farmer-top-row">
                      <h3 className="ft-dir-name">{farmer.name}</h3>
                      <button
                        className={`ft-dir-fav-btn ${isFav ? 'active' : ''}`}
                        onClick={(e) => handleToggleFarmerFav(e, farmer.id)}
                        title={isFav ? 'Saved' : 'Save Farmer'}
                      >
                        <Heart size={16} fill={isFav ? '#DC2626' : 'none'} color={isFav ? '#DC2626' : '#9CA3AF'} />
                      </button>
                    </div>

                    <div className="ft-dir-location">
                      <MapPin size={13} className="text-emerald-700" />
                      <span>{farmer.village}, {farmer.district}, {farmer.state}</span>
                    </div>

                    <div className="ft-dir-stats-row">
                      <span className="ft-stat-badge">
                        ⭐ {farmer.rating} ({farmer.totalDealsCompleted} Deals)
                      </span>
                      <span className="ft-stat-badge">
                        🌾 {farmer.landAcreage} Acres
                      </span>
                    </div>
                  </div>
                </div>

                <p className="ft-dir-bio">{farmer.bio}</p>

                <div className="ft-dir-crops-chips">
                  {farmer.specialties.map((spec, i) => (
                    <span key={i} className="ft-dir-crop-chip">{spec}</span>
                  ))}
                </div>

                <div className="ft-dir-footer">
                  <div className="ft-dir-active-lots">
                    🌱 <strong>{farmer.activeListingsCount} Lots</strong> currently available
                  </div>
                  <button
                    className="ft-btn-view-farmer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalFarmer(farmer);
                    }}
                  >
                    View Profile <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Farmer Detail Profile Modal */}
      {activeModalFarmer && (
        <div className="ft-modal-overlay" onClick={() => setActiveModalFarmer(null)}>
          <div className="ft-modal-container ft-farmer-modal-wrap" onClick={(e) => e.stopPropagation()}>
            <div className="ft-modal-header">
              <div className="ft-modal-header-badges">
                <span className="ft-badge-category">FID: {activeModalFarmer.fid}</span>
                {activeModalFarmer.verified && (
                  <span className="ft-badge-organic">
                    <ShieldCheck size={14} className="inline mr-1" /> APMC Verified Producer
                  </span>
                )}
              </div>
              <button className="ft-close-btn" onClick={() => setActiveModalFarmer(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="ft-farmer-modal-content">
              <div className="ft-farmer-modal-hero">
                <img src={activeModalFarmer.avatarUrl} alt={activeModalFarmer.name} className="ft-farmer-modal-pic" />
                <div>
                  <h2>{activeModalFarmer.name}</h2>
                  <p className="ft-modal-loc">
                    <MapPin size={14} className="inline mr-1 text-emerald-700" />
                    {activeModalFarmer.village}, {activeModalFarmer.district}, {activeModalFarmer.state}
                  </p>
                  <div className="ft-modal-badges-row">
                    <span>⭐ {activeModalFarmer.rating} Rating</span>
                    <span>•</span>
                    <span>🤝 {activeModalFarmer.totalDealsCompleted} Completed Deals</span>
                    <span>•</span>
                    <span>🚜 {activeModalFarmer.landAcreage} Acres Cultivated</span>
                  </div>
                </div>
              </div>

              <div className="ft-farmer-modal-body">
                <h3>About the Farm & Practices</h3>
                <p className="ft-modal-desc">{activeModalFarmer.bio}</p>

                <div className="ft-spec-block">
                  <h4>Specialized Crop Categories</h4>
                  <div className="ft-dir-crops-chips">
                    {activeModalFarmer.specialties.map((s, i) => (
                      <span key={i} className="ft-dir-crop-chip">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="ft-contact-box">
                  <h4>Direct Farmer Contact</h4>
                  <div className="ft-contact-item">
                    <Phone size={16} className="text-emerald-700" />
                    <span>Phone: <strong>{activeModalFarmer.phone}</strong></span>
                  </div>
                  <div className="ft-contact-item">
                    <Mail size={16} className="text-emerald-700" />
                    <span>Email: <strong>{activeModalFarmer.email}</strong></span>
                  </div>
                </div>

                <div className="ft-farmer-lots-section">
                  <h4>Active Produce Lots from this Farmer</h4>
                  <div className="ft-lots-quick-list">
                    {allListings
                      .filter((l) => l.farmerName === activeModalFarmer.name)
                      .map((lot) => (
                        <div key={lot.id} className="ft-quick-lot-item">
                          <div>
                            <strong>{lot.title}</strong>
                            <div className="text-xs text-gray-500">
                              ₹{lot.pricePerQuintal}/qtl • {lot.quantityAvailableQuintals} Quintals Available
                            </div>
                          </div>
                          <Link
                            to={`/buy?search=${encodeURIComponent(lot.title)}`}
                            className="ft-btn-quick-lot"
                            onClick={() => setActiveModalFarmer(null)}
                          >
                            Explore Lot <ExternalLink size={12} />
                          </Link>
                        </div>
                      ))}
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
