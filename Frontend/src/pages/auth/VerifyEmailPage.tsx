import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/auth/authService';

type VerifyStatus = 'loading' | 'success' | 'expired' | 'invalid' | 'already_verified';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('invalid');
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (err) {
        const error = err as Error;
        const msg = error.message || '';
        if (msg.includes('hết hạn') || msg.includes('expired')) {
          setStatus('expired');
        } else if (msg.includes('đã được kích hoạt') || msg.includes('already')) {
          setStatus('already_verified');
        } else {
          setStatus('invalid');
          setErrorMessage(msg);
        }
      }
    };

    verify();
  }, [searchParams]);

  const statusConfig = {
    loading: {
      icon: (
        <svg className="animate-spin h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ),
      title: 'Đang Xác Thực...',
      message: 'Hệ thống đang kiểm tra và kích hoạt tài khoản lữ hành của bạn. Vui lòng chờ giây lát.',
      accent: 'text-secondary',
      cta: null,
    },
    success: {
      icon: (
        <svg className="h-12 w-12 text-secondary stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Tài Khoản Đã Kích Hoạt',
      message: 'Email xác nhận thành công! Tài khoản khách lữ hành WanderVN của bạn đã được kích hoạt và sẵn sàng cho những hành trình di sản tuyệt vời nhất.',
      accent: 'text-secondary',
      cta: { label: 'Đăng Nhập Ngay', to: '/login' },
    },
    expired: {
      icon: (
        <svg className="h-12 w-12 text-amber-400 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Liên Kết Đã Hết Hạn',
      message: 'Link xác nhận email chỉ có hiệu lực trong 24 giờ và đã hết hạn. Vui lòng đăng ký lại để nhận email xác nhận mới.',
      accent: 'text-amber-400',
      cta: { label: 'Đăng Ký Lại', to: '/register' },
    },
    invalid: {
      icon: (
        <svg className="h-12 w-12 text-error stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      title: 'Liên Kết Không Hợp Lệ',
      message: errorMessage || 'Token xác nhận không hợp lệ hoặc đã bị lỗi. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
      accent: 'text-error',
      cta: { label: 'Về Trang Chủ', to: '/' },
    },
    already_verified: {
      icon: (
        <svg className="h-12 w-12 text-secondary stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Tài Khoản Đã Được Kích Hoạt',
      message: 'Tài khoản của bạn đã được xác nhận trước đó. Bạn có thể đăng nhập ngay để bắt đầu hành trình.',
      accent: 'text-secondary',
      cta: { label: 'Đăng Nhập', to: '/login' },
    },
  };

  const config = statusConfig[status];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-x-hidden select-none">

      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        <img
          alt="Cinematic heritage Vietnam"
          className="w-full h-full object-cover select-none transform scale-105 filter brightness-[0.65]"
          src="https://images.unsplash.com/photo-1557750255-c76072a7aad1?auto=format&fit=crop&w=1920&q=80"
        />
        <div className="absolute inset-0 bg-primary/25 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-primary/50" />
      </div>

      {/* Content */}
      <main className="relative z-10 w-full flex items-center justify-center px-4 py-16">
        <div className="relative w-full max-w-[460px] shadow-[0_20px_50px_rgba(26,26,26,0.3)] border border-outline-variant/30 overflow-hidden animate-fade-scale p-10 md:p-14 bg-surface-container-low paper-grain">
          
          {/* Top golden accent line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-secondary-container via-secondary to-secondary-container" />

          {/* Brand */}
          <div className="text-center mb-8 select-none">
            <h2 className="font-display-lg text-3xl text-primary tracking-tighter mb-1.5">WanderVN</h2>
            <div className="w-12 h-[1px] bg-secondary/40 mx-auto" />
          </div>

          {/* Status icon */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className={`w-20 h-20 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container shadow-[0_0_30px_rgba(254,214,91,0.1)]`}>
              {config.icon}
            </div>
          </div>

          {/* Status content */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className={`font-display-lg text-2xl tracking-tight ${config.accent}`}>
              {config.title}
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed max-w-[340px] mx-auto">
              {config.message}
            </p>
          </div>

          {/* Progress bar for loading */}
          {status === 'loading' && (
            <div className="mt-8 h-[2px] bg-outline-variant/20 overflow-hidden rounded-full">
              <div className="h-full bg-gradient-to-r from-secondary-container via-secondary to-secondary-container animate-shimmer" 
                   style={{ width: '60%', animation: 'shimmer 2s infinite' }} />
            </div>
          )}

          {/* CTA Button */}
          {config.cta && (
            <div className="mt-8 text-center animate-fade-in">
              <Link
                to={config.cta.to}
                className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-8 py-3.5 font-label-md text-xs uppercase tracking-[0.2em] shadow-md hover:opacity-90 active:scale-[0.99] transition-all group"
              >
                {config.cta.label}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          )}

          {/* Footer quote */}
          <footer className="mt-10 pt-5 border-t border-outline-variant/30 select-none">
            <p className="font-caption text-[10px] text-on-surface-variant leading-relaxed italic opacity-60 text-center uppercase tracking-widest">
              "Mỗi hành trình bắt đầu từ một bước chân đầu tiên." — WanderVN
            </p>
          </footer>
        </div>
      </main>

      {/* Bottom copyright */}
      <div className="relative z-10 w-full mt-auto">
        <div className="max-w-container-max mx-auto px-4 py-4 flex justify-center">
          <p className="text-surface-bright/40 text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} WanderVN. Crafted for the Discerning Traveler.
          </p>
        </div>
      </div>

    </div>
  );
};

export default VerifyEmailPage;
