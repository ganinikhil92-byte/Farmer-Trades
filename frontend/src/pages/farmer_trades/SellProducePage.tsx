import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Truck,
  MapPin,
  Sparkles,
  Layers,
  DollarSign
} from 'lucide-react';
import {
  CROP_CATEGORIES,
  KARNATAKA_DISTRICTS,
  CROPS_ENCYCLOPEDIA
} from '../../data/farmerTradesData';
import { addProduceListing, addNotification } from '../../utils/farmerTradesStore';
import { matchOfficialFruitPhoto } from '../../utils/producePhoto';
import { useAuth } from '../../context/AuthContext';
import SubscriptionModal from '../../components/SubscriptionModal';
import api from '../../utils/api';
import './SellProducePage.css';

const DRAFT_STORAGE_KEY = 'farmer_trades_sell_draft';

const SAMPLE_IMAGE_OPTIONS = [
  { name: 'Fresh Farm Watermelon', url: '/produce/fruits/watermelon.jpg' },
  { name: 'Fresh Farm Pomegranate', url: '/produce/fruits/pomegranate.jpg' },
  { name: 'Fresh Farm Papaya', url: '/produce/fruits/papaya.jpg' },
  { name: 'Fresh Vineyard Grapes', url: '/produce/fruits/grapes.jpg' },
  { name: 'Fresh Farm Banana', url: '/produce/fruits/banana.jpg' },
  { name: 'Organic Ragi (Millet)', url: '/produce/ragi.jpg' },
  { name: 'Sona Masoori Paddy', url: '/produce/paddy.jpg' },
  { name: 'Sharbati Wheat Grain', url: '/produce/wheat.jpg' },
  { name: 'Byadagi Red Chilli', url: '/produce/chilli.jpg' }
];

export const SellProducePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Wizard Step (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [draftSavedMsg, setDraftSavedMsg] = useState(false);
  const [formError, setFormError] = useState('');

  // Subscription & Free Tier State
  const [showSubModal, setShowSubModal] = useState(false);
  const [hasSub, setHasSub] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState(2);
  const [subNeeded, setSubNeeded] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Crop Basics
    cropName: '',
    category: 'Cereals',
    variety: '',
    title: '',

    // Step 2: Quality, Price & Inventory
    pricePerQuintal: 4200,
    quantityAvailableQuintals: 30,
    minOrderQuintals: 5,
    grade: 'A' as 'A' | 'B' | 'Premium',
    organic: true,
    harvestDate: new Date().toISOString().split('T')[0],

    // Step 3: Location & Logistics
    state: 'Karnataka',
    district: 'Mandya',
    village: 'Gejjalagere',
    mandiName: 'Mandya APMC Yard',
    farmerName: 'Ramesh Gowda',
    farmerPhone: '+91 94481 29401',
    deliveryAvailable: true,

    // Step 4: Media & Description
    imageUrl: SAMPLE_IMAGE_OPTIONS[0].url,
    description: 'Freshly harvested lot dried to optimal 12% moisture. Stored in high-grade moisture-barrier jute bags.'
  });

  // Restore Draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        setFormData(JSON.parse(savedDraft));
      }
    } catch (e) {}

    async function checkSubscription() {
      if (!user?.email) return;
      if (user.email === 'admin@agro.com' || user.email === 'nikhilgani987@gmail.com') {
        setHasSub(true);
        setSubNeeded(false);
        setFreeRemaining(999);
        return;
      }
      try {
        const res = await api.get('/farmer/subscription/status', {
          params: { farmer_id: user.email }
        });
        if (res.data) {
          setHasSub(Boolean(res.data.has_active_subscription));
          setFreeRemaining(res.data.free_listings_remaining ?? 2);
          setSubNeeded(Boolean(res.data.needs_subscription));
        }
      } catch (e) {
        console.warn('Subscription check note:', e);
      }
    }
    checkSubscription();
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'cropName' || field === 'category') {
        const fruitPhoto = matchOfficialFruitPhoto(
          field === 'cropName' ? value : prev.cropName,
          field === 'category' ? value : prev.category
        );
        if (fruitPhoto) {
          updated.imageUrl = fruitPhoto;
        }
      }
      return updated;
    });
    setFormError('');
  };

  const handleSelectPredefinedCrop = (cropName: string) => {
    const found = CROPS_ENCYCLOPEDIA.find((c) => c.name === cropName);
    if (found) {
      const fruitPhoto = matchOfficialFruitPhoto(found.name, found.category);
      setFormData((prev) => ({
        ...prev,
        cropName: found.name,
        category: found.category,
        variety: found.varieties[0] || '',
        title: `Harvest Fresh ${found.name} (${found.varieties[0] || 'Grade A'})`,
        pricePerQuintal: found.benchmarkPricePerQuintal,
        imageUrl: fruitPhoto || found.imageUrl
      }));
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      setDraftSavedMsg(true);
      setTimeout(() => setDraftSavedMsg(false), 2500);
    } catch (e) {}
  };

  const validateStep = (step: number): boolean => {
    setFormError('');
    if (step === 1) {
      if (!formData.cropName.trim()) {
        setFormError('Please enter the crop name.');
        return false;
      }
      if (!formData.variety.trim()) {
        setFormError('Please specify the crop variety.');
        return false;
      }
      if (!formData.title.trim()) {
        setFormError('Please provide a listing title for buyers.');
        return false;
      }
    } else if (step === 2) {
      if (formData.pricePerQuintal <= 0) {
        setFormError('Asking price per quintal must be greater than zero.');
        return false;
      }
      if (formData.quantityAvailableQuintals <= 0) {
        setFormError('Available quantity must be greater than zero quintals.');
        return false;
      }
      if (formData.minOrderQuintals > formData.quantityAvailableQuintals) {
        setFormError('Minimum order quantity cannot exceed total available quantity.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.district.trim() || !formData.village.trim() || !formData.mandiName.trim()) {
        setFormError('Please specify the village, district, and nearest APMC Mandi.');
        return false;
      }
      if (!formData.farmerPhone.trim()) {
        setFormError('Contact phone number is required for buyer trade inquiries.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.imageUrl.trim()) {
        setFormError('Please select or provide a photo for your harvest lot.');
        return false;
      }
      if (!formData.description.trim()) {
        setFormError('Please add a brief description of quality and storage condition.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, 4));
    }
  };

  const handleBack = () => {
    setFormError('');
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    if (subNeeded && !hasSub) {
      setFormError('You have used your 2 free listings. An active Produce Trading Subscription is required to publish more produce lots.');
      setShowSubModal(true);
      return;
    }

    const newListing = addProduceListing({
      title: formData.title,
      cropName: formData.cropName,
      category: formData.category,
      variety: formData.variety,
      quantityAvailableQuintals: formData.quantityAvailableQuintals,
      minOrderQuintals: formData.minOrderQuintals,
      pricePerQuintal: formData.pricePerQuintal,
      state: formData.state,
      district: formData.district,
      village: formData.village,
      mandiName: formData.mandiName,
      harvestDate: formData.harvestDate,
      grade: formData.grade,
      organic: formData.organic,
      imageUrl: matchOfficialFruitPhoto(formData.cropName, formData.category) || formData.imageUrl,
      description: formData.description,
      farmerName: formData.farmerName,
      farmerPhone: formData.farmerPhone,
      verifiedFarmer: true,
      rating: 4.9,
      deliveryAvailable: formData.deliveryAvailable
    });

    // Clear draft
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setCreatedListingId(newListing.id);
    setIsPublished(true);
  };

  if (isPublished) {
    return (
      <div className="ft-sell-success-page">
        <div className="ft-sell-success-card">
          <div className="ft-success-check-circle">
            <Check size={40} />
          </div>
          <h2>Produce Lot Published Successfully!</h2>
          <p>
            Your listing <strong>“{formData.title}”</strong> is now live across the Farmer Trades network and visible to verified grain merchants, millers, and mandi aggregators.
          </p>
          <div className="ft-success-lot-summary">
            <div>Quantity: <strong>{formData.quantityAvailableQuintals} Quintals</strong></div>
            <div>Asking Rate: <strong>₹{formData.pricePerQuintal.toLocaleString('en-IN')} / Quintal</strong></div>
            <div>Mandi Location: <strong>{formData.mandiName}, {formData.district}</strong></div>
          </div>
          <div className="ft-success-actions">
            <button
              className="ft-btn-view-live"
              onClick={() => navigate(`/buy?search=${encodeURIComponent(formData.cropName)}`)}
            >
              View in Produce Marketplace
            </button>
            <button
              className="ft-btn-post-another"
              onClick={() => {
                setIsPublished(false);
                setCurrentStep(1);
              }}
            >
              Post Another Harvest Lot
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ft-sell-page">
      {/* Header Banner */}
      <div className="ft-sell-header-banner">
        <div className="ft-sell-header-inner">
          <div className="ft-sell-badge">
            <Sparkles size={14} />
            {hasSub
              ? 'TRADING PASS ACTIVE • UNLIMITED LISTINGS'
              : freeRemaining > 0
              ? `FREE TRIAL • ${freeRemaining} FREE LISTING${freeRemaining > 1 ? 'S' : ''} REMAINING`
              : '2 FREE LISTINGS USED • SUBSCRIPTION PASS REQUIRED'}
          </div>
          <h1>List Your Harvest for Direct Buyer Offers</h1>
          <p>
            Post your crops with full quality specifications. Zero commissions, verified weighment receipts, and direct bank deposits.
          </p>
        </div>
      </div>

      <div className="ft-sell-container">
        {/* Wizard Progress Stepper */}
        <div className="ft-stepper-card">
          <div className="ft-stepper-steps">
            {[
              { num: 1, label: 'Crop Info' },
              { num: 2, label: 'Price & Quantity' },
              { num: 3, label: 'Location & Origin' },
              { num: 4, label: 'Photos & Review' }
            ].map((step) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div
                  key={step.num}
                  className={`ft-step-pill ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.num);
                  }}
                >
                  <div className="ft-step-indicator">
                    {isCompleted ? <Check size={14} /> : step.num}
                  </div>
                  <span className="ft-step-name">{step.label}</span>
                </div>
              );
            })}
          </div>

          <div className="ft-stepper-draft-action">
            <button className="ft-btn-save-draft" onClick={handleSaveDraft}>
              <Save size={14} /> Save Draft
            </button>
            {draftSavedMsg && <span className="ft-draft-saved-text">Draft saved locally!</span>}
          </div>
        </div>

        {/* Form Error Alert */}
        {formError && (
          <div className="ft-sell-alert-error">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        {/* Wizard Body Card */}
        <div className="ft-form-card">
          {/* STEP 1: Crop Basics */}
          {currentStep === 1 && (
            <div className="ft-form-step-content">
              <h2 className="ft-step-title">Step 1: Crop Details & Classification</h2>
              <p className="ft-step-desc">
                Choose from our popular crop encyclopedia or enter your harvest details manually.
              </p>

              {/* Quick Select Buttons */}
              <div className="ft-quick-crop-chips">
                <span className="ft-chips-label">Quick Select:</span>
                {['Finger Millet (Ragi)', 'Paddy (Rice)', 'Wheat', 'Cotton', 'Red Chilli', 'Sugarcane'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="ft-quick-chip"
                    onClick={() => handleSelectPredefinedCrop(c)}
                  >
                    + {c}
                  </button>
                ))}
              </div>

              <div className="ft-form-grid-2">
                <div className="ft-field-group">
                  <label>Crop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finger Millet (Ragi), Sona Masoori, Sharbati"
                    value={formData.cropName}
                    onChange={(e) => handleInputChange('cropName', e.target.value)}
                  />
                </div>

                <div className="ft-field-group">
                  <label>Commodity Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {CROP_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ft-form-grid-2">
                <div className="ft-field-group">
                  <label>Crop Variety / Cultivar *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ML-365, GPU-28, Sona Masoori, Byadagi"
                    value={formData.variety}
                    onChange={(e) => handleInputChange('variety', e.target.value)}
                  />
                </div>

                <div className="ft-field-group">
                  <label>Listing Title (Shown on marketplace) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium Grade-A Organic Ragi Lot"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Quality, Price & Inventory */}
          {currentStep === 2 && (
            <div className="ft-form-step-content">
              <h2 className="ft-step-title">Step 2: Asking Price, Quantity & Quality Grade</h2>
              <p className="ft-step-desc">
                Set transparent pricing per quintal (100 kg) and define your minimum dispatch lot.
              </p>

              <div className="ft-form-grid-2">
                <div className="ft-field-group">
                  <label>Asking Price per Quintal (100 kg) *</label>
                  <div className="ft-input-with-icon">
                    <span className="ft-currency-sign">₹</span>
                    <input
                      type="number"
                      required
                      min={100}
                      step={50}
                      value={formData.pricePerQuintal}
                      onChange={(e) => handleInputChange('pricePerQuintal', Number(e.target.value))}
                    />
                  </div>
                  <span className="ft-field-help">
                    Equivalent to ₹{(formData.pricePerQuintal / 100).toFixed(2)} per kg
                  </span>
                </div>

                <div className="ft-field-group">
                  <label>Available Quantity (Quintals) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.quantityAvailableQuintals}
                    onChange={(e) => handleInputChange('quantityAvailableQuintals', Number(e.target.value))}
                  />
                  <span className="ft-field-help">
                    Total harvest lot: {(formData.quantityAvailableQuintals * 100).toLocaleString('en-IN')} kg
                  </span>
                </div>
              </div>

              <div className="ft-form-grid-3">
                <div className="ft-field-group">
                  <label>Minimum Order Quantity (Qtl) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formData.quantityAvailableQuintals}
                    value={formData.minOrderQuintals}
                    onChange={(e) => handleInputChange('minOrderQuintals', Number(e.target.value))}
                  />
                </div>

                <div className="ft-field-group">
                  <label>Quality Grade *</label>
                  <select
                    value={formData.grade}
                    onChange={(e: any) => handleInputChange('grade', e.target.value)}
                  >
                    <option value="Premium">Grade Premium (Export Quality)</option>
                    <option value="A">Grade A (Standard APMC Clean)</option>
                    <option value="B">Grade B (Fair Average Quality - FAQ)</option>
                  </select>
                </div>

                <div className="ft-field-group">
                  <label>Harvest Completion Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.harvestDate}
                    onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="ft-organic-checkbox-card">
                <label className="ft-check-flex">
                  <input
                    type="checkbox"
                    checked={formData.organic}
                    onChange={(e) => handleInputChange('organic', e.target.checked)}
                  />
                  <div>
                    <strong>🌿 100% Certified Organic Harvest</strong>
                    <p>No synthetic chemicals or non-permitted pesticides used. Eligible for Organic tag.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Origin & Logistics */}
          {currentStep === 3 && (
            <div className="ft-form-step-content">
              <h2 className="ft-step-title">Step 3: Farm Origin & Logistics</h2>
              <p className="ft-step-desc">
                Specify where the lot is physically stored and your pickup or delivery capabilities.
              </p>

              <div className="ft-form-grid-3">
                <div className="ft-field-group">
                  <label>State *</label>
                  <input
                    type="text"
                    disabled
                    value={formData.state}
                    className="ft-disabled-input"
                  />
                </div>

                <div className="ft-field-group">
                  <label>District *</label>
                  <select
                    value={formData.district}
                    onChange={(e) => {
                      handleInputChange('district', e.target.value);
                      handleInputChange('mandiName', `${e.target.value} APMC Yard`);
                    }}
                  >
                    {KARNATAKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="ft-field-group">
                  <label>Village / Taluk *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gejjalagere, Maddur Taluk"
                    value={formData.village}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                  />
                </div>
              </div>

              <div className="ft-form-grid-2">
                <div className="ft-field-group">
                  <label>Nearest APMC Mandi *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mandya APMC Yard"
                    value={formData.mandiName}
                    onChange={(e) => handleInputChange('mandiName', e.target.value)}
                  />
                </div>

                <div className="ft-field-group">
                  <label>Contact Phone (For Buyer Quotes) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 94481 29401"
                    value={formData.farmerPhone}
                    onChange={(e) => handleInputChange('farmerPhone', e.target.value)}
                  />
                </div>
              </div>

              <div className="ft-logistic-option-card">
                <label className="ft-check-flex">
                  <input
                    type="checkbox"
                    checked={formData.deliveryAvailable}
                    onChange={(e) => handleInputChange('deliveryAvailable', e.target.checked)}
                  />
                  <div>
                    <strong>🚚 Transport Delivery Support Available</strong>
                    <p>You can arrange local tractor or truck delivery to the buyer's warehouse or APMC yard (freight paid by agreement).</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Media, Description & Final Review */}
          {currentStep === 4 && (
            <div className="ft-form-step-content">
              <h2 className="ft-step-title">Step 4: Harvest Photo & Review</h2>
              <p className="ft-step-desc">
                High quality photos increase buyer inquiry rates by over 40%. Select a sample or paste an image URL.
              </p>

              {/* Sample Photo Chooser */}
              <div className="ft-photo-selector-box">
                <span className="ft-photo-selector-label">Choose a high-resolution crop photo:</span>
                <div className="ft-photo-samples-row">
                  {SAMPLE_IMAGE_OPTIONS.map((sample, idx) => (
                    <div
                      key={idx}
                      className={`ft-photo-thumb-wrap ${formData.imageUrl === sample.url ? 'selected' : ''}`}
                      onClick={() => handleInputChange('imageUrl', sample.url)}
                    >
                      <img src={sample.url} alt={sample.name} />
                      <span>{sample.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ft-form-grid-2">
                <div className="ft-field-group">
                  <label>Custom Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  />
                </div>

                <div className="ft-field-group">
                  <label>Lot Description & Storage Specs *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe moisture level, bag packing type, cleaning method, or storage condition..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
              </div>

              {/* Review Summary Box */}
              <div className="ft-review-summary-card">
                <h3 className="ft-review-title">Review Listing Summary Before Publishing</h3>
                <div className="ft-review-grid">
                  <div>
                    <span className="ft-rev-lbl">Crop & Variety:</span>
                    <span className="ft-rev-val">{formData.cropName} ({formData.variety})</span>
                  </div>
                  <div>
                    <span className="ft-rev-lbl">Asking Price:</span>
                    <span className="ft-rev-val text-emerald-700 font-bold">₹{formData.pricePerQuintal.toLocaleString('en-IN')} / qtl</span>
                  </div>
                  <div>
                    <span className="ft-rev-lbl">Stock Lot:</span>
                    <span className="ft-rev-val">{formData.quantityAvailableQuintals} Quintals (Min: {formData.minOrderQuintals} Qtl)</span>
                  </div>
                  <div>
                    <span className="ft-rev-lbl">Quality Grade:</span>
                    <span className="ft-rev-val">Grade {formData.grade} {formData.organic ? '(100% Organic)' : ''}</span>
                  </div>
                  <div>
                    <span className="ft-rev-lbl">Location:</span>
                    <span className="ft-rev-val">{formData.village}, {formData.district}, {formData.state}</span>
                  </div>
                  <div>
                    <span className="ft-rev-lbl">Mandi Delivery:</span>
                    <span className="ft-rev-val">{formData.deliveryAvailable ? 'Farmgate + Mandi Transport' : 'Farmgate Only'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Wizard Actions */}
          <div className="ft-wizard-nav-bar">
            {currentStep > 1 ? (
              <button type="button" className="ft-btn-wizard-back" onClick={handleBack}>
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div></div>}

            {currentStep < 4 ? (
              <button type="button" className="ft-btn-wizard-next" onClick={handleNext}>
                Continue to Step {currentStep + 1} <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" className="ft-btn-publish" onClick={handlePublish}>
                <CheckCircle2 size={18} /> Publish Produce Lot Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Modal for beyond 2 free listings */}
      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSuccess={() => {
          setHasSub(true);
          setSubNeeded(false);
          setShowSubModal(false);
        }}
      />
    </div>
  );
};
