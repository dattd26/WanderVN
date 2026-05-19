import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, Hotel as HotelIcon } from 'lucide-react';
import type { SearchAutocompleteDto } from '../types';
import { searchService } from '../services';

interface SearchFormProps {
  compact?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Khai báo các trạng thái React với Lazy State Initializer để đảm bảo tính thuần khiết (Purity) khi render
  const [locationId, setLocationId] = useState<number>(() => {
    return searchParams.get('locationId') ? parseInt(searchParams.get('locationId')!) : 102; // Mặc định: Hội An
  });
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(() => {
    return searchParams.get('hotelId') ? parseInt(searchParams.get('hotelId')!) : null;
  });
  const [query, setQuery] = useState(() => {
    return searchParams.get('locationName') || 'Hội An'; // Lấy trực tiếp tên địa danh hiển thị từ tham số URL
  });
  const [checkInDate, setCheckInDate] = useState(() => {
    return searchParams.get('checkInDate') || new Date().toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    return searchParams.get('checkOutDate') || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  });
  const [capacity, setCapacity] = useState(() => {
    return searchParams.get('capacity') ? parseInt(searchParams.get('capacity')!) : 2;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchAutocompleteDto[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đồng bộ hóa trạng thái của form bất cứ khi nào URL thay đổi, bọc qua setTimeout 0 để tránh re-render đồng bộ
  useEffect(() => {
    const locId = searchParams.get('locationId') ? parseInt(searchParams.get('locationId')!) : 102;
    const locName = searchParams.get('locationName') || 'Hội An';
    const checkIn = searchParams.get('checkInDate') || new Date().toISOString().split('T')[0];
    const checkOut = searchParams.get('checkOutDate') || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const cap = searchParams.get('capacity') ? parseInt(searchParams.get('capacity')!) : 2;
    const hotelId = searchParams.get('hotelId') ? parseInt(searchParams.get('hotelId')!) : null;

    const timer = setTimeout(() => {
      setLocationId(locId);
      setQuery(locName);
      setSelectedHotelId(hotelId);
      setCheckInDate(checkIn);
      setCheckOutDate(checkOut);
      setCapacity(cap);
    }, 0);

    return () => clearTimeout(timer);
  }, [searchParams]);

  // Cơ chế gọi API gợi ý tự động (Autocomplete) kèm trì hoãn (Debounce 300ms)
  useEffect(() => {
    if (!query.trim()) {
      const timer = setTimeout(() => {
        setSuggestions([]);
      }, 0);
      return () => clearTimeout(timer);
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        // Gửi truy vấn gợi ý sang dịch vụ API tập trung
        const data = await searchService.getAutocomplete(query);
        setSuggestions(data);
      } catch (err) {
        console.warn('⚠️ Lỗi kết nối API Autocomplete C#:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Đóng bảng gợi ý khi click chuột ra ngoài vùng chọn
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý khi chọn một mục gợi ý (Địa điểm hoặc Khách sạn cụ thể)
  const handleSelectSuggestion = (item: SearchAutocompleteDto) => {
    if (item.type === 'Location') {
      setLocationId(item.targetId);
      setSelectedHotelId(null); // Reset khách sạn cụ thể
    } else {
      // Nếu chọn trực tiếp một khách sạn cụ thể
      setSelectedHotelId(item.targetId);
      // Gán locationId theo khách sạn nếu có thông tin (hoặc giữ nguyên để gửi tìm kiếm)
      const currentLocId = searchParams.get('locationId') ? parseInt(searchParams.get('locationId')!) : 102;
      setLocationId(currentLocId);
    }
    setQuery(item.name); // Điền trực tiếp tên địa danh đã chọn vào ô nhập liệu
    setIsOpen(false);
  };


  // Điều hướng tìm kiếm khi gửi form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetLocId = locationId;
    let targetHotelId = selectedHotelId;
    let targetLocName = query; // Sử dụng tên hiển thị hiện tại trong ô input làm mặc định

    // Nếu dropdown gợi ý đang mở và người dùng bấm nút Tìm kiếm mà chưa click chọn cụ thể
    if (isOpen && query.trim() !== '') {
      if (suggestions.length > 0) {
        // Tự động lấy gợi ý đầu tiên khớp nhất để thực hiện tìm kiếm
        const bestMatch = suggestions[0];
        if (bestMatch.type === 'Location') {
          targetLocId = bestMatch.targetId;
          targetHotelId = null;
          targetLocName = bestMatch.name;
        } else {
          targetHotelId = bestMatch.targetId;
          targetLocName = bestMatch.name;
          targetLocId = searchParams.get('locationId') ? parseInt(searchParams.get('locationId')!) : 102;
        }
      }
    }

    let url = `/stays?locationId=${targetLocId}&locationName=${encodeURIComponent(targetLocName)}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&capacity=${capacity}`;
    
    // Nếu có chọn một khách sạn cụ thể, đính kèm thêm ID khách sạn để tự động cuộn hoặc lọc riêng biệt
    if (targetHotelId) {
      url += `&hotelId=${targetHotelId}`;
    }

    setIsOpen(false);
    navigate(url);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-surface p-6 rounded-lg ${
        compact ? 'shadow-sm border border-outline-variant/30' : 'limestone-shadow border border-outline-variant/20'
      } flex flex-col lg:flex-row gap-6 items-end`}
    >
      {/* 1. Điểm đến / Khách sạn (Autocomplete) */}
      <div className="w-full lg:flex-grow relative" ref={dropdownRef}>
        <label className="font-label-md text-label-md text-on-surface-variant block mb-2 uppercase tracking-widest">
          Điểm đến hoặc Tên Khách sạn
        </label>
        <div className="relative border-b border-primary/20 focus-within:border-primary transition-all duration-300 pb-2 flex items-center">
          {selectedHotelId ? (
            <HotelIcon className="absolute left-0 bottom-2 text-primary h-5 w-5" />
          ) : (
            <MapPin className="absolute left-0 bottom-2 text-outline h-5 w-5" />
          )}
          <input
            type="text"
            className="w-full bg-transparent border-none p-0 pl-8 font-body-md text-body-md text-on-surface focus:ring-0 placeholder:text-outline/60"
            placeholder="Tìm địa danh hoặc khách sạn..."
            value={query}
            onFocus={() => {
              setIsOpen(true);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
          />
        </div>

        {/* Khung hiển thị gợi ý (Dropdown) */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-full bg-surface border border-outline-variant/40 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
            <div className="p-3 border-b border-surface-variant/40 bg-surface-container-low flex justify-between items-center">
              <span className="font-label-md text-caption uppercase tracking-wider text-outline">
                {query ? 'Kết quả gợi ý thông minh' : 'Địa danh phổ biến khuyên dùng'}
              </span>
              {loading && (
                <span className="text-caption font-body-sm text-secondary animate-pulse">
                  Đang tìm...
                </span>
              )}
            </div>
            {suggestions.length > 0 ? (
              <ul className="divide-y divide-surface-variant/30">
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    className="p-4 hover:bg-surface-container transition-colors cursor-pointer flex items-start gap-3"
                    onClick={() => handleSelectSuggestion(item)}
                  >
                    {item.type === 'Location' ? (
                      <MapPin className="h-5 w-5 text-secondary mt-1 shrink-0" />
                    ) : (
                      <HotelIcon className="h-5 w-5 text-primary mt-1 shrink-0" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface font-medium">
                        {item.name}
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        {item.subtitle}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-on-surface-variant font-body-md">
                Không tìm thấy kết quả phù hợp
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Ngày nhận phòng */}
      <div className="w-full lg:w-48">
        <label className="font-label-md text-label-md text-on-surface-variant block mb-2 uppercase tracking-widest">
          Nhận phòng
        </label>
        <div className="relative border-b border-primary/20 focus-within:border-primary transition-all duration-300 pb-2 flex items-center">
          <Calendar className="absolute left-0 bottom-2 text-outline h-5 w-5" />
          <input
            type="date"
            className="w-full bg-transparent border-none p-0 pl-8 font-body-md text-body-md text-on-surface focus:ring-0 cursor-pointer"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* 3. Ngày trả phòng */}
      <div className="w-full lg:w-48">
        <label className="font-label-md text-label-md text-on-surface-variant block mb-2 uppercase tracking-widest">
          Trả phòng
        </label>
        <div className="relative border-b border-primary/20 focus-within:border-primary transition-all duration-300 pb-2 flex items-center">
          <Calendar className="absolute left-0 bottom-2 text-outline h-5 w-5" />
          <input
            type="date"
            className="w-full bg-transparent border-none p-0 pl-8 font-body-md text-body-md text-on-surface focus:ring-0 cursor-pointer"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            min={checkInDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* 4. Số lượng khách */}
      <div className="w-full lg:w-40">
        <label className="font-label-md text-label-md text-on-surface-variant block mb-2 uppercase tracking-widest">
          Số khách
        </label>
        <div className="relative border-b border-primary/20 focus-within:border-primary transition-all duration-300 pb-2 flex items-center">
          <Users className="absolute left-0 bottom-2 text-outline h-5 w-5" />
          <select
            className="w-full bg-transparent border-none p-0 pl-8 font-body-md text-body-md text-on-surface focus:ring-0 cursor-pointer appearance-none"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value))}
          >
            <option value={1} className="bg-surface">1 Lữ khách</option>
            <option value={2} className="bg-surface">2 Lữ khách</option>
            <option value={3} className="bg-surface">3 Lữ khách</option>
            <option value={4} className="bg-surface">4 Lữ khách</option>
            <option value={6} className="bg-surface">6+ Lữ khách</option>
          </select>
        </div>
      </div>

      {/* 5. Nút tìm kiếm */}
      <button
        type="submit"
        className="w-full lg:w-auto bg-secondary text-on-primary font-label-md text-label-md uppercase tracking-widest px-8 py-4 hover:bg-on-secondary-container transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        <Search className="h-5 w-5" />
        Tìm kiếm
      </button>
    </form>
  );
};

export default SearchForm;
