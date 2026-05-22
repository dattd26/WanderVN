import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Hotel, User, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
    }
  }, [location]); // Chạy lại khi chuyển trang để cập nhật trạng thái mới nhất

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
    setIsLoggedIn(false);
    setUserEmail('');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Khách sạn', path: '/stays' },
    { name: 'Vé máy bay', path: '/flights' },
    { name: 'Trải nghiệm', path: '#' },
    { name: 'Nhật ký hành trình', path: '#' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${isScrolled || location.pathname !== '/'
          ? 'bg-background/95 backdrop-blur-md border-b border-surface-variant/40 py-5 shadow-sm'
          : 'bg-transparent py-8'
        }`}
    >
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-primary text-on-primary p-2 rounded-lg group-hover:bg-secondary transition-colors duration-300">
            <Hotel className="h-6 w-6" />
          </div>
          <span className="font-display-lg text-headline-lg text-primary tracking-tighter transition-all duration-300 group-hover:opacity-80">
            WanderVN
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`font-label-md text-label-md uppercase tracking-widest transition-all duration-300 ${isActive
                      ? 'text-secondary border-b-2 border-secondary pb-1 font-semibold'
                      : 'text-primary hover:text-secondary hover:opacity-80'
                    }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA / Auth */}
        <div className="hidden md:flex items-center gap-6">
          {isLoggedIn ? (
            <div className="flex items-center gap-5">
              {/* User Profile Tag */}
              <div className="flex items-center gap-2 text-primary font-label-md text-xs uppercase tracking-wider bg-surface-container-low px-4 py-2 border border-outline-variant/30 rounded-md">
                <User className="h-4 w-4 text-secondary" />
                <span className="font-semibold max-w-[150px] truncate">{userEmail.split('@')[0]}</span>
              </div>
              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 font-label-md text-xs uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors duration-300"
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link 
                to="/login"
                className="font-label-md text-label-md uppercase tracking-widest text-primary hover:text-secondary hover:opacity-80 transition-all duration-300 font-semibold"
              >
                Đăng nhập
              </Link>
              <button 
                onClick={() => navigate('/stays')}
                className="font-label-md text-label-md uppercase tracking-widest bg-primary text-on-primary px-6 py-3 border border-primary hover:bg-transparent hover:text-primary transition-all duration-300"
              >
                Đặt phòng ngay
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-primary focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-surface-variant/50 shadow-lg py-6 px-margin-mobile flex flex-col gap-6 animate-fade-in">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name} onClick={() => setIsMobileMenuOpen(false)}>
                <Link
                  to={link.path}
                  className="block font-label-md text-label-md uppercase tracking-widest text-primary hover:text-secondary py-2"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="flex flex-col gap-4 border-t border-surface-variant/30 pt-4">
            {isLoggedIn ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-primary font-label-md text-xs uppercase tracking-wider bg-surface-container-low px-4 py-3 border border-outline-variant/30 rounded-md">
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

