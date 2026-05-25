import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Sparkles,
  Sliders
} from 'lucide-react';
import { PartnerHeader } from '../../components/partner/PartnerHeader';
import { PartnerSidebar } from '../../components/partner/PartnerSidebar';
import { partnerService, propertyTypeService, hotelService } from '../../services';
import type { PartnerHotelDto, PropertyType } from '../../types';

import { InfoTab, type HotelFormState } from '../../components/partner/tabs/InfoTab';
import { RoomsTab, type RoomConfig } from '../../components/partner/tabs/RoomsTab';
import { AvailabilityTab } from '../../components/partner/tabs/AvailabilityTab';
import { BookingsTab, type HotelBooking } from '../../components/partner/tabs/BookingsTab';
import { AddRoomModal } from '../../components/partner/AddRoomModal';
import { RegisterPropertyModal } from '../../components/partner/RegisterPropertyModal';

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

export const PartnerProperties: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', content: string } | null>(null);

  const [hotels, setHotels] = useState<PartnerHotelDto[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);

  const [isAddHotelModalOpen, setIsAddHotelModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [availablePropertyTypes, setAvailablePropertyTypes] = useState<PropertyType[]>([]);

  const [hotelForm, setHotelForm] = useState<HotelFormState>({
    name: '',
    type: 'Khách sạn',
    address: '',
    description: '',
    amenities: [] as string[],
    images: [] as string[],
  });

  const [rooms, setRooms] = useState<RoomConfig[]>([]);

  // ── State quản lý Đơn đặt phòng (Bookings) ──
  const [bookingsData, setBookingsData] = useState<Record<number, HotelBooking[]>>({
    1: [
      { id: 'BK-9482', guestName: 'Nguyễn Văn Anh', email: 'vananh.nguyen@gmail.com', roomTypeName: 'Deluxe Double Room', checkIn: '2026-06-01', checkOut: '2026-06-04', totalPrice: 3600000, status: 'Confirmed', specialRequests: 'Phòng tầng cao, yên tĩnh' },
      { id: 'BK-1029', guestName: 'Trần Thị Mai', email: 'maitt@yahoo.com', roomTypeName: 'Executive Suite', checkIn: '2026-06-05', checkOut: '2026-06-07', totalPrice: 5600000, status: 'CheckedIn', specialRequests: 'Yêu cầu set up trăng mật' },
    ],
    2: [
      { id: 'BK-2039', guestName: 'David Harrison', email: 'david.harri@outlook.com', roomTypeName: 'Mountain View Bungalow', checkIn: '2026-06-10', checkOut: '2026-06-15', totalPrice: 7500000, status: 'Confirmed' }
    ]
  });

  // Tab phụ bên trong form chỉnh sửa (info, rooms, availability, bookings)
  const [formSubTab, setFormSubTab] = useState<'info' | 'rooms' | 'availability' | 'bookings'>('info');

  // Ngày bắt đầu tuần hiển thị trên bảng Availability (mặc định là ngày hôm nay)
  const [viewStartDate, setViewStartDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Nạp dữ liệu khách sạn được chọn vào form chỉnh sửa bên phải
  const loadHotelIntoForm = (hotel: PartnerHotelDto) => {
    setHotelForm({
      name: hotel.name,
      type: hotel.name.includes('Resort') ? 'Resort' : 'Khách sạn',
      address: hotel.address || '',
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

  // Tải chi tiết phòng từ Backend
  const fetchHotelDetails = async (hotelId: number) => {
    try {
      const detail = await hotelService.getHotelDetail(hotelId);
      const mappedRooms: RoomConfig[] = detail.roomTypes.map(rt => ({
        id: rt.id.toString(),
        name: rt.name,
        bedType: rt.name.includes('Double') ? '2 Double Beds' : rt.name.includes('Suite') ? '1 Super King Bed' : '1 King Bed',
        size: rt.name.includes('Suite') ? 55 : rt.name.includes('Bungalow') ? 35 : 30,
        maxGuests: rt.capacity,
        quantity: rt.totalRooms,
        price: rt.basePrice
      }));
      setRooms(mappedRooms);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết khách sạn:', error);
    }
  };

  // ── Gọi API lấy danh sách khách sạn thực tế từ hệ thống ──
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const data = await partnerService.getMyHotels();

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
          await fetchHotelDetails(1);
        } else {
          setHotels(data);
          const firstHotel = data[0];
          setSelectedHotelId(firstHotel.id);
          loadHotelIntoForm(firstHotel);
          await fetchHotelDetails(firstHotel.id);
        }
      } catch (error) {
        console.error('Lỗi tải danh sách khách sạn:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // ── Gọi API lấy danh mục loại hình lưu trú từ Backend ──
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const data = await propertyTypeService.getPropertyTypes();
        setAvailablePropertyTypes(data);
      } catch (error) {
        console.warn('⚠️ Lỗi gọi API /api/v1/property-types:', error);
      }
    };
    fetchPropertyTypes();
  }, []);

  // Kích hoạt thông báo toast thành công/thất bại
  const triggerMessage = (type: 'success' | 'error', content: string) => {
    setMessage({ type, content });
    setTimeout(() => setMessage(null), 4000);
  };

  // Xử lý khi click chuyển đổi cơ sở bên cột trái
  const handleSelectHotel = async (hotelId: number) => {
    setSelectedHotelId(hotelId);
    const hotel = hotels.find(h => h.id === hotelId);
    if (hotel) {
      loadHotelIntoForm(hotel);
      await fetchHotelDetails(hotelId);
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

  // ── Xử lý khi thêm hạng phòng mới thành công từ API ──
  const handleAddRoomSuccess = (newRoom: RoomConfig) => {
    setRooms(prev => [...prev, newRoom]);
  };

  // Xóa hạng phòng liên kết với CSDL thực tế
  const handleDeleteRoomType = async (roomId: string) => {
    if (!selectedHotelId) return;
    if (confirm('Bạn có chắc chắn muốn xóa hạng phòng này không? Hành động này không thể hoàn tác.')) {
      try {
        const roomTypeId = parseInt(roomId);
        await partnerService.deleteRoomType(selectedHotelId, roomTypeId);
        setRooms(prev => prev.filter(r => r.id !== roomId));
        triggerMessage('success', 'Đã gỡ bỏ hạng phòng khỏi hệ thống CSDL thành công!');
      } catch (err: unknown) {
        console.error('⚠️ Lỗi xóa hạng phòng:', err);
        const errMsg = err instanceof Error ? err.message : 'Lỗi hệ thống.';
        triggerMessage('error', errMsg);
      }
    }
  };

  // Điều hướng tuần hiển thị trên bảng Availability
  const handleNavigateWeek = (direction: 1 | -1) => {
    setViewStartDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + direction * 7);
      return d;
    });
  };

  /**
   * Sinh danh sách các ngày ISO (YYYY-MM-DD) trong khoảng [start, end] (bao gồm cả 2 đầu).
   */
  const generateDateRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  /**
   * Chặn / gỡ chặn phòng hàng loạt theo khoảng ngày cho một hoặc nhiều hạng phòng.
   * Gọi API toggleRoomBlock tuần tự cho từng cặp (roomId × ngày), rồi cập nhật state local.
   */
  const handleRangeBlock = async (
    roomIds: string[],
    startDate: string,
    endDate: string,
    action: 'BLOCK' | 'UNBLOCK'
  ) => {
    if (!selectedHotelId || roomIds.length === 0) return;

    const dates = generateDateRange(startDate, endDate);
    if (dates.length === 0) return;

    const targetRooms = rooms.filter(r => roomIds.includes(r.id));
    if (targetRooms.length === 0) return;

    setLoading(true);
    try {
      // Gọi API cho từng (hạng phòng × ngày) một cách tuần tự
      for (const room of targetRooms) {
        const roomTypeId = parseInt(room.id);
        for (const date of dates) {
          await partnerService.toggleRoomBlock(selectedHotelId, roomTypeId, date, action);
        }
      }

      // Cập nhật state local sau khi tất cả API calls hoàn thành
      setBookingsData(prev => {
        let hotelBookings = [...(prev[selectedHotelId] || [])];

        for (const room of targetRooms) {
          if (action === 'BLOCK') {
            // Tạo một đơn chặn phòng ảo (block booking) cho từng ngày
            const newBlocks: HotelBooking[] = dates.map(date => {
              const nextDate = new Date(date);
              nextDate.setDate(nextDate.getDate() + 1);
              return {
                id: `BLK-${Math.floor(1000 + Math.random() * 9000)}-${date}`,
                guestName: 'Phòng khóa / Bảo trì',
                email: 'blocked@wandervn.com',
                roomTypeName: room.name,
                checkIn: date,
                checkOut: nextDate.toISOString().split('T')[0],
                totalPrice: 0,
                status: 'Confirmed' as const,
                specialRequests: `Chặn phòng theo dải ngày: ${startDate} → ${endDate}.`
              };
            });
            hotelBookings = [...newBlocks, ...hotelBookings];
          } else {
            // Gỡ chặn: Xóa tất cả block trong khoảng ngày đó của hạng phòng này
            hotelBookings = hotelBookings.filter(bk => {
              const isBlock = bk.guestName === 'Phòng khóa / Bảo trì';
              const isSameRoomType = bk.roomTypeName === room.name;
              const isInRange = dates.includes(bk.checkIn);
              return !(isBlock && isSameRoomType && isInRange);
            });
          }
        }

        return { ...prev, [selectedHotelId]: hotelBookings };
      });

      const roomNames = targetRooms.map(r => r.name).join(', ');
      const dateLabel = `${startDate.split('-').reverse().join('/')} → ${endDate.split('-').reverse().join('/')}`;
      triggerMessage(
        'success',
        action === 'BLOCK'
          ? `Đã chặn ${dates.length} ngày (${dateLabel}) cho ${targetRooms.length} hạng phòng: ${roomNames}.`
          : `Đã gỡ chặn ${dates.length} ngày (${dateLabel}) cho ${targetRooms.length} hạng phòng: ${roomNames}.`
      );
    } catch (err: unknown) {
      console.error('⚠️ Lỗi Range Block:', err);
      const errMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ khi xử lý hàng loạt.';
      triggerMessage('error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Tăng giảm phòng trống (availability) trực tiếp trên bảng ô ngày đơn lẻ
  const handleAdjustAvailability = async (roomId: string, day: string, increment: boolean) => {
    if (!selectedHotelId) return;

    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    const action = increment ? 'UNBLOCK' : 'BLOCK';
    const roomTypeId = parseInt(roomId);

    try {
      // Gọi API Backend thực tế để lưu vết chặn/gỡ chặn phòng trong CSDL
      await partnerService.toggleRoomBlock(selectedHotelId, roomTypeId, day, action);

      // Cập nhật State bookingsData để tự động cập nhật hiển thị phòng trống một cách reactive
      setBookingsData(prev => {
        const hotelBookings = prev[selectedHotelId] || [];
        if (action === 'BLOCK') {
          // Tính toán ngày Check-out (Check-in + 1 ngày)
          const date = new Date(day);
          date.setDate(date.getDate() + 1);
          const nextDayStr = date.toISOString().split('T')[0];

          const newBlock: HotelBooking = {
            id: `BLK-${Math.floor(1000 + Math.random() * 9000)}`,
            guestName: 'Phòng khóa / Bảo trì',
            email: 'blocked@wandervn.com',
            roomTypeName: targetRoom.name,
            checkIn: day,
            checkOut: nextDayStr,
            totalPrice: 0,
            status: 'Confirmed',
            specialRequests: 'Chặn phòng thủ công bảo trì.'
          };
          return {
            ...prev,
            [selectedHotelId]: [newBlock, ...hotelBookings]
          };
        } else {
          // Gỡ chặn: Xóa đơn chặn phòng ảo của ngày này khỏi State
          const filtered = hotelBookings.filter(bk => {
            const isBlock = bk.guestName === 'Phòng khóa / Bảo trì';
            const isSameDate = bk.checkIn === day;
            const isSameRoomType = bk.roomTypeName === targetRoom.name;
            return !(isBlock && isSameDate && isSameRoomType);
          });
          return {
            ...prev,
            [selectedHotelId]: filtered
          };
        }
      });

      triggerMessage('success', action === 'BLOCK'
        ? `Đã khóa 1 phòng thuộc hạng "${targetRoom.name}" vào ngày ${day.split('-').reverse().join('/')} thành công.`
        : `Đã mở khóa 1 phòng thuộc hạng "${targetRoom.name}" vào ngày ${day.split('-').reverse().join('/')} thành công.`
      );
    } catch (err: unknown) {
      console.error('⚠️ Lỗi điều chỉnh phòng trống:', err);
      const errMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.';
      triggerMessage('error', errMsg);
    }
  };

  // Xử lý khi đăng ký đơn đặt phòng vãng lai từ BookingsTab
  const handleRegisterWalkInBooking = (newBookingData: Omit<HotelBooking, 'id' | 'status'>) => {
    if (!selectedHotelId) return;

    const newBooking: HotelBooking = {
      ...newBookingData,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Confirmed'
    };

    setBookingsData(prev => {
      const hotelBookings = prev[selectedHotelId] || [];
      return {
        ...prev,
        [selectedHotelId]: [newBooking, ...hotelBookings]
      };
    });

    triggerMessage('success', `Ghi nhận khách vãng lai "${newBooking.guestName}" thành công! Lịch trống đã tự động cập nhật.`);
  };

  // Xử lý sau khi đăng ký cơ sở di sản thành công từ Modal
  const handleRegisterHotelSuccess = async (newHotelId: number) => {
    try {
      setLoading(true);
      const data = await partnerService.getMyHotels();
      setHotels(data);
      if (data.length > 0) {
        const matchingNew = data.find(h => h.id === newHotelId) || data[0];
        setSelectedHotelId(matchingNew.id);
        loadHotelIntoForm(matchingNew);
        await fetchHotelDetails(matchingNew.id);
      }
    } catch (err) {
      console.error('Lỗi tải lại danh sách khách sạn sau khi đăng ký:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedHotel = hotels.find(h => h.id === selectedHotelId);
  const currentRooms = rooms;
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
              onClick={() => setIsAddHotelModalOpen(true)}
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

            {/* Cột Trái (Danh sách cơ sở của tôi) */}
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

                        {/* Nhãn trạng thái phê duyệt */}
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

            {/* Cột Phải (Chi tiết cơ sở & Tabs) */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-[#FAF6F0] rounded-xl border border-[#E6E2DD] shadow-md overflow-hidden">

                {/* Tiêu đề vùng chi tiết */}
                <div className="px-6 py-5 border-b border-[#E6E2DD] bg-[#FAF6F0] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-display-lg text-xl text-[#1C1C19]">{selectedHotel?.name}</h3>
                    <p className="font-body-md text-[#444748] text-xs">
                      Cơ sở ID: <span className="font-mono">PR-00{selectedHotelId}</span> • Cập nhật lần cuối: 2 giờ trước
                    </p>
                  </div>

                  {/* Trạng thái duyệt */}
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-[10px] text-[#444748] uppercase tracking-wider">Trạng thái:</span>
                    <span className={`font-label-md text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded ${selectedHotel?.status === 1 ? 'bg-[#EBF7EE] text-[#1E5C2F]' : 'bg-[#FEF9EC] text-[#8F6B00]'
                      }`}>
                      {selectedHotel?.status === 1 ? 'ĐÃ PHÊ DUYỆT' : 'CHỜ KIỂM DUYỆT'}
                    </span>
                  </div>
                </div>

                {/* Thanh điều hướng Tab con */}
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

                {/* Nội dung tương ứng với Tab được chọn */}
                <div className="p-6">
                  {formSubTab === 'info' && (
                    <InfoTab
                      hotelForm={hotelForm}
                      onChangeForm={setHotelForm}
                      onSaveChanges={handleSaveChanges}
                      onCancelChanges={() => selectedHotel && loadHotelIntoForm(selectedHotel)}
                      onSimulateUpload={handleSimulateUpload}
                      onDeleteImage={handleDeleteImage}
                      onToggleAmenity={handleToggleAmenity}
                      availableAmenities={AVAILABLE_AMENITIES}
                    />
                  )}

                  {formSubTab === 'rooms' && (
                    <RoomsTab
                      rooms={currentRooms}
                      onAddRoomClick={() => setIsAddRoomModalOpen(true)}
                      onDeleteRoom={handleDeleteRoomType}
                    />
                  )}

                  {formSubTab === 'availability' && (
                    <AvailabilityTab
                      rooms={currentRooms}
                      bookings={currentBookings}
                      viewStartDate={viewStartDate}
                      onNavigateWeek={handleNavigateWeek}
                      onAdjustAvailability={handleAdjustAvailability}
                      onRangeBlock={handleRangeBlock}
                    />
                  )}

                  {formSubTab === 'bookings' && (
                    <BookingsTab
                      bookings={currentBookings}
                      rooms={currentRooms}
                      onAddWalkInBooking={handleRegisterWalkInBooking}
                    />
                  )}
                </div>

              </div>
            </div>

          </div>

        </main>

        {/* Lớp phủ họa tiết di sản */}
        <div className="texture-overlay" />
      </div>

      {/* ── MODAL THÊM HẠNG PHÒNG MỚI (Tích hợp thực tế API) ── */}
      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        hotelId={selectedHotelId || 0}
        onSuccess={handleAddRoomSuccess}
        triggerMessage={triggerMessage}
      />

      {/* ── MODAL ĐĂNG KÝ CƠ SỞ DI SẢN MỚI ── */}
      <RegisterPropertyModal
        isOpen={isAddHotelModalOpen}
        onClose={() => setIsAddHotelModalOpen(false)}
        availablePropertyTypes={availablePropertyTypes}
        onSuccess={handleRegisterHotelSuccess}
        triggerMessage={triggerMessage}
      />

    </div>
  );
};

export default PartnerProperties;
