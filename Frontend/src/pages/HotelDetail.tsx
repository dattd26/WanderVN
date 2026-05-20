import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Users, AlertCircle } from 'lucide-react';

// 1. Interfaces ánh xạ chính xác 100% với DTO trong C# của anh
interface RoomTypeInfo {
  id: number;
  name: string;
  basePrice: number;
  capacity: number;
  availableRooms: number;
}

interface HotelDetailDto {
  id: number;
  name: string;
  address: string | null;
  starRating: number | null;
  description: string | null;
  locationName: string | null;
  images: string[];
  roomTypes: RoomTypeInfo[];
}

export const HotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<HotelDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cập nhật lại đường dẫn với đúng Port 5096 (HTTP) của Backend
    fetch(`http://localhost:5096/api/v1/hotels/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Lỗi mạng hoặc không tìm thấy khách sạn');
        return res.json();
      })
      .then(result => {
        // 2. Bóc tách lớp vỏ API Response: Lấy dữ liệu thật từ result.data
        if (result.success && result.data) {
          setHotel(result.data);
        } else {
          // Nếu success = false (ví dụ truyền sai ID)
          setHotel(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi fetch dữ liệu:", err);
        setHotel(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen uppercase tracking-widest text-sm text-[#747878]">Đang tải trải nghiệm...</div>;
  if (!hotel) return <div className="flex justify-center items-center h-screen uppercase tracking-widest text-sm text-[#747878]">Không tìm thấy không gian lưu trú này.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 mb-20">
      {/* 1. Header: Tiêu đề & Địa chỉ */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-[#B59A5A]">
            {/* Hiển thị sao nếu có StarRating từ Db */}
            {[...Array(hotel.starRating || 0)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
          </div>
          {hotel.locationName && (
            <span className="text-xs uppercase tracking-widest text-[#747878] border border-[#e5e0d8] px-3 py-1 bg-[#faf9f6]">
              {hotel.locationName}
            </span>
          )}
        </div>
        
        <h1 className="text-3xl md:text-5xl font-serif text-[#1c1c19] mb-4">{hotel.name}</h1>
        
        {hotel.address && (
          <p className="flex items-center gap-2 text-sm text-[#747878]">
            <MapPin className="h-4 w-4 text-[#B59A5A]" /> {hotel.address}
          </p>
        )}
      </div>

      {/* 2. Ảnh Gallery (Tận dụng list Images từ Backend) */}
      {hotel.images && hotel.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="md:col-span-2 h-[500px] overflow-hidden">
            <img 
              src={hotel.images[0]} 
              alt={hotel.name} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
            />
          </div>
          <div className="grid grid-rows-2 gap-4 h-[500px]">
            <div className="overflow-hidden">
              <img 
                src={hotel.images[1] || hotel.images[0]} 
                alt="Chi tiết 1" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
              />
            </div>
            <div className="overflow-hidden">
              <img 
                src={hotel.images[2] || hotel.images[0]} 
                alt="Chi tiết 2" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Nội dung Chi tiết & Danh sách Phòng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Khối Trái: Mô tả Khách sạn */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1c1c19] mb-4">
              Về không gian này
            </h3>
            <p className="text-[#555] leading-relaxed text-justify whitespace-pre-line font-light">
              {hotel.description || "Chưa có bài mô tả cho không gian lưu trú này."}
            </p>
          </div>
        </div>

        {/* Khối Phải: Hạng Phòng & Logic Đặt Phòng */}
        <div className="lg:col-span-1">
          <div className="border border-[#e5e0d8] p-6 bg-white sticky top-32 shadow-sm">
            <h3 className="text-sm uppercase tracking-widest font-semibold border-b border-[#e5e0d8] pb-4 mb-4 text-[#1c1c19]">
              Hạng phòng khả dụng
            </h3>
            
            <div className="space-y-5">
              {hotel.roomTypes.length === 0 ? (
                <p className="text-sm text-[#747878] italic">Chưa có dữ liệu phòng.</p>
              ) : (
                hotel.roomTypes.map((room) => {
                  const isAvailable = room.availableRooms > 0;

                  return (
                    <div 
                      key={room.id} 
                      className={`p-5 border ${isAvailable ? 'bg-[#faf9f6] border-[#e5e0d8]' : 'bg-gray-50 border-gray-200 opacity-70'} flex flex-col gap-4`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif text-[#1c1c19] text-lg">{room.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-[#747878] mt-2">
                            <Users className="w-4 h-4" /> Tối đa {room.capacity} khách
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end pt-4 border-t border-[#e5e0d8]/60">
                        <div>
                          <span className="text-lg font-semibold text-[#B59A5A]">
                            {room.basePrice.toLocaleString('vi-VN')} ₫
                          </span>
                          <span className="text-[10px] text-[#747878] uppercase block mt-1">/ đêm</span>
                        </div>
                        
                        {/* Logic Button phụ thuộc vào AvailableRooms từ C# */}
                        {isAvailable ? (
                          <div className="text-right">
                            <p className="text-xs text-green-700 mb-2 font-medium">Còn {room.availableRooms} phòng</p>
                            <Link 
                              to={`/booking?roomId=${room.id}`}
                              className="px-5 py-2.5 bg-[#1c1c19] text-white text-xs uppercase tracking-wider hover:bg-[#B59A5A] hover:text-[#1c1c19] transition-all duration-300"
                            >
                              Chọn phòng
                            </Link>
                          </div>
                        ) : (
                          <div className="text-right flex flex-col items-end">
                            <p className="text-xs text-red-600 mb-2 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Hết phòng
                            </p>
                            <button disabled className="px-5 py-2.5 bg-gray-200 text-gray-500 text-xs uppercase tracking-wider cursor-not-allowed">
                              Đã bán hết
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};