import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { request, paymentService } from '../../services';
import { useToast } from '../../contexts/ToastContext';
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
  Hotel as HotelIcon,
  CreditCard,
  LogIn
} from 'lucide-react';
import vnpayLogo from '../../assets/images/vnpay.png';
import zalopayLogo from '../../assets/images/zalopay.png';

export const BookingLookup: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [bookingCode, setBookingCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingLookupDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { triggerMessage } = useToast();

  useEffect(() => {
    if (!pageRef.current) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        isDesktop: '(min-width: 768px)'
      },
      (context) => {
        const { reduceMotion, isDesktop } = context.conditions ?? {};
        const targets = pageRef.current?.querySelectorAll('[data-lookup-animate]');
        if (!targets?.length) return;

        if (reduceMotion) {
          gsap.set(targets, { autoAlpha: 1, y: 0 });
          return;
        }

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: isDesktop ? 22 : 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.08,
            overwrite: 'auto'
          }
        );
      }
    );

    return () => mm.revert();
  }, []);

  useEffect(() => {
    if (!booking || !resultRef.current) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        resultRef.current,
        { autoAlpha: 0, y: 18, scale: 0.99 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: 'power2.out', overwrite: 'auto' }
      );
    });

    return () => mm.revert();
  }, [booking]);

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
    } catch (err: unknown) {
      console.error('Lỗi tra cứu hành trình:', err);
      setError((err as Error).message || 'Không tìm thấy đơn đặt chỗ hợp lệ.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt chỗ này không?')) return;

    setIsProcessing(true);
    try {
      await request<BookingLookupDetailDto>(`/bookings/${booking.bookingId}/cancel`, { method: 'PUT' });
      setBooking((prev: BookingLookupDetailDto | null) => prev ? { ...prev, status: 'Cancelled' } : null);
      triggerMessage('success', 'Hủy đặt chỗ thành công!');
    } catch (err: unknown) {
      console.error('Lỗi hủy đặt chỗ:', err);
      triggerMessage('error', (err as Error).message || 'Có lỗi xảy ra khi hủy đặt chỗ.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!booking) return;
    if (!window.confirm('Xác nhận bạn đã trả phòng và kết thúc hành trình?')) return;

    setIsProcessing(true);
    try {
      await request<BookingLookupDetailDto>(`/bookings/${booking.bookingId}/checkout`, { method: 'PUT' });
      setBooking((prev: BookingLookupDetailDto | null) => prev ? { ...prev, status: 'Completed' } : null);
      triggerMessage('success', 'Xác nhận trả phòng thành công!');
    } catch (err: unknown) {
      console.error('Lỗi trả phòng:', err);
      triggerMessage('error', (err as Error).message || 'Có lỗi xảy ra khi trả phòng.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnlinePayment = async (provider: 'vnpay' | 'zalopay') => {
    if (!booking) return;
    setIsProcessing(true);
    try {
      const paymentUrl = provider === 'vnpay'
        ? await paymentService.createVNPayUrl({ bookingId: booking.bookingId })
        : await paymentService.createZaloPayUrl({ bookingId: booking.bookingId });

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        triggerMessage('error', 'Không khởi tạo được liên kết thanh toán.');
      }
    } catch (err: unknown) {
      console.error(`Lỗi thanh toán ${provider}:`, err);
      triggerMessage('error', (err as Error).message || 'Có lỗi xảy ra khi tạo liên kết thanh toán.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStatusBadge = (status: string, paymentStatus: string) => {
    const normalizeStatus = status ? status.trim().toLowerCase() : 'pending';
    const normalizePayment = paymentStatus ? paymentStatus.trim().toLowerCase() : 'unpaid';

    switch (normalizeStatus) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Clock className="h-3.5 w-3.5" /> Chờ thanh toán
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã thanh toán
          </span>
        );
      case 'completed':
      case 'settled':
      case 'settlementpending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã trải nghiệm
          </span>
        );
      case 'checkedin':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
            <LogIn className="h-3.5 w-3.5" /> Đang trải nghiệm
          </span>
        );
      case 'checkedout':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã trả phòng
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-700">
            <XCircle className="h-3.5 w-3.5" /> Đã hủy bỏ
          </span>
        );
      case 'noshow':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
            <AlertCircle className="h-3.5 w-3.5" /> Không nhận phòng
          </span>
        );
      default:
        if (normalizePayment === 'paid') {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Đã thanh toán
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-secondary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
            <Clock className="h-3.5 w-3.5" /> Chờ thanh toán
          </span>
        );
    }
  };

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-hidden bg-background px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-64 bg-surface-container-low pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div data-lookup-animate className="mb-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Dịch vụ khách hàng vãng lai & thành viên
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Tra Cứu Hành Trình
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-surface-variant">
            Xem lại chi tiết phòng khách sạn hoặc vé máy bay đã đặt, thực hiện thanh toán trực tuyến hoặc hủy hành trình mà không cần đăng nhập.
          </p>
        </div>

        <div data-lookup-animate className="mb-10 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-[0_20px_50px_rgba(28,28,25,0.07)] sm:p-8">
          <form onSubmit={handleLookup} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="bookingCode" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Mã đặt chỗ
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    id="bookingCode"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    placeholder="WVN-XXXXXX"
                    className="block w-full rounded-lg border border-outline-variant/60 bg-surface-container-low py-3 pl-10 pr-4 font-mono text-sm uppercase tracking-wider text-primary placeholder:text-on-surface-variant/50 transition-all focus:border-secondary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/15"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Email liên hệ
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@wandervn.com"
                    className="block w-full rounded-lg border border-outline-variant/60 bg-surface-container-low py-3 pl-10 pr-4 text-sm text-primary placeholder:text-on-surface-variant/50 transition-all focus:border-secondary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary/15"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-xs font-semibold uppercase tracking-widest text-on-primary shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang kết nối hệ thống...
                </>
              ) : (
                <>
                  Bắt đầu tra cứu hành trình
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {booking && (
          <div ref={resultRef} className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_24px_60px_rgba(28,28,25,0.08)]">
            <div className="flex flex-col justify-between gap-4 border-b border-outline-variant/35 bg-surface-container-lowest px-6 py-7 sm:flex-row sm:items-center sm:px-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Kết quả tra cứu đơn đặt</span>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-primary">Hành Trình Chi Tiết</h2>
                  <span className="rounded-full border border-outline-variant/50 bg-surface-container-low px-3 py-1 font-mono text-xs font-bold text-on-surface-variant">
                    {booking.bookingCode}
                  </span>
                </div>
              </div>
              <div>{renderStatusBadge(booking.status, booking.paymentStatus)}</div>
            </div>

            <div className="space-y-8 p-6 sm:p-8">
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Thông tin dịch vụ</h3>

                {booking.serviceType === 'Hotel' ? (
                  <div className="grid gap-6 rounded-xl border border-outline-variant/35 bg-surface-container-lowest p-5 shadow-sm md:grid-cols-[150px_1fr_auto] md:items-center">
                    <div className="h-36 overflow-hidden rounded-lg border border-outline-variant/35 bg-surface-container-low">
                      {booking.hotelImage ? (
                        <img
                          src={booking.hotelImage}
                          alt={booking.hotelName || 'Hotel'}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-on-surface-variant">
                          <HotelIcon className="h-6 w-6 opacity-60" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Không có ảnh</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
                        <HotelIcon className="h-3.5 w-3.5" /> Đặt phòng khách sạn
                      </div>
                      <h4 className="text-2xl font-bold text-primary">{booking.hotelName}</h4>
                      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-on-surface-variant">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 text-secondary" /> {booking.hotelAddress || 'Địa chỉ đang được cập nhật'}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Hạng phòng: <span className="rounded-full bg-surface-container-low px-3 py-1 font-bold text-primary">{booking.roomTypeName || 'Tiêu chuẩn'}</span>
                      </p>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-1">
                      <div className="rounded-lg bg-surface-container-low p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nhận phòng</p>
                        <p className="mt-1 flex items-center gap-1 font-bold text-primary"><Calendar className="h-4 w-4 text-secondary" /> {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('vi-VN') : '---'}</p>
                      </div>
                      <div className="rounded-lg bg-surface-container-low p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Trả phòng</p>
                        <p className="mt-1 flex items-center gap-1 font-bold text-primary"><Calendar className="h-4 w-4 text-secondary" /> {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('vi-VN') : '---'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 rounded-xl border border-outline-variant/35 bg-surface-container-lowest p-5 shadow-sm sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                      <Plane className="h-6 w-6" />
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
                        <Plane className="h-3.5 w-3.5" /> Đặt vé máy bay trực tuyến
                      </div>
                      <h4 className="text-xl font-bold text-primary">Chuyến Bay WanderVN</h4>
                      <p className="text-xs text-on-surface-variant">Danh sách hành khách bay: <span className="font-semibold text-primary">{booking.passengerNames || 'Chưa cập nhật'}</span></p>
                    </div>
                  </div>
                )}
              </section>

              <section className="grid grid-cols-1 gap-6 border-t border-outline-variant/30 pt-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Thông tin người đặt chỗ</h3>
                  <div className="space-y-3 rounded-xl border border-outline-variant/35 bg-surface-container-low p-4 text-sm text-on-surface-variant">
                    <div className="flex items-center gap-2"><User className="h-4 w-4 shrink-0 text-secondary" /><span>Họ tên: <strong className="text-primary">{booking.customerName || 'Khách vãng lai'}</strong></span></div>
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-secondary" /><span>Email: <strong className="text-primary">{booking.email}</strong></span></div>
                    {booking.customerPhone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-secondary" /><span>SĐT: <strong className="text-primary">{booking.customerPhone}</strong></span></div>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Chi tiết giao dịch</h3>
                  <div className="flex min-h-[118px] flex-col justify-center rounded-xl border border-outline-variant/35 bg-surface-container-low p-4">
                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"><CreditCard className="h-4 w-4 text-secondary" /> Tổng giá trị đơn đặt</span>
                    <div className="mt-1 flex items-baseline gap-1 text-3xl font-black text-primary">
                      {booking.totalPrice?.toLocaleString('vi-VN')}
                      <span className="text-xs font-bold text-on-surface-variant">VND</span>
                    </div>
                    <span className="mt-1 font-mono text-[9px] text-on-surface-variant">Khởi tạo ngày: {new Date(booking.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant/35 bg-surface-container-low px-6 py-5 sm:flex-row sm:px-8">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Mã bảo mật: {booking.bookingId}WVN</span>

              <div className="flex w-full flex-wrap justify-end gap-3 sm:w-auto">
                {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                  <button onClick={handleCancelBooking} disabled={isProcessing} className="flex-1 rounded-lg border border-rose-200 bg-surface-container-lowest px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-700 shadow-sm transition-all hover:bg-rose-50 disabled:opacity-50 sm:flex-none">
                    {isProcessing ? 'Đang xử lý...' : 'Hủy đặt chỗ'}
                  </button>
                )}

                {booking.status === 'Confirmed' && booking.serviceType === 'Hotel' && (
                  <button onClick={handleCheckOut} disabled={isProcessing} className="flex-1 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-on-primary shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50 sm:flex-none">
                    {isProcessing ? 'Đang xử lý...' : 'Xác nhận trả phòng'}
                  </button>
                )}

                {booking.status === 'Pending' && booking.paymentStatus === 'Unpaid' && (
                  <div className="flex w-full gap-2 sm:w-auto">
                    <button onClick={() => handleOnlinePayment('vnpay')} disabled={isProcessing} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-4 py-2.5 text-xs font-bold text-primary shadow-sm transition-all hover:bg-surface-container-low disabled:opacity-50 sm:flex-none" title="Thanh toán qua cổng VNPay">
                      <img src={vnpayLogo} alt="VNPay" className="h-4 w-auto object-contain" /> VNPay
                    </button>
                    <button onClick={() => handleOnlinePayment('zalopay')} disabled={isProcessing} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-4 py-2.5 text-xs font-bold text-primary shadow-sm transition-all hover:bg-surface-container-low disabled:opacity-50 sm:flex-none" title="Thanh toán qua ví ZaloPay">
                      <img src={zalopayLogo} alt="ZaloPay" className="h-4 w-auto object-contain" /> ZaloPay
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
