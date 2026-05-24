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

// Chi tiết khách sạn bao gồm danh sách hạng phòng
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

