import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/landing.css';
import LandingNavbar from './LandingNavbar';
import MobileMenu from './MobileMenu';
import HeroActions from './HeroActions';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useVideoScrub } from '../../hooks/useVideoScrub';

/* ── Hero Video Constant ── */
const HERO_VIDEO_SRC = '/videos/farmer-trades-hero.mp4';

const TYPEWRITER_TEXT =
  'Predict smarter. Trade directly. Discover better markets. Farmer Trades unites agricultural intelligence, real-time APMC mandi prices, and direct farmer-to-buyer commerce.';

const FarmerTradesHero: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── Mouse-scrub video interaction ── */
  useVideoScrub(videoRef);

  /* ── Typewriter headline ── */
  const { displayed, done } = useTypewriter({
    text: TYPEWRITER_TEXT,
    speed: 32,
    startDelay: 450,
  });

  return (
    <div className="relative w-full bg-[#03120c] text-white selection:bg-emerald-500 selection:text-white">
      {/* ── Background Media: Video with Fallback Cinematic Poster ── */}
      <div className="ft-hero-bg-wrapper">
        <video
          ref={videoRef}
          className="ft-hero-video"
          muted
          playsInline
          preload="auto"
          poster="/farmer_hero_bg.jpg"
          aria-hidden="true"
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
        <div
          className="ft-hero-bg-fallback"
          style={{
            backgroundImage: "url('/farmer_hero_bg.jpg')",
          }}
          aria-hidden="true"
        />
        <div className="ft-hero-overlay" aria-hidden="true" />
      </div>

      {/* ── Floating Glassmorphism Navbar ── */}
      <LandingNavbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* ── Mobile Navigation Drawer ── */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Fullscreen Hero Viewport ── */}
      <main className="ft-hero-main">
        <div className="ft-hero-content-box">
          {/* 1. Blurred Gentle Intro Label */}
          <p className="ft-hero-intro">
            Hey there, welcome to <span className="text-white font-semibold">Farmer Trades</span>,
            <br />
            where smarter farming meets direct market access.
          </p>

          {/* 2. Dynamic Typewriter Headline */}
          <h1 className="ft-hero-typewriter">
            {displayed}
            {!done && <span className="typewriter-cursor" aria-hidden="true" />}
          </h1>

          {/* 3. Action Pills Row */}
          <HeroActions />
        </div>

        {/* 4. Live Platform Stats Bar */}
        <div className="ft-hero-stats-bar">
          <div className="ft-hero-stat-item">
            <span className="ft-hero-stat-number">0% Middlemen</span>
            <span className="ft-hero-stat-label">Direct farmer-to-buyer deals</span>
          </div>
          <div className="ft-hero-stat-item">
            <span className="ft-hero-stat-number">30+ APMC</span>
            <span className="ft-hero-stat-label">Live Karnataka mandi updates</span>
          </div>
          <div className="ft-hero-stat-item">
            <span className="ft-hero-stat-number">98.4%</span>
            <span className="ft-hero-stat-label">AI Crop & Yield accuracy</span>
          </div>
          <div className="ft-hero-stat-item">
            <span className="ft-hero-stat-number">₹0 Brokerage</span>
            <span className="ft-hero-stat-label">Keep 100% of your harvest profit</span>
          </div>
        </div>
      </main>

      {/* ── Platform Features Section ── */}
      <section id="features" className="ft-landing-section">
        <div className="ft-section-container">
          <div className="ft-section-header">
            <div className="ft-section-badge">Platform Capabilities</div>
            <h2 className="ft-section-title">Everything Modern Agriculture Needs</h2>
            <p className="ft-section-subtitle">
              Built specifically for farmers, produce buyers, and agricultural traders.
              Eliminating intermediaries while putting actionable intelligence into farmers&apos; hands.
            </p>
          </div>

          <div className="ft-features-grid">
            {/* Feature 1 */}
            <div className="ft-feature-card">
              <div className="ft-feature-icon-wrap">🌾</div>
              <h3 className="ft-feature-card-title">Direct Crop Marketplace</h3>
              <p className="ft-feature-card-desc">
                List and trade grains, vegetables, and fruits directly. Connect with certified wholesale buyers,
                hotels, and retailers with zero commission fees.
              </p>
              <Link to="/buy" className="ft-feature-card-link">
                Explore Produce Lots →
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="ft-feature-card">
              <div className="ft-feature-icon-wrap">🤖</div>
              <h3 className="ft-feature-card-title">AI Crop Prediction</h3>
              <p className="ft-feature-card-desc">
                Input your region, soil Nitrogen (N), Phosphorus (P), Potassium (K), and pH levels.
                Our trained ML models calculate the most lucrative and resilient crops.
              </p>
              <Link to="/login" className="ft-feature-card-link">
                Start Crop Prediction →
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="ft-feature-card">
              <div className="ft-feature-icon-wrap">📈</div>
              <h3 className="ft-feature-card-title">APMC Mandi Intelligence</h3>
              <p className="ft-feature-card-desc">
                Track daily APMC market prices across Karnataka districts. Know whether prices are rising
                before heading to the nearest market.
              </p>
              <Link to="/market-prices" className="ft-feature-card-link">
                View Mandi Rates →
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="ft-feature-card">
              <div className="ft-feature-icon-wrap">💬</div>
              <h3 className="ft-feature-card-title">24/7 Agri AI ChatBot</h3>
              <p className="ft-feature-card-desc">
                Ask agronomical questions in real-time. Get instant advice on fertilizer ratios, organic pesticides,
                irrigation scheduling, and disease diagnosis.
              </p>
              <Link to="/login" className="ft-feature-card-link">
                Ask AI Assistant →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Predictions Deep-Dive Section ── */}
      <section id="predictions" className="ft-landing-section" style={{ background: '#02160e' }}>
        <div className="ft-section-container">
          <div className="ft-section-header">
            <div className="ft-section-badge">Predictive Intelligence</div>
            <h2 className="ft-section-title">Machine Learning for Higher Yields</h2>
            <p className="ft-section-subtitle">
              Replace guesswork with verified scientific models calibrated for Indian climate zones and soil profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="ft-feature-card">
              <div className="text-3xl mb-3">🧪</div>
              <h4 className="text-xl font-bold mb-2">Soil Testing & Diagnostics</h4>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                Schedule official soil tests, upload lab reports, and receive tailored organic and chemical fertilizer ratios.
              </p>
              <button
                type="button"
                className="ft-hero-pill ft-hero-pill-emerald text-sm mt-auto w-fit"
                onClick={() => navigate('/login')}
              >
                Schedule Soil Test
              </button>
            </div>

            <div className="ft-feature-card">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="text-xl font-bold mb-2">Yield Estimation</h4>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                Forecast expected harvest tonnage based on farm acreage, seasonal rainfall anomalies, and crop variety.
              </p>
              <button
                type="button"
                className="ft-hero-pill ft-hero-pill-white text-sm mt-auto w-fit"
                onClick={() => navigate('/login')}
              >
                Forecast Harvest
              </button>
            </div>

            <div className="ft-feature-card">
              <div className="text-3xl mb-3">🌦️</div>
              <h4 className="text-xl font-bold mb-2">Hyper-Local Weather</h4>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                7-day precision forecasts with humidity, precipitation chance, and frost alerts customized for your taluk.
              </p>
              <button
                type="button"
                className="ft-hero-pill ft-hero-pill-outline text-sm mt-auto w-fit"
                onClick={() => navigate('/login')}
              >
                Check Forecast
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── APMC Mandi Showcase Section ── */}
      <section id="apmc" className="ft-landing-section">
        <div className="ft-section-container">
          <div className="ft-apmc-box">
            <div className="ft-apmc-info">
              <div className="ft-section-badge">Live Market Rates</div>
              <h3>Empowering Farmers with Transparent Mandi Prices</h3>
              <p>
                Get real-time rates directly from APMC yards across Karnataka including Yeshwanthpur, Hubli, Mysuru,
                Belagavi, and Kolar. Never sell below true market value again.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/market-prices" className="ft-hero-pill ft-hero-pill-emerald">
                  View All Mandi Prices
                </Link>
                <Link to="/buy" className="ft-hero-pill ft-hero-pill-white">
                  Direct Buy Lots
                </Link>
              </div>
            </div>

            <div className="ft-mandi-chips-grid">
              <div className="ft-mandi-chip">
                <span className="ft-mandi-chip-name">🍅 Tomato (Hybrid)</span>
                <span className="ft-mandi-chip-price">₹1,850 / qtl</span>
              </div>
              <div className="ft-mandi-chip">
                <span className="ft-mandi-chip-name">🧅 Onion (Nashik Red)</span>
                <span className="ft-mandi-chip-price">₹2,400 / qtl</span>
              </div>
              <div className="ft-mandi-chip">
                <span className="ft-mandi-chip-name">🌾 Ragi (Finger Millet)</span>
                <span className="ft-mandi-chip-price">₹3,450 / qtl</span>
              </div>
              <div className="ft-mandi-chip">
                <span className="ft-mandi-chip-name">🥔 Potato (Jyoti)</span>
                <span className="ft-mandi-chip-price">₹1,650 / qtl</span>
              </div>
              <div className="ft-mandi-chip">
                <span className="ft-mandi-chip-name">🌽 Maize (Kharif)</span>
                <span className="ft-mandi-chip-price">₹2,100 / qtl</span>
              </div>
              <div className="ft-mandi-chip">
                <span className="ft-mandi-chip-name">🥥 Arecanut (Chali)</span>
                <span className="ft-mandi-chip-price">₹48,500 / qtl</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="ft-landing-footer">
        <div className="ft-footer-inner">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">Farmer Trades</span>
            <span className="text-emerald-400 text-lg">✳︎</span>
          </div>

          <div className="ft-footer-links">
            <Link to="/buy">Produce Marketplace</Link>
            <Link to="/crops">All Crops</Link>
            <Link to="/market-prices">APMC Mandi Rates</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/refund-policy">Refund Policy</Link>
            <Link to="/contact">Contact Support</Link>
            <Link to="/admin/login">Admin Portal</Link>
          </div>

          <p className="text-xs text-gray-400 m-0">
            © 2026 Farmer Trades — Smart Agricultural Crop Prediction and Direct Trading Platform. Empowering Karnataka&apos;s Farmers & Mandis.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FarmerTradesHero;
