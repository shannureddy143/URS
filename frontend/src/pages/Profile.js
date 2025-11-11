import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: ''
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData = {
        email: formData.email,
        phone: formData.phone
      };
      
      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      const response = await api.put('/auth/profile', updateData);
      updateUser(response.data.user);
      setEditing(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      alert('Profile updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/auth/profile');
        logout();
        navigate('/login');
        alert('Account deleted successfully');
      } catch (error) {
        alert('Failed to delete account');
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>My Profile</h2>
          
          <div className="grid grid-2">
            <div className="card" style={{ background: '#f8fafc' }}>
              <h3 style={{ color: '#374151', marginBottom: '16px' }}>Account Information</h3>
              
              {!editing ? (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Email:</strong> {user?.email || 'Not provided'}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Phone:</strong> {user?.phone || 'Not provided'}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <strong>Account Type:</strong> {user?.googleId ? 'Google Account' : 'Email Account'}
                  </div>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdate}>
                  <input
                    type="email"
                    placeholder="Email"
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  
                  {!user?.googleId && (
                    <>
                      <input
                        type="password"
                        placeholder="Current Password (required to change password)"
                        className="input"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                      />
                      
                      <input
                        type="password"
                        placeholder="New Password (leave blank to keep current)"
                        className="input"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      />
                    </>
                  )}
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ background: '#6b7280', color: 'white' }}
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="card" style={{ background: '#f0fdf4' }}>
              <h3 style={{ color: '#065f46', marginBottom: '16px' }}>Wallet & Activity</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>Wallet Balance:</strong> ₹{user?.walletBalance || 0}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Deposit Made:</strong> {user?.depositMade ? 'Yes' : 'No'}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Cashback Received:</strong> {user?.cashbackReceived ? 'Yes' : 'No'}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Total Rentals:</strong> {user?.rentalHistory?.length || 0}
              </div>
              
              <button 
                className="btn btn-success"
                onClick={() => navigate('/wallet')}
              >
                Manage Wallet
              </button>
            </div>
          </div>

          <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca', marginTop: '20px' }}>
            <h3 style={{ color: '#dc2626', marginBottom: '16px' }}>Danger Zone</h3>
            <p style={{ color: '#7f1d1d', marginBottom: '16px' }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            
            <button 
              className="btn"
              style={{ background: '#dc2626', color: 'white' }}
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;