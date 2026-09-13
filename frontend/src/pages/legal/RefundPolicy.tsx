import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCcw, ArrowLeft } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div style={{ maxWidth: 850, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333', lineHeight: 1.7 }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', textDecoration: 'none', fontWeight: 600, marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <RefreshCcw size={32} color="#16a34a" />
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#14532d' }}>Cancellation & Refund Policy</h1>
      </div>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>Last updated: March 2026</p>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>1. Order Cancellation by Buyer</h2>
        <p>
          Buyers can cancel an agricultural produce order prior to farmer dispatch or APMC mandi consignment handover. Once a crop order has been harvested and dispatched into transit, cancellations may only be accepted upon mutual agreement or clear quality deviation.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>2. Returns of Perishable Agricultural Goods</h2>
        <p>
          Due to the perishable nature of fresh agricultural commodities (vegetables, fruits, pulses, grains):
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Buyers must inspect produce at the point of delivery or APMC mandi pickup.</li>
          <li>Damaged, rotten, or incorrect grades must be reported within <strong>24 hours</strong> of receipt with supporting photos/evidence.</li>
        </ul>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>3. Refund Processing Timeline</h2>
        <p>
          Once a cancellation or return is approved by the platform:
        </p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Refunds are initiated within <strong>2 business days</strong> of claim verification.</li>
          <li>The refund amount will be credited back to the original payment source (UPI account, Debit/Credit Card, or Net Banking) within <strong>5 to 7 business days</strong> as per standard banking and RBI settlement cycles.</li>
        </ul>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>4. Failed Transactions</h2>
        <p>
          If your bank account or card is debited but an order is not generated due to network disruption, your payment is automatically reversed by the payment gateway (Razorpay) within <strong>24 to 48 hours</strong>.
        </p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#14532d', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>5. Support Contact</h2>
        <p>
          For refund status or cancellation requests, reach us at <strong>support@agrotrades.in</strong> or phone <strong>+91 98765 43210</strong>.
        </p>
      </section>
    </div>
  );
}
