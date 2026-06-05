import { useMemo } from 'react';
import type { AdminDashboardStatsDto } from '../../../../types';
import { ChartSkeleton, DoughnutSkeleton } from './DashboardSkeletons';

interface Props {
  stats: AdminDashboardStatsDto | null;
  loading: boolean;
}

export function DashboardCharts({ stats, loading }: Props) {
  const chartPath = useMemo(() => {
    if (!stats?.monthlyRevenue?.length) return { line: '', area: '', points: [], labels: [] };

    const data = stats.monthlyRevenue;
    const maxAmount = Math.max(...data.map(d => d.amount), 1);
    const padding = 5;

    const points = data.map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
      const y = 100 - padding - ((d.amount / maxAmount) * (100 - 2 * padding));
      return { x, y, month: d.month, amount: d.amount };
    });

    let line = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const midX = (points[i - 1].x + points[i].x) / 2;
      line += ` Q ${midX} ${points[i - 1].y} ${points[i].x} ${points[i].y}`;
    }

    const area = line + ` V 100 H ${points[0].x} Z`;

    return { line, area, points, labels: data.map(d => d.month) };
  }, [stats?.monthlyRevenue]);

  const circumference = 2 * Math.PI * 80;
  const staysDash = stats ? (stats.staysRevenuePercent / 100) * circumference : 0;
  const flightsDash = stats ? (stats.flightsRevenuePercent / 100) * circumference : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-admin-lg">
        <ChartSkeleton />
        <DoughnutSkeleton />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-admin-lg">
      <div className="xl:col-span-2 bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant">
        <div className="flex justify-between items-center mb-admin-xl">
          <div>
            <h3 className="font-admin-sans text-admin-headline-sm text-admin-primary">Tăng Trưởng Doanh Thu</h3>
            <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-sm">
              Xu hướng doanh thu 12 tháng gần nhất
            </p>
          </div>
          <div className="flex bg-admin-surface-container-low p-1 rounded-lg">
            <button className="px-admin-md py-1 text-xs font-bold bg-white rounded shadow-sm text-admin-primary">
              Theo tháng
            </button>
          </div>
        </div>
        <div className="h-[300px] w-full relative mb-admin-md border-l border-b border-admin-outline-variant flex items-end justify-between px-admin-md pb-admin-xs">
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          {chartPath.line && (
            <svg className="absolute inset-0 w-full h-full px-admin-md" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d={chartPath.area} fill="url(#revenueGrad)" opacity="0.1" />
              <path d={chartPath.line} fill="none" stroke="#115cb9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <defs>
                <linearGradient id="revenueGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#115cb9" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              {chartPath.points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} fill="#115cb9" r="1.5" />
              ))}
            </svg>
          )}
          <div className="absolute bottom-[-24px] inset-x-0 flex justify-between px-admin-md">
            {chartPath.labels.map((label, i) => (
              <span key={i} className="text-[10px] text-admin-on-surface-variant font-bold">{label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant flex flex-col">
        <h3 className="font-admin-sans text-admin-headline-sm mb-xs text-admin-primary">Phân Bổ Doanh Thu</h3>
        <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-sm mb-admin-xl">
          So sánh: Lưu trú vs. Vé máy bay
        </p>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 mb-admin-xl">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
              <circle cx="96" cy="96" fill="transparent" r="80" stroke="#eff4ff" strokeWidth="24"></circle>
              <circle
                className="transition-all duration-1000"
                cx="96" cy="96" fill="transparent" r="80"
                stroke="#002b5b"
                strokeDasharray={`${staysDash} ${circumference}`}
                strokeWidth="24"
              />
              <circle
                className="transition-all duration-1000"
                cx="96" cy="96" fill="transparent" r="80"
                stroke="#659dfe"
                strokeDasharray={`${flightsDash} ${circumference}`}
                strokeDashoffset={-staysDash}
                strokeWidth="24"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">100%</span>
              <span className="text-[10px] text-admin-on-surface-variant font-bold">TỔNG VẬN HÀNH</span>
            </div>
          </div>
          <div className="w-full space-y-admin-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-admin-sm">
                <div className="w-3 h-3 rounded-full bg-admin-primary-container"></div>
                <span className="font-admin-sans text-admin-body-md text-admin-on-surface">Lưu trú</span>
              </div>
              <span className="font-bold text-admin-primary">{stats.staysRevenuePercent}%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-admin-sm">
                <div className="w-3 h-3 rounded-full bg-admin-secondary-container"></div>
                <span className="font-admin-sans text-admin-body-md text-admin-on-surface">Vé máy bay</span>
              </div>
              <span className="font-bold text-admin-primary">{stats.flightsRevenuePercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
