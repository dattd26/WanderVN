import React, { useEffect } from 'react';
import { X, Map as MapIcon } from 'lucide-react';
import { HotelMap } from './HotelMap';
import type { SearchHotelsDto } from '../../types';

interface HotelMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  center: [number, number] | null;
  hotels: SearchHotelsDto[];
  locationName?: string;
}

export const HotelMapModal: React.FC<HotelMapModalProps> = ({
  isOpen,
  onClose,
  center,
  hotels,
  locationName
}) => {
  // Khoá scroll body khi modal mở + đóng modal khi nhấn ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const markersCount = hotels.filter(
    (h) => typeof h.latitude === 'number' && typeof h.longitude === 'number'
  ).length;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-primary/70 backdrop-blur-sm p-4 md:p-8 animate-fade-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Bản đồ khách sạn"
    >
      <div
        className="relative w-full h-full max-w-container-max bg-surface rounded-lg overflow-hidden flex flex-col limestone-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/40 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <MapIcon className="h-5 w-5 text-secondary" />
            <div>
              <h2 className="font-display-lg text-headline-md text-primary">
                Bản đồ khu vực {locationName ? `– ${locationName}` : ''}
              </h2>
              <p className="font-caption text-caption text-on-surface-variant">
                {markersCount} / {hotels.length} khách sạn hiển thị trên bản đồ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-primary hover:bg-surface-container transition-colors"
            aria-label="Đóng bản đồ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map body */}
        <div className="flex-1 relative">
          {center ? (
            <div className="absolute inset-0">
              <HotelMap center={center} hotels={hotels} />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-container-low">
              <MapIcon className="h-10 w-10 text-outline animate-pulse" />
              <p className="font-body-md text-body-md text-on-surface-variant italic">
                Đang tải bản đồ khu vực...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelMapModal;
