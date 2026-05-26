import type { PayoutDto, PayoutStatus } from '../../../../types';

interface Props {
    items: PayoutDto[];
    isLoading: boolean;
    error: string | null;
    pageSize: number;
    onRetry: () => void;
    onConfirm: (p: PayoutDto) => void;
}

const formatVnd = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

function StatusBadge({ status }: { status: PayoutStatus }) {
    const cfg: Record<PayoutStatus, { label: string; cls: string }> = {
        Pending: { label: 'Chờ thanh toán', cls: 'bg-error-container text-on-error-container' },
        Approved: { label: 'Đã duyệt', cls: 'bg-admin-secondary-container/30 text-admin-on-secondary-container' },
        Paid: { label: 'Đã chi trả', cls: 'bg-green-100 text-green-800 border border-green-200' },
        Rejected: { label: 'Từ chối', cls: 'bg-admin-surface-variant text-admin-on-surface-variant' },
    };
    const c = cfg[status] ?? cfg.Pending;
    return (
        <span className={`inline-block px-admin-sm py-[2px] rounded text-[10px] font-bold uppercase font-admin-sans ${c.cls}`}>
            {c.label}
        </span>
    );
}

function PaymentStatusPill({ status }: { status?: string | null }) {
    if (!status) return <span className="text-admin-outline text-[10px] font-admin-mono">—</span>;
    const lowered = status.toLowerCase();
    let cls = 'bg-admin-surface-variant text-admin-on-surface-variant';
    if (lowered === 'paid' || lowered === 'confirmed' || lowered === 'settled') cls = 'bg-green-100 text-green-800';
    else if (lowered === 'unpaid' || lowered === 'failed') cls = 'bg-error-container text-on-error-container';
    else if (lowered === 'checkedin' || lowered === 'completed' || lowered === 'settlementpending')
        cls = 'bg-admin-secondary-container/30 text-admin-on-secondary-container';
    return (
        <span className={`inline-block px-1.5 py-[1px] rounded text-[9px] font-bold uppercase font-admin-sans ${cls}`}>
            {status}
        </span>
    );
}

function ServiceIcon({ type }: { type: string }) {
    const map: Record<string, string> = {
        Hotel: 'hotel',
        Flight: 'flight',
        Bus: 'directions_bus',
        Restaurant: 'restaurant',
        Cruise: 'directions_boat',
    };
    const icon = map[type] ?? 'storefront';
    return (
        <div className="w-8 h-8 rounded bg-admin-secondary-container/20 flex items-center justify-center text-admin-secondary shrink-0">
            <span className="material-symbols-outlined">{icon}</span>
        </div>
    );
}

export function FinanceTable({ items, isLoading, error, pageSize, onRetry, onConfirm }: Props) {
    if (error) {
        return (
            <div className="bg-white border border-admin-outline-variant rounded-lg p-admin-xl text-center">
                <p className="text-error font-bold mb-admin-sm">{error}</p>
                <button
                    onClick={onRetry}
                    className="bg-admin-primary text-white px-admin-lg py-2 rounded font-bold hover:opacity-90 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white border border-admin-outline-variant rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-admin-surface-container-low border-b border-admin-outline-variant select-none">
                            <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-outline uppercase">Partner / Booking</th>
                            <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-outline uppercase">Doanh thu (Gross)</th>
                            <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-outline uppercase">Hoa hồng</th>
                            <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-primary uppercase">Thực nhận (Net)</th>
                            <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-outline uppercase text-center">Trạng thái</th>
                            <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-outline uppercase text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-outline-variant/30">
                        {isLoading &&
                            Array.from({ length: Math.min(pageSize, 8) }).map((_, idx) => (
                                <tr key={`skeleton-${idx}`}>
                                    <td className="px-admin-lg py-admin-md">
                                        <div className="flex items-center gap-admin-md">
                                            <div className="w-8 h-8 rounded bg-admin-surface-container animate-pulse" />
                                            <div className="space-y-1">
                                                <div className="h-3 w-40 bg-admin-surface-container animate-pulse rounded" />
                                                <div className="h-2 w-24 bg-admin-surface-container animate-pulse rounded" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-admin-lg py-admin-md"><div className="h-3 w-20 bg-admin-surface-container animate-pulse rounded" /></td>
                                    <td className="px-admin-lg py-admin-md"><div className="h-3 w-20 bg-admin-surface-container animate-pulse rounded" /></td>
                                    <td className="px-admin-lg py-admin-md"><div className="h-3 w-24 bg-admin-surface-container animate-pulse rounded" /></td>
                                    <td className="px-admin-lg py-admin-md text-center"><div className="h-4 w-20 bg-admin-surface-container animate-pulse rounded mx-auto" /></td>
                                    <td className="px-admin-lg py-admin-md text-right"><div className="h-7 w-28 bg-admin-surface-container animate-pulse rounded ml-auto" /></td>
                                </tr>
                            ))}

                        {!isLoading && items.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-admin-lg py-admin-xl text-center text-admin-on-surface-variant">
                                    <span className="material-symbols-outlined text-[40px] text-admin-outline opacity-60 block mb-2">inbox</span>
                                    Không có khoản thanh toán nào phù hợp bộ lọc.
                                </td>
                            </tr>
                        )}

                        {!isLoading && items.map((p) => {
                            const isPaid = p.status === 'Paid';
                            const isRejected = p.status === 'Rejected';
                            const disabled = isPaid || isRejected;
                            return (
                                <tr key={p.id} className="hover:bg-admin-surface-container-low/50 transition-colors">
                                    <td className="px-admin-lg py-admin-md">
                                        <div className="flex items-center gap-admin-md">
                                            <ServiceIcon type={p.serviceType} />
                                            <div className="min-w-0">
                                                <p className="font-admin-sans text-admin-body-md font-bold text-admin-on-surface truncate">
                                                    {p.partnerName ?? 'N/A'}
                                                </p>
                                                <p className="text-[11px] text-admin-outline font-admin-sans truncate">
                                                    {p.partnerEmail ?? '—'}
                                                </p>
                                                <p className="text-[10px] text-admin-outline font-admin-mono mt-0.5 flex items-center gap-1">
                                                    <span>{p.bookingCode}</span>
                                                    <PaymentStatusPill status={p.paymentStatus} />
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-admin-lg py-admin-md font-admin-mono text-admin-body-md text-admin-on-surface">
                                        {formatVnd(p.grossAmount)}
                                    </td>
                                    <td className="px-admin-lg py-admin-md font-admin-mono text-admin-body-md text-error font-bold">
                                        -{formatVnd(p.commissionAmount)}
                                    </td>
                                    <td className="px-admin-lg py-admin-md font-admin-mono text-admin-body-md font-bold text-admin-secondary">
                                        {formatVnd(p.netAmount)}
                                    </td>
                                    <td className="px-admin-lg py-admin-md text-center select-none">
                                        <StatusBadge status={p.status} />
                                        {p.paidAt && (
                                            <p className="text-[10px] text-admin-outline mt-1 font-admin-mono">
                                                {new Date(p.paidAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-admin-lg py-admin-md text-right select-none">
                                        <button
                                            onClick={() => !disabled && onConfirm(p)}
                                            disabled={disabled}
                                            className={`px-admin-md py-admin-sm rounded font-admin-sans text-admin-body-sm transition-all shadow-sm ${
                                                disabled
                                                    ? 'bg-admin-outline-variant text-admin-on-surface-variant opacity-60 cursor-not-allowed'
                                                    : 'bg-admin-primary text-white hover:opacity-90 active:scale-95'
                                            }`}
                                        >
                                            {isPaid ? 'Đã chi trả' : isRejected ? 'Từ chối' : 'Xác nhận chi trả'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
