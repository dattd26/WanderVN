import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { hotelService, paymentService } from '../../services';
import type { HotelDetailDto, RoomTypeInfo, CreateHotelBookingRequest } from '../../types';
import {
  Hotel,
  Calendar,
  Users,
  CheckCircle,
  CreditCard,
  Shield,
  Loader2,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';

import momoLogo from '../../assets/images/momo.png';
import zalopayLogo from '../../assets/images/zalopay.png';
import vnpayLogo from '../../assets/images/vnpay.png';

export const HotelCheckout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Nhận thông tin tham số đặt phòng từ URL query parameters
  const hotelId = searchParams.get('hotelId') ? parseInt(searchParams.get('hotelId')!) : 0;
  const roomTypeId = searchParams.get('roomTypeId') ? parseInt(searchParams.get('roomTypeId')!) : 0;
  const checkInDate = searchParams.get('checkInDate') || '';
  const checkOutDate = searchParams.get('checkOutDate') || '';

  // Khởi tạo các trạng thái lấy thông tin
  const isValidRequest = hotelId > 0 && roomTypeId > 0;
  const [hotel, setHotel] = useState<HotelDetailDto | null>(null);
  const [room, setRoom] = useState<RoomTypeInfo | null>(null);
  const [loading, setLoading] = useState(isValidRequest);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    isValidRequest ? null : 'Thông tin yêu cầu đặt phòng không hợp lệ.'
  );

  // Quản lý phương thức thanh toán đã chọn
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'zalopay' | 'momo' | 'credit'>('vnpay');

  // Trạng thái modal thông báo đặt phòng thành công bằng thẻ tín dụng (Demo)
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBookingCode, setSuccessBookingCode] = useState('');

  // Thông tin khách hàng đặt phòng
  const [guestForm, setGuestForm] = useState({
    title: 'mr',
    fullName: 'NGUYỄN VĂN A',
    email: 'nguyenvana@example.com',
    phoneNumber: '+84901234567',
    passportNumber: 'B1234567',
    gender: 'm'
  });

  // Tải thông tin phòng và khách sạn liên kết
  useEffect(() => {
    if (!hotelId || !roomTypeId) {
      return;
    }

    hotelService.getHotelDetail(hotelId)
      .then((data) => {
        setHotel(data);
        const selectedRoom = data.roomTypes.find((r) => r.id === roomTypeId);
        if (selectedRoom) {
          setRoom(selectedRoom);
        } else {
          setErrorMessage('Hạng phòng được chọn không tồn tại hoặc đã hết.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi lấy thông tin đặt phòng khách sạn:', err);
        setErrorMessage('Không thể tải thông tin khách sạn để thanh toán.');
        setLoading(false);
      });
  }, [hotelId, roomTypeId]);

  // Tính số đêm nghỉ dưỡng
  const nights = Math.max(1, Math.round(
    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  ));

  // Tính toán đơn giá tổng chi phí phòng
  const roomBasePrice = room ? room.basePrice : 0;
  const subtotal = roomBasePrice * nights;
  const totalAmount = subtotal;

  // Thực hiện quy trình đặt phòng và thanh toán tương ứng
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel || !room) return;

    setBookingLoading(true);
    setErrorMessage(null);

    const bookingRequest: CreateHotelBookingRequest = {
      userId: 1, // Mock User ID đã đăng nhập trên ứng dụng
      roomTypeId: room.id,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      totalPrice: totalAmount
    };

    try {
      const response = await hotelService.createHotelBooking(bookingRequest);
      setSuccessBookingCode(response.bookingCode);

      // Chuyển hướng thanh toán tùy thuộc vào phương thức đã chọn
      if (paymentMethod === 'vnpay') {
        const paymentUrl = await paymentService.createVNPayUrl({ bookingId: response.bookingId });
        window.location.href = paymentUrl; // Redirect sang cổng VNPay Sandbox
      } else if (paymentMethod === 'zalopay') {
        const paymentUrl = await paymentService.createZaloPayUrl({ bookingId: response.bookingId });
        window.location.href = paymentUrl; // Redirect sang cổng ZaloPay Sandbox
      } else {
        // Phương thức thẻ tín dụng (Demo offline thành công lập tức)
        setBookingLoading(false);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Lỗi quy trình đặt phòng khách sạn:', error);
      let message = 'Có lỗi bất ngờ xảy ra khi đang tạo đơn đặt phòng của bạn.';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        message = String((error as Record<string, unknown>).message);
      }
      setErrorMessage(message);
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 text-secondary animate-spin" />
        <p className="font-body-md text-body-md text-on-surface-variant italic animate-pulse">
          Đang chuẩn bị hồ sơ đặt phòng di sản cao cấp...
        </p>
      </div>
    );
  }

  if (errorMessage && !hotel) {
    return (
      <div className="max-w-md mx-auto my-32 p-8 text-center border border-outline-variant/30 bg-surface-container-low rounded-lg shadow-sm">
        <AlertTriangle className="h-12 w-12 text-error-color mx-auto mb-4" />
        <h3 className="font-display-lg text-headline-md text-primary mb-2">Đã xảy ra lỗi</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">{errorMessage}</p>
        <Link to="/stays" className="px-6 py-2 bg-primary text-on-primary font-semibold text-xs tracking-wider uppercase rounded hover:bg-primary/95 transition-all">
          Quay lại Tìm kiếm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-32 px-margin-mobile md:px-margin-desktop relative">
      <div className="max-w-container-max mx-auto">
        {/* Nút Quay Lại */}
        <Link
          to={`/hotel/${hotelId}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-secondary mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Quay lại chi tiết khách sạn
        </Link>

        <div className="mb-10">
          <span className="font-label-md text-caption uppercase tracking-wider text-secondary">
            Xác nhận đặt lưu trú
          </span>
          <h1 className="font-display-lg text-headline-lg md:text-5xl text-primary mt-1">
            Quy trình hoàn tất đặt phòng
          </h1>
        </div>

        {/* Lỗi cảnh báo quy trình */}
        {errorMessage && (
          <div className="mb-8 p-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* CỘT TRÁI: THÔNG TIN KHÁCH HÀNG & PHƯƠNG THỨC THANH TOÁN */}
          <div className="lg:col-span-8 space-y-10">

            {/* Khối 1: Thông tin khách hàng */}
            <div className="border border-outline-variant/30 p-6 md:p-8 bg-surface-container-lowest rounded-lg">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/20">
                <span className="font-headline-md text-headline-md text-outline">01</span>
                <h2 className="font-headline-lg text-headline-md text-primary">Thông Tin Khách Lưu Trú</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">
                    Danh xưng
                  </label>
                  <select
                    value={guestForm.title}
                    onChange={(e) => setGuestForm({ ...guestForm, title: e.target.value })}
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 focus:border-b-primary transition-colors cursor-pointer text-on-surface"
                  >
                    <option className="bg-surface text-on-surface" value="mr">Ông (Mr.)</option>
                    <option className="bg-surface text-on-surface" value="ms">Bà (Ms.)</option>
                    <option className="bg-surface text-on-surface" value="mrs">Cô/Chị (Mrs.)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">
                    Họ và Tên khách (Không dấu)
                  </label>
                  <input
                    type="text"
                    required
                    value={guestForm.fullName}
                    onChange={(e) => setGuestForm({ ...guestForm, fullName: e.target.value.toUpperCase() })}
                    placeholder="e.g. NGUYEN VAN A"
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 uppercase focus:border-b-primary transition-colors text-on-surface"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    required
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                    placeholder="e.g. nguyenvana@example.com"
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 focus:border-b-primary transition-colors text-on-surface"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestForm.phoneNumber}
                    onChange={(e) => setGuestForm({ ...guestForm, phoneNumber: e.target.value })}
                    placeholder="e.g. +84 901 234 567"
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 focus:border-b-primary transition-colors text-on-surface"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-caption uppercase tracking-wider text-outline text-[10px]">
                    Số Hộ Chiếu (Passport) / CCCD
                  </label>
                  <input
                    type="text"
                    required
                    value={guestForm.passportNumber}
                    onChange={(e) => setGuestForm({ ...guestForm, passportNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. 036200012345"
                    className="bg-transparent border-0 border-b border-outline-variant py-2 font-body-md text-body-md focus:ring-0 uppercase focus:border-b-primary transition-colors text-on-surface"
                  />
                </div>
              </div>
            </div>

            {/* Khối 2: Tùy chọn phương thức thanh toán */}
            <div className="border border-outline-variant/30 p-6 md:p-8 bg-surface-container-lowest rounded-lg">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/20">
                <span className="font-headline-md text-headline-md text-outline">02</span>
                <h2 className="font-headline-lg text-headline-md text-primary">Chọn Phương Thức Thanh Toán</h2>
              </div>
              <div className="space-y-4">

                {/* VNPay */}
                <div
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
                  <div className="h-8 w-14 bg-white border border-outline-variant/20 rounded flex items-center justify-center p-1 shadow-sm transition-all group-hover:shadow-md">
                    <img src={vnpayLogo} alt="VNPay" className="h-full w-full object-contain" />
                  </div>
                </div>

                {/* Nhóm ví điện tử (ZaloPay & MoMo) */}
                <div
                  className={`border transition-all rounded-lg overflow-hidden ${paymentMethod === 'zalopay' || paymentMethod === 'momo'
                    ? 'border-primary bg-surface shadow-md'
                    : 'border-outline-variant/30 hover:border-primary bg-transparent'
                    }`}
                >
                  <div
                    onClick={() => {
                      if (paymentMethod !== 'zalopay' && paymentMethod !== 'momo') {
                        setPaymentMethod('zalopay');
                      }
                    }}
                    className="group flex items-center justify-between p-5 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'zalopay' || paymentMethod === 'momo'}
                        onChange={() => setPaymentMethod('zalopay')}
                        className="text-primary focus:ring-primary w-4.5 h-4.5 cursor-pointer animate-none"
                      />
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md">Ví điện tử (ZaloPay / MoMo)</span>
                        <span className="text-[11px] text-on-surface-variant opacity-75">Thanh toán nhanh qua ví điện tử liên kết tại Việt Nam</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-14 bg-white border border-outline-variant/20 rounded flex items-center justify-center p-1 shadow-sm transition-all group-hover:shadow-md">
                        <img src={zalopayLogo} alt="ZaloPay" className="h-full w-full object-contain" />
                      </div>
                      <div className="h-8 w-14 bg-white border border-outline-variant/20 rounded flex items-center justify-center p-1 shadow-sm transition-all group-hover:shadow-md opacity-70">
                        <img src={momoLogo} alt="MoMo" className="h-full w-full object-contain rounded grayscale" />
                      </div>
                    </div>
                  </div>

                  {(paymentMethod === 'zalopay' || paymentMethod === 'momo') && (
                    <div className="px-5 pb-5 pt-2 border-t border-outline-variant/10 space-y-3 bg-surface-container-low/20">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-semibold mb-1">
                        Vui lòng chọn ví điện tử thanh toán:
                      </p>

                      {/* ZaloPay Option */}
                      <div
                        onClick={() => setPaymentMethod('zalopay')}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'zalopay'
                          ? 'border-primary bg-surface shadow-sm'
                          : 'border-outline-variant/20 hover:border-primary/50 bg-transparent'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="sub-payment-wallet"
                            checked={paymentMethod === 'zalopay'}
                            onChange={() => setPaymentMethod('zalopay')}
                            className="text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          <div className="h-8 w-14 bg-white border border-outline-variant/20 rounded flex items-center justify-center p-1 shadow-sm">
                            <img src={zalopayLogo} alt="ZaloPay" className="h-full w-full object-contain" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-label-md text-xs text-on-surface">Ví điện tử ZaloPay</span>
                            <span className="text-[10px] text-on-surface-variant/80">Khuyên dùng, xử lý và phê duyệt ngay tức thì</span>
                          </div>
                        </div>
                      </div>

                      {/* MoMo Option (Disabled) */}
                      <div
                        className="flex items-center justify-between p-3 border border-outline-variant/10 rounded-lg opacity-60 bg-outline-variant/5 cursor-not-allowed select-none relative"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="sub-payment-wallet"
                            disabled
                            checked={paymentMethod === 'momo'}
                            className="text-primary focus:ring-primary w-4 h-4 cursor-not-allowed"
                          />
                          <div className="h-8 w-14 bg-white border border-outline-variant/20 rounded flex items-center justify-center p-1 shadow-sm opacity-60">
                            <img src={momoLogo} alt="MoMo" className="h-full w-full object-contain rounded grayscale" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-label-md text-xs text-on-surface/85">Ví điện tử MoMo</span>
                            <span className="text-[10px] text-on-surface-variant/60">Thanh toán bằng ví điện tử MoMo của bạn</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[10px] font-semibold text-red-700 dark:text-red-300 px-2 py-0.5 bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded select-none shadow-sm">
                            Chưa hỗ trợ
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thẻ tín dụng */}
                <div
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
                  <div className="flex gap-2 opacity-50 group-hover:opacity-85 transition-all text-on-surface">
                    <CreditCard className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <p className="mt-6 font-caption text-caption text-outline italic">
                * Giao dịch được bảo mật tuyệt đối với công nghệ mã hóa AES-256. Giao dịch tuân thủ nghiêm ngặt tiêu chuẩn bảo mật dữ liệu PCI DSS.
              </p>
            </div>

            {/* Phân cảnh hình ảnh nghệ thuật điện ảnh */}
            <div className="w-full h-48 overflow-hidden border border-outline-variant/30 p-2 bg-surface-container-lowest rounded-lg">
              <img
                className="w-full h-full object-cover grayscale-[15%] brightness-90 hover:scale-[102%] transition-transform duration-[2000ms] rounded-sm"
                alt="Hoàng hôn di sản yên bình"
                src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80"
              />
            </div>

          </div>

          {/* CỘT PHẢI: THÔNG TIN TÓM TẮT ĐẶT PHÒNG */}
          <div className="lg:col-span-4 space-y-6">

            {/* Tóm tắt khách sạn & phòng */}
            {hotel && room && (
              <div className="border border-outline-variant/30 bg-surface-container-lowest p-6 rounded-lg space-y-6 limestone-shadow">
                <h3 className="font-display-lg text-headline-md text-primary pb-4 border-b border-outline-variant/20 flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-secondary" />
                  Tóm Tắt Đặt Phòng
                </h3>

                {/* Ảnh chính khách sạn */}
                <div className="w-full h-40 overflow-hidden rounded">
                  <img
                    src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-base text-on-surface leading-tight">{hotel.name}</h4>
                  <p className="text-xs text-on-surface-variant font-medium">{hotel.address}</p>
                </div>

                <div className="pt-4 border-t border-outline-variant/20 space-y-3.5 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-on-surface-variant">Hạng phòng:</span>
                    <span className="font-semibold text-right text-on-surface max-w-[60%]">{room.name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Số lượng khách:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#B59A5A]" /> Tối đa {room.capacity} người
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Ngày nhận phòng:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-secondary" /> {checkInDate}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Ngày trả phòng:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-secondary" /> {checkOutDate}
                    </span>
                  </div>

                  <div className="flex justify-between pb-2">
                    <span className="text-on-surface-variant">Tổng số đêm nghỉ:</span>
                    <span className="font-bold text-[#B59A5A]">{nights} đêm</span>
                  </div>
                </div>

                {/* Chi tiết chi phí */}
                <div className="pt-4 border-t border-outline-variant/20 space-y-3 text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Đơn giá phòng:</span>
                    <span>{roomBasePrice.toLocaleString('vi-VN')} VND / đêm</span>
                  </div>

                  <div className="flex justify-between text-on-surface-variant">
                    <span>Tổng tiền phòng ({nights} đêm):</span>
                    <span>{subtotal.toLocaleString('vi-VN')} VND</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-4 border-t border-outline-variant/30 text-primary">
                    <span className="font-bold text-sm">Tổng cộng thanh toán:</span>
                    <span className="font-display-lg text-xl font-bold text-red-600">
                      {totalAmount.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                </div>

                {/* Nút hành động */}
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-4 bg-primary text-on-primary hover:bg-primary/95 font-label-md text-label-md font-semibold rounded shadow-md tracking-wider uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Đang xử lý đặt phòng...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4.5 w-4.5 text-secondary" />
                      Thanh toán an toàn
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

        </form>
      </div>

      {/* MODAL THÔNG BÁO THÀNH CÔNG CHO PHƯƠNG THỨC THẺ TÍN DỤNG (DEMO OFFLINE) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] bg-black/70 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest max-w-md w-full border border-outline-variant/30 p-8 rounded-lg text-center shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#B59A5A]"></div>

            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display-lg text-2xl text-primary font-bold">Đặt Phòng Thành Công!</h3>
              <p className="font-body-md text-sm text-on-surface-variant">
                Yêu cầu đặt lưu trú của bạn đã được tiếp nhận và xử lý thành công trên hệ thống.
              </p>
            </div>

            <div className="bg-surface-container-low/40 p-4 rounded border border-outline-variant/20 space-y-2.5 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Mã đặt chỗ:</span>
                <span className="font-bold text-primary">{successBookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Khách sạn:</span>
                <span className="font-semibold text-right max-w-[60%]">{hotel?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Hạng phòng:</span>
                <span className="font-semibold">{room?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Thời gian:</span>
                <span className="font-semibold">{checkInDate} đến {checkOutDate}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-outline-variant/10 text-primary">
                <span className="font-bold">Tổng thanh toán:</span>
                <span className="font-bold text-red-600">{totalAmount.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 bg-[#B59A5A] hover:bg-[#9E8448] text-white font-label-md text-xs font-semibold rounded shadow uppercase tracking-wider transition-colors"
            >
              Trở về Trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelCheckout;
