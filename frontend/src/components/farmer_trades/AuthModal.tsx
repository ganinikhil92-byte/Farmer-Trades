import React, { useState } from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { X, Sprout, Mail, Lock, User, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  intendedActionNotice?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'login',
  intendedActionNotice
}: AuthModalProps) {
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [role, setRole] = useState<UserRole>('farmer');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Mandya');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password, role);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Invalid credentials. Please check your email and password.');
        }
      } else {
        const res = await signup(name, email, password, role, district, 'Central', 'Main Village', '560001', phone);
        if (res.success) {
          setSuccessMsg('Account created successfully! Welcome to Farmer Trades.');
          setTimeout(() => onClose(), 1000);
        } else {
          setError(res.error || 'Registration failed. Please verify details.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!loginWithGoogle) return;
    setError('');
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Google Sign-In was cancelled or failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    }
  }

  return (
    <div className="ft-modal-overlay" onClick={onClose}>
      <div className="ft-modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ft-modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="ft-modal-header">
          <div className="ft-modal-brand-badge">
            <Sprout size={20} />
            <span>Farmer Trades</span>
          </div>
          <h2>{mode === 'login' ? 'Sign In to Your Account' : 'Join India’s Farmer Trades Network'}</h2>
          {intendedActionNotice && <p className="ft-intended-notice">{intendedActionNotice}</p>}
          <p className="ft-modal-subtitle">
            {mode === 'login'
              ? 'Connect directly to verified agricultural buyers and producers across India.'
              : 'Register as a Farmer to sell harvests or as a Buyer to procure direct wholesale produce.'}
          </p>
        </div>

        {/* Role Switcher */}
        <div className="ft-role-selector">
          <button
            type="button"
            className={`ft-role-btn ${role === 'farmer' ? 'active' : ''}`}
            onClick={() => setRole('farmer')}
          >
            🌾 I am a Farmer
          </button>
          <button
            type="button"
            className={`ft-role-btn ${role === 'buyer' ? 'active' : ''}`}
            onClick={() => setRole('buyer')}
          >
            🛒 I am a Buyer / Trader
          </button>
        </div>

        {error && (
          <div className="ft-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="ft-alert success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="ft-modal-form">
          {mode === 'signup' && (
            <>
              <div className="ft-form-field">
                <label>Full Name / Business Name</label>
                <div className="ft-input-wrap">
                  <User size={16} className="ft-field-icon" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'farmer' ? 'Ramesh Gowda' : 'Mysuru Wholesale Traders'}
                  />
                </div>
              </div>

              <div className="ft-form-field">
                <label>Mobile Number</label>
                <div className="ft-input-wrap">
                  <Phone size={16} className="ft-field-icon" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9845012345"
                  />
                </div>
              </div>

              <div className="ft-form-field">
                <label>Primary District (Karnataka / State)</label>
                <div className="ft-input-wrap">
                  <MapPin size={16} className="ft-field-icon" />
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Mandya, Mysuru, Belagavi..."
                  />
                </div>
              </div>
            </>
          )}

          <div className="ft-form-field">
            <label>Email Address</label>
            <div className="ft-input-wrap">
              <Mail size={16} className="ft-field-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="ft-form-field">
            <label>Password</label>
            <div className="ft-input-wrap">
              <Lock size={16} className="ft-field-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="ft-btn-submit" disabled={loading}>
            {loading ? 'Processing…' : mode === 'login' ? 'Sign In' : 'Create Farmer Trades Account'}
          </button>

          {loginWithGoogle && (
            <button type="button" className="ft-btn-google" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}

          <div className="ft-toggle-mode">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')}>
                  Register Free
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button type="button" onClick={() => setMode('login')}>
                  Sign In
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
