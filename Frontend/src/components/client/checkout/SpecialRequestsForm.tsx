import React from 'react';
import { CheckCircle, Info, StickyNote } from 'lucide-react';

interface SpecialRequestOption {
  id: string;
  label: string;
}

interface SpecialRequestsFormProps {
  specialRequests: string[];
  onToggleRequest: (id: string) => void;
  expectedCheckinTime: string;
  onExpectedCheckinTimeChange: (time: string) => void;
  additionalNote: string;
  onAdditionalNoteChange: (note: string) => void;
  specialRequestOptions: SpecialRequestOption[];
  checkinTimeOptions: string[];
}

export const SpecialRequestsForm: React.FC<SpecialRequestsFormProps> = ({
  specialRequests,
  onToggleRequest,
  expectedCheckinTime,
  onExpectedCheckinTimeChange,
  additionalNote,
  onAdditionalNoteChange,
  specialRequestOptions,
  checkinTimeOptions,
}) => {
  return (
    <section className="border border-outline-variant/30 rounded-lg bg-surface-container-lowest overflow-hidden">
      <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center gap-4">
        <span className="text-sm font-semibold text-outline tabular-nums">03</span>
        <h2 className="text-base font-semibold text-primary tracking-tight">
          Yêu Cầu Đặc Biệt
        </h2>
        <span className="ml-auto text-[10px] text-on-surface-variant italic">Tùy chọn</span>
      </div>
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {specialRequestOptions.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={specialRequests.includes(opt.id)}
                  onChange={() => onToggleRequest(opt.id)}
                  className="peer sr-only"
                />
                <div className="w-4 h-4 border border-outline-variant rounded bg-transparent peer-checked:bg-primary peer-checked:border-primary transition-colors" />
                <CheckCircle className="absolute inset-0 m-auto h-2.5 w-2.5 text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-outline font-semibold">
              Dự kiến giờ nhận phòng
            </label>
            <select
              value={expectedCheckinTime}
              onChange={(e) => onExpectedCheckinTimeChange(e.target.value)}
              className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface focus:outline-none focus:border-b-primary transition-colors cursor-pointer"
            >
              {checkinTimeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-outline font-semibold flex items-center gap-1.5">
              <StickyNote className="h-3 w-3" />
              Ghi chú thêm
            </label>
            <input
              type="text"
              value={additionalNote}
              onChange={(e) => onAdditionalNoteChange(e.target.value)}
              placeholder="Yêu cầu khác của bạn..."
              className="bg-transparent border-0 border-b border-outline-variant py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-b-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200/60 rounded-lg">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Các yêu cầu đặc biệt không được đảm bảo và phụ thuộc vào tình trạng thực tế của
            khách sạn khi nhận phòng. Vui lòng liên hệ trực tiếp khách sạn để xác nhận.
          </p>
        </div>
      </div>
    </section>
  );
};
