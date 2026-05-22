import { NavLink } from 'react-router-dom';

export function AdminSidebar() {
  const activeClass = "flex items-center gap-admin-md px-admin-md py-admin-sm bg-admin-secondary-container text-admin-on-secondary-container font-bold rounded-lg transition-transform active:scale-95";
  const inactiveClass = "flex items-center gap-admin-md px-admin-md py-admin-sm text-admin-on-surface-variant hover:bg-admin-surface-container-high rounded-lg transition-all duration-200";

  return (
    <aside className="flex flex-col w-[260px] h-screen py-admin-lg px-admin-md bg-admin-surface-container-lowest border-r border-admin-outline-variant sticky top-0 left-0 z-50 shrink-0 select-none">
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

        <NavLink 
          to="/admin/users" 
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
        >
          <span className="material-symbols-outlined">group</span>
          <span className="font-admin-sans text-admin-body-md">Users</span>
        </NavLink>

        <NavLink 
          to="/admin/partners" 
          className={({ isActive }) => isActive ? activeClass : inactiveClass}
        >
          <span className="material-symbols-outlined">handshake</span>
          <span className="font-admin-sans text-admin-body-md">Partners</span>
        </NavLink>

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
        <a 
          href="#settings" 
          className="flex items-center gap-admin-md px-admin-md py-admin-sm text-admin-on-surface-variant hover:bg-admin-surface-container-high rounded-lg transition-all duration-200"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-admin-sans text-admin-body-md">Settings</span>
        </a>
        <NavLink 
          to="/" 
          className="flex items-center gap-admin-md px-admin-md py-admin-sm text-admin-on-surface-variant hover:bg-admin-surface-container-high rounded-lg transition-all duration-200"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-admin-sans text-admin-body-md">Exit Console</span>
        </NavLink>
      </div>
    </aside>
  );
}
