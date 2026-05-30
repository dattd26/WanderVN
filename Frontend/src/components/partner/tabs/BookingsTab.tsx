import React, { useState } from 'react';
import { Sliders, AlertCircle, Sparkles, CheckCircle2, UserX, LogOut } from 'lucide-react';
import { partnerService } from '../../../services';
import { useToast } from '../../../contexts/ToastContext';

// Định nghĩa cấu trúc đơn đặt phòng của khách sạn
export interface HotelBooking {
  bookingId: number;
  id: string;
  guestName: string;
  email: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Completed' | 'Cancelled' | 'NoShow' | 'SettlementPending' | 'Settled';
  specialRequests?: string;
}

// Cấu hình Props cho component BookingsTab
interface BookingsTabProps {
  hotelId: number;
  bookings: HotelBooking[];
  onRefresh: () => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({ hotelId, bookings, onRefresh }) => {
  const { triggerMessage } = useToast();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const getStatusConfig = (status: HotelBooking['status']) => {
    switch (status) {
      case 'Pending': return { label: 'CHỜ THANH TOÁN', color: 'bg-[#F2F2F2] text-[#444748]' };
      case 'Confirmed': return { label: 'ĐÃ XÁC NHẬN', color: 'bg-[#EBF7EE] text-[#1E5C2F]' };
      case 'CheckedIn': return { label: 'ĐÃ CHECK-IN', color: 'bg-[#E3F2FD] text-[#0D47A1]' };
      case 'CheckedOut': return { label: 'ĐÃ CHECK-OUT', color: 'bg-[#FFF3E0] text-[#E65100]' };
      case 'Completed': return { label: 'HOÀN TẤT', color: 'bg-[#E8EAF6] text-[#283593]' };
      case 'Cancelled': return { label: 'ĐÃ HỦY', color: 'bg-[#FFEBEE] text-[#C62828]' };
      case 'NoShow': return { label: 'KHÁCH KHÔNG ĐẾN', color: 'bg-[#ECEFF1] text-[#37474F]' };
      case 'SettlementPending': return { label: 'CHỜ ĐỐI SOÁT', color: 'bg-[#FEF9EC] text-[#8F6B00]' };
      case 'Settled': return { label: 'ĐÃ ĐỐI SOÁT', color: 'bg-[#EBF7EE] text-[#1E5C2F]' };
      default: return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleAction = async (action: 'check-in' | 'check-out' | 'complete' | 'no-show', bookingId: number) => {
    try {
      setLoadingId(bookingId);
      if (action === 'check-in') await partnerService.confirmCheckIn(hotelId, bookingId);
      if (action === 'check-out') await partnerService.confirmCheckOut(hotelId, bookingId);
      if (action === 'complete') await partnerService.completeBooking(hotelId, bookingId);
      if (action === 'no-show') await partnerService.markNoShow(hotelId, bookingId);

      triggerMessage('success', action === 'complete' ? 'Hoàn tất booking thành công, sau 3 - 5 phút sẽ bắt đầu chờ đối soát (thời gian đối soát ~24h).' : 'Thao tác thành công.');
      onRefresh();
    } catch (err: any) {
      triggerMessage('error', err.message || 'Có lỗi xảy ra.');
    } finally {
      setLoadingId(null);
    }
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
                <span className={`px-3 py-1 rounded font-label-md text-[9px] uppercase font-bold tracking-widest ${getStatusConfig(bk.status).color}`}>
                  {getStatusConfig(bk.status).label}
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

              {/* Action Buttons */}
              {bk.status === 'Confirmed' && (
                <div className="mt-4 flex gap-3 border-t border-[#E6E2DD]/60 pt-4">
                  <button
                    onClick={() => handleAction('check-in', bk.bookingId)}
                    disabled={loadingId === bk.bookingId}
                    className="bg-[#1C1C19] text-[#FAF6F0] font-label-md text-xs px-4 py-2 rounded-md hover:bg-[#735C00] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Xác nhận Check-in
                  </button>
                  <button
                    onClick={() => handleAction('no-show', bk.bookingId)}
                    disabled={loadingId === bk.bookingId}
                    className="bg-transparent border border-[#1C1C19] text-[#1C1C19] font-label-md text-xs px-4 py-2 rounded-md hover:bg-[#F2F2F2] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <UserX className="h-4 w-4" />
                    Báo khách không đến
                  </button>
                </div>
              )}

              {bk.status === 'CheckedIn' && (
                <div className="mt-4 flex gap-3 border-t border-[#E6E2DD]/60 pt-4">
                  <button
                    onClick={() => handleAction('check-out', bk.bookingId)}
                    disabled={loadingId === bk.bookingId}
                    className="bg-[#1C1C19] text-[#FAF6F0] font-label-md text-xs px-4 py-2 rounded-md hover:bg-[#735C00] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Xác nhận Check-out
                  </button>
                </div>
              )}

              {bk.status === 'CheckedOut' && (
                <div className="mt-4 flex gap-3 border-t border-[#E6E2DD]/60 pt-4">
                  <button
                    onClick={() => handleAction('complete', bk.bookingId)}
                    disabled={loadingId === bk.bookingId}
                    className="bg-[#1C1C19] text-[#FAF6F0] font-label-md text-xs px-4 py-2 rounded-md hover:bg-[#735C00] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Hoàn tất lưu trú
                  </button>
                </div>
              )}
            </div>
          ));
        })()}
      </div>

    </div>
  );
};
