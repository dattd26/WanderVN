import React from 'react';
import { Star, MapPin } from 'lucide-react';
import type { SearchHotelsDto } from '../../types';
import { Link } from 'react-router-dom';

interface HotelCardProps {
  hotel: SearchHotelsDto;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  // Bản đồ phân loại nhãn để hiển thị thẻ boutique hạng sang
  const getBoutiqueLabel = (stars: number) => {
    if (stars >= 5) return 'Khu nghỉ dưỡng Hạng sang';
    return 'Biệt thự Di sản';
  };

  return (
    <article className="group flex flex-col md:flex-row gap-8 bg-surface-container-low border border-outline-variant/20 rounded-lg p-4 hover:border-outline/40 transition-all duration-300 limestone-shadow">
      {/* Khối Ảnh khách sạn */}
      <div className="w-full md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden rounded relative">
        <img
          alt={hotel.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          src={hotel.primaryImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
          onError={(e) => {
            // Ảnh dự phòng trong trường hợp đường dẫn ảnh gốc bị lỗi
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-full text-primary hover:text-secondary transition-colors duration-300 cursor-pointer shadow-sm">
          <Star className="h-4 w-4 fill-current text-secondary" />
        </div>
      </div>

      {/* Khối Thông tin chi tiết */}
      <div className="w-full md:w-3/5 flex flex-col justify-between py-2">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="inline-block px-2.5 py-1 border border-on-tertiary-container text-on-tertiary-container font-caption text-caption uppercase tracking-wider mb-2 bg-tertiary-fixed-dim/20 rounded">
                {hotel.propertyTypeName || getBoutiqueLabel(hotel.starRating)}
              </span>
              <h3 className="font-display-lg text-headline-lg text-on-surface mb-1 group-hover:text-secondary transition-colors duration-300">
                {hotel.name}
              </h3>
            </div>
            
            {/* Điểm đánh giá sao */}
            <div className="flex items-center gap-1 bg-surface border border-outline-variant/50 px-2 py-1 rounded shadow-sm">
              <Star className="h-4 w-4 fill-current text-secondary" />
              <span className="font-label-md text-label-md text-on-surface">
                {hotel.starRating}.0
              </span>
            </div>
          </div>

          {/* Vị trí */}
          <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md mb-4">
            <MapPin className="h-4 w-4 text-secondary shrink-0" />
            <span className="truncate">{hotel.address}</span>
            <span className="text-outline-variant hidden sm:inline">•</span>
            <a href="#" className="underline hover:text-secondary hidden sm:inline">
              Xem Bản đồ
            </a>
          </div>

          {/* Mô tả ngắn */}
          <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mb-6 leading-relaxed">
            {hotel.description}
          </p>
        </div>

        {/* Khối giá phòng & CTA */}
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center pt-4 border-t border-outline-variant/30 gap-4">
          <div className="text-left w-full sm:w-auto">
            <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wide">
              Giá chỉ từ
            </p>
            <p className="font-headline-md text-headline-md text-primary font-semibold">
              {hotel.minPrice.toLocaleString('vi-VN')}{' '}
              <span className="font-body-md text-body-md font-normal text-on-surface-variant">
                VND / đêm
              </span>
            </p>
          </div>
          
          <Link 
            to={`/hotel/${hotel.id}`} 
            className="w-full sm:w-auto border border-primary text-primary hover:bg-primary hover:text-on-primary font-label-md text-label-md px-8 py-3 transition-colors duration-300 uppercase tracking-widest font-medium text-center"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
};
export default HotelCard;
