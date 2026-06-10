import { useState, useEffect } from 'react';
import { useToast } from '../../../../contexts/ToastContext';

interface PartnerRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function PartnerRejectModal({ isOpen, onClose, onSubmit }: PartnerRejectModalProps) {
  const [reason, setReason] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { triggerMessage } = useToast();

  // Reset reason when modal opens
  useEffect(() => {
    if (isOpen) {
      //eslint-disable-next-line react-hooks/set-state-in-effect
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      triggerMessage('error', 'Vui lòng nhập lý do từ chối.');
      return;
    }
    onSubmit(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(11, 28, 48, 0.4)' }}>
      {/* Rejection Modal */}
      <div className="bg-admin-surface-container-lowest w-full max-w-[520px] rounded-xl border border-admin-outline-variant shadow-2xl overflow-hidden transform scale-100 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-admin-lg pt-admin-lg pb-admin-md flex items-center justify-between">
          <div className="flex items-center gap-admin-sm">
            <div className="w-1 h-8 bg-admin-error rounded-full"></div>
            <h2 className="font-admin-sans text-admin-headline-md text-admin-on-surface font-semibold">Từ chối hồ sơ</h2>
          </div>
          <button
            className="p-1 hover:bg-admin-surface-container rounded transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-admin-on-surface-variant">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-admin-lg pb-admin-xl space-y-admin-md">
          <p className="font-admin-sans text-admin-body-md text-admin-on-surface-variant">
            Vui lòng cung cấp lý do chi tiết cho việc từ chối hồ sơ đối tác này. Thông tin này sẽ được gửi trực tiếp qua email cho đối tác.
          </p>
          <div className="space-y-admin-xs">
            <label className={`font-admin-sans text-admin-body-sm font-bold transition-colors ${isFocused ? 'text-admin-secondary' : 'text-admin-on-surface'}`}>
              Lý do từ chối
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full min-h-[160px] p-admin-md bg-admin-surface border border-admin-outline-variant rounded-lg font-admin-sans text-admin-body-md text-admin-on-surface placeholder:text-admin-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-admin-secondary/20 focus:border-admin-secondary transition-all resize-none"
              placeholder="Ví dụ: Giấy phép kinh doanh không hợp lệ hoặc đã hết hạn. Vui lòng cập nhật bản mới nhất để được xét duyệt lại."
            />
          </div>
          <div className="flex items-center gap-admin-sm p-admin-sm bg-admin-error-container/10 border border-admin-error-container/30 rounded">
            <span className="material-symbols-outlined text-admin-error text-[18px]">info</span>
            <span className="font-admin-sans text-admin-body-sm text-admin-error">Hành động này không thể hoàn tác sau khi xác nhận.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-admin-lg py-admin-md bg-admin-surface-container-low flex justify-end items-center gap-admin-md border-t border-admin-outline-variant">
          <button
            className="px-admin-lg py-admin-md font-admin-sans text-admin-body-md font-bold text-admin-on-surface-variant hover:bg-admin-surface-container-highest rounded-lg transition-all active:scale-95"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="px-admin-xl py-admin-md bg-admin-primary text-white font-admin-sans text-admin-body-md font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all active:scale-95 flex items-center gap-admin-sm"
            onClick={handleSubmit}
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
