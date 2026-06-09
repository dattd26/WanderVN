import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { flightService, paymentService } from '../../services';
import type { FlightOfferDto, PassengerDto } from '../../types';
import {
  Plane,
  ArrowRight,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Users,
  Luggage,
  Clock,
  Info,
} from 'lucide-react';
import { PaymentSelector, type PaymentMethod } from '../../components/client/checkout/PaymentSelector';
import { CheckoutTimer } from '../../components/client/checkout/CheckoutTimer';

const SEAT_PREFERENCES = ['Tiêu chuẩn (Hãng quyết định)', 'Cửa sổ (Window)', 'Lối đi (Aisle)'];
const MEAL_PREFERENCES = ['Mặc định', 'Chay (Vegetarian)', 'Đạo Hồi (Halal)', 'Thuần chay (Vegan)'];

const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDateShort = (timeStr: string): string => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDuration = (durationStr: string): string => {
  if (!durationStr) return '';
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return durationStr;
  const h = match[1] ? `${match[1]}h` : '';
  const m = match[2] ? `${match[2]}m` : '';
  return `${h} ${m}`.trim();
};

export const FlightCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const WANDER_SELECTED_OFFER = 'wander_selected_offer';
  const storedUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');
  const currentUserId = storedUserId ? parseInt(storedUserId, 10) : null;

  const storedUserStr = localStorage.getItem('user');
  const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {};

  const [offer] = useState<FlightOfferDto | null>(() => {
    const stateOffer = location.state?.offer as FlightOfferDto | undefined;
    if (stateOffer) {
      sessionStorage.setItem(WANDER_SELECTED_OFFER, JSON.stringify(stateOffer));
      return stateOffer;
    }
    const cachedOffer = sessionStorage.getItem(WANDER_SELECTED_OFFER);
    if (cachedOffer) {
      try {
        return JSON.parse(cachedOffer) as FlightOfferDto;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vnpay');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Thông tin người liên hệ nhận vé
  const [contactForm, setContactForm] = useState({
    email: storedUser.email || localStorage.getItem('email') || '',
    phone: storedUser.phone || storedUser.phoneNumber || localStorage.getItem('phone') || '',
  });

  // Thông tin hành khách (Form cho mỗi hành khách — hiện tại 1 khách)
  const [passengerForm, setPassengerForm] = useState<Omit<PassengerDto, 'id'>>({
    title: 'mr',
    familyName: '',
    givenName: '',
    bornOn: '',
    email: storedUser.email || localStorage.getItem('email') || '',
    phoneNumber: storedUser.phone || localStorage.getItem('phone') || '',
    gender: 'm',
    passportNumber: '',
  });

  const [seatPreference, setSeatPreference] = useState(SEAT_PREFERENCES[0]);
  const [mealPreference, setMealPreference] = useState(MEAL_PREFERENCES[0]);

  const handleTimerExpire = useCallback(() => {
    setIsExpired(true);
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer || isExpired) return;

    setBookingLoading(true);
    setErrorMessage(null);

    try {
      const finalOfferId = offer.duffelAirwaysOfferId || offer.id;
      const finalPassengerId = offer.duffelAirwaysPassengerId || offer.passengerId || 'pas_default';

      const bookingRequest = {
        userId: currentUserId,
        offerId: finalOfferId,
        totalPrice: offer.totalAmount,
        passengers: [
          {
            id: finalPassengerId,
            ...passengerForm,
            email: contactForm.email,
            phoneNumber: contactForm.phone,
          },
        ],
      };

      const result = await flightService.createBooking(bookingRequest);
      sessionStorage.removeItem(WANDER_SELECTED_OFFER);

      if (paymentMethod === 'vnpay') {
        const paymentUrl = await paymentService.createVNPayUrl({ bookingId: result.bookingId });
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
      }

      if (paymentMethod === 'zalopay') {
        const paymentUrl = await paymentService.createZaloPayUrl({ bookingId: result.bookingId });
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
      }

      alert(`Đặt vé thành công! Mã đặt vé: ${result.bookingCode}`);
      navigate('/flights');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi đặt vé.';
      setErrorMessage(message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (!offer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center space-y-6 bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-8 shadow-xl limestone-shadow">
          <AlertTriangle className="h-12 w-12 text-secondary mx-auto" />
          <h2 className="font-display-lg text-headline-md text-primary">Không Tìm Thấy Chuyến Bay</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Phiên giao dịch đã hết hạn hoặc chưa có chuyến bay nào được chọn để thanh toán.
          </p>
          <Link
            to="/flights"
            className="w-full bg-primary text-on-primary py-3.5 text-xs uppercase tracking-widest hover:bg-primary/95 transition-all flex items-center justify-center gap-2 rounded-lg font-semibold"
          >
            Quay Lại Tìm Kiếm
          </Link>
        </div>
      </div>
    );
  }

  const duffelAmountVnd = offer.totalAmount * 26500;
  const markupVnd = Math.round(duffelAmountVnd * 0.05);
  const taxVnd = Math.round(duffelAmountVnd * 0.10);
  const totalVnd = duffelAmountVnd + markupVnd + taxVnd;

  return (
    <div className="min-h-screen bg-background pb-24 pt-28 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">

        {/* Back link */}
        <Link
          to="/flights"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-primary mb-8 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Quay lại tìm kiếm chuyến bay
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
            Xác nhận đặt vé
          </span>
          <h1 className="font-display-lg text-4xl md:text-5xl text-primary mt-1 leading-tight">
            Hoàn tất hành trình
          </h1>
        </div>

        {/* Đồng hồ đếm ngược giữ giá vé */}
        <div className="mb-8">
          <CheckoutTimer
            durationMinutes={15}
            onExpire={handleTimerExpire}
            label="Giá vé được giữ trong"
          />
        </div>

        {/* Cảnh báo hết phiên */}
        {isExpired && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>
              Phiên giữ giá vé đã hết hạn. Vui lòng quay lại tìm kiếm để cập nhật giá mới nhất
              trước khi tiếp tục đặt vé.
            </span>
          </div>
        )}

        {/* Error banner */}
        {errorMessage && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleBookingSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
        >
          {/* === CỘT TRÁI === */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">

            {/* BƯỚC 1: Thông tin người liên hệ nhận vé */}
            <section className="border border-outline-variant/30 rounded-lg bg-surface-container-lowest overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center gap-4">
                <span className="text-sm font-semibold text-outline tabular-nums">01</span>
                <h2 className="text-base font-semibold text-primary tracking-tight">
                  Người Nhận Vé & Liên Hệ
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                    Email nhận e-ticket
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+84 901 234 567"
                    className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* BƯỚC 2: Thông tin hành khách */}
            <section className="border border-outline-variant/30 rounded-lg bg-surface-container-lowest overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center gap-4">
                <span className="text-sm font-semibold text-outline tabular-nums">02</span>
                <h2 className="text-base font-semibold text-primary tracking-tight">
                  Thông Tin Hành Khách
                </h2>
                <div className="ml-auto flex items-center gap-1.5 text-[10px] text-on-surface-variant">
                  <Users className="h-3 w-3" />
                  1 Người lớn
                </div>
              </div>

              {/* Thẻ hành khách */}
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-2 pb-4 border-b border-outline-variant/15">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">1</span>
                  </div>
                  <span className="text-sm font-semibold text-on-surface">Hành khách người lớn</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                      Danh xưng
                    </label>
                    <select
                      value={passengerForm.title}
                      onChange={(e) =>
                        setPassengerForm({ ...passengerForm, title: e.target.value })
                      }
                      className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors cursor-pointer"
                    >
                      <option value="mr">Ông (Mr.)</option>
                      <option value="ms">Bà (Ms.)</option>
                      <option value="mrs">Cô/Chị (Mrs.)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                      Giới tính
                    </label>
                    <select
                      value={passengerForm.gender}
                      onChange={(e) =>
                        setPassengerForm({ ...passengerForm, gender: e.target.value })
                      }
                      className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors cursor-pointer"
                    >
                      <option value="m">Nam (Male)</option>
                      <option value="f">Nữ (Female)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                      Họ (Family Name)
                    </label>
                    <input
                      type="text"
                      required
                      value={passengerForm.familyName}
                      onChange={(e) =>
                        setPassengerForm({
                          ...passengerForm,
                          familyName: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="VD: NGUYEN"
                      className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm uppercase font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                      Tên đệm & Tên (Given Name)
                    </label>
                    <input
                      type="text"
                      required
                      value={passengerForm.givenName}
                      onChange={(e) =>
                        setPassengerForm({
                          ...passengerForm,
                          givenName: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="VD: VAN A"
                      className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm uppercase font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      required
                      value={passengerForm.bornOn}
                      onChange={(e) =>
                        setPassengerForm({ ...passengerForm, bornOn: e.target.value })
                      }
                      className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                      Số Hộ Chiếu / CCCD
                    </label>
                    <input
                      type="text"
                      required
                      value={passengerForm.passportNumber}
                      onChange={(e) =>
                        setPassengerForm({
                          ...passengerForm,
                          passportNumber: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="VD: B1234567"
                      className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm uppercase font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Tùy chọn phụ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-outline-variant/15">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                      Ưu tiên chỗ ngồi
                    </label>
                    <select
                      value={seatPreference}
                      onChange={(e) => setSeatPreference(e.target.value)}
                      className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors cursor-pointer"
                    >
                      {SEAT_PREFERENCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                      Suất ăn trên máy bay
                    </label>
                    <select
                      value={mealPreference}
                      onChange={(e) => setMealPreference(e.target.value)}
                      className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors cursor-pointer"
                    >
                      {MEAL_PREFERENCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200/60 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Tên phải khớp chính xác với hộ chiếu hoặc CCCD (không dấu, viết hoa). Không thể
                    thay đổi sau khi đặt vé thành công.
                  </p>
                </div>
              </div>
            </section>

            {/* BƯỚC 3: Phương thức thanh toán */}
            <section className="border border-outline-variant/30 rounded-lg bg-surface-container-lowest overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center gap-4">
                <span className="text-sm font-semibold text-outline tabular-nums">03</span>
                <h2 className="text-base font-semibold text-primary tracking-tight">
                  Phương Thức Thanh Toán
                </h2>
              </div>
              <div className="p-6">
                <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
              </div>
            </section>
          </div>

          {/* === CỘT PHẢI: Tóm tắt chuyến bay (sticky) === */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-5">
            <div className="border border-outline-variant/30 bg-surface-container-lowest rounded-lg overflow-hidden limestone-shadow">

              {/* Header tuyến bay */}
              <div className="px-5 py-5 border-b border-outline-variant/15">
                <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/70 font-semibold mb-1.5">
                  Chuyến Bay Của Bạn
                </p>
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  {offer.originCode}
                  <ArrowRight className="h-4 w-4 text-outline" />
                  {offer.destinationCode}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {offer.originName || offer.originCode} đến {offer.destinationName || offer.destinationCode}
                </p>
              </div>

              {/* Chi tiết hãng bay & thời gian bay */}
              <div className="px-5 py-4 border-b border-outline-variant/15">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-semibold">
                      Hãng bay
                    </p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">
                      {offer.carrierName}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">Phổ Thông (Economy)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-semibold">
                      Thời gian bay
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="h-3 w-3 text-on-surface-variant" />
                      <p className="text-sm font-semibold text-on-surface">
                        {formatDuration(offer.duration)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline khởi hành / đến nơi */}
                <div className="bg-surface-container-low/40 rounded-lg p-4 border border-outline-variant/10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary tabular-nums">
                        {formatTime(offer.departingAt)}
                      </p>
                      <p className="text-xs font-semibold text-on-surface mt-0.5">{offer.originCode}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {formatDateShort(offer.departingAt)}
                      </p>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1 px-2">
                      <div className="w-full flex items-center gap-1">
                        <div className="h-px flex-1 bg-outline-variant/40" />
                        <Plane className="h-3.5 w-3.5 text-secondary" />
                        <div className="h-px flex-1 bg-outline-variant/40" />
                      </div>
                      <p className="text-[9px] text-on-surface-variant/70">Bay thẳng</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary tabular-nums">
                        {formatTime(offer.arrivingAt)}
                      </p>
                      <p className="text-xs font-semibold text-on-surface mt-0.5">{offer.destinationCode}</p>
                      <p className="text-[10px] text-on-surface-variant">
                        {formatDateShort(offer.arrivingAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hành lý bao gồm */}
              <div className="px-5 py-4 border-b border-outline-variant/15 space-y-2">
                <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-semibold">
                  Hành lý bao gồm
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span className="text-xs text-on-surface">Hành lý xách tay 7kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Luggage className="h-3.5 w-3.5 text-secondary shrink-0" />
                  <span className="text-xs text-on-surface">Hành lý ký gửi 30kg (đã bao gồm)</span>
                </div>
              </div>

              {/* Chính sách vé */}
              <div className="px-5 py-3 border-b border-outline-variant/15 bg-amber-50/40">
                <div className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    Vé không hoàn, hỗ trợ đổi trả theo chính sách hãng bay. Phụ phí đổi vé áp dụng
                    sau khi xuất vé.
                  </p>
                </div>
              </div>

              {/* Chiết tính giá */}
              <div className="px-5 py-4 space-y-2.5 border-b border-outline-variant/15">
                <PriceRow
                  label={`Giá vé gốc (1 người lớn)`}
                  value={`$${offer.totalAmount.toFixed(2)} USD`}
                />
                <PriceRow
                  label="Thuế & Phí sân bay (10%)"
                  value={`${taxVnd.toLocaleString('vi-VN')} VND`}
                />
                <PriceRow
                  label="Phí dịch vụ WanderVN (5%)"
                  value={`${markupVnd.toLocaleString('vi-VN')} VND`}
                />
              </div>

              {/* Tổng tiền */}
              <div className="px-5 py-4 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-on-surface">Tổng thanh toán</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-600 tabular-nums">
                      {totalVnd.toLocaleString('vi-VN')}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">VND</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || isExpired}
                  className="w-full py-4 bg-primary text-on-primary font-semibold text-xs uppercase tracking-widest rounded-lg shadow-md hover:bg-primary/95 active:scale-[0.99] flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : paymentMethod === 'vnpay' ? (
                    <>
                      Tiếp tục VNPay
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : paymentMethod === 'zalopay' ? (
                    <>
                      Tiếp tục ZaloPay
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 text-secondary" />
                      Xác nhận đặt vé
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/flights')}
                  disabled={bookingLoading}
                  className="w-full py-2.5 border border-outline-variant/30 text-on-surface-variant hover:text-primary text-xs uppercase tracking-widest rounded-lg transition-colors"
                >
                  Quay lại tìm kiếm
                </button>

                <div className="flex items-center justify-center gap-4 text-on-surface-variant/60 text-[10px]">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    PCI DSS
                  </span>
                  <span className="w-px h-3 bg-outline-variant/30" />
                  <span className="flex items-center gap-1">
                    <Plane className="h-3 w-3" />
                    Vé xác nhận ngay
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const PriceRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-baseline gap-3">
    <span className="text-[11px] text-on-surface-variant leading-relaxed">{label}</span>
    <span className="text-xs text-on-surface font-medium tabular-nums shrink-0">{value}</span>
  </div>
);

export default FlightCheckout;
