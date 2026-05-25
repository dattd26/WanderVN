import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Trang báo lỗi truy cập bị hạn chế (403 Forbidden).
 * Hiển thị giao diện thông báo lỗi với phong cách Glassmorphism sang trọng và cao cấp.
 */
export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  const handleLogoutAndRedirect = () => {
    // Xóa session hiện tại để người dùng có thể đăng nhập bằng tài khoản có quyền truy cập phù hợp
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden select-none bg-[#0D0D0D] text-white">
      {/* Nền hoạt ảnh gradient trừu tượng cao cấp */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] rounded-full bg-secondary/10 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>

      {/* Header tối giản */}
      <header className="relative z-10 w-full px-margin-mobile md:px-margin-desktop py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-sm bg-black/20">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-display-lg text-headline-lg text-white tracking-tighter">WanderVN</span>
          <span className="bg-red-500/25 text-red-300 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-sm border border-red-500/30">SECURE</span>
        </Link>
        <Link to="/" className="text-white/60 hover:text-white font-label-md text-xs uppercase tracking-widest transition-colors">
          Quay lại trang chủ
        </Link>
      </header>

      {/* Main Content - Thẻ thông báo lỗi 403 cao cấp */}
      <main className="relative z-10 flex-grow w-full flex items-center justify-center px-margin-mobile py-16">
        <div className="max-w-[540px] w-full bg-black/40 border border-white/10 backdrop-blur-xl p-8 md:p-12 rounded shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center animate-fade-up">
          {/* Biểu tượng Shield/Key cảnh báo tinh tế */}
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 mx-auto mb-8 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
            <span className="material-symbols-outlined text-4xl">gavel</span>
          </div>

          <span className="inline-block font-label-md text-[11px] uppercase tracking-[0.3em] text-red-400 mb-3 font-semibold">
            Lỗi 403 • Truy cập bị hạn chế
          </span>
          <h1 className="font-display-lg text-3xl md:text-4xl text-white mb-6 leading-tight font-bold tracking-tight">
            Quyền truy cập không hợp lệ
          </h1>
          <p className="font-body-md text-body-md text-white/60 mb-10 leading-relaxed">
            Tài khoản hiện tại của bạn không được cấp quyền để truy cập vào phân hệ này. Vui lòng sử dụng tài khoản phù hợp hoặc liên hệ với bộ phận Quản trị viên để được hỗ trợ.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleLogoutAndRedirect}
              className="font-label-md text-xs uppercase tracking-[0.15em] bg-red-600/90 text-white px-6 py-4 rounded shadow-md hover:bg-red-700 transition-all font-bold text-center"
            >
              Đăng nhập tài khoản khác
            </button>
            <Link
              to="/"
              className="font-label-md text-xs uppercase tracking-[0.15em] border border-white/15 text-white px-6 py-4 rounded hover:bg-white/5 transition-all text-center"
            >
              Về Trang chủ
            </Link>
          </div>
        </div>
      </main>

      {/* Footer bản quyền */}
      <footer className="relative z-10 py-6 text-center text-[10px] text-white/30 uppercase tracking-widest border-t border-white/5 bg-black/30">
        © {new Date().getFullYear()} WanderVN Security. High-end access protection active.
      </footer>
    </div>
  );
};

export default AccessDenied;
