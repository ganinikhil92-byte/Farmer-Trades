import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Trash2,
  Eye,
  MapPin,
  ShieldCheck,
  Package,
  BookOpen,
  Users,
  ArrowRight
} from 'lucide-react';
import {
  getFavorites,
  toggleFavorite,
  getAllProduceListings
} from '../../utils/farmerTradesStore';
import {
  CROPS_ENCYCLOPEDIA,
  FARMERS_DIRECTORY,
  ProduceListingItem
} from '../../data/farmerTradesData';
import { ProduceDetailModal } from '../../components/farmer_trades/ProduceDetailModal';
import './FavoritesPage.css';

export const FavoritesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'listings' | 'crops' | 'farmers'>('listings');
  const [refreshState, setRefreshState] = useState(0);

  const [selectedProduce, setSelectedProduce] = useState<ProduceListingItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const favs = getFavorites();
  const allListings = getAllProduceListings();

  const savedListings = allListings.filter((l) => favs.listings.includes(l.id));
  const savedCrops = CROPS_ENCYCLOPEDIA.filter((c) => favs.crops.includes(c.id));
  const savedFarmers = FARMERS_DIRECTORY.filter((f) => favs.farmers.includes(f.id));

  const handleRemove = (category: 'listings' | 'crops' | 'farmers', id: string) => {
    toggleFavorite(category, id);
    setRefreshState((prev) => prev + 1);
  };

  return (
    <div className="ft-fav-page">
      {/* Banner */}
      <div className="ft-fav-banner">
        <div className="ft-fav-banner-inner">
          <div className="ft-fav-badge">
            <Heart size={14} className="text-red-300" fill="currentColor" /> SAVED BOOKMARKS
          </div>
          <h1>Your Saved Favorites</h1>
          <p>
            Quickly access your bookmarked produce lots, tracked crop varieties, and preferred agricultural producers.
          </p>
        </div>
      </div>

      <div className="ft-fav-container">
        {/* Category Tabs */}
        <div className="ft-fav-tabs-bar">
          <button
            className={`ft-fav-tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <Package size={16} /> Saved Produce Lots ({savedListings.length})
          </button>
          <button
            className={`ft-fav-tab-btn ${activeTab === 'crops' ? 'active' : ''}`}
            onClick={() => setActiveTab('crops')}
          >
            <BookOpen size={16} /> Tracked Crops ({savedCrops.length})
          </button>
          <button
            className={`ft-fav-tab-btn ${activeTab === 'farmers' ? 'active' : ''}`}
            onClick={() => setActiveTab('farmers')}
          >
            <Users size={16} /> Saved Farmers ({savedFarmers.length})
          </button>
        </div>

        {/* Tab 1: Saved Listings */}
        {activeTab === 'listings' && (
          <div className="ft-fav-tab-content">
            {savedListings.length === 0 ? (
              <div className="ft-fav-empty">
                <Package size={48} className="text-gray-300 mb-2" />
                <h3>No produce lots bookmarked yet</h3>
                <p>Browse our marketplace and click the heart icon on any harvest lot to save it here.</p>
                <Link to="/buy" className="ft-btn-browse-fav">Explore Marketplace</Link>
              </div>
            ) : (
              <div className="ft-fav-grid">
                {savedListings.map((lot) => (
                  <div key={lot.id} className="ft-fav-lot-card">
                    <div className="ft-fav-img-wrap">
                      <img src={lot.imageUrl} alt={lot.title} />
                      <button
                        className="ft-btn-del-fav"
                        onClick={() => handleRemove('listings', lot.id)}
                        title="Remove from favorites"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="ft-fav-card-body">
                      <div className="ft-fav-loc">
                        <MapPin size={12} /> {lot.mandiName}, {lot.district}
                      </div>
                      <h4>{lot.title}</h4>
                      <div className="ft-fav-price-row">
                        <span className="ft-fav-price">₹{lot.pricePerQuintal.toLocaleString('en-IN')}/qtl</span>
                        <span className="ft-fav-stock">Stock: {lot.quantityAvailableQuintals} Qtl</span>
                      </div>
                      <div className="ft-fav-card-actions">
                        <button
                          className="ft-btn-view-fav"
                          onClick={() => {
                            setSelectedProduce(lot);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye size={14} /> View Details / Make Offer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Crops */}
        {activeTab === 'crops' && (
          <div className="ft-fav-tab-content">
            {savedCrops.length === 0 ? (
              <div className="ft-fav-empty">
                <BookOpen size={48} className="text-gray-300 mb-2" />
                <h3>No crop encyclopedias tracked yet</h3>
                <p>Track crops to stay updated on their MSP, seasonal tips, and price trends.</p>
                <Link to="/crops" className="ft-btn-browse-fav">Explore Crop Encyclopedia</Link>
              </div>
            ) : (
              <div className="ft-fav-grid">
                {savedCrops.map((crop) => (
                  <div key={crop.id} className="ft-fav-lot-card">
                    <div className="ft-fav-img-wrap">
                      <img src={crop.imageUrl} alt={crop.name} />
                      <button
                        className="ft-btn-del-fav"
                        onClick={() => handleRemove('crops', crop.id)}
                        title="Remove from tracked crops"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="ft-fav-card-body">
                      <h4>{crop.name}</h4>
                      <p className="ft-fav-crop-sci">{crop.scientificName}</p>
                      <div className="ft-fav-price-row">
                        <span className="ft-fav-price">MSP: ₹{crop.benchmarkPricePerQuintal}/qtl</span>
                        <span className="ft-fav-stock">{crop.season}</span>
                      </div>
                      <div className="ft-fav-card-actions">
                        <Link to={`/crops?highlight=${crop.id}`} className="ft-btn-view-fav text-center">
                          Agronomy Specs <ArrowRight size={14} className="inline ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Farmers */}
        {activeTab === 'farmers' && (
          <div className="ft-fav-tab-content">
            {savedFarmers.length === 0 ? (
              <div className="ft-fav-empty">
                <Users size={48} className="text-gray-300 mb-2" />
                <h3>No farmers saved yet</h3>
                <p>Save trusted farmers from our directory to receive alerts whenever they harvest new lots.</p>
                <Link to="/farmers" className="ft-btn-browse-fav">View Farmer Directory</Link>
              </div>
            ) : (
              <div className="ft-fav-grid">
                {savedFarmers.map((farmer) => (
                  <div key={farmer.id} className="ft-fav-farmer-card">
                    <div className="ft-fav-farmer-top">
                      <img src={farmer.avatarUrl} alt={farmer.name} className="ft-fav-farmer-img" />
                      <div>
                        <h4>{farmer.name} {farmer.verified && <ShieldCheck size={14} className="text-emerald-600 inline" />}</h4>
                        <div className="text-xs text-gray-500">{farmer.village}, {farmer.district}</div>
                        <div className="text-xs font-semibold text-emerald-700 mt-1">⭐ {farmer.rating} • {farmer.landAcreage} Acres</div>
                      </div>
                      <button
                        className="ft-btn-del-fav ml-auto"
                        onClick={() => handleRemove('farmers', farmer.id)}
                        title="Remove saved farmer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mt-3">
                      <Link to={`/buy?district=${encodeURIComponent(farmer.district)}`} className="ft-btn-view-fav text-center">
                        View Active Lots from {farmer.name}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Produce Detail Modal */}
      <ProduceDetailModal
        produce={selectedProduce}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};
