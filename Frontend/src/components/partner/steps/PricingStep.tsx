import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  BedDouble,
  Users as UsersIcon,
  DollarSign,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import type { PartnerOnboardingData, PartnerRoomType } from '../../../types';

interface PricingStepProps {
  data: PartnerOnboardingData;
  onChange: (patch: Partial<PartnerOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const POLICY_OPTIONS: { value: PartnerOnboardingData['cancellationPolicy']; label: string; description: string }[] = [
  {
    value: 'flexible',
    label: 'Linh hoạt',
    description: 'Hoàn 100% nếu hủy trước 24 giờ check-in. Thu hút khách hàng nhạy cảm với rủi ro.',
  },
  {
    value: 'moderate',
    label: 'Vừa phải',
    description: 'Hoàn 100% nếu hủy trước 5 ngày, hoàn 50% trong 5–1 ngày. Cân bằng.',
  },
  {
    value: 'strict',
    label: 'Chặt chẽ',
    description: 'Hoàn 50% nếu hủy trước 7 ngày, không hoàn sau đó. Phù hợp cao điểm/lễ tết.',
  },
];

const newRoomType = (): PartnerRoomType => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  capacity: 2,
  pricePerNight: 1500000,
  quantity: 1,
});

const formatVnd = (v: number) => v.toLocaleString('vi-VN');

export const PricingStep: React.FC<PricingStepProps> = ({ data, onChange, onNext, onBack }) => {
  const roomTypes = data.roomTypes;

  const updateRoom = (id: string, patch: Partial<PartnerRoomType>) => {
    onChange({
      roomTypes: roomTypes.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  };

  const addRoom = () => {
    onChange({ roomTypes: [...roomTypes, newRoomType()] });
  };

  const removeRoom = (id: string) => {
    onChange({ roomTypes: roomTypes.filter((r) => r.id !== id) });
  };

  const canContinue =
    roomTypes.length >= 1 &&
    roomTypes.every(
      (r) =>
        r.name.trim().length >= 2 &&
        r.capacity >= 1 &&
        r.pricePerNight > 0 &&
        r.quantity >= 1,
    ) &&
    data.cancellationPolicy !== '';

  return (
    <div className="space-y-12">
      <div className="max-w-2xl">
        <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-primary mb-3 leading-tight">
          Định giá và chính sách lưu trú.
        </h1>
        <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant leading-relaxed">
          Khai báo các loại phòng cùng mức giá khởi điểm. Bạn có thể điều chỉnh chi tiết theo mùa cao điểm sau khi onboarding hoàn tất.
        </p>
      </div>

      {/* Room Types */}
      <section className="bg-surface border border-outline-variant/40 rounded-xl p-6 md:p-8 limestone-shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-secondary" />
            Loại phòng &amp; giá khởi điểm
          </h2>
          <button
            type="button"
            onClick={addRoom}
            className="font-label-md text-label-md uppercase tracking-wider text-secondary hover:text-primary flex items-center gap-1.5 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm loại phòng
          </button>
        </div>

        {roomTypes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-outline-variant rounded-lg">
            <BedDouble className="h-10 w-10 text-on-surface-variant/40 mx-auto mb-3" />
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Chưa có loại phòng nào. Hãy thêm ít nhất một loại phòng để tiếp tục.
            </p>
            <button
              type="button"
              onClick={addRoom}
              className="font-label-md text-label-md uppercase tracking-wider bg-secondary-container text-on-secondary-container px-5 py-2.5 rounded-lg hover:bg-secondary hover:text-on-secondary transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm loại phòng đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {roomTypes.map((room, idx) => (
              <div
                key={room.id}
                className="border border-outline-variant/40 rounded-lg p-5 bg-surface-container-low/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    Loại phòng #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRoom(room.id)}
                    title="Xóa loại phòng"
                    className="text-error hover:text-error/80 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Room Name */}
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                      Tên loại phòng
                    </label>
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                      placeholder="vd: Deluxe View Phố Cổ"
                      className="bg-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-outline/70 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                    />
                  </div>

                  {/* Capacity */}
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                      <UsersIcon className="h-3.5 w-3.5" />
                      Sức chứa
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={room.capacity}
                      onChange={(e) =>
                        updateRoom(room.id, { capacity: Math.max(1, parseInt(e.target.value, 10) || 1) })
                      }
                      className="bg-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      Số phòng có sẵn
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={room.quantity}
                      onChange={(e) =>
                        updateRoom(room.id, { quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })
                      }
                      className="bg-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                    />
                  </div>

                  {/* Price */}
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      Giá / đêm (VND)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={100000}
                        value={room.pricePerNight}
                        onChange={(e) =>
                          updateRoom(room.id, { pricePerNight: Math.max(0, parseInt(e.target.value, 10) || 0) })
                        }
                        className="w-full bg-surface border border-outline-variant rounded-lg pl-4 pr-24 py-2.5 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-md text-label-md text-on-surface-variant pointer-events-none">
                        {formatVnd(room.pricePerNight)} đ
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                      Mô tả ngắn <span className="lowercase italic text-on-surface-variant/60">(tùy chọn)</span>
                    </label>
                    <input
                      type="text"
                      value={room.description}
                      onChange={(e) => updateRoom(room.id, { description: e.target.value })}
                      placeholder="vd: Ban công nhìn xuống phố cổ, bồn tắm nằm, 35m²"
                      className="bg-surface border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-outline/70 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cancellation Policy */}
      <section className="bg-surface border border-outline-variant/40 rounded-xl p-6 md:p-8 limestone-shadow">
        <h2 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-secondary" />
          Chính sách hủy phòng
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {POLICY_OPTIONS.map((opt) => {
            const isActive = data.cancellationPolicy === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ cancellationPolicy: opt.value })}
                className={`text-left p-5 rounded-lg border transition-all ${
                  isActive
                    ? 'border-secondary bg-secondary-container/20 shadow-sm'
                    : 'border-outline-variant bg-surface-container-low hover:border-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      isActive ? 'border-secondary bg-secondary' : 'border-outline-variant'
                    }`}
                  />
                  <span className="font-headline-md text-body-lg text-primary">{opt.label}</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {opt.description}
                </p>
              </button>
            );
          })}
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
          Tiếp theo: Xem lại
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PricingStep;
