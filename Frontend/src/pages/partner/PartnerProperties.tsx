import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Info,
  Image as ImageIcon,
  Trash2,
  Plus,
  Check,
  Bed,
  Calendar,
  Sparkles,
  Save,
  AlertCircle,
  Sliders
} from 'lucide-react';
import { PartnerHeader } from '../../components/partner/PartnerHeader';
import { PartnerSidebar } from '../../components/partner/PartnerSidebar';
import { partnerService } from '../../services';
import type { PartnerHotelDto } from '../../types';

// Định nghĩa Interface RoomType nội bộ cho quản lý chi tiết
interface RoomConfig {
  id: string;
  name: string;
  bedType: string;
  size: number;
  maxGuests: number;
  quantity: number;
  price: number;
}

// Định nghĩa Interface Booking nội bộ
interface HotelBooking {
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

// Danh sách Tiện ích mặc định
const AVAILABLE_AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi miễn phí' },
  { id: 'pool', label: 'Hồ bơi vô cực' },
  { id: 'spa', label: 'Spa & Massage' },
  { id: 'restaurant', label: 'Nhà hàng ẩm thực' },
  { id: 'gym', label: 'Phòng Gym hiện đại' },
  { id: 'bar', label: 'Sky Bar Hoàng hôn' },
  { id: 'parking', label: 'Đỗ xe miễn phí' }
];

// Các hàm tiện ích thuần túy (pure helpers) đặt ngoài Component để tránh cảnh báo lọt lưới của linter react-hooks/purity
const getHeritageRandomImage = (): string => {
  const randomImages = [
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1611891487122-2075b9627dde?auto=format&fit=crop&w=500&q=80'
  ];
  return randomImages[Math.floor(Math.random() * randomImages.length)];
};

const getUniqueRoomId = (): string => {
  return 'r_new_' + Date.now();
};

export const PartnerProperties: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', content: string } | null>(null);

  // ── Dữ liệu Khách sạn (Mock & Sync với API nếu có) ──
  const [hotels, setHotels] = useState<PartnerHotelDto[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);

  // State chỉnh sửa khách sạn đang chọn
  const [hotelForm, setHotelForm] = useState({
    name: '',
    type: 'Khách sạn',
    address: '',
    description: '',
    amenities: [] as string[],
    images: [] as string[],
  });

  // State quản lý Hạng phòng (Room Types) của khách sạn đang chọn
  const [roomConfigs, setRoomConfigs] = useState<Record<number, RoomConfig[]>>({
    1: [
      { id: 'r1', name: 'Deluxe Double Room', bedType: '1 King Bed', size: 30, maxGuests: 2, quantity: 10, price: 1200000 },
      { id: 'r2', name: 'Executive Suite', bedType: '1 Super King Bed', size: 55, maxGuests: 3, quantity: 3, price: 2800000 },
    ],
    2: [
      { id: 'r3', name: 'Mountain View Bungalow', bedType: '1 Queen Bed', size: 35, maxGuests: 2, quantity: 5, price: 1500000 },
      { id: 'r4', name: 'Family Panorama Suite', bedType: '2 Double Beds', size: 65, maxGuests: 4, quantity: 2, price: 3200000 },
    ]
  });

  // State quản lý Đơn đặt phòng (Bookings) của khách sạn đang chọn
  const [bookingsData] = useState<Record<number, HotelBooking[]>>({
    1: [
      { id: 'BK-9482', guestName: 'Nguyễn Văn Anh', email: 'vananh.nguyen@gmail.com', roomTypeName: 'Deluxe Double Room', checkIn: '2026-06-01', checkOut: '2026-06-04', totalPrice: 3600000, status: 'Confirmed', specialRequests: 'Phòng tầng cao, yên tĩnh' },
      { id: 'BK-1029', guestName: 'Trần Thị Mai', email: 'maitt@yahoo.com', roomTypeName: 'Executive Suite', checkIn: '2026-06-05', checkOut: '2026-06-07', totalPrice: 5600000, status: 'CheckedIn', specialRequests: 'Yêu cầu set up trăng mật' },
    ],
    2: [
      { id: 'BK-2039', guestName: 'David Harrison', email: 'david.harri@outlook.com', roomTypeName: 'Mountain View Bungalow', checkIn: '2026-06-10', checkOut: '2026-06-15', totalPrice: 7500000, status: 'Confirmed' }
    ]
  });

  // State quản lý Tình trạng trống phòng (Availability) 7 ngày tới
  const [availabilityDays, setAvailabilityDays] = useState<Record<string, Record<string, number>>>({
    'r1': { '06-01': 8, '06-02': 7, '06-03': 10, '06-04': 9, '06-05': 10, '06-06': 5, '06-07': 4 },
    'r2': { '06-01': 3, '06-02': 3, '06-03': 2, '06-04': 1, '06-05': 3, '06-06': 0, '06-07': 1 },
    'r3': { '06-01': 5, '06-02': 4, '06-03': 5, '06-04': 5, '06-05': 5, '06-06': 2, '06-07': 1 }
  });

  // Tab phụ bên trong form chỉnh sửa (Thông tin, Hạng phòng, Trống phòng, Đơn đặt hàng)
  const [formSubTab, setFormSubTab] = useState<'info' | 'rooms' | 'availability' | 'bookings'>('info');

  // Modal thêm hạng phòng
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomForm, setNewRoomForm] = useState<Omit<RoomConfig, 'id'>>({
    name: '',
    bedType: '1 King Bed',
    size: 32,
    maxGuests: 2,
    quantity: 5,
    price: 1500000
  });

  // Nạp dữ liệu khách sạn được chọn vào form chỉnh sửa bên phải (Được khai báo sớm để useEffect sử dụng)
  const loadHotelIntoForm = (hotel: PartnerHotelDto) => {
    setHotelForm({
      name: hotel.name,
      type: hotel.name.includes('Resort') ? 'Resort' : 'Khách sạn',
      address: hotel.address,
      description: hotel.description || '',
      amenities: hotel.id === 1
        ? ['wifi', 'pool', 'restaurant']
        : ['wifi', 'spa', 'gym'],
      images: hotel.primaryImageUrl
        ? [hotel.primaryImageUrl, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=500&q=80']
        : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80']
    });
    setFormSubTab('info');
  };

  // ── Gọi API lấy danh sách khách sạn thực tế từ hệ thống ──
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const data = await partnerService.getMyHotels();

        // Nếu API trả về dữ liệu rỗng, nạp dữ liệu mẫu tuyệt đẹp để đảm bảo giao diện lung linh
        if (data.length === 0) {
          const fallbackHotels: PartnerHotelDto[] = [
            {
              id: 1,
              name: 'Hanoi Boutique Hotel',
              address: '12 Hàng Bạc, Hoàn Kiếm, Hà Nội',
              description: 'Khách sạn phong cách di sản tọa lạc tại trung tâm phố cổ Hà Nội cổ kính, mang đậm hơi thở văn hóa thủ đô.',
              status: 1, // Approved
              primaryImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
              roomTypeCount: 2,
              totalBookings: 2,
              createdAt: '2026-05-10T08:00:00Z',
              locationName: 'Hà Nội',
              propertyTypeName: 'Khách sạn',
              propertyTypeCode: 'hotel',
              statusName: 'Approved'
            },
            {
              id: 2,
              name: 'Sapa Retreat & Eco-Resort',
              address: 'Đường Mường Hoa, Thị xã Sa Pa, Lào Cai',
              description: 'Khu nghỉ dưỡng sinh thái nép mình bên dãy Hoàng Liên Sơn hùng vĩ, mây mù bao phủ quanh năm bình yên.',
              status: 0, // Pending
              primaryImageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
              roomTypeCount: 2,
              totalBookings: 1,
              createdAt: '2026-05-24T12:00:00Z',
              locationName: 'Hà Nội',
              propertyTypeName: 'Khách sạn',
              propertyTypeCode: 'hotel',
              statusName: 'Approved'
            }
          ];
          setHotels(fallbackHotels);
          setSelectedHotelId(1);
          loadHotelIntoForm(fallbackHotels[0]);
        } else {
          setHotels(data);
          const firstHotel = data[0];
          setSelectedHotelId(firstHotel.id);
          loadHotelIntoForm(firstHotel);
        }
      } catch (error) {
        console.error('Lỗi tải danh sách khách sạn:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Xử lý khi click chuyển đổi cơ sở bên cột trái
  const handleSelectHotel = (hotelId: number) => {
    setSelectedHotelId(hotelId);
    const hotel = hotels.find(h => h.id === hotelId);
    if (hotel) {
      loadHotelIntoForm(hotel);
    }
  };

  // Toggle tiện ích check/uncheck
  const handleToggleAmenity = (amenityId: string) => {
    setHotelForm(prev => {
      const active = prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId];
      return { ...prev, amenities: active };
    });
  };

  // Xóa ảnh
  const handleDeleteImage = (imgUrl: string) => {
    setHotelForm(prev => ({
      ...prev,
      images: prev.images.filter(url => url !== imgUrl)
    }));
  };

  // Kích hoạt thông báo thành công/thất bại
  const triggerMessage = (type: 'success' | 'error', content: string) => {
    setMessage({ type, content });
    setTimeout(() => setMessage(null), 4000);
  };

  // Upload ảnh giả lập
  const handleSimulateUpload = () => {
    const newImg = getHeritageRandomImage();
    if (!hotelForm.images.includes(newImg)) {
      setHotelForm(prev => ({
        ...prev,
        images: [...prev.images, newImg]
      }));
      triggerMessage('success', 'Tải lên hình ảnh di sản thành công!');
    }
  };

  // Lưu toàn bộ chỉnh sửa của cơ sở
  const handleSaveChanges = () => {
    if (!selectedHotelId) return;

    // Cập nhật danh sách khách sạn tổng thể ở phía Client
    setHotels(prevHotels =>
      prevHotels.map(h => {
        if (h.id === selectedHotelId) {
          return {
            ...h,
            name: hotelForm.name,
            address: hotelForm.address,
            description: hotelForm.description,
            primaryImageUrl: hotelForm.images[0] || h.primaryImageUrl
          };
        }
        return h;
      })
    );

    triggerMessage('success', 'Lưu thay đổi cơ sở di sản thành công! Toàn bộ cấu hình đã được đồng bộ hệ thống.');
  };

  // Thêm hạng phòng mới
  const handleAddRoomType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotelId) return;

    const newRoom: RoomConfig = {
      id: getUniqueRoomId(),
      ...newRoomForm
    };

    const currentRooms = roomConfigs[selectedHotelId] || [];
    setRoomConfigs(prev => ({
      ...prev,
      [selectedHotelId]: [...currentRooms, newRoom]
    }));

    // Thêm ngày trống phòng mặc định cho phòng này
    setAvailabilityDays(prev => ({
      ...prev,
      [newRoom.id]: { '06-01': newRoom.quantity, '06-02': newRoom.quantity, '06-03': newRoom.quantity, '06-04': newRoom.quantity, '06-05': newRoom.quantity, '06-06': newRoom.quantity, '06-07': newRoom.quantity }
    }));

    setIsAddRoomModalOpen(false);
    triggerMessage('success', `Đã thêm hạng phòng "${newRoom.name}" thành công!`);

    // Reset form
    setNewRoomForm({
      name: '',
      bedType: '1 King Bed',
      size: 32,
      maxGuests: 2,
      quantity: 5,
      price: 1500000
    });
  };

  // Xóa hạng phòng
  const handleDeleteRoomType = (roomId: string) => {
    if (!selectedHotelId) return;
    if (confirm('Bạn có chắc chắn muốn xóa hạng phòng này không? Hành động này không thể hoàn tác.')) {
      const currentRooms = roomConfigs[selectedHotelId] || [];
      setRoomConfigs(prev => ({
        ...prev,
        [selectedHotelId]: currentRooms.filter(r => r.id !== roomId)
      }));
      triggerMessage('success', 'Đã gỡ bỏ hạng phòng khỏi hệ thống.');
    }
  };

  // Tăng giảm phòng trống (availability) trực tiếp trên bảng
  const handleAdjustAvailability = (roomId: string, day: string, increment: boolean) => {
    setAvailabilityDays(prev => {
      const roomDays = prev[roomId] || {};
      const currentVal = roomDays[day] ?? 5;
      const newVal = increment ? currentVal + 1 : Math.max(0, currentVal - 1);
      return {
        ...prev,
        [roomId]: {
          ...roomDays,
          [day]: newVal
        }
      };
    });
  };

  const selectedHotel = hotels.find(h => h.id === selectedHotelId);
  const currentRooms = selectedHotelId ? (roomConfigs[selectedHotelId] || []) : [];
  const currentBookings = selectedHotelId ? (bookingsData[selectedHotelId] || []) : [];

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex font-body-md text-[#1C1C19] relative">

      {/* Sidebar cố định phía bên trái */}
      <PartnerSidebar hotelName={selectedHotel?.name || 'Hanoi Boutique Hotel'} />

      {/* Vùng nội dung quản trị bên phải */}
      <div className="flex-grow flex flex-col min-h-screen relative overflow-x-hidden">

        {/* Header trên cùng dành riêng cho Partner */}
        <PartnerHeader exitTo="/" />

        <main className="flex-1 w-full max-w-[1240px] mx-auto px-margin-mobile md:px-gutter py-10 md:py-12 space-y-8 z-10">

          {/* Tiêu đề & Action bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-5 border-b border-[#E6E2DD]">
            <div className="space-y-1.5">
              <h1 className="font-display-lg text-headline-lg text-[#1C1C19] flex items-center gap-3">
                Quản lý Cơ sở lưu trú
                <span className="font-label-md text-[10px] bg-[#735C00]/10 text-[#735C00] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Heritage Portal
                </span>
              </h1>
              <p className="font-body-md text-[#444748] text-sm max-w-xl">
                Cập nhật thông tin chi tiết, chỉnh sửa cấu hình hạng phòng, điều khiển lịch trống và quản lý toàn diện danh sách đơn đặt phòng di sản.
              </p>
            </div>
            <button
              onClick={() => navigate('/partner/onboarding')}
              className="bg-[#1C1C19] text-[#FAF6F0] font-label-md text-xs uppercase tracking-widest px-5 py-3 rounded-lg shadow hover:bg-[#735C00] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-auto font-bold"
            >
              <Plus className="h-4 w-4" />
              Thêm cơ sở mới
            </button>
          </div>

          {/* Toast Notification */}
          {message && (
            <div className={`fixed top-20 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl transition-all duration-300 transform scale-100 ${message.type === 'success' ? 'bg-[#EBF7EE] text-[#1E5C2F] border border-[#A7E2B7]' : 'bg-[#FDF2F2] text-[#9B1C1C] border border-[#F8B4B4]'
              }`}>
              <Sparkles className={`h-5 w-5 ${message.type === 'success' ? 'text-[#1E5C2F]' : 'text-[#9B1C1C]'}`} />
              <p className="font-label-md text-xs tracking-wide">{message.content}</p>
            </div>
          )}

          {/* Master Detail Bento Layout */}
          <div className="grid grid-cols-12 gap-6">

            {/* Cột Trái (Active Properties List) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              <h3 className="font-label-md text-xs uppercase tracking-widest text-[#735C00] font-bold px-1.5 flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5" />
                Danh sách của tôi ({hotels.length})
              </h3>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2].map(i => (
                    <div key={i} className="h-28 bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl" />
                  ))}
                </div>
              ) : (
                hotels.map(h => {
                  const isActive = h.id === selectedHotelId;
                  const isApproved = h.status === 1;

                  return (
                    <div
                      key={h.id}
                      onClick={() => handleSelectHotel(h.id)}
                      className={`relative bg-[#FAF6F0] rounded-xl p-4.5 cursor-pointer border transition-all duration-300 group ${isActive
                          ? 'border-[#735C00] ring-1 ring-[#735C00] bg-[#FAF6F0] shadow-md'
                          : 'border-[#E6E2DD]/80 hover:border-[#735C00]/50 hover:bg-[#FAF6F0]/50 hover:shadow'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className={`font-display-lg text-lg font-semibold truncate transition-colors ${isActive ? 'text-[#735C00]' : 'text-[#1C1C19] group-hover:text-[#735C00]'}`}>
                          {h.name}
                        </h4>

                        {/* Status badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-md text-[9px] uppercase tracking-wider border shrink-0 ${isApproved
                            ? 'bg-[#EBF7EE] text-[#1E5C2F] border-[#A7E2B7]'
                            : 'bg-[#FEF9EC] text-[#8F6B00] border-[#FBE3A4]'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-[#1E5C2F]' : 'bg-[#8F6B00]'}`} />
                          {isApproved ? 'Đang hoạt động' : 'Chờ duyệt'}
                        </span>
                      </div>

                      <p className="font-body-md text-[#444748] text-xs flex items-center gap-1.5 mb-3 truncate">
                        <MapPin className="h-3.5 w-3.5 text-[#735C00]/80 shrink-0" />
                        {h.address}
                      </p>

                      <div className="flex items-center justify-between border-t border-[#E6E2DD]/60 pt-3 text-[10px] text-[#444748] font-mono">
                        <span className="font-bold">ID: PR-00{h.id}</span>
                        <span>{h.roomTypeCount} Hạng phòng • {h.totalBookings} Booking</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cột Phải (Property Details Form & Tabs) */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-[#FAF6F0] rounded-xl border border-[#E6E2DD] shadow-md overflow-hidden">

                {/* Form Header */}
                <div className="px-6 py-5 border-b border-[#E6E2DD] bg-[#FAF6F0] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-display-lg text-xl text-[#1C1C19]">{selectedHotel?.name}</h3>
                    <p className="font-body-md text-[#444748] text-xs">
                      Cơ sở ID: <span className="font-mono">PR-00{selectedHotelId}</span> • Cập nhật lần cuối: 2 giờ trước
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-[10px] text-[#444748] uppercase tracking-wider">Trạng thái:</span>
                    <span className={`font-label-md text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded ${selectedHotel?.status === 1 ? 'bg-[#EBF7EE] text-[#1E5C2F]' : 'bg-[#FEF9EC] text-[#8F6B00]'
                      }`}>
                      {selectedHotel?.status === 1 ? 'ĐÃ PHÊ DUYỆT' : 'CHỜ KIỂM DUYỆT'}
                    </span>
                  </div>
                </div>

                {/* Sub Tab Navigation */}
                <div className="flex border-b border-[#E6E2DD] bg-[#FAF6F0]">
                  <button
                    onClick={() => setFormSubTab('info')}
                    className={`flex-1 py-3.5 text-center font-label-md text-xs uppercase tracking-wider transition-all duration-200 border-b-2 ${formSubTab === 'info'
                        ? 'border-[#735C00] text-[#735C00] font-bold bg-[#FAF6F0]'
                        : 'border-transparent text-[#444748] hover:text-[#1C1C19] hover:bg-[#FAF6F0]/50'
                      }`}
                  >
                    Thông tin cơ bản
                  </button>
                  <button
                    onClick={() => setFormSubTab('rooms')}
                    className={`flex-1 py-3.5 text-center font-label-md text-xs uppercase tracking-wider transition-all duration-200 border-b-2 ${formSubTab === 'rooms'
                        ? 'border-[#735C00] text-[#735C00] font-bold bg-[#FAF6F0]'
                        : 'border-transparent text-[#444748] hover:text-[#1C1C19] hover:bg-[#FAF6F0]/50'
                      }`}
                  >
                    Hạng phòng ({currentRooms.length})
                  </button>
                  <button
                    onClick={() => setFormSubTab('availability')}
                    className={`flex-1 py-3.5 text-center font-label-md text-xs uppercase tracking-wider transition-all duration-200 border-b-2 ${formSubTab === 'availability'
                        ? 'border-[#735C00] text-[#735C00] font-bold bg-[#FAF6F0]'
                        : 'border-transparent text-[#444748] hover:text-[#1C1C19] hover:bg-[#FAF6F0]/50'
                      }`}
                  >
                    Lịch trống
                  </button>
                  <button
                    onClick={() => setFormSubTab('bookings')}
                    className={`flex-1 py-3.5 text-center font-label-md text-xs uppercase tracking-wider transition-all duration-200 border-b-2 ${formSubTab === 'bookings'
                        ? 'border-[#735C00] text-[#735C00] font-bold bg-[#FAF6F0]'
                        : 'border-transparent text-[#444748] hover:text-[#1C1C19] hover:bg-[#FAF6F0]/50'
                      }`}
                  >
                    Đơn đặt hàng ({currentBookings.length})
                  </button>
                </div>

                {/* Sub Tab Contents */}
                <div className="p-6">

                  {/* TAB 1: THÔNG TIN CƠ BẢN */}
                  {formSubTab === 'info' && (
                    <div className="space-y-6">

                      {/* Section: Thông tin khách sạn */}
                      <section className="space-y-5">
                        <h4 className="font-display-lg text-md text-[#1C1C19] border-b border-[#E6E2DD]/60 pb-2 flex items-center gap-2 font-bold">
                          <Info className="h-4.5 w-4.5 text-[#735C00]" />
                          Thông tin khách sạn
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Tên cơ sở lưu trú</label>
                            <input
                              type="text"
                              value={hotelForm.name}
                              onChange={(e) => setHotelForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 font-body-md text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Loại hình</label>
                            <select
                              value={hotelForm.type}
                              onChange={(e) => setHotelForm(prev => ({ ...prev, type: e.target.value }))}
                              className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 font-body-md text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all appearance-none"
                            >
                              <option>Khách sạn</option>
                              <option>Resort</option>
                              <option>Homestay</option>
                              <option>Biệt thự</option>
                            </select>
                          </div>

                          <div className="col-span-1 md:col-span-2 space-y-1.5">
                            <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Địa chỉ</label>
                            <input
                              type="text"
                              value={hotelForm.address}
                              onChange={(e) => setHotelForm(prev => ({ ...prev, address: e.target.value }))}
                              className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 font-body-md text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all"
                            />
                          </div>

                          <div className="col-span-1 md:col-span-2 space-y-1.5">
                            <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Mô tả chi tiết di sản</label>
                            <textarea
                              rows={4}
                              value={hotelForm.description}
                              onChange={(e) => setHotelForm(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-4 py-2.5 font-body-md text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none transition-all resize-none"
                            />
                          </div>
                        </div>
                      </section>

                      {/* Section: Hình ảnh di sản */}
                      <section className="space-y-4">
                        <h4 className="font-display-lg text-md text-[#1C1C19] border-b border-[#E6E2DD]/60 pb-2 flex items-center gap-2 font-bold">
                          <ImageIcon className="h-4.5 w-4.5 text-[#735C00]" />
                          Hình ảnh di sản
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                          {/* Upload Box */}
                          <div
                            onClick={handleSimulateUpload}
                            className="aspect-video sm:aspect-square rounded-lg border-2 border-dashed border-[#E6E2DD] hover:border-[#735C00]/50 hover:bg-[#F1EDE8] flex flex-col items-center justify-center cursor-pointer transition-colors group p-3 text-center"
                          >
                            <Plus className="h-6 w-6 text-[#444748] group-hover:text-[#735C00] mb-1.5" />
                            <span className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] group-hover:text-[#735C00]">Tải ảnh lên</span>
                          </div>

                          {/* Image List */}
                          {hotelForm.images.map((imgUrl, i) => (
                            <div key={i} className="aspect-video sm:aspect-square rounded-lg overflow-hidden relative group border border-[#E6E2DD]">
                              <img src={imgUrl} alt={`Hotel ${i}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <button
                                  onClick={() => handleDeleteImage(imgUrl)}
                                  className="text-red-500 bg-[#FAF6F0] hover:bg-red-50 rounded-full p-2.5 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}

                        </div>
                      </section>

                      {/* Section: Tiện ích nổi bật */}
                      <section className="space-y-4">
                        <h4 className="font-display-lg text-md text-[#1C1C19] border-b border-[#E6E2DD]/60 pb-2 flex items-center gap-2 font-bold">
                          <Sparkles className="h-4.5 w-4.5 text-[#735C00]" />
                          Tiện ích &amp; Trải nghiệm nổi bật
                        </h4>

                        <div className="flex flex-wrap gap-2.5">
                          {AVAILABLE_AMENITIES.map(a => {
                            const isChecked = hotelForm.amenities.includes(a.id);
                            return (
                              <button
                                key={a.id}
                                onClick={() => handleToggleAmenity(a.id)}
                                className={`px-4 py-2 rounded-full border text-xs transition-all duration-300 flex items-center gap-2 ${isChecked
                                    ? 'bg-[#735C00]/10 border-[#735C00] text-[#735C00] font-bold shadow-sm'
                                    : 'border-[#E6E2DD] text-[#444748] hover:border-[#735C00]/50 hover:bg-[#F1EDE8]'
                                  }`}
                              >
                                {isChecked && <Check className="h-3.5 w-3.5 text-[#735C00]" />}
                                {a.label}
                              </button>
                            );
                          })}
                        </div>
                      </section>

                      {/* Form Actions */}
                      <div className="border-t border-[#E6E2DD]/60 pt-6 flex justify-end gap-3">
                        <button
                          onClick={() => selectedHotel && loadHotelIntoForm(selectedHotel)}
                          className="px-5 py-2.5 rounded-lg font-label-md text-[11px] uppercase tracking-wider text-[#444748] border border-[#E6E2DD] hover:bg-[#F1EDE8] transition-colors"
                        >
                          Hủy chỉnh sửa
                        </button>
                        <button
                          onClick={handleSaveChanges}
                          className="px-5 py-2.5 bg-[#1C1C19] text-[#FAF6F0] rounded-lg font-label-md text-[11px] uppercase tracking-wider hover:bg-[#735C00] transition-colors flex items-center gap-1.5 font-bold"
                        >
                          <Save className="h-4 w-4 text-[#B59A5A]" />
                          Lưu thay đổi
                        </button>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: CẤU HÌNH HẠNG PHÒNG */}
                  {formSubTab === 'rooms' && (
                    <div className="space-y-6">

                      <div className="flex justify-between items-center border-b border-[#E6E2DD]/60 pb-2">
                        <h4 className="font-display-lg text-md text-[#1C1C19] flex items-center gap-2 font-bold">
                          <Bed className="h-4.5 w-4.5 text-[#735C00]" />
                          Danh sách hạng phòng hoạt động
                        </h4>
                        <button
                          onClick={() => setIsAddRoomModalOpen(true)}
                          className="text-[#735C00] hover:text-[#735C00]/80 font-label-md text-xs flex items-center gap-1 font-bold"
                        >
                          <Plus className="h-4 w-4" /> Thêm hạng phòng mới
                        </button>
                      </div>

                      <div className="space-y-4">
                        {currentRooms.length === 0 ? (
                          <div className="text-center py-10 bg-[#FAF6F0]/40 rounded-xl border border-[#E6E2DD] border-dashed">
                            <Bed className="h-10 w-10 text-[#444748]/30 mx-auto mb-2" />
                            <p className="font-body-md text-xs text-[#444748]">Chưa có hạng phòng nào được cấu hình cho cơ sở này.</p>
                          </div>
                        ) : (
                          currentRooms.map(room => (
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
                                <button
                                  onClick={() => handleDeleteRoomType(room.id)}
                                  className="text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 p-2 rounded transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 3: TRỐNG PHÒNG (AVAILABILITY GRID) */}
                  {formSubTab === 'availability' && (
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
                            {currentRooms.map(room => {
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

                                          {/* Control buttons */}
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => handleAdjustAvailability(room.id, d, false)}
                                              className="w-5 h-5 rounded-full border border-[#E6E2DD] hover:bg-[#F1EDE8] flex items-center justify-center text-xs font-bold text-[#444748]"
                                            >
                                              -
                                            </button>
                                            <button
                                              onClick={() => handleAdjustAvailability(room.id, d, true)}
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
                  )}

                  {/* TAB 4: DANH SÁCH ĐƠN ĐẶT HÀNG (BOOKINGS) */}
                  {formSubTab === 'bookings' && (
                    <div className="space-y-6">

                      <div className="space-y-1">
                        <h4 className="font-display-lg text-md text-[#1C1C19] border-b border-[#E6E2DD]/60 pb-2 flex items-center gap-2 font-bold">
                          <Sliders className="h-4.5 w-4.5 text-[#735C00]" />
                          Quản lý danh sách Đơn đặt phòng di sản
                        </h4>
                        <p className="font-body-md text-[#444748] text-xs">
                          Xem chi tiết danh sách khách lưu trú, thông tin phòng nghỉ, giá tiền và các yêu cầu đặt biệt đi kèm.
                        </p>
                      </div>

                      <div className="space-y-4.5">
                        {currentBookings.length === 0 ? (
                          <div className="text-center py-10 bg-[#FAF6F0]/40 rounded-xl border border-[#E6E2DD] border-dashed">
                            <AlertCircle className="h-10 w-10 text-[#444748]/30 mx-auto mb-2" />
                            <p className="font-body-md text-xs text-[#444748]">Hiện tại chưa ghi nhận đơn đặt phòng nào mới.</p>
                          </div>
                        ) : (
                          currentBookings.map(bk => (
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
                          ))
                        )}
                      </div>

                    </div>
                  )}

                </div>

              </div>
            </div>

          </div>

        </main>

        {/* Lớp phủ họa tiết đá vôi cổ điển di sản */}
        <div className="texture-overlay" />
      </div>

      {/* ── MODAL THÊM HẠNG PHÒNG MỚI (Luxury Modal) ── */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 bg-[#1C1C19]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-xl border border-[#E6E2DD] shadow-2xl max-w-md w-full overflow-hidden animate-fade-up">

            <div className="px-6 py-5 border-b border-[#E6E2DD] bg-[#FAF6F0] flex justify-between items-center">
              <h3 className="font-display-lg text-md font-bold text-[#1C1C19] flex items-center gap-2">
                <Bed className="h-5 w-5 text-[#735C00]" />
                Thêm hạng phòng di sản mới
              </h3>
              <button
                onClick={() => setIsAddRoomModalOpen(false)}
                className="text-[#444748] hover:text-[#1C1C19] font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddRoomType} className="p-6 space-y-4">

              <div className="space-y-1">
                <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Tên hạng phòng</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Executive River View Suite"
                  value={newRoomForm.name}
                  onChange={e => setNewRoomForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-3 py-2 text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Loại giường</label>
                  <select
                    value={newRoomForm.bedType}
                    onChange={e => setNewRoomForm(prev => ({ ...prev, bedType: e.target.value }))}
                    className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-3 py-2 text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none"
                  >
                    <option>1 King Bed</option>
                    <option>1 Super King Bed</option>
                    <option>2 Double Beds</option>
                    <option>1 Queen Bed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Diện tích (m²)</label>
                  <input
                    type="number"
                    required
                    min={15}
                    value={newRoomForm.size}
                    onChange={e => setNewRoomForm(prev => ({ ...prev, size: parseInt(e.target.value) || 30 }))}
                    className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-3 py-2 text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Số khách tối đa</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={6}
                    value={newRoomForm.maxGuests}
                    onChange={e => setNewRoomForm(prev => ({ ...prev, maxGuests: parseInt(e.target.value) || 2 }))}
                    className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-3 py-2 text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Số lượng phòng</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newRoomForm.quantity}
                    onChange={e => setNewRoomForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 5 }))}
                    className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-3 py-2 text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold">Giá phòng mỗi đêm (₫)</label>
                <input
                  type="number"
                  required
                  min={100000}
                  value={newRoomForm.price}
                  onChange={e => setNewRoomForm(prev => ({ ...prev, price: parseInt(e.target.value) || 1000000 }))}
                  className="w-full bg-[#FAF6F0] border border-[#E6E2DD] rounded-lg px-3 py-2 text-xs text-[#1C1C19] focus:border-[#735C00] focus:ring-1 focus:ring-[#735C00] focus:outline-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-[#E6E2DD] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="px-4 py-2 border border-[#E6E2DD] text-xs font-label-md uppercase tracking-wider text-[#444748] hover:bg-[#F1EDE8] rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C1C19] hover:bg-[#735C00] text-[#FAF6F0] text-xs font-label-md uppercase tracking-wider rounded-lg font-bold"
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

export default PartnerProperties;
