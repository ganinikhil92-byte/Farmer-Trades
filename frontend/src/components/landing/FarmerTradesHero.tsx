import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/landing.css';
import LandingNavbar from './LandingNavbar';
import MobileMenu from './MobileMenu';
import HeroActions from './HeroActions';
import {
  Store,
  TrendingUp,
  TrendingDown,
  Bot,
  FlaskConical,
  CloudSun,
  ShieldCheck,
  ArrowRight,
  MapPin,
  CheckCircle2,
  BarChart3,
  Scale,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

/* ── Verified Live Mandi Ticker Data (Karnataka APMC Samples) ── */
interface MandiQuote {
  commodity: string;
  variety: string;
  market: string;
  district: string;
  modalPrice: string;
  change: string;
  isUp: boolean;
  arrival: string;
}

const MANDI_QUOTES: MandiQuote[] = [
  {
    commodity: 'Tomato',
    variety: 'Hybrid Local',
    market: 'Kolar APMC',
    district: 'Kolar',
    modalPrice: '₹1,850',
    change: '+2.4%',
    isUp: true,
    arrival: '420 qtl',
  },
  {
    commodity: 'Onion',
    variety: 'Red Medium',
    market: 'Yeshwanthpur APMC',
    district: 'Bengaluru Urban',
    modalPrice: '₹2,400',
    change: '-1.1%',
    isUp: false,
    arrival: '680 qtl',
  },
  {
    commodity: 'Arecanut',
    variety: 'Chali Supari',
    market: 'Shivamogga APMC',
    district: 'Shivamogga',
    modalPrice: '₹48,500',
    change: '+0.8%',
    isUp: true,
    arrival: '140 qtl',
  },
  {
    commodity: 'Ragi',
    variety: 'Finger Millet Local',
    market: 'Bandipalya APMC',
    district: 'Mysuru',
    modalPrice: '₹3,450',
    change: '+1.5%',
    isUp: true,
    arrival: '310 qtl',
  },
  {
    commodity: 'Maize',
    variety: 'Hybrid Yellow',
    market: 'Amaragol APMC',
    district: 'Hubballi',
    modalPrice: '₹2,100',
    change: '0.0%',
    isUp: true,
    arrival: '520 qtl',
  },
  {
    commodity: 'Green Chilli',
    variety: 'G4 Hot',
    market: 'Belagavi APMC',
    district: 'Belagavi',
    modalPrice: '₹3,200',
    change: '+4.1%',
    isUp: true,
    arrival: '185 qtl',
  },
];

/* ── Live Verified Farm Fruit Lots (Using authentic photos) ── */
interface VerifiedFarmLot {
  id: string;
  cropName: string;
  variety: string;
  location: string;
  quantity: string;
  unitPrice: string;
  image: string;
  harvestTag: string;
  farmerName: string;
}

const VERIFIED_LOTS: VerifiedFarmLot[] = [
  {
    id: 'lot-wm-01',
    cropName: 'Watermelon',
    variety: 'Namdhari Hybrid (A-Grade)',
    location: 'Kushtagi, Koppal',
    quantity: '12.5 Tons',
    unitPrice: '₹14 / kg',
    image: '/produce/fruits/watermelon.jpg',
    harvestTag: 'Harvested 18h ago',
    farmerName: 'Basavaraj Patil',
  },
  {
    id: 'lot-pg-02',
    cropName: 'Pomegranate',
    variety: 'Bhagwa Export Grade',
    location: 'Indi, Vijayapura',
    quantity: '4.8 Tons',
    unitPrice: '₹120 / kg',
    image: '/produce/fruits/pomegranate.jpg',
    harvestTag: 'Ready for Dispatch',
    farmerName: 'Mallikarjun Biradar',
  },
  {
    id: 'lot-py-03',
    cropName: 'Papaya',
    variety: 'Red Lady 786',
    location: 'Maddur, Mandya',
    quantity: '8.2 Tons',
    unitPrice: '₹22 / kg',
    image: '/produce/fruits/papaya.jpg',
    harvestTag: 'Field Packed',
    farmerName: 'Shivarame Gowda',
  },
  {
    id: 'lot-gp-04',
    cropName: 'Grapes',
    variety: 'Bangalore Blue Table',
    location: 'Sidlaghatta, Chikkaballapur',
    quantity: '3.4 Tons',
    unitPrice: '₹75 / kg',
    image: '/produce/fruits/grapes.jpg',
    harvestTag: 'Cold Storage Lot',
    farmerName: 'K. Venkatesh',
  },
  {
    id: 'lot-bn-05',
    cropName: 'Banana',
    variety: 'Robusta GI-Tag Area',
    location: 'Nanjangud, Mysuru',
    quantity: '15 Tons',
    unitPrice: '₹18 / kg',
    image: '/produce/fruits/banana.jpg',
    harvestTag: 'Direct from Orchard',
    farmerName: 'Suresh Kumar',
  },
];

const FarmerTradesHero: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="ft-page-shell">
      {/* ── Institutional Header & Navigation ── */}
      <LandingNavbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── 1. Hero Viewport: Authoritative Exchange Terminal ── */}
      <main className="ft-hero-section">
        <div className="ft-container">
          <div className="ft-hero-grid">
            {/* Left Column: Direct Value Proposition */}
            <div className="ft-hero-copy-block">
              <div className="ft-badge-neutral">
                <span className="ft-badge-dot" />
                <span>Karnataka Agricultural Commodity Exchange</span>
              </div>

              <h1 className="ft-hero-headline">
                Direct Farm Produce Trade & Real-Time APMC Mandi Intelligence
              </h1>

              <p className="ft-hero-subhead">
                A verified marketplace connecting Karnataka farmers directly with wholesale buyers, retailers, and FPOs. Track real-time modal prices across 30+ APMC yards with zero intermediary commission.
              </p>

              <HeroActions />

              {/* Verified Trust Anchors */}
              <div className="ft-trust-strip">
                <div className="ft-trust-item">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>APMC Yard Rates Synced Daily</span>
                </div>
                <div className="ft-trust-item">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Farmer UPI & Bank Settlement</span>
                </div>
                <div className="ft-trust-item">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero Broker Margin Deductions</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live APMC Market Price Terminal */}
            <div className="ft-hero-terminal-card">
              <div className="ft-terminal-header">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span className="ft-terminal-title">Live Karnataka APMC Rates</span>
                </div>
                <span className="ft-terminal-status">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Today's Modal Rates
                </span>
              </div>

              <div className="ft-terminal-table-wrapper">
                <table className="ft-terminal-table">
                  <thead>
                    <tr>
                      <th className="text-left">Commodity / Variety</th>
                      <th className="text-left">Mandi Yard</th>
                      <th className="text-right">Arrival</th>
                      <th className="text-right">Modal Price</th>
                      <th className="text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MANDI_QUOTES.map((quote, idx) => (
                      <tr key={idx} className="ft-terminal-row">
                        <td>
                          <div className="font-medium text-white">{quote.commodity}</div>
                          <div className="text-[11px] text-gray-400">{quote.variety}</div>
                        </td>
                        <td>
                          <div className="text-xs text-gray-200">{quote.market}</div>
                          <div className="text-[10px] text-gray-400">{quote.district}</div>
                        </td>
                        <td className="text-right ft-tabular text-xs text-gray-300">
                          {quote.arrival}
                        </td>
                        <td className="text-right ft-tabular font-semibold text-emerald-400 text-sm">
                          {quote.modalPrice} <span className="text-[10px] text-gray-400 font-normal">/ qtl</span>
                        </td>
                        <td className="text-right ft-tabular text-xs">
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium ${
                              quote.isUp ? 'text-emerald-300 bg-emerald-950/60' : 'text-rose-300 bg-rose-950/60'
                            }`}
                          >
                            {quote.isUp ? (
                              <TrendingUp className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-rose-400" />
                            )}
                            {quote.change}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ft-terminal-footer">
                <div className="text-xs text-gray-400">
                  Data sourced from Karnataka APMC Agmarknet reporting yards.
                </div>
                <Link to="/market-prices" className="ft-terminal-link">
                  <span>Full Mandi Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── 2. Live Available Farm Lots (Featuring authentic fruit photos) ── */}
      <section className="ft-section ft-border-top">
        <div className="ft-container">
          <div className="ft-section-topbar">
            <div>
              <div className="ft-section-kicker">Direct From Karnataka Orchards</div>
              <h2 className="ft-section-title">Verified Farm Harvest Lots Ready for Trade</h2>
              <p className="ft-section-lead">
                Certified quality lots listed directly by Karnataka farmers. No intermediary commission, genuine lot weights, and transparent pricing.
              </p>
            </div>
            <Link to="/buy" className="ft-button-outline shrink-0">
              <span>View All Available Lots</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="ft-produce-grid">
            {VERIFIED_LOTS.map((lot) => (
              <div key={lot.id} className="ft-produce-card">
                <div className="ft-produce-img-wrap">
                  <img
                    src={lot.image}
                    alt={`${lot.cropName} - ${lot.variety}`}
                    className="ft-produce-img"
                    loading="lazy"
                  />
                  <div className="ft-produce-tag">{lot.harvestTag}</div>
                </div>

                <div className="ft-produce-body">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      {lot.cropName}
                    </span>
                    <span className="ft-tabular text-sm font-semibold text-white">
                      {lot.unitPrice}
                    </span>
                  </div>

                  <h3 className="ft-produce-title">{lot.variety}</h3>

                  <div className="ft-produce-meta">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{lot.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-300 pt-2 border-t border-[#202b24]">
                      <span className="text-gray-400">Lot Weight:</span>
                      <span className="ft-tabular font-medium text-white">{lot.quantity}</span>
                    </div>
                  </div>

                  <div className="ft-produce-footer">
                    <div className="text-[11px] text-gray-400 truncate">
                      Farmer: <span className="text-gray-200">{lot.farmerName}</span>
                    </div>
                    <Link to="/buy" className="ft-produce-btn">
                      <span>Trade Lot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Platform Capabilities Matrix ── */}
      <section id="capabilities" className="ft-section ft-border-top bg-[#080d0b]">
        <div className="ft-container">
          <div className="ft-section-topbar">
            <div>
              <div className="ft-section-kicker">Core Architecture</div>
              <h2 className="ft-section-title">Built for Farmers, Mandis, and Bulk Buyers</h2>
              <p className="ft-section-lead">
                An integrated stack combining direct physical trading with certified APMC price discovery and machine learning crop intelligence.
              </p>
            </div>
          </div>

          <div className="ft-capabilities-grid">
            <div className="ft-capability-card">
              <div className="ft-capability-icon">
                <Store className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="ft-capability-title">Direct Harvest Spot Marketplace</h3>
              <p className="ft-capability-desc">
                List bulk lots across grains, pulses, fruits, and vegetables. Transact directly with verified hotels, supermarket chains, and food processors without commission agents.
              </p>
              <Link to="/buy" className="ft-capability-link">
                <span>Explore Live Produce Lots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="ft-capability-card">
              <div className="ft-capability-icon">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="ft-capability-title">APMC Mandi Intelligence Board</h3>
              <p className="ft-capability-desc">
                Daily arrivals, modal quotes, and minimum/maximum market rates recorded across key Karnataka APMC yards including Yeshwanthpur, Hubballi, and Belagavi.
              </p>
              <Link to="/market-prices" className="ft-capability-link">
                <span>Access Mandi Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="ft-capability-card">
              <div className="ft-capability-icon">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="ft-capability-title">Predictive Soil & Yield Advisory</h3>
              <p className="ft-capability-desc">
                Calibrated machine learning models tailored for Deccan plateau soils. Input Nitrogen, Phosphorus, Potassium, and soil pH to forecast viable crop yields.
              </p>
              <Link to="/login" className="ft-capability-link">
                <span>Run Crop Advisory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="ft-capability-card">
              <div className="ft-capability-icon">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="ft-capability-title">Agronomical Assistant & Support</h3>
              <p className="ft-capability-desc">
                Instant guidance on pest control measures, fertilizer application scheduling, organic treatments, and post-harvest storage standards.
              </p>
              <Link to="/login" className="ft-capability-link">
                <span>Open Agri Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Karnataka APMC Network Coverage ── */}
      <section id="apmc-network" className="ft-section ft-border-top">
        <div className="ft-container">
          <div className="ft-apmc-network-panel">
            <div className="ft-apmc-network-info">
              <div className="ft-section-kicker">State-Wide Price Transparency</div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">
                Karnataka APMC Yard Integration
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                Price transparency protects farmer margins. Before dispatching vehicles to mandi yards, verify real-time arrivals and modal prices across major districts.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="ft-stat-box">
                  <div className="ft-stat-value ft-tabular">30+</div>
                  <div className="ft-stat-label">Active APMC Reporting Yards</div>
                </div>
                <div className="ft-stat-box">
                  <div className="ft-stat-value ft-tabular">₹0</div>
                  <div className="ft-stat-label">Direct Trade Intermediary Cut</div>
                </div>
                <div className="ft-stat-box">
                  <div className="ft-stat-value ft-tabular">100%</div>
                  <div className="ft-stat-label">Verified Listing Auditing</div>
                </div>
                <div className="ft-stat-box">
                  <div className="ft-stat-value ft-tabular">Daily</div>
                  <div className="ft-stat-label">Price Bulletin Refresh</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/market-prices" className="ft-btn-primary">
                  <span>View All Karnataka Mandis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/signup" className="ft-button-outline">
                  <span>Register as Certified Trader</span>
                </Link>
              </div>
            </div>

            {/* Mandi Hubs */}
            <div className="ft-mandi-districts-card">
              <div className="ft-districts-header">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white text-sm">Key Monitored APMC Hubs</span>
              </div>
              <ul className="ft-districts-list">
                <li>
                  <span className="font-medium text-white">Bengaluru (Yeshwanthpur)</span>
                  <span className="text-xs text-gray-400">Vegetables, Grains & Pulses</span>
                </li>
                <li>
                  <span className="font-medium text-white">Kolar APMC</span>
                  <span className="text-xs text-gray-400">Asia's Premier Tomato Hub</span>
                </li>
                <li>
                  <span className="font-medium text-white">Hubballi-Dharwad (Amaragol)</span>
                  <span className="text-xs text-gray-400">Chilli, Cotton & Maize</span>
                </li>
                <li>
                  <span className="font-medium text-white">Mysuru (Bandipalya)</span>
                  <span className="text-xs text-gray-400">Paddy, Ragi & Jaggery</span>
                </li>
                <li>
                  <span className="font-medium text-white">Belagavi APMC</span>
                  <span className="text-xs text-gray-400">Vegetables & Inter-State Trade</span>
                </li>
                <li>
                  <span className="font-medium text-white">Shivamogga & Channagiri</span>
                  <span className="text-xs text-gray-400">Arecanut, Pepper & Spices</span>
                </li>
                <li>
                  <span className="font-medium text-white">Vijayapura APMC</span>
                  <span className="text-xs text-gray-400">Pomegranate, Grapes & Lemon</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Institutional Footer ── */}
      <footer className="ft-footer ft-border-top">
        <div className="ft-container">
          <div className="ft-footer-grid">
            <div className="ft-footer-brand">
              <div className="flex items-center gap-2 mb-2">
                <div className="ft-nav-logo-badge">
                  <Scale className="w-4 h-4 text-emerald-500" strokeWidth={2.2} />
                </div>
                <span className="text-lg font-semibold text-white tracking-tight">Farmer Trades</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm mb-4">
                The institutional marketplace empowering Karnataka's agricultural economy. Connecting verified growers directly with commercial procurement partners.
              </p>
              <div className="text-[11px] text-gray-500">
                Registered under Karnataka Agricultural Trade Initiatives.
              </div>
            </div>

            <div className="ft-footer-col">
              <h4 className="ft-footer-heading">Marketplace</h4>
              <ul className="ft-footer-links">
                <li><Link to="/buy">Live Produce Lots</Link></li>
                <li><Link to="/crops">Crop Directory</Link></li>
                <li><Link to="/market-prices">APMC Mandi Rates</Link></li>
                <li><Link to="/signup">Farmer Registration</Link></li>
              </ul>
            </div>

            <div className="ft-footer-col">
              <h4 className="ft-footer-heading">Advisory & AI</h4>
              <ul className="ft-footer-links">
                <li><Link to="/login">Soil Analysis Engine</Link></li>
                <li><Link to="/login">Yield Forecasts</Link></li>
                <li><Link to="/login">Agronomist Chatbot</Link></li>
                <li><Link to="/market-prices">Price Fluctuation History</Link></li>
              </ul>
            </div>

            <div className="ft-footer-col">
              <h4 className="ft-footer-heading">Compliance & Help</h4>
              <ul className="ft-footer-links">
                <li><Link to="/terms">Terms of Trade</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/refund-policy">Settlement & Refund Rules</Link></li>
                <li><Link to="/contact">District Helpdesk</Link></li>
                <li><Link to="/admin/login">APMC Admin Portal</Link></li>
              </ul>
            </div>
          </div>

          <div className="ft-footer-bottom">
            <div className="text-xs text-gray-400">
              © {new Date().getFullYear()} Farmer Trades Inc. Direct Farmer-to-Buyer Marketplace & Mandi Intelligence. All rights reserved.
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span>Karnataka APMC Agmarknet Integrated</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FarmerTradesHero;
