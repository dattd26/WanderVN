import React, { useEffect, useMemo, useState } from 'react';
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

  // Auto-save vào localStorage (bỏ qua photos vì File không serialize)
  useEffect(() => {
    const timer = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { photos: _photos, ...serializable } = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
      setLastSavedAt(new Date());
    }, 600);

    return () => clearTimeout(timer);
  }, [data]);

  // Scroll lên đầu khi đổi step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const updateData = (patch: Partial<PartnerOnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const jumpTo = (idx: number) => setCurrentStep(idx);

  const draftStatus = useMemo(
    () => (lastSavedAt ? formatDraftTime(lastSavedAt) : undefined),
    [lastSavedAt],
  );

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
