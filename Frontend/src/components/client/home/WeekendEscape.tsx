import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal, useHorizontalScroll } from '../../../hooks/useScrollReveal';
import { ArrowRight, Clock } from 'lucide-react';
import { homeService, type HomeWeekendEscape } from '../../../services/client/homeService';
import { HotelCardSkeleton } from '../../ui/HotelCardSkeleton';
type Origin = 'hanoi' | 'danang' | 'hcm';

const ORIGINS: { key: Origin; label: string }[] = [
  { key: 'hanoi', label: 'Từ Hà Nội' },
  { key: 'danang', label: 'Từ Đà Nẵng' },
  { key: 'hcm', label: 'Từ TP. Hồ Chí Minh' }
];

export const WeekendEscape: React.FC = () => {
  const navigate = useNavigate();
  const [activeOrigin, setActiveOrigin] = useState<Origin>('hanoi');
  const [escapes, setEscapes] = useState<HomeWeekendEscape[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const titleRef = useScrollReveal<HTMLDivElement>('fade-up', { threshold: 0.2 });
  const { containerRef, scrollContentRef } = useHorizontalScroll<HTMLDivElement>(200);

  useEffect(() => {
    //eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    let isMounted = true;

    homeService.getWeekendEscapes(activeOrigin)
      .then(data => {
        if (isMounted) {
          setEscapes(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error(`Lỗi khi tải điểm trốn cuối tuần từ ${activeOrigin}:`, err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeOrigin]);

  return (
    <section className="py-24 md:py-36 px-margin-mobile md:px-margin-desktop bg-surface-container-low">
      <div className="max-w-container-max mx-auto">
        <div ref={titleRef} className="mb-12">
          <span className="home-section-label block mb-4">Hành trình cuối tuần</span>
          <h2 className="home-section-title text-3xl md:text-headline-lg mb-6">
            Cuối tuần này đi đâu?
          </h2>

          {/* Origin tabs */}
          <div className="flex flex-wrap gap-3">
            {ORIGINS.map((origin) => (
              <button
                key={origin.key}
                className={`escape-tab ${activeOrigin === origin.key ? 'active' : ''}`}
                onClick={() => setActiveOrigin(origin.key)}
              >
                {origin.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal scroll track */}
        <div ref={containerRef} className="overflow-hidden -mx-margin-mobile md:-mx-margin-desktop">
          <div
            ref={scrollContentRef}
            className="escape-scroll-track px-margin-mobile md:px-margin-desktop"
          >
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <HotelCardSkeleton key={i} />
              ))
            ) : escapes.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant w-full">
                Không tìm thấy dữ liệu trốn cuối tuần nào.
              </div>
            ) : (
              escapes.map((item) => (
                <div
                  key={`${activeOrigin}-${item.id}`}
                  className="escape-card"
                  onClick={() => navigate(`/stays?locationId=${item.locationId}&locationName=${encodeURIComponent(item.locationName)}`)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Ảnh */}
                  <div className="w-48 md:w-56 flex-shrink-0 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.locationName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Nội dung */}
                  <div className="p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-display-lg text-xl text-primary font-medium">
                          {item.locationName}
                        </h4>
                        <span className="flex items-center gap-1 text-xs font-semibold text-secondary uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" />
                          {item.duration}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:text-secondary transition-colors">
                      Xem khách sạn phù hợp <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeekendEscape;
