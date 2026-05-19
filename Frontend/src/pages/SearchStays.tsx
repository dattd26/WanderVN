import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchForm } from '../components/SearchForm';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { HotelCard } from '../components/HotelCard';
import { MOCK_HOTELS, MOCK_LOCATIONS } from '../data/mockData';
import type { SearchHotelsDto } from '../types';
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
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Boutique Villa']);

  // States tải dữ liệu từ C# Backend
  const [hotels, setHotels] = useState<SearchHotelsDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isApiSuccess, setIsApiSuccess] = useState<boolean>(false);

  // Tìm tên địa điểm hiện tại để hiển thị tiêu đề kết quả
  const currentLocationName = MOCK_LOCATIONS.find((l) => l.id === locationId)?.name || 'Việt Nam';

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const finalCheckIn = checkInDate || new Date().toISOString().split('T')[0];
        const finalCheckOut = checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

        // Xây dựng chuỗi truy vấn gọi đến ASP.NET Core Backend
        const queryParams = new URLSearchParams({
          LocationId: locationId.toString(),
          Capacity: capacity.toString(),
          PageNumber: '1',
          PageSize: '20',
          CheckInDate: finalCheckIn,
          CheckOutDate: finalCheckOut
        });

        // Gọi API Backend
        const response = await fetch(`http://localhost:5096/api/v1/search/hotels?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Không thể kết nối đến Backend');

        const result = await response.json();
        if (result && (result.success || result.isSuccess) && Array.isArray(result.data)) {
          setHotels(result.data);
          setIsApiSuccess(true);
        } else {
          throw new Error('Dữ liệu API không đúng cấu trúc');
        }
      } catch (err) {
        console.warn('⚠️ Lỗi gọi API C# Backend, đang kích hoạt chế độ dữ liệu mẫu dự phòng:', err);
        
        // Tự động kích hoạt cơ chế Fallback (dữ liệu mẫu) khi offline hoặc backend chưa bật
        // Bộ lọc dữ liệu mẫu theo địa điểm đã chọn
        const matchedMockHotels = MOCK_HOTELS.filter((hotel) =>
          hotel.locationName.toLowerCase().includes(currentLocationName.toLowerCase()) ||
          hotel.address.toLowerCase().includes(currentLocationName.toLowerCase())
        );

        // Nếu không có khách sạn nào khớp địa điểm, trả về toàn bộ khách sạn mẫu
        setHotels(matchedMockHotels.length > 0 ? matchedMockHotels : MOCK_HOTELS);
        setIsApiSuccess(false);
      } finally {
        // Thêm độ trễ hiệu ứng tinh tế để tăng cảm giác mượt mà
        setTimeout(() => setLoading(false), 600);
      }
    };

    fetchHotels();
  }, [locationId, checkInDate, checkOutDate, capacity, currentLocationName]);

  // Bộ lọc phụ ở Client-side (Lọc theo Giá, Loại phòng, Tiện ích)
  const displayedHotels = hotels.filter((hotel) => {
    // 1. Lọc theo giá
    if (hotel.minPrice > priceRange.max) return false;

    // 2. Lọc theo Loại hình lưu trú (nếu có chọn)
    if (selectedTypes.length > 0) {
      const boutiqueLabel = hotel.starRating >= 5 ? 'Khu nghỉ dưỡng Hạng sang' : 'Biệt thự Di sản';
      // Ánh xạ khớp tương đối với nhãn lọc
      const isMatched = selectedTypes.some(t => {
        if (t === 'Boutique Villa' && boutiqueLabel === 'Biệt thự Di sản') return true;
        if (t === 'Luxury Resort' && boutiqueLabel === 'Khu nghỉ dưỡng Hạng sang') return true;
        if (t === 'Heritage Estate') return true; // Hiển thị chung
        return false;
      });
      if (!isMatched) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Search Header Form Widget */}
      <header className="relative pt-32 pb-16 px-margin-mobile md:px-margin-desktop bg-surface-container-low border-b border-surface-variant/40">
        <div className="max-w-container-max mx-auto">
          <div className="mb-6">
            <span className="font-label-md text-caption uppercase tracking-wider text-secondary">Hành trình của bạn</span>
            <h1 className="font-display-lg text-headline-lg text-primary">Thay đổi tìm kiếm lưu trú</h1>
          </div>
          <SearchForm compact />
        </div>
      </header>

      {/* Main Results Layout */}
      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-16 flex flex-col lg:flex-row gap-12">
        
        {/* Left Filters Sidebar */}
        <FiltersSidebar
          onPriceChange={(min, max) => setPriceRange({ min, max })}
          onTypeChange={(types) => setSelectedTypes(types)}
        />

        {/* Right Search Results Panel */}
        <section className="w-full lg:w-3/4 space-y-8">
          
          {/* Header Grid Summary */}
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
            <div>
              <h2 className="font-display-lg text-headline-md text-on-surface">
                {displayedHotels.length} Khách sạn chọn lọc tại {currentLocationName}
              </h2>
              {!isApiSuccess && (
                <span className="font-caption text-caption text-secondary mt-1 block font-medium">
                  ⚡ Đang hiển thị danh sách tuyển chọn đặc biệt của WanderVN (Offline)
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

          {/* Loading Indicator */}
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
    </div>
  );
};
export default SearchStays;
