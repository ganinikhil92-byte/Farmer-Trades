import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div style={{ maxWidth: 850, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333', lineHeight: 1.7 }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', textDecoration: 'none', fontWeight: 600, marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Shield size={32} color="#16a34a" />
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#14532d' }}>Terms and Conditions</h1>
      </div>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>Last updated: March 2026</p>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>1. Introduction</h2>
        <p>
          Welcome to <strong>Karnataka Agro Trades</strong> ("we", "our", or "platform"). By accessing or using our website, services, and online crop trading marketplace, you agree to be bound by these Terms and Conditions.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>2. Marketplace Services</h2>
        <p>
          Karnataka Agro Trades acts as a digital intermediary platform connecting agricultural producers (farmers) and wholesale or retail buyers across Karnataka and neighboring regions. We facilitate direct agricultural stock discovery, trading, APMC mandi rate references, and digital payment facilitation.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>3. User Registration & Eligibility</h2>
        <p>
          Users must be at least 18 years of age and legally competent to enter into contracts under the Indian Contract Act, 1872. You agree to provide accurate, up-to-date, and verified personal details (including valid contact phone number, email, and location details).
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>4. Payments & Transactions</h2>
        <p>
          All online payments processed through Karnataka Agro Trades are handled securely through certified payment aggregators (including Razorpay). Transactions are conducted in Indian National Rupees (INR ₹). By initiating a payment, you authorize the charge for the specified quantity and price per kilogram of produce.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>5. Quality & Delivery Responsibilities</h2>
        <p>
          Farmers are responsible for accurately describing produce grades, types, and available stock quantities. Buyers must inspect stock batches upon receipt or mandi delivery. Any disputes regarding quality must be filed within the timeframe specified in our Refund & Cancellation Policy.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>6. Contact & Grievances</h2>
        <p>
          For queries or dispute resolution, contact our grievance officer at <strong>hello@agrotrades.in</strong> or through our <Link to="/contact" style={{ color: '#16a34a' }}>Contact Us</Link> page.
        </p>
      </section>
    </div>
  );
}
