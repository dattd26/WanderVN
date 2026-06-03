import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hotelService } from '../../services/client/hotelService'; 
import type { BookingHistoryDto } from '../../types'; 
import {
  Calendar,
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
          console.warn("Dữ liệu API trả về không đúng định dạng mảng:", data);
          setBookings([]);
          return;
        }

        console.log("Danh sách đơn đặt hàng tải về thành công:", data);

        const sortedData = [...data].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setBookings(sortedData);
      } catch (err) {
        console.error('Lỗi kết nối API lấy lịch sử đặt phòng:', err);
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc Server Backend C#.');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [currentUserId, refreshKey]);

  // Helper getters to resolve checkIn/checkOut date nested structure
  const getCheckInDate = (b: BookingHistoryDto): string => {
    return b.serviceType === 'Flight' ? b.flightDetails?.depTime || '' : b.hotelDetails?.checkInDate || '';
  };

  const getCheckOutDate = (b: BookingHistoryDto): string => {
    return b.serviceType === 'Flight' ? b.flightDetails?.arrTime || '' : b.hotelDetails?.checkOutDate || '';
  };

  // Bộ lọc Tab phân loại trạng thái hành trình theo thời gian thực tế
  const filteredBookings = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const safeBookings = Array.isArray(bookings) ? bookings : [];

    if (activeTab === 'upcoming') {
      return safeBookings.filter(b => {
        const checkIn = getCheckInDate(b);
        return (
          b.status !== 'Cancelled' &&
          checkIn &&
          new Date(checkIn).getTime() >= today
        );
      });
    }

    if (activeTab === 'completed') {
      return safeBookings.filter(b => {
        const checkOut = getCheckOutDate(b);
        return (
          b.status === 'Completed' ||
          (b.status === 'Confirmed' && checkOut && new Date(checkOut).getTime() < today)
        );
      });
    }

    if (activeTab === 'cancelled') {
      return safeBookings.filter(b => b.status === 'Cancelled');
    }

    return safeBookings;
  }, [activeTab, bookings]);

  // Hàm helper định dạng trạng thái Badge trực quan
  const renderStatusBadge = (status: string | undefined, checkInDate: string) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const isUpcoming = checkInDate ? new Date(checkInDate).getTime() >= today : true;
    const normalizeStatus = status ? status.trim().toLowerCase() : 'pending';

    if (normalizeStatus === 'confirmed' || normalizeStatus === 'approved') {
      return isUpcoming ? (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-xs font-semibold rounded-full uppercase tracking-wider">
          <CheckCircle2 className="h-3.5 w-3.5" /> Sắp diễn ra
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold rounded-full uppercase tracking-wider">
          <CheckCircle2 className="h-3.5 w-3.5" /> Đã hoàn thành
        </span>
      );
    }

    if (normalizeStatus === 'completed' || normalizeStatus === 'success') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold rounded-full uppercase tracking-wider">
          <CheckCircle2 className="h-3.5 w-3.5" /> Đã hoàn thành
        </span>
      );
    }

    if (normalizeStatus === 'cancelled' || normalizeStatus === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-semibold rounded-full uppercase tracking-wider">
          <XCircle className="h-3.5 w-3.5" /> Đã hủy bỏ
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider">
        <Clock className="h-3.5 w-3.5" /> Đã thanh toán / Chờ duyệt
      </span>
    );
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-background pb-24 pt-32 px-4 flex items-center justify-center">
        <div className="text-center p-8 border border-outline-variant/30 rounded-xl bg-surface-container-lowest max-w-md w-full limestone-shadow">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold text-primary mb-2">Vui lòng đăng nhập</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Bạn cần đăng nhập bằng tài khoản thành viên để xem nhật ký hành trình và lịch sử đặt phòng của mình.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary font-semibold text-sm tracking-wider uppercase rounded hover:bg-primary/90 transition-all"
          >
            <LogIn className="h-4 w-4" /> Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="h-10 w-10 text-secondary animate-spin" />
        <p className="text-sm text-on-surface-variant italic animate-pulse">
          Đang kết nối kho dữ liệu lưu trữ hoàng gia...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
              Nhật ký hành trình cá nhân
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-primary mt-1">
              Lịch Sử Đặt Phòng
            </h1>
          </div>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="self-start flex items-center gap-2 px-4 py-2 text-xs border border-outline-variant/50 rounded-md hover:bg-surface-container-low text-on-surface-variant transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Làm mới dữ liệu
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex border-b border-outline-variant/30 mb-8 overflow-x-auto scrollbar-none">
          {(['all', 'upcoming', 'completed', 'cancelled'] as TabStatus[]).map((tab) => {
            const safeBookings = Array.isArray(bookings) ? bookings : [];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 px-6 text-xs uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'border-primary text-primary bg-surface-container-lowest/50'
                    : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab === 'all' && 'Tất cả đơn đặt'}
                {tab === 'upcoming' && 'Sắp đi'}
                {tab === 'completed' && 'Đã trải nghiệm'}
                {tab === 'cancelled' && 'Đã hủy bỏ'}
                <span className="ml-2 text-[10px] opacity-70 bg-outline-variant/40 px-1.5 py-0.5 rounded-full">
                  {tab === 'all' && safeBookings.length}
                  {tab === 'upcoming' && safeBookings.filter(b => b.status !== 'Cancelled' && getCheckInDate(b) && new Date(getCheckInDate(b)).getTime() >= new Date().setHours(0,0,0,0)).length}
                  {tab === 'completed' && safeBookings.filter(b => b.status === 'Completed' || (b.status === 'Confirmed' && getCheckOutDate(b) && new Date(getCheckOutDate(b)).getTime() < new Date().setHours(0,0,0,0))).length}
                  {tab === 'cancelled' && safeBookings.filter(b => b.status === 'Cancelled').length}
                </span>
              </button>
            );
          })}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-outline-variant/40 rounded-lg bg-surface-container-lowest">
            <ShoppingBag className="h-12 w-12 text-outline mx-auto mb-4 opacity-50 text-neutral-400" />
            <h3 className="text-xl text-primary font-bold mb-1">Chưa có dữ liệu hành trình</h3>
            <p className="text-sm text-on-surface-variant mb-6">Bạn chưa có đơn đặt phòng nào thuộc danh mục lọc này.</p>
            <Link to="/stays" className="inline-block px-6 py-2.5 bg-primary text-on-primary font-semibold text-xs tracking-wider uppercase rounded hover:bg-primary/95 transition-all">
              Khám phá điểm đến di sản mới
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking, index) => (
              booking.serviceType === 'Flight' ? (
                <FlightBookingCard 
                  key={booking.bookingId || index}
                  booking={booking}
                  renderStatusBadge={renderStatusBadge}
                />
              ) : (
                <HotelBookingCard 
                  key={booking.bookingId || index}
                  booking={booking}
                  renderStatusBadge={renderStatusBadge}
                />
              )
            ))}
          </div> 
        )}
      </div>
    </div>
  );
};

export default BookingHistory;