import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, Hotel as HotelIcon } from 'lucide-react';
import { MOCK_LOCATIONS } from '../data/mockData';

// Định nghĩa kiểu dữ liệu gợi ý nhận từ C# Autocomplete API
interface SearchAutocompleteDto {
  id: string;      // loc_xxx hoặc hotel_xxx
  type: 'Location' | 'Hotel';
  name: string;
  subtitle: string;
  targetId: number;
}

interface SearchFormProps {
  compact?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Đọc các tham số tìm kiếm từ URL hiện tại
  const initialLocId = searchParams.get('locationId') ? parseInt(searchParams.get('locationId')!) : 102; // Mặc định: Hội An
  const initialLoc = MOCK_LOCATIONS.find((l) => l.id === initialLocId);
  const initialCheckIn = searchParams.get('checkInDate') || new Date().toISOString().split('T')[0];
  const initialCheckOut = searchParams.get('checkOutDate') || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const initialCapacity = searchParams.get('capacity') ? parseInt(searchParams.get('capacity')!) : 2;
  const initialHotelId = searchParams.get('hotelId') ? parseInt(searchParams.get('hotelId')!) : null;

  // Khai báo các trạng thái React
  const [locationId, setLocationId] = useState<number>(initialLocId);
  const [locationName, setLocationName] = useState<string>(initialLoc ? initialLoc.name : 'Hội An');
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(initialHotelId);
  const [query, setQuery] = useState('');
  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut);
  const [capacity, setCapacity] = useState(initialCapacity);

  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchAutocompleteDto[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cơ chế gọi API gợi ý tự động (Autocomplete) kèm trì hoãn (Debounce 300ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        // Gửi truy vấn gợi ý sang ASP.NET Core Backend
        const response = await fetch(`http://localhost:5096/api/v1/search/autocomplete?Keyword=${encodeURIComponent(query)}`);
        if (response.ok) {
          const result = await response.json();
          if (result && result.success && Array.isArray(result.data)) {
            setSuggestions(result.data);
          }
        } else {
          throw new Error('API không thành công');
        }
      } catch (err) {
        console.warn('⚠️ Lỗi kết nối API Autocomplete C#, sử dụng cơ chế định tuyến dữ liệu mẫu:', err);
        
        // Cơ chế Dự phòng (Fallback): Lọc tại Client từ mockData địa phương
        const keyword = query.trim().toLowerCase();
        if (!keyword) {
          // Trả về địa danh đề xuất mặc định khi chưa nhập chữ
          setSuggestions(
            MOCK_LOCATIONS.filter((l) => [101, 102, 104, 22].includes(l.id)).map((l) => ({
              id: `loc_${l.id}`,
              type: 'Location' as const,
              name: l.name,
              subtitle: l.type === 'District' ? 'Quận / Huyện • Việt Nam' : 'Tỉnh / Thành phố • Việt Nam',
              targetId: l.id
            }))
          );
        } else {
          // Lọc theo từ khóa khớp tên
          const match: SearchAutocompleteDto[] = MOCK_LOCATIONS.filter((loc) =>
            loc.name.toLowerCase().includes(keyword)
          ).map((l) => ({
            id: `loc_${l.id}`,
            type: 'Location' as const,
            name: l.name,
            subtitle: l.type === 'District' ? 'Quận / Huyện • Việt Nam' : 'Tỉnh / Thành phố • Việt Nam',
            targetId: l.id
          }));
          setSuggestions(match);
        }
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
      setLocationName(item.name);
      setSelectedHotelId(null); // Reset khách sạn cụ thể
    } else {
      // Nếu chọn trực tiếp một khách sạn cụ thể
      setSelectedHotelId(item.targetId);
      setLocationName(item.name);
      // Gán locationId theo khách sạn nếu có thông tin (hoặc giữ nguyên để gửi tìm kiếm)
      setLocationId(initialLocId);
    }
    setQuery('');
    setIsOpen(false);
  };

  // Điều hướng tìm kiếm khi gửi form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = `/stays?locationId=${locationId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&capacity=${capacity}`;
    
    // Nếu có chọn một khách sạn cụ thể, đính kèm thêm ID khách sạn để tự động cuộn hoặc lọc riêng biệt
    if (selectedHotelId) {
      url += `&hotelId=${selectedHotelId}`;
    }
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
            value={isOpen ? query : locationName}
            onFocus={() => {
              setIsOpen(true);
              setQuery('');
            }}
            onChange={(e) => setQuery(e.target.value)}
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
