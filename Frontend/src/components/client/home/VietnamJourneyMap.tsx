import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../../../hooks/useScrollReveal';
import { MapPin } from 'lucide-react';

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
      { name: 'Đà Nẵng', locationId: 15, image: 'https://images.unsplash.com/photo-1559592443-7f87aae4f4ed?auto=format&fit=crop&w=400&q=80' },
      { name: 'Hội An', locationId: 104, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80' },
      { name: 'Quy Nhơn', locationId: 8, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  south: {
    label: 'Miền Nam',
    destinations: [
      { name: 'Đà Lạt', locationId: 102, image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?auto=format&fit=crop&w=400&q=80' },
      { name: 'Phú Quốc', locationId: 101, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=400&q=80' },
      { name: 'Cần Thơ', locationId: 9, image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=400&q=80' },
      { name: 'Vũng Tàu', locationId: 114, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
    ],
  },
};

const PIN_POSITIONS: Record<Region, { cx: number; cy: number }> = {
  north: { cx: 52, cy: 18 },
  central: { cx: 62, cy: 50 },
  south: { cx: 55, cy: 80 },
};

const VietnamMapSVG: React.FC<{
  activeRegion: Region;
  onRegionClick: (r: Region) => void;
  routeAnimated: boolean;
}> = ({ activeRegion, onRegionClick, routeAnimated }) => {
  return (
    <svg viewBox="0 0 100 100" className="w-full max-w-[300px] mx-auto lg:mx-0" aria-label="Bản đồ Việt Nam tối giản">
      {/* Outline Việt Nam dạng abstract tối giản */}
      <path
        d="M48 5 C55 3, 60 8, 58 12 C56 16, 60 20, 55 24 C50 28, 58 32, 62 35
           C66 38, 68 42, 65 46 C62 50, 66 54, 64 58
           C62 62, 58 66, 55 70 C52 74, 50 78, 52 82
           C54 86, 48 90, 45 94 C42 92, 50 88, 48 84
           C46 80, 48 76, 50 72 C52 68, 56 64, 58 60
           C60 56, 56 52, 58 48 C60 44, 56 40, 52 36
           C48 32, 44 28, 48 24 C52 20, 46 16, 48 12
           C50 8, 44 7, 48 5 Z"
        className="fill-surface-variant/40 stroke-outline-variant"
        strokeWidth="0.6"
      />

      {/* Vùng miền - clickable */}
      {(Object.keys(REGIONS) as Region[]).map((region) => {
        const pos = PIN_POSITIONS[region];
        const isActive = activeRegion === region;
        return (
          <g key={region} onClick={() => onRegionClick(region)} className="cursor-pointer">
            <circle
              cx={pos.cx}
              cy={pos.cy}
              r={isActive ? 5 : 3.5}
              className={`transition-all duration-400 ${isActive ? 'fill-secondary stroke-secondary' : 'fill-outline-variant stroke-outline'}`}
              strokeWidth={isActive ? 1.5 : 0.8}
            />
            {isActive && (
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={9}
                fill="none"
                className="stroke-secondary"
                strokeWidth="0.5"
                opacity="0.4"
              >
                <animate attributeName="r" from="6" to="12" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <text
              x={pos.cx + (region === 'north' ? 8 : region === 'central' ? 8 : 8)}
              y={pos.cy + 1}
              className="text-[4px] font-semibold fill-on-surface"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {REGIONS[region].label}
            </text>
          </g>
        );
      })}

      {/* Route line animation */}
      <path
        d={`M${PIN_POSITIONS.north.cx} ${PIN_POSITIONS.north.cy} 
            Q${PIN_POSITIONS.central.cx + 5} ${(PIN_POSITIONS.north.cy + PIN_POSITIONS.central.cy) / 2} 
            ${PIN_POSITIONS.central.cx} ${PIN_POSITIONS.central.cy}
            Q${PIN_POSITIONS.south.cx - 5} ${(PIN_POSITIONS.central.cy + PIN_POSITIONS.south.cy) / 2}
            ${PIN_POSITIONS.south.cx} ${PIN_POSITIONS.south.cy}`}
        fill="none"
        stroke="#735c00"
        strokeWidth="0.8"
        strokeDasharray="2 2"
        className={`map-route-line ${routeAnimated ? 'animate' : ''}`}
        opacity="0.5"
      />
    </svg>
  );
};

export const VietnamJourneyMap: React.FC = () => {
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState<Region>('north');
  const [routeAnimated, setRouteAnimated] = useState(false);
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
          setTimeout(() => setRouteAnimated(true), 400);
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
          {/* Bản đồ SVG */}
          <div ref={mapRef} className="lg:w-[35%] flex-shrink-0">
            <VietnamMapSVG
              activeRegion={activeRegion}
              onRegionClick={setActiveRegion}
              routeAnimated={routeAnimated}
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
