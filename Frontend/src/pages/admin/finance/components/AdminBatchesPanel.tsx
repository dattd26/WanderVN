import { useEffect, useState, useCallback } from 'react';
import { payoutService } from '../../../../services';
import type { AdminBatchDto, PagedResult } from '../../../../types';
import { CreateBatchModal } from './CreateBatchModal';
import { VietQRModal } from './VietQRModal';
import { FinancePagination } from './FinancePagination';

export function AdminBatchesPanel() {
  const [pagedResult, setPagedResult] = useState<PagedResult<AdminBatchDto> | null>(null);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [status, setStatus] = useState<string>('');
  
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Expand/collapse rows
  const [expandedBatchIds, setExpandedBatchIds] = useState<number[]>([]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [confirmBatch, setConfirmBatch] = useState<AdminBatchDto | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPageNumber(1);
    }, 400);
    return () => clearTimeout(t);
  }, [keyword]);

  const fetchBatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await payoutService.getAdminBatches({
        partnerKeyword: debouncedKeyword || undefined,
        status: status || undefined,
        pageNumber,
        pageSize,
      });
      setPagedResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách đợt chi trả.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedKeyword, status, pageNumber, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBatches();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchBatches]);

  const handleToggleExpand = (id: number) => {
    setExpandedBatchIds(prev =>
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleCancelBatch = async (batch: AdminBatchDto) => {
    const reason = prompt(`Nhập lý do hủy đợt chi trả ${batch.batchCode} cho đối tác "${batch.partnerName ?? 'N/A'}":`);
    if (reason === null) return;
    
    setIsLoading(true);
    try {
      await payoutService.cancelBatch(batch.id, reason);
      alert('Đã hủy đợt chi trả thành công. Các khoản giao dịch con đã được trả lại trạng thái Chờ chi trả.');
      fetchBatches();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể hủy đợt chi trả.');
    } finally {
      setIsLoading(false);
    }
  };

  const items = pagedResult?.items ?? [];
  const totalItems = pagedResult?.totalItems ?? 0;
  const totalPages = pagedResult?.totalPages ?? 0;
  const currentPage = pagedResult?.pageNumber ?? 1;

  return (
    <div className="flex flex-col gap-admin-lg font-admin-sans">
      
      {/* Action Filters Panel */}
      <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-admin-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-admin-md select-none">
        
        {/* Left: Filters */}
        <div className="flex-1 flex flex-col sm:flex-row gap-admin-md items-stretch sm:items-center">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-admin-md top-1/2 -translate-y-1/2 text-admin-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm theo đối tác, email, mã đợt PO..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-admin-xl pr-admin-md py-admin-sm bg-admin-surface-container-low border border-admin-outline-variant/60 rounded-lg outline-none focus:border-admin-secondary text-admin-body-sm transition-all"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-admin-md top-1/2 -translate-y-1/2 text-admin-outline hover:text-admin-on-surface flex"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPageNumber(1); }}
            className="px-admin-md py-admin-sm bg-admin-surface-container-low border border-admin-outline-variant/60 rounded-lg outline-none focus:border-admin-secondary text-admin-body-sm transition-all"
          >
            <option value="">-- Tất cả trạng thái đợt --</option>
            <option value="Processing">Đang xử lý thanh toán</option>
            <option value="Paid">Đã chi trả thành công</option>
            <option value="Cancelled">Đã bị hủy bỏ</option>
          </select>
        </div>

        {/* Right: Actions */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="py-admin-sm px-admin-lg bg-admin-primary-container text-white rounded-lg font-bold hover:bg-admin-primary transition-colors flex items-center justify-center gap-admin-xs whitespace-nowrap self-stretch md:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">layers</span>
          Gom Đợt Chi Trả Hàng Loạt
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-admin-outline gap-admin-sm">
            <span className="animate-spin material-symbols-outlined text-[32px]">progress_activity</span>
            <span>Đang tải danh sách đợt chi trả...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <span className="material-symbols-outlined text-[48px] text-red-500 mb-admin-sm">error</span>
            <p className="text-admin-body-md text-red-700 font-bold mb-admin-md">{error}</p>
            <button
              onClick={fetchBatches}
              className="px-admin-lg py-admin-sm bg-admin-primary-container text-white rounded-lg hover:bg-admin-primary font-bold transition-all"
            >
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-admin-outline text-center select-none">
            <span className="material-symbols-outlined text-[54px] mb-admin-md">inventory_2</span>
            <p className="text-admin-body-md font-bold mb-admin-sm">Không tìm thấy đợt chi trả nào</p>
            <p className="text-admin-body-sm text-admin-outline max-w-md px-4 leading-normal">
              Chưa có đợt chi trả nào được tạo hoặc không có đợt chi trả nào khớp với bộ lọc tìm kiếm hiện tại.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left font-admin-sans">
              <thead className="bg-admin-surface-container-low text-admin-label-caps font-bold border-b border-admin-outline-variant select-none">
                <tr>
                  <th className="p-admin-md w-12 text-center"></th>
                  <th className="p-admin-md">Mã Đợt (Batch Code)</th>
                  <th className="p-admin-md">Đối tác nhận</th>
                  <th className="p-admin-md text-center">Số booking</th>
                  <th className="p-admin-md text-right">Tổng thực nhận (Net)</th>
                  <th className="p-admin-md text-center">Trạng thái</th>
                  <th className="p-admin-md">Ngày tạo</th>
                  <th className="p-admin-md text-center w-40">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-outline-variant/60 text-admin-body-sm text-admin-on-surface">
                {items.map(batch => {
                  const isExpanded = expandedBatchIds.includes(batch.id);
                  return (
                    <>
                      {/* Main Batch Row */}
                      <tr
                        key={batch.id}
                        onClick={() => handleToggleExpand(batch.id)}
                        className={`hover:bg-admin-surface-container-lowest/50 transition-all cursor-pointer ${
                          isExpanded ? 'bg-admin-surface-container-low/40 font-semibold' : ''
                        }`}
                      >
                        <td className="p-admin-md text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleExpand(batch.id)}
                            className="p-1 hover:bg-admin-outline-variant/30 rounded-full transition-all text-admin-outline"
                          >
                            <span className="material-symbols-outlined text-[20px] flex">
                              {isExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
                            </span>
                          </button>
                        </td>
                        <td className="p-admin-md font-admin-mono font-bold text-admin-primary text-admin-body-sm">
                          {batch.batchCode}
                        </td>
                        <td className="p-admin-md">
                          <div className="flex flex-col">
                            <span className="font-bold">{batch.partnerName ?? 'N/A'}</span>
                            <span className="text-[11px] text-admin-outline select-all">{batch.partnerEmail ?? '—'}</span>
                          </div>
                        </td>
                        <td className="p-admin-md text-center font-bold">{batch.bookingCount} đơn</td>
                        <td className="p-admin-md text-right font-admin-mono font-bold text-emerald-600">
                          {batch.totalNet.toLocaleString('vi-VN')}₫
                        </td>
                        <td className="p-admin-md text-center select-none" onClick={(e) => e.stopPropagation()}>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            batch.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : batch.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {batch.status === 'Paid'
                              ? 'Đã chi trả'
                              : batch.status === 'Cancelled'
                              ? 'Đã bị hủy'
                              : 'Đang xử lý'}
                          </span>
                        </td>
                        <td className="p-admin-md text-admin-outline">
                          {new Date(batch.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-admin-md text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-admin-xs">
                            {batch.status === 'Processing' ? (
                              <>
                                <button
                                  onClick={() => setConfirmBatch(batch)}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition-all flex items-center gap-0.5 shadow-sm"
                                  title="Xác nhận đã thanh toán đợt"
                                >
                                  <span className="material-symbols-outlined text-[12px]">check</span>
                                  Thanh toán
                                </button>
                                <button
                                  onClick={() => handleCancelBatch(batch)}
                                  className="px-2 py-1 border border-red-300 text-red-600 rounded text-[11px] font-bold hover:bg-red-50 transition-all flex items-center gap-0.5"
                                  title="Hủy đợt chi trả"
                                >
                                  <span className="material-symbols-outlined text-[12px]">close</span>
                                  Hủy đợt
                                </button>
                              </>
                            ) : batch.status === 'Paid' ? (
                              <div className="flex flex-col text-left text-[11px] leading-tight select-text text-admin-outline max-w-[150px]">
                                <span className="font-bold text-emerald-600">Đã TT: {batch.paidAt ? new Date(batch.paidAt).toLocaleDateString('vi-VN') : ''}</span>
                                <span className="truncate" title={batch.transactionReference ?? ''}>TxRef: {batch.transactionReference ?? '—'}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-red-500 font-bold select-all" title={batch.note ?? ''}>
                                Hủy đợt
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Child Payouts Row */}
                      {isExpanded && (
                        <tr className="bg-admin-surface-container-low/20">
                          <td colSpan={8} className="p-admin-lg border-t border-b border-admin-outline-variant/40">
                            <div className="bg-white rounded-xl border border-admin-outline-variant/65 shadow-inner p-admin-md overflow-hidden max-w-4xl mx-auto">
                              <h4 className="text-admin-label-caps text-admin-outline font-bold uppercase mb-admin-sm flex items-center gap-admin-xs select-none">
                                <span className="material-symbols-outlined text-[16px]">list_alt</span>
                                Chi tiết danh sách {batch.bookingCount} giao dịch con
                              </h4>
                              
                              <table className="w-full border-collapse text-left text-admin-body-sm font-admin-sans">
                                <thead className="bg-admin-surface-container-low text-admin-label-caps font-bold border-b border-admin-outline-variant/60 select-none">
                                  <tr>
                                    <th className="p-admin-sm">Mã Booking</th>
                                    <th className="p-admin-sm">Loại</th>
                                    <th className="p-admin-sm text-right">Tổng thanh toán (Gross)</th>
                                    <th className="p-admin-sm text-right">Hoa hồng OTA giữ</th>
                                    <th className="p-admin-sm text-right">Thực chuyển (Net)</th>
                                    <th className="p-admin-sm">Trạng thái</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-outline-variant/40 text-admin-on-surface-variant font-admin-sans">
                                  {batch.payouts.map(p => (
                                    <tr key={p.id} className="hover:bg-admin-surface-container-lowest/40 transition-colors">
                                      <td className="p-admin-sm font-admin-mono font-bold text-admin-primary">{p.bookingCode}</td>
                                      <td className="p-admin-sm">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                          p.serviceType === 'Flight' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                          {p.serviceType}
                                        </span>
                                      </td>
                                      <td className="p-admin-sm text-right font-admin-mono">{p.grossAmount.toLocaleString('vi-VN')}₫</td>
                                      <td className="p-admin-sm text-right font-admin-mono text-red-500">-{p.commissionAmount.toLocaleString('vi-VN')}₫</td>
                                      <td className="p-admin-sm text-right font-admin-mono font-bold text-emerald-600">{p.netAmount.toLocaleString('vi-VN')}₫</td>
                                      <td className="p-admin-sm select-none">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                          p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                          {p.status === 'Paid' ? 'Đã chi trả' : 'Đang gom đợt'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              
                              {batch.note && (
                                <div className="mt-admin-md bg-admin-surface-container-low/40 border border-admin-outline-variant/40 p-admin-sm rounded-lg text-admin-body-sm select-text flex items-start gap-admin-xs">
                                  <span className="material-symbols-outlined text-[16px] text-admin-outline">description</span>
                                  <span><b>Ghi chú/Lý do:</b> {batch.note}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && totalPages > 0 && (
        <FinancePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPageNumber}
        />
      )}

      {/* Modals */}
      <CreateBatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchBatches}
      />

      {confirmBatch && (
        <VietQRModal
          isOpen={confirmBatch !== null}
          batchId={confirmBatch.id}
          partnerName={confirmBatch.partnerName}
          bookingCode={confirmBatch.batchCode}
          onClose={() => setConfirmBatch(null)}
          onSuccess={async (txRef) => {
            await payoutService.confirmBatch(confirmBatch.id, { transactionReference: txRef });
            fetchBatches();
          }}
        />
      )}
    </div>
  );
}
