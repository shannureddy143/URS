import React, { useEffect, useRef } from 'react';

const TrackingMap = ({ rental }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!window.google || !mapRef.current || !rental?.umbrella?.location) return;

    const { latitude, longitude } = rental.umbrella.location;

    // Initialize map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      zoom: 18,
      mapTypeId: 'hybrid'
    });

    // Add umbrella marker
    markerRef.current = new window.google.maps.Marker({
      position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      map: mapInstance.current,
      title: `${rental.umbrella.umbrellaId} - ${rental.umbrella.location.address}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 15,
        fillColor: rental.unlocked ? '#10B981' : '#F59E0B',
        fillOpacity: 0.8,
        strokeColor: '#FFFFFF',
        strokeWeight: 3
      }
    });

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1F2937;">${rental.umbrella.umbrellaId}</h3>
          <p style="margin: 0 0 4px 0; color: #6B7280;">
            <strong>Status:</strong> ${rental.unlocked ? '🔓 Unlocked' : '🔒 Locked'}
          </p>
          <p style="margin: 0 0 4px 0; color: #6B7280;">
            <strong>Color:</strong> ${rental.umbrella.color}
          </p>
          <p style="margin: 0; color: #6B7280;">
            <strong>Location:</strong> ${rental.umbrella.location.address}
          </p>
        </div>
      `
    });

    markerRef.current.addListener('click', () => {
      infoWindow.open(mapInstance.current, markerRef.current);
    });

    // Add campus boundary
    new window.google.maps.Rectangle({
      bounds: {
        north: 30.7600,
        south: 30.7550,
        east: 76.5690,
        west: 76.5630
      },
      strokeColor: '#10B981',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#10B981',
      fillOpacity: 0.1,
      map: mapInstance.current
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [rental]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '300px', 
        borderRadius: '8px',
        border: '1px solid #E5E7EB'
      }} 
    />
  );
};

export default TrackingMap;