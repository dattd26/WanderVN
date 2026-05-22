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
