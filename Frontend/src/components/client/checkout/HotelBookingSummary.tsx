import React from 'react';
import {
  Hotel,
  Calendar,
  Users,
  CheckCircle,
  Shield,
  Loader2,
  MapPin,
  Star,
} from 'lucide-react';
import type { HotelDetailDto, RoomTypeInfo } from '../../../types';

interface HotelBookingSummaryProps {
  hotel: HotelDetailDto;
  room: RoomTypeInfo;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomBasePrice: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  bookingLoading: boolean;
  formatDate: (dateStr: string) => string;
}

const DetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}> = ({ label, value, valueClass = 'text-on-surface' }) => (
  <div className="flex justify-between items-start gap-3">
    <span className="text-xs text-on-surface-variant shrink-0">{label}:</span>
    <span className={`text-xs text-right ${valueClass}`}>{value}</span>
  </div>
);

const PriceRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-baseline gap-3">
    <span className="text-[11px] text-on-surface-variant leading-relaxed">{label}</span>
    <span className="text-xs text-on-surface font-medium tabular-nums shrink-0">{value}</span>
  </div>
);

export const HotelBookingSummary: React.FC<HotelBookingSummaryProps> = ({
  hotel,
  room,
  checkInDate,
  checkOutDate,
  nights,
  roomBasePrice,
  subtotal,
  taxAmount,
  totalAmount,
  bookingLoading,
  formatDate,
}) => {
  return (
    <div className="border border-outline-variant/30 bg-surface-container-lowest rounded-lg overflow-hidden limestone-shadow">
      {/* Ảnh khách sạn */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={
            hotel.images[0] ||
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
          }
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white font-semibold text-sm leading-tight drop-shadow">
            {hotel.name}
          </h3>
          {hotel.starRating && (
            <div className="flex items-center gap-0.5 mt-0.5">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-[#d4af37] text-[#d4af37]" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="px-5 py-4 border-b border-outline-variant/15">
        <div className="flex items-start gap-2">
          <MapPin className="h-3.5 w-3.5 text-on-surface-variant mt-0.5 shrink-0" />
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {hotel.address}
          </p>
        </div>
      </div>

      {/* Chi tiết đặt phòng */}
      <div className="px-5 py-4 space-y-3 border-b border-outline-variant/15">
        <DetailRow
          label="Hạng phòng"
          value={room.name}
          valueClass="font-semibold text-on-surface"
        />
        <DetailRow
          label="Sức chứa"
          value={
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-secondary" />
              Tối đa {room.capacity} người
            </span>
          }
        />
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-surface-container-low/50 rounded-lg p-3 text-center">
            <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-semibold">
              Nhận phòng
            </p>
            <Calendar className="h-4 w-4 text-secondary mx-auto my-1" />
            <p className="text-xs font-semibold text-on-surface">
              {formatDate(checkInDate)}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Từ 14:00</p>
          </div>
          <div className="bg-surface-container-low/50 rounded-lg p-3 text-center">
            <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-semibold">
              Trả phòng
            </p>
            <Calendar className="h-4 w-4 text-secondary mx-auto my-1" />
            <p className="text-xs font-semibold text-on-surface">
              {formatDate(checkOutDate)}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Trước 12:00</p>
          </div>
        </div>
        <p className="text-center text-xs font-semibold text-secondary">
          {nights} đêm lưu trú
        </p>
      </div>

      {/* Chính sách */}
      <div className="px-5 py-3 border-b border-outline-variant/15 bg-green-50/50">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-green-700 leading-relaxed">
            Huỷ miễn phí trước 24 giờ so với giờ nhận phòng. Đặt ngay, thanh toán sau.
          </p>
        </div>
      </div>

      {/* Chiết tính giá */}
      <div className="px-5 py-4 space-y-2.5 border-b border-outline-variant/15">
        <PriceRow
          label={`Tiền phòng (${nights} đêm × ${roomBasePrice.toLocaleString('vi-VN')} VND)`}
          value={`${subtotal.toLocaleString('vi-VN')} VND`}
        />
        <PriceRow
          label="Thuế VAT & Phí dịch vụ (10%)"
          value={`${taxAmount.toLocaleString('vi-VN')} VND`}
        />
      </div>

      <div className="px-5 py-4">
        <div className="flex justify-between items-baseline mb-5">
          <span className="text-sm font-bold text-on-surface">Tổng thanh toán</span>
          <div className="text-right">
            <span className="text-xl font-bold text-red-600">
              {totalAmount.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-on-surface-variant ml-1">VND</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={bookingLoading}
          className="w-full py-4 bg-primary text-on-primary font-semibold text-xs uppercase tracking-widest rounded-lg shadow-md hover:bg-primary/95 active:scale-[0.99] flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {bookingLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 text-secondary" />
              Thanh toán an toàn
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-4 mt-4 text-on-surface-variant/60 text-[10px]">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            PCI DSS
          </span>
          <span className="w-px h-3 bg-outline-variant/30" />
          <span className="flex items-center gap-1">
            <Hotel className="h-3 w-3" />
            Đặt phòng bảo đảm
          </span>
        </div>
      </div>
    </div>
  );
};
