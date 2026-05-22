import { useState } from 'react';

interface PartnerApplication {
  id: string;
  name: string;
  type: 'Stay' | 'Flight';
  time: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  icon: string;
}

interface ActivePartner {
  id: string;
  name: string;
  type: 'Stay' | 'Flight';
  location: string;
  joined: string;
  revenue: string;
  active: boolean;
  initials: string;
  initialsBg: string;
  initialsText: string;
}

export function AdminPartners() {
  const [activeTab, setActiveTab] = useState<'pending' | 'list'>('pending');
  
  // Local state for applications under "Pending Approval"
  const [applications, setApplications] = useState<PartnerApplication[]>([
    {
      id: 'APP-2023-882',
      name: 'The Grand Azure Da Nang',
      type: 'Stay',
      time: 'Received 4h ago',
      status: 'Pending',
      icon: 'hotel',
    },
    {
      id: 'APP-2023-885',
      name: 'SkyHigh Regional Air',
      type: 'Flight',
      time: 'Received 12h ago',
      status: 'Pending',
      icon: 'flight_takeoff',
    },
    {
      id: 'APP-2023-889',
      name: 'Heritage Suites Hue',
      type: 'Stay',
      time: 'Received 1d ago',
      status: 'Pending',
      icon: 'hotel',
    },
  ]);

  // Local state for verified partners under "Partner List"
  const [partners, setPartners] = useState<ActivePartner[]>([
    {
      id: 'pt-1',
      name: 'Vinpearl Resorts Group',
      type: 'Stay',
      location: '12 Sites (VN)',
      joined: 'Oct 12, 2021',
      revenue: '$1.2M',
      active: true,
      initials: 'V',
      initialsBg: 'bg-admin-secondary-container',
      initialsText: 'text-admin-on-secondary-container',
    },
    {
      id: 'pt-2',
      name: 'Bamboo Airways',
      type: 'Flight',
      location: 'Domestic/Intl',
      joined: 'Jan 05, 2022',
      revenue: '$840K',
      active: true,
      initials: 'B',
      initialsBg: 'bg-admin-secondary-fixed',
      initialsText: 'text-admin-on-secondary-fixed',
    },
    {
      id: 'pt-3',
      name: 'Mekong Delta Tours',
      type: 'Stay',
      location: 'Can Tho',
      joined: 'Mar 19, 2023',
      revenue: '$12K',
      active: false,
      initials: 'M',
      initialsBg: 'bg-error-container',
      initialsText: 'text-admin-on-error-container',
    },
  ]);

  const handleApprove = (id: string) => {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, status: 'Approved' } : app))
    );

    // Find the approved application
    const approvedApp = applications.find(app => app.id === id);
    if (approvedApp) {
      // Simulate adding approved partner to the active list
      const newPartner: ActivePartner = {
        id: `pt-${Date.now()}`,
        name: approvedApp.name,
        type: approvedApp.type,
        location: 'TBD',
        joined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        revenue: '$0',
        active: true,
        initials: approvedApp.name.charAt(0),
        initialsBg: approvedApp.type === 'Stay' ? 'bg-admin-surface-variant' : 'bg-admin-secondary-fixed',
        initialsText: approvedApp.type === 'Stay' ? 'text-admin-on-surface' : 'text-admin-on-secondary-fixed',
      };
      setPartners(prev => [newPartner, ...prev]);
    }
  };

  const handleReject = (id: string) => {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, status: 'Rejected' } : app))
    );
  };

  const handleTogglePartner = (id: string) => {
    setPartners(prev =>
      prev.map(p => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  return (
    <div className="p-admin-xl space-y-admin-lg max-w-admin-container-max mx-auto w-full">
      {/* Statistics Row (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-admin-lg select-none">
        <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-secondary shadow-sm">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-xs uppercase">
            TOTAL PARTNERS
          </p>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">1,284</span>
            <span className="text-xs text-admin-secondary font-bold">+12%</span>
          </div>
        </div>
        <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-tertiary-fixed-dim shadow-sm">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-xs uppercase">
            PENDING APPROVAL
          </p>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
              {applications.filter(app => app.status === 'Pending').length}
            </span>
            <span className="text-xs text-admin-on-tertiary-fixed-variant font-bold">Urgent</span>
          </div>
        </div>
        <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-secondary-container shadow-sm">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-xs uppercase">
            STAY PARTNERS
          </p>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
              {partners.filter(p => p.type === 'Stay').length + 853}
            </span>
          </div>
        </div>
        <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-primary shadow-sm">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-xs uppercase">
            FLIGHT PARTNERS
          </p>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
              {partners.filter(p => p.type === 'Flight').length + 427}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-lg border border-admin-outline-variant shadow-sm overflow-hidden">
        <div className="flex border-b border-admin-outline-variant px-admin-lg bg-admin-surface-container-lowest select-none">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-admin-xl py-admin-lg font-admin-sans text-admin-body-md transition-all ${
              activeTab === 'pending'
                ? 'border-b-2 border-admin-primary text-admin-primary font-bold'
                : 'text-admin-on-surface-variant hover:text-admin-primary'
            }`}
          >
            Pending Approval
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-admin-xl py-admin-lg font-admin-sans text-admin-body-md transition-all ${
              activeTab === 'list'
                ? 'border-b-2 border-admin-primary text-admin-primary font-bold'
                : 'text-admin-on-surface-variant hover:text-admin-primary'
            }`}
          >
            Partner List
          </button>
        </div>

        {/* Tab 1: Pending Approval Content */}
        {activeTab === 'pending' && (
          <div className="p-admin-lg">
            <div className="space-y-admin-md">
              {applications.length > 0 ? (
                applications.map((app) => {
                  const isApproved = app.status === 'Approved';
                  const isRejected = app.status === 'Rejected';
                  
                  return (
                    <div 
                      key={app.id} 
                      className="flex items-center justify-between p-admin-lg border border-admin-outline-variant rounded-lg hover:shadow-md transition-all bg-white group"
                      style={{ opacity: isApproved || isRejected ? 0.6 : 1 }}
                    >
                      <div className="flex items-center gap-admin-lg">
                        <div className="w-16 h-16 rounded bg-admin-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-admin-secondary scale-125">
                            {app.icon}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-admin-sm">
                            <h3 className="font-admin-sans text-admin-body-lg font-bold text-admin-primary">
                              {app.name}
                            </h3>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                              app.type === 'Stay' ? 'bg-admin-surface-variant text-admin-on-surface' : 'bg-admin-secondary-fixed text-admin-on-secondary-fixed-variant'
                            }`}>
                              {app.type}
                            </span>
                          </div>
                          <p className="text-admin-body-sm text-admin-on-surface-variant mt-1 font-admin-sans">
                            Application ID: <span className="font-admin-mono">{app.id}</span> • {app.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-admin-md font-admin-sans select-none">
                        {app.status === 'Pending' ? (
                          <>
                            <button className="px-admin-md py-admin-sm font-body-md font-bold text-admin-secondary hover:bg-admin-secondary-container/10 rounded transition-colors">
                              View Profile
                            </button>
                            <button 
                              onClick={() => handleApprove(app.id)}
                              className="px-admin-md py-admin-sm bg-admin-primary text-white font-bold rounded hover:bg-admin-on-background transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(app.id)}
                              className="px-admin-md py-admin-sm border border-error text-error font-bold rounded hover:bg-error-container transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`px-admin-lg py-admin-sm font-bold text-sm ${
                            isApproved ? 'text-green-600' : 'text-error'
                          }`}>
                            {app.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-admin-lg text-center text-admin-on-surface-variant font-admin-sans">
                  No applications pending approval.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Partner List Content */}
        {activeTab === 'list' && (
          <div className="p-0 animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-admin-surface-container-low border-b border-admin-outline-variant select-none">
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">PARTNER NAME</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">TYPE</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">LOCATIONS</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">JOINED DATE</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">REVENUE</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase text-center">STATUS</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-outline-variant">
                  {partners.map((partner) => (
                    <tr 
                      key={partner.id} 
                      className={`hover:bg-admin-surface-container-lowest transition-colors ${
                        !partner.active ? 'opacity-75' : ''
                      }`}
                    >
                      <td className="px-admin-lg py-admin-lg">
                        <div className="flex items-center gap-admin-md">
                          <div className={`w-8 h-8 rounded-full ${partner.initialsBg} flex items-center justify-center ${partner.initialsText} font-bold text-xs`}>
                            {partner.initials}
                          </div>
                          <span className="font-admin-sans text-admin-body-md font-bold text-admin-primary">
                            {partner.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-admin-lg py-admin-lg">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-sm uppercase tracking-wider ${
                          partner.type === 'Stay' ? 'bg-admin-surface-variant text-admin-on-surface' : 'bg-admin-secondary-fixed text-admin-on-secondary-fixed-variant'
                        }`}>
                          {partner.type}
                        </span>
                      </td>
                      <td className="px-admin-lg py-admin-lg font-admin-sans text-admin-body-sm text-admin-on-surface-variant">
                        {partner.location}
                      </td>
                      <td className="px-admin-lg py-admin-lg font-admin-mono text-xs text-admin-on-surface-variant">
                        {partner.joined}
                      </td>
                      <td className="px-admin-lg py-admin-lg font-admin-sans text-admin-body-md font-bold text-admin-primary">
                        {partner.revenue}
                      </td>
                      <td className="px-admin-lg py-admin-lg">
                        <div className="flex items-center justify-center select-none">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={partner.active}
                              onChange={() => handleTogglePartner(partner.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-admin-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-secondary"></div>
                          </label>
                        </div>
                      </td>
                      <td className="px-admin-lg py-admin-lg text-right">
                        <button className="p-2 text-admin-on-surface-variant hover:text-admin-secondary transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer (Floating Style) */}
      <div className="flex justify-between items-center bg-white p-admin-lg border border-admin-outline-variant rounded-lg shadow-sm select-none">
        <div className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
          Showing <span className="font-bold text-admin-primary">1 - {activeTab === 'pending' ? applications.length : partners.length}</span> of {activeTab === 'pending' ? '42 pending' : '1,284 total'} partners
        </div>
        <div className="flex items-center gap-admin-sm">
          <button className="p-2 hover:bg-admin-surface-container rounded-lg text-admin-on-surface-variant disabled:opacity-30" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex gap-1 font-admin-sans">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-admin-secondary text-white font-bold text-xs">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-admin-surface-container text-admin-on-surface font-bold text-xs">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-admin-surface-container text-admin-on-surface font-bold text-xs">3</button>
          </div>
          <button className="p-2 hover:bg-admin-surface-container rounded-lg text-admin-on-surface-variant">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
