import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FlightSearchForm } from '../../components/client/FlightSearchForm';
import { flightService } from '../../services';
import type { FlightOfferDto } from '../../types';
import {
  Plane,
  Utensils,
  BedDouble,
  Wifi,
  ArrowRight
} from 'lucide-react';


export const SearchFlights: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Lấy dữ liệu trực tiếp từ searchParams trên URL để tránh đồng bộ state trùng lặp không cần thiết
  const origin = searchParams.get('origin') || 'HAN';
  const destination = searchParams.get('destination') || 'SGN';
  const departureDate = (() => {
    if (searchParams.get('departureDate')) return searchParams.get('departureDate')!;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return futureDate.toISOString().split('T')[0];
  })();

  const hasSearched = !!(searchParams.get('origin') && searchParams.get('destination') && searchParams.get('departureDate'));

  const [offers, setOffers] = useState<FlightOfferDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái vé máy bay đang được chọn
  const [selectedOffer, setSelectedOffer] = useState<FlightOfferDto | null>(null);

  // Thực hiện tìm kiếm chuyến bay từ C# API (khai báo trước useEffect để tránh lỗi truy cập trước khi khai báo)
  const executeSearch = async (o: string, d: string, date: string) => {
    setLoading(true);
    setError(null);
    setSelectedOffer(null);
    try {
      const response = await flightService.searchFlights({
        origin: o,
        destination: d,
        departureDate: date,
        passengerType: 'adult',
        returnOffers: true
      });

      setOffers(response);

      if (response.length === 0) {
        setError('Không tìm thấy chuyến bay khả dụng cho chặng bay này trong ngày đã chọn.');
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tìm kiếm chuyến bay. Vui lòng thử lại sau.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Tự động kích hoạt tìm kiếm khi có tham số trên URL
  useEffect(() => {
    const o = searchParams.get('origin');
    const d = searchParams.get('destination');
    const dt = searchParams.get('departureDate');

    if (o && d && dt) {
      // Chạy tìm kiếm bất đồng bộ ngoài luồng render đồng bộ để tránh cảnh báo cascading render
      const timer = setTimeout(() => {
        executeSearch(o, d, dt);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Đồng bộ hóa URL khi thực hiện lượt tìm kiếm mới
  const handleSearchSubmit = (newOrigin: string, newDest: string, newDate: string) => {
    setSearchParams({
      origin: newOrigin,
      destination: newDest,
      departureDate: newDate
    });
  };

  // Định dạng thời gian hiển thị (HH:MM)
  const formatTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return dateTimeString;
    }
  };

  // Hàm chuyển đổi khoảng thời gian Duffel (ISO 8601 Duration như PT1H20M) sang hiển thị thân thiện
  const formatDuration = (durationStr: string) => {
    if (!durationStr) return '1h 20m';
    const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return durationStr;
    const hours = match[1] ? `${match[1]}h` : '';
    const minutes = match[2] ? `${match[2]}m` : '';
    return `${hours} ${minutes}`.trim() || '1h 20m';
  };


  return (
    <div className="flex flex-col min-h-screen">
      {/* Cinematic Hero Section */}
      <section className="relative h-[65vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            alt="Mây trời phi cơ nghệ thuật"
            className="w-full h-full object-cover grayscale-[15%] brightness-[65%]"
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#fdf9f4]"></div>
        </div>
        <div className="relative z-10 text-center text-on-primary px-margin-mobile">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-4 drop-shadow-xl select-none">
            Tìm Chuyến Bay Của Bạn
          </h1>
          <p className="font-headline-md text-body-lg max-w-2xl mx-auto opacity-95 italic select-none">
            Kết nối di sản ngàn năm với các chuyến bay thoải mái bậc nhất Việt Nam.
          </p>
        </div>
        {/* Floating Search Widget */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-container-max px-margin-desktop hidden md:block z-20">
          <FlightSearchForm
            initialOrigin={origin}
            initialDestination={destination}
            initialDepartureDate={departureDate}
            onSearch={handleSearchSubmit}
          />
        </div>
      </section>

      {/* Mobile Search Widget Display */}
      <div className="block md:hidden px-margin-mobile mt-10 z-10">
        <FlightSearchForm
          initialOrigin={origin}
          initialDestination={destination}
          initialDepartureDate={departureDate}
          onSearch={handleSearchSubmit}
        />
      </div>

      {/* Main Results Content Area */}
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-28 md:mt-36 mb-section-gap w-full flex-grow">
        {!hasSearched ? (
          <div className="bg-surface border border-outline/10 p-12 text-center rounded-lg limestone-shadow max-w-3xl mx-auto flex flex-col items-center gap-6 mt-4">
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-2 animate-bounce">
              <Plane className="h-10 w-10 rotate-[45deg]" />
            </div>
            <h3 className="font-display-md text-headline-md text-primary font-bold">
              Khám Phá Các Chặng Bay Thượng Lưu
            </h3>
            <p className="text-body-md text-on-surface-variant max-w-xl leading-relaxed">
              WanderVN kết nối các chuyến bay đẳng cấp tới mọi miền di sản của Việt Nam. 
              Hãy điền thông tin chặng bay và ngày khởi hành ở thanh tìm kiếm phía trên để chúng tôi tìm kiếm các ưu đãi chuyến bay tốt nhất dành cho hành trình tinh hoa của bạn.
            </p>
            <div className="w-full border-t border-outline/10 my-4" />
            <div className="w-full text-left">
              <span className="font-label-md text-label-md text-secondary uppercase tracking-widest block mb-4 text-center">
                Gợi ý chặng bay phổ biến
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { from: 'HAN', to: 'SGN', title: 'Hà Nội → TP. Hồ Chí Minh', desc: 'Chặng bay nhộn nhịp nhất nối liền 2 đầu cầu kinh tế.' },
                  { from: 'HAN', to: 'DAD', title: 'Hà Nội → Đà Nẵng', desc: 'Hành trình đến với thành phố đáng sống bên sông Hàn thơ mộng.' },
                  { from: 'SGN', to: 'CXR', title: 'TP. Hồ Chí Minh → Nha Trang', desc: 'Chuyến đi nghỉ dưỡng ngập tràn nắng vàng trên vịnh ngọc.' },
                  { from: 'HAN', to: 'PQC', title: 'Hà Nội → Phú Quốc', desc: 'Đắm mình trong làn nước xanh ngọc bích của Đảo Ngọc.' },
                  { from: 'SGN', to: 'VDO', title: 'TP. Hồ Chí Minh → Vân Đồn', desc: 'Cửa ngõ khám phá kỳ quan thiên nhiên thế giới Vịnh Hạ Long.' },
                  { from: 'DAD', to: 'SGN', title: 'Đà Nẵng → TP. Hồ Chí Minh', desc: 'Chặng bay khứ hồi kết nối biển xanh và đô thị sầm uất.' },
                ].map((route) => (
                  <button
                    key={`${route.from}-${route.to}`}
                    onClick={() => handleSearchSubmit(route.from, route.to, departureDate)}
                    className="p-5 border border-outline/15 hover:border-primary/40 rounded-lg text-left bg-surface-container-low hover:bg-surface-container-high transition-all flex flex-col gap-1 limestone-shadow-sm hover:scale-[1.02]"
                  >
                    <span className="font-label-md text-primary">{route.title}</span>
                    <span className="text-caption text-on-surface-variant font-medium line-clamp-2 mt-1">{route.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              /* High-End Skeleton Loading Cards */
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface border border-outline/10 p-8 rounded-lg flex flex-col lg:flex-row items-center justify-between gap-8 animate-pulse">
                    <div className="flex items-center gap-6 lg:w-1/4 w-full">
                      <div className="w-12 h-12 bg-outline-variant/30 rounded" />
                      <div className="space-y-2">
                        <div className="h-4 bg-outline-variant/30 w-24 rounded" />
                        <div className="h-3 bg-outline-variant/30 w-16 rounded" />
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-6 md:gap-12 w-full lg:px-12">
                      <div className="space-y-2">
                        <div className="h-6 bg-outline-variant/30 w-16 rounded" />
                        <div className="h-3 bg-outline-variant/30 w-8 rounded" />
                      </div>
                      <div className="flex-grow max-w-[200px] h-2 bg-outline-variant/20 rounded" />
                      <div className="space-y-2 text-right">
                        <div className="h-6 bg-outline-variant/30 w-16 rounded" />
                        <div className="h-3 bg-outline-variant/30 w-8 rounded" />
                      </div>
                    </div>
                    <div className="lg:w-1/4 w-full flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4">
                      <div className="h-6 bg-outline-variant/30 w-20 rounded" />
                      <div className="h-10 bg-outline-variant/30 w-36 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-surface border border-outline/10 p-12 text-center rounded-lg limestone-shadow max-w-xl mx-auto flex flex-col items-center gap-4">
                <span className="text-secondary text-5xl">⚠️</span>
                <h3 className="font-display-md text-headline-md text-primary font-bold">Không tìm thấy kết quả</h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{error}</p>
                <button
                  onClick={() => setSearchParams({})}
                  className="px-6 py-2.5 border border-primary text-primary hover:bg-primary hover:text-on-primary font-label-md text-label-md uppercase tracking-wider transition-all rounded-[4px] mt-4"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20 mb-6">
                  <div>
                    <h2 className="font-display-md text-headline-md text-primary">Các Chuyến Bay Khả Dụng</h2>
                    <p className="text-body-md text-on-surface-variant italic mt-0.5">
                      Tìm thấy {offers.length} chuyến bay cao cấp từ {origin} đi {destination}
                    </p>
                  </div>
                </div>

                {offers.map((offer) => {
                  const isSelected = selectedOffer?.id === offer.id;

                  return (
                    <div
                      key={offer.id}
                      className={`group bg-surface border transition-all duration-500 overflow-hidden rounded-lg limestone-shadow ${isSelected
                        ? 'border-secondary ring-1 ring-secondary/20 bg-surface-container-low'
                        : 'border-outline/10 hover:border-primary/20'
                        }`}
                    >
                      <div className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
                        {/* Thông tin Hãng hàng không */}
                        <div className="flex items-center gap-6 lg:w-1/4 w-full">
                          {offer.carrierLogoUrl ? (
                            <img
                              src={offer.carrierLogoUrl}
                              alt={offer.carrierName}
                              className="w-12 h-12 object-contain rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary flex items-center justify-center text-on-primary rounded font-bold">
                              {offer.carrierCode}
                            </div>
                          )}
                          <div>
                            <h3 className="font-label-md text-label-md uppercase tracking-wider text-primary">
                              {offer.carrierName}
                            </h3>
                            <p className="text-caption text-on-surface-variant font-medium">Hạng Thượng gia</p>
                          </div>
                        </div>

                        {/* Điểm xuất phát - Điểm đến - Thời gian bay */}
                        <div className="flex-1 flex items-center justify-between gap-6 md:gap-12 w-full lg:px-12 py-4 lg:py-0 border-y lg:border-y-0 lg:border-x border-outline-variant/20">
                          {/* Điểm đi */}
                          <div className="text-center md:text-left">
                            <div className="font-headline-md text-headline-md text-primary">
                              {formatTime(offer.departingAt)}
                            </div>
                            <div className="text-caption font-bold text-secondary uppercase tracking-widest mt-1">
                              {offer.originCode}
                            </div>
                          </div>

                          {/* Trục bay đồ họa */}
                          <div className="flex flex-col items-center flex-1 max-w-[240px] relative">
                            <div className="text-[10px] uppercase tracking-tighter text-on-surface-variant mb-1.5 font-semibold">
                              {formatDuration(offer.duration)} • Trực tiếp
                            </div>
                            <div className="w-full h-px bg-outline/25 relative">
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-outline"></div>
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-outline"></div>
                              <Plane className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary h-4 w-4 bg-surface px-1.5 box-content rotate-90" />
                            </div>
                            <div className="text-[10px] mt-1.5 text-on-surface-variant select-none">
                              {offer.aircraftName || 'Airbus A350-900'}
                            </div>
                          </div>

                          {/* Điểm đến */}
                          <div className="text-center md:text-right">
                            <div className="font-headline-md text-headline-md text-primary">
                              {formatTime(offer.arrivingAt)}
                            </div>
                            <div className="text-caption font-bold text-secondary uppercase tracking-widest mt-1">
                              {offer.destinationCode}
                            </div>
                          </div>
                        </div>

                        {/* Giá vé & Nút chọn */}
                        <div className="lg:w-1/4 w-full flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4">
                          <div className="text-left lg:text-right">
                            <div className="font-headline-md text-headline-lg text-primary">
                              ${offer.totalAmount.toFixed(2)} <span className="text-caption font-normal text-on-surface-variant">USD /khách</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedOffer(isSelected ? null : offer)}
                            className={`px-8 py-3 border font-label-md text-label-md uppercase tracking-wider rounded-[4px] transition-all select-none ${isSelected
                              ? 'bg-primary text-on-primary border-primary'
                              : 'border-primary text-primary hover:bg-primary hover:text-on-primary'
                              }`}
                          >
                            {isSelected ? 'ĐÃ CHỌN' : 'CHỌN CHUYẾN BAY'}
                          </button>
                        </div>
                      </div>

                      {/* Phân mục tiện ích đặc trưng của chặng bay */}
                      <div className="bg-surface-container-low px-8 py-3 border-t border-outline/5 flex flex-wrap gap-8">
                        <span className="flex items-center gap-1.5 text-caption text-on-surface-variant">
                          <Utensils className="h-3.5 w-3.5 text-secondary" /> Fine Dining (Ẩm thực Việt)
                        </span>
                        <span className="flex items-center gap-1.5 text-caption text-on-surface-variant">
                          <BedDouble className="h-3.5 w-3.5 text-secondary" /> Lie-flat Seat (Giường phẳng)
                        </span>
                        <span className="flex items-center gap-1.5 text-caption text-on-surface-variant">
                          <Wifi className="h-3.5 w-3.5 text-secondary" /> SkyConnect WiFi
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Booking Bar (Thanh chọn vé cố định ở chân trang) */}
      {selectedOffer && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-primary text-on-primary px-8 py-4 rounded-full shadow-2xl z-40 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10 backdrop-blur-md animate-slide-up">
          <div className="flex items-center gap-6 divide-x divide-white/20 w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-tighter opacity-60">Chặng Bay Đã Chọn</span>
              <span className="font-label-md text-label-md text-secondary-fixed flex items-center gap-1.5">
                {origin} <ArrowRight className="h-3.5 w-3.5" /> {destination}
              </span>
            </div>
            <div className="flex flex-col pl-6">
              <span className="text-[10px] uppercase tracking-tighter opacity-60">Tổng chi phí</span>
              <span className="font-label-md text-label-md text-white">
                ${selectedOffer.totalAmount.toFixed(2)} USD
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/flights/checkout', { state: { offer: selectedOffer } })}
            className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded-full font-label-md text-label-md hover:scale-105 transition-transform w-full sm:w-auto uppercase tracking-wider text-center select-none"
          >
            ĐẶT VÉ &amp; THANH TOÁN
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchFlights;
