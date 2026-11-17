import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react';

const HeroActions: React.FC = () => {
  return (
    <div className="ft-hero-actions-container">
      <div className="ft-hero-cta-buttons">
        <Link
          to="/buy"
          className="ft-btn-primary"
          title="Browse live farm produce lots across Karnataka"
        >
          <span>Explore Farm Lots</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/market-prices"
          className="ft-btn-secondary"
          title="View today's live APMC mandi prices and modal rates"
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Today's Mandi Rates</span>
        </Link>
      </div>

      <div className="ft-hero-roles-bar">
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Direct Trade Guarantee</span>
        </div>
        <span className="text-gray-600 hidden sm:inline">•</span>
        <Link to="/signup" className="ft-hero-role-link">
          List Harvest as Farmer →
        </Link>
        <span className="text-gray-600 hidden sm:inline">•</span>
        <Link to="/signup" className="ft-hero-role-link">
          Procure as Wholesale Buyer →
        </Link>
      </div>
    </div>
  );
};

export default HeroActions;
