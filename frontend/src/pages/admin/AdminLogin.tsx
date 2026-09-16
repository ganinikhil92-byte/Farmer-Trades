import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import '../Landing.css';

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('nikhilgani987@gmail.com');
  const [password, setPassword] = useState('Nikhil@2005');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(`/${user.role}`, { replace: true });
      }
    }
  }, [user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setError('Please enter your administrator password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password, 'admin');
      if (res.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(res.error || 'Authentication failed. Please verify your admin credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Server error during authentication.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="auth-page"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #064e3b 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="auth-card animate-scaleIn"
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '1.25rem',
        }}
      >
        <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 8px 16px rgba(4, 120, 87, 0.3)',
            }}
          >
            <Shield size={32} />
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#065f46',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.6rem',
            }}
          >
            <CheckCircle2 size={13} />
            Restricted Access
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Karnataka Admin Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.35rem' }}>
            Official Administrator & Master Control Access
          </p>
        </div>

        {error && (
          <div
            className="auth-error"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textAlign: 'left',
              padding: '0.75rem 1rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
              Administrator Email
            </label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                type="email"
                className="input"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                name="admin_direct_email"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, color: '#334155', fontSize: '0.875rem' }}>
              Admin Secure Password
            </label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type="password"
                className="input"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                name="admin_direct_password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '1rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              color: '#64748b',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to Main Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
