import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalHistory, setRentalHistory] = useState([]);

  useEffect(() => {
    fetchActiveRentals();
    fetchRentalHistory();
  }, []);

  const fetchActiveRentals = async () => {
    try {
      const response = await api.get('/rentals/active');
      setActiveRentals(Array.isArray(response.data) ? response.data : [response.data].filter(Boolean));
    } catch (error) {
      console.log('No active rentals');
    }
  };

  const fetchRentalHistory = async () => {
    try {
      const response = await api.get('/rentals/history');
      setRentalHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch rental history');
    }
  };

  const needsDeposit = !user?.depositMade;

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
            Hey there! 😊 What's the plan today?
          </h2>
          
          {needsDeposit && (
            <div style={{ 
              background: '#fef3c7', 
              border: '1px solid #f59e0b', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '20px' 
            }}>
              <h3 style={{ color: '#92400e', marginBottom: '8px' }}>🚀 Quick Setup Needed!</h3>
              <p style={{ color: '#92400e', marginBottom: '12px' }}>
                Just add ₹300 to get started - we'll throw in ₹100 bonus! Pretty sweet deal, right? 🎉
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/wallet')}
              >
                Let's do this!
              </button>
            </div>
          )}

          <div className="grid grid-2">
            <div className="card" style={{ background: '#f0f9ff', border: '2px solid #0ea5e9', animation: 'wobble 4s infinite' }}>
              <h3 style={{ color: '#0c4a6e', marginBottom: '12px' }}>💰 Your Cash</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0c4a6e', animation: 'blink 2s infinite' }}>
                ₹{user?.walletBalance || 0}
              </div>
              <button 
                className="btn btn-primary btn-animate mt-4"
                onClick={() => navigate('/wallet')}
              >
                💳 Add Money
              </button>
            </div>

            <div className="card" style={{ background: '#f0fdf4', border: '2px solid #10b981' }}>
              <h3 style={{ color: '#065f46', marginBottom: '12px' }}>☂️ Need an Umbrella?</h3>
              <p style={{ color: '#065f46', marginBottom: '16px' }}>
                Rain clouds looking suspicious? We've got you covered! 🌧️
              </p>
              <button 
                className="btn btn-success btn-animate"
                onClick={() => navigate('/umbrellas')}
                disabled={needsDeposit}
              >
                🎆 Find Umbrellas
              </button>
            </div>
          </div>

          {activeRentals.length > 0 && (
            <div className="card" style={{ background: '#fef3c7', border: '1px solid #f59e0b', marginTop: '20px' }}>
              <h3 style={{ color: '#92400e', marginBottom: '12px' }}>🎆 Your Umbrellas ({activeRentals.length})</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {activeRentals.map((rental, index) => (
                  <div key={rental._id} style={{ 
                    padding: '8px 0', 
                    borderBottom: index < activeRentals.length - 1 ? '1px solid rgba(146, 64, 14, 0.2)' : 'none'
                  }}>
                    <p style={{ color: '#92400e', fontSize: '0.9rem' }}>
                      ☂️ {rental.umbrella?.umbrellaId} | Started: {new Date(rental.startTime).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <button 
                className="btn btn-primary mt-4"
                onClick={() => navigate('/tracking')}
              >
                See Where They Are
              </button>
            </div>
          )}

          <div className="card" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>📋 Your Rental History</h3>
            {rentalHistory.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                No adventures yet! Time to grab your first umbrella and beat the rain! 🌈
              </p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {rentalHistory.slice(0, 5).map((rental) => (
                  <div key={rental._id} style={{ 
                    padding: '12px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{rental.umbrella?.umbrellaId}</strong>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {new Date(rental.startTime).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold' }}>₹{rental.totalAmount}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {rental.duration}h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;