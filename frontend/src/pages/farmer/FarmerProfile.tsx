import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Phone, Award, CheckCircle } from 'lucide-react';

export default function FarmerProfile() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <User size={22} />
          </div>
          <div>
            <h2>Farmer Profile</h2>
            <p>Your registered farmer identification and Karnataka APMC registration record.</p>
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
              {user?.name.charAt(0) || 'R'}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{user?.name || 'Ramesh Gowda'}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{user?.email || 'farmer@agro.com'}</p>
              <span className="badge badge-green" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                <CheckCircle size={12} style={{ marginRight: '4px' }} /> Verified Karnataka Farmer
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered District</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="var(--primary)" /> Mandya District, Karnataka
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact Number</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={16} color="var(--primary)" /> +91 98450 12345
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Landholding Area</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>4.5 Acres (Irrigated + Canal feed)</p>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Primary Harvests</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>Ragi (Finger Millet), Paddy (Rice), Sugarcane</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--primary)" /> APMC Mandi Registration
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Your account is linked to the Karnataka Department of Agricultural Marketing e-mandi portal.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Farmer ID (FID)</span>
              <strong>KA-FID-984210</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Linked APMC</span>
              <strong>Yeshwanthpur APMC / Mandya Mandi</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Direct Trade Privileges</span>
              <span className="badge badge-green">Enabled</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>In-App Razorpay Payouts</span>
              <span className="badge badge-green">Active (Bank Verified)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
