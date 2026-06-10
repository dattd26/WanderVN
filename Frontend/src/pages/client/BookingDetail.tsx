import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Plane, Clock, User, Calendar, CreditCard, ChevronLeft, MapPin, Building2, AlertCircle, Loader2 } from 'lucide-react';
import type { BookingHistoryDto } from '../../types';
import { request } from '../../services/shared/apiClient';
import { normalizeBookingData, type RawBookingData } from '../../utils/bookingUtils';

export default function BookingDetail() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { bookingId } = useParams(); 
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingHistoryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBookingDetail = async () => {
      try {
        setLoading(true);
        const data = await request<RawBookingData>(`/bookings/${bookingId}`);
        setBooking(normalizeBookingData(data));
      } catch (error) {
        console.error('Lỗi lấy chi tiết:', error);
        setError(error instanceof Error ? error.message : 'Không thể tải thông tin đơn đặt hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetail();
  }, [bookingId]);

  useEffect(() => {
    if (loading || !booking || !pageRef.current) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        isDesktop: '(min-width: 768px)'
      },
      (context) => {
        const { reduceMotion, isDesktop } = context.conditions ?? {};
        const targets = pageRef.current?.querySelectorAll('[data-detail-animate]');
        if (!targets?.length) return;

        if (reduceMotion) {
          gsap.set(targets, { autoAlpha: 1, y: 0 });
          return;
        }

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: isDesktop ? 20 : 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: 'power2.out',
            stagger: 0.08,
            overwrite: 'auto'
          }
        );
      }
    );

    return () => mm.revert();
  }, [booking, loading]);

  const handleCancelBooking = async () => {
    const serviceName = booking?.serviceType === 'Flight' ? 'vé máy bay' : 'phòng khách sạn';
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn đặt ${serviceName} này không?`)) return;
    
    try {
      setIsProcessing(true);
      await request(`/bookings/${bookingId}/cancel`, { method: 'PUT' });
      setBooking(prev => prev ? { ...prev, status: 'Cancelled' } : null);
      alert(`Hủy ${serviceName} thành công!`);
    } catch (error) {
      console.error('Lỗi hủy đơn:', error);
      alert(error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!window.confirm('Xác nhận bạn đã trả phòng và kết thúc hành trình?')) return;
    
    try {
      setIsProcessing(true);
      await request(`/bookings/${bookingId}/checkout`, { method: 'PUT' });
      setBooking(prev => prev ? { ...prev, status: 'Completed' } : null);
      alert('Xác nhận trả phòng thành công!');
    } catch (error) {
      console.error('Lỗi xác nhận trả phòng:', error);
      alert(error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-700">Đã hoàn thành</span>;
      case 'Cancelled': return <span className="rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-700">Đã hủy</span>;
      case 'Paid': return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">Đã thanh toán</span>;
      default: return <span className="rounded-full border border-secondary/25 bg-secondary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-secondary">Đang xử lý</span>;
    }
  };

  if (!bookingId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex max-w-md items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" /> Không tìm thấy mã hóa đơn hợp lệ trên đường dẫn.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" /> Đang tìm kiếm hành trình...
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex max-w-md items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error || 'Hóa đơn không tồn tại.'}
        </div>
      </div>
    );
  }

  const isFlight = booking.serviceType === 'Flight';

  return (
    <div ref={pageRef} className="min-h-screen bg-background px-4 pb-16 pt-32 text-on-surface sm:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_24px_60px_rgba(28,28,25,0.08)]">
        <div data-detail-animate className="border-b border-outline-variant/35 bg-surface-container-lowest p-6 sm:p-8">
          <button 
            onClick={() => navigate('/booking-history')} 
            className="mb-6 inline-flex items-center gap-1 rounded-lg border border-outline-variant/50 bg-surface-container-low px-3 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" /> Quay lại lịch sử
          </button>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                {isFlight ? 'Nhật ký chuyến bay' : 'Nhật ký lưu trú'}
              </span>
              <h1 className="mt-2 text-3xl font-bold text-primary">Chi Tiết Đơn Đặt</h1>
              <p className="mt-1 text-xs text-on-surface-variant">Mã đơn: <span className="font-mono font-bold text-primary">{booking.bookingCode}</span></p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              {renderStatusBadge(booking.status)}
              <p className="text-[11px] text-on-surface-variant">Đặt ngày: {new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          {isFlight ? (
            <>
              <section data-detail-animate className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Thông tin chuyến bay</h2>
                <div className="grid gap-6 rounded-xl border border-outline-variant/35 bg-surface-container-lowest p-5 shadow-sm md:grid-cols-[140px_1fr_auto] md:items-center">
                  <div className="flex h-32 items-center justify-center rounded-lg border border-outline-variant/35 bg-surface-container-low p-3">
                    {booking.flightDetails?.airlineLogo ? (
                      <img src={booking.flightDetails.airlineLogo} alt={booking.flightDetails.airlineName} className="max-h-full w-full object-contain" />
                    ) : (
                      <Plane className="h-10 w-10 text-outline" />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        <Plane className="h-3.5 w-3.5" /> Chuyến bay {booking.flightDetails?.flightNumber || 'WVN'}
                      </span>
                      <h3 className="mt-2 text-2xl font-bold text-primary">{booking.flightDetails?.airlineName}</h3>
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-outline-variant/30 bg-surface-container-low p-4 text-sm text-on-surface-variant">
                      <div className="text-center">
                        <span className="block text-lg font-bold text-primary">{booking.flightDetails?.depAirportCode || '---'}</span>
                        <span className="text-xs">{booking.flightDetails?.depAirportCity || 'Điểm đi'}</span>
                      </div>
                      <div className="flex flex-1 flex-col items-center px-2">
                        <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider">Bay thẳng</span>
                        <div className="relative flex w-full items-center justify-center">
                          <div className="h-px w-full bg-outline-variant" />
                          <Plane className="absolute h-4 w-4 -rotate-90 bg-surface-container-low px-0.5 text-secondary" />
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="block text-lg font-bold text-primary">{booking.flightDetails?.arrAirportCode || '---'}</span>
                        <span className="text-xs">{booking.flightDetails?.arrAirportCity || 'Điểm đến'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-1">
                    <div className="rounded-lg bg-surface-container-low p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Khởi hành</p>
                      <p className="mt-1 flex items-center gap-1.5 font-bold text-primary"><Clock className="h-4 w-4 text-secondary" /> {booking.flightDetails?.depTime || '---'}</p>
                    </div>
                    <div className="rounded-lg bg-surface-container-low p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Đến nơi</p>
                      <p className="mt-1 flex items-center gap-1.5 font-bold text-primary"><Clock className="h-4 w-4 text-secondary" /> {booking.flightDetails?.arrTime || '---'}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section data-detail-animate className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Danh sách hành khách</h2>
                <div className="overflow-hidden rounded-xl border border-outline-variant/35 bg-surface-container-lowest shadow-sm">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant/35 bg-surface-container-low text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        <th className="p-4">#</th>
                        <th className="p-4">Hành khách</th>
                        <th className="p-4">Số hộ chiếu</th>
                        <th className="p-4 text-right">Số ghế</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.flightDetails?.passengers && booking.flightDetails.passengers.length > 0 ? (
                        booking.flightDetails.passengers.map((pax, i) => (
                          <tr key={i} className="border-b border-outline-variant/20 transition-colors hover:bg-surface-container-low/60">
                            <td className="p-4 font-medium text-on-surface-variant">{i + 1}</td>
                            <td className="flex items-center gap-2 p-4 font-bold text-primary"><User className="h-4 w-4 text-secondary" /> {pax.passengerName}</td>
                            <td className="p-4 font-mono text-on-surface-variant">{pax.passportNumber || 'N/A'}</td>
                            <td className="p-4 text-right font-mono font-bold text-primary">{pax.seatNumber || 'Chưa chọn'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">Chưa cập nhật danh sách hành khách.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <section data-detail-animate className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Thông tin lưu trú</h2>
              <div className="grid gap-6 rounded-xl border border-outline-variant/35 bg-surface-container-lowest p-5 shadow-sm md:grid-cols-[150px_1fr_auto] md:items-center">
                <div className="h-36 overflow-hidden rounded-lg border border-outline-variant/35 bg-surface-container-low">
                  {booking.hotelDetails?.hotelImage ? (
                    <img src={booking.hotelDetails.hotelImage} alt={booking.hotelDetails.hotelName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">Không có ảnh</div>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                    <Building2 className="h-3.5 w-3.5" /> Đặt phòng khách sạn
                  </span>
                  <h3 className="text-2xl font-bold text-primary">{booking.hotelDetails?.hotelName}</h3>
                  <p className="flex items-start gap-1.5 text-xs leading-relaxed text-on-surface-variant"><MapPin className="mt-0.5 h-3.5 w-3.5 text-secondary" /> {booking.hotelDetails?.hotelAddress}</p>
                  <p className="text-sm text-on-surface-variant">Hạng phòng: <span className="rounded-full bg-surface-container-low px-3 py-1 font-bold text-primary">{booking.hotelDetails?.roomTypeName}</span></p>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-1">
                  <div className="rounded-lg bg-surface-container-low p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Ngày nhận phòng</p>
                    <p className="mt-1 flex items-center gap-1.5 font-bold text-primary"><Calendar className="h-4 w-4 text-secondary" /> {booking.hotelDetails?.checkInDate ? new Date(booking.hotelDetails.checkInDate).toLocaleDateString('vi-VN') : '---'}</p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Ngày trả phòng</p>
                    <p className="mt-1 flex items-center gap-1.5 font-bold text-primary"><Calendar className="h-4 w-4 text-secondary" /> {booking.hotelDetails?.checkOutDate ? new Date(booking.hotelDetails.checkOutDate).toLocaleDateString('vi-VN') : '---'}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section data-detail-animate className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Chi tiết giao dịch</h2>
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-outline-variant/35 bg-surface-container-low p-5 sm:flex-row sm:items-center">
              <p className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
                <CreditCard className="h-4 w-4 text-secondary" /> Tổng chi phí
              </p>
              <div className="text-2xl font-black text-primary">
                {booking.totalPrice?.toLocaleString('vi-VN')} <span className="text-sm font-bold text-on-surface-variant">VND</span>
              </div>
            </div>
          </section>
        </div>

        <div data-detail-animate className="flex flex-col items-center justify-between gap-4 border-t border-outline-variant/35 bg-surface-container-low px-6 py-5 sm:flex-row sm:px-8">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Trạng thái đơn được đồng bộ theo hệ thống WanderVN
          </span>
          <div className="flex w-full gap-3 sm:w-auto">
            {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
              <button 
                onClick={handleCancelBooking} 
                disabled={isProcessing} 
                className="flex-1 rounded-lg border border-rose-200 bg-surface-container-lowest px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-700 shadow-sm transition-all hover:bg-rose-50 disabled:opacity-50 sm:flex-none"
              >
                {isProcessing ? 'Đang xử lý...' : (isFlight ? 'Hủy đặt vé' : 'Hủy phòng')}
              </button>
            )}

            {!isFlight && (booking.status === 'Paid' || booking.status === 'Pending') && (
              <button 
                onClick={handleCheckOut} 
                disabled={isProcessing} 
                className="flex-1 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-on-primary shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50 sm:flex-none"
              >
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận trả phòng'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
