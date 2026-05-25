import React, { useState } from 'react';
import { Sliders, AlertCircle, Sparkles, Plus, Calendar, User, Mail, DollarSign } from 'lucide-react';
import type { RoomConfig } from './RoomsTab';

// Định nghĩa cấu trúc đơn đặt phòng của khách sạn
export interface HotelBooking {
  id: string;
  guestName: string;
  email: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'CheckedIn' | 'Confirmed' | 'Cancelled';
  specialRequests?: string;
}

// Cấu hình Props cho component BookingsTab
interface BookingsTabProps {
  bookings: HotelBooking[];
  rooms: RoomConfig[];
  onAddWalkInBooking: (newBooking: Omit<HotelBooking, 'id' | 'status'>) => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({
  bookings,
  rooms,
  onAddWalkInBooking
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoomName, setSelectedRoomName] = useState(rooms[0]?.name || '');
  const [checkIn, setCheckIn] = useState('2026-06-01');
  const [checkOut, setCheckOut] = useState('2026-06-03');
  const [specialRequests, setSpecialRequests] = useState('');

  // Tự động tính số đêm lưu trú
  const calculateNights = (inDate: string, outDate: string): number => {
    const start = new Date(inDate);
    const end = new Date(outDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // Tìm kiếm thông tin phòng đang chọn
  const selectedRoom = rooms.find(r => r.name === selectedRoomName) || rooms[0];
  const nights = calculateNights(checkIn, checkOut);
  const estimatedPrice = selectedRoom ? selectedRoom.price * nights : 0;

  // Xử lý nộp đơn đặt phòng vãng lai
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !email.trim()) return;

    onAddWalkInBooking({
      guestName: guestName.trim(),
      email: email.trim(),
      roomTypeName: selectedRoomName || (selectedRoom ? selectedRoom.name : ''),
      checkIn,
      checkOut,
      totalPrice: estimatedPrice,
      specialRequests: specialRequests.trim() || undefined
    });

    // Reset Form & Đóng Modal
    setGuestName('');
    setEmail('');
    setSpecialRequests('');
    setIsOpenModal(false);
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#E6E2DD]/60 pb-2">
        <div className="space-y-1">
          <h4 className="font-display-lg text-md text-[#1C1C19] flex items-center gap-2 font-bold">
            <Sliders className="h-4.5 w-4.5 text-[#735C00]" />
            Quản lý danh sách Đơn đặt phòng di sản
          </h4>
          <p className="font-body-md text-[#444748] text-xs">
            Xem chi tiết danh sách khách lưu trú, thông tin phòng nghỉ, giá tiền và các yêu cầu đặt biệt đi kèm.
          </p>
        </div>
        <button
          onClick={() => {
            if (rooms.length === 0) {
              alert('Vui lòng thêm ít nhất một hạng phòng trước khi ghi nhận khách vãng lai.');
              return;
            }
            setSelectedRoomName(rooms[0].name);
            setIsOpenModal(true);
          }}
          className="bg-[#735C00] hover:bg-[#735C00]/90 text-[#FAF6F0] font-label-md text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all shrink-0 hover:scale-[1.01]"
        >
          <Plus className="h-4 w-4" />
          Thêm đơn vãng lai
        </button>
      </div>

      <div className="space-y-4.5">
        {(() => {
          const guestBookings = bookings.filter(bk => bk.guestName !== 'Phòng khóa / Bảo trì');
          if (guestBookings.length === 0) {
            return (
              <div className="text-center py-10 bg-[#FAF6F0]/40 rounded-xl border border-[#E6E2DD] border-dashed">
                <AlertCircle className="h-10 w-10 text-[#444748]/30 mx-auto mb-2" />
                <p className="font-body-md text-xs text-[#444748]">Hiện tại chưa ghi nhận đơn đặt phòng nào mới.</p>
              </div>
            );
          }
          return guestBookings.map(bk => (
            <div
              key={bk.id}
              className="border border-[#E6E2DD] rounded-xl p-4 bg-[#FAF6F0] shadow-sm hover:border-[#735C00]/25 transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 pb-3 border-b border-[#E6E2DD]/60 mb-3.5">
                <div>
                  <span className="font-mono text-xs font-bold text-[#735C00]">{bk.id}</span>
                  <h6 className="font-display-lg text-sm text-[#1C1C19] font-bold mt-0.5">{bk.guestName}</h6>
                </div>
                <span className={`px-3 py-1 rounded font-label-md text-[9px] uppercase font-bold tracking-widest ${bk.status === 'CheckedIn' ? 'bg-[#EBF7EE] text-[#1E5C2F]' : 'bg-[#FEF9EC] text-[#8F6B00]'
                  }`}>
                  {bk.status === 'CheckedIn' ? 'ĐÃ CHECK-IN' : 'ĐÃ XÁC NHẬN'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-body-md text-xs text-[#444748]">
                <div>
                  <span className="text-[10px] text-[#444748]/75 block uppercase font-bold tracking-wider">Hạng phòng</span>
                  <strong className="text-[#1C1C19]">{bk.roomTypeName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#444748]/75 block uppercase font-bold tracking-wider">Thời gian</span>
                  <span className="text-[#1C1C19] font-semibold">{bk.checkIn} đến {bk.checkOut}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#444748]/75 block uppercase font-bold tracking-wider">Email liên hệ</span>
                  <span className="text-[#1C1C19] truncate block">{bk.email}</span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[#444748]/75 block uppercase font-bold tracking-wider">Doanh thu</span>
                  <strong className="text-[#735C00] font-mono font-bold text-sm">₫{bk.totalPrice.toLocaleString('vi-VN')}</strong>
                </div>
              </div>

              {bk.specialRequests && (
                <div className="mt-3.5 bg-[#F1EDE8] p-2.5 rounded-lg border border-[#E6E2DD] text-[11px] text-[#444748] flex gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#735C00] shrink-0 mt-0.5" />
                  <p><strong>Yêu cầu đặc biệt:</strong> {bk.specialRequests}</p>
                </div>
              )}
            </div>
          ));
        })()}
      </div>

      {/* ── MODAL THÊM ĐƠN ĐẶT PHÒNG VÃNG LAI (WALK-IN) ── */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-[#1C1C19]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl border border-[#E6E2DD] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-[#E6E2DD] bg-[#FAF6F0] flex justify-between items-center">
              <h3 className="font-display-lg text-md font-bold text-[#1C1C19] flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#735C00]" />
                Đăng ký đơn đặt phòng vãng lai mới
              </h3>
              <button
                onClick={() => setIsOpenModal(false)}
                className="text-[#444748] hover:text-[#1C1C19] text-2xl font-bold transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="space-y-1.5">
                <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-[#735C00]" /> Họ và tên khách hàng *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Minh Hoàng"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-[#735C00]" /> Địa chỉ Email / Số điện thoại *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: hoangtm@gmail.com hoặc 0905123456"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Hạng phòng đăng ký *</label>
                <select
                  value={selectedRoomName}
                  onChange={e => setSelectedRoomName(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all appearance-none"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.name}>
                      {r.name} - ₫{r.price.toLocaleString('vi-VN')}/đêm
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#735C00]" /> Ngày Check-in *
                  </label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#735C00]" /> Ngày Check-out *
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Yêu cầu đặc biệt</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Đóng cọc thanh toán tiền mặt trước, yêu cầu hóa đơn VAT..."
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2 text-xs md:text-sm text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Box Tính toán Ước lượng doanh thu */}
              <div className="bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl p-3.5 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#444748] font-bold uppercase tracking-wider block">Thời gian lưu trú</span>
                  <span className="font-display-lg text-xs font-bold text-[#1C1C19]">{nights} đêm</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#444748] font-bold uppercase tracking-wider block flex items-center justify-end gap-0.5">
                    <DollarSign className="h-3 w-3 text-[#735C00]" /> Tổng chi phí ước tính
                  </span>
                  <strong className="font-mono text-base font-bold text-[#735C00]">₫{estimatedPrice.toLocaleString('vi-VN')}</strong>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="pt-4 border-t border-[#E6E2DD] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4.5 py-2 border border-[#E6E2DD] text-xs font-label-md uppercase tracking-wider text-[#444748] hover:bg-[#F1EDE8] rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-[#1C1C19] hover:bg-[#735C00] text-[#FAF6F0] text-xs font-label-md uppercase tracking-wider rounded-xl font-bold transition-all hover:scale-[1.01]"
                >
                  Xác nhận thêm
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
