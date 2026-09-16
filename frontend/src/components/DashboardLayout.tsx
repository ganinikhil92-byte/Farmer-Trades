import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  Sprout,
  LogOut,
  LayoutDashboard,
  Wheat,
  Carrot,
  Apple,
  ShoppingCart,
  Package,
  MapPin,
  Brain,
  BarChart3,
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
  FlaskConical
} from 'lucide-react';
import './DashboardLayout.css';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const navMap: Record<string, NavItem[]> = {
  admin: [
    { label: 'Admin Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Manage Farmers', path: '/admin/farmers', icon: <Users size={18} /> },
    { label: 'Manage Buyers', path: '/admin/customers', icon: <ShoppingBag size={18} /> },
    { label: 'Soil Test Requests', path: '/admin/soil-tests', icon: <FlaskConical size={18} /> },
    { label: 'Admin Profile', path: '/admin/profile', icon: <Shield size={18} /> },
  ],
  farmer: [
    { label: 'Dashboard', path: '/farmer', icon: <LayoutDashboard size={18} /> },
    { label: 'Trade', path: '/farmer/trade', icon: <Wheat size={18} /> },
    { label: 'Crop Stocks', path: '/farmer/stocks', icon: <Package size={18} /> },
    { label: 'Vegetable Stocks', path: '/farmer/vegetable-stocks', icon: <Carrot size={18} /> },
    { label: 'Fruit Stocks', path: '/farmer/fruit-stocks', icon: <Apple size={18} /> },
    { label: 'Selling History', path: '/farmer/history', icon: <History size={18} /> },
    { label: 'Nearest APMC', path: '/farmer/apmc', icon: <MapPin size={18} /> },
    { label: 'Soil Test', path: '/farmer/soil-test', icon: <FlaskConical size={18} /> },
    { label: 'Crop Prediction', path: '/farmer/predict-crop', icon: <Brain size={18} /> },
    { label: 'Yield Prediction', path: '/farmer/predict-yield', icon: <BarChart3 size={18} /> },
    { label: 'Fertilizer Guide', path: '/farmer/recommend-fertilizer', icon: <TrendingUp size={18} /> },
    { label: 'Agri Chat Bot', path: '/farmer/chatbot', icon: <Bot size={18} /> },
    { label: 'Weather Forecast', path: '/farmer/weather', icon: <CloudRain size={18} /> },
    { label: 'News Feed', path: '/farmer/news', icon: <Newspaper size={18} /> },
    { label: 'Farmer Profile', path: '/farmer/profile', icon: <User size={18} /> },
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
  if (!user) return null;

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
    </div>
  );
}
