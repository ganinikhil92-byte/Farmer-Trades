import React from 'react';
import FarmerTradesNav from './FarmerTradesNav';
import FarmerTradesFooter from './FarmerTradesFooter';

interface FarmerTradesLayoutProps {
  children: React.ReactNode;
}

export const FarmerTradesLayout: React.FC<FarmerTradesLayoutProps> = ({ children }) => {
  return (
    <div className="farmer-trades-app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <FarmerTradesNav />
      <main style={{ flex: 1 }}>{children}</main>
      <FarmerTradesFooter />
    </div>
  );
};

export default FarmerTradesLayout;
