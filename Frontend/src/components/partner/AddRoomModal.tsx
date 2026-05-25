import React, { useState } from 'react';
import { Bed } from 'lucide-react';
import { partnerService } from '../../services';

// Định nghĩa cấu hình Props đầu vào cho AddRoomModal
interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: number;
  onSuccess: (newRoom: {
    id: string;
    name: string;
    bedType: string;
    size: number;
    maxGuests: number;
    quantity: number;
    price: number;
  }) => void;
  triggerMessage: (type: 'success' | 'error', content: string) => void;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  hotelId,
  onSuccess,
  triggerMessage
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [newRoomForm, setNewRoomForm] = useState({
    name: '',
    bedType: '1 King Bed',
    size: 32,
    maxGuests: 2,
    quantity: 5,
    price: 1500000,
    description: ''
  });

  if (!isOpen) return null;

  // Xử lý nộp biểu mẫu thêm hạng phòng lên Backend qua API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId) {
      triggerMessage('error', 'Không tìm thấy cơ sở lưu trú để thêm phòng.');
      return;
    }

    setSubmitting(true);
    try {
      // Gọi API Backend thực tế để ghi nhận hạng phòng
      const result = await partnerService.addRoomType(hotelId, {
        name: newRoomForm.name.trim(),
        basePrice: newRoomForm.price,
        capacity: newRoomForm.maxGuests,
        totalRooms: newRoomForm.quantity,
        description: newRoomForm.description.trim() || `Hạng phòng cao cấp ${newRoomForm.name}`
      });

      // Tạo cấu trúc dữ liệu hạng phòng đồng bộ phía client
      const newRoom = {
        id: result.roomTypeId.toString(),
        name: newRoomForm.name.trim(),
        bedType: newRoomForm.bedType,
        size: newRoomForm.size,
        maxGuests: newRoomForm.maxGuests,
        quantity: newRoomForm.quantity,
        price: newRoomForm.price
      };

      triggerMessage('success', `Đã thêm hạng phòng "${newRoom.name}" thành công vào hệ thống CSDL!`);
      onSuccess(newRoom);
      onClose();

      // Khôi phục biểu mẫu về trạng thái ban đầu
      setNewRoomForm({
        name: '',
        bedType: '1 King Bed',
        size: 32,
        maxGuests: 2,
        quantity: 5,
        price: 1500000,
        description: ''
      });
    } catch (err: unknown) {
      console.error('⚠️ Lỗi thêm hạng phòng:', err);
      const errMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.';
      triggerMessage('error', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1C1C19]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Tăng kích cỡ modal lên max-w-xl để văn bản tiếng Việt thoáng đãng, sắc nét */}
      <div className="bg-[#FAF6F0] rounded-2xl border border-[#E6E2DD] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* Tiêu đề Modal */}
        <div className="px-7 py-6 border-b border-[#E6E2DD] bg-[#FAF6F0] flex justify-between items-center">
          <h3 className="font-display-lg text-lg font-bold text-[#1C1C19] flex items-center gap-2.5">
            <Bed className="h-6 w-6 text-[#735C00]" />
            Thêm hạng phòng di sản mới
          </h3>
          <button
            onClick={onClose}
            className="text-[#444748] hover:text-[#1C1C19] text-2xl font-bold transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Biểu mẫu biểu thức dữ liệu */}
        <form onSubmit={handleSubmit} className="p-7 space-y-5">

          <div className="space-y-2">
            <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Tên hạng phòng *</label>
            <input
              type="text"
              required
              disabled={submitting}
              placeholder="Ví dụ: Executive River View Suite"
              value={newRoomForm.name}
              onChange={e => setNewRoomForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4.5">
            <div className="space-y-2">
              <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Loại giường *</label>
              <select
                disabled={submitting}
                value={newRoomForm.bedType}
                onChange={e => setNewRoomForm(prev => ({ ...prev, bedType: e.target.value }))}
                className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors appearance-none"
              >
                <option>1 King Bed</option>
                <option>1 Super King Bed</option>
                <option>2 Double Beds</option>
                <option>1 Queen Bed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Diện tích (m²) *</label>
              <input
                type="number"
                required
                disabled={submitting}
                min={15}
                value={newRoomForm.size}
                onChange={e => setNewRoomForm(prev => ({ ...prev, size: parseInt(e.target.value) || 30 }))}
                className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Số khách tối đa *</label>
              <input
                type="number"
                required
                disabled={submitting}
                min={1}
                max={6}
                value={newRoomForm.maxGuests}
                onChange={e => setNewRoomForm(prev => ({ ...prev, maxGuests: parseInt(e.target.value) || 2 }))}
                className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Số lượng phòng *</label>
              <input
                type="number"
                required
                disabled={submitting}
                min={1}
                value={newRoomForm.quantity}
                onChange={e => setNewRoomForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 5 }))}
                className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Giá phòng mỗi đêm (₫) *</label>
            <input
              type="number"
              required
              disabled={submitting}
              min={100000}
              value={newRoomForm.price}
              onChange={e => setNewRoomForm(prev => ({ ...prev, price: parseInt(e.target.value) || 1000000 }))}
              className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none font-mono tracking-wider transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Mô tả đặc điểm hạng phòng</label>
            <textarea
              rows={2}
              disabled={submitting}
              placeholder="Ví dụ: View hướng sông Thu Bồn thơ mộng, ban công thoáng rộng, set up trà hoa di sản mỗi chiều..."
              value={newRoomForm.description}
              onChange={e => setNewRoomForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Các nút hành động ở chân modal */}
          <div className="pt-5 border-t border-[#E6E2DD] flex justify-end gap-3.5">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-5 py-2.5 border border-[#E6E2DD] text-xs font-label-md uppercase tracking-wider text-[#444748] hover:bg-[#F1EDE8] rounded-xl transition-all disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#1C1C19] hover:bg-[#735C00] text-[#FAF6F0] text-xs font-label-md uppercase tracking-wider rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:scale-[1.01]"
            >
              {submitting && (
                <div className="w-3.5 h-3.5 border-2 border-[#FAF6F0] border-t-transparent rounded-full animate-spin"></div>
              )}
              {submitting ? 'Đang gửi...' : 'Xác nhận thêm'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
