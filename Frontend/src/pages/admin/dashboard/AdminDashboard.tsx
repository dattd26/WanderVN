import { useEffect, useState } from 'react';
import type { AdminDashboardStatsDto } from '../../../types';
import { dashboardService } from '../../../services';
import { DashboardKpiCards } from './components/DashboardKpiCards';
import { DashboardCharts } from './components/DashboardCharts';
import { DashboardActivities } from './components/DashboardActivities';

export function AdminDashboard() {
  const [animate, setAnimate] = useState(false);
  const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getStats();
        if (!cancelled) setStats(data);
      } catch (err: unknown) {
        if (!cancelled) setError((err as Error).message || 'Không thể tải dữ liệu Dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  if (error && !loading) {
    return (
      <div className={`p-admin-lg max-w-admin-container-max mx-auto w-full transition-opacity duration-500 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-error-container/10 border border-error/30 rounded-xl p-admin-xl text-center">
          <span className="material-symbols-outlined text-error text-4xl mb-4 block">error</span>
          <p className="font-admin-sans text-admin-headline-sm text-error mb-2">Lỗi tải Dashboard</p>
          <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-md mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-admin-primary text-white rounded-lg font-admin-sans font-bold hover:bg-admin-primary/90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-admin-lg max-w-admin-container-max mx-auto w-full transition-opacity duration-500 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}
    >
      <DashboardKpiCards stats={stats} loading={loading} />
      <DashboardCharts stats={stats} loading={loading} />
      <DashboardActivities stats={stats} loading={loading} />
    </div>
  );
}