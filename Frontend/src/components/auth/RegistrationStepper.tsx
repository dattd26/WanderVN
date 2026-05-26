import React from 'react';

export interface StepInfo {
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

interface RegistrationStepperProps {
  currentStep: number;
}

export const RegistrationStepper: React.FC<RegistrationStepperProps> = ({ currentStep }) => {
  const steps: StepInfo[] = [
    {
      title: 'Khởi tạo hồ sơ',
      description: 'Lập bản ghi khách lữ hành trên hệ thống',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending',
    },
    {
      title: 'Bảo mật thông tin',
      description: 'Mã hóa mật khẩu và cấu hình khóa cá nhân',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending',
    },
    {
      title: 'Biên soạn thư di sản',
      description: 'Thiết kế mẫu thư chào mừng sang trọng',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending',
    },
    {
      title: 'Gửi thư xác nhận',
      description: 'Giao tiếp SMTP và phát thư tự động',
      status: currentStep > 4 ? 'completed' : currentStep === 4 ? 'active' : 'pending',
    },
    {
      title: 'Đăng ký thành công',
      description: 'Sẵn sàng chắp bút viết nên trang du ký mới',
      status: currentStep === 5 ? 'completed' : 'pending',
    },
  ];

  return (
    <div className="w-full space-y-6 my-6 select-none">
      <div className="text-center mb-6">
        <h3 className="font-display-lg text-2xl text-primary tracking-tight">
          Hệ Thống Đang Xử Lý...
        </h3>
        <p className="font-body-md text-xs text-on-surface-variant mt-1.5 max-w-[280px] mx-auto leading-relaxed">
          Đang thực hiện các thủ tục an ninh di sản cho hành trình của bạn.
        </p>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/30">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';

          return (
            <div key={idx} className="relative flex gap-4 items-start group animate-fade-in" style={{ animationDelay: `${idx * 0.15}s` }}>
              {/* Indicator Circle */}
              <div 
                className={`absolute -left-[29px] w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 z-10
                  ${isCompleted 
                    ? 'bg-secondary-container border-secondary text-on-secondary-container shadow-[0_0_10px_rgba(115,92,0,0.2)]' 
                    : isActive 
                      ? 'bg-surface border-secondary text-secondary animate-pulse shadow-[0_0_15px_rgba(254,214,91,0.4)]' 
                      : 'bg-surface border-outline-variant text-on-surface-variant/40'
                  }`}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : isActive ? (
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping"></span>
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Status Details */}
              <div className="flex flex-col flex-grow select-none">
                <h4 
                  className={`font-label-md text-sm transition-colors duration-300 font-semibold tracking-wide
                    ${isCompleted 
                      ? 'text-primary' 
                      : isActive 
                        ? 'text-secondary' 
                        : 'text-on-surface-variant/50'
                    }`}
                >
                  {step.title}
                </h4>
                <p 
                  className={`font-caption text-xs transition-colors duration-300 mt-0.5 leading-relaxed
                    ${isCompleted || isActive 
                      ? 'text-on-surface-variant' 
                      : 'text-on-surface-variant/30'
                    }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegistrationStepper;
