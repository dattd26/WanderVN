import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { ArrowRight } from 'lucide-react';
import { homeService, type HomeStayCollection } from '../../../services/client/homeService';

export const StayCollections: React.FC = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<HomeStayCollection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const titleRef = useScrollReveal<HTMLDivElement>('fade-up', { threshold: 0.2 });
  const gridRef = useScrollReveal<HTMLDivElement>('fade-up', {
    threshold: 0.08,
    staggerChildren: true,
    staggerDelay: 130,
  });

  useEffect(() => {
    let isMounted = true;
    homeService.getStayCollections()
      .then(data => {
        if (isMounted) {
          setCollections(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải bộ sưu tập phòng nghỉ:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-24 md:py-36 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
      <div className="max-w-container-max mx-auto">
        <div ref={titleRef} className="text-center max-w-2xl mx-auto mb-16">
          <span className="home-section-label block mb-4">Bộ sưu tập lưu trú</span>
          <h2 className="home-section-title text-3xl md:text-headline-lg mb-4">
            Chọn nơi ở theo phong cách của bạn
          </h2>
          <p className="home-section-desc">
            Từ resort biển đến homestay bản địa, luôn có một nơi lưu trú dành riêng cho bạn.
          </p>
        </div>

        {isLoading ? (
          <div className="stay-mosaic animate-pulse gap-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 ${
                  i < 2 ? 'h-[300px] md:h-[400px]' : 'h-[200px] md:h-[250px]'
                }`}
              />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant">
            Không tìm thấy dữ liệu bộ sưu tập nào.
          </div>
        ) : (
          /* Mosaic Grid: 2 lớn + 4 nhỏ */
          <div ref={gridRef} className="stay-mosaic">
            {collections.map((col, index) => {
              const isLarge = index < 2;
              return (
                <div
                  key={col.id}
                  className="stay-collection-card cursor-pointer"
                  onClick={() => navigate(`/stays?${col.queryString}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem ${col.title}`}
                >
                  <img
                    src={col.imageUrl}
                    alt={col.title}
                    loading="lazy"
                  />
                  <div className="stay-collection-overlay" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-[2]">
                    <h3 className={`font-display-lg text-white font-medium leading-tight mb-1 ${isLarge ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                      {col.title}
                    </h3>
                    <p className="text-sm text-white/65 leading-relaxed">
                      {col.description}
                    </p>

                    <div className="stay-count-reveal mt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-secondary-fixed uppercase tracking-wider">
                        {col.staysCount} nơi lưu trú
                      </span>
                      <ArrowRight className="w-4 h-4 text-white/60" />
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

export default StayCollections;
