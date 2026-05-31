import React, { useState, useEffect } from 'react';
import { payoutService } from '../../../../services';
import type { AdminBatchDto } from '../../../../types';

interface ConfirmBatchModalProps {
  isOpen: boolean;
  batchId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConfirmBatchModal({ isOpen, batchId, onClose, onSuccess }: ConfirmBatchModalProps) {
  const [batch, setBatch] = useState<AdminBatchDto | null>(null);
  const [txRef, setTxRef] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !batchId) return;

    const fetchBatchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await payoutService.getAdminBatchDetail(batchId);
        setBatch(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải chi tiết đợt chi trả.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchDetail();
    setTxRef('');
  }, [isOpen, batchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId || !txRef.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await payoutService.confirmBatch(batchId, {
        transactionReference: txRef.trim()
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xác nhận chi trả đợt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-outline/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-admin-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-admin-xl py-admin-lg border-b border-admin-outline-variant/60 bg-admin-surface-container-low select-none">
          <div className="flex items-center gap-admin-sm">
            <span className="material-symbols-outlined text-emerald-600">verified</span>
            <h2 className="text-admin-title-md font-bold text-admin-primary">Xác Nhận Chi Trả Đợt</h2>
          </div>
          <button onClick={onClose} className="p-admin-sm text-admin-outline hover:text-admin-on-surface transition-colors rounded-full hover:bg-admin-outline-variant/30 flex">
            <span className="material-symbols-outlined text-admin-title-md">close</span>
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-admin-xl flex flex-col items-center justify-center text-admin-outline py-16 gap-admin-sm">
            <span className="animate-spin material-symbols-outlined text-[24px]">progress_activity</span>
            <span>Đang tải thông tin đợt chi trả...</span>
          </div>
        ) : error ? (
          <div className="p-admin-xl text-center flex flex-col items-center justify-center gap-admin-md">
            <div className="p-admin-md bg-red-50 border border-red-200 rounded-lg text-red-700 text-admin-body-sm flex items-start gap-admin-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
            <button
              onClick={onClose}
              className="px-admin-xl py-admin-md border border-admin-outline-variant rounded-lg font-bold text-admin-outline hover:text-admin-primary transition-all"
            >
              Đóng
            </button>
          </div>
        ) : batch ? (
          <form onSubmit={handleSubmit} className="p-admin-xl flex flex-col gap-admin-lg">
            
            {/* Batch Info Card */}
            <div className="bg-admin-surface-container-low p-admin-lg rounded-xl border border-admin-outline-variant/40 select-none">
              <div className="flex justify-between items-center mb-admin-sm">
                <span className="text-admin-label-caps text-admin-outline font-bold uppercase">Mã Đợt Chi Trả</span>
                <span className="font-admin-mono font-bold text-admin-primary text-admin-body-md">{batch.batchCode}</span>
              </div>
              <div className="flex justify-between items-center mb-admin-sm">
                <span className="text-admin-body-sm text-admin-on-surface-variant">Đối tác nhận:</span>
                <span className="font-bold text-admin-on-surface text-admin-body-sm">{batch.partnerName ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center mb-admin-sm">
                <span className="text-admin-body-sm text-admin-on-surface-variant">Số lượng booking:</span>
                <span className="font-bold text-admin-on-surface text-admin-body-sm">{batch.bookingCount} đơn</span>
              </div>
              <div className="flex justify-between items-center border-t border-admin-outline-variant/60 pt-admin-sm mt-admin-sm text-emerald-600 text-admin-title-sm font-bold">
                <span>Tổng thực nhận (Net):</span>
                <span className="font-admin-mono text-admin-title-md">{batch.totalNet.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            {/* Input TxRef */}
            <div className="flex flex-col gap-admin-xs">
              <label className="text-admin-body-sm font-bold text-admin-primary select-none flex items-center gap-1">
                Mã Giao Dịch Ngân Hàng <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="Nhập mã giao dịch chuyển khoản (Transaction Reference)..."
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                className="w-full px-admin-md py-admin-md border border-admin-outline-variant rounded-lg focus:border-admin-secondary focus:ring-2 focus:ring-admin-secondary/20 outline-none font-admin-sans text-admin-body-md"
              />
              <p className="text-admin-label-caps text-admin-outline mt-admin-xs leading-normal select-none">
                Vui lòng chuyển khoản cho đối tác qua thông tin tài khoản ngân hàng của họ trước, sau đó lưu lại mã giao dịch tại đây để đối soát.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-admin-md border-t border-admin-outline-variant/60 pt-admin-lg select-none">
              <button
                type="button"
                onClick={onClose}
                className="px-admin-xl py-admin-md border border-admin-outline-variant rounded-lg font-bold text-admin-outline hover:text-admin-primary hover:bg-admin-outline-variant/20 transition-all"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !txRef.trim()}
                className="px-admin-xl py-admin-md bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-admin-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Xác Nhận Đã Thanh Toán
                  </>
                )}
              </button>
            </div>

          </form>
        ) : null}

      </div>
    </div>
  );
}
