import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hotel } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  const navLinks = [
    { name: 'Điểm đến', path: '#' },
    { name: 'Khách sạn', path: '/stays' },
    { name: 'Vé máy bay', path: '/flights' },
    { name: 'Trải nghiệm', path: '#' },
    { name: 'Nhật ký hành trình', path: '#' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled || location.pathname !== '/'
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
                  className={`font-label-md text-label-md uppercase tracking-widest transition-all duration-300 ${
                    isActive
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

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <button className="font-label-md text-label-md uppercase tracking-widest bg-primary text-on-primary px-6 py-3 border border-primary hover:bg-transparent hover:text-primary transition-all duration-300">
            Đặt phòng ngay
          </button>
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
          <button className="w-full text-center font-label-md text-label-md uppercase tracking-widest bg-primary text-on-primary py-4 hover:bg-secondary transition-colors">
            Đặt phòng ngay
          </button>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
