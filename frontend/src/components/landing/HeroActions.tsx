import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroActions: React.FC = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) {
      setVisible(true);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`ft-hero-pill-row ${visible ? 'pill-reveal' : 'opacity-0'}`}>
      <button
        type="button"
        className="ft-hero-pill ft-hero-pill-white text-base py-3 px-8 font-semibold shadow-lg hover:shadow-xl"
        onClick={() => navigate('/login')}
        title="Sign in as Farmer or Buyer"
      >
        <span>Sign In</span>
      </button>

      <button
        type="button"
        className="ft-hero-pill ft-hero-pill-emerald text-base py-3 px-8 font-semibold shadow-lg hover:shadow-xl"
        onClick={() => navigate('/signup')}
        title="Join Platform - Register as Farmer or Buyer"
      >
        <span>Join Platform</span>
      </button>
    </div>
  );
};

export default HeroActions;
