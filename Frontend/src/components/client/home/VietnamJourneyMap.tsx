import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { MapPin } from 'lucide-react';
import mapImage from '../../../assets/images/home/Gemini_Generated_Image_73ahag73ahag73ah-Photoroom.png';

type Region = 'north' | 'central' | 'south';

interface Destination {
  name: string;
  locationId: number;
  image: string;
}

const REGIONS: Record<Region, { label: string; destinations: Destination[] }> = {
  north: {
    label: 'Miền Bắc',
    destinations: [
      { name: 'Hà Giang', locationId: 19, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80' },
      { name: 'Sa Pa', locationId: 105, image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80' },
      { name: 'Hạ Long', locationId: 106, image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=400&q=80' },
      { name: 'Ninh Bình', locationId: 42, image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  central: {
    label: 'Miền Trung',
    destinations: [
      { name: 'Huế', locationId: 107, image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=400&q=80' },
      { name: 'Đà Nẵng', locationId: 15, image: 'https://images.unsplash.com/photo-1716903197952-440ea3233ba3?auto=format&amp;fit=crop&amp;w=400&amp;q=80' },
      { name: 'Hội An', locationId: 104, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80' },
      { name: 'Quy Nhơn', locationId: 8, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  south: {
    label: 'Miền Nam',
    destinations: [
      { name: 'Đà Lạt', locationId: 102, image: 'https://images.unsplash.com/photo-1678099006439-dba9e4d3f9f5?auto=format&fit=crop&w=400&q=80' },
      { name: 'Phú Quốc', locationId: 101, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=400&q=80' },
      { name: 'Cần Thơ', locationId: 9, image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=400&q=80' },
      { name: 'Vũng Tàu', locationId: 114, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
    ],
  },
};

const PIN_POSITIONS: Record<Region, { left: string; top: string }> = {
  north: { left: '64%', top: '39%' },
  central: { left: '58%', top: '50%' },
  south: { left: '43%', top: '56%' },
};

const VietnamMapImage: React.FC<{
  activeRegion: Region;
  onRegionClick: (r: Region) => void;
}> = ({ activeRegion, onRegionClick }) => {
  return (
    <div className="relative w-full max-w-[500px] mx-auto lg:mx-0 aspect-[3/4]">
      <img
        src={mapImage}
        alt="Bản đồ Việt Nam"
        className="w-full h-full object-contain opacity-90"
      />

      {/* Vùng miền - clickable points */}
      {(Object.keys(REGIONS) as Region[]).map((region) => {
        const pos = PIN_POSITIONS[region];
        const isActive = activeRegion === region;
        return (
          <div
            key={region}
            onClick={() => onRegionClick(region)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center group z-10"
            style={{ left: pos.left, top: pos.top }}
          >
            {/* Vòng tròn tỏa ra (pulse) khi active */}
            {isActive && (
              <div className="absolute w-10 h-10 rounded-full border border-secondary animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75" />
            )}

            {/* Điểm nhấn chính (dot) */}
            <div
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 relative z-10 shadow-sm ${isActive
                ? 'bg-secondary border-surface scale-125'
                : 'bg-surface border-outline-variant group-hover:border-secondary'
                }`}
            />

            {/* Nhãn vùng miền */}
            <span
              className={`absolute top-6 px-2 py-1 text-[11px] font-semibold rounded bg-surface text-on-surface whitespace-nowrap shadow-sm transition-all duration-300 border border-outline-variant/30 ${isActive
                ? 'opacity-100 translate-y-0 text-secondary'
                : 'opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                }`}
            >
              {REGIONS[region].label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const VietnamJourneyMap: React.FC = () => {
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState<Region>('north');
  const sectionRef = useRef<HTMLElement>(null);

  const titleRef = useScrollReveal<HTMLDivElement>('fade-up', { threshold: 0.2 });
  const mapRef = useScrollReveal<HTMLDivElement>('fade-left', { threshold: 0.15 });
  const listRef = useScrollReveal<HTMLDivElement>('fade-right', { threshold: 0.15 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => { }, 400);
          observer.unobserve(section);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const currentDests = REGIONS[activeRegion].destinations;

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-36 px-margin-mobile md:px-margin-desktop bg-background"
    >
      <div className="max-w-container-max mx-auto">
        <div ref={titleRef} className="text-center max-w-2xl mx-auto mb-16">
          <span className="home-section-label block mb-4">Hành trình Việt Nam</span>
          <h2 className="home-section-title text-3xl md:text-headline-lg mb-4">
            Khám phá Việt Nam theo từng miền
          </h2>
          <p className="home-section-desc">
            Ba miền, ba sắc thái. Chọn vùng đất bạn muốn đặt chân đến.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Bản đồ Image */}
          <div ref={mapRef} className="lg:w-[35%] flex-shrink-0">
            <VietnamMapImage
              activeRegion={activeRegion}
              onRegionClick={setActiveRegion}
            />
          </div>

          {/* Tabs + Danh sách */}
          <div ref={listRef} className="lg:w-[65%] flex-grow">
            {/* Region tabs */}
            <div className="flex gap-2 mb-8 border-b border-surface-variant/40 pb-1">
              {(Object.keys(REGIONS) as Region[]).map((region) => (
                <button
                  key={region}
                  className={`map-tab ${activeRegion === region ? 'active' : ''}`}
                  onClick={() => setActiveRegion(region)}
                >
                  {REGIONS[region].label}
                </button>
              ))}
            </div>

            {/* Destination list */}
            <div className="space-y-2">
              {currentDests.map((dest) => (
                <div
                  key={dest.name}
                  className="map-dest-card"
                  onClick={() => navigate(`/stays?locationId=${dest.locationId}&locationName=${encodeURIComponent(dest.name)}`)}
                >
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-display-lg text-lg text-primary font-medium">{dest.name}</h4>
                    <p className="text-sm text-on-surface-variant">Tìm nơi lưu trú</p>
                  </div>
                  <MapPin className="w-5 h-5 text-outline flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VietnamJourneyMap;
