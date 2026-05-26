import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  Plus, 
  ArrowLeft,
  UserCheck
} from 'lucide-react';

interface PartnerSidebarProps {
  hotelName?: string;
}

/**
  * Sidebar dành riêng cho hệ thống Cổng Đối Tác (Partner Portal).
  * Đồng bộ với ngôn ngữ thiết kế "Atmospheric Heritage" và light theme "Warm Paper".
  */
export const PartnerSidebar: React.FC<PartnerSidebarProps> = ({ 
  hotelName = 'Hanoi Boutique Hotel' 
}) => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || 'partner@wandervn.com';

  return (
    <aside className="w-[280px] bg-[#FAF6F0] border-r border-[#E6E2DD] flex flex-col min-h-screen sticky top-0 left-0 z-30 select-none">
      
      {/* Brand & Manager Profile */}
      <div className="p-6 border-b border-[#E6E2DD] bg-[#FAF6F0]">
        <div className="flex items-center gap-3.5 mb-5 cursor-pointer" onClick={() => navigate('/partner/dashboard')}>
          <div className="bg-[#1C1C19] text-[#FAF6F0] p-2.5 rounded-lg">
            <Building2 className="h-5.5 w-5.5 text-[#B59A5A]" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="font-display-lg text-headline-md text-[#1C1C19] tracking-tight">
              WanderVN
            </span>
            <span className="font-label-md text-[9px] uppercase tracking-[0.2em] text-[#735C00] font-bold">
              Đối tác lưu trú
            </span>
          </div>
        </div>

        {/* Manager Card */}
        <div className="flex items-center gap-3 bg-[#F1EDE8] p-3 rounded-lg border border-[#E6E2DD]">
          <div className="w-10 h-10 rounded-full bg-[#1C1C19]/10 flex items-center justify-center overflow-hidden shrink-0 border border-[#B59A5A]/30">
            <img 
              alt="Manager Avatar" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" 
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-label-md text-xs text-[#1C1C19] truncate font-bold">{hotelName}</h4>
            <p className="font-body-md text-[10px] text-[#444748] truncate flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-secondary shrink-0" />
              {userEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <NavLink
          to="/partner/dashboard"
          className={({ isActive }) => 
            `flex items-center gap-3.5 px-4 py-3 rounded-lg font-label-md text-xs uppercase tracking-wider transition-all duration-200 ${
              isActive 
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
            `flex items-center gap-3.5 px-4 py-3 rounded-lg font-label-md text-xs uppercase tracking-wider transition-all duration-200 ${
              isActive 
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
            `flex items-center gap-3.5 px-4 py-3 rounded-lg font-label-md text-xs uppercase tracking-wider transition-all duration-200 ${
              isActive 
                ? 'bg-[#E6E2DD] text-[#1C1C19] font-bold border-l-4 border-[#735C00]' 
                : 'text-[#444748] hover:text-[#1C1C19] hover:bg-[#F1EDE8]'
            }`
          }
        >
          <Wallet className="h-4.5 w-4.5 text-[#735C00]" />
          <span>Tài chính &amp; Đối soát</span>
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
