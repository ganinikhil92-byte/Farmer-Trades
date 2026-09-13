import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function BuyerDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-header" style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.25rem' }}>Welcome, {user?.name} 🛒</h1>
      </div>
    </div>
  );
}
