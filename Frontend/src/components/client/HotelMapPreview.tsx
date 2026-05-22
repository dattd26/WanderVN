import React from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import type { SearchHotelsDto } from '../../types';

interface HotelMapPreviewProps {
  center: [number, number];
  hotels: SearchHotelsDto[];
}

/**
 * Mini-map non-interactive dùng làm preview trong FiltersSidebar.
 * Tắt mọi tương tác để click xuyên xuống wrapper button → mở modal fullscreen.
 */
export const HotelMapPreview: React.FC<HotelMapPreviewProps> = ({ center, hotels }) => {
  const validHotels = hotels.filter(
    (h) => typeof h.latitude === 'number' && typeof h.longitude === 'number'
  );

  // Auto-fit bounds nếu có ≥2 hotel, ngược lại center on location
  const bounds = validHotels.length >= 2
    ? L.latLngBounds(validHotels.map((h) => [h.latitude as number, h.longitude as number]))
    : undefined;

  return (
    <MapContainer
      // key forces remount khi center đổi (đổi location search)
      key={`${center[0]}-${center[1]}-${validHotels.length}`}
      center={center}
      zoom={12}
      bounds={bounds}
      boundsOptions={{ padding: [20, 20], maxZoom: 14 }}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full"
      style={{ pointerEvents: 'none', background: '#f1ede8' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {validHotels.map((h) => (
        <CircleMarker
          key={h.id}
          center={[h.latitude as number, h.longitude as number]}
          radius={4}
          pathOptions={{
            color: '#ffffff',
            fillColor: '#735c00',
            fillOpacity: 1,
            weight: 1.5
          }}
        />
      ))}
    </MapContainer>
  );
};

export default HotelMapPreview;
