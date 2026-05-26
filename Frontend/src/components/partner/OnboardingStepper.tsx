import React from 'react';
import { Check } from 'lucide-react';

export interface OnboardingStep {
  /** Mã định danh dùng cho navigation và state */
  id: string;
  /** Nhãn hiển thị dưới vòng tròn step */
  label: string;
}

interface OnboardingStepperProps {
  steps: OnboardingStep[];
  /** Index của step đang hiện hành (0-based) */
  currentStep: number;
  /** Cho phép click vào step đã hoàn thành để quay lại */
  onStepClick?: (stepIndex: number) => void;
}

/**
 * Thanh điều hướng tiến trình ngang dạng "stepper" cho luồng onboarding partner.
 * Step đã qua: vòng tròn đen với dấu check. Step hiện tại: vòng tròn rỗng viền vàng gold.
 * Step chưa tới: vòng tròn xám với số thứ tự.
 */
export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <nav aria-label="Tiến trình hoàn thành hồ sơ" className="w-full">
      <ol role="list" className="flex items-center justify-center md:justify-start">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isUpcoming = idx > currentStep;
          const isClickable = isCompleted && onStepClick;
          const isLast = idx === steps.length - 1;

          return (
            <li
              key={step.id}
              className={`relative ${isLast ? '' : 'pr-10 sm:pr-16 md:pr-20 flex-1 md:flex-none'}`}
            >
              {/* Đường nối ngang giữa các step */}
              {!isLast && (
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div
                    className={`h-[2px] w-full ${
                      isCompleted ? 'bg-primary' : 'bg-outline-variant/50'
                    }`}
                  />
                </div>
              )}

              {/* Vòng tròn step */}
              <button
                type="button"
                onClick={isClickable ? () => onStepClick(idx) : undefined}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-on-primary cursor-pointer hover:bg-secondary hover:text-on-secondary-container shadow-sm'
                    : isCurrent
                    ? 'border-2 border-secondary bg-surface shadow-[0_0_0_4px_rgba(254,214,91,0.18)]'
                    : 'bg-surface-container-high text-on-surface-variant/60 cursor-default'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : isCurrent ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                ) : (
                  <span className="font-label-md text-label-md">{idx + 1}</span>
                )}
              </button>

              {/* Nhãn dưới vòng tròn */}
              <span
                className={`absolute top-12 left-1/2 -translate-x-1/2 font-label-md text-[11px] uppercase tracking-[0.12em] whitespace-nowrap transition-colors ${
                  isCompleted
                    ? 'text-primary font-semibold'
                    : isCurrent
                    ? 'text-secondary font-semibold'
                    : 'text-on-surface-variant/60'
                } ${isUpcoming ? 'hidden sm:block' : ''}`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default OnboardingStepper;
