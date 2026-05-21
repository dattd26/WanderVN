import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FlightSearchForm } from '../../components/client/FlightSearchForm';
import { flightService } from '../../services';
import type { FlightOfferDto, PassengerDto } from '../../types';
import {
  Plane,
  Utensils,
  BedDouble,
  Wifi,
  Loader2,
  CheckCircle,
  ArrowRight,
  Calendar,
  User,
  Mail,
  Phone,
  FileText
} from 'lucide-react';

export const SearchFlights: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Lấy dữ liệu trực tiếp từ searchParams trên URL để tránh đồng bộ state trùng lặp không cần thiết
  const origin = searchParams.get('origin') || 'HAN';
  const destination = searchParams.get('destination') || 'SGN';
  const departureDate = (() => {
    if (searchParams.get('departureDate')) return searchParams.get('departureDate')!;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return futureDate.toISOString().split('T')[0];
  })();

  const [offers, setOffers] = useState<FlightOfferDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái vé máy bay đang được chọn
  const [selectedOffer, setSelectedOffer] = useState<FlightOfferDto | null>(null);

  // Trạng thái modal thông tin hành khách
  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    bookingCode: string;
    bookingId: number;
    totalPrice: number;
    status: string;
  } | null>(null);

  // Form thông tin hành khách
  const [passengerForm, setPassengerForm] = useState<Omit<PassengerDto, 'id'>>({
    title: 'mr',
    familyName: 'Nguyen',
    givenName: 'Van A',
    bornOn: '1995-05-20',
    email: 'nguyenvana@example.com',
    phoneNumber: '+84901234567',
    gender: 'm',
    passportNumber: 'B1234567'
  });

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

  // Xử lý gửi đặt vé máy bay lên Backend C#
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;

    setBookingLoading(true);
    try {
      // Sử dụng ID đặt vé của hãng Duffel Airways (ZZ) để đảm bảo sandbox thành công 100%
      const finalOfferId = selectedOffer.duffelAirwaysOfferId || selectedOffer.id;
      const finalPassengerId = selectedOffer.duffelAirwaysPassengerId || selectedOffer.passengerId || 'pas_default';

      const bookingRequest = {
        userId: 1, // Mock User ID đã đăng nhập
        offerId: finalOfferId,
        totalPrice: selectedOffer.totalAmount,
        passengers: [
          {
            id: finalPassengerId,
            ...passengerForm
          }
        ]
      };

      const result = await flightService.createBooking(bookingRequest);
      setBookingSuccessData(result);
      setIsPassengerModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      alert(`⚠️ Lỗi đặt vé máy bay: ${message}`);
    } finally {
      setBookingLoading(false);
    }
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
            Heritage in the Skies
          </h1>
          <p className="font-headline-md text-body-lg max-w-2xl mx-auto opacity-95 italic select-none">
            Kết nối di sản ngàn năm với các chuyến bay thượng lưu bậc nhất Việt Nam.
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
        {/* Kết quả đặt vé thành công */}
        {bookingSuccessData ? (
          <div className="bg-surface border border-outline-variant/30 p-12 rounded-lg text-center max-w-2xl mx-auto limestone-shadow animate-fade-in">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-secondary" />
            </div>
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest block mb-2">
              Giao dịch thành công
            </span>
            <h2 className="font-display-lg text-headline-lg text-primary mb-6">
              Chúc mừng chuyến hành trình di sản!
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">
              Yêu cầu đặt vé máy bay chặng <span className="font-bold">{origin} → {destination}</span> đã được xử lý và lưu trữ thành công trên hệ thống Duffel Sandbox & WanderVN SQL Server.
            </p>

            <div className="bg-surface-container-low p-6 rounded border border-outline-variant/20 text-left space-y-4 mb-8">
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Mã đặt vé (Order ID):</span>
                <span className="font-mono font-bold text-primary">{bookingSuccessData.bookingCode}</span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Tổng chi phí:</span>
                <span className="font-bold text-secondary-fixed-dim bg-primary text-on-primary px-3 py-1 text-sm rounded">
                  ${bookingSuccessData.totalPrice.toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Trạng thái đặt vé:</span>
                <span className="font-bold text-emerald-600 font-label-md uppercase tracking-wider text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {bookingSuccessData.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Hành khách:</span>
                <span className="font-semibold text-primary">{passengerForm.familyName} {passengerForm.givenName}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setBookingSuccessData(null);
                  setSelectedOffer(null);
                }}
                className="font-label-md text-label-md uppercase tracking-widest px-8 py-3.5 border border-primary text-primary hover:bg-primary hover:text-on-primary transition-all rounded-[4px]"
              >
                Đặt thêm vé mới
              </button>
              <button
                onClick={() => window.location.href = '/stays'}
                className="font-label-md text-label-md uppercase tracking-widest px-8 py-3.5 bg-secondary text-on-primary hover:bg-on-secondary-container transition-all rounded-[4px]"
              >
                Tìm kiếm khách sạn
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header thông tin tìm kiếm */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <span className="font-label-md text-label-md text-secondary uppercase tracking-widest block mb-2">
                  Chuyến Bay Di Sản Trong Ngày
                </span>
                <h2 className="font-display-lg text-headline-lg text-primary select-none">
                  Chặng bay {origin} <span className="font-mono text-outline-variant mx-2">→</span> {destination}
                </h2>
                <p className="text-on-surface-variant italic font-body-md mt-1">
                  Khởi hành: {departureDate} • Các chuyến bay trực tiếp tinh tế
                </p>
              </div>
            </div>

            {/* Trạng thái Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-12 w-12 text-secondary animate-spin" />
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest animate-pulse">
                  Đang tìm chuyến bay từ Duffel API...
                </span>
              </div>
            )}

            {/* Trạng thái Lỗi */}
            {error && !loading && (
              <div className="bg-surface-container-low border border-outline-variant/30 p-8 text-center rounded-lg max-w-xl mx-auto">
                <p className="text-body-md text-on-surface font-medium mb-2">{error}</p>
                <p className="text-caption text-on-surface-variant">Vui lòng thử chọn chặng bay khác hoặc thay đổi ngày khởi hành xa hơn để tìm kiếm.</p>
              </div>
            )}

            {/* Danh sách thẻ chuyến bay */}
            {!loading && !error && offers.length > 0 && (
              <div className="space-y-6">
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
      {selectedOffer && !bookingSuccessData && (
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
            onClick={() => setIsPassengerModalOpen(true)}
            className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded-full font-label-md text-label-md hover:scale-105 transition-transform w-full sm:w-auto uppercase tracking-wider text-center select-none"
          >
            ĐẶT VÉ &amp; THANH TOÁN
          </button>
        </div>
      )}

      {/* Passenger Details Modal (Form nhập thông tin hành khách sang trọng) */}
      {isPassengerModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface border border-outline-variant/30 rounded-lg max-w-2xl w-full p-8 shadow-2xl limestone-shadow max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-6">
              <div>
                <h3 className="font-display-lg text-headline-md text-primary">Thông Tin Hành Khách</h3>
                <p className="text-caption text-on-surface-variant italic mt-0.5">Vui lòng nhập thông tin chính xác theo Hộ chiếu hoặc CCCD.</p>
              </div>
              <button
                onClick={() => setIsPassengerModalOpen(false)}
                className="text-on-surface-variant hover:text-primary font-bold text-lg select-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Danh xưng */}
                <div>
                  <label className="font-label-md text-caption uppercase tracking-wider text-on-surface-variant block mb-2">Danh xưng</label>
                  <select
                    value={passengerForm.title}
                    onChange={(e) => setPassengerForm({ ...passengerForm, title: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded px-4 py-2.5 font-body-md focus:ring-secondary focus:border-secondary cursor-pointer"
                  >
                    <option value="mr">Ông (Mr)</option>
                    <option value="ms">Bà (Ms)</option>
                    <option value="mrs">Cô/Chị (Mrs)</option>
                  </select>
                </div>

                {/* Họ */}
                <div className="sm:col-span-2">
                  <label className="font-label-md text-caption uppercase tracking-wider text-on-surface-variant block mb-2">Họ (Family Name)</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 text-outline h-4.5 w-4.5" />
                    <input
                      type="text"
                      required
                      value={passengerForm.familyName}
                      onChange={(e) => setPassengerForm({ ...passengerForm, familyName: e.target.value })}
                      placeholder="e.g. NGUYEN"
                      className="w-full bg-surface border border-outline-variant/30 rounded pl-10 pr-4 py-2.5 font-body-md focus:ring-secondary focus:border-secondary uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Tên đệm & Tên gọi */}
              <div>
                <label className="font-label-md text-caption uppercase tracking-wider text-on-surface-variant block mb-2">Tên đệm &amp; Tên gọi (Given Name)</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 text-outline h-4.5 w-4.5" />
                  <input
                    type="text"
                    required
                    value={passengerForm.givenName}
                    onChange={(e) => setPassengerForm({ ...passengerForm, givenName: e.target.value })}
                    placeholder="e.g. VAN A"
                    className="w-full bg-surface border border-outline-variant/30 rounded pl-10 pr-4 py-2.5 font-body-md focus:ring-secondary focus:border-secondary uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Ngày sinh */}
                <div>
                  <label className="font-label-md text-caption uppercase tracking-wider text-on-surface-variant block mb-2">Ngày sinh</label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 text-outline h-4.5 w-4.5 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={passengerForm.bornOn}
                      onChange={(e) => setPassengerForm({ ...passengerForm, bornOn: e.target.value })}
                      className="w-full bg-surface border border-outline-variant/30 rounded pl-10 pr-4 py-2.5 font-body-md focus:ring-secondary focus:border-secondary"
                    />
                  </div>
                </div>

                {/* Giới tính */}
                <div>
                  <label className="font-label-md text-caption uppercase tracking-wider text-on-surface-variant block mb-2">Giới tính</label>
                  <select
                    value={passengerForm.gender}
                    onChange={(e) => setPassengerForm({ ...passengerForm, gender: e.target.value })}
                    className="w-full bg-surface border border-outline-variant/30 rounded px-4 py-2.5 font-body-md focus:ring-secondary focus:border-secondary cursor-pointer"
                  >
                    <option value="m">Nam (Male)</option>
                    <option value="f">Nữ (Female)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="font-label-md text-caption uppercase tracking-wider text-on-surface-variant block mb-2">Địa chỉ Email</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 text-outline h-4.5 w-4.5" />
                    <input
                      type="email"
                      required
                      value={passengerForm.email}
                      onChange={(e) => setPassengerForm({ ...passengerForm, email: e.target.value })}
                      placeholder="nguyenvana@example.com"
                      className="w-full bg-surface border border-outline-variant/30 rounded pl-10 pr-4 py-2.5 font-body-md focus:ring-secondary focus:border-secondary"
                    />
                  </div>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="font-label-md text-caption uppercase tracking-wider text-on-surface-variant block mb-2">Số điện thoại</label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3 text-outline h-4.5 w-4.5" />
                    <input
                      type="tel"
                      required
                      value={passengerForm.phoneNumber}
                      onChange={(e) => setPassengerForm({ ...passengerForm, phoneNumber: e.target.value })}
                      placeholder="+84901234567"
                      className="w-full bg-surface border border-outline-variant/30 rounded pl-10 pr-4 py-2.5 font-body-md focus:ring-secondary focus:border-secondary"
                    />
                  </div>
                </div>
              </div>

              {/* Số hộ chiếu / CCCD */}
              <div>
                <label className="font-label-md text-caption uppercase tracking-wider text-on-surface-variant block mb-2">Số Hộ chiếu (Passport) / CCCD</label>
                <div className="relative flex items-center">
                  <FileText className="absolute left-3 text-outline h-4.5 w-4.5" />
                  <input
                    type="text"
                    required
                    value={passengerForm.passportNumber}
                    onChange={(e) => setPassengerForm({ ...passengerForm, passportNumber: e.target.value })}
                    placeholder="e.g. B1234567"
                    className="w-full bg-surface border border-outline-variant/30 rounded pl-10 pr-4 py-2.5 font-body-md focus:ring-secondary focus:border-secondary uppercase"
                  />
                </div>
              </div>

              {/* Nút gửi */}
              <div className="pt-4 flex gap-4 justify-end border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsPassengerModalOpen(false)}
                  disabled={bookingLoading}
                  className="px-6 py-2.5 border border-outline/30 text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md uppercase tracking-wider rounded-[4px] select-none"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-8 py-2.5 bg-secondary text-on-primary hover:bg-on-secondary-container transition-all font-label-md text-label-md uppercase tracking-wider flex items-center justify-center gap-2 rounded-[4px] select-none"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      ĐANG XỬ LÝ...
                    </>
                  ) : (
                    'XÁC NHẬN ĐẶT VÉ'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFlights;
