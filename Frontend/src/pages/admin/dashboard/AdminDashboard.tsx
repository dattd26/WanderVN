import { useEffect, useState } from 'react';

interface SystemLog {
  id: string;
  type: 'partner' | 'booking' | 'payout' | 'content';
  title: string;
  detail: string;
  time: string;
  date: string;
  icon: string;
  bgIconClass: string;
  textIconClass: string;
}

export function AdminDashboard() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const logs: SystemLog[] = [
    {
      id: 'log-1',
      type: 'partner',
      title: 'New partner registration: Indochine Resorts',
      detail: 'Approved by AI verification engine',
      time: '14:22:10',
      date: 'TODAY',
      icon: 'person_add',
      bgIconClass: 'bg-admin-secondary-container/10',
      textIconClass: 'text-admin-secondary',
    },
    {
      id: 'log-2',
      type: 'booking',
      title: 'Booking completed #WVN-99214-X',
      detail: 'Hanoi ➔ Da Nang (Eco-Flight + Deluxe Villa)',
      time: '13:45:02',
      date: 'TODAY',
      icon: 'check_circle',
      bgIconClass: 'bg-admin-tertiary-container/10',
      textIconClass: 'text-admin-on-tertiary-container',
    },
    {
      id: 'log-3',
      type: 'payout',
      title: 'Payout processing delayed',
      detail: 'Vietcombank API timeout affecting 12 partners',
      time: '11:15:30',
      date: 'TODAY',
      icon: 'warning',
      bgIconClass: 'bg-error-container/10',
      textIconClass: 'text-error',
    },
    {
      id: 'log-4',
      type: 'content',
      title: 'Quarterly Content Update',
      detail: 'Published 45 new destination guides for Sapa region',
      time: 'Yesterday',
      date: '22:00:00',
      icon: 'description',
      bgIconClass: 'bg-admin-secondary-container/10',
      textIconClass: 'text-admin-secondary',
    },
  ];

  return (
    <div
      className={`p-admin-lg max-w-admin-container-max mx-auto w-full transition-opacity duration-500 ease-out ${animate ? 'opacity-100' : 'opacity-0'
        }`}
    >
      {/* KPI Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-admin-lg mb-admin-lg">
        {/* Metric Card: Users */}
        <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 border-t-4 border-t-admin-secondary">
          <div className="flex justify-between items-start mb-admin-sm">
            <span className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">
              TOTAL USERS
            </span>
            <span className="material-symbols-outlined text-admin-secondary">group</span>
          </div>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-display-lg font-bold text-admin-primary">
              124,802
            </span>
            <span className="text-admin-secondary text-sm font-bold flex items-center">
              <span className="material-symbols-outlined text-sm mr-0.5">arrow_upward</span> 12%
            </span>
          </div>
        </div>

        {/* Metric Card: Revenue */}
        <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 border-t-4 border-t-admin-on-secondary-container">
          <div className="flex justify-between items-start mb-admin-sm">
            <span className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">
              TOTAL REVENUE (VND)
            </span>
            <span className="material-symbols-outlined text-admin-on-secondary-container">payments</span>
          </div>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-display-lg font-bold text-admin-primary">
              1.82B
            </span>
            <span className="text-admin-secondary text-sm font-bold flex items-center">
              <span className="material-symbols-outlined text-sm mr-0.5">arrow_upward</span> 8.4%
            </span>
          </div>
        </div>

        {/* Metric Card: Partners */}
        <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 border-t-4 border-t-admin-secondary-container">
          <div className="flex justify-between items-start mb-admin-sm">
            <span className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">
              ACTIVE PARTNERS
            </span>
            <span className="material-symbols-outlined text-admin-secondary-container">handshake</span>
          </div>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-display-lg font-bold text-admin-primary">
              1,402
            </span>
            <span className="text-admin-on-surface-variant text-sm font-medium">Stable</span>
          </div>
        </div>

        {/* Metric Card: Bookings */}
        <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 border-t-4 border-t-admin-tertiary">
          <div className="flex justify-between items-start mb-admin-sm">
            <span className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">
              NEW BOOKINGS
            </span>
            <span className="material-symbols-outlined text-admin-tertiary">confirmation_number</span>
          </div>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-display-lg font-bold text-admin-primary">
              3,890
            </span>
            <span className="text-error text-sm font-bold flex items-center">
              <span className="material-symbols-outlined text-sm mr-0.5">arrow_downward</span> 2.1%
            </span>
          </div>
        </div>
      </section>

      {/* Visualization Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-admin-lg">
        {/* Line Chart: Revenue Growth */}
        <div className="xl:col-span-2 bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant">
          <div className="flex justify-between items-center mb-admin-xl">
            <div>
              <h3 className="font-admin-sans text-admin-headline-sm text-admin-primary">Revenue Growth</h3>
              <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-sm">
                Monthly performance trends for FY 2024
              </p>
            </div>
            <div className="flex bg-admin-surface-container-low p-1 rounded-lg">
              <button className="px-admin-md py-1 text-xs font-bold bg-white rounded shadow-sm text-admin-primary">
                Monthly
              </button>
              <button className="px-admin-md py-1 text-xs font-bold text-admin-on-surface-variant hover:text-admin-primary">
                Quarterly
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full relative mb-admin-md border-l border-b border-admin-outline-variant flex items-end justify-between px-admin-md pb-admin-xs">
            {/* Simple Grid Lines background */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />
            {/* Simple SVG Visualization for Revenue Growth */}
            <svg className="absolute inset-0 w-full h-full px-admin-md" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path
                d="M 0 80 Q 20 70 40 75 T 80 30 T 100 20"
                fill="none"
                stroke="#115cb9"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 0 80 Q 20 70 40 75 T 80 30 T 100 20 V 100 H 0 Z"
                fill="url(#revenueGrad)"
                opacity="0.1"
              />
              <defs>
                <linearGradient id="revenueGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#115cb9" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <circle cx="40" cy="75" fill="#115cb9" r="2" />
              <circle cx="80" cy="30" fill="#115cb9" r="2" />
            </svg>
            {/* X-Axis Labels */}
            <div className="absolute bottom-[-24px] inset-x-0 flex justify-between px-admin-md">
              <span className="text-[10px] text-admin-on-surface-variant font-bold">JAN</span>
              <span className="text-[10px] text-admin-on-surface-variant font-bold">MAR</span>
              <span className="text-[10px] text-admin-on-surface-variant font-bold">MAY</span>
              <span className="text-[10px] text-admin-on-surface-variant font-bold">JUL</span>
              <span className="text-[10px] text-admin-on-surface-variant font-bold">SEP</span>
              <span className="text-[10px] text-admin-on-surface-variant font-bold">NOV</span>
            </div>
          </div>
        </div>

        {/* Doughnut Chart: Revenue Distribution */}
        <div className="bg-admin-surface-container-lowest p-admin-lg rounded-xl border border-admin-outline-variant flex flex-col">
          <h3 className="font-admin-sans text-admin-headline-sm mb-xs text-admin-primary">Revenue Distribution</h3>
          <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-sm mb-admin-xl">
            Comparison: Stays vs. Flights
          </p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-admin-xl">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                <circle cx="96" cy="96" fill="transparent" r="80" stroke="#eff4ff" strokeWidth="24"></circle>
                <circle
                  className="transition-all duration-1000"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="80"
                  stroke="#002b5b"
                  strokeDasharray="502"
                  strokeDashoffset="150"
                  strokeWidth="24"
                />
                <circle
                  className="transition-all duration-1000"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="80"
                  stroke="#659dfe"
                  strokeDasharray="502"
                  strokeDashoffset="400"
                  strokeWidth="24"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">100%</span>
                <span className="text-[10px] text-admin-on-surface-variant font-bold">TOTAL OPS</span>
              </div>
            </div>
            <div className="w-full space-y-admin-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-admin-sm">
                  <div className="w-3 h-3 rounded-full bg-admin-primary-container"></div>
                  <span className="font-admin-sans text-admin-body-md text-admin-on-surface">Stays</span>
                </div>
                <span className="font-bold text-admin-primary">65%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-admin-sm">
                  <div className="w-3 h-3 rounded-full bg-admin-secondary-container"></div>
                  <span className="font-admin-sans text-admin-body-md text-admin-on-surface">Flights</span>
                </div>
                <span className="font-bold text-admin-primary">35%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Activity Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-admin-lg mt-admin-lg">
        {/* Recent Activity List */}
        <section className="xl:col-span-3 bg-admin-surface-container-lowest rounded-xl border border-admin-outline-variant overflow-hidden">
          <div className="p-admin-lg border-b border-admin-outline-variant flex justify-between items-center">
            <h3 className="font-admin-sans text-admin-headline-sm text-admin-primary">System Logs &amp; Activity</h3>
            <button className="text-admin-secondary text-sm font-bold hover:underline font-admin-sans">
              View Audit Trail
            </button>
          </div>
          <div className="divide-y divide-admin-outline-variant">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-admin-md flex items-center gap-admin-lg hover:bg-admin-surface-container transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${log.bgIconClass} flex items-center justify-center ${log.textIconClass}`}>
                  <span className="material-symbols-outlined">{log.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-admin-sans text-admin-body-md font-bold text-admin-primary">
                    {log.title}
                  </p>
                  <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-sm">
                    {log.detail}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-admin-mono text-admin-data-mono text-xs text-admin-on-surface-variant">
                    {log.time}
                  </p>
                  <p className="text-[10px] text-admin-on-surface-variant font-bold font-admin-sans">
                    {log.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
