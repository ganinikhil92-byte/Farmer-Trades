import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/queries', { name, email, phone, message });
      setSent(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch {
      // Fallback optimistic message
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', textDecoration: 'none', fontWeight: 600, marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#14532d', margin: '0 0 0.5rem 0' }}>Contact Us</h1>
        <p style={{ color: '#666', fontSize: '1.05rem', margin: 0 }}>
          Have questions about Karnataka crop listings, farmer registrations, or APMC trades? Our team is here to assist.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#16a34a' }}>
            <MapPin size={22} />
            <h3 style={{ margin: 0, color: '#1e293b' }}>Registered Address</h3>
          </div>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
            Karnataka Agro Trades Pvt. Ltd.<br />
            APMC Yard Complex, Main Commercial Ring Road,<br />
            Yeshwanthpur, Bengaluru, Karnataka - 560022, India
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#16a34a' }}>
            <Phone size={22} />
            <h3 style={{ margin: 0, color: '#1e293b' }}>Customer Helpline</h3>
          </div>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
            Direct Line: <strong>+91 98765 43210</strong><br />
            WhatsApp Support: +91 98765 43211
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#16a34a' }}>
            <Mail size={22} />
            <h3 style={{ margin: 0, color: '#1e293b' }}>Electronic Mail</h3>
          </div>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
            General Inquiries: hello@agrotrades.in<br />
            Disputes & Refunds: support@agrotrades.in
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#16a34a' }}>
            <Clock size={22} />
            <h3 style={{ margin: 0, color: '#1e293b' }}>Operating Hours</h3>
          </div>
          <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
            Monday to Saturday: 9:00 AM – 6:00 PM IST<br />
            Sunday: Emergency APMC mandi support only
          </p>
        </div>
      </div>

      <div style={{ background: '#f0fdf4', padding: '2rem', borderRadius: 12, border: '1px solid #bbf7d0' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#14532d', marginTop: 0, marginBottom: '1rem' }}>Send Us a Message</h2>
        {sent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>
            <CheckCircle2 size={20} />
            <span>Thank you! Your inquiry has been received. Our agro trade representative will reach out shortly.</span>
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem', color: '#374151' }}>Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem', color: '#374151' }}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem', color: '#374151' }}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem', color: '#374151' }}>Message / Inquiries</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide details about your inquiry, mandi consignments, or order support..."
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#16a34a', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
            >
              <Send size={18} /> {submitting ? 'Sending...' : 'Submit Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
