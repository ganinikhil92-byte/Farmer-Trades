import React, { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import api from '../utils/api';
import { Sprout, Mail, Lock, User, ChevronRight, Leaf, Phone, MessageSquare, MapPin, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { districtTaluks } from '../data/karnatakaLocations';
import './Landing.css';

export default function Landing() {
  const { login, signup, sendOtp, verifyOtp, resetPassword, loginWithGoogle } = useAuth();
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'forgot-password'>('landing');
  const [error, setError] = useState('');

  // Login state
  const [loginRole, setLoginRole] = useState<UserRole>('farmer');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupConfirmPw, setSignupConfirmPw] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('farmer');
  const [signupDistrict, setSignupDistrict] = useState('');
  const [signupTaluk, setSignupTaluk] = useState('');
  const [signupVillage, setSignupVillage] = useState('');
  const [signupPincode, setSignupPincode] = useState('');

  // Email OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Forgot Password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPw, setForgotNewPw] = useState('');
  const [forgotConfirmPw, setForgotConfirmPw] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotTimer, setForgotTimer] = useState(0);

  useEffect(() => {
    if (forgotTimer > 0) {
      const timer = setTimeout(() => setForgotTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotTimer]);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoginSuccessMsg('');
    const res = await login(loginEmail, loginPw, loginRole);
    if (!res.success) {
      setError(res.error || 'Invalid email or password. Please verify your credentials.');
      setShowForgotPassword(true);
    } else {
      setShowForgotPassword(false);
    }
  }

  async function handleSendForgotOtp(e?: FormEvent) {
    if (e) e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setForgotLoading(true);
    const res = await sendOtp(forgotEmail.trim());
    setForgotLoading(false);
    if (res.success) {
      setForgotOtpSent(true);
      setForgotSuccess('A 6-digit verification code has been sent to your email.');
      setForgotTimer(60);
    } else {
      setForgotError(res.error || 'Failed to send verification code.');
    }
  }

  async function handleResetPasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setForgotError('');
    if (forgotOtp.trim().length !== 6) {
      setForgotError('Please enter the full 6-digit verification code.');
      return;
    }
    if (forgotNewPw.length < 8) {
      setForgotError('New password must be at least 8 characters long.');
      return;
    }
    if (forgotNewPw !== forgotConfirmPw) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }
    setForgotLoading(true);
    const res = await resetPassword(forgotEmail.trim(), forgotOtp.trim(), forgotNewPw);
    setForgotLoading(false);
    if (res.success) {
      setLoginEmail(forgotEmail.trim());
      setLoginPw('');
      setShowForgotPassword(false);
      setError('');
      setLoginSuccessMsg('Password updated successfully! Please sign in with your new password.');
      setView('login');
    } else {
      setForgotError(res.error || 'Failed to reset password. Please check your verification code.');
    }
  }

  async function handleSendOtp() {
    setOtpError('');
    setOtpSuccessMsg('');
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setOtpError('Please enter a valid email address first.');
      return;
    }
    setOtpLoading(true);
    const res = await sendOtp(signupEmail);
    setOtpLoading(false);
    if (res.success) {
      setOtpSent(true);
      setOtpSuccessMsg(res.message || 'Verification code sent to your email!');
      setResendTimer(60);
    } else {
      setOtpError(res.error || 'Failed to send OTP.');
    }
  }

  async function handleVerifyOtp() {
    setOtpError('');
    setOtpSuccessMsg('');
    if (!otpValue.trim() || otpValue.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }
    setOtpLoading(true);
    const res = await verifyOtp(signupEmail, otpValue);
    setOtpLoading(false);
    if (res.success) {
      setIsEmailVerified(true);
      setOtpSuccessMsg('Email verified successfully! You can now choose your password and location details.');
    } else {
      setOtpError(res.error || 'Invalid or expired OTP code.');
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!isEmailVerified) {
      setError('Please verify your email address with the OTP before signing up.');
      return;
    }
    if (signupPw !== signupConfirmPw) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (signupRole !== 'admin' && !signupDistrict) { setError('Please select your district'); return; }
    if (signupRole !== 'admin' && !signupTaluk.trim()) { setError('Please enter your taluk'); return; }
    if (signupRole !== 'admin' && !/^\d{6}$/.test(signupPincode)) { setError('Please enter a valid 6-digit pincode'); return; }
    const res = await signup(
      signupName, signupEmail, signupPw, signupRole,
      signupRole !== 'admin' ? signupDistrict : undefined,
      signupRole !== 'admin' ? signupTaluk.trim() : undefined,
      signupRole !== 'admin' ? signupVillage.trim() : undefined,
      signupRole !== 'admin' ? signupPincode : undefined,
      signupRole !== 'admin' ? signupPhone.trim() : undefined
    );
    if (!res.success) setError(res.error || 'Signup failed');
  }

  if (view === 'login') {
    return (
      <div className="auth-page">
        <div className="auth-card animate-scaleIn">
          <div className="auth-header">
            <Sprout size={40} className="auth-icon" />
            <h2>Welcome Back</h2>
            <p>Sign in to your Agro Trades account</p>
          </div>
          {error && <div className="auth-error">{error}</div>}
          {loginSuccessMsg && (
            <div
              style={{
                background: '#dcfce7',
                color: '#15803d',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {loginSuccessMsg}
            </div>
          )}

          {/* Account Role Selector - NO DEMO CREDENTIALS AUTOFILL */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block', textAlign: 'center' }}>
              Select Role to Sign In:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${loginRole === 'farmer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 0.25rem', fontSize: '0.85rem', fontWeight: 600 }}
                onClick={() => { setLoginRole('farmer'); setLoginEmail(''); setLoginPw(''); setError(''); setShowForgotPassword(false); }}
              >
                🌾 Farmer
              </button>
              <button
                type="button"
                className={`btn btn-sm ${loginRole === 'buyer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 0.25rem', fontSize: '0.85rem', fontWeight: 600 }}
                onClick={() => { setLoginRole('buyer'); setLoginEmail(''); setLoginPw(''); setError(''); setShowForgotPassword(false); }}
              >
                🛒 Buyer
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            <span style={{ padding: '0 0.5rem' }}>Enter Credentials to Verify</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          </div>

          <form onSubmit={handleLogin} autoComplete="off">
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="off"
                  name="agro_user_email"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={loginPw}
                  onChange={(e) => {
                    setLoginPw(e.target.value);
                  }}
                  autoComplete="new-password"
                  name="agro_user_password"
                  required
                />
              </div>
              {/* FORGOT PASSWORD BUTTON - APPEARS ONLY WHEN USER ENTERS WRONG PASSWORD */}
              {showForgotPassword && (
                <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setForgotError('');
                      setForgotSuccess('');
                      setForgotOtpSent(false);
                      setForgotOtp('');
                      setForgotNewPw('');
                      setForgotConfirmPw('');
                      setView('forgot-password');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#dc2626',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <KeyRound size={14} /> Forgot Password? Reset via Email
                  </button>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Sign In <ChevronRight size={18} />
            </button>
          </form>
          <p className="auth-switch">
            Don't have an account?{' '}
            <button onClick={() => { setView('signup'); setSignupEmail(''); setSignupPw(''); setSignupConfirmPw(''); setLoginEmail(''); setLoginPw(''); setError(''); setShowForgotPassword(false); }}>Sign Up</button>
          </p>
          <p className="auth-switch">
            <button onClick={() => { setView('landing'); setLoginEmail(''); setLoginPw(''); setError(''); setShowForgotPassword(false); }}>← Back to Home</button>
          </p>
        </div>
      </div>
    );
  }

  // ===== Forgot Password View =====
  if (view === 'forgot-password') {
    return (
      <div className="auth-page">
        <div className="auth-card animate-scaleIn">
          <div className="auth-header">
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <KeyRound size={28} />
            </div>
            <h2>Reset Password</h2>
            <p>Verify your registered email address to set a new password</p>
          </div>

          {forgotError && <div className="auth-error">{forgotError}</div>}
          {forgotSuccess && (
            <div
              style={{
                background: '#dcfce7',
                color: '#15803d',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {forgotSuccess}
            </div>
          )}

          {!forgotOtpSent ? (
            <form onSubmit={handleSendForgotOtp}>
              <div className="form-group">
                <label className="form-label">Registered Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input
                    className="input"
                    type="email"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {forgotLoading ? 'Sending Code…' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit}>
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--color-primary-600)' }} />
                  Enter 6-Digit Email Verification Code
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  A verification code has been sent to <strong>{forgotEmail}</strong>.
                </p>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <input
                    className="input"
                    type="text"
                    maxLength={6}
                    placeholder="6-digit verification code"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    style={{ letterSpacing: '0.25em', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">New Password (min 8 characters)</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input
                      className="input"
                      type="password"
                      placeholder="Enter new secure password"
                      value={forgotNewPw}
                      onChange={(e) => setForgotNewPw(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input
                      className="input"
                      type="password"
                      placeholder="Confirm new password"
                      value={forgotConfirmPw}
                      onChange={(e) => setForgotConfirmPw(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '0.75rem' }}
              >
                {forgotLoading ? 'Updating Password…' : 'Set New Password & Sign In'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  disabled={forgotTimer > 0 || forgotLoading}
                  onClick={handleSendForgotOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: forgotTimer > 0 ? '#94a3b8' : 'var(--color-primary-600)',
                    fontSize: '0.82rem',
                    cursor: forgotTimer > 0 ? 'default' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {forgotTimer > 0 ? `Resend code in ${forgotTimer}s` : 'Resend verification code'}
                </button>
              </div>
            </form>
          )}

          <p className="auth-switch" style={{ marginTop: '1.25rem' }}>
            <button
              onClick={() => {
                setView('login');
                setError('');
                setForgotError('');
                setShowForgotPassword(false);
              }}
            >
              ← Back to Sign In
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="auth-page">
        <div className="auth-card animate-scaleIn">
          <div className="auth-header">
            <Sprout size={40} className="auth-icon" />
            <h2>Create Account</h2>
            <p>Join the Agro Trades marketplace</p>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSignup}>
            {/* Step 1: Role, Name, and Email Verification */}
            <div className="form-group">
              <label className="form-label">I am registering as a…</label>
              <div className="role-selector">
                {(['farmer', 'buyer'] as UserRole[]).map((r) => (
                  <button key={r} type="button" className={`role-btn ${signupRole === r ? 'active' : ''}`} onClick={() => setSignupRole(r)}>
                    {r === 'farmer' ? '🌾 Farmer' : '🛒 Buyer'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.25rem 0 0.75rem', fontWeight: 600, color: 'var(--color-primary-700)', fontSize: '0.92rem' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: isEmailVerified ? '#16a34a' : 'var(--color-primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                {isEmailVerified ? '✓' : '1'}
              </span>
              Step 1: Enter Details & Verify Email
            </div>

            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="input-with-icon">
                <User size={18} />
                <input className="input" type="text" placeholder="Your full name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                {isEmailVerified && (
                  <span style={{ fontSize: '0.78rem', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> Email Verified
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="input-with-icon" style={{ flex: 1 }}>
                  <Mail size={18} />
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    disabled={isEmailVerified}
                    autoComplete="off"
                    name="agro_signup_email"
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      if (otpSent) { setOtpSent(false); setIsEmailVerified(false); }
                    }}
                    required
                    style={isEmailVerified ? { borderColor: '#22c55e', background: '#f0fdf4' } : {}}
                  />
                </div>
                {!isEmailVerified ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !signupEmail.includes('@') || resendTimer > 0}
                    style={{ whiteSpace: 'nowrap', padding: '0 1rem', fontSize: '0.85rem' }}
                  >
                    {otpLoading ? 'Sending…' : resendTimer > 0 ? `Resend (${resendTimer}s)` : otpSent ? 'Resend Code' : 'Send OTP'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setIsEmailVerified(false);
                      setOtpSent(false);
                      setOtpValue('');
                    }}
                    style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                  >
                    Change
                  </button>
                )}
              </div>
            </div>

            {/* OTP Verification Box */}
            {otpSent && !isEmailVerified && (
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--color-primary-600)' }} />
                  Enter 6-Digit Email Verification Code
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.6rem' }}>
                  A verification code has been sent to <strong>{signupEmail}</strong>.
                </p>

                {otpError && <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{otpError}</div>}
                {otpSuccessMsg && <div style={{ color: '#16a34a', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{otpSuccessMsg}</div>}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    className="input"
                    type="text"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    style={{ letterSpacing: '0.25em', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpValue.trim().length !== 6}
                    style={{ padding: '0 1.25rem', whiteSpace: 'nowrap' }}
                  >
                    {otpLoading ? 'Verifying…' : 'Verify Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Password and Location Options (Unlocked ONLY after email verification) */}
            {isEmailVerified ? (
              <div style={{ borderTop: '2px dashed #bbf7d0', paddingTop: '1.25rem', marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600, color: '#166534', fontSize: '0.92rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                    2
                  </span>
                  Step 2: Choose Password & Location Details
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password <span style={{ color: '#ef4444' }}>*</span></label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input className="input" type="password" placeholder="Must start with A‑Z, 8+ chars, 1 digit, 1 special char" value={signupPw} onChange={(e) => setSignupPw(e.target.value)} required />
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Requirements: Starts with uppercase letter (A‑Z), min 8 chars, 1 digit, 1 special character (!@#$%^&*)
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm Password <span style={{ color: '#ef4444' }}>*</span></label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input className="input" type="password" placeholder="Re-enter your password" value={signupConfirmPw} onChange={(e) => setSignupConfirmPw(e.target.value)} required />
                  </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label className="form-label">Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <div className="input-with-icon">
                    <Phone size={18} />
                    <input
                      className="input"
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                {/* Location fields — Karnataka only */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} /> This app is exclusively for <strong>Karnataka, India</strong>
                </div>

                {/* District */}
                <div className="form-group">
                  <label className="form-label">District <span style={{color:'#ef4444'}}>*</span></label>
                  <div className="input-with-icon">
                    <MapPin size={18} />
                    <select
                      className="input"
                      value={signupDistrict}
                      onChange={(e) => { setSignupDistrict(e.target.value); setSignupTaluk(''); setSignupVillage(''); }}
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    >
                      <option value="">Select your district</option>
                      {Object.keys(districtTaluks).sort().map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Taluk — cascades from District */}
                <div className="form-group">
                  <label className="form-label">Taluk <span style={{color:'#ef4444'}}>*</span></label>
                  <div className="input-with-icon">
                    <MapPin size={18} />
                    <select
                      className="input"
                      value={signupTaluk}
                      onChange={(e) => { setSignupTaluk(e.target.value); setSignupVillage(''); }}
                      required
                      disabled={!signupDistrict}
                      style={{ paddingLeft: '2.5rem', opacity: signupDistrict ? 1 : 0.5 }}
                    >
                      <option value="">{signupDistrict ? 'Select your taluk' : 'Select district first'}</option>
                      {(districtTaluks[signupDistrict] || []).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Village — free text, optional */}
                <div className="form-group">
                  <label className="form-label" style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                    Village / Locality
                    <span style={{ fontWeight: 400, fontSize: '0.78rem', color: '#64748b' }}>
                      (optional — skip if you live in the taluk town)
                    </span>
                  </label>
                  <div className="input-with-icon">
                    <MapPin size={18} />
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g. Bannur, Varuna, Siddalingapura"
                      value={signupVillage}
                      onChange={(e) => setSignupVillage(e.target.value)}
                    />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
                    💡 Leave blank if your taluk and city/town are the same place
                  </p>
                </div>

                {/* Pincode */}
                <div className="form-group">
                  <label className="form-label">Pincode <span style={{color:'#ef4444'}}>*</span></label>
                  <div className="input-with-icon">
                    <MapPin size={18} />
                    <input
                      className="input"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 560001"
                      value={signupPincode}
                      onChange={(e) => setSignupPincode(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Complete Signup & Sign In <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginTop: '1rem' }}>
                <Lock size={20} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>Please click <strong>Send OTP</strong> and verify the 6-digit code sent to your email to unlock password selection and Karnataka location details.</p>
              </div>
            )}
          </form>
          <p className="auth-switch">
            Already have an account?{' '}
            <button onClick={() => { setView('login'); setLoginEmail(''); setLoginPw(''); setError(''); }}>Sign In</button>
          </p>
          <p className="auth-switch">
            <button onClick={() => { setView('landing'); setSignupEmail(''); setSignupPw(''); setError(''); }}>← Back to Home</button>
          </p>
        </div>
      </div>
    );
  }

  // ===== Landing Page =====
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <nav className="hero-nav container">
          <div className="logo">
            <Sprout size={28} />
            <span>Agro Trades</span>
          </div>
        </nav>
        <div className="hero-content container animate-fadeIn">
          <div className="hero-badge badge badge-green">
            <Leaf size={14} /> Karnataka's Agricultural Marketplace
          </div>
          <h1>Farm Fresh, <span className="text-gradient">Direct Trade</span></h1>
          <p className="hero-subtitle">
            Connect directly with farmers and buyers across Karnataka. Fair prices, transparent transactions, and AI‑powered insights for smarter agriculture.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => { setView('signup'); setSignupEmail(''); setSignupPw(''); setSignupConfirmPw(''); setError(''); }}>
              Start Trading <ChevronRight size={20} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => { setView('login'); setLoginEmail(''); setLoginPw(''); setError(''); }}>
              Sign In
            </button>
          </div>
          <div className="hero-stats stagger">
            <div className="stat animate-fadeIn"><span className="stat-num">500+</span><span className="stat-label">Farmers</span></div>
            <div className="stat animate-fadeIn"><span className="stat-num">1200+</span><span className="stat-label">Buyers</span></div>
            <div className="stat animate-fadeIn"><span className="stat-num">₹2Cr+</span><span className="stat-label">Traded</span></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features container">
        <h2 className="section-title">Why Agro Trades?</h2>
        <div className="features-grid stagger">
          {[
            { icon: '🌾', title: 'Trade Crops', desc: 'List and sell your harvest directly to buyers at fair market prices.' },
            { icon: '📊', title: 'AI Predictions', desc: 'Get crop yield, rainfall, and price forecasts powered by machine learning.' },
            { icon: '📍', title: 'Nearest APMC', desc: 'Find the closest APMC Mandi in Karnataka with real‑time pricing data.' },
            { icon: '🛒', title: 'Easy Checkout', desc: 'Seamless buying experience with integrated payment options.' },
            { icon: '🛡️', title: 'Secure Payments', desc: 'Razorpay integration ensures your transactions are safe.' },
            { icon: '📈', title: 'Stock Tracking', desc: 'Real‑time inventory management for all your produce.' },
          ].map((f) => (
            <div key={f.title} className="feature-card card animate-fadeIn">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="contact">
        <div className="container">
          <h2 className="section-title">Get in Touch</h2>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-item">
                <Phone size={20} />
                <div>
                  <h4>Phone</h4>
                  <p>+91 86604 16257</p>
                </div>
              </div>
              <div className="contact-item">
                <Mail size={20} />
                <div>
                  <h4>Email</h4>
                  <p>nikhilgani987@gmail.com</p>
                </div>
              </div>
              <div className="contact-item">
                <MessageSquare size={20} />
                <div>
                  <h4>Support</h4>
                  <p>Available 9 AM – 6 PM IST</p>
                </div>
              </div>
            </div>
            <form
              className="contact-form card"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.post('/queries', { name: contactName, email: contactEmail, message: contactMsg });
                  setContactSent(true);
                  setContactName('');
                  setContactEmail('');
                  setContactMsg('');
                } catch {
                  alert('Message sent successfully!');
                }
              }}
            >
              {contactSent && (
                <div className="badge badge-green" style={{ marginBottom: '1rem', padding: '0.6rem 0.8rem', textAlign: 'center' }}>
                  ✓ Message sent! An Agro Trades Karnataka representative will contact you shortly.
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="input"
                  placeholder="Your name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message / APMC Inquiry</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="How can we help you regarding Karnataka produce, mandis, or trade?"
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" style={{ borderTop: '1px solid var(--color-border)', padding: '2.5rem 0', background: 'var(--color-surface)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', fontSize: '0.9rem' }}>
            <Link to="/terms" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Terms & Conditions</Link>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <Link to="/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <Link to="/refund-policy" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Refund & Cancellation Policy</Link>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <Link to="/contact" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Contact Us</Link>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <Link to="/admin/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Admin Login</Link>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
            © 2026 Karnataka Agro Trades Pvt. Ltd. — Empowering Karnataka's Agriculture & APMC Mandis
          </p>
        </div>
      </footer>
    </div>
  );
}
