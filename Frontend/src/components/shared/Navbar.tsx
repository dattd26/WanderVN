import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';

import logo from '../../assets/images/logo.png';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập trực tiếp từ localStorage
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('userEmail');
  const role = localStorage.getItem('role');
  const isLoggedIn = !!(token && email);
  const userEmail = email || '';

  // thanh điều hướng có trong suốt
  const isTransparent = !isScrolled && location.pathname === '/' && !isMobileMenuOpen;

  // Khi cuộn trang qua 50px, thanh navbar sẽ đổi sang màu nền mờ nhòe kính mờ sang trọng
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Khách sạn', path: '/stays' },
    { name: 'Vé máy bay', path: '/flights' },
    { name: 'Tra cứu Booking', path: '/booking-lookup' },
    { name: 'Tour và Trải nghiệm', path: '#' },
  ];

  // Phân quyền danh sách liên kết trong menu người dùng dựa trên vai trò (Role)
  const userMenuLinks = (() => {
    if (role === 'Admin') {
      return [{ name: 'Trang quản trị', path: '/admin/dashboard' }];
    }
    if (role === 'Partner') {
      return [{ name: 'Trang đối tác', path: '/partner/dashboard' }];
    }
    return [
      { name: 'Lịch sử Booking', path: '/booking-history' },
      { name: 'Trở thành Partner', path: '/partner/onboarding' },
    ];
  })();

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isMobileMenuOpen
          ? 'bg-background border-b border-surface-variant/20 py-5 lg:py-6 shadow-sm'
          : isScrolled
            ? 'bg-background/90 backdrop-blur-lg border-b border-surface-variant/20 py-5 lg:py-6 shadow-sm'
            : location.pathname !== '/'
              ? 'bg-background/95 backdrop-blur-md border-b border-surface-variant/40 py-6 lg:py-8 shadow-sm'
              : 'bg-transparent py-8 lg:py-10'
      }`}
    >
      <div className="flex justify-between items-center px-margin-mobile lg:px-12 xl:px-16 w-full max-w-[1440px] mx-auto relative">
        {/* Brand Logo - Logo thương hiệu kết hợp biểu tượng khách sạn cổ điển */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={logo} alt="WanderVN Logo" className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className={`font-display-lg text-headline-lg tracking-tighter transition-all duration-300 group-hover:opacity-80 ${isTransparent ? 'text-white' : 'text-primary'}`}>
            WanderVN
          </span>
        </Link>

        {/* Desktop Links - Danh sách liên kết điều hướng trên màn hình máy tính */}
        <ul className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name} className="relative group/link">
                <Link
                  to={link.path}
                  className={`block px-5 xl:px-6 py-2 font-medium text-[15px] xl:text-[16px] tracking-wide transition-all duration-300 ${isActive
                    ? 'text-secondary'
                    : isTransparent
                      ? 'text-white hover:text-white/80'
                      : 'text-primary hover:text-secondary'
                    }`}
                >
                  {link.name}
                </Link>
                {/* Đường gạch chân trượt mượt mà mô tả trạng thái hover/active sang trọng */}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-secondary transition-all duration-300 ${isActive ? 'w-1/2' : 'w-0 group-hover/link:w-1/2'
                    }`}
                />
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA / Auth - Khối hành động và xác thực người dùng trên máy tính */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {isLoggedIn ? (
            <div className="relative group/user">
              {/* Thẻ thông tin người dùng được thiết kế tối giản, sang trọng */}
              <div className={`flex items-center gap-2 font-medium text-[14px] xl:text-[15px] cursor-pointer transition-colors py-2 ${isTransparent ? 'text-white hover:text-white/80' : 'text-primary hover:text-secondary'}`}>
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{userEmail.split('@')[0]}</span>
                <ChevronDown className="h-4 w-4 opacity-70 group-hover/user:rotate-180 transition-transform duration-300" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 pt-2 w-56 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-300 translate-y-2 group-hover/user:translate-y-0">
                <div className="bg-background border border-surface-variant/30 rounded-lg shadow-lg overflow-hidden flex flex-col py-2">
                  {userMenuLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="px-5 py-3 text-[14.5px] text-primary hover:bg-surface-variant/20 hover:text-secondary transition-colors font-medium"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="h-px bg-surface-variant/30 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-3 text-[14.5px] text-on-surface-variant hover:text-error hover:bg-red-50 transition-colors w-full text-left font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6 xl:gap-8">
              <Link
                to="/login"
                className={`font-medium text-[14px] xl:text-[15px] tracking-wide transition-all duration-300 flex items-center gap-2 ${isTransparent ? 'text-white hover:text-white/80' : 'text-primary hover:text-secondary'}`}
              >
                <User className="h-4 w-4" />
                Đăng nhập
              </Link>
              <button
                onClick={() => navigate('/stays')}
                className={`font-medium text-[13px] xl:text-[14px] tracking-widest px-6 py-2.5 rounded transition-all duration-300 uppercase border ${isTransparent
                    ? 'bg-white text-secondary border-white hover:bg-gray-100 shadow-md'
                    : 'text-secondary border-secondary hover:bg-secondary hover:text-white'
                  }`}
              >
                Đặt phòng ngay
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button - Nút bật tắt Menu dạng ngăn kéo trên thiết bị di động */}
        <button
          className={`lg:hidden focus:outline-none p-1 transition-colors duration-300 ${isTransparent ? 'text-white hover:text-white/80' : 'text-primary hover:text-secondary'}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay - Ngăn kéo hiển thị danh sách mục trên thiết bị di động */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-surface-variant/50 shadow-lg py-6 px-margin-mobile flex flex-col gap-6 animate-fade-in max-h-[80vh] overflow-y-auto">
          <ul className="flex flex-col gap-2">
            {[...navLinks, ...userMenuLinks].map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.name} onClick={() => setIsMobileMenuOpen(false)}>
                  <Link
                    to={link.path}
                    className={`block font-medium text-[16px] tracking-wide py-3 px-4 rounded-md transition-colors duration-300 ${isActive ? 'bg-secondary/10 text-secondary' : 'text-primary hover:bg-surface-variant/20 hover:text-secondary'
                      }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-4 border-t border-surface-variant/30 pt-6 mt-2">
            {isLoggedIn ? (
              <div className="flex flex-col gap-4 px-4">
                <div className="flex items-center gap-3 text-primary font-medium text-[15px] bg-surface-container-low px-4 py-3 border border-outline-variant/30 rounded-md">
                  <User className="h-5 w-5 text-secondary" />
                  <span className="truncate">{userEmail}</span>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex justify-center items-center gap-2 font-medium text-[15px] tracking-wide bg-red-500/10 text-error py-3.5 hover:bg-red-500/20 transition-all rounded-md"
                >
                  <LogOut className="h-5 w-5" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 px-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex justify-center items-center gap-2 font-medium text-[15px] tracking-wide text-primary py-3.5 border border-outline-variant/50 rounded-md hover:bg-surface-variant/20 hover:text-secondary transition-colors"
                >
                  <User className="h-5 w-5" />
                  Đăng nhập
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/stays');
                  }}
                  className="w-full font-medium text-[14px] uppercase tracking-widest bg-secondary text-white py-3.5 rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Đặt phòng ngay
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;


