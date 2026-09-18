import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  User,
  Phone
} from 'lucide-react';
import { KARNATAKA_DISTRICTS } from '../../data/farmerTradesData';
import './MainAuthPage.css';

/* ── Mint Twin Leaf Logo ── */
const FarmerTradesLogo: React.FC = () => (
  <div className="ft-logo-container">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 28C8 21 4 14 12 8C19 8 20 18 12 28Z" fill="#6EE7B7" opacity="0.9" />
      <path d="M14 27C17 18 24 10 32 10C35 18 26 27 14 27Z" fill="#A7F3D0" />
      <path d="M12 28C14 32 17 35 20 37" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
    <div className="ft-logo-text-group">
      <span className="ft-logo-title">Farmer Trades</span>
      <span className="ft-logo-tagline">GROW SMARTER. TRADE BETTER.</span>
    </div>
  </div>
);

/* ── Farmer Outline Icon (Straw Hat & Leaf) ── */
const FarmerOutlineIcon: React.FC = () => (
  <svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="#86EFAC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 23 C13 21, 18 15, 24 15 C30 15, 35 21, 41 23 C35 24, 13 24, 7 23 Z" />
    <path d="M18 15 C18 11, 20 8, 24 8 C28 8, 30 11, 30 15" />
    <circle cx="24" cy="27" r="5" />
    <path d="M15 41 C15 35, 18 33, 24 33 C30 33, 33 35, 33 41" />
    <path d="M37 34 C40 31, 42 27, 41 23" />
    <path d="M41 23 C38 23, 36 25, 37 27 C38 29, 40 27, 41 23 Z" />
    <path d="M39 28 C42 28, 44 30, 43 32 C42 34, 40 32, 39 28 Z" />
  </svg>
);

/* ── Buyer Outline Icon (Shopping Cart with Leaf) ── */
const BuyerOutlineIcon: React.FC = () => (
  <svg width="46" height="46" viewBox="0 0 48 48" fill="none" stroke="#86EFAC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="16" cy="39" r="2.5" />
    <circle cx="35" cy="39" r="2.5" />
    <path d="M8 12 L13 12 L18 32 L36 32 L40 16 L14 16" />
    <path d="M24 25 C22 21, 23 17, 28 17 C28 22, 26 25, 24 25 Z" fill="rgba(134, 239, 172, 0.25)" />
    <path d="M24 25 C26 23, 27 20, 28 17" strokeWidth="1.2" />
  </svg>
);

export const MainAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, signup, sendOtp, verifyOtp, resetPassword, loginWithGoogle } = useAuth();

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'buyer') navigate('/buyer');
      else navigate('/farmer');
    }
  }, [user, navigate]);

  // View state: 'welcome' (the exact card from the image) | 'login' | 'signup' | 'forgot'
  const [viewMode, setViewMode] = useState<'welcome' | 'login' | 'signup' | 'forgot'>(() => {
    if (location.pathname === '/signup') return 'signup';
    return 'welcome';
  });

  // Role selections
  const [loginRole, setLoginRole] = useState<UserRole>('farmer');
  const [signupRole, setSignupRole] = useState<UserRole>('farmer');

  // Form states (empty by default for user to enter their credentials)
  const [loginEmail, setLoginEmail] = useState(() => {
    return localStorage.getItem('agro_remembered_email') || '';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('agro_remember_me') === 'true';
  });

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupDistrict, setSignupDistrict] = useState('Mandya');
  const [signupTaluk, setSignupTaluk] = useState('');

  // Signup OTP states
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupOtpCode, setSignupOtpCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPw, setForgotNewPw] = useState('');
  const [forgotConfirmPw, setForgotConfirmPw] = useState('');
  const [forgotTimer, setForgotTimer] = useState(0);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Timers
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  useEffect(() => {
    if (forgotTimer > 0) {
      const timer = setTimeout(() => setForgotTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotTimer]);

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Switch role without prefilling dummy credentials
  const handleSelectLoginRole = (role: UserRole) => {
    setLoginRole(role);
    clearMessages();
  };

  // ── Action Handlers from Welcome Screen ──
  const openFarmerLogin = () => {
    setLoginRole('farmer');
    clearMessages();
    setViewMode('login');
  };

  const openFarmerRegister = () => {
    setSignupRole('farmer');
    clearMessages();
    setViewMode('signup');
  };

  const openBuyerLogin = () => {
    setLoginRole('buyer');
    clearMessages();
    setViewMode('login');
  };

  const openBuyerRegister = () => {
    setSignupRole('buyer');
    clearMessages();
    setViewMode('signup');
  };


  // ── Handle Email/Password Login ──
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    const cleanEmail = loginEmail.trim();
    if (!cleanEmail || !loginPassword) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (rememberMe) {
      localStorage.setItem('agro_remember_me', 'true');
      localStorage.setItem('agro_remembered_email', cleanEmail);
    } else {
      localStorage.removeItem('agro_remember_me');
      localStorage.removeItem('agro_remembered_email');
    }

    setLoading(true);
    const res = await login(cleanEmail, loginPassword, loginRole);
    setLoading(false);

    if (res.success) {
      try {
        const saved = localStorage.getItem('agro_user');
        const role = saved ? JSON.parse(saved).role : loginRole;
        if (role === 'admin') navigate('/admin');
        else if (role === 'buyer') navigate('/buyer');
        else navigate('/farmer');
      } catch {
        navigate(loginRole === 'buyer' ? '/buyer' : '/farmer');
      }
    } else {
      setErrorMsg(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  // ── Handle Signup OTP Request ──
  const handleRequestSignupOtp = async () => {
    clearMessages();
    const clean = signupEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive the verification OTP.');
      return;
    }

    setOtpLoading(true);
    const res = await sendOtp(clean);
    setOtpLoading(false);

    if (res.success) {
      setSignupOtpSent(true);
      setSuccessMsg(res.message || `Verification code sent to ${clean}!`);
      setOtpTimer(60);
    } else {
      setErrorMsg(res.error || 'Failed to send OTP verification code.');
    }
  };

  // ── Handle Signup OTP Verification ──
  const handleVerifySignupOtp = async () => {
    clearMessages();
    if (!signupOtpCode.trim() || signupOtpCode.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    setOtpLoading(true);
    const res = await verifyOtp(signupEmail.trim().toLowerCase(), signupOtpCode.trim());
    setOtpLoading(false);

    if (res.success) {
      setIsEmailVerified(true);
      setSuccessMsg('Email verified! You can now create your password to complete registration.');
    } else {
      setErrorMsg(res.error || 'Invalid or expired verification code.');
    }
  };

  // ── Handle Signup Submit ──
  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Validate all required fields
    if (!signupName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!isEmailVerified) {
      setErrorMsg('Please verify your email address with OTP before completing registration.');
      return;
    }

    if (!signupPassword) {
      setErrorMsg('Please enter a password.');
      return;
    }

    if (signupPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (!signupPhone.trim() || signupPhone.trim().length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    const res = await signup(
      signupName.trim(),
      signupEmail.trim().toLowerCase(),
      signupPassword,
      signupRole,
      signupDistrict,
      signupTaluk || undefined,
      undefined,
      undefined,
      signupPhone.trim() || undefined
    );
    setLoading(false);

    if (res.success) {
      if (signupRole === 'farmer') navigate('/farmer');
      else navigate('/buyer');
    } else {
      setErrorMsg(res.error || 'Registration failed. Please try again.');
    }
  };

  // ── Handle Forgot Password OTP Request ──
  const handleSendForgotOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    clearMessages();

    const clean = forgotEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    const res = await sendOtp(clean);
    setLoading(false);

    if (res.success) {
      setForgotOtpSent(true);
      setSuccessMsg(res.message || `Verification code sent to ${clean}!`);
      setForgotTimer(60);
    } else {
      setErrorMsg(res.error || 'Unable to send reset verification code.');
    }
  };

  // ── Handle Reset Password Submit ──
  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    if (forgotNewPw.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (forgotNewPw !== forgotConfirmPw) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(forgotEmail.trim().toLowerCase(), forgotOtp.trim(), forgotNewPw);
    setLoading(false);

    if (res.success) {
      setViewMode('login');
      setLoginEmail(forgotEmail);
      setLoginPassword('');
      setSuccessMsg('Password updated successfully! Please sign in with your new password.');
    } else {
      setErrorMsg(res.error || 'Failed to update password. Please check your OTP code.');
    }
  };

  return (
    <div className="ft-hero-page-root">
      <div className="ft-hero-overlay"></div>

      {/* Main Grid Container */}
      <div className="ft-hero-container">
        {/* ── LEFT COLUMN: Brand Title, Slogan & Agricultural Still Life ── */}
        <div className="ft-hero-left-col">
          <FarmerTradesLogo />

          <div className="ft-hero-text-block">
            <h1 className="ft-hero-main-title">
              Smart Agricultural<br />
              Crop Prediction and<br />
              Trading Platform
            </h1>

            <p className="ft-hero-main-desc">
              Make informed crop choices, explore market prices, and connect farmers with buyers—all in one place.
            </p>

            <div className="ft-hero-motto-wrap">
              <div className="ft-hero-motto-divider"></div>
              <p className="ft-hero-motto-text">
                SMARTER FARMING.<br />
                BETTER CONNECTIONS.<br />
                NEW POSSIBILITIES.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Glassmorphic Dark Emerald Card with Floating Animation ── */}
        <div className="ft-hero-right-col">
          <div className="ft-auth-card animate-float">
            {/* Feedback Alerts */}
            {errorMsg && (
              <div className="ft-alert ft-alert-error" role="alert">
                <AlertCircle size={16} className="ft-alert-icon" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="ft-alert ft-alert-success" role="status">
                <CheckCircle2 size={16} className="ft-alert-icon" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                VIEW 1: WELCOME TO FARMER TRADES (Exact Mockup Match)
               ══════════════════════════════════════════════════════════════ */}
            {viewMode === 'welcome' && (
              <div className="ft-welcome-view animate-fadeIn">
                <div className="ft-card-header">
                  <h2 className="ft-card-heading">Welcome to Farmer Trades</h2>
                  <p className="ft-card-subheading">Choose how you want to get started.</p>
                </div>

                {/* Section 1: For Farmers */}
                <div className="ft-role-section">
                  <div className="ft-role-section-top">
                    <div className="ft-role-icon-box">
                      <FarmerOutlineIcon />
                    </div>
                    <div className="ft-role-info">
                      <h3 className="ft-role-title">For Farmers</h3>
                      <p className="ft-role-desc">
                        Explore crop recommendations and bring your harvest to market.
                      </p>
                    </div>
                  </div>

                  <div className="ft-role-btn-row">
                    <button type="button" onClick={openFarmerLogin} className="ft-btn-solid">
                      <span>Farmer Login</span>
                      <ArrowRight size={16} className="ft-btn-arrow" />
                    </button>
                    <button type="button" onClick={openFarmerRegister} className="ft-btn-outline">
                      Register as Farmer
                    </button>
                  </div>
                </div>

                <div className="ft-section-divider"></div>

                {/* Section 2: For Buyers */}
                <div className="ft-role-section">
                  <div className="ft-role-section-top">
                    <div className="ft-role-icon-box">
                      <BuyerOutlineIcon />
                    </div>
                    <div className="ft-role-info">
                      <h3 className="ft-role-title">For Buyers</h3>
                      <p className="ft-role-desc">
                        Discover fresh produce and connect directly with farmers.
                      </p>
                    </div>
                  </div>

                  <div className="ft-role-btn-row">
                    <button type="button" onClick={openBuyerLogin} className="ft-btn-solid">
                      <span>Buyer Login</span>
                      <ArrowRight size={16} className="ft-btn-arrow" />
                    </button>
                    <button type="button" onClick={openBuyerRegister} className="ft-btn-outline">
                      Register as Buyer
                    </button>
                  </div>
                </div>

                {/* Card Footer Motto */}
                <div className="ft-card-footer">
                  <span className="ft-card-footer-line"></span>
                  <span className="ft-card-footer-text">Growing opportunities, together.</span>
                  <span className="ft-card-footer-line"></span>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                VIEW 2: SIGN IN FORM (With Back Button & Role Toggle)
               ══════════════════════════════════════════════════════════════ */}
            {viewMode === 'login' && (
              <div className="ft-form-view animate-fadeIn">
                <div className="ft-form-top-bar">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('welcome');
                      clearMessages();
                    }}
                    className="ft-btn-back"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Options</span>
                  </button>
                </div>

                <div className="ft-card-header" style={{ marginBottom: '1.25rem' }}>
                  <h2 className="ft-card-heading">
                    {loginRole === 'farmer' ? 'Farmer Sign In' : 'Buyer Sign In'}
                  </h2>
                  <p className="ft-card-subheading">
                    {loginRole === 'farmer'
                      ? 'Access crop listings, trade offers, and smart agriculture tools'
                      : 'Browse fresh farm produce, manage orders, and connect with growers'}
                  </p>
                </div>

                {/* Dual Role Toggle */}
                <div className="ft-role-toggle-bar">
                  <button
                    type="button"
                    className={`ft-toggle-tab ${loginRole === 'farmer' ? 'active' : ''}`}
                    onClick={() => handleSelectLoginRole('farmer')}
                  >
                    <span>🌾 Farmer</span>
                  </button>
                  <button
                    type="button"
                    className={`ft-toggle-tab ${loginRole === 'buyer' ? 'active' : ''}`}
                    onClick={() => handleSelectLoginRole('buyer')}
                  >
                    <span>🛒 Buyer</span>
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="ft-form">
                  <div className="ft-input-group">
                    <label className="ft-input-label">Email Address</label>
                    <div className="ft-input-wrapper">
                      <Mail size={18} className="ft-input-icon" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                        className="ft-text-input"
                      />
                    </div>
                  </div>

                  <div className="ft-input-group">
                    <div className="ft-label-row">
                      <label className="ft-input-label">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('forgot');
                          setForgotEmail(loginEmail);
                          clearMessages();
                        }}
                        className="ft-link-text"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="ft-input-wrapper">
                      <Lock size={18} className="ft-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="ft-text-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ft-eye-btn"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="ft-remember-row">
                    <label className="ft-checkbox-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="ft-checkbox"
                      />
                      <span>Remember me on this device</span>
                    </label>
                  </div>

                  <button type="submit" disabled={loading} className="ft-btn-submit">
                    <span>{loading ? 'Signing In…' : `Sign In as ${loginRole === 'farmer' ? 'Farmer' : 'Buyer'}`}</span>
                    <ArrowRight size={17} />
                  </button>
                </form>

                <div className="ft-switch-prompt">
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSignupRole(loginRole);
                      setViewMode('signup');
                      clearMessages();
                    }}
                    className="ft-link-highlight"
                  >
                    Register as {loginRole === 'farmer' ? 'Farmer' : 'Buyer'}
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                VIEW 3: REGISTRATION FORM (With OTP Verification)
               ══════════════════════════════════════════════════════════════ */}
            {viewMode === 'signup' && (
              <div className="ft-form-view animate-fadeIn">
                <div className="ft-form-top-bar">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('welcome');
                      clearMessages();
                    }}
                    className="ft-btn-back"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Options</span>
                  </button>
                </div>

                <div className="ft-card-header" style={{ marginBottom: '1.25rem' }}>
                  <h2 className="ft-card-heading">
                    Create {signupRole === 'farmer' ? 'Farmer' : 'Buyer'} Account
                  </h2>
                  <p className="ft-card-subheading">
                    Join Smart Agricultural Crop Prediction and Trading Platform
                  </p>
                </div>

                {/* Dual Role Toggle */}
                <div className="ft-role-toggle-bar">
                  <button
                    type="button"
                    className={`ft-toggle-tab ${signupRole === 'farmer' ? 'active' : ''}`}
                    onClick={() => setSignupRole('farmer')}
                  >
                    <span>🌾 Farmer</span>
                  </button>
                  <button
                    type="button"
                    className={`ft-toggle-tab ${signupRole === 'buyer' ? 'active' : ''}`}
                    onClick={() => setSignupRole('buyer')}
                  >
                    <span>🛒 Buyer</span>
                  </button>
                </div>

                <form onSubmit={handleSignupSubmit} className="ft-form">
                  <div className="ft-input-group">
                    <label className="ft-input-label">Full Name *</label>
                    <div className="ft-input-wrapper">
                      <User size={18} className="ft-input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Gowda"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="ft-text-input"
                      />
                    </div>
                  </div>

                  <div className="ft-input-group">
                    <div className="ft-label-row">
                      <label className="ft-input-label">Email Address *</label>
                      {isEmailVerified && (
                        <span className="ft-verified-badge">
                          <CheckCircle2 size={13} /> Verified
                        </span>
                      )}
                    </div>
                    <div className="ft-otp-send-row">
                      <div className="ft-input-wrapper" style={{ flex: 1 }}>
                        <Mail size={18} className="ft-input-icon" />
                        <input
                          type="email"
                          required
                          disabled={isEmailVerified}
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => {
                            setSignupEmail(e.target.value);
                            if (signupOtpSent) {
                              setSignupOtpSent(false);
                              setIsEmailVerified(false);
                            }
                          }}
                          className="ft-text-input"
                        />
                      </div>
                      {!isEmailVerified ? (
                        <button
                          type="button"
                          className="ft-btn-action-otp"
                          disabled={otpLoading || !signupEmail.includes('@') || otpTimer > 0}
                          onClick={handleRequestSignupOtp}
                        >
                          {otpLoading
                            ? 'Sending…'
                            : otpTimer > 0
                            ? `Resend (${otpTimer}s)`
                            : signupOtpSent
                            ? 'Resend OTP'
                            : 'Verify Email'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="ft-btn-action-otp"
                          style={{ background: '#334155' }}
                          onClick={() => {
                            setIsEmailVerified(false);
                            setSignupOtpSent(false);
                            setSignupOtpCode('');
                          }}
                        >
                          Change
                        </button>
                      )}
                    </div>
                  </div>

                  {/* OTP Input box */}
                  {signupOtpSent && !isEmailVerified && (
                    <div className="ft-otp-verify-box animate-fadeIn">
                      <div className="ft-otp-verify-title">
                        <ShieldCheck size={17} />
                        <span>Enter 6-Digit Email Verification Code</span>
                      </div>
                      <div className="ft-otp-send-row">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="• • • • • •"
                          value={signupOtpCode}
                          onChange={(e) => setSignupOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="ft-otp-code-input"
                        />
                        <button
                          type="button"
                          disabled={otpLoading || signupOtpCode.trim().length !== 6}
                          onClick={handleVerifySignupOtp}
                          className="ft-btn-action-otp"
                        >
                          {otpLoading ? 'Verifying…' : 'Submit Code'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Password, Mobile and District Fields Directly Available */}
                  <div className="ft-input-row-2col">
                    <div className="ft-input-group">
                      <label className="ft-input-label">Password *</label>
                      <div className="ft-input-wrapper">
                        <Lock size={18} className="ft-input-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 8 characters"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="ft-text-input"
                        />
                      </div>
                    </div>
                    <div className="ft-input-group">
                      <label className="ft-input-label">Confirm Password *</label>
                      <div className="ft-input-wrapper">
                        <Lock size={18} className="ft-input-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Repeat password"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          className="ft-text-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ft-input-group">
                    <label className="ft-input-label">Mobile Number (10 Digits) *</label>
                    <div className="ft-input-wrapper">
                      <Phone size={18} className="ft-input-icon" />
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        placeholder="e.g. 9876543210"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                        className="ft-text-input"
                      />
                    </div>
                  </div>

                  <div className="ft-input-row-2col">
                    <div className="ft-input-group">
                      <label className="ft-input-label">District *</label>
                      <select
                        value={signupDistrict}
                        onChange={(e) => setSignupDistrict(e.target.value)}
                        className="ft-select-input"
                      >
                        {KARNATAKA_DISTRICTS.map((d) => (
                          <option key={d} value={d} style={{ color: '#0f172a', background: '#ffffff' }}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="ft-input-group">
                      <label className="ft-input-label">Taluk / Mandi</label>
                      <input
                        type="text"
                        placeholder="e.g. Maddur / APMC"
                        value={signupTaluk}
                        onChange={(e) => setSignupTaluk(e.target.value)}
                        className="ft-text-input"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="ft-btn-submit" style={{ marginTop: '0.5rem' }}>
                    <span>{loading ? 'Creating Account…' : !isEmailVerified ? '⚠ Verify Email First to Register' : 'Complete Account Registration'}</span>
                    <ArrowRight size={17} />
                  </button>

                </form>

                <div className="ft-switch-prompt">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole(signupRole);
                      setViewMode('login');
                      clearMessages();
                    }}
                    className="ft-link-highlight"
                  >
                    Sign In here
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                VIEW 4: RESET PASSWORD VIEW
               ══════════════════════════════════════════════════════════════ */}
            {viewMode === 'forgot' && (
              <div className="ft-form-view animate-fadeIn">
                <div className="ft-form-top-bar">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      clearMessages();
                    }}
                    className="ft-btn-back"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Sign In</span>
                  </button>
                </div>

                <div className="ft-card-header" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <KeyRound size={32} style={{ color: '#86efac' }} />
                  </div>
                  <h2 className="ft-card-heading">Reset Password</h2>
                  <p className="ft-card-subheading">
                    Verify your registered email with an OTP code to update your password
                  </p>
                </div>

                {!forgotOtpSent ? (
                  <form onSubmit={handleSendForgotOtp} className="ft-form">
                    <div className="ft-input-group">
                      <label className="ft-input-label">Registered Email Address</label>
                      <div className="ft-input-wrapper">
                        <Mail size={18} className="ft-input-icon" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. farmer@agro.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="ft-text-input"
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="ft-btn-submit">
                      <span>{loading ? 'Sending Code…' : 'Send Verification OTP'}</span>
                      <ArrowRight size={17} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="ft-form">
                    <div className="ft-input-group">
                      <label className="ft-input-label">Enter 6-Digit OTP sent to {forgotEmail}</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="• • • • • •"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                        className="ft-otp-code-input"
                      />
                    </div>

                    <div className="ft-input-group">
                      <label className="ft-input-label">New Password (minimum 8 characters)</label>
                      <div className="ft-input-wrapper">
                        <Lock size={18} className="ft-input-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={forgotNewPw}
                          onChange={(e) => setForgotNewPw(e.target.value)}
                          className="ft-text-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="ft-eye-btn"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="ft-input-group">
                      <label className="ft-input-label">Confirm New Password</label>
                      <div className="ft-input-wrapper">
                        <Lock size={18} className="ft-input-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={forgotConfirmPw}
                          onChange={(e) => setForgotConfirmPw(e.target.value)}
                          className="ft-text-input"
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="ft-btn-submit">
                      <span>{loading ? 'Updating Password…' : 'Update Password & Sign In'}</span>
                      <ArrowRight size={17} />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainAuthPage;
