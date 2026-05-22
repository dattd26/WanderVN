import type { FlightOfferDetailDto } from '../../../types';

interface PricingCardProps {
  offer: FlightOfferDetailDto;
}

export const PricingCard: React.FC<PricingCardProps> = ({ offer }) => {
  return (
    <section className="rounded-[32px] border border-outline-variant/20 bg-surface shadow-2xl shadow-black/5 p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Bảng giá</p>
          <h2 className="font-display-md text-headline-md text-primary mt-3">Giá theo hành khách</h2>
        </div>
        <div className="rounded-full bg-black/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-secondary/80">{offer.totalCurrency}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6">
          <p className="text-sm text-secondary/80 uppercase tracking-[0.35em]">Chi phí chuyến bay</p>
          <p className="mt-4 text-headline-lg font-semibold text-primary">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: offer.totalCurrency || 'USD' }).format(offer.totalAmount)}
          </p>
        </div>
        <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-6">
          <p className="text-sm text-secondary/80 uppercase tracking-[0.35em]">Số ghế khả dụng</p>
          <p className="mt-4 text-headline-lg font-semibold text-primary">{offer.availableSeats ?? 0}</p>
          <p className="text-sm text-on-surface-variant mt-2">Số ghế được Duffel API cập nhật.</p>
        </div>
      </div>
    </section>
  );
};
