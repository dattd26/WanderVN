import React, { useState, useRef } from 'react';
import { Bed, UploadCloud, X, Plus, Image as ImageIcon } from 'lucide-react';
import { partnerService } from '../../services';
import { type RoomConfig } from './tabs/RoomsTab';

// Định nghĩa cấu hình Props đầu vào cho RoomFormModal
interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: number;
  roomToEdit?: RoomConfig;
  onSuccess: (newRoom: {
    id: string;
    name: string;
    bedType: string;
    size: number;
    maxGuests: number;
    quantity: number;
    price: number;
    images?: string[];
    ratePlans?: RatePlanForm[];
  }) => void;
  triggerMessage: (type: 'success' | 'error', content: string) => void;
}

export interface RatePlanForm {
  id: string;
  name: string;
  priceMultiplier: number;
  hasBreakfast: boolean;
  isRefundable: boolean;
}

export const RoomFormModal: React.FC<RoomFormModalProps> = ({
  isOpen,
  onClose,
  hotelId,
  roomToEdit,
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

  // Upload ảnh state
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rate plans state
  // Rate plans state
  const [ratePlans, setRatePlans] = useState<RatePlanForm[]>([
    { id: '1', name: 'Standard (Mặc định)', priceMultiplier: 1, hasBreakfast: false, isRefundable: true }
  ]);

  React.useEffect(() => {
    if (isOpen) {
      if (roomToEdit) {
        setNewRoomForm({
          name: roomToEdit.name,
          bedType: roomToEdit.bedType,
          size: roomToEdit.size,
          maxGuests: roomToEdit.maxGuests,
          quantity: roomToEdit.quantity,
          price: roomToEdit.price,
          description: roomToEdit.description || ''
        });
        setPreviewUrls(roomToEdit.images || []);
        // Simulate existing images logic here (currently we don't have existing image blobs)
        setImages([]);

        if (roomToEdit.ratePlans && roomToEdit.ratePlans.length > 0) {
          setRatePlans(roomToEdit.ratePlans.map((rp: any, index: number) => ({
            id: rp.id || Date.now().toString() + index,
            name: rp.name,
            priceMultiplier: rp.priceMultiplier,
            hasBreakfast: rp.hasBreakfast,
            isRefundable: rp.isRefundable
          })));
        } else {
          setRatePlans([{ id: '1', name: 'Standard (Mặc định)', priceMultiplier: 1, hasBreakfast: false, isRefundable: true }]);
        }
      } else {
        setNewRoomForm({
          name: '', bedType: '1 King Bed', size: 32, maxGuests: 2, quantity: 5, price: 1500000, description: ''
        });
        setImages([]);
        setPreviewUrls([]);
        setPrimaryImageIndex(0);
        setRatePlans([{ id: '1', name: 'Standard (Mặc định)', priceMultiplier: 1, hasBreakfast: false, isRefundable: true }]);
      }
    }
  }, [isOpen, roomToEdit]);

  if (!isOpen) return null;

  // ── Xử lý Kéo thả và Chọn ảnh ──
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      triggerMessage('error', 'Chỉ chấp nhận định dạng hình ảnh.');
      return;
    }
    setImages(prev => [...prev, ...validFiles]);
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Thu hồi blob URL để tránh memory leak
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
    if (primaryImageIndex === index) setPrimaryImageIndex(0);
    else if (primaryImageIndex > index) setPrimaryImageIndex(prev => prev - 1);
  };

  // ── Xử lý Rate Plans ──
  const addRatePlan = () => {
    setRatePlans(prev => [
      ...prev,
      { id: Date.now().toString(), name: 'Tên gói (VD: Bao ăn sáng)', priceMultiplier: 1.2, hasBreakfast: true, isRefundable: false }
    ]);
  };

  const updateRatePlan = (id: string, field: keyof RatePlanForm, value: any) => {
    setRatePlans(prev => prev.map(rp => rp.id === id ? { ...rp, [field]: value } : rp));
  };

  const removeRatePlan = (id: string) => {
    if (ratePlans.length === 1) {
      triggerMessage('error', 'Phải có ít nhất 1 gói giá.');
      return;
    }
    setRatePlans(prev => prev.filter(rp => rp.id !== id));
  };

  // ── Xử lý Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId) {
      triggerMessage('error', 'Không tìm thấy cơ sở lưu trú để thêm phòng.');
      return;
    }

    setSubmitting(true);
    try {
      const roomPayload = {
        name: newRoomForm.name.trim(),
        basePrice: newRoomForm.price,
        capacity: newRoomForm.maxGuests,
        totalRooms: newRoomForm.quantity,
        description: newRoomForm.description.trim() || `Hạng phòng cao cấp ${newRoomForm.name}`,
        ratePlans: ratePlans.map(rp => ({
          name: rp.name,
          priceMultiplier: rp.priceMultiplier,
          hasBreakfast: rp.hasBreakfast,
          isRefundable: rp.isRefundable
        }))
      };

      let currentRoomTypeId = roomToEdit ? parseInt(roomToEdit.id) : 0;

      if (roomToEdit) {
        await partnerService.updateRoomType(hotelId, currentRoomTypeId, roomPayload);
      } else {
        const result = await partnerService.addRoomType(hotelId, roomPayload);
        currentRoomTypeId = result.roomTypeId;
      }

      if (images.length > 0 && currentRoomTypeId > 0) {
        console.log(`Đang xử lý tải lên ${images.length} ảnh cho hạng phòng...`);
        // Upload từng ảnh
        for (const file of images) {
          try {
            await partnerService.uploadRoomTypeImage(hotelId, currentRoomTypeId, file);
          } catch (uploadErr) {
            console.error('Lỗi upload ảnh:', uploadErr);
            triggerMessage('error', `Tải ảnh ${file.name} thất bại.`);
          }
        }
      }

      const newRoom = {
        id: currentRoomTypeId.toString(),
        name: newRoomForm.name.trim(),
        bedType: newRoomForm.bedType,
        size: newRoomForm.size,
        maxGuests: newRoomForm.maxGuests,
        quantity: newRoomForm.quantity,
        price: newRoomForm.price,
        images: previewUrls,
        ratePlans: ratePlans
      };

      triggerMessage('success', roomToEdit
        ? `Đã cập nhật hạng phòng "${newRoom.name}" thành công!`
        : `Đã thêm hạng phòng "${newRoom.name}" thành công vào hệ thống CSDL!`);
      onSuccess(newRoom);

      // Cleanup
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      onClose();

      setNewRoomForm({
        name: '', bedType: '1 King Bed', size: 32, maxGuests: 2, quantity: 5, price: 1500000, description: ''
      });
      setImages([]);
      setPreviewUrls([]);
      setPrimaryImageIndex(0);
      setRatePlans([{ id: '1', name: 'Standard (Mặc định)', priceMultiplier: 1, hasBreakfast: false, isRefundable: true }]);
    } catch (err: unknown) {
      console.error('⚠️ Lỗi thêm hạng phòng:', err);
      const errMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.';
      triggerMessage('error', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-[#1C1C19]/60 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-over Panel */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-[#FAF6F0] shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Tiêu đề Panel */}
        <div className="px-7 py-6 border-b border-[#E6E2DD] bg-[#FAF6F0] flex justify-between items-center shrink-0">
          <h3 className="font-display-lg text-xl font-bold text-[#1C1C19] flex items-center gap-2.5">
            <Bed className="h-6 w-6 text-[#735C00]" />
            {roomToEdit ? 'Chỉnh sửa hạng phòng' : 'Thêm hạng phòng di sản mới'}
          </h3>
          <button onClick={onClose} className="text-[#444748] hover:text-[#1C1C19] p-1 rounded-full hover:bg-[#F1EDE8] transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Nội dung form cuộn được */}
        <div className="flex-1 overflow-y-auto">
          <form id="addRoomForm" onSubmit={handleSubmit} className="p-7 space-y-8">

            {/* Khối: Thông tin cơ bản */}
            <div className="space-y-5">
              <h4 className="font-label-md text-sm uppercase tracking-widest text-[#735C00] font-bold border-b border-[#E6E2DD] pb-2">1. Thông tin cơ bản</h4>

              <div className="space-y-2">
                <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Tên hạng phòng *</label>
                <input type="text" required disabled={submitting} placeholder="Ví dụ: Executive River View Suite"
                  value={newRoomForm.name} onChange={e => setNewRoomForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4.5">
                <div className="space-y-2">
                  <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Loại giường *</label>
                  <select disabled={submitting} value={newRoomForm.bedType} onChange={e => setNewRoomForm(prev => ({ ...prev, bedType: e.target.value }))}
                    className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors appearance-none">
                    <option>1 King Bed</option><option>1 Super King Bed</option><option>2 Double Beds</option><option>1 Queen Bed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Diện tích (m²) *</label>
                  <input type="number" required disabled={submitting} min={15} value={newRoomForm.size} onChange={e => setNewRoomForm(prev => ({ ...prev, size: parseInt(e.target.value) || 30 }))}
                    className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Số khách tối đa *</label>
                  <input type="number" required disabled={submitting} min={1} max={6} value={newRoomForm.maxGuests} onChange={e => setNewRoomForm(prev => ({ ...prev, maxGuests: parseInt(e.target.value) || 2 }))}
                    className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Số lượng phòng *</label>
                  <input type="number" required disabled={submitting} min={1} value={newRoomForm.quantity} onChange={e => setNewRoomForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 5 }))}
                    className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Giá cơ bản mỗi đêm (₫) *</label>
                <input type="number" required disabled={submitting} min={100000} value={newRoomForm.price} onChange={e => setNewRoomForm(prev => ({ ...prev, price: parseInt(e.target.value) || 1000000 }))}
                  className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-3 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none font-mono tracking-wider transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-xs uppercase tracking-wider text-[#444748] font-bold block">Mô tả đặc điểm hạng phòng</label>
                <textarea rows={2} disabled={submitting} placeholder="Ví dụ: View hướng sông Thu Bồn thơ mộng..." value={newRoomForm.description} onChange={e => setNewRoomForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Khối: Upload ảnh */}
            <div className="space-y-4">
              <h4 className="font-label-md text-sm uppercase tracking-widest text-[#735C00] font-bold border-b border-[#E6E2DD] pb-2 flex justify-between items-center">
                <span>2. Hình ảnh phòng</span>
                <span className="text-[10px] text-[#444748] normal-case tracking-normal font-normal">Kéo thả để upload (ít nhất 1 ảnh)</span>
              </h4>

              <div
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${isDragging ? 'border-[#735C00] bg-[#735C00]/5' : 'border-[#E6E2DD] hover:border-[#735C00]/50'}`}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className={`h-10 w-10 mb-3 ${isDragging ? 'text-[#735C00]' : 'text-[#444748]'}`} />
                <p className="font-body-md text-sm text-[#1C1C19] font-medium">Nhấn để chọn hoặc kéo thả ảnh vào đây</p>
                <p className="font-body-md text-xs text-[#444748] mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*" className="hidden" />
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className={`relative group rounded-lg overflow-hidden border-2 aspect-video ${primaryImageIndex === index ? 'border-[#735C00]' : 'border-transparent'}`}>
                      <img src={url} alt={`preview-${index}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <button type="button" onClick={() => removeImage(index)} className="self-end text-white hover:text-red-400 bg-black/30 rounded-full p-1"><X className="h-4 w-4" /></button>
                        {primaryImageIndex !== index && (
                          <button type="button" onClick={() => setPrimaryImageIndex(index)} className="text-[10px] text-white font-bold uppercase bg-[#735C00] py-1 px-2 rounded self-center shadow">Đặt làm ảnh chính</button>
                        )}
                      </div>
                      {primaryImageIndex === index && (
                        <div className="absolute bottom-2 left-2 bg-[#735C00] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" /> Ảnh chính
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Khối: Cài đặt Gói giá (Rate Plans) */}
            <div className="space-y-4">
              <h4 className="font-label-md text-sm uppercase tracking-widest text-[#735C00] font-bold border-b border-[#E6E2DD] pb-2 flex justify-between items-center">
                <span>3. Các gói giá (Rate Plans)</span>
                <button type="button" onClick={addRatePlan} className="text-[#735C00] hover:bg-[#735C00]/10 p-1 rounded transition-colors flex items-center text-[10px]">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Thêm gói
                </button>
              </h4>

              <div className="space-y-3">
                {ratePlans.map((rp, index) => (
                  <div key={rp.id} className="bg-white border border-[#E6E2DD] rounded-xl p-4 relative group shadow-sm">
                    {index > 0 && (
                      <button type="button" onClick={() => removeRatePlan(rp.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"><X className="h-3 w-3" /></button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#444748] block mb-1">Tên gói giá</label>
                        <input type="text" value={rp.name} onChange={e => updateRatePlan(rp.id, 'name', e.target.value)}
                          className="w-full border border-[#E6E2DD] rounded px-3 py-1.5 text-xs focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#444748] block mb-1">Hệ số giá (Multiplier)</label>
                        <div className="flex items-center gap-2">
                          <input type="number" step="0.01" min="0.5" value={rp.priceMultiplier} onChange={e => updateRatePlan(rp.id, 'priceMultiplier', parseFloat(e.target.value) || 1)}
                            className="w-20 border border-[#E6E2DD] rounded px-3 py-1.5 text-xs focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] outline-none text-right font-mono" />
                          <span className="text-xs text-[#444748]">x {newRoomForm.price.toLocaleString()}đ = {(newRoomForm.price * rp.priceMultiplier).toLocaleString()}đ</span>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 flex gap-6 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={rp.hasBreakfast} onChange={e => updateRatePlan(rp.id, 'hasBreakfast', e.target.checked)} className="accent-[#735C00] w-3.5 h-3.5" />
                          <span className="text-xs text-[#1C1C19]">Bao gồm ăn sáng</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={rp.isRefundable} onChange={e => updateRatePlan(rp.id, 'isRefundable', e.target.checked)} className="accent-[#735C00] w-3.5 h-3.5" />
                          <span className="text-xs text-[#1C1C19]">Cho phép hoàn hủy</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Action buttons ở chân Panel */}
        <div className="p-5 border-t border-[#E6E2DD] bg-[#FAF6F0] flex justify-end gap-3.5 shrink-0">
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
            form="addRoomForm"
            disabled={submitting || ratePlans.length === 0}
            className="px-5 py-2.5 bg-[#1C1C19] hover:bg-[#735C00] text-[#FAF6F0] text-xs font-label-md uppercase tracking-wider rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:scale-[1.01]"
          >
            {submitting && (
              <div className="w-3.5 h-3.5 border-2 border-[#FAF6F0] border-t-transparent rounded-full animate-spin"></div>
            )}
            {submitting ? 'Đang gửi...' : (roomToEdit ? 'Lưu thay đổi' : 'Xác nhận thêm')}
          </button>
        </div>

      </div>
    </div>
  );
};
