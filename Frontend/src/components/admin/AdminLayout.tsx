import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-admin-background text-admin-on-surface font-admin-sans antialiased overflow-x-hidden">
      {/* Sidebar cố định */}
      <AdminSidebar />

      {/* Phần nội dung bên phải - Thêm ml-[260px] để bù khoảng trống cho Sidebar đứng im */}
      <div className="flex-1 flex flex-col min-w-0 ml-[260px]">
        {/* Dynamic Admin Header */}
        <AdminHeader />

        {/* Dynamic Nested Routes Content Canvas */}
        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
}