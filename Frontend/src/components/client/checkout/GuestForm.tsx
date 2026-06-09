import React from 'react';
import { CheckCircle } from 'lucide-react';

interface GuestFormState {
  title: string;
  fullName: string;
  nationality: string;
  passportNumber: string;
}

interface GuestFormProps {
  isSelfGuest: boolean;
  onSelfGuestChange: (checked: boolean) => void;
  guestForm: GuestFormState;
  onChange: (field: keyof GuestFormState, value: string) => void;
  nationalities: string[];
}

export const GuestForm: React.FC<GuestFormProps> = ({
  isSelfGuest,
  onSelfGuestChange,
  guestForm,
  onChange,
  nationalities,
}) => {
  return (
    <section className="border border-outline-variant/30 rounded-lg bg-surface-container-lowest overflow-hidden">
      <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center gap-4">
        <span className="text-sm font-semibold text-outline tabular-nums">02</span>
        <h2 className="text-base font-semibold text-primary tracking-tight">
          Thông Tin Khách Lưu Trú
        </h2>
      </div>
      <div className="p-6 space-y-5">
        {/* Checkbox: Tôi là khách lưu trú chính */}
        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <div className="relative">
            <input
              type="checkbox"
              checked={isSelfGuest}
              onChange={(e) => onSelfGuestChange(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border border-outline-variant rounded bg-transparent peer-checked:bg-primary peer-checked:border-primary transition-colors" />
            <CheckCircle className="absolute inset-0 m-auto h-3 w-3 text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <span className="text-sm text-on-surface font-medium group-hover:text-primary transition-colors">
            Tôi là khách lưu trú chính
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
              Danh xưng
            </label>
            <select
              value={guestForm.title}
              onChange={(e) => onChange('title', e.target.value)}
              className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors cursor-pointer"
            >
              <option value="mr">Ông (Mr.)</option>
              <option value="ms">Bà (Ms.)</option>
              <option value="mrs">Cô/Chị (Mrs.)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
              Họ và Tên khách (không dấu)
            </label>
            <input
              type="text"
              required
              value={guestForm.fullName}
              onChange={(e) => onChange('fullName', e.target.value.toUpperCase())}
              placeholder="VD: NGUYEN VAN A"
              className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm uppercase text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
              Quốc tịch
            </label>
            <select
              value={guestForm.nationality}
              onChange={(e) => onChange('nationality', e.target.value)}
              className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors cursor-pointer"
            >
              {nationalities.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
              Số Hộ Chiếu / CCCD
            </label>
            <input
              type="text"
              required
              value={guestForm.passportNumber}
              onChange={(e) => onChange('passportNumber', e.target.value.toUpperCase())}
              placeholder="VD: 036200012345"
              className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm uppercase font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
