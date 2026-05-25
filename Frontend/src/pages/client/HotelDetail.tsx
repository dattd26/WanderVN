import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Users, AlertCircle, Check, ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';

// Nhập service và kiểu dữ liệu dùng chung của hệ thống
import { hotelService } from '../../services';
import type { HotelDetailDto } from '../../types';
// Component Slider vuốt ảnh siêu nhẹ (Chỉ dùng riêng trong trang này)
// Component Slider vuốt ảnh lấy chuẩn từ RoomTypeImages, có bộ đếm ảnh
const RoomImageSlider = ({ images }: { images?: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Nếu không có ảnh hoặc mảng rỗng, hiển thị khung trống báo lỗi (Không lấy ké ảnh khách sạn)
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs rounded-md border border-gray-200 mb-3">
        Chưa cập nhật ảnh phòng
      </div>
    );
  }

  const next = (e: React.MouseEvent) => { e.preventDefault(); setCurrentIndex((prev) => (prev + 1) % images.length); };
  const prev = (e: React.MouseEvent) => { e.preventDefault(); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); };

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden mb-3 group rounded-md border border-gray-200 shadow-sm">
      <img src={images[currentIndex]} alt="Room view" className="w-full h-full object-cover transition-all duration-300 select-none" />
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"><ChevronRight className="w-4 h-4" /></button>

          {/* Số đếm góc phải ảnh chuẩn Agoda / Traveloka */}
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium z-10">
            {currentIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
};

export const HotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [hotel, setHotel] = useState<HotelDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Khởi tạo ngày nhận và trả phòng từ URL hoặc mặc định hôm nay và ngày mai
  const initialCheckIn = searchParams.get('checkInDate') || new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const initialCheckOut = searchParams.get('checkOutDate') || tomorrow.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState<string>(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState<string>(initialCheckOut);

  // Tính số đêm nghỉ dưỡng
  const nights = Math.max(1, Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)));

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  useEffect(() => {
    if (!id) return;

    // Sử dụng hotelService tập trung thông qua apiClient để gọn nhẹ và tự động hóa xử lý
    hotelService.getHotelDetail(id)
      .then(data => {
        setHotel(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy thông tin khách sạn từ hệ thống:", err);
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

      {/* 2. Ảnh Gallery (Đã có sự kiện Click mở Modal) */}
      {hotel.images && hotel.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {/* Ảnh lớn bên trái */}
          <div
            className="md:col-span-2 h-[500px] overflow-hidden rounded-l-lg cursor-pointer group"
            onClick={() => openGallery(0)}
          >
            <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>

          <div className="grid grid-rows-2 gap-4 h-[500px]">
            {/* Ảnh nhỏ phía trên */}
            <div
              className="overflow-hidden rounded-tr-lg cursor-pointer group"
              onClick={() => openGallery(1)}
            >
              <img src={hotel.images[1] || hotel.images[0]} alt="Chi tiết 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>

            {/* Ô ảnh thứ 3 (Có overlay +5) */}
            <div
              className="overflow-hidden rounded-br-lg relative group cursor-pointer"
              onClick={() => openGallery(2)}
            >
              <img src={hotel.images[2] || hotel.images[0]} alt="Chi tiết 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              {hotel.images.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-colors group-hover:bg-black/50">
                  <span className="text-white text-3xl font-bold">+{hotel.images.length - 3}</span>
                </div>
              )}
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

      {/* 4. Chọn thời gian lưu trú & Danh sách Hạng Phòng (Layout chuẩn OTA) */}
      <div className="mb-10 p-6 bg-[#faf9f6] border border-[#e5e0d8] rounded-lg shadow-sm">
        <h3 className="text-lg font-serif text-[#1c1c19] mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#B59A5A]" />
          Chọn Thời Gian Lưu Trú
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[#747878] font-medium">Ngày Nhận Phòng</label>
            <input
              type="date"
              value={checkInDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setCheckInDate(e.target.value);
                if (new Date(e.target.value) >= new Date(checkOutDate)) {
                  const nextDay = new Date(new Date(e.target.value).getTime() + 86400000).toISOString().split('T')[0];
                  setCheckOutDate(nextDay);
                }
              }}
              className="px-4 py-2.5 border border-[#e5e0d8] bg-white rounded font-body-md text-sm text-[#1c1c19] focus:outline-none focus:border-[#B59A5A]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[#747878] font-medium">Ngày Trả Phòng</label>
            <input
              type="date"
              value={checkOutDate}
              min={new Date(new Date(checkInDate).getTime() + 86400000).toISOString().split('T')[0]}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="px-4 py-2.5 border border-[#e5e0d8] bg-white rounded font-body-md text-sm text-[#1c1c19] focus:outline-none focus:border-[#B59A5A]"
            />
          </div>
          <div className="text-center md:text-left md:pl-6">
            <p className="text-sm text-[#747878] font-light">
              Thời gian lưu trú: <span className="font-bold text-[#B59A5A] text-lg">{nights} đêm</span>
            </p>
            <p className="text-[11px] text-[#9b9995] mt-1">
              Giá phòng sẽ được tự động nhân theo số đêm tại trang thanh toán.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h3 className="text-2xl font-serif text-[#1c1c19] mb-6">
          Các Phòng có sẵn tại {hotel.name}
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
                    <RoomImageSlider images={room.images} />

                    <div className="text-sm text-[#555] space-y-2 mt-4">
                      <p className="flex items-center gap-2 text-gray-800"><Users className="w-4 h-4 text-gray-500" /> Tối đa {room.capacity} khách</p>
                      <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Không hút thuốc</p>
                      <p className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Wifi miễn phí</p>
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
                                <p className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Thanh toán tại khách sạn</p>
                                <p className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Không được hoàn tiền</p>
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

                            {/* Action (Nút chọn màu sắc và thiết kế sang trọng) */}
                            <div className="col-span-2 flex flex-col items-center justify-center gap-2 md:pl-2">
                              <span className="text-xs text-gray-600 font-medium hidden md:block">x1</span>
                              <Link
                                to={`/booking?hotelId=${hotel.id}&roomTypeId=${room.id}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`}
                                className="px-6 py-2 w-full md:w-auto text-center bg-[#B59A5A] hover:bg-[#9E8448] text-white text-xs font-semibold rounded shadow-sm transition-all uppercase tracking-wider"
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
      {/* 🔥 BƯỚC 3: GIAO DIỆN MODAL XEM ẢNH FULL MÀN HÌNH */}
      {isGalleryOpen && hotel.images && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          {/* Nút Tắt */}
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Nút Lùi */}
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length); }}
            className="absolute left-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          {/* Ảnh đang xem */}
          <img
            src={hotel.images[currentImageIndex]}
            alt={`Gallery ${currentImageIndex}`}
            className="max-h-[90vh] max-w-[90vw] object-contain select-none"
          />

          {/* Nút Tiến */}
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length); }}
            className="absolute right-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Bộ đếm dưới đáy */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white font-medium bg-black/50 px-4 py-2 rounded-full text-sm">
            {currentImageIndex + 1} / {hotel.images.length}
          </div>
        </div>
      )}

    </div>

  );
};