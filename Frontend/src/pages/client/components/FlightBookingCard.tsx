import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Clock, ChevronRight } from 'lucide-react';
import type { BookingHistoryDto } from '../../../types';

interface FlightBookingCardProps {
  booking: BookingHistoryDto;
  renderStatusBadge: (status: string | undefined, checkInDate: string) => React.ReactNode;
}

export const FlightBookingCard: React.FC<FlightBookingCardProps> = ({ booking, renderStatusBadge }) => {
  const details = booking.flightDetails;

  return (
    <div className="group grid grid-cols-1 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_18px_45px_rgba(28,28,25,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 md:grid-cols-12">
      <div className="flex h-48 items-center justify-center border-b border-outline-variant/30 bg-surface-container-low p-6 md:col-span-3 md:h-full md:border-b-0 md:border-r">
        <img 
          src={details?.airlineLogo || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80'} 
          alt={details?.airlineName || 'Hãng hàng không'}
          className="max-h-24 w-36 object-contain transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </div>

      <div className="flex flex-col justify-between space-y-5 p-6 md:col-span-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {renderStatusBadge(booking.status, details?.depTime || '')}
            <span className="rounded-full border border-outline-variant/50 bg-surface-container-low px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Mã đơn: {booking.bookingCode || 'N/A'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-700">
              <Plane className="h-3 w-3" /> Vé máy bay
            </span>
          </div>
          
          <h3 className="text-lg font-bold leading-snug text-primary transition-colors group-hover:text-secondary">
            {details?.airlineName || 'Hãng hàng không'} - Chuyến bay {details?.flightNumber || 'WVN'}
          </h3>

          <div className="flex items-center gap-4 pt-2 text-sm text-on-surface-variant">
            <div className="min-w-14 text-center">
              <span className="block text-lg font-bold text-primary">{details?.depAirportCode || '---'}</span>
              <span className="text-xs text-on-surface-variant">{details?.depAirportCity || 'Điểm đi'}</span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-2">
              <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">Bay thẳng</span>
              <div className="relative flex w-full items-center justify-center">
                <div className="h-px w-full bg-outline-variant" />
                <Plane className="absolute h-4 w-4 -rotate-90 bg-surface-container-lowest px-0.5 text-secondary" />
                <div className="absolute left-0 h-1.5 w-1.5 rounded-full border border-outline bg-surface-container-lowest" />
                <div className="absolute right-0 h-1.5 w-1.5 rounded-full border border-outline bg-surface-container-lowest" />
              </div>
            </div>
            <div className="min-w-14 text-center">
              <span className="block text-lg font-bold text-primary">{details?.arrAirportCode || '---'}</span>
              <span className="text-xs text-on-surface-variant">{details?.arrAirportCity || 'Điểm đến'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-outline-variant/30 pt-4 text-xs sm:grid-cols-2">
          <div className="rounded-lg bg-surface-container-low p-3">
            <span className="block font-semibold uppercase tracking-wider text-on-surface-variant">Khởi hành</span>
            <span className="mt-1 flex items-center gap-1 font-semibold text-on-surface">
              <Clock className="h-3.5 w-3.5 text-secondary" /> {details?.depTime || 'Chưa định ngày'}
            </span>
          </div>
          <div className="rounded-lg bg-surface-container-low p-3">
            <span className="block font-semibold uppercase tracking-wider text-on-surface-variant">Đến nơi</span>
            <span className="mt-1 flex items-center gap-1 font-semibold text-on-surface">
              <Clock className="h-3.5 w-3.5 text-secondary" /> {details?.arrTime || 'Chưa định ngày'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-end justify-between gap-4 border-t border-outline-variant/30 bg-surface-container-low p-6 md:col-span-3 md:flex-col md:items-stretch md:justify-center md:border-l md:border-t-0">
        <div className="space-y-1 md:text-center">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">Tổng chi phí chuyến bay</span>
          <div className="text-xl font-black text-primary">
            {booking.totalPrice ? booking.totalPrice.toLocaleString('vi-VN') : '0'} <span className="text-xs font-bold text-on-surface-variant">VND</span>
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
