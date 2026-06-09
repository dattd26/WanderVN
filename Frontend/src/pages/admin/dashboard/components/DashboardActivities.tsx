import type { AdminDashboardStatsDto } from '../../../../types';
import { formatRelativeTime, getActivityStyle } from '../utils';
import { ActivitySkeleton } from './DashboardSkeletons';

interface Props {
  stats: AdminDashboardStatsDto | null;
  loading: boolean;
}

export function DashboardActivities({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-admin-lg mt-admin-lg">
        <ActivitySkeleton />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-admin-lg mt-admin-lg">
      <section className="xl:col-span-3 bg-admin-surface-container-lowest rounded-xl border border-admin-outline-variant overflow-hidden">
        <div className="p-admin-lg border-b border-admin-outline-variant flex justify-between items-center">
          <h3 className="font-admin-sans text-admin-headline-sm text-admin-primary">Nhật Ký & Hoạt Động Hệ Thống</h3>
          <span className="text-admin-on-surface-variant text-sm font-admin-sans">
            {stats.recentActivities.length} hoạt động gần nhất
          </span>
        </div>
        <div className="divide-y divide-admin-outline-variant">
          {stats.recentActivities.length === 0 ? (
            <div className="p-admin-xl text-center text-admin-on-surface-variant font-admin-sans">
              <span className="material-symbols-outlined text-3xl mb-2 block opacity-40">inbox</span>
              Chưa có hoạt động nào.
            </div>
          ) : (
            stats.recentActivities.map((activity, index) => {
              const style = getActivityStyle(activity.type);
              const { time, date } = formatRelativeTime(activity.time);
              return (
                <div
                  key={index}
                  className="p-admin-md flex items-center gap-admin-lg hover:bg-admin-surface-container transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full ${style.bgIconClass} flex items-center justify-center ${style.textIconClass}`}>
                    <span className="material-symbols-outlined">{style.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-admin-sans text-admin-body-md font-bold text-admin-primary">
                      {activity.title}
                    </p>
                    <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-sm">
                      {activity.detail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-admin-mono text-admin-data-mono text-xs text-admin-on-surface-variant">
                      {time}
                    </p>
                    <p className="text-[10px] text-admin-on-surface-variant font-bold font-admin-sans">
                      {date}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
