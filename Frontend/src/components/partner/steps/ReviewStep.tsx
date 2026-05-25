import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  ImageIcon,
  BedDouble,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Send,
  Loader2,
} from 'lucide-react';
import type { PartnerOnboardingData } from '../../../types';
import { PROPERTY_CATEGORIES } from '../../../types';

interface ReviewStepProps {
  data: PartnerOnboardingData;
  onBack: () => void;
  onJumpTo: (stepIndex: number) => void;
  /** Index gốc của các step trong stepper — để jump-to khi bấm Edit */
  stepIndices: {
    propertyInfo: number;
    photos: number;
    pricing: number;
  };
}

const formatVnd = (v: number) => v.toLocaleString('vi-VN') + ' đ';

const POLICY_LABEL: Record<NonNullable<PartnerOnboardingData['cancellationPolicy']>, string> = {
  flexible: 'Linh hoạt',
  moderate: 'Vừa phải',
  strict: 'Chặt chẽ',
  '': '—',
};

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onBack, onJumpTo, stepIndices }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const propertyTypeLabel =
    PROPERTY_CATEGORIES.find((c) => c.value === data.propertyType)?.label || '—';

  // Giả lập submit cho tới khi backend partner sẵn sàng
  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center max-w-2xl mx-auto py-16 animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-secondary-container/40 text-secondary mx-auto mb-6 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-primary mb-4 leading-tight">
          Hồ sơ partner đã được gửi đi.
        </h1>
        <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant mb-8 leading-relaxed">
          Đội ngũ kiểm duyệt WanderVN sẽ rà soát thông tin trong vòng 24–48 giờ và liên hệ qua email khi cơ sở của bạn được kích hoạt trên hệ thống.
        </p>
        <p className="font-caption text-caption text-on-surface-variant/70 italic">
          (Đang ở chế độ giả lập — backend partner sẽ được tích hợp ở giai đoạn kế tiếp.)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-primary mb-3 leading-tight">
          Xem lại trước khi gửi đi.
        </h1>
        <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant leading-relaxed">
          Kiểm tra lần cuối toàn bộ thông tin cơ sở. Bạn có thể quay lại chỉnh sửa từng phần bằng nút "Sửa" ở mỗi mục.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-6">
        {/* Property Info */}
        <SummaryCard
          icon={Building2}
          title="Định danh cơ sở"
          onEdit={() => onJumpTo(stepIndices.propertyInfo)}
        >
          <SummaryRow label="Tên cơ sở" value={data.propertyName || '—'} />
          <SummaryRow label="Loại hình" value={propertyTypeLabel} />
          <SummaryRow label="Hạng sao" value={data.starRating ? `${data.starRating} ★` : '—'} />
          {data.description && <SummaryRow label="Mô tả" value={data.description} />}
        </SummaryCard>

        {/* Location */}
        <SummaryCard
          icon={MapPin}
          title="Vị trí"
          onEdit={() => onJumpTo(stepIndices.propertyInfo)}
        >
          <SummaryRow label="Địa chỉ" value={data.streetAddress || '—'} />
          {data.latitude != null && data.longitude != null && (
            <SummaryRow
              label="Tọa độ"
              value={`${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`}
            />
          )}
        </SummaryCard>

        {/* Photos */}
        <SummaryCard
          icon={ImageIcon}
          title={`Hình ảnh (${data.photos.length})`}
          onEdit={() => onJumpTo(stepIndices.photos)}
        >
          {data.photos.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant italic">
              Chưa có ảnh nào.
            </p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {data.photos.slice(0, 6).map((photo, idx) => (
                <div
                  key={photo.id}
                  className={`relative aspect-square rounded overflow-hidden border ${
                    idx === 0 ? 'border-secondary' : 'border-outline-variant/40'
                  }`}
                >
                  <img
                    src={photo.previewUrl}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-secondary text-on-secondary px-1.5 py-0.5 rounded font-label-md text-[9px] uppercase tracking-wider">
                      Đại diện
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </SummaryCard>

        {/* Pricing */}
        <SummaryCard
          icon={BedDouble}
          title={`Loại phòng (${data.roomTypes.length})`}
          onEdit={() => onJumpTo(stepIndices.pricing)}
        >
          {data.roomTypes.length === 0 ? (
            <p className="font-body-md text-body-md text-on-surface-variant italic">
              Chưa khai báo loại phòng.
            </p>
          ) : (
            <div className="divide-y divide-outline-variant/30 -my-3">
              {data.roomTypes.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-headline-md text-body-lg text-primary truncate">{r.name}</div>
                    <div className="font-caption text-caption text-on-surface-variant">
                      {r.capacity} khách · {r.quantity} phòng
                    </div>
                  </div>
                  <div className="font-label-md text-label-md uppercase tracking-wider text-secondary whitespace-nowrap">
                    từ {formatVnd(r.pricePerNight)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SummaryCard>

        {/* Policy */}
        <SummaryCard
          icon={ShieldCheck}
          title="Chính sách hủy phòng"
          onEdit={() => onJumpTo(stepIndices.pricing)}
        >
          <SummaryRow
            label="Loại chính sách"
            value={POLICY_LABEL[data.cancellationPolicy || ''] as string}
          />
        </SummaryCard>
      </div>

      {/* Action Footer */}
      <div className="pt-8 flex items-center justify-between border-t border-outline-variant/30">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant px-6 py-3 rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2 disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="font-label-md text-label-md uppercase tracking-widest bg-primary text-on-primary px-10 py-3 rounded-lg shadow-md hover:bg-secondary hover:text-on-secondary transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Gửi để duyệt
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Helpers ──

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, title, onEdit, children }) => (
  <section className="bg-surface border border-outline-variant/40 rounded-xl p-6 md:p-7 limestone-shadow">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
        <Icon className="h-5 w-5 text-secondary" />
        {title}
      </h3>
      <button
        type="button"
        onClick={onEdit}
        className="font-label-md text-label-md uppercase tracking-wider text-secondary hover:text-primary flex items-center gap-1.5 transition-colors"
      >
        <Edit3 className="h-3.5 w-3.5" />
        Sửa
      </button>
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-3">
    <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant col-span-1">
      {label}
    </span>
    <span className="font-body-md text-body-md text-primary col-span-2 break-words">{value}</span>
  </div>
);

export default ReviewStep;
