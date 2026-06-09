import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Plane, CheckCircle, Luggage, Info, Loader2, Shield } from 'lucide-react';
import { useFlightCheckout } from './FlightCheckoutContext';

const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDateShort = (timeStr: string): string => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDuration = (durationStr: string): string => {
  if (!durationStr) return '';
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return durationStr;
  const h = match[1] ? `${match[1]}h` : '';
  const m = match[2] ? `${match[2]}m` : '';
  return `${h} ${m}`.trim();
};

export const FlightSummarySidebar: React.FC = () => {
  const navigate = useNavigate();
  const { offer, bookingLoading, isExpired, paymentMethod, passengersList } = useFlightCheckout();

  if (!offer) return null;

  const totalPassengers = passengersList.length;
  const duffelAmountVnd = offer.totalAmount * 26500;
  const markupVnd = Math.round(duffelAmountVnd * 0.05);
  const taxVnd = Math.round(duffelAmountVnd * 0.10);
  const totalVnd = duffelAmountVnd + markupVnd + taxVnd;

  return (
    <div className="border border-outline-variant/30 bg-surface-container-lowest rounded-lg overflow-hidden limestone-shadow">
      {/* Header tuyến bay */}
      <div className="px-5 py-5 border-b border-outline-variant/15">
        <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/70 font-semibold mb-1.5">
          Chuyến Bay Của Bạn
        </p>
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          {offer.originCode}
          <ArrowRight className="h-4 w-4 text-outline" />
          {offer.destinationCode}
        </h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          {offer.originName || offer.originCode} đến {offer.destinationName || offer.destinationCode}
        </p>
      </div>

      {/* Chi tiết hãng bay & thời gian bay */}
      <div className="px-5 py-4 border-b border-outline-variant/15">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-semibold">
              Hãng bay
            </p>
            <p className="text-sm font-semibold text-on-surface mt-0.5">
              {offer.carrierName}
            </p>
            <p className="text-[10px] text-on-surface-variant">Hạng phổ thông (Economy)</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-semibold">
              Thời gian bay
            </p>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <Clock className="h-3 w-3 text-on-surface-variant" />
              <p className="text-sm font-semibold text-on-surface">
                {formatDuration(offer.duration)}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline khởi hành / đến nơi */}
        <div className="bg-surface-container-low/40 rounded-lg p-4 border border-outline-variant/10">
          <div className="flex items-center justify-between gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary tabular-nums">
                {formatTime(offer.departingAt)}
              </p>
              <p className="text-xs font-semibold text-on-surface mt-0.5">{offer.originCode}</p>
              <p className="text-[10px] text-on-surface-variant">
                {formatDateShort(offer.departingAt)}
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1 px-2">
              <div className="w-full flex items-center gap-1">
                <div className="h-px flex-1 bg-outline-variant/40" />
                <Plane className="h-3.5 w-3.5 text-secondary" />
                <div className="h-px flex-1 bg-outline-variant/40" />
              </div>
              <p className="text-[9px] text-on-surface-variant/70">Bay thẳng</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-primary tabular-nums">
                {formatTime(offer.arrivingAt)}
              </p>
              <p className="text-xs font-semibold text-on-surface mt-0.5">{offer.destinationCode}</p>
              <p className="text-[10px] text-on-surface-variant">
                {formatDateShort(offer.arrivingAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hành lý bao gồm */}
      <div className="px-5 py-4 border-b border-outline-variant/15 space-y-2">
        <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-semibold">
          Hành lý bao gồm
        </p>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
          <span className="text-xs text-on-surface">Hành lý xách tay 7kg</span>
        </div>
        <div className="flex items-center gap-2">
          <Luggage className="h-3.5 w-3.5 text-secondary shrink-0" />
          <span className="text-xs text-on-surface">Hành lý ký gửi 30kg (đã bao gồm)</span>
        </div>
      </div>

      {/* Chính sách vé */}
      <div className="px-5 py-3 border-b border-outline-variant/15 bg-amber-50/40">
        <div className="flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 leading-relaxed">
            Vé không hoàn, hỗ trợ đổi trả theo chính sách hãng bay. Phụ phí đổi vé áp dụng
            sau khi xuất vé.
          </p>
        </div>
      </div>

      {/* Chiết tính giá */}
      <div className="px-5 py-4 space-y-2.5 border-b border-outline-variant/15">
        <PriceRow
          label={`Giá vé gốc (${totalPassengers} khách)`}
          value={`$${offer.totalAmount.toFixed(2)} USD`}
        />
        <PriceRow
          label="Thuế & Phí sân bay (10%)"
          value={`${taxVnd.toLocaleString('vi-VN')} VND`}
        />
        <PriceRow
          label="Phí dịch vụ WanderVN (5%)"
          value={`${markupVnd.toLocaleString('vi-VN')} VND`}
        />
      </div>

      {/* Tổng tiền và Nút đặt vé */}
      <div className="px-5 py-4 space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-bold text-on-surface">Tổng thanh toán</span>
          <div className="text-right">
            <p className="text-xl font-bold text-red-600 tabular-nums">
              {totalVnd.toLocaleString('vi-VN')}
            </p>
            <p className="text-[10px] text-on-surface-variant">VND</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={bookingLoading || isExpired}
          className="w-full py-4 bg-primary text-on-primary font-semibold text-xs uppercase tracking-widest rounded-lg shadow-md hover:bg-primary/95 active:scale-[0.99] flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {bookingLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : paymentMethod === 'vnpay' ? (
            <>
              Tiếp tục VNPay
              <ArrowRight className="h-4 w-4" />
            </>
          ) : paymentMethod === 'zalopay' ? (
            <>
              Tiếp tục ZaloPay
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 text-secondary" />
              Xác nhận đặt vé
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate('/flights')}
          disabled={bookingLoading}
          className="w-full py-2.5 border border-outline-variant/30 text-on-surface-variant hover:text-primary text-xs uppercase tracking-widest rounded-lg transition-colors"
        >
          Quay lại tìm kiếm
        </button>

        <div className="flex items-center justify-center gap-4 text-on-surface-variant/60 text-[10px]">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            PCI DSS
          </span>
          <span className="w-px h-3 bg-outline-variant/30" />
          <span className="flex items-center gap-1">
            <Plane className="h-3 w-3" />
            Vé xác nhận ngay
          </span>
        </div>
      </div>
    </div>
  );
};

const PriceRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-baseline gap-3">
    <span className="text-[11px] text-on-surface-variant leading-relaxed">{label}</span>
    <span className="text-xs text-on-surface font-medium tabular-nums shrink-0">{value}</span>
  </div>
);
