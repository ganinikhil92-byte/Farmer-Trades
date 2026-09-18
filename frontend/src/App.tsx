import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import DashboardLayout from './components/DashboardLayout';

// Farmer Trades Components & Pages
import FarmerTradesLayout from './components/farmer_trades/FarmerTradesLayout';
import { HomePage } from './pages/farmer_trades/HomePage';
import { BuyProducePage } from './pages/farmer_trades/BuyProducePage';
import { SellProducePage } from './pages/farmer_trades/SellProducePage';
import { FarmersPage } from './pages/farmer_trades/FarmersPage';
import { AllCropsPage } from './pages/farmer_trades/AllCropsPage';
import { MarketPricesPage } from './pages/farmer_trades/MarketPricesPage';
import { FavoritesPage } from './pages/farmer_trades/FavoritesPage';
import { NotificationsPage } from './pages/farmer_trades/NotificationsPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageList from './pages/admin/ManageList';
import FarmersList from './pages/admin/FarmersList';
import CustomersList from './pages/admin/CustomersList';
import MasterStocks from './pages/admin/MasterStocks';
import QueriesList from './pages/admin/QueriesList';
import AdminProfile from './pages/admin/AdminProfile';
import AdminLogin from './pages/admin/AdminLogin';
import SoilTestAdmin from './pages/admin/SoilTestAdmin';

// Farmer pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import TradeCrops from './pages/farmer/TradeCrops';
import FarmerStocks from './pages/farmer/FarmerStocks';
import CropStocks from './pages/farmer/CropStocks';
import VegetableStocks from './pages/farmer/VegetableStocks';
import FruitStocks from './pages/farmer/FruitStocks';
import SellingHistory from './pages/farmer/SellingHistory';
import NearestAPMC from './pages/farmer/NearestAPMC';
import SoilTest from './pages/farmer/SoilTest';
import Predictions from './pages/farmer/Predictions';
import ChatBot from './pages/farmer/ChatBot';
import WeatherForecast from './pages/farmer/WeatherForecast';
import NewsFeed from './pages/farmer/NewsFeed';
import FarmerProfile from './pages/farmer/FarmerProfile';

// Buyer pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyCrops from './pages/buyer/BuyCrops';
import Cart from './pages/buyer/Cart';
import MyOrders from './pages/buyer/MyOrders';
import CustomerProfile from './pages/buyer/CustomerProfile';

// Dedicated Main Authentication Page (Farmer & Buyer Login/Signup/OTP)
import MainAuthPage from './pages/auth/MainAuthPage';

// Legal compliance pages
import TermsAndConditions from './pages/legal/TermsAndConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import RefundPolicy from './pages/legal/RefundPolicy';
import ContactUs from './pages/legal/ContactUs';

import { Wheat, Carrot, Apple } from 'lucide-react';

function AppRoutes() {
  const { user } = useAuth();

  const userHome = user
    ? user.role === 'admin'
      ? '/admin'
      : user.role === 'buyer'
      ? '/buyer'
      : '/farmer'
    : '/';

  return (
    <Routes>
      {/* ── Main Page: Dedicated Farmer & Buyer Authentication Portal ── */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={userHome} replace />
          ) : (
            <MainAuthPage />
          )
        }
      />

      <Route
        path="/login"
        element={user ? <Navigate to={userHome} replace /> : <MainAuthPage />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={userHome} replace /> : <MainAuthPage />}
      />
      <Route
        path="/buy"
        element={
          <FarmerTradesLayout>
            <BuyProducePage />
          </FarmerTradesLayout>
        }
      />
      <Route
        path="/sell"
        element={
          <FarmerTradesLayout>
            <SellProducePage />
          </FarmerTradesLayout>
        }
      />
      <Route
        path="/farmers"
        element={
          <FarmerTradesLayout>
            <FarmersPage />
          </FarmerTradesLayout>
        }
      />
      <Route
        path="/crops"
        element={
          <FarmerTradesLayout>
            <AllCropsPage />
          </FarmerTradesLayout>
        }
      />
      <Route
        path="/market-prices"
        element={
          <FarmerTradesLayout>
            <MarketPricesPage />
          </FarmerTradesLayout>
        }
      />
      <Route
        path="/favorites"
        element={
          <FarmerTradesLayout>
            <FavoritesPage />
          </FarmerTradesLayout>
        }
      />
      <Route
        path="/notifications"
        element={
          <FarmerTradesLayout>
            <NotificationsPage />
          </FarmerTradesLayout>
        }
      />

      {/* ── Legal & Compliance Pages ── */}
      <Route
        path="/terms"
        element={
          <FarmerTradesLayout>
            <TermsAndConditions />
          </FarmerTradesLayout>
        }
      />
      <Route
        path="/privacy"
        element={
          <FarmerTradesLayout>
            <PrivacyPolicy />
          </FarmerTradesLayout>
        }
      />
      <Route
        path="/refund-policy"
        element={
          <FarmerTradesLayout>
            <RefundPolicy />
          </FarmerTradesLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <FarmerTradesLayout>
            <ContactUs />
          </FarmerTradesLayout>
        }
      />

      {/* ── Admin Login ── */}
      <Route
        path="/admin/login"
        element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLogin />}
      />

      {/* ── Role-Based Dashboards (Wrapped in DashboardLayout) ── */}
      {/* Admin Dashboard */}
      {user && user.role === 'admin' && (
        <>
          <Route path="/admin" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
          <Route path="/admin/farmers" element={<DashboardLayout><FarmersList /></DashboardLayout>} />
          <Route path="/admin/customers" element={<DashboardLayout><CustomersList /></DashboardLayout>} />
          <Route path="/admin/stocks" element={<DashboardLayout><MasterStocks /></DashboardLayout>} />
          <Route path="/admin/queries" element={<DashboardLayout><QueriesList /></DashboardLayout>} />
          <Route path="/admin/crops" element={<DashboardLayout><ManageList title="Crops" endpoint="crops" icon={<Wheat size={18} />} /></DashboardLayout>} />
          <Route path="/admin/vegetables" element={<DashboardLayout><ManageList title="Vegetables" endpoint="vegetables" icon={<Carrot size={18} />} /></DashboardLayout>} />
          <Route path="/admin/fruits" element={<DashboardLayout><ManageList title="Fruits" endpoint="fruits" icon={<Apple size={18} />} /></DashboardLayout>} />
          <Route path="/admin/soil-tests" element={<DashboardLayout><SoilTestAdmin /></DashboardLayout>} />
          <Route path="/admin/profile" element={<DashboardLayout><AdminProfile /></DashboardLayout>} />
        </>
      )}

      {/* Farmer Dashboard */}
      {user && user.role === 'farmer' && (
        <>
          <Route path="/farmer" element={<DashboardLayout><FarmerDashboard /></DashboardLayout>} />
          <Route path="/farmer/trade" element={<DashboardLayout><TradeCrops /></DashboardLayout>} />
          <Route path="/farmer/stocks" element={<DashboardLayout><FarmerStocks /></DashboardLayout>} />
          <Route path="/farmer/crop-stocks" element={<DashboardLayout><FarmerStocks /></DashboardLayout>} />
          <Route path="/farmer/vegetable-stocks" element={<DashboardLayout><FarmerStocks /></DashboardLayout>} />
          <Route path="/farmer/fruit-stocks" element={<DashboardLayout><FarmerStocks /></DashboardLayout>} />
          <Route path="/farmer/history" element={<DashboardLayout><SellingHistory /></DashboardLayout>} />
          <Route path="/farmer/apmc" element={<DashboardLayout><NearestAPMC /></DashboardLayout>} />
          <Route path="/farmer/soil-test" element={<DashboardLayout><SoilTest /></DashboardLayout>} />
          <Route path="/farmer/predict-crop" element={<DashboardLayout><Predictions type="crop" /></DashboardLayout>} />
          <Route path="/farmer/predict-yield" element={<DashboardLayout><Predictions type="yield" /></DashboardLayout>} />
          <Route path="/farmer/predict-rainfall" element={<Navigate to="/farmer/weather" replace />} />
          <Route path="/farmer/recommend-crop" element={<Navigate to="/farmer/predict-crop" replace />} />
          <Route path="/farmer/recommend-fertilizer" element={<DashboardLayout><Predictions type="recommend-fertilizer" /></DashboardLayout>} />
          <Route path="/farmer/chatbot" element={<DashboardLayout><ChatBot /></DashboardLayout>} />
          <Route path="/farmer/weather" element={<DashboardLayout><WeatherForecast /></DashboardLayout>} />
          <Route path="/farmer/news" element={<DashboardLayout><NewsFeed /></DashboardLayout>} />
          <Route path="/farmer/profile" element={<DashboardLayout><FarmerProfile /></DashboardLayout>} />
        </>
      )}

      {/* Buyer Dashboard */}
      {user && user.role === 'buyer' && (
        <>
          <Route path="/buyer" element={<DashboardLayout><BuyerDashboard /></DashboardLayout>} />
          <Route path="/buyer/buy" element={<DashboardLayout><BuyCrops /></DashboardLayout>} />
          <Route path="/buyer/cart" element={<DashboardLayout><Cart /></DashboardLayout>} />
          <Route path="/buyer/orders" element={<DashboardLayout><MyOrders /></DashboardLayout>} />
          <Route path="/buyer/profile" element={<DashboardLayout><CustomerProfile /></DashboardLayout>} />
        </>
      )}

      {/* Fallbacks if logged in user navigates to a role dashboard they do not belong to */}
      {user && (
        <>
          <Route path="/admin/*" element={<Navigate to={userHome} replace />} />
          <Route path="/farmer/*" element={<Navigate to={userHome} replace />} />
          <Route path="/buyer/*" element={<Navigate to={userHome} replace />} />
        </>
      )}

      {/* Fallback for unauthenticated access to dashboard routes */}
      {!user && (
        <>
          <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
          <Route path="/farmer/*" element={<Navigate to="/login" replace />} />
          <Route path="/buyer/*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
