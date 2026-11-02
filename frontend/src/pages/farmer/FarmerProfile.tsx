import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { User, MapPin, Phone, Award, CheckCircle, Crown, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import SubscriptionModal from '../../components/SubscriptionModal';

export default function FarmerProfile() {
  const { user } = useAuth();
  const [hasSub, setHasSub] = useState(false);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [showSubModal, setShowSubModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadSub() {
      if (!user?.email) {
        setLoadingSub(false);
        return;
      }
      try {
        const res = await api.get('/farmer/subscription/status', {
          params: { farmer_id: user.email }
        });
        if (res.data) {
          setHasSub(Boolean(res.data.has_active_subscription));
          setSubscription(res.data.subscription || null);
        }
      } catch (e) {
        console.warn('Failed to load farmer subscription:', e);
      } finally {
        setLoadingSub(false);
      }
    }
    loadSub();
  }, [user]);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <User size={22} />
          </div>
          <div>
            <h2>Farmer Profile</h2>
            <p>Your registered farmer identification, APMC record, and produce trading membership.</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#15803d',
            padding: '0.85rem 1.25rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 600
          }}
        >
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            style={{ background: 'transparent', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Card 1: Farmer Identity */}
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
              <h3 style={{ margin: 0 }}>{user?.name || 'Farmer'}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{user?.email || ''}</p>
              <span className="badge badge-green" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                <CheckCircle size={12} style={{ marginRight: '4px' }} /> Verified Karnataka Farmer
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered District</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} color="var(--primary)" /> {user?.district ? `${user.district} District, Karnataka` : 'Mandya District, Karnataka'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact Number</span>
              <p style={{ margin: '0.2rem 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={16} color="var(--primary)" /> {user?.phone || '+91 98450 12345'}
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

        {/* Card 2: APMC Mandi Registration */}
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

        {/* Card 3: Produce Trading Subscription Pass */}
        <div className="card" style={{ border: hasSub ? '1.5px solid #86efac' : '1.5px solid #fcd34d' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
              <Crown size={20} color={hasSub ? '#16a34a' : '#d97706'} /> Produce Trading Pass
            </h3>
            {hasSub ? (
              <span className="badge badge-green">
                <ShieldCheck size={12} style={{ marginRight: '4px' }} /> Active
              </span>
            ) : (
              <span
                style={{
                  background: '#fef3c7',
                  color: '#b45309',
                  border: '1px solid #fcd34d',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px'
                }}
              >
                Subscription Required
              </span>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Required membership for listing produce and directly connecting with bulk wholesale buyers across Karnataka.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Plan Tier</span>
              <strong>{subscription?.plan_tier ? subscription.plan_tier.replace('_', ' ') : (hasSub ? 'Active Pass' : 'None (Unsubscribed)')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Trading Expiration</span>
              <strong>{subscription?.end_date || (hasSub ? 'Annual' : 'No active license')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Available Plans</span>
              <span style={{ fontWeight: 600, color: '#16a34a' }}>1 Yr: ₹500 • 3 Yrs: ₹1,300 • 5 Yrs: ₹2,000</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSubModal(true)}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: hasSub ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #d97706, #b45309)',
              border: 'none',
              boxShadow: hasSub ? '0 4px 12px rgba(22, 163, 74, 0.25)' : '0 4px 12px rgba(217, 119, 6, 0.25)'
            }}
          >
            <CreditCard size={16} />
            {hasSub ? 'Renew or Upgrade Pass' : 'Subscribe Now (from ₹500/yr)'}
          </button>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSuccess={(newSub) => {
          setHasSub(true);
          setSubscription(newSub);
          setSuccessMsg(`🎉 Trading pass activated successfully! Valid until ${newSub.end_date}.`);
        }}
      />
    </div>
  );
}
