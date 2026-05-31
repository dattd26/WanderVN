import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom';
import { FlightSearchForm } from '../../components/client/FlightSearchForm';
import { FlightDetailModal } from '../../components/client/flight/FlightDetailModal';
import { FlightPagination } from '../../components/client/flight/FlightPagination';
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

  const origin = searchParams.get('origin') || 'HAN';
  const destination = searchParams.get('destination') || 'SGN';
  const departureDate = (() => {
    if (searchParams.get('departureDate')) return searchParams.get('departureDate')!;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return futureDate.toISOString().split('T')[0];
  })();
  const tripType = (searchParams.get('tripType') as 'round-trip' | 'one-way') || 'one-way';
  const cabinClass = (searchParams.get('cabinClass') as 'business' | 'economy') || 'business';
  const returnDate = searchParams.get('returnDate') || '';

  const hasSearched = !!(searchParams.get('origin') && searchParams.get('destination') && searchParams.get('departureDate'));

  const [offers, setOffers] = useState<FlightOfferDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const resultsRef = useRef<HTMLDivElement>(null);

  // Trạng thái vé máy bay đang được chọn (booking bar cũ)
  const [selectedOffer, setSelectedOffer] = useState<FlightOfferDto | null>(null);
  const { offerId } = useParams<{ offerId?: string }>();
  const location = useLocation();

  // Trạng thái modal chi tiết chuyến bay
  // const [modalOffer, setModalOffer] = useState<FlightOfferDto | null>(null);

  // const modalOffer = useMemo(() => {
  //   if (!offerId || offers.length === 0) return null;
  //   return offers.find((offer) => offer.id === offerId) ?? null;
  // }, [offerId, offers]);
  // Mở modal chi tiết
  const modalOffer = useMemo(() => {
    if (!offerId || offers.length === 0) return null;
    return offers.find((offer) => offer.id === offerId) ?? null;
  }, [offerId, offers]);
  const openModal = (offer: FlightOfferDto) => {
    console.log('[SearchFlights] Opening detail modal for offerId:', offer.id);
    navigate(`/flights/${offer.id}${location.search}`);
  };

  // Đóng modal
  const closeModal = () => {
    if (offerId) {
      navigate(`/flights${location.search}`, { replace: true });
    }
  };

  // Điều hướng sang checkout — reuse flow hiện có, truyền offer qua location.state
  const handleProceedToCheckout = (offer: FlightOfferDto) => {
    console.log('[SearchFlights] navigating to checkout with offer:', offer);
    navigate('/flights/checkout', { state: { offer } });
  };

  const executeSearch = async (o: string, d: string, date: string, cabin: string, retDate?: string) => {
    setLoading(true);
    setError(null);
    setSelectedOffer(null);
    try {
      const response = await flightService.searchFlights({
        origin: o,
        destination: d,
        departureDate: date,
        passengerType: 'adult',
        returnOffers: true,
        cabinClass: cabin,
        returnDate: retDate || undefined
      });

      setOffers(response);
      setCurrentPage(1);

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

  useEffect(() => {
    const o = searchParams.get('origin');
    const d = searchParams.get('destination');
    const dt = searchParams.get('departureDate');
    const cabin = searchParams.get('cabinClass') || 'business';
    const retDate = searchParams.get('returnDate') || undefined;

    if (o && d && dt) {
      const timer = setTimeout(() => {
        executeSearch(o, d, dt, cabin, retDate);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);


  const handleSearchSubmit = (
    newOrigin: string,
    newDest: string,
    newDate: string,
    newTripType: 'round-trip' | 'one-way',
    newCabinClass: 'business' | 'economy',
    newReturnDate?: string
  ) => {
    const params: Record<string, string> = {
      origin: newOrigin,
      destination: newDest,
      departureDate: newDate,
      tripType: newTripType,
      cabinClass: newCabinClass,
      _t: Date.now().toString(), // Thêm timestamp để kích hoạt tìm kiếm lại khi click cùng bộ lọc
    };
    if (newTripType === 'round-trip' && newReturnDate) {
      params.returnDate = newReturnDate;
    }
    setSearchParams(params);
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

  const totalPages = Math.ceil(offers.length / itemsPerPage);
  const currentFlights = offers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[70dvh] flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#111]">
          <img
            alt=""
            className="w-full h-full object-cover opacity-90 scale-105 brightness-[85%] saturate-[1.1] transition-all duration-700"
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#fdf9f4]"></div>
          {/* Lớp hạt nhiễu mờ tạo cảm giác ảnh tạp chí in */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
        </div>
        <div className="relative z-10 text-center text-on-primary px-margin-mobile -translate-y-12">
          <h1 className="font-display-lg text-display-lg-mobile md:text-[5.5rem] leading-[1.1] mb-6 drop-shadow-2xl select-none tracking-tight">
            Tìm Chuyến Bay <br className="hidden md:block" /> Của Bạn
          </h1>
          <p className="font-headline-md text-body-lg max-w-2xl mx-auto opacity-90 italic select-none tracking-wide text-white/90">
            Kết nối di sản ngàn năm với các chuyến bay thoải mái bậc nhất Việt Nam.
          </p>
        </div>
        {/* Floating Search Widget */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-container-max px-margin-desktop hidden md:block z-20">
          <FlightSearchForm
            initialOrigin={origin}
            initialDestination={destination}
            initialDepartureDate={departureDate}
            initialReturnDate={returnDate}
            initialTripType={tripType}
            initialCabinClass={cabinClass}
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
          <div className="flex flex-col items-center mt-12 mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-16 max-w-2xl">
              <div className="w-20 h-20 rounded-full bg-surface-container-low border border-outline/10 flex items-center justify-center text-secondary mb-6 mx-auto shadow-sm">
                <Plane className="h-8 w-8 rotate-[45deg]" />
              </div>
              <h3 className="font-display-md text-headline-lg text-primary font-bold tracking-tight mb-4">
                Khám Phá Các Chặng Bay Thượng Lưu
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                WanderVN kết nối các chuyến bay đẳng cấp tới mọi miền di sản của Việt Nam.
                Hãy điền thông tin chặng bay và ngày khởi hành ở thanh tìm kiếm phía trên để chúng tôi tìm kiếm các ưu đãi chuyến bay tốt nhất dành cho hành trình tinh hoa của bạn.
              </p>
            </div>

            <div className="w-full">
              <span className="font-label-md text-[11px] text-secondary uppercase tracking-[0.2em] block mb-8 text-center font-semibold">
                Gợi ý chặng bay phổ biến
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    onClick={() => handleSearchSubmit(route.from, route.to, departureDate, 'one-way', 'business')}
                    className="group flex flex-col items-start p-8 text-left bg-surface hover:bg-surface-container-lowest transition-all duration-300 limestone-shadow hover:shadow-[0_20px_40px_rgba(28,28,25,0.06)] rounded-xl border border-transparent hover:border-outline/10 hover:-translate-y-1"
                  >
                    <span className="font-display-md text-headline-sm text-primary mb-2 group-hover:text-secondary transition-colors">{route.title}</span>
                    <span className="text-body-sm text-on-surface-variant leading-relaxed">{route.desc}</span>
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
              <div className="space-y-8" ref={resultsRef}>
                <div className="flex justify-between items-center pb-6 border-b border-outline/10 mb-8">
                  <div>
                    <h2 className="font-display-md text-headline-lg text-primary tracking-tight">Các Chuyến Bay Khả Dụng</h2>
                    <p className="text-body-md text-on-surface-variant italic mt-2">
                      Tìm thấy {offers.length} chuyến bay cao cấp từ {origin} đi {destination}
                    </p>
                  </div>
                </div>

                {currentFlights.map((offer) => {
                  const isSelected = selectedOffer?.id === offer.id;

                  return (
                    <div
                      key={offer.id}
                      className={`group relative bg-surface transition-all duration-500 overflow-hidden rounded-xl limestone-shadow ${isSelected
                        ? 'ring-2 ring-secondary bg-surface-container-lowest shadow-[0_20px_40px_rgba(212,175,55,0.15)]'
                        : 'hover:shadow-[0_20px_40px_rgba(28,28,25,0.08)] hover:-translate-y-1'
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-secondary text-on-primary text-[10px] uppercase tracking-widest px-4 py-1.5 font-bold rounded-bl-lg z-10">
                          Đã chọn
                        </div>
                      )}
                      <div className="p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                        {/* Thông tin Hãng hàng không */}
                        <div className="flex items-center gap-6 lg:w-1/4 w-full">
                          {offer.carrierLogoUrl ? (
                            <img
                              src={offer.carrierLogoUrl}
                              alt={offer.carrierName}
                              className="w-14 h-14 object-contain rounded-md"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-primary flex items-center justify-center text-on-primary rounded-md font-bold text-lg shadow-inner">
                              {offer.carrierCode}
                            </div>
                          )}
                          <div>
                            <h3 className="font-label-md text-label-md uppercase tracking-[0.1em] text-primary">
                              {offer.carrierName}
                            </h3>
                            <p className="text-caption text-on-surface-variant font-medium mt-1">
                              {cabinClass === 'economy' ? 'Hạng Phổ thông' : 'Hạng Thương gia'}
                            </p>
                          </div>
                        </div>

                        {/* Điểm xuất phát - Điểm đến - Thời gian bay */}
                        <div className="flex-1 flex items-center justify-between gap-6 md:gap-12 w-full lg:px-8 py-6 lg:py-0 border-y lg:border-y-0 lg:border-x border-outline/10">
                          {/* Điểm đi */}
                          <div className="text-center md:text-left">
                            <div className="font-display-md text-display-sm text-primary tracking-tight">
                              {formatTime(offer.departingAt)}
                            </div>
                            <div className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] mt-2">
                              {offer.originCode}
                            </div>
                          </div>

                          {/* Trục bay đồ họa */}
                          <div className="flex flex-col items-center flex-1 max-w-[280px] relative px-4">
                            <div className="text-[11px] uppercase tracking-widest text-on-surface-variant mb-3 font-semibold">
                              {formatDuration(offer.duration)}
                            </div>
                            <div className="w-full h-px bg-outline/20 relative">
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-outline bg-surface"></div>
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-outline bg-surface"></div>
                              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-2">
                                <Plane className="text-primary h-5 w-5 rotate-90 opacity-80" />
                              </div>
                            </div>
                            <div className="text-caption mt-3 text-on-surface-variant select-none">
                              {offer.aircraftName || 'Airbus A350-900'}
                            </div>
                          </div>

                          {/* Điểm đến */}
                          <div className="text-center md:text-right">
                            <div className="font-display-md text-display-sm text-primary tracking-tight">
                              {formatTime(offer.arrivingAt)}
                            </div>
                            <div className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] mt-2">
                              {offer.destinationCode}
                            </div>
                          </div>
                        </div>

                        {/* Giá vé & Nút chọn */}
                        <div className="lg:w-1/4 w-full flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-6">
                          <div className="text-left lg:text-right">
                            <div className="font-display-md text-headline-lg text-primary">
                              ${offer.totalAmount.toFixed(2)}
                            </div>
                            <div className="text-[11px] uppercase tracking-wider font-medium text-on-surface-variant mt-1">
                              USD / Khách
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 w-full sm:w-auto">
                            {/* Nút mở modal chi tiết */}
                            <button
                              id={`btn-detail-${offer.id}`}
                              onClick={() => openModal(offer)}
                              className="w-full px-6 py-2.5 border-b-2 border-transparent text-on-surface-variant hover:text-primary font-label-md text-caption uppercase tracking-[0.15em] transition-all select-none hover:border-primary/30"
                            >
                              Xem chi tiết
                            </button>
                            {/* Nút chọn nhanh */}
                            <button
                              id={`btn-select-${offer.id}`}
                              onClick={() => setSelectedOffer(isSelected ? null : offer)}
                              className={`w-full px-8 py-3.5 font-label-md text-label-md uppercase tracking-[0.15em] rounded-md transition-all duration-300 active:scale-[0.98] select-none ${isSelected
                                ? 'bg-primary text-on-primary shadow-lg'
                                : 'bg-surface border border-primary/20 text-primary hover:bg-primary hover:text-on-primary hover:shadow-lg'
                                }`}
                            >
                              {isSelected ? 'Đã Chọn' : 'Chọn Chuyến'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Phân mục tiện ích đặc trưng của chặng bay */}
                      <div className="bg-surface-container-lowest px-8 lg:px-10 py-4 border-t border-outline/5 flex flex-wrap gap-x-8 gap-y-3">
                        <span className="flex items-center gap-2 text-caption text-on-surface-variant">
                          <Utensils className="h-4 w-4 text-secondary/80" /> <span className="tracking-wide">Fine Dining</span>
                        </span>
                        <span className="flex items-center gap-2 text-caption text-on-surface-variant">
                          <BedDouble className="h-4 w-4 text-secondary/80" /> <span className="tracking-wide">Lie-flat Seat</span>
                        </span>
                        <span className="flex items-center gap-2 text-caption text-on-surface-variant">
                          <Wifi className="h-4 w-4 text-secondary/80" /> <span className="tracking-wide">SkyConnect WiFi</span>
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-8">
                  <FlightPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Booking Bar (Thanh chọn vé cố định ở chân trang) */}
      {selectedOffer && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-primary/95 text-on-primary px-8 py-5 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] z-40 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/15 backdrop-blur-xl animate-slide-up">
          <div className="flex items-center gap-8 divide-x divide-white/20 w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-70 mb-1">Chặng Bay Đã Chọn</span>
              <span className="font-label-md text-label-lg text-secondary-fixed flex items-center gap-3">
                <span className="text-white">{origin}</span>
                <ArrowRight className="h-4 w-4 opacity-50" />
                <span className="text-white">{destination}</span>
              </span>
            </div>
            <div className="flex flex-col pl-8">
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-70 mb-1">Tổng chi phí</span>
              <span className="font-display-md text-headline-sm text-secondary">
                ${selectedOffer.totalAmount.toFixed(2)} <span className="text-sm font-sans tracking-widest text-white/70">USD</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/flights/checkout', { state: { offer: selectedOffer } })}
            className="bg-secondary text-primary px-10 py-4 rounded-xl font-label-md text-label-md hover:bg-secondary-fixed transition-all duration-300 w-full sm:w-auto uppercase tracking-[0.15em] text-center select-none shadow-[0_10px_20px_rgba(212,175,55,0.2)] active:scale-95"
          >
            Đặt vé & Thanh toán
          </button>
        </div>
      )}
      {/* Modal chi tiết chuyến bay */}
      <FlightDetailModal
        offer={modalOffer}
        onClose={closeModal}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </div>
  );
};

export default SearchFlights;
