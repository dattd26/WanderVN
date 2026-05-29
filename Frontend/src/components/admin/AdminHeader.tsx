import { useLocation, Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

export function AdminHeader() {
  const location = useLocation();

  // Dynamically map page title based on current subroute
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Overview';
    if (path.includes('/users') || path.includes('/customers')) return 'Customer Management';
    if (path.includes('/partners')) return 'Partner Management';
    if (path.includes('/content')) return 'Content & Platform';
    if (path.includes('/finance')) return 'Finance';
    return 'WanderVN Admin Console';
  };

  // Lấy thông tin đăng nhập từ localStorage
  const userEmail = localStorage.getItem('userEmail') || 'admin@wandervn.com';
  const role = localStorage.getItem('role') || 'SUPERADMIN';
  const shortName = userEmail.split('@')[0];

  return (
    /* ĐÃ SỬA: Thay đổi z-40 thành z-20 để không đè lên lớp backdrop đen mờ của Modal */
    <header className="flex justify-between items-center h-16 px-admin-xl w-full sticky top-0 z-20 bg-white shadow-sm border-b border-admin-outline-variant select-none">
      <div className="flex items-center gap-admin-xl flex-1">
        <Link to="/admin/dashboard" className="flex items-center gap-2 group mr-2 shrink-0">
          <img src={logo} alt="WanderVN Logo" className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
        </Link>
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
            <p className="font-admin-sans text-admin-label-caps text-admin-on-surface font-bold max-w-[150px] truncate">{shortName}</p>
            <p className="text-[10px] text-admin-on-surface-variant uppercase">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-admin-primary-container flex items-center justify-center overflow-hidden border border-admin-outline-variant text-admin-on-primary font-bold relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="Admin Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="absolute font-admin-sans text-sm">{shortName.substring(0, 2).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}