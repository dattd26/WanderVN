import React from 'react';
import { Calendar } from 'lucide-react';
import type { RoomConfig } from './RoomsTab';
import type { HotelBooking } from './BookingsTab';

// Cấu hình Props cho component AvailabilityTab
interface AvailabilityTabProps {
  rooms: RoomConfig[];
  bookings: HotelBooking[];
  onAdjustAvailability: (roomId: string, day: string, increment: boolean) => void;
}

export const AvailabilityTab: React.FC<AvailabilityTabProps> = ({
  rooms,
  bookings,
  onAdjustAvailability
}) => {
  // Tạo danh sách 7 ngày tới
  const today = new Date();
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    return {
      logicDate: `${yyyy}-${mm}-${dd}`,
      displayDate: `${dd}/${mm}`
    };
  });

  const startDateDisplay = next7Days[0].displayDate;
  const endDateDisplay = next7Days[6].displayDate;

  return (
    <div className="space-y-6">

      <div className="space-y-1">
        <h4 className="font-display-lg text-md text-[#1C1C19] border-b border-[#E6E2DD]/60 pb-2 flex items-center gap-2 font-bold">
          <Calendar className="h-4.5 w-4.5 text-[#735C00]" />
          Bảng kiểm soát số lượng phòng trống
        </h4>
        <p className="font-body-md text-[#444748] text-xs">
          Tăng/giảm nhanh số phòng khả dụng còn trống đón khách cho từng hạng phòng trong 7 ngày tới (từ <strong>{startDateDisplay}</strong> đến <strong>{endDateDisplay}</strong>).
        </p>
      </div>

      <div className="overflow-x-auto border border-[#E6E2DD] rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1EDE8] border-b border-[#E6E2DD]">
              <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold">Hạng phòng</th>
              {next7Days.map((day, idx) => (
                <th key={idx} className="p-4 font-mono text-[10px] uppercase text-[#1C1C19] text-center font-bold">
                  {day.displayDate}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => {
              return (
                <tr key={room.id} className="border-b border-[#E6E2DD]/40 hover:bg-[#F1EDE8]/30">
                  <td className="p-4 font-display-lg text-xs font-bold text-[#1C1C19]">{room.name}</td>
                  {next7Days.map(day => {
                    const d = day.logicDate;
                    // Tính toán động số đơn đặt phòng bận trong ngày d của hạng phòng hiện tại
                    const occupiedRooms = bookings.filter(bk => {
                      const isSameRoomType = bk.roomTypeName === room.name;
                      const isStayingOnDay = d >= bk.checkIn && d < bk.checkOut;
                      const isActive = bk.status !== 'Cancelled';
                      return isSameRoomType && isStayingOnDay && isActive;
                    }).length;

                    // Số lượng phòng khả dụng = Tổng số lượng phòng vật lý - Số lượng đơn bận
                    const qty = Math.max(0, room.quantity - occupiedRooms);
                    const isSoldOut = qty === 0;

                    return (
                      <td key={d} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${isSoldOut ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {isSoldOut ? 'Hết phòng' : `${qty} trống`}
                          </span>

                          {/* Các nút điều khiển tăng giảm nhanh phòng trống vật lý */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onAdjustAvailability(room.id, d, false)}
                              className="w-5 h-5 rounded-full border border-[#E6E2DD] hover:bg-[#F1EDE8] flex items-center justify-center text-xs font-bold text-[#444748]"
                            >
                              -
                            </button>
                            <button
                              onClick={() => onAdjustAvailability(room.id, d, true)}
                              className="w-5 h-5 rounded-full border border-[#E6E2DD] hover:bg-[#F1EDE8] flex items-center justify-center text-xs font-bold text-[#444748]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
