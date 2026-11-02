import React from 'react';
import { Link } from 'react-router-dom';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="ft-mobile-menu-overlay" aria-hidden={!open}>


      <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link
          to="/login"
          className="ft-hero-pill ft-hero-pill-white"
          onClick={onClose}
          style={{ justifyContent: 'center', textAlign: 'center' }}
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="ft-hero-pill ft-hero-pill-emerald"
          onClick={onClose}
          style={{ justifyContent: 'center', textAlign: 'center' }}
        >
          Join Platform Free
        </Link>
      </div>
    </div>
  );
};

export default MobileMenu;
