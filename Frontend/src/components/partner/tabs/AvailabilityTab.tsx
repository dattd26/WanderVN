import React from 'react';
import { Calendar } from 'lucide-react';
import type { RoomConfig } from './RoomsTab';

// Cấu hình Props cho component AvailabilityTab
interface AvailabilityTabProps {
  rooms: RoomConfig[];
  availabilityDays: Record<string, Record<string, number>>;
  onAdjustAvailability: (roomId: string, day: string, increment: boolean) => void;
}

export const AvailabilityTab: React.FC<AvailabilityTabProps> = ({
  rooms,
  availabilityDays,
  onAdjustAvailability
}) => {
  return (
    <div className="space-y-6">

      <div className="space-y-1">
        <h4 className="font-display-lg text-md text-[#1C1C19] border-b border-[#E6E2DD]/60 pb-2 flex items-center gap-2 font-bold">
          <Calendar className="h-4.5 w-4.5 text-[#735C00]" />
          Bảng kiểm soát số lượng phòng trống
        </h4>
        <p className="font-body-md text-[#444748] text-xs">
          Tăng/giảm nhanh số phòng khả dụng còn trống đón khách cho từng hạng phòng trong tuần từ <strong>01/06</strong> đến <strong>07/06</strong>.
        </p>
      </div>

      <div className="overflow-x-auto border border-[#E6E2DD] rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1EDE8] border-b border-[#E6E2DD]">
              <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold">Hạng phòng</th>
              <th className="p-4 font-mono text-[10px] uppercase text-[#1C1C19] text-center font-bold">01/06</th>
              <th className="p-4 font-mono text-[10px] uppercase text-[#1C1C19] text-center font-bold">02/06</th>
              <th className="p-4 font-mono text-[10px] uppercase text-[#1C1C19] text-center font-bold">03/06</th>
              <th className="p-4 font-mono text-[10px] uppercase text-[#1C1C19] text-center font-bold">04/06</th>
              <th className="p-4 font-mono text-[10px] uppercase text-[#1C1C19] text-center font-bold">05/06</th>
              <th className="p-4 font-mono text-[10px] uppercase text-[#1C1C19] text-center font-bold">06/06</th>
              <th className="p-4 font-mono text-[10px] uppercase text-[#1C1C19] text-center font-bold">07/06</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => {
              const days = ['06-01', '06-02', '06-03', '06-04', '06-05', '06-06', '06-07'];
              return (
                <tr key={room.id} className="border-b border-[#E6E2DD]/40 hover:bg-[#F1EDE8]/30">
                  <td className="p-4 font-display-lg text-xs font-bold text-[#1C1C19]">{room.name}</td>
                  {days.map(d => {
                    const qty = availabilityDays[room.id]?.[d] ?? room.quantity;
                    const isSoldOut = qty === 0;
                    return (
                      <td key={d} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${isSoldOut ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {isSoldOut ? 'Hết phòng' : `${qty} trống`}
                          </span>

                          {/* Các nút điều khiển tăng giảm nhanh phòng trống */}
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
