import React from 'react';
import { Bed, Plus, Trash2, Edit } from 'lucide-react';

// Định nghĩa cấu trúc cấu hình của một hạng phòng
export interface RoomConfig {
  id: string;
  name: string;
  bedType: string;
  size: number;
  maxGuests: number;
  quantity: number;
  price: number;
}

// Cấu hình Props cho component RoomsTab
interface RoomsTabProps {
  rooms: RoomConfig[];
  onAddRoomClick: () => void;
  onEditRoom?: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
}

export const RoomsTab: React.FC<RoomsTabProps> = ({
  rooms,
  onAddRoomClick,
  onEditRoom,
  onDeleteRoom
}) => {
  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center border-b border-[#E6E2DD]/60 pb-2">
        <h4 className="font-display-lg text-md text-[#1C1C19] flex items-center gap-2 font-bold">
          <Bed className="h-4.5 w-4.5 text-[#735C00]" />
          Danh sách hạng phòng hoạt động
        </h4>
        <button
          onClick={onAddRoomClick}
          className="text-[#735C00] hover:text-[#735C00]/80 font-label-md text-xs flex items-center gap-1 font-bold"
        >
          <Plus className="h-4 w-4" /> Thêm hạng phòng mới
        </button>
      </div>

      <div className="space-y-4">
        {rooms.length === 0 ? (
          <div className="text-center py-10 bg-[#FAF6F0]/40 rounded-xl border border-[#E6E2DD] border-dashed">
            <Bed className="h-10 w-10 text-[#444748]/30 mx-auto mb-2" />
            <p className="font-body-md text-xs text-[#444748]">Chưa có hạng phòng nào được cấu hình cho cơ sở này.</p>
          </div>
        ) : (
          rooms.map(room => (
            <div
              key={room.id}
              className="border border-[#E6E2DD]/60 rounded-xl p-4.5 bg-[#FAF6F0] hover:border-[#735C00]/30 hover:shadow-sm transition-all duration-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group"
            >
              <div className="space-y-1">
                <h5 className="font-display-lg text-sm text-[#1C1C19] font-bold group-hover:text-[#735C00] transition-colors">{room.name}</h5>
                <p className="font-body-md text-xs text-[#444748] flex flex-wrap gap-x-3 gap-y-1">
                  <span>Loại giường: <strong>{room.bedType}</strong></span>
                  <span>•</span>
                  <span>Diện tích: <strong>{room.size} m²</strong></span>
                  <span>•</span>
                  <span>Tối đa: <strong>{room.maxGuests} khách</strong></span>
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5">
                <div className="text-left sm:text-right shrink-0">
                  <div className="font-mono text-xs font-bold text-[#735C00]">₫{room.price.toLocaleString('vi-VN')} <span className="text-[10px] text-[#444748] font-normal">/đêm</span></div>
                  <div className="text-[10px] text-[#444748] font-semibold bg-[#F1EDE8] px-2 py-0.5 rounded inline-block mt-1">Số lượng: {room.quantity} phòng</div>
                </div>
                <div className="flex items-center gap-2">
                  {onEditRoom && (
                    <button
                      onClick={() => onEditRoom(room.id)}
                      className="text-[#735C00] hover:text-[#5c4a00] bg-[#735C00]/10 hover:bg-[#735C00]/20 p-2 rounded transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteRoom(room.id)}
                    className="text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 p-2 rounded transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
