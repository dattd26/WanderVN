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
    <div className="group border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 transition-all duration-300 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 limestone-shadow">
      <div className="md:col-span-3 h-48 md:h-full overflow-hidden relative bg-white flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-neutral-100">
        <img 
          src={details?.airlineLogo || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80'} 
          alt={details?.airlineName || 'Hãng hàng không'}
          className="w-32 h-auto object-contain group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </div>

      <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {renderStatusBadge(booking.status, details?.depTime || '')}
            <span className="text-[11px] font-mono font-bold text-on-surface-variant/80 px-2 py-0.5 bg-neutral-100 border rounded">
              Mã đơn: {booking.bookingCode || 'N/A'}
            </span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200 rounded flex items-center gap-1">
              <Plane className="h-3 w-3" /> VÉ MÁY BAY
            </span>
          </div>
          
          <h3 className="font-bold text-lg text-primary leading-snug group-hover:text-secondary transition-colors">
            {details?.airlineName || 'Hãng hàng không'} - Chuyến bay {details?.flightNumber}
          </h3>

          <div className="flex items-center gap-4 text-sm text-on-surface-variant pt-2">
            <div className="flex flex-col items-center">
              <span className="font-bold text-neutral-800 text-lg">{details?.depAirportCode}</span>
              <span className="text-xs text-neutral-500">{details?.depAirportCity}</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <span className="text-[10px] text-neutral-400 mb-1 uppercase tracking-wider font-semibold">Bay thẳng</span>
              <div className="w-full relative flex items-center justify-center">
                <div className="w-full h-px bg-neutral-300"></div>
                <Plane className="h-4 w-4 text-neutral-400 absolute bg-white px-0.5 -rotate-90" />
                <div className="absolute right-0 w-1.5 h-1.5 rounded-full border border-neutral-400 bg-white"></div>
                <div className="absolute left-0 w-1.5 h-1.5 rounded-full border border-neutral-400 bg-white"></div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-neutral-800 text-lg">{details?.arrAirportCode}</span>
              <span className="text-xs text-neutral-500">{details?.arrAirportCity}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100 text-xs">
          <div className="space-y-0.5">
            <span className="text-neutral-500 block">Khởi hành:</span>
            <span className="font-semibold text-on-surface flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-secondary" /> {details?.depTime || 'Chưa định ngày'}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-neutral-500 block">Đến nơi:</span>
            <span className="font-semibold text-on-surface flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-secondary" /> {details?.arrTime || 'Chưa định ngày'}
            </span>
          </div>
        </div>
      </div>

      <div className="md:col-span-3 p-6 bg-neutral-50/50 border-t md:border-t-0 md:border-l border-neutral-100 flex flex-row md:flex-col justify-between md:justify-center md:items-center items-baseline gap-4">
        <div className="md:text-center space-y-0.5 w-full">
          <span className="text-[10px] text-neutral-400 block mt-2">Tổng chi phí chuyến bay:</span>
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
