import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronRight, Hotel } from 'lucide-react';
import type { BookingHistoryDto } from '../../../types';

interface HotelBookingCardProps {
  booking: BookingHistoryDto;
  renderStatusBadge: (status: string | undefined, checkInDate: string) => React.ReactNode;
}

export const HotelBookingCard: React.FC<HotelBookingCardProps> = ({ booking, renderStatusBadge }) => {
  const details = booking.hotelDetails;

  return (
    <div className="group grid grid-cols-1 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_18px_45px_rgba(28,28,25,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 md:grid-cols-12">
      <div className="relative h-48 overflow-hidden bg-surface-container-low md:col-span-3 md:h-full">
        <img 
          src={details?.hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'} 
          alt={details?.hotelName || 'Khách sạn WanderVN'}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent md:hidden" />
      </div>

      <div className="flex flex-col justify-between space-y-5 p-6 md:col-span-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {renderStatusBadge(booking.status, details?.checkInDate || '')}
            <span className="rounded-full border border-outline-variant/50 bg-surface-container-low px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Mã đơn: {booking.bookingCode || 'N/A'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-secondary">
              <Hotel className="h-3 w-3" /> Khách sạn
            </span>
          </div>
          
          <h3 className="text-lg font-bold leading-snug text-primary transition-colors group-hover:text-secondary">
            {details?.hotelName || 'Hệ thống Khách sạn Cao Cấp'}
          </h3>

          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-on-surface-variant">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" /> {details?.hotelAddress || 'Địa chỉ đang được cập nhật'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-outline-variant/30 pt-4 text-xs sm:grid-cols-2">
          <div className="rounded-lg bg-surface-container-low p-3">
            <span className="block font-semibold uppercase tracking-wider text-on-surface-variant">Ngày nhận phòng</span>
            <span className="mt-1 flex items-center gap-1 font-semibold text-on-surface">
              <Calendar className="h-3.5 w-3.5 text-secondary" /> {details?.checkInDate || 'Chưa định ngày'}
            </span>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3">
            <span className="block font-semibold uppercase tracking-wider text-on-surface-variant">Ngày trả phòng</span>
            <span className="mt-1 flex items-center gap-1 font-semibold text-on-surface">
              <Calendar className="h-3.5 w-3.5 text-secondary" /> {details?.checkOutDate || 'Chưa định ngày'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-end justify-between gap-4 border-t border-outline-variant/30 bg-surface-container-low p-6 md:col-span-3 md:flex-col md:items-stretch md:justify-center md:border-l md:border-t-0">
        <div className="space-y-2 md:text-center">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Hạng phòng
          </span>
          <span className="inline-flex rounded-full bg-surface-container-lowest px-3 py-1 text-xs font-semibold text-primary">
            {details?.roomTypeName || 'Tiêu chuẩn'}
          </span>
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">Tổng chi phí</span>
            <div className="text-xl font-black text-primary">
              {booking.totalPrice ? booking.totalPrice.toLocaleString('vi-VN') : '0'} <span className="text-xs font-bold text-on-surface-variant">VND</span>
            </div>
          </div>
        </div>

        <Link
          to={`/booking-history/${booking.bookingId}`}
          className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-primary bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-primary transition-all hover:bg-primary/90 md:w-full"
        >
          Xem chi tiết <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
