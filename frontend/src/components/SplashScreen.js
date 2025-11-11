import React from 'react';

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="splash-logo">☂️</div>
      <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '16px', color: 'white' }}>RainShield</h1>
      <p style={{ fontSize: '1.4rem', opacity: 0.95, fontWeight: '300', letterSpacing: '1px' }}>Never get caught in the rain again!</p>
      <div style={{ 
        marginTop: '48px', 
        fontSize: '1.1rem', 
        opacity: 0.9,
        background: 'rgba(255,255,255,0.1)',
        padding: '16px 32px',
        borderRadius: '25px',
        backdropFilter: 'blur(10px)'
      }}>
        🌧️ Grab an umbrella, return it anywhere! ☂️
      </div>
      <div style={{
        position: 'absolute',
        bottom: '40px',
        fontSize: '0.9rem',
        opacity: 0.7,
        fontWeight: '300'
      }}>
        Made with ❤️ for CU Students
      </div>
    </div>
  );
};

export default SplashScreen;