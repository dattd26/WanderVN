import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { hotelService } from '../../services/client/hotelService'; 
import type { BookingHistoryDto } from '../../types'; 
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShoppingBag,
  LogIn,
  RefreshCw
} from 'lucide-react';
import { HotelBookingCard } from './components/HotelBookingCard';
import { FlightBookingCard } from './components/FlightBookingCard';

type TabStatus = 'all' | 'upcoming' | 'completed' | 'cancelled';

export const BookingHistory: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [bookings, setBookings] = useState<BookingHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); 
  
  const navigate = useNavigate();

  const userIdRaw = localStorage.getItem('userId');
  const currentUserId = userIdRaw ? parseInt(userIdRaw, 10) : null;

  useEffect(() => {
    if (!currentUserId) return;

    const loadBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await hotelService.getMyHotelBookings();

        if (!data || !Array.isArray(data)) {
          console.warn('Dữ liệu API trả về không đúng định dạng mảng:', data);
          setBookings([]);
          return;
        }

        const sortedData = [...data].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setBookings(sortedData);
      } catch (err) {
        console.error('Lỗi kết nối API lấy lịch sử đặt phòng:', err);
        const message = err instanceof Error ? err.message : 'Không thể tải lịch sử đơn đặt.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [currentUserId, refreshKey]);

  const getCheckInDate = (b: BookingHistoryDto): string => {
    return b.serviceType === 'Flight' ? b.flightDetails?.depTime || '' : b.hotelDetails?.checkInDate || '';
  };

  const getCheckOutDate = (b: BookingHistoryDto): string => {
    return b.serviceType === 'Flight' ? b.flightDetails?.arrTime || '' : b.hotelDetails?.checkOutDate || '';
  };

  const filteredBookings = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const safeBookings = Array.isArray(bookings) ? bookings : [];

    if (activeTab === 'upcoming') {
      return safeBookings.filter(b => {
        const checkIn = getCheckInDate(b);
        const norm = b.status ? b.status.trim().toLowerCase() : '';
        return (norm === 'confirmed' || norm === 'pending') && checkIn && new Date(checkIn).getTime() >= today;
      });
    }

    if (activeTab === 'completed') {
      return safeBookings.filter(b => {
        const checkOut = getCheckOutDate(b);
        const norm = b.status ? b.status.trim().toLowerCase() : '';
        return (
          norm === 'completed' ||
          norm === 'checkedout' ||
          norm === 'settlementpending' ||
          norm === 'settled' ||
          norm === 'checkedin' ||
          norm === 'noshow' ||
          (norm === 'confirmed' && checkOut && new Date(checkOut).getTime() < today)
        );
      });
    }

    if (activeTab === 'cancelled') {
      return safeBookings.filter(b => {
        const norm = b.status ? b.status.trim().toLowerCase() : '';
        return norm === 'cancelled';
      });
    }

    return safeBookings;
  }, [activeTab, bookings]);

  const tabCounts = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    
    return {
      all: safeBookings.length,
      upcoming: safeBookings.filter(b => {
        const checkIn = getCheckInDate(b);
        const norm = b.status ? b.status.trim().toLowerCase() : '';
        return (norm === 'confirmed' || norm === 'pending') && checkIn && new Date(checkIn).getTime() >= today;
      }).length,
      completed: safeBookings.filter(b => {
        const checkOut = getCheckOutDate(b);
        const norm = b.status ? b.status.trim().toLowerCase() : '';
        return (
          norm === 'completed' ||
          norm === 'checkedout' ||
          norm === 'settlementpending' ||
          norm === 'settled' ||
          norm === 'checkedin' ||
          norm === 'noshow' ||
          (norm === 'confirmed' && checkOut && new Date(checkOut).getTime() < today)
        );
      }).length,
      cancelled: safeBookings.filter(b => {
        const norm = b.status ? b.status.trim().toLowerCase() : '';
        return norm === 'cancelled';
      }).length
    };
  }, [bookings]);

  useEffect(() => {
    if (loading || !currentUserId || !pageRef.current) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        isDesktop: '(min-width: 768px)'
      },
      (context) => {
        const { reduceMotion, isDesktop } = context.conditions ?? {};
        const targets = pageRef.current?.querySelectorAll('[data-booking-animate]');
        if (!targets?.length) return;

        if (reduceMotion) {
          gsap.set(targets, { autoAlpha: 1, y: 0 });
          return;
        }

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: isDesktop ? 18 : 10 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: 'power2.out',
            stagger: 0.07,
            overwrite: 'auto'
          }
        );
      }
    );

    return () => mm.revert();
  }, [activeTab, filteredBookings.length, loading, currentUserId]);

  const renderStatusBadge = (status: string | undefined, checkInDate: string) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const isUpcoming = checkInDate ? new Date(checkInDate).getTime() >= today : true;
    const normalizeStatus = status ? status.trim().toLowerCase() : 'pending';

    switch (normalizeStatus) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <Clock className="h-3.5 w-3.5" /> Chờ thanh toán
          </span>
        );
      case 'confirmed':
        return isUpcoming ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Sắp diễn ra
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã hoàn thành
          </span>
        );
      case 'completed':
      case 'settled':
      case 'settlementpending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã hoàn thành
          </span>
        );
      case 'checkedin':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            <LogIn className="h-3.5 w-3.5" /> Đang trải nghiệm
          </span>
        );
      case 'checkedout':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đã trả phòng
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
            <XCircle className="h-3.5 w-3.5" /> Đã hủy bỏ
          </span>
        );
      case 'noshow':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <AlertCircle className="h-3.5 w-3.5" /> Không nhận phòng
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
            <Clock className="h-3.5 w-3.5" /> {status || 'Chờ duyệt'}
          </span>
        );
    }
  };

  if (!currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 pb-24 pt-32">
        <div className="w-full max-w-md rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-8 text-center limestone-shadow">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-secondary" />
          <h2 className="mb-2 text-2xl font-bold text-primary">Vui lòng đăng nhập</h2>
          <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
            Bạn cần đăng nhập bằng tài khoản thành viên để xem nhật ký hành trình và lịch sử đặt phòng của mình.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-on-primary transition-all hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4" /> Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-secondary" />
        <p className="text-sm italic text-on-surface-variant animate-pulse">
          Đang kết nối kho dữ liệu lưu trữ hoàng gia...
        </p>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-background px-4 pb-24 pt-32 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div data-booking-animate className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Nhật ký hành trình cá nhân
            </span>
            <h1 className="mt-1 text-3xl font-bold text-primary md:text-5xl">
              Lịch Sử Đặt Phòng
            </h1>
          </div>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="self-start rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-4 py-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-all hover:border-primary/40 hover:text-primary"
          >
            <span className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5" /> Làm mới dữ liệu</span>
          </button>
        </div>

        {error && (
          <div data-booking-animate className="mb-8 flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div data-booking-animate className="mb-8 flex gap-2 overflow-x-auto rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-2 limestone-shadow">
          {(['all', 'upcoming', 'completed', 'cancelled'] as TabStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-lg px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              {tab === 'all' && 'Tất cả đơn đặt'}
              {tab === 'upcoming' && 'Sắp đi'}
              {tab === 'completed' && 'Đã trải nghiệm'}
              {tab === 'cancelled' && 'Đã hủy bỏ'}
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === tab ? 'bg-white/15 text-on-primary' : 'bg-outline-variant/40 text-on-surface-variant'}`}>
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div data-booking-animate className="rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-lowest py-20 text-center limestone-shadow">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-outline opacity-70" />
            <h3 className="mb-1 text-xl font-bold text-primary">Chưa có dữ liệu hành trình</h3>
            <p className="mb-6 text-sm text-on-surface-variant">Bạn chưa có đơn đặt phòng nào thuộc danh mục lọc này.</p>
            <Link to="/stays" className="inline-block rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-primary transition-all hover:bg-primary/90">
              Khám phá điểm đến di sản mới
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking, index) => (
              <div data-booking-animate key={booking.bookingId || index}>
                {booking.serviceType === 'Flight' ? (
                  <FlightBookingCard booking={booking} renderStatusBadge={renderStatusBadge} />
                ) : (
                  <HotelBookingCard booking={booking} renderStatusBadge={renderStatusBadge} />
                )}
              </div>
            ))}
          </div> 
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
