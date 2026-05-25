import React from 'react';
import { Plane, Clock, MapPin } from 'lucide-react';
import type { FlightOfferDetailDto } from '../../../types';

interface FlightTimelineProps {
  detail: FlightOfferDetailDto;
}

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch { return '--:--'; }
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
  } catch { return ''; }
};

const formatDuration = (dur: string) => {
  if (!dur) return '';
  const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return dur;
  return [m[1] ? `${m[1]}g` : '', m[2] ? `${m[2]}p` : ''].filter(Boolean).join(' ');
};

export const FlightTimeline: React.FC<FlightTimelineProps> = ({ detail }) => {
  const stopLabel = detail.stops === 0 ? 'Bay thẳng' : `${detail.stops} điểm dừng`;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
      {/* Route header bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-yellow-500/10 to-transparent border-b border-white/8">
        <div className="flex items-center gap-2 text-yellow-400/90 text-xs font-semibold uppercase tracking-widest">
          <Plane className="h-3.5 w-3.5 rotate-90" />
          <span>Hành trình</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          detail.stops === 0
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
            : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
        }`}>
          {stopLabel}
        </span>
      </div>

      {/* Main timeline */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between gap-3">
          {/* Departure */}
          <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
            <div className="text-4xl font-bold text-white tracking-tight leading-none tabular-nums">
              {formatTime(detail.departureTime)}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-yellow-400 font-bold text-lg tracking-widest uppercase">
                {detail.departureAirportCode}
              </span>
            </div>
            <div className="text-neutral-400 text-xs leading-tight max-w-[140px] truncate">
              {detail.departureAirport}
            </div>
            <div className="text-neutral-500 text-[11px] mt-0.5">
              {formatDate(detail.departureTime)}
            </div>
            {detail.departureTerminal && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-2.5 w-2.5 text-neutral-500" />
                <span className="text-neutral-500 text-[10px]">Nhà ga {detail.departureTerminal}</span>
              </div>
            )}
          </div>

          {/* Center axis */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0 px-2">
            {/* Duration */}
            <div className="flex items-center gap-1 text-neutral-400 text-xs">
              <Clock className="h-3 w-3" />
              <span className="font-semibold">{formatDuration(detail.duration)}</span>
            </div>
            {/* Line */}
            <div className="relative w-28 sm:w-36">
              <div className="h-px w-full bg-gradient-to-r from-yellow-500/30 via-yellow-400/60 to-yellow-500/30" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-500/60 border border-yellow-400/80" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-yellow-500/60 border border-yellow-400/80" />
              {/* Plane icon center */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-neutral-900 px-1">
                <Plane className="h-3.5 w-3.5 text-yellow-400 rotate-90" />
              </div>
            </div>
            {/* Stop dots */}
            {detail.stops > 0 && (
              <div className="flex gap-1">
                {Array.from({ length: detail.stops }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                ))}
              </div>
            )}
          </div>

          {/* Arrival */}
          <div className="flex flex-col items-end gap-1 min-w-0 flex-1">
            <div className="text-4xl font-bold text-white tracking-tight leading-none tabular-nums text-right">
              {formatTime(detail.arrivalTime)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 justify-end">
              <span className="text-yellow-400 font-bold text-lg tracking-widest uppercase">
                {detail.arrivalAirportCode}
              </span>
            </div>
            <div className="text-neutral-400 text-xs leading-tight max-w-[140px] truncate text-right">
              {detail.arrivalAirport}
            </div>
            <div className="text-neutral-500 text-[11px] mt-0.5">
              {formatDate(detail.arrivalTime)}
            </div>
            {detail.arrivalTerminal && (
              <div className="flex items-center gap-1 mt-1 justify-end">
                <MapPin className="h-2.5 w-2.5 text-neutral-500" />
                <span className="text-neutral-500 text-[10px]">Nhà ga {detail.arrivalTerminal}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightTimeline;
