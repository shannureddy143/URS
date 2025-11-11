import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TrackingMap from '../components/TrackingMap';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const RentalTracking = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeRentals, setActiveRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchActiveRentals();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchActiveRentals = async () => {
    try {
      const response = await api.get('/rentals/active');
      const rentals = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean);
      setActiveRentals(rentals);
      if (rentals.length > 0) {
        setSelectedRental(rentals[0]);
      }
    } catch (error) {
      console.log('No active rentals');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (!selectedRental) return { hours: 0, minutes: 0 };
    const start = new Date(selectedRental.startTime);
    const diff = currentTime - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  const calculateCurrentCost = () => {
    const { hours } = calculateDuration();
    if (hours === 0) return 7;
    return hours <= 7 ? (hours + 1) * 7 : Math.ceil((hours + 1) / 24) * 70;
  };

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const processRentalPayment = async (method) => {
    if (paymentLoading) return;
    setPaymentLoading(true);
    
    try {
      const response = await api.post(`/rentals/${selectedRental._id}/pay`, {
        paymentId: `${method}_${Date.now()}`,
        paymentMethod: method
      });
      
      setSelectedRental(prev => ({ ...prev, unlocked: true, paymentStatus: 'completed' }));
      setActiveRentals(prev => prev.map(r => r._id === selectedRental._id ? { ...r, unlocked: true } : r));
      updateUser({ walletBalance: response.data.walletBalance });
      alert(`Payment successful via ${method}! ₹${response.data.amountDeducted} deducted. Umbrella unlocked.`);
      setShowPaymentModal(false);
    } catch (error) {
      alert('Payment verification failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayAllRentals = async () => {
    if (paymentLoading) return;
    
    const unpaidRentals = activeRentals.filter(r => !r.unlocked);
    if (unpaidRentals.length === 0) return;
    
    const totalCost = unpaidRentals.reduce((sum, rental) => {
      const start = new Date(rental.startTime);
      const hours = Math.ceil((currentTime - start) / (1000 * 60 * 60));
      return sum + (hours <= 7 ? (hours || 1) * 7 : Math.ceil(hours / 24) * 70);
    }, 0);
    
    if (window.confirm(`Pay ₹${totalCost} to unlock all ${unpaidRentals.length} umbrellas?`)) {
      setPaymentLoading(true);
      try {
        const response = await api.post('/rentals/pay-all', {
          paymentId: `batch_${Date.now()}`,
          paymentMethod: 'Wallet'
        });
        
        setActiveRentals(prev => prev.map(r => ({ ...r, unlocked: true })));
        updateUser({ walletBalance: response.data.walletBalance });
        alert(`Payment successful! ₹${response.data.amountDeducted} deducted. ${response.data.count} umbrellas unlocked.`);
      } catch (error) {
        alert(error.response?.data?.message || 'Payment failed');
      } finally {
        setPaymentLoading(false);
      }
    }
  };

  const [showDropOffModal, setShowDropOffModal] = useState(false);
  const [selectedDropOffLocation, setSelectedDropOffLocation] = useState(null);
  const [campusLocations] = useState([
    { name: 'Main Gate', address: 'Main Gate, Chandigarh University', lat: 30.7590, lng: 76.5675 },
    { name: 'Central Library', address: 'Central Library, Chandigarh University', lat: 30.7585, lng: 76.5680 },
    { name: 'Food Court', address: 'Food Court, Chandigarh University', lat: 30.7580, lng: 76.5670 },
    { name: 'Sports Complex', address: 'Sports Complex, Chandigarh University', lat: 30.7595, lng: 76.5685 },
    { name: 'Boys Hostel', address: 'Boys Hostel, Chandigarh University', lat: 30.7575, lng: 76.5665 }
  ]);

  const handleEndRental = () => {
    if (!selectedRental) return;
    setShowDropOffModal(true);
  };

  const confirmEndRental = async () => {
    if (!selectedDropOffLocation) {
      alert('Please select a drop-off location');
      return;
    }
    
    try {
      const response = await api.post(`/rentals/${selectedRental._id}/end`, {
        dropOffLocation: {
          address: selectedDropOffLocation.address,
          latitude: selectedDropOffLocation.lat,
          longitude: selectedDropOffLocation.lng
        }
      });
      const { rental } = response.data;
      
      alert(`Rental ended! Umbrella dropped at ${selectedDropOffLocation.name}. Total cost: ₹${rental.totalAmount}`);
      setShowDropOffModal(false);
      setSelectedDropOffLocation(null);
      fetchActiveRentals();
    } catch (error) {
      alert('Failed to end rental');
    }
  };

  const PaymentModal = () => {
    if (!showPaymentModal || !selectedRental) return null;
    const amount = calculateCurrentCost();
    
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
          <h3 style={{ marginBottom: '20px' }}>Pay for Rental</h3>
          <div style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 'bold' }}>
            Amount: ₹{amount}
          </div>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {['UPI', 'QR Code', 'Card', 'Wallet'].map((method, index) => (
              <button
                key={method}
                className="btn"
                style={{ 
                  background: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][index], 
                  color: 'white', 
                  padding: '16px', 
                  textAlign: 'left' 
                }}
                onClick={() => processRentalPayment(method)}
                disabled={paymentLoading}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {['📱', '📷', '💳', '👛'][index]}
                  </span>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{method} Payment</div>
                  </div>
                </div>
              </button>
            ))}
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

  const DropOffModal = () => {
    if (!showDropOffModal || !selectedRental) return null;
    
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
        <div className="card" style={{ width: '500px', maxWidth: '90vw' }}>
          <h3 style={{ marginBottom: '20px' }}>Where are you dropping the umbrella?</h3>
          
          <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
            {campusLocations.map((location, index) => (
              <button
                key={location.name}
                className="btn"
                style={{ 
                  background: selectedDropOffLocation?.name === location.name ? '#3b82f6' : '#f3f4f6',
                  color: selectedDropOffLocation?.name === location.name ? 'white' : '#1f2937',
                  padding: '16px', 
                  textAlign: 'left',
                  border: selectedDropOffLocation?.name === location.name ? '2px solid #3b82f6' : '1px solid #e5e7eb'
                }}
                onClick={() => setSelectedDropOffLocation(location)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>📍</span>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{location.name}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{location.address}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={confirmEndRental}
              disabled={!selectedDropOffLocation}
            >
              Drop Umbrella Here
            </button>
            <button
              className="btn"
              style={{ background: '#6b7280', color: 'white' }}
              onClick={() => {
                setShowDropOffModal(false);
                setSelectedDropOffLocation(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTbyTHiHW-_-_-_-_-_-_-_&libraries=places';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card text-center">
            <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (activeRentals.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card text-center">
            <h2 style={{ color: '#6b7280', marginBottom: '16px' }}>No Active Rentals</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              You don't have any active umbrella rentals.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/umbrellas')}
            >
              Find an Umbrella
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { hours, minutes } = calculateDuration();
  const currentCost = calculateCurrentCost();

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Rental Tracking</h2>
          
          {activeRentals.length > 1 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Select Rental to Track:</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {activeRentals.map((rental) => (
                  <button
                    key={rental._id}
                    onClick={() => setSelectedRental(rental)}
                    style={{
                      padding: '12px',
                      border: selectedRental?._id === rental._id ? '2px solid #667eea' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      background: selectedRental?._id === rental._id ? '#f0f9ff' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    ☂️ {rental.umbrella?.umbrellaId || 'Unknown'} - {rental.umbrella?.location?.address || 'Unknown location'}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-2">
            <div className="card" style={{ background: '#f0f9ff', border: '1px solid #0ea5e9' }}>
              <h3 style={{ color: '#0c4a6e', marginBottom: '12px' }}>☂️ Your Umbrella</h3>
              <div style={{ marginBottom: '8px' }}>
                <strong>ID:</strong> {selectedRental?.umbrella?.umbrellaId || 'N/A'}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Color:</strong> {selectedRental?.umbrella?.color || 'N/A'}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Status:</strong> 
                <span style={{ 
                  color: selectedRental?.unlocked ? '#10b981' : '#f59e0b',
                  fontWeight: 'bold',
                  marginLeft: '8px'
                }}>
                  {selectedRental?.unlocked ? '🔓 Unlocked' : '🔒 Locked'}
                </span>
              </div>
            </div>

            <div className="card" style={{ background: '#f0fdf4', border: '1px solid #10b981' }}>
              <h3 style={{ color: '#065f46', marginBottom: '12px' }}>⏱️ Time & Money</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#065f46', marginBottom: '8px' }}>
                {hours}h {minutes}m
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Started:</strong> {selectedRental ? new Date(selectedRental.startTime).toLocaleString() : 'N/A'}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#065f46' }}>
                You owe: ₹{currentCost}
              </div>
            </div>
          </div>

          {activeRentals.filter(r => !r.unlocked).length > 0 && (
            <div className="card" style={{ background: '#fef3c7', border: '1px solid #f59e0b', marginTop: '20px' }}>
              <h3 style={{ color: '#92400e', marginBottom: '12px' }}>💳 Payment Required</h3>
              <p style={{ color: '#92400e', marginBottom: '16px' }}>
                {activeRentals.filter(r => !r.unlocked).length === 1 
                  ? 'Please complete payment to unlock your umbrella.' 
                  : `You have ${activeRentals.filter(r => !r.unlocked).length} unpaid umbrellas.`}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {selectedRental && !selectedRental.unlocked && (
                  <button 
                    className="btn btn-primary"
                    onClick={handlePayment}
                  >
                    Pay ₹{currentCost} & Unlock This
                  </button>
                )}
                {activeRentals.filter(r => !r.unlocked).length > 1 && (
                  <button 
                    className="btn btn-success"
                    onClick={handlePayAllRentals}
                  >
                    Pay All & Unlock ({activeRentals.filter(r => !r.unlocked).length})
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="card" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>🗺️ Where is it right now?</h3>
            <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#f0f9ff', borderRadius: '6px' }}>
              <strong>📍 Current Location:</strong> {selectedRental?.umbrella?.location?.address || 'Chandigarh University Campus'}
            </div>
            <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px' }}>
              <strong>🌐 GPS Coordinates:</strong> {selectedRental?.umbrella?.location?.latitude || 'N/A'}, {selectedRental?.umbrella?.location?.longitude || 'N/A'}
            </div>
            <TrackingMap rental={selectedRental} />
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>🎯 What do you want to do?</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {selectedRental && !selectedRental.unlocked && (
                <button 
                  className="btn btn-primary"
                  onClick={handlePayment}
                >
                  💳 Pay & Unlock This
                </button>
              )}
              
              {activeRentals.filter(r => !r.unlocked).length > 1 && (
                <button 
                  className="btn btn-success"
                  onClick={handlePayAllRentals}
                >
                  🚀 Pay & Unlock All ({activeRentals.filter(r => !r.unlocked).length})
                </button>
              )}
              
              {selectedRental && selectedRental.unlocked && (
                <button 
                  className="btn"
                  style={{ background: '#ef4444', color: 'white' }}
                  onClick={handleEndRental}
                >
                  🏁 End Rental
                </button>
              )}
              
              <button 
                className="btn"
                style={{ background: '#6b7280', color: 'white' }}
                onClick={() => navigate('/dashboard')}
              >
                🏠 Back to Dashboard
              </button>
            </div>
          </div>
        </div>
        
        <PaymentModal />
        <DropOffModal />
      </div>
    </div>
  );
};

export default RentalTracking;