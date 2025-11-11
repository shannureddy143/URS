import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

const UmbrellaSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [umbrellas, setUmbrellas] = useState([]);
  const [filteredUmbrellas, setFilteredUmbrellas] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedUmbrellas, setSelectedUmbrellas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'location', 'recent'

  const colors = ['red', 'blue', 'yellow', 'black', 'green'];
  const umbrellaImages = {
    red: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhDMjAgOCAxMCAxOCAxMCAzMEgxNEMxNCAyMCAyMiAxMiAzMiAxMkM0MiAxMiA1MCAyMCA1MCAzMEg1NEM1NCAxOCA0NCAxIDMyIDhaIiBmaWxsPSIjRUY0NDQ0Ii8+CjxwYXRoIGQ9Ik0zMiAzMFY1NiIgc3Ryb2tlPSIjMzc0MTUxIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTI4IDU2SDM2IiBzdHJva2U9IiMzNzQxNTEiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K',
    blue: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhDMjAgOCAxMCAxOCAxMCAzMEgxNEMxNCAyMCAyMiAxMiAzMiAxMkM0MiAxMiA1MCAyMCA1MCAzMEg1NEM1NCAxOCA0NCAxIDMyIDhaIiBmaWxsPSIjMzk4M0Y2Ii8+CjxwYXRoIGQ9Ik0zMiAzMFY1NiIgc3Ryb2tlPSIjMzc0MTUxIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTI4IDU2SDM2IiBzdHJva2U9IiMzNzQxNTEiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K',
    yellow: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhDMjAgOCAxMCAxOCAxMCAzMEgxNEMxNCAyMCAyMiAxMiAzMiAxMkM0MiAxMiA1MCAyMCA1MCAzMEg1NEM1NCAxOCA0NCAxIDMyIDhaIiBmaWxsPSIjRkJCRjI0Ii8+CjxwYXRoIGQ9Ik0zMiAzMFY1NiIgc3Ryb2tlPSIjMzc0MTUxIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTI4IDU2SDM2IiBzdHJva2U9IiMzNzQxNTEiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K',
    black: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhDMjAgOCAxMCAxOCAxMCAzMEgxNEMxNCAyMCAyMiAxMiAzMiAxMkM0MiAxMiA1MCAyMCA1MCAzMEg1NEM1NCAxOCA0NCAxIDMyIDhaIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0zMiAzMFY1NiIgc3Ryb2tlPSIjMzc0MTUxIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTI4IDU2SDM2IiBzdHJva2U9IiMzNzQxNTEiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K',
    green: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhDMjAgOCAxMCAxOCAxMCAzMEgxNEMxNCAyMCAyMiAxMiAzMiAxMkM0MiAxMiA1MCAyMCA1MCAzMEg1NEM1NCAxOCA0NCAxIDMyIDhaIiBmaWxsPSIjMTBCOTgxIi8+CjxwYXRoIGQ9Ik0zMiAzMFY1NiIgc3Ryb2tlPSIjMzc0MTUxIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTI4IDU2SDM2IiBzdHJva2U9IiMzNzQxNTEiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K'
  };

  const locations = [
    'Main Gate', 'Central Library', 'Engineering Block', 'Student Activity Center', 'Boys Hostel',
    'Girls Hostel', 'Food Court', 'Sports Complex', 'Administrative Block', 'Medical Center',
    'Computer Science Block', 'Main Auditorium', 'Parking Area', 'Faculty Residence', 'Business School'
  ];

  useEffect(() => {
    fetchUmbrellas();
  }, []);

  useEffect(() => {
    filterUmbrellas();
  }, [umbrellas, selectedColor, selectedLocation, sortBy]);

  const fetchUmbrellas = async () => {
    try {
      const response = await api.get('/umbrellas');
      setUmbrellas(response.data);
    } catch (error) {
      console.error('Failed to fetch umbrellas');
    } finally {
      setLoading(false);
    }
  };

  const filterUmbrellas = () => {
    let filtered = umbrellas.filter(u => u.isAvailable);
    
    if (selectedColor) {
      filtered = filtered.filter(u => u.color === selectedColor);
    }
    
    if (selectedLocation) {
      filtered = filtered.filter(u => u.location?.address?.includes(selectedLocation));
    }
    
    // Sort umbrellas
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.umbrellaId.localeCompare(b.umbrellaId);
        case 'location':
          return (a.location?.address || '').localeCompare(b.location?.address || '');
        case 'recent':
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        default:
          return 0;
      }
    });
    
    setFilteredUmbrellas(filtered);
  };

  const handleUmbrellaSelect = (umbrellaId) => {
    setSelectedUmbrellas(prev => 
      prev.includes(umbrellaId) 
        ? prev.filter(id => id !== umbrellaId)
        : [...prev, umbrellaId]
    );
  };

  const handleRentSelected = async () => {
    if (selectedUmbrellas.length === 0) {
      alert('Please select at least one umbrella');
      return;
    }

    if (!user?.depositMade) {
      alert('Please make a deposit first');
      navigate('/wallet');
      return;
    }

    try {
      const response = await api.post('/rentals/start-multiple', { 
        umbrellaIds: selectedUmbrellas 
      });
      alert(`${selectedUmbrellas.length} umbrella(s) rented! Proceed to payment.`);
      navigate('/tracking');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to start rental');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card text-center">
            <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
            <h2 style={{ color: '#667eea' }}>Hunting for umbrellas...</h2>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>Scouting the campus for the perfect ones! 🔍</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1f2937' }}>Available Umbrellas</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: viewMode === 'grid' ? '#667eea' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📋 Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: viewMode === 'map' ? '#667eea' : 'transparent',
                    color: viewMode === 'map' ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🗺️ Map
                </button>
              </div>
              {selectedUmbrellas.length > 0 && (
                <>
                  <span style={{ 
                    background: '#667eea', 
                    color: 'white', 
                    padding: '8px 16px', 
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {selectedUmbrellas.length} in your cart
                  </span>
                  <button className="btn btn-success" onClick={handleRentSelected}>
                    Rent Selected ({selectedUmbrellas.length})
                  </button>
                </>
              )}
            </div>
          </div>
          
          {!user?.depositMade && (
            <div style={{ 
              background: '#fef3c7', 
              border: '1px solid #f59e0b', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '20px' 
            }}>
              <p style={{ color: '#92400e', marginBottom: '12px' }}>
                ⚠️ Please make a deposit of ₹300 before renting an umbrella.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/wallet')}
              >
                Make Deposit
              </button>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '12px', color: '#374151' }}>Sort by:</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { value: 'name', label: 'Name (A-Z)' },
                  { value: 'location', label: 'Location' },
                  { value: 'recent', label: 'Recently Added' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '20px',
                      background: sortBy === option.value ? '#667eea' : 'white',
                      color: sortBy === option.value ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-2" style={{ gap: '16px' }}>
              <div>
                <h3 style={{ marginBottom: '12px', color: '#374151' }}>Filter by Color:</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedColor('')}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '20px',
                      background: !selectedColor ? '#667eea' : 'white',
                      color: !selectedColor ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    All Colors
                  </button>
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '20px',
                        background: selectedColor === color ? '#667eea' : 'white',
                        color: selectedColor === color ? 'white' : '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px'
                      }}
                    >
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 style={{ marginBottom: '12px', color: '#374151' }}>Select Location:</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setSelectedLocation('')}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '20px',
                      background: !selectedLocation ? '#10b981' : 'white',
                      color: !selectedLocation ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    All Locations
                  </button>
                  {locations.slice(0, 8).map((location) => (
                    <button
                      key={location}
                      onClick={() => setSelectedLocation(location)}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '20px',
                        background: selectedLocation === location ? '#10b981' : 'white',
                        color: selectedLocation === location ? 'white' : '#374151',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {location}
                    </button>
                  ))}
                </div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  <option value="">Select Location...</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {viewMode === 'map' ? (
            <MapView 
              umbrellas={filteredUmbrellas}
              selectedUmbrellas={selectedUmbrellas}
              onUmbrellaSelect={handleUmbrellaSelect}
            />
          ) : (
            filteredUmbrellas.length === 0 ? (
              <div className="card text-center" style={{ background: '#f9fafb' }}>
                <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>No Umbrellas Available</h3>
                <p style={{ color: '#6b7280' }}>
                  {selectedColor || selectedLocation 
                    ? `Hmm, no ${selectedColor || ''} umbrellas ${selectedLocation ? `at ${selectedLocation}` : ''} available. Try different filters?` 
                    : 'Looks like everyone beat you to it! All umbrellas are out having adventures 🌧️'}
                </p>
                <button 
                  onClick={() => { setSelectedColor(''); setSelectedLocation(''); }}
                  style={{
                    marginTop: '12px',
                    padding: '8px 16px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-2">
                {filteredUmbrellas.map((umbrella) => (
                  <div 
                    key={umbrella._id} 
                    className="card" 
                    style={{ 
                      border: selectedUmbrellas.includes(umbrella._id) 
                        ? '2px solid #667eea' 
                        : umbrella.isAvailable ? '1px solid #10b981' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      background: selectedUmbrellas.includes(umbrella._id) 
                        ? '#f0f9ff'
                        : 'white'
                    }}
                    onClick={() => umbrella.isAvailable && handleUmbrellaSelect(umbrella._id)}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <img 
                        src={umbrellaImages[umbrella.color]} 
                        alt={`${umbrella.color} umbrella`}
                        style={{ width: '80px', height: '80px', marginBottom: '12px' }}
                      />
                      <h3 style={{ color: '#1f2937', marginBottom: '4px' }}>
                        {umbrella.umbrellaId}
                      </h3>
                      <div style={{ color: '#6b7280', textTransform: 'capitalize', fontWeight: '600' }}>
                        {umbrella.color} Umbrella
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                      <div className={umbrella.isAvailable ? 'status-badge status-available' : 'status-badge status-rented'}>
                        {umbrella.isAvailable ? '✅ Available' : '❌ Rented'}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>
                        📍 Hanging out at
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                        {umbrella.location?.address || 'Chandigarh University'}
                      </div>
                    </div>

                    <div style={{ 
                      background: '#f8fafc', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      marginBottom: '16px' 
                    }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>
                        💰 Super affordable!
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                        Just ₹7/hour • Full day? Only ₹70!
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedUmbrellas.includes(umbrella._id)}
                        onChange={() => handleUmbrellaSelect(umbrella._id)}
                        disabled={!umbrella.isAvailable || !user?.depositMade}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: '#667eea'
                        }}
                      />
                      <span style={{ 
                        fontSize: '14px', 
                        color: selectedUmbrellas.includes(umbrella._id) ? '#667eea' : '#6b7280',
                        fontWeight: selectedUmbrellas.includes(umbrella._id) ? '600' : '400'
                      }}>
                        {selectedUmbrellas.includes(umbrella._id) ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UmbrellaSelection;