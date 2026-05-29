import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hotelService } from '../../services/client/hotelService'; 
import type { HotelBookingHistoryDto } from '../../types'; 
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  ChevronRight,
  Loader2,
  ShoppingBag,
  LogIn,
  RefreshCw
} from 'lucide-react';

type TabStatus = 'all' | 'upcoming' | 'completed' | 'cancelled';

export const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<HotelBookingHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Dùng để click tải lại dữ liệu nhanh
  
  const navigate = useNavigate();

  // Lấy userId an toàn từ localStorage (Đảm bảo ép chuẩn kiểu số nguyên)
  const userIdRaw = localStorage.getItem('userId');
  const currentUserId = userIdRaw ? parseInt(userIdRaw, 10) : null;

  useEffect(() => {
    // 1. Kiểm tra xem người dùng đã đăng nhập chưa
    if (!currentUserId) return;

    const loadBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await hotelService.getMyHotelBookings(currentUserId);

        if (!data || !Array.isArray(data)) {
          console.warn("Dữ liệu API trả về không đúng định dạng mảng:", data);
          setBookings([]);
          return;
        }

        console.log("Danh sách đơn đặt phòng tải về thành công:", data);

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

  // Bộ lọc Tab phân loại trạng thái hành trình theo thời gian thực tế
  const filteredBookings = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const safeBookings = Array.isArray(bookings) ? bookings : [];

    if (activeTab === 'upcoming') {
      return safeBookings.filter(b =>
        b.status !== 'Cancelled' &&
        b.checkInDate &&
        new Date(b.checkInDate).getTime() >= today
      );
    }

    if (activeTab === 'completed') {
      return safeBookings.filter(b =>
        b.status === 'Completed' ||
        (b.status === 'Confirmed' && b.checkOutDate && new Date(b.checkOutDate).getTime() < today)
      );
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
                  {tab === 'upcoming' && safeBookings.filter(b => b.status !== 'Cancelled' && b.checkInDate && new Date(b.checkInDate).getTime() >= new Date().setHours(0,0,0,0)).length}
                  {tab === 'completed' && safeBookings.filter(b => b.status === 'Completed' || (b.status === 'Confirmed' && b.checkOutDate && new Date(b.checkOutDate).getTime() < new Date().setHours(0,0,0,0))).length}
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
              <div 
                key={booking.bookingId || index}
                className="group border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 transition-all duration-300 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 limestone-shadow"
              >
                <div className="md:col-span-3 h-48 md:h-full overflow-hidden relative bg-surface-container-low">
                  <img 
                    src={booking.hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'} 
                    alt={booking.hotelName || 'Khách sạn WanderVN'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                </div>

                <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderStatusBadge(booking.status, booking.checkInDate)}
                      <span className="text-[11px] font-mono font-bold text-on-surface-variant/80 px-2 py-0.5 bg-neutral-100 border rounded">
                        Mã đơn: {booking.bookingCode || 'N/A'}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-primary leading-snug group-hover:text-secondary transition-colors">
                      {booking.hotelName || 'Hệ thống Khách sạn Cao Cấp'}
                    </h3>

                    <p className="text-xs text-on-surface-variant flex items-center gap-1 text-neutral-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#B59A5A]" /> {booking.hotelAddress || 'Địa chỉ đang được cập nhật'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-neutral-500 block">Ngày nhận phòng:</span>
                      <span className="font-semibold text-on-surface flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-secondary" /> {booking.checkInDate || 'Chưa định ngày'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-neutral-500 block">Ngày trả phòng:</span>
                      <span className="font-semibold text-on-surface flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-secondary" /> {booking.checkOutDate || 'Chưa định ngày'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 p-6 bg-neutral-50/50 border-t md:border-t-0 md:border-l border-neutral-100 flex flex-row md:flex-col justify-between md:justify-center md:items-center items-baseline gap-4">
                  <div className="md:text-center space-y-0.5 w-full">
                    <span className="text-[11px] text-neutral-500 block uppercase tracking-wider font-bold">
                      Hạng phòng: <span className="text-neutral-800 normal-case font-semibold">{booking.roomTypeName || 'Tiêu chuẩn'}</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 block mt-2">Tổng chi phí chuyến đi:</span>
                    <div className="text-xl font-bold text-red-600">
                      {booking.totalPrice ? booking.totalPrice.toLocaleString('vi-VN') : '0'} VND
                    </div>
                  </div>

                  {/* 🔔 THAY ĐỔI TẠI ĐÂY: Chuyển sang nút "XEM CHI TIẾT" và trỏ link chuẩn */}
                  <Link
                    to={`/booking-history/${booking.bookingId}`}
                    className="md:w-full py-2.5 px-4 bg-white hover:bg-primary hover:text-white border border-primary text-primary font-semibold text-xs tracking-wider uppercase rounded flex items-center justify-center gap-1 transition-all whitespace-nowrap"
                  >
                    Xem chi tiết <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

              </div>
            ))}
          </div> 
        )}
      </div>
    </div>
  );
};

export default BookingHistory;