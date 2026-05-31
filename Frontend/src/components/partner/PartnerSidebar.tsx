import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Plus,
  ArrowLeft,
  Hotel
} from 'lucide-react';

interface PartnerSidebarProps {
  hotelName?: string;
}

/**
  * Sidebar dành riêng cho hệ thống Cổng Đối Tác (Partner Portal).
  * Đồng bộ với ngôn ngữ thiết kế "Atmospheric Heritage" và light theme "Warm Paper".
  */
export const PartnerSidebar: React.FC<PartnerSidebarProps> = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-[280px] bg-[#FAF6F0] border-r border-[#E6E2DD] flex flex-col min-h-screen sticky top-0 left-0 z-30 select-none">

      {/* Brand & Manager Profile */}
      <div className="p-6 border-b border-[#E6E2DD] bg-[#FAF6F0]">
        {/* Thương hiệu WanderVN Partner */}
        <button
          onClick={() => navigate('/partner')}
          className="flex items-center gap-3 group"
        >
          <div className="bg-primary text-on-primary p-2 rounded-lg group-hover:bg-secondary transition-colors duration-300">
            <Hotel className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="font-display-lg text-headline-md text-primary tracking-tight">
              WanderVN
            </span>
            <span className="font-label-md text-[10px] uppercase tracking-[0.2em] text-secondary">
              Partner Portal
            </span>
          </div>
        </button>

      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <NavLink
          to="/partner/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-3 rounded-lg font-label-md text-xs uppercase tracking-wider transition-all duration-200 ${isActive
              ? 'bg-[#E6E2DD] text-[#1C1C19] font-bold border-l-4 border-[#735C00]'
              : 'text-[#444748] hover:text-[#1C1C19] hover:bg-[#F1EDE8]'
            }`
          }
        >
          <LayoutDashboard className="h-4.5 w-4.5 text-[#735C00]" />
          <span>Bảng điều khiển</span>
        </NavLink>

        <NavLink
          to="/partner/properties"
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-3 rounded-lg font-label-md text-xs uppercase tracking-wider transition-all duration-200 ${isActive
              ? 'bg-[#E6E2DD] text-[#1C1C19] font-bold border-l-4 border-[#735C00]'
              : 'text-[#444748] hover:text-[#1C1C19] hover:bg-[#F1EDE8]'
            }`
          }
        >
          <Building2 className="h-4.5 w-4.5 text-[#735C00]" />
          <span>Quản lý cơ sở</span>
        </NavLink>

        <NavLink
          to="/partner/finance"
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-3 rounded-lg font-label-md text-xs uppercase tracking-wider transition-all duration-200 ${isActive
              ? 'bg-[#E6E2DD] text-[#1C1C19] font-bold border-l-4 border-[#735C00]'
              : 'text-[#444748] hover:text-[#1C1C19] hover:bg-[#F1EDE8]'
            }`
          }
        >
          <BarChart3 className="h-4.5 w-4.5 text-[#735C00]" />
          <span>Doanh thu &amp; Chi trả</span>
        </NavLink>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#E6E2DD]">
        <button
          onClick={() => navigate('/partner/onboarding')}
          className="w-full bg-[#1C1C19] text-[#FAF6F0] font-label-md text-[11px] uppercase tracking-widest py-3 rounded-lg hover:bg-[#735C00] transition-colors duration-300 flex items-center justify-center gap-2 font-bold shadow-md hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="h-4 w-4 text-[#B59A5A]" />
          <span>Đăng ký cơ sở mới</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-2.5 border border-[#E6E2DD] text-[#444748] hover:text-[#1C1C19] hover:bg-[#F1EDE8] font-label-md text-[10px] uppercase tracking-widest py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Về trang chủ</span>
        </button>
      </div>

    </aside>
  );
};
