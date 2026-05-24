// Dịch vụ API xử lý các nghiệp vụ liên quan đến Khách sạn chi tiết
import { request } from '../shared/apiClient';
import type { HotelDetailDto } from '../../types';

export const hotelService = {
  /**
   * Lấy chi tiết thông tin khách sạn và danh sách các hạng phòng có sẵn theo ID
   */
  async getHotelDetail(id: number | string): Promise<HotelDetailDto> {
    return request<HotelDetailDto>(`/hotels/${id}`);
  }
};
