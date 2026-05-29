import { useState } from 'react';

interface Announcement {
  id: string;
  title: string;
  desc: string;
  audience: string;
  status: 'Scheduled' | 'Expired' | 'Active';
  visible: boolean;
  audienceBg: string;
  audienceText: string;
}

interface Banner {
  id: string;
  title: string;
  tag?: string;
  imgUrl: string;
  large: boolean;
}

export function AdminContent() {
  const [commissionFee, setCommissionFee] = useState<number>(12.5);
  const [lastUpdated, setLastUpdated] = useState<string>('14 Oct 2023');

  // Local state for Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 'ann-1',
      title: 'Winter Promotion 2024',
      desc: 'Up to 30% off on all North Vietnam tours.',
      audience: 'All Users',
      status: 'Scheduled',
      visible: true,
      audienceBg: 'bg-admin-secondary-fixed',
      audienceText: 'text-admin-on-secondary-fixed-variant',
    },
    {
      id: 'ann-2',
      title: 'Server Maintenance Notice',
      desc: 'Platform will be offline for 2 hours on Sunday.',
      audience: 'Partners Only',
      status: 'Expired',
      visible: false,
      audienceBg: 'bg-admin-tertiary-fixed',
      audienceText: 'text-admin-on-tertiary-fixed-variant',
    },
  ]);

  // Local state for Banners
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: 'ban-1',
      title: 'Discover North Vietnam',
      tag: 'Primary Hero',
      imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi7fPjSvdjDGINfLS9-ceaWnKqYI6jwO-XWqPJm_CQkx-o8DdjLNfWd3fUT6qTzq_vTrYpGTj1ls4wc02fLxeJBsK855hEWPswmCEn6c5Gf5bIPVUAG49h8BmqpNS1_1T7cmu8WCbXpoWQuYUl-YBkCUkrWL-mgj2s08dldm-KGNuspE-fzQ_3uYcRr2k2oY81zaLH-yA6lgODtPbNeeHzJ4kP8piZMe3vcFioww2wnEIHvfhUYKTUaRMfxkmwxaAfEux8Bmw2MXk',
      large: true,
    },
    {
      id: 'ban-2',
      title: 'Hanoi Dusk',
      imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFK9aYds3FwCZgGiGBtpmEeTuTlWNpmIcneMzFq_YI0uLdFYm87WcUzNFS94s9RJ6Sze-J_XkQ-GEugURmmrGHooBChGqtvY0apRh8DO5fZUF8eLnEtgQSssnPpReAj_CG7PgZgCv-TAfb5EGT4jeg8cedKKovuVfVArqibFA9BpKsxidkpg2ccUEHeS6NGs2T2sj2adSDMtNB_DUcp0eSUl1ImDTJKj6MKhPAGcG8ww4RsUMW-rlDGnku9Z-l4hcHxrr5BinZGS4',
      large: false,
    },
    {
      id: 'ban-3',
      title: 'Infinity Pool Sapa',
      imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDgWoTtV77Jb66Vce0iW_nojBW8m5BemtRrRhT5-xQF3NJuYjliqAWu6qjzKRyx1jWB5Uc9gdVUP45vXXHEMPvxfhxtWqKjOBGL8cDSdsGNEelfPYtXQWWDIMiHpaNoV2ExRak1KHbeqVKHVB5-aoqgNgfScGur2Nqoc30lXPV0SuMTg4XHdtUv-xhsZe0ql5fiR0cXFOCMZeTve9fLUkHATBd-i14sFavraGjCS9flzMIHaI4bdZ7y4dSSFdDq2dBF2GGIWxHCfM',
      large: false,
    },
    {
      id: 'ban-4',
      title: 'Artisanal Silk',
      imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwf0N77Kv-o3DL-DC5YEatlg_l8xdJzStzKyB0UbTbkKCiv_8D_49KCZELoNpMxGcYp0S3-NqEzsHZg4bn31sP_VNyhpLYEF2-33BpHh_qJ98rhcQqQMHGxhszzS4q8ALXe_mkFa9jVZeGRqgLcLlO6zS6ulTqux4a9rF-FNAcX2zh2KAKH0kCTOd237POH8iBluYvCcTTXrCw1i1kCwVrMJ4vQUUfdDEOJUXGjQr3y9lettOH4-c0-fVudBHGuWwvDRJ4t2snZC0',
      large: false,
    },
  ]);

  const handleUpdateFee = () => {
    const today = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    setLastUpdated(today);
    alert(`Commission fee globally updated to ${commissionFee}%`);
  };

  const handleToggleAnnouncement = (id: string) => {
    setAnnouncements(prev =>
      prev.map(ann => (ann.id === id ? { ...ann, visible: !ann.visible } : ann))
    );
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
  };

  const handleDeleteBanner = (id: string) => {
    setBanners(prev => prev.filter(ban => ban.id !== id));
  };

  return (
    <div className="p-admin-xl space-y-admin-xl max-w-admin-container-max mx-auto w-full">
      {/* Commission Fee & Announcements (Asymmetric Grid) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-admin-lg items-start">
        {/* Left Column: Commission Fee Settings */}
        <div className="lg:col-span-4 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-admin-lg shadow-sm hover:shadow-md transition-all duration-200 border-t-4 border-t-admin-secondary">
          <div className="flex items-center justify-between mb-admin-lg">
            <h3 className="font-admin-sans text-admin-headline-sm text-admin-primary">Commission Fee</h3>
            <span className="material-symbols-outlined text-admin-secondary">analytics</span>
          </div>
          <p className="font-admin-sans text-admin-body-sm text-admin-on-surface-variant mb-admin-xl leading-relaxed">
            Define the global service fee percentage for all platform transactions and bookings.
          </p>
          <div className="space-y-admin-md">
            <div>
              <label className="font-admin-sans text-admin-body-sm font-bold block mb-admin-sm">
                Percentage Fee (%)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1" 
                  value={commissionFee} 
                  onChange={(e) => setCommissionFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-admin-md py-admin-md border border-admin-outline-variant rounded-lg focus:border-admin-secondary focus:ring-2 focus:ring-admin-secondary/20 transition-all font-admin-mono text-admin-display-lg font-bold text-admin-primary outline-none"
                />
                <span className="absolute right-admin-md top-1/2 -translate-y-1/2 font-bold text-admin-outline">%</span>
              </div>
            </div>
            <button 
              onClick={handleUpdateFee}
              className="w-full py-admin-md bg-admin-primary-container text-white rounded-lg font-bold hover:bg-admin-primary transition-colors flex items-center justify-center gap-admin-sm select-none"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              Update Fee Structure
            </button>
            <p className="text-center font-admin-sans text-admin-label-caps text-admin-outline mt-admin-sm select-none">
              Last updated: {lastUpdated} by Admin
            </p>
          </div>
        </div>

        {/* Right Column: System Notifications Table */}
        <div className="lg:col-span-8 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="px-admin-lg py-admin-md border-b border-admin-outline-variant bg-admin-surface-container flex justify-between items-center select-none">
            <h3 className="font-admin-sans text-admin-headline-sm text-admin-primary">System Notifications</h3>
            <button className="px-admin-md py-admin-sm bg-white border border-admin-outline-variant rounded-lg font-admin-sans text-admin-body-sm flex items-center gap-admin-sm hover:bg-admin-surface-container-high transition-colors text-admin-primary font-bold shadow-sm">
              <span className="material-symbols-outlined text-md">add</span> Create Announcement
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-admin-surface-container-low font-admin-sans text-admin-label-caps text-admin-outline border-b border-admin-outline-variant select-none">
                <tr>
                  <th className="px-admin-lg py-admin-md">ANNOUNCEMENT</th>
                  <th className="px-admin-lg py-admin-md">AUDIENCE</th>
                  <th className="px-admin-lg py-admin-md">STATUS</th>
                  <th className="px-admin-lg py-admin-md">VISIBILITY</th>
                  <th className="px-admin-lg py-admin-md text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-outline-variant/30">
                {announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <tr key={ann.id} className="hover:bg-admin-surface-container transition-colors">
                      <td className="px-admin-lg py-admin-md max-w-xs">
                        <p className="font-admin-sans text-admin-body-md font-bold text-admin-primary truncate">
                          {ann.title}
                        </p>
                        <p className="text-xs text-admin-on-surface-variant font-admin-sans truncate">
                          {ann.desc}
                        </p>
                      </td>
                      <td className="px-admin-lg py-admin-md select-none">
                        <span className={`px-admin-sm py-xs ${ann.audienceBg} ${ann.audienceText} text-xs rounded-sm font-bold uppercase`}>
                          {ann.audience}
                        </span>
                      </td>
                      <td className="px-admin-lg py-admin-md select-none">
                        {ann.status === 'Scheduled' ? (
                          <div className="flex items-center gap-admin-xs text-xs font-bold text-[#166534] font-admin-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span> Scheduled
                          </div>
                        ) : (
                          <div className="flex items-center gap-admin-xs text-xs font-bold text-error font-admin-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Expired
                          </div>
                        )}
                      </td>
                      <td className="px-admin-lg py-admin-md">
                        <button 
                          onClick={() => handleToggleAnnouncement(ann.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors select-none ${
                            ann.visible ? 'bg-admin-secondary' : 'bg-admin-outline-variant'
                          }`}
                        >
                          <span 
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                              ann.visible ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-admin-lg py-admin-md text-right">
                        <button className="p-1 text-admin-on-surface-variant hover:text-admin-secondary transition-colors" title="Edit Announcement">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-1 text-admin-on-surface-variant hover:text-error transition-colors" 
                          title="Delete Announcement"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-admin-lg py-admin-xl text-center text-admin-on-surface-variant font-admin-sans">
                      No system announcements present.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Hero Banner Management Section */}
      <section className="space-y-admin-md">
        <div className="flex justify-between items-end select-none">
          <div>
            <h3 className="font-admin-sans text-admin-headline-md text-admin-primary">Banner Management</h3>
            <p className="font-admin-sans text-admin-body-sm text-admin-on-surface-variant">
              Curate the hero experience for mobile and web users.
            </p>
          </div>
          <button className="px-admin-lg py-admin-md bg-admin-secondary text-white rounded-lg font-bold flex items-center gap-admin-md hover:bg-admin-on-secondary-fixed-variant transition-all hover:shadow-lg active:scale-95 shadow-sm">
            <span className="material-symbols-outlined">cloud_upload</span>
            Upload New Banner
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-admin-lg">
          {banners.map((ban) => {
            if (ban.large) {
              return (
                <div 
                  key={ban.id} 
                  className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl border border-admin-outline-variant bg-admin-surface-container-highest"
                >
                  <img 
                    src={ban.imgUrl} 
                    alt={ban.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-admin-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-between items-center">
                      <div>
                        {ban.tag && (
                          <span className="px-admin-sm py-xs bg-admin-secondary text-white text-xs font-bold rounded-sm mb-admin-xs block w-fit uppercase font-admin-sans">
                            {ban.tag}
                          </span>
                        )}
                        <p className="font-admin-sans text-admin-body-md text-white font-bold">
                          {ban.title}
                        </p>
                      </div>
                      <div className="flex gap-admin-sm">
                        <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-admin-primary transition-all">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteBanner(ban.id)}
                          className="p-2 bg-error/80 backdrop-blur-md rounded-full text-white hover:bg-error transition-all"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={ban.id} 
                className="group relative overflow-hidden rounded-xl border border-admin-outline-variant bg-admin-surface-container-highest h-[220px]"
              >
                <img 
                  src={ban.imgUrl} 
                  alt={ban.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-admin-md select-none">
                  <button className="p-2 bg-white rounded-full text-admin-primary shadow-lg hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteBanner(ban.id)}
                    className="p-2 bg-error rounded-full text-white shadow-lg hover:scale-105 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Empty Upload Slot */}
          <div className="h-[220px] rounded-xl border-2 border-dashed border-admin-outline-variant flex flex-col items-center justify-center gap-admin-md text-admin-outline hover:border-admin-secondary hover:text-admin-secondary hover:bg-admin-secondary/5 transition-all cursor-pointer select-none">
            <span className="material-symbols-outlined text-admin-display-lg">add_circle</span>
            <p className="font-admin-sans text-admin-label-caps">Add Banner</p>
          </div>
        </div>
      </section>
    </div>
  );
}
