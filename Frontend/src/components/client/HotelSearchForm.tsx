import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, Hotel as HotelIcon } from 'lucide-react';
import type { SearchAutocompleteDto } from '../../types';
import { searchService } from '../../services';

interface HotelSearchFormProps {
  compact?: boolean;
  theme?: 'light' | 'dark';
}

export const HotelSearchForm: React.FC<HotelSearchFormProps> = ({
  compact = false,
  theme = 'dark'
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Khởi tạo các trạng thái React với Lazy State Initializer để đảm bảo tính thuần khiết khi render
  const [locationId, setLocationId] = useState<number>(() => {
    return searchParams.get('locationId') ? parseInt(searchParams.get('locationId')!) : 102; // Mặc định: Hội An
  });
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(() => {
    return searchParams.get('hotelId') ? parseInt(searchParams.get('hotelId')!) : null;
  });
  const [query, setQuery] = useState(() => {
    return searchParams.get('locationName') || 'Đà Lạt'; // Lấy trực tiếp tên địa danh hiển thị từ tham số URL
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

  // Đồng bộ hóa trạng thái của form bất cứ khi nào URL thay đổi để tránh re-render đồng bộ
  useEffect(() => {
    const locId = searchParams.get('locationId') ? parseInt(searchParams.get('locationId')!) : 102;
    const locName = searchParams.get('locationName') || 'Đà Lạt';
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
      setSelectedHotelId(null);
    } else {
      setSelectedHotelId(item.targetId);
      const currentLocId = searchParams.get('locationId') ? parseInt(searchParams.get('locationId')!) : 102;
      setLocationId(currentLocId);
    }
    setQuery(item.name);
    setIsOpen(false);
  };

  // Điều hướng tìm kiếm khi gửi form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetLocId = locationId;
    let targetHotelId = selectedHotelId;
    let targetLocName = query;

    if (query.trim() !== '' && suggestions.length > 0) {
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

    let url = `/stays?locationId=${targetLocId}&locationName=${encodeURIComponent(targetLocName)}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&capacity=${capacity}`;

    if (targetHotelId) {
      url += `&hotelId=${targetHotelId}`;
    }

    setIsOpen(false);
    navigate(url);
  };

  // Xác định các lớp CSS dựa trên chủ đề (Theme) để đảm bảo tính đồng nhất
  const isDark = theme === 'dark';
  const containerClasses = isDark
    ? `bg-[#1a1a1a]/95 backdrop-blur-md p-8 rounded-lg shadow-2xl border border-white/10 w-full max-w-container-max mx-auto`
    : `bg-surface p-6 rounded-lg ${compact ? 'shadow-sm border border-outline-variant/30' : 'limestone-shadow border border-outline-variant/20'} w-full max-w-container-max mx-auto`;

  const labelClasses = isDark
    ? `text-caption text-white/50 block font-medium uppercase tracking-wider mb-2`
    : `text-caption text-on-surface-variant block font-medium uppercase tracking-wider mb-2`;

  const inputContainerClasses = isDark
    ? `flex items-center gap-2 border-b border-white/20 pb-2 relative`
    : `flex items-center gap-2 border-b border-primary/20 focus-within:border-primary pb-2 relative`;

  const iconClasses = isDark ? `text-white/50 h-5 w-5 shrink-0` : `text-outline h-5 w-5 shrink-0`;

  const inputClasses = isDark
    ? `w-full bg-transparent border-none p-0 text-white focus:ring-0 font-body-md text-body-md cursor-pointer placeholder:text-white/30 [color-scheme:dark]`
    : `w-full bg-transparent border-none p-0 text-on-surface focus:ring-0 font-body-md text-body-md cursor-pointer placeholder:text-outline/60`;

  return (
    <form onSubmit={handleSubmit} className={containerClasses}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">

        {/* 1. Điểm đến hoặc tên khách sạn (Autocomplete) */}
        <div className="space-y-2 relative md:col-span-1" ref={dropdownRef}>
          <label className={labelClasses}>Điểm đến / Khách sạn</label>
          <div className={inputContainerClasses}>
            {selectedHotelId ? (
              <HotelIcon className={isDark ? "text-secondary-fixed h-5 w-5 shrink-0" : "text-primary h-5 w-5 shrink-0"} />
            ) : (
              <MapPin className={iconClasses} />
            )}
            <input
              type="text"
              className={inputClasses}
              placeholder="Tìm địa danh..."
              value={query}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
            />
          </div>

          {/* Hộp gợi ý thông minh */}
          {isOpen && (
            <div className={`absolute left-0 top-full mt-2 w-full ${isDark ? 'bg-[#222] border border-white/10 text-white' : 'bg-surface border border-outline-variant/40'} rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto`}>
              <div className={`p-3 border-b ${isDark ? 'border-white/10 bg-[#1a1a1a]' : 'border-surface-variant/40 bg-surface-container-low'} flex justify-between items-center`}>
                <span className={`font-label-md text-caption uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-outline'}`}>
                  {query ? 'Gợi ý khớp nhất' : 'Điểm đến tiêu biểu'}
                </span>
                {loading && (
                  <span className="text-caption font-body-sm text-secondary animate-pulse">Đang tìm...</span>
                )}
              </div>
              {suggestions.length > 0 ? (
                <ul className={`divide-y ${isDark ? 'divide-white/5' : 'divide-surface-variant/30'}`}>
                  {suggestions.map((item) => (
                    <li
                      key={item.id}
                      className={`p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-surface-container'} transition-colors cursor-pointer flex items-start gap-3`}
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      {item.type === 'Location' ? (
                        <MapPin className="h-5 w-5 text-secondary mt-1 shrink-0" />
                      ) : (
                        <HotelIcon className="h-5 w-5 text-primary mt-1 shrink-0" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-body-md text-body-md font-medium">{item.name}</span>
                        <span className={`font-caption text-caption ${isDark ? 'text-white/50' : 'text-on-surface-variant'}`}>{item.subtitle}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center font-body-md text-outline">Không tìm thấy kết quả</div>
              )}
            </div>
          )}
        </div>

        {/* 2. Ngày nhận phòng */}
        <div className="space-y-2">
          <label className={labelClasses}>Nhận phòng</label>
          <div className={inputContainerClasses}>
            <Calendar className={iconClasses} />
            <input
              type="date"
              className={inputClasses}
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* 3. Ngày trả phòng */}
        <div className="space-y-2">
          <label className={labelClasses}>Trả phòng</label>
          <div className={inputContainerClasses}>
            <Calendar className={iconClasses} />
            <input
              type="date"
              className={inputClasses}
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* 4. Số lượng khách */}
        <div className="space-y-2">
          <label className={labelClasses}>Số khách</label>
          <div className={inputContainerClasses}>
            <Users className={iconClasses} />
            <select
              className={`${inputClasses} appearance-none pr-4`}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
            >
              <option value={1} className={isDark ? "bg-[#1a1a1a] text-white" : "bg-surface text-on-surface"}>1 Người</option>
              <option value={2} className={isDark ? "bg-[#1a1a1a] text-white" : "bg-surface text-on-surface"}>2 Người</option>
              <option value={3} className={isDark ? "bg-[#1a1a1a] text-white" : "bg-surface text-on-surface"}>3 Người</option>
              <option value={4} className={isDark ? "bg-[#1a1a1a] text-white" : "bg-surface text-on-surface"}>4 Người</option>
              <option value={6} className={isDark ? "bg-[#1a1a1a] text-white" : "bg-surface text-on-surface"}>6+ Người</option>
            </select>
          </div>
        </div>

        {/* 5. Nút tìm kiếm */}
        <button
          type="submit"
          className="bg-secondary text-on-primary font-label-md text-label-md rounded-[4px] py-4 hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 w-full select-none"
        >
          <Search className="h-5 w-5" />
          TÌM KHÁCH SẠN
        </button>

      </div>
    </form>
  );
};

export default HotelSearchForm;
