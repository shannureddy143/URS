import React, { useEffect, useRef } from 'react';

const MapView = ({ umbrellas, selectedUmbrellas, onUmbrellaSelect }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const colorMap = {
    red: '#EF4444',
    blue: '#3B82F6', 
    yellow: '#EAB308',
    black: '#374151',
    green: '#10B981'
  };

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    // Initialize map centered on Chandigarh University
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 30.7575, lng: 76.5660 },
      zoom: 16,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !umbrellas.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each umbrella
    umbrellas.forEach(umbrella => {
      if (!umbrella.location?.latitude || !umbrella.location?.longitude) return;

      const isSelected = selectedUmbrellas.includes(umbrella._id);
      const isAvailable = umbrella.isAvailable;

      const marker = new window.google.maps.Marker({
        position: {
          lat: umbrella.location.latitude,
          lng: umbrella.location.longitude
        },
        map: mapInstance.current,
        title: `${umbrella.umbrellaId} - ${umbrella.color}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 12 : 8,
          fillColor: isAvailable ? colorMap[umbrella.color] : '#9CA3AF',
          fillOpacity: isAvailable ? 0.8 : 0.4,
          strokeColor: isSelected ? '#1F2937' : '#FFFFFF',
          strokeWeight: isSelected ? 3 : 2
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1F2937;">${umbrella.umbrellaId}</h3>
            <p style="margin: 0 0 4px 0; color: #6B7280; text-transform: capitalize;">
              <strong>Color:</strong> ${umbrella.color}
            </p>
            <p style="margin: 0 0 4px 0; color: #6B7280;">
              <strong>Status:</strong> ${isAvailable ? '✅ Available' : '❌ Rented'}
            </p>
            <p style="margin: 0 0 8px 0; color: #6B7280;">
              <strong>Location:</strong> ${umbrella.location.address || 'Chandigarh University'}
            </p>
            <p style="margin: 0; color: #374151; font-size: 12px;">
              💰 ₹7/hour • ₹70/day
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker);
        if (isAvailable && onUmbrellaSelect) {
          onUmbrellaSelect(umbrella._id);
        }
      });

      markersRef.current.push(marker);
    });
  }, [umbrellas, selectedUmbrellas, onUmbrellaSelect]);

  return (
    <div style={{ position: 'relative' }}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '400px', 
          borderRadius: '8px',
          border: '1px solid #E5E7EB'
        }} 
      />
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '12px'
      }}>
        <div style={{ marginBottom: '4px', fontWeight: '600' }}>Legend:</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(colorMap).map(([color, hex]) => (
            <div key={color} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: hex
              }} />
              <span style={{ textTransform: 'capitalize' }}>{color}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;