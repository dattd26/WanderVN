import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Landmark, Copy, Check, QrCode } from 'lucide-react';
import { payoutService } from '../../../../services/payoutService';
import type { VietQRDto } from '../../../../types';

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  payoutId?: number | null;
  batchId?: number | null;
  partnerName?: string | null;
  bookingCode?: string | null;
  onSuccess: (transactionReference?: string) => Promise<void>;
}

export const VietQRModal: React.FC<VietQRModalProps> = ({
  isOpen,
  onClose,
  payoutId,
  batchId,
  partnerName,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<VietQRDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [transactionReference, setTransactionReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchQR = async () => {
      if (!isOpen) return;

      setLoading(true);
      setError(null);
      setQrData(null);
      setTransactionReference('');

      try {
        let res: VietQRDto;
        if (payoutId) {
          res = await payoutService.getPayoutQR(payoutId);
        } else if (batchId) {
          res = await payoutService.getBatchPayoutQR(batchId);
        } else {
          throw new Error('Không có thông tin khoản chi trả để tạo mã QR.');
        }
        setQrData(res);
      } catch (err: unknown) {
        console.error('Lỗi khi tải mã VietQR:', err);
        setError(err instanceof Error ? err.message : 'Không thể kết nối với hệ thống VietQR. Vui lòng kiểm tra lại thông tin ngân hàng của đối tác.');
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [isOpen, payoutId, batchId]);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSuccess(transactionReference.trim() || undefined);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xác nhận thanh toán.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-admin-primary/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FAF6F0] w-full max-w-[520px] rounded-2xl shadow-2xl border border-[#E6E2DD] overflow-hidden p-6 relative animate-in fade-in zoom-in duration-300">

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
          <div className="p-2 rounded-lg bg-green-50 text-green-700">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display-lg text-lg font-bold text-[#1C1C19]">
              Quét mã VietQR Chi trả Doanh thu
            </h3>
            <p className="text-xs text-[#444748] mt-0.5">
              {payoutId ? `Giao dịch đơn lẻ #${payoutId}` : `Thanh toán theo đợt (Batch)`} &bull; Đối tác: <span className="font-bold text-[#1C1C19]">{partnerName ?? 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Error / Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center gap-3">
            <RefreshCw className="h-8 w-8 text-[#735C00] animate-spin" />
            <p className="text-xs text-[#444748] font-medium animate-pulse">Đang sinh mã VietQR...</p>
          </div>
        ) : qrData ? (
          <div className="space-y-5">
            {/* VietQR visual area */}
            <div className="flex flex-col md:flex-row gap-5 items-center bg-white p-4 rounded-xl border border-[#E6E2DD]/70 shadow-inner">
              <div className="w-[180px] h-[180px] bg-slate-50 border border-slate-100 flex items-center justify-center rounded-lg overflow-hidden shrink-0 relative group">
                <img
                  src={qrData.qrDataURL}
                  alt="VietQR Payout Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 space-y-3 w-full text-xs">
                <div className="p-2.5 rounded-lg bg-[#F1EDE8]/50 border border-[#E6E2DD]/40 space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8F8F] font-medium">Ngân hàng:</span>
                    <span className="font-bold text-[#1C1C19] flex items-center gap-1.5">
                      <Landmark className="h-3 w-3 text-[#735C00]" />
                      {qrData.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8F8F] font-medium">Số tài khoản:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(qrData.bankAccountNumber, 'acc')}
                      className="font-mono font-bold text-[#1C1C19] hover:text-[#735C00] flex items-center gap-1 transition-colors group"
                    >
                      {qrData.bankAccountNumber}
                      {copiedField === 'acc' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8F8F] font-medium">Chủ tài khoản:</span>
                    <span className="font-mono font-bold text-[#1C1C19] uppercase">{qrData.bankAccountName}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-green-50/40 border border-green-200/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8F8F] font-medium">Số tiền thực nhận:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(qrData.amount.toString(), 'amt')}
                      className="font-mono font-extrabold text-green-700 text-sm hover:underline flex items-center gap-1 transition-colors group"
                    >
                      ₫{qrData.amount.toLocaleString('vi-VN')}
                      {copiedField === 'amt' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[#8E8F8F] font-medium shrink-0">Nội dung chuyển:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(qrData.addInfo, 'info')}
                      className="font-mono font-bold text-green-800 text-right hover:text-[#735C00] flex items-center justify-end gap-1 transition-colors group break-all pl-2"
                    >
                      {qrData.addInfo}
                      {copiedField === 'info' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Form */}
            <form onSubmit={handleConfirmPayment} className="space-y-4 pt-4 border-t border-[#E6E2DD]">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-[#444748] font-bold">
                  Mã tham chiếu / Mã giao dịch Ngân hàng (Không bắt buộc)
                </label>
                <input
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="Nhập mã tham chiếu từ ứng dụng ngân hàng của bạn..."
                  disabled={submitting}
                  className="w-full bg-[#F1EDE8] border border-[#E6E2DD] rounded-lg px-3.5 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors font-mono"
                />
                <p className="text-[10px] text-[#8E8F8F]">
                  Mẹo: Sau khi chuyển tiền thành công, hãy nhập mã giao dịch tại đây để dễ đối soát sau này.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 border border-[#E6E2DD] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#F1EDE8] transition-colors disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                  {submitting ? 'Đang xác nhận...' : 'Xác nhận Đã chi trả'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="h-64 flex flex-col justify-center items-center text-[#8E8F8F] text-xs">
            Không tìm thấy thông tin chuyển khoản.
          </div>
        )}
      </div>
    </div>
  );
};
