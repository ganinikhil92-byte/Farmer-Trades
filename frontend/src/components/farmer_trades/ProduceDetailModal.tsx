import React, { useState } from 'react';
import {
  X,
  Heart,
  Share2,
  MapPin,
  ShieldCheck,
  Calendar,
  Package,
  Award,
  Truck,
  Phone,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { ProduceListingItem } from '../../data/farmerTradesData';
import { isFavorite, toggleFavorite, submitPurchaseOffer } from '../../utils/farmerTradesStore';
import './ProduceDetailModal.css';

interface ProduceDetailModalProps {
  produce: ProduceListingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOfferSubmitted?: () => void;
}

export const ProduceDetailModal: React.FC<ProduceDetailModalProps> = ({
  produce,
  isOpen,
  onClose,
  onOfferSubmitted
}) => {
  if (!isOpen || !produce) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'offer'>('overview');
  const [isFav, setIsFav] = useState<boolean>(() => isFavorite('listings', produce.id));
  const [copiedShare, setCopiedShare] = useState(false);

  // Buy offer form state
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [offeredPrice, setOfferedPrice] = useState<number>(produce.pricePerQuintal);
  const [quantity, setQuantity] = useState<number>(produce.minOrderQuintals);
  const [notes, setNotes] = useState('');
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleFavoriteToggle = () => {
    const nextState = toggleFavorite('listings', produce.id);
    setIsFav(nextState);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!buyerName.trim() || !buyerPhone.trim() || !deliveryLocation.trim()) {
      setFormError('Please fill in your name, contact phone number, and delivery location.');
      return;
    }

    if (quantity < produce.minOrderQuintals) {
      setFormError(`Minimum order quantity for this lot is ${produce.minOrderQuintals} quintals.`);
      return;
    }

    if (quantity > produce.quantityAvailableQuintals) {
      setFormError(`Available stock is only ${produce.quantityAvailableQuintals} quintals.`);
      return;
    }

    if (offeredPrice <= 0) {
      setFormError('Please enter a valid offer price.');
      return;
    }

    const total = offeredPrice * quantity;

    submitPurchaseOffer({
      listingId: produce.id,
      cropName: produce.title,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerEmail: buyerEmail.trim(),
      deliveryLocation: deliveryLocation.trim(),
      offeredPricePerQuintal: offeredPrice,
      requestedQuantityQuintals: quantity,
      totalOfferAmount: total,
      notes: notes.trim()
    });

    setOfferSuccess(true);
    if (onOfferSubmitted) onOfferSubmitted();
  };

  const totalCalculated = (offeredPrice || 0) * (quantity || 0);

  return (
    <div className="ft-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ft-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ft-modal-header">
          <div className="ft-modal-header-badges">
            <span className="ft-badge-category">{produce.category}</span>
            {produce.organic && <span className="ft-badge-organic">🌿 100% Organic</span>}
            <span className="ft-badge-grade">Grade {produce.grade}</span>
          </div>
          <div className="ft-modal-header-actions">
            <button
              className={`ft-icon-btn ${isFav ? 'active-fav' : ''}`}
              onClick={handleFavoriteToggle}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={18} fill={isFav ? '#DC2626' : 'none'} color={isFav ? '#DC2626' : 'currentColor'} />
            </button>
            <button className="ft-icon-btn" onClick={handleShare} title="Share listing link">
              <Share2 size={18} />
              {copiedShare && <span className="ft-copied-tooltip">Link copied!</span>}
            </button>
            <button className="ft-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="ft-modal-body">
          {/* Left Column: Image & Farmer Card */}
          <div className="ft-modal-left">
            <div className="ft-modal-image-wrapper">
              <img src={produce.imageUrl} alt={produce.title} className="ft-modal-main-img" />
              <div className="ft-img-overlay-info">
                <span>📍 {produce.district}, {produce.state}</span>
                <span>⚖️ Lot: {produce.quantityAvailableQuintals} Quintals</span>
              </div>
            </div>

            {/* Farmer Card */}
            <div className="ft-farmer-summary-card">
              <div className="ft-farmer-avatar-row">
                <div className="ft-farmer-avatar">
                  {produce.farmerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="ft-farmer-name">
                    {produce.farmerName}
                    {produce.verifiedFarmer && (
                      <span className="ft-verified-badge" title="Verified Producer">
                        <ShieldCheck size={14} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="ft-farmer-rating">⭐ {produce.rating.toFixed(1)} / 5.0 (Farmer Trades Verified)</div>
                </div>
              </div>

              <div className="ft-farmer-details-list">
                <div className="ft-detail-item">
                  <MapPin size={14} className="ft-detail-icon" />
                  <span>Mandi: <strong>{produce.mandiName}</strong></span>
                </div>
                <div className="ft-detail-item">
                  <Phone size={14} className="ft-detail-icon" />
                  <span>Contact: <strong>{produce.farmerPhone}</strong></span>
                </div>
                <div className="ft-detail-item">
                  <Truck size={14} className="ft-detail-icon" />
                  <span>Logistics: <strong>{produce.deliveryAvailable ? 'Delivery & Farmgate Pickup' : 'Farmgate Pickup Only'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Listing Details & Offer Form */}
          <div className="ft-modal-right">
            <h2 className="ft-modal-title">{produce.title}</h2>
            <p className="ft-modal-variety">
              Variety: <strong>{produce.variety}</strong>
            </p>

            {/* Price Box */}
            <div className="ft-modal-price-box">
              <div className="ft-price-primary">
                ₹{produce.pricePerQuintal.toLocaleString('en-IN')}
                <span className="ft-price-unit">/ quintal (100 kg)</span>
              </div>
              <div className="ft-price-secondary">
                Approx. <strong>₹{(produce.pricePerQuintal / 100).toFixed(2)} / kg</strong>
                <span className="ft-price-subtext"> | Min. Order: {produce.minOrderQuintals} Qtl</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="ft-modal-tabs">
              <button
                className={`ft-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Lot Specifications
              </button>
              <button
                className={`ft-tab-btn ${activeTab === 'offer' ? 'active' : ''}`}
                onClick={() => setActiveTab('offer')}
              >
                Make Buy Offer / Inquire
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="ft-tab-content">
                <p className="ft-modal-desc">{produce.description}</p>

                <div className="ft-spec-grid">
                  <div className="ft-spec-card">
                    <span className="ft-spec-label">Available Stock</span>
                    <span className="ft-spec-val">{produce.quantityAvailableQuintals} Qtl</span>
                  </div>
                  <div className="ft-spec-card">
                    <span className="ft-spec-label">Minimum Order</span>
                    <span className="ft-spec-val">{produce.minOrderQuintals} Qtl</span>
                  </div>
                  <div className="ft-spec-card">
                    <span className="ft-spec-label">Harvest Date</span>
                    <span className="ft-spec-val">{produce.harvestDate}</span>
                  </div>
                  <div className="ft-spec-card">
                    <span className="ft-spec-label">Quality Grade</span>
                    <span className="ft-spec-val">Grade {produce.grade}</span>
                  </div>
                </div>

                <div className="ft-quality-guarantee-box">
                  <Award size={18} className="text-emerald-700" />
                  <div>
                    <strong>Direct Farm Trade Protection</strong>
                    <p>Inspection verified upon dispatch. Escrow milestone release supported on APMC weighment receipts.</p>
                  </div>
                </div>

                <div className="ft-modal-actions-bar">
                  <button
                    className="ft-btn-primary-action"
                    onClick={() => setActiveTab('offer')}
                  >
                    Submit Buy Offer for this Lot
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Buy Offer Form */}
            {activeTab === 'offer' && (
              <div className="ft-tab-content">
                {offerSuccess ? (
                  <div className="ft-offer-success-box">
                    <CheckCircle2 size={40} className="ft-success-icon" />
                    <h3>Purchase Offer Sent Successfully!</h3>
                    <p>
                      Your direct proposal has been forwarded to <strong>{produce.farmerName}</strong>. You will receive an SMS and dashboard notification when accepted or countered.
                    </p>
                    <div className="ft-offer-receipt">
                      <div>Offer: <strong>₹{offeredPrice.toLocaleString('en-IN')}/qtl</strong> for <strong>{quantity} quintals</strong></div>
                      <div>Total Value: <strong>₹{totalCalculated.toLocaleString('en-IN')}</strong></div>
                    </div>
                    <button
                      className="ft-btn-secondary"
                      onClick={() => {
                        setOfferSuccess(false);
                        setActiveTab('overview');
                      }}
                    >
                      Back to Lot Specifications
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleOfferSubmit} className="ft-offer-form">
                    {formError && (
                      <div className="ft-form-error">
                        <AlertCircle size={16} />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="ft-form-row-2">
                      <div className="ft-input-group">
                        <label>Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kumar / Agro Millers"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                        />
                      </div>
                      <div className="ft-input-group">
                        <label>Phone Number (SMS Alert) *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="ft-form-row-2">
                      <div className="ft-input-group">
                        <label>Offer Price per Quintal (₹) *</label>
                        <div className="ft-price-input-wrap">
                          <span className="ft-currency-prefix">₹</span>
                          <input
                            type="number"
                            required
                            min={500}
                            step={50}
                            value={offeredPrice}
                            onChange={(e) => setOfferedPrice(Number(e.target.value))}
                          />
                        </div>
                        <span className="ft-input-hint">Listing asking price: ₹{produce.pricePerQuintal}/qtl</span>
                      </div>
                      <div className="ft-input-group">
                        <label>Quantity Needed (Quintals) *</label>
                        <input
                          type="number"
                          required
                          min={produce.minOrderQuintals}
                          max={produce.quantityAvailableQuintals}
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                        <span className="ft-input-hint">Available: {produce.quantityAvailableQuintals} Qtl (Min: {produce.minOrderQuintals})</span>
                      </div>
                    </div>

                    <div className="ft-input-group">
                      <label>Delivery / Mandi Destination *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. APMC Yard Mandya / Mill warehouse Bengaluru"
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                      />
                    </div>

                    <div className="ft-input-group">
                      <label>Special Instructions / Transport note (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="Mention truck pickup date or packaging bag requirements..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    {/* Calculation Summary Box */}
                    <div className="ft-calc-box">
                      <div className="ft-calc-row">
                        <span>Quantity</span>
                        <span>{quantity} Quintals ({(quantity * 100).toLocaleString('en-IN')} kg)</span>
                      </div>
                      <div className="ft-calc-row">
                        <span>Offer Rate</span>
                        <span>₹{offeredPrice.toLocaleString('en-IN')} / Quintal</span>
                      </div>
                      <div className="ft-calc-row ft-calc-total">
                        <span>Total Proposed Value</span>
                        <span className="ft-calc-total-num">₹{totalCalculated.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button type="submit" className="ft-submit-offer-btn">
                      Confirm & Send Offer to Farmer
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
