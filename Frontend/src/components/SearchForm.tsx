import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Users, Search } from 'lucide-react';
import { MOCK_LOCATIONS, LOCATION_TYPE_LABELS } from '../data/mockData';
import type { LocationDto } from '../types';

interface SearchFormProps {
  compact?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Đọc tham số từ URL nếu có
  const initialLocId = searchParams.get('locationId') ? parseInt(searchParams.get('locationId')!) : 102; // Mặc định Hội An
  const initialLoc = MOCK_LOCATIONS.find((l) => l.id === initialLocId);
  const initialCheckIn = searchParams.get('checkInDate') || new Date().toISOString().split('T')[0];
  const initialCheckOut = searchParams.get('checkOutDate') || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const initialCapacity = searchParams.get('capacity') ? parseInt(searchParams.get('capacity')!) : 2;

  const [locationId, setLocationId] = useState<number>(initialLocId);
  const [locationName, setLocationName] = useState<string>(initialLoc ? initialLoc.name : 'Hội An');
  const [query, setQuery] = useState('');
  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut);
  const [capacity, setCapacity] = useState(initialCapacity);

  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<LocationDto[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lọc điểm đến khi nhập chữ
  useEffect(() => {
    if (!query) {
      // Nếu chưa gõ, hiện các điểm du lịch nổi tiếng hàng đầu
      setFilteredLocations(
        MOCK_LOCATIONS.filter((l) => [101, 102, 108, 1].includes(l.id))
      );
    } else {
      const match = MOCK_LOCATIONS.filter((loc) =>
        loc.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLocations(match);
    }
  }, [query]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (loc: LocationDto) => {
    setLocationId(loc.id);
    setLocationName(loc.name);
    setQuery('');
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/stays?locationId=${locationId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&capacity=${capacity}`
    );
  };

  // Định dạng kiểu hiển thị phân cấp (Ví dụ: "Hội An (Quận/Huyện) - Quảng Nam")
  const renderLocationDetail = (loc: LocationDto) => {
    const parent = loc.parentId ? MOCK_LOCATIONS.find((l) => l.id === loc.parentId) : null;
    const typeLabel = LOCATION_TYPE_LABELS[loc.type] || '';
    return (
      <div className="flex flex-col">
        <span className="font-body-md text-body-md text-on-surface font-medium">{loc.name}</span>
        <span className="font-caption text-caption text-on-surface-variant">
          {typeLabel} {parent ? `• thuộc ${parent.name}` : ''}
        </span>
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-surface p-6 rounded-lg ${
        compact ? 'shadow-sm border border-outline-variant/30' : 'limestone-shadow border border-outline-variant/20'
      } flex flex-col lg:flex-row gap-6 items-end`}
    >
      {/* 1. Chọn điểm đến Autocomplete */}
      <div className="w-full lg:flex-grow relative" ref={dropdownRef}>
        <label className="font-label-md text-label-md text-on-surface-variant block mb-2 uppercase tracking-widest">
          Điểm đến
        </label>
        <div className="relative border-b border-primary/20 focus-within:border-primary transition-all duration-300 pb-2 flex items-center">
          <MapPin className="absolute left-0 bottom-2 text-outline h-5 w-5" />
          <input
            type="text"
            className="w-full bg-transparent border-none p-0 pl-8 font-body-md text-body-md text-on-surface focus:ring-0 placeholder:text-outline/60"
            placeholder="Bạn muốn đi nghỉ ở đâu?"
            value={isOpen ? query : locationName}
            onFocus={() => {
              setIsOpen(true);
              setQuery('');
            }}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Dropdown Gợi ý địa điểm */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-full bg-surface border border-outline-variant/40 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
            <div className="p-3 border-b border-surface-variant/40 bg-surface-container-low">
              <span className="font-label-md text-caption uppercase tracking-wider text-outline">
                {query ? 'Kết quả tìm kiếm' : 'Điểm đến được đề xuất'}
              </span>
            </div>
            {filteredLocations.length > 0 ? (
              <ul className="divide-y divide-surface-variant/30">
                {filteredLocations.map((loc) => (
                  <li
                    key={loc.id}
                    className="p-4 hover:bg-surface-container transition-colors cursor-pointer flex items-start gap-3"
                    onClick={() => handleSelectLocation(loc)}
                  >
                    <MapPin className="h-5 w-5 text-secondary mt-1 shrink-0" />
                    {renderLocationDetail(loc)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-on-surface-variant font-body-md">
                Không tìm thấy điểm đến phù hợp
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Chọn ngày nhận phòng */}
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

      {/* 3. Chọn ngày trả phòng */}
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

      {/* 4. Chọn số lượng khách */}
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
