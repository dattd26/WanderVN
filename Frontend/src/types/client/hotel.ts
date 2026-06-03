// Định nghĩa các interface liên quan đến Khách sạn và Tìm kiếm lưu trú

export interface SearchHotelsDto {
  id: number;
  name: string;
  address: string;
  starRating: number;
  description: string;
  locationName: string;
  primaryImage: string;
  minPrice: number;
  propertyTypeName?: string;
  propertyTypeCode?: string;
  // Tọa độ địa lý — có thể null nếu khách sạn chưa được geocode
  latitude?: number | null;
  longitude?: number | null;
  amenities?: string[]; // Danh sách các tiện ích đi kèm
}

export interface SearchHotelsQuery {
  locationId?: number;
  checkInDate?: string; // ISO yyyy-MM-dd
  checkOutDate?: string; // ISO yyyy-MM-dd
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface RatePlanInfo {
  id: number;
  name: string;
  priceMultiplier: number;
  hasBreakfast: boolean;
  isRefundable: boolean;
}

// Thông tin chi tiết của từng hạng phòng
export interface RoomTypeInfo {
  id: number;
  name: string;
  basePrice: number;
  capacity: number;
  totalRooms: number;
  availableRooms: number;
  images?: string[];
  ratePlans?: RatePlanInfo[];
}

export interface HotelDetailDto {
  id: number;
  name: string;
  address: string | null;
  starRating: number | null;
  description: string | null;
  locationName: string | null;
  images: string[];
  roomTypes: RoomTypeInfo[];
}

// Yêu cầu đặt phòng khách sạn gửi lên API backend
export interface CreateHotelBookingRequest {
  userId: number | null;
  roomTypeId: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice?: number;
  email?: string;
  customerName?: string;
  customerPhone?: string;
}

// Kết quả phản hồi từ API đặt phòng khách sạn
export interface HotelBookingResponse {
  bookingId: number;
  bookingCode: string;
  totalPrice: number;
  status: string;
}
export interface BookingLookupDetailDto {
  bookingId: number;
  bookingCode: string;
  serviceType: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customerName: string;
  email: string;
  customerPhone: string;

  hotelName?: string;
  hotelAddress?: string;
  hotelImage?: string;
  roomTypeName?: string;
  checkInDate?: string;
  checkOutDate?: string;

  passengerNames?: string;
}

