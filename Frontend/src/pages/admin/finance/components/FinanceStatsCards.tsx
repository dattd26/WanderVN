import type { PayoutStatsDto } from '../../../../types';

interface Props {
    stats: PayoutStatsDto | null;
    pendingCount: number;
}

const formatVnd = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export function FinanceStatsCards({ stats, pendingCount }: Props) {
    const totalNetPending = stats?.totalNetPending ?? 0;
    const totalCommission = stats?.totalCommission ?? 0;
    const totalRevenue = stats?.totalRevenue ?? 0;
    const activePartners = stats?.activePartners ?? 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-admin-lg mb-admin-lg select-none">
            <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-secondary hover:shadow-sm transition-all duration-200">
                <div className="flex justify-between items-start mb-admin-sm">
                    <span className="text-admin-label-caps font-admin-sans text-admin-outline uppercase">
                        Tổng cần thanh toán
                    </span>
                    <span className="material-symbols-outlined text-admin-secondary opacity-60">pending_actions</span>
                </div>
                <h3 className="font-admin-sans text-admin-display-lg text-admin-primary">{formatVnd(totalNetPending)}</h3>
                <p className="text-admin-body-sm text-admin-secondary font-medium flex items-center gap-1 mt-2 font-admin-sans">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    {pendingCount} khoản đang chờ
                </p>
            </div>

            <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-tertiary-fixed-dim hover:shadow-sm transition-all duration-200">
                <div className="flex justify-between items-start mb-admin-sm">
                    <span className="text-admin-label-caps font-admin-sans text-admin-outline uppercase">
                        Tổng hoa hồng đã thu
                    </span>
                    <span className="material-symbols-outlined text-admin-tertiary-fixed-dim">account_balance_wallet</span>
                </div>
                <h3 className="font-admin-sans text-admin-display-lg text-admin-primary">{formatVnd(totalCommission)}</h3>
                <p className="text-admin-body-sm text-admin-outline flex items-center gap-1 mt-2 font-admin-sans">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    Thu nhập nền tảng
                </p>
            </div>

            <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-primary hover:shadow-sm transition-all duration-200">
                <div className="flex justify-between items-start mb-admin-sm">
                    <span className="text-admin-label-caps font-admin-sans text-admin-outline uppercase">
                        Tổng doanh thu (Gross)
                    </span>
                    <span className="material-symbols-outlined text-admin-primary opacity-70">paid</span>
                </div>
                <h3 className="font-admin-sans text-admin-display-lg text-admin-primary">{formatVnd(totalRevenue)}</h3>
                <p className="text-admin-body-sm text-admin-on-surface-variant mt-2 font-admin-sans">
                    Doanh thu nền tảng
                </p>
            </div>

            <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-on-tertiary-container hover:shadow-sm transition-all duration-200">
                <div className="flex justify-between items-start mb-admin-sm">
                    <span className="text-admin-label-caps font-admin-sans text-admin-outline uppercase">
                        Đối tác có giao dịch
                    </span>
                    <span className="material-symbols-outlined text-admin-on-tertiary-container opacity-60">handshake</span>
                </div>
                <h3 className="font-admin-sans text-admin-display-lg text-admin-primary">{activePartners}</h3>
                <p className="text-admin-body-sm text-admin-on-surface-variant mt-2 font-admin-sans">
                    Tham gia chu kỳ đối soát
                </p>
            </div>
        </div>
    );
}
