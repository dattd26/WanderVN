import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import {
  Leaf, Waves, Landmark, Mountain, Users, Heart, type LucideIcon
} from 'lucide-react';
import { homeService, type HomeTravelMood } from '../../../services/client/homeService';

const iconMap: Record<string, LucideIcon> = {
  Leaf,
  Waves,
  Landmark,
  Mountain,
  Users,
  Heart
};

export const TravelMoodSelector: React.FC = () => {
  const navigate = useNavigate();
  const [moods, setMoods] = useState<HomeTravelMood[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const titleRef = useScrollReveal<HTMLDivElement>('fade-up', { threshold: 0.2 });
  const gridRef = useScrollReveal<HTMLDivElement>('fade-up', {
    threshold: 0.1,
    staggerChildren: true,
    staggerDelay: 100,
  });

  useEffect(() => {
    let isMounted = true;
    homeService.getTravelMoods()
      .then(data => {
        if (isMounted) {
          setMoods(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải danh sách cảm hứng du lịch:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-24 md:py-36 px-margin-mobile md:px-margin-desktop bg-background">
      <div className="max-w-container-max mx-auto">
        <div ref={titleRef} className="text-center max-w-2xl mx-auto mb-16">
          <span className="home-section-label block mb-4">Khám phá theo cảm hứng</span>
          <h2 className="home-section-title text-3xl md:text-headline-lg mb-5">
            Bạn muốn chuyến đi lần này<br className="hidden md:block" /> mang cảm giác gì?
          </h2>
          <div className="home-divider mt-6" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="relative overflow-hidden h-[240px] md:h-[280px] rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={gridRef}
            className="mood-grid grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6"
          >
            {moods.map((mood) => {
              const Icon = iconMap[mood.iconName] || Leaf;
              return (
                <div
                  key={mood.id}
                  className="mood-card"
                  onClick={() => navigate(`/collections/mood/${mood.id}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem gợi ý cho ${mood.title}`}
                >
                  <img
                    src={mood.imageUrl}
                    alt={mood.title}
                    className="mood-card-image"
                    loading="lazy"
                  />
                  <div className="mood-card-overlay" />

                  <div className="mood-card-content">
                    <Icon
                      className="w-6 h-6 mb-3 text-white/70"
                      strokeWidth={1.5}
                    />
                    <h3 className="font-display-lg text-xl md:text-headline-md text-white font-medium leading-tight">
                      {mood.title}
                    </h3>

                    <div className="mood-card-desc">
                      <p className="text-sm text-white/70 leading-relaxed">
                        {mood.description}
                      </p>
                    </div>

                    <div className="mood-card-cta mt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-fixed">
                        Xem gợi ý →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default TravelMoodSelector;
