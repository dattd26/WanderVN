import React from 'react';
import { JourneyRevealHero } from '../../components/client/hero/JourneyRevealHero';
import { TravelMoodSelector } from '../../components/client/home/TravelMoodSelector';
import { EditorialDestinations } from '../../components/client/home/EditorialDestinations';
import { VietnamJourneyMap } from '../../components/client/home/VietnamJourneyMap';
import { WeekendEscape } from '../../components/client/home/WeekendEscape';
import { StayCollections } from '../../components/client/home/StayCollections';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Compass, ShieldCheck, HeartHandshake } from 'lucide-react';
import './home.css';

const BRAND_VALUES = [
  {
    icon: Compass,
    title: 'Tuyển chọn có gu',
    desc: 'Mỗi nơi lưu trú đều được kiểm định nghiêm ngặt về tính bản địa, kiến trúc và dịch vụ.',
  },
  {
    icon: HeartHandshake,
    title: 'Trải nghiệm bản địa',
    desc: 'Kết nối lữ khách với văn hóa sâu sắc, không chỉ lướt qua bề nổi của điểm đến.',
  },
  {
    icon: ShieldCheck,
    title: 'Đặt chỗ an tâm',
    desc: 'Hỗ trợ 24/7, chính sách hủy linh hoạt, cam kết giá tốt nhất.',
  },
];

export const Home: React.FC = () => {
  const brandRef = useScrollReveal<HTMLDivElement>('fade-up', {
    threshold: 0.15,
    staggerChildren: true,
    staggerDelay: 200,
  });

  return (
    <div className="flex flex-col min-h-screen" style={{ scrollBehavior: 'smooth' }}>
      {/* 1. Cinematic Hero — giữ nguyên */}
      <JourneyRevealHero />

      {/* 2. Travel Mood Selector */}
      <TravelMoodSelector />

      {/* 3. Editorial Featured Destinations */}
      <EditorialDestinations />

      {/* 4. Vietnam Journey Map */}
      <VietnamJourneyMap />

      {/* 5. Weekend Escape */}
      <WeekendEscape />

      {/* 6. Stay Collections */}
      <StayCollections />

      {/* 7. Brand Values — gọn hơn, gần cuối trang */}
      <section className="py-20 md:py-28 px-margin-mobile md:px-margin-desktop paper-texture-bg border-y border-surface-variant/20">
        <div
          ref={brandRef}
          className="max-w-container-max mx-auto flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-16"
        >
          {BRAND_VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="flex-1 flex items-start gap-5">
                <div className="brand-value-icon flex-shrink-0 w-12 h-12 rounded-full border border-outline-variant/40 flex items-center justify-center text-secondary">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-display-lg text-lg text-primary font-medium mb-1.5">
                    {value.title}
                  </h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
