import { useLocation } from 'react-router-dom';

export function AdminHeader() {
  const location = useLocation();

  // Dynamically map page title based on current subroute
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Overview';
    if (path.includes('/users')) return 'WanderVN Admin';
    if (path.includes('/partners')) return 'Partner Management';
    if (path.includes('/content')) return 'Content & Platform';
    if (path.includes('/finance')) return 'Finance';
    return 'WanderVN Admin Console';
  };

  return (
    <header className="flex justify-between items-center h-16 px-admin-xl w-full sticky top-0 z-40 bg-admin-surface border-b border-admin-outline-variant">
      <div className="flex items-center gap-admin-xl flex-1">
        <h2 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
          {getHeaderTitle()}
        </h2>
        <div className="relative hidden lg:block group max-w-md w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-outline">
            search
          </span>
          <input 
            type="text" 
            placeholder="Global search..." 
            className="pl-10 pr-admin-md py-admin-sm bg-admin-surface-container-low border border-admin-outline-variant rounded-full text-admin-body-md w-64 focus:ring-2 focus:ring-admin-secondary focus:border-admin-secondary focus:w-80 outline-none transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-admin-md">
        <button className="p-2 hover:bg-admin-surface-container-high rounded-full relative transition-colors">
          <span className="material-symbols-outlined text-admin-on-surface-variant">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>

        <div className="flex items-center gap-admin-sm pl-admin-md border-l border-admin-outline-variant">
          <div className="text-right hidden sm:block">
            <p className="font-admin-sans text-admin-label-caps text-admin-on-surface font-bold">Admin User</p>
            <p className="text-[10px] text-admin-on-surface-variant">SUPERADMIN</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-admin-primary-container flex items-center justify-center overflow-hidden border border-admin-outline-variant">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG8MasxNf1Z-q1xY-D8tPLRIkzWW1AeOSfZ9uYGFNJXzYTz56iNTEKRrg0Cv9NiEz_lXXLzhcEvMW2B1trdN4ySvdraLeVpAcf4qJb42s8omQL0M9QYrmn2qavTT79B-YKOEx4p_8LhSTpzN3xD3oWhoiBxTZKUI0hj_OFciC7RjZl5hr4EJWn8Tf-5NQCoPk6rxanXmX8kisXXCQwG2xee0iSFgIOEN1zsAMT6eyBuKRa1X0qbUSHWV8tNlmJecY56ttrFLlVfLM" 
              alt="Admin Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
