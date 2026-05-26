import React from 'react';
import { Luggage, Utensils, Wifi, WifiOff, Armchair, ShoppingBag } from 'lucide-react';
import type { FlightOfferDetailDto } from '../../../types';

interface FlightBenefitsProps {
  detail: FlightOfferDetailDto;
}

interface BenefitItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  unavailable?: boolean;
}

export const FlightBenefits: React.FC<FlightBenefitsProps> = ({ detail }) => {
  const benefits: BenefitItem[] = [
    {
      icon: <ShoppingBag className="h-4 w-4" />,
      label: 'Hành lý xách tay',
      value: detail.cabinBaggageInfo || '7kg hành lý cabin',
    },
    {
      icon: <Luggage className="h-4 w-4" />,
      label: 'Hành lý ký gửi',
      value: detail.baggageInfo || '23kg đã bao gồm',
      highlight: true,
    },
    {
      icon: <Utensils className="h-4 w-4" />,
      label: 'Bữa ăn',
      value: detail.mealInfo || 'Bữa ăn tiêu chuẩn',
    },
    {
      icon: <Armchair className="h-4 w-4" />,
      label: 'Ghế ngồi',
      value: detail.seatInfo || 'Chọn ghế khi check-in',
    },
    {
      icon: detail.wifiAvailable
        ? <Wifi className="h-4 w-4" />
        : <WifiOff className="h-4 w-4" />,
      label: 'WiFi trên chuyến bay',
      value: detail.wifiAvailable ? 'Có WiFi trên tàu' : 'Không có WiFi',
      unavailable: !detail.wifiAvailable,
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8 bg-gradient-to-r from-white/5 to-transparent">
        <Luggage className="h-3.5 w-3.5 text-yellow-400/80" />
        <span className="text-[11px] uppercase tracking-widest text-yellow-400/80 font-semibold">
          Quyền lợi hành khách
        </span>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                b.unavailable
                  ? 'border-white/5 bg-white/3 opacity-50'
                  : b.highlight
                  ? 'border-yellow-500/25 bg-yellow-500/8 hover:bg-yellow-500/12'
                  : 'border-white/8 bg-white/5 hover:border-white/15'
              }`}
            >
              {/* Icon circle */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                b.unavailable
                  ? 'bg-neutral-700/50 text-neutral-600'
                  : b.highlight
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-white/10 text-neutral-300'
              }`}>
                {b.icon}
              </div>
              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className={`text-[10px] uppercase tracking-wider font-semibold ${
                  b.unavailable ? 'text-neutral-600' : 'text-neutral-500'
                }`}>
                  {b.label}
                </div>
                <div className={`text-sm font-medium leading-tight mt-0.5 truncate ${
                  b.unavailable
                    ? 'text-neutral-600 line-through'
                    : b.highlight
                    ? 'text-yellow-300'
                    : 'text-white'
                }`}>
                  {b.value}
                </div>
              </div>
              {/* Included badge */}
              {!b.unavailable && (
                <div className="flex-shrink-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/70 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                    Bao gồm
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlightBenefits;
