import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';

import logo from '../../assets/images/logo.png';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập trực tiếp từ localStorage
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('userEmail');
  const isLoggedIn = !!(token && email);
  const userEmail = email || '';

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
    // { name: 'Khách sạn', path: '/stays' },
    { name: 'Vé máy bay', path: '/flights' },
    { name: 'Trải nghiệm', path: '#' },
    { name: 'Nhật ký hành trình', path: '#' },
    { name: 'Trở thành Partner', path: '/partner/onboarding' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${isScrolled
        ? 'bg-background/90 backdrop-blur-lg border-b border-surface-variant/20 py-4 shadow-sm'
        : location.pathname !== '/'
          ? 'bg-background/95 backdrop-blur-md border-b border-surface-variant/40 py-5 lg:py-6 shadow-sm'
          : 'bg-transparent py-8'
        }`}
    >
      <div className="flex justify-between items-center gap-4 lg:gap-8 px-margin-mobile lg:px-12 xl:px-16 w-full max-w-[1440px] mx-auto">
        {/* Brand Logo - Logo thương hiệu kết hợp biểu tượng khách sạn cổ điển */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={logo} alt="WanderVN Logo" className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="font-display-lg text-headline-lg text-primary tracking-tighter transition-all duration-300 group-hover:opacity-80">
            WanderVN
          </span>
        </Link>

        {/* Desktop Links - Danh sách liên kết điều hướng trên màn hình máy tính */}
        <ul className="hidden lg:flex lg:gap-5 xl:gap-8 items-center">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name} className="relative group/link py-1">
                <Link
                  to={link.path}
                  className={`font-label-md text-xs lg:text-[13px] xl:text-label-md uppercase tracking-wider xl:tracking-widest whitespace-nowrap transition-all duration-300 ${isActive
                    ? 'text-secondary font-semibold'
                    : 'text-primary hover:text-secondary hover:opacity-80'
                    }`}
                >
                  {link.name}
                </Link>
                {/* Đường gạch chân trượt mượt mà mô tả trạng thái hover/active sang trọng */}
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-secondary scale-x-0 transition-transform duration-300 origin-left ${isActive ? 'scale-x-100' : 'group-hover/link:scale-x-100'
                    }`}
                />
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA / Auth - Khối hành động và xác thực người dùng trên máy tính */}
        <div className="hidden lg:flex items-center lg:gap-4 xl:gap-6">
          {isLoggedIn ? (
            <div className="flex items-center lg:gap-4 xl:gap-5">
              {/* Thẻ thông tin người dùng được thiết kế tối giản, sang trọng */}
              <div className="flex items-center gap-3 text-primary font-label-md text-[11px] xl:text-xs uppercase tracking-wider bg-surface-container-low px-3 py-1.5 xl:px-4 xl:py-2 border border-outline-variant/30 rounded-md">
                <User className="h-3.5 w-3.5 text-secondary" />
                <span className="font-semibold max-w-[100px] xl:max-w-[150px] truncate">{userEmail.split('@')[0]}</span>
              </div>
              {/* Nút Đăng xuất với hiệu ứng chuyển màu đỏ nhẹ cảnh báo */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 font-label-md text-[11px] xl:text-xs uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors duration-300"
                title="Đăng xuất"
              >
                <LogOut className="h-3.5 w-3.5" />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center lg:gap-4 xl:gap-6">
              <Link
                to="/login"
                className="font-label-md text-xs lg:text-[13px] xl:text-label-md uppercase tracking-wider xl:tracking-widest text-primary hover:text-secondary hover:opacity-80 transition-all duration-300 font-semibold"
              >
                Đăng nhập
              </Link>
              <button
                onClick={() => navigate('/stays')}
                className="font-label-md text-xs lg:text-[13px] xl:text-label-md uppercase tracking-wider xl:tracking-widest bg-primary text-on-primary px-4 py-2.5 xl:px-6 xl:py-3 border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
              >
                Đặt phòng ngay
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button - Nút bật tắt Menu dạng ngăn kéo trên thiết bị di động */}
        <button
          className="lg:hidden text-primary focus:outline-none p-1 hover:text-secondary transition-colors duration-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay - Ngăn kéo hiển thị danh sách mục trên thiết bị di động */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-background/98 backdrop-blur-lg border-b border-surface-variant/50 shadow-lg py-6 px-margin-mobile flex flex-col gap-6 animate-fade-in">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.name} onClick={() => setIsMobileMenuOpen(false)}>
                  <Link
                    to={link.path}
                    className={`block font-label-md text-label-md uppercase tracking-widest py-2 transition-colors duration-300 ${isActive ? 'text-secondary font-semibold' : 'text-primary hover:text-secondary'
                      }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-4 border-t border-surface-variant/30 pt-4">
            {isLoggedIn ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-primary font-label-md text-xs uppercase tracking-wider bg-surface-container-low px-4 py-3 border border-outline-variant/30 rounded-md">
                  <User className="h-4 w-4 text-secondary" />
                  <span className="font-semibold">{userEmail}</span>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center flex justify-center items-center gap-2 font-label-md text-label-md uppercase tracking-widest bg-red-500/10 text-error py-4 hover:bg-red-500/20 transition-all rounded"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center block font-label-md text-label-md uppercase tracking-widest text-primary py-3 hover:text-secondary font-semibold"
                >
                  Đăng nhập
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/stays');
                  }}
                  className="w-full text-center font-label-md text-label-md uppercase tracking-widest bg-primary text-on-primary py-4 hover:bg-secondary transition-colors"
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

