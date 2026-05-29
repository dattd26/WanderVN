import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import { AuthCardWrapper } from '../../components/auth/AuthCardWrapper';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const explicitRedirect = searchParams.get('redirect');

  // Trang đích mặc định sau khi đăng nhập, dựa trên vai trò của tài khoản.
  const getDefaultLandingByRole = (role: string): string => {
    switch (role) {
      case 'Admin':
        return '/admin/dashboard';
      case 'Partner':
        return '/partner/dashboard';
      default:
        return '/';
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const validateForm = () => {
    const tempErrors: typeof errors = {};
    if (!email) {
      tempErrors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Vui lòng nhập đúng định dạng email (vd: traveler@wandervn.com).';
    }

    if (!password) {
      tempErrors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 6) {
      tempErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Gọi service đăng nhập
      const data = await authService.login({ email, password });
      
      // Lưu token và thông tin đăng nhập
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userEmail', email);
      try {
  // Giải mã phần thân (payload) của JWT Token dạng chuỗi Base64
  const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
  
  // Lấy ID ra (C# thường lưu trong trường 'nameid' hoặc 'sub' hoặc 'id')
  const actualUserId = tokenPayload.nameid || tokenPayload.sub || tokenPayload.id;
  
  if (actualUserId) {
    localStorage.setItem('userId', actualUserId.toString());
  }
} catch (error) {
  console.error("Lỗi giải mã token để lấy userId:", error);
}

      setToastMessage('Chào mừng quay trở lại! Đang tải hành trình của bạn...');

      // Ưu tiên redirect URL nếu user bị bounce sang /login từ trang protected,
      // ngược lại đưa về trang mặc định theo vai trò (Admin → /admin, Partner → /partner).
      const target = explicitRedirect || getDefaultLandingByRole(data.role);

      setTimeout(() => {
        setIsLoading(false);
        navigate(target);
        // Reload nhẹ để Navbar/Layout cập nhật trạng thái đăng nhập
        window.location.reload();
      }, 1500);

    } catch (err) {
      const error = err as Error;
      setIsLoading(false);
      setErrors({
        general: error.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu.'
      });
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Vui lòng điền email hợp lệ bên dưới trước để nhận liên kết đặt lại mật khẩu.' });
      return;
    }
    setErrors({});
    setToastMessage(`Một liên kết đặt lại mật khẩu đã được gửi đến ${email}.`);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in bg-surface border border-secondary/35 shadow-[0_10px_30px_rgba(115,92,0,0.15)] px-6 py-4 flex items-center gap-3 rounded-md max-w-md w-[90%] md:w-auto">
          <span className="material-symbols-outlined text-secondary text-xl">compass_calibration</span>
          <p className="font-label-md text-xs text-on-surface-variant font-medium tracking-wide uppercase">{toastMessage}</p>
        </div>
      )}

      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        <img 
          alt="Cinematic heritage hotel" 
          className="w-full h-full object-cover select-none transform scale-105 filter brightness-[0.7]" 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"
        />
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-transparent to-primary/30"></div>
      </div>

      {/* Spacing for navbar */}
      <div className="h-24 w-full"></div>

      {/* Primary Card Workspace */}
      <main className="relative z-10 flex-grow w-full flex items-center justify-center lg:justify-end px-margin-mobile py-8 md:py-16 md:px-margin-desktop lg:pr-36">
        
        <AuthCardWrapper 
          title="Đăng Nhập" 
          subtitle="Quay lại hành trình di sản được tuyển chọn dành riêng cho bạn."
          widthClass="max-w-[430px]"
        >
          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-error text-xs font-caption rounded leading-relaxed animate-fade-in">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            {/* Email Address */}
            <div className="flex flex-col gap-1.5 group">
              <label 
                className={`font-label-md text-xs uppercase tracking-wider transition-colors duration-300 ${errors.email ? 'text-error' : 'text-on-surface-variant group-focus-within:text-secondary'}`}
                htmlFor="email"
              >
                Địa chỉ Email
              </label>
              <input 
                className={`bg-transparent border-b py-2 font-body-md text-sm focus:outline-none transition-colors placeholder:text-outline-variant/60 bg-surface-container-lowest/10
                  ${errors.email 
                    ? 'border-error focus:border-error' 
                    : 'border-outline-variant focus:border-secondary'
                  }`}
                id="email" 
                name="email" 
                placeholder="traveler@wandervn.com" 
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
              />
              {errors.email && (
                <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 group">
              <div className="flex justify-between items-baseline select-none">
                <label 
                  className={`font-label-md text-xs uppercase tracking-wider transition-colors duration-300 ${errors.password ? 'text-error' : 'text-on-surface-variant group-focus-within:text-secondary'}`}
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <a 
                  className="font-caption text-[11px] text-secondary hover:text-primary transition-colors uppercase tracking-wider" 
                  href="#forgot-password"
                  onClick={handleForgotPassword}
                >
                  Quên mật khẩu?
                </a>
              </div>
              <input 
                className={`bg-transparent border-b py-2 font-body-md text-sm focus:outline-none transition-colors placeholder:text-outline-variant/60 bg-surface-container-lowest/10
                  ${errors.password 
                    ? 'border-error focus:border-error' 
                    : 'border-outline-variant focus:border-secondary'
                  }`}
                id="password" 
                name="password" 
                placeholder="••••••••" 
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
              />
              {errors.password && (
                <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.password}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-6 mt-4">
              <button 
                disabled={isLoading}
                className="w-full bg-secondary-container text-on-secondary-container py-4 font-label-md text-xs uppercase tracking-[0.2em] shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed select-none group" 
                type="submit"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-on-secondary-container" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ĐANG KHỞI HÀNH...
                  </span>
                ) : (
                  <>
                    Đăng Nhập
                    <span className="material-symbols-outlined ml-2 text-[18px] transition-transform group-hover:translate-x-1">arrow_right_alt</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 py-1 select-none">
                <span className="font-body-md text-xs text-on-surface-variant opacity-75">Lần đầu tiên đến di sản?</span>
                <Link 
                  to={`/register${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                  className="font-label-md text-xs text-secondary border-b border-transparent hover:border-secondary transition-all font-semibold uppercase tracking-wider"
                >
                  Đăng ký tài khoản
                </Link>
              </div>
            </div>
          </form>

          {/* Cinematic Quote */}
          <footer className="mt-8 pt-4 border-t border-outline-variant/30 select-none">
            <p className="font-caption text-xxs text-on-surface-variant leading-relaxed italic opacity-70 text-center uppercase tracking-widest">
              "Khám phá không gian di sản sang trọng thuần khiết cùng WanderVN."
            </p>
          </footer>
        </AuthCardWrapper>

      </main>

      {/* Decorative Information overlay panel */}
      <div className="relative z-10 w-full select-none mt-auto">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 flex justify-between items-end">
          
          <div className="hidden lg:block">
            <div className="flex flex-col gap-2 text-surface-bright/70 max-w-sm">
              <span className="font-label-md text-[10px] uppercase tracking-[0.4em] text-secondary-fixed">
                Cố đô Huế cổ kính
              </span>
              <div className="w-12 h-[1px] bg-surface-bright/30"></div>
              <p className="font-caption text-xxs leading-relaxed text-surface-bright/60">
                Không gian cổ điển giao thoa Pháp thuộc cổ kính giữa lòng cố đô Huế, gợi lên sự thư thái yên bình đầy kiêu hãnh của dòng thời gian lịch sử.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-3 w-full lg:w-auto text-surface-bright/40 text-[10px] uppercase tracking-widest border-t border-white/5 pt-4 md:pt-0 md:border-none">
            <p className="text-center md:text-left">
              © {new Date().getFullYear()} WanderVN. Crafted for the Discerning Traveler.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;
