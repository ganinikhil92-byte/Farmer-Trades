import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useVideoScrub } from '../../hooks/useVideoScrub';
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
  Phone,
  Sprout,
  ShoppingCart,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import { KARNATAKA_DISTRICTS } from '../../data/farmerTradesData';
import './MainAuthPage.css';

/* ── Hero Video Asset ── */
const HERO_VIDEO_SRC = '/videos/farmer-trades-hero.mp4';

export const MainAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, signup, sendOtp, verifyOtp, resetPassword } = useAuth();

  /* ── Video Background & Mouse-Scrub ── */
  const videoRef = useRef<HTMLVideoElement>(null);
  useVideoScrub(videoRef);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'buyer') navigate('/buyer');
      else navigate('/farmer');
    }
  }, [user, navigate]);

  // View state: 'welcome' | 'login' | 'signup' | 'forgot'
  const [viewMode, setViewMode] = useState<'welcome' | 'login' | 'signup' | 'forgot'>('login');

  // Sync viewMode from URL
  useEffect(() => {
    if (location.pathname === '/signup') {
      setViewMode('signup');
      clearMessages();
    } else {
      setViewMode('login');
      clearMessages();
    }
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get('role');
    if (r === 'buyer') {
      setLoginRole('buyer');
      setSignupRole('buyer');
    } else if (r === 'farmer') {
      setLoginRole('farmer');
      setSignupRole('farmer');
    }
  }, [location.search]);

  // Role selections
  const [loginRole, setLoginRole] = useState<UserRole>(() => {
    const params = new URLSearchParams(location.search);
    return params.get('role') === 'buyer' ? 'buyer' : 'farmer';
  });
  const [signupRole, setSignupRole] = useState<UserRole>(() => {
    const params = new URLSearchParams(location.search);
    return params.get('role') === 'buyer' ? 'buyer' : 'farmer';
  });

  // Form states
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

  // Switch role without losing fields
  const handleSelectLoginRole = (role: UserRole) => {
    setLoginRole(role);
    clearMessages();
  };

  const handleSelectSignupRole = (role: UserRole) => {
    setSignupRole(role);
    clearMessages();
  };

  // Clear form fields and saved email
  const handleClearLoginForm = () => {
    setLoginEmail('');
    setLoginPassword('');
    localStorage.removeItem('agro_remembered_email');
    localStorage.removeItem('agro_remember_me');
    setRememberMe(false);
    clearMessages();
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
    <div className="ft-auth-root">
      {/* ── 1. Full-Screen Agricultural Background Video with Fallback ── */}
      <div className="ft-auth-bg-wrapper">
        <video
          ref={videoRef}
          className="ft-auth-video"
          muted
          playsInline
          preload="auto"
          poster="/farmer_hero_bg.jpg"
          aria-hidden="true"
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
        <div
          className="ft-auth-bg-fallback"
          style={{ backgroundImage: "url('/farmer_hero_bg.jpg')" }}
          aria-hidden="true"
        />
        {/* ── 2. Ambient Dark Mood Vignette ── */}
        <div className="ft-auth-overlay" aria-hidden="true" />
      </div>

      {/* ── Main Content: Responsive Container ── */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center w-full min-h-screen py-8 px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[1440px] mx-auto">
        
        {/* Mobile Brand Header: Visible below lg */}
        <div className="lg:hidden flex flex-col items-center text-center mb-8 px-2 w-full max-w-[480px]">
          <div className="flex items-center gap-3 mb-1.5">
            <Sprout size={32} className="text-[#86efac]" strokeWidth={2.4} />
            <h1
              className="text-[28px] font-bold text-white leading-tight tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Farmer Trades
            </h1>
          </div>
          <p className="text-[#86efac] text-[10px] font-bold tracking-[0.22em] uppercase">
            GROW SMARTER. TRADE BETTER.
          </p>
        </div>

        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8">
          
          {/* ── 3. LEFT HERO CONTENT / BRANDING SECTION (Desktop only) ── */}
          <div className="hidden lg:flex lg:w-[52%] max-w-2xl flex-col justify-center ft-hero-entrance pl-2 lg:pl-6 xl:pl-10 pr-6">
            
            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-3.5 mb-8">
              <div className="text-[#86efac]">
                <Sprout size={36} strokeWidth={2.4} />
              </div>
              <div>
                <h3
                  className="text-white text-[28px] sm:text-[32px] font-bold tracking-tight leading-none"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Farmer Trades
                </h3>
                <p className="text-[#86efac] text-[10.5px] font-bold tracking-[0.22em] uppercase mt-1">
                  GROW SMARTER. TRADE BETTER.
                </p>
              </div>
            </div>

            {/* Large Serif Headline */}
            <h1
              className="text-white tracking-tight font-bold leading-[1.08] mb-6 select-none text-[44px] sm:text-[54px] lg:text-[62px]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.65)',
              }}
            >
              Smart Agricultural
              <br />
              Crop Prediction and
              <br />
              Trading Platform
            </h1>

            {/* Left Description */}
            <p
              className="text-[#e2e8f0]/85 leading-relaxed max-w-xl mb-8 select-none text-[16px] sm:text-[17px]"
              style={{
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              }}
            >
              Make informed crop choices, explore market prices, and connect farmers with buyers—all in one place.
            </p>

            {/* Small Olive/Emerald Line & Tagline */}
            <div className="mt-2">
              <div className="w-12 h-[2px] bg-[#86efac] mb-5 opacity-90" />
              <p className="uppercase tracking-[0.22em] text-[12px] font-semibold text-[#a7f3d0]/80 select-none leading-relaxed">
                SMARTER FARMING.
                <br />
                BETTER CONNECTIONS.
                <br />
                NEW POSSIBILITIES.
              </p>
            </div>
          </div>

          {/* ── 4. RIGHT EXACT LOGIN PANEL ── */}
          <div className="w-full lg:w-[46%] flex flex-col items-center lg:items-end">
            {/* Back to Home Button (outside the card so card interior matches screenshot exactly) */}
            <div className="w-full max-w-[460px] mx-auto lg:mx-0 mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 text-[#a7f3d0]/75 hover:text-[#74ebb0] transition-colors text-[13px] font-medium cursor-pointer bg-transparent border-none p-0 outline-none"
              >
                <ArrowLeft size={15} />
                <span>Back to Home</span>
              </button>
            </div>

            <div className="w-full max-w-[460px] ft-exact-card mx-auto lg:mx-0 p-8 sm:p-9 ft-card-entrance">
              {/* Feedback Alerts */}
              {errorMsg && (
                <div
                  className="bg-rose-500/10 border border-rose-500/25 text-rose-200 rounded-lg px-3.5 py-2.5 mb-4 flex items-start gap-2 text-[13px]"
                  role="alert"
                >
                  <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div
                  className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 rounded-lg px-3.5 py-2.5 mb-4 flex items-start gap-2 text-[13px]"
                  role="status"
                >
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  VIEW 1: SIGN IN VIEW (Pixel-perfect match to screenshot)
                 ══════════════════════════════════════════════════════════════ */}
              {(viewMode === 'login' || viewMode === 'welcome') && (
                <div>
                  {/* Dynamic Heading */}
                  <div className="mb-5">
                    <h2
                      className="text-[30px] sm:text-[32px] font-bold text-white tracking-tight leading-tight"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {loginRole === 'farmer' ? 'Farmer Sign In' : 'Buyer Sign In'}
                    </h2>
                    <p className="text-[#9ca3af] text-[13.5px] mt-1.5 leading-relaxed">
                      {loginRole === 'farmer'
                        ? 'Access crop listings, trade offers, and smart agriculture tools'
                        : 'Access fresh produce, negotiate directly, and manage trades'}
                    </p>
                  </div>

                  {/* Segmented Farmer / Buyer Selector */}
                  <div className="ft-exact-role-bar mb-5">
                    <button
                      type="button"
                      onClick={() => handleSelectLoginRole('farmer')}
                      className={`ft-exact-role-btn ${loginRole === 'farmer' ? 'active' : ''}`}
                    >
                      <span className="text-[16px]">🌾</span>
                      <span>Farmer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectLoginRole('buyer')}
                      className={`ft-exact-role-btn ${loginRole === 'buyer' ? 'active' : ''}`}
                    >
                      <span className="text-[15px]">🛒</span>
                      <span>Buyer</span>
                    </button>
                  </div>

                  {/* Sign In Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                      <label className="block text-[13px] text-[#9ca3af] font-medium mb-1.5">
                        Email Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail size={16} className="absolute left-3.5 z-10 text-[#86efac]/40 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="nikhilgani293@gmail.com"
                          autoComplete="email"
                          className="ft-exact-input ft-input-with-icon"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[13px] text-[#9ca3af] font-medium">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setViewMode('forgot');
                            setForgotEmail(loginEmail);
                            clearMessages();
                          }}
                          className="text-[#74ebb0] hover:underline text-[13px] font-medium transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••"
                          autoComplete="current-password"
                          className="ft-exact-input px-4 h-[48px]"
                        />
                      </div>
                    </div>

                    {/* Remember Me */}
                    <div
                      className="flex items-center gap-2.5 pt-0.5 select-none cursor-pointer"
                      onClick={() => setRememberMe(!rememberMe)}
                    >
                      <div
                        className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors ${
                          rememberMe
                            ? 'bg-[#74ebb0] text-[#052e16]'
                            : 'border border-[#74ebb0]/40 bg-black/40'
                        }`}
                      >
                        {rememberMe && <Check size={12} strokeWidth={3.5} />}
                      </div>
                      <span className="text-[#9ca3af] text-[13.5px] font-medium">
                        Remember me on this device
                      </span>
                    </div>

                    {/* Sign In Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="ft-exact-submit-btn mt-5"
                    >
                      <span>
                        {loading
                          ? 'Signing In…'
                          : `Sign In as ${loginRole === 'farmer' ? 'Farmer' : 'Buyer'}`}
                      </span>
                      <ArrowRight size={17} />
                    </button>
                  </form>

                  {/* Register Link */}
                  <div className="text-center mt-6 text-[13.5px]">
                    <span className="text-[#9ca3af]">Don't have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSignupRole(loginRole);
                        setViewMode('signup');
                        clearMessages();
                      }}
                      className="text-[#74ebb0] hover:underline font-semibold cursor-pointer bg-transparent border-none p-0 outline-none"
                    >
                      Register as {loginRole === 'farmer' ? 'Farmer' : 'Buyer'}
                    </button>
                  </div>

                  {/* Admin Portal Gateway Link */}
                  <div className="text-center mt-3 pt-3 border-t border-white/10 text-[12.5px]">
                    <span className="text-white/45">Official Administrator? </span>
                    <Link
                      to="/admin/login"
                      className="text-[#86efac] hover:underline font-semibold cursor-pointer"
                    >
                      Admin Portal Login →
                    </Link>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  VIEW 2: REGISTRATION VIEW
                 ══════════════════════════════════════════════════════════════ */}
              {viewMode === 'signup' && (
                <div>
                  <div className="mb-5">
                    <h2
                      className="text-[26px] sm:text-[30px] font-bold text-white tracking-tight leading-tight"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Create {signupRole === 'farmer' ? 'Farmer' : 'Buyer'} Account
                    </h2>
                    <p className="text-white/45 text-[13px] mt-1.5">
                      Join Smart Agricultural Crop Prediction and Trading Platform
                    </p>
                  </div>

                  {/* Segmented Farmer / Buyer Selector */}
                  <div className="ft-exact-role-bar mb-4">
                    <button
                      type="button"
                      onClick={() => handleSelectSignupRole('farmer')}
                      className={`ft-exact-role-btn ${signupRole === 'farmer' ? 'active' : ''}`}
                    >
                      <span className="text-[16px]">🌾</span>
                      <span>Farmer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSignupRole('buyer')}
                      className={`ft-exact-role-btn ${signupRole === 'buyer' ? 'active' : ''}`}
                    >
                      <span className="text-[15px]">🛒</span>
                      <span>Buyer</span>
                    </button>
                  </div>

                  {/* Signup Form */}
                  <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[13px] text-white/55 font-medium mb-1">
                        Full Name *
                      </label>
                      <div className="relative flex items-center">
                        <User size={15} className="absolute left-3.5 z-10 text-[#86efac]/35 pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Gowda"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="ft-exact-input ft-input-with-icon"
                        />
                      </div>
                    </div>

                    {/* Email with OTP Verification */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[13px] text-white/55 font-medium">
                          Email Address *
                        </label>
                        {isEmailVerified && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                            <CheckCircle2 size={13} /> Verified
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2.5">
                        <div className="relative flex items-center flex-1">
                          <Mail size={15} className="absolute left-3.5 z-10 text-[#86efac]/35 pointer-events-none" />
                          <input
                            type="email"
                            required
                            disabled={isEmailVerified}
                            placeholder="nikhilgani293@gmail.com"
                            value={signupEmail}
                            onChange={(e) => {
                              setSignupEmail(e.target.value);
                              if (signupOtpSent) {
                                setSignupOtpSent(false);
                                setIsEmailVerified(false);
                              }
                            }}
                            className="ft-exact-input ft-input-with-icon"
                          />
                        </div>
                        {!isEmailVerified ? (
                          <button
                            type="button"
                            className="ft-exact-otp-btn"
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
                            className="ft-exact-otp-btn"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}
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

                    {/* OTP Box */}
                    {signupOtpSent && !isEmailVerified && (
                      <div className="bg-black/40 border border-[#86efac]/30 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                          <ShieldCheck size={16} className="text-[#86efac]" />
                          <span>Enter 6-Digit Email Verification Code</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="• • • • • •"
                            value={signupOtpCode}
                            onChange={(e) => setSignupOtpCode(e.target.value.replace(/\D/g, ''))}
                            className="ft-exact-input text-center tracking-[0.3em] font-mono h-[46px]"
                          />
                          <button
                            type="button"
                            disabled={otpLoading || signupOtpCode.trim().length !== 6}
                            onClick={handleVerifySignupOtp}
                            className="ft-exact-otp-btn h-[46px]"
                          >
                            {otpLoading ? 'Verifying…' : 'Submit'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[13px] text-white/55 font-medium mb-1">
                          Password *
                        </label>
                        <div className="relative flex items-center">
                          <Lock size={15} className="absolute left-3.5 z-10 text-[#86efac]/35 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••••"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="ft-exact-input ft-input-with-icon text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] text-white/55 font-medium mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative flex items-center">
                          <Lock size={15} className="absolute left-3.5 z-10 text-[#86efac]/35 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Repeat password"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            className="ft-exact-input ft-input-with-icon text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-[13px] text-white/55 font-medium mb-1">
                        Mobile Number (10 Digits) *
                      </label>
                      <div className="relative flex items-center">
                        <Phone size={15} className="absolute left-3.5 z-10 text-[#86efac]/35 pointer-events-none" />
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          placeholder="e.g. 9876543210"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                          className="ft-exact-input ft-input-with-icon"
                        />
                      </div>
                    </div>

                    {/* District & Taluk */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[13px] text-white/55 font-medium mb-1">
                          District *
                        </label>
                        <select
                          value={signupDistrict}
                          onChange={(e) => setSignupDistrict(e.target.value)}
                          className="ft-exact-select px-4 h-[48px]"
                        >
                          {KARNATAKA_DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] text-white/55 font-medium mb-1">
                          Taluk / Mandi
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Maddur / APMC"
                          value={signupTaluk}
                          onChange={(e) => setSignupTaluk(e.target.value)}
                          className="ft-exact-input px-4 h-[48px]"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="ft-exact-submit-btn mt-4"
                    >
                      <span>
                        {loading
                          ? 'Creating Account…'
                          : !isEmailVerified
                          ? '⚠ Verify Email First to Register'
                          : 'Complete Account Registration →'}
                      </span>
                    </button>
                  </form>

                  {/* Switch to Sign In */}
                  <div className="text-center mt-5 text-[13px]">
                    <span className="text-[#9ca3af]">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginRole(signupRole);
                        setViewMode('login');
                        clearMessages();
                      }}
                      className="text-[#86efac] hover:underline font-semibold cursor-pointer bg-transparent border-none p-0 outline-none"
                    >
                      Sign In here
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  VIEW 3: RESET PASSWORD VIEW
                 ══════════════════════════════════════════════════════════════ */}
              {viewMode === 'forgot' && (
                <div>
                  <div className="mb-5">
                    <div className="w-11 h-11 rounded-full bg-[#86efac]/10 border border-[#86efac]/20 flex items-center justify-center mb-3.5 text-[#86efac]">
                      <KeyRound size={20} />
                    </div>
                    <h2
                      className="text-[26px] sm:text-[30px] font-bold text-white tracking-tight leading-tight"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      Reset Password
                    </h2>
                    <p className="text-white/45 text-[13px] mt-1.5">
                      Verify your registered email with an OTP code to update your password
                    </p>
                  </div>

                  {!forgotOtpSent ? (
                    <form onSubmit={handleSendForgotOtp} className="space-y-5">
                      <div>
                      <label className="block text-[13px] text-white/55 font-medium mb-1.5">
                          Registered Email Address
                        </label>
                        <div className="relative flex items-center">
                          <Mail size={17} className="absolute left-3.5 z-10 text-[#86efac]/40 pointer-events-none" />
                          <input
                            type="email"
                            required
                            placeholder="e.g. farmer@agro.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="ft-exact-input ft-input-with-icon"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="ft-exact-submit-btn mt-4"
                      >
                        <span>{loading ? 'Sending Code…' : 'Send Verification OTP →'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[13px] text-white/55 font-medium mb-1">
                          Enter 6-Digit OTP sent to {forgotEmail}
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          placeholder="• • • • • •"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                          className="ft-exact-input text-center tracking-[0.3em] font-mono h-[48px]"
                        />
                      </div>

                      <div>
                        <label className="block text-[13px] text-white/55 font-medium mb-1">
                          New Password (minimum 8 characters)
                        </label>
                        <div className="relative flex items-center">
                          <Lock size={16} className="absolute left-3.5 z-10 text-[#86efac]/40 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={forgotNewPw}
                            onChange={(e) => setForgotNewPw(e.target.value)}
                            className="ft-exact-input ft-input-with-icon pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 text-white/50 hover:text-white transition-colors cursor-pointer p-1 bg-transparent border-none outline-none"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[13px] text-white/55 font-medium mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative flex items-center">
                          <Lock size={16} className="absolute left-3.5 z-10 text-[#86efac]/40 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={forgotConfirmPw}
                            onChange={(e) => setForgotConfirmPw(e.target.value)}
                            className="ft-exact-input ft-input-with-icon"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="ft-exact-submit-btn mt-5"
                      >
                        <span>{loading ? 'Updating Password…' : 'Update Password & Sign In →'}</span>
                      </button>
                    </form>
                  )}

                  <div className="text-center mt-6 text-[14px]">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('login');
                        clearMessages();
                      }}
                      className="text-[#86efac] hover:underline transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default MainAuthPage;
