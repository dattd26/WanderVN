import { request } from '../shared/apiClient';
import type { PartnerHotelDto } from '../../types';

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
    roomTypes: Array<{
      name: string;
      description: string;
      capacity: number;
      pricePerNight: number;
      quantity: number;
    }>;
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
};

export default partnerService;
