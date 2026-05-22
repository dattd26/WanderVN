import { Link } from 'react-router-dom';
import type { FlightOfferDetailDto } from '../../../types';

interface BookingSidebarProps {
  offer: FlightOfferDetailDto;
  formId: string;
  isSubmitting: boolean;
  disabled?: boolean;
}

export const BookingSidebar: React.FC<BookingSidebarProps> = ({ offer, formId, isSubmitting, disabled = false }) => {
  return (
    <div className="lg:sticky lg:top-24 space-y-6">
      <div className="rounded-[32px] border border-outline-variant/20 bg-surface shadow-2xl shadow-black/5 p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Tóm tắt đặt vé</p>
            <h2 className="font-display-md text-headline-sm text-primary mt-3">Thanh toán nhanh</h2>
          </div>
          <div className="rounded-full bg-black/5 px-3 py-2 text-xs uppercase tracking-[0.35em] text-secondary/80">Premium</div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-surface-container-lowest p-5 border border-outline-variant/10">
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Chặng bay</p>
            <p className="mt-3 font-semibold text-on-surface">{offer.originCode} → {offer.destinationCode}</p>
            <p className="text-sm text-on-surface-variant mt-1">{offer.originName} đến {offer.destinationName}</p>
          </div>

          <div className="rounded-3xl bg-surface-container-lowest p-5 border border-outline-variant/10">
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Hãng bay</p>
            <p className="mt-3 font-semibold text-on-surface">{offer.carrierName}</p>
            <p className="text-sm text-on-surface-variant mt-1">{offer.aircraftName || 'Máy bay thương gia'}</p>
          </div>

          <div className="rounded-3xl bg-black/5 p-5 border border-outline-variant/10">
            <p className="text-xs uppercase tracking-[0.35em] text-secondary/70">Giá vé</p>
            <p className="mt-3 text-headline-lg font-semibold text-primary">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: offer.totalCurrency || 'USD' }).format(offer.totalAmount)}
            </p>
            <p className="text-sm text-on-surface-variant mt-1">Đã bao gồm phí đặt chỗ.</p>
          </div>
        </div>

        <button
          type="submit"
          form={formId}
          disabled={disabled || isSubmitting}
          className={`w-full rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-[0.3em] transition ${disabled ? 'bg-outline-variant/30 text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary/90'}`}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đặt vé & Thanh toán'}
        </button>
      </div>

      <div className="rounded-[32px] border border-outline-variant/20 bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
        <p className="font-semibold text-on-surface">Thông tin quan trọng</p>
        <ul className="mt-4 space-y-3">
          <li>• Offer chỉ còn hiệu lực khi trạng thái còn hợp lệ.</li>
          <li>• Hệ thống sẽ gửi dữ liệu sang backend để xác thực và tạo booking.</li>
          <li>• Nếu offer hết hạn, vui lòng chọn offer mới từ trang tìm kiếm.</li>
        </ul>
        <Link to="/flights" className="mt-4 inline-flex text-sm text-primary hover:underline">
          Quay lại tìm kiếm khác
        </Link>
      </div>
    </div>
  );
};
