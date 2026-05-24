import React from 'react';
import { Sparkles, ShieldCheck, BarChart3, Users, ArrowRight } from 'lucide-react';
import type { PartnerOnboardingData } from '../../../types';

interface WelcomeStepProps {
  data: PartnerOnboardingData;
  onChange: (patch: Partial<PartnerOnboardingData>) => void;
  onNext: () => void;
}

const BENEFITS = [
  {
    icon: BarChart3,
    title: 'Dashboard kinh doanh thời gian thực',
    description:
      'Theo dõi lượt đặt phòng, tỷ lệ lấp đầy và doanh thu tức thì với hệ thống biểu đồ trực quan.',
  },
  {
    icon: Users,
    title: 'Tiếp cận khách lữ hành cao cấp',
    description:
      'Hồ sơ khách sạn xuất hiện trên trang chủ WanderVN — nơi quy tụ du khách tìm kiếm trải nghiệm di sản đích thực.',
  },
  {
    icon: ShieldCheck,
    title: 'Thanh toán an toàn qua VNPay & ZaloPay',
    description:
      'Mọi giao dịch được xử lý qua cổng thanh toán bảo mật, đối soát tự động minh bạch hàng tuần.',
  },
];

/**
 * Step 1 — Welcome: giới thiệu chương trình partner, hiển thị lợi ích chính
 * và yêu cầu chủ khách sạn đồng ý điều khoản trước khi bắt đầu nhập liệu.
 */
export const WelcomeStep: React.FC<WelcomeStepProps> = ({ data, onChange, onNext }) => {
  const canContinue = data.acceptedPartnerTerms;

  return (
    <div className="space-y-12">
      {/* Hero Title */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 font-label-md text-[11px] uppercase tracking-[0.25em] text-secondary mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          Chào mừng đối tác mới
        </span>
        <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-primary mb-4 leading-tight">
          Mở rộng tầm nhìn cùng <span className="italic text-secondary">WanderVN Partner</span>
        </h1>
        <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant leading-relaxed">
          Hành trình đăng ký diễn ra trong 5 bước, mất khoảng 10 phút. Mọi thông tin sẽ được lưu nháp tự động — bạn có thể quay lại tiếp tục bất cứ lúc nào.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BENEFITS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="bg-surface border border-outline-variant/40 rounded-xl p-6 limestone-shadow hover:border-secondary/40 transition-colors duration-300"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary-container/40 text-on-secondary-container flex items-center justify-center mb-4">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-2 leading-snug">
              {title}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>

      {/* Terms acceptance */}
      <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-6 max-w-2xl mx-auto">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.acceptedPartnerTerms}
            onChange={(e) => onChange({ acceptedPartnerTerms: e.target.checked })}
            className="mt-1 h-4 w-4 border-outline-variant text-secondary focus:ring-secondary cursor-pointer"
          />
          <span className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Tôi đồng ý với{' '}
            <a href="#partner-terms" onClick={(e) => e.preventDefault()} className="text-secondary underline hover:text-primary">
              Điều khoản Hợp tác Partner
            </a>{' '}
            và{' '}
            <a href="#commission" onClick={(e) => e.preventDefault()} className="text-secondary underline hover:text-primary">
              Biểu phí hoa hồng
            </a>{' '}
            của WanderVN. Tôi xác nhận mình là người đại diện hợp pháp của cơ sở lưu trú đăng ký.
          </span>
        </label>
      </div>

      {/* Action Footer */}
      <div className="pt-8 flex items-center justify-end border-t border-outline-variant/30">
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="font-label-md text-label-md uppercase tracking-widest bg-secondary-container text-on-secondary-container px-8 py-4 rounded-lg shadow-sm hover:bg-secondary hover:text-on-secondary transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Bắt đầu khai báo
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
