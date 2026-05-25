import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HotelSearchForm } from '../../components/client/HotelSearchForm';
import { FiltersSidebar } from '../../components/client/FiltersSidebar';
import { HotelCard } from '../../components/client/HotelCard';
import { HotelMapModal } from '../../components/client/HotelMapModal';
import type { SearchHotelsDto } from '../../types';
import { searchService, geocodingService } from '../../services';
import { Loader2, Hotel } from 'lucide-react';

export const SearchStays: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Đọc các bộ lọc tìm kiếm gốc từ URL
  const locationId = searchParams.get('locationId') ? parseInt(searchParams.get('locationId')!) : 102; // Mặc định Hội An
  const checkInDate = searchParams.get('checkInDate') || '';
  const checkOutDate = searchParams.get('checkOutDate') || '';
  const capacity = searchParams.get('capacity') ? parseInt(searchParams.get('capacity')!) : 2;

  // Lọc theo khoảng giá từ sidebar (VNĐ)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 500000, max: 8000000 });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // States tải dữ liệu trực tiếp từ C# Backend
  const [hotels, setHotels] = useState<SearchHotelsDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tọa độ trung tâm bản đồ (lấy từ /api/v1/geocoding/location/:id qua Nominatim)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // Modal bản đồ — mở khi user click "Xem trên Bản đồ" trong FiltersSidebar
  const [showMap, setShowMap] = useState<boolean>(false);

  // Tìm tên địa điểm hiện tại trực tiếp từ URL query parameters để hiển thị tiêu đề kết quả tìm kiếm (Instant UX)
  const currentLocationName = searchParams.get('locationName') || 'Việt Nam';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setHotels([]); // 🧹 QUAN TRỌNG: Dọn sạch danh sách cũ (Hà Nội) trước khi gọi API mới (Đà Nẵng)
      try {
        const finalCheckIn = checkInDate || new Date().toISOString().split('T')[0];
        const finalCheckOut = checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

        // Gọi song song 2 API: search hotels + geocode location
        const [hotelsResult, geoResult] = await Promise.allSettled([
          searchService.searchHotels({
            locationId,
            capacity,
            pageNumber: 1,
            pageSize: 20,
            checkInDate: finalCheckIn,
            checkOutDate: finalCheckOut
          }),
          geocodingService.geocodeLocation(locationId)
        ]);

        if (hotelsResult.status === 'fulfilled') {
          setHotels(hotelsResult.value);
        } else {
          console.error('⚠️ Lỗi gọi API search hotels:', hotelsResult.reason);
          const errMsg = hotelsResult.reason instanceof Error
            ? hotelsResult.reason.message
            : 'Không thể kết nối đến máy chủ WanderVN.';
          setError(errMsg);
          setHotels([]);
        }

        if (geoResult.status === 'fulfilled') {
          setMapCenter([geoResult.value.latitude, geoResult.value.longitude]);
        } else {
          console.warn('⚠️ Không lấy được tọa độ địa điểm:', geoResult.reason);
          setMapCenter(null);
        }
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchData();
  }, [locationId, checkInDate, checkOutDate, capacity]);

  // Bộ lọc phụ ở Client-side (Lọc theo Giá, Loại hình, Tiện ích)
  const displayedHotels = hotels.filter((hotel) => {
    if (hotel.minPrice > priceRange.max) return false;

    if (selectedTypes.length > 0) {
      if (!hotel.propertyTypeCode || !selectedTypes.includes(hotel.propertyTypeCode)) {
        return false;
      }
    }

    if (selectedAmenities.length > 0) {
      const hotelAmenities = hotel.amenities || [];
      const hasAllAmenities = selectedAmenities.every(amenity => 
        hotelAmenities.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Widget Thanh Tìm kiếm rút gọn ở Header */}
      <header className="relative pt-32 pb-16 px-margin-mobile md:px-margin-desktop bg-surface-container-low border-b border-surface-variant/40">
        <div className="max-w-container-max mx-auto">
          <div className="mb-6">
            <span className="font-label-md text-caption uppercase tracking-wider text-secondary">Hành trình của bạn</span>
            <h1 className="font-display-lg text-headline-lg text-primary">Thay đổi tìm kiếm lưu trú</h1>
          </div>
          <HotelSearchForm compact theme="light" />
        </div>
      </header>

      {/* Main Results Layout — 2 cột: Filters | List. Bản đồ mở qua modal khi click "Xem trên Bản đồ" */}
      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-16 flex flex-col lg:flex-row gap-8 lg:gap-12">

        {/* Bộ lọc bên trái Sidebar */}
        <FiltersSidebar
          onPriceChange={(min, max) => setPriceRange({ min, max })}
          onTypeChange={(types) => setSelectedTypes(types)}
          onAmenityChange={(amenities) => setSelectedAmenities(amenities)}
          onMapClick={() => setShowMap(true)}
          mapCenter={mapCenter}
          hotels={displayedHotels}
        />

        {/* Danh sách kết quả bên phải */}
        <section className="w-full lg:w-3/4 space-y-8">

          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
            <div>
              <h2 className="font-display-lg text-headline-md text-on-surface">
                {displayedHotels.length} Khách sạn tại {currentLocationName}
              </h2>
              {error && (
                <span className="font-caption text-caption text-error-color mt-1 block font-medium text-red-500">
                  ⚠️ {error}
                </span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 font-body-md text-body-md text-on-surface-variant">
              <span>Sắp xếp:</span>
              <button className="flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:text-secondary transition-colors">
                WanderVN đề xuất
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="h-10 w-10 text-secondary animate-spin" />
              <p className="font-body-md text-body-md text-on-surface-variant italic animate-pulse">
                Đang tuyển chọn các điểm lưu trú di sản tốt nhất...
              </p>
            </div>
          ) : displayedHotels.length > 0 ? (
            <div className="space-y-8">
              {displayedHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-outline-variant/50 rounded-lg bg-surface-container-low p-8 limestone-shadow">
              <div className="p-4 bg-surface-container rounded-full mb-6">
                <Hotel className="h-12 w-12 text-outline" />
              </div>
              <h3 className="font-display-lg text-headline-md text-primary mb-2">
                Không tìm thấy phòng trống phù hợp
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                Hãy thử mở rộng khoảng lọc giá, chọn loại phòng khác, hoặc thay đổi ngày lưu trú để nhận thêm các đề xuất chất lượng.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Modal bản đồ OpenStreetMap fullscreen */}
      <HotelMapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        center={mapCenter}
        hotels={displayedHotels}
        locationName={currentLocationName}
      />
    </div>
  );
};

export default SearchStays;
