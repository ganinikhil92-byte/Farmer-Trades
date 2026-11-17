import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Menu, X, ArrowRight } from 'lucide-react';

interface LandingNavbarProps {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LandingNavbar: React.FC<LandingNavbarProps> = ({
  menuOpen,
  setMenuOpen,
}) => {
  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, [setMenuOpen]);

  return (
    <header className="ft-landing-nav" role="banner">
      <div className="ft-nav-inner">
        {/* ── Brand Logo ── */}
        <Link to="/" className="ft-nav-brand" aria-label="Farmer Trades Home">
          <div className="ft-nav-logo-badge">
            <Sprout className="w-5 h-5 text-emerald-500" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="ft-nav-brand-title">Farmer Trades</span>
            <span className="ft-nav-brand-sub">Karnataka Agri Exchange</span>
          </div>
        </Link>

        {/* ── Desktop Navigation Links ── */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
          <Link to="/buy" className="ft-nav-link">
            Produce Marketplace
          </Link>
          <Link to="/market-prices" className="ft-nav-link">
            APMC Mandi Rates
          </Link>
          <Link to="/crops" className="ft-nav-link">
            Crop Directory
          </Link>
          <a href="#apmc-network" className="ft-nav-link">
            Mandi Coverage
          </a>
        </nav>

        {/* ── Desktop CTAs ── */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="ft-nav-btn-secondary">
            Sign In
          </Link>
          <Link to="/signup" className="ft-nav-btn-primary">
            <span>Join Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── Mobile Hamburger Toggle ── */}
        <button
          type="button"
          className="md:hidden ft-nav-hamburger"
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-5 h-5 text-gray-200" /> : <Menu className="w-5 h-5 text-gray-200" />}
        </button>
      </div>
    </header>
  );
};

export default LandingNavbar;
