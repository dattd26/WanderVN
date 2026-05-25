import React, { useRef } from 'react';
import { ImagePlus, X, ArrowRight, ArrowLeft, Star, GripVertical } from 'lucide-react';
import type { PartnerOnboardingData, PartnerPhoto } from '../../../types';

interface PhotosStepProps {
  data: PartnerOnboardingData;
  onChange: (patch: Partial<PartnerOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const MAX_PHOTOS = 12;
const MIN_PHOTOS = 3;

/**
 * Step 3 — Photos: kéo thả nhiều ảnh, preview thumbnail, gắn caption.
 * Ảnh đầu tiên được đánh dấu là ảnh đại diện. Lưu hoàn toàn ở client (Object URL)
 * cho tới khi backend upload sẵn sàng.
 */
export const PhotosStep: React.FC<PhotosStepProps> = ({ data, onChange, onNext, onBack }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const photos = data.photos;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_PHOTOS - photos.length;
    const accepted = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, remaining);

    const newPhotos: PartnerPhoto[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    onChange({ photos: [...photos, ...newPhotos] });
  };

  const removePhoto = (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange({ photos: photos.filter((p) => p.id !== id) });
  };

  const movePhotoToFront = (id: string) => {
    const idx = photos.findIndex((p) => p.id === id);
    if (idx <= 0) return;
    const reordered = [photos[idx], ...photos.filter((p) => p.id !== id)];
    onChange({ photos: reordered });
  };

  const canContinue = photos.length >= MIN_PHOTOS;

  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-primary mb-3 leading-tight">
          Khoác lên cơ sở một bộ hình ảnh ấn tượng.
        </h1>
        <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant leading-relaxed">
          Tải lên tối thiểu {MIN_PHOTOS}, tối đa {MAX_PHOTOS} ảnh chất lượng cao. Ảnh đầu tiên sẽ được sử dụng làm ảnh đại diện trên trang tìm kiếm.
        </p>
      </div>

      {/* Upload zone */}
      <section className="bg-surface border border-outline-variant/40 rounded-xl p-6 md:p-8 limestone-shadow">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={photos.length >= MAX_PHOTOS}
          className="w-full border-2 border-dashed border-outline-variant rounded-xl px-6 py-12 flex flex-col items-center gap-3 hover:border-secondary hover:bg-secondary-container/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div className="w-14 h-14 rounded-full bg-secondary-container/40 text-on-secondary-container flex items-center justify-center">
            <ImagePlus className="h-6 w-6" />
          </div>
          <span className="font-headline-md text-headline-md text-primary">
            Bấm để tải ảnh lên
          </span>
          <span className="font-body-md text-body-md text-on-surface-variant">
            Định dạng JPG / PNG / WebP, tối đa 10MB mỗi ảnh
          </span>
          <span className="font-caption text-caption text-on-surface-variant/70 mt-1">
            {photos.length}/{MAX_PHOTOS} ảnh đã tải
          </span>
        </button>

        {/* Grid preview */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {photos.map((photo, idx) => {
              const isCover = idx === 0;
              return (
                <div
                  key={photo.id}
                  className={`relative group rounded-lg overflow-hidden border ${
                    isCover ? 'border-secondary shadow-md' : 'border-outline-variant/40'
                  }`}
                >
                  <img
                    src={photo.previewUrl}
                    alt={`Property photo ${idx + 1}`}
                    className="w-full aspect-[4/3] object-cover"
                  />

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => movePhotoToFront(photo.id)}
                        title="Đặt làm ảnh đại diện"
                        className="w-9 h-9 bg-surface rounded-full flex items-center justify-center text-secondary hover:bg-secondary hover:text-on-secondary transition-colors"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      title="Xóa ảnh"
                      className="w-9 h-9 bg-surface rounded-full flex items-center justify-center text-error hover:bg-error hover:text-on-error transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Cover badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 bg-secondary text-on-secondary px-2 py-1 rounded font-label-md text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Star className="h-3 w-3 fill-current" />
                      Ảnh đại diện
                    </div>
                  )}

                  {/* Drag handle (visual only — full DnD reorder để dành cho phase sau) */}
                  <div className="absolute top-2 right-2 bg-surface/80 backdrop-blur-sm p-1 rounded text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
          Tiếp theo: Giá phòng
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PhotosStep;
