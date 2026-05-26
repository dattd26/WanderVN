import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Building2, ArrowRight, ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import type { PartnerOnboardingData, NominatimResult } from '../../../types';
import { PROPERTY_CATEGORIES } from '../../../types';

interface PropertyInfoStepProps {
  data: PartnerOnboardingData;
  onChange: (patch: Partial<PartnerOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Mặc định center vào Hà Nội (Hồ Hoàn Kiếm) nếu chưa có vị trí
const HANOI_CENTER: [number, number] = [21.0285, 105.8542];

// Marker tùy biến — pin vàng gold WanderVN
const partnerPinIcon = L.divIcon({
  className: '',
  html: `
    <div class="relative" style="transform: translate(-50%, -100%);">
      <div class="w-11 h-11 bg-surface rounded-full flex items-center justify-center border-2 border-secondary shadow-[0_4px_20px_rgba(115,92,0,0.35)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#735c00" stroke="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
        </svg>
      </div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-secondary rounded-full animate-ping opacity-40 -z-10"></div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// Cập nhật vị trí map khi lat/lng thay đổi từ ngoài (vd: chọn Nominatim result)
const FlyToLocation: React.FC<{ lat: number | null; lng: number | null }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], 15, { duration: 0.8 });
    }
  }, [lat, lng, map]);
  return null;
};

export const PropertyInfoStep: React.FC<PropertyInfoStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState(data.streetAddress);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Debounced Nominatim search — chỉ chạy khi user gõ ≥3 ký tự
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      // Trì hoãn cập nhật state bất đồng bộ, tránh lỗi cascading render trong useEffect
      const timer = setTimeout(() => {
        setResults([]);
      }, 0);
      return () => clearTimeout(timer);
    }
    if (searchQuery === data.streetAddress && data.latitude != null) {
      return;
    }

    const timer = setTimeout(async () => {
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;

      setIsSearching(true);
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('format', 'json');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '6');
        url.searchParams.set('countrycodes', 'vn');
        url.searchParams.set('q', searchQuery);

        const res = await fetch(url.toString(), {
          signal: controller.signal,
          headers: { 'Accept-Language': 'vi' },
        });
        if (!res.ok) throw new Error('Nominatim error');
        const json = (await res.json()) as NominatimResult[];
        setResults(json);
        setShowDropdown(true);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Nominatim search failed:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, data.streetAddress, data.latitude]);

  const selectResult = (r: NominatimResult) => {
    onChange({
      streetAddress: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
    });
    setSearchQuery(r.display_name);
    setShowDropdown(false);
  };

  const handleDragEnd = (e: L.DragEndEvent) => {
    const { lat, lng } = (e.target as L.Marker).getLatLng();
    onChange({ latitude: lat, longitude: lng });
  };

  const center: [number, number] =
    data.latitude != null && data.longitude != null
      ? [data.latitude, data.longitude]
      : HANOI_CENTER;

  const canContinue =
    data.propertyName.trim().length >= 3 &&
    data.propertyType !== '' &&
    data.starRating != null &&
    data.streetAddress.trim().length >= 5 &&
    data.latitude != null &&
    data.longitude != null;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-primary mb-3 leading-tight">
          Hãy giới thiệu về cơ sở của bạn.
        </h1>
        <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant leading-relaxed">
          Bắt đầu với những thông tin cơ bản. Mô tả chính xác sẽ giúp cơ sở của bạn tiếp cận đúng đối tượng khách lữ hành cao cấp tại Việt Nam.
        </p>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {/* ── Card 1: Property Identity ── */}
        <section className="bg-surface border border-outline-variant/40 rounded-xl p-6 md:p-8 limestone-shadow">
          <h2 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-secondary" />
            Định danh cơ sở lưu trú
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Name — full width */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant" htmlFor="property-name">
                Tên cơ sở
              </label>
              <input
                id="property-name"
                type="text"
                value={data.propertyName}
                onChange={(e) => onChange({ propertyName: e.target.value })}
                placeholder="vd: Hanoi Heritage House"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline/70 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
            </div>

            {/* Property Type */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant" htmlFor="property-type">
                Loại hình lưu trú
              </label>
              <div className="relative">
                <select
                  id="property-type"
                  value={data.propertyType}
                  onChange={(e) =>
                    onChange({ propertyType: e.target.value as PartnerOnboardingData['propertyType'] })
                  }
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-4 pr-10 py-3 font-body-md text-body-md text-on-surface appearance-none focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    -- Chọn loại hình --
                  </option>
                  {PROPERTY_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
              </div>
            </div>

            {/* Star Rating */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                Hạng sao chính thức
              </label>
              <div className="flex items-center gap-2 h-[50px]">
                {[3, 4, 5].map((star) => {
                  const isActive = data.starRating === star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onChange({ starRating: star as 3 | 4 | 5 })}
                      className={`flex-1 h-full flex items-center justify-center border rounded-lg font-label-md text-label-md uppercase transition-all ${isActive
                          ? 'border-secondary bg-secondary-container/30 text-on-secondary-container shadow-sm'
                          : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-secondary/50'
                        }`}
                    >
                      {star} ★
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description — full width */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant" htmlFor="property-desc">
                Mô tả ngắn <span className="lowercase italic text-on-surface-variant/60">(tùy chọn, tối đa 500 ký tự)</span>
              </label>
              <textarea
                id="property-desc"
                rows={4}
                maxLength={500}
                value={data.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Câu chuyện về cơ sở của bạn — di sản, kiến trúc, trải nghiệm đặc trưng..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline/70 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all resize-none"
              />
              <span className="font-caption text-caption text-on-surface-variant/60 self-end">
                {data.description.length}/500
              </span>
            </div>
          </div>
        </section>

        {/* ── Card 2: Location ── */}
        <section className="bg-surface border border-outline-variant/40 rounded-xl p-6 md:p-8 limestone-shadow">
          <h2 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-secondary" />
            Vị trí trên bản đồ
          </h2>

          <div className="space-y-6">
            {/* Address autocomplete input */}
            <div className="flex flex-col gap-2" ref={dropdownRef}>
              <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant" htmlFor="address">
                Địa chỉ đầy đủ
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <input
                  id="address"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // Reset lat/lng nếu user gõ lại từ đầu — buộc phải chọn lại từ dropdown
                    if (data.latitude != null) {
                      onChange({ streetAddress: e.target.value, latitude: null, longitude: null });
                    } else {
                      onChange({ streetAddress: e.target.value });
                    }
                  }}
                  onFocus={() => results.length > 0 && setShowDropdown(true)}
                  placeholder="Bắt đầu gõ địa chỉ tại Việt Nam..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-11 pr-11 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline/70 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary animate-spin" />
                )}

                {/* Autocomplete dropdown */}
                {showDropdown && results.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-surface border border-outline-variant rounded-lg shadow-lg max-h-72 overflow-y-auto z-10">
                    {results.map((r) => (
                      <button
                        key={r.place_id}
                        type="button"
                        onClick={() => selectResult(r)}
                        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/20 last:border-b-0"
                      >
                        <MapPin className="h-4 w-4 mt-1 text-secondary flex-shrink-0" />
                        <span className="font-body-md text-body-md text-on-surface leading-snug">
                          {r.display_name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="font-caption text-caption text-on-surface-variant/70">
                Bạn cũng có thể kéo pin vàng trên bản đồ để chỉnh chính xác vị trí.
              </p>
            </div>

            {/* Leaflet Map */}
            <div className="w-full h-[360px] rounded-lg border border-outline-variant/50 overflow-hidden relative">
              <MapContainer
                center={center}
                zoom={data.latitude != null ? 15 : 12}
                scrollWheelZoom
                className="w-full h-full z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FlyToLocation lat={data.latitude} lng={data.longitude} />
                {data.latitude != null && data.longitude != null && (
                  <Marker
                    position={[data.latitude, data.longitude]}
                    icon={partnerPinIcon}
                    draggable
                    eventHandlers={{ dragend: handleDragEnd }}
                  />
                )}
              </MapContainer>

              {/* Empty state overlay khi chưa có vị trí */}
              {data.latitude == null && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="bg-surface/95 backdrop-blur-md border border-outline-variant rounded-lg px-5 py-3 flex items-center gap-2 shadow-md">
                    <MapPin className="h-4 w-4 text-secondary" />
                    <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                      Tìm địa chỉ phía trên để đặt pin
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Coordinate display khi đã có pin */}
            {data.latitude != null && data.longitude != null && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-caption text-on-surface-variant px-1">
                <span>
                  Vĩ độ: <strong className="text-primary">{data.latitude.toFixed(6)}</strong>
                </span>
                <span>
                  Kinh độ: <strong className="text-primary">{data.longitude.toFixed(6)}</strong>
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Action Footer */}
        <div className="pt-8 flex items-center justify-between border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onBack}
            className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant px-6 py-3 rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue}
            className="font-label-md text-label-md uppercase tracking-widest bg-secondary-container text-on-secondary-container px-8 py-3 rounded-lg shadow-sm hover:bg-secondary hover:text-on-secondary transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Tiếp theo: Hình ảnh
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyInfoStep;
