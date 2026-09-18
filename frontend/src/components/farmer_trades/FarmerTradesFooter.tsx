import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import './FarmerTradesFooter.css';

export default function FarmerTradesFooter() {
  return (
    <footer className="ft-footer" role="contentinfo">
      <div className="ft-footer-container">
        {/* Brand Column */}
        <div className="ft-footer-col">
          <div className="ft-footer-brand-title">
            <Sprout size={24} color="#22c55e" />
            <span>Farmer<span>Trades</span></span>
          </div>
          <p className="ft-footer-desc">
            India’s dedicated agricultural marketplace connecting verified farmers directly with wholesale buyers, retailers, and food processors with zero middleman commissions.
          </p>
          <div className="ft-footer-badge">
            <ShieldCheck size={14} />
            <span>Government APMC & e-NAM Compliant</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="ft-footer-col">
          <h4>Marketplace</h4>
          <ul>
            <li><Link to="/">Home Overview</Link></li>
            <li><Link to="/buy">Buy Produce</Link></li>
            <li><Link to="/sell">Sell Your Harvest</Link></li>
            <li><Link to="/farmers">Farmers Directory</Link></li>
            <li><Link to="/crops">Crop Encyclopedia</Link></li>
            <li><Link to="/market-prices">Mandi Price Trends</Link></li>
            <li><Link to="/favorites">Saved Favorites</Link></li>
          </ul>
        </div>

        {/* Agricultural Services */}
        <div className="ft-footer-col">
          <h4>Agri Services</h4>
          <ul>
            <li><Link to="/farmer/soil-test">Soil Health Testing</Link></li>
            <li><Link to="/farmer/chatbot">AI Crop Doctor</Link></li>
            <li><Link to="/farmer/weather">Weather Radar</Link></li>
            <li><Link to="/farmer/apmc">APMC Mandi Yards</Link></li>
            <li><Link to="/farmer/recommend-fertilizer">Fertilizer Calculator</Link></li>
            <li><Link to="/farmer/news">Agri News & Schemes</Link></li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div className="ft-footer-col">
          <h4>Helpline & Support</h4>
          <div className="ft-footer-contact-item">
            <MapPin size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Karnataka Agro Trades Hub, APMC Yard, Yeshwanthpur, Bengaluru - 560022</span>
          </div>
          <div className="ft-footer-contact-item">
            <Phone size={16} color="#22c55e" style={{ flexShrink: 0 }} />
            <span>Toll-Free Farmer Kisan Helpline: 1800-180-1551</span>
          </div>
          <div className="ft-footer-contact-item">
            <Mail size={16} color="#22c55e" style={{ flexShrink: 0 }} />
            <span>support@farmertrades.in</span>
          </div>
        </div>
      </div>

      <div className="ft-footer-bottom">
        <div>
          © {new Date().getFullYear()} Farmer Trades India. All rights reserved. Prices indicated are APMC reference modal rates.
        </div>

        <div className="ft-footer-legal-links">
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/refund-policy">Refund & Return Policy</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
}
