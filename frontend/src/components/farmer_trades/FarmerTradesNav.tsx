import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  Heart,
  Bell,
  User,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Package,
  TrendingUp,
  Search
} from 'lucide-react';
import { getFavorites, getUnreadNotificationsCount } from '../../utils/farmerTradesStore';
import AuthModal from './AuthModal';
import './FarmerTradesNav.css';

interface NavProps {
  onOpenAuthModal?: () => void;
}

export default function FarmerTradesNav({}: NavProps = {}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authIntendedAction, setAuthIntendedAction] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [favCount, setFavCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync favorites & notification counts
  useEffect(() => {
    function updateCounts() {
      const favs = getFavorites();
      setFavCount(favs.listings.length + favs.crops.length + favs.farmers.length);
      setUnreadNotifs(getUnreadNotificationsCount());
    }
    updateCounts();
    window.addEventListener('storage', updateCounts);
    return () => window.removeEventListener('storage', updateCounts);
  }, [location.pathname]);

  // Outside click for user menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Buy Produce', path: '/buy' },
    { label: 'Sell Produce', path: '/sell' },
    { label: 'Farmers', path: '/farmers' },
    { label: 'All Crops', path: '/crops' },
    { label: 'Market Prices', path: '/market-prices' },
  ];

  function handleSellClick(e: React.MouseEvent) {
    if (!user) {
      e.preventDefault();
      setAuthIntendedAction('Sign in or register to publish farmer produce lots.');
      setAuthModalOpen(true);
    }
  }

  const userDashboardPath = user ? (user.role === 'admin' ? '/admin' : user.role === 'buyer' ? '/buyer' : '/farmer') : '/login';

  return (
    <>
      <header className="ft-navbar" role="banner">
        <div className="ft-nav-container">
          {/* Logo Branding */}
          <Link to="/" className="ft-nav-brand" title="Farmer Trades">
            <div className="ft-brand-icon">
              <Sprout size={24} />
            </div>
            <div className="ft-brand-text">
              <span className="ft-brand-title">
                Farmer<span>Trades</span>
              </span>
              <span className="ft-brand-subtitle">India's Agri Marketplace</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="ft-nav-links" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={item.path === '/sell' ? handleSellClick : undefined}
                  className={`ft-nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="ft-nav-actions">
            {/* Favorites Icon */}
            <Link to="/favorites" className="ft-action-btn" title="Saved Favorites" aria-label="Favorites">
              <Heart size={19} />
              {favCount > 0 && <span className="ft-badge-count">{favCount}</span>}
            </Link>

            {/* Notifications Bell */}
            <Link to="/notifications" className="ft-action-btn" title="Notifications" aria-label="Notifications">
              <Bell size={19} />
              {unreadNotifs > 0 && <span className="ft-badge-count">{unreadNotifs}</span>}
            </Link>

            {/* User State */}
            {user ? (
              <div className="ft-user-menu-wrap" ref={userMenuRef}>
                <button
                  type="button"
                  className="ft-user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                >
                  <div className="ft-user-avatar">{user.name.charAt(0)}</div>
                  <span>{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </button>

                {userDropdownOpen && (
                  <div className="ft-user-dropdown" role="menu">
                    <div className="ft-dropdown-header">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span className="badge badge-green" style={{ display: 'inline-block', marginTop: '4px' }}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    <Link
                      to={userDashboardPath}
                      className="ft-dropdown-item"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <LayoutDashboard size={15} />
                      <span>{user.role === 'admin' ? 'Admin Control' : `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`}</span>
                    </Link>

                    {user.role === 'farmer' && (
                      <Link
                        to="/farmer/stocks"
                        className="ft-dropdown-item"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Package size={15} />
                        <span>My Produce Stocks</span>
                      </Link>
                    )}

                    {user.role === 'buyer' && (
                      <Link
                        to="/buyer/orders"
                        className="ft-dropdown-item"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <ShoppingBag size={15} />
                        <span>My Purchase Orders</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      className="ft-dropdown-item logout"
                      role="menuitem"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="ft-btn-login"
                  onClick={() => {
                    setAuthIntendedAction('');
                    setAuthModalOpen(true);
                  }}
                >
                  Sign In
                </button>

                <Link to="/sell" onClick={handleSellClick} className="ft-btn-sell">
                  <PlusCircle size={16} />
                  <span>Sell Crop</span>
                </Link>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="ft-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              background: '#ffffff',
              borderTop: '1px solid #e5e7eb',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (item.path === '/sell') handleSellClick(e);
                }}
                className={`ft-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                style={{ padding: '0.65rem 1rem' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        intendedActionNotice={authIntendedAction}
      />
    </>
  );
}
