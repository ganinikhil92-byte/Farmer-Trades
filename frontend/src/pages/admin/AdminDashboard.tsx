import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  ShoppingBag,
  ShieldCheck,
  Building2,
  MapPin
} from 'lucide-react';
import { KARNATAKA_DISTRICTS } from '../../data/karnatakaLocations';

export default function AdminDashboard() {
  const { getUsers } = useAuth();

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
    <div>
      <div className="page-header">
        <div>
          <h1>Karnataka Admin Portal</h1>
          <p>
            Monitor Karnataka state APMC trading network, verified users, and district agricultural coverage.
          </p>
        </div>
      </div>

      {/* Primary KPI Stats Cards */}
      <div className="stat-cards stagger" style={{ marginBottom: '2rem' }}>
        {/* Farmers Card */}
        <Link to="/admin/farmers" className="card stat-card animate-fadeIn" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-card-icon green">
            <Users size={26} />
          </div>
          <div className="stat-card-info">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>{farmers.length}</h3>
              <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>Active Base</span>
            </div>
            <p style={{ margin: '0.2rem 0 0.4rem', fontWeight: 600 }}>Registered Farmers</p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>{verifiedFarmers} Verified</span>
              {pendingFarmers > 0 && (
                <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>{pendingFarmers} Pending</span>
              )}
            </div>
          </div>
        </Link>

        {/* Buyers Card */}
        <Link to="/admin/customers" className="card stat-card animate-fadeIn" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-card-icon blue">
            <ShoppingBag size={26} />
          </div>
          <div className="stat-card-info">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>{buyers.length}</h3>
              <span style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 600 }}>Active Base</span>
            </div>
            <p style={{ margin: '0.2rem 0 0.4rem', fontWeight: 600 }}>Registered Buyers / Traders</p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>{verifiedBuyers} Verified</span>
              {pendingBuyers > 0 && (
                <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>{pendingBuyers} Pending</span>
              )}
            </div>
          </div>
        </Link>

        {/* Total Registered Users */}
        <div className="card stat-card animate-fadeIn">
          <div className="stat-card-icon amber">
            <ShieldCheck size={26} />
          </div>
          <div className="stat-card-info">
            <h3 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>{farmers.length + buyers.length}</h3>
            <p style={{ margin: '0.2rem 0 0.4rem', fontWeight: 600 }}>Total Registered Users</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Karnataka Agriculture Network
            </span>
          </div>
        </div>

        {/* Active Districts */}
        <div className="card stat-card animate-fadeIn">
          <div className="stat-card-icon red">
            <Building2 size={26} />
          </div>
          <div className="stat-card-info">
            <h3 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>{activeDistricts.size} / 31</h3>
            <p style={{ margin: '0.2rem 0 0.4rem', fontWeight: 600 }}>Districts Covered</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Karnataka State APMC Reach
            </span>
          </div>
        </div>
      </div>

      {/* District Coverage Summary */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Karnataka District Coverage</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Active farmer and buyer representation across 31 Karnataka APMC districts
            </p>
          </div>
          <span className="badge badge-green" style={{ fontSize: '0.8rem' }}>
            {activeDistricts.size} Active Regions
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {KARNATAKA_DISTRICTS.map((d) => {
            const isActive = activeDistricts.has(d.name);
            const districtFarmers = farmers.filter(f => f.district === d.name).length;
            const districtBuyers = buyers.filter(b => b.district === d.name).length;
            return (
              <span
                key={d.name}
                className={`badge ${isActive ? 'badge-green' : 'badge-gray'}`}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 600 : 400,
                  opacity: isActive ? 1 : 0.65,
                }}
              >
                <MapPin size={12} style={{ marginRight: '0.3rem' }} />
                {d.name} {isActive ? `(${districtFarmers + districtBuyers})` : ''}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
