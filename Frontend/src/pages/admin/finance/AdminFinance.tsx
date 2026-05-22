import { useState } from 'react';

interface LedgerRecord {
  id: string;
  name: string;
  type: 'hotel' | 'bus' | 'restaurant' | 'cruise';
  revenue: number;
  commission: number;
  status: 'Pending' | 'Processing' | 'Scheduled' | 'Confirmed';
  icon: string;
}

export function AdminFinance() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Local state for ledger records
  const [records, setRecords] = useState<LedgerRecord[]>([
    {
      id: '#VN-8821',
      name: 'Luxury Resort & Spa Dalat',
      type: 'hotel',
      revenue: 12450.00,
      commission: 1867.50,
      status: 'Pending',
      icon: 'hotel',
    },
    {
      id: '#VN-4402',
      name: 'Trans-Vietnam Expeditions',
      type: 'bus',
      revenue: 5200.00,
      commission: 780.00,
      status: 'Scheduled',
      icon: 'directions_bus',
    },
    {
      id: '#VN-1093',
      name: 'Mekong Culinary Tours',
      type: 'restaurant',
      revenue: 8900.00,
      commission: 1335.00,
      status: 'Processing',
      icon: 'restaurant',
    },
    {
      id: '#VN-5561',
      name: 'Ha Long Bay Cruises Ltd',
      type: 'cruise',
      revenue: 24100.00,
      commission: 3615.00,
      status: 'Pending',
      icon: 'explore',
    },
  ]);

  const handleConfirmPayment = (id: string) => {
    setRecords(prev =>
      prev.map(rec => (rec.id === id ? { ...rec, status: 'Confirmed' } : rec))
    );
  };

  const getStatusBadge = (status: LedgerRecord['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-block px-admin-sm py-[2px] rounded text-[10px] font-bold uppercase bg-error-container text-on-error-container font-admin-sans">
            Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-block px-admin-sm py-[2px] rounded text-[10px] font-bold uppercase bg-admin-secondary-container/30 text-admin-on-secondary-container font-admin-sans">
            Processing
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-block px-admin-sm py-[2px] rounded text-[10px] font-bold uppercase bg-admin-surface-variant text-admin-on-surface-variant font-admin-sans">
            Scheduled
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-block px-admin-sm py-[2px] rounded text-[10px] font-bold uppercase bg-green-100 text-green-800 border border-green-200 font-admin-sans">
            Confirmed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-admin-lg max-w-admin-container-max mx-auto w-full">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-admin-lg mb-admin-lg select-none">
        {/* Metric 1 */}
        <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-secondary hover:shadow-sm transition-all duration-200">
          <div className="flex justify-between items-start mb-admin-sm">
            <span className="text-admin-label-caps font-admin-sans text-admin-outline uppercase">
              Total to be Paid
            </span>
            <span className="material-symbols-outlined text-admin-secondary opacity-60">pending_actions</span>
          </div>
          <h3 className="font-admin-sans text-admin-display-lg text-admin-primary">
            $142,850.00
          </h3>
          <p className="text-admin-body-sm text-admin-secondary font-medium flex items-center gap-1 mt-2 font-admin-sans">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            +12.5% from last period
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-tertiary-fixed-dim hover:shadow-sm transition-all duration-200">
          <div className="flex justify-between items-start mb-admin-sm">
            <span className="text-admin-label-caps font-admin-sans text-admin-outline uppercase">
              Total Commission Earned
            </span>
            <span className="material-symbols-outlined text-admin-tertiary-fixed-dim">account_balance_wallet</span>
          </div>
          <h3 className="font-admin-sans text-admin-display-lg text-admin-primary">
            $34,210.45
          </h3>
          <p className="text-admin-body-sm text-admin-outline flex items-center gap-1 mt-2 font-admin-sans">
            <span className="material-symbols-outlined text-sm">info</span>
            Target: $40,000.00
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-on-tertiary-container hover:shadow-sm transition-all duration-200">
          <div className="flex justify-between items-start mb-admin-sm">
            <span className="text-admin-label-caps font-admin-sans text-admin-outline uppercase">
              Active Partners
            </span>
            <span className="material-symbols-outlined text-admin-on-tertiary-container opacity-60">handshake</span>
          </div>
          <h3 className="font-admin-sans text-admin-display-lg text-admin-primary">84</h3>
          <p className="text-admin-body-sm text-admin-on-surface-variant mt-2 font-admin-sans">
            {records.filter(r => r.status === 'Pending').length} Pending Reconciliation
          </p>
        </div>
      </div>

      {/* Reconciliation Controls */}
      <div className="bg-white p-admin-md border border-admin-outline-variant rounded-lg mb-admin-lg flex flex-wrap items-end gap-admin-lg select-none">
        <div className="flex-grow min-w-[240px]">
          <div className="grid grid-cols-2 gap-admin-md">
            <div>
              <label className="block font-admin-sans text-admin-body-sm font-bold text-admin-on-surface mb-admin-xs">
                From Date
              </label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-admin-outline-variant rounded p-2 text-admin-body-md focus:ring-admin-secondary focus:border-admin-secondary outline-none text-admin-on-surface transition-all font-admin-sans"
              />
            </div>
            <div>
              <label className="block font-admin-sans text-admin-body-sm font-bold text-admin-on-surface mb-admin-xs">
                To Date
              </label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-admin-outline-variant rounded p-2 text-admin-body-md focus:ring-admin-secondary focus:border-admin-secondary outline-none text-admin-on-surface transition-all font-admin-sans"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-admin-md font-admin-sans">
          <button className="bg-admin-primary text-white px-admin-lg py-2 rounded font-bold hover:bg-admin-primary-container transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Filter
          </button>
          <button className="border border-admin-outline-variant text-admin-on-surface bg-white px-admin-lg py-2 rounded font-bold hover:bg-admin-surface-container transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Financial Table */}
      <div className="bg-white border border-admin-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-admin-surface-container-low border-b border-admin-outline-variant select-none">
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-outline uppercase">Partner Name</th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-outline uppercase">Total Revenue</th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-outline uppercase">Platform Commission (15%)</th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-primary uppercase">Net Amount for Partner</th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-outline uppercase text-center">Status</th>
                <th className="px-admin-lg py-admin-md text-admin-label-caps font-admin-sans text-admin-outline uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-outline-variant/30">
              {records.map((rec) => {
                const netAmount = rec.revenue - rec.commission;
                const isConfirmed = rec.status === 'Confirmed';

                return (
                  <tr key={rec.id} className="hover:bg-admin-surface-container-low/50 transition-colors">
                    <td className="px-admin-lg py-admin-md">
                      <div className="flex items-center gap-admin-md">
                        <div className="w-8 h-8 rounded bg-admin-secondary-container/20 flex items-center justify-center text-admin-secondary">
                          <span className="material-symbols-outlined">{rec.icon}</span>
                        </div>
                        <div>
                          <p className="font-admin-sans text-admin-body-md font-bold text-admin-on-surface">
                            {rec.name}
                          </p>
                          <p className="text-[10px] text-admin-outline font-admin-mono">
                            Partner ID: {rec.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-admin-lg py-admin-md font-admin-mono text-admin-body-md text-admin-on-surface">
                      ${rec.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-admin-lg py-admin-md font-admin-mono text-admin-body-md text-error font-bold">
                      -${rec.commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-admin-lg py-admin-md font-admin-mono text-admin-body-md font-bold text-admin-secondary">
                      ${netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-admin-lg py-admin-md text-center select-none">
                      {getStatusBadge(rec.status)}
                    </td>
                    <td className="px-admin-lg py-admin-md text-right select-none">
                      <button 
                        onClick={() => !isConfirmed && handleConfirmPayment(rec.id)}
                        disabled={isConfirmed}
                        className={`px-admin-md py-admin-sm rounded font-admin-sans text-admin-body-sm transition-all shadow-sm ${
                          isConfirmed 
                            ? 'bg-admin-outline-variant text-admin-on-surface-variant opacity-60 cursor-not-allowed' 
                            : 'bg-admin-primary text-white hover:opacity-90 active:scale-95'
                        }`}
                      >
                        {isConfirmed ? 'Confirmed' : 'Confirm Payment'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-admin-lg py-admin-md border-t border-admin-outline-variant flex items-center justify-between select-none">
          <p className="text-admin-body-sm text-admin-outline font-admin-sans">Showing 1 to {records.length} of 84 partners</p>
          <div className="flex items-center gap-admin-xs font-admin-sans">
            <button className="p-1 rounded hover:bg-admin-surface-container transition-colors opacity-40 cursor-not-allowed" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-admin-primary text-white text-body-sm font-bold text-xs">1</button>
            <button className="w-8 h-8 rounded hover:bg-admin-surface-container text-body-sm text-xs text-admin-primary font-bold">2</button>
            <button className="w-8 h-8 rounded hover:bg-admin-surface-container text-body-sm text-xs text-admin-primary font-bold">3</button>
            <span className="px-2 text-admin-outline font-bold">...</span>
            <button className="w-8 h-8 rounded hover:bg-admin-surface-container text-body-sm text-xs text-admin-primary font-bold">21</button>
            <button className="p-1 rounded hover:bg-admin-surface-container transition-colors text-admin-primary">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Trail / Footer Info */}
      <div className="mt-admin-xl grid grid-cols-1 md:grid-cols-2 gap-admin-lg opacity-80 select-none">
        <div className="bg-admin-surface-container-low p-admin-md rounded-lg border border-admin-outline-variant/30">
          <h4 className="font-admin-sans text-admin-label-caps text-admin-on-surface mb-admin-sm flex items-center gap-2 font-bold uppercase">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            Reconciliation Policy
          </h4>
          <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans leading-relaxed">
            Payments are processed every Friday for transactions completed within the previous Sunday-Saturday cycle. Platform commission is fixed at 15% unless specified in partner contract amendments.
          </p>
        </div>
        <div className="bg-admin-surface-container-low p-admin-md rounded-lg border border-admin-outline-variant/30">
          <h4 className="font-admin-sans text-admin-label-caps text-admin-on-surface mb-admin-sm flex items-center gap-2 font-bold uppercase">
            <span className="material-symbols-outlined text-[16px]">history</span>
            Last Reconciliation
          </h4>
          <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans leading-relaxed">
            Last automated settlement run: <b>Oct 20, 2023, 03:00 AM</b>. <br />Manual overrides identified in current period: 0.
          </p>
        </div>
      </div>
    </div>
  );
}
