import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export type AQICategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export interface MapData {
  lat: number;
  lng: number;
  city: string;
  aqi: number;
  weather: string;
  category: AQICategory;
}

interface MapViewProps {
  markerData?: MapData | null;
  onMapClick: (lat: number, lng: number) => void;
}

function getAQIColor(category: AQICategory) {
  switch (category) {
    case 'Good': return '#2ECC71';
    case 'Moderate': return '#F1C40F';
    case 'Unhealthy for Sensitive Groups': return '#E67E22';
    case 'Unhealthy': return '#E74C3C';
    case 'Very Unhealthy': return '#8E44AD';
    case 'Hazardous': return '#7D3C3C';
    default: return '#888';
  }
}

const LocationMarker: React.FC<{ onSelect: (lat: number, lng: number) => void }> = ({ onSelect }) => {
  useMapEvent('click', (e) => {
    onSelect(e.latlng.lat, e.latlng.lng);
  });
  return null;
};

const MapView: React.FC<MapViewProps> = ({ markerData, onMapClick }) => {
  const defaultPosition: [number, number] = [40.7128, -74.006]; // New York
  return (
    <MapContainer center={defaultPosition} zoom={12} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker onSelect={onMapClick} />
      {markerData && (
        <Marker position={[markerData.lat, markerData.lng]}>
          <Popup>
            <div style={{ borderLeft: `6px solid ${getAQIColor(markerData.category)}`, paddingLeft: 8 }}>
              <div><strong>{markerData.city}</strong></div>
              <div>AQI: <b>{markerData.aqi}</b></div>
              <div>Category: <span style={{ color: getAQIColor(markerData.category) }}>{markerData.category}</span></div>
              <div>Weather: {markerData.weather}</div>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapView; 