import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { flightService, paymentService } from '../../services';
import type { FlightOfferDto, PassengerDto } from '../../types';
import {
  Plane,
  CheckCircle,
  ArrowRight,
  QrCode,
  Wallet,
  CreditCard,
  Shield,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export const FlightCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const WANDER_SELECTED_OFFER = 'wander_selected_offer';
  // Trạng thái vé máy bay đang được thanh toán - khôi phục đồng bộ trực tiếp từ state hoặc sessionStorage để tránh trễ render và vi phạm eslint
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
      } catch (e) {
        console.error('Không thể parse dữ liệu vé đã lưu:', e);
      }
    }
    return null;
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'zalopay' | 'momo' | 'credit'>('vnpay');

  // Form thông tin hành khách
  const [passengerForm, setPassengerForm] = useState<Omit<PassengerDto, 'id'>>({
    title: 'mr',
    familyName: 'NGUYEN',
    givenName: 'VAN A',
    bornOn: '1995-05-20',
    email: 'nguyenvana@example.com',
    phoneNumber: '+84901234567',
    gender: 'm',
    passportNumber: 'B1234567'
  });

  // Định dạng thời gian
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Định dạng khoảng thời gian bay
  const formatDuration = (durationStr: string) => {
    if (!durationStr) return '1h 30m';
    const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return durationStr;
    const hours = match[1] ? `${match[1]}h` : '';
    const minutes = match[2] ? `${match[2]}m` : '';
    return `${hours} ${minutes}`.trim() || '1h 20m';
  };

  // Gửi đặt vé và thanh toán
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer) return;

    setBookingLoading(true);
    try {
      // Sử dụng ID đặt vé của hãng Duffel Airways (ZZ) để đảm bảo sandbox thành công 100%
      const finalOfferId = offer.duffelAirwaysOfferId || offer.id;
      const finalPassengerId = offer.duffelAirwaysPassengerId || offer.passengerId || 'pas_default';

      const bookingRequest = {
        userId: 1, // Mock User ID đã đăng nhập
        offerId: finalOfferId,
        totalPrice: offer.totalAmount,
        passengers: [
          {
            id: finalPassengerId,
            ...passengerForm
          }
        ]
      };

      // 1. Tạo đặt vé trong cơ sở dữ liệu backend
      const result = await flightService.createBooking(bookingRequest);

      // Xóa cache offer sau khi đã tạo booking thành công
      sessionStorage.removeItem(WANDER_SELECTED_OFFER);

      // 2. Nếu phương thức thanh toán là VNPay, chuyển hướng sang sandbox
      if (paymentMethod === 'vnpay') {
        const paymentUrl = await paymentService.createVNPayUrl({ bookingId: result.bookingId });
        if (paymentUrl) {
          // Chuyển hướng trình duyệt trực tiếp sang cổng thanh toán VNPay Sandbox
          window.location.href = paymentUrl;
          return;
        }
      }

      // 3. Nếu phương thức thanh toán là ZaloPay, chuyển hướng sang sandbox
      if (paymentMethod === 'zalopay') {
        const paymentUrl = await paymentService.createZaloPayUrl({ bookingId: result.bookingId });
        if (paymentUrl) {
          // Chuyển hướng trình duyệt trực tiếp sang cổng thanh toán ZaloPay Sandbox
          window.location.href = paymentUrl;
          return;
        }
      }

      // 3. Với các phương thức khác, quay lại trang tìm kiếm và báo thành công
      alert(`🎉 Đặt vé thành công! Mã đặt vé của bạn là: ${result.bookingCode}`);
      navigate('/flights');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      alert(`⚠️ Lỗi đặt vé & thanh toán: ${message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  if (!offer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background text-on-surface p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-8 shadow-2xl limestone-shadow">
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-secondary animate-pulse" />
          </div>
          <h2 className="font-display-lg text-headline-md text-primary">Không Tìm Thấy Chuyến Bay</h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            Có vẻ như phiên giao dịch của quý khách đã hết hạn hoặc chưa có chuyến bay nào được lựa chọn để thanh toán.
          </p>
          <Link
            to="/flights"
            className="w-full bg-primary text-on-primary py-3.5 font-label-md text-xs uppercase tracking-widest hover:bg-surface-tint transition-all flex items-center justify-center gap-2 rounded-md"
          >
            Quay Lại Trang Tìm Kiếm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface py-12 px-margin-mobile md:px-margin-desktop relative">
      <div className="max-w-6xl mx-auto">
        {/* Tiêu đề giao diện Checkout */}
        <div className="border-b border-outline-variant/20 pb-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <span className="font-label-md text-xs text-secondary uppercase tracking-widest">Thanh toán di sản</span>
            <h1 className="font-display-lg text-headline-lg text-primary mt-1">Hoàn Tất Hành Trình Của Bạn</h1>
            <p className="text-body-md text-on-surface-variant italic mt-1">
              Kiểm tra lại thông tin chi tiết và xác nhận hành trình bay qua những địa danh tuyệt mỹ của Việt Nam.
            </p>
          </div>
          <Link
            to="/flights"
            className="font-label-md text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all py-2"
          >
            ← Quay lại tìm kiếm
          </Link>
        </div>

        <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Cột trái: Thông tin hành khách & Phương thức thanh toán (Chiếm 7 phần) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Khối 1: Thông tin hành khách */}
            <div className="border border-outline-variant/30 p-6 md:p-8 bg-surface-container-lowest rounded-lg">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/20">
                <span className="font-headline-md text-headline-md text-outline">01</span>
                <h2 className="font-headline-lg text-headline-md text-primary">Thông Tin Hành Khách</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">Danh xưng</label>
                  <select
                    value={passengerForm.title}
                    onChange={(e) => setPassengerForm({ ...passengerForm, title: e.target.value })}
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 focus:border-b-primary transition-colors cursor-pointer text-on-surface"
                  >
                    <option className="bg-surface text-on-surface" value="mr">Ông (Mr.)</option>
                    <option className="bg-surface text-on-surface" value="ms">Bà (Ms.)</option>
                    <option className="bg-surface text-on-surface" value="mrs">Cô/Chị (Mrs.)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">Họ (Family Name)</label>
                  <input
                    type="text"
                    required
                    value={passengerForm.familyName}
                    onChange={(e) => setPassengerForm({ ...passengerForm, familyName: e.target.value.toUpperCase() })}
                    placeholder="e.g. NGUYEN"
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 uppercase focus:border-b-primary transition-colors text-on-surface"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">Tên đệm &amp; Tên gọi (Given Name)</label>
                  <input
                    type="text"
                    required
                    value={passengerForm.givenName}
                    onChange={(e) => setPassengerForm({ ...passengerForm, givenName: e.target.value.toUpperCase() })}
                    placeholder="e.g. VAN A"
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 uppercase focus:border-b-primary transition-colors text-on-surface"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">Địa chỉ Email</label>
                  <input
                    type="email"
                    required
                    value={passengerForm.email}
                    onChange={(e) => setPassengerForm({ ...passengerForm, email: e.target.value })}
                    placeholder="e.g. nguyenvana@example.com"
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 focus:border-b-primary transition-colors text-on-surface"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    value={passengerForm.phoneNumber}
                    onChange={(e) => setPassengerForm({ ...passengerForm, phoneNumber: e.target.value })}
                    placeholder="e.g. +84 901 234 567"
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 focus:border-b-primary transition-colors text-on-surface"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">Số Hộ Chiếu (Passport) / CCCD</label>
                  <input
                    type="text"
                    required
                    value={passengerForm.passportNumber}
                    onChange={(e) => setPassengerForm({ ...passengerForm, passportNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. B1234567"
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 uppercase focus:border-b-primary transition-colors text-on-surface"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">Ngày sinh</label>
                  <input
                    type="date"
                    required
                    value={passengerForm.bornOn}
                    onChange={(e) => setPassengerForm({ ...passengerForm, bornOn: e.target.value })}
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 focus:border-b-primary transition-colors text-on-surface"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">Giới tính</label>
                  <select
                    value={passengerForm.gender}
                    onChange={(e) => setPassengerForm({ ...passengerForm, gender: e.target.value })}
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 focus:border-b-primary transition-colors cursor-pointer text-on-surface"
                  >
                    <option className="bg-surface text-on-surface" value="m">Nam (Male)</option>
                    <option className="bg-surface text-on-surface" value="f">Nữ (Female)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Khối 2: Phương thức thanh toán */}
            <div className="border border-outline-variant/30 p-6 md:p-8 bg-surface-container-lowest rounded-lg">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/20">
                <span className="font-headline-md text-headline-md text-outline">02</span>
                <h2 className="font-headline-lg text-headline-md text-primary">Chọn Phương Thức Thanh Toán</h2>
              </div>
              <div className="space-y-4">
                {/* VNPay */}
                <label
                  onClick={() => setPaymentMethod('vnpay')}
                  className={`group flex items-center justify-between p-5 border transition-all cursor-pointer rounded-lg ${paymentMethod === 'vnpay'
                    ? 'border-primary bg-surface shadow-md'
                    : 'border-outline-variant/30 hover:border-primary bg-transparent'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'vnpay'}
                      onChange={() => setPaymentMethod('vnpay')}
                      className="text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer animate-none"
                    />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md">Cổng thanh toán VNPay (QR / Thẻ ATM / Quốc tế)</span>
                      <span className="text-[11px] text-on-surface-variant opacity-75">Thanh toán qua ứng dụng ngân hàng hoặc thẻ nội địa/quốc tế</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-all text-secondary">
                    <QrCode className="h-6 w-6" />
                  </div>
                </label>

                {/* ZaloPay */}
                <label
                  onClick={() => setPaymentMethod('zalopay')}
                  className={`group flex items-center justify-between p-5 border transition-all cursor-pointer rounded-lg ${paymentMethod === 'zalopay'
                    ? 'border-primary bg-surface shadow-md'
                    : 'border-outline-variant/30 hover:border-primary bg-transparent'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'zalopay'}
                      onChange={() => setPaymentMethod('zalopay')}
                      className="text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer animate-none"
                    />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md">Ví điện tử ZaloPay</span>
                      <span className="text-[11px] text-on-surface-variant opacity-75">Thanh toán an toàn, nhanh chóng qua ứng dụng ZaloPay</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-all text-secondary">
                    <Wallet className="h-6 w-6" />
                  </div>
                </label>

                {/* Momo */}
                <label
                  onClick={() => setPaymentMethod('momo')}
                  className={`group flex items-center justify-between p-5 border transition-all cursor-pointer rounded-lg ${paymentMethod === 'momo'
                    ? 'border-primary bg-surface shadow-md'
                    : 'border-outline-variant/30 hover:border-primary bg-transparent'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'momo'}
                      onChange={() => setPaymentMethod('momo')}
                      className="text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer animate-none"
                    />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md">Ví điện tử MoMo</span>
                      <span className="text-[11px] text-on-surface-variant opacity-75">Thanh toán nhanh gọn bằng ví điện tử MoMo</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-50 group-hover:opacity-80 transition-all text-on-surface">
                    <Wallet className="h-6 w-6" />
                  </div>
                </label>

                {/* Thẻ tín dụng */}
                <label
                  onClick={() => setPaymentMethod('credit')}
                  className={`group flex items-center justify-between p-5 border transition-all cursor-pointer rounded-lg ${paymentMethod === 'credit'
                    ? 'border-primary bg-surface shadow-md'
                    : 'border-outline-variant/30 hover:border-primary bg-transparent'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'credit'}
                      onChange={() => setPaymentMethod('credit')}
                      className="text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer animate-none"
                    />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md">Thẻ tín dụng / Thẻ ghi nợ</span>
                      <span className="text-[11px] text-on-surface-variant opacity-75">Hỗ trợ Visa, Mastercard, JCB, American Express</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-50 group-hover:opacity-80 transition-all text-on-surface">
                    <CreditCard className="h-6 w-6" />
                  </div>
                </label>
              </div>
              <p className="mt-6 font-caption text-caption text-outline italic">
                * Giao dịch được bảo mật tuyệt đối với công nghệ mã hóa AES-256. Giá vé đã bao gồm các loại thuế &amp; phí dịch vụ hàng không bắt buộc.
              </p>
            </div>

            {/* Phân cảnh hình ảnh điện ảnh */}
            <div className="w-full h-48 overflow-hidden border border-outline-variant/30 p-2 bg-surface-container-lowest rounded-lg">
              <img
                className="w-full h-full object-cover grayscale-[20%] brightness-90 hover:scale-105 transition-transform duration-[2000ms] rounded-sm"
                alt="Lớp sương mờ trên vịnh di sản"
                src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80"
              />
            </div>
          </div>

          {/* Cột phải: Tóm tắt hành trình và thanh toán (Chiếm 5 phần) */}
          <div className="lg:col-span-5 lg:sticky lg:top-4">
            <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 md:p-8 rounded-lg text-on-surface space-y-6">
              <div>
                <span className="font-label-md text-[10px] uppercase tracking-widest text-on-surface-variant opacity-80 block">Chuyến Bay Của Bạn</span>
                <h3 className="font-display-lg text-headline-md mt-1 flex items-center gap-2">
                  {offer.originName || offer.originCode}
                  <ArrowRight className="h-4.5 w-4.5 text-outline" />
                  {offer.destinationName || offer.destinationCode}
                </h3>
              </div>

              {/* Chi tiết chuyến bay */}
              <div className="border-t border-b border-outline-variant/20 py-5 space-y-4">
                <div className="flex justify-between text-caption">
                  <div>
                    <p className="text-on-surface-variant uppercase text-[10px] tracking-widest">Hãng bay / Hạng vé</p>
                    <p className="font-body-md text-primary font-medium mt-0.5">
                      {offer.carrierName} • Phổ Thông (Economy)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-on-surface-variant uppercase text-[10px] tracking-widest">Thời gian bay</p>
                    <p className="font-body-md text-primary font-medium mt-0.5">{formatDuration(offer.duration)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-surface-container-low/40 p-4 rounded-md border border-outline-variant/10">
                  <div className="text-left">
                    <p className="font-headline-md text-lg text-primary">{formatTime(offer.departingAt)}</p>
                    <p className="font-caption text-caption text-on-surface-variant">
                      {offer.originCode}
                    </p>
                  </div>
                  <div className="flex-1 px-4 flex flex-col items-center gap-1">
                    <div className="w-full h-px bg-outline-variant/40 relative flex items-center justify-center">
                      <Plane className="h-3 w-3 text-outline absolute rotate-90" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-headline-md text-lg text-primary">
                      {formatTime(offer.arrivingAt)}
                    </p>
                    <p className="font-caption text-caption text-on-surface-variant">
                      {offer.destinationCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chi tiết chi phí */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Giá vé cơ bản (1x Người lớn)</span>
                  <span className="text-on-surface font-medium">${(offer.totalAmount * 0.85).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Thuế &amp; Phụ phí sân bay</span>
                  <span className="text-on-surface font-medium">${(offer.totalAmount * 0.15).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Hành lý ký gửi (30kg đã bao gồm)</span>
                  <span className="text-emerald-600 font-medium">Miễn phí</span>
                </div>
                <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-end">
                  <span className="font-headline-md text-lg text-primary font-semibold">Tổng tiền</span>
                  <div className="text-right">
                    <span className="font-display-lg text-2xl text-secondary block font-bold">${offer.totalAmount.toFixed(2)} USD</span>
                    <p className="font-caption text-[11px] text-on-surface-variant italic mt-0.5">
                      ~ {(offer.totalAmount * 24500).toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                </div>
              </div>

              {/* Nút thao tác xác nhận */}
              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-primary text-on-primary py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-surface-tint transition-all flex items-center justify-center gap-2 group rounded-md select-none"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      ĐANG XỬ LÝ THANH TOÁN...
                    </>
                  ) : paymentMethod === 'vnpay' ? (
                    <>
                      TIẾP TỤC THANH TOÁN VNPAY
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : paymentMethod === 'zalopay' ? (
                    <>
                      TIẾP TỤC THANH TOÁN ZALOPAY
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      XÁC NHẬN ĐẶT VÉ
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/flights')}
                  disabled={bookingLoading}
                  className="w-full border border-outline-variant/30 text-on-surface-variant hover:text-primary py-2.5 font-label-md text-xs uppercase tracking-widest hover:bg-surface-container-low transition-all text-center rounded-md select-none"
                >
                  QUAY LẠI TÌM KIẾM
                </button>
              </div>

              {/* Chỉ số an toàn bảo mật */}
              <div className="pt-4 flex items-center justify-center gap-5 text-on-surface-variant opacity-80 text-[11px] border-t border-outline-variant/10">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-secondary" />
                  <span>Thanh toán bảo mật</span>
                </div>
                <span className="w-px h-3 bg-outline-variant/30"></span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-secondary" />
                  <span>Không phí ẩn</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlightCheckout;
