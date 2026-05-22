import type { FlightOfferDetailDto } from '../../../types';

interface FlightRouteCardProps {
  offer: FlightOfferDetailDto;
}

export const FlightRouteCard: React.FC<FlightRouteCardProps> = ({ offer }) => {
  const formatTime = (value: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <section className="rounded-[32px] border border-outline-variant/20 bg-surface shadow-2xl shadow-black/5 p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Hành trình</p>
          <h2 className="font-display-md text-headline-md text-primary mt-3">{offer.originCode} → {offer.destinationCode}</h2>
        </div>
        <div className="rounded-full bg-black/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-secondary/80">{offer.status || 'Đã xác thực'}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Khởi hành</p>
          <p className="text-headline-md font-semibold text-primary mt-3">{formatTime(offer.departingAt)}</p>
          <p className="text-sm text-on-surface-variant mt-2">{offer.originName}</p>
          <p className="text-xs text-on-surface-variant mt-3">Mã sân bay: {offer.originCode}</p>
        </div>

        <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Hạ cánh</p>
          <p className="text-headline-md font-semibold text-primary mt-3">{formatTime(offer.arrivingAt)}</p>
          <p className="text-sm text-on-surface-variant mt-2">{offer.destinationName}</p>
          <p className="text-xs text-on-surface-variant mt-3">Mã sân bay: {offer.destinationCode}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Hãng bay vận hành</p>
          <p className="mt-3 font-semibold text-primary">{offer.carrierName}</p>
          <p className="text-sm text-on-surface-variant mt-1">{offer.aircraftName || 'Máy bay thương gia'}</p>
        </div>

        <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Trạng thái offer</p>
          <p className="mt-3 font-semibold text-primary">{offer.validationStatus}</p>
          <p className="text-sm text-on-surface-variant mt-1">{offer.isExpired ? 'Offer quá hạn, vui lòng chọn chuyến khác.' : 'Offer vẫn còn hạn dùng.'}</p>
        </div>
      </div>
    </section>
  );
};
