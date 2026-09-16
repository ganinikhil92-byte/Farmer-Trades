import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import DashboardLayout from './components/DashboardLayout';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageList from './pages/admin/ManageList';
import FarmersList from './pages/admin/FarmersList';
import CustomersList from './pages/admin/CustomersList';
import MasterStocks from './pages/admin/MasterStocks';
import QueriesList from './pages/admin/QueriesList';
import AdminProfile from './pages/admin/AdminProfile';
import AdminLogin from './pages/admin/AdminLogin';

// Farmer pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import TradeCrops from './pages/farmer/TradeCrops';
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

// Legal compliance pages
import TermsAndConditions from './pages/legal/TermsAndConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import RefundPolicy from './pages/legal/RefundPolicy';
import ContactUs from './pages/legal/ContactUs';

import { Wheat, Carrot, Apple } from 'lucide-react';

function AppRoutes() {
  const { user } = useAuth();

  // Not logged in → landing page & legal compliance routes
  if (!user) {
    return (
      <Routes>
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  // Redirect to correct dashboard based on role
  const homeMap = { admin: '/admin', farmer: '/farmer', buyer: '/buyer' };
  const home = homeMap[user.role];

  return (
    <DashboardLayout>
      <Routes>
        {/* Admin Routes */}
        {user.role === 'admin' && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/farmers" element={<FarmersList />} />
            <Route path="/admin/customers" element={<CustomersList />} />
            <Route path="/admin/stocks" element={<MasterStocks />} />
            <Route path="/admin/queries" element={<QueriesList />} />
            <Route path="/admin/crops" element={<ManageList title="Crops" endpoint="crops" icon={<Wheat size={18} />} />} />
            <Route path="/admin/vegetables" element={<ManageList title="Vegetables" endpoint="vegetables" icon={<Carrot size={18} />} />} />
            <Route path="/admin/fruits" element={<ManageList title="Fruits" endpoint="fruits" icon={<Apple size={18} />} />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </>
        )}

        {/* Farmer Routes */}
        {user.role === 'farmer' && (
          <>
            <Route path="/farmer" element={<FarmerDashboard />} />
            <Route path="/farmer/trade" element={<TradeCrops />} />
            <Route path="/farmer/stocks" element={<CropStocks />} />
            <Route path="/farmer/vegetable-stocks" element={<VegetableStocks />} />
            <Route path="/farmer/fruit-stocks" element={<FruitStocks />} />
            <Route path="/farmer/history" element={<SellingHistory />} />
            <Route path="/farmer/apmc" element={<NearestAPMC />} />
            <Route path="/farmer/soil-test" element={<SoilTest />} />
            <Route path="/farmer/predict-crop" element={<Predictions type="crop" />} />
            <Route path="/farmer/predict-yield" element={<Predictions type="yield" />} />
            <Route path="/farmer/predict-rainfall" element={<Predictions type="rainfall" />} />
            <Route path="/farmer/recommend-crop" element={<Predictions type="recommend-crop" />} />
            <Route path="/farmer/recommend-fertilizer" element={<Predictions type="recommend-fertilizer" />} />
            <Route path="/farmer/chatbot" element={<ChatBot />} />
            <Route path="/farmer/weather" element={<WeatherForecast />} />
            <Route path="/farmer/news" element={<NewsFeed />} />
            <Route path="/farmer/profile" element={<FarmerProfile />} />
          </>
        )}

        {/* Buyer Routes */}
        {user.role === 'buyer' && (
          <>
            <Route path="/buyer" element={<BuyerDashboard />} />
            <Route path="/buyer/buy" element={<BuyCrops />} />

            <Route path="/buyer/cart" element={<Cart />} />
            <Route path="/buyer/orders" element={<MyOrders />} />
            <Route path="/buyer/profile" element={<CustomerProfile />} />
          </>
        )}

        {/* Global Legal Compliance Pages */}
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Redirect admin login if already logged in */}
        <Route path="/admin/login" element={<Navigate to={home} replace />} />

        {/* Catch‑all: redirect to user's home */}
        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </DashboardLayout>
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
