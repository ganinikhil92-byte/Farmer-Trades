import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  ShoppingBag,
  ShieldCheck,
  Building2,
  MapPin,
  FlaskConical,
  Package,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { KARNATAKA_DISTRICTS } from '../../data/karnatakaLocations';

export default function AdminDashboard() {
  const { getUsers } = useAuth();
  const navigate = useNavigate();

  const farmers = getUsers('farmer');
  const buyers = getUsers('buyer');

  // Calculate stats
  const verifiedFarmers = farmers.filter((f) => f.status === 'Verified').length;
  const pendingFarmers = farmers.filter((f) => f.status === 'Pending').length;

  const verifiedBuyers = buyers.filter((b) => b.status === 'Verified').length;
  const pendingBuyers = buyers.filter((b) => b.status === 'Pending').length;

  // Districts covered
  const activeDistricts = new Set([
    ...farmers.map((f) => f.district).filter(Boolean),
    ...buyers.map((b) => b.district).filter(Boolean),
  ]);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* ── 1. Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles size={13} className="text-emerald-400" />
            <span>Karnataka State Agricultural Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Farmer Trades State Admin
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            Monitor Karnataka state APMC trading network, verified users, and district agricultural coverage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-green">Network Online</span>
          <span className="badge badge-blue">31 Districts</span>
        </div>
      </div>

      {/* ── 2. Quick Action Pills Row ── */}
      <section className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/farmers')}
          className="ft-hero-pill ft-hero-pill-white text-sm"
        >
          <span>🌾</span>
          <span>Manage Farmers ({farmers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/customers')}
          className="ft-hero-pill ft-hero-pill-emerald text-sm"
        >
          <span>🛒</span>
          <span>Manage Buyers ({buyers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/produce')}
          className="ft-hero-pill ft-hero-pill-emerald text-sm"
        >
          <span>📈</span>
          <span>Produces & Market Prices</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/soil-tests')}
          className="ft-hero-pill ft-hero-pill-amber text-sm"
        >
          <span>🧪</span>
          <span>Soil Test Requests</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/stocks')}
          className="ft-hero-pill ft-hero-pill-outline text-sm"
        >
          <span>📦</span>
          <span>Master Stocks</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/queries')}
          className="ft-hero-pill ft-hero-pill-outline text-sm"
        >
          <span>💬</span>
          <span>Inquiries</span>
        </button>
      </section>

      {/* ── 3. Primary KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Farmers Card */}
        <Link to="/admin/farmers" className="card flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-white m-0">{farmers.length}</h3>
              <span className="text-xs text-emerald-400 font-bold">Producers</span>
            </div>
            <p className="text-xs font-semibold text-gray-300 mt-0.5">Registered Farmers</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="badge badge-green text-[11px]">{verifiedFarmers} Verified</span>
              {pendingFarmers > 0 && (
                <span className="badge badge-amber text-[11px]">{pendingFarmers} Pending</span>
              )}
            </div>
          </div>
        </Link>

        {/* Buyers Card */}
        <Link to="/admin/customers" className="card flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-white m-0">{buyers.length}</h3>
              <span className="text-xs text-blue-400 font-bold">Wholesale</span>
            </div>
            <p className="text-xs font-semibold text-gray-300 mt-0.5">Registered Buyers</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="badge badge-green text-[11px]">{verifiedBuyers} Verified</span>
              {pendingBuyers > 0 && (
                <span className="badge badge-amber text-[11px]">{pendingBuyers} Pending</span>
              )}
            </div>
          </div>
        </Link>

        {/* Total Registered Users */}
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white m-0">{farmers.length + buyers.length}</h3>
            <p className="text-xs font-semibold text-gray-300 mt-0.5">Total Users</p>
            <span className="text-xs text-gray-400 block mt-1">Karnataka Agro Network</span>
          </div>
        </div>

        {/* Active Districts */}
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white m-0">{activeDistricts.size} / 31</h3>
            <p className="text-xs font-semibold text-gray-300 mt-0.5">Districts Covered</p>
            <span className="text-xs text-gray-400 block mt-1">State APMC Reach</span>
          </div>
        </div>
      </div>

      {/* ── 4. District Coverage Summary ── */}
      <div className="card p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-bold text-white m-0">Karnataka District APMC Reach</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Active farmer and buyer representation across 31 Karnataka APMC districts
            </p>
          </div>
          <span className="badge badge-green text-xs">
            {activeDistricts.size} Active Regions
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {KARNATAKA_DISTRICTS.map((d) => {
            const isActive = activeDistricts.has(d.name);
            const districtFarmers = farmers.filter((f) => f.district === d.name).length;
            const districtBuyers = buyers.filter((b) => b.district === d.name).length;
            return (
              <span
                key={d.name}
                className={`badge ${isActive ? 'badge-green' : 'badge-gray'}`}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  opacity: isActive ? 1 : 0.45,
                }}
              >
                <MapPin size={12} className="inline mr-1" />
                {d.name} {isActive ? `(${districtFarmers + districtBuyers})` : ''}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
