import type { AdminDashboardStatsDto } from '../../../../types';
import { formatCompact, formatNumber } from '../utils';
import { GrowthBadge } from './GrowthBadge';
import { KpiSkeleton } from './DashboardSkeletons';

interface Props {
  stats: AdminDashboardStatsDto | null;
  loading: boolean;
}

export function DashboardKpiCards({ stats, loading }: Props) {
  if (loading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-admin-lg mb-admin-lg">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </section>
    );
  }

  if (!stats) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-admin-lg mb-admin-lg">
      <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 border-t-4 border-t-admin-secondary">
        <div className="flex justify-between items-start mb-admin-sm">
          <span className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">
            TỔNG NGƯỜI DÙNG
          </span>
          <span className="material-symbols-outlined text-admin-secondary">group</span>
        </div>
        <div className="flex items-baseline gap-admin-sm">
          <span className="font-admin-sans text-admin-display-lg font-bold text-admin-primary">
            {formatNumber(stats.totalUsers)}
          </span>
          <GrowthBadge percent={stats.userGrowthPercent} />
        </div>
      </div>

      <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 border-t-4 border-t-admin-on-secondary-container">
        <div className="flex justify-between items-start mb-admin-sm">
          <span className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">
            TỔNG DOANH THU (VNĐ)
          </span>
          <span className="material-symbols-outlined text-admin-on-secondary-container">payments</span>
        </div>
        <div className="flex items-baseline gap-admin-sm">
          <span className="font-admin-sans text-admin-display-lg font-bold text-admin-primary">
            {formatCompact(stats.totalRevenue)}
          </span>
          <GrowthBadge percent={stats.revenueGrowthPercent} />
        </div>
      </div>

      <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 border-t-4 border-t-admin-secondary-container">
        <div className="flex justify-between items-start mb-admin-sm">
          <span className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">
            ĐỐI TÁC ĐANG HOẠT ĐỘNG
          </span>
          <span className="material-symbols-outlined text-admin-secondary-container">handshake</span>
        </div>
        <div className="flex items-baseline gap-admin-sm">
          <span className="font-admin-sans text-admin-display-lg font-bold text-admin-primary">
            {formatNumber(stats.activePartners)}
          </span>
          <span className="text-admin-on-surface-variant text-sm font-medium">Đang hoạt động</span>
        </div>
      </div>

      <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 border-t-4 border-t-admin-tertiary">
        <div className="flex justify-between items-start mb-admin-sm">
          <span className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">
            ĐẶT CHỖ MỚI
          </span>
          <span className="material-symbols-outlined text-admin-tertiary">confirmation_number</span>
        </div>
        <div className="flex items-baseline gap-admin-sm">
          <span className="font-admin-sans text-admin-display-lg font-bold text-admin-primary">
            {formatNumber(stats.newBookings)}
          </span>
          <GrowthBadge percent={stats.bookingGrowthPercent} />
        </div>
      </div>
    </section>
  );
}
