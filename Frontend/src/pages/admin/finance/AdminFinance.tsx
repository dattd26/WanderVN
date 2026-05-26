import { useCallback, useEffect, useState } from 'react';
import { payoutService } from '../../../services';
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

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPayouts();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchPayouts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStats();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchStats]);

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
