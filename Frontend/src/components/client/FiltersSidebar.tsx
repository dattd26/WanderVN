import React, { useState, useEffect } from 'react';
import { Map, Sliders, Check } from 'lucide-react';
import type { PropertyType } from '../../types';
import { propertyTypeService } from '../../services';

interface FiltersSidebarProps {
  onPriceChange?: (min: number, max: number) => void;
  onTypeChange?: (types: string[]) => void;
  onAmenityChange?: (amenities: string[]) => void;
}

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  onPriceChange,
  onTypeChange,
  onAmenityChange
}) => {
  const [maxPrice, setMaxPrice] = useState(8000000);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);

  // Tải động danh sách loại hình lưu trú từ API dịch vụ tập trung
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const data = await propertyTypeService.getPropertyTypes();
        setPropertyTypes(data);
      } catch (error) {
        console.warn('⚠️ Lỗi gọi API /api/v1/property-types:', error);
        setPropertyTypes([]);
      }
    };

    fetchPropertyTypes();
  }, []);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMaxPrice(value);
    if (onPriceChange) {
      onPriceChange(500000, value); // Giá tối thiểu là 500k VNĐ
    }
  };

  const toggleType = (typeCode: string) => {
    const next = selectedTypes.includes(typeCode)
      ? selectedTypes.filter((t) => t !== typeCode)
      : [...selectedTypes, typeCode];
    setSelectedTypes(next);
    if (onTypeChange) {
      onTypeChange(next);
    }
  };

  const toggleAmenity = (amenity: string) => {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(next);
    if (onAmenityChange) {
      onAmenityChange(next);
    }
  };

  const amenities = [
    'Bể bơi riêng',
    'Spa & Chăm sóc sức khỏe',
    'Hướng sông / Biển'
  ];

  return (
    <aside className="w-full lg:w-1/4 space-y-10">
      {/* Khối Bản đồ Thu nhỏ */}
      <div className="w-full h-48 bg-surface-container rounded-lg border border-outline-variant/30 overflow-hidden relative group cursor-pointer limestone-shadow">
        <img
          alt="Bản đồ khu vực"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-surface text-primary px-4 py-2 font-label-md text-label-md shadow-sm border border-outline/20 flex items-center gap-2 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
            <Map className="h-4 w-4" />
            Xem trên Bản đồ
          </span>
        </div>
      </div>

      {/* Bộ lọc khoảng giá */}
      <div className="border-b border-outline-variant/30 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Sliders className="h-5 w-5 text-secondary" />
          <h3 className="font-display-lg text-headline-md text-on-surface">
            Giá mỗi đêm
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between font-body-md text-body-md text-on-surface-variant mb-1">
            <span>500K đ</span>
            <span className="font-semibold text-primary">{(maxPrice / 1000000).toFixed(1)}M đ+</span>
          </div>
          <input
            type="range"
            min="500000"
            max="10000000"
            step="500000"
            value={maxPrice}
            onChange={handlePriceChange}
            className="w-full accent-secondary cursor-pointer h-1 bg-surface-variant rounded-lg"
          />
        </div>
      </div>

      {/* Bộ lọc loại hình lưu trú */}
      <div className="border-b border-outline-variant/30 pb-8">
        <h3 className="font-display-lg text-headline-md text-on-surface mb-6">
          Loại hình lưu trú
        </h3>
        <div className="space-y-3.5">
          {propertyTypes.map((type) => {
            const isChecked = selectedTypes.includes(type.code);
            return (
              <label
                key={type.code}
                className="flex items-center gap-3 cursor-pointer group select-none"
                onClick={() => toggleType(type.code)}
              >
                <div
                  className={`w-5 h-5 border rounded flex items-center justify-center transition-all duration-300 ${isChecked
                      ? 'border-secondary bg-secondary text-on-primary'
                      : 'border-outline group-hover:border-secondary'
                    }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                </div>
                <span className="font-body-md text-body-md text-on-surface transition-colors duration-200 group-hover:text-secondary">
                  {type.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Bộ lọc tiện ích */}
      <div className="pb-8">
        <h3 className="font-display-lg text-headline-md text-on-surface mb-6">
          Tiện ích chọn lọc
        </h3>
        <div className="space-y-3.5">
          {amenities.map((amenity) => {
            const isChecked = selectedAmenities.includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center gap-3 cursor-pointer group select-none"
                onClick={() => toggleAmenity(amenity)}
              >
                <div
                  className={`w-5 h-5 border rounded flex items-center justify-center transition-all duration-300 ${isChecked
                      ? 'border-secondary bg-secondary text-on-primary'
                      : 'border-outline group-hover:border-secondary'
                    }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                </div>
                <span className="font-body-md text-body-md text-on-surface transition-colors duration-200 group-hover:text-secondary">
                  {amenity}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
export default FiltersSidebar;
