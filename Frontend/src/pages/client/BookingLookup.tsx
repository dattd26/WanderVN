import React, { useState } from 'react';
import { request, paymentService } from '../../services';
import type { BookingLookupDetailDto } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Loader2,
  Search,
  User,
  Mail,
  Phone,
  ArrowRight,
  Plane,
  Hotel as HotelIcon
} from 'lucide-react';
import vnpayLogo from '../../assets/images/vnpay.png';
import zalopayLogo from '../../assets/images/zalopay.png';

export const BookingLookup: React.FC = () => {
  const [bookingCode, setBookingCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingLookupDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Xử lý tra cứu đơn đặt chỗ
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim() || !email.trim()) {
      setError('Vui lòng nhập đầy đủ mã đặt chỗ và email liên hệ.');
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      // Gọi API tra cứu
      const data = await request<BookingLookupDetailDto>('/bookings/lookup', {
        method: 'POST',
        body: JSON.stringify({
          bookingCode: bookingCode.trim().toUpperCase(),
          email: email.trim().toLowerCase()
        })
      });

      if (data) {
        setBooking(data);
      } else {
        setError('Không tìm thấy đơn đặt chỗ khớp với thông tin đã nhập.');
      }
    } catch (err: any) {
      console.error('Lỗi tra cứu hành trình:', err);
      setError(err.message || 'Không tìm thấy đơn đặt chỗ hợp lệ.');
    } finally {
      setLoading(false);
    }
  };

  // Hủy đặt chỗ trực tiếp từ trang tra cứu
  const handleCancelBooking = async () => {
    if (!booking) return;
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt chỗ này không?')) return;

    setIsProcessing(true);
    try {
      await request<any>(`/bookings/${booking.bookingId}/cancel`, {
        method: 'PUT'
      });
      setBooking((prev: BookingLookupDetailDto | null) => 
        prev ? { ...prev, status: 'Cancelled' } : null
      );
      alert('Hủy đặt chỗ thành công!');
    } catch (err: any) {
      console.error('Lỗi hủy đặt chỗ:', err);
      alert(err.message || 'Có lỗi xảy ra khi hủy đặt chỗ.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Trả phòng trực tiếp từ trang tra cứu
  const handleCheckOut = async () => {
    if (!booking) return;
    if (!window.confirm('Xác nhận bạn đã trả phòng và kết thúc hành trình?')) return;

    setIsProcessing(true);
    try {
      await request<any>(`/bookings/${booking.bookingId}/checkout`, {
        method: 'PUT'
      });
      setBooking((prev: BookingLookupDetailDto | null) => 
        prev ? { ...prev, status: 'Completed' } : null
      );
      alert('Xác nhận trả phòng thành công!');
    } catch (err: any) {
      console.error('Lỗi trả phòng:', err);
      alert(err.message || 'Có lỗi xảy ra khi trả phòng.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Thanh toán trực tuyến lại qua cổng VNPay/ZaloPay
  const handleOnlinePayment = async (provider: 'vnpay' | 'zalopay') => {
    if (!booking) return;
    setIsProcessing(true);
    try {
      let paymentUrl = '';
      if (provider === 'vnpay') {
        paymentUrl = await paymentService.createVNPayUrl({ bookingId: booking.bookingId });
      } else {
        paymentUrl = await paymentService.createZaloPayUrl({ bookingId: booking.bookingId });
      }

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        alert('Không khởi tạo được liên kết thanh toán.');
      }
    } catch (err: any) {
      console.error(`Lỗi thanh toán ${provider}:`, err);
      alert(err.message || 'Có lỗi xảy ra khi tạo liên kết thanh toán.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper hiển thị badge trạng thái
  const renderStatusBadge = (status: string, paymentStatus: string) => {
    const normalizeStatus = status ? status.trim().toLowerCase() : 'pending';
    const normalizePayment = paymentStatus ? paymentStatus.trim().toLowerCase() : 'unpaid';

    if (normalizeStatus === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-full uppercase tracking-wider">
          <XCircle className="h-3.5 w-3.5" /> Đã hủy bỏ
        </span>
      );
    }

    if (normalizeStatus === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-full uppercase tracking-wider">
          <CheckCircle2 className="h-3.5 w-3.5" /> Đã trải nghiệm
        </span>
      );
    }

    if (normalizePayment === 'paid') {
      return (
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider">
          <CheckCircle2 className="h-3.5 w-3.5" /> Đã thanh toán & Xác nhận
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full uppercase tracking-wider">
        <Clock className="h-3.5 w-3.5 animate-pulse" /> Chờ thanh toán
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Editorial Grid Line Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Page Header */}
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-secondary font-semibold">
            Dịch vụ khách hàng vãng lai & thành viên
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-light text-primary mt-3 tracking-tight">
            Tra Cứu Hành Trình
          </h1>
          <p className="mt-3 text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Xem lại chi tiết phòng khách sạn hoặc vé máy bay đã đặt, thực hiện thanh toán trực tuyến hoặc hủy hành trình mà không cần đăng nhập.
          </p>
        </div>

        {/* Search Form Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-neutral-100 p-6 sm:p-10 mb-12 transition-all hover:shadow-xl">
          <form onSubmit={handleLookup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking Code Input */}
              <div className="space-y-2">
                <label htmlFor="bookingCode" className="block text-xs uppercase tracking-widest text-neutral-500 font-bold">
                  Mã Đặt Chỗ (Booking Code)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    id="bookingCode"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    placeholder="WVN-XXXXXX"
                    className="block w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all font-mono uppercase tracking-wider"
                    required
                  />
                </div>
              </div>

              {/* Email Contact Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs uppercase tracking-widest text-neutral-500 font-bold">
                  Email Liên Hệ
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@wandervn.com"
                    className="block w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-3 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-semibold text-xs tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 transition-all shadow-md group disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  ĐANG KẾT NỐI HỆ THỐNG...
                </>
              ) : (
                <>
                  BẮT ĐẦU TRA CỨU HÀNH TRÌNH
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Presentation Section */}
        {booking && (
          <div className="bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden animate-fade-in">
            {/* Result Header */}
            <div className="px-6 py-8 sm:px-10 border-b border-neutral-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-neutral-50/50">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Kết quả tra cứu đơn đặt</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <h2 className="text-2xl font-serif text-neutral-950 font-normal">Hành Trình Chi Tiết</h2>
                  <span className="text-xs font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 border rounded">
                    {booking.bookingCode}
                  </span>
                </div>
              </div>
              <div>{renderStatusBadge(booking.status, booking.paymentStatus)}</div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* Service information */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Thông tin dịch vụ</h3>
                
                {booking.serviceType === 'Hotel' ? (
                  <div className="border border-neutral-100 rounded-lg p-5 sm:p-6 flex flex-col md:flex-row gap-6 justify-between items-center bg-white shadow-sm hover:border-secondary/20 transition-all duration-300">
                    <div className="w-full md:w-36 h-36 flex-shrink-0 bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200">
                      {booking.hotelImage ? (
                        <img
                          src={booking.hotelImage}
                          alt={booking.hotelName || 'Hotel'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1">
                          <HotelIcon className="h-6 w-6 opacity-40" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Không có ảnh</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                        <HotelIcon className="h-3.5 w-3.5 text-secondary" /> Đặt phòng khách sạn
                      </div>
                      <h4 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900">{booking.hotelName}</h4>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#B59A5A]" /> {booking.hotelAddress || 'Địa chỉ đang được cập nhật'}
                      </p>
                      <div className="pt-2">
                        <p className="text-xs text-neutral-600">
                          Hạng phòng: <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">{booking.roomTypeName || 'Tiêu chuẩn'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex justify-between gap-8 border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-8 text-sm">
                      <div className="space-y-1">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Nhận phòng</p>
                        <p className="font-bold text-amber-900 text-base flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-secondary shrink-0" />
                          {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('vi-VN') : '---'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Trả phòng</p>
                        <p className="font-bold text-neutral-700 text-base flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-secondary shrink-0" />
                          {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('vi-VN') : '---'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-neutral-100 rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-center bg-white shadow-sm hover:border-secondary/20 transition-all duration-300">
                    <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                      <Plane className="h-6 w-6" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                        <Plane className="h-3.5 w-3.5 text-secondary" /> Đặt vé máy bay trực tuyến
                      </div>
                      <h4 className="font-serif text-lg font-bold text-neutral-900">Chuyến Bay WanderVN</h4>
                      <p className="text-xs text-neutral-500">
                        Danh sách hành khách bay: <span className="font-semibold text-neutral-800">{booking.passengerNames || 'Chưa cập nhật'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Hành trình bay</p>
                      <p className="font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded mt-0.5 inline-block">
                        Vé điện tử tử tế
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Customer Contact details */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-neutral-100">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Thông tin người đặt chỗ</h3>
                  <div className="space-y-3 text-sm text-neutral-700 bg-neutral-50/50 rounded-lg p-4 border border-neutral-100">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-neutral-400 shrink-0" />
                      <span>Họ tên: <strong className="text-neutral-900">{booking.customerName || 'Khách vãng lai'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                      <span>Email: <strong className="text-neutral-900">{booking.email}</strong></span>
                    </div>
                    {booking.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                        <span>SĐT: <strong className="text-neutral-900">{booking.customerPhone}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Chi tiết giao dịch</h3>
                  <div className="bg-amber-50/40 border border-amber-100 rounded-lg p-4 flex flex-col justify-center h-[106px]">
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Tổng giá trị đơn đặt:</span>
                    <div className="text-3xl font-black text-amber-700 mt-1 flex items-baseline gap-1">
                      {booking.totalPrice?.toLocaleString('vi-VN')}
                      <span className="text-xs font-bold">VND</span>
                    </div>
                    <span className="text-[9px] text-neutral-400 mt-1 font-mono">
                      Khởi tạo ngày: {new Date(booking.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-5 sm:px-10 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                Mã bảo mật: {booking.bookingId}WVN
              </span>

              <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                {/* Hủy đặt chỗ */}
                {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                  <button
                    onClick={handleCancelBooking}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 bg-white border border-red-200 rounded-lg shadow-sm hover:bg-red-50 hover:text-red-700 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Đang xử lý...' : 'Hủy đặt chỗ'}
                  </button>
                )}

                {/* Trả phòng (Check-out) */}
                {booking.status === 'Confirmed' && booking.serviceType === 'Hotel' && (
                  <button
                    onClick={handleCheckOut}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Đang xử lý...' : 'Xác nhận trả phòng'}
                  </button>
                )}

                {/* Cổng thanh toán trực tuyến khi chưa trả tiền */}
                {booking.status === 'Pending' && booking.paymentStatus === 'Unpaid' && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleOnlinePayment('vnpay')}
                      disabled={isProcessing}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg shadow-sm transition-all text-xs font-bold text-neutral-700 disabled:opacity-50"
                      title="Thanh toán qua cổng VNPay"
                    >
                      <img src={vnpayLogo} alt="VNPay" className="h-4 w-auto object-contain" />
                      VNPay
                    </button>
                    <button
                      onClick={() => handleOnlinePayment('zalopay')}
                      disabled={isProcessing}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg shadow-sm transition-all text-xs font-bold text-neutral-700 disabled:opacity-50"
                      title="Thanh toán qua ví ZaloPay"
                    >
                      <img src={zalopayLogo} alt="ZaloPay" className="h-4 w-auto object-contain" />
                      ZaloPay
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingLookup;
