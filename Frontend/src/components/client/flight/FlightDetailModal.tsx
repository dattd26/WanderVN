import React, { useEffect, useState } from 'react';
import { X, ArrowRight, Loader2 } from 'lucide-react';
import type { FlightOfferDto, FlightOfferDetailDto } from '../../../types';
import { FlightTimeline } from './FlightTimeline';
import { FlightInfoCard } from './FlightInfoCard';
import { FlightBenefits } from './FlightBenefits';
import { PricingCard } from './PricingCard';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface FlightDetailModalProps {
  /** Offer từ danh sách search */
  offer: FlightOfferDto | null;
  onClose: () => void;
  /** Gọi khi user click "Đặt vé & Thanh toán" — trả lại offer gốc để navigate */
  onProceedToCheckout: (offer: FlightOfferDto) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────────────────────────────────────

export const FlightDetailModal: React.FC<FlightDetailModalProps> = ({
  offer,
  onClose,
  onProceedToCheckout,
}) => {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const isOpen = !!offer;

  // ── Close on Escape ───────────────────────────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // ── Prevent body scroll when modal open ──────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // ── Checkout handler ─────────────────────────────────────────────────────

  const handleCheckout = () => {
    if (!offer) return;
    setCheckoutLoading(true);

    console.log('[FlightDetailModal] navigating to checkout with offer:', offer);

    // Small delay for button feedback
    setTimeout(() => {
      onProceedToCheckout(offer);
    }, 200);
  };

  // ── Render guard ──────────────────────────────────────────────────────────

  if (!offer) return null;

  // Map the basic FlightOfferDto to the detailed format needed by child components
  const detail: FlightOfferDetailDto = {
    offerId: offer.id,
    airline: offer.carrierName,
    airlineLogo: offer.carrierLogoUrl,
    flightNumber: `${offer.carrierCode} 123`, // Mock fallback as it's not in standard search DTO
    aircraft: offer.aircraftName,
    departureAirport: offer.originName,
    departureAirportCode: offer.originCode,
    departureTerminal: 'T1',
    arrivalAirport: offer.destinationName,
    arrivalAirportCode: offer.destinationCode,
    arrivalTerminal: 'T2',
    departureTime: offer.departingAt,
    arrivalTime: offer.arrivingAt,
    duration: offer.duration,
    stops: 0,
    cabinClass: 'Economy',
    availableSeats: 9,
    isValid: true,
    isExpired: false,
    expiresAt: null,
    totalAmount: offer.totalAmount,
    baseAmount: offer.totalAmount * 0.8, // Mặc định 80% là giá cơ bản
    taxAmount: offer.totalAmount * 0.2, // 20% là thuế phí
    currency: offer.totalCurrency,
    baggageInfo: '1 x 23kg',
    cabinBaggageInfo: '1 x 7kg',
    mealInfo: 'Bao gồm bữa ăn tiêu chuẩn',
    wifiAvailable: false,
    seatInfo: 'Ghế tiêu chuẩn',
    passengerId: offer.passengers?.[0]?.id || '',
    slices: [
      {
        origin: offer.originName,
        originCode: offer.originCode,
        destination: offer.destinationName,
        destinationCode: offer.destinationCode,
        duration: offer.duration,
        segments: [
          {
            flightNumber: `${offer.carrierCode} 123`,
            aircraft: offer.aircraftName,
            carrierCode: offer.carrierCode,
            carrierName: offer.carrierName,
            carrierLogo: offer.carrierLogoUrl,
            departureAirportCode: offer.originCode,
            departureAirportName: offer.originName,
            departureTerminal: 'T1',
            arrivalAirportCode: offer.destinationCode,
            arrivalAirportName: offer.destinationName,
            arrivalTerminal: 'T2',
            departingAt: offer.departingAt,
            arrivingAt: offer.arrivingAt,
            duration: offer.duration,
            cabinClass: 'Economy'
          }
        ]
      }
    ]
  };

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Modal panel ───────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết chuyến bay"
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
      >
        <div
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 pointer-events-auto modal-enter overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/8 bg-gradient-to-r from-neutral-900 to-neutral-950">
            <div className="flex items-center gap-3 min-w-0">
              {/* Decorative gold line */}
              <div className="w-0.5 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-yellow-400/80 font-semibold">
                  Chi tiết chuyến bay
                </div>
                <h2 className="text-white font-bold text-base leading-tight mt-0.5 truncate">
                  {offer.originCode}
                  <span className="text-neutral-400 mx-2 font-normal">→</span>
                  {offer.destinationCode}
                  <span className="text-neutral-500 text-sm font-normal ml-2">
                    · {offer.carrierName}
                  </span>
                </h2>
              </div>
            </div>
            <button
              id="modal-close-btn"
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Đóng modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Scrollable body ────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-5 space-y-4">
              {/* Flight Timeline */}
              <FlightTimeline detail={detail} />

              {/* Airline info */}
              <FlightInfoCard detail={detail} />

              {/* Benefits */}
              <FlightBenefits detail={detail} />

              {/* Pricing */}
              <PricingCard detail={detail} />

              {/* Segment details — multi-stop breakdown */}
              {detail.slices.length > 0 && detail.slices[0].segments.length > 1 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/8 bg-gradient-to-r from-white/5 to-transparent">
                    <span className="text-[11px] uppercase tracking-widest text-yellow-400/80 font-semibold">
                      Các chặng bay
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    {detail.slices[0].segments.map((seg, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/8">
                        <div className="text-neutral-500 text-xs font-mono w-6 text-center">{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium">
                            {seg.departureAirportCode} → {seg.arrivalAirportCode}
                          </div>
                          <div className="text-neutral-500 text-xs mt-0.5">
                            {seg.carrierName} · {seg.flightNumber}
                            {seg.aircraft ? ` · ${seg.aircraft}` : ''}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-neutral-300 text-xs tabular-nums">
                            {new Date(seg.departingAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            {' → '}
                            {new Date(seg.arrivingAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spacer for sticky CTA */}
              <div className="h-2" />
            </div>
          </div>

          {/* ── Sticky CTA footer ──────────────────────────────────────────── */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-white/8 bg-gradient-to-t from-neutral-950 to-neutral-950/95 backdrop-blur-sm space-y-2.5">
            {/* Price summary line */}
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-neutral-500 text-xs">Tổng thanh toán / 1 khách</span>
              <span className="text-yellow-400 font-bold text-lg tabular-nums">
                {detail.totalAmount.toFixed(2)} {detail.currency}
              </span>
            </div>

            {/* Primary CTA */}
            <button
              id="modal-checkout-btn"
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-200 select-none disabled:opacity-40 disabled:cursor-not-allowed
                bg-gradient-to-r from-yellow-500 to-yellow-400 text-neutral-950 hover:from-yellow-400 hover:to-yellow-300 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đặt vé &amp; Thanh toán
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Secondary — close */}
            <button
              onClick={onClose}
              className="w-full py-2.5 text-neutral-500 hover:text-neutral-300 text-xs uppercase tracking-widest font-semibold transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlightDetailModal;
