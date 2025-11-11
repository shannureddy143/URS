import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const Wallet = () => {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState(300);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/wallet/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions');
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const handleDeposit = () => {
    if (amount < 100) {
      alert('Minimum deposit amount is ₹100');
      return;
    }
    setShowPaymentModal(true);
  };

  const processPayment = async (method) => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const verifyResponse = await api.post('/wallet/verify-deposit', {
        paymentId: `${method}_${Date.now()}`,
        amount,
        paymentMethod: method
      });
      
      updateUser({ walletBalance: verifyResponse.data.walletBalance });
      alert(`Payment successful via ${method}!`);
      fetchTransactions();
      setAmount(300);
      setShowPaymentModal(false);
    } catch (error) {
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const PaymentModal = () => {
    if (!showPaymentModal) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div className="card" style={{ width: '400px', maxWidth: '90vw' }}>
          <h3 style={{ marginBottom: '20px' }}>Select Payment Method</h3>
          <div style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 'bold' }}>
            Amount: ₹{amount}
          </div>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <button
              className="btn"
              style={{ background: '#10b981', color: 'white', padding: '16px', textAlign: 'left' }}
              onClick={() => processPayment('UPI')}
              disabled={loading}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>📱</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>UPI Payment</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Pay using UPI ID</div>
                </div>
              </div>
            </button>
            
            <button
              className="btn"
              style={{ background: '#3b82f6', color: 'white', padding: '16px', textAlign: 'left' }}
              onClick={() => processPayment('QR Code')}
              disabled={loading}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>📷</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>QR Code</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Scan QR to pay</div>
                </div>
              </div>
            </button>
            
            <button
              className="btn"
              style={{ background: '#8b5cf6', color: 'white', padding: '16px', textAlign: 'left' }}
              onClick={() => processPayment('Card')}
              disabled={loading}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>💳</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Credit/Debit Card</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Visa, Mastercard, RuPay</div>
                </div>
              </div>
            </button>
            
            <button
              className="btn"
              style={{ background: '#f59e0b', color: 'white', padding: '16px', textAlign: 'left' }}
              onClick={() => processPayment('Wallet')}
              disabled={loading}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>👛</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Digital Wallet</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Paytm, PhonePe, GPay</div>
                </div>
              </div>
            </button>
          </div>
          
          <button
            className="btn"
            style={{ background: '#6b7280', color: 'white', width: '100%', marginTop: '16px' }}
            onClick={() => setShowPaymentModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'cashback': return '🎁';
      case 'rental': return '☂️';
      case 'refund': return '↩️';
      default: return '💳';
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>💳 Your Money Stuff</h2>
          
          <div className="grid grid-2">
            <div className="card" style={{ background: '#f0f9ff', border: '1px solid #0ea5e9' }}>
              <h3 style={{ color: '#0c4a6e', marginBottom: '12px' }}>What you've got</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0c4a6e' }}>
                ₹{user?.walletBalance || 0}
              </div>
              {!user?.depositMade && (
                <div style={{ 
                  background: '#dcfce7', 
                  color: '#166534', 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  marginTop: '12px',
                  fontSize: '0.875rem'
                }}>
                  🎁 First time? We'll add ₹100 bonus on ₹300+ deposit!
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Top up your wallet</h3>
              <input
                type="number"
                placeholder="Enter amount"
                className="input"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="100"
              />
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[300, 500, 1000, 2000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: amount === preset ? '#667eea' : 'white',
                      color: amount === preset ? 'white' : '#374151',
                      cursor: 'pointer'
                    }}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={handleDeposit}
                disabled={loading}
              >
                {loading ? 'Adding money...' : `Add ₹${amount}`}
              </button>
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>📊 Your Money Moves</h3>
            {transactions.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                Nothing here yet! Start by adding some money 🚀
              </p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {transactions.map((transaction) => (
                  <div key={transaction._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {getTransactionIcon(transaction.type)}
                      </span>
                      <div>
                        <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                          {transaction.type}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {new Date(transaction.createdAt).toLocaleString()}
                        </div>
                        {transaction.description && (
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: transaction.amount > 0 ? '#10b981' : '#ef4444' 
                    }}>
                      {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <PaymentModal />
      </div>
    </div>
  );
};

export default Wallet;