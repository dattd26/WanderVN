import React, { useState } from 'react';
import { PlaneTakeoff, PlaneLanding, Calendar, User, Search } from 'lucide-react';

interface FlightSearchFormProps {
  initialOrigin?: string;
  initialDestination?: string;
  initialDepartureDate?: string;
  onSearch: (origin: string, destination: string, departureDate: string) => void;
}

// Danh sách các sân bay tiêu biểu tại Việt Nam phục vụ việc chọn nhanh
const VIETNAMESE_AIRPORTS = [
  { code: 'HAN', city: 'Hà Nội', name: 'Sân bay Quốc tế Nội Bài' },
  { code: 'SGN', city: 'TP. Hồ Chí Minh', name: 'Sân bay Quốc tế Tân Sơn Nhất' },
  { code: 'DAD', city: 'Đà Nẵng', name: 'Sân bay Quốc tế Đà Nẵng' },
  { code: 'CXR', city: 'Nha Trang', name: 'Sân bay Quốc tế Cam Ranh' },
  { code: 'PQC', city: 'Phú Quốc', name: 'Sân bay Quốc tế Phú Quốc' }
];

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  initialOrigin = 'HAN',
  initialDestination = 'SGN',
  initialDepartureDate = '',
  onSearch
}) => {
  // Khởi tạo các trạng thái lựa chọn và giá trị nhập liệu
  const [tripType, setTripType] = useState<'round-trip' | 'one-way'>('one-way');
  const [cabinClass, setCabinClass] = useState<'business' | 'economy'>('business');

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [departureDate, setDepartureDate] = useState(() => {
    if (initialDepartureDate) return initialDepartureDate;
    // Mặc định ngày đi là 7 ngày sau để tránh sát ngày Sandbox
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return futureDate.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState('1 Người');

  // Hàm xử lý gửi yêu cầu tìm kiếm lên component cha
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin === destination) {
      alert('⚠️ Điểm xuất phát và điểm đến không được trùng nhau.');
      return;
    }
    onSearch(origin, destination, departureDate);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1a1a1a]/95 backdrop-blur-md p-8 rounded-lg shadow-2xl border border-white/10 w-full max-w-container-max mx-auto"
    >
      {/* Lựa chọn loại chặng bay và hạng ghế */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6 border-b border-white/10 pb-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <input
              type="radio"
              name="trip"
              checked={tripType === 'round-trip'}
              onChange={() => setTripType('round-trip')}
              className="w-4 h-4 text-secondary bg-transparent border-white/30 focus:ring-secondary"
            />
            <span className={`font-label-md text-label-md transition-colors ${tripType === 'round-trip' ? 'text-secondary-fixed font-bold' : 'text-white/70 group-hover:text-secondary-fixed'}`}>
              Khứ hồi
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <input
              type="radio"
              name="trip"
              checked={tripType === 'one-way'}
              onChange={() => setTripType('one-way')}
              className="w-4 h-4 text-secondary bg-transparent border-white/30 focus:ring-secondary"
            />
            <span className={`font-label-md text-label-md transition-colors ${tripType === 'one-way' ? 'text-secondary-fixed font-bold' : 'text-white/70 group-hover:text-secondary-fixed'}`}>
              Một chiều
            </span>
          </label>
        </div>

        <div className="hidden sm:block h-6 w-px bg-white/10" />

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <input
              type="radio"
              name="class"
              checked={cabinClass === 'business'}
              onChange={() => setCabinClass('business')}
              className="w-4 h-4 text-secondary bg-transparent border-white/30 focus:ring-secondary"
            />
            <span className={`font-label-md text-label-md transition-colors ${cabinClass === 'business' ? 'text-secondary-fixed font-bold' : 'text-white/70 group-hover:text-secondary-fixed'}`}>
              Hạng Thương gia
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <input
              type="radio"
              name="class"
              checked={cabinClass === 'economy'}
              onChange={() => setCabinClass('economy')}
              className="w-4 h-4 text-secondary bg-transparent border-white/30 focus:ring-secondary"
            />
            <span className={`font-label-md text-label-md transition-colors ${cabinClass === 'economy' ? 'text-secondary-fixed font-bold' : 'text-white/70 group-hover:text-secondary-fixed'}`}>
              Hạng Phổ thông
            </span>
          </label>
        </div>
      </div>

      {/* Các trường nhập liệu điểm xuất phát, điểm đến, ngày bay, số khách */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
        {/* Điểm xuất phát (Origin) */}
        <div className="space-y-2">
          <label className="text-caption text-white/50 block font-medium uppercase tracking-wider">
            Khởi hành từ
          </label>
          <div className="flex items-center gap-2 border-b border-white/20 pb-2 relative">
            <PlaneTakeoff className="text-white/50 h-5 w-5 shrink-0" />
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="bg-transparent border-none p-0 text-white focus:ring-0 w-full font-body-md text-body-md cursor-pointer select-none appearance-none pr-4"
            >
              {VIETNAMESE_AIRPORTS.map((ap) => (
                <option key={ap.code} value={ap.code} className="bg-[#1a1a1a] text-white">
                  {ap.city} ({ap.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Điểm đến (Destination) */}
        <div className="space-y-2">
          <label className="text-caption text-white/50 block font-medium uppercase tracking-wider">
            Hạ cánh tại
          </label>
          <div className="flex items-center gap-2 border-b border-white/20 pb-2 relative">
            <PlaneLanding className="text-white/50 h-5 w-5 shrink-0" />
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-transparent border-none p-0 text-white focus:ring-0 w-full font-body-md text-body-md cursor-pointer select-none appearance-none pr-4"
            >
              {VIETNAMESE_AIRPORTS.map((ap) => (
                <option key={ap.code} value={ap.code} className="bg-[#1a1a1a] text-white">
                  {ap.city} ({ap.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ngày đi (Departure Date) */}
        <div className="space-y-2">
          <label className="text-caption text-white/50 block font-medium uppercase tracking-wider">
            Ngày khởi hành
          </label>
          <div className="flex items-center gap-2 border-b border-white/20 pb-2">
            <Calendar className="text-white/50 h-5 w-5 shrink-0" />
            <input
              type="date"
              value={departureDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="bg-transparent border-none p-0 text-white focus:ring-0 w-full font-body-md text-body-md cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Hành khách (Guests) */}
        <div className="space-y-2">
          <label className="text-caption text-white/50 block font-medium uppercase tracking-wider">
            Hành khách
          </label>
          <div className="flex items-center gap-2 border-b border-white/20 pb-2">
            <User className="text-white/50 h-5 w-5 shrink-0" />
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="bg-transparent border-none p-0 text-white focus:ring-0 w-full font-body-md text-body-md cursor-pointer select-none appearance-none pr-4"
            >
              <option value="1 Lữ khách" className="bg-[#1a1a1a] text-white">1 Người</option>
              <option value="2 Lữ khách" className="bg-[#1a1a1a] text-white">2 Người</option>
              <option value="3 Lữ khách" className="bg-[#1a1a1a] text-white">3 Người</option>
              <option value="4 Lữ khách" className="bg-[#1a1a1a] text-white">4 Người</option>
            </select>
          </div>
        </div>

        {/* Nút Tìm Kiếm Chuyến Bay */}
        <button
          type="submit"
          className="bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-[4px] py-4 hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 w-full select-none"
        >
          <Search className="h-5 w-5" />
          TÌM CHUYẾN BAY
        </button>
      </div>
    </form>
  );
};

export default FlightSearchForm;
