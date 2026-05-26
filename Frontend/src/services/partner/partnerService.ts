import { request } from '../shared/apiClient';
import type { PartnerHotelDto } from '../../types';
import type { HotelBooking } from '../../components/partner/tabs/BookingsTab';

export const partnerService = {
  /**
   * Lấy danh sách khách sạn của đối tác (Partner).
   * Hỗ trợ lọc theo trạng thái (status): 0 = Chờ duyệt, 1 = Đã duyệt, 2 = Bị từ chối.
   * Nếu không truyền status, Backend sẽ trả về toàn bộ khách sạn của đối tác đó.
   */
  async getMyHotels(status?: number): Promise<PartnerHotelDto[]> {
    const queryParams = new URLSearchParams();
    if (status !== undefined && status !== null) {
      queryParams.append('status', status.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/partner/hotels${queryString ? `?${queryString}` : ''}`;
    
    return request<PartnerHotelDto[]>(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Đăng ký (gửi hồ sơ) một khách sạn mới lên hệ thống ở trạng thái Chờ duyệt (Pending).
   * Dữ liệu gửi lên là cấu trúc SubmitHotelCommand khớp với C# Backend.
   */
  async submitHotel(hotelData: {
    name: string;
    address: string;
    starRating: number;
    description: string;
    cancellationPolicy: string;
    locationId: number;
    propertyTypeId: number;
    latitude?: number;
    longitude?: number;
    roomTypes?: Array<{
      name: string;
      description: string;
      capacity: number;
      pricePerNight: number;
      quantity: number;
    }>;
    amenityIds?: number[];
  }): Promise<{ hotelId: number }> {
    return request<{ hotelId: number }>('/partner/hotels', {
      method: 'POST',
      body: JSON.stringify(hotelData),
    });
  },

  /**
   * Tải ảnh khách sạn lên máy chủ lưu trữ (Cloudinary) và lưu trữ metadata vào cơ sở dữ liệu.
   * Sử dụng định dạng FormData để tải tệp tin nhị phân (File) trực tiếp.
   */
  async uploadHotelImage(
    hotelId: number,
    file: File,
    isPrimary: boolean = false
  ): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', isPrimary.toString());

    return request<{ imageUrl: string }>(`/partner/hotels/${hotelId}/images`, {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Thêm hạng phòng mới cho khách sạn của đối tác.
   * Gửi yêu cầu POST tới endpoint Backend /api/v1/partner/hotels/{hotelId}/room-types.
   */
  async addRoomType(
    hotelId: number,
    roomData: {
      name: string;
      basePrice: number;
      capacity: number;
      totalRooms: number;
      description?: string;
    }
  ): Promise<{ roomTypeId: number }> {
    return request<{ roomTypeId: number }>(`/partner/hotels/${hotelId}/room-types`, {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },

  /**
   * Xóa hạng phòng của khách sạn đối tác.
   * Gửi yêu cầu DELETE tới endpoint Backend /api/v1/partner/hotels/{hotelId}/room-types/{roomTypeId}.
   */
  async deleteRoomType(
    hotelId: number,
    roomTypeId: number
  ): Promise<void> {
    return request<void>(`/partner/hotels/${hotelId}/room-types/${roomTypeId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Cập nhật thông tin chi tiết và số lượng phòng của hạng phòng đối tác.
   * Gửi yêu cầu PUT tới endpoint Backend /api/v1/partner/hotels/{hotelId}/room-types/{roomTypeId}.
   */
  async updateRoomType(
    hotelId: number,
    roomTypeId: number,
    roomData: {
      name: string;
      basePrice: number;
      capacity: number;
      totalRooms: number;
    }
  ): Promise<void> {
    return request<void>(`/partner/hotels/${hotelId}/room-types/${roomTypeId}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  },

  /**
   * Chặn hoặc gỡ chặn phòng khả dụng theo ngày cụ thể cho hạng phòng đối tác.
   * Gửi yêu cầu POST tới endpoint Backend /api/v1/partner/hotels/${hotelId}/room-types/${roomTypeId}/toggle-block.
   */
  async toggleRoomBlock(
    hotelId: number,
    roomTypeId: number,
    blockDate: string,
    action: 'BLOCK' | 'UNBLOCK'
  ): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/partner/hotels/${hotelId}/room-types/${roomTypeId}/toggle-block`, {
      method: 'POST',
      body: JSON.stringify({ blockDate, action }),
    });
  },

  /**
   * Lấy danh sách đặt phòng của một khách sạn cụ thể dành cho Partner.
   */
  async getHotelBookings(hotelId: number): Promise<HotelBooking[]> {
    return request<HotelBooking[]>(`/partner/hotels/${hotelId}/bookings`, {
      method: 'GET',
    });
  },
};

export default partnerService;
