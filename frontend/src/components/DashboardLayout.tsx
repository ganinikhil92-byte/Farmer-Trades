import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import AgriAiWidget from './AgriAiWidget';
import {
  Sprout,
  LogOut,
  LayoutDashboard,
  Wheat,
  ShoppingCart,
  Package,
  MapPin,
  Brain,
  TrendingUp,
  CloudRain,
  Bot,
  Newspaper,
  User,
  Users,
  ShoppingBag,
  History,
  Shield,
  ClipboardList,
  FlaskConical,
  ChevronDown,
  BarChart3
} from 'lucide-react';
import './DashboardLayout.css';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DropdownItem {
  label: string;
  path: string;
  icon: string;
  description: string;
}

interface FarmerNavItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

const farmerNavItems: FarmerNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/farmer', icon: <LayoutDashboard size={17} /> },
  {
    id: 'trade',
    label: 'Trade',
    path: '/farmer/trade',
    icon: <Wheat size={17} />,
    hasDropdown: true,
    dropdownItems: [
      { label: 'Crop Trade', path: '/farmer/trade?category=crop', icon: '🌾', description: 'List grain & cereal crops' },
      { label: 'Vegetable Trade', path: '/farmer/trade?category=vegetable', icon: '🥕', description: 'List fresh vegetables & greens' },
      { label: 'Fruit Trade', path: '/farmer/trade?category=fruit', icon: '🍎', description: 'List orchard harvest & fruits' },
    ],
  },
  {
    id: 'stocks',
    label: 'Stocks',
    path: '/farmer/stocks',
    icon: <Package size={17} />,
    hasDropdown: true,
    dropdownItems: [
      { label: 'Crop Stock', path: '/farmer/stocks?category=crop', icon: '🌾', description: 'Cereal, wheat & grain inventory' },
      { label: 'Vegetable Stock', path: '/farmer/stocks?category=vegetable', icon: '🥕', description: 'Vegetable & greens inventory' },
      { label: 'Fruit Stock', path: '/farmer/stocks?category=fruit', icon: '🍎', description: 'Fruits & harvest inventory' },
    ],
  },
  { id: 'history', label: 'Selling History', path: '/farmer/history', icon: <History size={17} /> },
  { id: 'apmc', label: 'Nearest APMC', path: '/farmer/apmc', icon: <MapPin size={17} /> },
  { id: 'soil-test', label: 'Soil Test', path: '/farmer/soil-test', icon: <FlaskConical size={17} /> },
  { id: 'prediction', label: 'Crop Prediction', path: '/farmer/predict-crop', icon: <Brain size={17} /> },
  { id: 'yield-prediction', label: 'Yield Prediction', path: '/farmer/predict-yield', icon: <BarChart3 size={17} /> },
  { id: 'fertilizer', label: 'Fertilizer Guide', path: '/farmer/recommend-fertilizer', icon: <TrendingUp size={17} /> },
  { id: 'chatbot', label: 'Agri Chat Bot', path: '/farmer/chatbot', icon: <Bot size={17} /> },
  { id: 'weather', label: 'Weather', path: '/farmer/weather', icon: <CloudRain size={17} /> },
  { id: 'news', label: 'News Feed', path: '/farmer/news', icon: <Newspaper size={17} /> },
  { id: 'profile', label: 'Profile', path: '/farmer/profile', icon: <User size={17} /> },
];

const navMap: Record<string, NavItem[]> = {
  admin: [
    { label: 'Admin Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Manage Farmers', path: '/admin/farmers', icon: <Users size={18} /> },
    { label: 'Manage Buyers', path: '/admin/customers', icon: <ShoppingBag size={18} /> },
    { label: 'Soil Test Requests', path: '/admin/soil-tests', icon: <FlaskConical size={18} /> },
    { label: 'Admin Profile', path: '/admin/profile', icon: <Shield size={18} /> },
  ],
  buyer: [
    { label: 'Dashboard', path: '/buyer', icon: <LayoutDashboard size={18} /> },
    { label: 'Buy', path: '/buyer/buy', icon: <ShoppingCart size={18} /> },
    { label: 'My Cart', path: '/buyer/cart', icon: <ShoppingBag size={18} /> },
    { label: 'My Orders', path: '/buyer/orders', icon: <ClipboardList size={18} /> },
    { label: 'Customer Profile', path: '/buyer/profile', icon: <User size={18} /> },
  ],
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when location changes or when clicked outside
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  /* ─────────────────────────────────────────────────────────────
     FARMER VIEW: Sleek Horizontal Top Navigation (Extra Space)
     ───────────────────────────────────────────────────────────── */
  if (user.role === 'farmer') {
    return (
      <div className="farmer-dashboard-layout">
        {/* Horizontal Navigation Header */}
        <header className="farmer-top-navbar" ref={dropdownContainerRef}>
          {/* Top Brand & Profile Bar */}
          <div className="farmer-nav-top-row">
            <Link to="/farmer" className="farmer-brand-badge" aria-label="Agro Trades Farmer Portal">
              <div className="farmer-brand-icon-wrap">
                <Sprout size={22} className="farmer-brand-icon" />
              </div>
              <div className="farmer-brand-titles">
                <span className="farmer-brand-name">Agro Trades</span>
                <span className="farmer-brand-sub">Farmer Portal</span>
              </div>
            </Link>

            {/* Right: User Profile + Sign Out */}
            <div className="farmer-profile-actions">
              <div className="farmer-user-pill">
                <div className="farmer-avatar-circle">{user.name ? user.name.charAt(0).toUpperCase() : 'F'}</div>
                <div className="farmer-user-details">
                  <span className="farmer-user-fullname">{user.name || 'Farmer'}</span>
                  <span className="farmer-user-tag">🌾 Verified Farmer</span>
                </div>
              </div>
              <button type="button" onClick={logout} className="farmer-btn-signout" title="Sign out of portal">
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Horizontal Options Menu Bar */}
          <nav className="farmer-horizontal-menu-bar" role="navigation" aria-label="Farmer Navigation">
            <div className="farmer-horizontal-menu-list">
              {farmerNavItems.map((item) => {
                const isStocksActive =
                  item.id === 'stocks' &&
                  (location.pathname === '/farmer/stocks' ||
                    location.pathname === '/farmer/crop-stocks' ||
                    location.pathname === '/farmer/vegetable-stocks' ||
                    location.pathname === '/farmer/fruit-stocks');

                const isTradeActive = item.id === 'trade' && location.pathname === '/farmer/trade';
                const isCurrentActive =
                  isStocksActive || isTradeActive || (!item.hasDropdown && location.pathname === item.path);

                const isDropdownOpen = activeDropdown === item.id;

                if (item.hasDropdown && item.dropdownItems) {
                  return (
                    <div
                      key={item.id}
                      className={`farmer-nav-dropdown-wrapper ${isDropdownOpen ? 'open' : ''}`}
                      onMouseEnter={() => setActiveDropdown(item.id)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <Link
                        to={item.path}
                        className={`farmer-horizontal-link ${isCurrentActive ? 'active' : ''}`}
                        onClick={() => setActiveDropdown(null)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        <ChevronDown
                          size={14}
                          className={`farmer-dropdown-chevron ${isDropdownOpen ? 'rotate' : ''}`}
                        />
                      </Link>

                      {/* Dropdown Menu Panel */}
                      {isDropdownOpen && (
                        <div className="farmer-nav-dropdown-menu animate-fadeIn">
                          <div className="farmer-dropdown-header">
                            <span>{item.label === 'Stocks' ? 'Produce Stocks' : 'Trade Produce'} Options</span>
                          </div>
                          {item.dropdownItems.map((sub) => (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              className="farmer-dropdown-item"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <span className="farmer-dropdown-item-icon">{sub.icon}</span>
                              <div className="farmer-dropdown-item-text">
                                <span className="farmer-dropdown-item-title">{sub.label}</span>
                                <span className="farmer-dropdown-item-desc">{sub.description}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`farmer-horizontal-link ${isCurrentActive ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </header>

        {/* Full-width Main Content Area (No sidebar taking up space) */}
        <main className="farmer-dashboard-main">
          <div className="farmer-dashboard-content animate-fadeIn">
            {children}
          </div>
        </main>

        {/* Floating Agri-AI Assistant */}
        <AgriAiWidget />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     BUYER VIEW: Sleek Horizontal Top Navigation (Extra Space)
     ───────────────────────────────────────────────────────────── */
  if (user.role === 'buyer') {
    const buyerItems: NavItem[] = [
      { label: 'Dashboard', path: '/buyer', icon: <LayoutDashboard size={17} /> },
      { label: 'Buy', path: '/buyer/buy', icon: <ShoppingCart size={17} /> },
      { label: 'My Cart', path: '/buyer/cart', icon: <ShoppingBag size={17} /> },
      { label: 'My Orders', path: '/buyer/orders', icon: <ClipboardList size={17} /> },
      { label: 'Customer Profile', path: '/buyer/profile', icon: <User size={17} /> },
    ];

    return (
      <div className="farmer-dashboard-layout">
        {/* Horizontal Navigation Header */}
        <header className="farmer-top-navbar">
          {/* Top Brand & Profile Bar */}
          <div className="farmer-nav-top-row">
            <Link to="/buyer" className="farmer-brand-badge" aria-label="Agro Trades Buyer Portal">
              <div className="farmer-brand-icon-wrap">
                <Sprout size={22} className="farmer-brand-icon" />
              </div>
              <div className="farmer-brand-titles">
                <span className="farmer-brand-name">Agro Trades</span>
                <span className="farmer-brand-sub">Buyer Portal</span>
              </div>
            </Link>

            {/* Right: User Profile + Sign Out */}
            <div className="farmer-profile-actions">
              <div className="farmer-user-pill">
                <div className="farmer-avatar-circle" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'B'}
                </div>
                <div className="farmer-user-details">
                  <span className="farmer-user-fullname">{user.name || 'Buyer'}</span>
                  <span className="farmer-user-tag">🛒 Verified Buyer</span>
                </div>
              </div>
              <button type="button" onClick={logout} className="farmer-btn-signout" title="Sign out of portal">
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Horizontal Options Menu Bar */}
          <nav className="farmer-horizontal-menu-bar" role="navigation" aria-label="Buyer Navigation">
            <div className="farmer-horizontal-menu-list">
              {buyerItems.map((item) => {
                const isCurrentActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`farmer-horizontal-link ${isCurrentActive ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </header>

        {/* Full-width Main Content Area */}
        <main className="farmer-dashboard-main">
          <div className="farmer-dashboard-content animate-fadeIn">
            {children}
          </div>
        </main>

        {/* Floating Agri-AI Assistant */}
        <AgriAiWidget />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     ADMIN VIEW: Standard Vertical Sidebar Layout
     ───────────────────────────────────────────────────────────── */
  const items = navMap[user.role] || [];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Sprout size={24} />
          <span>Agro Trades</span>
        </div>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <Link key={item.path} to={item.path} className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user.name.charAt(0)}</div>
            <div>
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role badge badge-green">{user.role}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={logout} style={{ width: '100%', marginTop: '0.75rem' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <div className="dashboard-content animate-fadeIn">
          {children}
        </div>
      </main>

      {/* Floating Google AI Studio Agri-Copilot Widget */}
      <AgriAiWidget />
    </div>
  );
}

