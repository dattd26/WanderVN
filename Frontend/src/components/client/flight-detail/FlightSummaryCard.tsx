import type { FlightOfferDetailDto } from '../../../types';

interface FlightSummaryCardProps {
  offer: FlightOfferDetailDto;
}

export const FlightSummaryCard: React.FC<FlightSummaryCardProps> = ({ offer }) => {
  const bookingValidity = offer.expiresAt
    ? new Date(offer.expiresAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Không xác định';

  return (
    <section className="rounded-[32px] border border-outline-variant/20 bg-surface shadow-2xl shadow-black/5 p-8 overflow-hidden">
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-black/5 flex items-center justify-center overflow-hidden">
              {offer.carrierLogoUrl ? (
                <img src={offer.carrierLogoUrl} alt={offer.carrierName} className="h-full w-full object-contain" />
              ) : (
                <div className="font-bold text-primary">{offer.carrierCode}</div>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Hãng hàng không</p>
              <h2 className="font-display-md text-headline-md text-primary mt-1">{offer.carrierName || 'Hãng hàng không cao cấp'}</h2>
            </div>
          </div>
          <div className="rounded-3xl border border-amber-300/10 bg-black/5 px-5 py-4 text-right">
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Giá hiện tại</p>
            <p className="font-headline-lg text-headline-lg text-primary mt-2">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: offer.totalCurrency || 'USD' }).format(offer.totalAmount)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Khởi hành</p>
            <p className="font-semibold text-on-surface mt-3">{offer.originCode}</p>
            <p className="text-sm text-on-surface-variant mt-1">{offer.originName}</p>
          </div>
          <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Điểm đến</p>
            <p className="font-semibold text-on-surface mt-3">{offer.destinationCode}</p>
            <p className="text-sm text-on-surface-variant mt-1">{offer.destinationName}</p>
          </div>
          <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Hiệu lực booking</p>
            <p className="font-semibold text-on-surface mt-3">{offer.isExpired ? 'Hết hạn' : 'Còn hiệu lực'}</p>
            <p className="text-sm text-on-surface-variant mt-1">{bookingValidity}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Số ghế còn</p>
            <p className="mt-3 text-headline-sm font-semibold text-primary">{offer.availableSeats ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Mã offer</p>
            <p className="mt-3 text-sm text-on-surface break-all">{offer.id}</p>
          </div>
          <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Trạng thái</p>
            <p className={`mt-3 inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold ${offer.isExpired ? 'bg-rose-500/10 text-rose-200' : 'bg-emerald-400/10 text-emerald-100'}`}>{offer.validationStatus}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
