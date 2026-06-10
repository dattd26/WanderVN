import React, { useState, useEffect } from 'react';
import { X, Landmark, RefreshCw } from 'lucide-react';
import partnerService from '../../services/partner/partnerService';
import type { UpdateBankInfoPayload } from '../../types';

interface UpdateBankInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialBankName?: string | null;
  initialBankAccountNumber?: string | null;
  initialBankAccountName?: string | null;
}

export const UpdateBankInfoModal: React.FC<UpdateBankInfoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialBankName,
  initialBankAccountNumber,
  initialBankAccountName,
}) => {
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBankName(initialBankName || '');
      setBankAccountNumber(initialBankAccountNumber || '');
      setBankAccountName(initialBankAccountName || '');
      setError(null);
    }
  }, [isOpen, initialBankName, initialBankAccountNumber, initialBankAccountName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankName.trim()) {
      setError('Tên ngân hàng không được để trống.');
      return;
    }
    if (!bankAccountNumber.trim()) {
      setError('Số tài khoản không được để trống.');
      return;
    }
    if (!bankAccountName.trim()) {
      setError('Tên chủ tài khoản không được để trống.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: UpdateBankInfoPayload = {
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountName: bankAccountName.trim(),
      };

      await partnerService.updateBankInfo(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi cập nhật tài khoản ngân hàng:', err);
      setError(err?.message || 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1C1C19]/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FAF6F0] w-full max-w-[480px] rounded-2xl shadow-2xl border border-[#E6E2DD] overflow-hidden p-6 relative animate-in fade-in zoom-in duration-300">

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 text-[#444748] hover:text-[#1C1C19] p-1.5 rounded-full hover:bg-[#F1EDE8] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#E6E2DD]">
          <div className="p-2 rounded-lg bg-[#735C00]/10 text-[#735C00]">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display-lg text-lg font-bold text-[#1C1C19]">
              Cấu hình Tài khoản Ngân hàng
            </h3>
            <p className="text-xs text-[#444748] mt-0.5">
              Thiết lập thông tin nhận thanh toán doanh thu đối soát.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold">
              Tên ngân hàng *
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ví dụ: Vietcombank, Techcombank..."
              disabled={submitting}
              className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-3.5 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold">
              Số tài khoản *
            </label>
            <input
              type="text"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              placeholder="Nhập số tài khoản ngân hàng..."
              disabled={submitting}
              className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-3.5 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors font-mono tracking-wider"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold">
              Tên chủ tài khoản *
            </label>
            <input
              type="text"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              placeholder="Ví dụ: NGUYEN VAN A"
              disabled={submitting}
              className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-3.5 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors font-mono uppercase"
              required
            />
          </div>

          <div className="pt-4 border-t border-[#E6E2DD] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-[#E6E2DD] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#F1EDE8] transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#1C1C19] hover:bg-[#735C00] text-[#FAF6F0] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && <RefreshCw className="h-3 w-3 animate-spin text-[#FAF6F0]" />}
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
