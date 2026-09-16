import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Phone, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function CustomerProfile() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <User size={22} />
          </div>
          <div>
            <h2>Customer / Buyer Profile</h2>
            <p>Your buyer registration details, delivery preferences, and payment setup in Karnataka.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 700
              }}
            >
              {user?.name.charAt(0) || 'S'}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{user?.name || 'Buyer'}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{user?.email || ''}</p>
              <span className="badge badge-green" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                <ShieldCheck size={12} style={{ marginRight: '4px' }} /> Verified Wholesale Buyer
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Business City</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="var(--primary)" /> Bengaluru Urban, Karnataka
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact Number</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={16} color="var(--primary)" /> +91 98800 23456
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Business Segment</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>Commercial Food Distributor & Retailer</p>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Preferred Payment Mode</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>UPI / Net Banking (Razorpay Secured)</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} color="var(--primary)" /> Purchase Capabilities
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Your verified buyer account is authorized for direct farm gate procurement without mandi intermediary surcharges.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Buyer ID</span>
              <strong>KA-BYR-55120</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Procurement License</span>
              <span className="badge badge-green">Active (Karnataka APMC Act 2020)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>In-App Checkout</span>
              <span className="badge badge-green">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
