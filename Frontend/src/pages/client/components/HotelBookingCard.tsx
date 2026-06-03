import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import type { BookingHistoryDto } from '../../../types';

interface HotelBookingCardProps {
  booking: BookingHistoryDto;
  renderStatusBadge: (status: string | undefined, checkInDate: string) => React.ReactNode;
}

export const HotelBookingCard: React.FC<HotelBookingCardProps> = ({ booking, renderStatusBadge }) => {
  const details = booking.hotelDetails;

  return (
    <div className="group border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 transition-all duration-300 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 limestone-shadow">
      <div className="md:col-span-3 h-48 md:h-full overflow-hidden relative bg-surface-container-low">
        <img 
          src={details?.hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'} 
          alt={details?.hotelName || 'Khách sạn WanderVN'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </div>

      <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {renderStatusBadge(booking.status, details?.checkInDate || '')}
            <span className="text-[11px] font-mono font-bold text-on-surface-variant/80 px-2 py-0.5 bg-neutral-100 border rounded">
              Mã đơn: {booking.bookingCode || 'N/A'}
            </span>
            <span className="text-[11px] font-bold text-[#B59A5A] bg-[#B59A5A]/10 px-2 py-0.5 border border-[#B59A5A]/30 rounded">
              KHÁCH SẠN
            </span>
          </div>
          
          <h3 className="font-bold text-lg text-primary leading-snug group-hover:text-secondary transition-colors">
            {details?.hotelName || 'Hệ thống Khách sạn Cao Cấp'}
          </h3>

          <p className="text-xs text-on-surface-variant flex items-center gap-1 text-neutral-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#B59A5A]" /> {details?.hotelAddress || 'Địa chỉ đang được cập nhật'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100 text-xs">
          <div className="space-y-0.5">
            <span className="text-neutral-500 block">Ngày nhận phòng:</span>
            <span className="font-semibold text-on-surface flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-secondary" /> {details?.checkInDate || 'Chưa định ngày'}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-neutral-500 block">Ngày trả phòng:</span>
            <span className="font-semibold text-on-surface flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-secondary" /> {details?.checkOutDate || 'Chưa định ngày'}
            </span>
          </div>
        </div>
      </div>

      <div className="md:col-span-3 p-6 bg-neutral-50/50 border-t md:border-t-0 md:border-l border-neutral-100 flex flex-row md:flex-col justify-between md:justify-center md:items-center items-baseline gap-4">
        <div className="md:text-center space-y-0.5 w-full">
          <span className="text-[11px] text-neutral-500 block uppercase tracking-wider font-bold">
            Hạng phòng: <span className="text-neutral-800 normal-case font-semibold">{details?.roomTypeName || 'Tiêu chuẩn'}</span>
          </span>
          <span className="text-[10px] text-neutral-400 block mt-2">Tổng chi phí chuyến đi:</span>
          <div className="text-xl font-bold text-red-600">
            {booking.totalPrice ? booking.totalPrice.toLocaleString('vi-VN') : '0'} VND
          </div>
        </div>

        <Link
          to={`/booking-history/${booking.bookingId}`}
          className="md:w-full py-2.5 px-4 bg-white hover:bg-primary hover:text-white border border-primary text-primary font-semibold text-xs tracking-wider uppercase rounded flex items-center justify-center gap-1 transition-all whitespace-nowrap"
        >
          Xem chi tiết <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
