import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { SearchHotelsDto } from '../../types';

interface HotelMapProps {
  center: [number, number];
  hotels: SearchHotelsDto[];
}

// Hàm tạo Marker hiển thị giá phòng — nền trắng/kem (#fdf9f4) viền vàng gold (#735c00), bo góc, hiển thị đầy đủ giá kèm đơn vị "đ"
const createPriceTagMarker = (price: number) => {
  const formattedPrice = price.toLocaleString('vi-VN') + ' đ';
  return L.divIcon({
    className: '',
    html: `
      <div class="relative flex flex-col items-center group" style="transform: translate(-50%, -100%);">
        <!-- Khung thẻ giá bo góc nền trắng/kem, viền vàng gold -->
        <div class="px-2.5 py-1.5 rounded bg-[#fdf9f4] border border-[#735c00] shadow-md group-hover:bg-[#735c00] text-[#735c00] group-hover:text-white transition-all duration-200 cursor-pointer select-none font-sans font-semibold text-[13px] whitespace-nowrap">
          ${formattedPrice}
        </div>
        <!-- Mũi tên chỉ xuống màu trắng/kem có viền vàng gold -->
        <div class="w-1.5 h-1.5 bg-[#fdf9f4] border-r border-b border-[#735c00] -mt-[4px] rotate-45 shadow-sm transition-colors duration-200 group-hover:bg-[#735c00]"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -36]
  });
};

// Tự động fit map bounds khi hotels hoặc center thay đổi
const FitBounds: React.FC<{ hotels: SearchHotelsDto[]; center: [number, number] }> = ({ hotels, center }) => {
  const map = useMap();

  useEffect(() => {
    const validHotels = hotels.filter(
      (h) => typeof h.latitude === 'number' && typeof h.longitude === 'number'
    );

    if (validHotels.length >= 2) {
      const bounds = L.latLngBounds(
        validHotels.map((h) => [h.latitude as number, h.longitude as number])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (validHotels.length === 1) {
      const h = validHotels[0];
      map.setView([h.latitude as number, h.longitude as number], 13);
    } else {
      map.setView(center, 12);
    }
  }, [hotels, center, map]);

  return null;
};

export const HotelMap: React.FC<HotelMapProps> = ({ center, hotels }) => {
  const markersHotels = hotels.filter(
    (h) => typeof h.latitude === 'number' && typeof h.longitude === 'number'
  );

  const missingCount = hotels.length - markersHotels.length;

  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-outline-variant/30 limestone-shadow bg-surface">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="flex-1 w-full min-h-[400px] z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds hotels={hotels} center={center} />

        {markersHotels.map((hotel) => (
          <Marker
            key={hotel.id}
            position={[hotel.latitude as number, hotel.longitude as number]}
            icon={createPriceTagMarker(hotel.minPrice)}
          >
            <Popup>
              <div className="w-56">
                <img
                  src={hotel.primaryImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                  alt={hotel.name}
                  className="w-full h-24 object-cover rounded-sm mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <h4 className="font-display-lg text-headline-md text-primary leading-tight mb-1">
                  {hotel.name}
                </h4>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3.5 w-3.5 fill-current text-secondary" />
                  <span className="font-label-md text-caption text-on-surface-variant">
                    {hotel.starRating}.0
                  </span>
                </div>
                <p className="font-body-md text-caption text-on-surface-variant mb-3 line-clamp-2">
                  {hotel.address}
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-outline-variant/40">
                  <span className="font-label-md text-caption text-primary font-semibold">
                    {hotel.minPrice.toLocaleString('vi-VN')} đ
                  </span>
                  <Link
                    to={`/hotel/${hotel.id}`}
                    className="font-label-md text-caption text-secondary hover:text-primary uppercase tracking-wider underline"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {missingCount > 0 && (
        <div className="px-4 py-2 border-t border-outline-variant/30 font-caption text-caption text-on-surface-variant italic">
          {missingCount} khách sạn chưa có vị trí trên bản đồ
        </div>
      )}
    </div>
  );
};

export default HotelMap;
