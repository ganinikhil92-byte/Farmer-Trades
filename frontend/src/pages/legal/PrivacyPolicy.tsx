import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 850, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333', lineHeight: 1.7 }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', textDecoration: 'none', fontWeight: 600, marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Lock size={32} color="#16a34a" />
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#14532d' }}>Privacy Policy</h1>
      </div>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>Last updated: March 2026</p>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>1. Information We Collect</h2>
        <p>
          Karnataka Agro Trades collects information to provide fair trading, mandi price insights, and transaction processing. This includes:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li><strong>Personal Details:</strong> Full Name, Email Address, Contact Phone Number.</li>
          <li><strong>Location Data:</strong> District, Taluk, Village, and Pincode in Karnataka.</li>
          <li><strong>Trading & Order Data:</strong> Crop listings, quantities, order histories, and payment transaction identifiers.</li>
        </ul>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>2. Payment Information Security</h2>
        <p>
          We do not store your complete credit card numbers, debit card PINs, or banking passwords on our servers. All financial payment processing is handled through PCI-DSS certified payment aggregators such as Razorpay.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>3. How We Use Your Data</h2>
        <p>
          Your information is strictly used to:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Authenticate your account via secure Email OTP.</li>
          <li>Facilitate direct trade connections between verified farmers and buyers.</li>
          <li>Provide AI-driven crop recommendations, soil heuristics, and localized weather forecasts.</li>
          <li>Send transaction receipts and dispatch notifications.</li>
        </ul>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>4. Data Protection & Sharing</h2>
        <p>
          We do not sell or rent your personal information to third-party advertisers. Information is only shared with verified logistics partners or law enforcement when required by Indian law.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>5. Contact Us</h2>
        <p>
          If you have questions regarding our privacy practices, reach out to us at <strong>privacy@agrotrades.in</strong> or visit our <Link to="/contact" style={{ color: '#16a34a' }}>Contact Us</Link> page.
        </p>
      </section>
    </div>
  );
}
