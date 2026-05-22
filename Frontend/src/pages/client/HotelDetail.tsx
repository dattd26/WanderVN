import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Users, AlertCircle, Check, ChevronLeft, ChevronRight  } from 'lucide-react';


// 1. Interfaces ánh xạ chính xác 100% với DTO trong C# của anh
interface RoomTypeInfo {
  id: number;
  name: string;
  basePrice: number;
  capacity: number;
  availableRooms: number;
  images?: string[];
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
// Component Slider vuốt ảnh siêu nhẹ (Chỉ dùng riêng trong trang này)
const RoomImageSlider = ({ images, fallback }: { images?: string[], fallback: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayImages = images && images.length > 0 ? images : [fallback];

  const next = () => setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden mb-3 group rounded-md">
      <img src={displayImages[currentIndex]} alt="Room" className="w-full h-full object-cover transition-all duration-500" />
      {displayImages.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><ChevronLeft className="w-4 h-4"/></button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><ChevronRight className="w-4 h-4"/></button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayImages.map((_, idx) => (
              <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-110' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const HotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<HotelDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  // Thêm state quản lý số lượng phòng đang chọn cho từng hạng phòng
  const [selectedRooms, setSelectedRooms] = useState<Record<number, number>>({});

  const handleQtyChange = (roomId: number, qty: number) => {
    setSelectedRooms(prev => ({ ...prev, [roomId]: qty }));
  };

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

     {/* 3. Nội dung Mô tả (Đã cho full width) */}
      <div className="mb-16">
        <h3 className="text-sm uppercase tracking-[0.2em] font-semibold text-[#1c1c19] mb-4 border-b border-[#e5e0d8] pb-4">
          Về không gian này
        </h3>
        <p className="text-[#555] leading-relaxed text-justify whitespace-pre-line font-light max-w-4xl">
          {hotel.description || "Chưa có bài mô tả cho không gian lưu trú này."}
        </p>
      </div>

      {/* 4. Danh sách Hạng Phòng (Layout chuẩn OTA - Tách riêng từng phòng) */}
      <div>
        <h3 className="text-2xl font-serif text-[#1c1c19] mb-6">
          Các lựa chọn phòng trống
        </h3>

        <div className="space-y-6">
          {hotel.roomTypes.length === 0 ? (
            <p className="text-sm text-[#747878] italic">Chưa có dữ liệu phòng.</p>
          ) : (
            hotel.roomTypes.map((room) => {
              const isAvailable = room.availableRooms > 0;

              return (
                <div key={room.id} className="border border-[#e5e0d8] bg-white rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row">
                  
                  {/* Cột Trái: Thông tin phòng & Ảnh Slider */}
                  <div className="w-full md:w-[320px] p-4 bg-[#f2f6fa] border-r border-[#e5e0d8] shrink-0">
                    <h4 className="font-bold text-[#1c1c19] text-lg mb-3 leading-tight">{room.name}</h4>
                    
                    {/* Sử dụng Component Slider vừa tạo ở trên */}
                    <RoomImageSlider images={room.images} fallback={hotel.images[0]} />
                    
                    <div className="text-sm text-[#555] space-y-2 mt-4">
                      <p className="flex items-center gap-2 text-gray-800"><Users className="w-4 h-4 text-gray-500" /> Tối đa {room.capacity} khách</p>
                      <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600"/> Không hút thuốc</p>
                      <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600"/> Wifi miễn phí</p>
                    </div>
                  </div>

                  {/* Cột Phải: Bảng danh sách TỪNG PHÒNG cụ thể */}
                  <div className="w-full flex-1 flex flex-col">
                    {/* Header của bảng */}
                    <div className="hidden md:grid grid-cols-12 gap-4 border-b border-[#e5e0d8] p-3 text-xs font-bold text-gray-600 bg-white uppercase tracking-wide">
                      <div className="col-span-5">Lựa chọn phòng</div>
                      <div className="col-span-2 text-center">Khách</div>
                      <div className="col-span-3 text-right">Giá/phòng/đêm</div>
                      <div className="col-span-2 text-center">Phòng</div>
                    </div>

                    {/* Lặp ra TỪNG PHÒNG dựa trên availableRooms */}
                    <div className="flex flex-col flex-1 bg-white">
                      {isAvailable ? (
                        Array.from({ length: room.availableRooms }).map((_, index) => (
                          <div key={index} className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-blue-50/50 transition-colors ${index !== room.availableRooms - 1 ? 'border-b border-[#e5e0d8]/50' : ''}`}>
                            
                            {/* Option Info */}
                            <div className="col-span-5 space-y-1.5">
                              <p className="font-semibold text-[15px] text-gray-800">
                                Phòng {index + 1}
                              </p>
                              <div className="text-xs text-[#0071c2] space-y-1 mt-2">
                                <p className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 shrink-0"/> Thanh toán tại khách sạn</p>
                                <p className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 shrink-0"/> Không được hoàn tiền</p>
                              </div>
                            </div>

                            {/* Guests */}
                            <div className="col-span-2 flex justify-center text-gray-600">
                              <div className="flex gap-0.5">
                                {/* Vẽ icon User theo số capacity, tối đa 4 icon để đỡ rối */}
                                {Array.from({ length: Math.min(room.capacity, 4) }).map((_, i) => <Users key={i} className="w-4 h-4" />)}
                                {room.capacity > 4 && <span className="text-xs font-bold self-center">+{room.capacity - 4}</span>}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="col-span-3 text-right">
                              <div className="text-xs text-gray-400 line-through mb-0.5">
                                {(room.basePrice * 1.25).toLocaleString('vi-VN')} VND
                              </div>
                              <div className="text-lg font-bold text-[#e12d2d]">
                                {room.basePrice.toLocaleString('vi-VN')} VND
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5">Chưa bao gồm thuế và phí</div>
                            </div>

                            {/* Action (Button màu xanh chuẩn Agoda/Traveloka) */}
                            <div className="col-span-2 flex flex-col items-center justify-center gap-2 md:pl-2">
                              <span className="text-xs text-gray-600 font-medium hidden md:block">x1</span>
                              <Link 
                                to={`/booking?roomId=${room.id}&roomIndex=${index + 1}`}
                                className="px-6 py-2 w-full md:w-auto text-center bg-[#0071c2] hover:bg-[#005999] text-white text-sm font-semibold rounded shadow-sm transition-all"
                              >
                                Chọn
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                          <p className="text-gray-800 font-semibold mb-1">Đã bán hết</p>
                          <p className="text-sm text-gray-500">Rất tiếc, hạng phòng này không còn trống trong ngày bạn chọn.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
        </div>
     
  );
};