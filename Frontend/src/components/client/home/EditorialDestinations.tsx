import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { ArrowRight } from 'lucide-react';
import { homeService, type HomeEditorialDestination } from '../../../services/client/homeService';

const DestCard: React.FC<{
  dest: HomeEditorialDestination;
  isLarge?: boolean;
  onClick: () => void;
}> = ({ dest, isLarge = false, onClick }) => {
  return (
    <div
      className={isLarge ? 'editorial-dest-large cursor-pointer' : 'editorial-dest-small cursor-pointer'}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Khám phá ${dest.locationName}`}
    >
      <div className={`relative overflow-hidden ${isLarge ? 'aspect-[3/4] lg:aspect-auto lg:h-full' : 'aspect-[4/3]'}`}>
        <img
          src={dest.imageUrl}
          alt={dest.locationName}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />

        {/* Gradient overlay cố định */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent z-[1]" />

        {/* Tags */}
        <div className="absolute top-4 left-4 z-[2] flex flex-wrap gap-2">
          {dest.tags.map((tag) => (
            <span key={tag} className="dest-tag">{tag}</span>
          ))}
        </div>

        {/* Thông tin cơ bản */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-[2]">
          <h3 className={`font-display-lg text-white font-medium leading-tight ${isLarge ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'}`}>
            {dest.locationName}
          </h3>
        </div>

        {/* Hover: thông tin chi tiết */}
        <div className="editorial-hover-info">
          <div className="space-y-2 text-sm text-white/80">
            <p>
              <span className="text-secondary-fixed font-semibold">Thời điểm đẹp nhất: </span>
              {dest.bestTime}
            </p>
            <p>
              <span className="text-secondary-fixed font-semibold">Trải nghiệm nên thử: </span>
              {dest.experience}
            </p>
            <p>
              <span className="text-secondary-fixed font-semibold">{dest.staysCount} </span>
              nơi lưu trú nổi bật
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-fixed">
            Khám phá <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const EditorialDestinations: React.FC = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<HomeEditorialDestination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const titleRef = useScrollReveal<HTMLDivElement>('fade-up', { threshold: 0.2 });
  const largeRef = useScrollReveal<HTMLDivElement>('fade-left', { threshold: 0.15 });
  const smallGridRef = useScrollReveal<HTMLDivElement>('fade-up', {
    threshold: 0.1,
    staggerChildren: true,
    staggerDelay: 150,
  });

  useEffect(() => {
    let isMounted = true;
    homeService.getEditorialDestinations()
      .then(data => {
        if (isMounted) {
          setDestinations(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải điểm đến nổi bật:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const largeDest = destinations.find(d => d.isLarge) || destinations[0];
  const smallDests = destinations.filter(d => d.id !== largeDest?.id);

  const handleClick = (dest: HomeEditorialDestination) => {
    navigate(`/stays?locationId=${dest.locationId}&locationName=${encodeURIComponent(dest.locationName)}`);
  };

  return (
    <section className="py-24 md:py-36 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
      <div className="max-w-container-max mx-auto">
        <div ref={titleRef} className="max-w-2xl mb-14">
          <span className="home-section-label block mb-4">Điểm đến được tuyển chọn</span>
          <h2 className="home-section-title text-3xl md:text-headline-lg mb-4">
            Từ phố cổ đến biển xanh
          </h2>
          <p className="home-section-desc max-w-lg">
            Mỗi vùng đất là một trang nhật ký du ký đầy chất thơ đang chờ lữ khách chắp bút.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
            <div className="lg:w-[55%] h-[400px] lg:h-[500px] bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            <div className="lg:w-[45%] grid grid-cols-2 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : destinations.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant">
            Không tìm thấy dữ liệu điểm đến nào.
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cột trái: ảnh lớn sticky */}
            {largeDest && (
              <div ref={largeRef} className="lg:w-[55%] editorial-sticky-container">
                <DestCard
                  dest={largeDest}
                  isLarge
                  onClick={() => handleClick(largeDest)}
                />
              </div>
            )}

            {/* Cột phải: mosaic nhỏ */}
            <div ref={smallGridRef} className="lg:w-[45%] grid grid-cols-2 gap-5">
              {smallDests.map((dest) => (
                <DestCard
                  key={dest.id}
                  dest={dest}
                  onClick={() => handleClick(dest)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EditorialDestinations;
