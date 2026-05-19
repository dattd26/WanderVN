import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchForm } from '../components/SearchForm';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { HotelCard } from '../components/HotelCard';
import { MOCK_LOCATIONS } from '../data/mockData';
import type { SearchHotelsDto } from '../types';
import { searchService } from '../services';
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

  // States tải dữ liệu trực tiếp từ C# Backend
  const [hotels, setHotels] = useState<SearchHotelsDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tìm tên địa điểm hiện tại để hiển thị tiêu đề kết quả
  const currentLocationName = MOCK_LOCATIONS.find((l) => l.id === locationId)?.name || 'Việt Nam';

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError(null);
      try {
        const finalCheckIn = checkInDate || new Date().toISOString().split('T')[0];
        const finalCheckOut = checkOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

        // Gọi API tìm kiếm khách sạn thông qua service tập trung
        const data = await searchService.searchHotels({
          locationId,
          capacity,
          pageNumber: 1,
          pageSize: 20,
          checkInDate: finalCheckIn,
          checkOutDate: finalCheckOut
        });

        setHotels(data);
      } catch (err: any) {
        console.error('⚠️ Lỗi gọi API C# Backend:', err);
        setError(err.message || 'Không thể kết nối đến máy chủ WanderVN. Vui lòng kiểm tra lại kết nối mạng.');
        setHotels([]);
      } finally {
        // Trì hoãn nhẹ 300ms để hiệu ứng loading mượt mà
        setTimeout(() => setLoading(false), 300);
      }
    };

    fetchHotels();
  }, [locationId, checkInDate, checkOutDate, capacity]);

  // Bộ lọc phụ ở Client-side (Lọc theo Giá, Loại phòng)
  const displayedHotels = hotels.filter((hotel) => {
    // 1. Lọc theo giá
    if (hotel.minPrice > priceRange.max) return false;

    // 2. Lọc theo Loại hình lưu trú động (Khách sạn, Resort, Villa, Homestay...)
    if (selectedTypes.length > 0) {
      if (!hotel.propertyTypeCode || !selectedTypes.includes(hotel.propertyTypeCode)) {
        return false;
      }
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
          <SearchForm compact />
        </div>
      </header>

      {/* Main Results Layout */}
      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-16 flex flex-col lg:flex-row gap-12">

        {/* Bộ lọc bên trái Sidebar */}
        <FiltersSidebar
          onPriceChange={(min, max) => setPriceRange({ min, max })}
          onTypeChange={(types) => setSelectedTypes(types)}
        />

        {/* Danh sách kết quả bên phải */}
        <section className="w-full lg:w-3/4 space-y-8">

          {/* Header tóm tắt kết quả */}
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4">
            <div>
              <h2 className="font-display-lg text-headline-md text-on-surface">
                {displayedHotels.length} Khách sạn chọn lọc tại {currentLocationName}
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

          {/* Trạng thái Loading */}
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
