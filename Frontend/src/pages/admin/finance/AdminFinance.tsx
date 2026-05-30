import { useCallback, useEffect, useState } from 'react';
import { payoutService, settingsService } from '../../../services';
import type {
    PayoutDto,
    PayoutStatsDto,
    PayoutStatus,
    PagedResult,
} from '../../../types';
import { FinanceStatsCards } from './components/FinanceStatsCards';
import { FinanceFilters } from './components/FinanceFilters';
import { FinanceTable } from './components/FinanceTable';
import { FinancePagination } from './components/FinancePagination';

export function AdminFinance() {
    const [pagedResult, setPagedResult] = useState<PagedResult<PayoutDto> | null>(null);
    const [stats, setStats] = useState<PayoutStatsDto | null>(null);
    const [commissionFee, setCommissionFee] = useState<number>(15);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Bộ lọc
    const [keyword, setKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');
    const [status, setStatus] = useState<PayoutStatus | ''>('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Phân trang
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Debounce keyword 400ms
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedKeyword(keyword);
            setPageNumber(1);
        }, 400);
        return () => clearTimeout(t);
    }, [keyword]);

    const fetchPayouts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await payoutService.getPayouts({
                keyword: debouncedKeyword || undefined,
                status: status || undefined,
                fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
                toDate: toDate ? new Date(toDate + 'T23:59:59').toISOString() : undefined,
                pageNumber,
                pageSize,
            });
            setPagedResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách thanh toán.');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedKeyword, status, fromDate, toDate, pageNumber, pageSize]);

    const fetchStats = useCallback(async () => {
        try {
            const data = await payoutService.getStats();
            setStats(data);
        } catch {
            // Không chặn UI nếu chỉ stats fail
        }
    }, []);

    const fetchSetting = useCallback(async () => {
        try {
            const data = await settingsService.getSetting('CommissionFee');
            setCommissionFee(parseFloat(data.value) || 15);
        } catch {
            // Lỗi khi tải setting, dùng mặc định
        }
    }, []);

    const handleUpdateFee = async () => {
        try {
            await settingsService.updateSetting('CommissionFee', commissionFee.toString());
            const today = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
            setLastUpdated(today);
            alert(`Commission fee globally updated to ${commissionFee}%`);
        } catch (err) {
            alert('Lỗi cập nhật Commission Fee.');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPayouts();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchPayouts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStats();
            fetchSetting();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchStats, fetchSetting]);

    const handleConfirm = async (p: PayoutDto) => {
        if (!confirm(`Xác nhận chi trả ${p.netAmount.toLocaleString('vi-VN')}₫ cho "${p.partnerName ?? 'N/A'}" — Booking ${p.bookingCode}?`)) {
            return;
        }
        try {
            await payoutService.confirmPayout(p.id, {});
            await Promise.all([fetchPayouts(), fetchStats()]);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Không thể xác nhận thanh toán.');
        }
    };

    const handleReset = () => {
        setKeyword('');
        setStatus('');
        setFromDate('');
        setToDate('');
        setPageNumber(1);
    };

    const items = pagedResult?.items ?? [];
    const totalItems = pagedResult?.totalItems ?? 0;
    const totalPages = pagedResult?.totalPages ?? 0;
    const currentPage = pagedResult?.pageNumber ?? 1;
    const pendingCount = items.filter((p) => p.status === 'Pending' || p.status === 'Approved').length;

    return (
        <div className="p-admin-lg max-w-admin-container-max mx-auto w-full">
            {/* Commission Fee Settings */}
            <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-admin-lg shadow-sm hover:shadow-md transition-all duration-200 border-t-4 border-t-admin-secondary mb-admin-lg">
                <div className="flex items-center justify-between mb-admin-lg">
                    <h3 className="font-admin-sans text-admin-headline-sm text-admin-primary">Commission Fee</h3>
                    <span className="material-symbols-outlined text-admin-secondary">analytics</span>
                </div>
                <p className="font-admin-sans text-admin-body-sm text-admin-on-surface-variant mb-admin-xl leading-relaxed max-w-3xl">
                    Define the global service fee percentage for all platform transactions and bookings.
                </p>
                <div className="flex flex-col md:flex-row gap-admin-md items-end max-w-3xl">
                    <div className="flex-1 w-full">
                        <label className="font-admin-sans text-admin-body-sm font-bold block mb-admin-sm">
                            Percentage Fee (%)
                        </label>
                        <div className="relative">
                            <input 
                                type="number" 
                                step="0.1" 
                                value={commissionFee} 
                                onChange={(e) => setCommissionFee(parseFloat(e.target.value) || 0)}
                                className="w-full px-admin-md py-admin-md border border-admin-outline-variant rounded-lg focus:border-admin-secondary focus:ring-2 focus:ring-admin-secondary/20 transition-all font-admin-mono text-admin-display-lg font-bold text-admin-primary outline-none"
                            />
                            <span className="absolute right-admin-md top-1/2 -translate-y-1/2 font-bold text-admin-outline">%</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleUpdateFee}
                        className="py-admin-md px-admin-xl h-[64px] bg-admin-primary-container text-white rounded-lg font-bold hover:bg-admin-primary transition-colors flex items-center justify-center gap-admin-sm select-none"
                    >
                        <span className="material-symbols-outlined text-sm">save</span>
                        Update Fee Structure
                    </button>
                </div>
                {lastUpdated && (
                    <p className="font-admin-sans text-admin-label-caps text-admin-outline mt-admin-sm select-none">
                        Last updated: {lastUpdated} by Admin
                    </p>
                )}
            </div>

            <FinanceStatsCards stats={stats} pendingCount={pendingCount} />

            <FinanceFilters
                keyword={keyword}
                status={status}
                fromDate={fromDate}
                toDate={toDate}
                pageSize={pageSize}
                onKeywordChange={setKeyword}
                onStatusChange={(s) => { setStatus(s); setPageNumber(1); }}
                onFromDateChange={(d) => { setFromDate(d); setPageNumber(1); }}
                onToDateChange={(d) => { setToDate(d); setPageNumber(1); }}
                onPageSizeChange={(s) => { setPageSize(s); setPageNumber(1); }}
                onReset={handleReset}
            />

            <FinanceTable
                items={items}
                isLoading={isLoading}
                error={error}
                pageSize={pageSize}
                onRetry={fetchPayouts}
                onConfirm={handleConfirm}
            />

            {!isLoading && !error && totalPages > 0 && (
                <FinancePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPageNumber}
                />
            )}

            <div className="mt-admin-xl grid grid-cols-1 md:grid-cols-2 gap-admin-lg opacity-80 select-none">
                <div className="bg-admin-surface-container-low p-admin-md rounded-lg border border-admin-outline-variant/30">
                    <h4 className="font-admin-sans text-admin-label-caps text-admin-on-surface mb-admin-sm flex items-center gap-2 font-bold uppercase">
                        <span className="material-symbols-outlined text-[16px]">verified_user</span>
                        Chính sách đối soát
                    </h4>
                    <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans leading-relaxed">
                        Các khoản thanh toán được tạo tự động khi booking đạt trạng thái <b>SettlementPending</b> (đã hoàn tất chuyến đi).
                        Hoa hồng nền tảng mặc định 15% giá trị booking, có thể tuỳ chỉnh theo hợp đồng với từng partner.
                    </p>
                </div>
                <div className="bg-admin-surface-container-low p-admin-md rounded-lg border border-admin-outline-variant/30">
                    <h4 className="font-admin-sans text-admin-label-caps text-admin-on-surface mb-admin-sm flex items-center gap-2 font-bold uppercase">
                        <span className="material-symbols-outlined text-[16px]">history</span>
                        Luồng thanh toán Booking
                    </h4>
                    <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans leading-relaxed">
                        <b>Unpaid → Paid → Confirmed → CheckedIn / Completed → SettlementPending → Settled</b>.
                        Bấm <i>Xác nhận chi trả</i> để chuyển payout sang trạng thái <b>Paid</b>.
                    </p>
                </div>
            </div>
        </div>
    );
}
