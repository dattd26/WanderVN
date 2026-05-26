import React from 'react';
import { Plane, Tag, User, CheckCircle, XCircle } from 'lucide-react';
import type { FlightOfferDetailDto } from '../../../types';

interface FlightInfoCardProps {
  detail: FlightOfferDetailDto;
}

const cabinClassLabel: Record<string, string> = {
  economy: 'Phổ thông (Economy)',
  premium_economy: 'Phổ thông đặc biệt',
  business: 'Thương gia (Business)',
  first: 'Hạng nhất (First)',
};

export const FlightInfoCard: React.FC<FlightInfoCardProps> = ({ detail }) => {
  const cabin = cabinClassLabel[detail.cabinClass?.toLowerCase()] ?? detail.cabinClass ?? 'Economy';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8 bg-gradient-to-r from-white/5 to-transparent">
        <Plane className="h-3.5 w-3.5 text-yellow-400/80" />
        <span className="text-[11px] uppercase tracking-widest text-yellow-400/80 font-semibold">
          Thông tin chuyến bay
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Airline logo */}
          <div className="flex-shrink-0">
            {detail.airlineLogo ? (
              <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-black/30 ring-1 ring-white/20">
                <img
                  src={detail.airlineLogo}
                  alt={detail.airline}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/25 flex items-center justify-center">
                <Plane className="h-6 w-6 text-yellow-400" />
              </div>
            )}
          </div>

          {/* Airline details */}
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-base leading-tight truncate">
              {detail.airline || 'Hãng hàng không'}
            </div>
            <div className="text-neutral-400 text-xs mt-0.5 font-mono">
              {detail.flightNumber || '—'}
            </div>
            {detail.aircraft && (
              <div className="text-neutral-500 text-xs mt-0.5">
                {detail.aircraft}
              </div>
            )}
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          {/* Cabin class */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/8 hover:border-yellow-500/20 transition-colors">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag className="h-3 w-3 text-yellow-400/70" />
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Hạng vé</span>
            </div>
            <div className="text-white text-sm font-medium leading-tight">{cabin}</div>
          </div>

          {/* Available seats */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/8 hover:border-yellow-500/20 transition-colors">
            <div className="flex items-center gap-1.5 mb-1.5">
              <User className="h-3 w-3 text-yellow-400/70" />
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Ghế trống</span>
            </div>
            <div className="text-white text-sm font-medium">
              {detail.availableSeats > 0 ? `${detail.availableSeats} ghế` : 'Còn chỗ'}
            </div>
          </div>
        </div>

        {/* Validity badge */}
        <div className="mt-4 flex items-center gap-2">
          {detail.isExpired ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 w-full">
              <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-xs font-medium">Offer đã hết hạn — vui lòng tìm kiếm lại</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-full">
              <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-400 text-xs font-medium">Offer hợp lệ — sẵn sàng đặt vé</span>
              {detail.expiresAt && (
                <span className="ml-auto text-emerald-500/70 text-[10px] flex-shrink-0">
                  Hết hạn: {new Date(detail.expiresAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightInfoCard;
