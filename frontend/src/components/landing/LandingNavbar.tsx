import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

/* ── Hamburger Bar Helper ── */
const Bar: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <span
    className="block w-6 h-[2px] bg-white transition-all duration-300 rounded-full"
    style={style}
  />
);

interface LandingNavbarProps {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LandingNavbar: React.FC<LandingNavbarProps> = ({
  menuOpen,
  setMenuOpen,
}) => {
  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, [setMenuOpen]);

  return (
    <nav className="ft-landing-nav" aria-label="Main navigation">
      {/* ── Brand Logo ── */}
      <Link to="/" className="ft-nav-brand">
        <span className="ft-nav-brand-title">Farmer Trades</span>
        <span className="ft-nav-star" aria-hidden="true">
          ✳︎
        </span>
      </Link>


      {/* ── Desktop CTAs ── */}
      <div className="hidden md:flex ft-nav-actions">
        <Link to="/login" className="ft-nav-btn-login">
          Sign In
        </Link>
        <Link to="/signup" className="ft-nav-btn-signup">
          Join Platform
        </Link>
      </div>

      {/* ── Mobile Hamburger Toggle ── */}
      <button
        type="button"
        className="flex flex-col gap-[5px] md:hidden relative z-[65] p-2 focus:outline-none"
        onClick={toggleMenu}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <Bar
          style={
            menuOpen
              ? { transform: 'rotate(45deg) translateY(7px)' }
              : undefined
          }
        />
        <Bar style={menuOpen ? { opacity: 0 } : undefined} />
        <Bar
          style={
            menuOpen
              ? { transform: 'rotate(-45deg) translateY(-7px)' }
              : undefined
          }
        />
      </button>
    </nav>
  );
};

export default LandingNavbar;
