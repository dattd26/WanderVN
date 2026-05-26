import React from 'react';
import { Info, Image as ImageIcon, Sparkles, Plus, Trash2, Check, Save } from 'lucide-react';

// Định nghĩa Interface đại diện cho trạng thái biểu mẫu chỉnh sửa thông tin khách sạn
export interface HotelFormState {
  name: string;
  type: string;
  address: string;
  description: string;
  amenities: string[];
  images: string[];
}

// Định nghĩa Props cho Component InfoTab đảm bảo kiểm tra kiểu dữ liệu nghiêm ngặt
interface InfoTabProps {
  hotelForm: HotelFormState;
  onChangeForm: React.Dispatch<React.SetStateAction<HotelFormState>>;
  onSaveChanges: () => void;
  onCancelChanges: () => void;
  onSimulateUpload: () => void;
  onDeleteImage: (imgUrl: string) => void;
  onToggleAmenity: (amenityId: string) => void;
  availableAmenities: Array<{ id: string; label: string }>;
}

export const InfoTab: React.FC<InfoTabProps> = ({
  hotelForm,
  onChangeForm,
  onSaveChanges,
  onCancelChanges,
  onSimulateUpload,
  onDeleteImage,
  onToggleAmenity,
  availableAmenities
}) => {
  return (
    <div className="space-y-6">

      {/* Phần: Thông tin khách sạn cơ bản */}
      <section className="space-y-5">
        <h4 className="font-display-lg text-md text-[#1C1C19] border-b border-[#E6E2DD]/60 pb-2 flex items-center gap-2 font-bold">
          <Info className="h-4.5 w-4.5 text-[#735C00]" />
          Thông tin khách sạn
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Tên cơ sở lưu trú</label>
            <input
              type="text"
              value={hotelForm.name}
              onChange={(e) => onChangeForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 font-body-md text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Loại hình</label>
            <select
              value={hotelForm.type}
              onChange={(e) => onChangeForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 font-body-md text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all appearance-none"
            >
              <option>Khách sạn</option>
              <option>Resort</option>
              <option>Homestay</option>
              <option>Biệt thự</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-1.5">
            <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Địa chỉ</label>
            <input
              type="text"
              value={hotelForm.address}
              onChange={(e) => onChangeForm(prev => ({ ...prev, address: e.target.value }))}
              className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 font-body-md text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all"
            />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-1.5">
            <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Mô tả chi tiết di sản</label>
            <textarea
              rows={4}
              value={hotelForm.description}
              onChange={(e) => onChangeForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 font-body-md text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all resize-none"
            />
          </div>
        </div>
      </section>

      {/* Phần: Hình ảnh di sản */}
      <section className="space-y-4">
        <h4 className="font-display-lg text-md text-[#1C1C19] border-b border-[#E6E2DD]/60 pb-2 flex items-center gap-2 font-bold">
          <ImageIcon className="h-4.5 w-4.5 text-[#735C00]" />
          Hình ảnh di sản
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          {/* Hộp bấm tải ảnh giả lập */}
          <div
            onClick={onSimulateUpload}
            className="aspect-video sm:aspect-square rounded-lg border-2 border-dashed border-[#E6E2DD] hover:border-[#735C00]/50 hover:bg-[#F1EDE8] flex flex-col items-center justify-center cursor-pointer transition-colors group p-3 text-center"
          >
            <Plus className="h-6 w-6 text-[#444748] group-hover:text-[#735C00] mb-1.5" />
            <span className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] group-hover:text-[#735C00]">Tải ảnh lên</span>
          </div>

          {/* Hiển thị danh sách hình ảnh */}
          {hotelForm.images.map((imgUrl, i) => (
            <div key={i} className="aspect-video sm:aspect-square rounded-lg overflow-hidden relative group border border-[#E6E2DD]">
              <img src={imgUrl} alt={`Hotel visual index ${i}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <button
                  onClick={() => onDeleteImage(imgUrl)}
                  className="text-red-500 bg-[#FAF6F0] hover:bg-red-50 rounded-full p-2.5 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* Phần: Tiện ích & Trải nghiệm nổi bật */}
      <section className="space-y-4">
        <h4 className="font-display-lg text-md text-[#1C1C19] border-b border-[#E6E2DD]/60 pb-2 flex items-center gap-2 font-bold">
          <Sparkles className="h-4.5 w-4.5 text-[#735C00]" />
          Tiện ích &amp; Trải nghiệm nổi bật
        </h4>

        <div className="flex flex-wrap gap-2.5">
          {availableAmenities.map(a => {
            const isChecked = hotelForm.amenities.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() => onToggleAmenity(a.id)}
                className={`px-4 py-2 rounded-full border text-xs transition-all duration-300 flex items-center gap-2 ${isChecked
                    ? 'bg-[#735C00]/10 border-[#735C00] text-[#735C00] font-bold shadow-sm'
                    : 'border-[#E6E2DD] text-[#444748] hover:border-[#735C00]/50 hover:bg-[#F1EDE8]'
                  }`}
              >
                {isChecked && <Check className="h-3.5 w-3.5 text-[#735C00]" />}
                {a.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Nút lưu thay đổi / hủy bỏ */}
      <div className="border-t border-[#E6E2DD]/60 pt-6 flex justify-end gap-3">
        <button
          onClick={onCancelChanges}
          className="px-5 py-2.5 rounded-lg font-label-md text-[11px] uppercase tracking-wider text-[#444748] border border-[#E6E2DD] hover:bg-[#F1EDE8] transition-colors"
        >
          Hủy chỉnh sửa
        </button>
        <button
          onClick={onSaveChanges}
          className="px-5 py-2.5 bg-[#1C1C19] text-[#FAF6F0] rounded-lg font-label-md text-[11px] uppercase tracking-wider hover:bg-[#735C00] transition-colors flex items-center gap-1.5 font-bold"
        >
          <Save className="h-4 w-4 text-[#B59A5A]" />
          Lưu thay đổi
        </button>
      </div>

    </div>
  );
};
