import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CloudCheck, LogOut, User, ChevronDown, Globe } from 'lucide-react';
import logo from '../../assets/images/logo.png';

interface PartnerHeaderProps {
  /** Nhãn trạng thái lưu nháp (vd: "Đã lưu nháp lúc 10:45") — ẩn nếu để trống */
  draftStatus?: string;
  /** Đường dẫn quay về khi bấm "Lưu & Thoát". Mặc định: '/' */
  exitTo?: string;
}

/**
 * Header tích hợp thẻ User Profile và dropdown thao tác/đăng xuất cho hệ thống Partner.
 * Thiết kế theo phong cách modern glassmorphism và tone Warm Paper di sản.
 */
export const PartnerHeader: React.FC<PartnerHeaderProps> = ({
  draftStatus,
  exitTo = '/',
}) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userEmail = localStorage.getItem('userEmail') || 'partner@wandervn.com';
  const displayEmail = userEmail.split('@')[0];

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <header className="w-full h-16 border-b border-[#E6E2DD] flex items-center justify-between px-6 bg-[#FAF6F0]/95 backdrop-blur-md sticky top-0 z-40 select-none">

      {/* Cột trái: Logo thương hiệu và Trạng thái lưu nháp (nếu có) */}
      <div className="flex items-center gap-6">
        <Link to="/partner/dashboard" className="flex items-center gap-2.5 group">
          <img src={logo} alt="WanderVN Logo" className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="font-display-lg text-base text-[#735C00] tracking-tighter transition-all duration-300 group-hover:opacity-80 font-bold flex items-center gap-1.5">
            WanderVN
            <span className="text-[10px] font-sans font-medium bg-[#735C00]/10 text-[#735C00] px-1.5 py-0.5 rounded-md tracking-normal">Partner</span>
          </span>
        </Link>

        {draftStatus && (
          <>
            <div className="h-5 w-px bg-[#E6E2DD] hidden sm:block" />
            <span className="hidden sm:flex items-center gap-2 font-label-md text-[11px] uppercase tracking-wider text-[#444748]">
              <CloudCheck className="h-4.5 w-4.5 text-[#735C00]" />
              {draftStatus}
            </span>
          </>
        )}
      </div>

      {/* Cột phải: Lưu & Thoát + Profile User Dropdown */}
      <div className="flex items-center gap-6">

        {/* Nút Lưu & Thoát */}
        <button
          onClick={() => navigate(exitTo)}
          className="font-label-md text-xs uppercase tracking-widest text-[#444748] hover:text-[#735C00] transition-colors duration-200 font-bold"
        >
          Lưu &amp; Thoát
        </button>

        <div className="h-5 w-px bg-[#E6E2DD]" />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#F1EDE8] border border-transparent hover:border-[#E6E2DD]/60 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-full bg-[#735C00]/10 flex items-center justify-center border border-[#735C00]/25 overflow-hidden shrink-0">
              <User className="h-4 w-4 text-[#735C00]" />
            </div>

            <div className="hidden md:flex flex-col text-left leading-tight shrink-0">
              <span className="font-label-md text-xs text-[#1C1C19] font-bold group-hover:text-[#735C00] transition-colors">
                {displayEmail}
              </span>
              <span className="text-[9px] text-[#444748] font-medium tracking-wide">
                Đối tác
              </span>
            </div>

            <ChevronDown className={`h-4 w-4 text-[#444748] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu Glassmorphism */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl shadow-lg py-2.5 z-50 transform origin-top-right transition-all duration-150 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-[#E6E2DD] mb-1.5">
                <p className="text-[10px] text-[#444748] font-bold uppercase tracking-wider">Tài khoản đối tác</p>
                <p className="text-xs text-[#1C1C19] font-semibold truncate mt-0.5">{userEmail}</p>
              </div>

              {/* Thao tác Quay lại Main Site */}
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-label-md text-xs text-[#444748] hover:text-[#1C1C19] hover:bg-[#F1EDE8] transition-colors"
              >
                <Globe className="h-4 w-4 text-[#735C00]" />
                Xem trang khách hàng
              </button>

              <div className="h-px bg-[#E6E2DD] my-1.5" />

              {/* Nút Đăng xuất */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-label-md text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10 transition-colors font-bold"
              >
                <LogOut className="h-4 w-4 text-red-500" />
                Đăng xuất tài khoản
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default PartnerHeader;
