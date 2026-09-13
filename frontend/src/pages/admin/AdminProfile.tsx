import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Award, CheckCircle2 } from 'lucide-react';

export default function AdminProfile() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Shield size={22} />
          </div>
          <div>
            <h2>Administrator Profile</h2>
            <p>System governance, master data controls, and platform privileges.</p>
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
              {user?.name.charAt(0) || 'A'}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{user?.name || 'Administrator'}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{user?.email || 'admin@agro.com'}</p>
              <span className="badge badge-green" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                Full System Super-Admin
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Jurisdiction</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>State of Karnataka, Department of Agriculture & APMC</p>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official Email</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>admin@agro.com</p>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Security Level</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600 }}>Level 4 (Master Data CRUD + User Auditing)</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--primary)" /> Administrative Permissions
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--primary)" /> Add / Delete Crops Master Catalog
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--primary)" /> Add / Delete Vegetables & Fruits Catalog
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--primary)" /> Verify & Deactivate Karnataka Farmers
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--primary)" /> Audit Customer Orders & Payment Gateway Transactions
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} color="var(--primary)" /> Respond & Resolve Mandi Inquiries & Support Tickets
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
