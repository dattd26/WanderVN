import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-admin-background text-admin-on-surface font-admin-sans antialiased overflow-x-hidden">
      {/* Persistent Administrative Left Sidebar */}
      <AdminSidebar />

      {/* Main Administrative Right Section */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dynamic Admin Header */}
        <AdminHeader />

        {/* Dynamic Nested Routes Content Canvas */}
        <main className="flex-grow overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
