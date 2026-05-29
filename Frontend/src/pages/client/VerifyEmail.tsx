import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Home, Loader2, Mail } from 'lucide-react';
import { authService } from '../../services/auth/authService';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(!token ? 'error' : 'loading');
  const [errorMessage, setErrorMessage] = useState(!token ? 'Không tìm thấy mã xác nhận (token) trong đường dẫn.' : '');

  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage((err as Error).message || 'Xác nhận email thất bại. Mã xác nhận có thể đã hết hạn hoặc không hợp lệ.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-20 px-margin-mobile md:px-margin-desktop bg-background text-on-surface relative">
      <div className="max-w-xl w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-8 md:p-12 shadow-2xl limestone-shadow animate-scale-in text-center">

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
            <div className="p-4 bg-surface-variant rounded-full text-primary">
              <Loader2 className="h-12 w-12 animate-spin" />
            </div>
            <h1 className="font-display-md text-headline-md text-primary">
              Đang Xác Nhận Email...
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-sm">
              Vui lòng chờ trong giây lát, hệ thống đang kiểm tra và kích hoạt tài khoản của bạn.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
            <div className="p-4 bg-emerald-50 rounded-full border border-emerald-200">
              <CheckCircle className="h-16 w-16 text-emerald-600 animate-pulse" />
            </div>
            <span className="font-label-md text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
              Xác Nhận Thành Công
            </span>
            <h1 className="font-display-md text-headline-md text-primary">
              Tài Khoản Đã Được Kích Hoạt
            </h1>
            <p className="font-body-md text-on-surface-variant mb-4 max-w-md">
              Cảm ơn bạn đã xác nhận địa chỉ email. Tài khoản di sản WanderVN của bạn hiện đã được kích hoạt hoàn toàn. Hãy đăng nhập ngay để bắt đầu hành trình!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full mt-6">
              <Link
                to="/"
                className="font-label-md text-xs uppercase tracking-widest px-6 py-3.5 border border-primary text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" /> Trang Chủ
              </Link>
              <Link
                to="/login"
                className="font-label-md text-xs uppercase tracking-widest px-6 py-3.5 bg-primary text-on-primary hover:bg-surface-tint transition-all flex items-center justify-center gap-2"
              >
                Đăng Nhập Ngay <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
            <div className="p-4 bg-red-50 rounded-full border border-red-200">
              <XCircle className="h-16 w-16 text-red-600 animate-bounce" />
            </div>
            <span className="font-label-md text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-widest inline-block">
              Xác Nhận Thất Bại
            </span>
            <h1 className="font-display-md text-headline-md text-primary">
              Lỗi Xác Nhận Tài Khoản
            </h1>
            <p className="font-body-md text-on-surface-variant mb-4 max-w-md">
              {errorMessage}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full mt-6">
              <Link
                to="/"
                className="font-label-md text-xs uppercase tracking-widest px-6 py-3.5 border border-primary text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" /> Quay Về Trang Chủ
              </Link>
              <Link
                to="/login"
                className="font-label-md text-xs uppercase tracking-widest px-6 py-3.5 bg-secondary text-on-primary hover:bg-on-secondary-container transition-all flex items-center justify-center gap-2"
              >
                Thử Đăng Nhập Lại
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
