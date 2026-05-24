import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import { AuthCardWrapper } from '../../components/auth/AuthCardWrapper';
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    terms?: string;
    general?: string;
  }>({});
  
  const [registrationStep, setRegistrationStep] = useState(0); // 0 = idle, 1-4 = processing, 5 = success
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
    
    if (!fullName.trim()) {
      tempErrors.fullName = 'Họ và tên là bắt buộc.';
    } else if (fullName.trim().length < 2) {
      tempErrors.fullName = 'Họ và tên tối thiểu phải có 2 ký tự.';
    }

    if (!email) {
      tempErrors.email = 'Địa chỉ email là bắt buộc.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Vui lòng nhập đúng định dạng email (vd: traveler@wandervn.com).';
    }

    if (!password) {
      tempErrors.password = 'Mật khẩu là bắt buộc.';
    } else if (password.length < 6) {
      tempErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
    }

    if (phoneNumber && !/^\+?[0-9]{9,15}$/.test(phoneNumber.trim())) {
      tempErrors.phoneNumber = 'Vui lòng nhập số điện thoại hợp lệ (vd: 0912345678).';
    }

    if (!agreeTerms) {
      tempErrors.terms = 'Bạn phải đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Run the premium multi-stage stepper
  const runStaggeredSteps = (isMock: boolean = false) => {
    let step = 1;
    setRegistrationStep(1);

    const interval = setInterval(() => {
      step += 1;
      setRegistrationStep(step);
      
      if (step === 5) {
        clearInterval(interval);
        setToastMessage(isMock ? 'Đăng ký thành công (Chế độ giả lập)! Chào mừng đến WanderVN.' : 'Đăng ký thành công! Chào mừng đến WanderVN.');
        
        setTimeout(() => {
          setRegistrationStep(0);
          navigate('/login');
        }, 3000);
      }
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrors({});
    
    try {
      // 1. Gửi dữ liệu đăng ký thực tế lên C# ASP.NET Core Backend
      // Để trải nghiệm stepper trọn vẹn, ta gọi API trước
      await authService.register({
        email,
        password,
        fullName,
        phoneNumber: phoneNumber || undefined
      });

      // 2. Nếu API đăng ký thành công, khởi động luồng Stepper di sản tuyệt đẹp
      runStaggeredSteps(false);

    } catch (err) {
      const error = err as Error;
      console.warn('Backend API registration failed, falling back to rich simulation mode...', error);
      
      // Kiểm tra xem có phải lỗi kết nối mạng (chưa bật backend) không
      const isConnectionError = error.message?.includes('Failed to fetch') || error.message?.includes('Lỗi kết nối API');
      
      if (isConnectionError) {
        // Lỗi kết nối -> Kích hoạt chế độ giả lập thông minh (Smart Fallback Mode) để giữ trải nghiệm mượt mà cho khách lữ hành
        setToastMessage('Đang kết nối ở chế độ Giả lập do máy chủ Backend chưa khởi động...');
        runStaggeredSteps(true);
      } else {
        // Lỗi nghiệp vụ thực tế từ C# Backend (ví dụ: Trùng email)
        setErrors({
          general: error.message || 'Đăng ký không thành công. Vui lòng thử lại.'
        });
      }
    }
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
          alt="Cinematic Ninh Binh landscape" 
          className="w-full h-full object-cover select-none transform scale-105 filter brightness-[0.7]" 
          src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1920&q=80"
        />
        <div className="absolute inset-0 cinematic-overlay bg-black/35"></div>
      </div>

      {/* Spacing for navbar */}
      <div className="h-24 w-full"></div>

      {/* Primary Card Workspace */}
      <main className="relative z-10 flex-grow w-full flex items-center justify-center px-margin-mobile py-8 md:py-16 md:px-margin-desktop">
        
        <AuthCardWrapper 
          title="Đăng Ký Tài Khoản" 
          subtitle="Hãy bắt đầu chuyến phiêu lưu di sản của bạn bằng việc tạo tài khoản khách lữ hành."
          widthClass="max-w-[460px]"
          registrationStep={registrationStep}
        >
          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-error text-xs font-caption rounded leading-relaxed animate-fade-in">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Full Name */}
            <div className="relative group flex flex-col gap-1">
              <label 
                className={`block font-label-md text-xs uppercase tracking-wider transition-colors duration-300 ${errors.fullName ? 'text-error' : 'text-on-surface-variant group-focus-within:text-secondary'}`}
                htmlFor="fullName"
              >
                Họ và Tên
              </label>
              <input 
                className={`w-full bg-transparent border-b py-2 focus:outline-none focus:ring-0 transition-all placeholder:text-surface-variant/70 font-body-md text-sm bg-surface-container-lowest/10
                  ${errors.fullName 
                    ? 'border-error focus:border-error' 
                    : 'border-outline-variant focus:border-secondary'
                  }`}
                id="fullName" 
                name="fullName" 
                placeholder="Nhập đầy đủ họ tên của bạn" 
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                }}
              />
              {errors.fullName && (
                <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.fullName}</span>
              )}
            </div>

            {/* Email Address */}
            <div className="relative group flex flex-col gap-1">
              <label 
                className={`block font-label-md text-xs uppercase tracking-wider transition-colors duration-300 ${errors.email ? 'text-error' : 'text-on-surface-variant group-focus-within:text-secondary'}`}
                htmlFor="email"
              >
                Địa chỉ Email
              </label>
              <input 
                className={`w-full bg-transparent border-b py-2 focus:outline-none focus:ring-0 transition-all placeholder:text-surface-variant/70 font-body-md text-sm bg-surface-container-lowest/10
                  ${errors.email 
                    ? 'border-error focus:border-error' 
                    : 'border-outline-variant focus:border-secondary'
                  }`}
                id="email" 
                name="email" 
                placeholder="your@email.com" 
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

            {/* Phone Number */}
            <div className="relative group flex flex-col gap-1">
              <label 
                className={`block font-label-md text-xs uppercase tracking-wider transition-colors duration-300 ${errors.phoneNumber ? 'text-error' : 'text-on-surface-variant group-focus-within:text-secondary'}`}
                htmlFor="phoneNumber"
              >
                Số điện thoại <span className="text-on-surface-variant/50 lowercase italic">(tùy chọn)</span>
              </label>
              <input 
                className={`w-full bg-transparent border-b py-2 focus:outline-none focus:ring-0 transition-all placeholder:text-surface-variant/70 font-body-md text-sm bg-surface-container-lowest/10
                  ${errors.phoneNumber 
                    ? 'border-error focus:border-error' 
                    : 'border-outline-variant focus:border-secondary'
                  }`}
                id="phoneNumber" 
                name="phoneNumber" 
                placeholder="vd: 0912345678" 
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
                }}
              />
              {errors.phoneNumber && (
                <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.phoneNumber}</span>
              )}
            </div>

            {/* Password */}
            <div className="relative group flex flex-col gap-1">
              <label 
                className={`block font-label-md text-xs uppercase tracking-wider transition-colors duration-300 ${errors.password ? 'text-error' : 'text-on-surface-variant group-focus-within:text-secondary'}`}
                htmlFor="password"
              >
                Mật khẩu hành trình
              </label>
              <input 
                className={`w-full bg-transparent border-b py-2 focus:outline-none focus:ring-0 transition-all placeholder:text-surface-variant/70 font-body-md text-sm bg-surface-container-lowest/10
                  ${errors.password 
                    ? 'border-error focus:border-error' 
                    : 'border-outline-variant focus:border-secondary'
                  }`}
                id="password" 
                name="password" 
                placeholder="Tạo một mật khẩu an toàn" 
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
              />
              
              {/* Password Strength Indicator */}
              <PasswordStrengthBar password={password} />

              {errors.password && (
                <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.password}</span>
              )}
            </div>

            {/* Terms of Service check */}
            <div className="flex flex-col pt-1">
              <div className="flex items-start gap-3">
                <input 
                  className={`mt-1 h-4 w-4 border-on-background/20 text-secondary focus:ring-secondary cursor-pointer transition-colors
                    ${errors.terms ? 'border-error focus:ring-error' : 'border-outline-variant'}`}
                  id="terms" 
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.terms) setErrors({ ...errors, terms: undefined });
                  }}
                />
                <label className="font-caption text-xs leading-relaxed text-on-surface-variant cursor-pointer select-none" htmlFor="terms">
                  Tôi đồng ý với <a className="underline hover:text-secondary transition-colors" href="#terms" onClick={(e) => e.preventDefault()}>Điều khoản Dịch vụ</a> và <a className="underline hover:text-secondary transition-colors" href="#privacy" onClick={(e) => e.preventDefault()}>Chính sách Bảo mật</a> của WanderVN.
                </label>
              </div>
              {errors.terms && (
                <span className="text-error font-caption text-xs mt-1 block tracking-tight">{errors.terms}</span>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button 
                className="w-full bg-secondary-container text-on-secondary-container py-4 font-label-md text-xs uppercase tracking-[0.2em] shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex justify-center items-center select-none group"
                type="submit"
              >
                KHỞI TẠO TÀI KHOẢN
                <span className="material-symbols-outlined ml-2 text-[18px] transition-transform group-hover:translate-x-1">arrow_right_alt</span>
              </button>
            </div>
          </form>

          {/* Toggle to Sign In */}
          <div className="mt-6 text-center animate-fade-in select-none">
            <p className="font-body-md text-xs text-on-surface-variant">
              Đã có tài khoản di sản? 
              <Link 
                to="/login"
                className="text-primary font-semibold hover:text-secondary transition-colors inline-flex items-center ml-1 border-b border-transparent hover:border-secondary py-0.5 uppercase tracking-wider"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </AuthCardWrapper>

      </main>

      {/* Decorative Information overlay panel */}
      <div className="relative z-10 w-full select-none mt-auto">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6 flex justify-between items-end">
          
          <div className="hidden lg:block">
            <div className="flex flex-col gap-2 text-surface-bright/70 max-w-sm">
              <span className="font-label-md text-[10px] uppercase tracking-[0.4em] text-secondary-fixed">
                Bình minh trên Tràng An
              </span>
              <div className="w-12 h-[1px] bg-surface-bright/30"></div>
              <p className="font-caption text-xxs leading-relaxed text-surface-bright/60">
                Kỳ quan Ninh Bình lúc hừng đông. Những vách đá vôi nổi lên giữa làn sương ban mai mờ ảo, lay động mọi giác quan lữ khách về sự kỳ vĩ của thiên nhiên Việt Nam.
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

export default RegisterPage;
