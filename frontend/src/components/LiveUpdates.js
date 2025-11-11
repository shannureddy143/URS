import React, { useState, useEffect } from 'react';
import { subscribeToUpdates, unsubscribeFromUpdates } from '../services/socket';

const LiveUpdates = () => {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const handleUpdate = (data) => {
      setUpdates(prev => [data, ...prev.slice(0, 4)]);
    };

    subscribeToUpdates(handleUpdate);

    return () => {
      unsubscribeFromUpdates();
    };
  }, []);

  if (updates.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>Live Updates</h4>
      {updates.map((update, index) => (
        <div key={index} style={{
          padding: '8px',
          background: '#f0f9ff',
          borderRadius: '4px',
          marginBottom: '8px',
          fontSize: '14px'
        }}>
          {update.type === 'deposit' ? (
            <span>💰 New deposit: ₹{update.amount}</span>
          ) : update.type === 'cashback' ? (
            <span>🎉 Cashback: ₹{update.amount}</span>
          ) : (
            <span>👤 New user: {update.email}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default LiveUpdates;