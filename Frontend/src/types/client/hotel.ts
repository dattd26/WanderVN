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

// Thông tin chi tiết của từng hạng phòng
export interface RoomTypeInfo {
  id: number;
  name: string;
  basePrice: number;
  capacity: number;
  availableRooms: number;
  images?: string[];
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
  userId: number;
  roomTypeId: number;
  checkInDate: string; // Định dạng yyyy-MM-dd
  checkOutDate: string; // Định dạng yyyy-MM-dd
  totalPrice?: number;
}

// Kết quả phản hồi từ API đặt phòng khách sạn
export interface HotelBookingResponse {
  bookingId: number;
  bookingCode: string;
  totalPrice: number;
  status: string;
}


