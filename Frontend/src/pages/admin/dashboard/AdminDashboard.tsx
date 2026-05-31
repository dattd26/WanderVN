import { useEffect, useState, useMemo } from 'react';
import type { AdminDashboardStatsDto } from '../../../types';
import { dashboardService } from '../../../services';

// ── Hàm tiện ích ──────────────────────────────────────────────────────

/** Format số lớn: 1200000000 → "1.2B", 1500000 → "1.5M", 12500 → "12.5K" */
function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'B';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.?0+$/, '') + 'K';
  return value.toLocaleString('vi-VN');
}

/** Format số nguyên với dấu phẩy: 124802 → "124,802" */
function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

/** Format thời gian tương đối: "2 phút trước", "3 giờ trước"... */
function formatRelativeTime(isoTime: string): { time: string; date: string } {
  const d = new Date(isoTime);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (diffDays === 0) return { time: timeStr, date: 'HÔM NAY' };
  if (diffDays === 1) return { time: timeStr, date: 'HÔM QUA' };
  if (diffDays < 7) return { time: timeStr, date: `${diffDays} NGÀY TRƯỚC` };
  return { time: timeStr, date: d.toLocaleDateString('vi-VN') };
}

/** Map loại hoạt động → icon + classes */
function getActivityStyle(type: string) {
  switch (type) {
    case 'partner':
      return { icon: 'person_add', bgIconClass: 'bg-admin-secondary-container/10', textIconClass: 'text-admin-secondary' };
    case 'booking':
      return { icon: 'confirmation_number', bgIconClass: 'bg-admin-tertiary-container/10', textIconClass: 'text-admin-on-tertiary-container' };
    case 'payout':
      return { icon: 'payments', bgIconClass: 'bg-admin-on-secondary-container/10', textIconClass: 'text-admin-on-secondary-container' };
    default:
      return { icon: 'info', bgIconClass: 'bg-admin-secondary-container/10', textIconClass: 'text-admin-secondary' };
  }
}

// ── Skeleton Components ──────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant border-t-4 border-t-admin-outline-variant animate-pulse">
      <div className="flex justify-between items-start mb-admin-sm">
        <div className="h-3 w-24 bg-admin-surface-container rounded" />
        <div className="h-6 w-6 bg-admin-surface-container rounded" />
      </div>
      <div className="flex items-baseline gap-admin-sm">
        <div className="h-8 w-32 bg-admin-surface-container rounded" />
        <div className="h-4 w-12 bg-admin-surface-container rounded" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="xl:col-span-2 bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant animate-pulse">
      <div className="h-5 w-40 bg-admin-surface-container rounded mb-2" />
      <div className="h-3 w-60 bg-admin-surface-container rounded mb-8" />
      <div className="h-[300px] w-full bg-admin-surface-container rounded" />
    </div>
  );
}

function DoughnutSkeleton() {
  return (
    <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant animate-pulse flex flex-col items-center">
      <div className="h-5 w-40 bg-admin-surface-container rounded mb-2 self-start" />
      <div className="h-3 w-52 bg-admin-surface-container rounded mb-8 self-start" />
      <div className="w-48 h-48 rounded-full bg-admin-surface-container mb-6" />
      <div className="w-full space-y-3">
        <div className="h-4 w-full bg-admin-surface-container rounded" />
        <div className="h-4 w-full bg-admin-surface-container rounded" />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <section className="xl:col-span-3 bg-admin-surface-container-lowest rounded-xl border border-admin-outline-variant overflow-hidden animate-pulse">
      <div className="p-admin-lg border-b border-admin-outline-variant flex justify-between items-center">
        <div className="h-5 w-48 bg-admin-surface-container rounded" />
        <div className="h-4 w-28 bg-admin-surface-container rounded" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-admin-md flex items-center gap-admin-lg border-b border-admin-outline-variant last:border-0">
          <div className="w-10 h-10 rounded-full bg-admin-surface-container" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-admin-surface-container rounded" />
            <div className="h-3 w-1/2 bg-admin-surface-container rounded" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-3 w-16 bg-admin-surface-container rounded ml-auto" />
            <div className="h-3 w-12 bg-admin-surface-container rounded ml-auto" />
          </div>
        </div>
      ))}
    </section>
  );
}

// ── Component Huy Hiệu Tăng Trưởng ───────────────────────────────────────

function GrowthBadge({ percent }: { percent: number }) {
  if (percent === 0) {
    return <span className="text-admin-on-surface-variant text-sm font-medium">Ổn định</span>;
  }
  const isPositive = percent > 0;
  return (
    <span className={`${isPositive ? 'text-admin-secondary' : 'text-error'} text-sm font-bold flex items-center`}>
      <span className="material-symbols-outlined text-sm mr-0.5">
        {isPositive ? 'arrow_upward' : 'arrow_downward'}
      </span>
      {Math.abs(percent)}%
    </span>
  );
}

// ── Component Chính ───────────────────────────────────────────────

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
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Không thể tải dữ liệu Dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  // ── Đường dẫn biểu đồ doanh thu (SVG) ──
  const chartPath = useMemo(() => {
    if (!stats?.monthlyRevenue?.length) return { line: '', area: '', points: [], labels: [] };

    const data = stats.monthlyRevenue;
    const maxAmount = Math.max(...data.map(d => d.amount), 1);
    const padding = 5; // % padding trên/dưới

    const points = data.map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
      const y = 100 - padding - ((d.amount / maxAmount) * (100 - 2 * padding));
      return { x, y, month: d.month, amount: d.amount };
    });

    // Đường cong mượt dùng quadratic bezier
    let line = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const midX = (points[i - 1].x + points[i].x) / 2;
      line += ` Q ${midX} ${points[i - 1].y} ${points[i].x} ${points[i].y}`;
    }

    const area = line + ` V 100 H ${points[0].x} Z`;

    return { line, area, points, labels: data.map(d => d.month) };
  }, [stats?.monthlyRevenue]);

  // ── Giá trị biểu đồ tròn ──
  const circumference = 2 * Math.PI * 80; // ~502
  const staysDash = stats ? (stats.staysRevenuePercent / 100) * circumference : 0;
  const flightsDash = stats ? (stats.flightsRevenuePercent / 100) * circumference : 0;
  const staysOffset = circumference - staysDash;
  const flightsOffset = circumference - flightsDash;
  // Cung vé máy bay bắt đầu sau khi cung lưu trú kết thúc
  const flightsRotation = stats ? (stats.staysRevenuePercent / 100) * 360 : 0;

  // ── Trạng thái lỗi ──
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
      className={`p-admin-lg max-w-admin-container-max mx-auto w-full transition-opacity duration-500 ease-out ${animate ? 'opacity-100' : 'opacity-0'
        }`}
    >
      {/* Phần KPI */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-admin-lg mb-admin-lg">
        {loading ? (
          <>
            <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
          </>
        ) : stats && (
          <>
            {/* Thẻ chỉ số: Người dùng */}
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

            {/* Thẻ chỉ số: Doanh thu */}
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

            {/* Thẻ chỉ số: Đối tác */}
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

            {/* Thẻ chỉ số: Đặt chỗ */}
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
          </>
        )}
      </section>

      {/* Lưới biểu đồ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-admin-lg">
        {loading ? (
          <>
            <ChartSkeleton />
            <DoughnutSkeleton />
          </>
        ) : stats && (
          <>
            {/* Biểu đồ đường: Tăng trưởng doanh thu */}
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
                {/* Đường kẻ nền */}
                <div
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />
                {/* SVG động */}
                {chartPath.line && (
                  <svg className="absolute inset-0 w-full h-full px-admin-md" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path
                      d={chartPath.area}
                      fill="url(#revenueGrad)"
                      opacity="0.1"
                    />
                    <path
                      d={chartPath.line}
                      fill="none"
                      stroke="#115cb9"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
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
                {/* Nhãn trục X */}
                <div className="absolute bottom-[-24px] inset-x-0 flex justify-between px-admin-md">
                  {chartPath.labels.map((label, i) => (
                    <span key={i} className="text-[10px] text-admin-on-surface-variant font-bold">{label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Biểu đồ tròn: Phân bổ doanh thu */}
            <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant flex flex-col">
              <h3 className="font-admin-sans text-admin-headline-sm mb-xs text-admin-primary">Phân Bổ Doanh Thu</h3>
              <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-sm mb-admin-xl">
                So sánh: Lưu trú vs. Vé máy bay
              </p>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 mb-admin-xl">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                    {/* Vòng tròn nền */}
                    <circle cx="96" cy="96" fill="transparent" r="80" stroke="#eff4ff" strokeWidth="24"></circle>
                    {/* Cung lưu trú */}
                    <circle
                      className="transition-all duration-1000"
                      cx="96" cy="96" fill="transparent" r="80"
                      stroke="#002b5b"
                      strokeDasharray={`${staysDash} ${circumference}`}
                      strokeWidth="24"
                    />
                    {/* Cung vé máy bay */}
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
          </>
        )}
      </div>

      {/* Phần nhật ký hoạt động */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-admin-lg mt-admin-lg">
        {loading ? (
          <ActivitySkeleton />
        ) : stats && (
          <section className="xl:col-span-3 bg-admin-surface-container-lowest rounded-xl border border-admin-outline-variant overflow-hidden">
            <div className="p-admin-lg border-b border-admin-outline-variant flex justify-between items-center">
              <h3 className="font-admin-sans text-admin-headline-sm text-admin-primary">Nhật Ký &amp; Hoạt Động Hệ Thống</h3>
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
        )}
      </div>
    </div>
  );
}