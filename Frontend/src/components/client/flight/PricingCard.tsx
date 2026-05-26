import React from 'react';
import { DollarSign } from 'lucide-react';
import type { FlightOfferDetailDto } from '../../../types';

interface PricingCardProps {
  detail: FlightOfferDetailDto;
}

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

// Ước tính VND tương đương (chỉ hiển thị khi currency là USD)
const VND_RATE = 24500;

export const PricingCard: React.FC<PricingCardProps> = ({ detail }) => {
  const isUSD = detail.currency?.toUpperCase() === 'USD';

  const rows = [
    {
      label: 'Giá vé cơ bản',
      sublabel: '(1 x Người lớn)',
      value: formatCurrency(detail.baseAmount, detail.currency),
      accent: false,
    },
    {
      label: 'Thuế & phụ phí sân bay',
      sublabel: null,
      value: formatCurrency(detail.taxAmount, detail.currency),
      accent: false,
    },
    {
      label: 'Hành lý 23kg',
      sublabel: null,
      value: 'Miễn phí',
      accent: false,
      free: true,
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8 bg-gradient-to-r from-white/5 to-transparent">
        <DollarSign className="h-3.5 w-3.5 text-yellow-400/80" />
        <span className="text-[11px] uppercase tracking-widest text-yellow-400/80 font-semibold">
          Chi tiết giá vé
        </span>
      </div>

      <div className="p-5 space-y-3">
        {/* Line items */}
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div>
              <span className="text-neutral-400 text-sm">{row.label}</span>
              {row.sublabel && (
                <span className="text-neutral-600 text-xs ml-1">{row.sublabel}</span>
              )}
            </div>
            <span className={`font-semibold text-sm flex-shrink-0 ${
              row.free ? 'text-emerald-400' : 'text-neutral-200'
            }`}>
              {row.value}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
                Tổng thanh toán
              </div>
              <div className="text-xs text-neutral-600 mt-0.5">Đã bao gồm thuế & phí</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400 leading-tight tabular-nums">
                {formatCurrency(detail.totalAmount, detail.currency)}
              </div>
              {isUSD && (
                <div className="text-neutral-500 text-[11px] mt-0.5">
                  ~ {(detail.totalAmount * VND_RATE).toLocaleString('vi-VN')} VND
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security note */}
        <p className="text-neutral-600 text-[10px] italic pt-1 leading-relaxed">
          * Giá vé có thể thay đổi theo thời gian thực. Giao dịch được bảo mật bằng mã hóa SSL/TLS.
        </p>
      </div>
    </div>
  );
};

export default PricingCard;
