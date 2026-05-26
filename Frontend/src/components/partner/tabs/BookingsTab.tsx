import React from 'react';
import { Sliders, AlertCircle, Sparkles } from 'lucide-react';

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
}

export const BookingsTab: React.FC<BookingsTabProps> = ({ bookings }) => {
  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#E6E2DD]/60 pb-2">
        <div className="space-y-1">
          <h4 className="font-display-lg text-md text-[#1C1C19] flex items-center gap-2 font-bold">
            <Sliders className="h-4.5 w-4.5 text-[#735C00]" />
            Quản lý danh sách Đơn đặt phòng di sản
          </h4>
          <p className="font-body-md text-[#444748] text-xs">
            Xem chi tiết danh sách khách lưu trú, thông tin phòng nghỉ, giá tiền và các trạng thái đi kèm.
          </p>
        </div>
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

    </div>
  );
};
