import React from 'react';
import { Link } from 'react-router-dom';
import { X, Sprout, Store, TrendingUp, BookOpen, MapPin, ArrowRight } from 'lucide-react';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="ft-mobile-menu-overlay" role="dialog" aria-modal="true" aria-label="Navigation Menu">
      <div className="ft-mobile-menu-header">
        <div className="flex items-center gap-2.5">
          <div className="ft-nav-logo-badge">
            <Sprout className="w-5 h-5 text-emerald-500" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white tracking-tight text-base">Farmer Trades</span>
            <span className="text-[11px] text-gray-400">Karnataka Agri Exchange</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="ft-mobile-menu-links">
        <Link to="/buy" className="ft-mobile-nav-item" onClick={onClose}>
          <Store className="w-5 h-5 text-emerald-400" />
          <span>Produce Marketplace</span>
        </Link>
        <Link to="/market-prices" className="ft-mobile-nav-item" onClick={onClose}>
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>APMC Mandi Rates</span>
        </Link>
        <Link to="/crops" className="ft-mobile-nav-item" onClick={onClose}>
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <span>Crop Directory</span>
        </Link>
        <a href="#apmc-network" className="ft-mobile-nav-item" onClick={onClose}>
          <MapPin className="w-5 h-5 text-emerald-400" />
          <span>Mandi Coverage</span>
        </a>
      </nav>

      <div className="ft-mobile-menu-footer">
        <Link
          to="/login"
          className="ft-nav-btn-secondary w-full text-center py-2.5 block text-sm"
          onClick={onClose}
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="ft-nav-btn-primary w-full text-center py-2.5 flex items-center justify-center gap-2 text-sm"
          onClick={onClose}
        >
          <span>Join Platform Free</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default MobileMenu;
