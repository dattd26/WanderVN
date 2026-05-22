import React from 'react';
import { RegistrationStepper } from './RegistrationStepper';

interface AuthCardWrapperProps {
  title: string;
  subtitle: string;
  widthClass?: string;
  registrationStep?: number; // 0: Idle/Form, 1-5: Stepper stages
  children: React.ReactNode;
}

export const AuthCardWrapper: React.FC<AuthCardWrapperProps> = ({
  title,
  subtitle,
  widthClass = 'max-w-[440px]',
  registrationStep = 0,
  children,
}) => {
  const isProcessing = registrationStep > 0;

  return (
    <div 
      className={`relative w-full shadow-[0_20px_40px_rgba(26,26,26,0.2)] border border-outline-variant/30 overflow-hidden animate-fade-scale p-8 md:p-12 bg-surface-container-low paper-grain ${widthClass}`}
    >
      {/* Decorative Golden Line at the top of the card */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-secondary-container via-secondary to-secondary-container"></div>

      {/* Stepper / Success Overlay Screen */}
      {isProcessing && (
        <div className="absolute inset-0 z-30 bg-surface/98 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-fade-in">
          {registrationStep === 5 ? (
            <div className="flex flex-col items-center justify-center text-center max-w-[300px] animate-fade-in">
              <div className="w-16 h-16 rounded-full border border-secondary flex items-center justify-center mb-6 bg-secondary-container/20 shadow-[0_0_20px_rgba(254,214,91,0.2)]">
                <svg className="w-8 h-8 text-secondary stroke-[2.5] animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="font-display-lg text-2xl text-primary tracking-tight">Đăng Ký Hoàn Tất</h3>
              <p className="font-body-md text-sm text-on-surface-variant mt-3 leading-relaxed">
                Tài khoản khách lữ hành WanderVN của bạn đã được khởi tạo và kích hoạt thành công. Thư chào mừng đã gửi đến hòm thư!
              </p>
              <div className="mt-8 flex gap-2 items-center text-secondary font-label-md text-xs uppercase tracking-widest animate-pulse">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ĐANG CHUYỂN HƯỚNG...
              </div>
            </div>
          ) : (
            <RegistrationStepper currentStep={registrationStep} />
          )}
        </div>
      )}

      {/* Brand Header */}
      <div className="mb-8 text-center select-none animate-fade-in">
        <h2 className="font-display-lg text-3xl text-primary tracking-tighter mb-1.5">WanderVN</h2>
        <div className="w-12 h-[1px] bg-secondary/40 mx-auto mb-4"></div>
        <h1 className="font-display-lg text-2xl text-on-background tracking-tight">{title}</h1>
        <p className="font-body-md text-xs text-on-surface-variant mt-2 leading-relaxed opacity-85">{subtitle}</p>
      </div>

      {/* Form Content */}
      <div className="animate-fade-in">
        {children}
      </div>
    </div>
  );
};

export default AuthCardWrapper;
