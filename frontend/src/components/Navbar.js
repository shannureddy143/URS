import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h2 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800' }}>
          ☂️ RainShield
        </h2>
        <div className="wallet-balance">
          👛 ₹{user?.walletBalance || 0}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          🏠 Home
        </button>
        <button className="btn btn-success" onClick={() => navigate('/umbrellas')}>
          ☂️ Find Umbrellas
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/wallet')}>
          💳 My Wallet
        </button>
        <button className="btn" style={{ background: '#6b7280', color: 'white' }} onClick={() => navigate('/profile')}>
          👤 Profile
        </button>
        <button 
          className="btn" 
          onClick={handleLogout} 
          style={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
            color: 'white',
            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;