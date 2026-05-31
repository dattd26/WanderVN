import React, { useState, useEffect } from 'react';
import { payoutService } from '../../../../services';
import type { PayoutDto } from '../../../../types';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PartnerOption {
  id: number;
  name: string;
  email: string;
}

export function CreateBatchModal({ isOpen, onClose, onSuccess }: CreateBatchModalProps) {
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | ''>('');
  const [unbatchedPayouts, setUnbatchedPayouts] = useState<PayoutDto[]>([]);
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<number[]>([]);
  const [note, setNote] = useState('');
  
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load partners who have pending payouts
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchPendingPartners = async () => {
      setIsLoadingPartners(true);
      setError(null);
      try {
        const response = await payoutService.getPayouts({ status: 'Pending', pageSize: 150 });
        
        // Extract distinct partners
        const partnerMap = new Map<number, PartnerOption>();
        response.items.forEach(p => {
          if (!partnerMap.has(p.partnerId)) {
            partnerMap.set(p.partnerId, {
              id: p.partnerId,
              name: p.partnerName ?? 'N/A',
              email: p.partnerEmail ?? '—'
            });
          }
        });
        
        setPartners(Array.from(partnerMap.values()));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách đối tác.');
      } finally {
        setIsLoadingPartners(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPendingPartners();
      setSelectedPartnerId('');
      setUnbatchedPayouts([]);
      setSelectedPayoutIds([]);
      setNote('');
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Load unbatched payouts when a partner is selected
  useEffect(() => {
    if (!selectedPartnerId) {
      const timer = setTimeout(() => {
        setUnbatchedPayouts([]);
        setSelectedPayoutIds([]);
      }, 0);
      return () => clearTimeout(timer);
    }

    const fetchUnbatched = async () => {
      setIsLoadingPayouts(true);
      setError(null);
      try {
        const payouts = await payoutService.getUnbatchedPayouts(selectedPartnerId as number);
        setUnbatchedPayouts(payouts);
        // Default select all
        setSelectedPayoutIds(payouts.map(p => p.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách khoản chi trả chưa gom.');
      } finally {
        setIsLoadingPayouts(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUnbatched();
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedPartnerId]);

  const handleToggleSelectAll = () => {
    if (selectedPayoutIds.length === unbatchedPayouts.length) {
      setSelectedPayoutIds([]);
    } else {
      setSelectedPayoutIds(unbatchedPayouts.map(p => p.id));
    }
  };

  const handleToggleSelectPayout = (id: number) => {
    setSelectedPayoutIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId || selectedPayoutIds.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await payoutService.createBatch({
        partnerId: selectedPartnerId as number,
        payoutIds: selectedPayoutIds,
        note: note.trim() || undefined
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đợt chi trả.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Totals calculations for selected payouts
  const selectedItems = unbatchedPayouts.filter(p => selectedPayoutIds.includes(p.id));
  const totalGross = selectedItems.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalCommission = selectedItems.reduce((acc, curr) => acc + curr.commissionAmount, 0);
  const totalNet = selectedItems.reduce((acc, curr) => acc + curr.netAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-outline/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-admin-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-admin-xl py-admin-lg border-b border-admin-outline-variant/60 bg-admin-surface-container-low select-none">
          <div className="flex items-center gap-admin-sm">
            <span className="material-symbols-outlined text-admin-secondary">layers</span>
            <h2 className="text-admin-title-lg font-bold text-admin-primary">Tạo Đợt Chi Trả Hàng Loạt</h2>
          </div>
          <button onClick={onClose} className="p-admin-sm text-admin-outline hover:text-admin-on-surface transition-colors rounded-full hover:bg-admin-outline-variant/30 flex">
            <span className="material-symbols-outlined text-admin-title-md">close</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-admin-xl flex flex-col gap-admin-lg">
          {error && (
            <div className="p-admin-md bg-red-50 border border-red-200 rounded-lg text-red-700 text-admin-body-sm flex items-start gap-admin-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Select Partner */}
          <div className="bg-admin-surface-container-low/50 p-admin-lg rounded-xl border border-admin-outline-variant/40">
            <label className="block text-admin-body-sm font-bold text-admin-primary mb-admin-sm select-none">
              Bước 1: Chọn Đối Tác Khách Sạn
            </label>
            {isLoadingPartners ? (
              <div className="flex items-center gap-admin-sm text-admin-outline font-admin-sans text-admin-body-sm py-2">
                <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                Đang tải danh sách đối tác...
              </div>
            ) : (
              <select
                required
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-admin-md py-admin-md bg-white border border-admin-outline-variant rounded-lg focus:border-admin-secondary focus:ring-2 focus:ring-admin-secondary/20 outline-none text-admin-body-md"
              >
                <option value="">-- Chọn khách sạn / đối tác có khoản chi trả chờ --</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                ))}
              </select>
            )}
          </div>

          {/* Step 2: Show and select Payouts */}
          {selectedPartnerId !== '' && (
            <div className="flex-1 flex flex-col gap-admin-md min-h-[250px]">
              <div className="flex items-center justify-between select-none">
                <label className="text-admin-body-sm font-bold text-admin-primary">
                  Bước 2: Chọn các khoản giao dịch gom đợt ({selectedPayoutIds.length}/{unbatchedPayouts.length})
                </label>
                {unbatchedPayouts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-admin-label-caps text-admin-secondary font-bold hover:underline"
                  >
                    {selectedPayoutIds.length === unbatchedPayouts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                )}
              </div>

              {isLoadingPayouts ? (
                <div className="flex-1 flex flex-col items-center justify-center text-admin-outline py-12 gap-admin-sm">
                  <span className="animate-spin material-symbols-outlined text-[24px]">progress_activity</span>
                  <span>Đang tải các giao dịch chờ...</span>
                </div>
              ) : unbatchedPayouts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-admin-outline py-12 border border-dashed border-admin-outline rounded-xl bg-admin-surface-container-low/20">
                  <span className="material-symbols-outlined text-[36px] mb-admin-sm">playlist_add_check</span>
                  <span>Không tìm thấy khoản chi trả Pending chưa gom nào cho đối tác này.</span>
                </div>
              ) : (
                <div className="border border-admin-outline-variant rounded-xl overflow-hidden max-h-[300px] overflow-y-auto bg-white shadow-inner">
                  <table className="w-full border-collapse text-left font-admin-sans">
                    <thead className="bg-admin-surface-container-low text-admin-label-caps font-bold sticky top-0 z-10 border-b border-admin-outline-variant">
                      <tr>
                        <th className="p-admin-md w-12 text-center"></th>
                        <th className="p-admin-md">Mã Booking</th>
                        <th className="p-admin-md">Loại</th>
                        <th className="p-admin-md text-right">Tổng tiền (Gross)</th>
                        <th className="p-admin-md text-right">Hoa hồng</th>
                        <th className="p-admin-md text-right">Thực nhận (Net)</th>
                        <th className="p-admin-md">Ngày Checkout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-outline-variant/60 text-admin-body-sm text-admin-on-surface">
                      {unbatchedPayouts.map(p => (
                        <tr
                          key={p.id}
                          onClick={() => handleToggleSelectPayout(p.id)}
                          className={`cursor-pointer hover:bg-admin-surface-container-lowest/50 transition-colors ${
                            selectedPayoutIds.includes(p.id) ? 'bg-admin-secondary/5' : ''
                          }`}
                        >
                          <td className="p-admin-md text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedPayoutIds.includes(p.id)}
                              onChange={() => handleToggleSelectPayout(p.id)}
                              className="rounded border-admin-outline text-admin-secondary focus:ring-admin-secondary"
                            />
                          </td>
                          <td className="p-admin-md font-admin-mono font-bold text-admin-primary">{p.bookingCode}</td>
                          <td className="p-admin-md">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              p.serviceType === 'Flight' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {p.serviceType}
                            </span>
                          </td>
                          <td className="p-admin-md text-right font-admin-mono">{p.grossAmount.toLocaleString('vi-VN')}₫</td>
                          <td className="p-admin-md text-right font-admin-mono text-red-600">-{p.commissionAmount.toLocaleString('vi-VN')}₫</td>
                          <td className="p-admin-md text-right font-admin-mono font-bold text-emerald-600">{p.netAmount.toLocaleString('vi-VN')}₫</td>
                          <td className="p-admin-md text-admin-outline">
                            {p.checkedOutAt ? new Date(p.checkedOutAt).toLocaleDateString('vi-VN') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Note & Financial Summary */}
          {selectedPartnerId !== '' && unbatchedPayouts.length > 0 && selectedPayoutIds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-admin-lg border-t border-admin-outline-variant/60 pt-admin-lg">
              
              {/* Batch Note */}
              <div className="flex flex-col">
                <label className="text-admin-body-sm font-bold text-admin-primary mb-admin-sm select-none">
                  Bước 3: Ghi chú đợt chi trả (Tùy chọn)
                </label>
                <textarea
                  placeholder="Ghi chú đợt chuyển khoản, ví dụ: Thanh toán đợt tháng 5/2026..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="flex-1 w-full px-admin-md py-admin-md border border-admin-outline-variant rounded-lg focus:border-admin-secondary focus:ring-2 focus:ring-admin-secondary/20 outline-none resize-none min-h-[100px] text-admin-body-md"
                />
              </div>

              {/* Summary Cards */}
              <div className="bg-admin-surface-container-low p-admin-lg rounded-xl border border-admin-outline-variant/40 flex flex-col justify-between font-admin-sans select-none">
                <h4 className="text-admin-label-caps text-admin-outline font-bold uppercase mb-admin-md">Tóm tắt đợt chi trả</h4>
                
                <div className="flex flex-col gap-admin-sm text-admin-body-md text-admin-on-surface">
                  <div className="flex items-center justify-between">
                    <span>Số lượng booking:</span>
                    <span className="font-bold">{selectedPayoutIds.length} bookings</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tổng tiền phòng khách trả (Gross):</span>
                    <span className="font-admin-mono">{totalGross.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex items-center justify-between text-red-600">
                    <span>Tổng hoa hồng OTA giữ lại:</span>
                    <span className="font-admin-mono font-bold">-{totalCommission.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-600 border-t border-admin-outline-variant/60 pt-admin-sm mt-admin-sm text-admin-title-md font-bold">
                    <span>Khách sạn thực nhận (Net):</span>
                    <span className="font-admin-mono">{totalNet.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-admin-xl py-admin-lg border-t border-admin-outline-variant/60 bg-admin-surface-container-low flex justify-end gap-admin-md select-none">
          <button
            type="button"
            onClick={onClose}
            className="px-admin-xl py-admin-md border border-admin-outline-variant rounded-lg font-bold text-admin-outline hover:text-admin-primary hover:bg-admin-outline-variant/20 transition-all"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={isSubmitting || !selectedPartnerId || selectedPayoutIds.length === 0}
            onClick={handleSubmit}
            className="px-admin-xl py-admin-md bg-admin-primary-container text-white rounded-lg font-bold hover:bg-admin-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-admin-sm"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                Đang tạo...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">layers</span>
                Tạo Đợt Chi Trả ({selectedPayoutIds.length})
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
