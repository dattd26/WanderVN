import React, { useState } from 'react';
import { CreditCard, ChevronDown } from 'lucide-react';
import momoLogo from '../../../assets/images/momo.png';
import zalopayLogo from '../../../assets/images/zalopay.png';
import vnpayLogo from '../../../assets/images/vnpay.png';

export type PaymentMethod = 'vnpay' | 'zalopay' | 'momo' | 'credit';

interface PaymentSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

interface CreditCardForm {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({ value, onChange }) => {
  const [walletExpanded, setWalletExpanded] = useState<boolean>(
    value === 'zalopay' || value === 'momo'
  );
  const [creditCardForm, setCreditCardForm] = useState<CreditCardForm>({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });

  const handleWalletGroupClick = () => {
    if (value !== 'zalopay' && value !== 'momo') {
      onChange('zalopay');
      setWalletExpanded(true);
    } else {
      setWalletExpanded((prev) => !prev);
    }
  };

  const baseOptionClass =
    'group flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 select-none';
  const activeClass = 'border-primary bg-surface shadow-sm';
  const inactiveClass = 'border-outline-variant/30 bg-transparent hover:border-outline-variant/60';

  return (
    <div className="space-y-3">
      {/* VNPay */}
      <div
        onClick={() => onChange('vnpay')}
        className={`${baseOptionClass} ${value === 'vnpay' ? activeClass : inactiveClass}`}
      >
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              name="payment-method"
              readOnly
              checked={value === 'vnpay'}
              className="w-4 h-4 text-primary focus:ring-primary accent-primary cursor-pointer"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Cổng VNPay</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              QR / Thẻ ATM nội địa / Thẻ quốc tế
            </p>
          </div>
        </div>
        <div className="h-8 w-14 bg-white border border-outline-variant/20 rounded flex items-center justify-center p-1 shadow-sm transition-shadow group-hover:shadow-md">
          <img src={vnpayLogo} alt="VNPay" className="h-full w-full object-contain" />
        </div>
      </div>

      {/* Ví điện tử (ZaloPay + MoMo nhóm lại) */}
      <div
        className={`border rounded-lg overflow-hidden transition-all duration-200 ${
          value === 'zalopay' || value === 'momo'
            ? 'border-primary bg-surface shadow-sm'
            : 'border-outline-variant/30 bg-transparent hover:border-outline-variant/60'
        }`}
      >
        <div
          onClick={handleWalletGroupClick}
          className="group flex items-center justify-between p-4 cursor-pointer select-none"
        >
          <div className="flex items-center gap-3.5">
            <input
              type="radio"
              name="payment-method"
              readOnly
              checked={value === 'zalopay' || value === 'momo'}
              className="w-4 h-4 text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <div>
              <p className="text-sm font-semibold text-on-surface">Ví điện tử</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                ZaloPay / MoMo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-14 bg-white border border-outline-variant/20 rounded flex items-center justify-center p-1 shadow-sm">
              <img src={zalopayLogo} alt="ZaloPay" className="h-full w-full object-contain" />
            </div>
            <div className="h-8 w-14 bg-white border border-outline-variant/20 rounded flex items-center justify-center p-1 shadow-sm opacity-60">
              <img src={momoLogo} alt="MoMo" className="h-full w-full object-contain grayscale" />
            </div>
            <ChevronDown
              className={`h-4 w-4 text-outline transition-transform duration-200 ${
                walletExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {/* Sub-options */}
        {walletExpanded && (
          <div className="border-t border-outline-variant/15 px-4 pb-4 pt-3 space-y-2.5 bg-surface-container-low/30">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-semibold mb-2">
              Chọn ví điện tử
            </p>

            {/* ZaloPay */}
            <div
              onClick={() => onChange('zalopay')}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-150 ${
                value === 'zalopay'
                  ? 'border-primary bg-surface shadow-sm'
                  : 'border-outline-variant/20 hover:border-outline-variant/50 bg-transparent'
              }`}
            >
              <input
                type="radio"
                name="sub-wallet"
                readOnly
                checked={value === 'zalopay'}
                className="w-3.5 h-3.5 text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <div className="h-7 w-12 bg-white border border-outline-variant/20 rounded flex items-center justify-center p-1">
                <img src={zalopayLogo} alt="ZaloPay" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface">ZaloPay</p>
                <p className="text-[10px] text-on-surface-variant/75 mt-0.5">
                  Xử lý ngay tức thì, được khuyến nghị
                </p>
              </div>
            </div>

            {/* MoMo (disabled) */}
            <div className="flex items-center gap-3 p-3 border border-outline-variant/10 rounded-lg opacity-50 bg-outline-variant/5 cursor-not-allowed select-none">
              <input
                type="radio"
                name="sub-wallet"
                disabled
                checked={false}
                className="w-3.5 h-3.5 cursor-not-allowed"
              />
              <div className="h-7 w-12 bg-white border border-outline-variant/20 rounded flex items-center justify-center p-1">
                <img src={momoLogo} alt="MoMo" className="h-full w-full object-contain grayscale" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-on-surface/70">MoMo</p>
                <p className="text-[10px] text-on-surface-variant/50 mt-0.5">
                  Thanh toán qua ví MoMo
                </p>
              </div>
              <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                Chưa hỗ trợ
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Thẻ tín dụng / ghi nợ */}
      <div
        className={`border rounded-lg overflow-hidden transition-all duration-200 ${
          value === 'credit'
            ? 'border-primary bg-surface shadow-sm'
            : 'border-outline-variant/30 bg-transparent hover:border-outline-variant/60'
        }`}
      >
        <div
          onClick={() => onChange('credit')}
          className="group flex items-center justify-between p-4 cursor-pointer select-none"
        >
          <div className="flex items-center gap-3.5">
            <input
              type="radio"
              name="payment-method"
              readOnly
              checked={value === 'credit'}
              className="w-4 h-4 text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <div>
              <p className="text-sm font-semibold text-on-surface">Thẻ tín dụng / Thẻ ghi nợ</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Visa, Mastercard, JCB, American Express
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-75 transition-opacity">
            <CreditCard className="h-5 w-5 text-on-surface" />
            <ChevronDown
              className={`h-4 w-4 text-outline transition-transform duration-200 ${
                value === 'credit' ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {/* Credit card form */}
        {value === 'credit' && (
          <div className="border-t border-outline-variant/15 px-4 pb-5 pt-4 bg-surface-container-low/20 space-y-4">
            {/* Card number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                Số thẻ
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={19}
                value={creditCardForm.cardNumber}
                onChange={(e) =>
                  setCreditCardForm((prev) => ({
                    ...prev,
                    cardNumber: formatCardNumber(e.target.value),
                  }))
                }
                placeholder="1234 5678 9012 3456"
                className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
              />
            </div>

            {/* Card holder */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                Tên chủ thẻ (không dấu)
              </label>
              <input
                type="text"
                value={creditCardForm.cardHolder}
                onChange={(e) =>
                  setCreditCardForm((prev) => ({
                    ...prev,
                    cardHolder: e.target.value.toUpperCase().replace(/[^A-Z\s]/g, ''),
                  }))
                }
                placeholder="NGUYEN VAN A"
                className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm uppercase font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                  Ngày hết hạn
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={creditCardForm.expiry}
                  onChange={(e) =>
                    setCreditCardForm((prev) => ({
                      ...prev,
                      expiry: formatExpiry(e.target.value),
                    }))
                  }
                  placeholder="MM/YY"
                  className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
                />
              </div>
              {/* CVV */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
                  CVV / CVC
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={creditCardForm.cvv}
                  onChange={(e) =>
                    setCreditCardForm((prev) => ({
                      ...prev,
                      cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                    }))
                  }
                  placeholder="•••"
                  className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
                />
              </div>
            </div>

            <p className="text-[10px] text-on-surface-variant/60 italic">
              * Thông tin thẻ được mã hóa AES-256 và không lưu trữ trên hệ thống.
            </p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-outline italic pt-1">
        * Giao dịch được bảo mật theo tiêu chuẩn PCI DSS. Mã hóa AES-256 đầu cuối.
      </p>
    </div>
  );
};

export default PaymentSelector;
