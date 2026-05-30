import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

export function AdminSidebar() {
  const activeClass = "flex items-center gap-admin-md px-admin-md py-admin-sm bg-admin-secondary-container text-admin-on-secondary-container font-bold rounded-lg transition-transform active:scale-95";
  const inactiveClass = "flex items-center gap-admin-md px-admin-md py-admin-sm text-admin-on-surface-variant hover:bg-admin-surface-container-high rounded-lg transition-all duration-200";

  const location = useLocation();
  const isSubmenuActive = location.pathname === "/admin/customers" || location.pathname === "/admin/partners";

  const [isUsersOpen, setIsUsersOpen] = useState(isSubmenuActive);
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    if (isSubmenuActive) {
      const timer = setTimeout(() => {
        setIsUsersOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isSubmenuActive]);

  return (
    // Đã sửa thành fixed top-0 left-0 h-screen z-50 để cố định sidebar hoàn toàn
    <aside className="flex flex-col w-[260px] h-screen py-admin-lg px-admin-md bg-admin-surface-container-lowest border-r border-admin-outline-variant fixed top-0 left-0 z-50 shrink-0 select-none">
      <div className="mb-admin-xl px-admin-sm">
        <h1 className="font-admin-sans text-admin-display-lg font-bold text-admin-primary">WanderVN</h1>
        <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-sm">Admin Console</p>
      </div>

      <nav className="flex-1 space-y-admin-xs">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-admin-sans text-admin-body-md">Dashboard</span>
        </NavLink>

        {/* Khối menu Users lồng nhau */}
        <div>
          <button
            type="button"
            onClick={() => setIsUsersOpen(!isUsersOpen)}
            className={`w-full flex items-center justify-between px-admin-md py-admin-sm text-admin-on-surface-variant hover:bg-admin-surface-container-high rounded-lg transition-all duration-200 ${isSubmenuActive ? "text-admin-primary font-bold" : ""
              }`}
          >
            <div className="flex items-center gap-admin-md">
              <span className="material-symbols-outlined">group</span>
              <span className="font-admin-sans text-admin-body-md">Users</span>
            </div>
            <span
              className="material-symbols-outlined transition-transform duration-200"
              style={{ transform: isUsersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>

          {isUsersOpen && (
            <div className="pl-admin-md mt-admin-xs space-y-admin-xs border-l border-admin-outline-variant ml-admin-md">
              <NavLink
                to="/admin/customers"
                className={({ isActive }) => isActive ? activeClass : inactiveClass}
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                <span className="font-admin-sans text-admin-body-md">Customer</span>
              </NavLink>

              <NavLink
                to="/admin/partners"
                className={({ isActive }) => isActive ? activeClass : inactiveClass}
              >
                <span className="material-symbols-outlined text-[20px]">handshake</span>
                <span className="font-admin-sans text-admin-body-md">Partner</span>
              </NavLink>
            </div>
          )}
        </div>

        <NavLink
          to="/admin/content"
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
        >
          <span className="material-symbols-outlined">edit_note</span>
          <span className="font-admin-sans text-admin-body-md">Content</span>
        </NavLink>

        <NavLink
          to="/admin/finance"
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
        >
          <span className="material-symbols-outlined">payments</span>
          <span className="font-admin-sans text-admin-body-md">Finance</span>
        </NavLink>
      </nav>

      <div className="pt-admin-lg border-t border-admin-outline-variant space-y-admin-xs">
        <NavLink
          to="/admin/change-password"
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
        >
          <span className="material-symbols-outlined">lock</span>
          <span className="font-admin-sans text-admin-body-md">Đổi mật khẩu</span>
        </NavLink>
        <a
          href="#"
          onClick={handleLogout}
          className="flex items-center gap-admin-md px-admin-md py-admin-sm text-admin-on-surface-variant hover:bg-admin-surface-container-high rounded-lg transition-all duration-200"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-admin-sans text-admin-body-md font-semibold">Đăng xuất</span>
        </a>
      </div>
    </aside>
  );
}