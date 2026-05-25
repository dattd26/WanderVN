import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PartnerHeader } from '../../components/partner/PartnerHeader';
import { OnboardingStepper, type OnboardingStep } from '../../components/partner/OnboardingStepper';
import { WelcomeStep } from '../../components/partner/steps/WelcomeStep';
import { PropertyInfoStep } from '../../components/partner/steps/PropertyInfoStep';
import { PhotosStep } from '../../components/partner/steps/PhotosStep';
import { PricingStep } from '../../components/partner/steps/PricingStep';
import { ReviewStep } from '../../components/partner/steps/ReviewStep';
import { DEFAULT_ONBOARDING_DATA, type PartnerOnboardingData } from '../../types';

const STEPS: OnboardingStep[] = [
  { id: 'welcome', label: 'Chào mừng' },
  { id: 'property-info', label: 'Thông tin' },
  { id: 'photos', label: 'Hình ảnh' },
  { id: 'pricing', label: 'Giá phòng' },
  { id: 'review', label: 'Xem lại' },
];

const STEP_INDICES = {
  welcome: 0,
  propertyInfo: 1,
  photos: 2,
  pricing: 3,
  review: 4,
};

const STORAGE_KEY = 'wandervn-partner-onboarding-draft';

/** Re-hydrate giá trị non-File từ localStorage (photos sẽ bị bỏ vì File không serialize) */
const loadDraft = (): PartnerOnboardingData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ONBOARDING_DATA;
    const parsed = JSON.parse(raw) as Partial<PartnerOnboardingData>;
    return {
      ...DEFAULT_ONBOARDING_DATA,
      ...parsed,
      photos: [], // File không serialize được — buộc reset mỗi reload
    };
  } catch {
    return DEFAULT_ONBOARDING_DATA;
  }
};

const formatDraftTime = (date: Date) => {
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `Đã lưu nháp lúc ${hh}:${mm}`;
};

export const PartnerOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<PartnerOnboardingData>(() => loadDraft());
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Auto-save vào localStorage (bỏ qua photos vì File không serialize)
  useEffect(() => {
    if (!token || role !== 'Partner') return;
    const timer = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { photos: _photos, ...serializable } = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
      setLastSavedAt(new Date());
    }, 600);

    return () => clearTimeout(timer);
  }, [data, token, role]);

  // Scroll lên đầu khi đổi step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const draftStatus = useMemo(
    () => (lastSavedAt ? formatDraftTime(lastSavedAt) : undefined),
    [lastSavedAt],
  );

  // 1. Nếu chưa đăng nhập: Hiển thị cổng Gateway giới thiệu & yêu cầu Đăng ký/Đăng nhập Đối tác
  if (!token) {
    return (
      <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden select-none">
        {/* Cinematic Background */}
        <div className="fixed inset-0 z-0">
          <img 
            alt="Beautiful luxury resort lounge" 
            className="w-full h-full object-cover select-none filter brightness-[0.6]" 
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 w-full px-margin-mobile md:px-margin-desktop py-6 flex justify-between items-center border-b border-white/10 backdrop-blur-sm bg-black/10">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display-lg text-headline-lg text-white tracking-tighter">WanderVN</span>
            <span className="bg-secondary text-on-secondary text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-sm">PARTNER</span>
          </Link>
          <Link to="/" className="text-white/70 hover:text-white font-label-md text-xs uppercase tracking-widest transition-colors">
            Quay lại trang chủ
          </Link>
        </header>

        {/* Content */}
        <main className="relative z-10 flex-grow w-full flex items-center justify-center px-margin-mobile py-16">
          <div className="max-w-[580px] bg-background/80 border border-outline-variant/35 backdrop-blur-xl p-8 md:p-12 rounded shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center animate-fade-up">
            <span className="inline-flex items-center gap-2 font-label-md text-[10px] uppercase tracking-[0.3em] text-secondary mb-5">
              Cổng đối tác WanderVN
            </span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-primary mb-6 leading-tight">
              Đồng hành cùng di sản Việt
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-10 leading-relaxed max-w-md mx-auto">
              Để bắt đầu hành trình đăng ký cơ sở lưu trú và kinh doanh cùng WanderVN, quý đối tác vui lòng đăng ký hoặc đăng nhập tài khoản dành riêng cho Đối tác.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register?redirect=/partner/onboarding&role=Partner"
                className="font-label-md text-xs uppercase tracking-[0.15em] bg-primary text-on-primary px-8 py-4 rounded shadow-md hover:bg-secondary hover:text-on-secondary transition-all hover:scale-[1.01] active:scale-[0.99] font-bold text-center"
              >
                Đăng ký tài khoản Đối tác
              </Link>
              <Link
                to="/login?redirect=/partner/onboarding&role=Partner"
                className="font-label-md text-xs uppercase tracking-[0.15em] border border-outline-variant text-primary px-8 py-4 rounded hover:bg-surface-container-high transition-all text-center"
              >
                Đăng nhập Cổng đối tác
              </Link>
            </div>
          </div>
        </main>

        <footer className="relative z-10 py-6 text-center text-[10px] text-white/40 uppercase tracking-widest border-t border-white/5 bg-black/20">
          © {new Date().getFullYear()} WanderVN Partner. Crafted for high-end hospitality.
        </footer>
      </div>
    );
  }

  // 2. Nếu đã đăng nhập nhưng không phải role Partner
  if (role !== 'Partner') {
    const handleLogoutAndRedirect = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userEmail');
      window.location.href = '/register?redirect=/partner/onboarding&role=Partner';
    };

    return (
      <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden select-none bg-background">
        <header className="relative z-10 w-full px-margin-mobile md:px-margin-desktop py-6 flex justify-between items-center border-b border-outline-variant/30 bg-surface">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display-lg text-headline-lg text-primary tracking-tighter">WanderVN</span>
            <span className="bg-secondary text-on-secondary text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-sm">PARTNER</span>
          </Link>
          <Link to="/" className="text-on-surface-variant hover:text-primary font-label-md text-xs uppercase tracking-widest transition-colors">
            Quay lại trang chủ
          </Link>
        </header>

        <main className="relative z-10 flex-grow w-full flex items-center justify-center px-margin-mobile py-16">
          <div className="max-w-[500px] border border-outline-variant/40 bg-surface p-8 md:p-10 rounded limestone-shadow text-center animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-secondary-container/30 text-secondary mx-auto mb-6 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl">gavel</span>
            </div>
            <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-primary mb-4 leading-tight">
              Yêu cầu tài khoản Đối tác
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">
              Tài khoản hiện tại của bạn là <strong className="text-secondary uppercase">Lữ khách (Customer)</strong>. Để đăng ký khách sạn, bạn cần sử dụng tài khoản Đối tác (Partner).
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleLogoutAndRedirect}
                className="font-label-md text-xs uppercase tracking-[0.15em] bg-[#B59A5A] text-white px-6 py-3.5 rounded shadow-sm hover:opacity-90 transition-all font-bold"
              >
                Đăng ký tài khoản Đối tác mới
              </button>
              <Link
                to="/"
                className="font-label-md text-xs uppercase tracking-[0.15em] border border-outline-variant text-primary px-6 py-3.5 rounded hover:bg-surface-container-high transition-all"
              >
                Quay lại Trang chủ WanderVN
              </Link>
            </div>
          </div>
        </main>

        <footer className="relative z-10 py-6 text-center text-[10px] text-on-surface-variant/40 uppercase tracking-widest border-t border-outline-variant/20 bg-surface">
          © {new Date().getFullYear()} WanderVN Partner. All rights reserved.
        </footer>
      </div>
    );
  }

  const updateData = (patch: Partial<PartnerOnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const jumpTo = (idx: number) => setCurrentStep(idx);

  const renderStep = () => {
    switch (currentStep) {
      case STEP_INDICES.welcome:
        return <WelcomeStep data={data} onChange={updateData} onNext={goNext} />;
      case STEP_INDICES.propertyInfo:
        return (
          <PropertyInfoStep data={data} onChange={updateData} onNext={goNext} onBack={goBack} />
        );
      case STEP_INDICES.photos:
        return <PhotosStep data={data} onChange={updateData} onNext={goNext} onBack={goBack} />;
      case STEP_INDICES.pricing:
        return <PricingStep data={data} onChange={updateData} onNext={goNext} onBack={goBack} />;
      case STEP_INDICES.review:
        return (
          <ReviewStep
            data={data}
            onBack={goBack}
            onJumpTo={jumpTo}
            stepIndices={{
              propertyInfo: STEP_INDICES.propertyInfo,
              photos: STEP_INDICES.photos,
              pricing: STEP_INDICES.pricing,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PartnerHeader draftStatus={draftStatus} exitTo="/" />

      <main className="flex-1 w-full max-w-[960px] mx-auto px-margin-mobile md:px-gutter py-12 md:py-16">
        {/* Stepper */}
        <div className="mb-20">
          <OnboardingStepper steps={STEPS} currentStep={currentStep} onStepClick={jumpTo} />
        </div>

        {/* Current step content */}
        <div key={currentStep} className="animate-fade-up">
          {renderStep()}
        </div>
      </main>
    </div>
  );
};

export default PartnerOnboarding;
