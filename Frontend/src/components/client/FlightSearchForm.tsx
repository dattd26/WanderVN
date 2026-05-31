import React, { useState, useRef, useEffect } from 'react';
import { PlaneTakeoff, PlaneLanding, Calendar, User, Search, ChevronDown } from 'lucide-react';

interface FlightSearchFormProps {
  initialOrigin?: string;
  initialDestination?: string;
  initialDepartureDate?: string;
  initialReturnDate?: string;
  initialTripType?: 'round-trip' | 'one-way';
  initialCabinClass?: 'business' | 'economy';
  onSearch: (
    origin: string,
    destination: string,
    departureDate: string,
    tripType: 'round-trip' | 'one-way',
    cabinClass: 'business' | 'economy',
    returnDate?: string
  ) => void;
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
  initialReturnDate = '',
  initialTripType = 'one-way',
  initialCabinClass = 'business',
  onSearch
}) => {
  const [tripType, setTripType] = useState<'round-trip' | 'one-way'>(initialTripType);
  const [cabinClass, setCabinClass] = useState<'business' | 'economy'>(initialCabinClass);

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [departureDate, setDepartureDate] = useState(() => {
    if (initialDepartureDate) return initialDepartureDate;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return futureDate.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    if (initialReturnDate) return initialReturnDate;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    return futureDate.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState('1 Người');

  // Custom Dropdown Open States
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);

  // Refs for click outside detection
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setIsOriginOpen(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setIsDestinationOpen(false);
      }
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setIsGuestsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin === destination) {
      alert('⚠️ Điểm xuất phát và điểm đến không được trùng nhau.');
      return;
    }
    if (tripType === 'round-trip' && returnDate <= departureDate) {
      alert('⚠️ Ngày trở về phải sau ngày khởi hành.');
      return;
    }
    onSearch(origin, destination, departureDate, tripType, cabinClass, tripType === 'round-trip' ? returnDate : undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#121212]/80 backdrop-blur-2xl p-8 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10 w-full max-w-container-max mx-auto"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes glowMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        .glow-underline-bar {
          background: linear-gradient(
            90deg,
            #d97706, /* Đồng cổ (Tạo điểm nhấn tối hai đầu) */
            #f59e0b, /* Vàng Hổ Phách */
            #fef08a, /* Vàng Chanh Sáng (Tạo điểm rực sáng - Glow) */
            #fff9e6, /* Ánh Kim Trắng (Tâm điểm bắt sáng cực đại) */
            #fbf2b7, /* Quay lại vàng sáng */
            #f59e0b, /* Vàng Hổ Phách */
            #d97706  /* Lặp lại để mượt vòng lặp animation */
          );
          background-size: 200% auto;
          animation: glowMove 3s linear infinite;
        }
      `}} />

      {/* Lựa chọn loại chặng bay và hạng ghế */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8 border-b border-white/10 pb-5 justify-between items-start sm:items-center">
        <div className="flex items-center gap-8">
          <label className="flex items-center gap-2.5 cursor-pointer group select-none">
            <input
              type="radio"
              name="trip"
              checked={tripType === 'round-trip'}
              onChange={() => setTripType('round-trip')}
              className="w-4 h-4 text-secondary bg-transparent border-white/30 focus:ring-secondary focus:ring-offset-[#121212]"
            />
            <span className={`font-label-md text-caption uppercase tracking-wider transition-colors duration-300 ${tripType === 'round-trip' ? 'text-yellow-200 font-bold' : 'text-white/60 group-hover:text-white'}`}>
              Khứ hồi
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer group select-none">
            <input
              type="radio"
              name="trip"
              checked={tripType === 'one-way'}
              onChange={() => setTripType('one-way')}
              className="w-4 h-4 text-secondary bg-transparent border-white/30 focus:ring-secondary focus:ring-offset-[#121212]"
            />
            <span className={`font-label-md text-caption uppercase tracking-wider transition-colors duration-300 ${tripType === 'one-way' ? 'text-yellow-200 font-bold' : 'text-white/60 group-hover:text-white'}`}>
              Một chiều
            </span>
          </label>
        </div>

        <div className="hidden sm:block h-6 w-px bg-white/10" />

        <div className="flex items-center gap-8">
          <label className="flex items-center gap-2.5 cursor-pointer group select-none">
            <input
              type="radio"
              name="class"
              checked={cabinClass === 'business'}
              onChange={() => setCabinClass('business')}
              className="w-4 h-4 text-secondary bg-transparent border-white/30 focus:ring-secondary focus:ring-offset-[#121212]"
            />
            <span className={`font-label-md text-caption uppercase tracking-wider transition-colors duration-300 ${cabinClass === 'business' ? 'text-yellow-200 font-bold' : 'text-white/60 group-hover:text-white'}`}>
              Hạng Thương gia
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer group select-none">
            <input
              type="radio"
              name="class"
              checked={cabinClass === 'economy'}
              onChange={() => setCabinClass('economy')}
              className="w-4 h-4 text-secondary bg-transparent border-white/30 focus:ring-secondary focus:ring-offset-[#121212]"
            />
            <span className={`font-label-md text-caption uppercase tracking-wider transition-colors duration-300 ${cabinClass === 'economy' ? 'text-yellow-200 font-bold' : 'text-white/60 group-hover:text-white'}`}>
              Hạng Phổ thông
            </span>
          </label>
        </div>
      </div>

      {/* Các trường nhập liệu sử dụng flexbox và transition mượt mà */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-end w-full">
        {/* Điểm xuất phát (Origin) */}
        <div className="space-y-2 relative flex-[2_2_0%] w-full min-w-[160px]" ref={originRef}>
          <label className="text-[10px] text-white/50 block font-medium uppercase tracking-[0.2em]">
            Khởi hành từ
          </label>
          <div
            onClick={() => {
              setIsOriginOpen(!isOriginOpen);
              setIsDestinationOpen(false);
              setIsGuestsOpen(false);
            }}
            className="flex items-center justify-between border-b border-white/20 pb-3 cursor-pointer group focus-within:border-secondary transition-colors duration-300"
          >
            <div className="flex items-center gap-3 w-full truncate">
              <PlaneTakeoff className="text-white/40 h-5 w-5 shrink-0 group-hover:text-secondary transition-colors" />
              <div className="text-white font-body-md text-body-md select-none truncate">
                {VIETNAMESE_AIRPORTS.find(ap => ap.code === origin)?.city} ({origin})
              </div>
            </div>
            <ChevronDown className="text-white/30 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:text-white" style={{ transform: isOriginOpen ? 'rotate(180deg)' : 'none' }} />
          </div>

          {/* Custom Dropdown List */}
          {isOriginOpen && (
            <div className="absolute left-0 top-full mt-2 w-full min-w-[280px] bg-[#161616] border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-50 py-2 max-h-60 overflow-y-auto">
              {VIETNAMESE_AIRPORTS.map((ap) => (
                <div
                  key={ap.code}
                  onClick={() => {
                    setOrigin(ap.code);
                    setIsOriginOpen(false);
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors flex flex-col ${origin === ap.code ? 'bg-secondary/10 text-secondary' : 'text-white'}`}
                >
                  <span className="font-medium font-body-md text-body-md">{ap.city} ({ap.code})</span>
                  <span className="text-[11px] text-white/40">{ap.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Điểm đến (Destination) */}
        <div className="space-y-2 relative flex-[2_2_0%] w-full min-w-[160px]" ref={destinationRef}>
          <label className="text-[10px] text-white/50 block font-medium uppercase tracking-[0.2em]">
            Hạ cánh tại
          </label>
          <div
            onClick={() => {
              setIsDestinationOpen(!isDestinationOpen);
              setIsOriginOpen(false);
              setIsGuestsOpen(false);
            }}
            className="flex items-center justify-between border-b border-white/20 pb-3 cursor-pointer group focus-within:border-secondary transition-colors duration-300"
          >
            <div className="flex items-center gap-3 w-full truncate">
              <PlaneLanding className="text-white/40 h-5 w-5 shrink-0 group-hover:text-secondary transition-colors" />
              <div className="text-white font-body-md text-body-md select-none truncate">
                {VIETNAMESE_AIRPORTS.find(ap => ap.code === destination)?.city} ({destination})
              </div>
            </div>
            <ChevronDown className="text-white/30 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:text-white" style={{ transform: isDestinationOpen ? 'rotate(180deg)' : 'none' }} />
          </div>

          {/* Custom Dropdown List */}
          {isDestinationOpen && (
            <div className="absolute left-0 top-full mt-2 w-full min-w-[280px] bg-[#161616] border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-50 py-2 max-h-60 overflow-y-auto">
              {VIETNAMESE_AIRPORTS.map((ap) => (
                <div
                  key={ap.code}
                  onClick={() => {
                    setDestination(ap.code);
                    setIsDestinationOpen(false);
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors flex flex-col ${destination === ap.code ? 'bg-secondary/10 text-secondary' : 'text-white'}`}
                >
                  <span className="font-medium font-body-md text-body-md">{ap.city} ({ap.code})</span>
                  <span className="text-[11px] text-white/40">{ap.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ngày đi (Departure Date) */}
        <div className="space-y-2 flex-[2_2_0%] w-full min-w-[140px]">
          <label className="text-[10px] text-white/50 block font-medium uppercase tracking-[0.2em] whitespace-nowrap">
            Ngày khởi hành
          </label>
          <div className="flex items-center gap-3 border-b border-white/20 pb-3 group focus-within:border-secondary transition-colors duration-300">
            <Calendar className="text-white/40 h-5 w-5 shrink-0 group-focus-within:text-secondary transition-colors" />
            <input
              type="date"
              value={departureDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDepartureDate(e.target.value)}
              onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) { } }}
              className="bg-transparent border-none p-0 text-white focus:ring-0 w-full font-body-md text-body-md cursor-pointer outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Ngày trở về (Return Date) — Có hiệu ứng trượt mở mượt mà */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${tripType === 'round-trip'
            ? 'flex-[2_2_0%] w-full min-w-[140px] opacity-100 max-h-[100px] md:max-h-none pointer-events-auto'
            : 'flex-[0_0_0%] w-0 min-w-0 opacity-0 max-h-0 md:max-h-none pointer-events-none'
            }`}
        >
          <div className="space-y-2">
            <label className="text-[10px] text-white/50 block font-medium uppercase tracking-[0.2em] whitespace-nowrap">
              Ngày trở về
            </label>
            <div className="flex items-center gap-3 border-b border-white/20 pb-3 group focus-within:border-secondary transition-colors duration-300">
              <Calendar className="text-white/40 h-5 w-5 shrink-0 group-focus-within:text-secondary transition-colors" />
              <input
                type="date"
                value={returnDate}
                min={departureDate}
                onChange={(e) => setReturnDate(e.target.value)}
                onClick={(e) => { try { e.currentTarget.showPicker(); } catch (err) { } }}
                className="bg-transparent border-none p-0 text-white focus:ring-0 w-full font-body-md text-body-md cursor-pointer outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Hành khách (Guests) */}
        <div className="space-y-2 relative flex-[1.5_1.5_0%] w-full min-w-[120px]" ref={guestsRef}>
          <label className="text-[10px] text-white/50 block font-medium uppercase tracking-[0.2em] whitespace-nowrap">
            Hành khách
          </label>
          <div
            onClick={() => {
              setIsGuestsOpen(!isGuestsOpen);
              setIsOriginOpen(false);
              setIsDestinationOpen(false);
            }}
            className="flex items-center justify-between border-b border-white/20 pb-3 cursor-pointer group focus-within:border-secondary transition-colors duration-300"
          >
            <div className="flex items-center gap-3 w-full truncate">
              <User className="text-white/40 h-5 w-5 shrink-0 group-hover:text-secondary transition-colors" />
              <div className="text-white font-body-md text-body-md select-none truncate">
                {guests}
              </div>
            </div>
            <ChevronDown className="text-white/30 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:text-white" style={{ transform: isGuestsOpen ? 'rotate(180deg)' : 'none' }} />
          </div>

          {/* Custom Dropdown List */}
          {isGuestsOpen && (
            <div className="absolute right-0 top-full mt-2 w-full min-w-[160px] bg-[#161616] border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-50 py-2">
              {['1 Người', '2 Người', '3 Người', '4 Người'].map((gOption) => (
                <div
                  key={gOption}
                  onClick={() => {
                    setGuests(gOption);
                    setIsGuestsOpen(false);
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors font-body-md text-body-md ${guests === gOption ? 'bg-secondary/10 text-secondary' : 'text-white'}`}
                >
                  {gOption}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nút Tìm Kiếm Chuyến Bay */}
        <button
          type="submit"
          className="relative overflow-hidden flex-[2.5_2.5_0%] w-full min-w-[180px] shrink-0 whitespace-nowrap bg-[#e5c158] hover:bg-[#f3ca52] text-[#121212] font-bold font-label-md text-caption uppercase tracking-[0.15em] rounded-xl py-4 transition-all duration-300 flex items-center justify-center gap-3 select-none shadow-[0_10px_20px_rgba(229,193,88,0.2)] hover:shadow-[0_12px_24px_rgba(243,202,82,0.3)] active:scale-95 border border-transparent"
        >
          <div className="absolute bottom-0 left-0 right-0 h-[6px] opacity-25 blur-[4px] glow-underline-bar" />

          <div className="absolute bottom-0 left-0 right-0 h-[3px] glow-underline-bar" />

          <Search className="h-4 w-4 z-10 stroke-[2.5]" />
          <span className="z-10">TÌM CHUYẾN BAY</span>
        </button>
      </div>
    </form>
  );
};

export default FlightSearchForm;
